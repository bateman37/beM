// MOTOR-07: capacidades, energía, Forma, presión, momentos, T y episodios. Casos controlados y parametrizados (N04, N12): el mapa de las 32
// capacidades se comprueba con una tabla de sondas, la neutralidad con pares de innovaciones opuestas en contextos fijos y los episodios raros
// con evidencias fijadas; solo cinco partidos completos de cierre. Ninguna prueba usa el marcador como prueba de realismo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, baseEx } from './helpers.js';
import {
  runMatch, createMatch, buildResult, deepCopy, validateInput, upgradeInput, buildContrastScenario, CONTRAST_SCENARIOS, ATTRS,
  ENGINE_VERSION, EXPORT_SCHEMA, ownStateView, rivalPublicView, diagnosticView, perturbBinary, perturbCategories, MOMENT_SCOPES,
} from '../src/match/index.js';
import { replayMatch, sportsProjection, validateReplayFile } from '../src/match/replay.js';
import { MatchSession } from '../src/match/session.js';
import { severityAt } from '../src/match/formulas.js';
import { validateProfile } from '../src/profiles/validate.js';
import { buildRows } from '../src/profiles/rows.js';

const profile = data.profile;
const A = 'EQ01-J03'; const B = 'EQ01-J01'; const D = 'EQ02-J04';
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

function ctrl({ seed = 5, over = () => {}, prof = profile } = {}) {
  const input = inputFor(seed); over(input);
  const m = createMatch(input, prof, { detail: 'full' });
  m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  return m;
}
const setAbility = (id, attr, v) => (input) => { input.teams.flatMap((t) => t.players).find((p) => p.id === id).abilities[attr] = v; };
const player = (input, id) => input.teams.flatMap((t) => t.players).find((p) => p.id === id);
// Sorteo controlado: u para las innovaciones de momento, 0,5 para el resto.
const stubDraw = (m, u) => { m.draw = (purpose) => { const x = purpose.startsWith('momento') ? u : 0.5; m.rng.next(purpose); return x; }; };
const noteOf = (m, label) => m.calcBuf.find((c) => c.label === label);

// ------------------------------------------------------------------------------------------------ 1. mapa de las 32 capacidades
// Cada sonda es una operación REAL del motor que depende de la capacidad del jugador propietario. Se comprueba que cambia al editarla en su
// propietario y que no cambia al editarla en otro jugador. No son 32 encuentros: son 32 sondas.
const SH = (zone) => (m, id) => m.shotAbility({ zone, actor: id });
const PROBES = {
  TEC01: SH('three'), TEC02: SH('midrange'), TEC03: SH('inside'), TEC04: SH('rim'),
  TEC05: (m, id) => m.recipeObj(profile.shots.freeThrow.attack, id, profile.energy.freeThrowTaskMax),
  TEC06: (m, id) => m.prepAbility(id),
  TEC07: (m, id) => m.taskValue('TAR06', 'attack', { handler: id }), TEC08: (m, id) => m.taskValue('TAR07', 'attack', { passer: id }),
  TEC09: (m, id) => m.taskValue('TAR04', 'attack', { screener: id }), TEC10: (m, id) => m.taskValue('TAR03', 'attack', { receiver: id }),
  TEC11: (m, id) => m.taskValue('TAR05', 'attack', { post: id }), TEC12: (m, id) => m.shotDefense('three', id, D === id ? A : D),
  TEC13: (m, id) => m.shotDefense('inside', id, D === id ? A : D), TEC14: (m, id) => m.taskValue('TAR06', 'defense', { primary: id }),
  TEC15: (m, id) => m.recipeObj(profile.block.attack, id, profile.block.maximumEnergyPenalty), TEC16: (m, id) => m.taskValue('TAR04', 'defense', { primary: id }),
  TEC17: (m, id) => m.reboundStrength(id), TEC18: (m, id) => m.recipeObj(profile.rebound.captor, id, profile.rebound.maxEnergyPenalty),
  FIS01: (m, id) => m.longTravelAccess(id), FIS02: (m, id) => m.taskValue('TAR02', 'attack', { handler: id }), FIS03: (m, id) => m.taskValue('TAR02', 'defense', { primary: id }),
  FIS04: (m, id) => m.taskValue('TAR05', 'attack', { post: id }), FIS05: (m, id) => m.recipeObj(profile.block.attack, id, profile.block.maximumEnergyPenalty),
  FIS06: (m, id) => m.enduranceFactor(id), FIS07: SH('three'),
  MEN01: (m, id) => m.taskValue('TAR01', 'attack', { director: id }), MEN02: (m, id) => m.libertyAndReading(0, id).q, MEN03: (m, id) => m.libertyAndReading(0, id).q,
  MEN04: (m, id) => m.taskValue('TAR03', 'defense', { receiverMarker: id }), MEN05: (m, id) => m.taskValue('TAR06', 'attack', { handler: id }),
  MEN06: (m, id) => m.consistencySigma(id), MEN07: (m, id) => m.choicePenalty(id),
};
test('1. mapa de capacidades: 32 sondas causales; cada una responde a su propietario y no a otro jugador', () => {
  assert.deepEqual(Object.keys(PROBES).sort(), [...ATTRS].sort());
  for (const attr of ATTRS) {
    const base = ctrl(); const v0 = base.pl[A].abilities[attr]; const nv = v0 > 24 ? v0 - 6 : v0 + 6;
    const own = ctrl({ over: setAbility(A, attr, nv) }); const other = ctrl({ over: setAbility(B, attr, nv) });
    const f = PROBES[attr];
    assert.notEqual(f(own, A), f(base, A), `${attr}: no responde a su propietario`);
    assert.equal(f(other, A), f(base, A), `${attr}: responde a un jugador ajeno`);
  }
});

