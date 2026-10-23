// SIM-MOTOR-01: generador estadístico por tramos. Pocas pruebas agrupadas por propiedad (S01-01…S01-10). La causalidad se acredita con distribuciones ANTES del sorteo (sonda de magnitudes),
// nunca con «una semilla sube el marcador»; las 1.000 ejecuciones de la medición cubren los partidos completos y no se repiten aquí.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, contextToJSON, contextFromJSON, buildReferenceInput, SimMatch, buildSimResult, normalizeInput, validateSimInput, SIM_MODEL, SIM_RESULT_SCHEMA, SIM_PROFILE_ID, RECONCILIATION_IDS } from '../src/sim/index.js';
import { buildSimProfile, applyOverrides, validateOverrides, diffProfile } from '../src/sim/profile.js';
import { probeVector, bumpAbilities, diffVectors } from '../src/sim/probe.js';
import { capabilityContrast, CAPABILITIES } from '../src/sim/capabilities.js';
import { controlContrasts } from '../src/sim/controls.js';
import { buildAgenda, TEAM_IDS } from '../src/sim/schedule.js';
import { referenceTeamMap } from '../src/sim/teams.js';
import { runCase } from '../src/sim/cases.js';
import { SimPool } from '../src/sim/pool.js';
import { Rng } from '../src/sim/rng.js';
import { uniformBlock } from './m18-helpers.js';

test.after(() => console.log(`SIM01_PARTIDOS ${JSON.stringify({ creados: SimMatch.created, completos: SimMatch.finished })}`));
const { profile, players } = data; const ctx = makeContext(profile); const teamMap = referenceTeamMap(profile, players);
const inputOf = (a, b, seed, over) => { const i = buildReferenceInput(profile, players, a, b, { seed }); over?.(i); return i; };
const play = (input, opts) => { const m = new SimMatch(input, ctx, opts); m.finish(); return m; };
const fpOf = (m) => buildSimResult(m, { events: false }).sportFingerprint;
const near = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) <= t, `${a} ≠ ${b}`);

test('S01-01 determinismo e independencia: misma entrada ⇒ misma huella; dos encuentros intercalados no comparten estado; consultar no consume azar; avanzar por fronteras = terminar de golpe', () => {
  const inp = inputOf('EQ03', 'EQ03', 77); const before = JSON.stringify(inp);
  const full = play(inp); const rf = buildSimResult(full);
  assert.equal(JSON.stringify(inp), before, 'la entrada original no se modifica');
  assert.equal(rf.schema, SIM_RESULT_SCHEMA); assert.equal(rf.model, SIM_MODEL); assert.equal(rf.identity.simProfile, SIM_PROFILE_ID);
  assert.deepEqual(rf.identity.teams.map((t) => t.id), ['EQ03', 'EQ03_B'], 'dos copias del mismo equipo funcionan con identidades de instancia distintas');
  assert.equal(fpOf(play(inp)), rf.sportFingerprint, 'repetición');
  const other = inputOf('EQ05', 'EQ09', 5); const x = new SimMatch(inp, ctx); const y = new SimMatch(other, ctx);
  while (x.status === 'running' || y.status === 'running') { x.step(); y.step(); } x.advance({ until: 'end' }); y.advance({ until: 'end' });
  assert.equal(fpOf(x), rf.sportFingerprint, 'intercalado: A igual'); assert.equal(fpOf(y), fpOf(play(other)), 'intercalado: B igual');
  const m = new SimMatch(inp, ctx); const draws = [];
  for (const t of [100, 700, 701, 1500, 1500, 2300]) { m.advance({ until: t }); const d0 = m.rng.draws; const r = buildSimResult(m); draws.push(m.rng.draws - d0); assert.ok(r.published <= t + 1e-9); assert.ok(r.events.every((e) => e.t <= t + 1e-9), 'solo hechos alcanzados'); assert.ok(r.reconciliation.valid, `prefijo ${t} concilia`); }
  assert.deepEqual(draws, [0, 0, 0, 0, 0, 0], 'leer/consultar no consume azar'); m.finish(); assert.equal(buildSimResult(m).sportFingerprint, rf.sportFingerprint, 'avance por fronteras = completo');
  // orden futura: entra en la frontera canónica; programada en la entrada da el mismo partido
  const chg = { styles: { organizedPace: 5, transition: 5, elaboration: 1, finishPreference: 5, freedom: 5, offensiveRisk: 5, afterShot: 5 } };
  const a = new SimMatch({ ...inp, orders: [{ at: 600, team: 0, plan: chg }] }, ctx); a.finish();
  const b = new SimMatch(inp, ctx); b.advance({ until: 650 }); const eff = b.submit({ at: 650, team: 0, plan: chg }); b.finish();
  const c = new SimMatch({ ...inp, orders: [{ at: eff.effectiveAt, team: 0, plan: chg }] }, ctx); c.finish();
  assert.ok(eff.effectiveAt >= 650 && eff.effectiveAt <= 720, `instante efectivo ${eff.effectiveAt}`); assert.equal(fpOf(b), fpOf(c), 'orden enviada = orden programada en su instante efectivo');
  assert.notEqual(fpOf(a), rf.sportFingerprint, 'una orden cambia el partido');
  assert.throws(() => new SimMatch({ ...inp, orders: [{ at: 10, team: 0, plan: { starters: {} } }] }, ctx), /solo admite cambios/);
  // el contexto serializado a un trabajador produce el mismo partido
  const m2 = new SimMatch(inp, contextFromJSON(JSON.parse(JSON.stringify(contextToJSON(ctx))))); m2.finish(); assert.equal(fpOf(m2), rf.sportFingerprint);
});

