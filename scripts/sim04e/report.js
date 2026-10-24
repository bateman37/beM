// SIM-MOTOR-04E · tablas MECÁNICAS de la campaña (§8, §9.4, §12): se derivan de los registros ya ejecutados (JSONL) y de cálculos puros, sin volver a simular. Conservan numeradores y denominadores; lo no conservado es `null` con su
// causa en el diccionario (nunca un cero). Solo informan: VAL04D no elige ni reajusta nada.   node scripts/sim04e/report.js [--out=out/sim-motor04e/report]
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { readJsonl, buildTables, COLS, csvText, summaries, contrasts, stats, BAND_NAMES } from './tables.js';
import * as S from './select.js';
import { loadAgenda } from './exec.mjs';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const O = join(root, 'out/sim-motor04e'); const CAMP = join(O, 'campaign'); const OUT = arg('out', join(O, 'report')); mkdirSync(OUT, { recursive: true });
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000); const r4 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10000) / 10000);
const ci = (n) => COLS.team.indexOf(n);
const latest = (recs) => { const m = new Map(); for (const r of recs) { const k = `${r.run}|${r.block}|${r.case_id}|${r.resolver}`; const p = m.get(k); if (!p || (r.attempt ?? 1) >= (p.attempt ?? 1)) m.set(k, r); } return [...m.values()]; };
const simRecs = []; const detRecs = []; for (const f of readdirSync(CAMP).sort()) { if (f.startsWith('records-sim-')) simRecs.push(...readJsonl(join(CAMP, f))); else if (f.startsWith('records-detailed-')) detRecs.push(...readJsonl(join(CAMP, f))); }
// Identidades de desarrollo: los perfiles de la búsqueda se registran con su identificador de vector (`V-…`); aquí solo se conservan las condiciones nombradas (S0 = SIM_04E_BASE, la candidata recomendada si difiere y la mejor
// experimental). El resto de los perfiles evaluados se publica en 11-BUSQUEDA-Y-SELECCION.json (con su acta completa) sin duplicar observaciones.
const vdir = join(O, 'vectors'); const rv = (n) => (existsSync(join(vdir, `${n}.json`)) ? JSON.parse(readFileSync(join(vdir, `${n}.json`), 'utf8')) : null);
const baseV = rv('SIM_04E_BASE'); const candV = rv('SIM_04E_CAND'); const expV = rv('SIM_04E_EXPERIMENTAL'); const idMap = new Map([[baseV.id, 'SIM_04E_BASE']]); if (candV && !candV.alias) idMap.set(candV.id, 'SIM_04E_CAND'); if (expV) idMap.set(expV.id, 'SIM_04E_EXP'); // `id` = identificador del vector efectivo; `parent` = su padre en el árbol de búsqueda
const named = new Set(['DET', 'SIM_04E_BASE', 'SIM_04E_CAND', 'SIM_04E_EXP', 'TECH-auto', 'TECH-steps', 'TECH-recover']);
const sim = latest(simRecs).map((r) => ({ ...r, run: idMap.get(r.run) ?? r.run })).filter((r) => named.has(r.run)); const det = latest(detRecs); const { tables } = buildTables(sim, det);
const BL = { DEV: ['DEV'], DEVB: ['DEVB'], JOINT: ['DEV', 'DEVB'], VAL: ['VAL'] }; const inB = (name, v) => BL[name].includes(v); const SETS = ['DEV', 'DEVB', 'JOINT', 'VAL'];
const planDir = join(root, 'docs/tecnico/evidencia-sim-motor04e/plan'); const { agenda } = loadAgenda(planDir);
// la identidad que representa la candidata en VAL: `CAND` o, si coincide con el control, el alias `C0_04C`
const valSummary = existsSync(join(O, 'val-campaign-summary.json')) ? JSON.parse(readFileSync(join(O, 'val-campaign-summary.json'), 'utf8')) : null; const alias = valSummary?.alias ?? false;

