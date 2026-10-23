// SIM-MOTOR-04C · biblioteca de la campaña emparejada (§9): CAL (24 entradas congeladas de 04B, reutilizadas), VAL nueva (12 parejas × 2 orientaciones × 2 réplicas = 48), CONTRAST (T01/T02/T05/T07 × V0/V1 × 2 orientaciones = 16),
// DIAG (los cuatro primeros casos de VAL en orden de agenda) y TECH (seis entradas CAL × tres recorridos). TODO es determinista y se define ANTES de ejecutar. Semillas nuevas: SHA-256 de la clave UTF-8
// `20261024|SIM04C|<bloque>|<caso>|R<réplica>` (primeros 32 bits big endian; 0 → 1; colisión → `#2`, `#3`…). La clave excluye identidad de candidata, vector, resolutor, intento, worker y ruta.
import { createHash } from 'node:crypto';
import * as L4B from '../sim04b/lib.js';
import { buildPairInput } from '../../src/sim/teams.js';
import { canonical } from '../../src/sim/fp.js';

export const { entryIdOf, inputHashOf, diffInputs, compactDiff, validateBoth, loadEnv, contrastDefs, MAIN_TEAMS } = L4B;
export const DATE = '20261024';
export const CAMPAIGN_ID = 'SIM04C-CAMPANA-20261024';
export const NAMESPACE = 'SIM04C';
export const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : canonical(x)).digest('hex');
const u32 = (key) => { const v = createHash('sha256').update(key, 'utf8').digest().readUInt32BE(0); return v === 0 ? 1 : v; };

