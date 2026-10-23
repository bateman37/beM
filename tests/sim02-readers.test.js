// SIM-MOTOR-02: lectores sobre hechos SIM, audiencias y neutralidad entre variantes de registro/avance/guardado (§6, §12.1 «Neutralidad»).
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult } from '../src/sim/index.js';
import { simReader, NOT_REPRESENTED, SIM_VIEWS } from '../src/sim/readers.js';
import { playWithBarriers } from '../src/sim/coachsim.js';
import { snapshotSim, restoreSim } from '../src/sim/snapshot.js';
import { buildSimEssential } from '../src/sim/essential.js';

const { profile, players } = data; const ctx = makeContext(profile);
const input = (a, b, seed) => buildReferenceInput(profile, players, a, b, { seed });
const fp = (m) => buildSimResult(m, { events: false, reconcile: false }).sportFingerprint;

test('S02-13 lectores y audiencias: vistas completas sobre hechos SIM, cuota de cierres y producción por 100, ausencias tipadas y nada privado en lo público (tampoco al terminar)', () => {
  const m = new SimMatch(input('EQ05', 'EQ09', 2026), ctx, { matchId: 'T', attemptId: 1 }); m.advance({ until: 1500 }); m.submit({ team: 0, plan: { midrange: 'seek' } }); playWithBarriers(m, { every: 120, policy: true });
  const diag = buildSimResult(m, { audience: 'diagnostic', includeSuffix: true }); const pub = buildSimResult(m, { audience: 'public' }); const own = buildSimResult(m, { audience: 'own', team: 0 });
  assert.equal(pub.status, 'finished'); const PRIVATE = ['"exposure"', '"decisions"', '"privateSuffix"', '"tau"', '"sigma"', '"secPerControl"', '"generatedUntil"', '"commands"', '"generatedControls"'];
  const pj = JSON.stringify(simReader(pub).exportar('json')); for (const k of PRIVATE) assert.ok(!pj.includes(k), `lo público no contiene ${k} (ni al terminar)`); assert.ok(pub.segments.every((s) => s.plans.every((p) => Object.keys(p).sort().join() === 'coverage,defense,disposition,pressureHeight')), 'el rival no revela sus estilos ni su libro');
  assert.ok(own.decisions && own.decisions.every((d) => d.team === 0) && own.segments.every((s) => 'styles' in s.plans[0] && !('styles' in s.plans[1])), 'lo propio añade solo información del equipo seleccionado');
  assert.ok(m.commandLog.some((c) => c.source === 'manual')); assert.ok(own.commands.every((c) => c.team === 0));
  for (const aud of [pub, own, diag]) { const rd = simReader(aud); for (const [id] of SIM_VIEWS.filter(([v]) => v !== 'exportar')) assert.ok(rd[id](), id); assert.ok(rd.exportar('csv').startsWith('equipo,jugador')); assert.ok(/Puntos clave|sin diferencias/.test(rd.exportar('md'))); assert.ok(rd.resumen().keyPoints.length <= 3 && rd.resumen().keyPoints.every((k) => k.evidence && k.threshold)); }
  // cuota de cierres: cada finalización SIM tiene un único tirador; la suma por equipo es 1; producción por 100 con presencia completa
  const rd = simReader(diag); const acta = rd.acta(); for (const k of [0, 1]) { const share = acta.players[k].reduce((a, p) => a + (p.closingShare ?? 0), 0); assert.ok(Math.abs(share - 1) < 0.02, `Σ cuota de cierres del equipo ${k} = ${share}`); assert.equal(acta.players[k].reduce((a, p) => a + p.finalizationsSim, 0), diag.familyDenominators[k].finalizations); }
  const star = acta.players[0].filter((p) => p.controlsOn > 0)[0]; const ctlOn = diag.segments.filter((s) => s.lineups[0].includes(star.id)).reduce((a, s) => a + s.controls[0], 0); assert.equal(star.controlsOn, ctlOn); assert.equal(star.ptsPer100ControlsSim, Math.round((1000 * star.pts) / ctlOn) / 10);
  // ausencias tipadas: no representado ≠ cero ≠ pendiente; no conservado ≠ no ocurrió
  const dg = rd.diagnostico(); for (const id of ['pass_alternatives', 'help_chains', 'movements', 'tactical_inbounds']) assert.equal(dg.notRepresented.find((x) => x.id === id).status, 'no_representado'); assert.equal(dg.notRepresented.find((x) => x.id === 'mixed_attacks').status, 'no_aplica'); assert.equal(NOT_REPRESENTED.length, 5);
  const noEv = buildSimResult(m, { events: false, audience: 'diagnostic' }); assert.equal(simReader(noEv).evolucion().orders.status, 'no_conservado'); assert.match(simReader(noEv).diagnostico().retention, /no significa que no ocurriera/); assert.equal(simReader(noEv).tiro().coordinates.status, 'no_representado');
  // resumen: una muestra pequeña no prueba una causa táctica
  const early = new SimMatch(input('EQ05', 'EQ09', 2026), ctx); early.advance({ until: 400 }); assert.match(simReader(buildSimResult(early, { audience: 'public' })).resumen().sampleNote ?? '', /muestra pequeña/);
});

