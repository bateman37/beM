// MOTOR-18: pruebas proporcionadas del modelo de conocimiento, el aprendizaje, la retención y la aplicación idempotente (puros). Tolerancias numéricas; sin snapshots de texto redondeado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildL18 } from '../scripts/m18-l18-table.js';
import { profile, players, P, playFamily, coachOf, uniformBlock } from './m18-helpers.js';
import * as L from '../src/learning/index.js';

const near = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) <= t, `${a} ≠ ${b}`);
const teamOf = (blocks, coach = coachOf(), day = 0) => { const r = L.createTeamState({ instanceId: 'T', players: Object.fromEntries(Object.entries(blocks).map(([k, b]) => [k, { block: b, tacticalLearning: 16 }])), coach, day }, P); assert.ok(r.ok, JSON.stringify(r.errors)); return r.state; };

test('tabla L18-01…14: todas las comprobaciones de cálculo puro se cumplen', () => {
  const res = buildL18(profile); assert.equal(res.rows.length, 14);
  for (const r of res.rows) for (const [k, v] of Object.entries(r.checks)) assert.ok(v, `${r.id} · ${k}`);
});

test('catálogo: 62 niveles y transferencia con IDs válidos, simétrica y sin cierre transitivo', () => {
  assert.equal(L.knowledgeKeys(P).length, 62); assert.deepEqual(L.validateTransfer(P), []);
  for (const d of L.DOMAINS) for (const id of L.idsOf(d, P)) for (const r of L.relatedOf(d, id, P)) assert.ok(L.relatedOf(d, r, P).includes(id), `${d}:${id}↔${r}`);
  assert.ok(!L.relatedOf('position', 'PG', P).includes('SF')); assert.deepEqual(L.relatedOf('tactic', 'ORG06', P), ['ORG01', 'ORG02']); assert.ok(L.relatedOf('tactic', 'ORG02', P).includes('ORG05'));
  assert.ok(!L.relatedOf('tactic', 'ORG06', P).includes('ORG03')); // ORG06–ORG02 y ORG02–ORG03 no implican ORG06–ORG03
});

test('bloques: legacy-neutral = «no aplica»; un bloque explícito incompleto o inválido da errores localizados y no se rellena', () => {
  assert.equal(L.levelOf(L.emptyLegacyBlock(), 'position', 'PG'), null); assert.equal(L.levelOf(undefined, 'tactic', 'ORG01'), null);
  const ok = uniformBlock(10); assert.deepEqual(L.validateKnowledgeBlock(ok, P), []);
  const bad = structuredClone(ok); delete bad.tactics.PRESS; bad.positions.PG.peak = 5; bad.positions.SG.level = 31; bad.offensiveRoles.O01.lastPracticeDay = 9; bad.defensiveRoles.D99 = { level: 1, peak: 1, lastPracticeDay: 0 };
  const paths = L.validateKnowledgeBlock(bad, P).map((e) => e.path);
  for (const p of ['knowledge.tactics.PRESS', 'knowledge.positions.PG.peak', 'knowledge.positions.SG.level', 'knowledge.offensiveRoles.O01.lastPracticeDay', 'knowledge.defensiveRoles.D99']) assert.ok(paths.includes(p), p);
  assert.equal(L.validateKnowledgeBlock({ version: P.knowledgeVersion, mode: 'raro' }, P)[0].path, 'knowledge.mode');
  assert.deepEqual([6, 6.01, 12, 18.5, 24, 30].map((v) => L.categoryOf(v, P).label), ['inicial', 'básico', 'básico', 'avanzado', 'avanzado', 'dominado']);
});

