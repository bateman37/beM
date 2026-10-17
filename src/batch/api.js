// API local de lotes (MOTOR-12): rutas `/api/batch/*` del servidor del laboratorio. El navegador solo envía la definición (equipos ya materializados, variantes, semillas) y consulta
// progreso; el servidor congela, ejecuta (hilo de trabajo), conserva progresivamente en `out/batches/` y sirve los paquetes ZIP. Sin servicios externos.
import { createReadStream, existsSync, statSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { loadData } from '../../scripts/node-data.js';
import { JobStore } from './jobstore.js';
import { BatchController } from './runner.js';
import { WorkerExecutor, WorkerPool } from './executors.js';
import { prepareBatch, planCounts, normalizeSpec, batchDefaults } from './schedule.js';
import { deriveState, countersOf, matchRows } from './state.js';
import { aggregate, compare } from './aggregate.js';
import { tableHeader } from './schema.js';
import { parseCsv, rowsAsObjects, csvLine } from './util.js';

const MAX_BODY = 256 * 1024 * 1024;
const readBody = (req) => new Promise((resolve, reject) => { const chunks = []; let n = 0; req.on('data', (c) => { n += c.length; if (n > MAX_BODY) { reject(new Error('cuerpo demasiado grande')); req.destroy(); } else chunks.push(c); }); req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new Error(`JSON no válido: ${e.message}`)); } }); req.on('error', reject); });
const send = (res, code, obj, headers = {}) => { const body = typeof obj === 'string' ? obj : JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }); res.end(body); };

export class BatchService {
  constructor({ root = undefined } = {}) {
    this.store = new JobStore(root); this.runExec = new WorkerPool({ store: this.store, size: 4 }); // grupo persistente (capacidad 4; la concurrencia efectiva de cada lote la fija su configuración) this.auxExec = new WorkerExecutor({ store: this.store });
    this.ctl = new BatchController({ store: this.store, executor: this.runExec }); this.data = null; this.recovered = this.ctl.recover();
  }
  players() { this.data ??= loadData(); return this.data.players; }
  async close() { await this.runExec.close(); await this.auxExec.close(); }

