// SIM-MOTOR-04D · empaquetado de la entrega (§12). Todo sale de ejecuciones REALES ya hechas (nada se fabrica ni se calibra): este script solo ensambla, resume mecánicamente y comprime. No cambia ningún resultado.
//   node scripts/sim04d/package.js [--out=out/sim-motor04d/entrega-final]
// Genera SIM-MOTOR-04D-revision-rapida.zip (≤ 3 MiB), SIM-MOTOR-04D-evidencia-detallada.zip (partes ≤ 60 MiB con índice) y SIM-MOTOR-04D-indice-partes.json. El recibo SIM-MOTOR-04D-verificacion-final.json lo escribe verify-delivery.js
// FUERA de los ZIP comprobados. El paquete NO es un checkout completo del repositorio: contiene el código y los datos que la evidencia necesita y declara cómo reproducir.
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync, cpSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { ZipWriter } from '../../src/batch/zip.js';
import { readJsonl, csvText } from './tables.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const O = join(root, 'out/sim-motor04d'); const OUT = arg('out', join(O, 'entrega-final')); const PLAN = join(root, 'docs/tecnico/evidencia-sim-motor04d/plan'); const REP = join(O, 'report'); const CAMP = join(O, 'campaign');
const STAGE = join(O, 'stage'); const FAST = join(STAGE, 'rapida'); const D = join(STAGE, 'detallada'); rmSync(STAGE, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true }); mkdirSync(FAST, { recursive: true }); mkdirSync(D, { recursive: true }); mkdirSync(OUT, { recursive: true });
const sh = (c) => execSync(c, { cwd: root, maxBuffer: 1 << 29 }).toString().trim(); const sha = (b) => createHash('sha256').update(b).digest('hex'); const rd = (p) => readFileSync(p, 'utf8'); const rj = (p) => JSON.parse(rd(p)); const exists = existsSync;
const w = (dir, rel, content) => { const p = join(dir, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, typeof content === 'string' || Buffer.isBuffer(content) ? content : JSON.stringify(content, null, 1)); return p; };
const cp = (src, dst, base = D) => { if (!exists(src)) return false; const p = join(base, dst); mkdirSync(dirname(p), { recursive: true }); cpSync(src, p, { recursive: true }); return true; };
const MIB = 2 ** 20; const f3 = (x) => (x == null ? 'n/d' : (+x).toFixed(3)); const pc = (x) => (x == null ? 'n/d' : `${(100 * x).toFixed(2)} %`); const pp = (x) => (x == null ? 'n/d' : `${(100 * x).toFixed(2)} pp`);
const HEAD = sh('git rev-parse HEAD'); const SPORT = sh('git log -1 --format=%H -- src/sim/model.js src/sim/engine.js src/sim/profile.js src/sim/attribution.js'); const DIRTY = sh('git status --porcelain -- src data scripts tests package.json').split('\n').filter(Boolean).length;
const fz = { dev: rj(join(PLAN, 'freeze-dev.json')), val: rj(join(PLAN, 'freeze-val.json')), devAtVal: rj(join(PLAN, 'freeze-dev-verify-at-val.json')) }; const plan = rj(join(PLAN, 'plan.json')); const rules = rj(join(PLAN, 'selection-rules.json')); const sel = rj(join(O, '11-SELECCION-DEV.json'));
const m04d = rj(join(REP, '06b-M04D.json')); const checks = rj(join(O, '13-comprobaciones-campana.json')); const valSum = rj(join(O, 'val-campaign-summary.json')); const bench = { C0: rj(join(O, 'bench/C0-CLUBS.json')), FINAL: rj(join(O, 'bench/FINAL-CLUBS.json')), DAY: rj(join(O, 'bench/FINAL-DAY.json')) };
const hist = rj(join(O, 'history/11-APRENDIZAJE-E-HISTORIA.json')); const md = rj(join(O, 'matchday/jornada-mixta.json')); const tests = exists(join(O, 'tests/resumen-pruebas.json')) ? rj(join(O, 'tests/resumen-pruebas.json')) : null; const nav = exists(join(O, 'navegador/resumen.json')) ? rj(join(O, 'navegador/resumen.json')) : null;
const vectors = Object.fromEntries(readdirSync(join(O, 'vectors')).filter((f) => f.endsWith('.json')).map((f) => [f.replace('.json', ''), rj(join(O, 'vectors', f))]));
const alias = valSum.alias === true; const candIdent = alias ? 'C0_04C' : 'CAND'; const cand = vectors['C04D-FINAL-PROVISIONAL'];

