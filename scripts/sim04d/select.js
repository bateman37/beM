// SIM-MOTOR-04D · selector mecánico de la candidata (§7–§8). Funciones PURAS sobre poblaciones de actuaciones de equipo (SIM o detallado) derivadas de los registros: se recalculan desde numeradores y denominadores sin volver a
// simular (el comprobador de entrega lo hace). Solo PROPONE un vector: no declara «calibrado». Las reglas, los 36 vectores y su hash se guardan ANTES de ejecutar DEV; VAL no participa en ninguna decisión.
//   Objetivo ±5 % RELATIVO en conteos (medias por actuación de equipo normalizadas a 40 minutos), ±3 PUNTOS PORCENTUALES en porcentajes de acierto y guarda funcional provisional de ±3 pp por cuota de zona.
import { createHash } from 'node:crypto';
import { COLS } from './tables.js';

export const RULES_ID = 'SEL-SIM04D-R1';
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
// Exclusiones de M04D_comparable (§8.3): rebotes absolutos. Discrepancia de criterio demostrada (código de `resolveBlocked` y expiraciones tras fallo sin crédito de rebote en el detallado; SIM acredita todo fallo con oportunidad),
// documentada en `docs/tecnico/sim-motor04d.md`. No se excluye ninguna otra métrica.
export const COMPARABLE_EXCLUSIONS = [
  { id: 'oreb', reason: 'discrepancia de criterio de crédito de rebote (tapón con balón vivo y expiración tras fallo: sin crédito en el detallado, con crédito en SIM)' },
  { id: 'dreb', reason: 'ídem' }, { id: 'reb', reason: 'ídem' },
];
export const CONSERVED_FORCED = [{ id: 'forced_rim', zone: 'rim' }, { id: 'forced_inside', zone: 'inside' }];

