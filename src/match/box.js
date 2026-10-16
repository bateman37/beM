// Acta básica compatible con MOTOR-01 a MOTOR-08, derivada del acta completa de MOTOR-09 (acta.js): una sola lectura de los hechos.
// Los campos heredados conservan su nombre; el detalle nuevo (asistencias, robos, tapones recibidos, más-menos, series, F…) vive en `res.acta`.
import { buildActa, legacyTotals } from './acta.js';

export const BOX_PENDING = [
  'Mates convertidos (el hecho no los representa)', 'Rebotes colectivos y faltas de entrenador o banquillo (sin generación natural; el acta los admite)',
  'Mapas, informes y estadísticas avanzadas (MOTOR-10)', 'Clasificación de unidades completas/mixtas y on/off analítico (MOTOR-10)',
];
const LEGACY = ['min', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'tov', 'pf', 'stl', 'blk'];

export function projectBox(events, lineupTable, input, ctx = {}) {
  const acta = ctx.acta ?? buildActa({ events, lineups: lineupTable, input, possessions: ctx.possessions, status: ctx.status }, ctx.policy);
  const players = Object.fromEntries(Object.entries(acta.players).map(([id, l]) => [id, { team: l.team, ...Object.fromEntries(LEGACY.map((k) => [k, l[k]])) }]));
  return { players, teams: acta.teams.map((t) => ({ points: t.points, teamTov: t.collective.tov })), periods: acta.periods, pending: BOX_PENDING };
}

export function teamTotals(box, input, teamIdx) {
  const t = Object.fromEntries(LEGACY.filter((k) => k !== 'min').map((k) => [k, 0]));
  for (const p of input.teams[teamIdx].players) for (const k of Object.keys(t)) t[k] += box.players[p.id][k];
  return { ...t, min: input.teams[teamIdx].players.reduce((s, p) => s + box.players[p.id].min, 0), teamTov: box.teams[teamIdx].teamTov };
}
export { legacyTotals };
