// Registros de un intento (MOTOR-12 §10, §12–§14): convierte el resultado completo de un partido en filas de tablas y en registros JSONL con identificadores de relación.
// Todo se lee de lo que el motor YA calculó y registró (hechos, `calc`, `draws`, `params`, acta, análisis de MOTOR-10): no se vuelve a resolver nada, no se sortea y no se llama a
// ningún lector que actualice estados. Los componentes que el motor no calcula quedan sin fila (cobertura declarada), nunca se rellenan.
import { analyze, indexOf } from '../analysis/index.js';
import { CATALOG_BY_ID } from '../analysis/catalog.js';
import { reconcileAnalysis } from '../analysis/reconcile.js';
import { PLAYER_ID } from '../population/ids.js';
import { rowOf, TABLES } from './schema.js';
import { jsonl, csvLine } from './util.js';
import { trajectoryFingerprint } from './fingerprint.js';

export const RECORDS_VERSION = 'REG-MOTOR12-R1';
export const sourceTeamOf = (t) => t.source?.instance?.of ?? t.id;
export const sourcePlayerOf = (pid, srcTeam) => { const m = PLAYER_ID.exec(pid); return m ? `${srcTeam}-J${m[2]}` : pid; };
const TENTHS_OF_PERIOD = (p) => (p <= 4 ? 6000 : 3000);
void TENTHS_OF_PERIOD;

// ---------------------------------------------------------------------------------------------------------------- contexto de relación
export function makeCtx(res, { keys, entry = null }) {
  const teams = res.input.teams; const srcTeam = teams.map(sourceTeamOf);
  const teamOfPlayer = {}; const srcPlayer = {};
  teams.forEach((t, ti) => t.players.forEach((p) => { teamOfPlayer[p.id] = ti; srcPlayer[p.id] = sourcePlayerOf(p.id, srcTeam[ti]); }));
  const lineupIdByKey = {}; for (const l of res.lineups ?? []) lineupIdByKey[`${l.team}|${l.key}`] = l.id;
  return { keys, teams, srcTeam, teamOfPlayer, srcPlayer, lineupIdByKey, entry, tid: (i) => (i == null ? null : teams[i]?.id ?? null) };
}
const K = (ctx) => ({ batch_id: ctx.keys.batch_id, variant_id: ctx.keys.variant_id, case_id: ctx.keys.case_id, match_id: ctx.keys.match_id, attempt_id: ctx.keys.attempt_id });

// ---------------------------------------------------------------------------------------------------------------- flujos JSONL (siempre, también en intentos fallidos)
const KIND = (label) => { const m = /^([^:]+):/.exec(label); const p = m ? m[1] : label; return { receta: 'receta', sorteo: 'distribucion', binaria: 'binaria', duración: 'duracion', estados: 'estado' }[p] ?? p; };
const DRAW_LABEL = /^(sorteo|binaria|duración):(.*)$/;
const r6 = (x) => Math.round(x * 1e6) / 1e6;

// Une cada entrada de cálculo que consumió un sorteo con el sorteo (propósito y valor u coinciden, en el mismo orden de resolución).
export function linkDraws(calc, draws) {
  const link = new Array(calc.length).fill(null); let p = 0;
  calc.forEach((c, i) => {
    const m = DRAW_LABEL.exec(c.label ?? ''); if (!m) return;
    for (let j = p; j < draws.length; j++) if (draws[j].purpose === m[2] && (c.u === undefined || Math.abs(r6(draws[j].u) - c.u) < 1e-9)) { link[i] = j; p = j + 1; break; }
  });
  return link;
}

