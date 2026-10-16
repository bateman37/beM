// Flujo de posesiones: entrada (saque, transición), selección de ficha, salidas, ayuda, pases adicionales,
// reorganización, recursos directos (ESP), periodos y arranque del partido.
import { clamp, sigmoid, logit, round } from './mathx.js';
import { SLOTS, ZONES } from './data.js';
import { MatchCore } from './core.js';
import { PLAY_SPEC, fit } from './plays.js';
import { toTenths, periodLengthTenths, isOvertime, foulPeriodKey } from './rules.js';

const P = MatchCore.prototype;
const ZONE_TEC = { three: 'TEC01', midrange: 'TEC02', inside: 'TEC03', rim: 'TEC04' };

// ---------------------------------------------------------------- tiempo en varias partes dentro de un hecho
P.consumeParts = function consumeParts(parts) {
  let first = null; let last = null; let dur = 0;
  for (const [d, load] of parts) {
    const t = this.consume(d, load);
    if (!first) first = t;
    last = t; dur += d;
  }
  return { dur, clockBefore: first.clockBefore, clockAfter: last.clockAfter, shotBefore: first.shotBefore, shotAfter: last.shotAfter };
};

// Sobrescribe la planificación para sumar los pases adicionales (continuaciones) a la duración del hecho.
const basePlan = P.planDuration;
P.planDurationWithExtra = function planDurationWithExtra(spec, cat, purpose, extra) {
  if (!extra) { const p = basePlan.call(this, spec, cat, purpose); return p.expired ? p : { parts: [[p.tenths, p.load]], total: p.tenths }; }
  const cont = this.profile.durationSeconds.continuation;
  const reserve = extra * Math.round(cont[0] * 10);
  const lim = this.limit();
  this.limit = () => lim - reserve; // reserva el mínimo de las continuaciones
  const p = basePlan.call(this, spec, cat, purpose);
  delete this.limit;
  if (p.expired) return p;
  const parts = [[p.tenths, p.load]]; let used = p.tenths;
  for (let i = 0; i < extra; i++) {
    const remaining = lim - used - (extra - 1 - i) * Math.round(cont[0] * 10);
    const d = this.sampleDuration(cont, `${purpose}:pase adicional ${i + 1}`, { limit: remaining });
    parts.push([d, 'continuation']); used += d;
  }
  return { parts, total: used };
};

// ---------------------------------------------------------------- resolución con duración compuesta
P.resolveAttempt = function resolveAttempt(ex) {
  const w = this.categoryWeights(ex);
  const items = ['turnover', 'defensiveNonShootingFoul', 'shootingFoul', 'fieldShot', 'looseBall', 'offensiveFoul', 'ballViolation'].filter((k) => w[k] > 0).map((k) => ({ key: k, w: w[k] }));
  const cat = this.pick(items, 'categoría').key;
  ex.category = cat;
  const spec = this.durationKindFor(ex, cat);
  const plan = this.planDurationWithExtra(spec, cat, 'duración', ex.extraPasses ?? 0);
  if (plan.expired) return this.expire(ex, cat);
  const t = this.consumeParts(plan.parts);
  const base = {
    t, team: ex.team,
    intent: { origen: ex.origin, continuacion: ex.chain?.length ? ex.chain : (ex.label ?? null), oportunidad: ex.opportunity ?? null, zona: ex.zone, calidad: ex.quality?.cls ?? null, categoria: cat, ejecucion: ex.exec },
    participants: this.participantsOf(ex),
  };
  switch (cat) {
    case 'fieldShot': return this.resolveShot(ex, base, false);
    case 'shootingFoul': return this.resolveShot(ex, base, true);
    case 'turnover': return this.resolveTurnover(ex, base);
    case 'defensiveNonShootingFoul': return this.resolveDefensiveFoul(ex, base);
    case 'offensiveFoul': return this.resolveOffensiveFoul(ex, base);
    case 'ballViolation': return this.resolveBallViolation(ex, base);
    case 'looseBall': return this.resolveLooseBall(ex, base);
    default: throw new Error(`categoría desconocida ${cat}`);
  }
};