  async handle(req, res, path) {
    const u = new URL(req.url, 'http://x'); const seg = path.split('/').filter(Boolean).slice(2); // /api/batch/...
    try {
      if (req.method === 'GET' && seg[0] === 'list') return send(res, 200, { batches: this.ctl.list(), recovered: this.recovered });
      if (req.method === 'GET' && seg[0] === 'defaults') return send(res, 200, { note: 'los valores salen de la tabla batch del perfil efectivo; esta ruta solo confirma que el servicio está activo', service: 'beM-batch/1' });
      if (req.method === 'POST' && seg[0] === 'prepare') { const b = await readBody(req); const prep = prepareBatch(b.spec, b.profile, { players: this.players() }); return send(res, 200, { ok: prep.ok, problems: prep.problems, warnings: prep.warnings, counts: prep.counts ?? null, agendaFp: prep.agendaFp ?? null, distinctEntries: prep.distinctEntries ?? null, agenda: prep.agenda ? { pairs: prep.agenda.pairs, cases: prep.agenda.cases.length, seeds: { ...prep.agenda.seeds, collisions: prep.agenda.seeds.collisions.length }, executions: prep.agenda.executions.slice(0, 400).map(({ entry_key, ...x }) => x), truncated: prep.agenda.executions.length > 400 } : null, diffs: prep.diffs ? Object.fromEntries(Object.entries(prep.diffs).map(([k, v]) => [k, v.length])) : null, invalid: prep.invalid ?? null, variantChanges: prep.entries ? Object.fromEntries(prep.spec.variants.map((v) => [v.id, [...prep.entries.entries()].filter(([k]) => k.endsWith(`|${v.id}`)).slice(0, 1).flatMap(([, e]) => e.changes ?? [])])) : null }); }
      if (req.method === 'POST' && seg[0] === 'create') { const b = await readBody(req); const r = this.ctl.create(b.spec, b.profile, { players: this.players(), label: b.label ?? null, revisionOf: b.revisionOf ?? null }); if (!r.ok) return send(res, 422, r); if (b.start !== false) { const run = await this.ctl.run(r.batchId); r.started = run.ok; r.reason = run.reason; run.done?.catch?.(() => {}); } return send(res, 200, { ok: true, batchId: r.batchId, counts: r.counts, warnings: r.warnings }); }
      const id = seg[0]; if (!id || !this.store.exists(id)) return send(res, 404, { ok: false, reason: 'lote desconocido' });
      if (req.method === 'GET' && seg[1] === 'status') return send(res, 200, this.ctl.status(id, { rows: u.searchParams.get('rows') === '1' }));
      if (req.method === 'POST' && seg[1] === 'start') { const b = await readBody(req).catch(() => ({})); const r = await this.ctl.run(id, { profileForCompat: null, concurrency: b.concurrency ?? null }); void b; r.done?.catch?.(() => {}); const { done, ...rest } = r; return send(res, r.ok ? 200 : 409, rest); }
      if (req.method === 'POST' && seg[1] === 'stop') return send(res, 200, this.ctl.requestStop(id));
      if (req.method === 'POST' && seg[1] === 'retry') { const b = await readBody(req); const r = this.ctl.retry(id, b.matchIds ?? []); if (r.ok) { const run = await this.ctl.run(id); run.done?.catch?.(() => {}); } return send(res, r.ok ? 200 : 422, r); }
      if (req.method === 'GET' && seg[1] === 'aggregates') return send(res, 200, this.aggregates(id));
      if (req.method === 'GET' && seg[1] === 'match' && seg[2] && !seg[3]) return send(res, 200, this.matchDetail(id, seg[2]));
      if (req.method === 'GET' && seg[1] === 'match' && seg[3] === 'export') { const r = await this.auxExec.replay(id, seg[2]); const info = this.ctl.snapshot(id).info.get(seg[2]); const rec = info?.canonical?.facts?.trajectory_fp ?? null; return send(res, 200, r.json, { 'X-Trajectory-Fp': r.trajectory_fp, 'X-Trajectory-Recorded': rec ?? '', 'X-Trajectory-Match': String(rec != null && rec === r.trajectory_fp) }); }
      if (req.method === 'POST' && seg[1] === 'package') { const b = await readBody(req).catch(() => ({})); const r = await this.auxExec.package(id, { matchIds: b.matchIds ?? null, partTargetMiB: b.partTargetMiB ?? undefined }); const stamp = basename(r.outDir); return send(res, 200, { ...r, packages: r.packages.map((p) => ({ name: p.name, bytes: p.bytes, sha256: p.sha256, uncompressed: p.uncompressed, integrity_verified: p.integrity_verified, url: `/api/batch/${id}/download/${stamp}/${p.name}` })), measurements: undefined, summary: { kind: r.kind, scope: r.scope, verified: r.verified, total_ms: r.total_ms } }); }
      if (req.method === 'GET' && seg[1] === 'download' && seg[2] && seg[3]) { const f = join(this.store.dir(id), 'paquetes', basename(seg[2]), basename(seg[3])); if (!existsSync(f) || !f.endsWith('.zip')) return send(res, 404, { ok: false, reason: 'paquete no encontrado' }); res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': statSync(f).size, 'Content-Disposition': `attachment; filename="${basename(f)}"`, 'Cache-Control': 'no-store' }); createReadStream(f).pipe(res); return undefined; }
      return send(res, 404, { ok: false, reason: 'ruta de lotes desconocida' });
    } catch (e) { return send(res, 500, { ok: false, reason: e.message }); }
  }

  // Agregados bajo demanda (mismas funciones que el paquete) con filas de equipos/indicadores de los partidos canónicos.
  aggregates(id) {
    const { lote, info } = this.ctl.snapshot(id); const rows = matchRows(lote, info); const teamRows = []; const indRows = []; const capRows = [];
    for (const m of rows) { const canon = info.get(m.match_id).canonical; if (!canon || canon.state !== 'terminada') continue; for (const f of canon.files ?? []) { if (f.kind !== 'csv_part' || !['equipos', 'indicadores'].includes(f.table)) continue; const abs = join(this.store.attemptDir(id, m.match_id, canon.attempt_id), f.path); const t = parseCsv(`${csvLine(tableHeader(f.table))}${readFileSync(abs, 'utf8')}`); (f.table === 'equipos' ? teamRows : indRows).push(...rowsAsObjects(t)); } }
    const execs = rows.map((m) => ({ match_id: m.match_id, variant_id: m.variant_id, case_id: m.case_id, pair_id: m.pair_id, home_team_instance_id: m.home_team_instance_id, away_team_instance_id: m.away_team_instance_id, home_source_team_id: m.home_source_team_id, away_source_team_id: m.away_source_team_id, exec_state: m.exec_state, valid: !!m.valid }));
    const variants = this.store.readJson(id, 'entradas/variantes.json'); const agg = aggregate({ batchId: id, execs, teamRows, indRows, capRows });
    const comps = compare({ batchId: id, execs, teamRows, indRows, baseVariant: variants.base_variant_id, candVariants: variants.variants.slice(1).map((v) => v.id) });
    return { batch_id: id, variants: variants.variants.map((v) => ({ id: v.id, label: v.label })), base_variant: variants.base_variant_id, indicadores: agg.indicadores, distribuciones: agg.distribuciones, comparaciones: comps, counters: countersOf(lote, info), convention: 'tasa agregada = Σnum/Σden; distribución con cuantiles lineales (n−1)p y desviación muestral n−1' };
  }
  matchDetail(id, mid) {
    const { lote, info } = this.ctl.snapshot(id); const m = info.get(mid); if (!m) throw new Error('partido desconocido'); const entry = lote.agenda.find((x) => x.match_id === mid);
    return { match: entry, exec_state: m.exec_state, attempts: m.attempts.map((a) => ({ ...a, files: undefined, file_count: a.files?.length ?? 0, files_listing: (a.files ?? []).map((f) => ({ path: f.path, bytes: f.bytes, records: f.records })) })), canonical: m.canonical?.attempt_id ?? null };
  }
}
void readdirSync; void planCounts; void normalizeSpec; void batchDefaults; void deriveState;
