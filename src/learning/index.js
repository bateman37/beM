// Fachada de aprendizaje de MOTOR-18 (puro). Ver docs/tecnico/motor18.md.
export { factorsFor, learnClosed, retainEntry, retainBlock, rateOf, thresholdOf } from './core.js';
export { createTeamState, advanceTeam, proposeFromSession, evaluateSession, proposeFromMatch, createLedger, applyProposal, undoApplication, teamFingerprint, sourceIdOf } from './team.js';
export * from '../knowledge/model.js';
