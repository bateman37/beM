// SIM-MOTOR-02: pruebas agrupadas por riesgo concreto (§12.1). Reproducen el defecto anterior cuando es reproducible (valores del encargo C02-01…05) y comprueban distribuciones ANTES del sorteo
// para roles, director y familiaridad. Los partidos completos de integración se ejercen en las pruebas de jornada, historia y persistencia y en la medición; aquí no se repiten barridos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult, validateSimInput } from '../src/sim/index.js';
import { probeVector, diffVectors } from '../src/sim/probe.js';
import { buildAgenda } from '../src/sim/schedule.js';
import { energyLoad, offRoleBias } from '../src/sim/model.js';
import { extractTables } from '../src/sim/tables.js';
import { uniformBlock } from './m18-helpers.js';

const { profile, players } = data; const ctx = makeContext(profile);
const inputOf = (a, b, seed, over) => { const i = buildReferenceInput(profile, players, a, b, { seed }); over?.(i); return i; };
const play = (input, opts) => { const m = new SimMatch(input, ctx, opts); m.finish(); return m; };
const draws = (m) => m.rng.draws;

test('S02-01 prefijo público: todo campo describe el presente (caso SIM01-C0001), la publicación es monótona y el sufijo generado permanece privado', () => {
  const c = buildAgenda()[0]; assert.equal(c.seed, 152650156); const inp = inputOf(c.a, c.b, c.seed); const m = new SimMatch(inp, ctx);
  const adv = m.advance({ until: 1 }); assert.equal(adv.published, 1); assert.equal(adv.generatedUntil, 120, 'el generador va por delante: justo el defecto de 01');
  const pub = buildSimResult(m, { audience: 'public' });
  assert.equal(pub.published, 1); assert.equal(pub.generatedUntil, undefined, 'el sufijo no se anuncia en público');
  assert.deepEqual(pub.score.current, [0, 0]); assert.deepEqual(pub.score.periods, [[0, 0]], 'antes: periodos [[6,5]] con marcador [0,0]');
  assert.ok(pub.controls[0] + pub.controls[1] <= 1, `controles alcanzados en 1 s: ${pub.controls} (antes: [5,4] del tramo futuro)`); assert.equal(pub.events.length, 0); assert.equal(pub.status, 'running');
  const r01 = pub.reconciliation.checks.find((x) => x.id === 'R01_marcador_periodos'); assert.ok(r01 && r01.ok && r01.universe >= 1, 'R01 se evalúa sobre el prefijo parcial; un control omitido no es una aprobación'); assert.equal(pub.reconciliation.notEvaluated.length, 0);
  // privado solo para diagnóstico y solo si se pide
  assert.equal(buildSimResult(m, { audience: 'diagnostic' }).privateSuffix, undefined); const diag = buildSimResult(m, { audience: 'diagnostic', includeSuffix: true }); assert.equal(diag.privateSuffix.generatedUntil, 120); assert.ok(diag.privateSuffix.events > 0);
  // publicación monótona: avanzar a 120 y luego pedir 30 es un rechazo explícito, no un rebobinado
  m.advance({ until: 120 }); const back = m.advance({ until: 30 }); assert.equal(back.rejected, true); assert.match(back.reason, /monótona/); assert.equal(m.published, 120);
  assert.equal(m.advance({ until: -5 }).rejected, true); assert.equal(m.advance({ until: NaN }).rejected, true);
  // una vista histórica es otra operación de lectura: no altera la publicación ni el azar
  const d0 = draws(m); const hist = buildSimResult(m, { audience: 'public', at: 30 }); assert.equal(hist.published, 30); assert.equal(m.published, 120); assert.equal(draws(m), d0); assert.ok(hist.events.every((e) => e.t <= 30 + 1e-9));
  // mitad de tramo, frontera y tramo siguiente: periodos suman el marcador y los controles son los alcanzados
  for (const t of [37.3, 120, 241.7, 600, 901.2]) {
    m.advance({ until: t }); const r = buildSimResult(m, { audience: 'public' }); const sum = r.score.periods.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]); assert.deepEqual(sum, r.score.current, `periodos = marcador a ${t} s`); assert.ok(r.reconciliation.valid, `${t}: ${r.reconciliation.checks.filter((x) => !x.ok).map((x) => x.id)}`);
    const reached = [0, 0]; for (const s of m.segments) for (let i = 0; i < s.ct.length; i++) if (s.ct[i] <= r.published + 1e-9) reached[s.ck[i]]++; assert.deepEqual(r.controls, reached, `controles alcanzados a ${t} s`);
    assert.ok(r.segments.every((s) => s.end <= r.published + 1e-9), 'ningún tramo publicado termina por delante del presente'); assert.ok(r.observable.at <= r.published + 1e-9);
  }
  // energía: solo propia/diagnóstico, proyectada a la frontera (nunca la del núcleo adelantado)
  const own = buildSimResult(m, { audience: 'own', team: 0 }); assert.ok(own.observable.energy && Object.keys(own.observable.energy).every((id) => m.teams[0].byId[id])); assert.equal(buildSimResult(m, { audience: 'public' }).observable.energy, undefined);
  assert.equal(buildSimResult(m, { audience: 'public' }).exposure, undefined, 'la exposición de aprendizaje no es pública');
});