// ---------------------------------------------------------------- salidas (jugador, zona): pesos de entrenador, preferencia y valor
P.scoreExits = function scoreExits(team, exits, shotWeights) {
  // coach: pesos de salida de la ficha * estilo * reparto entre los actores de esa zona (abilityFit y vocación)
  const byZone = {};
  for (const e of exits) {
    const share = fit(this.profile, this.eff(e.actor, ZONE_TEC[e.zone])) * (0.35 + 0.65 * this.pl[e.actor].finishingVocation);
    e._share = share; (byZone[e.zone] ??= []).push(e);
  }
  for (const e of exits) {
    const tot = byZone[e.zone].reduce((s, x) => s + x._share, 0);
    e.coach = shotWeights ? (shotWeights[e.zone] ?? 0) * this.zoneStyleMult(team, e.zone) * (e._share / tot) : null;
    e.pref = this.prefWeight(e);
    e.adapt = this.estimateValue(e);
  }
  return exits;
};

// ---------------------------------------------------------------- calidad, ayuda y pases adicionales sobre una salida
P.playQuality = function playQuality(entry, ex) {
  const play = entry.play;
  const actors = { ...entry.roles }; const defs = { ...entry.def };
  const merged = { ...actors, ...defs };
  const terms = play.qualityAttack;
  let num = 0; let den = 0;
  const trace = [];
  for (const [role, attr, w] of terms) {
    const pid = merged[role];
    let v;
    if (role === 'director' && attr === 'MEN01') v = this.taskValue('TAR01', 'attack', { director: pid }, 'coordinación_TAR01');
    else v = this.eff(pid, attr);
    num += w * v; den += w;
  }
  const CA = num / den;
  this.note(`calidad_ataque:${play.id}`, { valor: round(CA, 4), receta: terms.map(([role, attr, w]) => ({ rol: role, jugador: merged[role], cap: attr, peso: w, efectiva: round(role === 'director' && attr === 'MEN01' ? this.taskValue('TAR01', 'attack', { director: merged[role] }) : this.eff(merged[role], attr), 3) })) });
  const CD = this.recipe(play.qualityDefense, merged, null, `calidad_defensa:${play.id}`);
  return { CA, CD };
};

P.tryHelp = function tryHelp(ex, L, q) {
  const opp = this.profile.opportunity; const team = ex.team; const defT = 1 - team;
  const interior = ex.zone === 'rim' || ex.zone === 'inside';
  if (!interior) return { K: 0 };
  const slots = this.profile.participantSlots.additionalHelper;
  const cands = this.playersAtSlots(defT, slots).filter((id) => id !== ex.defend && id !== ex.icpt);
  if (!cands.length) return { K: 0 };
  if (!this.bernoulli(opp.helpProbability, 'ayuda:compromiso')) return { K: 0 };
  const helper = this.pick(cands.map((id) => ({ key: id, w: this.taskValue('TAR09', 'attack', { helper: id }) })), 'ayuda:ayudante').key;
  const abandoned = this.lineup[team][this.slotOf(helper)];
  const Ah = this.taskValue('TAR09', 'attack', { helper }, 'ayuda:ayudante');
  const Ar = this.taskValue('TAR09', 'defense', { receiver: abandoned }, 'ayuda:receptor_abandonado');
  const p = sigmoid(logit(opp.helpExecutionP0) + opp.helpDifferenceSensitivity * (Ah - Ar));
  const arrives = this.bernoulli(p, 'ayuda:llega');
  this.cover('ayuda comprometida');
  const res = { K: 0, helper, abandoned, arrives, pArrive: p };
  if (arrives) { res.K = opp.helperQualityLogit; this.cover('ayuda llega'); }
  return res;
};

