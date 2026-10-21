// MOTOR-13: auditorías, sensibilidad y calibración. Nueve grupos pequeños; cada uno protege un riesgo material (un catálogo sin consumidor que parece verde, un lector que cuenta dos veces,
// una fiabilidad sobre la etiqueta equivocada, una sensibilidad que inventa otro simulador, una alerta que invalida un partido, una candidata que se activa sola, una auditoría que altera
// el deporte, un paquete que solo «se abre» y un resultado offline distinto del online). Se REUTILIZAN pocos lotes reales de la campaña (un caso de diagnóstico completo y dos casos
// reducidos que son la regresión del lector); no hay un test por AUD, capacidad, celda ni contexto. Los datos sintéticos de unidad se rotulan como tales.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { applyExtension } from '../src/match/data.js';
import { data } from './helpers.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor } from '../src/batch/executors.js';
import { buildPackage } from '../src/batch/package.js';
import { AUDIT_CATALOG } from '../src/audit/catalog.js';
import { EVALUATORS } from '../src/audit/evaluators.js';
import { CAPABILITY_IDS, reliability, concentration, sensitivity, energyCurve } from '../src/audit/analysis.js';
import { projectAttempt, binOf, BIN_EDGES } from '../src/audit/project.js';
import { runAudit } from '../src/audit/index.js';
import { openSource } from '../src/audit/source.js';
import { REFERENCES } from '../src/audit/references.js';
import { experimentCatalog, experimentSpec, validationCatalog } from '../src/audit/experiments.js';
import { proposeCandidate, stepFor, reviewReliability } from '../src/audit/calibration.js';
import { writeAuditPackage, verifyAuditPackage, auditReport } from '../src/audit/report.js';
import { effectiveAbility } from '../src/match/core.js';
import { reconcileAnalysis } from '../src/analysis/reconcile.js';
import { lineupTable } from '../src/analysis/presence.js';
import { ProfileLibrary, MemoryStorage } from '../src/profiles/library.js';
import { buildRows, indexRows } from '../src/profiles/rows.js';
import { APP_VERSION } from '../src/version.js';
import { checkMotor13 } from '../scripts/check-data.js';
import { deepCopy } from '../src/match/index.js';

const { profile, players } = data; const root = mkdtempSync(join(tmpdir(), 'bem-m13-')); const auditRoot = join(root, 'audit');
const store = new JobStore(join(root, 'batches')); const ctl = new BatchController({ store, executor: new InlineExecutor({ store }) });
const EXPS = experimentCatalog(profile, players); const lots = {};
async function lot(name, exp, { variants = null, level = null } = {}) {
  const spec = experimentSpec({ ...exp, level: level ?? exp.level }, profile, players, { variants }); const cr = ctl.create(spec, profile, { players, label: name }); assert.ok(cr.ok, JSON.stringify(cr.problems));
  const run = await ctl.run(cr.batchId); await run.done; lots[name] = cr.batchId; return cr.batchId;
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const treeHash = (dir) => { const out = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else out.push(`${p.slice(dir.length)}:${sha(readFileSync(p))}`); } }; walk(dir); return sha(out.join('\n')); };
let DIAG; let AUD;
before(async () => {
  // Un caso de diagnóstico completo (EXP13-08, solo la base) y los dos casos reducidos de la regresión del lector (EXP13-05 y EXP13-12).
  await lot('diag', EXPS[7], { variants: [{ id: 'V0', label: 'Base' }] }); await lot('reg05', EXPS[4]); await lot('reg12', EXPS[11]);
  AUD = runAudit([{ kind: 'lote', id: lots.diag, root: store.root }], { profile, auditRoot }); DIAG = AUD;
});
after(() => { closeAll(); rmSync(root, { recursive: true, force: true }); });
function closeAll() { /* los ejecutores en línea no abren recursos */ }

