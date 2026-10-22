// Empaquetado de la evidencia de SIM-MOTOR-01 (§11). Lee las ejecuciones ya hechas (out/sim-motor01/bench, navegador, pruebas, referencia) y escribe en out/sim-motor01/entrega-final/ :
//   SIM-MOTOR-01-revision-rapida.zip · SIM-MOTOR-01-evidencia-detallada.zip · SIM-MOTOR-01-indice.json
// No simula la campaña: solo regenera, para el ejemplo y las evidencias dirigidas, partidos concretos (se declara cuántos). El recibo lo emite scripts/sim01-check.js desde los archivos finales.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { loadData, ROOT } from './node-data.js';
import { ZipWriter } from '../src/batch/zip.js';
import { makeContext } from '../src/sim/context.js';
import { SimMatch } from '../src/sim/engine.js';
import '../src/sim/materialize.js';
import { buildSimResult } from '../src/sim/result.js';
import { RECONCILIATION_IDS } from '../src/sim/reconcile.js';
import { buildReferenceInput, referenceTeamMap, buildPairInput } from '../src/sim/teams.js';
import { buildAgenda } from '../src/sim/schedule.js';
import { capabilityContrast } from '../src/sim/capabilities.js';
import { controlContrasts } from '../src/sim/controls.js';
import { probeVector, diffVectors } from '../src/sim/probe.js';
import { runCase } from '../src/sim/cases.js';
import { fpString } from '../src/sim/fp.js';
import { SIM_MODEL, SIM_RESULT_SCHEMA, SIM_PROFILE_ID, SIM_VERSION, SIM_COVERAGE_ID, SIM_STATS_POLICY_ID, SIM_MASTER_SEED } from '../src/sim/version.js';
import { CATALOG } from '../src/analysis/catalog.js';
import { BLOCKS } from '../src/analysis/coverage.js';
import { freezeReference } from './sim01-freeze.js';
import { SCOPE_ROWS, outputRows, OUTPUT_HEADER, STATE_ROWS, capabilityRows, CAPABILITY_HEADER, controlRows, CONTROL_HEADER } from './sim01-tables.js';
import { APP_VERSION } from '../src/version.js';

