// MOTOR-18 (auditor): R17B-SENS-01 (dependencias compartidas de una operación) y AUD11 (alternativa acreditada frente a discrepancia sin explicar). Pruebas puras: sin partidos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { consumerOutput } from '../src/audit/consumers.js';
import { recipeChange, dependentChanges, sensitivity } from '../src/audit/analysis.js';
import { projectAttempt, PROJECTION_VERSION } from '../src/audit/project.js';
import { classifyDefOrg } from '../src/audit/aud11.js';
import { EVALUATORS } from '../src/audit/evaluators.js';
import { categoryResolution } from '../src/match/formulas.js';

const { profile } = data;

// Caso del encargo (R17B-SENS-01-FIS07): FIS07 de EQ11-J01 alimenta A y prep del mismo tiro. El auditor anterior solo cambiaba una de las dos.
const CASE = { neutralAbility: 16, shot: { p0: 0.39, sA: 0.07, sD: 0.035 }, fixed: { A: 12.3551968125, D: 16.136040709615383, K: 0.23989926637931033, Z: 0.37887170950499643, alpha: 0.2, prep: 11.155196812499998 }, movementMaximumLogitCost: 0.4,
  expected: { baseProbability: 0.4144452772803625, partialAfterOnlyPrep: 0.4165557852725335, completeAfter: 0.4219287569484819 }, tol: 1e-8 };
const synthetic = () => ({ ...profile, neutralAbility: CASE.neutralAbility, shotPreparation: { ...profile.shotPreparation, movementMaximumLogitCost: CASE.movementMaximumLogitCost }, shots: { ...profile.shots, z: CASE.shot } });
const shotOp = (refKey) => ({ op: 'salida:tiro', refKey, peso: 1, note: { zona: 'z', entradas: { A: CASE.fixed.A, D: CASE.fixed.D, K: CASE.fixed.K, Z: CASE.fixed.Z, alpha: CASE.fixed.alpha, prep: CASE.fixed.prep }, salida: { p: CASE.expected.baseProbability } } });

test('R17B-SENS-01: el tiro recalcula A y prep a la vez (el cambio parcial del auditor anterior no basta)', () => {
  const P = synthetic();
  const partial = consumerOutput(shotOp('prep'), P, { delta: 0.6, player: 'EQ11-J01', valor: CASE.fixed.prep });
  assert.ok(Math.abs(partial.antes - CASE.expected.baseProbability) < CASE.tol);
  assert.ok(Math.abs(partial.despues - CASE.expected.partialAfterOnlyPrep) < CASE.tol);
  const complete = consumerOutput(shotOp('prep'), P, { delta: 0.6, player: 'EQ11-J01', valor: CASE.fixed.prep, deps: [{ refKey: 'A', label: 'receta:TAR11.attack', peso: 1, delta: 0.3 }] });
  assert.ok(Math.abs(complete.despues - CASE.expected.completeAfter) < CASE.tol);
  assert.notEqual(partial.despues.toFixed(6), complete.despues.toFixed(6)); // con el auditor anterior (sin deps) este cálculo daba el parcial
  assert.deepEqual(complete.dependenciasAplicadas.map((d) => d.refKey), ['A']);
  // el mismo incremento no se suma dos veces: la dependencia repetida y la que coincide con la entrada principal se ignoran
  const dup = consumerOutput(shotOp('prep'), P, { delta: 0.6, player: 'EQ11-J01', valor: CASE.fixed.prep, deps: [{ refKey: 'A', label: 'x', peso: 1, delta: 0.3 }, { refKey: 'A', label: 'y', peso: 1, delta: 0.3 }, { refKey: 'prep', label: 'z', peso: 1, delta: 0.6 }] });
  assert.equal(dup.despues, complete.despues);
});

