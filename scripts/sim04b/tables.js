// SIM-MOTOR-04B · tablas de datos de la campaña (fork de sim04 con las tablas de contexto×zona×calidad, embudo de pase final y motivos de relevo) (§14; adaptado de SIM-MOTOR-03 §10, con el lector de zonas reparado C04-02): se derivan MECÁNICAMENTE de los registros conservados (JSONL) sin volver a simular. Conservan los contadores brutos aunque calculen porcentajes; lo no conservado
// es `null` con su causa en el diccionario (nunca un cero). Controles SIM, posesiones beM y finalizaciones SIM son universos distintos y no se mezclan en una tasa única.
import { readFileSync, existsSync } from 'node:fs';
import { decodeZone } from '../../src/sim/essential.js';

export const readJsonl = (p) => (existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000); const r2 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 100) / 100);
const div = (a, b) => (b > 0 ? a / b : null);
const ZONES = ['rim', 'inside', 'midrange', 'three']; const BANDS = [['<60', 0, 59], ['60-69', 60, 69], ['70-79', 70, 79], ['80-89', 80, 89], ['90-99', 90, 99], ['100-109', 100, 109], ['>=110', 110, 1e9]];
export const bandOf = (pts) => BANDS.find(([, lo, hi]) => pts >= lo && pts <= hi)[0];
export const BAND_NAMES = BANDS.map((b) => b[0]);

// ---------------------------------------------------------------------------------------------------------------------------------- lectura uniforme de un registro (SIM o detallado) por equipo
// Devuelve { teams:[team0, team1], players:[...], periods:[[a,b]…], score:[a,b], durationS, overtimes } con campos comunes y nulos tipados.
// C04-02: el esencial SIM conserva cada zona de jugador como `[intentos, aciertos, q_cómoda, q_normal, q_forzada]`; el lector común acepta también el objeto `{a, m, q}`. Un formato desconocido se OMITE (no se convierte en cero).
const zonesOfCompact = (zones) => Object.fromEntries(Object.entries(zones ?? {}).map(([z, v]) => [z, decodeZone(v)]).filter(([, v]) => v));
// C04-02 (FIBA Statisticians' Manual 2024, §2.1): una canasta con falta cuenta como intento y acierto de campo; el tiro FALLADO con falta de tiro no es un intento; un tiro anulado no cuenta (misma regla que el acta del detallado: `foulMiss`).
export const isFieldAttempt = (fromFoul, made, annulled) => !annulled && !(fromFoul && !made);
function simView(rec) {
  const e = rec.essential; const ids = e.identity.teams.map((t) => t.id); const T = e.box.teams; const D = e.familyDenominators; const fin = e.score.final;
  const players = e.box.players.map((p) => ({ id: p.id, team: p.team, starter: p.starter ? 1 : 0, participation: p.sec > 0 ? 'jugó' : 'sin_minutos', sec: p.sec, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, astFg: p.astC, astFt: p.astL, tov: p.tov, stl: p.stl, blk: p.blk, blkAgainst: p.blkAgainst, pf: p.pf, pfd: p.pfd, pm: p.pm, zones: zonesOfCompact(p.zones) }));
  const fins = rec.analysis?.playerFinalizations ?? null; const onC = {}; const onOpp = {};
  for (const s of rec.segments ?? []) for (const k of [0, 1]) for (const id of s.lineups?.[k] ?? []) { onC[id] = (onC[id] ?? 0) + s.controls[k]; onOpp[id] = (onOpp[id] ?? 0) + s.controls[1 - k]; }
  for (const p of players) { p.finalizationsSim = fins ? (fins[p.id] ?? 0) : null; p.controlsOn = onC[p.id] ?? 0; p.controlsAgainstOn = onOpp[p.id] ?? 0; }
  const teams = [0, 1].map((k) => { const t = T[k]; return { id: ids[k], pts: t.pts, fg2m: t.fg2m, fg2a: t.fg2a, fg3m: t.fg3m, fg3a: t.fg3a, ftm: t.ftm, fta: t.fta, fgPts: t.fgPts, ftPts: t.ftPts, orebInd: t.oreb, drebInd: t.dreb, orebColl: t.teamReb[0], drebColl: t.teamReb[1], astFg: t.astC, astFt: t.astL, tovInd: t.tov, tovColl: t.teamTov, stl: t.stl, blk: t.blk, blkAgainst: t.blkAgainst, pf: t.pf, pfd: t.pfd, controlsSim: D[k].controls, finalizationsSim: D[k].finalizations, possessionsBeM: null, bonusFta: D[k].bonusFta, bonusFtm: D[k].bonusFtm, shootFouls: D[k].sf, and1: D[k].and1 }; });
  return { ids, teams, players, periods: e.score.periods, score: fin, durationS: e.durationSeconds, overtimes: e.score.overtimes };
}
function detView(rec) {
  const e = rec.essential; const ids = e.identity.teams.map((t) => t.id); const fin = e.result.court_score; const A = e.acta;
  const players = A.players.filter((p) => p.min_tenths > 0 || p.participation !== 'indisponible').map((p) => ({ id: p.id, team: p.team_index ?? p.team, starter: p.participation === 'titular' ? 1 : 0, participation: p.participation, sec: p.min_tenths / 10, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, astFg: p.ast_fg, astFt: p.ast_ft, tov: p.tov, stl: p.stl, blk: p.blk, blkAgainst: p.blk_rec, pf: p.pf, pfd: p.fr, pm: p.pm, finalizationsSim: null, controlsOn: null, controlsAgainstOn: null, zones: {} }));
  const cols = e.shots.columns; const ci = (n) => cols.indexOf(n); const byPlayerZone = {};
  for (const row of e.shots.rows) { if (!isFieldAttempt(row[ci('from_foul')], row[ci('made')], row[ci('annulled')])) continue; const pid = row[ci('shooter')]; const z = row[ci('zone')]; const x = ((byPlayerZone[pid] ??= {})[z] ??= { a: 0, m: 0, q: [0, 0, 0] }); x.a += 1; const q = row[ci('quality')]; x.q[q === 'comfortable' ? 0 : q === 'normal' ? 1 : 2] += 1; if (row[ci('made')]) x.m += 1; }
  for (const p of players) p.zones = Object.fromEntries(Object.entries(byPlayerZone[p.id] ?? {}).map(([z, v]) => [z, { a: v.a, m: v.m, q: v.q }]));
  const poss = [0, 0]; for (const p of A.possessions) poss[p.team] += 1;
  const teams = [0, 1].map((k) => { const t = A.teams[k]; const tt = t.totals; const c = t.collective ?? {}; return { id: ids[k], pts: tt.pts, fg2m: tt.fg2m, fg2a: tt.fg2a, fg3m: tt.fg3m, fg3a: tt.fg3a, ftm: tt.ftm, fta: tt.fta, fgPts: null, ftPts: null, orebInd: tt.oreb - (c.rebOff ?? 0), drebInd: tt.dreb - (c.rebDef ?? 0), orebColl: c.rebOff ?? 0, drebColl: c.rebDef ?? 0, astFg: tt.astFg, astFt: tt.astFt, tovInd: tt.tov - (c.tov ?? 0), tovColl: c.tov ?? 0, stl: tt.stl, blk: tt.blk, blkAgainst: tt.blkRec, pf: tt.pf, pfd: tt.fr, controlsSim: null, finalizationsSim: null, possessionsBeM: poss[k], bonusFta: null, bonusFtm: null, shootFouls: null, and1: null }; });
  return { ids, teams, players, periods: e.acta.periods.map((p) => p.points), score: fin, durationS: e.result.game_tenths / 10, overtimes: Math.max(0, e.acta.periods.length - 4) };
}
const viewOf = (rec) => (rec.resolver === 'sim' ? simView(rec) : detView(rec));

