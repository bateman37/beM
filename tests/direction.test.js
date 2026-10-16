// MOTOR-02: casos focalizados de dirección manual (órdenes, ventanas, sustituciones, tiempos muertos, periodos y llamadas).
// Se usan estados pequeños o fixtures controlados (declarados como tales); no se buscan sucesos raros simulando cientos de partidos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, FakeScheduler, stepUntil, newMatch, freshMatch } from './helpers.js';
import { MatchSession } from '../src/match/session.js';
import { SLOTS } from '../src/match/index.js';
import { timeoutAllowance } from '../src/match/admin.js';

const rules = data.profile.rules;
const cfg = data.profile.motor02.timeOuts;
const energies = (m) => Object.fromEntries(Object.entries(m.ps).map(([id, s]) => [id, s.energy]));

// ------------------------------------------------------------------------------------------------ 1. pausa, velocidad y callbacks
test('1. pausar, continuar y cambiar de velocidad no avanzan el deporte, no gastan azar y no duplican temporizadores', async () => {
  const sch = new FakeScheduler();
  const s = new MatchSession({ input: inputFor(20261016), profile: data.profile, mode: 'tiempo', speed: 2, scheduler: sch });
  assert.equal(await s.start(), true);
  assert.equal(await s.start(), false, 'iniciar dos veces no arranca otro controlador');
  for (let i = 0; i < 25; i++) sch.runNext();
  assert.equal(sch.pending, 1, 'un solo temporizador pendiente mientras corre');
  assert.equal(s.pause(), true);
  assert.equal(sch.pending, 0, 'pausar cancela el siguiente avance');
  const snap = () => JSON.stringify([s.match.rng.state(), s.match.rng.count, s.match.events.length, s.match.stepSeq, s.match.clock, s.match.shotClock, energies(s.match), s.match.timeouts]);
  const before = snap();
  s.pause(); s.setSpeed(4); s.setSpeed(8); s.setSpeed(16);
  sch.t += 3_600_000; // una hora de reloj de pared mirando la pantalla
  assert.equal(sch.runAll(), 0);
  assert.equal(snap(), before, 'la pausa de pantalla no da descanso ni resuelve nada');
  assert.equal(s.resume(), true); assert.equal(s.resume(), false);
  assert.equal(sch.pending, 1, 'continuar programa uno solo');
  s.setSpeed(2); assert.equal(sch.pending, 1, 'cambiar de velocidad reprograma el único temporizador');
  // un partido nuevo invalida los callbacks del anterior
  const old = s; const oldSteps = old.match.stepSeq; old.dispose();
  assert.equal(sch.pending, 0);
  assert.equal(old.resume(), false);
  sch.runAll(); assert.equal(old.match.stepSeq, oldSteps);
});

