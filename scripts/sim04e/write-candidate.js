// SIM-MOTOR-04E · añade a src/sim/candidates.js las candidatas de la búsqueda (`C04E-FINAL-PROVISIONAL`, que puede ser un ALIAS de la base, y `C04E-EXPERIMENTAL`, que puede incumplir guardas) y CONSERVA las anteriores tal cual.
// Una candidata NO es un perfil activo: la carga es una acción explícita del usuario y se identifica como provisional/experimental. «Elegida por el selector» no es «calibrada» ni «aceptada por Dennis».
//   node scripts/sim04e/write-candidate.js [--sel=out/sim-motor04e/11-BUSQUEDA-Y-SELECCION.json] [--vectors=out/sim-motor04e/vectors]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { loadEnv } from './lib.js';
import { SIM_CANDIDATES as PREV } from '../../src/sim/candidates.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const sel = JSON.parse(readFileSync(arg('sel', `${root}out/sim-motor04e/11-BUSQUEDA-Y-SELECCION.json`), 'utf8')); const vdir = arg('vectors', `${root}out/sim-motor04e/vectors`); const env = loadEnv(); const base = env.ctx.sp;
const rj = (n) => (existsSync(`${vdir}/${n}.json`) ? JSON.parse(readFileSync(`${vdir}/${n}.json`, 'utf8')) : null);
const mkRows = (v) => v.overrides.map((o) => { const r = base.index.get(o.path); return { path: o.path, value: o.value, base: r.value, unit: r.unit, origin: r.origin, effect: r.effect }; });
const entry = (id, v, status, extra = {}) => { const rows = mkRows(v); return { id, version: 'CAND-SIM04E-20261024-R1', status, baseProfile: base.id, baseFingerprint: base.fingerprint, selectionRules: sel.final ? sel.rulesSha256 && 'SEL-SIM04E-R1' : null, searchRulesSha256: sel.rulesSha256, searchVectorId: v.id, evidence: 'out/sim-motor04e/11-BUSQUEDA-Y-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04e.md', ...extra, overrides: rows.map((r) => ({ path: r.path, value: r.value })), rows }; };
const cand = rj('SIM_04E_CAND'); const exp = rj('SIM_04E_EXPERIMENTAL'); const out = []; const fin = sel.final;
out.push(entry('C04E-FINAL-PROVISIONAL', cand, cand.alias
  ? `provisional: la búsqueda acotada SRCH-SIM04E-R1 NO encontró ninguna alternativa admisible (guardas frente a S0 y mejora relativa de M ≥ 5 %) sobre el desarrollo conjunto de 72 entradas: coincide con SIM_04E_BASE (S0, el vector de 04C/04D); ${fin.reason}; pendiente de aceptación deportiva de Dennis`
  : `provisional: elegida por la búsqueda acotada SRCH-SIM04E-R1 solo con desarrollo conocido (M ${fin.best.M.toFixed(3)} frente a ${fin.s0.M.toFixed(3)} de S0); pendiente de aceptación deportiva de Dennis`, { aliasOf: cand.alias ? 'SIM_04E_BASE' : null }));
if (exp) { const row = fin.rows.find((r) => r.id === exp.id); out.push(entry('C04E-EXPERIMENTAL', exp, `EXPERIMENTAL, no recomendada: mejor perfil de desarrollo que no coincide con la base ni con la candidata (M ${row.M.toFixed(3)} frente a ${fin.s0.M.toFixed(3)} de S0), pero incumple guardas frente a S0 (${row.reasons.join('; ')}); nunca se activa ni se presenta como aceptada`, { experimental: true })); }
const keep = new Set(out.map((c) => c.id)); const kept = PREV.filter((c) => !keep.has(c.id)).map((c) => ({ ...c, overrides: c.overrides.map((o) => ({ ...o })), rows: c.rows.map((r) => ({ ...r })) }));
const src = `// Candidatas numéricas del generador estadístico (SIM-MOTOR-04B, 04C, 04D y 04E). GENERADO por scripts/sim04c|04d|04e/write-candidate.js desde el selector mecánico; no se edita a mano.
// Una candidata NO es un perfil activo: la base es ${base.id}; cargarla en el panel de parámetros es una acción explícita y se identifica como provisional o experimental. «Elegida por el selector» no es «calibrada» ni aceptada por Dennis.
export const SIM_CANDIDATES = Object.freeze(${JSON.stringify([...kept, ...out], null, 2)}.map((c) => Object.freeze({ ...c, overrides: Object.freeze(c.overrides.map((o) => Object.freeze(o))), rows: Object.freeze(c.rows.map((r) => Object.freeze(r))) })));
export const candidateById = (id) => SIM_CANDIDATES.find((c) => c.id === id) ?? null;
`;
writeFileSync(`${root}src/sim/candidates.js`, src); console.log(JSON.stringify({ written: 'src/sim/candidates.js', candidates: kept.length + out.length, added: out.map((c) => c.id), rows: out.map((c) => c.rows.length), base: base.fingerprint }));
