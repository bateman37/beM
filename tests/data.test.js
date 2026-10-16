// Datos: legibilidad, 32 capacidades, 144 IDs, doce plazas, rangos, sumas, referencias y rechazo de entradas mal formadas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor } from './helpers.js';
import { checkData } from '../scripts/check-data.js';
import { validateInput, validateProfileAndFixtures, ATTRS } from '../src/match/index.js';
import { createRng } from '../src/match/rng.js';

test('perfil, 144 fichas y catálogo de hashes coinciden con el anexo archivado', () => {
  const r = checkData();
  assert.deepEqual(r.problems, []);
  assert.equal(data.players.length, 144);
  assert.equal(data.players.every((p) => ATTRS.every((a) => typeof p.abilities[a] === 'number')), true);
});

test('el validador identifica el campo concreto de una entrada mal formada y no inventa valores', () => {
  const input = inputFor(20261016);
  input.teams[0].players[2].abilities.TEC05 = 31;
  delete input.teams[1].players[0].abilities.MEN03;
  input.teams[0].players[1].state.energy = 120;
  input.teams[1].plan.playbook[0].priority = 6;
  input.seed = -3;
  const errs = validateInput(input, data.profile);
  const paths = errs.map((e) => e.path);
  assert.ok(paths.some((p) => p.includes('players[2](EQ01-J03).abilities.TEC05')));
  assert.ok(paths.some((p) => p.includes('abilities.MEN03')));
  assert.ok(paths.some((p) => p.includes('state.energy')));
  assert.ok(paths.some((p) => p.includes('playbook[0].priority')));
  assert.ok(paths.includes('seed'));
});

test('validateProfileAndFixtures rechaza un perfil con pesos que no suman 1', () => {
  const p = structuredClone(data.profile);
  p.outcomes.base.turnover = 0.5;
  assert.ok(validateProfileAndFixtures(p, data.players).some((e) => e.path === 'outcomes.base'));
});

test('xorshift32 reproducible, sustituye la semilla cero y no depende de Math.random', () => {
  const cfg = data.profile.rng;
  const a = createRng(20261016, cfg); const b = createRng(20261016, cfg);
  const sa = Array.from({ length: 5 }, () => a.next('x')); const sb = Array.from({ length: 5 }, () => b.next('x'));
  assert.deepEqual(sa, sb);
  assert.ok(sa.every((u) => u >= 0 && u < 1));
  const z = createRng(0, cfg);
  assert.equal(z.zeroSeedReplaced, true);
  // primer paso a mano: x ^= x<<13; x ^= x>>>17; x ^= x<<5 (32 bits sin signo)
  let x = 20261016 >>> 0; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x >>>= 0; x ^= x << 5; x >>>= 0;
  assert.equal(createRng(20261016, cfg).next('x'), x / 4294967296);
});