// ------------------------------------------------------------------------------------------------------------------------------ 1
test('1 · catálogo y referencias: 32 familias con evaluador, 32 capacidades, estados sin falso verde y evidencia resoluble', () => {
  assert.equal(AUDIT_CATALOG.length, 32); assert.deepEqual(AUDIT_CATALOG.map((a) => a.id), Array.from({ length: 32 }, (_, i) => `AUD${String(i + 1).padStart(2, '0')}`));
  for (const a of AUDIT_CATALOG) { assert.equal(typeof EVALUATORS[a.id], 'function', `${a.id} sin evaluador`); for (const k of ['question', 'hypothesis', 'type', 'inputs', 'producers', 'references', 'severity', 'interpretation']) assert.ok(a[k] !== undefined, `${a.id}.${k}`); }
  assert.deepEqual(CAPABILITY_IDS, profile.attributeOrder, 'las 32 capacidades coinciden con el diccionario vigente'); assert.equal(new Set(CAPABILITY_IDS).size, 32);
  assert.equal(DIAG.matrix.map((m) => m.cap).filter((c, i, a) => a.indexOf(c) === i).length, 32, 'la matriz tiene exactamente las 32 capacidades');
  // sin diagnóstico completo NO hay verde: AUD04 y AUD17 son inconclusos, no conformes
  const reduced = runAudit([{ kind: 'lote', id: lots.reg05, root: store.root }], { profile, auditRoot, ids: ['AUD04', 'AUD17', 'AUD29'] });
  for (const r of reduced.runs.filter((x) => x.id !== 'AUD29')) assert.equal(r.resultado, 'inconcluso', `${r.id} no puede ser verde sin registro`);
  assert.equal(reduced.runs.find((x) => x.id === 'AUD29').resultado, 'no_evaluado');
  // la ausencia de exposición no es un atributo muerto y los estados de requisito son ejes separados
  const aud05 = DIAG.runs.find((r) => r.id === 'AUD05'); assert.equal(aud05.resultado, aud05.metrics.capacidadesConSalidaExacta === 32 && aud05.metrics.capacidadesObservadasEnCalculos === 32 ? 'conforme' : 'inconcluso', 'MOTOR-17B: el estado se DERIVA de la evidencia (nunca fijo); conforme solo con las 32 observadas y su salida pertinente exacta'); assert.deepEqual(aud05.metrics.observadasSinEntradasDeReceta, [], 'MOTOR-14: con el registro nuevo, las siete capacidades tienen receta registrada (MOTOR-17B: falta de registro separada de falta de exposición)');
  for (const r of DIAG.runs) for (const k of ['impl', 'registro', 'exposicion', 'resultado', 'revision']) assert.ok(r[k], `${r.id}.${k}`);
  // evidencia resoluble: cada hallazgo con partido remite a un attempt existente
  const attempts = new Set(DIAG.matches.map((m) => m.attempt_id)); for (const f of DIAG.findings) for (const e of f.evidence) if (e.attempt_id) assert.ok(attempts.has(e.attempt_id));
  // referencias: ninguna fuente externa lleva números inventados
  for (const r of REFERENCES.filter((x) => x.state === 'candidata')) assert.equal(r.data, null, 'fuente candidata sin datos extraídos');
  assert.equal(AUD.params.contextsPerCapability, 24); assert.deepEqual(AUD.params.sensitivityIncrements, [1, 3, 5]); assert.equal(AUD.sample.diagnostic, 1);
});