// Filas que cambian respecto al control Z0-A0 y rango declarado de cada fila para la distancia normalizada del desempate (§8.3). Valores fijos y lecturas no cuentan.
export const ROWS = [
  { path: 'shotMix.rimWeightFactor', control: 1.5, range: 1.0, note: 'rango de búsqueda [1,5; 2,5]' },
  { path: 'rebound.organizedResetP0', control: 0.35, range: 0.5, note: '[0,35; 0,85]' },
  { path: 'shotMix.midrangeWeightFactor', control: 1, range: 1.75, note: 'rango de edición [0,25; 2]' },
  { path: 'shotMix.threeWeightFactor', control: 0.70, range: 0.10, note: '[0,60; 0,70]' },
  { path: 'conversion.simRimLogitOffset', control: 0, range: 0.25, note: '[0; 0,25] logit' },
  { path: 'assist.receivedAdvantageP0', control: 0, range: 1, note: '[0; 1]' },
  { path: 'assist.spontaneousPassOddsFactor', control: 1, range: 1, note: '[1; 2]' },
  { path: 'outcomes.simOrdinaryTurnoverWeightFactor', control: 1, range: 0.6, note: '[0,6; 1,2]' },
  { path: 'outcomes.simStealGivenEligibleTurnoverLogit', control: 0, range: 1, note: '[0; 1] logit' },
  { path: 'outcomes.simShootingFoulWeightFactor', control: 1, range: 0.5, note: '[0,8; 1,3]' },
];
// Filas fijas en toda la búsqueda (§6.2): ritmo, entrega final, energía, calidad de aro, calidad inside y conversión inside.
export const FIXED = [
  { path: 'volume.neutralSecondsPerControl', value: 19.5 }, { path: 'assist.eligibleFinalPassP0', value: 0.9 }, { path: 'energy.costPerLiveMinute', value: 3 },
  { path: 'opportunity.simRimQualityLogit', value: 0.5 }, { path: 'opportunity.simInsideQualityLogit', value: 0.5 }, { path: 'conversion.simInsideLogitOffset', value: 0.3 },
];
// §7.1: nueve configuraciones de zonas y continuación (peso aro, reinicio, peso media, peso triple, offset aro) y §7.2: cuatro de circulación y terminales (ventaja recibida, odds espontáneo, pérdida ordinaria, robo, falta)
export const ZS = [
  ['Z0', 1.5, 0.35, 1, 0.70, 0], ['Z1', 2, 0.65, 1, 0.70, 0], ['Z2', 2, 0.85, 1, 0.70, 0], ['Z3', 2, 0.65, 0.70, 0.70, 0.15], ['Z4', 2, 0.85, 0.70, 0.70, 0.15],
  ['Z5', 2, 0.65, 0.70, 0.60, 0.15], ['Z6', 2, 0.85, 0.70, 0.60, 0.15], ['Z7', 2.5, 0.65, 0.70, 0.60, 0.15], ['Z8', 2.5, 0.85, 0.70, 0.60, 0.15],
].map(([id, rim, reset, mid, three, off]) => ({ id, set: { 'shotMix.rimWeightFactor': rim, 'rebound.organizedResetP0': reset, 'shotMix.midrangeWeightFactor': mid, 'shotMix.threeWeightFactor': three, 'conversion.simRimLogitOffset': off } }));
export const AS = [
  ['A0', 0, 1, 1, 0, 1], ['A1', 0.5, 1.5, 0.85, 0.50, 1.10], ['A2', 1, 2, 0.80, 0.70, 1.10], ['A3', 1, 2, 0.85, 0.90, 1.20],
].map(([id, adv, odds, to, steal, sf]) => ({ id, set: { 'assist.receivedAdvantageP0': adv, 'assist.spontaneousPassOddsFactor': odds, 'outcomes.simOrdinaryTurnoverWeightFactor': to, 'outcomes.simStealGivenEligibleTurnoverLogit': steal, 'outcomes.simShootingFoulWeightFactor': sf } }));
export const CONTROL_ID = 'Z0-A0';
// 36 vectores COMPLETOS (9 × 4) en orden estable Z0-A0, Z0-A1, … Z8-A3. Cada uno lista TODAS las filas (fijas y buscadas); ningún componente se cambia después de ver resultados.
export const VECTORS = ZS.flatMap((z) => AS.map((a) => { const set = { ...z.set, ...a.set }; return { id: `${z.id}-${a.id}`, z: z.id, a: a.id, set, overrides: [...FIXED, ...ROWS.map((r) => ({ path: r.path, value: set[r.path] }))] }; }));
export const vectorById = (id) => VECTORS.find((v) => v.id === id) ?? null;
export const rowsChanged = (v) => ROWS.filter((r) => Math.abs((v.set[r.path] ?? r.control) - r.control) > 1e-9).length;
export const distance = (v) => ROWS.reduce((s, r) => s + Math.abs((v.set[r.path] ?? r.control) - r.control) / r.range, 0);

