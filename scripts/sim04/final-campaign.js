// SIM-MOTOR-04 · ejecución de la reserva y de los contrastes finales (§9–§11), DESPUÉS de la congelación `val`. Orden: VAL (R0, R1, candidata y las 16 anclas detalladas), STRESS (R0 y candidata), CONTRAST (solo candidata),
// DIAG (12 SIM + 4 detallados con hechos completos) y TECH (8 controles de VAL × E1/E2). No selecciona ni ajusta nada: solo ejecuta y conserva. Reanudable (un caso terminado no se repite).
//   SIM04_WT=<carpeta de worktrees> node scripts/sim04/final-campaign.js [--blocks=VAL,STRESS,CONTRAST,DIAG,TECH]
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import * as L from './lib.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = join(SELF, 'docs/tecnico/evidencia-sim-motor04/plan'); const out = join(SELF, 'out/sim-motor04/campaign'); mkdirSync(out, { recursive: true });
const R0 = arg('root-r0', join(process.env.SIM04_WT ?? '', 'r0')); const vec = JSON.parse(readFileSync(join(SELF, 'out/sim-motor04/vectors/C04-FINAL-PROVISIONAL.json'), 'utf8')).overrides;
const blocks = (arg('blocks', 'VAL,STRESS,CONTRAST,DIAG,TECH')).split(','); const res = []; const go = async (o) => { const r = await run({ out, planDir, ...o }); res.push(r); console.log(JSON.stringify(r)); };
if (blocks.includes('VAL')) { await go({ block: 'VAL', identity: 'R0', root: R0 }); await go({ block: 'VAL', identity: 'R1' }); await go({ block: 'VAL', identity: 'FINAL', overrides: vec }); await go({ block: 'VAL', identity: 'DET', resolver: 'detailed' }); }
if (blocks.includes('STRESS')) { await go({ block: 'STRESS', identity: 'R0', root: R0 }); await go({ block: 'STRESS', identity: 'FINAL', overrides: vec }); }
if (blocks.includes('CONTRAST')) await go({ block: 'CONTRAST', identity: 'FINAL', overrides: vec });
if (blocks.includes('DIAG')) { await go({ block: 'DIAG', identity: 'FINAL-DIAG', overrides: vec }); await go({ block: 'DIAG', identity: 'DET-DIAG', resolver: 'detailed', only: L.DIAG_DET }); }
if (blocks.includes('TECH')) { await go({ block: 'TECH', identity: 'TECH-E1', overrides: vec, route: 'steps', routes: L.TECH_ROUTES, workers: 1 }); await go({ block: 'TECH', identity: 'TECH-E2', overrides: vec, route: 'recover', routes: L.TECH_ROUTES, workers: 4 }); }
console.log(JSON.stringify({ done: true, runs: res.length })); process.exit(0);
