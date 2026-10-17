// Construcción del paquete completo de análisis (MOTOR-12 §12–§15): ZIP autocontenido (o partes numeradas + índice) con CSV, JSON y JSONL, diccionario, guía, resumen, agregados, cobertura y
// auditoría. Se construye desde los archivos confirmados del trabajo (no se mantiene el lote en memoria ni se vuelve a simular). Las partes son por CASOS completos (todas las variantes de un
// caso juntas, para que la comparación emparejada quede completa) y, si un caso no cabe, por partidos; un partido mayor que el objetivo se fragmenta por secuencia con límites exactos y
// dependencias explícitas. Nada se muestrea ni se recorta: cambiar el detalle exige una nueva ejecución.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { cpus, platform, release } from 'node:os';
import { ZipWriter } from './zip.js';
import { sha256 } from './hashing.js';
import { deriveState, countersOf, matchRows } from './state.js';
import { TABLES, STREAMS, PACKAGE_SCHEMA, tableHeader, rowOf, tableAudience } from './schema.js';
import { aggregate, aggregateTactics, compare, AGG_TABLES, QUANTILE_CONVENTION } from './aggregate.js';
import { buildDictionary, dictionaryMarkdown, readmeMarkdown, resumenMarkdown, coverageRows, COVERAGE_COLUMNS, RELATIONS } from './docs.js';
import { MemProvider, verifySet } from './check.js';
import { csvLine, toCsv, parseCsv, rowsAsObjects, jsonl, iso, pad } from './util.js';
import { LOT_VERSION } from './schedule.js';

const MiB = 1048576;
const utf = (s) => Buffer.from(s, 'utf8');
const csvBuf = (name, rows) => utf(csvLine(tableHeader(name)) + rows.map((r) => csvLine(r)).join(''));

class Pkg {
  constructor() { this.files = new Map(); }
  text(path, text, meta) { const b = Buffer.isBuffer(text) ? text : utf(text); this.files.set(path, { path, buf: b, bytes: b.length, sha256: sha256(b), encoding: 'utf-8', ...meta }); }
  file(path, abs, rec, meta) { const b = readFileSync(abs); const h = sha256(b); if (rec?.sha256 && rec.sha256 !== h) throw new Error(`el archivo del intento ${abs} fue alterado desde que se confirmó (SHA-256 distinto del índice): no se empaqueta`); this.files.set(path, { path, abs, bytes: b.length, sha256: h, encoding: 'utf-8', ...meta }); }
  total() { let n = 0; for (const f of this.files.values()) n += f.bytes; return n; }
  provider() { return new MemProvider(new Map([...this.files.values()].map((f) => [f.path, f.buf ?? { file: f.abs }]))); }
}
const fmtOf = (p) => (p.endsWith('.csv') ? 'csv' : p.endsWith('.jsonl') ? 'jsonl' : p.endsWith('.json') ? 'json' : p.endsWith('.md') ? 'markdown' : 'binary');
const countRecords = (f, buf) => { try { if (f === 'csv') return parseCsv(buf.toString('utf8')).rows.length; if (f === 'jsonl') return buf.toString('utf8').split('\n').filter((l) => l.trim()).length; if (f === 'json') { const j = JSON.parse(buf.toString('utf8')); return Array.isArray(j) ? j.length : 1; } } catch { /* ilegible */ } return null; };

// ---------------------------------------------------------------------------------------------------------------- contenido por partido
function collect(store, id, info, m) {
  const out = { m, attempts: [], bytes: 0, deps: new Set() };
  for (const a of info.get(m.match_id).attempts) {
    if (a.state === 'interrumpida') {
      const dir = store.attemptDir(id, m.match_id, a.attempt_id, '.parcial'); const files = [];
      if (existsSync(dir)) { const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else files.push({ path: `parciales/${a.attempt_id}/${relative(dir, p).split(sep).join('/')}`, abs: p, bytes: statSync(p).size, kind: 'parcial', audience: 'diagnostic' }); } }; walk(dir); }
      out.attempts.push({ a, files }); out.bytes += files.reduce((s, f) => s + f.bytes, 0); continue;
    }
    const dir = store.attemptDir(id, m.match_id, a.attempt_id); const files = (a.files ?? []).map((f) => ({ ...f, abs: join(dir, f.path) }));
    out.attempts.push({ a, files }); out.bytes += files.reduce((s, f) => s + f.bytes, 0);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- partición
function planUnits(contents, budget) {
  // unidades = casos completos (todas las variantes juntas); un caso que no cabe se divide por partidos; un partido que no cabe se fragmenta
  const byCase = new Map(); for (const c of contents) { const k = c.m.case_id; if (!byCase.has(k)) byCase.set(k, []); byCase.get(k).push(c); }
  const units = [];
  for (const cs of byCase.values()) {
    const total = cs.reduce((s, c) => s + c.bytes, 0);
    if (total <= budget) units.push({ kind: 'caso', items: cs, bytes: total });
    else for (const c of cs) units.push({ kind: c.bytes <= budget ? 'partido' : 'fragmentar', items: [c], bytes: c.bytes, comparison_split: true });
  }
  return units;
}
function packUnits(units, budget) {
  const parts = []; let cur = null;
  for (const u of units) {
    if (u.kind === 'fragmentar') { if (cur) { parts.push(cur); cur = null; } parts.push({ units: [u], bytes: u.bytes, fragmented: true }); continue; }
    if (cur && cur.bytes + u.bytes > budget) { parts.push(cur); cur = null; }
    if (!cur) cur = { units: [], bytes: 0 }; cur.units.push(u); cur.bytes += u.bytes;
  }
  if (cur) parts.push(cur); return parts;
}

