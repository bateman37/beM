// Filas del diccionario para SEM-MOTOR14 (REG04: terminación administrativa por falta de jugadores, art. 21 según el encargo MOTOR-14 §7.3). Mismo contrato que rows.js.
// Son filas NORMATIVAS (`locked`): se modifican como un conjunto coherente de un perfil reglamentario, no como un coeficiente de juego. No hay probabilidades ni sorteos.
const EXT = 'SEM-MOTOR14';
const R = { cls: 'reglamento', views: ['reglamento'], ext: EXT, grp: 'REG04', mech: 'availability.js · checkAvailability → regs.terminate', locked: true };
const NORM = 'Solo decide cómo se adjudica el resultado de un encuentro que termina por falta de jugadores; el tanteo de cancha y lo producido no se reescriben.';

export const MOTOR14_FAMILIES = [
  { ...R, path: 'regulation.termination.insufficientPlayers.retainLeadingScore', type: 'bool', unit: 'sí/no', label: () => 'Terminación por falta de jugadores · conservar el marcador favorable', desc: () => 'F14-01 art. 21 (lectura del encargo MOTOR-14 §7.3): si el beneficiario va por delante cuando el rival se queda con menos de dos jugadores listos, conserva su marcador.', effect: () => NORM },
  { ...R, path: 'regulation.termination.insufficientPlayers.otherwiseWinnerPoints', type: 'count', unit: 'puntos', label: () => 'Terminación por falta de jugadores · puntos adjudicados al beneficiario que no va por delante', desc: () => 'Se adjudica 2–0 cuando el beneficiario no iba por delante (art. 21, lectura del encargo MOTOR-14 §7.3).', effect: () => NORM },
  { ...R, path: 'regulation.termination.insufficientPlayers.otherwiseLoserPoints', type: 'count', unit: 'puntos', label: () => 'Terminación por falta de jugadores · puntos adjudicados al otro equipo', desc: () => 'Puntos del equipo que no puede continuar en el adjudicado 2–0.', effect: () => NORM },
];
export const MOTOR14_EXEMPT = [/^regulation\.termination\.insufficientPlayers\.(contrast|note)$/];