// ---------------------------------------------------------------------------------------------------------------------------------- 05 actas por equipo (una fila por actuación; conteos reales y normalizados a 40 minutos; sin alias duplicados)
const N40 = S.COUNTS; const cols05 = [...COLS.team, ...N40.map((c) => `${c.id}_40`)];
const rows05 = tables.team.map((r) => { const d = r[ci('duration_s')]; return [...r, ...N40.map((c) => { if (r[ci('status')] !== 'finished' || !(d > 0)) return null; let v = 0; for (const k of c.cols) { const x = r[ci(k)]; if (x == null) return null; v += x; } return r3((v * 2400) / d); })]; });
writeFileSync(join(OUT, '05-ACTA-EQUIPOS.csv'), csvText(cols05, rows05));

// ---------------------------------------------------------------------------------------------------------------------------------- poblaciones por (bloque, condición)
const caseIdsOf = (name) => [...agenda.values()].filter((a) => BL[name]?.includes(a.block) ?? a.block === name).map((a) => a.case_id);
const conds = (block) => { const set = new Set(tables.team.filter((r) => inB(block, r[ci('block')]) && r[ci('resolver')] === 'sim').map((r) => r[ci('identity')])); return [...set].sort(); };
const zc = (n) => COLS.zone.indexOf(n);
function pop(block, resolver, identity, caseIds) {
  const { rows } = S.linesOf(tables, caseIds, resolver, identity); const ids = new Set(rows.map((r) => r[ci('case_id')])); const zr = tables.zone.filter((r) => r[zc('resolver')] === resolver && r[zc('identity')] === identity && inB(block, r[zc('block')]) && ids.has(r[zc('case_id')]));
  return { pop: S.populationOf(rows, zr), rows, ids };
}
// remuestreo determinista de PARTIDOS completos (ambos equipos juntos): 2.000 remuestreos, PRNG mulberry32 con semilla fija; el intervalo describe la media por actuación de equipo, no un contraste de hipótesis
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function bootstrapMean(rows, value, B = 2000, seed = 20261024) {
  const byCase = new Map(); for (const r of rows) { const v = value(r); if (v == null) continue; const k = r[ci('case_id')]; const e = byCase.get(k) ?? byCase.set(k, { s: 0, n: 0 }).get(k); e.s += v; e.n += 1; }
  const games = [...byCase.values()]; if (!games.length) return null; const rnd = mulberry(seed); const means = [];
  for (let b = 0; b < B; b++) { let s = 0; let n = 0; for (let i = 0; i < games.length; i++) { const g = games[Math.floor(rnd() * games.length)]; s += g.s; n += g.n; } means.push(s / n); }
  means.sort((x, y) => x - y); return { lo: means[Math.floor(0.025 * B)], hi: means[Math.ceil(0.975 * B) - 1] };
}
const per40Of = (cols) => (r) => { const d = r[ci('duration_s')]; if (!(d > 0)) return null; let v = 0; for (const k of cols) { const x = r[ci(k)]; if (x == null) return null; v += x; } return (v * 2400) / d; };

