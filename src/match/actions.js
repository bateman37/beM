// Selección de intención, resolución de acontecimientos y flujo de posesiones.
// Una resolución agrupa preparación, lectura, elección y ejecución; el tiempo se descuenta una vez por hecho.
import { clamp, sigmoid, logit, round } from './mathx.js';
import { shotLogit, vocationFactor } from './formulas.js';
import { SLOTS } from './data.js';
import { MatchCore } from './core.js';
import { fit } from './plays.js';
import { perturbBinary, perturbCategories } from './formulas.js';
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
  // MOTOR-07: la presión reduce la valoración efectiva de Decisiones (hasta k·P·(1 − a(MEN07)) puntos) solo en esta elección; no toca la nota ni la ejecución.
  const m3 = Math.max(this.profile.abilityBounds[0], this.eff(decider, 'MEN03') - this.choicePenalty(decider));
  const q = (sel.readingMix.MEN02 * this.eff(decider, 'MEN02') + sel.readingMix.MEN03 * m3 - 1) / 29;
  return { L, q: clamp(q, 0, 1), F, I, team };
};
const normalize = (arr, f) => { const s = arr.reduce((a, x) => a + f(x), 0); return arr.map((x) => (s > 0 ? f(x) / s : 0)); };

// Mezcla Pintencion = (1-L)*Pentrenador + L*(q*Padaptacion + (1-q)*Ppreferencias), sobre el mismo conjunto elegible.
// MOTOR-04: tres ajustes de estilo, cada uno aplicado UNA vez y solo donde procede (nivel 3 = factor 1, sin efecto):
//   · elaboración: las continuaciones elegibles (`cont`) multiplican sus pesos por el factor del nivel, antes de normalizar;
//   · riesgo: cada opción con riesgo estimado r pondera su preferencia por exp(tilt·r) (r lo produce estimateValue; sin r no actúa);
//   · media distancia: factor de la instrucción sobre opciones de media (`mid`), ya calculado por el llamante.
P.mixIntention = function mixIntention(items, { L, q, team }, label) {
  const sel = this.profile.selection;
  const st = this.styleOf(team);
  const ef = sel.elaborationContinuationWeightFactor[st.elaboration - 1];
  const tilt = sel.offensiveRiskPreferenceTilt[st.offensiveRisk - 1];
  const uf = this.urgencyFactor(); const cf = ef * uf; // elaboración y urgencia (SEM) actúan sobre las continuaciones viables, una vez cada una
  const scaled = items.map((i) => (i.cont && cf !== 1 ? { ...i, coach: i.coach == null ? i.coach : i.coach * cf, pref: (i.pref ?? 0) * cf, adapt: (i.adapt ?? 0) * cf } : i));
  const hasCoach = scaled.some((i) => i.coach != null && i.coach > 0);
  const pc = hasCoach ? normalize(scaled, (i) => i.coach ?? 0) : null;
  const pp = normalize(scaled, (i) => i.pref ?? 0);
  const pa = normalize(scaled, (i) => i.adapt ?? 0);
  const out = scaled.map((it, k) => {
    const pj = q * pa[k] + (1 - q) * pp[k];
    let p = pc ? (1 - L) * pc[k] + L * pj : pj;
    const rf = it.risk != null && tilt !== 0 ? Math.exp(tilt * it.risk) : 1;
    const mf = it.mid ?? 1;
    p *= rf * mf;
    return { ...it, w: p, parts: { entrenador: pc ? round(pc[k]) : null, adaptacion: round(pa[k]), preferencias: round(pp[k]), riesgo: rf === 1 ? null : round(rf, 4), media: mf === 1 ? null : round(mf, 4), mezcla: round(p) } };
  });
  this.note(`mezcla:${label}`, { L: round(L, 4), q: round(q, 4), elaboracion: ef === 1 ? null : ef, urgencia: uf === 1 ? null : uf, opciones: out.map((o) => ({ clave: o.key, ...o.parts })) });
  return out;
};