P.acceptance = function acceptance(team, decider, techValue) {
  const { L, q } = this.libertyAndReading(team, decider);
  const f = this.profile.selection.direct.acceptanceFloor;
  const adj = fit(this.profile, techValue);
  const p = clamp((f + L) * q * adj, 0, 1);
  this.note('aceptación', { L: round(L, 4), q: round(q, 4), ajusteTecnico: round(adj, 4), p: round(p, 4) });
  return p;
};

// ---------------------------------------------------------------- reorganización (CONT09)
P.reorganize = function reorganize(poss, reason, playId) {
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(poss.team).organizedPace - 1];
  const d = this.profile.durationSeconds.reorganization;
  const min = Math.round(d[0] * f * 10) + Math.round(this.profile.durationSeconds.organizedShot[0] * f * 10);
  if (this.limit() <= min) return false;
  const tenths = this.sampleDuration(d, 'reorganización', { factor: f, limit: this.limit() - Math.round(this.profile.durationSeconds.organizedShot[0] * f * 10) });
  const t = this.consume(tenths, 'organized');
  poss.disorganized = false; poss.reorgCount = (poss.reorgCount ?? 0) + 1;
  if (playId) (poss.excludePlays ??= new Set()).add(playId);
  this.cover('CONT09 reorganización');
  this.emit('reorganization', { t, team: poss.team, intent: { origen: 'CONT09', motivo: reason, fichaAbandonada: playId ?? null }, effects: { reorganizaciones: poss.reorgCount } });
  return true;
};

// ---------------------------------------------------------------- juego organizado
P.organizedAction = function organizedAction(poss) {
  const team = poss.team;
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(team).organizedPace - 1];
  const d = this.profile.durationSeconds;
  if (this.limit() <= Math.round(d.organizedShot[0] * f * 10)) return this.simpleResource(poss, { origin: this.clock <= this.shotClock ? 'ESP17' : 'ESP16' });
  if (poss.oreb) { const r = this.afterOffensiveRebound(poss); if (r) return r; }
  const dir = this.pickDirector(team);
  const el = this.eligiblePlays(team, dir.id, poss.excludePlays);
  if (!el.length) return this.simpleResource(poss, { origin: 'ESP15', denied: null });
  const { L, q } = this.libertyAndReading(team, dir.id);
  const coach = this.coachPlayDistribution(el);
  for (const e of el) {
    e.exits = this.scoreExits(team, this.buildExits(team, e.playId, e.roles, e.def), e.play.shotWeights);
    const ct = e.exits.reduce((s, x) => s + x.coach, 0) || 1;
    e.pref = e.exits.reduce((s, x) => s + (x.coach / ct) * x.pref, 0);
    e.adapt = e.exits.reduce((s, x) => s + (x.coach / ct) * x.adapt, 0);
    e.coach = coach[e.playId];
  }
  const mixed = this.mixIntention(el.map((e) => ({ key: e.playId, coach: e.coach, pref: e.pref, adapt: e.adapt, entry: e })), { L, q }, 'ficha');
  const chosen = this.pick(mixed, 'ficha:selección');
  const entry = chosen.entry;
  this.cover(entry.playId);
  return this.runPlay(poss, entry, dir, { L, q });
};