// ------------------------------------------------------------------------------------------------------------------------------ 2
test('2 · agregación y universos: regresión AN08 y del lector de quintetos (misma ficha en dos puestos, puntos sin tiempo), datos ausentes y pares incompletos', () => {
  // Los dos lotes reducidos son las entradas que antes dejaban la conciliación analítica en fallo (R0 de la campaña): ahora concilian; el acta no cambió.
  for (const name of ['reg05', 'reg12']) { const s = openSource({ kind: 'lote', id: lots[name], root: store.root }); for (const a of s.attempts()) { assert.equal(a.valid, true, `${name}/${a.match_id} válido`); assert.equal(a.facts.analysis_ok, true); assert.equal(a.facts.reconciliation_ok, true); } }
  // sintético rotulado: dos alineaciones con los mismos cinco jugadores en puestos distintos son UN quinteto (no cuentan dos veces) y una fila con puntos sin tiempo se conserva
  const ids = ['a', 'b', 'c', 'd', 'e']; const ix = { res: { lineups: [{ id: 'L0-1', team: 0, key: ids.join('|') }, { id: 'L0-2', team: 0, key: [...ids].reverse().join('|') }, { id: 'L0-3', team: 0, key: 'a|b|c|d|z' }] }, events: [{ id: 'E1', lineups: ['L0-1', 'L1-1'], durationTenths: 600 }, { id: 'E2', lineups: ['L0-2', 'L1-1'], durationTenths: 300 }, { id: 'E3', lineups: ['L0-3', 'L1-1'], durationTenths: 0 }], teamOf: { a: 0, b: 0, c: 0, d: 0, e: 0, z: 0 }, possessions: [], shots: [], lineupPlayers: { 'L0-1': ids, 'L0-2': [...ids].reverse(), 'L0-3': ['a', 'b', 'c', 'd', 'z'] },
    acta: { presence: { intervals: [1] }, pointEvents: [{ team: 0, pts: 2, kind: 'fg', on: [ids, []] }, { team: 0, pts: 1, kind: 'ft', on: [['a', 'b', 'c', 'd', 'z'], []] }] }, byId: {} };
  const rows = lineupTable(ix, 0).rows; assert.equal(rows.length, 2, 'dos conjuntos distintos'); const q = rows.find((r) => r.lineupIds.length === 2); assert.deepEqual(q.lineupIds.sort(), ['L0-1', 'L0-2']); assert.equal(q.minutes, (600 + 300) / 600); assert.equal(q.ptsFor, 2);
  assert.ok(rows.some((r) => r.key === 'a|b|c|d|z' && r.ptsFor === 1 && r.minutes === 0), 'una fila con puntos y 0 décimas no se descarta');
  // datos ausentes: un intento sin tablas no inventa ceros
  const fake = { stream: () => null, table: () => null }; const P = projectAttempt(fake, { match_id: 'M', attempt_id: 'M-A1', level: 'reduced', valid: true, facts: {} }, profile, {}); assert.equal(P.tables.jugadores, null); assert.equal(P.recipes.terms, 0);
  // tasas ponderadas: la concentración usa Σ (no medias de porcentajes) y exige denominador y partidos
  const mk = (team, fam, n, m) => ({ match_id: m, families: { [team]: { total: n, byFamily: fam } }, finalizers: {} });
  const conc = concentration([mk('T', { a: 30, b: 10 }, 40, 'm1'), mk('T', { a: 35, b: 5 }, 40, 'm2'), mk('T', { a: 35, b: 5 }, 40, 'm3')], AUD.params).families.find((f) => f.family === 'a');
  assert.equal(conc.n, 100); assert.equal(conc.total, 120); assert.ok(Math.abs(conc.share - 100 / 120) < 1e-12); assert.equal(conc.aviso, true);
  const small = concentration([mk('T', { a: 30, b: 0 }, 30, 'm1')], AUD.params).families.find((f) => f.family === 'a'); assert.equal(small.aviso, false); assert.equal(small.suficiente, false, 'muestra insuficiente, no fallo');
});