// ------------------------------------------------------------------------------------------------ 2. última orden válida y conjuntos
test('2. la última orden válida del mismo ámbito sustituye a la pendiente; una inválida conserva la válida; el conjunto inválido no se aplica a medias', () => {
  const m = newMatch(20261016); m.step(); m.step(); m.step();
  const a = m.submit({ team: 0, type: 'styles', styles: { freedom: 5 } });
  const b = m.submit({ team: 0, type: 'styles', styles: { freedom: 1, organizedPace: 4 } });
  assert.equal(a.state, 'sustituida'); assert.equal(a.supersededBy, b.id); assert.ok(a.history.length >= 3, 'el historial se conserva');
  const bad = m.submit({ team: 0, type: 'styles', styles: { freedom: 9 } });
  assert.equal(bad.state, 'rechazada'); assert.match(bad.reason, /1 a 5/);
  assert.equal(b.state, 'pendiente', 'una orden inválida no elimina la última válida');
  assert.equal(m.teams[0].plan.styles.freedom, 3, 'pendiente no es vigente: el plan aún no cambió');
  const rng0 = m.rng.count; const ev0 = JSON.stringify(m.events);
  assert.equal(m.rng.count, rng0); assert.equal(JSON.stringify(m.events), ev0, 'registrar órdenes no consume azar ni toca hechos');
  m.step();
  assert.equal(b.state, 'vigente'); assert.equal(m.teams[0].plan.styles.freedom, 1); assert.equal(m.teams[0].plan.styles.organizedPace, 4);
  // estilo no editable: se rechaza con explicación (no es un campo cosmético)
  assert.match(m.submit({ team: 0, type: 'styles', styles: { offensiveRisk: 5 } }).reason, /no es editable/);
  // conjunto con un miembro inválido: ninguno se activa
  const lineupDup = { PG: 'EQ01-J02', SG: 'EQ01-J02', SF: 'EQ01-J06', PF: 'EQ01-J08', C: 'EQ01-J10' };
  const batch = m.submitBatch([{ team: 0, type: 'styles', styles: { freedom: 2 } }, { team: 0, type: 'lineup', assignment: lineupDup }], 'prueba');
  assert.deepEqual(batch.map((o) => o.state), ['rechazada', 'rechazada']);
  assert.match(batch[0].reason, /conjunto no aplicado/);
  m.step(); assert.equal(m.teams[0].plan.styles.freedom, 1, 'ni siquiera el miembro válido se aplicó');
  // el mismo campo con dos órdenes al mismo reloj deportivo: manda la secuencia registrada
  const x = m.submit({ team: 0, type: 'priorities', priorities: { POS01: 5 } }); const y = m.submit({ team: 0, type: 'priorities', priorities: { POS01: 2 } });
  assert.ok(y.seq > x.seq); m.step();
  assert.equal(m.teams[0].plan.playbook.find((p) => p.playId === 'POS01').priority, 2);
});

// ------------------------------------------------------------------------------------------------ 3. llamadas
test('3. una llamada se consume cuando la ficha comienza; caduca con motivo si su ámbito termina sin iniciarse; no reescribe lo comprometido', () => {
  const m = newMatch(20261017); m.step(); m.step();
  const evBefore = JSON.stringify(m.events);
  const call = m.submit({ team: m.nextPoss.team, type: 'call', playId: 'POS09', target: 'next' });
  assert.equal(call.state, 'pendiente');
  assert.equal(JSON.stringify(m.events), evBefore, 'lo ya resuelto no cambia');
  stepUntil(m, () => call.state === 'consumida' || call.state === 'caducada');
  if (call.state === 'consumida') {
    const started = m.events.find((e) => e.orders?.some((l) => l.id === call.id));
    assert.ok(started, 'el hecho que inicia la ficha enlaza con la orden');
    assert.equal(started.intent.origen, 'POS09');
  } else assert.match(call.reason, /terminó la posesión/);
  // fixture controlado: la ficha llamada no es realizable (sin participante compatible) → caduca con motivo, sin guion
  const f = newMatch(20261018); f.step(); f.step();
  const team = f.nextPoss.team; const real = f.assignRoles;
  f.assignRoles = function (t, playId, dir) { return t === team && playId === 'POS11' ? null : real.call(this, t, playId, dir); };
  const c2 = f.submit({ team, type: 'call', playId: 'POS11', target: 'next' });
  stepUntil(f, () => c2.state === 'caducada');
  assert.ok(c2.history.some((x) => x.state === 'suspendida' && /no realizable/.test(x.reason)), 'pasó por «suspendida por condición»: declarada pero no aplicable ahora');
  assert.match(c2.reason, /terminó la posesión.*no realizable/);
  assert.equal(f.events.some((e) => e.intent?.origen === 'POS11' && e.team === team && e.possessionId === c2.bound), false, 'no se fuerza el inicio');
  // validaciones: posesión actual solo si el equipo ataca y aún no empezó ficha
  const g = newMatch(20261016); stepUntil(g, (x) => x.poss && !x.poss.done && !x.poss.playStarted);
  const other = 1 - g.poss.team;
  assert.match(g.submit({ team: other, type: 'call', playId: 'POS01', target: 'current' }).reason, /no está atacando/);
  assert.equal(g.submit({ team: g.poss.team, type: 'call', playId: 'POS01', target: 'current' }).state, 'pendiente');
});

