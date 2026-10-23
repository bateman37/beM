// SIM-MOTOR-04B · búsqueda secuencial pequeña de la candidata (§8): R04 (código real de 04 con su candidata) y R04B-N (correcciones de 04B con los cuatro valores de 04 y las filas nuevas neutrales) sobre los 24 casos CAL, sus 24 anclas
// detalladas y, etapa a etapa (Z → Q → A → E), hasta SIETE vectores adicionales. Cada etapa parte del ganador de la anterior y REUTILIZA sus partidos ya ejecutados. Solo propone un vector (no declara «calibrado»).
//   node scripts/sim04b/calibrate.js --phase=rules                       escribe plan/selection-rules.json (antes de congelar y de ejecutar CAL)
//   node scripts/sim04b/calibrate.js --phase=run [--root-r04=<worktree>] [--out=out/sim-motor04b/campaign]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.mjs';
import { readJsonl, buildTables } from './tables.js';
import * as S from './select.js';
import * as L from './lib.js';
import { rotationChecks } from './rotation-checks.js';
import { makeContext } from '../../src/sim/context.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04b/plan')); const out = arg('out', join(SELF, 'out/sim-motor04b/campaign')); const phase = arg('phase', 'run');
const rulesHash = S.rulesHash;

if (phase === 'rules') {
  const file = { schema: 'beM-sim04b-selection-rules/1', frozenBeforeCAL: true, rules: S.RULES, stages: S.STAGES, baseVector: S.BASE_VECTOR, budget: { maxAdditionalVectors: 7, note: 'no es el producto cartesiano: cada etapa parte del ganador de la anterior; los partidos del ganador ya ejecutado se reutilizan' },
    identities: { DET: 'detallado congelado de MOTOR-18C (83–98, 6.684 sorteos), mismas entradas', R04: 'código real de SIM-MOTOR-04 (ad52c91, 0.3.0-SIMMOTOR04) con su candidata 19,5 / 0,70 / 0,90 / 3', 'R04B-N': 'código de 04B con los cuatro valores anteriores y las filas nuevas neutrales', 'C04B-*': 'vectores limitados de este documento sobre R04B-N', 'C04B-FINAL-PROVISIONAL': 'vector elegido por estas reglas SOLO con CAL, pendiente de aceptación de Dennis' },
    selectionRulesSha256: rulesHash() };
  mkdirSync(planDir, { recursive: true }); writeFileSync(join(planDir, 'selection-rules.json'), JSON.stringify(file, null, 1)); console.log(JSON.stringify({ phase, selectionRulesSha256: file.selectionRulesSha256 })); process.exit(0);
}

// ---------------------------------------------------------------------------------------------------------------------------------- ejecución secuencial
const env = L.loadEnv(); const C = L.allCases(env); const calIds = C.cal.map((c) => c.case_id);
const vecDir = join(out, '..', 'vectors'); mkdirSync(vecDir, { recursive: true }); const R04 = arg('root-r04', '/home/user/r04b-r04');
const recs = (identity, resolver = 'sim') => { const p = join(out, `records-${resolver}-${identity}.jsonl`); const m = new Map(); for (const r of readJsonl(p)) { if (r.block !== 'CAL') continue; const q = m.get(r.case_id); if (!q || r.attempt >= q.attempt) m.set(r.case_id, r); } return [...m.values()]; };
const execBlock = async (identity, overrides, root = SELF, resolver = 'sim') => run({ block: 'CAL', identity, root, overrides, resolver, out, planDir });
const withValue = (rows, path, value) => [...rows.filter((r) => r.path !== path), { path, value }];
const ident = (r) => r.map((x) => [x.path, x.value]);
async function evaluate(identity) {
  const sim = recs(identity); const det = recs('DET', 'detailed'); const { tables } = buildTables(sim, det);
  const simL = S.linesOf(tables, calIds, 'sim', identity); const detL = S.linesOf(tables, calIds, 'detailed', 'DET');
  // el universo comparable son los casos con ancla válida en AMBOS modelos (la misma entrada); lo que falta en uno se declara y no entra en ninguna media
  const common = new Set([...new Set(simL.rows.map((r) => r[0]))].filter((id) => new Set(detL.rows.map((r) => r[0])).has(id)));
  const zoneRows = (resolver, id) => tables.zone.filter((r) => r[7] === id && r[6] === resolver && common.has(r[0]));
  const sm = S.metricsOf(simL.rows.filter((r) => common.has(r[0])), zoneRows('sim', identity)); const dm = S.metricsOf(detL.rows.filter((r) => common.has(r[0])), zoneRows('detailed', 'DET'));
  return { identity, comparableCases: common.size, sim: sm, det: dm, e: S.errorsOf(sm, dm), freq40: S.fortyMinuteFrequency(tables, [...common], 'sim', identity), excluded: { sim: simL.excluded, detailed: detL.excluded } };
}
const slim = (x) => x;