P.runPlay = function runPlay(poss, entry, dir, lq) {
  const team = poss.team;
  const { CA, CD } = this.playQuality(entry);
  // salida (jugador, zona)
  const mixed = this.mixIntention(entry.exits.map((x) => ({ key: x.key + '|' + x.zone, coach: x.coach, pref: x.pref, adapt: x.adapt, exit: x })), lq, `salida:${entry.playId}`);
  const ex = { ...this.pick(mixed, 'salida').exit };
  Object.assign(ex, { team, origin: entry.playId, kind: 'organized', roles: entry.roles });
  const spec = PLAY_SPEC[entry.playId];
  const extra = {};
  // ayuda en salidas interiores y lectura de la ventana libre
  const help = this.tryHelp(ex, lq.L, lq.q);
  let kctx = help.K;
  let nativeQuality = true;
  if (help.helper) {
    ex.helper = help.helper; ex.helpArrived = help.arrives;
    if (help.abandoned === ex.actor) {
      ex.window = true; ex.defend = null; ex.icpt = null; ex.helpWindow = 'receptor libre';
    } else if (help.abandoned !== ex.holder) {
      const tech = this.recipeObj({ [ZONE_TEC.three]: 1 }, help.abandoned);
      const pAcc = this.acceptance(team, ex.holder, tech);
      if (this.bernoulli(pAcc, 'CONT04:aceptación')) {
        const cand = ['three', 'midrange', 'rim'].map((zone) => ({ actor: help.abandoned, zone, exec: 'pass', passer: ex.holder, icpt: null, defend: null, moved: false, offContact: null, holder: ex.holder, role: 'abierto', key: `abierto:${zone}` }));
        const sc = this.scoreExits(team, cand, null);
        const pickd = this.pick(this.mixIntention(sc.map((x) => ({ key: x.zone, coach: null, pref: x.pref, adapt: x.adapt, exit: x })), lq, 'salida:descarga'), 'salida:descarga').exit;
        Object.assign(ex, pickd, { window: true, label: 'CONT04', helper: help.helper, helpArrived: help.arrives, helpWindow: 'descarga' });
        ex.chain = ['CONT04']; ex.extraPasses = 1; nativeQuality = false; kctx = 0;
        this.cover('CONT04 descarga');
      }
    }
  }
  // cobertura COB01
  if (nativeQuality && entry.playId === 'POS01') {
    const cv = this.profile.opportunity.coverageContainment;
    if (ex.pullup) kctx += cv.handlerPullupQualityLogit;
    if (ex.roller) kctx += cv.rollerQualityLogit;
  }
  // pases adicionales (CONT05) mientras haya alternativas realizables y tiempo
  this.extraPassChain(ex, lq, entry);
  if (ex.chain?.includes('CONT05')) nativeQuality = false;
  // calidad previa al resultado
  let q;
  if (nativeQuality) {
    q = ex.window ? this.qualityOf(ex, CA, 0, kctx, false) : this.qualityOf(ex, CA, CD, kctx, true);
  } else {
    // el actor recibe tras un pase adicional o una descarga: calidad por desmarque (TAR03) frente a su marcador
    const ca = this.taskValue('TAR03', 'attack', { receiver: ex.actor });
    if (ex.window || !ex.defend) q = this.qualityOf(ex, ca, 0, 0, false);
    else q = this.qualityOf(ex, ca, this.taskValue('TAR03', 'defense', { receiverMarker: ex.defend }), 0, true);
  }
  ex.quality = q;
  if (ex.window) { ex.opportunity = 'ESP06'; this.cover('ESP06 recepción liberada'); }
  // negación (calidad forzada): reorganizar (CONT09) o recurso sencillo
  if (q.cls === 'forced' && !ex.window) {
    this.cover('sistema negado');
    const pr = this.profile.continuation.reorganizeIfDeniedProbability;
    const f = this.profile.selection.organizedDurationFactor[this.styleOf(team).organizedPace - 1];
    const d = this.profile.durationSeconds;
    const reorgViable = this.limit() > Math.round((d.reorganization[0] + d.organizedShot[0]) * f * 10);
    if (reorgViable && this.bernoulli(pr, 'negada:reorganizar') && this.reorganize(poss, `ficha ${entry.playId} negada`, entry.playId)) return { cont: 'reorganized' };
    // sin tiempo para reorganizar: salida segura (CONT08) con un pase de seguridad si cabe; si no, recurso sencillo
    const safetyViable = !reorgViable && this.limit() > Math.round(d.continuation[0] * 10) + Math.round(d.urgentShot[0] * 10) + 1;
    return this.simpleResource(poss, { origin: 'ESP15', denied: entry.playId, safety: safetyViable ? ex.holder : null });
  }
  return this.resolveAttempt(ex);
};

