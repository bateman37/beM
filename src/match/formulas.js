// Fórmulas deportivas compartidas por el motor y por las previsualizaciones del panel (MOTOR-03, §4.2 y §7.4).
// Una sola implementación: el panel dibuja ejemplos con estas mismas funciones, sin consumir azar ni tocar una sesión.
import { sigmoid, logit, interpolate } from './mathx.js';

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
