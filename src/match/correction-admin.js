// Corrección de errores en el encuentro (art. 45; MOTOR-15 §6.2–§6.4). Entrada TIPADA y reproducible (`requestCorrection`, comando registrado): identifica el error, su clase, el hecho original, el
// instante de reconocimiento, el contexto de paradas/control y los valores correctos autorizados. Valida la ventana con hechos del propio encuentro (corrections.js) y aplica la operación con las MISMAS
// piezas del juego: una serie legalmente debida ejecuta sus intentos reales en su momento (plan de sanciones), un punto rectificado ajusta marcador y parciales, y el acta/análisis se reconstruyen desde los
// hechos corregidos. NO vuelve a sortear un hecho ya producido y NO es un «retroceder»: el original se conserva enlazado (`corrected.before`) y la actividad posterior legítima permanece.
// No hay errores arbitrales aleatorios: solo entradas tipadas y casos preparados.
import { MatchCore } from './core.js';
import { deepCopy } from './data.js';
import { evaluateWindow, validateCorrectionInput } from './corrections.js';

const P = MatchCore.prototype;
const pad = (n, w = 3) => String(n).padStart(w, '0');
const LIVE_TYPES = new Set(['attempt', 'advance', 'throw_in', 'inbound', 'rebound', 'loose_ball', 'reorganization', 'free_throw']);
const CONTROL_CHANGE = new Set(['dreb', 'steal', 'liveTurnover', 'looseLost', 'blockRecovery']);

P.initCorrections = function initCorrections() { this.correctionSeq = 0; this.correctionLog = []; this.stopLog = []; };

// Contexto de paradas/reanudaciones/control desde el error (hechos del propio encuentro).
P.correctionContext = function correctionContext(errorEvent, recognizedAt) {
  const evs = this.events; const E = evs.find((e) => e.id === errorEvent);
  if (!E) return null;
  const stops = this.stopLog.filter((s) => s.seq > E.seq);
  let resumes = 0; // reanudaciones (balón vivo tras una parada) posteriores al error; los libres no reanudan el juego
  stops.forEach((st, k) => { const nextSeq = stops[k + 1]?.seq ?? Infinity; if (evs.some((e) => e.seq > st.seq && e.seq <= nextSeq && LIVE_TYPES.has(e.type) && e.type !== 'free_throw')) resumes += 1; });
  const after = evs.filter((e) => e.seq > E.seq);
  const basketSince = after.some((e) => e.stats.some((f) => f.k === 'shot' && f.made && !f.annulled));
  const possAfter = this.possLog.filter((p) => p.startSeq > E.seq - 1 && p.endKind);
  const ownPoss = E.possessionId ? this.possLog.find((p) => p.id === E.possessionId) : null;
  const controlChanged = possAfter.some((p) => CONTROL_CHANGE.has(p.endKind)) || !!(ownPoss?.endKind && CONTROL_CHANGE.has(ownPoss.endKind));
  const lastStop = this.stopLog.length ? this.stopLog[this.stopLog.length - 1] : null;
  return {
    period: this.period, remaining: this.clock, errorPeriod: E.period, errorRemaining: E.clock?.before ?? 0,
    firstStop: stops[0] ? { period: stops[0].period, remaining: stops[0].remaining } : null, resumesSinceError: resumes,
    finished: this.status === 'finished', errorAfterLastStop: !lastStop || E.seq > lastStop.seq, immediate: !!recognizedAt?.immediate, controlChanged: !!controlChanged, basketSince,
  };
};

