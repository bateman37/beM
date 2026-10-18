// MOTOR-17 §13.2: congelación ANTES de simular. Identifica R0 y R17 (commit completo, árbol, estado de Git, perfiles efectivos y su huella deportiva, políticas, dependencias, Node/SO/CPU), calcula los hashes de los planes de cierre
// (entradas, variantes, semillas y selección diagnóstica ya materializadas por `m17-campaign.js create`) y comprueba que las dos versiones comparten exactamente las mismas entradas. No simula.
// Uso: node scripts/m17-freeze.js --r0=/ruta/r0 --r17=/ruta/r17 [--out=out/motor17]
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { cpus, release, totalmem } from 'node:os';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const R0 = arg('r0', null); const R17 = arg('r17', null); const OUT = arg('out', 'out/motor17'); if (!R0 || !R17) { console.error('uso: --r0 --r17'); process.exit(2); }
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8' }).trim(); const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const git = (root) => ({ root, head: sh('git rev-parse HEAD', root), tree: sh('git rev-parse HEAD^{tree}', root), branch: (() => { try { return sh('git rev-parse --abbrev-ref HEAD', root); } catch { return null; } })(), status_porcelain: sh('git status --porcelain', root).split('\n').filter(Boolean), subject: sh('git log -1 --format=%s', root) });
const imp = (root, p) => import(pathToFileURL(`${root}/${p}`).href);
async function ident(root, cand) {
  const { loadData, CANDIDATES17_PATH } = await imp(root, 'scripts/node-data.js'); const F = await imp(root, 'src/batch/fingerprint.js'); const M = await imp(root, 'src/match/index.js'); const V = await imp(root, 'src/version.js'); const A = await imp(root, 'src/match/acta.js');
  const d = loadData(); let profile = d.profile;
  if (cand) { const { candidateProfile } = await imp(root, 'src/profiles/candidates.js'); profile = candidateProfile(profile, JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')).candidates.find((x) => x.id === cand)); }
  return { effective_profile_id: profile.effectiveId, profile_sport_fp: F.profileSportFingerprint(profile), engine: M.ENGINE_VERSION, app: V.APP_VERSION, export_schema: M.EXPORT_SCHEMA, stats_policy: profile.statsPolicy?.id, acta_policy: A.ACTA_POLICY_ID, regulation: profile.regulation?.version, dataset: profile.population?.version ?? null, extensions: (profile.extensions ?? []).map((e) => e.id) };
}
const plans = { R0: join(OUT, 'plan', 'lotes-R0.json'), R17: join(OUT, 'plan', 'lotes-R17.json') }; const P = { R0: JSON.parse(readFileSync(plans.R0, 'utf8')), R17: JSON.parse(readFileSync(plans.R17, 'utf8')) };
// entradas: el input_id de cada ejecución de cada lote debe coincidir entre versiones
const agendaOf = (v, l) => JSON.parse(readFileSync(join(OUT, 'lotes', v, l.batch_id, 'entradas/lote.json'), 'utf8')).agenda.map((e) => [e.case_id, e.variant_id, e.seed, e.input_id, e.pair_id ?? null, e.side ?? null]);
const lotCompare = P.R0.lots.map((l0, i) => { const l1 = P.R17.lots[i]; const a0 = agendaOf('R0', l0); const a1 = agendaOf('R17', l1); const same = JSON.stringify(a0) === JSON.stringify(a1) && l0.label.replace('R0', 'R17') === l1.label; return { label: l1.label, executions: l1.executions, level: l1.level, same_inputs_and_seeds: same, agenda_sha256: createHash('sha256').update(JSON.stringify(a1)).digest('hex') }; });
const doc = { study: 'MOTOR17-CIERRE-20261018', frozen_at: new Date().toISOString(),
  git: { R0: git(R0), R17: git(R17), stages: { R0: '6a6814c', A17: readFileSync(join(OUT, 'A17-commit.txt'), 'utf8').trim(), A17b: readFileSync(join(OUT, 'A17b-commit.txt'), 'utf8').trim(), P17: readFileSync(join(OUT, 'P17-commit.txt'), 'utf8').trim(), P17b: readFileSync(join(OUT, 'P17b-commit.txt'), 'utf8').trim() } },
  env: { node: process.version, os: release(), cpu_model: cpus()[0]?.model, cpus: cpus().length, mem_gib: Math.round(totalmem() / 2 ** 30), uname: sh('uname -a', '.') },
  dependencies: { package_json_sha256: sha(join(R17, 'package.json')), package_lock_sha256: sha(join(R17, 'package-lock.json')), node_modules: 'ausente (sin dependencias de ejecución); no se actualizó ningún paquete', r0_package_lock_sha256: sha(join(R0, 'package-lock.json')) },
  versions: { R0: await ident(R0, null), R17: await ident(R17, 'C17-02'), P17_base: await ident(R17, null), C17_01: await ident(R17, 'C17-01'), C17_02: await ident(R17, 'C17-02') },
  chosen_candidate: 'C17-02', selection_note: 'elegida y justificada en docs/tecnico/motor17.md §6.1 antes de abrir resultados de cierre; ninguna semilla de cierre se usó para elegirla',
  plans: { R0: { file: plans.R0, sha256: sha(plans.R0), lots: P.R0.lots.length, executions: P.R0.lots.reduce((s, l) => s + l.executions, 0) }, R17: { file: plans.R17, sha256: sha(plans.R17), lots: P.R17.lots.length, executions: P.R17.lots.reduce((s, l) => s + l.executions, 0) } },
  totals: { R0: P.R0.totals, R17: P.R17.totals }, seed_spaces: P.R17.seed_spaces, diagnostic_selection: P.R17.lots.filter((l) => l.kind === 'diagnostico').map((l) => ({ label: l.label, case_seeds: l.case_seeds, variants: l.variants })),
  lots_inputs_comparison: lotCompare, all_inputs_identical_between_versions: lotCompare.every((x) => x.same_inputs_and_seeds), clean_git_R17: git(R17).status_porcelain.length === 0 };
mkdirSync(join(OUT, 'plan'), { recursive: true }); const f = join(OUT, 'plan', '00-congelacion.json'); writeFileSync(f, JSON.stringify(doc, null, 1));
console.log(JSON.stringify({ r0: doc.git.R0.head.slice(0, 12), r17: doc.git.R17.head.slice(0, 12), clean_git_R17: doc.clean_git_R17, inputs_identical: doc.all_inputs_identical_between_versions, plans: { R0: doc.plans.R0.sha256.slice(0, 12), R17: doc.plans.R17.sha256.slice(0, 12) }, freeze_sha256: sha(f) }));
