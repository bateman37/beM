// SIM-MOTOR-04C · empaquetado de la entrega (§12). Todo sale de ejecuciones REALES ya hechas (nada se fabrica ni se calibra): este script solo ensambla, resume mecánicamente y comprime. No cambia ningún resultado.
//   node scripts/sim04c/package.js [--out=out/sim-motor04c/entrega-final]
// Genera SIM-MOTOR-04C-revision-rapida.zip (≤ 2 MiB), SIM-MOTOR-04C-evidencia-detallada.zip (≤ 60 MiB, o partes con índice) y SIM-MOTOR-04C-indice-partes.json. El recibo SIM-MOTOR-04C-verificacion-final.json lo escribe verify-delivery.js.
// El paquete NO es un checkout completo del repositorio: contiene el código y los datos que la evidencia necesita y declara cómo reproducir.
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync, cpSync, copyFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ZipWriter } from '../../src/batch/zip.js';
import { readJsonl, csvText } from './tables.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const O = join(root, 'out/sim-motor04c'); const OUT = arg('out', join(O, 'entrega-final')); const PLAN = join(root, 'docs/tecnico/evidencia-sim-motor04c/plan'); const REP = join(O, 'report'); const CAMP = join(O, 'campaign');
const STAGE = join(O, 'stage'); const FAST = join(STAGE, 'rapida'); const D = join(STAGE, 'detallada'); rmSync(STAGE, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true }); mkdirSync(FAST, { recursive: true }); mkdirSync(D, { recursive: true }); mkdirSync(OUT, { recursive: true });
const sh = (c) => execSync(c, { cwd: root, maxBuffer: 1 << 29 }).toString().trim(); const sha = (b) => createHash('sha256').update(b).digest('hex'); const rd = (p) => readFileSync(p, 'utf8'); const rj = (p) => JSON.parse(rd(p)); const exists = existsSync;
const w = (dir, rel, content) => { const p = join(dir, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, typeof content === 'string' || Buffer.isBuffer(content) ? content : JSON.stringify(content, null, 1)); return p; };
const cp = (src, dst, base = D) => { if (!exists(src)) return false; const p = join(base, dst); mkdirSync(dirname(p), { recursive: true }); cpSync(src, p, { recursive: true }); return true; };
const HEAD = sh('git rev-parse HEAD'); const CODE = sh('git log -1 --format=%H -- src data'); const DIRTY = sh('git status --porcelain -- src data scripts tests package.json').split('\n').filter(Boolean).length;
const fz = { cal: rj(join(PLAN, 'freeze-cal.json')), val: rj(join(PLAN, 'freeze-val.json')) }; const plan = rj(join(PLAN, 'plan.json')); const rules = rj(join(PLAN, 'selection-rules.json')); const sel = rj(join(O, '07-CAL-SELECCION.json')); const valS = rj(join(O, '08-VAL-RESUMEN.json')); const chk = rj(join(O, '12-comprobaciones-campana.json'));
const bench = { B04B: rj(join(O, 'bench/B04B-CLUBS.json')), FINAL: rj(join(O, 'bench/FINAL-CLUBS.json')), DAY: rj(join(O, 'bench/FINAL-DAY.json')) }; const hist = rj(join(O, 'history/11-APRENDIZAJE-E-HISTORIA.json')); const md = rj(join(O, 'matchday/jornada-mixta.json')); const br = rj(join(O, 'navegador/recorrido.json')); const tests = rj(join(O, 'tests/resumen-pruebas.json'));
const vectors = Object.fromEntries(readdirSync(join(O, 'vectors')).filter((f) => f.endsWith('.json')).map((f) => [f.replace('.json', ''), rj(join(O, 'vectors', f))]));
const f4 = (x) => (x == null ? 'n/d' : (+x).toFixed(4)); const MIB = 2 ** 20; const pc = (x) => (x == null ? 'n/d' : `${(100 * x).toFixed(2)} %`);
const fin = sel.finalProvisional; const E = sel.evaluations; const N = E.N04C; const P = E[fin.basedOn] ?? N; const vN = valS.N04C; const vF = valS.FINAL;
const sumBlock = (resolver, block) => { const t = rj(join(REP, '04b-RECUENTO-TOTALES.json')).executedByModelAndBlock; return t[`${resolver}|${block}`] ?? 0; };

