// SIM-MOTOR-04C · campaña con el vector FINAL fijado (§9.2): VAL nueva (N04C, candidata y DET sobre las mismas entradas y semillas), CONTRAST (N04C y candidata; DET en las ocho anclas) y TECH (tres recorridos de seis entradas CAL con la
// candidata). El diagnóstico de los cuatro primeros casos de VAL se conserva al ejecutarlos. Reanudable: un caso ya terminado no se repite.
//   node scripts/sim04c/final-campaign.js [--out=out/sim-motor04c/campaign] [--vector=out/sim-motor04c/vectors/C04C-FINAL-PROVISIONAL.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import { TECH_ROUTES } from './lib.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = join(SELF, 'docs/tecnico/evidencia-sim-motor04c/plan'); const out = arg('out', join(SELF, 'out/sim-motor04c/campaign'));
const vec = JSON.parse(readFileSync(arg('vector', join(SELF, 'out/sim-motor04c/vectors/C04C-FINAL-PROVISIONAL.json')), 'utf8')); const N = JSON.parse(readFileSync(join(SELF, 'out/sim-motor04c/vectors/N04C.json'), 'utf8'));
const res = []; const go = async (o) => { const r = await run({ root: SELF, out, planDir, ...o }); res.push(r); console.log(JSON.stringify(r)); };
await go({ block: 'VAL', identity: 'DET', resolver: 'detailed' });
await go({ block: 'VAL', identity: 'N04C', overrides: N.overrides });
await go({ block: 'VAL', identity: 'FINAL', overrides: vec.overrides, vectorId: vec.id });
await go({ block: 'CONTRAST', identity: 'DET', resolver: 'detailed' });
await go({ block: 'CONTRAST', identity: 'N04C', overrides: N.overrides });
await go({ block: 'CONTRAST', identity: 'FINAL', overrides: vec.overrides, vectorId: vec.id });
for (const route of ['auto', 'steps', 'recover']) await go({ block: 'TECH', identity: `TECH-${route}`, overrides: vec.overrides, vectorId: vec.id, route: route === 'auto' ? null : route, routes: TECH_ROUTES });
writeFileSync(join(out, '..', 'final-campaign-summary.json'), JSON.stringify(res, null, 1)); process.exit(0);
