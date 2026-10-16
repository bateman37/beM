// Reglas compartidas críticas, con casos controlados sobre el mismo núcleo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { freshMatch, baseEx } from './helpers.js';
import { clockStopsAfterGoal, foulPeriodKey, freeThrowsForShootingFoul, inPenalty, shotClockAfterRingContact } from '../src/match/rules.js';
import { data } from './helpers.js';

const rules = data.profile.rules;

test('funciones reglamentarias puras: libres por falta de tiro, penalización, prórroga y parada del reloj', () => {
  assert.equal(freeThrowsForShootingFoul(3, false), 3);
  assert.equal(freeThrowsForShootingFoul(2, false), 2);
  assert.equal(freeThrowsForShootingFoul(3, true), 1);
  assert.equal(inPenalty(3, rules), false); assert.equal(inPenalty(4, rules), true);
  assert.equal(foulPeriodKey(5, rules), 4); assert.equal(foulPeriodKey(2, rules), 2);
  assert.equal(clockStopsAfterGoal(4, 1200, rules), true); assert.equal(clockStopsAfterGoal(4, 1201, rules), false);
  assert.equal(clockStopsAfterGoal(2, 100, rules), false); assert.equal(clockStopsAfterGoal(5, 600, rules), true);
  assert.equal(shotClockAfterRingContact(80, rules), 140); assert.equal(shotClockAfterRingContact(200, rules), 200);
});

test('serie de libres ligada a una falta de tiro: quinta falta, exclusión y sustitución legal antes del primer libre', () => {
  const m = freshMatch(11);
  m.ps['EQ02-J11'].fouls = 4;
  const ex = baseEx({ zone: 'three', defend: 'EQ02-J11', icpt: 'EQ02-J11' });
  const before = m.events.length;
  m.foulAdmin('EQ02-J11', 'EQ01-J03', { shooting: true, ftCount: 3, shotTeam: 0, shotMade: false, shotPoints: 3 });
  while (m.pendingWindows.length) m.processWindow(); // la ventana de la falta es una frontera propia (MOTOR-02), previa a los libres
  m.shootFreeThrows('EQ01-J03', 3, m.pendingFoul, ex);
  const evs = m.events.slice(before).filter((e) => ['foul', 'substitution', 'free_throw'].includes(e.type) || e.type === 'rebound');
  const types = evs.map((e) => e.type);
  assert.equal(types[0], 'foul');
  assert.equal(evs[0].effects.excluido, true);
  assert.equal(evs[0].effects.tirosLibres, 3);
  assert.equal(m.ps['EQ02-J11'].fouls, 5);
  assert.equal(m.ps['EQ02-J11'].available, false);
  const sub = evs.find((e) => e.type === 'substitution');
  assert.ok(sub, 'sustitución obligatoria');
  assert.equal(sub.participants.sale, 'EQ02-J11');
  assert.ok(types.indexOf('substitution') < types.indexOf('free_throw'), 'el relevo ocurre antes del primer libre');
  assert.equal(evs.filter((e) => e.type === 'free_throw').length >= 1, true);
  const fts = evs.filter((e) => e.type === 'free_throw');
  assert.ok(fts.every((e) => e.participants.lanzador === 'EQ01-J03'));
  assert.deepEqual(fts.map((e) => e.intent.serie), ['1/3', '2/3', '3/3'].slice(0, fts.length));
  // no hay sustituciones entre libres de la misma serie
  const firstFt = evs.indexOf(fts[0]); const lastFt = evs.indexOf(fts[fts.length - 1]);
  assert.equal(evs.slice(firstFt, lastFt + 1).some((e) => e.type === 'substitution'), false);
  // quinteto válido: cinco distintos, ninguno excluido
  const on = m.onCourt(1);
  assert.equal(new Set(on).size, 5); assert.equal(on.includes('EQ02-J11'), false);
  assert.ok(m.pl[sub.participants.entra]);
});

test('bonus: la falta tras cuatro colectivas da dos libres; antes, solo saque', () => {
  const m = freshMatch(12);
  const key = foulPeriodKey(m.period, rules);
  m.teamFouls[1][key] = 3;
  m.foulAdmin('EQ02-J01', 'EQ01-J01', { shooting: false, shotTeam: 0 });
  assert.equal(m.pendingFoul.n, 0);
  m.pendingFoul = null;
  m.foulAdmin('EQ02-J02', 'EQ01-J01', { shooting: false, shotTeam: 0 });
  assert.equal(m.pendingFoul.n, 2);
  assert.equal(m.teamFouls[1][key], 5);
});

test('rebote ofensivo conserva la posesión y el reloj: un solo descuento de tiempo y 14 s si quedaban menos', () => {
  const m = freshMatch(13);
  m.shotClock = 60; m.clock = 3000;
  const possId = m.poss.id; const clock0 = m.clock;
  m.bernoulli = (p, purpose) => purpose === 'rebote:equipo'; // fuerza rebote ofensivo; el resto del flujo es el real
  const res = m.afterMiss(baseEx({ zone: 'rim', actor: 'EQ01-J03' }), 'rim');
  assert.equal(res.cont, 'oreb');
  assert.equal(m.poss.id, possId, 'misma posesión');
  assert.equal(m.poss.team, 0);
  const reb = m.events.find((e) => e.type === 'rebound');
  assert.equal(reb.effects.ofensivo, true);
  assert.equal(m.clock, clock0 - reb.durationTenths, 'el tiempo del rebote se descuenta una sola vez');
  assert.equal(m.shotClock, 140, 'reajuste a 14 s tras contacto de aro con menos de 14 s');
  assert.equal(m.poss.disorganized, true, 'la desorganización defensiva no se borra gratis');
  assert.ok(m.poss.oreb, 'queda pendiente la decisión de continuación');
  assert.equal(m.nextPoss ?? null, m.nextPoss, 'no se crea una posesión nueva');
});

test('un hecho no producido antes de la bocina no se concede: ni tiro, ni puntos, ni rebote', () => {
  const m = freshMatch(14);
  m.clock = 1; // una décima
  const score0 = [...m.score];
  m.categoryWeights = () => ({ fieldShot: 1 });
  const res = m.resolveAttempt(baseEx());
  assert.equal(res.end, 'periodEnd');
  assert.deepEqual(m.score, score0);
  assert.equal(m.clock, 0);
  const last = m.events[m.events.length - 1];
  assert.equal(last.type, 'expiry');
  assert.equal(m.events.some((e) => e.stats.some((s) => s.k === 'shot')), false);
  assert.equal(m.events.some((e) => e.type === 'rebound'), false);
});

test('violación de reloj de posesión: pérdida de equipo, balón muerto y sin tiro concedido', () => {
  const m = freshMatch(15);
  m.shotClock = 1; m.clock = 3000;
  m.categoryWeights = () => ({ fieldShot: 1 });
  const res = m.resolveAttempt(baseEx());
  assert.equal(res.end, 'deadTurnover');
  const last = m.events[m.events.length - 1];
  assert.equal(last.type, 'expiry');
  assert.equal(last.stats[0].k, 'tov');
  assert.equal(m.nextPoss.team, 1);
});
