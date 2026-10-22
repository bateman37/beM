// Ejecución de un caso de lote: genera el partido completo, construye el resultado compacto y valida las conciliaciones. Devuelve un resumen pequeño (sin registros) con tiempos monotónicos.
import { SimMatch } from './engine.js';
import './materialize.js';
import { buildSimResult } from './result.js';
import { reconcileResult } from './reconcile.js';
import { buildPairInput } from './teams.js';

const now = () => performance.now();
export function runCase(ctx, teamMap, c, { retries = 0 } = {}) {
  const t0 = now(); const input = buildPairInput(teamMap, c.a, c.b, { seed: c.seed }); const tIn = now();
  let m; let res; let tGen; let tBuild; let tRec; let rec;
  try {
    m = new SimMatch(input, ctx); m.finish(); tGen = now();
    res = buildSimResult(m, { events: false, reconcile: false }); tBuild = now();
    rec = reconcileResult(m, res, m.events); tRec = now();
  } catch (e) { return { n: c.n, id: c.id, a: c.a, b: c.b, seed: c.seed, status: 'failed', error: String(e.message ?? e).slice(0, 300), valid: false, ms: { input: tIn - t0, gen: now() - tIn, build: 0, recon: 0 } }; }
  return {
    n: c.n, id: c.id, a: c.a, b: c.b, seed: c.seed, status: m.status, error: m.error?.cause ?? null, score: m.status === 'finished' ? res.score.current : null, periods: res.score.periods, overtimes: res.score.overtimes,
    fp: res.sportFingerprint, inputFp: res.identity.inputFingerprint, valid: m.status === 'finished' && rec.valid, failedChecks: rec.checks.filter((x) => !x.ok).map((x) => x.id), checks: rec.checks.length,
    events: m.events.length, draws: m.rng.draws, segments: m.segments.length, controls: res.controls, attempts: retries + 1,
    ms: { input: tIn - t0, gen: tGen - tIn, build: tBuild - tGen, recon: tRec - tBuild },
  };
}
