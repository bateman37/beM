// MOTOR-15: cierre funcional, compatibilidad y rendimiento del mundo. Grupos de riesgo (no un test por fila).
//  1 · compatibilidad del panel: perfil anterior, actual y genuinamente inválido (parametrizado), recuperación explícita sin tocar el original.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyExtension } from '../src/match/index.js';
import { buildRows } from '../src/profiles/rows.js';
import { assessProfile } from '../src/profiles/compat.js';
import { ProfileLibrary, MemoryStorage } from '../src/profiles/library.js';
import { data } from './helpers.js';

const readJson = (n) => JSON.parse(readFileSync(new URL(`../data/match/${n}`, import.meta.url), 'utf8'));
const oldProfile = () => applyExtension(readJson('motor01-seed-profile.json'), ...['02', '03', '04'].map((m) => readJson(`motor${m}-seed-extension.json`)));

// ---------------------------------------------------------------------------------------------------------------- 1
test('M15·1 perfil anterior (hasta MOTOR-04): las filas se construyen sin tirar el panel y los módulos ausentes se distinguen del valor cero', () => {
  const old = oldProfile();
  assert.doesNotThrow(() => buildRows(old), 'causa original: rows-motor08 leía profile.coach.policies sin existir `coach`');
  const rows = buildRows(old);
  const coachRow = rows.find((r) => r.id.startsWith('coach.policies.'));
  assert.ok(coachRow?.missing, 'la fila de entrenador queda como ausente, no inventada');
  assert.match(coachRow.label, /ausente en este perfil/);
  const a = assessProfile(old);
  assert.equal(a.ready, false);
  assert.ok(a.lackingToPlay.includes('coach') && a.lackingToPlay.includes('regulation') && a.lackingToPlay.includes('moment'));
  assert.ok(a.modules.find((m) => m.id === 'coach' && !m.present), 'módulo no compatible ≠ valor cero');
  assert.ok(a.missingRequiredRows > 0);
});

test('M15·1 perfil actual: completo y listo; perfil genuinamente inválido: se informa sin lanzar', () => {
  const { profile } = data;
  const ok = assessProfile(profile);
  assert.equal(ok.ready, true); assert.equal(ok.missingRequiredRows, 0); assert.equal(ok.missingModules.length, 0);
  for (const mut of [(p) => { p.coach = 7; }, (p) => { p.plays = 'x'; }]) {
    const bad = JSON.parse(JSON.stringify(profile)); mut(bad);
    const a = assessProfile(bad);
    assert.equal(a.ready, false); assert.ok(a.error, 'el fallo se declara en la frontera de evaluación'); assert.match(a.summary, /no se pudo evaluar/);
  }
});

test('M15·1 recuperación explícita: la candidata se crea desde la base actual, el original protegido no cambia y no hay activación silenciosa', () => {
  const st = new MemoryStorage();
  const L0 = new ProfileLibrary({ storage: st, base: oldProfile() });
  const v0 = L0.version('V0'); const hash0 = v0.hash; const snap0 = JSON.stringify(v0.effective);
  const L = new ProfileLibrary({ storage: st, base: data.profile }); // la aplicación actual arranca sobre la biblioteca antigua
  assert.equal(L.activeId, 'V0', 'no se activa nada en silencio al arrancar con un perfil anterior');
  assert.notEqual(L.baseId, 'V0');
  const r = L.upgradeCandidate('V0');
  assert.ok(r.ok, r.error);
  assert.equal(r.draft.parent.id, L.baseId, 'la candidata cuelga de la base actual');
  assert.equal(L.activeId, 'V0', 'crear la candidata no activa');
  assert.equal(L.version('V0').hash, hash0); assert.equal(JSON.stringify(L.version('V0').effective), snap0);
  assert.equal(L.upgradeCandidate(L.baseId).ok, false, 'una versión ya compatible no necesita candidata');
  const act = L.activate(L.baseId, 'prueba');
  assert.ok(act.ok); assert.equal(L.activeId, L.baseId); assert.equal(L.version('V0').hash, hash0);
});

// ---------------------------------------------------------------------------------------------------------------- 2
import { freshMatch, inputFor } from './helpers.js';
import { createMatch, buildResult, runMatch } from '../src/match/index.js';
import { resolveFoul, combineSanctions } from '../src/match/regs.js';
import { buildActa } from '../src/match/acta.js';
import { reconcile } from '../src/match/reconcile.js';
import { replayMatch } from '../src/match/replay.js';
import { snapshotMatch, restoreMatch } from '../src/match/snapshot.js';
import { evaluateWindow, validateCorrectionInput } from '../src/match/corrections.js';
import { flightSplit, interferenceMasses, interferenceOutcome, resolveInterference } from '../src/match/incidents.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';

