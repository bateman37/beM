// SIM-MOTOR-04E · congelación (§7 y §9.2, DOS congelaciones: `dev` antes de ejecutar DEV y `val` antes de la reserva VAL04D): registra las huellas de TODO lo que puede alterar generación, lectores y métricas antes de auditar, y comprueba después que no cambiaron.
//   node scripts/sim04e/freeze.js --mode=freeze --name=dev|val [--extra=<archivos separados por coma>]   escribe freeze-<name>.json (con el árbol limpio)
//   node scripts/sim04e/freeze.js --mode=verify --name=dev|val                                           compara el estado actual con freeze-<name>.json (código, datos, herramientas, plan y detallado)
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const mode = arg('mode', 'verify'); const PLAN = arg('plan', join(root, 'docs/tecnico/evidencia-sim-motor04e/plan')); const BASE = 'a4f59fb'; const NAME = arg('name', 'dev'); const FZ = join(PLAN, `freeze-${NAME}.json`); const EXTRA = (arg('extra', '') || '').split(',').filter(Boolean);
const sh = (c) => execSync(c, { cwd: root, maxBuffer: 1 << 28 }).toString().trim(); const sha = (b) => createHash('sha256').update(b).digest('hex');
const walk = (d, out = []) => { for (const n of readdirSync(join(root, d)).sort()) { const rel = join(d, n); const st = statSync(join(root, rel)); if (st.isDirectory()) walk(rel, out); else out.push(rel); } return out; };
const hashFiles = (files) => Object.fromEntries(files.map((f) => [f, sha(readFileSync(join(root, f)))]));
// BASE = base del detallado histórico (DET_04D_HIST): 04E lo modifica de forma AUTORIZADA (reloj/rebote/crédito); la lista de archivos cambiados se registra, no es un error.
// Qué puede alterar generación, lectores y métricas: todo src/, los datos, el cargador de datos, las herramientas de la campaña (scripts/sim03) y su medición (sim03-bench.js). El empaquetado, el comprobador y la documentación se registran aparte.
// La congelación `val` no vigila src/lab (interfaz: no genera deporte); `cal` vigila todo src/. Congelación `cal`: solo lo que decide la comparación de candidatas (casos, ejecutor, tablas, selector, rotación, sondas y el trabajador detallado). Congelación `val`: además el banco de medida, la comparación de equivalencia y el generador de candidata; las herramientas de análisis posterior (historia, aprendizaje, auditorías, empaquetado y comprobador) no se vigilan: leen resultados, no los producen.
const CAL_TOOLS = ['lib.js', 'exec.mjs', 'select.js', 'search.js', 'dev.js', 'tables.js', 'detailed-worker.js', 'evaluate.js'];
const VAL_TOOLS = [...CAL_TOOLS, 'write-candidate.js', 'val.js']; // el banco de medida, la equivalencia, las tablas de informe y el empaquetado leen resultados o miden coste: no producen deporte
const watched = () => [...walk('src').filter((f) => (NAME === 'dev' ? f !== 'src/sim/candidates.js' : !f.startsWith('src/lab/'))), ...walk('data'), 'scripts/node-data.js', ...walk('scripts/sim04e').filter((f) => ((NAME === 'dev' ? CAL_TOOLS : VAL_TOOLS).some((t) => f.endsWith(`/${t}`)))), ...EXTRA].filter((f) => existsSync(join(root, f)));
const sportDetailed = () => [...walk('src/match'), ...walk('src/population'), ...walk('src/knowledge'), ...walk('data/match')];
const current = () => {
  const files = hashFiles(watched()); const planFiles = hashFiles(['agenda.csv', 'entries.jsonl.gz', 'plan.json', 'search-config.json'].map((f) => relative(root, join(PLAN, f))));
  const detailedNow = hashFiles(sportDetailed()); const detailedBase = {}; for (const f of sportDetailed()) { try { detailedBase[f] = sha(execSync(`git show ${BASE}:${f}`, { cwd: root, maxBuffer: 1 << 28 })); } catch { detailedBase[f] = null; } }
  const changedDetailed = Object.keys(detailedNow).filter((f) => detailedBase[f] !== detailedNow[f]);
  return { files, planFiles, detailedNow, changedDetailedVsBase: changedDetailed };
};
if (mode === 'freeze') {
  const dirty = sh('git status --porcelain -- src data scripts/sim04e scripts/node-data.js docs/tecnico/evidencia-sim-motor04e/plan'); if (dirty) { console.error('árbol sucio en lo vigilado:\n' + dirty); process.exit(2); }
  const cur = current(); const head = sh('git rev-parse HEAD');
  const mod = await import('../../src/sim/version.js'); const vv = await import('../../src/version.js'); const { loadEnv } = await import('./lib.js'); const env = loadEnv(); const { createMatch, buildResult } = await import('../../src/match/index.js'); const { buildMatchInput } = await import('../../src/match/index.js');
  const m = createMatch(buildMatchInput(env.profile, env.players, { seed: 20261016 }), env.profile, { detail: 'full' }); while (m.step()); const ref = buildResult(m);
  const out = { schema: 'beM-sim04e-freeze/1', name: NAME, frozenAt: new Date().toISOString(), codeCommit: head, branch: sh('git rev-parse --abbrev-ref HEAD'), base: BASE, node: process.version,
    versions: { app: vv.APP_VERSION, includes: vv.APP_INCLUDES, sim: mod.SIM_VERSION, simProfile: mod.SIM_PROFILE_ID, resultSchema: mod.SIM_RESULT_SCHEMA, snapshotSchema: mod.SIM_SNAPSHOT_SCHEMA, coverage: mod.SIM_COVERAGE_ID, statsPolicy: mod.SIM_STATS_POLICY_ID, recon: mod.SIM_RECON_POLICY_ID, effectiveProfileFingerprint: env.ctx.sp.fingerprint, tablesFingerprint: env.ctx.T.fingerprint, detailedProfile: ref.identity.effectiveProfileId, engine: ref.identity.engineVersion ?? null },
    detailedReference: { seed: 20261016, score: ref.score, sportingDraws: ref.diagnostics.sportingDraws, note: 'referencia NUEVA del detallado corregido (DET_04E_REF): no es objetivo de calibración y no se recalibró para volver a 83–98 (referencia histórica de 04D con 6.684 sorteos)' },
    files: cur.files, planFiles: cur.planFiles, detailedSportFiles: { count: Object.keys(cur.detailedNow).length, changedVsBase: cur.changedDetailedVsBase, hashes: cur.detailedNow } };
  writeFileSync(FZ, JSON.stringify(out, null, 1)); console.log(JSON.stringify({ mode, codeCommit: head, watchedFiles: Object.keys(cur.files).length, detailedSportFiles: out.detailedSportFiles.count, detailedChangedVsBase: cur.changedDetailedVsBase.length, reference: out.detailedReference }, null, 1)); process.exit(0);
}
const fz = JSON.parse(readFileSync(FZ, 'utf8')); const cur = current(); const diff = (a, b) => { const out = { changed: [], added: [], removed: [] }; for (const k of Object.keys(b)) { if (!(k in a)) out.added.push(k); else if (a[k] !== b[k]) out.changed.push(k); } for (const k of Object.keys(a)) if (!(k in b)) out.removed.push(k); return out; };
const r = { files: diff(fz.files, cur.files), plan: diff(fz.planFiles, cur.planFiles), detailed: diff(fz.detailedSportFiles.hashes, cur.detailedNow), codeCommitFrozen: fz.codeCommit, headNow: sh('git rev-parse HEAD') };
r.ok = [r.files, r.plan, r.detailed].every((d) => !d.changed.length && !d.added.length && !d.removed.length);
console.log(JSON.stringify({ mode, ok: r.ok, codeCommitFrozen: r.codeCommitFrozen, headNow: r.headNow, files: { changed: r.files.changed, added: r.files.added, removed: r.files.removed }, plan: r.plan, detailed: r.detailed }, null, 1)); process.exit(r.ok ? 0 : 1);