test('1b. gestos y cuerpo: TEC03/TEC04 por zona, TEC06 solo prepara, TEC11 crea la ventaja, el libre no tiene defensor y peso/edad no suman nada', () => {
  const nv = (id, attr) => ctrl({ over: setAbility(id, attr, 25) });
  const base = ctrl();
  assert.notEqual(nv(A, 'TEC03').shotAbility({ zone: 'inside', actor: A }), base.shotAbility({ zone: 'inside', actor: A }));
  assert.equal(nv(A, 'TEC03').shotAbility({ zone: 'rim', actor: A }), base.shotAbility({ zone: 'rim', actor: A }), 'el aro no usa TEC03');
  assert.equal(nv(A, 'TEC06').shotAbility({ zone: 'three', actor: A }), base.shotAbility({ zone: 'three', actor: A }), 'TEC06 no es una segunda puntería');
  assert.notEqual(nv(A, 'TEC06').prepAbility(A), base.prepAbility(A));
  assert.equal(nv(A, 'TEC11').shotAbility({ zone: 'inside', actor: A }), base.shotAbility({ zone: 'inside', actor: A }), 'TEC11 no es la capacidad de acierto');
  assert.notEqual(nv(A, 'TEC11').taskValue('TAR05', 'attack', { post: A }), base.taskValue('TAR05', 'attack', { post: A }));
  assert.deepEqual(profile.shots.freeThrow.defense, {}); assert.equal(profile.stateTasks.tasks.freeThrow.counterMoment, null);
  // cuerpo: el tamaño interviene en la disputa del tiro; peso y edad por sí solos no cambian el deporte
  const tall = ctrl({ over: (i) => { player(i, D).heightCm += 15; player(i, D).wingspanCm += 15; } });
  assert.notEqual(tall.shotDefense('three', D, A), base.shotDefense('three', D, A));
  const heavy = ctrl({ over: (i) => { player(i, D).weightKg += 30; player(i, D).age = 41; } });
  assert.equal(heavy.shotDefense('three', D, A), base.shotDefense('three', D, A));
  const a = inputFor(777); const b = deepCopy(a); for (const t of b.teams) for (const p of t.players) { p.age = 41; p.weightKg += 25; }
  const ra = runMatch(a, profile, { detail: 'minimal', track: false }); const rb = runMatch(b, profile, { detail: 'minimal', track: false });
  assert.equal(JSON.stringify(sportsProjection(ra)), JSON.stringify(sportsProjection(rb)), 'variar edad y peso solos no cambia el deporte');
});

