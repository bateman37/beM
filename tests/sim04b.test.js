// SIM-MOTOR-04B · correcciones de cierre, convergencia y rendimiento. Pruebas agrupadas por riesgo (≈ ocho grupos), con entradas fijas y pequeñas. Cada regresión de cierre/fatiga demuestra el fallo del comportamiento anterior por una
// SUSTITUCIÓN ACOTADA dentro de la prueba (no se introduce el fallo en el producto). No son campañas: la evidencia comparativa se genera con `scripts/sim04b`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult, SIM_VERSION, SIM_PROFILE_ID } from '../src/sim/index.js';
import { playAutomatic } from '../src/sim/coachsim.js';
import { ShardRunner } from '../src/sim/shard.js';
import { buildSimEssential } from '../src/sim/essential.js';
import { snapshotSim, validateSimSnapshot } from '../src/sim/snapshot.js';
import { referenceTeamMap } from '../src/sim/teams.js';
import { ATTR_ORDER } from '../src/sim/profile.js';
import { ELC, classifyExit, eligibilityCatalog } from '../src/sim/assist-table.js';
import { assistFunnel } from '../src/sim/exposure.js';
import { severity } from '../src/sim/model.js';
import { Matchday } from '../src/matchday/index.js';
import { buildMixedScenario } from '../src/matchday/scenario.js';
import { rotationChecks } from '../scripts/sim04b/rotation-checks.js';
import * as SEL from '../scripts/sim04b/select.js';
import { caseStatus, sufficiencyOf, expectationOf } from '../scripts/sim04b/sufficiency.js';
import { jsonClone } from '../src/sim/clone.js';
import { canonical, canonicalReference } from '../src/sim/fp.js';
import { observationFor, coachReview } from '../src/sim/coachsim.js';
import { readFileSync as readTxt } from 'node:fs';

const { profile, players } = data; const ctx = makeContext(profile); const S = ctx.sp.v; const T = ctx.T; const teamMap = referenceTeamMap(profile, players);
const env = { profile, players, ctx, teamMap, T, S };
const inputOf = (seed, a = 'EQ03', b = 'EQ04') => buildReferenceInput(profile, players, a, b, { seed });
const deep = (x) => JSON.parse(JSON.stringify(x));
const play = (input, c = ctx) => { const m = new SimMatch(input, c); playAutomatic(m); return m; };
const ctxWith = (rows) => makeContext(profile, rows);

