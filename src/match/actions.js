// Selección de intención, resolución de acontecimientos y flujo de posesiones.
// Una resolución agrupa preparación, lectura, elección y ejecución; el tiempo se descuenta una vez por hecho.
import { clamp, sigmoid, logit, round } from './mathx.js';
import { SLOTS } from './data.js';
import { MatchCore } from './core.js';
import { PLAY_SPEC, fit } from './plays.js';
import {
  toTenths, fitsBeforeLimit, clockStopsAfterGoal, foulPeriodKey, inPenalty,
  shotClockAfterDefensiveStoppage, shotClockAfterRingContact, freeThrowsForShootingFoul,
} from './rules.js';

const P = MatchCore.prototype;
const ZONE_TEC = { three: 'TEC01', midrange: 'TEC02', inside: 'TEC03', rim: 'TEC04' };
const ZONE_PREF = { three: 'three', midrange: 'midrange', inside: 'rim', rim: 'rim' };
const CAT_ORDER = ['turnover', 'defensiveNonShootingFoul', 'shootingFoul', 'fieldShot', 'looseBall', 'offensiveFoul', 'ballViolation'];

// ---------------------------------------------------------------- utilidades de decisión
P.styleOf = function styleOf(team) { return this.teams[team].plan.styles; };
P.zoneStyleMult = function zoneStyleMult(team, zone) {
  const s = this.profile.selection; const fp = this.styleOf(team).finishPreference - 1;
  if (zone === 'three') return s.orientationThree[fp];
  if (zone === 'rim' || zone === 'inside') return s.orientationInside[fp];
  return 1;
};
// L = F*(0.25+0.75*I); q = (0.55*MEN02+0.45*MEN03-1)/29 del que decide.
P.libertyAndReading = function libertyAndReading(team, decider) {
  const sel = this.profile.selection;
  const F = sel.freedom[this.styleOf(team).freedom - 1];
  const I = this.pl[decider].initiative;
  const L = F * (sel.initiativeMix[0] + sel.initiativeMix[1] * I);
  const q = (sel.readingMix.MEN02 * this.eff(decider, 'MEN02') + sel.readingMix.MEN03 * this.eff(decider, 'MEN03') - 1) / 29;
  return { L, q: clamp(q, 0, 1), F, I };
};
const normalize = (arr, f) => { const s = arr.reduce((a, x) => a + f(x), 0); return arr.map((x) => (s > 0 ? f(x) / s : 0)); };

// Mezcla Pintencion = (1-L)*Pentrenador + L*(q*Padaptacion + (1-q)*Ppreferencias), sobre el mismo conjunto elegible.
P.mixIntention = function mixIntention(items, { L, q }, label) {
  const hasCoach = items.some((i) => i.coach != null && i.coach > 0);
  const pc = hasCoach ? normalize(items, (i) => i.coach ?? 0) : null;
  const pp = normalize(items, (i) => i.pref ?? 0);
  const pa = normalize(items, (i) => i.adapt ?? 0);
  const out = items.map((it, k) => {
    const pj = q * pa[k] + (1 - q) * pp[k];
    const p = pc ? (1 - L) * pc[k] + L * pj : pj;
    return { ...it, w: p, parts: { entrenador: pc ? round(pc[k]) : null, adaptacion: round(pa[k]), preferencias: round(pp[k]), mezcla: round(p) } };
  });
  this.note(`mezcla:${label}`, { L: round(L, 4), q: round(q, 4), opciones: out.map((o) => ({ clave: o.key, ...o.parts })) });
  return out;
};