const CONTROL = { exec: 'dribble', off: 14.2, def: 15.1, hasOpposer: true, hasDefend: true, legalDef: 15.5, legalOff: 14.8, pressureFactor: null, fpDelta: null, Z: 0, alpha: 0 };
const ctrlOp = (refKey) => ({ op: 'salida:control', refKey, peso: 1, note: { entradas: CONTROL, salida: Object.fromEntries(Object.entries(categoryResolution(profile, CONTROL).probs)) } });
const ctrlWeights = (spec) => { const r = categoryResolution(profile, spec); return r.final ?? Object.fromEntries(Object.entries(r.w).map(([k, v]) => [k, v / Object.values(r.w).reduce((a, b) => a + b, 0)])); };
for (const [name, main, dep, apply] of [['TEC07 off + legalOff', 'off', 'legalOff', (s, a, b) => ({ ...s, off: s.off + a, legalOff: s.legalOff + b })], ['TEC12/MEN04 def + legalDef', 'def', 'legalDef', (s, a, b) => ({ ...s, def: s.def + a, legalDef: s.legalDef + b })]]) {
  test(`R17B-SENS-01: control con dos entradas (${name}): distribución completa recalculada y normalizada`, () => {
    const out = consumerOutput(ctrlOp(main), profile, { delta: 0.7, player: 'J', valor: 10, deps: [{ refKey: dep, label: 'receta:otra', peso: 1, delta: 0.5 }, { refKey: dep, label: 'receta:repetida', peso: 1, delta: 0.5 }] });
    const expected = ctrlWeights(apply(CONTROL, 0.7, 0.5));
    for (const o of out.opciones) assert.ok(Math.abs(o.despues - Math.round(expected[o.clave] * 1e4) / 1e4) < 1e-9, o.clave); // dist() redondea a 4 decimales
    assert.ok(Math.abs(out.opciones.reduce((s, o) => s + o.despues, 0) - 1) < 5e-4);
    const solo = consumerOutput(ctrlOp(main), profile, { delta: 0.7, player: 'J', valor: 10 });
    assert.notEqual(out.despues, solo.despues);
  });
}

test('R17B-SENS-01: saturación 30 e incremento efectivo 0 dan cambio exactamente cero, también en las dependencias', () => {
  const term = (cap, jugador, base) => ({ cap, jugador, rol: 'r', base, efectiva: base, energia: 100, peso: 1 });
  const ctx = { base: 30, eff: 30, energia: 100, taskMax: 0.2, topeRegistrado: true, valor: 30, player: 'P', terminos: [term('FIS07', 'P', 30)] };
  const ch = recipeChange(ctx, 'FIS07', 3, profile);
  assert.equal(ch.effectiveInc, 0); assert.equal(ch.delta, 0);
  const op = { deps: [{ refKey: 'A', label: 'receta:otra', peso: 1, ...ctx }] };
  assert.deepEqual(dependentChanges(op, 'FIS07', 3, profile).map((d) => d.delta), [0]);
  // todos los términos del mismo jugador y capacidad de la receta cambian (el incremento es de la capacidad, no del rol)
  const two = recipeChange({ ...ctx, base: 10, eff: 10, valor: 10, terminos: [{ ...term('FIS07', 'P', 10), peso: 0.5 }, { ...term('FIS07', 'P', 10), rol: 'otro', peso: 0.5 }] }, 'FIS07', 3, profile);
  assert.ok(two.delta > 0 && Math.abs(two.delta - (two.effAfter - two.effBefore)) < 1e-12);
});

// Proyección sintética: una capacidad del mismo jugador alimenta dos recetas de la misma operación ⇒ la operación conserva la receta hermana (`deps`).
test('R17B-SENS-01: la proyección enlaza las recetas hermanas del mismo jugador y capacidad (deps) y la sensibilidad las usa', () => {
  const L = (o) => `${JSON.stringify(o)}\n`; const ev = 'E0001';
  const term = (peso) => ({ cap: 'FIS07', jugador: 'EQ11-J01', rol: 'actor', base: 12, efectiva: 12, energia: 100, peso, tope: 0.2 });
  const rec = (label, valor) => L({ record_type: 'calculo', kind: 'receta', label, event_id: ev, decision_id: `D-${label}`, data: { valor, terminos: [term(1)] } });
  const note = { zona: 'three', entradas: { A: 12, D: 14, K: 0.1, Z: 0, alpha: 0.2, prep: 12 }, salida: { p: 0.3 }, refs: { A: { label: 'receta:TAR03.attack', jugador: 'EQ11-J01', peso: 1 }, prep: { label: 'receta:TAR11.attack', jugador: 'EQ11-J01', peso: 1 } } };
  const dec = Buffer.from(rec('receta:TAR03.attack', 12) + rec('receta:TAR11.attack', 12) + L({ record_type: 'calculo', kind: 'salida', label: 'salida:tiro', event_id: ev, decision_id: 'D-s', data: note }));
  const src = { stream: (a, n) => (n === 'decisiones' ? dec : null), table: () => null };
  const P = projectAttempt(src, { match_id: 'M1', attempt_id: 'M1-A1', level: 'diagnostic', valid: true, facts: {} }, profile, { sourceId: 'S' });
  assert.equal(PROJECTION_VERSION, 'PRJ-MOTOR18-R1');
  const all = Object.values(P.recipes.contexts.FIS07).flat(); assert.ok(all.length >= 2);
  const withDeps = all.filter((c) => c.ops?.some((o) => o.deps?.length === 1));
  assert.equal(withDeps.length, all.length); // cada contexto retiene la receta hermana
  for (const c of withDeps) { const o = c.ops.find((x) => x.deps); assert.notEqual(o.deps[0].label, c.label); assert.doesNotThrow(() => JSON.stringify(c)); } // sin referencias circulares: la proyección se cachea
  const rows = sensitivity({ FIS07: [withDeps.find((c) => c.label === 'receta:TAR11.attack')] }, profile, [3]);
  assert.equal(rows[0].dependenciasN, 1); assert.equal(rows[0].dependencias[0].refKey, 'A');
});