// ---------------------------------------------------------------- 01 identidad
const identity = { schema: 'beM-sim04c-identity/1', delivery: 'SIM-MOTOR-04C', pr: 'https://github.com/bateman37/beM/pull/22', branch: sh('git rev-parse --abbrev-ref HEAD'), base: { main: '1d8a92b44169d2a429660407f96234a60d5c317b', sim04bHead: '48bcdefdb0f34238b6e86070692b9e19d8fd5d0a', note: 'PR #22 abierta contra main con SIM-MOTOR-01–04B y 04C; sin fusionar' }, head: HEAD, lastCommitThatTouchedSrcOrData: CODE, workingTreeChangesInCodeAtPackaging: DIRTY,
  freezes: { cal: { codeCommit: fz.cal.codeCommit, frozenAt: fz.cal.frozenAt, selectionRulesSha256: sel.selectionRulesSha256, note: 'reglas, etapas, agenda y hash congelados ANTES de ejecutar CAL' }, val: { codeCommit: fz.val.codeCommit, frozenAt: fz.val.frozenAt, finalVector: 'C04C-FINAL-PROVISIONAL', finalVectorSha256: sha(rd(join(O, 'vectors/C04C-FINAL-PROVISIONAL.json'))), note: 'vector final y código deportivo congelados antes de VAL; solo cambió después documentación, pruebas y evidencia' }, calVerifyAtVal: 'plan/freeze-cal-verify-at-val.json (solo cambió src/sim/candidates.js: lista de candidatas de la interfaz, sin efecto en la generación)' },
  versions: fz.val.versions, detailedReference: fz.val.detailedReference, detailedSportFiles: { count: fz.val.detailedSportFiles.count, changedVsBase: fz.val.detailedSportFiles.changedVsBase, note: 'src/match, src/population, src/knowledge y data/match sin cambios respecto a main' },
  identities: { app: fz.val.versions.app, sim: fz.val.versions.sim, profile: fz.val.versions.simProfile, profileFingerprint: fz.val.versions.effectiveProfileFingerprint, candidate: 'C04C-FINAL-PROVISIONAL (CAND-SIM04C-20261024-R1)', extension: 'SEM-SIM04C-20261024', statsPolicy: fz.val.versions.statsPolicy, recon: fz.val.versions.recon, coverage: fz.val.versions.coverage, resultSchema: fz.val.versions.resultSchema, snapshotSchema: fz.val.versions.snapshotSchema, dataset: 'beM-lab-referencia (doce equipos EQ01–EQ12, 144 fichas)' },
  inventories: { detailedSportFileHashes: fz.val.detailedSportFiles.hashes, watchedFilesAtValFreeze: Object.keys(fz.val.files).length }, node: process.version };
w(FAST, '01-IDENTIDAD.json', identity);

// ---------------------------------------------------------------- 02 cambios
const cambios = [['id', 'tipo', 'cambio', 'efecto_esperado', 'comprobacion'],
  ['C04C-01', 'lectura', 'El lector de contexto×zona×calidad separa canastas con pasador representado (made_with_passer) de asistencias ACREDITADAS (ast_fg_credited); en el detallado la acreditada se lee del crédito `ast`/`canasta` del acta', 'Concilia con AST_FG del acta (CAL DET 1.017; VAL DET 1.051 en 04B); no cambia créditos ni encuentros', 'S04C-04; 09-REBOTE-Y-ASISTENCIAS.csv; 08-CONTEXTO-ZONA-CALIDAD.csv.gz'],
  ['C04C-01b', 'metadato', 'APP_VERSION = SIM-MOTOR-04C; SIM 0.3.2-SIMMOTOR04C; extensión SEM-SIM04C-20261024; política de conciliación RECON-SIM04C-R1 (R27); los guardados de 04B se rechazan para continuación', 'Identidad visible correcta; ninguna activación silenciosa', 'S04C-01, S04C-08; navegador'],
  ['C04C-01c', 'medición', 'El benchmark se ejecuta en procesos independientes sin turnos de espera de otro control y mide fixtures, arranque y total continuo por separado', 'Cronómetros autónomos', '11-RENDIMIENTO.json'],
  ['C04C-02', 'mecanismo', 'Tras un rebote ofensivo válido se decide una vez la rama: inmediata (continuación cercana de 04B) o reinicio organizado (nuevo registro terminal del mismo control con celdas organizadas admisibles del plan vigente, con participantes y créditos propios); fila rebound.organizedResetP0', 'Con 0 trayectoria idéntica a 04B; con >0 hay asistencias y fichas tras rebote', 'S04C-01/02/03; neutralidad 24/24 (12-COMPROBACIONES.json)'],
  ['C04C-02b', 'lectura', 'Embudo reboundFunnel por equipo, procedencia del rebote y rama (esencial y resultado) y conciliación R27', 'Cada rebote ofensivo tiene exactamente una decisión de rama', 'R27 en todos los registros SIM; 09b-REBOTE-EMBUDO.csv'],
  ['C04C-03', 'mecanismo', 'Desplazamiento de calidad de la zona inside con objeto propio (opportunity.simInsideQualityLogit), una vez y antes del sorteo, también en transición y espontáneo', 'Con 0 identidad exacta; no toca aro ni otras zonas', 'S04C-05'],
  ['C04C-03b', 'ajuste numérico (fila)', 'Coeficiente provisional de traducción conversion.simInsideLogitOffset: suma única al logit del tiro inside y a su estimación de decisión de finalización', 'Con 0 identidad exacta; no toca p0, recetas, tapón ni libres', 'S04C-05; condición de etapa P'],
  ['C04C-04', 'ajuste numérico', 'Candidata provisional C04C-FINAL-PROVISIONAL (' + fin.basedOn + ': peso de aro 1,5 · calidad de aro 0,5 · reinicio 0,35 · calidad inside 0,5 · conversión inside 0,30), elegida solo con CAL; NO se activa por defecto', 'M(CAL) ' + f4(N.M) + ' → ' + f4(P.M) + '; no todos los errores entran en banda', '06-CAL-SELECCION.json; 07-VAL-RESUMEN.csv'],
  ['C04C-05', 'medición', 'Fixtures de benchmark: 2.000 clubes con identidades propias (doce arquetipos remapeados), un partido por club y agenda', 'Carga más realista que doce identidades reutilizadas', '11-RENDIMIENTO.json']];
