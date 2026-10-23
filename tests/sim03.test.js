// SIM-MOTOR-03 · correcciones de 02B (C03-01…11). Pruebas agrupadas por riesgo, con entradas fijas y pequeñas; los partidos se reutilizan entre aserciones. Cada regresión reproduce el comportamiento anterior descrito
// en el encargo (`docs/prompts/SIM-MOTOR-03-correcciones-02B-y-campana.md`). No son campañas: la evidencia comparativa de 03 se genera con scripts aparte.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { data } from './helpers.js';
import { makeContext, contextToJSON, buildReferenceInput, SimMatch, buildSimResult, SIM_VERSION } from '../src/sim/index.js';
import { advanceAutomatic, playAutomatic, coachReview } from '../src/sim/coachsim.js';
import { snapshotSim, restoreSim, validateSimSnapshot } from '../src/sim/snapshot.js';
import { buildSimEssential } from '../src/sim/essential.js';
import { sha256Hex, canonical } from '../src/sim/fp.js';
import { referenceTeamMap } from '../src/sim/teams.js';
import { ShardRunner } from '../src/sim/shard.js';
import { ConsequenceLedger } from '../src/sim/consequences.js';
import { Matchday } from '../src/matchday/index.js';
import { MatchdayPool } from '../src/matchday/pool.js';
import { SeasonLedger, validateRecordable } from '../src/season/ledger.js';
import { SeasonWorld } from '../src/season/world.js';
import { defenseTable } from '../src/sim/analysis.js';
import { simReader } from '../src/sim/readers.js';

const { profile, players } = data; const ctx = makeContext(profile);
const inputOf = (seed, a = 'EQ03', b = 'EQ04') => buildReferenceInput(profile, players, a, b, { seed });
const deep = (x) => JSON.parse(JSON.stringify(x));
const OT_SEED = 9097; // EQ03–EQ04, un partido con prórroga bajo la dirección automática (evidencia conocida, sin búsqueda)
const reseal = (snap) => { const { integrity, ...rest } = snap; const body = canonical(rest); return { ...rest, integrity: { algorithm: 'sha256', digest: sha256Hex(body), bytes: body.length } }; };

// ---------------------------------------------------------------------------------------------------------------------------------- C03-01 · C03-02 · C03-03
const standings = (a, b) => ({ C: { artificial: true, rows: [a, b].map((team) => ({ team, w: 0, l: 0, pf: 0, pa: 0 })) } });
const fixtures = () => { const i1 = inputOf(OT_SEED); const i2 = inputOf(777); return { fx: [{ id: 'EARLY', competition: 'C', start: 0, input: i1 }, { id: 'LATE', competition: 'C', start: 1200, input: i2 }], st: { C: { artificial: true, rows: [...i1.teams, ...i2.teams].map((t) => ({ team: t.id, w: 0, l: 0, pf: 0, pa: 0 })) } } }; };
const mkDay = () => { const { fx, st } = fixtures(); return new Matchday({ id: 'J', fixtures: fx, standings0: st, ctx, policy: true }); };
const digest = (md) => ({ results: Object.fromEntries(Object.entries(md.results).map(([k, r]) => [k, [r.essential.identity.sportFingerprint, r.essential.score.final, r.valid]])), table: md.table('C', 'final').rows.map((r) => [r.team, r.w, r.l, r.pf, r.pa, r.rank]), decisions: md.decisions, log: md.log.map((l) => [l.barrier, l.T, l.packets.map((p) => [p.id, p.status, p.score, p.published])]) });

test('S03-01 recuperación de jornada con un encuentro ya terminado (y prórroga): misma jornada, mismo resultado, mismas tablas y decisiones; el terminado no desaparece ni se regenera', () => {
  const ctl = mkDay(); ctl.runToEnd(); assert.equal(ctl.done, true); assert.ok(ctl.results.EARLY.essential.score.overtimes >= 1, 'el cierre con prórroga está cubierto por una entrada conocida');
  const a = mkDay(); let n = 0; while (a.packets.get('EARLY').status !== 'finished' && n++ < 200) a.step(); assert.equal(a.packets.get('LATE').status, 'running', 'EARLY terminó y LATE continúa');
  const snap = deep(a.snapshot()); assert.deepEqual(Matchday.validate(snap), []); const b = Matchday.restore(snap);
  assert.deepEqual([...b.packets.keys()].sort(), ['EARLY', 'LATE'], 'al restaurar aparecen ambos');
  b.step(); assert.deepEqual([...b.packets.keys()].sort(), ['EARLY', 'LATE'], 'en la siguiente barrera EARLY no desaparece del conjunto publicado (antes: solo LATE)');
  assert.equal(b.packets.get('EARLY').status, 'finished'); assert.deepEqual(b.packets.get('EARLY').score, a.packets.get('EARLY').score, 'conserva marcador, estado y competición'); assert.equal(b.packets.get('EARLY').competition, 'C'); assert.equal(b.packets.get('EARLY').valid, true);
  const q = b.result('EARLY'); assert.equal(q.conserved, true); assert.equal(q.coverage, 'essential'); assert.equal(q.essential.identity.matchId, 'EARLY'); assert.equal(b.shard.has('EARLY'), false, 'consultar no regenera un motor que ya no existe');
  b.runToEnd(); assert.equal(b.done, true, 'done depende de todos los encuentros, también del terminado recuperado (antes: nunca)');
  assert.deepEqual(digest(b), digest(ctl), 'jornada sin interrupción = recuperada: resultados, tablas, decisiones y registro de barreras');
  const tbl = b.table('C', 'final'); assert.equal(tbl.rows.reduce((s, r) => s + r.played, 0), 4, 'cada encuentro cuenta una vez en la clasificación');
});

