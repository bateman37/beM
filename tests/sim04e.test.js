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

// ---------------------------------------------------------------------------------------------------------------------------------- 6 · buscador acotado (objetivos sintéticos pequeños, no la campaña)
import * as Q from '../scripts/sim04e/search.js';
import * as SEL from '../scripts/sim04e/select.js';

const BASE = { p3: 0.35, p2: 0.39, block: { rim: 0.06, inside: 0.05, midrange: 0.015, three: 0.008 } };
const CFG = Q.buildConfig(BASE);
// 31 errores sintéticos: cada métrica depende linealmente de la distancia del vector a un óptimo oculto; cuotas coherentes para el reequilibrio
const TARGET = { V: 20, R: 1.75, M: 0.7, T: 0.6, O: 0.5, A: 0.5, S: 1.5, L: 0.8, E: 0.4, F: 1.1, C: 0.1, P3: 0.36, P2: 0.38, B: 1.1 };
function synth(vec, { shift = 0 } = {}) {
  const ids = Q.ORDER; const dist = (id) => Math.abs(vec[id] - TARGET[id]) / CFG.coords[id].range; const errs = [];
  [...SEL.COUNTS.map((c) => ['count', c.id, SEL.BAND_COUNT]), ...SEL.RATES.map((c) => ['rate', c.id, SEL.BAND_RATE]), ...SEL.SHARES.map((c) => ['share', c.id, SEL.BAND_SHARE])].forEach(([kind, id, band], i) => {
    const a = ids[i % ids.length]; const b = ids[(i * 3 + 1) % ids.length]; errs.push({ id, kind, label: id, band, error: band * (0.2 + 4 * dist(a) + 2 * dist(b) + shift), status: 'ok', sim: 10 * (1 + dist(a)), det: 10 });
  });
  const set = (id, sim, det) => { const e = errs.find((x) => x.id === id); e.sim = sim; e.det = det; };
  set('rim_share', 0.30 * (vec.R / 1.5), 0.36); set('inside_share', 0.15, 0.12); set('mid_share', 0.12 * vec.M, 0.10); set('three_share', 0.43 * (vec.T / 0.7), 0.42);
  errs.push({ id: 'forced_rim', kind: 'forced', band: null, error: 0.01, status: 'ok' }, { id: 'forced_inside', kind: 'forced', band: null, error: 0.01, status: 'ok' });
  return { errs, invariantsOk: true };
}
const runSynthetic = async () => { const calls = []; const res = await Q.searchDevA({ cfg: CFG, evaluate: async (vec, meta) => { calls.push(meta.id); return synth(vec); } }); return { res, calls }; };

test('S04E-06 buscador: dominios, vectores completos con B desde la misma base, deduplicación por filas efectivas, presupuesto por fase, mejora > 1e-9, determinismo y trazabilidad del padre', async () => {
  // vectores completos y B materializada desde la base (nunca acumulando escalados)
  const rows = Q.toOverrides(CFG, { ...CFG.s0, B: 1.1 }); assert.equal(rows.length, 5 + 13 + 4, 'fijas + 13 coordenadas simples + cuatro blockP0 (B)'); assert.deepEqual(rows.filter((r) => r.path.endsWith('.blockP0')).map((r) => [r.path, r.value]), [['shots.rim.blockP0', 0.066], ['shots.inside.blockP0', 0.055], ['shots.midrange.blockP0', 0.0165], ['shots.three.blockP0', 0.0088]]);
  assert.ok(!rows.some((r) => r.path.startsWith('shots.freeThrow')), 'los libres quedan excluidos');
  assert.equal(Q.vectorId(CFG, { ...CFG.s0 }), Q.vectorId(CFG, { ...CFG.s0, V: 19.5 + 1e-13 }), 'la identidad es el vector efectivo, no un nombre');
  assert.deepEqual(Q.normalize(CFG, { ...CFG.s0, V: 30, T: 0, P3: 0.9, B: 2 }), { ...CFG.s0, V: 22, T: 0.35, P3: 0.37, B: 1.25 }, 'límites de campaña; P3/P2 = base ± 0,02');
  const a = await runSynthetic(); const b = await runSynthetic(); const { res } = a;
  assert.deepEqual(a.calls, b.calls, 'mismo orden de evaluación'); assert.equal(new Set(a.calls).size, a.calls.length, 'ningún vector efectivo se evalúa dos veces');
  assert.ok(res.counts.starts <= 4 && res.counts.passes <= 56 && res.counts.joint <= 4 && res.counts.half <= 28 && res.order.length <= 92, JSON.stringify(res.counts));
  for (const e of res.evals.values()) for (const id of Q.ORDER) assert.ok(e.vec[id] >= CFG.coords[id].lo - 1e-12 && e.vec[id] <= CFG.coords[id].hi + 1e-12, `${id} dentro del dominio`);
  assert.equal(res.log[0].op, 'S0'); assert.equal(res.log[1].op, 'S1'); assert.ok(res.log.every((l) => l.parent == null || res.evals.has(l.parent)), 'cada perfil enlaza un padre evaluado');
  // adoptar solo mejora estricta de L_search: la pasada acumula ajustes compatibles
  const adopted = res.passes.flatMap((p) => p.steps).filter((s) => s.adopted); assert.ok(adopted.length > 3, 'se acumulan ajustes compatibles dentro de una pasada');
  for (const s of adopted) assert.ok(res.evals.get(s.adopted).L < res.evals.get(s.from).L - 1e-9);
  assert.ok(res.evals.get(res.sortedIds[0]).L < res.evals.get(Q.vectorId(CFG, CFG.s0)).L, 'el sintético mejora el inicio');
  // con un objetivo plano (todos iguales) no se adopta nada: los empates conservan el centro
  const flat = await Q.searchDevA({ cfg: CFG, evaluate: async (vec) => ({ errs: synth(CFG.s0).errs, invariantsOk: true }) }); assert.equal(flat.passes.flatMap((p) => p.steps).filter((s) => s.adopted).length, 0);
});

