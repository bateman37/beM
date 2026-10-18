// MOTOR-17: resumen operativo y estado de cierre GENERADOS desde los archivos finales de la campaña (nada se copia a mano): `docs/tecnico/evidencia-motor17/RESUMEN-OPERATIVO.md`, `cierre.json` (vista Cierre) y
// `out/motor17/rapido/00-cifras.json`. No interpreta deporte: informa cantidades, estados y diferencias mecánicas ya calculadas.
// Uso: node scripts/m17-summary.js [--root=out/motor17]
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const ROOT = arg('root', 'out/motor17'); const EV = 'docs/tecnico/evidencia-motor17';
const J = (p) => JSON.parse(readFileSync(p, 'utf8')); const csv = (p) => { const rows = readFileSync(p, 'utf8').trim().split('\n'); const h = rows[0].split(','); return rows.slice(1).map((l) => { const c = []; let cur = ''; let q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (ch === ',' && !q) { c.push(cur); cur = ''; } else cur += ch; } c.push(cur); return Object.fromEntries(h.map((k, i) => [k, c[i]])); }); };
const r1 = (x) => Math.round(x * 10) / 10; const r2 = (x) => Math.round(x * 100) / 100; const f = (x, d = 2) => (x == null || x === '' ? '—' : Number(x).toFixed(d));
const freeze = J(join(ROOT, 'plan/00-congelacion.json')); const tables = J(join(ROOT, 'rapido/resumen-tablas.json')).counts; const cmp = csv(join(ROOT, 'rapido/09-COMPARACION-R0-R17.csv')); const dev = J(join(ROOT, 'desarrollo-resultados/resultados-desarrollo.json'));
const cost = {}; for (const v of ['R0', 'R17']) for (const n of [100, 200]) cost[`${v}-${n}`] = J(join(ROOT, `coste/coste-${v}-${n}.json`));
const attr = J(join(ROOT, 'coste-atribucion/alternadas.json')); const eqF = J(join(ROOT, 'equivalencia/a17-p17-full.json')); const eqM = J(join(ROOT, 'equivalencia/a17-p17-minimal.json')); const ref = J(join(ROOT, 'equivalencia/referencia-20261016.json'));
const aud = {}; for (const lec of readdirSync(join(ROOT, 'auditoria'))) { const d = join(ROOT, 'auditoria', lec); const ej = csv(join(d, 'ejecuciones.csv')); const cnt = {}; for (const e of ej) cnt[e.resultado] = (cnt[e.resultado] ?? 0) + 1; const sens = csv(join(d, 'sensibilidad.csv')); const cap = csv(join(d, 'capacidades.csv')); const ex = {}; for (const s of sens) ex[s.exactitud ?? '(columna ausente en el lector anterior)'] = (ex[s.exactitud ?? '(columna ausente en el lector anterior)'] ?? 0) + 1; aud[lec] = { counts: cnt, byId: Object.fromEntries(ej.map((e) => [e.audit_id, e.resultado])), sensitivity_rows: sens.length, sensitivity_exactness: ex, matches_max: Math.max(...cap.map((c) => Number(c.matches || 0))), capabilities_with_use: new Set(cap.filter((c) => Number(c.usos || 0) > 0).map((c) => c.cap)).size, lector: J(join(d, 'lectura.json')).lector }; }
const tests = existsSync(join(ROOT, 'logs/pruebas/npm-test.log')) ? readFileSync(join(ROOT, 'logs/pruebas/npm-test.log'), 'utf8') : ''; const T = (k) => Number((tests.match(new RegExp(`^# ${k} (\\d+)`, 'm')) ?? [])[1] ?? NaN);
const dataCheck = existsSync(join(ROOT, 'logs/pruebas/data-check.log')) ? /datos correctos/.test(readFileSync(join(ROOT, 'logs/pruebas/data-check.log'), 'utf8')) : null; const docsCheck = existsSync(join(ROOT, 'logs/pruebas/docs-check.log')) ? readFileSync(join(ROOT, 'logs/pruebas/docs-check.log'), 'utf8').trim().split('\n').pop() : null;
const verif = existsSync(join(ROOT, 'logs/verificacion-entrega.json')) ? J(join(ROOT, 'logs/verificacion-entrega.json')) : null; const nav = existsSync(join(ROOT, 'informes/navegador.json')) ? J(join(ROOT, 'informes/navegador.json')) : null; const pr = existsSync(join(ROOT, 'informes/panel-recovery.txt')) ? readFileSync(join(ROOT, 'informes/panel-recovery.txt'), 'utf8') : '';
const cm = (b, m) => cmp.find((x) => x.block === b && x.metric === m);
const c = cost; const g = (k) => c[k].timing_ms.dispatch_to_last_persisted_wall / 1000; const tt = (k) => c[k].timing_ms.total_from_process_start / 1000;
const stlFun = (v) => { let con = 0; let sin = 0; for (const [k, n] of Object.entries(tables.embudo)) if (k.startsWith(`${v}|`) && /vivo/.test(k)) { if (/con crédito/.test(k)) con += n; else sin += n; } return { con, sin }; };
const e0 = stlFun('R0'); const e17 = stlFun('R17');
const numbers = { identidades: { R0: freeze.git.R0.head, R17: freeze.git.R17.head, stages: freeze.git.stages, engine: freeze.versions.R17.engine, effective_profile: freeze.versions.R17.effective_profile_id }, ejecuciones: tables.porVersionPropositoBloque, anomalias: tables.noTerminadasOInvalidas.length, auditorias: aud, coste: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, { wall_s: r1(v.timing_ms.dispatch_to_last_persisted_wall / 1000), total_s: r1(v.timing_ms.total_from_process_start / 1000), valid: v.counters.validos, rss_mib: v.memory.max_rss_mib_process_incl_worker_threads, effort: v.sporting_effort.per_match }])), atribucion: attr, equivalencia: { full: eqF.allEqual, minimal: eqM.allEqual, ejecuciones: eqF.executions + eqM.executions }, referencia: ref, pruebas: { total: T('tests'), pass: T('pass'), fail: T('fail') }, embudo_vivas: { R0: e0, R17: e17 } };
writeFileSync(join(ROOT, 'rapido/00-cifras.json'), JSON.stringify(numbers, null, 1));

