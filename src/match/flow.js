// Flujo de posesiones: entrada (saque, transición), selección de ficha, salidas, ayuda, pases adicionales,
// reorganización, recursos directos (ESP), periodos y arranque del partido.
import { clamp, sigmoid, logit, round } from './mathx.js';
import { SLOTS, ZONES } from './data.js';
import { MatchCore } from './core.js';
import { fit } from './plays.js';
import { vocationFactor } from './formulas.js';
import { toTenths, periodLengthTenths, isOvertime, foulPeriodKey } from './rules.js';

const P = MatchCore.prototype;
const ZONE_TEC = { three: 'TEC01', midrange: 'TEC02', inside: 'TEC03', rim: 'TEC04' };
// p' = f·p / (1 − p + f·p); los extremos 0 y 1 se conservan.
export const oddsAdjust = (p, f) => (p <= 0 || p >= 1 || f === 1 ? p : (f * p) / (1 - p + f * p));

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
  const t = this.withDuty(this.dutyFor(ex), () => this.consumeParts(plan.parts));
  const base = {
    t, team: ex.team,
    intent: { origen: ex.origin, continuacion: ex.chain?.length ? ex.chain : (ex.label ?? null), oportunidad: ex.opportunity ?? null, zona: ex.zone, calidad: ex.quality?.cls ?? null, categoria: cat, ejecucion: ex.exec, ...this.directorTrace(), ...this.playTrace(ex) },
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
// qctx: cómo se estimará la calidad previa de cada salida (solo para la instrucción de media distancia):
//   { ca, cd, k } calidad nativa de la ficha · 'TAR03' / 'TAR02' calidad por desmarque o manejo del propio actor.
P.scoreExits = function scoreExits(team, exits, shotWeights, qctx = null) {
  // las salidas de recepción (CONT02/CONT03) agregan las salidas finales de su etapa: la decisión posterior es del receptor
  const flat = [];
  for (const e of exits) { if (e.members) flat.push(...e.members); else flat.push(e); }
  const byZone = {};
  for (const e of flat) {
    const share = fit(this.profile, this.eff(e.actor, ZONE_TEC[e.zone])) * vocationFactor(this.profile, this.pl[e.actor].finishingVocation);
    e._share = share; (byZone[e.zone] ??= []).push(e);
  }
  for (const e of flat) {
    const tot = byZone[e.zone].reduce((s, x) => s + x._share, 0);
    e.coach = shotWeights ? (shotWeights[e.zone] ?? 0) * this.zoneStyleMult(team, e.zone) * (e._share / tot) : null;
    e.pref = this.prefWeight(e);
    e.adapt = this.estimateValue(e);
    if (e.zone === 'midrange') e.mid = this.midrangeFactor(team, e, this.pComfortableFor(e, e.via ? (e.qual ?? 'TAR03') : qctx));
  }
  for (const e of exits) {
    if (!e.members) continue;
    e.coach = shotWeights ? e.members.reduce((s, x) => s + x.coach, 0) : null;
    e.pref = e.members.reduce((s, x) => s + x.pref, 0);
    e.adapt = e.members.reduce((s, x) => s + x.adapt, 0);
    const tot = e.members.reduce((s, x) => s + x.pref, 0) || 1;
    e.riskEst = e.members.reduce((s, x) => s + (x.pref / tot) * (x.riskEst ?? 0), 0);
    const midW = e.members.filter((x) => x.mid != null);
    e.mid = midW.length ? e.members.reduce((s, x) => s + (x.pref / tot) * (x.mid ?? 1), 0) : null;
  }
  return exits;
};
// Probabilidad de calidad previa cómoda de una salida de media distancia (esperanza: la calidad real se sortea después de elegir).
P.pComfortableFor = function pComfortableFor(e, qctx) {
  if (e.window || !e.defend) return this.qualityDistribution(0, 0, 0, false).p.comfortable;
  if (qctx && typeof qctx === 'object') return this.qualityDistribution(qctx.ca, qctx.cd, qctx.k ?? 0, true).p.comfortable;
  const task = qctx === 'TAR02' || qctx === 'TAR05' ? qctx : 'TAR03';
  const ca = task === 'TAR02' ? this.taskValue('TAR02', 'attack', { handler: e.actor }) : task === 'TAR05' ? this.taskValue('TAR05', 'attack', { post: e.actor }) : this.taskValue('TAR03', 'attack', { receiver: e.actor });
  const cd = task === 'TAR02' ? this.taskValue('TAR02', 'defense', { primary: e.defend }) : task === 'TAR05' ? this.taskValue('TAR05', 'defense', { postMarker: e.defend }) : this.taskValue('TAR03', 'defense', { receiverMarker: e.defend });
  return this.qualityDistribution(ca, cd, 0, true).p.comfortable;
};
// Elemento del mezclador a partir de una salida (peso de entrenador, preferencia, valor y los ajustes de estilo de una sola aplicación).
P.exitItem = function exitItem(x, keySuffix = '') {
  return { key: x.key + keySuffix, coach: x.coach, pref: x.pref, adapt: x.adapt, exit: x, risk: x.riskEst, mid: x.mid, cont: !!x.label || !!x.members };
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

P.acceptance = function acceptance(team, decider, techValue) {
  const { L, q } = this.libertyAndReading(team, decider);
  const f = this.profile.selection.direct.acceptanceFloor;
  const adj = fit(this.profile, techValue);
  const p = clamp((f + L) * q * adj, 0, 1);
  this.note('aceptación', { L: round(L, 4), q: round(q, 4), ajusteTecnico: round(adj, 4), p: round(p, 4) });
  return p;
};

// ---------------------------------------------------------------- reorganización (CONT09)
// También sirve para pasar a una disposición compatible (MOTOR-04): mismo coste real de tiempo y mismo hecho registrado.
P.reorganize = function reorganize(poss, reason, playId, { toDisposition = null } = {}) {
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(poss.team).organizedPace - 1];
  const d = this.profile.durationSeconds.reorganization;
  const min = Math.round(d[0] * f * 10) + Math.round(this.profile.durationSeconds.organizedShot[0] * f * 10);
  if (this.limit() <= min) return false;
  const tenths = this.sampleDuration(d, 'reorganización', { factor: f, limit: this.limit() - Math.round(this.profile.durationSeconds.organizedShot[0] * f * 10) });
  const t = this.consume(tenths, 'organized');
  poss.disorganized = false; poss.reorgCount = (poss.reorgCount ?? 0) + 1;
  if (playId) (poss.excludePlays ??= new Set()).add(playId);
  if (toDisposition) poss.disposition = toDisposition;
  this.activatePlanOrders(this.period, { entry: true }); // frontera de reorganización compatible: entran disposición y roles pendientes
  this.cover(toDisposition ? 'reorganización a otra disposición' : 'CONT09 reorganización');
  this.emit('reorganization', { t, team: poss.team, intent: { origen: toDisposition ? 'cambio de disposición' : 'CONT09', motivo: reason, fichaAbandonada: playId ?? null, ...(toDisposition ? { disposicion: toDisposition } : {}) }, effects: { reorganizaciones: poss.reorgCount } });
  return true;
};

// ---------------------------------------------------------------- juego organizado
// Salidas de primer nivel de una ficha. Una salida de recepción (CONT02/CONT03/alto-bajo) agrega las salidas finales de su etapa;
// la decisión posterior se toma, con su propia lectura, cuando el receptor ya tiene el balón.
P.exitsFor = function exitsFor(entry) {
  const spec = entry.spec;
  const exits = this.buildExits(entry.team ?? this.poss.team, entry.playId, entry.roles, entry.def);
  const out = [];
  for (const x of exits) {
    if (!x.stage) { out.push(x); continue; }
    x.members = this.buildExits(this.poss.team, entry.playId, entry.roles, entry.def, spec.stages[x.stage].exits, true).map((m) => ({ ...m, via: x.stage }));
    if (x.members.length) out.push(x);
  }
  return out;
};

P.organizedAction = function organizedAction(poss) {
  const team = poss.team;
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(team).organizedPace - 1];
  const d = this.profile.durationSeconds;
  if (this.limit() <= Math.round(d.organizedShot[0] * f * 10)) { this.noteCall(this.callFor(poss), 'tiempo insuficiente: recurso final de posesión'); return this.simpleResource(poss, { origin: this.clock <= this.shotClock ? 'ESP17' : 'ESP16' }); }
  if (poss.oreb) { const r = this.afterOffensiveRebound(poss); if (r) { this.noteCall(this.callFor(poss), 'opción directa previa: continuación tras rebote ofensivo'); return r; } }
  const dir = this.pickDirector(team);
  poss.director = dir;
  const call = this.callFor(poss);
  const el = this.eligiblePlays(team, dir.id, poss.excludePlays, poss, call ? [call.content.playId] : []);
  if (!el.length) { this.noteCall(call, 'sin ficha elegible: recurso sencillo'); return this.simpleResource(poss, { origin: 'ESP15', denied: null }); }
  const lq = this.libertyAndReading(team, dir.id);
  const { L, q } = lq;
  const coach = this.coachPlayDistribution(el.filter((e) => !e.called));
  if (call) {
    // Orden manual específica: la ficha llamada recibe todo el peso del libro si es realizable. La lectura del director
    // (libertad) y la negación posterior siguen actuando; no se fuerza un inicio ni un desenlace.
    if (el.some((e) => e.playId === call.content.playId)) { this.resumeCall(call); for (const e of el) coach[e.playId] = e.playId === call.content.playId ? 1 : 0; }
    else this.suspendCall(call, `${call.content.playId} no realizable (sin participante compatible o ya negada en esta posesión)`);
  }
  for (const e of el) {
    e.team = team;
    e.q = this.playQuality(e);
    e.exits = this.scoreExits(team, this.exitsFor(e), e.play.shotWeights, { ca: e.q.CA, cd: e.q.CD, k: 0 });
    const ct = e.exits.reduce((s, x) => s + x.coach, 0) || 1;
    e.pref = e.exits.reduce((s, x) => s + (x.coach / ct) * x.pref, 0);
    e.adapt = e.exits.reduce((s, x) => s + (x.coach / ct) * x.adapt, 0);
    e.coach = coach[e.playId] ?? 0;
    if (e.called && !(call && call.content.playId === e.playId)) e.coach = 0;
    if (e.called) { e.pref = 0; e.adapt = 0; } // una ficha no activa en el libro solo existe por la llamada: no entra por autonomía
  }
  const mixed = this.mixIntention(el.map((e) => ({ key: e.playId, coach: e.coach, pref: e.pref, adapt: e.adapt, entry: e })), lq, 'ficha');
  const chosen = this.pick(mixed, 'ficha:selección');
  const entry = chosen.entry;
  if (call && entry.playId !== call.content.playId && el.some((e) => e.playId === call.content.playId)) this.noteCall(call, 'la lectura del director eligió otra ficha');
  poss.selection = { ficha: entry.playId, decide: dir.id, L: round(L, 4), q: round(q, 4), pEntrenador: round(entry.coach, 4), pFinal: round(chosen.w, 4), prioridad: entry.priority };
  if (entry.reorgTo && !this.reorganize(poss, `ficha ${entry.playId} necesita la disposición ${entry.reorgTo}`, null, { toDisposition: entry.reorgTo })) {
    // no cabe la reorganización (no debería ocurrir: se comprobó al evaluar): la llamada sigue esperando dentro de su ámbito
    this.noteCall(call, `${entry.playId} necesitaba reorganizar y no hay tiempo`);
    return this.simpleResource(poss, { origin: 'ESP15', denied: null });
  }
  poss.fromCall = !!(call && call.content.playId === entry.playId);
  this.consumeCall(poss, entry.playId);
  poss.playStarted = true;
  this.cover(entry.playId);
  return this.runPlay(poss, entry, dir, lq);
};