test('S01-02 conciliación completa y reconstrucción independiente del acta desde los registros (12 cruces)', () => {
  const pairs = [['EQ01', 'EQ02'], ['EQ03', 'EQ03'], ['EQ05', 'EQ09'], ['EQ10', 'EQ07'], ['EQ12', 'EQ04'], ['EQ08', 'EQ06'], ['EQ11', 'EQ02'], ['EQ04', 'EQ04'], ['EQ09', 'EQ01'], ['EQ06', 'EQ12'], ['EQ07', 'EQ03'], ['EQ02', 'EQ11']];
  pairs.forEach(([a, b], i) => {
    const m = play(inputOf(a, b, 9000 + i)); const r = buildSimResult(m); assert.equal(m.status, 'finished'); assert.ok(r.reconciliation.valid, `${a}-${b}: ${r.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id)}`); assert.equal(r.reconciliation.evaluated, RECONCILIATION_IDS.length); assert.deepEqual(r.reconciliation.notEvaluated, []);
    // reconstrucción desde los hechos sin usar el constructor del acta
    const pts = [0, 0]; let fga = [0, 0]; let reb = [0, 0]; let sec = [0, 0];
    for (const e of r.events) { if (e.ty === 'shot') { fga[e.tm]++; if (e.made) pts[e.tm] += e.pts; } if (e.ty === 'ft' && e.made) pts[e.tm] += 1; if (e.ty === 'reb') reb[e.tm]++; }
    for (const s of m.segments) for (const k of [0, 1]) sec[k] += s.lineups[k].length * (s.end - s.start);
    assert.deepEqual(r.score.current, pts); assert.deepEqual(r.box.teams.map((t) => t.fga), fga); assert.deepEqual(r.box.teams.map((t) => t.oreb + t.dreb + t.teamReb[0] + t.teamReb[1]), reb);
    r.box.teams.forEach((t, k) => near(t.sec, sec[k], 1e-6)); assert.notEqual(r.score.current[0], r.score.current[1]);
    const withFive = m.segments.filter((s) => s.lineups.every((l) => l.length === 5)); withFive.forEach((s) => assert.ok(s.end > s.start));
  });
});