P.requestCorrection = function requestCorrection(c) {
  this.logCommand('correction', { correction: c });
  const rejected = (reason, extra = {}) => { const r = { ok: false, state: 'rechazada', reason, ...extra }; this.correctionLog.push({ ...r, class: c?.class ?? null, step: this.stepSeq }); return r; };
  if (this.status === 'error') return rejected('el encuentro terminó con error');
  const v = validateCorrectionInput(this.profile, c);
  if (!v.ok) return rejected(v.problems.join(' · '), { problems: v.problems });
  const cls = v.class;
  const ctx = this.correctionContext(c.error.event, c.recognizedAt);
  if (!ctx) return rejected(`el hecho original ${c.error.event ?? 'ausente'} no existe`);
  const win = evaluateWindow(this.profile, cls.category, ctx);
  if (!win.open) return rejected(`ventana caducada (${win.rule}): ${win.reason}`, { window: win, context: ctx });
  const id = `COR${pad(++this.correctionSeq)}`;
  const op = OPS[cls.operation];
  if (!op) return rejected(`operación «${cls.operation}» sin implementación`);
  let out;
  try { out = op.call(this, c, cls, id); } catch (e) { return rejected(e.message, { window: win }); }
  if (!out.ok) return rejected(out.reason, { window: win });
  const rec = { id, class: cls.id, category: cls.category, article: cls.article, operation: cls.operation, requester: c.requester, error: deepCopy(c.error), recognizedAt: deepCopy(c.recognizedAt), window: win, context: ctx, correct: deepCopy(c.correct), changes: out.changes, derived: out.derived ?? [], note: c.note ?? null, source: this.profile.regulation.corrections.reading };
  this.emit('correction', { team: out.team ?? null, intent: { origen: 'corrección reglamentaria (art. 45)', clase: cls.id, categoria: cls.category }, participants: out.participants ?? {}, stats: [], effects: { correccion: rec } });
  this.correctionLog.push({ id, state: 'aplicada', class: cls.id, step: this.stepSeq });
  this.cover(`corrección art. 45 ${cls.id}`);
  return { ok: true, id, state: 'aplicada', window: win, changes: out.changes };
};

// ---------------------------------------------------------------- utilidades de aplicación
P.seriesStats = function seriesStats(series) {
  const out = [];
  for (const e of this.events) if (e.type === 'free_throw') for (const f of e.stats) if (f.k === 'ft' && f.series === series) out.push({ ev: e, f });
  return out;
};
P.adjustScore = function adjustScore(team, delta, period) {
  this.score[team] += delta;
  const ps = this.periodScores[period - 1] ?? this.periodScores[this.periodScores.length - 1];
  ps.points[team] += delta;
};
const mark = (f, id, before) => { f.corrected = { id, before }; };
// Anula los intentos de una serie ya lanzada: el hecho original se conserva (made/status anteriores); los puntos se retiran del marcador.
P.annulSeries = function annulSeries(series, id) {
  const st = this.seriesStats(series);
  if (!st.length) return { ok: false, reason: `la serie ${series} no existe` };
  let points = 0; const changes = [];
  for (const { ev, f } of st) {
    if ((f.status ?? 'administered') === 'annulled') continue;
    const before = { made: f.made, status: f.status ?? 'administered' };
    if (f.made) { this.adjustScore(f.team, -1, ev.period); points += 1; }
    f.status = 'annulled'; mark(f, id, before); changes.push({ event: ev.id, series, i: f.i, antes: before, despues: { status: 'annulled' } });
  }
  return { ok: true, points, team: st[0].f.team, changes, shooter: st[0].f.p, granted: st[0].f.n };
};
// Programa una serie legalmente debida con intentos REALES en el momento corregido, mediante la cola común de sanciones (una sola reanudación: el contexto previo).
P.scheduleSeries = function scheduleSeries(team, shooter, n, label, id) {
  if (!this.pl[shooter] || this.pl[shooter].teamIdx !== team) throw new Error(`el lanzador ${shooter} no pertenece al equipo ${this.teams[team].id}`);
  if (!this.ps[shooter].available) throw new Error(`el lanzador ${shooter} no está disponible`);
  const step = { id, team: 1 - team, beneficiary: team, fouled: shooter, committer: null, category: 'corrección', ft: n, shooter: shooter, row: 'RG-R01', resumeIfLast: { kind: 'priorContext' }, right: 'none' };
  if (this.adminPlan) { this.adminPlan.steps.push(step); this.adminPlan.resume = { kind: 'priorContext', shotClock: 'retained', from: null, convention: 'corrección art. 45: contexto previo' }; }
  else this.adminPlan = { id: `ADM${pad(this.stepSeq)}`, steps: [step], index: 0, resume: { kind: 'priorContext', shotClock: 'retained', from: null, convention: 'corrección art. 45: contexto previo' }, compensated: [], ex: null, sanctions: [id] };
  this.clockRunning = false;
  void label;
};
P.cancelPendingSeries = function cancelPendingSeries() {
  const had = !!(this.pendingFoul || this.poss?.pendingFT || this.adminPlan);
  this.pendingFoul = null; if (this.poss) this.poss.pendingFT = null; this.adminPlan = null;
  return had;
};