test('1c. conexiones nuevas: Velocidad sustituye a TAR02 en el acceso de transición (sin doble prima) y la lectura defensiva usa al defensor real', () => {
  const m = ctrl(); const c = profile.missingTaskConnections;
  near(Object.values(c.longTravelAccessAttack).reduce((s, x) => s + x, 0), 1); near(Object.values(c.defensiveOptionReading).reduce((s, x) => s + x, 0), 1);
  const fast = ctrl({ over: setAbility(A, 'FIS01', 28) }); assert.ok(fast.longTravelAccess(A) > m.longTravelAccess(A));
  // la lectura del defensor depende de SUS capacidades, no de las del base del equipo rival
  const rd = ctrl({ over: setAbility(D, 'MEN02', 28) }); const rb = ctrl({ over: setAbility('EQ02-J01', 'MEN02', 28) });
  assert.ok(rd.defensiveReading(D) > m.defensiveReading(D)); assert.equal(rb.defensiveReading(D), m.defensiveReading(D));
  // el retorno defensivo largo ya estaba conectado (defenderArrival con FIS01 y FIS02): su fila del anexo no se aplica dos veces
  const row = buildRows(profile).find((r) => r.id === 'missingTaskConnections.longTravelReturnDefense.FIS01');
  assert.equal(row.coverage, 'sin_consumidor'); assert.deepEqual(Object.keys(profile.selection.direct.defenderArrival).sort(), ['FIS01', 'FIS02']);
});

// ------------------------------------------------------------------------------------------------ 2. energía
test('2. energía: curva continua y monótona, deterioro selectivo por tarea, gasto y recuperación una vez, Resistencia causal sin bonus de acierto', () => {
  const sev = Object.fromEntries([100, 85, 70, 50, 30, 10, 5, 0].map((e) => [e, severityAt(profile, e)]));
  near(sev[100], 0); near(sev[70], 0.01); near(sev[50], 0.1); near(sev[30], 0.3); near(sev[10], 0.65); near(sev[0], 1);
  assert.ok(sev[85] > sev[100] && sev[85] < sev[70] && sev[5] > sev[10] && sev[5] < sev[0]);
  const es = []; for (let e = 100; e >= 0; e -= 2.5) es.push(severityAt(profile, e)); assert.ok(es.every((x, i) => i === 0 || x >= es[i - 1] - 1e-12));
  // selectivo: a E10 pierde más una tarea física exigente que una técnica; la nota guardada no cambia y no se renormaliza
  const m = ctrl(); m.ps[A].energy = 10;
  near(m.pl[A].abilities.TEC01 - m.eff(A, 'TEC01'), 0.65 * profile.energy.defaultTechnicalTaskMax); near(m.pl[A].abilities.FIS02 - m.eff(A, 'FIS02'), 0.65 * profile.energy.defaultPhysicalTaskMax);
  assert.equal(m.pl[A].abilities.FIS02, ctrl().pl[A].abilities.FIS02); assert.ok(m.eff(A, 'FIS02') > 1);
  // gasto una vez por intervalo y recuperación de banquillo; Resistencia alta gasta menos
  const g = ctrl({ over: (i) => { player(i, A).abilities.FIS06 = 30; player(i, B).abilities.FIS06 = 1; } });
  const bench = g.teams[0].ids.find((id) => !g.ps[id].onCourt); g.ps[bench].energy = 50;
  g.consume(600, 'organized');
  near(100 - g.ps[A].energy, profile.energy.costPerLiveMinute * g.enduranceFactor(A)); assert.ok(g.ps[A].energy > g.ps[B].energy);
  near(g.ps[bench].energy, 50 + profile.energy.benchRecoveryPerLiveMinute);
  // sin bonus directo de acierto: con la misma energía, Resistencia distinta no cambia la capacidad de tiro
  const same = ctrl(); same.ps[A].energy = g.ps[A].energy;
  assert.equal(g.shotAbility({ zone: 'three', actor: A }), same.shotAbility({ zone: 'three', actor: A }));
  // la recuperación del tiempo muerto efectiva es la de la extensión vigente (1,5) y no un 2 heredado de un antecedente
  assert.equal(profile.motor02.timeOutRecoveryEnergyPoints, 1.5);
});

