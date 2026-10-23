// SIM-MOTOR-01 §2.3: congela la referencia del motor detallado (identidad, huellas de archivos deportivos, ejecución de la referencia).
// Uso: node scripts/sim01-freeze.js [--out=ruta.json]. Solo lee; no modifica nada.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { loadData, ROOT } from './node-data.js';
import { buildMatchInput, runMatch, ENGINE_VERSION, EXPORT_SCHEMA } from '../src/match/index.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';
import { fingerprint } from '../src/population/index.js';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
export function sportFiles() {
  const files = [...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'data'))].map((p) => relative(ROOT, p).split('\\').join('/'))
    .filter((p) => !p.startsWith('src/lab/') && p !== 'src/version.js' && !p.startsWith('src/sim/')).sort();
  return files.map((f) => ({ file: f, sha256: sha(join(ROOT, f)) }));
}
export function freezeReference() {
  const { profile, players } = loadData();
  const input = buildMatchInput(profile, players, { seed: 20261016 });
  const res = runMatch(input, profile, { detail: 'full' });
  const files = sportFiles();
  return {
    engine: ENGINE_VERSION, export_schema: EXPORT_SCHEMA, profile_id: profile.effectiveId,
    input_fingerprint: fingerprint(input), seed: input.seed,
    result: { status: res.status, score: res.score, periods: res.periodScores.map((p) => p.points), events: res.events.length, possessions: res.diagnostics.possessions },
    sporting_draws: res.diagnostics.sportingDraws, trajectory_fp: trajectoryFingerprint(res),
    sport_files: files.length, sport_files_digest: createHash('sha256').update(files.map((f) => `${f.file}:${f.sha256}`).join('\n')).digest('hex'), files,
  };
}
if (process.argv[1]?.endsWith('sim01-freeze.js')) {
  const out = (process.argv.find((a) => a.startsWith('--out=')) ?? '').slice(6);
  const f = freezeReference();
  console.log(JSON.stringify({ ...f, files: undefined }, null, 1));
  if (out) writeFileSync(out, JSON.stringify(f, null, 1));
}
