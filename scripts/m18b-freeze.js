// MOTOR-18 §15: congelación ANTES de simular. Identifica CONTROL17B (worktree inmutable de f67113e, commit completo) y M18 (este árbol), sus perfiles efectivos P0/P1, versiones, entorno, hashes de los planes y la
// correspondencia lote a lote entre versiones para el bloque A (mismas entradas deportivas y semillas). Escribe `plan/00-congelacion.json`, `plan/AGENDA.json` (máquina) y `plan/AGENDA.md` (legible). No simula.
// Uso: node scripts/m18-freeze.js --control=/ruta/control17b --m18=/ruta/m18 [--out=out/motor18b]
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { cpus, release, totalmem } from 'node:os';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const CONTROL = arg('control', null); const M18 = arg('m18', null); const OUT = arg('out', 'out/motor18b'); if (!CONTROL || !M18) { console.error('uso: --control --m18'); process.exit(2); }
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8' }).trim(); const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const git = (root) => ({ root, head: sh('git rev-parse HEAD', root), tree: sh('git rev-parse HEAD^{tree}', root), branch: (() => { try { return sh('git rev-parse --abbrev-ref HEAD', root); } catch { return null; } })(), status_porcelain: sh('git status --porcelain', root).split('\n').filter(Boolean), subject: sh('git log -1 --format=%s', root) });
const imp = (root, p) => import(pathToFileURL(`${root}/${p}`).href);
async function ident(root, cand) {
  const { loadData, CANDIDATES17_PATH } = await imp(root, 'scripts/node-data.js'); const F = await imp(root, 'src/batch/fingerprint.js'); const M = await imp(root, 'src/match/index.js'); const V = await imp(root, 'src/version.js'); const A = await imp(root, 'src/match/acta.js'); const E = await imp(root, 'src/batch/essential.js'); const PR = await imp(root, 'src/audit/project.js');
  const d = loadData(); let profile = d.profile;
  if (cand) { const { candidateProfile } = await imp(root, 'src/profiles/candidates.js'); profile = candidateProfile(profile, JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')).candidates.find((x) => x.id === cand)); }
  return { effective_profile_id: profile.effectiveId, profile_sport_fp: F.profileSportFingerprint(profile), profile_fp: F.profileFingerprint(profile), engine: M.ENGINE_VERSION, app: V.APP_VERSION, export_schema: M.EXPORT_SCHEMA, stats_policy: profile.statsPolicy?.id, acta_policy: A.ACTA_POLICY_ID, essential_version: E.ESSENTIAL_VERSION, projection_version: PR.PROJECTION_VERSION,
    regulation: profile.regulation?.version, dataset: profile.population?.version ?? null, extensions: (profile.extensions ?? []).map((e) => e.id), cost_per_live_minute: profile.energy.costPerLiveMinute, familiarity: profile.familiarity ? { version: profile.familiarity.version, enabled: profile.familiarity.activation.enabled, policy: profile.familiarity.activation.compatibilityPolicy } : null };
}
const plans = { CONTROL17B: join(OUT, 'plan', 'lotes-CONTROL17B.json'), M18B: join(OUT, 'plan', 'lotes-M18B.json') }; const P = { CONTROL17B: JSON.parse(readFileSync(plans.CONTROL17B, 'utf8')), M18B: JSON.parse(readFileSync(plans.M18B, 'utf8')) };
const lotJson = (v, l, rel) => JSON.parse(readFileSync(join(OUT, 'lotes', v, l.batch_id, rel), 'utf8'));
const agendaOf = (v, l) => lotJson(v, l, 'entradas/lote.json').agenda.map((e) => [e.case_id, e.variant_id, e.seed, e.pair_id ?? null, e.side ?? null]);
// Correspondencia deportiva del bloque A: mismos equipos (fichas sin los bloques nuevos), mismos planes, órdenes y semilla. Se compara el CONTENIDO deportivo de la entrada congelada, no su huella (que incluye metadatos y bloques nuevos).
const stripNew = (t) => { const { coachLearning, ...r } = t; void coachLearning; return { ...r, players: r.players.map(({ knowledge, development, ...p }) => { void knowledge; void development; return p; }) }; };
const sportOf = (v, l) => { const lote = lotJson(v, l, 'entradas/lote.json'); return lote.entries.map((id) => { const e = lotJson(v, l, `entradas/partidos/${id}.json`); return { planned_orders: e.planned_orders, importance: e.importance, changes: e.changes, teams: e.teams.map((t) => ({ players: stripNew(lotJson(v, l, `entradas/equipos/${t.players_ref}.json`)), plan: lotJson(v, l, `entradas/planes/${t.plan_ref}.json`) })) }; }); };
const canon = (x) => JSON.stringify(x, (k, val) => (val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.keys(val).sort().map((q) => [q, val[q]])) : val));
const lotCompare = P.CONTROL17B.lots.map((l0) => { const l1 = P.M18B.lots.find((x) => x.block === l0.block && x.case === l0.case && x.kind === l0.kind); const same = !!l1 && canon(agendaOf('CONTROL17B', l0)) === canon(agendaOf('M18B', l1)); const sameSport = !!l1 && canon(sportOf('CONTROL17B', l0)) === canon(sportOf('M18B', l1));
  return { block: l0.block, case: l0.case, control_lot: l0.batch_id, m18_lot: l1?.batch_id ?? null, level: l0.level, same_agenda_and_seeds: same, same_sport_input: sameSport, neutrality: l0.neutral ?? null, input_schema: { control: lotJson('CONTROL17B', l0, 'entradas/lote.json').entries.length ? lotJson('CONTROL17B', l0, `entradas/partidos/${lotJson('CONTROL17B', l0, 'entradas/lote.json').entries[0]}.json`).input_schema : null, m18: l1 ? lotJson('M18B', l1, `entradas/partidos/${lotJson('M18B', l1, 'entradas/lote.json').entries[0]}.json`).input_schema : null } }; });
const gC = git(CONTROL); const gM = git(M18);
const versions = { CONTROL17B_P0: await ident(CONTROL, null), CONTROL17B_P1: await ident(CONTROL, 'C17-02'), M18_P0: await ident(M18, null), M18_P1: await ident(M18, 'C17-02') };
const agenda = { study: 'MOTOR18B-CIERRE-20261022', planned_executions: 36, breakdown: { A: 12, B: 16, C: 6, D: 2 }, runs: [] };
const push = (id, o) => agenda.runs.push({ id, ...o });
for (const l of P.CONTROL17B.lots) push(`${l.case}-CONTROL17B`, { block: 'A', version: 'CONTROL17B', lot: l.batch_id, level: l.level, profile: l.profile, seed: P.CONTROL17B.cases.A[l.case].seed, purpose: 'control neutral', neutral: l.neutral });
for (const l of P.M18B.lots) {
  if (l.block === 'A') push(`${l.case}-M18B`, { block: 'A', version: 'M18B', lot: l.batch_id, level: l.level, profile: l.profile, seed: P.M18B.cases.A[l.case].seed, purpose: 'M18 neutral', neutral: l.neutral });
  else if (l.block === 'B') for (const kv of ['K8', 'K28']) push(`${l.case}-${kv}`, { block: 'B', version: 'M18B', lot: l.batch_id, level: l.level, profile: 'P1', seed: P.M18B.cases.B[l.case].seed, variant: kv, purpose: `contraste: ${l.contrast}`, diagnostic_link: P.M18B.lots.find((x) => x.block === 'C' && x.case === l.case && x.variant === kv)?.batch_id ?? null });
  else if (l.block === 'C') push(`C-${l.case}-${l.variant}`, { block: 'C', version: 'M18B', lot: l.batch_id, level: l.level, profile: 'P1', seed: P.M18B.cases.B[l.case].seed, variant: l.variant, purpose: 'repetición diagnóstica (no es un caso deportivo nuevo)', essential_link: `${l.case}-${l.variant}` });
  else if (l.block === 'D') push('D01', { block: 'D', version: 'M18B', lot: l.batch_id, level: l.level, profile: 'P1', seed: P.M18B.cases.B.B01.seed, variant: l.variant, purpose: l.note, essential_link: 'B01-K8' });
}
push('D02', { block: 'D', version: 'M18B', lot: null, level: 'world-essential', profile: 'P1', seed: P.M18B.special[0].seed, variant: 'K28', purpose: 'guardar/restaurar en la primera frontera de periodo y continuar; compara con B02-K28', essential_link: 'B02-K28', special: true });
const doc = { study: 'MOTOR18B-CIERRE-20261022', frozen_at: new Date().toISOString(), git: { CONTROL17B: gC, M18B: gM }, controls: { CONTROL17B_commit_full: gC.head, note: 'worktree aislado e inmutable del mismo repositorio (git worktree add f67113e); no es el código final con una etiqueta antigua' },
  env: { node: process.version, os: release(), cpu_model: cpus()[0]?.model, cpus: cpus().length, mem_gib: Math.round(totalmem() / 2 ** 30), uname: sh('uname -a', '.') },
  dependencies: { package_json_sha256: sha(join(M18, 'package.json')), package_lock_sha256: sha(join(M18, 'package-lock.json')), node_modules: 'ausente (sin dependencias de ejecución)' },
  versions, candidate: { id: 'C17-02', row: 'energy.costPerLiveMinute', before: 2, after: 3.5, role: 'referencia provisional P1 (ni calibración externa ni aceptación manual)' },
  plans: Object.fromEntries(['CONTROL17B', 'M18B'].map((v) => [v, { file: plans[v], sha256: sha(plans[v]), lots: P[v].lots.length, executions: P[v].lots.reduce((s, l) => s + l.executions, 0), engine: P[v].engine }])),
  agenda_runs: agenda.runs.length, planned_executions: { control17b: 6, m18_batch: P.M18B.lots.reduce((s, l) => s + l.executions, 0), special: 1, total: 6 + P.M18B.lots.reduce((s, l) => s + l.executions, 0) + 1 },
  lots_a_comparison: lotCompare, a_inputs_identical_sport: lotCompare.every((x) => x.same_agenda_and_seeds && x.same_sport_input), clean_git_M18: gM.status_porcelain.length === 0, clean_git_CONTROL17B: gC.status_porcelain.length === 0,
  declaration: 'La agenda, las semillas, los perfiles y las diferencias se congelan antes de simular. No se ajusta ningún valor de SEM18 tras ver resultados; un defecto de implementación conserva el intento y se repite solo lo invalidado, identificado.' };
mkdirSync(join(OUT, 'plan'), { recursive: true }); const f = join(OUT, 'plan', '00-congelacion.json'); writeFileSync(f, JSON.stringify(doc, null, 1)); writeFileSync(join(OUT, 'plan', 'AGENDA.json'), JSON.stringify(agenda, null, 1));
const md = ['# Agenda congelada de MOTOR18B-CIERRE-20261022', '', `CONTROL17B \`${gC.head}\` · M18 \`${gM.head}\` · Git limpio M18B: ${doc.clean_git_M18}.`, '', `Total planificado: **${agenda.runs.length}** (A 12 + B 16 + C 6 + D 2). No son 36 observaciones independientes.`, '', '| ID | Bloque | Versión | Nivel | Perfil | Semilla | Variante | Finalidad |', '|---|---|---|---|---|---:|---|---|',
  ...agenda.runs.map((r) => `| ${r.id} | ${r.block} | ${r.version} | ${r.level} | ${r.profile} | ${r.seed} | ${r.variant ?? ''} | ${r.purpose} |`), '', `Entradas deportivas del bloque A idénticas entre versiones: **${doc.a_inputs_identical_sport}**.`, ''];
writeFileSync(join(OUT, 'plan', 'AGENDA.md'), md.join('\n'));
console.log(JSON.stringify({ control: gC.head.slice(0, 12), m18: gM.head.slice(0, 12), clean_git_M18: doc.clean_git_M18, runs: agenda.runs.length, a_identical: doc.a_inputs_identical_sport, planned: doc.planned_executions, freeze_sha256: sha(f) }));
