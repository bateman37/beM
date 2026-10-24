// SIM-MOTOR-04E · buscador determinista acotado (§9 y §10). Lógica PURA: la evaluación de un vector se inyecta (`evaluate(vec, ctx) → { errs }`), de modo que la suite lo prueba con objetivos sintéticos y la campaña lo
// ejecuta con las SIM reales. No hay biblioteca de optimización, IA ni modelo: un descenso por coordenadas con pasos pequeños, operadores conjuntos declarados y cuatro reparaciones, con presupuesto cerrado.
//   · 14 coordenadas independientes (apartado 9.2), dominios y pasos fijos; el desempate favorece menos modificaciones.
//   · Función de exploración L_search = mean(max(r_i − 1, 0)²) + 0,05 × mean(r_i²) (no sustituye a M ni concede aceptación). Las guardas de no empeoramiento NO se aplican a los vecinos intermedios.
//   · Fase A (≤ 4 inicios) → B (≤ 56 vecinos, dos centros) → C (≤ 4 movimientos conjuntos) → D (≤ 28 vecinos, medio paso) = ≤ 92 perfiles sobre DEV-A (4.416 SIM); lista corta de ≤ 5 sobre DEV-B (120 SIM);
//   cuatro reparaciones sobre el desarrollo conjunto (≤ 288 SIM); total ≤ 4.824 SIM de ajuste.
import { createHash } from 'node:crypto';
import * as S from './select.js';

export const SEARCH_ID = 'SRCH-SIM04E-R1';
export const PRECISION = 1e-9;
const r9 = (x) => Math.round(x * 1e9) / 1e9;
export const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');

// Coordenadas en el orden fijo de la tabla del apartado 9.2: V, R, M, T, O, A, S, L, E, F, C, P3, P2, B.
export const ORDER = ['V', 'R', 'M', 'T', 'O', 'A', 'S', 'L', 'E', 'F', 'C', 'P3', 'P2', 'B'];
export const BLOCK_ZONES = ['rim', 'inside', 'midrange', 'three']; // B escala los cuatro `shots.<zona>.blockP0` (los libres quedan excluidos)
const FIXED = [
  { path: 'assist.eligibleFinalPassP0', value: 0.9 }, { path: 'energy.costPerLiveMinute', value: 3 }, { path: 'opportunity.simRimQualityLogit', value: 0.5 },
  { path: 'opportunity.simInsideQualityLogit', value: 0.5 }, { path: 'conversion.simInsideLogitOffset', value: 0.3 },
]; // entrega final 0,90 · energía 3 · calidad aro 0,5 · calidad inside 0,5 · conversión inside 0,30
const PATHS = { V: 'volume.neutralSecondsPerControl', R: 'shotMix.rimWeightFactor', M: 'shotMix.midrangeWeightFactor', T: 'shotMix.threeWeightFactor', O: 'rebound.organizedResetP0', A: 'assist.receivedAdvantageP0',
  S: 'assist.spontaneousPassOddsFactor', L: 'outcomes.simOrdinaryTurnoverWeightFactor', E: 'outcomes.simStealGivenEligibleTurnoverLogit', F: 'outcomes.simShootingFoulWeightFactor', C: 'conversion.simRimLogitOffset',
  P3: 'shots.three.p0', P2: 'shots.midrange.p0', B: 'shots.{rim,inside,midrange,three}.blockP0 × factor' };

