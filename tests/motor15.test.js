// MOTOR-15: cierre funcional, compatibilidad y rendimiento del mundo. Grupos de riesgo (no un test por fila).
//  1 · compatibilidad del panel: perfil anterior, actual y genuinamente inválido (parametrizado), recuperación explícita sin tocar el original.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyExtension } from '../src/match/index.js';
import { buildRows } from '../src/profiles/rows.js';
import { assessProfile } from '../src/profiles/compat.js';
import { ProfileLibrary, MemoryStorage } from '../src/profiles/library.js';
import { data } from './helpers.js';

const readJson = (n) => JSON.parse(readFileSync(new URL(`../data/match/${n}`, import.meta.url), 'utf8'));
const oldProfile = () => applyExtension(readJson('motor01-seed-profile.json'), ...['02', '03', '04'].map((m) => readJson(`motor${m}-seed-extension.json`)));

// ---------------------------------------------------------------------------------------------------------------- 1
test('M15·1 perfil anterior (hasta MOTOR-04): las filas se construyen sin tirar el panel y los módulos ausentes se distinguen del valor cero', () => {
  const old = oldProfile();
  assert.doesNotThrow(() => buildRows(old), 'causa original: rows-motor08 leía profile.coach.policies sin existir `coach`');
  const rows = buildRows(old);
  const coachRow = rows.find((r) => r.id.startsWith('coach.policies.'));
  assert.ok(coachRow?.missing, 'la fila de entrenador queda como ausente, no inventada');
  assert.match(coachRow.label, /ausente en este perfil/);
  const a = assessProfile(old);
  assert.equal(a.ready, false);
  assert.ok(a.lackingToPlay.includes('coach') && a.lackingToPlay.includes('regulation') && a.lackingToPlay.includes('moment'));
  assert.ok(a.modules.find((m) => m.id === 'coach' && !m.present), 'módulo no compatible ≠ valor cero');
  assert.ok(a.missingRequiredRows > 0);
});

test('M15·1 perfil actual: completo y listo; perfil genuinamente inválido: se informa sin lanzar', () => {
  const { profile } = data;
  const ok = assessProfile(profile);
  assert.equal(ok.ready, true); assert.equal(ok.missingRequiredRows, 0); assert.equal(ok.missingModules.length, 0);
  for (const mut of [(p) => { p.coach = 7; }, (p) => { p.plays = 'x'; }]) {
    const bad = JSON.parse(JSON.stringify(profile)); mut(bad);
    const a = assessProfile(bad);
    assert.equal(a.ready, false); assert.ok(a.error, 'el fallo se declara en la frontera de evaluación'); assert.match(a.summary, /no se pudo evaluar/);
  }
});

test('M15·1 recuperación explícita: la candidata se crea desde la base actual, el original protegido no cambia y no hay activación silenciosa', () => {
  const st = new MemoryStorage();
  const L0 = new ProfileLibrary({ storage: st, base: oldProfile() });
  const v0 = L0.version('V0'); const hash0 = v0.hash; const snap0 = JSON.stringify(v0.effective);
  const L = new ProfileLibrary({ storage: st, base: data.profile }); // la aplicación actual arranca sobre la biblioteca antigua
  assert.equal(L.activeId, 'V0', 'no se activa nada en silencio al arrancar con un perfil anterior');
  assert.notEqual(L.baseId, 'V0');
  const r = L.upgradeCandidate('V0');
  assert.ok(r.ok, r.error);
  assert.equal(r.draft.parent.id, L.baseId, 'la candidata cuelga de la base actual');
  assert.equal(L.activeId, 'V0', 'crear la candidata no activa');
  assert.equal(L.version('V0').hash, hash0); assert.equal(JSON.stringify(L.version('V0').effective), snap0);
  assert.equal(L.upgradeCandidate(L.baseId).ok, false, 'una versión ya compatible no necesita candidata');
  const act = L.activate(L.baseId, 'prueba');
  assert.ok(act.ok); assert.equal(L.activeId, L.baseId); assert.equal(L.version('V0').hash, hash0);
});
