// Cinco partidos completos de integración de MOTOR-10 (§21.2): conciliación del acta (MOTOR-09) y de la capa analítica, lectura sin efectos (el resultado no cambia al
// consultar ni al exportar) y, para el quinto, reproducción desde su JSON. No calibran la población ni auditan la normativa.
// Uso: node scripts/integration-motor10.js [--json fichero]
import { writeFileSync } from 'node:fs';
import { loadData } from './node-data.js';
import { buildMatchInput, runMatch, createMatch, buildResult } from '../src/match/index.js';
import { replayMatch } from '../src/match/replay.js';
import { analyze } from '../src/analysis/index.js';
import { reconcileAnalysis } from '../src/analysis/reconcile.js';

const { profile, players } = loadData();
const input = (seed) => buildMatchInput(profile, players, { seed });
const inv = { detail: 'full', check: true };
const policies = (i, a, b) => { i.teams[0].plan.coach.policy = a; i.teams[1].plan.coach.policy = b; return i; };
const runs = {};
runs['1 referencia 20261016'] = runMatch(input(20261016), profile, inv);
runs['2 contraste de políticas (EQ01 cauta, EQ02 agresiva)'] = runMatch(policies(input(20261016), 'ENTREF01', 'ENTREF03'), profile, inv);
runs['3 copia diagnóstica cansada y con faltas previas (EQ01), identificada'] = runMatch((() => { const i = input(20261016); const st = new Set(Object.values(i.teams[0].plan.starters)); for (const p of i.teams[0].players) if (st.has(p.id)) { p.state.energy = 38; p.state.fouls = 3; } return i; })(), profile, inv);
runs['4 exposición repetida (libro de una ficha) seed 20261017'] = runMatch((() => { const i = input(20261017); for (const t of i.teams) { t.plan.playbook = [{ playId: 'POS01', priority: 1 }]; t.plan.styles.freedom = 1; } return i; })(), profile, inv);
const m5 = createMatch(input(20261018), profile, { detail: 'full', check: true });
const pending = [{ at: 30, spec: { team: 0, type: 'styles', styles: { offensiveRisk: 4 } } }, { at: 60, spec: { team: 1, type: 'timeout' } }, { at: 90, spec: { team: 0, type: 'styles', styles: { organizedPace: 4 } } }];
while (m5.status !== 'finished' && m5.status !== 'error') { while (pending.length && pending[0].at <= m5.stepSeq) m5.submit(pending.shift().spec); if (!m5.step()) break; }
runs['5 dirección manual (3 órdenes) seed 20261018'] = buildResult(m5);

const rows = [];
for (const [name, res] of Object.entries(runs)) {
  const before = JSON.stringify(res);
  const rec = reconcileAnalysis(res);
  const exports = [];
  for (const audience of ['public', 'own', 'diagnostic']) for (const team of [0, 1]) { const a = analyze(res, { audience, team }); a.summary(); exports.push(JSON.stringify(a.exportJson()).length, a.exportMarkdown().length, Object.keys(a.exportCsv()).length); }
  const pure = JSON.stringify(res) === before; // leer no cambia el resultado
  const s = analyze(res, { audience: 'public', team: 0 }).summary();
  rows.push({ name, status: res.status, score: res.score.join('–'), draws: res.diagnostics.sportingDraws, acta: res.reconciliation.valid, analysis: rec.ok ? 'válida' : 'DESVIACIONES', analysisChecks: rec.total, failed: rec.failed.map((c) => c.id), pureRead: pure,
    keys: s.keys.map((k) => k.id), candidates: s.candidateCount, chronicle: s.chronicle.length, exports: exports.length });
}
const replay = replayMatch(JSON.parse(JSON.stringify(runs['5 dirección manual (3 órdenes) seed 20261018'])));
for (const r of rows) console.log(JSON.stringify(r));
console.log('reproducción del partido 5 desde su JSON: idéntica =', replay.comparison.identical);
const bad = rows.filter((r) => r.status !== 'finished' || r.acta !== 'válida' || r.analysis !== 'válida' || !r.pureRead);
if (process.argv.includes('--json')) writeFileSync(process.argv[process.argv.indexOf('--json') + 1], JSON.stringify(rows, null, 1));
if (bad.length || !replay.comparison.identical) { console.log('FALLOS', JSON.stringify(bad)); process.exit(1); }
console.log('cinco partidos completos conciliados (acta y análisis)');
