// MOTOR-18: familiaridad táctica en el motor (efecto limitado, camino neutral, exposición, guardado/continuación, audiencias y contratos). Pocas pruebas, agrupadas por propiedad;
// los cálculos puros de aprendizaje/retención y la tabla L18 están en tests/motor18-learning.test.js y la sensibilidad de auditoría en tests/motor18-audit.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor } from './helpers.js';
import { createMatch, runMatch, buildResult, validateInput, deepCopy, ENGINE_VERSION, EXPORT_SCHEMA } from '../src/match/index.js';
import { sportsProjection, validateReplayFile } from '../src/match/replay.js';
import { snapshotMatch, restoreMatch } from '../src/match/snapshot.js';
import { familiarityActor, familiarityDelta, familiaritySide } from '../src/match/formulas.js';
import { allMastered, emptyLegacyBlock, makeEntry, BLOCK_FIELD } from '../src/knowledge/model.js';
import { analyze } from '../src/analysis/index.js';
import { inputFingerprint } from '../src/batch/fingerprint.js';

const { profile } = data; const F = profile.familiarity;
const withKnowledge = (input, f) => { for (const [ti, t] of input.teams.entries()) for (const p of t.players) { const k = f(ti, p); if (k) p.knowledge = k; } return input; };
const lowModule = (block, id, level) => { block.tactics[id] = makeEntry(level, block.asOfDay); return block; };
const same = (a, b) => assert.deepEqual(JSON.stringify(sportsProjection(a)), JSON.stringify(sportsProjection(b)));

test('versiones del motor y del export de MOTOR-18; el export/9 anterior se lee pero no se reproduce', () => {
  assert.equal(ENGINE_VERSION, 'beM-motor-0.18.0-MOTOR18'); assert.equal(EXPORT_SCHEMA, 'beM-match-export/10');
  const v = validateReplayFile({ schema: 'beM-match-export/9', meta: { engineVersion: 'beM-motor-0.17.1-MOTOR17B' } });
  assert.equal(v.legacy, true); assert.equal(v.reproducible, false); assert.match(v.problems[0], /MOTOR-18/);
});

test('ajuste de familiaridad: signo, límite de 0,30 por lado, omisión de componentes y cero con todo a 30 o sin conocimiento', () => {
  const D = (position, role, modules) => familiarityActor(F, { position, role, modules }).D;
  // todo a 30 ⇒ dominio 1 ⇒ ajuste exactamente 0; compatibilidad neutra (sin dominio) ⇒ carencia 0
  assert.equal(familiarityDelta(F, 'quality', D(30, 30, [{ w: 1, K: 30 }]), D(30, 30, [{ w: 1, K: 30 }])).delta, 0);
  assert.equal(familiarityDelta(F, 'quality', null, null).delta, 0);
  // desconocimiento ofensivo dificulta (signo −); defensivo facilita (+); cada uno limitado por su máximo; carencias iguales se compensan
  const lo = D(1, 1, [{ w: 1, K: 1 }]); const hi = D(30, 30, [{ w: 1, K: 30 }]);
  assert.equal(lo, 0);
  for (const scope of ['quality', 'pressedAdvance']) {
    assert.ok(Math.abs(familiarityDelta(F, scope, lo, hi).delta + F.maxLogit[scope].attack) < 1e-12);
    assert.ok(Math.abs(familiarityDelta(F, scope, hi, lo).delta - F.maxLogit[scope].defense) < 1e-12);
    assert.ok(Math.abs(familiarityDelta(F, scope, lo, lo).delta) < 1e-12 + Math.abs(F.maxLogit[scope].defense - F.maxLogit[scope].attack));
  }
  // un componente que no aplica se omite y los pesos restantes se normalizan (no es «dominio 1»): solo rol 30 ⇒ dominio 1
  assert.equal(D(null, 30, []), 1); assert.equal(D(null, null, []), null); assert.equal(D(30, null, [{ w: 1, K: null }]), 1);
  const w = F.componentWeights; assert.ok(Math.abs(D(1, 30, [{ w: 1, K: 30 }]) - (w.role + w.tactic) / (w.position + w.role + w.tactic)) < 1e-12);
  assert.equal(familiaritySide([null, null]), null); assert.equal(familiaritySide([0.5, null, 1]), 0.75);
});

