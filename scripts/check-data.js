// Comprobación de datos (§10.1): legibilidad, 32 capacidades, 144 IDs únicos, doce plazas, rangos, sumas y
// referencias de los dos escenarios activos; coincidencia con el catálogo de hashes y con el anexo del prompt archivado.
// Uso: node scripts/check-data.js [--write-catalog]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, PROFILE_PATH, PLAYERS_PATH, EXTENSION_PATH, EXTENSION3_PATH, EXTENSION4_PATH, EXTENSION5_PATH, EXTENSION6_PATH, EXTENSION7_PATH, EXTENSION8_PATH, EXTENSION9_PATH, EXTENSION10_PATH, EXTENSION11_PATH, EXTENSION12_PATH, EXTENSION13_PATH, EXTENSION14_PATH, loadData } from './node-data.js';
import { validateProfileAndFixtures, validateExtension, applyExtension } from '../src/match/data.js';
import { buildExtension11, serialize } from './build-motor11-data.js';
import { referenceTeams } from '../src/population/reference.js';
import { validateReferenceSet } from '../src/population/validate.js';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const PROMPT = join(ROOT, 'docs/prompts/MOTOR-01-primer-partido-completo.md');
const PROMPT2 = join(ROOT, 'docs/prompts/MOTOR-02-modos-y-direccion.md');
const PROMPT4 = join(ROOT, 'docs/prompts/MOTOR-04-ataque-posicional.md');
const PROMPT5 = join(ROOT, 'docs/prompts/MOTOR-05-defensa-completa.md');
const PROMPT6 = join(ROOT, 'docs/prompts/MOTOR-06-transicion-y-saques.md');
const PROMPT7 = join(ROOT, 'docs/prompts/MOTOR-07-capacidades-y-estados.md');
const PROMPT8 = join(ROOT, 'docs/prompts/MOTOR-08-entrenador-y-memoria.md');
const CATALOG = join(ROOT, 'data/catalog.json');

export function extractAnnexes(promptText) {
  const j = promptText.match(/<!-- MOTOR01_SEED_JSON -->\s*```json\n([\s\S]*?)\n```/)[1];
  const c = promptText.match(/<!-- MOTOR01_PLAYERS_CSV -->\s*```csv\n([\s\S]*?)\n```/)[1];
  return { json: `${j}\n`, csv: `${c}\n` };
}

// Semilla provisional de recuperación por tiempo muerto: bloque JSON literal del apartado 8.4 del prompt de MOTOR-02.
export function extractSeedExtensionBlock(promptText) {
  return JSON.parse(promptText.match(/```json\n(\{\s*"seedExtensionId"[\s\S]*?\})\n```/)[1]);
}

// Bloque JSON del anexo A del prompt de MOTOR-04 (extensión numérica SEM-MOTOR04-20261016).
export function extractAnnexA4(promptText) {
  return JSON.parse(promptText.match(/```json\n(\{\s*"id": "SEM-MOTOR04-20261016"[\s\S]*?\n\})\n```/)[1]);
}

// Bloque JSON del anexo A del prompt de MOTOR-05 (extensión numérica SEM-MOTOR05-20261016).
export function extractAnnexA5(promptText) {
  return JSON.parse(promptText.match(/```json\n(\{\s*"id": "SEM-MOTOR05-20261016"[\s\S]*?\n\})\n```/)[1]);
}

// Bloque JSON del anexo A del prompt de MOTOR-06 (extensión numérica SEM-MOTOR06-20261016).
export function extractAnnexA6(promptText) {
  return JSON.parse(promptText.match(/```json\n(\{\s*"id": "SEM-MOTOR06-20261016"[\s\S]*?\n\})\n```/)[1]);
}

// Bloque JSON del anexo A del prompt de MOTOR-07 (extensión numérica SEM-MOTOR07-20261016).
export function extractAnnexA7(promptText) {
  return JSON.parse(promptText.match(/```json\n(\{\s*"id": "SEM-MOTOR07-20261016"[\s\S]*?\n\})\n```/)[1]);
}