// `base`: valores efectivos de SIM_04E_BASE para las filas relativas (P3, P2 y los cuatro blockP0).
export function buildConfig(base) {
  const clip01 = (lo, hi) => [Math.max(lo, 1e-6), Math.min(hi, 1 - 1e-6)];
  const [p3lo, p3hi] = clip01(base.p3 - 0.02, base.p3 + 0.02); const [p2lo, p2hi] = clip01(base.p2 - 0.02, base.p2 + 0.02);
  const coords = {
    V: { lo: 18, hi: 22, step: 0.5 }, R: { lo: 0.75, hi: 2.5, step: 0.25 }, M: { lo: 0.30, hi: 1.20, step: 0.15 }, T: { lo: 0.35, hi: 0.95, step: 0.10 }, O: { lo: 0.25, hi: 0.95, step: 0.15 },
    A: { lo: 0, hi: 1, step: 0.25 }, S: { lo: 1, hi: 2, step: 0.25 }, L: { lo: 0.60, hi: 1.20, step: 0.10 }, E: { lo: 0, hi: 1, step: 0.20 }, F: { lo: 0.80, hi: 1.30, step: 0.10 }, C: { lo: 0, hi: 0.25, step: 0.05 },
    P3: { lo: p3lo, hi: p3hi, step: 0.01 }, P2: { lo: p2lo, hi: p2hi, step: 0.01 }, B: { lo: 0.75, hi: 1.25, step: 0.10 },
  };
  for (const id of ORDER) { coords[id].id = id; coords[id].path = PATHS[id]; coords[id].range = coords[id].hi - coords[id].lo; }
  const s0 = { V: 19.5, R: 1.5, M: 1, T: 0.70, O: 0.35, A: 0, S: 1, L: 1, E: 0, F: 1, C: 0, P3: base.p3, P2: base.p2, B: 1 };
  // S1: el vector completo Z8-A2 de 04D como hipótesis anterior (sin aceptación previa); sus filas fijas son las del apartado 9.
  const s1 = { ...s0, R: 2.5, O: 0.85, M: 0.70, T: 0.60, C: 0.15, A: 1, S: 2, L: 0.80, E: 0.70, F: 1.10 };
  return { coords, s0, s1, fixed: FIXED, base };
}
export const clipTo = (cfg, id, x) => r9(Math.min(cfg.coords[id].hi, Math.max(cfg.coords[id].lo, x)));
export const normalize = (cfg, vec) => Object.fromEntries(ORDER.map((id) => [id, clipTo(cfg, id, vec[id])]));
export const sameVec = (a, b) => ORDER.every((id) => Math.abs(a[id] - b[id]) < 1e-12);

// Filas efectivas completas (fijas + 14 coordenadas con B expandida desde la MISMA base, nunca acumulando escalados) y su huella: el identificador de un perfil es su vector efectivo, no su nombre.
export function toOverrides(cfg, vec) {
  const rows = [...cfg.fixed];
  for (const id of ORDER) {
    if (id === 'B') { for (const z of BLOCK_ZONES) rows.push({ path: `shots.${z}.blockP0`, value: r9(cfg.base.block[z] * vec.B) }); continue; }
    rows.push({ path: PATHS[id], value: r9(vec[id]) });
  }
  return rows;
}
export const vectorId = (cfg, vec) => `V-${sha(toOverrides(cfg, vec).map((r) => [r.path, r.value])).slice(0, 12)}`;
export const rowsChanged = (cfg, vec) => ORDER.filter((id) => Math.abs(vec[id] - cfg.s0[id]) > 1e-12).length;
export const distance = (cfg, vec) => ORDER.reduce((s, id) => s + Math.abs(vec[id] - cfg.s0[id]) / cfg.coords[id].range, 0);

