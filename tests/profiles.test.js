// MOTOR-03: diccionario, herencia, validación, edición conjunta, persistencia, intercambio y causalidad hacia el motor.
// Pocos casos representativos: protegen riesgos nuevos, no replican cada fila del diccionario (N04/N12).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { data, inputFor, newMatch, demoInputFor, defInputFor, playWithOrders } from './helpers.js';
import { buildRows, uncoveredLeaves, assertProfileComplete, ConfigError, indexRows } from '../src/profiles/rows.js';
import { validateProfile } from '../src/profiles/validate.js';
import { resolveOverrides, diffEffective, bulkPreview, bulkApply, normalizeProposal } from '../src/profiles/model.js';
import { ProfileLibrary, MemoryStorage, STORAGE_KEY } from '../src/profiles/library.js';
import { runComparison } from '../src/profiles/compare.js';
import { contentHash, deepCopy } from '../src/profiles/util.js';
import { shotProbability, pressureLossLogit } from '../src/match/formulas.js';
import { runMatch, createMatch, buildMatchInput } from '../src/match/index.js';
import { sportsProjection } from '../src/match/replay.js';
import { baseEx } from './helpers.js';

const base = data.profile;
const edit = (fn) => { const p = deepCopy(base); fn(p); return p; };
const issueIds = (r) => r.issues.map((i) => `${i.id}|${i.rule}`);

test('inventario: toda hoja del perfil es fila o excepción conocida, sin filas duplicadas ni ausentes', () => {
  const rows = buildRows(base);
  assert.deepEqual(uncoveredLeaves(base, rows), []);
  assert.equal(new Set(rows.map((r) => r.id)).size, rows.length);
  assert.equal(rows.filter((r) => r.missing).length, 0);
  assert.ok(rows.length > 300);
  for (const r of rows) assert.ok(r.label && r.desc && r.effect && r.grp && r.views.length, `ficha incompleta ${r.id}`);
  // los literales convertidos en filas conservan su valor exacto (§4.1)
  const v = (id) => indexRows(rows).byId.get(id).value;
  assert.deepEqual(v('selection.finishingVocationMix'), [0.35, 0.65]);
  assert.equal(v('body.reboundReachReference'), 0.5);
  assert.equal(v('continuation.maxExtraPasses'), 4);
});

test('consumo real: una fila requerida ausente es un error de configuración, no un valor por defecto', () => {
  const p = edit((x) => { delete x.continuation.maxExtraPasses; });
  assert.throws(() => assertProfileComplete(p), (e) => e instanceof ConfigError && e.missing.includes('continuation.maxExtraPasses'));
  assert.throws(() => createMatch(inputFor(1), p), ConfigError);
});

