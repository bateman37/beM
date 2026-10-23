// Registro de temporada por jugador (§9.2). Acumula por JUGADOR, TEMPORADA, COMPETICIÓN y CLUB conservando sus tramos (stints); el total de temporada los reúne sin duplicar partidos. Guarda SUMAS
// (minutos, intentos/aciertos y demás contadores): los porcentajes se calculan desde sus sumas, nunca promediando porcentajes de partidos. Procedencia por modelo: los conteos comunes compatibles se suman;
// una tasa avanzada solo reúne denominadores con el mismo significado (controles SIM y posesiones beM del detallado NO se suman en una tasa única). Idempotente por encuentro lógico: abrir un histórico,
// importar el mismo paquete, recuperar un lote o repetir un reintento no suma otra vez. Las estadísticas visibles corresponden a la fecha alcanzada (`upTo`).
import { ConsequenceLedger } from '../sim/consequences.js';

export const COMMON_KEYS = ['games', 'starts', 'minTenths', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'ast', 'tov', 'stl', 'blk', 'blkAgainst', 'pf', 'fr', 'pm'];
const zero = () => Object.fromEntries(COMMON_KEYS.map((k) => [k, 0]));
const ADV_KEYS = ['teamMinTenths', 'teamControls', 'teamFinalizations', 'teamPossessions', 'minTenths'];

// Línea común de cada jugador desde el registro esencial de CUALQUIER modelo. Devuelve [{ playerId, teamIndex, line }].
export function commonLines(model, ess) {
  if (model === 'sim') return ess.box.players.map((p) => ({ playerId: p.id, teamIndex: p.team, starter: !!p.starter, line: { minTenths: Math.round(p.sec * 10), pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.astC + p.astL, tov: p.tov, stl: p.stl, blk: p.blk, blkAgainst: p.blkAgainst ?? 0, pf: p.pf, fr: p.pfd, pm: p.pm } }));
  return ess.acta.players.filter((p) => p.min_tenths > 0).map((p) => ({ playerId: p.id, teamIndex: p.team_index ?? p.team, starter: p.participation === 'titular', line: { minTenths: p.min_tenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, tov: p.tov, stl: p.stl, blk: p.blk, blkAgainst: 0, pf: p.pf, fr: p.fr, pm: p.pm } }));
}
const pct = (a, b) => (b > 0 ? a / b : null);
export const derived = (s) => ({ fgm: s.fg2m + s.fg3m, fga: s.fg2a + s.fg3a, fgPct: pct(s.fg2m + s.fg3m, s.fg2a + s.fg3a), fg3Pct: pct(s.fg3m, s.fg3a), ftPct: pct(s.ftm, s.fta), tsPct: pct(s.pts, 2 * (s.fg2a + s.fg3a + 0.44 * s.fta)), min: s.minTenths / 600, ppg: pct(s.pts, s.games), reb: s.oreb + s.dreb });

