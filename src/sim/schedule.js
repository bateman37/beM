// Agenda congelada de SIM-MOTOR-01 (§9.1): 132 cruces ordenados de 12 equipos × 7 vueltas (924) + los 76 primeros de una octava vuelta = 1.000 casos.
// Semilla de caso = FNV-1a de 32 bits sobre «<maestra>|C<nnnn>|<A>-<B>» (algoritmo estable, ver rng.js). Orden fijo, planes naturales, importancia ordinaria.
import { deriveSeed } from './rng.js';
import { SIM_MASTER_SEED } from './version.js';

export const TEAM_IDS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`);
export function crossings() { const out = []; for (const a of TEAM_IDS) for (const b of TEAM_IDS) if (a !== b) out.push([a, b]); return out; }
export function buildAgenda({ master = SIM_MASTER_SEED, rounds = 7, extra = 76 } = {}) {
  const x = crossings(); const out = []; let n = 0;
  const push = (r, pos) => { const [a, b] = x[pos]; n += 1; const id = `SIM01-C${String(n).padStart(4, '0')}`; out.push({ n, id, round: r + 1, pos: pos + 1, a, b, seed: deriveSeed(master, `C${String(n).padStart(4, '0')}|${a}-${b}`) }); };
  for (let r = 0; r < rounds; r++) for (let p = 0; p < x.length; p++) push(r, p);
  for (let p = 0; p < extra; p++) push(rounds, p);
  return out;
}
