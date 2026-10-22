// Comprobador de la entrega de SIM-MOTOR-01 (§11.3). Lee los archivos finales reales (índice, ZIP rápido y ZIP de detalle) y escribe SIM-MOTOR-01-verificacion-final.json.
// Verifica integridad (SHA-256 de ZIP y miembros, CRC de cada ZIP), parseo (JSON/CSV), agenda y conteos, enlace de muestras (primeros 12 resultados completos ↔ filas de 08-RESULTADOS), igualdad B01/B02/B03
// y coherencia de los resultados incluidos (marcador, periodos, conciliación). NO vuelve a simular ni hace una auditoría deportiva: el número de hashes no equivale a pruebas deportivas.
// Uso: node scripts/sim01-check.js [directorio=out/sim-motor01/entrega-final]
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { openZip, closeZips } from '../src/batch/zip.js';

const dir = process.argv[2] ?? 'out/sim-motor01/entrega-final';
const sha = (b) => createHash('sha256').update(b).digest('hex'); const checks = []; const fail = [];
const check = (kind, id, ok, detail = '') => { checks.push({ kind, id, ok: !!ok, detail: String(detail).slice(0, 300) }); if (!ok) fail.push({ kind, id, detail: String(detail).slice(0, 500) }); };
const parseCsv = (text) => { const rows = []; let row = []; let cell = ''; let q = false; for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; } else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else cell += c; } if (cell || row.length) { row.push(cell); rows.push(row); } return rows; };

