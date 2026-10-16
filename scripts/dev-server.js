// Servidor estático local del laboratorio (node:http, sin dependencias). Sirve solo src/ y data/.
// Uso: npm run dev   →   http://localhost:5173/   (PORT=otro para cambiar el puerto)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';
import { ROOT } from './node-data.js';

const PORT = Number(process.env.PORT ?? 5173);
const HOST = process.env.HOST ?? '127.0.0.1';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml' };
const ALLOWED = ['src', 'data'];

export function createLabServer() {
  return createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path === '/' || path === '/index.html') path = '/src/lab/index.html';
      const file = normalize(join(ROOT, path));
      const rel = file.slice(ROOT.length + 1).split(sep);
      if (!file.startsWith(ROOT + sep) || !ALLOWED.includes(rel[0])) { res.writeHead(404).end('No encontrado'); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end('No encontrado'); }
  });
}

if (process.argv[1] && process.argv[1].endsWith('dev-server.js')) {
  createLabServer().listen(PORT, HOST, () => console.log(`Laboratorio beM (MOTOR-04): http://${HOST === '127.0.0.1' ? 'localhost' : HOST}:${PORT}/`));
}
