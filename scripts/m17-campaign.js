// MOTOR-17 §14: campaña comparativa de cierre MOTOR17-CIERRE-20261018 (R0 frente a R17). Un mismo guion sirve a los dos árboles de código: `--tree` indica la raíz que se importa (R0 = worktree de 6a6814c; R17 = este árbol), de modo
// que cada versión se ejecuta con SU motor, SU perfil y SUS lectores, sin etiquetas antiguas sobre el ejecutable final. Las entradas (equipos naturales EQ01–EQ12, planes MOTOR-11), semillas y variantes son idénticas en las dos versiones.
// Uso: node scripts/m17-campaign.js create --version=R0|R17 --tree=/ruta [--out=out/motor17]      congela los lotes (NO ejecuta) y escribe el plan
//      node scripts/m17-campaign.js run --version=R0|R17 --tree=/ruta [--match=regex] [--out=out/motor17]   ejecuta los lotes ya congelados (pool existente)
// Semillas (§14): A seed_A = 271000000 + 1000·p + 1 (el prompt fija 270000000; ese espacio se usó en lecturas exploratorias de R0 durante el desarrollo: se declara y se cambia el espacio antes de abrir resultados),
// B seed_B = 280000000 + 1000·e + r, C 290000001, D seed_D = 300000000 + 1000·f + r.
import { writeFileSync, readFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const MODE = process.argv[2]; const VERSION = arg('version', null); const TREE = arg('tree', null); const OUT = arg('out', 'out/motor17'); const MATCH = new RegExp(arg('match', '.'));
if (!['create', 'run'].includes(MODE) || !['R0', 'R17'].includes(VERSION) || !TREE) { console.error('uso: create|run --version=R0|R17 --tree=<raíz>'); process.exit(2); }
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const { loadData, CANDIDATES17_PATH } = await imp('scripts/node-data.js'); const P = await imp('src/population/index.js'); const { JobStore } = await imp('src/batch/jobstore.js'); const { BatchController } = await imp('src/batch/runner.js'); const { WorkerPool } = await imp('src/batch/executors.js');
const { experimentCatalog, experimentSpec } = await imp('src/audit/experiments.js'); const { ENGINE_VERSION } = await imp('src/match/index.js');
const data = loadData(); let profile = data.profile; const players = data.players;
// R17 = código final + perfil PROPUESTO para el cierre (candidata elegida en docs/tecnico/motor17.md §8, congelada antes de simular). R0 = MOTOR-15B tal cual.
const CHOSEN = arg('candidate', 'C17-02');
if (VERSION === 'R17') { const { candidateProfile } = await imp('src/profiles/candidates.js'); const cands = JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')); const c = cands.candidates.find((x) => x.id === CHOSEN); if (!c) throw new Error(`candidata ${CHOSEN} desconocida`); profile = candidateProfile(profile, c); }
mkdirSync(join(OUT, 'plan'), { recursive: true }); mkdirSync(join(OUT, 'logs'), { recursive: true });
const ROOT = join(OUT, 'lotes', VERSION); const PLAN = join(OUT, 'plan', `lotes-${VERSION}.json`);
const IDS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`);
const nat = Object.fromEntries(IDS.map((id) => [id, P.referenceTeam(profile, players, id)]));
const PAIRS = []; for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) PAIRS.push([IDS[i], IDS[j]]); // p = índice + 1, orden lexicográfico
const seedA = (p) => 271000000 + 1000 * p + 1; const seedB = (e, r) => 280000000 + 1000 * e + r; const SEED_C = 290000001; const seedD = (f, r) => 300000000 + 1000 * f + r;
const base = (level) => ({ recordLevel: level, prose: 'omitted', concurrency: level === 'diagnostic' ? 2 : 4, importance: 'ordinary' });

if (MODE === 'create') {
  const store = new JobStore(ROOT); const ctl = new BatchController({ store, executor: null });
  const lots = []; const problems = [];
  const make = (meta, spec) => { const r = ctl.create(spec, profile, { players, label: `MOTOR17-${VERSION}-${meta.label}` }); if (!r.ok) { problems.push({ ...meta, problems: r.problems }); return; } lots.push({ ...meta, label: `MOTOR17-${VERSION}-${meta.label}`, version: VERSION, batch_id: r.batchId, cases: r.counts.cases, executions: r.counts.executions, agenda_fp: r.agendaFp, level: spec.recordLevel, concurrency_requested: spec.concurrency, case_seeds: spec.caseSeeds, batch_seed: spec.batchSeed, variants: (spec.variants ?? []).map((v) => v.id), effective_profile_id: profile.effectiveId }); };
  // ---- A · natural: 66 pares × dos localías (H0, H1) con la misma semilla
  make({ block: 'A', kind: 'principal', label: 'A-natural' }, { ...base('world-essential'), mode: 'pairs', pairs: PAIRS, repetitions: 1, venue: 'home_away', teams: nat, batchSeed: 271000000, caseSeeds: PAIRS.flatMap((_, i) => [seedA(i + 1), seedA(i + 1)]), objective: 'MOTOR17 A · cruces naturales' });
  // ---- B · mecanismos: EXP13-01…12 × r=1,2 × dos variantes (las dos variantes y las dos versiones comparten semilla)
  const cat = experimentCatalog(profile, players); const expSpec = Object.fromEntries(cat.map((exp) => [exp.id, { exp, spec: experimentSpec(exp, profile, players) }]));
  for (const { exp, spec } of Object.values(expSpec)) make({ block: 'B', kind: 'principal', label: `B-${exp.id}`, exp: exp.id }, { ...spec, ...base('world-essential'), repetitions: 2, caseSeeds: [1, 2].map((r) => seedB(exp.n, r)), batchSeed: 280000000 + 1000 * exp.n });
  // ---- C · defensa: EQ01 intervenido frente a EQ11, EQ01 local; ORG01…06 × COB01…04; una semilla común
  const orgOps = (o) => { const t = 'EQ01'; const ops = [{ op: 'plan', team: t, key: 'defense', value: `ORG0${o}` }]; return ops; };
  const cOps = (o, c) => { const t = 'EQ01'; const ops = [{ op: 'plan', team: t, key: 'defense', value: `ORG0${o}` }, { op: 'plan', team: t, key: 'coverage', value: `COB0${c}` }]; if (o === 6) ops.push({ op: 'plan', team: t, key: 'target', value: 'EQ11-J03' }, { op: 'plan', team: t, key: 'targetAlt', value: 'EQ11-J01' }, { op: 'plan', team: t, key: 'fallbackOrg', value: 'ORG02' }); return ops; };
  void orgOps;
  const cspec = (o, c, level) => ({ ...base(level), mode: 'pairs', pairs: [['EQ01', 'EQ11']], repetitions: 1, venue: 'fixed', teams: { EQ01: nat.EQ01, EQ11: nat.EQ11 }, allowBaseOps: true, batchSeed: 290000000 + 10 * o + c, caseSeeds: [SEED_C], objective: `MOTOR17 C · ORG0${o} × COB0${c}`, variants: [{ id: `ORG0${o}_COB0${c}`, label: `ORG0${o} × COB0${c}`, ops: cOps(o, c) }] });
  for (let o = 1; o <= 6; o++) for (let c = 1; c <= 4; c++) make({ block: 'C', kind: 'principal', label: `C-ORG0${o}-COB0${c}`, org: o, cob: c }, cspec(o, c, 'world-essential'));
  // ---- D · estados: LAB11-02/03/04/06 × r=1,2 con sus variantes de catálogo
  const FAM = [[1, 'LAB11-02', ['E100', 'E30', 'E08']], [2, 'LAB11-03', ['J03-100', 'J03-30']], [3, 'LAB11-04', ['base', 'I02', 'I08']], [4, 'LAB11-06', ['base', 'AGE']]];
  const dspec = (f, sc, vs, level, reps) => ({ ...base(level), mode: 'repeat', source: { kind: 'lab', scenario: sc }, repetitions: reps.length, venue: 'fixed', batchSeed: 300000000 + f, caseSeeds: reps.map((r) => seedD(f, r)), objective: `MOTOR17 D · ${sc}`, variants: vs.map((v) => ({ id: v.replace(/-/g, '_'), lab: v, label: v })) });
  for (const [f, sc, vs] of FAM) make({ block: 'D', kind: 'principal', label: `D-F${f}-${sc}`, family: f, scenario: sc }, dspec(f, sc, vs, 'world-essential', [1, 2]));
  // ---- 12 repeticiones diagnósticas por versión (selección previa al resultado; mismas entradas y semillas, nivel diagnóstico completo, relato omitido)
  make({ block: 'A', kind: 'diagnostico', label: 'DIAG-A-p01-p06-H0' }, { ...base('diagnostic'), mode: 'pairs', pairs: [PAIRS[0], PAIRS[5]], repetitions: 1, venue: 'fixed', teams: nat, batchSeed: 271000000, caseSeeds: [seedA(1), seedA(6)], objective: 'MOTOR17 diagnóstico · A p=1 y p=6 (H0)' });
  for (const id of ['EXP13-04', 'EXP13-07']) { const { exp, spec } = expSpec[id]; make({ block: 'B', kind: 'diagnostico', label: `DIAG-B-${id}-r01`, exp: id }, { ...spec, ...base('diagnostic'), repetitions: 1, caseSeeds: [seedB(exp.n, 1)], batchSeed: 280000000 + 1000 * exp.n }); }
  for (const [o, c] of [[1, 1], [2, 1]]) make({ block: 'C', kind: 'diagnostico', label: `DIAG-C-ORG0${o}-COB0${c}`, org: o, cob: c }, cspec(o, c, 'diagnostic'));
  for (const [f, sc, vs] of [[1, 'LAB11-02', ['E100', 'E08']], [2, 'LAB11-03', ['J03-100', 'J03-30']]]) make({ block: 'D', kind: 'diagnostico', label: `DIAG-D-F${f}-${sc}-r01`, family: f, scenario: sc }, dspec(f, sc, vs, 'diagnostic', [1]));
  const tot = {}; for (const l of lots) { const k = `${l.block}/${l.kind}`; tot[k] = (tot[k] ?? 0) + l.executions; }
  const doc = { study: 'MOTOR17-CIERRE-20261018', version: VERSION, engine: ENGINE_VERSION, tree: TREE, effective_profile_id: profile.effectiveId, profile_candidate: VERSION === 'R17' ? CHOSEN : null,
    seed_spaces: { A: '271000000 + 1000·p + 1 (el prompt fija 270000000: cambiado por uso exploratorio de 270001001…270024001 con R0 en el desarrollo)', B: '280000000 + 1000·e + r', C: '290000001', D: '300000000 + 1000·f + r', bench100: '310000000 + i', bench200: '320000000 + i' },
    pairs: PAIRS.map((p, i) => ({ p: i + 1, a: p[0], b: p[1], seed_A: seedA(i + 1) })), lots, problems, totals: tot, created_at: new Date().toISOString() };
  writeFileSync(PLAN, JSON.stringify(doc, null, 1)); console.log(JSON.stringify(tot, null, 1)); console.log('lotes', lots.length, 'ejecuciones', lots.reduce((s, l) => s + l.executions, 0), 'problemas', problems.length, 'plan sha256', createHash('sha256').update(readFileSync(PLAN)).digest('hex'));
  for (const p of problems) console.log(p.label, p.problems.slice(0, 2)); process.exit(problems.length ? 1 : 0);
}

// ------------------------------------------------------------------------------------------------------------------ run
if (!existsSync(PLAN)) { console.error('no hay plan: ejecuta primero create'); process.exit(2); }
const plan = JSON.parse(readFileSync(PLAN, 'utf8')); const store = new JobStore(ROOT); const pool = new WorkerPool({ store, size: 4 }); const ctl = new BatchController({ store, executor: pool });
let bad = 0; const t00 = performance.now();
for (const l of plan.lots.filter((x) => MATCH.test(x.label))) {
  const st0 = ctl.status(l.batch_id); if (st0.state === 'completado') { console.log(`${l.label} ya completado`); continue; }
  const t0 = performance.now(); const r = await ctl.run(l.batch_id, { concurrency: l.concurrency_requested }); if (!r.ok) { console.log('NO ARRANCA', l.label, r.reason); bad++; continue; }
  const end = await r.done; const s = ctl.status(l.batch_id); const ru = process.resourceUsage();
  appendFileSync(join(OUT, 'logs', `runlog-${VERSION}.jsonl`), `${JSON.stringify({ label: l.label, batch_id: l.batch_id, block: l.block, kind: l.kind, state: end.state, reason: end.reason, counters: s.counters, wall_ms: Math.round(performance.now() - t0), concurrency: end.concurrency, maxrss_mib: Math.round(ru.maxRSS / 1024), at: new Date().toISOString() })}\n`);
  console.log(`${l.label} ${end.state} ${JSON.stringify({ t: s.counters.terminados, v: s.counters.validos, f: s.counters.fallidos })} ${Math.round(performance.now() - t0)} ms`);
  if (s.counters.fallidos || end.state !== 'completado') { bad++; console.log('INCIDENCIA en', l.label, end.reason); }
}
console.log(`total ${Math.round((performance.now() - t00) / 1000)} s, incidencias ${bad}`); await pool.close(); process.exit(bad ? 1 : 0);