test('camino neutral exacto: desactivada, legacy-neutral, todos a 30 y Polivalencia distinta dan el mismo deporte; la huella de entrada sí cambia con la Polivalencia', () => {
  const seed = 382000009; const base = runMatch(inputFor(seed), profile, { detail: 'minimal' });
  const allThirty = runMatch(withKnowledge(inputFor(seed), () => allMastered(F, 0)), profile, { detail: 'minimal' });
  const off = deepCopy(profile); off.familiarity.activation.enabled = false;
  const disabled = runMatch(withKnowledge(inputFor(seed), () => allMastered(F, 0)), off, { detail: 'minimal' });
  const legacy = runMatch(withKnowledge(inputFor(seed), () => emptyLegacyBlock()), profile, { detail: 'minimal' });
  same(base, allThirty); same(base, disabled); same(base, legacy);
  assert.equal(allThirty.diagnostics.familiarity.applications.quality.organized.nonZeroDelta, 0);
  assert.equal(disabled.diagnostics.familiarity.enabled, false);
  const lowLearn = withKnowledge(inputFor(seed), () => allMastered(F, 0)); const highLearn = deepCopy(lowLearn);
  for (const p of lowLearn.teams[1].players) p.development = { tacticalLearning: 16 }; for (const p of highLearn.teams[1].players) p.development = { tacticalLearning: 30 };
  same(runMatch(lowLearn, profile, { detail: 'minimal' }), runMatch(highLearn, profile, { detail: 'minimal' })); // la Polivalencia solo actúa entre partidos
  assert.notEqual(inputFingerprint(lowLearn), inputFingerprint(highLearn));
});

test('el conocimiento bajo cambia la calidad de la oportunidad con un único ajuste por operación; la exposición no multiplica la experiencia y el nivel no se toca durante el partido', () => {
  const seed = 382000010; const input = withKnowledge(inputFor(seed), (ti) => (ti === 1 ? lowModule(lowModule(allMastered(F, 0), 'ORG01', 1), 'ORG02', 1) : allMastered(F, 0)));
  input.teams[1].plan.defense = 'ORG02'; const frozen = deepCopy(input);
  const res = runMatch(input, profile, { detail: 'full' }); const fam = res.diagnostics.familiarity;
  const org = fam.applications.quality.organized; assert.ok(org.nonZeroDelta > 0, 'hay operaciones organizadas con ajuste');
  // defensa sin conocimiento de su organización ⇒ ajuste positivo (facilita la ventaja rival), nunca por encima del máximo del perfil
  assert.ok(org.maxDelta > 0 && org.maxDelta <= F.maxLogit.quality.defense + 1e-9 && org.minDelta >= -1e-12);
  const notes = res.events.flatMap((e) => (e.calc ?? []).filter((c) => c.label === 'familiaridad'));
  const used = notes.filter((n) => n.aplica && n.ambito === 'quality'); assert.equal(used.length, fam.exposure.operations.quality);
  for (const e of res.events) for (const c of e.calc ?? []) if (c.label === 'calidad' && c.entradas) assert.ok(Math.abs(c.entradas.extraZ - (c.entradas.extraZFormaPresion + c.entradas.extraZFamiliaridad)) < 1e-12, 'forma/presión y familiaridad separadas y sumadas una vez');
  assert.ok(notes.some((n) => n.aplica === false && /heredada|determinista/.test(n.motivo)), 'calidad heredada registrada como no aplica');
  assert.deepEqual(res.input.teams.map((t) => t.players.map((p) => p.knowledge)), frozen.teams.map((t) => t.players.map((p) => p.knowledge)), 'el partido no modifica el conocimiento');
  const x = fam.exposure.players; for (const [pid, e] of Object.entries(x)) { const s = Object.values(e.positions).reduce((a, b) => a + b, 0); assert.equal(s, e.liveTenths, `${pid}: minutos por posición suman el juego vivo`); }
  assert.ok(Object.values(x).some((e) => Object.keys(e.modules).length > 0));
});

test('avance ante presión adelantada: el mismo ajuste se suma una sola vez a z y se registra con su exposición', () => {
  const seed = 382000011; const input = withKnowledge(inputFor(seed), (ti) => (ti === 1 ? lowModule(allMastered(F, 0), 'PRESS', 1) : allMastered(F, 0)));
  input.teams[1].plan.pressureHeight = 'full';
  const res = runMatch(input, profile, { detail: 'full' }); const fam = res.diagnostics.familiarity; assert.ok(fam.exposure.operations.pressedAdvance > 0);
  const adv = res.events.flatMap((e) => (e.calc ?? []).filter((c) => c.label === 'salida:avance')); assert.equal(adv.length, fam.exposure.operations.pressedAdvance);
  assert.ok(adv.every((c) => c.entradas.famZ >= 0 && c.entradas.famZ <= F.maxLogit.pressedAdvance.defense + 1e-9));
  assert.ok(adv.some((c) => c.entradas.famZ > 0));
});

