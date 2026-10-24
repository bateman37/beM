// Fachada de SIM-MOTOR (§4.1): validar/normalizar, preparar contexto, crear encuentro, avanzar, consultar, terminar, construir/validar resultado.
import { SimMatch } from './engine.js';
import './materialize.js';
export { SimMatch };
export { buildSimResult, sportDigest } from './result.js';
export { reconcileResult, RECONCILIATION_IDS } from './reconcile.js';
export { makeContext, contextToJSON, contextFromJSON } from './context.js';
export { buildSimProfile, applyOverrides, validateOverrides, diffProfile, profileSections } from './profile.js';
export { validateSimInput, normalizeInput } from './adapt.js';
export { buildReferenceInput, REFERENCE_IDS } from './teams.js';
export { decodeZone, ZONE_COMPACT_FIELDS } from './essential.js';
export * from './version.js';
export const createSimMatch = (input, ctx, opts) => new SimMatch(input, ctx, opts);
export function playSimMatch(input, ctx, opts) { const m = new SimMatch(input, ctx, opts); m.finish(); return m; }
export { SIM_CANDIDATES, candidateById } from './candidates.js';
