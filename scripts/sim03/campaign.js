// SIM-MOTOR-03 · campaña comparativa congelada (§7). Ejecución PROGRAMADA y tablas: no usa agentes para leer partidos ni convierte los logs en mensajes.
//   node scripts/sim03/campaign.js --phase=plan [--plan=docs/tecnico/evidencia-sim-motor03/plan]      escribe plan, agendas y materialización de entradas (para Git, ANTES de ejecutar)
//   node scripts/sim03/campaign.js --phase=run  [--blocks=A,B,C,DET] [--limit=N] [--out=out/sim-motor03/campaign]   ejecuta con persistencia progresiva y reanudación
// Un caso terminado (válido o no válido) no se vuelve a ejecutar; un fallo deportivo/determinista se conserva como fallido (sin marcador definitivo y sin contar como derrota); solo una causa OPERATIVA
// identificada (worker caído) se reintenta, con la misma entrada y semilla y un intento nuevo.
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { cpus, release, platform, arch, totalmem } from 'node:os';
import * as L from './lib.js';
import { contextToJSON } from '../../src/sim/context.js';
import { SimPool } from '../../src/sim/pool.js';
import { SIM_VERSION, SIM_PROFILE_ID, SIM_RESULT_SCHEMA, SIM_COVERAGE_ID, SIM_STATS_POLICY_ID, SIM_RECON_POLICY_ID } from '../../src/sim/version.js';
import { APP_VERSION } from '../../src/version.js';
import { ENGINE_VERSION } from '../../src/match/data.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const phase = arg('phase', 'run'); const root = new URL('../..', import.meta.url).pathname;
const PLAN_DIR = arg('plan', join(root, 'docs/tecnico/evidencia-sim-motor03/plan')); const OUT = arg('out', join(root, 'out/sim-motor03/campaign'));
const csv = (rows) => rows.map((r) => r.map((v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n') + '\n';
const sh = (c) => { try { return execSync(c, { cwd: root }).toString().trim(); } catch { return null; } };

const env = L.loadEnv(); const { sim, det } = L.allCases(env); const bySim = new Map(sim.map((c) => [c.case_id, c])); const byDet = new Map(det.map((c) => [c.case_id, c]));
const detOfSim = (c) => (byDet.has(`${c.case_id}@DET`) ? `${c.case_id}@DET` : '');
const flags = (c) => ({ diag: L.DIAG_SIM.includes(c.case_id) || L.DIAG_DET.includes(c.case_id), e: L.E_CASES.includes(c.case_id), history: c.resolver === 'sim' && L.history72().some((h) => h.case_id === c.case_id), learning: L.learningPairs().some((p) => p.sim === c.case_id || p.detailed === c.case_id) });

// ---------------------------------------------------------------------------------------------------------------------------------- fase plan
if (phase === 'plan') {
  mkdirSync(PLAN_DIR, { recursive: true }); const entries = new Map(); const rows = []; const rowsDet = []; const t0 = performance.now(); const bad = [];
  for (const c of [...sim, ...det]) {
    const m = L.materialize(env, c); entries.set(m.entry_id, m.input); const f = flags(c); const v = L.validateBoth(env, m.input); if ((c.resolver === 'sim' && v.sim.length) || (c.resolver === 'detailed' && v.detailed.length) || (c.replicate === 1 && c.resolver === 'sim' && v.detailed.length && ['A', 'B'].includes(c.block))) bad.push({ case_id: c.case_id, sim: v.sim, detailed: v.detailed });
    const row = [c.case_id, c.block, c.scenario, c.variant, c.orientation, c.replicate, c.resolver, c.seed_key, c.seed, c.teams[0], c.teams[1], c.testTeam ?? '', m.entry_id, m.input_hash, c.resolver === 'sim' ? detOfSim(c) : c.case_id.replace(/@DET$/, ''), f.diag ? 1 : 0, f.e ? 1 : 0, f.history ? 1 : 0, f.learning ? 1 : 0];
    (c.resolver === 'sim' ? rows : rowsDet).push(row);
  }
  const head = ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'seed_key', 'seed', 'team0', 'team1', 'test_team', 'entry_id', 'input_hash', 'twin_case', 'diag', 'e_case', 'history72', 'learning_pair'];
  writeFileSync(join(PLAN_DIR, 'agenda-sim.csv'), csv([head, ...rows])); writeFileSync(join(PLAN_DIR, 'agenda-detallado.csv'), csv([head, ...rowsDet]));
  writeFileSync(join(PLAN_DIR, 'entries.jsonl.gz'), gzipSync([...entries.entries()].map(([id, inp]) => JSON.stringify({ entry_id: id, input: (({ seed, ...r }) => r)(inp) })).join('\n')));
  const scen = L.scenariosB(env).map((s) => ({ id: s.id, factor: s.factor, pair: s.pair, testTeam: s.pair[0], detailed: !!s.detailed, note: s.note ?? null, variants: s.variants.map((x) => ({ id: x.id, label: x.label })) }));
  const budget = { sim: { A: 1056, B: 512, C: 64, comparison: 1632, E: 16, F: 5000 }, detailed: { A: 48, B: 24, C: 0, comparison: 72 }, plannedExplicitSim: 6648, plannedExplicitDetailed: 72, note: 'las pasadas de F repiten sus mil casos; E no son observaciones nuevas; pruebas, navegador, controles y perfilado se cuentan aparte' };
  const plan = { schema: 'beM-sim03-plan/1', campaign: CAMPAIGN_ID(), master: L.MASTER, seedFunction: 'deriveSeed(master, seed_key) = FNV-1a de 32 bits sobre «master|seed_key» (src/sim/rng.js)', seedKeyContract: 'bloque|enfrentamiento_o_escenario|orientación|réplica; excluye variante, resolutor, intento, worker, lote y ruta',
    budget, blocks: { A: { pairs: 'EQ01–EQ12 orientados distintos (132) × 8 réplicas', note: 'planes naturales; sin localía modelada; sin acumulación de aprendizaje ni cansancio entre casos' }, B: { scenarios: scen, detailedScenarios: L.B_DETAILED_SCENARIOS, orientation: 'O1: equipo sometido al factor = equipo 0 de la entrada; O2: equipo 1' }, C: { base: ['EQ05', 'EQ06'], scenarios: ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08'] } },
    detailedA: L.A_DETAILED_PAIRS, diagnosticSim: L.DIAG_SIM, diagnosticDetailed: L.DIAG_DET, eCases: L.E_CASES, history72: L.history72(), learningPairs: L.learningPairs(), benchmarkAgenda: { master: 20261022, composition: '132 cruces × 7 vueltas + 76 de una octava (agenda de 01/02, recuperable por buildAgenda)', reuse: 'agenda de benchmark de 02 reutilizada; sus entradas son recuperables e identificadas' },
    unplannedInvalid: bad };
  writeFileSync(join(PLAN_DIR, 'plan.json'), JSON.stringify(plan, null, 1));
  console.log(JSON.stringify({ phase, sim: sim.length, detailed: det.length, entries: entries.size, invalidAtPlan: bad.length, ms: Math.round(performance.now() - t0), PLAN_DIR }, null, 1)); process.exit(bad.length ? 1 : 0);
}
function CAMPAIGN_ID() { return L.CAMPAIGN_ID; }

// ---------------------------------------------------------------------------------------------------------------------------------- fase run
const only = arg('cases') ? new Set(arg('cases').split(',')) : null; const blocks = (arg('blocks', 'A,B,C,DET')).split(','); const limit = Number(arg('limit', 0)) || Infinity; mkdirSync(join(OUT, 'diag'), { recursive: true });
const indexPath = join(OUT, 'index.jsonl'); const recSimPath = join(OUT, 'records-sim.jsonl'); const recDetPath = join(OUT, 'records-detailed.jsonl'); const incidentsPath = join(OUT, 'incidents.jsonl');
const readIdx = () => (existsSync(indexPath) ? readFileSync(indexPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const done = new Map(); for (const x of readIdx()) if (['finished', 'failed'].includes(x.status)) done.set(x.case_id, x);
const log = (o) => appendFileSync(incidentsPath, `${JSON.stringify({ at: new Date().toISOString(), ...o })}\n`);
const planAgenda = new Map(readFileSync(join(PLAN_DIR, 'agenda-sim.csv'), 'utf8').trim().split('\n').slice(1).concat(readFileSync(join(PLAN_DIR, 'agenda-detallado.csv'), 'utf8').trim().split('\n').slice(1)).map((l) => { const f = l.split(','); return [f[0], { entry_id: f[12], input_hash: f[13] }]; }));
const prepare = (c) => { const m = L.materialize(env, c); const p = planAgenda.get(c.case_id); if (!p || p.entry_id !== m.entry_id || p.input_hash !== m.input_hash) throw new Error(`la entrada de ${c.case_id} no coincide con el plan congelado`); return m; };
const meta = { campaign: L.CAMPAIGN_ID, startedAt: new Date().toISOString(), node: process.version, platform: platform(), arch: arch(), kernel: release(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, ramMiB: Math.round(totalmem() / 2 ** 20), commit: sh('git rev-parse HEAD'), dirty: (sh('git status --porcelain -- src data scripts/sim03 scripts/node-data.js') ?? '').length > 0, app: APP_VERSION, sim: SIM_VERSION, simProfile: SIM_PROFILE_ID, resultSchema: SIM_RESULT_SCHEMA, coverage: SIM_COVERAGE_ID, statsPolicy: SIM_STATS_POLICY_ID, recon: SIM_RECON_POLICY_ID, engine: ENGINE_VERSION, blocks, limit: Number.isFinite(limit) ? limit : null };
writeFileSync(join(OUT, `run-meta-${Date.now()}.json`), JSON.stringify(meta, null, 1));

async function runSim(cases) {
  const todo = cases.filter((c) => !done.has(c.case_id) && (!only || only.has(c.case_id))).slice(0, limit); if (!todo.length) return { requested: cases.length, executed: 0 };
  const pool = new SimPool({ workers: 4 }); const ctxJSON = contextToJSON(env.ctx); await pool.start(ctxJSON, env.ctx.sp.fingerprint, env.teamMap, []); const t0 = performance.now(); let n = 0; const retry = new Map();
  const queue = todo.map((c) => ({ c, attempt: 1 })); let next = 0; const CH = 4;
  await Promise.all(pool.workers.map(async (w) => {
    for (;;) {
      if (next >= queue.length) break; const from = next; next = Math.min(queue.length, from + CH); const batch = queue.slice(from, next);
      const msgs = batch.map(({ c, attempt }) => { const m = prepare(c); return { case_id: c.case_id, input: m.input, attempt, diag: L.DIAG_SIM.includes(c.case_id), policy: true }; });
      for (const x of batch) appendFileSync(indexPath, `${JSON.stringify({ case_id: x.c.case_id, resolver: 'sim', attempt: x.attempt, status: 'started', at: Date.now() })}\n`);
      try {
        const r = await pool._send(w, { type: 'camp', cases: msgs });
        r.results.forEach(({ record, diag }, i) => { const x = batch[i]; const m = { ...record, entry_id: planAgenda.get(x.c.case_id).entry_id, input_hash: planAgenda.get(x.c.case_id).input_hash, block: x.c.block, scenario: x.c.scenario, variant: x.c.variant, orientation: x.c.orientation, replicate: x.c.replicate, seed: x.c.seed, seed_key: x.c.seed_key, testTeam: x.c.testTeam ?? null };
          appendFileSync(recSimPath, `${JSON.stringify(m)}\n`); if (diag) writeFileSync(join(OUT, 'diag', `${x.c.case_id}.json.gz`), gzipSync(JSON.stringify(diag)));
          appendFileSync(indexPath, `${JSON.stringify({ case_id: x.c.case_id, resolver: 'sim', attempt: x.attempt, status: m.status === 'finished' ? 'finished' : 'failed', valid: !!m.valid, error: m.error ?? null, at: Date.now() })}\n`); n++; });
      } catch (e) { // causa operativa (worker caído): se conserva como interrumpido y se reintenta UNA vez con la misma entrada/semilla y un intento nuevo
        for (const x of batch) { appendFileSync(indexPath, `${JSON.stringify({ case_id: x.c.case_id, resolver: 'sim', attempt: x.attempt, status: 'interrupted', error: String(e.message ?? e).slice(0, 200), at: Date.now() })}\n`); if (x.attempt === 1) { retry.set(x.c.case_id, x.c); } }
        log({ kind: 'worker', message: String(e.message ?? e).slice(0, 300), cases: batch.map((x) => x.c.case_id) });
      }
    }
  }));
  for (const c of retry.values()) { const m = prepare(c); const [{ record }] = (await pool._send(pool.workers[0], { type: 'camp', cases: [{ case_id: c.case_id, input: m.input, attempt: 2, diag: false, policy: true }] })).results; appendFileSync(recSimPath, `${JSON.stringify({ ...record, entry_id: m.entry_id, input_hash: m.input_hash, block: c.block, scenario: c.scenario, variant: c.variant, orientation: c.orientation, replicate: c.replicate, seed: c.seed, seed_key: c.seed_key, testTeam: c.testTeam ?? null })}\n`); appendFileSync(indexPath, `${JSON.stringify({ case_id: c.case_id, resolver: 'sim', attempt: 2, status: record.status === 'finished' ? 'finished' : 'failed', valid: !!record.valid, error: record.error ?? null, at: Date.now() })}\n`); n++; }
  await pool.close(); return { requested: cases.length, executed: n, wallMs: Math.round(performance.now() - t0) };
}

async function runDetailed(cases) {
  const todo = cases.filter((c) => !done.has(c.case_id) && (!only || only.has(c.case_id))).slice(0, limit); if (!todo.length) return { requested: cases.length, executed: 0 };
  const WORKERS = Number(arg('det-workers', 2)); const url = new URL('./detailed-worker.js', import.meta.url); const ws = Array.from({ length: WORKERS }, () => new Worker(url)); const pending = new Map(); let seq = 1; let n = 0; const t0 = performance.now();
  for (const w of ws) w.on('message', (m) => { const p = pending.get(m.rid); if (!p) return; pending.delete(m.rid); m.type === 'error' ? p.rej(new Error(m.error)) : p.res(m); }); for (const w of ws) w.on('error', (e) => { for (const p of pending.values()) p.rej(e); });
  const send = (w, c) => new Promise((res, rej) => { const rid = seq++; pending.set(rid, { res, rej }); w.postMessage({ rid, c }); });
  let next = 0;
  await Promise.all(ws.map(async (w) => { for (;;) { if (next >= todo.length) break; const c = todo[next++]; const m = prepare(c); appendFileSync(indexPath, `${JSON.stringify({ case_id: c.case_id, resolver: 'detailed', attempt: 1, status: 'started', at: Date.now() })}\n`);
    try { const r = await send(w, { case_id: c.case_id, input: m.input, diag: L.DIAG_DET.includes(c.case_id), attempt: 1 }); const rec = { ...r.record, entry_id: m.entry_id, input_hash: m.input_hash, block: c.block, scenario: c.scenario, variant: c.variant, orientation: c.orientation, replicate: c.replicate, seed: c.seed, seed_key: c.seed_key, testTeam: c.testTeam ?? null };
      appendFileSync(recDetPath, `${JSON.stringify(rec)}\n`); if (r.diag) writeFileSync(join(OUT, 'diag', `${c.case_id}.json.gz`), gzipSync(r.diag)); appendFileSync(indexPath, `${JSON.stringify({ case_id: c.case_id, resolver: 'detailed', attempt: 1, status: rec.status === 'finished' ? 'finished' : 'failed', valid: !!rec.valid, error: rec.error ?? null, at: Date.now() })}\n`); n++;
    } catch (e) { appendFileSync(indexPath, `${JSON.stringify({ case_id: c.case_id, resolver: 'detailed', attempt: 1, status: 'interrupted', error: String(e.message ?? e).slice(0, 200), at: Date.now() })}\n`); log({ kind: 'detailed-worker', message: String(e.message ?? e).slice(0, 300), case: c.case_id }); } } }));
  await Promise.all(ws.map((w) => w.terminate())); return { requested: cases.length, executed: n, wallMs: Math.round(performance.now() - t0) };
}

const summary = {};
for (const b of blocks) {
  if (['A', 'B', 'C'].includes(b)) summary[b] = await runSim(sim.filter((c) => c.block === b)); else if (b === 'DET') summary.DET = await runDetailed(det);
  console.log(JSON.stringify({ block: b, ...summary[b] }));
}
void createWriteStream; void gunzipSync; void bySim;
console.log(JSON.stringify({ phase, summary })); process.exit(0);
