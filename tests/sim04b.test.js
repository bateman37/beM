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
import { canonical } from '../src/sim/fp.js';
import { rotationChecks } from '../scripts/sim04b/rotation-checks.js';

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