// ---------------------------------------------------------------------------------------------------------------------------------- derivados de equipo
function derive(t, opp) {
  const fgm = t.fg2m + t.fg3m; const fga = t.fg2a + t.fg3a;
  return { fgm, fga, orebTot: t.orebInd + t.orebColl, drebTot: t.drebInd + t.drebColl, astTot: t.astFg + t.astFt, tovTot: t.tovInd + t.tovColl, fgPct: r3(div(fgm, fga)), fg3Pct: r3(div(t.fg3m, t.fg3a)), ftPct: r3(div(t.ftm, t.fta)), tsPct: r3(div(t.pts, 2 * (fga + 0.44 * t.fta))), efgPct: r3(div(fgm + 0.5 * t.fg3m, fga)), ftRate: r3(div(t.fta, fga)), threeShare: r3(div(t.fg3a, fga)),
    ptsPerControlSim: r3(div(t.pts, t.controlsSim)), ptsPerFinalizationSim: r3(div(t.pts, t.finalizationsSim)), ptsPerPossessionBeM: r3(div(t.pts, t.possessionsBeM)), tovPer100ControlsSim: r2(t.controlsSim ? (100 * (t.tovInd + t.tovColl)) / t.controlsSim : null), tovPer100PossessionsBeM: r2(t.possessionsBeM ? (100 * (t.tovInd + t.tovColl)) / t.possessionsBeM : null),
    orebPctOwn: r3(div(t.orebInd + t.orebColl, (t.orebInd + t.orebColl) + (opp.drebInd + opp.drebColl))) };
}
function usage(players, k) {
  const ps = players.filter((p) => p.team === k); const played = ps.filter((p) => p.sec > 0); const mins = played.map((p) => p.sec).sort((a, b) => b - a); const totMin = mins.reduce((a, b) => a + b, 0);
  const fga = ps.map((p) => p.fg2a + p.fg3a); const tf = fga.reduce((a, b) => a + b, 0); const pts = ps.map((p) => p.pts); const tp = pts.reduce((a, b) => a + b, 0); const mx = (a) => (a.length ? Math.max(...a) : 0);
  const hhi = (a, tot) => (tot > 0 ? a.reduce((s, x) => s + (x / tot) ** 2, 0) : null);
  return { playersUsed: played.length, maxMinutes: r2(mins[0] / 60), top3MinutesShare: r3(div(mins.slice(0, 3).reduce((a, b) => a + b, 0), totMin)), top1FgaShare: r3(div(mx(fga), tf)), top1PtsShare: r3(div(mx(pts), tp)), hhiFga: r3(hhi(fga, tf)), hhiMinutes: r3(hhi(mins, totMin)), exclusions: ps.filter((p) => p.pf >= 5).length, starters: ps.filter((p) => p.starter).length };
}

