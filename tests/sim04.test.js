// SIM-MOTOR-04 · correcciones C04-01…06 y candidatas. Pruebas agrupadas por riesgo, con entradas fijas y pequeñas; cálculos puros sin azar donde es posible. Cada regresión reproduce el comportamiento anterior descrito
// en el encargo (`docs/prompts/SIM-MOTOR-04-correcciones-calibracion-y-cierre.md`). No son campañas: la evidencia comparativa se genera con `scripts/sim04`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult, applyOverrides, validateOverrides, SIM_VERSION, RECONCILIATION_IDS } from '../src/sim/index.js';
import { playAutomatic } from '../src/sim/coachsim.js';
import { snapshotSim, restoreSim, validateSimSnapshot } from '../src/sim/snapshot.js';
import { probeVector } from '../src/sim/probe.js';
import { collectiveRA, reboundModel, screenRoleOf, famPressDelta, coverageApplies } from '../src/sim/model.js';
import { moduleExposure, pressExposure, assistDenominators } from '../src/sim/exposure.js';
import { essentialFromResult, decodeZone, buildSimEssential } from '../src/sim/essential.js';
import { sportDigest } from '../src/sim/result.js';
import { exposureFromSimResult } from '../src/sim/learning.js';
import { canonical } from '../src/sim/fp.js';
import { buildTables, isFieldAttempt, COLS } from '../scripts/sim04/tables.js';
import { SITUATIONS, FAMILY_OF_PLAY } from '../scripts/sim04/probes.js';
import { coverageCompatiblePlays } from '../scripts/sim04/lib.js';
import * as K from '../src/knowledge/model.js';

const { profile, players } = data; const ctx = makeContext(profile); const S = ctx.sp.v; const T = ctx.T;
const inputOf = (seed, a = 'EQ03', b = 'EQ04') => buildReferenceInput(profile, players, a, b, { seed });
const deep = (x) => JSON.parse(JSON.stringify(x));
const play = (input, c = ctx) => { const m = new SimMatch(input, c); playAutomatic(m); return m; };
const explicitK = (level, ids = null) => { const b = K.allMastered(profile.familiarity, 0); for (const d of K.DOMAINS) for (const id of K.idsOf(d, profile.familiarity)) b[K.BLOCK_FIELD[d]][id] = K.makeEntry(ids && ids.includes(id) ? level : ids ? 30 : level, 0); return { mode: 'explicit', ...b }; };
const setK = (input, ti, level, ids) => { for (const p of input.teams[ti].players) p.knowledge = explicitK(level, ids); };