// ---------------------------------------------------------------------------------------------------------------------------------- semillas
// `registry`: semilla → clave (todas las semillas de la campaña, incluidas las de CAL reutilizadas de 04B). Una semilla repetida entre claves DISTINTAS es una colisión: se resuelve con `#2`, `#3`…
// y se registra el ordinal. La repetición intencionada V0/V1 de CONTRAST (misma clave) NO es una colisión: se declara como emparejamiento.
export function makeSeeder() {
  const used = new Map(); const collisions = []; const pairs = [];
  return {
    reserve(seed, key) { used.set(seed, key); },
    seed(block, caseKey, replica) {
      const base = `${DATE}|${NAMESPACE}|${block}|${caseKey}|R${replica}`; let ord = 1; let k = base; let s = u32(k);
      while (used.has(s) && used.get(s) !== k) { collisions.push({ key: k, seed: s, with: used.get(s) }); ord += 1; k = `${base}#${ord}`; s = u32(k); }
      const intentionalPair = used.get(s) === k; if (intentionalPair) pairs.push({ key: k, seed: s });
      used.set(s, k); return { seed: s, seed_key: k, ordinal: ord };
    },
    collisions, pairs, used,
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------- CAL (reutilizado de 04B)
// Las 24 entradas CAL de 04B están congeladas en el repositorio (plan de 04B: entradas, agenda y semillas). Se regeneran con el mismo generador y se comprueba que su `input_hash` coincide con el plan congelado de 04B.
export function calCases(env, seeder) {
  const seeder4b = L4B.makeSeeder(); const cal = L4B.mainCases(env, seeder4b, 'CAL');
  for (const c of cal) { seeder.reserve(c.seed, c.seed_key); c.reused_from = 'SIM-MOTOR-04B'; }
  return cal;
}

// ---------------------------------------------------------------------------------------------------------------------------------- VAL nueva
// Doce parejas no ordenadas declaradas en el encargo (01 = EQ01), dos orientaciones y dos réplicas = 48 casos. Orden de agenda: pareja → orientación → réplica (los cuatro primeros cubren las dos réplicas de ambas orientaciones de la primera pareja).
export const VAL_PAIRS = [[1, 3], [3, 5], [5, 7], [7, 9], [9, 11], [11, 1], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 2]];
const eq = (n) => `EQ${String(n).padStart(2, '0')}`;
export function valCases(env, seeder) {
  const out = [];
  for (const [i, j] of VAL_PAIRS) for (const [a, b] of [[eq(i), eq(j)], [eq(j), eq(i)]]) for (let r = 1; r <= 2; r++) {
    const sd = seeder.seed('VAL', `${a}>${b}`, r);
    out.push({ case_id: `VAL-${a}-${b}-R${r}`, block: 'VAL', scenario: `${a}>${b}`, variant: 'natural', orientation: `${a}>${b}`, replicate: r, ...sd, teams: [a, b], anchor: true, make: () => buildPairInput(env.teamMap, a, b, { seed: sd.seed, importance: 'ordinary' }) });
  }
  return out;
}
export const DIAG_N = 4; // los cuatro primeros casos de VAL en orden de agenda (elegidos ANTES de leer resultados)

// ---------------------------------------------------------------------------------------------------------------------------------- CONTRAST
// Definiciones T01 (rebote/balance), T02 (interior/exterior), T05 (lectura del director) y T07 (familiaridad organizada) de 04B, sin recalibrar. `<caso>` de la semilla = factor + orientación; V0/V1 comparten semilla
// de forma intencionada (registrada como emparejamiento, no como colisión). DET solo en la orientación O1 de cada V0/V1 (ocho anclas predeclaradas).
export const CONTRAST_FACTORS = ['T01', 'T02', 'T05', 'T07'];
export function contrastCases(env, seeder) {
  const cases = []; const defs = contrastDefs(env);
  for (const id of CONTRAST_FACTORS) { const sc = defs.find((d) => d.id === id); for (const v of sc.variants) for (const o of [1, 2]) {
    const [t1id, t2id] = sc.pair; const teams = o === 1 ? [t1id, t2id] : [t2id, t1id]; const sd = seeder.seed('CONTRAST', `${sc.id}|O${o}`, 1); const case_id = `CONTRAST-${sc.id}-${v.id}-O${o}-R1`;
    cases.push({ case_id, block: 'CONTRAST', scenario: sc.id, variant: v.id, orientation: `O${o}`, replicate: 1, ...sd, teams, testTeam: t1id, factor: sc.factor, variantLabel: v.label, anchor: o === 1,
      make: () => { const inp = buildPairInput(env.teamMap, teams[0], teams[1], { seed: sd.seed, importance: 'ordinary' }); const ti = o === 1 ? 0 : 1; const t1 = inp.teams[ti]; const t2 = inp.teams[1 - ti]; sc.prepare?.(inp, env, t1, t2); v.apply(inp, t1, t2, env); return inp; } });
  } }
  return cases;
}

export function allCases(env) {
  const seeder = makeSeeder(); const cal = calCases(env, seeder); const val = valCases(env, seeder); const contrast = contrastCases(env, seeder);
  return { cal, val, contrast, seeder, byId: new Map([...cal, ...val, ...contrast].map((c) => [c.case_id, c])) };
}
export const DIAG_VAL = (val) => val.slice(0, DIAG_N).map((c) => c.case_id);

// TECH: seis entradas CAL predeclaradas × tres recorridos (auto, steps, recover) con la candidata final = 18 SIM. `recover` guarda y restaura en las fronteras indicadas CON sufijo generado privado (el guardado conserva lo generado por delante).
export const TECH_CASES = ['CAL-EQ01-EQ02', 'CAL-EQ03-EQ04', 'CAL-EQ05-EQ08', 'CAL-EQ09-EQ12', 'CAL-EQ01-EQ05', 'CAL-EQ08-EQ02'];
export const TECH_ROUTE_NAMES = ['auto', 'steps', 'recover'];
export const TECH_ROUTES = {
  'CAL-EQ01-EQ02': { steps: [600, 1200, 1800, 2400], cuts: [1200] }, 'CAL-EQ03-EQ04': { steps: [120, 240, 480, 1200, 2400], cuts: [125, 2000] }, 'CAL-EQ05-EQ08': { steps: [37, 500, 501, 1999], cuts: [600] },
  'CAL-EQ09-EQ12': { steps: [1, 2, 3, 119, 121, 1700], cuts: [2399] }, 'CAL-EQ01-EQ05': { steps: [300, 900, 1500, 2100], cuts: [900, 1800] }, 'CAL-EQ08-EQ02': { steps: [60, 61, 600, 1210], cuts: [61] },
};
// Historia desde la reserva (§11.3): los 24 encuentros de la réplica 1 de VAL en un calendario estadístico ARTIFICIAL (no una temporada).
export function historyVal(val) { return val.filter((c) => c.replicate === 1).map((c, i) => ({ round: Math.floor(i / 4) + 1, case_id: c.case_id, home: c.teams[0], away: c.teams[1], artificialCalendar: true })); }
export const LEARNING_PAIRS = ['VAL-EQ01-EQ03-R1', 'VAL-EQ04-EQ02-R1', 'VAL-EQ05-EQ07-R2', 'VAL-EQ10-EQ08-R1', 'VAL-EQ11-EQ09-R2', 'VAL-EQ12-EQ02-R1'].map((id, i) => ({ pair: `L${i + 1}`, sim: id, detailed: id }));
export function materialize(env, c) { const input = c.make(); return { input, entry_id: entryIdOf(input), input_hash: inputHashOf(input) }; }
export const deep = (x) => JSON.parse(JSON.stringify(x));
