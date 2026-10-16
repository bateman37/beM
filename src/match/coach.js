// Entrenador automático (MOTOR-08): vista permitida, revisión en fronteras deportivas, autorización por delegación, ejecución en ventanas
// válidas y registro de decisiones. La política (qué proponer) vive en `coach-policy.js` como funciones puras sobre la vista; aquí solo se
// construye esa vista, se aplica la precedencia (reglamento › orden manual › plan de Dennis › decisión automática › comportamiento ordinario)
// y se ejecuta con los mecanismos existentes (sustituciones, órdenes de plan, tiempos muertos). No hay azar, ni ticks, ni búsqueda de futuros.
import { MatchCore } from './core.js';
import { round, clamp } from './mathx.js';
import { foulPeriodKey, inPenalty } from './rules.js';
import { ownStateView } from './visibility.js';
import { COACH_AREAS, decideRotation, decideTimeout, timeoutCauses, decideEndgame, foulBookRow, endgameState, memoryProposals, slotUtilityOf } from './coach-policy.js';
import { deepCopy, SLOTS } from './data.js';
import { PNR_ALLOWED } from './defense-actions.js';

const P = MatchCore.prototype;
const pad = (n, w = 3) => String(n).padStart(w, '0');

// ---------------------------------------------------------------- estado
P.initCoach = function initCoach() {
  this.coachState = this.teams.map((t) => ({ policy: t.plan.coach.policy, delegation: { ...t.plan.coach.delegation }, adjustAt: {}, lastTimeout: null, mandatoryRecent: [], riskProtected: new Set(), riskLogged: new Set(), endgameApplied: {}, keptLogged: new Set() }));
  this.decisions = []; this.decisionSeq = 0; this.decisionKeys = new Set();
  this.attackLog = [[], []]; this.attackSeq = [0, 0];
  this.initMemory();
};
P.coachCfg = function coachCfg() { return this.profile.coach; };
P.coachVersion = function coachVersion() {
  return { perfil: this.profile.effectiveId ?? this.profile.id, versionDeLaBiblioteca: this.opts.profileRef?.versionId ?? null, entrenador: this.profile.coach.version, memoria: this.profile.memory.version, recetaDeRotacion: this.profile.coach.rotation.recipeVersion };
};
P.coachOnce = function coachOnce(key) { if (this.decisionKeys.has(key)) return false; this.decisionKeys.add(key); return true; };

// ---------------------------------------------------------------- registro de decisiones (observación → propuesta → autorización → ejecución)
P.coachFrontierInfo = function coachFrontierInfo(kind, extra = {}) {
  return { tipo: kind, paso: this.stepSeq, periodo: this.period, reloj: round(this.clock / 10, 1), posesion: this.poss && !this.poss.done ? this.poss.id : null, relojDeportivo: round(this.sportT / 10, 1), ...extra };
};
P.decision = function decision(team, area, frontier, spec) {
  this.decisionSeq += 1;
  const d = {
    id: `D${pad(this.decisionSeq)}`, equipo: this.teams[team].id, teamIdx: team, area, frontera: frontier, politica: this.coachState[team].policy, version: this.coachVersion(), regla: spec.rule ?? null, motivo: spec.reason,
    observaciones: spec.observations ?? {}, propuesta: spec.proposal ?? null, estado: 'propuesta', causa: null, orden: null, hechos: [], participantes: spec.participants ?? null, utilidad: spec.utility ?? null, memoria: spec.memory ?? null,
    historia: [{ estado: 'propuesta', paso: this.stepSeq, relojDeportivo: round(this.sportT / 10, 1) }],
  };
  this.decisions.push(d); return d;
};
P.dset = function dset(d, estado, causa = null, extra = {}) {
  d.estado = estado; if (causa != null) d.causa = causa;
  if (extra.orden) d.orden = extra.orden;
  if (extra.hecho) d.hechos.push(extra.hecho);
  if (extra.participantes) d.participantes = extra.participantes;
  d.historia.push({ estado, causa: causa ?? null, paso: this.stepSeq, relojDeportivo: round(this.sportT / 10, 1) });
  return d;
};
// El ciclo de una orden automática actualiza su decisión (vigente/consumida = ejecutada; rechazada, caducada o sustituida = no ejecutada).
P.coachOrderState = function coachOrderState(o, state, reason) {
  const d = o.decisionId ? this.decisions.find((x) => x.id === o.decisionId) : null; if (!d) return;
  // una orden de plan vigente YA está aplicada; una llamada o una falta táctica vigente solo está ligada a su oportunidad (se ejecuta al consumirse)
  const map = { pendiente: 'pendiente', vigente: o.kind === 'plan' ? 'ejecutada' : 'pendiente', consumida: 'ejecutada', rechazada: 'rechazada', caducada: 'cancelada', cancelada: 'cancelada', sustituida: 'cancelada' };
  if (!map[state] || d.estado === map[state]) return;
  if (d.estado === 'ejecutada' && ['caducada', 'cancelada', 'sustituida'].includes(state)) return; // lo ejecutado se conserva (una orden de plan puede ser sustituida después)
  if (state === 'vigente' && d.area === 'adjustments') { const dim = d.propuesta?.dimension; if (dim) this.coachState[d.teamIdx].adjustAt[dim] = this.sportT / 10; }
  this.dset(d, map[state], reason ?? null, { orden: o.id });
};