test('S02-01b el final y la prórroga no se anuncian antes de publicarse', () => {
  let ot = null; for (let s = 1; s <= 700 && !ot; s++) { const m = play(inputOf('EQ04', 'EQ04', 4000 + s)); if (m.period > 4) ot = { s, inp: inputOf('EQ04', 'EQ04', 4000 + s) }; }
  assert.ok(ot, 'hay una prórroga entre las primeras 700 semillas'); const m = new SimMatch(ot.inp, ctx);
  m.advance({ until: 2399 }); let r = buildSimResult(m, { audience: 'public' }); assert.equal(r.score.overtimes, 0); assert.equal(r.score.winner, null); assert.equal(r.score.final, null); assert.equal(r.finishedPublished, false); assert.equal(r.status, 'running');
  m.advance({ until: 2400 }); r = buildSimResult(m, { audience: 'public' }); assert.equal(r.score.overtimes, 1, 'al llegar a 2.400 s el empate se publica con su prórroga'); assert.equal(r.finishedPublished, false);
  m.advance({ until: 'end' }); r = buildSimResult(m, { audience: 'public' }); assert.equal(r.finishedPublished, true); assert.equal(r.status, 'finished'); assert.ok(r.score.winner === 0 || r.score.winner === 1);
});

test('S02-02 acta y familias: libres, finalizaciones únicas, receptor de falta ofensiva, continuidad tras tapón fuera, guard técnico y contadores causales de faltas', () => {
  let bonusSeen = false; let and1 = 0; let offFouls = 0; let blockOob = 0; let withContinuation = 0;
  for (let i = 0; i < 12; i++) {
    const m = play(inputOf('EQ01', 'EQ02', 700 + i)); const r = buildSimResult(m); assert.ok(r.reconciliation.valid, `${i}: ${r.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id)}`);
    for (const k of [0, 1]) {
      const t = r.box.teams[k]; const fam = r.families[k]; const sum = (key) => fam.reduce((a, x) => a + x[key], 0);
      assert.equal(sum('pts'), t.pts, 'las categorías exhaustivas suman los puntos del acta (antes: 76 de 87)'); assert.equal(sum('fta'), t.fta, 'los intentos de libre figuran en las familias (antes fta = 0)'); assert.equal(sum('ftm'), t.ftm); assert.equal(t.fgPts + t.ftPts, t.pts);
      // finalizaciones únicas recalculadas de forma independiente: tiro, falta de tiro y serie ligada comparten identidad
      const fins = new Set(r.events.filter((e) => ((e.ty === 'shot' && e.tm === k) || (e.ty === 'shootfoul' && e.tm === 1 - k)) && e.fin != null).map((e) => e.fin)); assert.equal(fins.size, r.familyDenominators[k].finalizations);
      const naive = r.events.filter((e) => (e.ty === 'shot' && e.tm === k) || (e.ty === 'shootfoul' && e.tm === 1 - k)).length; assert.ok(naive >= fins.size, 'el cómputo anterior (tiro + falta) duplicaba la canasta con falta'); and1 += r.events.filter((e) => e.ty === 'shot' && e.tm === k && e.and1).length;
      if (fam.some((x) => x.key === 'bonus_sin_familia')) bonusSeen = true;
    }
    for (const e of r.events) { if (e.ty === 'ft' && e.cause === 'bonus') { assert.equal(e.fin, null); assert.equal(e.src, 'bonus_sin_familia'); } if (e.ty === 'foul' && e.kind === 'offensive') { offFouls++; assert.ok(e.drawn != null || e.drawnKind === 'collective'); if (e.drawn) assert.equal(m.teams[1 - e.tm].byId[e.drawn] != null, true, 'receptor del equipo rival'); } }
    r.events.forEach((e, ix) => { if (e.ty === 'shot' && e.end === 'block_out_of_bounds') { blockOob++; const next = r.events.slice(ix + 1).find((x) => (x.ty === 'shot' || x.ty === 'tov' || x.ty === 'shootfoul') && x.cont === 'block_out_of_bounds'); if (next) withContinuation++; } });
  }
  assert.ok(bonusSeen && and1 > 0 && offFouls > 0, `casos presentes: bonus ${bonusSeen}, canastas con falta ${and1}, faltas ofensivas ${offFouls}`); assert.equal(blockOob, withContinuation, `todo tapón fuera reanuda la misma continuidad (${blockOob})`);
  // guard técnico: fallo diagnosticado, nunca una posesión abandonada que entregue el control al rival
  const g = new SimMatch(inputOf('EQ01', 'EQ02', 1), ctx); assert.throws(() => g._continue({ chain: [] }, 0, 64, 'offensive_rebound', true), /tope técnico de continuaciones/);
  const f = new SimMatch(inputOf('EQ01', 'EQ02', 1), ctx); f._genAttacks = () => { throw new Error('tope técnico de continuaciones (64) alcanzado en una misma posesión (offensive_rebound)'); }; const adv = f.advance({ until: 'end' }); assert.equal(f.status, 'error'); assert.match(f.error.cause, /tope técnico/); assert.equal(adv.status, 'error'); assert.equal(buildSimResult(f, { events: false, reconcile: false }).score.final, null, 'un fallo no tiene marcador definitivo');
});

