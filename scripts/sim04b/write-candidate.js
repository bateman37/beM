// Escribe src/sim/candidates.js con el vector elegido por el selector (07-CAL-SELECCION.json). El vector es una CANDIDATA provisional: no se activa en silencio (la base sigue siendo el perfil SEM-SIM01+02+04) y su aceptación
// deportiva corresponde a Dennis. Cada fila declara base, valor, unidad, origen y efecto leyendo el perfil SIM efectivo.
//   node scripts/sim04/write-candidate.js [--sel=out/sim-motor04/07-CAL-SELECCION.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { loadEnv } from './lib.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const sel = JSON.parse(readFileSync(arg('sel', `${root}out/sim-motor04/07-CAL-SELECCION.json`), 'utf8')); const env = loadEnv(); const base = env.ctx.sp;
const rows = sel.finalProvisional.overrides.map((o) => { const r = base.index.get(o.path); return { path: o.path, value: o.value, base: r.value, unit: r.unit, origin: r.origin, effect: r.effect }; });
const src = `// Candidatas numéricas del generador estadístico (SIM-MOTOR-04). GENERADO por scripts/sim04/write-candidate.js desde el selector mecánico (${sel.rules.id}); no se edita a mano.
// Una candidata NO es un perfil activo: la base sigue siendo ${base.id}; cargarla en el panel de parámetros es una acción explícita y se identifica como provisional. «Elegida por el selector» no es «calibrada» ni aceptada por Dennis.
export const SIM_CANDIDATES = Object.freeze([{
  id: 'C04-FINAL-PROVISIONAL', version: 'CAND-SIM04-20261023-R1', status: 'provisional: elegida por el selector mecánico de convergencia funcional de laboratorio; pendiente de aceptación deportiva de Dennis',
  baseProfile: ${JSON.stringify(base.id)}, baseFingerprint: ${JSON.stringify(base.fingerprint)}, selectionRules: ${JSON.stringify(sel.rules.id)}, selectionRulesSha256: ${JSON.stringify(sel.selectionRulesSha256)}, evidence: 'out/sim-motor04/07-CAL-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04.md',
  overrides: Object.freeze(${JSON.stringify(rows.map((r) => ({ path: r.path, value: r.value })))}),
  rows: Object.freeze(${JSON.stringify(rows, null, 2).replace(/\n/g, '\n  ')}),
}]);
export const candidateById = (id) => SIM_CANDIDATES.find((c) => c.id === id) ?? null;
`;
writeFileSync(`${root}src/sim/candidates.js`, src); console.log(JSON.stringify({ written: 'src/sim/candidates.js', rows: rows.length, base: base.fingerprint }));
