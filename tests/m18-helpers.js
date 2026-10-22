// Ayudas de las pruebas y de la tabla L18 de MOTOR-18: perfil efectivo, entrenador y bloques sencillos. No contienen constantes deportivas (salen de profile.familiarity).
import { loadData } from '../scripts/node-data.js';
import * as K from '../src/knowledge/model.js';

// MOTOR-18B: las pruebas de L18 son HISTÓRICAS y usan el perfil de MOTOR-18 (factor de Polivalencia lineal); las de 18B usan `profile18b`.
const data = loadData();
export const { players } = data;
export const profile = data.profile18; export const profile18b = data.profile;
export const P = profile.familiarity; export const P18B = profile18b.familiarity;
export const playFamily = Object.fromEntries(Object.entries(profile.repertoire.plays).map(([k, v]) => [k, v.family]));
export const coachOf = (teaching = 16, mastery = 16, overrides = {}) => ({ teaching, tacticalMastery: { ...Object.fromEntries(K.idsOf('tactic', P).map((i) => [i, mastery])), ...overrides } });
// Bloque uniforme (todas las entradas al mismo nivel y peak) con ajustes puntuales {'domain:id': {level, peak, lastPracticeDay}}.
export function uniformBlock(level, day = 0, patches = {}) {
  const b = K.allMastered(P, day);
  for (const d of K.DOMAINS) for (const id of K.idsOf(d, P)) b[K.BLOCK_FIELD[d]][id] = K.makeEntry(level, day);
  for (const [key, e] of Object.entries(patches)) { const { domain, id } = K.parseKey(key); Object.assign(b[K.BLOCK_FIELD[domain]][id], e); }
  return b;
}