// ------------------------------------------------------------------------------------------------------------------------------ 3
test('3 · auditor de probabilidad: p consumida, mismo sorteo, intervalos fijos con el 1 incluido, intervalo vacío sin cero y control determinista', () => {
  assert.deepEqual(BIN_EDGES, [0, 0.2, 0.4, 0.6, 0.8, 1]); assert.equal(binOf(0), 0); assert.equal(binOf(0.2), 1); assert.equal(binOf(0.7999), 3); assert.equal(binOf(0.8), 4); assert.equal(binOf(1), 4);
  const rec = (label, p, y, id) => `${JSON.stringify({ record_type: 'calculo', kind: 'binaria', label: `binaria:${label}`, decision_id: id, data: { p, u: 0.5, resultado: y } })}\n`;
  const lines = [rec('x', 0.1, false, 'd1'), rec('x', 0.1, true, 'd2'), rec('x', 0.9, true, 'd3'), rec('x', 1, true, 'd4'), rec('x', 0, true, 'd5'), rec('y', 1, false, 'd6'),
    `${JSON.stringify({ record_type: 'calculo', kind: 'distribucion', label: 'sorteo:cat', decision_id: 'd7', data: { opciones: [{ clave: 'turnover', p: 0.2 }, { clave: 'shot', p: 0.8 }], u: 0.1, elegido: 'turnover' } })}\n`,
    `${JSON.stringify({ record_type: 'calculo', kind: 'distribucion', label: 'sorteo:un_solo', decision_id: 'd8', data: { opciones: [{ clave: 'x', p: 1 }], u: 0.1, elegido: 'x' } })}\n`].join('');
  const src = { stream: (a, n) => (n === 'decisiones' ? Buffer.from(lines) : null), table: () => null }; const P = projectAttempt(src, { match_id: 'M1', attempt_id: 'M1-A1', level: 'diagnostic', valid: true, facts: {} }, profile, {});
  const rel = reliability([P], AUD.params); const x = rel.find((r) => r.mecanismo === 'x' && r.kind === 'binaria'); assert.equal(x.n, 5); assert.equal(x.observados, 4);   assert.ok(Math.abs(x.esperados - 2.1) < 1e-9, 'esperados = Σ p'); assert.ok(Math.abs(x.brier - ((0.1 ** 2 + 0.9 ** 2 + 0.1 ** 2 + 0 + 1) / 5)) < 1e-9, 'Brier = media((y−p)²)');
  assert.equal(x.bins[1].n, 0); assert.equal(x.bins[1].mediaP, null, 'intervalo sin observaciones: ni cero ni interpolación'); assert.equal(x.bins[4].n, 2, 'p=0,9 y p=1 caen en [0,8;1]'); assert.equal(x.muestraEscasa, true);
  assert.equal(x.determinista.bad.length, 1, 'p=0 con resultado positivo es un control determinista (p=1 con y=1 es coherente)'); assert.equal(rel.find((r) => r.mecanismo === 'y').determinista.bad.length, 1, 'p=1 con resultado negativo');
  const cat = rel.find((r) => r.kind === 'distribucion' && r.mecanismo === 'sorteo:cat'); assert.equal(cat.n, 2); assert.equal(cat.observados, 1, 'categorías excluyentes: se lee la distribución completa (una opción elegida)'); assert.ok(!rel.find((r) => r.mecanismo === 'sorteo:un_solo'), 'una distribución de una sola opción no aporta información');
  const review = reviewReliability(rel, AUD.params); assert.ok(review.insufficient.length >= 2 && review.signals.length === 0, 'muestra pequeña: insuficiente, nunca fallo ni señal');
  // en el lote real: probabilidades 0/1 coherentes y ninguna lectura presentada como realismo
  assert.equal(DIAG.reliability.filter((r) => r.determinista.bad.length).length, 0); assert.match(DIAG.runs.find((r) => r.id === 'AUD13').note, /no calibración/);
});

