// Núcleo puro del aprendizaje y la retención de MOTOR-18 (LEARN-MOTOR18-R1). Sin DOM, sin fs, sin azar, sin reloj de pared: todo el tiempo es un día explícito del reloj de aprendizaje.
// Las magnitudes son SEM18 (semillas provisionales de producto) y salen de `params = profile.familiarity`.
import { normalizeLevel, relatedOf, levelOf, entryOf, DOMAINS, playerFactor } from '../knowledge/model.js';

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// Factores de §8.4. `block`: conocimiento ACTUAL del jugador (previo a la transacción: la transferencia no encadena dentro de una sesión).
export function factorsFor({ domain, id, block, tacticalLearning, coach, params }) {
  const f = params.learning.factors;
  const pf = playerFactor(tacticalLearning, params); const player = pf.factor; // MOTOR-18B: curva por tramos (base 18B) o factor lineal (perfiles de MOTOR-18)
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
  return { player, playerModel: pf.model, playerSegment: pf.segment, teaching, content, transfer, relatedMaxLevel: relatedMax, product: player * teaching * content * transfer };
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

// Lectura pura de la dosis eficaz (horas equivalentes) necesaria para llevar un nivel a otro con factores constantes (MOTOR-18B §3.4). No es un calendario ni simula días: el reparto de dosis,
// los conocimientos relacionados y los demás factores pueden variar. Respeta el reaprendizaje solo hasta `peak`. Devuelve Infinity si el objetivo es el techo (o lo supera) y 0 si ya se alcanza.
export function doseToReach({ level, peak, target, rate, F, params }) {
  const L = params.learning; const M = params.range.max; const div = L.gainDivisor; const rel = L.factors.relearning; const unit = rate * F;
  if (!(unit > 0)) return Infinity;
  if (target <= level) return 0;
  if (target >= M) return Infinity;
  let K = level; let dose = 0;
  if (K < peak) { const stop = Math.min(target, peak); dose += (div * Math.log((M - K) / (M - stop))) / (rel * unit); K = stop; if (target <= peak) return dose; }
  return dose + (div * Math.log((M - K) / (M - target))) / unit;
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
