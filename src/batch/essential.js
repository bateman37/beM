// Nivel de conservación `world-essential` (MOTOR-15 §11). Mismo resolutor exacto que completo y reducido (detalle `minimal` del núcleo, trayectoria idéntica): solo cambia lo que se CONSERVA.
// No genera prosa, árbol diagnóstico de candidatos, copias de perfil por decisión ni tablas de auditoría; no vuelve a calcular nada que el motor ya produjo: lee hechos y acta del resultado.
// Un único archivo compacto por intento (`esencial/<M>--<A>.json`, filas en columnas + diccionarios compartidos) más las tablas baratas derivables del acta. Los datos comprometidos son los de
// MOTOR-15 §11.2; lo que NO conserva (pesos detallados, sorteos con ordinal, decisiones calculadas) se publica en la matriz de `data/batch/matriz-consultas-motor15.json`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ENGINE_VERSION } from '../match/index.js';
import { makeCtx, validityOf, matchFacts, RECORDS_VERSION } from './records.js';
import { trajectoryFingerprint } from './fingerprint.js';
import { TrajectoryObserver, INCREMENTAL_FP_VERSION } from './observer.js';
import { sha256 } from './hashing.js';
import { orgAt } from '../analysis/orgat.js';

export const ESSENTIAL_LEVEL = 'world-essential';
export const ESSENTIAL_SCHEMA = 'beM-essential-record/1';
export const ESSENTIAL_VERSION = 'ESE-MOTOR18-R1'; // MOTOR-18: añade `familiarity` (instantánea de conocimiento, resumen de aplicación y exposición final); ESE-MOTOR17B-R1 es idéntico en `defense_org` y se reconoce como tal
const DEFENSE_ORG_CURRENT = new Set(['ESE-MOTOR17B-R1', 'ESE-MOTOR18-R1']);
// MOTOR-17B (B17-01): `defense_org` es el CÓDIGO de la organización efectiva (antes: objeto de intención de intervención); ESE-MOTOR17-R1 añadió `team_index` por jugador; ESE-MOTOR15-R1 no lo incluía
// Semántica explícita de los campos de organización defensiva (MOTOR-17B §4). Un archivo con otra versión NO equivale: ver `legacyDefenseOrg`.
export const DEFENSE_ORG_SEMANTICS = {
  version: 'ESE-MOTOR17B-R1',
  shots: { defense_org: 'string|null · código de la organización defensiva EFECTIVA vigente antes del hecho (plan + órdenes aplicadas + organización efectiva del motor), leído con `analysis/orgat.orgAt`', defense_org_intended: 'string|null · organización pretendida (plan u orden aplicada) antes del hecho',
    defense_org_alternate: 'boolean|null · la efectiva es la alternativa reglada de un box and one', defense_org_objective: 'string|null · jugador objetivo del box and one vigente', defense_org_plan_version: 'integer · órdenes de organización aplicadas antes del hecho',
    defense_org_source: "'plan'|'orden aplicada'|'alternativa'|'no reconstruible' · origen de la lectura (nunca se inventa una organización)", defense_org_reason: 'string|null · motivo cuando el origen es «no reconstruible»', defense_intervention: 'object|null · decisiones de intervención (contener, negar, ayudar, intentar robo) de la intención del hecho; NO es la organización' },
  tactics: { org: 'string|null · organización efectiva si no cambia en la posesión; null con `org_mixed` si hay varias', orgs: 'string[] · organizaciones efectivas distintas por orden de aparición', org_mixed: 'boolean', org_intended: 'string|null', org_source: 'ver shots.defense_org_source', intervention: 'object|null · última intención de intervención de la posesión' },
};
export const legacyDefenseOrg = (rec) => (DEFENSE_ORG_CURRENT.has(rec?.essential_version) ? null : { status: 'histórico', reason: `${rec?.essential_version ?? 'sin versión'}: \`defense_org\` guardaba la intención de intervención (objeto), no el código de organización efectiva; no se reinterpreta como observación original` });
// Huella de trayectoria: `incremental` (observador durante la simulación, por defecto), `full` (TRAY-MOTOR12-R1 sobre el resultado) o `none` (no se calcula y se declara así).
export const FINGERPRINT_MODES = ['incremental', 'full', 'none'];
// Validación: `full` (conciliación del acta + conciliación analítica, las mismas operaciones comunes que el resto de niveles) o `acta` (solo la conciliación del acta; declarado).
export const VALIDATION_MODES = ['full', 'acta'];