// ------------------------------------------------------------------------------------------------------------------------------ 4
test('4 · sensibilidad: misma operación pura, +1/+3/+5 efectivos, saturación en 30, sin mutar el contexto ni usar RNG', () => {
  // la operación pura reproduce el valor efectivo registrado por el motor en TODAS las recetas verificables del lote real
  const P = readdirSync(join(auditRoot, 'cache')).map((f) => JSON.parse(readFileSync(join(auditRoot, 'cache', f), 'utf8'))).find((x) => x.level === 'diagnostic'); assert.ok(P.recipes.effChecked > 10000); assert.equal(P.recipes.effMismatch, 0, 'effectiveAbility = eff registrado'); assert.equal(P.recipes.valueBad, 0); assert.equal(P.recipes.weightBad, 0);
  assert.equal(effectiveAbility(profile, 20, 100, 'TEC08', 4), 20); assert.ok(effectiveAbility(profile, 20, 10, 'TEC08', 4) < 20 && effectiveAbility(profile, 20, 10, 'FIS02', null) < effectiveAbility(profile, 20, 10, 'TEC08', null), 'FIS usa su tope físico; TEC el técnico');
  const ctx = { cap: 'TEC08', base: 27, eff: 27, energia: 100, taskMax: 4, stratum: 'TAR07.attack|passer', decision_id: 'd', event_id: 'e', label: 'receta:TAR07.attack', player: 'p', rol: 'passer', peso: 0.8, valor: 25.6, terminos: [{ rol: 'passer', jugador: 'p', cap: 'TEC08', base: 27, efectiva: 27, peso: 0.8, energia: 100 }, { rol: 'passer', jugador: 'p', cap: 'MEN03', base: 20, efectiva: 20, peso: 0.2, energia: 100 }] };
  const frozen = deepCopy(ctx); const rows = sensitivity({ TEC08: [ctx] }, profile, [1, 3, 5]); assert.deepEqual(ctx, frozen, 'el contexto no se muta');
  const by = (inc) => rows.find((r) => r.incrementoSolicitado === inc); assert.equal(by(1).incrementoEfectivo, 1); assert.equal(by(3).incrementoEfectivo, 3); assert.equal(by(5).incrementoEfectivo, 3, 'recortado al máximo 30'); assert.match(by(5).saturacion, /recortada/);
  assert.ok(Math.abs(by(3).delta - 0.8 * 3) < 1e-3, 'delta = peso × incremento efectivo (receta lineal)'); assert.match(by(3).unidad, /NO es probabilidad/);
  const sat = sensitivity({ TEC08: [{ ...ctx, base: 30, eff: 30, valor: 28, terminos: [{ ...ctx.terminos[0], base: 30, efectiva: 30 }, ctx.terminos[1]] }] }, profile, [3])[0]; assert.equal(sat.incrementoEfectivo, 0); assert.equal(sat.delta, 0); assert.match(sat.saturacion, /máximo/, 'saturación ≠ desconexión');
  // selección ciega al resultado: determinista y acotada
  const a = DIAG.sensitivity_contexts; const again = runAudit([{ kind: 'lote', id: lots.diag, root: store.root }], { profile, auditRoot }).sensitivity_contexts; assert.deepEqual(a, again); for (const n of Object.values(a)) assert.ok(n <= 24);
  // contexto fijo en el lote real: TEC08 +3 sube el valor de receta exactamente peso·3 (peso 0,8 del pasador)
  const row = DIAG.matrix.find((m) => m.cap === 'TEC08' && /TAR07/.test(m.stratum)); assert.ok(Math.abs(row.contrasteCalculo['+3'].mediaDelta - row.mediaPeso * 3) < 0.01);
});

// ------------------------------------------------------------------------------------------------------------------------------ 5
test('5 · estados: curva de energía sin verde parcial, T nunca como término de receta y protocolo de Consistencia reutilizado', () => {
  // MOTOR-15B: la curva se lee por (ámbito, tarea) con celdas de tamaño suficiente (`reliabilityWarn.minDecisions`); detalle completo en tests/motor15b.test.js (B3)
  const cell = (banda, n, brechaMedia, tarea = 'TAR06.attack') => ({ ambito: 'TEC/MEN', tarea, banda, n, brecha: n * brechaMedia, brechaMedia, relativa: null, minEnergia: banda === '<10' ? 0 : 50, ejemplos: [] });
  const base = [cell('70–100', 200, 0.02), cell('40–70', 200, 0.2)];
  const cur = [{ tipo: 'TEC/MEN', banda: '70–100', n: 200, brechaMedia: 0.02 }, { tipo: 'TEC/MEN', banda: '40–70', n: 200, brechaMedia: 0.2 }]; assert.ok(cur[0].brechaMedia < cur[1].brechaMedia);
  const mk = (extra) => EVALUATORS.AUD17({ projs: [{ level: 'diagnostic', recipes: {} }], energy: cur, energyTask: [...base, ...extra], params: profile.audit, cost: {} }); const partial = mk([]); assert.equal(partial.resultado, 'inconcluso', 'solo 100–40 observado: no es verde'); assert.equal(partial.exposicion, 'insuficiente');
  assert.equal(mk([cell('10–40', 200, 0.5)]).resultado, 'inconcluso', 'sin la banda crítica (<10) tampoco es verde'); assert.equal(mk([cell('10–40', 200, 0.5), cell('<10', 200, 1)]).resultado, 'conforme'); assert.equal(mk([cell('10–40', 200, 0.01)]).resultado, 'señal', 'deterioro que no crece al bajar');
  const t = DIAG.runs.find((r) => r.id === 'AUD22'); assert.equal(t.resultado, 'conforme'); assert.ok(t.metrics.cambiosDeT > 0); assert.equal(DIAG.runs.find((r) => r.id === 'AUD20').resultado, 'conforme', 'sin bonus de edad: solo las 32 capacidades');
  // un término desconocido (T, edad) en una receta ES un defecto determinista
  const bad = EVALUATORS.AUD20({ projs: [{ level: 'diagnostic', recipes: { terms: 10, capsUnknown: { T: 2 } }, match_id: 'm', attempt_id: 'a' }], id: 'AUD20' }); assert.equal(bad.resultado, 'defecto');
  // el protocolo de Consistencia no se repite aquí: la suite de MOTOR-07 lo protege y el auditor lo declara pendiente de evidencia propia
  assert.ok(DIAG.runs.find((r) => r.id === 'AUD21').missing.length > 0);
});

