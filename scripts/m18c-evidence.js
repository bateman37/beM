// MOTOR-18C: genera la evidencia pequeña de los dos arreglos a partir de los CONSUMIDORES REALES (tests/m18c-fixture.js): identidad-casos.json, estados-y-recibos.json y la comparación de contenido de las áreas deportivas
// y de los datos del perfil entre la base y el árbol de trabajo. No lanza partidos ni campañas. Uso: node scripts/m18c-evidence.js [--out=out/motor18c/rapido] [--base=d744e23]
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor18c/rapido'); const BASE = arg('base', 'd744e23'); mkdirSync(OUT, { recursive: true });
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 }); const sha = (b) => createHash('sha256').update(b).digest('hex');
const { runScenarios, Core } = await import('../tests/m18c-fixture.js');
const R = runScenarios(); if (Object.keys(R.errors).length) { console.error('escenarios con error', R.errors); process.exit(1); }

const head = git('rev-parse', 'HEAD').trim(); const baseFull = git('rev-parse', BASE).trim();
const identity = { schema: 'beM-m18c-identidad-casos/1', note: 'Una fila por caso y equipo. `expected_source` es la fuente completa esperada (<copia>|M<n>|<equipo>); `registered` = registro del equipo tras la acción (id, tipo, fuente, estado). Generado ejecutando los manejadores reales de la tarjeta posterior al partido (tests/m18c-fixture.js) sobre un DOM mínimo.', base: baseFull, code_head: head, cases: R.identity };
writeFileSync(join(OUT, 'identidad-casos.json'), JSON.stringify(identity, null, 1));

const sec = (L) => ({ learning: { states: L.states }, registry: { ledgers: L.ledgers }, sequences: { sessionSeq: L.sessionSeq, matchSeq: L.matchSeq, undo: L.undo }, fingerprints: Object.fromEntries(Object.entries(L.states).map(([t, s]) => [t, Core.teamFingerprint(s)])) });
const t3 = R.states.T18C_03; const copySnap = (c) => ({ copy_id: c.copy.id, ...sec(c), full_snapshot_sha256: sha(JSON.stringify(c)) });
const t4 = R.states.T18C_04;
const states = { schema: 'beM-m18c-estados-y-recibos/1', note: 'Estado de aprendizaje (`learning`), registro de aplicaciones (`registry`) y secuencias (`sequences`) por separado. La huella de cada equipo es `teamFingerprint(state)` de src/learning/team.js y puede recalcularse desde `learning.states[equipo]`.',
  'T18C-03': { copyA: { before: copySnap(t3.copyA_before), after: copySnap(t3.copyA_after) }, copyB: { before: copySnap(t3.copyB_before), after: copySnap(t3.copyB_after) }, stale_handler: R.stale },
  'T18C-04': { before: t4.before, after_apply: t4.after_apply, after_undo: t4.after_undo, observed: { first: { message: R.ok4.first.message, changed_entries: R.ok4.first.changed }, repeat: { message: R.ok4.repeatMessage, unchanged: R.ok4.repeatUnchanged, core: R.ok4.coreRejectsDuplicate }, restored: R.ok4.restored, undo: R.ok4.undo, reapply_enabled: R.ok4.reapplyEnabled } },
  'T18C-02': { foreign: R.foreign, malformed: R.malformed } };
writeFileSync(join(OUT, 'estados-y-recibos.json'), JSON.stringify(states));

// Comparación de contenido (SHA-256 de cada archivo) entre la base y el árbol de trabajo. Rutas comparadas: todo `src/` salvo `src/lab/` y `src/version.js` (la etiqueta de aplicación permitida) y todo `data/`.
const PREFIXES = ['src/', 'data/']; const EXCLUDED = ['src/lab/', 'src/version.js'];
const inScope = (f) => PREFIXES.some((p) => f.startsWith(p)) && !EXCLUDED.some((e) => f.startsWith(e));
const baseFiles = git('ls-tree', '-r', '--name-only', baseFull).split('\n').filter(Boolean).filter(inScope);
const nowFiles = git('ls-files', '-co', '--exclude-standard').split('\n').filter(Boolean).filter(inScope);
const all = [...new Set([...baseFiles, ...nowFiles])].sort(); const rows = []; const diffs = [];
for (const f of all) {
  let a = null; try { a = sha(execFileSync('git', ['show', `${baseFull}:${f}`], { maxBuffer: 1 << 28 })); } catch { /* ausente en la base */ }
  const b = existsSync(f) ? sha(readFileSync(f)) : null; rows.push({ path: f, base_sha256: a, now_sha256: b, equal: a === b }); if (a !== b) diffs.push(f);
}
const byPrefix = Object.fromEntries(['src/analysis', 'src/audit', 'src/batch', 'src/engine', 'src/knowledge', 'src/learning', 'src/match', 'src/population', 'src/profiles', 'data/batch', 'data/fixtures', 'data/match', 'data/catalog.json'].map((p) => { const r = rows.filter((x) => x.path.startsWith(p)); return [p, { files: r.length, identical: r.filter((x) => x.equal).length }]; }));
writeFileSync(join(OUT, 'comparacion-areas-deportivas.json'), JSON.stringify({ schema: 'beM-m18c-comparacion-areas/1', base: baseFull, compared_prefixes: PREFIXES, excluded: EXCLUDED, exclusion_reason: 'src/lab/ es la interfaz del laboratorio (objeto de la corrección) y src/version.js solo cambia la etiqueta de la aplicación (permitida por el encargo); metadatos de Git no se comparan', files_compared: rows.length, all_identical: diffs.length === 0, differing: diffs, by_prefix: byPrefix, files: rows }, null, 1));
console.log(JSON.stringify({ identityRows: R.identity.length, areas: { compared: rows.length, differing: diffs } }));
if (diffs.length) process.exit(1);