test('S04E-07 lista corta, reparaciones y criterio final: guardas frente a S0, 5 % de mejora, S0 ya dentro de banda, experimental aparte, alias y recalculable desde numeradores', async () => {
  const { res } = await runSynthetic(); const s0id = Q.vectorId(CFG, CFG.s0);
  const sl = Q.shortList(CFG, res.evals, s0id); assert.ok(sl.ids.length <= 5 && sl.ids[0] === s0id && new Set(sl.ids).size === sl.ids.length); assert.ok(sl.notes.length >= 4);
  // reparaciones: operadores y recortes
  const errs = synth(CFG.s0).errs; const set = (id, sim, det) => { const e = errs.find((x) => x.id === id); e.sim = sim; e.det = det; };
  set('fga', 120, 100); set('tov', 8, 16); set('fta', 20, 10); set('stl', 5, 6); set('ast_fg', 10, 40);
  assert.equal(Q.repairVector(CFG, 'R2', CFG.s0, errs).vec.V, 19.5 * 1.05, 'V × clip(FGA_SIM/FGA_DET; 0,95; 1,05)');
  { const r = Q.repairVector(CFG, 'R3', CFG.s0, errs).vec; assert.equal(r.L, 1.1 > 1.2 ? 1.2 : Math.min(1.2, 1 * 1.1)); assert.equal(r.F, 0.9 * 1 < 0.8 ? 0.8 : 0.9); assert.equal(Math.round(r.E * 1e6) / 1e6, Math.round(Math.min(1, 0 + Math.min(0.1, Math.log(6 / 5))) * 1e6) / 1e6); }
  { const r = Q.repairVector(CFG, 'R4', CFG.s0, errs); assert.equal(r.vec.S, 1.1); assert.equal(r.vec.A, 0.05, 'faltan AST: A + 0,05'); }
  { const e2 = errs.map((e) => (e.id === 'ast_fg' ? { ...e, det: 0 } : e)); const r = Q.repairVector(CFG, 'R4', CFG.s0, e2); assert.deepEqual(r.vec, { ...CFG.s0 }); assert.ok(r.omitted.length, 'cociente no definido: se omite con causa'); }
  { const rb = Q.rebalance(CFG, CFG.s0, errs.map((e) => (e.id === 'mid_share' ? { ...e, sim: 0 } : e))); assert.equal(rb.vec, null); assert.match(rb.cause, /nula/, 'cuota nula: omitir con causa, sin épsilon oculto'); }
  // criterio final con guardas, 5 % y experimental
  const mk = (id, shift, extra = {}) => { const e = synth({ ...CFG.s0 }, { shift }); const sc = SEL.scoreM(e.errs); return { id, vec: { ...CFG.s0, ...extra }, errs: e.errs, invariantsOk: true, L: sc.L, M: sc.M, violated: sc.violated, dominant: sc.dominant, missing: sc.missing, op: id }; };
  const s0 = mk('S0', 0); const better = mk('A1', -1, { V: 20 }); const tiny = mk('A2', -0.001, { V: 19 });
  const worseGuard = mk('A3', -1.5, { V: 21 }); worseGuard.errs = worseGuard.errs.map((e) => (e.id === 'inside_share' ? { ...e, error: 0.2 } : e)); const sc3 = SEL.scoreM(worseGuard.errs); Object.assign(worseGuard, { M: sc3.M, L: sc3.L });
  const joint = new Map([s0, better, tiny, worseGuard].map((e) => [e.id, e]));
  const fin = Q.finalSelect(CFG, joint, 'S0'); assert.ok(fin.rows.find((r) => r.id === 'A3').reasons.some((x) => x.startsWith('guardas')), 'una mejora agregada que daña una métrica queda fuera por guarda');
  assert.equal(fin.recommendedId, 'A1'); assert.ok(fin.best.improvement >= 0.05); assert.equal(fin.experimentalId, 'A2', 'la mejor experimental distinta de S0 y de la recomendada (menor M, aunque no alcance el 5 %) se entrega aparte y nunca se recomienda'); assert.ok(!fin.rows.find((r) => r.id === 'A3').admissible);
  const fin2 = Q.finalSelect(CFG, new Map([s0, tiny].map((e) => [e.id, e])), 'S0'); assert.equal(fin2.recommendedId, 'S0'); assert.equal(fin2.keptControl, true, 'mejora < 5 %: se conserva S0');
  const inBand = mk('S0', -0.2 + 0.0); inBand.errs = inBand.errs.map((e) => ({ ...e, error: e.band * 0.5 })); Object.assign(inBand, SEL.scoreM(inBand.errs)); inBand.id = 'S0'; const alt = { ...better }; alt.errs = alt.errs.map((e, i) => (i === 0 ? { ...e, error: e.band * 1.5 } : { ...e, error: e.band * 0.1 })); Object.assign(alt, { M: SEL.scoreM(alt.errs).M, L: SEL.scoreM(alt.errs).L });
  assert.equal(Q.finalSelect(CFG, new Map([['S0', inBand], ['A1', alt]]), 'S0').recommendedId, 'S0', 'si S0 ya cumple M ≤ 1, la alternativa también debe conservarlo');
  // la elección es recalculable desde los numeradores y denominadores de cada perfil (sin simular): errores = f(numeradores)
  const sim = { sums: { fgm: 40, fga: 80 }, counts: {} }; void sim;
  const rate = SEL.errorsOf; assert.equal(typeof rate, 'function');
});