const put = (dir, rel, text, files, meta) => { const p = join(dir, rel); mkdirSync(dirname(p), { recursive: true }); const buf = Buffer.from(text, 'utf8'); writeFileSync(p, buf); files.push({ path: rel, bytes: buf.length, sha256: sha256(buf), ...meta }); };

// ---------------------------------------------------------------------------------------------------------------- proyección compacta
const SEQ_COLS = ['seq', 'id', 'type', 'period', 'team', 'possession', 'clock_before', 'clock_after', 'shot_clock_after', 'duration_tenths', 'lineup_home', 'lineup_away', 'score_home', 'score_away', 'actor', 'stats'];
const SHOT_COLS = ['event_id', 'seq', 'period', 'team', 'possession', 'shooter', 'zone', 'points', 'made', 'from_foul', 'annulled', 'blocked_by', 'defender', 'passer', 'moved', 'window', 'quality', 'family', 'sector', 'origin', 'context', 'execution', 'coverage', 'defense_org', 'defense_org_intended', 'defense_org_alternate', 'defense_org_objective', 'defense_org_plan_version', 'defense_org_source', 'defense_org_reason', 'defense_intervention'];

// Lector compartido de la organización efectiva en la frontera de cada hecho (el MISMO `orgAt` que usa el análisis del partido; sin segunda interpretación).
const orgReader = (res) => { const byId = {}; for (const e of res.events) byId[e.id] = e; const ix = { res, events: res.events, byId, input: res.input }; return (defTeam, seq) => { const o = orgAt(ix, defTeam, seq); return { code: o.reconstructable ? o.effective : null, intended: o.reconstructable ? o.intended : null, alternate: o.reconstructable ? o.alternate : null, objective: o.objective, version: o.planVersion, source: !o.reconstructable ? 'no reconstruible' : o.alternate ? 'alternativa' : o.planVersion > 0 ? 'orden aplicada' : 'plan', reason: o.reconstructable ? null : 'una orden de organización aplicada no conserva el hecho de activación: no se reconstruye la organización vigente' }; }; };

