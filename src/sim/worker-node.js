// Hilo de trabajo de Node para lotes SIM (sin el resolutor detallado). Ver runner.js.
import { parentPort } from 'node:worker_threads';
import { createRunner } from './runner.js';
const r = createRunner();
parentPort.on('message', (msg) => { try { parentPort.postMessage(r.handle(msg)); } catch (e) { parentPort.postMessage({ type: 'error', id: msg.id, error: String(e.stack ?? e) }); } });