// Pase adicional: el actor pasa a otro compañero y la salida pasa a ser la de este.
P.extraPassChain = function extraPassChain(ex, lq, entry) {
  const cp = this.profile.continuation; const d = this.profile.durationSeconds;
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(ex.team).organizedPace - 1];
  ex.chain = ex.chain ?? []; ex.extraPasses = ex.extraPasses ?? 0;
  for (let guard = 0; guard < 4; guard++) {
    const need = Math.round(d.organizedShot[0] * f * 10) + (ex.extraPasses + 1) * Math.round(d.continuation[0] * 10) + 1;
    if (this.limit() <= need) return;
    const touched = new Set([ex.actor, ex.passer, ex.holder]);
    const cands = this.onCourt(ex.team).filter((id) => !touched.has(id) && this.ps[id].available);
    if (!cands.length) return;
    if (!this.bernoulli(cp.extraPassProbability, 'CONT05:pase_adicional')) return;
    // receptor entre los compañeros disponibles; mezcla de preferencias/valor (sin libro: es una decisión de jugador)
    const pairs = [];
    for (const id of cands) for (const zone of ZONES) {
      pairs.push({ actor: id, zone, exec: 'pass', passer: ex.actor, icpt: this.markerOf(id), defend: this.markerOf(id), moved: false, offContact: null, holder: ex.actor, role: 'adicional', key: `${id}:${zone}` });
    }
    const sc = this.scoreExits(ex.team, pairs, null);
    const pk = this.pick(this.mixIntention(sc.map((x) => ({ key: x.key, coach: null, pref: x.pref, adapt: x.adapt, exit: x })), lq, 'salida:pase_adicional'), 'salida:pase_adicional').exit;
    Object.assign(ex, pk, { label: 'CONT05', window: false });
    ex.extraPasses += 1; ex.chain.push('CONT05'); ex.helper = undefined;
    this.cover('CONT05 pase adicional');
  }
};

// ---------------------------------------------------------------- recurso sencillo (ESP15 / ESP16 / ESP17)
P.simpleResource = function simpleResource(poss, { origin, denied, safety = null }) {
  const team = poss.team;
  let holder = poss.carrierPid && this.ps[poss.carrierPid]?.onCourt ? poss.carrierPid : this.pickDirector(team).id;
  let passer = null;
  if (safety) { // CONT08: pase de seguridad a un compañero con balón seguro; él decide el recurso
    passer = safety;
    const cands = this.onCourt(team).filter((id) => id !== safety);
    holder = this.pick(cands.map((id) => ({ key: id, w: this.eff(id, 'TEC07') + this.eff(id, 'MEN05') })), 'CONT08:receptor_seguro').key;
    this.cover('CONT08 salida segura');
  }
  const marker = this.markerOf(holder);
  const exits = [];
  for (const zone of ['rim', 'midrange', 'three']) {
    exits.push({ key: `${zone}`, role: 'recurso', actor: holder, zone, exec: passer ? 'pass' : 'dribble', passer, icpt: marker, defend: marker, moved: !passer && zone !== 'rim', offContact: zone === 'rim' ? { pid: holder, tech: 'TEC07', kind: 'penetración' } : null, holder: passer ?? holder });
  }
  const sc = this.scoreExits(team, exits, null);
  const lq = this.libertyAndReading(team, holder);
  const ex = { ...this.pick(this.mixIntention(sc.map((x) => ({ key: x.key, coach: null, pref: x.pref, adapt: x.adapt, exit: x })), lq, `salida:${origin}`), `salida:${origin}`).exit };
  Object.assign(ex, { team, origin, kind: 'organized', roles: { director: holder }, deniedPlay: denied ?? null });
  if (passer) { ex.chain = ['CONT08']; ex.extraPasses = 1; }
  const ca = this.taskValue('TAR02', 'attack', { handler: holder });
  const cd = this.taskValue('TAR02', 'defense', { primary: marker });
  ex.quality = denied != null || origin === 'ESP15' ? { cls: 'forced', K: this.profile.opportunity.qualityShotLogit.forced, z: null } : this.qualityOf(ex, ca, cd, 0, true);
  if (ex.quality.z === null) this.note('calidad', { clase: 'forzada por sistema negado', ficha: denied });
  this.cover(origin === 'ESP15' ? 'ESP15 sistema negado' : origin === 'ESP16' ? 'ESP16 final de posesión' : 'ESP17 última acción');
  return this.resolveAttempt(ex);
};

