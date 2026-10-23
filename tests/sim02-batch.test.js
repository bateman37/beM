// SIM-MOTOR-02: lotes persistentes (§8.2). Un lote real con trabajadores se interrumpe de verdad (SIGKILL del proceso), se recupera desde el índice durable y se continúa sin duplicar resultados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { data } from './helpers.js';
import { makeContext } from '../src/sim/index.js';
import { referenceTeamMap, buildPairInput } from '../src/sim/teams.js';
import { buildBatch, validateBatchSpec } from '../src/simbatch/schedule.js';
import { SimBatchRunner, foldIndex } from '../src/simbatch/runner.js';
import { runCase } from '../src/sim/cases.js';

const { profile, players } = data; const ctx = makeContext(profile); const teamMap = referenceTeamMap(profile, players);
const tmp = () => mkdtempSync(join(tmpdir(), 'simbatch-'));
const spec = { kind: 'crossings', master: 20261022, rounds: 2, teams: ['EQ01', 'EQ02', 'EQ03', 'EQ04', 'EQ05'], importance: 'ordinary' };

test('S02-09 agendas SIM: repetir, cruces, pares y variantes con diferencias visibles; semillas congeladas, identidades estables y especificaciones no válidas rechazadas', () => {
  const rep = buildBatch({ kind: 'repeat', master: 7, a: 'EQ01', b: 'EQ02', count: 5 }); assert.equal(rep.cases.length, 5); assert.equal(new Set(rep.cases.map((c) => c.seed)).size, 5); assert.ok(rep.cases.every((c) => c.id.startsWith(rep.id)));
  assert.deepEqual(buildBatch({ kind: 'repeat', master: 7, a: 'EQ01', b: 'EQ02', count: 5 }).cases.map((c) => [c.id, c.seed]), rep.cases.map((c) => [c.id, c.seed]), 'determinista: semillas congeladas');
  const cr = buildBatch(spec); assert.equal(cr.cases.length, 40); const pr = buildBatch({ kind: 'pairs', master: 7, pairs: [['EQ01', 'EQ02'], ['EQ03', 'EQ04']], rounds: 3 }); assert.equal(pr.cases.length, 6);
  const va = buildBatch({ kind: 'variants', master: 9, a: 'EQ03', b: 'EQ04', count: 2, variants: [{ id: 'V-base', patch: { 0: { midrange: 'avoid' } } }, { id: 'V-medio', patch: { 0: { midrange: 'seek' } } }] }); assert.equal(va.cases.length, 4); assert.deepEqual(va.cases.map((c) => c.variant), ['V-base', 'V-medio', 'V-base', 'V-medio']);
  const r = va.cases.slice(0, 2).map((c) => runCase(ctx, teamMap, { ...c, essential: true })); assert.notEqual(r[0].inputFp, r[1].inputFp, 'una variante cambia la entrada efectiva (diferencias visibles)'); assert.ok(r.every((x) => x.valid && x.ess.complete));
  assert.ok(validateBatchSpec({ kind: 'variants', master: 1, a: 'EQ01', b: 'EQ02', count: 2, variants: [{ id: 'x' }] }).length >= 1); assert.throws(() => buildBatch({ kind: 'nope', master: 1 }), /no válido/); assert.ok(validateBatchSpec({ kind: 'pairs', master: 1, pairs: [['EQ01', 'EQ99']], rounds: 1 }).length >= 1);
});

