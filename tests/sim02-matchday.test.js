// SIM-MOTOR-02: jornada simultánea (§7), guardado/continuación de la sesión (§8.1) y reacción a noticias publicadas. Usa la jornada mixta visible: tres partidos a la misma hora (uno del sénior propio con el
// detallado y dos SIM), un SIM con inicio desplazado y un encuentro de cantera SIM. No es una campaña: cuatro ejecuciones completas y comprobaciones dirigidas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, SimMatch, buildSimResult } from '../src/sim/index.js';
import { playWithBarriers } from '../src/sim/coachsim.js';
import { Matchday } from '../src/matchday/index.js';
import { buildMixedScenario } from '../src/matchday/scenario.js';

const { profile, players } = data; const ctx = makeContext(profile); const sc = buildMixedScenario(profile, players);
const make = (over = {}) => new Matchday({ id: 'J-MIXTA', fixtures: sc.fixtures, standings0: over.standings0 ?? sc.standings0, objectives: sc.objectives, ctx, profile, ...over });
const strip = (log) => JSON.stringify(log.map((l) => ({ ...l, tables: l.tables })));
let base = null; const baseRun = () => { if (!base) { base = make(); base.runToEnd(); } return base; };

test('S02-05 jornada mixta: reloj común con inicios desplazados, resolutor identificado, marcador y tabla desde el mismo prefijo, final sin futuro', () => {
  const md = make(); const t0 = md.view(); assert.deepEqual(t0.fixtures.map((f) => [f.id, f.resolver]), [['F1', 'detailed'], ['F2', 'sim'], ['F3', 'sim'], ['F4', 'sim'], ['F5', 'sim']], 'cada encuentro identifica su resolutor');
  assert.equal(md.T, 0); assert.ok(Object.values(t0.tables).every((t) => t.initial.artificial === true), 'la tabla inicial hipotética se identifica como fixture artificial');
  const r1 = md.step(); assert.equal(r1.T, 120); const f4 = md.packets.get('F4'); assert.equal(f4.started, false, 'un partido no iniciado no publica marcador ni estadísticas'); assert.deepEqual(f4.score, [0, 0]); assert.equal(f4.published, 0); assert.equal(f4.status, 'scheduled');
  assert.equal(md.result('F4', { audience: 'public' }).events.length, 0);
  md.runUntil(600); assert.equal(md.packets.get('F4').local, 0); md.runUntil(720); assert.equal(md.packets.get('F4').local, 120, 'tiempo local = reloj común − desfase (+600 s)'); assert.ok(md.packets.get('F4').published <= 120 + 1e-9);
  for (const p of md.packets.values()) { assert.ok(p.published <= p.local + 1e-9, `${p.id}: nada publicado por delante del reloj local`); }
  // marcador publicado = reconstrucción independiente desde los hechos publicados del SIM
  for (const id of ['F2', 'F3', 'F5']) { const r = md.result(id, { audience: 'public' }); assert.deepEqual(md.packets.get(id).score, r.score.current, `${id}: paquete = acta del prefijo`); assert.ok(r.reconciliation.valid); }
  // clasificación provisional desde esos mismos marcadores; un empate en curso es pendiente
  const prov = md.table('SEN-A', 'provisional'); const live = [...md.packets.values()].filter((p) => p.competition === 'SEN-A'); const pf = (t) => live.reduce((a, p) => a + (p.teams.includes(t) ? p.score[p.teams.indexOf(t)] : 0), 0); const base0 = Object.fromEntries(sc.standings0['SEN-A'].rows.map((r) => [r.team, r.pf]));
  for (const r of prov.rows) assert.equal(r.pf, base0[r.team] + pf(r.team), `PF de ${r.team} = tabla de partida + marcador publicado`);
  const tie = md.table('SEN-A', 'provisional'); void tie; for (const p of live) if (p.score[0] === p.score[1]) assert.ok(prov.rows.filter((r) => p.teams.includes(r.team)).every((r) => r.pending >= 1), 'empate en curso = pendiente');
});

test('S02-06 la jornada terminada: final solo con encuentros válidos, resolutores respetados y equivalencia de avances con la misma información', () => {
  const a = baseRun(); assert.ok(a.done); const view = a.view(); assert.ok(Object.values(a.results).every((r) => r.valid), 'todos terminan válidos'); assert.deepEqual(Object.keys(a.results).sort(), ['F1', 'F2', 'F3', 'F4', 'F5']);
  assert.equal(a.results.F1.model, 'detailed'); assert.equal(a.results.F2.model, 'sim'); assert.equal(a.results.F5.model, 'sim', 'la cantera propia siempre usa SIM');
  for (const c of Object.values(view.tables)) { assert.ok(c.final); const winners = c.final.rows.reduce((s, r) => s + r.w, 0); assert.ok(winners > 0); assert.equal(c.final.mode, 'final'); }
  // barreras: avanzar por cuartos, con pausa y reanudación, recorre las mismas fronteras que completar automáticamente
  const b = make(); b.runUntil(600); b.pause(); const before = JSON.stringify(b.view()); assert.equal(b.step().rejected, true); assert.equal(JSON.stringify(b.view()), before, 'en pausa no se publica nada'); b.resume(); b.runUntil(1200); b.runUntil(1800); b.runToEnd();
  assert.equal(strip(b.log), strip(a.log), 'mismas barreras, mismos paquetes, tablas y decisiones'); assert.deepEqual(Object.fromEntries(Object.entries(b.results).map(([k, v]) => [k, v.essential.identity?.sportFingerprint ?? v.essential.identity?.trajectory ?? v.essential.score?.final ?? null])), Object.fromEntries(Object.entries(a.results).map(([k, v]) => [k, v.essential.identity?.sportFingerprint ?? v.essential.identity?.trajectory ?? v.essential.score?.final ?? null])));
  // un encuentro SIM de la jornada = el mismo partido con la misma política fuera de la jornada
  const f3 = sc.fixtures.find((f) => f.id === 'F3'); const solo = new SimMatch(f3.input, ctx, { matchId: 'F3', attemptId: 1 }); playWithBarriers(solo, { every: 120, policy: true }); assert.equal(buildSimResult(solo, { events: false }).sportFingerprint, a.results.F3.essential.identity.sportFingerprint);
  // el detallado conserva su observación: nada por delante del reloj local, nunca interpolado y con el instante de observación declarado
  for (const l of a.log) { const p = l.packets.find((x) => x.id === 'F1'); assert.ok(p.published <= p.local + 1e-9); assert.equal(p.observedAt, p.published); }
  const f1 = a.packets.get('F1'); assert.equal(f1.status, 'finished'); assert.deepEqual(f1.score, a.detailed.get('F1').enc.match.score);
});