test('S03-02 el guardado es un instante independiente: capturar → seguir el original → validar → restaurar → continuar = control; modificar la captura no toca el partido vivo', () => {
  const inp = inputOf(424242); const ctl = new SimMatch(inp, ctx, { matchId: 'S03-02' }); ctl.advance({ until: 125 }); ctl.finish(); const want = buildSimResult(ctl, { events: false });
  const m = new SimMatch(inp, ctx, { matchId: 'S03-02' }); m.advance({ until: 125 }); const snap = snapshotSim(m); const frozen = canonical(snap); const gtAtCapture = snap.state.gt; assert.ok(snap.state.events.length > 0);
  m.finish(); assert.ok(m.gt > gtAtCapture && m.events.length > snap.state.events.length, 'el original siguió generando');
  assert.equal(canonical(snap), frozen, 'la captura no cambió al continuar el original (antes: events/segments vivos)'); assert.deepEqual(validateSimSnapshot(snap), [], 'la integridad sigue coincidiendo con lo guardado');
  assert.ok(snap.state.events.at(-1).t <= snap.state.gt + 1e-9 && snap.state.segments.at(-1).end <= snap.state.gt + 1e-9, 'secciones del mismo instante');
  const wire = deep(snap); const r = restoreSim(wire, ctx); r.finish(); const got = buildSimResult(r, { events: false }); assert.equal(got.sportFingerprint, want.sportFingerprint); assert.deepEqual(got.score.final, want.score.final); assert.equal(r.rng.draws, ctl.rng.draws); assert.equal(r.events.length, ctl.events.length);
  // la captura no comparte estructuras mutables con el partido vivo
  const live = new SimMatch(inp, ctx); live.advance({ until: 125 }); const s2 = snapshotSim(live); const nEv = live.events.length; s2.state.events.push({ junk: 1 }); s2.state.segments[0].lineups = null; s2.state.teams[0].players[0].energy = -5; assert.equal(live.events.length, nEv); assert.ok(Array.isArray(live.segments[0].lineups)); assert.notEqual(live.teams[0].players[0].energy, -5);
  // sufijo privado: el presente publicado y el generado por delante siguen separados en el guardado
  assert.equal(snap.state.published, 125); assert.ok(snap.state.gt >= 125);
});

test('S03-02b jornada: capturar → continuar la original → la captura sigue válida, se restaura y continúa igual que el control', () => {
  const ctl = mkDay(); ctl.runToEnd(); const a = mkDay(); a.runUntil(600); const snap = a.snapshot(); const frozen = canonical(snap); a.runToEnd();
  assert.equal(canonical(snap), frozen, 'la captura de la jornada no cambia al continuar la original'); assert.deepEqual(Matchday.validate(snap), []);
  const b = Matchday.restore(deep(snap)); b.runToEnd(); assert.deepEqual(digest(b), digest(ctl));
  // mutar el guardado no altera la sesión viva
  const live = mkDay(); live.runUntil(240); const s2 = live.snapshot(); const nlog = live.log.length; s2.log.push({ junk: 1 }); s2.decisions.push({ junk: 1 }); assert.equal(live.log.length, nlog);
});

test('S03-03 compatibilidad explícita: guardado válido de SIM-MOTOR-02 continúa exacto; incompatible con suma correcta, incompleto y alterado se rechazan por motivos distintos, sin tocar archivo ni sesión', () => {
  const fix = JSON.parse(readFileSync(new URL('./fixtures/sim-snapshot-02.json', import.meta.url), 'utf8')); const old = fix.snap; assert.equal(old.simVersion, '0.2.0-SIMMOTOR02');
  assert.deepEqual(validateSimSnapshot(old), [], 'el guardado real de 02 es válido para este lector (compatibilidad documentada, no por número de schema)');
  const r = restoreSim(deep(old), ctx); r.finish(); const res = buildSimResult(r, { events: false }); assert.deepEqual(res.score.final, fix.final.score); assert.equal(r.rng.draws, fix.final.draws); assert.equal(res.sportFingerprint, fix.final.sportFingerprint, 'continuación exacta del guardado de 02');
  const m = new SimMatch(inputOf(5), ctx); m.advance({ until: 130 }); const good = snapshotSim(m, { embedContext: false }); assert.equal(good.simVersion, SIM_VERSION);
  const before = canonical(good); const badVer = reseal({ ...deep(good), simVersion: '99.0.0-INCOMPATIBLE' }); const badRes = reseal({ ...deep(good), resultSchema: 'beM-sim-match/999' }); const badSchema = reseal({ ...deep(good), schema: 'beM-sim-snapshot/999' });
  for (const [bad, path] of [[badVer, 'simVersion'], [badRes, 'resultSchema'], [badSchema, 'schema']]) { assert.equal(bad.integrity.digest, reseal(bad).integrity.digest, 'la suma es COHERENTE: la prueba no se apoya en un checksum roto'); const errs = validateSimSnapshot(bad); assert.ok(errs.some((e) => e.path === path), `${path}: ${JSON.stringify(errs)}`); assert.ok(!errs.some((e) => e.path === 'integrity'), 'el rechazo es por compatibilidad, no por integridad'); assert.throws(() => restoreSim(bad, ctx), /rechazado/); }
  const partial = deep(good); delete partial.state.rng; assert.ok(validateSimSnapshot(partial).some((e) => e.path === 'state.rng' && /incompleto/.test(e.message)));
  const altered = deep(good); altered.state.score = [999, 0]; assert.ok(validateSimSnapshot(altered).some((e) => e.path === 'integrity'));
  assert.equal(canonical(good), before, 'validar y rechazar no modifica el guardado');
  // jornada: la revisión incompatible de un encuentro contenido o de la propia jornada también se rechaza
  const day = mkDay(); day.runUntil(240); const ds = day.snapshot(); const bad = reseal({ ...deep(ds), simVersion: '99.0.0-INCOMPATIBLE' }); assert.ok(Matchday.validate(bad).some((e) => e.path === 'simVersion')); assert.throws(() => Matchday.restore(bad), /rechazada/);
  const inner = deep(ds); inner.fixtures[0].state.simVersion = '99.0.0'; assert.ok(Matchday.validate(reseal(inner)).some((e) => e.path.startsWith('fixtures.EARLY.simVersion')));
});

