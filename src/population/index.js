// API pública del módulo de población de MOTOR-11 (sin DOM ni sistema de ficheros).
export { canonicalJson, fnv1a32, sha256Hex, fingerprint } from './hash.js';
export { TEAM_ID, PLAYER_ID, playerId, teamOfPlayer, remapIds, retargetTeam, instantiate, dropStaleRivalRefs } from './ids.js';
export { REFERENCE_IDS, popOf, genOf, revisedPlayers, referenceTeam, referenceTeams, historicalPair } from './reference.js';
export { generateTeam, generatedId, validateConfig, diffToCenters, recipeSummary, streamFactory, DISPERSION_NAMES } from './generator.js';
export { validateTeamRecord, validateReferenceSet } from './validate.js';
export { planBulk, bulkSummary, applyBulk, undoBulk, diffTeams } from './edit.js';
export { PopulationLibrary, POP_KEY, POP_FORMAT } from './library.js';
export { labCatalog, buildLabVariant, resolveTeam, resolveWho, sameTeamsNote } from './scenarios.js';
export { SCENARIO_SCHEMA, exportScenario, validateScenarioFile, importScenario } from './exchange.js';
