// SIM-MOTOR-04 · medición de coste (§12). Una invocación = un proceso nuevo. IDÉNTICA para O04-CONTROL y O04-FINAL (se ejecuta desde la raíz de código de cada una; sus importaciones son relativas a ella).
//   node scripts/sim04/bench.mjs --mode=F   --identity=O04-CONTROL [--overrides=<vector.json>] [--out=out/sim-motor04/bench]   F0 (proceso nuevo) + F1 + F2 (workers reutilizados): 1.000 partidos REALES por pasada
//   node scripts/sim04/bench.mjs --mode=DAY --identity=O04-CONTROL [--overrides=...] [--defer=on|off] [--out=...]                              jornada simultánea de 1.000 encuentros con barreras de 120 s (política automática activa)
// Cronómetros separados (§12.1): (1) proceso nuevo → importación, datos, workers y preparación; (2) solicitud con cuatro workers preparados → 1.000 ESENCIALES individuales completos, validados y transportados al coordinador
// (objetivo existente ≤ 5.000 ms); (3) serialización/persistencia y confirmación de estadísticas de mundo; (4) total desde proceso nuevo hasta datos utilizables por el mundo. Los partidos de calentamiento se declaran con su número y tiempo.
// La agenda es la BENCH congelada: 132 cruces ordenados de los doce equipos naturales × 7 vueltas + 76 de una octava (1.000 casos), semilla = SHA-256 de «20261023|SIM04|BENCH|C<nnnn>|<A>-<B>|BENCH» (32 bits). No se devuelven resultados almacenados.
import { writeFileSync, mkdirSync, readFileSync, openSync, writeSync, fsyncSync, closeSync, statSync, rmSync } from 'node:fs';
import { cpus, totalmem, release, platform, arch, availableParallelism } from 'node:os';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { loadData } from '../node-data.js';
import { makeContext, contextToJSON } from '../../src/sim/context.js';
import { referenceTeamMap } from '../../src/sim/teams.js';
import { SimPool } from '../../src/sim/pool.js';
import { SIM_VERSION, SIM_PROFILE_ID } from '../../src/sim/version.js';
import { SeasonLedger } from '../../src/season/ledger.js';
import { MatchdayPool } from '../../src/matchday/pool.js';

