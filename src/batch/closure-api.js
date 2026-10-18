// Servicio de la vista «Cierre» (MOTOR-15 §21, MOTOR-15B §12): resumen del estado de cierre y descarga de los paquetes de devolución generados por `scripts/m15b-package.js` (MOTOR-15B, `out/motor15b`);
// los paquetes originales de MOTOR-15 (`out/motor15`, generados por `scripts/m15-package.js`) se conservan y se ofrecen como histórico. Solo lectura y lista cerrada de nombres: ni rutas del cliente ni escritura.
// El resumen vive versionado en docs/tecnico/evidencia-motor15b/cierre.json; los ZIP están fuera de Git.
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join } from 'node:path';
import { sha256 } from './hashing.js';
import { ROOT } from '../../scripts/node-data.js';

const ZIP = 'application/zip'; const JSON_T = 'application/json; charset=utf-8';
// nombre → { tipo, carpeta ('current' = MOTOR-15B, 'historic' = MOTOR-15 original), comando que lo genera }
const DOWNLOADS = { 'MOTOR-15B-revision-rapida.zip': { type: ZIP, dir: 'current', command: 'node scripts/m15b-package.js' }, 'MOTOR-15B-evidencia-detallada.zip': { type: ZIP, dir: 'current', command: 'node scripts/m15b-package.js' }, 'paquetes.json': { type: JSON_T, dir: 'current', command: 'node scripts/m15b-package.js' },
  'MOTOR-15-revision-rapida.zip': { type: ZIP, dir: 'historic', command: 'node scripts/m15-package.js (paquete histórico de MOTOR-15)' }, 'MOTOR-15-evidencia-detallada.zip': { type: ZIP, dir: 'historic', command: 'node scripts/m15-package.js (paquete histórico de MOTOR-15)' } };
export class ClosureService {
  constructor({ root = join(ROOT, 'out', 'motor15b'), historic = join(ROOT, 'out', 'motor15'), summary = join(ROOT, 'docs', 'tecnico', 'evidencia-motor15b', 'cierre.json') } = {}) { this.root = root; this.historic = historic; this.summaryPath = summary; }
  dirOf(name) { return DOWNLOADS[name].dir === 'historic' ? this.historic : this.root; }
  files() { return Object.keys(DOWNLOADS).map((name) => { const p = join(this.dirOf(name), name); const ok = existsSync(p); return { name, available: ok, bytes: ok ? statSync(p).size : null, sha256: ok && name.endsWith('.zip') ? sha256(readFileSync(p)) : null, url: ok ? `/api/closure/download/${name}` : null, command: DOWNLOADS[name].command, historic: DOWNLOADS[name].dir === 'historic' }; }); }
  async handle(req, res, path) {
    const send = (code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
    if (req.method !== 'GET') return send(405, { error: 'solo lectura' });
    if (path === '/api/closure/summary') { let summary = null; try { summary = JSON.parse(readFileSync(this.summaryPath, 'utf8')); } catch { /* sin resumen */ } return send(200, { summary, files: this.files() }); }
    const m = /^\/api\/closure\/download\/([^/]+)$/.exec(path);
    if (m && DOWNLOADS[m[1]]) { const p = join(this.dirOf(m[1]), m[1]); if (!existsSync(p)) return send(404, { error: `no existe ${m[1]}: genérelo con «${DOWNLOADS[m[1]].command}»` }); res.writeHead(200, { 'Content-Type': DOWNLOADS[m[1]].type, 'Content-Length': statSync(p).size, 'Content-Disposition': `attachment; filename="${m[1]}"`, 'Cache-Control': 'no-store' }); createReadStream(p).pipe(res); return undefined; }
    return send(404, { error: 'no encontrado' });
  }
}