// Estimación de valor (Padaptación): puntos*pEstimada - coste esperado de pérdida*riesgo estimado. Rival = referencia 16.
P.estimateValue = function estimateValue(ex) {
  const sh = this.profile.shots[ex.zone];
  const A = this.recipeObj(sh.attack, ex.actor, this.profile.energy.defaultTechnicalTaskMax);
  const pEst = sigmoid(logit(sh.p0) + sh.sA * (A - 16) + (ex.moved ? -this.profile.shotPreparation.movementMaximumLogitCost * (1 - (this.prepAbility(ex.actor) - 1) / 29) : 0));
  let ctl = 16;
  if (ex.exec === 'dribble') ctl = this.taskValue('TAR06', 'attack', { handler: ex.actor });
  else if (ex.exec === 'pass') ctl = this.taskValue('TAR07', 'attack', { passer: ex.passer });
  const risk = ex.exec === 'none' ? 0 : this.profile.outcomes.base.turnover * Math.exp(this.profile.outcomes.controlSensitivity * (16 - ctl));
  const cr = this.profile.selection.candidateRead;
  return Math.max(cr.minimumUtility, sh.points * pEst - cr.expectedTurnoverCostPoints * risk);
};
P.prepAbility = function prepAbility(pid) { return this.taskValue('TAR11', 'attack', { shooter: pid }); };
P.prefWeight = function prefWeight(ex) {
  const p = this.pl[ex.actor];
  return p.zonePreference[ZONE_PREF[ex.zone]] * (0.35 + 0.65 * p.finishingVocation)
    * fit(this.profile, this.eff(ex.actor, ZONE_TEC[ex.zone])) * this.zoneStyleMult(p.teamIdx, ex.zone);
};

// ---------------------------------------------------------------- director y selección de ficha
P.pickDirector = function pickDirector(team) {
  const on = new Set(this.onCourt(team));
  const list = this.teams[team].plan.directorPriority;
  for (let rank = 0; rank < list.length; rank++) { const id = list[rank]; if (on.has(id) && this.ps[id].available) return { id, fallback: false, rank }; }
  for (const s of SLOTS) { const id = this.lineup[team][s]; if (this.ps[id].available) return { id, fallback: true, rank: null }; }
  throw new Error('sin director disponible');
};

P.eligiblePlays = function eligiblePlays(team, director, exclude = new Set()) {
  const out = [];
  for (const b of this.teams[team].plan.playbook) {
    if (exclude.has(b.playId)) continue;
    const play = this.profile.plays.find((p) => p.id === b.playId);
    const a = this.assignRoles(team, b.playId, director);
    if (!a) { this.note('ficha:no_elegible', { ficha: b.playId, motivo: 'sin participante compatible para una función' }); continue; }
    out.push({ playId: b.playId, family: play.family, priority: b.priority, play, ...a });
  }
  return out;
};

// Masa de familia = peso de su mejor prioridad elegible; variante por prioridad dentro de la familia.
P.coachPlayDistribution = function coachPlayDistribution(el) {
  const pw = this.profile.selection.priorityWeights;
  const fam = {};
  for (const e of el) { const w = pw[e.priority - 1]; fam[e.family] = Math.max(fam[e.family] ?? 0, w); }
  const famTotal = Object.values(fam).reduce((a, b) => a + b, 0);
  const res = {};
  for (const f of Object.keys(fam)) {
    const vars = el.filter((e) => e.family === f);
    const vt = vars.reduce((a, e) => a + pw[e.priority - 1], 0);
    for (const e of vars) res[e.playId] = (fam[f] / famTotal) * (pw[e.priority - 1] / vt);
  }
  return res;
};

// ---------------------------------------------------------------- calidad de oportunidad
P.qualityOf = function qualityOf(ex, caRaw, cdRaw, kctx, hasOpposition) {
  const opp = this.profile.opportunity;
  let z;
  const kc = clamp(kctx, -opp.maximumQualityContextLogit, opp.maximumQualityContextLogit);
  if (hasOpposition) z = opp.advantageSensitivity * (caRaw - cdRaw) + kc;
  else z = opp.maximumQualityContextLogit; // ventana realmente libre: extremo favorable del contexto declarado
  const base = opp.qualityBase;
  const items = [
    { key: 'comfortable', w: base.comfortable * Math.exp(z) },
    { key: 'normal', w: base.normal },
    { key: 'forced', w: base.forced * Math.exp(-z) },
  ];
  const tot = items.reduce((a, b) => a + b.w, 0);
  this.note('calidad', { z: round(z, 4), kContexto: round(kc, 4), CA: round(caRaw, 3), CD: hasOpposition ? round(cdRaw, 3) : null, pesos: items.map((i) => ({ clase: i.key, p: round(i.w / tot) })) });
  const chosen = this.pick(items, 'calidad');
  return { cls: chosen.key, K: opp.qualityShotLogit[chosen.key], z };
};