// ---------------------------------------------------------------- 01 identidad
const identity = { schema: 'beM-sim04d-identity/1', delivery: 'SIM-MOTOR-04D', pr: process.env.SIM04D_PR ?? null, branch: sh('git rev-parse --abbrev-ref HEAD'), base: { main: sh('git rev-parse origin/main'), pr22: 'fusionada (merge 0dad893); 04D parte de main y reutiliza el nombre de rama' }, headAtPackaging: HEAD, treeDirtyFiles: DIRTY,
  sportCodeCommit: { value: SPORT, note: 'último commit que modificó los mecanismos deportivos (model/engine/profile/attribution); la candidata y las herramientas se congelaron después' },
  freezes: { dev: { codeCommit: fz.dev.codeCommit, frozenAt: fz.dev.frozenAt, selectionRulesSha256: sel.selectionRulesSha256, note: 'reglas, 36 vectores, agenda y hash congelados ANTES de ejecutar DEV' }, devVerifiedAtVal: { ok: fz.devAtVal.ok, note: 'la congelación de DEV se verificó antes de VAL: nada deportivo cambió' }, val: { codeCommit: fz.val.codeCommit, frozenAt: fz.val.frozenAt, note: 'código y candidata congelados ANTES de la reserva VAL04D' } },
  versions: fz.val.versions, detailedReference: fz.val.detailedReference, detailedSportFiles: { count: fz.val.detailedSportFiles.count, changedVsBase: fz.val.detailedSportFiles.changedVsBase, base: fz.val.base, note: 'src/match, src/population, src/knowledge y data/match idénticos a main' },
  profiles: { baseProfile: fz.val.versions.simProfile, profileFingerprint: fz.val.versions.effectiveProfileFingerprint, candidate: 'C04D-FINAL-PROVISIONAL (CAND-SIM04D-20261024-R1)', candidateParent: cand.parent, aliasOfControl: alias }, node: process.version };
w(FAST, '01-IDENTIDAD.json', identity);