// ------------------------------------------------------------------------------------------------------------------------------ 6
test('6 · alertas: la concentración contextual no invalida un partido, el bucle no confunde libres sin reloj y la duplicidad pide causa', () => {
  // un aviso de concentración existe solo con denominador y presencia; el partido sigue siendo válido
  const s = openSource({ kind: 'lote', id: lots.diag, root: store.root }); assert.equal(s.attempts()[0].valid, true);
  const mkEv = (type, extra = {}) => ({ event_id: `E${Math.random()}`, type, period: 1, team: 0, possession_id: 'P1', clock: { before: 100, after: 100 }, durationTenths: 0, score: [0, 0], intent: { motivo: 'm' }, ...extra });
  const evs = [...Array.from({ length: 12 }, () => mkEv('free_throw')), ...Array.from({ length: 6 }, () => mkEv('reorganization'))].map((e) => `${JSON.stringify(e)}\n`).join('');
  const P = projectAttempt({ stream: (a, n) => (n === 'eventos' ? Buffer.from(evs) : null), table: () => null }, { match_id: 'M', attempt_id: 'M-A1', level: 'reduced', valid: true, facts: {} }, profile, {});
  assert.equal(P.events.loop.maxStreak, 5, 'los libres a 0 décimas NO cuentan como revisitas; 6 reorganizaciones idénticas sin avance de tiempo sí (5 repeticiones tras la primera)'); assert.ok(P.events.loop.maxStreak < AUD.params.loopRevisits, 'por debajo del umbral de 10: ni siquiera señal');
  // la repetición sin progreso es una señal, nunca una orden de cortar la posesión: el evaluador no existe para AUD de tiempo real y el auditor no modifica estado
  const r = EVALUATORS.AUD26({ projs: [{ level: 'diagnostic', match_id: 'm', attempt_id: 'a', saques: { n: 10, clases: { ejecutada: 8, interrumpida_fin_periodo: 2 }, casos: [{ chain: 'S1', clase: 'interrumpida_fin_periodo', ultimaTransicion: { type: 'period_end' } }, { chain: 'S2', clase: 'interrumpida_fin_periodo', ultimaTransicion: { type: 'period_end' } }] } }], id: 'AUD26' }); assert.equal(r.resultado, 'conforme', 'cadena interrumpida por el final de periodo no es un saque sin receptor'); assert.equal(r.findings[0].severity, 'info'); assert.equal(r.metrics.universoDeTasas, 8, 'las interrumpidas salen del universo de las tasas');
  // AUD07: una ficha llamada (prioridad null) no es un error de rango
  const lib = `${JSON.stringify({ record_type: 'calculo', kind: 'libro', label: 'libro:elegibilidad', decision_id: 'd', data: { fichas: [{ ficha: 'POS01', prioridad: 1, elegible: true }, { ficha: 'POS06', prioridad: null, elegible: true }] } })}\n`;
  const PL = projectAttempt({ stream: (a, n) => (n === 'decisiones' ? Buffer.from(lib) : null), table: () => null }, { match_id: 'M', attempt_id: 'M-A1', level: 'diagnostic', valid: true, facts: {} }, profile, {}); assert.equal(PL.libro.badPrio, 0); assert.equal(PL.libro.called, 1);
  // duplicidad: el auditor no declara duplicidad por coincidencia de nombre (no existe un evaluador que la afirme sin causa y punto de consumo)
  for (const run of DIAG.runs) for (const f of run.findings) assert.ok(!/duplic/i.test(f), 'sin hallazgos de duplicidad sin causa');
});

