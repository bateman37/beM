// Reglas compartidas (perfil FIBA-2026-v1.1 del funcional): funciones puras y pequeñas.
// Las cifras proceden de profile.rules y profile.durationSeconds; aquí solo hay lógica.

export const TENTHS = 10; // el reloj se representa en décimas enteras (sin crear pasos temporales)

export const toTenths = (seconds) => Math.round(seconds * TENTHS);

// Clave del periodo para las faltas colectivas: las prórrogas acumulan con el cuarto periodo.
export function foulPeriodKey(period, rules) {
  return period <= rules.quarters ? period : rules.overtimeFoulsCarryFromPeriod;
}

export function isOvertime(period, rules) { return period > rules.quarters; }

export function periodLengthTenths(period, rules) {
  return toTenths(period <= rules.quarters ? rules.quarterSeconds : rules.overtimeSeconds);
}

// Penalización colectiva: tras cuatro faltas del periodo, la quinta y siguientes se penalizan.
export function inPenalty(teamFoulsBefore, rules) {
  return teamFoulsBefore >= rules.teamPenaltyAfterFouls;
}

// Reloj de posesión tras una reanudación en pista de ataque por falta/infracción defensiva:
// se completa a 14 s si quedaban menos; si quedaban 14 o más, continúa.
export function shotClockAfterDefensiveStoppage(shotClockTenths, rules) {
  return Math.max(shotClockTenths, toTenths(rules.frontcourtResetSeconds));
}

// Rebote ofensivo tras contacto con el aro: 14 s si quedaban menos; si no, continúa.
export const shotClockAfterRingContact = shotClockAfterDefensiveStoppage;

// Una acción solo se produce si ocurre estrictamente antes del límite (bocina o reloj de posesión).
export function fitsBeforeLimit(durationTenths, limitTenths) { return durationTenths < limitTenths; }

// Parada del reloj tras canasta en los últimos 120 s del último cuarto y de las prórrogas.
export function clockStopsAfterGoal(period, clockTenths, rules) {
  const finalPeriod = period >= rules.quarters;
  return finalPeriod && clockTenths <= toTenths(rules.stopClockAfterGoalFinalSeconds);
}

// Tiros libres por un tiro de campo con falta: 3 si era de tres, 2 si era de dos; si entra, 1.
export function freeThrowsForShootingFoul(points, made) { return made ? 1 : points; }