// ---------------------------------------------------------------- 02 cambios (lectura, crédito, mecanismo, fila, efecto, neutralidad)
const cambios = [['id', 'tipo', 'cambio', 'efecto', 'neutralidad_o_comprobacion'],
  ['D04-01a', 'lectura', 'La continuación inmediata tras rebote ofensivo (`src: putback`) se atribuye a la familia `putback` y no a la ficha POS cuya celda aproxima el tiro (tiros, canasta con falta, falta de tiro sin intento, serie de libres ligada); el reinicio organizado conserva su ficha', 'Cambia SOLO la lectura (familias, participación, conciliación R19); no cambia participantes, decisiones, probabilidades ni sorteos', 'S04D-01 (huellas y sorteos de 04C) y S04D-02; 48/48 DEV idénticos a los registros auténticos de 04C (13-COMPROBACIONES)'],
  ['D04-01b', 'lectura', 'El auxiliar diag-context lee la asistencia del detallado del crédito del acta; columnas separadas de pasador representado, elegibilidad, entrega y AST acreditada; AST a libres y total beM nombrados', 'Lectura', 'S04D-03'],
  ['D04-01c', 'lectura', 'Corrección de notas: VAL tenía doce equipos; 1.540,5 MiB = 1,5044 GiB (exceso de 4,5 MiB sobre 1,5 GiB)', 'Documentación', 'docs/tecnico/sim-motor04d.md'],
  ['D04-02', 'lectura', 'Instrumentos de oportunidades y créditos de rebote (fallos de campo válidos, tapón fuera/vivo, falta de tiro sin FGA, último libre fallado, créditos por causa/sentido/individual-colectivo; en el detallado, causas sin crédito leídas de la secuencia)', 'Lectura. Sin corrección deportiva: la diferencia de criterio (tapón con balón vivo, expiración tras fallo) se documenta y se conservan ambos conteos', 'S04D-04'],
  ['D04-02b', 'lectura', 'Universos de AST a canasta separados: total, fuera del rebote, posterior a rebote ofensivo y, de este, inmediata y reinicio (aproximado en el detallado)', 'Lectura', 'S04D-03'],
  ['D04-02c', 'lectura', 'Denominador elegible del robo (pérdidas ordinarias y balón suelto frente a falta ofensiva y violación)', 'Lectura', 'S04D-06'],
  ['D04-03a', 'fila', 'shotMix.midrangeWeightFactor (neutral 1; [0,25; 2])', 'Peso de celdas de media existentes, una vez por contexto, masa conservada', 'S04D-01/05'],
  ['D04-03b', 'fila', 'conversion.simRimLogitOffset (neutral 0; [0; 0,25] logit)', 'Offset único del logit de conversión al aro y de su estimación previa', 'S04D-01/05'],
  ['D04-03c', 'fila', 'outcomes.simOrdinaryTurnoverWeightFactor (neutral 1; [0,6; 1,2])', 'Peso de la pérdida ordinaria antes de normalizar terminales', 'S04D-01/06'],
  ['D04-03d', 'fila', 'outcomes.simStealGivenEligibleTurnoverLogit (neutral 0; [0; 1] logit)', 'Robo condicionado a pérdida elegible', 'S04D-01/06'],
  ['D04-03e', 'fila', 'outcomes.simShootingFoulWeightFactor (neutral 1; [0,8; 1,3])', 'Peso de la falta en tiro antes de normalizar; razón de faltas no terminales coherente', 'S04D-01/06'],
  ['D04-03f', 'fila', 'assist.spontaneousPassOddsFactor (neutral 1; [1; 2])', 'Odds de entrega elegible espontánea: odds(p\') = odds(p) × factor', 'S04D-01/06'],
  ['D04-03g', 'reapertura', 'assist.receivedAdvantageP0 pasa a [0, 1] (antes [0, 1))', 'Solo salidas ya acreditadas por el catálogo; sin reclasificar', 'S04D-05'],
  ['D04-04', 'metadato', 'APP SIM-MOTOR-04D · SIM 0.3.3-SIMMOTOR04D · perfil …+SEM-SIM04D-20261024 · cobertura COV-SIM04D-R1 · conciliación RECON-SIM04D-R1; los guardados de 04C se rechazan con explicación', 'Identidad visible', 'S04D-08 (guardado real de 04C)'],
  ['D04-05', 'búsqueda', `Búsqueda conjunta de 36 vectores completos sobre DEV: ${sel.selection.reason}`, 'Candidata provisional C04D-FINAL-PROVISIONAL = Z0-A0 (alias del control); no activada por defecto', '11-SELECCION-DEV.json']];
w(FAST, '02-CAMBIOS.csv', csvText(cambios[0], cambios.slice(1)));

