// SIM-MOTOR-04E · selector mecánico de la candidata (§8 y §10). Funciones PURAS sobre poblaciones de actuaciones de equipo (SIM o detallado) derivadas de los registros: se recalculan desde numeradores y denominadores sin volver a
// simular (el comprobador de entrega lo hace). Solo PROPONE un vector: no declara «calibrado». Reglas, dominios, pasos, agenda y presupuesto se guardan con hash ANTES de ejecutar el ajuste; VAL04E no participa en ninguna decisión.
//   Objetivo ±5 % RELATIVO en conteos (medias por actuación de equipo normalizadas a 40 minutos), ±3 PUNTOS PORCENTUALES en porcentajes de acierto y guarda funcional provisional de ±3 pp por cuota de zona.
import { createHash } from 'node:crypto';
import { COLS } from './tables.js';

export const RULES_ID = 'SEL-SIM04E-R1';
export const BAND_COUNT = 0.05; export const BAND_RATE = 0.03; export const BAND_SHARE = 0.03;
// Métricas del cuadro principal (§8.2). `col`: columna de COLS.team; las compuestas declaran su fórmula.
export const COUNTS = [
  { id: 'pts', label: 'Puntos', cols: ['pts'] }, { id: 'fgm', label: 'FGM', cols: ['fgm'] }, { id: 'fga', label: 'FGA', cols: ['fga'] },
  { id: 'fg2m', label: '2PM', cols: ['fg2m'] }, { id: 'fg2a', label: '2PA', cols: ['fg2a'] }, { id: 'fg3m', label: '3PM', cols: ['fg3m'] }, { id: 'fg3a', label: '3PA', cols: ['fg3a'] },
  { id: 'ftm', label: 'FTM', cols: ['ftm'] }, { id: 'fta', label: 'FTA', cols: ['fta'] },
  { id: 'oreb', label: 'ORB', cols: ['oreb_total'] }, { id: 'dreb', label: 'DREB', cols: ['dreb_total'] }, { id: 'reb', label: 'Rebotes totales', cols: ['oreb_total', 'dreb_total'] },
  { id: 'ast_fg', label: 'AST a canasta', cols: ['ast_fg'] }, { id: 'ast_ft', label: 'AST a libres', cols: ['ast_ft'] }, { id: 'ast_total', label: 'AST total beM (canasta + libres)', cols: ['ast_total'] },
  { id: 'tov', label: 'Pérdidas totales', cols: ['tov_total'] }, { id: 'stl', label: 'Robos', cols: ['stl'] }, { id: 'blk', label: 'Tapones', cols: ['blk'] },
  { id: 'pf', label: 'Faltas cometidas', cols: ['pf'] }, { id: 'pfd', label: 'Faltas recibidas', cols: ['pfd'] },
];
export const RATES = [
  { id: 'fg_pct', label: 'Campo', num: ['fgm'], den: ['fga'] }, { id: 'two_pct', label: 'Dos', num: ['fg2m'], den: ['fg2a'] }, { id: 'three_pct', label: 'Tres', num: ['fg3m'], den: ['fg3a'] }, { id: 'ft_pct', label: 'Libres', num: ['ftm'], den: ['fta'] },
  { id: 'rim_pct', label: 'Aro', num: ['rim_m'], den: ['rim_a'] }, { id: 'inside_pct', label: 'Inside sin aro', num: ['inside_m'], den: ['inside_a'] }, { id: 'mid_pct', label: 'Media distancia', num: ['midrange_m'], den: ['midrange_a'] },
];
export const SHARES = [
  { id: 'rim_share', label: 'Cuota aro', zone: 'rim' }, { id: 'inside_share', label: 'Cuota inside', zone: 'inside' }, { id: 'mid_share', label: 'Cuota media', zone: 'midrange' }, { id: 'three_share', label: 'Cuota triple', zone: 'three' },
];
// SIM-MOTOR-04E (§6.2, §8.3): ya existe una política común de crédito de rebote (REBCRED-SIM04E-R1), de modo que ORB, DREB y rebotes totales vuelven a ser comparables: NO hay exclusiones.
export const COMPARABLE_EXCLUSIONS = [];
export const CONSERVED_FORCED = [{ id: 'forced_rim', zone: 'rim' }, { id: 'forced_inside', zone: 'inside' }];

