// Hilo de ejecución del lote: recibe tareas `{ id, task }`, ejecuta el intento con el motor real y devuelve solo el resumen (los archivos se escriben en disco desde aquí).
import { parentPort, workerData } from 'node:worker_threads';
import { JobStore, loadFrozen } from './jobstore.js';
import { executeAttempt, defaultSimulate } from './attempt.js';
import { buildResult } from '../match/index.js';
import { BatchController } from './runner.js';
import { buildPackage } from './package.js';
import { InlineExecutor } from './executors.js';
import { trajectoryFingerprint } from './fingerprint.js';

const store = new JobStore(workerData.root); const cache = new Map();
parentPort.on('message', async ({ id, task, kind, args }) => {
  try {
    if (kind === 'replay') { const fz = cache.get(args.batchId) ?? loadFrozen(store, args.batchId); cache.set(args.batchId, fz); const ex = fz.lote.agenda.find((x) => x.match_id === args.matchId); const entry = fz.entryOf(ex); const r = defaultSimulate(fz.inputFor(entry, ex.seed), fz.profile, { level: 'diagnostic', planned: entry.planned_orders ?? [], profileRef: { batch: fz.batch_id, profile_id: fz.profile_id } }); if (!r.res) throw new Error(r.error?.message ?? 'no se pudo reproducir'); parentPort.postMessage({ id, result: { json: JSON.stringify(r.res), trajectory_fp: trajectoryFingerprint(r.res), status: r.res.status, error: r.error } }); return; }
    if (kind === 'package') { const ctl = new BatchController({ store, executor: new InlineExecutor({ store }) }); const res = await buildPackage(ctl, args.batchId, args.opts ?? {}); parentPort.postMessage({ id, result: JSON.parse(JSON.stringify(res)) }); return; }
    if (!cache.has(task.batchId)) cache.set(task.batchId, loadFrozen(store, task.batchId));
    const outcome = executeAttempt({ ...task, frozen: cache.get(task.batchId) });
    parentPort.postMessage({ id, outcome });
  } catch (e) { parentPort.postMessage({ id, error: { message: e.message, phase: 'registro' } }); }
});
