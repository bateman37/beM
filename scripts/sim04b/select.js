// SIM-MOTOR-04B · selector mecánico de la candidata (§8). Funciones PURAS sobre las tablas de equipo/zona/jugador derivadas de los registros de CAL (con sus anclas detalladas): se pueden recalcular desde los resultados
// sin volver a simular (el comprobador de entrega lo hace desde numeradores y denominadores). Solo PROPONE un vector: no declara «calibrado». Las reglas y su hash se guardan en el plan ANTES de ejecutar CAL.
// Siete errores SEPARADOS (no una pérdida combinada que permita compensar unas dimensiones con otras) + guardas locales y acumuladas. VAL no participa en ninguna decisión.
import { createHash } from 'node:crypto';
import { COLS } from './tables.js';

export const RULES_ID = 'SEL-SIM04B-R1';
export const BAND = { eP: 0.08, eF: 0.08, e2: 0.04, eR: 0.05, eQ: 0.05, eA: 0.08 };
// Base R04B-N: las correcciones de 04B y los CUATRO valores de la candidata de 04; las tres filas nuevas quedan neutrales.
export const BASE_VECTOR = [{ path: 'volume.neutralSecondsPerControl', value: 19.5 }, { path: 'shotMix.threeWeightFactor', value: 0.7 }, { path: 'assist.eligibleFinalPassP0', value: 0.9 }, { path: 'energy.costPerLiveMinute', value: 3 }];
// Hasta SIETE vectores adicionales, secuenciales (no el producto cartesiano): cada etapa parte del ganador de la anterior y reutiliza sus partidos.
export const STAGES = [
  { stage: 'Z', path: 'shotMix.rimWeightFactor', baseline: 1, values: [1.25, 1.5], ids: ['C04B-Z1', 'C04B-Z2'], objective: 'menor eZ' },
  { stage: 'Q', path: 'opportunity.simRimQualityLogit', baseline: 0, values: [0.25, 0.5], ids: ['C04B-Q1', 'C04B-Q2'], objective: 'menor max(eR/0,05; eQ/0,05; e2/0,04)' },
  { stage: 'A', path: 'assist.receivedAdvantageP0', baseline: 0, values: [0.25, 0.5], ids: ['C04B-A1', 'C04B-A2'], objective: 'menor eA' },
  { stage: 'E', path: 'energy.costPerLiveMinute', baseline: 3, values: [3.5], ids: ['C04B-E1'], objective: '3,5 solo si reduce ≥ 20 % relativo la frecuencia de 40 min y supera guardas y casos de rotación' },
];
export const RULES = {
  id: RULES_ID, maxAdditionalVectors: 7, precision: 1e-9, minRelativeImprovement: 0.05, band: BAND,
  errors: {
    eP: 'abs(meanPTS40_SIM / meanPTS40_DET − 1); medias por actuación de equipo normalizadas a 40 min (valor × 2400 / duración deportiva)',
    eF: 'abs(meanFGA40_SIM / meanFGA40_DET − 1); mismas normalizaciones',
    eZ: 'Σ_z abs(shareFGA_SIM[z] − shareFGA_DET[z]) en las cuatro zonas (sumas de numeradores y denominadores)',
    e2: 'abs(Σ2PM_SIM/Σ2PA_SIM − Σ2PM_DET/Σ2PA_DET)',
    eR: 'abs(ΣrimM_SIM/ΣrimA_SIM − ΣrimM_DET/ΣrimA_DET)',
    eQ: 'abs(forcedRimShare_SIM − forcedRimShare_DET), con forcedRimShare = intentos al aro en calidad forzada / intentos al aro',
    eA: 'abs(ΣAST_FG_SIM/ΣFGM_SIM − ΣAST_FG_DET/ΣFGM_DET)',
    freq40: 'fracción de actuaciones de equipo con algún jugador ≥ 40 min (2400 s) en partidos SIN prórroga, con segundos originales',
  },
  localGuards: 'frente al ganador previo: eP ≤ max(0,08; eP_prev+0,02) · eF ≤ max(0,08; eF_prev+0,02) · e2 ≤ max(0,04; e2_prev+0,01) · eR ≤ max(0,05; eR_prev+0,01) · eA ≤ max(0,08; eA_prev+0,02) · eZ ≤ eZ_prev+0,02 · eQ ≤ max(0,05; eQ_prev+0,02)',
  cumulativeGuards: 'frente a R04B-N: eP/eF/e2/eR/eQ/eA ≤ max(error inicial; banda 0,08/0,08/0,04/0,05/0,05/0,08) y eZ ≤ eZ inicial. Ninguna guarda se compensa con la mejora de otra.',
  stages: STAGES.map((x) => ({ stage: x.stage, path: x.path, baseline: x.baseline, values: x.values, objective: x.objective })),
  ties: 'se conserva el valor previo si el objetivo previo ya es cero o la mejora relativa es < 5 %; en empate (precisión 1e-9) se conserva el cambio menor respecto al previo y después el valor menor; denominador ausente/nulo ⇒ no evaluado y se conserva el valor previo (nunca una pérdida cero ficticia)',
  energy: 'E = 3,5 solo si reduce ≥ 20 % relativo la frecuencia de 40 min frente al ganador previo con gasto 3, cumple todas las guardas y supera las comprobaciones de rotación corregidas',
  valUse: 'VAL no elige ni reajusta: ninguna regla lee resultados de VAL',
};

