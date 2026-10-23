// SIM-MOTOR-04B · biblioteca de la campaña acotada (§10): casos CAL, VAL, STRESS y CONTRAST, anclas detalladas, muestra diagnóstica, OPT, TECH, historia y aprendizaje.
// TODO es determinista y se define ANTES de ejecutar (plan congelado): nada se elige viendo marcadores. Semilla maestra 20261023 con espacios de nombres NUEVOS `SIM04B|CAL|VAL|STRESS|CONTRAST|OPT|TECH|BENCH`;
// la semilla de cada caso es el SHA-256 de su clave canónica (primeros 32 bits, sin signo). La clave incluye los equipos tal como entran, la réplica y la etiqueta del bloque; excluye identidad (R04/R04B-N/vector),
// variante, resolutor, intento, worker, lote, nivel de registro y ruta, de modo que todas las identidades de un caso comparten entrada fuente, semilla, plan, jugadores y contexto. No reutiliza ninguna semilla de 04.
import { createHash } from 'node:crypto';
import { loadEnv as loadEnv03, entryIdOf, inputHashOf, diffInputs, compactDiff, validateBoth, scenariosB } from '../sim03/lib.js';
import { buildPairInput } from '../../src/sim/teams.js';
import { canonical } from '../../src/sim/fp.js';
import { coverageApplies, screenRoleOf } from '../../src/sim/model.js';
import * as K from '../../src/knowledge/model.js';

export { entryIdOf, inputHashOf, diffInputs, compactDiff, validateBoth };
export const MASTER = 20261023;
export const CAMPAIGN_ID = 'SIM04B-CAMPANA-20261023';
export const NAMESPACES = ['SIM04B|CAL', 'SIM04B|VAL', 'SIM04B|STRESS', 'SIM04B|CONTRAST', 'SIM04B|OPT', 'SIM04B|TECH', 'SIM04B|BENCH'];
export const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : canonical(x)).digest('hex');
export const loadEnv = loadEnv03;
const deep = (x) => JSON.parse(JSON.stringify(x));

// Poblaciones (§10.2): principal de selección (laboratorio, no certificación de la ACB) y estrés. El orden de la lista principal es el del anillo de equipos: índices 0…7.
export const MAIN_TEAMS = ['EQ01', 'EQ02', 'EQ03', 'EQ04', 'EQ05', 'EQ08', 'EQ09', 'EQ12'];
export const STRESS_TEAMS = ['EQ06', 'EQ07', 'EQ10', 'EQ11'];