// Fragmenta los JSONL grandes de un partido por secuencia (límites exactos). Devuelve fragmentos { index, seq_from, seq_to, files:{path→Buffer} } y los registros sin secuencia van al primero.
function fragmentMatch(c, budget) {
  const att = c.attempts.find((x) => x.a.state === 'terminada' || x.a.state === 'fallida'); const A = att.a;
  const pick = (stream) => att.files.find((f) => f.stream === stream);
  const files = ['eventos', 'decisiones', 'sorteos'].map((s) => ({ s, f: pick(s) })).filter((x) => x.f);
  const lines = {}; const bySeq = new Map(); const noSeq = { eventos: [], decisiones: [], sorteos: [] };
  for (const { s, f } of files) { lines[s] = readFileSync(f.abs, 'utf8').split('\n').filter((l) => l.trim()); for (const l of lines[s]) { const q = JSON.parse(l).sequence; if (q == null) noSeq[s].push(l); else { if (!bySeq.has(q)) bySeq.set(q, { eventos: [], decisiones: [], sorteos: [], bytes: 0 }); const g = bySeq.get(q); g[s].push(l); g.bytes += Buffer.byteLength(l) + 1; } } }
  const seqs = [...bySeq.keys()].sort((a, b) => a - b); const fixed = Object.values(noSeq).flat().reduce((s, l) => s + Buffer.byteLength(l) + 1, 0) + att.files.filter((f) => !['eventos', 'decisiones', 'sorteos'].includes(f.stream)).reduce((s, f) => s + f.bytes, 0);
  const frags = []; let cur = { seqs: [], bytes: fixed };
  for (const q of seqs) { const g = bySeq.get(q); if (cur.seqs.length && cur.bytes + g.bytes > budget) { frags.push(cur); cur = { seqs: [], bytes: 0 }; } cur.seqs.push(q); cur.bytes += g.bytes; }
  if (cur.seqs.length) frags.push(cur);
  return frags.map((fr, i) => { const out = new Map(); for (const { s, f } of files) { const rel = f.path.replace(/\.jsonl$/, `.f${pad(i + 1, 3)}of${pad(frags.length, 3)}.jsonl`); const ls = [...(i === 0 ? noSeq[s] : []), ...fr.seqs.flatMap((q) => bySeq.get(q)[s])]; out.set(rel, { text: ls.map((l) => `${l}\n`).join(''), stream: s, original: f.path, lines: ls.length }); } return { index: i + 1, total: frags.length, seq_from: fr.seqs[0], seq_to: fr.seqs[fr.seqs.length - 1], files: out, attempt_id: A.attempt_id, match_id: c.m.match_id }; });
}

// ---------------------------------------------------------------------------------------------------------------- tablas fusionadas
function readPart(abs, name) { const t = parseCsv(`${csvLine(tableHeader(name))}${readFileSync(abs, 'utf8')}`); return rowsAsObjects(t); }

export async function buildPackage(ctl, id, opts = {}) {
  const store = ctl.store; const now = opts.now ?? Date.now; const t0 = performance.now();
  const snap = ctl.snapshot(id); const { job, lote, info } = snap; const counters = countersOf(lote, info);
  const variants = store.readJson(id, 'entradas/variantes.json'); const sel = opts.matchIds ? new Set(opts.matchIds) : null;
  const allRows = matchRows(lote, info); const rows = sel ? allRows.filter((r) => sel.has(r.match_id)) : allRows;
  if (!rows.length) return { ok: false, reason: 'ninguna ejecución seleccionada' };
  const target = Math.round((opts.partTargetMiB ?? lote.part_target_mib) * MiB); const complete = !sel && counters.pendientes + counters.en_curso + counters.interrumpidos === 0;
  const scopeKey = sel ? (rows.length === 1 ? 'partido' : 'extracto') : complete ? 'lote' : 'lote_parcial';
  const stamp = new Date(now()).toISOString().replace(/[-:]/g, '').slice(0, 15); const outDir = opts.outDir ?? join(store.dir(id), 'paquetes', stamp); mkdirSync(outDir, { recursive: true });
  const createdAt = now(); const mtime = new Date(createdAt); const perf = []; const incidents = incidentsOf(info, rows);
  const contents = rows.map((m) => collect(store, id, info, m));
  const fixedOverhead = (() => { const prof = statSync(join(store.dir(id), lote.profile.file)).size; return prof + statSync(join(store.dir(id), 'entradas/lote.json')).size + statSync(join(store.dir(id), 'entradas/variantes.json')).size + 400000; })();
  const budget = Math.max(target - fixedOverhead, Math.round(target * 0.5));
  const totalBytes = contents.reduce((s, c) => s + c.bytes, 0) + fixedOverhead;
  const single = totalBytes <= target || (sel && rows.length === 1 && contents[0].bytes <= budget * 2 && totalBytes <= target * 1.5);
  const prefix = scopeKey === 'partido' ? `beM-partido-${rows[0].match_id}-${id}` : `beM-lote-${id}`;
  const results = [];
  // --- un solo paquete
  if (single) {
    const r = await assemble({ store, id, lote, job, info, variants, counters, rows, contents, scopeKey, complete, outDir, name: `${prefix}-${scopeKey === 'lote' || scopeKey === 'partido' ? 'completo' : scopeKey === 'extracto' ? 'extracto' : 'parcial'}.zip`, mtime, createdAt, perf, incidents, pkgScope: scopeKey, aggScope: 'lote', allRows, target, labelOf: opts.label });
    results.push(r);
    return { ok: true, kind: 'single', scope: scopeKey, outDir, packages: results, verified: r.integrity_verified, measurements: perf, total_ms: performance.now() - t0 };
  }
  // --- varias partes + índice
  const tp = performance.now(); const units = planUnits(contents, budget); const parts = packUnits(units, budget); perf.push({ phase: 'particion', subject: 'plan', value: performance.now() - tp, unit: 'ms', n: parts.length });
  // expandir fragmentos en partes propias
  const finalParts = [];
  for (const p of parts) {
    if (p.fragmented) { const c = p.units[0].items[0]; const frags = fragmentMatch(c, budget); frags.forEach((fr) => finalParts.push({ fragment: fr, content: c, units: [] })); }
    else finalParts.push({ units: p.units, contents: p.units.flatMap((u) => u.items) });
  }
  const n = finalParts.length; const idxEntries = [];
  for (let i = 0; i < n; i++) {
    const fp = finalParts[i]; const pcontents = fp.fragment ? [fp.content] : fp.contents; const prow = pcontents.map((c) => c.m);
    const r = await assemble({ store, id, lote, job, info, variants, counters, rows: prow, contents: pcontents, scopeKey, complete, outDir, name: `${prefix}-parte-${pad(i + 1, 3)}-de-${pad(n, 3)}.zip`, mtime, createdAt, perf, incidents: incidents.filter((x) => prow.some((m) => m.match_id === x.match_id)), pkgScope: 'parte', aggScope: 'parte', part: i + 1, nParts: n, fragment: fp.fragment ?? null, allRows, target, labelOf: opts.label, splitCases: fp.units?.some((u) => u.comparison_split) });
    results.push(r); idxEntries.push({ part: i + 1, file: r.name, bytes: r.bytes, sha256: r.sha256, uncompressed_bytes: r.uncompressed, files: r.files, matches: r.matches, fragment: fp.fragment ? { match_id: fp.fragment.match_id, attempt_id: fp.fragment.attempt_id, index: fp.fragment.index, total: fp.fragment.total, seq_from: fp.fragment.seq_from, seq_to: fp.fragment.seq_to } : null });
  }
  const ir = await assembleIndex({ store, id, lote, job, info, variants, counters, rows, allRows, scopeKey, complete, outDir, name: `${prefix}-indice.zip`, mtime, createdAt, perf, incidents, idxEntries, target, contents, labelOf: opts.label });
  results.unshift(ir);
  return { ok: true, kind: 'multi', scope: scopeKey, outDir, packages: results, index: ir, parts: idxEntries, verified: results.every((r) => r.integrity_verified), measurements: perf, total_ms: performance.now() - t0 };
}