// ---------------------------------------------------------------------------------------------------------------------------------- poblaciones
const ci = (n) => COLS.team.indexOf(n); const zi = (n) => COLS.zone.indexOf(n);
const sumBy = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
const mean = (xs) => { const a = xs.filter((x) => x != null && Number.isFinite(x)); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };
const per40 = (r, cols) => { const d = r[ci('duration_s')]; if (!(d > 0)) return null; let v = 0; for (const c of cols) { const x = r[ci(c)]; if (x == null) return null; v += x; } return (v * 2400) / d; };
export const ZONES = ['rim', 'inside', 'midrange', 'three'];
// Filas de equipo terminadas y válidas del conjunto de casos, resolutor e identidad. Una no terminada o no válida NO entra y se declara aparte (sin borrar su resultado).
export function linesOf(tables, caseIds, resolver, identity = null) {
  const want = new Set(caseIds); const rows = []; const excluded = [];
  for (const r of tables.team) { if (r[ci('resolver')] !== resolver || !want.has(r[ci('case_id')])) continue; if (identity && r[ci('identity')] !== identity) continue; if (r[ci('status')] !== 'finished' || r[ci('valid')] !== 1) { if (r[ci('team_index')] === 0) excluded.push({ case: r[ci('case_id')], why: r[ci('status')] !== 'finished' ? `estado ${r[ci('status')]}` : 'no válido' }); continue; } rows.push(r); }
  return { rows, excluded };
}
// Población: medias reales y normalizadas a 40 min de cada conteo, sumas completas de numeradores/denominadores y la calidad forzada de aro e inside (de las filas de zona del mismo conjunto).
export function populationOf(rows, zoneRows = []) {
  const n = rows.length; const noOT = rows.filter((r) => !(r[ci('overtimes')] > 0)); const colsAll = [...new Set([...COUNTS.flatMap((c) => c.cols), ...RATES.flatMap((r) => [...r.num, ...r.den]), 'fga', 'rim_a', 'inside_a', 'midrange_a', 'three_a'])];
  const sums = Object.fromEntries(colsAll.map((c) => [c, sumBy(rows, (r) => r[ci(c)] ?? 0)]));
  const counts = Object.fromEntries(COUNTS.map((c) => [c.id, { mean40: mean(rows.map((r) => per40(r, c.cols))), meanReal: mean(rows.map((r) => c.cols.reduce((s, k) => s + (r[ci(k)] ?? 0), 0))), meanNoOT: mean(noOT.map((r) => c.cols.reduce((s, k) => s + (r[ci(k)] ?? 0), 0))) }]));
  const zq = (z) => { const rs = zoneRows.filter((r) => r[zi('zone')] === z); return { att: sumBy(rs, (r) => r[zi('attempts')] ?? 0), forced: sumBy(rs, (r) => r[zi('q_forced')] ?? 0) }; };
  return { n, games: n / 2, nNoOT: noOT.length, sums, counts, forced: { rim: zq('rim'), inside: zq('inside') } };
}
const ratio = (a, b) => (b > 0 ? a / b : null);
const rateOf = (pop, r) => ({ num: sumBy(r.num, (c) => pop.sums[c]), den: sumBy(r.den, (c) => pop.sums[c]) });