export function eventStreams(res, ctx, { level }) {
  const diag = level === 'diagnostic'; const K0 = K(ctx); const att = ctx.keys.attempt_id; const table = res.diagnostics?.paramTable ?? null;
  const out = { eventos: [], ordenes: [], estados: [], decisiones: [], sorteos: [], capUse: new Map(), counts: { eventos: 0, decisiones: 0, sorteos: 0, ordenes: 0, estados: 0 } };
  const idOf = (e) => e.id;
  for (const ev of res.events) {
    const { calc, params, draws, orders, instr, ...rest } = ev; const calcs = calc ?? []; const ds = draws ?? [];
    const rows = diag && params && table ? params.map((i) => table[i]) : null;
    const rec = { record_type: 'evento', ...K0, event_id: idOf(ev), sequence: ev.seq, ...Object.fromEntries(Object.entries(rest).filter(([k]) => !['id', 'seq'].includes(k))),
      possession_id: ev.possessionId ?? null, team_instance_id: ctx.tid(ev.team), draw_first: ds.length ? ds[0].n : null, draw_last: ds.length ? ds[ds.length - 1].n : null, n_draws: ds.length, n_calc: calcs.length, ...(rows ? { config_rows: rows } : {}), ...(orders?.length ? { order_links: orders } : {}), ...(instr ? { instr } : {}) };
    delete rec.possessionId; out.eventos.push(jsonl(rec)); out.counts.eventos += 1;
    const link = linkDraws(calcs, ds); const drawDecision = new Array(ds.length).fill(null);
    calcs.forEach((c, i) => {
      const { label, ...data } = c; const did = `${att}:${idOf(ev)}:${i + 1}`;
      if (link[i] != null) drawDecision[link[i]] = did;
      out.decisiones.push(jsonl({ record_type: 'calculo', ...K0, decision_id: did, event_id: idOf(ev), sequence: ev.seq, order_in_event: i + 1, kind: KIND(label), label, draw_index: link[i] != null ? ds[link[i]].n : null, data })); out.counts.decisiones += 1;
      if (label?.startsWith('receta:') && Array.isArray(data.terminos)) addCapUse(out.capUse, ctx, label.slice(7), data.terminos);
    });
    ds.forEach((d, j) => { out.sorteos.push(jsonl({ record_type: 'sorteo', ...K0, draw_index: d.n, purpose: d.purpose, u: d.u, event_id: idOf(ev), sequence: ev.seq, decision_id: drawDecision[j], operation: drawDecision[j] ? calcs[Number(drawDecision[j].split(':').pop()) - 1].label : `sin cálculo registrado: ${d.purpose}` })); out.counts.sorteos += 1; });
    if (rows?.length) { out.decisiones.push(jsonl({ record_type: 'parametros', ...K0, event_id: idOf(ev), sequence: ev.seq, rows })); out.counts.decisiones += 1; }
  }
  const dg = res.diagnostics ?? {};
  (dg.opportunities ?? []).forEach((o) => { out.decisiones.push(jsonl({ record_type: 'oportunidad', ...K0, decision_id: `${att}:OPP${o.n}`, ...o })); out.counts.decisiones += 1; });
  (dg.coach?.decisions ?? []).forEach((d) => { const { version, ...r } = d; out.decisiones.push(jsonl({ record_type: 'entrenador', ...K0, decision_id: `${att}:${d.id}`, ...r, version })); out.counts.decisiones += 1; });
  (dg.memory?.log ?? []).forEach((m) => { out.decisiones.push(jsonl({ record_type: 'memoria', ...K0, decision_id: `${att}:MEM${m.n}`, ...m })); out.counts.decisiones += 1; });
  (dg.throwInChains ?? []).forEach((c) => { out.decisiones.push(jsonl({ record_type: 'cadena_saque', ...K0, decision_id: `${att}:${c.id}`, ...c })); out.counts.decisiones += 1; });
  (res.orders ?? []).forEach((o) => { out.ordenes.push(jsonl({ record_type: 'orden', ...K0, order_id: o.id, actor: o.issuer === 'auto' ? 'automatico' : o.scheduled ? 'programado' : 'humano', ...o })); out.counts.ordenes += 1; });
  (res.commands ?? []).forEach((c, i) => { out.ordenes.push(jsonl({ record_type: 'comando', ...K0, command_no: i + 1, ...c })); out.counts.ordenes += 1; });
  for (const so of ctx.scheduledLog ?? []) { out.ordenes.push(jsonl({ record_type: 'orden_programada', ...K0, ...so })); out.counts.ordenes += 1; }
  (dg.stateLog ?? []).forEach((s, i) => { out.estados.push(jsonl({ record_type: 'cambio_estado', ...K0, state_change_no: i + 1, ...s })); out.counts.estados += 1; });
  (dg.episodes ?? []).forEach((e, i) => { out.estados.push(jsonl({ record_type: 'episodio', ...K0, episode_no: i + 1, ...e })); out.counts.estados += 1; });
  return out;
}

