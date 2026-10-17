// Carga de datos para Node (comprobaciones y scripts). El núcleo no usa el sistema de ficheros.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parsePlayersCsv, applyExtension } from '../src/match/data.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PROFILE_PATH = join(ROOT, 'data/match/motor01-seed-profile.json');
export const EXTENSION_PATH = join(ROOT, 'data/match/motor02-seed-extension.json');
export const EXTENSION3_PATH = join(ROOT, 'data/match/motor03-seed-extension.json');
export const EXTENSION4_PATH = join(ROOT, 'data/match/motor04-seed-extension.json');
export const EXTENSION5_PATH = join(ROOT, 'data/match/motor05-seed-extension.json');
export const EXTENSION6_PATH = join(ROOT, 'data/match/motor06-seed-extension.json');
export const EXTENSION7_PATH = join(ROOT, 'data/match/motor07-seed-extension.json');
export const EXTENSION8_PATH = join(ROOT, 'data/match/motor08-seed-extension.json');
export const EXTENSION9_PATH = join(ROOT, 'data/match/motor09-seed-extension.json');
export const EXTENSION10_PATH = join(ROOT, 'data/match/motor10-seed-extension.json');
export const EXTENSION11_PATH = join(ROOT, 'data/match/motor11-seed-extension.json');
export const EXTENSION12_PATH = join(ROOT, 'data/match/motor12-seed-extension.json');
export const EXTENSION13_PATH = join(ROOT, 'data/match/motor13-seed-extension.json');
export const EXTENSION14_PATH = join(ROOT, 'data/match/motor14-seed-extension.json');
export const EXTENSION15_PATH = join(ROOT, 'data/match/motor15-seed-extension.json');
export const PLAYERS_PATH = join(ROOT, 'data/fixtures/reference-players-MOTOR01.csv');

// `profile` es el perfil EFECTIVO (SEM de MOTOR-01 + extensiones SEM de MOTOR-02 a MOTOR-15); `baseProfile` es el original sin tocar.
export function loadData() {
  const baseProfile = JSON.parse(readFileSync(PROFILE_PATH, 'utf8'));
  const extension = JSON.parse(readFileSync(EXTENSION_PATH, 'utf8'));
  const extension3 = JSON.parse(readFileSync(EXTENSION3_PATH, 'utf8'));
  const extension4 = JSON.parse(readFileSync(EXTENSION4_PATH, 'utf8'));
  const extension5 = JSON.parse(readFileSync(EXTENSION5_PATH, 'utf8'));
  const extension6 = JSON.parse(readFileSync(EXTENSION6_PATH, 'utf8'));
  const extension7 = JSON.parse(readFileSync(EXTENSION7_PATH, 'utf8'));
  const extension8 = JSON.parse(readFileSync(EXTENSION8_PATH, 'utf8'));
  const extension9 = JSON.parse(readFileSync(EXTENSION9_PATH, 'utf8'));
  const extension10 = JSON.parse(readFileSync(EXTENSION10_PATH, 'utf8'));
  const extension11 = JSON.parse(readFileSync(EXTENSION11_PATH, 'utf8'));
  const extension12 = JSON.parse(readFileSync(EXTENSION12_PATH, 'utf8'));
  const extension13 = JSON.parse(readFileSync(EXTENSION13_PATH, 'utf8'));
  const extension14 = JSON.parse(readFileSync(EXTENSION14_PATH, 'utf8'));
  const extension15 = JSON.parse(readFileSync(EXTENSION15_PATH, 'utf8'));
  const players = parsePlayersCsv(readFileSync(PLAYERS_PATH, 'utf8'), baseProfile);
  return { profile: applyExtension(baseProfile, extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13, extension14, extension15), baseProfile, extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13, extension14, extension15, players };
}