// ---------------------------------------------------------------------------------------------------------------------------------- reequilibrio de zonas, movimientos conjuntos y reparaciones
const ZKEY = { rim: 'rim_share', inside: 'inside_share', mid: 'mid_share', three: 'three_share' };
// §10.3: u_z = sqrt(d_z / s_z) con inside como referencia: se multiplican los pesos de aro/media/triple por u_z / u_inside, limitados a sus dominios. Cuota nula → se omite con causa (sin épsilon deportivo).
export function rebalance(cfg, vec, errs) {
  const g = (k) => errs.find((e) => e.id === ZKEY[k]); const s = {}; const d = {};
  for (const k of Object.keys(ZKEY)) { const e = g(k); if (!e || e.sim == null || e.det == null) return { vec: null, cause: `cuota ${k} no evaluable` }; if (!(e.sim > 0) || !(e.det > 0)) return { vec: null, cause: `cuota ${k} nula (SIM ${e.sim}, DET ${e.det})` }; s[k] = e.sim; d[k] = e.det; }
  const u = Object.fromEntries(Object.keys(ZKEY).map((k) => [k, Math.sqrt(d[k] / s[k])]));
  const out = { ...vec }; out.R = clipTo(cfg, 'R', vec.R * (u.rim / u.inside)); out.M = clipTo(cfg, 'M', vec.M * (u.mid / u.inside)); out.T = clipTo(cfg, 'T', vec.T * (u.three / u.inside));
  return { vec: out, cause: null, u, s, d };
}
// §10.4.3: cuatro movimientos conjuntos desde el mismo punto sellado (R = reequilibrio, V+L−, L−E+, F+L−).
export function jointMoves(cfg, vec, errs) {
  const st = (id) => cfg.coords[id].step; const mv = (changes) => { const o = { ...vec }; for (const [id, dlt] of Object.entries(changes)) o[id] = clipTo(cfg, id, vec[id] + dlt); return o; };
  const rb = rebalance(cfg, vec, errs);
  return [{ op: 'reequilibrio_zonas', vec: rb.vec, cause: rb.cause }, { op: 'V+paso_L-paso', vec: mv({ V: st('V'), L: -st('L') }) }, { op: 'L-paso_E+paso', vec: mv({ L: -st('L'), E: st('E') }) }, { op: 'F+paso_L-paso', vec: mv({ F: st('F'), L: -st('L') }) }];
}
// §10.5: reparaciones R1→R4 desde el centro vigente (cada operador usa los cocientes del centro que recibe); una coordenada con cociente indefinido se omite con causa.
export function repairVector(cfg, op, vec, errs) {
  const m = (id) => errs.find((e) => e.id === id); const clip = (x, lo, hi) => Math.min(hi, Math.max(lo, x)); const out = { ...vec }; const omitted = []; const ratios = {};
  const need = (id) => { const e = m(id); if (!e || !(e.sim > 0) || !(e.det > 0)) { omitted.push(`${id}: cociente no definido`); return null; } return e; };
  if (op === 'R1') { const rb = rebalance(cfg, vec, errs); if (!rb.vec) return { vec: null, omitted: [rb.cause], ratios }; return { vec: rb.vec, omitted, ratios: rb.u }; }
  if (op === 'R2') { const e = need('fga'); if (e) { ratios.fga = clip(e.sim / e.det, 0.95, 1.05); out.V = clipTo(cfg, 'V', vec.V * ratios.fga); } }
  if (op === 'R3') {
    const t = need('tov'); if (t) { ratios.tov = clip(t.det / t.sim, 0.90, 1.10); out.L = clipTo(cfg, 'L', vec.L * ratios.tov); }
    const f = need('fta'); if (f) { ratios.fta = clip(f.det / f.sim, 0.90, 1.10); out.F = clipTo(cfg, 'F', vec.F * ratios.fta); }
    const s = need('stl'); if (s) { ratios.stl = clip(Math.log(s.det / s.sim), -0.10, 0.10); out.E = clipTo(cfg, 'E', vec.E + ratios.stl); }
  }
  if (op === 'R4') {
    const a = need('ast_fg'); if (a) { ratios.ast_fg = clip(a.det / a.sim, 0.90, 1.10); out.S = clipTo(cfg, 'S', vec.S * ratios.ast_fg); const delta = a.sim < a.det ? 0.05 : a.sim > a.det ? -0.05 : 0; out.A = clipTo(cfg, 'A', vec.A + delta); ratios.A_delta = delta; }
  }
  return { vec: out, omitted, ratios };
}

// ---------------------------------------------------------------------------------------------------------------------------------- comparaciones y guardas
// Mejora estricta de L_search por más de 1e-9; orden de centros: menor L, menor M, menos bandas incumplidas, menos filas alteradas, ID estable.
export const improves = (a, b) => a.L < b.L - PRECISION;
export function byCenter(cfg) {
  return (a, b) => (Math.abs(a.L - b.L) > PRECISION ? a.L - b.L : (a.M ?? Infinity) - (b.M ?? Infinity) || a.violated - b.violated || rowsChanged(cfg, a.vec) - rowsChanged(cfg, b.vec) || (a.id < b.id ? -1 : 1));
}
// Guardas de no empeoramiento frente a S0 (e0): conteos e ≤ max(0,05; e0 + 0,02) · acierto e ≤ max(0,03; e0 + 0,005) · cuotas e ≤ max(0,03; e0 + 0,01) · calidad forzada de aro e inside no empeora > 0,02.
export function guardsOf(control, cand) {
  const by = new Map(control.map((e) => [e.id, e])); const fails = []; const checks = [];
  for (const e of cand) {
    const c = by.get(e.id); if (!c) continue;
    if (e.kind === 'forced') { if (e.error == null || c.error == null) { fails.push({ id: e.id, why: 'calidad forzada no evaluable' }); continue; } const lim = c.error + 0.02; const ok = e.error <= lim + 1e-12; checks.push({ id: e.id, ok, error: e.error, limit: lim, control: c.error }); if (!ok) fails.push({ id: e.id, why: 'empeora más de 0,02 frente a S0', error: e.error, limit: lim }); continue; }
    if (e.error == null || c.error == null) { fails.push({ id: e.id, why: `no evaluable (${e.status}/${c.status})` }); continue; }
    const lim = e.kind === 'count' ? Math.max(S.BAND_COUNT, c.error + 0.02) : e.kind === 'rate' ? Math.max(S.BAND_RATE, c.error + 0.005) : Math.max(S.BAND_SHARE, c.error + 0.01);
    const ok = e.error <= lim + 1e-12; checks.push({ id: e.id, ok, error: e.error, limit: lim, control: c.error }); if (!ok) fails.push({ id: e.id, why: 'guarda incumplida', error: e.error, limit: lim, control: c.error });
  }
  return { ok: fails.length === 0, fails, checks };
}

