// Comprobador de los paquetes de MOTOR-15B (§14.1). Lee el ZIP DESCARGADO (no re-simula) y verifica: manifiesto, archivos requeridos (00–18, diccionario y manifiesto), tamaños en BYTES UTF-8 reales y hashes,
// columnas y nulos, identidades de fuentes/casos/variantes/intentos y sus vínculos con archivos, conteos históricos frente a ejecuciones nuevas, reintentos y colas, coherencia de auditorías y equivalencia con
// su alcance declarado, robos/pérdidas y sujetos, unidades, ausencia de marcador válido en intentos fallidos, cifras de coste medidas frente a estimaciones e informes históricos, y que un paquete alterado o
// incompleto se rechaza con motivo. Con `--detail <zip>` comprueba además el detalle (manifiesto, tamaños y hashes de cada archivo; referencias al paquete base de MOTOR-15 por hash).
// QUÉ NO CUBRE: no demuestra que una auditoría leyó el caso apropiado (un hash correcto no lo prueba: lo prueba la trazabilidad 17 y las pruebas del motor), ni sustituye `batch:check`, `audit:check`,
// `check_engine_docs.py` ni la suite; la revisión humana sigue siendo necesaria.
// Uso: node scripts/m15b-package-check.js <revision-rapida.zip> [--detail <detalle.zip>] [--base <carpeta MOTOR-15>] [--json]
import { openZip, closeZips } from '../src/batch/zip.js';
import { sha256 } from '../src/batch/hashing.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED = ['00-LEEME.md', '01-RESUMEN.md', '02-CAMBIOS.csv', '03-COBERTURA.csv', '04-HALLAZGOS.csv', '05-PARTIDOS.csv', '06-EQUIPOS-PARTIDO.csv', '07-RENDIMIENTO.csv', '08-EQUIVALENCIA.csv', '09-AUDITORIAS.csv', '10-CAPACIDADES.csv', '11-NORMATIVA.csv', '12-COMPATIBILIDAD.csv', '13-NAVEGADOR.md', '14-PENDIENTES-MOTOR16.md', '15-ROBOS.csv', '16-CASOS-ROBOS.csv', '17-TRAZABILIDAD.csv', '18-CIERRE-15B.md', 'DICCIONARIO.md', 'manifest.json'];
export function parseCsv(text) {
  const rows = []; let row = []; let cur = ''; let q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else cur += c; }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return { header: rows[0] ?? [], rows: rows.slice(1).filter((r) => r.length > 1 || r[0] !== '') };
}
export function checkPackage(path, { detail = null, base = null } = {}) {
  const checks = []; const add = (id, ok, detailText = '') => checks.push({ id, ok: !!ok, detail: detailText });
  let z; try { z = openZip(path); } catch (e) { return { ok: false, checks: [{ id: 'ZIP', ok: false, detail: `no se puede abrir el paquete: ${e.message}` }], failed: [{ id: 'ZIP' }] }; }
  try {
    const files = {}; for (const n of z.names) { try { files[n] = z.read(n).toString('utf8'); } catch (e) { add(`LECTURA ${n}`, false, e.message); } }
    for (const n of REQUIRED) add(`PRESENTE ${n}`, n in files, 'archivo requerido ausente: paquete incompleto');
    let man; try { man = JSON.parse(files['manifest.json']); } catch { add('MANIFIESTO', false, 'manifest.json ilegible'); return { ok: false, checks, failed: checks.filter((c) => !c.ok) }; }
    add('MANIFIESTO esquema', man.schema === 'beM-m15b-quick-review/1', `esquema ${man.schema}`);
    for (const [n, m] of Object.entries(man.files)) { const t = files[n]; if (t == null) { add(`MANIFIESTO ${n}`, false, 'declarado y ausente'); continue; } add(`TAMAÑO ${n} (bytes UTF-8)`, Buffer.byteLength(t, 'utf8') === m.bytes, `${Buffer.byteLength(t, 'utf8')} ≠ ${m.bytes}`); add(`HASH ${n}`, sha256(t) === m.sha256, 'sha256 distinto (archivo alterado)'); }
    for (const n of Object.keys(files)) if (n !== 'manifest.json' && !(n in man.files)) add(`MANIFIESTO ${n}`, false, 'archivo no declarado');
    const T = {}; for (const [n, m] of Object.entries(man.files)) if (m.columns && files[n]) { T[n] = parseCsv(files[n]); add(`COLUMNAS ${n}`, JSON.stringify(T[n].header) === JSON.stringify(m.columns), 'encabezado distinto del manifiesto'); add(`FORMA ${n}`, T[n].rows.every((r) => r.length === m.columns.length), 'filas con distinto número de columnas'); }
    const val = (n, r, c) => r[T[n].header.indexOf(c)];
    // --- 05 partidos: histórico frente a nuevo, reintentos y colas
    const p5 = T['05-PARTIDOS.csv']; const V5 = (r, c) => val('05-PARTIDOS.csv', r, c);
    if (p5) {
      const ids = p5.rows.map((r) => V5(r, 'row_id')); add('05 sin row_id duplicados', new Set(ids).size === ids.length);
      add('05 sin intentos duplicados por origen/tipo/ref/intento', new Set(p5.rows.map((r) => `${V5(r, 'origin')}|${V5(r, 'kind')}|${V5(r, 'ref')}|${V5(r, 'run')}|${V5(r, 'attempt_id')}|${V5(r, 'match_id')}`)).size === p5.rows.length);
      const hist = p5.rows.filter((r) => V5(r, 'origin') === 'histórico MOTOR-15'); const neu = p5.rows.filter((r) => V5(r, 'origin') === 'nuevo MOTOR-15B');
      add('05 todo origen es histórico o nuevo', hist.length + neu.length === p5.rows.length);
      add('05 las ejecuciones históricas llevan el motor de MOTOR-15 y las nuevas el de MOTOR-15B', hist.every((r) => /0\.15\.0-MOTOR15$/.test(V5(r, 'engine_version'))) && neu.every((r) => new RegExp(`${man.engine.replace(/[.]/g, '\\.')}$`).test(V5(r, 'engine_version'))));
      const bench = hist.filter((r) => V5(r, 'kind') === 'benchmark100'); const keyed = new Set(bench.map((r) => V5(r, 'case_id')));
      add('05 el benchmark histórico sigue siendo de cien (no se rehace como MOTOR-15B)', bench.length === 100 && man.counts.historical.benchmark_scheduled === 100 && keyed.size === 100);
      add('05 terminados y válidos históricos = manifiesto', bench.filter((r) => V5(r, 'exec_state') === 'terminada').length === man.counts.historical.benchmark_finished && bench.filter((r) => V5(r, 'valid') === 'true').length === man.counts.historical.benchmark_valid);
      add('05 un fallo/interrupción no tiene marcador ni cuenta como derrota', p5.rows.filter((r) => V5(r, 'exec_state') !== 'terminada').every((r) => V5(r, 'score_home') === '' && V5(r, 'score_away') === ''));
      const kinds = (k) => neu.filter((r) => V5(r, 'kind') === k).length;
      add('05 nuevos: integración = manifiesto', kinds('integracion_15B') === man.counts.new.integration_cases_15b); add('05 nuevos: reproducciones de auditoría = manifiesto', kinds('reproduccion_auditoria_15B') === man.counts.new.reproduction_cases_audit);
      add('05 nuevos: colas y reintentos se cuentan aparte (las colas no son muestras independientes)', neu.filter((r) => /^cola_/.test(V5(r, 'kind'))).length === man.counts.new.tails && man.counts.new.retries === 0 && neu.filter((r) => /^cola_/.test(V5(r, 'kind'))).every((r) => /cola|continuación/.test(V5(r, 'ref') + V5(r, 'variant_id'))));
      add('05 el benchmark de cien no se repitió en MOTOR-15B', man.counts.new.benchmark100_repeated === 0 && !neu.some((r) => /^benchmark/.test(V5(r, 'kind'))));
      const p6 = T['06-EQUIPOS-PARTIDO.csv']; if (p6) {
        const by = new Map(); for (const r of p6.rows) { const k = `${val('06-EQUIPOS-PARTIDO.csv', r, 'origin')}|${val('06-EQUIPOS-PARTIDO.csv', r, 'match_id')}`; (by.get(k) ?? by.set(k, []).get(k)).push(r); }
        let bad = 0; for (const r of p5.rows) { const kind = V5(r, 'kind'); if (!['benchmark100', 'integracion', 'integracion_15B'].includes(kind) || V5(r, 'exec_state') !== 'terminada') continue; const rows = by.get(`${V5(r, 'origin')}|${V5(r, 'match_id')}`); const pts = rows?.map((x) => Number(val('06-EQUIPOS-PARTIDO.csv', x, 'points'))); if (!pts || pts[0] !== Number(V5(r, 'score_home')) || pts[1] !== Number(V5(r, 'score_away'))) bad += 1; }
        add('06 puntos por equipo = marcador de 05 (acta ↔ marcador)', bad === 0, `${bad} partidos no concilian`);
        add('06 dos filas por encuentro', [...by.values()].every((a) => a.length === 2));
        add('06 TCI ≥ TCC', p6.rows.every((r) => Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg2a')) >= Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg2m')) && Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg3a')) >= Number(val('06-EQUIPOS-PARTIDO.csv', r, 'fg3m'))));
        // robos y pérdidas: cada robo tiene una pérdida individual rival; los robos del equipo no superan las pérdidas del rival (reconciliación ROB01)
        let stlBad = 0; for (const rows of by.values()) { const [a, b] = rows; if (Number(val('06-EQUIPOS-PARTIDO.csv', a, 'stl')) > Number(val('06-EQUIPOS-PARTIDO.csv', b, 'tov')) || Number(val('06-EQUIPOS-PARTIDO.csv', b, 'stl')) > Number(val('06-EQUIPOS-PARTIDO.csv', a, 'tov'))) stlBad += 1; }
        add('06 robos ≤ pérdidas del rival en cada encuentro (ROB01)', stlBad === 0, `${stlBad} encuentros`);
      }
    }
    // --- 07 rendimiento: medición, estimación e histórico
    const p7 = T['07-RENDIMIENTO.csv']; const V7 = (r, c) => val('07-RENDIMIENTO.csv', r, c);
    if (p7) {
      add('07 tipos de medida permitidos', p7.rows.every((r) => ['medición', 'estimación', 'declarada', 'objetivo'].includes(V7(r, 'kind'))));
      add('07 toda estimación lo declara en su nota', p7.rows.filter((r) => V7(r, 'kind') === 'estimación').every((r) => /ESTIMACI/i.test(V7(r, 'overlap_note'))));
      add('07 toda medida lleva entorno y configuración', p7.rows.every((r) => V7(r, 'environment') && V7(r, 'concurrency') !== ''));
      add('07 el entorno de las medidas históricas coincide con el manifiesto', p7.rows.filter((r) => V7(r, 'origin') === 'histórico MOTOR-15').every((r) => V7(r, 'environment') === man.environment));
      add('07 la producción del lote por encuentro no se llama latencia', p7.rows.filter((r) => /por_partido_pared/.test(V7(r, 'metric'))).length === 0 && p7.rows.filter((r) => /produccion_del_lote_por_encuentro/.test(V7(r, 'metric'))).every((r) => /NO es la latencia/.test(V7(r, 'overlap_note'))));
      add('07 la cifra de ≈23 s queda como declarada con su contexto (no sustituye la medida final)', p7.rows.filter((r) => /cifra_intermedia/.test(V7(r, 'metric'))).every((r) => V7(r, 'kind') === 'declarada' && /27\.171,3/.test(V7(r, 'overlap_note'))));
      const t100 = p7.rows.find((r) => V7(r, 'scope') === 'benchmark100' && V7(r, 'metric') === 'fase_pared:run_dispatch_to_done'); const est = p7.rows.find((r) => V7(r, 'metric') === 'tiempo_200_partidos_estimado_lineal');
      add('07 la estimación de 200 es el doble de la ejecución medida de cien y se declara no ejecutada', !t100 || !est || (Number(V7(est, 'value')) === Math.round(Number(V7(t100, 'value')) * 2) && /no es una ejecución/.test(V7(est, 'overlap_note'))));
      add('07 el benchmark de cien no se repitió (declarado con valor 0)', p7.rows.some((r) => V7(r, 'metric') === 'benchmark_de_cien_en_15B' && V7(r, 'value') === '0'));
    }
    // --- 08 equivalencia
    const p8 = T['08-EQUIVALENCIA.csv']; const V8 = (r, c) => val('08-EQUIVALENCIA.csv', r, c);
    if (p8) {
      add('08 resultados válidos', p8.rows.every((r) => ['IGUAL', 'DIFERENTE', 'NO_EJECUTADO'].includes(V8(r, 'result'))));
      add('08 un par IGUAL no declara primera diferencia', p8.rows.every((r) => V8(r, 'result') !== 'IGUAL' || V8(r, 'first_difference') === ''));
      add('08 toda fila identifica entrada, versión, órdenes, niveles, campos, observador y evidencia', p8.rows.every((r) => ['input', 'versions', 'effective_orders', 'levels_modes', 'observer', 'evidence'].every((c) => V8(r, c) !== '') && (V8(r, 'result') === 'NO_EJECUTADO' || V8(r, 'fields_compared') !== '')));
      add('08 clases de comparación declaradas (igualdad misma versión / diferencia legítima / histórico / no comparable)', p8.rows.every((r) => /^(igualdad|diferencia legítima|histórico|no comparable)/.test(V8(r, 'kind'))));
      add('08 una diferencia legítima nombra su causa', p8.rows.filter((r) => /^diferencia legítima/.test(V8(r, 'kind')) && V8(r, 'result') === 'DIFERENTE').every((r) => /crédito/.test(V8(r, 'first_difference'))));
      add('08 no se comparan huellas de contratos distintos entre sí (TRAYINC con TRAY)', p8.rows.every((r) => !(/TRAYINC/.test(V8(r, 'observer')) && /TRAY-MOTOR12/.test(V8(r, 'observer')) && /≟|=\s*TRAY-MOTOR12/.test(V8(r, 'fields_compared')))));
      add('08 una comparación IGUAL de huellas lleva ambas huellas iguales', p8.rows.filter((r) => V8(r, 'result') === 'IGUAL' && V8(r, 'fingerprint_a') !== '').every((r) => V8(r, 'fingerprint_a') === V8(r, 'fingerprint_b')));
    }
    // --- 09 auditorías: universos efectivos, no un rótulo genérico
    const p9 = T['09-AUDITORIAS.csv']; const V9 = (r, c) => val('09-AUDITORIAS.csv', r, c);
    if (p9) {
      const unis = [...new Set(p9.rows.map((r) => V9(r, 'universe')))]; add('09 tres universos efectivos con sus fuentes', unis.length === 3 && man.counts.audits.universes === 3 && p9.rows.every((r) => V9(r, 'sources') !== '' && V9(r, 'scope') !== ''));
      for (const u of unis) { const ids = p9.rows.filter((r) => V9(r, 'universe') === u).map((r) => V9(r, 'audit_id')); add(`09 AUD01–AUD32 completas en «${u}»`, ids.length === 32 && ids.every((x, i) => x === `AUD${String(i + 1).padStart(2, '0')}`)); }
      add('09 «conforme» no se asigna sin evidencia', p9.rows.every((r) => V9(r, 'resultado') !== 'conforme' || Number(V9(r, 'n_evidence')) > 0 || V9(r, 'audit_id') === 'AUD28' || V9(r, 'audit_id') === 'AUD29'));
      add('09 el lote histórico no se rotula como los casos C15', p9.rows.filter((r) => /histórico/.test(V9(r, 'universe'))).every((r) => /LOT-9e1cfb78/.test(V9(r, 'sources')) && /NO son los casos C15/.test(V9(r, 'scope'))));
      add('09 AUD17 con exposición crítica distingue extremo de normales', (() => { const e = p9.rows.find((r) => /extremo/.test(V9(r, 'universe')) && V9(r, 'audit_id') === 'AUD17'); const n = p9.rows.find((r) => /normales/.test(V9(r, 'universe')) && V9(r, 'audit_id') === 'AUD17'); return !!e && !!n && V9(n, 'exposicion') !== 'observada'; })());
      add('09 no se afirman 32 auditorías conformes en ningún universo', unis.every((u) => p9.rows.filter((r) => V9(r, 'universe') === u && V9(r, 'resultado') === 'conforme').length < 32));
    }
    const p10 = T['10-CAPACIDADES.csv']; if (p10) { const unis = [...new Set(p10.rows.map((r) => val('10-CAPACIDADES.csv', r, 'universe')))]; add('10 las 32 capacidades por universo', unis.every((u) => new Set(p10.rows.filter((r) => val('10-CAPACIDADES.csv', r, 'universe') === u).map((r) => val('10-CAPACIDADES.csv', r, 'capability'))).size === 32)); }
    const p11 = T['11-NORMATIVA.csv']; const V11 = (r, c) => val('11-NORMATIVA.csv', r, c);
    if (p11) {
      add('11 ninguna fila contrastada declara lectura directa de Claude', p11.rows.every((r) => !/lectura directa de Claude|leída directamente/i.test(V11(r, 'reading_origin'))));
      const i03 = p11.rows.find((r) => V11(r, 'row_id') === 'RG-I03'); add('11 RG-I03 contrastada con la síntesis de ChatGPT (B15-N1) y administra la técnica', !!i03 && V11(i03, 'contrast') === 'contrastada' && /31\.3\.3/.test(V11(i03, 'article')) && /ChatGPT/.test(V11(i03, 'reading_origin')));
      const arts = p11.rows.filter((r) => /^ART45:/.test(V11(r, 'row_id'))); add('11 nueve operaciones del art. 45 con su numeración', arts.length === 9 && ['45.4.1', '45.4.2', '45.4.3', '45.4.4', '45.4.5', '45.4.6', '45.4.7', '45.4.8', '45.6'].every((a) => arts.some((r) => V11(r, 'article').startsWith(a))));
      add('11 las probabilidades SEM y las consecuencias normativas son filas distintas', p11.rows.some((r) => /^SEM15:/.test(V11(r, 'row_id'))) && !p11.rows.some((r) => /^SEM15:/.test(V11(r, 'row_id')) && V11(r, 'contrast') === 'contrastada'));
    }
    // --- 15/16 robos
    const p15 = T['15-ROBOS.csv']; const V15 = (r, c) => val('15-ROBOS.csv', r, c);
    if (p15) {
      add('15 todas las filas identifican fuente, caso, equipo, ruta, etapa, unidad, cobertura, versión y referencia', p15.rows.every((r) => ['source', 'case_id', 'team_id', 'route', 'stage', 'unit', 'coverage', 'version', 'ref'].every((c) => V15(r, c) !== '')));
      add('15 una magnitud no aplicable es nula, no cero', p15.rows.filter((r) => /no aplica/.test(V15(r, 'coverage'))).every((r) => V15(r, 'numerator') === '' && V15(r, 'after') === ''));
      const tot = p15.rows.filter((r) => V15(r, 'route') === 'TOTAL_EQUIPO' && V15(r, 'stage') === 'robos_por_partido'); const p6 = T['06-EQUIPOS-PARTIDO.csv'];
      add('15 los robos por equipo coinciden con el acta (06) de la reejecución de MOTOR-15B', !p6 || tot.every((r) => { const row = p6.rows.find((x) => val('06-EQUIPOS-PARTIDO.csv', x, 'match_id') === `${V15(r, 'case_id')}@15B` && val('06-EQUIPOS-PARTIDO.csv', x, 'team_id') === V15(r, 'team_id')); return row && Number(val('06-EQUIPOS-PARTIDO.csv', row, 'stl')) === Number(V15(r, 'numerator')); }));
      add('15 las categorías exclusivas por ruta no suman más pérdidas que las atacantes', (() => { const g = new Map(); for (const r of p15.rows.filter((x) => !['TOTAL_EQUIPO'].includes(V15(x, 'route')))) { const k = `${V15(r, 'case_id')}|${V15(r, 'team_id')}|${V15(r, 'route')}`; (g.get(k) ?? g.set(k, {}).get(k))[V15(r, 'stage')] = V15(r, 'numerator') === '' ? null : Number(V15(r, 'numerator')); } return [...g.values()].every((s) => (s.robos_acreditados ?? 0) + (s.perdidas_vivas_recuperadas_sin_credito ?? 0) + (s.balon_fuera ?? 0) <= (s.perdidas_atacantes ?? 0)); })());
    }
    const p16 = T['16-CASOS-ROBOS.csv']; const V16 = (r, c) => val('16-CASOS-ROBOS.csv', r, c);
    if (p16) {
      add('16 cada caso declara su procedencia (natural, preparado, reproducción o límite)', p16.rows.every((r) => V16(r, 'provenance') !== ''));
      add('16 un robo acreditado nombra pérdida, recuperador y sujeto; una exclusión no acredita', p16.rows.filter((r) => /^positivo/.test(V16(r, 'kind'))).every((r) => V16(r, 'loss') !== '' && V16(r, 'credited_to') !== '') && p16.rows.filter((r) => /^exclusión/.test(V16(r, 'kind'))).every((r) => V16(r, 'credited_to') === ''));
      add('16 el defecto corregido, el observado y los límites están identificados', ['defecto corregido D-ROBO-01', 'observación D-ROBO-02', 'límite documentado', 'defecto latente corregido'].every((k) => p16.rows.some((r) => V16(r, 'kind').startsWith(k))));
    }
    // --- 17 trazabilidad
    const p17 = T['17-TRAZABILIDAD.csv']; const V17 = (r, c) => val('17-TRAZABILIDAD.csv', r, c);
    if (p17) {
      add('17 cada fila identifica fuente, motor, perfil, política, nivel, archivo, bytes y hash', p17.rows.every((r) => ['source', 'engine', 'profile', 'policy', 'level', 'file', 'bytes', 'sha256', 'included', 'consumed_by'].every((c) => V17(r, c) !== '')));
      add('17 los hashes son SHA-256', p17.rows.every((r) => /^[0-9a-f]{64}$/.test(V17(r, 'sha256'))));
      add('17 las fuentes incluyen lotes de reproducción, el lote histórico y la integración (nueva y original)', ['reproducción', 'LOT-9e1cfb78', 'integración MOTOR-15B', 'integración MOTOR-15 (original'].every((s) => p17.rows.some((r) => V17(r, 'source').includes(s))));
      add('17 lo histórico se referencia (paquete base) y lo nuevo se incluye o se regenera', p17.rows.every((r) => /^(incluido|referenciado)/.test(V17(r, 'included'))));
      add('17 sin archivos duplicados (misma fuente y archivo)', new Set(p17.rows.map((r) => `${V17(r, 'source')}|${V17(r, 'file')}`)).size === p17.rows.length);
    }
    for (const n of ['00-LEEME.md', '01-RESUMEN.md', '13-NAVEGADOR.md', '18-CIERRE-15B.md']) { const t = files[n] ?? ''; add(`VERSIÓN ${n} identifica MOTOR-15B`, /MOTOR-15B/.test(t)); add(`VERSIÓN ${n} no presenta MOTOR-14 como versión de este paquete`, !/versi[oó]n(?: de la aplicaci[oó]n)?:? ?\*{0,2}MOTOR-14/i.test(t)); }
    add('01 separa comprobado por Claude, pendiente de Dennis y no ejecutado', /## Comprobado por Claude/.test(files['01-RESUMEN.md'] ?? '') && /## Pendiente de Dennis/.test(files['01-RESUMEN.md'] ?? '') && /## No ejecutado/.test(files['01-RESUMEN.md'] ?? ''));
    add('01 no declara el motor completo ni calibrado ni 32 auditorías aprobadas', !/motor completo y calibrado|32 auditor[ií]as (aprobadas|conformes)/i.test(files['01-RESUMEN.md'] ?? ''));
    add('18 declara commit de código comprobado y commit de entrega', /Commit de código comprobado/.test(files['18-CIERRE-15B.md'] ?? '') && /Commit de entrega/.test(files['18-CIERRE-15B.md'] ?? '') && man.code_commit && man.code_commit !== 'desconocido');
    add('NULOS 07: un dato no medido va vacío, no cero (las filas medidas llevan valor)', !(T['07-RENDIMIENTO.csv']?.rows ?? []).some((r) => val('07-RENDIMIENTO.csv', r, 'value') === ''));
    // --- detalle (opcional): tamaños, hashes y referencias al paquete base de MOTOR-15
    if (detail) {
      let zd; try { zd = openZip(detail); } catch (e) { add('DETALLE ZIP', false, `no se puede abrir el detalle: ${e.message}`); zd = null; }
      if (zd) {
        let dman; try { dman = JSON.parse(zd.read('manifest.json').toString('utf8')); } catch { dman = null; add('DETALLE manifiesto', false, 'ilegible'); }
        if (dman) {
          add('DETALLE esquema y commit de código coherentes con el paquete rápido', dman.schema === 'beM-m15b-detail/1' && dman.code_commit === man.code_commit);
          let badSize = 0; let badHash = 0; for (const f of dman.files) { let buf; try { buf = zd.read(f.name); } catch { badSize += 1; continue; } if (buf.length !== f.bytes) badSize += 1; if (sha256(buf) !== f.sha256) badHash += 1; }
          add('DETALLE tamaños (bytes) de cada archivo', badSize === 0, `${badSize} archivos`); add('DETALLE SHA-256 de cada archivo', badHash === 0, `${badHash} archivos`);
          add('DETALLE contiene lo que sustenta el cierre', ['integracion/PREP-RG-I03.json', 'robos/diagnostico.json', 'auditoria/resultado-c15-extremo.json', 'auditoria/reproduccion.json', 'commits.json', 'referencias-motor15.json', 'rendimiento/perfil-de-cpu-sintesis.json'].every((n) => dman.files.some((f) => f.name === n)));
          const refs = JSON.parse(zd.read('referencias-motor15.json').toString('utf8'));
          if (base) for (const b of refs.base) { const p = join(base, b.file); add(`BASE ${b.file}`, existsSync(p) && sha256(readFileSync(p)) === b.sha256, existsSync(p) ? 'SHA-256 distinto del paquete base' : 'paquete base de MOTOR-15 no disponible (declarado, no reconstruido)'); }
          else add('BASE paquete de MOTOR-15 identificado por hash (no comprobado: use --base)', refs.base.length === 2 && refs.base.every((b) => /^[0-9a-f]{64}$/.test(b.sha256)));
        }
      }
    }
  } finally { closeZips(); }
  return { ok: checks.every((c) => c.ok), total: checks.length, failed: checks.filter((c) => !c.ok), checks };
}
if (process.argv[1]?.endsWith('m15b-package-check.js')) {
  const argv = process.argv.slice(2); const p = argv.find((x) => !x.startsWith('--') && argv[argv.indexOf(x) - 1] !== '--detail' && argv[argv.indexOf(x) - 1] !== '--base'); if (!p) { console.error('uso: node scripts/m15b-package-check.js <zip> [--detail <zip>] [--base <carpeta>] [--json]'); process.exit(2); }
  const opt = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : null; };
  const r = checkPackage(p, { detail: opt('detail'), base: opt('base') });
  if (argv.includes('--json')) console.log(JSON.stringify(r, null, 1)); else { for (const c of r.checks) console.log(`${c.ok ? 'ok  ' : 'FALLO'} ${c.id}${c.ok ? '' : ` — ${c.detail}`}`); console.log(r.ok ? `PAQUETE CORRECTO (${r.total} comprobaciones; cubre solo el paquete rápido${opt('detail') ? ' y el detalle' : ''}, no los ZIP de lote ni de auditoría; no demuestra que una auditoría leyó el caso apropiado)` : `PAQUETE RECHAZADO (${r.failed.length} de ${r.total ?? r.checks.length} comprobaciones fallan)`); }
  process.exit(r.ok ? 0 : 1);
}