// Las cifras SEM de MOTOR-08 que el encargo da en tablas (§10.2 políticas, §7.1 librillo) o listas (§11.4 curva de memoria, §10.3 datos comunes) se leen del prompt archivado
// y deben coincidir con la extensión. Las tablas declarativas añadidas (patrones, respuestas, necesidades, causas de pausa) son concreción de Claude y no se comparan.
const num = (t) => Number(String(t).trim().replace(',', '.'));
export function extractPolicyTable8(promptText) {
  const out = {};
  for (const line of promptText.split('\n')) {
    const m = /^\| `(\w+)` \|.*\|\s*([\d,.]+)\s*\|\s*([\d,.]+)\s*\|\s*([\d,.]+)\s*\|\s*$/.exec(line);
    if (m) out[m[1]] = [num(m[2]), num(m[3]), num(m[4])];
  }
  return out;
}
export function extractFoulBookPriorities8(promptText) {
  const sec = promptText.split('### 7.1')[1]?.split('### 7.2')[0] ?? ''; const rows = [];
  for (const line of sec.split('\n')) { const m = /^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \|\s*$/.exec(line); if (m && /^\d+$/.test(m[1])) rows.push({ priority: Number(m[1]), cond: m[2] }); }
  return rows;
}
export function checkMotor08Annex(extension8, promptText) {
  const problems = []; const c = extension8.additions.coach; const mem = extension8.additions.memory;
  const table = extractPolicyTable8(promptText); const ids = ['ENTREF01', 'ENTREF02', 'ENTREF03'];
  const keys = Object.keys(c.policies.ENTREF02).filter((k) => !['name', 'description'].includes(k));
  if (Object.keys(table).length !== keys.length) problems.push(`MOTOR-08: la tabla del apartado 10.2 tiene ${Object.keys(table).length} parámetros y la extensión ${keys.length}`);
  for (const k of keys) ids.forEach((id, i) => { if (table[k]?.[i] !== c.policies[id][k]) problems.push(`MOTOR-08: ${id}.${k} = ${c.policies[id][k]} no coincide con la tabla del encargo (${table[k]?.[i]})`); });
  const fb = extractFoulBookPriorities8(promptText); const mine = c.foulBook.map((r) => r.priority).sort((a, b) => a - b); const want = fb.map((r) => r.priority).sort((a, b) => a - b);
  if (JSON.stringify(mine) !== JSON.stringify(want)) problems.push(`MOTOR-08: prioridades del librillo ${JSON.stringify(mine)} distintas de las del encargo ${JSON.stringify(want)}`);
  const lit = { 'closeMarginPoints': 8, 'runAlarm.adverseMarginPoints': 8, 'runAlarm.windowAttacks': 4, 'runAlarm.comfortableOpportunities': 2, 'runAlarm.disorderIncidents': 2, 'urgent.deficitPoints': 12, 'urgent.seconds': 300, 'fastAttack.deficitPoints': 4, 'fastAttack.seconds': 90, 'seekThree.deficitPoints': 3, 'seekThree.seconds': 30 };
  for (const [p, v] of Object.entries(lit)) { const got = p.split('.').reduce((o, k) => o?.[k], c.common); if (got !== v) problems.push(`MOTOR-08: coach.common.${p} = ${got}, el encargo dice ${v}`); }
  for (const [txt, k, v] of [['Capacidad: 8 entradas', 'capacity', mem.capacity], ['Evidencia inicial: 0', 'initialEvidence', mem.initialEvidence], ['Incremento por exposición válida: 1', 'incrementPerExposure', mem.incrementPerExposure], ['Saturación: 4', 'saturation', mem.saturation], ['Semivida: 7 ataques rivales', 'halfLifeAttacks', mem.halfLifeAttacks], ['Umbral de descarte por irrelevancia: 0,25', 'discardThreshold', mem.discardThreshold]]) {
    const want = num(txt.split(':')[1].replace(/[^\d,]/g, ''));
    if (!promptText.includes(txt)) problems.push(`MOTOR-08: el prompt archivado ya no contiene «${txt}»`); else if (v !== want) problems.push(`MOTOR-08: memory.${k} = ${v}, el encargo dice ${want}`);
  }
  const pt = c.rotation.participation; if (pt.starterMinutes !== 28 || pt.reliefMinutes !== 12 || pt.pairs !== 5) problems.push('MOTOR-08: el plan de participación de referencia es de cinco parejas con 28/12 minutos');
  if (extension8.additions['rules.penaltyThrowInShotClockSeconds'] !== 14) problems.push('MOTOR-08: el saque de penalización dispone de 14 s (art. 29.2.6)');
  if (extension8.seedExtensionId !== 'SEM-MOTOR08-20261016') problems.push('MOTOR-08: identidad de la extensión inesperada');
  return problems;
}

// Las cifras SEM de la extensión de MOTOR-07 deben ser exactamente las del anexo A archivado; las tablas declarativas añadidas no se comparan (son lectura de Claude).
export function checkMotor07Annex(extension7, annex) {
  const problems = []; const a = extension7.additions;
  for (const k of ['form', 'pressure', 'moment', 'teamMoment', 'episodes', 'missingTaskConnections', 'initialStatePolicy']) if (JSON.stringify(a[k]) !== JSON.stringify(annex[k])) problems.push(`MOTOR-07: ${k} no coincide con el anexo A (${JSON.stringify(a[k])} ≠ ${JSON.stringify(annex[k])})`);
  if (extension7.seedExtensionId !== annex.id) problems.push('MOTOR-07: la identidad de la extensión no coincide con el anexo A');
  return problems;
}

// Las cifras SEM de la extensión de MOTOR-06 deben ser exactamente las del anexo A archivado (sin retoques «por conveniencia»).
export function checkMotor06Annex(extension6, annex) {
  const problems = []; const a = extension6.additions;
  for (const k of ['opportunities', 'throwIns', 'sharedResolution', 'existingPlans']) if (JSON.stringify(a[k]) !== JSON.stringify(annex[k])) problems.push(`MOTOR-06: ${k} no coincide con el anexo A (${JSON.stringify(a[k])} ≠ ${JSON.stringify(annex[k])})`);
  return problems;
}

// Las cifras SEM de la extensión de MOTOR-05 deben ser exactamente las del anexo A archivado (sin retoques «por conveniencia»).
export function checkMotor05Annex(extension5, annex) {
  const problems = []; const d = extension5.additions.defense;
  const eq = (path, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`MOTOR-05: ${path} no coincide con el anexo A (${JSON.stringify(got)} ≠ ${JSON.stringify(want)})`); };
  eq('styles', d.styles, annex.styles); eq('choiceReferences', d.choiceReferences, annex.newChoiceReferences); eq('assignment', d.assignment, annex.assignment);
  eq('pressure', d.pressure, annex.pressureAdvance); eq('coverage', d.coverage, annex.coverage); eq('specials', d.specials, annex.specials);
  return problems;
}