// ---------------------------------------------------------------- vista permitida del entrenador (§4.1)
// Solo hechos públicos del rival, el plan, la plantilla y los recursos propios, y categorías de Forma y momentos (nunca los valores ocultos).
P.coachView = function coachView(team, frontier = {}) {
  const rules = this.profile.rules; const opp = 1 - team; const st = this.coachState[team];
  const ownV = ownStateView(this, team); const vmap = Object.fromEntries(ownV.jugadores.map((j) => [j.id, j]));
  const periodLen = this.period > rules.quarters ? rules.overtimeSeconds : rules.quarterSeconds;
  const elapsedIn = this.period ? periodLen - this.clock / 10 : 0;
  const regSecs = rules.quarters * rules.quarterSeconds;
  const elapsedReg = !this.period ? 0 : this.period <= rules.quarters ? (this.period - 1) * rules.quarterSeconds + elapsedIn : regSecs;
  const key = foulPeriodKey(this.period || 1, rules);
  const ownFouls = this.teamFouls[team][key] ?? 0; const oppFouls = this.teamFouls[opp][key] ?? 0;
  const ts = this.timeoutStatus(team);
  const plan = this.teams[team].plan;
  const live = this.poss && !this.poss.done;
  const sportNow = this.sportT / 10;
  const mand = st.mandatoryRecent.filter((t) => sportNow - t <= this.profile.coach.timeouts.reorganize.windowSeconds).length;
  return {
    team, frontier,
    clock: { period: this.period, quarters: rules.quarters, lastPeriod: this.period >= rules.quarters, regulation: this.period <= rules.quarters, remainingSeconds: this.clock / 10, shotClockSeconds: this.shotClock / 10, sportSeconds: sportNow, regulationSeconds: regSecs, elapsedRegulationSeconds: elapsedReg },
    score: { own: this.score[team], opp: this.score[opp], margin: this.score[team] - this.score[opp] },
    teamFouls: { own: ownFouls, opp: oppFouls }, bonus: { rivalShootsOnOurFoul: inPenalty(ownFouls, rules), weShootOnTheirFoul: inPenalty(oppFouls, rules) }, foulOut: rules.foulOut,
    timeouts: ts ? { ...ts, lastGrantedSecondsAgo: st.lastTimeout ? sportNow - st.lastTimeout.sport : null, lastReason: st.lastTimeout?.reason ?? null } : null,
    possession: { holder: live ? (this.poss.team === team ? 'own' : 'opp') : null, next: !live && this.nextPoss ? (this.nextPoss.team === team ? 'own' : 'opp') : null },
    own: {
      policy: st.policy, delegation: { ...st.delegation }, lineupControl: this.lineupControl[team].mode, directorPriority: [...plan.directorPriority], participation: plan.participation ? deepCopy(plan.participation) : null, mandatoryRecent: mand,
      players: this.teams[team].ids.map((id) => {
        const s = this.ps[id]; const p = this.pl[id]; const vc = vmap[id];
        return { id, positions: [...p.positions], slot: s.slot, onCourt: s.onCourt, available: s.available, fouls: s.fouls, energy: Math.round(s.energy), stintSeconds: s.stintTenths / 10, benchSeconds: s.benchTenths / 10, playedSeconds: s.playedTenths / 10, locked: s.locked, forma: vc.formaCategoria, momentos: Object.fromEntries(Object.entries(vc.momentos).map(([k, v]) => [k, v.categoria])), abilities: p.abilities };
      }),
      plan: { styles: { ...plan.styles }, midrange: plan.midrange, disposition: plan.disposition, defense: plan.defense, coverage: plan.coverage, navigation: plan.navigation ?? null, pressureHeight: plan.pressureHeight, defStyles: { ...plan.defStyles }, specials: deepCopy(plan.specials ?? []), playbook: plan.playbook.map((b) => ({ ...b })), throwInBook: (plan.throwInBook ?? []).map((b) => ({ ...b })) },
      locks: [...this.manualLocks(team).keys()].sort(),
      memory: this.memorySummary(team),
    },
    opp: { players: this.teams[opp].ids.map((id) => ({ id, onCourt: this.ps[id].onCourt, available: this.ps[id].available, fouls: this.ps[id].fouls })) },
    recent: { own: this.attackLog[team].filter((r) => r.done).slice(-8).map((r) => ({ ...r })), opp: this.attackLog[opp].filter((r) => r.done).slice(-8).map((r) => ({ ...r })) },
  };
};

// ---------------------------------------------------------------- ataques y hechos observables (evidencia de racha)
P.attackRecord = function attackRecord(team, possId) {
  const log = this.attackLog[team]; for (let i = log.length - 1; i >= 0; i--) if (log[i].id === possId) return log[i];
  return null;
};
P.coachStartAttack = function coachStartAttack(poss) {
  this.attackSeq[poss.team] += 1;
  this.attackLog[poss.team].push({ id: poss.id, team: poss.team, points: 0, comfortable: 0, avoidableLosses: 0, denialReorganizations: 0, opponentCoordinationFailures: 0, done: false });
  if (this.attackLog[poss.team].length > 12) this.attackLog[poss.team].shift();
};
P.coachFact = function coachFact(kind, team) {
  const rec = this.poss ? this.attackRecord(team, this.poss.id) : null; if (!rec) return;
  if (kind === 'avoidableLoss') rec.avoidableLosses += 1; else if (kind === 'denialReorganization') rec.denialReorganizations += 1; else if (kind === 'coordinationFailure') rec.opponentCoordinationFailures += 1;
};
P.coachObserveEvent = function coachObserveEvent(ev) {
  if (!ev.possessionId) return;
  for (const st of ev.stats ?? []) {
    if ((st.k === 'shot' || st.k === 'ft') && st.made) { const rec = this.attackRecord(st.team, ev.possessionId); if (rec) rec.points += st.k === 'shot' ? st.points : 1; }
  }
};