// ---------------------------------------------------------------------------------------------------------------------------------- el buscador
// `evaluate(vec, { stage, parent, op, set }) → Promise<{ errs, invariantsOk }>` sobre DEV-A. Devuelve el registro completo de todos los perfiles evaluados (incluidos los descartados) con padre y operador.
export async function searchDevA({ cfg, evaluate, budget = { starts: 4, passes: 56, joint: 4, half: 28 } }) {
  const log = []; const evals = new Map(); const order = []; const counts = { starts: 0, passes: 0, joint: 0, half: 0 }; const reused = [];
  const mk = async (vec, meta, phase) => {
    const v = normalize(cfg, vec); const id = vectorId(cfg, v); const hit = evals.get(id);
    if (hit) { reused.push({ id, phase, ...meta }); return { e: hit, fresh: false }; }
    if (counts[phase] >= budget[phase]) return { e: null, fresh: false, overBudget: true };
    const r = await evaluate(v, { id, phase, ...meta }); const sc = S.scoreM(r.errs); const e = { id, vec: v, errs: r.errs, invariantsOk: r.invariantsOk !== false, L: sc.L, M: sc.M, partialM: sc.partialM, violated: sc.violated, dominant: sc.dominant, missing: sc.missing, phase, op: meta.op ?? null, parent: meta.parent ?? null, seq: order.length + 1 };
    evals.set(id, e); order.push(id); counts[phase] += 1; log.push({ seq: e.seq, id, phase, op: e.op, parent: e.parent, L: e.L, M: e.M, violated: e.violated, changed: rowsChanged(cfg, v) }); return { e, fresh: true };
  };
  const cmp = byCenter(cfg);
  const sorted = () => [...evals.values()].sort(cmp);
  // Fase A · cuatro inicios completos: S0, S1, S2 (S0 con reequilibrio) y S3 (S1 con reequilibrio)
  const s0 = (await mk(cfg.s0, { op: 'S0', parent: null, label: 'S0' }, 'starts')).e; const s1 = (await mk(cfg.s1, { op: 'S1', parent: null, label: 'S1' }, 'starts')).e;
  const derived = [];
  for (const [lab, from] of [['S2', s0], ['S3', s1]]) { const rb = rebalance(cfg, from.vec, from.errs); if (!rb.vec) { derived.push({ label: lab, omitted: rb.cause }); continue; } const r = await mk(rb.vec, { op: lab, parent: from.id, label: lab }, 'starts'); derived.push({ label: lab, id: r.e?.id ?? null, fresh: r.fresh, from: from.id }); }
  // Fase B · dos centros distintos (menor L_search y menor M; si coinciden, el siguiente por L_search) y una pasada secuencial por las catorce coordenadas desde cada uno
  const starts = sorted(); const centerL = starts[0]; const byM = [...starts].sort((a, b) => ((a.M ?? Infinity) - (b.M ?? Infinity)) || cmp(a, b)); let centerM = byM[0]; if (centerM.id === centerL.id) centerM = starts.find((x) => x.id !== centerL.id) ?? null;
  const centers = [centerL, centerM].filter(Boolean); const passLog = [];
  const pass = async (center0, scale, phase, tag) => {
    let center = center0; const list = [];
    for (const id of ORDER) {
      const step = cfg.coords[id].step * scale; const cands = [];
      for (const sign of [-1, 1]) { const v = { ...center.vec, [id]: clipTo(cfg, id, center.vec[id] + sign * step) }; if (sameVec(v, center.vec)) continue; const r = await mk(v, { op: `${tag}:${id}${sign < 0 ? '-' : '+'}`, parent: center.id }, phase); if (r.e) cands.push(r.e); }
      const best = cands.filter((c) => improves(c, center)).sort(cmp)[0] ?? null; list.push({ coordinate: id, from: center.id, tried: cands.map((c) => c.id), adopted: best?.id ?? null }); if (best) center = best;
    }
    return { start: center0.id, end: center.id, steps: list };
  };
  for (const c of centers) passLog.push(await pass(c, 1, 'passes', `B${c.id.slice(2, 6)}`));
  // Fase C · desde el mejor resultado por L_search (punto sellado antes de los cuatro movimientos)
  const sealed = sorted()[0]; const joints = [];
  for (const mv of jointMoves(cfg, sealed.vec, sealed.errs)) { if (!mv.vec) { joints.push({ op: mv.op, omitted: mv.cause }); continue; } const r = await mk(mv.vec, { op: `C:${mv.op}`, parent: sealed.id }, 'joint'); joints.push({ op: mv.op, id: r.e?.id ?? null, fresh: r.fresh }); }
  // Fase D · mejor centro por L_search entre todos los evaluados y otra pasada con medio paso
  const centerD = sorted()[0]; const half = await pass(centerD, 0.5, 'half', 'D');
  return { evals, order, log, counts, reused, derived, centers: centers.map((c) => c.id), passes: passLog, sealed: sealed.id, joints, half, centerD: centerD.id, sortedIds: sorted().map((e) => e.id) };
}