// Estimación de valor (Padaptación): puntos*pEstimada - coste esperado de pérdida*riesgo estimado. Rival = referencia 16.
P.estimateValue = function estimateValue(ex) {
  const sh = this.profile.shots[ex.zone];
  const A = this.recipeObj(sh.attack, ex.actor, this.profile.energy.defaultTechnicalTaskMax);
  const cr = this.profile.selection.candidateRead; const N = this.profile.neutralAbility;
  // el valor estimado supone un rival de capacidad `opponentAbilityEstimate` (en la referencia neutra no añade nada)
  const pEst = sigmoid(logit(sh.p0) + sh.sA * (A - N) - sh.sD * (cr.opponentAbilityEstimate - N) + (ex.moved ? -this.profile.shotPreparation.movementMaximumLogitCost * (1 - (this.prepAbility(ex.actor) - 1) / 29) : 0));
  let ctl = N;
  if (ex.exec === 'dribble') ctl = this.taskValue('TAR06', 'attack', { handler: ex.actor });
  else if (ex.exec === 'pass') ctl = this.taskValue('TAR07', 'attack', { passer: ex.passer });
  const risk = ex.exec === 'none' ? 0 : this.profile.outcomes.base.turnover * Math.exp(this.profile.outcomes.controlSensitivity * (cr.opponentAbilityEstimate - ctl));
  ex.riskEst = risk; // estimación permitida de riesgo r (0–1) que usa el estilo de riesgo ofensivo; no se inventa otra por nombre de ficha
  return Math.max(cr.minimumUtility, sh.points * pEst - cr.expectedTurnoverCostPoints * risk);
};
P.prepAbility = function prepAbility(pid) { return this.taskValue('TAR11', 'attack', { shooter: pid }); };
P.prefWeight = function prefWeight(ex) {
  const p = this.pl[ex.actor];
  return p.zonePreference[ZONE_PREF[ex.zone]] * vocationFactor(this.profile, p.finishingVocation)
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

// Fichas elegibles del libro (más una ficha llamada aunque no esté activa en el libro: una llamada puntual no la activa).
// Elegibilidad ANTES de preferencia: una ficha cuya función no puede ocuparse queda fuera con su motivo funcional; si falta una
// función que sí aporta una de sus disposiciones naturales y hay tiempo, es elegible tras una reorganización (consume tiempo real).
P.eligiblePlays = function eligiblePlays(team, director, exclude = new Set(), poss = this.poss, forceIds = []) {
  const out = []; const diag = [];
  const layout = this.layoutOf(poss, director);
  const book = this.teams[team].plan.playbook;
  const ids = [...book.map((b) => b.playId), ...forceIds.filter((id) => !book.some((b) => b.playId === id))];
  const f = this.profile.selection.organizedDurationFactor[this.styleOf(team).organizedPace - 1];
  const d = this.profile.durationSeconds;
  const reorgMin = Math.round(d.reorganization[0] * f * 10) + Math.round(d.organizedShot[0] * f * 10);
  const catalog = this.profile.activeCatalog.dispositions;
  for (const id of ids) {
    const priority = book.find((b) => b.playId === id)?.priority ?? null;
    if (exclude.has(id)) { diag.push({ ficha: id, prioridad: priority, elegible: false, motivo: 'abandonada en esta posesión tras su negación' }); continue; }
    const play = this.playDef(id);
    let lay = layout; let reorgTo = null;
    let r = this.assignRoles(team, id, director, lay, poss, { dry: true });
    if (!r.ok) {
      const why = r.fail; let found = false;
      for (const dis of play.spec.natural.filter((x) => x !== layout.dis && catalog.includes(x))) {
        if (this.limit() <= reorgMin) break; // sin tiempo para reorganizar
        const lay2 = this.layoutFor(team, dis, director);
        if (this.assignRoles(team, id, director, lay2, poss, { dry: true }).ok) { lay = lay2; reorgTo = dis; found = true; break; }
      }
      if (!found) { this.note('ficha:no_elegible', { ficha: id, motivo: why }); diag.push({ ficha: id, prioridad: priority, elegible: false, motivo: why }); continue; }
    }
    const a = this.assignRoles(team, id, director, lay, poss);
    if (a.fail) { this.note('ficha:no_elegible', { ficha: id, motivo: a.fail }); diag.push({ ficha: id, prioridad: priority, elegible: false, motivo: a.fail }); continue; }
    diag.push({ ficha: id, prioridad: priority, elegible: true, reorganizaA: reorgTo });
    out.push({ playId: id, family: play.family, priority: priority ?? 1, play, ...a, reorgTo, called: priority == null });
  }
  this.note('libro:elegibilidad', { disposicion: layout.dis, fichas: diag });
  return out;
};

// Masa de familia = peso de su mejor prioridad elegible; variante por prioridad dentro de la familia. La variante nueva sin otra
// preferencia declarada pesa `eligibleVariantBaseWeight` (neutral): duplicar variantes o nombres no aumenta la masa familiar.
P.coachPlayDistribution = function coachPlayDistribution(el) {
  const pw = this.profile.selection.priorityWeights;
  const vb = this.profile.selection.newVariantPreference.eligibleVariantBaseWeight;
  const fam = {};
  for (const e of el) { const w = pw[e.priority - 1]; fam[e.family] = Math.max(fam[e.family] ?? 0, w); }
  const famTotal = Object.values(fam).reduce((a, b) => a + b, 0);
  const res = {};
  for (const f of Object.keys(fam)) {
    const vars = el.filter((e) => e.family === f);
    const vt = vars.reduce((a, e) => a + pw[e.priority - 1] * vb, 0);
    for (const e of vars) res[e.playId] = (fam[f] / famTotal) * (pw[e.priority - 1] * vb / vt);
  }
  return res;
};

// ---------------------------------------------------------------- calidad de oportunidad
// Distribución de la calidad previa (cómoda / normal / forzada). Una sola implementación para qualityOf y para la estimación de
// «calidad previa cómoda» de la media distancia (selección), de modo que no pueden divergir.
P.qualityDistribution = function qualityDistribution(caRaw, cdRaw, kctx, hasOpposition, noForced = false, extraZ = 0) {
  const opp = this.profile.opportunity;
  const kc = clamp(kctx, -opp.maximumQualityContextLogit, opp.maximumQualityContextLogit);
  const z = (hasOpposition ? opp.advantageSensitivity * (caRaw - cdRaw) + kc : opp.maximumQualityContextLogit) + extraZ; // ventana libre: extremo favorable declarado; extraZ = Forma/presión de la coordinación (MOTOR-07)
  const base = opp.qualityBase;
  const items = [
    { key: 'comfortable', w: base.comfortable * Math.exp(z) },
    { key: 'normal', w: base.normal },
    { key: 'forced', w: noForced ? 0 : base.forced * Math.exp(-z) }, // sin negación defendida (facilita la ayuda): no hay clase forzada por negación
  ];
  const tot = items.reduce((a, b) => a + b.w, 0);
  return { z, kc, items, tot, p: Object.fromEntries(items.map((i) => [i.key, i.w / tot])) };
};
P.qualityOf = function qualityOf(ex, caRaw, cdRaw, kctx, hasOpposition) {
  const opp = this.profile.opportunity;
  // MOTOR-07 (coordinación): Forma y presión del lado que crea la oportunidad y momento M-OFE + T frente a M-DEF + T rival, una sola vez por tarea.
  // El tiro posterior usa esta oportunidad y los estados individuales; T no entra otra vez en su conversión.
  let fp = null; let mz = null;
  if (ex) {
    const own = [ex.holder, ex.actor];
    const counter = hasOpposition ? [ex.defend, ex.icpt, ex.defMix?.primary, ex.defMix?.second] : [];
    fp = this.formPressure('opportunityQuality', own, counter, { executants: own });
    mz = this.momentZ('opportunityQuality', own, counter, { team: ex.team });
    ex.mdefUsed = mz.usedCounter; // M-DEF del defensor ya explicó la dificultad de esta oportunidad: la conversión no lo vuelve a usar
  }
  const d = this.qualityDistribution(caRaw, cdRaw, kctx, hasOpposition, !!ex?.noDenial, fp ? fp.delta : 0);
  let items = d.items; let pFinal = d.p;
  if (mz) {
    const task = this.profile.stateTasks.tasks.opportunityQuality;
    pFinal = perturbCategories(d.p, task.favorableClasses, mz.Z, mz.alpha);
    items = d.items.map((i) => ({ ...i, w: pFinal[i.key] }));
    this.perturbNote('opportunityQuality', mz, { grupoFavorable: task.favorableClasses, probabilidadesBase: Object.fromEntries(Object.entries(d.p).map(([k, v]) => [k, round(v, 5)])), probabilidadesFinales: Object.fromEntries(Object.entries(pFinal).map(([k, v]) => [k, round(v, 5)])) });
  }
  this.note('calidad', { z: round(d.z, 4), kContexto: round(d.kc, 4), CA: round(caRaw, 3), CD: hasOpposition ? round(cdRaw, 3) : null, pesos: items.map((i) => ({ clase: i.key, p: round(i.w / (mz ? 1 : d.tot)) })) });
  const chosen = this.pick(items, 'calidad');
  return { cls: chosen.key, K: opp.qualityShotLogit[chosen.key], z: d.z };
};

// Instrucción de media distancia (MOTOR-04): factor de SELECCIÓN de una opción de media. No toca el acierto ni la preparación.
// «Aceptar si está liberada» usa la probabilidad de calidad previa cómoda como esperanza (la calidad real se resuelve después de elegir).
P.midrangeFactor = function midrangeFactor(team, ex, pComfortable) {
  if (ex.zone !== 'midrange') return null;
  const mp = this.profile.selection.midrangePolicy;
  const policy = this.teams[team].plan.midrange;
  if (policy === 'avoid') return mp.avoidWeight;
  if (policy === 'seek') return mp.suitablePlayerBase + mp.suitablePlayerAbilitySlope * ((this.eff(ex.actor, 'TEC02') - 1) / 29);
  const pc = pComfortable ?? 0;
  this.note('media:esperanza_de_calidad_comoda', { actor: ex.actor, pComoda: round(pc, 4), nota: 'esperanza previa a la elección; la calidad real se sortea después' }); // distinta de la calidad realmente resuelta (intent.calidad)
  return pc * mp.openOnlyComfortableWeight + (1 - pc) * mp.openOnlyOtherWeight;
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
    const attempts = ex.stealAttempt !== false; // contener (sin intento de intervención) no aplica la receta de interferencia activa
    if (ex.exec === 'dribble') {
      off = this.taskValue('TAR06', 'attack', { handler: ex.actor });
      if (ex.icpt && attempts) def = ex.defMix ? this.mixedValue(ex, (id) => this.taskValue('TAR06', 'defense', { primary: id })) : this.taskValue('TAR06', 'defense', { primary: ex.icpt });
    } else {
      off = this.taskValue('TAR07', 'attack', { passer: ex.passer });
      if (ex.icpt && attempts) def = this.taskValue('TAR07', 'defense', { interceptor: ex.icpt });
    }
    z.turnover = def != null ? o.controlSensitivity * (def - off) : -o.controlSensitivity * (off - this.profile.neutralAbility);
    w.turnover = base.turnover * Math.exp(z.turnover);
    ex.ctl = { off: round(off, 3), def: def == null ? null : round(def, 3) };
  }
  const opposer = ex.defend ?? ex.icpt;
  const innerZone = ex.zone === 'rim' || ex.zone === 'inside';
  if (opposer) {
    const c = this.profile.contact;
    const dt = innerZone ? 'TEC13' : 'TEC12';
    const legal = this.recipe([['d', dt, c.defensiveLegality.defenseTechnique], ['d', 'MEN04', c.defensiveLegality.MEN04], ['d', 'MEN05', c.defensiveLegality.MEN05]], { d: opposer }, c.maximumEnergyPenalty, 'legalidad_defensiva');
    z.defFoul = o.defensiveFoulSensitivity * (this.profile.neutralAbility - legal);
    w.defensiveNonShootingFoul = base.defensiveNonShootingFoul * Math.exp(z.defFoul);
    if (ex.defend) w.shootingFoul = base.shootingFoul * Math.exp(z.defFoul);
    w.looseBall = base.looseBall * 1; z.loose = 0;
  }
  if (ex.offContact) {
    const c = this.profile.contact;
    const legal = this.recipe([['o', ex.offContact.tech, c.offensiveLegality.actionTechnique], ['o', 'FIS04', c.offensiveLegality.FIS04], ['o', 'FIS07', c.offensiveLegality.FIS07]], { o: ex.offContact.pid }, c.maximumEnergyPenalty, 'legalidad_ofensiva');
    z.offFoul = o.offensiveFoulSensitivity * (this.profile.neutralAbility - legal);
    w.offensiveFoul = base.offensiveFoul * Math.exp(z.offFoul);
  }
  if (ex.exec === 'dribble') w.ballViolation = base.ballViolation;
  w.fieldShot = base.fieldShot;
  // presión cercana: pondera una vez la exposición a pérdida y a contacto de esta interacción (no la conversión)
  if (ex.pressureClose) {
    const f = this.profile.defense.pressure.closePressureExposureWeightFactor;
    for (const k of ['turnover', 'defensiveNonShootingFoul', 'shootingFoul']) if (w[k] != null) w[k] *= f;
  }
  // MOTOR-07 (control): Forma y presión ajustan, UNA vez, la exposición a pérdida o infracción del ejecutante (poseedor o pasador); el momento M-OFE frente a
  // M-DEF del defensor reparte masa entre «el ataque conserva el balón» (grupo G) y el resto con vector de suma cero. T queda excluido (pase/bote individual ya elegido).
  let states = null;
  if (ex.exec !== 'none') {
    const own = [ex.exec === 'pass' ? ex.passer : ex.actor]; const counter = ex.defMix ? [ex.defMix.primary, ex.defMix.second] : [opposer];
    const fp = this.formPressure('control', own, counter, { executants: own });
    for (const k of ['turnover', 'ballViolation']) if (w[k] != null) w[k] *= Math.exp(-fp.delta);
    states = { own, counter };
  }
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  let probs = {}; for (const k of Object.keys(w)) probs[k] = w[k] / tot;
  if (states) {
    const task = this.profile.stateTasks.tasks.control;
    const mz = this.momentZ('control', states.own, states.counter);
    const base = probs;
    probs = perturbCategories(base, task.favorableOutcomes, mz.Z, mz.alpha);
    this.perturbNote('control', mz, { grupoFavorable: task.favorableOutcomes, probabilidadesBase: Object.fromEntries(Object.entries(base).map(([k, v]) => [k, round(v, 5)])), probabilidadesFinales: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, round(v, 5)])) });
  }
  this.note('categorías', { z: Object.fromEntries(Object.entries(z).map(([k, v]) => [k, round(v, 4)])), p: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, round(v, 5)])) });
  return states ? probs : w;
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
  return { ...(ex.roles ?? {}), pasadorInicial: ex.initialPass?.de ?? null, receptorInicial: ex.initialPass?.a ?? null, actor: ex.actor, pasador: ex.passer ?? null, defensor: ex.defend ?? null, interceptor: ex.icpt ?? null, ayudante: ex.helper ?? null, ventanaLibre: ex.window ? ex.actor : null };
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
  K += this.profile.sharedResolution.newShotConversionBonus; // MOTOR-06: 0 por definición (ninguna situación ESP ni saque suma una prima de acierto)
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
    const N = this.profile.neutralAbility;
    // MOTOR-07: el tapón es una disputa del defensor (Forma y presión del bloqueador; M-DEF frente a M-TIR del tirador), una sola vez.
    const bfp = this.formPressure('block', [defender], [ex.actor], { executants: [defender] });
    const pB0 = sigmoid(logit(sh.blockP0) + b.sA * (blk - N) - b.sD * (resist - N) + bfp.delta);
    const bz = this.momentZ('block', [defender], [ex.actor]);
    const pB = perturbBinary(pB0, bz.Z, bz.alpha);
    this.perturbNote('block', bz, { pBase: round(pB0, 5), pFinal: round(pB, 5) });
    if (this.bernoulli(pB, 'tapón')) return this.resolveBlocked(ex, base, defender);
  }
  // un intento de intervención que no produjo pérdida deja la posición comprometida (mismo espacio que el drop, valor ya aceptado)
  if (ex.stealAttempt === true && ex.exec !== 'none') { K += this.profile.opportunity.coverageContainment.handlerPullupQualityLogit; this.note('intento_de_robo_fallido', { contextoLogit: this.profile.opportunity.coverageContainment.handlerPullupQualityLogit }); }
  const D = defender ? (ex.defMix ? this.mixedValue(ex, (id) => this.shotDefense(ex.zone, id, ex.actor)) : this.shotDefense(ex.zone, defender, ex.actor)) : null;
  // MOTOR-07 (conversión): Forma del tirador (y la del defensor que disputa, una vez) y presión sobre el ejecutante entran en K; después el momento M-TIR
  // perturba la probabilidad ya contextual. M-DEF solo interviene si no explicó ya la oportunidad (ex.mdefUsed). T no entra en la conversión de un tiro definido.
  const counterIds = defender ? (ex.defMix ? [ex.defMix.primary, ex.defMix.second] : [defender]) : [];
  const fp = this.formPressure('shotConversion', [ex.actor], counterIds, { executants: [ex.actor] });
  const pBase = sigmoid(shotLogit(this.profile, sh, A, D, K + fp.delta));
  const mz = this.momentZ('shotConversion', [ex.actor], counterIds, { skipCounter: !!ex.mdefUsed });
  const p = perturbBinary(pBase, mz.Z, mz.alpha);
  this.perturbNote('shotConversion', mz, { pBase: round(pBase, 5), pFinal: round(p, 5), contraparteOmitidaPorOportunidad: !!ex.mdefUsed && counterIds.length > 0 });
  const made = this.bernoulli(p, `conversión:${ex.zone}`);
  const shotFact = { k: 'shot', p: ex.actor, team: ex.team, zone: ex.zone, points: sh.points, made, fromFoul: contact };
  stats.push(shotFact);
  const eff = { zona: ex.zone, pConversion: round(p, 5), pConversionBase: round(pBase, 5), entra: made, defensor: defender ?? null, ventanaLibre: !!ex.window };
  if (made) this.addPoints(ex.team, sh.points);
  if (contact) {
    const committer = defender;
    this.cover('falta en tiro');
    const n = freeThrowsForShootingFoul(sh.points, made);
    const ev = this.emit('attempt', { ...base, stats, effects: { ...eff, falta: { de: committer, sobre: ex.actor, tirosLibres: n, canastaValida: made } } });
    this.episodesAfterShot(ex, { made, pBase, contact: true }); // MOTOR-07: episodios a partir de esta frontera (nunca sobre la misma acción)
    this.foulAdmin(committer, ex.actor, { shooting: true, ftCount: n, shotTeam: ex.team, shotMade: made });
    this.poss.pendingFT = ex; // la ventana de la falta es una frontera; la serie de libres se resuelve en la unidad siguiente
    return { cont: 'foulWindow' };
  }
  this.emit('attempt', { ...base, stats, effects: eff });
  this.episodesAfterShot(ex, { made, pBase, contact: false });
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
    this.poss.pendingThrowIn = { kind: 'band', origin: 'saque de banda en ataque tras tapón fuera', frontcourt: true };
    return { cont: 'blockedOOB' };
  }
  const defenseGets = this.bernoulli(b.blockedLooseControlDefenseProbability, 'tapón:balón_vivo');
  this.emit('attempt', { ...base, stats, effects: { zona: ex.zone, tapon: true, destino: defenseGets ? 'balón vivo, control defensivo' : 'balón vivo, conserva el ataque' } });
  if (defenseGets) {
    const carrier = this.pickRecoverer(1 - ex.team, blocker);
    this.endPossession('live', { team: ex.team, origin: 'tapón', carrier, deficit: this.reboundCommitments(ex.team, ex, ex.zone).deficit });
    return { end: 'blockRecovery' };
  }
  this.poss.disorganized = true; this.poss.recovery = { kind: 'block', holder: this.pickRecoverer(ex.team, null) };
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
  if (ex.stealAttempt !== true) this.episodeError(ex, 'pérdida sin intento de intervención del defensor'); // MOTOR-07 (EPI02): error de atención/ejecución, no un duelo perdido
  let stealer = null;
  if (ex.icpt && ex.stealAttempt !== false && this.bernoulli(o.stealGivenTurnover, 'robo')) { stealer = ex.icpt; stats.push({ k: 'stl', p: stealer, team: 1 - ex.team }); }
  // Cadena del robo (trazable): acceso (hay interceptor) → decisión de intervenir (una vez, referencia 0,25 de nivel 3) → ejecución (la pérdida de esta
  // categoría ya incorpora la interferencia solo si hubo intento) → control (el interceptor recupera el balón vivo). El crédito del robo es el control: no hay otro sorteo.
  const cadena = { acceso: !!ex.icpt, intento: ex.stealAttempt ?? null, pIntento: ex.stealDecisionP == null ? null : round(ex.stealDecisionP, 4), control: !!stealer };
  if (stealer) {
    this.emit('attempt', { ...base, stats, effects: { perdida: true, robo: stealer, balonVivo: true, cadenaRobo: cadena } });
    this.cover('robo');
    this.endPossession('live', { team: ex.team, origin: 'robo', carrier: stealer });
    return { end: 'steal' };
  }
  const oob = this.bernoulli(o.turnoverOutOfBoundsIfNotSteal, 'pérdida:fuera');
  if (oob) {
    this.emit('attempt', { ...base, stats, effects: { perdida: true, fuera: true, robo: null, cadenaRobo: cadena } });
    this.cover('pérdida fuera');
    this.endPossession('deadTurnover', { team: ex.team });
    return { end: 'deadTurnover' };
  }
  const carrier = this.pickRecoverer(1 - ex.team, ex.icpt);
  this.emit('attempt', { ...base, stats, effects: { perdida: true, robo: null, balonVivo: true, recupera: carrier, cadenaRobo: cadena } });
  this.cover('pérdida viva sin robo');
  this.endPossession('live', { team: ex.team, origin: 'pérdida', carrier });
  return { end: 'liveTurnover' };
};

