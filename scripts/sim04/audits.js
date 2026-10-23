// SIM-MOTOR-03 · auditorías (§8.5). Reutiliza el catálogo AUD01–AUD32 heredado (evidencia del DETALLADO) sin obligar a SIM a producir diagnósticos exclusivos del detallado, y separa las conciliaciones propias de SIM
// (R01–R23). El catálogo heredado se ejecuta sobre un lote DIAGNÓSTICO de los cuatro detallados de la muestra preseleccionada (mismas entradas y semillas que la campaña; las ejecuciones extra se cuentan aparte como
// verificación) y la igualdad de su marcador con el de la campaña se comprueba. «No evaluado» nunca se transforma en aprobado.
//   node scripts/sim03/audits.js --phase=lots  --plan=<plan> --campaign=<dir> --out=<dir>     crea y ejecuta los lotes diagnósticos y corre AUD01–32
//   node scripts/sim03/audits.js --phase=tables --campaign=<dir> --out=<dir>                  catálogo, aplicabilidad y conciliaciones SIM
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as L from './lib.js';
import { readJsonl, csvText } from './tables.js';
import { AUDIT_CATALOG } from '../../src/audit/catalog.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const phase = arg('phase', 'tables'); const root = new URL('../..', import.meta.url).pathname; const CAMP = arg('campaign', join(root, 'out/sim-motor03/campaign')); const OUT = arg('out', join(root, 'out/sim-motor03/audits')); mkdirSync(OUT, { recursive: true });
const env = L.loadEnv(); const { det } = L.allCases(env); const byDet = new Map(det.map((c) => [c.case_id, c]));

// Aplicabilidad a SIM de cada auditoría heredada: SIM no genera el diagnóstico por decisión del detallado, así que solo lo que se apoya en acta/estadística/población/coste tiene analogía.
const SIM_ANALOG = { AUD01: 'conciliaciones propias R01–R23 sobre el acta SIM (no son las 33+23 del detallado)', AUD27: 'equipo = suma de jugadores + colectivo, calculado sobre el esencial SIM', AUD30: 'las entradas son las mismas doce plantillas EQ01–EQ12 del detallado', AUD31: 'puntos, controles SIM y extremos desde la tabla de equipo (universo propio)', AUD32: 'comprobador offline de la entrega: hashes y tamaños' };
const catalogRows = () => AUDIT_CATALOG.map((a) => [a.id, a.name, a.area, a.type, a.question, a.hypothesis, a.inputs.join('; '), a.tolerance, a.severity, 'aplicable (evidencia del detallado: lote diagnóstico de la muestra)', SIM_ANALOG[a.id] ? `analogía propia: ${SIM_ANALOG[a.id]}` : 'no aplicable a SIM: exige diagnóstico por decisión exclusivo del detallado (no se fabrica)']);

if (phase === 'tables') {
  const sim = readJsonl(join(CAMP, 'records-sim.jsonl')); const last = new Map(); for (const r of sim) { const p = last.get(r.case_id); if (!p || r.attempt >= p.attempt) last.set(r.case_id, r); }
  const recs = [...last.values()]; const finished = recs.filter((r) => r.status === 'finished'); const ids = new Map(); const rows = [];
  for (const r of finished) for (const [id, ok, universe, fc] of r.recon ?? []) { const x = ids.get(id) ?? { id, cases: 0, passed: 0, failed: 0, universe: 0, failures: 0 }; x.cases += 1; if (ok) x.passed += 1; else x.failed += 1; x.universe += universe ?? 0; x.failures += fc ?? 0; ids.set(id, x); }
  for (const x of ids.values()) rows.push([x.id, 'SIM', x.cases, x.passed, x.failed, x.universe, x.failures, x.failed === 0 ? 'conforme en todos los casos evaluados' : 'FALLOS']);
  writeFileSync(join(OUT, 'auditorias-catalogo.csv'), csvText(['id', 'nombre', 'area', 'tipo', 'pregunta', 'hipotesis', 'entradas', 'tolerancia', 'severidad', 'detallado', 'sim'], catalogRows()));
  writeFileSync(join(OUT, 'auditorias-sim-conciliaciones.csv'), csvText(['conciliacion', 'modelo', 'casos_evaluados', 'conformes', 'con_fallo', 'universo_total', 'fallos_total', 'resultado_automatico'], rows));
  const notEval = {}; for (const r of finished) for (const n of r.notEvaluated ?? []) notEval[typeof n === 'string' ? n : n.id ?? JSON.stringify(n)] = (notEval[typeof n === 'string' ? n : n.id ?? JSON.stringify(n)] ?? 0) + 1;
  writeFileSync(join(OUT, 'auditorias-sim-resumen.json'), JSON.stringify({ requested: recs.length, finished: finished.length, valid: finished.filter((r) => r.valid).length, invalid: finished.filter((r) => !r.valid).length, failedRuns: recs.length - finished.length, conciliaciones: rows.length, notEvaluated: notEval, note: 'una conciliación no evaluada no cuenta como aprobada' }, null, 1));
  console.log(JSON.stringify({ phase, finished: finished.length, conciliaciones: rows.length })); process.exit(0);
}