// §10.5 · lista corta (≤ 4 alternativas distintas + S0) sin leer DEV-B. Criterios en orden: menor M, menor L_search, menos bandas incumplidas y mejor alternativa que cumpla guardas en DEV-A; se completa por menor L_search.
export function shortList(cfg, evals, s0id) {
  const s0 = evals.get(s0id); const alts = [...evals.values()].filter((e) => e.id !== s0id && e.invariantsOk && e.M != null); const cmp = byCenter(cfg); const pick = []; const notes = [];
  const add = (label, e) => { if (!e) { notes.push({ criterion: label, result: 'sin alternativa' }); return; } if (pick.some((p) => p.id === e.id)) { notes.push({ criterion: label, result: `ya incluida (${e.id})` }); return; } pick.push(e); notes.push({ criterion: label, result: e.id }); };
  add('menor M', [...alts].sort((a, b) => (Math.abs(a.M - b.M) > PRECISION ? a.M - b.M : cmp(a, b)))[0]);
  add('menor L_search', [...alts].sort(cmp)[0]);
  add('menos bandas incumplidas', [...alts].sort((a, b) => a.violated - b.violated || cmp(a, b))[0]);
  add('mejor alternativa que cumple guardas (DEV-A)', alts.filter((e) => guardsOf(s0.errs, e.errs).ok).sort((a, b) => (Math.abs(a.M - b.M) > PRECISION ? a.M - b.M : cmp(a, b)))[0]);
  for (const e of [...alts].sort(cmp)) { if (pick.length >= 4) break; if (!pick.some((p) => p.id === e.id)) { pick.push(e); notes.push({ criterion: 'plaza completada por menor L_search', result: e.id }); } }
  return { ids: [s0id, ...pick.map((p) => p.id)], alternatives: pick.map((p) => p.id), notes };
}

