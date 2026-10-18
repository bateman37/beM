// Ejecución de UN intento (MOTOR-12 §6.1, §6.3, §7.3): materializa la entrada congelada, llama al motor existente, registra todo lo que el motor calculó y escribe los archivos del intento
// en un directorio temporal. Sin DOM. El controlador confirma después (renombrado + índice): un directorio incompleto nunca se presenta como partido confirmado.
// Un fallo conserva el último hecho confirmado, la secuencia, el error estructurado y los registros disponibles; no inventa marcador ni derrota.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createMatch, buildResult, ENGINE_VERSION } from '../match/index.js';
import { describeEvent, clockText } from '../match/narrative.js';
import { makeCtx, eventStreams, buildTables, capacityRows, validityOf, matchFacts, tableText, RECORDS_VERSION } from './records.js';
import { streamFile, TABLES, STREAMS } from './schema.js';
import { sha256 } from './hashing.js';
import { jsonl } from './util.js';
import { ESSENTIAL_LEVEL, executeEssential } from './essential.js';

// `world-essential` (MOTOR-15 §11): el MISMO resolutor con detalle mínimo; solo cambia lo que se conserva (ver essential.js). No sustituye el registro diagnóstico del laboratorio.
export const LEVEL_DETAIL = { diagnostic: 'full', reduced: 'minimal', 'world-essential': 'minimal' };

// Simulación por defecto: motor real con órdenes programadas inyectadas en su frontera deportiva (inicio de periodo), por el mismo mecanismo de órdenes y ventanas.
export function defaultSimulate(input, profile, { level, planned = [], profileRef = null, observer = null }) {
  const out = { res: null, error: null, scheduledLog: [] }; let m = null;
  try { m = createMatch(input, profile, { detail: LEVEL_DETAIL[level] ?? 'full', direction: null, profileRef }); }
  catch (e) { out.error = { phase: 'preparacion', message: e.message, validation: e.validation ?? null, stack: String(e.stack ?? '').split('\n').slice(0, 6) }; return out; }
  const pend = planned.map((o) => ({ ...o, done: false }));
  const fire = (cond) => { for (const o of pend) if (!o.done && cond(o)) { o.done = true; const base = { boundary: o.boundary, period: o.period, team_index: o.team, spec: o.spec, actor: 'programado', frontier_after_step: m.stepSeq }; try { const ord = m.submit({ ...o.spec, team: o.team }); out.scheduledLog.push({ ...base, order_id: ord.id, state: ord.state, reason: ord.reason ?? null }); } catch (e) { out.scheduledLog.push({ ...base, order_id: null, state: 'rechazada', reason: e.message }); } } };
  try {
    fire((o) => o.period === 1);
    while (m.step()) { if (observer) observer.consume(m.events); if (m.periodBreak != null) fire((o) => o.period === m.periodBreak); }
    for (const o of pend) if (!o.done) out.scheduledLog.push({ boundary: o.boundary, period: o.period, team_index: o.team, spec: o.spec, actor: 'programado', frontier_after_step: m.stepSeq, order_id: null, state: 'no_alcanzada', reason: 'el partido terminó antes de esa frontera' });
  } catch (e) { out.error = { phase: 'simulacion', message: e.message, stack: String(e.stack ?? '').split('\n').slice(0, 6) }; }
  if (observer) { try { out.observed = observer.finish(m); } catch (e) { out.observedError = e.message; } }
  try { out.res = buildResult(m); } catch (e) { out.error ??= { phase: 'registro', message: `no se pudo construir el resultado: ${e.message}`, stack: String(e.stack ?? '').split('\n').slice(0, 6) }; }
  if (out.res?.status === 'error' && !out.error) out.error = { phase: 'simulacion', message: out.res.errors?.[0]?.message ?? 'error de ejecución del motor', stack: out.res.errors?.[0]?.stack ?? null };
  return out;
}

function put(dir, rel, content, files, meta) {
  const p = join(dir, rel); mkdirSync(dirname(p), { recursive: true }); const buf = Buffer.from(content, 'utf8'); writeFileSync(p, buf);
  files.push({ path: rel, bytes: buf.length, sha256: sha256(buf), ...meta });
}

