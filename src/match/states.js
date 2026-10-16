// Estados deportivos de MOTOR-07: Forma, exigencia de presión, tres momentos individuales (M-TIR, M-OFE, M-DEF), momento colectivo T,
// perturbación neutral de probabilidades y catálogo de episodios. Una sola implementación para el motor, el laboratorio y las pruebas.
//
// Principios (§8–§10 del encargo):
//  · Forma es una entrada recibida y NO cambia durante el encuentro.
//  · Los momentos viven en tiempo deportivo (décimas de juego vivo) y se actualizan de forma PEREZOSA: el intervalo pendiente de un jugador
//    y ámbito se procesa de una vez cuando una tarea o un episodio lo necesita. Consultar la misma frontera dos veces no vuelve a sortear.
//    Las pausas deportivas (tiempo muerto, intervalo, descanso) son marcadores que cada estado procesa una sola vez, en su orden.
//  · La perturbación de una probabilidad usa la transformación directa p + alpha·Z·min(p, 1−p) (binarias) o el vector de suma cero v_j
//    (distribuciones excluyentes); con Z centrado y contexto fijo la media de la salida final no cambia.
//  · Nada aquí consume azar para mostrar: las vistas usan valores comprometidos o una proyección determinista identificada.
import { MatchCore } from './core.js';
import { clamp, round, a01 } from './mathx.js';
import { perturbBinary, perturbCategories, consistencySigmaAt, pressureLossLogit, momentCategory, CATEGORY_LABELS } from './formulas.js';
export { perturbBinary, perturbCategories, momentCategory, CATEGORY_LABELS };

const P = MatchCore.prototype;
export const MOMENT_SCOPES = ['M_TIR', 'M_OFE', 'M_DEF'];
const SQRT3 = Math.sqrt(3);
const uniq = (ids) => [...new Set(ids.filter(Boolean))];
const mean = (ids, f) => (ids.length ? ids.reduce((s, id) => s + f(id), 0) / ids.length : 0);

// ---------------------------------------------------------------- inicio
P.initStates = function initStates() {
  this.sportT = 0; // décimas de juego vivo acumuladas: reloj deportivo de los estados (no depende de la presentación)
  this.pauses = []; // marcadores de pausa deportiva, en orden
  this.stateLog = []; // evolución comprometida (diagnóstico): solo actualizaciones reales con intervalo o pausa
  this.episodeLog = []; this.episodeTreated = new Set();
  this.importance = this.input.importance;
  const mk = (v) => ({ v, t: 0, pi: 0 });
  for (const id of Object.keys(this.ps)) {
    const st = this.pl[id].state;
    this.ps[id].form = st.form; // estable durante todo el encuentro
    this.ps[id].mom = { M_TIR: mk(st.M_TIR), M_OFE: mk(st.M_OFE), M_DEF: mk(st.M_DEF) };
  }
  this.tm = this.teams.map((t) => mk(t.plan.initialTeamMoment));
};

// ---------------------------------------------------------------- Consistencia: amplitud de la variación (MEN06)
P.consistencySigma = function consistencySigma(pid) {
  return consistencySigmaAt(this.profile, this.eff(pid, 'MEN06', 0));
};

// ---------------------------------------------------------------- momentos individuales (actualización perezosa)
// Estado efectivo del jugador y ámbito en la frontera actual. Procesa una sola vez el intervalo pendiente y las pausas pendientes.
P.flushMoment = function flushMoment(pid, scope) {
  const st = this.ps[pid].mom[scope];
  if (st.t === this.sportT && st.pi === this.pauses.length) return st.v;
  const cfg = this.profile.moment; const playing = this.ps[pid].onCourt;
  const half = playing ? cfg.playingHalfLifeSeconds : cfg.benchHalfLifeSeconds;
  const sigma = playing ? this.consistencySigma(pid) : 0; // el banquillo solo atenúa: sin variación aleatoria ni impulsos por hechos ajenos
  const [lo, hi] = cfg.range; const nu = cfg.neutral;
  const prev = st.v; const t0 = st.t; const innov = []; const paused = [];
  const advance = (to) => {
    const d = (to - st.t) / 10;
    if (d > 0) {
      const rho = 2 ** (-d / half);
      let e = 0;
      if (sigma > 0) { // Δ = 0 no crea innovación; una frontera ya procesada no vuelve a sortear
        const U = (2 * this.draw(`momento:${pid}:${scope}`) - 1) * SQRT3;
        e = sigma * Math.sqrt(1 - rho * rho) * U; innov.push(round(U, 4));
      }
      st.v = clamp(nu + rho * (st.v - nu) + e, lo, hi);
    }
    st.t = to;
  };
  while (st.pi < this.pauses.length) { // pausas deportivas pendientes, una vez cada una y en su orden
    const p = this.pauses[st.pi];
    advance(p.t);
    st.v = clamp(nu + cfg.pauseAttenuation[p.kind] * (st.v - nu), lo, hi); paused.push(p.kind);
    st.pi += 1;
  }
  advance(this.sportT);
  if (this.opts.detail === 'full' && (st.t !== t0 || paused.length)) this.stateLog.push({ quien: pid, ambito: scope, desde: t0 / 10, hasta: this.sportT / 10, previo: round(prev, 4), nuevo: round(st.v, 4), variacion: innov, pausas: paused, estadoDelJugador: playing ? 'en pista' : 'banquillo' });
  return st.v;
};
P.flushPlayerMoments = function flushPlayerMoments(pid) { for (const s of MOMENT_SCOPES) this.flushMoment(pid, s); };