// Decisión del receptor tras una recepción (CONT02, CONT03, alto-bajo…): con SU Visión, Decisiones, Iniciativa y libertad.
// El director inicial no presta su lectura ni el receptor hereda el pase del base: cada elemento usa al actor real.
P.receiverDecision = function receiverDecision(ex, entry) {
  const st = entry.spec.stages[ex.stage];
  const decider = entry.roles[st.decider];
  const dq = this.libertyAndReading(ex.team, decider);
  const members = this.buildExits(ex.team, entry.playId, entry.roles, entry.def, st.exits, true).map((m) => ({ ...m, via: ex.stage }));
  const scored = this.scoreExits(ex.team, members, null);
  const label = `decisión:${entry.playId}:${ex.stage}`;
  const picked = this.pick(this.mixIntention(scored.map((x) => this.exitItem(x)), dq, label), label).exit;
  const first = ex.label;
  Object.assign(ex, picked, { team: ex.team, stage: null });
  delete ex.members; delete ex.via;
  ex.chain = [first, picked.label].filter(Boolean);
  ex.extraPasses = 1 + (picked.exec === 'pass' && picked.passer === decider ? 1 : 0); // recepción real + pase posterior, si lo hay
  ex.decidedBy = decider; ex.decisionLq = { L: round(dq.L, 4), q: round(dq.q, 4) };
  this.cover(first);
  return ex;
};