// ---------------------------------------------------------------- resolución de un intento (categoría + consecuencias)
// ex: { team, origin, label, kind, actor, zone, exec, passer, icpt, defend, moved, offContact, holder, window, quality }
P.categoryWeights = function categoryWeights(ex) {
  const o = this.profile.outcomes; const base = o.base;
  const w = {}; const z = {};
  const isShotExit = true;
  // pérdida
  if (ex.exec !== 'none') {
    let off; let def = null;
    if (ex.exec === 'dribble') {
      off = this.taskValue('TAR06', 'attack', { handler: ex.actor });
      if (ex.icpt) def = this.taskValue('TAR06', 'defense', { primary: ex.icpt });
    } else {
      off = this.taskValue('TAR07', 'attack', { passer: ex.passer });
      if (ex.icpt) def = this.taskValue('TAR07', 'defense', { interceptor: ex.icpt });
    }
    z.turnover = def != null ? o.controlSensitivity * (def - off) : -o.controlSensitivity * (off - 16);
    w.turnover = base.turnover * Math.exp(z.turnover);
    ex.ctl = { off: round(off, 3), def: def == null ? null : round(def, 3) };
  }
  const opposer = ex.defend ?? ex.icpt;
  const innerZone = ex.zone === 'rim' || ex.zone === 'inside';
  if (opposer) {
    const c = this.profile.contact;
    const dt = innerZone ? 'TEC13' : 'TEC12';
    const legal = this.recipe([['d', dt, c.defensiveLegality.defenseTechnique], ['d', 'MEN04', c.defensiveLegality.MEN04], ['d', 'MEN05', c.defensiveLegality.MEN05]], { d: opposer }, c.maximumEnergyPenalty, 'legalidad_defensiva');
    z.defFoul = o.defensiveFoulSensitivity * (16 - legal);
    w.defensiveNonShootingFoul = base.defensiveNonShootingFoul * Math.exp(z.defFoul);
    if (ex.defend) w.shootingFoul = base.shootingFoul * Math.exp(z.defFoul);
    w.looseBall = base.looseBall * 1; z.loose = 0;
  }
  if (ex.offContact) {
    const c = this.profile.contact;
    const legal = this.recipe([['o', ex.offContact.tech, c.offensiveLegality.actionTechnique], ['o', 'FIS04', c.offensiveLegality.FIS04], ['o', 'FIS07', c.offensiveLegality.FIS07]], { o: ex.offContact.pid }, c.maximumEnergyPenalty, 'legalidad_ofensiva');
    z.offFoul = o.offensiveFoulSensitivity * (16 - legal);
    w.offensiveFoul = base.offensiveFoul * Math.exp(z.offFoul);
  }
  if (ex.exec === 'dribble') w.ballViolation = base.ballViolation;
  w.fieldShot = base.fieldShot;
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  const probs = {}; for (const k of Object.keys(w)) probs[k] = w[k] / tot;
  this.note('categorías', { z: Object.fromEntries(Object.entries(z).map(([k, v]) => [k, round(v, 4)])), p: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, round(v, 5)])) });
  return w;
};

P.durationKindFor = function durationKindFor(ex, cat) {
  const d = this.profile.durationSeconds;
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(ex.team).organizedPace - 1];
  if (ex.kind === 'transition') return { dist: d.transition, factor: 1, tag: 'transición', load: 'transition' };
  if (ex.kind === 'continuation') return { dist: d.continuation, factor: 1, tag: 'continuación', load: 'continuation' };
  const isShot = cat === 'fieldShot' || cat === 'shootingFoul';
  if (isShot) return { dist: d.organizedShot, factor: f, tag: 'tiro organizado', load: 'organized' };
  if (cat === 'turnover' || cat === 'ballViolation' || cat === 'looseBall') return { dist: d.organizedTurnover, factor: f, tag: 'pérdida organizada', load: 'organized' };
  return { dist: d.organizedFoul, factor: f, tag: 'falta organizada', load: 'organized' };
};

// Planifica una duración: trunca a < límite; si ni el mínimo cabe, un tiro usa la distribución urgente; si tampoco, expira.
P.planDuration = function planDuration(spec, cat, purpose) {
  const lim = this.limit();
  const d = this.profile.durationSeconds;
  const isShot = cat === 'fieldShot' || cat === 'shootingFoul';
  let { dist, factor, tag, load } = spec;
  if (lim <= Math.round(dist[0] * factor * 10)) {
    if (isShot && lim > Math.round(d.urgentShot[0] * 10)) { dist = d.urgentShot; factor = 1; tag = 'tiro urgente'; this.cover('ESP16 final de posesión'); }
    else return { expired: true };
  }
  const tenths = this.sampleDuration(dist, `${purpose}:${tag}`, { factor, limit: lim });
  return { tenths, load, tag };
};

