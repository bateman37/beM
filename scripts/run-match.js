// Simula un partido de referencia desde la línea de comandos. Uso: node scripts/run-match.js [semilla] [--json fichero] [--check]
import { writeFileSync } from 'node:fs';
import { loadData } from './node-data.js';
import { buildMatchInput, runMatch, teamTotals } from '../src/match/index.js';

const args = process.argv.slice(2);
const seed = Number(args.find((a) => /^\d+$/.test(a)) ?? 20261016);
const jsonIdx = args.indexOf('--json');
const { profile, players } = loadData();
const input = buildMatchInput(profile, players, { seed });
const t0 = process.hrtime.bigint();
const res = runMatch(input, profile, { detail: 'full', check: args.includes('--check') });
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
console.log(`Semilla ${seed} · estado ${res.status} · ${res.events.length} acontecimientos · ${res.diagnostics.possessions} posesiones · ${ms.toFixed(0)} ms`);
if (res.errors.length) console.log('ERRORES', JSON.stringify(res.errors, null, 1));
console.log(`${res.teams[0].name} ${res.score[0]} – ${res.score[1]} ${res.teams[1].name}  parciales`, res.periodScores.map((p) => p.points.join('-')).join(' | '));
for (const t of [0, 1]) {
  const tt = teamTotals(res.box, res.input, t);
  console.log(`${res.teams[t].id}: PTS ${tt.pts} T2 ${tt.fg2m}/${tt.fg2a} T3 ${tt.fg3m}/${tt.fg3a} TL ${tt.ftm}/${tt.fta} REB ${tt.oreb}+${tt.dreb} PER ${tt.tov}+${tt.teamTov} FAL ${tt.pf} ROB ${tt.stl} TAP ${tt.blk} MIN ${tt.min.toFixed(1)}`);
}
console.log('cobertura observada', JSON.stringify(res.diagnostics.coverageObserved));
if (jsonIdx >= 0) { writeFileSync(args[jsonIdx + 1], JSON.stringify(res)); console.log('JSON escrito en', args[jsonIdx + 1]); }