// ---------------------------------------------------------------------------------------------------------------------------------- 06 comparativa del acta (DEV y VAL): DET, condiciones SIM, delta, error, banda y cumplimiento por métrica
const cols06 = ['block', 'metric', 'kind', 'label', 'condition', 'det_mean40', 'sim_mean40', 'delta', 'error', 'band', 'meets_band', 'status', 'det_real', 'sim_real', 'det_num', 'det_den', 'sim_num', 'sim_den', 'sim_ci95_lo', 'sim_ci95_hi', 'det_ci95_lo', 'det_ci95_hi', 'in_comparable_M04E', 'n_team_games', 'cases', 'note'];
const rows06 = []; const m04d = {}; const unitsNote = { count: 'media por actuación de equipo normalizada a 40 minutos; error relativo', rate: 'sumas completas de numeradores y denominadores; error en puntos porcentuales/100', share: 'cuota de FGA por zona; guarda funcional provisional de ±3 pp', forced: 'proporción de intentos en calidad forzada; diferencia informativa' };
for (const block of SETS) {
  const ids = caseIdsOf(block); const D = pop(block, 'detailed', 'DET', ids); if (!D.rows.length) continue; const exclude = S.COMPARABLE_EXCLUSIONS.map((x) => x.id);
  for (const cond of conds(block)) {
    const Sm = pop(block, 'sim', cond, ids); const common = new Set([...Sm.ids].filter((x) => D.ids.has(x))); const sp = S.populationOf(Sm.rows.filter((r) => common.has(r[ci('case_id')])), tables.zone.filter((r) => r[zc('resolver')] === 'sim' && r[zc('identity')] === cond && inB(block, r[zc('block')]) && common.has(r[zc('case_id')]))); const dp = S.populationOf(D.rows.filter((r) => common.has(r[ci('case_id')])), tables.zone.filter((r) => r[zc('resolver')] === 'detailed' && r[zc('identity')] === 'DET' && inB(block, r[zc('block')]) && common.has(r[zc('case_id')])));
    const errs = S.errorsOf(sp, dp); const both = S.scoreBoth(errs); m04d[`${block}|${cond}`] = { M04E: both.full, M04E_comparable: both.comparable, eZ: S.eZOf(errs), outOfBand: S.outOfBand(errs), outOfBandComparable: S.outOfBand(errs, exclude), cases: common.size, teamGames: sp.n, sim: sp, det: dp, errors: errs };
    const simRows = Sm.rows.filter((r) => common.has(r[ci('case_id')])); const detRows = D.rows.filter((r) => common.has(r[ci('case_id')]));
    for (const e of errs) {
      const cnt = S.COUNTS.find((c) => c.id === e.id); const ciS = cnt ? bootstrapMean(simRows, per40Of(cnt.cols)) : null; const ciD = cnt ? bootstrapMean(detRows, per40Of(cnt.cols)) : null;
      rows06.push([block, e.id, e.kind, e.label, cond, r4(e.det), r4(e.sim), e.sim != null && e.det != null ? r4(e.sim - e.det) : null, r4(e.error), e.band, e.error == null || e.band == null ? null : (e.error <= e.band + 1e-12 ? 1 : 0), e.status, r4(e.detReal ?? null), r4(e.simReal ?? null), e.detNum ?? null, e.detDen ?? null, e.simNum ?? null, e.simDen ?? null, r4(ciS?.lo), r4(ciS?.hi), r4(ciD?.lo), r4(ciD?.hi), e.kind === 'forced' ? 0 : exclude.includes(e.id) ? 0 : 1, sp.n, common.size, unitsNote[e.kind]]);
    }
  }
}
writeFileSync(join(OUT, '06-COMPARATIVA-ACTA.csv'), csvText(cols06, rows06));
writeFileSync(join(OUT, '06b-M04E.json'), JSON.stringify({ schema: 'beM-sim04e-m04d/1', rules: S.RULES_ID, rulesSha256: JSON.parse(readFileSync(join(planDir, 'search-config.json'), 'utf8')).rulesSha256, note: 'M > 1 implica que alguna banda sigue incumplida; con la política común de crédito de rebote (REBCRED-SIM04E-R1) ORB, DREB y rebotes totales vuelven a ser comparables y no hay exclusiones (M completo = M comparable)', byBlockAndCondition: Object.fromEntries(Object.entries(m04d).map(([k, v]) => { const { sim: s, det: d, errors, ...r } = v; return [k, { ...r, errors: errors.map((e) => ({ id: e.id, kind: e.kind, sim: e.sim, det: e.det, simNum: e.simNum ?? null, simDen: e.simDen ?? null, detNum: e.detNum ?? null, detDen: e.detDen ?? null, error: e.error, band: e.band, status: e.status })) }]; })) }, null, 1));

