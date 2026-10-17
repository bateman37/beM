// API local de auditoría (MOTOR-13): rutas `/api/audit/*` del servidor del laboratorio. Los ejecutores de LECTURA (analizar evidencia) y los de NUEVOS PARTIDOS (lanzar un experimento, que usa
// `/api/batch/*`) están separados y se rotulan: pulsar «analizar» nunca simula un lote en silencio. El servidor lee `out/batches/`, valida la integridad antes de interpretar y guarda
// resultados regenerables en `out/audit/`. Un resultado no altera partidos, perfiles, snapshots ni lotes congelados.
import { existsSync, readdirSync, readFileSync, statSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadData } from '../../scripts/node-data.js';
import { JobStore } from '../batch/jobstore.js';
import { prepareBatch } from '../batch/schedule.js';
import { runAudit, saveResult, DEFAULT_AUDIT_ROOT, AUDIT_RESULT_SCHEMA } from './index.js';
import { openSource } from './source.js';
import { AUDIT_CATALOG } from './catalog.js';
import { experimentCatalog, experimentSpec, validationCatalog } from './experiments.js';
import { auditReport, writeAuditPackage, verifyAuditPackage } from './report.js';
import { referencesFile } from './references.js';

const send = (res, code, obj, headers = {}) => { const body = typeof obj === 'string' ? obj : JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }); res.end(body); };
const readBody = (req) => new Promise((resolve, reject) => { const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(e); } }); req.on('error', reject); });

