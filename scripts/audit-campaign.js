// Campaña inicial de MOTOR-13 (§13): doce contrastes × dos variantes = 24 encuentros nuevos con el controlador de lotes de MOTOR-12 (sin simulador rápido ni otro resolutor).
//   node scripts/audit-campaign.js --plan [--out <dir>]   congela el plan (actores, intervención, variables conservadas, semillas derivadas, agenda) SIN ejecutar nada
//   node scripts/audit-campaign.js --run  [--root <dir>]  ejecuta los doce lotes (EXP13-08 y EXP13-11 con diagnóstico completo, el resto reducido) y escribe `campaign.json`
//   node scripts/audit-campaign.js --validation [--root <dir>]  reserva de validación (4 casos × base/candidata), solo si existe una candidata con cambio real
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, ROOT } from './node-data.js';
import { prepareBatch } from '../src/batch/schedule.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor } from '../src/batch/executors.js';
import { experimentCatalog, experimentSpec, validationCatalog } from '../src/audit/experiments.js';

const args = process.argv.slice(2); const flag = (k) => args.includes(k); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const { profile, players } = loadData(); const exps = experimentCatalog(profile, players);

if (flag('--plan')) {
  const out = opt('--out', join(ROOT, 'docs/tecnico/evidencia-motor13')); mkdirSync(out, { recursive: true });
  const plan = { schema: 'beM-audit-campaign-plan/1', frozen_before_results: true, engine_note: 'Plan generado SIN ejecutar ningún partido: población, actores, intervención, variables conservadas y semillas derivadas (LOT-SEED-R1) quedan fijados antes de mirar resultados.', audit_profile: profile.audit.version, effective_profile_id: profile.effectiveId,
    experiments: exps.map((e) => { const r = prepareBatch(experimentSpec(e, profile, players), profile, { players }); if (!r.ok) throw new Error(`${e.id}: ${r.problems.join('; ')}`);
      return { id: e.id, name: e.name, hypothesis: e.hypothesis, pair: e.pair, record_level: e.level, lot_seed: e.batchSeed, derived_sport_seeds: r.agenda.executions.map((x) => ({ match_id: x.match_id, variant_id: x.variant_id, seed: x.seed })), capabilities_touched: e.capabilities, metrics: e.metrics, conserved: e.conserved, base_has_intervention: !!e.allowBaseOps,
        variants: e.variants.map((v) => ({ id: v.id, label: v.label, ops: v.ops ?? [], changes: (r.diffs[v.id]?.[0]?.changes ?? 0) })), counts: r.counts.explain }; }),
    validation_reserve: validationCatalog(profile).map((v) => ({ id: v.id, pair: v.pair, lot_seed: v.batchSeed, record_level: 'reduced', note: 'Solo se ejecuta base/candidata (hasta 8 encuentros) si existe una candidata con cambio real; no se usa para repetir ciclos de ajuste.' })) };
  writeFileSync(join(out, 'plan-campana.json'), `${JSON.stringify(plan, null, 1)}\n`); console.log(`plan escrito: ${join(out, 'plan-campana.json')} · ${plan.experiments.length} experimentos · ${plan.experiments.reduce((s, e) => s + e.derived_sport_seeds.length, 0)} encuentros`); process.exit(0);
}

const root = opt('--root', process.env.BEM_BATCH_ROOT ?? join(ROOT, 'out', 'batches')); const store = new JobStore(root); const ctl = new BatchController({ store, executor: new InlineExecutor({ store }) });
const outDir = join(ROOT, 'out', 'audit'); mkdirSync(outDir, { recursive: true }); const tag = opt('--tag', 'R1');
async function runLot(spec, label) {
  const cr = ctl.create(spec, profile, { players, label }); if (!cr.ok) throw new Error(`${label}: ${cr.problems.join('; ')}`);
  const t0 = performance.now(); const run = await ctl.run(cr.batchId); const end = await run.done; const st = ctl.status(cr.batchId, { rows: true });
  return { label, batchId: cr.batchId, state: end.state, counters: st.counters, wall_ms: Math.round(performance.now() - t0), matches: st.matches.map((m) => ({ match_id: m.match_id, case_id: m.case_id, variant_id: m.variant_id, exec_state: m.exec_state, valid: m.valid, score: `${m.facts?.score_home}–${m.facts?.score_away}`, draws: m.facts?.draws, trajectory_fp: m.facts?.trajectory_fp, exec_ms: Math.round(m.exec_ms) })) };
}
if (flag('--run')) {
  const res = []; for (const e of exps) { const r = await runLot(experimentSpec(e, profile, players), `${e.id} ${tag}`); res.push({ experiment: e.id, ...r }); console.log(e.id, r.batchId, r.state, r.matches.map((m) => `${m.variant_id} ${m.score} ${m.valid ? 'válido' : 'NO válido'}`).join(' · '), `${(r.wall_ms / 1000).toFixed(1)} s`); }
  const total = res.reduce((s, r) => s + r.matches.length, 0); const valid = res.reduce((s, r) => s + r.matches.filter((m) => m.valid).length, 0);
  console.log(`campaña: ${total} encuentros, ${valid} válidos`); writeFileSync(join(outDir, `campaign-${tag}.json`), `${JSON.stringify({ schema: 'beM-audit-campaign-run/1', tag, root, effective_profile_id: profile.effectiveId, experiments: res }, null, 1)}\n`);
  process.exit(valid === total ? 0 : 1);
}
if (flag('--validation')) {
  const cand = JSON.parse((await import('node:fs')).readFileSync(opt('--candidate'), 'utf8')); void cand; console.log('use scripts/audit-calibrate.js'); process.exit(0);
}
console.log('uso: --plan | --run | --validation'); process.exit(2);