test('el motor consulta de verdad las filas declaradas «consumidas» (salvo las condicionales explicadas) y no las que declara sin mecanismo', () => {
  const rows = buildRows(base);
  // dos encuentros completos: el libro conservado y el plan de demostración (quince fichas), que recorre las tareas de poste y apertura
  const read = (res) => res.events.flatMap((e) => (e.params ?? []).map((i) => res.diagnostics.paramTable[i]));
  const res = runMatch(inputFor(20261016), base, { detail: 'full' });
  // MOTOR-05: configuraciones defensivas que recorren zonas, perseguidor, alturas, las cuatro coberturas y las tres instrucciones especiales
  const foulOrders = [8, 40, 70, 100, 130, 160, 190, 220, 250, 280].map((at, i) => ({ at, spec: { team: 0, type: 'defSpecial', special: 'ESPD01', ...(i ? { scope: 'current' } : {}), target: 'holder' } })); // la primera usa el ámbito por defecto del perfil
  const defRuns = [
    playWithOrders(defInputFor(20261016, 0, { defense: 'ORG04', coverage: 'COB02', pressureHeight: 'three_quarters' }), foulOrders).m,
    playWithOrders(defInputFor(20261016, 0, { defense: 'ORG06', target: 'EQ02-J01', targetAlt: 'EQ02-J04', coverage: 'COB04', pressureHeight: 'full', specials: [{ id: 'ESPD02', principal: 'EQ02-J01', alternate: null, activation: 'reception', executor: null, executorAlt: null }, { id: 'ESPD03', protected: 'EQ02-J04' }] })).m,
    playWithOrders(defInputFor(20261017, 0, { defense: 'ORG05', coverage: 'COB03' })).m,
    playWithOrders(defInputFor(20261018, 0, { coverage: 'COB01', navigation: 'under' })).m,
    playWithOrders(defInputFor(20261016, 0, { coverage: 'COB02' })).m,
  ].map((m) => buildResult(m));
  // MOTOR-08: las tres políticas del entrenador (la cauta y la agresiva leen sus propias filas) y un libro de una sola ficha que repite el recurso ante la memoria
  const polRun = (a, b, seed = 20261016) => { const i = inputFor(seed); i.teams[0].plan.coach.policy = a; i.teams[1].plan.coach.policy = b; return runMatch(i, base, { detail: 'full' }); };
  const seen = new Set([...read(res), ...read(runMatch(demoInputFor(20261016), base, { detail: 'full' })), ...defRuns.flatMap(read), ...read(polRun('ENTREF01', 'ENTREF03')), ...read(polRun('ENTREF03', 'ENTREF01', 20261017))]);
  // Solo se leen al construir el encuentro/resultado, en prórroga o con órdenes manuales; se comprueban aparte donde procede.
  // MOTOR-08: filas del entrenador/memoria que solo se leen en un contexto concreto (estado de prueba acotado, no espontáneo en estos partidos); su efecto se comprueba en motor08.test.js
  const COACH_CONDITIONAL = /^(coach\.(areas$|endgame\.contexts\.\d+\.(defenseWhenLeadAtMost|needs\.)|foulBook\.\d+\.(priority|exception|preference)$|policies\.ENTREF0\d\.(adjustmentHold|fatigueUtilitySacrifice)$|rotation\.(criticalUtilitySacrifice$|needRecipes\.rebound\.|participation\.(pairs|starterMinutes|reliefMinutes)$)|timeouts\.contextualRest\.meanEnergyMax$)|memory\.patterns\.\d+\.(id|name|specific)$|memory\.responses\.\d+\.(id|concession|dimension|order|priority)$)/;
  const CONDITIONAL = /^(rng\.|activeCatalog\.|rules\.(profile|overtimeSeconds|overtimeFoulsCarryFromPeriod)$|motor02\.|energy\.overtimeIntervalRecovery$|selection\.safeReceiverWeights\.|rotation\.(minimumStintSeconds|replacementUtilityTolerance|criticalReplacementTolerance|foulProtectionTolerance)$|rules\.freeThrowsForOrdinaryBonus$|form\.range$|pressure\.importance\.(important|decisive)$|(moment|teamMoment)\.pauseAttenuation\.timeout$|moment\.categoryBoundaries$|initialStatePolicy\.|rebound\.(lastFreeThrowOffensiveP0|liveLastFreeThrow(Offense|Defense)Slots)$|selection\.midrangePolicy\.|selection\.newVariantPreference\.unknownRoleFunctionWeight$|block\.blockedLooseControlDefenseProbability$|defense\.specials\.boxAndOneDefaultFallback$|throwIns\.(defaultBandOffensivePlan|defaultEndlineOffensivePlan|pointCallScope)$)/; // MOTOR-06: las dos fichas precargadas solo se leen al migrar una entrada anterior y el ámbito de la llamada, al pedirla; la alternativa de box and one, solo si falta el objetivo
  const unread = rows.filter((r) => r.coverage === 'consumido' && !seen.has(r.id) && !CONDITIONAL.test(r.id) && !COACH_CONDITIONAL.test(r.id));
  assert.deepEqual(unread.map((r) => r.id), []);
  assert.deepEqual(rows.filter((r) => r.coverage !== 'consumido' && seen.has(r.id)).map((r) => r.id), []);
  // la diagnosis enlaza las filas del perfil congelado: cada hecho con resolución lleva sus filas
  assert.ok(res.events.some((e) => e.type === 'attempt' && e.params.length > 10));
});

test('herencia: sobreescribir, restablecer vuelve al padre (no a cero), el cero es válido y un padre ausente es un error', () => {
  const lib = new ProfileLibrary({ base });
  const { draft } = lib.createDraft('V0', { name: 'prueba' });
  assert.equal(lib.editDraft(draft.id, { 'energy.enduranceSlope': 0 }, 'cero explícito').ok, true);
  assert.equal(lib.draftEffective(draft.id).energy.enduranceSlope, 0);
  assert.equal(validateProfile(lib.draftEffective(draft.id), { base }).summary.structure, 'valida');
  lib.resetRow(draft.id, 'energy.enduranceSlope');
  assert.equal(lib.draftEffective(draft.id).energy.enduranceSlope, base.energy.enduranceSlope);
  assert.deepEqual(lib.draft(draft.id).overrides, {});
  assert.equal(lib.createDraft('V99').ok, false);
  assert.throws(() => resolveOverrides(base, { 'fila.inexistente': 1 }), /no existe/);
});