// ---------------------------------------------------------------- 03 vectores y reglas
w(FAST, '03-VECTORES-Y-REGLAS.json', { schema: 'beM-sim04d-vectors-rules/1', rulesFile: 'plan/selection-rules.json (en la evidencia detallada)', selectionRulesSha256: sel.selectionRulesSha256, rules: rules.rules, vectors: rules.vectors, identities: rules.identities, candidate: { id: 'C04D-FINAL-PROVISIONAL', parent: cand.parent, overrides: cand.overrides }, selection: { chosen: sel.selection.chosenId, kept: sel.selection.kept, reason: sel.selection.reason, control: sel.selection.control, best: sel.selection.best }, valUse: 'VAL04D no eligió ni reajustó nada' });
// ---------------------------------------------------------------- 04 agenda y recuento (reconstruido de agenda, índice y registros)
{ const { loadAgenda } = await import('./exec.mjs'); const { agenda } = loadAgenda(PLAN); const index = readJsonl(join(CAMP, 'index.jsonl')); const incidents = exists(join(CAMP, 'incidents.jsonl')) ? readJsonl(join(CAMP, 'incidents.jsonl')) : [];
  const recFiles = readdirSync(CAMP).filter((f) => f.startsWith('records-')); const latest = new Map(); for (const f of recFiles) for (const r of readJsonl(join(CAMP, f))) { const k = `${r.resolver}|${r.run}|${r.block}|${r.case_id}`; const p = latest.get(k); if (!p || (r.attempt ?? 1) >= (p.attempt ?? 1)) latest.set(k, r); }
  const cols = ['section', 'block', 'resolver', 'identity', 'case_id', 'seed', 'seed_key', 'entry_id', 'input_hash', 'level', 'requested', 'executed', 'finished', 'valid', 'invalid', 'failed', 'interrupted', 'retried', 'not_executed', 'reused_from', 'status', 'note']; const rows = []; const groups = new Map();
  for (const r of latest.values()) { const g = `${r.block}|${r.resolver}|${r.run}`; (groups.get(g) ?? groups.set(g, []).get(g)).push(r); }
  for (const [g, recs] of [...groups].sort()) { const [block, resolver, identity] = g.split('|'); const wanted = [...agenda.values()].filter((a) => (block === 'TECH' ? a.tech === '1' : a.block === block) && (resolver === 'sim' || a.anchor === '1')); const ix = index.filter((x) => x.identity === identity && x.block === block && x.resolver === resolver);
    const finished = recs.filter((r) => r.status === 'finished').length; const valid = recs.filter((r) => r.valid).length; const failed = recs.filter((r) => r.status === 'failed').length; const interrupted = ix.filter((x) => x.status === 'interrupted').length; const retried = ix.filter((x) => x.status === 'started' && (x.attempt ?? 1) > 1).length; const reused = recs.filter((r) => r.reused_from).length;
    const requested = block === 'TECH' ? wanted.length * 1 : wanted.length; rows.push(['count', block, resolver, identity, null, null, null, null, null, 'esencial+registro de campaña', requested, recs.length, finished, valid, finished - valid, failed, interrupted, retried, Math.max(0, requested - recs.length), reused, null, reused ? `${reused} registros reutilizados de SIM-MOTOR-04C` : null]);
    for (const r of recs.sort((a, b) => (a.case_id < b.case_id ? -1 : 1))) { const a = agenda.get(r.case_id); rows.push(['case', block, resolver, identity, r.case_id, a?.seed ?? r.seed, a?.seed_key ?? null, a?.entry_id ?? r.entry_id, a?.input_hash ?? r.input_hash, null, 1, 1, r.status === 'finished' ? 1 : 0, r.valid ? 1 : 0, r.status === 'finished' && !r.valid ? 1 : 0, r.status === 'failed' ? 1 : 0, 0, (r.attempt ?? 1) > 1 ? 1 : 0, 0, r.reused_from ?? a?.reused_from ?? null, r.status, r.error ?? null]); } }
  for (const i of incidents) rows.push(['incident', i.block, null, i.identity, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, JSON.stringify(i).slice(0, 300)]);
  w(FAST, '04-AGENDA-Y-RECUENTO.csv', csvText(cols, rows));
  const total = { sim: 0, detailed: 0 }; const by = {}; for (const r of rows.filter((x) => x[0] === 'count')) { total[r[2]] += r[11]; const k = `${r[2]}|${r[1]}`; by[k] = (by[k] ?? 0) + r[11]; } w(FAST, '04b-RECUENTO-TOTALES.json', { executedByModelAndBlock: by, totalsByModel: total, note: 'ejecuciones SIM/DET registradas por bloque (incluye registros reutilizados de 04C, identificados en la columna reused_from); suite, navegador y benchmark son extras separados' }); }

// ---------------------------------------------------------------- 05–10 desde el informe
const fastMain = ['05-ACTA-EQUIPOS.csv', '06-COMPARATIVA-ACTA.csv', '06b-M04D.json', '07-TIRO-Y-ZONAS.csv', '08-REBOTES-Y-RECUPERACIONES.csv', '09-ASISTENCIAS.csv', '10-EQUIPOS-USO-Y-DISTRIBUCION.csv', '10b-BANDAS-DE-PUNTOS.csv', '10c-CONTRASTES.csv', '10d-CONTRASTES-AGREGADO.csv', '10e-JERARQUIA.csv'];
// el paquete rápido conserva las identidades principales (DET, control/candidata, Z0-A0 y C0 auténtico); las 36 filas de los vectores viven en 11-SELECCION-DEV.json (numeradores) y en la evidencia detallada
{ const keep = new Set(['DET', 'C0_04C', 'Z0-A0', 'C0_AUTH_04C', 'CAND', 'TECH-auto']); const csvIn = (n) => { const t = rd(join(REP, n)).split('\n'); return { head: t[0], rows: t.slice(1).filter(Boolean) }; };
  const idcol = { '05-ACTA-EQUIPOS.csv': 'identity' };
  for (const f of fastMain) { if (f === '05-ACTA-EQUIPOS.csv') { const { head, rows } = csvIn(f); const hs = head.split(','); const ii = hs.indexOf('identity'); const out = rows.filter((l) => keep.has(l.split(',')[ii])); w(FAST, f, [head, ...out].join('\n') + '\n'); } else cp(join(REP, f), f, FAST); }
  void idcol; }
