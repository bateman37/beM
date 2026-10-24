// SIM-MOTOR-04E · frontera de reloj y siguiente posesión, política común de crédito de rebote, puente observacional/deportivo y créditos de SIM. Casos controlados sobre operaciones reales y pocos
// subcasos compartidos; la evidencia comparativa de campaña se genera con `scripts/sim04e`, no en la suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshMatch, baseEx, inputFor } from './helpers.js';
import { createMatch } from '../src/match/index.js';
import { MatchCore } from '../src/match/core.js';
import { shotClockAfterRingContact, shotClockAfterDefensiveStoppage } from '../src/match/rules.js';
import { classifyReboundCredit, REBOUND_CREDIT_POLICY_ID } from '../src/match/rebound-credit.js';
import { buildActa } from '../src/match/acta.js';
import { buildResult } from '../src/match/index.js';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult } from '../src/sim/index.js';
import { playAutomatic } from '../src/sim/coachsim.js';

const { profile, players } = data;
const R = profile.rules;
const fresh = (seed, clock, shot) => { const m = freshMatch(seed); m.period = 1; m.clock = clock; m.shotClock = shot; return m; };
const lastEvent = (m) => m.events[m.events.length - 1];
// encuentro con un perfil modificado (el perfil congelado de un encuentro es de solo lectura): copia profunda con el contexto de aro de una zona
const freshWithRing = (seed, zone, value) => {
  const prof = JSON.parse(JSON.stringify(profile)); if (value === undefined) delete prof.shots[zone].ordinaryMissContactsRing; else prof.shots[zone].ordinaryMissContactsRing = value;
  const m = createMatch(inputFor(seed), prof, { detail: 'full' }); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); m.period = 1; return m;
};

// ---------------------------------------------------------------------------------------------------------------------------------- 1 · frontera reproducida y reanudación
test('S04E-01 expiración tras fallo: con contacto en el aro, 0,1 s de posesión y 308 s de periodo no hay bocina ni siguiente ataque heredado; el rebote ocurre y reanuda con control resuelto (E0070/E0071 de VAL04D)', () => {
  const seen = { oreb: 0, dreb: 0 };
  for (let seed = 1; seed <= 24; seed++) {
    const m = fresh(seed, 3080, 1); const poss = m.poss; const ex = baseEx({ team: poss.team, zone: 'inside' });
    m.nextPoss = { team: poss.team, entry: 'inbound', shotClock: 240, throwIn: { kind: 'endline', origin: 'instrucción antigua' } }; m.nextPossFresh = false; // estado antiguo que antes se reutilizaba
    const r = m.afterMiss(ex, 'inside');
    assert.ok(r.cont === 'oreb' || r.end === 'dreb', `rebote resuelto, no periodEnd (${JSON.stringify(r)})`);
    const ev = lastEvent(m); assert.equal(ev.type, 'rebound'); assert.notEqual(ev.type, 'expiry');
    assert.ok(m.clock > 0 && m.clock < 3080, 'consume el tiempo del rebote del reloj de juego, no el de posesión');
    if (r.cont === 'oreb') { seen.oreb++; assert.equal(m.shotClock, shotClockAfterRingContact(R, true)); assert.equal(m.poss, poss, 'continúa el mismo ataque con el captor ya resuelto'); assert.equal(m.poss.oreb.captor, ev.participants.captor); }
    else { seen.dreb++; assert.equal(m.nextPossFresh, true, 'transición establecida por esta frontera'); assert.equal(m.nextPoss.team, 1 - poss.team); assert.equal(m.nextPoss.entry, 'live'); assert.equal(m.nextPoss.carrier, ev.participants.captor); assert.equal(m.nextPoss.shotClock, 240); }
  }
  assert.ok(seen.oreb > 0 && seen.dreb > 0, 'ambas ramas ejercitadas');
});

