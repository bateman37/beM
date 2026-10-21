// Fórmulas deportivas compartidas por el motor y por las previsualizaciones del panel (MOTOR-03, §4.2 y §7.4).
// Una sola implementación: el panel dibuja ejemplos con estas mismas funciones, sin consumir azar ni tocar una sesión.
import { sigmoid, logit, interpolate, a01 } from './mathx.js';

// Probabilidad de un tiro: logit(p0) + sA·(A − N) [− sD·(D − N)] + K, con N la referencia de capacidad neutra del perfil.
// A: capacidad ofensiva efectiva; D: defensiva efectiva (null si no hay oposición); K: ajuste logit (calidad, contacto, preparación).
export function shotLogit(profile, sh, A, D, K) {
  const N = profile.neutralAbility;
  let pr = logit(sh.p0) + sh.sA * (A - N) + K;
  if (D != null) pr -= sh.sD * (D - N);
  return pr;
}
export const shotProbability = (profile, sh, A, D, K) => sigmoid(shotLogit(profile, sh, A, D, K));

// Gravedad de fatiga (0-1) por energía según la curva de nodos del perfil, y penalización efectiva de una tarea.
export const severityAt = (profile, energy) => interpolate(profile.energy.severityNodes, energy);
export const taskPenalty = (profile, energy, taskMax) => severityAt(profile, energy) * taskMax;

// Pesos relativos → distribución normalizada sobre el conjunto declarado (solo w > 0 participan, como en MatchCore.pick).
export function normalizeWeights(items) {
  const els = items.filter((i) => i.w > 0);
  const total = els.reduce((s, i) => s + i.w, 0);
  return items.map((i) => ({ ...i, p: i.w > 0 && total > 0 ? i.w / total : 0 }));
}

// Factor de vocación de finalización: a + b·v (filas selection.finishingVocationMix).
export const vocationFactor = (profile, v) => { const m = profile.selection.finishingVocationMix; return m[0] + m[1] * v; };

// Ajuste por capacidad (abilityFit): 1 + pendiente·(x − N) acotado.
export function abilityFit(profile, x) {
  const f = profile.selection.abilityFit;
  return Math.min(f.max, Math.max(f.min, 1 + f.slope * (x - profile.neutralAbility)));
}

// ---------------------------------------------------------------- estados deportivos (MOTOR-07): funciones puras compartidas con el panel
// Binaria: p_m = p + alpha·Z·min(p, 1 − p). Con |Z| ≤ 1 y alpha < 1 la salida queda dentro de (0, 1) sin recortes artificiales.
export const perturbBinary = (p, Z, alpha) => p + alpha * Z * Math.min(p, 1 - p);
// Distribución excluyente: P_G = Σ p_j (j ∈ G); v_j = p_j(1 − P_G) en G y −p_j·P_G fuera (suma cero); p'_j = p_j + alpha·Z·v_j.
export function perturbCategories(probs, favorable, Z, alpha) {
  const fav = new Set(favorable);
  const PG = Object.entries(probs).reduce((s, [k, p]) => s + (fav.has(k) ? p : 0), 0);
  const out = {};
  for (const [k, p] of Object.entries(probs)) out[k] = p + alpha * Z * (fav.has(k) ? p * (1 - PG) : -p * PG);
  return out;
}
// Amplitud de la variación del momento con Consistencia c (MEN06): sigma(C) = alta − (alta − baja)·a(C), con a(C) = (C − 1)/29.
export const consistencySigmaAt = (profile, c) => profile.moment.innovationSigmaLowConsistency - (profile.moment.innovationSigmaLowConsistency - profile.moment.innovationSigmaHighConsistency) * a01(c);
// Pérdida de referencia por presión (logit) del ejecutante: k·P·(1 − a(MEN07)); MEN07 reduce la pérdida, no añade talento.
export const pressureLossLogit = (profile, scope, P, men07) => profile.pressure.taskMaxLogitLoss[scope] * P * (1 - a01(men07));
// MOTOR-14: operaciones puras comunes del productor y del contraste (sin partido, sin azar). Misma aritmética que usaba el núcleo.
// Factor de gasto de energía por Resistencia (FIS06): acotado.
export const enduranceFactorAt = (profile, fis06) => { const e = profile.energy; return Math.min(e.enduranceFactorBounds[1], Math.max(e.enduranceFactorBounds[0], 1 - e.enduranceSlope * (fis06 - e.baseEnduranceReference))); };
// Lectura q de la selección: (MEN02·a + MEN03·b − 1)/29 con MEN03 ya penalizado por la presión; sin acotar (el llamante acota a [0,1]).
export const readingQRaw = (profile, men02Eff, men03Eff) => (profile.selection.readingMix.MEN02 * men02Eff + profile.selection.readingMix.MEN03 * men03Eff - 1) / 29;
// Categoría cualitativa (0 = la más baja) según las cuatro fronteras declaradas.
export function momentCategory(profile, v) {
  const b = profile.moment.categoryBoundaries; let i = 0;
  while (i < b.length && v >= b[i]) i += 1;
  return i;
}
export const CATEGORY_LABELS = {
  momento: ['Muy frío', 'Frío', 'Estable', 'Caliente', 'Muy caliente'],
  forma: ['Muy mala', 'Mala', 'Normal', 'Buena', 'Muy buena'],
  equipo: ['Muy desconectado', 'Desconectado', 'Neutral', 'Conectado', 'Muy conectado'],
};

