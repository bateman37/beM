// Mundo pequeño y real de laboratorio (§9.3): las doce plantillas existentes forman dos competiciones sénior ficticias de seis equipos y una competición Sub-20 de cuatro equipos (doce fichas por equipo de
// cantera, copias identificadas con edades 16–18). Calendario corto de ida y vuelta, resultados, clasificación, una cantera propia que siempre usa SIM, un movimiento administrativo de jugador a mitad de
// calendario y cierre/apertura de temporada conservando el histórico. NO es mercado, negociación ni calendario mundial: son operaciones de prueba que acreditan los contratos que necesitarán esos sistemas.
// Los acumulados proceden de partidos realmente generados y registrados.
import { SimMatch } from '../sim/engine.js';
import '../sim/materialize.js';
import { buildSimResult } from '../sim/result.js';
import { buildSimEssential } from '../sim/essential.js';
import { deriveSeed } from '../sim/rng.js';
import { referenceTeamMap } from '../sim/teams.js';
import { validateSimInput } from '../sim/adapt.js';
import { youthTeam, buildTeamsInput } from '../matchday/scenario.js';
import { computeTable } from '../matchday/standings.js';
import { createEncounter } from '../engine/index.js';
import { SeasonLedger } from './ledger.js';

const deep = (x) => JSON.parse(JSON.stringify(x));
export const DEPTHS = ['reference', 'analysis', 'directed']; // Referencia / Simulada (análisis) / Dirigible
// Calendario de ida y vuelta (método del círculo): rondas de pares [local, visitante].
export function roundRobin(teams, double = true) {
  const t = teams.slice(); if (t.length % 2) t.push(null); const n = t.length; const rounds = [];
  for (let r = 0; r < n - 1; r++) { const pairs = []; for (let i = 0; i < n / 2; i++) { const a = t[i]; const b = t[n - 1 - i]; if (a && b) pairs.push(r % 2 ? [b, a] : [a, b]); } rounds.push(pairs); t.splice(1, 0, t.pop()); }
  return double ? [...rounds, ...rounds.map((p) => p.map(([a, b]) => [b, a]))] : rounds;
}
function scrub(v, id) { if (Array.isArray(v)) return v.filter((x) => !(x === id || (x && typeof x === 'object' && Object.values(x).includes(id)))).map((x) => scrub(x, id)); if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === id ? null : scrub(x, id)])); return v; }

