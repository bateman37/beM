// MOTOR-18B: curva de Polivalencia, cierre de familiaridad (R01–R06) y unidades. Pocas pruebas agrupadas por propiedad (L18B-01…12). Los valores esperados salen de la fórmula y de la tabla del encargo
// (no de otra llamada idéntica al mismo consumidor); tolerancias numéricas, sin comparar cadenas redondeadas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, baseEx } from './helpers.js';
import { profile as profile18, profile18b as profile, P18B as P, uniformBlock, coachOf } from './m18-helpers.js';
import * as L from '../src/learning/index.js';
import * as K from '../src/knowledge/model.js';
import { familiarityIssues } from '../src/profiles/validate-motor18.js';
import { createMatch, deepCopy, ENGINE_VERSION, EXPORT_SCHEMA, runMatch, defaultParticipationPlan } from '../src/match/index.js';
import { sportsProjection } from '../src/match/replay.js';
import { APP_VERSION } from '../src/version.js';
import { ESSENTIAL_VERSION } from '../src/batch/essential.js';
import { FAMILIARITY_VERSION } from '../src/match/familiarity.js';
import { prepInputOf, matchSourceOf, isLearningScenarioOf } from '../src/lab/prep-source.js';
import * as M from '../src/lab/learning-model.js';
import { buildMatchInput } from '../src/match/index.js';

