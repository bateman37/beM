// Ejecutor de lotes SIM persistentes (§8.2): iniciar, detener al terminar los encuentros en curso, continuar, recuperar tras un reinicio, reintentar fallidos y abrir el análisis de un resultado conservado.
// Identidades: caso lógico global y estable · variante y semilla (congeladas) · intento técnico distinto para cada reintento · UN único resultado aceptado por caso para las consecuencias del mundo.
// Un intento fallido no tiene marcador definitivo ni cuenta como derrota. Sin snapshot compatible de un intento interrumpido, el reintento empieza DESDE EL INICIO con la misma entrada y semilla (no se promete
// continuación a mitad de partido). Los lotes SIM nunca se dirigen a `executeEssential` del detallado: este ejecutor usa el modelo SIM.
import { SimPool } from '../sim/pool.js';
import { runCase } from '../sim/cases.js';
import { contextToJSON } from '../sim/context.js';
import { buildBatch } from './schedule.js';
import { SimBatchStore, SIM_JOB_SCHEMA } from './store.js';

export const MAX_ATTEMPTS = 3;
// Pliega el índice (fuente de verdad) en el estado de cada caso.
export function foldIndex(records) {
  const cases = new Map(); const get = (id) => { let c = cases.get(id); if (!c) { c = { attempts: new Map(), accepted: null, duplicates: 0 }; cases.set(id, c); } return c; };
  for (const r of records) {
    if (!r.case) continue; const c = get(r.case);
    if (r.t === 'start') c.attempts.set(r.attempt, { status: 'started', rec: r });
    else if (r.t === 'done') { const valid = r.status === 'finished' && r.valid === true; c.attempts.set(r.attempt, { status: valid ? 'done' : 'invalid', rec: r }); if (valid) { if (!c.accepted) c.accepted = r; else c.duplicates += 1; } }
    else if (r.t === 'failed') c.attempts.set(r.attempt, { status: 'failed', rec: r });
    else if (r.t === 'interrupted') c.attempts.set(r.attempt, { status: 'interrupted', rec: r });
    else if (r.t === 'duplicate') c.duplicates += 1;
  }
  return cases;
}
export class SimBatchRunner {
  constructor({ ctx, teamMap, root, workers = 4, chunk = 2, inline = false, retention = 'reference' } = {}) { this.ctx = ctx; this.teamMap = teamMap; this.store = new SimBatchStore(root); this.workers = workers; this.chunk = chunk; this.inline = inline; this.retention = retention; this.stopping = false; this.pool = null; }
  // Prepara el lote: congela agenda, semillas y perfil en el almacén. Devuelve su identificador estable.
  create(spec, { label = null } = {}) {
    const b = buildBatch(spec); if (this.store.exists(b.id)) return b.id;
    this.store.writeFrozen(b.id, [['entradas/agenda.json', { id: b.id, spec, cases: b.cases }], ['entradas/perfil.json', { simProfile: this.ctx.sp.id, simProfileFingerprint: this.ctx.sp.fingerprint, tablesFingerprint: this.ctx.T.fingerprint, detailedProfile: this.ctx.sp.detailedProfileId }]]);
    this.store.writeJob(b.id, { schema: SIM_JOB_SCHEMA, id: b.id, label, kind: spec.kind, total: b.cases.length, retention: this.retention, maxAttempts: MAX_ATTEMPTS });
    return b.id;
  }
  agenda(id) { return this.store.readJson(id, 'entradas/agenda.json'); }
  state(id) { return foldIndex(this.store.readIndex(id)); }
  // Estado resumido (desde el índice, no desde la memoria del proceso).
  status(id) {
    const ag = this.agenda(id); const st = this.state(id); const out = { id, total: ag.cases.length, accepted: 0, running: 0, failed: 0, invalid: 0, interrupted: 0, pending: 0, duplicates: 0, inconsistent: 0 };
    for (const c of ag.cases) { const s = st.get(c.id); if (!s) { out.pending++; continue; } out.duplicates += s.duplicates; if (s.accepted) { out.accepted++; continue; } const last = [...s.attempts.entries()].sort((a, b) => a[0] - b[0]).pop()?.[1]; if (!last) out.pending++; else if (last.status === 'started') out.running++; else if (last.status === 'failed') out.failed++; else if (last.status === 'invalid') out.invalid++; else if (last.status === 'interrupted') out.interrupted++; }
    out.complete = out.accepted === out.total; return out;
  }
  // Recuperación tras un reinicio: los intentos iniciados sin confirmación pasan a «interrumpidos» (se conserva el anterior); un «terminado» cuyo archivo falta o no coincide se marca inconsistente.
  recover(id) {
    const st = this.state(id); let interrupted = 0; let inconsistent = 0;
    for (const [caseId, c] of st) for (const [attempt, a] of c.attempts) {
      if (a.status === 'started') { this.store.appendIndex(id, { t: 'interrupted', case: caseId, attempt, why: 'proceso interrumpido antes de confirmar' }); this.store.quarantine(id, caseId, attempt); interrupted++; }
      else if (a.status === 'done' || a.status === 'invalid') { const r = this.store.readResult(id, a.rec); if (!r || !r.ok) { this.store.appendIndex(id, { t: 'interrupted', case: caseId, attempt, why: r ? 'el archivo no coincide con su suma' : 'falta el archivo del resultado' }); inconsistent++; } }
    }
    return { id, interrupted, inconsistent, status: this.status(id) };
  }
  // Casos pendientes de ejecutar: sin resultado aceptado y con intentos disponibles.
  _todo(id, { retryFailed = true } = {}) {
    const ag = this.agenda(id); const st = this.state(id); const todo = [];
    for (const c of ag.cases) { const s = st.get(c.id); if (s?.accepted) continue; const attempts = s ? Math.max(0, ...s.attempts.keys()) : 0; if (attempts >= MAX_ATTEMPTS) continue; const last = s ? [...s.attempts.entries()].sort((a, b) => a[0] - b[0]).pop()?.[1] : null; if (last && !retryFailed && ['failed', 'invalid', 'interrupted'].includes(last.status)) continue; if (last?.status === 'started') continue; todo.push({ ...c, attempt: attempts + 1 }); }
    return todo;
  }
  stop() { this.stopping = true; }
  // Ejecuta los casos pendientes (continuar = volver a llamar). `limit`: máximo de casos que despachar en esta llamada. Detener termina los encuentros en curso y no despacha más.
  async run(id, { limit = Infinity, retryFailed = true } = {}) {
    this.stopping = false; const todo = this._todo(id, { retryFailed }).slice(0, limit); const job = this.store.readJob(id); const keep = job.retention ?? this.retention; let done = 0;
    const commit = (c, r) => {
      if (r.status === 'failed') { this.store.fail(id, c.id, c.attempt, r.error); return; }
      const valid = r.valid === true; const rec = this.store.commit(id, { caseId: c.id, attempt: c.attempt, status: r.status, valid, score: r.score, ess: r.ess, analysis: keep === 'analysis' ? r.ana : null, extra: { seed: c.seed, variant: c.variant ?? null, fp: r.fp, inputFp: r.inputFp } }); void rec; done++;
    };
    const prepared = todo.map((c) => ({ ...c, essential: true, analysis: keep === 'analysis' }));
    const start = (c) => this.store.start(id, c.id, c.attempt, { seed: c.seed, variant: c.variant ?? null }); // el inicio se anota justo antes de despachar el caso
    if (this.inline) { for (const c of prepared) { if (this.stopping) break; start(c); const r = runCase(this.ctx, this.teamMap, c); commit(c, r); } }
    else {
      if (!this.pool) { this.pool = new SimPool({ workers: this.workers }); await this.pool.start(contextToJSON(this.ctx), this.ctx.sp.fingerprint, this.teamMap, []); }
      await this.pool.runStream(prepared, { chunk: this.chunk, shouldStop: () => this.stopping, onStart: (batch) => batch.forEach(start), onChunk: async (batch, results) => { batch.forEach((c, i) => commit(c, results[i])); } });
    }
    return { dispatched: todo.length, done, status: this.status(id) };
  }
  async close() { if (this.pool) { await this.pool.close(); this.pool = null; } }
  // Abre el resultado aceptado de un caso desde el índice durable (verifica su suma). Con retención «analysis» devuelve también el resultado de análisis; con «reference», solo el esencial.
  open(id, caseId) {
    const c = this.state(id).get(caseId); if (!c?.accepted) return { ok: false, reason: 'el caso no tiene resultado aceptado (un intento fallido no tiene marcador)' };
    const r = this.store.readResult(id, c.accepted); if (!r?.ok) return { ok: false, reason: 'el archivo del resultado no coincide con su confirmación' };
    return { ok: true, caseId, attempt: c.accepted.attempt, essential: r.value.essential, analysis: r.value.analysis ?? null, retention: r.value.analysis ? 'analysis' : 'reference' };
  }
}
