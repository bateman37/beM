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

// SIM-MOTOR-04E (art. 29 de las Reglas Oficiales FIBA 2026 v1.1): tras el contacto del balón con el aro y un nuevo control, el reloj de posesión se reinicia a 14 s para el mismo ataque
// (rebote ofensivo, con independencia del reloj previo) y a 24 s para el rival. Es distinto de la parada defensiva (`shotClockAfterDefensiveStoppage`: conserva el reloj si ya tiene 14 s o más).
export function shotClockAfterRingContact(rules, sameTeamControls) {
  return toTenths(sameTeamControls ? rules.frontcourtResetSeconds : rules.shotClockSeconds);
}

// Una acción solo se produce si ocurre estrictamente antes del límite (bocina o reloj de posesión).
export function fitsBeforeLimit(durationTenths, limitTenths) { return durationTenths < limitTenths; }

// Parada del reloj tras canasta en los últimos 120 s del último cuarto y de las prórrogas.
export function clockStopsAfterGoal(period, clockTenths, rules) {
  const finalPeriod = period >= rules.quarters;
  return finalPeriod && clockTenths <= toTenths(rules.stopClockAfterGoalFinalSeconds);
}

// Tiros libres por un tiro de campo con falta: 3 si era de tres, 2 si era de dos; si entra, 1.
export function freeThrowsForShootingFoul(points, made) { return made ? 1 : points; }
