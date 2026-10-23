// SIM-MOTOR-04 · selector mecánico de la candidata (§7.3). Funciones PURAS sobre las tablas de equipo/jugador derivadas de los registros de CAL (más las anclas detalladas): se pueden recalcular desde los resultados
// sin volver a simular (el comprobador de entrega lo hace). Solo PROPONE un vector: no declara «calibrado». Las reglas se guardan en el plan ANTES de ejecutar CAL.
import { COLS } from './tables.js';

export const RULES_ID = 'SEL-SIM04-R1';
export const STAGES = [
  { stage: 'V', path: 'volume.neutralSecondsPerControl', baseline: 16, values: [17.5, 18.5, 19.5], ids: ['C04-V1', 'C04-V2', 'C04-V3'] },
  { stage: 'Z', path: 'shotMix.threeWeightFactor', baseline: 1, values: [0.85, 0.7], ids: ['C04-Z1', 'C04-Z2'] },
  { stage: 'A', path: 'assist.eligibleFinalPassP0', baseline: 0.6, values: [0.75, 0.9], ids: ['C04-A1', 'C04-A2'] },
  { stage: 'E', path: 'energy.costPerLiveMinute', baseline: 2, values: [3, 3.5], ids: ['C04-E1', 'C04-E2'] },
];
export const RULES = {
  id: RULES_ID, maxAdditionalVectors: 9, precision: 1e-9, minRelativeImprovement: 0.05,
  L_V: 'abs(meanPTS_SIM/meanPTS_DET − 1) + abs(meanFGA_SIM/meanFGA_DET − 1); medias por equipo de equivalentes por 40 minutos (valor × 2400 / duración deportiva) en los casos CAL con ancla detallada',
  L_Z: 'Σ_z abs(shareAttempts_SIM[z] − shareAttempts_DET[z]) (cuatro zonas; sumas de numeradores y denominadores); admisible si L_V no empeora más de max(0,02; 10 % del L_V previo)',
  L_A: 'abs(ΣAST_FG_SIM/ΣFGM_SIM − ΣAST_FG_DET/ΣFGM_DET) en las anclas; las asistencias a libres se informan aparte',
  E: 'menor gasto de {2, 3, 3,5} con: (1) frecuencia de actuaciones de equipo con algún jugador de ≥ 40 min (partidos sin prórroga, todos los CAL) reducida ≥ 20 % relativo frente al ganador previo con gasto 2; (2) L_V no empeora más de max(0,04; 20 % del L_V previo) ni L_A más de 0,05 absolutos; (3) comprobaciones de rotación superadas',
  ties: 'se conserva el valor previo si la reducción de la pérdida es < 5 % relativo o si su pérdida es 0; entre valores con la misma pérdida (precisión 1e-9) se elige el más cercano al anterior y después el de menor cambio absoluto; denominador nulo o ancla no válida ⇒ métrica no evaluada y se conserva el valor previo',
};

const ci = (n) => COLS.team.indexOf(n); const pi = (n) => COLS.player.indexOf(n);
const sumBy = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
const ZONES = ['rim', 'inside', 'midrange', 'three'];

