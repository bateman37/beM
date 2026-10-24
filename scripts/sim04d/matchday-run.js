// SIM-MOTOR-04D · jornada mixta (§11.2): cuatro SIM y un detallado (uno con inicio desplazado: en la barrera 6 hay un encuentro terminado y otro activo). Tres recorridos equivalentes con la candidata final:
//   D cierre DIFERIDO: se publica toda la jornada con las actas pendientes, se consulta el esencial ANTES de sellar, se guarda con sellado pendiente, se recarga de verdad y se sella cediendo el control (el resultado es el de A).
//   A completo por barreras comunes · B pausas/consultas y avance por cuartos con el mismo calendario de revisión · C guardar cuando ya terminó uno, recargar de verdad (JSON) y continuar.
// En el mismo instante (T=600) se envía una orden manual al equipo AUTORIZADO y otra a un equipo sin autoridad (rechazo tipado). Se comprueban publicaciones, resultados, noticias, decisiones y tablas.
// Además, como comprobación ADICIONAL (contada aparte: 4 SIM + 1 detallado), otra necesidad clasificatoria como entrada contextual: prefijo idéntico hasta la noticia, futuro permitido distinto.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { makeContext } from '../../src/sim/context.js';
import { Matchday } from '../../src/matchday/index.js';
import { buildMixedScenario } from '../../src/matchday/scenario.js';
import { canonical } from '../../src/sim/fp.js';
import * as L from './lib.js';

const root = new URL('../..', import.meta.url).pathname; const OUT = join(root, 'out/sim-motor04d/matchday'); mkdirSync(OUT, { recursive: true });
const env = L.loadEnv(); const vec = JSON.parse(readFileSync(join(root, 'out/sim-motor04d/vectors/C04D-FINAL-PROVISIONAL.json'), 'utf8')).overrides; const ctx = makeContext(env.profile, vec); const profile = env.profile;
const sc = buildMixedScenario(profile, env.players); const deep = (x) => JSON.parse(JSON.stringify(x));
const make = (over = {}) => new Matchday({ id: 'J-MIXTA-04D', fixtures: sc.fixtures, standings0: over.standings0 ?? sc.standings0, objectives: sc.objectives, ctx, profile, ...over });
const ORDER_AT = 600; const orders = (md) => ({ accepted: md.order('F2', { team: 0, plan: { styles: { organizedPace: 4 } } }), rejected: md.order('F2', { team: 1, plan: { styles: { organizedPace: 2 } } }) });
const digest = (md) => ({ log: canonical(md.log), results: Object.fromEntries(Object.entries(md.results).map(([k, r]) => [k, [r.model, r.valid, r.essential.identity.sportFingerprint ?? r.essential.identity.trajectory ?? null, r.essential.score?.final ?? null]])), table: Object.fromEntries(md.competitions().map((c) => [c, md.table(c, 'final').rows.map((r) => [r.team, r.w, r.l, r.pf, r.pa, r.rank])])), decisions: md.decisions.map((d) => [d.barrier, d.fixture, d.team, d.reason, d.from, d.to]), contexts: Object.fromEntries([...md.shard.matches.entries()].filter(([id, e]) => e.m && !md.results[id]).map(([id, e]) => [id, e.m.contextLog])) });
const ret = { schema: 'beM-sim04d-matchday/1', routes: {}, notes: [] };