export class SeasonLedger {
  constructor() { this.stints = new Map(); this.consequences = new ConsequenceLedger(); this.matches = []; }
  static key(player, season, competition, club) { return `${player}|${season}|${competition}|${club}`; }
  // `ctx`: { season, competition, round, clubs:[A,B] (club de cada equipo del encuentro), model, matchId, attemptId, accepted }. Devuelve { ok, duplicate }.
  record(ess, ctx) {
    const guard = this.consequences.apply({ kind: 'stats', matchId: ctx.matchId, attemptId: ctx.attemptId ?? 1, payload: { competition: ctx.competition, round: ctx.round } });
    if (!guard.ok) return { ok: false, duplicate: true, reason: guard.reason };
    const lines = commonLines(ctx.model, ess); const teamMin = [0, 0]; for (const l of lines) teamMin[l.teamIndex] += l.line.minTenths;
    const uni = ctx.model === 'sim' ? { teamControls: ess.controls, teamFinalizations: ess.familyDenominators.map((d) => d.finalizations) } : { teamPossessions: [ess.acta.teams?.[0]?.possessions ?? null, ess.acta.teams?.[1]?.possessions ?? null] };
    for (const l of lines) {
      const club = ctx.clubs[l.teamIndex]; const key = SeasonLedger.key(l.playerId, ctx.season, ctx.competition, club);
      let st = this.stints.get(key); if (!st) { st = { player: l.playerId, season: ctx.season, competition: ctx.competition, club, sums: zero(), rounds: [], byModel: {} }; this.stints.set(key, st); }
      const add = (o) => { for (const k of COMMON_KEYS) o[k] = (o[k] ?? 0) + (k === 'games' ? 1 : k === 'starts' ? (l.starter ? 1 : 0) : (l.line[k] ?? 0)); };
      add(st.sums); st.rounds.push({ round: ctx.round, matchId: ctx.matchId, model: ctx.model });
      const advOne = { teamMinTenths: teamMin[l.teamIndex], teamControls: uni.teamControls ? uni.teamControls[l.teamIndex] : 0, teamFinalizations: uni.teamFinalizations ? uni.teamFinalizations[l.teamIndex] : 0, teamPossessions: uni.teamPossessions?.[l.teamIndex] ?? 0 };
      (st.perMatch ??= []).push({ matchId: ctx.matchId, round: ctx.round, model: ctx.model, starter: l.starter, line: { ...l.line }, adv: advOne });
      const bm = (st.byModel[ctx.model] ??= { ...zero(), adv: { teamMinTenths: 0, teamControls: 0, teamFinalizations: 0, teamPossessions: 0 } }); add(bm);
      bm.adv.teamMinTenths += teamMin[l.teamIndex]; if (uni.teamControls) bm.adv.teamControls += uni.teamControls[l.teamIndex]; if (uni.teamFinalizations) bm.adv.teamFinalizations += uni.teamFinalizations[l.teamIndex]; if (uni.teamPossessions?.[l.teamIndex] != null) bm.adv.teamPossessions += uni.teamPossessions[l.teamIndex];
    }
    this.matches.push({ matchId: ctx.matchId, season: ctx.season, competition: ctx.competition, round: ctx.round, model: ctx.model, clubs: ctx.clubs }); return { ok: true };
  }
  // Tramos de un jugador (por club y competición) hasta la fecha alcanzada: no se muestran totales de rondas posteriores aunque ya se hayan calculado.
  stintsOf(player, { season = null, upTo = Infinity } = {}) {
    const out = [];
    for (const st of this.stints.values()) { if (st.player !== player || (season != null && st.season !== season)) continue; const rs = st.rounds.filter((r) => r.round <= upTo); if (!rs.length) continue; if (rs.length === st.rounds.length) { out.push({ ...st, sums: { ...st.sums } }); continue; } out.push(this._partial(st, rs)); }
    return out;
  }
  // Reconstruye un tramo con solo los encuentros alcanzados (desde el detalle por partido conservado en el propio tramo).
  _partial(st, rs) { const keep = new Set(rs.map((r) => r.matchId)); const sums = zero(); const byModel = {}; for (const m of st.perMatch.filter((x) => keep.has(x.matchId))) { const bm = (byModel[m.model] ??= { ...zero(), adv: { teamMinTenths: 0, teamControls: 0, teamFinalizations: 0, teamPossessions: 0 } }); for (const tgt of [sums, bm]) { tgt.games += 1; tgt.starts += m.starter ? 1 : 0; for (const k of COMMON_KEYS) if (k !== 'games' && k !== 'starts') tgt[k] += m.line[k] ?? 0; } for (const k of Object.keys(bm.adv)) bm.adv[k] += m.adv[k]; } return { ...st, rounds: rs, sums, byModel }; }
  total(player, opts = {}) { const t = zero(); const comps = new Set(); const clubs = new Set(); for (const s of this.stintsOf(player, opts)) { for (const k of COMMON_KEYS) t[k] += s.sums[k]; comps.add(s.competition); clubs.add(s.club); } return { sums: t, ...derived(t), competitions: [...comps], clubs: [...clubs] }; }
  // Tasa avanzada solo dentro de un modelo (mismo significado de denominador).
  advanced(player, model, opts = {}) { let m = null; for (const s of this.stintsOf(player, opts)) { const b = s.byModel?.[model]; if (!b) continue; m ??= { ...zero(), adv: { teamMinTenths: 0, teamControls: 0, teamFinalizations: 0, teamPossessions: 0 } }; for (const k of COMMON_KEYS) m[k] += b[k]; for (const k of Object.keys(m.adv)) m.adv[k] += b.adv[k]; } return m; }
  toJSON() { return { schema: 'beM-season-ledger/1', stints: [...this.stints.values()], consequences: this.consequences.toJSON(), matches: this.matches }; }
  static from(j) { const l = new SeasonLedger(); for (const s of j.stints) l.stints.set(SeasonLedger.key(s.player, s.season, s.competition, s.club), s); l.consequences = ConsequenceLedger.from(j.consequences); l.matches = j.matches; return l; }
}
void ADV_KEYS;