const { profile, players } = data;
const fixture = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8'))['20261016'];
const stepN = (m, n) => { for (let i = 0; i < n && m.step(); i++); };
const finish = (m) => { while (m.step()); return buildResult(m); };

test('M15·2 técnicas y contadores: un libre sin alineación al mejor lanzador, contadores por categoría, descalificación acumulada y entrenador; «antideportiva» es un alias', () => {
  const m = freshMatch(7); m.shotClock = 200;
  assert.equal(m.requestIncident({ category: 'antideportiva', player: 'EQ01-J03' }).ok, false);
  assert.match(m.requestIncident({ category: 'disruptiva', player: 'EQ01-J03' }).reason, /receptor/, 'sin contacto identificado no se inventa un receptor');
  assert.equal(m.requestIncident({ category: 'tecnica1', player: 'EQ01-J03' }).ok, true);
  const before = m.events.length; stepN(m, 3);
  const ev = m.events[before]; assert.equal(ev.type, 'foul'); assert.equal(ev.effects.regla, 'RG-F07'); assert.equal(ev.stats[0].kind, 'tecnica1'); assert.equal(ev.stats[0].sobre, null, 'una técnica no crea receptor individual');
  const ft = m.events.slice(before).find((e) => e.type === 'free_throw'); assert.ok(ft, 'libre real'); assert.equal(m.pl[ft.stats[0].p].teamIdx, 1, 'lo lanza el equipo rival');
  const best = m.designatedShooter(1); assert.equal(ft.stats[0].p, best, 'política declarada: mejor lanzador de libres en pista');
  assert.equal(m.ps['EQ01-J03'].fouls, 1); assert.equal(m.sanctions('EQ01-J03').technicalCat1, 1); assert.equal(m.teamFouls[0][1] ?? 0, 1, 'cuenta como falta colectiva');
  // dos técnicas de categoría 1 descalifican; una de categoría 2 no suma; el entrenador: dos C
  const k = freshMatch(11); k.requestIncident({ category: 'tecnica2', player: 'EQ01-J04' }); k.requestIncident({ category: 'tecnica2', player: 'EQ01-J04' }); stepN(k, 6);
  assert.equal(k.ps['EQ01-J04'].available, true, 'dos técnicas de categoría 2 no descalifican'); assert.equal(k.sanctions('EQ01-J04').technicalCat2, 2);
  const d = freshMatch(13); d.requestIncident({ category: 'tecnica1', player: 'EQ02-J04' }); stepN(d, 4); d.requestIncident({ category: 'flagrante', player: 'EQ02-J04', fouled: 'EQ01-J03' }); stepN(d, 6);
  assert.equal(d.ps['EQ02-J04'].available, false, 'una técnica 1 y una flagrante descalifican');
  const c = freshMatch(17); c.requestIncident({ category: 'tecnica_entrenador', team: 1 }); stepN(c, 3); c.requestIncident({ category: 'tecnica_entrenador', team: 1 }); stepN(c, 4);
  assert.deepEqual(c.coachCounters[1], { C: 2, B: 0 }); assert.equal(c.coachOut[1], true); assert.equal(c.teamFouls[1][1] ?? 0, 0, 'la técnica del entrenador no es falta colectiva');
  const b = freshMatch(19); b.requestIncident({ category: 'tecnica_banquillo', team: 0 }); stepN(b, 3); assert.deepEqual(b.coachCounters[0], { C: 0, B: 1 }); assert.equal(b.teamFouls[0][1] ?? 0, 0, 'la técnica de banquillo se imputa al entrenador, no al contador colectivo');
  // el comando es reproducible y el acta concilia
  const res = finish(m); assert.equal(res.status, 'finished'); assert.equal(res.reconciliation.valid, 'válida'); assert.equal(res.commands.at(-1).kind, 'incident');
});

