// SIM-MOTOR-04E · campaña con el vector FINAL fijado (§9.2–§9.3): VAL04D nueva y cerrada (DET, C0_04C y candidata sobre las mismas entradas y semillas), CONTRAST (control y candidata; DET reutilizado en las ocho anclas) y TECH (tres recorridos
// de las cuatro primeras entradas DEV con la candidata). DIAG: las cuatro primeras entradas de VAL04D se conservan al ejecutarlas. Reanudable: un caso terminado no se repite.
//   C0_04C: código y perfil deportivo de 04C (vector de 04C, mecanismos nuevos neutrales); su trayectoria es IDÉNTICA a la auténtica de 04C (DEV 48/48 y comprobación en el árbol auténtico de 04C sobre las cuatro entradas DIAG).
//   node scripts/sim04e/val.js [--out=out/sim-motor04e/campaign] [--root-04c=/home/user/c04c]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import { TECH_ROUTES } from './lib.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = join(SELF, 'docs/tecnico/evidencia-sim-motor04e/plan'); const out = arg('out', join(SELF, 'out/sim-motor04e/campaign'));
const vecDir = join(out, '..', 'vectors'); const cand = JSON.parse(readFileSync(join(vecDir, 'C04D-FINAL-PROVISIONAL.json'), 'utf8')); const Z0 = JSON.parse(readFileSync(join(vecDir, 'Z0-A0.json'), 'utf8'));
const alias = cand.parent === 'Z0-A0'; const res = []; const go = async (o) => { const r = await run({ root: SELF, out, planDir, ...o }); res.push(r); console.log(JSON.stringify(r)); };
await go({ block: 'VAL', identity: 'DET', resolver: 'detailed' });
await go({ block: 'VAL', identity: 'C0_04C', overrides: Z0.overrides, vectorId: 'Z0-A0' });
if (!alias) await go({ block: 'VAL', identity: 'CAND', overrides: cand.overrides, vectorId: cand.parent });
await go({ block: 'CONTRAST', identity: 'DET', resolver: 'detailed' });
await go({ block: 'CONTRAST', identity: 'C0_04C', overrides: Z0.overrides, vectorId: 'Z0-A0' });
if (!alias) await go({ block: 'CONTRAST', identity: 'CAND', overrides: cand.overrides, vectorId: cand.parent });
for (const route of ['auto', 'steps', 'recover']) await go({ block: 'TECH', identity: `TECH-${route}`, overrides: cand.overrides, vectorId: cand.parent, route: route === 'auto' ? null : route, routes: TECH_ROUTES });
// comprobación de trayectoria en el árbol auténtico de 04C (solo las cuatro entradas DIAG; extra, no cuenta como condición de VAL)
const r04c = arg('root-04c'); if (r04c) await go({ block: 'VAL', identity: 'C0_AUTH_04C', root: r04c, overrides: JSON.parse(readFileSync(join(SELF, 'out/sim-motor04c/vectors/C04C-FINAL-PROVISIONAL.json'), 'utf8')).overrides, only: ['VAL-EQ01-EQ04-R1', 'VAL-EQ01-EQ04-R2', 'VAL-EQ01-EQ04-R3', 'VAL-EQ01-EQ04-R4'] });
writeFileSync(join(out, '..', 'val-campaign-summary.json'), JSON.stringify({ alias, candidate: cand.id, parent: cand.parent, runs: res }, null, 1)); process.exit(0);
