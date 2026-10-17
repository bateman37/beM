// MOTOR-15 bloque C: conservación esencial del mundo, trabajadores persistentes y controlador. Cuatro grupos de riesgo; las ejecuciones reales se reutilizan entre grupos.
//  1 · conservación esencial: mismo deporte (trayectoria, sorteos, acta) en completo/reducido/esencial; la huella incremental coincide; `none` se declara; la matriz de consultas existe.
//  2 · aislamiento y controlador: secuencial = 1/2/4 workers sobre las mismas entradas congeladas (trayectoria + acta + sorteos); el orden de terminación no importa; concurrencia automática.
//  3 · worker caído (interrupción INDUCIDA con trabajo real) y reintento explícito sin contar dos veces el caso.
//  4 · detener / continuar con concurrencia: no se despacha más, terminan los activos y la continuación reproduce lo mismo que una ejecución sin pausa.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { data } from './helpers.js';
import * as P from '../src/population/index.js';
import { buildMatchInput, createMatch, buildResult } from '../src/match/index.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';
import { TrajectoryObserver, INCREMENTAL_FP_VERSION } from '../src/batch/observer.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor, WorkerPool, autoConcurrency, detectCores } from '../src/batch/executors.js';
import { prepareBatch } from '../src/batch/schedule.js';
import { createEncounter } from '../src/engine/index.js';
import { sha256 } from '../src/batch/hashing.js';

const { profile, players } = data;
const root = mkdtempSync(join(tmpdir(), 'bem-m15c-'));
const store = new JobStore(root);
const pool = new WorkerPool({ store, size: 4 });
after(async () => { await pool.close(); rmSync(root, { recursive: true, force: true }); });
const teams = Object.fromEntries(['EQ03', 'EQ09', 'EQ04', 'EQ05', 'EQ07', 'EQ08'].map((id) => [id, P.referenceTeam(profile, players, id)]));
const PAIRS4 = [['EQ03', 'EQ09'], ['EQ04', 'EQ05'], ['EQ03', 'EQ04'], ['EQ09', 'EQ05']];
const spec = (over = {}) => ({ mode: 'pairs', pairs: PAIRS4, repetitions: 1, venue: 'fixed', batchSeed: 15001, teams, recordLevel: 'world-essential', variants: [{ id: 'V0' }], ...over });
const mk = (executor) => new BatchController({ store, executor });
// resumen comparable de un lote terminado: marcador, sorteos, huella y acta (sin identidades de lote/intento)
function summary(ctl, id) {
  const st = ctl.status(id, { rows: true });
  return st.matches.filter((m) => m.exec_state === 'terminada').map((m) => {
    const att = ctl.snapshot(id).info.get(m.match_id).canonical; const f = att.files.find((x) => x.stream === 'esencial');
    const rec = JSON.parse(readFileSync(join(store.dir(id), 'intentos', m.match_id, att.attempt_id, f.path), 'utf8'));
    return { match: m.match_id, seed: m.seed, score: [m.facts.score_home, m.facts.score_away], draws: m.facts.draws, fp: m.facts.trajectory_fp, acta: sha256(JSON.stringify(rec.acta)), seq: sha256(JSON.stringify(rec.sequence)), valid: m.valid };
  });
}
async function runBatch(executor, over = {}, runOpts = {}) {
  const ctl = mk(executor); const cr = ctl.create(spec(over), profile, { players }); assert.ok(cr.ok, JSON.stringify(cr.problems));
  const run = await ctl.run(cr.batchId, runOpts); const end = await run.done; return { ctl, id: cr.batchId, end };
}
let SEQ; // referencia secuencial (hilo principal) reutilizada por los grupos 2–4
const seqRef = async () => (SEQ ??= await runBatch(new InlineExecutor({ store })));