// ---------------------------------------------------------------------------------------------------------------------------------- C03-04 · C03-05 · C03-06 · C03-09
test('S03-04 registro histórico validado y atómico: parciales, errores, no válidos y entradas mal formadas se rechazan sin mutar; el reintento válido sigue posible; sin duplicados; ámbito por temporada y competición', () => {
  const full = new SimMatch(inputOf(31), ctx, { matchId: 'H|R1', attemptId: 1 }); full.finish(); const ess = buildSimEssential(full); assert.ok(ess.complete && ess.validity.valid);
  const part = new SimMatch(inputOf(31), ctx, { matchId: 'H|R1', attemptId: 1 }); part.advance({ until: 125 }); const pess = buildSimEssential(part); assert.equal(pess.complete, false);
  const c = (o = {}) => ({ season: 'T1', competition: 'LIGA', round: 1, clubs: ['EQ03', 'EQ04'], model: 'sim', matchId: 'H|R1', attemptId: 1, ...o });
  const led = new SeasonLedger(); const snapshot = () => canonical(led.toJSON());
  const empty = snapshot(); const r0 = led.record(pess, c()); assert.equal(r0.ok, false); assert.equal(r0.rejected, true); assert.ok(r0.errors.some((e) => e.path === 'essential.complete')); assert.equal(snapshot(), empty, 'un parcial en curso (publicado a 125 s, valid=false) no suma nada (antes: se aceptaba)');
  const bad = deep(ess); bad.box.players[2].pts += 5; assert.equal(led.record(bad, c()).rejected, true); assert.equal(snapshot(), empty, 'una entrada mal formada no consume la consecuencia ni deja sumas parciales');
  const noval = deep(ess); noval.validity = null; const rn = led.record(noval, c()); assert.equal(rn.rejected, true); assert.ok(rn.errors.some((e) => e.path === 'essential.validity' && /no evaluada/.test(e.message)), 'la validez no evaluada no se inventa como válida'); assert.equal(snapshot(), empty);
  const invalid = deep(ess); invalid.validity = { ...invalid.validity, valid: false }; assert.equal(led.record(invalid, c()).rejected, true); const err = deep(ess); err.status = 'error'; assert.equal(led.record(err, c()).rejected, true); assert.equal(snapshot(), empty);
  assert.equal(led.record(ess, c({ clubs: ['EQ03'] })).rejected, true); assert.equal(led.record(ess, c({ matchId: 'OTRO' })).rejected, true, 'el esencial es de otro encuentro'); assert.equal(snapshot(), empty);
  const ok = led.record(ess, c()); assert.equal(ok.ok, true, 'después de los rechazos, la entrada válida del mismo encuentro se acepta');
  const pts = (id) => ess.box.players.find((p) => p.id === id).pts; const star = ess.box.players.slice().sort((a, b) => b.pts - a.pts)[0]; assert.equal(led.total(star.id).sums.pts, pts(star.id)); assert.equal(led.total(star.id).sums.games, 1);
  const teamPts = [0, 0]; for (const p of ess.box.players) teamPts[p.team] += led.total(p.id).sums.pts; assert.deepEqual(teamPts, ess.score.final, 'sumas exactas');
  const after = snapshot(); assert.equal(led.record(ess, c()).duplicate, true); assert.equal(led.record(ess, c({ attemptId: 2 })).duplicate, true, 'un reintento técnico no duplica el encuentro lógico'); assert.equal(snapshot(), after);
  const imported = SeasonLedger.from(deep(led.toJSON())); assert.equal(imported.record(ess, c()).duplicate, true, 'tras importar el histórico sigue siendo duplicado'); assert.equal(canonical(imported.toJSON()), after);
  assert.equal(led.record(ess, c({ season: 'T2' })).ok, true, 'otra temporada: distinto ámbito'); assert.equal(led.record(ess, c({ competition: 'COPA' })).ok, true, 'otra competición');
  // el club sale del contexto del encuentro, no del prefijo del identificador del jugador
  const led2 = new SeasonLedger(); led2.record(ess, c({ clubs: ['ZZ-A', 'ZZ-B'] })); const some = ess.box.players.find((p) => p.team === 0 && p.sec > 0); assert.equal(led2.stintsOf(some.id)[0].club, 'ZZ-A');
  // rechazo de un estado marcado como definitivo sin la comprobación pertinente
  assert.ok(validateRecordable(pess, c()).length > 0);
});