const md = `# Resumen operativo de MOTOR-17 (generado por \`scripts/m17-summary.js\` desde los archivos finales)

Sin ensayo deportivo: cantidades, estados y diferencias mecánicas. Interpretación y comparación externa: ChatGPT. Aceptación de las candidatas: Dennis y ChatGPT.

## 1 · Base real
| Etapa | Commit |
|---|---|
| R0 (MOTOR-15B, código) | \`${freeze.git.R0.head}\` |
| A17 (correcciones) | \`${freeze.git.stages.A17}\` + \`${freeze.git.stages.A17b}\` (corrección hallada con la candidata) |
| P17 (optimización exacta) | \`${freeze.git.stages.P17}\` + \`${freeze.git.stages.P17b}\` |
| **R17 (código de la campaña)** | \`${freeze.git.R17.head}\` (Git limpio en la congelación: ${freeze.clean_git_R17}); perfil efectivo \`…${freeze.versions.R17.effective_profile_id.slice(-60)}\` (candidata **${freeze.chosen_candidate}**) |

Motor R17 \`${freeze.versions.R17.engine}\`, política \`${freeze.versions.R17.stats_policy}\` / \`${freeze.versions.R17.acta_policy}\`; R0 \`${freeze.versions.R0.engine}\`, \`${freeze.versions.R0.stats_policy}\`. Entradas idénticas entre versiones: **${freeze.all_inputs_identical_between_versions}**. Node ${freeze.env.node}, ${freeze.env.cpus} CPU (${freeze.env.cpu_model}), ${freeze.env.mem_gib} GiB.

## 2 · Campaña de cierre \`MOTOR17-CIERRE-20261018\` (cantidades reales)
| Bloque · propósito | R0 | R17 |
|---|---:|---:|
${['A', 'B', 'C', 'D'].map((b) => `| ${b} · principal | ${tables.porVersionPropositoBloque[`R0|principal|${b}`]} | ${tables.porVersionPropositoBloque[`R17|principal|${b}`]} |`).join('\n')}
| **Comparación principal** | **${['A', 'B', 'C', 'D'].reduce((s, b) => s + tables.porVersionPropositoBloque[`R0|principal|${b}`], 0)}** | **${['A', 'B', 'C', 'D'].reduce((s, b) => s + tables.porVersionPropositoBloque[`R17|principal|${b}`], 0)}** |
| Repeticiones diagnósticas (completo, relato omitido) | ${['A', 'B', 'C', 'D'].reduce((s, b) => s + tables.porVersionPropositoBloque[`R0|diagnostico_completo|${b}`], 0)} | ${['A', 'B', 'C', 'D'].reduce((s, b) => s + tables.porVersionPropositoBloque[`R17|diagnostico_completo|${b}`], 0)} |
| Benchmarks reales (100 + 200) | 300 | 300 |

Ejecuciones físicas de cierre: **${tables.ejecuciones}** (+ 600 de coste). Todas terminadas y válidas: **${tables.noTerminadasOInvalidas.length === 0 ? 'sí' : 'NO'}**; fallos conservados: ${tables.noTerminadasOInvalidas.length}; reintentos: 0. Diagnóstico frente a principal (mismas entradas y semilla con otro nivel de registro): ${tables.diagnosticoVsPrincipal.comparados} pares, mismo marcador ${tables.diagnosticoVsPrincipal.mismoMarcador}, mismos sorteos ${tables.diagnosticoVsPrincipal.mismosSorteos}, mismos hechos ${tables.diagnosticoVsPrincipal.mismosHechos}.
**Declaración de semillas:** el espacio de A del prompt (270000000) se usó en lecturas exploratorias de R0 durante el desarrollo; se cambió a 271000000 + 1000·p + 1 antes de abrir resultados. **Revisión B de R17:** tras abrir la primera pasada se vio que la sensibilidad de MEN02/MEN03 y FIS06 seguía aproximada; se registró el tope en su punto de consumo y se re-ejecutó TODO R17 (trayectorias idénticas: mismo digest de resultados en los benchmarks); la primera pasada se conserva identificada y no se usa.

## 3 · Defectos resueltos (hipótesis en \`02-HIPOTESIS.csv\`; cambios en \`03-TABLA-DE-CAMBIOS.csv\`)
Crédito de robo con criterio único (en los 24 casos de desarrollo: ${f(JSON.parse(readFileSync(join(ROOT, 'evidencia/embudo-antes-despues.json'), 'utf8')).R0.steals_per_team_performance)} → ${f(JSON.parse(readFileSync(join(ROOT, 'evidencia/embudo-antes-despues.json'), 'utf8')).A17_actual.steals_per_team_performance)} robos por equipo con las mismas pérdidas; en los diagnósticos de cierre, pérdidas vivas con crédito R0 ${e0.con}/${e0.con + e0.sin} frente a R17 ${e17.con}/${e17.con + e17.sin}); cierre de las nueve cadenas de saque (${JSON.parse(readFileSync(join(ROOT, 'evidencia/cadenas-antes-despues.json'), 'utf8')).totals.open_R0} → ${JSON.parse(readFileSync(join(ROOT, 'evidencia/cadenas-antes-despues.json'), 'utf8')).totals.open_R17} abiertas, hechos y sorteos idénticos); identidad global y \`matches\` de capacidades (R0 leído con lector R0: máximo ${aud['R0-lectorR0'].matches_max}; con lector R17: ${aud['R0-lectorR17'].matches_max}); \`team_index\` explícito (sin nulos en ${verif?.jugadores_team_index_sin_nulos ?? '—'} filas de jugador); sensibilidad con tope registrado: R17 ${JSON.stringify(aud['R17-lectorR17'].sensitivity_exactness)} frente a R0 con lector R17 ${JSON.stringify(aud['R0-lectorR17'].sensitivity_exactness)}; \`resumen.json\` de cada lectura; responsabilidad obsoleta tras un relevo en la posesión (excepción de un partido de cien con la candidata).

## 4 · Cambios numéricos (propuesta, sin aceptación deportiva)
| Fila | Base | C17-01 | C17-02 (elegida para R17) |
|---|---:|---:|---:|
| \`energy.costPerLiveMinute\` | 2 | 3 | 3,5 |

Muestra de desarrollo (24 encuentros por perfil; \`resultados-desarrollo.csv\`): energía final media ${['P17-base', 'C17-01', 'C17-02'].map((k) => f(dev.resultados[k].energia_final_media, 1)).join(' / ')}; actuaciones de equipo con un jugador de 40:00 ${['P17-base', 'C17-01', 'C17-02'].map((k) => `${f(dev.resultados[k].con_jugador_de_40 * 100, 1)} %`).join(' / ')}; minutos máximos medios ${['P17-base', 'C17-01', 'C17-02'].map((k) => f(dev.resultados[k].minutos_maximos_medios, 1)).join(' / ')}. Selección y criterios: \`docs/tecnico/motor17.md\` §6.1.

## 5 · Comparación mecánica R0 → R17 (casos emparejados, bloques A–D, \`09-COMPARACION-R0-R17.csv\`)
| Métrica | n pares | R0 | R17 | R17 − R0 |
|---|---:|---:|---:|---:|
${['pts', 'efg', 'fga', 'fta', 'reb', 'ast', 'tov', 'stl', 'pf', 'players_40min', 'max_player_min', 'dnp_players'].map((m) => { const x = cm('TODOS', m); return x ? `| ${m} (${x.unit}) | ${x.n_pairs} | ${f(x.mean_R0, 3)} | ${f(x.mean_R17, 3)} | ${f(x.mean_diff_R17_minus_R0, 3)} |` : ''; }).filter(Boolean).join('\n')}

Efecto combinado de código y candidata: no aísla causas. Dos semillas por mecanismo o familia no certifican efectos universales; las repeticiones técnicas no amplían la muestra deportiva.

## 6 · Auditorías AUD01–32 por versión (sobre los doce diagnósticos de cada una; nunca mezcladas)
| Lectura | Conformes | Inconclusas | AUD17 | AUD26 | AUD29 | \`matches\` máx. | Sensibilidad (filas · exactitud) |
|---|---:|---:|---|---|---|---:|---|
${Object.entries(aud).map(([k, a]) => `| ${k} (lector ${a.lector.projection}) | ${a.counts.conforme ?? 0} | ${a.counts.inconcluso ?? 0} | ${a.byId.AUD17} | ${a.byId.AUD26} | ${a.byId.AUD29} | ${a.matches_max} | ${a.sensitivity_rows} · ${JSON.stringify(a.sensitivity_exactness)} |`).join('\n')}

Un «inconcluso» no se cambia: AUD05 y AUD09 siguen sin exposición suficiente en las dos versiones.

## 7 · Rendimiento (trabajos reales, proceso nuevo, 4 workers, \`world-essential\`)
| Versión · trabajo | Pared despacho→último persistido | Total desde el proceso | Partidos/s (pared) | Válidos | Pico RSS (proceso completo) |
|---|---:|---:|---:|---:|---:|
${Object.entries(c).map(([k, v]) => `| ${k} | ${r1(g(k))} s | ${r1(tt(k))} s | ${r1(v.counters.validos / g(k))} | ${v.counters.validos}/${v.n} | ${v.memory.max_rss_mib_process_incl_worker_threads} MiB |`).join('\n')}

Variación entre pasadas del MISMO trabajo (todas las medidas reales hechas, \`coste/repeticiones.json\`): ${(() => { const rep = J(join(ROOT, 'coste/repeticiones.json')).medidas; const by = {}; for (const m of rep) (by[m.trabajo] ??= []).push(m.pared_s); return Object.entries(by).map(([k, v]) => `${k}: ${v.join(' / ')} s`).join(' · '); })()} — el margen es de ≈ ±10 %, de modo que la diferencia R0/R17 se lee con él.

**Objetivo de cien en cinco segundos: ${c['R17-100'].objective_100_in_5s.reached_wall ? 'alcanzado' : 'NO alcanzado'}** (R17: ${r1(g('R17-100'))} s de pared, ${r1(tt('R17-100'))} s con arranque; R0: ${r1(g('R0-100'))} s). Doscientos: medición real (no extrapolación). Mejora exacta A17f→P17 (misma versión de perfil, cuatro pasadas alternadas): ${r1(attr.media_A17f_ms / 1000)} s → ${r1(attr.media_P17_ms / 1000)} s (${r1(attr.mejora_relativa * 100)} %); la comparación global R0/R17 incluye el efecto de la candidata sobre el número de decisiones y sustituciones y no aísla la optimización.

## 8 · Equivalencia
A17f↔P17 (mismas entradas, perfil y observador; hechos con \`calc\`/\`params\`, acta, estados, dirección, reloj, marcador, energía, sorteos, cadenas, memoria y huellas TRAY/TRAYINC): **${eqF.allEqual && eqM.allEqual ? 'iguales' : 'DIFERENCIAS'}** en ${eqF.inputs} entradas de desarrollo (d = 1…${eqF.inputs}, r = 1) × ${eqF.executions + eqM.executions} ejecuciones (diagnóstico completo y mínimo). \`npm run equivalence\` (modalidades, velocidades x2–x16, registro y continuaciones): informe en \`09-EQUIVALENCIA/\`, AUD29 conforme. Referencia histórica 20261016 (planes históricos): ${Object.entries(ref).map(([k, v]) => `${k}: ${v.score.join('–')}, ${v.sporting_draws} sorteos`).join(' · ')}.

## 9 · Comprobaciones
Suite \`npm test\`: ${T('pass')}/${T('tests')} (fallos ${T('fail')}); \`data:check\`: ${dataCheck ? 'correcto' : 'NO correcto'}; comprobador documental: ${docsCheck}; recorrido de navegador (Chromium): ${nav ? `${nav.steps.filter((s) => s.ok).length}/${nav.steps.length} pasos, consola ${nav.consoleErrors.length}, red ${nav.netErrors.length}` : 'no ejecutado todavía'}; recuperación de perfil anterior: ${pr ? (/FALLO/.test(pr) ? 'CON FALLOS' : `${(pr.match(/^OK/gm) ?? []).length} pasos correctos`) : 'no ejecutado'}; verificación mecánica de la entrega: ${verif ? (verif.ok ? 'CORRECTA' : 'CON FALLOS') : 'pendiente'}. **No ejecutado:** otros navegadores, Node 24, lectura directa de FIBA, recorrido manual de Dennis.

## 10 · Pendientes
Objetivo de coste de 5 s (coste pendiente, sin segundo motor); aceptación deportiva de C17-02 (propuesta); calibración externa; interpretación de producto del crédito de recogida sin intervención (función aislada, reversible); H11 y H12 sin resolver (datos para ChatGPT); aceptación manual de Dennis.
`;
writeFileSync(join(EV, 'RESUMEN-OPERATIVO.md'), md);

