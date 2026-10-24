// SIM-MOTOR-04C · búsqueda limitada de la candidata (§7–§8): B04B (código real de 04B con su candidata), N04C (código nuevo, filas nuevas neutrales) y, con reglas congeladas ANTES de CAL, hasta OCHO vectores completos
// (J0/R35/R65/R85 → punto R → I50/I100 si procede → punto I → P15/P30 si procede) sobre los 24 casos CAL, sus 24 anclas detalladas y las mismas entradas y semillas. Solo CAL decide; VAL no se lee.
//   node scripts/sim04c/calibrate.js --phase=rules                      escribe plan/selection-rules.json (antes de congelar y de ejecutar CAL)
//   node scripts/sim04c/calibrate.js --phase=run [--root-b04b=<worktree de 48bcdef>] [--out=out/sim-motor04c/campaign]
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import { readJsonl, buildTables } from './tables.js';
import * as S from './select.js';
import * as L from './lib.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04c/plan')); const out = arg('out', join(SELF, 'out/sim-motor04c/campaign')); const phase = arg('phase', 'run');

if (phase === 'rules') {
  const file = { schema: 'beM-sim04c-selection-rules/1', frozenBeforeCAL: true, rules: S.RULES, agenda: S.AGENDA, fixed: S.FIXED, budget: { maxAdditionalVectors: 8, note: 'no es el producto cartesiano; una etapa omitida no concede intentos extra' },
    identities: { DET: 'detallado congelado de MOTOR-18C (83–98, 6.684 sorteos), mismas entradas', B04B: 'código real de 04B (48bcdef, 0.3.1-SIMMOTOR04B) con la candidata 19,5 / 0,70 / 0,90 / 3 y las otras filas neutrales', N04C: 'código de 04C con las filas nuevas neutrales y los mismos cuatro valores (control de neutralidad)', 'C04C-*': 'vectores completos de búsqueda limitada', 'C04C-FINAL-PROVISIONAL': 'vector elegido por estas reglas SOLO con CAL, pendiente de Dennis' },
    selectionRulesSha256: S.rulesHash() };
  mkdirSync(planDir, { recursive: true }); writeFileSync(join(planDir, 'selection-rules.json'), JSON.stringify(file, null, 1)); console.log(JSON.stringify({ phase, selectionRulesSha256: file.selectionRulesSha256 })); process.exit(0);
}

const env = L.loadEnv(); const C = L.allCases(env); const calIds = C.cal.map((c) => c.case_id);
const vecDir = join(out, '..', 'vectors'); mkdirSync(vecDir, { recursive: true }); mkdirSync(out, { recursive: true }); const B04B = arg('root-b04b', '/home/user/wt/b04b');
const recs = (identity, resolver = 'sim') => { const p = join(out, `records-${resolver}-${identity}.jsonl`); const m = new Map(); for (const r of readJsonl(p)) { if (r.block !== 'CAL') continue; const q = m.get(r.case_id); if (!q || r.attempt >= q.attempt) m.set(r.case_id, r); } return [...m.values()]; };
const execBlock = async (identity, overrides, root = SELF, resolver = 'sim') => run({ block: 'CAL', identity, root, overrides, resolver, out, planDir });
const rowsOf = (set) => [...S.FIXED, ...S.vectorRows(set)];
// vector completo = filas fijas + filas buscadas (neutral salvo las indicadas)
const setOf = (rows) => Object.fromEntries(S.ROWS.map((r) => [r.path, rows.find((x) => x.path === r.path)?.value ?? r.neutral]));
const saveVec = (id, parent, rows, extra = {}) => { writeFileSync(join(vecDir, `${id}.json`), JSON.stringify({ id, parent, overrides: rows, ...extra }, null, 1)); return rows; };

async function evaluate(identity, rows) {
  const sim = recs(identity); const det = recs('DET', 'detailed'); const { tables } = buildTables(sim, det);
  const simL = S.linesOf(tables, calIds, 'sim', identity); const detL = S.linesOf(tables, calIds, 'detailed', 'DET');
  const simIds = new Set(simL.rows.map((r) => r[0])); const detIds = new Set(detL.rows.map((r) => r[0])); const common = new Set([...simIds].filter((id) => detIds.has(id)));
  const sel = (tab, resolver, id, idx) => tables[tab].filter((r) => r[idx.res] === resolver && r[idx.id] === id && common.has(r[0]));
  const zi = { res: 6, id: 7 };
  const sm = S.metricsOf(simL.rows.filter((r) => common.has(r[0])), sel('zone', 'sim', identity, zi), sel('czq', 'sim', identity, zi)); const dm = S.metricsOf(detL.rows.filter((r) => common.has(r[0])), sel('zone', 'detailed', 'DET', zi), sel('czq', 'detailed', 'DET', zi));
  const e = S.errorsOf(sm, dm); const sc = S.scoreM(e); const invariantsOk = common.size === calIds.length && simL.excluded.length === 0 && detL.excluded.length === 0 && sim.length === calIds.length;
  return { id: identity, rows: rows ?? null, comparableCases: common.size, sim: sm, det: dm, e, M: sc.M, dominant: sc.dominant, comps: sc.comps, missing: sc.missing, invariantsOk, freq40: S.fortyMinuteFrequency(tables, [...common], 'sim', identity), excluded: { sim: simL.excluded, detailed: detL.excluded } };
}