test('S02-10 lote real interrumpido con SIGKILL: recuperación desde el índice, reintento desde el inicio y un único resultado aceptado por caso', async () => {
  const root = tmp(); process.env.BEM_SIM_BATCH_ROOT = root; const specPath = join(root, 'spec.json'); const fs = await import('node:fs'); fs.writeFileSync(specPath, JSON.stringify(spec));
  const runner = new SimBatchRunner({ ctx, teamMap, root, inline: true }); const id = runner.create(spec); const agenda = runner.agenda(id); assert.equal(agenda.cases.length, 40);
  const child = spawn(process.execPath, ['scripts/sim-batch.js', 'run', id, '--workers=2', '--chunk=1'], { cwd: new URL('..', import.meta.url).pathname, env: { ...process.env, BEM_SIM_BATCH_ROOT: root }, stdio: ['ignore', 'pipe', 'pipe'] });
  const idxPath = join(root, id, 'indice.jsonl'); const doneCount = () => (existsSync(idxPath) ? readFileSync(idxPath, 'utf8').split('\n').filter((l) => l.includes('"t":"done"')).length : 0);
  const killed = await new Promise((resolve) => { const iv = setInterval(() => { if (doneCount() >= 8) { clearInterval(iv); child.kill('SIGKILL'); resolve(true); } }, 10); child.on('exit', () => { clearInterval(iv); resolve(false); }); });
  await new Promise((r) => { if (child.exitCode != null || child.signalCode) r(); else child.on('exit', r); }); assert.ok(killed, 'el proceso se interrumpió con trabajo real en curso');
  const before = runner.status(id); assert.ok(before.accepted >= 8 && before.accepted < 40, `parcial: ${before.accepted}/40`);
  // cada «terminado» confirmado tiene su archivo con la suma correcta (el archivo se escribe ANTES de anotar el índice)
  for (const [caseId, c] of runner.state(id)) if (c.accepted) { const rr = runner.store.readResult(id, c.accepted); assert.ok(rr?.ok, `archivo de ${caseId} confirmado y completo`); }
  const rec = runner.recover(id); assert.equal(rec.inconsistent, 0); assert.ok(rec.status.running === 0, 'ningún intento queda «en curso» tras recuperar'); const after = await runner.run(id, {}); assert.equal(after.status.complete, true); assert.equal(after.status.duplicates, 0);
  const st = runner.state(id); let retried = 0; for (const c of agenda.cases) { const s = st.get(c.id); assert.ok(s.accepted, `${c.id} con resultado aceptado`); const attempts = [...s.attempts.entries()]; if (attempts.length > 1) { retried++; assert.ok(attempts.some(([, a]) => a.status === 'interrupted'), 'el intento anterior se conserva como interrumpido'); assert.equal(s.accepted.attempt, Math.max(...s.attempts.keys()), 'nuevo intento técnico distinto'); } assert.equal([...s.attempts.values()].filter((a) => a.status === 'done').length, 1, 'un único resultado aceptado por caso'); }
  // el reintento reproduce la misma entrada y semilla: el resultado aceptado coincide con el de una ejecución limpia
  const clean = runCase(ctx, teamMap, { ...agenda.cases[3], essential: true }); const opened = runner.open(id, agenda.cases[3].id); assert.equal(opened.essential.identity.sportFingerprint, clean.ess.identity.sportFingerprint); assert.deepEqual(opened.essential.score.final, clean.score);
  console.log(`SIM02_LOTE_REAL ${JSON.stringify({ total: 40, antesDeInterrumpir: before.accepted, reintentados: retried, interrumpidos: rec.interrupted })}`);
  // un intento fallido no tiene marcador definitivo ni resultado aceptado; el reintento usa un intento nuevo
  const id2 = runner.create({ kind: 'repeat', master: 3, a: 'EQ01', b: 'EQ02', count: 2 }); const c0 = runner.agenda(id2).cases[0]; runner.store.start(id2, c0.id, 1, {}); runner.store.fail(id2, c0.id, 1, 'fallo técnico simulado'); assert.equal(runner.open(id2, c0.id).ok, false); assert.equal(runner.status(id2).failed, 1);
  const done2 = await runner.run(id2, {}); assert.equal(done2.status.complete, true); assert.equal(runner.state(id2).get(c0.id).accepted.attempt, 2);
  // resultado duplicado para el mismo caso lógico: se conserva el aceptado, no se cuenta otra vez
  const dupRec = runner.state(id2).get(c0.id).accepted; runner.store.appendIndex(id2, { ...dupRec, attempt: 3 }); const f = foldIndex(runner.store.readIndex(id2)).get(c0.id); assert.equal(f.accepted.attempt, 2); assert.equal(f.duplicates, 1); assert.equal(runner.status(id2).accepted, 2);
  rmSync(root, { recursive: true, force: true });
});

test('S02-10b detener al terminar los encuentros en curso, continuar y abrir el análisis conservado', async () => {
  const root = tmp(); const runner = new SimBatchRunner({ ctx, teamMap, root, workers: 2, chunk: 1, retention: 'analysis' }); const id = runner.create({ kind: 'pairs', master: 11, pairs: [['EQ06', 'EQ07'], ['EQ08', 'EQ09']], rounds: 6 });
  try { const iv = setInterval(() => { if (runner.status(id).accepted >= 1) { clearInterval(iv); runner.stop(); } }, 5); const r1 = await runner.run(id, {}); clearInterval(iv); /* parar tras el primer resultado confirmado (no por reloj: la carga de la máquina no debe decidir la prueba) */ const s1 = runner.status(id); assert.ok(s1.accepted >= 1 && s1.accepted < 12, `parada con ${s1.accepted}/12`); assert.equal(s1.running, 0, 'los encuentros en curso terminaron y se confirmaron'); void r1;
    const r2 = await runner.run(id, {}); assert.equal(r2.status.complete, true); const c = runner.agenda(id).cases[0]; const o = runner.open(id, c.id); assert.equal(o.retention, 'analysis'); assert.ok(o.analysis.box.players.length >= 20 && o.analysis.events === undefined, 'el análisis conservado no incluye la secuencia completa'); assert.equal(o.analysis.reconciliation, undefined);
    // alterar el archivo de un resultado aceptado: se detecta al abrir y al recuperar
    const acc = runner.state(id).get(c.id).accepted; const p = join(root, id, acc.file); const txt = readFileSync(p, 'utf8'); (await import('node:fs')).writeFileSync(p, txt.replace('"valid":true', '"valid":false')); assert.equal(runner.open(id, c.id).ok, false); const rec = runner.recover(id); assert.equal(rec.inconsistent, 1);
  } finally { await runner.close(); rmSync(root, { recursive: true, force: true }); }
});
