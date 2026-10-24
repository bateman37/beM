// SIM-MOTOR-04D · búsqueda conjunta de 36 vectores completos sobre DEV (§7, §9.1): 48 entradas VAL de 04C conocidas, mismas semillas por caso entre vectores, detallado reutilizado.
//   node scripts/sim04d/dev.js --phase=rules                  escribe plan/selection-rules.json (ANTES de ejecutar DEV y congelar)
//   node scripts/sim04d/dev.js --phase=run [--out=out/sim-motor04d/campaign]   reutiliza 04C, ejecuta los vectores que falten y escribe 11-SELECCION-DEV.json y el vector elegido
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import { reuse } from './reuse.js';
import * as S from './select.js';
import { evaluate, detTables } from './evaluate.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04d/plan')); const out = arg('out', join(SELF, 'out/sim-motor04d/campaign')); const phase = arg('phase', 'run');
const devIds = () => readFileSync(join(planDir, 'agenda.csv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split(',')).filter((f) => f[1] === 'DEV').map((f) => f[0]);

if (phase === 'rules') {
  const file = { schema: 'beM-sim04d-selection-rules/1', frozenBeforeDEV: true, rules: S.RULES, vectors: S.VECTORS.map((v) => ({ id: v.id, z: v.z, a: v.a, overrides: v.overrides })),
    identities: { DET: 'detallado congelado (referencia 20261016, 83–98 y 6.684 sorteos), mismas entradas; reutilizado de 04C', C0_04C: 'código y perfil de 04C: candidata C04C-FINAL-PROVISIONAL (registros auténticos de 04C reutilizados sobre DEV)', 'Z0-A0': 'D0_04D: código de 04D con los seis mecanismos nuevos neutrales y el vector de 04C (control de la selección)', 'Zi-Aj': 'vectores completos de la búsqueda conjunta' },
    selectionRulesSha256: S.rulesHash() };
  mkdirSync(planDir, { recursive: true }); writeFileSync(join(planDir, 'selection-rules.json'), JSON.stringify(file, null, 1)); console.log(JSON.stringify({ phase, vectors: S.VECTORS.length, selectionRulesSha256: file.selectionRulesSha256 })); process.exit(0);
}

const ids = devIds(); const vecDir = join(out, '..', 'vectors'); mkdirSync(vecDir, { recursive: true }); mkdirSync(out, { recursive: true });
const t0 = performance.now(); const rep = reuse({ from: join(SELF, 'out/sim-motor04c/campaign'), out, planDir }); console.log(JSON.stringify({ reuse: rep }));
if (rep.detailed.rejected.length || rep.c0.rejected.length) { console.error('reutilización rechazada'); process.exit(2); }
const counts = {}; const only = arg('only') ? arg('only').split(',') : null;
for (const v of S.VECTORS) {
  writeFileSync(join(vecDir, `${v.id}.json`), JSON.stringify({ id: v.id, z: v.z, a: v.a, overrides: v.overrides }, null, 1));
  if (only && !only.includes(v.id)) continue; counts[v.id] = await run({ block: 'DEV', identity: v.id, overrides: v.overrides, vectorId: v.id, out, planDir }); console.log(JSON.stringify(counts[v.id]));
}
const det = detTables(out, 'DEV', ids); const evals = {}; const cands = [];
const ctl = evaluate({ out, identity: S.CONTROL_ID, block: 'DEV', caseIds: ids, det }); evals[S.CONTROL_ID] = ctl;
for (const v of S.VECTORS) { if (v.id === S.CONTROL_ID) continue; const e = evaluate({ out, identity: v.id, block: 'DEV', caseIds: ids, det }); evals[v.id] = e; cands.push({ id: v.id, set: v.set, errs: e.errs, M: e.M04D_comparable.M, invariantsOk: e.invariantsOk }); }
const c0 = evaluate({ out, identity: 'C0_04C', block: 'DEV', caseIds: ids, det });
const final = S.selectFinal({ id: S.CONTROL_ID, errs: ctl.errs }, cands);
const slim = (e) => { const { tables, ...r } = e; return r; };
const chosen = final.chosenId; const chosenVec = S.vectorById(chosen);
const result = { schema: 'beM-sim04d-dev-selection/1', rules: S.RULES, selectionRulesSha256: S.rulesHash(), populations: { devCases: ids.length, anchors: ids.length }, runs: counts, reuse: rep, evaluations: Object.fromEntries(Object.entries(evals).map(([k, v]) => [k, slim(v)])), c0_04C: slim(c0), selection: final,
  finalProvisional: { id: chosen === S.CONTROL_ID ? 'D0_04D' : `C04D-${chosen}`, basedOn: chosen, overrides: chosenVec.overrides, M04D: evals[chosen].M04D, M04D_comparable: evals[chosen].M04D_comparable, errors: evals[chosen].errs, errorsControl: ctl.errs, note: 'candidata provisional elegida solo con DEV conocido; no es aceptación deportiva ni calibración' }, wallMs: Math.round(performance.now() - t0) };
writeFileSync(join(out, '..', '11-SELECCION-DEV.json'), JSON.stringify(result, null, 1));
writeFileSync(join(vecDir, 'C04D-FINAL-PROVISIONAL.json'), JSON.stringify({ id: 'C04D-FINAL-PROVISIONAL', parent: chosen, overrides: chosenVec.overrides, note: 'candidata provisional elegida solo con DEV; no es aceptación deportiva ni calibración' }, null, 1));
console.log(JSON.stringify({ chosen, kept: final.kept, reason: final.reason, controlM_comparable: ctl.M04D_comparable.M, controlM_full: ctl.M04D.partialM, wallMs: result.wallMs })); process.exit(0);
