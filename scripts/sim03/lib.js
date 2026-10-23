// SIM-MOTOR-03 · biblioteca de la campaña comparativa congelada (§7): casos de los bloques A (cruces naturales), B (contrastes controlados) y C (estados y cantera), subconjuntos detallados, muestra diagnóstica,
// historia de prueba y pares de aprendizaje. TODO es determinista y se define ANTES de ejecutar: nada se elige viendo marcadores. Las identidades operativas (caso, intento, worker, lote, ruta) no modifican el azar:
// la semilla sale de una clave estable que identifica bloque, enfrentamiento/escenario, orientación y réplica (excluye variante, resolutor, intento, worker, lote y ruta).
import { createHash } from 'node:crypto';
import { loadData } from '../node-data.js';
import { makeContext } from '../../src/sim/context.js';
import { referenceTeamMap, buildPairInput, REFERENCE_IDS as REF_IDS } from '../../src/sim/teams.js';
import { deriveSeed } from '../../src/sim/rng.js';
import { canonical } from '../../src/sim/fp.js';
import { validateSimInput } from '../../src/sim/adapt.js';
import { validateInput } from '../../src/match/index.js';
import { youthTeam, buildTeamsInput } from '../../src/matchday/scenario.js';
import * as K from '../../src/knowledge/model.js';