test('S02-02b exclusión causal: la primera falta del tramo no es una exclusión y los contadores por hecho se concilian', () => {
  const rough = (i) => { for (const t of i.teams) for (const p of t.players.slice(0, 12)) for (const a of ['TEC12', 'TEC13', 'MEN04', 'MEN05']) p.abilities[a] = 1; };
  let found = null; for (let s = 1; s <= 40 && !found; s++) { const m = play(inputOf('EQ01', 'EQ02', s, rough)); const r = buildSimResult(m); assert.ok(r.reconciliation.valid, `semilla ${s}`); const out = r.events.find((e) => e.out === true); if (out) found = { m, r, out }; }
  assert.ok(found, 'con defensores muy flojos hay una exclusión'); const { m, r, out } = found; assert.equal(out.pfN, 5, 'solo la quinta falta marca la exclusión');
  const fouls = r.events.filter((e) => (e.ty === 'foul' || e.ty === 'shootfoul') && e.pl === out.pl); assert.deepEqual(fouls.map((e) => e.pfN), [1, 2, 3, 4, 5]); assert.deepEqual(fouls.map((e) => !!e.out), [false, false, false, false, true]);
  assert.ok(r.reconciliation.checks.find((c) => c.id === 'R21_faltas_causales').ok); void m;
});