function addCapUse(map, ctx, task, terms) {
  const W = terms.reduce((s, t) => s + t.peso, 0) || 1;
  for (const t of terms) {
    const key = `${t.jugador}|${task}|${t.rol}|${t.cap}`; let a = map.get(key);
    if (!a) { a = { player: t.jugador, task, role: t.rol, cap: t.cap, uses: 0, w: 0, ws: 0, base: 0, eff: 0, contrib: 0 }; map.set(key, a); }
    a.uses += 1; a.w += t.peso; a.ws += t.peso / W; a.base += t.base; a.eff += t.efectiva; a.contrib += (t.peso / W) * t.efectiva;
  }
}

// ---------------------------------------------------------------------------------------------------------------- tablas (solo con partido terminado)
const flat = (T) => T.totals;
export function statusOf(r) {
  if (r.value != null) return 'ok';
  const def = CATALOG_BY_ID[r.id];
  if (def?.scope === 'players') return 'no_aplicable';
  if (r.coverage === 'no registrado' || r.coverage === 'dependiente de datos') return 'no_registrado';
  if (r.coverage === 'no aplicable') return 'no_aplicable';
  return 'no_calculable';
}

export function validityOf(res) {
  const rec = res.status === 'finished' ? reconcileAnalysis(res) : null;
  const reasons = [];
  if (res.status !== 'finished') reasons.push(`partido no terminado (estado ${res.status})`);
  else { if (!res.reconciliation?.valid) reasons.push('la conciliación del acta no pasó'); if (!rec?.ok) reasons.push('la conciliación analítica no pasó'); }
  return { valid: reasons.length === 0, reasons, reconciliation_ok: !!res.reconciliation?.valid, analysis_ok: !!rec?.ok, analysisTotal: rec?.total ?? null };
}

