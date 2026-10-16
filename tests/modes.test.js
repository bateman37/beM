// MOTOR-02: las tres modalidades comparten un solo núcleo; velocidad y pausas son presentación; reproducción desde JSON.
// Seis ejecuciones completas en total (referencia, cuartos, x2, x16, dirigida y su reproducción); las velocidades x4 y x8 se
// comprueban por parametrización del controlador con reloj de presentación controlado (nada espera tiempo real).
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, FakeScheduler } from './helpers.js';
import { MatchSession, PRESENTATION } from '../src/match/session.js';
import { teamTotals, EXPORT_SCHEMA, ENGINE_VERSION } from '../src/match/index.js';
import { sportsProjection, compareProjections, replayMatch, validateReplayFile } from '../src/match/replay.js';

const SEED = 20261016;
const mk = (mode, speed = 2, sch = new FakeScheduler()) => new MatchSession({ input: inputFor(SEED), profile: data.profile, mode, speed, scheduler: sch });
const proj = (s) => sportsProjection(s.result());

test('mismo partido en total, por cuartos sin editar, x2 y x16: mismos hechos, sorteos, acta y estado final', async () => {
  const ref = mk('total');
  await ref.start();
  assert.equal(ref.state, 'finalizado'); assert.ok(ref.match.stepSeq > 300);
  const reference = proj(ref);
  assert.equal(reference.status, 'finished');

  const q = mk('cuartos'); await q.start();
  let revisions = 0;
  while (q.state === 'revision') { revisions += 1; assert.equal((await q.playNextPeriod()).ok, true); }
  assert.equal(q.state, 'finalizado'); assert.ok(revisions >= 3, 'se detiene al cerrar cada periodo');
  assert.deepEqual(proj(q), reference, 'por cuartos sin cambios = total');

  const fast = {};
  for (const speed of [2, 16]) {
    const sch = new FakeScheduler(); const s = mk('tiempo', speed, sch);
    await s.start();
    let guard = 0;
    while (s.state !== 'finalizado') { if (!sch.runNext()) throw new Error('sin temporizador'); assert.ok(sch.pending <= 1, 'un solo temporizador'); assert.ok(++guard < 5000); }
    fast[speed] = sch.delays.reduce((a, b) => a + b, 0);
    assert.deepEqual(proj(s), reference, `x${speed} = total`);
    assert.equal(s.result().presentation.mode, 'tiempo');
  }
  assert.ok(fast[2] > fast[16] * 3, 'la espera de presentación escala con la velocidad');
  // los metadatos de presentación no forman parte del deporte
  assert.notDeepEqual(mk('tiempo', 16).result().presentation, ref.result().presentation);
  // el acta concilia con cinco presencias por duración disputada
  const played = ref.match.periodScores.reduce((s, p) => s + (p.period <= 4 ? 10 : 5), 0);
  for (const t of [0, 1]) assert.ok(Math.abs(teamTotals(ref.result().box, ref.result().input, t).min - 5 * played) < 1e-6);
});

test('x4 y x8 por parametrización: la espera entre acontecimientos usa la misma referencia temporal escalada', () => {
  const base = 6000; // 6 s de reloj deportivo resuelto
  const w = (v) => mk('tiempo', v)._wait(base);
  assert.equal(w(2), 3000); assert.equal(w(4), 1500); assert.equal(w(8), 750); assert.equal(w(16), 375);
  assert.equal(mk('tiempo', 2)._wait(0), PRESENTATION.minWaitMs, 'sin duración deportiva: espera mínima de presentación');
  assert.equal(mk('tiempo', 2)._wait(1e9), PRESENTATION.maxWaitMs, 'tope de presentación (no altera duraciones deportivas)');
  const s = mk('tiempo', 2);
  assert.deepEqual(PRESENTATION.speeds, [2, 4, 8, 16]);
  assert.equal(s.setSpeed(3), false, 'solo x2/x4/x8/x16');
  assert.throws(() => mk('inventada'), /modalidad desconocida/);
});