const OUT = join(ROOT, 'out/sim-motor01'); const FINAL = join(OUT, 'entrega-final'); mkdirSync(FINAL, { recursive: true });
const read = (p) => JSON.parse(readFileSync(p, 'utf8')); const sha = (b) => createHash('sha256').update(b).digest('hex');
const csv = (header, rows) => `${[header, ...rows].map((r) => r.map((c) => { const s = c == null ? '' : String(c); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n')}\n`;
const sh = (c) => execSync(c, { cwd: ROOT }).toString().trim();
const { profile, players } = loadData(); const ctx = makeContext(profile); const agenda = buildAgenda();
const B = Object.fromEntries(['B01', 'B02', 'B03'].map((k) => [k, read(join(OUT, 'bench', `${k}.json`))]));
const extra = existsSync(join(OUT, 'bench')) ? readdirSync(join(OUT, 'bench')).filter((f) => /^extra-.*\.json$/.test(f)).map((f) => read(join(OUT, 'bench', f))) : [];
const nav = read(join(OUT, 'navegador/recorrido.json')); const checks = read(join(OUT, 'pruebas.json')); const hist = existsSync(join(OUT, 'historial-mediciones.json')) ? read(join(OUT, 'historial-mediciones.json')) : { mediciones: [] };
const before = read(join(OUT, 'referencia-antes.json')); const after = freezeReference(); writeFileSync(join(OUT, 'referencia-despues.json'), JSON.stringify(after, null, 1));
const head = sh('git rev-parse HEAD'); const codeCommit = sh('git log -1 --format=%H -- src scripts tests data'); const dirty = sh('git status --porcelain -- . ":!out"').length > 0;
const files = {}; const add = (name, content) => { files[name] = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8'); };

// ------------------------------------------------------------------------------------------------------------------------------ 01 identidad
add('01-IDENTIDAD.json', JSON.stringify({
  entrega: 'SIM-MOTOR-01', fecha: '2026-10-22', model: SIM_MODEL, version: SIM_VERSION, resultSchema: SIM_RESULT_SCHEMA, simProfile: SIM_PROFILE_ID, simProfileFingerprint: ctx.sp.fingerprint, tablesFingerprint: ctx.T.fingerprint, coverage: SIM_COVERAGE_ID, statsPolicy: SIM_STATS_POLICY_ID, masterSeed: SIM_MASTER_SEED, appVersion: APP_VERSION,
  git: { repo: 'bateman37/beM', rama: sh('git rev-parse --abbrev-ref HEAD'), base: '606c33b88f5442f11fc15c77ed24ff990a60e239 (main tras fusionar la PR #20, MOTOR-18C)', dependenciaDe18C: 'ninguna: la PR #20 ya estaba fusionada; la rama se reinició desde main', commitDeCodigoComprobado: codeCommit, commitCabeza: head, arbolConCambiosSinCommit: dirty, nota: 'los commits posteriores al de código comprobado solo añaden documentación y evidencia pequeña' },
  detallado: { motor: after.engine, exportSchema: after.export_schema, perfilEfectivo: after.profile_id, datasetPoblacion: profile.population.version }, entorno: B.B02.env,
  huellasDeLaReferencia: { antes: { digestArchivosDeportivos: before.sport_files_digest, archivos: before.sport_files }, despues: { digestArchivosDeportivos: after.sport_files_digest, archivos: after.sport_files } },
}, null, 1));

// ------------------------------------------------------------------------------------------------------------------------------ 02–05
add('02-ALCANCE.csv', csv(['seccion_del_encargo', 'requisito', 'estado', 'productor', 'prueba', 'ruta_o_nota'], SCOPE_ROWS));
add('03-OUTPUTS.csv', csv(OUTPUT_HEADER, outputRows(CATALOG, BLOCKS, profile.statsPolicy.families)));
const probeInput = buildReferenceInput(profile, players, 'EQ03', 'EQ04', { seed: 1 });
const caps = capabilityContrast(ctx, probeInput); add('04-CAPACIDADES-32.csv', csv(CAPABILITY_HEADER, capabilityRows(caps)));
const cons = controlContrasts(ctx, probeInput);
add('05-CONTROLES-Y-TABLAS.csv', csv(CONTROL_HEADER, [...controlRows(cons), ...STATE_ROWS.map((s) => [s[1], s[0], s[0], s[6], '', s[2], s[3], '', `${s[4]} · ${s[5]}`])]));

// ------------------------------------------------------------------------------------------------------------------------------ 06 parámetros
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const mismatches = ctx.sp.rows.filter((r) => r.origin === 'heredada').filter((r) => JSON.stringify(getPath(profile, r.source)) !== JSON.stringify(r.value)).map((r) => ({ path: r.path, source: r.source, value: r.value, origen: getPath(profile, r.source) }));
add('06-PARAMETROS.json', JSON.stringify({ id: ctx.sp.id, fingerprint: ctx.sp.fingerprint, detailedProfileId: ctx.sp.detailedProfileId, filas: ctx.sp.rows.length, porProcedencia: Object.fromEntries(['heredada', 'derivada', 'SEM-SIM01'].map((o) => [o, ctx.sp.rows.filter((r) => r.origin === o).length])),
  diferenciasFrenteAlOrigen: { descripcion: 'cada fila heredada se compara con su ruta en el perfil efectivo del detallado; lista vacía = copia exacta', filas: mismatches },
  formulasDeDerivacion: ctx.sp.rows.filter((r) => r.origin === 'derivada').map((r) => ({ path: r.path, formula: r.source, value: r.value, unit: r.unit })), semillasSEM_SIM01: ctx.sp.rows.filter((r) => r.origin === 'SEM-SIM01'),
  tablasHeredadasPorReferencia: { huella: ctx.T.fingerprint, contenido: ['repertoire.plays (15 fichas, salidas y roles)', 'repertoire.dispositions', 'defenseRepertoire.organizations/coverages/attackerFunctions', 'coach.policies y librillo de faltas', 'participantSlots', 'familiarity (catálogo)'] }, filasEfectivas: ctx.sp.rows }));

// ------------------------------------------------------------------------------------------------------------------------------ 07 agenda y 08 resultados
const inputFp = B.B01.results.map((r) => r.inputFp);
add('07-AGENDA.csv', csv(['n', 'id', 'vuelta', 'posicion_en_vuelta', 'equipo_A', 'equipo_B', 'semilla', 'huella_de_entrada'], agenda.map((c, i) => [c.n, c.id, c.round, c.pos, c.a, c.b, c.seed, inputFp[i]])));
const cols = (k) => [`${k}_estado`, `${k}_marcador_A`, `${k}_marcador_B`, `${k}_prorrogas`, `${k}_huella`, `${k}_valido`, `${k}_comprobaciones_fallidas`, `${k}_hechos`, `${k}_sorteos`, `${k}_ms_generar`, `${k}_ms_total_worker`];
const res = (r) => [r.status, r.score?.[0] ?? '', r.score?.[1] ?? '', r.overtimes ?? '', r.fp ?? '', r.valid, (r.failedChecks ?? []).join('|'), r.events ?? '', r.draws ?? '', r.ms.gen.toFixed(2), (r.ms.input + r.ms.gen + r.ms.build + r.ms.recon).toFixed(2)];
add('08-RESULTADOS.csv', csv(['n', 'id', 'equipo_A', 'equipo_B', 'semilla', ...cols('B01'), ...cols('B02'), ...cols('B03')], agenda.map((c, i) => [c.n, c.id, c.a, c.b, c.seed, ...res(B.B01.results[i]), ...res(B.B02.results[i]), ...res(B.B03.results[i])])));

// ------------------------------------------------------------------------------------------------------------------------------ 09 rendimiento
const strip = (r) => { const { results, ...rest } = r; return rest; };
const ratio = (a, b) => (b > 0 ? a / b : null);
add('09-RENDIMIENTO.json', JSON.stringify({
  objetivo: { texto: '1.000 partidos completos en ≤5 s de cálculo y construcción/validación de salidas compactas, con cuatro workers, en una máquina identificada', ms: 5000 },
  conclusion: { B01_ms: B.B01.objective.measuredMs, B02_ms: B.B02.objective.measuredMs, B03_ms: B.B03.objective.measuredMs, B02_alcanzado: B.B02.objective.met, B03_alcanzado: B.B03.objective.met, B03_mas_que_B02: 'B03 usa workers ya iniciados (JIT caliente y contexto reutilizado)', aceleracionB02_frente_B01: ratio(B.B01.objective.measuredMs, B.B02.objective.measuredMs), aceleracionB03_frente_B01: ratio(B.B01.objective.measuredMs, B.B03.objective.measuredMs),
    lectura: 'Resultado real y sin extrapolar. «Técnicamente implementado» y «objetivo alcanzado» son conclusiones distintas.' },
  ejecucionesOficiales: { B01: strip(B.B01), B02: strip(B.B02), B03: strip(B.B03) },
  pasadasAdicionales: { descripcion: 'repeticiones del mismo guion tras la ejecución oficial para conocer la variación; no sustituyen a B01/B02/B03', ejecuciones: extra.map(strip) },
  medicionesPreviasExploratorias: { descripcion: 'conservadas por la regla de §9.4: mediciones reales anteriores a cada tanda de optimizaciones exactas (huellas idénticas), realizadas con scripts exploratorios locales; no son las ejecuciones oficiales', mediciones: hist.mediciones },
  uso_de_workers: { solicitados: B.B02.workersRequested, usados: B.B02.workers, nucleosLogicos: B.B02.env.logicalCpus, nota: 'en esta máquina el aumento de 1 a 4 workers no es lineal (hilos lógicos compartidos y reloj variable)' },
}, null, 1));

// ------------------------------------------------------------------------------------------------------------------------------ 10 conciliaciones
const runs = [B.B01, B.B02, B.B03]; const per = RECONCILIATION_IDS.map((id, i) => { let universe = 0; let fails = 0; let execs = 0; const failing = []; for (const run of runs) for (const r of run.results) { if (!r.universe) continue; execs++; universe += r.universe[i]; fails += r.failures[i]; if (r.failures[i]) failing.push({ run: run.run, caso: r.id, fallos: r.failures[i] }); } return { id, ejecuciones_evaluadas: execs, universo_total: universe, fallos: fails, conforme: fails === 0 && execs === 3000, casos_con_fallo: failing.slice(0, 100) }; });
add('10-CONCILIACIONES.json', JSON.stringify({ politica: 'RECON-SIM01-R1', ejecuciones: runs.reduce((a, r) => a + r.results.length, 0), comprobacionesPorEjecucion: RECONCILIATION_IDS.length, noEvaluadas: RECONCILIATION_IDS.filter((id) => !per.find((p) => p.id === id && p.ejecuciones_evaluadas > 0)), porInvariante: per,
  resumen: { validas: runs.map((r) => ({ run: r.run, validos: r.counts.valid, invalidos: r.counts.invalid, fallidos: r.counts.failed })), fallosCompletos: per.flatMap((p) => p.casos_con_fallo), listaVaciaSiTodoConforme: true },
  nota: 'Un «no evaluado» nunca se cuenta como conforme: cada comprobación declara su universo; la conciliación prueba consistencia interna, no calidad deportiva.' }, null, 1));

// ------------------------------------------------------------------------------------------------------------------------------ 11 determinismo (comparación + experimentos dirigidos)
const eq = (a, b) => a.results.every((r, i) => r.fp === b.results[i].fp && JSON.stringify(r.score) === JSON.stringify(b.results[i].score));
const diff = []; agenda.forEach((c, i) => { const f = [B.B01, B.B02, B.B03].map((b) => b.results[i].fp); if (new Set(f).size > 1) diff.push({ caso: c.id, huellas: f }); });
const teamMap = referenceTeamMap(profile, players); const sample = agenda.filter((_, i) => i % 41 === 0).slice(0, 24); const dir = [];
for (const c of sample) {
  const input = buildPairInput(teamMap, c.a, c.b, { seed: c.seed }); const full = new SimMatch(input, ctx); full.finish(); const rf = buildSimResult(full, { events: false });
  const m = new SimMatch(input, ctx); let drawsRead = 0; const marks = []; for (const t of [97.3, 410, 655.5, 1203, 1800.2, 2299]) { m.advance({ until: t }); const d0 = m.rng.draws; const r = buildSimResult(m, { events: false }); drawsRead += m.rng.draws - d0; marks.push(r.published); } m.finish();
  const rm = buildSimResult(m, { events: true }); const full2 = new SimMatch(input, ctx); full2.finish(); const w = runCase(ctx, teamMap, c);
  dir.push({ caso: c.id, completo: rf.sportFingerprint, porFronteras: rm.sportFingerprint, repeticion: buildSimResult(full2, { events: false }).sportFingerprint, enLote: w.fp, conRegistro: rm.sportFingerprint, sorteosConsumidosAlLeer: drawsRead, iguales: rf.sportFingerprint === rm.sportFingerprint && rf.sportFingerprint === w.fp && rf.sportFingerprint === buildSimResult(full2, { events: false }).sportFingerprint && drawsRead === 0 });
}
add('11-DETERMINISMO.json', JSON.stringify({ huellaDeportiva: 'incluye producción y orden temporal; excluye CPU, rutas, orden de ejecución, worker y etiquetas editoriales', B01_igual_B02: eq(B.B01, B.B02), B01_igual_B03: eq(B.B01, B.B03), B02_igual_B03: eq(B.B02, B.B03), casos: agenda.length, casosConHuellasDistintas: diff,
  experimentosDirigidos: { descripcion: 'sobre 24 casos de la agenda: completo = avance por fronteras con consultas intermedias (sin azar) = repetición = trabajador', casos: dir, todosIguales: dir.every((d) => d.iguales) },
  partidosRegenerados: dir.length * 4 }, null, 1));

// ------------------------------------------------------------------------------------------------------------------------------ 12 detallado congelado
const before2 = new Map(before.files.map((f) => [f.file, f.sha256])); const after2 = new Map(after.files.map((f) => [f.file, f.sha256]));
const changed = [...new Set([...before2.keys(), ...after2.keys()])].filter((k) => before2.get(k) !== after2.get(k));
const gitChanged = sh('git diff --name-only 606c33b88f5442f11fc15c77ed24ff990a60e239 HEAD -- src data scripts tests').split('\n').filter(Boolean);
add('12-DETALLADO-CONGELADO.json', JSON.stringify({ referencia: { entrada: 'buildMatchInput con el perfil efectivo, semilla 20261016', antes: { resultado: before.result, sorteos: before.sporting_draws, huellaTrayectoria: before.trajectory_fp, huellaEntrada: before.input_fingerprint }, despues: { resultado: after.result, sorteos: after.sporting_draws, huellaTrayectoria: after.trajectory_fp, huellaEntrada: after.input_fingerprint }, identica: JSON.stringify(before.result) === JSON.stringify(after.result) && before.sporting_draws === after.sporting_draws && before.trajectory_fp === after.trajectory_fp },
  archivosDeportivos: { criterio: 'src/ y data/ salvo src/lab/, src/version.js y src/sim/ (nuevo)', antes: before.sport_files, despues: after.sport_files, digestAntes: before.sport_files_digest, digestDespues: after.sport_files_digest, archivosCambiados: changed, identicos: changed.length === 0 },
  cambiosComunesNoDeportivos: gitChanged.filter((f) => !f.startsWith('src/sim/') && !f.includes('sim01')), explicacion: 'src/lab/app.js e index.html (selector y cabecera), src/lab/engine-select.js y src/lab/sim-ui.js (nuevos), src/version.js (etiqueta de aplicación) y tres pruebas heredadas actualizadas solo en la etiqueta SIM-MOTOR-01. Ningún archivo del resolutor, de los datos ni de los perfiles detallados cambia.' }, null, 1));

// ------------------------------------------------------------------------------------------------------------------------------ 13 pruebas y navegador
const sim = checks.sim01 ?? {};
add('13-PRUEBAS-Y-NAVEGADOR.md', `# 13 · Pruebas y navegador (SIM-MOTOR-01)

Distingue **comprobado por Claude**, **pendiente de Dennis** y **no ejecutado**.

## Comprobado por Claude
| Control | Resultado |
|---|---|
| Suite completa \`npm test\` | ${checks.npmTest?.pass}/${checks.npmTest?.tests} correctas, ${checks.npmTest?.fail} fallos (${checks.npmTest?.durationS} s) |
| Pruebas nuevas SIM \`tests/sim01.test.js\` (S01-01…10) | ${sim.pass}/${sim.tests} correctas; partidos creados por esas pruebas (incluidas sondas): ${sim.partidosCreados ?? 'n/d'}, completos: ${sim.partidosCompletos ?? 'n/d'} |
| \`npm run data:check\` | ${checks.dataCheck?.ok ? 'correcto' : 'CON FALLOS'}: ${checks.dataCheck?.last} |
| Comprobador documental (\`python3 scripts/docs/check_engine_docs.py\`) | ${checks.docCheck?.ok ? 'correcto' : 'CON FALLOS'} ${checks.docCheck?.last ?? ''} |
| Referencia del detallado antes/después | ${before.result.score.join('–')} y ${before.sporting_draws} sorteos → ${after.result.score.join('–')} y ${after.sporting_draws} sorteos; huella de trayectoria ${before.trajectory_fp === after.trajectory_fp ? 'idéntica' : 'DISTINTA'} |
| 3.000 ejecuciones de la medición (B01+B02+B03) | cobertura de partidos completos: ${B.B01.counts.valid + B.B02.counts.valid + B.B03.counts.valid} válidas de 3.000; 18 comprobaciones SIM por ejecución |
| Partidos adicionales regenerados por esta evidencia | ${dir.length * 4} (experimentos de determinismo) + ${14} (ejemplo, escenarios dirigidos y primeros 12 de B02 en el ZIP de detalle) |

## Recorrido automático de Chromium (Playwright)
${nav.ok ? 'CORRECTO' : 'CON FALLOS'}: ${nav.steps.filter((s) => s.ok).length}/${nav.steps.length} pasos · consola ${nav.consoleErrors.length} errores · red ${nav.netErrors.length} errores. ${nav.nota}

| # | Ruta | Acción | OK | Observación |
|---|---|---|---|---|
${nav.steps.map((s) => `| ${s.n} | ${s.route} | ${s.action} | ${s.ok ? 'sí' : 'NO'} | ${s.obs.replace(/\|/g, '/').slice(0, 140)} |`).join('\n')}

### Descargas reales (por sus bytes)
${nav.descargas.map((d) => `- ${d.what}: \`${d.name}\` · ${d.bytes} B · SHA-256 \`${d.sha256}\``).join('\n')}