// Filas de equipo de los casos indicados (todas las terminadas y válidas): { rows, excluded: [{case, why}] }. Un final no deportivo o no válido NO entra y se declara aparte, sin borrar su resultado.
export function linesOf(tables, caseIds, resolver) {
  const want = new Set(caseIds); const rows = []; const excluded = [];
  for (const r of tables.team) { if (r[ci('resolver')] !== resolver || !want.has(r[ci('case_id')])) continue; if (r[ci('status')] !== 'finished' || r[ci('valid')] !== 1) { if (r[ci('team_index')] === 0) excluded.push({ case: r[ci('case_id')], why: r[ci('status')] !== 'finished' ? `estado ${r[ci('status')]}` : 'no válido' }); continue; } rows.push(r); }
  return { rows, excluded };
}
const per40 = (r, col) => (r[ci(col)] == null || !(r[ci('duration_s')] > 0) ? null : (r[ci(col)] * 2400) / r[ci('duration_s')]);
const mean = (xs) => { const a = xs.filter((x) => x != null); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };
// Métricas de una población (SIM o detallado) sobre las MISMAS entradas: puntos/tiros por 40 min (L_V), reparto por zona (L_Z), asistencias por canasta (L_A) y variantes reales/sin prórroga con nombres distintos.
export function metricsOf(rows) {
  const noOT = rows.filter((r) => !(r[ci('overtimes')] > 0));
  const zs = Object.fromEntries(ZONES.map((z) => [z, sumBy(rows, (r) => r[ci(`${z}_a`)] ?? 0)])); const za = sumBy(ZONES, (z) => zs[z]);
  const fgm = sumBy(rows, (r) => r[ci('fgm')]); const ast = sumBy(rows, (r) => r[ci('ast_fg')] ?? 0); const fga = sumBy(rows, (r) => r[ci('fga')]);
  return { teamLines: rows.length, games: rows.length / 2, meanPTS40: mean(rows.map((r) => per40(r, 'pts'))), meanFGA40: mean(rows.map((r) => per40(r, 'fga'))), meanPTSReal: mean(rows.map((r) => r[ci('pts')])), meanFGAReal: mean(rows.map((r) => r[ci('fga')])),
    meanPTSNoOT: mean(noOT.map((r) => r[ci('pts')])), meanFGANoOT: mean(noOT.map((r) => r[ci('fga')])), nNoOT: noOT.length, durations: rows.filter((r) => r[ci('team_index')] === 0).map((r) => r[ci('duration_s')]),
    zoneAttempts: zs, zoneShare: Object.fromEntries(ZONES.map((z) => [z, za > 0 ? zs[z] / za : null])), zoneTotal: za, fgm, fga, astFg: ast, astPerFgm: fgm > 0 ? ast / fgm : null,
    ftAst: sumBy(rows, (r) => r[ci('ast_ft')] ?? 0), fta: sumBy(rows, (r) => r[ci('fta')] ?? 0) };
}
// Pérdidas. Devuelven { value, evaluated, reason } y NUNCA un cero inventado.
export function lossV(sim, det) { if (!(det.meanPTS40 > 0) || !(det.meanFGA40 > 0) || sim.meanPTS40 == null || sim.meanFGA40 == null) return { value: null, evaluated: false, reason: 'denominador nulo o ancla no válida' }; return { value: Math.abs(sim.meanPTS40 / det.meanPTS40 - 1) + Math.abs(sim.meanFGA40 / det.meanFGA40 - 1), evaluated: true, parts: { pts: sim.meanPTS40 / det.meanPTS40 - 1, fga: sim.meanFGA40 / det.meanFGA40 - 1 } }; }
export function lossZ(sim, det) { if (!(det.zoneTotal > 0) || !(sim.zoneTotal > 0)) return { value: null, evaluated: false, reason: 'denominador nulo o ancla no válida' }; const parts = Object.fromEntries(ZONES.map((z) => [z, sim.zoneShare[z] - det.zoneShare[z]])); return { value: sumBy(ZONES, (z) => Math.abs(parts[z])), evaluated: true, parts }; }
export function lossA(sim, det) { if (!(det.fgm > 0) || !(sim.fgm > 0) || det.astPerFgm == null || sim.astPerFgm == null) return { value: null, evaluated: false, reason: 'denominador nulo o ancla no válida' }; return { value: Math.abs(sim.astPerFgm - det.astPerFgm), evaluated: true, parts: { sim: sim.astPerFgm, det: det.astPerFgm } }; }

// Frecuencia de actuaciones de equipo con algún jugador de ≥ 40 min en partidos SIN prórroga (segundos originales, sin redondear antes; precisión contractual de tres decimales).
export function fortyMinuteFrequency(tables, caseIds, resolver) {
  const want = new Set(caseIds); const noOT = new Set(); for (const r of tables.team) if (r[ci('resolver')] === resolver && want.has(r[ci('case_id')]) && r[ci('status')] === 'finished' && !(r[ci('overtimes')] > 0)) noOT.add(r[ci('case_id')]);
  const by = new Map(); for (const r of tables.player) { if (r[pi('resolver')] !== resolver || !noOT.has(r[pi('case_id')])) continue; const k = `${r[pi('case_id')]}|${r[pi('team_index')]}`; by.set(k, Math.max(by.get(k) ?? 0, r[pi('seconds')] ?? 0)); }
  let n = 0; let hit = 0; for (const [, mx] of by) { n++; if (mx >= 2400 - 0.0005) hit++; } return { teamPerformances: n, withFortyMinutes: hit, frequency: n ? hit / n : null };
}