// ---------------------------------------------------------------------------------------------------------------------------------- 07 tiro y zonas: aciertos/intentos, cuota, calidad forzada y error por zona y por contexto (czq)
const cols07 = ['block', 'condition', 'level', 'key', 'det_attempts', 'det_makes', 'sim_attempts', 'sim_makes', 'det_share', 'sim_share', 'det_pct', 'sim_pct', 'pct_error', 'det_forced_share', 'sim_forced_share', 'note'];
const rows07 = []; const qz = (n) => COLS.czq.indexOf(n);
for (const block of SETS) { const ids = new Set(caseIdsOf(block)); const dz = {}; const sz = {};
  const acc = (tab, res, id, into) => { for (const r of tables.zone) { if (r[zc('resolver')] !== res || r[zc('identity')] !== id || !inB(block, r[zc('block')]) || !ids.has(r[zc('case_id')])) continue; const z = r[zc('zone')]; const x = (into[z] ??= { a: 0, m: 0, f: 0 }); x.a += r[zc('attempts')] ?? 0; x.m += r[zc('makes')] ?? 0; x.f += r[zc('q_forced')] ?? 0; } };
  acc(tables, 'detailed', 'DET', dz); const dTot = Object.values(dz).reduce((s, x) => s + x.a, 0); if (!dTot) continue;
  for (const cond of conds(block)) { const s = {}; acc(tables, 'sim', cond, s); const sTot = Object.values(s).reduce((a, x) => a + x.a, 0); for (const z of S.ZONES) { const d = dz[z] ?? { a: 0, m: 0, f: 0 }; const x = s[z] ?? { a: 0, m: 0, f: 0 }; rows07.push([block, cond, 'zona', z, d.a, d.m, x.a, x.m, r4(d.a / dTot), r4(sTot ? x.a / sTot : null), r4(d.a ? d.m / d.a : null), r4(x.a ? x.m / x.a : null), r4(d.a && x.a ? Math.abs(d.m / d.a - x.m / x.a) : null), r4(d.a ? d.f / d.a : null), r4(x.a ? x.f / x.a : null), 'cuota sobre FGA válido; pct = aciertos/intentos de la zona']); }
    // contexto × zona (czq), mismo universo
    const agg = (res, id) => { const o = {}; for (const r of tables.czq) { if (r[qz('resolver')] !== res || r[qz('identity')] !== id || !inB(block, r[qz('block')]) || !ids.has(r[qz('case_id')]) || r[qz('attempts')] == null) continue; const k = `${r[qz('context')]}|${r[qz('zone')]}`; const x = (o[k] ??= { a: 0, m: 0 }); x.a += r[qz('attempts')]; x.m += r[qz('makes')]; } return o; };
    const dc = agg('detailed', 'DET'); const sc = agg('sim', cond); for (const k of [...new Set([...Object.keys(dc), ...Object.keys(sc)])].sort()) { const d = dc[k] ?? { a: 0, m: 0 }; const x = sc[k] ?? { a: 0, m: 0 }; rows07.push([block, cond, 'contexto|zona', k, d.a, d.m, x.a, x.m, null, null, r4(d.a ? d.m / d.a : null), r4(x.a ? x.m / x.a : null), r4(d.a && x.a ? Math.abs(d.m / d.a - x.m / x.a) : null), null, null, 'contextos nativos; no equivalen uno a uno (SIM: organized/transition/spontaneous/putback; detallado: organizado/transición/temprano/saque/continuidad)']); } } }
writeFileSync(join(OUT, '07-TIRO-Y-ZONAS.csv'), csvText(cols07, rows07));