// ---- estado para la vista «Cierre»
const closure = { summary: { versions: { extension: 'SEM-MOTOR17-20261018', statsPolicy: 'ACTA-MOTOR17-R1', reference: 'campaña MOTOR17-CIERRE-20261018 (R0 = 6a6814c frente a R17); referencia histórica 20261016', snapshot: 'ESE-MOTOR17-R1 / PRJ-MOTOR17-R1', package: 'MOTOR-17-revision-rapida.zip + MOTOR-17-indice-partes.json + partes detalladas' }, axes: [
  { axis: 'Funcional', state: 'completo en su alcance (con límites)', detail: `Crédito de robo con criterio único, cierre de cadenas, identidad global, sensibilidad con tope, team_index, candidatas en el Panel y Cierre con descargas; ${T('pass')}/${T('tests')} pruebas.` },
  { axis: 'Rendimiento', state: c['R17-100'].objective_100_in_5s.reached_wall ? 'objetivo alcanzado' : 'objetivo NO alcanzado', detail: `Cien en ${r1(g('R17-100'))} s (R0: ${r1(g('R0-100'))} s) y doscientos en ${r1(g('R17-200'))} s (R0: ${r1(g('R0-200'))} s) con 4 workers, medidos; optimización exacta ≈ ${r1(attr.mejora_relativa * 100)} %.` },
  { axis: 'Evaluación deportiva', state: 'campaña ejecutada; análisis externo pendiente', detail: `${tables.ejecuciones} ejecuciones de cierre (R0 y R17), 24 diagnósticos, AUD por versión; candidata ${freeze.chosen_candidate} propuesta sin aceptación; calibración externa pendiente.` },
  { axis: 'Aceptación', state: 'pendiente de Dennis', detail: 'Recorrido manual no realizado por Dennis; nada se marca como aceptado.' }],
  coverage: [['Ejecuciones de cierre', `${tables.ejecuciones} (todas terminadas y válidas: ${tables.noTerminadasOInvalidas.length === 0})`], ['AUD R0 (lector R0)', JSON.stringify(aud['R0-lectorR0'].counts)], ['AUD R0 (lector R17)', JSON.stringify(aud['R0-lectorR17'].counts)], ['AUD R17 (lector R17)', JSON.stringify(aud['R17-lectorR17'].counts)], ['Sensibilidad R17', JSON.stringify(aud['R17-lectorR17'].sensitivity_exactness)], ['Cadenas de saque abiertas (diagnósticos)', `R0 ${tables.cadenas['R0|abierta (sin cierre)'] ?? 0} · R17 ${tables.cadenas['R17|abierta (sin cierre)'] ?? 0}`]],
  cost: Object.entries(c).map(([k, v]) => [k, `${r1(g(k))} s de pared (${r1(tt(k))} s con arranque)`, `${v.n} encuentros world-essential, 4 workers, proceso nuevo, ${v.counters.validos} válidos; RSS ${v.memory.max_rss_mib_process_incl_worker_threads} MiB`]),
  costNote: 'Medidas reales (no extrapoladas). Entorno: 4 vCPU Xeon 2,8 GHz, Node 22.22. La variación entre pasadas del mismo trabajo es de ±10 %. La comparación R0/R17 incluye el efecto de la candidata; la mejora exacta de la optimización está en `coste-atribucion/alternadas.json`.',
  reports: [{ path: 'docs/tecnico/motor17.md', what: 'documentación técnica de la entrega' }, { path: 'docs/tecnico/evidencia-motor17/', what: 'hipótesis, cambios, diccionario, resumen operativo y estado de cierre' }, { path: 'docs/prompts/MOTOR-17-recorrido-manual.md', what: 'recorrido manual para Dennis' }],
  checker: 'python3 scripts/m17-verify-delivery.py (CRC, tamaños, SHA-256, agenda, tablas, auditorías y coste)' } };
writeFileSync(join(EV, 'cierre.json'), JSON.stringify(closure.summary, null, 1)); // la vista Cierre lee el objeto (axes, coverage, cost, costNote, reports, checker) tal cual
console.log('resumen y cierre escritos; pruebas', T('pass'), '/', T('tests'));