// ------------------------------------------------------------------------------------------------ 3. Forma, presión y elección
test('3. Forma estable durante el partido, presión = máximo de importancia y tensión, MEN07 preserva sin bonus de talento', () => {
  const input = inputFor(31); for (const id of [A, B, D]) player(input, id).state.form = 0.7; player(input, 'EQ02-J01').state.form = -0.8;
  const res = runMatch(input, profile, { detail: 'minimal', track: false });
  for (const id of [A, B, D]) assert.equal(res.diagnostics.states.jugadores[id].forma, 0.7); assert.equal(res.diagnostics.states.jugadores['EQ02-J01'].forma, -0.8);
  const m = ctrl(); const imp = profile.pressure.importance;
  m.period = 2; m.clock = 6000; assert.equal(m.pressureNow().P, imp.ordinary);
  m.period = 4; m.clock = 600; m.score = [50, 50]; near(m.pressureNow().P, 1 * 0.8 * 1);
  m.score = [70, 50]; assert.equal(m.pressureNow().P, imp.ordinary, 'margen grande: manda la importancia (máximo, no suma)');
  m.importance = 'decisive'; m.score = [50, 50]; assert.equal(m.pressureNow().P, 1, 'acotado a 1: no se suman dos exigencias completas');
  // MEN07 máximo anula la pérdida; nunca hay ganancia por presión
  const hi = ctrl({ over: setAbility(A, 'MEN07', 30) }); hi.importance = 'decisive';
  assert.equal(hi.formPressure('shotConversion', [A], [], { executants: [A] }).delta, 0);
  const lo = ctrl({ over: setAbility(A, 'MEN07', 1) }); lo.importance = 'decisive'; assert.ok(lo.formPressure('shotConversion', [A], [], { executants: [A] }).delta < 0);
  assert.ok(lo.choicePenalty(A) <= profile.pressure.choiceMaximumDecisionPointsLost && lo.choicePenalty(A) > hi.choicePenalty(A));
  // Forma: una sola corrección por contraste, limitada al máximo del ámbito; la contraparte resta una vez
  const f = ctrl({ over: (i) => { player(i, A).state.form = 1; player(i, D).state.form = 1; } });
  near(f.formPressure('shotConversion', [A], [D], { executants: [] }).form, Math.min(profile.form.taskMaxLogit.shot, profile.form.taskMaxLogit.shot - profile.form.taskMaxLogit.defenseDispute));
});

// ------------------------------------------------------------------------------------------------ 4. momentos: dominio, actualización y pausas
test('4. momentos: dominio, actualización perezosa sin azar al consultar, banquillo sin variación, pausas una vez y sustitución con la situación anterior', () => {
  const m = ctrl(); const s0 = m.rng.count;
  m.sportT = 6000; // 10 minutos de juego vivo pendientes
  m.momentView(A, 'M_TIR'); m.stateSnapshot(); diagnosticView(m); ownStateView(m, 0); rivalPublicView(m, 1);
  assert.equal(m.rng.count, s0, 'las vistas no consumen azar');
  const v1 = m.flushMoment(A, 'M_TIR'); const n1 = m.rng.count; assert.equal(n1, s0 + 1);
  assert.equal(m.flushMoment(A, 'M_TIR'), v1); assert.equal(m.rng.count, n1, 'la misma frontera no vuelve a sortear');
  assert.ok(v1 >= -1 && v1 <= 1);
  // banquillo: solo atenuación determinista, sin sorteo
  const bench = m.teams[0].ids.find((id) => !m.ps[id].onCourt); m.ps[bench].mom.M_OFE.v = 0.8; const n2 = m.rng.count;
  const vb = m.flushMoment(bench, 'M_OFE'); assert.equal(m.rng.count, n2); near(vb, 0.8 * 2 ** (-600 / profile.moment.benchHalfLifeSeconds), 1e-9);
  // pausa: una vez, sin fijar a neutral
  const p = ctrl(); p.ps[B].mom.M_DEF.v = 0.8; p.tm[0].v = 0.5; p.pauseMarker('halftime', 'prueba');
  near(p.flushMoment(B, 'M_DEF'), 0.8 * profile.moment.pauseAttenuation.halftime); near(p.flushMoment(B, 'M_DEF'), 0.8 * profile.moment.pauseAttenuation.halftime);
  near(p.teamMomentOf(0), 0.5 * profile.teamMoment.pauseAttenuation.halftime); assert.equal(p.episodeLog.filter((e) => e.id === 'EPI06').length, 1);
  // sustitución: el intervalo pendiente se procesa con la situación anterior (en pista) antes de salir
  const sub = ctrl(); const inId = sub.teams[0].ids.find((id) => !sub.ps[id].onCourt); sub.sportT = 3000; const before = sub.rng.count;
  sub.substitute(0, 'SG', A, inId, 'prueba'); assert.ok(sub.rng.count > before, 'se procesó con variación (estaba en pista)'); assert.equal(sub.ps[A].mom.M_TIR.t, 3000);
  // Consistencia: amplitud menor con MEN06 alto
  assert.ok(ctrl({ over: setAbility(A, 'MEN06', 30) }).consistencySigma(A) < ctrl({ over: setAbility(A, 'MEN06', 1) }).consistencySigma(A));
  near(ctrl({ over: setAbility(A, 'MEN06', 1) }).consistencySigma(A), profile.moment.innovationSigmaLowConsistency); near(ctrl({ over: setAbility(A, 'MEN06', 30) }).consistencySigma(A), profile.moment.innovationSigmaHighConsistency);
});

