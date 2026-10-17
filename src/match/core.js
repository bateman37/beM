// Núcleo del encuentro: estado pequeño, reloj, energía, registro de acontecimientos,
// recetas de capacidades efectivas y sorteos con rastro. Sin DOM ni base de datos.
import { createRng } from './rng.js';
import { clamp, interpolate, triangularFromU, round, sigmoid, logit } from './mathx.js';
import { deepCopy, ENGINE_VERSION, SLOTS } from './data.js';
import { toTenths, periodLengthTenths } from './rules.js';
import { assertProfileComplete } from '../profiles/rows.js';
import { createParamTracker } from '../profiles/tracker.js';
import { deepFreeze } from '../profiles/util.js';

export class MatchCore {
  constructor(input, profile, opts = {}) {
    this.opts = { detail: 'full', check: false, track: true, profileRef: null, ...opts };
    // MOTOR-03: configuración efectiva CONGELADA del encuentro. Una fila requerida ausente es un error de configuración
    // identificable, nunca un valor por defecto oculto. La copia no cambia aunque se edite o active otro perfil después.
    assertProfileComplete(profile);
    this.profileData = deepFreeze(deepCopy(profile)); // lo que se exporta y se reproduce
    // Con detalle completo se registran las filas realmente consultadas en cada hecho (diagnóstico); no altera nada.
    this.tracker = this.opts.detail === 'full' && this.opts.track ? createParamTracker(deepCopy(profile)) : null;
    this.profile = this.tracker ? this.tracker.profile : this.profileData;
    this.cfg = this.profile.motor02 ?? null; // extensión SEM de MOTOR-02 (tiempos muertos)
    this.input = deepCopy(input); // copia de entrada congelada (efectiva)
    this.rng = createRng(this.input.seed, profile.rng);
    // `this.input` queda congelada (entrada efectiva exportable); el plan de trabajo se copia y puede cambiar por órdenes activas.
    this.teams = this.input.teams.map((t, i) => ({ idx: i, id: t.id, name: t.name, plan: deepCopy(t.plan), ids: t.players.map((p) => p.id) }));
    this.roleOf = {}; // rol ofensivo vigente por jugador (MOTOR-04): parte del plan, cambia por órdenes en la frontera de entrada; no toca capacidades
    this.pl = {}; // jugadores (no se mutan durante la simulación)
    this.ps = {}; // estado dinámico por jugador
    this.input.teams.forEach((t, ti) => {
      for (const p of t.players) {
        Object.freeze(p.abilities);
        this.pl[p.id] = { ...p, teamIdx: ti, reach: this.reachOf(p) };
        this.roleOf[p.id] = p.offensiveRole.code;
        this.ps[p.id] = {
          energy: p.state.energy, fouls: p.state.fouls ?? 0, available: p.state.available !== false,
          onCourt: false, slot: null, stintTenths: 0, benchTenths: 9999 * 10, locked: false, playedTenths: 0,
        };
      }
    });
    // quintetos
    this.lineup = this.teams.map((t) => ({ ...t.plan.starters }));
    this.lineup.forEach((l, ti) => { for (const s of SLOTS) { const id = l[s]; this.ps[id].onCourt = true; this.ps[id].slot = s; this.ps[id].benchTenths = 0; } });
    this.lineupTable = [];
    this.lineupId = [null, null];
    this.registerLineups();
    // reloj y marcador
    this.period = 0; this.clock = 0; this.shotClock = 0; this.shotClockOn = false; this.clockRunning = true;
    this.score = [0, 0]; this.periodScores = [];
    this.teamFouls = [{}, {}];
    this.arrow = null;
    this.poss = null; this.nextPoss = null; this.possSeq = 0; this.eventSeq = 0; this.possLog = []; this.seriesSeq = 0; // MOTOR-09: registro de posesiones beM (inicio, cierre y causa)
    this.events = []; this.calcBuf = []; this.status = 'created'; this.errors = [];
    this.coverageObserved = {};
    this.oppLog = []; this.throwChains = []; this.chainSeq = 0; // MOTOR-06: decisiones/oportunidades y cadenas de saque (diagnóstico; solo datos calculados)
    this.openingWinner = null;
    // avance incremental (MOTOR-02): fronteras, ventanas reglamentarias pendientes y estado de periodo
    this.stepSeq = 0; this.lastStep = null;
    this.pendingWindows = []; this.periodBreak = null; this.periodStartPending = false; this.pendingFoul = null;
    this.initDirection();
    this.initDefense();
    this.initStates(); // MOTOR-07: Forma, momentos y T (estado deportivo recibido en la entrada)
    this.initCoach(); // MOTOR-08: entrenador automático, delegación, decisiones y memoria defensiva
  }