// ---------------------------------------------------------------- bloqueos por orden manual (precedencia: manual › automático)
// Una orden manual de plan válida fija sus campos frente a los ajustes automáticos: «hasta cambiarla» (persistente) o «hasta final de cuarto»
// (ámbito de periodo o `lockUntil: 'period'`). Devolver el ámbito «ajustes» al entrenador la libera de forma explícita.
P.manualLocks = function manualLocks(team) {
  const m = new Map();
  for (const o of this.orders) {
    if (o.issuer !== 'manual' || o.team !== team || o.kind !== 'plan' || !o.liveFields?.length || o.lockReleased) continue;
    let active = o.state === 'pendiente';
    if (o.state === 'vigente') {
      const until = o.content.lockUntil ?? (o.scope.kind === 'periodo' ? 'period' : 'change');
      const lp = o.scope.kind === 'periodo' ? o.scope.targetPeriod : (o.activation?.period ?? this.period);
      active = until === 'change' || this.period <= lp;
    }
    if (active) for (const f of o.liveFields) m.set(f, o.id);
  }
  return m;
};
const fieldsOf = (spec) => {
  if (spec.type === 'styles') return Object.keys(spec.styles).map((k) => `styles.${k}`);
  if (spec.type === 'defStyles') return Object.keys(spec.defStyles).map((k) => `defStyles.${k}`);
  if (spec.type === 'defCoverage') return ['coverage', 'navigation'];
  if (spec.type === 'defSpecial') return [`special.${spec.special}`];
  return [];
};
P.pendingPlanFields = function pendingPlanFields(team) {
  const s = new Set();
  for (const o of this.orders) if (o.team === team && o.kind === 'plan' && o.state === 'pendiente' && o.liveFields) for (const f of o.liveFields) s.add(f);
  return s;
};

// Crea una orden automática por la ruta interna (sin registrar un comando manual: se regenera al reproducir y nunca se ejecuta dos veces).
P.autoOrder = function autoOrder(team, spec, d) {
  const o = this.makeOrder({ ...spec, team, issuer: 'auto' });
  o.decisionId = d.id; o.scope = o.scope ?? null;
  const r = this.validateOrder(o);
  if (!r.ok) { this.setState(o, 'rechazada', r.reason); return { ok: false, reason: r.reason, order: o }; }
  this.acceptOrder(o);
  return { ok: true, order: o };
};

// ---------------------------------------------------------------- fronteras: final de posesión e inicio de periodo
P.coachFrontier = function coachFrontier(kind) {
  if (this.status === 'finished' || this.status === 'error') return;
  const fr = this.coachFrontierInfo(kind, { posesionesJugadas: this.possSeq });
  for (let t = 0; t < 2; t++) {
    const view = this.coachView(t, fr);
    this.coachRevalidateTimeouts(t, view);
    this.coachTimeoutRequest(t, view, fr);
    this.coachRiskRefresh(t, view, fr);
    this.coachEndgame(t, view, fr);
    this.coachMemoryAdjust(t, view, fr);
  }
};

// ---------------------------------------------------------------- tiempos muertos
// Patrones reconocidos para los que existe AHORA una respuesta compatible y autorizable (ajustes delegados): solo entonces una pausa «para revisar un problema
// defensivo repetido» tiene algo concreto que comunicar.
P.coachRecognized = function coachRecognized(view) {
  const t = view.team; if (!this.coachState[t].delegation.adjustments) return [];
  const props = memoryProposals(view, this.profile.coach, this.profile.memory);
  return props.filter((pr) => pr.outcome === 'candidatas' && this.coachRespond(t, view, pr, { ignoreHold: true }).chosen).map((pr) => ({ key: pr.key, evidence: pr.evidence, comfortableShare: pr.comfortableShare }));
};
P.coachTimeoutRequest = function coachTimeoutRequest(t, view, fr) {
  const cfg = this.profile.coach; const st = this.coachState[t];
  if (this.periodBreak != null || this.periodStartPending) return;
  const res = decideTimeout(view, cfg, this.coachRecognized(view), this.profile.memory);
  if (res.none) return;
  if (!this.coachOnce(`timeout|${t}|${this.possSeq}|${this.period}|${res.reason}`)) return;
  const d = this.decision(t, 'timeouts', fr, { rule: `ENT04:${res.reason}`, reason: TIMEOUT_TEXT[res.reason], observations: { evidencia: res.evidence, urgente: res.urgent, excepcionDeEnfriamiento: res.cooldownException, usoDeLaReserva: res.reserveUse, causasRechazadas: res.rechazadas, contextoDeFinal: res.finales, recursos: { restantes: view.timeouts.remaining, efectivos: view.timeouts.effective } }, proposal: { tipo: 'tiempo muerto', causa: res.reason } });
  if (!st.delegation.timeouts) { this.dset(d, 'rechazada', 'ámbito «tiempos muertos» no delegado: queda como recomendación'); return; }
  this.dset(d, 'autorizada', 'ámbito delegado; recursos y ventana comprobados al conceder');
  const r = this.autoOrder(t, { type: 'timeout', reason: TIMEOUT_TEXT[res.reason], cause: res.reason }, d);
  if (!r.ok) this.dset(d, 'rechazada', r.reason);
};
const TIMEOUT_TEXT = { prepareAction: 'preparar la acción o el saque final', runWithDisorder: 'racha rival con desorden propio', repeatedDefensiveProblem: 'revisar un problema defensivo repetido', reorganize: 'reorganizar tras perder una función', contextualRest: 'descanso contextual' };
// Una solicitud automática pendiente se revalida en cada frontera y al conceder: si su causa ya no existe, se cancela con motivo.
P.coachTimeoutStillValid = function coachTimeoutStillValid(o) {
  const view = this.coachView(o.team, this.coachFrontierInfo('revalidación'));
  const causes = timeoutCauses(view, this.profile.coach, this.coachRecognized(view), this.profile.memory).map((c) => c.code);
  return causes.includes(o.content.cause) ? { ok: true } : { ok: false, reason: `la causa «${TIMEOUT_TEXT[o.content.cause] ?? o.content.cause}» ya no se cumple` };
};
P.coachRevalidateTimeouts = function coachRevalidateTimeouts(t, view) {
  for (const o of this.orders) {
    if (o.type !== 'timeout' || o.issuer !== 'auto' || o.team !== t || o.state !== 'pendiente') continue;
    const manualPending = this.orders.some((x) => x !== o && x.type === 'timeout' && x.issuer === 'manual' && x.team === t && x.state === 'pendiente');
    if (manualPending) { this.setState(o, 'cancelada', 'hay una solicitud manual de tiempo muerto: prevalece'); continue; }
    const v = this.coachTimeoutStillValid(o); if (!v.ok) this.setState(o, 'cancelada', v.reason);
  }
};