// ---------------------------------------------------------------- 11 selección DEV (numeradores, errores, guardas, M04D y descarte de cada vector)
const slimEval = (e) => ({ id: e.id, comparableCases: e.comparableCases, invariantsOk: e.invariantsOk, sim: e.sim, det: e.det, errors: e.errs, eZ: e.eZ, M04D: e.M04D, M04D_comparable: e.M04D_comparable, outOfBand: e.outOfBand, outOfBandComparable: e.outOfBandComparable });
w(FAST, '11-SELECCION-DEV.json', { schema: 'beM-sim04d-dev-selection-delivery/1', selectionRulesSha256: sel.selectionRulesSha256, rules: sel.rules, populations: sel.populations, runs: sel.runs, reuse: sel.reuse, evaluations: Object.fromEntries(Object.entries(sel.evaluations).map(([k, v]) => [k, slimEval(v)])), c0_04C: slimEval(sel.c0_04C), selection: sel.selection, finalProvisional: sel.finalProvisional });
// ---------------------------------------------------------------- 12 rendimiento
const pass = (b, name) => { const p = b.passes.find((x) => x.run === name); const { perCase, ...r } = p; return r; }; const dist = (ms, target) => ({ measuredMs: ms, targetMs: target, distanceMs: Math.round((ms - target) * 10) / 10, met: ms <= target });
const day = bench.DAY.day; const rssLimit = 1536; const rssDay = bench.DAY.memory.rssMaxMiB;
const perf = { schema: 'beM-sim04d-performance/1', note: 'mediciones reales de procesos independientes y secuenciales (sin trabajo simultáneo); un lote de mil por identidad (control C0_04C y candidata) y una jornada de mil final = 3.000 ejecuciones de rendimiento; no incluye caché de resultados ni se extrapola a otra máquina',
  machine: { logicalCpus: bench.FINAL.env.logicalCpus, availableParallelism: bench.FINAL.env.availableParallelism, cpuModel: bench.FINAL.env.cpuModel, ramMiB: bench.FINAL.env.ramMiB, node: bench.FINAL.env.node, platform: bench.FINAL.env.platform, kernel: bench.FINAL.env.kernel, workers: 4 },
  fixtures: { clubs: 2000, players: 24000, archetypes: 12, perAgenda: bench.FINAL.passes[0].fixtures, dayAgendaA: bench.DAY.fixtures, note: 'ids de club y de jugador remapeados por agenda; un partido por club' },
  C0_04C: { batch: pass(bench.C0, 'A'), startup: bench.C0.passes[0].startup ?? null, continuous: bench.C0.continuous, memory: bench.C0.memory }, FINAL: { batch: pass(bench.FINAL, 'A'), startup: bench.FINAL.passes[0].startup ?? null, continuous: bench.FINAL.continuous, memory: bench.FINAL.memory },
  day: { identity: 'FINAL', fixtures: bench.DAY.fixtures, summary: (({ barriers, rssAtBarriersMiB, ...x }) => x)(day), memory: bench.DAY.memory },
  objectives: { batchControl: dist(bench.C0.passes[0].objective.measuredMs, 5000), batchFinal: dist(bench.FINAL.passes[0].objective.measuredMs, 5000), publicationMaxMs: dist(day.latencies.publicationMs.max, 1000), rssDayMiB: dist(rssDay, rssLimit), note: 'objetivos conservados: 5 s por lote de mil con pool preparado, 1 s de publicación máxima y 1.536 MiB (1,5 GiB) de RSS en la jornada; distancia = medido − objetivo; no se abre otra ronda de optimización' },
  executions: { batchControl: 1000, batchFinal: 1000, day: 1000, total: 3000, limit: 3000 },
  comparison: { batchFinalVsControlPct: Math.round((bench.FINAL.passes[0].objective.measuredMs / bench.C0.passes[0].objective.measuredMs - 1) * 1000) / 10, note: 'misma máquina, misma carga y agenda; la diferencia entre sesiones no se atribuye a una fila sin medición aislada' } };