// ---------------------------------------------------------------- transición (ESP01 / ESP02) y rebote ofensivo (ESP12 / ESP13)
P.transitionPhase = function transitionPhase(poss) {
  const team = poss.team; const sel = this.profile.selection.direct;
  const carrier = poss.carrier;
  const steal = poss.origin === 'robo';
  const pAttempt = steal ? sel.attemptAfterLiveSteal : sel.attemptAfterDefensiveRebound;
  const attempt = this.bernoulli(pAttempt, 'transición:intento');
  if (!attempt) { this.note('transición:no_intentada', {}); return null; }
  const unopposed = this.bernoulli(steal ? sel.unopposedChanceAfterSteal : sel.unopposedChanceAfterRebound, 'transición:sin_oposición');
  let defender = null;
  if (!unopposed) {
    const defs = this.onCourt(1 - team).map((id) => ({ key: id, w: Math.max(0.01, this.eff(id, 'FIS01') + this.eff(id, 'FIS02')) }));
    defender = this.pick(defs, 'transición:defensor_que_llega').key;
  }
  const exits = [];
  for (const actor of this.onCourt(team)) {
    for (const zone of ['rim', 'three']) {
      exits.push({ key: `${actor}:${zone}`, role: 'transición', actor, zone, exec: actor === carrier ? 'dribble' : 'pass', passer: actor === carrier ? null : carrier, icpt: defender, defend: defender, moved: zone === 'three' ? false : false, offContact: null, holder: carrier });
    }
  }
  // un finalizador debe poder correr: se pondera por la receta de manejo/aceleración (TAR02)
  const sc = this.scoreExits(team, exits, null);
  for (const x of sc) x.pref *= fit(this.profile, this.taskValue('TAR02', 'attack', { handler: x.actor }));
  const lq = this.libertyAndReading(team, carrier);
  const ex = { ...this.pick(this.mixIntention(sc.map((x) => ({ key: x.key, coach: null, pref: x.pref, adapt: x.adapt, exit: x })), lq, 'salida:transición'), 'salida:transición').exit };
  const label = ex.zone === 'rim' ? 'ESP01' : 'ESP02';
  const pAcc = this.acceptance(team, carrier, this.eff(ex.actor, ZONE_TEC[ex.zone]));
  if (!this.bernoulli(pAcc, `${label}:aceptación`)) { this.note('transición:rechazada', { opcion: label }); return null; }
  Object.assign(ex, { team, origin: label, kind: 'transition', roles: { portador: carrier }, window: !defender });
  const ca = this.taskValue('TAR02', 'attack', { handler: ex.actor });
  ex.quality = defender ? this.qualityOf(ex, ca, this.taskValue('TAR02', 'defense', { primary: defender }), 0, true) : this.qualityOf(ex, ca, 0, 0, false);
  this.cover(label);
  return this.resolveAttempt(ex);
};