const t00 = performance.now(); const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const mode = arg('mode', 'F'); const identity = arg('identity', 'O04'); const outDir = arg('out', 'out/sim-motor04/bench'); mkdirSync(outDir, { recursive: true });
const root = new URL('../..', import.meta.url).pathname; const overrides = arg('overrides') ? JSON.parse(readFileSync(arg('overrides'), 'utf8')).overrides ?? JSON.parse(readFileSync(arg('overrides'), 'utf8')) : [];
const now = () => performance.now(); const rss = []; const sampler = setInterval(() => rss.push(process.memoryUsage().rss), 25); sampler.unref();
const DEFER = arg('defer', 'off') === 'on'; const SEAL_GROUP = Number(arg('seal-group', 16)); // cierre diferido en grupos pequeños (optimización de 04): false para el control
const OBJECTIVE_MS = 5000; const MASTER = 20261023; const TEAMS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`); const r1 = (x) => Math.round(x * 10) / 10; const mib = (x) => Math.round((x / 2 ** 20) * 10) / 10;
const sh = (c) => { try { return execSync(c, { cwd: root }).toString().trim(); } catch { return null; } }; const sha = (x) => createHash('sha256').update(x).digest('hex');
const seedOf = (key) => { const v = createHash('sha256').update(`${MASTER}|SIM04|BENCH|${key}|BENCH`).digest().readUInt32BE(0); return v === 0 ? 1 : v; };
function benchAgenda() { const x = []; for (const a of TEAMS) for (const b of TEAMS) if (a !== b) x.push([a, b]); const out = []; let n = 0; const push = (r, p) => { const [a, b] = x[p]; n += 1; const id = `SIM04-B${String(n).padStart(4, '0')}`; out.push({ n, id, round: r + 1, a, b, seed: seedOf(`C${String(n).padStart(4, '0')}|${a}-${b}`) }); }; for (let r = 0; r < 7; r++) for (let p = 0; p < x.length; p++) push(r, p); for (let p = 0; p < 76; p++) push(7, p); return out; }
const LIMIT = Number(arg('limit', 0)); // SOLO para pruebas de humo (se contabilizan aparte); la medición real no usa límite
const agenda = benchAgenda().slice(0, LIMIT > 0 ? LIMIT : undefined); const agendaFp = sha(JSON.stringify(agenda.map((c) => [c.id, c.a, c.b, c.seed])));
if (arg('write-agenda')) { writeFileSync(arg('write-agenda'), ['n,id,round,a,b,seed', ...agenda.map((c) => [c.n, c.id, c.round, c.a, c.b, c.seed].join(','))].join('\n') + '\n'); console.log(JSON.stringify({ agenda: arg('write-agenda'), cases: agenda.length, agendaFp })); process.exit(0); }
const env = { identity, node: process.version, platform: platform(), arch: arch(), kernel: release(), cpuModel: cpus()[0]?.model, logicalCpus: cpus().length, availableParallelism: availableParallelism(), ramMiB: Math.round(totalmem() / 2 ** 20), commit: sh('git rev-parse HEAD'), workingTreeDirty: (sh('git status --porcelain -- src data scripts') ?? '').length > 0, sim: SIM_VERSION, profile: SIM_PROFILE_ID, overrides, limit: LIMIT > 0 ? LIMIT : null, scriptSha256: sha(readFileSync(new URL(import.meta.url))), startedAt: new Date().toISOString() };
const t0 = now(); const { profile, players } = loadData(); const tData = now(); const ctx = makeContext(profile, overrides.length ? overrides : null); const teams = referenceTeamMap(profile, players); const ctxJSON = contextToJSON(ctx); const tCtx = now();
const WARM_PAIRS = [['EQ01', 'EQ02'], ['EQ03', 'EQ03'], ['EQ05', 'EQ09'], ['EQ10', 'EQ07'], ['EQ12', 'EQ04'], ['EQ08', 'EQ06']]; const WARM_N = Number(arg('warm', 12));
const warm = Array.from({ length: WARM_N }, (_, i) => ({ n: -(i + 1), id: `WARM-${i + 1}`, a: WARM_PAIRS[i % 6][0], b: WARM_PAIRS[i % 6][1], seed: 11 + i }));
const cases = () => agenda.map((c) => ({ ...c, essential: true }));
const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

async function pass(name, pool, fresh, startInfo, tProc0) {
  const tReq = now(); const r = await pool.run(cases(), { chunk: 5 }); const tDone = now(); const res = r.results;
  // fase 3: serialización, persistencia (JSONL con fsync) y confirmación de estadísticas de mundo (registro idempotente en una copia de prueba)
  const tS0 = now(); const lines = res.map((x) => JSON.stringify({ id: x.id, fp: x.fp, ess: x.ess })); const bytes = lines.reduce((a, l) => a + Buffer.byteLength(l) + 1, 0); const tS1 = now();
  const file = join(outDir, `${identity}-${name}-essentials.jsonl`); const fd = openSync(file, 'w'); for (const l of lines) writeSync(fd, `${l}\n`); fsyncSync(fd); closeSync(fd); const tP1 = now();
  const led = new SeasonLedger(); let dup = 0; for (const x of res) if (x.status === 'finished') { const rr = led.record(x.ess, { season: 'B', competition: 'AG', round: 1, clubs: [x.a, x.b], model: 'sim', matchId: x.id, attemptId: 1 }); if (rr.duplicate) dup++; } const tW1 = now();
  const finished = res.filter((x) => x.status === 'finished'); const valid = res.filter((x) => x.valid); const lat = res.map((x) => x.ms.input + x.ms.gen + x.ms.build + x.ms.recon);
  const rec = { run: name, workers: pool.size, process: fresh ? 'nuevo' : 'reutilizado', cases: res.length, agendaFingerprint: agendaFp,
    objective: { definition: 'solicitud de pool.run (workers preparados) → actas esenciales individuales de los 1.000 casos, validadas y en poder del coordinador', targetMs: OBJECTIVE_MS, measuredMs: r1(tDone - tReq), met: tDone - tReq <= OBJECTIVE_MS },
    phasesMs: { processStartToWorkersReady: fresh ? r1(startInfo.processToReady) : null, generateBuildValidateAndTransport: r1(tDone - tReq), serialize: r1(tS1 - tS0), persistFsync: r1(tP1 - tS1), worldAvailability: r1(tW1 - tP1), totalFromNewProcessToWorldData: fresh ? r1(tW1 - tProc0) : null, totalFromRequestToWorldData: r1(tW1 - tReq) },
    startup: startInfo, throughputPerSecond: r1(res.length / ((tDone - tReq) / 1000)), workerBusyMs: r.workerMs.map(r1), casesPerWorker: r.perWorkerCases,
    latencyMs: { mean: r1(lat.reduce((a, b) => a + b, 0) / lat.length), p50: r1(pct(lat, 0.5)), p95: r1(pct(lat, 0.95)), max: r1(Math.max(...lat)), method: 'percentil por rango inferior; latencia por caso dentro del worker (entrada+generación+construcción+conciliación)' },
    phaseMeanInWorkerMs: Object.fromEntries(['input', 'gen', 'build', 'recon'].map((k) => [k, Math.round((res.reduce((a, x) => a + x.ms[k], 0) / res.length) * 100) / 100])),
    counts: { requested: cases().length, finished: finished.length, valid: valid.length, invalid: res.filter((x) => x.status === 'finished' && !x.valid).length, failed: res.length - finished.length, interrupted: 0, duplicatesOnFirstRecord: dup, overtimes: res.filter((x) => x.overtimes > 0).length },
    bytes: { essentialsJsonl: bytes, perMatch: Math.round(bytes / res.length), file: statSync(file).size, playersRowsTotal: res.reduce((a, x) => a + x.ess.box.players.length, 0) },
    rssMaxMiBSoFar: mib(Math.max(...rss)) };
  // identidad por caso: huella deportiva, huella de entrada y huella SHA-256 del esencial completo (para comparar CONTROL y FINAL caso a caso, FUERA de los cronómetros)
  rec.perCase = res.map((x) => ({ n: x.n, id: x.id, a: x.a, b: x.b, seed: x.seed, status: x.status, valid: x.valid, score: x.score, overtimes: x.overtimes, fp: x.fp, inputFp: x.inputFp, essSha: sha(JSON.stringify(x.ess)), draws: x.draws, events: x.events, controls: x.controls, failed: x.failedChecks }));
  rmSync(file, { force: true }); return rec;
}
const out = { mode, identity, env, agendaFingerprint: agendaFp, setupMs: { importsToStart: r1(t0 - t00), dataLoad: r1(tData - t0), contextAndTeams: r1(tCtx - tData) } };
if (mode === 'F') {
  const tS = now(); const pool = new SimPool({ workers: 4 }); const startMs = await pool.start(ctxJSON, ctx.sp.fingerprint, teams, warm); const tReady = now();
  const si = { workersStartMs: r1(startMs), warmCases: WARM_N, warmMsMax: r1(Math.max(...pool.readyInfo.map((x) => x.warmMs))), warmMsPerWorker: pool.readyInfo.map((x) => r1(x.warmMs)), processToReady: tReady - t00, importsToStartMs: r1(t0 - t00), dataLoadMs: r1(tData - t0), contextMs: r1(tCtx - tData), poolStartAndWarmMs: r1(tReady - tS), note: 'el arranque y el calentamiento (12 partidos por worker, identificados) se declaran aparte; no forman parte de la agenda ni del cronómetro objetivo' };
  out.passes = [await pass('F0', pool, true, si, t00)]; for (const c of ['F1', 'F2']) out.passes.push(await pass(c, pool, false, { workersStartMs: 0, warmCases: 0 }, t00));
  const sameCase = (a, b) => a.perCase.every((x, i) => x.fp === b.perCase[i].fp && x.essSha === b.perCase[i].essSha); out.equality = { F0_F1_F2_perCase: out.passes.slice(1).every((p) => sameCase(p, out.passes[0])) };
  await pool.close(); out.memory = { rssMaxMiB: mib(Math.max(...rss)), note: 'RSS del PROCESO (los workers son hilos del mismo proceso; no se suma por hilo); muestreo cada 25 ms', samples: rss.length };
  out.verdict = { objectiveMs: OBJECTIVE_MS, passes: out.passes.map((p) => ({ run: p.run, ms: p.objective.measuredMs, met: p.objective.met })), note: 'tres pasadas son repeticiones de los mismos 1.000 casos, no 3.000 observaciones deportivas independientes' };
  writeFileSync(join(outDir, `${identity}-F.json`), JSON.stringify(out, null, 1)); const slim = { ...out, passes: out.passes.map(({ perCase, ...r }) => r) };
  console.log(JSON.stringify({ identity, passes: slim.passes.map((p) => ({ run: p.run, ms: p.objective.measuredMs, met: p.objective.met, valid: p.counts.valid, workerBusy: p.workerBusyMs, phases: p.phasesMs, inWorker: p.phaseMeanInWorkerMs, bytesPerMatch: p.bytes.perMatch })), equality: out.equality, memory: out.memory }, null, 1));
} else if (mode === 'DAY') {
  // jornada simultánea: 1.000 encuentros al mismo instante virtual; barreras comunes cada 120 s; política pequeña del entrenador activa; pool de cuatro workers; sin tarjetas ni mil hilos
  const pool = new MatchdayPool({ workers: 4 }); const startMs = await pool.start(ctxJSON, teams); const tAdd0 = now();
  await pool.add(agenda.map((c) => ({ id: c.id, start: 0, attemptId: 1, spec: { a: c.a, b: c.b, seed: c.seed, importance: 'ordinary' } })), { groupSize: 25 }); const addMs = now() - tAdd0;
  const byId = new Map(agenda.map((c) => [c.id, c])); const rssBarrier = [];
  const classify = (pk) => { const rows = new Map(); for (const p of pk) { const c = byId.get(p.id); if (!c || c.a === c.b) continue; const [sa, sb] = p.score; for (const [t, f, a] of [[c.a, sa, sb], [c.b, sb, sa]]) { const r = rows.get(t) ?? { w: 0, pf: 0, pa: 0 }; r.pf += f; r.pa += a; if (p.finished && f > a) r.w++; rows.set(t, r); } } return [...rows.entries()].sort((x, y) => y[1].w - x[1].w || (y[1].pf - y[1].pa) - (x[1].pf - x[1].pa)).length; };
  const barriers = []; let T = 0; let packets; let done = 0; const tRun0 = now();
  while (done < agenda.length && T < 4000) {
    T += 120; const a0 = now(); packets = await pool.advance(T, { defer: DEFER }); const a1 = now(); const dec = await pool.review(T, {}, true); const a2 = now(); const q0 = now(); const tblRows = classify(packets); const msgBytes = JSON.stringify(packets).length; const q1 = now();
    const sl0 = now(); const seal = DEFER ? await pool.seal({ group: SEAL_GROUP }) : null; const sealMs = now() - sl0; const sealCpu = DEFER ? (pool.lastSealTiming ?? []) : []; rssBarrier.push(process.memoryUsage().rss); const live = packets.filter((p) => p.status === 'running').length; const fin = packets.filter((p) => p.finished); const prevDone = done; done = fin.length;
    const wt = pool.lastTiming.filter(Boolean); const sumK = (k) => wt.reduce((a, x) => a + x[k], 0); const maxK = (k) => Math.max(...wt.map((x) => x[k]));
    barriers.push({ T, newlyFinished: done - prevDone, msgBytes, sealMs: r1(sealMs), sealed: seal?.sealed ?? 0, sealCpuMs: sealCpu.length ? { buildEssential: r1(sealCpu.reduce((a, x) => a + x.build, 0)), reconcile: r1(sealCpu.reduce((a, x) => a + x.recon, 0)), assembleEssential: r1(sealCpu.reduce((a, x) => a + x.assemble, 0)) } : null, tableRows: tblRows, advanceMs: r1(a1 - a0), reviewMs: r1(a2 - a1), queryMs: r1(q1 - q0), live, finished: done, decisions: Object.values(dec).reduce((acc, per) => acc + per.reduce((s, x) => s + x.decisions.length, 0), 0),
      cpuMs: { generate: r1(sumK('gen')), buildEssential: r1(sumK('build')), reconcile: r1(sumK('recon')), assembleEssential: r1(sumK('assemble')), progress: r1(sumK('progress')) }, criticalWorkerMs: { generate: r1(maxK('gen')), buildEssential: r1(maxK('build')), reconcile: r1(maxK('recon')), assembleEssential: r1(maxK('assemble')) }, rssMiB: mib(process.memoryUsage().rss) });
  }
  const tRunEnd = now(); const e0 = now(); const ess = await pool.essentials(agenda.map((c) => c.id)); const e1 = now(); const bytes = Buffer.byteLength(JSON.stringify(ess)); const led = new SeasonLedger(); for (const c of agenda) { const x = ess[c.id]; if (x.complete) led.record(x, { season: 'B', competition: 'AG', round: 1, clubs: [c.a, c.b], model: 'sim', matchId: c.id }); } const e2 = now();
  const valid = Object.values(ess).filter((x) => x.validity?.valid).length; const upd = barriers.map((b) => b.advanceMs + b.reviewMs + b.queryMs); const updTotal = barriers.map((b) => b.advanceMs + b.reviewMs + b.queryMs + b.sealMs).sort((x, y) => x - y); const sorted = upd.slice().sort((x, y) => x - y); const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  const closing = barriers.filter((b) => b.newlyFinished >= 100); const rest = barriers.filter((b) => b.newlyFinished < 100);
  out.day = { fixtures: agenda.length, workers: pool.size, barriers: barriers.length, barrierSeconds: 120, startMs: r1(startMs), addMs: r1(addMs), coordinatedRunMs: r1(tRunEnd - tRun0), essentialsTransportMs: r1(e1 - e0), worldAvailabilityMs: r1(e2 - e1), advanceMsTotal: r1(barriers.reduce((a, b) => a + b.advanceMs, 0)), reviewMsTotal: r1(barriers.reduce((a, b) => a + b.reviewMs, 0)), coordinatorQueryMsMax: Math.max(...barriers.map((b) => b.queryMs)),
    essentialsBytes: bytes, valid, finished: done, requested: agenda.length, decisionsTotal: barriers.reduce((a, b) => a + b.decisions, 0), barriers,
    barrierUpdateMs: { max: r1(sorted.at(-1)), median: r1(q(0.5)), p95: r1(q(0.95)), p99: r1(q(0.99)), n: sorted.length, method: 'percentil por rango inferior sobre las barreras de la jornada; actualización = advance + review + consulta/clasificación del coordinador (con cierre diferido, el sellado de esenciales se mide aparte en withSeal)', withSeal: { max: r1(updTotal.at(-1)), median: r1(updTotal[Math.min(updTotal.length - 1, Math.floor(0.5 * updTotal.length))]), note: 'actualización + sellado de esenciales (misma CPU total; con cierre diferido el marcador no espera al sellado)' }, deferredClosure: DEFER, sealGroup: DEFER ? SEAL_GROUP : null },
    closureFrontier: { barriersWithMoreThan100Finishing: closing.map((b) => ({ T: b.T, newlyFinished: b.newlyFinished, advanceMs: b.advanceMs, reviewMs: b.reviewMs, queryMs: b.queryMs, sealMs: b.sealMs, sealCpuMs: b.sealCpuMs, cpuMs: b.cpuMs, criticalWorkerMs: b.criticalWorkerMs })), updateMsMaxOfRest: rest.length ? r1(Math.max(...rest.map((b) => b.advanceMs + b.reviewMs + b.queryMs))) : null, restBarriers: rest.length, note: 'frontera de cierre = barrera(s) donde terminan la mayoría de encuentros; el tiempo distribuido en tareas pequeñas sigue sumando CPU (cpuMs) aunque la pausa visible (criticalWorkerMs) sea menor' },
    rssAtBarriersMiB: rssBarrier.map(mib), msgBytesTotal: barriers.reduce((a, b) => a + b.msgBytes, 0), reused: 'nada: se generan de nuevo los 1.000 encuentros dentro del avance coordinado; no se reutilizan resultados de otras pasadas', notes: 'el tiempo de visionado del sénior no es tiempo de CPU del mundo' };
  out.memory = { rssMaxMiB: mib(Math.max(...rss)), samples: rss.length, method: 'RSS del proceso (workers = hilos), muestreo cada 25 ms más una lectura por barrera' }; await pool.close(); out.perCase = Object.entries(ess).map(([id, x]) => ({ id, fp: x.identity.sportFingerprint, essSha: sha(JSON.stringify(x)), valid: x.validity?.valid ?? null, score: x.score.final }));
  writeFileSync(join(outDir, `${identity}-DAY.json`), JSON.stringify(out, null, 1)); const { barriers: _b, rssAtBarriersMiB, ...daySlim } = out.day; void _b; void rssAtBarriersMiB; console.log(JSON.stringify({ identity, day: daySlim, memory: out.memory }, null, 1));
} else { console.error('modo no reconocido'); process.exit(2); }
clearInterval(sampler); process.exit(0);
