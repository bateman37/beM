// Generador estadístico por tramos (SIM-MOTOR-01). Unidad de resolución: un tramo con quintetos estables. Sobre un presupuesto conjunto de controles se generan flujos agregados
// (multinomiales de categorías terminales, reparto de celdas de finalización, cadenas de rebote ofensivo) y después se materializan sus registros con participantes e instantes.
// No usa el resolutor detallado ni simula posesiones, pases o desplazamientos. Sin DOM, reloj de pared ni estado global: cada encuentro posee su flujo de azar y su estado.
import { Rng } from './rng.js';
import { ATTR_ORDER } from './profile.js';
import { SIM_MODEL, SIM_RESULT_SCHEMA, SIM_VERSION } from './version.js';
import { normalizeInput } from './adapt.js';
import { lineupView, defenseAssignment, attackModel, finishPace, shotCells, finisherWeights, shotProbs, blockProb, reboundModel, assistModel, passAbility, ftProb, severity, ea, recipe } from './model.js';
import { consistencySigmaAt, enduranceFactorAt } from '../match/formulas.js';
import { clamp } from '../match/mathx.js';

const SLOTS = ['PG', 'SG', 'SF', 'PF', 'C'];
const r1 = (x) => Math.round(x * 10) / 10;
const GUARD_CHAIN = 6;
// Capacidades en un objeto de forma fija (mismas 32 claves, mismo orden): lectura rápida y monomórfica en las recetas.
const mkAb = (a) => ({ TEC01: a.TEC01, TEC02: a.TEC02, TEC03: a.TEC03, TEC04: a.TEC04, TEC05: a.TEC05, TEC06: a.TEC06, TEC07: a.TEC07, TEC08: a.TEC08, TEC09: a.TEC09, TEC10: a.TEC10, TEC11: a.TEC11, TEC12: a.TEC12, TEC13: a.TEC13, TEC14: a.TEC14, TEC15: a.TEC15, TEC16: a.TEC16, TEC17: a.TEC17, TEC18: a.TEC18, FIS01: a.FIS01, FIS02: a.FIS02, FIS03: a.FIS03, FIS04: a.FIS04, FIS05: a.FIS05, FIS06: a.FIS06, FIS07: a.FIS07, MEN01: a.MEN01, MEN02: a.MEN02, MEN03: a.MEN03, MEN04: a.MEN04, MEN05: a.MEN05, MEN06: a.MEN06, MEN07: a.MEN07 });


export class SimMatch {
  static created = 0; static finished = 0; // contadores de proceso para el informe de pruebas (no afectan al deporte)
  constructor(input, ctx, opts = {}) {
    SimMatch.created += 1;
    this.ctx = ctx; const { sp, T } = ctx; this.S = sp.v; this.T = T;
    this.norm = normalizeInput(input, sp, T);
    this.opts = opts; this.rng = new Rng(this.norm.seed);
    this.events = []; this.segments = []; this.seq = 0; this.gt = 0; this.period = 1; this.status = 'ready'; this.error = null;
    this.published = 0; this.publishedPeriods = 0; this.score = [0, 0]; this.periodScore = [[0, 0]]; this.teamFouls = [[0, 0]]; this.controlTeam = 0;
    this.orders = []; this.appliedOrders = []; this.orderLog = []; this.pendingFrac = 0;
    this.rules = this.S.rules; this.periodStart = 0; this.periodLen = this.rules.quarterSeconds;
    this.teams = this.norm.teams.map((t, ti) => this._buildTeam(t, ti));
    this.sides = this.teams.map((t) => ({ idx: t.idx, plan: t.plan, onCourt: [], view: null, assign: null }));
    this.fam = this.teams.some((t) => t.players.some((p) => p.kn && p.kn.mode === 'explicit'));
    for (const o of input.orders ?? []) this._queueOrder(o, true);
    this._startLineups(); this.status = 'running';
  }

