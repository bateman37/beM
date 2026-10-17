// Fuentes de evidencia de la auditoría (MOTOR-13 §4.2, §12): un lote conservado (`out/batches/<lote>/`) o un paquete/directorio verificable de MOTOR-12.
// Un auditor recibe hechos ya generados: NO simula, no llama al entrenador y no solicita RNG. Antes de interpretar se valida la integridad (§4.2): se recalculan los SHA-256 de los
// archivos de cada intento contra el índice (lote) o se ejecuta el comprobador de 15 controles (paquete). Una parte aislada se declara parcial, no como el lote completo.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JobStore } from '../batch/jobstore.js';
import { openTarget, verifySet } from '../batch/check.js';
import { TABLES, STREAMS } from '../batch/schema.js';
import { parseCsv, rowsAsObjects, num } from '../batch/util.js';
import { sha } from './util.js';

const CSV_COLS = (name) => TABLES[name].cols.map((c) => c.name);
const typed = (name, obj) => { const cols = Object.fromEntries(TABLES[name].cols.map((c) => [c.name, c.type])); for (const k of Object.keys(obj)) { const t = cols[k]; if (t === 'int' || t === 'number') obj[k] = num(obj[k]); else if (t === 'bool') obj[k] = obj[k] === '' ? null : obj[k] === 'true'; } return obj; };

// ---------------------------------------------------------------------------------------------------------------- lote conservado
export class BatchSource {
  constructor(root, batchId) { this.kind = 'lote'; this.root = root; this.batchId = batchId; this.store = new JobStore(root); this.dir = this.store.dir(batchId); }
  describe() { return { kind: this.kind, id: this.batchId, path: this.dir }; }
  load() {
    if (!this.store.exists(this.batchId)) throw new Error(`el lote ${this.batchId} no existe en ${this.root}`);
    this.job = this.store.readJob(this.batchId); this.lote = this.store.readJson(this.batchId, 'entradas/lote.json');
    this.variants = existsSync(join(this.dir, 'entradas/variantes.json')) ? this.store.readJson(this.batchId, 'entradas/variantes.json') : null;
    const idx = this.store.readIndex(this.batchId); this.matches = new Map();
    for (const r of idx) if (r.type === 'attempt' && r.exec_state === 'terminada') this.matches.set(r.match_id, r);
    const sched = this.job.schedule ?? this.job.agenda ?? null; this.schedule = sched;
    return this;
  }
  // Lista canónica (último intento terminado de cada ejecución lógica) con sus claves de relación; el reparto caso/variante sale de la agenda congelada.
  attempts() {
    const ex = new Map(); for (const e of this.lote.agenda ?? []) ex.set(e.match_id, e);
    return [...this.matches.values()].map((a) => { const e = ex.get(a.match_id) ?? {}; return { match_id: a.match_id, attempt_id: a.attempt_id, case_id: e.case_id ?? null, variant_id: e.variant_id ?? null, pair_id: e.pair_id ?? null, level: a.record_level, valid: !!a.valid, facts: a.facts, files: a.files, counts: a.counts, exec_ms: a.exec_ms, engine_version: a.engine_version, record: a }; });
  }
  verifyIntegrity() {
    const problems = []; let files = 0; let bytes = 0;
    for (const a of this.attempts()) for (const f of a.files ?? []) { const p = join(this.dir, 'intentos', a.match_id, a.attempt_id, f.path); files += 1; if (!existsSync(p)) { problems.push(`falta ${f.path} (${a.attempt_id})`); continue; } const b = readFileSync(p); bytes += b.length; if (b.length !== f.bytes || sha(b) !== f.sha256) problems.push(`${f.path} (${a.attempt_id}): bytes o SHA-256 distintos del índice`); }
    return { ok: problems.length === 0, files, bytes, problems, method: 'SHA-256 de cada archivo de intento frente a indice.jsonl' };
  }
  stream(a, name) { const f = (a.files ?? []).find((x) => x.stream === name); if (!f) return null; return readFileSync(join(this.dir, 'intentos', a.match_id, a.attempt_id, f.path)); }
  table(a, name) {
    const f = (a.files ?? []).find((x) => x.table === name); if (!f) return null;
    const p = join(this.dir, 'intentos', a.match_id, a.attempt_id, f.path); const text = readFileSync(p, 'utf8'); if (!text.trim()) return [];
    const cols = CSV_COLS(name); const { rows } = parseCsv(`${cols.join(',')}\n${text}`);
    return rowsAsObjects({ header: cols, rows }).map((o) => typed(name, o));
  }
  frozenFile(rel) { const p = join(this.dir, rel); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; }
  fingerprint(policy) { return sha({ kind: this.kind, batch: this.batchId, a: this.attempts().map((a) => [a.attempt_id, (a.files ?? []).map((f) => f.sha256)]), policy }).slice(0, 16); }
}