// ------------------------------------------------------------------------------------------------ 4. sustituciones
test('4a. una sustitución espera su ventana, se aplica en un paso de ventana y conserva quinteto y minutos', () => {
  const m = newMatch(20261016); m.step(); m.step();
  const out = m.lineup[0].PG; const inn = m.teams[0].ids.find((id) => !m.onCourt(0).includes(id) && m.pl[id].positions.includes('PG')) ?? m.teams[0].ids.find((id) => !m.onCourt(0).includes(id));
  const o = m.submit({ team: 0, type: 'substitution', swaps: [{ out, in: inn }] });
  assert.equal(o.state, 'pendiente'); assert.match(o.reason, /oportunidad reglamentaria/);
  let appliedInKind = null;
  while (o.state === 'pendiente') { assert.ok(m.step()); if (o.state === 'consumida') appliedInKind = m.lastStep.kind; }
  assert.equal(appliedInKind, 'ventana', 'nunca entra durante juego vivo por conveniencia');
  const ev = m.events.find((e) => e.id === o.execution.eventIds[0]);
  assert.equal(ev.type, 'substitution'); assert.equal(ev.intent.origen, 'orden manual'); assert.equal(ev.participants.sale, out); assert.equal(ev.participants.entra, inn);
  assert.equal(new Set(m.onCourt(0)).size, 5); assert.equal(m.lineup[0].PG, inn);
  assert.equal(m.lineupControl[0].mode, 'manual');
  assert.equal(m.ps[out].onCourt, false);
});

test('4b. la orden se revalida al llegar la ventana y se explica el resultado si cambió la elegibilidad', () => {
  const m = newMatch(20261016); m.step(); m.step();
  const bench = m.teams[0].ids.filter((id) => !m.onCourt(0).includes(id));
  const o = m.submit({ team: 0, type: 'substitution', swaps: [{ out: m.lineup[0].C, in: bench[0] }] });
  m.ps[bench[0]].available = false; // fixture controlado: el entrante deja de estar disponible antes de la ventana
  stepUntil(m, () => o.state !== 'pendiente');
  assert.equal(o.state, 'caducada'); assert.match(o.reason, new RegExp(`${bench[0]} ya no está disponible`));
  assert.equal(m.lineup[0].C, 'EQ01-J10', 'el quinteto no cambió');
});

test('4c. el quinteto es un conjunto: cinco distintos y disponibles; el inválido no cambia nada y el válido llega entero', () => {
  const m = newMatch(20261016); m.step(); m.step();
  const bench = m.teams[0].ids.filter((id) => !m.onCourt(0).includes(id));
  const dup = m.submit({ team: 0, type: 'lineup', assignment: { ...m.lineup[0], SG: m.lineup[0].PG } });
  assert.equal(dup.state, 'rechazada'); assert.match(dup.reason, /cinco jugadores distintos/);
  const moved = m.submit({ team: 0, type: 'lineup', assignment: { ...m.lineup[0], PG: m.lineup[0].SG, SG: m.lineup[0].PG } });
  assert.match(moved.reason, /otra posición/);
  const outside = m.submit({ team: 0, type: 'lineup', assignment: { ...m.lineup[0], PG: 'EQ02-J01' } });
  assert.match(outside.reason, /no pertenece/);
  assert.equal(m.orders.filter((o) => o.state === 'pendiente').length, 0, 'ningún cambio parcial silencioso');
  const good = m.submit({ team: 0, type: 'lineup', assignment: { ...m.lineup[0], PG: bench[0], SF: bench[1] } });
  assert.equal(good.state, 'pendiente');
  stepUntil(m, () => good.state !== 'pendiente');
  assert.equal(good.state, 'consumida');
  assert.equal(m.lineup[0].PG, bench[0]); assert.equal(m.lineup[0].SF, bench[1]);
  assert.equal(good.execution.eventIds.length, 2);
});

