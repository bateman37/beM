// SIM-MOTOR-04E · comprobaciones mecánicas sobre los registros YA ejecutados (§11.5; 13-comprobaciones-campana.json): equivalencia de recorridos TECH, conciliación de todos los registros SIM, misma entrada y semilla por caso entre
// identidades y modelos, puente observacional (crédito) → reloj y alias sin observaciones duplicadas. No simula.   node scripts/sim04e/checks.js [--write=out/sim-motor04e/13-comprobaciones-campana.json]
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonl } from './tables.js';
import { loadAgenda } from './exec.mjs';
import { canonical } from '../../src/sim/fp.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const O = join(root, 'out/sim-motor04e'); const CAMP = join(O, 'campaign'); const { agenda } = loadAgenda(join(root, 'docs/tecnico/evidencia-sim-motor04e/plan'));
const latest = (recs) => { const m = new Map(); for (const r of recs) { const k = `${r.block}|${r.case_id}`; const p = m.get(k); if (!p || r.attempt >= p.attempt) m.set(k, r); } return m; };
const byId = {}; for (const f of readdirSync(CAMP).filter((x) => x.startsWith('records-'))) byId[f.replace(/^records-(sim|detailed)-/, (m, r) => `${r}:`).replace('.jsonl', '')] = latest(readJsonl(join(CAMP, f)));
const out = { schema: 'beM-sim04e-checks/1', tech: {}, reconciliation: {}, inputs: {}, bridge: {}, alias: {} };
// TECH: tres recorridos de las cuatro primeras entradas DEV-A con el vector recomendado; igualdad entre recorridos y con la ejecución de DEV-A de ese mismo vector
const rv = (n) => (existsSync(join(O, 'vectors', `${n}.json`)) ? JSON.parse(readFileSync(join(O, 'vectors', `${n}.json`), 'utf8')) : null); const cand = rv('SIM_04E_CAND'); const techId = cand.alias ? rv('SIM_04E_BASE').id : cand.id; const fin = byId[`sim:${techId}`] ?? byId['sim:SIM_04E_BASE'];
out.tech = { cases: {}, allEqual: true, vectorRef: techId };
for (const id of [...agenda.values()].filter((a) => a.tech === '1').map((a) => a.case_id)) { const r = ['auto', 'steps', 'recover'].map((n) => byId[`sim:TECH-${n}`]?.get(`TECH|${id}`)); const ref = fin?.get(`DEV|${id}`); const fps = r.map((x) => x?.identity?.sportFingerprint ?? null); const ess = r.map((x) => (x?.essential ? canonical({ box: x.essential.box, zones: x.essential.zones }) : null));
  const eq = fps.every((f) => f && f === fps[0]) && ess.every((e) => e === ess[0]); const eqDev = !!ref && ref.identity.sportFingerprint === fps[0]; out.tech.cases[id] = { fingerprints: fps, routesEqual: eq, equalToDevVector: eqDev, consults: r.map((x) => x?.route?.consults ?? null), restores: r.map((x) => x?.route?.restores ?? null) }; if (!eq || !eqDev) out.tech.allEqual = false; }
// conciliación: todos los registros SIM (válidos, sin comprobaciones fallidas) y detallado (válidos)
for (const [k, m] of Object.entries(byId)) { let n = 0; let bad = 0; let notEval = 0; for (const r of m.values()) { n++; if (!r.valid || (r.failedChecks ?? []).length) bad++; notEval += (r.notEvaluated ?? []).length; } out.reconciliation[k] = { records: n, invalidOrFailed: bad, notEvaluatedItems: notEval }; }
// misma entrada y semilla por caso entre identidades y modelos
const bad = []; for (const [k, m] of Object.entries(byId)) for (const [key, r] of m.entries()) { const a = agenda.get(r.case_id); if (!a || r.seed !== a.seed || r.input_hash !== a.input_hash || r.entry_id !== a.entry_id) bad.push({ identity: k, key }); }
out.inputs = { runsChecked: Object.values(byId).reduce((s, m) => s + m.size, 0), mismatches: bad };
// puente 04D → crédito → reloj (ocho entradas DEV-A, fixtures versionados): el paso de crédito conserva la dinámica; la corrección de reloj elimina el patrón y cambia la trayectoria
const br = (s) => JSON.parse(readFileSync(join(root, `tests/fixtures/sim04e-bridge-${s}.json`), 'utf8')).rows; const a = br('04D'); const b = br('credito'); const c = br('reloj');
out.bridge = { entries: a.length, creditKeepsDynamics: a.filter((x, i) => x.dyn_sha === b[i].dyn_sha && x.draws_sha === b[i].draws_sha && JSON.stringify(x.score) === JSON.stringify(b[i].score)).length, falseExpiry04D: a.reduce((s, x) => s + x.false_expiry, 0), falseExpiryCredit: b.reduce((s, x) => s + x.false_expiry, 0), falseExpiryClock: c.reduce((s, x) => s + x.false_expiry, 0), clockChangesTrajectory: c.filter((x, i) => x.dyn_sha !== b[i].dyn_sha).length };
// alias: la candidata recomendada puede ser la base; un alias reutiliza los registros (no cuenta como observación independiente)
out.alias = { candidateIsBase: !!cand.alias, candidateVectorId: cand.id, baseVectorId: rv('SIM_04E_BASE').id, valConditions: Object.keys(byId).filter((k) => k.startsWith('sim:SIM_04E')) };
out.ok = out.tech.allEqual && bad.length === 0 && Object.values(out.reconciliation).every((x) => x.invalidOrFailed === 0) && out.bridge.creditKeepsDynamics === out.bridge.entries && out.bridge.falseExpiryClock === 0;
if (arg('write')) writeFileSync(arg('write'), JSON.stringify(out, null, 1)); console.log(JSON.stringify({ ok: out.ok, tech: out.tech.allEqual, techCases: Object.keys(out.tech.cases).length, reconciliation: Object.fromEntries(Object.entries(out.reconciliation).map(([k, v]) => [k, `${v.records}/${v.invalidOrFailed}`])), inputsMismatches: bad.length, bridge: out.bridge }));