// ---------------------------------------------------------------- rotaciones: obligatorias (administración) y voluntarias (política delegada)
// Candidato de entrada a una posición: toda la plantilla disponible en banquillo; la posición nominal orienta y desempata, no filtra.
P.benchPool = function benchPool(team, used) { return this.teams[team].ids.filter((id) => this.ps[id].available && !this.ps[id].onCourt && !used.has(id)); };
P.coachMandatory = function coachMandatory(team, window, used) {
  const st = this.coachState[team];
  for (const slot of SLOTS) {
    const out = this.lineup[team][slot];
    if (this.ps[out].available) continue;
    // la fila de mayor prioridad del librillo para un jugador no disponible es la reglamentaria: sin excepción deportiva
    const fb = foulBookRow(this.coachView(team, this.coachFrontierInfo('ventana', { ventana: window })), this.profile.coach, { available: false, fouls: this.ps[out].fouls }, false);
    const pool = this.benchPool(team, used);
    const scored = pool.map((id) => ({ id, u: this.slotUtility(id, slot), nom: this.pl[id].positions.includes(slot) ? 0 : 1 })).sort((a, b) => a.nom - b.nom || b.u - a.u || (a.id < b.id ? -1 : 1));
    // la posición nominal orienta: primero quien la ocupa; si nadie, el mejor ajuste funcional
    const best = scored[0];
    // MOTOR-09 (RG-D02): sin sustituto elegible no se mantiene a un excluido ni se inventa un sexto jugador: la inferioridad legal no está simulada por el motor natural
    // y la ejecución se declara INVÁLIDA con diagnóstico (el caso se estudia con los casos preparados de laboratorio).
    if (!best) throw new Error(`inferioridad no simulada: ${this.teams[team].id} no tiene un sustituto elegible para ${slot}; la ejecución no produce un acta final (RG-D02)`);
    used.add(best.id);
    const before = this.onCourt(team).slice();
    const d = this.decision(team, 'rotation', this.coachFrontierInfo('ventana', { ventana: window }), { rule: fb?.reason ?? 'FB100_REGLAMENTO', reason: 'sustitución obligatoria: jugador excluido o indisponible (administración reglamentaria, no delegable)', observations: { fila: fb?.id ?? null, preferencia: fb?.preference ?? null, excepcion: fb?.exception ?? null, saliente: out, faltas: this.ps[out].fouls, candidatos: scored.map((x) => ({ id: x.id, utilidad: round(x.u, 3), posicionNominal: x.nom === 0 })) }, proposal: { tipo: 'sustitución', sale: out, entra: best.id, posicion: slot }, participants: { antes: before }, utility: { escala: '1–30', entrante: round(best.u, 3) } });
    this.dset(d, 'autorizada', 'obligación reglamentaria');
    this.substitute(team, slot, out, best.id, 'excluido', { window, decision: d });
    st.mandatoryRecent.push(this.sportT / 10);
  }
};
P.coachRotation = function coachRotation(team, window, shooter, used) {
  const st = this.coachState[team]; const cfg = this.profile.coach; const dl = st.delegation;
  if (!(dl.rotation || dl.fouls || dl.endgame)) return;
  if (this.lineupControl[team].mode === 'manual') { this.coachManualHold(team, window); return; } // orden manual de quinteto vigente: prevalece sobre la política
  const fr = this.coachFrontierInfo('ventana', { ventana: window });
  const view = this.coachView(team, fr);
  const res = decideRotation(view, cfg, this.profile, { rotation: dl.rotation, fouls: dl.fouls, endgame: dl.endgame });
  for (const k of res.kept) {
    const key = `kept|${team}|${k.jugador}|${k.fila}|${k.faltas}|${this.period}`;
    if (!this.coachOnce(key)) continue;
    const d = this.decision(team, 'fouls', fr, { rule: k.fila, reason: `se mantiene a ${k.jugador}: ${k.motivo}`, observations: { faltas: k.faltas, preferencia: k.preferencia, reduceRiesgo: k.reduceRiesgo }, proposal: { tipo: 'mantener', jugador: k.jugador } });
    this.dset(d, 'ejecutada', 'sin cambio: la decisión de mantener es la acción');
  }
  for (const p of res.proposals) {
    if (used.has(p.in) || used.has(p.out)) continue;
    const before = this.onCourt(team).slice();
    const area = p.reason === 'proteccion_faltas' || p.reason === 'faltas_cierre' ? 'fouls' : p.reason === 'necesidad_final' ? 'endgame' : 'rotation';
    const d = this.decision(team, area, fr, { rule: p.fila ?? `ENT02:${p.reason}`, reason: ROTATION_TEXT[p.reason], observations: { razones: p.razones, estabilidad: p.estabilidad, energia: p.energia, faltas: p.faltas, socioDelPlan: p.socioDelPlan, contextoDeFinal: res.endgame }, proposal: { tipo: 'sustitución', sale: p.out, entra: p.in, posicion: p.slot }, participants: { antes: before }, utility: p.utilidad });
    if (p.out === shooter) { this.dset(d, 'rechazada', 'lanzador de libres pendiente: no puede salir antes de tirar'); continue; }
    if (this.ps[p.out].locked || this.ps[p.in].locked) { this.dset(d, 'rechazada', 'reentrada inmediata: espera a que corra el reloj'); continue; }
    this.dset(d, 'autorizada', `ámbito «${AREA_TEXT[area]}» delegado; ventana reglamentaria de sustitución`);
    used.add(p.in); used.add(p.out);
    this.substitute(team, p.slot, p.out, p.in, p.reason, { window, decision: d });
  }
};
// Con el quinteto bajo orden manual la política no actúa; se deja constancia (una vez por jugador y faltas) de lo que el librillo habría considerado.
P.coachManualHold = function coachManualHold(team, window) {
  const cfg = this.profile.coach; const view = this.coachView(team, this.coachFrontierInfo('ventana', { ventana: window }));
  for (const p of view.own.players) {
    if (!p.onCourt || !p.available) continue;
    const manual = foulBookRow(view, cfg, p, true); const auto = foulBookRow(view, cfg, p, false);
    if (manual?.preference !== 'obey_manual' || !auto || !['protect', 'reduce_risk_consider_relief'].includes(auto.preference)) continue;
    if (!this.coachOnce(`manualhold|${team}|${p.id}|${p.fouls}|${this.period}`)) continue;
    const d = this.decision(team, 'fouls', view.frontier, { rule: manual.id, reason: `orden manual vigente: se respeta; el librillo (${auto.id}) habría considerado proteger a ${p.id}`, observations: { faltas: p.fouls, excepcion: manual.exception }, proposal: { tipo: 'mantener', jugador: p.id } });
    this.dset(d, 'rechazada', 'orden manual de quinteto vigente: prevalece sobre la decisión automática');
  }
};
const AREA_TEXT = { rotation: 'rotaciones', adjustments: 'ajustes tácticos', fouls: 'gestión de faltas', timeouts: 'tiempos muertos', endgame: 'finales' };
const ROTATION_TEXT = { energia_critica: 'energía crítica: el relevo compensa aun perdiendo utilidad', proteccion_faltas: 'protección por faltas (librillo)', fatiga: 'fatiga: el relevo adecuado cabe en la tolerancia de pérdida de utilidad', faltas_cierre: 'comparación de valor en un cierre con faltas', tramo_largo: 'tramo largo en pista: el relevo mejora la utilidad por encima de la ventaja mínima', participacion: 'desvío del plan de participación: el relevo mejora la utilidad', necesidad_final: 'necesidad situacional de final (libres, pase, defensa, rebote o creación)' };
export { AREA_TEXT, ROTATION_TEXT, TIMEOUT_TEXT };