// Las cifras SEM de la extensión de MOTOR-04 deben ser exactamente las del anexo A archivado.
export function checkMotor04Annex(extension4, annex) {
  const problems = []; const a = extension4.additions;
  const eq = (path, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`MOTOR-04: ${path} no coincide con el anexo A (${JSON.stringify(got)} ≠ ${JSON.stringify(want)})`); };
  const s = annex.newStyleSeeds;
  eq('transitionAttemptOddsRatio', a['selection.transitionAttemptOddsRatio'], s.transitionAttemptOddsRatio);
  eq('elaborationContinuationWeightFactor', a['selection.elaborationContinuationWeightFactor'], s.elaborationContinuationWeightFactor);
  eq('offensiveRiskPreferenceTilt', a['selection.offensiveRiskPreferenceTilt'], s.offensiveRiskPreferenceTilt);
  eq('offensiveReboundAssignmentTarget', a['rebound.offensiveReboundAssignmentTarget'], s.offensiveReboundAssignmentTarget);
  eq('midrangePolicy', a['selection.midrangePolicy'], annex.midrangePolicy);
  eq('rolePreference', a['selection.rolePreference'], { favoredFunctionWeight: annex.rolePreference.favoredFunctionWeight, otherFunctionWeight: annex.rolePreference.otherFunctionWeight });
  eq('newVariantPreference', a['selection.newVariantPreference'], { eligibleVariantBaseWeight: annex.newVariantPreference.eligibleVariantBaseWeight, unknownRoleFunctionWeight: annex.newVariantPreference.unknownRoleFunctionWeight });
  eq('unreadyReturnerOpportunityOddsRatio', a['rebound.balance'].unreadyReturnerOpportunityOddsRatio, annex.reboundBalance.unreadyReturnerOpportunityOddsRatio);
  eq('preserveNeutralBaselineAssignmentsWhenCompatible', a['rebound.balance'].preserveNeutralBaselineAssignmentsWhenCompatible, annex.reboundBalance.preserveNeutralBaselineAssignmentsWhenCompatible);
  eq('carga abstracta retirada', extension4.replacements['rebound.loadLogitByLevel'], [0, 0, 0, 0, 0]);
  for (const d of a['scenario.demoPlans']) {
    eq('plan de demostración: disposición', d.disposition, annex.previewPlan.initialDisposition);
    eq('plan de demostración: prioridades', d.playbook.every((b) => b.priority === annex.previewPlan.allPlayPriorities), true);
  }
  return problems;
}

// MOTOR-09: la matriz normativa debe ser coherente y declarar el estado de contraste de cada fila; los valores contrastados deben coincidir con el encargo (§4.3).
export function checkMotor09(extension9) {
  const problems = []; const a = extension9.additions; const reg = a.regulation;
  if (extension9.seedExtensionId !== 'SEM-MOTOR09-20261016') problems.push('MOTOR-09: identidad de la extensión inesperada');
  const STATES = ['contrastada', 'heredada', 'provisional', 'pendiente'];
  const ids = new Set();
  for (const r of reg.matrix) {
    if (ids.has(r.id)) problems.push(`MOTOR-09: fila repetida ${r.id}`); ids.add(r.id);
    if (!STATES.includes(r.contrast)) problems.push(`MOTOR-09: ${r.id} sin estado de contraste válido`);
    if (!r.source?.doc || !r.source?.article || !r.source?.reading) problems.push(`MOTOR-09: ${r.id} sin fuente, artículo y tipo de lectura`);
    if (r.contrast === 'contrastada' && !/§4\.3/.test(r.source.reading)) problems.push(`MOTOR-09: ${r.id} marcada contrastada sin remitir al encargo §4.3`);
    if (r.contrast === 'pendiente' && r.consequence) problems.push(`MOTOR-09: ${r.id} pendiente no puede llevar consecuencia ejecutable`);
  }
  const f5 = reg.matrix.find((r) => r.id === 'RG-F05'); const f6 = reg.matrix.find((r) => r.id === 'RG-F06');
  if (f5?.consequence?.ft !== 2 || f5?.consequence?.resume?.shotClock !== 'fixed14') problems.push('MOTOR-09: disruptiva/flagrante sin tiro = dos libres y saque con 14 s (§4.3)');
  if (f6?.consequence?.ft?.made !== 1 || f6?.consequence?.ft?.missed !== 'shotPoints') problems.push('MOTOR-09: con tiro, un adicional si hay canasta y dos o tres si falla (§4.3)');
  if (reg.disqualification.limit !== 2 || reg.disqualification.sumOf.join() !== 'flagrant,technicalCat1') problems.push('MOTOR-09: la descalificación acumula flagrantes y técnicas de categoría 1 (§4.3)');
  if (!reg.sources.every((x) => x.url && x.access)) problems.push('MOTOR-09: cada fuente declara su URL y el acceso real');
  if (!a.statsPolicy?.families?.length) problems.push('MOTOR-09: falta la política estadística');
  return problems;
}

