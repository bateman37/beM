// MOTOR-17B §10.1: congelación ANTES de simular. Identifica CONTROL17 (worktree inmutable de 01c8ade, commit completo) y M17B (este árbol, commit completo de la implementación auditada), sus perfiles efectivos P0/P1 y su huella deportiva,
// versiones (aplicación, motor, política, conservación esencial, proyección), entorno, hashes de los planes legibles por máquina y la correspondencia lote a lote entre versiones (mismas entradas, órdenes y semillas).
// Escribe `plan/00-congelacion.json` y `plan/PLAN-LEGIBLE.md` (plan de 30 casos y 72 ejecuciones). No simula.
// Uso: node scripts/m17b-freeze.js --control=/ruta/control17 --m17b=/ruta/m17b [--out=out/motor17b]
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { cpus, release, totalmem } from 'node:os';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const CONTROL = arg('control', null); const M17B = arg('m17b', null); const OUT = arg('out', 'out/motor17b'); if (!CONTROL || !M17B) { console.error('uso: --control --m17b'); process.exit(2); }
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8' }).trim(); const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const git = (root) => ({ root, head: sh('git rev-parse HEAD', root), tree: sh('git rev-parse HEAD^{tree}', root), branch: (() => { try { return sh('git rev-parse --abbrev-ref HEAD', root); } catch { return null; } })(), status_porcelain: sh('git status --porcelain', root).split('\n').filter(Boolean), subject: sh('git log -1 --format=%s', root) });
const imp = (root, p) => import(pathToFileURL(`${root}/${p}`).href);
async function ident(root, cand) {
  const { loadData, CANDIDATES17_PATH } = await imp(root, 'scripts/node-data.js'); const F = await imp(root, 'src/batch/fingerprint.js'); const M = await imp(root, 'src/match/index.js'); const V = await imp(root, 'src/version.js'); const A = await imp(root, 'src/match/acta.js'); const E = await imp(root, 'src/batch/essential.js'); const PR = await imp(root, 'src/audit/project.js');
  const d = loadData(); let profile = d.profile;
  if (cand) { const { candidateProfile } = await imp(root, 'src/profiles/candidates.js'); profile = candidateProfile(profile, JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')).candidates.find((x) => x.id === cand)); }
  return { effective_profile_id: profile.effectiveId, profile_sport_fp: F.profileSportFingerprint(profile), profile_fp: F.profileFingerprint(profile), engine: M.ENGINE_VERSION, app: V.APP_VERSION, export_schema: M.EXPORT_SCHEMA, stats_policy: profile.statsPolicy?.id, acta_policy: A.ACTA_POLICY_ID, essential_version: E.ESSENTIAL_VERSION, projection_version: PR.PROJECTION_VERSION,
    regulation: profile.regulation?.version, dataset: profile.population?.version ?? null, extensions: (profile.extensions ?? []).map((e) => e.id), cost_per_live_minute: profile.energy.costPerLiveMinute };
}
const plans = { CONTROL17: join(OUT, 'plan', 'lotes-CONTROL17.json'), M17B: join(OUT, 'plan', 'lotes-M17B.json') }; const P = { CONTROL17: JSON.parse(readFileSync(plans.CONTROL17, 'utf8')), M17B: JSON.parse(readFileSync(plans.M17B, 'utf8')) };
const agendaOf = (v, l) => JSON.parse(readFileSync(join(OUT, 'lotes', v, l.batch_id, 'entradas/lote.json'), 'utf8')).agenda.map((e) => [e.case_id, e.variant_id, e.seed, e.input_id, e.pair_id ?? null, e.side ?? null]);
const entriesOf = (v, l) => JSON.parse(readFileSync(join(OUT, 'lotes', v, l.batch_id, 'entradas/lote.json'), 'utf8')).entries;
// correspondencia lote a lote entre versiones por (bloque, tipo, caso): el esencial de CONTROL17 y el de M17B deben compartir agenda, entradas (entry_id) y semillas
const lotCompare = P.CONTROL17.lots.map((l0) => { const l1 = P.M17B.lots.find((x) => x.block === l0.block && x.kind === l0.kind && (x.case ?? null) === (l0.case ?? null)); const a0 = agendaOf('CONTROL17', l0); const a1 = l1 ? agendaOf('M17B', l1) : null;
  return { block: l0.block, kind: l0.kind, case: l0.case ?? null, control_lot: l0.batch_id, m17b_lot: l1?.batch_id ?? null, executions: l0.executions, level: l0.level, same_inputs_and_seeds: !!a1 && JSON.stringify(a0) === JSON.stringify(a1), same_entries: !!l1 && JSON.stringify(entriesOf('CONTROL17', l0)) === JSON.stringify(entriesOf('M17B', l1)), planned_orders: l0.planned_orders ?? [] }; });
const gC = git(CONTROL); const gM = git(M17B);
const doc = { study: 'MOTOR17B-CIERRE-20261021', frozen_at: new Date().toISOString(),
  git: { CONTROL17: gC, M17B: gM }, controls: { CONTROL17_commit_full: gC.head, note: 'worktree aislado e inmutable del mismo repositorio (git worktree add --detach 01c8ade); no es el código final con una etiqueta antigua' },
  env: { node: process.version, os: release(), cpu_model: cpus()[0]?.model, cpus: cpus().length, mem_gib: Math.round(totalmem() / 2 ** 30), uname: sh('uname -a', '.') },
  dependencies: { package_json_sha256: sha(join(M17B, 'package.json')), package_lock_sha256: sha(join(M17B, 'package-lock.json')), control_package_lock_sha256: sha(join(CONTROL, 'package-lock.json')), node_modules: 'ausente (sin dependencias de ejecución); no se actualizó ningún paquete' },
  versions: { CONTROL17_P0: await ident(CONTROL, null), CONTROL17_P1: await ident(CONTROL, 'C17-02'), M17B_P0: await ident(M17B, null), M17B_P1: await ident(M17B, 'C17-02') },
  candidate: { id: 'C17-02', row: 'energy.costPerLiveMinute', before: 2, after: 3.5, role: 'referencia provisional P1 (no es calibración externa ni aceptación manual)' },
  plans: Object.fromEntries(['CONTROL17', 'M17B'].map((v) => [v, { file: plans[v], sha256: sha(plans[v]), lots: P[v].lots.length, executions: P[v].lots.reduce((s, l) => s + l.executions, 0), engine: P[v].engine }])),
  totals: { CONTROL17: P.CONTROL17.totals, M17B: P.M17B.totals }, seed_spaces: P.M17B.seed_spaces, diag_a_p: P.M17B.diag_a_p, cases: P.M17B.cases, pairs: P.M17B.pairs,
  planned_executions: { control17_essential: P.CONTROL17.lots.reduce((s, l) => s + l.executions, 0), m17b_essential: P.M17B.lots.filter((l) => l.kind === 'principal').reduce((s, l) => s + l.executions, 0), m17b_diagnostic: P.M17B.lots.filter((l) => l.kind === 'diagnostico').reduce((s, l) => s + l.executions, 0) },
  lots_inputs_comparison: lotCompare, all_inputs_identical_between_versions: lotCompare.every((x) => x.same_inputs_and_seeds && x.same_entries), clean_git_M17B: gM.status_porcelain.length === 0, clean_git_CONTROL17: gC.status_porcelain.length === 0,
  declaration: 'El plan, las semillas y los casos se congelan antes de simular. No se ajusta ningún parámetro tras ver resultados, no se eligen semillas favorables ni se eliminan casos válidos por sus marcadores. Un ensayo técnico previo de la herramienta de campaña (mismas definiciones, directorio de trabajo descartado) se declara en docs/tecnico/motor17b.md.' };
mkdirSync(join(OUT, 'plan'), { recursive: true }); const f = join(OUT, 'plan', '00-congelacion.json'); writeFileSync(f, JSON.stringify(doc, null, 1));
// plan legible
const L = [`# Plan congelado de MOTOR17B-CIERRE-20261021`, '', `CONTROL17 \`${gC.head}\` · M17B (implementación auditada) \`${gM.head}\` · Git limpio M17B: ${doc.clean_git_M17B}.`, '', `Ejecuciones planificadas: CONTROL17 esencial ${doc.planned_executions.control17_essential} + M17B esencial ${doc.planned_executions.m17b_essential} + M17B diagnóstico ${doc.planned_executions.m17b_diagnostic} = **${doc.planned_executions.control17_essential + doc.planned_executions.m17b_essential + doc.planned_executions.m17b_diagnostic}** (30 casos lógicos; las doce diagnósticas repiten esenciales y no amplían la muestra deportiva).`, '',
  '## Bloque A · doce enfrentamientos, ida y vuelta, perfil P1 (C17-02)', '', '| p | Pareja | Semilla | Diagnóstico (primer orden) |', '|---:|---|---:|---|', ...P.M17B.pairs.map((p) => `| ${p.p} | ${p.a}–${p.b} | ${p.seed_A} | ${P.M17B.diag_a_p.includes(p.p) ? 'sí' : ''} |`), '', '## Bloque B · casos de cierre', '', '| Caso | Perfil | Semilla | Definición (IDs reales) |', '|---|---|---:|---|', ...Object.entries(P.M17B.cases).map(([k, c]) => `| ${k} | ${c.profile} | ${c.seed} | ${c.note}${c.planned_orders.length ? ` · orden: ${JSON.stringify(c.planned_orders[0].spec)} en «${c.planned_orders[0].boundary}» (puesto ${c.planned_orders[0].team})` : ''}${c.variants.length && c.variants[0].ops ? ` · operaciones: ${JSON.stringify(c.variants[0].ops)}` : ''}${c.variants.length && c.variants[0].lab ? ` · variante de catálogo ${c.variants[0].lab}` : ''} |`), '',
  `Entradas, órdenes y semillas idénticas entre CONTROL17 y M17B: **${doc.all_inputs_identical_between_versions}**.`, ''];
writeFileSync(join(OUT, 'plan', 'PLAN-LEGIBLE.md'), L.join('\n'));
console.log(JSON.stringify({ control17: gC.head.slice(0, 12), m17b: gM.head.slice(0, 12), clean_git_M17B: doc.clean_git_M17B, inputs_identical: doc.all_inputs_identical_between_versions, planned: doc.planned_executions, plans: { CONTROL17: doc.plans.CONTROL17.sha256.slice(0, 12), M17B: doc.plans.M17B.sha256.slice(0, 12) }, freeze_sha256: sha(f) }));