// ---------------------------------------------------------------- riesgo por faltas: reducir intentos voluntarios de robo (sin tocar la probabilidad de falta)
P.coachRiskRefresh = function coachRiskRefresh(t, view, fr) {
  const st = this.coachState[t]; const cfg = this.profile.coach; const next = new Set();
  if (st.delegation.fouls) {
    const locked = this.manualLocks(t).has('defStyles.steal');
    const pol = cfg.policies[st.policy]; const eg = endgameState(view, cfg, pol);
    for (const p of view.own.players) {
      if (!p.onCourt || !p.available) continue;
      const row = foulBookRow(view, cfg, p, view.own.lineupControl === 'manual');
      if (!row || !['protect', 'reduce_risk_consider_relief'].includes(row.preference) || eg.urgent) continue;
      if (locked) { const k = `risk-locked|${t}|${p.id}|${p.fouls}`; if (this.coachOnce(k)) { const d = this.decision(t, 'fouls', fr, { rule: row.id, reason: `no se reducen los intentos de robo de ${p.id}: orden manual vigente sobre el estilo de robo`, observations: { faltas: p.fouls }, proposal: { tipo: 'reducir riesgo evitable', jugador: p.id } }); this.dset(d, 'rechazada', 'orden manual vigente sobre «defStyles.steal»'); } continue; }
      next.add(p.id);
      const k = `risk|${t}|${p.id}|${p.fouls}|${row.id}`;
      if (this.coachOnce(k)) { const d = this.decision(t, 'fouls', fr, { rule: row.id, reason: `reducir intentos voluntarios de robo de ${p.id} (protección por faltas; no cambia la probabilidad de falta)`, observations: { faltas: p.fouls, nivelesMenos: cfg.foulProtection.stealStyleLevelReduction }, proposal: { tipo: 'reducir riesgo evitable', jugador: p.id } }); this.dset(d, 'ejecutada', 'activo mientras se mantenga en pista con riesgo'); }
    }
  }
  st.riskProtected = next;
};

