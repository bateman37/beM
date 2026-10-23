// Genera un partido SIM desde la línea de comandos. Uso:
//   node scripts/sim01-match.js [--a=EQ01] [--b=EQ02] [--seed=20261022] [--input=entrada.json] [--profile=candidata.json] [--json=salida.json] [--no-events]
// `--input` admite una entrada congelada del detallado (beM-match-input/6|7) o una entrada SIM exportada. `--profile` aplica filas editadas (lista [{path,value}]).
import { readFileSync, writeFileSync } from 'node:fs';
import { loadData } from './node-data.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult, SIM_MODEL, SIM_VERSION, SIM_PROFILE_ID } from '../src/sim/index.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const { profile, players } = loadData();
const overrides = arg('profile') ? JSON.parse(readFileSync(arg('profile'), 'utf8')).overrides ?? JSON.parse(readFileSync(arg('profile'), 'utf8')) : null;
const ctx = makeContext(profile, overrides);
const input = arg('input') ? JSON.parse(readFileSync(arg('input'), 'utf8')) : buildReferenceInput(profile, players, arg('a', 'EQ01'), arg('b', 'EQ02'), { seed: Number(arg('seed', 20261022)) });
const t0 = performance.now(); const m = new SimMatch(input, ctx, { matchId: arg('id', null) }); m.finish(); const t1 = performance.now();
const res = buildSimResult(m, { events: !process.argv.includes('--no-events') }); const t2 = performance.now();
const [A, B] = res.identity.teams; const box = res.box.teams;
console.log(`${SIM_MODEL} ${SIM_VERSION} · ${SIM_PROFILE_ID} · semilla ${res.identity.seed} · ${m.status} · ${res.score.overtimes} prórroga(s) · ${m.segments.length} tramos · ${m.events.length} hechos · ${m.rng.draws} sorteos`);
console.log(`${A.id} ${res.score.current[0]} – ${res.score.current[1]} ${B.id}   parciales ${res.score.periods.map((p) => p.join('-')).join(' | ')}`);
for (const k of [0, 1]) { const t = box[k]; console.log(`${res.identity.teams[k].id}: PTS ${t.pts} T2 ${t.fg2m}/${t.fg2a} T3 ${t.fg3m}/${t.fg3a} TL ${t.ftm}/${t.fta} REB ${t.oreb}+${t.dreb}(+${t.teamReb[0] + t.teamReb[1]} eq.) AS ${t.ast} PER ${t.tov} ROB ${t.stl} TAP ${t.blk} FC ${t.pf}`); }
console.log(`conciliación ${res.reconciliation.passed}/${res.reconciliation.evaluated} ${res.reconciliation.valid ? 'correcta' : 'CON FALLOS: ' + res.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id).join(', ')} · generar ${(t1 - t0).toFixed(1)} ms · resultado ${(t2 - t1).toFixed(1)} ms · huella ${res.sportFingerprint}`);
if (arg('json')) { writeFileSync(arg('json'), JSON.stringify(res)); writeFileSync(arg('json').replace(/\.json$/, '') + '.input.json', JSON.stringify(input)); console.log('JSON escrito en', arg('json')); }
process.exit(res.reconciliation.valid && m.status === 'finished' ? 0 : 1);
