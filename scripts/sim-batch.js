// Lotes SIM persistentes (§8.2). Uso: node scripts/sim-batch.js create <spec.json> | run <id> [--limit=N] [--workers=W] [--chunk=C] [--retention=reference|analysis] | status <id> | recover <id> | retry <id> | open <id> <caso>
// El almacén es `out/sim-batches` (o BEM_SIM_BATCH_ROOT). El índice append-only es la fuente de verdad: un proceso interrumpido se recupera con `recover` y se continúa con `run`/`retry`.
import { readFileSync } from 'node:fs';
import { loadData } from './node-data.js';
import { makeContext } from '../src/sim/index.js';
import { referenceTeamMap } from '../src/sim/teams.js';
import { SimBatchRunner } from '../src/simbatch/runner.js';

const [cmd, a1, a2] = process.argv.slice(2); const flag = (n, d) => { const f = process.argv.find((x) => x.startsWith(`--${n}=`)); return f ? f.slice(n.length + 3) : d; };
const { profile, players } = loadData(); const ctx = makeContext(profile); const teamMap = referenceTeamMap(profile, players);
const runner = new SimBatchRunner({ ctx, teamMap, workers: Number(flag('workers', 4)), chunk: Number(flag('chunk', 2)), retention: flag('retention', 'reference'), inline: flag('inline', '0') === '1' });
const out = (o) => console.log(JSON.stringify(o));
try {
  if (cmd === 'create') out({ id: runner.create(JSON.parse(readFileSync(a1, 'utf8'))) });
  else if (cmd === 'run' || cmd === 'retry') { const r = await runner.run(a1, { limit: Number(flag('limit', Infinity)), retryFailed: true }); out(r); }
  else if (cmd === 'status') out(runner.status(a1));
  else if (cmd === 'recover') out(runner.recover(a1));
  else if (cmd === 'open') { const r = runner.open(a1, a2); out({ ok: r.ok, reason: r.reason ?? null, caseId: r.caseId, retention: r.retention, score: r.essential?.score?.final ?? null }); }
  else { console.error('uso: create|run|status|recover|retry|open'); process.exitCode = 2; }
} finally { await runner.close(); }
