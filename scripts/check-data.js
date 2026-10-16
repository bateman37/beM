// Comprobación de datos (§10.1): legibilidad, 32 capacidades, 144 IDs únicos, doce plazas, rangos, sumas y
// referencias de los dos escenarios activos; coincidencia con el catálogo de hashes y con el anexo del prompt archivado.
// Uso: node scripts/check-data.js [--write-catalog]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, PROFILE_PATH, PLAYERS_PATH, EXTENSION_PATH, loadData } from './node-data.js';
import { validateProfileAndFixtures, validateExtension } from '../src/match/data.js';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const PROMPT = join(ROOT, 'docs/prompts/MOTOR-01-primer-partido-completo.md');
const PROMPT2 = join(ROOT, 'docs/prompts/MOTOR-02-modos-y-direccion.md');
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

export function checkData() {
  const problems = [];
  const { profile, baseProfile, extension, players } = loadData();
  for (const e of validateProfileAndFixtures(profile, players)) problems.push(`${e.path}: ${e.message}`);
  for (const e of validateExtension(baseProfile, extension)) problems.push(`extensión MOTOR-02: ${e}`);
  const hashes = { profile: sha(PROFILE_PATH), players: sha(PLAYERS_PATH), prompt: sha(PROMPT), extension: sha(EXTENSION_PATH) };
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
  } else problems.push('falta data/catalog.json');
  return { problems, hashes, profile, baseProfile, players };
}

if (process.argv[1] && process.argv[1].endsWith('check-data.js')) {
  if (process.argv.includes('--write-catalog')) {
    const { baseProfile: profile, extension } = loadData();
    const cat = {
      description: 'Catálogo de datos: identidad y estado de los materiales (MOTOR-01 cargados literalmente de los anexos del prompt; extensión de MOTOR-02 aparte, sin tocar el perfil original).',
      source: 'docs/prompts/MOTOR-01-primer-partido-completo.md (Anexo A y Anexo B); docs/prompts/MOTOR-02-modos-y-direccion.md (apartado 8.4)',
      files: {
        'data/match/motor01-seed-profile.json': { id: profile.id, status: profile.status, sha256: sha(PROFILE_PATH), origin: 'Anexo A (extraído programáticamente)', state: 'SEM provisional, no calibrado' },
        'data/fixtures/reference-players-MOTOR01.csv': { sha256: sha(PLAYERS_PATH), origin: 'Anexo B (extraído programáticamente)', state: 'SEM provisional: 144 fichas ficticias; solo EQ01/EQ02 jugables en MOTOR-01' },
        'data/match/motor02-seed-extension.json': { id: extension.seedExtensionId, status: extension.status, sha256: sha(EXTENSION_PATH), origin: 'Apartado 8.4 del prompt de MOTOR-02 (recuperación por tiempo muerto, literal) + constantes reglamentarias de tiempos muertos (lectura propia, sin contrastar con el PDF FIBA)', state: 'SEM provisional, no calibrado; no completa los 81 grupos finales' },
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
  if (r.problems.length) { console.log('PROBLEMAS:'); r.problems.forEach((p) => console.log(' -', p)); process.exit(1); }
  console.log('datos correctos');
}