const ci = (n) => COLS.team.indexOf(n); const pi = (n) => COLS.player.indexOf(n); const zi = (n) => COLS.zone.indexOf(n);
const sumBy = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
const ZONES = ['rim', 'inside', 'midrange', 'three'];
const ratio = (a, b) => (b > 0 ? a / b : null);
// Filas de equipo de los casos indicados terminadas y válidas: { rows, excluded }. Un final no deportivo o no válido NO entra y se declara aparte, sin borrar su resultado.
export function linesOf(tables, caseIds, resolver, identity = null) {
  const want = new Set(caseIds); const rows = []; const excluded = [];
  for (const r of tables.team) { if (r[ci('resolver')] !== resolver || !want.has(r[ci('case_id')])) continue; if (identity && r[ci('identity')] !== identity) continue; if (r[ci('status')] !== 'finished' || r[ci('valid')] !== 1) { if (r[ci('team_index')] === 0) excluded.push({ case: r[ci('case_id')], why: r[ci('status')] !== 'finished' ? `estado ${r[ci('status')]}` : 'no válido' }); continue; } rows.push(r); }
  return { rows, excluded };
}
const per40 = (r, col) => (r[ci(col)] == null || !(r[ci('duration_s')] > 0) ? null : (r[ci(col)] * 2400) / r[ci('duration_s')]);
const mean = (xs) => { const a = xs.filter((x) => x != null); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };
// Numeradores y denominadores de una población (SIM o detallado) sobre las MISMAS entradas. `zoneRows`: filas de la tabla de zona de esos mismos casos/identidad/resolutor.
export function metricsOf(rows, zoneRows = []) {
  const noOT = rows.filter((r) => !(r[ci('overtimes')] > 0));
  const zs = Object.fromEntries(ZONES.map((z) => [z, sumBy(rows, (r) => r[ci(`${z}_a`)] ?? 0)])); const za = sumBy(ZONES, (z) => zs[z]);
  const rim = zoneRows.filter((r) => r[zi('zone')] === 'rim'); const rimAtt = sumBy(rim, (r) => r[zi('attempts')] ?? 0); const forced = sumBy(rim, (r) => r[zi('q_forced')] ?? 0);
  return { teamLines: rows.length, games: rows.length / 2,
    meanPTS40: mean(rows.map((r) => per40(r, 'pts'))), meanFGA40: mean(rows.map((r) => per40(r, 'fga'))), meanPTSReal: mean(rows.map((r) => r[ci('pts')])), meanFGAReal: mean(rows.map((r) => r[ci('fga')])), meanPTSNoOT: mean(noOT.map((r) => r[ci('pts')])), meanFGANoOT: mean(noOT.map((r) => r[ci('fga')])), nNoOT: noOT.length,
    zoneAttempts: zs, zoneTotal: za, zoneShare: Object.fromEntries(ZONES.map((z) => [z, za > 0 ? zs[z] / za : null])),
    fg2m: sumBy(rows, (r) => r[ci('fg2m')]), fg2a: sumBy(rows, (r) => r[ci('fg2a')]), rimM: sumBy(rows, (r) => r[ci('rim_m')] ?? 0), rimA: sumBy(rows, (r) => r[ci('rim_a')] ?? 0), rimForced: forced, rimAttZone: rimAtt,
    fgm: sumBy(rows, (r) => r[ci('fgm')]), fga: sumBy(rows, (r) => r[ci('fga')]), astFg: sumBy(rows, (r) => r[ci('ast_fg')] ?? 0), ftAst: sumBy(rows, (r) => r[ci('ast_ft')] ?? 0), fta: sumBy(rows, (r) => r[ci('fta')] ?? 0), ftm: sumBy(rows, (r) => r[ci('ftm')] ?? 0), threeA: sumBy(rows, (r) => r[ci('fg3a')]) };
}
const ev = (value, reason) => (value == null ? { value: null, evaluated: false, reason } : { value, evaluated: true });
// Siete errores separados. Cada uno devuelve { value, evaluated, reason }: un denominador nulo NO produce un cero.
export function errorsOf(sim, det) {
  const nul = 'denominador nulo o ancla no válida';
  const eP = !(det.meanPTS40 > 0) || sim.meanPTS40 == null ? ev(null, nul) : ev(Math.abs(sim.meanPTS40 / det.meanPTS40 - 1));
  const eF = !(det.meanFGA40 > 0) || sim.meanFGA40 == null ? ev(null, nul) : ev(Math.abs(sim.meanFGA40 / det.meanFGA40 - 1));
  const eZ = !(det.zoneTotal > 0) || !(sim.zoneTotal > 0) ? ev(null, nul) : ev(sumBy(ZONES, (z) => Math.abs(sim.zoneShare[z] - det.zoneShare[z])));
  const d2 = ratio(det.fg2m, det.fg2a); const s2 = ratio(sim.fg2m, sim.fg2a); const e2 = d2 == null || s2 == null ? ev(null, nul) : ev(Math.abs(s2 - d2));
  const dR = ratio(det.rimM, det.rimA); const sR = ratio(sim.rimM, sim.rimA); const eR = dR == null || sR == null ? ev(null, nul) : ev(Math.abs(sR - dR));
  const dQ = ratio(det.rimForced, det.rimAttZone); const sQ = ratio(sim.rimForced, sim.rimAttZone); const eQ = dQ == null || sQ == null ? ev(null, nul) : ev(Math.abs(sQ - dQ));
  const dA = ratio(det.astFg, det.fgm); const sA = ratio(sim.astFg, sim.fgm); const eA = dA == null || sA == null ? ev(null, nul) : ev(Math.abs(sA - dA));
  return { eP, eF, eZ, e2, eR, eQ, eA, parts: { simZoneShare: sim.zoneShare, detZoneShare: det.zoneShare, sim2: s2, det2: d2, simRim: sR, detRim: dR, simForcedRim: sQ, detForcedRim: dQ, simAstPerFgm: sA, detAstPerFgm: dA } };
}
// Frecuencia de actuaciones de equipo con algún jugador de ≥ 40 min en partidos SIN prórroga (segundos originales, sin redondear; tolerancia contractual de tres decimales).
export function fortyMinuteFrequency(tables, caseIds, resolver, identity = null) {
  const want = new Set(caseIds); const noOT = new Set(); for (const r of tables.team) if (r[ci('resolver')] === resolver && (!identity || r[ci('identity')] === identity) && want.has(r[ci('case_id')]) && r[ci('status')] === 'finished' && !(r[ci('overtimes')] > 0)) noOT.add(r[ci('case_id')]);
  const by = new Map(); for (const r of tables.player) { if (r[pi('resolver')] !== resolver || (identity && r[pi('identity')] !== identity) || !noOT.has(r[pi('case_id')])) continue; const k = `${r[pi('case_id')]}|${r[pi('team_index')]}`; by.set(k, Math.max(by.get(k) ?? 0, r[pi('seconds')] ?? 0)); }
  let n = 0; let hit = 0; for (const [, mx] of by) { n++; if (mx >= 2400 - 0.0005) hit++; } return { teamPerformances: n, withFortyMinutes: hit, frequency: n ? hit / n : null };
}

