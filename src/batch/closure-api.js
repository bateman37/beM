// Servicio de la vista «Cierre» (MOTOR-15 §21, MOTOR-15B §12, MOTOR-17 §11 y §18): resumen del estado de cierre y descarga REAL de los paquetes de devolución. Los de MOTOR-17 (`out/motor17/entrega-final`, generados por
// `scripts/m17-package.js`) son los vigentes; los de MOTOR-16 (`out/motor16/entrega-final`), MOTOR-15B (`out/motor15b`) y MOTOR-15 (`out/motor15`) se conservan y se ofrecen como histórico. Solo lectura y lista cerrada
// de nombres (patrón fijo por familia): ni rutas del cliente ni escritura. El resumen vive versionado en docs/tecnico/evidencia-motor17/cierre.json; los ZIP están fuera de Git.
import { readFileSync, existsSync, statSync, createReadStream, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { sha256 } from './hashing.js';
import { ROOT } from '../../scripts/node-data.js';

const ZIP = 'application/zip'; const JSON_T = 'application/json; charset=utf-8';
// Familias de descargas: patrón del nombre → carpeta, tipo, origen y comando que lo genera.
const FAMILIES = [
  { re: /^MOTOR-17-(revision-rapida\.zip|evidencia-detallada(-parte-\d{2}-de-\d{2})?\.zip)$/, type: ZIP, dir: 'current', origin: 'MOTOR-17 (vigente)', command: 'node scripts/m17-package.js' },
  { re: /^MOTOR-17-indice-partes\.json$/, type: JSON_T, dir: 'current', origin: 'MOTOR-17 (vigente)', command: 'node scripts/m17-package.js' },
  { re: /^MOTOR-16-(revision-rapida\.zip|evidencia-detallada-parte-\d{2}-de-\d{2}\.zip)$/, type: ZIP, dir: 'm16', origin: 'MOTOR-16 (histórico, conservado)', command: 'campaña MOTOR-16 (out/motor16/comandos)' },
  { re: /^MOTOR-16-indice-partes\.json$/, type: JSON_T, dir: 'm16', origin: 'MOTOR-16 (histórico, conservado)', command: 'campaña MOTOR-16 (out/motor16/comandos)' },
  { re: /^MOTOR-15B-(revision-rapida|evidencia-detallada)\.zip$/, type: ZIP, dir: 'm15b', origin: 'MOTOR-15B (histórico, conservado)', command: 'node scripts/m15b-package.js' },
  { re: /^MOTOR-15-(revision-rapida|evidencia-detallada)\.zip$/, type: ZIP, dir: 'historic', origin: 'MOTOR-15 (histórico, conservado)', command: 'node scripts/m15-package.js (paquete histórico de MOTOR-15)' },
];
const familyOf = (name) => FAMILIES.find((f) => f.re.test(name)) ?? null;

export class ClosureService {
  constructor({ root = join(ROOT, 'out', 'motor17', 'entrega-final'), m16 = join(ROOT, 'out', 'motor16', 'entrega-final'), m15b = join(ROOT, 'out', 'motor15b'), historic = join(ROOT, 'out', 'motor15'), summary = join(ROOT, 'docs', 'tecnico', 'evidencia-motor17', 'cierre.json') } = {}) { this.dirs = { current: root, m16, m15b, historic }; this.summaryPath = summary; }
  dirOf(f) { return this.dirs[f.dir]; }
  // Lista los archivos presentes de cada familia (las partes de la evidencia detallada son tantas como se generaron) más los nombres vigentes que aún no existen, con el comando que los genera.
  files() {
    const out = []; const seen = new Set();
    for (const f of FAMILIES) { const dir = this.dirOf(f); const names = existsSync(dir) ? readdirSync(dir).filter((n) => f.re.test(n)).sort() : []; for (const name of names) { if (seen.has(name)) continue; seen.add(name); const p = join(dir, name); out.push({ name, available: true, bytes: statSync(p).size, sha256: name.endsWith('.zip') ? sha256(readFileSync(p)) : null, url: `/api/closure/download/${name}`, command: f.command, historic: f.dir !== 'current', origin: f.origin }); } }
    for (const name of ['MOTOR-17-revision-rapida.zip', 'MOTOR-17-indice-partes.json']) if (!seen.has(name)) out.unshift({ name, available: false, bytes: null, sha256: null, url: null, command: familyOf(name).command, historic: false, origin: 'MOTOR-17 (vigente)' });
    return out;
  }
  async handle(req, res, path) {
    const send = (code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
    if (req.method !== 'GET') return send(405, { error: 'solo lectura' });
    if (path === '/api/closure/summary') { let summary = null; try { summary = JSON.parse(readFileSync(this.summaryPath, 'utf8')); } catch { /* sin resumen */ } return send(200, { summary, files: this.files() }); }
    const m = /^\/api\/closure\/download\/([^/]+)$/.exec(path); const fam = m ? familyOf(m[1]) : null;
    if (m && fam) { const p = join(this.dirOf(fam), m[1]); if (!existsSync(p)) return send(404, { error: `no existe ${m[1]}: genérelo con «${fam.command}»` }); res.writeHead(200, { 'Content-Type': fam.type, 'Content-Length': statSync(p).size, 'Content-Disposition': `attachment; filename="${m[1]}"`, 'Cache-Control': 'no-store' }); createReadStream(p).pipe(res); return; }
    return send(404, { error: 'no encontrado' });
  }
}
