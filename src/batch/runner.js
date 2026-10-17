// Controlador de lotes (MOTOR-12 §6–§7). Agenda partidos COMPLETOS y llama al motor existente: ejecución serial (un partido cada vez), con una cesión de ejecución entre encuentros para atender
// progreso y «detener al terminar el actual». Escribe progresivamente (el contexto en memoria es de un partido), confirma cada encuentro (directorio renombrado + línea de índice con fsync) y
// recupera tras un reinicio sin duplicar confirmados. Ningún partido espera tiempo de animación ni se precalcula un marcador.
import { renameSync, existsSync } from 'node:fs';
import { JobStore } from './jobstore.js';
import { freezeBatch, versionsOf } from './freeze.js';
import { deriveState, countersOf, matchRows } from './state.js';
import { prepareBatch } from './schedule.js';
import { fpOf } from './hashing.js';
import { detectCores, autoConcurrency } from './executors.js';

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
    return { batch_id: id, state: job.state, state_reason: job.state_reason, stop_requested: !!job.stop_requested, running: !!live, current: job.current, active: job.active ?? [], active_count: (job.active ?? []).length, concurrency: job.concurrency_used ?? null, counters, elapsed_ms: elapsed, avg_exec_ms: avg, eta_ms: avg != null && remaining ? Math.round(avg * remaining) : null,
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
      job.current = null; job.active = []; job.stop_requested = false; job.timing.elapsed_ms = (job.timing.elapsed_ms ?? 0) + (job.timing.started_at ? Math.max(0, job.updated_at - job.timing.started_at) : 0); job.timing.started_at = null;
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

  // ---------------------------------------------------------------- concurrencia (MOTOR-15 §12)
  // Resuelve cuántos partidos se despachan a la vez: la petición (opción de ejecución, si no la del lote congelado), acotada por la capacidad real del ejecutor. Es configuración operativa: no cambia el deporte.
  resolveConcurrency(job, override = null) {
    const cap = this.executor.capacity ?? 1; const requested = override ?? job.config?.concurrency ?? 1; const det = detectCores();
    const wanted = requested === 'auto' ? autoConcurrency(det.cores) : Number(requested);
    const effective = Math.max(1, Math.min(Number.isInteger(wanted) ? wanted : 1, cap));
    return { requested, effective, capacity: cap, cores: det.cores, detected_via: det.via, source: requested === 'auto' ? 'automática: max(1, min(4, núcleos − 1))' : 'explícita', clamped: effective !== wanted };
  }

  // ---------------------------------------------------------------- bucle principal
  // Un único coordinador (este hilo) confirma estados e intentos y es el ÚNICO escritor del índice y del job; los workers solo escriben el material de su intento en su directorio temporal. Con concurrencia > 1 se despacha
  // a workers libres hasta llenar la capacidad; «detener» = no despachar más y esperar a los que están en curso; un worker caído deja SU intento fallido (sin marcador ni derrota) y el resto del lote sigue.
  async run(id, { profileForCompat = null, concurrency = null, induce = null, fingerprint = undefined, validation = undefined } = {}) {
    if (this.active.has(id)) return { ok: false, reason: 'el lote ya está en ejecución' };
    let job = this.store.readJob(id);
    if (job.state === 'completado' && !(job.retry_queue?.length)) return { ok: false, reason: 'el lote ya está completado' };
    const compat = this.compatibility(job, profileForCompat); if (!compat.ok) return { ok: false, reason: 'versiones incompatibles con el lote congelado: no se mezclan versiones en un mismo experimento; prepara una nueva revisión', diffs: compat.diffs };
    const conc = this.resolveConcurrency(job, concurrency);
    this.active.set(id, null);
    const done = (async () => {
      await Promise.resolve();
      job = this.store.readJob(id); job.stop_requested = false; job.timing.started_at = this.now(); job.active = []; job.concurrency_used = conc; this.store.writeJob(id, job);
      this.setState(id, 'ejecutandose', `${job.timing.elapsed_ms ? 'continuación' : 'inicio'} · concurrencia ${conc.effective} (${conc.source}${conc.clamped ? `; pedida ${conc.requested}, limitada por la capacidad ${conc.capacity}` : ''})`);
      const frozenFp = fpOf(this.loteOf(id), 16); const inflight = new Map(); const inducedMatches = new Set(induce ? [induce.match_id] : []);
      let prepFails = 0; let procFails = 0; let ended = null;
      const syncActive = () => { const j = this.store.readJob(id); const act = [...inflight.values()].map((x) => x.meta); j.active = act; j.current = act[0] ?? null; this.store.writeJob(id, j); this.onUpdate(id); };
      // Confirmación: el directorio completo se publica y SOLO después se anota en el índice (finalización atómica por intento).
      const launch = (next, snap) => {
        const m = snap.info.get(next.match_id); const attemptNo = m.attempts.length + 1; const attemptId = `${next.match_id}-A${attemptNo}`; const startedAt = this.now();
        this.store.appendIndex(id, { type: 'attempt_started', match_id: next.match_id, attempt_id: attemptId, attempt_no: attemptNo, started_at: startedAt });
        const cur = this.store.readJob(id); cur.retry_queue = (cur.retry_queue ?? []).filter((x) => x !== next.match_id); this.store.writeJob(id, cur);
        const meta = { match_id: next.match_id, attempt_id: attemptId, started_at: startedAt, case_id: next.case_id, variant_id: next.variant_id, pair_id: next.pair_id };
        const outDir = this.store.attemptDir(id, next.match_id, attemptId, '.tmp'); const t0 = performance.now(); const lvl = snap.lote.record_level;
        const rec = { meta };
        const p = (async () => {
          let outcome; let procFail = false;
          if (inducedMatches.has(next.match_id)) { inducedMatches.delete(next.match_id); rec.induced = true; setTimeout(() => { this.executor.induceCrash?.(next.match_id); }, induce?.after_ms ?? 300); }
          try { outcome = await this.executor.run({ batchId: id, frozenFp, ex: next, attemptNo, attemptId, outDir, level: lvl, prose: snap.lote.prose, ...(fingerprint ? { fingerprint } : {}), ...(validation ? { validation } : {}) }); }
          catch (e) {
            const phase = e.phase ?? 'proceso'; procFail = phase === 'proceso';
            outcome = { attempt_id: attemptId, match_id: next.match_id, attempt_no: attemptNo, exec_state: 'fallida', sporting_status: null, valid: false, exclusion_reason: `${rec.induced ? 'interrupción inducida (prueba controlada, no es un defecto del motor) · ' : ''}${phase}: ${e.message}`, started_at: startedAt, finished_at: this.now(), exec_ms: this.now() - startedAt, record_level: lvl,
              error: { phase, message: e.message, induced: !!rec.induced }, files: [], facts: {}, counts: {} };
            if (phase !== 'preparacion' && phase !== 'proceso') ended ??= ['interrumpido', `no se pudieron conservar los registros: ${e.message}`];
          }
          const tf = performance.now(); const finalDir = this.store.attemptDir(id, next.match_id, attemptId);
          if (existsSync(outDir)) renameSync(outDir, procFail ? this.store.attemptDir(id, next.match_id, attemptId, '.parcial') : finalDir);
          const { files, dir_files: _d, ...slim } = outcome; void _d;
          this.store.appendIndex(id, { type: 'attempt', ...slim, coordinator: { dispatched_at: startedAt, wall_ms: performance.now() - t0, finalize_ms: performance.now() - tf, concurrency: conc.effective, induced: !!rec.induced }, files: (files ?? []).map(({ path, bytes, sha256, records, kind, table, stream, audience }) => ({ path, bytes, sha256, records, kind, table, stream, audience })) });
          prepFails = outcome.error?.phase === 'preparacion' ? prepFails + 1 : 0; procFails = procFail ? procFails + 1 : 0;
          if (prepFails >= 3) ended ??= ['interrumpido', 'tres fallos de preparación seguidos: posible configuración compartida no válida; revisa la entrada antes de continuar'];
          if (procFails >= 3) ended ??= ['interrumpido', 'tres workers caídos seguidos: se detiene el despacho (no hay reintentos automáticos); revisa el entorno y reintenta de forma explícita'];
          inflight.delete(next.match_id); syncActive();
        })();
        rec.promise = p; inflight.set(next.match_id, rec); syncActive();
      };
      try {
        for (;;) {
          const snap = this.snapshot(id); const j = snap.job; const retry = new Set(j.retry_queue ?? []);
          const stopping = !!j.stop_requested || !!ended;
          if (!stopping && inflight.size < conc.effective) {
            const next = snap.lote.agenda.find((x) => { if (inflight.has(x.match_id)) return false; const m = snap.info.get(x.match_id); return m.exec_state === 'pendiente' || m.exec_state === 'interrumpida' || (retry.has(x.match_id) && ['fallida', 'interrumpida'].includes(m.exec_state)); });
            if (next) { launch(next, snap); continue; }
          }
          if (inflight.size) { await Promise.race([...inflight.values()].map((x) => x.promise)); continue; }
          if (ended) break;
          if (j.stop_requested) { ended = ['detenido', 'detención solicitada: terminaron los partidos en curso']; break; }
          const c = countersOf(snap.lote, snap.info); ended = ['completado', c.fallidos ? `${c.fallidos} ejecución(es) fallida(s) conservada(s); reintento explícito disponible` : null]; break;
        }
      } catch (e) { ended = ['interrumpido', `error del controlador: ${e.message}`]; await Promise.allSettled([...inflight.values()].map((x) => x.promise)); }
      const j2 = this.store.readJob(id); j2.timing.elapsed_ms = (j2.timing.elapsed_ms ?? 0) + (this.now() - (j2.timing.started_at ?? this.now())); j2.timing.started_at = null; j2.stop_requested = false; j2.current = null; j2.active = []; this.store.writeJob(id, j2);
      this.setState(id, ended[0], ended[1]); this.active.delete(id); return { ok: true, state: ended[0], reason: ended[1], concurrency: conc };
    })();
    this.active.set(id, done);
    return { ok: true, started: true, done };
  }
}
export { fpOf };