// Procesa un límite alcanzado antes de que ocurra el hecho: bocina o reloj de posesión.
P.expire = function expire(ex, reason) {
  const lim = this.limit();
  const periodEnds = this.clock <= this.shotClock || !this.shotClockOn;
  const t = this.consume(lim, 'organized');
  if (this.clock === 0 && periodEnds) {
    this.emit('expiry', { team: ex?.team, t, intent: { origen: ex?.origin ?? null, motivo: 'bocina antes de producirse el hecho', pendiente: reason ?? null }, effects: { fin: 'periodo' } });
    this.cover('hecho impedido por bocina');
    return { end: 'periodEnd' };
  }
  // violación de 24 segundos: pérdida de equipo, balón muerto
  this.emit('expiry', { team: ex.team, t, intent: { origen: ex.origin, motivo: 'violación de reloj de posesión' }, stats: [{ k: 'tov', p: null, team: ex.team, cause: 'violacion_24' }], effects: { fin: 'posesion' } });
  this.cover('violación 24 s');
  this.endPossession('deadTurnover', { team: ex.team });
  return { end: 'deadTurnover' };
};

P.participantsOf = function participantsOf(ex) {
  return { ...(ex.roles ?? {}), actor: ex.actor, pasador: ex.passer ?? null, defensor: ex.defend ?? null, interceptor: ex.icpt ?? null, ayudante: ex.helper ?? null, ventanaLibre: ex.window ? ex.actor : null };
};

// ---------------------------------------------------------------- tiro
P.shotAbility = function shotAbility(ex) {
  const sh = this.profile.shots[ex.zone];
  const tm = ex.zone === 'freeThrow' ? this.profile.energy.freeThrowTaskMax : this.profile.energy.defaultTechnicalTaskMax;
  return this.recipeObj(sh.attack, ex.actor, tm, `ataque_tiro:${ex.zone}`);
};
P.shotDefense = function shotDefense(zone, defender, attacker) {
  const sh = this.profile.shots[zone];
  const terms = Object.entries(sh.defense).map(([attr, w]) => ['d', attr, w]);
  const base = this.recipe(terms, { d: defender }, null, `defensa_tiro:${zone}`);
  const reach = this.profile.body.contestAbilitySensitivity * (this.pl[defender].reach - this.pl[attacker].reach);
  this.note('alcance', { defensor: round(this.pl[defender].reach, 3), atacante: round(this.pl[attacker].reach, 3), ajuste: round(reach, 3) });
  return base + reach;
};

