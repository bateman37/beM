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