// §10.5 · reparaciones R1→R4 sobre el desarrollo conjunto: desde el mejor perfil de la lista por M conjunto; si mejora L_search (> 1e-9) es el centro de la siguiente. Se conservan las rechazadas.
export async function repairs({ cfg, joint, evaluateJoint }) {
  // joint: Map id → evaluación conjunta de los perfiles de la lista corta
  const cmp = byCenter(cfg); const start = [...joint.values()].sort((a, b) => ((a.M ?? Infinity) - (b.M ?? Infinity)) || cmp(a, b))[0]; let center = start; const out = []; const evals = new Map(joint);
  for (const op of ['R1', 'R2', 'R3', 'R4']) {
    const r = repairVector(cfg, op, center.vec, center.errs);
    if (!r.vec) { out.push({ op, center: center.id, omitted: r.omitted, id: null, adopted: false }); continue; }
    const v = normalize(cfg, r.vec); const id = vectorId(cfg, v);
    if (evals.has(id)) { out.push({ op, center: center.id, id, duplicate: true, adopted: false, ratios: r.ratios, omitted: r.omitted }); continue; }
    const res = await evaluateJoint(v, { id, op, parent: center.id }); const sc = S.scoreM(res.errs); const e = { id, vec: v, errs: res.errs, invariantsOk: res.invariantsOk !== false, L: sc.L, M: sc.M, partialM: sc.partialM, violated: sc.violated, dominant: sc.dominant, missing: sc.missing, op, parent: center.id };
    evals.set(id, e); const adopt = improves(e, center); out.push({ op, center: center.id, id, adopted: adopt, ratios: r.ratios, omitted: r.omitted, L: e.L, M: e.M }); if (adopt) center = e;
  }
  return { start: start.id, repairs: out, evals, finalCenter: center.id };
}

// §10.6 · criterio final: solo perfiles con desarrollo conjunto completo; guardas frente a S0 sobre las mismas 72 entradas; menor M entre los admisibles; mejora relativa ≥ 5 % para recomendar sustitución (y, si S0 ya cumple M ≤ 1, la alternativa también).
export function finalSelect(cfg, joint, s0id) {
  const s0 = joint.get(s0id); const cmp = byCenter(cfg); const rows = [];
  for (const e of joint.values()) {
    const g = guardsOf(s0.errs, e.errs); const reasons = [];
    if (!e.invariantsOk) reasons.push('invariantes o casos no válidos'); if (e.missing.length) reasons.push(`métricas no evaluadas: ${e.missing.map((m) => m.id).join(',')}`); if (!g.ok && e.id !== s0id) reasons.push(`guardas: ${g.fails.map((f) => f.id).join(',')}`);
    rows.push({ id: e.id, M: e.M, L: e.L, violated: e.violated, dominant: e.dominant, admissible: reasons.length === 0, reasons, guards: g, rowsChanged: rowsChanged(cfg, e.vec), distance: distance(cfg, e.vec), op: e.op ?? null });
  }
  const order = (a, b) => (Math.abs(a.M - b.M) > PRECISION ? a.M - b.M : Math.abs(a.L - b.L) > PRECISION ? a.L - b.L : a.rowsChanged - b.rowsChanged || (Math.abs(a.distance - b.distance) > PRECISION ? a.distance - b.distance : 0) || (a.id < b.id ? -1 : 1));
  const adm = rows.filter((r) => r.admissible && r.M != null).sort(order); const best = adm[0] ?? null; const s0r = rows.find((r) => r.id === s0id);
  const improvement = best && s0r.M ? (s0r.M - best.M) / s0r.M : null;
  let replace = !!(best && best.id !== s0id && improvement >= 0.05 - 1e-12); if (replace && s0r.M <= 1 && !(best.M <= 1)) replace = false;
  const experimentalPool = rows.filter((r) => r.id !== s0id && r.M != null && r.reasons.every((x) => x.startsWith('guardas'))).sort(order); // la mejor experimental: menor M aunque incumpla guardas (nunca activable)
  const exp = experimentalPool.find((r) => r.id !== (replace ? best.id : s0id)) ?? null;
  return { recommendedId: replace ? best.id : s0id, keptControl: !replace, s0: { id: s0id, M: s0r.M, L: s0r.L, violated: s0r.violated, dominant: s0r.dominant }, best: best ? { id: best.id, M: best.M, improvement } : null, experimentalId: exp?.id ?? null, rows: rows.sort(order),
    reason: replace ? `${best.id} mejora M un ${(100 * improvement).toFixed(2)} % (≥ 5 %) y cumple todas las guardas frente a S0` : best && best.id !== s0id ? `ninguna sustitución recomendable (mejor admisible ${best.id}: mejora ${(100 * improvement).toFixed(2)} %${s0r.M <= 1 ? '; S0 ya cumple M ≤ 1' : ''})` : 'ninguna alternativa admisible: se conserva S0' };
}