test('S03-05 consulta histórica sin detalle futuro: sumas, rondas, detalle por encuentro, tramos y modelos filtrados por fecha; lo devuelto no permite alterar el registro', () => {
  const led = new SeasonLedger(); const ids = [];
  for (let r = 1; r <= 3; r++) { const m = new SimMatch(inputOf(60 + r), ctx, { matchId: `Q|R${r}`, attemptId: 1 }); m.finish(); const e = buildSimEssential(m); ids.push(`Q|R${r}`); assert.equal(led.record(e, { season: 'T1', competition: 'LIGA', round: r, clubs: ['EQ03', 'EQ04'], model: 'sim', matchId: `Q|R${r}`, attemptId: 1 }).ok, true); }
  const pid = 'EQ03-J01'; const full = led.stintsOf(pid, { upTo: Infinity })[0]; assert.equal(full.perMatch.length, 3);
  const q = led.stintsOf(pid, { upTo: 1 }); const wire = JSON.stringify(q); assert.equal(q[0].sums.games, 1); assert.equal(q[0].perMatch.length, 1, 'antes: perMatch conservaba las rondas 1 a 3'); assert.ok(!wire.includes('Q|R2') && !wire.includes('Q|R3'), 'la respuesta serializada no contiene encuentros futuros');
  assert.equal(q[0].rounds.length, 1); const bm = Object.values(q[0].byModel)[0]; assert.equal(bm.games, 1); assert.equal(led.total(pid, { upTo: 1 }).sums.games, 1);
  assert.deepEqual(led.matchesUpTo({ upTo: 2 }).map((m) => m.matchId), ['Q|R1', 'Q|R2']); assert.equal(led.stintsOf(pid, { upTo: 1, competition: 'COPA' }).length, 0, 'competición filtrada de forma coherente'); assert.equal(led.stintsOf(pid, { season: 'T9' }).length, 0);
  const before = canonical(led.toJSON()); for (const x of [led.stintsOf(pid, { upTo: 1 })[0], led.stintsOf(pid)[0]]) { x.sums.pts = 9999; x.perMatch.length = 0; x.rounds.push('x'); x.byModel = null; } led.matchesUpTo({})[0].matchId = 'ROTO'; assert.equal(canonical(led.toJSON()), before, 'el registro interno no se altera desde lo devuelto');
});

test('S03-06 consecuencias revertidas: el índice de vigentes se reconstruye sin las revertidas; reaplicar y reconstruir mantiene una vigente; el rollback de la guarda no reaparece', () => {
  const l = new ConsequenceLedger(); assert.equal(l.apply({ kind: 'learning', matchId: 'C|M1', scope: 'EQ03', attemptId: 1 }).ok, true); l.revert('learning', 'C|M1', 'EQ03'); assert.equal(l.has('learning', 'C|M1', 'EQ03'), false);
  let r = ConsequenceLedger.from(deep(l.toJSON())); assert.equal(r.has('learning', 'C|M1', 'EQ03'), false, 'antes: tras reconstruir has=true'); assert.equal(r.records.length, 1, 'el historial se conserva'); assert.equal(r.records[0].reverted, true);
  const again = r.apply({ kind: 'learning', matchId: 'C|M1', scope: 'EQ03', attemptId: 1 }); assert.equal(again.ok, true, 'reaplicación válida tras deshacer'); r = ConsequenceLedger.from(deep(r.toJSON())); assert.equal(r.has('learning', 'C|M1', 'EQ03'), true, 'la reaplicación no queda anulada por la anotación antigua');
  assert.equal(r.apply({ kind: 'learning', matchId: 'C|M1', scope: 'EQ03', attemptId: 2 }).duplicate, true, 'vigente una vez: sin doble presupuesto'); assert.equal(r.records.length, 2); assert.equal(r.records.filter((x) => !x.reverted).length, 1);
  // identidad completa: otra copia/equipo/fuente no se ve afectada
  assert.equal(r.has('learning', 'C|M1', 'EQ04'), false); assert.equal(r.has('learning', 'C|M10', 'EQ03'), false);
  // rollback de la guarda (aplicar → fallar la propuesta → revert) y reconstrucción
  const g = new ConsequenceLedger(); g.apply({ kind: 'learning', matchId: 'C|M2', scope: 'EQ03', attemptId: 1 }); g.revert('learning', 'C|M2', 'EQ03'); const g2 = ConsequenceLedger.from(deep(g.toJSON())); assert.equal(g2.has('learning', 'C|M2', 'EQ03'), false); assert.equal(g2.apply({ kind: 'learning', matchId: 'C|M2', scope: 'EQ03', attemptId: 1 }).ok, true);
});