test('M15·3 cola causal común (art. 43): orden, técnica primero, compensación por libres Y derechos, casos 43-5 y 43-7, fusión con la falta pendiente y reanudación única', () => {
  const mk = (id, team, order, category, extra = {}) => ({ id, team, order, category, shotAction: false, penalty: false, committer: `P${id}`, fouled: `V${id}`, ...extra });
  const c5 = combineSanctions(profile, [mk('S1', 1, 1, 'personal', { shotAction: true, shotPoints: 2, shotMade: true }), mk('S2', 0, 2, 'tecnica1')]);
  assert.equal(c5.status, 'compensada'); assert.deepEqual(c5.compensated, [['S1', 'S2']]); assert.deepEqual(c5.keptFouls, ['S1', 'S2']); assert.equal(c5.steps.length, 0); assert.equal(c5.resume.kind, 'priorContext');
  const c7 = combineSanctions(profile, [mk('S1', 1, 1, 'flagrante', { shotAction: true, shotPoints: 2, shotMade: true }), mk('S2', 0, 2, 'tecnica1')]);
  assert.equal(c7.status, 'resuelta'); assert.deepEqual(c7.steps.map((s) => s.id), ['S2', 'S1'], 'la técnica se administra primero'); assert.equal(c7.resume.kind, 'penaltyThrowIn'); assert.equal(c7.resume.from, 'S1', 'se conserva el derecho sancionador');
  // equivalencia incluye derechos: mismos libres pero un derecho distinto no compensa
  const eq = combineSanctions(profile, [mk('S1', 0, 1, 'disruptiva'), mk('S2', 1, 2, 'personal', { penalty: true })]); assert.deepEqual(eq.compensated, [], 'dos libres con derecho de saque frente a dos libres sin derecho no son equivalentes');
  // una penalización ya iniciada con balón vivo no se vuelve a usar; la técnica del entrenador por descalificación de banquillo conserva el orden del caso
  assert.deepEqual(combineSanctions(profile, [mk('S1', 0, 1, 'tecnica1', { startedLive: true }), mk('S2', 1, 2, 'tecnica1')]).compensated, []);
  assert.deepEqual(combineSanctions(profile, [mk('S1', 1, 1, 'personal', { penalty: true }), mk('S2', 0, 2, 'descalificacion_banquillo'), mk('S3', 0, 3, 'tecnica1')]).steps.map((s) => s.id), ['S3', 'S1', 'S2']);
  // una falta defensiva pendiente se fusiona con la técnica recibida en la misma parada: una sola cola y una sola reanudación
  const m = freshMatch(5); m.foulAdmin('EQ02-J05', 'EQ01-J03', { shooting: false, shotTeam: 0 }); m.poss.pendingFT = { team: 0, actor: 'EQ01-J03', origin: 'PRUEBA', zone: 'three', kind: 'organized' };
  assert.ok(m.pendingFoul?.sanction); const seq0 = m.events.length;
  m.requestIncident({ category: 'tecnica1', player: 'EQ01-J04' }); stepN(m, 8);
  assert.equal(m.pendingFoul, null); assert.equal(m.adminPlan, null, 'la cola termina'); assert.equal(m.poss?.pendingFT ?? null, null);
  const fts = m.events.slice(seq0).filter((e) => e.type === 'free_throw'); assert.equal(fts.length, 1, 'solo la técnica concede libre (la falta sin penalización repone con saque)');
  const res = finish(m); assert.equal(res.reconciliation.valid, 'válida');
  // dos técnicas equivalentes de equipos opuestos: compensadas, sin libres, faltas cargadas y reanudación del contexto previo
  const n = freshMatch(7); n.requestIncident({ category: 'tecnica1', player: 'EQ01-J03' }); n.requestIncident({ category: 'tecnica_entrenador', team: 1 }); const s0 = n.events.length; stepN(n, 6);
  assert.equal(n.events.slice(s0).filter((e) => e.type === 'free_throw').length, 0); assert.equal(n.ps['EQ01-J03'].fouls, 1); assert.deepEqual(n.coachCounters[1], { C: 1, B: 0 });
  assert.equal(n.events.slice(s0).find((e) => e.effects?.administracion)?.effects.administracion.compensadaCon != null, true);
});

// ---------------------------------------------------------------------------------------------------------------- 4
const untilFirstSeries = (seed) => { const m = createMatch(buildMatchInput(profile, players, { seed }), profile, { detail: 'minimal', check: true }); while (m.step()) { const e = m.events.at(-1); if (e.type === 'free_throw' && e.effects.ultimo) break; } return m; };
const base45 = (cls, kind, event, correct, over = {}) => ({ class: cls, requester: 'referee', error: { kind, event }, correct, recognizedAt: { immediate: true }, ...over });
import { buildMatchInput } from '../src/match/index.js';