// ---------------------------------------------------------------------------------------------------------------- paquete verificable de MOTOR-12
export class PackageSource {
  constructor(target) { this.kind = 'paquete'; this.target = target; this.id = target; }
  describe() { return { kind: this.kind, id: this.target, path: this.target }; }
  load() {
    this.providers = openTarget(this.target); this.manifests = this.providers.map((p) => JSON.parse(p.read('manifest.json').toString('utf8')));
    this.parts = this.providers.map((p, i) => ({ p, m: this.manifests[i] })).filter((x) => x.m.identity?.scope !== 'indice');
    this.scope = this.manifests.map((m) => m.identity?.scope);
    this.complete = this.parts.length > 0 && this.manifests.some((m) => m.identity?.scope === 'indice') || this.manifests.some((m) => m.identity?.scope === 'lote');
    this._parts = this.parts; this.matches = [];
    for (const { p } of this.parts) {
      const rows = this.read(p, 'estadisticas/partidos.csv'); for (const r of rows ?? []) this.matches.push({ ...r, _p: p });
    }
    return this;
  }
  read(p, path) { if (!p.has(path)) return null; return rowsAsObjects(parseCsv(p.read(path).toString('utf8'))); }
  attempts() {
    return this.matches.filter((m) => m.exec_state === 'terminada').map((m) => ({ match_id: m.match_id, attempt_id: m.attempt_id, case_id: m.case_id, variant_id: m.variant_id, pair_id: m.pair_id, level: m.record_level, valid: m.valid === 'true', facts: { score_home: num(m.score_home), score_away: num(m.score_away), draws: num(m.draws), events: num(m.events), possessions: num(m.possessions), trajectory_fp: m.trajectory_fp, reconciliation_ok: m.reconciliation_ok === 'true', analysis_ok: m.analysis_ok === 'true' }, _p: m._p, files: null }));
  }
  verifyIntegrity() { const r = verifySet(this.providers); return { ok: r.ok, files: null, bytes: null, problems: r.problems ?? [], method: `comprobador de paquete (${r.checks?.length ?? 0} controles)`, checks: r.checks?.map((c) => ({ id: c.id, status: c.status })) }; }
  stream(a, name) { const path = `${STREAMS[name].dir}/${STREAMS[name].prefix}-${a.match_id}--${a.attempt_id}.jsonl`; const p = a._p; if (p.has(path)) return p.read(path); const m = this.parts.find((x) => x.p.has(path)); return m ? m.p.read(path) : null; }
  table(a, name) { const rows = this.read(a._p, TABLES[name].file); if (!rows) return null; return rows.filter((r) => r.attempt_id === a.attempt_id).map((o) => typed(name, { ...o })); }
  frozenFile(rel) { for (const { p } of this.parts) if (p.has(rel)) return JSON.parse(p.read(rel).toString('utf8')); return null; }
  fingerprint(policy) { return sha({ kind: this.kind, m: this.manifests.map((m) => m.files?.map((f) => f.sha256)), policy }).slice(0, 16); }
}

export function openSource(spec, { root } = {}) {
  if (spec.kind === 'lote') return new BatchSource(root ?? spec.root, spec.id).load();
  if (spec.kind === 'paquete') return new PackageSource(spec.path).load();
  throw new Error(`fuente desconocida: ${spec.kind}`);
}
export const isDirectory = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