// ---------------------------------------------------------------------------------------------------------------------------------- 08 rebotes: embudo de oportunidades y créditos por actuación de equipo (media) y probabilidad condicional entre oportunidades compatibles
const rb = (n) => COLS.rebopp.indexOf(n); const credCols = COLS.rebopp.filter((c) => c.startsWith('credits_') || c.startsWith('uncredited_'));
const cols08 = ['block', 'condition', 'team_games', 'fg_miss_valid', 'blocked', 'blocked_out_of_bounds_or_throwin', 'blocked_live', 'shoot_foul_miss_no_fga', 'ft_last_miss_live', ...credCols, 'credited_total', 'orb_credited', 'drb_credited', 'p_off_given_credited', 'uncredited_total', 'note']; const rows08 = [];
for (const block of SETS) { const ids = new Set(caseIdsOf(block)); for (const [res, cond] of [['detailed', 'DET'], ...conds(block).map((c) => ['sim', c])]) { const rs = tables.rebopp.filter((r) => r[rb('resolver')] === res && r[rb('identity')] === cond && inB(block, r[rb('block')]) && ids.has(r[rb('case_id')]) && r[rb('fg_miss_valid')] != null); if (!rs.length) continue; const n = rs.length; const s = (name) => rs.reduce((a, r) => a + (r[rb(name)] ?? 0), 0);
    const cred = credCols.filter((c) => c.startsWith('credits_')); const credTot = cred.reduce((a, c) => a + s(c), 0); const orb = cred.filter((c) => c.includes('_off_')).reduce((a, c) => a + s(c), 0); const drb = credTot - orb; const unc = credCols.filter((c) => c.startsWith('uncredited_')).reduce((a, c) => a + s(c), 0);
    rows08.push([block, cond, n, ...['fg_miss_valid', 'blocked', 'blocked_out_of_bounds', 'blocked_live', 'shoot_foul_miss_no_fga', 'ft_last_miss_live'].map((c) => r3(s(c) / n)), ...credCols.map((c) => r3(s(c) / n)), r3(credTot / n), r3(orb / n), r3(drb / n), r4(credTot ? orb / credTot : null), r3(unc / n), res === 'sim' ? 'SIM: crédito de rebote para todo fallo con oportunidad (también tapón con balón vivo y últimos libres); tapón fuera = sin oportunidad; medias por actuación de equipo (equipo que tira)' : 'detallado: sin crédito tras tapón con balón vivo ni tras expiración de posesión tras fallo; medias por actuación de equipo (equipo que tira)']); } }
writeFileSync(join(OUT, '08-REBOTES-Y-RECUPERACIONES.csv'), csvText(cols08, rows08));

// ---------------------------------------------------------------------------------------------------------------------------------- 09 asistencias: cuatro universos separados + embudo de elegibilidad (SIM) + AST a libres y total beM nombrado
const au = (n) => COLS.astu.indexOf(n); const cols09 = ['block', 'condition', 'universe', 'fgm', 'ast_fg', 'ast_fg_per_fgm', 'team_games', 'correspondence', 'note']; const rows09 = [];
for (const block of SETS) { const ids = new Set(caseIdsOf(block)); for (const [res, cond] of [['detailed', 'DET'], ...conds(block).map((c) => ['sim', c])]) { const rs = tables.astu.filter((r) => r[au('resolver')] === res && r[au('identity')] === cond && inB(block, r[au('block')]) && ids.has(r[au('case_id')]) && r[au('fgm')] != null); if (!rs.length) continue; const by = {}; for (const r of rs) { const x = (by[r[au('universe')]] ??= { f: 0, a: 0, n: 0 }); x.f += r[au('fgm')]; x.a += r[au('ast_fg')]; x.n += 1; }
    for (const [u, x] of Object.entries(by)) rows09.push([block, cond, u, x.f, x.a, r4(x.f ? x.a / x.f : null), x.n, res === 'sim' ? 'rama decidida (inmediata / reinicio)' : (u === 'posterior_inmediata' || u === 'posterior_reinicio' ? 'APROXIMADA: contexto continuidad / otro tras el primer ORB de la posesión' : 'exacta (posición en la secuencia)'), 'AST a canasta únicamente; AST a libres y total beM se conservan aparte en 05-ACTA-EQUIPOS.csv (ast_ft, ast_total)']); } }
const fun = (n) => COLS.funnel.indexOf(n); for (const block of SETS) { const ids = new Set(caseIdsOf(block)); for (const cond of conds(block)) { const by = {}; for (const r of tables.funnel) { if (r[fun('resolver')] !== 'sim' || r[fun('identity')] !== cond || !inB(block, r[fun('block')]) || !ids.has(r[fun('case_id')]) || r[fun('opportunities')] == null) continue; const x = (by[r[fun('class')]] ??= { o: 0, e: 0, d: 0, b: 0, a: 0 }); x.o += r[fun('opportunities')]; x.e += r[fun('eligible')]; x.d += r[fun('delivered')]; x.b += r[fun('eligible_baskets')]; x.a += r[fun('fg_assists')]; }
  for (const [cls, x] of Object.entries(by)) rows09.push([block, cond, `embudo:${cls}`, x.b, x.a, r4(x.b ? x.a / x.b : null), null, 'SIM', `oportunidades ${x.o} · elegibles ${x.e} · entregas ${x.d} · canastas elegibles ${x.b} · AST ${x.a}`]); } }