// Ladder de respuestas ante una recepción negada: CONT06 (corte ante negación) y CONT07 (rechazo de la primera opción), cada una
// con la aceptación de oportunidad inmediata ya existente. Devuelve el resultado de la resolución, o null para seguir con CONT09/CONT08.
P.denialAlternative = function denialAlternative(poss, entry, ex, lq) {
  if (ex.afterDenial) return null;
  const team = ex.team; const spec = entry.spec;
  const retry = (alt, label) => {
    const q2 = alt.exec === 'dribble' && !alt.passer
      ? this.qualityOf(alt, this.taskValue('TAR02', 'attack', { handler: alt.actor }), alt.defend ? this.taskValue('TAR02', 'defense', { primary: alt.defend }) : 0, 0, !!alt.defend)
      : this.qualityOf(alt, this.taskValue('TAR03', 'attack', { receiver: alt.actor }), alt.defend ? this.taskValue('TAR03', 'defense', { receiverMarker: alt.defend }) : 0, 0, !!alt.defend);
    Object.assign(ex, alt, { team, quality: q2, afterDenial: true, window: false });
    delete ex.members;
    ex.chain = [...(ex.chain ?? []).filter((c) => c !== label), label];
    ex.extraPasses = (ex.extraPasses ?? 0) + (alt.exec === 'pass' ? 1 : 0);
    if (q2.cls === 'forced') return null; // vuelve a negarse: ya no hay otra alternativa
    return this.resolveAttempt(ex);
  };
  const first = { actor: ex.actor, zone: ex.zone, role: ex.role };
  const cut = spec.denial?.cut;
  if (cut && ex.exec === 'pass' && ex.role === cut.role) {
    const [cx] = this.buildExits(team, entry.playId, entry.roles, entry.def, [{ role: cut.role, zones: [cut.zone], exec: 'pass', from: cut.from, defend: cut.defend, icpt: cut.icpt, label: cut.label }], true);
    if (cx && this.bernoulli(this.acceptance(team, ex.holder, this.eff(cx.actor, cut.tech)), 'CONT06:aceptación')) {
      this.cover('CONT06 corte ante negación');
      ex.negada = { de: first };
      return retry(cx, cut.label);
    }
  }
  // CONT07: otra vía de la misma ficha, conocida y real (distinta del actor y rol negados)
  const alts = this.exitsFor(entry).flatMap((x) => (x.members ?? [x])).filter((x) => x.role !== first.role && x.actor !== first.actor && x.zone !== 'reception');
  if (alts.length) {
    const best = Math.max(...alts.map((x) => this.eff(x.actor, ZONE_TEC[x.zone])));
    if (this.bernoulli(this.acceptance(team, ex.holder, best), 'CONT07:aceptación')) {
      const sc = this.scoreExits(team, alts.map((m) => ({ ...m, via: m.via ?? 'alt' })), null);
      const label = `rechazo:${entry.playId}`;
      const pk = this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), lq, label), label).exit;
      this.cover('CONT07 rechazo de primera opción');
      ex.negada = { de: first };
      return retry({ ...pk, label: 'CONT07', via: undefined }, 'CONT07');
    }
  }
  return null;
};

