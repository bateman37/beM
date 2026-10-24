// SIM-MOTOR-04D · biblioteca de la campaña (§9): DEV conocido (las 48 entradas VAL de 04C, reutilizadas con sus semillas), VAL04D nueva y cerrada (12 parejas × 2 orientaciones × 4 réplicas = 96), CONTRAST (las 16 entradas
// congeladas de 04C), DIAG (las cuatro primeras entradas de VAL04D por condición) y TECH (las cuatro primeras entradas DEV × tres recorridos). TODO es determinista y se define ANTES de ejecutar.
// Semillas nuevas (solo VAL04D): SHA-256 de la clave UTF-8 `20261024|SIM04D|VAL|<pareja-orientada>|R<réplica>` (primeros 32 bits big endian; 0 → 1; colisión → `#2`, `#3`…). La clave excluye condición, vector, resolutor,
// intento, worker y ruta. DEV, CONTRAST y TECH reutilizan las entradas y semillas de 04C (mismo `input_hash`).
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import * as L4B from '../sim04b/lib.js';
import { buildPairInput } from '../../src/sim/teams.js';
import { canonical } from '../../src/sim/fp.js';

export const { entryIdOf, inputHashOf, diffInputs, compactDiff, validateBoth, loadEnv, contrastDefs, MAIN_TEAMS } = L4B;
export const DATE = '20261024';
export const CAMPAIGN_ID = 'SIM04D-CAMPANA-20261024';
export const NAMESPACE = 'SIM04D';
export const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : canonical(x)).digest('hex');
const u32 = (key) => { const v = createHash('sha256').update(key, 'utf8').digest().readUInt32BE(0); return v === 0 ? 1 : v; };
export const deep = (x) => JSON.parse(JSON.stringify(x));
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
export const PLAN04C = join(SELF, 'docs/tecnico/evidencia-sim-motor04c/plan');