export const MASTER = 20261023;
export const CAMPAIGN_ID = 'SIM03-CAMPANA-20261023';
export const TEAM_IDS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`);
export const seedFor = (key) => deriveSeed(MASTER, key);
export const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : canonical(x)).digest('hex');
const deep = (x) => JSON.parse(JSON.stringify(x));

export function loadEnv() {
  const { profile, players } = loadData(); const ctx = makeContext(profile); const teamMap = referenceTeamMap(profile, players);
  return { profile, players, ctx, teamMap, T: ctx.T, S: ctx.sp.v };
}

// ---------------------------------------------------------------------------------------------------------------------------------- identidad de entrada
// entry_id: entrada CANÓNICA sin semilla (réplicas del mismo enfrentamiento comparten materialización); input_hash: entrada completa con semilla.
export function entryIdOf(input) { const { seed, ...rest } = input; return sha(rest).slice(0, 32); }
export const inputHashOf = (input) => sha(input);
// Diferencias exactas entre dos entradas (rutas JSON con valores); sirve para declarar qué cambia una variante.
export function diffInputs(a, b, path = '', out = []) {
  if (a === b) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) { const keys = new Set([...Object.keys(a), ...Object.keys(b)]); for (const k of keys) diffInputs(a[k], b[k], path ? `${path}.${k}` : k, out); return out; }
  if (canonical(a) !== canonical(b)) out.push({ path, from: a ?? null, to: b ?? null });
  return out;
}
const compactDiff = (d) => { const by = {}; for (const x of d) { const key = x.path.replace(/^teams\.(\d+)\.players\.(\d+)\./, 'teams.$1.players[*].').replace(/\.\d+(?=\.|$)/g, '[*]'); (by[key] ??= []).push(x); } return Object.entries(by).map(([k, v]) => ({ path: k, count: v.length, example: v[0] })); };
export { compactDiff };

// ---------------------------------------------------------------------------------------------------------------------------------- bloque A
export function blockA(env) {
  const cases = [];
  for (const a of TEAM_IDS) for (const b of TEAM_IDS) if (a !== b) for (let r = 1; r <= 8; r++) {
    const seedKey = `A|${a}>${b}|R${r}`; cases.push({ case_id: `A-${a}-${b}-R${r}`, block: 'A', scenario: `${a}>${b}`, variant: 'natural', orientation: `${a}>${b}`, replicate: r, seed_key: seedKey, seed: seedFor(seedKey), teams: [a, b], make: () => buildPairInput(env.teamMap, a, b, { seed: seedFor(seedKey), importance: 'ordinary' }) });
  }
  return cases;
}
// Doce parejas del subconjunto detallado (§7.3): ambas orientaciones y las dos primeras réplicas de cada enfrentamiento.
export const A_DETAILED_PAIRS = [['A-D01', 'EQ01', 'EQ02'], ['A-D02', 'EQ03', 'EQ09'], ['A-D03', 'EQ07', 'EQ08'], ['A-D04', 'EQ11', 'EQ12'], ['A-D05', 'EQ04', 'EQ10'], ['A-D06', 'EQ05', 'EQ06'], ['A-D07', 'EQ01', 'EQ06'], ['A-D08', 'EQ02', 'EQ07'], ['A-D09', 'EQ03', 'EQ08'], ['A-D10', 'EQ04', 'EQ09'], ['A-D11', 'EQ05', 'EQ12'], ['A-D12', 'EQ10', 'EQ11']];
export const isADetailed = (c) => A_DETAILED_PAIRS.some(([, x, y]) => (c.teams[0] === x && c.teams[1] === y) || (c.teams[0] === y && c.teams[1] === x)) && c.replicate <= 2;
export const aPairId = (c) => A_DETAILED_PAIRS.find(([, x, y]) => (c.teams[0] === x && c.teams[1] === y) || (c.teams[0] === y && c.teams[1] === x))?.[0] ?? null;

// ---------------------------------------------------------------------------------------------------------------------------------- bloque B
const starterIds = (t) => Object.values(t.plan.starters);
const readingOf = (p) => p.abilities.MEN02 + p.abilities.MEN03;
const setAll = (team, fn) => { for (const p of team.players) fn(p); };
// Cada escenario: { id, factor, pair:[T1,T2] (T1 = equipo sometido al factor), prepare(inp, env, t1, t2) (condición común a ambas variantes), variants:[{id,label,apply(inp,t1,t2,env)}], detailed, note }
export function scenariosB(env) {
  const S = env.S; const T = env.T; const plays = T.plays;
  const interiorExtreme = S.selection.orientationInside.indexOf(Math.max(...S.selection.orientationInside)) + 1; const exteriorExtreme = S.selection.orientationThree.indexOf(Math.max(...S.selection.orientationThree)) + 1;
  const crash = S.rebound.offensiveReboundAssignmentTarget; const lowCrash = crash.indexOf(Math.min(...crash)) + 1; const highCrash = crash.length - [...crash].reverse().indexOf(Math.max(...crash));
  const covPlays = Object.values(plays).filter((p) => p.coverage != null).map((p) => p.id);
  const P8 = env.profile.familiarity;
  const style = (key, lo, hi) => [{ id: 'V0', label: `${key} = ${lo}`, apply: (i, t1) => { t1.plan.styles[key] = lo; } }, { id: 'V1', label: `${key} = ${hi}`, apply: (i, t1) => { t1.plan.styles[key] = hi; } }];
  // Conocimiento explícito: todo al nivel `level` salvo los módulos tácticos PERTINENTES (`used`: disposición, organización defensiva, cobertura y familias del libro del equipo), que van a `tacticLevel`.
  const usedTactics = (t) => new Set([t.plan.disposition, t.plan.defense, t.plan.coverage, ...t.plan.playbook.map((e) => `FAM:${plays[e.playId]?.family}`)]);
  const explicitK = (level, tacticLevel, used = null) => { const b = K.allMastered(P8, 0); for (const d of K.DOMAINS) for (const id of K.idsOf(d, P8)) b[K.BLOCK_FIELD[d]][id] = K.makeEntry(d === 'tactic' && used && used.has(id) ? tacticLevel : level, 0); return { mode: 'explicit', ...b }; };
  return [
    { id: 'B01', factor: 'Ritmo organizado', pair: ['EQ01', 'EQ02'], variants: style('organizedPace', 1, 5), detailed: true },
    { id: 'B02', factor: 'Preferencia de finalización', pair: ['EQ03', 'EQ04'], variants: [{ id: 'V0', label: `finishPreference = ${interiorExtreme} (extremo interior del catálogo)`, apply: (i, t1) => { t1.plan.styles.finishPreference = interiorExtreme; } }, { id: 'V1', label: `finishPreference = ${exteriorExtreme} (extremo exterior del catálogo)`, apply: (i, t1) => { t1.plan.styles.finishPreference = exteriorExtreme; } }], detailed: true },
    { id: 'B03', factor: 'Después del tiro', pair: ['EQ05', 'EQ06'], variants: [{ id: 'V0', label: `afterShot = ${lowCrash} (menor carga al rebote ofensivo)`, apply: (i, t1) => { t1.plan.styles.afterShot = lowCrash; } }, { id: 'V1', label: `afterShot = ${highCrash} (mayor carga al rebote ofensivo)`, apply: (i, t1) => { t1.plan.styles.afterShot = highCrash; } }] },
    { id: 'B04', factor: 'Riesgo ofensivo', pair: ['EQ07', 'EQ08'], variants: style('offensiveRisk', 1, 5) },
    { id: 'B05', factor: 'Libertad', pair: ['EQ09', 'EQ10'], prepare: (i, env2, t1) => { const best = t1.players.filter((p) => starterIds(t1).includes(p.id)).sort((a, b) => readingOf(b) - readingOf(a) || (a.id < b.id ? -1 : 1))[0]; t1.plan.directorPriority = [best.id, ...t1.plan.directorPriority.filter((x) => x !== best.id)]; }, variants: style('freedom', 1, 5), note: 'mismo director de lectura alta (el titular de mayor MEN02+MEN03) y libro común en ambas variantes' },
    { id: 'B06', factor: 'Director (prioridad)', pair: ['EQ11', 'EQ12'], detailed: true,
      prepare: (i, env2, t1) => { const [pg, sg] = [t1.plan.starters.PG, t1.plan.starters.SG]; const set = (id, v) => { const p = t1.players.find((x) => x.id === id); p.abilities.MEN02 = v; p.abilities.MEN03 = v; }; set(pg, 6); set(sg, 26); },
      variants: [{ id: 'V0', label: 'director = candidato de lectura baja (PG, MEN02=MEN03=6) con prioridad', apply: (i, t1) => { const [pg, sg] = [t1.plan.starters.PG, t1.plan.starters.SG]; t1.plan.directorPriority = [pg, sg, ...t1.plan.directorPriority.filter((x) => x !== pg && x !== sg)]; } }, { id: 'V1', label: 'director = candidato de lectura alta (SG, MEN02=MEN03=26) con prioridad', apply: (i, t1) => { const [pg, sg] = [t1.plan.starters.PG, t1.plan.starters.SG]; t1.plan.directorPriority = [sg, pg, ...t1.plan.directorPriority.filter((x) => x !== pg && x !== sg)]; } }], note: 'fichas idénticas entre variantes; solo cambia quién tiene la prioridad de director' },
    { id: 'B07', factor: 'Rol ofensivo (anotación frente a creación)', pair: ['EQ02', 'EQ03'], variants: [{ id: 'V0', label: 'jugador SG titular con O02 (manejador/finalizador: anotación)', apply: (i, t1) => { t1.players.find((p) => p.id === t1.plan.starters.SG).offensiveRole = { code: 'O02', name: 'rol de anotación' }; } }, { id: 'V1', label: 'jugador SG titular con O12 (director/pasador: creación)', apply: (i, t1) => { t1.players.find((p) => p.id === t1.plan.starters.SG).offensiveRole = { code: 'O12', name: 'rol de creación' }; } }] },
    { id: 'B08', factor: 'Rol defensivo (protección interior frente a función perimetral)', pair: ['EQ04', 'EQ05'], variants: [{ id: 'V0', label: 'jugador C titular con D12 (rimProtect: protección interior)', apply: (i, t1) => { t1.players.find((p) => p.id === t1.plan.starters.C).defensiveRole = { code: 'D12', name: 'protección interior' }; } }, { id: 'V1', label: 'jugador C titular con D11 (ballPressure: función perimetral)', apply: (i, t1) => { t1.players.find((p) => p.id === t1.plan.starters.C).defensiveRole = { code: 'D11', name: 'presión al balón (perimetral)' }; } }] },
    { id: 'B09', factor: 'Altura de presión', pair: ['EQ06', 'EQ07'], detailed: true, variants: [{ id: 'V0', label: 'pressureHeight = normal', apply: (i, t1) => { t1.plan.pressureHeight = 'normal'; } }, { id: 'V1', label: 'pressureHeight = full (total)', apply: (i, t1) => { t1.plan.pressureHeight = 'full'; } }] },
    { id: 'B10', factor: 'Tendencia al robo', pair: ['EQ08', 'EQ09'], variants: [{ id: 'V0', label: 'defStyles.steal = 1', apply: (i, t1) => { t1.plan.defStyles.steal = 1; } }, { id: 'V1', label: 'defStyles.steal = 5', apply: (i, t1) => { t1.plan.defStyles.steal = 5; } }] },
    { id: 'B11', factor: 'Organización defensiva', pair: ['EQ10', 'EQ11'], variants: [{ id: 'V0', label: 'defense = ORG01 (individual)', apply: (i, t1) => { t1.plan.defense = 'ORG01'; } }, { id: 'V1', label: 'defense = ORG02 (zona 2–3)', apply: (i, t1) => { t1.plan.defense = 'ORG02'; } }], note: 'conocimiento neutral (legacy-neutral) y plan rival natural en ambas variantes' },
    { id: 'B12', factor: 'Cobertura de bloqueos', pair: ['EQ12', 'EQ01'], prepare: (i, env2, t1, t2) => { t2.plan.playbook = t2.plan.playbook.map((e) => ({ ...e, priority: covPlays.includes(e.playId) ? 5 : 2 })); }, variants: [{ id: 'V0', label: 'coverage = COB01', apply: (i, t1) => { t1.plan.coverage = 'COB01'; } }, { id: 'V1', label: 'coverage = COB03', apply: (i, t1) => { t1.plan.coverage = 'COB03'; } }], note: `el rival ataca con prioridad 5 en las ${covPlays.length} fichas con bloqueo/cobertura (${covPlays.join(',')}) y 2 en el resto, igual en ambas variantes` },
    { id: 'B13', factor: 'Familiaridad (módulos tácticos)', pair: ['EQ01', 'EQ07'], detailed: true, prepare: (i, env2, t1, t2) => { setAll(t2, (p) => { p.knowledge = explicitK(16, 16); p.development = { tacticalLearning: 16 }; }); }, variants: [{ id: 'V0', label: 'módulos tácticos del equipo sometido al nivel 8 (resto 16, Polivalencia 16)', apply: (i, t1) => { const used = usedTactics(t1); setAll(t1, (p) => { p.knowledge = explicitK(16, 8, used); p.development = { tacticalLearning: 16 }; }); } }, { id: 'V1', label: 'módulos tácticos del equipo sometido al nivel 28 (resto 16, Polivalencia 16)', apply: (i, t1) => { const used = usedTactics(t1); setAll(t1, (p) => { p.knowledge = explicitK(16, 28, used); p.development = { tacticalLearning: 16 }; }); } }] },
    { id: 'B14', factor: 'Energía inicial', pair: ['EQ03', 'EQ09'], detailed: true, variants: [{ id: 'V0', label: 'energía inicial 100 (todo el equipo)', apply: (i, t1) => setAll(t1, (p) => { p.state.energy = 100; }) }, { id: 'V1', label: 'energía inicial 30 (todo el equipo)', apply: (i, t1) => setAll(t1, (p) => { p.state.energy = 30; }) }] },
    { id: 'B15', factor: 'Forma', pair: ['EQ05', 'EQ11'], variants: [{ id: 'V0', label: 'forma −0,5 (todo el equipo)', apply: (i, t1) => setAll(t1, (p) => { p.state.form = -0.5; }) }, { id: 'V1', label: 'forma +0,5 (todo el equipo)', apply: (i, t1) => setAll(t1, (p) => { p.state.form = 0.5; }) }] },
    { id: 'B16', factor: 'Consistencia (MEN06)', pair: ['EQ02', 'EQ08'], variants: [{ id: 'V0', label: 'MEN06 = 8 (todo el equipo)', apply: (i, t1) => setAll(t1, (p) => { p.abilities.MEN06 = 8; }) }, { id: 'V1', label: 'MEN06 = 24 (todo el equipo)', apply: (i, t1) => setAll(t1, (p) => { p.abilities.MEN06 = 24; }) }] },
  ];
}
// Orientación O1: el equipo sometido al factor (T1) es el equipo 0 de la entrada; O2: es el equipo 1 (sin efecto de localía modelado: identifica el orden de la entrada).
export function blockB(env) {
  const cases = []; const scen = scenariosB(env);
  for (const sc of scen) for (const v of sc.variants) for (const o of [1, 2]) for (let r = 1; r <= 8; r++) {
    const [t1id, t2id] = sc.pair; const seedKey = `B|${sc.id}|O${o}|R${r}`; const teams = o === 1 ? [t1id, t2id] : [t2id, t1id];
    cases.push({ case_id: `B-${sc.id}-${v.id}-O${o}-R${r}`, block: 'B', scenario: sc.id, variant: v.id, orientation: `O${o}`, replicate: r, seed_key: seedKey, seed: seedFor(seedKey), teams, testTeam: t1id, factor: sc.factor, variantLabel: v.label, detailedScenario: !!sc.detailed,
      make: () => { const inp = buildPairInput(env.teamMap, teams[0], teams[1], { seed: seedFor(seedKey), importance: 'ordinary' }); const ti = o === 1 ? 0 : 1; const t1 = inp.teams[ti]; const t2 = inp.teams[1 - ti]; sc.prepare?.(inp, env, t1, t2); v.apply(inp, t1, t2, env); return inp; } });
  }
  return cases;
}
export const B_DETAILED_SCENARIOS = ['B01', 'B02', 'B06', 'B09', 'B13', 'B14'];
export const isBDetailed = (c) => B_DETAILED_SCENARIOS.includes(c.scenario) && c.orientation === 'O1' && c.replicate <= 2;

// ---------------------------------------------------------------------------------------------------------------------------------- bloque C
export function blockC(env) {
  const cases = []; const pair = ['EQ05', 'EQ06'];
  const mod = (fn) => (inp) => { fn(inp.teams[0], inp); return inp; };
  const defs = [
    ['C01', 'energía inicial 8 en el equipo sometido; resto neutral', mod((t) => setAll(t, (p) => { p.state.energy = 8; }))],
    ['C02', 'energía inicial 70 en el mismo equipo; resto neutral', mod((t) => setAll(t, (p) => { p.state.energy = 70; }))],
    ['C03', 'momentos individuales TIR/OFE/DEF iniciales −0,5; momento colectivo neutral', mod((t) => setAll(t, (p) => { p.state.M_TIR = -0.5; p.state.M_OFE = -0.5; p.state.M_DEF = -0.5; }))],
    ['C04', 'momentos individuales TIR/OFE/DEF iniciales +0,5; momento colectivo neutral', mod((t) => setAll(t, (p) => { p.state.M_TIR = 0.5; p.state.M_OFE = 0.5; p.state.M_DEF = 0.5; }))],
    ['C05', 'momento colectivo inicial −0,5; momentos individuales neutrales', mod((t) => { t.plan.initialTeamMoment = -0.5; })],
    ['C06', 'momento colectivo inicial +0,5; momentos individuales neutrales', mod((t) => { t.plan.initialTeamMoment = 0.5; })],
    ['C07', 'importancia decisiva con estados iniciales neutrales', (inp) => { inp.importance = 'decisive'; return inp; }],
  ];
  for (const [id, label, fn] of defs) for (let r = 1; r <= 8; r++) { const seedKey = `C|${id}|R${r}`; cases.push({ case_id: `C-${id}-R${r}`, block: 'C', scenario: id, variant: 'unica', orientation: 'O1', replicate: r, seed_key: seedKey, seed: seedFor(seedKey), teams: pair, testTeam: pair[0], factor: label, make: () => fn(buildPairInput(env.teamMap, pair[0], pair[1], { seed: seedFor(seedKey), importance: 'ordinary' })) }); }
  for (let r = 1; r <= 8; r++) { const seedKey = `C|C08|R${r}`; cases.push({ case_id: `C-C08-R${r}`, block: 'C', scenario: 'C08', variant: 'unica', orientation: 'O1', replicate: r, seed_key: seedKey, seed: seedFor(seedKey), teams: ['EQ01U', 'EQ02U'], factor: 'dos equipos Sub-20 identificados del escenario de jornada mixta (copias con edades 16–18)', make: () => buildTeamsInput(youthTeam(env.teamMap.EQ01), youthTeam(env.teamMap.EQ02), { seed: seedFor(seedKey), importance: 'important' }) }); }
  return cases;
}

// ---------------------------------------------------------------------------------------------------------------------------------- catálogo completo, resolutores y muestras preseleccionadas
export function allCases(env) {
  const A = blockA(env); const B = blockB(env); const C = blockC(env); const sim = [...A, ...B, ...C].map((c) => ({ ...c, resolver: 'sim' }));
  const det = [...A.filter(isADetailed), ...B.filter(isBDetailed)].map((c) => ({ ...c, resolver: 'detailed', case_id: `${c.case_id}@DET` }));
  return { sim, det };
}
// Muestra diagnóstica elegida ANTES de ejecutar (§10.6): ocho SIM (cuatro de A, cuatro de B/C) y cuatro detallados (dos de A, dos de B); son subconjuntos de lo previsto.
export const DIAG_SIM = ['A-EQ01-EQ02-R1', 'A-EQ03-EQ09-R1', 'A-EQ07-EQ08-R1', 'A-EQ11-EQ12-R1', 'B-B01-V0-O1-R1', 'B-B06-V1-O1-R1', 'B-B13-V1-O1-R1', 'C-C01-R1'];
export const DIAG_DET = ['A-EQ01-EQ02-R1@DET', 'A-EQ03-EQ09-R1@DET', 'B-B01-V0-O1-R1@DET', 'B-B13-V1-O1-R1@DET'];
// Historia de prueba (§8.3): 72 resultados de A (réplica 1) asignados a 12 rondas FICTICIAS del calendario de círculo (seis partidos por ronda, cada equipo una vez por ronda; primeras 12 rondas de la doble vuelta).
export function circleRounds(teams = TEAM_IDS) {
  const t = teams.slice(); const n = t.length; const rounds = [];
  for (let r = 0; r < n - 1; r++) { const pairs = []; for (let i = 0; i < n / 2; i++) { const a = t[i]; const b = t[n - 1 - i]; pairs.push(r % 2 ? [b, a] : [a, b]); } rounds.push(pairs); t.splice(1, 0, t.pop()); }
  return [...rounds, ...rounds.map((p) => p.map(([a, b]) => [b, a]))];
}
export function history72() { const rr = circleRounds().slice(0, 12); const out = []; rr.forEach((pairs, i) => pairs.forEach(([a, b]) => out.push({ round: i + 1, case_id: `A-${a}-${b}-R1`, home: a, away: b, artificialCalendar: true }))); return out; }
// Seis pares de aprendizaje (§8.4): las seis primeras parejas del subconjunto detallado, primera orientación declarada, réplica 1 (existe SIM y detallado de cada una).
export function learningPairs() { return A_DETAILED_PAIRS.slice(0, 6).map(([id, a, b]) => ({ pair: id, sim: `A-${a}-${b}-R1`, detailed: `A-${a}-${b}-R1@DET` })); }
// Ocho casos SIM de A/B para las repeticiones técnicas E (§9.1), con variedad de ritmo, estados y planes: ritmo extremo, energía baja, forma, momento, importancia, cantera y dos naturales.
export const E_CASES = ['A-EQ01-EQ02-R1', 'A-EQ07-EQ08-R1', 'B-B01-V0-O1-R1', 'B-B01-V1-O1-R1', 'B-B14-V1-O1-R1', 'B-B15-V0-O1-R1', 'B-B12-V1-O1-R1', 'C-C01-R1'];

// ---------------------------------------------------------------------------------------------------------------------------------- materialización y validación en ambos modelos
export function materialize(env, c) {
  const input = c.make(); const entry_id = entryIdOf(input); const input_hash = inputHashOf(input);
  return { input, entry_id, input_hash };
}
export function validateBoth(env, input) {
  const sim = validateSimInput(input, env.ctx.sp, env.ctx.T); const det = validateInput(input, env.profile);
  return { sim: sim.map((e) => `${e.path}: ${e.message}`), detailed: det.map((e) => `${e.path}: ${e.message}`) };
}
export { REF_IDS };

// Rutas de las repeticiones técnicas E (§9.1): E1 = un worker, avance por fronteras/cuarto/instantes con consultas intermedias; E2 = cuatro workers, guardado y recuperación con sufijo privado (nivel Análisis).
// Reparten velocidades de avance, consultas intermedias, pausas (cortes) y recuperaciones entre los ocho casos; la orden manual, su rechazo y las noticias externas se cubren con las regresiones C03-10/11.
export const E_ROUTES = {
  'A-EQ01-EQ02-R1': { steps: [600, 1200, 1800, 2400], cuts: [125] },
  'A-EQ07-EQ08-R1': { steps: [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 2400], cuts: [1190, 2000] },
  'B-B01-V0-O1-R1': { steps: [37, 500, 501, 1999], cuts: [600] },
  'B-B01-V1-O1-R1': { steps: [300, 900, 1500, 2100], cuts: [30, 1800] },
  'B-B14-V1-O1-R1': { steps: [1, 2, 3, 119, 121, 1700], cuts: [2399] },
  'B-B15-V0-O1-R1': { steps: [1200], cuts: [120, 121, 2380] },
  'B-B12-V1-O1-R1': { steps: [450, 1350, 2250], cuts: [1500] },
  'C-C01-R1': { steps: [60, 600, 1380, 2400], cuts: [1000, 1001] },
};