const near = (a, b) => Math.abs(a - b) <= RULES.precision * Math.max(1, Math.abs(a), Math.abs(b));
// Etapa V/Z/A: `prev` = { value, loss, lossV? } (ganador provisional previo, ya ejecutado); `cands` = [{ value, id, loss, lossV? }]. `admissible` filtra (Z: L_V). Devuelve la decisión con todos los cálculos SIN redondear.
export function chooseStage({ stage, prev, cands, admissible = () => ({ ok: true }) }) {
  const log = []; const base = { ...prev, id: prev.id ?? 'previo' };
  if (prev.loss == null) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: 'métrica no evaluada con el valor previo: se conserva el valor previo', log, evaluated: false };
  if (prev.loss === 0) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: 'el valor previo tiene pérdida cero: se conserva', log, evaluated: true };
  const eligible = [];
  for (const c of cands) { if (c.loss == null) { log.push({ id: c.id, value: c.value, loss: null, verdict: 'no evaluado: se descarta' }); continue; } const adm = admissible(c, prev); if (!adm.ok) { log.push({ id: c.id, value: c.value, loss: c.loss, verdict: `inadmisible: ${adm.why}` }); continue; } eligible.push(c); log.push({ id: c.id, value: c.value, loss: c.loss, verdict: 'admisible', relativeReduction: (prev.loss - c.loss) / prev.loss }); }
  if (!eligible.length) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: 'ningún candidato admisible: se conserva el valor previo', log, evaluated: true };
  eligible.sort((a, b) => (near(a.loss, b.loss) ? 0 : a.loss - b.loss) || Math.abs(a.value - prev.value) - Math.abs(b.value - prev.value) || a.value - b.value);
  const best = eligible[0]; const red = (prev.loss - best.loss) / prev.loss;
  if (!(red >= RULES.minRelativeImprovement)) return { stage, chosen: base.value, chosenId: base.id, kept: true, reason: `mejor candidato ${best.id} reduce la pérdida ${(100 * red).toFixed(4)} % < 5 % relativo (o no la reduce): se conserva el valor previo`, bestCandidate: best.id, relativeReduction: red, log, evaluated: true };
  return { stage, chosen: best.value, chosenId: best.id, kept: false, reason: `${best.id} reduce la pérdida ${(100 * red).toFixed(4)} % ≥ 5 % relativo`, relativeReduction: red, log, evaluated: true };
}
export const zAdmissible = (c, prev) => { const allow = Math.max(0.02, 0.1 * prev.lossV); const worse = c.lossV - prev.lossV; return worse <= allow + 1e-12 ? { ok: true, worse, allow } : { ok: false, why: `L_V empeora ${worse} > ${allow}`, worse, allow }; };
// Etapa E: `prev` ganador con gasto 2 y `cands` con {value, id, lossV, lossA, freq40, checks:{superior30, relief}}. Elige el MENOR gasto que cumple las tres condiciones; si ninguno, conserva 2.
export function chooseEnergy({ prev, cands }) {
  const log = []; const ok = [];
  for (const c of cands.slice().sort((a, b) => a.value - b.value)) {
    const red = prev.freq40 > 0 ? (prev.freq40 - c.freq40) / prev.freq40 : null; const dV = c.lossV - prev.lossV; const dA = c.lossA - prev.lossA;
    const c1 = red != null && red >= 0.2; const allowV = Math.max(0.04, 0.2 * prev.lossV); const c2 = dV <= allowV + 1e-12 && dA <= 0.05 + 1e-12; const c3 = !!(c.checks?.superior30 && c.checks?.relief);
    log.push({ id: c.id, value: c.value, freq40: c.freq40, baselineFreq40: prev.freq40, relativeReduction: red, cond1_reduccion20: c1, dLossV: dV, allowLossV: allowV, dLossA: dA, allowLossA: 0.05, cond2_perdidas: c2, cond3_rotacion: c3, checks: c.checks ?? null, meets: c1 && c2 && c3 });
    if (c1 && c2 && c3) ok.push(c);
  }
  if (!ok.length) return { stage: 'E', chosen: prev.value, chosenId: prev.id ?? 'previo', kept: true, reason: 'ningún gasto cumple las tres condiciones: se conserva 2 y se entregan 3 y 3,5 como alternativas con el motivo de no elección', log };
  const c = ok[0]; return { stage: 'E', chosen: c.value, chosenId: c.id, kept: false, reason: `${c.id} es el menor gasto que cumple las tres condiciones`, log };
}