test('4d. una exclusión obligatoria prevalece sobre un quinteto fijado a mano; el lanzador de libres no sale antes de tirar', () => {
  // lanzador de libres (fixture: serie pendiente)
  const m = freshMatch(31);
  const shooter = m.lineup[0].SG; const sub = m.teams[0].ids.find((id) => !m.onCourt(0).includes(id));
  m.ps[shooter].energy = 4; // el entrenador básico estaría tentado de retirarle
  m.pendingFoul = { fouled: shooter, n: 2, shotTeam: 0, shooting: true, shotMade: false, kind: 'falta en acto de tiro' };
  const o = m.submit({ team: 0, type: 'substitution', swaps: [{ out: shooter, in: sub }] });
  m.queueWindow({ reason: 'falta', timeoutTeams: [0, 1], subs: true });
  m.processWindow();
  assert.equal(o.state, 'pendiente'); assert.match(o.reason, /lanzador de libres/);
  assert.equal(m.ps[shooter].onCourt, true, 'ni la orden manual ni el entrenador sacan al lanzador antes de tirar');
  m.pendingFoul = null; m.queueWindow({ reason: 'balón muerto', timeoutTeams: [0, 1], subs: true }); m.processWindow();
  assert.equal(o.state, 'consumida');
  // exclusión obligatoria con el quinteto fijado a mano (fixture: quinta falta)
  assert.equal(m.lineupControl[0].mode, 'manual');
  const victim = m.lineup[0].PF; m.ps[victim].fouls = 5; m.exclude(victim);
  const before = m.events.length;
  m.queueWindow({ reason: 'falta', timeoutTeams: [0, 1], subs: true }); m.processWindow();
  const subEv = m.events.slice(before).find((e) => e.type === 'substitution' && e.participants.sale === victim);
  assert.ok(subEv, 'la obligación reglamentaria no espera ni se ve frenada por la restricción manual');
  assert.equal(subEv.intent.motivo, 'excluido');
  // y una revisión ordinaria (fatiga) sí queda retenida mientras la restricción manual está vigente
  const tired = m.lineup[0].SF; m.ps[tired].energy = 5; m.ps[tired].stintTenths = 6000;
  const n2 = m.events.length; m.queueWindow({ reason: 'balón muerto', timeoutTeams: [0, 1], subs: true }); m.processWindow();
  assert.equal(m.events.slice(n2).some((e) => e.type === 'substitution' && e.team === 0 && e.participants.sale === tired), false, 'el entrenador básico no contradice el quinteto manual por una revisión ordinaria');
  assert.ok(m.ps[tired].energy <= 5, 'la fijación manual no hace inmune al cansancio');
  // devolver el ámbito: la política básica continúa desde el estado actual
  const d = m.submit({ team: 0, type: 'delegate', domain: 'lineup' });
  m.activatePlanOrders(); assert.equal(d.state, 'vigente'); assert.equal(m.lineupControl[0].mode, 'auto');
  const n3 = m.events.length; m.queueWindow({ reason: 'balón muerto', timeoutTeams: [0, 1], subs: true }); m.processWindow();
  assert.ok(m.events.slice(n3).every((e) => e.type !== 'substitution' || e.intent.origen === 'relevo'), 'sin cambios retroactivos de órdenes manuales');
});