w(FAST, '02-CAMBIOS.csv', csvText(cambios[0], cambios.slice(1)));

// ---------------------------------------------------------------- 03 vectores y reglas
const vrows = (id) => (vectors[id]?.overrides ?? []).map((o) => [o.path, o.value]); const diffVs = (a, b) => { const m = new Map(vrows(b)); return vrows(a).filter(([p, v]) => m.get(p) !== v).map(([p, v]) => ({ path: p, from: m.get(p) ?? null, to: v })); };
const vecList = ['B04B', 'N04C', ...rules.agenda.map((a) => `C04C-${a.id}`)].map((id) => ({ id, executed: !!E[id], parent: vectors[id]?.parent ?? null, completeRows: vectors[id]?.overrides ?? null, differencesVsParent: vectors[id]?.parent ? diffVs(id, vectors[id].parent) : null, differencesVsN04C: id === 'B04B' || id === 'N04C' ? null : diffVs(id, 'N04C'), M: E[id]?.M ?? null, dominantError: E[id]?.dominant ?? null, sha256: vectors[id] ? sha(JSON.stringify(vectors[id])) : null, verdict: sel.selection.log.find((l) => `C04C-${l.id.replace('C04C-', '')}` === id)?.verdict ?? null }));
w(FAST, '03-VECTORES-Y-REGLAS.json', { schema: 'beM-sim04c-vectors-rules/1', rulesFile: 'plan/selection-rules.json (en la evidencia detallada)', selectionRulesSha256: sel.selectionRulesSha256, rules: rules.rules, agenda: rules.agenda, fixedRows: rules.fixed, stages: sel.stages, omissions: { note: 'ninguna etapa se omitió: se cumplieron las condiciones de I y de P', I: sel.stages.I.condition, P: sel.stages.P.condition }, additionalVectorsExecuted: sel.additionalVectorsExecuted, maxAdditionalVectors: 8, vectors: vecList, finalProvisional: { id: 'C04C-FINAL-PROVISIONAL', basedOn: fin.basedOn, rows: fin.overrides, sha256: sha(rd(join(O, 'vectors/C04C-FINAL-PROVISIONAL.json'))), note: 'candidata provisional elegida solo con CAL; pendiente de Dennis; no activada por defecto' }, aliases: { 'C04C-FINAL-PROVISIONAL': fin.basedOn, FINAL: 'ejecuciones de VAL/CONTRAST/TECH con el vector de ' + fin.basedOn, 'TECH-auto': 'misma ejecución lógica que ' + fin.basedOn + ' en CAL por el recorrido automático (se repitió para el control entre recorridos)' } });
w(FAST, 'ALIAS.csv', csvText(['alias', 'equivale_a', 'nota'], [['C04C-FINAL-PROVISIONAL', fin.basedOn, 'mismo vector completo'], ['FINAL', fin.basedOn, 'identidad de las ejecuciones VAL/CONTRAST/TECH con el vector final'], ['TECH-auto', fin.basedOn + ' (CAL)', 'control entre recorridos; resultado igual al de CAL (12-COMPROBACIONES.json)']]));