test('validación: pesos, probabilidades, curvas, duraciones, referencias, sumas y protección de reglamento/invariantes', () => {
  const ids = issueIds(validateProfile(edit((p) => {
    p.shots.three.p0 = 1; p.durationSeconds.advance = [5, 3, 2]; p.energy.severityNodes = [[0, 1], [50, 0.5], [40, 0.2], [100, 0]];
    p.outcomes.base.turnover = 0.5; p.rules.quarters = 5; p.neutralAbility = 20; p.tasks.TAR02.attack[0][2] = -0.1;
    p.energy.range = [0, 120]; p.rotation.criticalEnergy = 60; p.participantSlots.screener = ['X']; p.desconocido = 1;
  }), { base }));
  for (const expected of ['shots.three.p0|dominio', 'durationSeconds.advance|orden', 'energy.severityNodes|abscisas', 'outcomes.base|suma', 'rules.quarters|protegida', 'neutralAbility|protegida',
    'tasks.TAR02.attack.handler.TEC07|dominio', 'energy.range|protegida', 'rotation.criticalEnergy|umbrales', 'participantSlots.screener|catálogo', 'desconocido|campo-desconocido']) assert.ok(ids.includes(expected), `falta ${expected} en ${ids.join(', ')}`);
  assert.equal(validateProfile(base, { base }).summary.structure, 'valida');
});

test('edición conjunta inválida no aplica nada; normalizar es explícito; el 35→38 % son +3 puntos', () => {
  const ids = ['shots.three.p0', 'shots.midrange.p0'];
  const ok = bulkPreview(base, ids, 'add', 3);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.items.map((i) => [i.before, i.after]), [[0.35, 0.38], [0.39, 0.42]]);
  const bad = bulkPreview(base, ['shots.three.p0', 'shots.rim.p0'], 'add', 40);
  assert.equal(bad.ok, false);
  assert.throws(() => bulkApply(base, bad));
  assert.equal(bulkPreview(base, ['shots.three.p0', 'energy.costPerLiveMinute'], 'assign', 5).ok, false, 'tipos incompatibles');
  assert.equal(bulkPreview(base, ['rules.quarters'], 'assign', 5).ok, false, 'reglamento no editable');
  const lib = new ProfileLibrary({ base }); const { draft } = lib.createDraft('V0');
  const before = lib.draft(draft.id).revision;
  const r = lib.editDraft(draft.id, { 'shots.three.p0': 0.4, 'rules.quarters': 6 });
  assert.equal(r.ok, false); assert.equal(lib.draft(draft.id).revision, before); assert.deepEqual(lib.draft(draft.id).overrides, {});
  const p = normalizeProposal(edit((x) => { x.outcomes.base.turnover = 0.24; }), 'outcomes.base');
  assert.ok(Math.abs(p.reduce((s, x) => s + x.after, 0) - 1) < 1e-12);
});

test('editar tras validar o comparar invalida esa validación y no hereda la evaluación de otra revisión', async () => {
  const lib = new ProfileLibrary({ base });
  const { draft } = lib.createDraft('V0'); const id = draft.id;
  lib.editDraft(id, { 'shots.three.p0': 0.4 });
  assert.equal(lib.validateDraft(id).ok, true); assert.equal(lib.validationIsCurrent(id), true);
  lib.recordComparison({ draftId: id, candidateRevision: lib.draft(id).revision, question: 'q' });
  assert.equal(lib.evaluationsFor(id).length, 1);
  lib.editDraft(id, { 'shots.three.p0': 0.41 });
  assert.equal(lib.validationIsCurrent(id), false);
  assert.equal(lib.evaluationsFor(id).length, 0);
  assert.match(lib.publish(id, { label: 'x' }).error, /validación/);
});