// ------------------------------------------------------------------------------------------------------------------------------ 7
test('7 · candidata: guardar no activa, respeta el presupuesto y los pasos, conserva diff y no toca snapshots ni lotes', () => {
  const lib = new ProfileLibrary({ storage: new MemoryStorage(), base: profile }); const baseId = lib.state.baseId; const active0 = lib.activeVersion().id; const before = treeHash(store.dir(lots.reg05));
  const rows = indexRows(buildRows(profile)).byId; const p0 = rows.get('shots.three.p0'); assert.ok(p0 && p0.editable, 'fila vigente leída del perfil (no los números del anexo)');
  assert.deepEqual(stepFor(p0, AUD.params), { kind: 'absoluto', step: 0.01, unit: 'probabilidad', note: 'p0 binaria: validar rango 0–1' }); assert.equal(stepFor(rows.get('rules.foulOut'), AUD.params), null, 'una magnitud reglamentaria no tiene paso de editor');
  const ok = proposeCandidate(lib, baseId, { hypothesis: 'prueba de flujo: p0 del triple +0,01 (SIN evidencia real; no se activa)', edits: [{ row: 'shots.three.p0', direction: 1 }] }, AUD.params); assert.ok(ok.ok, JSON.stringify(ok));
  assert.equal(ok.detail[0].before + 0.01, ok.detail[0].after); assert.equal(ok.diff.changed.length, 1); assert.equal(ok.activated, false); assert.equal(lib.activeVersion().id, active0, 'la candidata no activa nada'); assert.equal(ok.validation.errors, 0);
  assert.ok(lib.history({ draftId: ok.draftId }).length >= 2, 'motivo, valores anteriores y nuevos se conservan en el historial');
  assert.equal(proposeCandidate(lib, baseId, { hypothesis: 'h', edits: [1, 2, 3, 4].map((i) => ({ row: 'shots.three.p0', direction: 1 })) }, AUD.params).ok, false, 'máximo 3 filas efectivas'); assert.equal(proposeCandidate(lib, baseId, { edits: [{ row: 'shots.three.p0', direction: 1 }] }, AUD.params).ok, false, 'sin hipótesis no hay candidata');
  assert.equal(proposeCandidate(lib, baseId, { hypothesis: 'h', edits: [{ row: 'shots.three.p0', value: 1.5 }] }, AUD.params).ok, false, 'una probabilidad fuera de 0–1 se rechaza'); assert.equal(proposeCandidate(lib, baseId, { hypothesis: 'h', edits: [{ row: 'rules.foulOut', direction: 1 }] }, AUD.params).ok, false);
  assert.equal(treeHash(store.dir(lots.reg05)), before, 'los lotes congelados no se tocan'); assert.equal(createHash('sha256').update(JSON.stringify(profile)).digest('hex'), createHash('sha256').update(JSON.stringify(data.profile)).digest('hex'));
});

