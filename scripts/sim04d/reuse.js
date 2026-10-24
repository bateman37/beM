// SIM-MOTOR-04D · reutilización de registros AUTÉNTICOS de 04C (§9.1): los 48 detallados de VAL04C como DEV, los ocho anclas detalladas de CONTRAST y la candidata 04C (identidad `FINAL`) sobre DEV como C0_04C autentico.
// Un registro solo se reutiliza si coincide el `input_hash`, la semilla y la versión del detallado con el caso de la agenda 04D. No se recrea ningún ZIP histórico: se leen los JSONL conservados en `out/` (fuera de Git).
//   node scripts/sim04d/reuse.js [--from=out/sim-motor04c/campaign] [--out=out/sim-motor04d/campaign]
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadAgenda } from './exec.mjs';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const rd = (p) => (existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

export function reuse({ from, out, planDir }) {
  mkdirSync(out, { recursive: true }); const { agenda } = loadAgenda(planDir); const idx = join(out, 'index.jsonl'); const report = { detailed: { requested: 0, reused: 0, rejected: [] }, c0: { requested: 0, reused: 0, rejected: [] } };
  const map = new Map(); for (const a of agenda.values()) if (a.reused_from) map.set(a.reused_from.replace('SIM-MOTOR-04C:', ''), a);
  const have = (path, id) => new Set(rd(path).map((r) => r.case_id + '|' + (r.identity ?? id)));
  // detallado: VAL de 04C → DEV; anclas de CONTRAST con su identificador
  const detOut = join(out, 'records-detailed-DET.jsonl'); const detHave = new Set(rd(detOut).map((r) => r.case_id));
  for (const r of rd(join(from, 'records-detailed-DET.jsonl'))) {
    const a = map.get(r.case_id); if (!a || !['VAL', 'CONTRAST'].includes(r.block)) continue; report.detailed.requested++;
    if (r.input_hash !== a.input_hash || r.seed !== a.seed || r.status !== 'finished' || !r.valid) { report.detailed.rejected.push({ case: a.case_id, why: r.input_hash !== a.input_hash ? 'input_hash' : r.seed !== a.seed ? 'semilla' : 'estado' }); continue; }
    if (detHave.has(a.case_id)) { report.detailed.reused++; continue; }
    const m = { ...r, case_id: a.case_id, block: a.block, reused_from: `SIM-MOTOR-04C:${r.case_id}`, campaign: 'SIM04D-CAMPANA-20261024' }; appendFileSync(detOut, `${JSON.stringify(m)}\n`);
    appendFileSync(idx, `${JSON.stringify({ identity: 'DET', block: a.block, resolver: 'detailed', case_id: a.case_id, attempt: r.attempt ?? 1, status: 'finished', valid: true, error: null, reused_from: m.reused_from, at: Date.now() })}\n`); report.detailed.reused++;
  }
  // C0_04C auténtico: identidad FINAL de 04C (código y perfil de 04C) sobre las 48 entradas DEV
  const c0Out = join(out, 'records-sim-C0_04C.jsonl'); const c0Have = new Set(rd(c0Out).map((r) => r.case_id));
  for (const r of rd(join(from, 'records-sim-FINAL.jsonl'))) {
    const a = map.get(r.case_id); if (!a || r.block !== 'VAL') continue; report.c0.requested++;
    if (r.input_hash !== a.input_hash || r.seed !== a.seed || r.status !== 'finished' || !r.valid) { report.c0.rejected.push({ case: a.case_id, why: 'hash/semilla/estado' }); continue; }
    if (c0Have.has(a.case_id)) { report.c0.reused++; continue; }
    const m = { ...r, case_id: a.case_id, block: 'DEV', run: 'C0_04C', reused_from: `SIM-MOTOR-04C:${r.case_id}`, campaign: 'SIM04D-CAMPANA-20261024' }; appendFileSync(c0Out, `${JSON.stringify(m)}\n`);
    appendFileSync(idx, `${JSON.stringify({ identity: 'C0_04C', block: 'DEV', resolver: 'sim', case_id: a.case_id, attempt: r.attempt ?? 1, status: 'finished', valid: true, error: null, reused_from: m.reused_from, at: Date.now() })}\n`); report.c0.reused++;
  }
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = reuse({ from: arg('from', join(SELF, 'out/sim-motor04c/campaign')), out: arg('out', join(SELF, 'out/sim-motor04d/campaign')), planDir: arg('plan', join(SELF, 'docs/tecnico/evidencia-sim-motor04d/plan')) });
  console.log(JSON.stringify(r)); writeFileSync(join(arg('out', join(SELF, 'out/sim-motor04d/campaign')), 'reuse-report.json'), JSON.stringify(r, null, 1));
}