  reachOf(p) {
    const b = this.profile.body;
    const n = (v, [lo, hi]) => clamp((v - lo) / (hi - lo), 0, 1);
    const [wh, ww] = b.normalizedMix;
    return wh * n(p.heightCm, b.heightRangeCm) + ww * n(p.wingspanCm, b.wingspanRangeCm);
  }

  // ---------- lineups ----------
  registerLineups() {
    for (let t = 0; t < 2; t++) {
      const players = SLOTS.map((s) => this.lineup[t][s]);
      const key = players.join('|');
      const prev = this.lineupTable.filter((l) => l.team === t);
      const found = prev.find((l) => l.key === key);
      if (found) { this.lineupId[t] = found.id; continue; }
      const id = `L${t}-${prev.length + 1}`;
      this.lineupTable.push({ id, team: t, key, slots: { ...this.lineup[t] } });
      this.lineupId[t] = id;
    }
  }
  onCourt(t) { return SLOTS.map((s) => this.lineup[t][s]); }
  slotOf(pid) { return this.ps[pid].slot; }
  oppIdx(t) { return 1 - t; }
  playersAtSlots(t, slots) { return slots.map((s) => this.lineup[t][s]).filter((id) => this.ps[id].available); }

  // ---------- azar ----------
  draw(purpose) { return this.rng.next(purpose); }
  // Elige entre opciones {key,w,...}; ordena por clave estable antes del sorteo. Solo w>0.
  pick(items, purpose) {
    const els = items.filter((i) => i.w > 0).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    if (!els.length) return null;
    const total = els.reduce((s, i) => s + i.w, 0);
    const u = this.draw(purpose);
    let acc = 0; let chosen = els[els.length - 1];
    for (const e of els) { acc += e.w / total; if (u < acc) { chosen = e; break; } }
    this.note(`sorteo:${purpose}`, { opciones: els.map((e) => ({ clave: e.key, p: round(e.w / total) })), u: round(u, 6), elegido: chosen.key });
    return chosen;
  }
  bernoulli(p, purpose) {
    const u = this.draw(purpose);
    const ok = u < p;
    this.note(`binaria:${purpose}`, { p: round(p, 5), u: round(u, 6), resultado: ok });
    return ok;
  }
  // Duración triangular [min, moda, max] en segundos -> décimas enteras, truncada a < limit si procede.
  sampleDuration(dist, purpose, { factor = 1, limit = Infinity } = {}) {
    const d = dist.map((x) => x * factor);
    const hiSec = (limit - 1) / 10; // estrictamente antes del límite
    const u = this.draw(purpose);
    const sec = triangularFromU(u, d, hiSec);
    let tenths = Math.max(1, Math.round(sec * 10));
    if (tenths >= limit) tenths = Math.max(1, limit - 1);
    this.note(`duración:${purpose}`, { dist: d, limiteDecimas: limit === Infinity ? null : limit, u: round(u, 6), decimas: tenths });
    return tenths;
  }

  // ---------- registro de detalle ----------
  note(label, data) { if (this.opts.detail === 'full') this.calcBuf.push({ label, ...data }); }

