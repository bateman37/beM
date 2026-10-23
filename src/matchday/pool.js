// Pool limitado de trabajadores para jornadas grandes (§7.4): cuatro como referencia, no un hilo por partido ni un mensaje por segundo por encuentro. Cada trabajador conserva en su fragmento el estado SIM de sus
// encuentros y devuelve por barrera paquetes compactos (marcador, estado, cursor); el coordinador no reconstruye actas completas en cada barrera. Solo Node (worker_threads).
import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';

const WORKER_URL = new URL('./worker-node.js', import.meta.url);
export class MatchdayPool {
  constructor({ workers = 4 } = {}) { this.size = Math.max(1, Math.min(workers, cpus().length)); this.requested = workers; this.workers = []; this.pending = new Map(); this.seq = 1; this.owner = new Map(); }
  // C03-10: `rid` identifica la PETICIÓN (correlación) y `id` queda reservado al identificador del encuentro: nunca comparten campo ni en el mensaje ni en la respuesta.
  _send(w, msg) { return new Promise((res, rej) => { const rid = this.seq++; this.pending.set(rid, { res, rej }); w.postMessage({ ...msg, rid }); }); }
  async start(ctxJSON, teams) {
    const t0 = performance.now();
    this.workers = Array.from({ length: this.size }, () => { const w = new Worker(WORKER_URL); w.on('message', (m) => { const p = this.pending.get(m.rid); if (!p) return; this.pending.delete(m.rid); m.type === 'error' ? p.rej(new Error(m.error)) : p.res(m); }); w.on('error', (e) => { for (const p of this.pending.values()) p.rej(e); }); return w; });
    await Promise.all(this.workers.map((w) => this._send(w, { type: 'init', ctx: ctxJSON, teams }))); this.startMs = performance.now() - t0; return this.startMs;
  }
  // Reparte los encuentros en grupos contiguos y equilibrados (no un hilo por encuentro).
  async add(fixtures, { groupSize = 25 } = {}) {
    const groups = []; for (let i = 0; i < fixtures.length; i += groupSize) groups.push(fixtures.slice(i, i + groupSize));
    const per = this.workers.map(() => []); groups.forEach((g, i) => per[i % this.workers.length].push(...g)); per.forEach((list, wi) => list.forEach((f) => this.owner.set(f.id, wi)));
    await Promise.all(this.workers.map((w, i) => (per[i].length ? this._send(w, { type: 'add', fixtures: per[i] }) : null)));
  }
  // `timing` (solo medición): milisegundos por fase sumados en los trabajadores durante la barrera (generación, construcción y conciliación del esencial, lectura de progreso); queda en `lastTiming`.
  async advance(T) { const r = await Promise.all(this.workers.map((w) => this._send(w, { type: 'advance', T }))); this.lastTiming = r.map((x) => x.timing ?? null); return r.flatMap((x) => x.packets).sort((a, b) => (a.id < b.id ? -1 : 1)); }
  async review(T, needs = {}, policy = true) { const r = await Promise.all(this.workers.map((w) => this._send(w, { type: 'review', T, needs, policy }))); return Object.assign({}, ...r.map((x) => x.decisions)); }
  async essentials(ids) { const by = this.workers.map(() => []); for (const id of ids) by[this.owner.get(id)].push(id); const r = await Promise.all(this.workers.map((w, i) => (by[i].length ? this._send(w, { type: 'essentials', ids: by[i] }) : { essentials: [] }))); return Object.fromEntries(r.flatMap((x) => x.essentials)); }
  // Orden manual a UN encuentro: llega exactamente a su worker, una vez y con acuse. Un encuentro desconocido, terminado o sin autoridad devuelve un rechazo tipado (no una promesa colgada) y no toca a los demás.
  async order(id, spec) { const wi = this.owner.get(id); if (wi === undefined) return { ok: false, rejected: true, code: 'desconocido', reason: `encuentro desconocido: ${id}`, fixture: id }; const r = await this._send(this.workers[wi], { type: 'order', id, spec }); return { ...r.result, fixture: id }; }
  async close() { await Promise.all(this.workers.map((w) => w.terminate())); this.workers = []; }
}