// ---------------------------------------------------------------------------------------------------------------------------------- C04-01 · rebote colectivo
test('S04-01 rebote ofensivo colectivo (SEM04-REB): neutrales con dos enviados = neutral; añadir participantes no reduce; el balance rival conserva su coste; 1 y 2 envían igual', () => {
  const N = S.neutralAbility;
  assert.equal(collectiveRA(S, [N, N]), N, 'dos neutrales idénticos y dos enviados: RA = nivel neutral');
  const w = S.rebound.collective.weights; const ref = S.rebound.collective.referenceParticipants; assert.deepEqual(w, [1, 0.5, 0.25, 0.125, 0.0625]); assert.equal(ref, 2);
  const one = collectiveRA(S, [N]); const two = collectiveRA(S, [N, N]); const three = collectiveRA(S, [N, N, N]); const four = collectiveRA(S, [N, N, N, N]);
  assert.ok(one < two && two < three && three < four, 'más presencia, más contribución, con rendimiento marginal decreciente'); assert.ok(three - two > four - three, 'rendimiento marginal decreciente');
  // el comportamiento anterior (media de los enviados) bajaba al añadir un participante más débil: estricto demostrable con la misma entrada
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length; const strengths = [24, 20, 12, 8]; const prevRA = (n) => mean(strengths.slice(0, n));
  assert.ok(prevRA(4) < prevRA(1), 'control: la media anterior se reducía al enviar más y más débiles'); for (let n = 1; n < 4; n++) assert.ok(collectiveRA(S, strengths.slice(0, n + 1)) >= collectiveRA(S, strengths.slice(0, n)), `añadir el participante ${n + 1} no reduce RA`);
  assert.ok(collectiveRA(S, [24, 20]) > collectiveRA(S, [20, 20]), 'más capacidad de un participante no empeora su contribución'); assert.equal(collectiveRA(S, [-5, 10]), collectiveRA(S, [0, 10]), 'positiveStrength = max(0, fuerza)');
  assert.ok(collectiveRA(S, [10, 24]) === collectiveRA(S, [24, 10]), 'orden por fuerza: el orden de entrada no importa');
  // niveles 1–5 de afterShot con la MISMA entrada: pORB(4 enviados) ≥ pORB(1); niveles 1 y 2 envían el mismo número ([1,1,2,3,4])
  const pk = {}; const sent = {}; for (let lv = 1; lv <= 5; lv++) { const inp = inputOf(31); inp.teams[0].plan.styles.afterShot = lv; const pv = probeVector(ctx, inp); pk[lv] = pv.vector['pOrb.field.0']; sent[lv] = pv.vector['pOrb.sent.0']; }
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => sent[l]), S.rebound.offensiveReboundAssignmentTarget, 'participantes enviados por nivel'); assert.equal(pk[1], pk[2], 'niveles 1 y 2 envían el mismo número y comparten pORB');
  for (let lv = 2; lv <= 5; lv++) assert.ok(pk[lv] >= pk[lv - 1] - 1e-12, `pORB no baja al pasar de ${lv - 1} a ${lv}`); assert.ok(pk[5] > pk[1], 'enviar más aumenta el rebote ofensivo (antes: 36,5 % → 27,1 % en la sonda de 03)');
  // el coste de balance rival sigue vivo: el rival que carga el rebote deja menos regresos → más transición para el otro equipo
  const lo = inputOf(31); lo.teams[0].plan.styles.afterShot = 1; const hi = inputOf(31); hi.teams[0].plan.styles.afterShot = 5; assert.ok(probeVector(ctx, hi).vector['pace.tau.1'] > probeVector(ctx, lo).vector['pace.tau.1'], 'cargar el rebote cuesta transición rival');
  // la captura se acredita a un participante elegible y los rebotes cuadran con sus oportunidades (R06/R07 de la conciliación)
  for (const seed of [3, 4]) { const m = play(inputOf(seed)); const res = buildSimResult(m, { events: false }); for (const id of ['R06_rebotes_oportunidades', 'R07_creditos_elegibles']) assert.equal(res.reconciliation.checks.find((c) => c.id === id).ok, true, id); }
  // una fila editada no puede romper el contrato: se rechaza con causa
  const bad = (rows) => validateOverrides(ctx.sp, rows).map((e) => `${e.path}: ${e.message}`);
  assert.ok(bad([{ path: 'rebound.collective.weights', value: [0.5, 1, 0.25, 0.1, 0.05] }]).some((m) => /no pueden crecer/.test(m))); assert.ok(bad([{ path: 'rebound.collective.referenceParticipants', value: 6 }]).some((m) => /entero positivo/.test(m)));
  assert.ok(bad([{ path: 'rebound.collective.weights', value: [1, -0.5, 0.25, 0.1, 0.05] }]).length); assert.ok(bad([{ path: 'rebound.collective.weights', value: [1, NaN, 0.25, 0.1, 0.05] }]).length); assert.deepEqual(bad([{ path: 'rebound.collective.weights', value: [1, 0.6, 0.3, 0.1, 0.05] }]), []);
});

