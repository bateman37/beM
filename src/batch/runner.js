// Controlador de lotes (MOTOR-12 §6–§7). Agenda partidos COMPLETOS y llama al motor existente: ejecución serial (un partido cada vez), con una cesión de ejecución entre encuentros para atender
// progreso y «detener al terminar el actual». Escribe progresivamente (el contexto en memoria es de un partido), confirma cada encuentro (directorio renombrado + línea de índice con fsync) y
// recupera tras un reinicio sin duplicar confirmados. Ningún partido espera tiempo de animación ni se precalcula un marcador.
import { renameSync, existsSync } from 'node:fs';
import { JobStore } from './jobstore.js';
import { freezeBatch, versionsOf } from './freeze.js';
import { deriveState, countersOf, matchRows } from './state.js';
import { prepareBatch } from './schedule.js';
import { fpOf } from './hashing.js';

const COMPAT_KEYS = ['engine', 'instrumentation', 'records', 'lot', 'package_schema', 'trajectory', 'analysis', 'acta_policy', 'seed_derivation'];

export class BatchController {
  constructor({ store = new JobStore(), executor, now = Date.now, onUpdate = () => {} } = {}) { this.store = store; this.executor = executor; this.now = now; this.onUpdate = onUpdate; this.active = new Map(); }

  // ---------------------------------------------------------------- creación
  create(specIn, profile, { players = null, label = null, revisionOf = null } = {}) {
    const prep = prepareBatch(specIn, profile, { players });
    if (!prep.ok) return { ok: false, problems: prep.problems, warnings: prep.warnings, counts: prep.counts ?? null };
    // Una definición idéntica con el mismo estado de entradas es una NUEVA revisión/ejecución del lote, nunca una modificación silenciosa de uno congelado.
    const base = `LOT-${prep.agendaFp.slice(0, 8)}`; let revision = 1; let id = base;
    while (this.store.exists(id)) { revision += 1; id = `${base}-R${revision}`; }
    const frozen = freezeBatch(prep, profile, { batchId: id, now: this.now, label, revisionOf, revision });
    this.store.writeFrozen(id, frozen.files); this.store.writeJob(id, frozen.job);
    return { ok: true, batchId: id, job: frozen.job, counts: prep.counts, warnings: prep.warnings, agendaFp: prep.agendaFp };
  }

  // ---------------------------------------------------------------- estado
  // `entradas/lote.json` es inmutable una vez congelado: se lee una sola vez por lote (el progreso se consulta cada 500 ms).
  loteOf(id) { this.loteCache ??= new Map(); if (!this.loteCache.has(id)) this.loteCache.set(id, this.store.readJson(id, 'entradas/lote.json')); return this.loteCache.get(id); }
  snapshot(id) {
    const job = this.store.readJob(id); const lote = this.loteOf(id); const records = this.store.readIndex(id); const info = deriveState(lote, records);
    return { job, lote, records, info };
  }
  status(id, { rows = false } = {}) {
    const { job, lote, info } = this.snapshot(id); const counters = countersOf(lote, info); const live = this.active.get(id);
    const done = [...info.values()].flatMap((m) => m.attempts).filter((a) => a.exec_ms != null); const avg = done.length ? done.reduce((s, a) => s + a.exec_ms, 0) / done.length : null;
    const remaining = counters.pendientes + counters.interrumpidos + counters.en_curso;
    const elapsed = job.timing.started_at ? (['ejecutandose', 'detencion_solicitada'].includes(job.state) ? this.now() - job.timing.started_at + (job.timing.elapsed_ms ?? 0) : job.timing.elapsed_ms ?? 0) : 0;
    return { batch_id: id, state: job.state, state_reason: job.state_reason, stop_requested: !!job.stop_requested, running: !!live, current: job.current, counters, elapsed_ms: elapsed, avg_exec_ms: avg, eta_ms: avg != null && remaining ? Math.round(avg * remaining) : null,
      eta_note: 'ETA aproximada: ritmo medio medido de los intentos ya ejecutados × encuentros restantes; no es una promesa.', config: job.config, versions: job.versions, created_at: job.created_at, label: job.label, objective: lote.objective, history: job.history, ...(rows ? { matches: matchRows(lote, info) } : {}) };
  }
  list() { return this.store.ids().map((id) => { try { const s = this.status(id); return { batch_id: id, state: s.state, counters: s.counters, label: s.label, created_at: s.created_at, objective: s.objective, config: s.config }; } catch { return { batch_id: id, state: 'ilegible' }; } }); }