test('M15·4 art. 45: ventanas por umbral de los últimos 2:00 (hechos del encuentro), operaciones tipadas, intentos reales, derivados y comando reproducible', () => {
  // ventana (función pura): categoría 1 antes del umbral, última ventana con reanudación, parada que cruza el umbral, oportunidad perdida, final y categoría 2
  const W = (cat, ctx) => evaluateWindow(profile, cat, { period: 2, remaining: 3000, errorPeriod: 2, errorRemaining: 3200, firstStop: null, resumesSinceError: 0, finished: false, errorAfterLastStop: false, immediate: false, controlChanged: false, basketSince: false, ...ctx });
  assert.equal(W(1, {}).open, true); assert.equal(W(1, {}).rule, 'C1-antes-del-umbral');
  assert.equal(W(1, { period: 4, remaining: 1100, errorPeriod: 4, errorRemaining: 1150, resumesSinceError: 0 }).open, true, 'últimos 2:00: antes de reanudar tras la primera parada');
  assert.equal(W(1, { period: 4, remaining: 1000, errorPeriod: 4, errorRemaining: 1150, resumesSinceError: 1 }).open, false, 'el mismo error con la ventana caducada');
  assert.equal(W(1, { period: 4, remaining: 1190, errorPeriod: 4, errorRemaining: 1500, firstStop: { period: 4, remaining: 1150 }, resumesSinceError: 0 }).rule, 'C1-parada-cruza-umbral', 'primera parada que cruza el umbral: antes de reanudar');
  assert.equal(W(1, { period: 4, remaining: 900, errorPeriod: 4, errorRemaining: 1500, firstStop: { period: 4, remaining: 1400 }, resumesSinceError: 1 }).open, false, 'oportunidad ya perdida');
  assert.equal(W(1, { finished: true, errorAfterLastStop: true, immediate: true }).rule, 'C1-final-excepcion'); assert.equal(W(1, { finished: true, errorAfterLastStop: false, immediate: true }).open, false);
  assert.equal(W(2, { immediate: true }).open, true); assert.equal(W(2, { controlChanged: true }).open, false); assert.equal(W(2, { basketSince: true }).open, false); assert.equal(W(2, { resumesSinceError: 1 }).open, false);
  // entrada: solicitante habilitado, tipo coherente, valores autorizados y reconocimiento
  assert.equal(validateCorrectionInput(profile, base45('C1-POINTS', 'pointsWrong', 'E1', { event: 'E1', points: 3 }, { requester: 'ayudante' })).ok, false);
  assert.equal(validateCorrectionInput(profile, base45('C1-POINTS', 'otraCosa', 'E1', { event: 'E1', points: 3 })).ok, false);
  assert.equal(validateCorrectionInput(profile, base45('C1-POINTS', 'pointsWrong', 'E1', null)).ok, false, 'sin valores correctos autorizados no se infiere desde el marcador final');
  // libres indebidos: se anulan con sus puntos, el original queda enlazado y el acta concilia
  const m = untilFirstSeries(3); const foul = [...m.events].reverse().find((e) => e.type === 'foul'); const serie = [...m.events].reverse().find((e) => e.type === 'free_throw').stats[0].series; const score0 = [...m.score];
  const r = m.requestCorrection(base45('C1-FT-IMPROPER', 'freeThrowsAwardedImproperly', foul.id, { series: serie })); assert.equal(r.ok, true, r.reason);
  const stats = m.seriesStats(serie); assert.ok(stats.every(({ f }) => f.status === 'annulled' && f.corrected.id === r.id && f.corrected.before.status === 'administered'), 'original y rectificación enlazados');
  assert.ok(m.score[0] + m.score[1] < score0[0] + score0[1], 'los puntos de la serie se retiran del marcador');
  // solicitante no habilitado y ventana caducada se rechazan con motivo y sin cambios
  const bad = m.requestCorrection(base45('C1-FT-IMPROPER', 'freeThrowsAwardedImproperly', foul.id, { series: serie }, { requester: 'ayudante' })); assert.equal(bad.ok, false); assert.match(bad.reason, /solicitante/);
  // lanzador dirigido incorrectamente: se anula la serie del equivocado y se programa una serie REAL del correcto; omitidos: intentos reales; excepción: canasta posterior tras saque erróneo
  const q = untilFirstSeries(3); const f2 = [...q.events].reverse().find((e) => e.type === 'foul'); const s2 = [...q.events].reverse().find((e) => e.type === 'free_throw').stats[0];
  const mate = q.onCourt(s2.team).find((id) => id !== s2.p); const ftBefore = q.events.filter((e) => e.type === 'free_throw').length;
  const r2 = q.requestCorrection(base45('C1-SHOOTER-DIRECTED', 'shooterDirectedWrongly', f2.id, { series: s2.series, shooter: mate })); assert.equal(r2.ok, true, r2.reason); assert.ok(q.adminPlan, 'serie sustituta programada'); stepN(q, 4);
  const newFts = q.events.filter((e) => e.type === 'free_throw').slice(ftBefore); assert.ok(newFts.length >= 1 && newFts.every((e) => e.stats[0].p === mate), 'intentos reales del lanzador correcto');
  const omit = untilFirstSeries(3).requestCorrection(base45('C1-FT-OMITTED', 'freeThrowsOmitted', 'E0001', { team: 0, shooter: 'EQ01-J03', n: 1 }, { error: { kind: 'freeThrowsOmitted', event: 'E0001', context: { subsequentBasketBySameTeamAfterWrongThrowIn: true } } }));
  assert.equal(omit.ok, false); assert.match(omit.reason, /saque erróneo|canasta posterior/);
  // puntos: rectifica valor con efectos en marcador y parciales; categoría 2: reloj de posesión; ambos reproducibles
  const p = createMatch(buildMatchInput(profile, players, { seed: 5 }), profile, { detail: 'minimal', check: true }); stepN(p, 40);
  const made = p.events.find((e) => e.stats.some((f) => f.k === 'shot' && f.made && !f.fromFoul && f.zone !== 'three')); const sc0 = [...p.score]; const team = made.stats[0].team; const pts0 = made.stats[0].points;
  const rp = p.requestCorrection(base45('C1-POINTS', 'pointsWrong', made.id, { event: made.id, points: 3 })); assert.equal(rp.ok, true, rp.reason); assert.equal(p.score[team], sc0[team] + (3 - pts0), 'el marcador y los parciales se rectifican con el valor corregido'); assert.equal(made.stats[0].corrected.before.points, pts0);
  const rs = p.requestCorrection(base45('C2-SHOTCLOCK', 'shotClockWrong', p.events.at(-1).id, { shotClockTenths: 240 }, { recognizedAt: { immediate: true } })); assert.equal(rs.ok, true, rs.reason); assert.equal(p.shotClock, 240);
  const fin = finish(p); assert.equal(fin.status, 'finished'); assert.equal(fin.reconciliation.valid, 'válida', fin.reconciliation.failed.join(','));
  assert.equal(fin.events.filter((e) => e.type === 'correction').length, 2);
  // el comando se reproduce con el mismo resultado
  const rep = replayMatch(JSON.parse(JSON.stringify(fin))); assert.equal(rep.comparison.identical, true, JSON.stringify(rep.comparison.differences?.slice?.(0, 2)));
});