P.runPlay = function runPlay(poss, entry, dir, lq) {
  const team = poss.team;
  let { CA, CD } = entry.q ?? this.playQuality(entry);
  // salida (jugador, zona)
  const mixed = this.mixIntention(entry.exits.map((x) => this.exitItem(x)), lq, `salida:${entry.playId}`);
  const ex = { ...this.pick(mixed, 'salida').exit };
  delete ex.members;
  Object.assign(ex, { team, origin: entry.playId, kind: 'organized', roles: entry.roles, family: entry.family, sector: entry.spec.sector });
  if (entry.spec.fixing && ex.role !== 'cutter') ex.cutRecord = { cortador: entry.roles.cutter, recibe: false }; // el corte fijó sin recibir: utilidad resuelta, no una recepción
  let nativeQuality = true;
  if (ex.stage) { this.receiverDecision(ex, entry); nativeQuality = false; }
  // cobertura del bloqueo (COB01–COB04): dos defensores identificables, responsabilidad abandonada y compromiso real (MOTOR-05)
  poss.coverage = null;
  const cov = entry.spec.coverage ? this.beginCoverage(entry, poss) : null;
  const cvk = this.coverageForExit(ex, cov);
  if (cov && cov.exchanged) CD = this.cdWith(entry, { primary: cov.D2, screenMarker: cov.D1 }); // tras el cambio, la calidad del bloqueo se evalúa con los defensores intercambiados
  let kctx = nativeQuality ? cvk.k : 0;
  // decisiones de estilo de esta interacción: negar o facilitar ayuda, presión al balón, intentar robo (una vez cada una)
  const intent = this.defenseIntent(ex);
  const cvDef = this.profile.opportunity.coverageContainment;
  const kd = ex.exec === 'dribble' && ex.pressureClose === false && !cvk.spaceFromCoverage ? cvDef.handlerPullupQualityLogit : 0; // distancia concedida: mismo espacio que el drop
  if (nativeQuality) kctx += kd;
  // ayuda en salidas interiores y lectura de la ventana libre
  const help = this.tryHelp(ex, lq.L, lq.q);
  kctx += help.K;
  if (help.helper) {
    ex.helper = help.helper; ex.helpArrived = help.arrives; ex.helpTrace = { deja: help.abandoned, relevo: help.relief, relevoLlega: help.reliefArrives };
    const covered = help.relief && help.reliefArrives ? help.relief : null; // el relevo cubre lo abandonado; si no llega, se concede
    if (help.abandoned === ex.actor) {
      if (covered) { ex.defend = covered; ex.icpt = covered; ex.helpWindow = 'relevo cubre al receptor'; }
      else { ex.window = true; ex.defend = null; ex.icpt = null; ex.helpWindow = 'receptor libre'; }
    } else if (help.abandoned && help.abandoned !== ex.holder) {
      const tech = this.recipeObj({ [ZONE_TEC.three]: 1 }, help.abandoned);
      const pAcc = this.acceptance(team, ex.holder, tech);
      if (this.bernoulli(pAcc, 'CONT04:aceptación')) {
        const cand = ['three', 'midrange', 'rim'].map((zone) => ({ actor: help.abandoned, zone, exec: 'pass', passer: ex.holder, icpt: covered, defend: covered, window: !covered, moved: false, offContact: null, holder: ex.holder, role: 'abierto', key: `abierto:${zone}`, qual: null, stage: null }));
        const sc = this.scoreExits(team, cand, null, 'TAR03');
        const pickd = this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), lq, 'salida:descarga'), 'salida:descarga').exit;
        Object.assign(ex, pickd, { window: !covered, label: 'CONT04', helper: help.helper, helpArrived: help.arrives, helpWindow: covered ? 'descarga con relevo' : 'descarga', denier: null, stealAttempt: undefined, pressureClose: undefined, noDenial: false, defMix: undefined });
        ex.chain = [...(ex.chain ?? []), 'CONT04']; ex.extraPasses = (ex.extraPasses ?? 0) + 1; nativeQuality = false; kctx = 0;
        this.cover('CONT04 descarga');
      }
    }
  }
  // pases adicionales (CONT05) mientras haya alternativas realizables y tiempo
  this.extraPassChain(ex, lq, entry);
  if (ex.chain?.includes('CONT05')) nativeQuality = false;
  // calidad previa al resultado
  let q;
  if (nativeQuality) {
    const CDx = ex.defMix ? this.mixDuelCD(entry, ex) : CD;
    q = ex.window ? this.qualityOf(ex, CA, 0, kctx, false) : this.qualityOf(ex, CA, CDx, kctx, true);
  } else if (ex.qual === 'TAR05' && !ex.window && ex.defend) {
    q = this.qualityOf(ex, this.taskValue('TAR05', 'attack', { post: ex.actor }), this.taskValue('TAR05', 'defense', { postMarker: ex.defend }), 0, true);
  } else {
    // el actor recibe tras un pase adicional, una descarga o una recepción: calidad por desmarque (TAR03) frente a su marcador
    const ca = this.taskValue('TAR03', 'attack', { receiver: ex.actor });
    if (ex.window || !ex.defend) q = this.qualityOf(ex, ca, 0, 0, false);
    else q = this.qualityOf(ex, ca, this.taskValue('TAR03', 'defense', { receiverMarker: ex.defend }), 0, true);
  }
  ex.quality = q;
  if (ex.window) { ex.opportunity = 'ESP06'; this.cover('ESP06 recepción liberada'); }
  // negación (calidad forzada): corte / rechazo, reorganizar (CONT09) o recurso sencillo
  if (q.cls === 'forced' && !ex.window) {
    this.cover('sistema negado');
    if (ex.exec === 'pass' && ex.actor !== ex.holder) (poss.denials ??= []).push({ ficha: entry.playId, actor: ex.actor, holder: ex.holder });
    const alt = this.denialAlternative(poss, entry, ex, lq);
    if (alt) return alt;
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

// Pase adicional: el actor pasa a otro compañero y la salida pasa a ser la de este. La elaboración (estilo) multiplica el peso de
// continuar frente a aceptar la finalización: p' = f·p / (1 − p + f·p) (la misma probabilidad base del perfil; nivel 3 = sin cambio).
P.extraPassChain = function extraPassChain(ex, lq, entry) {
  const cp = this.profile.continuation; const d = this.profile.durationSeconds;
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(ex.team).organizedPace - 1];
  const ef = this.profile.selection.elaborationContinuationWeightFactor[this.styleOf(ex.team).elaboration - 1];
  ex.chain = ex.chain ?? []; ex.extraPasses = ex.extraPasses ?? 0;
  const pCont = oddsAdjust(cp.extraPassProbability, ef);
  for (let guard = 0; guard < cp.maxExtraPasses; guard++) {
    const need = Math.round(d.organizedShot[0] * f * 10) + (ex.extraPasses + 1) * Math.round(d.continuation[0] * 10) + 1;
    if (this.limit() <= need) return;
    const touched = new Set([ex.actor, ex.passer, ex.holder]);
    const cands = this.onCourt(ex.team).filter((id) => !touched.has(id) && this.ps[id].available);
    if (!cands.length) return;
    if (!this.bernoulli(pCont, 'CONT05:pase_adicional')) return;
    // receptor entre los compañeros disponibles; mezcla de preferencias/valor (sin libro: es una decisión de jugador)
    const pairs = [];
    for (const id of cands) for (const zone of ZONES) {
      const open = this.isOpen(id); // atacante sin función defensiva que lo cubra: recibe libre (concesión estructural)
      pairs.push({ actor: id, zone, exec: 'pass', passer: ex.actor, icpt: open ? null : this.markerOf(id), defend: open ? null : (this.shotDefenderFor(id, zone) ?? this.markerOf(id)), window: open, moved: false, offContact: null, holder: ex.actor, role: 'adicional', key: `${id}:${zone}`, qual: null, stage: null });
    }
    const sc = this.scoreExits(ex.team, pairs, null, 'TAR03');
    const pk = this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), lq, 'salida:pase_adicional'), 'salida:pase_adicional').exit;
    Object.assign(ex, pk, { label: 'CONT05', window: !!pk.window });
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
    holder = this.pick(cands.map((id) => ({ key: id, w: this.weightedSum(id, this.profile.selection.safeReceiverWeights) })), 'CONT08:receptor_seguro').key;
    this.cover('CONT08 salida segura');
  }
  const marker = this.markerOf(holder);
  const exits = [];
  for (const zone of ['rim', 'midrange', 'three']) {
    exits.push({ key: `${zone}`, role: 'recurso', actor: holder, zone, exec: passer ? 'pass' : 'dribble', passer, icpt: marker, defend: marker, moved: !passer && zone !== 'rim', offContact: zone === 'rim' ? { pid: holder, tech: 'TEC07', kind: 'penetración' } : null, holder: passer ?? holder });
  }
  const sc = this.scoreExits(team, exits, null, 'TAR02');
  const lq = this.libertyAndReading(team, holder);
  const ex = { ...this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), lq, `salida:${origin}`), `salida:${origin}`).exit };
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
  // estilo de transición: factor sobre los odds del intento, solo si el origen y la ventaja representada ya lo permiten
  const tr = this.profile.selection.transitionAttemptOddsRatio[this.styleOf(team).transition - 1];
  const pAttempt = oddsAdjust(steal ? sel.attemptAfterLiveSteal : sel.attemptAfterDefensiveRebound, tr);
  const attempt = this.bernoulli(pAttempt, 'transición:intento');
  if (!attempt) { this.note('transición:no_intentada', {}); return null; }
  // la carga de rebote rival que deja sin retorno listo a su equipo mejora los odds de la ventaja de la carrera (1,2 por referencia)
  const deficit = poss.deficit ?? 0;
  const unreadyRatio = this.profile.rebound.balance.unreadyReturnerOpportunityOddsRatio ** deficit;
  const pUnopposed = oddsAdjust(steal ? sel.unopposedChanceAfterSteal : sel.unopposedChanceAfterRebound, unreadyRatio);
  if (deficit) this.note('transición:retorno', { referenciasDeBalanceQueFaltan: deficit, factorOdds: round(unreadyRatio, 4), pSinOposicion: round(pUnopposed, 4) });
  const unopposed = this.bernoulli(pUnopposed, 'transición:sin_oposición');
  let defender = null;
  if (!unopposed) {
    const defs = this.onCourt(1 - team).map((id) => ({ key: id, w: Math.max(sel.defenderArrivalMinimumWeight, this.weightedSum(id, sel.defenderArrival)) }));
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
  const ex = { ...this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), lq, 'salida:transición'), 'salida:transición').exit };
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
  const ex = { ...this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), lq, 'salida:rebote_ofensivo'), 'salida:rebote_ofensivo').exit };
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