export const RULES = {
  id: RULES_ID, precision: 1e-9, minRelativeImprovement: 0.05, controlId: CONTROL_ID, vectors: VECTORS.length, simulationsMax: VECTORS.length * 48,
  bands: { counts: BAND_COUNT, rates: BAND_RATE, shares: BAND_SHARE },
  errors: {
    count: 'error_relativo = abs(media_SIM40 / media_DET40 − 1) sobre medias por actuación de equipo normalizadas a 40 minutos (valor × 2400 / duración deportiva del partido)',
    rate: 'error_tiro = abs(aciertos_SIM / intentos_SIM − aciertos_DET / intentos_DET) con sumas completas de numeradores y denominadores (puntos porcentuales/100)',
    share: 'error_cuota_zona = abs(FGA_z_SIM / FGA_SIM − FGA_z_DET / FGA_DET) (guarda funcional provisional de ±3 pp; NO es un ±3 % relativo fijado por Dennis)',
    eZ: 'métrica histórica Σ_z abs(cuota_SIM[z] − cuota_DET[z]); se publica pero no entra en M04D',
    forcedQuality: 'diferencia de la proporción de intentos en calidad forzada (aro e inside sin aro) frente al detallado',
    nullPolicy: 'denominador inexistente → null con causa; DET = 0 y SIM = 0 → igualdad de ceros (sin error relativo inventado); DET = 0 y SIM ≠ 0 → diferencia absoluta y no evaluado relativo (nunca aprobado por omisión)',
  },
  M04D: 'M04D = max(error_relativo_conteos / 0,05 ; error_acierto / 0,03 ; error_cuota_zona / 0,03); máximo, no suma; se publican todos los componentes y el dominante',
  M04D_comparable: 'mismo máximo sin las métricas del inventario de exclusiones (rebotes absolutos: ORB, DREB y totales) por la discrepancia demostrada de criterio de crédito; M04D completo se conserva como NO EVALUABLE y se publica aparte',
  exclusions: COMPARABLE_EXCLUSIONS,
  guards: 'siempre frente al control Z0-A0: conteo e ≤ max(0,05; e0 + 0,02) · acierto e ≤ max(0,03; e0 + 0,005) · cuota por zona e ≤ max(0,03; e0 + 0,01) · calidad forzada de aro e inside: |diferencia| ≤ |diferencia del control| + 0,02',
  invariants: 'créditos causales, ausencia de sujetos fantasma, identidad, aprendizaje e información pública no admiten tolerancia; un vector con algún caso fallido, no válido o sin DET comparable no es admisible',
  final: '1) descartar vectores con una guarda incumplida, métricas necesarias no evaluadas o invariantes rotos; 2) menor M04D_comparable entre los admisibles; proponer sustitución solo con mejora relativa ≥ 5 % frente al control; 3) empate (1e-9): menos filas modificadas respecto al control, menor distancia normalizada por rangos declarados e identificador lexicográfico; 4) sin mejora admisible se conserva el control y se entregan los mejores descartados con su causa',
  valUse: 'VAL04D no elige ni reajusta: ninguna regla lee resultados de VAL',
  comparableDecisionNote: 'Si ningún vector mejora de forma admisible, no hay rondas adicionales ni se combinan ganadores después de mirar VAL.',
  rows: ROWS, fixed: FIXED, zs: ZS, as: AS,
};
export const rulesHash = () => createHash('sha256').update(JSON.stringify(RULES)).digest('hex');

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

// ---------------------------------------------------------------------------------------------------------------------------------- errores y M04D
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
// M04D (todas las métricas del cuadro) y M04D_comparable (sin las exclusiones). `missing`: métricas necesarias sin error evaluable (impiden la selección; nunca se aprueban por omisión).
export function scoreM(errs, exclude = []) {
  const ex = new Set(exclude); const comps = []; const missing = [];
  for (const e of errs) { if (e.kind === 'forced' || ex.has(e.id)) continue; if (e.error == null) { missing.push({ id: e.id, status: e.status }); continue; } comps.push({ id: e.id, kind: e.kind, error: e.error, band: e.band, ratio: e.error / e.band }); }
  let M = null; let dominant = null; for (const c of comps) if (M == null || c.ratio > M) { M = c.ratio; dominant = c.id; }
  return { M: missing.length ? null : M, dominant, comps, missing, partialM: M };
}
export const scoreBoth = (errs) => ({ full: scoreM(errs, []), comparable: scoreM(errs, COMPARABLE_EXCLUSIONS.map((x) => x.id)) });
export const outOfBand = (errs, exclude = []) => errs.filter((e) => e.kind !== 'forced' && !exclude.includes(e.id) && e.error != null && e.error > e.band + 1e-12).map((e) => ({ id: e.id, kind: e.kind, error: e.error, band: e.band, short: e.kind === 'count' ? `${(100 * (e.error - e.band)).toFixed(2)} puntos relativos` : `${(100 * (e.error - e.band)).toFixed(2)} pp` }));

