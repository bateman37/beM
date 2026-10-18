// MOTOR-17 §16/§18: aplanado MECÁNICO de la campaña de cierre (R0 y R17) a tablas CSV compactas para ChatGPT, sin interpretación deportiva. Lee los índices y registros esenciales/diagnósticos ya conservados; nulo = celda vacía
// (nunca cero); las unidades van en el nombre de la columna. Un dato no registrado se declara ausente: no se fabrica una tabla vacía como cobertura. Las comparaciones R0/R17 son mecánicas (medias de casos emparejados por clave lógica).
// Uso: node scripts/m17-tables.js [--out=out/motor17] [--plan-dir=out/motor17/plan]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TABLES } from '../src/batch/schema.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor17'); const PLANS = arg('plan-dir', join(OUT, 'plan')); const R = join(OUT, 'rapido'); mkdirSync(R, { recursive: true });
const cell = (v) => { if (v == null || (typeof v === 'number' && !Number.isFinite(v))) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const line = (cols, o) => `${cols.map((c) => cell(o[c])).join(',')}\n`;
const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null); const sd = (a) => { if (a.length < 2) return null; const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const csvSplit = (ln) => { const c = []; let cur = ''; let q = false; for (let i = 0; i < ln.length; i++) { const ch = ln[i]; if (ch === '"') { if (q && ln[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (ch === ',' && !q) { c.push(cur); cur = ''; } else cur += ch; } c.push(cur); return c; };
const jl = (p) => readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const ctx = { counts: {}, checks: [] };
const versions = ['R0', 'R17']; const plans = Object.fromEntries(versions.map((v) => [v, JSON.parse(readFileSync(join(PLANS, `lotes-${v}.json`), 'utf8'))]));
const pairP = Object.fromEntries(plans.R17.pairs.map((x) => [`${x.a}-${x.b}`, x.p]));

// ---------------------------------------------------------------------------------------------------------------- columnas
const EX = ['study', 'row_key', 'version', 'block', 'purpose', 'lot_label', 'batch_id', 'match_id', 'attempt_id', 'attempt_no', 'case_id', 'variant_id', 'logical_group', 'repetition_r', 'side_h', 'home_team', 'away_team', 'sporting_seed', 'record_level', 'exec_state', 'sporting_status', 'valid', 'exclusion_reason', 'score_home', 'score_away', 'periods', 'overtime_periods', 'game_tenths', 'events', 'possessions', 'steps', 'sporting_draws', 'trajectory_fp', 'trajectory_fp_mode', 'trajectory_fp_version', 'engine_version', 'records_version', 'effective_profile_id', 'logical_key', 'principal_row_key'];
const TM = ['row_key', 'version', 'block', 'purpose', 'logical_key', 'team_id', 'team_index', 'points', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'ast', 'tov_individual', 'tov_collective', 'stl', 'blk', 'blk_rec', 'pf', 'fr', 'min', 'possessions_attack', 'fouls_by_period', 'timeouts_by_period'];
const PL = ['row_key', 'version', 'block', 'purpose', 'logical_key', 'player_id', 'player_slot_j', 'team_index', 'participation', 'min_tenths', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'ast', 'tov', 'stl', 'blk', 'blk_rec', 'pf', 'fr', 'pm', 'val', 'stints', 'first_in_period', 'energy_final'];
const PF = ['row_key', 'version', 'block', 'purpose', 'lot_label', 'concurrency_requested', 'concurrency_effective', 'exec_ms', 'wall_ms_coordinator', 'prepare_ms', 'simulate_ms', 'validate_ms', 'fingerprint_ms', 'capture_ms', 'serialize_ms', 'write_ms', 'record_ms', 'bytes_essential_json', 'files_n', 'files_bytes'];
const rows = []; const out = { ex: [EX.join(',') + '\n'], tm: [TM.join(',') + '\n'], pl: [PL.join(',') + '\n'], pf: [PF.join(',') + '\n'] };

for (const v of versions) {
  for (const l of plans[v].lots) {
    const dir = join(OUT, 'lotes', v, l.batch_id); if (!existsSync(join(dir, 'indice.jsonl'))) { ctx.checks.push({ id: 'lote-sin-indice', label: l.label, ok: false }); continue; }
    const lote = JSON.parse(readFileSync(join(dir, 'entradas/lote.json'), 'utf8')); const ag = new Map(lote.agenda.map((e) => [e.match_id, e])); const att = jl(join(dir, 'indice.jsonl')).filter((r) => r.type === 'attempt');
    const purpose = l.kind === 'diagnostico' ? 'diagnostico_completo' : 'principal';
    for (const a of att) {
      const e = ag.get(a.match_id); const r = e.seed % 1000; let group;
      if (l.block === 'A') group = `p${String(pairP[e.pair_id]).padStart(2, '0')}:${e.pair_id}`; else if (l.block === 'B') group = l.exp; else if (l.block === 'C') group = `ORG0${l.org}xCOB0${l.cob}`; else group = `F${l.family}:${l.scenario}`;
      const h = l.block === 'A' ? (e.side === 'vuelta' ? 'H1' : 'H0') : 'fija';
      const rr = l.block === 'A' ? 1 : l.block === 'C' ? 1 : r;
      const lk = `${l.block}|${group}|r${String(rr).padStart(2, '0')}|${h}|${e.variant_id}`; const f = a.facts ?? {};
      const rec = { study: 'MOTOR17-CIERRE-20261018', row_key: `${v}:${l.batch_id}:${a.attempt_id}`, version: v, block: l.block, purpose, lot_label: l.label, batch_id: l.batch_id, match_id: a.match_id, attempt_id: a.attempt_id, attempt_no: a.attempt_no, case_id: e.case_id, variant_id: e.variant_id, logical_group: group, repetition_r: rr, side_h: h, home_team: e.home_ref ?? null, away_team: e.away_ref ?? null, sporting_seed: e.seed, record_level: a.record_level, exec_state: a.exec_state, sporting_status: a.sporting_status, valid: a.valid, exclusion_reason: a.exclusion_reason, score_home: f.score_home, score_away: f.score_away, periods: f.periods, overtime_periods: f.overtime_periods, game_tenths: f.game_tenths, events: f.events, possessions: f.possessions, steps: f.steps, sporting_draws: f.draws, trajectory_fp: f.trajectory_fp, trajectory_fp_mode: f.trajectory_fp_mode, trajectory_fp_version: f.trajectory_fp_version, engine_version: a.engine_version, records_version: a.records_version, effective_profile_id: plans[v].effective_profile_id, logical_key: lk, principal_row_key: '' };
      rows.push({ rec, l, a, dir, lk, v, e });
    }
  }
}
const principal = new Map(); for (const x of rows) if (x.rec.purpose === 'principal') principal.set(`${x.v}|${x.lk}`, x.rec.row_key);
const essentials = new Map();
for (const x of rows) {
  const { rec, l, a, v } = x; rec.principal_row_key = rec.purpose === 'principal' ? '' : (principal.get(`${v}|${x.lk}`) ?? ''); out.ex.push(line(EX, rec));
  const t = a.timings ?? {}; out.pf.push(line(PF, { row_key: rec.row_key, version: v, block: l.block, purpose: rec.purpose, lot_label: l.label, concurrency_requested: l.concurrency_requested, concurrency_effective: a.coordinator?.concurrency, exec_ms: a.exec_ms, wall_ms_coordinator: a.coordinator?.wall_ms, ...t, bytes_essential_json: a.bytes?.essential_json, files_n: (a.files ?? []).length, files_bytes: (a.files ?? []).reduce((s, q) => s + q.bytes, 0) }));
  if (a.record_level === 'world-essential' && a.exec_state === 'terminada') {
    const es = JSON.parse(readFileSync(join(x.dir, 'intentos', a.match_id, a.attempt_id, 'esencial', `${a.match_id}--${a.attempt_id}.json`), 'utf8')); essentials.set(rec.row_key, es);
    const stintsOf = (id) => es.presence.intervals.filter((q) => q.player === id).length;
    es.acta.teams.forEach((tm, i) => out.tm.push(line(TM, { row_key: rec.row_key, version: v, block: l.block, purpose: rec.purpose, logical_key: x.lk, team_id: tm.id, team_index: i, points: tm.points, fg2m: tm.totals.fg2m, fg2a: tm.totals.fg2a, fg3m: tm.totals.fg3m, fg3a: tm.totals.fg3a, ftm: tm.totals.ftm, fta: tm.totals.fta, oreb: tm.totals.oreb, dreb: tm.totals.dreb, ast: tm.totals.ast, tov_individual: tm.totals.tov, tov_collective: tm.collective?.tov, stl: tm.totals.stl, blk: tm.totals.blk, blk_rec: tm.totals.blkRec, pf: tm.totals.pf, fr: tm.totals.fr, min: tm.totals.min, possessions_attack: (es.acta.possessions ?? []).filter((q) => q.team === i).length || null, fouls_by_period: tm.fouls, timeouts_by_period: tm.timeouts })));
    for (const p of es.acta.players) { const ti = p.team_index ?? p.team; out.pl.push(line(PL, { row_key: rec.row_key, version: v, block: l.block, purpose: rec.purpose, logical_key: x.lk, player_id: p.id, player_slot_j: p.id.split('-').at(-1), team_index: ti, participation: p.participation, min_tenths: p.min_tenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, tov: p.tov, stl: p.stl, blk: p.blk, blk_rec: p.blk_rec, pf: p.pf, fr: p.fr, pm: p.pm, val: p.val, stints: stintsOf(p.id), energy_final: es.states?.final_energy?.[p.id] })); }
  }
}
writeFileSync(join(R, '05-EJECUCIONES.csv'), out.ex.join('')); writeFileSync(join(R, '06-EQUIPOS-POR-EJECUCION.csv'), out.tm.join('')); writeFileSync(join(R, '07-JUGADORES-POR-EJECUCION.csv'), out.pl.join('')); writeFileSync(join(R, '08-RENDIMIENTO-POR-EJECUCION.csv'), out.pf.join(''));
const mapCols = ['logical_key', 'version', 'block', 'logical_group', 'repetition_r', 'side_h', 'variant_id', 'sporting_seed', 'purpose', 'lot_label', 'batch_id', 'match_id', 'case_id', 'attempt_id', 'attempt_no', 'record_level', 'principal_row_key', 'row_key'];
writeFileSync(join(R, '04-MAPA-CASOS.csv'), `${mapCols.join(',')}\n${rows.map((x) => line(mapCols, x.rec)).join('')}`);
ctx.counts.ejecuciones = rows.length; ctx.counts.porVersionPropositoBloque = {}; for (const x of rows) { const k = `${x.v}|${x.rec.purpose}|${x.l.block}`; ctx.counts.porVersionPropositoBloque[k] = (ctx.counts.porVersionPropositoBloque[k] ?? 0) + 1; }
ctx.counts.noTerminadasOInvalidas = rows.filter((x) => !(x.a.exec_state === 'terminada' && x.a.valid)).map((x) => ({ row_key: x.rec.row_key, exec_state: x.a.exec_state, valid: x.a.valid, reason: x.a.exclusion_reason }));

// ---------------------------------------------------------------------------------------------------------------- comparación mecánica R0/R17 (casos emparejados por clave lógica, solo principales)
const METRICS = { pts: (tm) => tm.points, fg2a: (tm) => tm.totals.fg2a, fg3a: (tm) => tm.totals.fg3a, fga: (tm) => tm.totals.fg2a + tm.totals.fg3a, efg: null, fg2_pct: null, fg3_pct: null, fta: (tm) => tm.totals.fta, reb: (tm) => tm.totals.oreb + tm.totals.dreb, ast: (tm) => tm.totals.ast, tov: (tm) => (tm.totals.tov ?? 0) + (tm.collective?.tov ?? 0), stl: (tm) => tm.totals.stl, blk: (tm) => tm.totals.blk, pf: (tm) => tm.totals.pf };
const perfOf = (es) => es.acta.teams.map((tm) => ({ tm, ps: es.acta.players.filter((p) => (p.team_index ?? p.team) === es.acta.teams.indexOf(tm)) }));
const byKey = { R0: new Map(), R17: new Map() };
for (const x of rows) if (x.rec.purpose === 'principal' && essentials.has(x.rec.row_key)) byKey[x.v].set(x.lk, essentials.get(x.rec.row_key));
const cmpRows = []; const CM = ['block', 'metric', 'unit', 'n_pairs', 'mean_R0', 'mean_R17', 'mean_diff_R17_minus_R0', 'sd_diff', 'se_diff', 'ci95_low', 'ci95_high', 'note'];
const unitOf = { pts: 'puntos por equipo', fg2a: 'intentos', fg3a: 'intentos', fga: 'intentos', efg: 'razón', fg2_pct: 'razón', fg3_pct: 'razón', fta: 'intentos', reb: 'rebotes', ast: 'asistencias', tov: 'pérdidas', stl: 'robos', blk: 'tapones', pf: 'faltas', players_40min: 'jugadores de 40:00 por actuación de equipo (sin prórroga)', max_player_min: 'minutos del jugador con más minutos', dnp_players: 'jugadores sin participar por actuación de equipo', game_tenths: 'décimas de juego' };
const blocks = ['A', 'B', 'C', 'D', 'TODOS'];
for (const b of blocks) {
  const keys = [...byKey.R0.keys()].filter((k) => byKey.R17.has(k) && (b === 'TODOS' || k.startsWith(`${b}|`)));
  for (const [name, f] of Object.entries({ ...METRICS, players_40min: 1, max_player_min: 1, dnp_players: 1, game_tenths: 1 })) {
    const diffs = []; const a0 = []; const a1 = [];
    for (const k of keys) {
      const e0 = byKey.R0.get(k); const e1 = byKey.R17.get(k); const side = (es) => perfOf(es);
      const val = (es) => { const sp = side(es); const noOT = es.result.period_scores.length <= 4;
        if (name === 'players_40min') return noOT ? mean(sp.map(({ ps }) => ps.filter((p) => p.min_tenths >= 24000).length)) : null;
        if (name === 'max_player_min') return noOT ? mean(sp.map(({ ps }) => Math.max(...ps.map((p) => p.min_tenths)) / 600)) : null;
        if (name === 'dnp_players') return noOT ? mean(sp.map(({ ps }) => ps.filter((p) => p.min_tenths === 0).length)) : null;
        if (name === 'game_tenths') return es.result.game_tenths;
        if (name === 'efg') { const m = mean(sp.map(({ tm }) => (tm.totals.fg2m + 1.5 * tm.totals.fg3m) / Math.max(1, tm.totals.fg2a + tm.totals.fg3a))); return m; }
        if (name === 'fg2_pct') return mean(sp.map(({ tm }) => tm.totals.fg2m / Math.max(1, tm.totals.fg2a)));
        if (name === 'fg3_pct') return mean(sp.map(({ tm }) => tm.totals.fg3m / Math.max(1, tm.totals.fg3a)));
        return mean(sp.map(({ tm }) => f(tm))); };
      const v0 = val(e0); const v1 = val(e1); if (v0 == null || v1 == null) continue; a0.push(v0); a1.push(v1); diffs.push(v1 - v0);
    }
    if (!diffs.length) continue; const m = mean(diffs); const s = sd(diffs); const se = s == null ? null : s / Math.sqrt(diffs.length);
    cmpRows.push({ block: b, metric: name, unit: unitOf[name], n_pairs: diffs.length, mean_R0: mean(a0), mean_R17: mean(a1), mean_diff_R17_minus_R0: m, sd_diff: s, se_diff: se, ci95_low: se == null || diffs.length < 20 ? null : m - 1.96 * se, ci95_high: se == null || diffs.length < 20 ? null : m + 1.96 * se, note: diffs.length < 20 ? 'menos de 20 pares: sin intervalo' : 'aproximación normal sobre casos emparejados por clave lógica; las repeticiones técnicas no amplían la muestra' });
  }
}
writeFileSync(join(R, '09-COMPARACION-R0-R17.csv'), `${CM.join(',')}\n${cmpRows.map((r) => line(CM, r)).join('')}`); ctx.counts.comparaciones = cmpRows.length;

// ---------------------------------------------------------------------------------------------------------------- diagnósticos: embudo de pérdidas, cadenas de saque, decisiones de relevo, tiros y ritmo
const FUN = ['version', 'lot_label', 'match_id', 'event_id', 'period', 'route', 'event_type', 'turnover_cause', 'ball', 'turnover_player', 'access_resolved_defender', 'intervention_attempt', 'recoverer', 'steal_credit_to', 'credit_source', 'credit_contact', 'out_of_bounds', 'possession_id'];
const CH = ['version', 'lot_label', 'match_id', 'chain', 'possession', 'period', 'kind', 'origen', 'status', 'cierre', 'receptor', 'opcionUsada', 'negadas', 'clase'];
const DEC = ['version', 'lot_label', 'match_id', 'decision_id', 'area', 'team', 'frontier_clock_s', 'period', 'rule', 'reason', 'state', 'cause', 'out', 'in', 'slot', 'energy_out', 'energy_in', 'utility_out', 'utility_in', 'fouls_out', 'participants_after', 'observations', 'proposal'];
const SH = ['version', 'lot_label', 'match_id', 'event_id', 'period', 'team_instance_id', 'shooter_player_instance_id', 'zone', 'points', 'made', 'valid', 'annulled', 'from_foul', 'blocked_by', 'defender', 'family', 'origin', 'execution', 'quality', 'free_window', 'coverage', 'moved', 'def_org_intended', 'def_org_effective', 'shooter_function', 'procedencia', 'p_conversion', 'p_final', 'selection_L', 'selection_q', 'clock_before', 'clock_after'];
const SUB = ['version', 'lot_label', 'match_id', 'event_id', 'period', 'team', 'origin', 'reason', 'out', 'in', 'slot', 'energy_out', 'energy_in', 'fouls_out', 'off_nominal_position', 'window', 'decision_id'];
const PACE = ['version', 'event_type', 'n', 'total_tenths', 'mean_tenths', 'unit'];
const fun = [FUN.join(',') + '\n']; const chs = [CH.join(',') + '\n']; const decs = [DEC.join(',') + '\n']; const shs = [SH.join(',') + '\n']; const subs = [SUB.join(',') + '\n']; const pace = {}; const sumFun = {}; const sumCh = {};
for (const x of rows.filter((q) => q.rec.purpose === 'diagnostico_completo' && q.a.exec_state === 'terminada')) {
  const base = join(x.dir, 'intentos', x.a.match_id, x.a.attempt_id); const evf = join(base, 'eventos', `eventos-${x.a.match_id}--${x.a.attempt_id}.jsonl`); if (!existsSync(evf)) continue;
  const evs = jl(evf); const label = x.l.label;
  for (const e of evs) {
    const tp = pace[`${x.v}|${e.type}`] ??= { n: 0, t: 0 }; tp.n += 1; tp.t += e.durationTenths ?? 0;
    const tov = (e.stats ?? []).find((s) => s.k === 'tov'); const stl = (e.stats ?? []).find((s) => s.k === 'stl'); const ef = e.effects ?? {};
    if (tov) { const route = e.type === 'loose_ball' ? 'D_balon_suelto' : e.type === 'advance' ? 'B_avance_presionado' : e.intent?.negadas != null ? 'C_envio_forzado_de_saque' : e.type === 'foul' ? 'F_falta' : e.type === 'expiry' ? 'V_violacion_reloj' : 'A_interaccion_organizada';
      const ball = e.type === 'loose_ball' ? 'vivo (balón suelto)' : ef.fuera ? 'muerto (fuera)' : (e.type === 'expiry' || e.type === 'foul' || /falta ofensiva|violacion|infracción|interferencia/.test(tov.cause ?? '')) ? 'muerto (infracción/falta)' : ef.balonVivo ? 'vivo' : 'sin clasificar'; const cadena = ef.cadenaRobo ?? null;
      fun.push(line(FUN, { version: x.v, lot_label: label, match_id: x.a.match_id, event_id: e.event_id, period: e.period, route, event_type: e.type, turnover_cause: tov.cause, ball, turnover_player: tov.p, access_resolved_defender: cadena ? cadena.acceso : (ef.recupera != null || ef.robo != null ? true : null), intervention_attempt: cadena ? cadena.intento : null, recoverer: ef.recupera ?? ef.robo ?? null, steal_credit_to: stl?.p ?? null, credit_source: stl?.fuente ?? (stl ? 'interceptación o arrebato con control (cadena de robo)' : null), credit_contact: stl?.contacto ?? null, out_of_bounds: !!ef.fuera, possession_id: e.possession_id }));
      const k = `${x.v}|${route}|${ball}|${stl ? 'con crédito' : 'sin crédito'}`; sumFun[k] = (sumFun[k] ?? 0) + 1; }
    if (e.type === 'substitution') subs.push(line(SUB, { version: x.v, lot_label: label, match_id: x.a.match_id, event_id: e.event_id, period: e.period, team: e.team, origin: e.intent?.origen, reason: e.intent?.motivo, out: e.participants?.sale, in: e.participants?.entra, slot: e.participants?.posicion, energy_out: e.effects?.energiaSale, energy_in: e.effects?.energiaEntra, fouls_out: e.effects?.foulsSale, off_nominal_position: e.effects?.fueraDePosicionNominal, window: e.effects?.ventana, decision_id: e.intent?.decision }));
  }
  const decf = join(base, 'decisiones', `decisiones-${x.a.match_id}--${x.a.attempt_id}.jsonl`);
  if (existsSync(decf)) for (const d of jl(decf)) {
    if (d.record_type === 'cadena_saque') { const clase = d.status === 'interrumpida' ? 'interrumpida_fin_periodo' : d.status === 'cerrada' && d.receptor ? 'ejecutada' : d.status === 'cerrada' ? (/infracción del plazo|falta en el saque|pérdida en el saque|desvío/.test(d.cierre ?? '') ? 'sin_entrega_valida' : 'cerrada_sin_receptor_sin_causa') : 'abierta (sin cierre)'; chs.push(line(CH, { version: x.v, lot_label: label, match_id: x.a.match_id, chain: d.id, possession: d.possession, period: d.period, kind: d.kind, origen: d.origen, status: d.status, cierre: d.cierre, receptor: d.receptor, opcionUsada: d.opcionUsada, negadas: (d.intentos ?? []).filter((q) => q.negada).length, clase })); const k = `${x.v}|${clase}`; sumCh[k] = (sumCh[k] ?? 0) + 1; }
    if (d.record_type === 'entrenador' && ['rotation', 'fouls', 'endgame'].includes(d.area)) { const pr = d.propuesta ?? {}; decs.push(line(DEC, { version: x.v, lot_label: label, match_id: x.a.match_id, decision_id: d.id, area: d.area, team: d.equipo, frontier_clock_s: d.frontera?.reloj, period: d.frontera?.periodo, rule: d.regla, reason: d.motivo, state: d.estado, cause: d.causa, out: pr.sale ?? pr.jugador ?? null, in: pr.entra ?? null, slot: pr.posicion ?? null, energy_out: d.observaciones?.energia?.saliente ?? null, energy_in: d.observaciones?.energia?.entrante ?? null, utility_out: d.utilidad?.saliente ?? null, utility_in: d.utilidad?.entrante ?? null, fouls_out: d.observaciones?.faltas ?? null, participants_after: d.participantes?.despues ?? null, observations: d.observaciones, proposal: pr.tipo ?? pr.reason ?? null })); }
  }
  const tf = join(base, 'tablas', 'tiros.csv.part'); // las partes de tabla no llevan cabecera: el orden de columnas es el de TABLES.tiros (schema.js)
  if (existsSync(tf)) { const names = TABLES.tiros.cols.map((q) => q.name); for (const ln of readFileSync(tf, 'utf8').trim().split('\n')) { const c = csvSplit(ln); if (c.length !== names.length) continue; const o = Object.fromEntries(names.map((nm, k) => [nm, c[k]])); shs.push(line(SH, { version: x.v, lot_label: label, match_id: x.a.match_id, ...o })); } }
}
writeFileSync(join(R, '10-EMBUDO-PERDIDAS-ROBOS.csv'), fun.join('')); writeFileSync(join(R, '11-CIERRES-DE-SAQUE.csv'), chs.join('')); writeFileSync(join(R, '12-DECISIONES-DE-RELEVO-DIAGNOSTICAS.csv'), decs.join('')); writeFileSync(join(R, '13-SUSTITUCIONES-DIAGNOSTICAS.csv'), subs.join('')); writeFileSync(join(R, '14-TIROS-DIAGNOSTICOS.csv'), shs.join(''));
writeFileSync(join(R, '15-RITMO-POR-TIPO-DE-HECHO.csv'), `${PACE.join(',')}\n${Object.entries(pace).sort().map(([k, o]) => { const [v, t] = k.split('|'); return line(PACE, { version: v, event_type: t, n: o.n, total_tenths: o.t, mean_tenths: o.n ? o.t / o.n : null, unit: 'décimas de segundo de juego (reloj consumido por hecho)' }); }).join('')}`);
ctx.counts.embudo = sumFun; ctx.counts.cadenas = sumCh; ctx.counts.tablas = { embudo: fun.length - 1, cadenas: chs.length - 1, decisiones_relevo: decs.length - 1, sustituciones: subs.length - 1, tiros: shs.length - 1 };

// ---------------------------------------------------------------------------------------------------------------- rotación por jugador (sin convertir las frecuencias en cuotas)
const ROT = ['version', 'block', 'player_slot_j', 'team_player_performances', 'dnp', 'dnp_share', 'full_regulation_40min', 'full_regulation_share', 'mean_minutes', 'median_minutes', 'max_minutes', 'mean_stints', 'note'];
const rotAgg = {}; const rl = readFileSync(join(R, '07-JUGADORES-POR-EJECUCION.csv'), 'utf8').trim().split('\n'); const rh = rl[0].split(',');
const parse = (ln) => { const o = {}; const c = []; let cur = ''; let q = false; for (const ch of ln) { if (ch === '"') q = !q; else if (ch === ',' && !q) { c.push(cur); cur = ''; } else cur += ch; } c.push(cur); rh.forEach((h, i) => { o[h] = c[i]; }); return o; };
const isOT = new Map(rows.map((x) => [x.rec.row_key, (x.rec.overtime_periods ?? 0) > 0])); for (const ln of rl.slice(1)) { const o = parse(ln); if (isOT.get(o.row_key)) continue; for (const bk of [o.block, 'TODOS']) { const k = `${o.version}|${bk}|${o.player_slot_j}`; const a = (rotAgg[k] ??= { n: 0, dnp: 0, full: 0, mins: [], stints: [] }); const mt = Number(o.min_tenths); a.n += 1; if (mt === 0) a.dnp += 1; if (mt >= 24000) a.full += 1; a.mins.push(mt / 600); a.stints.push(Number(o.stints)); } }
const med = (x) => { const s = [...x].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
writeFileSync(join(R, '16-ROTACION-POR-JUGADOR.csv'), `${ROT.join(',')}\n${Object.entries(rotAgg).sort().map(([k, a]) => { const [v, b, j] = k.split('|'); return line(ROT, { version: v, block: b, player_slot_j: j, team_player_performances: a.n, dnp: a.dnp, dnp_share: a.dnp / a.n, full_regulation_40min: a.full, full_regulation_share: a.full / a.n, mean_minutes: mean(a.mins), median_minutes: med(a.mins), max_minutes: Math.max(...a.mins), mean_stints: mean(a.stints), note: 'actuaciones sin prórroga; frecuencia observada, no una cuota del motor' }); }).join('')}`);
// consistencia diagnóstico ↔ principal (mismo deporte con otro nivel de registro)
const diagVsMain = []; for (const x of rows.filter((q) => q.rec.purpose === 'diagnostico_completo' && q.rec.principal_row_key)) { const m = rows.find((q) => q.rec.row_key === x.rec.principal_row_key); diagVsMain.push({ row_key: x.rec.row_key, same_score: m.rec.score_home === x.rec.score_home && m.rec.score_away === x.rec.score_away, same_draws: m.rec.sporting_draws === x.rec.sporting_draws, same_events: m.rec.events === x.rec.events }); }
ctx.counts.diagnosticoVsPrincipal = { comparados: diagVsMain.length, mismoMarcador: diagVsMain.filter((q) => q.same_score).length, mismosSorteos: diagVsMain.filter((q) => q.same_draws).length, mismosHechos: diagVsMain.filter((q) => q.same_events).length, sinEnlace: rows.filter((q) => q.rec.purpose !== 'principal' && !q.rec.principal_row_key).length };
writeFileSync(join(R, 'resumen-tablas.json'), JSON.stringify({ generated_by: 'node scripts/m17-tables.js', ...ctx }, null, 1));
console.log(JSON.stringify({ ejecuciones: rows.length, comparaciones: cmpRows.length, tablas: ctx.counts.tablas, diagnosticoVsPrincipal: ctx.counts.diagnosticoVsPrincipal, anomalias: ctx.counts.noTerminadasOInvalidas.length }));