test('S04E-02 relojes: contacto/sin contacto, bocina real, retorno ofensivo con reloj previo alto o bajo, y parada defensiva (que sigue siendo otra regla)', () => {
  // helpers de reglamento (art. 29): 14 s al mismo ataque tras contacto con aro (reinicia, no solo completa), 24 s al rival; la parada defensiva conserva ≥ 14 s
  assert.equal(shotClockAfterRingContact(R, true), 140); assert.equal(shotClockAfterRingContact(R, false), 240);
  assert.equal(shotClockAfterDefensiveStoppage(80, R), 140); assert.equal(shotClockAfterDefensiveStoppage(200, R), 200);
  // retorno ofensivo con reloj previo superior a 14 s: tras el contacto con el aro se reinicia a 14 s (no continúa con 20 s) y con 0,1 s tampoco queda a cero
  for (const shot of [200, 1]) {
    let reached = false;
    for (let seed = 1; seed <= 40 && !reached; seed++) { const m = fresh(seed, 3000, shot); const r = m.afterMiss(baseEx({ team: m.poss.team, zone: 'rim' }), 'rim'); if (r.cont === 'oreb') { reached = true; assert.equal(m.shotClock, 140, `reloj previo ${shot}: 14 s`); } }
    assert.ok(reached, `retorno ofensivo alcanzado con reloj previo ${shot}`);
  }
  // bocina real: queda 0,1 s o menos de juego, no cabe el rebote → periodo concluido (nunca una violación)
  { const m = fresh(3, 1, 240); const r = m.afterMiss(baseEx({ team: m.poss.team, zone: 'inside' }), 'inside'); const ev = lastEvent(m); assert.deepEqual(r, { end: 'periodEnd' }); assert.equal(ev.type, 'expiry'); assert.equal(ev.effects.fin, 'periodo'); assert.equal(m.clock, 0); }
  // sin contacto con el aro (contexto explícito `false`) rige el reloj de posesión: violación con su propia reanudación rival (no se regala un reinicio ni se reutiliza el siguiente ataque)
  { const m = freshWithRing(4, 'inside', false); m.clock = 3000; m.shotClock = 1; const poss = m.poss; const r = m.afterMiss(baseEx({ team: poss.team, zone: 'inside' }), 'inside'); const ev = lastEvent(m);
    assert.deepEqual(r, { end: 'deadTurnover' }); assert.equal(ev.effects.fin, 'posesion'); assert.equal(ev.stats[0].cause, 'violacion_24'); assert.equal(m.nextPoss.team, 1 - poss.team); assert.equal(m.nextPossFresh, true); }
  // `null` (no registrado) se distingue de `false`
  const ctxOf = (v) => MatchCore.prototype.missRingContext.call({ profile: { shots: { three: v === undefined ? {} : { ordinaryMissContactsRing: v } } } }, 'three');
  assert.equal(ctxOf(undefined), null); assert.equal(ctxOf(false), false); assert.equal(ctxOf(true), true);
});