  // ---------- capacidades efectivas ----------
  severity(pid) { return interpolate(this.profile.energy.severityNodes, this.ps[pid].energy); }
  penFor(attr, taskMax) {
    if (taskMax != null) return taskMax;
    const e = this.profile.energy;
    return attr.startsWith('FIS') ? e.defaultPhysicalTaskMax : e.defaultTechnicalTaskMax;
  }
  eff(pid, attr, taskMax = null) {
    const base = this.pl[pid].abilities[attr];
    const [lo, hi] = this.profile.abilityBounds;
    return clamp(base - this.severity(pid) * this.penFor(attr, taskMax), lo, hi);
  }
  // Suma ponderada (sin normalizar) de capacidades efectivas de un jugador: {capacidad: peso}.
  weightedSum(pid, weights) {
    let s = 0;
    for (const [attr, w] of Object.entries(weights)) s += w * this.eff(pid, attr);
    return s;
  }
  // terms: [[role, attr, weight]...]; actors: role -> playerId. Media ponderada normalizada.
  recipe(terms, actors, taskMax = null, label = null) {
    let num = 0; let den = 0; const trace = [];
    for (const [role, attr, w] of terms) {
      const pid = actors[role];
      if (!pid) throw new Error(`receta: falta el actor del rol ${role}`);
      const e = this.eff(pid, attr, taskMax);
      num += w * e; den += w;
      if (this.opts.detail === 'full') trace.push({ rol: role, jugador: pid, cap: attr, base: this.pl[pid].abilities[attr], efectiva: round(e, 3), peso: w, energia: round(this.ps[pid].energy, 2) });
    }
    const value = num / den;
    if (label) this.note(`receta:${label}`, { valor: round(value, 4), terminos: trace });
    return value;
  }
  // Receta con objeto {attr: peso} para un único ejecutante.
  recipeObj(obj, pid, taskMax = null, label = null) {
    const terms = Object.entries(obj).map(([attr, w]) => ['x', attr, w]);
    return this.recipe(terms, { x: pid }, taskMax, label);
  }
  taskValue(taskId, side, actors, label = null) {
    const t = this.profile.tasks[taskId];
    return this.recipe(t[side], actors, t.maxEnergyPenalty, label ?? `${taskId}.${side}`);
  }

  // ---------- tiempo y energía ----------
  limit() { return this.shotClockOn ? Math.min(this.clock, this.shotClock) : this.clock; }
  enduranceFactor(pid) {
    const e = this.profile.energy;
    return clamp(1 - e.enduranceSlope * (this.pl[pid].abilities.FIS06 - e.baseEnduranceReference), e.enduranceFactorBounds[0], e.enduranceFactorBounds[1]);
  }
  // Consume `dur` décimas de juego real: reloj, energía de los que están en pista y recuperación del banquillo.
  consume(dur, loadKind = 'organized') {
    const e = this.profile.energy;
    const t0 = { clock: this.clock, shot: this.shotClock };
    const mins = dur / 600;
    if (dur > 0) for (const id of Object.keys(this.ps)) this.ps[id].locked = false; // corre el reloj: cesa la restricción de reentrada inmediata
    const load = clamp(e.load[loadKind] ?? e.load.organized, e.loadBounds[0], e.loadBounds[1]);
    for (let t = 0; t < 2; t++) {
      for (const id of this.teams[t].ids) {
        const s = this.ps[id];
        if (!s.available) continue;
        if (s.onCourt) {
          // carga por encargo: el comprometido paga clamp(carga · factor) una sola vez por el intervalo (máximo, no producto)
          const l = this.duty?.[id] ? clamp(load * this.duty[id], e.loadBounds[0], e.loadBounds[1]) : load;
          s.energy = clamp(s.energy - e.costPerLiveMinute * mins * l * this.enduranceFactor(id), e.range[0], e.range[1]);
          s.stintTenths += dur; s.playedTenths += dur;
        } else {
          s.energy = clamp(s.energy + e.benchRecoveryPerLiveMinute * mins, e.range[0], e.range[1]);
          s.benchTenths += dur;
        }
      }
    }
    this.clock = Math.max(0, this.clock - dur);
    this.sportT += dur; // reloj deportivo de los estados: solo cuenta juego vivo
    if (this.shotClockOn) this.shotClock = Math.max(0, this.shotClock - dur);
    return { dur, clockBefore: t0.clock, clockAfter: this.clock, shotBefore: t0.shot, shotAfter: this.shotClock };
  }
  snap() { return { dur: 0, clockBefore: this.clock, clockAfter: this.clock, shotBefore: this.shotClock, shotAfter: this.shotClock }; }
  recoverAll(amount) {
    const e = this.profile.energy;
    for (const id of Object.keys(this.ps)) if (this.ps[id].available) this.ps[id].energy = clamp(this.ps[id].energy + amount, e.range[0], e.range[1]);
  }

