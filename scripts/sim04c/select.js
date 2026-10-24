// SIM-MOTOR-04C · selector mecánico de la candidata (§7–§8). Funciones PURAS sobre las tablas de equipo/zona/jugador/contexto derivadas de los registros de CAL (con sus anclas detalladas): se pueden recalcular desde
// numeradores y denominadores sin volver a simular (el comprobador de entrega lo hace). Solo PROPONE un vector: no declara «calibrado». Las reglas, etapas, agenda y su hash se guardan ANTES de ejecutar CAL.
// Ocho errores SEPARADOS contra DET, guardas UNIFORMES frente a N04C (sin segunda guarda acumulada de tolerancia cero, sin acumular márgenes entre etapas) y M = max(e/b). VAL no participa en ninguna decisión.
import { createHash } from 'node:crypto';
import { COLS } from './tables.js';

export const RULES_ID = 'SEL-SIM04C-R1';
export const BAND = { eP: 0.08, eF: 0.08, eZ: 0.10, e2: 0.04, eR: 0.05, eI: 0.05, eQ: 0.05, eA: 0.08 };
export const M_KEYS = ['eP', 'eF', 'eZ', 'e2', 'eR', 'eI', 'eQ', 'eA'];
// Puntos fijos en toda la búsqueda (§7.1)
export const FIXED = [{ path: 'volume.neutralSecondsPerControl', value: 19.5 }, { path: 'shotMix.threeWeightFactor', value: 0.7 }, { path: 'assist.eligibleFinalPassP0', value: 0.9 }, { path: 'energy.costPerLiveMinute', value: 3 }, { path: 'assist.receivedAdvantageP0', value: 0 }];
// Filas buscadas, su neutral y el rango autorizado (para el desempate por distancia normalizada)
export const ROWS = [
  { path: 'shotMix.rimWeightFactor', neutral: 1, range: 0.5, note: 'rango autorizado [1; 1,5] (solo se evalúa 1,5)' },
  { path: 'opportunity.simRimQualityLogit', neutral: 0, range: 0.5, note: '[0; 0,5] logit' },
  { path: 'rebound.organizedResetP0', neutral: 0, range: 1, note: '[0; 1]' },
  { path: 'opportunity.simInsideQualityLogit', neutral: 0, range: 1, note: '[0; 1] logit' },
  { path: 'conversion.simInsideLogitOffset', neutral: 0, range: 0.3, note: '[0; 0,30] logit' },
];
const vec = (o = {}) => ROWS.map((r) => ({ path: r.path, value: o[r.path] ?? r.neutral }));
const RW = 'shotMix.rimWeightFactor'; const RQ = 'opportunity.simRimQualityLogit'; const RS = 'rebound.organizedResetP0'; const IQ = 'opportunity.simInsideQualityLogit'; const IC = 'conversion.simInsideLogitOffset';
// Hasta ocho vectores adicionales COMPLETOS. `parent`: de dónde hereda las filas no indicadas. Las etapas I y P heredan del punto de trabajo (R o I) y se ejecutan solo si su condición se cumple.
export const AGENDA = [
  { id: 'J0', stage: 'R', parent: 'N04C', set: { [RW]: 1.5, [RQ]: 0.5, [RS]: 0 } },
  { id: 'R35', stage: 'R', parent: 'N04C', set: { [RW]: 1.5, [RQ]: 0.5, [RS]: 0.35 } },
  { id: 'R65', stage: 'R', parent: 'N04C', set: { [RW]: 1.5, [RQ]: 0.5, [RS]: 0.65 } },
  { id: 'R85', stage: 'R', parent: 'N04C', set: { [RW]: 1.5, [RQ]: 0.5, [RS]: 0.85 } },
  { id: 'I50', stage: 'I', parent: 'punto R', set: { [IQ]: 0.5 }, condition: 'punto R con eI > 0,05 o |Δ proporción de calidad forzada de inside| > 0,05' },
  { id: 'I100', stage: 'I', parent: 'punto R', set: { [IQ]: 1.0 }, condition: 'ídem I50' },
  { id: 'P15', stage: 'P', parent: 'punto I', set: { [IC]: 0.15 }, condition: 'punto I con eI > 0,05, ≥ 80 FGA inside de calidad normal por modelo en CAL y FG%_DET_normal_inside − FG%_SIM_normal_inside > 0,03' },
  { id: 'P30', stage: 'P', parent: 'punto I', set: { [IC]: 0.30 }, condition: 'ídem P15' },
];
export const RULES = {
  id: RULES_ID, maxAdditionalVectors: 8, precision: 1e-9, minRelativeImprovement: 0.05, band: BAND,
  errors: {
    eP: 'abs(meanPTS40_SIM / meanPTS40_DET − 1); medias por actuación de equipo normalizadas a 40 min (valor × 2400 / duración deportiva)',
    eF: 'abs(meanFGA40_SIM / meanFGA40_DET − 1); mismas normalizaciones',
    eZ: 'Σ_z abs(shareFGA_SIM[z] − shareFGA_DET[z]) en las cuatro zonas (sumas de numeradores y denominadores)',
    e2: 'abs(Σ2PM_SIM/Σ2PA_SIM − Σ2PM_DET/Σ2PA_DET)',
    eR: 'abs(ΣrimM_SIM/ΣrimA_SIM − ΣrimM_DET/ΣrimA_DET)',
    eI: 'abs(ΣinsideM_SIM/ΣinsideA_SIM − ΣinsideM_DET/ΣinsideA_DET), zona inside sin aro',
    eQ: 'abs(forcedRimShare_SIM − forcedRimShare_DET), con forcedRimShare = intentos al aro en calidad forzada / intentos al aro',
    eA: 'abs(ΣAST_FG_SIM/ΣFGM_SIM − ΣAST_FG_DET/ΣFGM_DET), AST_FG acreditadas del acta',
    e3: 'abs(Σ3PM/Σ3PA_SIM − Σ3PM/Σ3PA_DET)', eFT: 'abs(ΣFTM/ΣFTA_SIM − ΣFTM/ΣFTA_DET)',
    forcedInside: 'abs(forcedInsideShare_SIM − forcedInsideShare_DET), intentos inside en calidad forzada / intentos inside',
    freq40: 'fracción de actuaciones de equipo con algún jugador ≥ 40 min (2400 s) en partidos SIN prórroga (informativo)',
  },
  M: 'M = max(eP/0,08; eF/0,08; eZ/0,10; e2/0,04; eR/0,05; eI/0,05; eQ/0,05; eA/0,08); se conservan los componentes y el error dominante',
  guards: 'frente al MISMO N04C (e0), uniformes, sin acumular márgenes: eP/eF ≤ max(0,08; e0+0,02) · eZ ≤ e0+0,02 · e2 ≤ max(0,04; e0+0,015) · eR/eI/eQ ≤ max(0,05; e0+0,02) · eA ≤ max(0,08; e0+0,02) · e3 ≤ max(0,05; e3_0+0,015) · eFT ≤ max(0,04; eFT_0+0,02)',
  workingPointR: 'menor M entre J0/R35/R65/R85 con todos los errores evaluados e invariantes correctas (puede incumplir guardas: explora, no activa); desempate del selector final',
  stageI: 'I50/I100 solo si el punto R tiene eI > 0,05 o |Δ calidad forzada inside| > 0,05; punto I = menor M entre el punto R y los I ejecutados',
  stageP: 'P15/P30 solo si el punto I tiene eI > 0,05, ≥ 80 FGA inside de calidad normal por modelo en CAL y FG%_DET_normal_inside − FG%_SIM_normal_inside > 0,03 (regla funcional de búsqueda, no significación)',
  final: '1) descartar vectores que fallen una guarda, tengan errores necesarios no evaluados o incumplan invariantes; 2) menor M entre los admisibles; proponer cambio solo con mejora relativa de M ≥ 5 % frente a N04C; 3) empate (1e-9): menos filas distintas de N04C, menor Σ|diferencia|/rango y después identificador lexicográfico; 4) sin mejora admisible, se conserva N04C',
  intermediates: 'los puntos de trabajo no son ganadores aceptados ni multiplican tolerancias; la admisibilidad se calcula al final sobre TODOS los vectores completos ejecutados frente a N04C',
  valUse: 'VAL no elige ni reajusta: ninguna regla lee resultados de VAL',
  rows: ROWS,
};
export const vectorOf = (id) => { const a = AGENDA.find((x) => x.id === id); return a ? a.set : {}; };

