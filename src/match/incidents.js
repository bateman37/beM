// Incidencias tipadas de MOTOR-15 (§5–§7): funciones puras sobre `profile.regulation`, `profile.interference` y `profile.shotFlight`. Sin azar propio: el sorteo de la oportunidad de interferencia
// lo realiza el núcleo (una vez por oportunidad ELEGIBLE) y esta capa solo valida masas, decide el resultado con ese número y resuelve la consecuencia desde la matriz.
// «La administración de una incidencia clasificada nunca se sortea»: una técnica, una disruptiva o una flagrante recibida como hecho tipado no usa estas masas.
import { matchRows } from './regs.js';

export const SITUATIONS = ['fieldGoal', 'lastFreeThrow'];
export const SIDES = ['defensive', 'offensive'];

// Margen liberación→resolución (SEM15-TIR-01) dentro de la duración ya existente de la operación de tiro: lag = min(margen, duración); liberación en inicio + duración − lag.
// El margen se expresa en décimas enteras (el reloj no tiene resolución menor): 0,35 s → 4 décimas (redondeo al alza de la mitad, convención documentada).
export const lagConfiguredTenths = (profile) => Math.floor(profile.shotFlight.pendingLagSeconds * 10 + 0.5 + 1e-9);
export function flightSplit(profile, durationTenths) {
  const cfg = lagConfiguredTenths(profile);
  const lag = Math.max(0, Math.min(cfg, durationTenths));
  return { lagTenths: lag, releaseAfterTenths: durationTenths - lag, durationTenths, configuredTenths: cfg };
}

// Masas por oportunidad elegible. Resultados excluyentes: defensiva, ofensiva o ninguna (residual = 1 − suma de masas ELEGIBLES). Si un lado no es elegible su masa NO se redistribuye.
export function interferenceMasses(profile, situation, eligible) {
  const cfg = profile.interference?.[situation];
  if (!cfg) throw new Error(`situación de interferencia desconocida: ${situation}`);
  const d = eligible.defensive ? cfg.defensiveP : 0; const o = eligible.offensive ? cfg.offensiveP : 0;
  const sum = d + o;
  if (!(d >= 0 && o >= 0 && sum <= 1)) throw new Error(`masas de interferencia inválidas en ${situation}: ${d} + ${o}`);
  return { defensive: d, offensive: o, residual: 1 - sum, sum, eligible: { defensive: !!eligible.defensive, offensive: !!eligible.offensive } };
}
// Con una única u ∈ [0,1): [0,d) defensiva, [d,d+o) ofensiva, resto ninguna. Orden fijo (defensiva primero) para que el mismo número dé el mismo resultado.
export function interferenceOutcome(masses, u) {
  if (u < masses.defensive) return 'defensive';
  if (u < masses.defensive + masses.offensive) return 'offensive';
  return null;
}
// Consecuencia (validez, crédito, reanudación, sanción adicional) desde las filas RG-I01…RG-I04.
export function resolveInterference(profile, situation, side) {
  const fact = { interference: `${situation}.${side}` };
  const m = (profile.regulation?.matrix ?? []).filter((r) => r.when?.interference === fact.interference);
  if (m.length !== 1) return { ok: false, diagnostic: `la matriz no tiene una fila única para la interferencia ${fact.interference} (${m.length})` };
  const row = m[0];
  if (row.contrast === 'pendiente' || !row.consequence) return { ok: false, pending: true, row: row.id, diagnostic: `${row.id}: contenido pendiente de contraste` };
  return { ok: true, row: row.id, contrast: row.contrast, source: row.source, ...row.consequence, explanation: row.explanation };
}
void matchRows;

// Descalificación del entrenador: dos técnicas C, o tres en total (C + B) (N15-03; la combinación exacta con descalificaciones de banquillo no se precisó).
export function coachDisqualified(profile, counters) {
  const d = profile.regulation.coachDisqualification;
  const c = counters?.C ?? 0; const b = counters?.B ?? 0;
  return c >= d.cLimit || c + b >= d.totalLimit;
}