  // ---------- eventos ----------
  // data: { t (marca de tiempo), team (ataque), intent, participants, stats, effects, text? }
  emit(type, data = {}) {
    this.eventSeq += 1;
    const t = data.t ?? this.snap();
    const ev = {
      seq: this.eventSeq,
      id: `E${String(this.eventSeq).padStart(4, '0')}`,
      type,
      period: this.period,
      possessionId: this.poss ? this.poss.id : null,
      team: data.team ?? (this.poss ? this.poss.team : null),
      clock: { before: t.clockBefore, after: t.clockAfter },
      shotClock: { before: t.shotBefore, after: t.shotAfter },
      durationTenths: t.dur,
      lineups: [...this.lineupId],
      intent: data.intent ?? null,
      participants: data.participants ?? {},
      stats: data.stats ?? [],
      effects: data.effects ?? {},
      score: [...this.score],
      draws: this.rng.drain(),
      ...(data.instr ? { instr: data.instr } : {}), // MOTOR-11: instrumentación de LECTURA (no deportiva): no entra en la proyección que se reproduce
    };
    this.coachObserveEvent?.(ev); // MOTOR-08: hechos observables del ataque (puntos) para la evidencia de racha
    this.chainHook?.(ev); // MOTOR-06: la cadena de saque abierta asocia el hecho y acumula la producción directa
    if (this.tracker) ev.params = this.tracker.drain();
    if (this.pendingLinks.length) { ev.orders = this.pendingLinks; this.pendingLinks = []; }
    if (this.opts.detail === 'full') { ev.calc = this.calcBuf; }
    this.calcBuf = [];
    this.events.push(ev);
    if (this.opts.check) { if (this.tracker) this.tracker.quiet(() => this.checkInvariants(ev)); else this.checkInvariants(ev); }
    return ev;
  }
  cover(key) { this.coverageObserved[key] = (this.coverageObserved[key] ?? 0) + 1; }

  addPoints(team, pts) {
    this.score[team] += pts;
    const ps = this.periodScores[this.periodScores.length - 1];
    ps.points[team] += pts;
  }

  checkInvariants(ev) {
    const bad = (m) => { throw new Error(`invariante ${ev.id}: ${m}`); };
    const transient = ev.type === 'attempt' || ev.type === 'foul';
    for (let t = 0; t < 2; t++) {
      const on = this.onCourt(t);
      if (new Set(on).size !== 5) bad(`quinteto ${t} sin cinco jugadores distintos`);
      for (const id of on) { if (!transient && (!this.ps[id].available || !this.ps[id].onCourt)) bad(`${id} en pista no disponible`); }
      for (const id of this.teams[t].ids) {
        const s = this.ps[id];
        if (s.energy < -1e-9 || s.energy > 100 + 1e-9) bad(`energía fuera de rango ${id}`);
        if (!transient && s.fouls >= this.profile.rules.foulOut && s.available) bad(`${id} con ${s.fouls} faltas sigue disponible`);
      }
    }
    if (this.clock < 0 || this.shotClock < 0) bad('reloj negativo');
    if (ev.clock.after > ev.clock.before) bad('el reloj de juego no puede crecer');
    if (ev.durationTenths !== ev.clock.before - ev.clock.after && ev.type !== 'interval' && ev.type !== 'period_start') bad('duración distinta de la variación del reloj');
  }

  meta() {
    return {
      engineVersion: ENGINE_VERSION,
      profileId: this.profile.id,
      profileStatus: this.profile.status,
      effectiveProfileId: this.profile.effectiveId ?? this.profile.id,
      profileExtensions: this.profile.extensions ?? [],
      profileRef: this.opts.profileRef ?? null,
      rulesProfile: this.profile.rules.profile,
      rng: { algorithm: this.rng.algorithm, initialSeed: this.rng.initialSeed, zeroSeedReplaced: this.rng.zeroSeedReplaced, draws: this.rng.count },
    };
  }
}

export { clamp, sigmoid, logit, round, toTenths, periodLengthTenths };
