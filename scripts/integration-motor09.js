// Cinco partidos completos de integración de MOTOR-09 (§20.3): invariantes activos (`check`), conciliación final y marcadores observados.
// No calibran la población ni demuestran que una política sea superior. Uso: node scripts/integration-motor09.js [--json fichero]
import { writeFileSync } from 'node:fs';
import { loadData } from './node-data.js';
import { buildMatchInput, runMatch, createMatch, buildResult } from '../src/match/index.js';
import { replayMatch } from '../src/match/replay.js';
import { memoryReport } from '../src/match/memory-report.js';

const { profile, players } = loadData();
const input = (seed) => buildMatchInput(profile, players, { seed });
const inv = { detail: 'full', check: true };
const policies = (i, a, b) => { i.teams[0].plan.coach.policy = a; i.teams[1].plan.coach.policy = b; return i; };
const runs = {};

runs['1 referencia 20261016 (equilibrada/equilibrada)'] = runMatch(input(20261016), profile, inv);
runs['2 cauta (EQ01) frente a agresiva (EQ02), mismo contexto de plantilla'] = runMatch(policies(input(20261016), 'ENTREF01', 'ENTREF03'), profile, inv);
runs['3 copia diagnóstica: titulares de EQ01 con energía 38 y gestión de faltas (3 faltas previas)'] = runMatch((() => { const i = input(20261016); const st = new Set(Object.values(i.teams[0].plan.starters)); for (const p of i.teams[0].players) if (st.has(p.id)) { p.state.energy = 38; p.state.fouls = 3; } return i; })(), profile, inv);
runs['4 plan de exposición repetida (libro de una ficha, libertad 1) seed 20261017'] = runMatch((() => { const i = input(20261017); for (const t of i.teams) { t.plan.playbook = [{ playId: 'POS01', priority: 1 }]; t.plan.styles.freedom = 1; } return i; })(), profile, inv);
// 5. dirección manual en fronteras fijas + exportación y reproducción desde el JSON (el tiempo de espera y la velocidad no modifican el acta)
const m5 = createMatch(input(20261018), profile, { detail: 'full', check: true });
const schedule = [{ at: 30, spec: { team: 0, type: 'styles', styles: { offensiveRisk: 4 } } }, { at: 60, spec: { team: 1, type: 'timeout' } }, { at: 90, spec: { team: 0, type: 'styles', styles: { organizedPace: 4 } } }];
const pending = [...schedule];
while (m5.status !== 'finished' && m5.status !== 'error') { while (pending.length && pending[0].at <= m5.stepSeq) m5.submit(pending.shift().spec); if (!m5.step()) break; }
runs['5 dirección manual (3 órdenes en fronteras fijas) seed 20261018'] = buildResult(m5);

const rows = [];
for (const [name, res] of Object.entries(runs)) {
  const rep = memoryReport(res);
  rows.push({ name, status: res.status, errors: res.errors.length, score: res.score.join('–'), partials: res.periodScores.map((p) => p.points.join('-')).join(' | '), events: res.events.length, valid: res.reconciliation.valid, failed: res.reconciliation.failed,
    assists: res.acta.teams.map((t) => `${t.id} ${t.totals.ast} (${t.totals.astFg}c/${t.totals.astFt}l)`).join(' · '), finals: res.acta.finals.length, possessions: res.acta.possessions.length, partition: res.acta.partition.byOrigin,
    memory: { exposiciones: rep.denominadores.exposicionesValidas, patrones: rep.denominadores.patronesUnicosObservados, episodios: rep.denominadores.episodiosDeReconocimiento, rutaA: rep.denominadores.respuestasAplicadasRutaA, rutaB: rep.denominadores.preparacionesRutaB } });
}
const replay = replayMatch(JSON.parse(JSON.stringify(runs['5 dirección manual (3 órdenes en fronteras fijas) seed 20261018'])));
for (const r of rows) console.log(JSON.stringify(r));
console.log('reproducción del partido 5 desde su JSON: idéntica =', replay.comparison.identical);
const bad = rows.filter((r) => r.status !== 'finished' || r.errors || r.valid !== 'válida');
if (process.argv.includes('--json')) writeFileSync(process.argv[process.argv.indexOf('--json') + 1], JSON.stringify(rows, null, 1));
if (bad.length || !replay.comparison.identical) { console.log('FALLOS', JSON.stringify(bad)); process.exit(1); }
console.log('cinco partidos completos conciliados');