export function buildTables(res, ctx, validity) {
  const K0 = K(ctx); const T = Object.fromEntries(Object.keys(TABLES).filter((k) => k !== 'intentos' && k !== 'partidos').map((k) => [k, []]));
  const push = (name, obj) => T[name].push(rowOf(name, { ...K0, ...obj }));
  const dx = analyze(res, { audience: 'diagnostic', team: 0 }); const ix = indexOf(res); const acta = res.acta; const [sh, sa] = res.score; void sh; void sa;
  const tid = ctx.tid; const sp = (i) => ctx.srcTeam[i];
  // periodos
  const perTenths = {}; for (const e of res.events) perTenths[e.period] = (perTenths[e.period] ?? 0) + (e.durationTenths ?? 0);
  for (const p of res.periodScores) push('periodos', { period: p.period, period_label: p.period <= 4 ? `C${p.period}` : `P${p.period - 4}`, overtime: p.period > 4, points_home: p.points[0], points_away: p.points[1], game_tenths: perTenths[p.period] ?? 0 });
  // equipos
  const finalsOf = [0, 1].map((t) => acta.finals.filter((f) => f.team === t && f.closed)); const possOf = [0, 1].map((t) => acta.possessions.filter((p) => p.team === t).length);
  for (const t of [0, 1]) {
    const x = flat(acta.teams[t]); const o = flat(acta.teams[1 - t]); const col = acta.teams[t].collective ?? {};
    push('equipos', { team_index: t, side: t === 0 ? 'home' : 'away', team_instance_id: tid(t), source_team_id: sp(t), opponent_team_instance_id: tid(1 - t), opponent_source_team_id: sp(1 - t),
      pts: x.pts, fgm: x.fgm, fga: x.fga, fg2m: x.fg2m, fg2a: x.fg2a, fg3m: x.fg3m, fg3a: x.fg3a, ftm: x.ftm, fta: x.fta, oreb: x.oreb, dreb: x.dreb, reb: x.reb, ast: x.ast, ast_fg: x.astFg, ast_ft: x.astFt, tov: x.tov, stl: x.stl, blk: x.blk, blk_rec: x.blkRec, pf: x.pf, fr: x.fr, min_total: x.min,
      collective_tov: col.tov ?? 0, collective_reb: col.reb ?? 0, substitutions: res.events.filter((e) => e.type === 'substitution' && e.team === t).length, timeouts: res.events.filter((e) => e.type === 'timeout' && e.team === t).length, possessions: possOf[t], finals: finalsOf[t].length, points_f: finalsOf[t].reduce((s, f) => s + f.points, 0), points_admin: acta.partition?.byOrigin?.administrative ?? 0,
      pts_against: o.pts, win: x.pts === o.pts ? null : x.pts > o.pts ? 1 : 0 });
  }
  // jugadores
  for (const p of Object.values(acta.players)) {
    push('jugadores', { player_instance_id: p.id, source_player_id: ctx.srcPlayer[p.id], team_instance_id: tid(p.team), source_team_id: sp(p.team), position: p.position, starter: p.starter, available: p.available, participation: p.participation, minutes: p.min, min_tenths: p.minTenths,
      pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, reb: p.reb, ast: p.ast, ast_fg: p.astFg, ast_ft: p.astFt, tov: p.tov, stl: p.stl, blk: p.blk, blk_rec: p.blkRec, pf: p.pf, fr: p.fr, plus_minus: p.pm, val: p.val,
      fouls_personal: p.fouls?.personal ?? null, fouls_shooting: p.fouls?.tiro ?? null, fouls_offensive: p.fouls?.ofensiva ?? null, fouls_disruptive: p.fouls?.disruptiva ?? null, fouls_other: p.fouls?.otras ?? null, exit_seq: p.exitSeq ?? null, roster_ref: ctx.entry?.teams?.[p.team]?.players_ref ?? null });
  }
  // posesiones
  for (const p of ix.possessions) {
    const lu = p.lineups ?? [];
    push('posesiones', { possession_id: p.id, team_instance_id: tid(p.team), period: p.period, entry: p.entry, origin: p.origin, start_seq: p.startSeq, end_seq: p.endSeq, end_kind: p.endKind, close_cause: p.closeCause, points: p.points, finals: p.finals, events: p.events.length, attempts: p.attempts.length, lineup_home: lu[0] ?? null, lineup_away: lu[1] ?? null });
  }
  // tiros y F
  const shotByEvent = {}; for (const s of ix.shots) shotByEvent[s.id] = s;
  for (const s of ix.shots) {
    const v = { ...s.pub, ...s.own, ...s.diag };
    push('tiros', { event_id: s.id, sequence: s.seq, period: s.period, team_instance_id: tid(s.team), possession_id: s.possession, valid: s.valid, annulled: v.annulled, from_foul: v.fromFoul, shooter_player_instance_id: v.shooter, zone: v.zone, points: v.points, made: v.made, blocked_by: v.blockedBy, defender: v.defender,
      family: v.familia, origin: v.origen, context: v.contexto, execution: v.ejecucion, quality: v.quality, free_window: v.window, coverage: v.coverage, passer: v.passer, moved: v.moved, helper: v.helper, screener: v.screener, cutter: v.cutter,
      def_org_intended: v.defOrg?.intended ?? null, def_org_effective: v.defOrg?.effective ?? null, def_org_alternate: v.defOrg?.alternate ?? null, shooter_function: v.shooterFn, procedencia: v.procedencia, priority: v.prioridad, director: v.director, disposition: v.disposicion, ficha: v.ficha, decides: v.decide,
      p_conversion: v.pConversion, p_final: v.pFinal, selection_L: v.L, selection_q: v.q, clock_before: s.clock.before, clock_after: s.clock.after, score_home_before: s.scoreBefore[0], score_away_before: s.scoreBefore[1], game_before: s.gameBefore, lineup_home: s.lineups?.[0] ?? null, lineup_away: s.lineups?.[1] ?? null, assist_credit_player: s.credit?.p ?? null });
  }
  for (const f of acta.finals) {
    const s = shotByEvent[f.event]?.pub ?? {};
    push('finalizaciones', { finalization_id: f.id, possession_id: f.possession, team_instance_id: tid(f.team), shooter_player_instance_id: f.shooter, event_id: f.event, period: f.period, zone: f.zone, value: f.value, made: f.made, from_foul: f.fromFoul, blocked: f.blocked, series_id: f.series, field_points: f.fieldPoints, series_points: f.seriesPoints, closed: f.closed, points: f.points,
      quality: s.quality ?? null, family: s.familia ?? null, origin: s.origen ?? null, context: s.contexto ?? null, execution: s.ejecucion ?? null, coverage: s.coverage ?? null });
  }
  for (const s of acta.series ?? []) push('series', { series_id: s.id, team_instance_id: tid(s.team), shooter_player_instance_id: s.shooter, granted: s.granted, cause: s.cause, shooting: s.shooting, shot_event_id: s.shotEvent, shot_made: s.shotMade, feed_passer: s.feed?.passer ?? null, feed_moved: s.feed?.moved ?? null, feed_origin: s.feed?.origin ?? null, made: s.made, administered: s.administered, valid: s.valid, annulled: s.annulled, repeated: s.repeated, pending: s.pending, points: s.points, finalization_id: s.final });
  for (const c of acta.credits ?? []) { const { k, p, event, series, ...extra } = c; push('creditos', { kind: k, player_instance_id: p ?? null, event_id: event ?? null, series_id: series ?? null, detail: Object.keys(extra).length ? extra : null }); }
  // ejecuciones, tramos, quintetos
  for (const t of [0, 1]) {
    const a = analyze(res, { audience: 'diagnostic', team: t });
    for (const e of a.executionList(t)) push('ejecuciones', { event_id: e.event, possession_id: e.possession, team_instance_id: tid(t), execution_order: e.order, execution_of: e.of, family: e.family, ficha: e.ficha, procedencia: e.procedencia, director: e.participants?.director ?? null, handler: e.participants?.handler ?? null, screener: e.participants?.screener ?? null, receiver: e.participants?.receiver ?? null, actor: e.participants?.actor ?? null, priority: e.priority, coverage: e.coverage, quality: e.quality, zone: e.zone, result: e.result, continuation: e.continuation, period: e.period });
    for (const q of a.lineups(t).rows) {
      push('quintetos', { team_instance_id: tid(t), lineup_id: q.lineupIds?.[0] ?? ctx.lineupIdByKey[`${t}|${q.key}`] ?? null, lineup_ids: (q.lineupIds ?? []).join('|'), lineup_players: q.players.join('|'), minutes: q.minutes, plus_minus: q.plusMinus, pts_for: q.ptsFor, pts_against: q.ptsAgainst, own_complete: q.ownComplete, rival_complete: q.rivalComplete, mixed: q.mixed,
        ortg_value: q.ortg.value, ortg_num: q.ortg.num, ortg_den: q.ortg.den, drtg_value: q.drtg.value, drtg_num: q.drtg.num, drtg_den: q.drtg.den, sufficient: q.sufficient, stints: q.tramos });
    }
    for (const r of a.indicators(t)) push('indicadores', { team_instance_id: tid(t), source_team_id: sp(t), indicator_id: r.id, label: r.label, group: r.group, value: r.value, num: r.num, den: r.den, unit: r.unit, coverage: r.coverage, status: statusOf(r), reason: r.reason, sample_n: r.sample?.n ?? null });
  }
  void dx;
  (acta.presence?.intervals ?? []).forEach((it, i) => push('tramos', { stint_id: `T${String(i + 1).padStart(4, '0')}`, player_instance_id: it.player, team_instance_id: tid(it.team), start_seq: it.startSeq, start_period: it.startPeriod, start_game_tenths: it.startGame, end_seq: it.endSeq, end_period: it.endPeriod, end_game_tenths: it.endGame, tenths: it.tenths }));
  return T;
}