test('S02-14 neutralidad: registro (hechos/resumen/esencial), avance (final, barreras, fronteras, guardado) y ejecución (trabajadores) no cambian el deporte con las mismas entradas; las 32 capacidades siguen consumidas', async () => {
  for (const [a, b, seed] of [['EQ01', 'EQ08', 77], ['EQ03', 'EQ03', 4]]) {
    const inp = input(a, b, seed); const ref = new SimMatch(inp, ctx); ref.finish(); const f0 = fp(ref);
    const steps = new SimMatch(inp, ctx); for (const t of [1, 33, 120, 121, 777, 1500]) steps.advance({ until: t }); steps.finish(); assert.equal(fp(steps), f0, 'avance por fronteras = completo');
    const bar = new SimMatch(inp, ctx); playWithBarriers(bar, { every: 120, policy: false }); assert.equal(fp(bar), f0, 'barreras sin política = completo');
    const mid = new SimMatch(inp, ctx); mid.advance({ until: 901 }); const back = restoreSim(JSON.parse(JSON.stringify(snapshotSim(mid)))); back.finish(); assert.equal(fp(back), f0, 'guardar con sufijo privado y continuar = completo');
    assert.equal(buildSimResult(ref, { events: true }).sportFingerprint, f0, 'registro con hechos = sin hechos'); assert.equal(buildSimEssential(ref).identity.sportFingerprint, f0, 'esencial = acta completa'); assert.equal(buildSimResult(ref, { audience: 'public' }).sportFingerprint, f0, 'audiencia no cambia el deporte');
  }
  const { SimPool } = await import('../src/sim/pool.js'); const { contextToJSON } = await import('../src/sim/context.js'); const { referenceTeamMap } = await import('../src/sim/teams.js'); const { runCase } = await import('../src/sim/cases.js'); const { buildAgenda } = await import('../src/sim/schedule.js'); const tm = referenceTeamMap(profile, players); const ag = buildAgenda().slice(0, 8); const direct = ag.map((c) => runCase(ctx, tm, c).fp);
  for (const workers of [1, 3]) { const pool = new SimPool({ workers }); await pool.start(contextToJSON(ctx), ctx.sp.fingerprint, tm, []); try { const r = await pool.run(ag, { chunk: 3 }); assert.deepEqual(r.results.map((x) => x.fp), direct, `${workers} trabajador(es)`); } finally { await pool.close(); } }
  // detallado congelado: referencia 83–98 con 6.684 sorteos y huella intacta
  const { buildMatchInput, runMatch } = await import('../src/match/index.js'); const res = runMatch(buildMatchInput(profile, players, { seed: 20261016 }), profile, { detail: 'full' }); assert.deepEqual(res.score, [83, 98]); assert.equal(res.diagnostics.sportingDraws, 6684);
});
