// MOTOR-17 §13.1: muestra de desarrollo pequeña. Doce pares de ciclo (EQ01–EQ02, …, EQ11–EQ12, EQ01–EQ12) × r = 1, 2 con seed_dev = 210000000 + 1000·d + r (r = 1: el primer equipo del par es local; r = 2, invertido).
// 24 encuentros por perfil: base P17 y cada candidata C17-0x (misma agenda, mismas entradas y semillas; solo cambian los parámetros de la candidata). Usa el controlador de lotes y el pool existentes.
// Uso: node scripts/m17-dev.js [--out=out/motor17/desarrollo] [--conc=4] [--skip-run]
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, CANDIDATES17_PATH } from './node-data.js';
import * as P from '../src/population/index.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { WorkerPool } from '../src/batch/executors.js';
import { candidateProfile, candidateDiff } from '../src/profiles/candidates.js';
import { ENGINE_VERSION } from '../src/match/index.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor17/desarrollo'); const CONC = Number(arg('conc', 4)); const SKIP = process.argv.includes('--skip-run');
mkdirSync(OUT, { recursive: true });
const { profile, players } = loadData(); const cands = JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8'));
const IDS = P.REFERENCE_IDS; const nat = Object.fromEntries(IDS.map((id) => [id, P.referenceTeam(profile, players, id)]));
const cyc = []; for (let i = 0; i < 11; i++) cyc.push([IDS[i], IDS[i + 1]]); cyc.push([IDS[0], IDS[11]]);
const cases = []; for (let d = 1; d <= 12; d++) for (const r of [1, 2]) { const [a, b] = cyc[d - 1]; cases.push({ d, r, pair: r === 1 ? [a, b] : [b, a], seed: 210000000 + 1000 * d + r }); }
const store = new JobStore(join(OUT, 'lotes')); const pool = new WorkerPool({ store, size: CONC }); const ctl = new BatchController({ store, executor: pool });
const versions = [{ label: 'P17-base', profile }, ...cands.candidates.map((c) => ({ label: c.id, cand: c, profile: candidateProfile(profile, c) }))];
const plan = { study: 'MOTOR-17-DESARROLLO', engine: ENGINE_VERSION, cases, versions: [], note: 'Muestra de desarrollo §13.1: 24 encuentros por perfil con semillas 210000000 + 1000·d + r. No es una reserva de validación.' };
const prevPlan = SKIP && existsSync(join(OUT, 'plan-desarrollo.json')) ? JSON.parse(readFileSync(join(OUT, 'plan-desarrollo.json'), 'utf8')) : null;
for (const v of versions) {
  if (prevPlan) { const pv = prevPlan.versions.find((x) => x.label === v.label); v.batchId = pv.batch_id; plan.versions.push(pv); continue; } // --skip-run: relee los lotes ya ejecutados (no crea otros)
  const spec = { recordLevel: 'world-essential', prose: 'omitted', concurrency: CONC, importance: 'ordinary', mode: 'pairs', pairs: cases.map((c) => c.pair), repetitions: 1, venue: 'fixed', teams: nat, batchSeed: 210000000, caseSeeds: cases.map((c) => c.seed), objective: `MOTOR17 desarrollo · ${v.label}` };
  const r = ctl.create(spec, v.profile, { players, label: `MOTOR17-DEV-${v.label}` }); if (!r.ok) { console.error('no se pudo crear', v.label, r.problems); process.exit(1); }
  v.batchId = r.batchId; plan.versions.push({ label: v.label, batch_id: r.batchId, effective_profile_id: v.profile.effectiveId, agenda_fp: r.agendaFp, executions: r.counts.executions, candidate: v.cand ? candidateDiff(v.cand) : null });
}
if (!prevPlan) writeFileSync(join(OUT, 'plan-desarrollo.json'), JSON.stringify(plan, null, 1));
if (!SKIP) for (const v of versions) { const t0 = performance.now(); const run = await ctl.run(v.batchId, { concurrency: CONC }); const end = await run.done; const s = ctl.status(v.batchId); console.log(`${v.label} ${end.state} ${JSON.stringify(s.counters)} ${Math.round(performance.now() - t0)} ms`); }
// ------------------------------------------------------------------------------------------------------------------ lectura mecánica de los registros esenciales
const num = (x) => (x == null ? null : Number(x)); const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
function readLot(v) {
  const dir = join(OUT, 'lotes', v.batchId); const lote = JSON.parse(readFileSync(join(dir, 'entradas/lote.json'), 'utf8')); const idx = readFileSync(join(dir, 'indice.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).filter((r) => r.type === 'attempt' && r.exec_state === 'terminada');
  const ag = new Map(lote.agenda.map((e) => [e.match_id, e])); const rows = [];
  for (const a of idx) { const e = ag.get(a.match_id); const es = JSON.parse(readFileSync(join(dir, 'intentos', a.match_id, a.attempt_id, 'esencial', `${a.match_id}--${a.attempt_id}.json`), 'utf8')); rows.push({ seed: e.seed, es, valid: a.valid }); }
  return rows.sort((x, y) => x.seed - y.seed || 0);
}
const summarize = (rows) => {
  const tms = rows.flatMap((r) => r.es.acta.teams.map((t, i) => ({ r, t, i }))); const T = (f) => mean(tms.map(({ t }) => f(t)));
  const fga = T((t) => t.totals.fg2a + t.totals.fg3a);
  const perf = rows.filter((r) => r.es.result.period_scores.length <= 4).flatMap((r) => [0, 1].map((ti) => r.es.acta.players.filter((p) => p.team_index === ti)));
  const byJ = {}; for (const ps of perf) for (const p of ps) { const j = p.id.split('-')[1]; const o = (byJ[j] ??= { n: 0, min: 0, dnp: 0, m40: 0 }); o.n += 1; o.min += p.min_tenths / 600; if (p.min_tenths === 0) o.dnp += 1; if (p.min_tenths >= 24000) o.m40 += 1; }
  const fe = rows.flatMap((r) => Object.values(r.es.states.final_energy ?? {})).filter((x) => typeof x === 'number');
  return { encuentros: rows.length, validos: rows.filter((r) => r.valid).length, puntos_por_equipo: T((t) => t.points), actuaciones_bajo_70: T((t) => (t.points < 70 ? 1 : 0)), intentos_de_campo: fga, eFG: T((t) => t.totals.fg2m + 1.5 * t.totals.fg3m) / fga,
    pct_2: T((t) => t.totals.fg2m) / T((t) => t.totals.fg2a), pct_3: T((t) => t.totals.fg3m) / T((t) => t.totals.fg3a), libres_intentados: T((t) => t.totals.fta), rebotes: T((t) => t.totals.oreb + t.totals.dreb), perdidas: T((t) => (t.totals.tov ?? 0) + (t.collective?.tov ?? 0)), robos: T((t) => t.totals.stl), faltas: T((t) => t.totals.pf), asistencias: T((t) => t.totals.ast),
    actuaciones_equipo_sin_prorroga: perf.length, con_jugador_de_40: perf.filter((ps) => ps.some((p) => p.min_tenths >= 24000)).length / perf.length, minutos_maximos_medios: mean(perf.map((ps) => Math.max(...ps.map((p) => p.min_tenths)) / 600)),
    jugadores_de_40: perf.flat().filter((p) => p.min_tenths >= 24000).length, dnp: perf.flat().filter((p) => p.min_tenths === 0).length, actuaciones_de_jugador: perf.flat().length,
    energia_final_media: mean(fe), energia_final_bajo_30: fe.filter((x) => x < 30).length / (fe.length || 1), energia_final_bajo_10: fe.filter((x) => x < 10).length / (fe.length || 1),
    por_jugador: Object.fromEntries(Object.entries(byJ).sort().map(([j, o]) => [j, { minutos_medios: Number((o.min / o.n).toFixed(1)), dnp: o.dnp, jugo_40: o.m40, n: o.n }])) };
};
const report = { ...plan, resultados: {} };
for (const v of versions) { const rows = readLot(v); report.resultados[v.label] = summarize(rows); if (v.cand) for (const c of v.cand.controls) c.observedDev = { muestra: '24 encuentros de desarrollo (semillas 210000000 + 1000·d + r)', ...Object.fromEntries(['puntos_por_equipo', 'eFG', 'robos', 'faltas', 'con_jugador_de_40', 'minutos_maximos_medios', 'energia_final_media', 'energia_final_bajo_30', 'energia_final_bajo_10'].map((k) => [k, Number(report.resultados[v.label][k].toFixed(4))])), nota: 'muestra pequeña: no demuestra efectos pequeños' }; }
writeFileSync(join(OUT, 'resultados-desarrollo.json'), JSON.stringify(report, null, 1));
const cols = ['puntos_por_equipo', 'actuaciones_bajo_70', 'intentos_de_campo', 'eFG', 'pct_2', 'pct_3', 'libres_intentados', 'rebotes', 'perdidas', 'robos', 'faltas', 'asistencias', 'con_jugador_de_40', 'minutos_maximos_medios', 'jugadores_de_40', 'dnp', 'energia_final_media', 'energia_final_bajo_30', 'energia_final_bajo_10'];
writeFileSync(join(OUT, 'resultados-desarrollo.csv'), `version,${cols.join(',')}\n${versions.map((v) => `${v.label},${cols.map((k) => Number(report.resultados[v.label][k].toFixed(5))).join(',')}`).join('\n')}\n`);
if (process.argv.includes('--write-observed')) { const f = JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')); for (const c of f.candidates) { const v = versions.find((x) => x.label === c.id); c.controls.forEach((ctl2, i) => { ctl2.observedDev = v.cand.controls[i].observedDev; }); } writeFileSync(CANDIDATES17_PATH, `${JSON.stringify(f, null, 1)}\n`); console.log('observedDev escrito en data/match/motor17-candidates.json'); }
for (const v of versions) console.log(v.label, JSON.stringify(Object.fromEntries(cols.map((k) => [k, Number(report.resultados[v.label][k].toFixed(3))]))));
await pool.close(); process.exit(0);