  setState(id, to, reason = null, extra = {}) {
    const job = this.store.readJob(id); if (job.state !== to) job.history.push({ at: this.now(), from: job.state, to, reason }); job.state = to; job.state_reason = reason; job.updated_at = this.now(); Object.assign(job, extra); this.store.writeJob(id, job); this.onUpdate(id); return job;
  }
  requestStop(id) {
    const job = this.store.readJob(id);
    if (!['ejecutandose'].includes(job.state)) return { ok: false, reason: `el lote está «${job.state}»: no hay ejecución que detener` };
    job.stop_requested = true; job.history.push({ at: this.now(), from: job.state, to: 'detencion_solicitada', reason: 'detener al terminar el partido en curso' }); job.state = 'detencion_solicitada'; job.updated_at = this.now(); this.store.writeJob(id, job); this.onUpdate(id);
    return { ok: true };
  }

  // Un lote detenido NO mezcla versiones: si el motor o el contrato cambiaron, se bloquea la continuación (el lote queda como está y se prepara una nueva revisión).
  compatibility(job, currentProfile = null) {
    const now = versionsOf(currentProfile ?? { rng: { algorithm: job.versions.rng }, rules: { profile: job.versions.rules_profile }, id: job.versions.content_profile, extensions: [] });
    const diffs = COMPAT_KEYS.filter((k) => job.versions[k] !== now[k]).map((k) => `${k}: congelado ${job.versions[k]} ≠ actual ${now[k]}`);
    return { ok: diffs.length === 0, diffs };
  }

  // ---------------------------------------------------------------- recuperación tras reinicio del proceso (§7.2)
  recover() {
    const out = [];
    for (const id of this.store.ids()) {
      let job; try { job = this.store.readJob(id); } catch { continue; }
      if (!['ejecutandose', 'detencion_solicitada'].includes(job.state) || this.active.has(id)) continue;
      const { info } = this.snapshot(id); let marked = 0;
      for (const m of info.values()) for (const a of m.attempts) if (a.state === 'en_curso') {
        this.store.appendIndex(id, { type: 'attempt_interrupted', match_id: m.ex.match_id, attempt_id: a.attempt_id, at: this.now(), reason: 'el proceso se reinició con el intento en curso: no hay snapshot deportivo de continuación; se ofrece repetir el caso desde su inicio congelado (misma semilla, nuevo intento)' });
        const tmp = this.store.attemptDir(id, m.ex.match_id, a.attempt_id, '.tmp'); if (existsSync(tmp)) renameSync(tmp, this.store.attemptDir(id, m.ex.match_id, a.attempt_id, '.parcial')); marked += 1;
      }
      job.current = null; job.stop_requested = false; job.timing.elapsed_ms = (job.timing.elapsed_ms ?? 0) + (job.timing.started_at ? Math.max(0, job.updated_at - job.timing.started_at) : 0); job.timing.started_at = null;
      this.store.writeJob(id, job); this.setState(id, 'interrumpido', `el proceso del servidor se reinició con el lote en marcha${marked ? ` (${marked} intento(s) en curso conservados como parciales)` : ''}`); out.push({ id, marked });
    }
    return out;
  }

  // ---------------------------------------------------------------- reintento explícito
  retry(id, matchIds) {
    const { info } = this.snapshot(id); const job = this.store.readJob(id); const bad = [];
    for (const mid of matchIds) { const m = info.get(mid); if (!m) bad.push(`${mid}: no existe`); else if (!['fallida', 'interrumpida'].includes(m.exec_state)) bad.push(`${mid}: está ${m.exec_state}, solo se reintentan fallidas o interrumpidas`); }
    if (bad.length) return { ok: false, problems: bad };
    job.retry_queue = [...new Set([...(job.retry_queue ?? []), ...matchIds])]; this.store.writeJob(id, job); return { ok: true, queued: job.retry_queue };
  }