test('S02-07 guardar y recuperar la jornada de verdad (JSON, otro objeto), rechazo de un archivo alterado y pausa sin publicar lo calculado', () => {
  const ref = baseRun(); const md = make(); md.runUntil(1320); const mid = JSON.stringify(md.snapshot()); const heldTable = JSON.stringify(md.table('SEN-A', 'provisional'));
  const restored = Matchday.restore(JSON.parse(mid), { profile }); assert.equal(restored.T, 1320); assert.equal(JSON.stringify(restored.table('SEN-A', 'provisional')), heldTable); restored.runToEnd();
  assert.equal(strip(restored.log), strip(ref.log), 'continuar desde el guardado da el mismo resto'); for (const id of Object.keys(ref.results)) assert.deepEqual(restored.results[id].essential.score, ref.results[id].essential.score);
  // archivo alterado / incompleto / otra versión: se rechaza con causa y no toca la sesión activa
  const bad = JSON.parse(mid); bad.fixtures[1].state.state.score[0] += 3; const live = JSON.stringify(md.view()); assert.throws(() => Matchday.restore(bad, { profile }), /suma de comprobación/); assert.equal(JSON.stringify(md.view()), live);
  const inc = JSON.parse(mid); delete inc.fixtures; assert.throws(() => Matchday.restore(inc, { profile }), /incompleto|ausente/); const ver = JSON.parse(mid); ver.schema = 'beM-sim-matchday/9'; assert.throws(() => Matchday.restore(ver, { profile }), /incompatible/);
  // pausa: un trabajo en vuelo puede completar sufijo privado, pero continuar no publica todo lo calculado durante la pausa
  const p = make(); p.runUntil(240); p.pause(); const gen = p.shard.matches.get('F2').m.gt; const pubBefore = p.packets.get('F2').published; p.shard.matches.get('F2').m.advance({ until: pubBefore }); assert.ok(p.shard.matches.get('F2').m.gt >= gen); p.resume(); p.step(); assert.equal(p.packets.get('F2').published, 360, 'un solo barrido de publicación tras reanudar');
});

test('S02-08 reacción a noticias externas publicadas: mismo prefijo propio, respuesta futura según la política; la orden manual no se sobrescribe', () => {
  const ref = baseRun(); const needDecisions = ref.decisions.filter((d) => d.reason === 'necesidad_cierre'); assert.ok(needDecisions.length >= 1, 'EQ03 pierde y no cumple su objetivo en el cierre: acelera un nivel'); const d = needDecisions[0]; assert.equal(d.fixture, 'F2'); assert.ok(d.T >= 2220); assert.equal(d.to - d.from, 1); assert.ok(d.sample.requiredMargin > d.sample.margin);
  // misma jornada, pero con una tabla de partida en la que EQ03 cumple su objetivo con holgura: otra noticia desde la misma frontera
  const alt = JSON.parse(JSON.stringify(sc.standings0)); alt['SEN-A'].rows = alt['SEN-A'].rows.map((r) => (r.team === 'EQ03' ? { ...r, w: 12, l: 0, pf: 1000, pa: 700 } : r)); const other = make({ standings0: alt }); other.runToEnd();
  assert.equal(other.decisions.filter((x) => x.reason === 'necesidad_cierre').length, 0, 'objetivo cumplido: no hay respuesta de ritmo'); const barrier = d.barrier;
  for (let i = 0; i < barrier - 1; i++) assert.deepEqual(ref.log[i].packets, other.log[i].packets, `prefijo idéntico hasta la frontera ${i + 1}`); assert.equal(ref.log[barrier - 1].decisions.some((x) => x.reason === 'necesidad_cierre'), true);
  // la orden manual vigente tiene prioridad en su ámbito: la política no la sobrescribe y lo registra
  const md = make(); md.runUntil(2160); const r = md.order('F2', { team: 0, plan: { styles: { organizedPace: 1, transition: 3, elaboration: 3, finishPreference: 3, freedom: 3, offensiveRisk: 3, afterShot: 3 } } }); assert.equal(r.ok, true); md.runUntil(2160 + 120); md.runToEnd();
  const mm = md.shard.matches.get('F2').m; assert.ok(mm.orders.some((o) => o.source === 'manual' && o.changed?.includes('styles.organizedPace'))); assert.equal(md.decisions.filter((x) => x.fixture === 'F2' && x.team === 0 && x.dim === 'styles.organizedPace').length, 0, 'la orden manual sobre el ritmo no se sobrescribe');
  assert.ok(mm.coach.log.every((x) => x.source === 'coach-policy'));
});