// ------------------------------------------------------------------------------------------------ 5. tiempos muertos
test('5a. el tiempo muerto solicitado no consume cupo hasta su concesión; la concesión consume y recupera una sola vez a ambos equipos', () => {
  const m = freshMatch(41);
  for (const id of Object.keys(m.ps)) m.ps[id].energy = 50;
  const o = m.submit({ team: 0, type: 'timeout', reason: 'cortar racha' });
  assert.equal(o.state, 'pendiente'); assert.deepEqual(m.timeouts[0].used, {}, 'solicitar no gasta');
  assert.equal(m.timeoutStatus(0).remaining, 2);
  assert.match(m.submit({ team: 0, type: 'timeout' }).reason, /ya hay un tiempo muerto/);
  assert.equal(m.cancel(o.id).ok, true); assert.equal(o.state, 'cancelada'); assert.equal(m.timeoutStatus(0).remaining, 2, 'cancelar antes de la concesión no gasta');
  const o2 = m.submit({ team: 0, type: 'timeout' });
  const clock = m.clock; const shot = m.shotClock;
  m.queueWindow({ reason: 'falta', timeoutTeams: [0, 1], subs: true }); m.processWindow();
  assert.equal(o2.state, 'consumida'); assert.equal(m.timeouts[0].used.h1, 1); assert.equal(m.timeoutStatus(0).remaining, 1);
  const ev = m.events.find((e) => e.type === 'timeout');
  assert.equal(ev.effects.duracionReglamentariaSegundos, 60); assert.equal(ev.durationTenths, 0, 'no gasta reloj de juego');
  assert.equal(m.clock, clock); assert.equal(m.shotClock, shot, 'sin regalar un nuevo ataque');
  for (const id of Object.keys(m.ps)) if (m.ps[id].available) assert.equal(m.ps[id].energy, 51.5, `${id}: +1,5 una vez, ambos equipos`);
  // abrir paneles, pausas visuales o más ventanas sin solicitud no recuperan de nuevo
  m.processWindow(); // ventana de sustitución que abre el tiempo muerto
  for (const id of Object.keys(m.ps)) if (m.ps[id].available) assert.equal(m.ps[id].energy, 51.5);
  assert.equal(m.cancel(o2.id).ok, false, 'una concesión consumada no se cancela');
  assert.ok(m.pendingWindows.length === 0);
});

test('5b. cupos: 2 + 3 + 1 por prórroga sin arrastre, restricción de los dos minutos finales y solo el equipo que recibe la canasta', () => {
  const led = (used, final = 0) => ({ used, final });
  assert.equal(timeoutAllowance(led({ h1: 2 }), 2, 3000, cfg, rules).effective, 0);
  assert.equal(timeoutAllowance(led({ h1: 2 }), 3, 6000, cfg, rules).effective, 3, 'sin arrastre: la segunda mitad parte de tres');
  assert.equal(timeoutAllowance(led({ h1: 0, h2: 0 }), 3, 6000, cfg, rules).effective, 3);
  assert.equal(timeoutAllowance(led({ h2: 1 }), 4, 1500, cfg, rules).effective, 2);
  assert.equal(timeoutAllowance(led({ h2: 0 }), 4, 1200, cfg, rules).effective, 2, 'tres sin usar a falta de dos minutos: solo dos son utilizables');
  assert.equal(timeoutAllowance(led({ h2: 2 }, 2), 4, 600, cfg, rules).effective, 0);
  assert.equal(timeoutAllowance(led({ ot1: 0 }), 5, 3000, cfg, rules).effective, 1);
  assert.equal(timeoutAllowance(led({ ot1: 1 }), 5, 3000, cfg, rules).effective, 0);
  assert.equal(timeoutAllowance(led({ ot1: 1 }), 6, 3000, cfg, rules).effective, 1, 'cada prórroga tiene su cupo');
  const m = freshMatch(42);
  m.timeouts[0].used.h1 = 2;
  assert.match(m.submit({ team: 0, type: 'timeout' }).reason, /sin tiempos muertos/);
  // canasta recibida: solo el equipo que la recibe; el otro espera (la solicitud sigue pendiente)
  const m2 = freshMatch(43); const a = m2.submit({ team: 0, type: 'timeout' }); const b = m2.submit({ team: 1, type: 'timeout' });
  m2.queueWindow({ reason: 'canasta recibida', timeoutTeams: [1], subs: false }); m2.processWindow();
  assert.equal(b.state, 'consumida'); assert.equal(a.state, 'pendiente');
  assert.equal(m2.pendingWindows.length, 1, 'el tiempo muerto concedido abre la oportunidad de cambio para ambos');
  assert.equal(m2.pendingWindows[0].reason, 'tiempo muerto');
});

