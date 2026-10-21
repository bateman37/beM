// MOTOR-17B: resumen operativo y estado de cierre GENERADOS desde los archivos finales de la campaña (nada se copia a mano): `docs/tecnico/evidencia-motor17b/RESUMEN-OPERATIVO.md`, `cierre.json` (vista Cierre) y
// `out/motor17b/rapido/00-cifras.json`. No interpreta deporte: informa cantidades, estados y diferencias mecánicas ya calculadas. Lo no ejecutado se declara «no ejecutado».
// Uso: node scripts/m17b-summary.js [--root=out/motor17b]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const ROOT = arg('root', 'out/motor17b'); const EV = 'docs/tecnico/evidencia-motor17b'; mkdirSync(EV, { recursive: true });
const J = (p) => JSON.parse(readFileSync(p, 'utf8')); const has = (p) => existsSync(p); const rd = (p) => (has(p) ? readFileSync(p, 'utf8') : null);
const csv = (p) => { const rows = readFileSync(p, 'utf8').trim().split(/\r?\n/); const split = (l) => { const c = []; let cur = ''; let q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (ch === ',' && !q) { c.push(cur); cur = ''; } else cur += ch; } c.push(cur); return c; }; const h = split(rows[0]); return rows.slice(1).map((l) => Object.fromEntries(split(l).map((v, i) => [h[i], v]))); };
const r1 = (x) => Math.round(x * 10) / 10;
const freeze = J(join(ROOT, 'plan/00-congelacion.json')); const tables = J(join(ROOT, 'rapido/resumen-tablas.json')).counts; const cmp = J(join(ROOT, 'rapido/09b-DESVIACIONES-Y-DIFERENCIAS-AUTORIZADAS.json')); const aud = J(join(ROOT, 'auditoria/M17B/resumen.json')); const lect = J(join(ROOT, 'auditoria/M17B/lectura.json'));
const five = has(join(ROOT, 'evidencia/cinco-casos-historicos.json')) ? J(join(ROOT, 'evidencia/cinco-casos-historicos.json')) : null; const cost = J(join(ROOT, 'rapido/14-COSTE-DE-LA-CAMPANA.json'));
const tests = rd(join(ROOT, 'comprobaciones/npm-test.log')); const T = (k) => (tests ? Number((tests.match(new RegExp(`^# ${k} (\\d+)`, 'm')) ?? [])[1] ?? NaN) : NaN);
const dataLog = rd(join(ROOT, 'comprobaciones/data-check.log')); const docsLog = rd(join(ROOT, 'comprobaciones/docs-check.log')); const nav = has(join(ROOT, 'informes/navegador.json')) ? J(join(ROOT, 'informes/navegador.json')) : null; const pr = rd(join(ROOT, 'informes/panel-recovery.txt'));
const dl = has(join(ROOT, 'descargas/descargas.json')) ? J(join(ROOT, 'descargas/descargas.json')) : null; const ver = has(join(ROOT, 'entrega-final/MOTOR-17B-verificacion-final.json')) ? J(join(ROOT, 'entrega-final/MOTOR-17B-verificacion-final.json')) : null;
const a5 = aud.aud05; const exec = tables.porVersionPropositoBloque; const sum = (v, p) => Object.entries(exec).filter(([k]) => k.startsWith(`${v}|${p}|`)).reduce((s, [, n]) => s + n, 0);
const funnel = Object.entries(tables.embudo ?? {}); const liveCred = funnel.filter(([k]) => /vivo/.test(k) && /con crédito/.test(k)).reduce((s, [, n]) => s + n, 0); const liveNoCred = funnel.filter(([k]) => /vivo/.test(k) && /sin crédito/.test(k)).reduce((s, [, n]) => s + n, 0);
const state = (ok, v) => (v == null ? 'no ejecutado' : ok ? 'correcto' : 'FALLIDO');
const suiteOk = !Number.isNaN(T('tests')) && T('fail') === 0; const dataOk = dataLog ? /datos correctos/.test(dataLog) : null; const docsOk = docsLog ? !/error|FALLO|problema/i.test(docsLog.trim().split('\n').pop()) : null;
const navOk = nav ? nav.steps.every((s) => s.ok) && !nav.consoleErrors.length && !nav.netErrors.length : null; const dlOk = dl ? dl.files.length > 0 && dl.files.every((f) => f.identical_to_original) : null;
const numbers = { identidades: { control17: freeze.git.CONTROL17.head, m17b_implementacion: freeze.git.M17B.head, engine: freeze.versions.M17B_P1.engine, app: freeze.versions.M17B_P1.app, perfiles: { P0: freeze.versions.M17B_P0.effective_profile_id, P1: freeze.versions.M17B_P1.effective_profile_id } }, ejecuciones: exec, anomalias: tables.noTerminadasOInvalidas.length, reintentos: tables.reintentos, comparacion: tables.comparacion, auditoria: { por_resultado: aud.por_resultado, aud05: a5 }, embudo: tables.embudo, cadenas: tables.cadenas, cinco_casos: five && { todos_creditados: five.todos_creditados_al_recuperador, todos_el_mismo_hecho: five.todos_el_mismo_hecho } };
mkdirSync(join(ROOT, 'rapido'), { recursive: true }); writeFileSync(join(ROOT, 'rapido/00-cifras.json'), JSON.stringify(numbers, null, 1));