// ---------------------------------------------------------------------------------------------------------------- 5
const withSeeds = (over) => { const p = JSON.parse(JSON.stringify(profile)); for (const [path, v] of Object.entries(over)) { const k = path.split('.'); let o = p; for (const x of k.slice(0, -1)) o = o[x]; o[k.at(-1)] = v; } return p; };
const OFF = { 'shotFlight.pendingLagSeconds': 0, 'interference.fieldGoal.defensiveP': 0, 'interference.fieldGoal.offensiveP': 0, 'interference.lastFreeThrow.defensiveP': 0, 'interference.lastFreeThrow.offensiveP': 0 };
const run15 = (p, seed = 20261016, detail = 'minimal') => runMatch(buildMatchInput(p, players, { seed }), p, { detail, check: true });

test('M15·5 neutralidad: con las semillas SEM15 a cero el deporte de MOTOR-14 se reproduce exactamente (83–103, 6.505 sorteos); activarlas cambia el deporte con causa y primer punto de divergencia', () => {
  const m14 = fixture('baseline-motor14.json'); const m15 = fixture('baseline-motor15b.json'); const m15prev = fixture('baseline-motor15.json'); // MOTOR-15B: mismo deporte (marcador, parciales, sorteos); cambia solo el crédito y por tanto la huella
  const off = run15(withSeeds(OFF)); assert.deepEqual(off.score, m14.score); assert.equal(off.diagnostics.sportingDraws, m14.draws);
  assert.deepEqual(off.periodScores.map((x) => x.points), m14.periodScores);
  const on = run15(profile); assert.deepEqual(on.score, m15.score); assert.equal(on.diagnostics.sportingDraws, m15.draws); assert.notEqual(on.diagnostics.sportingDraws, m14.draws);
  const min = run15(profile, 20261016, 'minimal'); const full = run15(profile, 20261016, 'full'); assert.equal(trajectoryFingerprint(min), trajectoryFingerprint(full), 'registro completo y reducido: misma trayectoria');
  assert.equal(trajectoryFingerprint(on), m15.trajectorySha256); assert.deepEqual([on.score, on.diagnostics.sportingDraws], [m15prev.score, m15prev.draws], 'MOTOR-15B no cambia el deporte de la referencia de MOTOR-15');
});