export function compactSequence(res) {
  const rows = res.events.map((e) => [e.seq, e.id, e.type, e.period, e.team ?? null, e.possessionId ?? null, e.clock?.before ?? null, e.clock?.after ?? null, e.shotClock?.after ?? null, e.durationTenths ?? 0, e.lineups?.[0] ?? null, e.lineups?.[1] ?? null, e.score?.[0] ?? null, e.score?.[1] ?? null, e.participants?.actor ?? e.participants?.lanzador ?? e.participants?.infractor ?? null, e.stats?.length ? e.stats : null]);
  return { columns: SEQ_COLS, rows };
}
export function compactShots(res) {
  const rows = []; const orgOf = orgReader(res);
  for (const e of res.events) for (const f of e.stats ?? []) {
    if (f.k !== 'shot') continue; const i = e.intent ?? {};
    const o = orgOf(1 - f.team, e.seq);
    rows.push([e.id, e.seq, e.period, f.team, e.possessionId ?? null, f.p, f.zone, f.points, !!f.made, !!f.fromFoul, !!f.annulled, f.blockedBy ?? null, e.participants?.defensor ?? null, f.feed?.passer ?? null, f.feed ? !!f.feed.moved : null, f.feed ? !!f.feed.window : null,
      i.calidad ?? null, i.familia ?? null, i.sector ?? null, i.origen ?? null, i.contexto ?? null, i.ejecucion ?? null, i.cobertura?.id ?? null, o.code, o.intended, o.alternate, o.objective, o.version, o.source, o.reason, i.defensa ?? null]);
  }
  return { columns: SHOT_COLS, rows };
}
// Organización/cobertura efectivas y familias ejecutadas por posesión (lo que sustenta los análisis tácticos ofrecidos), leídas de la intención ya registrada.
export function compactTactics(res) {
  const byPoss = new Map(); const orgOf = orgReader(res);
  for (const e of res.events) {
    if (e.type !== 'attempt' || !e.possessionId) continue; const i = e.intent ?? {};
    const r = byPoss.get(e.possessionId) ?? { possession: e.possessionId, team: e.team, families: [], coverage: null, disposition: i.disposicion ?? null, org: null, orgs: [], org_mixed: false, org_intended: null, org_source: null, intervention: null };
    if (i.familia && !r.families.includes(i.familia)) r.families.push(i.familia);
    const o = orgOf(1 - e.team, e.seq); if (o.code != null && !r.orgs.includes(o.code)) r.orgs.push(o.code); r.org_intended = o.intended; r.org_source = o.source;
    if (i.cobertura?.id) r.coverage = i.cobertura.id; if (i.defensa) r.intervention = i.defensa; byPoss.set(e.possessionId, r);
  }
  for (const r of byPoss.values()) { r.org_mixed = r.orgs.length > 1; r.org = r.orgs.length === 1 ? r.orgs[0] : null; }
  return [...byPoss.values()];
}
const lineByPlayer = (a) => Object.values(a.players).map((p) => ({ id: p.id, team: p.team, team_index: p.team, participation: p.participation, min_tenths: p.minTenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, ast_fg: p.astFg, ast_ft: p.astFt, tov: p.tov, stl: p.stl, blk: p.blk, blk_rec: p.blkRec, pf: p.pf, fr: p.fr, pm: p.pm, val: p.val, fouls: p.fouls }));

// MOTOR-18 (§13.1): la instantánea completa de conocimiento vive UNA vez por intento; las operaciones solo guardan referencias y lo realmente usado (resumen de aplicación y exposición final con unidad).
function familiarityBlock(res, dg) {
  const fam = dg.familiarity ?? null; if (!fam) return null;
  const snapshot = res.input.teams.map((t) => ({ team: t.id, coach_learning: t.coachLearning ?? null, players: t.players.map((p) => ({ id: p.id, mode: p.knowledge?.mode ?? 'legacy-neutral', tactical_learning: p.development?.tacticalLearning ?? null, knowledge: p.knowledge?.mode === 'explicit' ? p.knowledge : null })) }));
  return { ...fam, snapshot };
}

