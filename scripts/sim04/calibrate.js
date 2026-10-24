// SIM-MOTOR-04 · búsqueda secuencial pequeña de la candidata (§7): R0 y R1 sobre los 56 casos CAL, las 16 anclas detalladas y, etapa a etapa (V → Z → A → E), hasta nueve vectores adicionales. Cada etapa parte del ganador
// provisional de la anterior y REUTILIZA sus partidos ya ejecutados. Solo propone un vector (no declara «calibrado»). Todo se escribe con los cálculos SIN redondear en `07-CAL-SELECCION.json`.
//   node scripts/sim04/calibrate.js --phase=rules            escribe plan/selection-rules.json (antes de congelar y de ejecutar CAL)
//   node scripts/sim04/calibrate.js --phase=run [--root-r0=<worktree>] [--out=out/sim-motor04/campaign]
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { run } from './exec.mjs';
import { readJsonl, buildTables } from './tables.js';
import * as S from './select.js';
import * as L from './lib.js';
import { rotationChecks } from './rotation-checks.js';
import { makeContext } from '../../src/sim/context.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const planDir = arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04/plan')); const out = arg('out', join(SELF, 'out/sim-motor04/campaign')); const phase = arg('phase', 'run');
const sha = (x) => createHash('sha256').update(x).digest('hex');

if (phase === 'rules') {
  const file = { schema: 'beM-sim04-selection-rules/1', frozenBeforeCAL: true, rules: S.RULES, stages: S.STAGES, budget: { maxAdditionalVectors: 9, note: 'no es el producto cartesiano: cada etapa parte del ganador provisional de la anterior; los partidos del ganador ya ejecutado se reutilizan' },
    identities: { R0: 'SIM-MOTOR-03 congelado (a201354, código y perfil históricos)', R1: 'SIM con las correcciones funcionales de 04 y sus semillas nuevas, sin las candidatas numéricas', 'C04-*': 'vectores numéricos candidatos sobre R1', 'C04-FINAL-PROVISIONAL': 'vector elegido por estas reglas, pendiente de aceptación deportiva' },
    sources: 'ver fuentes-externas.json (datos aportados por ChatGPT desde fuente primaria; no leídos directamente por Claude)', selectionRulesSha256: sha(JSON.stringify({ r: S.RULES, s: S.STAGES })) };
  mkdirSync(planDir, { recursive: true }); writeFileSync(join(planDir, 'selection-rules.json'), JSON.stringify(file, null, 1)); console.log(JSON.stringify({ phase, selectionRulesSha256: file.selectionRulesSha256 })); process.exit(0);
}

// ---------------------------------------------------------------------------------------------------------------------------------- ejecución secuencial
const env = L.loadEnv(); const C = L.allCases(env); const calIds = C.cal.map((c) => c.case_id); const anchorIds = C.cal.filter((c) => c.anchor).map((c) => c.case_id);
const vecDir = join(out, '..', 'vectors'); mkdirSync(vecDir, { recursive: true }); const R0 = arg('root-r0', join(process.env.SIM04_WT ?? '', 'r0'));
const recs = (identity, resolver = 'sim') => { const p = join(out, `records-${resolver}-${identity}.jsonl`); const m = new Map(); for (const r of readJsonl(p)) { if (r.block !== 'CAL') continue; const q = m.get(r.case_id); if (!q || r.attempt >= q.attempt) m.set(r.case_id, r); } return [...m.values()]; };
const execBlock = async (identity, overrides, root = SELF, resolver = 'sim') => run({ block: 'CAL', identity, root, overrides, resolver, out, planDir });
const log = []; const rowsOf = (v) => v.map(([path, value]) => ({ path, value }));
async function evaluate(identity) {
  const sim = recs(identity); const det = recs('DET', 'detailed'); const { tables } = buildTables(sim, det);
  const simL = S.linesOf(tables, anchorIds, 'sim'); const detL = S.linesOf(tables, anchorIds, 'detailed');
  // el universo comparable son los casos con ancla válida en AMBOS modelos (la misma entrada); lo que falta en uno se declara y no entra en ninguna media
  const okSim = new Set(simL.rows.map((r) => r[0])); const okDet = new Set(detL.rows.map((r) => r[0])); const common = new Set([...okSim].filter((id) => okDet.has(id)));
  const sm = S.metricsOf(simL.rows.filter((r) => common.has(r[0]))); const dm = S.metricsOf(detL.rows.filter((r) => common.has(r[0])));
  return { identity, comparableCases: common.size, sim: sm, det: dm, lossV: S.lossV(sm, dm), lossZ: S.lossZ(sm, dm), lossA: S.lossA(sm, dm), freq40: S.fortyMinuteFrequency(tables, calIds, 'sim'), excluded: { sim: simL.excluded, detailed: detL.excluded }, tables };
}
const slim = (e) => { const { tables, ...rest } = e; return rest; };