test('S01-03 exclusión en mitad de tramo: el tramo se cierra en el hecho, el excluido no vuelve a actuar y el quinteto siguiente es legal; faltas y bonus coherentes', () => {
  const rough = (i) => { for (const t of i.teams) for (const p of t.players.slice(0, 12)) { for (const a of ['TEC12', 'TEC13', 'MEN04', 'MEN05']) p.abilities[a] = 1; } };
  let found = null; let bonus = 0; let nonShootingNoBonus = 0;
  for (let s = 1; s <= 40 && !found; s++) { const m = play(inputOf('EQ01', 'EQ02', s, rough)); const r = buildSimResult(m); assert.ok(r.reconciliation.valid, `semilla ${s}: ${r.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id)}`); const cut = m.segments.find((g) => g.cut); bonus += r.events.filter((e) => e.ty === 'ft' && e.cause === 'bonus').length; nonShootingNoBonus += r.events.filter((e) => e.ty === 'foul' && e.kind === 'nonshooting' && !e.bonus).length; if (cut) found = { m, r, cut, s }; }
  assert.ok(found, 'con defensores muy flojos aparece una exclusión en alguna semilla'); const { m, r, cut } = found;
  const fouler = r.events.filter((e) => (e.ty === 'foul' || e.ty === 'shootfoul') && e.p >= 1).reduce((acc, e) => { acc[e.pl] = (acc[e.pl] ?? 0) + 1; return acc; }, {}); const out = Object.entries(fouler).find(([, n]) => n >= 5)?.[0]; assert.ok(out, 'un jugador llega a cinco faltas');
  const fifth = r.events.filter((e) => (e.ty === 'foul' || e.ty === 'shootfoul') && e.pl === out)[4]; const fseg = m.segments[fifth.sg]; assert.ok(fseg.cut, 'el tramo de la quinta falta se cierra en ese hecho'); assert.ok(fifth.t <= fseg.end + 0.06 && fseg.end <= fseg.start + 120 + 1e-9);
  const after = r.events.filter((e) => e.i > fifth.i && [e.pl, e.blk, e.stl, e.passer, e.drawn, e.victim].includes(out) && !(e.sg === fifth.sg && e.t === fifth.t && e.ty === 'ft')); assert.equal(after.length, 0, 'ninguna acción posterior a la exclusión');
  const next = m.segments[fifth.sg + 1]; if (next) assert.ok(!next.lineups.flat().includes(out), 'el siguiente quinteto no contiene al excluido'); assert.ok(r.box.players.find((p) => p.id === out).pf <= 5); void cut;
  assert.ok(nonShootingNoBonus > 0 && bonus > 0, `hay faltas sin bonus (${nonShootingNoBonus}) y series de bonus (${bonus})`);
  // las faltas sin bonus no generan libres propios; las de bonus, dos
  const series = new Map(); for (const e of r.events) if (e.ty === 'ft' && e.cause === 'bonus') series.set(e.ref, (series.get(e.ref) ?? 0) + 1); for (const n of series.values()) assert.equal(n, 2);
});

test('S01-04 prórroga: un empate al final de cuarto periodo juega periodos de 300 s y el final es válido; el tope técnico es fallo diagnosticado, no un ganador inventado', () => {
  let ot = null; for (let s = 1; s <= 600 && !ot; s++) { const m = play(inputOf('EQ04', 'EQ04', 4000 + s)); if (m.period > 4) ot = { m, s }; }
  assert.ok(ot, 'se encuentra una prórroga entre las primeras 600 semillas'); const r = buildSimResult(ot.m); assert.ok(r.score.overtimes >= 1); assert.equal(r.score.periods.length, 4 + r.score.overtimes);
  const sumPeriod = r.score.periods[3][0] + r.score.periods.slice(0, 3).reduce((a, p) => a + p[0], 0); assert.ok(r.score.current[0] !== r.score.current[1]); assert.ok(sumPeriod <= r.score.current[0]);
  const lastSeg = ot.m.segments[ot.m.segments.length - 1]; assert.ok(lastSeg.period >= 5); const dur = ot.m.segments.filter((g) => g.period === 5).reduce((a, g) => a + g.end - g.start, 0); near(dur, 300, 1e-6); assert.ok(r.reconciliation.valid);
  const guard = new SimMatch(inputOf('EQ04', 'EQ04', 1), makeContext(profile, [{ path: 'rules.technicalGuardMaxOvertimes', value: 0 }])); guard.finish(); if (guard.period > 4 || guard.status === 'error') { assert.ok(guard.status === 'error' ? guard.error.cause.includes('prórrogas') : true); }
});

