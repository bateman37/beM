// Comprobador reutilizable del paquete (MOTOR-12 §16.2). Verifica integridad y relaciones SIN volver a simular ningún partido ni consultar datos mutables del navegador. No se limita a «el ZIP se
// abre»: un archivo con filas duplicadas, un hash alterado o una referencia rota pueden ser parseables y aun así inválidos. Opera sobre un proveedor de archivos (ZIP, directorio o memoria).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { openZip, closeZips } from './zip.js';
import { sha256 } from './hashing.js';
import { parseCsv, rowsAsObjects, num } from './util.js';
import { TABLES, STREAMS, PACKAGE_SCHEMA, tableAudience, AUDIENCE_ORDER, maxAudience } from './schema.js';
import { aggregate, aggregateTactics, compare, AGG_TABLES } from './aggregate.js';

export const CHECK_VERSION = 'CHK-MOTOR12-R1';
const utf8 = new TextDecoder('utf-8', { fatal: true });

// ---------------------------------------------------------------------------------------------------------------- proveedores
export class MemProvider {
  constructor(map, label = 'memoria') { this.map = map; this.label = label; } // path → Buffer | { file }
  list() { return [...this.map.keys()]; }
  read(path) { const v = this.map.get(path); if (v === undefined) throw new Error(`no existe ${path}`); return Buffer.isBuffer(v) ? v : v.file ? readFileSync(v.file) : Buffer.from(String(v), 'utf8'); }
  has(path) { return this.map.has(path); }
}
export class ZipProvider {
  constructor(path) { this.zip = openZip(path); this.label = path; }
  list() { return this.zip.names; } has(p) { return this.zip.names.includes(p); } read(p) { return this.zip.read(p); } close() { closeZips(); }
}
export class DirProvider {
  constructor(root) { this.root = root; this.label = root; this.names = null; }
  list() { if (!this.names) { const out = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else out.push(relative(this.root, p).split(sep).join('/')); } }; walk(this.root); this.names = out; } return this.names; }
  has(p) { return existsSync(join(this.root, p)); } read(p) { return readFileSync(join(this.root, p)); }
}
// Abre un destino: ZIP, directorio de paquete descomprimido o directorio con varios ZIP (índice + partes). Devuelve la lista de proveedores.
export function openTarget(target) {
  const st = statSync(target);
  if (st.isFile()) return [new ZipProvider(target)];
  if (existsSync(join(target, 'manifest.json'))) return [new DirProvider(target)];
  const zips = readdirSync(target).filter((f) => f.endsWith('.zip')).sort();
  if (!zips.length) throw new Error('el directorio no contiene manifest.json ni archivos .zip');
  return zips.map((f) => new ZipProvider(join(target, f)));
}

// ---------------------------------------------------------------------------------------------------------------- utilidades de lectura
const parseJsonl = (buf, label) => { const text = utf8.decode(buf); const out = []; let n = 0; for (const line of text.split('\n')) { n += 1; if (!line.trim()) continue; try { out.push(JSON.parse(line)); } catch (e) { throw new Error(`${label}: línea ${n} no es JSON válido (${e.message})`); } } return out; };
const csvRows = (buf, label) => { try { return rowsAsObjects(parseCsv(utf8.decode(buf))); } catch (e) { throw new Error(`${label}: ${e.message}`); } };
const near = (a, b, tol = 1e-9) => (a == null && b == null) || (a != null && b != null && Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b)));