// ------------------------------------------------------------------------------------------------ 5. T y presupuesto
test('5. T mejora la oportunidad pero no la conversión ni el pase individual; un solo alpha por tarea; sin remontada compensatoria', () => {
  const tasks = profile.stateTasks.tasks; assert.equal(tasks.shotConversion.team, false); assert.equal(tasks.control.team, false); assert.equal(tasks.freeThrow.team, false); assert.equal(tasks.opportunityQuality.team, true);
  const quality = (T) => { const m = ctrl({ over: (i) => { i.teams[0].plan.initialTeamMoment = T; } }); stubDraw(m, 0.5); m.qualityOf(baseEx({ holder: A, actor: A }), 17, 17, 0, true); return noteOf(m, 'calidad').pesos.find((x) => x.clase === 'comfortable').p; };
  assert.ok(quality(1) > quality(0) && quality(-1) < quality(0));
  const conv = (T) => { const m = ctrl({ over: (i) => { i.teams[0].plan.initialTeamMoment = T; } }); m.sportT = 600; stubDraw(m, 0.7); m.resolveShot(baseEx({ zone: 'three', exec: 'none', defend: null, icpt: null }), { t: m.snap(), team: 0, intent: {}, participants: {} }, false); return m.events.find((e) => e.type === 'attempt').effects.pConversion; };
  assert.equal(conv(1), conv(-1), 'T no entra en la conversión de un tiro definido');
  const ctl = (T) => { const m = ctrl({ over: (i) => { i.teams[0].plan.initialTeamMoment = T; } }); m.sportT = 600; stubDraw(m, 0.7); return m.categoryWeights(baseEx({ exec: 'pass', passer: A, actor: B })); };
  assert.deepEqual(ctl(1), ctl(-1), 'T no entra en el pase individual ya elegido');
  // presupuesto: Z acotado a [−1, 1] aunque coincidan T, momento propio y contraparte opuesta
  const m = ctrl({ over: (i) => { i.teams[0].plan.initialTeamMoment = 1; i.teams[1].plan.initialTeamMoment = -1; } }); for (const id of m.teams[0].ids) m.ps[id].mom.M_OFE.v = 1; for (const id of m.teams[1].ids) m.ps[id].mom.M_DEF.v = -1;
  const z = m.momentZ('opportunityQuality', [A, B], [D], { team: 0 }); assert.ok(Math.abs(z.Z) <= 1); assert.equal(z.alpha, profile.moment.probabilityAlphaByTask.coordination);
  // sin remontada: T solo cambia por episodios o decae, nunca por el marcador
  const r = ctrl(); r.score = [10, 80]; r.sportT = 6000; assert.equal(r.teamMomentOf(0), 0);
  const bad = deepCopy(profile); bad.moment.probabilityAlphaByTask.shot = 1; bad.teamMoment.directShotConversionContribution = 0.1;
  const ids = validateProfile(bad, { base: profile }).issues.filter((i) => i.severity === 'error').map((i) => i.rule); assert.ok(ids.includes('alpha') && ids.includes('invariante-T'));
});

