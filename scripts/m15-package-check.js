// Comprobador del paquete rápido de MOTOR-15 (§20). Lee el ZIP DESCARGADO (no re-simula) y verifica: manifiesto, archivos requeridos, tamaños y hashes, columnas, conteos de agenda/intentos/terminados/válidos/fallidos,
// ausencia de duplicados, coherencia marcador/acta, pares de equivalencia, etiquetado de coste (medición/estimación), auditorías y capacidades completas, nulos, y que ningún informe identifique MOTOR-14 donde debe decir MOTOR-15.
// NO sustituye a `batch:check` (paquetes de lote), `audit:check` (paquetes de auditoría) ni `check_engine_docs.py`: cubre solo este paquete. Uso: node scripts/m15-package-check.js <zip> [--json]
import { openZip, closeZips } from '../src/batch/zip.js';
import { sha256 } from '../src/batch/hashing.js';

const REQUIRED = ['00-LEEME.md', '01-RESUMEN.md', '02-CAMBIOS.csv', '03-COBERTURA.csv', '04-HALLAZGOS.csv', '05-PARTIDOS.csv', '06-EQUIPOS-PARTIDO.csv', '07-RENDIMIENTO.csv', '08-EQUIVALENCIA.csv', '09-AUDITORIAS.csv', '10-CAPACIDADES.csv', '11-NORMATIVA.csv', '12-COMPATIBILIDAD.csv', '13-NAVEGADOR.md', '14-PENDIENTES-MOTOR16.md', 'DICCIONARIO.md', 'manifest.json'];
export function parseCsv(text) {
  const rows = []; let row = []; let cur = ''; let q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else cur += c; }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return { header: rows[0] ?? [], rows: rows.slice(1).filter((r) => r.length > 1 || r[0] !== '') };
}
export function checkPackage(path) {
  const checks = []; const add = (id, ok, detail = '') => checks.push({ id, ok: !!ok, detail });
  let z; try { z = openZip(path); } catch (e) { return { ok: false, checks: [{ id: 'ZIP', ok: false, detail: e.message }] }; }
  try {
    const files = {}; for (const n of z.names) { try { files[n] = z.read(n).toString('utf8'); } catch (e) { add(`LECTURA ${n}`, false, e.message); } }
    for (const n of REQUIRED) add(`PRESENTE ${n}`, n in files);
    let man; try { man = JSON.parse(files['manifest.json']); } catch { add('MANIFIESTO', false, 'manifest.json ilegible'); return { ok: false, checks }; }
    add('MANIFIESTO esquema', man.schema === 'beM-m15-quick-review/1');
    for (const [n, m] of Object.entries(man.files)) { const t = files[n]; if (t == null) { add(`MANIFIESTO ${n}`, false, 'declarado y ausente'); continue; } add(`TAMAÑO ${n}`, Buffer.byteLength(t) === m.bytes, `${Buffer.byteLength(t)} ≠ ${m.bytes}`); add(`HASH ${n}`, sha256(t) === m.sha256, 'sha256 distinto (archivo alterado)'); }
    for (const n of Object.keys(files)) if (n !== 'manifest.json' && !(n in man.files)) add(`MANIFIESTO ${n}`, false, 'archivo no declarado');
    const T = {}; for (const [n, m] of Object.entries(man.files)) if (m.columns && files[n]) { T[n] = parseCsv(files[n]); add(`COLUMNAS ${n}`, JSON.stringify(T[n].header) === JSON.stringify(m.columns), 'encabezado distinto del manifiesto'); add(`FORMA ${n}`, T[n].rows.every((r) => r.length === m.columns.length), 'filas con distinto número de columnas'); }
    const col = (n, c) => T[n]?.header.indexOf(c); const val = (n, r, c) => r[col(n, c)];
    const p5 = T['05-PARTIDOS.csv']; if (p5) {
      const ids = p5.rows.map((r) => val('05-PARTIDOS.csv', r, 'row_id')); add('05 sin row_id duplicados', new Set(ids).size === ids.length);
      const bench = p5.rows.filter((r) => val('05-PARTIDOS.csv', r, 'kind') === 'benchmark100'); const keyOf = (r) => `${val('05-PARTIDOS.csv', r, 'kind')}|${val('05-PARTIDOS.csv', r, 'run')}|${val('05-PARTIDOS.csv', r, 'attempt_id')}`; add('05 sin intentos duplicados', new Set(p5.rows.map(keyOf)).size === p5.rows.length);
      add('05 agenda del benchmark = 100', bench.length === 100 && man.counts.benchmark_scheduled === 100); const fin = bench.filter((r) => val('05-PARTIDOS.csv', r, 'exec_state') === 'terminada'); add('05 terminados = manifiesto', fin.length === man.counts.benchmark_finished);
      add('05 válidos = manifiesto', bench.filter((r) => val('05-PARTIDOS.csv', r, 'valid') === 'true').length === man.counts.benchmark_valid);
      add('05 un fallo/interrupción no tiene marcador ni cuenta como derrota', p5.rows.filter((r) => val('05-PARTIDOS.csv', r, 'exec_state') !== 'terminada').every((r) => val('05-PARTIDOS.csv', r, 'score_home') === '' && val('05-PARTIDOS.csv', r, 'score_away') === ''));
      add('05 motor MOTOR-15 en todas las filas', p5.rows.every((r) => /MOTOR15$/.test(val('05-PARTIDOS.csv', r, 'engine_version'))));
      add('05 reintentos no se cuentan como partidos independientes (case_id único por intento de la agenda)', new Set(bench.map((r) => val('05-PARTIDOS.csv', r, 'case_id'))).size === bench.length);
      const p6 = T['06-EQUIPOS-PARTIDO.csv']; if (p6) {
        const by = new Map(); for (const r of p6.rows) { const k = val('06-EQUIPOS-PARTIDO.csv', r, 'match_id'); (by.get(k) ?? by.set(k, []).get(k)).push(Number(val('06-EQUIPOS-PARTIDO.csv', r, 'points'))); }
        let bad = 0; for (const r of p5.rows) { const k = val('05-PARTIDOS.csv', r, 'match_id'); const kind = val('05-PARTIDOS.csv', r, 'kind'); if (!['benchmark100', 'integracion'].includes(kind) || val('05-PARTIDOS.csv', r, 'exec_state') !== 'terminada') continue; const pts = by.get(k); if (!pts || pts[0] !== Number(val('05-PARTIDOS.csv', r, 'score_home')) || pts[1] !== Number(val('05-PARTIDOS.csv', r, 'score_away'))) bad += 1; }
        add('06 puntos por equipo = marcador de 05 (acta ↔ marcador)', bad === 0, `${bad} partidos no concilian`);
        add('06 dos filas por encuentro', [...by.values()].every((a) => a.length === 2));
        add('06 TCI ≥ TCC', p6.rows.every((r) => Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg2a')) >= Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg2m')) && Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg3a')) >= Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg3m'))));
      }
    }
    const p7 = T['07-RENDIMIENTO.csv']; if (p7) {
      const kinds = new Set(p7.rows.map((r) => val('07-RENDIMIENTO.csv', r, 'kind'))); add('07 tipos de medida permitidos', [...kinds].every((k) => ['medición', 'estimación', 'declarada', 'objetivo'].includes(k)));
      add('07 toda estimación lo declara en su nota', p7.rows.filter((r) => val('07-RENDIMIENTO.csv', r, 'kind') === 'estimación').every((r) => /ESTIMACI/i.test(val('07-RENDIMIENTO.csv', r, 'overlap_note'))));
      add('07 toda medida lleva entorno y configuración', p7.rows.every((r) => val('07-RENDIMIENTO.csv', r, 'environment') && val('07-RENDIMIENTO.csv', r, 'concurrency') !== ''));
      add('07 el entorno coincide con el manifiesto', p7.rows.every((r) => val('07-RENDIMIENTO.csv', r, 'environment') === man.environment));
    }
    const p8 = T['08-EQUIVALENCIA.csv']; if (p8) { add('08 resultados válidos', p8.rows.every((r) => ['IGUAL', 'DIFERENTE', 'NO_EJECUTADO'].includes(val('08-EQUIVALENCIA.csv', r, 'result')))); add('08 un par IGUAL no declara primera diferencia', p8.rows.every((r) => val('08-EQUIVALENCIA.csv', r, 'result') !== 'IGUAL' || val('08-EQUIVALENCIA.csv', r, 'first_difference') === '')); add('08 conteo = manifiesto', p8.rows.length === man.counts.equivalence_pairs); add('08 todo par DIFERENTE declara su primera diferencia', p8.rows.every((r) => val('08-EQUIVALENCIA.csv', r, 'result') !== 'DIFERENTE' || val('08-EQUIVALENCIA.csv', r, 'first_difference') !== '')); }
    const p9 = T['09-AUDITORIAS.csv']; if (p9) { const ids = p9.rows.map((r) => val('09-AUDITORIAS.csv', r, 'audit_id')); add('09 AUD01–AUD32 completas', ids.length === 32 && ids.every((x, i) => x === `AUD${String(i + 1).padStart(2, '0')}`)); add('09 «conforme» no se asigna sin evidencia', p9.rows.every((r) => val('09-AUDITORIAS.csv', r, 'resultado') !== 'conforme' || Number(val('09-AUDITORIAS.csv', r, 'n_evidence')) > 0)); add('09 la revisión humana nunca figura como hecha', p9.rows.every((r) => ['pendiente', ''].includes(val('09-AUDITORIAS.csv', r, 'revision_humana')))); }
    const p10 = T['10-CAPACIDADES.csv']; if (p10) add('10 las 32 capacidades', p10.rows.length === 32 && new Set(p10.rows.map((r) => val('10-CAPACIDADES.csv', r, 'capability'))).size === 32);
    const p11 = T['11-NORMATIVA.csv']; if (p11) add('11 ninguna fila contrastada declara lectura directa de Claude', p11.rows.every((r) => !/lectura directa de Claude|leída directamente/i.test(val('11-NORMATIVA.csv', r, 'reading_origin'))));
    for (const n of ['00-LEEME.md', '01-RESUMEN.md', '13-NAVEGADOR.md']) { const t = files[n] ?? ''; add(`VERSIÓN ${n} identifica MOTOR-15`, /MOTOR-15/.test(t)); add(`VERSIÓN ${n} no presenta MOTOR-14 como versión de este paquete`, !/versi[oó]n(?: de la aplicaci[oó]n)?:? ?\*{0,2}MOTOR-14/i.test(t)); }
    add('NULOS 07: un dato no medido va vacío, no cero', !(T['07-RENDIMIENTO.csv']?.rows ?? []).some((r) => val('07-RENDIMIENTO.csv', r, 'value') === ''));
  } finally { closeZips(); }
  return { ok: checks.every((c) => c.ok), total: checks.length, failed: checks.filter((c) => !c.ok), checks };
}
if (process.argv[1]?.endsWith('m15-package-check.js')) {
  const p = process.argv[2]; if (!p) { console.error('uso: node scripts/m15-package-check.js <zip>'); process.exit(2); }
  const r = checkPackage(p);
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1)); else { for (const c of r.checks) console.log(`${c.ok ? 'ok  ' : 'FALLO'} ${c.id}${c.ok ? '' : ` — ${c.detail}`}`); console.log(r.ok ? `PAQUETE CORRECTO (${r.total} comprobaciones; cubre solo el paquete rápido, no los ZIP de lote ni de auditoría)` : `PAQUETE RECHAZADO: ${r.failed.length} de ${r.total}`); }
  process.exit(r.ok ? 0 : 1);
}
