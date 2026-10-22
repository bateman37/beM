// Constructor de enfrentamientos de referencia para SIM: dos plantillas EQ01–EQ12 con sus planes naturales, con identidades de instancia distintas (EQ03 contra EQ03 → EQ03 y EQ03_B).
import { referenceTeam, instantiate, dropStaleRivalRefs, REFERENCE_IDS } from '../population/index.js';
import { INPUT_SCHEMA } from '../match/data.js';

export { REFERENCE_IDS };
const strip = (t) => ({ id: t.id, name: t.name, players: t.players.map(({ provenance, ...p }) => p), plan: t.plan, source: t.source });
// Las doce plantillas lógicas con su plan natural (se envían una vez a los trabajadores; el cruce se compone allí).
export function referenceTeamMap(detailed, csvPlayers) { return Object.fromEntries(REFERENCE_IDS.map((id) => [id, strip(referenceTeam(detailed, csvPlayers, id))])); }
// Cruce A–B con identidades de instancia distintas. Puro y determinista: la misma entrada para el mismo (A, B, semilla, importancia).
export function buildPairInput(teamMap, teamA, teamB, { seed, importance = 'ordinary' } = {}) {
  const a = instantiate(teamMap[teamA], []); const b = instantiate(teamMap[teamB], [a.id]);
  dropStaleRivalRefs(a, b.players.map((p) => p.id)); dropStaleRivalRefs(b, a.players.map((p) => p.id));
  return { schema: INPUT_SCHEMA, seed, importance, teams: [strip(a), strip(b)] };
}
export function buildReferenceInput(detailed, csvPlayers, teamA, teamB, opts = {}) { return buildPairInput(referenceTeamMap(detailed, csvPlayers), teamA, teamB, opts); }