// MOTOR-10: la política analítica es SEM editorial y de muestra: debe traer los parámetros del encargo (§7.1, §14, §15.3, §17.5, §19) y ninguna clave deportiva.
export function checkMotor10(extension10) {
  const problems = []; const a = extension10.additions?.analysis;
  if (extension10.seedExtensionId !== 'SEM-MOTOR10-20261016') problems.push('MOTOR-10: identidad de la extensión inesperada');
  if (Object.keys(extension10.additions ?? {}).join() !== 'analysis') problems.push('MOTOR-10: la extensión solo puede añadir la tabla analysis (sin tocar el deporte)');
  const eq = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`MOTOR-10: ${name} = ${JSON.stringify(got)} (el encargo fija ${JSON.stringify(want)})`); };
  eq('final ajustado', [a?.adjustedFinal?.seconds, a?.adjustedFinal?.margin], [120, 5]);
  eq('antes/después', a?.beforeAfter?.attacks, 3);
  eq('aviso de muestra ordinario', a?.sample?.warnBelow, 5);
  eq('destaque de quinteto (s, ataques)', [a?.summary?.groupSeconds, a?.summary?.groupAttacks], [180, 8]);
  eq('claves máximas', a?.summary?.maxKeys, 3);
  eq('diferencia de producción', a?.summary?.productionDiffMin, 6);
  eq('parcial sin respuesta', a?.summary?.unansweredMin, 8);
  eq('ejecuciones mínimas', a?.summary?.executionMin, 4);
  eq('calidad (oportunidades, pp)', [a?.summary?.qualityMinOpportunities, a?.summary?.qualityDiffPp], [8, 20]);
  eq('REC10-01', [a?.recommendations?.['REC10-01']?.minExecutions, a?.recommendations?.['REC10-01']?.minDenials, a?.recommendations?.['REC10-01']?.minAlternatives], [4, 2, 2]);
  eq('REC10-02', [a?.recommendations?.['REC10-02']?.minMisses, a?.recommendations?.['REC10-02']?.minTransitions], [5, 2]);
  eq('coeficiente 0,44', a?.conventions?.ftCoefficient, 0.44);
  return problems;
}

// MOTOR-11: el archivo debe coincidir con lo que materializa el script desde las tablas del encargo; doce equipos, 144 plazas, planes válidos, revisión EQ07-J01 = 40 años,
// receta con ocho grupos que cubren exactamente las 32 capacidades y sin tocar el deporte (solo population, generator y lab).
export function checkMotor11(extension11, profile, players) {
  const problems = [];
  if (extension11.seedExtensionId !== 'SEM-MOTOR11-20261017') problems.push('MOTOR-11: identidad de la extensión inesperada');
  if (Object.keys(extension11.additions ?? {}).join() !== 'population,generator,lab') problems.push('MOTOR-11: la extensión solo puede añadir population, generator y lab (sin tocar el deporte)');
  if (readFileSync(EXTENSION11_PATH, 'utf8') !== serialize(buildExtension11())) problems.push('MOTOR-11: el archivo no coincide con lo que produce scripts/build-motor11-data.js (ejecútalo con --write)');
  for (const e of validateReferenceSet(profile, referenceTeams(profile, players))) problems.push(`MOTOR-11: ${e.path}: ${e.message}`);
  const g = profile.generator; const all = Object.values(g.groups).flatMap((x) => x.abilities);
  if (all.length !== 32 || new Set(all).size !== 32) problems.push('MOTOR-11: los grupos del generador no cubren exactamente las 32 capacidades');
  return problems;
}

// MOTOR-12: la extensión solo añade la tabla técnica `batch` (sin tocar el deporte): el perfil efectivo con ella es idéntico al de MOTOR-11 salvo `batch`, `extensions` y `effectiveId`.
export function checkMotor12(extension12, baseProfile, exts, profile, extension13 = null) {
  const problems = [];
  if (extension12.seedExtensionId !== 'SEM-MOTOR12-20261017') problems.push('MOTOR-12: identidad de la extensión inesperada');
  if (Object.keys(extension12.additions ?? {}).join() !== 'batch') problems.push('MOTOR-12: la extensión solo puede añadir batch (parámetros técnicos de lotes, sin tocar el deporte)');
  if (extension12.replacements) problems.push('MOTOR-12: la extensión no puede sustituir ningún valor del perfil');
  const prev = applyExtension(baseProfile, ...exts);
  const { batch, audit, extensions, effectiveId, ...rest } = profile; const { extensions: e2, effectiveId: i2, ...rest0 } = prev;
  void batch; void audit; void extensions; void effectiveId; void e2; void i2; void extension13;
  if (JSON.stringify(rest) !== JSON.stringify(rest0)) problems.push('MOTOR-12: el perfil con la extensión difiere del de MOTOR-11 en algo distinto de la tabla batch');
  const b = profile.batch;
  if (b.concurrency !== 1) problems.push('MOTOR-12: la concurrencia precargada debe ser 1');
  if (JSON.stringify(b.repetitionShortcuts) !== '[10,100,1000]') problems.push('MOTOR-12: accesos rápidos 10, 100, 1000');
  if (b.partTargetMiB !== 64 || b.progressIntervalMs !== 500) problems.push('MOTOR-12: objetivo de parte 64 MiB y progreso 500 ms');
  return problems;
}