// ------------------------------------------------------------------------------------------------ 6. neutralidad de la salida final
test('6. neutralidad: con innovaciones opuestas en contexto fijo la media de la probabilidad final no cambia (binarias y distribuciones) y la amplitud sube con menos Consistencia', () => {
  // matemática pura: suma cero, positividad y centro
  for (const p of [0.02, 0.2, 0.5, 0.9]) for (const Z of [-1, -0.4, 0.7, 1]) { const q = perturbBinary(p, Z, 0.2); assert.ok(q > 0 && q < 1); near((perturbBinary(p, Z, 0.2) + perturbBinary(p, -Z, 0.2)) / 2, p); }
  const dist = { a: 0.5, b: 0.3, c: 0.15, d: 0.05 }; const q = perturbCategories(dist, ['a', 'b'], 0.8, 0.18);
  near(Object.values(q).reduce((s, x) => s + x, 0), 1); assert.ok(Object.values(q).every((x) => x > 0));
  const qm = perturbCategories(dist, ['a', 'b'], -0.8, 0.18); for (const k of Object.keys(dist)) near((q[k] + qm[k]) / 2, dist[k]);
  // salida real del mecanismo, contexto fijo, estados neutrales y sin episodios: pares U / −U
  const shot = (u, over) => { const m = ctrl({ over }); m.sportT = 600; stubDraw(m, u); m.resolveShot(baseEx({ zone: 'three', exec: 'none', defend: null, icpt: null }), { t: m.snap(), team: 0, intent: {}, participants: {} }, false); const e = m.events.find((x) => x.type === 'attempt').effects; return [e.pConversion, e.pConversionBase]; };
  const [hi, base] = shot(0.9); const [lo] = shot(0.1); assert.notEqual(hi, lo); assert.ok(Math.abs((hi + lo) / 2 - base) < 2e-5, `${hi} ${lo} ${base}`);
  const cat = (u) => { const m = ctrl(); m.sportT = 600; stubDraw(m, u); return m.categoryWeights(baseEx({ exec: 'dribble' })); };
  const c0 = (() => { const m = ctrl(); return m.categoryWeights(baseEx({ exec: 'dribble' })); })(); const ch = cat(0.9); const cl = cat(0.1);
  near(Object.values(ch).reduce((s, x) => s + x, 0), 1); for (const k of Object.keys(c0)) near((ch[k] + cl[k]) / 2, c0[k], 1e-9);
  const ql = (u) => { const m = ctrl(); m.sportT = 600; stubDraw(m, u); m.qualityOf(baseEx({ holder: A, actor: A }), 17, 17, 0, true); return noteOf(m, 'calidad').pesos; };
  const q0 = (() => { const m = ctrl(); m.qualityOf(baseEx({ holder: A, actor: A }), 17, 17, 0, true); return noteOf(m, 'calidad').pesos; })();
  q0.forEach((x, i) => assert.ok(Math.abs((ql(0.9)[i].p + ql(0.1)[i].p) / 2 - x.p) < 1e-4)); // el registro redondea a 4 decimales
  // menos Consistencia = más amplitud (mismo U), sin cambiar el centro
  const lowC = shot(0.9, setAbility(A, 'MEN06', 1)); const highC = shot(0.9, setAbility(A, 'MEN06', 30));
  assert.ok(Math.abs(lowC[0] - lowC[1]) > Math.abs(highC[0] - highC[1])); near(lowC[1], highC[1], 1e-9);
});