test('M15·5 tiro con liberación y resolución: el margen divide la duración existente, la señal entre hitos conserva el tiro, sin reloj negativo ni minutos posteriores a la bocina', () => {
  assert.deepEqual(flightSplit(profile, 61), { lagTenths: 4, releaseAfterTenths: 57, durationTenths: 61, configuredTenths: 4 });
  assert.equal(flightSplit(profile, 2).lagTenths, 2, 'lag = min(margen, duración de esa operación)'); assert.equal(flightSplit(withSeeds({ 'shotFlight.pendingLagSeconds': 0 }), 50).lagTenths, 0);
  let crossed = 0;
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const res = run15(profile, seed);
    assert.equal(res.status, 'finished', res.errors.map((e) => e.message).join(';')); assert.equal(res.reconciliation.valid, 'válida', res.reconciliation.failed.join(','));
    for (const e of res.events) {
      assert.ok(e.clock.after >= 0 && e.clock.before >= e.clock.after, `reloj coherente en ${e.id}`);
      const v = e.effects?.vuelo; if (!v) continue;
      assert.ok(v.margenDecimas <= v.operacionDecimas && v.relojLiberacion >= v.relojResolucion); assert.ok(v.relojLiberacion > 0, 'la liberación es anterior a la señal');
      if (v.resolucionTrasSenal) { crossed += 1; assert.equal(v.relojResolucion, 0); assert.ok(v.consumidasDecimas <= v.operacionDecimas); assert.equal(e.clock.after, 0); }
    }
    const per = {}; for (const e of res.events) per[e.period] = (per[e.period] ?? 0) + e.durationTenths; for (const p of Object.keys(per)) assert.ok(per[p] <= (p <= 4 ? 6000 : 3000), 'ningún periodo suma más tiempo que su duración');
  }
  assert.ok(crossed >= 1, 'en seis encuentros hay al menos un tiro liberado antes de la señal y resuelto con el reloj a 0');
});

// ---------------------------------------------------------------------------------------------------------------- 6
test('M15·6 interferencia condicionada: masas excluyentes por oportunidad elegible (sin redistribuir), consecuencia desde la matriz, denominadores por tipo y copia extrema identificada (no mide frecuencia)', () => {
  const ms = interferenceMasses(profile, 'fieldGoal', { defensive: true, offensive: true }); assert.deepEqual([ms.defensive, ms.offensive], [0.001, 0.0005]); assert.ok(Math.abs(ms.residual - 0.9985) < 1e-12);
  const only = interferenceMasses(profile, 'fieldGoal', { defensive: true, offensive: false }); assert.equal(only.offensive, 0); assert.ok(Math.abs(only.residual - 0.999) < 1e-12, 'la masa del lado no elegible NO se redistribuye');
  assert.equal(interferenceOutcome(ms, 0.0005), 'defensive'); assert.equal(interferenceOutcome(ms, 0.0012), 'offensive'); assert.equal(interferenceOutcome(ms, 0.5), null);
  assert.equal(interferenceMasses(profile, 'lastFreeThrow', { defensive: false, offensive: true }).offensive, 0.00025);
  assert.throws(() => interferenceMasses(withSeeds({ 'interference.fieldGoal.defensiveP': 0.7, 'interference.fieldGoal.offensiveP': 0.6 }), 'fieldGoal', { defensive: true, offensive: true }));
  // MOTOR-15B §4.2: RG-I03 ya no deja la sanción adicional pendiente (técnica de categoría 2 administrada, ver tests/motor15b.test.js); las otras tres filas siguen provisionales
  for (const [sit, side] of [['fieldGoal', 'defensive'], ['fieldGoal', 'offensive'], ['lastFreeThrow', 'defensive'], ['lastFreeThrow', 'offensive']]) { const r = resolveInterference(profile, sit, side); assert.equal(r.ok, true); assert.equal(r.contrast, sit === 'lastFreeThrow' && side === 'defensive' ? 'contrastada' : 'provisional'); }
  assert.equal(resolveInterference(profile, 'lastFreeThrow', 'defensive').additionalSanction.status, 'administrada');
  // masa 0 → ningún sorteo de interferencia (el azar es el de MOTOR-14 salvo el margen)
  assert.equal(run15(withSeeds({ ...OFF, 'shotFlight.pendingLagSeconds': 0.35 }), 20261016).diagnostics.interference?.fieldGoal?.drawn ?? 0, 0);
  // copia extrema de laboratorio (NO es una frecuencia de referencia): fuerza ambas ramas para comprobar validez, crédito y reanudación
  const X = withSeeds({ 'interference.fieldGoal.defensiveP': 0.35, 'interference.fieldGoal.offensiveP': 0.35, 'interference.lastFreeThrow.defensiveP': 0.35, 'interference.lastFreeThrow.offensiveP': 0.35 });
  const seen = { fieldGoal: { defensive: 0, offensive: 0 }, lastFreeThrow: { defensive: 0, offensive: 0 } };
  for (const seed of [21, 22, 23, 24]) {
    const res = run15(X, seed); assert.equal(res.status, 'finished', res.errors.map((e) => e.message).join(';')); assert.equal(res.reconciliation.valid, 'válida', res.reconciliation.failed.join(','));
    const book = res.diagnostics.interference; assert.ok(book.fieldGoal.considered >= book.fieldGoal.drawn, 'denominadores por tipo de oportunidad');
    for (const e of res.events.filter((x) => x.effects?.interferencia)) {
      const i = e.effects.interferencia; seen[i.situacion][i.lado] += 1;
      const next = res.events[res.events.indexOf(e) + 1]; if (i.lado === 'offensive') assert.notEqual(next?.type, 'rebound', 'sin rebote tras una interferencia ofensiva');
      if (i.situacion === 'fieldGoal') { const shot = e.stats.find((f) => f.k === 'shot'); if (i.lado === 'defensive') assert.equal(shot.made, true); else { assert.ok(e.stats.some((f) => f.k === 'tov' && f.cause === 'interferencia ofensiva' && f.p === i.infractor)); if (shot.annulled) assert.equal(shot.made, false); } assert.equal(e.stats.filter((f) => f.k === 'blk').length, 0, 'sin TAP por la misma interferencia'); }
      else { const ft = e.stats.find((f) => f.k === 'ft'); assert.equal(ft.made, i.lado === 'defensive' ? true : false); }
    }
  }
  assert.ok(seen.fieldGoal.defensive && seen.fieldGoal.offensive && seen.lastFreeThrow.defensive && seen.lastFreeThrow.offensive, `las cuatro ramas se ejercitaron: ${JSON.stringify(seen)}`);
});