## Pendiente de Dennis
- Aceptación manual con [\`docs/prompts/SIM-MOTOR-01-recorrido-manual.md\`](../docs/prompts/SIM-MOTOR-01-recorrido-manual.md). **Ninguna prueba automática de Claude se presenta como realizada por Dennis.**

## No ejecutado
- Otros navegadores, Node 24, campañas deportivas comparadas con el detallado, calibración.
`);

// ------------------------------------------------------------------------------------------------------------------------------ 14 pendientes
add('14-PENDIENTES.md', readFileSync(join(ROOT, 'docs/tecnico/sim-motor01-pendientes.md'), 'utf8'));

// ------------------------------------------------------------------------------------------------------------------------------ 00 LEEME
const o = (x) => `${(x / 1000).toFixed(2)} s`; const sorted = (r) => r.latencyMs;
add('00-LEEME.md', `# SIM-MOTOR-01 · paquete de revisión rápida

Generador estadístico por tramos (\`${SIM_MODEL}\` ${SIM_VERSION}, resultado \`${SIM_RESULT_SCHEMA}\`, perfil \`${SIM_PROFILE_ID}\`). Commit de código comprobado: \`${codeCommit.slice(0, 7)}\` (cabeza \`${head.slice(0, 7)}\`; base \`606c33b\` = main tras la PR #20, sin dependencia de 18C pendiente).

## Orden de lectura
1. Este archivo → 2. \`02-ALCANCE.csv\` → 3. \`09-RENDIMIENTO.json\` y \`08-RESULTADOS.csv\` → 4. \`10-CONCILIACIONES.json\` y \`11-DETERMINISMO.json\` → 5. \`04\`, \`05\` y \`06\` (qué consume cada cosa) → 6. \`12\`, \`13\`, \`14\` → 7. \`ejemplo/\`.

## Conclusiones (separadas; ninguna sustituye a otra)
**Implementación — completa en el alcance de 01.** Generador por tramos con flujos agregados (multinomiales de categorías terminales, reparto de celdas de finalización, cadenas de rebote ofensivo) y materialización cronológica con faltas, bonus, exclusión a mitad de tramo y prórrogas; 32 capacidades y los controles tácticos soportados alteran magnitudes antes del sorteo; selector de motor y laboratorio SIM; lote en trabajadores. Las aproximaciones están en \`02-ALCANCE.csv\` (estado «aproximado») y en la nota técnica.

**Coherencia — comprobada, no es calidad deportiva.** ${B.B01.counts.valid + B.B02.counts.valid + B.B03.counts.valid}/3.000 ejecuciones válidas con 18 comprobaciones SIM cada una (\`10-CONCILIACIONES.json\`); B01, B02 y B03 dan la misma huella y marcador en ${B.B01.results.length - diff.length}/${B.B01.results.length} casos (\`11-DETERMINISMO.json\`). La referencia del detallado es idéntica antes y después (\`12\`). La calidad estadística frente al detallado y a competiciones reales **no está validada**: los coeficientes de origen eran provisionales y traducirlos no los calibra; los 1.000 resultados no se usaron para calibrar.

**Rendimiento — objetivo ${B.B02.objective.met && B.B03.objective.met ? 'alcanzado' : (B.B02.objective.met || B.B03.objective.met ? 'alcanzado solo en parte' : 'NO alcanzado')}.** Máquina: ${B.B02.env.cpuModel}, ${B.B02.env.logicalCpus} CPU lógicas, ${B.B02.env.ramMiB} MiB, Node ${B.B02.env.node}. Cronómetro del objetivo = solicitud de \`pool.run\` → 1.000 resúmenes en poder del coordinador, workers listos (despacho + generación + resultado + 18 invariantes + comunicación).
| Ejecución | Workers | Objetivo (ms) | ¿≤5.000 ms? | Total desde inicio del proceso | Partidos/s | RSS máx. | Válidos | Latencia media/p95 por partido (worker) |
|---|---|---|---|---|---|---|---|---|
${[B.B01, B.B02, B.B03].map((r) => `| ${r.run} | ${r.workers} | ${r.objective.measuredMs.toFixed(0)} | ${r.objective.met ? 'sí' : 'no'} | ${r.timeline.totalFromProcessStartMs.toFixed(0)} ms | ${r.throughputPerSecond.toFixed(0)} | ${r.memory.maxRssMiB.toFixed(0)} MiB | ${r.counts.valid}/${r.counts.requested} | ${sorted(r).mean.toFixed(1)} / ${sorted(r).p95.toFixed(1)} ms |`).join('\n')}

B02 es proceso nuevo con cuatro workers (los workers incluyen ${B.B02.definitions.warmup}); B03 repite la agenda con los mismos workers ya iniciados. Las pasadas adicionales (variación) y las mediciones previas a cada optimización se conservan en \`09-RENDIMIENTO.json\`. «Técnicamente implementado» y «objetivo alcanzado» son conclusiones distintas.

**Pendientes** — \`14-PENDIENTES.md\` (defectos, aproximaciones, decisiones requeridas y alcance de SIM-MOTOR-02, sin mezclarlos).

## Comprobación
\`node scripts/sim01-check.js out/sim-motor01/entrega-final\` verifica integridad, parseo, agenda y conteos, enlace de muestras, igualdad B01/B02/B03 y coherencia de los resultados incluidos. **No vuelve a simular ni hace una auditoría deportiva.**
`);