// MOTOR-14: la extensión añade contenido NORMATIVO de terminación por falta de jugadores (RG-T02, fila `regulation.termination.insufficientPlayers`, tres fuentes F14) y sustituye solo las rutas listadas
// (contraste de RG-D02, nota de RG-T01 y su cobertura, versión del perfil reglamentario). El resto del perfil efectivo es idéntico al de MOTOR-13: ningún coeficiente deportivo cambia.
const M14_REPLACED = ['regulation.version', 'regulation.availability.contrast', 'regulation.availability.note', 'regulation.matrix.10.source.article', 'regulation.matrix.10.source.reading', 'regulation.matrix.10.source.note', 'regulation.matrix.10.contrast', 'regulation.matrix.10.coverage', 'regulation.matrix.11.source.note', 'regulation.matrix.11.coverage'];
export function checkMotor14(extension14, profile13, profile) {
  const problems = [];
  if (extension14.seedExtensionId !== 'SEM-MOTOR14-20261017') problems.push('MOTOR-14: identidad de la extensión inesperada');
  if (Object.keys(extension14.additions ?? {}).sort().join() !== ['regulation.matrix.19', 'regulation.sources.4', 'regulation.sources.5', 'regulation.sources.6', 'regulation.termination.insufficientPlayers'].join()) problems.push('MOTOR-14: la extensión solo puede añadir la fila RG-T02, tres fuentes F14 y regulation.termination.insufficientPlayers');
  if (Object.keys(extension14.replacements ?? {}).sort().join() !== [...M14_REPLACED].sort().join()) problems.push('MOTOR-14: las sustituciones deben ser exactamente las listadas (trazables con valor anterior)');
  const strip = (p) => { const q = JSON.parse(JSON.stringify(p)); delete q.extensions; delete q.effectiveId; delete q.regulation; return q; };
  if (JSON.stringify(strip(profile)) !== JSON.stringify(strip(profile13))) problems.push('MOTOR-14: el perfil con la extensión difiere del de MOTOR-13 en algo distinto de `regulation` (no puede cambiar el deporte)');
  const r = profile.regulation; const r0 = profile13.regulation;
  for (const k of Object.keys(r0)) if (!['version', 'availability', 'termination', 'matrix', 'sources'].includes(k) && JSON.stringify(r[k]) !== JSON.stringify(r0[k])) problems.push(`MOTOR-14: regulation.${k} no puede cambiar`);
  if (r.matrix.length !== r0.matrix.length + 1 || r.matrix[r.matrix.length - 1].id !== 'RG-T02') problems.push('MOTOR-14: la matriz añade exactamente RG-T02 al final');
  const ip = r.termination.insufficientPlayers; if (!ip || ip.retainLeadingScore !== true || ip.otherwiseWinnerPoints !== 2 || ip.otherwiseLoserPoints !== 0) problems.push('MOTOR-14: art. 21 — conserva el marcador favorable y adjudica 2–0 si no va por delante');
  if (r.availability.minPlayersToContinue !== 2) problems.push('MOTOR-14: el umbral es de dos jugadores listos');
  if (JSON.stringify(r.termination.forfeitWinnerPoints) !== '20' || r.termination.forfeitLoserPoints !== 0) problems.push('MOTOR-14: la incomparecencia (20–0, convención provisional) no cambia');
  return problems;
}

// MOTOR-13: la extensión solo añade la tabla de lectura `audit` (auditoría, sensibilidad y pasos de calibración): el perfil efectivo es idéntico al de MOTOR-12 salvo `audit`, `extensions` y `effectiveId`.
export function checkMotor13(extension13, baseProfile, exts, profile) {
  const problems = [];
  if (extension13.seedExtensionId !== 'SEM-MOTOR13-20261017') problems.push('MOTOR-13: identidad de la extensión inesperada');
  if (Object.keys(extension13.additions ?? {}).join() !== 'audit') problems.push('MOTOR-13: la extensión solo puede añadir audit (parámetros de lectura, sin tocar el deporte)');
  if (extension13.replacements) problems.push('MOTOR-13: la extensión no puede sustituir ningún valor del perfil');
  const prev = applyExtension(baseProfile, ...exts);
  const { audit, extensions, effectiveId, ...rest } = profile; const { extensions: e2, effectiveId: i2, ...rest0 } = prev;
  void extensions; void effectiveId; void e2; void i2;
  if (JSON.stringify(rest) !== JSON.stringify(rest0)) problems.push('MOTOR-13: el perfil con la extensión difiere del de MOTOR-12 en algo distinto de la tabla audit');
  const a = audit;
  if (a.contextsPerCapability !== 24) problems.push('MOTOR-13: hasta 24 contextos por capacidad');
  if (JSON.stringify(a.sensitivityIncrements) !== '[1,3,5]') problems.push('MOTOR-13: incrementos +1, +3, +5');
  if (a.familyConcentration.share !== 0.8 || a.finalizerConcentration.share !== 0.6 || a.loopRevisits !== 10) problems.push('MOTOR-13: umbrales de aviso 80 %, 60 % y 10 revisitas');
  if (a.campaign.explorationMatches !== 24 || a.campaign.fullDiagnostics !== 4 || a.campaign.validationReserveMax !== 8) problems.push('MOTOR-13: campaña 24 / 4 / 8');
  return problems;
}

