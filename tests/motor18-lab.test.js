// MOTOR-18 · lógica pura del laboratorio de conocimiento (src/lab/learning-model.js): copias, ediciones con deshacer exacto, resúmenes, persistencia e idempotencia. Sin DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from '../scripts/node-data.js';
import { buildMatchInput, validateInput } from '../src/match/index.js';
import * as M from '../src/lab/learning-model.js';
import * as L from '../src/learning/index.js';

const { profile, players } = loadData(); const P = profile.familiarity;
const base = () => buildMatchInput(profile, players, { seed: 7 });

test('la copia sintética y la «todo dominado» son válidas, identificadas y no tocan la entrada original', () => {
  const input = base(); const before = JSON.stringify(input);
  for (const mode of ['synthetic', 'mastered']) {
    const c = M.makeLearningCopy(input, profile, { mode });
    assert.equal(validateInput(c.input, profile).length, 0); assert.equal(c.input.schema, 'beM-match-input/7');
    assert.ok(c.changes.some((x) => x.campo.startsWith('conocimiento'))); assert.equal(c.input.teams[0].players[0].development.tacticalLearning, 16);
    assert.equal(Object.keys(c.input.teams[0].coachLearning.tacticalMastery).length, 30);
    if (mode === 'mastered') assert.ok(Object.values(c.input.teams[0].players[0].knowledge.tactics).every((e) => e.level === 30 && e.peak === 30));
  }
  assert.equal(JSON.stringify(input), before, 'la entrada original (referencias) permanece legacy-neutral');
  assert.equal(input.teams[0].players[0].knowledge, undefined);
});

test('edición de conocimiento: +1/+3/+5 acotado a 30, nunca peak < nivel y deshacer exacto', () => {
  const c = M.makeLearningCopy(base(), profile, { mode: 'synthetic' }); const snap = JSON.stringify(c.input);
  const ids = ['EQ01-J01', 'EQ01-J02']; const keys = [{ domain: 'tactic', id: 'FAM:give_and_go' }, { domain: 'position', id: 'PG' }];
  for (const delta of [1, 3, 5]) for (const mode of ['level', 'synthetic']) {
    const ch = M.planKnowledgeEdit(c.input, P, ids, keys, { delta, mode }); const rec = M.applyKnowledgeEdit(c.input, ch, 'x');
    for (const e of c.input.teams[0].players.slice(0, 2).flatMap((p) => [p.knowledge.tactics['FAM:give_and_go'], p.knowledge.positions.PG])) { assert.ok(e.level <= 30 && e.level >= 1); assert.ok(e.peak >= e.level - 1e-12); }
    M.undoKnowledgeEdit(c.input, rec); assert.equal(JSON.stringify(c.input), snap, `deshacer exacto (+${delta}, ${mode})`);
  }
  const g = M.planKnowledgeEdit(c.input, P, ['EQ01-J01'], [{ domain: 'tactic', id: 'FAM:give_and_go' }], { delta: 5 })[0]; assert.equal(g.after.level, 17, 'semilla 12 + 5');
});

test('sesión: desuso del veterano (30 → 26,4 a 3650 días), vista previa sin escribir, aplicar, idempotencia y deshacer', () => {
  const c = M.makeLearningCopy(base(), profile, { mode: 'synthetic' }); const { states } = M.teamStatesOf(c.input, P, 0); const st = states.EQ01; const fp0 = L.teamFingerprint(st);
  const prop = L.proposeFromSession(st, { source_id: 'lab|t|S1', idleDays: 3650, onlyIdle: true, players: {} }, P);
  assert.ok(prop.ok); assert.equal(L.teamFingerprint(st), fp0, 'previsualizar no escribe');
  const pg = prop.players['EQ01-J01'].idle.find((i) => i.domain === 'position' && i.id === 'PG'); assert.ok(Math.abs(pg.after - 26.4) < 1e-9);
  let ledger = L.createLedger(); const a = L.applyProposal(st, ledger, prop); assert.ok(a.ok);
  const dup = L.applyProposal(a.state, a.ledger, prop); assert.equal(dup.ok, false, 'la misma fuente no se aplica dos veces');
  const u = L.undoApplication(a.state, a.ledger, a.receipt.application); assert.ok(u.ok); assert.equal(L.teamFingerprint(u.state), fp0);
  assert.equal(u.ledger.applications.find((x) => x.id === a.receipt.application).status, 'revertida');
  const input = c.input; M.writeStateToInput(input, a.state); assert.ok(Math.abs(input.teams[0].players[0].knowledge.positions.PG.level - 26.4) < 1e-9);
  assert.equal(input.teams[0].players[0].abilities.TEC01, c.input.teams[0].players[0].abilities.TEC01);
});

test('resumen del quinteto y persistencia round-trip de la copia con su registro', () => {
  const c = M.makeLearningCopy(base(), profile, { mode: 'synthetic' }); const q = M.quintetSummary(c.input.teams[0], P, profile);
  assert.equal(q.neutralPlayers, 0); assert.ok(q.modules.length >= 4); assert.ok(q.lowest.length > 0);
  const neutral = M.quintetSummary(base().teams[0], P, profile); assert.equal(neutral.neutralPlayers, 5, 'legacy-neutral: sin historial, no «domina todo»');
  const { states } = M.teamStatesOf(c.input, P, 0); const Ls = { copy: c, day: 0, states, ledgers: M.newLedgers(c.input), undo: [] };
  const back = M.deserializeLearning(M.serializeLearning(Ls)); assert.deepEqual(back.states, states); assert.equal(back.copy.id, c.id);
  assert.throws(() => M.deserializeLearning('{"schema":"otro"}'));
});
