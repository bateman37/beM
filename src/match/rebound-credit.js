// SIM-MOTOR-04E (E02): política común y versionada de crédito estadístico de rebote, compartida por el detallado y SIM. Función pura: traduce hechos YA resueltos (quién lanzó, estado del balón, control o derecho
// resultante) en crédito individual, colectivo o ausencia legítima de crédito, con su causa. No decide quién gana el balón, no consume azar y no crea incidencias nuevas.
// Criterio cerrado por el encargo (FIBA Statisticians' Manual 2024 v2.0, cap. 4, 5 y 8; contrastado por ChatGPT, sin lectura directa de Claude): la recuperación controlada tras tapón acredita rebote; un derecho de
// saque antes de control individual genera crédito colectivo; no hay crédito con balón muerto por una parada, al acabar el periodo antes del control ni ante la violación aplicable antes de recuperar.
export const REBOUND_CREDIT_POLICY_ID = 'REBCRED-SIM04E-R1';

// d: { shooterTeam, miss: 'field'|'blocked'|'freeThrowLast', ball: 'live'|'outOfBounds'|'dead', control: { team, player|null }|null, periodEnded?, violation? }
// → { kind: 'individual'|'collective'|'none', team, off, player, cause }
export function classifyReboundCredit(d) {
  if (d.periodEnded) return { kind: 'none', team: null, off: null, player: null, cause: 'fin_de_periodo_antes_del_control' };
  if (d.violation) return { kind: 'none', team: null, off: null, player: null, cause: 'violacion_antes_de_recuperar' };
  if (d.ball === 'dead') return { kind: 'none', team: null, off: null, player: null, cause: 'balon_muerto' };
  const c = d.control;
  if (!c) return { kind: 'none', team: null, off: null, player: null, cause: 'sin_control' };
  const off = c.team === d.shooterTeam;
  if (d.ball === 'outOfBounds') return { kind: 'collective', team: c.team, off, player: null, cause: 'derecho_de_saque' };
  if (c.player == null) return { kind: 'collective', team: c.team, off, player: null, cause: 'control_sin_captor_individual' };
  return { kind: 'individual', team: c.team, off, player: c.player, cause: d.miss === 'blocked' ? 'recuperacion_tras_tapon' : 'captura' };
}