// ---------------------------------------------------------------------------------------------------------------------------------------------
test('M15C·1 conservación esencial: mismo deporte que completo y reducido; huella incremental declarada; matriz publicada', () => {
  for (const seed of [20261016, 151002]) {
    const input = buildMatchInput(profile, players, { seed }); const run = (detail, obs) => { const m = createMatch(input, profile, { detail }); while (m.step()) if (obs) obs.consume(m.events); return { m, res: buildResult(m), obs: obs?.finish(m) }; };
    const full = run('full', new TrajectoryObserver()); const min = run('minimal', new TrajectoryObserver());
    assert.equal(trajectoryFingerprint(full.res), trajectoryFingerprint(min.res), 'trayectoria TRAY-MOTOR12 idéntica con detalle completo y mínimo');
    assert.equal(full.res.diagnostics.sportingDraws, min.res.diagnostics.sportingDraws);
    assert.deepEqual(full.res.acta.score, min.res.acta.score);
    assert.equal(full.obs.sha256, min.obs.sha256, 'la huella incremental no depende del detalle'); assert.equal(min.obs.version, INCREMENTAL_FP_VERSION);
    // fachada: nivel esencial = mismo deporte; la huella se calcula solo si se pidió
    const enc = createEncounter({ input, profile, level: 'world-essential', observeTrajectory: true }); enc.advance({ until: 'end' }); const rec = enc.essential();
    assert.equal(rec.integrity.trajectory_fp, min.obs.sha256); assert.equal(rec.integrity.trajectory_fp_mode, 'incremental'); assert.deepEqual(rec.result.court_score, min.res.score);
    assert.equal(rec.integrity.sporting_draws, min.res.diagnostics.sportingDraws); assert.equal(rec.validity.valid, true);
    const enc2 = createEncounter({ input, profile, level: 'world-essential' }); enc2.advance({ until: 'end' }); const rec2 = enc2.essential();
    assert.equal(rec2.integrity.trajectory_fp, null); assert.equal(rec2.integrity.trajectory_fp_mode, 'none', 'una huella no calculada se declara como tal');
    assert.equal(rec2.integrity.sequence, undefined);
    assert.ok(rec.sequence.rows.length === min.res.events.length && rec.shots.rows.length > 0 && rec.acta.players.length === 24 && rec.presence.intervals.length > 0 && !('calc' in rec));
  }
  const matrix = JSON.parse(readFileSync(new URL('../data/batch/matriz-consultas-motor15.json', import.meta.url), 'utf8'));
  assert.ok(matrix.queries.length >= 20 && matrix.queries.every((q) => q.availability['world-essential'] && q.availability.diagnostic && q.availability.reduced));
  assert.match(matrix.queries.find((q) => q.id === 'Q12').availability['world-essential'], /conservado por fila/, 'el cruce jugador×defensa no se ofrece con marginales');
});

test('M15C·2 aislamiento y controlador: secuencial = 1/2/4 workers sobre las mismas entradas congeladas (trayectoria, acta, sorteos)', async () => {
  const ref = await seqRef(); assert.equal(ref.end.state, 'completado'); const base = summary(ref.ctl, ref.id);
  assert.equal(base.length, 4); assert.ok(base.every((x) => x.valid && x.fp && x.draws > 1000));
  for (const c of [1, 2, 4]) {
    const r = await runBatch(pool, { concurrency: c }); assert.equal(r.end.state, 'completado'); assert.equal(r.end.concurrency.effective, c);
    assert.deepEqual(summary(r.ctl, r.id), base, `concurrencia ${c}: mismo marcador, sorteos, huella, acta y secuencia que la ejecución secuencial`);
  }
  // el orden de finalización no importa: los resultados se identifican por agenda, no por llegada (la referencia tiene el mismo resumen aunque con 4 workers terminen en otro orden)
  const idxOrder = (ctl, id) => ctl.store.readIndex(id).filter((r) => r.type === 'attempt').map((r) => r.match_id);
  const r4 = await runBatch(pool, { concurrency: 4, batchSeed: 15002 }); const order = idxOrder(r4.ctl, r4.id); assert.equal(new Set(order).size, 4);
  const sorted = summary(r4.ctl, r4.id).map((x) => x.match); assert.deepEqual(sorted, ['M000001', 'M000002', 'M000003', 'M000004'], 'vistas ordenadas por la agenda, no por el primer worker en terminar');
  // concurrencia automática = max(1, min(4, núcleos − 1)) con respaldo declarado
  assert.deepEqual([1, 2, 4, 5, 8, 64].map((n) => autoConcurrency(n)), [1, 1, 3, 4, 4, 4]); assert.ok(detectCores().cores >= 1 && detectCores().via);
  assert.equal(prepareBatch(spec({ concurrency: 3 }), profile, { players }).ok, false); for (const c of [1, 2, 4, 'auto']) assert.ok(prepareBatch(spec({ concurrency: c }), profile, { players }).ok, `concurrencia ${c}`);
  const auto = await runBatch(pool, { concurrency: 'auto', batchSeed: 15003 }); assert.equal(auto.end.concurrency.effective, Math.min(autoConcurrency(), 4)); assert.match(auto.end.concurrency.source, /automática/);
  // los workers son persistentes: no se crea uno por partido (en total hubo ≤ 4 hilos, cada uno levantado una vez)
  assert.ok(pool.stats().every((w) => w.spawned <= 1), `workers levantados: ${JSON.stringify(pool.stats())}`);
});

