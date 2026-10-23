// Persistencia local de lotes SIM (§8.2): reutiliza el almacén durable de lotes del detallado (job.json, índice append-only con fsync, escritura atómica) con espacio de nombres propio `out/sim-batches`
// (variable BEM_SIM_BATCH_ROOT en pruebas). El ÍNDICE es la fuente de verdad: el archivo del resultado se escribe y se confirma ANTES de anotar «terminado»; un proceso interrumpido no puede dejar un
// «terminado» cuyo archivo no existe. Un intento sin confirmación es «interrumpido»; su archivo huérfano, si lo hubiera, se conserva aparte y no cuenta.
import { join } from 'node:path';
import { existsSync, readFileSync, statSync, renameSync, mkdirSync } from 'node:fs';
import { JobStore } from '../batch/jobstore.js';
import { ROOT } from '../../scripts/node-data.js';
import { sha256Hex } from '../sim/fp.js';

export const SIM_JOB_SCHEMA = 'beM-sim-batch-job/1';
export const DEFAULT_SIM_ROOT = process.env.BEM_SIM_BATCH_ROOT ?? join(ROOT, 'out', 'sim-batches');
export class SimBatchStore extends JobStore {
  constructor(root = DEFAULT_SIM_ROOT) { super(root); }
  resultPath(id, caseId, attempt) { return join(this.attemptDir(id, caseId, `A${attempt}`), 'resultado.json'); }
  // Confirmación coherente: (1) resultado atómico, (2) línea de índice con su suma y tamaño (fsync). Devuelve la ficha confirmada.
  commit(id, { caseId, attempt, status, valid, score, ess, analysis = null, extra = {} }) {
    const dir = this.attemptDir(id, caseId, `A${attempt}`); const body = JSON.stringify({ schema: 'beM-sim-batch-result/1', caseId, attempt, status, valid, score, essential: ess, analysis });
    this.atomicWrite(join(dir, 'resultado.json'), body); const rec = { t: 'done', case: caseId, attempt, status, valid, score, file: `intentos/${caseId}/A${attempt}/resultado.json`, bytes: body.length, sha256: sha256Hex(body), ...extra };
    this.appendIndex(id, rec); return rec;
  }
  start(id, caseId, attempt, extra = {}) { this.appendIndex(id, { t: 'start', case: caseId, attempt, ...extra }); }
  fail(id, caseId, attempt, error) { this.appendIndex(id, { t: 'failed', case: caseId, attempt, error: String(error).slice(0, 300) }); }
  readResult(id, rec) { const p = join(this.dir(id), rec.file); if (!existsSync(p)) return null; const text = readFileSync(p, 'utf8'); return { text, ok: text.length === rec.bytes && sha256Hex(text) === rec.sha256, value: JSON.parse(text) }; }
  // Aparta un archivo huérfano (sin confirmación) como `.huerfano` para que no se confunda con un resultado aceptado.
  quarantine(id, caseId, attempt) { const p = this.resultPath(id, caseId, attempt); if (existsSync(p)) { renameSync(p, `${p}.huerfano`); return true; } return false; }
  _ensure() { mkdirSync(this.root, { recursive: true }); }
}
export const fileSize = (p) => statSync(p).size;