P.resolveBallViolation = function resolveBallViolation(ex, base) {
  this.episodeError(ex, 'infracción de balón'); // MOTOR-07 (EPI02)
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
  this.beforeStatusChange(pid); // MOTOR-07: se procesa el intervalo pendiente antes de que cambie su situación
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
  this.poss.pendingThrowIn = { kind: 'band', origin: 'saque de banda en ataque tras falta', frontcourt: true };
  return { cont: 'inboundAfterFoul' };
};

P.shootFreeThrows = function shootFreeThrows(shooter, n, f, ex) {
  const sh = this.profile.shots.freeThrow;
  for (let i = 1; i <= n; i++) {
    const A = this.recipeObj(sh.attack, shooter, this.profile.energy.freeThrowTaskMax, 'ataque_libre');
    // MOTOR-07: Forma y presión del lanzador y su momento M-TIR; sin defensor ni contraparte ficticios (el libre no usa la oposición de campo).
    const fp = this.formPressure('freeThrow', [shooter], [], { executants: [shooter] });
    const pBase = sigmoid(shotLogit(this.profile, sh, A, null, fp.delta));
    const mz = this.momentZ('freeThrow', [shooter], []);
    const p = perturbBinary(pBase, mz.Z, mz.alpha);
    this.perturbNote('freeThrow', mz, { pBase: round(pBase, 5), pFinal: round(p, 5) });
    const made = this.bernoulli(p, 'libre');
    if (made) this.addPoints(f.shotTeam, sh.points);
    const last = i === n;
    this.emit('free_throw', {
      team: f.shotTeam,
      intent: { origen: f.kind, serie: `${i}/${n}` },
      participants: { lanzador: shooter },
      stats: [{ k: 'ft', p: shooter, team: f.shotTeam, made }],
      effects: { pLibre: round(p, 5), entra: made, ultimo: last },
    });
    if (last && f.retain) {
      // Falta disruptiva (OBR 2026 v1.1, arts. 37.2/38.2, 17.2.7 y 29.2.6; resumen del encargo MOTOR-08): lanza quien recibió la falta, la posesión corresponde a SU EQUIPO (no a la persona) y se reanuda
      // con saque en la línea de pista delantera, enfrente de la mesa, con exactamente catorce segundos de lanzamiento (no «al menos»: el saque de penalización no conserva un reloj mayor).
      this.shotClock = toTenths(this.profile.rules.penaltyThrowInShotClockSeconds); this.poss.advanced = true; this.clockRunning = false;
      this.cover('posesión conservada tras disruptiva'); this.poss.pendingThrowIn = { kind: 'band', origin: 'saque de penalización tras falta disruptiva (línea de pista delantera, enfrente de la mesa; 14 s)', frontcourt: true, penalty: true }; return { cont: 'inboundAfterFoul' };
    }
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
    this.poss.disorganized = true; this.poss.recovery = { kind: 'loose', holder: ex.actor };
    return { cont: 'looseKept' };
  }
  this.emit('loose_ball', { t, team: ex.team, participants: { disputa: [ex.actor, opposer] }, stats: [{ k: 'tov', p: ex.actor, team: ex.team, cause: 'balón suelto perdido' }], effects: { pControlAtaque: round(p, 4), control: 'defensa', recupera: opposer } });
  this.endPossession('live', { team: ex.team, origin: 'balón suelto', carrier: opposer });
  return { end: 'looseLost' };
};

