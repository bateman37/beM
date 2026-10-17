// Cinco partidos completos de integración de MOTOR-11 (§17.2): referencia histórica, planes naturales EQ03–EQ09 (interior y protección), EQ07–EQ08, EQ11–EQ12 y dos equipos generados.
// Comprueban invariantes/acta/análisis y reproducción; NO calibran ni usan el marcador como objetivo. Uso: node scripts/integration-motor11.js
import { loadData } from './node-data.js';
import { runMatch } from '../src/match/index.js';
import { replayMatch } from '../src/match/replay.js';
import { analyze } from '../src/analysis/index.js';
import { reconcileAnalysis } from '../src/analysis/reconcile.js';
import * as P from '../src/population/index.js';

const { profile, players } = loadData();
const pair = (a, b, seed = 20261016) => { const A = P.instantiate(typeof a === 'string' ? P.referenceTeam(profile, players, a) : a, []); const B = P.instantiate(typeof b === 'string' ? P.referenceTeam(profile, players, b) : b, [A.id]); return { schema: 'beM-match-input/6', seed, importance: 'ordinary', teams: [A, B] }; };
const inv = { detail: 'full', check: true };
const g1 = P.generateTeam(profile, players, { base: 'EQ04', seed: 20261017, dispersion: 1 }); const g2 = P.generateTeam(profile, players, { base: 'EQ10', seed: 20261018, dispersion: 1 });
const runs = {
  '1 referencia histórica EQ01-EQ02 (planes MOTOR-10)': runMatch(P.buildLabVariant(profile, players, 'LAB11-00', 'base').input, profile, inv),
  '2 EQ03 (interior) - EQ09 (protección interior), planes naturales': runMatch(pair('EQ03', 'EQ09'), profile, inv),
  '3 EQ07 (veteranos, J01 de 40) - EQ08 (jóvenes)': runMatch(pair('EQ07', 'EQ08'), profile, inv),
  '4 EQ11 (estrella) - EQ12 (profunda)': runMatch(pair('EQ11', 'EQ12'), profile, inv),
  '5 generados EQ04 (20261017) y EQ10 (20261018), dispersión 1': runMatch(pair(g1, g2), profile, inv),
};
let bad = 0;
for (const [name, res] of Object.entries(runs)) {
  const rec = reconcileAnalysis(res); const a = analyze(res, { audience: 'public', team: 0 }); a.summary();
  const ok = res.status === 'finished' && res.reconciliation.valid && rec.ok && a.closures(0).reconciled && a.closures(1).reconciled; if (!ok) bad += 1;
  console.log(JSON.stringify({ name, status: res.status, score: res.score.join('–'), draws: res.diagnostics.sportingDraws, acta: res.reconciliation.valid, analysis: rec.ok ? 'válida' : 'DESVIACIONES', checks: rec.total }));
}
const r5 = runs['5 generados EQ04 (20261017) y EQ10 (20261018), dispersión 1'];
const rep = replayMatch(JSON.parse(JSON.stringify(r5)));
console.log('reproducción del partido 5 desde su JSON: idéntica =', rep.comparison.identical);
if (bad || !rep.comparison.identical) { console.log('FALLOS', bad); process.exit(1); }
console.log('cinco partidos completos conciliados (acta y análisis)');