// ---------------------------------------------------------------------------------------------------------------------------------- C04-02 · zonas
test('S04-02 zonas y canastas con falta: formato compacto SIM, FIBA §2.1 (canasta con falta cuenta; fallo con falta de tiro no; anulado no), zonas = acta y calidades = intentos', () => {
  assert.deepEqual(decodeZone([5, 3, 2, 2, 1]), { a: 5, m: 3, q: [2, 2, 1] }); assert.deepEqual(decodeZone({ a: 4, m: 1, q: [1, 2, 1] }), { a: 4, m: 1, q: [1, 2, 1] }); assert.equal(decodeZone([5, 3]), null, 'formato desconocido: no leído, nunca un cero'); assert.equal(decodeZone('x'), null);
  assert.equal(isFieldAttempt(false, true, false), true, 'tiro ordinario acertado'); assert.equal(isFieldAttempt(false, false, false), true, 'tiro ordinario fallado'); assert.equal(isFieldAttempt(true, true, false), true, 'canasta con falta: intento y acierto');
  assert.equal(isFieldAttempt(true, false, false), false, 'tiro fallado con falta de tiro: no es intento'); assert.equal(isFieldAttempt(false, true, true), false, 'tiro anulado: no cuenta'); assert.equal(isFieldAttempt(true, true, true), false);
  // detallado sintético con las cinco clases de fila y un SIM real: el lector reparado concilia con el acta del equipo
  const cols = ['event_id', 'seq', 'period', 'team', 'possession', 'shooter', 'zone', 'points', 'made', 'from_foul', 'annulled', 'blocked_by', 'defender', 'passer', 'moved', 'window', 'quality', 'family', 'sector', 'origin'];
  const row = (shooter, zone, made, ff, ann, q = 'normal') => cols.map((c) => ({ shooter, zone, made, from_foul: ff, annulled: ann, quality: q, team: 0, points: 2, origin: 'POS01' })[c] ?? null);
  const shots = { columns: cols, rows: [row('EQ01-J01', 'rim', true, false, false), row('EQ01-J01', 'rim', false, false, false), row('EQ01-J01', 'rim', true, true, false), row('EQ01-J01', 'rim', false, true, false), row('EQ01-J01', 'three', true, false, true)] };
  const det = { case_id: 'D', resolver: 'detailed', status: 'finished', valid: true, attempt: 1, seed: 1, block: 'X', scenario: 's', variant: 'v', orientation: 'o', replicate: 1, identity: null, essential: { identity: { teams: [{ id: 'EQ01' }, { id: 'EQ02' }] }, result: { court_score: [4, 0], game_tenths: 24000 }, shots, sequence: { columns: [], rows: [] }, presence: { lineups: [] }, acta: { periods: [{ points: [4, 0] }], possessions: [], players: [{ id: 'EQ01-J01', team_index: 0, participation: 'titular', min_tenths: 24000, pts: 4, fg2m: 2, fg2a: 3, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, ast_fg: 0, ast_ft: 0, tov: 0, stl: 0, blk: 0, blk_rec: 0, pf: 0, fr: 0, pm: 0 }], teams: [{ totals: { pts: 4, fg2m: 2, fg2a: 3, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, astFg: 0, astFt: 0, tov: 0, stl: 0, blk: 0, blkRec: 0, pf: 0, fr: 0 } }, { totals: { pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, astFg: 0, astFt: 0, tov: 0, stl: 0, blk: 0, blkRec: 0, pf: 0, fr: 0 } }] } } };
  const t = buildTables([], [det]).tables; const z = t.zone.find((r) => r[COLS.zone.indexOf('zone')] === 'rim'); assert.equal(z[COLS.zone.indexOf('attempts')], 3, 'tiro, canasta con falta y fallo ordinario cuentan; el fallo con falta y el anulado no'); assert.equal(z[COLS.zone.indexOf('makes')], 2);
  assert.equal(t.zone.some((r) => r[COLS.zone.indexOf('zone')] === 'three'), false, 'una zona con solo un tiro anulado no genera fila');
  const fam = t.family.find((r) => r[COLS.family.indexOf('family_or_play')] === 'POS01'); assert.equal(fam[COLS.family.indexOf('fga')], 3, 'la tabla de familias usa la misma regla');
  const m = play(inputOf(8)); const ess = buildSimEssential(m); const simRec = { case_id: 'S', resolver: 'sim', status: 'finished', valid: true, attempt: 1, seed: 8, block: 'X', scenario: 's', variant: 'v', orientation: 'o', replicate: 1, identity: { teams: ess.identity.teams.map((x) => x.id) }, essential: ess, quintets: [], segments: [], analysis: null };
  const st = buildTables([simRec], []).tables; const ci = (n) => COLS.team.indexOf(n); for (const r of st.team) { const za = ['rim', 'inside', 'midrange', 'three'].reduce((a, zn) => a + r[ci(`${zn}_a`)], 0); const zm = ['rim', 'inside', 'midrange', 'three'].reduce((a, zn) => a + r[ci(`${zn}_m`)], 0); assert.equal(za, r[ci('fga')], 'zonas = intentos del acta'); assert.equal(zm, r[ci('fgm')], 'zonas = aciertos del acta'); }
  assert.ok(st.zone.length > 0 && st.zone.every((r) => r[COLS.zone.indexOf('attempts')] != null), 'ninguna fila SIM sin intentos (03: 82.030 filas vacías por leer arrays como objetos)');
  for (const p of ess.box.players) for (const [zn, v] of Object.entries(p.zones ?? {})) { const d = decodeZone(v); assert.equal(d.q[0] + d.q[1] + d.q[2], d.a, `calidades suman intentos (${p.id} ${zn})`); }
});

