// SIM-MOTOR-04B · ejecutor programado de la campaña acotada (§10). Fork de scripts/sim04/exec.mjs con las poblaciones, los bloques (CAL/VAL/STRESS/CONTRAST/DIAG/OPT/TECH) y las identidades de 04B. Una sola herramienta para TODAS las identidades (R0, R1, vectores candidatos, control/final, rutas TECH): lo que cambia es la RAÍZ DE CÓDIGO (`--root`,
// un worktree aislado del mismo repositorio beM para R0 o el control preoptimización; no se introducen resolutores históricos en el producto) y el vector de parámetros (`--overrides`).
//   plan : node scripts/sim04b/exec.mjs --phase=plan [--plan=docs/tecnico/evidencia-sim-motor04bb/plan]     escribe agendas, entradas y plan (para Git, ANTES de ejecutar CAL)
//   run  : node scripts/sim04b/exec.mjs --phase=run --block=CAL|VAL|STRESS|CONTRAST|DIAG|OPT|TECH --identity=R04|R04B-N|C04B-Z1|… [--root=<código>] [--overrides=<archivo.json>] [--resolver=sim|detailed]
//          [--cases=a,b,c] [--route=steps|recover] [--out=out/sim-motor04b/campaign]
// Cada caso se regenera desde la ENTRADA CONGELADA del plan (entries.jsonl.gz + semilla) y se comprueba su `input_hash`: una entrada distinta aborta el caso. Persistencia progresiva y reanudación por (identidad, bloque, caso).
// Un caso terminado (válido o no) no se repite; solo una causa operativa identificada (worker caído) se reintenta, con la misma entrada y semilla y un intento nuevo.
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { cpus, release, platform, arch, totalmem } from 'node:os';
import { createHash } from 'node:crypto';
import { canonical } from '../../src/sim/fp.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
export const csv = (rows) => rows.map((r) => r.map((v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n') + '\n';
const sh = (c, cwd = SELF) => { try { return execSync(c, { cwd }).toString().trim(); } catch { return null; } };
const sha256 = (x) => createHash('sha256').update(x).digest('hex');
// La entrada regenerada debe reproducir EXACTAMENTE el `input_hash` del plan congelado (SHA-256 de la forma canónica con semilla); una entrada distinta aborta.
const verify = (a, input) => { const h = sha256(canonical(input)); if (h !== a.input_hash) throw new Error(`la entrada de ${a.case_id} no coincide con el plan congelado (${h.slice(0, 12)} ≠ ${a.input_hash.slice(0, 12)})`); return true; };
export const AGENDA_COLS = ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'seed_key', 'seed', 'ordinal', 'team0', 'team1', 'test_team', 'entry_id', 'input_hash', 'anchor', 'diag', 'diag_det', 'tech', 'opt', 'learning', 'history_mixed'];

// ---------------------------------------------------------------------------------------------------------------------------------- fase plan
export async function plan({ planDir }) {
  const L = await import('./lib.js'); const { contrastDefs } = L; const env = L.loadEnv(); const C = L.allCases(env); mkdirSync(planDir, { recursive: true });
  const entries = new Map(); const rows = []; const bad = []; const t0 = performance.now(); const all = [...C.cal, ...C.val, ...C.stress, ...C.contrast];
  for (const c of all) {
    const m = L.materialize(env, c); entries.set(m.entry_id, (({ seed, ...r }) => r)(m.input)); const v = L.validateBoth(env, m.input);
    if (v.sim.length || ((c.anchor || L.DIAG_DET.includes(c.case_id)) && v.detailed.length)) bad.push({ case_id: c.case_id, sim: v.sim, detailed: v.detailed });
    rows.push([c.case_id, c.block, c.scenario, c.variant, c.orientation, c.replicate, c.seed_key, c.seed, c.ordinal, c.teams[0], c.teams[1], c.testTeam ?? '', m.entry_id, m.input_hash, c.anchor ? 1 : 0, L.DIAG_SIM.includes(c.case_id) ? 1 : 0, L.DIAG_DET.includes(c.case_id) ? 1 : 0, L.TECH_CASES.includes(c.case_id) ? 1 : 0, L.OPT_CASES.includes(c.case_id) ? 1 : 0, L.LEARNING_PAIRS.some((p) => p.sim === c.case_id) ? 1 : 0, L.MIXED_HISTORY_ANCHORS.includes(c.case_id) ? 1 : 0]);
  }
  writeFileSync(join(planDir, 'agenda.csv'), csv([AGENDA_COLS, ...rows]));
  writeFileSync(join(planDir, 'entries.jsonl.gz'), gzipSync([...entries.entries()].map(([id, inp]) => JSON.stringify({ entry_id: id, input: inp })).join('\n')));
  // una misma semilla es legítima SOLO entre las dos variantes de un par de CONTRAST (misma clave); duplicada entre claves distintas sería una colisión no resuelta
  const bySeed = new Map(); for (const r of rows) { const set = bySeed.get(r[7]) ?? bySeed.set(r[7], new Set()).get(r[7]); set.add(r[6]); } const dup = [...bySeed.values()].filter((st) => st.size > 1).length;
  const defs = contrastDefs(env).map((d) => ({ id: d.id, factor: d.factor, pair: d.pair, note: d.note ?? null, variants: d.variants.map((x) => ({ id: x.id, label: x.label })) }));
  const out = { schema: 'beM-sim04b-plan/1', campaign: L.CAMPAIGN_ID, master: L.MASTER, namespaces: L.NAMESPACES, seedFunction: 'SHA-256 de «<maestra>|<espacio>|<clave>|<etiqueta>» (+ «#n» ante colisión), primeros 32 bits sin signo (0 → 1)', collisions: C.seeder.collisions, duplicateSeedsInPlan: dup,
    mainTeams: L.MAIN_TEAMS, stressTeams: L.STRESS_TEAMS, counts: { CAL: C.cal.length, VAL: C.val.length, STRESS: C.stress.length, CONTRAST: C.contrast.length, anchorsCAL: C.cal.filter((c) => c.anchor).length, anchorsVAL: C.val.filter((c) => c.anchor).length, anchorsSTRESS: C.stress.filter((c) => c.anchor).length, anchorsCONTRAST: C.contrast.filter((c) => c.anchor).length },
    contrast: defs.filter((d) => L.CONTRAST_FACTORS.includes(d.id)), contrastFactors: L.CONTRAST_FACTORS, contrastAnchors: L.CONTRAST_ANCHORS, stressPairs: L.STRESS_PAIRS, calPairs: L.CAL_PAIRS, valPairs: L.VAL_PAIRS, diagSim: L.DIAG_SIM, diagDetailed: L.DIAG_DET, optCases: L.OPT_CASES, optNeutral: L.OPT_NEUTRAL, optCandidate: L.OPT_CANDIDATE, techCases: L.TECH_CASES, techRouteNames: L.TECH_ROUTE_NAMES, techRoutes: L.TECH_ROUTES, learningPairs: L.LEARNING_PAIRS, historyMixedAnchors: L.MIXED_HISTORY_ANCHORS, unplannedInvalid: bad };
  writeFileSync(join(planDir, 'plan.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ phase: 'plan', cases: all.length, entries: entries.size, invalidAtPlan: bad.length, duplicateSeeds: dup, collisions: C.seeder.collisions.length, ms: Math.round(performance.now() - t0), planDir }));
  return { bad, dup };
}

// ---------------------------------------------------------------------------------------------------------------------------------- lectura de la agenda congelada
export function loadAgenda(planDir) {
  const [h, ...ls] = readFileSync(join(planDir, 'agenda.csv'), 'utf8').trim().split('\n'); const cols = h.split(','); const agenda = new Map();
  for (const l of ls) { const f = l.split(','); const o = Object.fromEntries(cols.map((c, i) => [c, f[i]])); o.seed = Number(o.seed); o.replicate = Number(o.replicate); agenda.set(o.case_id, o); }
  const entries = new Map(gunzipSync(readFileSync(join(planDir, 'entries.jsonl.gz'))).toString().split('\n').filter(Boolean).map((l) => { const x = JSON.parse(l); return [x.entry_id, x.input]; }));
  return { agenda, entries };
}
const inputOf = (a, entries) => { const e = entries.get(a.entry_id); if (!e) throw new Error(`entrada ausente en el plan: ${a.case_id}`); const input = { ...JSON.parse(JSON.stringify(e)), seed: a.seed }; return input; };

// ---------------------------------------------------------------------------------------------------------------------------------- fase run
// `root`: raíz de código (por defecto, este repositorio). `overrides`: filas [{path, value}] aplicadas sobre el perfil SIM de esa raíz.
export async function run(opts) {
  const { block, identity, root = SELF, overrides = [], resolver = 'sim', only = null, route = null, out, planDir, diagSet = null, workers = 4, detWorkers = 2 } = opts;
  const { agenda, entries } = loadAgenda(planDir); mkdirSync(join(out, 'diag'), { recursive: true });
  const idxPath = join(out, 'index.jsonl'); const recPath = join(out, `records-${resolver}-${identity}.jsonl`); const incPath = join(out, 'incidents.jsonl');
  const done = new Map(); if (existsSync(idxPath)) for (const l of readFileSync(idxPath, 'utf8').split('\n').filter(Boolean)) { const x = JSON.parse(l); if (x.identity === identity && x.block === block && x.resolver === resolver && ['finished', 'failed'].includes(x.status)) done.set(x.case_id, x); }
  const inc = (o) => appendFileSync(incPath, `${JSON.stringify({ at: new Date().toISOString(), identity, block, ...o })}\n`);
  let cases = [...agenda.values()].filter((a) => (block === 'OPT' ? a.opt === '1' : block === 'DIAG' ? (diagSet ? diagSet.includes(a.case_id) : a.diag === '1') : block === 'TECH' ? a.tech === '1' : a.block === block));
  if (resolver === 'detailed') cases = cases.filter((a) => (block === 'DIAG' ? a.diag_det === '1' : a.anchor === '1'));
  if (only) cases = cases.filter((a) => only.includes(a.case_id));
  const todo = cases.filter((a) => !done.has(a.case_id)); if (!todo.length) return { block, identity, resolver, requested: cases.length, executed: 0, skipped: cases.length };
  for (const a of todo) verify(a, inputOf(a, entries)); // toda la agenda se comprueba contra el plan ANTES de lanzar nada
  const meta = { identity, block, resolver, startedAt: new Date().toISOString(), root: resolve(root), node: process.version, platform: platform(), arch: arch(), kernel: release(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, ramMiB: Math.round(totalmem() / 2 ** 20), commit: sh('git rev-parse HEAD', root), dirty: (sh('git status --porcelain -- src data scripts', root) ?? '').length > 0, overrides, route };
  writeFileSync(join(out, `run-meta-${identity}-${block}-${resolver}-${Date.now()}.json`), JSON.stringify(meta, null, 1));
  const t0 = performance.now(); let n = 0;
  const writeRec = (a, rec, diag) => { const m = { ...rec, campaign: 'SIM04B-CAMPANA-20261023', run: identity, block, scenario: a.scenario, variant: a.variant, orientation: a.orientation, replicate: a.replicate, seed: a.seed, seed_key: a.seed_key, entry_id: a.entry_id, input_hash: a.input_hash, testTeam: a.test_team || null, teams: [a.team0, a.team1] };
    appendFileSync(recPath, `${JSON.stringify(m)}\n`); if (diag) writeFileSync(join(out, 'diag', `${identity}__${resolver}__${a.case_id}.json.gz`), gzipSync(typeof diag === 'string' ? diag : JSON.stringify(diag)));
    appendFileSync(idxPath, `${JSON.stringify({ identity, block, resolver, case_id: a.case_id, attempt: rec.attempt ?? 1, status: rec.status === 'finished' ? 'finished' : 'failed', valid: !!rec.valid, error: rec.error ?? null, at: Date.now() })}\n`); n++; };
  const url = (rel) => pathToFileURL(join(root, rel)).href;
  if (resolver === 'sim') {
    const { loadData } = await import(url('scripts/node-data.js')); const { makeContext, contextToJSON } = await import(url('src/sim/context.js')); const { SimPool } = await import(url('src/sim/pool.js'));
    const { profile } = loadData(); const ctx = makeContext(profile, overrides.length ? overrides : null); const pool = new SimPool({ workers }); await pool.start(contextToJSON(ctx), ctx.sp.fingerprint, {}, []);
    const queue = todo.map((a) => ({ a, attempt: 1 })); let next = 0; const retry = new Map(); const CH = 4;
    const caseMsg = (a, attempt) => { const input = inputOf(a, entries); verify(a, input); const rt = route ? (opts.routes?.[a.case_id] ?? {}) : {}; return { case_id: a.case_id, input, attempt, diag: block === 'DIAG' || (diagSet ? diagSet.includes(a.case_id) : false), policy: true, ...(route ? { route, steps: rt.steps, cuts: rt.cuts } : {}) }; };
    await Promise.all(pool.workers.map(async (w) => { for (;;) {
      if (next >= queue.length) break; const from = next; next = Math.min(queue.length, from + CH); const batch = queue.slice(from, next);
      for (const x of batch) appendFileSync(idxPath, `${JSON.stringify({ identity, block, resolver, case_id: x.a.case_id, attempt: x.attempt, status: 'started', at: Date.now() })}\n`);
      try { const r = await pool._send(w, { type: 'camp', cases: batch.map((x) => caseMsg(x.a, x.attempt)) }); r.results.forEach(({ record, diag }, i) => writeRec(batch[i].a, record, diag)); }
      catch (e) { for (const x of batch) { appendFileSync(idxPath, `${JSON.stringify({ identity, block, resolver, case_id: x.a.case_id, attempt: x.attempt, status: 'interrupted', error: String(e.message ?? e).slice(0, 200), at: Date.now() })}\n`); if (x.attempt === 1) retry.set(x.a.case_id, x.a); } inc({ kind: 'worker', message: String(e.message ?? e).slice(0, 300), cases: batch.map((x) => x.a.case_id) }); }
    } }));
    for (const a of retry.values()) { const [{ record, diag }] = (await pool._send(pool.workers[0], { type: 'camp', cases: [caseMsg(a, 2)] })).results; writeRec(a, record, diag); }
    await pool.close();
  } else {
    const detUrl = new URL('./detailed-worker.js', import.meta.url); const ws = Array.from({ length: detWorkers }, () => new Worker(detUrl)); const pending = new Map(); let seq = 1;
    for (const w of ws) { w.on('message', (m) => { const p = pending.get(m.rid); if (!p) return; pending.delete(m.rid); m.type === 'error' ? p.rej(new Error(m.error)) : p.res(m); }); w.on('error', (e) => { for (const p of pending.values()) p.rej(e); }); }
    const send = (w, c) => new Promise((res, rej) => { const rid = seq++; pending.set(rid, { res, rej }); w.postMessage({ rid, c }); }); let next = 0;
    await Promise.all(ws.map(async (w) => { for (;;) { if (next >= todo.length) break; const a = todo[next++]; const input = inputOf(a, entries); appendFileSync(idxPath, `${JSON.stringify({ identity, block, resolver, case_id: a.case_id, attempt: 1, status: 'started', at: Date.now() })}\n`);
      try { const r = await send(w, { case_id: a.case_id, input, diag: block === 'DIAG', attempt: 1 }); writeRec(a, r.record, r.diag); } catch (e) { appendFileSync(idxPath, `${JSON.stringify({ identity, block, resolver, case_id: a.case_id, attempt: 1, status: 'interrupted', error: String(e.message ?? e).slice(0, 200), at: Date.now() })}\n`); inc({ kind: 'detailed-worker', message: String(e.message ?? e).slice(0, 300), case: a.case_id }); } } }));
    await Promise.all(ws.map((w) => w.terminate()));
  }
  return { block, identity, resolver, requested: cases.length, executed: n, wallMs: Math.round(performance.now() - t0) };
}

// ---------------------------------------------------------------------------------------------------------------------------------- CLI
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const phase = arg('phase', 'run'); const planDir = arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04bb/plan')); const out = arg('out', join(SELF, 'out/sim-motor04b/campaign'));
  if (phase === 'plan') { const { bad } = await plan({ planDir }); process.exit(bad.length ? 1 : 0); }
  const ov = arg('overrides'); const ovRaw = ov ? JSON.parse(readFileSync(ov, 'utf8')) : []; const overrides = Array.isArray(ovRaw) ? ovRaw : ovRaw.overrides; if (!Array.isArray(overrides)) throw new Error('--overrides debe ser una lista [{path,value}] o un vector {overrides:[…]}');
  const routes = arg('routes') ? JSON.parse(readFileSync(arg('routes'), 'utf8')) : undefined;
  const r = await run({ block: arg('block'), identity: arg('identity'), root: arg('root', SELF), overrides, resolver: arg('resolver', 'sim'), only: arg('cases') ? arg('cases').split(',') : null, route: arg('route'), routes, out, planDir, workers: Number(arg('workers', 4)), detWorkers: Number(arg('det-workers', 2)) });
  console.log(JSON.stringify(r)); process.exit(0);
}