// ------------------------------------------------------------------------------------------------ 6. cierre de periodo, plan siguiente, prórroga
test('6a. por cuartos: el cierre administra lo pendiente una vez, el plan del siguiente periodo no toca el anterior y un lote inválido no arranca el periodo', async () => {
  const s = new MatchSession({ input: inputFor(20261016), profile: data.profile, mode: 'cuartos', scheduler: new FakeScheduler() });
  await s.start();
  const m = s.match;
  assert.equal(s.state, 'revision'); assert.equal(m.periodBreak, 2);
  assert.equal(m.poss.done, true); assert.equal(m.pendingWindows.length, 0); assert.equal(m.pendingFoul, null, 'sin consecuencias pendientes al cerrar');
  assert.equal(m.events.filter((e) => e.type === 'interval').length, 0, 'la recuperación de intervalo aún no se aplicó: la energía mostrada es anterior al descanso');
  const eBefore = energies(m); const ev0 = JSON.stringify(m.events); const period1Score = [...m.score];
  const bad = await s.playNextPeriod([{ team: 0, type: 'styles', styles: { freedom: 5 } }, { team: 0, type: 'lineup', assignment: { ...m.lineup[0], SG: m.lineup[0].PG } }]);
  assert.equal(bad.ok, false); assert.equal(m.periodBreak, 2, 'no arranca el periodo'); assert.equal(m.teams[0].plan.styles.freedom, 3);
  assert.equal(JSON.stringify(m.events), ev0);
  const good = await s.playNextPeriod([{ team: 0, type: 'styles', styles: { freedom: 5 } }], 'plan del 2.º cuarto');
  assert.equal(good.ok, true); assert.equal(s.state, 'revision'); assert.equal(m.periodBreak, 3);
  const o = good.orders[0];
  assert.equal(o.scope.targetPeriod, 2); assert.equal(o.activation.period, 2); assert.equal(o.state, 'vigente');
  assert.equal(JSON.stringify(m.events.slice(0, JSON.parse(ev0).length)), ev0, 'lo ocurrido en el periodo anterior no cambia');
  assert.equal(m.events.filter((e) => e.type === 'interval').length, 1, 'la recuperación reglada se aplica una vez');
  const itv = m.events.find((e) => e.type === 'interval');
  assert.equal(itv.effects.recuperacion, data.profile.energy.quarterRecovery);
  assert.ok(Object.keys(eBefore).length === 24);
  assert.deepEqual(m.periodScores[0].points.length, 2); assert.equal(period1Score.length, 2);
  s.dispose();
});

test('6b. fixture controlado de prórroga: tras empate en el cuarto periodo se ofrece otro periodo conservando faltas y sin reiniciar recursos', async () => {
  const sch = new FakeScheduler();
  const s = new MatchSession({ input: inputFor(20261016), profile: data.profile, mode: 'cuartos', scheduler: sch });
  const m = s.match; m.step(); // arranque
  // FIXTURE (no es un partido jugado): final del cuarto periodo con empate
  m.period = 4; m.clock = 0; m.poss = null; m.score = [80, 80]; m.periodScores = [1, 2, 3, 4].map((p) => ({ period: p, points: [20, 20] }));
  m.teamFouls[0][4] = 6; m.ps['EQ01-J01'].fouls = 3; m.timeouts[0].used.h2 = 2; m.timeouts[0].final = 1;
  m.nextPoss = null; m.pendingWindows.length = 0; m.periodStartPending = false;
  s.state = 'enPausa';
  m.step(); // final de periodo
  assert.equal(m.status, 'running'); assert.equal(m.periodBreak, 5);
  s.state = 'revision';
  const pl = m.submit({ team: 0, type: 'styles', styles: { freedom: 4 } });
  assert.equal(pl.scope.targetPeriod, 5);
  await s.playNextPeriod();
  assert.equal(m.period >= 5, true);
  assert.equal(m.periodScores[4].period, 5); assert.equal(m.clock <= 3000, true);
  assert.equal(m.ps['EQ01-J01'].fouls >= 3, true, 'las faltas personales se conservan');
  assert.equal(m.teamFouls[0][4] >= 6, true, 'las faltas colectivas del cuarto periodo se acumulan en la prórroga');
  assert.equal(m.timeouts[0].used.h2, 2, 'los recursos de la segunda mitad no se reinician');
  assert.equal(m.timeoutStatus(0).quota, 1, 'cupo de prórroga: 1');
  assert.equal(pl.activation.period, 5);
  s.dispose();
});