// ---------------------------------------------------------------------------------------------------------------------------------- C04-03 · bloqueador pertinente
test('S04-03 bloqueador pertinente: función derivada del catálogo (POS01–04 y 07–08), ejecutante-bloqueador con crédito único, otro jugador si no, ausencia legítima sin bloqueo; el putback no hereda', () => {
  const sr = (id) => screenRoleOf(T.plays[id]); for (const id of ['POS01', 'POS02', 'POS03', 'POS04', 'POS07', 'POS08']) assert.equal(sr(id), 'screener', id); for (const id of ['POS05', 'POS06', 'POS09', 'POS10', 'POS11', 'POS12', 'POS13', 'POS14', 'POS15']) assert.equal(sr(id), null, `${id} no tiene bloqueador pertinente (POS05–06 conservan hub)`);
  assert.equal(T.plays.POS01.screen, undefined, 'el catálogo no define `play.screen`: así se buscaba en 03 y el registro quedaba vacío');
  let own = 0; let other = 0; let none = 0; let withScr = 0; let putbackScr = 0; let tot = 0;
  for (const seed of [21, 22, 23, 24, 25, 26]) { const m = play(inputOf(seed, 'EQ01', 'EQ02')); const res = buildSimResult(m, { events: false }); assert.equal(res.reconciliation.checks.find((c) => c.id === 'R24_bloqueador_pertinente').ok, true, 'R24');
    for (const e of m.events) { if (e.ty !== 'shot') continue; tot++; const has = e.ctx === 'organized' && screenRoleOf(T.plays[e.play]); if (!has) { assert.equal(e.scr, null, `sin bloqueo pertinente no hay bloqueador (${e.play}/${e.ctx})`); assert.equal(e.scrSrc, null); if (e.ctx === 'putback') putbackScr += e.scr ? 1 : 0; continue; }
      withScr++; if (e.scrSrc === 1) { own++; assert.equal(e.scr, e.pl); } else if (e.scrSrc === 2) { other++; assert.notEqual(e.scr, e.pl, 'el bloqueador es otro jugador'); assert.notEqual(e.scr, e.dir); } else none++; } }
  assert.ok(withScr > 100 && own > 0 && other > 0, `cubre ejecutante-bloqueador (${own}) y bloqueador sorteado (${other}) en ${withScr} finalizaciones con bloqueo`); assert.equal(putbackScr, 0, 'el putback no hereda el bloqueo anterior'); assert.equal(none, 0, 'con quinteto completo siempre hay candidato');
  // crédito único: si el bloqueador es el ejecutante, su exposición de módulos cuenta UNA operación (no dos)
  const m = play(inputOf(21, 'EQ01', 'EQ02')); const ev = m.events.find((e) => e.ty === 'shot' && e.scrSrc === 1); assert.ok(ev, 'hay un ejecutante-bloqueador'); const one = moduleExposure(m, [ev]); const credit = Object.values(one[ev.pl]).reduce((a, x) => a + x, 0); assert.ok(Math.abs(credit - 1) < 1e-5, `una finalización acredita 1 operación al participante aunque sea ejecutante y bloqueador (${credit})`);
  // identidad de la huella: el bloqueador forma parte de la huella deportiva (antes quedaba siempre en null)
  const a = sportDigest({ norm: m.norm, score: m.score, events: m.events, published: m.published, segments: m.segments }); const evs2 = m.events.map((e) => (e === ev ? { ...e, scr: 'otro' } : e)); assert.notEqual(a, sportDigest({ norm: m.norm, score: m.score, events: evs2, published: m.published, segments: m.segments }));
  // TEC09: el bloqueador se registra en la participación de Análisis (participante registrado distinto de la capacidad utilizada)
  const res = buildSimResult(m, { events: false, analysis: true }); const n = res.analysis.participation.reduce((s, t) => s + Object.values(t).reduce((q, p) => q + Object.values(p.screeners).reduce((a2, x) => a2 + x, 0), 0), 0); assert.ok(n > 0, 'participation[].screeners ya no queda vacío');
});

