// API local de guardados: `/api/saves/*` del servidor del laboratorio. Lista, guarda (la captura la produce el navegador en una frontera estable), carga y descarga. Nunca avanza un encuentro.
import { SaveStore } from './savestore.js';

const send = (res, code, obj, headers = {}) => { const body = typeof obj === 'string' || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }); res.end(body); };
const readBody = (req, limit = 256 * 1024 * 1024) => new Promise((resolve, reject) => { const chunks = []; let n = 0; req.on('data', (c) => { n += c.length; if (n > limit) { reject(new Error('cuerpo demasiado grande')); req.destroy(); } else chunks.push(c); }); req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(e); } }); req.on('error', reject); });

export class SaveService {
  constructor({ root = undefined } = {}) { this.store = new SaveStore(root); }
  async handle(req, res, path) {
    const seg = path.split('/').filter(Boolean).slice(2); // /api/saves/...
    try {
      if (req.method === 'GET' && !seg.length) return send(res, 200, { saves: this.store.list(), note: 'Guardar y continuar conserva el estado deportivo; cerrar la aplicación o pausar el visionado no crea una suspensión reglamentaria.' });
      if (req.method === 'POST' && !seg.length) { const b = await readBody(req); try { const meta = this.store.save(b.snapshot, { label: b.label, savedAt: new Date().toISOString(), branchOf: b.branchOf ?? null }); return send(res, 200, { ok: true, save: meta }); } catch (e) { return send(res, 422, { ok: false, reason: e.message, problems: e.problems ?? [] }); } }
      if (req.method === 'GET' && seg[0] && seg[1] === 'download') { try { const { meta, bytes } = this.store.rawFile(seg[0]); return send(res, 200, bytes, { 'Content-Type': 'application/gzip', 'Content-Disposition': `attachment; filename="${meta.id}.json.gz"` }); } catch { return send(res, 404, { ok: false, reason: 'guardado desconocido' }); } }
      if (req.method === 'GET' && seg[0]) { const r = this.store.load(seg[0]); return r.ok ? send(res, 200, { ok: true, meta: r.meta, snapshot: r.snapshot }) : send(res, r.problems[0]?.code === 'incompleto' ? 404 : 422, { ok: false, problems: r.problems, reason: r.problems.map((p) => p.message).join('; ') }); }
      return send(res, 404, { ok: false, reason: 'ruta de guardados desconocida' });
    } catch (e) { return send(res, 500, { ok: false, reason: e.message }); }
  }
}