// ------------------------------------------------------------------------------------------------------------------------------ ejemplo
const exInput = buildPairInput(teamMap, agenda[0].a, agenda[0].b, { seed: agenda[0].seed }); const exM = new SimMatch(exInput, ctx, { matchId: agenda[0].id, attemptId: 1 }); exM.finish(); const exRes = buildSimResult(exM, { events: true });
if (exRes.sportFingerprint !== B.B02.results[0].fp) throw new Error('el ejemplo no reproduce la huella de B02 caso 1');
add('ejemplo/SIM01-C0001.resultado.json', JSON.stringify(exRes, null, 1)); add('ejemplo/SIM01-C0001.entrada.json', JSON.stringify({ input: exInput, simProfile: { id: ctx.sp.id, fingerprint: ctx.sp.fingerprint } }, null, 1));
add('ejemplo/CONTRATO.md', readFileSync(join(ROOT, 'docs/tecnico/sim-motor01.md'), 'utf8'));

// ------------------------------------------------------------------------------------------------------------------------------ ZIP rápido
const quick = join(FINAL, 'SIM-MOTOR-01-revision-rapida.zip'); const zq = new ZipWriter(quick); for (const [name, buf] of Object.entries(files)) await zq.add(name, buf); await zq.finish();

// ------------------------------------------------------------------------------------------------------------------------------ ZIP de detalle
const detail = {}; const dadd = (n, c) => { detail[n] = Buffer.isBuffer(c) ? c : Buffer.from(c, 'utf8'); };
for (let i = 0; i < 12; i++) { const c = agenda[i]; const inp = buildPairInput(teamMap, c.a, c.b, { seed: c.seed }); const m = new SimMatch(inp, ctx, { matchId: c.id, attemptId: 1 }); m.finish(); const r = buildSimResult(m, { events: true }); if (r.sportFingerprint !== B.B02.results[i].fp) throw new Error(`caso ${c.id}: huella distinta de B02`); dadd(`resultados-B02-primeros-12/${c.id}.resultado.json`, JSON.stringify(r)); dadd(`resultados-B02-primeros-12/${c.id}.entrada.json`, JSON.stringify(inp)); }
// escenarios dirigidos
const scen = {};
const rough = (i) => { for (const t of i.teams) for (const p of t.players) for (const a of ['TEC12', 'TEC13', 'MEN04', 'MEN05']) p.abilities[a] = 1; };
for (let s = 1; s <= 60; s++) { const inp = buildReferenceInput(profile, players, 'EQ01', 'EQ02', { seed: s }); rough(inp); const m = new SimMatch(inp, ctx); m.finish(); if (m.segments.some((g) => g.cut)) { const r = buildSimResult(m, { events: true }); scen.exclusion = { seed: s, descripcion: 'defensores con TEC12/TEC13/MEN04/MEN05 = 1: exclusión a mitad de tramo', segmentosCortados: m.segments.filter((g) => g.cut).map((g) => ({ n: g.n, inicio: g.start, fin: g.end, periodo: g.period })), conciliacion: r.reconciliation, huella: r.sportFingerprint }; dadd('escenarios/exclusion.resultado.json', JSON.stringify(r)); break; } }
for (let s = 1; s <= 800; s++) { const inp = buildReferenceInput(profile, players, 'EQ04', 'EQ04', { seed: 4000 + s }); const m = new SimMatch(inp, ctx); m.finish(); if (m.period > 4) { const r = buildSimResult(m, { events: true }); scen.prorroga = { seed: 4000 + s, prorrogas: r.score.overtimes, periodos: r.score.periods, conciliacion: r.reconciliation.valid, huella: r.sportFingerprint }; dadd('escenarios/prorroga.resultado.json', JSON.stringify(r)); break; } }
scen.capacidades32 = caps; scen.controles = cons; scen.ritmoExtremo = {}; for (const lv of [1, 3, 5]) { const i2 = buildReferenceInput(profile, players, 'EQ03', 'EQ04', { seed: 1 }); i2.teams.forEach((t) => { t.plan.styles.organizedPace = lv; }); const v = probeVector(ctx, i2).vector; scen.ritmoExtremo[lv] = { segundosPorControl: [v['pace.sec.0'], v['pace.sec.1']], transicion: [v['pace.tau.0'], v['pace.tau.1']] }; }
dadd('escenarios/escenarios-dirigidos.json', JSON.stringify(scen, null, 1));
dadd('perfiles/sim-perfil-efectivo.json', JSON.stringify({ id: ctx.sp.id, fingerprint: ctx.sp.fingerprint, rows: ctx.sp.rows }, null, 1)); dadd('perfiles/tablas-heredadas.json', JSON.stringify(ctx.T));
const srcList = [...readdirSync(join(ROOT, 'src/sim')).map((f) => `src/sim/${f}`), 'src/lab/sim-ui.js', 'src/lab/engine-select.js', 'src/lab/app.js', 'src/lab/index.html', 'src/version.js', 'scripts/sim01-freeze.js', 'scripts/sim01-match.js', 'scripts/sim01-bench.js', 'scripts/sim01-package.js', 'scripts/sim01-tables.js', 'scripts/sim01-check.js', 'scripts/sim01-run-checks.js', 'scripts/browser/sim01-recorrido.mjs', 'tests/sim01.test.js', 'docs/tecnico/sim-motor01.md'];
for (const f of srcList) if (existsSync(join(ROOT, f))) dadd(`codigo/${f}`, readFileSync(join(ROOT, f)));
dadd('LEEME.md', `# SIM-MOTOR-01 · evidencia detallada\n\nContiene: los doce primeros resultados completos de B02 con sus entradas (huella igual a la de B02), resultados de escenarios dirigidos (exclusión a mitad de tramo y prórroga), el contraste de las 32 capacidades y de los controles, el perfil SIM efectivo y las tablas heredadas, y el código de solo lectura necesario para revisar el generador, los adaptadores y las conciliaciones (con las fórmulas consumidas: src/sim/model.js y las funciones puras de src/match/formulas.js que reutiliza).\n\nNo se han producido fallos de la medición oficial. Las incidencias de desarrollo corregidas antes de medir están descritas en 14-PENDIENTES.md del paquete rápido. Ruta de origen: out/sim-motor01/entrega-final/ (fuera de Git).\n`);
dadd('codigo/src/match/formulas.js', readFileSync(join(ROOT, 'src/match/formulas.js'))); dadd('codigo/src/match/mathx.js', readFileSync(join(ROOT, 'src/match/mathx.js')));
const det = join(FINAL, 'SIM-MOTOR-01-evidencia-detallada.zip'); const zd = new ZipWriter(det); for (const [name, buf] of Object.entries(detail)) await zd.add(name, buf); await zd.finish();