  // ---------------------------------------------------------------- bucle principal
  async run(id, { profileForCompat = null } = {}) {
    if (this.active.has(id)) return { ok: false, reason: 'el lote ya está en ejecución' };
    let job = this.store.readJob(id);
    if (job.state === 'completado' && !(job.retry_queue?.length)) return { ok: false, reason: 'el lote ya está completado' };
    const compat = this.compatibility(job, profileForCompat); if (!compat.ok) return { ok: false, reason: 'versiones incompatibles con el lote congelado: no se mezclan versiones en un mismo experimento; prepara una nueva revisión', diffs: compat.diffs };
    this.active.set(id, null);
    const done = (async () => {
      await Promise.resolve();
      job = this.store.readJob(id); job.stop_requested = false; job.timing.started_at = this.now(); this.store.writeJob(id, job);
      this.setState(id, 'ejecutandose', job.timing.elapsed_ms ? 'continuación' : 'inicio');
      let prepFails = 0; let ended = null;
      try {
        for (;;) {
          const snap = this.snapshot(id); const j = snap.job;
          if (j.stop_requested) { ended = ['detenido', 'detención solicitada: terminó el partido en curso']; break; }
          const retry = new Set(j.retry_queue ?? []);
          const next = snap.lote.agenda.find((x) => { const m = snap.info.get(x.match_id); return m.exec_state === 'pendiente' || m.exec_state === 'interrumpida' || (retry.has(x.match_id) && ['fallida', 'interrumpida'].includes(m.exec_state)); });
          if (!next) { const c = countersOf(snap.lote, snap.info); ended = ['completado', c.fallidos ? `${c.fallidos} ejecución(es) fallida(s) conservada(s); reintento explícito disponible` : null]; break; }
          const m = snap.info.get(next.match_id); const attemptNo = m.attempts.length + 1; const attemptId = `${next.match_id}-A${attemptNo}`;
          this.store.appendIndex(id, { type: 'attempt_started', match_id: next.match_id, attempt_id: attemptId, attempt_no: attemptNo, started_at: this.now() });
          const cur = this.store.readJob(id); cur.current = { match_id: next.match_id, attempt_id: attemptId, started_at: this.now(), case_id: next.case_id, variant_id: next.variant_id, pair_id: next.pair_id }; cur.retry_queue = (cur.retry_queue ?? []).filter((x) => x !== next.match_id); this.store.writeJob(id, cur); this.onUpdate(id);
          const outDir = this.store.attemptDir(id, next.match_id, attemptId, '.tmp'); let outcome;
          try { outcome = await this.executor.run({ batchId: id, ex: next, attemptNo, attemptId, outDir, level: snap.lote.record_level, prose: snap.lote.prose }); }
          catch (e) {
            outcome = { attempt_id: attemptId, match_id: next.match_id, attempt_no: attemptNo, exec_state: 'fallida', sporting_status: null, valid: false, exclusion_reason: `${e.phase ?? 'proceso'}: ${e.message}`, started_at: cur.current.started_at, finished_at: this.now(), exec_ms: this.now() - cur.current.started_at, record_level: snap.lote.record_level, error: { phase: e.phase ?? 'proceso', message: e.message }, files: [], facts: {}, counts: {} };
            if ((e.phase ?? 'proceso') !== 'preparacion') { ended = ['interrumpido', `no se pudieron conservar los registros: ${e.message}`]; }
          }
          // confirmación: el directorio completo se publica y SOLO después se anota en el índice
          const finalDir = this.store.attemptDir(id, next.match_id, attemptId);
          if (existsSync(outDir)) renameSync(outDir, finalDir);
          const { files, dir_files: _d, ...slim } = outcome; void _d;
          this.store.appendIndex(id, { type: 'attempt', ...slim, files: (files ?? []).map(({ path, bytes, sha256, records, kind, table, stream, audience }) => ({ path, bytes, sha256, records, kind, table, stream, audience })) });
          prepFails = outcome.error?.phase === 'preparacion' ? prepFails + 1 : 0;
          const after = this.store.readJob(id); after.current = null; this.store.writeJob(id, after); this.onUpdate(id);
          if (ended) break;
          if (prepFails >= 3) { ended = ['interrumpido', 'tres fallos de preparación seguidos: posible configuración compartida no válida; revisa la entrada antes de continuar']; break; }
        }
      } catch (e) { ended = ['interrumpido', `error del controlador: ${e.message}`]; }
      const j2 = this.store.readJob(id); j2.timing.elapsed_ms = (j2.timing.elapsed_ms ?? 0) + (this.now() - (j2.timing.started_at ?? this.now())); j2.timing.started_at = null; j2.stop_requested = false; j2.current = null; this.store.writeJob(id, j2);
      this.setState(id, ended[0], ended[1]); this.active.delete(id); return { ok: true, state: ended[0], reason: ended[1] };
    })();
    this.active.set(id, done);
    return { ok: true, started: true, done };
  }
}
export { fpOf };