// ---------------------------------------------------------------- operaciones (una por clase; las ramas se distinguen por los datos de la entrada)
const OPS = {
  // 45.4 libres indebidos: se anulan (serie ya lanzada) o se cancela la pendiente; la actividad posterior legítima permanece.
  annulSeries(c, cls, id) {
    if (c.correct.pending === true) { const had = this.cancelPendingSeries(); if (!had) return { ok: false, reason: 'no hay una serie pendiente que cancelar' }; return { ok: true, changes: [{ pendiente: 'serie cancelada antes de lanzarse' }], team: null }; }
    const r = this.annulSeries(c.correct.series, id); if (!r.ok) return r;
    return { ok: true, changes: r.changes, team: r.team, derived: ['marcador', 'parciales', 'acta', 'series', 'F', 'más-menos'], puntosRetirados: r.points };
  },
  // 45.4 libres omitidos: se administran (intentos reales) salvo la excepción de canasta posterior del mismo equipo tras un saque erróneo.
  administerSeries(c, cls, id) {
    const cfg = cls.exception;
    if (c.error.context?.subsequentBasketBySameTeamAfterWrongThrowIn === true) return { ok: false, reason: `no se administra: ${cfg}` };
    const { team, shooter, n } = c.correct;
    if (!(team === 0 || team === 1) || !(n >= 1)) return { ok: false, reason: 'se declara el equipo beneficiario y el número de libres debidos' };
    this.scheduleSeries(team, shooter, n, c.correct.cause ?? 'libres omitidos', id);
    return { ok: true, changes: [{ serieProgramada: { lanzador: shooter, libres: n, equipo: team } }], team, derived: ['acta', 'series'] };
  },
  // 45.4 lanzador permitido incorrectamente: se cancela la serie y la posesión sancionadora.
  cancelSeriesAndRight(c, cls, id) {
    let changes = []; let team = null; let rightLost = false;
    if (c.correct.pending === true) {
      const had = this.cancelPendingSeries(); if (!had) return { ok: false, reason: 'no hay una serie pendiente' }; changes.push({ pendiente: 'serie y derecho cancelados antes de lanzarse' }); rightLost = true;
      if (this.poss && !this.poss.done) { this.poss.pendingThrowIn = { kind: 'band', origin: 'saque tras la cancelación de la serie y el derecho (contexto previo)', frontcourt: !!this.poss.advanced }; }
    } else {
      const r = this.annulSeries(c.correct.series, id); if (!r.ok) return r; changes = r.changes; team = r.team;
      if (this.poss && !this.poss.done && this.poss.pendingThrowIn?.penalty) { this.poss.pendingThrowIn = { kind: 'band', origin: 'saque tras la cancelación del derecho sancionador (contexto previo)', frontcourt: !!this.poss.advanced }; rightLost = true; }
      else changes.push({ derechoSancionador: 'ya consumido: la actividad posterior legítima permanece' });
    }
    return { ok: true, changes, team, derived: ['marcador', 'acta', 'series', rightLost ? 'posesión sancionadora' : 'posesión'] };
  },
  // 45.4 lanzador dirigido incorrectamente: la serie del lanzador equivocado se sustituye por la del correcto.
  replaceSeriesByCorrectShooter(c, cls, id) {
    const r = this.annulSeries(c.correct.series, id); if (!r.ok) return r;
    const n = c.correct.n ?? r.granted; const shooter = c.correct.shooter;
    this.scheduleSeries(r.team, shooter, n, 'serie sustituida', id);
    return { ok: true, changes: [...r.changes, { serieSustituta: { lanzador: shooter, libres: n } }], team: r.team, derived: ['marcador', 'acta', 'series'] };
  },
  // 45.4 puntos: rectifica el valor de un tiro con sus efectos (marcador, parciales, acta, F, posesiones).
  rectifyPoints(c, cls, id) {
    const ev = this.events.find((e) => e.id === c.correct.event); const f = ev?.stats.find((x) => x.k === 'shot');
    if (!f) return { ok: false, reason: `el hecho ${c.correct.event} no contiene un tiro` };
    if (![2, 3].includes(c.correct.points)) return { ok: false, reason: 'el valor corregido es 2 o 3' };
    if (f.fromFoul && !f.made) return { ok: false, reason: 'un tiro fallado con falta administró libres según su valor: la rectificación exige revisar la serie' };
    const before = { points: f.points, zone: f.zone }; const delta = f.made ? c.correct.points - f.points : 0;
    if (delta) this.adjustScore(f.team, delta, ev.period);
    f.points = c.correct.points; f.zone = f.points === 3 ? 'three' : (f.zone === 'three' ? 'midrange' : f.zone); mark(f, id, before);
    return { ok: true, changes: [{ event: ev.id, antes: before, despues: { points: f.points, zone: f.zone }, deltaMarcador: delta }], team: f.team, derived: ['marcador', 'parciales', 'intentos', 'acta', 'F', 'posesiones', 'más-menos'] };
  },
  // 45.4 infractor/sujeto: reatribuye una falta (contadores individuales) a otro jugador del mismo equipo.
  rectifyOffender(c, cls, id) {
    const ev = this.events.find((e) => e.id === c.correct.event); const f = ev?.stats.find((x) => x.k === 'foul');
    if (!f) return { ok: false, reason: `el hecho ${c.correct.event} no contiene una falta` };
    const to = c.correct.to; if (!this.pl[to] || this.pl[to].teamIdx !== f.team) return { ok: false, reason: `${to} no pertenece al equipo de la falta` };
    const before = { p: f.p }; this.ps[f.p].fouls -= 1; this.ps[to].fouls += 1;
    if (this.ps[to].fouls >= this.profile.rules.foulOut && this.ps[to].available) this.exclude(to);
    f.p = to; mark(f, id, before); if (ev.participants) ev.participants.infractor = to;
    return { ok: true, changes: [{ event: ev.id, antes: before, despues: { p: to } }], team: f.team, derived: ['acta', 'contadores individuales'] };
  },
  // 45.4 mesa/recursos: faltas de equipo o tiempos muertos mal anotados.
  rectifyResources(c, cls, id) {
    const { team, resource, delta, period } = c.correct;
    if (resource === 'teamFouls') { const key = period ?? this.period; const k = key <= this.profile.rules.quarters ? key : this.profile.rules.overtimeFoulsCarryFromPeriod; const b = this.teamFouls[team][k] ?? 0; if (b + delta < 0) return { ok: false, reason: 'las faltas de equipo no pueden ser negativas' }; this.teamFouls[team][k] = b + delta; return { ok: true, changes: [{ recurso: 'faltas de equipo', equipo: team, periodo: key, antes: b, despues: b + delta }], team, derived: ['penalización colectiva'] }; }
    return { ok: false, reason: `recurso de mesa no admitido: ${resource}` };
  },
  // 45.4 reloj de juego: el reloj se ajusta al valor autorizado; la monotonía aparente la reconocen los detectores por la corrección identificada (no se fuerzan minutos).
  rectifyClock(c, cls, id) {
    const t = c.correct.clockTenths; if (!(Number.isInteger(t) && t >= 0 && t <= 6000)) return { ok: false, reason: 'el reloj autorizado es un entero de décimas entre 0 y la duración del periodo' };
    const before = this.clock; this.clock = t;
    return { ok: true, changes: [{ relojDeJuego: { antes: before, despues: t } }], team: null, derived: ['reloj'], id };
  },
  // 45.6 (categoría 2) reloj de posesión: inmediata o primera parada, manteniendo control y derecho.
  restoreShotClock(c, cls, id) {
    const t = c.correct.shotClockTenths; if (!(Number.isInteger(t) && t >= 0 && t <= 240)) return { ok: false, reason: 'el reloj de posesión autorizado es un entero de décimas entre 0 y 24,0 s' };
    const before = this.shotClock; this.shotClock = t;
    return { ok: true, changes: [{ relojDePosesion: { antes: before, despues: t } }], team: null, derived: ['reloj de posesión'], id };
  },
};