// ---------------------------------------------------------------------------------------------------------------------------------- tablas
export const COLS = {
  team: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'seed', 'team_index', 'team_id', 'opponent_id', 'is_test_team', 'status', 'valid', 'error',
    'pts', 'opp_pts', 'diff', 'win', 'p1', 'p2', 'p3', 'p4', 'ot_pts', 'periods', 'overtimes', 'duration_s',
    'controls_sim', 'finalizations_sim', 'possessions_beM',
    'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'fgm', 'fga', 'fg_pts', 'ft_pts', 'oreb_ind', 'dreb_ind', 'oreb_coll', 'dreb_coll', 'oreb_total', 'dreb_total', 'ast_fg', 'ast_ft', 'ast_total', 'tov_ind', 'tov_coll', 'tov_total', 'stl', 'blk', 'blk_against', 'pf', 'pfd', 'exclusions',
    'bonus_fta', 'bonus_ftm', 'shoot_fouls', 'and1',
    'fg_pct', 'fg3_pct', 'ft_pct', 'ts_pct', 'efg_pct', 'ft_rate', 'three_share', 'pts_per_control_sim', 'pts_per_finalization_sim', 'pts_per_possession_beM', 'tov_per100_controls_sim', 'tov_per100_possessions_beM', 'oreb_pct_own',
    'players_used', 'max_minutes', 'top3_minutes_share', 'top1_fga_share', 'top1_pts_share', 'hhi_fga', 'hhi_minutes', 'starters',
    'rim_a', 'rim_m', 'inside_a', 'inside_m', 'midrange_a', 'midrange_m', 'three_a', 'three_m', 'energy_start_mean', 'energy_end_mean', 'form_start_mean', 'decisions', 'applied_orders', 'band',
    'ast_den_elig_fin', 'ast_den_delivered', 'ast_den_elig_baskets', 'ast_den_fg_assists', 'ast_den_elig_ft_series', 'ast_den_ft_assists', 'press_opps', 'press_explicit_opps', 'press_sum_delta', 'max_player_pts', 'players_40min', 'scr_recorded_fin'],
  player: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'team_id', 'player_id', 'starter', 'participation', 'minutes', 'seconds', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'ast_fg', 'ast_ft', 'tov', 'stl', 'blk', 'blk_against', 'pf', 'pfd', 'pm', 'finalizations_sim', 'closing_share', 'controls_on', 'controls_against_on', 'pts_per100_controls_sim', 'energy_start', 'energy_end', 'form_start'],
  zone: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'team_id', 'player_id', 'zone', 'attempts', 'makes', 'q_comfortable', 'q_normal', 'q_forced'],
  family: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'team_id', 'family_or_play', 'fga', 'fgm', 'pts', 'fta', 'ftm', 'finalizations_sim', 'shoot_fouls', 'and1', 'assists', 'moved', 'q_comfortable', 'q_normal', 'q_forced'],
  quintet: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'team_id', 'quintet', 'seconds', 'minutes', 'pf', 'pa', 'controls_for_sim', 'controls_against_sim', 'possessions_beM', 'off_prod_per100', 'conceded_prod_per100', 'balance_per100', 'diff_per100_own_controls', 'intervals'],
  defense: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'defender_index', 'defender_id', 'organization', 'coverage', 'pressure_height', 'seconds', 'opp_pts', 'opp_bonus_pts', 'opp_finalizations_sim', 'opp_bonus_series', 'opp_pts_per_finalization_sim'],
  period: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'period', 'team0_pts', 'team1_pts', 'cum0', 'cum1'],
  decision: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'at_s', 'effective_at_s', 'type', 'control', 'from', 'to', 'reason', 'source', 'sample_json'],
  director: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'team_id', 'director_id', 'start_s', 'end_s'],
  // 04B §7.5: contexto × zona × calidad (intentos de campo y aciertos; asistidos = canastas con pasador; el fallo con falta de tiro no es intento y se cuenta aparte), embudo de pase final por clase y motivos de relevo.
  czq: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'context', 'zone', 'quality', 'attempts', 'makes', 'assisted_makes', 'foul_miss_no_attempt', 'note'],
  funnel: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'class', 'opportunities', 'eligible', 'delivered', 'eligible_baskets', 'fg_assists', 'eligible_ft_series', 'ft_assists', 'note'],
  subs: ['case_id', 'block', 'scenario', 'variant', 'orientation', 'replicate', 'resolver', 'identity', 'team_index', 'slot_reason', 'substitutions', 'note'],
};
const key = (rec) => [rec.case_id, rec.block, rec.scenario, rec.variant, rec.orientation, rec.replicate, rec.resolver, rec.run ?? null];