P.afterOffensiveRebound = function afterOffensiveRebound(poss) {
  const team = poss.team; const captor = poss.oreb.captor; poss.oreb = null;
  const rb = this.profile.rebound;
  const exits = [];
  // el captor del rebote ofensivo procede de los participantes con acceso al aro: el palmeo/finalización próxima es posible
  for (const zone of ['rim', 'inside']) exits.push({ key: `ESP12:${zone}`, role: 'palmeo', actor: captor, zone, exec: 'none', passer: null, icpt: null, defend: this.markerOf(captor), moved: false, offContact: null, holder: captor, esp: 'ESP12' });
  for (const id of this.onCourt(team)) {
    if (id === captor || !['PG', 'SG', 'SF'].includes(this.slotOf(id))) continue;
    exits.push({ key: `ESP13:${id}`, role: 'exterior', actor: id, zone: 'three', exec: 'pass', passer: captor, icpt: this.markerOf(id), defend: this.markerOf(id), moved: false, offContact: null, holder: captor, esp: 'ESP13' });
  }
  const sc = this.scoreExits(team, exits, null);
  const lq = this.libertyAndReading(team, captor);
  const ex = { ...this.pick(this.mixIntention(sc.map((x) => ({ key: x.key, coach: null, pref: x.pref, adapt: x.adapt, exit: x })), lq, 'salida:rebote_ofensivo'), 'salida:rebote_ofensivo').exit };
  const pAcc = this.acceptance(team, captor, this.eff(ex.actor, ZONE_TEC[ex.zone]));
  if (!this.bernoulli(pAcc, `${ex.esp}:aceptación`)) {
    this.note('rebote_ofensivo:rechazada', { opcion: ex.esp });
    this.reorganize(poss, 'rebote ofensivo sin ventaja aceptada', null);
    return null;
  }
  Object.assign(ex, { team, origin: ex.esp, kind: 'continuation', roles: { captor } });
  const useTask = ex.esp === 'ESP12' ? 'TAR05' : 'TAR03';
  let ca; let cd;
  if (ex.esp === 'ESP12') { ca = this.taskValue('TAR05', 'attack', { post: ex.actor }); cd = this.taskValue('TAR05', 'defense', { postMarker: ex.defend }); }
  else { ca = this.taskValue('TAR03', 'attack', { receiver: ex.actor }); cd = this.taskValue('TAR03', 'defense', { receiverMarker: ex.defend }); }
  ex.quality = this.qualityOf(ex, ca, cd, 0, true);
  this.cover(ex.esp);
  return this.resolveAttempt(ex);
};

// ---------------------------------------------------------------- posesión completa
P.startPossession = function startPossession(spec) {
  this.possSeq += 1;
  this.poss = { id: `P${String(this.possSeq).padStart(3, '0')}`, team: spec.team, entry: spec.entry, origin: spec.origin ?? null, carrier: spec.carrier ?? null, carrierPid: spec.carrier ?? null, advanced: spec.entry === 'deadFront', disorganized: false, reorgCount: 0 };
  this.shotClock = spec.shotClock; this.shotClockOn = true;
};

P.advancePhase = function advancePhase(poss) {
  const d = this.profile.durationSeconds; const rules = this.profile.rules;
  // saque con reloj de juego en marcha (tras canasta): tiempo de reanudación
  if (poss.entry === 'inbound' && this.clockRunning) {
    const lim = this.limit();
    if (lim <= Math.round(d.runningClockInbound[0] * 10)) return this.expire({ team: poss.team, origin: 'saque' }, 'saque');
    const tenths = this.sampleDuration(d.runningClockInbound, 'saque:con_reloj_en_marcha', { limit: lim });
    const t = this.consume(tenths, 'organized');
    this.emit('inbound', { t, team: poss.team, intent: { origen: 'saque tras canasta', relojEnMarcha: true } });
  } else if (poss.entry === 'inbound') {
    this.emit('inbound', { team: poss.team, intent: { origen: 'saque con reloj parado' } });
  }
  const lim = this.limit();
  if (lim <= Math.round(d.advance[0] * 10)) return this.expire({ team: poss.team, origin: 'avance' }, 'avance');
  const tenths = this.sampleDuration(d.advance, 'avance', { limit: lim });
  if (tenths >= rules.backcourtSeconds * 10) { throw new Error('violación de 8 s no representada'); }
  const t = this.consume(tenths, 'organized');
  this.emit('advance', { t, team: poss.team, intent: { origen: 'avance a pista de ataque' } });
  poss.advanced = true;
  this.clockRunning = true;
  return null;
};

