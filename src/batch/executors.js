// Ejecutores de intentos. El controlador solo ve `run(task) → Promise<outcome>`.
//  · InlineExecutor: en el mismo hilo (pruebas y scripts de CLI).
//  · WorkerExecutor: un `worker_thread` por trabajo (servidor del laboratorio): el hilo principal sigue respondiendo (progreso, detención) mientras el motor simula un partido.
// Ninguno cambia el deporte: ambos llaman a `executeAttempt` con el mismo motor.
import { Worker } from 'node:worker_threads';
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

export class WorkerExecutor {
  constructor({ store }) { this.store = store; this.worker = null; this.pending = new Map(); this.seq = 0; }
  start() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.js', import.meta.url), { workerData: { root: this.store.root } });
    this.worker.on('message', (m) => { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id); if (m.error) p.reject(Object.assign(new Error(m.error.message), { phase: m.error.phase ?? 'proceso' })); else p.resolve(m.result ?? m.outcome); });
    this.worker.on('error', (e) => this.fail(e)); this.worker.on('exit', (code) => { if (this.pending.size) this.fail(new Error(`el worker terminó inesperadamente (código ${code})`)); this.worker = null; });
  }
  fail(e) { for (const p of this.pending.values()) p.reject(Object.assign(new Error(e.message), { phase: 'proceso' })); this.pending.clear(); }
  run(task) {
    this.start(); const id = ++this.seq;
    const { frozen, simulate, ...plain } = task; void frozen; void simulate;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.worker.postMessage({ id, task: plain }); });
  }
  call(kind, args) { this.start(); const id = ++this.seq; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.worker.postMessage({ id, kind, args }); }); }
  replay(batchId, matchId) { return this.call('replay', { batchId, matchId }); }
  package(batchId, opts) { return this.call('package', { batchId, opts }); }
  async close() { if (this.worker) { await this.worker.terminate(); this.worker = null; } }
}