const ci = (n) => COLS.team.indexOf(n); const pi = (n) => COLS.player.indexOf(n); const zi = (n) => COLS.zone.indexOf(n); const qi = (n) => COLS.czq.indexOf(n);
const sumBy = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
const ZONES = ['rim', 'inside', 'midrange', 'three'];
const ratio = (a, b) => (b > 0 ? a / b : null);
// Filas de equipo de los casos indicados terminadas y válidas. Un final no deportivo o no válido NO entra y se declara aparte, sin borrar su resultado.
export function linesOf(tables, caseIds, resolver, identity = null) {
  const want = new Set(caseIds); const rows = []; const excluded = [];
  for (const r of tables.team) { if (r[ci('resolver')] !== resolver || !want.has(r[ci('case_id')])) continue; if (identity && r[ci('identity')] !== identity) continue; if (r[ci('status')] !== 'finished' || r[ci('valid')] !== 1) { if (r[ci('team_index')] === 0) excluded.push({ case: r[ci('case_id')], why: r[ci('status')] !== 'finished' ? `estado ${r[ci('status')]}` : 'no válido' }); continue; } rows.push(r); }
  return { rows, excluded };
}
const per40 = (r, col) => (r[ci(col)] == null || !(r[ci('duration_s')] > 0) ? null : (r[ci(col)] * 2400) / r[ci('duration_s')]);
const mean = (xs) => { const a = xs.filter((x) => x != null); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };
// Numeradores y denominadores de una población (SIM o detallado) sobre las MISMAS entradas. `zoneRows`: filas de zona de esos mismos casos/identidad/resolutor; `czqRows`: filas de contexto×zona×calidad.
export function metricsOf(rows, zoneRows = [], czqRows = []) {
  const noOT = rows.filter((r) => !(r[ci('overtimes')] > 0));
  const zs = Object.fromEntries(ZONES.map((z) => [z, sumBy(rows, (r) => r[ci(`${z}_a`)] ?? 0)])); const za = sumBy(ZONES, (z) => zs[z]);
  const zq = (z) => { const rs = zoneRows.filter((r) => r[zi('zone')] === z); return { att: sumBy(rs, (r) => r[zi('attempts')] ?? 0), forced: sumBy(rs, (r) => r[zi('q_forced')] ?? 0) }; };
  const rim = zq('rim'); const ins = zq('inside');
  const inN = czqRows.filter((r) => r[qi('zone')] === 'inside' && r[qi('quality')] === 1); const insideNormalA = sumBy(inN, (r) => r[qi('attempts')] ?? 0); const insideNormalM = sumBy(inN, (r) => r[qi('makes')] ?? 0);
  return { teamLines: rows.length, games: rows.length / 2,
    meanPTS40: mean(rows.map((r) => per40(r, 'pts'))), meanFGA40: mean(rows.map((r) => per40(r, 'fga'))), meanPTSReal: mean(rows.map((r) => r[ci('pts')])), meanFGAReal: mean(rows.map((r) => r[ci('fga')])), meanPTSNoOT: mean(noOT.map((r) => r[ci('pts')])), meanFGANoOT: mean(noOT.map((r) => r[ci('fga')])), nNoOT: noOT.length,
    zoneAttempts: zs, zoneTotal: za, zoneShare: Object.fromEntries(ZONES.map((z) => [z, za > 0 ? zs[z] / za : null])),
    fg2m: sumBy(rows, (r) => r[ci('fg2m')]), fg2a: sumBy(rows, (r) => r[ci('fg2a')]), fg3m: sumBy(rows, (r) => r[ci('fg3m')]), fg3a: sumBy(rows, (r) => r[ci('fg3a')]), ftm: sumBy(rows, (r) => r[ci('ftm')] ?? 0), fta: sumBy(rows, (r) => r[ci('fta')] ?? 0),
    rimM: sumBy(rows, (r) => r[ci('rim_m')] ?? 0), rimA: sumBy(rows, (r) => r[ci('rim_a')] ?? 0), insideM: sumBy(rows, (r) => r[ci('inside_m')] ?? 0), insideA: sumBy(rows, (r) => r[ci('inside_a')] ?? 0), rimForced: rim.forced, rimAttZone: rim.att, insideForced: ins.forced, insideAttZone: ins.att,
    insideNormalA, insideNormalM,
    fgm: sumBy(rows, (r) => r[ci('fgm')]), fga: sumBy(rows, (r) => r[ci('fga')]), astFg: sumBy(rows, (r) => r[ci('ast_fg')] ?? 0), astFt: sumBy(rows, (r) => r[ci('ast_ft')] ?? 0) };
}
const ev = (value, reason) => (value == null ? { value: null, evaluated: false, reason } : { value, evaluated: true });
// Ocho errores + e3, eFT e indicador de calidad forzada de inside. Cada uno devuelve { value, evaluated, reason }: un denominador nulo NO produce un cero.
export function errorsOf(sim, det) {
  const nul = 'denominador nulo o ancla no válida'; const d = (a, b, c, e) => { const x = ratio(a, b); const y = ratio(c, e); return x == null || y == null ? ev(null, nul) : ev(Math.abs(x - y)); };
  const eP = !(det.meanPTS40 > 0) || sim.meanPTS40 == null ? ev(null, nul) : ev(Math.abs(sim.meanPTS40 / det.meanPTS40 - 1));
  const eF = !(det.meanFGA40 > 0) || sim.meanFGA40 == null ? ev(null, nul) : ev(Math.abs(sim.meanFGA40 / det.meanFGA40 - 1));
  const eZ = !(det.zoneTotal > 0) || !(sim.zoneTotal > 0) ? ev(null, nul) : ev(sumBy(ZONES, (z) => Math.abs(sim.zoneShare[z] - det.zoneShare[z])));
  return { eP, eF, eZ, e2: d(sim.fg2m, sim.fg2a, det.fg2m, det.fg2a), eR: d(sim.rimM, sim.rimA, det.rimM, det.rimA), eI: d(sim.insideM, sim.insideA, det.insideM, det.insideA), eQ: d(sim.rimForced, sim.rimAttZone, det.rimForced, det.rimAttZone), eA: d(sim.astFg, sim.fgm, det.astFg, det.fgm),
    e3: d(sim.fg3m, sim.fg3a, det.fg3m, det.fg3a), eFT: d(sim.ftm, sim.fta, det.ftm, det.fta), forcedInside: d(sim.insideForced, sim.insideAttZone, det.insideForced, det.insideAttZone),
    parts: { simZoneShare: sim.zoneShare, detZoneShare: det.zoneShare, sim2: ratio(sim.fg2m, sim.fg2a), det2: ratio(det.fg2m, det.fg2a), simRim: ratio(sim.rimM, sim.rimA), detRim: ratio(det.rimM, det.rimA), simInside: ratio(sim.insideM, sim.insideA), detInside: ratio(det.insideM, det.insideA), simForcedRim: ratio(sim.rimForced, sim.rimAttZone), detForcedRim: ratio(det.rimForced, det.rimAttZone), simForcedInside: ratio(sim.insideForced, sim.insideAttZone), detForcedInside: ratio(det.insideForced, det.insideAttZone), simAstPerFgm: ratio(sim.astFg, sim.fgm), detAstPerFgm: ratio(det.astFg, det.fgm), sim3: ratio(sim.fg3m, sim.fg3a), det3: ratio(det.fg3m, det.fg3a), simFT: ratio(sim.ftm, sim.fta), detFT: ratio(det.ftm, det.fta),
      simInsideNormal: ratio(sim.insideNormalM, sim.insideNormalA), detInsideNormal: ratio(det.insideNormalM, det.insideNormalA), simInsideNormalA: sim.insideNormalA, detInsideNormalA: det.insideNormalA, simInsideNormalM: sim.insideNormalM, detInsideNormalM: det.insideNormalM } };
}
export function fortyMinuteFrequency(tables, caseIds, resolver, identity = null) {
  const want = new Set(caseIds); const noOT = new Set(); for (const r of tables.team) if (r[ci('resolver')] === resolver && (!identity || r[ci('identity')] === identity) && want.has(r[ci('case_id')]) && r[ci('status')] === 'finished' && !(r[ci('overtimes')] > 0)) noOT.add(r[ci('case_id')]);
  const by = new Map(); for (const r of tables.player) { if (r[pi('resolver')] !== resolver || (identity && r[pi('identity')] !== identity) || !noOT.has(r[pi('case_id')])) continue; const k = `${r[pi('case_id')]}|${r[pi('team_index')]}`; by.set(k, Math.max(by.get(k) ?? 0, r[pi('seconds')] ?? 0)); }
  let n = 0; let hit = 0; for (const [, mx] of by) { n++; if (mx >= 2400 - 0.0005) hit++; } return { teamPerformances: n, withFortyMinutes: hit, frequency: n ? hit / n : null };
}