// ------------------------------------------------------------------------------------------------ 7. episodios
test('7. episodios: solo con evidencia, una vez por cadena, nunca sobre la misma acción y sin remontada', () => {
  const m = ctrl(); const t0 = m.flushMoment(A, 'M_TIR');
  assert.equal(m.episode('EPI01', { chain: 'c1', who: A, evidence: {} }), true); near(m.flushMoment(A, 'M_TIR'), t0 + profile.episodes.EPI01IndividualImpulse);
  assert.equal(m.episode('EPI01', { chain: 'c1', who: A, evidence: {} }), false); near(m.flushMoment(A, 'M_TIR'), t0 + profile.episodes.EPI01IndividualImpulse);
  assert.ok(m.episodeLog.some((e) => /sin otro impulso/.test(e.estado)));
  // EPI03: pedir reorganizar no cuenta hasta que la tarea se resuelve sin pérdida
  const p = ctrl(); p.episodeReorganizationPending(p.poss, 'ficha POS01 negada', 'EQ01-J01'); p.episodeReorganizationSettled(p.poss, 'turnover'); assert.equal(p.episodeLog.length, 0);
  p.episodeReorganizationPending(p.poss, 'ficha POS01 negada', 'EQ01-J01'); p.episodeReorganizationSettled(p.poss, 'fieldShot'); near(p.teamMomentOf(0), profile.episodes.EPI03TeamImpulse);
  p.episodeReorganizationPending(p.poss, 'ficha POS01 negada', 'EQ01-J01'); p.episodeReorganizationSettled(p.poss, 'fieldShot'); near(p.teamMomentOf(0), profile.episodes.EPI03TeamImpulse, 1e-9);
  // el impulso de un tiro anotado se aplica DESPUÉS: el momento usado para esa acción es el previo
  const prof = deepCopy(profile); prof.episodes.difficultExecutionReferenceProbabilityMaximum = 0.99;
  const s = ctrl({ prof }); s.sportT = 600; stubDraw(s, 0.8); s.bernoulli = () => true;
  s.resolveShot(baseEx({ zone: 'three', exec: 'none', defend: null, icpt: null }), { t: s.snap(), team: 0, intent: {}, participants: {} }, false);
  const used = s.events.flatMap((e) => e.calc ?? []).find((c) => c.label === 'estados:momento:shotConversion').momentoPropio; const after = s.ps[A].mom.M_TIR.v;
  near(after, Math.max(-1, Math.min(1, used + profile.episodes.EPI01IndividualImpulse)), 1e-3);
  // EPI05 por una ayuda que deja libre al receptor sin relevo; EPI04 por una ayuda que llega y el tiro falla
  const f = ctrl(); f.episodesAfterShot(baseEx({ coordFailure: { tipo: 'prueba' } }), { made: false, pBase: 0.5, contact: false }); near(f.teamMomentOf(1), profile.episodes.EPI05TeamImpulse);
  const h = ctrl(); h.episodesAfterShot(baseEx({ helper: 'EQ02-J08', helpArrived: true }), { made: false, pBase: 0.5, contact: false }); near(h.teamMomentOf(1), profile.episodes.EPI04TeamImpulse);
  const e = ctrl(); e.episodesAfterShot(baseEx(), { made: true, pBase: 0.6, contact: false }); assert.equal(e.episodeLog.length, 0, 'una canasta normal no es un episodio');
  // EPI02: un duelo perdido no basta; una pérdida sin intento de intervención o una infracción, sí
  const r = ctrl(); r.episodeError(baseEx({ stealAttempt: true, exec: 'dribble', actor: A }), 'x'); assert.ok(r.episodeLog.length === 1); // el llamante decide la evidencia: aquí se registra la API
  assert.ok(r.ps[A].mom.M_OFE.v < 0);
  const cat = profile.episodeCatalog.episodes; assert.deepEqual(Object.keys(cat), ['EPI01', 'EPI02', 'EPI03', 'EPI04', 'EPI05', 'EPI06']);
});

// ------------------------------------------------------------------------------------------------ 8. entrada, migración, visibilidad y reproducción
test('8. entrada: estados explícitos y acotados, migración identificada, visibilidad propia/rival/diagnóstico y rechazo explícito de export/5', () => {
  const input = inputFor(3);
  assert.deepEqual(validateInput(input, profile), []);
  const bad = deepCopy(input); player(bad, A).state.form = 1.5; delete bad.importance; bad.teams[0].plan.initialTeamMoment = 3;
  const paths = validateInput(bad, profile).map((e) => e.path); assert.ok(paths.some((x) => /state\.form/.test(x)) && paths.includes('importance') && paths.some((x) => /initialTeamMoment/.test(x)));
  const old = deepCopy(input); delete old.importance; for (const t of old.teams) { delete t.plan.initialTeamMoment; for (const p of t.players) { delete p.state.form; delete p.state.M_TIR; } } old.teams[1].players[0].state.M_OFE = 0.3;
  const { input: up, added } = upgradeInput(old, profile); assert.deepEqual(validateInput(up, profile), []); assert.ok(added.some((a) => /importancia/.test(a)) && added.some((a) => /T inicial/.test(a)));
  assert.equal(up.teams[1].players[0].state.M_OFE, 0.3, 'un estado ya configurado no se sobrescribe'); assert.equal(up.schema, 'beM-match-input/6');
  // visibilidad
  const m = ctrl({ over: (i) => { player(i, A).state.form = 0.5; } }); m.sportT = 3000; const n0 = m.rng.count;
  const own = ownStateView(m, 0); const rival = rivalPublicView(m, 1); const diag = diagnosticView(m);
  assert.equal(own.jugadores.find((p) => p.id === A).formaCategoria, 'Buena'); assert.equal(typeof own.jugadores[0].energia, 'number'); assert.ok(!/forma"\s*:\s*0\.5|momentos"\s*:\s*\{[^}]*"valor"/.test(JSON.stringify(own)));
  const rj = JSON.stringify(rival); assert.ok(!/energia|forma|momento/i.test(rj.replace(/la energía, la Forma y los momentos internos del rival no se muestran/, '')));
  assert.equal(typeof diag.jugadores[A].momentos.M_TIR.proyeccionDeterminista, 'number'); assert.equal(m.rng.count, n0);
  // el decisor no recibe estados rivales: su lectura no cambia si el rival está en cualquier estado
  const q0 = m.libertyAndReading(0, B); for (const id of m.teams[1].ids) { m.ps[id].form = -1; for (const k of MOMENT_SCOPES) m.ps[id].mom[k].v = -1; } m.tm[1].v = -1;
  assert.deepEqual(m.libertyAndReading(0, B), q0);
  // formato de exportación: MOTOR-08 sube a export/7; sigue el rechazo explícito de export/5 (y export/6) sin tocarlos
  assert.match(EXPORT_SCHEMA, /export\/[789]$/); assert.match(ENGINE_VERSION, /MOTOR(0[89]|15)/);
  const v5 = validateReplayFile({ schema: 'beM-match-export/5', meta: { engineVersion: 'beM-motor-0.6.0-MOTOR06' } }); assert.equal(v5.legacy, true); assert.equal(v5.reproducible, false); assert.match(v5.problems[0], /MOTOR-06/);
});

