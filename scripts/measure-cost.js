// Medición de coste (MOTOR-14 §14): mide por etapas sobre dos casos congelados (C14-01 y C14-02) y dos niveles (completo/reducido). Tiempos monotónicos que NUNCA deciden deporte; se publican todas
// las muestras con mediana y rango (sin p95 con tres ejecuciones), frío y calentado por separado. Uso: node scripts/measure-cost.js [--runs=3] [--json=ruta]
import { writeFileSync } from 'node:fs';
import { cpus, totalmem, release } from 'node:os';
import { gzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { loadData } from './node-data.js';
import { buildMatchInput, createMatch, buildResult, validateInput, ENGINE_VERSION } from '../src/match/index.js';
import { snapshotMatch, restoreMatch } from '../src/match/snapshot.js';
import { analyze } from '../src/analysis/index.js';
import { reconcileAnalysis } from '../src/analysis/reconcile.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';
import { APP_VERSION } from '../src/version.js';

const runs = Number((process.argv.find((a) => a.startsWith('--runs=')) ?? '--runs=3').slice(7));
const jsonOut = (process.argv.find((a) => a.startsWith('--json=')) ?? '').slice(7);
const { profile, players } = loadData();
const now = () => performance.now();
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const stat = (a) => ({ samples: a.map((x) => Math.round(x * 10) / 10), median: Math.round(med(a) * 10) / 10, min: Math.round(Math.min(...a) * 10) / 10, max: Math.round(Math.max(...a) * 10) / 10 });
const cases = [['C14-01', 20261016], ['C14-02', 141002]];
let commit = 'desconocido'; try { commit = execSync('git rev-parse --short HEAD', { cwd: new URL('..', import.meta.url).pathname }).toString().trim(); } catch { /* sin git */ }
const env = { commit, node: process.version, os: release(), cpus: cpus().length, cpuModel: cpus()[0]?.model, memGiB: Math.round(totalmem() / 2 ** 30), app: APP_VERSION, engine: ENGINE_VERSION };
const out = { env, runs, cases: {} };
for (const [id, seed] of cases) {
  const input = buildMatchInput(profile, players, { seed }); out.cases[id] = { seed };
  for (const detail of ['full', 'reduced']) {
    const T = { validate: [], create: [], simulate: [], buildResult: [], analyze: [], reconcile: [], snapshot: [], restore: [], json: [] }; let fp; let draws; let bytes = {}; let peak = 0; const cold = {};
    for (let r = 0; r < runs; r++) {
      if (global.gc) global.gc();
      let t = now(); validateInput(input, profile); const tv = now() - t;
      t = now(); const m = createMatch(input, profile, { detail }); const tc = now() - t;
      t = now(); let n = 0; while (m.step()) { n += 1; if ((n & 63) === 0) peak = Math.max(peak, process.memoryUsage().heapUsed); } const ts = now() - t;
      t = now(); const res = buildResult(m); const tb = now() - t;
      let ta = 0; let tr = 0; let tsn = 0; let trs = 0; let tj = 0;
      if (detail === 'full') {
        t = now(); analyze(res, { audience: 'diagnostic', team: 0 }).summary(); ta = now() - t;
        t = now(); reconcileAnalysis(res); tr = now() - t;
        const mid = createMatch(input, profile, { detail }); for (let i = 0; i < 300; i++) mid.step();
        t = now(); const snap = snapshotMatch(mid); tsn = now() - t; t = now(); const text = JSON.stringify(snap); tj = now() - t; t = now(); restoreMatch(JSON.parse(text)); trs = now() - t;
        bytes.snapshotMid = text.length; bytes.snapshotGz = gzipSync(Buffer.from(text), { level: 6 }).length;
      }
      const tx = now(); const js = JSON.stringify(res); const tjson = now() - tx; bytes.resultJson = js.length; bytes.resultGz = gzipSync(Buffer.from(js), { level: 6 }).length;
      fp = trajectoryFingerprint(res); draws = res.diagnostics.sportingDraws;
      const row = { validate: tv, create: tc, simulate: ts, buildResult: tb, analyze: ta, reconcile: tr, snapshot: tsn, restore: trs, json: tj + tjson };
      for (const k of Object.keys(T)) { if (k === 'analyze' || k === 'reconcile' || k === 'snapshot' || k === 'restore') { if (detail === 'full') T[k].push(row[k]); } else T[k].push(row[k]); }
      if (r === 0) Object.assign(cold, row);
    }
    const o = { detail, trajectory_fp: fp, draws, bytes, peakHeapMiB: Math.round(peak / 2 ** 20), coldFirstRun: Object.fromEntries(Object.entries(cold).map(([k, v]) => [k, Math.round(v * 10) / 10])) };
    for (const [k, v] of Object.entries(T)) if (v.length) o[k] = stat(v);
    out.cases[id][detail] = o;
    console.log(`${id} ${detail}: simulate mediana ${o.simulate.median} ms (rango ${o.simulate.min}–${o.simulate.max}) · draws ${draws} · fp ${fp.slice(0, 12)} · resultado ${(bytes.resultJson / 1e6).toFixed(2)} MB (${(bytes.resultGz / 1e6).toFixed(2)} MB gz) · pico heap ${o.peakHeapMiB} MiB`);
  }
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1));
