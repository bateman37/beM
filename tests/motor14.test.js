// MOTOR-14: cierre funcional, continuación y contrato. Siete grupos de riesgo (no un test por tabla, ficha o capacidad); los partidos completos se reutilizan entre grupos.
//  1 · instrumentación de las siete capacidades: neutral (trayectoria y sorteos intactos), con receta registrada, contraste sobre las operaciones puras y sin degradar el reducido.
//  2 · guardado/continuación: mismo futuro (hechos, sorteos, órdenes pendientes, estados y huella) desde fronteras distintas, con la cola de órdenes de un guion.
//  3 · almacén de guardados: escritura atómica confirmada, copia alterada/incompatible/incompleta rechazada sin tocarla y sin duplicados.
//  4 · equivalencia: modalidades, velocidades y niveles de registro con las mismas entradas; entradas distintas = incompatible; informe de AUD29 leído, no simulado.
//  5 · contrato para el manager y aislamiento: sin navegador, autoridad de órdenes, dos encuentros alternados independientes.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { data, inputFor, newMatch, FakeScheduler } from './helpers.js';
import { createMatch, buildResult } from '../src/match/index.js';
import { MatchSession } from '../src/match/session.js';
import { snapshotMatch, restoreMatch, validateSnapshot, graphEncode, graphDecode, SNAPSHOT_SCHEMA } from '../src/match/snapshot.js';
import { driveMatch, runScripted, compareRuns } from '../src/match/equivalence.js';
import { SaveStore } from '../src/match/savestore.js';
import { SaveService } from '../src/match/saves-api.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';
import { createEncounter, restoreEncounter, validateEntries, readHistory } from '../src/engine/index.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor } from '../src/batch/executors.js';
import { experimentCatalog, experimentSpec } from '../src/audit/experiments.js';
import { runAudit } from '../src/audit/index.js';
import { EQUIVALENCE_SCHEMA, sealReport, verifyReport, evaluateEquivalence } from '../src/audit/equivalence.js';
import { EVALUATORS } from '../src/audit/evaluators.js';
import { ENGINE_VERSION } from '../src/match/data.js';

const { profile, players } = data; const REF = 20261016;
const baseline = JSON.parse(readFileSync(new URL('./fixtures/baseline-motor13.json', import.meta.url), 'utf8'))[String(REF)];
const root = mkdtempSync(join(tmpdir(), 'bem-m14-'));
const SCRIPT = [
  { period: 1, label: 'guion P1', specs: [{ team: 0, type: 'styles', styles: { freedom: 5, organizedPace: 4 } }] },
  { period: 2, label: 'guion P2', specs: [{ team: 0, type: 'styles', styles: { offensiveRisk: 2 } }, { team: 1, type: 'priorities', priorities: { POS01: 5 } }] },
  { afterStep: 40, spec: { team: 0, type: 'styles', styles: { freedom: 2 } } },
];
let FULL; let REDUCED; let SCRIPTED; let AUD;
before(async () => {
  FULL = newMatch(REF, { detail: 'full' }); while (FULL.step()) { /* una frontera por paso */ } FULL.res = buildResult(FULL);
  REDUCED = newMatch(REF, { detail: 'reduced' }); while (REDUCED.step()) { /* una frontera por paso */ } REDUCED.res = buildResult(REDUCED);
  SCRIPTED = runScripted(inputFor(141006), profile, SCRIPT);
  const store = new JobStore(join(root, 'batches')); const ctl = new BatchController({ store, executor: new InlineExecutor({ store }) });
  const spec = experimentSpec({ ...experimentCatalog(profile, players)[7] }, profile, players, { variants: [{ id: 'V0', label: 'Base' }] });
  const cr = ctl.create(spec, profile, { players, label: 'm14-diag' }); const run = await ctl.run(cr.batchId); await run.done;
  AUD = runAudit([{ kind: 'lote', id: cr.batchId, root: store.root }], { profile, auditRoot: join(root, 'audit'), equivalence: [] });
});
after(() => { rmSync(root, { recursive: true, force: true }); });

