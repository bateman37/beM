// SIM-MOTOR-04C · lectura de VAL (§8.4): N04C, candidata (FINAL) y DET sobre las mismas entradas, con los ocho errores, las guardas y las bandas como SEÑALES de aceptación provisional. VAL no elige ni reajusta nada.
//   node scripts/sim04c/val-summary.js [--out=out/sim-motor04c/campaign] [--write=out/sim-motor04c/08-VAL-RESUMEN.json]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonl, buildTables } from './tables.js';
import * as S from './select.js';
import * as L from './lib.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const out = arg('out', join(SELF, 'out/sim-motor04c/campaign'));
const env = L.loadEnv(); const C = L.allCases(env); const ids = C.val.map((c) => c.case_id);
const recs = (identity, resolver = 'sim') => { const m = new Map(); for (const r of readJsonl(join(out, `records-${resolver}-${identity}.jsonl`))) { if (r.block !== 'VAL') continue; const q = m.get(r.case_id); if (!q || r.attempt >= q.attempt) m.set(r.case_id, r); } return [...m.values()]; };
export function evaluateVal(identity) {
  const sim = recs(identity); const det = recs('DET', 'detailed'); const { tables } = buildTables(sim, det);
  const simL = S.linesOf(tables, ids, 'sim', identity); const detL = S.linesOf(tables, ids, 'detailed', 'DET'); const common = new Set([...new Set(simL.rows.map((r) => r[0]))].filter((id) => new Set(detL.rows.map((r) => r[0])).has(id)));
  const sel = (tab, res, id) => tables[tab].filter((r) => r[6] === res && r[7] === id && common.has(r[0]));
  const sm = S.metricsOf(simL.rows.filter((r) => common.has(r[0])), sel('zone', 'sim', identity), sel('czq', 'sim', identity)); const dm = S.metricsOf(detL.rows.filter((r) => common.has(r[0])), sel('zone', 'detailed', 'DET'), sel('czq', 'detailed', 'DET'));
  const e = S.errorsOf(sm, dm); return { identity, comparableCases: common.size, sim: sm, det: dm, e, ...S.scoreM(e), freq40: S.fortyMinuteFrequency(tables, [...common], 'sim', identity), excluded: { sim: simL.excluded, detailed: detL.excluded } };
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const N = evaluateVal('N04C'); const F = evaluateVal('FINAL'); const keys = ['eP', 'eF', 'eZ', 'e2', 'eR', 'eI', 'eQ', 'eA', 'e3', 'eFT', 'forcedInside'];
  const signals = Object.fromEntries(S.M_KEYS.map((k) => [k, { band: S.BAND[k], N04C: N.e[k].value, FINAL: F.e[k].value, improves: F.e[k].value < N.e[k].value, inBand: F.e[k].value <= S.BAND[k] }]));
  const guards = S.guards(F.e, N.e); const res = { schema: 'beM-sim04c-val-summary/1', note: 'VAL no elige ni reajusta: bandas y guardas son señales de aceptación provisional', N04C: N, FINAL: F, signals, guardsFailed: guards, MN04C: N.M, MFINAL: F.M, labels: { cal: 'mejora en CAL', val: F.M < N.M ? 'confirmada en VAL (M menor)' : 'contradicha en VAL (M no menor)' } };
  if (arg('write')) writeFileSync(arg('write'), JSON.stringify(res, null, 1));
  const f = (x) => (x == null ? '-' : (+x).toFixed(4)); console.log('err'.padEnd(13), 'N04C'.padStart(8), 'FINAL'.padStart(8), 'banda'.padStart(7)); for (const k of keys) console.log(k.padEnd(13), f(N.e[k].value).padStart(8), f(F.e[k].value).padStart(8), (S.BAND[k] ?? '').toString().padStart(7)); console.log('M', f(N.M), f(F.M), 'dom', N.dominant, F.dominant, 'comparables', N.comparableCases, F.comparableCases, 'guardas incumplidas:', JSON.stringify(guards.map((g) => g.guard)));
  console.log('pts40 sim/det', f(N.sim.meanPTS40), f(F.sim.meanPTS40), f(F.det.meanPTS40), 'fga40', f(N.sim.meanFGA40), f(F.sim.meanFGA40), f(F.det.meanFGA40), 'ast/fgm', f(N.e.parts.simAstPerFgm), f(F.e.parts.simAstPerFgm), f(F.e.parts.detAstPerFgm), 'inside', f(N.e.parts.simInside), f(F.e.parts.simInside), f(F.e.parts.detInside));
}