const t0 = performance.now(); const counts = {}; const evals = {}; const executed = [];
counts.DET = await execBlock('DET', [], SELF, 'detailed');
saveVec('B04B', null, S.FIXED); counts.B04B = await execBlock('B04B', S.FIXED, B04B); evals.B04B = await evaluate('B04B', S.FIXED);
const nRows = saveVec('N04C', 'B04B', rowsOf({})); counts.N04C = await execBlock('N04C', nRows); evals.N04C = await evaluate('N04C', nRows);
console.log(JSON.stringify({ N04C: evals.N04C.M, B04B: evals.B04B.M }));
const runVector = async (a, rows, parentId) => { const id = `C04C-${a.id}`; saveVec(id, parentId, rows); counts[id] = await execBlock(id, rows); evals[id] = await evaluate(id, rows); executed.push({ agenda: a.id, id }); console.log(JSON.stringify({ id, M: evals[id].M, dominant: evals[id].dominant })); return evals[id]; };
const stages = { R: [], I: [], P: [] }; const decisions = {};
// etapa R
for (const a of S.AGENDA.filter((x) => x.stage === 'R')) { const ev = await runVector(a, rowsOf(a.set), 'N04C'); stages.R.push(ev); }
const ptR = S.workingPoint(stages.R); decisions.R = { workingPoint: ptR?.id ?? null, M: ptR?.M ?? null, candidates: stages.R.map((x) => ({ id: x.id, M: x.M, dominant: x.dominant, invariantsOk: x.invariantsOk })) };
// etapa I
const condI = S.stageICondition(ptR); decisions.I = { condition: condI };
if (condI.run) for (const a of S.AGENDA.filter((x) => x.stage === 'I')) { const rows = rowsOf({ ...setOf(ptR.rows), ...a.set }); stages.I.push(await runVector(a, rows, ptR.id)); }
const ptI = condI.run ? S.workingPoint([ptR, ...stages.I]) : ptR; decisions.I.workingPoint = ptI?.id ?? null; decisions.I.executed = stages.I.map((x) => x.id);
// etapa P
const condP = S.stagePCondition(ptI); decisions.P = { condition: condP };
if (condP.run) for (const a of S.AGENDA.filter((x) => x.stage === 'P')) { const rows = rowsOf({ ...setOf(ptI.rows), ...a.set }); stages.P.push(await runVector(a, rows, ptI.id)); }
// selección final sobre TODOS los vectores completos ejecutados frente a N04C
const all = [...stages.R, ...stages.I, ...stages.P]; const final = S.selectFinal(evals.N04C, all.map((x) => ({ id: x.id, rows: x.rows, e: x.e, M: x.M, dominant: x.dominant, missing: x.missing, invariantsOk: x.invariantsOk })));
const chosen = final.chosenId === 'N04C' ? evals.N04C : evals[final.chosenId]; const chosenRows = final.chosenId === 'N04C' ? nRows : evals[final.chosenId].rows;
saveVec('C04C-FINAL-PROVISIONAL', final.chosenId, chosenRows, { note: 'candidata provisional elegida solo con CAL; no es aceptación deportiva ni calibración' });
const base = L.loadEnv().ctx.sp; const diffRows = chosenRows.map((w) => ({ path: w.path, before: base.index.get(w.path)?.value ?? null, after: w.value, unit: base.index.get(w.path)?.unit ?? null, origin: base.index.get(w.path)?.origin ?? null }));
const result = { schema: 'beM-sim04c-cal-selection/1', rules: S.RULES, selectionRulesSha256: S.rulesHash(), populations: { calCases: calIds.length, anchors: calIds.length }, runs: counts, evaluations: evals, stages: decisions, executedVectors: executed, additionalVectorsExecuted: executed.length,
  selection: final, finalProvisional: { id: 'C04C-FINAL-PROVISIONAL', basedOn: final.chosenId, overrides: chosenRows, allRows: diffRows, errorsFinal: chosen.e, M: chosen.M, dominant: chosen.dominant, errorsN04C: evals.N04C.e, MN04C: evals.N04C.M, note: 'candidata provisional elegida solo con CAL; no es aceptación deportiva ni calibración' }, wallMs: Math.round(performance.now() - t0) };
writeFileSync(join(out, '..', '07-CAL-SELECCION.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ chosen: final.chosenId, kept: final.kept, reason: final.reason, wallMs: result.wallMs })); process.exit(0);