test('S03-09 movimiento administrativo: solo con efecto en la ronda siguiente; intercambio atómico; planes válidos, identidades y doce fichas', () => {
  const w = new SeasonWorld({ profile, players, ctx }); w.playUntil(2); const mover = 'EQ05-J11'; const back = w.teams.get('EQ02').players.at(-1).id;
  const snap = () => canonical({ teams: [...w.teams].map(([k, t]) => [k, t.players.map((p) => p.id), t.plan]), mem: [...w.membership] });
  const before = snap();
  for (const at of [8, 2, 4, 0]) { const r = w.transfer(mover, 'EQ02', at); assert.equal(r.ok, false, `ronda ${at} rechazada`); assert.match(r.reason, /ronda siguiente \(3\)/); } assert.equal(snap(), before, 'las fechas inválidas se rechazan antes de tocar plantilla, plan o pertenencia (antes: atRound=8 alineaba ya en la ronda 1)');
  const bad = w.transferAll([{ playerId: mover, toClub: 'EQ02', atRound: 3 }, { playerId: back, toClub: 'NOEXISTE', atRound: 3 }]); assert.equal(bad.ok, false); assert.equal(snap(), before, 'si el segundo movimiento no puede realizarse, tampoco se confirma el primero');
  const skew = w.transferAll([{ playerId: mover, toClub: 'EQ02', atRound: 3 }]); assert.equal(skew.ok, false); assert.match(skew.reason, /tamaño/); assert.equal(snap(), before, 'un movimiento unilateral cambiaría las fichas de los clubes');
  const ok = w.transferAll([{ playerId: mover, toClub: 'EQ02', atRound: 3 }, { playerId: back, toClub: 'EQ05', atRound: 3 }]); assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(w.teams.get('EQ02').players.length, 12); assert.equal(w.teams.get('EQ05').players.length, 12); assert.deepEqual(w.validateRosters(), []);
  assert.equal(w.clubAt(mover, 2).club, 'EQ05', 'hasta la ronda ya jugada sigue en su club'); assert.equal(w.clubAt(mover, 3).club, 'EQ02', 'la ronda siguiente ya lo refleja'); const fx = w.calendar['SEN-A'][2].flat().filter((t) => ['EQ02', 'EQ05'].includes(t));
  for (const t of fx) { const ids = w.inputOf('SEN-A', 3, t, 'EQ01').teams[0].players.map((p) => p.id); assert.equal(ids.includes(mover), t === 'EQ02', `la entrada de la ronda 3 de ${t} refleja el movimiento`); }
});

// ---------------------------------------------------------------------------------------------------------------------------------- C03-07 · C03-08
test('S03-07 estadísticas derivadas con universos correctos: defensa incluye faltas de tiro y bonus aparte; quintetos con controles observados y ausencia tipada; tapones recibidos del detallado', async () => {
  const m = new SimMatch(inputOf(76), ctx, { matchId: 'D|1' }); playAutomatic(m); const res = buildSimResult(m, { events: true, reconcile: false, analysis: true });
  // A · eficiencia defensiva: el desglose suma el total rival del MISMO universo
  const tab = defenseTable(res.segments, res.events, res.published);
  for (const k of [0, 1]) { const rows = tab[k]; const fin = rows.reduce((s, r) => s + r.oppFinalizations, 0); const pts = rows.reduce((s, r) => s + r.oppPts, 0); assert.equal(fin, res.familyDenominators[1 - k].finalizations, `finalizaciones rivales de ${k}: tiro + falta de tiro + serie ligada, una vez`); assert.equal(pts, res.score.final[1 - k], 'puntos rivales = marcador del rival');
    const bonusSeries = res.events.filter((e) => e.ty === 'ft' && e.cause === 'bonus' && e.k === 1 && e.tm === 1 - k).length; assert.equal(rows.reduce((s, r) => s + r.oppBonusSeries, 0), bonusSeries, 'el bonus sin familia tiene su categoría real'); assert.equal(rows.reduce((s, r) => s + r.oppBonusPts, 0), res.events.filter((e) => e.ty === 'ft' && e.cause === 'bonus' && e.made && e.tm === 1 - k).length);
    const shotOnly = new Set(res.events.filter((e) => e.ty === 'shot' && e.tm === 1 - k).map((e) => e.fin)).size; assert.ok(shotOnly <= fin); }
  assert.ok([0, 1].some((k) => { const shotOnly = new Set(res.events.filter((e) => e.ty === 'shot' && e.tm === 1 - k).map((e) => e.fin)).size; return shotOnly < res.familyDenominators[1 - k].finalizations; }), 'el partido contiene finalizaciones solo con falta (antes se omitían)');
  assert.deepEqual(res.analysis.defense, tab, 'el agregado de Análisis coincide con el cálculo desde hechos');
  // B · quintetos: controles observados, no estimados por minutos
  for (const k of [0, 1]) { const qs = res.quintets.filter((q) => q.team === k); assert.equal(qs.reduce((s, q) => s + q.ctlFor, 0), res.controls[k]); assert.equal(qs.reduce((s, q) => s + q.ctlAgainst, 0), res.controls[1 - k]); }
  const rd = simReader(res); const rot = rd.rotaciones(); const q0 = rot.quintets.find((q) => q.controlsFor > 0 && q.controlsAgainst > 0); assert.equal(q0.offensiveProductionPer100, Math.round((100 * q0.pf / q0.controlsFor) * 100) / 100); assert.equal(q0.concededProductionPer100, Math.round((100 * q0.pa / q0.controlsAgainst) * 100) / 100);
  const stub = simReader({ audience: 'diagnostic', segments: [], identity: { teams: [{ id: 'A' }, { id: 'B' }] }, box: { players: [] }, quintets: [{ team: 0, ids: ['x'], min: 5, pf: 30, pa: 25, ctlFor: 16, ctlAgainst: 15, intervals: [] }, { team: 1, ids: ['y'], min: 1, pf: 0, pa: 0, ctlFor: 0, ctlAgainst: 0, intervals: [] }] }).rotaciones().quintets;
  assert.equal(stub[0].diffPer100OwnControls, 31.25, '+5 en 16 controles propios = +31,25 por 100 (la vista anterior daba +32,5 estimando por minutos)'); assert.equal(stub[0].offensiveProductionPer100, 187.5); assert.equal(stub[0].concededProductionPer100, 166.67); assert.equal(stub[0].balancePer100, 20.83, 'balance = diferencia de tasas, distinto de la diferencia por controles propios');
  assert.deepEqual(stub[1].offensiveProductionPer100, { absent: 'denominador_cero' }); assert.deepEqual(stub[1].balancePer100, { absent: 'denominador_cero' }); assert.doesNotMatch(JSON.stringify(stub[1]), /Infinity|NaN/);
  // individual: cuota de cierres desde numeradores observados
  const lines = rd.acta().players.flat(); const withFin = lines.filter((p) => p.finalizationsSim > 0); assert.ok(withFin.length > 5); for (const p of withFin) assert.equal(p.closingShare, Math.round((p.finalizationsSim / res.familyDenominators[p.team].finalizations) * 1000) / 1000);
  // C · detallado: el contador de tapones recibidos llega al histórico y DNP no suma partido
  const { playDetailed } = await import('../src/matchday/detailed.js'); const { commonLines } = await import('../src/season/ledger.js'); const { inputFor } = await import('./helpers.js');
  const ess = playDetailed(inputFor(4), profile); const lines2 = commonLines('detailed', ess); const blkMade = ess.acta.players.reduce((s, p) => s + p.blk, 0); const blkRec = ess.acta.players.reduce((s, p) => s + p.blk_rec, 0); assert.ok(blkRec > 0, 'el partido tiene tapones'); assert.equal(blkRec, blkMade, 'cada tapón tiene un receptor'); assert.equal(lines2.reduce((s, l) => s + l.line.blkAgainst, 0), blkRec, 'antes: blkAgainst = 0 para todos');
  assert.ok(ess.acta.players.every((p) => Number.isInteger(p.min_tenths))); const dnp = ess.acta.players.filter((p) => p.min_tenths === 0); assert.equal(lines2.length, ess.acta.players.length - dnp.length, 'sin minutos no hay partido jugado'); assert.ok(lines2.every((l) => l.line.minTenths > 0));
  assert.equal(new SeasonLedger().record(ess, { season: 'T', competition: 'C', round: 1, clubs: [ess.identity.teams[0].id, ess.identity.teams[1].id], model: 'detailed', matchId: 'DET-1' }).ok, true);
});