  _buildTeam(t, ti) {
    const S = this.S; const plan = t.plan; plan.directorPriority ??= [];
    const players = t.players.map((p) => ({
      id: p.id, team: ti, name: p.name ?? p.id, ab: mkAb(p.abilities), abv: Float64Array.from(ATTR_ORDER, (a) => p.abilities[a]), age: p.age ?? null, height: p.heightCm, wingspan: p.wingspanCm, init: p.initiative, voc: p.finishingVocation, zp: p.zonePreference,
      kn: p.knowledge ?? null, offRole: p.offensiveRole?.code ?? null, defRole: p.defensiveRole?.code ?? null, positions: p.positions,
      energy: p.state.energy, form: p.state.form ?? 0, M: { TIR: p.state.M_TIR ?? 0, OFE: p.state.M_OFE ?? 0, DEF: p.state.M_DEF ?? 0 }, available: p.state.available !== false,
      fouls: 0, out: false, onCourt: false, slot: null, courtSince: 0, benchSince: 0, minutes: 0, sev: 0, lastMoment: 0, slotMin: {}, roleMin: {},
    }));
    return { idx: ti, id: t.id, name: t.name, plan, players, byId: Object.fromEntries(players.map((p) => [p.id, p])), T0: plan.initialTeamMoment ?? 0, tLast: 0 };
  }
  _startLineups() {
    for (const t of this.teams) { for (const s of SLOTS) { const p = t.byId[t.plan.starters[s]]; p.onCourt = true; p.slot = s; p.courtSince = 0; } }
    this._lineupSnapshot(0);
  }
  _lineupSnapshot() { for (const t of this.teams) this.sides[t.idx].onCourt = SLOTS.map((s) => ({ slot: s, pl: t.players.find((p) => p.onCourt && p.slot === s) })).filter((e) => e.pl); }

  // ------------------------------------------------------------------------------------------------------------------------ órdenes (plan) en fronteras canónicas
  _queueOrder(o, fromInput = false) {
    const team = typeof o.team === 'number' ? o.team : this.teams.findIndex((t) => t.id === o.team);
    if (team < 0) throw new Error(`orden con equipo desconocido: ${o.team}`);
    const allowed = ['styles', 'disposition', 'defense', 'coverage', 'pressureHeight', 'defStyles', 'playbook', 'midrange'];
    for (const k of Object.keys(o.plan ?? {})) if (!allowed.includes(k)) throw new Error(`la orden SIM solo admite cambios de ${allowed.join(', ')} (no ${k})`);
    this.orders.push({ at: o.at, team, plan: JSON.parse(JSON.stringify(o.plan)), id: this.orders.length + 1, fromInput });
  }
  // Una orden futura entra en la siguiente frontera canónica admitida; devuelve su instante efectivo. No regenera el prefijo ni consume azar.
  submit(o) {
    if (this.status === 'finished' || this.status === 'error') return { ok: false, error: 'el encuentro ya terminó' };
    const at = Math.max(o.at ?? this.published, this.published, this.gt >= (o.at ?? 0) ? this.gt : 0);
    this._queueOrder({ ...o, at }); const eff = this.nextBoundaryAtOrAfter(at); return { ok: true, effectiveAt: eff, requestedAt: o.at ?? this.published };
  }
  nextBoundaryAtOrAfter(at) { if (at <= this.gt) return this.gt; const open = this.segments.length ? this.segments[this.segments.length - 1] : null; return open && open.end >= at ? open.end : at; }
  _applyOrders() {
    for (const o of this.orders) {
      if (o.applied || o.at > this.gt + 1e-9) continue;
      const t = this.teams[o.team]; const before = {}; for (const k of Object.keys(o.plan)) { before[k] = JSON.parse(JSON.stringify(t.plan[k])); t.plan[k] = JSON.parse(JSON.stringify(o.plan[k])); }
      delete t.plan._c; this.sides[o.team].plan = t.plan; o.applied = true; o.effective = this.gt;
      this._push({ ty: 'plan', tm: o.team, change: Object.keys(o.plan), order: o.id });
    }
  }