const md = `# Resumen operativo de MOTOR-17B (generado por \`scripts/m17b-summary.js\` desde los archivos finales)

Sin ensayo deportivo: cantidades, estados y diferencias mecánicas. Interpretación deportiva: ChatGPT. Aceptación: Dennis. **30 casos lógicos no son 72 observaciones independientes**: las doce ejecuciones diagnósticas repiten esenciales y los cálculos +1/+3/+5 no son partidos nuevos.

## 1 · Base real
| Etapa | Commit |
|---|---|
| **CONTROL17** (MOTOR-17, ejecutable e inmutable, worktree aislado) | \`${freeze.git.CONTROL17.head}\` (Git limpio: ${freeze.clean_git_CONTROL17}) |
| **M17B · implementación auditada** (congelada antes de simular) | \`${freeze.git.M17B.head}\` (Git limpio en la congelación: ${freeze.clean_git_M17B}) |

Motor M17B \`${freeze.versions.M17B_P1.engine}\` (CONTROL17 \`${freeze.versions.CONTROL17_P1.engine}\`), aplicación \`${freeze.versions.M17B_P1.app}\`, política \`${freeze.versions.M17B_P1.stats_policy}\` / \`${freeze.versions.M17B_P1.acta_policy}\` (CONTROL17 \`${freeze.versions.CONTROL17_P1.stats_policy}\`), conservación esencial \`${freeze.versions.M17B_P1.essential_version}\` (CONTROL17 \`${freeze.versions.CONTROL17_P1.essential_version}\`), proyección de auditoría \`${freeze.versions.M17B_P1.projection_version}\`.
Perfiles: **P0** \`…${freeze.versions.M17B_P0.effective_profile_id.slice(-48)}\` (gasto por minuto vivo ${freeze.versions.M17B_P0.cost_per_live_minute}) y **P1** = P0 + C17-02 (gasto ${freeze.versions.M17B_P1.cost_per_live_minute}; referencia provisional, no calibración externa ni aceptación manual). Entradas, órdenes y semillas idénticas entre versiones: **${freeze.all_inputs_identical_between_versions}**. Node ${freeze.env.node}, ${freeze.env.cpus} CPU (${freeze.env.cpu_model}), ${freeze.env.mem_gib} GiB.

## 2 · Campaña \`${freeze.study}\` (cantidades reales)
| Ejecuciones | CONTROL17 | M17B |
|---|---:|---:|
| A · esenciales (12 enfrentamientos, ida/vuelta) | ${exec['CONTROL17|principal|A'] ?? 0} | ${exec['M17B|principal|A'] ?? 0} |
| B · esenciales (seis casos de cierre) | ${exec['CONTROL17|principal|B'] ?? 0} | ${exec['M17B|principal|B'] ?? 0} |
| Diagnósticas (repiten esenciales; A: p = ${freeze.diag_a_p.join(', ')}; B: los seis) | ${sum('CONTROL17', 'diagnostico_completo')} | ${sum('M17B', 'diagnostico_completo')} |
| **Total** | **${sum('CONTROL17', 'principal') + sum('CONTROL17', 'diagnostico_completo')}** | **${sum('M17B', 'principal') + sum('M17B', 'diagnostico_completo')}** |

Total de ejecuciones de partido: **${tables.ejecuciones}** (planificadas 72). Todas terminadas y válidas: **${tables.noTerminadasOInvalidas.length === 0 ? 'sí' : 'NO'}**; fallos: ${tables.noTerminadasOInvalidas.length}; reintentos: ${tables.reintentos}; excluidas: 0. Fuera de esta cuenta: suite, reproducciones dirigidas (cinco pérdidas históricas), ensayo técnico previo de la herramienta (descartado) y el recorrido de navegador.

## 3 · Comparación causal CONTROL17 → M17B (mismo deporte salvo lo autorizado)
${tables.comparacion.comparados} casos comparados; **iguales en lo deportivo: ${tables.comparacion.todosIguales ? 'todos' : `NO (${tables.comparacion.desviaciones} con desviación; ver 09b)`}**. Créditos de robo: CONTROL17 ${tables.comparacion.robosCONTROL17} → M17B ${tables.comparacion.robosM17B} (diferencia autorizada). Conservado idéntico: ${cmp.conservado_idéntico.join('; ')}. Autorizado: ${cmp.diferencias_autorizadas.join('; ')}. Detalle por caso: \`09-COMPARACION-CONTROL17-M17B.csv\`; desviaciones con ejemplos: \`09b-DESVIACIONES-Y-DIFERENCIAS-AUTORIZADAS.json\`.

## 4 · Cierres B17-01…05 (hallazgos en \`01-HALLAZGOS-B17.csv\`)
- **B17-01 organización efectiva**: ${tables.organizacion.filas} filas de tiro con \`defense_org\` como código efectivo (valores que no son cadena: ${tables.organizacion.valoresNoCadena}); origen, versión de plan y alternativa declarados.
- **B17-02 sensibilidad**: ${a5.capacidadesConSalidaPertinenteContrastada}/32 capacidades con salida pertinente contrastada (${a5.capacidadesConSalidaExacta} exactas; aproximadas ${a5.capacidadesConContrasteAproximado}; pendientes ${a5.capacidadesConContrastePendiente}${a5.pendientesDeContraste.length ? ` — ${a5.pendientesDeContraste.join(', ')}` : ''}); ${a5.filasDeContraste} filas en ${a5.contextosDeSensibilidad} contextos (máx. 8 por capacidad); filas con la base que no coincide: ${a5.filasConBaseQueNoCoincide}.
- **B17-03 AUD05**: resultado **${aud.por_auditoria.find((a) => a.id === 'AUD05').resultado}** (derivado de la evidencia, no fijo); observadas ${a5.capacidadesObservadasEnCalculos}, sin exposición ${a5.sinExposicionEnLaEvidencia.length}, observadas sin entradas ${a5.observadasSinEntradasDeReceta.length}. Alcance: ${a5.alcance}.
- **B17-04 crédito de robo**: en los doce diagnósticos, pérdidas vivas con crédito ${liveCred} y sin crédito ${liveNoCred}; ${five ? `las cinco pérdidas históricas sin interceptor se reprodujeron (mismo hecho y recuperador: ${five.todos_el_mismo_hecho}; creditadas al recuperador por control conservado: ${five.todos_creditados_al_recuperador})` : 'las cinco pérdidas históricas: no inspeccionadas'}.
- **B17-05 evidencia final**: ver §7.

## 5 · Auditorías AUD01–32 (M17B, doce diagnósticos; una sola ejecución es el origen de \`resumen.json\`, los CSV, el informe y la interfaz)
Por resultado: ${JSON.stringify(aud.por_resultado)}. Lectura: ${lect.partidos.matches} partidos (${lect.partidos.diagnostic} completos), integridad verificada antes de interpretar. Las ${aud.por_resultado.inconcluso ?? 0} inconclusas son las quince de MOTOR-17 menos AUD05 (que se deriva de la evidencia por B17-03): siguen en su estado justificado, sin cambios de umbral, etiquetas o exclusiones.

## 6 · Cadenas de saque y coste de la campaña
Cadenas (diagnósticos): ${JSON.stringify(tables.cadenas)}. Coste real ejecutado: ${['CONTROL17', 'M17B'].map((v) => `${v} ${cost[v].lotes_ejecutados} lotes, ${r1(cost[v].pared_total_ms_suma_de_lotes / 1000)} s de pared (suma de lotes), pico RSS ${cost[v].pico_rss_mib_del_proceso_por_lote_max} MiB`).join('; ')}. ${cost.nota}

## 7 · Comprobaciones (comprobado por Claude / pendiente de Dennis / no ejecutado)
| Comprobación | Estado |
|---|---|
| Suite \`npm test\` sobre el código final | ${state(suiteOk, Number.isNaN(T('tests')) ? null : 1)}${Number.isNaN(T('tests')) ? '' : ` (${T('pass')}/${T('tests')}, fallos ${T('fail')})`} |
| \`npm run data:check\` | ${state(dataOk, dataOk)} |
| Comprobador documental en copia limpia | ${state(docsOk, docsOk)}${docsLog ? ` — ${docsLog.trim().split('\n').pop()}` : ''} |
| Recorrido de Chromium (interfaz) | ${state(navOk, navOk)}${nav ? ` (${nav.steps.filter((s) => s.ok).length}/${nav.steps.length} pasos; consola ${nav.consoleErrors.length}; red ${nav.netErrors.length})` : ''} |
| Perfil anterior → tarjeta → copia explícita | ${pr ? (/FALLO/.test(pr) ? 'FALLIDO' : `correcto (${(pr.match(/^OK/gm) ?? []).length} pasos)`) : 'no ejecutado'} |
| Descarga real desde los enlaces de la aplicación | ${dl ? state(dlOk, dlOk) + ` (${dl.files.length} archivos)` : 'no ejecutado'} |
| Comprobador de la entrega (\`m17b-verify-delivery.py\`) | ${ver ? ver.resultado_global : 'no ejecutado'} |
| Recorrido manual de Dennis | **pendiente de Dennis** |
| Otros navegadores · Node 24 · pruebas visuales extensivas | no ejecutado |

## 8 · Pendientes (ejes que MOTOR-17B NO cierra)
Calibración deportiva general (C17-02 es referencia provisional); rendimiento masivo del manager (cien en cinco segundos sin alcanzar: no se midió aquí); aceptación manual de Dennis; conformidad FIBA integral (no certificada; criterio de robo: síntesis de ChatGPT, sin lectura directa por Claude).
`;
writeFileSync(join(EV, 'RESUMEN-OPERATIVO.md'), md);