P.resolveShot = function resolveShot(ex, base, contact) {
  const sh = this.profile.shots[ex.zone];
  const stats = [];
  const A = this.shotAbility(ex);
  const defender = ex.defend;
  let K = ex.quality ? ex.quality.K : 0;
  if (ex.moved && (ex.zone === 'three' || ex.zone === 'midrange')) {
    const sp = this.profile.shotPreparation;
    const prep = this.taskValue('TAR11', 'attack', { shooter: ex.actor });
    const cost = sp.movementMaximumLogitCost * (1 - (prep - 1) / 29);
    K -= cost; this.note('preparación_movimiento', { TEC06mezcla: round(prep, 3), costeLogit: round(cost, 4) });
  }
  if (contact) K += this.profile.outcomes.shootingContactLogit;
  // tapón (solo con opositor y sin la rama de contacto)
  if (defender && !contact) {
    const b = this.profile.block;
    const blk = this.recipeObj(b.attack, defender, b.maximumEnergyPenalty, 'tapón:bloqueador');
    const resist = b.resistanceTechniqueWeight * A + b.resistanceBalanceWeight * this.eff(ex.actor, 'FIS07', this.profile.energy.defaultTechnicalTaskMax);
    const pB = sigmoid(logit(sh.blockP0) + b.sA * (blk - 16) - b.sD * (resist - 16));
    if (this.bernoulli(pB, 'tapón')) return this.resolveBlocked(ex, base, defender);
  }
  let pr = logit(sh.p0) + sh.sA * (A - 16) + K;
  if (defender) pr -= sh.sD * (this.shotDefense(ex.zone, defender, ex.actor) - 16);
  const p = sigmoid(pr);
  const made = this.bernoulli(p, `conversión:${ex.zone}`);
  const shotFact = { k: 'shot', p: ex.actor, team: ex.team, zone: ex.zone, points: sh.points, made, fromFoul: contact };
  stats.push(shotFact);
  const eff = { zona: ex.zone, pConversion: round(p, 5), entra: made, defensor: defender ?? null, ventanaLibre: !!ex.window };
  if (made) this.addPoints(ex.team, sh.points);
  if (contact) {
    const committer = defender;
    this.cover('falta en tiro');
    const n = freeThrowsForShootingFoul(sh.points, made);
    const ev = this.emit('attempt', { ...base, stats, effects: { ...eff, falta: { de: committer, sobre: ex.actor, tirosLibres: n, canastaValida: made } } });
    this.foulAdmin(committer, ex.actor, { shooting: true, ftCount: n, shotTeam: ex.team, shotMade: made });
    this.poss.pendingFT = ex; // la ventana de la falta es una frontera; la serie de libres se resuelve en la unidad siguiente
    return { cont: 'foulWindow' };
  }
  this.emit('attempt', { ...base, stats, effects: eff });
  if (made) {
    this.cover(`canasta ${ex.zone}`);
    this.endPossession('madeFG', { team: ex.team });
    return { end: 'madeFG' };
  }
  return this.afterMiss(ex, ex.zone);
};

P.resolveBlocked = function resolveBlocked(ex, base, blocker) {
  const b = this.profile.block;
  const stats = [{ k: 'shot', p: ex.actor, team: ex.team, zone: ex.zone, points: this.profile.shots[ex.zone].points, made: false, blockedBy: blocker }, { k: 'blk', p: blocker, team: 1 - ex.team }];
  this.cover('tapón');
  if (this.bernoulli(b.outOfBoundsGivenBlock, 'tapón:fuera')) {
    this.emit('attempt', { ...base, stats, effects: { zona: ex.zone, tapon: true, destino: 'fuera, saque del ataque (sin contacto de aro: el reloj de posesión continúa)' } });
    this.cover('tapón fuera sin aro');
    this.deadBall('tapón fuera');
    this.poss.advanced = true; this.clockRunning = false;
    return { cont: 'blockedOOB' };
  }
  const defenseGets = this.bernoulli(b.blockedLooseControlDefenseProbability, 'tapón:balón_vivo');
  this.emit('attempt', { ...base, stats, effects: { zona: ex.zone, tapon: true, destino: defenseGets ? 'balón vivo, control defensivo' : 'balón vivo, conserva el ataque' } });
  if (defenseGets) {
    const carrier = this.pickRecoverer(1 - ex.team, blocker);
    this.endPossession('live', { team: ex.team, origin: 'tapón', carrier });
    return { end: 'blockRecovery' };
  }
  this.poss.disorganized = true;
  return { cont: 'blockedLive' };
};

// Quién recupera un balón vivo sin robo: el candidato indicado o, si falta, el de mejor receta TAR17.
P.pickRecoverer = function pickRecoverer(team, prefer) {
  if (prefer && this.ps[prefer].onCourt) return prefer;
  const items = this.onCourt(team).map((id) => ({ key: id, w: this.taskValue('TAR17', 'attack', { contender: id }) }));
  return this.pick(items, 'recuperador').key;
};