export function checkData() {
  const problems = [];
  const { profile, baseProfile, extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13, extension14, players } = loadData();
  for (const e of validateProfileAndFixtures(profile, players)) problems.push(`${e.path}: ${e.message}`);
  for (const e of validateExtension(baseProfile, extension)) problems.push(`extensión MOTOR-02: ${e}`);
  for (const e of validateExtension(baseProfile, extension3)) problems.push(`extensión MOTOR-03: ${e}`);
  for (const e of validateExtension(baseProfile, extension4)) problems.push(`extensión MOTOR-04: ${e}`);
  for (const e of validateExtension(baseProfile, extension5)) problems.push(`extensión MOTOR-05: ${e}`);
  for (const e of validateExtension(baseProfile, extension6, profile)) problems.push(`extensión MOTOR-06: ${e}`);
  for (const e of validateExtension(baseProfile, extension7, profile)) problems.push(`extensión MOTOR-07: ${e}`);
  for (const e of validateExtension(baseProfile, extension8, profile)) problems.push(`extensión MOTOR-08: ${e}`);
  for (const e of validateExtension(baseProfile, extension9, profile)) problems.push(`extensión MOTOR-09: ${e}`);
  problems.push(...checkMotor09(extension9));
  for (const e of validateExtension(baseProfile, extension10, profile)) problems.push(`extensión MOTOR-10: ${e}`);
  problems.push(...checkMotor10(extension10));
  for (const e of validateExtension(baseProfile, extension11, profile)) problems.push(`extensión MOTOR-11: ${e}`);
  problems.push(...checkMotor11(extension11, profile, players));
  for (const e of validateExtension(baseProfile, extension12, profile)) problems.push(`extensión MOTOR-12: ${e}`);
  const exts13 = [extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13];
  const profile13 = applyExtension(baseProfile, ...exts13); // perfil efectivo SIN la extensión de MOTOR-14: las comprobaciones de M12/M13 comparan contra él
  problems.push(...checkMotor12(extension12, baseProfile, [extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11], profile13, extension13));
  for (const e of validateExtension(baseProfile, extension13, profile)) problems.push(`extensión MOTOR-13: ${e}`);
  problems.push(...checkMotor13(extension13, baseProfile, [extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12], profile13));
  for (const e of validateExtension(baseProfile, extension14, profile13)) problems.push(`extensión MOTOR-14: ${e}`);
  problems.push(...checkMotor14(extension14, profile13, profile));
  const hashes = { profile: sha(PROFILE_PATH), players: sha(PLAYERS_PATH), prompt: sha(PROMPT), extension: sha(EXTENSION_PATH), extension3: sha(EXTENSION3_PATH), extension4: sha(EXTENSION4_PATH), extension5: sha(EXTENSION5_PATH), extension6: sha(EXTENSION6_PATH), extension7: sha(EXTENSION7_PATH), extension8: sha(EXTENSION8_PATH), extension9: sha(EXTENSION9_PATH), extension10: sha(EXTENSION10_PATH), extension11: sha(EXTENSION11_PATH), extension12: sha(EXTENSION12_PATH), extension13: sha(EXTENSION13_PATH), extension14: sha(EXTENSION14_PATH) };
  if (existsSync(PROMPT4)) problems.push(...checkMotor04Annex(extension4, extractAnnexA4(readFileSync(PROMPT4, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-04');
  if (existsSync(PROMPT5)) problems.push(...checkMotor05Annex(extension5, extractAnnexA5(readFileSync(PROMPT5, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-05');
  if (existsSync(PROMPT6)) problems.push(...checkMotor06Annex(extension6, extractAnnexA6(readFileSync(PROMPT6, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-06');
  if (existsSync(PROMPT7)) problems.push(...checkMotor07Annex(extension7, extractAnnexA7(readFileSync(PROMPT7, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-07');
  if (existsSync(PROMPT8)) problems.push(...checkMotor08Annex(extension8, readFileSync(PROMPT8, 'utf8')));
  else problems.push('falta el prompt archivado de MOTOR-08');
  if (existsSync(PROMPT2)) {
    const lit = extractSeedExtensionBlock(readFileSync(PROMPT2, 'utf8'));
    for (const [k, v] of Object.entries(lit)) if (JSON.stringify(extension[k]) !== JSON.stringify(v)) problems.push(`la extensión no coincide con el apartado 8.4 del prompt de MOTOR-02 en ${k}`);
  } else problems.push('falta el prompt archivado de MOTOR-02');
  const ann = extractAnnexes(readFileSync(PROMPT, 'utf8'));
  if (ann.json !== readFileSync(PROFILE_PATH, 'utf8')) problems.push('el perfil no coincide con el anexo A del prompt archivado');
  if (ann.csv !== readFileSync(PLAYERS_PATH, 'utf8')) problems.push('las fichas no coinciden con el anexo B del prompt archivado');
  if (existsSync(CATALOG)) {
    const cat = JSON.parse(readFileSync(CATALOG, 'utf8'));
    if (cat.files['data/match/motor01-seed-profile.json'].sha256 !== hashes.profile) problems.push('hash del perfil distinto del catálogo');
    if (cat.files['data/fixtures/reference-players-MOTOR01.csv'].sha256 !== hashes.players) problems.push('hash de las fichas distinto del catálogo');
    if (cat.files['data/match/motor02-seed-extension.json']?.sha256 !== hashes.extension) problems.push('hash de la extensión de MOTOR-02 distinto del catálogo');
    if (cat.files['data/match/motor03-seed-extension.json']?.sha256 !== hashes.extension3) problems.push('hash de la extensión de MOTOR-03 distinto del catálogo');
    if (cat.files['data/match/motor04-seed-extension.json']?.sha256 !== hashes.extension4) problems.push('hash de la extensión de MOTOR-04 distinto del catálogo');
    if (cat.files['data/match/motor05-seed-extension.json']?.sha256 !== hashes.extension5) problems.push('hash de la extensión de MOTOR-05 distinto del catálogo');
    if (cat.files['data/match/motor06-seed-extension.json']?.sha256 !== hashes.extension6) problems.push('hash de la extensión de MOTOR-06 distinto del catálogo');
    if (cat.files['data/match/motor07-seed-extension.json']?.sha256 !== hashes.extension7) problems.push('hash de la extensión de MOTOR-07 distinto del catálogo');
    if (cat.files['data/match/motor08-seed-extension.json']?.sha256 !== hashes.extension8) problems.push('hash de la extensión de MOTOR-08 distinto del catálogo');
    if (cat.files['data/match/motor09-seed-extension.json']?.sha256 !== hashes.extension9) problems.push('hash de la extensión de MOTOR-09 distinto del catálogo');
    if (cat.files['data/match/motor10-seed-extension.json']?.sha256 !== hashes.extension10) problems.push('hash de la extensión de MOTOR-10 distinto del catálogo');
    if (cat.files['data/match/motor11-seed-extension.json']?.sha256 !== hashes.extension11) problems.push('hash de la extensión de MOTOR-11 distinto del catálogo');
    if (cat.files['data/match/motor12-seed-extension.json']?.sha256 !== hashes.extension12) problems.push('hash de la extensión de MOTOR-12 distinto del catálogo');
    if (cat.files['data/match/motor13-seed-extension.json']?.sha256 !== hashes.extension13) problems.push('hash de la extensión de MOTOR-13 distinto del catálogo');
    if (cat.files['data/match/motor14-seed-extension.json']?.sha256 !== hashes.extension14) problems.push('hash de la extensión de MOTOR-14 distinto del catálogo');
  } else problems.push('falta data/catalog.json');
  return { problems, hashes, profile, baseProfile, players };
}

if (process.argv[1] && process.argv[1].endsWith('check-data.js')) {
  if (process.argv.includes('--write-catalog')) {
    const { baseProfile: profile, extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13, extension14 } = loadData();
    const cat = {
      description: 'Catálogo de datos: identidad y estado de los materiales (MOTOR-01 cargados literalmente de los anexos del prompt; extensión de MOTOR-02 aparte, sin tocar el perfil original).',
      source: 'docs/prompts/MOTOR-01-primer-partido-completo.md (Anexo A y Anexo B); docs/prompts/MOTOR-02-modos-y-direccion.md (apartado 8.4); docs/prompts/MOTOR-03-panel-y-perfiles.md (apartado 4.1); docs/prompts/MOTOR-04-ataque-posicional.md (anexo A); docs/prompts/MOTOR-05-defensa-completa.md (anexo A); docs/prompts/MOTOR-06-transicion-y-saques.md (anexo A); docs/prompts/MOTOR-07-capacidades-y-estados.md (anexo A); docs/prompts/MOTOR-08-entrenador-y-memoria.md (apartados 6.1, 7.1, 10.2, 10.3 y 11.4)',
      files: {
        'data/match/motor01-seed-profile.json': { id: profile.id, status: profile.status, sha256: sha(PROFILE_PATH), origin: 'Anexo A (extraído programáticamente)', state: 'SEM provisional, no calibrado' },
        'data/fixtures/reference-players-MOTOR01.csv': { sha256: sha(PLAYERS_PATH), origin: 'Anexo B (extraído programáticamente)', state: 'SEM provisional: 144 fichas ficticias; solo EQ01/EQ02 jugables en MOTOR-01' },
        'data/match/motor02-seed-extension.json': { id: extension.seedExtensionId, status: extension.status, sha256: sha(EXTENSION_PATH), origin: 'Apartado 8.4 del prompt de MOTOR-02 (recuperación por tiempo muerto, literal) + constantes reglamentarias de tiempos muertos (lectura propia, sin contrastar con el PDF FIBA)', state: 'SEM provisional, no calibrado; no completa los 81 grupos finales' },
        'data/match/motor03-seed-extension.json': { id: extension3.seedExtensionId, status: extension3.status, sha256: sha(EXTENSION3_PATH), origin: 'Apartado 4.1 del prompt de MOTOR-03: literales calibrables del código de MOTOR-01/02 convertidos en filas con su valor exacto', state: 'SEM provisional, no calibrado; valores idénticos a los literales sustituidos' },
        'data/match/motor05-seed-extension.json': { id: extension5.seedExtensionId, status: extension5.status, sha256: sha(EXTENSION5_PATH), origin: 'Anexo A del prompt de MOTOR-05 (cifras SEM, literales) + contenido declarativo de organizaciones, funciones, responsabilidades, roles y coberturas: lectura de Claude, a revisar por Dennis', state: 'SEM provisional, no calibrado; amplía el catálogo activo de defensas y coberturas' },
        'data/match/motor06-seed-extension.json': { id: extension6.seedExtensionId, status: extension6.status, sha256: sha(EXTENSION6_PATH), origin: 'Anexo A del prompt de MOTOR-06 (cifras SEM, literales) + contenido declarativo del catálogo ESP01–ESP20, seis fichas de saque y seis respuestas defensivas (anexos B y C): lectura de Claude, a revisar por Dennis', state: 'SEM provisional, no calibrado; completa el catálogo espontáneo activo y añade saques de banda y fondo' },
        'data/match/motor07-seed-extension.json': { id: extension7.seedExtensionId, status: extension7.status, sha256: sha(EXTENSION7_PATH), origin: 'Anexo A del prompt de MOTOR-07 (cifras SEM, literales) + tablas declarativas de tareas con estados y episodios (lectura de Claude)', state: 'SEM provisional, no calibrado' },
        'data/match/motor08-seed-extension.json': { id: extension8.seedExtensionId, status: extension8.status, sha256: sha(EXTENSION8_PATH), origin: 'Apartados 6.1, 7.1, 10.2, 10.3 y 11.4 del prompt de MOTOR-08 (cifras SEM literales, verificadas) + tablas declarativas de necesidades, causas de pausa, contextos de final, patrones y respuestas de memoria (concreción de Claude, a revisar por Dennis)', state: 'SEM provisional, no calibrado; sustituye (sin borrar) las filas históricas rotation.* y añade el plan de participación y la política de cada equipo' },
        'data/match/motor09-seed-extension.json': { id: extension9.seedExtensionId, status: extension9.status, sha256: sha(EXTENSION9_PATH), origin: 'Encargo MOTOR-09 (§4 fuentes, §5 matriz, §12 política estadística, §16.3 ruta B): matriz normativa con estado de contraste por fila (los PDF de S09-01 a S09-04 no fueron accesibles) y política estadística beM', state: 'SEM provisional en parámetros; matriz normativa con estados contrastada/heredada/provisional/pendiente' },
        'data/match/motor10-seed-extension.json': { id: extension10.seedExtensionId, status: extension10.status, sha256: sha(EXTENSION10_PATH), origin: 'Encargo MOTOR-10 (§7.1 final ajustado, §14 antes/después, §15.3 selección editorial, §17.5 REC10-01/02, §19 precargas): parámetros editoriales y de muestra del análisis', state: 'SEM provisional, no calibrado; sin efecto deportivo' },
        'data/match/motor11-seed-extension.json': { id: extension11.seedExtensionId, status: extension11.status, sha256: sha(EXTENSION11_PATH), origin: 'Encargo MOTOR-11 (§5–§12): planes naturales materializados por scripts/build-motor11-data.js, revisión R1 de EQ07-J01, receta del generador y catálogo LAB11' },
        'data/match/motor14-seed-extension.json': { id: extension14.seedExtensionId, status: extension14.status, sha256: sha(EXTENSION14_PATH), origin: 'Encargo MOTOR-14 (§7.2–§7.4, §8): terminación administrativa por falta de jugadores (art. 21, lectura de ChatGPT de F14-01) y trazabilidad de fuentes; sin coeficientes deportivos nuevos', state: 'SEM provisional; contenido normativo contrastado por ChatGPT, sin lectura directa del PDF por Claude' },
        'data/match/motor13-seed-extension.json': { id: extension13.seedExtensionId, status: extension13.status, sha256: sha(EXTENSION13_PATH), origin: 'Encargo MOTOR-13 (§15.4, §14.3, §18): parámetros de auditoría, lectura y calibración (tabla audit); sin efecto deportivo', state: 'SEM provisional, no calibrado' },
        'data/match/motor12-seed-extension.json': { id: extension12.seedExtensionId, status: extension12.status, sha256: sha(EXTENSION12_PATH), origin: 'Encargo MOTOR-12 (§15.1, §20): parámetros técnicos de ejecución, registro y exportación de lotes (tabla batch); sin efecto deportivo', state: 'SEM provisional, no calibrado' },
        'data/match/motor04-seed-extension.json': { id: extension4.seedExtensionId, status: extension4.status, sha256: sha(EXTENSION4_PATH), origin: 'Anexo A del prompt de MOTOR-04 (cifras SEM, literales) + contenido declarativo del repertorio (anexo B) y funciones por disposición: lectura de Claude, a revisar por Dennis', state: 'SEM provisional, no calibrado; sustituye explícitamente el efecto abstracto de carga y amplía el catálogo activo' },
      },
      promptSha256: sha(PROMPT),
    };
    writeFileSync(CATALOG, `${JSON.stringify(cat, null, 2)}\n`);
    console.log('catálogo escrito');
  }
  const r = checkData();
  console.log(`perfil ${r.profile.id} · ${r.players.length} fichas`);
  console.log('sha256 perfil  ', r.hashes.profile);
  console.log('sha256 fichas  ', r.hashes.players);
  console.log('sha256 ext. M2', r.hashes.extension);
  console.log('sha256 ext. M3', r.hashes.extension3);
  console.log('sha256 ext. M4', r.hashes.extension4);
  console.log('sha256 ext. M5', r.hashes.extension5);
  console.log('sha256 ext. M6', r.hashes.extension6);
  console.log('sha256 ext. M7', r.hashes.extension7);
  console.log('sha256 ext. M8', r.hashes.extension8);
  console.log('sha256 ext. M9', r.hashes.extension9);
  console.log('sha256 ext. M10', r.hashes.extension10);
  console.log('sha256 ext. M11', r.hashes.extension11);
  console.log('sha256 ext. M12', r.hashes.extension12);
  console.log('sha256 ext. M13', r.hashes.extension13);
  console.log('sha256 ext. M14', r.hashes.extension14);
  if (r.problems.length) { console.log('PROBLEMAS:'); r.problems.forEach((p) => console.log(' -', p)); process.exit(1); }
  console.log('datos correctos');
}
