// Comprobación de datos (§10.1): legibilidad, 32 capacidades, 144 IDs únicos, doce plazas, rangos, sumas y
// referencias de los dos escenarios activos; coincidencia con el catálogo de hashes y con el anexo del prompt archivado.
// Uso: node scripts/check-data.js [--write-catalog]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, PROFILE_PATH, PLAYERS_PATH, EXTENSION_PATH, EXTENSION3_PATH, EXTENSION4_PATH, EXTENSION5_PATH, EXTENSION6_PATH, loadData } from './node-data.js';
import { validateProfileAndFixtures, validateExtension } from '../src/match/data.js';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const PROMPT = join(ROOT, 'docs/prompts/MOTOR-01-primer-partido-completo.md');
const PROMPT2 = join(ROOT, 'docs/prompts/MOTOR-02-modos-y-direccion.md');
const PROMPT4 = join(ROOT, 'docs/prompts/MOTOR-04-ataque-posicional.md');
const PROMPT5 = join(ROOT, 'docs/prompts/MOTOR-05-defensa-completa.md');
const PROMPT6 = join(ROOT, 'docs/prompts/MOTOR-06-transicion-y-saques.md');
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

export function checkData() {
  const problems = [];
  const { profile, baseProfile, extension, extension3, extension4, extension5, extension6, players } = loadData();
  for (const e of validateProfileAndFixtures(profile, players)) problems.push(`${e.path}: ${e.message}`);
  for (const e of validateExtension(baseProfile, extension)) problems.push(`extensión MOTOR-02: ${e}`);
  for (const e of validateExtension(baseProfile, extension3)) problems.push(`extensión MOTOR-03: ${e}`);
  for (const e of validateExtension(baseProfile, extension4)) problems.push(`extensión MOTOR-04: ${e}`);
  for (const e of validateExtension(baseProfile, extension5)) problems.push(`extensión MOTOR-05: ${e}`);
  for (const e of validateExtension(baseProfile, extension6, profile)) problems.push(`extensión MOTOR-06: ${e}`);
  const hashes = { profile: sha(PROFILE_PATH), players: sha(PLAYERS_PATH), prompt: sha(PROMPT), extension: sha(EXTENSION_PATH), extension3: sha(EXTENSION3_PATH), extension4: sha(EXTENSION4_PATH), extension5: sha(EXTENSION5_PATH), extension6: sha(EXTENSION6_PATH) };
  if (existsSync(PROMPT4)) problems.push(...checkMotor04Annex(extension4, extractAnnexA4(readFileSync(PROMPT4, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-04');
  if (existsSync(PROMPT5)) problems.push(...checkMotor05Annex(extension5, extractAnnexA5(readFileSync(PROMPT5, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-05');
  if (existsSync(PROMPT6)) problems.push(...checkMotor06Annex(extension6, extractAnnexA6(readFileSync(PROMPT6, 'utf8'))));
  else problems.push('falta el prompt archivado de MOTOR-06');
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
  } else problems.push('falta data/catalog.json');
  return { problems, hashes, profile, baseProfile, players };
}

if (process.argv[1] && process.argv[1].endsWith('check-data.js')) {
  if (process.argv.includes('--write-catalog')) {
    const { baseProfile: profile, extension, extension3, extension4, extension5, extension6 } = loadData();
    const cat = {
      description: 'Catálogo de datos: identidad y estado de los materiales (MOTOR-01 cargados literalmente de los anexos del prompt; extensión de MOTOR-02 aparte, sin tocar el perfil original).',
      source: 'docs/prompts/MOTOR-01-primer-partido-completo.md (Anexo A y Anexo B); docs/prompts/MOTOR-02-modos-y-direccion.md (apartado 8.4); docs/prompts/MOTOR-03-panel-y-perfiles.md (apartado 4.1); docs/prompts/MOTOR-04-ataque-posicional.md (anexo A); docs/prompts/MOTOR-05-defensa-completa.md (anexo A); docs/prompts/MOTOR-06-transicion-y-saques.md (anexo A)',
      files: {
        'data/match/motor01-seed-profile.json': { id: profile.id, status: profile.status, sha256: sha(PROFILE_PATH), origin: 'Anexo A (extraído programáticamente)', state: 'SEM provisional, no calibrado' },
        'data/fixtures/reference-players-MOTOR01.csv': { sha256: sha(PLAYERS_PATH), origin: 'Anexo B (extraído programáticamente)', state: 'SEM provisional: 144 fichas ficticias; solo EQ01/EQ02 jugables en MOTOR-01' },
        'data/match/motor02-seed-extension.json': { id: extension.seedExtensionId, status: extension.status, sha256: sha(EXTENSION_PATH), origin: 'Apartado 8.4 del prompt de MOTOR-02 (recuperación por tiempo muerto, literal) + constantes reglamentarias de tiempos muertos (lectura propia, sin contrastar con el PDF FIBA)', state: 'SEM provisional, no calibrado; no completa los 81 grupos finales' },
        'data/match/motor03-seed-extension.json': { id: extension3.seedExtensionId, status: extension3.status, sha256: sha(EXTENSION3_PATH), origin: 'Apartado 4.1 del prompt de MOTOR-03: literales calibrables del código de MOTOR-01/02 convertidos en filas con su valor exacto', state: 'SEM provisional, no calibrado; valores idénticos a los literales sustituidos' },
        'data/match/motor05-seed-extension.json': { id: extension5.seedExtensionId, status: extension5.status, sha256: sha(EXTENSION5_PATH), origin: 'Anexo A del prompt de MOTOR-05 (cifras SEM, literales) + contenido declarativo de organizaciones, funciones, responsabilidades, roles y coberturas: lectura de Claude, a revisar por Dennis', state: 'SEM provisional, no calibrado; amplía el catálogo activo de defensas y coberturas' },
        'data/match/motor06-seed-extension.json': { id: extension6.seedExtensionId, status: extension6.status, sha256: sha(EXTENSION6_PATH), origin: 'Anexo A del prompt de MOTOR-06 (cifras SEM, literales) + contenido declarativo del catálogo ESP01–ESP20, seis fichas de saque y seis respuestas defensivas (anexos B y C): lectura de Claude, a revisar por Dennis', state: 'SEM provisional, no calibrado; completa el catálogo espontáneo activo y añade saques de banda y fondo' },
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
  if (r.problems.length) { console.log('PROBLEMAS:'); r.problems.forEach((p) => console.log(' -', p)); process.exit(1); }
  console.log('datos correctos');
}