const near = (a, b) => Math.abs(a - b) <= RULES.precision * Math.max(1, Math.abs(a), Math.abs(b));
// Guardas locales (frente al ganador previo) y acumuladas (frente a R04B-N). Devuelve la lista de guardas incumplidas con sus valores; vacía = admisible. Un error no evaluado en el candidato o en la referencia ⇒ se anota como no evaluado.
export function guards(cand, prev, init) {
  const fails = []; const g = (name, kind, value, limit) => { if (value == null || limit == null) fails.push({ guard: `${kind}:${name}`, why: 'no evaluado', value, limit }); else if (value > limit + 1e-12) fails.push({ guard: `${kind}:${name}`, value, limit }); };
  const loc = { eP: (p) => Math.max(BAND.eP, p + 0.02), eF: (p) => Math.max(BAND.eF, p + 0.02), e2: (p) => Math.max(BAND.e2, p + 0.01), eR: (p) => Math.max(BAND.eR, p + 0.01), eA: (p) => Math.max(BAND.eA, p + 0.02), eZ: (p) => p + 0.02, eQ: (p) => Math.max(BAND.eQ, p + 0.02) };
  for (const k of Object.keys(loc)) g(k, 'local', cand[k].value, prev[k].value == null ? null : loc[k](prev[k].value));
  for (const k of ['eP', 'eF', 'e2', 'eR', 'eQ', 'eA']) g(k, 'acumulada', cand[k].value, init[k].value == null ? null : Math.max(init[k].value, BAND[k]));
  g('eZ', 'acumulada', cand.eZ.value, init.eZ.value);
  return fails;
}
export const objectiveOf = (stage, e) => {
  if (stage === 'Z') return e.eZ.value;
  if (stage === 'A') return e.eA.value;
  if (stage === 'Q') { const a = e.eR.value; const b = e.eQ.value; const c = e.e2.value; return a == null || b == null || c == null ? null : Math.max(a / BAND.eR, b / BAND.eQ, c / BAND.e2); }
  return null;
};
// Etapa Z/Q/A. `prev` = { id, value, e }; `cands` = [{ id, value, e }]; `init` = errores de R04B-N. Devuelve la decisión con todos los cálculos SIN redondear.
export function chooseStage({ stage, prev, cands, init }) {
  const log = []; const base = { id: prev.id, value: prev.value }; const po = objectiveOf(stage, prev.e);
  if (po == null) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: 'objetivo no evaluado con el valor previo: se conserva el valor previo', log, evaluated: false, prevObjective: null };
  if (po === 0) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: 'el objetivo del valor previo ya es cero: se conserva', log, evaluated: true, prevObjective: po };
  const eligible = [];
  for (const c of cands) {
    const o = objectiveOf(stage, c.e); if (o == null) { log.push({ id: c.id, value: c.value, objective: null, verdict: 'no evaluado: se descarta' }); continue; }
    const fails = guards(c.e, prev.e, init); if (fails.length) { log.push({ id: c.id, value: c.value, objective: o, verdict: 'inadmisible', fails }); continue; }
    eligible.push({ ...c, objective: o }); log.push({ id: c.id, value: c.value, objective: o, verdict: 'admisible', relativeReduction: (po - o) / po });
  }
  if (!eligible.length) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: 'ningún candidato admisible: se conserva el valor previo', log, evaluated: true, prevObjective: po };
  eligible.sort((a, b) => (near(a.objective, b.objective) ? 0 : a.objective - b.objective) || Math.abs(a.value - prev.value) - Math.abs(b.value - prev.value) || a.value - b.value);
  const best = eligible[0]; const red = (po - best.objective) / po;
  if (!(red >= RULES.minRelativeImprovement)) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: `mejor candidato ${best.id} reduce el objetivo ${(100 * red).toFixed(4)} % < 5 % relativo (o no lo reduce): se conserva el valor previo`, bestCandidate: best.id, relativeReduction: red, log, evaluated: true, prevObjective: po };
  return { stage, chosen: best.value, chosenId: best.id, kept: false, reason: `${best.id} reduce el objetivo ${(100 * red).toFixed(4)} % ≥ 5 % relativo`, relativeReduction: red, log, evaluated: true, prevObjective: po };
}
// Etapa E: `prev` ganador con gasto 3 y `cands` con {value, id, e, freq40, checks:{superior30, relief}}. Sube a 3,5 solo si cumple las tres condiciones; si no, conserva 3 y entrega 3,5 como alternativa con su motivo.
export function chooseEnergy({ prev, cands, init }) {
  const log = []; const ok = [];
  for (const c of cands.slice().sort((a, b) => a.value - b.value)) {
    const red = prev.freq40 > 0 ? (prev.freq40 - c.freq40) / prev.freq40 : null; const fails = guards(c.e, prev.e, init); const c1 = red != null && red >= 0.2; const c3 = !!(c.checks?.superior30 && c.checks?.relief);
    log.push({ id: c.id, value: c.value, freq40: c.freq40, baselineFreq40: prev.freq40, relativeReduction: red, cond1_reduccion20: c1, guardFails: fails, cond2_guardas: fails.length === 0, cond3_rotacion: c3, checks: c.checks ?? null, meets: c1 && fails.length === 0 && c3 });
    if (c1 && fails.length === 0 && c3) ok.push(c);
  }
  if (!ok.length) return { stage: 'E', chosen: prev.value, chosenId: prev.id, kept: true, reason: 'ninguna alternativa cumple las tres condiciones: se conserva el gasto 3 y se entrega 3,5 como alternativa con el motivo de no elección', log };
  const c = ok[0]; return { stage: 'E', chosen: c.value, chosenId: c.id, kept: false, reason: `${c.id} cumple las tres condiciones`, log };
}

export const rulesHash = () => createHash('sha256').update(JSON.stringify({ r: RULES, s: STAGES, b: BASE_VECTOR })).digest('hex');