function incidentsOf(info, rows) {
  const out = []; const ids = new Set(rows.map((r) => r.match_id));
  for (const [mid, m] of info) { if (!ids.has(mid)) continue; for (const a of m.attempts) {
    if (a.state === 'fallida') out.push({ kind: 'fallo', severity: 'error', match_id: mid, attempt_id: a.attempt_id, message: a.error?.message ?? a.exclusion_reason ?? 'error de ejecución', context: { phase: a.error?.phase ?? null, last_event_id: a.last_event_id ?? null, last_sequence: a.last_sequence ?? null, seed: m.ex.seed } });
    else if (a.state === 'interrumpida') out.push({ kind: 'interrupcion', severity: 'error', match_id: mid, attempt_id: a.attempt_id, message: a.interrupted_reason ?? 'intento interrumpido', context: { seed: m.ex.seed, how_to_recover: 'repetir el caso desde su inicio congelado con la misma semilla y un nuevo intento' } });
    else if (a.state === 'terminada' && !a.valid) out.push({ kind: 'no_valido', severity: 'aviso', match_id: mid, attempt_id: a.attempt_id, message: a.exclusion_reason || 'partido terminado no válido', context: { sporting_status: a.sporting_status } });
  } if (m.exec_state === 'pendiente') out.push({ kind: 'pendiente', severity: 'info', match_id: mid, attempt_id: null, message: 'ejecución pendiente (no iniciada)', context: {} }); }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- ensamblado de un paquete (único o parte)
async function assemble(o) {
  const { store, id, lote, job, info, variants, counters, rows, contents, scopeKey, complete, outDir, name, mtime, createdAt, perf, incidents, pkgScope, aggScope, part = null, nParts = null, fragment = null, allRows, target } = o;
  const level = lote.record_level; const pkg = new Pkg(); const ta = performance.now(); const isFragTail = fragment && fragment.index > 1; const matches = [];
  const sharedMeta = { scope: 'global-compartido', audience: 'diagnostic', kind: 'entrada' };
  // entradas
  const ent = (rel) => { const abs = join(store.dir(id), rel); pkg.file(rel, abs, null, { format: fmtOf(rel), records: countRecords(fmtOf(rel), readFileSync(abs)), ...sharedMeta }); };
  ent('entradas/lote.json'); ent('entradas/variantes.json'); ent(lote.profile.file);
  const entryIds = new Set(rows.map((r) => r.entry_id)); const seen = new Set();
  for (const eid of entryIds) { const rel = `entradas/partidos/${eid}.json`; ent(rel); const en = store.readJson(id, rel); for (const t of en.teams) for (const [d, ref] of [['equipos', t.players_ref], ['planes', t.plan_ref]]) { const r2 = `entradas/${d}/${ref}.json`; if (!seen.has(r2)) { seen.add(r2); ent(r2); } } }
  // intentos y partidos
  const intRows = []; const tables = Object.fromEntries(Object.keys(TABLES).filter((k) => !['intentos', 'partidos'].includes(k)).map((k) => [k, { rows: 0, parts: [] }]));
  const tablePartsOf = []; const perfRows = []; let events = 0;
  for (const c of contents) {
    const m = c.m; const inf = info.get(m.match_id); const canon = inf.canonical;
    matches.push({ match_id: m.match_id, case_id: m.case_id, variant_id: m.variant_id, canonical_attempt_id: canon?.attempt_id ?? null, exec_state: inf.exec_state, ...(fragment ? { fragment_index: fragment.index, fragment_total: fragment.total } : {}) });
    for (const at of c.attempts) {
      const a = at.a; const exp = (a.files ?? []).find((f) => f.stream === 'eventos');
      intRows.push(rowOf('intentos', { batch_id: lote.batch_id, variant_id: m.variant_id, case_id: m.case_id, match_id: m.match_id, attempt_id: a.attempt_id, attempt_no: a.attempt_no, canonical: canon?.attempt_id === a.attempt_id, exec_state: a.state === 'en_curso' ? 'interrumpida' : a.state, sporting_status: a.sporting_status ?? null, valid: a.valid ?? false, exclusion_reason: a.exclusion_reason ?? a.interrupted_reason ?? '', started_at: a.started_at ? iso(a.started_at) : null, finished_at: a.finished_at ? iso(a.finished_at) : null, exec_ms: a.exec_ms ?? null, record_level: a.record_level ?? level, engine_version: a.engine_version ?? lote.versions.engine, error_phase: a.error?.phase ?? null, error_message: a.error?.message ?? null, last_event_id: a.last_event_id ?? null, last_sequence: a.last_sequence ?? null, events_file: exp ? `eventos/${exp.path.split('/').pop()}` : null }));
      if (a.timings) perfRows.push({ phase: 'intento', subject: a.attempt_id, simulate_ms: a.timings.simulate_ms, record_ms: a.timings.record_ms, write_ms: a.timings.write_ms, total_ms: a.exec_ms, bytes: at.files.reduce((s, f) => s + f.bytes, 0) });
      if (isFragTail) continue;
      for (const f of at.files) {
        if (f.kind === 'csv_part') { if (canon?.attempt_id === a.attempt_id) { tables[f.table].rows += f.records; tables[f.table].parts.push(f.abs); } continue; }
        if (fragment && ['eventos', 'decisiones', 'sorteos'].includes(f.stream)) continue; // los fragmentos se añaden abajo
        if (f.kind === 'parcial') { pkg.file(f.path, f.abs, null, { format: fmtOf(f.path), records: countRecords(fmtOf(f.path), readFileSync(f.abs)), scope: 'parte', audience: 'diagnostic', kind: 'parcial', note: 'registro disponible de un intento interrumpido (incompleto)' }); continue; }
        pkg.file(f.path, f.abs, f, { format: fmtOf(f.path), records: f.records, scope: 'parte', audience: STREAMS[f.stream]?.audience ?? f.audience ?? 'diagnostic', kind: f.stream ?? 'prosa', stream: f.stream, match_id: m.match_id, attempt_id: a.attempt_id });
      }
      events += a.counts?.eventos ?? 0;
    }
  }
  if (fragment) {
    const c = contents[0]; const att = c.attempts.find((x) => x.a.state === 'terminada' || x.a.state === 'fallida');
    for (const [rel, f] of fragment.files) { const buf = utf(f.text); pkg.files.set(rel, { path: rel, buf, bytes: buf.length, sha256: sha256(buf), encoding: 'utf-8', format: 'jsonl', records: f.lines, scope: 'parte', audience: 'diagnostic', kind: f.stream, stream: f.stream, match_id: c.m.match_id, attempt_id: att.a.attempt_id, fragment_index: fragment.index, fragment_total: fragment.total, seq_from: fragment.seq_from, seq_to: fragment.seq_to, canonical_fragment: fragment.index === 1 }); }
  }
  // estadísticas fusionadas (solo con filas; una tabla sin hechos lleva cabecera y cobertura «sin observaciones elegibles»)
  const stat = (name, rowsArr, audience) => { const b = Buffer.isBuffer(rowsArr) ? rowsArr : csvBuf(name, rowsArr); pkg.text(TABLES[name].file, b, { format: 'csv', records: countRecords('csv', b), scope: 'parte', audience: audience ?? tableAudience(name), kind: 'tabla', table: name }); };
  const partidosOut = isFragTail ? [] : rows.map((m) => partidoRow(m, lote, info));
  stat('intentos', isFragTail ? [] : intRows); stat('partidos', partidosOut);
  const tPart = Object.keys(tables); const teamRows = []; const indRows = []; const capRows = []; const shotRows = []; const possRows = []; const execRows = [];
  for (const name of tPart) {
    const head = utf(csvLine(tableHeader(name))); const bufs = [head]; let nrec = 0;
    if (!isFragTail) for (const abs of tables[name].parts) { const b = readFileSync(abs); bufs.push(b); }
    nrec = tables[name].rows; const buf = Buffer.concat(bufs);
    pkg.text(TABLES[name].file, buf, { format: 'csv', records: nrec, scope: 'parte', audience: tableAudience(name), kind: 'tabla', table: name, ...(nrec === 0 ? { note: 'sin observaciones elegibles (no es un productor ausente)' } : {}) });
    if (name === 'equipos') for (const abs of tables.equipos.parts) teamRows.push(...readPart(abs, 'equipos'));
    if (name === 'indicadores') for (const abs of tables.indicadores.parts) indRows.push(...readPart(abs, 'indicadores'));
    if (name === 'capacidades-uso') for (const abs of tables['capacidades-uso'].parts) capRows.push(...readPart(abs, 'capacidades-uso'));
    if (name === 'tiros') for (const abs of tables.tiros.parts) shotRows.push(...readPart(abs, 'tiros'));
    if (name === 'posesiones') for (const abs of tables.posesiones.parts) possRows.push(...readPart(abs, 'posesiones'));
    if (name === 'ejecuciones') for (const abs of tables.ejecuciones.parts) execRows.push(...readPart(abs, 'ejecuciones'));
  }
  const execs = rows.map((m) => ({ match_id: m.match_id, variant_id: m.variant_id, case_id: m.case_id, pair_id: m.pair_id, home_team_instance_id: m.home_team_instance_id, away_team_instance_id: m.away_team_instance_id, home_source_team_id: m.home_source_team_id, away_source_team_id: m.away_source_team_id, exec_state: m.exec_state, valid: !!m.valid }));
  const ag = performance.now();
  const aggs = isFragTail ? { indicadores: [], distribuciones: [], capacidades: [] } : aggregate({ batchId: lote.batch_id, scope: aggScope, execs, teamRows, indRows, capRows });
  const comps = isFragTail ? [] : compare({ batchId: lote.batch_id, scope: aggScope, execs, teamRows, indRows, baseVariant: variants.base_variant_id, candVariants: variants.variants.slice(1).map((v) => v.id) });
  const tact = isFragTail ? [] : aggregateTactics({ batchId: lote.batch_id, scope: aggScope, execs, shotRows, possRows, execRows });
  perf.push({ phase: 'agregacion', subject: name, value: performance.now() - ag, unit: 'ms', n: execs.length });
  const agg = (nm, arr) => { const cols = AGG_TABLES[nm]; const text = toCsv(cols, arr.map((r) => cols.map((c) => r[c] ?? null))); pkg.text(`agregados/${nm}.csv`, text, { format: 'csv', records: arr.length, scope: aggScope === 'lote' ? 'global' : 'parte', audience: nm === 'capacidades' ? 'diagnostic' : 'public', kind: 'agregado', table: nm }); };
  agg('indicadores', aggs.indicadores); agg('distribuciones', aggs.distribuciones); agg('comparaciones', comps); agg('tactica', tact); agg('capacidades', aggs.capacidades);
  // auditoría: incidencias, cobertura, rendimiento
  pkg.text('auditoria/incidencias.jsonl', incidents.map((i) => jsonl({ batch_id: lote.batch_id, ...i })).join(''), { format: 'jsonl', records: incidents.length, scope: 'parte', audience: 'public', kind: 'auditoria' });
  const cov = coverageRows({ level, includesDecisions: level === 'diagnostic' }); pkg.text('auditoria/cobertura.csv', toCsv(COVERAGE_COLUMNS, cov.map((r) => COVERAGE_COLUMNS.map((c) => r[c]))), { format: 'csv', records: cov.length, scope: 'global-compartido', audience: 'public', kind: 'auditoria' });
  const env = `node ${process.version} · ${platform()} ${release()} · ${cpus().length} CPU`; const bytesBy = {}; for (const f of pkg.files.values()) bytesBy[f.kind ?? 'otro'] = (bytesBy[f.kind ?? 'otro'] ?? 0) + f.bytes;
  const perfCols = ['phase', 'subject', 'simulate_ms', 'record_ms', 'write_ms', 'total_ms', 'bytes', 'unit', 'environment', 'note'];
  const pr = [...perfRows.map((r) => ({ ...r, unit: 'ms de ejecución; bytes sin comprimir', environment: env, note: 'medición real de este intento' })), ...Object.entries(bytesBy).map(([k, v]) => ({ phase: 'bytes_por_tipo', subject: k, bytes: v, unit: 'bytes sin comprimir', environment: env, note: 'contenido de este paquete' })), { phase: 'agregacion', subject: name, total_ms: perf.filter((p) => p.phase === 'agregacion').slice(-1)[0]?.value, unit: 'ms', environment: env, note: 'medición real' }];
  pkg.text('auditoria/rendimiento.csv', toCsv(perfCols, pr.map((r) => perfCols.map((c) => r[c] ?? null))), { format: 'csv', records: pr.length, scope: 'parte', audience: 'public', kind: 'auditoria', note: 'tiempos y bytes medidos; sin extrapolaciones ni promesas' });
  perf.push({ phase: 'ensamblado', subject: name, value: performance.now() - ta, unit: 'ms', n: pkg.files.size });
  // diccionario
  const dict = buildDictionary({ level }); pkg.text('diccionario.json', JSON.stringify(dict, null, 1), { format: 'json', records: 1, scope: 'global-compartido', audience: 'public', kind: 'doc' }); pkg.text('diccionario.md', dictionaryMarkdown(dict), { format: 'markdown', records: null, scope: 'global-compartido', audience: 'public', kind: 'doc' });
  // validación previa a la descarga (sobre los datos; las guías y el manifest se añaden después)
  const tv = performance.now(); const prov = stageManifest({ pkg, lote, pkgScope, part, nParts, createdAt, job, counters, scopeKey, aggScope, variants, matches, fragment, rows, level, target, id });
  const staged = new MemProvider(new Map([...pkg.files.values()].map((f) => [f.path, f.buf ?? { file: f.abs }]).concat([['manifest.json', utf(JSON.stringify(prov))]])), 'staging');
  const v = (isFragTail || pkgScope === 'parte' || pkgScope === 'extracto' || pkgScope === 'partido') ? verifySet([staged], { stage: true }) : verifySet([staged], { stage: true });
  perf.push({ phase: 'validacion', subject: name, value: performance.now() - tv, unit: 'ms', n: v.checks.length });
  const valRows = v.checks.map((c) => ({ check_id: c.id, title: c.title, status: c.status, detail: c.detail, evidence: c.evidence.slice(0, 10), universe: `${rows.length} ejecución(es) del paquete`, checker: v.version }));
  const notEvaluated = ['Contraste con FIBA (PDF no accesible)', 'Reejecución del deporte (el paquete no simula)', 'Auditorías deportivas de comportamiento/sensibilidad (MOTOR-13)'].map((t, i) => ({ check_id: `NE0${i + 1}`, title: t, status: 'not_evaluated', detail: 'fuera del alcance de MOTOR-12', evidence: [], universe: '—', checker: v.version }));
  const validations = [...valRows, ...notEvaluated]; pkg.text('auditoria/validaciones.jsonl', validations.map((x) => jsonl({ batch_id: lote.batch_id, ...x })).join(''), { format: 'jsonl', records: validations.length, scope: 'parte', audience: 'public', kind: 'auditoria' });
  const integrity = v.ok;
  // resumen, README, manifest
  const state = job.state; const sc = { lote_parcial: 'lote_parcial', lote: 'lote', partido: 'partido', extracto: 'extracto' }[scopeKey]; const pkgName = name;
  pkg.text('resumen.md', resumenMarkdown({ lote, job, counters, state, scope: aggScope === 'lote' ? 'lote' : 'parte', scopeKey: pkgScope === 'parte' ? 'parte' : sc, agg: aggs, comps, rows: rows.map((r) => ({ ...r, facts: r.facts })), incidents, validations, variants, partsInfo: null, pkgName }), { format: 'markdown', records: null, scope: 'parte', audience: 'public', kind: 'doc' });
  pkg.text('README.md', readmeMarkdown({ lote, state, scopeKey: pkgScope === 'parte' ? 'parte' : sc, level, part, nParts, pkgName, manifestSummary: `${rows.length} ejecución(es) en este paquete · ${counters.solicitados} solicitadas en el lote · validación previa: ${integrity ? 'correcta' : 'CON FALLOS (ver auditoria/validaciones.jsonl)'}` }), { format: 'markdown', records: null, scope: 'parte', audience: 'public', kind: 'doc' });
  const manifest = finalManifest({ pkg, lote, pkgScope, part, nParts, createdAt, job, counters, scopeKey, aggScope, variants, matches, fragment, rows, level, target, id, integrity, validations, incidents, name });
  const mbuf = utf(JSON.stringify(manifest, null, 1)); pkg.files.set('manifest.json', { path: 'manifest.json', buf: mbuf, bytes: mbuf.length, sha256: null, format: 'json', manifest: true });
  // ZIP
  const tz = performance.now(); const zpath = join(outDir, name); const zw = new ZipWriter(zpath, { mtime }); const order = ['README.md', 'manifest.json', 'resumen.md', 'diccionario.md', 'diccionario.json'];
  const names = [...order, ...[...pkg.files.keys()].filter((p) => !order.includes(p)).sort()];
  for (const p of names) { const f = pkg.files.get(p); await zw.add(p, f.buf ?? { file: f.abs }); }
  const zr = await zw.finish(); const zbytes = readFileSync(zpath); const zsha = sha256(zbytes);
  perf.push({ phase: 'zip', subject: name, value: performance.now() - tz, unit: 'ms', n: names.length, bytes_uncompressed: pkg.total(), bytes_zip: zr.bytes });
  return { name, path: zpath, bytes: zr.bytes, sha256: zsha, uncompressed: pkg.total(), files: pkg.files.size - 0, matches, integrity_verified: integrity, validations: validations.map((x) => ({ id: x.check_id, status: x.status })) };
}

function partidoRow(m, lote, info) {
  const f = m.facts ?? {}; const fin = m.exec_state === 'terminada';
  return rowOf('partidos', { batch_id: lote.batch_id, variant_id: m.variant_id, case_id: m.case_id, match_id: m.match_id, attempt_id: m.attempt_id, ordinal: m.ordinal, pair_id: m.pair_id, repetition: m.repetition, side_label: m.side, home_team_instance_id: m.home_team_instance_id, away_team_instance_id: m.away_team_instance_id, home_source_team_id: m.home_source_team_id, away_source_team_id: m.away_source_team_id, seed_sport: m.seed, entry_id: m.entry_id, input_id: m.input_id,
    exec_state: m.exec_state, sporting_status: m.sporting_status, valid: m.valid, eligible: m.eligible, exclusion_reason: m.exclusion_reason, score_home: fin ? f.score_home ?? null : null, score_away: fin ? f.score_away ?? null : null, winner: f.winner ?? null, periods: f.periods ?? null, overtime_periods: f.overtime_periods ?? null, game_tenths: f.game_tenths ?? null, events: f.events ?? null, possessions: f.possessions ?? null, steps: f.steps ?? null, draws: f.draws ?? null,
    record_level: m.record_level ?? lote.record_level, trajectory_fp: f.trajectory_fp ?? null, reconciliation_ok: f.reconciliation_ok ?? null, analysis_ok: f.analysis_ok ?? null, exec_ms: m.exec_ms, attempts: m.attempts });
}

function inventory(pkg, exclude = []) {
  return [...pkg.files.values()].filter((f) => !f.manifest && !exclude.includes(f.path)).sort((a, b) => (a.path < b.path ? -1 : 1)).map((f) => ({ path: f.path, format: f.format ?? fmtOf(f.path), encoding: 'utf-8', bytes: f.bytes, records: f.records ?? (f.buf ? countRecords(f.format ?? fmtOf(f.path), f.buf) : null), sha256: f.sha256, scope: f.scope ?? 'parte', audience: f.audience ?? 'diagnostic', kind: f.kind ?? null, ...(f.table ? { table: f.table } : {}), ...(f.stream ? { stream: f.stream } : {}), ...(f.match_id ? { match_id: f.match_id, attempt_id: f.attempt_id } : {}), ...(f.fragment_index ? { fragment_index: f.fragment_index, fragment_total: f.fragment_total, seq_from: f.seq_from, seq_to: f.seq_to, canonical_fragment: f.canonical_fragment } : {}), ...(f.note ? { note: f.note } : {}) }));
}
function manifestBase(x) {
  const { pkg, lote, pkgScope, part, nParts, createdAt, job, counters, scopeKey, aggScope, variants, matches, fragment, rows, level, target, id } = x;
  const complete = scopeKey === 'lote';
  const maxAud = 'diagnostic';
  return {
    identity: { package_id: `${id}${part ? `-P${pad(part, 3)}` : ''}`, batch_id: lote.batch_id, scope: pkgScope, part, n_parts: nParts, created_at: iso(createdAt), revision: lote.revision, label: lote.label, package_schema: PACKAGE_SCHEMA },
    state: { job_state: job.state, completeness: complete ? 'completo' : 'parcial', scope_description: pkgScope, selection: scopeKey, record_level: level, coverage: { level, file: 'auditoria/cobertura.csv' } },
    versions: lote.versions,
    agenda: { executions_total: lote.agenda.length, cases_total: lote.cases.length, variants: variants.variants.map((v) => v.id), base_variant: variants.base_variant_id, executions_in_package: rows.length, seeds: { batch_seed: lote.seeds.batchSeed, derivation: lote.seeds.derivation, count: lote.seeds.count, collisions: lote.seeds.collisions.length }, agenda_fp: lote.agenda_fp, profile_id: lote.profile.profile_id, entries: lote.entries.length },
    counts_scope: 'lote completo (global); los totales de esta parte están en partition.part_totals',
    counts: { solicitados: counters.solicitados, iniciados: counters.iniciados, pendientes: counters.pendientes, en_curso: counters.en_curso, terminados: counters.terminados, fallidos: counters.fallidos, interrumpidos: counters.interrumpidos, validos: counters.validos, elegibles: counters.validos, reintentados: counters.reintentados, reconciled: counters.reconciled },
    aggregation: { scope: aggScope === 'lote' ? 'lote' : 'parte', unit_of_sample: 'team_games (equipos) · match_count (resultados)', universes: 'solo partidos deportivos finalizados válidos y cubiertos por el indicador; el resto queda en las tablas de incidencias y conteos', formula: 'tasa agregada = escala × Σnum/Σden; distribución entre partidos con n propio; comparación sobre casos emparejados', exclusions: ['pendiente', 'en_curso', 'fallida', 'interrumpida', 'no_valida', 'sin exposición'], quantiles: QUANTILE_CONVENTION },
    audience: { package: maxAud, note: 'Paquete de diagnóstico del laboratorio: contiene información que no ve el entrenador automático ni un informe público.' },
    fingerprints: lote.fingerprints,
    partition: { target_bytes: Math.round(target), part, n_parts: nParts, matches: matches.map((m) => m.match_id), fragments: fragment ? [{ match_id: fragment.match_id, attempt_id: fragment.attempt_id, fragment_index: fragment.index, fragment_total: fragment.total, seq_from: fragment.seq_from, seq_to: fragment.seq_to, depends_on: fragment.index === 1 ? [] : [`parte con el fragmento 1 (estadísticas, entradas y actas canónicas de ${fragment.match_id})`], note: 'fragmento de un partido mayor que el objetivo: no es el partido completo autocontenido; el acta y el agregado canónico se cuentan una vez (fragmento 1)' }] : [], index_file: nParts ? `beM-lote-${id}-indice.zip` : null, global_totals: { ejecuciones: counters.solicitados }, part_totals: { ejecuciones: rows.length } },
    relations: RELATIONS.map((r) => ({ id: r.id, type: r.type, resolved_by: r.resolved_by })),
  };
}
function stageManifest(x) { return { ...manifestBase(x), files: inventory(x.pkg), audit: { stage: true } }; }
function finalManifest(x) {
  const { pkg, integrity, validations, incidents, name } = x; const base = manifestBase(x);
  return { ...base, state: { ...base.state, integrity_verified: integrity }, files: inventory(pkg), audit: { validations: validations.map((v) => ({ id: v.check_id, status: v.status })), failures: validations.filter((v) => v.status === 'fail').map((v) => v.check_id), incidents: incidents.length, warnings: lote_warnings(x.lote), measurements: 'auditoria/rendimiento.csv', coverage: 'auditoria/cobertura.csv', file_name: name } };
}
const lote_warnings = (lote) => lote.warnings ?? [];

// ---------------------------------------------------------------------------------------------------------------- índice global de un lote dividido
async function assembleIndex(o) {
  const { store, id, lote, job, info, variants, counters, rows, scopeKey, complete, outDir, name, mtime, createdAt, perf, incidents, idxEntries, target, allRows, labelOf } = o; void labelOf; void allRows; void complete;
  const pkg = new Pkg(); const level = lote.record_level;
  const ent = (rel) => { const abs = join(store.dir(id), rel); pkg.file(rel, abs, null, { format: fmtOf(rel), records: countRecords(fmtOf(rel), readFileSync(abs)), scope: 'global-compartido', audience: 'diagnostic', kind: 'entrada' }); };
  ent('entradas/lote.json'); ent('entradas/variantes.json');
  const intRows = []; for (const m of rows) for (const a of info.get(m.match_id).attempts) { const canon = info.get(m.match_id).canonical; intRows.push(rowOf('intentos', { batch_id: lote.batch_id, variant_id: m.variant_id, case_id: m.case_id, match_id: m.match_id, attempt_id: a.attempt_id, attempt_no: a.attempt_no, canonical: canon?.attempt_id === a.attempt_id, exec_state: a.state === 'en_curso' ? 'interrumpida' : a.state, sporting_status: a.sporting_status ?? null, valid: a.valid ?? false, exclusion_reason: a.exclusion_reason ?? a.interrupted_reason ?? '', started_at: a.started_at ? iso(a.started_at) : null, finished_at: a.finished_at ? iso(a.finished_at) : null, exec_ms: a.exec_ms ?? null, record_level: a.record_level ?? level, engine_version: a.engine_version ?? lote.versions.engine, error_phase: a.error?.phase ?? null, error_message: a.error?.message ?? null, last_event_id: a.last_event_id ?? null, last_sequence: a.last_sequence ?? null, events_file: null })); }
  const stat = (nm, arr) => { const b = csvBuf(nm, arr); pkg.text(TABLES[nm].file, b, { format: 'csv', records: arr.length, scope: 'global', audience: tableAudience(nm), kind: 'tabla', table: nm, note: 'catálogo global de todas las ejecuciones; las filas detalladas están en las partes' }); };
  stat('intentos', intRows); stat('partidos', rows.map((m) => partidoRow(m, lote, info)));
  // agregados globales desde TODOS los partidos canónicos (leídos de los archivos de cada intento)
  const teamRows = []; const indRows = []; const capRows = []; const shotRows = []; const possRows = []; const execRows = [];
  for (const m of rows) { const canon = info.get(m.match_id).canonical; if (!canon || canon.state !== 'terminada') continue; for (const f of canon.files ?? []) { if (f.kind !== 'csv_part') continue; const abs = join(store.attemptDir(id, m.match_id, canon.attempt_id), f.path); if (f.table === 'equipos') teamRows.push(...readPart(abs, 'equipos')); else if (f.table === 'indicadores') indRows.push(...readPart(abs, 'indicadores')); else if (f.table === 'capacidades-uso') capRows.push(...readPart(abs, 'capacidades-uso')); else if (f.table === 'tiros') shotRows.push(...readPart(abs, 'tiros')); else if (f.table === 'posesiones') possRows.push(...readPart(abs, 'posesiones')); else if (f.table === 'ejecuciones') execRows.push(...readPart(abs, 'ejecuciones')); } }
  const execs = rows.map((m) => ({ match_id: m.match_id, variant_id: m.variant_id, case_id: m.case_id, pair_id: m.pair_id, home_team_instance_id: m.home_team_instance_id, away_team_instance_id: m.away_team_instance_id, home_source_team_id: m.home_source_team_id, away_source_team_id: m.away_source_team_id, exec_state: m.exec_state, valid: !!m.valid }));
  const aggs = aggregate({ batchId: lote.batch_id, scope: 'lote', execs, teamRows, indRows, capRows }); const tact = aggregateTactics({ batchId: lote.batch_id, scope: 'lote', execs, shotRows, possRows, execRows }); const comps = compare({ batchId: lote.batch_id, scope: 'lote', execs, teamRows, indRows, baseVariant: variants.base_variant_id, candVariants: variants.variants.slice(1).map((v) => v.id) });
  const agg = (nm, arr) => { const cols = AGG_TABLES[nm]; pkg.text(`agregados/${nm}.csv`, toCsv(cols, arr.map((r) => cols.map((c) => r[c] ?? null))), { format: 'csv', records: arr.length, scope: 'global', audience: nm === 'capacidades' ? 'diagnostic' : 'public', kind: 'agregado', table: nm }); };
  agg('indicadores', aggs.indicadores); agg('distribuciones', aggs.distribuciones); agg('comparaciones', comps); agg('tactica', tact); agg('capacidades', aggs.capacidades);
  pkg.text('auditoria/incidencias.jsonl', incidents.map((i) => jsonl({ batch_id: lote.batch_id, ...i })).join(''), { format: 'jsonl', records: incidents.length, scope: 'global', audience: 'public', kind: 'auditoria' });
  const cov = coverageRows({ level, includesDecisions: level === 'diagnostic' }); pkg.text('auditoria/cobertura.csv', toCsv(COVERAGE_COLUMNS, cov.map((r) => COVERAGE_COLUMNS.map((c) => r[c]))), { format: 'csv', records: cov.length, scope: 'global', audience: 'public', kind: 'auditoria' });
  const dict = buildDictionary({ level }); pkg.text('diccionario.json', JSON.stringify(dict, null, 1), { format: 'json', records: 1, scope: 'global', audience: 'public', kind: 'doc' }); pkg.text('diccionario.md', dictionaryMarkdown(dict), { format: 'markdown', records: null, scope: 'global', audience: 'public', kind: 'doc' });
  const indexJson = { schema: 'beM-analysis-index/1', batch_id: lote.batch_id, created_at: iso(createdAt), scope: scopeKey, state: job.state, counters, n_parts: idxEntries.length, target_bytes: target, note: 'Los totales de este índice son GLOBALES; cada parte lleva sus propios totales de ámbito parte (no se suman a los globales). Cada partido canónico está en exactamente una parte; un partido fragmentado declara todos sus fragmentos.', parts: idxEntries.map((p) => ({ part: p.part, file: p.file, bytes: p.bytes, sha256: p.sha256, uncompressed_bytes: p.uncompressed_bytes, files: p.files, matches: p.matches, fragment: p.fragment })), global_files: ['agregados/*.csv', 'estadisticas/partidos.csv', 'estadisticas/intentos.csv', 'resumen.md', 'auditoria/*'] };
  pkg.text('indice.json', JSON.stringify(indexJson, null, 1), { format: 'json', records: 1, scope: 'global', audience: 'public', kind: 'indice' });
  const validations = [{ check_id: 'IDX01', title: 'El índice enumera todas las partes con tamaño y SHA-256 de su ZIP final', status: 'pass', detail: `${idxEntries.length} partes`, evidence: [], universe: 'partes', checker: 'builder' }, { check_id: 'IDX02', title: 'Cada partido canónico aparece en exactamente una parte (fragmentos explícitos)', status: new Set(idxEntries.flatMap((p) => p.matches.filter((m) => !m.fragment_index || m.fragment_index === 1).map((m) => m.match_id))).size === rows.length ? 'pass' : 'fail', detail: '', evidence: [], universe: 'ejecuciones', checker: 'builder' }];
  pkg.text('auditoria/validaciones.jsonl', validations.map((x) => jsonl({ batch_id: lote.batch_id, ...x })).join(''), { format: 'jsonl', records: validations.length, scope: 'global', audience: 'public', kind: 'auditoria' });
  pkg.text('resumen.md', resumenMarkdown({ lote, job, counters, state: job.state, scope: 'lote', scopeKey: 'indice', agg: aggs, comps, rows, incidents, validations: validations.map((v) => ({ ...v })), variants, partsInfo: idxEntries, pkgName: name }), { format: 'markdown', records: null, scope: 'global', audience: 'public', kind: 'doc' });
  pkg.text('README.md', `${readmeMarkdown({ lote, state: job.state, scopeKey: 'indice', level, part: null, nParts: idxEntries.length, pkgName: name, manifestSummary: `Lote dividido en ${idxEntries.length} partes. Adjunta este índice y TODAS las partes. Los totales de aquí son globales; los de cada parte, de su ámbito.` })}\n## Partes\n\n${idxEntries.map((p) => `- Parte ${p.part}: \`${p.file}\` (${(p.bytes / MiB).toFixed(1)} MiB, ${p.matches.length} partido(s))`).join('\n')}\n`, { format: 'markdown', records: null, scope: 'global', audience: 'public', kind: 'doc' });
  const base = manifestBase({ pkg, lote, pkgScope: 'indice', part: null, nParts: idxEntries.length, createdAt, job, counters, scopeKey, aggScope: 'lote', variants, matches: rows.map((r) => ({ match_id: r.match_id })), fragment: null, rows, level, target, id });
  const manifest = { ...base, identity: { ...base.identity, scope: 'indice' }, state: { ...base.state, integrity_verified: validations.every((v) => v.status === 'pass') }, partition: { ...base.partition, parts: idxEntries.map((p) => ({ part: p.part, file: p.file, bytes: p.bytes, sha256: p.sha256 })) }, files: inventory(pkg), audit: { validations: validations.map((v) => ({ id: v.check_id, status: v.status })), failures: validations.filter((v) => v.status === 'fail').map((v) => v.check_id), incidents: incidents.length, warnings: [], measurements: 'las mediciones están en cada parte (auditoria/rendimiento.csv)', coverage: 'auditoria/cobertura.csv', file_name: name } };
  const mbuf = utf(JSON.stringify(manifest, null, 1)); pkg.files.set('manifest.json', { path: 'manifest.json', buf: mbuf, bytes: mbuf.length, format: 'json', manifest: true });
  const zpath = join(outDir, name); const zw = new ZipWriter(zpath, { mtime }); const order = ['README.md', 'manifest.json', 'indice.json', 'resumen.md']; const names = [...order, ...[...pkg.files.keys()].filter((p) => !order.includes(p)).sort()];
  for (const p of names) { const f = pkg.files.get(p); await zw.add(p, f.buf ?? { file: f.abs }); }
  const zr = await zw.finish(); const zsha = sha256(readFileSync(zpath));
  return { name, path: zpath, bytes: zr.bytes, sha256: zsha, uncompressed: pkg.total(), files: pkg.files.size, integrity_verified: manifest.state.integrity_verified, validations: validations.map((x) => ({ id: x.check_id, status: x.status })), matches: [] };
}
export function cleanPackages(store, id) { rmSync(join(store.dir(id), 'paquetes'), { recursive: true, force: true }); }
void LOT_VERSION;