P.runPossession = function runPossession() {
  const poss = this.poss;
  let r = null;
  if (poss.entry === 'live') {
    r = this.transitionPhase(poss);
    if (r && (r.end)) return r;
    if (r && r.cont) poss.advanced = true; // continúa el mismo ataque ya en pista de ataque
    if (!r) { poss.advanced = false; poss.entry = 'inbound-live'; }
  }
  for (let guard = 0; guard < 60; guard++) {
    if (this.clock <= 0) return { end: 'periodEnd' };
    if (!poss.advanced) {
      const e = this.advancePhase(poss);
      if (e && e.end) return e;
    }
    r = this.organizedAction(poss);
    if (r && r.end) return r;
    // 'cont': el mismo ataque continúa (reorganización, rebote ofensivo, balón suelto, saque tras falta...)
  }
  throw new Error('límite técnico de acciones por posesión alcanzado');
};

// ---------------------------------------------------------------- periodos y partido
P.startPeriod = function startPeriod(period) {
  const rules = this.profile.rules; const e = this.profile.energy;
  this.poss = null;
  this.period = period; this.clock = periodLengthTenths(period, rules);
  this.periodScores.push({ period, points: [0, 0] });
  if (period > 1) {
    const amount = period === 3 ? e.halftimeRecovery : isOvertime(period, rules) ? e.overtimeIntervalRecovery : e.quarterRecovery;
    this.recoverAll(amount);
    this.emit('interval', { intent: { origen: period === 3 ? 'descanso largo' : isOvertime(period, rules) ? 'intervalo previo a prórroga' : 'intervalo de cuarto' }, effects: { recuperacion: amount } });
    this.substitutionWindow('intervalo');
  }
  let team;
  if (period === 1) team = this.openingWinner;
  else { team = this.arrow; this.arrow = 1 - this.arrow; }
  this.clockRunning = false;
  this.emit('period_start', { team, intent: { origen: period === 1 ? 'salto inicial' : 'posesión alterna (flecha)' }, effects: { flechaApunta: this.arrow } });
  this.nextPoss = { team, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds) };
};

P.init = function init() {
  const u = this.draw('salto inicial');
  this.openingWinner = u < 0.5 ? 0 : 1; // sorteo de la disputa inicial
  this.arrow = 1 - this.openingWinner; // la flecha apunta al equipo que no obtuvo el primer control
  this.emit('tipoff', { team: this.openingWinner, intent: { origen: 'salto inicial' }, effects: { gana: this.teams[this.openingWinner].id, flechaApunta: this.arrow } });
  this.status = 'running';
  this.startPeriod(1);
};

// Un paso = una posesión completa (el cedido de ejecución de la interfaz se hace entre posesiones).
P.step = function step() {
  if (this.status === 'finished' || this.status === 'error') return false;
  if (this.status === 'created') { this.init(); return true; }
  const rules = this.profile.rules;
  if (this.clock <= 0) return this.closePeriod();
  this.startPossession(this.nextPoss);
  let r;
  try { r = this.runPossession(); } catch (err) { this.fail(err); return false; }
  if (this.eventSeq > rules.technicalGuardMaxEvents) { this.fail(new Error('límite técnico de acontecimientos alcanzado')); return false; }
  return true;
};

P.closePeriod = function closePeriod() {
  const rules = this.profile.rules;
  this.emit('period_end', { intent: { origen: 'bocina de final de periodo' }, effects: { marcador: [...this.score] } });
  if (this.period >= rules.quarters && this.score[0] !== this.score[1]) { this.status = 'finished'; return false; }
  if (this.period - rules.quarters >= rules.technicalGuardMaxOvertimes) { this.fail(new Error('límite técnico de prórrogas alcanzado')); return false; }
  this.startPeriod(this.period + 1);
  return true;
};

P.fail = function fail(err) {
  this.status = 'error';
  this.errors.push({ message: err.message, stack: this.opts.detail === 'full' ? String(err.stack).split('\n').slice(0, 6) : undefined, eventSeq: this.eventSeq });
};