  // ------------------------------------------------------------------------------------------------------------------------ eventos
  _push(e) { e.i = this.seq++; e.t = r1(e.tAbs ?? this.gt); e.p = this.period; e.sg = this.segments.length - 1; delete e.tAbs; this.events.push(e); return e; }

  // ------------------------------------------------------------------------------------------------------------------------ rotación básica (política del entrenador del plan)
  _utility(pl, slot) { const w = this.S.rotation.slotAbilityWeights[slot]; let s = 0; for (const a in w) s += w[a] * ea(this.S, pl, a, this.S.rotation.utilityMaxEnergyPenalty); return s; }
  _rotate(t) {
    const S = this.S; const pol = this.T.coachPolicies[t.plan.coach?.policy ?? 'ENTREF02'] ?? this.T.coachPolicies.ENTREF02; const fb = this.T.foulBook;
    const left = this.periodStart + this.periodLen - this.gt; const margin = this.score[t.idx] - this.score[1 - t.idx];
    const bench = () => t.players.filter((p) => !p.onCourt && !p.out && p.available);
    const outs = []; const ins = [];
    const pairs = new Map((t.plan.participation?.pairs ?? []).map((x) => [x.slot, x]));
    const elapsed = Math.max(1, this.gt);
    for (const slot of SLOTS) {
      const cur = t.players.find((p) => p.onCourt && p.slot === slot);
      const cands = bench().filter((p) => !ins.includes(p));
      let reason = null;
      if (!cur) reason = 'vacante';
      else if (cur.out || !cur.available) reason = 'exclusion';
      else {
        const stint = this.gt - cur.courtSince;
        const trouble = (this.period === 1 && cur.fouls >= 2) || (this.period === 2 && cur.fouls >= 3) || (this.period === 3 && cur.fouls >= 4) || (this.period === 4 && cur.fouls >= 4 && left > pol.closingWindow);
        const closeKeep = this.period >= 4 && cur.fouls >= 4 && left <= pol.closingWindow;
        if (trouble && !closeKeep) reason = 'faltas';
        else if (cur.energy < pol.criticalEnergyReview) reason = 'energia_critica';
        else if (cur.energy < pol.energyReview && stint >= pol.minCourtStint) reason = 'energia';
        else if (stint >= pol.maxOrdinaryStintReview) reason = 'tramo_largo';
        else { const pr = pairs.get(slot); if (pr && cur.id === pr.relief) { const st = t.byId[pr.starter]; if (st && !st.onCourt && !st.out && st.available && st.energy >= pol.benchReadyEnergy && this.gt - st.benchSince >= pol.minBenchStint && stint >= pol.minCourtStint && st.minutes < (pr.starterMinutes / 40) * elapsed - 0) reason = 'retorno_titular'; } }
      }
      if (!reason) continue;
      const ready = cands.filter((p) => (reason === 'exclusion' || reason === 'vacante' || reason === 'energia_critica') ? true : (p.energy >= pol.benchReadyEnergy && this.gt - p.benchSince >= pol.minBenchStint) || (p.minutes === 0 && p.energy >= pol.benchReadyEnergy));
      if (!ready.length) { if (reason === 'exclusion') { cur.onCourt = false; cur.slot = null; outs.push(cur); } continue; } // sin sustitutos: inferioridad con los jugadores reales
      let best = null; let bu = -Infinity;
      const pr = pairs.get(slot);
      for (const c of ready) { let u = this._utility(c, slot); if (pr && (c.id === pr.starter || c.id === pr.relief)) u += 0.5 * 0; if (u > bu + 1e-9) { bu = u; best = c; } }
      if (pr) { const pref = ready.find((c) => c.id === (cur?.id === pr.starter ? pr.relief : pr.starter)); if (pref && this._utility(pref, slot) >= bu - 1) best = pref; }
      if (cur && reason !== 'exclusion' && reason !== 'energia_critica' && reason !== 'vacante') {
        const tol = reason === 'faltas' ? pol.foulProtectionSacrifice : reason === 'energia' ? pol.fatigueUtilitySacrifice : reason === 'retorno_titular' ? pol.fatigueUtilitySacrifice : pol.replacementGain;
        if (this._utility(best, slot) + tol < this._utility(cur, slot)) continue;
      } else if (cur && reason === 'energia_critica' && this._utility(best, slot) + S.rotation.criticalReplacementTolerance < this._utility(cur, slot)) continue;
      if (cur) { cur.onCourt = false; cur.slot = null; cur.benchSince = this.gt; outs.push(cur); }
      best.onCourt = true; best.slot = slot; best.courtSince = this.gt; ins.push(best);
    }
    if (outs.length || ins.length) this._push({ ty: 'sub', tm: t.idx, out: outs.map((p) => p.id), in: ins.map((p) => p.id) });
  }