// ---------------------------------------------------------------------------------------------------------------------------------- lotes diagnósticos del detallado y AUD01–32
const { JobStore, loadFrozen } = await import('../../src/batch/jobstore.js'); const { BatchController } = await import('../../src/batch/runner.js'); const { WorkerPool } = await import('../../src/batch/executors.js'); const { prepareBatch } = await import('../../src/batch/schedule.js'); const { freezeBatch } = await import('../../src/batch/freeze.js');
const { runAudit, saveResult } = await import('../../src/audit/index.js'); void loadFrozen;
const LOTS = arg('lots', join(OUT, 'lotes')); if (existsSync(LOTS) && arg('fresh', '1') === '1') rmSync(LOTS, { recursive: true, force: true }); mkdirSync(LOTS, { recursive: true });
const store = new JobStore(LOTS); const pool = new WorkerPool({ store, size: 2 }); const ctl = new BatchController({ store, executor: pool });
const planBy = new Map(); const detCampaign = new Map(readJsonl(join(CAMP, 'records-detailed.jsonl')).map((r) => [r.case_id, r]));
const out = { schema: 'beM-sim03-audits/1', lots: [], findings: [], notes: 'cuatro ejecuciones detalladas extra (mismas entradas y semillas que la muestra diagnóstica) en formato de lote diagnóstico; se cuentan como verificación, no como casos de comparación' };
const specs = [];
for (const id of L.DIAG_DET) {
  const c = byDet.get(id); const m = L.materialize(env, c); const inp = m.input; const teams = Object.fromEntries(inp.teams.map((t) => [t.id, t]));
  const spec = { mode: 'pairs', pairs: [[inp.teams[0].id, inp.teams[1].id]], venue: 'fixed', repetitions: 1, teams, batchSeed: c.seed, caseSeeds: [c.seed], allowBaseOps: true, recordLevel: 'diagnostic', prose: 'omitted', concurrency: 1, importance: 'ordinary', objective: `SIM03 diagnóstico ${id}` };
  const prep = prepareBatch(spec, env.profile, { players: env.players }); if (!prep.ok) { out.lots.push({ case_id: id, ok: false, problems: prep.problems }); continue; }
  const batchId = `LOT-S03-${id.replace(/[^A-Za-z0-9]/g, '').slice(0, 24)}`; const frozen = freezeBatch(prep, env.profile, { batchId, now: Date.now, label: `SIM03 ${id}`, revisionOf: null, revision: 1 });
  store.writeFrozen(batchId, frozen.files); store.writeJob(batchId, frozen.job);
  const r = await ctl.run(batchId, { concurrency: 1 }); if (!r.ok) { out.lots.push({ case_id: id, ok: false, reason: r.reason }); continue; } const end = await r.done; const st = ctl.status(batchId);
  const idx = store.readIndex(batchId).filter((x) => x.type === 'attempt').at(-1);
  let scoreMatch = null; let lotScore = null; if (idx?.facts) { lotScore = [idx.facts.score_home, idx.facts.score_away]; const camp = detCampaign.get(id); scoreMatch = camp ? JSON.stringify(camp.score) === JSON.stringify(lotScore) : null; }
  out.lots.push({ case_id: id, batch_id: batchId, state: end.state, counters: st.counters, lotScore, campaignScoreEqual: scoreMatch, input_hash: m.input_hash }); specs.push({ kind: 'lote', id: batchId, root: LOTS });
}
const ok = specs.length > 0; if (ok) {
  const res = runAudit(specs, { profile: env.profile, auditRoot: join(OUT, 'audit-cache') });
  if (!res.ok) { out.audit = { ok: false, reason: res.reason }; } else { saveResult(res, join(OUT, 'audit-result')); out.audit = { ok: true, id: res.id, sample: res.sample, integrity: res.integrity, runs: res.runs.map((r) => ({ audit: r.audit ?? r.id, status: r.status ?? r.state, summary: r.summary ?? r.result ?? null })), findings: res.findings?.length ?? 0 }; out.result = res; }
}
writeFileSync(join(OUT, 'auditorias-detallado.json'), JSON.stringify(out, null, 1)); await pool.close();
console.log(JSON.stringify({ phase, lots: out.lots.map((l) => [l.case_id, l.state ?? l.reason, l.campaignScoreEqual]), audit: out.audit ? { ok: out.audit.ok, runs: out.audit.runs?.length, findings: out.audit.findings } : null })); process.exit(0);