// ---------------------------------------------------------------------------------------------------------------------------------- 1 · fatiga actual en la rotación
test('S04B-01 la rotación decide con la fatiga ACTUAL: relevo con energía 5 (el orden de 04 lo evitaba), referente 30 continúa con energía 30, mejor suplente entra y la recuperación cambia la utilidad en la siguiente revisión', () => {
  const r = rotationChecks(env, ctx);
  assert.equal(r.freshSeverity, true, 'camino real (step): titular con energía 5 y todas las capacidades a 20 frente a suplente 16 con energía 100 → relevo (utilidad 15,875 frente a 16)');
  assert.equal(r.staleSeverityEmulation, true, 'control: con el orden de 04 (severidad del tramo previo, inicializada a 0) el titular se mantiene (utilidad 20)');
  assert.equal(r.detail.criticalEnergy5.staleFirstDecision.cur.utility, 20); assert.equal(r.detail.criticalEnergy5.firstDecision.cur.utility, 15.875);
  assert.equal(r.superior30, true, 'un referente claramente superior (30) frente a un suplente 12 puede seguir en pista con energía 30 (sin relevo obligatorio por llegar a 30)'); assert.ok(r.detail.superiorAt30.reasons.includes('energia'), 'hubo revisiones por energía y el referente continuó');
  assert.equal(r.relief, true, 'un suplente que resulta mejor (24 frente a 10) entra por energía'); assert.equal(r.recoveryChangesUtility, true, 'tras la recuperación del descanso la utilidad del suplente sube en la revisión siguiente');
  const a = r.detail.recoveryAcrossPeriod; assert.ok(a.after.cand.energy >= a.before.cand.energy + 3.9 && a.after.cand.sev < a.before.cand.sev && a.after.cand.utility > a.before.cand.utility, 'misma capacidad, menos severidad, más utilidad');
  // la política (pesos y umbrales) no se tocó: el gasto no altera ninguna de estas decisiones, solo su velocidad
  for (const cost of [3, 3.5]) { const c = rotationChecks(env, ctxWith([{ path: 'energy.costPerLiveMinute', value: cost }])); assert.equal(c.superior30 && c.relief && c.freshSeverity && c.recoveryChangesUtility, true, `gasto ${cost}`); }
  // la severidad se actualiza UNA vez: al preparar el tramo ya está fresca, y las sondas que llaman a `_prepareSides` directamente siguen recalculándola
  const m = new SimMatch(inputOf(5), ctx); for (const t of m.teams) for (const p of t.players) assert.equal(p.sev, severity(S, p.energy), 'la severidad nace de la energía inicial (en 04 nacía a 0)'); m.teams[0].players[0].energy = 5; m._prepareSides(120); assert.ok(m.teams[0].players[0].sev > 0.8, '_prepareSides sin tramo previo recalcula la severidad');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 2 · consulta, sellado y liberación
const runToFinish = (sr, id) => { let T = 0; for (let g = 0; g < 400; g++) { T += 120; const pk = sr.advanceAll(T, { defer: true }); if (pk.find((p) => p.id === id).finished) return T; } throw new Error('no terminó'); };
const newShard = (seed = 112) => { const sr = new ShardRunner(ctx, { releaseFinished: true }); sr.teamMap = teamMap; sr.add({ id: 'M1', spec: { a: 'EQ01', b: 'EQ02', seed }, start: 0 }); return sr; };
test('S04B-02 cierre idempotente: terminar→sellar→consultar = terminar→consultar→sellar (mismo esencial, estado liberado); el comportamiento anterior dejaba el estado vivo; consulta parcial no definitiva; liberado ⇒ rechazo tipado', () => {
  const a = newShard(); runToFinish(a, 'M1'); const sealA = a.seal(); const essA = a.essential('M1');
  const b = newShard(); runToFinish(b, 'M1'); const consulted = b.essential('M1'); const sealB = b.seal(); const essB = b.essential('M1');
  assert.equal(a.released('M1'), true); assert.equal(b.released('M1'), true, 'consultar antes de sellar ya no deja el estado vivo');
  assert.equal(sealA.sealed, 1); assert.equal(sealB.sealed, 1); assert.equal(sealB.reused, 1, 'el sellado reutiliza el esencial completo ya consultado');
  assert.equal(canonical(essA), canonical(essB), 'mismo esencial en ambos órdenes'); assert.equal(canonical(consulted), canonical(essB)); assert.equal(essB.complete, true); assert.equal(essB.validity.valid, true);
  assert.deepEqual(a.matches.get('M1').final.score, b.matches.get('M1').final.score, 'el paquete público final conserva marcador e instantes'); assert.equal(a.matches.get('M1').final.finished, true);
  // repetir consultas y sellados: sin duplicados ni liberaciones contradictorias
  assert.deepEqual(b.seal(), { sealed: 0, remaining: 0, reused: 0 }); assert.equal(canonical(b.essential('M1')), canonical(essB)); assert.equal(b.released('M1'), true);
  // control: el comportamiento de 04 (la consulta cacheaba el esencial y el sellado saltaba esa entrada) dejaba released() en falso — sustitución acotada dentro de la prueba
  const old = newShard(); runToFinish(old, 'M1'); old.essential = function oldEssential(id) { const e = this.matches.get(id); if (!e.essential) e.essential = buildSimEssential(e.m); return e.essential; };
  old.seal = function oldSeal() { let sealed = 0; for (const id of [...this.matches.keys()].sort()) { const e = this.matches.get(id); if (!e.m || e.essential) continue; const p = e.m.syncPub(); if (!p.ended) continue; e.essential = buildSimEssential(e.m); e.final = e.finPacket; e.m = null; sealed++; } return { sealed, remaining: 0 }; };
  old.essential('M1'); assert.equal(old.seal().sealed, 0); assert.equal(old.released('M1'), false, 'control: así quedaba en 04 (cero sellados, estado y eventos retenidos)');
  // consulta de un partido EN CURSO: vista parcial identificada, nunca cacheada como definitiva
  const live = newShard(7); live.advanceAll(300, { defer: true }); const part = live.essential('M1'); assert.equal(part.complete, false); assert.equal(live.matches.get('M1').essential, null, 'el parcial no se guarda como esencial definitivo');
  assert.deepEqual(live.seal(), { sealed: 0, remaining: 0, reused: 0 }, 'un encuentro en curso no se sella'); runToFinish(live, 'M1'); live.essential('M1'); assert.equal(live.seal().sealed, 1); assert.equal(live.essential('M1').complete, true);
  // liberado: rechazo tipado (no un error de nulos) y el resultado final sigue disponible
  const snap = b.snapshot('M1'); assert.equal(snap.ok, false); assert.equal(snap.code, 'liberado'); assert.match(snap.reason, /liberado/); assert.equal(b.snapshot('X').code, 'desconocido');
  const res = b.result('M1'); assert.equal(res.conserved, true); assert.equal(res.coverage, 'essential'); assert.equal(canonical(res.essential), canonical(essB));
  // guardar/recuperar ANTES del cierre: el encuentro en curso se guarda y continúa con el mismo resultado final que sin pausa
  const x = newShard(31); x.advanceAll(600, { defer: true }); const snapX = x.snapshot('M1'); assert.equal(validateSimSnapshot(snapX).length, 0); const y = new ShardRunner(ctx, { releaseFinished: true }); y.restore({ id: 'M1', start: 0 }, snapX);
  const z = newShard(31); runToFinish(z, 'M1'); z.seal(); runToFinish(y, 'M1'); y.seal(); assert.equal(canonical(y.essential('M1')), canonical(z.essential('M1')), 'recuperar antes del cierre y continuar = no parar');
  // el orden consulta/sellado no cambia deporte: azar, huella y exposición
  assert.equal(essA.identity.sportFingerprint, essB.identity.sportFingerprint); assert.equal(canonical(essA.exposure), canonical(essB.exposure));
});

// ---------------------------------------------------------------------------------------------------------------------------------- 3 · jornada: publicar antes de sellar
const mixed = buildMixedScenario(profile, players);
const mkDay = (over = {}) => new Matchday({ id: 'J-MIXTA', fixtures: mixed.fixtures, standings0: mixed.standings0, objectives: mixed.objectives, ctx, profile, ...over });
test('S04B-03 jornada con cierre diferido: el marcador y la clasificación provisional se publican ANTES de sellar; el sellado cede el control en grupos; el resultado es el de un cierre inmediato; la final solo cuenta actas selladas; guardar/recuperar con sellado pendiente', async () => {
  const imm = mkDay(); imm.runToEnd(); const def = mkDay({ deferClose: true }); def.runToEnd();
  assert.equal(def.done, true); assert.equal(def.sealedAll, false, 'terminada la jornada pública, los SIM siguen pendientes de sellado'); const simIds = def.ids.filter((id) => def.resolverOf(id) === 'sim'); assert.deepEqual([...def.pendingSeal].sort(), simIds);
  for (const id of simIds) { const p = def.packets.get(id); assert.equal(p.finished, true); assert.equal(p.sealed, false); assert.equal(p.valid, null, 'pendiente de sellado: no se presenta como acta válida'); assert.deepEqual(p.score, imm.packets.get(id).score, 'el marcador publicado ya es el definitivo'); assert.equal(def.results[id], undefined); }
  const prov = def.table('SEN-A', 'provisional'); assert.ok(prov.rows.length > 0); const fin0 = def.table('SEN-A', 'final'); const finImm = imm.table('SEN-A', 'final'); assert.ok(fin0.rows.reduce((s, r) => s + r.played, 0) < finImm.rows.reduce((s, r) => s + r.played, 0), 'la final aún no cuenta las actas pendientes');
  // guardado con sellado pendiente y recuperación real: pendiente se recupera y se sella igual
  const snap = JSON.parse(JSON.stringify(def.snapshot())); assert.equal(snap.deferClose, true); const rec = Matchday.restore(snap, { profile }); assert.deepEqual([...rec.pendingSeal].sort(), simIds); assert.equal(rec.packets.get(simIds[0]).sealed, false);
  // sellado: grupos de uno, cediendo el control (el evento intermedio es observable)
  let yields = 0; const seen = []; const r = await def.sealPending({ group: 1, yieldFn: async () => { yields++; seen.push(def.pendingSeal.size); await Promise.resolve(); } }); assert.equal(r.pending, 0); assert.equal(r.sealed, simIds.length); assert.equal(yields, simIds.length, 'cede el control tras cada grupo'); assert.deepEqual(seen, simIds.map((_, i) => simIds.length - 1 - i), 'estado intermedio visible: 2, 1, 0 pendientes');
  assert.equal(def.sealedAll, true); const rec2 = await rec.sealPending({ group: 16 }); assert.equal(rec2.pending, 0);
  for (const id of def.ids) { assert.equal(canonical(def.results[id].essential), canonical(imm.results[id].essential), `${id}: mismo esencial que con cierre inmediato`); assert.equal(canonical(rec.results[id].essential), canonical(imm.results[id].essential), `${id}: recuperado = ininterrumpido`); }
  const finDef = def.table('SEN-A', 'final'); assert.equal(canonical(finDef.rows), canonical(finImm.rows), 'sellada la jornada, la final coincide con la del cierre inmediato'); for (const id of simIds) assert.equal(def.packets.get(id).sealed, true);
  // sin cierre diferido nada cambia: los paquetes no llevan el campo y el cierre es inmediato
  assert.equal(imm.pendingSeal.size, 0); for (const id of imm.ids) assert.equal('sealed' in imm.packets.get(id), false);
});

// ---------------------------------------------------------------------------------------------------------------------------------- 4 · mezcla y calidad al aro
const compiled = (rows, seed = 3, mod = (i) => i) => { const c = rows ? ctxWith(rows) : ctx; const i = inputOf(seed); mod(i); const m = new SimMatch(i, c); m._prepareSides(120); m._compile(0); return m; };
const cellsOf = (m, k) => m.sides[k].cells;
test('S04B-04 mezcla y calidad al aro: filas neutrales = identidad exacta; el factor se aplica UNA vez por contexto conservando su masa y sin crear salidas; el desplazamiento de calidad solo toca el aro, sin alias entre zonas', () => {
  const neutral = [{ path: 'shotMix.rimWeightFactor', value: 1 }, { path: 'opportunity.simRimQualityLogit', value: 0 }, { path: 'assist.receivedAdvantageP0', value: 0 }];
  const A = compiled(null); const B = compiled(neutral);
  for (const k of [0, 1]) { const ca = cellsOf(A, k); const cb = cellsOf(B, k); assert.equal(ca.length, cb.length); ca.forEach((c, i) => { assert.equal(c.w, cb[i].w, 'peso idéntico'); assert.deepEqual(c.q, cb[i].q, 'calidad idéntica'); }); }
  // factor de aro: con la protección neutral (nivel 3) la masa de cada contexto es exactamente la previa y la razón aro/resto se multiplica por el factor UNA vez
  const neut = (i) => { for (const t of i.teams) t.plan.defStyles.protection = 3; };
  const base = compiled(null, 3, neut); const f = 1.5; const up = compiled([{ path: 'shotMix.rimWeightFactor', value: f }], 3, neut);
  for (const k of [0, 1]) {
    const groups = { organized: (c) => c.kind === 'play', transition: (c) => c.kind === 'trans', spontaneous: (c) => c.kind === 'spont' };
    for (const [name, pred] of Object.entries(groups)) {
      const b = cellsOf(base, k).filter(pred); const u = cellsOf(up, k).filter(pred); const mass = (xs) => xs.reduce((s, c) => s + c.w, 0); const rim = (xs) => xs.filter((c) => c.cell.zone === 'rim').reduce((s, c) => s + c.w, 0);
      assert.ok(Math.abs(mass(b) - mass(u)) < 1e-12, `${name}: la masa del contexto se conserva`); const rb = rim(b); const ru = rim(u); const mb = mass(b);
      if (rb > 0 && rb < mb) assert.ok(Math.abs(ru / (mass(u) - ru) - f * rb / (mb - rb)) < 1e-9, `${name}: razón aro/resto multiplicada exactamente una vez`);
      b.forEach((c, i) => { if (c.w === 0) assert.equal(u[i].w, 0, 'no se crea una salida al aro donde no existía'); });
    }
  }
  // desplazamiento de calidad: solo celdas de aro, objetos de calidad propios (sin alias), el resto idéntico al neutral
  const dq = 0.5; const Q = compiled([{ path: 'opportunity.simRimQualityLogit', value: dq }]);
  for (const k of [0, 1]) {
    const cn = cellsOf(A, k); const cq = cellsOf(Q, k); const byPlay = new Map();
    cq.forEach((c, i) => { if (c.w === 0 && !c.q) return; const rim = c.cell.zone === 'rim';
      if (rim) { assert.ok(c.q.comfortable > cn[i].q.comfortable && c.q.forced < cn[i].q.forced, `el aro mejora su calidad (${c.kind} ${c.cell.playId ?? ''})`); if (c.kind === 'spont') { const logitC = (q) => Math.log(q.comfortable / q.forced); assert.ok(Math.abs((logitC(c.q) - logitC(cn[i].q)) - 2 * dq) < 1e-9, 'espontáneo: el logit comfortable/forced se desplaza exactamente 2·dq (misma fórmula de calidad, una vez)'); } }
      else assert.deepEqual(c.q, cn[i].q, `otras zonas intactas (${c.cell.zone})`);
      const key = `${c.kind}|${c.cell.playId ?? ''}`; const g = byPlay.get(key) ?? byPlay.set(key, []).get(key); g.push(c); });
    for (const g of byPlay.values()) { const rim = g.find((c) => c.cell.zone === 'rim' && c.q); const other = g.find((c) => c.cell.zone !== 'rim' && c.q); if (rim && other) assert.notEqual(rim.q, other.q, 'el objeto de calidad del aro no es el de las demás zonas (sin alias)'); }
  }
  // un objeto compartido no se muta: la calidad de zonas no aro de la candidata coincide con el neutral aunque se compile después
  const again = compiled(null); cellsOf(again, 0).forEach((c, i) => assert.deepEqual(c.q, cellsOf(A, 0)[i].q));
  // validación: rangos autorizados y rechazo con causa
  const bad = (rows) => ctxCheck(rows);
  assert.ok(bad([{ path: 'shotMix.rimWeightFactor', value: 0 }]).some((m) => /factor finito y positivo/.test(m))); assert.ok(bad([{ path: 'opportunity.simRimQualityLogit', value: 0.75 }]).some((m) => /desplazamiento/.test(m)));
  assert.ok(bad([{ path: 'assist.receivedAdvantageP0', value: 1 }]).some((m) => /probabilidad finita/.test(m))); assert.ok(bad([{ path: 'assist.receivedAdvantageP0', value: Number.NaN }]).length); assert.deepEqual(bad(neutral), [], 'neutral válido');
});
import { validateOverrides } from '../src/sim/profile.js';
const ctxCheck = (rows) => validateOverrides(ctx.sp, rows).map((e) => `${e.path}: ${e.message}`);

// ---------------------------------------------------------------------------------------------------------------------------------- 5 · pase final, ventaja y crédito
test('S04B-05 elegibilidad del pase final: tabla derivada del catálogo; sin asistencia inventada; pasador real; recepción acreditada con decisión compacta; transición/espontáneo conservan su productor; putback no hereda', () => {
  const cat = eligibilityCatalog(T); const cls = (id, role, exec) => cat.find((r) => r.play === id && r.role === role && r.exec === exec)?.elc;
  for (const [id, p] of Object.entries(T.plays)) for (const ex of p.exits) { const c = classifyExit(p, ex).cls; if (ex.exec === 'pass') assert.equal(c, ELC.EXPLICIT, `${id}/${ex.role}: pase explícito con origen`); else assert.ok([ELC.NONE, ELC.RECEIVED].includes(c)); }
  assert.deepEqual(cat.filter((r) => r.elc === ELC.RECEIVED).map((r) => `${r.play}/${r.role}`).sort(), ['POS02/short', 'POS03/screener', 'POS04/short'], 'solo las tres salidas cuyo rol de pool recibe según el catálogo');
  assert.equal(cls('POS01', 'handler', 'dribble'), ELC.NONE, 'el portador (director) conduce: sin pase añadido'); assert.equal(cls('POS05', 'hub', 'dribble'), ELC.NONE); assert.equal(cls('POS14', 'handler', 'auto'), ELC.NONE); assert.ok(cat.every((r) => r.basis), 'cada clase lleva su fundamento');
  assert.equal(cat.find((r) => r.context === 'putback').elc, ELC.NONE); assert.ok(cat.find((r) => r.context === 'transition').elc === ELC.TRANSITION && cat.find((r) => r.context === 'spontaneous').elc === ELC.SPONTANEOUS);
  // neutral: con la fila a 0 ninguna salida sin pase explícito admite entrega y el azar es el de 04 (misma huella con la fila explícita a 0)
  const m0 = play(inputOf(9)); const mN = play(inputOf(9), ctxWith([{ path: 'assist.receivedAdvantageP0', value: 0 }])); assert.equal(m0.rng.draws, mN.rng.draws); assert.equal(buildSimResult(m0, { events: false }).sportFingerprint, buildSimResult(mN, { events: false }).sportFingerprint);
  for (const e of m0.events) if (e.ty === 'shot') { if (e.elc === ELC.RECEIVED) assert.fail('sin la fila no hay recepción conservada'); if (e.elc === ELC.RECEIVED_LOST) assert.equal(e.elig, 0); }
  // con la fila activa: la recepción acreditada admite entrega SOLO en esas salidas; el pasador es un participante real, del mismo equipo y distinto del finalizador; una asistencia por finalización; el putback no hereda
  const c9 = ctxWith([{ path: 'assist.receivedAdvantageP0', value: 0.9 }, { path: 'assist.eligibleFinalPassP0', value: 0.9 }]); let received = 0; let lost = 0; let assisted = 0;
  for (const seed of [11, 12, 13, 14, 15, 16]) { const m = play(inputOf(seed, 'EQ01', 'EQ02'), c9); const res = buildSimResult(m, { events: false }); assert.equal(res.reconciliation.checks.find((c) => c.id === 'R26_denominadores_asistencia').ok, true, 'R26');
    const team = (id) => m.teams.findIndex((t) => t.byId[id]); const seenFin = new Set();
    for (const e of m.events) { if (e.ty !== 'shot' && e.ty !== 'shootfoul') continue; const ok = e.ctx === 'putback' ? e.elc === ELC.NONE : true; assert.ok(ok, 'putback sin clase'); if (e.ctx === 'putback') { assert.equal(e.elig, 0); assert.equal(e.passer, null); }
      if (e.elc === ELC.RECEIVED) { received++; assert.equal(e.elig, 1); assert.equal(e.ctx, 'organized'); assert.ok(['POS02', 'POS03', 'POS04'].includes(e.play), 'solo las fichas con recepción acreditada'); }
      if (e.elc === ELC.RECEIVED_LOST) { lost++; assert.equal(e.elig, 0); assert.equal(e.passer, null, 'sin ventaja conservada no hay entrega'); }
      if (e.passer != null) { assisted++; assert.equal(e.elig, 1, 'sin elegibilidad no hay pasador'); const own = e.ty === 'shot' ? e.tm : 1 - e.tm; assert.equal(team(e.passer), own, 'pasador del mismo equipo'); assert.notEqual(e.passer, e.ty === 'shot' ? e.pl : e.victim, 'distinto del finalizador'); }
      if (e.fin != null && e.ty === 'shot') { assert.equal(seenFin.has(e.fin), false, 'una finalización, un tiro de campo'); seenFin.add(e.fin); } }
    const fun = assistFunnel(m.events); for (const k of [0, 1]) { assert.ok(fun[k].received_advantage.eligible <= fun[k].received_advantage.opportunities); assert.equal(fun[k].received_lost.eligible, 0); assert.equal(fun[k].none.eligible, 0); assert.equal(fun[k].none.delivered, 0); } }
  assert.ok(received > 0 && lost > 0 && assisted > 0, `cubre recepción conservada (${received}), perdida (${lost}) y asistencias (${assisted})`);
  // la asistencia no se sortea después de ver el resultado: el pasador existe ANTES de resolver el tiro (también en los fallos)
  const mm = play(inputOf(12, 'EQ01', 'EQ02'), c9); const missedWithPasser = mm.events.filter((e) => e.ty === 'shot' && !e.made && e.passer != null).length; assert.ok(missedWithPasser > 0, 'hay entregas en tiros fallados: el pase no depende del acierto');
  // exposición e identidad: la versión y el perfil de 04B son los nuevos
  assert.equal(SIM_VERSION, '0.3.1-SIMMOTOR04B'); assert.match(SIM_PROFILE_ID, /SEM-SIM04B-20261023$/);
});

// ---------------------------------------------------------------------------------------------------------------------------------- compatibilidad con 04
import { readFileSync } from 'node:fs';
import { restoreSim } from '../src/sim/snapshot.js';
test('S04B-08 compatibilidad: el guardado REAL de 04 (0.3.0-SIMMOTOR04) se rechaza con explicación y sin tocar el archivo; el guardado nuevo continúa exacto; no se activa ninguna candidata al abrir', () => {
  const old = JSON.parse(readFileSync(new URL('./fixtures/sim-snapshot-04.json', import.meta.url), 'utf8')).snap; const before = canonical(old);
  assert.equal(old.simVersion, '0.3.0-SIMMOTOR04'); const errs = validateSimSnapshot(old); assert.ok(errs.some((e) => /SIM-MOTOR-04B cambia el futuro de un partido en curso \(la rotación decide con la fatiga actual/.test(e.message)), 'explicación del rechazo');
  assert.equal(canonical(old), before, 'el archivo original queda intacto'); assert.throws(() => restoreSim(deep(old), ctx), /rechazado/);
  const m = new SimMatch(inputOf(5), ctx); m.advance({ until: 130 }); const snap = snapshotSim(m, { embedContext: false }); assert.equal(snap.simVersion, SIM_VERSION); assert.deepEqual(validateSimSnapshot(snap), []);
  const ctl = new SimMatch(inputOf(5), ctx); ctl.finish(); const r = restoreSim(deep(snap), ctx); r.finish(); assert.equal(r.rng.draws, ctl.rng.draws); assert.equal(buildSimResult(r, { events: false }).sportFingerprint, buildSimResult(ctl, { events: false }).sportFingerprint);
  assert.equal(ctx.sp.index.get('shotMix.rimWeightFactor').value, 1, 'la base conserva las filas nuevas neutrales: nada se activa al abrir'); assert.equal(ctx.sp.index.get('assist.receivedAdvantageP0').value, 0); assert.equal(ctx.sp.index.get('opportunity.simRimQualityLogit').value, 0);
  for (const path of ['shotMix.rimWeightFactor', 'opportunity.simRimQualityLogit', 'assist.receivedAdvantageP0']) { const row = ctx.sp.index.get(path); assert.ok(row.unit && row.effect && row.origin === 'SEM-SIM04B', `${path} declara unidad, origen y efecto`); }
});

// ---------------------------------------------------------------------------------------------------------------------------------- 3b · exposición de contrastes (T03: cero esperado)
test('S04B-03b suficiencia de exposición: el control con cero esperado y denominador es suficiente; el tratamiento exige exposición positiva; no conservado ≠ cero; sin denominador = no evaluado', () => {
  assert.equal(expectationOf('T03', 'V0'), 'zero'); assert.equal(expectationOf('T03', 'V1'), 'positive'); assert.equal(expectationOf('T01', 'V0'), 'positive');
  const t03 = (n0, d0, n1, d1) => ['V0', 'V1'].flatMap((v) => [1, 2].map((o) => ({ case_id: `T03-${v}-O${o}`, factor: 'T03', variant: v, numerator: v === 'V0' ? n0 : n1, denominator: v === 'V0' ? d0 : d1 })));
  // el caso real de 04: cuatro controles normales con cero presión adelantada y cuatro tratamientos con exposición positiva
  const real = sufficiencyOf(t03(0, 900, 410, 900), ['T03'])[0]; assert.match(real.verdict, /^suficiente/); assert.equal(real.ok, 4); assert.deepEqual(real.expectation, { V0: 'zero', V1: 'positive' });
  // la regla anterior (exposición positiva en ambos lados) calificaba esto como insuficiente: se reproduce como control
  const old04 = (rows) => rows.filter((r) => r.numerator > 0).length >= rows.length; assert.equal(old04(t03(0, 900, 410, 900)), false, 'control: la regla de 04 lo calificaba insuficiente');
  assert.equal(caseStatus({ factor: 'T03', variant: 'V0', numerator: 3, denominator: 900 }).status, 'exposicion_inesperada', 'un control que SÍ registra presión es un fallo del contraste');
  assert.equal(caseStatus({ factor: 'T03', variant: 'V0', numerator: 0, denominator: 0 }).status, 'no_evaluado', 'cero sin controles rivales no se puede interpretar');
  assert.equal(caseStatus({ factor: 'T03', variant: 'V0', numerator: null, denominator: 900 }).status, 'no_conservado', 'no instrumentado: null con causa, no un cero');
  assert.equal(caseStatus({ factor: 'T03', variant: 'V1', numerator: 0, denominator: 900 }).status, 'sin_exposicion', 'el tratamiento sin exposición es insuficiente'); assert.match(sufficiencyOf(t03(0, 900, 0, 900), ['T03'])[0].verdict, /^insuficiente/);
  assert.equal(caseStatus({ factor: 'T01', variant: 'V0', numerator: 0, denominator: 100 }).status, 'sin_exposicion', 'los demás factores conservan su expectativa positiva');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 6 · optimizaciones exactas
test('S04B-06 optimizaciones exactas: copia = JSON, canónico = referencia, huella de vista perezosa = inmediata, estructura compartida sin estado ajeno, cachés acotadas, formaciones repetidas sin cambio de resultado', () => {
  // copia por texto vs copia directa: mismos valores y mismas peculiaridades de JSON
  const nasty = { a: 1, b: [1, undefined, () => 1, NaN, -0, Infinity, { c: undefined, d: 'x' }], e: { f: -0, g: Number.NaN, h: null, i: true, j: '😀', k: [] }, l: undefined, m: () => 2, n: 1e21, o: 0.1 + 0.2 };
  assert.equal(canonical(jsonClone(nasty)), canonical(JSON.parse(JSON.stringify(nasty)))); assert.deepEqual(jsonClone(nasty), JSON.parse(JSON.stringify(nasty))); assert.ok(Object.is(jsonClone(-0), 0), '-0 pasa a 0 como en JSON');
  const proto = JSON.parse('{"__proto__": {"x": 1}, "y": 2}'); assert.deepEqual(jsonClone(proto), JSON.parse(JSON.stringify(proto)), 'clave __proto__: camino de texto'); assert.deepEqual(jsonClone({ d: new Date(0), m: new Map([[1, 2]]) }), JSON.parse(JSON.stringify({ d: new Date(0), m: new Map([[1, 2]]) })), 'valores no planos: camino de texto');
  assert.throws(() => jsonClone(undefined)); assert.throws(() => jsonClone({ b: 10n }), TypeError);
  const input = inputOf(5); const c1 = jsonClone(input); assert.deepEqual(c1, JSON.parse(JSON.stringify(input))); assert.notEqual(c1.teams[0].players[0], input.teams[0].players[0], 'copia independiente');
  // el texto canónico no cambió: la implementación rápida produce el de la referencia sobre estructuras de todo tipo
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const gen = (d) => { const r = rnd(); if (d > 3 || r < 0.2) { const t = rnd(); return t < 0.2 ? null : t < 0.4 ? Math.round(rnd() * 1e6) / 1e3 : t < 0.6 ? `s${Math.floor(rnd() * 99)}"\\n` : t < 0.8 ? rnd() < 0.5 : -0; } if (r < 0.6) return Array.from({ length: Math.floor(rnd() * 5) }, () => gen(d + 1)); const o = {}; for (let i = 0; i < Math.floor(rnd() * 6); i++) o[`k${Math.floor(rnd() * 9)}ñ`] = gen(d + 1); return o; };
  for (let i = 0; i < 300; i++) { const x = gen(0); assert.equal(canonical(x), canonicalReference(x)); } assert.equal(canonical(input), canonicalReference(input));
  // huella de la vista del entrenador: perezosa pero idéntica a la inmediata, memoizada, y sigue apareciendo al serializar la vista
  const m = new SimMatch(inputOf(6), ctx); m.advance({ until: 360 }); const v = observationFor(m, 0, 360); assert.equal(typeof v.fingerprint, 'string'); const eager = JSON.parse(JSON.stringify(v)); assert.equal(eager.fingerprint, v.fingerprint); assert.ok(Object.keys(v).includes('fingerprint')); assert.equal(v.fingerprint, v.fingerprint);
  // estructura compilada compartida por (perfil, tablas, libro, disposición) sin compartir el estado mutable del tramo
  const a = new SimMatch(inputOf(7), ctx); const b = new SimMatch(inputOf(7), ctx); a._prepareSides(120); a._compile(0); b._prepareSides(120); b._compile(0); const ca = a.teams[0].plan._c; const cb = b.teams[0].plan._c;
  assert.equal(ca.cells, cb.cells, 'celdas y fichas estáticas compartidas'); assert.notEqual(ca.cellObjs, cb.cellObjs, 'los objetos de tramo son de cada plan'); assert.notEqual(ca.buf.cc, cb.buf.cc); ca.cellObjs[0].w = 123; assert.notEqual(cb.cellObjs[0].w, 123);
  assert.equal(a.norm.canonical, undefined, 'la estructura canónica no se retiene por partido'); assert.ok(typeof a.norm.fingerprint === 'string' && a.norm.canonicalLength > 1000);
  // las cachés de formación y de finalizadores son un detalle de velocidad: un partido que las descarta en CADA tramo llega al mismo resultado
  const ref = new SimMatch(inputOf(8, 'EQ01', 'EQ05'), ctx); playAutomatic(ref); let maxXc = 0;
  const cold = new SimMatch(inputOf(8, 'EQ01', 'EQ05'), ctx); const step = cold.step.bind(cold); cold.step = function () { for (const t of cold.teams) { delete t.plan._c?.fwc; delete t.plan._c?.qpools; for (const s of cold.sides) s.xc?.clear(); } return step(); }; playAutomatic(cold);
  assert.equal(buildSimResult(ref, { events: false }).sportFingerprint, buildSimResult(cold, { events: false }).sportFingerprint); assert.equal(ref.rng.draws, cold.rng.draws); for (const sd of ref.sides) maxXc = Math.max(maxXc, sd.xc?.size ?? 0); assert.ok(maxXc <= 6, `cachés de formación acotadas (${maxXc})`);
  // el mismo partido por una ruta de lectura repetida (consultas y guardado) no cambia: la huella del esencial lean = completa en su intersección
  const e1 = buildSimEssential(ref); const e2 = buildSimEssential(ref); assert.equal(canonical(e1), canonical(e2), 'leer dos veces no cambia nada'); assert.equal(canonical(e1.assistFunnel), canonical(buildSimResult(ref, { events: false }).assistFunnel));
});

// ---------------------------------------------------------------------------------------------------------------------------------- 7 · selector y guardas
const E = (o) => Object.fromEntries(['eP', 'eF', 'eZ', 'e2', 'eR', 'eQ', 'eA'].map((k) => [k, { value: o[k] ?? 0.01, evaluated: true }]));
test('S04B-07 selector: una mejora del objetivo no compensa una guarda incumplida (local o acumulada); empates y mejora < 5 %; no evaluado = se conserva; VAL no entra en la selección', () => {
  const init = E({ eP: 0.06, eF: 0.055, eZ: 0.2, e2: 0.087, eR: 0.058, eQ: 0.1319, eA: 0.1643 }); const prev = { id: 'R04B-N', value: 1, e: init };
  // mejora enorme de eZ pero eA 0,0003 por encima del error inicial (ya fuera de banda): inadmisible por la guarda ACUMULADA, sin compensación
  const z2 = { id: 'Z2', value: 1.5, e: E({ eP: 0.069, eF: 0.044, eZ: 0.113, e2: 0.087, eR: 0.0565, eQ: 0.1306, eA: 0.1646 }) }; const d1 = SEL.chooseStage({ stage: 'Z', prev, cands: [z2], init });
  assert.equal(d1.kept, true); assert.equal(d1.log[0].verdict, 'inadmisible'); assert.deepEqual(d1.log[0].fails.map((f) => f.guard), ['acumulada:eA'], 'la única guarda incumplida es la acumulada de eA');
  const z2ok = { ...z2, e: E({ eP: 0.069, eF: 0.044, eZ: 0.113, e2: 0.087, eR: 0.0565, eQ: 0.1306, eA: 0.1642 }) }; const d2 = SEL.chooseStage({ stage: 'Z', prev, cands: [z2ok], init }); assert.equal(d2.kept, false); assert.equal(d2.chosenId, 'Z2'); assert.ok(d2.relativeReduction > 0.4);
  // guarda LOCAL: eP sube 0,03 sobre el previo (límite max(0,08; previo+0,02) = 0,08)
  const loc = SEL.guards(E({ eP: 0.09 }), E({ eP: 0.06 }), E({ eP: 0.09 })); assert.deepEqual(loc.map((f) => f.guard), ['local:eP']); assert.deepEqual(SEL.guards(E({ eP: 0.079 }), E({ eP: 0.06 }), E({ eP: 0.06 })), [], 'por debajo de la banda 0,08 no hay fallo aunque supere el previo + 0,02');
  assert.deepEqual(SEL.guards(E({ eZ: 0.221 }), E({ eZ: 0.2 }), E({ eZ: 0.2 })).map((f) => f.guard).sort(), ['acumulada:eZ', 'local:eZ'], 'eZ nunca puede superar su valor inicial (acumulada) ni previo + 0,02 (local)');
  // mejora relativa < 5 %: se conserva; objetivo previo 0: se conserva; empate: gana el valor menor; objetivo no evaluado: se conserva
  const mini = { id: 'Z1', value: 1.25, e: E({ eP: 0.06, eF: 0.055, eZ: 0.1999, e2: 0.087, eR: 0.058, eQ: 0.1319, eA: 0.1643 }) }; assert.match(SEL.chooseStage({ stage: 'Z', prev, cands: [mini], init }).reason, /< 5 %/);
  assert.equal(SEL.chooseStage({ stage: 'Z', prev: { ...prev, e: E({ eZ: 0 }) }, cands: [z2ok], init }).kept, true, 'objetivo previo cero');
  const tie1 = { id: 'T1', value: 1.5, e: E({ eP: 0.06, eF: 0.055, eZ: 0.1, e2: 0.087, eR: 0.058, eQ: 0.1319, eA: 0.1643 }) }; const tie2 = { id: 'T2', value: 1.25, e: tie1.e }; assert.equal(SEL.chooseStage({ stage: 'Z', prev, cands: [tie1, tie2], init }).chosenId, 'T2', 'empate: el cambio menor (valor menor)');
  const nul = { ...prev, e: { ...init, eZ: { value: null, evaluated: false, reason: 'denominador nulo' } } }; const dn = SEL.chooseStage({ stage: 'Z', prev: nul, cands: [z2ok], init }); assert.equal(dn.kept, true); assert.equal(dn.evaluated, false);
  assert.equal(SEL.objectiveOf('Q', E({ eR: 0.0322, eQ: 0.0497, e2: 0.0773 })) > 1.9, true, 'Q usa el máximo normalizado: e2/0,04 = 1,93'); assert.equal(SEL.objectiveOf('A', E({ eA: 0.17 })), 0.17);
  // etapa E: 3,5 solo con las tres condiciones; una reducción enorme de la frecuencia de 40 min no compensa una guarda incumplida
  const eprev = { id: 'R04B-N', value: 3, e: init, freq40: 0.583 }; const e1c = { id: 'E1', value: 3.5, e: E({ eP: 0.0668, eF: 0.0375, eZ: 0.1961, e2: 0.0866, eR: 0.0511, eQ: 0.1585, eA: 0.1656 }), freq40: 0, checks: { superior30: true, relief: true } };
  const de = SEL.chooseEnergy({ prev: eprev, cands: [e1c], init }); assert.equal(de.kept, true); assert.equal(de.log[0].cond1_reduccion20, true); assert.equal(de.log[0].cond2_guardas, false); assert.equal(de.log[0].cond3_rotacion, true);
  assert.equal(SEL.chooseEnergy({ prev: eprev, cands: [{ ...e1c, e: init }], init }).kept, false, 'con guardas y rotación superadas sube a 3,5');
  assert.equal(SEL.chooseEnergy({ prev: eprev, cands: [{ ...e1c, e: init, checks: { superior30: true, relief: false } }], init }).kept, true, 'sin los casos de rotación no sube');
  // las reglas se guardan con su hash antes de CAL y VAL no interviene: ninguna función del selector ni del script de CAL lee el bloque de reserva
  assert.match(SEL.rulesHash(), /^[0-9a-f]{64}$/); assert.equal(SEL.RULES.maxAdditionalVectors, 7); assert.equal(SEL.STAGES.reduce((n, st) => n + st.values.length, 0), 7); assert.match(SEL.RULES.valUse, /VAL no elige/);
  const calSrc = readTxt(new URL('../scripts/sim04b/calibrate.js', import.meta.url), 'utf8'); assert.equal(/block\s*===\s*'VAL'|block:\s*'VAL'|'VAL'/.test(calSrc), false, 'el script de selección no menciona la reserva'); assert.match(calSrc, /r\.block !== 'CAL'/, 'solo lee registros CAL');
  const selSrc = readTxt(new URL('../scripts/sim04b/select.js', import.meta.url), 'utf8'); assert.equal(/VAL-|'VAL'/.test(selSrc.replace(/valUse:[^\n]*\n/, '')), false);
});