test('dirección determinista (estilo/prioridad, llamada, sustitución, tiempo muerto) y reproducción desde el JSON exportado', async () => {
  const sch = new FakeScheduler(); const s = mk('tiempo', 16, sch);
  const script = {
    30: [{ type: 'styles', styles: { freedom: 5, organizedPace: 2 } }, { type: 'priorities', priorities: { POS01: 5, POS14: 1 } }, { type: 'call', playId: 'POS09', target: 'next' }],
    60: [{ type: 'timeout', reason: 'cortar racha' }],
    150: (m) => [{ type: 'substitution', swaps: [{ out: m.lineup[0].SG, in: m.teams[0].ids.find((id) => !m.onCourt(0).includes(id)) }] }],
  };
  await s.start();
  let reviews = 0; let guard = 0;
  while (s.state !== 'finalizado' && guard++ < 20000) {
    if (s.state === 'tiempoMuerto') { reviews += 1; s.submit({ type: 'styles', styles: { freedom: 1 } }); s.resume(); continue; }
    const k = s.match.stepSeq;
    if (script[k] && s.state === 'enMarcha') { s.pause(); for (const spec of [].concat(typeof script[k] === 'function' ? script[k](s.match) : script[k])) s.submit(spec); delete script[k]; s.resume(); }
    if (!sch.runNext()) break;
  }
  assert.equal(s.state, 'finalizado');
  assert.ok(reviews >= 1, 'el tiempo muerto concedido se presenta como parada y permite revisar el plan');
  const file = JSON.parse(JSON.stringify(s.result()));
  assert.equal(file.schema, EXPORT_SCHEMA); assert.equal(file.identity.engineVersion, ENGINE_VERSION); assert.equal(file.direction.managedTeam, 0);
  assert.ok(file.commands.length >= 5); assert.ok(file.commands.every((c) => Number.isInteger(c.afterStep)));
  assert.ok(file.orders.some((o) => o.type === 'timeout' && o.state === 'consumida'));
  assert.ok(file.orders.some((o) => o.type === 'styles' && ['vigente', 'sustituida'].includes(o.state)));
  assert.ok(file.events.some((e) => e.type === 'timeout')); assert.ok(file.events.some((e) => e.type === 'substitution' && e.intent.origen === 'orden manual'));
  // reproducir: vuelve a CALCULAR desde entrada, semilla y comandos y obtiene lo mismo
  const rp = replayMatch(file);
  assert.equal(rp.comparison.identical, true, JSON.stringify(rp.comparison.parts));
  assert.equal(rp.result.score.join('-'), file.score.join('-'));
  // y no es un eco del archivo: si se altera un hecho registrado, la comprobación lo detecta
  const tampered = JSON.parse(JSON.stringify(file));
  tampered.events[40].durationTenths += 1;
  const rp2 = replayMatch(tampered);
  assert.equal(rp2.comparison.identical, false); assert.equal(rp2.comparison.parts.events, false); assert.equal(rp2.comparison.firstEventDifference.index, 40);
  // una orden distinta es otra entrada deportiva y puede dar otro desarrollo
  const other = JSON.parse(JSON.stringify(file)); other.commands = other.commands.filter((c) => c.payload.spec?.type !== 'timeout');
  assert.equal(compareProjections(file, replayMatch(other).result).identical, false);
});

test('la reproducción valida formato, versión y referencias antes de ejecutar y no ejecuta contenido del archivo', () => {
  const legacy = validateReplayFile({ schema: 'beM-match-export/1', meta: { engineVersion: 'beM-motor-0.1.0-MOTOR01' } });
  assert.equal(legacy.reproducible, false); assert.equal(legacy.legacy, true); assert.match(legacy.problems[0], /MOTOR-01/);
  assert.equal(validateReplayFile(null).ok, false); assert.equal(validateReplayFile([]).ok, false);
  assert.match(validateReplayFile({ schema: 'otra/9' }).problems[0], /formato no reconocido/);
  const one = mk('total'); one.match.step();
  const ok = JSON.parse(JSON.stringify(one.result()));
  ok.meta.engineVersion = 'beM-motor-9.9.9';
  assert.ok(validateReplayFile(ok).problems.some((p) => /versión del motor distinta/.test(p)));
  assert.throws(() => replayMatch(ok), /No se puede reproducir/);
  const bad = JSON.parse(JSON.stringify(ok)); bad.meta.engineVersion = ENGINE_VERSION;
  bad.commands = [{ n: 1, kind: 'eval', afterStep: 0, payload: { code: 'globalThis.pwned = true' } }];
  assert.ok(validateReplayFile(bad).problems.some((p) => /tipo no admitido/.test(p)));
  assert.throws(() => replayMatch(bad), /No se puede reproducir/);
  assert.equal(globalThis.pwned, undefined);
  const badInput = JSON.parse(JSON.stringify(ok)); badInput.meta.engineVersion = ENGINE_VERSION; badInput.commands = []; badInput.input.teams[0].players[0].abilities.TEC01 = 99;
  assert.ok(validateReplayFile(badInput).problems.some((p) => /entrada:.*TEC01/.test(p)));
  const noProfile = JSON.parse(JSON.stringify(ok)); noProfile.meta.engineVersion = ENGINE_VERSION; delete noProfile.profile.rng;
  assert.ok(validateReplayFile(noProfile).problems.some((p) => /perfil efectivo incompleto/.test(p)));
});