export function buildEssential(res, { keys, validity, fp, fpMode, sim }) {
  const a = res.acta; const dg = res.diagnostics ?? {};
  return {
    schema: ESSENTIAL_SCHEMA, essential_version: ESSENTIAL_VERSION, level: ESSENTIAL_LEVEL, keys, field_semantics: DEFENSE_ORG_SEMANTICS,
    identity: { engine: ENGINE_VERSION, records: RECORDS_VERSION, format: res.identity.formatVersion, rules_profile: res.identity.rulesProfile, content_profile: res.identity.contentProfile, effective_profile: res.identity.effectiveProfileId, extensions: (res.identity.extensions ?? []).map((x) => x.id ?? x),
      seed: res.input.seed, importance: res.input.importance, teams: res.input.teams.map((t) => ({ id: t.id, name: t.name, source: t.source?.instance ?? null })) },
    result: { status: res.status, court_score: res.score, period_scores: res.periodScores, game_tenths: res.events.reduce((s, e) => s + (e.durationTenths ?? 0), 0), administrative: res.administrative ?? null, error: res.status === 'error' ? (res.errors ?? []).map((e) => e.message) : null,
      note: 'court_score es lo producido en cancha; el resultado adjudicado, si existe, va en `administrative` y no se mezcla con él.' },
    validity: { valid: validity.valid, reasons: validity.reasons, reconciliation_ok: validity.reconciliation_ok, analysis_ok: validity.analysis_ok, mode: validity.mode },
    acta: { policy: a.policy, status: a.status, players: lineByPlayer(a), teams: a.teams.map((t) => ({ id: t.id, points: t.points, totals: t.totals, collective: t.collective, fouls: t.fouls, timeouts: t.timeouts })), periods: a.periods, series: a.series, finals: a.finals, possessions: a.possessions, partition: a.partition, credits: a.credits },
    presence: { lineups: res.lineups, intervals: a.presence.intervals, game_tenths: a.presence.game },
    sequence: compactSequence(res), shots: compactShots(res), tactics: compactTactics(res),
    direction: { orders: res.orders, commands: res.commands, coach: dg.coach ? { delegation: dg.coach.delegation, counts: dg.coach.counts } : null },
    states: { samples: dg.stateSamples ?? null, final_energy: dg.finalEnergy ?? null, state_log: dg.stateLog ?? null, episodes: dg.episodes ?? null, snapshot: dg.states ?? null },
    familiarity: familiarityBlock(res, dg),
    regulation: { coach_counters: dg.coachCounters ?? null, incidents: dg.incidents ?? null, corrections: dg.corrections ?? null, interference: dg.interference ?? null },
    integrity: { trajectory_fp: fp?.sha256 ?? null, trajectory_fp_mode: fpMode, trajectory_fp_version: fpMode === 'incremental' ? INCREMENTAL_FP_VERSION : fpMode === 'full' ? 'TRAY-MOTOR12-R1' : null,
      steps: res.result?.stepCount ?? null, sporting_draws: dg.sportingDraws ?? null, events: res.events.length, coverage_observed: dg.coverageObserved ?? null, policies: { acta: a.policy }, reconciliation_version: res.reconciliation?.version ?? null,
      not_retained: ['calc por decisión', 'sorteos con ordinal (solo su cuenta y la huella)', 'parámetros consultados por hecho', 'relato', 'tablas de auditoría'], simulate_ms_hint: sim?.ms ?? null },
  };
}