const gz = (o) => JSON.parse(JSON.stringify(o));

// ------------------------------------------------------------------------------------------------------------------------------ 1
test('1 · las siete capacidades se registran sin cambiar el deporte y su contraste usa las operaciones puras', () => {
  // neutralidad: referencia 83–103, 6 505 sorteos y MISMA huella de trayectoria con registro completo y reducido
  for (const m of [FULL, REDUCED]) { assert.deepEqual(m.res.score, baseline.score); assert.equal(m.rng.count, baseline.draws); assert.equal(trajectoryFingerprint(m.res), baseline.trajectorySha256); }
  // el reducido no construye el material diagnóstico (no hay recetas ni cálculos)
  assert.ok(REDUCED.res.events.every((e) => e.calc === undefined));
  const labels = new Set(); for (const e of FULL.res.events) for (const c of e.calc ?? []) if (c.label.startsWith('receta:')) labels.add(c.label.replace(/^(receta:[a-z_.]+).*$/, '$1'));
  for (const l of ['receta:rebote.fuerza', 'receta:rebote.captura', 'receta:seleccion.lectura', 'receta:lectura_defensiva', 'receta:presion.perdida', 'receta:momento.consistencia', 'receta:gasto_resistencia']) assert.ok(labels.has(l), `falta ${l}`);
  // matriz: ninguna de las siete queda «consumida sin receta registrada» y la auditoría lo reconoce
  const aud05 = AUD.runs.find((r) => r.id === 'AUD05'); assert.deepEqual(aud05.metrics.consumidasSinRecetaRegistrada, []);
  for (const cap of ['TEC17', 'TEC18', 'MEN02', 'MEN03', 'MEN06', 'MEN07', 'FIS06']) assert.ok(AUD.matrix.filter((r) => r.cap === cap).some((r) => r.usos > 0), `${cap} sin usos registrados`);
  // contraste B: salida derivada coherente (más Resistencia → menos gasto; más Consistencia → menos amplitud; más MEN07 → menos pérdida; más MEN02 → no baja q) con límites respetados
  const rows = AUD.sensitivity.filter((r) => r.salida && !r.limite && r.incrementoEfectivo > 0);
  const delta = (cap, label) => rows.filter((r) => r.cap === cap && r.label.startsWith(label) && r.incrementoSolicitado === 5).map((r) => r.salidaDelta);
  assert.ok(delta('FIS06', 'receta:gasto_resistencia').length && delta('FIS06', 'receta:gasto_resistencia').every((d) => d <= 0));
  assert.ok(delta('MEN06', 'receta:momento.consistencia').every((d) => d < 0));
  assert.ok(delta('MEN07', 'receta:presion.perdida').every((d) => d <= 0));
  assert.ok(delta('MEN02', 'receta:seleccion.lectura').length && delta('MEN02', 'receta:seleccion.lectura').every((d) => d >= 0));
  assert.ok(rows.every((r) => r.salidaUnidad), 'cada salida declara su unidad (no se confunde con una probabilidad de acierto)');
  const withChoice = rows.find((r) => r.label === 'receta:seleccion.lectura' && r.opcionesAntes); assert.ok(withChoice && typeof withChoice.cambiaOpcionMasProbable === 'boolean', 'Visión/Decisiones informan del cambio de opciones y elección');
});