export function verifySet(providers, { stage = false } = {}) {
  const checks = []; const problems = [];
  const C = (id, title, fn) => { const c = { id, title, status: 'pass', detail: '', evidence: [] }; try { const r = fn(c) ?? {}; if (r.status) c.status = r.status; if (r.detail) c.detail = r.detail; } catch (e) { c.status = 'fail'; c.detail = c.detail || e.message; c.evidence.push(e.message); } checks.push(c); if (c.status === 'fail') problems.push(`${id} ${title}: ${c.detail || c.evidence[0] || ''}`); return c; };
  const pk = providers.map((p) => { let manifest = null; try { manifest = JSON.parse(utf8.decode(p.read('manifest.json'))); } catch { /* se informa abajo */ } return { p, manifest, label: p.label }; });
  const parts = pk.filter((x) => x.manifest && x.manifest.identity?.scope !== 'indice'); const index = pk.find((x) => x.manifest?.identity?.scope === 'indice') ?? null;

  C('V00', 'Cada paquete tiene manifest.json válido con el esquema esperado', (c) => {
    for (const x of pk) { if (!x.manifest) { c.evidence.push(`${x.label}: falta o es ilegible manifest.json`); continue; } if (x.manifest.identity?.package_schema !== PACKAGE_SCHEMA) c.evidence.push(`${x.label}: esquema ${x.manifest.identity?.package_schema} ≠ ${PACKAGE_SCHEMA}`); }
    if (c.evidence.length) { c.status = 'fail'; c.detail = c.evidence[0]; }
  });
  if (pk.some((x) => !x.manifest)) return { ok: false, checks, problems, version: CHECK_VERSION };

  // V01 legibilidad y encoding; V02 checksums, bytes y registros lógicos; archivos no inventariados
  const cache = new Map(); const bufOf = (x, path) => { const k = `${x.label}::${path}`; if (!cache.has(k)) cache.set(k, x.p.read(path)); return cache.get(k); };
  C('V01', 'Archivos legibles (UTF-8) y parseables según su formato', (c) => {
    for (const x of pk) for (const f of x.manifest.files) {
      try { const b = bufOf(x, f.path); const t = utf8.decode(b); void t; if (f.format === 'csv') parseCsv(utf8.decode(b)); else if (f.format === 'jsonl') parseJsonl(b, f.path); else if (f.format === 'json') JSON.parse(utf8.decode(b)); }
      catch (e) { c.evidence.push(`${x.label}: ${f.path}: ${e.message}`); }
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} archivo(s) ilegibles; p. ej. ${c.evidence[0]}`; }
  });
  C('V02', 'Checksums SHA-256, bytes y registros lógicos coinciden con el manifest; no hay archivos sin inventariar', (c) => {
    for (const x of pk) {
      const inv = new Set(x.manifest.files.map((f) => f.path)); const names = new Set(x.p.list());
      for (const f of x.manifest.files) {
        if (!names.has(f.path)) { c.evidence.push(`${x.label}: falta ${f.path}`); continue; }
        const b = bufOf(x, f.path);
        if (b.length !== f.bytes) c.evidence.push(`${x.label}: ${f.path}: bytes ${b.length} ≠ manifest ${f.bytes}`);
        if (sha256(b) !== f.sha256) c.evidence.push(`${x.label}: ${f.path}: SHA-256 distinto del manifest (archivo alterado o corrupto)`);
        let recs = null; try { if (f.format === 'csv') recs = parseCsv(utf8.decode(b)).rows.length; else if (f.format === 'jsonl') recs = utf8.decode(b).split('\n').filter((l) => l.trim()).length; else if (f.format === 'json') recs = Array.isArray(JSON.parse(utf8.decode(b))) ? JSON.parse(utf8.decode(b)).length : 1; } catch { /* V01 */ }
        if (recs != null && f.records != null && recs !== f.records) c.evidence.push(`${x.label}: ${f.path}: registros lógicos ${recs} ≠ manifest ${f.records}`);
      }
      for (const n of names) if (n !== 'manifest.json' && !inv.has(n)) c.evidence.push(`${x.label}: ${n} no está en el inventario del manifest`);
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} discrepancia(s); p. ej. ${c.evidence[0]}`; }
  });
  if (!stage && index) C('V02b', 'El índice describe las partes (tamaño y SHA-256 de cada ZIP) y todas están presentes', (c) => {
    const idx = JSON.parse(utf8.decode(bufOf(index, 'indice.json'))); const have = parts.filter((x) => x.manifest.identity.scope === 'parte' || x.manifest.identity.scope === 'fragmento');
    for (const pt of idx.parts) { const m = have.find((x) => x.manifest.identity.part === pt.part); if (!m) { c.evidence.push(`falta la parte ${pt.part}`); continue; } try { const s = statSync(m.label); if (s.size !== pt.bytes) c.evidence.push(`parte ${pt.part}: tamaño del ZIP ${s.size} ≠ índice ${pt.bytes}`); if (sha256(readFileSync(m.label)) !== pt.sha256) c.evidence.push(`parte ${pt.part}: SHA-256 del ZIP distinto del índice`); } catch { /* proveedor no ZIP */ } }
    if (have.length !== idx.parts.length) c.evidence.push(`hay ${have.length} partes y el índice declara ${idx.parts.length}`);
    if (c.evidence.length) { c.status = 'fail'; c.detail = c.evidence[0]; }
  });

  // carga de tablas y registros
  const T = (x, name) => { const f = x.manifest.files.find((q) => q.path === TABLES[name].file); return f ? csvRows(bufOf(x, f.path), f.path) : []; };
  const dataPkgs = pk.filter((x) => x.manifest.identity.scope !== 'indice');
  const lote = JSON.parse(utf8.decode(bufOf(index ?? dataPkgs[0], 'entradas/lote.json')));
  const globalPartidos = index ? T(index, 'partidos') : null;
  // archivos de registro por (flujo, partido, intento), con sus fragmentos ordenados; un partido fragmentado solo se verifica con TODOS sus fragmentos
  const streams = new Map(); for (const x of dataPkgs) for (const f of x.manifest.files) if (f.stream && f.match_id) { const k = `${f.stream}|${f.match_id}|${f.attempt_id}`; if (!streams.has(k)) streams.set(k, []); streams.get(k).push({ x, f }); }
  for (const arr of streams.values()) arr.sort((a, b) => (a.f.fragment_index ?? 0) - (b.f.fragment_index ?? 0));
  const partsOf = (stream, m, a) => streams.get(`${stream}|${m}|${a}`) ?? [];
  const readAll = (parts) => parts.flatMap(({ x, f }) => parseJsonl(bufOf(x, f.path), f.path));
  const missingFragments = (parts) => { const t = parts[0]?.f.fragment_total; return t ? [...Array(t).keys()].filter((i) => !parts.some((p) => p.f.fragment_index === i + 1)).map((i) => i + 1) : []; };
  const partidosAll = dataPkgs.flatMap((x) => T(x, 'partidos').map((r) => ({ ...r, __pkg: x.label })));
  C('V03', 'Identificadores únicos por entidad (partidos, intentos, posesiones, F, series, jugadores, tramos, eventos)', (c) => {
    const dupe = (rows, keyf, what) => { const seen = new Set(); for (const r of rows) { const k = keyf(r); if (seen.has(k)) c.evidence.push(`${what} duplicado: ${k}`); seen.add(k); } };
    dupe(partidosAll, (r) => r.match_id, 'match_id en partidos.csv');
    for (const x of dataPkgs) {
      dupe(T(x, 'intentos'), (r) => r.attempt_id, 'attempt_id'); dupe(T(x, 'posesiones'), (r) => `${r.attempt_id}/${r.possession_id}`, 'posesión'); dupe(T(x, 'finalizaciones'), (r) => `${r.attempt_id}/${r.finalization_id}`, 'F'); dupe(T(x, 'series'), (r) => `${r.attempt_id}/${r.series_id}`, 'serie');
      dupe(T(x, 'jugadores'), (r) => `${r.attempt_id}/${r.player_instance_id}`, 'jugador'); dupe(T(x, 'tramos'), (r) => `${r.attempt_id}/${r.stint_id}`, 'tramo'); dupe(T(x, 'tiros'), (r) => `${r.attempt_id}/${r.event_id}/${r.shooter_player_instance_id}`, 'tiro'); dupe(T(x, 'equipos'), (r) => `${r.attempt_id}/${r.team_index}`, 'equipo-partido');
      dupe(T(x, 'periodos'), (r) => `${r.attempt_id}/${r.period}`, 'periodo'); dupe(T(x, 'quintetos'), (r) => `${r.attempt_id}/${r.lineup_id}`, 'quinteto');
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} duplicado(s); p. ej. ${c.evidence[0]}`; }
  });
  C('V04', 'Referencias resolubles dentro del paquete (posesión, F, serie, quinteto, partido, entrada)', (c) => {
    for (const x of dataPkgs) {
      const pos = new Set(T(x, 'posesiones').map((r) => `${r.attempt_id}/${r.possession_id}`)); const fin = new Set(T(x, 'finalizaciones').map((r) => `${r.attempt_id}/${r.finalization_id}`)); const ser = new Set(T(x, 'series').map((r) => `${r.attempt_id}/${r.series_id}`)); const lu = new Set(T(x, 'quintetos').map((r) => `${r.attempt_id}/${r.lineup_id}`));
      const att = new Set(T(x, 'intentos').map((r) => r.attempt_id)); const mat = new Set(T(x, 'partidos').map((r) => r.match_id)); const chk = (rows, f, set, what) => { for (const r of rows) { const v = f(r); if (v != null && v !== '' && !set.has(`${r.attempt_id}/${v}`)) c.evidence.push(`${what} sin resolver: ${r.attempt_id}/${v}`); } };
      chk(T(x, 'tiros'), (r) => r.possession_id, pos, 'tiros.possession_id'); chk(T(x, 'finalizaciones'), (r) => r.possession_id, pos, 'finalizaciones.possession_id'); chk(T(x, 'finalizaciones'), (r) => r.series_id, ser, 'finalizaciones.series_id'); chk(T(x, 'series'), (r) => r.finalization_id, fin, 'series.finalization_id');
      chk(T(x, 'ejecuciones'), (r) => r.possession_id, pos, 'ejecuciones.possession_id'); chk(T(x, 'posesiones'), (r) => r.lineup_home, lu, 'posesiones.lineup_home'); chk(T(x, 'posesiones'), (r) => r.lineup_away, lu, 'posesiones.lineup_away');
      for (const t of T(x, 'tiros')) { if (!att.has(t.attempt_id)) c.evidence.push(`tiros.attempt_id sin intento: ${t.attempt_id}`); if (!mat.has(t.match_id)) c.evidence.push(`tiros.match_id fuera de partidos.csv: ${t.match_id}`); }
      for (const r of T(x, 'partidos')) if (r.attempt_id && !att.has(r.attempt_id)) c.evidence.push(`partidos.attempt_id sin intento: ${r.attempt_id}`);
      for (const r of T(x, 'partidos')) if (r.entry_id && !x.p.has(`entradas/partidos/${r.entry_id}.json`)) c.evidence.push(`partidos.entry_id sin archivo de entrada: ${r.entry_id}`);
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} referencia(s) rota(s); p. ej. ${c.evidence[0]}`; }
  });
  C('V05', 'Agenda, estados e intentos concilian (estados primarios suman lo solicitado; un intento canónico por ejecución; sin duplicidad entre partes)', (c) => {
    const sel = (index ?? dataPkgs[0]).manifest.state?.selection; const exp = (sel === 'extracto' || sel === 'partido') ? [...new Set((index ? [index] : dataPkgs).flatMap((x) => x.manifest.partition?.matches ?? []))] : lote.agenda.map((a) => a.match_id); const all = globalPartidos ?? partidosAll; const inAll = new Set(all.map((r) => r.match_id));
    if (stage === false && (globalPartidos || dataPkgs.length === 1)) { for (const m of exp) if (!inAll.has(m)) c.evidence.push(`la ejecución ${m} de la agenda no está en partidos.csv`); if (all.length !== exp.length) c.evidence.push(`partidos.csv tiene ${all.length} filas y la agenda ${exp.length}`); }
    const prim = { pendiente: 0, en_curso: 0, terminada: 0, fallida: 0, interrumpida: 0 }; for (const r of all) { if (!(r.exec_state in prim)) c.evidence.push(`estado desconocido ${r.exec_state} en ${r.match_id}`); else prim[r.exec_state] += 1; }
    if (Object.values(prim).reduce((a, b) => a + b, 0) !== all.length) c.evidence.push('los estados primarios no suman las filas de partidos.csv');
    const mf = (index ?? dataPkgs[0]).manifest.counts; if (!stage && mf && sel !== 'extracto' && sel !== 'partido') { for (const [k, v] of [['pendientes', prim.pendiente + prim.en_curso], ['terminados', prim.terminada], ['fallidos', prim.fallida], ['interrumpidos', prim.interrumpida]]) if (index || dataPkgs.length === 1) { const got = k === 'pendientes' ? mf.pendientes + mf.en_curso : mf[k]; if (got !== v) c.evidence.push(`manifest.counts.${k} = ${got} ≠ ${v} derivado de partidos.csv`); } }
    for (const x of dataPkgs) { const ints = T(x, 'intentos'); const byMatch = new Map(); for (const r of ints) { if (!byMatch.has(r.match_id)) byMatch.set(r.match_id, []); byMatch.get(r.match_id).push(r); } for (const [m, rs] of byMatch) { const k = rs.filter((r) => r.canonical === 'true').length; if (k !== 1) c.evidence.push(`${m}: ${k} intentos canónicos (debe ser exactamente 1)`); } }
    if (dataPkgs.length > 1) { const seen = new Map(); for (const r of partidosAll) { if (seen.has(r.match_id)) c.evidence.push(`el partido ${r.match_id} aparece en dos partes (${seen.get(r.match_id)} y ${r.__pkg}): duplicaría la muestra`); seen.set(r.match_id, r.__pkg); } }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} discrepancia(s); p. ej. ${c.evidence[0]}`; }
  });
  C('V06', 'Marcador, periodos y acta concilian con los hechos (último hecho = marcador; Σ periodos = marcador; Σ jugadores = equipo)', (c) => {
    let n = 0;
    for (const x of dataPkgs) {
      const eqs = T(x, 'equipos'); const pls = T(x, 'jugadores'); const per = T(x, 'periodos');
      for (const p of T(x, 'partidos')) {
        if (p.exec_state !== 'terminada' || p.valid !== 'true') continue; n += 1;
        const sh = num(p.score_home); const sa = num(p.score_away); const e0 = eqs.find((e) => e.attempt_id === p.attempt_id && e.team_index === '0'); const e1 = eqs.find((e) => e.attempt_id === p.attempt_id && e.team_index === '1');
        if (!e0 || !e1) { c.evidence.push(`${p.match_id}: faltan filas de equipos`); continue; }
        if (num(e0.pts) !== sh || num(e1.pts) !== sa) c.evidence.push(`${p.match_id}: equipos.pts (${e0.pts}-${e1.pts}) ≠ marcador (${sh}-${sa})`);
        const ps = per.filter((r) => r.attempt_id === p.attempt_id); if (ps.reduce((s, r) => s + num(r.points_home), 0) !== sh || ps.reduce((s, r) => s + num(r.points_away), 0) !== sa) c.evidence.push(`${p.match_id}: Σ periodos ≠ marcador`);
        for (const [ti, e] of [[0, e0], [1, e1]]) { const sum = pls.filter((r) => r.attempt_id === p.attempt_id && r.team_instance_id === e.team_instance_id).reduce((s, r) => s + num(r.pts), 0); if (sum !== num(e.pts)) c.evidence.push(`${p.match_id}: Σ jugadores.pts del equipo ${ti} (${sum}) ≠ equipos.pts (${e.pts})`); }
        for (const r of pls) if (r.attempt_id === p.attempt_id && num(r.pts) !== 2 * num(r.fg2m) + 3 * num(r.fg3m) + num(r.ftm)) c.evidence.push(`${p.match_id}: ${r.player_instance_id}: pts ≠ 2·T2C + 3·T3C + TLC`);
        const evp = partsOf('eventos', p.match_id, p.attempt_id); if (!evp.length) { c.evidence.push(`${p.match_id}: falta el archivo de hechos`); continue; }
        const miss = missingFragments(evp); if (miss.length) { c.evidence.push(`${p.match_id}: faltan los fragmentos ${miss.join(', ')} de los hechos (el partido no puede conciliarse completo)`); continue; }
        const last = evp[evp.length - 1]; const lines = utf8.decode(bufOf(last.x, last.f.path)).split('\n').filter((l) => l.trim()); const lastEv = JSON.parse(lines[lines.length - 1]); if (lastEv.score?.[0] !== sh || lastEv.score?.[1] !== sa) c.evidence.push(`${p.match_id}: el último hecho (${lastEv.score?.join('-')}) no coincide con el marcador (${sh}-${sa})`);
      }
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} discrepancia(s); p. ej. ${c.evidence[0]}`; } else c.detail = `${n} partido(s) válido(s) conciliados`;
    if (!n) return { status: 'not_evaluated', detail: 'sin partidos válidos en este paquete' };
  });
  C('V07', 'Posesiones, F y series sin duplicidad de puntos (Σ puntos de F = puntos_f de equipos; series ligadas a su F)', (c) => {
    for (const x of dataPkgs) { const fin = T(x, 'finalizaciones'); const eqs = T(x, 'equipos'); for (const e of eqs) { const s = fin.filter((f) => f.attempt_id === e.attempt_id && f.team_instance_id === e.team_instance_id && f.closed === 'true').reduce((a, f) => a + num(f.points), 0); if (s !== num(e.points_f)) c.evidence.push(`${e.attempt_id} ${e.team_instance_id}: Σ puntos de F ${s} ≠ equipos.points_f ${e.points_f}`); } const ser = T(x, 'series'); for (const s of ser) { const f = fin.find((q) => q.attempt_id === s.attempt_id && q.finalization_id === s.finalization_id); if (s.finalization_id && f && f.series_id !== s.series_id) c.evidence.push(`${s.attempt_id}: la serie ${s.series_id} y su F ${s.finalization_id} no se apuntan mutuamente`); } }
    if (c.evidence.length) { c.status = 'fail'; c.detail = c.evidence[0]; }
  });
  C('V08', 'Minutos y presencia: Σ tramos = Σ minutos de jugadores por equipo', (c) => {
    let n = 0; for (const x of dataPkgs) { const tr = T(x, 'tramos'); const pl = T(x, 'jugadores'); for (const e of T(x, 'equipos')) { n += 1; const a = tr.filter((r) => r.attempt_id === e.attempt_id && r.team_instance_id === e.team_instance_id).reduce((s, r) => s + num(r.tenths), 0); const b = pl.filter((r) => r.attempt_id === e.attempt_id && r.team_instance_id === e.team_instance_id).reduce((s, r) => s + num(r.min_tenths), 0); if (a !== b) c.evidence.push(`${e.attempt_id} ${e.team_instance_id}: Σ tramos ${a} ≠ Σ minutos ${b} (décimas)`); } }
    if (c.evidence.length) { c.status = 'fail'; c.detail = c.evidence[0]; } else c.detail = `${n} equipo(s)-partido`;
    if (!n) return { status: 'not_evaluated', detail: 'sin equipos-partido' };
  });
  C('V09', 'Agregados recalculados desde los partidos elegibles coinciden con las tablas', (c) => {
    const holders = index ? [index] : dataPkgs;
    for (const h of holders) {
      const f = h.manifest.files.find((q) => q.path === 'agregados/indicadores.csv'); if (!f) { c.evidence.push(`${h.label}: falta agregados/indicadores.csv`); continue; }
      const scopeAll = index ? dataPkgs : [h]; const pt = scopeAll.flatMap((x) => T(x, 'partidos'));
      const execs = (index ? (globalPartidos ?? pt) : pt).map((r) => ({ match_id: r.match_id, variant_id: r.variant_id, case_id: r.case_id, pair_id: r.pair_id, home_team_instance_id: r.home_team_instance_id, away_team_instance_id: r.away_team_instance_id, home_source_team_id: r.home_source_team_id, away_source_team_id: r.away_source_team_id, exec_state: r.exec_state, valid: r.valid === 'true' }));
      const teamRows = scopeAll.flatMap((x) => T(x, 'equipos')); const indRows = scopeAll.flatMap((x) => T(x, 'indicadores')); const capRows = scopeAll.flatMap((x) => T(x, 'capacidades-uso'));
      const agg = aggregate({ batchId: lote.batch_id, scope: h.manifest.aggregation?.scope ?? 'lote', execs, teamRows, indRows, capRows });
      for (const [name, rec] of [['indicadores', agg.indicadores], ['distribuciones', agg.distribuciones]]) {
        const ff = h.manifest.files.find((q) => q.path === `agregados/${name}.csv`); if (!ff) { c.evidence.push(`${h.label}: falta agregados/${name}.csv`); continue; }
        const got = csvRows(bufOf(h, ff.path), ff.path); if (got.length !== rec.length) { c.evidence.push(`${name}.csv: ${got.length} filas ≠ ${rec.length} recalculadas`); continue; }
        const cols = AGG_TABLES[name]; got.forEach((g, i) => { for (const col of cols) { const a = rec[i][col]; const b = g[col]; if (typeof a === 'number' || (b !== '' && b != null && !Number.isNaN(Number(b)) && typeof a !== 'string')) { if (!near(a == null ? null : a, b === '' ? null : Number(b), 1e-9)) c.evidence.push(`${name}.csv fila ${i + 2} ${col}: ${b} ≠ ${a}`); } else if ((a ?? '') !== b && String(a ?? '') !== b) c.evidence.push(`${name}.csv fila ${i + 2} ${col}: «${b}» ≠ «${a ?? ''}»`); } });
      }
      const cf = h.manifest.files.find((q) => q.path === 'agregados/comparaciones.csv'); if (cf) { const variants = JSON.parse(utf8.decode(bufOf(index ?? dataPkgs[0], 'entradas/variantes.json'))); const cand = variants.variants.slice(1).map((v) => v.id); const rec = compare({ batchId: lote.batch_id, scope: h.manifest.aggregation?.scope ?? 'lote', execs, teamRows, indRows, baseVariant: variants.base_variant_id, candVariants: cand }); const got = csvRows(bufOf(h, cf.path), cf.path); if (got.length !== rec.length) c.evidence.push(`comparaciones.csv: ${got.length} filas ≠ ${rec.length} recalculadas`); }
      const tf = h.manifest.files.find((q) => q.path === 'agregados/tactica.csv'); if (tf) {
        const tact = aggregateTactics({ batchId: lote.batch_id, scope: h.manifest.aggregation?.scope ?? 'lote', execs, shotRows: scopeAll.flatMap((x) => T(x, 'tiros')), possRows: scopeAll.flatMap((x) => T(x, 'posesiones')), execRows: scopeAll.flatMap((x) => T(x, 'ejecuciones')) });
        const got = csvRows(bufOf(h, tf.path), tf.path); if (got.length !== tact.length) c.evidence.push(`tactica.csv: ${got.length} filas ≠ ${tact.length} recalculadas`);
        else got.forEach((g, i) => { for (const col of AGG_TABLES.tactica) { const a = tact[i][col]; const b = g[col]; if (typeof a === 'number') { if (!near(a, b === '' ? null : Number(b), 1e-9)) c.evidence.push(`tactica.csv fila ${i + 2} ${col}: ${b} ≠ ${a}`); } else if ((a ?? '') !== b) c.evidence.push(`tactica.csv fila ${i + 2} ${col}: «${b}» ≠ «${a ?? ''}»`); } });
      }
      if (c.evidence.length > 20) break;
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} discrepancia(s); p. ej. ${c.evidence[0]}`; }
  });
  C('V10', 'Sorteos y decisiones: ordinales contiguos 1..N por intento, N = sorteos del partido, enlaces a hechos y decisiones resueltos, sin sorteos futuros', (c) => {
    let n = 0; const pids = new Map(); for (const x of dataPkgs) for (const r of T(x, 'partidos')) if (r.attempt_id) pids.set(r.attempt_id, r);
    for (const [k, parts] of streams) {
      if (!k.startsWith('sorteos|')) continue; const [, m, a] = k.split('|'); const miss = missingFragments(parts); if (miss.length) { c.evidence.push(`${m}/${a}: faltan los fragmentos ${miss.join(', ')} de los sorteos`); continue; }
      const rows = readAll(parts); n += 1; const idx = rows.map((r) => r.draw_index).sort((p, q) => p - q);
      for (let i = 0; i < idx.length; i++) if (idx[i] !== i + 1) { c.evidence.push(`${m}/${a}: ordinal ${idx[i]} en la posición ${i + 1} (no contiguo)`); break; }
      const p = pids.get(a); if (p && p.draws !== '' && num(p.draws) !== rows.length) c.evidence.push(`${m}/${a}: ${rows.length} sorteos ≠ partidos.draws ${p.draws}`);
      const dp = partsOf('decisiones', m, a); if (dp.length && !missingFragments(dp).length) { const dec = readAll(dp); const ids = new Set(dec.map((d) => d.decision_id).filter(Boolean)); const dr = new Set(rows.map((r) => r.draw_index)); for (const r of rows) if (r.decision_id && !ids.has(r.decision_id)) { c.evidence.push(`${m}/${a}: decision_id ${r.decision_id} sin decisión`); break; } for (const d of dec) if (d.draw_index != null && !dr.has(d.draw_index)) { c.evidence.push(`${m}/${a}: draw_index ${d.draw_index} sin sorteo`); break; } }
      const ep = partsOf('eventos', m, a); if (ep.length && !missingFragments(ep).length) { const evs = readAll(ep); const ids = new Set(evs.map((e) => e.event_id)); for (const r of rows) if (!ids.has(r.event_id)) { c.evidence.push(`${m}/${a}: event_id ${r.event_id} sin hecho`); break; } const seqs = evs.map((e) => e.sequence); if (new Set(seqs).size !== seqs.length) c.evidence.push(`${m}/${a}: secuencias repetidas`); for (let i = 1; i < seqs.length; i++) if (seqs[i] < seqs[i - 1]) { c.evidence.push(`${m}/${a}: secuencia desordenada`); break; } const tot = evs.reduce((s, e) => s + (e.n_draws ?? 0), 0); if (tot !== rows.length) c.evidence.push(`${m}/${a}: Σ n_draws ${tot} ≠ sorteos ${rows.length}`); }
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} discrepancia(s); p. ej. ${c.evidence[0]}`; } else c.detail = `${n} intento(s) con sorteos verificados`;
    if (!n) return { status: 'not_evaluated', detail: 'sin archivos de sorteos' };
  });
  C('V11', 'Cada paquete incluye las entradas que necesita (entrada, fichas, planes, perfil) y las dependencias de fragmentos son explícitas; la entrada se recalcula íntegra', (c) => {
    for (const x of dataPkgs) {
      const names = new Set(x.manifest.files.map((f) => f.path)); const pid = lote.profile.profile_id; if (!names.has(`entradas/perfiles/${pid}.json`)) c.evidence.push(`${x.label}: falta el perfil efectivo ${pid}`);
      for (const f of x.manifest.files.filter((q) => q.path.startsWith('entradas/partidos/'))) {
        const en = JSON.parse(utf8.decode(bufOf(x, f.path))); for (const t of en.teams) { if (!names.has(`entradas/equipos/${t.players_ref}.json`)) c.evidence.push(`${f.path}: falta entradas/equipos/${t.players_ref}.json`); if (!names.has(`entradas/planes/${t.plan_ref}.json`)) c.evidence.push(`${f.path}: falta entradas/planes/${t.plan_ref}.json`); }
        // huella de entrada: una ficha o plan alterado cambia el entry_id (los bloques también se verifican por SHA-256 en V02)
        const refs = en.teams.map((t) => [t.players_ref, t.plan_ref]); if (!en.entry_id || !f.path.endsWith(`${en.entry_id}.json`)) c.evidence.push(`${f.path}: el entry_id no coincide con el nombre del archivo`); void refs;
      }
      for (const fr of x.manifest.partition?.fragments ?? []) if (!fr.depends_on?.length && fr.fragment_total > 1 && fr.fragment_index > 1) c.evidence.push(`${x.label}: el fragmento ${fr.fragment_index} de ${fr.match_id} no declara de qué partes depende`);
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = `${c.evidence.length} problema(s); p. ej. ${c.evidence[0]}`; }
  });
  C('V12', 'Audiencia y permisos coherentes en el paquete y en cada archivo', (c) => {
    for (const x of pk) {
      const aud = x.manifest.audience?.package; if (aud !== 'diagnostic') c.evidence.push(`${x.label}: el paquete del laboratorio debe declararse diagnostic y declara ${aud}`);
      let max = 'public';
      for (const f of x.manifest.files) {
        let exp = f.audience; const t = Object.entries(TABLES).find(([, tb]) => tb.file === f.path); if (t) exp = tableAudience(t[0]); else if (f.path.startsWith('eventos/') || f.path.startsWith('decisiones/')) exp = 'diagnostic'; else if (f.path.startsWith('entradas/')) exp = 'diagnostic'; else if (f.path.startsWith('agregados/capacidades')) exp = 'diagnostic';
        if (!AUDIENCE_ORDER.includes(f.audience)) c.evidence.push(`${x.label}: ${f.path}: audiencia no válida «${f.audience}»`); else if (AUDIENCE_ORDER.indexOf(f.audience) < AUDIENCE_ORDER.indexOf(exp)) c.evidence.push(`${x.label}: ${f.path} declara ${f.audience} pero su contenido es ${exp}`);
        max = maxAudience([max, f.audience]);
      }
      if (AUDIENCE_ORDER.indexOf(aud) < AUDIENCE_ORDER.indexOf(max)) c.evidence.push(`${x.label}: la audiencia del paquete (${aud}) es menor que la de uno de sus archivos (${max})`);
      const readme = x.manifest.files.find((f) => f.path === 'README.md'); if (readme && !/diagn[oó]stico/i.test(utf8.decode(bufOf(x, 'README.md')))) c.evidence.push(`${x.label}: el README no advierte el carácter diagnóstico`);
    }
    if (c.evidence.length) { c.status = 'fail'; c.detail = c.evidence[0]; }
  });
  C('V13', 'La estructura declarada de los CSV coincide con el esquema del diccionario (cabeceras y orden)', (c) => {
    for (const x of dataPkgs) for (const [name, t] of Object.entries(TABLES)) { const f = x.manifest.files.find((q) => q.path === t.file); if (!f) continue; const head = utf8.decode(bufOf(x, f.path)).split('\r\n')[0]; const exp = t.cols.map((q) => q.name).join(','); if (head !== exp) c.evidence.push(`${x.label}: ${t.file}: cabecera distinta del esquema (${name})`); }
    if (c.evidence.length) { c.status = 'fail'; c.detail = c.evidence[0]; }
  });
  void STREAMS; void num;
  return { ok: problems.length === 0, checks, problems, version: CHECK_VERSION };
}

export function verifyTarget(target) {
  const providers = openTarget(target);
  try { const r = verifySet(providers); return { ...r, target }; } finally { for (const p of providers) p.close?.(); closeZips(); }
}