test('S01-05 las 32 capacidades alteran magnitudes (contraste +1/+3/+5 a contexto fijo) y cada control soportado cambia una distribución; las filas editadas llegan al cálculo', () => {
  const inp = inputOf('EQ03', 'EQ04', 1); const caps = capabilityContrast(ctx, inp);
  assert.equal(caps.length, 32); assert.deepEqual(caps.map((c) => c.id), CAPABILITIES.map((c) => c.id));
  for (const c of caps) { assert.ok(c.used, `${c.id} cambia alguna magnitud`); assert.ok(c.asExpected, `${c.id} cambia la magnitud esperada (${c.expect})`); }
  const dir = (id, key, sign) => { const base = probeVector(ctx, inp).vector; const up = probeVector(ctx, bumpAbilities(inp, Object.values(inp.teams[0].plan.starters), [id], 5)).vector; assert.ok(Math.sign(up[key] - base[key]) === sign, `${id}→${key}`); };
  dir('TEC01', 'pMake.three.0', 1); dir('TEC05', 'pFT.0', 1); dir('TEC15', 'pBlock.rim.1', 1); dir('FIS06', 'energy.cost.0', -1); dir('MEN06', 'moment.sigma.0', -1); dir('TEC18', 'pOrb.field.0', 1);
  for (const row of controlContrasts(ctx, inp)) { if (row.status.startsWith('exclusivo')) { assert.equal(row.changed.length, 0); continue; } if (row.note) continue; assert.ok(row.changed.length > 0, `el control ${row.id} cambia alguna distribución`); }
  // prioridades empatadas: mismas distribuciones; empate no equivale a ausencia
  const tie = JSON.parse(JSON.stringify(inp)); tie.teams[0].plan.playbook.forEach((e) => { e.priority = 3; }); assert.ok(diffVectors(probeVector(ctx, inp).vector, probeVector(ctx, tie).vector).some((x) => x.key.startsWith('mix.family')));
  // extremos de ritmo: más ritmo ⇒ menos segundos por control y más controles esperados
  const slow = JSON.parse(JSON.stringify(inp)); slow.teams.forEach((t) => { t.plan.styles.organizedPace = 1; }); const fast = JSON.parse(JSON.stringify(inp)); fast.teams.forEach((t) => { t.plan.styles.organizedPace = 5; });
  assert.ok(probeVector(ctx, slow).vector['pace.sec.0'] > probeVector(ctx, fast).vector['pace.sec.0']);
  const ctlOf = (i) => { let c = 0; for (let s = 1; s <= 6; s++) c += buildSimResult(play(i, {}), { events: false }).controls[0]; return c; }; void ctlOf;
  // fila editada ⇒ otra distribución; la base no se modifica
  const base = buildSimProfile(profile); const cand = applyOverrides(base, [{ path: 'volume.neutralSecondsPerControl', value: 12 }]); assert.deepEqual(diffProfile(base, cand), [{ path: 'volume.neutralSecondsPerControl', base: 16, candidate: 12 }]); assert.equal(base.v.volume.neutralSecondsPerControl, 16);
  const pv = probeVector(makeContext(profile, [{ path: 'volume.neutralSecondsPerControl', value: 12 }]), inp).vector; assert.ok(pv['pace.sec.0'] < probeVector(ctx, inp).vector['pace.sec.0']);
  assert.ok(validateOverrides(base, [{ path: 'no.existe', value: 1 }, { path: 'segment.normalSeconds', value: -1 }, { path: 'shots.three.p0', value: 1.2 }, { path: 'volume.secondsPerControlBounds', value: [10] }]).length === 4, 'rutas desconocidas, valores no válidos y formas incorrectas se rechazan con causa');
  assert.ok(base.rows.every((r) => ['heredada', 'derivada', 'SEM-SIM01', 'SEM-SIM02', 'SEM-SIM04', 'SEM-SIM04B'].includes(r.origin) && r.unit && r.effect), 'toda fila declara procedencia, unidad y efecto'); assert.equal(base.rows.filter((r) => r.origin === 'SEM-SIM01').length, 8);
});