// ---------------------------------------------------------------- encargos de rebote y balance (MOTOR-04)
P.reboundStrength = function reboundStrength(pid) {
  const rb = this.profile.rebound;
  return this.recipeObj(rb.strength, pid, rb.maxEnergyPenalty) + this.profile.body.reboundStrengthSensitivity * (this.pl[pid].reach - this.profile.body.reboundReachReference);
};
const TIER = { rim: 0, mid: 1, far: 2 };
// Acceso funcional al aro: por la función que ocupa en la disposición de la posesión; sin layout (transición, recurso), por su posición nominal.
P.accessTier = function accessTier(pid) {
  const rep = this.rep(); const fn = this.poss?.layout?.map?.[pid];
  if (fn && this.poss.team === this.pl[pid].teamIdx) return TIER[rep.functions[fn].access];
  return TIER[rep.accessBySlot[this.slotOf(pid)]];
};
// Quién carga al rebote y quién queda de balance. El objetivo por nivel es un encargo, no una cuota de rebotes ni participantes
// garantizados. Nivel 3 = candidatos históricos (`offenseParticipantSlots`) + tirador cercano al aro por acceso; sin bonus abstracto.
P.reboundCommitments = function reboundCommitments(offT, ex, zone) {
  const rb = this.profile.rebound;
  const ft = zone === 'freeThrow';
  const level = this.styleOf(offT).afterShot;
  const targets = rb.offensiveReboundAssignmentTarget;
  const target = targets[level - 1]; const neutral = targets[2];
  const history = this.playersAtSlots(offT, ft ? rb.liveLastFreeThrowOffenseSlots : rb.offenseParticipantSlots);
  const near = !ft && rb.addShooterIfNearRim && (zone === 'rim' || zone === 'inside');
  const rank = (ids) => [...ids].sort((a, b) => this.reboundStrength(b) - this.reboundStrength(a) || (a < b ? -1 : 1));
  let crash = [...history];
  if (!ft) {
    if (target < crash.length) crash = rank(crash).slice(0, target); // niveles 1 y 2: un cargador
    else if (target > neutral) { // niveles 4 y 5: se suman jugadores con acceso (primero los más cercanos al aro), no a quien ya carga
      const others = this.onCourt(offT).filter((id) => !crash.includes(id) && this.ps[id].available);
      others.sort((a, b) => this.accessTier(a) - this.accessTier(b) || this.reboundStrength(b) - this.reboundStrength(a) || (a < b ? -1 : 1));
      crash.push(...others.slice(0, target - neutral));
    }
  }
  const shooterJoins = near && ex.actor && !crash.includes(ex.actor) && level !== 1; // nivel 1: permanece en balance
  if (shooterJoins) crash.push(ex.actor);
  const baseline = history.length + (near && ex.actor && !history.includes(ex.actor) ? 1 : 0); // neutral: histórico + tirador por acceso
  // siempre queda una referencia de seguridad: nunca cargan los cinco
  while (crash.length > 4) crash = rank(crash).slice(0, 4);
  const on = this.onCourt(offT).filter((id) => this.ps[id].available);
  const balance = on.filter((id) => !crash.includes(id));
  return { crash, balance, level, target, neutral, baseline, deficit: crash.length - baseline, shooterJoins };
};
P.commitTrace = function commitTrace(c) { return { nivel: c.level, objetivo: c.target, cargan: c.crash, balance: c.balance, referenciaNeutral: c.baseline, deficitDeBalance: c.deficit }; };