test('S03-08 conservación útil y ausencia tipada: Análisis conserva defensa, participación y órdenes desde agregados; Referencia declara lo no conservado; sin datos no hay ceros', () => {
  const m = new SimMatch(inputOf(76), ctx, { matchId: 'D|2' }); playAutomatic(m); assert.ok(m.coach.log.length + m.commandLog.length >= 0);
  const full = buildSimResult(m, { events: true, reconcile: false, analysis: true }); const ana = buildSimResult(m, { events: false, reconcile: false, analysis: true });
  assert.equal(ana.events, undefined); const rd = simReader(ana); const d = rd.defensa(); assert.ok(Array.isArray(d.byTeam), 'antes: puntos recibidos = 0 con events=false'); for (const k of [0, 1]) assert.equal(d.byTeam[k].reduce((s, r) => s + r.oppPts, 0), ana.score.final[1 - k]);
  assert.deepEqual(d.byTeam, simReader(full).defensa().byTeam, 'mismas cifras con y sin secuencia de hechos'); assert.ok(Object.keys(rd.ataque().participation[0]).length > 0, 'participación por ficha conservada'); assert.ok(Array.isArray(rd.evolucion().orders), 'órdenes aplicadas con su momento');
  assert.deepEqual(rd.acta().players.flat().map((p) => p.finalizationsSim), simReader(full).acta().players.flat().map((p) => p.finalizationsSim), 'cuota de cierres desde agregados = desde hechos');
  const pub = buildSimResult(m, { events: false, reconcile: false, analysis: true, audience: 'public' }); assert.equal(pub.analysis.orders.status, 'sin_autorizacion'); const own = buildSimResult(m, { events: false, reconcile: false, analysis: true, audience: 'own', team: 0 }); assert.ok(own.analysis.orders.every((o) => o.team === 0), 'órdenes por audiencia');
  // Referencia / esencial: lo no conservado se declara; sin hechos ni agregados el lector devuelve «no conservado», no ceros
  const ess = buildSimEssential(m); assert.ok(ess.retention.notConserved.some((x) => x.id === 'quintets') && ess.retention.conserved.includes('familyDenominators'));
  const bare = buildSimResult(m, { events: false, reconcile: false }); const dd = simReader(bare).defensa(); assert.equal(dd.byTeam.status, 'no_conservado'); assert.match(dd.byTeam.reason, /no es un cero/); assert.equal(simReader(bare).evolucion().orders.status, 'no_conservado'); assert.equal(simReader(bare).acta().players.flat()[0].closingShareAbsent, 'no_conservado');
});