test('M15C·3 worker caído (interrupción INDUCIDA con trabajo real): intento fallido sin marcador ni derrota, el resto conserva resultados y el reintento no cuenta dos veces el caso', async () => {
  const ref = await seqRef(); const base = summary(ref.ctl, ref.id);
  const ctl = mk(pool); const cr = ctl.create(spec({ concurrency: 2 }), profile, { players }); assert.ok(cr.ok);
  const run = await ctl.run(cr.batchId, { induce: { match_id: 'M000002', after_ms: 120 } }); const end = await run.done;
  assert.equal(end.state, 'completado', 'un worker caído no detiene el lote');
  const st = ctl.status(cr.batchId, { rows: true }); assert.equal(st.counters.terminados, 3); assert.equal(st.counters.fallidos, 1);
  const bad = st.matches.find((m) => m.match_id === 'M000002'); assert.equal(bad.exec_state, 'fallida'); assert.equal(bad.valid, false); assert.equal(bad.facts?.score_home ?? null, null, 'sin marcador'); assert.equal(bad.facts?.winner ?? null, null, 'sin derrota ni victoria');
  const att = ctl.snapshot(cr.batchId).info.get('M000002').attempts[0]; assert.equal(att.error.induced, true); assert.match(att.exclusion_reason, /inducida/); assert.equal(att.error.phase, 'proceso');
  assert.deepEqual(summary2(ctl, cr.batchId, ['M000001', 'M000003', 'M000004']), base.filter((x) => x.match !== 'M000002').map((x) => ({ match: x.match, score: x.score, fp: x.fp })), 'los demás partidos conservan exactamente sus resultados');
  // reintento explícito: misma entrada y semilla, intento nuevo (A2); el caso cuenta una sola vez
  assert.ok(ctl.retry(cr.batchId, ['M000002']).ok); const again = await (await ctl.run(cr.batchId, { concurrency: 2 })).done; assert.equal(again.state, 'completado');
  const st2 = ctl.status(cr.batchId, { rows: true }); assert.equal(st2.counters.terminados, 4); assert.equal(st2.counters.solicitados, 4); assert.equal(st2.counters.intentos, 5); assert.equal(st2.counters.reintentados, 1);
  const m2 = ctl.snapshot(cr.batchId).info.get('M000002'); assert.deepEqual(m2.attempts.map((a) => a.attempt_id), ['M000002-A1', 'M000002-A2']); assert.equal(m2.canonical.attempt_id, 'M000002-A2');
  const retried = summary(ctl, cr.batchId).find((x) => x.match === 'M000002'); assert.deepEqual([retried.score, retried.fp, retried.acta], [base[1].score, base[1].fp, base[1].acta], 'el reintento reproduce el resultado de la referencia');
  assert.ok(pool.stats().some((w) => w.spawned >= 2), 'el worker caído se volvió a levantar para el trabajo siguiente');
});
function summary2(ctl, id, matches) { return summary(ctl, id).filter((x) => matches.includes(x.match)).map((x) => ({ match: x.match, score: x.score, fp: x.fp })); }

test('M15C·4 detener y continuar con concurrencia: no se despacha más, terminan los activos y la continuación reproduce una ejecución sin pausa', async () => {
  const big = { pairs: [...PAIRS4, ['EQ07', 'EQ08'], ['EQ03', 'EQ05']], concurrency: 2, batchSeed: 15005 };
  const refAll = await runBatch(new InlineExecutor({ store }), { ...big, concurrency: 1 }); const base = summary(refAll.ctl, refAll.id);
  const ctl = mk(pool); const cr = ctl.create(spec(big), profile, { players }); assert.ok(cr.ok);
  const run = await ctl.run(cr.batchId); let seen = 0;
  for (let i = 0; i < 400 && seen < 2; i++) { await new Promise((r) => setTimeout(r, 15)); seen = ctl.status(cr.batchId).active_count; }
  assert.equal(seen, 2, 'con concurrencia 2 hay dos partidos activos a la vez'); assert.ok(ctl.requestStop(cr.batchId).ok);
  const end = await run.done; assert.equal(end.state, 'detenido'); const c = ctl.status(cr.batchId).counters;
  assert.equal(c.en_curso, 0, 'terminaron los activos, ninguno queda a medias'); assert.ok(c.terminados >= 2 && c.terminados < 6 && c.pendientes > 0 && c.fallidos === 0, JSON.stringify(c));
  assert.equal(ctl.status(cr.batchId).active_count, 0);
  const cont = await (await ctl.run(cr.batchId)).done; assert.equal(cont.state, 'completado');
  assert.deepEqual(summary(ctl, cr.batchId), base, 'detener/continuar no cambia ningún resultado respecto a una ejecución secuencial completa');
  assert.equal(ctl.status(cr.batchId).counters.intentos, 6, 'ningún partido se ejecutó dos veces');
});
