// Medición real de rendimiento de SIM-MOTOR-02 (§11). Una invocación = un proceso nuevo.
//   node scripts/sim02-bench.js --mode=F-C [--out=out/sim-motor02/bench]   P02-F (proceso nuevo, cuatro workers, 1.000 partidos) + P02-C1/C2/C3 (tres pasadas calientes de los mismos 1.000 casos, generación real en cada
//                                                                          una) + muestra de 64 casos con un worker + coste de retención por nivel
//   node scripts/sim02-bench.js --mode=DAY [--out=...]                     jornada grande solo SIM de 1.000 encuentros a igual hora virtual con barreras comunes y política (sin tarjetas ni mil workers) + jornada mixta
// OBJETIVO (límite operativo de 01): solicitud de `pool.run` con workers listos → ACTAS ESENCIALES INDIVIDUALES de los 1.000 casos en poder del coordinador (generación, construcción de los datos estadísticos
// comprometidos, validación y comunicación). Serialización, persistencia y disponibilidad para el mundo se miden como FASES ADICIONALES identificadas. El tiempo de pared no se sustituye por tiempo dentro de workers.
import { writeFileSync, mkdirSync, openSync, writeSync, fsyncSync, closeSync, statSync, rmSync } from 'node:fs';
import { cpus, totalmem, release, platform, arch, availableParallelism } from 'node:os';
import { execSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import { makeContext, contextToJSON } from '../src/sim/context.js';
import { referenceTeamMap } from '../src/sim/teams.js';
import { buildAgenda } from '../src/sim/schedule.js';
import { SimPool } from '../src/sim/pool.js';
import { runCase } from '../src/sim/cases.js';
import { fpString } from '../src/sim/fp.js';
import { SIM_VERSION, SIM_PROFILE_ID, SIM_MASTER_SEED } from '../src/sim/version.js';
import { SeasonLedger } from '../src/season/ledger.js';
import { MatchdayPool } from '../src/matchday/pool.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const mode = arg('mode', 'F-C'); const outDir = arg('out', 'out/sim-motor02/bench'); mkdirSync(outDir, { recursive: true });
const now = () => performance.now(); const tImports = now(); const rss = []; const sampler = setInterval(() => rss.push(process.memoryUsage().rss), 25); sampler.unref();
const N = 1000; const OBJECTIVE_MS = 5000; const root = new URL('..', import.meta.url).pathname;
let commit = 'desconocido'; let dirty = null; try { commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); dirty = execSync('git status --porcelain', { cwd: root }).toString().trim().length > 0; } catch { /* sin git */ }
const env = { node: process.version, platform: platform(), arch: arch(), kernel: release(), cpuModel: cpus()[0]?.model, logicalCpus: cpus().length, availableParallelism: availableParallelism(), ramMiB: Math.round(totalmem() / 2 ** 20), commit, workingTreeDirty: dirty, sim: SIM_VERSION, profile: SIM_PROFILE_ID };
const t0 = now(); const { profile, players } = loadData(); const tData = now(); const ctx = makeContext(profile); const teams = referenceTeamMap(profile, players); const ctxJSON = contextToJSON(ctx); const tCtx = now();
const agenda = buildAgenda({ master: SIM_MASTER_SEED }); const agendaFp = fpString(JSON.stringify(agenda));
const WARM_PAIRS = [['EQ01', 'EQ02'], ['EQ03', 'EQ03'], ['EQ05', 'EQ09'], ['EQ10', 'EQ07'], ['EQ12', 'EQ04'], ['EQ08', 'EQ06']]; const WARM_N = Number(arg('warm', 12));
const warm = Array.from({ length: WARM_N }, (_, i) => ({ n: -(i + 1), id: `WARM-${i + 1}`, a: WARM_PAIRS[i % 6][0], b: WARM_PAIRS[i % 6][1], seed: 11 + i }));
const r1 = (x) => Math.round(x * 10) / 10; const mib = (x) => Math.round((x / 2 ** 20) * 10) / 10;
const cases = (extra = {}) => agenda.map((c) => ({ ...c, essential: true, ...extra }));