// Ejecuta y escribe. `task`: { frozen, ex, attemptNo, attemptId, outDir, level, prose, now, simulate }.
export function executeAttempt(task) {
  if (task.level === ESSENTIAL_LEVEL) return executeEssential(task, defaultSimulate);
  const { frozen, ex, attemptNo, attemptId, outDir, level, prose = 'omitted', now = Date.now, simulate = defaultSimulate } = task;
  const startedAt = now(); const t0 = performance.now(); const files = []; let error = null; let res = null; let scheduledLog = [];
  const keys = { batch_id: frozen.batch_id, variant_id: ex.variant_id, case_id: ex.case_id, match_id: ex.match_id, attempt_id: attemptId };
  const entry = frozen.entryOf(ex); const input = frozen.inputFor(entry, ex.seed);
  const prof = frozen.profile;
  const tSim0 = performance.now();
  const r = simulate(input, prof, { level, planned: entry.planned_orders ?? [], profileRef: { batch: frozen.batch_id, profile_id: frozen.profile_id } });
  const tSim = performance.now() - tSim0; let tRec = 0; let tWrite = 0;
  res = r.res; error = r.error; scheduledLog = r.scheduledLog ?? [];
  let facts = {}; let validity = { valid: false, reasons: [], reconciliation_ok: false, analysis_ok: false };
  let counts = { eventos: 0, decisiones: 0, sorteos: 0, ordenes: 0, estados: 0 }; let lastEvent = null;
  if (res) {
    lastEvent = res.events.length ? { id: res.events[res.events.length - 1].id, seq: res.events[res.events.length - 1].seq } : null;
    const ctx = makeCtx(res, { keys, entry }); ctx.scheduledLog = scheduledLog; const wr0 = () => performance.now();
    try {
      validity = res.status === 'finished' ? validityOf(res) : { valid: false, reasons: [`partido no terminado (estado ${res.status})`], reconciliation_ok: false, analysis_ok: false };
      facts = matchFacts(res, ctx, validity);
      const st = eventStreams(res, ctx, { level }); counts = st.counts; let tw = 0;
      const wr = (stream, lines) => { const a = wr0(); wrRaw(stream, lines); tw += wr0() - a; };
      const wrRaw = (stream, lines) => put(outDir, streamFile(stream, ex.match_id, attemptId), lines.join(''), files, { kind: 'jsonl', stream, records: lines.length, audience: STREAMS[stream].audience });
      wr('eventos', st.eventos); wr('sorteos', st.sorteos); wr('ordenes', st.ordenes); wr('estados', st.estados);
      wr('decisiones', st.decisiones);
      if (res.status === 'finished') {
        const T = buildTables(res, ctx, validity); if (level === 'diagnostic') T['capacidades-uso'] = capacityRows(st.capUse, ctx);
        const a = wr0(); for (const [name, rows] of Object.entries(T)) put(outDir, `tablas/${name}.csv.part`, tableText(rows), files, { kind: 'csv_part', table: name, records: rows.length, audience: 'diagnostic' }); tw += wr0() - a;
      }
      if (prose === 'included') {
        const nm = (id) => id; const tn = (i) => res.teams[i].id; const lines = [`# Relato del partido ${ex.match_id} (${attemptId})`, '', 'Derivado de los hechos registrados; no decide nada ni consume azar. Presentación, no registro deportivo.', ''];
        for (const ev of res.events) lines.push(`- Periodo ${ev.period} ${clockText(ev.clock.before)}→${clockText(ev.clock.after)} (${ev.id}) ${describeEvent(ev, { name: nm, teamName: tn })}`);
        const a = wr0(); put(outDir, `relato/relato-${ex.match_id}--${attemptId}.md`, `${lines.join('\n')}\n`, files, { kind: 'markdown', stream: 'relato', records: res.events.length, audience: 'diagnostic' }); tw += wr0() - a;
      }
      tWrite = tw;
    } catch (e) { error ??= { phase: 'registro', message: `fallo al registrar: ${e.message}`, stack: String(e.stack ?? '').split('\n').slice(0, 6) }; validity = { ...validity, valid: false, reasons: [...(validity.reasons ?? []), 'registro incompleto'] }; }
  }
  tRec = res ? performance.now() - tSim0 - tSim : 0;
  const failed = !!error || res?.status === 'error' || !res;
  const finishedAt = now(); const ms = performance.now() - t0;
  const outcome = {
    attempt_id: attemptId, match_id: ex.match_id, attempt_no: attemptNo, exec_state: failed ? 'fallida' : 'terminada', sporting_status: res?.status ?? null, valid: !failed && validity.valid,
    exclusion_reason: failed ? (error ? `${error.phase}: ${error.message}` : 'error de ejecución') : validity.reasons.join('; '), started_at: startedAt, finished_at: finishedAt, exec_ms: ms, record_level: level,
    engine_version: ENGINE_VERSION, records_version: RECORDS_VERSION, error, last_event_id: lastEvent?.id ?? null, last_sequence: lastEvent?.seq ?? null, facts, counts, files, scheduled_orders: scheduledLog.length, timings: { simulate_ms: tSim, record_ms: Math.max(0, tRec - tWrite), write_ms: tWrite },
    dir_files: files.map((f) => f.path),
  };
  const body = JSON.stringify({ schema: 'beM-batch-attempt/1', ...outcome, tables: Object.keys(TABLES) });
  mkdirSync(outDir, { recursive: true }); writeFileSync(join(outDir, 'resultado.json'), body);
  return outcome;
}