test('posición y rol aplicados desde su frontera real: un cambio de rol divide la exposición y un pívot sigue siendo elegible de base', () => {
  const input = withKnowledge(inputFor(382000012), () => allMastered(F, 0));
  const m = createMatch(input, profile, { detail: 'minimal' }); m.init(); const pid = m.onCourt(0)[0]; const before = m.roleOf[pid];
  let n = 0; while (n < 80 && m.step()) n += 1; const mid = m.famExposure().players[pid].liveTenths; m.roleOf[pid] = before === 'O02' ? 'O03' : 'O02';
  while (m.step()) { /* hasta el final */ }
  const e = m.famExposure().players[pid]; assert.ok(mid > 0 && e.offensiveRoles[before] === mid, 'hasta la orden el rol anterior acumula'); assert.ok(e.offensiveRoles[m.roleOf[pid]] > 0);
  assert.equal(Object.values(e.offensiveRoles).reduce((a, b) => a + b, 0), e.liveTenths);
  // posición nominal no filtra: un pívot titular de base es válido y juega; su familiaridad con la posición asignada es la que cuenta
  const swap = inputFor(382000013); const s = swap.teams[0].plan.starters; [s.PG, s.C] = [s.C, s.PG];
  for (const pr of swap.teams[0].plan.participation.pairs) if (pr.slot === 'PG' || pr.slot === 'C') pr.starter = s[pr.slot]; // la rotación manual acompaña el intercambio (escenario B04): el plan de participación debe seguir siendo coherente
  assert.equal(validateInput(swap, profile).length, 0); assert.equal(runMatch(swap, profile, { detail: 'minimal' }).status, 'finished');
});

test('guardar y continuar no duplica la exposición ni cambia el marcador y un guardado de otro motor se rechaza con motivo', () => {
  const input = withKnowledge(inputFor(382000014), () => allMastered(F, 0));
  const full = createMatch(deepCopy(input), profile, { detail: 'minimal' }); full.init(); while (full.step()) { /* completo */ }
  const m = createMatch(deepCopy(input), profile, { detail: 'minimal' }); m.init(); let n = 0; while (m.periodBreak == null && n < 5000 && m.step()) n += 1;
  const snap = JSON.parse(JSON.stringify(snapshotMatch(m))); const r = restoreMatch(snap); while (r.step()) { /* continuación */ }
  assert.deepEqual(r.famExposure(), full.famExposure()); assert.equal(r.score.join('-'), full.score.join('-'));
  assert.throws(() => restoreMatch({ ...snap, identity: { ...snap.identity, engineVersion: 'beM-motor-0.17.1-MOTOR17B' } }), /motor/i);
});

test('audiencias: público y rival no reciben conocimiento, Polivalencia ni enseñanza; la propia solo su equipo; el diagnóstico va identificado', () => {
  const input = withKnowledge(inputFor(382000015), () => allMastered(F, 0));
  for (const t of input.teams) { t.coachLearning = { teaching: 21, tacticalMastery: Object.fromEntries(F.catalog.modules.map((x) => [x.id, 17])) }; for (const p of t.players) p.development = { tacticalLearning: 23 }; }
  const res = runMatch(input, profile, { detail: 'minimal' });
  const pub = JSON.stringify(analyze(res, { audience: 'public', team: 0 }).familiarity()); const own = analyze(res, { audience: 'own', team: 0 }).familiarity(); const diag = analyze(res, { audience: 'diagnostic' }).familiarity();
  assert.ok(!/tacticalLearning|teaching|coachLearning|"knowledge"/.test(pub));
  assert.equal(own.team, input.teams[0].id); assert.ok(!/tacticalLearning|teaching|coachLearning/.test(JSON.stringify(own))); assert.ok(!JSON.stringify(own).includes(input.teams[1].players[0].id));
  assert.equal(diag.teams.length, 2); assert.match(diag.identification, /DIAGNÓSTICO/); assert.equal(diag.teams[1].players[0].tacticalLearning, 23);
});

test('contratos: bloque explícito incompleto o inválido, perfil sin familiaridad y datos de enseñanza dan errores localizados sin defaults ocultos', () => {
  const ok = withKnowledge(inputFor(5), () => allMastered(F, 0)); assert.equal(validateInput(ok, profile).length, 0);
  const bad = deepCopy(ok); delete bad.teams[0].players[0].knowledge[BLOCK_FIELD.tactic].ORG02; bad.teams[1].players[2].knowledge.positions.PG.level = 45;
  bad.teams[0].coachLearning = { teaching: 40, tacticalMastery: {} }; bad.teams[1].players[1].development = { tacticalLearning: 0 };
  const errs = validateInput(bad, profile).map((e) => `${e.path}: ${e.message}`); assert.ok(errs.length >= 5);
  assert.ok(errs.some((e) => /players\[0\]\(EQ01-J01\)\.knowledge\.tactics\.ORG02/.test(e))); assert.ok(errs.some((e) => /coachLearning\.teaching/.test(e))); assert.ok(errs.some((e) => /tacticalLearning/.test(e)));
  const older = deepCopy(profile); delete older.familiarity;
  assert.ok(validateInput(ok, older).some((e) => /no incluye la familiaridad táctica/.test(e.message)));
  assert.equal(runMatch(inputFor(7), older, { detail: 'minimal' }).diagnostics.familiarity.enabled, false); // perfil anterior: capa desactivada, compatibilidad neutra
  assert.equal(validateInput(withKnowledge(inputFor(5), () => emptyLegacyBlock()), profile).length, 0);
});
