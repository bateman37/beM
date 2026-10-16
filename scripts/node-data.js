// Carga de datos para Node (comprobaciones y scripts). El núcleo no usa el sistema de ficheros.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parsePlayersCsv } from '../src/match/data.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PROFILE_PATH = join(ROOT, 'data/match/motor01-seed-profile.json');
export const PLAYERS_PATH = join(ROOT, 'data/fixtures/reference-players-MOTOR01.csv');

export function loadData() {
  const profile = JSON.parse(readFileSync(PROFILE_PATH, 'utf8'));
  const players = parsePlayersCsv(readFileSync(PLAYERS_PATH, 'utf8'), profile);
  return { profile, players };
}