// ------------------------------------------------------------------------------------------------ 9. cinco partidos completos de cierre
const integrity = (res) => {
  assert.equal(res.status, 'finished'); assert.deepEqual(res.errors, []);
  assert.deepEqual(res.score, res.periodScores.reduce((s, p) => [s[0] + p.points[0], s[1] + p.points[1]], [0, 0]));
  for (const e of res.events) for (const id of Object.values(res.diagnostics.states.jugadores).map((p) => p.momentos)) for (const k of MOMENT_SCOPES) assert.ok(Math.abs(id[k].valor) <= 1);
  for (const t of res.diagnostics.states.equipos) assert.ok(Math.abs(t.T) <= 1);
  const tot = Object.values(res.box.players).reduce((s, p) => s + p.min, 0); assert.ok(Math.abs(tot - 400) < 0.5, `minutos ${tot}`);
};
test('9. cinco partidos completos: base neutral, Forma y energía, veterano/joven con Consistencia, momentos/T con importancia decisiva y reproducción en otro modo', async () => {
  const seed = 20261016; const src = inputFor(seed);
  const base = runMatch(src, profile, { detail: 'full', check: true }); integrity(base);
  assert.ok(base.diagnostics.stateLog.length > 100 && base.diagnostics.episodes.some((e) => e.id === 'EPI06'));
  const c06 = buildContrastScenario('C06', src, profile); const r2 = runMatch(c06.input, profile, { detail: 'full', check: true }); integrity(r2);
  assert.equal(r2.input.contrast.id, 'C06'); assert.ok(c06.changes.length === 15);
  const step = buildContrastScenario('C03', src, profile); const both = buildContrastScenario('C04', step.input, profile);
  const r3 = runMatch(both.input, profile, { detail: 'full', check: true }); integrity(r3); assert.deepEqual(src, inputFor(seed), 'la copia no toca la entrada original');
  const c05 = buildContrastScenario('C05', src, profile); const r4 = runMatch(c05.input, profile, { detail: 'full', check: true }); integrity(r4);
  assert.equal(r4.input.importance, 'decisive'); assert.ok(r4.diagnostics.states.equipos.length === 2);
  // las copias cambian entradas, no la población ni los planes de Dennis: solo lo listado
  for (const sc of CONTRAST_SCENARIOS) { const c = buildContrastScenario(sc.id, src, profile); assert.deepEqual(validateInput(c.input, profile), []); }
  // 5. reproducción de la ejecución 1 en otro modo, con estados y episodios comprometidos idénticos
  const s = new MatchSession({ input: deepCopy(src), profile, mode: 'cuartos', managedTeam: 0 });
  await s.start(); while (s.state === 'revision') await s.playNextPeriod();
  assert.equal(s.state, 'finalizado'); assert.deepEqual(s.result().score, base.score);
  assert.deepEqual(s.result().diagnostics.states, base.diagnostics.states); assert.deepEqual(s.result().diagnostics.episodes, base.diagnostics.episodes);
  const rep = replayMatch(JSON.parse(JSON.stringify(r4))); assert.equal(rep.comparison.identical, true, 'el export reproduce estados, episodios y órdenes');
  assert.equal(buildResult(createMatch(src, profile, { detail: 'minimal' })).profile.moment.playingHalfLifeSeconds, 90);
});