// ---------------------------------------------------------------- finales: prioridades por contexto sobre el mismo motor
P.coachPendingSame = function coachPendingSame(t, type, special = null) {
  return this.orders.some((o) => o.team === t && o.type === type && (o.state === 'pendiente' || o.state === 'vigente') && (!special || o.content.special === special) && o.issuer === 'auto');
};
P.coachEndgame = function coachEndgame(t, view, fr) {
  const st = this.coachState[t]; const cfg = this.profile.coach;
  if (!st.delegation.endgame || this.periodBreak != null) return;
  const out = decideEndgame(view, cfg); const plan = this.teams[t].plan; const locks = this.manualLocks(t); const pend = this.pendingPlanFields(t);
  const ctxKey = out.contexts.join('+') || 'ninguno';
  const apply = (area, dim, spec, label, base) => {
    const fields = fieldsOf(spec); const free = fields.filter((f) => !locks.has(f) && !pend.has(f));
    const blocked = fields.filter((f) => locks.has(f));
    const key = `endgame|${t}|${ctxKey}|${dim}|${JSON.stringify(spec)}`;
    if (!this.coachOnce(key)) return;
    const d = this.decision(t, area, fr, { rule: `ENT06:${label}`, reason: label, observations: { contextos: out.contexts, bloqueadoPorOrdenManual: blocked, pendientes: fields.filter((f) => pend.has(f)), ...base }, proposal: { ...spec, dimension: dim } });
    if (blocked.length === fields.length) { this.dset(d, 'rechazada', `orden manual vigente sobre ${blocked.join(', ')}`); return; }
    if (!free.length) { this.dset(d, 'cancelada', 'ya hay una orden pendiente sobre esos campos'); return; }
    this.dset(d, 'autorizada', 'ámbito «finales» delegado; excepción de permanencia por necesidad final');
    const r = this.autoOrder(t, spec, d); if (!r.ok) this.dset(d, 'rechazada', r.reason);
  };
  // ataque: estilos del contexto de mayor prioridad que los define; al terminar el contexto se restauran los que cambió el entrenador
  const want = out.offense ? out.offense.styles : {};
  const change = {}; const restore = {};
  for (const [k, v] of Object.entries(want)) if (plan.styles[k] !== v && !pend.has(`styles.${k}`) && !locks.has(`styles.${k}`)) change[k] = v;
  for (const [k, rec] of Object.entries(st.endgameApplied)) if (!(k in want) && plan.styles[k] === rec.applied && !locks.has(`styles.${k}`) && !pend.has(`styles.${k}`)) restore[k] = rec.previous;
  if (Object.keys(change).length) {
    for (const [k, v] of Object.entries(change)) if (!st.endgameApplied[k]) st.endgameApplied[k] = { previous: plan.styles[k], applied: v }; else st.endgameApplied[k].applied = v;
    apply('endgame', 'offense', { type: 'styles', styles: change }, `contexto ${out.offense.context}: prioridades de ataque`, { contexto: out.offense.context });
  } else if (out.offense && Object.keys(want).some((k) => locks.has(`styles.${k}`))) apply('endgame', 'offense', { type: 'styles', styles: Object.fromEntries(Object.entries(want).filter(([k]) => locks.has(`styles.${k}`))) }, `contexto ${out.offense.context}: prioridades de ataque`, { contexto: out.offense.context });
  if (Object.keys(restore).length) {
    for (const k of Object.keys(restore)) delete st.endgameApplied[k];
    apply('endgame', 'offense', { type: 'styles', styles: restore }, 'terminó el contexto de final: se restauran los estilos que cambió el entrenador', {});
  }
  // defensa: proteger la opción que cambia el objetivo
  if (out.defense) {
    const ds = {}; for (const [k, v] of Object.entries(out.defense.defStyles)) if (plan.defStyles[k] !== v) ds[k] = v;
    if (Object.keys(ds).length) {
      for (const [k, v] of Object.entries(ds)) { const key = `defStyles.${k}`; if (!st.endgameApplied[key]) st.endgameApplied[key] = { previous: plan.defStyles[k], applied: v }; else st.endgameApplied[key].applied = v; }
      apply('endgame', 'defense', { type: 'defStyles', defStyles: ds }, `contexto ${out.defense.context}: defender la amenaza que cambia el objetivo`, { contexto: out.defense.context });
    }
  }
  for (const [key, rec] of Object.entries(st.endgameApplied)) {
    if (!key.startsWith('defStyles.')) continue; const k = key.slice(10);
    if (!out.defense && plan.defStyles[k] === rec.applied && !locks.has(key) && !pend.has(key)) { delete st.endgameApplied[key]; apply('endgame', 'defense', { type: 'defStyles', defStyles: { [k]: rec.previous } }, 'terminó el contexto de final: se restaura el estilo defensivo', {}); }
  }
  // detener el reloj: falta táctica (orden puntual; el contacto debe poder producirse y se administra con su clasificación real)
  if (out.tacticalFoul && !this.coachPendingSame(t, 'defSpecial', 'ESPD01')) {
    const live = this.poss && !this.poss.done && this.poss.team !== t;
    const key = `tfoul|${t}|${this.possSeq}|${this.period}`;
    if (this.coachOnce(key)) {
      const d = this.decision(t, 'endgame', fr, { rule: 'ENT06:detener reloj', reason: 'detener el reloj con una falta táctica legal', observations: out.tacticalFoul, proposal: { tipo: 'falta táctica (ESPD01)', ambito: live ? 'posesión rival actual' : 'siguiente posesión rival' } });
      this.dset(d, 'autorizada', 'equipo por detrás, tramo urgente habilitado y posesión rival; no garantiza el contacto ni su clasificación');
      const r = this.autoOrder(t, { type: 'defSpecial', special: 'ESPD01', target: 'holder', scope: live ? 'current' : 'next' }, d); if (!r.ok) this.dset(d, 'rechazada', r.reason);
    }
  }
  // preparar la última acción: llamada de la ficha de mayor prioridad del libro (si es realizable; si no, caduca con su motivo)
  if (out.call && !this.coachPendingSame(t, 'call') && view.possession.next === 'own') {
    const book = [...plan.playbook].sort((a, b) => a.priority - b.priority || (a.playId < b.playId ? -1 : 1));
    if (book.length && this.coachOnce(`call|${t}|${this.possSeq}`)) {
      const d = this.decision(t, 'endgame', fr, { rule: 'ENT06:preparar última acción', reason: 'preparar la última acción con la ficha de mayor prioridad del libro', observations: out.call, proposal: { tipo: 'llamada de ficha', ficha: book[0].playId } });
      this.dset(d, 'autorizada', 'ámbito delegado; se consume al empezar la ficha o caduca con motivo');
      const r = this.autoOrder(t, { type: 'call', playId: book[0].playId, target: 'next' }, d); if (!r.ok) this.dset(d, 'rechazada', r.reason);
    }
  }
};

