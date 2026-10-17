// Simula un partido de referencia desde la línea de comandos. Uso: node scripts/run-match.js [semilla] [--json fichero] [--check] [--level=diagnostic|reduced|world-essential]
// `--level=world-essential` (MOTOR-15 §11) usa la fachada del motor con el mismo resolutor y escribe el registro esencial compacto (sin prosa ni diagnóstico) con --json.
import { writeFileSync } from 'node:fs';
import { loadData } from './node-data.js';
import { buildMatchInput, runMatch, teamTotals } from '../src/match/index.js';

const args = process.argv.slice(2);
const seed = Number(args.find((a) => /^\d+$/.test(a)) ?? 20261016);
const jsonIdx = args.indexOf('--json');
const { profile, players } = loadData();
const level = (args.find((a) => a.startsWith('--level=')) ?? '').slice(8) || null;
if (level === 'world-essential') {
  const { createEncounter } = await import('../src/engine/index.js');
  const enc = createEncounter({ input: buildMatchInput(profile, players, { seed }), profile, level, observeTrajectory: true });
  const t = performance.now(); enc.advance({ until: 'end' }); const rec = enc.essential();
  console.log(`Semilla ${seed} · world-essential · estado ${rec.result.status} · ${rec.integrity.events} hechos · ${rec.integrity.sporting_draws} sorteos · ${(performance.now() - t).toFixed(0)} ms · huella ${rec.integrity.trajectory_fp_version} ${rec.integrity.trajectory_fp?.slice(0, 12)}`);
  console.log(`${rec.identity.teams[0].id} ${rec.result.court_score[0]} – ${rec.result.court_score[1]} ${rec.identity.teams[1].id} · válido ${rec.validity.valid}`);
  if (jsonIdx >= 0) { writeFileSync(args[jsonIdx + 1], JSON.stringify(rec)); console.log('registro esencial escrito en', args[jsonIdx + 1]); }
  process.exit(rec.validity.valid ? 0 : 1);
}
const input = buildMatchInput(profile, players, { seed });
const detailLevel = level === 'reduced' ? 'minimal' : 'full';
const t0 = process.hrtime.bigint();
const res = runMatch(input, profile, { detail: detailLevel, check: args.includes('--check') });
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
