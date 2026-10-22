// MOTOR-18B §12: campaña de cierre MOTOR18B-CIERRE-20261022 (36 ejecuciones planificadas). Un mismo guion sirve a los dos árboles de código: `--tree` indica la raíz que se importa (CONTROL17B = worktree inmutable de f67113e;
// M18B = este árbol), de modo que cada versión se ejecuta con SU motor, SU perfil y SUS lectores. Capacidades, estados, planes, órdenes y semillas son idénticos; en M18 la entrada es /7 y añade SOLO los bloques nuevos
// (conocimiento, Polivalencia, enseñanza del entrenador); en CONTROL17B la entrada es /6 sin ellos.
//   A (12): seis pares neutrales × {CONTROL17B, M18} · esencial · A01/A05 legacy-neutral, A02/A03/A04/A06 con los 62 niveles a 30.
//   B (16): ocho contrastes × {K8, K28} · M18 · P1 · esencial · copias explícitas con los 62 niveles a 30 salvo el conocimiento contrastado · semilla 383000000 + n en ambas variantes.
//   C (6): repeticiones diagnósticas de B01-K8, B02-K28, B03-K8, B04-K8, B06-K8, B08-K28 (mismas entradas y semillas).
//   D (2): D01 = B01-K8 con Polivalencia de EQ02 16→30 · D02 = B02-K28 con guardar/restaurar en la primera frontera de periodo (ejecución especial, fuera de lotes).
// Uso: node scripts/m18-campaign.js create --version=CONTROL17B|M18B --tree=/ruta [--out=out/motor18b] [--only=A01,B02]   congela los lotes (NO ejecuta) y escribe el plan
//      node scripts/m18-campaign.js run    --version=CONTROL17B|M18B --tree=/ruta [--match=regex] [--out=out/motor18b]   ejecuta los lotes ya congelados (pool existente) y, en M18, D02
import { writeFileSync, readFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const MODE = process.argv[2]; const VERSION = arg('version', null); const TREE = arg('tree', null); const OUT = arg('out', 'out/motor18b'); const MATCH = new RegExp(arg('match', '.')); const ONLY = arg('only', null)?.split(',') ?? null;
if (!['create', 'run'].includes(MODE) || !['CONTROL17B', 'M18B'].includes(VERSION) || !TREE) { console.error('uso: create|run --version=CONTROL17B|M18B --tree=<raíz>'); process.exit(2); }
const M18 = VERSION === 'M18B'; const STUDY = 'MOTOR18B-CIERRE-20261022'; // MOTOR-18B: M18B = el árbol actual (código final de 18B)
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const { loadData, CANDIDATES17_PATH } = await imp('scripts/node-data.js'); const P = await imp('src/population/index.js'); const { JobStore, loadFrozen } = await imp('src/batch/jobstore.js'); const { BatchController } = await imp('src/batch/runner.js'); const { WorkerPool } = await imp('src/batch/executors.js');
const { prepareBatch } = await imp('src/batch/schedule.js'); const { freezeBatch } = await imp('src/batch/freeze.js'); const { ENGINE_VERSION } = await imp('src/match/index.js'); const { candidateProfile } = await imp('src/profiles/candidates.js');
const K = M18 ? await imp('src/knowledge/model.js') : null;
const data = loadData(); const players = data.players; const P0 = data.profile;
const cands = JSON.parse(readFileSync(CANDIDATES17_PATH, 'utf8')); const C02 = cands.candidates.find((x) => x.id === 'C17-02'); if (!C02) throw new Error('falta C17-02');
const P1 = candidateProfile(P0, C02); const PROFILES = { P0, P1 };
mkdirSync(join(OUT, 'plan'), { recursive: true }); mkdirSync(join(OUT, 'logs'), { recursive: true });
const ROOT = join(OUT, 'lotes', VERSION); const PLAN = join(OUT, 'plan', `lotes-${VERSION}.json`);
const natP1 = (id) => P.referenceTeam(P1, players, id); const natP0 = (id) => P.referenceTeam(P0, players, id);
const clone = (x) => JSON.parse(JSON.stringify(x));

// ---- bloques nuevos de M18 (solo existen en M18): 62 niveles a 30 con peak=level en el día 0, Polivalencia 16, enseñanza 16 y competencia 16 por módulo (§10.2, §15.2)
const FP = M18 ? P1.familiarity : null; const DAY = 0;
const block30 = () => K.allMastered(FP, DAY);
const withLevel = (domain, id, level) => { const b = block30(); b[K.BLOCK_FIELD[domain]][id] = K.makeEntry(level, DAY); return b; };
const coachLearning = () => ({ teaching: 16, tacticalMastery: Object.fromEntries(K.idsOf('tactic', FP).map((id) => [id, 16])) });
const arm = (team, { knowledge = true } = {}) => { const t = clone(team); if (!M18) return t; t.coachLearning = coachLearning(); for (const p of t.players) { p.development = { tacticalLearning: 16 }; if (knowledge) p.knowledge = block30(); } return t; };
const setPlan = (team, patch) => { const t = clone(team); Object.assign(t.plan, patch); return t; };

// ---- A · seis pares neutrales
const ALL_OPS_B04 = [{ op: 'plan', team: 'EQ01', key: 'defense', value: 'ORG06' }, { op: 'plan', team: 'EQ01', key: 'target', value: 'EQ11-J02' }, { op: 'plan', team: 'EQ01', key: 'targetAlt', value: 'EQ11-J05' }, { op: 'plan', team: 'EQ01', key: 'fallbackOrg', value: 'ORG02' }, { op: 'state', team: 'EQ11', player: 'J02', key: 'available', value: false }, { op: 'state', team: 'EQ11', player: 'J05', key: 'available', value: false }];
const hist = P.historicalPair(P0, players); // A01: planes históricos de referencia (EQ01–EQ02), perfil P0
const A = {
  A01: { profile: 'P0', seed: 20261016, neutral: 'legacy-neutral', note: 'EQ01–EQ02 con los planes históricos de referencia (83–98 en el perfil base de MOTOR-17), perfil P0', spec: () => ({ mode: 'pairs', pairs: [['EQ01', 'EQ02']], venue: 'fixed', repetitions: 1, teams: { EQ01: arm(hist[0], { knowledge: false }), EQ02: arm(hist[1], { knowledge: false }) } }) },
  A02: { profile: 'P1', seed: 382000002, neutral: 'todos 30', note: 'EQ03–EQ09, planes naturales', spec: () => ({ mode: 'pairs', pairs: [['EQ03', 'EQ09']], venue: 'fixed', repetitions: 1, teams: { EQ03: arm(natP1('EQ03')), EQ09: arm(natP1('EQ09')) } }) },
  A03: { profile: 'P1', seed: 382000003, neutral: 'todos 30', note: 'EQ07–EQ08, planes naturales', spec: () => ({ mode: 'pairs', pairs: [['EQ07', 'EQ08']], venue: 'fixed', repetitions: 1, teams: { EQ07: arm(natP1('EQ07')), EQ08: arm(natP1('EQ08')) } }) },
  A04: { profile: 'P1', seed: 382000004, neutral: 'todos 30', note: 'EQ11–EQ12, planes naturales', spec: () => ({ mode: 'pairs', pairs: [['EQ11', 'EQ12']], venue: 'fixed', repetitions: 1, teams: { EQ11: arm(natP1('EQ11')), EQ12: arm(natP1('EQ12')) } }) },
  A05: { profile: 'P1', seed: 382000005, neutral: 'legacy-neutral', note: 'Dos instancias de EQ01 con identificadores diferenciados (EQ01 y EQ01_B)', spec: () => ({ mode: 'repeat', teamIds: ['EQ01', 'EQ01'], selfPlay: true, venue: 'fixed', repetitions: 1, teams: { EQ01: arm(natP1('EQ01'), { knowledge: false }) } }) },
  A06: { profile: 'P1', seed: 382000006, neutral: 'todos 30', note: 'EQ01–EQ11: ORG06 con objetivo EQ11-J02 y alternativa individual EQ11-J05 fuera de pista como B04 de MOTOR-17B; fallback ORG02', spec: () => ({ mode: 'pairs', pairs: [['EQ01', 'EQ11']], venue: 'fixed', repetitions: 1, allowBaseOps: true, teams: { EQ01: arm(natP1('EQ01')), EQ11: arm(natP1('EQ11')) }, variants: [{ id: 'ORG06_objetivos_ausentes', label: 'Box and one con objetivo y alternativa no disponibles', ops: ALL_OPS_B04 }] }) },
};
// En M18 los casos legacy-neutral no llevan conocimiento (efecto cero por política); los de 30 llevan los 62 niveles. En CONTROL17B `arm` devuelve la ficha tal cual.

// ---- B · ocho contrastes (K8/K28). Cada contraste cambia SOLO el conocimiento indicado; el resto de cada copia está a 30.
const eq01 = () => arm(natP1('EQ01')); const eq02 = () => arm(natP1('EQ02'));
const swapStarters = (t) => { const s = t.plan.starters; const a = s.PG; const b = s.C; t.plan.starters = { ...s, PG: b, C: a };
  t.plan.participation = clone(t.plan.participation); for (const q of t.plan.participation.pairs) { if (q.slot === 'PG') q.starter = b; if (q.slot === 'C') q.starter = a; }
  t.plan.coach = { ...t.plan.coach, delegation: { ...t.plan.coach.delegation, rotation: false } }; return t; }; // rotación manual fija: ningún relevo automático, y el intercambio PG/C es explícito
const dictO = (code) => P1.fixtureContract.offensiveRoleDictionary[code]; const dictD = (code) => P1.fixtureContract.defensiveRoleDictionary[code];
const B = {
  B01: { note: 'EQ01–EQ02; EQ02 usa ORG02', teams: () => ({ EQ01: eq01(), EQ02: setPlan(eq02(), { defense: 'ORG02' }) }), contrast: { team: 'EQ02', who: 'all', domain: 'tactic', id: 'ORG02', label: 'ORG02 de los jugadores de EQ02' } },
  B02: { note: 'EQ01–EQ02; EQ01 prioriza POS01 (ya es prioridad 1 en su libro natural) y conserva las alternativas actuales', teams: () => ({ EQ01: eq01(), EQ02: eq02() }), contrast: { team: 'EQ01', who: 'all', domain: 'tactic', id: 'FAM:pick_and_roll', label: 'FAM:pick_and_roll de EQ01' } },
  B03: { note: 'EQ01–EQ02; EQ01-J01 tiene asignado el rol O01 en ambas', teams: () => { const t = eq01(); const p = t.players.find((x) => x.id === 'EQ01-J01'); p.offensiveRole = { code: 'O01', name: dictO('O01') }; return { EQ01: t, EQ02: eq02() }; }, contrast: { team: 'EQ01', who: 'J01', domain: 'offensiveRole', id: 'O01', label: 'familiaridad O01 de EQ01-J01' } },
  B04: { note: 'EQ01–EQ02; intercambio explícito de puestos PG/C entre EQ01-J01 y EQ01-J10, roles conocidos, rotación manual fija de EQ01 en este escenario (extremo de laboratorio identificado, no recomendación)', teams: () => ({ EQ01: swapStarters(eq01()), EQ02: eq02() }), contrast: { team: 'EQ01', who: 'J10', domain: 'position', id: 'PG', label: 'familiaridad PG de EQ01-J10' } },
  B05: { note: 'EQ01–EQ02; EQ02 utiliza COB02 y D06 para todos sus jugadores en ambas variantes', teams: () => { const t = setPlan(eq02(), { coverage: 'COB02', navigation: null }); for (const p of t.players) p.defensiveRole = { code: 'D06', name: dictD('D06') }; return { EQ01: eq01(), EQ02: t }; }, contrast: { team: 'EQ02', who: 'all', domain: 'defensiveRole', id: 'D06', label: 'familiaridad D06 de EQ02' } },
  B06: { note: 'EQ01–EQ02; EQ02 presiona a pista completa en ambas', teams: () => ({ EQ01: eq01(), EQ02: setPlan(eq02(), { pressureHeight: 'full' }) }), contrast: { team: 'EQ02', who: 'all', domain: 'tactic', id: 'PRESS', label: 'módulo PRESS de EQ02' } },
  B07: { note: 'EQ01–EQ02, libros actuales de saques', teams: () => ({ EQ01: eq01(), EQ02: eq02() }), contrast: { team: 'EQ01', who: 'all', domain: 'tactic', id: 'SAQ:O:band', label: 'SAQ:O:band de EQ01' } },
  B08: { note: 'EQ01–EQ02, respuestas actuales de saques', teams: () => ({ EQ01: eq01(), EQ02: eq02() }), contrast: { team: 'EQ02', who: 'all', domain: 'tactic', id: 'SAQ:D:endline', label: 'SAQ:D:endline de EQ02' } },
};
const bN = (k) => Number(k.slice(1)); const seedB = (k) => 383000000 + bN(k);
const LEVELS = { K8: 8, K28: 28 };
const variantOf = (k, kv, extraOps = []) => { const c = B[k].contrast; return { id: kv, label: `${c.label} = ${LEVELS[kv]}`, ops: [{ op: 'field', team: c.team, player: c.who, key: 'knowledge', value: withLevel(c.domain, c.id, LEVELS[kv]) }, ...extraOps] }; };
const diagC = [['B01', 'K8'], ['B02', 'K28'], ['B03', 'K8'], ['B04', 'K8'], ['B06', 'K8'], ['B08', 'K28']];
const polivalencia30 = { op: 'field', team: 'EQ02', player: 'all', key: 'development', value: { tacticalLearning: 30 } };

const base = (level) => ({ recordLevel: level, prose: 'omitted', concurrency: level === 'diagnostic' ? 2 : 4, importance: 'ordinary' });
function createLot(store, spec, profile, { label }) {
  const prep = prepareBatch(spec, profile, { players });
  if (!prep.ok) return { ok: false, problems: prep.problems };
  const baseId = `LOT-${prep.agendaFp.slice(0, 8)}`; let revision = 1; let id = baseId; while (store.exists(id)) { revision += 1; id = `${baseId}-R${revision}`; }
  const frozen = freezeBatch(prep, profile, { batchId: id, now: Date.now, label, revisionOf: null, revision });
  store.writeFrozen(id, frozen.files); store.writeJob(id, frozen.job);
  return { ok: true, batchId: id, counts: prep.counts, agendaFp: prep.agendaFp };
}

if (MODE === 'create') {
  const store = new JobStore(ROOT); const lots = []; const problems = [];
  const make = (meta, spec, profileKey) => { if (ONLY && !ONLY.some((o) => meta.label.startsWith(o))) return; const profile = PROFILES[profileKey]; const label = `M18B-${VERSION}-${meta.label}`;
    const r = createLot(store, { ...spec, ...base(meta.level), objective: meta.objective ?? label }, profile, { label });
    if (!r.ok) { problems.push({ ...meta, problems: r.problems }); return; }
    lots.push({ ...meta, label, version: VERSION, profile: profileKey, effective_profile_id: profile.effectiveId, batch_id: r.batchId, cases: r.counts.cases, executions: r.counts.executions, agenda_fp: r.agendaFp, concurrency_requested: base(meta.level).concurrency, case_seeds: spec.caseSeeds }); };
  for (const [k, def] of Object.entries(A)) make({ block: 'A', kind: 'principal', level: 'world-essential', label: `${k}-esencial`, case: k, note: def.note, neutral: def.neutral }, { ...def.spec(), batchSeed: def.seed, caseSeeds: [def.seed] }, def.profile);
  if (M18) {
    for (const [k, def] of Object.entries(B)) make({ block: 'B', kind: 'principal', level: 'world-essential', label: `${k}-esencial`, case: k, note: def.note, contrast: def.contrast.label }, { mode: 'pairs', pairs: [['EQ01', 'EQ02']], venue: 'fixed', repetitions: 1, teams: def.teams(), allowBaseOps: true, variants: [variantOf(k, 'K8'), variantOf(k, 'K28')], batchSeed: seedB(k), caseSeeds: [seedB(k)] }, 'P1');
    for (const [k, kv] of diagC) make({ block: 'C', kind: 'diagnostico', level: 'diagnostic', label: `C-${k}-${kv}`, case: k, variant: kv, note: `repetición diagnóstica de ${k}-${kv}: mismas entradas y semilla que su esencial`, contrast: B[k].contrast.label }, { mode: 'pairs', pairs: [['EQ01', 'EQ02']], venue: 'fixed', repetitions: 1, teams: B[k].teams(), allowBaseOps: true, variants: [variantOf(k, kv)], batchSeed: seedB(k), caseSeeds: [seedB(k)] }, 'P1');
    make({ block: 'D', kind: 'principal', level: 'world-essential', label: 'D01-esencial', case: 'D01', variant: 'K8_POLI30', note: 'B01-K8 con la Polivalencia de todos los jugadores de EQ02 16→30; mismo conocimiento actual y semilla: el partido debe coincidir, la propuesta de aprendizaje puede cambiar' }, { mode: 'pairs', pairs: [['EQ01', 'EQ02']], venue: 'fixed', repetitions: 1, teams: B.B01.teams(), allowBaseOps: true, variants: [{ ...variantOf('B01', 'K8'), id: 'K8_POLI30', label: 'ORG02 de EQ02 = 8 · Polivalencia de EQ02 = 30', ops: [...variantOf('B01', 'K8').ops, polivalencia30] }], batchSeed: seedB('B01'), caseSeeds: [seedB('B01')] }, 'P1');
  }
  const tot = {}; for (const l of lots) { const k = `${l.block}/${l.kind}`; tot[k] = (tot[k] ?? 0) + l.executions; }
  const doc = { study: STUDY, version: VERSION, engine: ENGINE_VERSION, tree: TREE, profiles: { P0: P0.effectiveId, P1: P1.effectiveId }, candidate: { id: 'C17-02', row: C02.controls.map((c) => ({ row: c.row, before: c.before, after: c.after })) },
    seed_spaces: { A: 'A01 20261016; A02…A06 = 382000000 + nº de caso (misma semilla en CONTROL17B y M18)', B: '383000000 + nº de caso, en K8 y K28', D: 'D01 y D02 usan la semilla de B01 y B02' },
    cases: { A: Object.fromEntries(Object.entries(A).map(([k, d]) => [k, { profile: d.profile, seed: d.seed, neutral: d.neutral, note: d.note }])), B: M18 ? Object.fromEntries(Object.entries(B).map(([k, d]) => [k, { seed: seedB(k), note: d.note, contrast: d.contrast, levels: LEVELS }])) : null,
      C: M18 ? diagC.map(([k, kv]) => ({ case: k, variant: kv })) : null, D: M18 ? { D01: 'B01-K8 con Polivalencia EQ02 16→30', D02: 'B02-K28 con guardar/restaurar en la primera frontera de periodo (ejecución especial `run`)' } : null },
    special: M18 ? [{ id: 'D02', kind: 'guardar/restaurar', from_case: 'B02', variant: 'K28', seed: seedB('B02'), boundary: 'primera frontera de periodo' }] : [],
    lots, problems, totals: tot, created_at: new Date().toISOString() };
  writeFileSync(PLAN, JSON.stringify(doc, null, 1)); console.log(JSON.stringify(tot)); console.log('lotes', lots.length, 'ejecuciones', lots.reduce((s, l) => s + l.executions, 0), 'problemas', problems.length, 'plan sha256', createHash('sha256').update(readFileSync(PLAN)).digest('hex'));
  for (const p of problems) console.log(p.label, p.problems.slice(0, 3)); process.exit(problems.length ? 1 : 0);
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
await pool.close();

// ---- D02: guardar y restaurar en la primera frontera de periodo (misma entrada y semilla que B02-K28; no es un lote)
if (M18 && MATCH.test('D02-especial')) {
  const lot = plan.lots.find((x) => x.case === 'B02' && x.block === 'B'); const outDir = join(OUT, 'especiales'); mkdirSync(outDir, { recursive: true });
  if (!lot) console.log('D02: sin lote B02 en este plan'); else {
    const { createEncounter, restoreEncounter } = await imp('src/engine/index.js'); const { buildEssential } = await imp('src/batch/essential.js');
    const st = new JobStore(ROOT); const fz = loadFrozen(st, lot.batch_id); const ex = fz.lote.agenda.find((e) => e.variant_id === 'K28'); const input = fz.inputFor(fz.entryOf(ex), ex.seed);
    const t0 = performance.now(); const enc = createEncounter({ input, profile: fz.profile, level: 'world-essential', profileRef: { batch: lot.batch_id, profile_id: fz.profile_id } });
    const first = enc.advance({ until: 'period' }); const snap = JSON.parse(JSON.stringify(enc.snapshot({ label: 'D02' }))); const exposureAtSave = enc.exposure();
    const enc2 = restoreEncounter(snap); enc2.advance({ until: 'end' }); const rec = enc2.essential(); const exposure = enc2.exposure();
    const ref = st.readIndex(lot.batch_id).filter((r) => r.type === 'attempt' && r.match_id === ex.match_id).at(-1); const refDir = st.attemptDir(lot.batch_id, ref.match_id, ref.attempt_id);
    const refRec = JSON.parse(readFileSync(join(refDir, `esencial/${ref.match_id}--${ref.attempt_id}.json`), 'utf8'));
    const part = (r) => ({ result: r.result, validity: r.validity, acta: r.acta, presence: r.presence, sequence: r.sequence, shots: r.shots, tactics: r.tactics, direction: r.direction, states: r.states, regulation: r.regulation, familiarity: r.familiarity, steps: r.integrity.steps, sporting_draws: r.integrity.sporting_draws, events: r.integrity.events });
    const sha = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex'); const a = part(refRec); const b = part(rec);
    const sections = Object.fromEntries(Object.keys(a).map((k) => [k, sha(a[k]) === sha(b[k])]));
    const doc = { id: 'D02', study: STUDY, from_lot: lot.batch_id, match_id: ex.match_id, seed: ex.seed, saved_at_boundary: first.boundary, saved_position: first.position, snapshot_schema: snap.schema, snapshot_chars: snap.integrity?.stateChars ?? null, exposure_at_save_live_tenths: Object.values(exposureAtSave?.players ?? {}).reduce((s, p) => s + p.liveTenths, 0),
      equal_sections: sections, identical: Object.values(sections).every(Boolean), exposure_final_equal: sha(exposure.players) === sha(refRec.familiarity.exposure.players), score: rec.result.court_score, reference_score: refRec.result.court_score, ms: Math.round(performance.now() - t0),
      note: 'la propuesta de aprendizaje se calcula solo desde el resultado final completo: lo jugado antes del guardado no se cuenta dos veces porque el acumulador viaja en el guardado' };
    writeFileSync(join(outDir, 'D02.json'), JSON.stringify(doc, null, 1)); writeFileSync(join(outDir, 'D02-esencial-restaurado.json'), JSON.stringify(rec));
    console.log(`D02 ${doc.identical ? 'IGUAL a B02-K28' : 'DIFERENTE'} ${JSON.stringify(sections)}`); if (!doc.identical) bad++;
  }
}
console.log(`total ${Math.round((performance.now() - t00) / 1000)} s, incidencias ${bad}`); process.exit(bad ? 1 : 0);