test('guardar/recargar conserva borradores, versiones, historial y activo; un fallo de guardado se comunica y los datos dañados no se sustituyen', () => {
  const st = new MemoryStorage();
  const lib = new ProfileLibrary({ storage: st, base });
  const { draft } = lib.createDraft('V0', { name: 'A' });
  lib.editDraft(draft.id, { 'shots.three.p0': 0.4 }, 'motivo'); lib.validateDraft(draft.id);
  const v = lib.publish(draft.id, { label: 'Triples 40' }).version; lib.activate(v.id);
  const lib2 = new ProfileLibrary({ storage: st, base });
  assert.equal(lib2.activeId, v.id); assert.equal(lib2.versions().length, 2); assert.ok(lib2.history().some((h) => h.kind === 'edicion' && h.changes[0].row === 'shots.three.p0'));
  // fallo de escritura: se avisa y no se afirma guardado
  st.failWrites = true;
  const r = lib2.createDraft('V0'); assert.equal(r.ok, false); assert.equal(lib2.saveState.saved, false); assert.match(lib2.saveState.error, /NO se guardó/);
  // datos dañados: no se reemplazan en silencio
  const bad = new MemoryStorage({ [STORAGE_KEY]: '{"format": "beM-profiles/1", "versions": {' });
  const lib3 = new ProfileLibrary({ storage: bad, base });
  assert.ok(lib3.loadError); assert.equal(lib3.createDraft('V0').ok, false); assert.equal(bad.getItem(STORAGE_KEY).startsWith('{"format"'), true);
  assert.equal(lib3.discardDamagedLocalData().ok, true);
});

test('exportar/importar conserva el valor efectivo, la procedencia y la cobertura sin activar ni sobrescribir', () => {
  const a = new ProfileLibrary({ base });
  const { draft } = a.createDraft('V0', { name: 'Candidata', reason: 'hipótesis de prueba' });
  a.editDraft(draft.id, { 'opportunity.helpProbability': 0.5, 'energy.severityNodes': [[0, 1], [50, 0.2], [100, 0]] });
  a.validateDraft(draft.id); const v = a.publish(draft.id, { label: 'Pub' }).version;
  const file = JSON.parse(JSON.stringify(a.exportVersion(v.id)));
  assert.equal(file.coverage.rows, buildRows(v.effective).length);
  const b = new ProfileLibrary({ base });
  const r = b.importProfile(file);
  assert.equal(r.ok, true); assert.equal(b.activeId, b.baseId, 'no se activa por sorpresa');
  assert.equal(contentHash(b.draftEffective(r.draft.id)), v.hash);
  assert.equal(b.versions().filter((x) => x.hash === v.hash).length, 0, 'no se publica por sorpresa');
  assert.ok(b.importProfile(file).recognized, 'el mismo contenido se reconoce sin duplicar');
  assert.ok(b.version(b.baseId).hash === a.version(a.baseId).hash);
  // rechazos: archivo alterado, versión de motor distinta, campo desconocido
  const tampered = deepCopy(file); tampered.effective.shots.three.p0 = 0.9;
  assert.match(b.importProfile(tampered).error, /huella|rechazada/);
  const oldEngine = deepCopy(file); oldEngine.engine.version = 'beM-motor-0.2.0-MOTOR02';
  assert.match(b.importProfile(oldEngine).error, /motor/);
  const unknown = deepCopy(file); unknown.effective.extraño = 1; unknown.identity.hash = contentHash(unknown.effective);
  assert.match(b.importProfile(unknown).error, /desconocido|dominio|campo/);
});

test('causalidad: editar una fila llega al mecanismo consumidor (probabilidad de tiro y gasto de energía)', () => {
  const sh = (p) => { const m = createMatch(inputFor(5), p, { detail: 'full' }); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); return m; };
  const ex = baseEx({ zone: 'three', defend: null, icpt: null, exec: 'none', quality: { cls: 'normal', K: 0 } });
  const cand = edit((p) => { p.shots.three.p0 = 0.45; });
  const pOf = (profile) => { const m = sh(profile); m.resolveShot(ex, { t: m.snap(), team: 0, intent: {}, participants: {} }, false); return m.events.at(-1).effects.pConversion; };
  const A = (() => { const m = sh(base); return m.shotAbility(ex); })();
  // MOTOR-07: con Forma y momentos neutrales (Z = 0) la única corrección determinista es la presión ordinaria sobre el tirador (MEN07 reduce la pérdida)
  const lossOf = (profile) => pressureLossLogit(profile, 'shot', profile.pressure.importance.ordinary, sh(profile).eff(ex.actor, 'MEN07', 0));
  assert.equal(pOf(base), Number(shotProbability(base, base.shots.three, A, null, -lossOf(base)).toFixed(5)));
  assert.equal(pOf(cand), Number(shotProbability(cand, cand.shots.three, A, null, -lossOf(cand)).toFixed(5)));
  assert.ok(pOf(cand) > pOf(base));
  // gasto de energía: el mismo encuentro con el doble de gasto termina con menos energía
  const fast = edit((p) => { p.energy.costPerLiveMinute = 4; });
  const e0 = runMatch(inputFor(3), base, { detail: 'minimal' }); const e1 = runMatch(inputFor(3), fast, { detail: 'minimal' });
  const mean = (r) => Object.values(r.diagnostics.finalEnergy).reduce((s, x) => s + x, 0);
  assert.ok(mean(e1) < mean(e0));
});