// ---------------------------------------------------------------------------------------------------------------------------------- guardas frente al control Z0-A0
export function guardsOf(control, cand) {
  const by = new Map(control.map((e) => [e.id, e])); const fails = []; const checks = [];
  for (const e of cand) {
    const c = by.get(e.id); if (!c) continue;
    if (e.kind === 'forced') { if (e.error == null || c.error == null) { fails.push({ id: e.id, why: 'calidad forzada no evaluable' }); continue; } const lim = c.error + 0.02; const ok = e.error <= lim + 1e-12; checks.push({ id: e.id, ok, error: e.error, limit: lim, control: c.error }); if (!ok) fails.push({ id: e.id, why: 'empeora más de 0,02 frente al control', error: e.error, limit: lim }); continue; }
    if (e.error == null || c.error == null) { fails.push({ id: e.id, why: `no evaluable (${e.status}/${c.status})` }); continue; }
    const lim = e.kind === 'count' ? Math.max(BAND_COUNT, c.error + 0.02) : e.kind === 'rate' ? Math.max(BAND_RATE, c.error + 0.005) : Math.max(BAND_SHARE, c.error + 0.01);
    const ok = e.error <= lim + 1e-12; checks.push({ id: e.id, ok, error: e.error, limit: lim, control: c.error }); if (!ok) fails.push({ id: e.id, why: 'guarda incumplida', error: e.error, limit: lim, control: c.error });
  }
  return { ok: fails.length === 0, fails, checks };
}

// ---------------------------------------------------------------------------------------------------------------------------------- selección final
// `control`: { id, errs, M } ; `cands`: [{ id, set, errs, M, invariantsOk, missing }] (M = M04D_comparable). Devuelve la elección, las razones y la tabla completa de descarte.
export function selectFinal(control, cands, { exclude = COMPARABLE_EXCLUSIONS.map((x) => x.id) } = {}) {
  const rows = cands.map((c) => {
    const sc = scoreM(c.errs, exclude); const g = guardsOf(control.errs, c.errs); const reasons = [];
    if (!c.invariantsOk) reasons.push('invariantes o casos no válidos'); if (sc.missing.length) reasons.push(`métricas no evaluadas: ${sc.missing.map((m) => m.id).join(',')}`); if (!g.ok) reasons.push(`guardas: ${g.fails.map((f) => f.id).join(',')}`);
    const v = vectorById(c.id) ?? { set: c.set ?? {} };
    return { id: c.id, M: sc.M, dominant: sc.dominant, admissible: reasons.length === 0, reasons, guards: g, rowsChanged: rowsChanged(v), distance: distance(v) };
  });
  const adm = rows.filter((r) => r.admissible && r.M != null).sort((a, b) => (Math.abs(a.M - b.M) > RULES.precision ? a.M - b.M : a.rowsChanged - b.rowsChanged || (Math.abs(a.distance - b.distance) > RULES.precision ? a.distance - b.distance : 0) || (a.id < b.id ? -1 : 1)));
  const ctl = scoreM(control.errs, exclude); const best = adm[0] ?? null;
  const improvement = best && ctl.M ? (ctl.M - best.M) / ctl.M : null;
  const replace = !!(best && ctl.M != null && improvement >= RULES.minRelativeImprovement - 1e-12);
  return { chosenId: replace ? best.id : control.id, kept: !replace, control: { id: control.id, M: ctl.M, dominant: ctl.dominant }, best: best ? { id: best.id, M: best.M, dominant: best.dominant, improvement } : null, rows, reason: replace ? `${best.id} mejora M04D_comparable un ${(100 * improvement).toFixed(2)} % (≥ 5 %) y cumple todas las guardas frente al control` : best ? `ninguna mejora admisible ≥ 5 % (mejor admisible ${best.id}: ${(100 * (improvement ?? 0)).toFixed(2)} %); se conserva el control` : 'ningún vector admisible; se conserva el control' };
}
