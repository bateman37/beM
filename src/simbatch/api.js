// API local de SIM del servidor del laboratorio: lotes persistentes (`/api/simbatch/*`) y guardados de jornada/encuentro (`/api/simsave/*`). El navegador solo DEFINE y CONSULTA: el servidor ejecuta con trabajadores
// y conserva en `out/sim-batches/` y `out/sim-saves/` (excluidos de Git; `BEM_SIM_BATCH_ROOT` / `BEM_SIM_SAVE_ROOT` los sustituyen). Un guardado se escribe de forma atómica; leerlo no avanza nada.
import { mkdirSync, writeFileSync, readFileSync, renameSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, ROOT } from '../../scripts/node-data.js';
import { makeContext } from '../sim/index.js';
import { referenceTeamMap } from '../sim/teams.js';
import { SimBatchRunner } from './runner.js';
import { validateBatchSpec } from './schedule.js';
import { sha256Hex } from '../sim/fp.js';

const send = (res, code, obj, headers = {}) => { const body = typeof obj === 'string' ? obj : JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }); res.end(body); };
const readBody = (req, limit = 256 * 1024 * 1024) => new Promise((resolve, reject) => { const chunks = []; let n = 0; req.on('data', (c) => { n += c.length; if (n > limit) { reject(new Error('cuerpo demasiado grande')); req.destroy(); return; } chunks.push(c); }); req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(e); } }); req.on('error', reject); });
const NAME = /^[A-Za-z0-9_-]{1,80}$/;

export class SimService {
  constructor({ batchRoot = undefined, saveRoot = undefined, workers = 4 } = {}) { this.batchRoot = batchRoot; this.saveRoot = saveRoot ?? process.env.BEM_SIM_SAVE_ROOT ?? join(ROOT, 'out', 'sim-saves'); this.workers = workers; this.runner = null; this.running = new Map(); }
  _runner() { if (!this.runner) { const { profile, players } = loadData(); const ctx = makeContext(profile); this.runner = new SimBatchRunner({ ctx, teamMap: referenceTeamMap(profile, players), root: this.batchRoot, workers: this.workers, retention: 'analysis' }); } return this.runner; }
  async close() { await this.runner?.close(); }
  async handle(req, res, path) {
    const seg = path.split('/').filter(Boolean).slice(2); const kind = path.split('/')[2] === undefined ? '' : path.split('/')[1];
    try {
      if (path.startsWith('/api/simbatch')) return await this._batch(req, res, path.split('/').filter(Boolean).slice(2));
      if (path.startsWith('/api/simsave')) return await this._save(req, res, path.split('/').filter(Boolean).slice(2));
      void seg; void kind; return send(res, 404, { ok: false, reason: 'ruta SIM desconocida' });
    } catch (e) { return send(res, 500, { ok: false, reason: String(e.message ?? e) }); }
  }
  async _batch(req, res, seg) {
    const r = this._runner(); const [op, id, caseId] = seg;
    if (req.method === 'GET' && op === 'list') return send(res, 200, { batches: r.store.ids().map((x) => ({ ...r.store.readJob(x), status: r.status(x) })) });
    if (req.method === 'POST' && op === 'create') { const b = await readBody(req); const errs = validateBatchSpec(b.spec); if (errs.length) return send(res, 422, { ok: false, errors: errs }); const bid = r.create(b.spec, { label: b.label ?? null }); return send(res, 200, { ok: true, id: bid, agenda: r.agenda(bid).cases.length }); }
    if (req.method === 'GET' && op === 'status' && id) return send(res, 200, { ok: true, status: r.status(id), running: this.running.has(id) });
    if (req.method === 'POST' && (op === 'run' || op === 'retry') && id) { if (this.running.has(id)) return send(res, 409, { ok: false, reason: 'el lote ya se está ejecutando' }); const b = await readBody(req); const p = r.run(id, { limit: b.limit ?? Infinity }).finally(() => this.running.delete(id)); this.running.set(id, p); return send(res, 202, { ok: true, started: true }); }
    if (req.method === 'POST' && op === 'stop' && id) { r.stop(); return send(res, 200, { ok: true, note: 'se detiene al terminar los encuentros en curso' }); }
    if (req.method === 'POST' && op === 'recover' && id) { if (this.running.has(id)) return send(res, 409, { ok: false, reason: 'el lote se está ejecutando' }); return send(res, 200, { ok: true, ...r.recover(id) }); }
    if (req.method === 'GET' && op === 'agenda' && id) return send(res, 200, { ok: true, ...r.agenda(id), state: [...r.state(id).entries()].map(([k, v]) => [k, { accepted: v.accepted?.attempt ?? null, attempts: [...v.attempts.entries()].map(([a, x]) => [a, x.status]) }]) });
    if (req.method === 'GET' && op === 'open' && id && caseId) { const o = r.open(id, caseId); return send(res, o.ok ? 200 : 404, o); }
    return send(res, 404, { ok: false, reason: 'ruta de lotes SIM desconocida' });
  }
  async _save(req, res, seg) {
    mkdirSync(this.saveRoot, { recursive: true }); const [name] = seg;
    if (req.method === 'GET' && !name) return send(res, 200, { saves: readdirSync(this.saveRoot).filter((f) => f.endsWith('.json')).map((f) => ({ name: f.slice(0, -5), bytes: statSync(join(this.saveRoot, f)).size })) });
    if (!NAME.test(name ?? '')) return send(res, 400, { ok: false, reason: 'nombre de guardado no válido' });
    const file = join(this.saveRoot, `${name}.json`);
    if (req.method === 'POST') { const b = await readBody(req); if (!b?.snapshot || typeof b.snapshot !== 'object') return send(res, 422, { ok: false, reason: 'guardado ausente o incompleto' }); const body = JSON.stringify(b.snapshot); writeFileSync(`${file}.tmp`, body); renameSync(`${file}.tmp`, file); return send(res, 200, { ok: true, name, bytes: body.length, sha256: sha256Hex(body) }); }
    if (req.method === 'GET') { if (!existsSync(file)) return send(res, 404, { ok: false, reason: 'guardado desconocido' }); return send(res, 200, readFileSync(file, 'utf8')); }
    return send(res, 405, { ok: false, reason: 'método no admitido' });
  }
}