// ---------------------------------------------------------------- 04/05/07/08/09/10 desde las tablas del informe
for (const f of ['04-AGENDA-Y-RECUENTO.csv', '04b-RECUENTO-TOTALES.json', '05-RESULTADOS-EQUIPO.csv', '07-VAL-RESUMEN.csv', '07b-VAL-SENALES.json', '08-CONTEXTO-ZONA-CALIDAD.csv.gz', '09-REBOTE-Y-ASISTENCIAS.csv', '10-USO-Y-CONTRASTES.csv']) copyFileSync(join(REP, f), join(FAST, f));
// ---------------------------------------------------------------- 06 selección (numeradores, errores, guardas, M, puntos de trabajo y decisión rederivables)
const slim = (e) => ({ id: e.id, rows: e.rows, comparableCases: e.comparableCases, invariantsOk: e.invariantsOk, sim: e.sim, det: e.det, errors: Object.fromEntries(Object.entries(e.e).filter(([k]) => k !== 'parts').map(([k, v]) => [k, v])), parts: e.e.parts, M: e.M, dominant: e.dominant, comps: e.comps, missing: e.missing, freq40: e.freq40, excluded: e.excluded });
w(FAST, '06-CAL-SELECCION.json', { schema: 'beM-sim04c-cal-selection-delivery/1', selectionRulesSha256: sel.selectionRulesSha256, populations: sel.populations, runs: sel.runs, evaluations: Object.fromEntries(Object.entries(E).map(([k, v]) => [k, slim(v)])), stages: sel.stages, selection: sel.selection, finalProvisional: sel.finalProvisional, note: 'numeradores y denominadores por vector (sim, det); el comprobador offline recalcula errores, M, guardas, puntos de trabajo, condiciones y decisión desde ellos' });

// ---------------------------------------------------------------- 11 rendimiento
const pass = (b, name) => { const p = b.passes.find((x) => x.run === name); const { perCase, ...r } = p; return r; }; const dist = (ms, target) => ({ measuredMs: ms, targetMs: target, distanceMs: Math.round((ms - target) * 10) / 10, met: ms <= target });
const day = bench.DAY.day; const rssDayMiB = bench.DAY.memory.rssMaxMiB; const rssLimit = 1.5 * 1024;
const perf = { schema: 'beM-sim04c-performance/1', note: 'mediciones reales de procesos independientes y secuenciales (sin trabajo simultáneo); la carga son 2.000 clubes con identidades propias, no doce identidades reutilizadas: no es comparable con el benchmark de 04B ni extrapolable a otra máquina',
  machine: { logicalCpus: bench.FINAL.env.logicalCpus, availableParallelism: bench.FINAL.env.availableParallelism, cpuModel: bench.FINAL.env.cpuModel, ramMiB: bench.FINAL.env.ramMiB, node: bench.FINAL.env.node, platform: bench.FINAL.env.platform, kernel: bench.FINAL.env.kernel, workers: 4, runtimeFlags: 'configuración de runtime de los workers existente (sin cambios)' },
  fixtures: { clubs: 2000, archetypes: 12, perAgenda: bench.FINAL.passes[0].fixtures, dayAgendaA: bench.DAY.fixtures, note: 'ids de club y jugador remapeados; atributos y planes de los doce arquetipos sin cambios; un partido por club y agenda; A y B emparejan y siembran distinto' },
  warmup: { casesPerWorker: 12, note: 'calentamiento declarado (partidos de otra serie de semillas por worker), fuera de la agenda; su tiempo está en startup' },
  B04B: { batchA: pass(bench.B04B, 'A'), batchB: pass(bench.B04B, 'B'), startup: bench.B04B.passes[0].startup ?? null, continuous: bench.B04B.continuous, memory: bench.B04B.memory },
  FINAL: { batchA: pass(bench.FINAL, 'A'), batchB: pass(bench.FINAL, 'B'), startup: bench.FINAL.passes[0].startup ?? null, continuous: bench.FINAL.continuous, memory: bench.FINAL.memory },
  day: { identity: 'FINAL', fixtures: bench.DAY.fixtures, summary: (({ barriers, rssAtBarriersMiB, ...x }) => x)(day), memory: bench.DAY.memory },
  objectives: { batchFirstRequestB04B: dist(bench.B04B.passes[0].objective.measuredMs, 5000), batchReusedB04B: dist(bench.B04B.passes[1].objective.measuredMs, 5000), batchFirstRequestFinal: dist(bench.FINAL.passes[0].objective.measuredMs, 5000), batchReusedFinal: dist(bench.FINAL.passes[1].objective.measuredMs, 5000), publicationMaxMs: dist(day.latencies.publicationMs.max, 1000), rssDayMiB: dist(rssDayMiB, rssLimit), note: 'objetivos: 5 s por lote de mil con cuatro workers preparados, 1 s de publicación máxima y 1,5 GiB RSS en la jornada; NINGUNO se redefine como cumplido en caliente; distancia = medido − objetivo' },
  openContinuous: { B04B: bench.B04B.continuous, FINAL: bench.FINAL.continuous, note: 'apertura continua = proceso nuevo → fixtures → workers → agenda A (→ agenda B), sin esperas de orquestación; se informa además del objetivo de fase' },
  loadDifference: 'La diferencia con el benchmark de 04B (F1/F2 4,5 s, F0 7,95 s, publicación 1,36 s, RSS 1,29 GiB) procede sobre todo de la carga: 2.000 clubes y ' + bench.DAY.fixtures.distinctIdentities + ' identidades distintas (equipos y jugadores) en lugar de doce reutilizadas. El control B04B con los mismos fixtures cuesta ' + bench.B04B.passes[0].objective.measuredMs + ' / ' + bench.B04B.passes[1].objective.measuredMs + ' ms (A/B) frente a ' + bench.FINAL.passes[0].objective.measuredMs + ' / ' + bench.FINAL.passes[1].objective.measuredMs + ' ms con 04C: la candidata añade ' + (((bench.FINAL.passes[0].objective.measuredMs / bench.B04B.passes[0].objective.measuredMs - 1) * 100).toFixed(1)) + ' % (A) y ' + (((bench.FINAL.passes[1].objective.measuredMs / bench.B04B.passes[1].objective.measuredMs - 1) * 100).toFixed(1)) + ' % (B); no se atribuye a una regresión de las filas nuevas sin una medición aislada, que no se hizo.' };
