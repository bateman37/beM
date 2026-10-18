// MOTOR-15B §5: auditorías con la procedencia correcta de la evidencia. Dos fuentes y un lector:
//  1. LOTES DE REPRODUCCIÓN de los casos C15-01…05 (mismas entradas congeladas y semillas deportivas de MOTOR-15, nivel diagnóstico): se identifican como REPRODUCCIÓN y se comprueba que su huella de
//     trayectoria coincide con la de C15 (resumen.json de la integración). C15-06 usa un guion de órdenes que un lote no reproduce: no se incluye y se declara.
//  2. El lote histórico LOT-9e1cfb78 (auditoría de MOTOR-15; NO son los C15): se vuelve a LEER con el lector corregido, sin simular, con su alcance verdadero.
// Salida (fuera de Git): <out>/auditoria/{c15-lote-A,c15-lote-B,reproduccion.json,resultado-c15.json,resultado-historico.json,resumen.json}.
// Uso: node scripts/m15b-audit.js [--out=out/motor15b] [--c15=out/motor15] [--historic=out/motor15/auditoria/lotes]
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import * as P from '../src/population/index.js';
import { fnv1a32 } from '../src/population/hash.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor } from '../src/batch/executors.js';
import { runAudit } from '../src/audit/index.js';
import { ENGINE_VERSION } from '../src/match/index.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = join(arg('out', 'out/motor15b'), 'auditoria'); rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const C15 = arg('c15', 'out/motor15'); const HISTORIC = arg('historic', 'out/motor15/auditoria/lotes');
const { profile, players } = loadData();
const c15 = JSON.parse(readFileSync(join(C15, 'integracion/resumen.json'), 'utf8'));
const fpOf = (id) => c15.cases.find((c) => c.id === id);
const c15b = JSON.parse(readFileSync(join(arg('c15b', 'out/motor15b'), 'integracion/resumen.json'), 'utf8')); // reejecución de los C15 con el motor actual
const fpB = (id) => c15b.cases.find((c) => c.id === id);
const team = (id) => P.referenceTeam(profile, players, id);
// C15-01 usa el escenario por defecto del perfil (planes de `profile.scenario.plans`), no el plan natural de referenceTeam: se congela con ese plan para que la entrada sea la misma.
const scenarioTeam = (id) => { const plan = profile.scenario.plans.find((x) => x.teamId === id); return { id, name: profile.fixtureContract.teamNames[id], players: JSON.parse(JSON.stringify(players.filter((p) => p.teamId === id))), plan: JSON.parse(JSON.stringify(plan)) }; };
const fatigue = () => { const t = JSON.parse(JSON.stringify(team('EQ11'))); const st = new Set(Object.values(t.plan.starters)); for (const p of t.players) p.state = { ...p.state, energy: st.has(p.id) ? 8 : 30 }; return t; };

const lots = [
  { key: 'A', label: 'C15-01…04 (reproducción)', cases: ['C15-01', 'C15-02', 'C15-03', 'C15-04'], pairs: [['EQ01', 'EQ02'], ['EQ03', 'EQ09'], ['EQ07', 'EQ08'], ['EQ11', 'EQ12']], teams: () => ({ ...Object.fromEntries(['EQ03', 'EQ09', 'EQ07', 'EQ08', 'EQ11', 'EQ12'].map((id) => [id, team(id)])), EQ01: scenarioTeam('EQ01'), EQ02: scenarioTeam('EQ02') }) },
  { key: 'B', label: 'C15-05 (reproducción; copia extrema de fatiga)', cases: ['C15-05'], pairs: [['EQ11', 'EQ12']], teams: () => ({ EQ11: fatigue(), EQ12: team('EQ12') }) },
];
const repro = { engine: ENGINE_VERSION, kind: 'reproducción de casos C15 (no son los archivos originales de MOTOR-15)', note: 'Mismas entradas congeladas y semillas deportivas; se compara la huella de trayectoria con la de C15. C15-06 (guion de órdenes) no se reproduce en un lote y no se audita aquí.', lots: [] };
const specs = [];
for (const L of lots) {
  const root = join(OUT, `c15-lote-${L.key}`); const store = new JobStore(root); const ctl = new BatchController({ store, executor: new InlineExecutor({ store }) });
  const seeds = L.cases.map((id) => fpOf(id).seed);
  const spec = { mode: 'pairs', pairs: L.pairs, repetitions: 1, venue: 'fixed', batchSeed: fnv1a32(`AUD-M15B-${L.key}-20261017`), caseSeeds: seeds, teams: L.teams(), recordLevel: 'diagnostic', concurrency: 1, variants: [{ id: 'V0', label: 'Base' }] };
  const cr = ctl.create(spec, profile, { players, label: `M15B reproducción ${L.label}` }); if (!cr.ok) { console.error(cr.problems); process.exit(1); }
  const run = await ctl.run(cr.batchId); await run.done;
  const att = store.readIndex(cr.batchId).filter((r) => r.type === 'attempt' && r.exec_state === 'terminada');
  const cases = L.cases.map((id, i) => { const a = att.find((x) => x.match_id === `M${String(i + 1).padStart(6, '0')}`); const ref = fpOf(id); const rb = fpB(id); const rep = a?.facts?.trajectory_fp ?? null;
    return { c15: id, case_id: `C${String(i + 1).padStart(6, '0')}`, match_id: a?.match_id ?? null, attempt_id: a?.attempt_id ?? null, seed: ref.seed,
      trajectory_fp_c15: ref.trajectory_fp, trajectory_fp_integracion_15b: rb.trajectory_fp, trajectory_fp_reproduccion: rep,
      identica: rep === rb.trajectory_fp, // la reproducción es la misma ejecución que el C15 reejecutado con este motor
      mismo_deporte_que_motor15: !!a && a.facts.score_home === ref.score[0] && a.facts.score_away === ref.score[1] && a.facts.draws === ref.draws, // marcador y sorteos de MOTOR-15; la huella de MOTOR-15 difiere solo por el crédito de robo
      score_c15: ref.score, score_reproduccion: a ? [a.facts.score_home, a.facts.score_away] : null, draws_c15: ref.draws, draws_reproduccion: a?.facts?.draws ?? null, valid: !!a?.valid }; });
  repro.lots.push({ key: L.key, batch_id: cr.batchId, root, label: L.label, cases });
  specs.push({ kind: 'lote', id: cr.batchId, root });
}
repro.allIdentical = repro.lots.every((l) => l.cases.every((c) => c.identica && c.mismo_deporte_que_motor15));
writeFileSync(join(OUT, 'reproduccion.json'), JSON.stringify(repro, null, 1));