// ------------------------------------------------------------------------------------------------------------------------------ 2
test('2 · continuar un guardado produce el mismo futuro (hechos, sorteos, órdenes, estados, acta y trayectoria) desde fronteras distintas', () => {
  const ref = SCRIPTED.res;
  assert.ok(ref.orders.length > 3 && ref.orders.some((o) => o.state === 'vigente'));
  for (const cut of [40, 120, 215]) { // paso 40 = orden registrada en su frontera; 120 = orden vigente; 215 = frontera de periodo con órdenes pendientes
    const m = createMatch(inputFor(141006), profile, { detail: 'full' }); const done = new Set(); driveMatch(m, SCRIPT, { done, stopAfterSteps: cut });
    const snap = gz(snapshotMatch(m)); assert.equal(snap.schema, SNAPSHOT_SCHEMA); assert.ok(validateSnapshot(snap).ok);
    const tail = restoreMatch(snap); driveMatch(tail, SCRIPT, { done: new Set(done) });
    const cmp = compareRuns(ref, buildResult(tail)); assert.ok(cmp.compatible && cmp.equal, `corte ${cut}: ${JSON.stringify(cmp.differences)}`);
    assert.equal(tail.rng.count, ref.diagnostics.sportingDraws);
    // guardar no cambia nada: el original que sigue vivo tras guardar termina igual
    if (cut === 120) { driveMatch(m, SCRIPT, { done }); assert.ok(compareRuns(ref, buildResult(m)).equal, 'guardar no altera el encuentro vivo'); }
  }
  // hay estado pendiente real en alguno de los cortes (órdenes con vigencia o frontera de periodo), no solo un partido sin nada pendiente
  const probe = createMatch(inputFor(141006), profile, { detail: 'full' }); driveMatch(probe, SCRIPT, { stopAfterSteps: 215 });
  assert.ok(snapshotMatch(probe).position.pendingOrders.length >= 1);
  // el códec conserva referencias compartidas y rechaza lo no serializable
  const shared = { a: [1] }; const g = graphDecode(JSON.parse(JSON.stringify(graphEncode({ x: shared, y: shared, s: new Set([shared]) })))); assert.equal(g.x, g.y); assert.ok(g.s.has(g.x));
  assert.throws(() => graphEncode({ f: () => 1 }), /no serializable/);
});

// ------------------------------------------------------------------------------------------------------------------------------ 3
test('3 · almacén de guardados: atómico, confirmado, sin duplicar y rechazando sin tocar lo alterado, incompleto o incompatible', () => {
  const store = new SaveStore(join(root, 'saves')); const m = newMatch(REF, { detail: 'reduced' }); for (let i = 0; i < 60; i++) m.step();
  const snap = snapshotMatch(m, { label: 'prueba' });
  const meta = store.save(snap, { label: 'prueba', savedAt: '2026-10-17T00:00:00Z' }); assert.match(meta.id, /^SAVE-[0-9a-f]{12}$/);
  assert.equal(store.save(snap).id, meta.id, 'la misma captura no crea otro guardado'); assert.equal(store.list().filter((x) => x.complete).length, 1);
  const loaded = store.load(meta.id); assert.ok(loaded.ok); const cont = restoreMatch(loaded.snapshot); while (cont.step()) { /* hasta el final */ }
  const direct = newMatch(REF, { detail: 'reduced' }); while (direct.step()) { /* hasta el final */ } assert.equal(trajectoryFingerprint(buildResult(cont)), trajectoryFingerprint(buildResult(direct)));
  // alterada: el SHA-256 confirmado no coincide; el archivo sigue tal cual
  const file = join(root, 'saves', meta.id, 'snapshot.json.gz'); const before = readFileSync(file); const bad = Buffer.from(before); bad[bad.length - 20] ^= 0xff; writeFileSync(file, bad);
  const r1 = store.load(meta.id); assert.equal(r1.ok, false); assert.equal(r1.problems[0].code, 'integridad'); assert.deepEqual(readFileSync(file), bad, 'el archivo rechazado no se modifica'); writeFileSync(file, before);
  assert.ok(store.load(meta.id).ok);
  // incompleto: sin la confirmación (meta) no hay guardado
  const dir = join(root, 'saves', 'SAVE-000000000000'); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'snapshot.json.gz'), 'x');
  assert.equal(store.list().find((x) => x.id === 'SAVE-000000000000').complete, false); assert.equal(store.load('SAVE-000000000000').ok, false);
  // validación sin disco: truncado, otro motor, terminado, esquema desconocido; ninguna «actualiza» el motor
  assert.equal(validateSnapshot({ ...snap, state: snap.state.slice(0, -10) }).problems[0].code, 'integridad');
  assert.equal(validateSnapshot({ ...snap, identity: { ...snap.identity, engineVersion: 'beM-motor-0.1.0' } }).problems[0].code, 'motor');
  assert.equal(validateSnapshot({ ...snap, schema: 'otro/1' }).ok, false); assert.equal(validateSnapshot({ ...snap, position: { ...snap.position, status: 'finished' } }).problems.some((p) => p.code === 'terminado'), true);
  assert.throws(() => restoreMatch({ ...snap, rng: { ...snap.rng, count: 1 } }), /guardado no válido/);
  assert.throws(() => store.save({ ...snap, state: 'x' }), /no se guarda/);
  // sin reentrada: no se guarda dentro de una operación
  m.inStep = true; assert.throws(() => snapshotMatch(m), /frontera estable/); m.inStep = false;
  // el servicio HTTP usa el mismo almacén (lista, guarda, descarga)
  const svc = new SaveService({ root: join(root, 'saves') }); assert.equal(svc.store.list().length, store.list().length);
});