export class SeasonWorld {
  constructor({ profile, players, ctx, season = 'T1', master = 20261022, own = 'EQ01', depths = { 'SEN-A': 'analysis', 'SEN-B': 'reference', SUB20: 'reference' } }) {
    this.profile = profile; this.ctx = ctx; this.season = season; this.master = master; this.own = own; this.depths = { ...depths }; this.history = {};
    const tm = referenceTeamMap(profile, players); this.teams = new Map(Object.entries(tm));
    for (const id of ['EQ01', 'EQ02', 'EQ03', 'EQ04']) { const y = youthTeam(tm[id]); this.teams.set(y.id, y); }
    this.comps = { 'SEN-A': { teams: ['EQ01', 'EQ02', 'EQ03', 'EQ04', 'EQ05', 'EQ06'] }, 'SEN-B': { teams: ['EQ07', 'EQ08', 'EQ09', 'EQ10', 'EQ11', 'EQ12'] }, SUB20: { teams: ['EQ01U', 'EQ02U', 'EQ03U', 'EQ04U'], youth: true } };
    this.directedFrom = null; this.openSeason(season, true);
  }
  openSeason(season, first = false) {
    this.season = season; this.round = 0; this.results = new Map(); this.log = [];
    if (first || !this.ledger) this.ledger = new SeasonLedger();
    this.calendar = Object.fromEntries(Object.entries(this.comps).map(([c, v]) => [c, roundRobin(v.teams)]));
    this.rounds = Math.max(...Object.values(this.calendar).map((r) => r.length)); this.membership = this.membership ?? new Map(); this.directedFrom = null;
    for (const [c, v] of Object.entries(this.comps)) for (const t of v.teams) for (const p of this.teams.get(t).players) { const m = this.membership.get(p.id); if (!m) this.membership.set(p.id, [{ club: t, competition: c, fromRound: 0, season }]); else if (m[m.length - 1].club !== t || m[m.length - 1].season !== season) m.push({ club: t, competition: c, fromRound: 0, season }); }
  }
  setDepth(comp, depth) { if (!DEPTHS.includes(depth)) throw new Error(`profundidad desconocida: ${depth}`); this.depths[comp] = depth; }
  // «Dirigible» del sénior propio: sus encuentros POSTERIORES a `fromRound` usan el detallado; los ya terminados conservan su resolutor histórico.
  direct(fromRound) { this.directedFrom = fromRound; }
  clubAt(player, round, season = this.season) { const m = (this.membership.get(player) ?? []).filter((x) => x.season === season && x.fromRound <= round); return m.length ? m[m.length - 1] : null; }
  matchIdOf(comp, round, home, away) { return `${this.season}|${comp}|R${round}|${home}-${away}`; }
  inputOf(comp, round, home, away) { return buildTeamsInput(this.teams.get(home), this.teams.get(away), { seed: deriveSeed(this.master, this.matchIdOf(comp, round, home, away)), importance: 'ordinary' }); }
  validateRosters() { const errs = []; for (const [id, t] of this.teams) { const other = [...this.teams.values()].find((x) => x.id !== id && x.id[0] !== undefined); const input = buildTeamsInput(t, other.id === id ? [...this.teams.values()][1] : other, { seed: 1 }); const e = validateSimInput(input, this.ctx.sp, this.ctx.T).filter((x) => x.path.startsWith('teams[0]')); if (e.length) errs.push({ team: id, errors: e.slice(0, 5) }); } return errs; }
  // Traspaso ADMINISTRATIVO (sin negociación): la persona conserva su identidad; el club de origen conserva un plan válido (titular sustituido por un suplente, parejas y referencias retiradas) y el de destino lo incorpora al banquillo.
  transfer(playerId, toClub, atRound) {
    if (atRound <= this.round) return { ok: false, reason: `el movimiento debe regir desde una ronda posterior a la ya jugada (${this.round})` };
    const fromId = [...this.teams.values()].find((t) => t.players.some((p) => p.id === playerId))?.id; if (!fromId) return { ok: false, reason: 'jugador desconocido' }; if (!this.teams.has(toClub) || toClub === fromId) return { ok: false, reason: 'club de destino no válido' };
    if (this.directedFrom != null && (fromId === this.own || toClub === this.own)) return { ok: false, reason: 'el sénior dirigido no admite movimientos de prueba' };
    const A = deep(this.teams.get(fromId)); const B = deep(this.teams.get(toClub)); const idx = A.players.findIndex((p) => p.id === playerId); const [pl] = A.players.splice(idx, 1);
    if (A.players.filter((p) => p.state?.available !== false).length < 5) return { ok: false, reason: 'el club de origen quedaría con menos de cinco jugadores disponibles' };
    const changes = []; const slot = Object.entries(A.plan.starters).find(([, id]) => id === playerId)?.[0];
    if (slot) { const starters = new Set(Object.values(A.plan.starters)); const cand = A.players.filter((p) => !starters.has(p.id) && p.state?.available !== false); const best = cand.find((p) => p.positions.includes(slot)) ?? cand[0]; A.plan.starters[slot] = best.id; changes.push({ club: fromId, cambio: `titular ${slot}: ${playerId} → ${best.id}` }); }
    // parejas titular/relevo: si el jugador figuraba en una, otro suplente libre ocupa su sitio (el plan exige cinco parejas funcionales)
    const inPairs = new Set(A.plan.participation?.pairs?.flatMap((q) => [q.starter, q.relief]) ?? []); for (const pr of A.plan.participation?.pairs ?? []) for (const k of ['starter', 'relief']) if (pr[k] === playerId) { const used = new Set([...Object.values(A.plan.starters), ...inPairs]); const cand = A.players.filter((p) => !used.has(p.id) && p.state?.available !== false); const best = cand.find((p) => p.positions.some((x) => (pl.positions ?? []).includes(x))) ?? cand[0]; if (!best) return { ok: false, reason: 'no hay suplente libre para sustituir al jugador en las parejas del plan' }; pr[k] = best.id; inPairs.add(best.id); if (A.plan.participation.situational) A.plan.participation.situational = A.plan.participation.situational.filter((x) => x !== best.id); /* un recurso situacional promovido a pareja deja de serlo */ changes.push({ club: fromId, cambio: `pareja ${pr.slot}: ${k} ${playerId} → ${best.id}` }); }
    const before = JSON.stringify(A.plan); const starters = A.plan.starters; const pairs = A.plan.participation?.pairs; const dp = A.plan.directorPriority; A.plan = scrub(A.plan, playerId); A.plan.starters = starters; if (pairs) A.plan.participation.pairs = pairs; A.plan.directorPriority = (dp ?? []).filter((x) => x !== playerId); if (JSON.stringify(A.plan) !== before) changes.push({ club: fromId, cambio: 'referencias al jugador retiradas del plan' });
    pl.teamId = toClub; B.players.push(pl); this.teams.set(fromId, A); this.teams.set(toClub, B); const compOf = (t) => Object.entries(this.comps).find(([, v]) => v.teams.includes(t))[0];
    this.membership.get(playerId).push({ club: toClub, competition: compOf(toClub), fromRound: atRound, season: this.season }); changes.push({ club: toClub, cambio: `${playerId} se incorpora desde la ronda ${atRound} (banquillo)` });
    return { ok: true, playerId, from: fromId, to: toClub, atRound, changes };
  }
  _play(comp, round, home, away) {
    const matchId = this.matchIdOf(comp, round, home, away); const input = this.inputOf(comp, round, home, away); const depth = this.depths[comp];
    const ownIdx = comp === 'SEN-A' ? [home, away].indexOf(this.own) : -1; const directed = this.directedFrom != null && round > this.directedFrom && ownIdx >= 0 && !this.comps[comp].youth;
    let model; let ess; let analysis = null;
    if (directed) { const enc = createEncounter({ input, profile: this.profile, controlledTeams: [ownIdx], instanceId: matchId }); while (!enc.done) enc.advance({ until: 'step' }); ess = enc.essential(); model = 'detailed'; }
    else { const m = new SimMatch(input, this.ctx, { matchId, attemptId: 1 }); m.finish(); if (depth === 'analysis') analysis = buildSimResult(m, { events: false, reconcile: false }); ess = buildSimEssential(m); model = 'sim'; if (ess.validity?.valid === false) throw new Error(`encuentro ${matchId} no válido: ${ess.validity.failedIds}`); }
    const score = model === 'sim' ? ess.score.final : ess.result.court_score;
    const rec = { matchId, comp, round, home, away, model, depth: directed ? 'directed' : depth, score, essential: ess, analysis }; this.results.set(matchId, rec);
    const clubs = [home, away]; const r = this.ledger.record(ess, { season: this.season, competition: comp, round, clubs: clubs.map((c, i) => this._clubOf(c, round, i)), model, matchId, attemptId: 1 }); rec.recorded = r.ok; return rec;
  }
  _clubOf(team) { return team; }
  playRound(round) {
    if (round !== this.round + 1) throw new Error(`las rondas se juegan en orden (siguiente: ${this.round + 1})`);
    const out = []; for (const [comp, cal] of Object.entries(this.calendar)) { const fx = cal[round - 1]; if (!fx) continue; for (const [h, a] of fx) out.push(this._play(comp, round, h, a)); }
    this.round = round; this.log.push({ round, matches: out.map((r) => [r.matchId, r.model, r.score]) }); return out;
  }
  playUntil(round) { const out = []; while (this.round < round && this.round < this.rounds) out.push(...this.playRound(this.round + 1)); return out; }
  standings(comp, { upTo = this.round } = {}) {
    const base = { artificial: false, rows: this.comps[comp].teams.map((team) => ({ team, w: 0, l: 0, pf: 0, pa: 0 })) };
    const progress = [...this.results.values()].filter((r) => r.comp === comp && r.round <= upTo).map((r) => ({ teams: [r.home, r.away], score: r.score, finished: true, valid: true, started: true, status: 'finished' }));
    return computeTable(base, progress, { mode: 'final' });
  }
  // Estadísticas visibles a la fecha alcanzada (nunca de rondas ya calculadas pero futuras).
  visible(player, upTo = this.round) { return this.ledger.total(player, { season: this.season, upTo }); }
  closeSeason() {
    const tables = Object.fromEntries(Object.keys(this.comps).map((c) => [c, this.standings(c)])); const closed = { season: this.season, rounds: this.round, tables, matches: this.results.size };
    this.history[this.season] = closed; return closed;
  }
  nextSeason(label) { this.round = 0; this.openSeason(label); return { season: label }; }
}