// ---------------------------------------------------------------- memoria → respuesta propuesta (ruta A: pasa por ENT y su ventana)
const DEF_PLAN_ORDER = { defCoverage: 'defCoverage', defStylesDelta: 'defStyles', defSpecial: 'defSpecial' };
P.coachBuildResponse = function coachBuildResponse(t, view, cand, entry) {
  const o = cand.order; const plan = this.teams[t].plan;
  const spec = deepCopy(o);
  if (o.type === 'defStylesDelta') {
    const [lo, hi] = this.profile.coach.adjustments.styleLevelBounds; const cur = plan.defStyles[o.key]; const next = clamp(cur + o.delta, lo, hi);
    if (next === cur) return { skip: `sin margen: «${o.key}» ya está en el nivel ${cur}` };
    return { spec: { type: 'defStyles', defStyles: { [o.key]: next } }, summary: `${o.key} ${cur} → ${next}` };
  }
  if (o.type === 'defCoverage') {
    if (plan.coverage === o.coverage && (o.navigation == null || plan.navigation === o.navigation)) return { skip: `ya vigente: ${o.coverage}` };
    return { spec: { type: 'defCoverage', coverage: o.coverage, ...(o.navigation ? { navigation: o.navigation } : {}) }, summary: `cobertura ${o.coverage}` };
  }
  if (o.type === 'defSpecial') {
    const cfg = deepCopy(o.config);
    for (const [k, v] of Object.entries(cfg)) if (v === '$actor') cfg[k] = entry.specific.actor; else if (v === '$abandoned') cfg[k] = entry.specific.abandoned;
    if (Object.values(cfg).some((v) => v === null && false)) return { skip: 'falta el componente específico' };
    if (o.special === 'ESPD02' && !cfg.principal) return { skip: 'sin protagonista específico observado' };
    if (o.special === 'ESPD03' && !cfg.protected) return { skip: 'sin receptor abandonado observado' };
    const cur = (plan.specials ?? []).find((x) => x.id === o.special);
    if (cur && JSON.stringify({ ...cur, id: undefined }) === JSON.stringify({ ...cfg })) return { skip: `ya vigente: ${o.special}` };
    return { spec: { type: 'defSpecial', special: o.special, config: cfg }, summary: `${o.special} sobre ${cfg.principal ?? cfg.protected}` };
  }
  return { skip: `tipo de respuesta desconocido: ${o.type}` };
};
// Coberturas válidas para la familia de un patrón (tabla de compatibilidad de las fichas: bloqueo directo admite las cuatro; entrega, COB01/COB02/COB04; indirecto, COB01/COB02).
// Una cobertura se propone solo si TODAS las fichas de esa familia la admiten: no se hereda indiscriminadamente del directo. Familias sin cobertura por interacción: sin restricción.
P.coverageCompatible = function coverageCompatible(familyKey, cob) {
  const map = this.profile.memory.keys.familyMap;
  const plays = Object.values(this.rep().plays).filter((p) => (map[p.family] ?? p.family) === familyKey && p.coverage);
  if (!plays.length) return { ok: false, motivo: `la familia ${familyKey} no resuelve coberturas por interacción: no hay respuesta de cobertura aplicable` };
  const bad = plays.find((p) => !(p.coverage === true ? PNR_ALLOWED : p.coverage.allowed).includes(cob));
  return bad ? { ok: false, motivo: `${cob} no es una respuesta compatible con ${bad.family === 'handoff' ? 'una entrega' : bad.family === 'off_ball_screen' ? 'un bloqueo indirecto' : bad.family}` } : { ok: true };
};
// Evalúa las respuestas candidatas de un patrón reconocido contra el plan, los bloqueos manuales, la permanencia y la validación conjunta del plan.
// `ignoreHold`: para justificar una pausa basta con que exista una respuesta compatible (la permanencia solo condiciona aplicarla).
P.coachRespond = function coachRespond(t, view, pr, { ignoreHold = false } = {}) {
  const st = this.coachState[t]; const cfg = this.profile.coach; const pol = cfg.policies[st.policy];
  const locks = this.manualLocks(t); const pend = this.pendingPlanFields(t);
  const oppOn = new Set(view.opp.players.filter((p) => p.onCourt && p.available).map((p) => p.id));
  const ownOn = new Set(view.own.players.filter((p) => p.onCourt && p.available).map((p) => p.id));
  const entry = view.own.memory.find((e) => e.key === pr.key); const causes = []; let chosen = null;
  for (const cand of pr.candidates ?? []) {
    const built = this.coachBuildResponse(t, view, cand, entry);
    if (built.skip) { causes.push({ respuesta: cand.id, motivo: built.skip }); continue; }
    const fields = fieldsOf(built.spec);
    if (built.spec.type === 'defCoverage') { const fam = this.profile.memory.patterns.find((p) => p.id === pr.pattern)?.family; const cc = this.coverageCompatible(fam, built.spec.coverage); if (!cc.ok) { causes.push({ respuesta: cand.id, motivo: cc.motivo }); continue; } }
    const lk = fields.filter((f) => locks.has(f)); if (lk.length) { causes.push({ respuesta: cand.id, motivo: `orden manual vigente sobre ${lk.join(', ')}` }); continue; }
    if (fields.some((f) => pend.has(f))) { causes.push({ respuesta: cand.id, motivo: 'ya hay una orden pendiente sobre ese campo' }); continue; }
    const last = st.adjustAt[cand.dimension]; const secs = this.sportT / 10;
    if (!ignoreHold && last != null && secs - last < pol.adjustmentHold) { causes.push({ respuesta: cand.id, motivo: `permanencia: faltan ${Math.ceil(pol.adjustmentHold - (secs - last))} s de la política` }); continue; }
    // MEM04: el componente específico se revalida con el quinteto actual (la evidencia general se conserva)
    if (this.profile.memory.applicability.specificComponentRequiresOnCourt) {
      if (cand.order.config?.principal === '$actor' && !oppOn.has(pr.specific?.actor)) { causes.push({ respuesta: cand.id, motivo: `el protagonista específico ${pr.specific?.actor ?? '—'} no está en pista` }); continue; }
      if (pr.pattern === 'MEMP06' && !ownOn.has(pr.specific?.helper)) { causes.push({ respuesta: cand.id, motivo: `el defensor ${pr.specific?.helper ?? '—'} que ayudaba no está en pista` }); continue; }
    }
    const errs = this.checkDefensePlan(t, [{ type: built.spec.type, content: this.pseudoContent(built.spec), team: t }]);
    if (errs.length) { causes.push({ respuesta: cand.id, motivo: `incompatible con el plan: ${errs[0]}` }); continue; }
    chosen = { cand, built }; break;
  }
  return { chosen, causes };
};
P.coachMemoryAdjust = function coachMemoryAdjust(t, view, fr) {
  const st = this.coachState[t]; const cfg = this.profile.coach; const pol = cfg.policies[st.policy];
  const props = memoryProposals(view, cfg, this.profile.memory);
  for (const e of view.own.memory) if (e.evidence < pol.recognitionThreshold) { const en = this.memoryEntry(t, e.key); if (en) { en.recognizedLogged = false; en.episodeActive = false; } } // el episodio de reconocimiento termina al bajar la evidencia
  if (!props.length) return;
  let applied = 0; const maxDims = cfg.adjustments.maxPrincipalDimensionsPerReview; // una dimensión principal por revisión ordinaria
  for (const pr of props) {
    const ent0 = this.memoryEntry(t, pr.key);
    const ver = `${pr.key}|${ent0?.lastAttack}|${st.delegation.adjustments}`;
    // «reconocido sin respuesta» se registra una vez por episodio de reconocimiento (no en cada exposición); las candidatas se reintentan con cada exposición nueva
    if (pr.outcome !== 'candidatas') { if (ent0?.recognizedLogged) continue; if (ent0) ent0.recognizedLogged = true; }
    if (!this.coachOnce(`mem|${t}|${ver}`)) continue;
    const base = { patron: pr.key, evidencia: round(pr.evidence, 3), umbral: pr.threshold, cómodas: round(pr.comfortableShare, 3), especifico: pr.specific };
    const d = this.decision(t, 'adjustments', fr, { rule: `MEM03:${pr.pattern ?? pr.key}`, reason: `patrón reconocido: ${pr.patternName ?? pr.key}`, observations: base, memory: { clave: pr.key, evidencia: round(pr.evidence, 3) }, proposal: null });
    if (ent0 && !ent0.episodeActive) { ent0.episodeActive = true; ent0.episodeSeq = (ent0.episodeSeq ?? 0) + 1; } // MOTOR-09: episodio de reconocimiento (cruce del umbral); las revisiones posteriores del mismo patrón no son patrones nuevos
    this.memLogPush('reconocimiento', t, { clave: pr.key, evidencia: round(pr.evidence, 3), umbral: pr.threshold, cómodas: round(pr.comfortableShare, 3), episodio: ent0?.episodeSeq ?? null });
    if (pr.outcome !== 'candidatas') { this.dset(d, 'rechazada', `reconocido, sin respuesta autorizada/compatible: ${pr.causa}`); continue; }
    if (!st.delegation.adjustments) { this.dset(d, 'rechazada', 'reconocido; ámbito «ajustes tácticos» no delegado: queda como recomendación'); continue; }
    if (applied >= maxDims) { this.dset(d, 'cancelada', 'una dimensión principal por revisión ordinaria: se atiende otro patrón'); continue; }
    const { chosen, causes } = this.coachRespond(t, view, pr);
    d.observaciones = { ...d.observaciones, candidatasDescartadas: causes };
    if (!chosen) { this.dset(d, 'rechazada', 'reconocido, sin respuesta autorizada/compatible'); continue; }
    d.propuesta = { respuesta: chosen.cand.id, dimension: chosen.cand.dimension, ...chosen.built.spec, resumen: chosen.built.summary, concesion: chosen.cand.concession };
    this.dset(d, 'autorizada', 'ámbito «ajustes tácticos» delegado; compatible con el plan y sin orden manual en conflicto');
    const r = this.autoOrder(t, chosen.built.spec, d);
    if (!r.ok) { this.dset(d, 'rechazada', r.reason); continue; }
    st.adjustAt[chosen.cand.dimension] = this.sportT / 10;
    const ent = this.memoryEntry(t, pr.key);
    if (ent) { ent.response = { id: chosen.cand.id, concesion: chosen.cand.concession, decision: d.id }; ent.lastAdjust = { respuesta: chosen.cand.id, orden: r.order.id, ataque: this.attackSeq[1 - t], relojDeportivo: round(this.sportT / 10, 1) }; }
    this.memLogPush('respuesta', t, { clave: pr.key, respuesta: chosen.cand.id, decision: d.id, orden: r.order.id, concesion: chosen.cand.concession });
    applied += 1;
  }
};
// Contenido de una orden hipotética para validar la configuración conjunta sin crearla.
P.pseudoContent = function pseudoContent(spec) { const { type, ...rest } = spec; return rest; };