// ---------------------------------------------------------------------------------------------------------------- 7
import { analyze } from '../src/analysis/index.js';

test('M15·7 asistencias con productor causal: último pase, receptor previsto/efectivo, motivo de cierre; transición con recorrido autónomo y desvío tipado excluyen; sin AS ≤ FGM impuesto', () => {
  const res = run15(profile, 20261016, 'minimal'); const acta = res.acta;
  const credits = new Set(acta.credits.filter((c) => c.k === 'ast' && c.type === 'canasta').map((c) => c.event));
  let elig = 0; let excl = 0; const reasons = new Set();
  for (const e of res.events) for (const f of e.stats) if (f.k === 'shot' && f.feed) {
    const c = f.feed.close; assert.ok(c && typeof c.eligible === 'boolean' && c.reason, 'motivo de cierre registrado'); assert.equal(f.feed.intendedReceiver, f.feed.actualReceiver, 'el núcleo no genera desvíos: previsto = efectivo'); reasons.add(c.reason);
    if (f.made && !f.fromFoul) { assert.equal(credits.has(e.id), c.eligible, `${e.id}: el crédito sigue al motivo de cierre`); if (c.eligible) elig += 1; else excl += 1; }
  }
  assert.ok(elig > 0); assert.ok(reasons.size >= 2, `varios motivos: ${[...reasons].join(' | ')}`);
  // transición: la recepción en campo propio con recorrido autónomo no acredita
  let tr = 0; for (let seed = 30; seed < 36; seed++) { const r = run15(profile, seed); for (const e of r.events) for (const f of e.stats) if (f.k === 'shot' && f.feed && e.intent?.contexto === 'transición') { tr += 1; assert.equal(f.feed.close.eligible, false); assert.match(f.feed.close.reason, /campo propio/); } }
  assert.ok(tr >= 1, 'hay finalizaciones de transición con pase en la muestra');
  // el hecho tipado de desvío invalida la candidata (alcance declarado: no se genera)
  const ev = JSON.parse(JSON.stringify(res.events)); const target = ev.find((e) => e.stats.some((f) => f.k === 'shot' && f.made && f.feed?.close?.eligible)); const f = target.stats.find((x) => x.k === 'shot'); f.feed.intendedReceiver = 'EQ99-J99'; f.feed.close = { eligible: false, reason: 'desvío claro hacia otro destinatario' };
  const a2 = buildActa({ events: ev, lineups: res.lineups, input: res.input, possessions: res.possessions, status: res.status }, profile.statsPolicy);
  assert.equal(a2.credits.filter((c) => c.k === 'ast' && c.event === target.id).length, 0); assert.equal(a2.credits.filter((c) => c.k === 'ast').length, acta.credits.filter((c) => c.k === 'ast').length - 1);
  assert.equal(acta.policy, 'ACTA-MOTOR15B-R1');
});