w(FAST, '11-RENDIMIENTO.json', perf);

// ---------------------------------------------------------------- 12 comprobaciones
const histSum = { allChecksOk: hist.allChecksOk, scheduled: hist.scheduled, ledgers: Object.fromEntries(Object.entries(hist.ledgers).map(([k, v]) => [k, { accepted: v.accepted, rejected: v.rejected.length, stints: v.stints, resolvers: v.resolvers, reconciliationOk: v.reconciliation.every((c) => c.ok), checksOk: v.checks.every((c) => c.ok) }])), learning: { pairs: hist.learning.pairs.length, rows: hist.learning.rows.length, checks: hist.learning.checks.map((c) => ({ id: c.id, ok: c.ok })) } };
w(FAST, '12-COMPROBACIONES.json', { schema: 'beM-sim04c-checks-delivery/1', campaign: chk, history: histSum, matchday: { allEqual: md.allEqual, comparison: md.comparison, capture: md.captureWithFinishedAndActive, routes: md.routes, otherNeed: md.otherNeed, note: 'jornada mixta de cuatro SIM y un detallado (superconjunto de «un detallado y dos SIM»), con la candidata final; rutas A–D equivalentes' }, tests, browser: { steps: br.pasos, failed: br.fallidos, consoleErrors: br.consolaErrores, networkErrors: br.redErrores, downloads: br.descargas, notRun: br.noEjecutado }, notEvaluated: ['otros navegadores', 'Node 24', 'recorrido manual de Dennis', 'aceptación deportiva', 'validación externa FIBA/ACB (fuera de alcance)'] });