// Momento colectivo T: decae de forma determinista (sin innovación aleatoria) y solo cambia por episodios y pausas.
P.teamMomentOf = function teamMomentOf(team) {
  const st = this.tm[team];
  if (st.t === this.sportT && st.pi === this.pauses.length) return st.v;
  const cfg = this.profile.teamMoment; const [lo, hi] = cfg.range; const nu = cfg.neutral; const prev = st.v; const t0 = st.t; const paused = [];
  const advance = (to) => { const d = (to - st.t) / 10; if (d > 0) st.v = clamp(nu + 2 ** (-d / cfg.halfLifeSeconds) * (st.v - nu), lo, hi); st.t = to; };
  while (st.pi < this.pauses.length) { const p = this.pauses[st.pi]; advance(p.t); st.v = clamp(nu + cfg.pauseAttenuation[p.kind] * (st.v - nu), lo, hi); paused.push(p.kind); st.pi += 1; }
  advance(this.sportT);
  if (this.opts.detail === 'full' && (st.t !== t0 || paused.length)) this.stateLog.push({ quien: `T:${this.teams[team].id}`, ambito: 'T', desde: t0 / 10, hasta: this.sportT / 10, previo: round(prev, 4), nuevo: round(st.v, 4), variacion: [], pausas: paused, estadoDelJugador: 'equipo' });
  return st.v;
};

// Pausa deportiva (EPI06): un marcador, aplicado una vez a ambos equipos y a todos los estados, sin fingir transcurso de reloj de juego.
P.pauseMarker = function pauseMarker(kind, origin) {
  this.pauses.push({ t: this.sportT, kind, period: this.period, origen: origin });
  const def = this.profile.episodeCatalog.episodes.EPI06;
  this.episodeLog.push({ id: 'EPI06', nombre: def.name, cadena: `pausa:${this.pauses.length}`, tipoDePausa: kind, origen: origin, periodo: this.period, instanteDeJuego: this.sportT / 10, destino: 'todos los momentos individuales y T de ambos equipos', estado: 'atenuación registrada (se aplica a cada estado una vez, al procesarlo)', factorMomento: this.profile.moment.pauseAttenuation[kind], factorT: this.profile.teamMoment.pauseAttenuation[kind] });
};

// Cambio de situación (sustitución, exclusión): se procesa el intervalo con la situación ANTERIOR antes de cambiarla.
P.beforeStatusChange = function beforeStatusChange(pid) { this.flushPlayerMoments(pid); };

