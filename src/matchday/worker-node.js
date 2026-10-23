// Hilo de trabajo de Node de la jornada: posee un fragmento de encuentros SIM (ver sim/shard.js) y responde a barreras con paquetes compactos.
import { parentPort } from 'node:worker_threads';
import { ShardRunner } from '../sim/shard.js';
const shard = new ShardRunner(null, { releaseFinished: true });
parentPort.on('message', (msg) => {
  try {
    let out;
    if (msg.type === 'init') { shard.setContext(msg.ctx); shard.teamMap = msg.teams; out = { ok: true }; }
    else if (msg.type === 'add') { for (const f of msg.fixtures) shard.add(f); out = { ok: true, n: msg.fixtures.length }; }
    else if (msg.type === 'advance') { const packets = shard.advanceAll(msg.T); out = { packets, timing: shard.takeTiming() }; }
    else if (msg.type === 'review') out = { decisions: shard.review(msg.T, msg.needs ?? {}, { policy: msg.policy !== false }) };
    else if (msg.type === 'essentials') out = { essentials: msg.ids.map((id) => [id, shard.essential(id)]) };
    else if (msg.type === 'order') out = { result: shard.order(msg.id, msg.spec) };
    else throw new Error(`mensaje desconocido ${msg.type}`);
    parentPort.postMessage({ ...out, type: 'ok', rid: msg.rid });
  } catch (e) { parentPort.postMessage({ type: 'error', rid: msg.rid, error: String(e.stack ?? e) }); }
});