test('fábrica sintética §10.2: semillas de la tabla, máximo en conflictos, recibo y validez', () => {
  const pl = players.find((p) => p.positions[0] === 'PG'); const plan = profile.scenario.plans.find((x) => x.teamId === pl.teamId);
  const { block, receipt } = L.syntheticHistory(pl, plan, P, 40, playFamily); const S = P.syntheticSeeds;
  assert.deepEqual(L.validateKnowledgeBlock(block, P), []); assert.equal(block.asOfDay, 40);
  assert.equal(block.positions.PG.level, S.nominalPosition); assert.equal(block.positions.SG.level, S.relatedPosition); assert.equal(block.positions.C.level, S.otherPosition);
  assert.equal(block.offensiveRoles[pl.offensiveRole.code].level, S.habitualOffensiveRole); assert.equal(block.defensiveRoles[pl.defensiveRole.code].level, S.habitualDefensiveRole);
  assert.equal(block.tactics[plan.defense].level, S.loadedPlanModule); assert.equal(block.tactics[plan.coverage].level, S.loadedPlanModule);
  const top = plan.playbook.find((b) => b.priority <= S.priorityFamilyMaxPriority); assert.equal(block.tactics[`FAM:${playFamily[top.playId]}`].level, S.priorityFamily);
  assert.equal(block.tactics['SAQ:O:band'].level, S.generalModule);
  for (const e of Object.values(block.positions)) { assert.equal(e.peak, e.level); assert.equal(e.lastPracticeDay, 40); }
  // conflicto: un rol relacionado con el habitual que además es «otro» recibe el máximo (18, no 8) y el recibo lo deja escrito
  const rel = L.relatedOf('offensiveRole', pl.offensiveRole.code, P)[0]; assert.equal(receipt.rules[`offensiveRole:${rel}`].value, S.relatedOffensiveRole); assert.ok(receipt.rules[`offensiveRole:${rel}`].candidates.length >= 2);
  assert.equal(L.allMastered(P, 3).tactics.PRESS.level, 30);
});

test('factores y ganancia §8.4: fórmulas exactas, tope 30, redondeo a 30 y capacidades intactas', () => {
  const coach = coachOf(24, 8); const tl = 8; const block = uniformBlock(12, 0, { 'tactic:ORG03': { level: 20, peak: 20 } });
  const f = L.factorsFor({ domain: 'tactic', id: 'ORG02', block, tacticalLearning: tl, coach, params: P });
  near(f.player, 0.75 + 0.5 * (7 / 29)); near(f.teaching, 0.75 + 0.5 * (23 / 29)); near(f.content, 0.75 + 0.5 * (7 / 29)); near(f.transfer, 1 + 0.5 * (19 / 29)); assert.equal(f.relatedMaxLevel, 20);
  const dose = 1.5; const r = L.learnClosed({ level: 12, peak: 12, dose, rate: 0.8, F: f.product, params: P });
  near(r.level, 30 - 18 * Math.exp(-(0.8 * dose * f.product) / 29)); assert.equal(r.peak, r.level);
  assert.equal(L.learnClosed({ level: 29.9, peak: 29.9, dose: 40, rate: 0.8, F: 1, params: P }).level, 30);
  assert.ok(L.learnClosed({ level: 12, peak: 12, dose: 1e6, rate: 0.8, F: 5, params: P }).level <= 30);
  assert.equal(L.learnClosed({ level: 12, peak: 12, dose: 0, rate: 0.8, F: 1, params: P }).level, 12);
  // una propuesta no tiene ni toca capacidades, edad, cuerpo, energía ni forma: el estado de aprendizaje solo contiene conocimiento, Polivalencia, entrenador y presupuestos
  const st = teamOf({ a: uniformBlock(12) }); const pr = L.proposeFromSession(st, { source_id: 'x', collectiveFocus: 'ORG02', players: { a: { hours: 1, individualFocus: null } } }, P);
  assert.deepEqual(Object.keys(pr.nextState.players.a).sort(), ['block', 'closedDays', 'ledger', 'tacticalLearning']);
});

test('reaprendizaje: acelerado solo hasta el peak y nunca para lo que no se aprendió; la dosis total es aditiva', () => {
  const run = (level, peak, dose) => L.learnClosed({ level, peak, dose, rate: 0.4, F: 1, params: P });
  const slow = run(26, 26, 1); const fast = run(26, 30, 1); assert.ok(fast.level - 26 > slow.level - 26);
  near(fast.level, 30 - 4 * Math.exp(-(2 * 0.4) / 29));
  const cut = run(27.8, 28, 20); assert.ok(cut.acceleratedDose < 20 && cut.level > 28); near(cut.G, 0.4 * (2 * cut.acceleratedDose + cut.normalDose));
  for (const [lv, pk, d] of [[12, 12, 4], [26, 28, 8], [10, 20, 60], [26, 30, 2]]) { const h = run(lv, pk, d / 2); const h2 = run(h.level, h.peak, d / 2); near(run(lv, pk, d).level, h2.level); }
});

