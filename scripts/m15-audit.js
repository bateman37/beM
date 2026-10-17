// Auditorías AUD01–32 con la evidencia real de MOTOR-15 (§17): un lote diagnóstico de los emparejamientos de los casos de integración (seis encuentros completos, registro diagnóstico) leído por
// `runAudit` SIN re-simular. Salida (fuera de Git): <out>/auditoria/resultado.json. Uso: node scripts/m15-audit.js [--out=out/motor15]
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import * as P from '../src/population/index.js';
import { fnv1a32 } from '../src/population/hash.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor } from '../src/batch/executors.js';
import { runAudit } from '../src/audit/index.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = join(arg('out', 'out/motor15'), 'auditoria'); rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const { profile, players } = loadData();
const pairs = [['EQ01', 'EQ02'], ['EQ03', 'EQ09'], ['EQ07', 'EQ08'], ['EQ11', 'EQ12'], ['EQ04', 'EQ10'], ['EQ05', 'EQ06']];
const teams = Object.fromEntries([...new Set(pairs.flat())].map((id) => [id, P.referenceTeam(profile, players, id)]));
const store = new JobStore(join(OUT, 'lotes')); const ctl = new BatchController({ store, executor: new InlineExecutor({ store }) });
const spec = { mode: 'pairs', pairs, repetitions: 1, venue: 'fixed', batchSeed: fnv1a32('AUD-M15-20261017'), teams, recordLevel: 'diagnostic', concurrency: 1, variants: [{ id: 'V0', label: 'Base' }] };
const cr = ctl.create(spec, profile, { players, label: 'M15 auditoría' }); if (!cr.ok) { console.error(cr.problems); process.exit(1); }
const run = await ctl.run(cr.batchId); await run.done;
const res = runAudit([{ kind: 'lote', id: cr.batchId, root: store.root }], { profile, players, auditRoot: join(OUT, 'cache'), equivalenceDir: 'out/equivalence' });
writeFileSync(join(OUT, 'resultado.json'), JSON.stringify(res));
console.log(JSON.stringify({ ok: res.ok, batch: cr.batchId, matches: res.matches?.length, runs: res.runs?.map((r) => `${r.id}:${r.impl}/${r.registro}/${r.exposicion}/${r.resultado}`) }, null, 0).slice(0, 2500));