// ---------------------------------------------------------------- consultas para el registro y la interfaz
export function coachCounts(decisions, orders = []) {
  const by = (f) => decisions.filter(f).length;
  const rot = decisions.filter((d) => d.propuesta?.tipo === 'sustitución');
  const reasons = {}; for (const d of rot.filter((x) => x.estado === 'ejecutada')) { const r = d.observaciones?.razones?.[0] ?? (d.regla === 'FB100_REGLAMENTO' ? 'obligatoria' : 'otra'); reasons[r] = (reasons[r] ?? 0) + 1; }
  const timeouts = decisions.filter((d) => d.area === 'timeouts');
  const adj = decisions.filter((d) => d.area === 'adjustments');
  const finals = decisions.filter((d) => d.area === 'endgame');
  return {
    sustituciones: { propuestas: rot.length, ejecutadas: rot.filter((d) => d.estado === 'ejecutada').length, porMotivo: reasons, excepcionesDeEstabilidad: rot.filter((d) => d.estado === 'ejecutada' && d.observaciones?.estabilidad?.excepcion).length },
    tiemposMuertos: { solicitados: timeouts.length, ejecutados: timeouts.filter((d) => d.estado === 'ejecutada').length, cancelados: timeouts.filter((d) => d.estado === 'cancelada').length, rechazados: timeouts.filter((d) => d.estado === 'rechazada').length },
    ajustes: { propuestos: adj.filter((d) => d.propuesta).length, aplicados: adj.filter((d) => d.propuesta && d.estado === 'ejecutada').length, reconocidos: adj.length, sinRespuesta: adj.filter((d) => !d.propuesta).length },
    finales: { decisiones: finals.length, ejecutadas: finals.filter((d) => d.estado === 'ejecutada').length },
    faltas: { decisiones: by((d) => d.area === 'fouls'), mantener: by((d) => d.area === 'fouls' && d.propuesta?.tipo === 'mantener') },
    ordenesAutomaticas: orders.filter((o) => o.issuer === 'auto').length,
  };
}
export function describeDecision(d) {
  const p = d.propuesta;
  if (p?.tipo === 'sustitución') return `${d.equipo}: sale ${p.sale}, entra ${p.entra} (${d.motivo})`;
  if (p?.tipo === 'tiempo muerto') return `${d.equipo}: tiempo muerto — ${d.motivo}`;
  if (p?.tipo === 'mantener') return `${d.equipo}: ${d.motivo}`;
  if (p?.tipo === 'reducir riesgo evitable') return `${d.equipo}: ${d.motivo}`;
  if (p?.resumen) return `${d.equipo}: ajuste ${p.resumen} (${d.motivo})`;
  return `${d.equipo}: ${d.motivo}`;
}