test('retención: 26,4 a los 3650 días, suelos, nunca mejora, rechaza días anteriores y no actúa dentro del partido', () => {
  near(L.retainEntry({ level: 30, peak: 30, lastPracticeDay: 0 }, 'position', 0, 3650, P).level, 26.4);
  near(L.retainEntry({ level: 30, peak: 30, lastPracticeDay: 0 }, 'tactic', 0, 3650, P).level, 18);
  assert.equal(L.retainEntry({ level: 10, peak: 30, lastPracticeDay: 0 }, 'tactic', 0, 3650, P).level, 10);
  assert.equal(L.retainEntry({ level: 30, peak: 30, lastPracticeDay: 0 }, 'tactic', 0, 90, P).level, 30);
  const st = teamOf({ a: uniformBlock(30, 100) }, coachOf(), 100);
  assert.equal(L.advanceTeam(st, 99, P).ok, false); assert.equal(L.advanceTeam(st, 100, P).state, st);
  const long = L.advanceTeam(st, 3750, P).state; assert.equal(long.day, 3750); assert.equal(long.players.a.block.asOfDay, 3750); near(long.players.a.block.positions.PG.level, 26.4);
  assert.equal(long.players.a.closedDays.length, 1);
});

test('sesión: reparto 60/40, parte sin foco sin redistribuir, presupuesto diario, «solo desuso» y «N días y entrenar»', () => {
  const st = teamOf({ a: uniformBlock(12) });
  const a = L.proposeFromSession(st, { source_id: 'A', collectiveFocus: 'ORG02', players: { a: { hours: 2, individualFocus: null } } }, P);
  assert.equal(a.players.a.targets.length, 1); near(a.players.a.targets[0].dose, 1.2); near(a.players.a.hours.unusedIndividual, 0.8);
  const b = L.proposeFromSession(st, { source_id: 'B', collectiveFocus: 'ORG02', players: { a: { hours: 4, individualFocus: { domain: 'defensiveRole', id: 'D01' } } } }, P);
  near(b.players.a.targets.find((t) => t.key === 'defensiveRole:D01').dose, 1.6);
  assert.equal(L.proposeFromSession(st, { source_id: 'C', collectiveFocus: 'ORG02', players: { a: { hours: 0.1, individualFocus: null } } }, P).ok, false);
  assert.equal(L.proposeFromSession(st, { source_id: 'C', collectiveFocus: 'ORG02', shares: { collective: 0.7, individual: 0.7 }, players: { a: { hours: 1 } } }, P).ok, false);
  const idleOnly = L.proposeFromSession(st, { source_id: 'D', onlyIdle: true, idleDays: 3650 }, P);
  assert.equal(idleOnly.mode, 'solo-desuso'); assert.equal(idleOnly.players.a.targets.length, 0); assert.ok(idleOnly.nextState.players.a.block.positions.PG.level < 12);
  const both = L.proposeFromSession(st, { source_id: 'E', idleDays: 3650, collectiveFocus: 'ORG02', players: { a: { hours: 1, individualFocus: null } } }, P);
  assert.equal(both.day, 3650); assert.equal(both.players.a.targets.length, 1); assert.equal(both.nextState.players.a.ledger.training.hours, 1); // una sola sesión del día destino, no 3650 repeticiones
});