w(FAST, '12-RENDIMIENTO.json', perf);
// ---------------------------------------------------------------- 13 comprobaciones
w(FAST, '13-COMPROBACIONES.json', { schema: 'beM-sim04d-checks-delivery/1', campaign: checks, historyAndLearning: { allChecksOk: hist.allChecksOk, learning: hist.learning?.checks ?? null, scheduled: hist.scheduled, missing: hist.missingResults?.length ?? null }, matchday: { ok: md.allEqual ?? null, captureWithFinishedAndActive: md.captureWithFinishedAndActive ?? null, routes: md.routes ? Object.keys(md.routes) : null }, tests, browser: nav });

// ---------------------------------------------------------------- 14 límites y decisiones (generado desde los datos)
const VALK = (id) => m04d.byBlockAndCondition[`VAL|${id}`]; const DEVK = (id) => m04d.byBlockAndCondition[`DEV|${id}`]; const v = VALK(candIdent) ?? VALK('CAND');
const oob = (x) => (x?.outOfBand ?? []).map((e) => `${e.id} (${e.kind === 'count' ? pc(e.error) : pp(e.error)} frente a ±${e.kind === 'count' ? '5 %' : '3 pp'})`).join('; ') || 'ninguna';
const best = sel.selection.rows.filter((r) => r.M != null).sort((a, b) => a.M - b.M).slice(0, 5).map((r) => `${r.id} (M04D_comparable ${f3(r.M)}, dominante ${r.dominant}; descartado: ${r.reasons.join(' | ')})`).join('\n- ');
const limites = `# SIM-MOTOR-04D · límites, métricas fuera de banda y decisiones pendientes

**Estado**: ejecutado, pendiente de Dennis. Nada de lo que sigue está «calibrado», «estadísticamente equivalente», «aceptado por Dennis», «conforme FIBA integralmente» ni constituye un «motor cerrado».

## 1. Resultado de la búsqueda (solo DEV conocido; reglas congeladas antes)
${sel.selection.reason}.

Control Z0-A0 (= vector de 04C con los mecanismos nuevos neutrales): M04D_comparable ${f3(sel.selection.control.M)} (dominante ${sel.selection.control.dominant}); M04D completo ${f3(DEVK('Z0-A0')?.M04D?.partialM)} (**no evaluable** por la discrepancia de criterio de rebote, ver §3). **M04D > 1 implica que alguna banda sigue incumplida.**

Mejores descartados (causa exacta en 11-SELECCION-DEV.json):
- ${best}

## 2. Bandas incumplidas
DEV (48 casos, control): ${oob(DEVK('Z0-A0'))}.

VAL04D (96 encuentros, candidata = control): ${oob(v)}.

## 3. Discrepancia de criterio de rebote (D04-02)
En el detallado (\`src/match/actions.js::resolveBlocked\`) un tapón con balón vivo se resuelve como recuperación de control sin crédito de rebote (ni ofensivo ni defensivo) y un fallo seguido de expiración de posesión tampoco recibe crédito; en SIM todo fallo con oportunidad produce un crédito (incluido el tapón con balón vivo). Ver 08-REBOTES-Y-RECUPERACIONES.csv. La política estadística vigente (c20-p03 §20.13) dice que «el desenlace del balón después del tapón se determina aparte» y no fija un crédito: **no es un defecto normativo demostrado**. No se modificó el detallado ni se redujeron rebotes legítimos de SIM: se conservan ambos conteos, ORB, DREB y rebotes totales quedan **fuera de M04D_comparable** y su criterio queda **pendiente de decisión**.

## 4. Otras limitaciones
- La candidata coincide con el control: ningún vector de §7 mejoró de forma admisible; los ajustes de circulación y terminales mejoran el máximo pero dañan métricas ya dentro de banda (cuota inside, FGA, 3P%…).
- DEV no es una reserva independiente (ya analizada). VAL04D usa fichas y planes naturales; dieciséis actuaciones por equipo no certifican una clasificación.
- La correspondencia inmediata/reinicio del detallado es aproximada (contexto continuidad frente a otro tras el primer rebote ofensivo de la posesión).
- La atribución de familias cambia solo en la lectura (la continuación inmediata es \`putback\`).
- El rendimiento no cumple los objetivos con 2.000 clubes (ver 12-RENDIMIENTO.json); no se abrió otra optimización.

## 5. Decisiones pendientes (DECISIÓN REQUERIDA)
1. Criterio de crédito de rebote tras tapón con balón vivo y tras expiración: documentar y decidir si el detallado o SIM cambian.
2. Si se acepta el control de 04C (D0_04D ≡ C0_04C en trayectoria) como referencia provisional o se autoriza otra ronda con guardas distintas.
3. Objetivo de rendimiento con miles de clubes.
`;
w(FAST, '14-LIMITES-Y-DECISIONES.md', limites);
w(FAST, 'DICCIONARIO.md', rd(join(root, 'docs/tecnico/evidencia-sim-motor04d/DICCIONARIO.md')));