mkdirSync(out, { recursive: true });
const t0 = performance.now(); const counts = {};
counts.R0 = await execBlock('R0', [], R0); counts.R1 = await execBlock('R1', []); counts.DET = await execBlock('DET', [], SELF, 'detailed');
const saveVec = (id, parent, rows) => { writeFileSync(join(vecDir, `${id}.json`), JSON.stringify({ id, parent, overrides: rows }, null, 1)); return rows; };
let winners = []; let prevId = 'R1'; const stagesOut = []; let evPrev = await evaluate('R1'); const evR1 = evPrev; const evals = { R1: slim(evR1) };
for (const st of S.STAGES.filter((x) => x.stage !== 'E')) {
  const cands = [];
  for (let i = 0; i < st.values.length; i++) { const id = st.ids[i]; const rows = saveVec(id, prevId, [...winners, { path: st.path, value: st.values[i] }]); counts[id] = await execBlock(id, rows); const ev = await evaluate(id); evals[id] = slim(ev); cands.push({ id, value: st.values[i], ev }); }
  const prev = { value: winners.find((w) => w.path === st.path)?.value ?? st.baseline, id: prevId, loss: (st.stage === 'V' ? evPrev.lossV : st.stage === 'Z' ? evPrev.lossZ : evPrev.lossA).value, lossV: evPrev.lossV.value };
  const pick = (c) => ({ id: c.id, value: c.value, loss: (st.stage === 'V' ? c.ev.lossV : st.stage === 'Z' ? c.ev.lossZ : c.ev.lossA).value, lossV: c.ev.lossV.value });
  const d = S.chooseStage({ stage: st.stage, prev, cands: cands.map(pick), admissible: st.stage === 'Z' ? S.zAdmissible : undefined });
  stagesOut.push({ ...d, path: st.path, baseline: st.baseline, previous: { id: prevId, value: prev.value, loss: prev.loss, lossV: prev.lossV }, candidates: cands.map((c) => ({ id: c.id, value: c.value, lossV: c.ev.lossV, lossZ: c.ev.lossZ, lossA: c.ev.lossA, freq40: c.ev.freq40 })) });
  if (!d.kept) { winners = [...winners.filter((w) => w.path !== st.path), { path: st.path, value: d.chosen }]; prevId = d.chosenId; evPrev = cands.find((c) => c.id === d.chosenId).ev; }
  console.log(JSON.stringify({ stage: st.stage, chosen: d.chosen, chosenId: d.chosenId, kept: d.kept, reason: d.reason }));
}
// etapa E: gasto 2 (ganador previo), 3 y 3,5 sobre todos los CAL
const stE = S.STAGES.find((x) => x.stage === 'E'); const eCands = [];
for (let i = 0; i < stE.values.length; i++) { const id = stE.ids[i]; const rows = saveVec(id, prevId, [...winners, { path: stE.path, value: stE.values[i] }]); counts[id] = await execBlock(id, rows); const ev = await evaluate(id); evals[id] = slim(ev); const chk = rotationChecks(env, makeContext(env.profile, rows)); eCands.push({ id, value: stE.values[i], ev, chk }); }
const ePrev = { id: prevId, value: 2, lossV: evPrev.lossV.value, lossA: evPrev.lossA.value, freq40: evPrev.freq40.frequency };
const dE = S.chooseEnergy({ prev: ePrev, cands: eCands.map((c) => ({ id: c.id, value: c.value, lossV: c.ev.lossV.value, lossA: c.ev.lossA.value, freq40: c.ev.freq40.frequency, checks: { superior30: c.chk.superior30, relief: c.chk.relief } })) });
stagesOut.push({ ...dE, path: stE.path, baseline: stE.baseline, previous: ePrev, candidates: eCands.map((c) => ({ id: c.id, value: c.value, lossV: c.ev.lossV, lossA: c.ev.lossA, freq40: c.ev.freq40, rotation: c.chk })) });
if (!dE.kept) { winners = [...winners.filter((w) => w.path !== stE.path), { path: stE.path, value: dE.chosen }]; prevId = dE.chosenId; }
console.log(JSON.stringify({ stage: 'E', chosen: dE.chosen, chosenId: dE.chosenId, kept: dE.kept, reason: dE.reason }));
const finalRows = winners; saveVec('C04-FINAL-PROVISIONAL', prevId, finalRows);
const base = L.loadEnv().ctx.sp; const diffRows = finalRows.map((w) => ({ path: w.path, before: base.index.get(w.path)?.value ?? null, after: w.value, unit: base.index.get(w.path)?.unit ?? null, origin: base.index.get(w.path)?.origin ?? null }));
const result = { schema: 'beM-sim04-cal-selection/1', rules: S.RULES, selectionRulesSha256: sha(JSON.stringify({ r: S.RULES, s: S.STAGES })), populations: { calCases: calIds.length, anchors: anchorIds.length }, runs: counts, baseline: slim(evR1), evaluations: evals, stages: stagesOut,
  finalProvisional: { id: 'C04-FINAL-PROVISIONAL', basedOn: prevId, overrides: finalRows, differencesVsR1: diffRows, note: 'candidata provisional; no es aceptación deportiva ni calibración' }, wallMs: Math.round(performance.now() - t0) };
writeFileSync(join(out, '..', '07-CAL-SELECCION.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ final: finalRows, basedOn: prevId, wallMs: result.wallMs })); process.exit(0);
