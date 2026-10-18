// Agenda congelada de N partidos del mundo y medición de coste extremo a extremo (MOTOR-15 §13, §15.2–§15.3). Reutiliza el controlador de lotes (agenda y semillas congeladas, índice append-only, workers persistentes).
// NO es la campaña de calibración de MOTOR-16: no analiza anotación ni ajusta nada; mide tiempo, bytes y memoria, y publica una huella de resultados para comprobar que otra configuración reproduce lo mismo.
// Uso: node scripts/bench-world.js [--n=8] [--concurrency=seq|1|2|4|auto] [--level=world-essential|reduced|diagnostic] [--fingerprint=incremental|full|none] [--validation=full|acta]
//        [--seed-space=PERF-M15-20261017] [--runs=1] [--out=directorio] [--json=ruta] [--csv=ruta] [--keep]
// `--concurrency=seq` = ejecución secuencial en el hilo principal (sin workers). `--runs=2` repite el MISMO lote como revisión nueva: la primera es «fría» (módulos y workers sin calentar), las siguientes «calientes».
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir, cpus, totalmem, release, freemem } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { loadData } from './node-data.js';
import * as P from '../src/population/index.js';
import { fnv1a32 } from '../src/population/hash.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor, WorkerPool, detectCores, autoConcurrency } from '../src/batch/executors.js';
import { sha256 } from '../src/batch/hashing.js';
import { APP_VERSION } from '../src/version.js';
import { ENGINE_VERSION } from '../src/match/index.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const N = Number(arg('n', 8)); const concArg = arg('concurrency', 'seq'); const level = arg('level', 'world-essential'); const fingerprint = arg('fingerprint', 'incremental'); const validation = arg('validation', 'full');
const seedSpace = arg('seed-space', 'PERF-M15-20261017'); const runs = Number(arg('runs', 1)); const keep = process.argv.includes('--keep');
const root = arg('out', null) ?? mkdtempSync(join(tmpdir(), 'bem-bench-')); const jsonOut = arg('json', null); const csvOut = arg('csv', null);
const r1 = (x) => Math.round(x * 10) / 10;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

const { profile, players } = loadData();
// Espacio de semillas: la semilla de LOTE es FNV-1a del nombre del espacio; las semillas deportivas de cada caso se derivan con el mecanismo estable del proyecto (LOT-SEED-R1) al congelar la agenda.
const batchSeed = fnv1a32(seedSpace);
const ids = P.REFERENCE_IDS; const teams = Object.fromEntries(ids.map((id) => [id, P.referenceTeam(profile, players, id)]));
// Emparejamientos del catálogo existente (12 equipos de referencia): los 66 pares con zancada 7 (primos relativos con 66) y, si hace falta, los mismos con la localía invertida. Lista completa fijada antes de ejecutar.
const all = []; for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) all.push([ids[i], ids[j]]);
const ordered = all.map((_, k) => all[(k * 7) % all.length]); const pairs = [...ordered, ...ordered.map(([a, b]) => [b, a])].slice(0, N);
if (N > pairs.length) { console.error(`--n máximo ${pairs.length} con el catálogo de 12 equipos (ida y vuelta)`); process.exit(2); }

const cores = detectCores(); const pool = concArg === 'seq' ? null : new WorkerPool({ store: new JobStore(root), size: 4 });
const store = new JobStore(root); if (pool) pool.store = store;
const executor = pool ?? new InlineExecutor({ store });
const ctl = new BatchController({ store, executor });
let commit = 'desconocido'; try { commit = execSync('git rev-parse --short HEAD', { cwd: new URL('..', import.meta.url).pathname }).toString().trim(); } catch { /* sin git */ }
const env = { commit, node: process.version, os: release(), cpus: cpus().length, availableParallelism: cores.cores, detectedVia: cores.via, cpuModel: cpus()[0]?.model, memGiB: r1(totalmem() / 2 ** 30), freeMemGiB: r1(freemem() / 2 ** 30), app: APP_VERSION, engine: ENGINE_VERSION };
const concRequested = concArg === 'seq' ? 1 : concArg === 'auto' ? 'auto' : Number(concArg);
const out = { schema: 'beM-bench-world/1', env, config: { n: N, seedSpace, batchSeed, level, concurrency: concArg, concurrencyRequested: concRequested, autoValue: autoConcurrency(cores.cores), fingerprint, validation, runs, pairs: pairs.map((p) => p.join('-')) }, runs: [], note: 'Medición de coste: no es una muestra de calibración ni una población ACB. Pico de memoria: RSS máximo del PROCESO (coordinador y workers en el mismo proceso), no de cada hilo.' };