// ---------------------------------------------------------------- pérdida, faltas, infracción, balón suelto
P.resolveTurnover = function resolveTurnover(ex, base) {
  const o = this.profile.outcomes;
  const stats = [{ k: 'tov', p: ex.exec === 'pass' ? ex.passer : ex.actor, team: ex.team, cause: ex.exec === 'pass' ? 'pase' : 'balón' }];
  let stealer = null;
  if (ex.icpt && this.bernoulli(o.stealGivenTurnover, 'robo')) { stealer = ex.icpt; stats.push({ k: 'stl', p: stealer, team: 1 - ex.team }); }
  if (stealer) {
    this.emit('attempt', { ...base, stats, effects: { perdida: true, robo: stealer, balonVivo: true } });
    this.cover('robo');
    this.endPossession('live', { team: ex.team, origin: 'robo', carrier: stealer });
    return { end: 'steal' };
  }
  const oob = this.bernoulli(o.turnoverOutOfBoundsIfNotSteal, 'pérdida:fuera');
  if (oob) {
    this.emit('attempt', { ...base, stats, effects: { perdida: true, fuera: true, robo: null } });
    this.cover('pérdida fuera');
    this.endPossession('deadTurnover', { team: ex.team });
    return { end: 'deadTurnover' };
  }
  const carrier = this.pickRecoverer(1 - ex.team, ex.icpt);
  this.emit('attempt', { ...base, stats, effects: { perdida: true, robo: null, balonVivo: true, recupera: carrier } });
  this.cover('pérdida viva sin robo');
  this.endPossession('live', { team: ex.team, origin: 'pérdida', carrier });
  return { end: 'liveTurnover' };
};

P.resolveBallViolation = function resolveBallViolation(ex, base) {
  this.emit('attempt', { ...base, stats: [{ k: 'tov', p: ex.actor, team: ex.team, cause: 'infracción de balón' }], effects: { infraccion: true } });
  this.cover('infracción de balón');
  this.endPossession('deadTurnover', { team: ex.team });
  return { end: 'deadTurnover' };
};

P.resolveOffensiveFoul = function resolveOffensiveFoul(ex, base) {
  const committer = ex.offContact.pid;
  this.ps[committer].fouls += 1;
  const key = foulPeriodKey(this.period, this.profile.rules);
  this.teamFouls[ex.team][key] = (this.teamFouls[ex.team][key] ?? 0) + 1;
  const stats = [{ k: 'foul', p: committer, team: ex.team, kind: 'ofensiva', teamFoul: true }, { k: 'tov', p: committer, team: ex.team, cause: 'falta ofensiva' }];
  this.cover('falta ofensiva');
  this.emit('attempt', { ...base, stats, effects: { faltaOfensiva: committer, contacto: ex.offContact.kind, faltasPersonales: this.ps[committer].fouls } });
  if (this.ps[committer].fouls >= this.profile.rules.foulOut) this.exclude(committer);
  this.endPossession('deadTurnover', { team: ex.team });
  return { end: 'deadTurnover' };
};

P.resolveDefensiveFoul = function resolveDefensiveFoul(ex, base) {
  const committer = ex.defend ?? ex.icpt;
  this.cover('falta defensiva sin tiro');
  const ev = this.emit('attempt', { ...base, stats: [], effects: { faltaDefensiva: committer, sobre: ex.actor, tipo: 'sin tiro' } });
  this.foulAdmin(committer, ex.actor, { shooting: false, shotTeam: ex.team });
  this.poss.pendingFT = ex;
  return { cont: 'foulWindow' };
};

P.exclude = function exclude(pid) {
  this.ps[pid].available = false; this.cover('exclusión por faltas');
};

// Administración determinista de una falta defensiva validada (sin nuevos sorteos).
P.foulAdmin = function foulAdmin(committer, fouled, { shooting, ftCount = 0, shotTeam, shotMade = false }) {
  const rules = this.profile.rules;
  const defTeam = 1 - shotTeam;
  const key = foulPeriodKey(this.period, rules);
  const before = this.teamFouls[defTeam][key] ?? 0;
  const penalty = inPenalty(before, rules);
  this.ps[committer].fouls += 1;
  this.teamFouls[defTeam][key] = before + 1;
  const out = this.ps[committer].fouls >= rules.foulOut;
  if (out) this.exclude(committer);
  let n = 0; let kind;
  if (shooting) { n = ftCount; kind = 'falta en acto de tiro'; }
  else if (penalty) { n = rules.freeThrowsForOrdinaryBonus; kind = 'penalización colectiva'; }
  else kind = 'saque de banda';
  const ev = this.emit('foul', {
    team: shotTeam,
    intent: { origen: 'falta defensiva', tipo: kind },
    participants: { infractor: committer, sobre: fouled },
    stats: [{ k: 'foul', p: committer, team: defTeam, kind: shooting ? 'tiro' : 'personal', teamFoul: true }],
    effects: { faltasPersonales: this.ps[committer].fouls, faltasColectivasPeriodo: this.teamFouls[defTeam][key], penalizacion: penalty, tirosLibres: n, excluido: out, causaTirosLibres: kind },
  });
  this.pendingFoul = { fouled, n, shotTeam, shooting, shotMade, kind };
  this.deadBall('falta');
};