test('S02-03 roles, director y familiaridad pertinente: distribuciones fijas antes del sorteo', () => {
  const T = ctx.T; const S = ctx.sp.v; const base = inputOf('EQ03', 'EQ04', 1); const baseV = probeVector(ctx, base).vector;
  // factor heredado, una sola vez: función favorecida ⇒ favoredFunctionWeight; otra ⇒ otherFunctionWeight
  const pl = { offRole: 'O14' }; assert.equal(offRoleBias(S, T, pl, ['catchShooter']), S.selection.rolePreference.favoredFunctionWeight); assert.equal(offRoleBias(S, T, pl, ['screener']), S.selection.rolePreference.otherFunctionWeight);
  // un rol ofensivo distinto en la MISMA ficha física mueve la participación del jugador (antes del sorteo y con conocimiento neutral)
  const starterOf = (i, t, n) => i.teams[t].players.find((p) => p.id === Object.values(i.teams[t].plan.starters)[n]); // índice de la alineación inicial: el probe numera a los jugadores en pista
  const withRole = (code, idx = 1) => (i) => { const p = starterOf(i, 0, idx); p.offensiveRole = { ...(p.offensiveRole ?? {}), code }; };
  const a = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withRole('O14'))).vector; const b = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withRole('O12'))).vector;
  assert.ok(diffVectors(a, b).some((d) => d.key.startsWith('part.finisher.')), 'tirador de recepción y organizador no se comportan igual'); assert.ok(diffVectors(a, b).some((d) => d.key.startsWith('part.passer.')), 'el rol orienta quién entrega el pase final');
  assert.ok(b['part.passer.1.0'] > a['part.passer.1.0'], 'el organizador (favorece «pasador») pasa más que el tirador de recepción');
  // rol defensivo: orienta responsabilidades y créditos compatibles; la capacidad sigue determinando la ejecución
  const withDef = (code) => (i) => { const p = starterOf(i, 1, 1); p.defensiveRole = { ...(p.defensiveRole ?? {}), code }; };
  const d1 = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withDef('D11'))).vector; const d2 = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, withDef('D12'))).vector; assert.ok(diffVectors(d1, d2).some((d) => d.key.startsWith('credit.steal.') || d.key.startsWith('def.') || d.key.startsWith('credit.offFoulRecv.')));
  assert.ok(d1['credit.steal.1.0'] > d2['credit.steal.1.0'], 'presionador del balón (D11) roba más que protector del aro (D12)');
  // director efectivo: dos directores con Visión/Decisiones distintas ⇒ q cambia en la dirección esperada (mismos cinco jugadores y plan)
  const dirIn = (idx) => (i) => { const ids = Object.values(i.teams[0].plan.starters); const [hi, lo] = [ids[0], ids[4]]; for (const p of i.teams[0].players) { if (p.id === hi) { p.abilities.MEN02 = 28; p.abilities.MEN03 = 28; } if (p.id === lo) { p.abilities.MEN02 = 4; p.abilities.MEN03 = 4; } } i.teams[0].plan.directorPriority = [ids[idx]]; };
  const qHi = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, dirIn(0))).vector['reading.q.0']; const qLo = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, dirIn(4))).vector['reading.q.0']; assert.ok(qHi > qLo + 0.1, `q(director lúcido) ${qHi} > q(director flojo) ${qLo}`);
  // familiaridad solo pertinente: POS14 (isolation, sin cobertura) ignora el conocimiento de cobertura del defensor; POS01 (con cobertura) sí lo usa
  const kn = (def) => (i) => { for (const p of i.teams[0].players) p.knowledge = { mode: 'explicit', ...uniformBlock(30) }; for (const p of i.teams[1].players) p.knowledge = { mode: 'explicit', ...uniformBlock(30) }; def?.(i); };
  const lowCov = (i) => { for (const p of i.teams[1].players) for (const c of ['COB01', 'COB02', 'COB03', 'COB04']) p.knowledge.tactics[c] = { ...p.knowledge.tactics[c], level: 1, peak: 1 }; };
  const k0 = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, kn())).vector; const k1 = probeVector(ctx, inputOf('EQ03', 'EQ04', 1, kn(lowCov))).vector;
  for (const key of Object.keys(k0).filter((x) => x.startsWith('fam.play.'))) { const pid = key.split('.')[2]; const family = T.plays[pid].family; if (T.plays[pid].coverage == null) assert.equal(k1[key], k0[key], `${pid} (${family}) no usa cobertura: no cambia`); }
  assert.ok(Object.keys(k0).some((x) => x.startsWith('fam.play.') && T.plays[x.split('.')[2]].coverage != null && k1[x] !== k0[x]), 'una ficha con cobertura aplicable sí cambia'); assert.equal(k1['fam.transition.0'], k0['fam.transition.0']); assert.equal(k1['fam.spontaneous.0'], k0['fam.spontaneous.0']);
  assert.equal(baseV['reading.q.0'], probeVector(ctx, base).vector['reading.q.0']);
});