// ---------------------------------------------------------------- 00 léeme
const dev = DEVK('Z0-A0'); const valC0 = VALK('C0_04C'); const leeme = `# SIM-MOTOR-04D · revisión rápida

Estado real: **ejecutado, pendiente de Dennis**. Comparación de actas SIM–detallado con ±5 % relativo en conteos (medias por actuación de equipo normalizadas a 40 minutos) y ±3 puntos porcentuales en acierto; cuotas de zona con guarda funcional provisional de ±3 pp.

## Orden de lectura
1. \`14-LIMITES-Y-DECISIONES.md\` · 2. \`06-COMPARATIVA-ACTA.csv\` (y \`06b-M04D.json\`) · 3. \`11-SELECCION-DEV.json\` y \`03-VECTORES-Y-REGLAS.json\` · 4. \`07\` tiro y zonas · 5. \`08\` rebotes · 6. \`09\` asistencias · 7. \`10\` equipos/uso · 8. \`12\` rendimiento · 9. \`13\` comprobaciones · 10. \`01\`, \`02\`, \`04\`, \`05\`, \`DICCIONARIO.md\`.

## Referencias
- Detallado congelado: ${fz.val.detailedReference.score.join('–')} y ${fz.val.detailedReference.sportingDraws} sorteos (referencia 20261016); 79 archivos deportivos sin cambios.
- C0_04C = código y perfil deportivo de 04C (C04C-FINAL-PROVISIONAL). D0_04D = Z0-A0 (04D con los seis mecanismos nuevos neutrales). Trayectoria idéntica: ${checks.neutrality.identicalSportFingerprintBoxZonesFunnelDraws}/${checks.neutrality.comparedCases} casos DEV frente a los registros auténticos de 04C.
- Candidata: C04D-FINAL-PROVISIONAL = ${cand.parent} (${alias ? 'alias del control' : 'vector distinto del control'}). No se activa por defecto.

## Resultado en una línea
Búsqueda de 36 vectores: ${sel.selection.reason}. M04D_comparable del control: DEV ${f3(dev?.M04D_comparable?.M)} · VAL04D ${f3(v?.M04D_comparable?.M)} (dominante ${v?.M04D_comparable?.dominant}). M04D > 1: alguna banda sigue incumplida.

## Límites
Ver \`14-LIMITES-Y-DECISIONES.md\`. Los archivos con hashes correctos no acreditan estadísticas realistas ni un motor calibrado. La evidencia detallada contiene entradas, perfiles, registros esenciales, diagnósticos seleccionados, instrumentos (código necesario, no un checkout completo), resultados de pruebas y medición bruta.
`;
w(FAST, '00-LEEME.md', leeme);

