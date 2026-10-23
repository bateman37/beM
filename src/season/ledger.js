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
  // detallado: solo suma un partido quien tuvo tiempo (DNP, indisponibles y «entró sin tiempo» no suman); los tapones recibidos se transportan desde el acta (`blk_rec`); un esencial anterior sin ese contador lo declara no conservado
  return ess.acta.players.filter((p) => p.min_tenths > 0).map((p) => ({ playerId: p.id, teamIndex: p.team_index ?? p.team, starter: p.participation === 'titular', unconserved: p.blk_rec === undefined ? ['blkAgainst'] : [], line: { minTenths: p.min_tenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, tov: p.tov, stl: p.stl, blk: p.blk, blkAgainst: p.blk_rec ?? 0, pf: p.pf, fr: p.fr, pm: p.pm } }));
}
const pct = (a, b) => (b > 0 ? a / b : null);
export const derived = (s) => ({ fgm: s.fg2m + s.fg3m, fga: s.fg2a + s.fg3a, fgPct: pct(s.fg2m + s.fg3m, s.fg2a + s.fg3a), fg3Pct: pct(s.fg3m, s.fg3a), ftPct: pct(s.ftm, s.fta), tsPct: pct(s.pts, 2 * (s.fg2a + s.fg3a + 0.44 * s.fta)), min: s.minTenths / 600, ppg: pct(s.pts, s.games), reb: s.oreb + s.dreb });