// ---------------------------------------------------------------------------------------------------------------------------------- C04-04 · familiaridad de presión
test('S04-04 familiaridad de presión (FAM:press_break/PRESS): cálculo sin azar K8→K28, solo con presión adelantada, neutral exacto, un único ajuste y exposición propia sin dosis por consultar', () => {
  const mk = (kAtk, kDef, height = 'full') => { const inp = inputOf(11, 'EQ06', 'EQ07'); inp.teams[0].plan.pressureHeight = height; setK(inp, 1, kAtk, ['FAM:press_break']); setK(inp, 0, kDef, ['PRESS']); return inp; };
  const vec = (inp) => probeVector(ctx, inp).vector;
  // el ataque es el equipo 1 (sufre la presión del 0): su delta está orientado a su favor
  const a8 = vec(mk(8, 28))['fam.press.1']; const a28 = vec(mk(28, 28))['fam.press.1']; assert.ok(a28 > a8, 'ataque K8→K28 mejora (el delta a favor del ataque sube)'); const t8 = vec(mk(8, 28))['term.to.1']; const t28 = vec(mk(28, 28))['term.to.1']; assert.ok(t28 <= t8, 'con más familiaridad ofensiva hay menos pérdidas de presión');
  const d8 = vec(mk(28, 8))['fam.press.1']; const d28 = vec(mk(28, 28))['fam.press.1']; assert.ok(d28 < d8, 'defensa K8→K28 aumenta su eficacia relativa (el delta a favor del ataque baja)'); assert.ok(vec(mk(28, 28))['term.to.1'] >= vec(mk(28, 8))['term.to.1'], 'mejor defensa, más pérdidas del atacante');
  assert.equal(vec(mk(28, 28, 'normal'))['fam.press.1'], 0, 'presión normal no activa la operación'); const base = inputOf(11, 'EQ06', 'EQ07'); base.teams[0].plan.pressureHeight = 'full'; assert.equal(vec(base)['fam.press.1'], 0, 'sin conocimiento explícito: neutral exacto (cero)');
  const full = mk(30, 30); assert.equal(vec(full)['fam.press.1'], 0, 'todos los dominios plenos: delta exactamente 0'); assert.equal(vec(mk(30, 30))['term.to.1'], vec(base)['term.to.1'], 'neutral: la pérdida es la de la rama sin conocimiento');
  // un único ajuste sobre el peso ADICIONAL de la presión: la pérdida ordinaria y la puntería no cambian con el delta
  const ordinary = (inp) => { const pv = probeVector(ctx, inp); return [pv.vector['pMake.three.1'], pv.vector['mix.zone.three.1'], pv.vector['quality.comfortable.1']]; }; assert.deepEqual(ordinary(mk(8, 28)), ordinary(mk(28, 28)), 'el delta no se suma a puntería, calidad ni mezcla');
  // exposición: oportunidades = controles publicados; una operación por participante y oportunidad; identidad propia
  const m = play(mk(8, 28)); const res = buildSimResult(m, { events: false }); assert.equal(res.reconciliation.checks.find((c) => c.id === 'R25_exposicion_presion').ok, true); const ops = res.pressOps; assert.ok(ops.opportunities[1] > 0 && ops.opportunities[0] === 0, 'solo el equipo que sufre la presión tiene oportunidades'); assert.equal(ops.opportunities[1], ops.byHeight.full[1]);
  const pe = pressExposure(m, m.segments.filter((s) => s.start < m.published), m.published, (s, TT) => { const c = [0, 0]; for (let i = 0; i < s.ct.length; i++) if (s.ct[i] <= TT + 1e-9) c[s.ck[i]]++; return c; }); const dirCredit = Object.values(pe.byPlayer).reduce((s, x) => s + (x['FAM:press_break'] ?? 0), 0); assert.ok(Math.abs(dirCredit - ops.opportunities[1]) < 1e-6, 'el director de referencia recibe una operación por oportunidad');
  const defCredit = Object.values(pe.byPlayer).reduce((s, x) => s + (x.PRESS ?? 0), 0); assert.ok(defCredit > 0, 'los defensores en pista reciben PRESS'); const any = Object.values(res.exposure).find((e) => e.moduleOps?.press && Object.keys(e.moduleOps.press).length); assert.ok(any, 'la exposición de presión conserva su identidad de operación'); for (const e of Object.values(res.exposure)) { const f = e.moduleOps?.finalization ?? {}; const p = e.moduleOps?.press ?? {}; for (const k of new Set([...Object.keys(f), ...Object.keys(p)])) assert.ok(Math.abs((e.modules[k] ?? 0) - ((f[k] ?? 0) + (p[k] ?? 0))) < 1e-5, `modules = finalización + presión (${k})`); }
  // consultar, estimar o repetir una lectura no genera dosis ni azar
  const draws = m.rng.draws; const r1 = buildSimResult(m, { events: false }); const r2 = buildSimResult(m, { events: false, audience: 'public' }); assert.equal(m.rng.draws, draws); assert.deepEqual(r1.exposure, buildSimResult(m, { events: false }).exposure, 'repetir la lectura devuelve la misma exposición'); void r2;
  const learn = exposureFromSimResult(r1); assert.ok(Object.values(learn.players).some((p) => (p.modules.PRESS ?? 0) > 0 || (p.modules['FAM:press_break'] ?? 0) > 0), 'el adaptador de aprendizaje recibe PRESS y FAM:press_break');
  // sin presión adelantada no hay oportunidades ni dosis de presión
  const calm = buildSimResult(play(inputOf(11, 'EQ06', 'EQ07')), { events: false }); assert.deepEqual(calm.pressOps.opportunities, [0, 0]);
});