  // ------------------------------------------------------------------------------------------------------------------------ un tramo
  _periodBounds() { const q = this.rules.quarters; return this.period <= q ? this.rules.quarterSeconds : this.rules.overtimeSeconds; }
  _nextSegmentLength() {
    const S = this.S; const left = this.periodStart + this.periodLen - this.gt; const late = this.period >= this.rules.quarters;
    let d = late && left <= S.segment.lateWindowSeconds ? S.segment.lateSeconds : S.segment.normalSeconds;
    if (late && left > S.segment.lateWindowSeconds) d = Math.min(d, left - S.segment.lateWindowSeconds);
    d = Math.min(d, left);
    for (const o of this.orders) if (!o.applied && o.at > this.gt + 1e-9 && o.at < this.gt + d) d = o.at - this.gt;
    return d;
  }

  _prepareSides(d) {
    const S = this.S; const T = this.T;
    for (const t of this.teams) for (const p of t.players) p.sev = severity(S, p.energy);
    this._lineupSnapshot();
    for (const t of this.teams) { const s = this.sides[t.idx]; s.plan = t.plan; s.view = lineupView(S, T, s); s.teamT = t.T0 * Math.pow(0.5, this.gt / S.teamMoment.halfLifeSeconds); s.view.teamT = s.teamT; }
    for (const t of this.teams) { const s = this.sides[t.idx]; const r = this.sides[1 - t.idx]; s.assign = defenseAssignment(S, T, s, s.view, r.view, r.plan); }
    this.sides.fam = this.fam; void d;
  }
  _updateMoments(d) {
    const S = this.S; for (const t of this.teams) for (const p of t.players) {
      const hl = p.onCourt ? S.moment.playingHalfLifeSeconds : S.moment.benchHalfLifeSeconds; const dec = Math.pow(0.5, d / hl); const sg = consistencySigmaAt(S, p.ab.MEN06) * Math.sqrt(1 - dec * dec);
      for (const k of ['TIR', 'OFE', 'DEF']) p.M[k] = clamp(p.M[k] * dec + sg * this.rng.normal(), -1, 1);
    }
  }

  // Compila las magnitudes del tramo que empieza en `start` (sin azar): modelos de ataque, celdas de finalización, rebote y asistencia por equipo.
  _compile(start, over = null) {
    const S = this.S; const secLeft = over?.secondsLeft ?? this.periodStart + this.periodLen - start; const period = over?.period ?? this.period;
    const ctx = [0, 1].map((k) => ({ period, secondsLeft: secLeft, margin: over?.margin != null ? (k === 0 ? over.margin : -over.margin) : this.score[k] - this.score[1 - k], importance: over?.importance ?? this.norm.importance }));
    const models = [attackModel(S, this.T, this.sides, 0, ctx[0]), attackModel(S, this.T, this.sides, 1, ctx[1])];
    finishPace(S, models);
    this.sides.forEach((s, k) => { s.putbackCells = null; s.M = models[k]; s.cells = shotCells(S, this.T, this.sides, k, models[k], ctx[k]); s.reb = reboundModel(S, this.T, this.sides, k, models[k]); s.assist = assistModel(S, models[k], s, null, null, s.plan); });
    return models;
  }

