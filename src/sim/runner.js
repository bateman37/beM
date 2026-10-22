// Núcleo común de los trabajadores de lote (Node worker_threads y Web Worker): recibe `init` (contexto SIM + doce plantillas) y `run` (casos), devuelve resúmenes compactos.
import { contextFromJSON } from './context.js';
import { runCase } from './cases.js';

export function createRunner() {
  let ctx = null; let teamMap = null; let ctxKey = null;
  return {
    handle(msg) {
      if (msg.type === 'init') { if (msg.key !== ctxKey) { ctx = contextFromJSON(msg.ctx); ctxKey = msg.key; } teamMap = msg.teams; return { type: 'ready', id: msg.id, reused: msg.key === ctxKey }; }
      if (msg.type === 'run') { const out = []; const t0 = performance.now(); for (const c of msg.cases) out.push(runCase(ctx, teamMap, c)); return { type: 'done', id: msg.id, results: out, ms: performance.now() - t0 }; }
      return { type: 'error', id: msg.id, error: `mensaje desconocido ${msg.type}` };
    },
  };
}
