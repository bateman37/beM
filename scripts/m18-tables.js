// MOTOR-18 §16.2: aplanado MECÁNICO de la campaña MOTOR18-CIERRE-20261021 a tablas CSV/JSON compactas para ChatGPT, sin interpretación deportiva ni causalidad atribuida al marcador de una sola pareja.
// Lee los lotes ya conservados (índices, `resultado.json`, registros esenciales y diagnósticos). Nulo = celda vacía (nunca cero); las unidades van en el nombre de la columna. Claves GLOBALES: estudio : versión de código : lote : intento.
// Uso: node scripts/m18-tables.js --tree=/ruta/m18 [--out=out/motor18]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor18'); const TREE = arg('tree', process.cwd()); const R = join(OUT, 'rapido'); mkdirSync(R, { recursive: true }); const STUDY = 'MOTOR18-CIERRE-20261021';
const J = (p) => JSON.parse(readFileSync(p, 'utf8')); const jl = (p) => readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const cell = (v) => { if (v == null || (typeof v === 'number' && !Number.isFinite(v))) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = (cols, rows) => `${cols.join(',')}\n${rows.map((o) => cols.map((c) => cell(o[c])).join(',')).join('\n')}\n`;
const W = (name, text) => writeFileSync(join(R, name), typeof text === 'string' ? text : JSON.stringify(text, null, 1));
const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const learning = await imp('src/learning/index.js'); const { loadData } = await imp('scripts/node-data.js'); const FP = loadData().profile.familiarity;
const freeze = J(join(OUT, 'plan', '00-congelacion.json')); const agenda = J(join(OUT, 'plan', 'AGENDA.json')); const plans = { CONTROL17B: J(join(OUT, 'plan', 'lotes-CONTROL17B.json')), M18: J(join(OUT, 'plan', 'lotes-M18.json')) };
const codeOf = (v) => `${v}@${freeze.git[v].head.slice(0, 12)}`;

// ---------------------------------------------------------------- lectura de cada ejecución de la agenda
function attemptOf(version, lot, variantId) {
  const dir = join(OUT, 'lotes', version, lot.batch_id); if (!existsSync(join(dir, 'indice.jsonl'))) return null;
  const lote = J(join(dir, 'entradas/lote.json')); const ex = variantId ? lote.agenda.find((e) => e.variant_id === variantId) : lote.agenda[0]; if (!ex) return null;
  const att = jl(join(dir, 'indice.jsonl')).filter((r) => r.type === 'attempt' && r.match_id === ex.match_id); if (!att.length) return null; const a = att.at(-1);
  const adir = join(dir, 'intentos', ex.match_id, a.attempt_id); const result = existsSync(join(adir, 'resultado.json')) ? J(join(adir, 'resultado.json')) : null;
  const esp = join(adir, 'esencial', `${ex.match_id}--${a.attempt_id}.json`); const essential = existsSync(esp) ? J(esp) : null;
  return { dir, adir, lote, ex, a, result, essential, attempts: att.length };
}
const runs = [];
for (const r of agenda.runs) {
  if (r.special) { const p = join(OUT, 'especiales', 'D02.json'); runs.push({ ...r, ok: existsSync(p), d02: existsSync(p) ? J(p) : null }); continue; }
  const lot = plans[r.version].lots.find((l) => l.batch_id === r.lot); const at = lot ? attemptOf(r.version, lot, r.variant && !['principal'].includes(r.variant) ? (r.block === 'A' ? null : r.variant) : null) : null;
  runs.push({ ...r, ok: !!at, ...(at ?? {}), attempt_id: at?.a.attempt_id ?? null, row_key: at ? `${STUDY}:${r.version}:${r.lot}:${at.a.attempt_id}` : null });
}
const done = runs.filter((r) => r.ok); const byId = Object.fromEntries(runs.map((r) => [r.id, r]));
const facts = (r) => r.result?.facts ?? null;

// ---------------------------------------------------------------- 1 · agenda y ejecuciones (fallidos sin marcador)
W('agenda.csv', csv(['id', 'block', 'version', 'level', 'profile', 'seed', 'variant', 'purpose', 'lot', 'essential_link', 'diagnostic_link'], agenda.runs));
const EXC = ['study', 'row_key', 'run_id', 'code_version', 'block', 'level', 'profile', 'batch_id', 'match_id', 'attempt_id', 'seed', 'variant', 'exec_state', 'valid', 'attempts_total', 'score_home', 'score_away', 'events', 'possessions', 'sporting_draws', 'trajectory_fp', 'exec_ms', 'simulate_ms', 'record_ms', 'bytes_main'];
W('ejecuciones.csv', csv(EXC, runs.filter((r) => !r.special).map((r) => { const f = facts(r); const failed = !r.ok || r.result?.exec_state !== 'terminada'; return { study: STUDY, row_key: r.row_key, run_id: r.id, code_version: codeOf(r.version), block: r.block, level: r.level, profile: r.profile, batch_id: r.lot, match_id: r.ex?.match_id, attempt_id: r.attempt_id, seed: r.seed, variant: r.variant, exec_state: r.ok ? r.result?.exec_state : 'sin_ejecutar', valid: r.result?.valid ?? null, attempts_total: r.attempts ?? null,
  score_home: failed ? null : f?.score_home, score_away: failed ? null : f?.score_away, events: f?.events, possessions: f?.possessions, sporting_draws: f?.draws, trajectory_fp: f?.trajectory_fp, exec_ms: r.result?.exec_ms, simulate_ms: r.result?.timings?.simulate_ms, record_ms: r.result?.timings?.record_ms, bytes_main: r.result?.bytes?.essential_json ?? null }; })));

// ---------------------------------------------------------------- 2 · acta básica, minutos, energía, posiciones/roles y pertenencia (esenciales)
const PLC = ['run_id', 'version', 'player_id', 'team_index', 'team_id', 'in_entry_roster', 'participation', 'min_tenths', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'ast', 'tov', 'stl', 'blk', 'pf', 'final_energy', 'positions_used_tenths', 'offensive_roles_used_tenths', 'defensive_roles_used_tenths'];
const pl = []; const tm = []; const membership = [];
for (const r of done.filter((x) => x.essential)) {
  const e = r.essential; const roster = e.snapshot_roster ?? null; void roster; const teams = (e.familiarity?.snapshot ?? []).map((t) => ({ id: t.team, ids: new Set(t.players.map((p) => p.id)) })); const exp = e.familiarity?.exposure?.players ?? {};
  for (const p of e.acta.players) { const inRoster = teams.length ? teams[p.team_index]?.ids.has(p.id) : null; if (inRoster === false) membership.push({ run: r.id, player: p.id, team_index: p.team_index });
    const x = exp[p.id]; pl.push({ run_id: r.id, version: r.version, player_id: p.id, team_index: p.team_index, team_id: e.identity.teams[p.team_index]?.id, in_entry_roster: inRoster, participation: p.participation, min_tenths: p.min_tenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, tov: p.tov, stl: p.stl, blk: p.blk, pf: p.pf,
      final_energy: e.states?.final_energy?.[p.id] ?? null, positions_used_tenths: x?.positions, offensive_roles_used_tenths: x?.offensiveRoles, defensive_roles_used_tenths: x?.defensiveRoles }); }
  for (const t of e.acta.teams) tm.push({ run_id: r.id, version: r.version, team_id: t.id, points: t.points, ...Object.fromEntries(Object.entries(t.totals ?? {}).filter(([, v]) => typeof v === 'number')) });
}
W('jugadores.csv', csv(PLC, pl)); W('equipos.json', tm); W('pertenencia.json', { players_outside_entry_roster: membership, checked_players: pl.length, note: 'team_index y pertenencia se comprueban contra la instantánea de entrada del propio esencial' });

// ---------------------------------------------------------------- 3 · contrastes B: diferencias exactas de conocimiento, exposición y resultados observados con denominadores
const keysOf = (snap) => { const o = {}; for (const t of snap) for (const p of t.players) if (p.knowledge) for (const f of ['positions', 'offensiveRoles', 'defensiveRoles', 'tactics']) for (const [id, en] of Object.entries(p.knowledge[f])) o[`${p.id}|${f}|${id}`] = en.level; return o; };
const shotsOf = (e) => { const c = e.shots.columns; const ix = Object.fromEntries(c.map((n, i) => [n, i])); return e.shots.rows.map((row) => Object.fromEntries(Object.keys(ix).map((k) => [k, row[ix[k]]]))); };
const resultsOf = (e) => { const sh = shotsOf(e).filter((s) => !s.annulled); const byQ = {}; for (const s of sh) { const q = s.quality ?? 'sin_calidad'; byQ[q] = (byQ[q] ?? 0) + 1; } const t = e.acta.teams.map((x) => ({ team: x.id, points: x.points, tov: x.totals?.tov ?? null, fga: (x.totals?.fg2a ?? 0) + (x.totals?.fg3a ?? 0), fgm: (x.totals?.fg2m ?? 0) + (x.totals?.fg3m ?? 0) }));
  return { court_score: e.result.court_score, teams: t, shots_valid: sh.length, quality_counts: byQ, possessions: e.acta.possessions?.length ?? null, events: e.integrity.events }; };
const contrasts = [];
for (const k of ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08']) {
  const lo = byId[`${k}-K8`]; const hi = byId[`${k}-K28`]; const def = plans.M18.cases.B[k]; if (!lo?.essential || !hi?.essential) { contrasts.push({ case: k, available: false, reason: 'falta una de las dos variantes' }); continue; }
  const A = keysOf(lo.essential.familiarity.snapshot); const Bk = keysOf(hi.essential.familiarity.snapshot); const diff = Object.keys(A).filter((x) => A[x] !== Bk[x]).map((x) => ({ key: x, k8: A[x], k28: Bk[x] })); const onlyContrast = diff.length > 0 && diff.every((d) => d.key.endsWith(`|${def.contrast.domain === 'tactic' ? 'tactics' : def.contrast.domain === 'position' ? 'positions' : def.contrast.domain === 'offensiveRole' ? 'offensiveRoles' : 'defensiveRoles'}|${def.contrast.id}`));
  const expOf = (e) => { const players = Object.entries(e.familiarity.exposure.players).filter(([pid]) => diff.some((d) => d.key.startsWith(`${pid}|`))); const field = { tactic: 'modules', position: 'positions', offensiveRole: 'offensiveRoles', defensiveRole: 'defensiveRoles' }[def.contrast.domain]; const unit = field === 'modules' ? 'crédito ponderado por operación' : 'décimas de juego vivo'; return { unit, per_player: Object.fromEntries(players.map(([pid, x]) => [pid, x[field]?.[def.contrast.id] ?? 0])), total: players.reduce((s, [, x]) => s + (x[field]?.[def.contrast.id] ?? 0), 0), contrasted_players: players.length }; };
  const eLo = expOf(lo.essential); const eHi = expOf(hi.essential);
  const app = (e) => Object.fromEntries(Object.entries(e.familiarity.applications).map(([sc, byC]) => [sc, Object.fromEntries(Object.entries(byC).map(([c, v]) => [c, { operations: v.operations, nonZeroDelta: v.nonZeroDelta, sumDelta: v.sumDelta, minDelta: v.minDelta, maxDelta: v.maxDelta }]))]));
  contrasts.push({ case: k, available: true, seed: lo.seed, contrast: def.contrast, knowledge_differences: diff, only_contrasted_knowledge_differs: onlyContrast, exposure: { K8: eLo, K28: eHi, insufficient: eLo.total === 0 || eHi.total === 0 ? 'exposición insuficiente: la responsabilidad contrastada no se expuso en alguna variante' : null },
    applications: { K8: app(lo.essential), K28: app(hi.essential) }, observed: { K8: resultsOf(lo.essential), K28: resultsOf(hi.essential) },
    same_seed_and_input_except_knowledge: lo.seed === hi.seed, note: 'dos ejecuciones con una semilla: el marcador de una pareja no atribuye causalidad; las probabilidades por operación están en `aplicaciones` y en los diagnósticos' });
}
W('contrastes-B.json', { study: STUDY, contrasts, note: 'K8 y K28 cambian exclusivamente el conocimiento indicado; todo lo demás de cada copia está a 30. Resultados con denominadores; sin causalidad por marcador de una sola pareja.' });

// ---------------------------------------------------------------- 4 · aplicaciones de familiaridad agregadas y ejemplos reales (diagnósticos C)
const apps = done.filter((r) => r.essential?.familiarity || r.result?.familiarity).map((r) => ({ run_id: r.id, level: r.level, enabled: (r.essential?.familiarity ?? r.result?.familiarity)?.enabled, any_explicit: (r.essential?.familiarity ?? r.result?.familiarity)?.anyExplicitKnowledge, operations: (r.essential?.familiarity ?? r.result?.familiarity)?.exposure?.operations, applications: (r.essential?.familiarity ?? r.result?.familiarity)?.applications }));
const examples = { real: null, neutral: null, inherited: null };
for (const r of done.filter((x) => x.block === 'C')) {
  const p = join(r.adir, 'decisiones'); if (!existsSync(p)) continue; const f = readdirSync(p).find((n) => n.endsWith('.jsonl')); if (!f) continue;
  for (const rec of jl(join(p, f))) { if (rec.record_type !== 'calculo' || !String(rec.label).startsWith('familiaridad')) continue; const d = rec.data ?? rec;
    if (d.aplica === false) examples.inherited ??= { run: r.id, decision_id: rec.decision_id, event_id: rec.event_id, note: d };
    else if (d.delta !== 0 && d.delta != null) examples.real ??= { run: r.id, decision_id: rec.decision_id, event_id: rec.event_id, note: d };
    else if (d.delta === 0) examples.neutral ??= { run: r.id, decision_id: rec.decision_id, event_id: rec.event_id, note: d };
    if (examples.real && examples.neutral && examples.inherited) break; }
}
W('aplicaciones-familiaridad.json', { study: STUDY, per_run: apps, examples, note: 'un ejemplo real (ajuste ≠ 0), uno neutral (ajuste exactamente 0) y uno heredado sin reaplicación (aplica:false) si la evidencia los contiene; si falta alguno se declara null, no se inventa', missing_examples: Object.entries(examples).filter(([, v]) => !v).map(([k]) => k) });

// ---------------------------------------------------------------- 5 · exposición y aprendizaje: dosis por dominio y jugador (propuesta SIN aplicar)
const learn = [];
for (const r of done.filter((x) => x.essential?.familiarity?.enabled && x.block !== 'A' && x.essential.familiarity.snapshot)) {
  const e = r.essential; const snap = e.familiarity.snapshot; const day = 0; const playersIn = {}; let coach = null;
  for (const t of snap) { coach ??= t.coach_learning; for (const p of t.players) if (p.knowledge) playersIn[p.id] = { block: p.knowledge, tacticalLearning: p.tactical_learning ?? 16 }; }
  const st = learning.createTeamState({ instanceId: `${r.lot}:${r.attempt_id}`, players: playersIn, coach: coach ?? { teaching: 16, tacticalMastery: Object.fromEntries(learning.idsOf('tactic', FP).map((id) => [id, 16])) }, day }, FP);
  if (!st.ok) { learn.push({ run_id: r.id, ok: false, errors: st.errors.slice(0, 5) }); continue; }
  const exposure = { ...e.familiarity.exposure, match: { source_id: learning.sourceIdOf({ source: STUDY, batch: r.lot, attempt: r.attempt_id, teamInstance: e.identity.teams.map((t) => t.id).join('/') }) } };
  const pr = learning.proposeFromMatch(st.state, exposure, FP, { day });
  if (!pr.ok) { learn.push({ run_id: r.id, ok: false, errors: pr.errors ?? pr.reason }); continue; }
  const sum = Object.fromEntries(Object.entries(pr.players).map(([pid, x]) => [pid, { budgets: x.budgets ?? null, targets: (x.targets ?? []).map((t) => ({ key: t.key, dose: t.dose, before: t.before, after: t.after, peak: t.peak, factors: t.factors })), skipped: x.skipped ?? null }]));
  learn.push({ run_id: r.id, ok: true, source_id: pr.source_id, prev_fingerprint: pr.prevFingerprint, next_fingerprint: pr.nextFingerprint, applied: false, players: sum, proposal_fp: sha(sum) });
}
W('aprendizaje.json', { study: STUDY, unit: 'hora equivalente dedicada a un conocimiento (abstracción de producto); propuestas calculadas desde la exposición final, NO aplicadas (ningún lote evoluciona plantillas)', proposals: learn,
  d01_vs_b01k8: (() => { const a = learn.find((x) => x.run_id === 'B01-K8'); const b = learn.find((x) => x.run_id === 'D01'); return a && b ? { same_match: byId.D01 && byId['B01-K8'] ? facts(byId.D01)?.trajectory_fp === facts(byId['B01-K8'])?.trajectory_fp : null, proposals_differ: a.proposal_fp !== b.proposal_fp } : null; })() });
if (existsSync(join(TREE, 'docs/tecnico/evidencia-motor18/l18/l18.json'))) { for (const f of ['l18.json', 'l18.csv', 'l18.md']) copyFileSync(join(TREE, 'docs/tecnico/evidencia-motor18/l18', f), join(R, `L18-${f}`)); }

// ---------------------------------------------------------------- 6 · continuidad y niveles de registro (C vs esencial, D01, D02)
const sameSport = (a, b) => { const fa = facts(a); const fb = facts(b); return !!fa && !!fb && ['score_home', 'score_away', 'events', 'possessions', 'draws', 'trajectory_fp'].every((k) => fa[k] === fb[k]); };
const famSig = (r) => { const f = r.essential?.familiarity ?? r.result?.familiarity; return f ? { operations: f.exposure?.operations, players_fp: sha(f.exposure?.players ?? null) } : null; };
const cont = agenda.runs.filter((r) => r.block === 'C').map((r) => { const c = byId[r.id]; const e = byId[r.essential_link]; const sp = c?.ok && e?.ok ? sameSport(c, e) : null; const fc = c?.ok ? famSig(c) : null; const fe = e?.ok ? famSig(e) : null; return { diagnostic: r.id, essential: r.essential_link, same_sport: sp, trajectory_fp_note: 'ambos con huella incremental sobre los hechos', exposure_diag: fc?.operations ?? null, exposure_essential: fe?.operations ?? null, exposure_players_equal: fc && fe ? fc.players_fp === fe.players_fp : null }; });
const d01 = byId.D01; const b01 = byId['B01-K8'];
W('continuidad-y-niveles.json', { study: STUDY, c_pairs: cont, d01: { same_sport_as_B01K8: d01?.ok && b01?.ok ? sameSport(d01, b01) : null, note: 'cambia solo la Polivalencia de EQ02: el partido debe coincidir; la propuesta de aprendizaje puede cambiar (ver aprendizaje.json)' }, d02: byId.D02?.d02 ?? null });

// ---------------------------------------------------------------- 7 · coste, auditoría/sensibilidad (ganchos), verificaciones
const cost = done.filter((r) => !r.special).map((r) => ({ run_id: r.id, version: r.version, level: r.level, exec_ms: r.result?.exec_ms ?? null, simulate_ms: r.result?.timings?.simulate_ms ?? null, record_ms: r.result?.timings?.record_ms ?? null, bytes_main: r.result?.bytes?.essential_json ?? null, bytes_files: (r.result?.files ?? []).reduce((s, f) => s + f.bytes, 0), diagnostics_bytes: r.level === 'diagnostic' ? (r.result?.files ?? []).reduce((s, f) => s + f.bytes, 0) : null }));
W('coste.json', { study: STUDY, per_run: cost, note: 'sin extrapolación a cien o doscientos; el objetivo heredado de cien partidos en cinco segundos sigue abierto y no se mide aquí' });
const aud = join(OUT, 'auditoria', 'M18'); W('auditoria-y-sensibilidad.json', existsSync(join(aud, 'resumen.json')) ? { status: 'aportado', summary: J(join(aud, 'resumen.json')), knowledge_sensitivity: existsSync(join(aud, 'sensibilidad-conocimiento.csv')) ? 'aportada' : 'pendiente (lectura de conocimiento no ejecutada)' } : { status: 'pendiente', reason: 'la auditoría de los seis diagnósticos no se ha ejecutado todavía (scripts/m18-audit-regen.js sobre out/motor18/lotes/M18 con los lotes C)' });
const aux = join(TREE, 'docs/tecnico/evidencia-motor18/auditor/resumen-sensibilidad-y-aud11.json'); if (existsSync(aux)) copyFileSync(aux, join(R, 'correcciones-17B-resumen.json'));
const ver = join(OUT, 'verificaciones'); W('verificaciones.json', { status: existsSync(ver) ? 'aportadas' : 'pendiente', items: existsSync(ver) ? readdirSync(ver).map((f) => ({ file: f, sha256: sha(readFileSync(join(ver, f), 'utf8')) })) : [], expected: ['suite completa', 'data:check', 'comprobación documental', 'recorrido de navegador', 'descarga real por bytes'], note: 'cada una: aportada / pendiente / no ejecutada, con su log' });
W('claves.json', { study: STUDY, keys: 'row_key = estudio:versión de código:lote:intento', columns: { ejecuciones: EXC, jugadores: PLC }, units: { min_tenths: 'décimas de minuto de juego vivo', exec_ms: 'ms', 'exposición módulo': 'crédito ponderado por operación', 'exposición posición/rol': 'décimas de juego vivo' }, nulls: 'celda vacía = no disponible (nunca cero)' });
// ---------------------------------------------------------------- 8 · parámetros SEM18 (todas las filas nuevas con su valor) y diferencias frente al control
{ const ext = J(join(TREE, 'data/match/motor18-seed-extension.json')); const flat = []; const walk = (o, path) => { if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) walk(v, [...path, k]); else flat.push({ id: path.join('.'), value: o }); }; walk(ext.additions.familiarity, ['familiarity']);
  const ctl = await import(pathToFileURL(`${freeze.git.CONTROL17B.root}/scripts/node-data.js`).href); const cp = ctl.loadData().profile; const mp = loadData().profile; const strip = (p) => { const { familiarity, effectiveId, extensions, ...rest } = p; void familiarity; void effectiveId; void extensions; return rest; };
  const same = sha(strip(cp)) === sha(strip(mp)); W('parametros-SEM18.json', { extension_id: ext.seedExtensionId, status: ext.status, origin: ext.origin, rows: flat, row_count: flat.length, diff_vs_control: { control_has_familiarity: !!cp.familiarity, only_difference_is_added_familiarity_tree: same, note: 'las filas de MOTOR-17B se conservan idénticas; SEM18 solo añade el árbol `familiarity`' } }); }
console.log(JSON.stringify({ runs: runs.length, done: done.length, contrasts: contrasts.filter((c) => c.available).length, learning: learn.filter((x) => x.ok).length, examples: Object.fromEntries(Object.entries(examples).map(([k, v]) => [k, !!v])) }));