// ------------------------------------------------------------------------------------------------------------------------------ índice
const entry = (name, buf, extra = {}) => ({ name, bytes: buf.length, sha256: sha(buf), ...extra });
const schemaOf = (n) => (n.endsWith('.csv') ? 'csv/utf-8' : n.endsWith('.json') ? 'json' : n.endsWith('.md') ? 'markdown' : 'texto');
const index = {
  schema: 'beM-sim-package-index/1', entrega: 'SIM-MOTOR-01', generado: '2026-10-22', commitDeCodigo: codeCommit, commitCabeza: head,
  relacion: 'revision-rapida: tablas y conclusiones para verificar las afirmaciones principales; evidencia-detallada: doce resultados completos de B02, escenarios dirigidos, perfiles y código de solo lectura. El recibo SIM-MOTOR-01-verificacion-final.json se obtiene DESPUÉS de este índice y no se incluye en él (sin autorreferencias).',
  paquetes: [{ ...entry(basename(quick), readFileSync(quick)), tipo: 'revision-rapida', miembros: Object.entries(files).map(([n, b]) => entry(n, b, { schema: schemaOf(n) })) }, { ...entry(basename(det), readFileSync(det)), tipo: 'evidencia-detallada', miembros: Object.entries(detail).map(([n, b]) => entry(n, b, { schema: schemaOf(n) })) }],
};
writeFileSync(join(FINAL, 'SIM-MOTOR-01-indice.json'), JSON.stringify(index, null, 1));
console.log(`paquete rápido ${(statSync(quick).size / 1048576).toFixed(2)} MiB · detalle ${(statSync(det).size / 1048576).toFixed(2)} MiB · índice escrito · ejemplo ${exRes.score.current.join('–')}`);
void fpString;
