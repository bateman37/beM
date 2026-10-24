// Contrato de resultado SIM (beM-sim-match/2). Todo se lee de los HECHOS comprometidos (eventos + intervalos de tramos) hasta el presente publicado: el acta, los mapas por zona, las familias, los quintetos,
// los periodos, los controles y el estado observable son la MISMA salida vista de formas distintas. El sufijo generado por delante del presente es privado: solo el diagnóstico lo ve si se pide expresamente.
// Consultar un prefijo (o una vista histórica `at`) reconstruye desde los hechos sin consumir azar ni alterar la publicación.
import { SIM_MODEL, SIM_RESULT_SCHEMA, SIM_VERSION, SIM_COVERAGE_ID, SIM_STATS_POLICY_ID } from './version.js';
import { fpString } from './fp.js';
import { reconcileResult } from './reconcile.js';
import { attributedPlay } from './attribution.js';
import { moduleExposure, pressExposure, assistTables, reboundFunnel } from './exposure.js';
import { buildAnalysis } from './analysis.js';

const ZONES = ['rim', 'inside', 'midrange', 'three'];
export const FAMILY_BONUS = 'bonus_sin_familia';
const zeroLine = () => ({ sec: 0, pts: 0, fgPts: 0, ftPts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, astC: 0, astL: 0, tov: 0, stl: 0, blk: 0, blkAgainst: 0, pf: 0, pfd: 0, pm: 0, starter: false });
const r1 = (x) => Math.round(x * 10) / 10;