// ---------------------------------------------------------------------------------------------------------------- MOTOR-17B: operaciones puras de CONSUMO (B17-02)
// El productor y el contraste de sensibilidad de la auditoría llaman a ESTAS funciones (no hay una fórmula parecida solo para el auditor). Misma aritmética y mismo orden que tenía el núcleo; ninguna sortea,
// lee estado ni modifica nada. Cada una recibe las entradas ya resueltas (recetas, estados, parámetros) y devuelve la salida que el motor consume.

// Conversión de un tiro (de campo o libre): sigmoide del logit, después el momento. A y D son las capacidades efectivas (D null sin oposición) y K el ajuste logit completo (calidad, contacto, preparación, Forma y presión).
export function shotResolution(profile, sh, { A, D, K, Z, alpha }) {
  const pBase = sigmoid(shotLogit(profile, sh, A, D, K));
  return { pBase, p: perturbBinary(pBase, Z, alpha) };
}
// Coste logit de la preparación del tiro con movimiento (TEC06 vía la receta TAR11): máximo · (1 − (prep − 1)/29).
export const shotPrepCostLogit = (profile, prep) => profile.shotPreparation.movementMaximumLogitCost * (1 - (prep - 1) / 29);
// Tapón: disputa del bloqueador (receta de tapón) frente a la resistencia del tirador.
export function blockResolution(profile, sh, { blk, resist, delta, Z, alpha }) {
  const b = profile.block; const N = profile.neutralAbility;
  const pBase = sigmoid(logit(sh.blockP0) + b.sA * (blk - N) - b.sD * (resist - N) + delta);
  return { pBase, p: perturbBinary(pBase, Z, alpha) };
}
// Rebote ofensivo del equipo: diferencia de fuerza media de cierre (ataque − defensa) sobre la referencia de la fila.
export function reboundTeamResolution(profile, { p0, RA, RD, K, fpDelta, Z, alpha, hasOffense }) {
  const rb = profile.rebound;
  const pBase = hasOffense ? sigmoid(logit(p0) + rb.sensitivity * (RA - RD) + K + fpDelta) : 0;
  return { pBase, p: hasOffense ? perturbBinary(pBase, Z, alpha) : 0 };
}
// Disputa de un balón suelto: probabilidad de que lo conserve el ataque.
export const looseControlP = (profile, ra, rd) => sigmoid(profile.outcomes.looseControlSensitivity * (ra - rd));

// Calidad previa de la oportunidad (cómoda / normal / forzada). Una sola implementación para `qualityDistribution` (método) y para el contraste.
export function qualityDistributionPure(profile, caRaw, cdRaw, kctx, hasOpposition, noForced = false, extraZ = 0) {
  const opp = profile.opportunity;
  const kc = Math.min(opp.maximumQualityContextLogit, Math.max(-opp.maximumQualityContextLogit, kctx));
  const z = (hasOpposition ? opp.advantageSensitivity * (caRaw - cdRaw) + kc : opp.maximumQualityContextLogit) + extraZ;
  const base = opp.qualityBase;
  const items = [
    { key: 'comfortable', w: base.comfortable * Math.exp(z) },
    { key: 'normal', w: base.normal },
    { key: 'forced', w: noForced ? 0 : base.forced * Math.exp(-z) },
  ];
  const tot = items.reduce((a, b) => a + b.w, 0);
  return { z, kc, items, tot, p: Object.fromEntries(items.map((i) => [i.key, i.w / tot])) };
}
// Distribución final de la calidad (con el momento si procede): `Z` y `alpha` null = sin perturbación (el hecho no tenía estados de oportunidad).
export function qualityResolution(profile, { ca, cd, kctx, hasOpposition, noForced, extraZ, Z, alpha }) {
  const d = qualityDistributionPure(profile, ca, cd, kctx, hasOpposition, noForced, extraZ);
  if (Z == null) return { ...d, final: d.p };
  const final = perturbCategories(d.p, profile.stateTasks.tasks.opportunityQuality.favorableClasses, Z, alpha);
  return { ...d, final };
}