// ================================================================ evidencia detallada
cp(PLAN, '1-entradas-y-plan/plan'); cp(join(O, 'vectors'), '1-entradas-y-plan/vectors');
for (const f of readdirSync(CAMP)) { const p = join(CAMP, f); if (f.startsWith('records-') && f.endsWith('.jsonl')) w(D, `2-registros/${f}.gz`, gzipSync(readFileSync(p), { level: 6 })); else if (f === 'index.jsonl' || f === 'incidents.jsonl' || f.startsWith('run-meta-') || f === 'reuse-report.json') cp(p, `2-registros/${f}`); }
cp(join(CAMP, 'diag'), '3-diagnostico');
for (const f of ['src/sim', 'src/version.js', 'scripts/sim04d', 'tests/sim04d.test.js', 'scripts/node-data.js', 'package.json']) cp(join(root, f), `4-instrumentos/${f}`);
cp(REP, '5-tablas'); cp(join(O, 'tests'), '6-pruebas'); cp(join(O, 'navegador'), '6-pruebas/navegador'); cp(join(O, 'bench'), '7-rendimiento'); cp(join(O, 'history'), '8-historia-y-jornada/history'); cp(join(O, 'matchday'), '8-historia-y-jornada/matchday'); cp(join(O, '13-comprobaciones-campana.json'), '6-pruebas/13-comprobaciones-campana.json'); cp(join(O, '11-SELECCION-DEV.json'), '1-entradas-y-plan/11-SELECCION-DEV.json');
w(D, '0-LEEME-EVIDENCIA.md', `# SIM-MOTOR-04D · evidencia detallada\n\nEntradas congeladas y plan (1), registros esenciales de campaña (2, JSONL comprimidos por identidad: DET, C0_04C, los 36 vectores y TECH), diagnósticos de las cuatro primeras entradas (3), instrumentos —código y datos necesarios, NO un checkout completo— (4), tablas completas (5), resultados de pruebas (6), medición bruta de rendimiento (7) e historia/jornada (8).\n\nReproducción: \`node scripts/sim04d/exec.mjs --phase=run --block=DEV --identity=<vector> --overrides=1-entradas-y-plan/vectors/<vector>.json\` con el repositorio beM en el commit congelado (${fz.val.codeCommit}). El código aquí incluido es el necesario para leer y comprobar la evidencia; no sustituye al repositorio.\n`);

// ---------------------------------------------------------------- partes y manifiestos
const walk = (dir, out = []) => { for (const n of readdirSync(dir).sort()) { const p = join(dir, n); if (statSync(p).isDirectory()) walk(p, out); else out.push(p); } return out; };
async function zipFiles(files, base, name, part = null, extra = {}) { const manifest = []; const zw = new ZipWriter(join(OUT, name), { mtime: new Date('2026-10-24T12:00:00Z') }); const items = [];
  for (const f of files) { const rel = relative(base, f).split('\\').join('/'); const b = readFileSync(f); manifest.push({ path: rel, bytes: b.length, sha256: sha(b) }); items.push([rel, f]); }
  await zw.add('MANIFIESTO.json', JSON.stringify({ schema: 'beM-sim04d-zip-manifest/1', zip: name, part, files: manifest, ...extra }, null, 1)); for (const [rel, f] of items) await zw.add(rel, { file: f }); await zw.finish(); const buf = readFileSync(join(OUT, name)); return { name, bytes: buf.length, sha256: sha(buf), files: manifest.length, part }; }
const LIM = 60 * MIB; const detFiles = walk(D); const parts = []; let cur = []; let curBytes = 0; for (const f of detFiles) { const sz = statSync(f).size; if (cur.length && curBytes + sz > LIM * 0.92) { parts.push(cur); cur = []; curBytes = 0; } cur.push(f); curBytes += sz; } if (cur.length) parts.push(cur);
const quick = await zipFiles(walk(FAST), FAST, 'SIM-MOTOR-04D-revision-rapida.zip'); const detailed = []; for (let i = 0; i < parts.length; i++) detailed.push(await zipFiles(parts[i], D, parts.length === 1 ? 'SIM-MOTOR-04D-evidencia-detallada.zip' : `SIM-MOTOR-04D-evidencia-detallada.parte${i + 1}.zip`, i + 1, { parts: parts.length }));
const index = { schema: 'beM-sim04d-parts-index/1', delivery: 'SIM-MOTOR-04D', generatedAt: new Date().toISOString(), headAtPackaging: HEAD, sportCodeCommit: SPORT, versions: fz.val.versions, quick: { ...quick, limitBytes: 3 * MIB }, quickWithinLimit: quick.bytes <= 3 * MIB, detailed, detailedWithinLimit: detailed.every((z) => z.bytes <= LIM), notFullCheckout: true,
  contents: { quick: readdirSync(FAST).sort(), detailedParts: detailed.map((z) => ({ name: z.name, files: z.files })) }, note: 'El recibo de verificación vive fuera de los ZIP comprobados: SIM-MOTOR-04D-verificacion-final.json' };
writeFileSync(join(OUT, 'SIM-MOTOR-04D-indice-partes.json'), JSON.stringify(index, null, 1)); console.log(JSON.stringify({ out: OUT, quick: { bytes: quick.bytes, within: index.quickWithinLimit }, detailed: detailed.map((z) => ({ name: z.name, bytes: z.bytes })), detailedWithinLimit: index.detailedWithinLimit }));