// ---------------------------------------------------------------------------------------------------------------------------------- C04-05 · prioridades e instrumento
test('S04-05 prioridades: 1 es la máxima y 5 la mínima; el instrumento S4 y la cobertura exponen la familia pedida con fichas compatibles y declaran oportunidades', () => {
  assert.deepEqual(S.selection.priorityWeights, [8, 5, 3, 2, 1], 'prioridad 1 → peso máximo'); const s4 = SITUATIONS.find((x) => x.id === 'S4'); assert.match(s4.mod, /prioridad 1 \(máxima\)/);
  const screenFam = ['pick_and_roll', 'handoff', 'off_ball_screen']; const share = (inp) => { const v = probeVector(ctx, inp).vector; return screenFam.reduce((a, f) => a + (v[`mix.family.${f}.0`] ?? 0), 0); };
  const base = inputOf(41); const right = deep(base); s4.mutate(right, T); const inverted = deep(base); for (const e of inverted.teams[0].plan.playbook) e.priority = screenFam.includes(T.plays[e.playId].family) ? 5 : 1;
  assert.ok(share(right) > share(inverted) + 0.2, 'S4 corregido: más masa en las familias con bloqueo que con la inversión de 03 (que las despriorizaba)'); assert.ok(share(right) > share(base));
  assert.equal(FAMILY_OF_PLAY.POS01, T.plays.POS01.family); for (const [id, fam] of Object.entries(FAMILY_OF_PLAY)) assert.equal(T.plays[id].family, fam, `catálogo ${id}`);
  const both = coverageCompatiblePlays(T, ['COB01', 'COB03']); assert.deepEqual(both, ['POS01', 'POS02', 'POS03', 'POS04']); assert.equal(coverageApplies(T.plays.POS05, 'COB03'), false, 'handoff no admite COB03: no se prepara una cobertura incompatible'); assert.equal(coverageApplies(T.plays.POS01, 'COB03'), true);
});

// ---------------------------------------------------------------------------------------------------------------------------------- C04-06 · asistencias
test('S04-06 asistencias: denominadores por contexto sin reconstruir pases; putback y autónomas sin asistencia; máximo una por canasta/serie; astC/astL separadas; la probabilidad base entra al sorteo', () => {
  let del = 0; let elig = 0; const tot = { fgA: 0, ftA: 0, astC: 0, astL: 0 };
  for (const seed of [51, 52, 53, 54]) { const m = play(inputOf(seed)); const res = buildSimResult(m, { events: false }); assert.equal(res.reconciliation.checks.find((c) => c.id === 'R26_denominadores_asistencia').ok, true, 'R26'); const d = assistDenominators(m.events); assert.deepEqual(d, res.assistDenominators);
    for (const k of [0, 1]) { assert.equal(d[k].putback.eligible, 0, 'el putback no admite entrega'); assert.equal(d[k].putback.fgAssists, 0); for (const c of Object.values(d[k])) { assert.ok(c.delivered <= c.eligible && c.eligible <= c.fin && c.fgAssists <= c.eligibleBaskets && c.ftAssists <= c.eligibleFtSeries); del += c.delivered; elig += c.eligible; tot.fgA += c.fgAssists; tot.ftA += c.ftAssists; } tot.astC += res.box.teams[k].astC; tot.astL += res.box.teams[k].astL; }
    const seen = new Set(); for (const e of m.events) if (e.ty === 'shot' && e.made && e.passer) { assert.equal(seen.has(e.fin), false, 'una asistencia de campo por finalización'); seen.add(e.fin); } const bySeries = new Map(); for (const e of m.events) if (e.assist) bySeries.set(e.fin, (bySeries.get(e.fin) ?? 0) + 1); for (const [, n] of bySeries) assert.equal(n, 1, 'una asistencia a libres por serie'); }
  assert.ok(elig > 0 && del > 0 && tot.fgA === tot.astC && tot.ftA === tot.astL, 'astC y astL del acta = numeradores de los denominadores (separadas)');
  // la probabilidad base de la entrega final entra al sorteo (la calibración del §7 la ajusta; aquí solo se prueba que actúa y que 0 < p0 < 1)
  const lo = applyOverrides(ctx.sp, [{ path: 'assist.eligibleFinalPassP0', value: 0.2 }]); const hi = applyOverrides(ctx.sp, [{ path: 'assist.eligibleFinalPassP0', value: 0.95 }]); const run = (sp) => { const c = { ...ctx, sp }; let d = 0; let e = 0; for (const seed of [51, 52]) { const m = new SimMatch(inputOf(seed), c); m.finish(); const a = assistDenominators(m.events); for (const k of [0, 1]) for (const x of Object.values(a[k])) { d += x.delivered; e += x.eligible; } } return d / e; };
  assert.ok(run(hi) > run(lo) + 0.3, 'p0 mayor, más entregas por finalización elegible'); assert.ok(validateOverrides(ctx.sp, [{ path: 'assist.eligibleFinalPassP0', value: 1 }]).length, 'p0 = 1 rechazado'); assert.ok(validateOverrides(ctx.sp, [{ path: 'assist.eligibleFinalPassP0', value: 0 }]).length);
});

