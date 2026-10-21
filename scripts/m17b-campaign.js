// MOTOR-17B §10: campaña de cierre MOTOR17B-CIERRE-20261021 (30 casos lógicos, 72 ejecuciones planificadas). Un mismo guion sirve a los dos árboles de código: `--tree` indica la raíz que se importa (CONTROL17 = worktree
// inmutable de 01c8ade; M17B = este árbol), de modo que cada versión se ejecuta con SU motor, SU perfil y SUS lectores. Las entradas, órdenes y semillas son idénticas en las dos versiones.
// Uso: node scripts/m17b-campaign.js create --version=CONTROL17|M17B --tree=/ruta [--out=out/motor17b]   congela los lotes (NO ejecuta) y escribe el plan
//      node scripts/m17b-campaign.js run    --version=CONTROL17|M17B --tree=/ruta [--match=regex] [--out=out/motor17b]   ejecuta los lotes ya congelados (pool existente)
// Semillas: A 371000000 + 1000·p + 1 (compartida por ambos órdenes y ambas versiones); B01 = 20261016; resto de B = 372000000 + nº de caso.
// Cada B se congela como lote esencial (las dos versiones) y, solo en M17B, como lote diagnóstico con el mismo contenido (los doce diagnósticos repiten esenciales: no amplían la muestra deportiva).
import { writeFileSync, readFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const MODE = process.argv[2]; const VERSION = arg('version', null); const TREE = arg('tree', null); const OUT = arg('out', 'out/motor17b'); const MATCH = new RegExp(arg('match', '.')); const ATTEMPT_FILTER = arg('only', null);
if (!['create', 'run'].includes(MODE) || !['CONTROL17', 'M17B'].includes(VERSION) || !TREE) { console.error('uso: create|run --version=CONTROL17|M17B --tree=<raíz>'); process.exit(2); }
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const { loadData, CANDIDATES17_PATH } = await imp('scripts/node-data.js'); const P = await imp('src/population/index.js'); const { JobStore } = await imp('src/batch/jobstore.js'); const { BatchController } = await imp('src/batch/runner.js'); const { WorkerPool } = await imp('src/batch/executors.js');
const { prepareBatch } = await imp('src/batch/schedule.js'); const { freezeBatch } = await imp('src/batch/freeze.js'); const { ENGINE_VERSION, buildMatchInput } = await imp('src/match/index.js'); const { candidateProfile } = await imp('src/profiles/candidates.js');
const data = loadData(); const players = data.players;
const P0 = data.profile; // perfil base de MOTOR-17 (gasto por minuto vivo 2); en M17B incluye además SEM-MOTOR17B (solo crédito estadístico)
const cands = JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')); const C02 = cands.candidates.find((x) => x.id === 'C17-02'); if (!C02) throw new Error('falta C17-02');
const P1 = candidateProfile(P0, C02); // P1 = P0 + C17-02 (única fila deportiva: energy.costPerLiveMinute 2 → 3,5)
const PROFILES = { P0, P1 };
mkdirSync(join(OUT, 'plan'), { recursive: true }); mkdirSync(join(OUT, 'logs'), { recursive: true });
const ROOT = join(OUT, 'lotes', VERSION); const PLAN = join(OUT, 'plan', `lotes-${VERSION}.json`);
const IDS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`);
const nat = (prof) => Object.fromEntries(IDS.map((id) => [id, P.referenceTeam(prof, players, id)]));
const PAIRS = IDS.map((id, i) => [id, IDS[(i + 1) % 12]]); // p = i + 1: EQ01–EQ02, …, EQ11–EQ12, EQ12–EQ01
const seedA = (p) => 371000000 + 1000 * p + 1; const seedB = (n) => (n === 1 ? 20261016 : 372000000 + n);
const DIAG_A = [1, 2, 5, 7, 9, 11]; // elegidos antes de ver resultados: primer orden de estos p
const base = (level) => ({ recordLevel: level, prose: 'omitted', concurrency: level === 'diagnostic' ? 2 : 4, importance: 'ordinary' });

// ---- definición de los seis casos de cierre (IDs reales completados en el plan congelado)
const natP0 = nat(P0); const natP1 = nat(P1);
const hist = buildMatchInput(P0, players, { seed: 20261016 }); // B01: entrada histórica de MOTOR-10 (planes históricos de la referencia 20261016)
const eq11Bench = Object.keys(natP1.EQ11.plan.starters).length && natP1.EQ11.players.map((p) => p.id).filter((id) => !Object.values(natP1.EQ11.plan.starters).includes(id)); // [J02, J04, J05, J07, J09, J11, J12]
const B = {
  B01: { profile: 'P0', note: 'Referencia histórica EQ01–EQ02 con los planes históricos de MOTOR-10 y semilla 20261016 (83–98 y 6.684 sorteos en MOTOR-17)', spec: { mode: 'pairs', pairs: [['EQ01', 'EQ02']], venue: 'fixed', repetitions: 1, teams: { EQ01: hist.teams[0], EQ02: hist.teams[1] } } },
  B02: { profile: 'P0', note: 'Dos copias de EQ01 (instancias EQ01 y EQ01_B) para pertenencia de jugador y contratos', spec: { mode: 'repeat', teamIds: ['EQ01', 'EQ01'], selfPlay: true, venue: 'fixed', repetitions: 1, teams: { EQ01: natP0.EQ01 } } },
  B03: { profile: 'P1', note: 'EQ01–EQ02: EQ02 defiende individual (ORG01) y una orden reproducible del inicio del segundo periodo la cambia a la zona 3–2 (ORG03, su organización natural); antes/después y estado pendiente de la orden', spec: { mode: 'pairs', pairs: [['EQ01', 'EQ02']], venue: 'fixed', repetitions: 1, teams: { EQ01: natP1.EQ01, EQ02: natP1.EQ02 }, allowBaseOps: true, variants: [{ id: 'ORG01_a_ORG03', label: 'EQ02 individual → zona 3–2 en el segundo periodo', ops: [{ op: 'plan', team: 'EQ02', key: 'defense', value: 'ORG01' }] }] },
    planned: [{ period: 2, boundary: 'inicio del segundo periodo', team: 1, spec: { type: 'defOrg', defense: 'ORG03', target: null, targetAlt: null, fallbackOrg: 'ORG02' }, note: 'EQ02 es el puesto 1 de la entrada (visitante); orden de organización defensiva aplicada en su ventana real' }] },
  B04: { profile: 'P1', note: 'EQ01–EQ11: EQ01 defiende box and one sobre EQ11-J02 con alternativa individual EQ11-J05 y fallbackOrg ORG02; los dos jugadores objetivo no están disponibles desde la entrada (recursos situacionales de minutos 0 del plan natural: no alteran la rotación)', spec: { mode: 'pairs', pairs: [['EQ01', 'EQ11']], venue: 'fixed', repetitions: 1, teams: { EQ01: natP1.EQ01, EQ11: natP1.EQ11 }, allowBaseOps: true,
    variants: [{ id: 'ORG06_objetivos_ausentes', label: 'Box and one con objetivo y alternativa no disponibles', ops: [{ op: 'plan', team: 'EQ01', key: 'defense', value: 'ORG06' }, { op: 'plan', team: 'EQ01', key: 'target', value: 'EQ11-J02' }, { op: 'plan', team: 'EQ01', key: 'targetAlt', value: 'EQ11-J05' }, { op: 'plan', team: 'EQ01', key: 'fallbackOrg', value: 'ORG02' }, { op: 'state', team: 'EQ11', player: 'J02', key: 'available', value: false }, { op: 'state', team: 'EQ11', player: 'J05', key: 'available', value: false }] }] } },
  B05: { profile: 'P1', note: 'LAB11-02 · energía inicial 8 (variante E08 del catálogo)', spec: { mode: 'repeat', source: { kind: 'lab', scenario: 'LAB11-02' }, venue: 'fixed', repetitions: 1, variants: [{ id: 'E08', lab: 'E08', label: 'E08' }] } },
  B06: { profile: 'P1', note: 'LAB11-03 · referente (J03) con energía 30 (variante J03-30 del catálogo)', spec: { mode: 'repeat', source: { kind: 'lab', scenario: 'LAB11-03' }, venue: 'fixed', repetitions: 1, variants: [{ id: 'J03_30', lab: 'J03-30', label: 'J03-30' }] } },
};
const bN = (k) => Number(k.slice(1));

// ---- creación de un lote con órdenes programadas (mismo procedimiento que BatchController.create; las órdenes se fijan en la entrada congelada)
function createLot(store, spec, profile, { label, planned = [] }) {
  const prep = prepareBatch(spec, profile, { players });
  if (!prep.ok) return { ok: false, problems: prep.problems };
  if (planned.length) for (const e of prep.entries.values()) e.plannedOrders = JSON.parse(JSON.stringify(planned));
  const baseId = `LOT-${prep.agendaFp.slice(0, 8)}`; let revision = 1; let id = baseId; while (store.exists(id)) { revision += 1; id = `${baseId}-R${revision}`; }
  const frozen = freezeBatch(prep, profile, { batchId: id, now: Date.now, label, revisionOf: null, revision });
  store.writeFrozen(id, frozen.files); store.writeJob(id, frozen.job);
  return { ok: true, batchId: id, counts: prep.counts, agendaFp: prep.agendaFp, plannedN: planned.length };
}

if (MODE === 'create') {
  const store = new JobStore(ROOT); const lots = []; const problems = [];
  const make = (meta, spec, profileKey, planned = []) => { const profile = PROFILES[profileKey]; const label = `M17B-${VERSION}-${meta.label}`; const r = createLot(store, { ...spec, ...base(meta.level), objective: meta.objective ?? label }, profile, { label, planned });
    if (!r.ok) { problems.push({ ...meta, problems: r.problems }); return; }
    lots.push({ ...meta, label, version: VERSION, profile: profileKey, effective_profile_id: profile.effectiveId, batch_id: r.batchId, cases: r.counts.cases, executions: r.counts.executions, agenda_fp: r.agendaFp, planned_orders: planned, concurrency_requested: base(meta.level).concurrency, case_seeds: spec.caseSeeds }); };
  // ---- A · doce enfrentamientos, ida y vuelta, P1
  make({ block: 'A', kind: 'principal', level: 'world-essential', label: 'A-esencial' }, { mode: 'pairs', pairs: PAIRS, repetitions: 1, venue: 'home_away', teams: natP1, batchSeed: 371000000, caseSeeds: PAIRS.flatMap((_, i) => [seedA(i + 1), seedA(i + 1)]) }, 'P1');
  if (VERSION === 'M17B') make({ block: 'A', kind: 'diagnostico', level: 'diagnostic', label: 'A-diagnostico' }, { mode: 'pairs', pairs: DIAG_A.map((p) => PAIRS[p - 1]), repetitions: 1, venue: 'fixed', teams: natP1, batchSeed: 371000000, caseSeeds: DIAG_A.map(seedA) }, 'P1');
  // ---- B · seis casos de cierre
  for (const [k, def] of Object.entries(B)) {
    const spec = { ...def.spec, batchSeed: 372000000 + bN(k), caseSeeds: [seedB(bN(k))] };
    make({ block: 'B', kind: 'principal', level: 'world-essential', label: `${k}-esencial`, case: k, note: def.note }, spec, def.profile, def.planned ?? []);
    if (VERSION === 'M17B') make({ block: 'B', kind: 'diagnostico', level: 'diagnostic', label: `${k}-diagnostico`, case: k, note: def.note }, spec, def.profile, def.planned ?? []);
  }
  const tot = {}; for (const l of lots) { const k = `${l.block}/${l.kind}`; tot[k] = (tot[k] ?? 0) + l.executions; }
  const doc = { study: 'MOTOR17B-CIERRE-20261021', version: VERSION, engine: ENGINE_VERSION, tree: TREE, profiles: { P0: P0.effectiveId, P1: P1.effectiveId }, candidate: { id: 'C17-02', row: C02.controls.map((c) => ({ row: c.row, before: c.before, after: c.after })) },
    seed_spaces: { A: '371000000 + 1000·p + 1 (compartida por ambos órdenes, ambas versiones)', B: 'B01 = 20261016; B02…B06 = 372000000 + nº de caso' }, diag_a_p: DIAG_A, pairs: PAIRS.map((p, i) => ({ p: i + 1, a: p[0], b: p[1], seed_A: seedA(i + 1) })),
    cases: Object.fromEntries(Object.entries(B).map(([k, d]) => [k, { profile: d.profile, seed: seedB(bN(k)), note: d.note, planned_orders: d.planned ?? [], variants: (d.spec.variants ?? []).map((v) => ({ id: v.id, label: v.label, ops: v.ops ?? null, lab: v.lab ?? null })) }])),
    lots, problems, totals: tot, created_at: new Date().toISOString() };
  writeFileSync(PLAN, JSON.stringify(doc, null, 1)); console.log(JSON.stringify(tot)); console.log('lotes', lots.length, 'ejecuciones', lots.reduce((s, l) => s + l.executions, 0), 'problemas', problems.length, 'plan sha256', createHash('sha256').update(readFileSync(PLAN)).digest('hex'));
  for (const p of problems) console.log(p.label, p.problems.slice(0, 3)); process.exit(problems.length ? 1 : 0);
}

// ------------------------------------------------------------------------------------------------------------------ run
if (!existsSync(PLAN)) { console.error('no hay plan: ejecuta primero create'); process.exit(2); }
const plan = JSON.parse(readFileSync(PLAN, 'utf8')); const store = new JobStore(ROOT); const pool = new WorkerPool({ store, size: 4 }); const ctl = new BatchController({ store, executor: pool });
let bad = 0; const t00 = performance.now(); void ATTEMPT_FILTER;
for (const l of plan.lots.filter((x) => MATCH.test(x.label))) {
  const st0 = ctl.status(l.batch_id); if (st0.state === 'completado') { console.log(`${l.label} ya completado`); continue; }
  const t0 = performance.now(); const r = await ctl.run(l.batch_id, { concurrency: l.concurrency_requested }); if (!r.ok) { console.log('NO ARRANCA', l.label, r.reason); bad++; continue; }
  const end = await r.done; const s = ctl.status(l.batch_id); const ru = process.resourceUsage();
  appendFileSync(join(OUT, 'logs', `runlog-${VERSION}.jsonl`), `${JSON.stringify({ label: l.label, batch_id: l.batch_id, block: l.block, kind: l.kind, state: end.state, reason: end.reason, counters: s.counters, wall_ms: Math.round(performance.now() - t0), concurrency: end.concurrency, maxrss_mib: Math.round(ru.maxRSS / 1024), at: new Date().toISOString() })}\n`);
  console.log(`${l.label} ${end.state} ${JSON.stringify({ t: s.counters.terminados, v: s.counters.validos, f: s.counters.fallidos })} ${Math.round(performance.now() - t0)} ms`);
  if (s.counters.fallidos || end.state !== 'completado') { bad++; console.log('INCIDENCIA en', l.label, end.reason); }
}
console.log(`total ${Math.round((performance.now() - t00) / 1000)} s, incidencias ${bad}`); await pool.close(); process.exit(bad ? 1 : 0);