mkdirSync(out, { recursive: true });
const t0 = performance.now(); const counts = {}; const saveVec = (id, parent, rows) => { writeFileSync(join(vecDir, `${id}.json`), JSON.stringify({ id, parent, overrides: rows }, null, 1)); return rows; };
counts.DET = await execBlock('DET', [], SELF, 'detailed');
counts.R04 = await execBlock('R04', saveVec('R04', null, S.BASE_VECTOR), R04);
let rows = saveVec('R04B-N', 'R04', S.BASE_VECTOR); counts['R04B-N'] = await execBlock('R04B-N', rows);
const evR04 = await evaluate('R04'); const evN = await evaluate('R04B-N'); const evals = { R04: slim(evR04), 'R04B-N': slim(evN) };
let prev = { id: 'R04B-N', ev: evN }; const stagesOut = []; let winners = rows;
for (const st of S.STAGES.filter((x) => x.stage !== 'E')) {
  const cands = [];
  for (let i = 0; i < st.values.length; i++) { const id = st.ids[i]; const r = saveVec(id, prev.id, withValue(winners, st.path, st.values[i])); counts[id] = await execBlock(id, r); const ev = await evaluate(id); evals[id] = slim(ev); cands.push({ id, value: st.values[i], e: ev.e, ev }); }
  const d = S.chooseStage({ stage: st.stage, prev: { id: prev.id, value: winners.find((w) => w.path === st.path)?.value ?? st.baseline, e: prev.ev.e }, cands, init: evN.e });
  stagesOut.push({ ...d, path: st.path, baseline: st.baseline, previous: { id: prev.id, errors: prev.ev.e }, candidates: cands.map((c) => ({ id: c.id, value: c.value, errors: c.e, freq40: c.ev.freq40 })) });
  if (!d.kept) { winners = withValue(winners, st.path, d.chosen); prev = { id: d.chosenId, ev: cands.find((c) => c.id === d.chosenId).ev }; }
  console.log(JSON.stringify({ stage: st.stage, chosen: d.chosen, chosenId: d.chosenId, kept: d.kept, reason: d.reason }));
}
// etapa E: gasto 3 (ganador previo) frente a 3,5 sobre todos los CAL, con las comprobaciones de rotación corregidas
const stE = S.STAGES.find((x) => x.stage === 'E'); const eCands = [];
for (let i = 0; i < stE.values.length; i++) { const id = stE.ids[i]; const r = saveVec(id, prev.id, withValue(winners, stE.path, stE.values[i])); counts[id] = await execBlock(id, r); const ev = await evaluate(id); evals[id] = slim(ev); const chk = rotationChecks(env, makeContext(env.profile, r)); eCands.push({ id, value: stE.values[i], e: ev.e, ev, chk, freq40: ev.freq40.frequency }); }
const dE = S.chooseEnergy({ prev: { id: prev.id, value: 3, e: prev.ev.e, freq40: prev.ev.freq40.frequency }, cands: eCands.map((c) => ({ id: c.id, value: c.value, e: c.e, freq40: c.freq40, checks: { superior30: c.chk.superior30, relief: c.chk.relief, freshSeverity: c.chk.freshSeverity, recoveryChangesUtility: c.chk.recoveryChangesUtility } })), init: evN.e });
stagesOut.push({ ...dE, path: stE.path, baseline: stE.baseline, previous: { id: prev.id, errors: prev.ev.e, freq40: prev.ev.freq40 }, candidates: eCands.map((c) => ({ id: c.id, value: c.value, errors: c.e, freq40: c.ev.freq40, rotation: c.chk })) });
if (!dE.kept) { winners = withValue(winners, stE.path, dE.chosen); prev = { id: dE.chosenId, ev: eCands.find((c) => c.id === dE.chosenId).ev }; }
console.log(JSON.stringify({ stage: 'E', chosen: dE.chosen, chosenId: dE.chosenId, kept: dE.kept, reason: dE.reason }));
saveVec('C04B-FINAL-PROVISIONAL', prev.id, winners);
const base = L.loadEnv().ctx.sp; const diffRows = winners.map((w) => ({ path: w.path, before: base.index.get(w.path)?.value ?? null, after: w.value, unit: base.index.get(w.path)?.unit ?? null, origin: base.index.get(w.path)?.origin ?? null, neutralBase: S.BASE_VECTOR.find((b) => b.path === w.path)?.value ?? base.index.get(w.path)?.value ?? null }));
const result = { schema: 'beM-sim04b-cal-selection/1', rules: S.RULES, selectionRulesSha256: rulesHash(), populations: { calCases: calIds.length, anchors: calIds.length }, runs: counts, baseline: { R04: slim(evR04), 'R04B-N': slim(evN) }, evaluations: evals, stages: stagesOut,
  finalProvisional: { id: 'C04B-FINAL-PROVISIONAL', basedOn: prev.id, overrides: winners, differencesVsR04BN: diffRows.filter((d) => d.after !== d.neutralBase), allRows: diffRows, errorsFinal: prev.ev.e, errorsR04BN: evN.e, errorsR04: evR04.e, note: 'candidata provisional elegida solo con CAL; no es aceptación deportiva ni calibración' }, vectorsInOrder: ident(winners), wallMs: Math.round(performance.now() - t0) };
writeFileSync(join(out, '..', '07-CAL-SELECCION.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ final: winners, basedOn: prev.id, wallMs: result.wallMs })); process.exit(0);
