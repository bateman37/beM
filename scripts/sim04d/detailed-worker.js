// Hilo de trabajo del motor DETALLADO para la campaña SIM-MOTOR-03: una referencia funcional congelada (no verdad empírica). Resuelve el mismo `input` fuente que SIM y devuelve su registro esencial
// (acta, presencia, secuencia, tiros, tácticas, direcciones, estados, familiaridad) y su exposición de aprendizaje; solo la muestra diagnóstica devuelve además el resultado nativo completo.
import { parentPort } from 'node:worker_threads';
import { loadData } from '../node-data.js';
import { createMatch, buildResult } from '../../src/match/index.js';
import { buildEssential } from '../../src/batch/essential.js';
import { validityOf } from '../../src/batch/records.js';
import { exposureFromResult } from '../../src/learning/exposure.js';
import { ENGINE_VERSION } from '../../src/match/data.js';

const { profile } = loadData();
export function runDetailedCampaign(c) {
  const t0 = performance.now(); let m = null;
  try {
    m = createMatch(c.input, profile, { detail: 'full' }); let guard = 0; while (m.step() && guard++ < 2e6);
    const res = buildResult(m); const validity = res.status === 'finished' ? validityOf(res) : { valid: false, reasons: [`partido no terminado (estado ${res.status})`] };
    const ess = buildEssential(res, { keys: { case_id: c.case_id, attempt_id: c.attempt ?? 1 }, validity, fp: null, fpMode: 'none', sim: { ms: performance.now() - t0 } });
    const ex = exposureFromResult(res);
    const record = { schema: 'beM-sim03-record/1', case_id: c.case_id, resolver: 'detailed', attempt: c.attempt ?? 1, status: res.status, valid: !!validity.valid, validity, error: res.status === 'error' ? (res.errors ?? []).map((e) => e.message).join('; ') : null, versions: { engine: ENGINE_VERSION, profile: res.identity.effectiveProfileId }, essential: ess,
      exposure: ex.ok ? ex.exposure : { status: 'no_conservado', reason: ex.errors?.[0]?.message ?? 'sin exposición' }, score: res.score, periodScores: res.periodScores, ms: { total: Math.round((performance.now() - t0) * 10) / 10 } };
    return { record, diag: c.diag ? { schema: 'beM-sim03-diag/1', case_id: c.case_id, result: res } : null };
  } catch (e) { return { record: { schema: 'beM-sim03-record/1', case_id: c.case_id, resolver: 'detailed', attempt: c.attempt ?? 1, status: 'failed', valid: false, error: String(e.message ?? e).slice(0, 400), ms: { total: Math.round((performance.now() - t0) * 10) / 10 } }, diag: null }; }
}
if (parentPort) parentPort.on('message', (msg) => { try { const out = runDetailedCampaign(msg.c); /* datos planos: el resultado nativo viaja como texto JSON (el estado vivo del núcleo no es clonable) */ parentPort.postMessage({ rid: msg.rid, type: 'ok', record: JSON.parse(JSON.stringify(out.record)), diag: out.diag ? JSON.stringify(out.diag) : null }); } catch (e) { parentPort.postMessage({ rid: msg.rid, type: 'error', error: String(e.stack ?? e) }); } });