// ------------------------------------------------------------------------------------------------------------------------------ 8
test('8 · neutralidad: auditar, recalcular y exportar no cambian el lote, la huella de trayectoria ni los sorteos; el diagnóstico no es público', async () => {
  const dir = store.dir(lots.diag); const before = treeHash(dir); const fp = DIAG.matches[0].trajectory_fp; const draws = DIAG.matches[0].draws;
  const again = runAudit([{ kind: 'lote', id: lots.diag, root: store.root }], { profile, auditRoot: join(root, 'audit2') }); assert.equal(treeHash(dir), before, 'los archivos originales son byte a byte los mismos'); assert.equal(again.matches[0].trajectory_fp, fp); assert.equal(again.matches[0].draws, draws);
  assert.deepEqual(again.runs.map((r) => [r.id, r.resultado, r.findings.length]), DIAG.runs.map((r) => [r.id, r.resultado, r.findings.length]), 'recalcular es determinista (y la segunda lectura sale de la caché sin releer)'); assert.ok(again.cost.projections_ms >= 0);
  const out = join(root, 'pkg.zip'); await writeAuditPackage(again, out, { report: auditReport(again) }); assert.equal(treeHash(dir), before); const v = verifyAuditPackage(out); assert.ok(v.ok, JSON.stringify(v.problems));
  assert.equal(again.integrity.ok, true);
  const s = openSource({ kind: 'lote', id: lots.diag, root: store.root }); assert.ok(s.audiences().every((a) => a === 'diagnostic'), 'registros exactos solo para audiencia diagnóstica'); assert.equal(DIAG.runs.find((r) => r.id === 'AUD28').resultado, 'conforme');
  assert.equal(APP_VERSION, 'MOTOR-17B'); assert.deepEqual(checkMotor13(JSON.parse(readFileSync(new URL('../data/match/motor13-seed-extension.json', import.meta.url), 'utf8')), data.baseProfile, [data.extension, data.extension3, data.extension4, data.extension5, data.extension6, data.extension7, data.extension8, data.extension9, data.extension10, data.extension11, data.extension12], applyExtension(data.baseProfile, data.extension, data.extension3, data.extension4, data.extension5, data.extension6, data.extension7, data.extension8, data.extension9, data.extension10, data.extension11, data.extension12, data.extension13)), []);
  assert.deepEqual(Object.keys(profile.audit).sort(), Object.keys(JSON.parse(readFileSync(new URL('../data/match/motor13-seed-extension.json', import.meta.url), 'utf8')).additions.audit).sort());
});

// ------------------------------------------------------------------------------------------------------------------------------ 9
test('9 · persistencia y paquete: el paquete verifica (y una copia alterada no), y la auditoría offline coincide con la del lote conservado', async () => {
  const out = join(root, 'pkg9.zip'); const w = await writeAuditPackage(DIAG, out, { report: auditReport(DIAG) }); assert.equal(w.manifest.self_contained, false, 'no se anuncia autocontenido: cita su fuente'); assert.ok(verifyAuditPackage(out).ok);
  const bytes = readFileSync(out); const bad = Buffer.from(bytes); bad[Math.floor(bad.length / 2)] ^= 0xff; const badPath = join(root, 'bad.zip'); writeFileSync(badPath, bad); let failed = false; try { failed = !verifyAuditPackage(badPath).ok; } catch { failed = true; } assert.ok(failed, 'una copia alterada no pasa el comprobador');
  // offline: el paquete de análisis de MOTOR-12 del mismo lote da la misma lectura
  const pk = await buildPackage(ctl, lots.diag, { partTargetMiB: 128 }); assert.ok(pk.verified); const zip = pk.packages[0].path ?? join(pk.outDir, pk.packages[0].name);
  const off = runAudit([{ kind: 'paquete', path: zip }], { profile, auditRoot: join(root, 'audit3') }); assert.equal(off.ok, true, off.reason); assert.equal(off.integrity.ok, true);
  const key = (r) => r.runs.filter((x) => ['AUD01', 'AUD02', 'AUD04', 'AUD05', 'AUD17', 'AUD19', 'AUD20', 'AUD22', 'AUD25', 'AUD27'].includes(x.id)).map((x) => [x.id, x.resultado, JSON.stringify(x.metrics, (k, v) => (k === 'source' ? undefined : v))]); // la fuente (lote o paquete) es procedencia, no lectura
  assert.deepEqual(key(off), key(DIAG), 'lote conservado y paquete offline: misma lectura'); assert.equal(off.reliability.length, DIAG.reliability.length);
  assert.equal(validationCatalog(profile).map((v) => v.batchSeed).join(), '132001,132002,132003,132004'); assert.equal(EXPS.map((e) => e.batchSeed).join(), Array.from({ length: 12 }, (_, i) => 131001 + i).join());
});