const near = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) <= t, `${a} ≠ ${b}`);
const P0 = profile18.familiarity; // perfil de MOTOR-18 (factor lineal) para los casos de compatibilidad
const teamOf = (blocks, params = P, coach = coachOf(), day = 0, tl = 16) => { const r = L.createTeamState({ instanceId: 'T', players: Object.fromEntries(Object.entries(blocks).map(([k, b]) => [k, { block: b, tacticalLearning: tl }])), coach, day }, params); assert.ok(r.ok, JSON.stringify(r.errors)); return r.state; };
const strip = (o) => JSON.parse(JSON.stringify(o));

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-01
test('L18B-01 curva: cinco anclajes exactos, P12=0,75 y P20=1,50, continuidad y monotonía; entradas inválidas son errores localizados; el modelo lineal anterior se conserva', () => {
  for (const [p, f] of [[1, 0.25], [8, 0.5], [16, 1], [24, 2], [30, 2.5]]) assert.equal(K.playerFactor(p, P).factor, f);
  near(K.playerFactor(12, P).factor, 0.75); near(K.playerFactor(20, P).factor, 1.5); assert.equal(K.playerFactor(12, P).model, 'piecewise-linear');
  let prev = 0; for (let x = 1; x <= 30; x += 0.125) { const f = K.playerFactor(x, P).factor; assert.ok(f >= prev - 1e-12, `monótona en ${x}`); if (prev) assert.ok(f - prev < 0.0625 + 1e-9, `continua en ${x}`); prev = f; }
  for (const bad of [NaN, Infinity, undefined, null, '16', 0, 31, -1]) assert.throws(() => K.playerFactor(bad, P), (e) => e instanceof RangeError && /Polivalencia/.test(e.message), String(bad));
  // modelo anterior: factor lineal 0,75 + 0,50·n(P); P=16 da 1,0086206897 y NO se convierte en silencio
  near(K.playerFactor(16, P0).factor, 0.75 + 0.5 * (15 / 29)); assert.equal(K.playerFactor(16, P0).model, 'linear');
  // validación de la curva: orden, extremos, anclajes previstos, factores finitos positivos y no decrecientes
  const ok = P.learning.factors.player; assert.deepEqual(K.validatePlayerCurve(ok, P.range), []);
  const mut = (f) => { const c = strip(ok); f(c); return K.validatePlayerCurve(c, P.range).map((e) => e.path); };
  assert.ok(mut((c) => { c.points[2].level = 7; }).some((p) => p.endsWith('points.2.level')));
  assert.ok(mut((c) => { c.points.splice(2, 1); }).includes('learning.factors.player.points'));
  assert.ok(mut((c) => { c.points[3].factor = 0.4; }).some((p) => p.endsWith('points.3.factor')));
  assert.ok(mut((c) => { c.points[0].factor = -1; }).some((p) => p.endsWith('points.0.factor')));
  assert.ok(mut((c) => { c.points[4].factor = NaN; }).some((p) => p.endsWith('points.4.factor')));
  assert.ok(mut((c) => { c.points[0].level = 2; }).length > 0); assert.ok(mut((c) => { c.points[4].level = 29; }).length > 0);
  // el perfil nuevo es válido; una candidata editada conserva el resto y pasa la misma validación; un perfil anterior sigue siendo válido
  const issues = []; familiarityIssues(profile, (id, sev, rule, msg) => { if (sev === 'error') issues.push(`${id}: ${msg}`); }); assert.deepEqual(issues, []);
  const cand = deepCopy(profile); cand.familiarity.learning.factors.player.points[3].factor = 1.8; const ci = []; familiarityIssues(cand, (id, sev) => { if (sev === 'error') ci.push(id); }); assert.deepEqual(ci, []);
  cand.familiarity.learning.factors.player.points[3].factor = 0.9; const ci2 = []; familiarityIssues(cand, (id, sev) => { if (sev === 'error') ci2.push(id); }); assert.ok(ci2.length > 0);
  const old = []; familiarityIssues(profile18, (id, sev) => { if (sev === 'error') old.push(id); }); assert.deepEqual(old, []);
  assert.equal(profile.familiarity.version, 'FAM-MOTOR18B-R1'); assert.equal(profile.familiarity.learningVersion, 'LEARN-MOTOR18B-R1'); assert.equal(profile18.familiarity.version, 'FAM-MOTOR18-R1');
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-02
const orgBlock = () => uniformBlock(12);
const F2 = (tl, params = P) => L.factorsFor({ domain: 'tactic', id: 'ORG02', block: orgBlock(), tacticalLearning: tl, coach: coachOf(16, 16), params });
test('L18B-02 ejemplo ORG02 (K12, 1 hora equivalente al objetivo): anterior y nuevo en los siete niveles; G24/G8 = 4', () => {
  const T = [[1, 0.75, 0.25, 12.4451195113, 12.1496132881], [8, 0.8706896552, 0.5, 12.5157125829, 12.2979830131], [12, 0.9396551724, 0.75, 12.5559239538, 12.4451195113], [16, 1.0086206897, 1, 12.5960428442, 12.5910330331],
    [20, 1.0775862069, 1.5, 12.6360694669, 12.8792317238], [24, 1.1465517241, 2, 12.6760040341, 13.1626593971], [30, 1.25, 2.5, 12.7357337437, 13.4413950352]];
  const G = {}; const gain = {};
  for (const [tl, fOld, fNew, kOld, kNew] of T) {
    const a = F2(tl, P0); const b = F2(tl, P); near(a.player, fOld, 1e-9); near(b.player, fNew, 1e-12); // sin «tolerancia de redondeo» más allá del 10.º decimal de la tabla
    near(L.learnClosed({ level: 12, peak: 12, dose: 1, rate: 0.8, F: a.product, params: P0 }).level, kOld, 2e-9);
    const r = L.learnClosed({ level: 12, peak: 12, dose: 1, rate: 0.8, F: b.product, params: P }); near(r.level, kNew, 2e-9); G[tl] = r.G; gain[tl] = r.level - 12;
    near(b.transfer, 1 + 0.5 * (11 / 29), 1e-12); // transferencia con todos los relacionados en 12
  }
  near(G[24] / G[8], 4, 1e-12); near(gain[24] / gain[8], 3.901764, 1e-6);
  assert.ok(gain[24] / gain[8] < 4, 'no es multiplicar por cuatro la ganancia absoluta: actúan la cercanía a 30 y el tramo de reaprendizaje');
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-03
test('L18B-03 dosis necesaria para un objetivo común (K12→K18): P8 necesita cuatro veces la dosis de P24 con factores constantes', () => {
  const need = (tl) => L.doseToReach({ level: 12, peak: 12, target: 18, rate: 0.8, F: F2(tl).product, params: P });
  near(need(8), 24.289281, 1e-6); near(need(16), 12.144640, 1e-6); near(need(24), 6.07232, 1e-6); near(need(8) / need(24), 4, 1e-12);
  const F = F2(16).product; near(L.learnClosed({ level: 12, peak: 12, dose: need(16), rate: 0.8, F, params: P }).level, 18, 1e-9); // la lectura pura coincide con la fórmula de ganancia
  assert.equal(L.doseToReach({ level: 12, peak: 12, target: 30, rate: 0.8, F, params: P }), Infinity); assert.equal(L.doseToReach({ level: 12, peak: 12, target: 10, rate: 0.8, F, params: P }), 0);
  // con peak por encima del nivel el tramo hasta el peak usa el reaprendizaje (×2) y la lectura sigue siendo exacta
  const d = L.doseToReach({ level: 12, peak: 16, target: 20, rate: 0.8, F, params: P }); near(L.learnClosed({ level: 12, peak: 16, dose: d, rate: 0.8, F, params: P }).level, 20, 1e-9);
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-04
test('L18B-04 el factor de Polivalencia se consume igual en los cuatro dominios y en fuentes de sesión y de partido; no cambia ninguna capacidad', () => {
  const dose = { liveTenths: 24000, positions: { PG: 24000 }, offensiveRoles: { O01: 24000 }, defensiveRoles: { D01: 24000 }, modules: { ORG02: 1 } };
  for (const tl of [8, 16, 24]) {
    const st = teamOf({ a: uniformBlock(12) }, P, coachOf(), 0, tl); const expected = K.playerFactor(tl, P).factor;
    const s = L.proposeFromSession(st, { source_id: `S-${tl}`, collectiveFocus: 'ORG02', players: { a: { hours: 2, individualFocus: { domain: 'position', id: 'PG' } } } }, P);
    const m = L.proposeFromMatch(st, { complete: true, match: { source_id: `M-${tl}` }, players: { a: dose } }, P);
    const seen = new Set();
    for (const t of [...s.players.a.targets, ...m.players.a.targets]) { near(t.factors.player, expected, 1e-12); assert.equal(t.factors.playerModel, 'piecewise-linear'); seen.add(t.key.split(':')[0]); }
    assert.deepEqual([...seen].sort(), ['defensiveRole', 'offensiveRole', 'position', 'tactic']);
    assert.deepEqual(s.playerCurve.points.map((p) => p.factor), [0.25, 0.5, 1, 2, 2.5]); assert.equal(m.paramsVersion, 'LEARN-MOTOR18B-R1'); assert.match(m.paramsFingerprint, /^[0-9a-f]{16}$/);
    assert.deepEqual(Object.keys(s.nextState.players.a).sort(), ['block', 'closedDays', 'ledger', 'tacticalLearning']); // solo conocimiento, Polivalencia y presupuestos
  }
  const old = L.proposeFromSession(teamOf({ a: uniformBlock(12) }, P0, coachOf(), 0, 8), { source_id: 'OLD', collectiveFocus: 'ORG02', players: { a: { hours: 1, individualFocus: null } } }, P0);
  near(old.players.a.targets[0].factors.player, 0.75 + 0.5 * (7 / 29)); assert.equal(old.players.a.targets[0].factors.playerModel, 'linear'); assert.equal(old.playerCurve.model, 'linear'); // un perfil anterior conserva su recibo
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-05
test('L18B-05 reaprendizaje solo hasta el peak y dosis aditiva con factores constantes (curva nueva incluida)', () => {
  const F = F2(24).product; const run = (level, peak, dose) => L.learnClosed({ level, peak, dose, rate: 0.8, F, params: P });
  const lost = run(10, 20, 3); const fresh = run(10, 10, 3); assert.ok(lost.level > fresh.level, 'recuperar lo ya aprendido es más rápido');
  const cut = run(19.5, 20, 6); assert.ok(cut.acceleratedDose < 6 && cut.level > 20); near(cut.G, 0.8 * F * (2 * cut.acceleratedDose + cut.normalDose), 1e-12);
  assert.equal(run(20, 20, 2).acceleratedDose, 0, 'sin reaprendizaje para lo nunca aprendido (nivel = peak)');
  for (const [lv, pk, d] of [[12, 12, 4], [10, 20, 8], [26, 30, 2]]) { const h = run(lv, pk, d / 2); near(run(lv, pk, d).level, run(h.level, h.peak, d / 2).level, 1e-12); }
  near(run(12, 12, 4).level, 30 - 18 * Math.exp(-(0.8 * 4 * F) / 29), 1e-12);
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-06
test('L18B-06 desuso: 30 histórico y 3.650 días sin practicar la posición siguen en 26,4; la Polivalencia no cambia desuso ni suelo', () => {
  near(L.retainEntry({ level: 30, peak: 30, lastPracticeDay: 0 }, 'position', 0, 3650, P).level, 26.4);
  const lowP = L.advanceTeam(teamOf({ a: uniformBlock(30) }, P, coachOf(), 0, 8), 3650, P).state; const highP = L.advanceTeam(teamOf({ a: uniformBlock(30) }, P, coachOf(), 0, 30), 3650, P).state;
  near(lowP.players.a.block.positions.PG.level, 26.4); assert.deepEqual(lowP.players.a.block.tactics, highP.players.a.block.tactics); assert.deepEqual(lowP.players.a.block.positions, highP.players.a.block.positions);
  near(lowP.players.a.block.tactics.ORG02.level, 18); // suelo táctico 0,6·peak
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-07
test('L18B-07 sesiones inválidas se rechazan sin cambiar estado ni registro; los presupuestos diarios se conservan', () => {
  const st = teamOf({ a: uniformBlock(12), b: uniformBlock(12) }); const before = JSON.stringify(st); const led = L.createLedger(); const ledBefore = JSON.stringify(led);
  const base = { source_id: 'S1', collectiveFocus: 'ORG02', players: { a: { hours: 4, individualFocus: { domain: 'position', id: 'PG' } } } };
  const bad = {
    'colectivo 2 e individual −1 (suman 1 pero son inválidos)': { ...base, shares: { collective: 2, individual: -1 } },
    'reparto NaN': { ...base, shares: { collective: NaN, individual: NaN } }, 'reparto con Infinity': { ...base, shares: { collective: Infinity, individual: -Infinity } },
    'reparto que no suma 1': { ...base, shares: { collective: 0.7, individual: 0.7 } }, 'fuente vacía': { ...base, source_id: '' }, 'fuente ausente': { ...base, source_id: undefined }, 'fuente solo espacios': { ...base, source_id: '   ' },
    'horas NaN': { ...base, players: { a: { hours: NaN, individualFocus: null } } }, 'horas Infinity': { ...base, players: { a: { hours: Infinity, individualFocus: null } } }, 'horas como texto': { ...base, players: { a: { hours: '2', individualFocus: null } } },
    'jugador ajeno': { ...base, players: { z: { hours: 1 } } }, 'foco individual táctico': { ...base, players: { a: { hours: 1, individualFocus: { domain: 'tactic', id: 'ORG02' } } } }, 'foco colectivo ajeno': { ...base, collectiveFocus: 'ORG99' },
    'sin jugadores': { source_id: 'S1', collectiveFocus: 'ORG02', players: {} }, 'días fraccionarios': { ...base, idleDays: 1.5 }, 'días fuera de rango': { ...base, idleDays: 5000 },
  };
  for (const [name, s] of Object.entries(bad)) { const r = L.proposeFromSession(st, s, P); assert.equal(r.ok, false, name); assert.ok(r.errors.length && r.errors.every((e) => e.path && e.message), name); }
  assert.equal(JSON.stringify(st), before); assert.equal(JSON.stringify(led), ledBefore);
  // Polivalencia o enseñanza no finitas también se rechazan sin dosis cero aparente
  const broken = strip(st); broken.players.a.tacticalLearning = NaN; assert.equal(L.proposeFromSession(broken, base, P).ok, false); const noCoach = strip(st); noCoach.coach.teaching = undefined; assert.equal(L.proposeFromSession(noCoach, base, P).ok, false);
  // presupuestos: 4 h acumuladas por jugador y día (la segunda sesión del día solo recibe el saldo) y una dosis de partido por jugador, dominio y día
  const s1 = L.proposeFromSession(st, base, P); assert.equal(s1.players.a.hours.used, 4); const a1 = L.applyProposal(st, led, s1, P); assert.ok(a1.ok);
  const s2 = L.proposeFromSession(a1.state, { ...base, source_id: 'S2' }, P); assert.equal(s2.players.a.hours.used, 0); assert.equal(s2.players.a.hours.clampedByDailyBudget, true);
  const x = { complete: true, match: { source_id: 'M1' }, players: { a: { liveTenths: 24000, positions: { PG: 24000 }, offensiveRoles: { O01: 24000 }, defensiveRoles: { D01: 24000 }, modules: { ORG02: 2 } } } };
  const m1 = L.proposeFromMatch(a1.state, x, P); const a2 = L.applyProposal(a1.state, a1.ledger, m1, P); assert.ok(a2.ok);
  const m2 = L.proposeFromMatch(a2.state, { ...x, match: { source_id: 'M2' } }, P); assert.equal(m2.players.a.budgets.position.allowed, 0); assert.equal(m2.players.a.budgets.tactic.allowed, 0); // prórroga o repetición no lo multiplica
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-08
test('L18B-08 solo un encuentro terminado produce aprendizaje; aplicar, repetir y deshacer respetan la identidad; los parámetros efectivos ligan la vista previa', () => {
  const st = teamOf({ a: uniformBlock(12), b: uniformBlock(12) });
  const full = { liveTenths: 24000, positions: { PG: 24000 }, offensiveRoles: { O01: 24000 }, defensiveRoles: { D01: 24000 }, modules: { ORG02: 1 } };
  const mk = (extra) => ({ match: { source_id: 'M1' }, players: { a: full }, ...extra });
  for (const [name, x] of Object.entries({ 'parcial': mk({ complete: false }), 'sin indicador': mk({}), 'complete como texto': mk({ complete: 'true' }), 'estado no terminado': mk({ complete: true, status: 'running' }), 'sin jugadores propios': { complete: true, match: { source_id: 'M1' }, players: { rival: full } },
    'tiempo negativo': mk({ complete: true, players: { a: { ...full, liveTenths: -1 } } }), 'crédito NaN': mk({ complete: true, players: { a: { ...full, modules: { ORG02: NaN } } } }), 'módulo ajeno': mk({ complete: true, players: { a: { ...full, modules: { ZZZ: 1 } } } }),
    'posiciones por encima del tiempo vivo': mk({ complete: true, players: { a: { ...full, liveTenths: 100 } } }), 'otra instancia': mk({ complete: true, match: { source_id: 'M1', teams: ['OTRA'] } }) })) {
    const r = L.proposeFromMatch(st, x, P); assert.equal(r.ok, false, name); assert.ok(r.errors.length, name);
  }
  assert.equal(L.proposeFromMatch(st, mk({ complete: true }), P).ok, true);
  assert.equal(L.proposeFromMatch(st, mk({ complete: true, match: { source_id: '' } }), P).ok, false);
  // el rival legítimo en el mismo bloque no se confunde con un jugador propio: se ignora
  assert.equal(L.proposeFromMatch(st, mk({ complete: true, players: { a: full, rival1: { liveTenths: -5 } } }), P).ok, true);
  // productor común: un partido no terminado se declara parcial y no es aplicable; uno terminado sí
  const partial = L.buildExposure({ exposure: { players: { a: full } }, status: 'running', source_id: 'M1' }); assert.equal(partial.complete, false); assert.equal(L.finishedExposure({ exposure: { players: { a: full } }, status: 'running' }).ok, false);
  const done = L.finishedExposure({ exposure: { players: { a: full } }, status: 'finished', source_id: 'M1', teams: ['T'] }); assert.equal(done.ok, true); assert.equal(done.exposure.complete, true);
  assert.equal(L.exposureFromResult({ status: 'running', diagnostics: { familiarity: { exposure: { players: { a: full } } } } }).ok, false); assert.equal(L.exposureFromResult({ status: 'finished' }).ok, false); // no fabrica finalización cuando faltan datos
  // aplicar, repetir, deshacer
  let led = L.createLedger(); const p1 = L.proposeFromMatch(st, done.exposure, P, { source_id: 'M1|T' }); const a1 = L.applyProposal(st, led, p1, P); assert.ok(a1.ok);
  assert.match(L.applyProposal(a1.state, a1.ledger, p1, P).reason, /ya se aplicó/); const u = L.undoApplication(a1.state, a1.ledger, 'APL-1'); assert.ok(u.ok); assert.equal(L.teamFingerprint(u.state), L.teamFingerprint(st)); assert.equal(u.state.players.a.ledger.match.used.position ?? 0, 0);
  assert.ok(L.applyProposal(u.state, u.ledger, p1, P).ok, 'una fuente revertida vuelve a ser aplicable');
  // la vista previa queda ligada a los parámetros efectivos: si cambia la curva, se invalida
  const cand = deepCopy(profile); cand.familiarity.learning.factors.player.points[3].factor = 3; assert.notEqual(L.learningParamsFingerprint(cand.familiarity), L.learningParamsFingerprint(P));
  const r = L.applyProposal(st, L.createLedger(), p1, cand.familiarity); assert.equal(r.ok, false); assert.match(r.reason, /parámetros de aprendizaje efectivos cambiaron/);
  assert.equal(L.learningParamsFingerprint(deepCopy(P)), L.learningParamsFingerprint(P));
  // adoptar la versión de aprendizaje nueva no reconstruye el equipo: metadatos anotados, conocimiento y presupuestos intactos
  const oldTeam = teamOf({ a: uniformBlock(12) }, P0); assert.equal(oldTeam.learningVersion, 'LEARN-MOTOR18-R1');
  const ad = L.adoptLearningParams(oldTeam, P); assert.equal(ad.adopted, true); assert.equal(ad.state.learningVersion, 'LEARN-MOTOR18B-R1'); assert.equal(L.teamFingerprint(ad.state), L.teamFingerprint(oldTeam)); assert.equal(ad.state.adoptedFrom.length, 1); assert.equal(L.adoptLearningParams(ad.state, P).adopted, false);
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-09
const baseInput = () => buildMatchInput(profile, data.players, { seed: 7 });
test('L18B-09 Preparación edita la copia de aprendizaje activa: la entrada efectiva y la congelada coinciden; las referencias y el conocimiento no cambian', () => {
  const edit = baseInput(); const refSnapshot = JSON.stringify(edit);
  const copy = M.makeLearningCopy(edit, profile, { mode: 'synthetic', instanceSeq: 1 }); const store = { edit, scenario: { scenario: { id: copy.id, learning: true }, input: copy.input } };
  assert.equal(isLearningScenarioOf(store), true); assert.equal(prepInputOf(store), copy.input); assert.equal(matchSourceOf(store), prepInputOf(store));
  const target = prepInputOf(store); const t0 = target.teams[0]; const knowledgeBefore = JSON.stringify(t0.players.map((p) => p.knowledge));
  // lo que edita Preparación: defensa, rol ofensivo del primer jugador, puestos, estilos, semilla, libro
  t0.plan.defense = t0.plan.defense === 'ORG02' ? 'ORG03' : 'ORG02'; t0.players[0].offensiveRole = { code: 'O12', name: data.profile.fixtureContract.offensiveRoleDictionary.O12 }; target.seed = 123456;
  const [s0, s1] = [t0.plan.starters.PG, t0.plan.starters.C]; t0.plan.starters.PG = s1; t0.plan.starters.C = s0; t0.plan.participation = defaultParticipationPlan(profile, t0.players, t0.plan); // igual que Preparación al cambiar titulares
  t0.plan.styles = { ...t0.plan.styles }; t0.plan.playbook = t0.plan.playbook.slice(0, 5);
  const frozen = deepCopy(matchSourceOf(store)); const m = createMatch(frozen, profile, { detail: 'minimal' }); m.init();
  assert.equal(m.teams[0].plan.defense, t0.plan.defense); assert.equal(m.pl[t0.players[0].id].offensiveRole?.code ?? m.roleOf?.[t0.players[0].id], 'O12'); assert.equal(m.teams[0].plan.starters.PG, s1); assert.equal(frozen.seed, 123456); assert.equal(frozen.teams[0].plan.playbook.length, 5);
  assert.equal(JSON.stringify(edit), refSnapshot, 'la entrada editada de Dennis y las referencias no se tocan'); assert.equal(JSON.stringify(t0.players.map((p) => p.knowledge)), knowledgeBefore, 'cambiar defensa, rol o puesto no actualiza el conocimiento');
  // una copia de contraste distinta del aprendizaje conserva su significado: Preparación sigue editando store.edit
  const contrast = { edit, scenario: { scenario: { id: 'ESC', learning: false }, input: deepCopy(edit) } }; assert.equal(prepInputOf(contrast), edit); assert.equal(matchSourceOf(contrast), contrast.scenario.input);
  assert.equal(prepInputOf({ edit, scenario: { learning: true, input: copy.input } }), edit, 'el indicador de nivel superior (inexistente) no decide la fuente');
  // persistir y recargar conserva lo editado
  const back = M.deserializeLearning(M.serializeLearning({ copy: { ...copy, input: target }, day: 0, states: {}, ledgers: {}, undo: [] })); assert.equal(back.copy.input.teams[0].plan.defense, t0.plan.defense); assert.equal(back.copy.input.seed, 123456);
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-10
test('L18B-10 tras recargar, una sesión nueva recibe una fuente nueva; repetir la misma fuente real se rechaza; el presupuesto y el historial no se reinician', () => {
  const copy = M.makeLearningCopy(baseInput(), profile, { mode: 'synthetic', instanceSeq: 7 }); assert.match(copy.id, /-I7$/); assert.notEqual(copy.id, M.makeLearningCopy(baseInput(), profile, { mode: 'synthetic', instanceSeq: 8 }).id);
  const { states } = M.teamStatesOf(copy.input, P, 0); const Lr = { copy, day: 0, states, ledgers: M.newLedgers(copy.input), undo: [], sessionSeq: 1, matchSeq: 0 };
  const session = (seq, hours = 1) => ({ source_id: M.sessionSourceId(copy.id, 'EQ01', seq), collectiveFocus: 'ORG02', players: { 'EQ01-J01': { hours, individualFocus: null } } });
  const apply = (L2, spec) => { const pr = L.proposeFromSession(L2.states.EQ01, spec, P); const r = L.applyProposal(L2.states.EQ01, L2.ledgers.EQ01, pr, P); if (r.ok) { L2.states.EQ01 = r.state; L2.ledgers.EQ01 = r.ledger; L2.undo.push({ team: 'EQ01', application: r.receipt.application, source_id: pr.source_id }); L2.sessionSeq = Math.max(L2.sessionSeq, M.nextSessionSeq(L2)); } return { pr, r }; };
  assert.equal(M.nextSessionSeq(Lr), 1); const first = apply(Lr, session(M.nextSessionSeq(Lr))); assert.ok(first.r.ok); assert.match(first.pr.source_id, /\|EQ01\|S1$/);
  const reloaded = M.deserializeLearning(M.serializeLearning(Lr)); reloaded.editUndo = []; // recarga real: se serializa y se recupera
  assert.equal(M.nextSessionSeq(reloaded), 2); const second = apply(reloaded, session(M.nextSessionSeq(reloaded))); assert.ok(second.r.ok, 'una sesión nueva tras recargar no colisiona con S1'); assert.match(second.pr.source_id, /\|S2$/);
  assert.equal(reloaded.states.EQ01.players['EQ01-J01'].ledger.training.hours, 2, 'el presupuesto diario acumulado sobrevive a la recarga'); assert.equal(reloaded.ledgers.EQ01.applications.length, 2);
  const again = L.applyProposal(reloaded.states.EQ01, reloaded.ledgers.EQ01, L.proposeFromSession(reloaded.states.EQ01, session(2), P), P); assert.equal(again.ok, false); // la misma fuente real sigue rechazada
  // deshacer conserva el recibo revertido y no libera su número: una sesión nueva obtiene otro
  const u = L.undoApplication(reloaded.states.EQ01, reloaded.ledgers.EQ01, 'APL-2'); assert.ok(u.ok); reloaded.states.EQ01 = u.state; reloaded.ledgers.EQ01 = u.ledger; reloaded.undo.pop(); assert.equal(M.nextSessionSeq(reloaded), 3);
  assert.equal(reloaded.ledgers.EQ01.applications.find((a) => a.id === 'APL-2').status, 'revertida');
  // una copia anterior que no guarda el contador deriva el siguiente número libre de TODOS sus recibos (incluidos los revertidos)
  const legacy = JSON.parse(M.serializeLearning(reloaded)); delete legacy.sessionSeq; assert.equal(M.deserializeLearning(JSON.stringify(legacy)).sessionSeq, 3);
  // identidad del encuentro estable: dos encuentros del mismo resultado no colisionan y la identidad sobrevive a guardar/recuperar
  const id1 = M.nextMatchId(Lr); const id2 = M.nextMatchId(Lr); assert.notEqual(id1, id2); assert.equal(M.deserializeLearning(M.serializeLearning(Lr)).matchSeq, 2);
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-11
const withFamilies = (blockerId, handlerId) => {
  const input = inputFor(7); const F = profile.familiarity;
  for (const t of input.teams) for (const p of t.players) p.knowledge = K.allMastered(F, 0);
  input.teams[0].players.find((p) => p.id === blockerId).knowledge.tactics['FAM:pick_and_roll'] = K.makeEntry(1, 0);
  const m = createMatch(input, profile, { detail: 'full' }); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); return { m, handlerId };
};
test('L18B-11 el bloqueador de una salida pertinente participa una vez (−0,045 logit); todo a 30 da 0; una continuación ajena no lo arrastra', () => {
  const handler = 'EQ01-J01'; const blocker = 'EQ01-J03'; const { m } = withFamilies(blocker, handler);
  const ex = baseEx({ actor: handler, holder: handler, defend: 'EQ02-J01', icpt: 'EQ02-J01', family: 'pick_and_roll', zone: 'rim', offContact: { pid: handler, tech: 'TEC07', kind: 'penetración' }, blocker, inter: 1, coverageExpected: true });
  const c = m.famQualityContext(ex, true); assert.deepEqual(c.attackP.sort(), [blocker, handler].sort()); assert.equal(c.blocker, blocker);
  assert.deepEqual(c.atk.map((x) => [x.id, x.w]), [['FAM:pick_and_roll', 0.6], ['DIS02', 0.4]]);
  const a = m.famAdjust(c, 'quality'); near(a.DA, 0.85); near(a.delta, -0.045, 1e-12); assert.equal(a.ataque.find((x) => x.pid === handler).D, 1); near(a.ataque.find((x) => x.pid === blocker).D, 0.7);
  // la implementación anterior (contacto de penetración, sin bloqueador) daba 0
  assert.equal(m.famAdjust(m.famQualityContext({ ...ex, blocker: undefined }, true), 'quality').delta, 0);
  // una continuación que inicia otra interacción (`blocker: null`) no arrastra al bloqueador anterior ni su exposición
  const cont = m.famQualityContext({ ...ex, blocker: null, inter: null, label: 'CONT05', kind: 'continuation' }, true); assert.ok(!cont.attackP.includes(blocker)); assert.equal(m.famAdjust(cont, 'quality').delta, 0);
  // exposición: un crédito por jugador–operación repartido por los pesos (suma 1), sin otra dosis por cada etiqueta de participación; dedup si ocupa varias funciones
  m.famCredit(c); const e = m.fam.exp.players[blocker]; near(Object.values(e.modules).reduce((s, v) => s + v, 0), 1, 1e-12); assert.equal(m.fam.exp.players[handler].modules['FAM:pick_and_roll'], 0.6);
  const dup = m.famQualityContext({ ...ex, passer: blocker }, true); assert.equal(dup.attackP.filter((x) => x === blocker).length, 1);
  // jugador fuera de pista o no disponible queda excluido
  m.ps[blocker].onCourt = false; assert.ok(!m.famQualityContext(ex, true).attackP.includes(blocker)); m.ps[blocker].onCourt = true;
  // todo a 30: ajuste exactamente cero
  const { m: m30 } = withFamilies(blocker, handler); m30.pl[blocker].knowledge.tactics['FAM:pick_and_roll'] = K.makeEntry(30, 0); assert.equal(m30.famAdjust(m30.famQualityContext(ex, true), 'quality').delta, 0);
  // en un partido real el bloqueador aparece en las notas de familiaridad con su crédito
  const inp = inputFor(382000002); for (const t of inp.teams) for (const p of t.players) p.knowledge = K.allMastered(P, 0); for (const p of inp.teams[0].players) p.knowledge.tactics['FAM:pick_and_roll'] = K.makeEntry(8, 0);
  const res = runMatch(inp, profile, { detail: 'full' }); const notes = res.events.flatMap((ev) => (ev.calc ?? []).filter((n) => n.label === 'familiaridad' && n.aplica));
  assert.ok(notes.some((n) => n.bloqueador && n.participantes.ataque.some((p) => p.pid === n.bloqueador)), 'hay operaciones con bloqueador registrado y presente en los participantes de familiaridad');
  assert.ok(!notes.some((n) => n.bloqueador && !n.participantes.ataque.some((p) => p.pid === n.bloqueador)), 'ningún bloqueador registrado queda fuera de los participantes');
});

// ----------------------------------------------------------------------------------------------------------------------------------- L18B-12
test('L18B-12 la estimación comparte el contexto conocido de la operación; lo no determinado se declara y no se inventa; estimar no tiene efectos', () => {
  const handler = 'EQ01-J01'; const { m } = withFamilies('EQ01-J03', handler);
  // defensa con COB01 desconocida (nivel 1) y todo lo demás a 30
  for (const id of ['EQ02-J01', 'EQ02-J03']) m.pl[id].knowledge.tactics.COB01 = K.makeEntry(1, 0);
  m.pl['EQ01-J03'].knowledge.tactics['FAM:pick_and_roll'] = K.makeEntry(30, 0);
  const ex = baseEx({ actor: handler, holder: handler, defend: 'EQ02-J01', icpt: 'EQ02-J01', family: 'pick_and_roll', zone: 'rim', blocker: null, inter: 41, coverageExpected: true });
  const withCov = () => { m.poss.coverage = { cob: 'COB01', D1: 'EQ02-J01', D2: 'EQ02-J03', inter: 41, pair: {}, info: {} }; };
  // operación resuelta: dos defensores y ORG/COB01 con sus pesos
  withCov(); const resolved = m.famAdjust(m.famQualityContext(ex, true), 'quality'); assert.equal(m.famQualityContext(ex, true).scope, 'resuelta'); near(resolved.delta, 0.045, 1e-12);
  // candidato con los MISMOS datos ya determinados: mismo contexto, misma función, mismo ajuste
  const det = m.famEstimateDetail(ex, true); assert.equal(det.scope, 'determinada'); assert.deepEqual(det.missing, []); near(det.delta, resolved.delta, 1e-15); near(m.famQualityEstimate(ex, true), resolved.delta, 1e-15);
  // candidato con cobertura/participantes todavía no determinados: usa lo conocido, declara el alcance limitado y qué falta (la diferencia de 0,045 del hallazgo es legítima, no una compensación)
  m.poss.coverage = null; const lim = m.famEstimateDetail(ex, true); assert.equal(lim.scope, 'limitada'); assert.deepEqual(lim.missing, ['cobertura ejecutada', 'defensores de la cobertura']); assert.equal(lim.delta, 0); assert.deepEqual(lim.dfn.map((x) => x.id), ['ORG01']); assert.match(lim.provenance, /no se reutiliza/);
  // referencia de otra opción o de una interacción anterior: no se reutiliza (misma operación, otra interacción)
  m.poss.coverage = { cob: 'COB01', D1: 'EQ02-J01', D2: 'EQ02-J03', inter: 99, pair: {}, info: {} }; const stale = m.famEstimateDetail(ex, true); assert.equal(stale.scope, 'limitada'); assert.equal(stale.delta, 0);
  const resolvedStale = m.famQualityContext(ex, true); assert.equal(resolvedStale.cov, null, 'tampoco la operación real usa la cobertura de otra interacción');
  // una ficha sin cobertura prevista no declara nada pendiente
  assert.equal(m.famEstimateDetail({ ...ex, coverageExpected: false }, true).scope, 'determinada');
  // invariantes: estimar no cambia cobertura vigente, exposición, contador de sorteos ni reloj
  withCov(); const snap = () => JSON.stringify({ cov: m.poss.coverage, exp: m.fam.exp, draws: m.rng.count, clock: m.clock, stepSeq: m.stepSeq, events: m.events.length, apps: m.fam.apps });
  const before = snap(); for (let i = 0; i < 5; i++) { m.famEstimateDetail(ex, true); m.famQualityEstimate({ ...ex, window: true, defend: null }, false); } assert.equal(snap(), before);
  // sin conocimiento explícito o con la capa apagada: 0 y sin recorrer nada
  const off = deepCopy(profile); off.familiarity.activation.enabled = false; const mo = createMatch(inputFor(3), off, { detail: 'full' }); mo.init(); assert.equal(mo.famQualityEstimate(ex, true), 0);
});

// ----------------------------------------------------------------------------------------------------------------------------------- identidades y unidades
test('identidades de MOTOR-18B y unidades de la exposición (décimas de segundo de juego vivo)', () => {
  assert.equal(ENGINE_VERSION, 'beM-motor-0.18.1-MOTOR18B'); assert.equal(APP_VERSION, 'MOTOR-18B'); assert.equal(EXPORT_SCHEMA, 'beM-match-export/10'); assert.equal(ESSENTIAL_VERSION, 'ESE-MOTOR18B-R1'); assert.equal(FAMILIARITY_VERSION, 'FAM-MOTOR18B-R1');
  assert.deepEqual(profile.extensions.map((e) => e.id).slice(-2), ['SEM-MOTOR18-20261021', 'SEM-MOTOR18B-20261022']); assert.equal(profile.familiarity.knowledgeVersion, 'KNOW-MOTOR18-R1');
  const inp = inputFor(5); for (const t of inp.teams) for (const p of t.players) p.knowledge = K.allMastered(P, 0);
  const m = createMatch(inp, profile, { detail: 'minimal' }); m.init(); m.famTick(600); const x = m.famExposure(); assert.match(x.units.liveTenths, /décimas de segundo/); assert.match(x.units.liveTenths, /600 = 1 minuto/); assert.match(x.units.modules, /no son horas ni posesiones/);
  const first = Object.values(x.players)[0]; assert.equal(first.liveTenths, 600);
  const same = (a, b) => assert.equal(JSON.stringify(sportsProjection(a)), JSON.stringify(sportsProjection(b)));
  // cambiar solo la Polivalencia (curva nueva incluida) conserva el deporte
  const lo = inputFor(382000009); const hi = inputFor(382000009); for (const i of [lo, hi]) for (const t of i.teams) { t.coachLearning = { teaching: 16, tacticalMastery: Object.fromEntries(K.idsOf('tactic', P).map((id) => [id, 16])) }; for (const p of t.players) p.knowledge = K.allMastered(P, 0); }
  for (const p of lo.teams[1].players) p.development = { tacticalLearning: 8 }; for (const p of hi.teams[1].players) p.development = { tacticalLearning: 24 };
  same(runMatch(lo, profile, { detail: 'minimal' }), runMatch(hi, profile, { detail: 'minimal' }));
});