// ---------------------------------------------------------------------------------------------------------------- intento
// `task`: { frozen, ex, attemptNo, attemptId, outDir, fingerprint?, validation?, now?, simulate? } con el mismo contrato de salida que `executeAttempt`.
export function executeEssential(task, defaultSimulate) {
  const { frozen, ex, attemptNo, attemptId, outDir, now = Date.now, simulate = defaultSimulate, fingerprint = 'incremental', validation = 'full' } = task;
  if (!FINGERPRINT_MODES.includes(fingerprint)) throw new Error(`modo de huella desconocido: ${fingerprint}`);
  if (!VALIDATION_MODES.includes(validation)) throw new Error(`modo de validación desconocido: ${validation}`);
  const startedAt = now(); const t0 = performance.now(); const files = []; let error = null; let res = null;
  const keys = { batch_id: frozen.batch_id, variant_id: ex.variant_id, case_id: ex.case_id, match_id: ex.match_id, attempt_id: attemptId };
  const T = { prepare_ms: 0, simulate_ms: 0, validate_ms: 0, fingerprint_ms: 0, capture_ms: 0, serialize_ms: 0, write_ms: 0 };
  let a = performance.now(); const entry = frozen.entryOf(ex); const input = frozen.inputFor(entry, ex.seed); T.prepare_ms = performance.now() - a;
  const observer = fingerprint === 'incremental' ? new TrajectoryObserver() : null;
  a = performance.now(); const r = simulate(input, frozen.profile, { level: ESSENTIAL_LEVEL, planned: entry.planned_orders ?? [], profileRef: { batch: frozen.batch_id, profile_id: frozen.profile_id }, observer }); T.simulate_ms = performance.now() - a;
  res = r.res; error = r.error; const scheduledLog = r.scheduledLog ?? [];
  let facts = {}; let validity = { valid: false, reasons: [], reconciliation_ok: false, analysis_ok: false }; let fpRec = null; let lastEvent = null; let bytes = 0;
  if (res) {
    lastEvent = res.events.length ? { id: res.events[res.events.length - 1].id, seq: res.events[res.events.length - 1].seq } : null;
    const ctx = makeCtx(res, { keys, entry }); ctx.scheduledLog = scheduledLog;
    try {
      a = performance.now();
      if (res.status !== 'finished') validity = { valid: false, reasons: [`partido no terminado (estado ${res.status})`], reconciliation_ok: false, analysis_ok: false, mode: validation };
      else if (validation === 'acta') { const ok = !!res.reconciliation?.valid; validity = { valid: ok, reasons: ok ? [] : ['la conciliación del acta no pasó'], reconciliation_ok: ok, analysis_ok: null, mode: 'acta' }; }
      else validity = { ...validityOf(res), mode: 'full' };
      T.validate_ms = performance.now() - a;
      a = performance.now();
      if (fingerprint === 'incremental') fpRec = r.observed ?? null; else if (fingerprint === 'full') fpRec = res.events.length ? { sha256: trajectoryFingerprint(res) } : null;
      T.fingerprint_ms = fingerprint === 'incremental' ? (r.observed?.ms ?? 0) : performance.now() - a;
      a = performance.now();
      facts = { ...matchFacts({ ...res, events: res.events }, ctx, validity, { skipFingerprint: true }), trajectory_fp: fpRec?.sha256 ?? null, trajectory_fp_mode: fingerprint, trajectory_fp_version: fingerprint === 'incremental' ? INCREMENTAL_FP_VERSION : fingerprint === 'full' ? 'TRAY-MOTOR12-R1' : null };
      const rec = buildEssential(res, { keys, validity, fp: fpRec, fpMode: fingerprint, sim: { ms: T.simulate_ms } });
      T.capture_ms = performance.now() - a; a = performance.now();
      const text = JSON.stringify(rec); T.serialize_ms = performance.now() - a; bytes = Buffer.byteLength(text); a = performance.now();
      put(outDir, `esencial/${ex.match_id}--${attemptId}.json`, text, files, { kind: 'json', stream: 'esencial', records: 1, audience: 'diagnostic' });
      T.write_ms = performance.now() - a;
    } catch (e) { error ??= { phase: 'registro', message: `fallo al registrar: ${e.message}`, stack: String(e.stack ?? '').split('\n').slice(0, 6) }; validity = { ...validity, valid: false, reasons: [...(validity.reasons ?? []), 'registro incompleto'] }; }
  }
  const failed = !!error || res?.status === 'error' || !res;
  const finishedAt = now(); const ms = performance.now() - t0;
  const outcome = {
    attempt_id: attemptId, match_id: ex.match_id, attempt_no: attemptNo, exec_state: failed ? 'fallida' : 'terminada', sporting_status: res?.status ?? null, valid: !failed && validity.valid,
    exclusion_reason: failed ? (error ? `${error.phase}: ${error.message}` : 'error de ejecución') : validity.reasons.join('; '), started_at: startedAt, finished_at: finishedAt, exec_ms: ms, record_level: ESSENTIAL_LEVEL,
    engine_version: ENGINE_VERSION, records_version: ESSENTIAL_VERSION, error, last_event_id: lastEvent?.id ?? null, last_sequence: lastEvent?.seq ?? null, facts,
    counts: { eventos: res?.events.length ?? 0, decisiones: 0, sorteos: res?.diagnostics?.sportingDraws ?? 0, ordenes: (res?.orders?.length ?? 0), estados: res?.diagnostics?.stateLog?.length ?? 0 }, files, scheduled_orders: scheduledLog.length,
    timings: { ...T, simulate_ms: T.simulate_ms, record_ms: T.validate_ms + T.fingerprint_ms + T.capture_ms + T.serialize_ms, write_ms: T.write_ms }, bytes: { essential_json: bytes }, dir_files: files.map((f) => f.path),
  };
  mkdirSync(outDir, { recursive: true }); writeFileSync(join(outDir, 'resultado.json'), JSON.stringify({ schema: 'beM-batch-attempt/1', ...outcome }));
  return outcome;
}