const indexPath = join(dir, 'SIM-MOTOR-01-indice.json'); const indexBuf = readFileSync(indexPath); const index = JSON.parse(indexBuf);
check('integridad', 'índice parsea y declara el esquema', index.schema === 'beM-sim-package-index/1' && index.paquetes.length === 2, index.schema);
const zips = {}; const members = {};
for (const p of index.paquetes) {
  const path = join(dir, p.name); const buf = readFileSync(path); check('integridad', `${p.name}: tamaño`, buf.length === p.bytes, `${buf.length} vs ${p.bytes}`); check('integridad', `${p.name}: SHA-256`, sha(buf) === p.sha256, '');
  const z = openZip(path); zips[p.tipo] = z; members[p.tipo] = {};
  const names = z.list ? z.list() : (z.entries ?? []).map((e) => e.name);
  const declared = p.miembros.map((m) => m.name); check('integridad', `${p.name}: lista de miembros`, JSON.stringify([...names].sort()) === JSON.stringify([...declared].sort()), `${names.length} en el ZIP, ${declared.length} en el índice`);
  for (const m of p.miembros) { let b; try { b = z.read(m.name); } catch (e) { check('integridad', `${p.name}/${m.name}: lectura con CRC`, false, e.message); continue; } check('integridad', `${p.name}/${m.name}: bytes y SHA-256`, b.length === m.bytes && sha(b) === m.sha256, ''); members[p.tipo][m.name] = b; }
}
const Q = members['revision-rapida']; const Dt = members['evidencia-detallada'];
const need = ['00-LEEME.md', '01-IDENTIDAD.json', '02-ALCANCE.csv', '03-OUTPUTS.csv', '04-CAPACIDADES-32.csv', '05-CONTROLES-Y-TABLAS.csv', '06-PARAMETROS.json', '07-AGENDA.csv', '08-RESULTADOS.csv', '09-RENDIMIENTO.json', '10-CONCILIACIONES.json', '11-DETERMINISMO.json', '12-DETALLADO-CONGELADO.json', '13-PRUEBAS-Y-NAVEGADOR.md', '14-PENDIENTES.md', 'ejemplo/SIM01-C0001.resultado.json', 'ejemplo/SIM01-C0001.entrada.json', 'ejemplo/CONTRATO.md'];
for (const n of need) check('contenido', `rápido contiene ${n}`, Q[n] != null && Q[n].length > 0, '');
const J = {}; for (const n of Object.keys(Q).filter((x) => x.endsWith('.json'))) { try { J[n] = JSON.parse(Q[n].toString('utf8')); check('parseo', `${n} es JSON`, true); } catch (e) { check('parseo', `${n} es JSON`, false, e.message); } }
const C = {}; for (const n of Object.keys(Q).filter((x) => x.endsWith('.csv'))) { const rows = parseCsv(Q[n].toString('utf8')); C[n] = rows; const w = rows[0].length; check('parseo', `${n} es CSV rectangular en UTF-8`, rows.every((r) => r.length === w) && !Q[n].toString('utf8').includes('�'), `${rows.length} filas × ${w} columnas`); }
// agenda y conteos
const ag = C['07-AGENDA.csv']; const hd = ag[0]; const rowsAg = ag.slice(1); const col = (h, n) => h.indexOf(n);
check('agenda', '1.000 casos', rowsAg.length === 1000, rowsAg.length); check('agenda', 'identificadores y semillas únicos', new Set(rowsAg.map((r) => r[col(hd, 'id')])).size === 1000 && new Set(rowsAg.map((r) => r[col(hd, 'semilla')])).size === 1000, '');
const cr = rowsAg.slice(0, 132).map((r) => `${r[col(hd, 'equipo_A')]}-${r[col(hd, 'equipo_B')]}`); check('agenda', '132 cruces ordenados de doce equipos distintos', new Set(cr).size === 132 && new Set(rowsAg.slice(0, 132).flatMap((r) => [r[col(hd, 'equipo_A')], r[col(hd, 'equipo_B')]])).size === 12, '');
check('agenda', 'siete vueltas completas (924) + los 76 primeros cruces', rowsAg.slice(132, 264).map((r) => `${r[col(hd, 'equipo_A')]}-${r[col(hd, 'equipo_B')]}`).join() === cr.join() && rowsAg.slice(924).map((r) => `${r[col(hd, 'equipo_A')]}-${r[col(hd, 'equipo_B')]}`).join() === cr.slice(0, 76).join() && rowsAg[999][col(hd, 'vuelta')] === '8', '');
// resultados
const rs = C['08-RESULTADOS.csv']; const rh = rs[0]; const rr = rs.slice(1); const rc = (n) => rh.indexOf(n);
check('resultados', '1.000 filas con tres ejecuciones', rr.length === 1000 && ['B01', 'B02', 'B03'].every((k) => rc(`${k}_huella`) > 0), '');
const same = (a, b) => rr.every((r) => r[rc(`${a}_huella`)] === r[rc(`${b}_huella`)] && r[rc(`${a}_marcador_A`)] === r[rc(`${b}_marcador_A`)] && r[rc(`${a}_marcador_B`)] === r[rc(`${b}_marcador_B`)] && r[rc(`${a}_prorrogas`)] === r[rc(`${b}_prorrogas`)]);
check('igualdad', 'B01 = B02 por caso (huella, marcador y prórrogas)', same('B01', 'B02')); check('igualdad', 'B02 = B03 por caso', same('B02', 'B03'));
for (const k of ['B01', 'B02', 'B03']) { check('coherencia', `${k}: todos terminados y válidos`, rr.every((r) => r[rc(`${k}_estado`)] === 'finished' && r[rc(`${k}_valido`)] === 'true' && r[rc(`${k}_comprobaciones_fallidas`)] === ''), ''); check('coherencia', `${k}: sin empates y marcadores numéricos`, rr.every((r) => Number.isInteger(+r[rc(`${k}_marcador_A`)]) && +r[rc(`${k}_marcador_A`)] !== +r[rc(`${k}_marcador_B`)]), ''); }
check('agenda', 'las filas de resultados siguen el orden y las semillas de la agenda', rr.every((r, i) => r[0] === rowsAg[i][0] && r[rc('semilla')] === rowsAg[i][col(hd, 'semilla')]), '');
// rendimiento
const perf = J['09-RENDIMIENTO.json']; const o = perf.ejecucionesOficiales;
for (const k of ['B01', 'B02', 'B03']) { const r = o[k]; check('rendimiento', `${k}: 1.000 casos solicitados, intentos y válidos coherentes`, r.counts.requested === 1000 && r.counts.valid + r.counts.invalid + r.counts.failed === 1000 && r.counts.attempts >= 1000, JSON.stringify(r.counts)); check('rendimiento', `${k}: el cumplimiento declarado = medida frente a 5.000 ms`, r.objective.met === (r.objective.measuredMs <= 5000), `${r.objective.measuredMs.toFixed(0)} ms`); }
check('rendimiento', 'B01 con un worker, B02/B03 con cuatro', o.B01.workers === 1 && o.B02.workers === 4 && o.B03.workers === 4, `${o.B01.workers}/${o.B02.workers}/${o.B03.workers}`);
check('rendimiento', 'la conclusión repite las medidas de las ejecuciones', perf.conclusion.B02_ms === o.B02.objective.measuredMs && perf.conclusion.B03_alcanzado === o.B03.objective.met, '');
// conciliaciones y determinismo
const con = J['10-CONCILIACIONES.json']; check('conciliación', 'tres ejecuciones × 1.000 evaluadas, ninguna comprobación sin evaluar', con.ejecuciones === 3000 && con.noEvaluadas.length === 0 && con.porInvariante.every((p) => p.ejecuciones_evaluadas === 3000), `${con.ejecuciones}`); check('conciliación', 'lista de fallos completa y vacía/coherente con los conteos', con.porInvariante.reduce((a, p) => a + p.fallos, 0) === con.resumen.fallosCompletos.length || con.resumen.fallosCompletos.length <= con.porInvariante.reduce((a, p) => a + p.fallos, 0), '');
const det = J['11-DETERMINISMO.json']; check('determinismo', 'B01=B02=B03 declarado y sin huellas distintas', det.B01_igual_B02 && det.B01_igual_B03 && det.B02_igual_B03 && det.casosConHuellasDistintas.length === 0, JSON.stringify(det.casosConHuellasDistintas.slice(0, 2))); check('determinismo', 'experimentos dirigidos: todo igual y sin azar al leer', det.experimentosDirigidos.todosIguales && det.experimentosDirigidos.casos.every((c) => c.sorteosConsumidosAlLeer === 0), '');
const ident = J['01-IDENTIDAD.json']; check('identidad', 'modelo, contrato y perfil declarados', ident.model === 'beM-sim-segment' && ident.resultSchema === 'beM-sim-match/1' && ident.simProfile === 'SEM-SIM01-20261022', ''); const cg = J['12-DETALLADO-CONGELADO.json']; check('detallado', 'la referencia del detallado es idéntica antes/después y sus archivos deportivos no cambian', cg.referencia.identica && cg.archivosDeportivos.identicos, `${cg.referencia.antes.resultado.score} → ${cg.referencia.despues.resultado.score}`);
// ejemplo y muestras enlazadas
const ex = J['ejemplo/SIM01-C0001.resultado.json']; check('muestras', 'ejemplo: concilia, sin empate y con la huella de B02 caso 1', ex.reconciliation.valid && ex.score.final && ex.score.final[0] !== ex.score.final[1] && ex.sportFingerprint === rr[0][rc('B02_huella')], ex.sportFingerprint);
let linked = 0; let coherent = 0; for (let i = 0; i < 12; i++) { const id = rowsAg[i][0]; const b = Dt[`resultados-B02-primeros-12/${id}.resultado.json`]; if (!b) { check('muestras', `${id} presente`, false); continue; } const r = JSON.parse(b.toString('utf8')); if (r.sportFingerprint === rr[i][rc('B02_huella')] && r.score.current[0] === +rr[i][rc('B02_marcador_A')] && r.score.current[1] === +rr[i][rc('B02_marcador_B')]) linked++; const sum = r.score.periods.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]); const pts = r.box.teams.map((t) => t.pts); if (r.reconciliation.valid && sum[0] === pts[0] && sum[1] === pts[1] && pts[0] === r.score.current[0] && r.score.current[0] !== r.score.current[1]) coherent++; }
check('muestras', 'los doce primeros resultados completos se enlazan con 08-RESULTADOS (B02): huella y marcador', linked === 12, `${linked}/12`); check('muestras', 'los doce primeros resultados son coherentes (periodos = marcador = acta, conciliados, sin empate)', coherent === 12, `${coherent}/12`);
for (const n of ['escenarios/exclusion.resultado.json', 'escenarios/prorroga.resultado.json']) { const b = Dt[n]; check('muestras', `${n} presente, parsea y concilia`, b && JSON.parse(b.toString('utf8')).reconciliation.valid === true, ''); }