  step() { // genera el siguiente tramo completo; devuelve false si el encuentro terminó
    if (this.status === 'finished' || this.status === 'error') return false;
    const S = this.S;
    if (this.gt >= this.periodStart + this.periodLen - 1e-9) { if (!this._closePeriod()) return false; }
    this._applyOrders();
    for (const t of this.teams) this._rotate(t);
    let d = this._nextSegmentLength(); const start = this.gt;
    if (this.segments.length > 4000) { this.status = 'error'; this.error = { cause: 'tope técnico de tramos', phase: 'generación' }; return false; }
    this._prepareSides(d); if (this.segments.length) this._updateMoments(d);
    const seg = { n: this.segments.length, start, end: start + d, period: this.period, lineups: this.teams.map((t) => this.sides[t.idx].onCourt.map((e) => e.pl.id)), first: this.controlTeam, controls: [0, 0], ctlPeriod: this.period };
    seg.org = null; this.segments.push(seg);
    seg.org = this.sides.map((x) => x.assign.orgId); seg.slots = this.teams.map((t) => Object.fromEntries(this.sides[t.idx].onCourt.map((en) => [en.pl.id, en.slot]))); seg.plans = this.teams.map((t) => ({ disposition: t.plan.disposition, defense: t.plan.defense, coverage: t.plan.coverage, pressureHeight: t.plan.pressureHeight, styles: { ...t.plan.styles }, defStyles: { ...t.plan.defStyles }, midrange: t.plan.midrange }));
    const models = this._compile(start);
    const common = S.volume.commonRhythmFactorBounds[0] + this.rng.next() * (S.volume.commonRhythmFactorBounds[1] - S.volume.commonRhythmFactorBounds[0]);
    const E = d / (models[0].secPerControl + models[1].secPerControl) * common;
    const N = this.rng.roundUnbiased(2 * E);
    const n = [0, 0]; for (let j = 0; j < N; j++) n[(this.controlTeam + j) % 2] += 1;
    seg.controls = n.slice(); seg.common = common; seg.E = E; seg.secPerControl = models.map((m) => m.secPerControl); seg.tau = models.map((m) => m.tau); seg.sigma = models.map((m) => m.sigma);
    const times = []; for (let j = 0; j < N; j++) times.push(this.rng.next()); times.sort((a, b) => a - b);
    // registros por equipo (todos los sorteos de producción se consumen aquí, en orden fijo equipo 0, equipo 1)
    const recs = [this._genAttacks(0, n[0]), this._genAttacks(1, n[1])];
    // línea temporal: el control j pertenece al equipo (first + j) % 2 y toma el registro correspondiente en orden
    const idx = [0, 0]; const timeline = [];
    for (let j = 0; j < N; j++) { const k = (this.controlTeam + j) % 2; const rec = recs[k][idx[k]++]; timeline.push({ rec, k, t: start + times[j] * d }); }
    const cut = this._materialize(timeline, seg, start, d);
    const endT = cut != null ? cut : start + d; seg.end = endT; seg.cut = cut != null;
    this._finishSegment(seg, start, endT - start, models);
    if (cut == null) this.controlTeam = (this.controlTeam + N) % 2; else { const done = timeline.filter((x) => x.t <= cut).length; this.controlTeam = (this.controlTeam + done) % 2; seg.controls = [0, 1].map((k) => timeline.filter((x) => x.t <= cut && x.k === k).length); }
    this.gt = endT;
    return true;
  }