// Huella deportiva: lee solo hechos (tipo, equipo, jugador, zona, calidad, resultado, créditos, causa, tiempo, periodo) y el marcador; incremental sobre enteros (sin construir texto por hecho).
const TYPES = { shot: 1, ft: 2, tov: 3, reb: 4, foul: 5, shootfoul: 6, sub: 7, plan: 8, period: 9, end: 10 };
export function sportDigest(m) {
  let h1 = 0x811c9dc5; let h2 = 0x9e3779b9; const put = (x) => { h1 = Math.imul(h1 ^ x, 0x01000193); h2 = Math.imul(h2 ^ (x + 0x7f4a7c15), 0x85ebca6b); h2 ^= h2 >>> 13; h1 ^= h1 >>> 15; };
  const ids = new Map(); const ix = (id) => { if (id == null) return 0; let v = ids.get(id); if (v === undefined) { v = ids.size + 1; ids.set(id, v); } return v; };
  const str = (s) => { if (s == null) return 0; let x = 0; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return x; };
  put(m.norm.seed); put(m.score[0]); put(m.score[1]);
  for (const e of m.events) { if (e.t > m.published + 1e-9) break; put(TYPES[e.ty] ?? 0); put(e.tm ?? -1); put(ix(e.pl)); put(str(e.zone)); put(e.q ?? -1); put(e.made === true ? 1 : e.made === false ? 0 : -1); put(ix(e.blk)); put(ix(e.passer)); put(ix(e.stl)); put(str(e.kind)); put(str(e.cause)); put(e.off === true ? 1 : 0); put(e.k ?? 0); put(ix(e.drawn)); put(ix(e.victim)); put(Math.round(e.t * 10)); put(e.p); put(str(e.src)); put(str(e.play)); put(e.and1 ? 1 : 0); put(e.bonus ? 1 : 0); put(e.fin ?? 0); put(e.pfN ?? 0); put(ix(e.dir)); put(ix(e.scr)); put(e.scrSrc ?? -1); put(e.elig ?? -1); put(str(e.cont)); }
  // C04-04: la presión adelantada del tramo (altura, ajuste de familiaridad y controles alcanzados) forma parte de la huella deportiva
  for (const sg of m.segments ?? []) { if (sg.start > m.published + 1e-9) break; if (sg.press) for (const k of [0, 1]) { const p = sg.press[k]; if (p) { put(k); put(str(p.height)); put(Math.round(p.delta * 1e6)); put(ix(p.director)); } } }
  h1 = Math.imul(h1 ^ (h2 >>> 16), 0x85ebca6b); h2 = Math.imul(h2 ^ (h1 >>> 13), 0xc2b2ae35);
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

// Controles ALCANZADOS por el prefijo `T` de un tramo (los instantes de cada control se guardaron al generarlo): nunca se usa el total generado del tramo.
export function controlsReached(seg, T) { const c = [0, 0]; for (let i = 0; i < seg.ct.length; i++) if (seg.ct[i] <= T + 1e-9) c[seg.ck[i]] += 1; return c; }

// Construye el resultado del prefijo publicado (o de una vista histórica `at` ≤ publicado).
// `audience`: 'public' (hechos observables), 'own' (+ información autorizada del equipo `team`) o 'diagnostic' (laboratorio: privados y, solo con `includeSuffix`, el sufijo no publicado).
// `events=false` omite el registro temporal (resumen compacto de lote).
export function buildSimResult(m, opts = {}) {
  // `lean` (C04 §8.2, línea 1): construcción del ESENCIAL sin las proyecciones que no conserva (estado observable, evolución, detalle de tramos y decisiones); comparte con la ruta completa TODA la agregación del acta, zonas, familias,
  // exposición y denominadores, de modo que ambas rutas concilian exactamente en su intersección (comprobado en S04-09).
  const { events: withEvents = true, reconcile = true, audience = 'diagnostic', team = 0, at = null, includeSuffix = false, analysis = false, lean = false } = opts; m._buildDraws = m.rng.draws;
  const T = at == null ? m.published : Math.min(Math.max(0, at), m.published); const reachedEnd = m.status === 'finished' && T >= m.gt - 1e-9;
  const evs = m.events.filter((e) => e.t <= T + 1e-9);
  const segs = m.segments.filter((s) => s.start < T - 1e-9 || (reachedEnd && s.end > s.start));
  const byId = {}; const players = [];
  m.teams.forEach((t) => t.players.forEach((p) => { const row = { id: p.id, team: t.idx, name: p.name, positions: p.positions, ...zeroLine(), dnp: true, unavailable: !p.available, zones: Object.fromEntries(ZONES.map((z) => [z, { a: 0, m: 0, q: [0, 0, 0], byPeriod: {} }])) }; byId[p.id] = row; players.push(row); }));
  m.teams.forEach((t) => { for (const s of ['PG', 'SG', 'SF', 'PF', 'C']) byId[t.plan.starters[s]].starter = true; });
  const teamLine = [{ ...zeroLine(), teamReb: [0, 0], teamTov: 0 }, { ...zeroLine(), teamReb: [0, 0], teamTov: 0 }];
  const clip = (s) => Math.max(0, Math.min(s.end, T) - s.start);
  const controls = [0, 0]; const segControls = new Map(); for (const s of segs) { const c = controlsReached(s, T); segControls.set(s.n, c); controls[0] += c[0]; controls[1] += c[1]; }
  const q = new Map(); // quintetos: clave → acumulado
  const qc = new Map(); // caché de entradas de quinteto por (tramo, equipo): antes cada hecho reconstruía y ordenaba su clave
  const quint = (k, s) => { const ck = s.n * 2 + k; const hit = qc.get(ck); if (hit) return hit; const ids = s.lineups[k].slice().sort(); const key = `${m.teams[k].id}:${ids.join('|')}`; let e = q.get(key); if (!e) { e = { key, team: k, ids, sec: 0, ctlFor: 0, ctlAgainst: 0, intervals: [], pf: 0, pa: 0, fga: 0, fgm: 0, fg3a: 0, fg3m: 0, fta: 0, ftm: 0, tov: 0, oreb: 0, dreb: 0, ast: 0, stl: 0, blk: 0, pfCommitted: 0 }; q.set(key, e); } qc.set(ck, e); return e; };
  for (const s of segs) {
    const d = clip(s); if (d <= 0) continue;
    for (const k of [0, 1]) { for (const id of s.lineups[k]) { const r = byId[id]; r.sec += d; r.dnp = false; } const e = quint(k, s); e.sec += d; const sc2 = segControls.get(s.n); e.ctlFor += sc2[k]; e.ctlAgainst += sc2[1 - k]; /* controles ofensivos y defensivos realmente observados durante la presencia (C03-07B) */ const last = e.intervals[e.intervals.length - 1]; if (last && Math.abs(last[1] - s.start) < 1e-6) last[1] = r1(s.start + d); else e.intervals.push([r1(s.start), r1(s.start + d)]); }
  }
  const famMap = [{}, {}]; const evolution = []; let sc = [0, 0]; const finSeen = [new Set(), new Set()]; const finTeam = [0, 0]; const periodPts = [[0, 0]]; const fdn = [{ fga: 0, fgm: 0, fta: 0, ftm: 0, fgPts: 0, ftPts: 0, sf: 0, and1: 0, bonusFta: 0, bonusFtm: 0 }, { fga: 0, fgm: 0, fta: 0, ftm: 0, fgPts: 0, ftPts: 0, sf: 0, and1: 0, bonusFta: 0, bonusFtm: 0 }];
  const famRow = (k, src, play) => { const key = play ?? src; const m2 = famMap[k]; return (m2[key] ??= { key, family: src, play: play ?? null, fga: 0, fgm: 0, fgPts: 0, ftPts: 0, pts: 0, fta: 0, ftm: 0, fin: 0, sf: 0, and1: 0, ast: 0, moved: 0, q: [0, 0, 0] }); };
  const noteFin = (k, e, f) => { if (e.fin == null) return; const key = e.fin; if (!finSeen[k].has(key)) { finSeen[k].add(key); f.fin++; finTeam[k]++; } };
  const addPts = (k, pts, seg, p) => { sc[k] += pts; if (p >= 1) { while (periodPts.length < p) periodPts.push([0, 0]); periodPts[p - 1][k] += pts; } if (!seg) return; for (const id of seg.lineups[k]) byId[id].pm += pts; for (const id of seg.lineups[1 - k]) byId[id].pm -= pts; const qe = quint(k, seg); qe.pf += pts; quint(1 - k, seg).pa += pts; };
  const perSeg = new Map();
  for (const e of evs) {
    const seg = e.sg >= 0 ? m.segments[e.sg] : null; const qk = seg && e.tm != null && (e.ty === 'shot' || e.ty === 'ft' || e.ty === 'tov' || e.ty === 'reb') ? quint(e.tm, seg) : null;
    if (e.ty === 'period') { while (periodPts.length < e.p) periodPts.push([0, 0]); }
    if (e.ty === 'shot') {
      const r = byId[e.pl]; const z = r.zones[e.zone]; z.a += 1; z.q[e.q] += 1; z.byPeriod[e.p] = z.byPeriod[e.p] ?? [0, 0]; z.byPeriod[e.p][0] += 1;
      const three = e.zone === 'three'; if (three) r.fg3a++; else r.fg2a++; qk.fga++; if (three) qk.fg3a++;
      const f = famRow(e.tm, e.src, attributedPlay(e)); f.fga++; f.q[e.q]++; if (e.moved) f.moved++; noteFin(e.tm, e, f); fdn[e.tm].fga++;
      if (e.made) { z.m += 1; z.byPeriod[e.p][1] += 1; if (three) { r.fg3m++; qk.fg3m++; } else r.fg2m++; qk.fgm++; r.pts += e.pts; r.fgPts += e.pts; f.fgm++; f.fgPts += e.pts; f.pts += e.pts; fdn[e.tm].fgm++; fdn[e.tm].fgPts += e.pts; addPts(e.tm, e.pts, seg, e.p); if (e.and1) { f.and1++; fdn[e.tm].and1++; } if (e.passer) { byId[e.passer].astC++; f.ast++; qk.ast++; } }
      else if (e.blk) { byId[e.blk].blk++; r.blkAgainst++; quint(1 - e.tm, seg).blk++; }
    } else if (e.ty === 'ft') {
      const r = byId[e.pl]; r.fta++; qk.fta++; const f = famRow(e.tm, e.src ?? 'bonus_sin_familia', attributedPlay(e)); f.fta++; fdn[e.tm].fta++; noteFin(e.tm, e, f); if (e.cause === 'bonus') fdn[e.tm].bonusFta++;
      if (e.made) { r.ftm++; qk.ftm++; r.pts += 1; r.ftPts += 1; f.ftm++; f.ftPts += 1; f.pts += 1; fdn[e.tm].ftm++; fdn[e.tm].ftPts++; if (e.cause === 'bonus') fdn[e.tm].bonusFtm++; addPts(e.tm, 1, seg, e.p); }
      if (e.assist) { byId[e.assist].astL++; }
    } else if (e.ty === 'tov') {
      if (e.pl) byId[e.pl].tov++; else teamLine[e.tm].teamTov++; qk.tov++;
      if (e.stl) { byId[e.stl].stl++; quint(1 - e.tm, seg).stl++; }
    } else if (e.ty === 'reb') {
      if (e.pl) { const r = byId[e.pl]; if (e.off) r.oreb++; else r.dreb++; } else teamLine[e.tm].teamReb[e.off ? 0 : 1]++;
      qk[e.off ? 'oreb' : 'dreb']++;
    } else if (e.ty === 'foul') { byId[e.pl].pf++; if (e.drawn) byId[e.drawn].pfd++; }
    else if (e.ty === 'shootfoul') { byId[e.pl].pf++; byId[e.victim].pfd++; }
    if (e.ty === 'shootfoul') { const f = famRow(1 - e.tm, e.src, attributedPlay(e)); f.sf++; fdn[1 - e.tm].sf++; noteFin(1 - e.tm, e, f); }
    if (seg && !lean) perSeg.set(e.sg, [sc[0], sc[1]]);
  }
  // evolución compacta: marcador al final de cada tramo (o del prefijo) con sus quintetos
  if (!lean) for (const s of segs) { const d = clip(s); evolution.push({ n: s.n, t: r1(s.start + d), p: s.period, score: perSeg.get(s.n) ?? evolution[evolution.length - 1]?.score ?? [0, 0], lineups: s.lineups.map((l) => l.slice().sort().join('|')) }); }
  for (const r of players) { r.min = r1(r.sec / 60); r.fg = r.fg2m + r.fg3m; r.fga = r.fg2a + r.fg3a; r.ast = r.astC + r.astL; r.reb = r.oreb + r.dreb; r.val = r.pts + r.reb + r.ast + r.stl + r.blk + r.pfd - (r.fga - r.fg) - (r.fta - r.ftm) - r.tov - r.blkAgainst - r.pf; }
  const totals = m.teams.map((t) => { const tl = { ...zeroLine(), teamReb: teamLine[t.idx].teamReb, teamTov: teamLine[t.idx].teamTov }; for (const r of players) if (r.team === t.idx) for (const k of ['sec', 'pts', 'fgPts', 'ftPts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'astC', 'astL', 'tov', 'stl', 'blk', 'blkAgainst', 'pf', 'pfd']) tl[k] += r[k]; tl.min = r1(tl.sec / 60); tl.fga = tl.fg2a + tl.fg3a; tl.fgm = tl.fg2m + tl.fg3m; tl.ast = tl.astC + tl.astL; tl.reb = tl.oreb + tl.dreb + tl.teamReb[0] + tl.teamReb[1]; return tl; });
  const exposure = {}; for (const s of segs) { const d = clip(s); if (d <= 0) continue; for (const k of [0, 1]) for (const [id, slot] of Object.entries(s.slots[k])) { const e = (exposure[id] ??= { slotSec: {}, roleSec: {}, defRoleSec: {} }); e.slotSec[slot] = Math.round(((e.slotSec[slot] ?? 0) + d) * 1000) / 1000; const role = m.teams[k].byId[id].offRole; if (role) e.roleSec[role] = Math.round(((e.roleSec[role] ?? 0) + d) * 1000) / 1000; const dr = m.teams[k].byId[id].defRole; if (dr) e.defRoleSec[dr] = Math.round(((e.defRoleSec[dr] ?? 0) + d) * 1000) / 1000; } }
  // La exposición de módulos distingue DOS operaciones: la finalización (módulos organizados/transición/espontáneo) y el avance presionado (C04-04: FAM:press_break, PRESS y organización). `modules` es la suma que consume el
  // aprendizaje y `moduleOps` conserva la identidad de cada operación para que ninguna se observe dos veces como una sola.
  const modules = moduleExposure(m, evs); const press = pressExposure(m, segs, T, controlsReached);
  for (const id of Object.keys(exposure)) { const a = modules[id] ?? {}; const b = press.byPlayer[id] ?? {}; const sum = { ...a }; for (const [k, v] of Object.entries(b)) sum[k] = Math.round(((sum[k] ?? 0) + v) * 1e6) / 1e6; if (Object.keys(sum).length) { exposure[id].modules = sum; exposure[id].moduleOps = { finalization: a, press: b }; } }
  const { den: assistDen, funnel: assistFun } = assistTables(evs);
  const periodsReached = periodPts.length; const finished = reachedEnd; const status = m.status === 'error' ? 'error' : finished ? 'finished' : T > 0 || m.segments.length ? 'running' : 'ready';
  // estado observable en el presente: alineación en pista, faltas y bonus desde los hechos; la energía solo para quien tiene autorización (se proyecta a la frontera, no es la del núcleo adelantado)
  const observable = lean ? null : observableAt(m, T, evs, audience, team);
  const planView = (s) => { const pl = s.plans; if (audience === 'diagnostic') return pl; return pl.map((p, k) => (audience === 'own' && k === team ? p : { disposition: p.disposition, defense: p.defense, coverage: p.coverage, pressureHeight: p.pressureHeight })); };
  const chain = m.chain();
  const res = {
    schema: SIM_RESULT_SCHEMA, model: SIM_MODEL, version: SIM_VERSION, coverage: SIM_COVERAGE_ID, statsPolicy: SIM_STATS_POLICY_ID, audience,
    identity: { matchId: m.opts.matchId ?? null, attemptId: m.opts.attemptId ?? null, seed: m.norm.seed, importance: m.norm.importance, inputFingerprint: m.norm.fingerprint, rootInputFingerprint: chain.root, commandFingerprint: chain.commands, contextFingerprint: chain.context, effectiveInputFingerprint: chain.effective, nCommands: chain.nCommands, nContext: chain.nContext, teams: m.teams.map((t) => ({ id: t.id, name: t.name, source: m.norm.teams[t.idx].sourceTeam })), simProfile: m.ctx.sp.id, simProfileFingerprint: m.ctx.sp.fingerprint, tablesFingerprint: m.ctx.T.fingerprint, detailedProfile: m.ctx.sp.detailedProfileId, ignoredInput: m.norm.ignored },
    status, error: m.error, published: r1(T), ...(audience === 'diagnostic' ? { generatedUntil: r1(m.gt) } : {}), finishedPublished: finished,
    score: { current: sc.slice(), final: finished ? sc.slice() : null, periods: periodPts.map((p) => p.slice()), overtimes: Math.max(0, periodsReached - m.rules.quarters), winner: finished ? (sc[0] > sc[1] ? 0 : 1) : null },
    observable,
    box: { players, teams: totals }, controls,
    segments: segs.map((s) => { const end = Math.min(s.end, T); if (lean) return { n: s.n, start: r1(s.start), end: r1(end), period: s.period, controls: segControls.get(s.n) }; const row = { n: s.n, start: r1(s.start), end: r1(end), period: s.period, lineups: s.lineups, controls: segControls.get(s.n), org: s.org, plans: planView(s), cut: !!s.cut && s.end <= T + 1e-9, partial: s.end > T + 1e-9 }; if (audience === 'diagnostic') { row.secPerControl = s.secPerControl; row.tau = s.tau; row.sigma = s.sigma; row.generatedControls = s.controls; } return row; }),
    zones: ZONES.map((z) => ({ zone: z, teams: [0, 1].map((k) => { let a = 0; let mk = 0; for (const r of players) if (r.team === k) { a += r.zones[z].a; mk += r.zones[z].m; } return { a, m: mk }; }) })),
    families: famMap.map((f) => Object.values(f)),
    familyDenominators: [0, 1].map((k) => ({ controls: controls[k], finalizations: finTeam[k], ...fdn[k] })),
    assistDenominators: assistDen, assistFunnel: assistFun, reboundFunnel: reboundFunnel(evs), pressOps: { opportunities: press.opportunities, byHeight: press.byHeight, sumDelta: press.sumDelta, explicitOpportunities: press.explicitOpportunities, unit: press.unit },
    exposureInfo: { unit: 'segundos de juego (los módulos en operaciones de finalización SIM ponderadas)', provenance: 'intervalos de presencia por tramo hasta el presente publicado; posición = puesto asignado en el quinteto del tramo; rol = rol vigente de la ficha del jugador; módulos desde las finalizaciones publicadas', familias: 'uso de familias y fichas en families[] con denominadores en familyDenominators[] (finalizaciones únicas: tiro, falta de tiro y serie ligada cuentan una vez)' },
    quintets: [...q.values()].map((e) => ({ ...e, sec: Math.round(e.sec * 1000) / 1000, min: r1(e.sec / 60) })), evolution,
  };
  // decisiones de la política del entrenador y comandos recibidos (con su fuente): lo propio para quien autoriza; todo para diagnóstico; nada público
  if (audience !== 'public' && !lean) { const own = (x) => audience === 'diagnostic' || x.team === team; res.decisions = m.coach.log.filter(own); res.commands = m.commandLog.filter(own).map((c) => ({ id: c.id, source: c.source, team: c.team, at: c.at, effectiveAt: c.effectiveAt, change: Object.keys(c.plan), why: c.why?.reason ?? null })); }
  if (audience !== 'public') res.exposure = audience === 'own' ? Object.fromEntries(Object.entries(exposure).filter(([id]) => byId[id].team === team)) : exposure;
  if (audience === 'diagnostic' && includeSuffix) res.privateSuffix = { generatedUntil: r1(m.gt), seconds: r1(m.gt - T), segments: m.segments.length - segs.length, events: m.events.length - evs.length, generatedScore: m.score.slice(), note: 'sufijo generado por delante del presente publicado: privado y sin consecuencias' };
  if (analysis) res.analysis = buildAnalysis({ segs, evs, T, audience, team });
  if (withEvents) res.events = evs;
  res.sportFingerprint = sportDigest({ norm: m.norm, score: sc, events: m.events, published: T });
  if (reconcile) res.reconciliation = reconcileResult(m, res, evs);
  return res;
}

// Estado observable del presente `T` desde los hechos comprometidos (no desde el núcleo). Energía proyectada por tramo (lineal dentro del tramo con la tasa guardada) solo para autorizados.
export function observableAt(m, T, evs, audience, team) {
  const segs = m.segments; let cur = null; for (const s of segs) { if (s.start <= T + 1e-9) cur = s; else break; }
  cur ??= segs[0] ?? null;
  // faltas de equipo del periodo en curso: contador causal del hecho (arrastra a las prórrogas); se reinicia en cada cuarto reglamentario
  const fouls = {}; const periodFouls = [0, 0]; let lastPeriod = 1;
  for (const e of evs) { if (e.ty === 'period') { lastPeriod = e.p; if (e.p <= m.rules.quarters) { periodFouls[0] = 0; periodFouls[1] = 0; } } else if (e.ty === 'foul' || e.ty === 'shootfoul') { fouls[e.pl] = (fouls[e.pl] ?? 0) + 1; periodFouls[e.tm] = e.tfN ?? periodFouls[e.tm] + 1; } }
  const penalty = m.rules.teamPenaltyAfterFouls;
  const out = { at: Math.round(T * 10) / 10, period: lastPeriod, onCourt: cur ? cur.lineups.map((l) => l.slice()) : null, fouls, periodTeamFouls: periodFouls.slice(), inBonus: periodFouls.map((f) => f >= penalty), excluded: Object.keys(fouls).filter((id) => fouls[id] >= m.rules.foulOut) };
  if (audience !== 'public' && cur) {
    const eAt = (k) => m.teams[k].players.map((p, i) => { const e0 = cur.e0?.[k]?.[i]; if (e0 == null) return [p.id, null]; const dt = Math.max(0, Math.min(cur.end, T) - cur.start); const v = Math.min(m.S.energy.range[1], Math.max(m.S.energy.range[0], e0 + cur.er[k][i] * dt)); return [p.id, Math.round(v * 100) / 100]; });
    out.energy = Object.fromEntries([0, 1].filter((k) => audience === 'diagnostic' || k === team).flatMap((k) => eAt(k)));
    out.energyNote = 'proyectada a la frontera publicada (no es la energía del núcleo adelantado)';
  } else if (audience !== 'public' && !cur) out.energy = Object.fromEntries(m.teams.flatMap((t) => (audience === 'diagnostic' || t.idx === team ? t.players.map((p) => [p.id, p.energy]) : [])));
  return out;
}