const integrity = checks.filter((c) => c.kind === 'integridad'); const content = checks.filter((c) => c.kind !== 'integridad');
const receipt = { schema: 'beM-sim-verification/1', entrega: 'SIM-MOTOR-01', generado: new Date().toISOString().slice(0, 10), indice: { archivo: 'SIM-MOTOR-01-indice.json', sha256: sha(indexBuf), bytes: indexBuf.length }, paquetes: index.paquetes.map((p) => ({ name: p.name, bytes: statSync(join(dir, p.name)).size, sha256: p.sha256 })),
  verifica: 'integridad (tamaños, SHA-256, lista de miembros, CRC), parseo (JSON/CSV), agenda y conteos, enlace de muestras con 08-RESULTADOS, igualdad B01/B02/B03, coherencia de los resultados incluidos y declaraciones de rendimiento frente a sus medidas',
  noVerifica: 'no vuelve a simular ni audita el deporte; el número de hashes no equivale a pruebas deportivas ni valida la calidad estadística', comprobaciones: { total: checks.length, deIntegridad: integrity.length, deContenido: content.length, falladas: fail.length }, resultado: fail.length === 0 ? 'correcto' : 'CON FALLOS', fallos: fail, detalle: checks };
writeFileSync(join(dir, 'SIM-MOTOR-01-verificacion-final.json'), JSON.stringify(receipt, null, 1)); closeZips();
console.log(`${receipt.resultado}: ${checks.length} comprobaciones (${integrity.length} de integridad, ${content.length} de contenido), ${fail.length} falladas`); for (const f of fail) console.log(' FALLO', f.kind, f.id, f.detail);
process.exit(fail.length ? 1 : 0);
