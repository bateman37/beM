// Núcleo común de los trabajadores de lote (Node worker_threads y Web Worker): recibe `init` (contexto SIM + doce plantillas) y `run` (casos), devuelve resúmenes compactos.
import { contextFromJSON } from './context.js';
import { runCase } from './cases.js';
import { runCampaignSim } from './campaign-record.js';

export function createRunner() {
  let ctx = null; let teamMap = null; let ctxKey = null;
  return {
    handle(msg) {
      if (msg.type === 'init') {
        const reused = msg.key === ctxKey; if (!reused) { ctx = contextFromJSON(msg.ctx); ctxKey = msg.key; } teamMap = msg.teams;
        // Calentamiento declarado (no forma parte de la agenda ni de los resultados): partidos de otra serie de semillas que preparan el compilador JIT antes de anunciar disponibilidad.
        const t0 = performance.now(); for (const c of msg.warm ?? []) runCase(ctx, teamMap, c);
        return { type: 'ready', id: msg.id, reused, warmCases: (msg.warm ?? []).length, warmMs: performance.now() - t0 };
      }
      if (msg.type === 'run') { const out = []; const t0 = performance.now(); for (const c of msg.cases) out.push(runCase(ctx, teamMap, c)); return { type: 'done', id: msg.id, results: out, ms: performance.now() - t0 }; }
      // campaña SIM-MOTOR-03: cada caso trae su entrada materializada; devuelve el registro compacto (y los hechos nativos solo de la muestra diagnóstica)
      if (msg.type === 'camp') { const out = []; const t0 = performance.now(); for (const c of msg.cases) out.push(runCampaignSim(ctx, c)); return { type: 'done', id: msg.id, results: out, ms: performance.now() - t0 }; }
      return { type: 'error', id: msg.id, error: `mensaje desconocido ${msg.type}` };
    },
  };
}