const opts = { profile, players, equivalenceDir: 'out/equivalence' };
const resC15 = runAudit(specs, { ...opts, auditRoot: join(OUT, 'cache') });
writeFileSync(join(OUT, 'resultado-c15.json'), JSON.stringify(resC15));
// AUD17 por universo: el caso extremo (C15-05) se evalúa APARTE de los normales; mezclarlo contaminaría las bandas normales y nunca estima frecuencias del mundo.
const resNormal = runAudit([specs[0]], { ...opts, auditRoot: join(OUT, 'cache') }); writeFileSync(join(OUT, 'resultado-c15-normales.json'), JSON.stringify(resNormal));
const resExtreme = runAudit([specs[1]], { ...opts, auditRoot: join(OUT, 'cache') }); writeFileSync(join(OUT, 'resultado-c15-extremo.json'), JSON.stringify(resExtreme));
let resHist = null;
if (existsSync(join(HISTORIC, 'LOT-9e1cfb78'))) { resHist = runAudit([{ kind: 'lote', id: 'LOT-9e1cfb78', root: HISTORIC }], { ...opts, auditRoot: join(OUT, 'cache-historico') }); writeFileSync(join(OUT, 'resultado-historico.json'), JSON.stringify(resHist)); }

const brief = (res) => res && ({ ok: res.ok, id: res.id, sources: res.sources, integrity: { ok: res.integrity.ok, files: res.integrity.files, bytes: res.integrity.bytes }, matches: res.matches.map((m) => ({ match_id: m.match_id, attempt_id: m.attempt_id, case_id: m.case_id, source: m.source, level: m.level, score: m.score, draws: m.draws, trajectory_fp: m.trajectory_fp })),
  runs: res.runs.map((r) => ({ id: r.id, impl: r.impl, registro: r.registro, exposicion: r.exposicion, resultado: r.resultado, universo: r.evidence?.projections ?? null })),
  aud17: res.runs.find((r) => r.id === 'AUD17'), aud26: res.runs.find((r) => r.id === 'AUD26'),
  findings: res.findings.filter((f) => ['AUD17', 'AUD26'].includes(f.audit)).map((f) => ({ id: f.id, audit: f.audit, rule: f.rule, severity: f.severity, state: f.state, cause: f.cause, counts: f.counts, reason: f.reason, evidence: f.evidence?.slice(0, 12) })) });
const summary = { engine: ENGINE_VERSION, reproduccion: { allIdentical: repro.allIdentical, lots: repro.lots.map((l) => ({ key: l.key, batch_id: l.batch_id, cases: l.cases })) }, c15: brief(resC15), c15_normales: brief(resNormal), c15_extremo: brief(resExtreme), historico: brief(resHist) };
writeFileSync(join(OUT, 'resumen.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ allIdentical: repro.allIdentical, lots: repro.lots.map((l) => ({ batch: l.batch_id, cases: l.cases.map((c) => `${c.c15}:${c.identica}:${c.score_reproduccion}`) })), aud17: { normales: summary.c15_normales.aud17.resultado + '/' + summary.c15_normales.aud17.exposicion, extremo: summary.c15_extremo.aud17.resultado + '/' + summary.c15_extremo.aud17.exposicion, historico: summary.historico?.aud17.resultado + '/' + summary.historico?.aud17.exposicion }, aud26: summary.c15.aud26?.metrics, hist26: summary.historico?.aud26?.metrics }, null, 0).slice(0, 3000));
