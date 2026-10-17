// Derivación de semillas de MOTOR-12 (§5.2). Tres semillas distintas: de GENERACIÓN de población (la materializa el generador al preparar equipos: no se regenera por partido),
// de LOTE (esta) y DEPORTIVA de cada caso (la que consume el RNG del partido). La lista completa se deriva por adelantado y se congela; detener/reanudar no la desplaza.
// Algoritmo LOT-SEED-R1: xorshift32 del perfil (tratamiento de cero heredado) sembrado con FNV-1a(`semilla|versión del lote|LOT-SEED-R1`); una salida por caso (estado resultante,
// entero de 32 bits); si una salida ya está usada se descarta y se toma la siguiente (colisión registrada). Sin reloj del sistema, sin Math.random, sin índices de worker.
import { createRng } from '../match/rng.js';
import { fnv1a32 } from '../population/hash.js';

export const SEED_DERIVATION = 'LOT-SEED-R1';
export function deriveCaseSeeds({ batchSeed, count, rngConfig, lotVersion }) {
  if (!Number.isInteger(batchSeed) || batchSeed < 0 || batchSeed > 4294967295) throw new Error('la semilla de lote debe ser un entero entre 0 y 4294967295');
  if (!Number.isInteger(count) || count < 0) throw new Error('cantidad de semillas no válida');
  const mix = fnv1a32(`${batchSeed}|${lotVersion}|${SEED_DERIVATION}`);
  const rng = createRng(mix, rngConfig); const seeds = []; const used = new Set(); const collisions = [];
  while (seeds.length < count) {
    rng.next('lote'); const s = rng.state();
    if (used.has(s)) { collisions.push({ ordinal: seeds.length + 1, descartada: s, draw: rng.count }); continue; }
    used.add(s); seeds.push(s);
  }
  return { seeds, collisions, mix, zeroSeedReplaced: rng.zeroSeedReplaced, draws: rng.count, procedure: `${SEED_DERIVATION}: ${rngConfig.algorithm} sembrado con FNV-1a("${batchSeed}|${lotVersion}|${SEED_DERIVATION}") = ${mix}; una salida (estado) por caso; salida repetida: se descarta y se toma la siguiente` };
}
