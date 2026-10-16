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
export const PLAYERS_PATH = join(ROOT, 'data/fixtures/reference-players-MOTOR01.csv');

// `profile` es el perfil EFECTIVO (SEM de MOTOR-01 + extensiones SEM de MOTOR-02, MOTOR-03 y MOTOR-04); `baseProfile` es el original sin tocar.
export function loadData() {
  const baseProfile = JSON.parse(readFileSync(PROFILE_PATH, 'utf8'));
  const extension = JSON.parse(readFileSync(EXTENSION_PATH, 'utf8'));
  const extension3 = JSON.parse(readFileSync(EXTENSION3_PATH, 'utf8'));
  const extension4 = JSON.parse(readFileSync(EXTENSION4_PATH, 'utf8'));
  const players = parsePlayersCsv(readFileSync(PLAYERS_PATH, 'utf8'), baseProfile);
  return { profile: applyExtension(baseProfile, extension, extension3, extension4), baseProfile, extension, extension3, extension4, players };
}