// ---------------------------------------------------------------------------------------------------------------------------------- semillas
export function makeSeeder() {
  const used = new Map(); const collisions = []; const pairs = [];
  return {
    reserve(seed, key) { used.set(seed, key); },
    seed(block, caseKey, replica) {
      const base = `${DATE}|${NAMESPACE}|${block}|${caseKey}|R${replica}`; let ord = 1; let k = base; let s = u32(k);
      while (used.has(s) && used.get(s) !== k) { collisions.push({ key: k, seed: s, with: used.get(s) }); ord += 1; k = `${base}#${ord}`; s = u32(k); }
      if (used.get(s) === k) pairs.push({ key: k, seed: s });
      used.set(s, k); return { seed: s, seed_key: k, ordinal: ord };
    },
    collisions, used, pairs,
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------- lectura de la agenda congelada de 04C (DEV, CONTRAST)
export function load04C() {
  const [h, ...ls] = readFileSync(join(PLAN04C, 'agenda.csv'), 'utf8').trim().split('\n'); const cols = h.split(','); const agenda = new Map();
  for (const l of ls) { const f = l.split(','); const o = Object.fromEntries(cols.map((c, i) => [c, f[i]])); o.seed = Number(o.seed); o.replicate = Number(o.replicate); agenda.set(o.case_id, o); }
  const entries = new Map(gunzipSync(readFileSync(join(PLAN04C, 'entries.jsonl.gz'))).toString().split('\n').filter(Boolean).map((l) => { const x = JSON.parse(l); return [x.entry_id, x.input]; }));
  return { agenda, entries };
}
// DEV: las 48 entradas VAL de 04C (conocidas y ya analizadas: NO son una reserva independiente). Identificador `DEV-…` con la correspondencia explícita al caso de 04C.
export function devCases(prev, seeder) {
  const out = [];
  for (const a of prev.agenda.values()) {
    if (a.block !== 'VAL') continue; seeder.reserve(a.seed, a.seed_key);
    out.push({ case_id: a.case_id.replace(/^VAL-/, 'DEV-'), block: 'DEV', scenario: a.scenario, variant: 'natural', orientation: a.orientation, replicate: a.replicate, seed: a.seed, seed_key: a.seed_key, ordinal: Number(a.ordinal), teams: [a.team0, a.team1], anchor: true, entry_id: a.entry_id, input_hash: a.input_hash, reused_from: `SIM-MOTOR-04C:${a.case_id}`, prev_case_id: a.case_id });
  }
  return out;
}
// CONTRAST: las 16 entradas de 04C con sus semillas (T01 rebote/balance, T02 interior/exterior, T05 director, T07 familiaridad); V0/V1 comparten semilla por diseño. Ancla detallada en la orientación O1 (ocho).
export function contrastCasesFrom(prev, seeder) {
  const out = [];
  for (const a of prev.agenda.values()) {
    if (a.block !== 'CONTRAST') continue; seeder.reserve(a.seed, a.seed_key);
    out.push({ case_id: a.case_id, block: 'CONTRAST', scenario: a.scenario, variant: a.variant, orientation: a.orientation, replicate: a.replicate, seed: a.seed, seed_key: a.seed_key, ordinal: Number(a.ordinal), teams: [a.team0, a.team1], testTeam: a.test_team || null, anchor: a.anchor === '1', entry_id: a.entry_id, input_hash: a.input_hash, reused_from: `SIM-MOTOR-04C:${a.case_id}`, prev_case_id: a.case_id });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------- VAL04D nueva
// Doce parejas no ordenadas del encargo (01 = EQ01), dos orientaciones y cuatro réplicas = 96 encuentros lógicos; dieciséis actuaciones por equipo. Orden de agenda: pareja → orientación → réplica.
export const VAL_PAIRS = [[1, 4], [4, 7], [7, 10], [10, 1], [2, 5], [5, 8], [8, 11], [11, 2], [3, 6], [6, 9], [9, 12], [12, 3]];
export const VAL_REPLICAS = 4;
const eq = (n) => `EQ${String(n).padStart(2, '0')}`;
export function valCases(env, seeder) {
  const out = [];
  for (const [i, j] of VAL_PAIRS) for (const [a, b] of [[eq(i), eq(j)], [eq(j), eq(i)]]) for (let r = 1; r <= VAL_REPLICAS; r++) {
    const sd = seeder.seed('VAL', `${a}>${b}`, r);
    out.push({ case_id: `VAL-${a}-${b}-R${r}`, block: 'VAL', scenario: `${a}>${b}`, variant: 'natural', orientation: `${a}>${b}`, replicate: r, ...sd, teams: [a, b], anchor: true, make: () => buildPairInput(env.teamMap, a, b, { seed: sd.seed, importance: 'ordinary' }) });
  }
  return out;
}
export const DIAG_N = 4; // las cuatro primeras entradas de VAL04D por condición (elegidas ANTES de leer resultados)
export const DIAG_VAL = (val) => val.slice(0, DIAG_N).map((c) => c.case_id);

export function allCases(env) {
  const seeder = makeSeeder(); const prev = load04C(); const dev = devCases(prev, seeder); const contrast = contrastCasesFrom(prev, seeder); const val = valCases(env, seeder);
  return { dev, val, contrast, prev, seeder, byId: new Map([...dev, ...val, ...contrast].map((c) => [c.case_id, c])) };
}

// TECH: las cuatro primeras entradas DEV × tres recorridos (auto, steps, recover) con la candidata = 12 SIM. `recover` guarda y restaura en las fronteras indicadas CON sufijo generado privado.
export const TECH_CASES = ['DEV-EQ01-EQ03-R1', 'DEV-EQ01-EQ03-R2', 'DEV-EQ03-EQ01-R1', 'DEV-EQ03-EQ01-R2'];
export const TECH_ROUTE_NAMES = ['auto', 'steps', 'recover'];
export const TECH_ROUTES = {
  'DEV-EQ01-EQ03-R1': { steps: [600, 1200, 1800, 2400], cuts: [1200] }, 'DEV-EQ01-EQ03-R2': { steps: [120, 240, 480, 1200, 2400], cuts: [125, 2000] },
  'DEV-EQ03-EQ01-R1': { steps: [37, 500, 501, 1999], cuts: [600] }, 'DEV-EQ03-EQ01-R2': { steps: [1, 2, 3, 119, 121, 1700], cuts: [2399] },
};
// Historia desde la reserva: los 24 encuentros de la réplica 1 de VAL04D en un calendario estadístico ARTIFICIAL (no una temporada).
export function historyVal(val) { return val.filter((c) => c.replicate === 1).map((c, i) => ({ round: Math.floor(i / 4) + 1, case_id: c.case_id, home: c.teams[0], away: c.teams[1], artificialCalendar: true })); }
export const LEARNING_PAIRS = ['VAL-EQ01-EQ04-R1', 'VAL-EQ05-EQ02-R1', 'VAL-EQ08-EQ05-R2', 'VAL-EQ10-EQ07-R1', 'VAL-EQ09-EQ12-R2', 'VAL-EQ12-EQ03-R1'].map((id, i) => ({ pair: `L${i + 1}`, sim: id, detailed: id }));
export function materialize(env, c) { if (c.make) { const input = c.make(); return { input, entry_id: entryIdOf(input), input_hash: inputHashOf(input) }; } return { input: null, entry_id: c.entry_id, input_hash: c.input_hash }; }
export const hasPlan04C = () => existsSync(join(PLAN04C, 'agenda.csv'));