  // ------------------------------------------------------------------------------------------------------------------------ generación de ataques de un equipo (flujos agregados)
  _genAttacks(k, n) {
    const rng = this.rng; const s = this.sides[k]; const M = s.M; const probs = M.termOrder.map((key) => M.term[key]);
    const counts = rng.multinomial(n, probs); const recs = [];
    M.termOrder.forEach((key, i) => { for (let j = 0; j < counts[i]; j++) recs.push({ kind: key, k, chain: [], dn: [] }); });
    rng.shuffle(recs);
    const nDn = rng.binomial(n, Math.min(1, M.dnRatio)); for (let j = 0; j < nDn; j++) { const r = recs[rng.weighted(recs.map(() => 1))]; if (r) r.dn.push({ kind: 'dn' }); }
    for (const r of recs) this._resolve(r, k, 0, false);
    return recs;
  }
  _sampleCell(s, putback) { const cells = s.cells; if (!putback) return cells[this.rng.weightedBy(cells, 'w')]; const sub = s.putbackCells ??= cells.filter((c) => c.cell.zone === 'rim' || c.cell.zone === 'inside'); return sub[this.rng.weightedBy(sub, 'w')] ?? cells[0]; }
  // Resuelve un registro terminal: pérdidas, faltas de tiro y tiros de campo con sus créditos, rebotes y continuaciones por rebote ofensivo.
  _resolve(rec, k, depth, putback) {
    const rng = this.rng; const S = this.S; const T = this.T; const s = this.sides[k]; const o = this.sides[1 - k]; const M = s.M; const A = s.view.players; const Dp = o.view.players;
    const kind = rec.kind;
    if (kind === 'to' || kind === 'lb' || kind === 'of' || kind === 'bv') {
      const who = A[rng.weighted(kind === 'of' ? M.ofW : M.toW)];
      const t = { ty: 'tov', tm: k, pl: who.id, kind, stl: null, sub: null };
      if (kind === 'to' || kind === 'lb') { if (rng.bernoulli(M.pSteal)) { t.sub = 'steal'; t.stl = Dp[rng.weighted(M.stealW)].id; } else t.sub = rng.bernoulli(M.pStealOob) ? 'out_of_bounds' : 'bad_pass'; }
      else if (kind === 'of') t.sub = 'offensive_foul'; else t.sub = 'violation';
      rec.ev = t; rec.chain.push({ t }); return;
    }
    // tiro de campo o falta en el tiro
    const cell = this._sampleCell(s, putback); const c = cell.cell; const play = c.playId ? T.plays[c.playId] : null;
    const fw = finisherWeights(S, T, s.view, play, cell.kind === 'play' ? { ...c, kind: 'play' } : c, s.plan); const fi = rng.weightedBy(fw, 'w'); if (fi < 0) throw new Error(`sin finalizadores: lu=${s.view.lu.length} dir=${s.view.director?.id} ${JSON.stringify({ c, fw: fw.map((x) => [x.pl.id, x.w]), kind: cell.kind })}`); const shooter = fw[fi].pl;
    const q = rng.weighted([cell.q.comfortable, cell.q.normal, cell.q.forced]);
    const moved = putback ? false : (cell.kind === 'play' ? c.moved : rng.bernoulli(c.movedShare));
    let passer = null; const passable = putback ? false : cell.kind === 'play' ? c.exec === 'pass' : rng.bernoulli(c.passShare);
    if (passable && rng.bernoulli(s.assist.p)) { const others = A.filter((p) => p !== shooter); const ws = others.map((p) => Math.max(0.05, passAbility(S, p) / S.neutralAbility)); passer = others[rng.weighted(ws)]?.id ?? null; }
    const src = putback ? 'putback' : cell.kind === 'play' ? c.family : cell.kind === 'trans' ? 'transition' : 'spontaneous';
    const zone = c.zone; const base = { ty: 'shot', tm: k, pl: shooter.id, zone, q, src, play: c.playId ?? null, moved, passer, blk: null, made: false, and1: false, pts: 0, end: null };
    const info = { cell: { ...c, moved }, kind: cell.kind };
    const sp = shotProbs(S, T, this.sides, k, M, info, shooter, q);
    if (kind === 'sf') {
      const made = rng.bernoulli(sp.p); const nFt = zone === 'three' ? 3 : 2;
      if (made) { // canasta con falta: el tiro cuenta y se añade un libre ligado
        base.made = true; base.and1 = true; base.pts = S.shots[zone].points; const sh = this._pushShotRec(rec, base);
        rec.chain.push({ foul: { ty: 'shootfoul', tm: 1 - k, zone, victim: shooter.id, src, play: c.playId ?? null, and1: true } }); this._ftSeries(rec, k, shooter, 1, 'and1', sh, passer, s, putback);
      } else { // fallo con falta de tiro: sin intento de campo, libres del tirador
        const f = { ty: 'shootfoul', tm: 1 - k, zone, victim: shooter.id, src, play: c.playId ?? null }; rec.chain.push({ foul: f }); this._ftSeries(rec, k, shooter, nFt, 'shooting', f, passer, s, putback);
      }
      return;
    }
    // intento de campo
    const bl = blockProb(S, T, this.sides, k, M, shooter, zone, rng);
    if (rng.bernoulli(bl.p)) { base.blk = bl.blocker.id; base.end = null; }
    const made = base.blk == null && rng.bernoulli(sp.p); base.made = made; if (made) base.pts = S.shots[zone].points;
    const shot = this._pushShotRec(rec, base);
    if (made) return;
    // oportunidad de rebote o causa terminal explícita
    if (base.blk != null && rng.bernoulli(S.block.outOfBoundsGivenBlock)) { shot.ev.end = 'block_out_of_bounds'; return; }
    this._rebound(rec, k, shooter, zone, shot, base.blk != null ? 'block' : 'field', depth);
  }
  _pushShotRec(rec, base) { const sh = { ev: base }; rec.chain.push({ shot: sh }); return sh; }
  _ftSeries(rec, k, shooter, n, cause, ref, passer, s, putback) {
    const o = this.sides[1 - k]; const M = s.M; const p = ftProb(this.S, shooter, M, o); const ev = []; let anyMade = false;
    for (let j = 0; j < n; j++) { const made = this.rng.bernoulli(p); anyMade ||= made; ev.push({ ty: 'ft', tm: k, pl: shooter.id, made, k: j + 1, n, cause, pts: made ? 1 : 0 }); }
    const series = { ft: ev, ref, passer: cause === 'shooting' ? passer : null, anyMade, k }; rec.chain.push({ series });
    if (!ev[n - 1].made) this._rebound(rec, k, shooter, 'ft', series, 'ft', 1);
  }
  _rebound(rec, k, shooter, zone, parent, cause, depth) {
    const rng = this.rng; const s = this.sides[k]; const o = this.sides[1 - k]; const R = s.reb; const S = this.S;
    let p = cause === 'ft' ? R.pFt : cause === 'block' ? reboundBlocked(S, R) : R.pField;
    const off = rng.bernoulli(p); let pl = null;
    const part = off ? R.offP.slice() : R.defP.slice(); if (off && (zone === 'rim' || zone === 'inside') && S.rebound.addShooterIfNearRim && !part.includes(shooter)) part.push(shooter);
    if (part.length) { const capt = R.capt; const ws = part.map((x) => Math.max(0.05, capt(x))); pl = part[rng.weighted(ws)]; }
    const ev = { ty: 'reb', tm: off ? k : 1 - k, off, pl: pl?.id ?? null, cause };
    rec.chain.push({ reb: ev, parent });
    if (off && depth < GUARD_CHAIN) { const kinds = s.M.termOrder; const kind = kinds[rng.weighted(kinds.map((x) => s.M.term[x]))]; const child = { kind, k, chain: [], dn: [] }; this._resolve(child, k, depth + 1, true); rec.chain.push({ child }); }
  }
}

function reboundBlocked(S, R) { const p = 1 - S.block.blockedLooseControlDefenseProbability; const sens = S.rebound.sensitivity; const z = Math.log(p / (1 - p)) + sens * (R.RA - R.RD); return 1 / (1 + Math.exp(-z)); }