// ---------------------------------------------------------------------------------------------------------------------------------- C03-10 · C03-11
const fpOf = (m) => buildSimResult(m, { events: false, reconcile: false }).sportFingerprint;
test('S03-10 pool de jornada: la petición y el encuentro tienen identificadores distintos; la orden llega una vez al encuentro indicado y el otro queda intacto; rechazos tipados', async () => {
  const A = inputOf(5); const B = inputOf(6); const orderPlan = { styles: { ...A.teams[0].plan.styles, organizedPace: 5 } }; const barriers = [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440, 1560, 1680, 1800, 1920, 2040, 2160, 2280, 2400, 2520, 2640, 2760, 2880, 3000, 3120];
  const script = async (adv, rev, order) => { const acks = []; for (const T of barriers) { await adv(T); if (T === 120) acks.push(await order('ORDER-FIXTURE', { team: 0, plan: orderPlan, at: 120 })); await rev(T); } return acks; };
  const pool = new MatchdayPool({ workers: 1 }); await pool.start(contextToJSON(ctx), referenceTeamMap(profile, players));
  try {
    await pool.add([{ id: 'ORDER-FIXTURE', input: A, start: 0, controlledTeams: [0] }, { id: 'OTHER', input: B, start: 0 }]);
    const acks = await script((T) => pool.advance(T), (T) => pool.review(T, {}, true), (id, spec) => pool.order(id, spec)); assert.equal(acks.length, 1); assert.equal(acks[0].ok, true, JSON.stringify(acks[0])); assert.equal(acks[0].fixture, 'ORDER-FIXTURE'); assert.equal(acks[0].id, 1, 'el acuse trae el id de la ORDEN, no el de la petición (antes: la orden fallaba al buscar un partido inexistente)');
    const ess = await pool.essentials(['ORDER-FIXTURE', 'OTHER']);
    // en proceso con el mismo guion: igualdad con el pool
    const sh = new ShardRunner(ctx); sh.add({ id: 'ORDER-FIXTURE', input: A, start: 0 }); sh.add({ id: 'OTHER', input: B, start: 0 }); const ack2 = await script((T) => sh.advanceAll(T), (T) => sh.review(T, {}, { policy: true }), async (id, spec) => sh.order(id, { ...spec, source: 'manual' }));
    assert.equal(ack2[0].ok, true); for (const id of ['ORDER-FIXTURE', 'OTHER']) assert.equal(ess[id].identity.sportFingerprint, sh.essential(id).identity.sportFingerprint, `${id}: pool = proceso`); assert.equal(ess['ORDER-FIXTURE'].identity.nCommands >= 1, true);
    // el otro encuentro permanece intacto: igual que jugarlo solo, sin la orden
    const solo = new ShardRunner(ctx); solo.add({ id: 'OTHER', input: B, start: 0 }); for (const T of barriers) { solo.advanceAll(T); solo.review(T, {}, { policy: true }); } assert.equal(ess.OTHER.identity.sportFingerprint, solo.essential('OTHER').identity.sportFingerprint); assert.equal(ess.OTHER.identity.nCommands, solo.essential('OTHER').identity.nCommands);
    // rechazos tipados, sin promesas colgadas ni efecto en los demás
    const unknown = await pool.order('NO-EXISTE', { team: 0, plan: orderPlan }); assert.deepEqual([unknown.ok, unknown.rejected, unknown.code], [false, true, 'desconocido']);
    const done = await pool.order('ORDER-FIXTURE', { team: 0, plan: orderPlan }); assert.deepEqual([done.ok, done.rejected, done.code], [false, true, 'terminado']);
    const pool2 = new MatchdayPool({ workers: 1 }); await pool2.start(contextToJSON(ctx), referenceTeamMap(profile, players)); try { await pool2.add([{ id: 'X', input: A, start: 0, controlledTeams: [0] }, { id: 'Y', input: B, start: 0 }]); await pool2.advance(120); const noAuth = await pool2.order('X', { team: 1, plan: { styles: { ...A.teams[1].plan.styles, organizedPace: 1 } }, at: 120 }); assert.deepEqual([noAuth.ok, noAuth.rejected, noAuth.code], [false, true, 'sin_autoridad']); const y = await pool2.order('Y', { team: 1, plan: { styles: { ...B.teams[1].plan.styles, organizedPace: 1 } }, at: 120 }); assert.equal(y.ok, true, 'los demás encuentros siguen operativos'); } finally { await pool2.close(); }
  } finally { await pool.close(); }
});

test('S03-11 política del entrenador coherente entre rutas: misma entrada, política, fronteras y noticias en completo, cuartos, jornada, trabajador y lote; noticia distinta: mismo prefijo, futuro distinto', async () => {
  const inp = inputOf(20261023); const fin = new SimMatch(inp, ctx); fin.finish(); assert.deepEqual(fin.score, [76, 83]); assert.equal(fin.coach.log.length, 0, 'la PRIMITIVA finish() no revisa (control técnico identificado)');
  const auto = new SimMatch(inp, ctx); playAutomatic(auto); assert.deepEqual(auto.score, [77, 79]); assert.equal(auto.coach.log.length, 8, 'la ruta de producto aplica el calendario de revisiones (cada 120 s)');
  const want = fpOf(auto); const wantDecisions = canonical(auto.coach.log);
  const q = new SimMatch(inp, ctx); for (const u of [600, 1200, 1800, 2400, 'end']) advanceAutomatic(q, { until: u }); assert.equal(fpOf(q), want, 'avance por cuartos'); assert.equal(canonical(q.coach.log), wantDecisions);
  const odd = new SimMatch(inp, ctx); for (const u of [37, 500, 501, 1999, 'end']) advanceAutomatic(odd, { until: u }); assert.equal(fpOf(odd), want, 'avance con instantes no múltiplos'); assert.equal(canonical(odd.coach.log), wantDecisions);
  const md = new Matchday({ id: 'J1', fixtures: [{ id: 'P', competition: 'C', start: 0, input: inp }], standings0: standings(inp.teams[0].id, inp.teams[1].id), ctx, policy: true }); md.runToEnd(); assert.equal(md.results.P.essential.identity.sportFingerprint, want, 'jornada'); assert.equal(canonical(md.shard.matches.get('P').m.coach.log), wantDecisions);
  const pool = new MatchdayPool({ workers: 1 }); await pool.start(contextToJSON(ctx), referenceTeamMap(profile, players)); try { await pool.add([{ id: 'P', input: inp, start: 0 }]); for (let T = 120; T <= 3000; T += 120) { await pool.advance(T); await pool.review(T, {}, true); } const e = (await pool.essentials(['P'])).P; assert.equal(e.identity.sportFingerprint, want, 'trabajador'); assert.equal(e.identity.effectiveInputFingerprint, buildSimResult(auto, { events: false, reconcile: false }).identity.effectiveInputFingerprint, 'mismas decisiones aplicadas'); } finally { await pool.close(); }
  const { runCase } = await import('../src/sim/cases.js'); const tm = referenceTeamMap(profile, players); const c = { n: 1, id: 'C', a: 'EQ03', b: 'EQ04', seed: 20261023 }; const rc = runCase(ctx, tm, c); assert.equal(rc.policy, true); assert.equal(rc.decisions, 8); assert.equal(rc.fp, want, 'lote'); const tech = runCase(ctx, tm, { ...c, policy: false }); assert.equal(tech.policy, false); assert.equal(tech.decisions, 0); assert.equal(tech.fp, fpOf(fin), 'el modo técnico sin política está identificado y no sustituye al producto');
  // noticia externa distinta: el prefijo anterior es igual; la respuesta futura permitida difiere
  const news = (T0) => { const m = new SimMatch(inp, ctx); advanceAutomatic(m, { context: (mm, T) => { if (T === T0) mm.addContext({ kind: 'need', team: 0, requiredMargin: 99, source: 'noticia de prueba' }); } }); return m; };
  const withNews = news(2160); const sameNo = auto; const upto = (m, t) => canonical(m.events.filter((e) => e.t <= t + 1e-9)); assert.equal(upto(withNews, 2160), upto(sameNo, 2160), 'prefijo anterior a la noticia: igual'); assert.equal(canonical(withNews.coach.log.filter((d) => d.at < 2160)), canonical(sameNo.coach.log.filter((d) => d.at < 2160)), 'decisiones previas a la noticia: iguales (la del propio instante ya ve la noticia en su vista)');
  assert.ok(withNews.coach.log.some((d) => d.reason === 'necesidad_cierre' && d.at > 2160), 'la noticia permite una respuesta futura distinta'); assert.ok(!sameNo.coach.log.some((d) => d.reason === 'necesidad_cierre'));
});