// Vista diagnóstica SIN azar: valor comprometido y proyección determinista de atenuación hasta la frontera actual (identificada como tal).
P.momentView = function momentView(pid, scope) {
  const st = this.ps[pid].mom[scope]; const cfg = this.profile.moment; const nu = cfg.neutral;
  const playing = this.ps[pid].onCourt; const half = playing ? cfg.playingHalfLifeSeconds : cfg.benchHalfLifeSeconds;
  let v = st.v; let t = st.t; let pi = st.pi;
  const step = (to) => { const d = (to - t) / 10; if (d > 0) v = nu + 2 ** (-d / half) * (v - nu); t = to; };
  while (pi < this.pauses.length) { step(this.pauses[pi].t); v = nu + cfg.pauseAttenuation[this.pauses[pi].kind] * (v - nu); pi += 1; }
  step(this.sportT);
  return { comprometido: st.v, actualizadoHasta: st.t / 10, pendienteSegundos: (this.sportT - st.t) / 10, proyeccionDeterminista: round(v, 4), nota: 'la proyección solo atenúa hacia neutral (no materializa variación aleatoria)' };
};
P.teamMomentView = function teamMomentView(team) {
  const st = this.tm[team]; const cfg = this.profile.teamMoment; const nu = cfg.neutral;
  let v = st.v; let t = st.t; let pi = st.pi;
  const step = (to) => { const d = (to - t) / 10; if (d > 0) v = nu + 2 ** (-d / cfg.halfLifeSeconds) * (v - nu); t = to; };
  while (pi < this.pauses.length) { step(this.pauses[pi].t); v = nu + cfg.pauseAttenuation[this.pauses[pi].kind] * (v - nu); pi += 1; }
  step(this.sportT);
  return { comprometido: st.v, actualizadoHasta: st.t / 10, pendienteSegundos: (this.sportT - st.t) / 10, proyeccionDeterminista: round(v, 4) };
};
// Instantánea comprometida para la exportación (sin materializar nada).
P.stateSnapshot = function stateSnapshot() {
  const players = {};
  for (const [id, s] of Object.entries(this.ps)) players[id] = { forma: s.form, energia: round(s.energy, 3), momentos: Object.fromEntries(MOMENT_SCOPES.map((k) => [k, { valor: round(s.mom[k].v, 5), actualizadoHasta: s.mom[k].t / 10, pausasProcesadas: s.mom[k].pi }])) };
  return { importancia: this.importance, relojDeportivoSegundos: this.sportT / 10, jugadores: players, equipos: this.tm.map((t, i) => ({ id: this.teams[i].id, T: round(t.v, 5), actualizadoHasta: t.t / 10, pausasProcesadas: t.pi })), pausas: this.pauses.map((p) => ({ tipo: p.kind, instanteDeJuego: p.t / 10, periodo: p.period, origen: p.origen })) };
};

// ---------------------------------------------------------------- presión (importancia · tensión)
// P = máximo(importancia, tensión), acotado. La tensión usa reloj y margen ACTUALES y contexto previo; no conoce el siguiente resultado.
P.pressureNow = function pressureNow() {
  const pr = this.profile.pressure;
  const importance = pr.importance[this.importance];
  const margin = Math.abs(this.score[0] - this.score[1]);
  const c = clamp(1 - margin / pr.closeMarginPoints, 0, 1);
  const remaining = this.clock / 10;
  const l = clamp(1 - remaining / pr.latePeriodWindowSeconds, 0, 1);
  const w = this.period >= this.profile.rules.quarters ? pr.periodTensionWeight.Q4_OT : pr.periodTensionWeight.Q1_Q2_Q3;
  const tension = w * l * c;
  return { P: clamp(Math.max(importance, tension), 0, 1), importance, tension, margen: margin, segundosRestantes: round(remaining, 1) };
};
// En una elección pertinente la presión reduce MEN03 efectivo hasta k·P·(1 − a(MEN07)) puntos, solo para esa valoración (no toca la nota base).
P.choicePenalty = function choicePenalty(pid) {
  return this.profile.pressure.choiceMaximumDecisionPointsLost * this.pressureNow().P * (1 - a01(this.eff(pid, 'MEN07', 0)));
};

// ---------------------------------------------------------------- Forma y presión: ajuste determinista de UNA tarea (logit, favorable al lado propio)
// own/counter: jugadores que intervienen en cada lado de ESTE contraste; executants: quien ejecuta (paga la presión). Forma aporta k·F del lado
// propio y resta una vez el aporte pertinente de la contraparte, limitado al máximo del ámbito; la pérdida por presión es k·P·(1 − a(MEN07)).
P.formPressure = function formPressure(taskKey, own, counter, { executants = own } = {}) {
  const task = this.profile.stateTasks.tasks[taskKey]; const kf = this.profile.form.taskMaxLogit; const scope = task.scope;
  const ownIds = uniq(own); const cIds = uniq(counter); const exIds = uniq(executants);
  const fOwn = ownIds.length ? kf[scope] * mean(ownIds, (id) => this.ps[id].form) : 0;
  const fcs = task.formCounterScope; // se lee siempre (la declaración de la tarea es el dato)
  const fCounter = cIds.length && fcs ? kf[fcs] * mean(cIds, (id) => this.ps[id].form) : 0;
  const form = clamp(fOwn - fCounter, -kf[scope], kf[scope]);
  let loss = 0; let pressure = null;
  if (task.pressure && exIds.length) {
    pressure = this.pressureNow();
    loss = mean(exIds, (id) => pressureLossLogit(this.profile, scope, pressure.P, this.eff(id, 'MEN07', 0)));
  }
  const [lo, hi] = this.profile.pressure.combinedFormPressureLogitBounds;
  const delta = clamp(form - loss, lo, hi);
  if (this.opts.detail === 'full' && (ownIds.length || cIds.length)) this.note(`estados:forma_presion:${taskKey}`, { ambito: scope, propios: ownIds, contraparte: cIds, ejecutan: exIds, formaPropia: round(fOwn, 4), formaContraparte: round(fCounter, 4), forma: round(form, 4), exigencia: pressure ? { P: round(pressure.P, 4), importancia: pressure.importance, tension: round(pressure.tension, 4), margen: pressure.margen, segundosRestantes: pressure.segundosRestantes } : null, perdidaPorPresion: round(loss, 4), ajusteConjuntoLogit: round(delta, 4), limites: [lo, hi] });
  return { delta, form, loss, pressure };
};