// ---------------------------------------------------------------- 13 límites y decisiones, 00 LEEME, DICCIONARIO
const sig = vF ? valS.signals : null;
w(FAST, '13-LIMITES-Y-DECISIONES.md', `# SIM-MOTOR-04C · límites y decisiones

Nada de lo siguiente es «calibrado», «estadísticamente equivalente» ni «aceptado por Dennis».

## Diferencias residuales (VAL nueva, 48 casos por modelo, misma entrada y semilla)
| error | banda | N04C | candidata | estado |
|---|---:|---:|---:|---|
${['eP', 'eF', 'eZ', 'e2', 'eR', 'eI', 'eQ', 'eA'].map((k) => `| ${k} | ${valS.signals[k].band} | ${f4(valS.signals[k].N04C)} | ${f4(valS.signals[k].FINAL)} | ${valS.signals[k].improves ? 'mejora' : 'empeora'}; ${valS.signals[k].inBand ? 'dentro de banda' : 'FUERA de banda'} |`).join('\n')}
| M | 1 | ${f4(valS.MN04C)} | ${f4(valS.MFINAL)} | ${valS.MFINAL < valS.MN04C ? 'mejora' : 'empeora'}; ${valS.MFINAL <= 1 ? 'dentro' : 'FUERA'} (dominante ${vF.dominant}) |

- Quedan fuera de banda: ${['eP', 'eF', 'eZ', 'e2', 'eR', 'eI', 'eQ', 'eA'].filter((k) => !valS.signals[k].inBand).join(', ')}. **eR empeora en VAL** frente a N04C y supera la banda (en CAL mejoraba): contradicción CAL/VAL declarada, sin reajustar con VAL.
- Las asistencias siguen por debajo del detallado (AST_FG/FGM ${f4(vF.e.parts.simAstPerFgm)} frente a ${f4(vF.e.parts.detAstPerFgm)}); la parte posterior a rebote se acerca, pero el desfase también existe fuera del rebote (ver 09-REBOTE-Y-ASISTENCIAS.csv).
- Los puntos por 40 min siguen por debajo del detallado (${f4(vF.sim.meanPTS40)} frente a ${f4(vF.det.meanPTS40)}).
- El coeficiente conversion.simInsideLogitOffset está en el borde de su rango autorizado (0,30) y es una traducción agregada provisional, no una regla deportiva.
- Robos, libres, ritmo, factor de triples, volumen de controles y plantillas no se calibraron en esta entrega.
- Rendimiento: los tres objetivos (5 s por lote, 1 s de publicación, 1,5 GiB) NO se cumplen con 2.000 clubes (ver 11-RENDIMIENTO.json).
- La campaña usa las ocho plantillas principales; no acredita generalización a otras.

## Preguntas concretas para Dennis / ChatGPT
1. ¿Se acepta C04C-FINAL-PROVISIONAL como punto de partida pese a eA, eZ y eR fuera de banda, o se prefiere conservar N04C?
2. eA (asistencias) persiste: ¿se autoriza actuar sobre la elegibilidad de pase final de las fichas organizadas (no solo tras rebote)?
3. eR empeora en VAL: ¿se autoriza revisar la mezcla de zona aro frente a inside en una entrega nueva (la reserva VAL actual dejaría de ser independiente)?
4. ¿Qué objetivo de rendimiento se mantiene cuando la carga son miles de clubes distintos?

## Estados
Comprobado por Claude: pruebas, campañas, neutralidad, TECH, conciliación, jornada mixta, historia/aprendizaje y recorrido de Chromium. Pendiente de Dennis: aceptación deportiva y recorrido manual. No ejecutado: otros navegadores, Node 24.
`);
w(FAST, '00-LEEME.md', `# SIM-MOTOR-04C · revisión rápida

Entrega: convergencia estadística de SIM con el detallado (rebote ofensivo, oportunidad interior y asistencias). Estado real: **ejecutada, pendiente de Dennis**. PR abierta (https://github.com/bateman37/beM/pull/22), sin fusionar.

## Orden de lectura
1. \`13-LIMITES-Y-DECISIONES.md\` · 2. \`06-CAL-SELECCION.json\` y \`03-VECTORES-Y-REGLAS.json\` · 3. \`07-VAL-RESUMEN.csv\` · 4. \`09-REBOTE-Y-ASISTENCIAS.csv\` · 5. \`08-CONTEXTO-ZONA-CALIDAD.csv.gz\` · 6. \`10-USO-Y-CONTRASTES.csv\` · 7. \`11-RENDIMIENTO.json\` · 8. \`12-COMPROBACIONES.json\` · \`04-AGENDA-Y-RECUENTO.csv\`, \`05-RESULTADOS-EQUIPO.csv\`, \`01-IDENTIDAD.json\`, \`02-CAMBIOS.csv\`, \`ALIAS.csv\`, \`DICCIONARIO.md\`.

## Qué es
- Lectura corregida: canastas con pasador ≠ asistencias acreditadas (en el detallado se leen del acta).
- Mecanismos nuevos (filas neutrales, sin activar por defecto): rama tras rebote ofensivo (\`rebound.organizedResetP0\`), calidad de inside (\`opportunity.simInsideQualityLogit\`) y conversión provisional de inside (\`conversion.simInsideLogitOffset\`).
- Búsqueda limitada solo con CAL (24 casos; reglas congeladas antes): ${sel.additionalVectorsExecuted} vectores completos; punto R = ${sel.stages.R.workingPoint}; etapas I y P ejecutadas; elegido **${fin.basedOn}** (M ${f4(N.M)} → ${f4(P.M)} en CAL; VAL: ${f4(valS.MN04C)} → ${f4(valS.MFINAL)}).
- Neutralidad: con las filas nuevas a 0, 24/24 casos CAL idénticos al código de 04B (huella, acta, zonas y embudo). Detallado intacto (83–98, 6.684 sorteos; 79 archivos).

## Recuento real (ejecuciones SIM / detalladas)
CAL ${sumBlock('sim', 'CAL')} / ${sumBlock('detailed', 'CAL')} · VAL ${sumBlock('sim', 'VAL')} / ${sumBlock('detailed', 'VAL')} · CONTRAST ${sumBlock('sim', 'CONTRAST')} / ${sumBlock('detailed', 'CONTRAST')} · TECH ${sumBlock('sim', 'TECH')} / 0. DIAG = los cuatro primeros casos de VAL (sin ejecuciones extra). Benchmark: 4.000 partidos de lote y 1.000 de jornada (aparte). No hubo fallos ni reintentos.

## Qué NO se evaluó
Aceptación deportiva (Dennis), otros navegadores, Node 24, calibración de robos/libres/ritmo/triples, validación externa. Ver \`13-LIMITES-Y-DECISIONES.md\`.
`);
w(FAST, 'DICCIONARIO.md', rd(join(root, 'docs/tecnico/evidencia-sim-motor04c/DICCIONARIO.md')));