let peakHeap = 0; const sampler = setInterval(() => { peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed); }, 50);
for (let run = 1; run <= runs; run++) {
  const tAll = performance.now();
  const spec = { mode: 'pairs', pairs, repetitions: 1, venue: 'fixed', batchSeed, teams, recordLevel: level, concurrency: concRequested === 'auto' ? 'auto' : concRequested, variants: [{ id: 'V0', label: 'Base' }], objective: `Benchmark de coste ${seedSpace}: no calibra ni compara anotación`, label: `bench ${seedSpace} run ${run}` };
  let a = performance.now(); const cr = ctl.create(spec, profile, { players, label: `bench ${seedSpace}` }); const createMs = performance.now() - a;
  if (!cr.ok) { console.error('NO SE PUDO PREPARAR', cr.problems); process.exit(1); }
  a = performance.now(); const started = ctl.run(cr.batchId, { fingerprint, validation }); const handle = await started; const end = await handle.done; const runMs = performance.now() - a;
  const st = ctl.status(cr.batchId, { rows: true }); const snap = ctl.snapshot(cr.batchId);
  // Filas por intento (una por ejecución) con tiempos propios de cada trabajo; los tiempos de varios workers se SOLAPAN: la espera del usuario es `run_wall_ms`, no su suma.
  const rows = []; let bytes = 0; let gz = 0; const per = { prepare: [], simulate: [], validate: [], fingerprint: [], capture: [], serialize: [], write: [], finalize: [], exec: [] };
  a = performance.now();
  for (const m of st.matches) {
    const info = snap.info.get(m.match_id); const att = info.canonical ?? info.attempts[info.attempts.length - 1]; const t = att?.timings ?? {}; const coord = att?.coordinator ?? {};
    let b = 0; let g = 0;
    for (const f of att?.files ?? []) { const p = join(store.dir(cr.batchId), 'intentos', m.match_id, att.attempt_id, f.path); if (existsSync(p)) { const buf = readFileSync(p); b += buf.length; g += gzipSync(buf, { level: 6 }).length; } }
    bytes += b; gz += g;
    for (const [k, v] of Object.entries({ prepare: t.prepare_ms, simulate: t.simulate_ms, validate: t.validate_ms, fingerprint: t.fingerprint_ms, capture: t.capture_ms, serialize: t.serialize_ms, write: t.write_ms, finalize: coord.finalize_ms, exec: att?.exec_ms })) if (v != null) per[k].push(v);
    rows.push({ run, case_id: m.case_id, variant_id: m.variant_id, match_id: m.match_id, attempt_id: att?.attempt_id ?? null, pair_id: m.pair_id, seed: m.seed, exec_state: m.exec_state, valid: m.valid, score_home: m.facts?.score_home ?? null, score_away: m.facts?.score_away ?? null, draws: m.facts?.draws ?? null, trajectory_fp: m.facts?.trajectory_fp ?? null, trajectory_fp_mode: m.facts?.trajectory_fp_mode ?? null,
      level, concurrency_effective: end.concurrency?.effective ?? 1, exec_ms: r1(att?.exec_ms ?? 0), prepare_ms: r1(t.prepare_ms ?? 0), simulate_ms: r1(t.simulate_ms ?? 0), validate_ms: r1(t.validate_ms ?? 0), fingerprint_ms: r1(t.fingerprint_ms ?? 0), capture_ms: r1(t.capture_ms ?? 0), serialize_ms: r1(t.serialize_ms ?? 0), write_ms: r1(t.write_ms ?? 0), finalize_ms: r1(coord.finalize_ms ?? 0), bytes: b, bytes_gz: g });
  }
  const readMs = performance.now() - a;
  // Agregación mínima (descriptiva, sin conclusiones): medias de puntos y sorteos sobre los válidos; mide el coste de agregar desde los hechos ya conservados.
  a = performance.now(); const valid = rows.filter((r) => r.valid); const agg = { n_valid: valid.length, mean_points: valid.length ? r1(valid.reduce((s, r) => s + r.score_home + r.score_away, 0) / valid.length) : null, mean_draws: valid.length ? Math.round(valid.reduce((s, r) => s + r.draws, 0) / valid.length) : null }; const aggMs = performance.now() - a;
  const digest = sha256(JSON.stringify(rows.map((r) => [r.match_id, r.seed, r.score_home, r.score_away, r.draws, r.trajectory_fp]))).slice(0, 16);
  out.runs.push({ run, temperature: run === 1 ? 'fría (módulos y workers sin calentar)' : 'caliente', batch_id: cr.batchId, state: end.state, concurrency: end.concurrency, counters: st.counters,
    wall_ms: r1(performance.now() - tAll), phases_wall_ms: { create_freeze_validate: r1(createMs), run_dispatch_to_done: r1(runMs), read_results_and_bytes: r1(readMs), aggregate: r1(aggMs) },
    per_job_ms: Object.fromEntries(Object.entries(per).map(([k, v]) => [k, { n: v.length, sum: r1(v.reduce((s, x) => s + x, 0)), median: r1(med(v) ?? 0), min: r1(Math.min(...v)), max: r1(Math.max(...v)) }])),
    bytes: { uncompressed: bytes, gzip: gz, per_match_median: Math.round(med(rows.map((r) => r.bytes)) ?? 0) }, results_digest: digest, aggregate: agg,
    note: 'per_job_ms.exec es el tiempo de cada trabajo; con varios workers sus sumas se solapan y NO equivalen a la espera del usuario (run_dispatch_to_done).', rows });
  console.log(`run ${run} (${run === 1 ? 'fría' : 'caliente'}): ${end.state} · conc ${end.concurrency?.effective} · pared ${r1(performance.now() - tAll)} ms (ejecución ${r1(runMs)} ms; por partido ${r1(runMs / N)} ms) · ${st.counters.terminados}/${N} terminados · ${st.counters.validos} válidos · ${(bytes / 1048576).toFixed(2)} MiB (${(gz / 1048576).toFixed(2)} MiB gz) · digest ${digest}`);
}
clearInterval(sampler);
out.memory = { scope: 'proceso único (coordinador + workers)', peak_rss_MiB: Math.round(process.resourceUsage().maxRSS / 1024), coordinator_peak_heap_MiB: Math.round(peakHeap / 2 ** 20), note: 'maxRSS es el máximo del proceso entero; el heap del coordinador no incluye el de los workers.' };
out.digest_equal_across_runs = out.runs.every((r) => r.results_digest === out.runs[0].results_digest);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1));
if (csvOut) { const rows = out.runs.flatMap((r) => r.rows); const cols = Object.keys(rows[0]); writeFileSync(csvOut, `${[cols.join(','), ...rows.map((r) => cols.map((c) => (r[c] == null ? '' : String(r[c]))).join(','))].join('\n')}\n`); }
console.log(`memoria: pico RSS del proceso ${out.memory.peak_rss_MiB} MiB; heap pico del coordinador ${out.memory.coordinator_peak_heap_MiB} MiB · mismos resultados entre pasadas: ${out.digest_equal_across_runs}`);
if (pool) await pool.close();
if (!keep && !arg('out', null)) rmSync(root, { recursive: true, force: true });
process.exit(out.runs.every((r) => r.state === 'completado') ? 0 : 1);
