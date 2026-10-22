// Contrato de resultado SIM (beM-sim-match/1). Todo se lee de los hechos comprometidos (eventos + intervalos de tramos): el acta, los mapas por zona, las familias, los quintetos y la
// evolución son la MISMA salida vista de formas distintas; consultar un prefijo reconstruye desde los hechos publicados sin consumir azar.
import { SIM_MODEL, SIM_RESULT_SCHEMA, SIM_VERSION, SIM_COVERAGE_ID, SIM_STATS_POLICY_ID } from './version.js';
import { fpString } from './fp.js';
import { reconcileResult } from './reconcile.js';

const ZONES = ['rim', 'inside', 'midrange', 'three'];
const zeroLine = () => ({ sec: 0, pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, astC: 0, astL: 0, tov: 0, stl: 0, blk: 0, blkAgainst: 0, pf: 0, pfd: 0, pm: 0, starter: false });
const r1 = (x) => Math.round(x * 10) / 10;

// Huella deportiva: lee solo hechos (tipo, equipo, jugador, zona, calidad, resultado, créditos, causa, tiempo, periodo) y el marcador; incremental sobre enteros (sin construir texto por hecho).
const TYPES = { shot: 1, ft: 2, tov: 3, reb: 4, foul: 5, shootfoul: 6, sub: 7, plan: 8, period: 9, end: 10 };
export function sportDigest(m) {
  let h1 = 0x811c9dc5; let h2 = 0x9e3779b9; const put = (x) => { h1 = Math.imul(h1 ^ x, 0x01000193); h2 = Math.imul(h2 ^ (x + 0x7f4a7c15), 0x85ebca6b); h2 ^= h2 >>> 13; h1 ^= h1 >>> 15; };
  const ids = new Map(); const ix = (id) => { if (id == null) return 0; let v = ids.get(id); if (v === undefined) { v = ids.size + 1; ids.set(id, v); } return v; };
  const str = (s) => { if (s == null) return 0; let x = 0; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return x; };
  put(m.norm.seed); put(m.score[0]); put(m.score[1]);
  for (const e of m.events) { if (e.t > m.published + 1e-9) break; put(TYPES[e.ty] ?? 0); put(e.tm ?? -1); put(ix(e.pl)); put(str(e.zone)); put(e.q ?? -1); put(e.made === true ? 1 : e.made === false ? 0 : -1); put(ix(e.blk)); put(ix(e.passer)); put(ix(e.stl)); put(str(e.kind)); put(str(e.cause)); put(e.off === true ? 1 : 0); put(e.k ?? 0); put(ix(e.drawn)); put(ix(e.victim)); put(Math.round(e.t * 10)); put(e.p); put(str(e.src)); put(str(e.play)); put(e.and1 ? 1 : 0); put(e.bonus ? 1 : 0); }
  h1 = Math.imul(h1 ^ (h2 >>> 16), 0x85ebca6b); h2 = Math.imul(h2 ^ (h1 >>> 13), 0xc2b2ae35);
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

// Construye el resultado completo (o el prefijo publicado). `opts.events=false` omite el registro temporal (resumen compacto de lote).
export function buildSimResult(m, opts = {}) {
  const { events: withEvents = true, reconcile = true } = opts; m._buildDraws = m.rng.draws; const T = m.published; const full = m.status === 'finished' && T >= m.gt - 1e-9;
  const evs = m.events.filter((e) => e.t <= T + 1e-9);
  const segs = m.segments.filter((s) => s.start < T - 1e-9 || full);
  const byId = {}; const players = [];
  m.teams.forEach((t) => t.players.forEach((p) => { const row = { id: p.id, team: t.idx, name: p.name, positions: p.positions, ...zeroLine(), dnp: true, unavailable: !p.available, zones: Object.fromEntries(ZONES.map((z) => [z, { a: 0, m: 0, q: [0, 0, 0], byPeriod: {} }])) }; byId[p.id] = row; players.push(row); }));
  m.teams.forEach((t) => { for (const s of ['PG', 'SG', 'SF', 'PF', 'C']) byId[t.plan.starters[s]].starter = true; });
  const teamLine = [{ ...zeroLine(), teamReb: [0, 0], teamTov: 0 }, { ...zeroLine(), teamReb: [0, 0], teamTov: 0 }];
  const clip = (s) => Math.max(0, Math.min(s.end, T) - s.start);
  const q = new Map(); // quintetos: clave → acumulado
  const quint = (k, s) => { const ids = s.lineups[k].slice().sort(); const key = `${m.teams[k].id}:${ids.join('|')}`; let e = q.get(key); if (!e) { e = { key, team: k, ids, sec: 0, intervals: [], pf: 0, pa: 0, fga: 0, fgm: 0, fg3a: 0, fg3m: 0, fta: 0, ftm: 0, tov: 0, oreb: 0, dreb: 0, ast: 0, stl: 0, blk: 0, pfCommitted: 0 }; q.set(key, e); } return e; };
  for (const s of segs) {
    const d = clip(s); if (d <= 0) continue;
    for (const k of [0, 1]) { for (const id of s.lineups[k]) { const r = byId[id]; r.sec += d; r.dnp = false; } const e = quint(k, s); e.sec += d; const last = e.intervals[e.intervals.length - 1]; if (last && Math.abs(last[1] - s.start) < 1e-6) last[1] = r1(s.start + d); else e.intervals.push([r1(s.start), r1(s.start + d)]); }
  }
  const lineupAt = (e) => m.segments[e.sg]; const famMap = [{}, {}]; const evolution = []; let sc = [0, 0];
  const famRow = (k, src, play) => { const key = play ?? src; const m2 = famMap[k]; return (m2[key] ??= { key, family: src, play: play ?? null, fga: 0, fgm: 0, pts: 0, fta: 0, ast: 0, moved: 0, q: [0, 0, 0] }); };
  const addPts = (k, pts, seg) => { sc[k] += pts; if (!seg) return; for (const id of seg.lineups[k]) byId[id].pm += pts; for (const id of seg.lineups[1 - k]) byId[id].pm -= pts; const qe = quint(k, seg); qe.pf += pts; quint(1 - k, seg).pa += pts; };
  const perSeg = new Map();
  for (const e of evs) {
    const seg = e.sg >= 0 ? m.segments[e.sg] : null; const qk = seg && e.tm != null && (e.ty === 'shot' || e.ty === 'ft' || e.ty === 'tov' || e.ty === 'reb') ? quint(e.tm, seg) : null;
    if (e.ty === 'shot') {
      const r = byId[e.pl]; const z = r.zones[e.zone]; z.a += 1; z.q[e.q] += 1; z.byPeriod[e.p] = z.byPeriod[e.p] ?? [0, 0]; z.byPeriod[e.p][0] += 1;
      const three = e.zone === 'three'; if (three) r.fg3a++; else r.fg2a++; qk.fga++; if (three) qk.fg3a++;
      const f = famRow(e.tm, e.src, e.play); f.fga++; f.q[e.q]++; if (e.moved) f.moved++;
      if (e.made) { z.m += 1; z.byPeriod[e.p][1] += 1; if (three) { r.fg3m++; qk.fg3m++; } else r.fg2m++; qk.fgm++; r.pts += e.pts; f.fgm++; f.pts += e.pts; addPts(e.tm, e.pts, seg); if (e.passer) { byId[e.passer].astC++; f.ast++; qk.ast++; } }
      else if (e.blk) { byId[e.blk].blk++; r.blkAgainst++; quint(1 - e.tm, seg).blk++; }
    } else if (e.ty === 'ft') {
      const r = byId[e.pl]; r.fta++; qk.fta++; if (e.made) { r.ftm++; qk.ftm++; r.pts += 1; addPts(e.tm, 1, seg); }
      if (e.assist) { byId[e.assist].astL++; }
      if (e.cause === 'shooting' || e.cause === 'bonus') { /* la serie se cuenta como falta de tiro en f.fta abajo */ }
    } else if (e.ty === 'tov') {
      if (e.pl) byId[e.pl].tov++; else teamLine[e.tm].teamTov++; qk.tov++;
      if (e.stl) { byId[e.stl].stl++; quint(1 - e.tm, seg).stl++; }
    } else if (e.ty === 'reb') {
      if (e.pl) { const r = byId[e.pl]; if (e.off) r.oreb++; else r.dreb++; } else teamLine[e.tm].teamReb[e.off ? 0 : 1]++;
      qk[e.off ? 'oreb' : 'dreb']++;
    } else if (e.ty === 'foul') { byId[e.pl].pf++; if (e.drawn) byId[e.drawn].pfd++; }
    else if (e.ty === 'shootfoul') { byId[e.pl].pf++; byId[e.victim].pfd++; }
    if (e.ty === 'shootfoul') { const f = famRow(1 - e.tm, e.src, e.play); f.sf = (f.sf ?? 0) + 1; }
    if (seg) perSeg.set(e.sg, [sc[0], sc[1]]);
  }
  // evolución compacta: marcador al final de cada tramo con sus quintetos
  for (const s of segs) { const d = clip(s); evolution.push({ n: s.n, t: r1(s.start + d), p: s.period, score: perSeg.get(s.n) ?? evolution[evolution.length - 1]?.score ?? [0, 0], lineups: s.lineups.map((l) => l.slice().sort().join('|')) }); }
  for (const r of players) { r.min = r1(r.sec / 60); r.fg = r.fg2m + r.fg3m; r.fga = r.fg2a + r.fg3a; r.ast = r.astC + r.astL; r.reb = r.oreb + r.dreb; r.val = r.pts + r.reb + r.ast + r.stl + r.blk + r.pfd - (r.fga - r.fg) - (r.fta - r.ftm) - r.tov - r.blkAgainst - r.pf; }
  const totals = m.teams.map((t) => { const tl = { ...zeroLine(), teamReb: teamLine[t.idx].teamReb, teamTov: teamLine[t.idx].teamTov }; for (const r of players) if (r.team === t.idx) for (const k of ['sec', 'pts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'astC', 'astL', 'tov', 'stl', 'blk', 'blkAgainst', 'pf', 'pfd']) tl[k] += r[k]; tl.min = r1(tl.sec / 60); tl.fga = tl.fg2a + tl.fg3a; tl.fgm = tl.fg2m + tl.fg3m; tl.ast = tl.astC + tl.astL; tl.reb = tl.oreb + tl.dreb + tl.teamReb[0] + tl.teamReb[1]; return tl; });
  const exposure = {}; for (const s of segs) { const d = clip(s); if (d <= 0) continue; for (const k of [0, 1]) for (const [id, slot] of Object.entries(s.slots[k])) { const e = (exposure[id] ??= { slotSec: {}, roleSec: {} }); e.slotSec[slot] = Math.round(((e.slotSec[slot] ?? 0) + d) * 1000) / 1000; const role = m.teams[k].byId[id].offRole; if (role) e.roleSec[role] = Math.round(((e.roleSec[role] ?? 0) + d) * 1000) / 1000; } }
  const periodPts = m.periodScore.map((p) => p.slice()); const finished = m.status === 'finished' && full;
  const controls = [0, 0]; for (const s of segs) { controls[0] += s.controls[0]; controls[1] += s.controls[1]; }
  const res = {
    schema: SIM_RESULT_SCHEMA, model: SIM_MODEL, version: SIM_VERSION, coverage: SIM_COVERAGE_ID, statsPolicy: SIM_STATS_POLICY_ID,
    identity: { matchId: m.opts.matchId ?? null, attemptId: m.opts.attemptId ?? null, seed: m.norm.seed, importance: m.norm.importance, inputFingerprint: m.norm.fingerprint, teams: m.teams.map((t) => ({ id: t.id, name: t.name, source: m.norm.teams[t.idx].sourceTeam })), simProfile: m.ctx.sp.id, simProfileFingerprint: m.ctx.sp.fingerprint, tablesFingerprint: m.ctx.T.fingerprint, detailedProfile: m.ctx.sp.detailedProfileId, ignoredInput: m.norm.ignored },
    status: m.status, error: m.error, published: r1(T), generatedUntil: r1(m.gt),
    score: { current: sc.slice(), final: finished ? sc.slice() : null, periods: periodPts, overtimes: Math.max(0, m.period - m.rules.quarters), winner: finished ? (sc[0] > sc[1] ? 0 : 1) : null },
    box: { players, teams: totals }, controls, segments: segs.map((s) => ({ n: s.n, start: r1(s.start), end: r1(s.end), period: s.period, lineups: s.lineups, controls: s.controls, secPerControl: s.secPerControl, tau: s.tau, sigma: s.sigma, org: s.org, plans: s.plans, cut: !!s.cut })),
    zones: ZONES.map((z) => ({ zone: z, teams: [0, 1].map((k) => { let a = 0; let mk = 0; for (const r of players) if (r.team === k) { a += r.zones[z].a; mk += r.zones[z].m; } return { a, m: mk }; }) })),
    families: famMap.map((f) => Object.values(f)), familyDenominators: [0, 1].map((k) => ({ controls: segs.reduce((s, x) => s + x.controls[k], 0), finalizations: evs.filter((e) => (e.ty === 'shot' && e.tm === k) || (e.ty === 'shootfoul' && e.tm === 1 - k)).length })), exposure, exposureInfo: { unit: 'segundos de juego', provenance: 'intervalos de presencia por tramo; posición = puesto asignado en el quinteto del tramo; rol = rol ofensivo vigente de la ficha del jugador', familias: 'uso de familias y fichas en families[] con denominadores en familyDenominators[]' }, quintets: [...q.values()].map((e) => ({ ...e, sec: Math.round(e.sec * 1000) / 1000, min: r1(e.sec / 60) })), evolution,
  };
  if (withEvents) res.events = evs;
  res.sportFingerprint = sportDigest({ norm: m.norm, score: sc, events: m.events, published: T });
  if (reconcile) res.reconciliation = reconcileResult(m, res, evs);
  return res;
}