// Tras una falta: serie de tiros libres si corresponde, o saque con el mismo ataque.
P.afterFreeThrows = function afterFreeThrows(ex) {
  const f = this.pendingFoul; this.pendingFoul = null;
  if (f.n > 0) return this.shootFreeThrows(f.fouled, f.n, f, ex);
  // saque de banda en ataque: el mismo ataque continúa, reloj de posesión >= 14 s
  this.shotClock = shotClockAfterDefensiveStoppage(this.shotClock, this.profile.rules);
  this.poss.advanced = true; this.clockRunning = false;
  this.cover('saque de banda tras falta');
  return { cont: 'inboundAfterFoul' };
};

P.shootFreeThrows = function shootFreeThrows(shooter, n, f, ex) {
  const sh = this.profile.shots.freeThrow;
  for (let i = 1; i <= n; i++) {
    const A = this.recipeObj(sh.attack, shooter, this.profile.energy.freeThrowTaskMax, 'ataque_libre');
    const p = sigmoid(logit(sh.p0) + sh.sA * (A - 16));
    const made = this.bernoulli(p, 'libre');
    if (made) this.addPoints(f.shotTeam, 1);
    const last = i === n;
    this.emit('free_throw', {
      team: f.shotTeam,
      intent: { origen: f.kind, serie: `${i}/${n}` },
      participants: { lanzador: shooter },
      stats: [{ k: 'ft', p: shooter, team: f.shotTeam, made }],
      effects: { pLibre: round(p, 5), entra: made, ultimo: last },
    });
    if (last && made) { this.cover('último libre anotado'); this.endPossession('ftMade', { team: f.shotTeam }); return { end: 'ftMade' }; }
    if (last && !made) return this.afterMiss({ ...ex, team: f.shotTeam, actor: shooter }, 'freeThrow');
  }
  throw new Error('serie de tiros libres sin resolución');
};

P.resolveLooseBall = function resolveLooseBall(ex, base) {
  const opposer = ex.defend ?? ex.icpt;
  const stats = [];
  this.emit('attempt', { ...base, stats, effects: { balonSuelto: true } });
  const ra = this.taskValue('TAR17', 'attack', { contender: ex.actor }, 'suelto:ataque');
  const rd = this.taskValue('TAR17', 'attack', { contender: opposer }, 'suelto:defensa');
  const p = sigmoid(this.profile.outcomes.looseControlSensitivity * (ra - rd));
  const off = this.bernoulli(p, 'suelto:control');
  const spec = { dist: this.profile.durationSeconds.looseBall, factor: 1, tag: 'balón suelto', load: 'rebound' };
  const plan = this.planDuration(spec, 'looseBall', 'disputa');
  if (plan.expired) return this.expire(ex, 'balón suelto');
  const t = this.consume(plan.tenths, plan.load);
  this.cover('balón suelto');
  if (off) {
    this.emit('loose_ball', { t, team: ex.team, participants: { disputa: [ex.actor, opposer] }, effects: { pControlAtaque: round(p, 4), control: 'ataque' } });
    this.poss.disorganized = true;
    return { cont: 'looseKept' };
  }
  this.emit('loose_ball', { t, team: ex.team, participants: { disputa: [ex.actor, opposer] }, stats: [{ k: 'tov', p: ex.actor, team: ex.team, cause: 'balón suelto perdido' }], effects: { pControlAtaque: round(p, 4), control: 'defensa', recupera: opposer } });
  this.endPossession('live', { team: ex.team, origin: 'balón suelto', carrier: opposer });
  return { end: 'looseLost' };
};

