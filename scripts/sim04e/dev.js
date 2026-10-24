// SIM-MOTOR-04E · ajuste SIM acotado sobre DESARROLLO CONOCIDO (§10): DEV-A (48 entradas) y DEV-B (24). VAL04E no se lee en ninguna fase.
//   node scripts/sim04e/dev.js --phase=config                       escribe plan/search-config.json (reglas, dominios, pasos, agenda, función objetivo, operadores y presupuesto con hash; ANTES de ejecutar y congelar)
//   node scripts/sim04e/dev.js --phase=det                          DET_04E_REF sobre las 72 entradas de desarrollo (una ejecución por entrada; anclas reutilizadas para todos los vectores)
//   node scripts/sim04e/dev.js --phase=search                       fases A–D sobre DEV-A (≤ 92 perfiles, ≤ 4.416 SIM); escribe search/devA.json y un archivo por vector
//   node scripts/sim04e/dev.js --phase=joint                        lista corta, DEV-B, reparaciones R1→R4 sobre las 72 entradas y elección final; escribe 11-BUSQUEDA-Y-SELECCION.json y las candidatas
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import * as S from './select.js';
import * as Q from './search.js';
import { evaluate, detTables } from './evaluate.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04e/plan')); const out = arg('out', join(SELF, 'out/sim-motor04e/campaign')); const phase = arg('phase', 'search');
const root = join(out, '..'); const vecDir = join(root, 'vectors'); const searchDir = join(root, 'search');
const ids = (block) => readFileSync(join(planDir, 'agenda.csv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split(',')).filter((f) => f[1] === block).map((f) => f[0]);
const devA = ids('DEV'); const devB = ids('DEVB'); const joint = [...devA, ...devB];
const { loadEnv } = await import('./lib.js'); const env = loadEnv();
const baseVal = (p) => env.ctx.sp.index.get(p).value;
const cfg = Q.buildConfig({ p3: baseVal('shots.three.p0'), p2: baseVal('shots.midrange.p0'), block: Object.fromEntries(Q.BLOCK_ZONES.map((z) => [z, baseVal(`shots.${z}.blockP0`)])) });
const wj = (p, o) => writeFileSync(p, JSON.stringify(o, null, 1));
const rj = (p) => JSON.parse(readFileSync(p, 'utf8'));

if (phase === 'config') {
  const rules = Q.buildRules(cfg); const file = { schema: 'beM-sim04e-search-config/1', frozenBeforeSearch: true, rules, agenda: { devA, devB }, rulesSha256: Q.rulesHash(cfg), vectorIdFunction: 'V-<12 hex SHA-256 de [ruta, valor] de las filas efectivas completas>' };
  mkdirSync(planDir, { recursive: true }); wj(join(planDir, 'search-config.json'), file); console.log(JSON.stringify({ phase, rulesSha256: file.rulesSha256, devA: devA.length, devB: devB.length })); process.exit(0);
}
mkdirSync(vecDir, { recursive: true }); mkdirSync(searchDir, { recursive: true }); mkdirSync(out, { recursive: true });
const frozen = join(planDir, 'search-config.json'); if (!existsSync(frozen)) { console.error('falta search-config.json: ejecutar --phase=config y congelar antes'); process.exit(2); }
if (Q.rulesHash(cfg) !== rj(frozen).rulesSha256) { console.error('las reglas del buscador no coinciden con search-config.json congelado'); process.exit(2); }

if (phase === 'det') {
  const t0 = performance.now(); const r = [];
  for (const block of ['DEV', 'DEVB']) r.push(await run({ block, identity: 'DET', resolver: 'detailed', out, planDir, detWorkers: Number(arg('det-workers', 4)) }));
  console.log(JSON.stringify({ phase, runs: r, wallMs: Math.round(performance.now() - t0) })); process.exit(0);
}

const det = (blocks, caseIds) => detTables(out, blocks, caseIds);
const simRuns = { count: 0, perProfile: {} };
const runVector = async (vec, id, block) => { const over = Q.toOverrides(cfg, vec); const r = await run({ block, identity: id, overrides: over, vectorId: id, out, planDir, workers: Number(arg('workers', 4)) }); simRuns.count += r.executed ?? 0; simRuns.perProfile[`${id}|${block}`] = r; return r; };
const detA = det('DEV', devA);

if (phase === 'search') {
  const t0 = performance.now(); let n = 0;
  const evalA = async (vec, meta) => {
    await runVector(vec, meta.id, 'DEV'); const ev = evaluate({ out, identity: meta.id, block: 'DEV', caseIds: devA, det: detA });
    wj(join(vecDir, `${meta.id}.json`), { id: meta.id, label: meta.label ?? null, op: meta.op, parent: meta.parent, phase: meta.phase, coords: vec, overrides: Q.toOverrides(cfg, vec) });
    n += 1; if (n % 10 === 0) console.log(JSON.stringify({ progress: n, wallS: Math.round((performance.now() - t0) / 1000) }));
    return { errs: ev.errs, invariantsOk: ev.invariantsOk };
  };
  const res = await Q.searchDevA({ cfg, evaluate: evalA });
  const evs = [...res.evals.values()]; const slim = (e) => ({ id: e.id, seq: e.seq, phase: e.phase, op: e.op, parent: e.parent, coords: e.vec, L: e.L, M: e.M, partialM: e.partialM, violated: e.violated, dominant: e.dominant, missing: e.missing, invariantsOk: e.invariantsOk, rowsChanged: Q.rowsChanged(cfg, e.vec), errors: e.errs });
  wj(join(searchDir, 'devA.json'), { schema: 'beM-sim04e-search-devA/1', rulesSha256: Q.rulesHash(cfg), counts: res.counts, simExecuted: simRuns.count, derived: res.derived, centers: res.centers, passes: res.passes, sealed: res.sealed, joints: res.joints, half: res.half, centerD: res.centerD, reused: res.reused, order: res.order, ranking: res.sortedIds, profiles: evs.map(slim), wallMs: Math.round(performance.now() - t0) });
  const best = res.evals.get(res.sortedIds[0]); const s0 = res.evals.get(Q.vectorId(cfg, cfg.s0));
  console.log(JSON.stringify({ phase, profiles: evs.length, counts: res.counts, sims: simRuns.count, S0: { M: s0.M, L: s0.L, violated: s0.violated }, bestByL: { id: best.id, op: best.op, M: best.M, L: best.L, violated: best.violated }, wallS: Math.round((performance.now() - t0) / 1000) })); process.exit(0);
}

if (phase === 'joint') {
  const t0 = performance.now(); const devAres = rj(join(searchDir, 'devA.json')); const evals = new Map(devAres.profiles.map((p) => [p.id, { id: p.id, vec: p.coords, errs: p.errors, invariantsOk: p.invariantsOk, L: p.L, M: p.M, violated: p.violated, dominant: p.dominant, missing: p.missing, op: p.op, parent: p.parent }]));
  const s0id = Q.vectorId(cfg, cfg.s0); const sl = Q.shortList(cfg, evals, s0id); wj(join(searchDir, 'short-list.json'), { schema: 'beM-sim04e-short-list/1', sealedBeforeDevB: true, ...sl, rulesSha256: Q.rulesHash(cfg) });
  console.log(JSON.stringify({ shortList: sl.ids, notes: sl.notes }));
  const detJ = det(['DEV', 'DEVB'], joint); const jointEval = new Map();
  const evalJoint = async (vec, meta) => {
    await runVector(vec, meta.id, 'DEV'); await runVector(vec, meta.id, 'DEVB'); // DEV-A suele estar ya ejecutado (se reutiliza), DEV-B se ejecuta aquí
    const ev = evaluate({ out, identity: meta.id, block: ['DEV', 'DEVB'], caseIds: joint, det: detJ }); const sc = S.scoreM(ev.errs);
    return { id: meta.id, vec, errs: ev.errs, invariantsOk: ev.invariantsOk, L: sc.L, M: sc.M, partialM: sc.partialM, violated: sc.violated, dominant: sc.dominant, missing: sc.missing, op: meta.op ?? evals.get(meta.id)?.op ?? null, parent: meta.parent ?? evals.get(meta.id)?.parent ?? null };
  };
  for (const id of sl.ids) { const e = evals.get(id); jointEval.set(id, await evalJoint(e.vec, { id })); }
  const rep = await Q.repairs({ cfg, joint: jointEval, evaluateJoint: evalJoint });
  const fin = Q.finalSelect(cfg, rep.evals, s0id);
  const vecOf = (id) => { const e = rep.evals.get(id); return { id, coords: e.vec, overrides: Q.toOverrides(cfg, e.vec), op: e.op ?? null, parent: e.parent ?? null, jointM: e.M, jointL: e.L, violated: e.violated, dominant: e.dominant }; };
  const cand = vecOf(fin.recommendedId); const exp = fin.experimentalId ? vecOf(fin.experimentalId) : null; const base = vecOf(s0id);
  wj(join(vecDir, 'SIM_04E_BASE.json'), { id: 'SIM_04E_BASE', ...base }); wj(join(vecDir, 'SIM_04E_CAND.json'), { id: 'SIM_04E_CAND', alias: cand.id === s0id, parent: cand.id, ...cand, note: 'candidata numérica provisional elegida solo con DEV conocido; no es aceptación deportiva ni calibración; no se activa por defecto' });
  if (exp) wj(join(vecDir, 'SIM_04E_EXPERIMENTAL.json'), { id: 'SIM_04E_EXPERIMENTAL', parent: exp.id, ...exp, note: 'mejor experimental de desarrollo (puede incumplir guardas); nunca se activa ni se presenta como aceptada' });
  const slimJ = (e) => ({ id: e.id, op: e.op ?? null, parent: e.parent ?? null, coords: e.vec, L: e.L, M: e.M, partialM: e.partialM, violated: e.violated, dominant: e.dominant, missing: e.missing, invariantsOk: e.invariantsOk, errors: e.errs });
  const result = { schema: 'beM-sim04e-search-selection/1', rulesSha256: Q.rulesHash(cfg), devA: { counts: devAres.counts, profiles: devAres.profiles.length, simExecuted: devAres.simExecuted, ranking: devAres.ranking.slice(0, 12) }, shortList: sl, repairs: rep.repairs, repairStart: rep.start, repairFinalCenter: rep.finalCenter, joint: [...rep.evals.values()].map(slimJ), final: fin,
    recommended: { id: cand.id, alias: cand.id === s0id }, experimental: exp ? { id: exp.id } : null, simExecutedJointPhase: simRuns.count, wallMs: Math.round(performance.now() - t0) };
  wj(join(root, '11-BUSQUEDA-Y-SELECCION.json'), result);
  console.log(JSON.stringify({ phase, recommended: cand.id, alias: cand.id === s0id, experimental: exp?.id ?? null, reason: fin.reason, S0: fin.s0, best: fin.best, repairs: rep.repairs.map((r) => ({ op: r.op, id: r.id, adopted: r.adopted, M: r.M, L: r.L, omitted: r.omitted })), sims: simRuns.count })); process.exit(0);
}
console.error(`fase desconocida: ${phase}`); process.exit(2);