// ---------------------------------------------------------------- momento: Z de una tarea (una mezcla, un alpha)
// Individual: Z propio = M del ámbito (media de los jugadores propios). Colectiva elegible: 0,7·M + 0,3·T. Con contraparte pertinente:
// Z = 0,5·Z propio − 0,5·Z contraparte; sin contraparte elegible solo el propio (no se inventa un defensor).
P.momentZ = function momentZ(taskKey, own, counter, { team = null, skipCounter = false } = {}) {
  const task = this.profile.stateTasks.tasks[taskKey]; const cfg = this.profile.moment;
  const ownIds = uniq(own); const cIds = skipCounter || !task.counterMoment ? [] : uniq(counter);
  const mOwn = ownIds.length ? mean(ownIds, (id) => this.flushMoment(id, task.ownMoment)) : 0;
  const mix = cfg.individualCollectiveMixture;
  let tOwn = null; let zOwn = mOwn;
  if (task.team && team != null) { tOwn = this.teamMomentOf(team); zOwn = mix.individual * mOwn + mix.team * tOwn; }
  let zC = null; let mC = null; let tC = null;
  if (cIds.length) {
    mC = mean(cIds, (id) => this.flushMoment(id, task.counterMoment)); zC = mC;
    if (task.team && team != null) { tC = this.teamMomentOf(1 - team); zC = mix.individual * mC + mix.team * tC; }
  }
  const opp = cfg.opposedMomentMixture;
  const Z = zC == null ? zOwn : opp.actor * zOwn - opp.counterpart * zC;
  const out = { Z: clamp(Z, -1, 1), alpha: cfg.probabilityAlphaByTask[task.scope], mOwn, tOwn, mCounter: mC, tCounter: tC, usedCounter: cIds.length > 0, ownIds, counterIds: cIds };
  return out;
};
P.perturbNote = function perturbNote(taskKey, mz, extra) {
  if (this.opts.detail !== 'full') return;
  this.note(`estados:momento:${taskKey}`, { ambito: this.profile.stateTasks.tasks[taskKey].scope, propios: mz.ownIds, contraparte: mz.counterIds, momentoPropio: round(mz.mOwn, 4), TPropio: mz.tOwn == null ? null : round(mz.tOwn, 4), momentoContraparte: mz.mCounter == null ? null : round(mz.mCounter, 4), TContraparte: mz.tCounter == null ? null : round(mz.tCounter, 4), Z: round(mz.Z, 4), alpha: mz.alpha, presupuesto: 'una vez por tarea (T y momento individual comparten el mismo alpha)', ...extra });
};

// ---------------------------------------------------------------- lectura defensiva de opciones (MEN02, MEN03, MEN04 del defensor)
// La presión reduce solo la valoración de Decisiones (no la nota). Devuelve la capacidad efectiva de lectura del DEFENSOR real.
P.defensiveReading = function defensiveReading(pid) {
  const w = this.profile.missingTaskConnections.defensiveOptionReading; const tm = this.profile.energy.defaultTechnicalTaskMax; const lo = this.profile.abilityBounds[0];
  let s = 0;
  for (const [cap, wt] of Object.entries(w)) s += wt * (cap === 'MEN03' ? Math.max(lo, this.eff(pid, 'MEN03', tm) - this.choicePenalty(pid)) : this.eff(pid, cap, tm));
  return s;
};
// Recorrido largo de ataque (acceso a la ventaja de transición): receta del anexo A con el deterioro físico máximo declarado.
P.longTravelAccess = function longTravelAccess(pid) {
  const c = this.profile.missingTaskConnections;
  return this.recipeObj(c.longTravelAccessAttack, pid, c.physicalAccessMaxEnergyPenalty, 'acceso_recorrido_largo');
};