// ---------------------------------------------------------------- rebote
P.afterMiss = function afterMiss(ex, zone) {
  const rb = this.profile.rebound;
  const ft = zone === 'freeThrow';
  const offT = ex.team; const defT = 1 - offT;
  const offSlots = ft ? rb.liveLastFreeThrowOffenseSlots : rb.offenseParticipantSlots;
  const defSlots = ft ? rb.liveLastFreeThrowDefenseSlots : rb.defenseParticipantSlots;
  const offP = this.playersAtSlots(offT, offSlots);
  if (!ft && rb.addShooterIfNearRim && (zone === 'rim' || zone === 'inside') && !offP.includes(ex.actor)) offP.push(ex.actor);
  const defP = this.playersAtSlots(defT, defSlots);
  const strength = (pid) => this.recipeObj(rb.strength, pid, rb.maxEnergyPenalty) + this.profile.body.reboundStrengthSensitivity * (this.pl[pid].reach - 0.5);
  const mean = (ids) => ids.reduce((s, id) => s + strength(id), 0) / ids.length;
  const RA = mean(offP); const RD = mean(defP);
  const K = rb.loadLogitByLevel[this.styleOf(offT).afterShot - 1];
  const p0 = ft ? rb.lastFreeThrowOffensiveP0 : rb.fieldOffensiveP0;
  const pRO = sigmoid(logit(p0) + rb.sensitivity * (RA - RD) + K);
  this.note('rebote', { participantesAtaque: offP, participantesDefensa: defP, RA: round(RA, 3), RD: round(RD, 3), kCarga: K, pRebOfensivo: round(pRO, 5) });
  const spec = { dist: this.profile.durationSeconds.rebound, factor: 1, tag: 'rebote', load: 'rebound' };
  const plan = this.planDuration(spec, 'rebound', 'rebote');
  if (plan.expired) {
    // bocina: no hay continuación viva ni rebote inventado
    const t = this.consume(this.limit(), 'rebound');
    this.emit('expiry', { team: offT, t, intent: { origen: 'tiro fallado', motivo: 'bocina sin continuación viva' }, effects: { fin: 'periodo' } });
    this.cover('fallo con bocina sin rebote');
    return { end: 'periodEnd' };
  }
  const t = this.consume(plan.tenths, plan.load);
  const offReb = this.bernoulli(pRO, 'rebote:equipo');
  const team = offReb ? offT : defT;
  const cands = offReb ? offP : defP;
  const captor = this.pick(cands.map((id) => ({ key: id, w: this.recipeObj(rb.captor, id, rb.maxEnergyPenalty) })), 'rebote:captor').key;
  this.cover(offReb ? 'rebote ofensivo' : 'rebote defensivo');
  this.emit('rebound', { t, team: offT, intent: { origen: ft ? 'último libre fallado' : `tiro fallado ${zone}` }, participants: { captor, candidatos: cands }, stats: [{ k: 'reb', p: captor, team, off: offReb }], effects: { ofensivo: offReb, pRebOfensivo: round(pRO, 5), contactoAro: true } });
  if (!offReb) { this.endPossession('live', { team: offT, origin: 'rebote', carrier: captor }); return { end: 'dreb' }; }
  this.shotClock = shotClockAfterRingContact(this.shotClock, this.profile.rules);
  this.poss.advanced = true; this.poss.disorganized = true;
  this.poss.oreb = { captor };
  this.clockRunning = true;
  return { cont: 'oreb', captor };
};

// ---------------------------------------------------------------- fin de posesión y paso a la siguiente
// Balón muerto: abre una ventana reglamentaria (tiempo muerto / sustitución) que se resuelve en la frontera siguiente.
P.deadBall = function deadBall(reason) {
  this.clockRunning = false;
  this.queueWindow({ reason, timeoutTeams: [0, 1], subs: true });
};

P.endPossession = function endPossession(kind, info) {
  const team = info.team; const opp = 1 - team;
  const rules = this.profile.rules;
  switch (kind) {
    case 'madeFG': {
      const stops = clockStopsAfterGoal(this.period, this.clock, rules);
      this.clockRunning = !stops;
      if (stops) this.deadBall('canasta con reloj parado');
      else this.queueWindow({ reason: 'canasta recibida', timeoutTeams: [opp], subs: false }); // solo el equipo que recibe la canasta
      this.nextPoss = { team: opp, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds) };
      break;
    }
    case 'ftMade': this.deadBall('último libre'); this.nextPoss = { team: opp, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds) }; break;
    case 'deadTurnover': this.deadBall('balón muerto'); this.nextPoss = { team: opp, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds) }; break;
    case 'live': this.nextPoss = { team: opp, entry: 'live', origin: info.origin, carrier: info.carrier, shotClock: toTenths(rules.shotClockSeconds) }; this.clockRunning = true; break;
    default: throw new Error(`fin de posesión desconocido ${kind}`);
  }
};