// Trazas de la estructura del ataque (MOTOR-04): procedencia, disposición y funciones efectivas (una vez por layout), decisión del
// receptor, negación observada y tipo de salida. Solo describe lo calculado; no decide nada.
P.playTrace = function playTrace(ex) {
  const poss = this.poss; const t = {};
  if (!poss) return t;
  const isPlay = /^POS\d\d$/.test(ex.origin ?? '');
  t.procedencia = isPlay ? (poss.fromCall ? 'llamada' : 'libro/autonomía') : 'recurso directo';
  if (isPlay) {
    t.familia = ex.family ?? null; t.sector = ex.sector ?? null;
    if (poss.selection && poss.selection.ficha === ex.origin && !poss.selection.logged) { t.seleccion = poss.selection; poss.selection.logged = true; }
    if (poss.layout && !poss.layoutLogged) { t.disposicion = poss.layout.dis; t.funciones = { ...poss.layout.map }; poss.layoutLogged = true; }
    if (ex.decidedBy) t.decidePor = { jugador: ex.decidedBy, ...ex.decisionLq };
    if (ex.negada) t.negacionPrevia = ex.negada.de;
    if (ex.cutRecord) t.corte = ex.cutRecord;
  }
  return t;
};

// Quién decide efectivamente cuando no es el director principal (alternativa o primer disponible).
P.directorTrace = function directorTrace() {
  const d = this.poss?.director;
  return d && (d.fallback || d.rank > 0) ? { director: { id: d.id, rango: d.rank, sustituto: d.fallback } } : {};
};

