// Reproduce un encuentro exportado por el laboratorio (formato beM-match-export/2) y compara su proyección deportiva.
// Uso: node scripts/replay-match.js fichero.json     (npm run replay -- fichero.json)
import { readFileSync } from 'node:fs';
import { replayMatch, validateReplayFile } from '../src/match/replay.js';

const path = process.argv[2];
if (!path) { console.error('Uso: node scripts/replay-match.js fichero.json'); process.exit(2); }
let file;
try { file = JSON.parse(readFileSync(path, 'utf8')); } catch (e) { console.error(`No se pudo leer el archivo: ${e.message}`); process.exit(2); }
const v = validateReplayFile(file);
if (!v.reproducible) { console.error('No reproducible:\n - ' + v.problems.join('\n - ')); process.exit(1); }
const { result, comparison } = replayMatch(file);
console.log(`Reproducción de ${path}: ${result.teams[0].id} ${result.score[0]} – ${result.score[1]} ${result.teams[1].id} (${result.status}) · ${result.diagnostics.steps} fronteras · ${result.commands.length} comandos`);
console.log(comparison.identical ? 'IDÉNTICA: mismos hechos, sorteos, acta, parciales y órdenes bajo la misma versión.' : `DIFERENTE en: ${Object.entries(comparison.parts).filter(([, ok]) => !ok).map(([k]) => k).join(', ')}`);
if (comparison.firstEventDifference) console.log('Primer hecho distinto:', JSON.stringify(comparison.firstEventDifference).slice(0, 600));
process.exit(comparison.identical ? 0 : 1);