// ---------------------------------------------------------------------------------------------------------------------------------- §7.2 · mezcla de zonas
test('S04-07 shotMix.threeWeightFactor: identidad con 1; ajusta la mezcla (no el acierto) conservando la masa de cada contexto; valores inválidos se rechazan con causa', () => {
  const fac = (f) => (f === 1 ? ctx : { ...ctx, sp: applyOverrides(ctx.sp, [{ path: 'shotMix.threeWeightFactor', value: f }]) });
  const inp = inputOf(61); for (const t of inp.teams) t.plan.defStyles.protection = 3; /* protección neutra: la renormalización posterior por protección del tiro rival (existente) no mueve masa entre contextos */ const v1 = probeVector(ctx, inp).vector; const same = probeVector({ ...ctx, sp: applyOverrides(ctx.sp, [{ path: 'shotMix.threeWeightFactor', value: 1 }]) }, inp).vector; assert.deepEqual(same, v1, 'con 1, identidad exacta de la mezcla previa');
  const v7 = probeVector(fac(0.7), inp).vector; for (const k of [0, 1]) { assert.ok(v7[`mix.zone.three.${k}`] < v1[`mix.zone.three.${k}`], 'menos triples'); const sum = (v, key) => ['rim', 'inside', 'midrange', 'three'].reduce((a, z) => a + v[`mix.zone.${z}.${k}`], 0); assert.ok(Math.abs(sum(v7) - 1) < 1e-9, 'la mezcla sigue sumando 1');
    for (const f of ['trans', 'spont']) assert.ok(Math.abs(v7[`mix.family.${f}.${k}`] - v1[`mix.family.${f}.${k}`]) < 1e-9, `la masa del contexto ${f} se conserva (el ajuste es interno al contexto)`); const pm = (v) => v[`pMake.three.${k}`]; assert.equal(pm(v7), pm(v1), 'no toca la probabilidad de encestar'); }
  assert.ok(probeVector(fac(1.3), inp).vector['mix.zone.three.0'] > v1['mix.zone.three.0']);
  const bad = (value) => validateOverrides(ctx.sp, [{ path: 'shotMix.threeWeightFactor', value }]).map((e) => e.message); for (const x of [0, -1, NaN, Infinity]) assert.ok(bad(x).length, `factor ${x} rechazado`); assert.throws(() => applyOverrides(ctx.sp, [{ path: 'shotMix.threeWeightFactor', value: 0 }]), /candidata no válida/);
  assert.ok(validateOverrides(ctx.sp, [{ path: 'energy.costPerLiveMinute', value: 0 }]).length, 'gasto no positivo rechazado'); assert.deepEqual(validateOverrides(ctx.sp, [{ path: 'energy.costPerLiveMinute', value: 3.5 }]), []);
  const row = ctx.sp.index.get('shotMix.threeWeightFactor'); assert.equal(row.value, 1); assert.match(row.origin, /SEM-SIM04/); assert.ok(row.unit && row.effect, 'la fila declara origen, unidad y efecto (panel de parámetros)');
});

// ---------------------------------------------------------------------------------------------------------------------------------- compatibilidad y versiones
test('S04-08 compatibilidad: un guardado de 02/03 se rechaza con explicación y sin tocar el archivo; el guardado nuevo continúa exacto; el perfil de 03 es otra identidad', () => {
  const fix = JSON.parse(readFileSync(new URL('./fixtures/sim-snapshot-02.json', import.meta.url), 'utf8')); const old = fix.snap; const before = canonical(old);
  const errs = validateSimSnapshot(old); assert.ok(errs.length >= 1, 'el guardado real de 02 ya no se continúa'); assert.ok(errs.some((e) => /SIM-MOTOR-04 cambia el futuro/.test(e.message)), 'con la explicación'); assert.equal(canonical(old), before, 'el archivo se conserva intacto'); assert.throws(() => restoreSim(deep(old), ctx), /rechazado/);
  const m = new SimMatch(inputOf(5), ctx); m.advance({ until: 130 }); const snap = snapshotSim(m, { embedContext: false }); assert.equal(snap.simVersion, SIM_VERSION); assert.equal(snap.schema, 'beM-sim-snapshot/2'); assert.deepEqual(validateSimSnapshot(snap), []);
  const ctl = new SimMatch(inputOf(5), ctx); ctl.finish(); const r = restoreSim(deep(snap), ctx); r.finish(); assert.equal(r.rng.draws, ctl.rng.draws); assert.equal(buildSimResult(r, { events: false }).sportFingerprint, buildSimResult(ctl, { events: false }).sportFingerprint, 'continuación exacta con presión, bloqueador y asistencia ya generados');
  assert.equal(ctx.sp.id, 'SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023'); const p = buildSimResult(ctl, { events: false }); assert.equal(p.schema, 'beM-sim-match/3'); assert.equal(essentialFromResult(p).schema, 'beM-sim-essential/2');
});