// ---------------------------------------------------------------------------------------------------------------- AUD11
const ev = (o) => ({ id: 'E0006', seq: 6, team: 'EQ01', idx: 0, intencion: 'ORG06', efectiva: 'ORG02', alternativa: true, objetivo: null, motivo: 'ningún objetivo designado en pista: alternativa declarada del plan', ...o });
const ctxOf = (o = {}) => ({ orgEv: [ev()], defOrders: [], seqOf: { E0003: 3, E0007: 7 }, ordersSeen: true, planOf: () => ({ fallbackOrg: 'ORG02' }), defaultFallback: 'ORG02', ...o });
const shot = (o = {}) => ({ event_id: 'E0009', sequence: 9, team_instance_id: 'EQ11', def_org_intended: 'ORG06', def_org_effective: 'ORG02', ...o });
const ord = (o) => ({ id: 'O1', team: 0, state: 'consumida', defense: 'ORG06', fallback: undefined, lastEvent: 'E0003', step: 1, ...o });
for (const [name, ctx, sh, clase] of [
  ['alternativa configurada, activación causal y organización efectiva coinciden', ctxOf(), shot(), 'alternativa_acreditada'],
  ['la etiqueta de alternativa sola no basta si la configurada vigente es otra', ctxOf({ planOf: () => ({ fallbackOrg: 'ORG03' }) }), shot(), 'sin_explicacion'],
  ['sin plan conservado: no clasificable (no se declara conforme)', ctxOf({ planOf: () => null }), shot(), 'no_clasificable'],
  ['hecho causal que no es la organización efectiva del tiro', ctxOf({ orgEv: [ev({ efectiva: 'ORG03' })] }), shot(), 'sin_explicacion'],
  ['orden aplicada entre el hecho y el tiro explica el cambio de intención', ctxOf({ orgEv: [ev({ alternativa: false, intencion: 'ORG01', efectiva: 'ORG01' })], defOrders: [ord({ lastEvent: 'E0007' })] }), shot({ def_org_effective: 'ORG01' }), 'orden_aplicada_acreditada'],
  ['una orden pendiente o rechazada no explica un cambio anticipado', ctxOf({ orgEv: [ev({ alternativa: false, intencion: 'ORG01', efectiva: 'ORG01' })], defOrders: [ord({ state: 'pendiente', lastEvent: null }), ord({ id: 'O2', state: 'rechazada', lastEvent: null })] }), shot({ def_org_effective: 'ORG01' }), 'sin_explicacion'],
]) test(`AUD11: ${name}`, () => assert.equal(classifyDefOrg(sh, ctx).clase, clase));

test('AUD11: el evaluador cuenta todas las discrepancias y una discrepancia real sigue dando señal', () => {
  const proj = (clases, mismatch) => ({ level: 'diagnostic', match_id: 'M', shots: { defOrg: { n: 10, mismatch, effective: { ORG02: mismatch }, clases, motivos: {}, ejemplos: {} } } });
  const run = (...p) => EVALUATORS.AUD11({ projs: p });
  const ok = run(proj({ alternativa_acreditada: 4 }, 4)); assert.equal(ok.resultado, 'conforme'); assert.equal(ok.metrics.desajustes, 4); assert.equal(ok.metrics.clasificacion.alternativa_reglada_acreditada, 4);
  const bad = run(proj({ alternativa_acreditada: 4, sin_explicacion: 1 }, 5)); assert.equal(bad.resultado, 'señal'); assert.equal(bad.metrics.desajustes, 5); assert.equal(bad.findings.length, 1);
  assert.equal(run(proj({ no_clasificable: 2 }, 2)).resultado, 'señal');
  assert.equal(run(proj({}, 3)).resultado, 'señal'); // proyección anterior sin clasificar: no se pierde la señal
});