// ---------------------------------------------------------------------------------------------------------------- 8
test('M15·8 estado propio por tramo y REC10: muestras reales en fronteras, audiencia sin filtrar, y la insuficiencia de cada regla se distingue (no una recomendación genérica)', () => {
  const res = run15(profile, 20261016, 'minimal'); const periods = res.periodScores.length;
  const own = analyze(res, { audience: 'own', team: 0 }).ownStates(0);
  assert.equal(own.available, true); assert.equal(own.boundaries.length, 2 * periods, 'inicio y final de cada periodo'); assert.equal(own.rows.length, 12);
  const row = own.rows.find((r) => r.samples.length); const e = row.samples.map((s) => s.energy.value); assert.ok(new Set(e).size > 1, 'no se repite el estado final en todos los periodos');
  assert.ok(row.samples.every((s) => typeof s.energy.bar === 'string' && s.energy.bar.length === 10)); assert.equal(Object.keys(row.samples[0].moments).length, 3); assert.ok(!('committed' in row.samples[0].moments.M_TIR), 'valores internos solo en diagnóstico');
  assert.ok('committed' in analyze(res, { audience: 'diagnostic' }).ownStates(0).rows[0].samples[0].moments.M_TIR);
  assert.equal(analyze(res, { audience: 'public', team: 0 }).ownStates(0).available, false); assert.equal(analyze(res, { audience: 'own', team: 1 }).ownStates(0).available, false, 'el rival no obtiene estados privados');
  // la muestra no consume azar ni cambia el deporte: mismos sorteos con y sin lectura
  assert.equal(res.diagnostics.sportingDraws, fixture('baseline-motor15b.json').draws);
  // REC10: insuficiencia diferenciada con lo observado y lo exigido; sin permiso → no disponible
  const a = analyze(res, { audience: 'own', team: 0 }); const items = a.recommendations(0).items; const ids = items.map((i) => i.id);
  assert.ok(ids.includes('REC10-01') && ids.includes('REC10-02'), 'cada regla informa su estado');
  for (const i of items) if (i.status === 'insuficiente') assert.match(i.reason, /de \d/, 'lo observado frente a lo exigido');
  const texts = items.filter((i) => i.status === 'insuficiente').map((i) => i.reason); assert.equal(new Set(texts).size, texts.length, 'no hay una recomendación genérica idéntica para las dos reglas');
  assert.ok(analyze(res, { audience: 'public', team: 0 }).recommendations(0).items.every((i) => i.status === 'no disponible para esta audiencia'));
});

// ---------------------------------------------------------------------------------------------------------------- 9
test('M15·9 guardar y continuar con una cola de sanciones pendiente: mismo futuro, sin repetir créditos, y el comando de incidencia se reproduce', () => {
  const mk = () => { const m = createMatch(buildMatchInput(profile, players, { seed: 41 }), profile, { detail: 'minimal', check: true }); stepN(m, 30); m.requestIncident({ category: 'flagrante', player: 'EQ02-J04', fouled: 'EQ01-J03' }); m.requestIncident({ category: 'tecnica1', player: 'EQ01-J04' }); return m; };
  const a = mk(); let n = 0; while (a.step() && !(a.adminPlan && a.adminPlan.index < a.adminPlan.steps.length && a.adminPlan.index > 0) && n++ < 30);
  assert.ok(a.adminPlan, 'hay una cola con series pendientes en la frontera guardada');
  const snap = JSON.parse(JSON.stringify(snapshotMatch(a))); const b = restoreMatch(snap);
  const ra = finish(a); const rb = finish(b);
  assert.equal(trajectoryFingerprint(rb), trajectoryFingerprint(ra)); assert.deepEqual(rb.score, ra.score); assert.equal(rb.diagnostics.sportingDraws, ra.diagnostics.sportingDraws);
  assert.equal(ra.events.filter((e) => e.type === 'free_throw').length, rb.events.filter((e) => e.type === 'free_throw').length, 'la serie pendiente no se repite ni se pierde');
  const rep = replayMatch(JSON.parse(JSON.stringify(finish(mk())))); assert.equal(rep.comparison.identical, true);
});
