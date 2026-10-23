// Calcula historia y aprendizaje desde los registros ya ejecutados de VAL (SIM de la candidata y anclas detalladas), sin simular.
//   node scripts/sim04/history-run.js [--out=out/sim-motor04/history]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonl } from './tables.js';
import { buildHistoryAndLearning } from './history.js';
import * as L from './lib.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const CAMP = join(root, 'out/sim-motor04/campaign'); const OUT = arg('out', join(root, 'out/sim-motor04/history')); mkdirSync(OUT, { recursive: true });
const latest = (recs, block) => { const m = new Map(); for (const r of recs) { if (block && r.block !== block) continue; const p = m.get(r.case_id); if (!p || r.attempt >= p.attempt) m.set(r.case_id, r); } return [...m.values()]; };
const env = L.loadEnv(); const sim = latest(readJsonl(join(CAMP, 'records-sim-FINAL.jsonl')), 'VAL'); const det = latest(readJsonl(join(CAMP, 'records-detailed-DET.jsonl')), 'VAL');
const out = buildHistoryAndLearning(env, sim, det); writeFileSync(join(OUT, '11-APRENDIZAJE-E-HISTORIA.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ allChecksOk: out.allChecksOk, scheduled: out.scheduled, missing: out.missingResults.length, ledgers: Object.fromEntries(Object.entries(out.ledgers).map(([k, v]) => [k, { accepted: v.accepted, rejected: v.rejected.length, stints: v.stints, reconciliation: v.reconciliation.every((c) => c.ok), checks: v.checks.every((c) => c.ok), resolvers: v.resolvers }])), learning: { pairs: out.learning.pairs.length, rows: out.learning.rows.length, checks: out.learning.checks.map((c) => [c.id.slice(0, 50), c.ok]) } }, null, 1));