// ---------------------------------------------------------------------------------------------------------------------------------- neutralidad de las optimizaciones exactas (§5)
test('S03-12 neutralidad de las optimizaciones: huellas del control preoptimización (ee14ec5), lectura incremental del entrenador = recorrido completo y plan recompilado al cambiar el libro', async () => {
  const { runCase } = await import('../src/sim/cases.js'); const { observationFor } = await import('../src/sim/coachsim.js'); const tm = referenceTeamMap(profile, players);
  // casos de la agenda natural congelada de 01/02/03 (master 20261022) con su huella medida en el CONTROL antes de optimizar
  const control = [{ n: 1, id: 'SIM01-C0001', a: 'EQ01', b: 'EQ02', seed: 152650156, fp: 'fb72046215122785' }, { n: 500, id: 'SIM01-C0500', a: 'EQ10', b: 'EQ05', seed: 1989927367, fp: 'ab1dc1ae565382d6' }, { n: 1000, id: 'SIM01-C1000', a: 'EQ07', b: 'EQ11', seed: 3958906328, fp: '082926a99e5493c2' }];
  for (const c of control) assert.equal(runCase(ctx, tm, c).fp, c.fp, `${c.id}: misma trayectoria que el control`);
  // observationFor incremental frente al recorrido completo original
  const naive = (m, team, T) => { const S = m.S; const seg = m.segments.filter((s) => s.start < T - 1e-9); const win = seg.slice(-S.coachSim.observationWindowSegments); const winIdx = new Set(win.map((s) => s.n)); const sc = [0, 0]; let periodStart = 0; let period = 1; const rival = { exterior: 0, interior: 0, media: 0 }; const g = (z) => (z === 'three' ? 'exterior' : z === 'rim' || z === 'inside' ? 'interior' : 'media');
    for (const e of m.events) { if (e.t > T + 1e-9) break; if (e.ty === 'period') { period = e.p; periodStart = e.t; } else if (e.ty === 'shot') { if (e.made) sc[e.tm] += e.pts; if (e.tm === 1 - team && winIdx.has(e.sg)) rival[g(e.zone)] += 1; } else if (e.ty === 'ft' && e.made) sc[e.tm] += 1; }
    const len = period <= m.rules.quarters ? m.rules.quarterSeconds : m.rules.overtimeSeconds; return { period, score: sc, rival, left: Math.round(Math.max(0, periodStart + len - T) * 10) / 10, margin: sc[team] - sc[1 - team] }; };
  const m = new SimMatch(inputOf(OT_SEED), ctx); m.finish(); for (const T of [120, 360, 361, 1200, 1800, 2399, 2400, 2640, 700, 120, 3000]) for (const team of [0, 1]) { const o = observationFor(m, team, T); const n = naive(m, team, T); assert.deepEqual([o.period, o.score, o.rivalShots.exterior, o.rivalShots.interior, o.rivalShots.media, o.secondsLeft, o.margin], [n.period, n.score, n.rival.exterior, n.rival.interior, n.rival.media, n.left, n.margin], `T=${T} equipo ${team} (incluye retrocesos)`); }
  // el libro cambiado por una orden recompila el plan (identidad, no texto)
  const o = new SimMatch(inputOf(5), ctx); o.advance({ until: 120 }); const book = deep(o.teams[0].plan.playbook); const first = o.teams[0].plan._c; assert.ok(first); const keep = deep(book).slice(0, 8); const r = o.submit({ at: 120, team: 0, plan: { playbook: keep } }); assert.equal(r.ok, true); o.advance({ until: 360 }); assert.notEqual(o.teams[0].plan._c, first); assert.equal(o.teams[0].plan._c.plays.length, 8);
});