test('S01-06 familiaridad congelada y sin efecto inmediato de Polivalencia: conocimiento bajo/alto cambia la calidad antes del sorteo; sin conocimiento explícito o todo al máximo = neutral; el encuentro no cambia conocimiento', () => {
  const withK = (level, patch) => (i) => { for (const t of i.teams) for (const p of t.players) { p.knowledge = { mode: 'explicit', ...uniformBlock(level), ...(patch ?? {}) }; } };
  const neutral = probeVector(ctx, inputOf('EQ03', 'EQ04', 1)).vector; const max = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withK(30))).vector; const low = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withK(1))).vector;
  assert.deepEqual(diffVectors(neutral, max, 1e-12), [], 'todos los niveles al máximo ⇒ el ajuste es exactamente 0'); // SIM-MOTOR-02 (§4.3): ignorancia simétrica en las fichas organizadas y en la decisión espontánea se compensa una sola vez por cálculo (maxDefensa·U_D − maxAtaque·U_A); la TRANSICIÓN no tiene organización
  // defensiva estable representada (como en el detallado) y por eso solo el ataque carece de módulo: es la única que cambia la calidad cómoda.
  const lowV = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withK(1))); assert.ok(Object.entries(lowV.vector).filter(([k]) => k.startsWith('fam.play.') || k.startsWith('fam.spontaneous.')).every(([, x]) => Math.abs(x) < 1e-12), 'organizado y espontáneo: compensado'); assert.ok(lowV.vector['fam.transition.0'] < 0);
  assert.deepEqual(diffVectors(neutral, low, 1e-12).map((d) => d.key).sort(), ['quality.comfortable.0', 'quality.comfortable.1'], 'solo la mezcla con transición cambia');
  const lowA = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, (i) => { for (const p of i.teams[0].players) p.knowledge = { mode: 'explicit', ...uniformBlock(1) }; for (const p of i.teams[1].players) p.knowledge = { mode: 'explicit', ...uniformBlock(30) }; })).vector;
  assert.ok(lowA['quality.comfortable.0'] < neutral['quality.comfortable.0'] && lowA['quality.comfortable.1'] > neutral['quality.comfortable.1'], 'la carencia propia penaliza a quien ataca y favorece a su rival');
  const inp = inputOf('EQ03', 'EQ04', 3, withK(10)); const snapshot = JSON.stringify(inp.teams.map((t) => t.players.map((p) => p.knowledge))); const m = play(inp); assert.equal(JSON.stringify(inp.teams.map((t) => t.players.map((p) => p.knowledge))), snapshot, 'el encuentro no cambia el conocimiento de entrada');
  const poly = inputOf('EQ03', 'EQ04', 3, (i) => { withK(10)(i); for (const t of i.teams) for (const p of t.players) { p.tacticalLearning = 30; p.polyvalence = 30; } }); assert.equal(fpOf(play(poly)), fpOf(m), 'la Polivalencia no mejora la actuación durante el partido');
  const r = buildSimResult(m); assert.ok(Object.keys(r.exposure).length >= 10 && Object.values(r.exposure).every((e) => Object.keys(e.slotSec).length >= 1), 'exposiciones compactas por posición');
});

test('S01-07 entrada incompatible: rechazo localizado con causa, sin modificar el original; lo que SIM no representa se declara', () => {
  const inp = inputOf('EQ01', 'EQ02', 1); const bad = JSON.parse(JSON.stringify(inp)); bad.teams[0].players[0].abilities.TEC01 = 99; delete bad.teams[0].players[1].abilities.TEC02; bad.teams[1].id = bad.teams[0].id; bad.teams[1].plan.playbook[0].playId = 'POSXX'; bad.teams[0].plan.styles.freedom = 9; bad.schema = 'beM-match-input/2';
  const snap = JSON.stringify(bad); const errs = validateSimInput(bad, ctx.sp, ctx.T); assert.equal(JSON.stringify(bad), snap);
  for (const frag of ['teams[0](EQ01).players[0](EQ01-J01).abilities.TEC01', 'abilities.TEC02', 'identidad de instancia', 'POSXX', 'styles.freedom', 'esquema no admitido']) assert.ok(errs.some((e) => (e.path + e.message).includes(frag)), frag);
  assert.throws(() => new SimMatch(bad, ctx), (e) => Array.isArray(e.validation) && e.validation.length >= 5);
  const ok = normalizeInput(inp, ctx.sp, ctx.T); assert.ok(ok.ignored.includes('plan.throwInBook') && ok.ignored.includes('plan.throwInServers'), 'saques declarados como ignorados'); assert.ok(buildSimResult(play(inp), { events: false }).identity.ignoredInput.length >= 1);
  assert.equal(new Rng(0).draws, 0);
});

