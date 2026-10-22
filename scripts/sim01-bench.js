// Medición real de rendimiento de SIM-MOTOR-01 (§9). Una invocación = un proceso nuevo.
//   node scripts/sim01-bench.js --mode=B01 [--out=out/sim-motor01/bench]       un worker, 1.000 partidos
//   node scripts/sim01-bench.js --mode=B02-B03 [--out=...]                     cuatro workers: B02 (proceso nuevo) y, sin cerrar el pool, B03 (workers ya iniciados y contexto reutilizable)
// Cronómetros (reloj monotónico `performance.now()` desde el origen del proceso). OBJETIVO = solicitud de `pool.run` → todos los resúmenes compactos en poder del coordinador, con workers listos
// (incluye despacho, generación, construcción de resultado, conciliación e invariantes y comunicación). El arranque en frío, preparación, serialización y escritura se muestran aparte.
import { writeFileSync, mkdirSync } from 'node:fs';
import { cpus, totalmem, release, platform, arch, availableParallelism } from 'node:os';
import { execSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import { makeContext, contextToJSON } from '../src/sim/context.js';
import { referenceTeamMap } from '../src/sim/teams.js';
import { buildAgenda } from '../src/sim/schedule.js';
import { SimPool } from '../src/sim/pool.js';
import { fpString } from '../src/sim/fp.js';
import { SIM_VERSION, SIM_PROFILE_ID, SIM_MASTER_SEED } from '../src/sim/version.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const mode = arg('mode', 'B02-B03'); const outDir = arg('out', 'out/sim-motor01/bench'); mkdirSync(outDir, { recursive: true });
const now = () => performance.now();
const tImports = now();
const rssSamples = []; const sampler = setInterval(() => rssSamples.push(process.memoryUsage().rss), 25); sampler.unref();
const OBJECTIVE_MS = 5000; const N = 1000;

let commit = 'desconocido'; let dirty = null; try { commit = execSync('git rev-parse HEAD', { cwd: new URL('..', import.meta.url).pathname }).toString().trim(); dirty = execSync('git status --porcelain', { cwd: new URL('..', import.meta.url).pathname }).toString().trim().length > 0; } catch { /* sin git */ }
const env = { node: process.version, platform: platform(), arch: arch(), kernel: release(), cpuModel: cpus()[0]?.model, logicalCpus: cpus().length, availableParallelism: availableParallelism(), ramMiB: Math.round(totalmem() / 2 ** 20), commit, workingTreeDirty: dirty, sim: SIM_VERSION, simProfile: SIM_PROFILE_ID };

const t0 = now();
const { profile, players } = loadData(); const tData = now();
const ctx = makeContext(profile); const teams = referenceTeamMap(profile, players); const ctxJSON = contextToJSON(ctx); const tCtx = now();
const agenda = buildAgenda({ master: SIM_MASTER_SEED }); const agendaFp = fpString(JSON.stringify(agenda));
const WARM_PAIRS = [['EQ01', 'EQ02'], ['EQ03', 'EQ03'], ['EQ05', 'EQ09'], ['EQ10', 'EQ07'], ['EQ12', 'EQ04'], ['EQ08', 'EQ06']];
const warm = Array.from({ length: 12 }, (_, i) => ({ n: -(i + 1), id: `WARM-${i + 1}`, a: WARM_PAIRS[i % 6][0], b: WARM_PAIRS[i % 6][1], seed: 11 + i }));

const pct = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
async function execute(run, pool, startInfo) {
  const tReq = now(); const r = await pool.run(agenda, { chunk: 5 }); const tDone = now();
  const results = r.results; const tSer0 = now(); const json = JSON.stringify(results); const tSer1 = now(); const gz = gzipSync(Buffer.from(json)).length;
  const lat = results.map((x) => x.ms.input + x.ms.gen + x.ms.build + x.ms.recon);
  const finished = results.filter((x) => x.status === 'finished'); const valid = results.filter((x) => x.valid);
  const rec = {
    run, workers: pool.size, workersRequested: pool.requested, process: startInfo.fresh ? 'nuevo' : 'reutilizado', agendaFingerprint: agendaFp, cases: results.length, env,
    definitions: { objective: 'solicitud de pool.run → resúmenes compactos de los 1.000 casos en poder del coordinador, con workers listos (despacho + generación + resultado + conciliación + comunicación)', latency: 'por partido en el worker: preparar entrada + generar + construir resultado + conciliar (sin cola)', rss: 'RSS del proceso (todos los hilos comparten el espacio de direcciones): máximo muestreado cada 25 ms y maxRSS de getrusage; no se suma por worker', warmup: `${warm.length} partidos de calentamiento fuera de la agenda en la inicialización de cada worker (incluidos en workersStartMs)` },
    timeline: { processToImportsMs: tImports, dataLoadMs: tData - t0, contextAndTeamsMs: tCtx - tData, workersStartMs: startInfo.startMs, workerWarmMs: startInfo.warmMs, requestMs: tReq, objectiveMs: tDone - tReq, serializeMs: tSer1 - tSer0, writeMs: null, totalFromProcessStartMs: null },
    objective: { targetMs: OBJECTIVE_MS, measuredMs: tDone - tReq, met: tDone - tReq <= OBJECTIVE_MS },
    throughputPerSecond: results.length / ((tDone - tReq) / 1000),
    latencyMs: { mean: lat.reduce((a, b) => a + b, 0) / lat.length, p50: pct(lat, 0.5), p95: pct(lat, 0.95), max: Math.max(...lat), n: lat.length },
    phaseMeanMs: Object.fromEntries(['input', 'gen', 'build', 'recon'].map((k) => [k, results.reduce((a, x) => a + x.ms[k], 0) / results.length])),
    workerBusyMs: r.workerMs, casesPerWorker: r.perWorkerCases,
    counts: { requested: agenda.length, attempts: results.reduce((a, x) => a + (x.attempts ?? 1), 0), finished: finished.length, valid: valid.length, invalid: finished.length - valid.length, failed: results.length - finished.length, retries: 0, overtimes: results.reduce((a, x) => a + (x.overtimes ?? 0), 0) },
    bytes: { resultsJson: Buffer.byteLength(json), resultsJsonGzip: gz, bytesPerMatch: Buffer.byteLength(json) / results.length },
  };
  return { rec, results };
}
const save = (rec, results, tStartProc) => { const tW0 = now(); const file = join(outDir, `${rec.run}.json`); writeFileSync(file, JSON.stringify({ ...rec, results })); rec.timeline.writeMs = now() - tW0; rec.timeline.totalFromProcessStartMs = now(); rec.memory = { rssPeakSampledMiB: Math.max(...rssSamples) / 2 ** 20, maxRssMiB: process.resourceUsage().maxRSS / 1024, samplePeriodMs: 25, samples: rssSamples.length }; writeFileSync(file, JSON.stringify({ ...rec, results })); void tStartProc; console.log(`${rec.run}: ${rec.workers} worker(s) · objetivo ${rec.objective.measuredMs.toFixed(0)} ms (${rec.objective.met ? 'ALCANZADO' : 'NO alcanzado'} frente a ${OBJECTIVE_MS} ms) · válidos ${rec.counts.valid}/${rec.counts.requested} · fallidos ${rec.counts.failed} · inválidos ${rec.counts.invalid} · ${rec.throughputPerSecond.toFixed(0)} partidos/s · RSS máx ${rec.memory.maxRssMiB.toFixed(0)} MiB · arranque ${rec.timeline.workersStartMs.toFixed(0)} ms · total desde inicio ${rec.timeline.totalFromProcessStartMs.toFixed(0)} ms → ${file}`); };

if (mode === 'B01') {
  const pool = new SimPool({ workers: 1 }); const startMs = await pool.start(ctxJSON, ctx.sp.fingerprint, teams, warm);
  const { rec, results } = await execute('B01', pool, { fresh: true, startMs, warmMs: Math.max(...pool.readyInfo.map((x) => x.warmMs)) }); save(rec, results); await pool.close();
} else if (mode === 'B02-B03') {
  const pool = new SimPool({ workers: 4 }); const startMs = await pool.start(ctxJSON, ctx.sp.fingerprint, teams, warm);
  const si = { fresh: true, startMs, warmMs: Math.max(...pool.readyInfo.map((x) => x.warmMs)) };
  const b2 = await execute('B02', pool, si); save(b2.rec, b2.results);
  const b3 = await execute('B03', pool, { fresh: false, startMs: 0, warmMs: 0 }); b3.rec.timeline.workersStartMs = 0; save(b3.rec, b3.results); await pool.close();
} else { console.error('modo no reconocido'); process.exit(2); }
clearInterval(sampler); process.exit(0);