writeFileSync(join(OUT, '09-ASISTENCIAS.csv'), csvText(cols09, rows09));

// ---------------------------------------------------------------------------------------------------------------------------------- 10 equipos, uso y distribución: por equipo y condición (media de puntos, margen, jugadores, minutos), bandas de puntos, prórrogas y contrastes
const sm = summaries(tables.team); writeFileSync(join(OUT, '10-EQUIPOS-USO-Y-DISTRIBUCION.csv'), csvText(sm.cols, sm.rows)); writeFileSync(join(OUT, '10b-BANDAS-DE-PUNTOS.csv'), csvText(sm.bands.cols, sm.bands.rows));
const ct = contrasts(tables.team); writeFileSync(join(OUT, '10c-CONTRASTES.csv'), csvText(ct.cols, ct.rows)); writeFileSync(join(OUT, '10d-CONTRASTES-AGREGADO.csv'), csvText(ct.aggCols, ct.aggRows));
for (const name of ['player', 'zone', 'family', 'quintet', 'defense', 'period', 'decision', 'director', 'subs', 'funnel', 'rebound', 'rebopp', 'astu', 'tovf']) writeFileSync(join(OUT, `tabla-${name}.csv`), csvText(COLS[name], tables[name]));
writeFileSync(join(OUT, 'tabla-czq.csv.gz'), gzipSync(csvText(COLS.czq, tables.czq)));
// 10e jerarquía: margen medio por equipo (VAL04D, ambas orientaciones) en el detallado y en cada condición SIM, con su puesto y el cambio de puesto. Con dieciséis actuaciones por equipo no certifica una clasificación.
{ const rowsH = []; const ids = new Set(caseIdsOf('VAL')); const margin = (res, id) => { const m = new Map(); for (const r of tables.team) { if (r[ci('block')] !== 'VAL' || r[ci('resolver')] !== res || r[ci('identity')] !== id || r[ci('status')] !== 'finished' || r[ci('valid')] !== 1 || !ids.has(r[ci('case_id')])) continue; const e = m.get(r[ci('team_id')]) ?? m.set(r[ci('team_id')], { s: 0, n: 0 }).get(r[ci('team_id')]); e.s += r[ci('diff')]; e.n += 1; } return m; };
  const dm = margin('detailed', 'DET'); const rank = (m) => { const a = [...m].map(([t, e]) => [t, e.s / e.n]).sort((x, y) => y[1] - x[1]); return new Map(a.map(([t], i) => [t, i + 1])); }; const dr = rank(dm);
  for (const cond of conds('VAL')) { const sm2 = margin('sim', cond); const sr = rank(sm2); for (const [t, e] of dm) { const x = sm2.get(t); rowsH.push([cond, t, e.n, r3(e.s / e.n), dr.get(t), x ? x.n : null, x ? r3(x.s / x.n) : null, sr.get(t) ?? null, x ? sr.get(t) - dr.get(t) : null, 'margen medio por actuación de equipo (puntos); puesto 1 = mayor margen; sin certificar una clasificación con dieciséis partidos por equipo']); } }
  writeFileSync(join(OUT, '10e-JERARQUIA.csv'), csvText(['condition', 'team', 'det_games', 'det_mean_margin', 'det_rank', 'sim_games', 'sim_mean_margin', 'sim_rank', 'rank_change', 'note'], rowsH)); }
console.log(JSON.stringify({ report: OUT, simRecords: sim.length, detRecords: det.length, rows06: rows06.length, M04E: Object.fromEntries(Object.entries(m04d).map(([k, v]) => [k, { full: v.M04E.partialM, comparable: v.M04E_comparable.M, dominant: v.M04E_comparable.dominant }])) }));