// Categorías del intento (pérdida, falta, balón suelto, tiro…): pesos y probabilidades. `spec`: { exec, off, def, hasOpposer, legalDef, hasDefend, legalOff, pressureFactor, fpDelta, Z, alpha }.
// `fpDelta` null = el hecho no usa estados (exec none): se devuelven los pesos sin normalizar (`w`), como hacía el núcleo.
export function categoryResolution(profile, spec) {
  const o = profile.outcomes; const base = o.base; const N = profile.neutralAbility; const w = {}; const z = {};
  if (spec.exec !== 'none') {
    z.turnover = spec.def != null ? o.controlSensitivity * (spec.def - spec.off) : -o.controlSensitivity * (spec.off - N);
    w.turnover = base.turnover * Math.exp(z.turnover);
  }
  if (spec.hasOpposer) {
    z.defFoul = o.defensiveFoulSensitivity * (N - spec.legalDef);
    w.defensiveNonShootingFoul = base.defensiveNonShootingFoul * Math.exp(z.defFoul);
    if (spec.hasDefend) w.shootingFoul = base.shootingFoul * Math.exp(z.defFoul);
    w.looseBall = base.looseBall * 1; z.loose = 0;
  }
  if (spec.legalOff != null) { z.offFoul = o.offensiveFoulSensitivity * (N - spec.legalOff); w.offensiveFoul = base.offensiveFoul * Math.exp(z.offFoul); }
  if (spec.exec === 'dribble') w.ballViolation = base.ballViolation;
  w.fieldShot = base.fieldShot;
  if (spec.pressureFactor != null) for (const k of ['turnover', 'defensiveNonShootingFoul', 'shootingFoul']) if (w[k] != null) w[k] *= spec.pressureFactor;
  if (spec.fpDelta != null) for (const k of ['turnover', 'ballViolation']) if (w[k] != null) w[k] *= Math.exp(-spec.fpDelta);
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  const probs = {}; for (const k of Object.keys(w)) probs[k] = w[k] / tot;
  if (spec.fpDelta == null) return { w, z, probs, final: null };
  return { w, z, probs, final: perturbCategories(probs, profile.stateTasks.tasks.control.favorableOutcomes, spec.Z, spec.alpha) };
}

// Mezcla de la intención (entrenador, adaptación, preferencias) sobre un conjunto de opciones: devuelve cada opción con su peso `w` y las partes. `tilt` y `cf` ya resueltos por el llamante (estilo, urgencia).
const normalizeBy = (arr, f) => { const s = arr.reduce((a, x) => a + f(x), 0); return arr.map((x) => (s > 0 ? f(x) / s : 0)); };
export function mixResolution(items, { L, q, tilt, cf }, rnd = (x) => x) {
  const scaled = items.map((i) => (i.cont && cf !== 1 ? { ...i, coach: i.coach == null ? i.coach : i.coach * cf, pref: (i.pref ?? 0) * cf, adapt: (i.adapt ?? 0) * cf } : i));
  const hasCoach = scaled.some((i) => i.coach != null && i.coach > 0);
  const pc = hasCoach ? normalizeBy(scaled, (i) => i.coach ?? 0) : null;
  const pp = normalizeBy(scaled, (i) => i.pref ?? 0);
  const pa = normalizeBy(scaled, (i) => i.adapt ?? 0);
  return scaled.map((it, k) => {
    const pj = q * pa[k] + (1 - q) * pp[k];
    let p = pc ? (1 - L) * pc[k] + L * pj : pj;
    const rf = it.risk != null && tilt !== 0 ? Math.exp(tilt * it.risk) : 1;
    const mf = it.mid ?? 1;
    p *= rf * mf;
    return { ...it, w: p, parts: { entrenador: pc ? rnd(pc[k]) : null, adaptacion: rnd(pa[k]), preferencias: rnd(pp[k]), riesgo: rf === 1 ? null : rnd(rf, 4), media: mf === 1 ? null : rnd(mf, 4), mezcla: rnd(p) } };
  });
}

// Aceptación de una opción directa (ESP/CONT): (suelo + libertad) · lectura q · ajuste técnico, acotada a [0, 1] (MEN02/MEN03 vía q).
export const acceptanceResolution = (profile, { L, q, adj }) => Math.min(1, Math.max(0, (profile.selection.direct.acceptanceFloor + L) * q * adj));

// Probabilidad de cada opción de un sorteo ponderado (`MatchCore.pick`): solo w > 0, orden estable por clave, w / total. La usan el productor (que la registra) y el contraste de sensibilidad.
export function pickProbabilities(items) {
  const els = items.filter((i) => i.w > 0).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)); const total = els.reduce((s, i) => s + i.w, 0);
  return Object.fromEntries(els.map((e) => [e.key, e.w / total]));
}
