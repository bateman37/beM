// Servicio de la vista «Cierre» (MOTOR-15 §21): resumen del estado de cierre y descarga de los paquetes de devolución generados por `scripts/m15-package.js`. Solo lectura y lista cerrada de nombres:
// ni rutas del cliente ni escritura. El resumen vive versionado en docs/tecnico/evidencia-motor15/cierre.json; los ZIP están fuera de Git (out/motor15).
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join } from 'node:path';
import { sha256 } from './hashing.js';
import { ROOT } from '../../scripts/node-data.js';

const DOWNLOADS = { 'MOTOR-15-revision-rapida.zip': 'application/zip', 'MOTOR-15-evidencia-detallada.zip': 'application/zip', 'paquetes.json': 'application/json; charset=utf-8' };
export class ClosureService {
  constructor({ root = join(ROOT, 'out', 'motor15'), summary = join(ROOT, 'docs', 'tecnico', 'evidencia-motor15', 'cierre.json') } = {}) { this.root = root; this.summaryPath = summary; }
  files() { return Object.keys(DOWNLOADS).map((name) => { const p = join(this.root, name); const ok = existsSync(p); return { name, available: ok, bytes: ok ? statSync(p).size : null, sha256: ok && name.endsWith('.zip') ? sha256(readFileSync(p)) : null, url: ok ? `/api/closure/download/${name}` : null, command: 'node scripts/m15-package.js' }; }); }
  async handle(req, res, path) {
    const send = (code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
    if (req.method !== 'GET') return send(405, { error: 'solo lectura' });
    if (path === '/api/closure/summary') { let summary = null; try { summary = JSON.parse(readFileSync(this.summaryPath, 'utf8')); } catch { /* sin resumen */ } return send(200, { summary, files: this.files() }); }
    const m = /^\/api\/closure\/download\/([^/]+)$/.exec(path);
    if (m && DOWNLOADS[m[1]]) { const p = join(this.root, m[1]); if (!existsSync(p)) return send(404, { error: `no existe ${m[1]}: genérelo con «node scripts/m15-package.js»` }); res.writeHead(200, { 'Content-Type': DOWNLOADS[m[1]], 'Content-Length': statSync(p).size, 'Content-Disposition': `attachment; filename="${m[1]}"`, 'Cache-Control': 'no-store' }); createReadStream(p).pipe(res); return undefined; }
    return send(404, { error: 'no encontrado' });
  }
}