// ---------------------------------------------------------------- posesión completa, por unidades
P.startPossession = function startPossession(spec) {
  this.possSeq += 1;
  this.poss = { id: `P${String(this.possSeq).padStart(3, '0')}`, seq: this.possSeq, team: spec.team, entry: spec.entry, origin: spec.origin ?? null, carrier: spec.carrier ?? null, carrierPid: spec.carrier ?? null, advanced: spec.entry === 'deadFront', disorganized: false, reorgCount: 0, done: false, units: 0, playStarted: false, transitionDone: false, pendingFT: null, deficit: spec.deficit ?? 0, denials: [], disposition: null, layout: null };
  this.poss.cur = {}; this.poss.committed = new Set(); this.poss.commitKinds = {};
  this.refreshEffectiveOrg(1 - spec.team); // organización defensiva efectiva en la frontera de entrada de la posesión
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
  const height = this.defPlan(1 - poss.team).pressureHeight;
  if (height !== 'normal' || !this.dcfg().pressure.normalUsesExistingAdvance) return this.pressedAdvance(poss, height); // MOTOR-05: presión adelantada
  const lim = this.limit();
  if (lim <= Math.round(d.advance[0] * 10)) return this.expire({ team: poss.team, origin: 'avance' }, 'avance');
  const tenths = this.sampleDuration(d.advance, 'avance', { limit: lim });
  if (tenths >= rules.backcourtSeconds * 10) return this.backcourtViolation(poss);
  const t = this.consume(tenths, 'organized');
  this.emit('advance', { t, team: poss.team, intent: { origen: 'avance a pista de ataque' } });
  poss.advanced = true;
  this.clockRunning = true;
  return null;
};