// MOTOR-04, MOTOR-05 y MOTOR-06 cambian el contenido operativo (repertorio, defensa por funciones, decisiones directas y saques): los partidos de referencia anteriores (94–89, 90–126) dejan de ser comparables y
// se sustituye por el de la versión actual. Lo que protege esta prueba es que la base conectada al panel no altera el deporte.
test('equivalencia deportiva: la base conectada al panel reproduce el partido de referencia de la versión (MOTOR-08)', () => {
  const ref = JSON.parse(readFileSync(new URL('./fixtures/baseline-motor08.json', import.meta.url), 'utf8'))['20261016'];
  const res = runMatch(inputFor(20261016), base, { detail: 'full' });
  assert.deepEqual(res.score, ref.score);
  assert.equal(createHash('sha256').update(JSON.stringify(sportsProjection(res))).digest('hex'), ref.sha256);
});

test('comparación base/candidata: dos encuentros completos, mismas entradas, diferencia visible y sin activar nada; congelación en un partido a medias', async () => {
  const lib = new ProfileLibrary({ base });
  const { draft } = lib.createDraft('V0'); lib.editDraft(draft.id, { 'shots.three.p0': 0.5 }); lib.validateDraft(draft.id);
  const input = buildMatchInput(base, data.players);
  const rep = await runComparison({ base: { ref: lib.profileRef('V0'), effective: base }, candidate: { ref: { versionId: draft.id, label: 'cand' }, effective: lib.draftEffective(draft.id) }, input, question: '¿triples?' });
  assert.equal(rep.sample.completeBase + rep.sample.completeCandidate, 2);
  assert.ok(rep.checks.every((c) => c.ok), JSON.stringify(rep.checks.filter((c) => !c.ok)));
  assert.equal(rep.changes.length, 1);
  assert.equal(lib.activeId, 'V0', 'ganar o perder no activa nada');
  const m3 = rep.metrics.find((m) => m.key === 'EQ01.fg3pct');
  assert.ok(m3.denominator.base > 0 && typeof m3.rel === 'number');
  // partido a medias: editar y activar otro perfil después no cambia su configuración efectiva
  const m = createMatch(deepCopy(input), base, { detail: 'minimal', profileRef: lib.profileRef('V0') });
  for (let i = 0; i < 120 && m.step(); i++);
  lib.validateDraft(draft.id); const v = lib.publish(draft.id, { label: 'Cand' }).version; lib.activate(v.id);
  while (m.step());
  const same = runMatch(deepCopy(input), base, { detail: 'minimal' });
  assert.equal(JSON.stringify(sportsProjection(buildResultOf(m))), JSON.stringify(sportsProjection(same)));
  assert.notEqual(lib.activeVersion().hash, contentHash(base), 'los próximos encuentros usan la versión activa nueva');
});
import { buildResult } from '../src/match/index.js';
const buildResultOf = (m) => buildResult(m);

test('con un tiempo muerto manual se consultan las filas de MOTOR-02 (cupos y recuperación) y el diagnóstico las enlaza', () => {
  const m = newMatch(77);
  for (let i = 0; i < 6; i++) m.step();
  m.submit({ team: 0, type: 'timeout' });
  let guard = 0;
  while (!m.events.some((e) => e.type === 'timeout') && m.step() && guard++ < 400);
  const ev = m.events.find((e) => e.type === 'timeout');
  assert.ok(ev, 'tiempo muerto concedido');
  const names = ev.params.map((i) => m.tracker.table[i]);
  assert.ok(names.includes('motor02.timeOutRecoveryEnergyPoints'), names.join(', '));
});