export class AuditService {
  constructor({ batchRoot = undefined, auditRoot = DEFAULT_AUDIT_ROOT } = {}) { this.store = new JobStore(batchRoot); this.auditRoot = auditRoot; this.data = null; }
  load() { this.data ??= loadData(); return this.data; }
  resultsDir() { return join(this.auditRoot, 'resultados'); }
  listResults() { const d = this.resultsDir(); if (!existsSync(d)) return []; return readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => { const p = join(d, f); const r = JSON.parse(readFileSync(p, 'utf8')); return { id: r.id, created_at: r.created_at, sources: r.sources, matches: r.sample?.matches, findings: r.findings?.length, ok: r.ok, bytes: statSync(p).size }; }).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)); }
  readResult(id) { const p = join(this.resultsDir(), `${id}.json`); if (!/^AUDR-[0-9a-f]{8}$/.test(id) || !existsSync(p)) return null; return JSON.parse(readFileSync(p, 'utf8')); }
  lots() { return this.store.ids().map((id) => { try { const j = this.store.readJob(id); return { batch_id: id, state: j.state, label: j.label, created_at: j.created_at, executions: j.counts_requested }; } catch { return null; } }).filter(Boolean); }

  async handle(req, res, path) {
    const u = new URL(req.url, 'http://x'); const seg = path.split('/').filter(Boolean).slice(2); // /api/audit/...
    try {
      if (req.method === 'GET' && seg[0] === 'catalog') return send(res, 200, { audits: AUDIT_CATALOG, params: this.load().profile.audit, references: referencesFile() });
      if (req.method === 'GET' && seg[0] === 'sources') return send(res, 200, { lots: this.lots(), note: 'Analizar un lote lee sus archivos conservados: no simula ningún partido.' });
      if (req.method === 'POST' && seg[0] === 'preview') { const b = await readBody(req); const out = []; for (const s of b.sources ?? []) { try { const src = openSource(s, { root: this.store.root }); const v = src.verifyIntegrity(); const at = src.attempts(); out.push({ source: src.describe(), integrity: { ok: v.ok, files: v.files, bytes: v.bytes, problems: v.problems.slice(0, 5), method: v.method }, matches: at.length, levels: [...new Set(at.map((a) => a.level))], valid: at.filter((a) => a.valid).length }); } catch (e) { out.push({ source: s, error: e.message }); } } return send(res, 200, { previews: out, executor: 'lectura: no simula' }); }
      if (req.method === 'POST' && seg[0] === 'run') { const b = await readBody(req); const specs = (b.sources ?? []).map((s) => (s.kind === 'lote' ? { ...s, root: this.store.root } : s)); if (!specs.length) return send(res, 400, { ok: false, reason: 'elige al menos una fuente' }); const res0 = runAudit(specs, { profile: this.load().profile, params: b.params ?? undefined, auditRoot: this.auditRoot, ids: b.ids ?? undefined }); if (res0.ok) saveResult(res0, this.auditRoot); return send(res, 200, { ok: res0.ok, id: res0.id, reason: res0.reason, summary: res0.ok ? { runs: res0.runs.map((r) => ({ id: r.id, resultado: r.resultado, impl: r.impl, registro: r.registro, exposicion: r.exposicion, findings: r.findings })), findings: res0.findings.length, sample: res0.sample, cost: res0.cost, executor: 'lectura: no se simuló ningún partido' } : null }); }
      if (req.method === 'GET' && seg[0] === 'results' && !seg[1]) return send(res, 200, { results: this.listResults() });
      if (req.method === 'GET' && seg[0] === 'results' && seg[1]) {
        const r = this.readResult(seg[1]); if (!r) return send(res, 404, { ok: false, reason: 'resultado desconocido' }); const part = seg[2];
        if (!part) return send(res, 200, { ...r, sensitivity: undefined, reliability: undefined, matrix: undefined, sensitivity_rows: r.sensitivity.length });
        if (part === 'findings') return send(res, 200, { findings: r.findings });
        if (part === 'finding') { const f = r.findings.find((x) => x.id === seg[3]); if (!f) return send(res, 404, { ok: false, reason: 'hallazgo desconocido' }); const off = Number(u.searchParams.get('offset') ?? 0); const lim = Number(u.searchParams.get('limit') ?? r.params.examplesPerFinding); return send(res, 200, { ...f, evidence: f.evidence.slice(off, off + lim), offset: off, limit: lim, total: f.evidence.length, links: f.evidence.map((e) => (e.match_id ? { batch: e.source ?? null, match_id: e.match_id, attempt_id: e.attempt_id, note: 'ábrelo en Lotes › resultados › abrir análisis' } : null)).slice(off, off + lim) }); }
        if (part === 'matrix') return send(res, 200, { matrix: r.matrix });
        if (part === 'sensitivity') { const cap = u.searchParams.get('cap'); return send(res, 200, { rows: r.sensitivity.filter((x) => !cap || x.cap === cap).slice(0, 2000) }); }
        if (part === 'reliability') return send(res, 200, { reliability: r.reliability, warn: r.params.reliabilityWarn, note: 'Coherencia de muestreo, no realismo deportivo.' });
        if (part === 'concentration') return send(res, 200, r.concentration);
        if (part === 'report.md') return send(res, 200, auditReport(r), { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': `attachment; filename="informe-${r.id}.md"` });
        if (part === 'package.zip') { const dir = mkdtempSync(join(tmpdir(), 'beM-audit-')); const p = join(dir, `${r.id}.zip`); await writeAuditPackage(r, p, { report: auditReport(r) }); const v = verifyAuditPackage(p); if (!v.ok) { rmSync(dir, { recursive: true, force: true }); return send(res, 500, { ok: false, reason: 'el paquete no pasó su comprobador', problems: v.problems }); } const buf = readFileSync(p); rmSync(dir, { recursive: true, force: true }); res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': buf.length, 'Content-Disposition': `attachment; filename="${r.id}.zip"` }); return res.end(buf); }
      }
      if (req.method === 'GET' && seg[0] === 'experiments') { const { profile, players } = this.load(); const exps = experimentCatalog(profile, players); return send(res, 200, { experiments: exps.map((e) => { const r = prepareBatch(experimentSpec(e, profile, players), profile, { players }); return { id: e.id, name: e.name, hypothesis: e.hypothesis, pair: e.pair, level: e.level, lot_seed: e.batchSeed, derived_seeds: r.ok ? r.agenda.executions.map((x) => ({ match_id: x.match_id, variant: x.variant_id, seed: x.seed })) : [], executions: r.counts?.executions, variants: e.variants.map((v) => ({ id: v.id, label: v.label, ops: v.ops ?? [] })), conserved: e.conserved, ok: r.ok, problems: r.problems }; }), validation_reserve: validationCatalog(profile), executor: 'NUEVOS PARTIDOS: para lanzar un experimento usa «Lanzar» (pasa por /api/batch); analizar no simula' }); }
      if (req.method === 'GET' && seg[0] === 'experiment-spec' && seg[1]) { const { profile, players } = this.load(); const e = experimentCatalog(profile, players).find((x) => x.id === seg[1]); if (!e) return send(res, 404, { ok: false, reason: 'experimento desconocido' }); return send(res, 200, { spec: experimentSpec(e, profile, players), schema: AUDIT_RESULT_SCHEMA }); }
      return send(res, 404, { ok: false, reason: 'ruta de auditoría desconocida' });
    } catch (e) { return send(res, 500, { ok: false, reason: e.message }); }
  }
}
void mkdirSync;
