// MOTOR-17 §15.1: medición REAL de 100 y 200 encuentros `world-essential` con el controlador y el pool existentes, cuatro workers, mismos controles de conciliación y huella, misma persistencia. Cada trabajo de
// versión/tamaño parte de un PROCESO NUEVO (arranque comparable). Mide la pared desde el despacho hasta el último resultado persistido y validado, desglosa preparación/arranque y publica el total desde que arranca el proceso.
// Entradas: los doce pares del ciclo de desarrollo; caso i = 1…N: par d = 1 + ((i−1) mod 12); localía H0 en vueltas pares (⌊(i−1)/12⌋) y H1 en impares; seed_100 = 310000000 + i, seed_200 = 320000000 + i.
// Uso: node scripts/m17-bench.js --tree=/ruta --version=R0|R17 --n=100|200 --out=out/motor17/coste [--concurrency=4]
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cpus, totalmem, release, freemem } from 'node:os';
import { createHash } from 'node:crypto';

const T_PROC0 = performance.now(); const uptimeAtMain = process.uptime() * 1000;
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const TREE = arg('tree', null); const VERSION = arg('version', null); const N = Number(arg('n', 100)); const OUT = arg('out', 'out/motor17/coste'); const CONC = Number(arg('concurrency', 4)); const CANDIDATE = arg('candidate', 'C17-02');
if (!TREE || !['R0', 'R17'].includes(VERSION) || ![100, 200].includes(N)) { console.error('uso: --tree --version=R0|R17 --n=100|200'); process.exit(2); }
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const nowMs = () => performance.now();
let a = nowMs(); const { loadData, CANDIDATES17_PATH } = await imp('scripts/node-data.js'); const P = await imp('src/population/index.js'); const { JobStore } = await imp('src/batch/jobstore.js'); const { BatchController } = await imp('src/batch/runner.js'); const { WorkerPool, detectCores } = await imp('src/batch/executors.js'); const { ENGINE_VERSION } = await imp('src/match/index.js'); const { APP_VERSION } = await imp('src/version.js');
const data = loadData(); let profile = data.profile; const players = data.players;
if (VERSION === 'R17') { const { candidateProfile } = await imp('src/profiles/candidates.js'); const c = JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')).candidates.find((x) => x.id === CANDIDATE); profile = candidateProfile(profile, c); }
const importMs = nowMs() - a;
const IDS = P.REFERENCE_IDS; const cyc = []; for (let i = 0; i < 11; i++) cyc.push([IDS[i], IDS[i + 1]]); cyc.push([IDS[0], IDS[11]]);
const nat = Object.fromEntries(IDS.map((id) => [id, P.referenceTeam(profile, players, id)]));
const SEED0 = N === 100 ? 310000000 : 320000000; const FULL = Math.floor(N / 12); const REM = N - 12 * FULL; // vueltas completas del ciclo y casos de la última vuelta (d = 1…REM)
// Un lote no admite pares repetidos: la agenda del prompt (caso i, par d = 1+((i−1) mod 12), localía por paridad de la vuelta) se materializa con DOS lotes de la MISMA tarea y el mismo pool: los pares d ≤ REM con FULL+1 repeticiones y el resto con FULL;
// localía «alternada» = vuelta par → primer equipo local (H0), impar → visitante (H1). El caso i conserva su semilla SEED0 + i, con i = 12·(repetición−1) + d.
const lotsDef = [{ name: 'A', ds: Array.from({ length: REM }, (_, k) => k + 1), reps: FULL + 1 }, { name: 'B', ds: Array.from({ length: 12 - REM }, (_, k) => REM + k + 1), reps: FULL }].filter((l) => l.ds.length && l.reps > 0);
const cases = []; for (const l of lotsDef) { l.caseList = []; for (const d of l.ds) for (let rep = 1; rep <= l.reps; rep++) { const i = 12 * (rep - 1) + d; const lap = rep - 1; const c = { i, d, lap, home: lap % 2 === 0 ? 'H0' : 'H1', pair: cyc[d - 1], seed: SEED0 + i, lot: l.name }; l.caseList.push(c); cases.push(c); } }
const root = join(OUT, `lotes-${VERSION}-${N}`); rmSync(root, { recursive: true, force: true }); mkdirSync(root, { recursive: true });
const store = new JobStore(root); const pool = new WorkerPool({ store, size: CONC }); const ctl = new BatchController({ store, executor: pool });
const cores = detectCores();
let peakHeap = 0; const sampler = setInterval(() => { peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed); }, 50);
const specFor = (l) => ({ recordLevel: 'world-essential', prose: 'omitted', concurrency: CONC, importance: 'ordinary', mode: 'pairs', pairs: l.ds.map((d) => cyc[d - 1]), repetitions: l.reps, venue: 'alternate', teams: nat, batchSeed: SEED0, caseSeeds: l.caseList.map((c) => c.seed), variants: [{ id: 'V0', label: 'Base' }], objective: `MOTOR17 coste ${VERSION} · ${N} encuentros · lote ${l.name}`, label: `MOTOR17-COSTE-${VERSION}-${N}-${l.name}` });
a = nowMs(); const crs = lotsDef.map((l) => ctl.create(specFor(l), profile, { players, label: `MOTOR17-COSTE-${VERSION}-${N}-${l.name}` })); const createMs = nowMs() - a;
for (const cr of crs) if (!cr.ok) { console.error('NO SE PUDO PREPARAR', cr.problems); process.exit(1); }
a = nowMs(); const started = []; for (const cr of crs) started.push(await ctl.run(cr.batchId, { concurrency: CONC })); const startMs = nowMs() - a; // arranque del controlador (el de los workers ocurre en la primera tarea y queda DENTRO de la pared)
const tDispatch = nowMs(); const ends = await Promise.all(started.map((x) => x.done)); const end = ends[0]; const wallMs = nowMs() - tDispatch; const totalFromProcessStart = nowMs() - T_PROC0 + uptimeAtMain;
clearInterval(sampler); const ru = process.resourceUsage();
const per = { prepare: [], simulate: [], validate: [], fingerprint: [], capture: [], serialize: [], write: [], finalize: [], exec: [] }; const eff = { possessions: 0, events: 0, steps: 0, draws: 0 }; let bytes = 0; const rows = []; const counters = { solicitados: 0, terminados: 0, validos: 0, fallidos: 0, reintentados: 0 };
for (const cr of crs) {
  const st = ctl.status(cr.batchId, { rows: true }); const snap = ctl.snapshot(cr.batchId); for (const k of Object.keys(counters)) counters[k] += st.counters[k] ?? 0;
  for (const m of st.matches) {
    const info = snap.info.get(m.match_id); const att = info.canonical ?? info.attempts[info.attempts.length - 1]; const t = att?.timings ?? {}; const coord = att?.coordinator ?? {};
    for (const k of Object.keys(per)) { const val = t[`${k}_ms`] ?? t[k]; if (val != null) per[k].push(val); }
    const f = (att?.files ?? []).find((x) => x.path.startsWith('esencial/')); let es = null;
    if (f) { const p = join(store.dir(cr.batchId), 'intentos', m.match_id, att.attempt_id, f.path); const buf = readFileSync(p); bytes += buf.length; es = JSON.parse(buf.toString('utf8')); eff.possessions += es.acta.possessions?.length ?? es.acta.possessions ?? 0; eff.events += es.integrity.events ?? 0; eff.steps += es.integrity.steps ?? 0; eff.draws += es.integrity.sporting_draws ?? 0; }
    rows.push({ lot: cr.batchId, match_id: m.match_id, attempt_id: att?.attempt_id, valid: !!att?.valid, exec_ms: att?.exec_ms ?? null, wall_ms_coordinator: coord.wall_ms ?? null, concurrency: coord.concurrency ?? null, score: es ? es.result.court_score : null, fp: es?.integrity?.trajectory_fp ?? null, draws: es?.integrity?.sporting_draws ?? null, seed: es?.identity?.seed ?? null });
  }
}
const sum = (x) => x.reduce((s, v) => s + v, 0); const med = (x) => { const s = [...x].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; }; const r1 = (x) => Math.round(x * 10) / 10;
const digest = createHash('sha256').update(JSON.stringify(rows.map((r) => [r.seed, r.score, r.fp, r.draws]).sort())).digest('hex');
const result = {
  schema: 'beM-m17-bench/1', version: VERSION, n: N, tree: TREE, app: APP_VERSION, engine: ENGINE_VERSION, effective_profile_id: profile.effectiveId, candidate: VERSION === 'R17' ? CANDIDATE : null,
  env: { node: process.version, os: release(), cpu_model: cpus()[0]?.model, cpus: cpus().length, available_parallelism: cores.cores, detected_via: cores.via, mem_gib: r1(totalmem() / 2 ** 30), free_mem_gib_at_end: r1(freemem() / 2 ** 30) },
  config: { record_level: 'world-essential', concurrency_requested: CONC, concurrency_effective: end.concurrency, fingerprint: 'incremental (por defecto del controlador)', validation: 'full (por defecto)', persistence: 'archivo esencial por intento + índice del lote', seeds: `${N === 100 ? '310000000' : '320000000'} + i`, prewarm: 'ninguna: arranque de workers dentro de la pared', pairs: cyc.map((c) => c.join('-')), lots: lotsDef.map((l) => ({ lot: l.name, pairs_d: l.ds, repetitions: l.reps, venue: 'alternate' })) },
  counters: { solicitados: counters.solicitados, terminados: counters.terminados, validos: counters.validos, fallidos: counters.fallidos, reintentados: counters.reintentados },
  timing_ms: { process_to_main_script: Math.round(uptimeAtMain), import_and_load_data: Math.round(importMs), create_freeze_validate: Math.round(createMs), controller_start: Math.round(startMs), dispatch_to_last_persisted_wall: Math.round(wallMs), total_from_process_start: Math.round(totalFromProcessStart), throughput_matches_per_s: r1(N / (wallMs / 1000)), throughput_matches_per_s_total: r1(N / (totalFromProcessStart / 1000)) },
  objective_100_in_5s: N === 100 ? { measured_wall_s: r1(wallMs / 1000), measured_total_s: r1(totalFromProcessStart / 1000), reached_wall: wallMs <= 5000, reached_total: totalFromProcessStart <= 5000 } : null,
  per_job_ms: Object.fromEntries(Object.entries(per).map(([k, v]) => [k, { n: v.length, sum: r1(sum(v)), median: v.length ? r1(med(v)) : null, max: v.length ? r1(Math.max(...v)) : null }])),
  note_phases: 'las fases por trabajo se SOLAPAN entre workers: la espera del usuario es dispatch_to_last_persisted_wall, no su suma',
  memory: { max_rss_mib_process_incl_worker_threads: Math.round(ru.maxRSS / 1024), coordinator_heap_peak_mib: r1(peakHeap / 2 ** 20), scope: 'proceso Node completo (coordinador + 4 worker_threads); el heap por worker no se mide por separado' },
  bytes: { essential_json_total: bytes, per_match_mean: Math.round(bytes / Math.max(1, rows.length)) }, sporting_effort: { ...eff, per_match: { possessions: r1(eff.possessions / N), events: r1(eff.events / N), steps: r1(eff.steps / N), draws: r1(eff.draws / N) } }, results_digest: digest, rows,
  note: 'La comparación global R0/R17 mide el coste de las entregas completas (código + perfil): los perfiles finales pueden cambiar las trayectorias y el número de acciones; no aísla por sí sola la optimización (ver A17/P17).' };
mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, `coste-${VERSION}-${N}.json`), JSON.stringify(result, null, 1));
console.log(`${VERSION} ${N}: pared ${r1(wallMs / 1000)} s · total desde el proceso ${r1(totalFromProcessStart / 1000)} s · ${r1(N / (wallMs / 1000))} partidos/s · ${counters.validos}/${N} válidos · pico RSS ${Math.round(ru.maxRSS / 1024)} MiB · efectivos conc=${end.concurrency?.effective} · digest ${digest.slice(0, 12)}`);
await pool.close(); process.exit(counters.fallidos ? 1 : 0);
