// MOTOR-18 · campaña: la congelación (sin simular) expresa cada contraste solo como cambio de conocimiento y conserva los bloques nuevos tal cual en las entradas congeladas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (out, version, only) => execFileSync('node', [join(ROOT, 'scripts/m18-campaign.js'), 'create', `--version=${version}`, `--tree=${ROOT}`, `--out=${out}`, `--only=${only}`], { encoding: 'utf8' });
const J = (p) => JSON.parse(readFileSync(p, 'utf8'));

test('B01 se congela con dos variantes K8/K28 que solo cambian el conocimiento contrastado y conservan los bloques nuevos', () => {
  const out = mkdtempSync(join(tmpdir(), 'm18-camp-'));
  try {
    run(out, 'M18', 'B01');
    const plan = J(join(out, 'plan', 'lotes-M18.json')); assert.equal(plan.lots.length, 1); const lot = plan.lots[0]; assert.equal(lot.executions, 2); assert.deepEqual(lot.case_seeds, [383000001]);
    const dir = join(out, 'lotes', 'M18', lot.batch_id); const lote = J(join(dir, 'entradas/lote.json')); assert.deepEqual(lote.agenda.map((e) => e.variant_id), ['K8', 'K28']); assert.equal(new Set(lote.agenda.map((e) => e.seed)).size, 1);
    const variantes = J(join(dir, 'entradas/variantes.json')); const diffs = variantes.variants.flatMap((v) => v.diff.flatMap((d) => d.changes ?? []));
    assert.ok(diffs.length > 0 && diffs.every((c) => c.campo === 'knowledge'), 'solo cambia `knowledge`');
    const eq = readdirSync(join(dir, 'entradas/equipos')).map((f) => J(join(dir, 'entradas/equipos', f)));
    assert.ok(eq.some((t) => t.coachLearning?.teaching === 16 && t.players.every((p) => p.development?.tacticalLearning === 16 && p.knowledge?.mode === 'explicit')), 'los bloques nuevos viajan en la entrada congelada');
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test('el control recibe la misma entrada deportiva sin los bloques nuevos (entrada /6)', () => {
  const out = mkdtempSync(join(tmpdir(), 'm18-ctl-'));
  try {
    execFileSync('node', [join(ROOT, 'scripts/m18-campaign.js'), 'create', '--version=CONTROL17B', `--tree=${process.env.M18_CONTROL ?? '/home/user/control17b'}`, `--out=${out}`, '--only=A02'], { encoding: 'utf8' });
    const plan = J(join(out, 'plan', 'lotes-CONTROL17B.json')); const lot = plan.lots[0]; const dir = join(out, 'lotes', 'CONTROL17B', lot.batch_id);
    const entry = J(join(dir, 'entradas/partidos', readdirSync(join(dir, 'entradas/partidos'))[0])); assert.equal(entry.input_schema, 'beM-match-input/6');
    for (const f of readdirSync(join(dir, 'entradas/equipos'))) { const t = J(join(dir, 'entradas/equipos', f)); assert.equal(t.coachLearning, undefined); assert.ok(t.players.every((p) => p.knowledge === undefined && p.development === undefined)); }
  } finally { rmSync(out, { recursive: true, force: true }); }
});
