// Pool de trabajadores físicos limitados y reutilizables (Node). Despacha casos en lotes pequeños (cola dinámica) y devuelve los resúmenes en orden de agenda.
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { cpus } from 'node:os';
import { configureWorkerRuntime } from './runtime.js';

const WORKER_URL = new URL('./worker-node.js', import.meta.url);
// Tamaño de la generación joven de cada hilo (MiB): menos recolecciones menores sin cambiar nada del deporte. 48 por defecto (valor medido); SIM_YOUNG_MB solo para experimentos de medición.
const YOUNG_MB = Number(process.env.SIM_YOUNG_MB ?? 48);
export class SimPool {
  constructor({ workers = 4 } = {}) { this.size = Math.max(1, Math.min(workers, cpus().length)); this.requested = workers; this.workers = []; this.pending = new Map(); this.seq = 1; this.ready = false; void fileURLToPath; }
  _send(w, msg) { return new Promise((res, rej) => { const id = this.seq++; this.pending.set(id, { res, rej }); w.postMessage({ ...msg, id }); }); }
  async start(ctxJSON, key, teams, warm = []) {
    const t0 = performance.now(); this.gcMode = configureWorkerRuntime(); this.workers = Array.from({ length: this.size }, () => { const w = new Worker(WORKER_URL, { resourceLimits: { maxYoungGenerationSizeMb: YOUNG_MB } }); w.on('message', (m) => { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id); m.type === 'error' ? p.rej(new Error(m.error)) : p.res(m); }); w.on('error', (e) => { for (const p of this.pending.values()) p.rej(e); }); return w; });
    this.startedAt = performance.now();
    this.readyInfo = await Promise.all(this.workers.map((w) => this._send(w, { type: 'init', key, ctx: ctxJSON, teams, warm }))); this.ready = true; this.startMs = performance.now() - t0; return this.startMs;
  }
  // Ejecuta `cases` repartiendo lotes de `chunk` casos; devuelve { results, workerMs[], wallMs }.
  async run(cases, { chunk = 4 } = {}) {
    const t0 = performance.now(); const results = new Array(cases.length); let next = 0; const workerMs = this.workers.map(() => 0); const perWorkerCases = this.workers.map(() => 0);
    await Promise.all(this.workers.map(async (w, wi) => { for (;;) { const from = next; if (from >= cases.length) break; next = Math.min(cases.length, from + chunk); const batch = cases.slice(from, next); const r = await this._send(w, { type: 'run', cases: batch }); workerMs[wi] += r.ms; perWorkerCases[wi] += batch.length; r.results.forEach((x, i) => { results[from + i] = x; }); } }));
    return { results, workerMs, perWorkerCases, wallMs: performance.now() - t0 };
  }
  // Ejecución en flujo: cada trabajador toma un lote pequeño mientras `shouldStop()` sea falso (detener = no despachar más; los lotes en curso terminan) y `onChunk(cases, results)` confirma cada lote
  // en el hilo coordinador, en orden de llegada. Devuelve cuántos casos se despacharon.
  async runStream(cases, { chunk = 2, onChunk, onStart = null, shouldStop = () => false, type = 'run' } = {}) {
    let next = 0; let dispatched = 0;
    await Promise.all(this.workers.map(async (w) => { for (;;) { if (shouldStop() || next >= cases.length) break; const from = next; next = Math.min(cases.length, from + chunk); const batch = cases.slice(from, next); dispatched += batch.length; if (onStart) onStart(batch); const r = await this._send(w, { type, cases: batch }); await onChunk(batch, r.results, r); } }));
    return dispatched;
  }
  async close() { await Promise.all(this.workers.map((w) => w.terminate())); this.workers = []; }
}