// ---------------------------------------------------------------- evidencia detallada
cp(PLAN, '1-entradas-y-plan/plan'); cp(join(O, 'vectors'), '1-entradas-y-plan/vectores'); cp(join(O, '07-CAL-SELECCION.json'), '1-entradas-y-plan/07-CAL-SELECCION-completo.json'); cp(join(O, '08-VAL-RESUMEN.json'), '1-entradas-y-plan/08-VAL-RESUMEN-completo.json');
for (const f of readdirSync(CAMP)) { if (/^records-.*\.jsonl$/.test(f) || f === 'index.jsonl' || f.startsWith('run-meta') || f === 'incidents.jsonl') cp(join(CAMP, f), `2-registros/${f}`); } cp(join(CAMP, 'diag'), '2-registros/diagnosticos');
for (const f of readdirSync(REP)) if (/^(tabla-|09b|10b|10c)/.test(f)) cp(join(REP, f), `3-tablas/${f}`);
cp(join(O, 'history'), '4-historia-y-jornada/historia'); cp(join(O, 'matchday'), '4-historia-y-jornada/jornada-mixta'); cp(join(O, '12-comprobaciones-campana.json'), '4-historia-y-jornada/12-comprobaciones-campana.json');
cp(join(O, 'bench'), '5-rendimiento-y-pruebas/rendimiento'); cp(join(O, 'navegador'), '5-rendimiento-y-pruebas/navegador'); cp(join(O, 'tests'), '5-rendimiento-y-pruebas/pruebas');
// código: copia suficiente para reproducir lo prometido (no es un checkout completo)
for (const d of ['src', 'data']) cp(join(root, d), `6-codigo/${d}`); for (const d of ['scripts/sim03', 'scripts/sim04b/lib.js', 'scripts/sim04c', 'scripts/node-data.js', 'scripts/dev-server.js', 'scripts/browser/sim04c-recorrido.mjs']) cp(join(root, d), `6-codigo/${d}`);
for (const f of ['package.json', 'tests/sim04c.test.js', 'tests/helpers.js', 'tests/fixtures/sim-snapshot-04b.json']) cp(join(root, f), `6-codigo/${f}`);
rmSync(join(D, '6-codigo/scripts/sim04c/package.js.bak'), { force: true });
w(D, '6-codigo/DEPENDENCIAS.md', `# Código incluido (no es un checkout completo del repositorio)

Incluye \`src/\`, \`data/\`, \`scripts/sim04c/\` (campaña, selector, tablas, informe, empaquetado y comprobador), \`scripts/sim04b/lib.js\` y \`scripts/sim03/\` (dependencias transitivas de \`scripts/sim04c/lib.js\`), \`scripts/node-data.js\`, el recorrido de Chromium, \`package.json\` y la prueba S04C. No incluye documentación del repositorio, otras entregas ni el historial de Git.
`);
w(D, 'REPRODUCIBILIDAD.md', `# Reproducir

Node >= 22, sin dependencias externas. Desde \`6-codigo/\`: \`node scripts/sim04c/exec.mjs --phase=plan\` regenera plan y agenda (compara con \`1-entradas-y-plan/plan\`); \`node scripts/sim04c/calibrate.js --phase=run\` repite la búsqueda CAL (requiere un worktree del commit 48bcdef de 04B para la identidad B04B: \`--root-b04b\`); \`node scripts/sim04c/final-campaign.js\` repite VAL/CONTRAST/TECH; \`node scripts/sim04c/report.js\` regenera las tablas. Las semillas, entradas y huellas están en \`1-entradas-y-plan/plan\`. El comprobador offline no simula: \`node scripts/sim04c/verify-delivery.js --dir=<carpeta de los ZIP>\`.

Alcance: es una copia de código suficiente para reproducir lo prometido, no un checkout. \`out/\` no se conserva en Git: los ZIP entregados son la evidencia.
`);

