// Web Worker (módulo) del laboratorio para el lote «ultrarrápido»: mantiene la interfaz utilizable. Ver runner.js.
import { createRunner } from './runner.js';
const r = createRunner();
self.onmessage = (ev) => { try { self.postMessage(r.handle(ev.data)); } catch (e) { self.postMessage({ type: 'error', id: ev.data.id, error: String(e.stack ?? e) }); } };