// Cierra la posesión: las llamadas de ficha ligadas a ella caducan con motivo.
P.settlePossession = function settlePossession(poss, r) {
  poss.done = true; poss.endKind = r.end ?? null;
  this.expireCallsFor(poss);
  return r;
};

// Una unidad de posesión = una frontera de avance. Cada unidad es una resolución indivisible (o el arranque de la posesión);
// entre unidades se pueden registrar órdenes. Mismo orden de sorteos y hechos que el antiguo bucle por posesión (MOTOR-01).
P.possessionUnit = function possessionUnit() {
  if (!this.poss || this.poss.done) this.startPossession(this.nextPoss);
  const poss = this.poss;
  this.activatePlanOrders(this.period, { entry: poss.units === 0 }); // disposición y roles solo entran en la entrada de posesión o en una reorganización
  this.activateCalls(poss);
  poss.units += 1;
  if (poss.units > 64) throw new Error('límite técnico de acciones por posesión alcanzado');
  let r = null;
  if (poss.pendingFT) { // serie de tiros libres (o saque) pendiente tras la ventana de la falta
    const ex = poss.pendingFT; poss.pendingFT = null;
    r = this.afterFreeThrows(ex);
    return r && r.end ? this.settlePossession(poss, r) : r;
  }
  if (poss.entry === 'live' && !poss.transitionDone) {
    poss.transitionDone = true;
    r = this.transitionPhase(poss);
    if (r) this.noteCall(this.callFor(poss), 'opción directa previa: transición (ESP01/ESP02)');
    if (r && r.end) return this.settlePossession(poss, r);
    if (r && r.cont) poss.advanced = true; // continúa el mismo ataque ya en pista de ataque
    if (!r) { poss.advanced = false; poss.entry = 'inbound-live'; }
    return r;
  }
  if (this.clock <= 0) return this.settlePossession(poss, { end: 'periodEnd' });
  if (!poss.advanced) {
    const e = this.advancePhase(poss);
    if (e && e.end) return this.settlePossession(poss, e);
    if (e && e.cont) return e; // falta en el avance: la ventana reglamentaria es una frontera propia
  }
  r = this.organizedAction(poss);
  if (r && r.end) return this.settlePossession(poss, r);
  return r;
};

// Compatibilidad: resuelve la posesión entera encadenando unidades.
P.runPossession = function runPossession() {
  const poss = this.poss;
  while (!poss.done) this.possessionUnit();
  return { end: poss.endKind };
};

// ---------------------------------------------------------------- ventanas reglamentarias (frontera propia)
P.queueWindow = function queueWindow(w) { this.windowSeq += 1; this.pendingWindows.push({ id: this.windowSeq, timeoutTeams: [], subs: false, ...w }); };

// Procesa la primera ventana pendiente: tiempos muertos solicitados y, si no hay, sustituciones. Un tiempo muerto concedido
// abre una oportunidad de sustitución para ambos equipos que se resuelve en la frontera siguiente (permite revisar el plan).
P.processWindow = function processWindow() {
  const w = this.pendingWindows.shift();
  const granted = this.grantTimeouts(w);
  if (granted.length) {
    this.queueWindowFirst({ reason: 'tiempo muerto', subs: true });
    return { timeouts: granted.length };
  }
  if (w.subs) this.substitutionWindow(w.reason);
  return { timeouts: 0 };
};
P.queueWindowFirst = function queueWindowFirst(w) { this.windowSeq += 1; this.pendingWindows.unshift({ id: this.windowSeq, timeoutTeams: [], subs: false, ...w }); };