// ---------------------------------------------------------------- episodios (EPI01–EPI06)
// Impulso elegible: se suma al estado efectivo de SU frontera (tras procesar el intervalo) y se acota; nunca modifica la acción que lo causó.
// Una señal equivalente (misma cadena, destinatario y ámbito) posterior se registra sin otro impulso.
P.episode = function episode(epiId, { chain, who, evidence }) {
  const def = this.profile.episodeCatalog.episodes[epiId]; const amount = this.profile.episodes[def.impulseKey];
  const isTeam = def.target === 'T';
  const dest = isTeam ? `T:${this.teams[who].id}` : `${who}:${def.target}`;
  const key = `${chain}|${dest}`;
  const rec = { id: epiId, nombre: def.name, cadena: chain, destino: dest, ambito: def.target, signo: Math.sign(amount), magnitud: Math.abs(amount), limite: isTeam ? this.profile.teamMoment.range : this.profile.moment.range, periodo: this.period, instanteDeJuego: this.sportT / 10, evidencia: evidence, posesion: this.poss?.id ?? null };
  if (this.episodeTreated.has(key)) { rec.estado = 'señal equivalente de la misma cadena: registrada sin otro impulso'; this.episodeLog.push(rec); return false; }
  this.episodeTreated.add(key);
  if (isTeam) { const prev = this.teamMomentOf(who); const st = this.tm[who]; const [lo, hi] = this.profile.teamMoment.range; st.v = clamp(prev + amount, lo, hi); rec.previo = round(prev, 4); rec.nuevo = round(st.v, 4); }
  else { const prev = this.flushMoment(who, def.target); const st = this.ps[who].mom[def.target]; const [lo, hi] = this.profile.moment.range; st.v = clamp(prev + amount, lo, hi); rec.previo = round(prev, 4); rec.nuevo = round(st.v, 4); }
  rec.estado = 'impulso aplicado a partir de esta frontera';
  this.episodeLog.push(rec);
  return true;
};

// Evidencia tras un tiro de campo resuelto: EPI01 (ejecución difícil anotada), EPI04 (ayuda útil) y EPI05 (fallo de coordinación defensivo).
P.episodesAfterShot = function episodesAfterShot(ex, { made, pBase, contact }) {
  const epi = this.profile.episodes; const chain = this.poss?.id ?? 'sin-posesion';
  if (made && pBase <= epi.difficultExecutionReferenceProbabilityMaximum) this.episode('EPI01', { chain: `${chain}:tiro:${ex.actor}`, who: ex.actor, evidence: { zona: ex.zone, probabilidadPrevia: round(pBase, 4), maximoDeEjecucionDificil: epi.difficultExecutionReferenceProbabilityMaximum } });
  if (ex.helper && ex.helpArrived && !made && !contact) this.episode('EPI04', { chain: `${chain}:ayuda`, who: 1 - ex.team, evidence: { ayudante: ex.helper, llega: true, tiroFallado: true } });
  if (ex.coordFailure) this.episode('EPI05', { chain: `${chain}:coordinacion`, who: 1 - ex.team, evidence: ex.coordFailure });
};
// EPI02: error representado de atención o ejecución del poseedor/pasador (infracción de balón, o pérdida sin intento de intervención del defensor).
P.episodeError = function episodeError(ex, kind) {
  const pid = ex.exec === 'pass' ? ex.passer : ex.actor;
  if (!pid) return;
  this.episode('EPI02', { chain: `${this.poss?.id ?? 'sin-posesion'}:error:${pid}`, who: pid, evidence: { tipo: kind, intentoDeIntervencion: ex.stealAttempt ?? null, ejecucion: ex.exec } });
};
// EPI03: una reorganización por un problema real queda «pendiente» hasta que su tarea se resuelva (no cuenta por haberla ordenado).
P.episodeReorganizationPending = function episodeReorganizationPending(poss, reason, director) {
  if (!/negada|rebote ofensivo|balón recuperado/.test(reason ?? '')) return;
  poss.epi03 = { motivo: reason, director: director ?? poss.director?.id ?? null, reorgCount: poss.reorgCount };
};
P.episodeReorganizationSettled = function episodeReorganizationSettled(poss, category) {
  const p = poss.epi03; if (!p) return; poss.epi03 = null;
  if (!['fieldShot', 'shootingFoul', 'defensiveNonShootingFoul'].includes(category)) return; // pérdida o infracción: la coordinación no se recuperó
  this.episode('EPI03', { chain: `${poss.id}:reorganizacion`, who: poss.team, evidence: { problema: p.motivo, director: p.director, continuacion: category } });
};
