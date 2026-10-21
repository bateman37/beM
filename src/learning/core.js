// Núcleo puro del aprendizaje y la retención de MOTOR-18 (LEARN-MOTOR18-R1). Sin DOM, sin fs, sin azar, sin reloj de pared: todo el tiempo es un día explícito del reloj de aprendizaje.
// Las magnitudes son SEM18 (semillas provisionales de producto) y salen de `params = profile.familiarity`.
import { normalizeLevel, relatedOf, levelOf, entryOf, DOMAINS } from '../knowledge/model.js';

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// Factores de §8.4. `block`: conocimiento ACTUAL del jugador (previo a la transacción: la transferencia no encadena dentro de una sesión).
export function factorsFor({ domain, id, block, tacticalLearning, coach, params }) {
  const f = params.learning.factors;
  const player = f.player.base + f.player.slope * normalizeLevel(tacticalLearning, params);
  const teaching = f.teaching.base + f.teaching.slope * normalizeLevel(coach.teaching, params);
  let content = 1;
  if (domain === 'tactic') {
    const m = coach.tacticalMastery?.[id];
    if (typeof m !== 'number') throw new Error(`falta la competencia del entrenador en el módulo ${id}`);
    content = f.content.base + f.content.slope * normalizeLevel(m, params);
  }
  const rel = relatedOf(domain, id, params).map((r) => levelOf(block, domain, r)).filter((v) => v != null);
  const relatedMax = rel.length ? Math.max(...rel) : null;
  const transfer = relatedMax == null ? 1 : f.transfer.base + f.transfer.slope * normalizeLevel(relatedMax, params);
  return { player, teaching, content, transfer, relatedMaxLevel: relatedMax, product: player * teaching * content * transfer };
}

// Ganancia en forma CERRADA por tramos. K_nuevo = M − (M−K)·exp(−G/29) con G = tasa·dosis·F. Si K < peak, el tramo hasta alcanzar el peak se aprende con G·reaprendizaje (2);
// la dosis necesaria para llegar al peak es dosis* = 29·ln((M−K)/(M−peak)) / (reaprendizaje·tasa·F) y el resto sigue con la fórmula normal. No hay bucle por hora ni por día.
// Como G es aditivo en el exponente, dividir una dosis en dos mitades con factores constantes da el mismo resultado (el redondeo a 30 con K ≥ 29,95 se aplica al final de la transacción).
export function learnClosed({ level, peak, dose, rate, F, params }) {
  const L = params.learning; const M = params.range.max; const div = L.gainDivisor; const rel = L.factors.relearning; const unit = rate * F;
  if (!(dose > 0) || !(unit > 0)) return { level, peak, G: 0, acceleratedDose: 0, normalDose: 0, snapped: false };
  let K = level; let rem = dose; let accel = 0;
  if (K < peak) {
    if (peak >= M) { K = M - (M - K) * Math.exp(-rel * unit * rem / div); accel = rem; rem = 0; }
    else {
      const dStar = (div * Math.log((M - K) / (M - peak))) / (rel * unit);
      if (rem <= dStar) { K = M - (M - K) * Math.exp(-rel * unit * rem / div); accel = rem; rem = 0; }
      else { K = peak; accel = dStar; rem -= dStar; }
    }
  }
  const normal = rem;
  if (rem > 0) K = M - (M - K) * Math.exp(-unit * rem / div);
  let snapped = false;
  if (K >= L.snapToMaxThreshold) { snapped = K < M; K = M; }
  K = Math.min(K, M);
  return { level: K, peak: Math.max(peak, K), G: unit * (accel * rel + normal), acceleratedDose: accel, normalDose: normal, snapped };
}

// Desuso (§9): se evalúa SOLO al avanzar el reloj, en bloque. Nunca mejora un nivel; el suelo solo frena la pérdida.
export function retainEntry(entry, domain, prevDay, destDay, params) {
  const r = params.retention[domain];
  const start = Math.max(prevDay, entry.lastPracticeDay + r.graceDays);
  const days = Math.max(0, destDay - start);
  const floor = Math.max(params.range.min, entry.peak * r.floorFraction);
  const level = Math.min(entry.level, Math.max(floor, entry.level - (r.lossPerYear * days) / 365));
  return { level, wearDays: days, floor };
}

// Avanza todo un bloque explícito hasta `destDay` (sin práctica). Devuelve bloque nuevo y diferencias.
export function retainBlock(block, destDay, params) {
  if (block.mode !== 'explicit') return { block, changes: [] };
  if (destDay < block.asOfDay) throw new Error(`día destino ${destDay} anterior al día evaluado ${block.asOfDay}`);
  const out = { ...block, asOfDay: destDay }; const changes = [];
  for (const domain of DOMAINS) {
    const field = { position: 'positions', offensiveRole: 'offensiveRoles', defensiveRole: 'defensiveRoles', tactic: 'tactics' }[domain];
    out[field] = {};
    for (const [id, e] of Object.entries(block[field])) {
      const r = retainEntry(e, domain, block.asOfDay, destDay, params);
      out[field][id] = { ...e, level: r.level };
      if (r.level !== e.level) changes.push({ domain, id, before: e.level, after: r.level, wearDays: r.wearDays, floor: r.floor });
    }
  }
  return { block: out, changes };
}

export const rateOf = (domain, params) => params.learning.rates[domain];
export const thresholdOf = (domain, params) => params.learning.practiceThresholds[domain];
export { clamp, entryOf };