const near = (a, b) => Math.abs(a - b) <= RULES.precision * Math.max(1, Math.abs(a), Math.abs(b));
// M y su componente dominante. `null` si falta algún error necesario.
export function scoreM(e) {
  const comps = {}; for (const k of M_KEYS) { const v = e[k]?.value; if (v == null) return { M: null, dominant: null, comps, missing: M_KEYS.filter((x) => e[x]?.value == null) }; comps[k] = v / BAND[k]; }
  let M = -Infinity; let dominant = null; for (const k of M_KEYS) if (comps[k] > M) { M = comps[k]; dominant = k; } return { M, dominant, comps, missing: [] };
}
// Guardas uniformes frente a N04C (`init` = errores de N04C). Devuelve las incumplidas con sus valores; vacío = admisible. Un error no evaluado ⇒ «no evaluado».
export function guards(cand, init) {
  const fails = []; const g = (name, value, limit) => { if (value == null || limit == null) fails.push({ guard: name, why: 'no evaluado', value, limit }); else if (value > limit + 1e-12) fails.push({ guard: name, value, limit }); };
  const lim = { eP: (p) => Math.max(0.08, p + 0.02), eF: (p) => Math.max(0.08, p + 0.02), eZ: (p) => p + 0.02, e2: (p) => Math.max(0.04, p + 0.015), eR: (p) => Math.max(0.05, p + 0.02), eI: (p) => Math.max(0.05, p + 0.02), eQ: (p) => Math.max(0.05, p + 0.02), eA: (p) => Math.max(0.08, p + 0.02), e3: (p) => Math.max(0.05, p + 0.015), eFT: (p) => Math.max(0.04, p + 0.02) };
  for (const k of Object.keys(lim)) g(k, cand[k]?.value ?? null, init[k]?.value == null ? null : lim[k](init[k].value));
  return fails;
}
// Distancia normalizada al neutral (desempate): Σ |valor − neutral| / rango de cada fila.
export function distance(rows) { let d = 0; let n = 0; for (const r of ROWS) { const v = rows.find((x) => x.path === r.path)?.value ?? r.neutral; if (v !== r.neutral) { n++; d += Math.abs(v - r.neutral) / r.range; } } return { distinctRows: n, normalizedDistance: d }; }
// Orden total de dos vectores evaluados {id, M, rows}: menor M (1e-9), menos filas distintas, menor distancia, id lexicográfico.
export const compareVectors = (a, b) => (near(a.M, b.M) ? 0 : a.M - b.M) || a.dist.distinctRows - b.dist.distinctRows || a.dist.normalizedDistance - b.dist.normalizedDistance || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
// Un vector es «calculable» si todos sus errores necesarios están evaluados y sus invariantes son correctas.
export const calculable = (x) => x.M != null && x.invariantsOk === true;
// Punto de trabajo: menor M entre `items` calculables (puede incumplir guardas).
export function workingPoint(items) { const ok = items.filter(calculable).sort(compareVectors); return ok[0] ?? null; }
// Condiciones de las etapas I y P sobre el punto de trabajo (`pt` = evaluación con errores y partes).
export function stageICondition(pt) { if (!pt) return { run: false, reason: 'sin punto de trabajo calculable y técnicamente válido' }; const eI = pt.e.eI.value; const fi = pt.e.forcedInside.value; const run = (eI != null && eI > 0.05) || (fi != null && fi > 0.05); return { run, eI, forcedInsideDiff: fi, reason: run ? 'eI > 0,05 o diferencia de calidad forzada inside > 0,05' : 'eI ≤ 0,05 y diferencia de calidad forzada inside ≤ 0,05: se omite' }; }
export function stagePCondition(pt) {
  if (!pt) return { run: false, reason: 'sin punto de trabajo calculable y técnicamente válido' }; const p = pt.e.parts; const eI = pt.e.eI.value; const na = p.simInsideNormalA; const da = p.detInsideNormalA; const sN = p.simInsideNormal; const dN = p.detInsideNormal;
  const have = na >= 80 && da >= 80 && sN != null && dN != null; const gap = have ? dN - sN : null; const run = eI != null && eI > 0.05 && have && gap > 0.03;
  return { run, eI, simNormalInsideFga: na, detNormalInsideFga: da, simNormalInsideFg: p.simInsideNormalM + '/' + na, detNormalInsideFg: p.detInsideNormalM + '/' + da, gap, reason: run ? 'se cumplen las tres condiciones' : !have ? 'denominadores insuficientes (< 80 FGA inside de calidad normal por modelo) o nulos: se omite' : eI == null || eI <= 0.05 ? 'eI ≤ 0,05: se omite' : 'diferencia de FG% normal inside ≤ 0,03: se omite' };
}
// Selección final sobre TODOS los vectores completos ejecutados. `base` = N04C {M, e}; `list` = [{id, rows, e, M, invariantsOk}].
export function selectFinal(base, list) {
  const log = []; const eligible = [];
  for (const x of list) {
    const dist = distance(x.rows); const rec = { id: x.id, M: x.M, dominant: x.dominant ?? null, ...dist };
    if (!x.invariantsOk) { log.push({ ...rec, verdict: 'descartado: invariantes incumplidas' }); continue; }
    if (x.M == null) { log.push({ ...rec, verdict: 'descartado: errores necesarios no evaluados', missing: x.missing }); continue; }
    const fails = guards(x.e, base.e); if (fails.length) { log.push({ ...rec, verdict: 'descartado: guardas', fails }); continue; }
    eligible.push({ ...x, dist }); log.push({ ...rec, verdict: 'admisible', relativeImprovement: base.M > 0 ? (base.M - x.M) / base.M : null });
  }
  eligible.sort(compareVectors);
  if (!eligible.length) return { chosenId: 'N04C', kept: true, reason: 'ningún vector admisible: se conserva N04C', log };
  const best = eligible[0]; const imp = base.M > 0 ? (base.M - best.M) / base.M : null;
  if (!(imp != null && imp >= RULES.minRelativeImprovement)) return { chosenId: 'N04C', kept: true, reason: `el mejor admisible (${best.id}) mejora M ${imp == null ? 'n/d' : (100 * imp).toFixed(4)} % < 5 % relativo: se conserva N04C`, bestAdmissible: best.id, relativeImprovement: imp, log };
  return { chosenId: best.id, kept: false, reason: `${best.id} mejora M ${(100 * imp).toFixed(4)} % ≥ 5 % relativo y cumple todas las guardas`, relativeImprovement: imp, log };
}
export const rulesHash = () => createHash('sha256').update(JSON.stringify({ r: RULES, a: AGENDA, f: FIXED })).digest('hex');
export { vec as vectorRows };
