// SIM-MOTOR-04C · Añade a src/sim/candidates.js la candidata elegida por el selector (07-CAL-SELECCION.json) y CONSERVA las anteriores tal cual (C04B-FINAL-PROVISIONAL). El vector es una CANDIDATA provisional: no se activa en
// silencio (la base sigue siendo el perfil SEM-SIM01+02+04+04B+04C con filas nuevas neutrales) y su aceptación deportiva corresponde a Dennis. Cada fila declara base, valor, unidad, origen y efecto leyendo el perfil SIM efectivo.
//   node scripts/sim04c/write-candidate.js [--sel=out/sim-motor04c/07-CAL-SELECCION.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { loadEnv } from './lib.js';
import { SIM_CANDIDATES as PREV } from '../../src/sim/candidates.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const sel = JSON.parse(readFileSync(arg('sel', `${root}out/sim-motor04c/07-CAL-SELECCION.json`), 'utf8')); const env = loadEnv(); const base = env.ctx.sp;
const fp = sel.finalProvisional; const alias = fp.basedOn === 'N04C';
const status = alias ? 'provisional: el selector mecánico NO encontró ningún vector admisible con mejora ≥ 5 % de M: coincide con N04C (los cuatro valores de la candidata de 04B con las filas nuevas neutrales); pendiente de aceptación deportiva de Dennis' : `provisional: elegida por el selector mecánico SEL-SIM04C-R1 solo con CAL (${fp.basedOn}; M ${fp.M.toFixed(3)} frente a ${fp.MN04C.toFixed(3)} de N04C; no todos los errores entran en banda); pendiente de aceptación deportiva de Dennis`;
const rows = fp.overrides.map((o) => { const r = base.index.get(o.path); return { path: o.path, value: o.value, base: r.value, unit: r.unit, origin: r.origin, effect: r.effect }; });
const entry = { id: 'C04C-FINAL-PROVISIONAL', version: 'CAND-SIM04C-20261024-R1', status, baseProfile: base.id, baseFingerprint: base.fingerprint, selectionRules: sel.rules.id, selectionRulesSha256: sel.selectionRulesSha256, evidence: 'out/sim-motor04c/07-CAL-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04c.md', overrides: rows.map((r) => ({ path: r.path, value: r.value })), rows };
const kept = PREV.filter((c) => c.id !== entry.id).map((c) => ({ ...c, overrides: c.overrides.map((o) => ({ ...o })), rows: c.rows.map((r) => ({ ...r })) }));
const src = `// Candidatas numéricas del generador estadístico (SIM-MOTOR-04B y 04C). GENERADO por scripts/sim04c/write-candidate.js desde el selector mecánico; no se edita a mano.
// Una candidata NO es un perfil activo: la base es ${base.id}; cargarla en el panel de parámetros es una acción explícita y se identifica como provisional. «Elegida por el selector» no es «calibrada» ni aceptada por Dennis.
export const SIM_CANDIDATES = Object.freeze(${JSON.stringify([...kept, entry], null, 2).replace(/"(overrides|rows)": (\[)/g, '"$1": $2')}.map((c) => Object.freeze({ ...c, overrides: Object.freeze(c.overrides.map((o) => Object.freeze(o))), rows: Object.freeze(c.rows.map((r) => Object.freeze(r))) })));
export const candidateById = (id) => SIM_CANDIDATES.find((c) => c.id === id) ?? null;
`;
writeFileSync(`${root}src/sim/candidates.js`, src); console.log(JSON.stringify({ written: 'src/sim/candidates.js', candidates: kept.length + 1, rows: rows.length, base: base.fingerprint }));
