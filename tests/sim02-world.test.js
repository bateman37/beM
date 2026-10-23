// SIM-MOTOR-02: historia individual de temporada (§9) y aprendizaje posterior al partido (§10), sobre partidos realmente generados. Mundo pequeño: dos competiciones sénior de seis equipos y una Sub-20 de cuatro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, SimMatch, buildSimResult, buildReferenceInput } from '../src/sim/index.js';
import { buildSimEssential } from '../src/sim/essential.js';
import { moduleExposure } from '../src/sim/exposure.js';
import { exposureFromEssential, exposureFromSimResult } from '../src/sim/learning.js';
import { ConsequenceLedger } from '../src/sim/consequences.js';
import { SeasonWorld } from '../src/season/world.js';
import { SeasonLedger, derived } from '../src/season/ledger.js';
import { validateSimInput } from '../src/sim/adapt.js';
import { buildTeamsInput } from '../src/matchday/scenario.js';
import { proposeFromMatch, applyProposal, undoApplication, createLedger } from '../src/learning/index.js';
import { makeLearningCopy, teamStatesOf, matchBelongsToCopy, isMatchApplied, nextMatchId } from '../src/lab/learning-model.js';

const { profile, players } = data; const ctx = makeContext(profile);

test('S02-11 historia individual: sumas desde partidos reales, tramos por club y competición, movimiento a mitad de calendario, retención, cambio de profundidad, SIM de cantera y cierre de temporada', () => {
  const w = new SeasonWorld({ profile, players, ctx }); w.playUntil(5);
  // jugador de rotación (con minutos) del club EQ05 que no es titular: traspaso administrativo con planes válidos antes y después
  const starters = new Set(Object.values(w.teams.get('EQ05').plan.starters)); const mover = w.teams.get('EQ05').players.filter((p) => !starters.has(p.id)).map((p) => ({ id: p.id, min: w.ledger.total(p.id).sums.minTenths })).sort((a, b) => b.min - a.min)[0].id; assert.ok(w.ledger.total(mover).sums.minTenths > 0);
  const back = w.teams.get('EQ02').players.at(-1).id; const t = w.transfer(mover, 'EQ02', 6); assert.ok(t.ok, JSON.stringify(t)); const tb = w.transfer(back, 'EQ05', 6); assert.ok(tb.ok, `intercambio: ambos clubes siguen con doce fichas (el detallado exige doce) ${JSON.stringify(tb).slice(0, 200)}`); assert.deepEqual(w.validateRosters(), [], 'planes válidos de ambos clubes tras el movimiento'); assert.equal(w.transfer(mover, 'EQ03', 3).ok, false, 'no se mueve hacia el pasado');
  w.depths['SEN-B'] = 'analysis'; w.direct(8); w.playUntil(10); w.setDepth('SEN-A', 'reference');
  // sumas desde los partidos: recuento independiente a partir de los registros esenciales conservados
  const all = [...w.results.values()]; let games = 0; let minTenths = 0; let fta = 0; let ftm = 0; const clubsSeen = new Set(); for (const r of all) { const line = r.model === 'sim' ? r.essential.box.players.find((p) => p.id === mover) : r.essential.acta.players.find((p) => p.id === mover); if (!line) continue; const mins = r.model === 'sim' ? line.sec * 10 : line.min_tenths; if (mins > 0) { games++; minTenths += Math.round(mins); fta += line.fta; ftm += line.ftm; clubsSeen.add(r.round <= 5 ? 'EQ05' : 'EQ02'); } }
  const tot = w.ledger.total(mover); assert.equal(tot.sums.games, games); assert.equal(tot.sums.fta, fta); assert.equal(tot.sums.ftm, ftm); assert.ok(Math.abs(tot.sums.minTenths - minTenths) <= games, 'minutos sumados (décimas) sin duplicar partidos'); assert.equal(tot.ftPct, fta ? ftm / fta : null, 'porcentaje desde sumas, no promedio de porcentajes');
  const stints = w.ledger.stintsOf(mover, { season: 'T1' }); assert.deepEqual([...new Set(stints.map((s) => s.club))].sort(), ['EQ02', 'EQ05'], 'tramos por club conservados'); assert.ok(stints.every((s) => s.competition === 'SEN-A')); assert.equal(stints.reduce((a, s) => a + s.sums.games, 0), tot.sums.games);
  assert.ok(w.ledger.stintsOf(mover).filter((s) => s.club === 'EQ05').every((s) => s.rounds.every((r) => r.round <= 5)) && w.ledger.stintsOf(mover).filter((s) => s.club === 'EQ02').every((s) => s.rounds.every((r) => r.round >= 6)), 'antes y después del movimiento');
  // fecha alcanzada: no se muestran totales de rondas futuras ya calculadas
  const at3 = w.visible(mover, 3); const at10 = w.visible(mover, 10); assert.ok(at3.sums.games <= 3 && at3.sums.games < at10.sums.games); assert.equal(at3.sums.pts, w.ledger.total(mover, { season: 'T1', upTo: 3 }).sums.pts);
  // idempotencia: reimportar el mismo partido o el mismo paquete no suma otra vez
  const rec = all.find((r) => r.model === 'sim'); const again = w.ledger.record(rec.essential, { season: 'T1', competition: rec.comp, round: rec.round, clubs: [rec.home, rec.away], model: 'sim', matchId: rec.matchId, attemptId: 2 }); assert.equal(again.duplicate, true); const clone = SeasonLedger.from(JSON.parse(JSON.stringify(w.ledger.toJSON()))); assert.equal(clone.record(rec.essential, { season: 'T1', competition: rec.comp, round: rec.round, clubs: [rec.home, rec.away], model: 'sim', matchId: rec.matchId, attemptId: 1 }).duplicate, true); assert.equal(JSON.stringify(clone.total(mover).sums), JSON.stringify(tot.sums));
  // resolutores: la cantera siempre SIM; el sénior dirigido usa el detallado solo DESPUÉS de activarlo; los ya terminados no cambian; los modelos no se mezclan en una tasa única
  assert.ok(all.filter((r) => r.comp === 'SUB20').every((r) => r.model === 'sim')); const ownA = all.filter((r) => r.comp === 'SEN-A' && [r.home, r.away].includes('EQ01')); assert.deepEqual(ownA.filter((r) => r.round <= 8).map((r) => r.model), ownA.filter((r) => r.round <= 8).map(() => 'sim')); assert.deepEqual(ownA.filter((r) => r.round > 8).map((r) => r.model), ownA.filter((r) => r.round > 8).map(() => 'detailed'));
  const ownPlayer = w.teams.get('EQ01').players[0].id; const adv = w.ledger.advanced(ownPlayer, 'sim'); const advD = w.ledger.advanced(ownPlayer, 'detailed'); assert.ok(adv && advD && adv.adv.teamControls > 0 && advD.adv.teamControls === 0, 'controles SIM y posesiones beM no comparten denominador');
  // identidades: copia experimental independiente (EQ01U) con su propio ámbito aunque comparta jugador de origen
  const youth = w.teams.get('EQ01U').players[0]; assert.notEqual(youth.id, ownPlayer); assert.ok(youth.age >= 16 && youth.age <= 18); assert.equal(w.ledger.stintsOf(youth.id).every((s) => s.competition === 'SUB20' && s.club === 'EQ01U'), true); assert.ok(w.ledger.stintsOf(youth.id).length >= 1);
  // retención: otra clasificación y otra profundidad no cambian el deporte (mismas huellas)
  const w2 = new SeasonWorld({ profile, players, ctx, depths: { 'SEN-A': 'reference', 'SEN-B': 'analysis', SUB20: 'analysis' } }); w2.playUntil(2); for (const [id, r] of w2.results) { const o = w.results.get(id); assert.equal(r.essential.identity.sportFingerprint, o.essential.identity.sportFingerprint, id); assert.deepEqual(r.score, o.score); } assert.ok([...w2.results.values()].some((r) => r.analysis) && ![...w2.results.values()].some((r) => r.comp === 'SEN-A' && r.analysis));
  // cierre de temporada y apertura de la siguiente conservando el histórico
  const t1 = JSON.stringify(w.ledger.total(mover, { season: 'T1' }).sums); const closed = w.closeSeason(); assert.equal(closed.matches, 72); assert.equal(closed.tables['SEN-A'].rows.length, 6); w.nextSeason('T2'); assert.equal(JSON.stringify(w.ledger.total(mover, { season: 'T1' }).sums), t1); assert.equal(w.visible(mover).sums.games, 0, 'la nueva temporada empieza vacía'); assert.equal(w.clubAt(mover, 0, 'T2').club, 'EQ02', 'el movimiento se conserva');
  console.log(`SIM02_TEMPORADA ${JSON.stringify({ partidos: all.length, detallados: all.filter((r) => r.model === 'detailed').length, jugadorMovido: mover, partidosDelMovido: games })}`);
});