// ---------------------------------------------------------------------------------------------------------------------------------- errores y M04E
// Devuelve una fila por métrica con valores SIM/DET, error, banda y estado ('ok', 'ceros_iguales', 'no_evaluado_relativo', 'sin_denominador').
export function errorsOf(sim, det) {
  const out = [];
  for (const c of COUNTS) {
    const s = sim.counts[c.id].mean40; const d = det.counts[c.id].mean40; const row = { id: c.id, kind: 'count', label: c.label, sim: s, det: d, simReal: sim.counts[c.id].meanReal, detReal: det.counts[c.id].meanReal, band: BAND_COUNT, error: null, abs: null, status: 'ok' };
    if (s == null || d == null) row.status = 'sin_denominador'; else if (d === 0 && s === 0) { row.error = 0; row.abs = 0; row.status = 'ceros_iguales'; } else if (d === 0) { row.abs = Math.abs(s - d); row.status = 'no_evaluado_relativo'; } else { row.error = Math.abs(s / d - 1); row.abs = Math.abs(s - d); }
    out.push(row);
  }
  for (const r of RATES) {
    const s = rateOf(sim, r); const d = rateOf(det, r); const ps = ratio(s.num, s.den); const pd = ratio(d.num, d.den); const row = { id: r.id, kind: 'rate', label: r.label, sim: ps, det: pd, simNum: s.num, simDen: s.den, detNum: d.num, detDen: d.den, band: BAND_RATE, error: ps == null || pd == null ? null : Math.abs(ps - pd), status: ps == null || pd == null ? 'sin_denominador' : 'ok' };
    out.push(row);
  }
  for (const sh of SHARES) {
    const sa = sim.sums[`${sh.zone}_a`]; const da = det.sums[`${sh.zone}_a`]; const ps = ratio(sa, sim.sums.fga); const pd = ratio(da, det.sums.fga);
    out.push({ id: sh.id, kind: 'share', label: sh.label, sim: ps, det: pd, simNum: sa, simDen: sim.sums.fga, detNum: da, detDen: det.sums.fga, band: BAND_SHARE, error: ps == null || pd == null ? null : Math.abs(ps - pd), status: ps == null || pd == null ? 'sin_denominador' : 'ok' });
  }
  for (const f of CONSERVED_FORCED) {
    const s = sim.forced[f.zone]; const d = det.forced[f.zone]; const ps = ratio(s.forced, s.att); const pd = ratio(d.forced, d.att);
    out.push({ id: f.id, kind: 'forced', label: `Calidad forzada ${f.zone}`, sim: ps, det: pd, simNum: s.forced, simDen: s.att, detNum: d.forced, detDen: d.att, band: null, error: ps == null || pd == null ? null : Math.abs(ps - pd), status: ps == null || pd == null ? 'sin_denominador' : 'ok' });
  }
  return out;
}
export const eZOf = (errs) => { const sh = errs.filter((e) => e.kind === 'share'); return sh.some((e) => e.error == null) ? null : sh.reduce((s, e) => s + e.error, 0); };
// ---------------------------------------------------------------------------------------------------------------------------------- M y función auxiliar L_search (§8.3, §10.1)
// M = max(r_i), r_i = error_i / banda_i sobre las métricas del cuadro (31 evaluables). `missing`: sin error evaluable (impide la selección; nunca se aprueba por omisión).
export function scoreM(errs, exclude = []) {
  const ex = new Set(exclude); const comps = []; const missing = [];
  for (const e of errs) { if (e.kind === 'forced' || ex.has(e.id)) continue; if (e.error == null) { missing.push({ id: e.id, status: e.status }); continue; } comps.push({ id: e.id, kind: e.kind, error: e.error, band: e.band, ratio: e.error / e.band }); }
  let M = null; let dominant = null; for (const c of comps) if (M == null || c.ratio > M) { M = c.ratio; dominant = c.id; }
  const violated = comps.filter((c) => c.ratio > 1 + 1e-12).length; const n = comps.length;
  const L = n ? comps.reduce((s, c) => s + Math.max(c.ratio - 1, 0) ** 2, 0) / n + 0.05 * (comps.reduce((s, c) => s + c.ratio ** 2, 0) / n) : null; // función auxiliar de exploración: no cambia bandas ni sustituye a M
  return { M: missing.length ? null : M, partialM: M, dominant, comps, missing, violated, n, L };
}
export const scoreBoth = (errs) => { const s = scoreM(errs, []); return { full: s, comparable: s }; };
export const outOfBand = (errs, exclude = []) => errs.filter((e) => e.kind !== 'forced' && !exclude.includes(e.id) && e.error != null && e.error > e.band + 1e-12).map((e) => ({ id: e.id, kind: e.kind, error: e.error, band: e.band, short: e.kind === 'count' ? `${(100 * (e.error - e.band)).toFixed(2)} puntos relativos` : `${(100 * (e.error - e.band)).toFixed(2)} pp` }));