// ---------------------------------------------------------------- ZIP deterministas con manifiesto
const walk = (d) => readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1)).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const QUICK_LIMIT = 2 * MIB; const DET_LIMIT = 60 * MIB;
async function zipFiles(files, dir, name, part = null, contents = null) {
  const manifest = files.map((f) => { const b = readFileSync(f); return { path: relative(dir, f).split('\\').join('/'), bytes: b.length, sha256: sha(b) }; });
  const zw = new ZipWriter(join(OUT, name), { mtime: new Date('2026-10-24T12:00:00Z') }); await zw.add('MANIFIESTO.json', JSON.stringify({ schema: 'beM-sim04c-zip-manifest/1', zip: name, part, files: manifest }, null, 1));
  for (let i = 0; i < files.length; i++) await zw.add(manifest[i].path, { file: files[i] }); await zw.finish(); const z = readFileSync(join(OUT, name)); return { name, bytes: z.length, sha256: sha(z), entries: manifest.length, contents };
}
const quick = await zipFiles(walk(FAST), FAST, 'SIM-MOTOR-04C-revision-rapida.zip', null, 'tablas y resúmenes para analizar sin abrir toda la evidencia');
const allD = walk(D); const totalD = allD.reduce((a, f) => a + statSync(f).size, 0);
let detailed = [await zipFiles(allD, D, 'SIM-MOTOR-04C-evidencia-detallada.zip', null, 'entradas y plan, registros, diagnósticos, tablas, historia, jornada mixta, rendimiento, pruebas y código')];
if (detailed[0].bytes > DET_LIMIT) { rmSync(join(OUT, detailed[0].name)); const budget = Math.floor(55 * MIB * (totalD / detailed[0].bytes)); const parts = []; let cur = []; let size = 0; for (const f of allD) { const s = statSync(f).size; if (cur.length && size + s > budget) { parts.push(cur); cur = []; size = 0; } cur.push(f); size += s; } if (cur.length) parts.push(cur); detailed = []; for (let i = 0; i < parts.length; i++) detailed.push(await zipFiles(parts[i], D, `SIM-MOTOR-04C-evidencia-detallada-parte${i + 1}de${parts.length}.zip`, `${i + 1}/${parts.length}`, `parte ${i + 1}: ${[...new Set(parts[i].map((f) => relative(D, f).split('/')[0]))].join(', ')}`)); }
writeFileSync(join(OUT, 'SIM-MOTOR-04C-indice-partes.json'), JSON.stringify({ schema: 'beM-sim04c-index/1', delivery: 'SIM-MOTOR-04C', codeFrozen: { cal: fz.cal.codeCommit, val: fz.val.codeCommit }, head: HEAD, codeCommit: CODE, workingTreeChangesAtPackaging: DIRTY, quick, quickLimitBytes: QUICK_LIMIT, quickWithinLimit: quick.bytes <= QUICK_LIMIT, detailed, detailedLimitBytes: DET_LIMIT, detailedWithinLimit: detailed.every((z) => z.bytes <= DET_LIMIT), notFullCheckout: true,
  identities: { app: fz.val.versions.app, sim: fz.val.versions.sim, profile: fz.val.versions.simProfile, candidate: 'C04C-FINAL-PROVISIONAL', dataset: 'beM-lab-referencia', statsPolicy: fz.val.versions.statsPolicy, formats: { result: fz.val.versions.resultSchema, snapshot: fz.val.versions.snapshotSchema, essential: 'beM-sim-essential/2', package: 'beM-sim04c-zip-manifest/1' } }, sendOrder: ['SIM-MOTOR-04C-revision-rapida.zip', 'SIM-MOTOR-04C-indice-partes.json', 'SIM-MOTOR-04C-verificacion-final.json', ...detailed.map((z) => z.name)] }, null, 1));
console.log(JSON.stringify([quick, ...detailed].map((z) => [z.name, `${(z.bytes / MIB).toFixed(2)} MiB`, z.entries])));