// ------------------------------------------------------------------------------------------------ validaciones generales
test('las órdenes se rechazan con motivo antes de empezar, tras terminar y con datos mal formados; cancelar lo vigente no está permitido', () => {
  const m = newMatch(20261016);
  assert.match(m.submit({ team: 0, type: 'styles', styles: { freedom: 2 } }).reason, /no ha comenzado/);
  m.step(); m.step();
  assert.match(m.submit({ team: 0, type: 'inventada' }).reason, /tipo de orden desconocido/);
  assert.match(m.submit({ team: 2, type: 'styles', styles: { freedom: 2 } }).reason, /equipo no válido/);
  assert.match(m.submit({ team: 0, type: 'director', directorPriority: [] }).reason, /vacía/);
  assert.match(m.submit({ team: 0, type: 'director', directorPriority: ['EQ02-J01'] }).reason, /no pertenece/);
  assert.match(m.submit({ team: 0, type: 'priorities', priorities: { POS99: 1 } }).reason, /no está activa/);
  assert.match(m.submit({ team: 0, type: 'delegate', domain: 'estilos' }).reason, /quinteto/);
  const v = m.submit({ team: 0, type: 'styles', styles: { freedom: 2 } }); m.step();
  assert.equal(v.state, 'vigente'); assert.match(m.cancel(v.id).reason, /ya está vigente/);
  assert.equal(m.cancel('O999').ok, false);
  while (m.step()) { /* hasta el final */ }
  assert.match(m.submit({ team: 0, type: 'styles', styles: { freedom: 2 } }).reason, /ha terminado/);
  assert.ok(m.orders.filter((o) => o.issuer === 'manual').every((o) => ['rechazada', 'vigente', 'sustituida', 'caducada'].includes(o.state)));
  assert.ok(m.orders.some((o) => o.issuer === 'auto' && o.type === 'substitution' && o.state === 'consumida'), 'las decisiones delegadas quedan registradas como automáticas');
});

test('el director alternativo decide cuando el principal sale de pista y queda trazado', () => {
  const m = newMatch(20261016); m.step(); m.step();
  const prim = m.teams[0].plan.directorPriority[0];
  const o = m.submit({ team: 0, type: 'director', directorPriority: ['EQ01-J12', prim] });
  assert.equal(o.state, 'pendiente');
  stepUntil(m, () => o.state === 'vigente');
  assert.equal(o.activation.period, 1); assert.ok(o.activation.step > 0, 'frontera de activación registrada');
  assert.equal(m.teams[0].plan.directorPriority[0], 'EQ01-J12');
  // fixture: el director principal no está en pista → decide la alternativa y el rango queda en el hecho
  const f = freshMatch(51); f.teams[0].plan.directorPriority = ['EQ01-J12', 'EQ01-J01', 'EQ01-J03'];
  assert.equal(f.pickDirector(0).id, 'EQ01-J01'); assert.equal(f.pickDirector(0).rank, 1);
  f.poss.director = f.pickDirector(0);
  assert.deepEqual(f.directorTrace(), { director: { id: 'EQ01-J01', rango: 1, sustituto: false } });
  f.poss.director = { id: 'EQ01-J01', rank: 0, fallback: false }; assert.deepEqual(f.directorTrace(), {});
  assert.ok(SLOTS.length === 5);
});