// ---------------------------------------------------------------- periodos y partido
P.beginPeriod = function beginPeriod(period) {
  const rules = this.profile.rules; const e = this.profile.energy;
  this.poss = null;
  this.period = period; this.clock = periodLengthTenths(period, rules);
  this.periodScores.push({ period, points: [0, 0] });
  this.activatePlanOrders(period); // plan preparado para este periodo: entra en su frontera de inicio
  if (period > 1) {
    const amount = period === 3 ? e.halftimeRecovery : isOvertime(period, rules) ? e.overtimeIntervalRecovery : e.quarterRecovery;
    this.recoverAll(amount);
    this.emit('interval', { intent: { origen: period === 3 ? 'descanso largo' : isOvertime(period, rules) ? 'intervalo previo a prórroga' : 'intervalo de cuarto' }, effects: { recuperacion: amount } });
    this.queueWindow({ reason: 'intervalo', subs: true });
  }
  this.periodStartPending = true;
};
P.finishPeriodStart = function finishPeriodStart() {
  const rules = this.profile.rules; const period = this.period;
  this.periodStartPending = false;
  let team;
  if (period === 1) team = this.openingWinner;
  else { team = this.arrow; this.arrow = 1 - this.arrow; }
  this.clockRunning = false;
  this.emit('period_start', { team, intent: { origen: period === 1 ? 'salto inicial' : 'posesión alterna (flecha)' }, effects: { flechaApunta: this.arrow } });
  this.nextPoss = { team, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds) };
};
// Compatibilidad (MOTOR-01 y pruebas directas): empieza el periodo resolviendo de inmediato sus ventanas.
P.startPeriod = function startPeriod(period) {
  this.beginPeriod(period);
  while (this.pendingWindows.length) this.processWindow();
  this.finishPeriodStart();
};

P.init = function init() {
  const u = this.draw('salto inicial');
  this.openingWinner = u < 0.5 ? 0 : 1; // sorteo de la disputa inicial
  this.arrow = 1 - this.openingWinner; // la flecha apunta al equipo que no obtuvo el primer control
  this.emit('tipoff', { team: this.openingWinner, intent: { origen: 'salto inicial' }, effects: { gana: this.teams[this.openingWinner].id, flechaApunta: this.arrow } });
  this.status = 'running';
  this.startPeriod(1);
};

// Un paso = una frontera de avance. Tipos: inicio, ventana reglamentaria, inicio de periodo, final de periodo, comienzo del
// periodo siguiente y unidad de posesión. Sin intervención externa, encadenar pasos reproduce exactamente el mismo partido.
P.step = function step() {
  if (this.status === 'finished' || this.status === 'error') return false;
  const ev0 = this.events.length;
  this.stepSeq += 1; this.inStep = true;
  const info = { n: this.stepSeq, kind: null, timeouts: 0, firstEvent: ev0 };
  try {
    if (this.status === 'created') { this.init(); info.kind = 'inicio'; }
    else if (this.pendingWindows.length) { info.kind = 'ventana'; info.timeouts = this.processWindow().timeouts; }
    else if (this.periodStartPending) { this.finishPeriodStart(); info.kind = 'inicio de periodo'; }
    else if (this.periodBreak != null) { const p = this.periodBreak; this.periodBreak = null; this.beginPeriod(p); info.kind = 'comienzo de periodo'; }
    else if (this.clock <= 0 && (!this.poss || this.poss.done)) { this.closePeriod(); info.kind = 'final de periodo'; }
    else {
      info.kind = 'posesión';
      if (this.eventSeq > this.profile.rules.technicalGuardMaxEvents) throw new Error('límite técnico de acontecimientos alcanzado');
      this.possessionUnit();
    }
  } catch (err) { this.fail(err); }
  this.inStep = false;
  info.events = this.events.length - ev0;
  this.lastStep = info;
  return this.status !== 'finished' && this.status !== 'error';
};

P.closePeriod = function closePeriod() {
  const rules = this.profile.rules;
  this.emit('period_end', { intent: { origen: 'bocina de final de periodo' }, effects: { marcador: [...this.score] } });
  this.expireTimeoutRequests('terminó el periodo sin oportunidad: puedes volver a solicitarlo');
  this.releaseLineupControl();
  if (this.period >= rules.quarters && this.score[0] !== this.score[1]) { this.status = 'finished'; this.closeOrdersAtFinish(); return false; }
  if (this.period - rules.quarters >= rules.technicalGuardMaxOvertimes) { this.fail(new Error('límite técnico de prórrogas alcanzado')); return false; }
  this.periodBreak = this.period + 1; // pausa lógica: el periodo siguiente empieza en el paso siguiente
  return true;
};

P.fail = function fail(err) {
  this.status = 'error';
  this.errors.push({ message: err.message, stack: this.opts.detail === 'full' ? String(err.stack).split('\n').slice(0, 6) : undefined, eventSeq: this.eventSeq, step: this.stepSeq });
};