export function capacityRows(capUse, ctx) {
  const rows = [];
  for (const a of [...capUse.values()].sort((x, y) => (x.player + x.task + x.role + x.cap < y.player + y.task + y.role + y.cap ? -1 : 1))) {
    const ti = ctx.teamOfPlayer[a.player];
    rows.push(rowOf('capacidades-uso', { ...K(ctx), team_instance_id: ctx.tid(ti), player_instance_id: a.player, source_player_id: ctx.srcPlayer[a.player] ?? null, task: a.task, role: a.role, capability: a.cap, uses: a.uses, weight_sum: a.w, weight_share_sum: a.ws, base_sum: a.base, effective_sum: a.eff, contribution_sum: a.contrib }));
  }
  return rows;
}

// Fila de `partidos` (fragmento por intento): el empaquetado la completa con la agenda.
export function matchFacts(res, ctx, validity) {
  const fin = res.status === 'finished'; const [h, a] = res.score;
  return { score_home: fin ? h : res.score?.[0] ?? null, score_away: fin ? a : res.score?.[1] ?? null, winner: validity.valid ? (h === a ? 'tie' : h > a ? 'home' : 'away') : null, periods: res.periodScores?.length ?? null, overtime_periods: Math.max(0, (res.periodScores?.length ?? 4) - 4), game_tenths: res.events.reduce((s, e) => s + (e.durationTenths ?? 0), 0), events: res.events.length, possessions: res.diagnostics?.possessions ?? null, steps: res.result?.stepCount ?? null, draws: res.diagnostics?.sportingDraws ?? null, reconciliation_ok: validity.reconciliation_ok, analysis_ok: validity.analysis_ok, trajectory_fp: res.events.length ? trajectoryFingerprint(res) : null };
}
export const tableText = (rows) => rows.map((r) => csvLine(r)).join('');