test('partido §8.3: presupuesto min(min/40,1) por dominio repartido, sin exposición táctica no hay dosis táctica, tope diario', () => {
  const st = teamOf({ a: uniformBlock(12), b: uniformBlock(12) });
  const x = { complete: true, match: { source_id: 'M' }, players: { a: { liveTenths: 20 * 600, positions: { PG: 3, SG: 1 }, offensiveRoles: { O01: 1 }, defensiveRoles: { D01: 1 }, modules: { ORG02: 1, 'FAM:handoff': 3 } }, b: { liveTenths: 40 * 600, positions: { C: 1 }, offensiveRoles: {}, defensiveRoles: {}, modules: {} } } };
  const pr = L.proposeFromMatch(st, x, P); const ta = Object.fromEntries(pr.players.a.targets.map((t) => [t.key, t.dose]));
  near(ta['position:PG'], 0.5 * 0.75); near(ta['position:SG'], 0.5 * 0.25); near(ta['tactic:ORG02'], 0.5 * 0.25); near(ta['tactic:FAM:handoff'], 0.5 * 0.75);
  assert.deepEqual(pr.players.b.targets.map((t) => t.key), ['position:C']); near(pr.players.b.targets[0].dose, 1);
  const first = L.applyProposal(st, L.createLedger(), pr); const second = L.proposeFromMatch(first.state, { ...x, match: { source_id: 'M2' } }, P);
  near(second.players.a.budgets.position.allowed, 0.5); near(second.players.b.budgets.position.allowed, 0); // 1 por jugador, dominio y día (prórroga o repetición no lo multiplica)
});

test('aplicación idempotente: duplicado, huella previa, deshacer exacto, restauración identificada y orden inverso', () => {
  const st = teamOf({ a: uniformBlock(12) }); let led = L.createLedger();
  const p1 = L.proposeFromSession(st, { source_id: 'S1', collectiveFocus: 'ORG02', players: { a: { hours: 1, individualFocus: null } } }, P);
  const a1 = L.applyProposal(st, led, p1); assert.ok(a1.ok);
  const dup = L.applyProposal(a1.state, a1.ledger, p1); assert.equal(dup.ok, false); assert.match(dup.reason, /ya se aplicó/);
  const other = { ...p1, source_id: 'S2' }; assert.match(L.applyProposal(a1.state, a1.ledger, other).reason, /huella previa/); // parte de otro estado
  const p2 = L.proposeFromSession(a1.state, { source_id: 'S2', collectiveFocus: 'ORG02', players: { a: { hours: 1, individualFocus: null } } }, P); const a2 = L.applyProposal(a1.state, a1.ledger, p2); assert.ok(a2.ok);
  assert.match(L.undoApplication(a2.state, a2.ledger, 'APL-1').reason, /orden inverso/);
  const u2 = L.undoApplication(a2.state, a2.ledger, 'APL-2'); assert.ok(u2.ok); assert.equal(L.teamFingerprint(u2.state), L.teamFingerprint(a1.state));
  assert.equal(u2.ledger.applications.find((x) => x.id === 'APL-2').status, 'revertida'); assert.equal(u2.ledger.applications.at(-1).kind, 'restauracion');
  assert.equal(u2.state.players.a.ledger.training.hours, 1); // el presupuesto de la sesión revertida se restaura
  assert.equal(L.applyProposal(u2.state, u2.ledger, p2).ok, true); // una fuente revertida ya no está vigente
  assert.equal(L.applyProposal({ ...st, instanceId: 'OTRA' }, led, p1).ok, false); // otra instancia de equipo
});

test('jugador sin historial (legacy-neutral) no aprende y se indica; la clave de fuente incorpora la instancia', () => {
  const st = teamOf({ a: uniformBlock(12), old: L.emptyLegacyBlock() });
  const x = { complete: true, match: { source_id: 'M' }, players: { old: { liveTenths: 24000, positions: { PG: 1 }, offensiveRoles: {}, defensiveRoles: {}, modules: {} } } };
  const pr = L.proposeFromMatch(st, x, P); assert.match(pr.players.old.skipped, /sin historial/); assert.equal(pr.players.old.targets.length, 0);
  assert.equal(L.sourceIdOf({ source: 'lote', batch: 'LOT-1', attempt: 'M000001-A1', teamInstance: 'EQ01#2' }), 'lote|LOT-1|M000001-A1|EQ01#2');
  assert.equal(L.proposeFromMatch(st, { players: {} }, P).ok, false); // sin identificador global de fuente
});