async function pass(name, pool, fresh, startInfo) {
  const tReq = now(); const r = await pool.run(cases(), { chunk: 5 }); const tDone = now(); const res = r.results;
  // fases adicionales identificadas: serialización, persistencia (archivo JSONL con fsync) y disponibilidad para el mundo (registro idempotente de acumulados en una copia de prueba)
  const tS0 = now(); const lines = res.map((x) => JSON.stringify({ id: x.id, fp: x.fp, ess: x.ess })); const bytes = lines.reduce((a, l) => a + Buffer.byteLength(l) + 1, 0); const tS1 = now();
  const file = join(outDir, `${name}-essentials.jsonl`); const fd = openSync(file, 'w'); for (const l of lines) writeSync(fd, `${l}\n`); fsyncSync(fd); closeSync(fd); const tP1 = now();
  const gzBytes = gzipSync(Buffer.from(lines.join('\n'))).length; const tG1 = now();
  const led = new SeasonLedger(); let dup = 0; for (const x of res) if (x.status === 'finished') { const rr = led.record(x.ess, { season: 'B', competition: 'AG', round: 1, clubs: [x.a, x.b], model: 'sim', matchId: x.id, attemptId: 1 }); if (rr.duplicate) dup++; } const tW1 = now();
  const again = new SeasonLedger(); for (const x of res.slice(0, 50)) again.record(x.ess, { season: 'B', competition: 'AG', round: 1, clubs: [x.a, x.b], model: 'sim', matchId: x.id }); let dup2 = 0; for (const x of res.slice(0, 50)) if (again.record(x.ess, { season: 'B', competition: 'AG', round: 1, clubs: [x.a, x.b], model: 'sim', matchId: x.id, attemptId: 2 }).duplicate) dup2++;
  const finished = res.filter((x) => x.status === 'finished'); const valid = res.filter((x) => x.valid); const lat = res.map((x) => x.ms.input + x.ms.gen + x.ms.build + x.ms.recon);
  const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const rec = { run: name, workers: pool.size, process: fresh ? 'nuevo' : 'reutilizado', cases: res.length, agendaFingerprint: agendaFp,
    objective: { definition: 'solicitud de pool.run (workers listos) → actas esenciales individuales de los 1.000 casos en poder del coordinador', targetMs: OBJECTIVE_MS, measuredMs: r1(tDone - tReq), met: tDone - tReq <= OBJECTIVE_MS },
    phasesMs: { generateBuildValidateAndTransport: r1(tDone - tReq), serialize: r1(tS1 - tS0), persistFsync: r1(tP1 - tS1), gzipForReference: r1(tG1 - tP1), worldAvailability: r1(tW1 - tG1), totalUntilStatsAvailableForWorld: r1(tW1 - tReq) },
    startup: startInfo, throughputPerSecond: r1(res.length / ((tDone - tReq) / 1000)), workerBusyMs: r.workerMs.map(r1), casesPerWorker: r.perWorkerCases, latencyMs: { mean: r1(lat.reduce((a, b) => a + b, 0) / lat.length), p50: r1(pct(lat, 0.5)), p95: r1(pct(lat, 0.95)), max: r1(Math.max(...lat)) },
    phaseMeanInWorkerMs: Object.fromEntries(['input', 'gen', 'build', 'recon'].map((k) => [k, r1(res.reduce((a, x) => a + x.ms[k], 0) / res.length)])),
    counts: { finished: finished.length, valid: valid.length, failed: res.length - finished.length, overtimes: res.filter((x) => x.overtimes > 0).length, duplicatesOnFirstRecord: dup, duplicatesOnReplayOf50: dup2, replayOf50Accepted: again.matches.length },
    bytes: { essentialsJsonl: bytes, essentialsGzip: gzBytes, perMatch: Math.round(bytes / res.length), file: statSync(file).size, playersRowsTotal: res.reduce((a, x) => a + x.ess.box.players.length, 0) }, fingerprints: res.map((x) => x.fp), cases_: res.map((x) => ({ n: x.n, id: x.id, a: x.a, b: x.b, seed: x.seed, status: x.status, score: x.score, overtimes: x.overtimes, valid: x.valid, failed: x.failedChecks, controls: x.controls, events: x.events, draws: x.draws, inputFp: x.inputFp, attempts: x.attempts })) };
  rmSync(file, { force: true }); return rec;
}
const rssMax = () => Math.max(...rss);
const out = { mode, env, agendaFingerprint: agendaFp, setupMs: { importsToStart: r1(tImports), dataLoad: r1(tData - t0), contextAndTeams: r1(tCtx - tData) } };
if (mode === 'F-C') {
  const pool = new SimPool({ workers: 4 }); const startMs = await pool.start(ctxJSON, ctx.sp.fingerprint, teams, warm); const si = { workersStartMs: r1(startMs), warmCases: WARM_N, warmMsMax: r1(Math.max(...pool.readyInfo.map((x) => x.warmMs))), note: 'el arranque y el calentamiento se declaran aparte; no forman parte de la agenda ni del cronómetro objetivo' };
  out.passes = []; out.passes.push(await pass('P02-F', pool, true, si)); for (const c of ['P02-C1', 'P02-C2', 'P02-C3']) out.passes.push(await pass(c, pool, false, { workersStartMs: 0, warmCases: 0 }));
  const sameFp = (a, b) => a.every((x, i) => x === b[i]); out.equality = { F_C1_C2_C3_perCase: out.passes.slice(1).every((p) => sameFp(p.fingerprints, out.passes[0].fingerprints)) };
  await pool.close();
  // muestra de 64 casos con un worker: igualdad con los cuatro
  const p1 = new SimPool({ workers: 1 }); await p1.start(ctxJSON, ctx.sp.fingerprint, teams, []); const t1 = now(); const r64 = await p1.run(cases().slice(0, 64), { chunk: 5 }); const m64 = now() - t1; await p1.close();
  out.oneWorkerSample = { cases: 64, wallMs: r1(m64), equalToFourWorkers: r64.results.every((x, i) => x.fp === out.passes[0].fingerprints[i]), essentialsEqual: r64.results.every((x, i) => x.ess.identity.sportFingerprint === x.fp) };
  // coste de retención por nivel (muestra de 64 casos, en proceso): esencial individual / análisis (sin hechos) / completo con hechos (8)
  const sample = cases().slice(0, 64); const meas = (extra, n) => { const t = now(); let bytes = 0; for (const c of sample.slice(0, n)) { const r = runCase(ctx, teams, { ...c, ...extra }); bytes += Buffer.byteLength(JSON.stringify(extra.analysis ? r.ana : extra.full ? r.full : r.ess)); } return { n, ms: r1(now() - t), bytesTotal: bytes, bytesPerMatch: Math.round(bytes / n) }; };
  out.retention = { reference: meas({ essential: true }, 64), analysis: meas({ analysis: true }, 64), note: 'el nivel no cambia azar, producción ni consecuencias; solo lo que se conserva' };
  out.memory = { rssMaxMiB: mib(rssMax()), note: 'RSS del PROCESO (los workers son hilos del mismo proceso; no se suma por hilo)', samples: rss.length };
  out.verdict = { P02F_met: out.passes[0].objective.met, hot: out.passes.slice(1).map((p) => ({ run: p.run, ms: p.objective.measuredMs, met: p.objective.met })), independentObservations: 'cuatro pasadas son repeticiones de los mismos 1.000 casos, no 4.000 observaciones deportivas independientes' };
  const rows = out.passes[0].fingerprints.map((fp, i) => { const c = agenda[i]; return [c.n, c.id, c.round, c.a, c.b, c.seed, fp]; });
  writeFileSync(join(outDir, 'P02-cases-fp.csv'), ['n,id,round,a,b,seed,fingerprintF', ...rows.map((r) => r.join(','))].join('\n'));
  const slim = { ...out, passes: out.passes.map(({ fingerprints, cases_, ...r }) => r) }; writeFileSync(join(outDir, 'P02-cases.json'), JSON.stringify(out.passes.map((p) => ({ run: p.run, cases: p.cases_.map((c, i) => ({ ...c, fp: p.fingerprints[i] })) })))); writeFileSync(join(outDir, 'P02-F-C.json'), JSON.stringify(slim, null, 1)); writeFileSync(join(outDir, 'P02-fingerprints.json'), JSON.stringify(out.passes[0].fingerprints));
} else if (mode === 'DAY') {
  // jornada grande solo SIM: 1.000 encuentros a igual hora virtual; barreras comunes cada 120 s; política pequeña del entrenador activa; sin tarjetas ni mil workers
  const pool = new MatchdayPool({ workers: 4 }); const startMs = await pool.start(ctxJSON, teams); const tAdd0 = now();
  await pool.add(agenda.map((c) => ({ id: c.id, start: 0, attemptId: 1, spec: { a: c.a, b: c.b, seed: c.seed, importance: 'ordinary' } })), { groupSize: 25 }); const addMs = now() - tAdd0;
  const barriers = []; let T = 0; let packets; let done = 0; const tRun0 = now();
  while (done < agenda.length && T < 4000) { T += 120; const a0 = now(); packets = await pool.advance(T); const a1 = now(); const dec = await pool.review(T, {}, true); const a2 = now(); const q0 = now(); const live = packets.filter((p) => p.status === 'running').length; const fin = packets.filter((p) => p.finished); const lead = packets.reduce((acc, p) => acc + (p.score[0] > p.score[1] ? 1 : 0), 0); const q1 = now(); done = fin.length; barriers.push({ T, advanceMs: r1(a1 - a0), reviewMs: r1(a2 - a1), queryMs: r1(q1 - q0), live, finished: done, decisions: Object.values(dec).reduce((acc, per) => acc + per.reduce((s, x) => s + x.decisions.length, 0), 0), lead }); }
  const tRunEnd = now(); const e0 = now(); const ess = await pool.essentials(agenda.map((c) => c.id)); const e1 = now();
  const bytes = Buffer.byteLength(JSON.stringify(ess)); const led = new SeasonLedger(); for (const c of agenda) { const x = ess[c.id]; if (x.complete) led.record(x, { season: 'B', competition: 'AG', round: 1, clubs: [c.a, c.b], model: 'sim', matchId: c.id }); } const e2 = now();
  const valid = Object.values(ess).filter((x) => x.validity?.valid).length;
  out.day = { fixtures: agenda.length, workers: pool.size, barriers: barriers.length, barrierSeconds: 120, startMs: r1(startMs), addMs: r1(addMs), coordinatedRunMs: r1(tRunEnd - tRun0), essentialsTransportMs: r1(e1 - e0), worldAvailabilityMs: r1(e2 - e1), advanceMsTotal: r1(barriers.reduce((a, b) => a + b.advanceMs, 0)), reviewMsTotal: r1(barriers.reduce((a, b) => a + b.reviewMs, 0)), coordinatorQueryMsMax: Math.max(...barriers.map((b) => b.queryMs)), essentialsBytes: bytes, valid, finished: done, decisionsTotal: barriers.reduce((a, b) => a + b.decisions, 0), barrierSample: barriers.filter((_, i) => i % 5 === 0 || i === barriers.length - 1),
    reused: 'nada: se generan de nuevo los 1.000 encuentros dentro del avance coordinado (el contexto y las doce plantillas se cargan una vez por trabajador); no se reutilizan resultados de las pasadas anteriores', notes: 'el tiempo de visionado del sénior no es tiempo de CPU del mundo; una jornada de cinco partidos no se extrapola a mil simultáneos' };
  out.memory = { rssMaxMiB: mib(rssMax()), samples: rss.length }; await pool.close();
  // jornada mixta (cinco encuentros, uno con el detallado) en proceso
  const { Matchday } = await import('../src/matchday/index.js'); const { buildMixedScenario } = await import('../src/matchday/scenario.js'); const sc = buildMixedScenario(profile, players); const m0 = now(); const md = new Matchday({ id: 'J', fixtures: sc.fixtures, standings0: sc.standings0, objectives: sc.objectives, ctx, profile }); md.runToEnd(); out.mixed = { fixtures: 5, detailed: 1, totalMs: r1(now() - m0), barriers: md.barrier, decisions: md.decisions.length };
  writeFileSync(join(outDir, 'P02-DAY.json'), JSON.stringify(out, null, 1));
} else { console.error('modo no reconocido'); process.exit(2); }
clearInterval(sampler); console.log(JSON.stringify(mode === 'F-C' ? { P02F: out.passes[0].objective, hot: out.passes.slice(1).map((p) => p.objective.measuredMs), phasesF: out.passes[0].phasesMs, bytesF: out.passes[0].bytes, equality: out.equality, oneWorker: out.oneWorkerSample, memory: out.memory } : { day: { ...out.day, barrierSample: undefined }, mixed: out.mixed, memory: out.memory }, null, 1)); process.exit(0);
