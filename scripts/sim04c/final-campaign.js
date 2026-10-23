// SIM-MOTOR-04B · secuencia de la campaña posterior a la congelación VAL (§10–§11), expresada como las órdenes de `exec.mjs` que se ejecutaron (ver `run-meta-*.json` de la campaña, con commit y raíz de cada una).
// No selecciona ni ajusta nada. Es reanudable: un caso terminado no se repite. Las raíces de R04 y del control preoptimización son worktrees de este mismo repositorio (`SIM04C_R04`, `SIM04C_CONTROL`).
//   SIM04C_R04=<worktree del commit ad52c91> SIM04C_CONTROL=<worktree de O04B-CONTROL.commit> node scripts/sim04c/final-campaign.js [--dry]
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const dry = process.argv.includes('--dry');
const R04 = process.env.SIM04C_R04 ?? '/home/user/r04b-r04'; const CONTROL = process.env.SIM04C_CONTROL ?? '/home/user/r04b-control'; const VEC = (id) => join(SELF, `out/sim-motor04c/vectors/${id}.json`);
const exec = join(SELF, 'scripts/sim04c/exec.mjs'); const steps = [
  ['VAL', 'R04', ['--root=' + R04, '--overrides=' + VEC('R04')]], ['VAL', 'R04B-N', ['--overrides=' + VEC('R04B-N')]], ['VAL', 'DET', ['--resolver=detailed']],
  ['STRESS', 'R04B-N', ['--overrides=' + VEC('R04B-N')]], ['STRESS', 'DET', ['--resolver=detailed']], ['CONTRAST', 'R04B-N', ['--overrides=' + VEC('R04B-N')]], ['CONTRAST', 'DET', ['--resolver=detailed']],
  ['DIAG', 'FINAL-DIAG', ['--overrides=' + VEC('R04B-N')]], ['DIAG', 'DET-DIAG', ['--resolver=detailed']],
  ['OPT', 'O04B-CONTROL', ['--root=' + CONTROL, '--overrides=' + VEC('R04B-N')]], ['OPT', 'O04B-FINAL', ['--overrides=' + VEC('R04B-N')]],
  ...['auto', 'steps', 'recover', 'reference'].map((r) => ['TECH', `TECH-${r}`, ['--route=' + r, '--overrides=' + VEC('R04B-N')]]),
];
for (const [block, identity, extra] of steps) {
  const argv = [exec, '--phase=run', `--block=${block}`, `--identity=${identity}`, ...extra]; console.log(['node', ...argv.map((a) => a.replace(SELF + '/', ''))].join(' '));
  if (!dry) { const r = spawnSync('node', argv, { stdio: 'inherit', cwd: SELF }); if (r.status !== 0) { console.error(`falló ${block} ${identity}`); process.exit(r.status ?? 1); } }
}
