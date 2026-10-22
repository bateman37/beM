// Fachada de aprendizaje de MOTOR-18 (puro). Ver docs/tecnico/motor18.md.
export { factorsFor, learnClosed, doseToReach, retainEntry, retainBlock, rateOf, thresholdOf } from './core.js';
export { createTeamState, advanceTeam, adoptLearningParams, learningParamsFingerprint, playerCurveOf, exposureErrors, proposeFromSession, evaluateSession, proposeFromMatch, createLedger, applyProposal, undoApplication, teamFingerprint, sourceIdOf } from './team.js';
export { buildExposure, finishedExposure, exposureFromResult } from './exposure.js';
export * from '../knowledge/model.js';