test('S04E-03 siguiente posesión: la instrucción se consume una sola vez y una frontera sin transición válida no reutiliza la antigua; un derecho legítimo del mismo equipo (rebote ofensivo) no se bloquea', () => {
  const m = freshMatch(7); m.nextPoss = { team: 0, entry: 'inbound', shotClock: 240, throwIn: { kind: 'band', origin: 'prueba' } }; m.nextPossFresh = true; m.poss.done = true;
  m.possessionUnit(); assert.equal(m.nextPossFresh, false, 'consumida'); m.poss.done = true;
  assert.throws(() => m.possessionUnit(), /ya se consumió/, 'una segunda posesión sin transición nueva falla en vez de heredar la antigua');
  // partidos completos: el guardián nunca salta, ningún final de periodo con reloj de juego positivo y el reloj de posesión no queda «gastado» por el rebote tras contacto con el aro
  for (const seed of [21, 22, 23]) {
    const mm = createMatch(inputFor(seed), profile, { detail: 'full' }); let g = 0; while (mm.step() && g++ < 2e6); const res = buildResult(mm); assert.equal(res.status, 'finished');
    res.events.forEach((e, i) => { if (e.type === 'expiry' && e.effects?.fin === 'periodo') assert.equal(e.clock.after, 0, `${e.id}: «periodo» solo con el reloj de juego a cero`); if (e.type === 'rebound') assert.ok(e.clock.before > 0, `${i}`); });
    const credits = res.acta.credits.filter((c) => c.k === 'reb'); assert.ok(credits.length > 20); assert.equal(res.reconciliation.ok, true, res.reconciliation.failed.join());
    for (const t of res.acta.teams) { const indiv = Object.values(res.acta.players).filter((l) => l.team === t.index).reduce((q, l) => q + l.oreb + l.dreb, 0); assert.equal(t.totals.reb, indiv + t.collective.reb, 'total de equipo = individuales + colectivos'); assert.equal(t.totals.oreb + t.totals.dreb, t.totals.reb); }
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------- 4 · créditos de rebote (política común)
test('S04E-04 créditos: tapón vivo con recuperación de cada equipo, tapón fuera colectivo y ausencias legítimas; un fallo no produce dos créditos ni un jugador inexistente', () => {
  assert.equal(REBOUND_CREDIT_POLICY_ID, 'REBCRED-SIM04E-R1');
  assert.deepEqual(classifyReboundCredit({ shooterTeam: 0, miss: 'blocked', ball: 'live', control: { team: 1, player: 'D1' } }), { kind: 'individual', team: 1, off: false, player: 'D1', cause: 'recuperacion_tras_tapon' });
  assert.deepEqual(classifyReboundCredit({ shooterTeam: 0, miss: 'blocked', ball: 'live', control: { team: 0, player: 'O1' } }), { kind: 'individual', team: 0, off: true, player: 'O1', cause: 'recuperacion_tras_tapon' });
  assert.deepEqual(classifyReboundCredit({ shooterTeam: 0, miss: 'blocked', ball: 'outOfBounds', control: { team: 0, player: null } }), { kind: 'collective', team: 0, off: true, player: null, cause: 'derecho_de_saque' });
  assert.equal(classifyReboundCredit({ shooterTeam: 0, miss: 'field', ball: 'live', control: null, periodEnded: true }).kind, 'none'); assert.equal(classifyReboundCredit({ shooterTeam: 0, miss: 'field', ball: 'live', control: { team: 1, player: 'D1' }, violation: true }).cause, 'violacion_antes_de_recuperar');
  assert.equal(classifyReboundCredit({ shooterTeam: 0, miss: 'field', ball: 'dead', control: { team: 1, player: null } }).cause, 'balon_muerto');
  assert.equal(classifyReboundCredit({ shooterTeam: 0, miss: 'freeThrowLast', ball: 'live', control: { team: 0, player: 'O2' } }).cause, 'captura');
  // detallado: resolveBlocked sobre el camino real; cada rama acredita una sola vez con el recuperador YA elegido y `of` remite al propio hecho
  const seen = { oob: 0, def: 0, off: 0 };
  for (let seed = 1; seed <= 400 && seen.oob * seen.def * seen.off === 0; seed++) {
    const m = freshMatch(seed); const poss = m.poss; const ex = baseEx({ team: poss.team, zone: 'inside' }); const blocker = m.onCourt(1 - poss.team)[0];
    const r = m.resolveBlocked(ex, { t: m.snap(), team: ex.team, intent: {}, participants: {} }, blocker); const ev = lastEvent(m); const rebs = ev.stats.filter((x) => x.k === 'reb');
    assert.equal(rebs.length, 1, 'un único crédito causal'); const c = rebs[0]; assert.equal(c.of, ev.id, 'remite al hecho de tiro bloqueado');
    if (r.cont === 'blockedOOB') { seen.oob++; assert.equal(c.p, null); assert.equal(c.team, ex.team); assert.equal(c.off, true); }
    else if (r.end === 'blockRecovery') { seen.def++; assert.ok(m.onCourt(1 - ex.team).includes(c.p)); assert.equal(c.off, false); assert.equal(m.nextPoss.carrier, c.p, 'crédito = recuperador que continúa'); }
    else { seen.off++; assert.equal(r.cont, 'blockedLive'); assert.ok(m.onCourt(ex.team).includes(c.p)); assert.equal(c.off, true); assert.equal(m.poss.recovery.holder, c.p); }
  }
  assert.ok(seen.oob > 0 && seen.def > 0 && seen.off > 0, JSON.stringify(seen));
});

// ---------------------------------------------------------------------------------------------------------------------------------- 5 · integración estadística y puente
test('S04E-05 integración: el acta, la conciliación y los totales cierran con créditos colectivos del detallado y de SIM; el puente antes/después conserva la dinámica en el paso de crédito y la cambia solo con la corrección de reloj', () => {
  const bridge = (s) => JSON.parse(readFileSync(new URL(`./fixtures/sim04e-bridge-${s}.json`, import.meta.url))).rows;
  const a = bridge('04D'); const b = bridge('credito'); const c = bridge('reloj');
  assert.equal(a.length, 8);
  a.forEach((x, i) => { const y = b[i]; assert.deepEqual([x.dyn_sha, x.draws_sha, x.score, x.events, x.draws], [y.dyn_sha, y.draws_sha, y.score, y.events, y.draws], `${x.case_id}: el paso de crédito conserva relojes, quintetos, sorteos y marcador`); assert.ok(x.false_expiry >= 0); });
  assert.ok(a.reduce((s, x) => s + x.false_expiry, 0) > 0, 'la referencia anterior contiene el patrón espurio');
  assert.equal(c.reduce((s, x) => s + x.false_expiry, 0), 0, 'la base corregida no lo contiene');
  assert.ok(c.some((x, i) => x.dyn_sha !== b[i].dyn_sha), 'la diferencia de trayectoria se atribuye al camino corregido');
  // SIM: cada tapón fuera tiene exactamente un crédito colectivo ofensivo sin jugador; el acta del equipo = suma individual + colectivos
  const ctx = makeContext(profile); let collective = 0;
  for (const seed of [3, 4, 5, 6]) {
    const sm = new SimMatch(buildReferenceInput(profile, players, 'EQ03', 'EQ04', { seed }), ctx); playAutomatic(sm); const res = buildSimResult(sm, { events: true }); assert.equal(res.reconciliation.valid, true, res.reconciliation.checks.filter((x) => !x.ok).map((x) => x.id).join());
    const evs = sm.events; evs.forEach((e) => { if (e.ty === 'shot' && e.end === 'block_out_of_bounds') { const rb = evs.filter((x) => x.ty === 'reb' && x.ref === e.i); assert.equal(rb.length, 1); assert.equal(rb[0].pl, null); assert.equal(rb[0].off, true); assert.equal(rb[0].tm, e.tm); collective++; } });
    for (const k of [0, 1]) { const t = res.box.teams[k]; const ind = res.box.players.filter((p) => p.team === k).reduce((s, p) => s + p.oreb + p.dreb, 0); assert.equal(t.oreb + t.dreb + t.teamReb[0] + t.teamReb[1], ind + t.teamReb[0] + t.teamReb[1], 'total del equipo = individuales + colectivos'); }
  }
  assert.ok(collective > 0, 'se ejercitó el crédito colectivo');
});