test('S02-03b congelación: editar la entrada o el conocimiento después de crear el encuentro no lo modifica', () => {
  const inp = inputOf('EQ03', 'EQ04', 3, (i) => { for (const t of i.teams) for (const p of t.players) p.knowledge = { mode: 'explicit', ...uniformBlock(10) }; }); const m = new SimMatch(inp, ctx); const snap = JSON.stringify(m.teams.map((t) => t.players.map((p) => p.kn)));
  for (const t of inp.teams) for (const p of t.players) { p.knowledge.tactics.DIS01.level = 1; p.abilities.TEC01 = 1; p.state.energy = 1; } inp.teams[0].plan.styles.organizedPace = 5;
  assert.equal(JSON.stringify(m.teams.map((t) => t.players.map((p) => p.kn))), snap); assert.notEqual(m.teams[0].players[0].ab.TEC01, 1); assert.notEqual(m.teams[0].players[0].energy, 1); assert.notEqual(m.teams[0].plan.styles.organizedPace, 5);
  assert.notEqual(m.teams[0].players[0].kn, inp.teams[0].players[0].knowledge, 'copia, no referencia al objeto editable');
});

test('S02-04 energía e identidad: el coste de la presión recae en quien la ordena; la huella cubre órdenes, cuerpo, roles y tablas; entradas no válidas se rechazan sin mutar', () => {
  const S = ctx.sp.v; const probe = new SimMatch(inputOf('EQ03', 'EQ04', 1), ctx); probe._prepareSides(120); const models = probe._compile(0, { importance: 'ordinary', margin: 0, period: 2, secondsLeft: 300 });
  const planA = { ...probe.teams[0].plan, pressureHeight: 'normal' }; const planAF = { ...probe.teams[0].plan, pressureHeight: 'full' };
  assert.notEqual(energyLoad(S, models[0], planA).defLoad, energyLoad(S, models[0], planAF).defLoad, 'la presión total de A cambia el componente defensivo de A');
  // cableado real en `_finishSegment`: mismo tiempo, resistencia, cobertura y mezcla ofensiva ⇒ solo cambia la energía del equipo que presiona
  const run = (height) => { const i = inputOf('EQ03', 'EQ04', 1); i.teams[0].plan.pressureHeight = height; const m = new SimMatch(i, ctx); m._prepareSides(120); const seg = { start: 0, end: 120 }; m._finishSegment(seg, 0, 120, models); return m.teams.map((t) => t.players.filter((p) => p.onCourt).map((p) => p.energy)); };
  const e0 = run('normal'); const e1 = run('full'); assert.notDeepEqual(e0[0], e1[0], 'A paga su presión'); assert.deepEqual(e0[1], e1[1], 'B no paga la presión de A (antes: el incremento se cargaba a B)');
  // identidad: mismas entradas salvo órdenes / cuerpo / roles / conocimiento ⇒ huellas distintas; mismo contenido ⇒ misma huella
  const fp = (over) => new SimMatch(inputOf('EQ01', 'EQ02', 5, over), ctx).norm.fingerprint; const f0 = fp();
  assert.equal(fp(), f0); assert.notEqual(fp((i) => { i.orders = [{ at: 600, team: 0, plan: { midrange: 'seek' } }]; }), f0, 'órdenes programadas'); assert.notEqual(fp((i) => { i.orders = [{ at: 600, team: 0, plan: { midrange: 'avoid' } }]; }), fp((i) => { i.orders = [{ at: 600, team: 0, plan: { midrange: 'seek' } }]; }));
  assert.notEqual(fp((i) => { i.teams[0].players[0].heightCm += 1; }), f0, 'cuerpo'); assert.notEqual(fp((i) => { i.teams[0].players[2].offensiveRole = { code: 'O09' }; }), f0, 'roles'); assert.notEqual(fp((i) => { i.teams[1].players[0].knowledge = { mode: 'explicit', ...uniformBlock(9) }; }), f0, 'conocimiento');
  // cadena reproducible: la entrada raíz no se renombra cuando llega una orden; la variante de comandos sí cambia la identidad efectiva
  const inp = inputOf('EQ01', 'EQ02', 5); const a = new SimMatch(inp, ctx); a.advance({ until: 130 }); const c0 = a.chain(); assert.equal(a.submit({ team: 0, plan: { midrange: 'seek' } }).ok, true); const c1 = a.chain(); assert.equal(c1.root, c0.root); assert.notEqual(c1.effective, c0.effective); assert.equal(c1.nCommands, 1); a.addContext({ kind: 'need', team: 0, requiredMargin: 1 }); assert.notEqual(a.chain().context, c1.context);
  // la tabla efectiva abarca TODOS los catálogos: cambiar un rol, una disposición o una función cambia la huella
  const tf = (mut) => { const d = JSON.parse(JSON.stringify(profile)); mut(d); return extractTables(d).fingerprint; }; const t0 = extractTables(profile).fingerprint;
  assert.equal(tf(() => {}), t0); assert.notEqual(tf((d) => { d.repertoire.offensiveRoles.O01.favors.push('cutter'); }), t0); assert.notEqual(tf((d) => { d.defenseRepertoire.roles.D01.tags.push('rimHelp'); }), t0); assert.notEqual(tf((d) => { d.repertoire.functions.top.label = 'x'; }), t0);
  // validación estricta: no finitos, rangos, referencias y órdenes (antes de mutar nada)
  const bad = inputOf('EQ01', 'EQ02', 5); bad.teams[0].players[0].state.energy = NaN; bad.teams[0].players[1].state.form = Infinity; bad.teams[0].players[2].heightCm = NaN; bad.teams[1].players[0].abilities.TEC01 = NaN;
  const errs = validateSimInput(bad, ctx.sp, ctx.T); for (const frag of ['state.energy', 'state.form', 'heightCm', 'abilities.TEC01']) assert.ok(errs.some((e) => e.path.includes(frag)), frag); assert.throws(() => new SimMatch(bad, ctx), (e) => Array.isArray(e.validation));
  const m = new SimMatch(inputOf('EQ01', 'EQ02', 5), ctx); const before = JSON.stringify([m.orders, m.commandLog, m.teams.map((t) => t.plan)]);
  for (const o of [{ team: 7, plan: { midrange: 'seek' } }, { team: 'XX', plan: { midrange: 'seek' } }, { team: 0, at: -3, plan: { midrange: 'seek' } }, { team: 0, at: NaN, plan: { midrange: 'seek' } }, { team: 0, plan: { disposition: 'DIS99' } }, { team: 0, plan: { styles: { freedom: 9 } } }, { team: 0, plan: { starters: {} } }, { team: 0, plan: {} }]) { const r = m.submit(o); assert.equal(r.ok, false, JSON.stringify(o)); }
  assert.equal(JSON.stringify([m.orders, m.commandLog, m.teams.map((t) => t.plan)]), before, 'ninguna orden rechazada deja rastro'); assert.throws(() => new SimMatch({ ...inputOf('EQ01', 'EQ02', 5), orders: [{ at: 1, team: 9, plan: { midrange: 'seek' } }] }, ctx), (e) => e.validation.some((v) => v.path.startsWith('orders[0]')));
});