// Comprobación previa de un registro definitivo (C03-04). Devuelve la lista de causas; vacía si puede confirmarse.
export function validateRecordable(ess, ctx) {
  const errs = []; const add = (path, message) => errs.push({ path, message }); const num = (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0;
  if (!ctx || typeof ctx !== 'object') { add('ctx', 'contexto de registro ausente'); return errs; }
  if (!['sim', 'detailed'].includes(ctx.model)) add('ctx.model', `modelo desconocido: ${ctx.model}`);
  for (const k of ['season', 'competition', 'matchId']) if (ctx[k] == null || ctx[k] === '') add(`ctx.${k}`, 'identidad ausente');
  if (ctx.round == null || !Number.isFinite(Number(ctx.round))) add('ctx.round', 'ronda ausente o no numérica');
  if (!Array.isArray(ctx.clubs) || ctx.clubs.length !== 2 || ctx.clubs.some((c) => c == null || c === '')) add('ctx.clubs', 'se necesitan los dos clubes del encuentro (no se deducen del identificador del jugador)');
  if (!ess || typeof ess !== 'object') { add('essential', 'registro esencial ausente'); return errs; }
  if (errs.length) return errs;
  if (ess.complete !== true || (ess.status != null && ess.status !== 'finished')) add('essential.complete', `encuentro no terminado como definitivo (complete=${ess.complete}, status=${ess.status}): un parcial no es histórico`);
  const valid = ess.validity?.valid; if (valid !== true) add('essential.validity', ess.validity == null || valid == null ? 'validez no evaluada: no se confirma como definitiva' : 'encuentro no válido: no es histórico definitivo');
  if (ess.identity?.matchId != null && ess.identity.matchId !== ctx.matchId) add('essential.identity', `el esencial es del encuentro ${ess.identity.matchId}, no de ${ctx.matchId}`);
  const final = ess.score?.final; if (!Array.isArray(final) || final.length !== 2 || !final.every(num)) { add('essential.score', 'marcador final ausente o mal formado'); return errs; }
  const pts = [0, 0];
  if (ctx.model === 'sim') {
    if (!Array.isArray(ess.box?.players) || !ess.box.players.length) { add('essential.box.players', 'acta individual ausente'); return errs; }
    if (!Array.isArray(ess.controls) || ess.controls.length !== 2 || !ess.controls.every(num)) add('essential.controls', 'controles por equipo ausentes o mal formados');
    if (!Array.isArray(ess.familyDenominators) || ess.familyDenominators.length !== 2 || !ess.familyDenominators.every((d) => d && num(d.finalizations))) add('essential.familyDenominators', 'denominadores de finalización ausentes o mal formados');
    const seen = new Set();
    ess.box.players.forEach((p, i) => {
      const at = `essential.box.players[${i}]`; if (!p?.id) { add(at, 'jugador sin identidad'); return; } if (seen.has(p.id)) add(at, `jugador duplicado ${p.id}`); seen.add(p.id);
      if (p.team !== 0 && p.team !== 1) { add(at, 'equipo del jugador fuera de {0,1}'); return; }
      for (const k of ['sec', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'astC', 'astL', 'tov', 'stl', 'blk', 'pf', 'pfd']) if (!num(p[k])) add(`${at}.${k}`, 'contador ausente o negativo');
      if (p.fg2m > p.fg2a || p.fg3m > p.fg3a || p.ftm > p.fta) add(at, 'más aciertos que intentos');
      if (p.pts !== 2 * p.fg2m + 3 * p.fg3m + p.ftm) add(at, `puntos (${p.pts}) no concilian con sus aciertos`);
      pts[p.team] += p.pts;
    });
  } else {
    if (!Array.isArray(ess.acta?.players) || !ess.acta.players.length) { add('essential.acta.players', 'acta individual ausente'); return errs; }
    const seen = new Set();
    ess.acta.players.forEach((p, i) => {
      const at = `essential.acta.players[${i}]`; if (!p?.id) { add(at, 'jugador sin identidad'); return; } if (seen.has(p.id)) add(at, `jugador duplicado ${p.id}`); seen.add(p.id);
      const ti = p.team_index ?? p.team; if (ti !== 0 && ti !== 1) { add(at, 'equipo del jugador fuera de {0,1}'); return; }
      for (const k of ['min_tenths', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'ast', 'tov', 'stl', 'blk', 'pf', 'fr']) if (!num(p[k])) add(`${at}.${k}`, 'contador ausente o negativo');
      if (p.fg2m > p.fg2a || p.fg3m > p.fg3a || p.ftm > p.fta) add(at, 'más aciertos que intentos');
      pts[ti] += p.pts;
    });
  }
  if (pts[0] !== final[0] || pts[1] !== final[1]) add('essential.score', `los puntos individuales (${pts}) no suman el marcador final (${final})`);
  return errs;
}

export class SeasonLedger {
  constructor() { this.stints = new Map(); this.consequences = new ConsequenceLedger(); this.matches = []; }
  static key(player, season, competition, club) { return `${player}|${season}|${competition}|${club}`; }
  // `ctx`: { season, competition, round, clubs:[A,B] (club de cada equipo del encuentro), model, matchId, attemptId, accepted }. Devuelve { ok, duplicate } o { ok:false, rejected, errors }.
  // C03-04: se valida TODO antes de mutar (identidad, finalización, validez, equipos, participantes, contadores y denominadores) y se confirma de una vez; un rechazo no consume la consecuencia ni deja sumas
  // parciales, y un reintento válido del mismo encuentro sigue siendo posible. La validez no evaluada (`validity: null`) no se inventa: no se confirma como definitivo.
  record(ess, ctx) {
    const errors = validateRecordable(ess, ctx); if (errors.length) return { ok: false, rejected: true, errors, reason: errors.map((e) => `${e.path}: ${e.message}`).join('; ') };
    const scope = `${ctx.season}|${ctx.competition}`; let prev = this.consequences.get('stats', ctx.matchId, scope); const legacy = this.consequences.get('stats', ctx.matchId, '*'); if (!prev && legacy && legacy.payload?.competition === ctx.competition && (legacy.payload?.season ?? ctx.season) === ctx.season) prev = legacy; // un guardado de 02 anotaba el ámbito «*»
    if (prev) return { ok: false, duplicate: true, reason: `la consecuencia «stats» del encuentro ${ctx.matchId} (${scope}) ya se aplicó con el intento ${prev.attemptId}` };
    const lines = commonLines(ctx.model, ess); const teamMin = [0, 0]; for (const l of lines) teamMin[l.teamIndex] += l.line.minTenths;
    const uni = ctx.model === 'sim' ? { teamControls: ess.controls, teamFinalizations: ess.familyDenominators.map((d) => d.finalizations) } : { teamPossessions: [ess.acta.teams?.[0]?.possessions ?? null, ess.acta.teams?.[1]?.possessions ?? null] };
    const staged = new Map(); // clave → tramo ya clonado (o nuevo) con la suma aplicada; nada toca el registro hasta confirmar
    for (const l of lines) {
      const club = ctx.clubs[l.teamIndex]; const key = SeasonLedger.key(l.playerId, ctx.season, ctx.competition, club);
      let st = staged.get(key); if (!st) { const cur = this.stints.get(key); st = cur ? structuredClone(cur) : { player: l.playerId, season: ctx.season, competition: ctx.competition, club, sums: zero(), rounds: [], byModel: {} }; staged.set(key, st); }
      const add = (o) => { for (const k of COMMON_KEYS) o[k] = (o[k] ?? 0) + (k === 'games' ? 1 : k === 'starts' ? (l.starter ? 1 : 0) : (l.line[k] ?? 0)); };
      add(st.sums); st.rounds.push({ round: ctx.round, matchId: ctx.matchId, model: ctx.model });
      const advOne = { teamMinTenths: teamMin[l.teamIndex], teamControls: uni.teamControls ? uni.teamControls[l.teamIndex] : 0, teamFinalizations: uni.teamFinalizations ? uni.teamFinalizations[l.teamIndex] : 0, teamPossessions: uni.teamPossessions?.[l.teamIndex] ?? 0 };
      (st.perMatch ??= []).push({ matchId: ctx.matchId, round: ctx.round, model: ctx.model, starter: l.starter, line: { ...l.line }, adv: advOne, ...(l.unconserved?.length ? { unconserved: l.unconserved } : {}) });
      const bm = (st.byModel[ctx.model] ??= { ...zero(), adv: { teamMinTenths: 0, teamControls: 0, teamFinalizations: 0, teamPossessions: 0 } }); add(bm);
      bm.adv.teamMinTenths += teamMin[l.teamIndex]; if (uni.teamControls) bm.adv.teamControls += uni.teamControls[l.teamIndex]; if (uni.teamFinalizations) bm.adv.teamFinalizations += uni.teamFinalizations[l.teamIndex]; if (uni.teamPossessions?.[l.teamIndex] != null) bm.adv.teamPossessions += uni.teamPossessions[l.teamIndex];
    }
    const guard = this.consequences.apply({ kind: 'stats', matchId: ctx.matchId, scope, attemptId: ctx.attemptId ?? 1, payload: { competition: ctx.competition, round: ctx.round, season: ctx.season } });
    if (!guard.ok) return { ok: false, duplicate: true, reason: guard.reason };
    for (const [key, st] of staged) this.stints.set(key, st);
    this.matches.push({ matchId: ctx.matchId, season: ctx.season, competition: ctx.competition, round: ctx.round, model: ctx.model, clubs: ctx.clubs.slice() }); return { ok: true };
  }
  // Tramos de un jugador (por club y competición) hasta la fecha alcanzada: no se muestran totales ni DETALLE de rondas posteriores aunque ya se hayan calculado (C03-05). Todo lo devuelto es una copia
  // independiente: modificarlo no altera el registro interno. `season` y `competition` filtran de forma coherente con la fecha.
  stintsOf(player, { season = null, competition = null, upTo = Infinity } = {}) {
    const out = [];
    for (const st of this.stints.values()) { if (st.player !== player || (season != null && st.season !== season) || (competition != null && st.competition !== competition)) continue; const rs = st.rounds.filter((r) => r.round <= upTo); if (!rs.length) continue; out.push(structuredClone(rs.length === st.rounds.length ? st : this._partial(st, rs))); }
    return out;
  }
  // Reconstruye un tramo con solo los encuentros alcanzados (desde el detalle por partido conservado en el propio tramo): sumas, rondas, detalle por encuentro y agregados por modelo.
  _partial(st, rs) { const keep = new Set(rs.map((r) => r.matchId)); const sums = zero(); const byModel = {}; const perMatch = st.perMatch.filter((x) => keep.has(x.matchId)); for (const m of perMatch) { const bm = (byModel[m.model] ??= { ...zero(), adv: { teamMinTenths: 0, teamControls: 0, teamFinalizations: 0, teamPossessions: 0 } }); for (const tgt of [sums, bm]) { tgt.games += 1; tgt.starts += m.starter ? 1 : 0; for (const k of COMMON_KEYS) if (k !== 'games' && k !== 'starts') tgt[k] += m.line[k] ?? 0; } for (const k of Object.keys(bm.adv)) bm.adv[k] += m.adv[k]; } return { ...st, rounds: rs, sums, byModel, perMatch }; }
  // Encuentros registrados hasta la fecha (misma regla temporal que los tramos).
  matchesUpTo({ season = null, competition = null, upTo = Infinity } = {}) { return structuredClone(this.matches.filter((m) => m.round <= upTo && (season == null || m.season === season) && (competition == null || m.competition === competition))); }
  total(player, opts = {}) { const t = zero(); const comps = new Set(); const clubs = new Set(); for (const s of this.stintsOf(player, opts)) { for (const k of COMMON_KEYS) t[k] += s.sums[k]; comps.add(s.competition); clubs.add(s.club); } return { sums: t, ...derived(t), competitions: [...comps], clubs: [...clubs] }; }
  // Tasa avanzada solo dentro de un modelo (mismo significado de denominador).
  advanced(player, model, opts = {}) { let m = null; for (const s of this.stintsOf(player, opts)) { const b = s.byModel?.[model]; if (!b) continue; m ??= { ...zero(), adv: { teamMinTenths: 0, teamControls: 0, teamFinalizations: 0, teamPossessions: 0 } }; for (const k of COMMON_KEYS) m[k] += b[k]; for (const k of Object.keys(m.adv)) m.adv[k] += b.adv[k]; } return m; }
  toJSON() { return { schema: 'beM-season-ledger/1', stints: [...this.stints.values()], consequences: this.consequences.toJSON(), matches: this.matches }; }
  static from(j) { const l = new SeasonLedger(); for (const s of j.stints) l.stints.set(SeasonLedger.key(s.player, s.season, s.competition, s.club), s); l.consequences = ConsequenceLedger.from(j.consequences); l.matches = j.matches; return l; }
}
void ADV_KEYS;