// Quién cierra el rebote por la defensa: los defensores más cercanos al aro según su responsabilidad actual (función de zona o atacante que
// cubren); quien está comprometido (ayuda, cambio, trampa, show, superado) queda fuera de posición. No restaura al mejor reboteador por
// conveniencia ni suma una penalización de «mismatch»: el acceso ya lo expresa. Se conserva el número de participantes de la fila existente.
P.defenseReboundParticipants = function defenseReboundParticipants(t, n) {
  const ref = this.defRef(t); const org = this.drep().organizations[ref.org]; const committed = this.poss?.committed ?? new Set();
  const TIER = { rim: 0, mid: 1, far: 2 }; const LINE = { back: 0, mid: 1, wing: 1, high: 1, front: 2, chase: 2 };
  const tier = (id) => {
    let base = 1;
    if (ref.kind === 'individual') { const a = this.responsibilityOf(id); base = a ? TIER[this.rep().functions[ref.fnMap[a]].access] : 1; }
    else { const f = ref.defFn[id]; base = f ? LINE[org.functions[f].line] : 1; }
    return base + (committed.has(id) ? 2 : 0);
  };
  const on = this.onCourt(t).filter((id) => this.ps[id].available);
  const ranked = [...on].sort((a, b) => tier(a) - tier(b) || this.reboundStrength(b) - this.reboundStrength(a) || (a < b ? -1 : 1));
  this.note('rebote:cierre_defensivo', { cierran: ranked.slice(0, n), comprometidos: [...committed].filter((id) => on.includes(id)) });
  return ranked.slice(0, n);
};