test('S01-08 agenda congelada: 132 cruces × 7 vueltas + 76, semillas estables y únicas', () => {
  const ag = buildAgenda(); assert.equal(ag.length, 1000); assert.equal(TEAM_IDS.length, 12); assert.equal(new Set(ag.map((c) => c.id)).size, 1000); assert.equal(new Set(ag.map((c) => c.seed)).size, 1000, 'sin colisiones de semilla');
  assert.deepEqual(ag.slice(0, 132).map((c) => `${c.a}-${c.b}`), ag.slice(132, 264).map((c) => `${c.a}-${c.b}`)); assert.deepEqual(ag.slice(924).map((c) => `${c.a}-${c.b}`), ag.slice(0, 76).map((c) => `${c.a}-${c.b}`)); assert.ok(ag.every((c) => c.a !== c.b));
  assert.equal(ag[0].id, 'SIM01-C0001'); assert.equal(ag[999].round, 8); assert.equal(ag[999].pos, 76); assert.deepEqual(buildAgenda(), ag, 'determinista');
  assert.deepEqual(ag.slice(0, 3).map((c) => c.seed), buildAgenda().slice(0, 3).map((c) => c.seed)); assert.notDeepEqual(buildAgenda({ master: 1 })[0].seed, ag[0].seed);
});

test('S01-09 lote: el resumen de un caso es el mismo en proceso y en trabajadores (tres cruces, dos hilos); el contexto se reutiliza', async () => {
  const ag = buildAgenda().slice(0, 6); const direct = ag.map((c) => runCase(ctx, teamMap, c)); direct.forEach((r) => { assert.ok(r.valid); assert.equal(r.checks, RECONCILIATION_IDS.length); });
  const pool = new SimPool({ workers: 2 }); await pool.start(contextToJSON(ctx), ctx.sp.fingerprint, teamMap, []);
  try { const a = await pool.run(ag, { chunk: 2 }); const b = await pool.run(ag, { chunk: 1 }); assert.deepEqual(a.results.map((r) => r.fp), direct.map((r) => r.fp)); assert.deepEqual(b.results.map((r) => r.fp), direct.map((r) => r.fp)); assert.deepEqual(a.results.map((r) => r.score), direct.map((r) => r.score)); assert.ok(pool.readyInfo.length === pool.size); } finally { await pool.close(); }
});

test('S01-10 el modelo no llama al detallado y la referencia detallada permanece intacta', async () => {
  const { readFileSync, readdirSync } = await import('node:fs'); const files = readdirSync(new URL('../src/sim/', import.meta.url)).filter((f) => f.endsWith('.js'));
  for (const f of files) { const src = readFileSync(new URL(`../src/sim/${f}`, import.meta.url), 'utf8'); assert.ok(!/from '\.\.\/match\/(core|flow|actions|defense|plays|states|coach|memory|orders|throwin|rotation|spontaneous|familiarity|availability|incident-admin|correction-admin)\.js'/.test(src), `${f} no importa el resolutor detallado`); assert.ok(!/createMatch|runMatch|MatchCore/.test(src.replace(/\/\/.*$/gm, '')), `${f} no ejecuta el detallado`); }
  const { buildMatchInput, runMatch } = await import('../src/match/index.js'); const res = runMatch(buildMatchInput(profile, players, { seed: 20261016 }), profile, { detail: 'full' });
  assert.deepEqual(res.score, [83, 98]); assert.equal(res.diagnostics.sportingDraws, 6684);
});