// ---------------------------------------------------------------------------------------------------------------------------------- semillas (SHA-256, colisiones resueltas con sufijo ordinal)
// `registry` guarda semilla → clave para detectar colisiones entre TODOS los casos de la campaña. La resolución es determinista: se prueba `clave#2`, `clave#3`… hasta una semilla libre.
export function makeSeeder() {
  const used = new Map(); const collisions = [];
  const u32 = (key) => { const h = createHash('sha256').update(key).digest(); const v = h.readUInt32BE(0); return v === 0 ? 1 : v; };
  return {
    seed(ns, label, key) {
      const base = `${MASTER}|${ns}|${key}|${label}`; let ord = 1; let k = base; let s = u32(k);
      while (used.has(s) && used.get(s) !== k) { collisions.push({ key: k, seed: s, with: used.get(s) }); ord += 1; k = `${base}#${ord}`; s = u32(k); }
      used.set(s, k); return { seed: s, seed_key: k, ordinal: ord };
    },
    collisions, used,
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------- CAL / VAL
// §10.2. Con los ocho equipos principales indexados 0…7 (orden de MAIN_TEAMS):
//  · CAL: las ocho aristas del anillo (distancia 1) y las cuatro parejas opuestas (distancia 4) × dos orientaciones = 24 casos. Cada equipo aparece seis veces, tres en cada lado.
//  · VAL: las ocho parejas únicas de distancia 2 y las cuatro parejas (0,3), (2,5), (4,7), (6,1) × dos orientaciones = 24 casos, otro conjunto de rivales (disjunto de CAL), también equilibrado.
// Una réplica por caso; planes naturales y fichas intactas. TODOS los casos de CAL y de VAL tienen su ancla detallada.
export const CAL_PAIRS = [...MAIN_TEAMS.map((_, i) => [i, (i + 1) % 8]), ...[0, 1, 2, 3].map((i) => [i, i + 4])];
export const VAL_PAIRS = [...MAIN_TEAMS.map((_, i) => [i, (i + 2) % 8]), [0, 3], [2, 5], [4, 7], [6, 1]];
export function mainCases(env, seeder, block) {
  const out = []; const ns = `SIM04B|${block}`; const pairs = block === 'CAL' ? CAL_PAIRS : VAL_PAIRS;
  for (const [i, j] of pairs) for (const [a, b] of [[MAIN_TEAMS[i], MAIN_TEAMS[j]], [MAIN_TEAMS[j], MAIN_TEAMS[i]]]) {
    const sd = seeder.seed(ns, block, `${a}>${b}|R1`);
    out.push({ case_id: `${block}-${a}-${b}`, block, scenario: `${a}>${b}`, variant: 'natural', orientation: `${a}>${b}`, replicate: 1, ...sd, teams: [a, b], anchor: true, make: () => buildPairInput(env.teamMap, a, b, { seed: sd.seed, importance: 'ordinary' }) });
  }
  return out;
}
export const anchorsOf = (cases) => cases.filter((c) => c.anchor);

// ---------------------------------------------------------------------------------------------------------------------------------- STRESS
// §10.4: EQ06–EQ02, EQ11–EQ09, EQ07–EQ10 y EQ06–EQ11; dos orientaciones × dos semillas = 16 casos. La primera réplica tiene ancla detallada (ocho orientaciones).
export const STRESS_PAIRS = [['EQ06', 'EQ02'], ['EQ11', 'EQ09'], ['EQ07', 'EQ10'], ['EQ06', 'EQ11']];
export function stressCases(env, seeder) {
  const out = [];
  for (const [x, y] of STRESS_PAIRS) for (const [a, b] of [[x, y], [y, x]]) for (let r = 1; r <= 2; r++) {
    const sd = seeder.seed('SIM04B|STRESS', 'STRESS', `${a}>${b}|R${r}`);
    out.push({ case_id: `STRESS-${a}-${b}-R${r}`, block: 'STRESS', scenario: `${a}>${b}`, variant: 'natural', orientation: `${a}>${b}`, replicate: r, ...sd, teams: [a, b], anchor: r === 1, make: () => buildPairInput(env.teamMap, a, b, { seed: sd.seed, importance: 'ordinary' }) });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------- CONTRAST (definiciones T01–T11; 04B usa ocho factores)
const starterIds = (t) => Object.values(t.plan.starters);
const readingOf = (p) => p.abilities.MEN02 + p.abilities.MEN03;
const setAll = (team, fn) => { for (const p of team.players) fn(p); };
const mastered = (P8, level, overrides = {}) => { const b = K.allMastered(P8, 0); for (const d of K.DOMAINS) for (const id of K.idsOf(d, P8)) b[K.BLOCK_FIELD[d]][id] = K.makeEntry(overrides[id] ?? level, 0); return { mode: 'explicit', ...b }; };
// Conocimiento explícito con TODO al valor dominado (30) salvo los módulos tácticos indicados (`ids`) al nivel `level`. Polivalencia no se toca y no se aprende dentro del partido.
const knowledgeWith = (P8, ids, level) => mastered(P8, 30, Object.fromEntries([...ids].map((id) => [id, level])));
// Fichas con bloqueo compatibles con AMBAS coberturas del contraste (C04-05): una cobertura incompatible no se aplica y no recibe exposición.
export const coverageCompatiblePlays = (T, covs) => Object.values(T.plays).filter((p) => p.coverage != null && covs.every((c) => coverageApplies(p, c))).map((p) => p.id);

export function contrastDefs(env) {
  const S = env.S; const T = env.T; const P8 = env.profile.familiarity; const plays = T.plays;
  const used = (t) => new Set([t.plan.disposition, t.plan.defense, t.plan.coverage, ...t.plan.playbook.map((e) => `FAM:${plays[e.playId]?.family}`)]);
  const compat = coverageCompatiblePlays(T, ['COB01', 'COB03']); const screenPlays = Object.values(plays).filter((p) => screenRoleOf(p)).map((p) => p.id);
  const style = (key, lo, hi) => [{ id: 'V0', label: `${key} = ${lo}`, apply: (i, t1) => { t1.plan.styles[key] = lo; } }, { id: 'V1', label: `${key} = ${hi}`, apply: (i, t1) => { t1.plan.styles[key] = hi; } }];
  const best = (t1) => t1.players.filter((p) => starterIds(t1).includes(p.id)).sort((a, b) => readingOf(b) - readingOf(a) || (a.id < b.id ? -1 : 1))[0];
  const directorFirst = (t1, id) => { t1.plan.directorPriority = [id, ...t1.plan.directorPriority.filter((x) => x !== id)]; };
  const B = Object.fromEntries(scenariosB(env).map((s) => [s.id, s]));
  return [
    { id: 'T01', factor: 'Rebote/balance (después del tiro 1/5)', pair: ['EQ05', 'EQ06'], variants: [{ id: 'V0', label: 'afterShot = 1', apply: (i, t1) => { t1.plan.styles.afterShot = 1; } }, { id: 'V1', label: 'afterShot = 5', apply: (i, t1) => { t1.plan.styles.afterShot = 5; } }], note: 'niveles 1 y 2 envían el mismo número de participantes según offensiveReboundAssignmentTarget [1,1,2,3,4]' },
    { id: 'T02', factor: 'Finalización (interior/exterior, niveles 1/5)', pair: ['EQ03', 'EQ04'], variants: [{ id: 'V0', label: 'finishPreference = 1 (interior)', apply: (i, t1) => { t1.plan.styles.finishPreference = 1; } }, { id: 'V1', label: 'finishPreference = 5 (exterior)', apply: (i, t1) => { t1.plan.styles.finishPreference = 5; } }] },
    { id: 'T03', factor: 'Altura de presión (normal/total)', pair: ['EQ06', 'EQ07'], variants: [{ id: 'V0', label: 'pressureHeight = normal', apply: (i, t1) => { t1.plan.pressureHeight = 'normal'; } }, { id: 'V1', label: 'pressureHeight = full', apply: (i, t1) => { t1.plan.pressureHeight = 'full'; } }] },
    { id: 'T04', factor: 'Cobertura (COB01/COB03)', pair: ['EQ12', 'EQ01'], prepare: (i, e2, t1, t2) => { t2.plan.playbook = t2.plan.playbook.map((e) => ({ ...e, priority: compat.includes(e.playId) ? 1 : 5 })); },
      variants: [{ id: 'V0', label: 'coverage = COB01', apply: (i, t1) => { t1.plan.coverage = 'COB01'; } }, { id: 'V1', label: 'coverage = COB03', apply: (i, t1) => { t1.plan.coverage = 'COB03'; } }], note: `el rival ataca con prioridad 1 (máxima) en las fichas compatibles con COB01 y COB03 (${compat.join(',')}) y 5 (mínima) en el resto, igual en ambas variantes` },
    { id: 'T05', factor: 'Director (MEN02 y MEN03 del director 8/24)', pair: ['EQ09', 'EQ10'], prepare: (i, e2, t1) => { directorFirst(t1, best(t1).id); },
      variants: [{ id: 'V0', label: 'director efectivo con MEN02 = MEN03 = 8', apply: (i, t1) => { const p = t1.players.find((x) => x.id === t1.plan.directorPriority[0]); p.abilities.MEN02 = 8; p.abilities.MEN03 = 8; } }, { id: 'V1', label: 'director efectivo con MEN02 = MEN03 = 24', apply: (i, t1) => { const p = t1.players.find((x) => x.id === t1.plan.directorPriority[0]); p.abilities.MEN02 = 24; p.abilities.MEN03 = 24; } }], note: 'el director es el titular de mayor lectura, primero en la prioridad de director; el resto de la ficha no cambia' },
    { id: 'T06', factor: 'Libertad (1/5)', pair: ['EQ09', 'EQ10'], prepare: (i, e2, t1) => { directorFirst(t1, best(t1).id); }, variants: style('freedom', 1, 5), note: 'mismo director de lectura alta en ambas variantes' },
    { id: 'T07', factor: 'Familiaridad organizada (K8/K28 de módulos pertinentes)', pair: ['EQ01', 'EQ07'], prepare: (i, e2, t1, t2) => { setAll(t2, (p) => { p.knowledge = mastered(P8, 30); }); },
      variants: [{ id: 'V0', label: 'módulos pertinentes del equipo sometido K8 (resto de componentes 30)', apply: (i, t1) => { const u = used(t1); setAll(t1, (p) => { p.knowledge = knowledgeWith(P8, u, 8); }); } }, { id: 'V1', label: 'módulos pertinentes del equipo sometido K28 (resto de componentes 30)', apply: (i, t1) => { const u = used(t1); setAll(t1, (p) => { p.knowledge = knowledgeWith(P8, u, 28); }); } }] },
    { id: 'T08', factor: 'Familiaridad de presión (K8/K28 de PRESS en defensa)', pair: ['EQ10', 'EQ08'], prepare: (i, e2, t1, t2) => { t1.plan.pressureHeight = 'full'; setAll(t2, (p) => { p.knowledge = mastered(P8, 30); }); },
      variants: [{ id: 'V0', label: 'PRESS K8 en el equipo que presiona a pista completa (resto 30; ataque rival constante)', apply: (i, t1) => { setAll(t1, (p) => { p.knowledge = knowledgeWith(P8, ['PRESS'], 8); }); } }, { id: 'V1', label: 'PRESS K28 en el equipo que presiona a pista completa (resto 30; ataque rival constante)', apply: (i, t1) => { setAll(t1, (p) => { p.knowledge = knowledgeWith(P8, ['PRESS'], 28); }); } }] },
    { id: 'T09', factor: 'Energía inicial (100/30)', pair: ['EQ03', 'EQ09'], variants: B.B14.variants },
    { id: 'T10', factor: 'Forma (−0,5/+0,5)', pair: ['EQ05', 'EQ11'], variants: B.B15.variants },
    { id: 'T11', factor: 'Consistencia (MEN06 8/24)', pair: ['EQ02', 'EQ08'], variants: B.B16.variants },
  ].map((d) => ({ ...d, screenPlays }));
}
// Cuatro pares por factor: dos orientaciones × dos semillas; ambas variantes comparten semilla. Solo se ejecutan con la candidata final.
// Ocho factores (§10.4), con el mapeo a las definiciones de 03/04 y sus pares de equipos EXISTENTES (no elegidos después de ver marcadores): 1 preferencia interior/exterior = T02 · 2 rebote/balance tras el tiro = T01 · 3 altura de presión
// = T03 · 4 cobertura COB01/COB03 = T04 · 5 director MEN02/MEN03 8/24 = T05 · 6 familiaridad pertinente K8/K28 = T07 · 7 energía inicial 100/30 = T09 · 8 libertad = T06. T08 (K de PRESS) y T10/T11 no entran en partidos: se evalúan como
// cálculo puro (matriz de capacidades y sondas). Dos orientaciones por variante, UNA réplica; cuatro SIM por factor. Las cuatro anclas detalladas: ambas variantes de T02 y de T05 en la orientación O1.
export const CONTRAST_FACTORS = ['T02', 'T01', 'T03', 'T04', 'T05', 'T07', 'T09', 'T06'];
export const CONTRAST_ANCHORS = ['CONTRAST-T02-V0-O1-R1', 'CONTRAST-T02-V1-O1-R1', 'CONTRAST-T05-V0-O1-R1', 'CONTRAST-T05-V1-O1-R1'];
export function contrastCases(env, seeder) {
  const cases = []; const defs = contrastDefs(env); for (const id of CONTRAST_FACTORS) { const sc = defs.find((d) => d.id === id); for (const v of sc.variants) for (const o of [1, 2]) {
    const [t1id, t2id] = sc.pair; const teams = o === 1 ? [t1id, t2id] : [t2id, t1id]; const sd = seeder.seed('SIM04B|CONTRAST', 'CONTRAST', `${sc.id}|O${o}|R1`); const case_id = `CONTRAST-${sc.id}-${v.id}-O${o}-R1`;
    cases.push({ case_id, block: 'CONTRAST', scenario: sc.id, variant: v.id, orientation: `O${o}`, replicate: 1, ...sd, teams, testTeam: t1id, factor: sc.factor, variantLabel: v.label, anchor: CONTRAST_ANCHORS.includes(case_id),
      make: () => { const inp = buildPairInput(env.teamMap, teams[0], teams[1], { seed: sd.seed, importance: 'ordinary' }); const ti = o === 1 ? 0 : 1; const t1 = inp.teams[ti]; const t2 = inp.teams[1 - ti]; sc.prepare?.(inp, env, t1, t2); v.apply(inp, t1, t2, env); return inp; } });
  } }
  return cases;
}

// ---------------------------------------------------------------------------------------------------------------------------------- catálogo completo
export function allCases(env) {
  const seeder = makeSeeder(); const cal = mainCases(env, seeder, 'CAL'); const val = mainCases(env, seeder, 'VAL'); const stress = stressCases(env, seeder); const contrast = contrastCases(env, seeder);
  return { cal, val, stress, contrast, seeder, byId: new Map([...cal, ...val, ...stress, ...contrast].map((c) => [c.case_id, c])) };
}
// DIAG (§10.4): los cuatro casos VAL EQ01→EQ04, EQ02→EQ09, EQ05→EQ12 y EQ09→EQ01 (DET y SIM final) y cuatro SIM de CONTRAST en orientación 1 (presión total, familiaridad K28, director 24, energía inicial 30). La flecha indica el orden
// de equipos, no un ganador. Son repeticiones seleccionadas, NO observaciones independientes.
export const DIAG_VAL = ['VAL-EQ01-EQ04', 'VAL-EQ02-EQ09', 'VAL-EQ05-EQ12', 'VAL-EQ09-EQ01'];
export const DIAG_CONTRAST = ['CONTRAST-T03-V1-O1-R1', 'CONTRAST-T07-V1-O1-R1', 'CONTRAST-T05-V1-O1-R1', 'CONTRAST-T09-V1-O1-R1'];
export const DIAG_SIM = [...DIAG_VAL, ...DIAG_CONTRAST];
export const DIAG_DET = DIAG_VAL;
// OPT (§10.3, §9): doce entradas CAL, seis con perfil neutral (R04B-N) y seis con la candidata final; control frente a final. Una por pareja de equipos, repartidas en el anillo y los opuestos.
export const OPT_CASES = ['CAL-EQ01-EQ02', 'CAL-EQ03-EQ02', 'CAL-EQ03-EQ04', 'CAL-EQ05-EQ04', 'CAL-EQ05-EQ08', 'CAL-EQ09-EQ08', 'CAL-EQ09-EQ12', 'CAL-EQ01-EQ12', 'CAL-EQ01-EQ05', 'CAL-EQ08-EQ02', 'CAL-EQ03-EQ09', 'CAL-EQ12-EQ04'];
export const OPT_NEUTRAL = OPT_CASES.slice(0, 6); export const OPT_CANDIDATE = OPT_CASES.slice(6);
// TECH (§11.1): cuatro entradas VAL, cuatro rutas equivalentes con la candidata final: auto (de una vez, registro normal), steps (avance por fronteras con consultas), recover (guardado y restauración en una frontera común) y
// reference (mundo: barreras con cierre diferido, consulta antes de sellar y esencial de Referencia).
export const TECH_CASES = ['VAL-EQ01-EQ03', 'VAL-EQ04-EQ08', 'VAL-EQ05-EQ12', 'VAL-EQ09-EQ02'];
export const TECH_ROUTE_NAMES = ['auto', 'steps', 'recover', 'reference'];
export const TECH_ROUTES = {
  'VAL-EQ01-EQ03': { steps: [600, 1200, 1800, 2400], cuts: [1200], barriers: [120] }, 'VAL-EQ04-EQ08': { steps: [120, 240, 480, 1200, 2400], cuts: [125, 2000], barriers: [90] },
  'VAL-EQ05-EQ12': { steps: [37, 500, 501, 1999], cuts: [600], barriers: [120] }, 'VAL-EQ09-EQ02': { steps: [1, 2, 3, 119, 121, 1700], cuts: [2399], barriers: [60] },
};
// Historia desde la reserva (§11.3): los 24 encuentros de VAL en un calendario estadístico ARTIFICIAL (no una temporada ACB). No se simula otra temporada completa.
export function historyVal() { const out = []; let round = 0; const used = new Set(); const val = VAL_PAIRS.flatMap(([i, j]) => [[MAIN_TEAMS[i], MAIN_TEAMS[j]], [MAIN_TEAMS[j], MAIN_TEAMS[i]]]);
  for (const [a, b] of val) { void used; round += 1; out.push({ round: Math.ceil(round / 4), case_id: `VAL-${a}-${b}`, home: a, away: b, artificialCalendar: true }); } return out; }
// Casos de VAL sustituidos por su ancla detallada en el histórico mixto: las cuatro orientaciones de los DIAG.
export const MIXED_HISTORY_ANCHORS = DIAG_VAL;
// Seis pares de aprendizaje: anclas VAL con su gemelo SIM, elegidas de antemano.
export const LEARNING_PAIRS = ['VAL-EQ01-EQ04', 'VAL-EQ02-EQ09', 'VAL-EQ05-EQ12', 'VAL-EQ09-EQ01', 'VAL-EQ03-EQ08', 'VAL-EQ12-EQ02'].map((id, i) => ({ pair: `L${i + 1}`, sim: id, detailed: id }));
export function materialize(env, c) { const input = c.make(); return { input, entry_id: entryIdOf(input), input_hash: inputHashOf(input) }; }
export { deep };