// A · completo por barreras comunes
const a = make(); a.runUntil(ORDER_AT); const ordA = orders(a); a.runToEnd(); ret.routes.A = { ordersAtT: ORDER_AT, accepted: ordA.accepted.ok, rejected: ordA.rejected.rejected === true && ordA.rejected.code, barriers: a.barrier, done: a.done };
// B · pausas, consultas y avance por cuartos con el mismo calendario
const b = make(); for (const T of [120, 240, 360, 480, 600]) { b.runUntil(T); b.pause(); const before = canonical(b.view()); b.step(); if (canonical(b.view()) !== before) ret.notes.push('la pausa publicó algo'); b.resume(); b.view(); b.result('F2', { audience: 'public' }); }
const ordB = orders(b); for (const T of [1200, 1800, 2400, 3600]) { b.runUntil(T); b.view(); b.rank('SEN-A', 'EQ03'); } b.runToEnd(); ret.routes.B = { accepted: ordB.accepted.ok, rejected: ordB.rejected.rejected === true && ordB.rejected.code, barriers: b.barrier, done: b.done };
// C · guardar cuando ya terminó uno, recargar de verdad y continuar
const c0 = make(); c0.runUntil(ORDER_AT); const ordC = orders(c0); let guard = 0; while (!c0.done && !Object.keys(c0.results).length && guard++ < 100) c0.step(); const finishedAtSave = Object.keys(c0.results); const activeAtSave = c0.ids.filter((id) => !c0.results[id]);
const wire = JSON.stringify(c0.snapshot()); const c = Matchday.restore(JSON.parse(wire), { profile }); c.runToEnd(); ret.routes.C = { accepted: ordC.accepted.ok, rejected: ordC.rejected.rejected === true && ordC.rejected.code, savedAtT: c0.T, finishedAtSave, activeAtSave, snapshotBytes: wire.length, barriers: c.barrier, done: c.done };
// D · cierre diferido (04B §9.2 C): marcador y clasificación provisional publicados antes de sellar; consulta del esencial antes del sellado; guardado con sellado pendiente; recarga real; sellado cediendo el control
const d0 = make({ deferClose: true }); d0.runUntil(ORDER_AT); const ordD = orders(d0); d0.runToEnd(); const pendingAtEnd = [...d0.pendingSeal].sort(); const provisionalBeforeSeal = d0.table('SEN-A', 'provisional').rows.map((r) => [r.team, r.w, r.l, r.pf, r.pa]); const finalBeforeSeal = d0.table('SEN-A', 'final').rows.reduce((n, r) => n + r.played, 0);
const consultedBeforeSeal = Object.fromEntries(pendingAtEnd.map((id) => [id, { complete: d0.shard.essential(id).complete, valid: d0.shard.essential(id).validity?.valid }])); const wireD = JSON.stringify(d0.snapshot()); const d = Matchday.restore(JSON.parse(wireD), { profile });
let yields = 0; const sealD = await d.sealPending({ group: 1, yieldFn: async () => { yields++; await new Promise((r) => setTimeout(r, 0)); } }); const sealD0 = await d0.sealPending({ group: 16 });
ret.routes.D = { accepted: ordD.accepted.ok, rejected: ordD.rejected.rejected === true && ordD.rejected.code, pendingAtEnd, consultedBeforeSeal, snapshotBytes: wireD.length, restoredPending: [...d.pendingSeal].length, sealedAfterReload: sealD.sealed, yieldsAfterReload: yields, sealedOriginal: sealD0.sealed, provisionalBeforeSeal, finalPlayedBeforeSeal: finalBeforeSeal, barriers: d.barrier, done: d.done, sealedAll: d.sealedAll };
const dA = digest(a); const dB = digest(b); const dC = digest(c); const dD = digest(d); const dD0 = digest(d0); const eq = (x, y) => Object.fromEntries(Object.keys(x).map((k) => [k, canonical(x[k]) === canonical(y[k])]));
ret.comparison = { A_vs_B: eq(dA, dB), A_vs_C: eq(dA, dC), A_vs_D_recargado: eq(dA, dD), A_vs_D_sin_recargar: eq(dA, dD0) }; ret.allEqual = Object.values(ret.comparison).every((x) => Object.values(x).every(Boolean));
ret.captureWithFinishedAndActive = { barrier: c0.barrier, T: c0.T, finished: finishedAtSave, active: activeAtSave, ok: finishedAtSave.length >= 1 && activeAtSave.length >= 1 };
ret.final = { results: dA.results, decisions: dA.decisions.length, tables: dA.table };
// necesidad clasificatoria distinta (ADICIONAL, dos jornadas más): el objetivo (puesto 1 de SEN-A) lo declara el equipo que PIERDE en F3 según el recorrido A; en una jornada su tabla de partida lo deja fuera (necesidad no cumplida),
// en la otra ya es primero con holgura (cumplida). Misma entrada deportiva; solo cambia la noticia clasificatoria.
const f3 = a.results.F3.essential.score.final; const f3teams = sc.fixtures.find((f) => f.id === 'F3').input.teams.map((t) => t.id); const loser = f3[0] < f3[1] ? f3teams[0] : f3teams[1];
const objs = [{ team: loser, competition: 'SEN-A', kind: 'rank', target: 1 }]; const alt = deep(sc.standings0); alt['SEN-A'].rows = alt['SEN-A'].rows.map((r) => (r.team === loser ? { ...r, w: 12, l: 0, pf: 1000, pa: 700 } : r));
const needRun = (st) => { const md = make({ standings0: st }); md.objectives = objs; md.runUntil(ORDER_AT); orders(md); md.runToEnd(); return md; };
const n1 = needRun(sc.standings0); const n2 = needRun(alt); const firstNeed = n1.decisions.find((d) => d.reason === 'necesidad_cierre'); const upto = (md, bar) => canonical(md.log.filter((l) => l.barrier < bar).map((l) => ({ ...l, tables: undefined, needs: undefined })));
ret.otherNeed = { extraRun: '2 jornadas adicionales (8 SIM + 2 detallados), contadas aparte', objective: objs[0], loser, firstNeedBarrier: firstNeed?.barrier ?? null, identicalPrefixBeforeNews: firstNeed ? upto(n1, firstNeed.barrier) === upto(n2, firstNeed.barrier) : null, futureDiffers: canonical(n1.decisions) !== canonical(n2.decisions), decisionsWithNeed: n1.decisions.filter((d) => d.reason === 'necesidad_cierre').length, decisionsWithNeedOtherNews: n2.decisions.filter((d) => d.reason === 'necesidad_cierre').length, note: 'una necesidad clasificatoria distinta es otra entrada contextual y puede cambiar el futuro; el prefijo hasta la noticia es idéntico' };
writeFileSync(join(OUT, 'jornada-mixta.json'), JSON.stringify(ret, null, 1)); console.log(JSON.stringify({ allEqual: ret.allEqual, comparison: ret.comparison, capture: ret.captureWithFinishedAndActive, routes: ret.routes, otherNeed: ret.otherNeed, notes: ret.notes }, null, 1));
