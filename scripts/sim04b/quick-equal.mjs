// SIM-MOTOR-04B · comprobación rápida de IGUALDAD EXACTA entre dos raíces de código (control y optimizado) sobre N casos de la agenda BENCH y las dos configuraciones de perfil (base y candidata): huella deportiva, azar consumido,
// eventos y esencial completo (SHA-256 de su forma canónica). Herramienta de desarrollo; la evidencia oficial es OPT (equiv.js) y las huellas de los mil casos del benchmark.
//   node scripts/sim04b/quick-equal.mjs <raízA> <raízB> [N=60]
import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; import { readFileSync } from 'node:fs'; import { createHash } from 'node:crypto';
const [A, B, N0] = process.argv.slice(2); const N = Number(N0 ?? 60); const cand = JSON.parse(readFileSync(new URL('../../out/sim-motor04b/vectors/C04B-FINAL-PROVISIONAL.json', import.meta.url), 'utf8')).overrides;
const TEAMS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`); const sha = (x) => createHash('sha256').update(x).digest('hex');
async function run(root, ov) { const imp = (p) => import(pathToFileURL(resolve(root, p)).href); const { loadData } = await imp('scripts/node-data.js'); const { makeContext } = await imp('src/sim/context.js'); const { referenceTeamMap } = await imp('src/sim/teams.js'); const { runCase } = await imp('src/sim/cases.js'); const { canonical } = await imp('src/sim/fp.js');
  const { profile, players } = loadData(); const ctx = makeContext(profile, ov); const tm = referenceTeamMap(profile, players); const out = [];
  for (let i = 0; i < N; i++) { const a = TEAMS[i % 12]; const b = TEAMS[(i * 5 + 1) % 12 === i % 12 ? (i + 1) % 12 : (i * 5 + 1) % 12]; const r = runCase(ctx, tm, { n: i, id: `Q${i}`, a, b, seed: 7000 + 13 * i, essential: true }); out.push([r.id, r.fp, r.draws, r.events, r.segments, r.status, r.valid, JSON.stringify(r.score), sha(canonical(r.ess))]); }
  return out; }
let bad = 0; for (const [name, ov] of [['base', null], ['candidata', cand]]) { const a = await run(A, ov); const b = await run(B, ov); a.forEach((x, i) => { if (x.join('|') !== b[i].join('|')) { bad++; if (bad < 5) console.log('DIFERENCIA', name, x[0], x.slice(1, 8).join(' '), '≠', b[i].slice(1, 8).join(' ')); } }); console.log(name, `${a.length} casos`, a.every((x, i) => x.join('|') === b[i].join('|')) ? 'IGUALES' : 'DISTINTOS'); }
process.exit(bad ? 1 : 0);