// ---------------------------------------------------------------------------------------------------------------------------------- reglas congeladas (hash)
export function buildRules(cfg) {
  return {
    id: SEARCH_ID, selectionRules: S.RULES_ID, precision: PRECISION,
    objective: 'L_search = mean(max(r_i − 1, 0)²) + 0,05 × mean(r_i²), r_i = error_i / banda_i, sobre las 31 métricas evaluables de DEV; auxiliar de exploración: no modifica bandas, no sustituye a M y no concede aceptación',
    bands: { counts: S.BAND_COUNT, rates: S.BAND_RATE, shares: S.BAND_SHARE },
    coordinates: Object.fromEntries(ORDER.map((id) => [id, { path: PATHS[id], lo: cfg.coords[id].lo, hi: cfg.coords[id].hi, step: cfg.coords[id].step }])), coordinateOrder: ORDER,
    fixed: cfg.fixed, base: cfg.base, startVectors: { S0: cfg.s0, S1: cfg.s1, S2: 'S0 con reequilibrio de zonas u_z = sqrt(d_z/s_z), referencia inside', S3: 'S1 con el mismo reequilibrio' },
    sets: { devA: '48 entradas de desarrollo de 04D (VAL04C)', devB: '24 entradas de VAL04D: (01,04),(07,10),(02,05),(08,11),(03,06),(09,12), ambas orientaciones, réplicas 1 y 2', joint: '72 entradas (DEV-A + DEV-B), mismo peso por actuación' },
    phases: { A: 'S0, S1, S2, S3 (≤ 4 perfiles distintos)', B: 'dos centros (menor L_search y menor M), una pasada secuencial por catorce coordenadas, vecinos ±paso desde el centro vigente (≤ 56)', C: 'cuatro movimientos conjuntos desde el punto sellado: reequilibrio · V+paso y L−paso · L−paso y E+paso · F+paso y L−paso', D: 'mejor centro por L_search, otra pasada con medio paso (≤ 28)', improvement: 'diferencia de L_search > 1e−9; los empates conservan el centro', neighborOrder: 'coordenada de la tabla; signo negativo antes del positivo; sin duplicar neutros ni límites' },
    budget: { devAProfiles: 92, devASims: 92 * 48, shortListSims: 5 * 24, repairsSims: 4 * 72, totalSimsMax: 92 * 48 + 5 * 24 + 4 * 72 },
    shortList: 'hasta 4 alternativas distintas + S0, sin leer DEV-B: menor M, menor L_search, menos bandas incumplidas y mejor alternativa que cumpla guardas; completar por menor L_search',
    repairs: { R1: 'reequilibrio de zonas (u_z sobre el desarrollo conjunto)', R2: 'V × clip(FGA_SIM40/FGA_DET40; 0,95; 1,05)', R3: 'L × clip(TOV_DET40/TOV_SIM40; 0,90; 1,10); F × clip(FTA_DET40/FTA_SIM40; 0,90; 1,10); E + clip(log(STL_DET40/STL_SIM40); −0,10; 0,10)', R4: 'S × clip(AST_FG_DET40/AST_FG_SIM40; 0,90; 1,10); A ± 0,05 según falten o sobren AST', rule: 'una sola pasada R1→R4 desde el mejor perfil de la lista por M conjunto; si mejora L_search pasa a ser el centro de la siguiente' },
    guards: 'frente a S0 sobre las mismas 72 entradas: conteo e ≤ max(0,05; e0 + 0,02) · acierto e ≤ max(0,03; e0 + 0,005) · cuota e ≤ max(0,03; e0 + 0,01) · calidad forzada de aro e inside no empeora > 0,02 · invariantes sin tolerancia (no se aplican a los vecinos intermedios)',
    final: 'menor M entre los admisibles; empate 1e−9: menor L_search, menos filas modificadas, menor distancia normalizada a S0 por dominios, ID; sustitución solo con mejora relativa de M ≥ 5 % (y si S0 ya tiene M ≤ 1, la alternativa también); sin admisible se conserva S0 como recomendada y la mejor experimental se entrega aparte con sus guardas incumplidas; nunca se activa',
    valUse: 'VAL04E no participa en ninguna decisión: el buscador, la lista corta, las reparaciones y la elección final solo leen DEV-A y DEV-B',
  };
}
export const rulesHash = (cfg) => sha(buildRules(cfg));
