// SIM-MOTOR-03 §8: sondas de capacidades y cobertura de controles (magnitudes puras, sin azar). Pocas pruebas por propiedad.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext } from '../src/sim/context.js';
import { buildReferenceInput } from '../src/sim/teams.js';
import { CAPABILITIES } from '../src/sim/capabilities.js';
import { buildCapabilityMatrix, buildControlCoverage, applyBump, exposureRules, exposureMeta, FAMILY_OF_PLAY, SITUATIONS, toCsv, capabilityCsvRows } from '../scripts/sim03/probes.js';

const { profile, players } = data; const ctx = makeContext(profile); const args = { ctx, profile, players };
const cap = buildCapabilityMatrix(args);

test('S03P-01 determinismo: dos ejecuciones producen exactamente los mismos productos', () => {
  assert.deepEqual(buildCapabilityMatrix(args), cap);
  assert.deepEqual(buildControlCoverage(args), buildControlCoverage(args));
  assert.equal(new Set(cap.bases.map((b) => b.huella)).size, SITUATIONS.length, 'cada situación tiene su entrada base identificada');
});

test('S03P-02 las 32 capacidades aparecen en las 8 situaciones, pertinentes o con motivo explícito', () => {
  assert.equal(CAPABILITIES.length, 32); assert.equal(SITUATIONS.length, 8);
  for (const c of CAPABILITIES) for (const s of SITUATIONS) {
    const rs = cap.rows.filter((r) => r.codigo === c.id && r.situacion === s.id); assert.deepEqual(rs.map((r) => r.cambio_solicitado), [1, 3, 5], `${c.id}/${s.id}`);
    for (const r of rs) { assert.ok(r.pertinente || r.motivo_no_pertinencia, `${c.id}/${s.id} sin motivo`); assert.ok(['cálculo_fijo', 'no_expuesto', 'no_instrumentado'].includes(r.evidence)); }
  }
});

test('S03P-03 ningún incremento supera 30 y un tope se registra como parcial', () => {
  for (const r of cap.rows) { assert.ok(r.nivel_base + r.cambio_aplicado <= 30, `${r.codigo}/${r.situacion}`); assert.equal(r.tope_parcial, r.cambio_aplicado !== r.cambio_solicitado); assert.equal(r.limite_alcanzado, r.nivel_base + r.cambio_solicitado > 30); }
  assert.ok(cap.rows.some((r) => r.tope_parcial), 'las bases reales incluyen al menos un tope');
  const inp = buildReferenceInput(profile, players, 'EQ03', 'EQ04', { seed: 1 }); const id = inp.teams[0].players[0].id; inp.teams[0].players[0].abilities.TEC01 = 28;
  const b = applyBump(inp, id, 'TEC01', 5); assert.deepEqual([b.base, b.requested, b.applied, b.limitReached, b.partial], [28, 5, 2, true, true]); assert.equal(b.input.teams[0].players[0].abilities.TEC01, 30); assert.equal(inp.teams[0].players[0].abilities.TEC01, 28, 'la entrada no se modifica');
  const z = applyBump(inp, id, 'TEC02', 5); assert.equal(z.partial, false);
});

test('S03P-04 las filas sin efecto conservan su causa; las que cambian registran antes/después y compensación', () => {
  const none = cap.rows.filter((r) => r.n_cambian === 0); assert.ok(none.length > 0);
  for (const r of none) { assert.ok(r.causa_sin_efecto && r.causa_sin_efecto.length > 10, `${r.codigo}/${r.situacion}`); assert.notEqual(r.evidence, 'cálculo_fijo'); }
  for (const r of cap.rows.filter((x) => x.n_cambian > 0)) { assert.equal(r.evidence, 'cálculo_fijo'); assert.equal(r.cambios.length, r.n_cambian); assert.ok(r.cambios.every((x) => x.delta !== 0)); }
  const tec01 = cap.rows.find((r) => r.codigo === 'TEC01' && r.situacion === 'S1' && r.cambio_solicitado === 5); assert.ok(tec01.n_suben > 0 && tec01.n_bajan > 0, 'se registra la compensación real, no una mejora universal');
  assert.ok(capabilityCsvRows(cap.rows.slice(0, 3)).length === 3 && toCsv([{ a: 'x,"y"', b: 1 }], ['a', 'b']) === 'a,b\n"x,""y""",1\n');
});

test('S03P-05 exposureRules devuelve null ante campos ausentes y es coherente con el catálogo de fichas', () => {
  for (const [id, f] of Object.entries(exposureRules)) { if (/no representado/.test(exposureMeta[id].nota)) { assert.equal(f({}), 0, id); continue; } assert.equal(f({}), null, id); assert.equal(f({ essential: {} }), null, id); }
  for (const [id, p] of Object.entries(ctx.T.plays)) assert.equal(FAMILY_OF_PLAY[id], p.family, id);
  const rec = { essential: { box: { players: [{ team: 0, zones: { three: [4, 2, 0, 0, 0] }, fta: 2 }] } } }; assert.equal(exposureRules.TEC01(rec), 4); assert.equal(exposureRules.TEC05(rec), 2); assert.equal(exposureRules.TEC09({ analysis: { participation: [{}, {}] } }), null);
  const ctl = buildControlCoverage(args); for (const r of ctl.rows) assert.ok(['representado', 'aproximado', 'no_representado'].includes(r.estado), r.id); assert.ok(ctl.rows.length >= 50);
});