test('S02-12 aprendizaje posterior: unidades, dosis normalizada, aplicación única por encuentro lógico, reintento, copia ajena, M1/M10, deshacer, resultado parcial y contraste P8/P16/P24', () => {
  const P = profile.familiarity; const base = buildReferenceInput(profile, players, 'EQ03', 'EQ04', { seed: 31 }); const copy = makeLearningCopy(base, profile, { mode: 'synthetic', id: 'LEARN18-S-EQ03-EQ04-d0-I1' });
  const L = { copy, matchSeq: 0 }; const matchId = nextMatchId(L); copy.input.labMatchId = matchId; const m = new SimMatch(copy.input, ctx, { matchId, attemptId: 1 }); m.finish(); const ess = buildSimEssential(m); assert.ok(ess.complete && ess.validity.valid);
  const expo = exposureFromEssential(ess); const ids = Object.keys(expo.players); assert.ok(ids.length >= 12);
  // unidades: 600 décimas = 1 min de juego vivo; los módulos no son horas; los tiempos por posición/rol no superan el vivo
  for (const [id, x] of Object.entries(expo.players)) { const pos = Object.values(x.positions).reduce((a, b) => a + b, 0); assert.ok(pos <= x.liveTenths && Object.values(x.offensiveRoles).reduce((a, b) => a + b, 0) <= x.liveTenths && Object.values(x.defensiveRoles).reduce((a, b) => a + b, 0) <= x.liveTenths, id); assert.ok(x.liveTenths / 600 <= 40 + 1e-9); }
  const { states } = teamStatesOf(copy.input, P, 0); const st = states.EQ03; const source = `${matchId}`; const prop = proposeFromMatch(st, expo, P, { source_id: `${source}|EQ03` }); assert.equal(prop.ok, true, JSON.stringify(prop.errors?.slice(0, 2)));
  assert.ok(Object.values(prop.players).some((p) => p.targets.length > 0)); const bench = ids.filter((id) => expo.players[id].liveTenths === 0 || !m.teams[0].byId[id]); void bench;
  // el banquillo sin minutos no recibe módulos ni dosis
  const noMinutes = Object.entries(expo.players).filter(([, x]) => x.liveTenths === 0).map(([id]) => id); for (const id of noMinutes) assert.deepEqual(expo.players[id].modules, {});
  // aplicación con recibo; segunda aplicación de la misma fuente rechazada; M1 ≠ M10; copia ajena
  const led = createLedger(); const ap = applyProposal(st, led, prop, P); assert.equal(ap.ok, true); assert.equal(applyProposal(ap.state, ap.ledger, prop, P).ok, false); assert.equal(isMatchApplied(ap.ledger, matchId, 'EQ03'), true, 'la fuente completa es `copia|M1|EQ03`'); assert.equal(isMatchApplied(ap.ledger, `${copy.id}|M10`, 'EQ03'), false);
  assert.equal(matchBelongsToCopy(matchId, copy.id).ok, true); assert.equal(matchBelongsToCopy(matchId, `${copy.id}0`).foreign, true, 'I1 no es I10'); assert.equal(matchBelongsToCopy(matchId, 'LEARN18-S-EQ03-EQ04-d0-I2').foreign, true);
  // reintento técnico (intento distinto) del MISMO encuentro lógico: la fuente exacta del núcleo cambia, pero la guarda por encuentro lógico no deja aplicar dos veces
  const cons = new ConsequenceLedger(); const first = cons.apply({ kind: 'learning', matchId, scope: 'EQ03', attemptId: 1 }); assert.equal(first.ok, true); const retry = exposureFromEssential({ ...ess, identity: { ...ess.identity, attemptId: 2 } }); assert.notEqual(retry.match.source_id, expo.match.source_id); assert.equal(cons.apply({ kind: 'learning', matchId: retry.match.logicalMatch, scope: 'EQ03', attemptId: 2 }).duplicate, true);
  // deshacer conserva las comprobaciones causales: no sobrescribe un aprendizaje posterior
  const un = undoApplication(ap.state, ap.ledger, 'APL-1'); assert.equal(un.ok, true); assert.ok(JSON.stringify(un.state.players) === JSON.stringify(st.players));
  // resultado parcial: se puede consultar, no se transforma en experiencia aplicable
  const part = new SimMatch(copy.input, ctx, { matchId: `${copy.id}|M2`, attemptId: 1 }); part.advance({ until: 900 }); const pres = buildSimResult(part, { events: false }); const pe = exposureFromSimResult(pres); assert.equal(pe.complete, false); const bad = proposeFromMatch(st, pe, P, { source_id: `${copy.id}|M2|EQ03` }); assert.equal(bad.ok, false); assert.ok(bad.errors.some((e) => e.path === 'exposure.complete'));
  // equivalencia de dosis: mismo reparto con distinto número de registros (créditos ×7) ⇒ misma propuesta; la procedencia no concede prima
  const scaled = JSON.parse(JSON.stringify(expo)); for (const x of Object.values(scaled.players)) for (const k of Object.keys(x.modules)) x.modules[k] *= 7; const ps = proposeFromMatch(st, scaled, P, { source_id: 'X|EQ03' }); const pr = proposeFromMatch(st, expo, P, { source_id: 'X|EQ03' }); const rnd = (x) => JSON.stringify(x, (k, v) => (typeof v === 'number' ? Math.round(v * 1e9) / 1e9 : v)); assert.ok(rnd(ps.nextState) === rnd(pr.nextState), 'más registros no producen más presupuesto de aprendizaje');
  const det = JSON.parse(JSON.stringify(expo)); det.match.model = 'beM-detailed'; assert.ok(rnd(proposeFromMatch(st, det, P, { source_id: 'X|EQ03' }).nextState) === rnd(pr.nextState), 'misma exposición normalizada ⇒ misma propuesta, con independencia del resolutor');
  // contraste de Polivalencia: P8/P16/P24 cambia la propuesta posterior y conserva partido y exposición
  const gain = (poly) => { const s2 = JSON.parse(JSON.stringify(st)); for (const p of Object.values(s2.players)) p.tacticalLearning = poly; const r = proposeFromMatch(s2, expo, P, { source_id: 'Y|EQ03' }); assert.equal(r.ok, true); let g = 0; for (const [id, pl] of Object.entries(r.nextState.players)) for (const f of ['positions', 'offensiveRoles', 'defensiveRoles', 'tactics']) for (const [k, e] of Object.entries(pl.block[f] ?? {})) g += e.level - s2.players[id].block[f][k].level; return g; };
  const g8 = gain(8); const g16 = gain(16); const g24 = gain(24); assert.ok(g8 < g16 && g16 < g24, `P8 ${g8} < P16 ${g16} < P24 ${g24}`); const m2 = new SimMatch(copy.input, ctx, { matchId, attemptId: 1 }); m2.finish(); assert.equal(buildSimEssential(m2).identity.sportFingerprint, ess.identity.sportFingerprint, 'el partido y la exposición no cambian con la Polivalencia');
  // pertinencia de la exposición: ninguna cobertura se acredita en una finalización cuya ficha no usa cobertura, y solo juegan los de pista
  const iso = m.events.filter((e) => e.ty === 'shot' && e.ctx === 'organized' && ctx.T.plays[e.play].coverage == null); const isoMods = moduleExposure(m, iso); assert.ok(Object.values(isoMods).every((mm) => Object.keys(mm).every((k) => !k.startsWith('COB'))), 'sin práctica de cobertura en acciones incompatibles');
  const mods = moduleExposure(m, m.events); assert.ok(Object.keys(mods).every((id) => (expo.players[id]?.liveTenths ?? 0) > 0), 'ningún módulo para jugadores sin minutos'); const val = validateSimInput(copy.input, ctx.sp, ctx.T); assert.deepEqual(val, []);
  void derived; void buildTeamsInput;
});