// ---------------------------------------------------------------- rebote
P.afterMiss = function afterMiss(ex, zone) {
  const rb = this.profile.rebound;
  const ft = zone === 'freeThrow';
  const offT = ex.team; const defT = 1 - offT;
  const offSlots = ft ? rb.liveLastFreeThrowOffenseSlots : rb.offenseParticipantSlots;
  const defSlots = ft ? rb.liveLastFreeThrowDefenseSlots : rb.defenseParticipantSlots;
  const commit = this.reboundCommitments(offT, ex, zone);
  const offP = commit.crash;
  const defP = ft ? this.playersAtSlots(defT, defSlots) : this.defenseReboundParticipants(defT, defSlots.length); // el cierre usa la referencia y los compromisos ACTUALES
  const strength = (pid) => this.reboundStrength(pid);
  const mean = (ids) => ids.reduce((s, id) => s + strength(id), 0) / ids.length;
  const RA = mean(offP); const RD = mean(defP);
  const K = rb.loadLogitByLevel[this.styleOf(offT).afterShot - 1];
  const p0 = ft ? rb.lastFreeThrowOffensiveP0 : rb.fieldOffensiveP0;
  // MOTOR-07: disputa simétrica (Forma de defensa/disputa de ambos grupos, M-DEF de ambos); sin presión ni T. La elección del captor no usa estados.
  const rfp = this.formPressure('rebound', offP, defP, { executants: [] });
  const pRO0 = sigmoid(logit(p0) + rb.sensitivity * (RA - RD) + K + rfp.delta);
  const rz = this.momentZ('rebound', offP, defP);
  const pRO = perturbBinary(pRO0, rz.Z, rz.alpha);
  this.perturbNote('rebound', rz, { pBase: round(pRO0, 5), pFinal: round(pRO, 5) });
  this.note('rebote', { participantesAtaque: offP, participantesDefensa: defP, RA: round(RA, 3), RD: round(RD, 3), kCarga: K, pRebOfensivo: round(pRO, 5), encargos: this.commitTrace(commit) });
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
  this.emit('rebound', { t, team: offT, intent: { origen: ft ? 'último libre fallado' : `tiro fallado ${zone}` }, participants: { captor, candidatos: cands }, stats: [{ k: 'reb', p: captor, team, off: offReb }], effects: { ofensivo: offReb, pRebOfensivo: round(pRO, 5), contactoAro: true, encargos: this.commitTrace(commit) } });
  if (!offReb) { this.endPossession('live', { team: offT, origin: 'rebote', carrier: captor, deficit: commit.deficit }); return { end: 'dreb' }; }
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
      this.nextPoss = { team: opp, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds), throwIn: { kind: 'endline', origin: 'canasta recibida' } };
      break;
    }
    case 'ftMade': this.deadBall('último libre'); this.nextPoss = { team: opp, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds), throwIn: { kind: 'endline', origin: 'último libre anotado' } }; break;
    case 'deadTurnover': this.deadBall('balón muerto'); this.nextPoss = { team: opp, entry: 'inbound', shotClock: toTenths(rules.shotClockSeconds), throwIn: { kind: 'band', origin: 'balón fuera o infracción' } }; break;
    case 'live': this.nextPoss = { team: opp, entry: 'live', origin: info.origin, carrier: info.carrier, deficit: info.deficit ?? 0, shotClock: toTenths(rules.shotClockSeconds) }; this.clockRunning = true; break;
    default: throw new Error(`fin de posesión desconocido ${kind}`);
  }
};