// ---------------------------------------------------------------------------------------------------------------------------------- optimizaciones exactas
test('S04-09 optimizaciones exactas: el esencial por la ruta rápida (lean) = el de la ruta de lectura completa; el cierre diferido publica lo mismo y sella después; sin `delete` en los hechos', async () => {
  const { ShardRunner } = await import('../src/sim/shard.js'); const { referenceTeamMap } = await import('../src/sim/teams.js'); const { contextToJSON } = await import('../src/sim/context.js');
  // 1) misma intersección: acta, zonas, familias, denominadores, exposición, identidad y validez; las proyecciones omitidas no cambian ningún dato conservado
  for (const seed of [71, 72, 73, 74]) { const m = play(inputOf(seed, 'EQ05', 'EQ09')); const lean = buildSimEssential(m); const full = essentialFromResult(buildSimResult(m, { events: false, reconcile: false, audience: 'diagnostic' }), { reconcile: null });
    const withRec = essentialFromResult(buildSimResult(m, { events: false, reconcile: false, audience: 'diagnostic' }), { reconcile: buildSimResult(m, { events: false, reconcile: true }).reconciliation }); assert.equal(canonical(lean), canonical(withRec), `esencial lean = esencial completo con la misma conciliación (semilla ${seed})`); assert.equal(lean.validity.valid, true); assert.equal(full.validity, null, 'sin conciliación se declara null, no «válido»');
    const leanRes = buildSimResult(m, { events: false, reconcile: true, lean: true }); assert.equal(leanRes.reconciliation.valid, true, 'la conciliación sigue completa en la ruta rápida'); assert.equal(leanRes.reconciliation.evaluated, RECONCILIATION_IDS.length); assert.equal(leanRes.observable, null); assert.deepEqual(leanRes.evolution, []); }
  // 2) los hechos no se borran propiedades: sin modo diccionario (misma forma para todos los hechos del mismo tipo) y misma proyección canónica
  const m = play(inputOf(81)); const keysOf = (e) => Object.keys(e).join(','); const shapes = new Set(m.events.filter((e) => e.ty === 'shot').map(keysOf)); assert.equal(shapes.size, 1, 'todos los tiros comparten forma (clave y orden)'); assert.equal(m.events.some((e) => 'tAbs' in e), false);
  // 3) cierre diferido: mismos paquetes públicos y mismos esenciales que sin diferir; el sellado construye después y libera
  const mk = (defer) => { const sh = new ShardRunner(null, { releaseFinished: true }); sh.setContext(contextToJSON(ctx)); sh.teamMap = referenceTeamMap(profile, players); for (let i = 0; i < 4; i++) sh.add({ id: `P${i}`, start: 0, spec: { a: 'EQ0' + (1 + i), b: 'EQ0' + (5 + i), seed: 900 + i } }); const log = []; for (let T = 120; T <= 3000; T += 120) { log.push(sh.advanceAll(T, { defer }).map((p) => [p.id, p.status, p.score, p.finished])); sh.review(T, {}, { policy: true }); if (defer) { const r = sh.seal({ max: 1 }); log.push(['seal', r.sealed >= 0]); while (r.remaining > 0) { const x = sh.seal({ max: 1 }); if (!x.remaining) break; } } } return { sh, log }; };
  const a = mk(false); const b = mk(true); for (const id of ['P0', 'P1', 'P2', 'P3']) { assert.equal(b.sh.released(id), true, 'sellado y liberado'); assert.equal(canonical(a.sh.essential(id)), canonical(b.sh.essential(id)), `esencial idéntico con cierre diferido (${id})`); }
  const strip = (log) => log.filter((x) => x[0] !== 'seal'); assert.equal(canonical(strip(a.log)), canonical(strip(b.log)), 'paquetes publicados por barrera idénticos con y sin cierre diferido');
});
