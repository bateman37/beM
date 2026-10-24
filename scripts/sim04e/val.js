// SIM-MOTOR-04E · campaña de la RESERVA con vectores y código congelados (§11): VAL04E nueva y cerrada (96 DET + SIM_04E_BASE + SIM_04E_CAND si difiere + la mejor experimental si es distinta, sobre las mismas entradas y semillas),
// CONTRAST (DET en las ocho anclas, base y candidata si difiere; 16 SIM por condición) y TECH (tres recorridos de las cuatro primeras entradas DEV con la candidata recomendada). DIAG: las cuatro primeras entradas de VAL04E se
// conservan al ejecutarlas. Reanudable: un caso terminado no se repite. Un alias reutiliza registros (no duplica observaciones).
//   node scripts/sim04e/val.js [--out=out/sim-motor04e/campaign]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import { TECH_ROUTES } from './lib.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = join(SELF, 'docs/tecnico/evidencia-sim-motor04e/plan'); const out = arg('out', join(SELF, 'out/sim-motor04e/campaign'));
const vecDir = join(out, '..', 'vectors'); const rj = (n) => (existsSync(join(vecDir, `${n}.json`)) ? JSON.parse(readFileSync(join(vecDir, `${n}.json`), 'utf8')) : null);
const base = rj('SIM_04E_BASE'); const cand = rj('SIM_04E_CAND'); const exp = rj('SIM_04E_EXPERIMENTAL');
const conditions = [{ identity: 'SIM_04E_BASE', v: base }]; if (!cand.alias) conditions.push({ identity: 'SIM_04E_CAND', v: cand }); if (exp && exp.id !== base.id && exp.id !== cand.id) conditions.push({ identity: 'SIM_04E_EXP', v: exp });
const res = []; const go = async (o) => { const r = await run({ root: SELF, out, planDir, ...o }); res.push(r); console.log(JSON.stringify(r)); };
await go({ block: 'VAL', identity: 'DET', resolver: 'detailed' });
for (const c of conditions) await go({ block: 'VAL', identity: c.identity, overrides: c.v.overrides, vectorId: c.v.id });
await go({ block: 'CONTRAST', identity: 'DET', resolver: 'detailed' });
for (const c of conditions.filter((x) => x.identity !== 'SIM_04E_EXP')) await go({ block: 'CONTRAST', identity: c.identity, overrides: c.v.overrides, vectorId: c.v.id });
const techV = cand.alias ? base : cand;
for (const route of ['auto', 'steps', 'recover']) await go({ block: 'TECH', identity: `TECH-${route}`, overrides: techV.overrides, vectorId: techV.id, route: route === 'auto' ? null : route, routes: TECH_ROUTES });
writeFileSync(join(out, '..', 'val-campaign-summary.json'), JSON.stringify({ alias: !!cand.alias, base: base.id, candidate: cand.id, experimental: exp?.id ?? null, conditions: conditions.map((c) => c.identity), runs: res }, null, 1)); process.exit(0);