// Columnas añadidas por SIM-MOTOR-04: denominadores de asistencia por equipo (suma de contextos), presión adelantada, extremo individual y actuaciones de 40 minutos o más; `null` = no conservado (R0/detallado), nunca cero.
function extraTeam(rec, v, k) {
  const e = rec.essential; const ad = rec.resolver === 'sim' ? e.assistDenominators?.[k] : null; const po = rec.resolver === 'sim' ? e.pressOps : null; const ps = v.players.filter((p) => p.team === k);
  const sumAd = (f) => (ad ? Object.values(ad).reduce((a, c) => a + c[f], 0) : null); const maxPts = ps.length ? Math.max(...ps.map((p) => p.pts)) : null; const f40 = ps.filter((p) => p.sec >= 2400 - 0.0005).length;
  const scr = rec.resolver === 'sim' && rec.analysis?.participation?.[k] ? Object.values(rec.analysis.participation[k]).reduce((a, pl) => a + Object.values(pl.screeners ?? {}).reduce((x, n) => x + n, 0), 0) : null;
  return [sumAd('eligible'), sumAd('delivered'), sumAd('eligibleBaskets'), sumAd('fgAssists'), sumAd('eligibleFtSeries'), sumAd('ftAssists'), po ? po.opportunities[k] : null, po ? po.explicitOpportunities[k] : null, po ? po.sumDelta[k] : null, maxPts, f40, scr];
}
export function buildTables(simRecs, detRecs) {
  const T = Object.fromEntries(Object.keys(COLS).map((k) => [k, []])); const perMatch = [];
  for (const rec of [...simRecs, ...detRecs]) {
    const base = key(rec);
    if (rec.status !== 'finished' || !rec.essential) { for (const k of [0, 1]) T.team.push([...base, rec.seed, k, rec.identity?.teams?.[k] ?? null, rec.identity?.teams?.[1 - k] ?? null, null, rec.status, rec.valid ? 1 : 0, rec.error ?? null, ...Array(COLS.team.length - 16).fill(null)]); perMatch.push({ rec, view: null }); continue; }
    const v = viewOf(rec); perMatch.push({ rec, view: v });
    const testTeam = rec.testTeam ?? null; const st = rec.states ?? null; const mean = (a) => (a && a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
    for (const k of [0, 1]) {
      const t = v.teams[k]; const o = v.teams[1 - k]; const d = derive(t, o); const u = usage(v.players, k); const per = v.periods.map((p) => p[k]); const total = v.score[k]; const zs = Object.fromEntries(ZONES.map((z) => [z, [0, 0]]));
      for (const p of v.players) if (p.team === k) for (const [z, x] of Object.entries(p.zones)) if (zs[z]) { zs[z][0] += x.a; zs[z][1] += x.m; }
      const ds = (rec.decisions ?? []).filter((x) => x.team === k).length; const oa = (rec.analysis?.orders && Array.isArray(rec.analysis.orders)) ? rec.analysis.orders.filter((x) => x.team === k).length : null;
      T.team.push([...base, rec.seed, k, t.id, o.id, testTeam == null ? null : (t.id === testTeam ? 1 : 0), rec.status, rec.valid ? 1 : 0, rec.error ?? null,
        total, v.score[1 - k], total - v.score[1 - k], total > v.score[1 - k] ? 1 : 0, per[0] ?? null, per[1] ?? null, per[2] ?? null, per[3] ?? null, per.slice(4).reduce((a, b) => a + b, 0), per.length, v.overtimes, r1(v.durationS),
        t.controlsSim, t.finalizationsSim, t.possessionsBeM,
        t.fg2m, t.fg2a, t.fg3m, t.fg3a, t.ftm, t.fta, d.fgm, d.fga, t.fgPts, t.ftPts, t.orebInd, t.drebInd, t.orebColl, t.drebColl, d.orebTot, d.drebTot, t.astFg, t.astFt, d.astTot, t.tovInd, t.tovColl, d.tovTot, t.stl, t.blk, t.blkAgainst, t.pf, t.pfd, u.exclusions,
        t.bonusFta, t.bonusFtm, t.shootFouls, t.and1,
        d.fgPct, d.fg3Pct, d.ftPct, d.tsPct, d.efgPct, d.ftRate, d.threeShare, d.ptsPerControlSim, d.ptsPerFinalizationSim, d.ptsPerPossessionBeM, d.tovPer100ControlsSim, d.tovPer100PossessionsBeM, d.orebPctOwn,
        u.playersUsed, u.maxMinutes, u.top3MinutesShare, u.top1FgaShare, u.top1PtsShare, u.hhiFga, u.hhiMinutes, u.starters,
        zs.rim[0], zs.rim[1], zs.inside[0], zs.inside[1], zs.midrange[0], zs.midrange[1], zs.three[0], zs.three[1],
        r2(mean(st?.start?.[k]?.map((p) => p.energy))), r2(mean(st?.end?.[k]?.map((p) => p.energy))), r2(mean(st?.start?.[k]?.map((p) => p.form))), rec.resolver === 'sim' ? ds : null, oa, bandOf(total), ...extraTeam(rec, v, k)]);
    }
    // jugadores
    const stS = rec.states; const e0 = (k, id) => stS?.start?.[k]?.find((p) => p.id === id); const e1 = (k, id) => stS?.end?.[k]?.find((p) => p.id === id);
    const tdet = rec.resolver === 'detailed' ? rec.essential.states?.final_energy : null;
    for (const p of v.players) { const tfin = v.teams[p.team].finalizationsSim;
      T.player.push([...base, p.team, v.ids[p.team], p.id, p.starter, p.participation, r2(p.sec / 60), r3(p.sec), p.pts, p.fg2m, p.fg2a, p.fg3m, p.fg3a, p.ftm, p.fta, p.oreb, p.dreb, p.astFg, p.astFt, p.tov, p.stl, p.blk, p.blkAgainst, p.pf, p.pfd, p.pm, p.finalizationsSim, p.finalizationsSim != null ? r3(div(p.finalizationsSim, tfin)) : null, p.controlsOn, p.controlsAgainstOn, p.controlsOn > 0 ? r2((100 * p.pts) / p.controlsOn) : (p.controlsOn === null ? null : null), e0(p.team, p.id)?.energy ?? null, e1(p.team, p.id)?.energy ?? (tdet?.[p.id] ?? null), e0(p.team, p.id)?.form ?? null]);
      for (const [z, x] of Object.entries(p.zones)) T.zone.push([...base, p.team, v.ids[p.team], p.id, z, x.a, x.m, x.q?.[0] ?? null, x.q?.[1] ?? null, x.q?.[2] ?? null]); }
    // familias / fichas
    if (rec.resolver === 'sim') for (const k of [0, 1]) for (const f of rec.essential.families[k]) T.family.push([...base, k, v.ids[k], f.key, f.fga, f.fgm, f.pts, f.fta, f.ftm, f.fin, f.sf, f.and1, f.ast, f.moved, f.q[0], f.q[1], f.q[2]]);
    else { const cols = rec.essential.shots.columns; const ci = (n) => cols.indexOf(n); const acc = {}; for (const row of rec.essential.shots.rows) { if (!isFieldAttempt(row[ci('from_foul')], row[ci('made')], row[ci('annulled')])) continue; const k = row[ci('team')]; const fam = row[ci('origin')] ?? row[ci('family')] ?? 'sin_ficha'; const x = (acc[`${k}|${fam}`] ??= { k, fam, fga: 0, fgm: 0, pts: 0, q: [0, 0, 0], moved: 0 }); x.fga += 1; if (row[ci('made')]) { x.fgm += 1; x.pts += row[ci('points')]; } const q = row[ci('quality')]; x.q[q === 'comfortable' ? 0 : q === 'normal' ? 1 : 2] += 1; if (row[ci('moved')]) x.moved += 1; }
      for (const x of Object.values(acc)) T.family.push([...base, x.k, v.ids[x.k], x.fam, x.fga, x.fgm, x.pts, null, null, null, null, null, null, x.moved, x.q[0], x.q[1], x.q[2]]); }
    // quintetos
    if (rec.resolver === 'sim') for (const q of rec.quintets ?? []) { const off = div(q.pf * 100, q.ctlFor); const con = div(q.pa * 100, q.ctlAgainst); T.quintet.push([...base, q.team, v.ids[q.team], q.ids.join('|'), q.sec, r2(q.sec / 60), q.pf, q.pa, q.ctlFor, q.ctlAgainst, null, r2(off), r2(con), off != null && con != null ? r2(off - con) : null, q.ctlFor > 0 ? r2((100 * (q.pf - q.pa)) / q.ctlFor) : null, JSON.stringify(q.intervals)]);
    } else { const e = rec.essential; const map = Object.fromEntries(e.presence.lineups.map((l) => [l.id, l])); const acc = {}; const rows = e.sequence.rows; let prevH = 0; let prevA = 0; const possSeen = new Set();
      for (const r of rows) { const [, , type, , team, poss, , , , dur, lh, la, sh, sa] = r; const dH = (sh ?? prevH) - prevH; const dA = (sa ?? prevA) - prevA; prevH = sh ?? prevH; prevA = sa ?? prevA; for (const [k, lid, own, opp] of [[0, lh, dH, dA], [1, la, dA, dH]]) { if (!lid || !map[lid]) continue; const qk = `${k}|${map[lid].key}`; const x = (acc[qk] ??= { k, key: map[lid].key, ten: 0, pf: 0, pa: 0, pos: 0 }); x.ten += dur ?? 0; x.pf += own; x.pa += opp; if (poss && team === k && !possSeen.has(`${k}|${poss}`)) { possSeen.add(`${k}|${poss}`); x.pos += 1; } } void type; }
      for (const x of Object.values(acc)) T.quintet.push([...base, x.k, v.ids[x.k], x.key.split('|').sort().join('|'), x.ten / 10, r2(x.ten / 600), x.pf, x.pa, null, null, x.pos, null, null, null, null, null]); }
    // defensa efectiva
    if (rec.resolver === 'sim' && rec.analysis?.defense) for (const k of [0, 1]) for (const r of rec.analysis.defense[k]) T.defense.push([...base, k, v.ids[k], r.org, r.coverage, r.pressureHeight, r.sec, r.oppPts, r.oppBonusPts, r.oppFinalizations, r.oppBonusSeries, typeof r.oppPtsPerFinalizationSim === 'number' ? r.oppPtsPerFinalizationSim : null]);
    // 04B: contexto × zona × calidad, embudo de pase final y motivos de relevo
    if (rec.resolver === 'sim') {
      const dz = rec.diag04b;
      if (!dz) { T.czq.push([...base, null, null, null, null, null, null, null, null, 'no_conservado: identidad anterior a 04B (sin tabla de contexto)']); T.subs.push([...base, null, null, null, 'no_conservado: identidad anterior a 04B (sin motivos de relevo)']); }
      else {
        const fm = dz.foulMiss ?? {}; const seen = new Set();
        for (const [kk, x] of Object.entries(dz.czq)) { const [tm, cx, zn, q] = kk.split('|'); seen.add(`${tm}|${cx}|${zn}`); T.czq.push([...base, Number(tm), cx, zn, Number(q), x[0], x[1], x[2], null, null]); }
        for (const [kk, n] of Object.entries(fm)) T.czq.push([...base, Number(kk.split('|')[0]), kk.split('|')[1], kk.split('|')[2], null, 0, 0, 0, n, 'fallo con falta de tiro: no es intento de campo']);
        const by = {}; for (const sb of dz.subs) { const [, tm, why] = sb; for (const w of (why ? why.split('|') : ['sin_motivo'])) { const k2 = `${tm}|${w}`; by[k2] = (by[k2] ?? 0) + 1; } }
        for (const [kk, n] of Object.entries(by)) T.subs.push([...base, Number(kk.split('|')[0]), kk.split('|').slice(1).join('|'), n, null]);
      }
      const fun = rec.essential.assistFunnel; if (!fun) T.funnel.push([...base, null, null, null, null, null, null, null, null, null, 'no_conservado: identidad anterior a 04B (sin embudo por clase)']);
      else for (const k of [0, 1]) for (const [cls, x] of Object.entries(fun[k])) T.funnel.push([...base, k, cls, x.opportunities, x.eligible, x.delivered, x.eligibleBaskets, x.fgAssists, x.eligibleFtSeries, x.ftAssists, null]);
    } else {
      const cols = rec.essential.shots.columns; const ix = (n) => cols.indexOf(n); const CTX = { organizado: 'organized', 'transición': 'transition', temprano: 'transition', saque: 'inbound', continuidad: 'continuation' }; const QN = ['comfortable', 'normal', 'forced']; const acc = {};
      for (const row of rec.essential.shots.rows) { const k = row[ix('team')]; const cx = CTX[row[ix('context')]] ?? row[ix('context')]; const fromFoul = row[ix('from_foul')]; const made = row[ix('made')]; if (row[ix('annulled')]) continue; if (fromFoul && !made) { const kk = `${k}|${cx}|${row[ix('zone')]}|F`; acc[kk] = (acc[kk] ?? 0) + 1; continue; } const kk = `${k}|${cx}|${row[ix('zone')]}|${QN.indexOf(row[ix('quality')])}`; const x = (acc[kk] ??= [0, 0, 0]); x[0]++; if (made) { x[1]++; if (row[ix('passer')] != null) x[2]++; } }
      for (const [kk, x] of Object.entries(acc)) { const [tm, cx, zn, q] = kk.split('|'); if (q === 'F') T.czq.push([...base, Number(tm), cx, zn, null, 0, 0, 0, x, 'fallo con falta de tiro: no es intento de campo']); else T.czq.push([...base, Number(tm), cx, zn, Number(q), x[0], x[1], x[2], null, 'contexto del detallado traducido: organizado→organized, transición/temprano→transition, saque→inbound, continuidad→continuation']); }
    }
    // periodos acumulados
    let c0 = 0; let c1 = 0; v.periods.forEach((p, i) => { c0 += p[0]; c1 += p[1]; T.period.push([...base, i + 1, p[0], p[1], c0, c1]); });
    // decisiones y órdenes (SIM: política del entrenador y comandos; detallado: órdenes automáticas del registro de dirección)
    if (rec.resolver === 'sim') { for (const d of rec.decisions ?? []) T.decision.push([...base, d.team, d.at, d.effectiveAt, 'coach-policy', d.dim, d.from, d.to, d.reason, d.source, JSON.stringify(d.sample)]); for (const c of rec.commands ?? []) if (c.source !== 'coach') T.decision.push([...base, c.team, c.at, c.effectiveAt, 'command', (c.change ?? []).join('+'), null, null, c.why ?? null, c.source, null]); }
    else for (const o of rec.essential.direction?.orders ?? []) T.decision.push([...base, o.team, o.anchor?.clock ?? null, null, o.type, o.kind, null, null, o.reason ?? null, o.issuer, JSON.stringify(o.content ?? null)]);
    // director efectivo (SIM): intervalos
    if (rec.resolver === 'sim') for (const k of [0, 1]) for (const d of rec.director?.[k] ?? []) T.director.push([...base, k, v.ids[k], d.id, d.start, d.end]);
  }
  return { tables: T, perMatch };
}
const r1 = (x) => Math.round(x * 10) / 10;
export const csvText = (cols, rows) => [cols.join(','), ...rows.map((r) => r.map((v) => { if (v == null) return ''; const s = typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(','))].join('\n') + '\n';

// ---------------------------------------------------------------------------------------------------------------------------------- resúmenes mecánicos (07) y contrastes (08)
export const pct = (arr, p) => { if (!arr.length) return null; const s = arr.slice().sort((a, b) => a - b); const i = (s.length - 1) * p; const lo = Math.floor(i); const hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); }; // método: interpolación lineal entre rangos (R-7)
export const stats = (arr) => { const a = arr.filter((x) => x != null && Number.isFinite(x)); if (!a.length) return { n: 0, mean: null, sd: null, median: null, p10: null, p90: null, min: null, max: null }; const m = a.reduce((s, x) => s + x, 0) / a.length; const sd = a.length > 1 ? Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)) : null; return { n: a.length, mean: r3(m), sd: r3(sd), median: r3(pct(a, 0.5)), p10: r3(pct(a, 0.1)), p90: r3(pct(a, 0.9)), min: Math.min(...a), max: Math.max(...a) }; };
const SUMMARY_METRICS = ['pts', 'diff', 'fga', 'fg3a', 'fta', 'ts_pct', 'efg_pct', 'ft_rate', 'three_share', 'oreb_total', 'dreb_total', 'ast_total', 'tov_total', 'stl', 'blk', 'pf', 'players_used', 'max_minutes', 'top1_fga_share', 'hhi_fga', 'pts_per_control_sim', 'pts_per_finalization_sim', 'pts_per_possession_beM', 'tov_per100_controls_sim', 'tov_per100_possessions_beM', 'duration_s'];
export function summaries(teamRows) {
  const ci = (n) => COLS.team.indexOf(n); const rows = teamRows.filter((r) => r[ci('status')] === 'finished'); const out = [];
  const groups = (keyFn) => { const m = new Map(); for (const r of rows) { const k = keyFn(r); if (k == null) continue; (m.get(k) ?? m.set(k, []).get(k)).push(r); } return m; };
  const emit = (dim, keyFn) => { for (const [k, rs] of groups(keyFn)) for (const ot of ['todos', 'sin_prorroga', 'con_prorroga']) { const sel = ot === 'todos' ? rs : rs.filter((r) => (ot === 'con_prorroga') === (r[ci('overtimes')] > 0)); if (!sel.length) continue; for (const mname of SUMMARY_METRICS) { const s = stats(sel.map((r) => r[ci(mname)])); if (s.n) out.push([dim, k, ot, mname, s.n, s.mean, s.sd, s.median, s.p10, s.p90, s.min, s.max]); } } };
  const idn = (r) => `${r[ci('identity')]}`; emit('identidad|modelo|bloque', (r) => `${idn(r)}|${r[ci('resolver')]}|${r[ci('block')]}`); emit('identidad|modelo|bloque|escenario|variante|orientación', (r) => (['CAL', 'VAL', 'STRESS'].includes(r[ci('block')]) ? null : `${idn(r)}|${r[ci('resolver')]}|${r[ci('block')]}|${r[ci('scenario')]}|${r[ci('variant')]}|${r[ci('orientation')]}`));
  emit('identidad|modelo|bloque|equipo', (r) => (['CAL', 'VAL', 'STRESS'].includes(r[ci('block')]) ? `${idn(r)}|${r[ci('resolver')]}|${r[ci('block')]}|${r[ci('team_id')]}` : null));
  // bandas de anotación por equipo
  const bands = []; for (const [k, rs] of groups((r) => `${r[ci('identity')]}|${r[ci('resolver')]}|${r[ci('block')]}`)) for (const ot of ['todos', 'sin_prorroga', 'con_prorroga']) { const sel = ot === 'todos' ? rs : rs.filter((r) => (ot === 'con_prorroga') === (r[ci('overtimes')] > 0)); if (!sel.length) continue; const cnt = Object.fromEntries(BAND_NAMES.map((b) => [b, 0])); for (const r of sel) cnt[r[ci('band')]] += 1; bands.push([k, ot, sel.length, ...BAND_NAMES.map((b) => cnt[b])]); }
  return { cols: ['dimension', 'grupo', 'prorroga', 'metrica', 'n_equipo_partido', 'media', 'desv_tipica_muestral', 'mediana', 'p10', 'p90', 'min', 'max'], rows: out, bands: { cols: ['identidad|modelo|bloque', 'prorroga', 'n_equipo_partido', ...BAND_NAMES], rows: bands }, percentileMethod: 'interpolación lineal entre rangos (tipo R-7); desviación típica muestral (n−1); cada equipo-partido cuenta una vez; las repeticiones técnicas y de benchmark no se suman' };
}
// Contrastes V0/V1 del bloque B: por escenario, orientación y réplica (misma semilla); diferencia de entrada y de métricas, con n.
export function contrasts(teamRows) {
  const ci = (n) => COLS.team.indexOf(n); const rows = teamRows.filter((r) => r[ci('block')] === 'CONTRAST' && r[ci('status')] === 'finished' && r[ci('is_test_team')] === 1); const by = new Map();
  for (const r of rows) { const k = `${r[ci('resolver')]}|${r[ci('scenario')]}|${r[ci('orientation')]}|${r[ci('replicate')]}`; (by.get(k) ?? by.set(k, {}).get(k))[r[ci('variant')]] = r; }
  const M = ['pts', 'opp_pts', 'diff', 'fga', 'fg3a', 'three_share', 'fta', 'ts_pct', 'oreb_total', 'dreb_total', 'oreb_pct_own', 'ast_total', 'tov_total', 'stl', 'blk', 'pf', 'controls_sim', 'finalizations_sim', 'duration_s', 'players_used', 'max_minutes', 'energy_end_mean', 'press_opps', 'press_explicit_opps', 'ast_den_delivered'];
  const out = []; for (const [k, v] of by) { if (!v.V0 || !v.V1) continue; const [res, sc, or, rep] = k.split('|'); out.push([res, sc, or, rep, v.V0[ci('case_id')], v.V1[ci('case_id')], v.V0[ci('seed')], ...M.flatMap((m) => [v.V0[ci(m)], v.V1[ci(m)], v.V0[ci(m)] != null && v.V1[ci(m)] != null ? r3(v.V1[ci(m)] - v.V0[ci(m)]) : null])]); }
  const cols = ['resolver', 'scenario', 'orientation', 'replicate', 'case_V0', 'case_V1', 'seed', ...M.flatMap((m) => [`${m}_V0`, `${m}_V1`, `${m}_delta`])];
  const agg = new Map(); for (const r of out) { const g = `${r[0]}|${r[1]}|${r[2]}`; (agg.get(g) ?? agg.set(g, []).get(g)).push(r); }
  const aggRows = []; for (const [g, rs] of agg) { const [res, sc, or] = g.split('|'); for (const m of M) { const i = cols.indexOf(`${m}_delta`); const d = rs.map((r) => r[i]).filter((x) => x != null); const s = stats(d); if (s.n) aggRows.push([res, sc, or, m, s.n, s.mean, s.sd, s.median, s.min, s.max]); } }
  return { cols, rows: out, aggCols: ['resolver', 'scenario', 'orientation', 'metric', 'n_pairs', 'mean_delta', 'sd_delta', 'median_delta', 'min_delta', 'max_delta'], aggRows };
}