const closure = { versions: { extension: 'SEM-MOTOR17B-20261021', statsPolicy: freeze.versions.M17B_P1.acta_policy, reference: `campaña ${freeze.study} (CONTROL17 = ${freeze.git.CONTROL17.head.slice(0, 7)} frente a M17B = ${freeze.git.M17B.head.slice(0, 7)}); referencia histórica 20261016 = 83–98 y 6.684 sorteos`, snapshot: `${freeze.versions.M17B_P1.essential_version} / ${freeze.versions.M17B_P1.projection_version}`, package: 'MOTOR-17B-revision-rapida.zip + MOTOR-17B-indice-partes.json + evidencia detallada + MOTOR-17B-verificacion-final.json (fuera de los ZIP)' }, axes: [
  { axis: 'Correcciones de esta entrega (B17-01…05)', state: 'cerradas en su alcance (con límites declarados)', detail: `Organización efectiva por hecho, ${a5.capacidadesConSalidaPertinenteContrastada}/32 capacidades con salida pertinente, AUD05 derivado de la evidencia, crédito de robo con procedencia común y evidencia final coherente; ${Number.isNaN(T('tests')) ? 'suite no ejecutada' : `${T('pass')}/${T('tests')} pruebas`}.` },
  { axis: 'Estabilidad técnica', state: 'evidencia acotada', detail: `${tables.ejecuciones} ejecuciones planificadas (30 casos lógicos; no 72 observaciones independientes), todas ${tables.noTerminadasOInvalidas.length === 0 ? 'terminadas y válidas' : 'con incidencias (ver resumen)'}; CONTROL17 y M17B comparados: deporte ${tables.comparacion.todosIguales ? 'idéntico salvo créditos de robo y su procedencia' : 'con desviaciones (ver 09b)'}.` },
  { axis: 'Calibración deportiva general', state: 'PENDIENTE', detail: 'No se cierra con esta muestra ni por elegir C17-02 (referencia provisional P1).' },
  { axis: 'Rendimiento masivo del manager', state: 'PENDIENTE', detail: 'Objetivo heredado de cinco segundos para cien partidos sin alcanzar; esta campaña no es el benchmark frío ni se extrapola.' },
  { axis: 'Aceptación manual', state: 'pendiente de Dennis', detail: 'Recorrido manual no realizado por Dennis; nada se marca como aceptado.' },
  { axis: 'Conformidad FIBA integral', state: 'NO certificada', detail: 'Solo el criterio estadístico de robo, por síntesis verificada por ChatGPT; sin lectura directa del manual por Claude.' }],
  coverage: [['Ejecuciones de campaña', `${tables.ejecuciones} (terminadas y válidas: ${tables.noTerminadasOInvalidas.length === 0})`], ['AUD01–32 (M17B)', JSON.stringify(aud.por_resultado)], ['AUD05', `observadas ${a5.capacidadesObservadasEnCalculos}/32 · con salida pertinente ${a5.capacidadesConSalidaPertinenteContrastada} · exactas ${a5.capacidadesConSalidaExacta} · pendientes ${a5.capacidadesConContrastePendiente} · sin exposición ${a5.sinExposicionEnLaEvidencia.length}`], ['Sensibilidad', `${a5.filasDeContraste} filas (${a5.filasConSalidaPertinente} con salida pertinente) en ${a5.contextosDeSensibilidad} contextos`], ['CONTROL17 ↔ M17B', `${tables.comparacion.comparados} casos; deporte idéntico: ${tables.comparacion.todosIguales}; robos ${tables.comparacion.robosCONTROL17} → ${tables.comparacion.robosM17B}`], ['Organización efectiva', `${tables.organizacion.filas} filas de tiro con código efectivo`], ['Cadenas de saque (diagnósticos)', JSON.stringify(tables.cadenas)], ['Comprobador de la entrega', ver ? ver.resultado_global : 'no ejecutado']],
  cost: [['Campaña CONTROL17', `${r1(cost.CONTROL17.pared_total_ms_suma_de_lotes / 1000)} s de pared (suma de lotes)`, `${cost.CONTROL17.ejecuciones} ejecuciones esenciales, 4 workers; no es el benchmark frío`], ['Campaña M17B', `${r1(cost.M17B.pared_total_ms_suma_de_lotes / 1000)} s de pared (suma de lotes)`, `${cost.M17B.ejecuciones} ejecuciones (esenciales y diagnósticas), concurrencia 4 y 2; no es el benchmark frío`]],
  costNote: cost.nota, reports: [{ path: 'docs/tecnico/motor17b.md', what: 'documentación técnica de la entrega' }, { path: 'docs/tecnico/evidencia-motor17b/', what: 'hallazgos B17-01…05, diccionario, resumen operativo y estado de cierre' }, { path: 'docs/prompts/MOTOR-17B-recorrido-manual.md', what: 'recorrido manual para Dennis' }],
  checker: 'python3 scripts/m17b-verify-delivery.py (CRC, tamaños, SHA-256, recuentos, claves, pertenencia, comparación, semántica de organización, sensibilidad, AUD05 y descargas reales)' };
writeFileSync(join(EV, 'cierre.json'), JSON.stringify(closure, null, 1));
console.log('resumen y cierre escritos; pruebas', T('pass'), '/', T('tests'));
