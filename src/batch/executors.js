// Ejecutores de intentos. El controlador solo ve `run(task) → Promise<outcome>`.
//  · InlineExecutor: en el mismo hilo (pruebas y scripts de CLI).
//  · WorkerExecutor: un `worker_thread` por trabajo (servidor del laboratorio): el hilo principal sigue respondiendo (progreso, detención) mientras el motor simula un partido.
// Ninguno cambia el deporte: ambos llaman a `executeAttempt` con el mismo motor.
import { Worker } from 'node:worker_threads';
import { availableParallelism, cpus } from 'node:os';
import { executeAttempt } from './attempt.js';
import { loadFrozen } from './jobstore.js';

export class InlineExecutor {
  constructor({ simulate = undefined, store }) { this.simulate = simulate; this.store = store; this.frozen = new Map(); }
  async run(task) {
    await new Promise((r) => setImmediate(r)); // cesión de ejecución entre partidos
    if (!this.frozen.has(task.batchId)) this.frozen.set(task.batchId, loadFrozen(this.store, task.batchId));
    return executeAttempt({ ...task, frozen: this.frozen.get(task.batchId), simulate: this.simulate });
  }
  async replay(batchId, matchId) { const { defaultSimulate } = await import('./attempt.js'); const { trajectoryFingerprint } = await import('./fingerprint.js'); const fz = this.frozen.get(batchId) ?? loadFrozen(this.store, batchId); this.frozen.set(batchId, fz); const ex = fz.lote.agenda.find((x) => x.match_id === matchId); const entry = fz.entryOf(ex); const r = (this.simulate ?? defaultSimulate)(fz.inputFor(entry, ex.seed), fz.profile, { level: 'diagnostic', planned: entry.planned_orders ?? [], profileRef: { batch: fz.batch_id, profile_id: fz.profile_id } }); if (!r.res) throw new Error(r.error?.message ?? 'no se pudo reproducir'); return { json: JSON.stringify(r.res), trajectory_fp: trajectoryFingerprint(r.res), status: r.res.status, error: r.error }; }
  async close() { this.frozen.clear(); }
}

// Concurrencia automática inicial (MOTOR-15 §12.1): max(1, min(4, núcleos disponibles − 1)). `os.availableParallelism` (Node ≥ 18.14) respeta los límites del proceso; si no existe se usa `os.cpus().length`.
// Es configuración OPERATIVA, no una fila de probabilidad deportiva: no cambia ningún resultado, solo cuántos partidos se resuelven a la vez.
export function detectCores() {
  if (typeof availableParallelism === 'function') { try { const n = availableParallelism(); if (Number.isInteger(n) && n >= 1) return { cores: n, via: 'os.availableParallelism' }; } catch { /* se usa el respaldo */ } }
  const n = cpus().length; return { cores: Math.max(1, n || 1), via: n ? 'os.cpus().length (respaldo declarado)' : 'sin detección: se asume 1 núcleo (respaldo declarado)' };
}
export const autoConcurrency = (cores = detectCores().cores) => Math.max(1, Math.min(4, cores - 1));
export const ALLOWED_CONCURRENCY = [1, 2, 4];

export class WorkerExecutor {
  constructor({ store, index = 0 }) { this.store = store; this.index = index; this.worker = null; this.pending = new Map(); this.seq = 0; this.current = null; this.spawned = 0; }
  get capacity() { return 1; }
  get busy() { return this.pending.size > 0; }
  start() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.js', import.meta.url), { workerData: { root: this.store.root, index: this.index } }); this.spawned += 1;
    this.worker.on('message', (m) => { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id); if (m.error) p.reject(Object.assign(new Error(m.error.message), { phase: m.error.phase ?? 'proceso' })); else p.resolve(m.result ?? m.outcome); });
    this.worker.on('error', (e) => this.fail(e)); this.worker.on('exit', (code) => { if (this.pending.size) this.fail(new Error(`el worker terminó inesperadamente (código ${code})`)); this.worker = null; });
  }
  fail(e) { for (const p of this.pending.values()) p.reject(Object.assign(new Error(e.message), { phase: 'proceso' })); this.pending.clear(); }
  // Terminación forzada del hilo (solo para interrupciones INDUCIDAS en pruebas con trabajo real; no es un fallo natural del motor).
  async kill() { if (this.worker) await this.worker.terminate(); }
  run(task) {
    this.start(); const id = ++this.seq; this.current = task.ex?.match_id ?? null;
    const { frozen, simulate, ...plain } = task; void frozen; void simulate;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.worker.postMessage({ id, task: plain }); });
  }
  call(kind, args) { this.start(); const id = ++this.seq; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.worker.postMessage({ id, kind, args }); }); }
  replay(batchId, matchId) { return this.call('replay', { batchId, matchId }); }
  package(batchId, opts) { return this.call('package', { batchId, opts }); }
  async close() { if (this.worker) { await this.worker.terminate(); this.worker = null; } }
}

// Grupo local de trabajadores persistentes (MOTOR-15 §12). Cada worker es un `worker_thread` de Node que se reutiliza entre encuentros y resuelve UNO a la vez con su propia sesión y azar; no hay memoria deportiva compartida
// mutable (cada intento crea su MatchCore) y solo se comparte contenido inmutable cacheado por huella dentro de cada worker. Un worker caído se vuelve a levantar para el siguiente trabajo; su intento queda fallido (el
// coordinador lo registra) y no se reintenta solo. No se crea un worker por partido ni se usa Promise.all como paralelismo de CPU: el coordinador despacha solo a workers libres.
export class WorkerPool {
  constructor({ store, size = 1 }) { this.store = store; this.size = size; this.workers = Array.from({ length: size }, (_, i) => new WorkerExecutor({ store, index: i })); this.waiters = []; }
  get capacity() { return this.size; }
  get active() { return this.workers.filter((w) => w.busy).length; }
  acquire() { const w = this.workers.find((x) => !x.busy && !x.reserved); if (w) { w.reserved = true; return Promise.resolve(w); } return new Promise((r) => this.waiters.push(r)); }
  release(w) { const next = this.waiters.shift(); if (next) next(w); else w.reserved = false; }
  async run(task) { const w = await this.acquire(); try { const r = await w.run(task); return r; } finally { this.release(w); } }
  // Interrupción inducida: termina el hilo que está resolviendo `matchId`. Devuelve si había un worker con ese trabajo.
  async induceCrash(matchId) { const w = this.workers.find((x) => x.busy && x.current === matchId); if (!w) return false; await w.kill(); return true; }
  stats() { return this.workers.map((w) => ({ worker: w.index, busy: w.busy, spawned: w.spawned })); }
  async close() { await Promise.all(this.workers.map((w) => w.close())); }
}