// ------------------------------------------------------------------------------------------------------------------------------ 4
test('4 · equivalencia: modalidades, velocidades y registro dan el mismo desarrollo; entradas distintas son incompatibles; AUD29 lee el informe', async () => {
  const input = inputFor(REF); const drive = async (mode, speeds = null) => {
    const sch = new FakeScheduler(); const s = new MatchSession({ input, profile, mode, scheduler: sch }); await s.start();
    if (mode === 'cuartos') while (s.state === 'revision') await s.playNextPeriod();
    if (mode === 'tiempo') { let n = 0; while (s.state !== 'finalizado' && n < 1e6) { if (speeds && n % 120 === 0) s.setSpeed(speeds[(n / 120 | 0) % speeds.length]); if (!sch.runNext()) break; n += 1; if (s.state === 'enPausa' || s.state === 'tiempoMuerto') s.resume(); } }
    return s;
  };
  const cmps = [];
  for (const [mode, fam] of [['total', 'modalidad'], ['cuartos', 'modalidad'], ['tiempo', 'velocidad']]) { const s = await drive(mode, mode === 'tiempo' ? [2, 4, 8, 16] : null); const c = compareRuns(FULL.res, s.result()); assert.ok(c.compatible && c.equal, `${mode}: ${JSON.stringify(c.differences)}`); cmps.push({ ...c, family: fam }); }
  // registro reducido: mismos hechos deportivos (no el diagnóstico)
  assert.equal(trajectoryFingerprint(REDUCED.res), trajectoryFingerprint(FULL.res));
  // entradas distintas: incompatible, no fallo del motor
  const other = compareRuns(FULL.res, SCRIPTED.res); assert.equal(other.compatible, false); assert.match(other.reason, /entradas efectivas distintas/);
  // una diferencia real se localiza (órdenes distintas con las mismas entradas)
  const altered = runScripted(inputFor(REF), profile, [{ afterStep: 30, spec: { team: 0, type: 'styles', styles: { freedom: 5 } } }]).res; const dif = compareRuns(FULL.res, altered); assert.equal(dif.equal, false); assert.ok(dif.differences.length > 0 && dif.differences[0].path);
  // AUD29: sin informe no se evalúa; con comparaciones iguales de todas las familias es conforme; una diferencia es defecto; un informe alterado no cuenta
  assert.equal(EVALUATORS.AUD29({ equivalence: [] }).resultado, 'no_evaluado');
  const fam = (f, equal = true, compatible = true) => ({ label: `c-${f}`, family: f, compatible, equal, differences: equal ? [] : [{ path: 'x' }] });
  const rep = (cs) => sealReport({ schema: EQUIVALENCE_SCHEMA, id: 'EQV-test', comparisons: cs });
  const all = ['modalidad', 'velocidad', 'registro', 'continuacion', 'frontera'].map((f) => fam(f));
  assert.equal(EVALUATORS.AUD29({ equivalence: [rep(all)] }).resultado, 'conforme');
  assert.equal(EVALUATORS.AUD29({ equivalence: [rep(all.slice(0, 2))] }).resultado, 'inconcluso');
  assert.equal(EVALUATORS.AUD29({ equivalence: [rep([...all, fam('modalidad', false)])] }).resultado, 'defecto');
  assert.equal(evaluateEquivalence([rep([fam('modalidad', null, false)])]).incompatible, 1);
  const tam = rep(all); tam.comparisons[0].equal = false; assert.equal(verifyReport(tam).ok, false); const rej = EVALUATORS.AUD29({ equivalence: [tam] }); assert.equal(rej.resultado, 'inconcluso', 'un informe alterado no se acepta como evidencia'); assert.match(rej.note, /integridad/);
  assert.equal(cmps.length, 3);
});

