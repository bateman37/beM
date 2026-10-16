import { loadData } from '../scripts/node-data.js';
import { buildMatchInput, createMatch } from '../src/match/index.js';

export const data = loadData();
export const inputFor = (seed) => buildMatchInput(data.profile, data.players, { seed });
export const stripCalc = (events) => events.map(({ calc, ...rest }) => rest);

// Encuentro inicializado y listo para casos controlados de reglas.
export function freshMatch(seed = 1, opts = {}) {
  const m = createMatch(inputFor(seed), data.profile, { detail: 'full', ...opts });
  m.init();
  m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  return m;
}
export const baseEx = (over = {}) => ({
  team: 0, origin: 'PRUEBA', kind: 'organized', actor: 'EQ01-J03', zone: 'three', exec: 'dribble', passer: null,
  icpt: 'EQ02-J04', defend: 'EQ02-J04', moved: false, offContact: null, holder: 'EQ01-J03', quality: { cls: 'normal', K: 0 }, ...over,
});