// ------------------------------------------------------------------------------------------------------------------------------ 5
test('5 · contrato para el manager: sin navegador, autoridad sobre las órdenes, resultado consumible y dos encuentros alternados independientes', () => {
  assert.equal(typeof globalThis.document, 'undefined'); assert.equal(typeof globalThis.window, 'undefined');
  const v = validateEntries({ input: inputFor(1), profile }); assert.ok(v.ok && v.profileCoverage.complete);
  const dup = inputFor(1); dup.teams[1].id = dup.teams[0].id; assert.equal(validateEntries({ input: dup, profile }).ok, false);
  const broken = inputFor(1); delete broken.teams[0].players[0].abilities.TEC01; assert.ok(validateEntries({ input: broken, profile }).errors.length > 0, 'no se inventa un dato requerido');
  assert.throws(() => createEncounter({ input: broken, profile }), /entradas no válidas/);
  // autoridad y fronteras
  const e = createEncounter({ input: inputFor(REF), profile, controlledTeams: [0] });
  assert.equal(e.advance({ until: 'possession' }).boundary, 'possession'); assert.equal(e.advance({ until: 'period' }).position.periodBreak, true);
  assert.equal(e.requestOrder({ team: 1, type: 'styles', styles: { freedom: 5 } }).state, 'rechazada');
  assert.ok(['pendiente', 'aceptada'].includes(e.requestOrder({ team: 0, type: 'styles', styles: { freedom: 5 } }).state));
  const own = e.query({ audience: 'own', team: 0 }); const pos0 = JSON.stringify(e.position()); e.query({ audience: 'diagnostic' }); e.query({ audience: 'public' });
  assert.equal(JSON.stringify(e.position()), pos0, 'consultar no tiene efectos deportivos'); assert.ok(own.rival && !JSON.stringify(own.rival).includes('energia'));
  // guardar/restaurar mediante la fachada y resultado
  const e2 = restoreEncounter(e.snapshot(), { controlledTeams: [0] }); e.advance({ until: 'end' }); e2.advance({ until: 'end' });
  const r = e.result(); assert.equal(r.outcome.kind, 'final_normal'); assert.equal(r.fingerprints.trajectory, e2.result().fingerprints.trajectory); assert.notEqual(e.id, e2.id);
  assert.equal(readHistory(r.result, { audience: 'public' }).res.status, 'finished');
  const partial = createEncounter({ input: inputFor(2), profile }); partial.advance({ until: 'period' }); const pr = partial.result(); assert.equal(pr.outcome.kind, 'produccion_parcial'); assert.equal(pr.outcome.definitiveScore, null);
  // aislamiento: A y B alternados paso a paso dan lo mismo que cada uno por separado
  const solo = (seed) => { const x = createEncounter({ input: inputFor(seed), profile, detail: 'reduced' }); x.advance({ until: 'end' }); return x.result().fingerprints.trajectory; };
  const a = createEncounter({ input: inputFor(7), profile, detail: 'reduced' }); const b = createEncounter({ input: inputFor(8), profile, detail: 'reduced' });
  while (!a.done || !b.done) { for (let i = 0; i < 7; i++) if (!a.done) a.advance({ until: 'step' }); for (let i = 0; i < 5; i++) if (!b.done) { b.advance({ until: 'step' }); b.query({ audience: 'diagnostic' }); } }
  assert.equal(a.result().fingerprints.trajectory, solo(7)); assert.equal(b.result().fingerprints.trajectory, solo(8));
  assert.ok(ENGINE_VERSION && existsSync(root) && readdirSync(root).length > 0);
});
