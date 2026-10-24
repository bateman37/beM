// Selección de intención, resolución de acontecimientos y flujo de posesiones.
// Una resolución agrupa preparación, lectura, elección y ejecución; el tiempo se descuenta una vez por hecho.
import { flightSplit, lagConfiguredTenths, interferenceMasses, interferenceOutcome, resolveInterference } from './incidents.js';
import { clamp, sigmoid, logit, round } from './mathx.js';
import { shotLogit, vocationFactor, shotResolution, shotPrepCostLogit, blockResolution, reboundTeamResolution, looseControlP, qualityDistributionPure, qualityResolution, categoryResolution, mixResolution, pickProbabilities } from './formulas.js';
import { SLOTS } from './data.js';
import { MatchCore } from './core.js';
import { fit } from './plays.js';
import { perturbBinary, perturbCategories } from './formulas.js';
import {
  toTenths, fitsBeforeLimit, clockStopsAfterGoal, foulPeriodKey, inPenalty,
  shotClockAfterDefensiveStoppage, shotClockAfterRingContact, freeThrowsForShootingFoul,
} from './rules.js';
import { resolveFoul } from './regs.js';
import { classifyReboundCredit } from './rebound-credit.js';

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
  const e2 = this.eff(decider, 'MEN02'); const e3 = this.eff(decider, 'MEN03'); const pen = this.choicePenalty(decider);
  const m3 = Math.max(this.profile.abilityBounds[0], e3 - pen);
  const q = (sel.readingMix.MEN02 * e2 + sel.readingMix.MEN03 * m3 - 1) / 29;
  // MOTOR-14 (FIS/MEN02/MEN03): entradas de q registradas desde el mismo cálculo; sin sorteos ni cálculo adicional. MEN03 conserva su valoración efectiva tras la presión.
  if (this.opts.detail === 'full') this.note('receta:seleccion.lectura', { valor: round(sel.readingMix.MEN02 * e2 + sel.readingMix.MEN03 * m3, 4), q: round(clamp(q, 0, 1), 5), penalizacionPresion: round(pen, 4), importanciaYTension: round(this.pressureNow().P, 4), libertad: round(L, 4), terminos: [
    { rol: 'decisor', jugador: decider, cap: 'MEN02', base: this.pl[decider].abilities.MEN02, efectiva: round(e2, 3), peso: sel.readingMix.MEN02, energia: round(this.ps[decider].energy, 2), tope: this.penFor('MEN02', null) },
    { rol: 'decisor', jugador: decider, cap: 'MEN03', base: this.pl[decider].abilities.MEN03, efectiva: round(m3, 3), peso: sel.readingMix.MEN03, energia: round(this.ps[decider].energy, 2), tope: this.penFor('MEN03', null), efectivaSinPresion: round(e3, 3) }] });
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
  const out = mixResolution(items, { L, q, tilt, cf }, round); // MOTOR-17B: función pura compartida con el contraste de sensibilidad
  this.note(`mezcla:${label}`, { L: round(L, 4), q: round(q, 4), elaboracion: ef === 1 ? null : ef, urgencia: uf === 1 ? null : uf, opciones: out.map((o) => ({ clave: o.key, ...o.parts })),
    ...(this.opts.detail === 'full' ? { entradas: { L, q, tilt, cf, items: items.map((i) => ({ clave: i.key, coach: i.coach ?? null, pref: i.pref ?? null, adapt: i.adapt ?? null, risk: i.risk ?? null, mid: i.mid ?? null, cont: !!i.cont })) } } : {}) }); // MOTOR-17B: entradas crudas de cada mezcla de intención (MEN02/MEN03 en la selección; FIS01/FIS02 en la transición)
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
  for (const s of SLOTS) { const id = this.lineup[team][s]; if (id && this.ps[id].available) return { id, fallback: true, rank: null }; }
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
  return qualityDistributionPure(this.profile, caRaw, cdRaw, kctx, hasOpposition, noForced, extraZ); // MOTOR-17B: función pura compartida con el contraste
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
  const famZ = ex ? this.famQuality(ex, hasOpposition) : 0; // MOTOR-18: familiaridad táctica, un único ajuste logit por operación (separado de Forma/presión en el diagnóstico)
  const extraZ = (fp ? fp.delta : 0) + famZ; const noForced = !!ex?.noDenial;
  const d = qualityResolution(this.profile, { ca: caRaw, cd: cdRaw, kctx, hasOpposition, noForced, extraZ, Z: mz ? mz.Z : null, alpha: mz ? mz.alpha : null }); // MOTOR-17B: función pura compartida con el contraste
  let items = d.items;
  if (mz) {
    const task = this.profile.stateTasks.tasks.opportunityQuality; const pFinal = d.final;
    items = d.items.map((i) => ({ ...i, w: pFinal[i.key] }));
    this.perturbNote('opportunityQuality', mz, { grupoFavorable: task.favorableClasses, probabilidadesBase: Object.fromEntries(Object.entries(d.p).map(([k, v]) => [k, round(v, 5)])), probabilidadesFinales: Object.fromEntries(Object.entries(pFinal).map(([k, v]) => [k, round(v, 5)])) });
  }
  this.note('calidad', { z: round(d.z, 4), kContexto: round(d.kc, 4), CA: round(caRaw, 3), CD: hasOpposition ? round(cdRaw, 3) : null, pesos: items.map((i) => ({ clase: i.key, p: round(i.w / (mz ? 1 : d.tot)) })),
    ...(this.opts.detail === 'full' ? { entradas: { ca: caRaw, cd: hasOpposition ? cdRaw : null, kctx, hasOpposition: !!hasOpposition, noForced, extraZ, extraZFormaPresion: fp ? fp.delta : 0, extraZFamiliaridad: famZ, Z: mz ? mz.Z : null, alpha: mz ? mz.alpha : null } } : {}) }); // MOTOR-17B: entradas completas de la operación
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
  // MOTOR-17B (B17-02): las recetas se resuelven como siempre y la operación (pesos, presión cercana, Forma, momento) es la función pura `categoryResolution`, la misma que usa el contraste de sensibilidad.
  const o = this.profile.outcomes; const full = this.opts.detail === 'full';
  const refs = full ? {} : null; let off = null; let def = null; let legalDef = null; let legalOff = null; let pressureFactor = null;
  if (ex.exec !== 'none') {
    const attempts = ex.stealAttempt !== false; // contener (sin intento de intervención) no aplica la receta de interferencia activa
    if (ex.exec === 'dribble') {
      off = this.taskValue('TAR06', 'attack', { handler: ex.actor });
      if (full) refs.off = { label: 'receta:TAR06.attack', jugador: ex.actor, peso: 1 };
      if (ex.icpt && attempts) {
        def = ex.defMix ? this.mixedValue(ex, (id) => this.taskValue('TAR06', 'defense', { primary: id })) : this.taskValue('TAR06', 'defense', { primary: ex.icpt });
        if (full) { const m = this.dcfg().coverage.sameTaskTwoDefenderMixture; refs.def = ex.defMix ? [{ label: 'receta:TAR06.defense', jugador: ex.defMix.primary, peso: m.primary }, { label: 'receta:TAR06.defense', jugador: ex.defMix.second, peso: m.second }] : [{ label: 'receta:TAR06.defense', jugador: ex.icpt, peso: 1 }]; }
      }
    } else {
      off = this.taskValue('TAR07', 'attack', { passer: ex.passer });
      if (full) refs.off = { label: 'receta:TAR07.attack', jugador: ex.passer, peso: 1 };
      if (ex.icpt && attempts) { def = this.taskValue('TAR07', 'defense', { interceptor: ex.icpt }); if (full) refs.def = [{ label: 'receta:TAR07.defense', jugador: ex.icpt, peso: 1 }]; }
    }
    ex.ctl = { off: round(off, 3), def: def == null ? null : round(def, 3) };
  }
  const opposer = ex.defend ?? ex.icpt;
  const innerZone = ex.zone === 'rim' || ex.zone === 'inside';
  if (opposer) {
    const c = this.profile.contact;
    const dt = innerZone ? 'TEC13' : 'TEC12';
    legalDef = this.recipe([['d', dt, c.defensiveLegality.defenseTechnique], ['d', 'MEN04', c.defensiveLegality.MEN04], ['d', 'MEN05', c.defensiveLegality.MEN05]], { d: opposer }, c.maximumEnergyPenalty, 'legalidad_defensiva');
    if (full) refs.legalDef = { label: 'receta:legalidad_defensiva', jugador: opposer, peso: 1 };
  }
  if (ex.offContact) {
    const c = this.profile.contact;
    legalOff = this.recipe([['o', ex.offContact.tech, c.offensiveLegality.actionTechnique], ['o', 'FIS04', c.offensiveLegality.FIS04], ['o', 'FIS07', c.offensiveLegality.FIS07]], { o: ex.offContact.pid }, c.maximumEnergyPenalty, 'legalidad_ofensiva');
    if (full) refs.legalOff = { label: 'receta:legalidad_ofensiva', jugador: ex.offContact.pid, peso: 1 };
  }
  // presión cercana: pondera una vez la exposición a pérdida y a contacto de esta interacción (no la conversión)
  if (ex.pressureClose) pressureFactor = this.profile.defense.pressure.closePressureExposureWeightFactor;
  // MOTOR-07 (control): Forma y presión ajustan, UNA vez, la exposición a pérdida o infracción del ejecutante (poseedor o pasador); el momento M-OFE frente a
  // M-DEF del defensor reparte masa entre «el ataque conserva el balón» (grupo G) y el resto con vector de suma cero. T queda excluido (pase/bote individual ya elegido).
  let fpDelta = null; let mz = null;
  if (ex.exec !== 'none') {
    const own = [ex.exec === 'pass' ? ex.passer : ex.actor]; const counter = ex.defMix ? [ex.defMix.primary, ex.defMix.second] : [opposer];
    fpDelta = this.formPressure('control', own, counter, { executants: own }).delta;
    mz = this.momentZ('control', own, counter);
  }
  const spec = { exec: ex.exec, off, def, hasOpposer: !!opposer, legalDef, hasDefend: !!ex.defend, legalOff, pressureFactor, fpDelta, Z: mz ? mz.Z : null, alpha: mz ? mz.alpha : null };
  const r = categoryResolution(this.profile, spec);
  if (mz) {
    const task = this.profile.stateTasks.tasks.control; const probs = r.final;
    this.perturbNote('control', mz, { grupoFavorable: task.favorableOutcomes, probabilidadesBase: Object.fromEntries(Object.entries(r.probs).map(([k, v]) => [k, round(v, 5)])), probabilidadesFinales: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, round(v, 5)])) });
  }
  const out = mz ? r.final : r.probs;
  this.note('categorías', { z: Object.fromEntries(Object.entries(r.z).map(([k, v]) => [k, round(v, 4)])), p: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, round(v, 5)])) });
  if (full) this.note('salida:control', { entradas: spec, refs, salida: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, round(v, 8)])) }); // MOTOR-17B: entradas y salida de la operación real (TEC07/TEC08/TEC09/TEC11/TEC14/MEN04/MEN05)
  return mz ? r.final : r.w;
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
P.planDuration = function planDuration(spec, cat, purpose, { noFlight = false } = {}) {
  const lim = this.limit();
  const d = this.profile.durationSeconds;
  const isShot = cat === 'fieldShot' || cat === 'shootingFoul';
  let { dist, factor, tag, load } = spec;
  if (lim <= Math.round(dist[0] * factor * 10)) {
    if (isShot && lim > Math.round(d.urgentShot[0] * 10)) { dist = d.urgentShot; factor = 1; tag = 'tiro urgente'; this.cover('ESP16 final de posesión'); }
    else return { expired: true };
  }
  // MOTOR-15 §7.1 (SEM15-TIR-01): el tiro de campo tiene dos hitos discretos dentro de su operación ya existente, LIBERACIÓN (inicio + duración − margen) y RESOLUCIÓN (frontera final). Lo que debe caber antes de la
  // señal del reloj de juego es la LIBERACIÓN: la resolución puede quedar a la bocina (reloj a 0, sin tiempo negativo ni minutos posteriores). Con el reloj de posesión como límite no se extiende (violación de 24 s).
  // El margen no añade un sorteo de duración: la misma u se proyecta sobre el rango con límite de liberación.
  const gameBinds = this.clock < this.shotClock || !this.shotClockOn;
  const lagCfg = isShot && !noFlight && gameBinds ? lagConfiguredTenths(this.profile) : 0;
  const tenths = this.sampleDuration(dist, `${purpose}:${tag}`, { factor, limit: lim + lagCfg });
  const out = { tenths, load, tag };
  if (isShot && !noFlight) { const f = flightSplit(this.profile, tenths); out.flight = { operationTenths: tenths, lagTenths: f.lagTenths, releaseAfterTenths: f.releaseAfterTenths, crossesSignal: gameBinds && tenths >= this.clock }; }
  return out;
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

// MOTOR-15 §9.1: productor del candidato causal de asistencia. Registra lo que el núcleo REALMENTE resuelve (último pase, receptor previsto y efectivo, zona de recepción, continuidad y creación propia posterior)
// y el motivo de cierre; no simula botes ni movimientos para contarlos y no hace otro sorteo. El núcleo no genera desvíos hacia otro destinatario: previsto = efectivo (la invalidación actúa ante el hecho tipado).
P.assistCandidate = function assistCandidate(ex) {
  if (!(ex.exec === 'pass' && ex.passer && ex.passer !== ex.actor)) return null;
  const intended = ex.intendedReceiver ?? ex.actor;
  let close;
  if (intended !== ex.actor) close = { eligible: false, reason: 'desvío claro hacia otro destinatario' };
  else if (ex.kind === 'transition') close = { eligible: false, reason: 'recepción en campo propio con recorrido autónomo' };
  else if (ex.moved) close = { eligible: false, reason: 'creación propia posterior con movimiento ante defensor colocado' };
  else if (ex.zone === 'rim' || ex.zone === 'inside') close = { eligible: true, reason: 'pintura: recepción y anotación sin abandonarla' };
  else if (ex.window) close = { eligible: true, reason: 'continuidad de la ventaja recibida (ventana libre)' };
  else close = { eligible: true, reason: 'tiro sin bote tras la recepción' };
  return { passer: ex.passer, moved: !!ex.moved, window: !!ex.window, origin: ex.origin ?? null, intendedReceiver: intended, actualReceiver: ex.actor, receptionZone: ex.zone, continuity: ex.window ? 'ventaja continuada' : (ex.moved ? 'nueva creación' : 'sin bote'), ownCreation: !!ex.moved, close };
};

// MOTOR-15 §7.1: hitos discretos del tiro de campo dentro de su operación ya existente. `relojLiberacion` y `relojResolucion` son el reloj de juego (décimas restantes) en cada hito.
P.flightRecord = function flightRecord(ex, base) {
  const f = ex.flight; const t = base.t;
  return { margenDecimas: f.lagTenths, operacionDecimas: f.operationTenths, relojLiberacion: t.clockBefore - f.releaseAfterTenths, relojResolucion: t.clockAfter, consumidasDecimas: t.dur, resolucionTrasSenal: f.crossesSignal, version: this.profile.shotFlight.version };
};

P.resolveShot = function resolveShot(ex, base, contact) {
  const sh = this.profile.shots[ex.zone];
  const stats = [];
  const A = this.shotAbility(ex);
  const defender = ex.defend;
  let K = ex.quality ? ex.quality.K : 0;
  K += this.profile.sharedResolution.newShotConversionBonus; // MOTOR-06: 0 por definición (ninguna situación ESP ni saque suma una prima de acierto)
  let prepNote = null;
  if (ex.moved && (ex.zone === 'three' || ex.zone === 'midrange')) {
    const sp = this.profile.shotPreparation;
    const prep = this.taskValue('TAR11', 'attack', { shooter: ex.actor });
    const cost = shotPrepCostLogit(this.profile, prep); // MOTOR-17B: función pura compartida con el contraste (TEC06)
    K -= cost; prepNote = { valor: prep, costeLogit: cost }; this.note('preparación_movimiento', { TEC06mezcla: round(prep, 3), costeLogit: round(cost, 4) });
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
    const bz = this.momentZ('block', [defender], [ex.actor]);
    const br = blockResolution(this.profile, sh, { blk, resist, delta: bfp.delta, Z: bz.Z, alpha: bz.alpha }); // MOTOR-17B: función pura compartida con el contraste (TEC15, FIS05)
    const pB0 = br.pBase; const pB = br.p;
    this.perturbNote('block', bz, { pBase: round(pB0, 5), pFinal: round(pB, 5) });
    if (this.opts.detail === 'full') this.note('salida:tapon', { zona: ex.zone, entradas: { blk, resist, delta: bfp.delta, Z: bz.Z, alpha: bz.alpha }, refs: { blk: { label: 'receta:tapón:bloqueador', jugador: defender, peso: 1 } }, salida: { pBase: round(pB0, 8), p: round(pB, 8) } });
    if (this.bernoulli(pB, 'tapón')) return this.resolveBlocked(ex, base, defender);
  }
  // un intento de intervención que no produjo pérdida deja la posición comprometida (mismo espacio que el drop, valor ya aceptado)
  if (ex.stealAttempt === true && ex.exec !== 'none') { K += this.profile.opportunity.coverageContainment.handlerPullupQualityLogit; this.note('intento_de_robo_fallido', { contextoLogit: this.profile.opportunity.coverageContainment.handlerPullupQualityLogit }); }
  const D = defender ? (ex.defMix ? this.mixedValue(ex, (id) => this.shotDefense(ex.zone, id, ex.actor)) : this.shotDefense(ex.zone, defender, ex.actor)) : null;
  // MOTOR-07 (conversión): Forma del tirador (y la del defensor que disputa, una vez) y presión sobre el ejecutante entran en K; después el momento M-TIR
  // perturba la probabilidad ya contextual. M-DEF solo interviene si no explicó ya la oportunidad (ex.mdefUsed). T no entra en la conversión de un tiro definido.
  const counterIds = defender ? (ex.defMix ? [ex.defMix.primary, ex.defMix.second] : [defender]) : [];
  const fp = this.formPressure('shotConversion', [ex.actor], counterIds, { executants: [ex.actor] });
  const mz = this.momentZ('shotConversion', [ex.actor], counterIds, { skipCounter: !!ex.mdefUsed });
  const sr = shotResolution(this.profile, sh, { A, D, K: K + fp.delta, Z: mz.Z, alpha: mz.alpha }); // MOTOR-17B: función pura compartida con el contraste (TEC01–TEC04, TEC06, TEC12, TEC13, FIS04, FIS05, FIS07)
  const pBase = sr.pBase; const p = sr.p;
  this.perturbNote('shotConversion', mz, { pBase: round(pBase, 5), pFinal: round(p, 5), contraparteOmitidaPorOportunidad: !!ex.mdefUsed && counterIds.length > 0 });
  if (this.opts.detail === 'full') {
    const m = defender && ex.defMix ? this.dcfg().coverage.sameTaskTwoDefenderMixture : null;
    this.note('salida:tiro', { zona: ex.zone, entradas: { A, D, K: K + fp.delta, Z: mz.Z, alpha: mz.alpha, ...(prepNote ? { prep: prepNote.valor, costePrepLogit: prepNote.costeLogit } : {}) },
      refs: { A: { label: `receta:ataque_tiro:${ex.zone}`, jugador: ex.actor, peso: 1 }, ...(defender ? { D: m ? [{ label: `receta:defensa_tiro:${ex.zone}`, jugador: ex.defMix.primary, peso: m.primary }, { label: `receta:defensa_tiro:${ex.zone}`, jugador: ex.defMix.second, peso: m.second }] : [{ label: `receta:defensa_tiro:${ex.zone}`, jugador: defender, peso: 1 }] } : {}), ...(prepNote ? { prep: { label: 'receta:TAR11.attack', jugador: ex.actor, peso: 1 } } : {}) },
      salida: { pBase: round(pBase, 8), p: round(p, 8) } });
  }
  const made = this.bernoulli(p, `conversión:${ex.zone}`);
  // MOTOR-09: el pase final que alimenta el tiro (candidato único de asistencia) viaja con el hecho; `moved` indica creación propia con movimiento.
  const feed = this.assistCandidate(ex);
  const shotFact = { k: 'shot', p: ex.actor, team: ex.team, zone: ex.zone, points: sh.points, made, fromFoul: contact, feed };
  stats.push(shotFact);
  const eff = { zona: ex.zone, pConversion: round(p, 5), pConversionBase: round(pBase, 5), entra: made, defensor: defender ?? null, ventanaLibre: !!ex.window, ...(ex.flight ? { vuelo: this.flightRecord(ex, base) } : {}) };
  // MOTOR-15 §7.2: oportunidad de interferencia CONDICIONADA (solo un lanzamiento válido de aro/pintura sin contacto ni tapón, con participantes ya representados). Una única u por oportunidad elegible.
  const itf = contact ? this.interferenceExclude('fieldGoal', 'falta en el tiro') : this.fieldGoalInterference(ex, made);
  let scored = made;
  if (itf) {
    eff.interferencia = this.applyInterference(itf, { shotFact, stats, team: ex.team, made });
    scored = shotFact.made;
    eff.entra = scored; if (scored !== made) eff.entraSegunTiro = made;
  }
  if (scored) this.addPoints(ex.team, sh.points);
  if (contact) {
    const committer = defender;
    this.cover('falta en tiro');
    const n = freeThrowsForShootingFoul(sh.points, made);
    const ev = this.emit('attempt', { ...base, stats, effects: { ...eff, falta: { de: committer, sobre: ex.actor, tirosLibres: n, canastaValida: made } } });
    this.episodesAfterShot(ex, { made, pBase, contact: true }); // MOTOR-07: episodios a partir de esta frontera (nunca sobre la misma acción)
    this.foulAdmin(committer, ex.actor, { shooting: true, ftCount: n, shotTeam: ex.team, shotMade: made, shotEvent: ev.id, feed, shotPoints: sh.points });
    this.poss.pendingFT = ex; // la ventana de la falta es una frontera; la serie de libres se resuelve en la unidad siguiente
    return { cont: 'foulWindow' };
  }
  this.emit('attempt', { ...base, stats, effects: eff });
  this.episodesAfterShot(ex, { made: scored, pBase, contact: false });
  if (itf?.side === 'offensive') { // sin puntos y posesión del rival; sin rebote ni segunda oportunidad en el mismo desenlace
    this.cover('interferencia ofensiva');
    this.endPossession('deadTurnover', { team: ex.team });
    return { end: 'deadTurnover' };
  }
  if (scored) {
    this.cover(itf ? 'interferencia defensiva: canasta concedida' : `canasta ${ex.zone}`);
    this.endPossession('madeFG', { team: ex.team });
    return { end: 'madeFG' };
  }
  return this.afterMiss(ex, ex.zone);
};

// ---------------------------------------------------------------- interferencia (MOTOR-15 §7.2–§7.3)
// Libro de denominadores por tipo de oportunidad: consideradas, exclusiones, elegibilidad por lado y resultados. Nada se infiere de «todos los tiros».
P.interferenceBook = function interferenceBook(situation) {
  this.interfStats ??= {};
  return (this.interfStats[situation] ??= { considered: 0, excluded: {}, eligible: { defensive: 0, offensive: 0, both: 0, none: 0 }, withoutMass: 0, drawn: 0, results: { defensive: 0, offensive: 0, none: 0 } });
};
P.interferenceExclude = function interferenceExclude(situation, why) { const b = this.interferenceBook(situation); b.considered += 1; b.excluded[why] = (b.excluded[why] ?? 0) + 1; return null; };
const rankByRebound = (m, ids) => [...ids].sort((a, b) => m.reboundStrength(b) - m.reboundStrength(a) || (a < b ? -1 : 1));

// Oportunidad en un tiro de campo. Defensiva: un defensor participante en la disputa/intervención (`ex.defend`, presente y disponible). Ofensiva: otro atacante ya comprometido en la disputa próxima
// (los que cargan al rebote según el encargo vigente), nunca un receptor inventado. La infractora se elige por una regla determinista (fuerza de cierre, desempate por identificador): sin otra tirada.
P.fieldGoalInterference = function fieldGoalInterference(ex, made) {
  const cfg = this.profile.interference.fieldGoal; const b = this.interferenceBook('fieldGoal'); b.considered += 1;
  if (!cfg.zones.includes(ex.zone)) { b.excluded['zona sin intervención próxima al aro'] = (b.excluded['zona sin intervención próxima al aro'] ?? 0) + 1; return null; }
  const defender = ex.defend && this.ps[ex.defend]?.onCourt && this.ps[ex.defend].available ? ex.defend : null;
  const crash = rankByRebound(this, this.reboundCommitments(ex.team, ex, ex.zone).crash.filter((id) => id !== ex.actor && this.ps[id].available));
  return this.drawInterference('fieldGoal', { defensive: !!defender, offensive: crash.length > 0 }, { defensive: defender, offensive: crash[0] ?? null }, b, made);
};
// Oportunidad en el ÚLTIMO libre de una serie con balón vivo posterior (excluye las que reanudan con balón muerto: técnica, disruptiva). Participantes: los de la disputa de ese libre.
P.lastFreeThrowInterference = function lastFreeThrowInterference(shooter, f, made) {
  const rb = this.profile.rebound; const b = this.interferenceBook('lastFreeThrow'); b.considered += 1;
  if (f.retain || f.stepOnly || (f.plan && f.plan.resume.kind !== 'afterSeries')) { b.excluded['balón muerto o sanción incompatible'] = (b.excluded['balón muerto o sanción incompatible'] ?? 0) + 1; return null; }
  const offT = f.shotTeam; const defT = 1 - offT;
  const off = rankByRebound(this, this.playersAtSlots(offT, rb.liveLastFreeThrowOffenseSlots).filter((id) => id !== shooter));
  const def = rankByRebound(this, this.playersAtSlots(defT, rb.liveLastFreeThrowDefenseSlots));
  return this.drawInterference('lastFreeThrow', { defensive: def.length > 0, offensive: off.length > 0 }, { defensive: def[0] ?? null, offensive: off[0] ?? null }, b, made);
};
P.drawInterference = function drawInterference(situation, eligible, who, book, made) {
  if (eligible.defensive && eligible.offensive) book.eligible.both += 1; else if (eligible.defensive) book.eligible.defensive += 1; else if (eligible.offensive) book.eligible.offensive += 1; else { book.eligible.none += 1; return null; }
  const masses = interferenceMasses(this.profile, situation, eligible);
  if (!(masses.sum > 0)) { book.withoutMass += 1; return null; } // sin masa no se sortea: una oportunidad desactivada no consume azar
  const u = this.draw(`interferencia:${situation}`); book.drawn += 1;
  const side = interferenceOutcome(masses, u);
  book.results[side ?? 'none'] += 1;
  this.note(`interferencia:${situation}`, { masas: masses, u: round(u, 8), resultado: side ?? 'ninguna' });
  if (!side) return null;
  const res = resolveInterference(this.profile, situation, side);
  if (!res.ok) throw new Error(`interferencia sin consecuencia válida: ${res.diagnostic}`);
  return { situation, side, res, infractor: who[side], masses, u, madeBefore: made };
};
// Consecuencia sobre el hecho de tiro ya sorteado: validez, crédito extraordinario y reanudación salen de la fila (RG-I01…I04); aquí no hay otro sorteo de mérito.
P.applyInterference = function applyInterference(itf, { shotFact, stats, team, made }) {
  const r = itf.res;
  const rec = { situacion: itf.situation, lado: itf.side, infractor: itf.infractor, regla: r.row, contraste: r.contrast, validez: r.validity, masas: { defensiva: itf.masses.defensive, ofensiva: itf.masses.offensive, residual: itf.masses.residual }, u: itf.u, sancionAdicional: r.additionalSanction ?? null, resumen: r.explanation };
  if (itf.side === 'defensive') { shotFact.made = true; shotFact.conceded = 'interferencia defensiva'; rec.efecto = made ? 'el tiro ya entraba: sin cambio de marcador' : 'canasta concedida con el valor del tiro'; }
  else {
    if (made) { shotFact.made = false; shotFact.annulled = true; shotFact.cancelledBy = 'interferencia ofensiva'; rec.efecto = 'el tiro entraba: se anula (no es intento válido)'; } else rec.efecto = 'el tiro fallaba: fallo normal; posesión del rival sin rebote';
    if (itf.infractor) stats.push({ k: 'tov', p: itf.infractor, team, cause: 'interferencia ofensiva' });
  }
  return rec;
};

P.reboundStats = function reboundStats(ex, miss, control, of) { // rebote de un fallo con contacto de aro y balón vivo: crédito individual del captor ya sorteado (política común)
  const c = classifyReboundCredit({ shooterTeam: ex.team, miss, ball: 'live', control });
  return c.kind === 'none' ? [] : [{ k: 'reb', p: c.player, team: c.team, off: c.off, of }];
};
P.nextEventId = function nextEventId() { return `E${String(this.eventSeq + 1).padStart(4, '0')}`; };
// SIM-MOTOR-04E (E02): crédito de rebote tras tapón según la política común (`rebound-credit.js`). Solo estadístico: usa el recuperador que el camino YA ha resuelto y no sortea ni cambia la continuación.
P.blockedReboundStat = function blockedReboundStat(ex, ball, control) {
  const c = classifyReboundCredit({ shooterTeam: ex.team, miss: 'blocked', ball, control });
  return c.kind === 'none' ? [] : [{ k: 'reb', p: c.player, team: c.team, off: c.off, of: this.nextEventId(), cause: c.cause }];
};

P.resolveBlocked = function resolveBlocked(ex, base, blocker) {
  const b = this.profile.block;
  const stats = [{ k: 'shot', p: ex.actor, team: ex.team, zone: ex.zone, points: this.profile.shots[ex.zone].points, made: false, blockedBy: blocker }, { k: 'blk', p: blocker, team: 1 - ex.team }];
  this.cover('tapón');
  if (this.bernoulli(b.outOfBoundsGivenBlock, 'tapón:fuera')) {
    stats.push(...this.blockedReboundStat(ex, 'outOfBounds', { team: ex.team, player: null })); // derecho de saque del ataque antes de control individual: rebote colectivo ofensivo
    this.emit('attempt', { ...base, stats, effects: { zona: ex.zone, tapon: true, destino: 'fuera, saque del ataque (sin contacto de aro: el reloj de posesión continúa)' } });
    this.cover('tapón fuera sin aro');
    this.deadBall('tapón fuera');
    this.poss.advanced = true; this.clockRunning = false;
    this.poss.pendingThrowIn = { kind: 'band', origin: 'saque de banda en ataque tras tapón fuera', frontcourt: true };
    return { cont: 'blockedOOB' };
  }
  const defenseGets = this.bernoulli(b.blockedLooseControlDefenseProbability, 'tapón:balón_vivo');
  const carrier = defenseGets ? this.pickRecoverer(1 - ex.team, blocker) : this.pickRecoverer(ex.team, null); // el mismo sorteo y orden que antes: el recuperador se resuelve antes de describir el hecho
  stats.push(...this.blockedReboundStat(ex, 'live', { team: defenseGets ? 1 - ex.team : ex.team, player: carrier }));
  this.emit('attempt', { ...base, stats, effects: { zona: ex.zone, tapon: true, destino: defenseGets ? 'balón vivo, control defensivo' : 'balón vivo, conserva el ataque' } });
  if (defenseGets) {
    this.endPossession('live', { team: ex.team, origin: 'tapón', carrier, deficit: this.reboundCommitments(ex.team, ex, ex.zone).deficit });
    return { end: 'blockRecovery' };
  }
  this.poss.disorganized = true; this.poss.recovery = { kind: 'block', holder: carrier };
  return { cont: 'blockedLive' };
};

// Quién recupera un balón vivo sin robo: el candidato indicado o, si falta, el de mejor receta TAR17.
P.pickRecoverer = function pickRecoverer(team, prefer) {
  if (prefer && this.ps[prefer].onCourt) return prefer;
  const items = this.onCourt(team).map((id) => ({ key: id, w: this.taskValue('TAR17', 'attack', { contender: id }) }));
  return this.pick(items, 'recuperador').key;
};

// ---------------------------------------------------------------- pérdida, faltas, infracción, balón suelto
// MOTOR-17B §7 (B17-04; FIBA Statisticians' Manual 2024 v1.0, cap. 7, p. 24 del PDF; síntesis verificada por ChatGPT, sin lectura directa de Claude): criterio y procedencia ÚNICOS del crédito de robo
// para toda pérdida con balón VIVO que la defensa recupera con control (pase/bote, avance presionado, saque forzado, balón suelto y control directo del interceptor). Solo es estadístico: no sortea, no cambia la
// transición, el origen de la posesión ni el estado del partido, y los consumidores no cambian la selección de participantes para satisfacerlo.
//  · intento de intervención resuelto (`attempt === true`) con interceptor: inicia el desvío el interceptor, aunque otro compañero recoja después (`contacto: intento de intervención`);
//  · error ofensivo con recogida viva, SIN desviador anterior (también sin interceptor ni intento): el recuperador que ya produce el desenlace (`contacto: recogida controlada`);
//  · sin recuperador individual identificado, balón fuera, violación o falta ofensiva: sin crédito (no se fabrica un autor; los llamadores no invocan la función en balón muerto);
//  · un único crédito por pérdida causal (la función devuelve un solo autor). Un intento voluntario por sí solo no prueba un toque causal: no se añade ningún sorteo de contacto.
P.liveStealCredit = function liveStealCredit({ team, icpt, attempt, recoverer, fuente }) {
  const deflects = attempt === true && icpt != null;
  const p = deflects ? icpt : recoverer;
  if (p == null) return null;
  return { k: 'stl', p, team, fuente, contacto: deflects ? 'intento de intervención' : 'recogida controlada' };
};

P.resolveTurnover = function resolveTurnover(ex, base) {
  const o = this.profile.outcomes;
  const stats = [{ k: 'tov', p: ex.exec === 'pass' ? ex.passer : ex.actor, team: ex.team, cause: ex.exec === 'pass' ? 'pase' : 'balón' }];
  if (ex.stealAttempt !== true) this.episodeError(ex, 'pérdida sin intento de intervención del defensor'); // MOTOR-07 (EPI02): error de atención/ejecución, no un duelo perdido
  let stealer = null;
  if (ex.icpt && ex.stealAttempt !== false && this.bernoulli(o.stealGivenTurnover, 'robo')) { stealer = ex.icpt; const cr = this.liveStealCredit({ team: 1 - ex.team, icpt: stealer, attempt: true, recoverer: stealer, fuente: 'robo directo: control del interceptor' }); if (cr) stats.push(cr); }
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
  const credit = this.liveStealCredit({ team: 1 - ex.team, icpt: ex.icpt, attempt: ex.stealAttempt, recoverer: carrier, fuente: 'pérdida viva recuperada con control' });
  if (credit) stats.push(credit);
  this.emit('attempt', { ...base, stats, effects: { perdida: true, robo: credit?.p ?? null, balonVivo: true, recupera: carrier, cadenaRobo: cadena } });
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
  const stats = [{ k: 'foul', p: committer, team: ex.team, kind: 'ofensiva', teamFoul: true, sobre: ex.defend ?? ex.icpt ?? null }, { k: 'tov', p: committer, team: ex.team, cause: 'falta ofensiva' }];
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
P.foulAdmin = function foulAdmin(committer, fouled, { shooting, ftCount = 0, shotTeam, shotMade = false, shotEvent = null, feed = null, shotPoints = null }) {
  const rules = this.profile.rules;
  const defTeam = 1 - shotTeam;
  const key = foulPeriodKey(this.period, rules);
  const before = this.teamFouls[defTeam][key] ?? 0;
  const penalty = inPenalty(before, rules);
  this.ps[committer].fouls += 1;
  this.teamFouls[defTeam][key] = before + 1;
  const out = this.ps[committer].fouls >= rules.foulOut;
  if (out) this.exclude(committer);
  // MOTOR-09: las consecuencias salen de la matriz REG02 (una sola fuente); `ftCount` del llamador debe coincidir con la fila aplicada.
  const cons = resolveFoul(this.profile, { category: 'personal', shotAction: !!shooting, shotPoints: shooting ? shotPoints : null, shotMade: !!shotMade, penalty });
  if (!cons.ok) throw new Error(`falta sin consecuencia válida: ${cons.diagnostic}`);
  let n = cons.ft; let kind;
  if (shooting) { kind = 'falta en acto de tiro'; if (n !== ftCount) throw new Error(`libres de la falta en tiro incoherentes con la matriz (${n} ≠ ${ftCount})`); }
  else if (penalty) kind = 'penalización colectiva';
  else kind = 'saque de banda';
  const ev = this.emit('foul', {
    team: shotTeam,
    intent: { origen: 'falta defensiva', tipo: kind },
    participants: { infractor: committer, sobre: fouled },
    stats: [{ k: 'foul', p: committer, team: defTeam, kind: shooting ? 'tiro' : 'personal', teamFoul: true, sobre: fouled }],
    effects: { faltasPersonales: this.ps[committer].fouls, faltasColectivasPeriodo: this.teamFouls[defTeam][key], penalizacion: penalty, tirosLibres: n, excluido: out, causaTirosLibres: kind, regla: cons.row },
  });
  this.pendingFoul = { fouled, n, shotTeam, shooting, shotMade, kind, shotEvent, feed, sanction: { id: `FAL${String(this.eventSeq).padStart(4, '0')}`, order: ++this.sanctionOrder, team: defTeam, category: 'personal', shotAction: !!shooting, shotPoints: shooting ? shotPoints : null, shotMade: !!shotMade, penalty, committer, fouled, startedLive: false } };
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
  this.seriesSeq = (this.seriesSeq ?? 0) + 1; const seriesId = `S${String(this.seriesSeq).padStart(3, '0')}`; // MOTOR-09: la serie es la unidad causal de los libres
  for (let i = 1; i <= n; i++) {
    const A = this.recipeObj(sh.attack, shooter, this.profile.energy.freeThrowTaskMax, 'ataque_libre');
    // MOTOR-07: Forma y presión del lanzador y su momento M-TIR; sin defensor ni contraparte ficticios (el libre no usa la oposición de campo).
    const fp = this.formPressure('freeThrow', [shooter], [], { executants: [shooter] });
    const mz = this.momentZ('freeThrow', [shooter], []);
    const sr = shotResolution(this.profile, sh, { A, D: null, K: fp.delta, Z: mz.Z, alpha: mz.alpha }); // MOTOR-17B: la misma función pura que el tiro de campo (TEC05, MEN05)
    const pBase = sr.pBase; const p = sr.p;
    this.perturbNote('freeThrow', mz, { pBase: round(pBase, 5), pFinal: round(p, 5) });
    if (this.opts.detail === 'full') this.note('salida:tiro', { zona: 'freeThrow', entradas: { A, D: null, K: fp.delta, Z: mz.Z, alpha: mz.alpha }, refs: { A: { label: 'receta:ataque_libre', jugador: shooter, peso: 1 } }, salida: { pBase: round(pBase, 8), p: round(p, 8) } });
    const madeShot = this.bernoulli(p, 'libre');
    const last = i === n;
    // MOTOR-15 §7.2: interferencia en el último libre con disputa posible (participantes y condiciones de esa serie); un libre intermedio o con balón muerto posterior no es elegible
    const itf = last ? this.lastFreeThrowInterference(shooter, f, madeShot) : null;
    const ftStat = { k: 'ft', p: shooter, team: f.shotTeam, made: madeShot, series: seriesId, i, n, cause: f.kind, shooting: !!f.shooting, shotEvent: f.shotEvent ?? null, shotMade: !!f.shotMade, feed: f.feed ?? null };
    const ftStats = [ftStat]; let interferencia;
    if (itf) {
      interferencia = { situacion: itf.situation, lado: itf.side, infractor: itf.infractor, regla: itf.res.row, contraste: itf.res.contrast, validez: itf.res.validity, masas: { defensiva: itf.masses.defensive, ofensiva: itf.masses.offensive, residual: itf.masses.residual }, u: itf.u, sancionAdicional: itf.res.additionalSanction ?? null, resumen: itf.res.explanation };
      if (itf.side === 'defensive') { ftStat.made = true; ftStat.conceded = 'interferencia defensiva'; interferencia.efecto = madeShot ? 'el libre ya entraba: sin cambio' : 'punto concedido'; }
      else { ftStat.made = false; if (itf.infractor) ftStats.push({ k: 'tov', p: itf.infractor, team: f.shotTeam, cause: 'interferencia ofensiva' }); interferencia.efecto = madeShot ? 'el libre entraba: no cuenta como convertido (intento válido fallado)' : 'el libre fallaba: posesión del rival sin rebote'; }
    }
    const made = ftStat.made;
    if (made) this.addPoints(f.shotTeam, sh.points);
    const ftEv = this.emit('free_throw', {
      team: f.shotTeam,
      intent: { origen: f.kind, serie: `${i}/${n}` },
      participants: { lanzador: shooter },
      stats: ftStats,
      effects: { pLibre: round(p, 5), entra: made, ultimo: last, ...(interferencia ? { interferencia } : {}) },
    });
    // MOTOR-15B §4.2 (RG-I03): la interferencia defensiva en el último libre concede el punto (ya acreditado arriba, una sola vez) y administra una técnica de categoría 2 con un libre adicional
    // por la cola común. La decisión de interferencia ya se sorteó: aquí no hay otro sorteo de procedencia.
    if (itf?.side === 'defensive' && itf.res.additionalSanction?.status === 'administrada') { this.cover('interferencia defensiva en el último libre'); return this.interferenceTechnical(itf, f, ftEv, seriesId); }
    if (itf?.side === 'offensive') { this.cover('interferencia ofensiva en el último libre'); this.endPossession('deadTurnover', { team: f.shotTeam }); return { end: 'deadTurnover' }; }
    if (last && f.stepOnly) return { cont: 'incident' }; // MOTOR-15: serie intermedia de la cola de sanciones; la reanudación única la aplica la última
    if (last && f.plan) {
      if (f.plan.resume.kind !== 'afterSeries') return this.applyResume(f.plan.resume, f.plan, f, ex);
      this.adminPlan = null; // balón vivo tras el último libre: continúa por la cola normal (canasta → saque del rival; fallo → rebote)
    }
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
  const p = looseControlP(this.profile, ra, rd); // MOTOR-17B: función pura compartida con el contraste (FIS02, FIS03, TEC07 y demás términos de TAR17)
  if (this.opts.detail === 'full') this.note('salida:suelto', { entradas: { ra, rd }, refs: { ra: { label: 'receta:suelto:ataque', jugador: ex.actor, peso: 1 }, rd: { label: 'receta:suelto:defensa', jugador: opposer, peso: 1 } }, salida: { p: round(p, 8) } });
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
  // MOTOR-15B §7.2 (B15-N2, cap. 7): el defensor que gana la disputa REAL de un balón suelto tras el error atacante lo recupera con balón vivo: robo, sin exigir un intento previo de arrebato (el crédito es solo
  // estadístico: no hay otro sorteo, ni cambia la transición ni el origen de la posesión siguiente). La pérdida individual rival sigue en el mismo hecho (conciliación ROB01).
  const credit = this.liveStealCredit({ team: 1 - ex.team, icpt: opposer, attempt: null, recoverer: opposer, fuente: 'balón suelto ganado en disputa' });
  const stl = credit ? [credit] : [];
  this.emit('loose_ball', { t, team: ex.team, participants: { disputa: [ex.actor, opposer] }, stats: [{ k: 'tov', p: ex.actor, team: ex.team, cause: 'balón suelto perdido' }, ...stl], effects: { pControlAtaque: round(p, 4), control: 'defensa', recupera: opposer, ...(stl.length ? { robo: opposer } : {}) } });
  this.endPossession('live', { team: ex.team, origin: 'balón suelto', carrier: opposer });
  return { end: 'looseLost' };
};

// ---------------------------------------------------------------- encargos de rebote y balance (MOTOR-04)
P.reboundStrength = function reboundStrength(pid) {
  const rb = this.profile.rebound;
  return this.recipeObj(rb.strength, pid, rb.maxEnergyPenalty) + this.profile.body.reboundStrengthSensitivity * (this.pl[pid].reach - this.profile.body.reboundReachReference);
};
// MOTOR-14: registro de una receta de rebote (misma receta que `recipeObj`, solo lectura). `lado` identifica el grupo; el alcance corporal se conserva aparte (no es una capacidad).
P.reboundRecipeNote = function reboundRecipeNote(label, lado, pid, obj) {
  const rb = this.profile.rebound; const tm = rb.maxEnergyPenalty;
  const terminos = Object.entries(obj).map(([cap, w]) => ({ rol: `participante_${lado}`, jugador: pid, cap, base: this.pl[pid].abilities[cap], efectiva: round(this.eff(pid, cap, tm), 3), peso: w, energia: round(this.ps[pid].energy, 2), tope: tm }));
  const valor = terminos.reduce((a, x) => a + x.peso * x.efectiva, 0) / terminos.reduce((a, x) => a + x.peso, 0);
  this.note(`receta:${label}`, { valor: round(valor, 4), lado, alcance: label === 'rebote.fuerza' ? round(this.profile.body.reboundStrengthSensitivity * (this.pl[pid].reach - this.profile.body.reboundReachReference), 4) : null, terminos });
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
    if (ref.kind === 'individual') { const a = this.responsibilityOf(id); const fn = a ? ref.fnMap[a] : null; base = fn ? TIER[this.rep().functions[fn].access] : 1; } // MOTOR-15 (defecto hallado por el benchmark, seed 376412896): un atacante sin función en la referencia (p. ej. el que entró tras un cambio) no tiene acceso al aro conocido: tramo medio, no un error
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
  const fuerza = {}; for (const id of [...offP, ...defP]) fuerza[id] = this.reboundStrength(id); // MOTOR-17B: la fuerza de cierre de cada participante se conserva exacta (TEC17, TEC18, FIS05)
  const mean = (ids) => ids.reduce((s, id) => s + fuerza[id], 0) / ids.length;
  const RA = offP.length ? mean(offP) : 0; const RD = defP.length ? mean(defP) : 0; // MOTOR-14: sin cargadores presentes (inferioridad) no hay disputa ofensiva: pRO = 0, sin NaN
  const K = rb.loadLogitByLevel[this.styleOf(offT).afterShot - 1];
  const p0 = ft ? rb.lastFreeThrowOffensiveP0 : rb.fieldOffensiveP0;
  // MOTOR-07: disputa simétrica (Forma de defensa/disputa de ambos grupos, M-DEF de ambos); sin presión ni T. La elección del captor no usa estados.
  const rfp = this.formPressure('rebound', offP, defP, { executants: [] });
  const rz = this.momentZ('rebound', offP, defP);
  const rr = reboundTeamResolution(this.profile, { p0, RA, RD, K, fpDelta: rfp.delta, Z: rz.Z, alpha: rz.alpha, hasOffense: offP.length > 0 }); // MOTOR-17B: función pura compartida con el contraste
  const pRO0 = rr.pBase; const pRO = rr.p;
  this.perturbNote('rebound', rz, { pBase: round(pRO0, 5), pFinal: round(pRO, 5) });
  this.note('rebote', { participantesAtaque: offP, participantesDefensa: defP, RA: round(RA, 3), RD: round(RD, 3), kCarga: K, pRebOfensivo: round(pRO, 5), encargos: this.commitTrace(commit) });
  if (this.opts.detail === 'full') { // MOTOR-14 (TEC17/TEC18/FIS05): fuerza de cierre por participante, con el mismo cálculo y las mismas entradas (sin sorteos ni cálculos nuevos)
    for (const [side, ids] of [['ataque', offP], ['defensa', defP]]) for (const id of ids) this.reboundRecipeNote('rebote.fuerza', side, id, rb.strength);
  }
  const spec = { dist: this.profile.durationSeconds.rebound, factor: 1, tag: 'rebote', load: 'rebound' };
  const plan = this.planDuration(spec, 'rebound', 'rebote');
  if (plan.expired) {
    // bocina: no hay continuación viva ni rebote inventado
    const t = this.consume(this.limit(), 'rebound');
    this.emit('expiry', { team: offT, t, intent: { origen: 'tiro fallado', motivo: 'bocina sin continuación viva' }, effects: { fin: 'periodo' } });
    this.cover('fallo con bocina sin rebote');
    return { end: 'periodEnd' };
  }
  const missEvent = this.events[this.events.length - 1]?.id ?? null; // MOTOR-09: oferta de rebote = el fallo elegible que la origina
  const t = this.consume(plan.tenths, plan.load);
  const offReb = this.bernoulli(pRO, 'rebote:equipo');
  const team = offReb ? offT : defT;
  const cands = offReb ? offP : defP;
  if (this.opts.detail === 'full') for (const id of cands) this.reboundRecipeNote('rebote.captura', offReb ? 'ataque' : 'defensa', id, rb.captor); // MOTOR-14 (TEC18): candidatos elegibles y peso de captura
  const capW = cands.map((id) => ({ key: id, w: this.recipeObj(rb.captor, id, rb.maxEnergyPenalty) }));
  const captor = this.pick(capW, 'rebote:captor').key;
  if (this.opts.detail === 'full') this.note('salida:rebote', { entradas: { p0, K, fpDelta: rfp.delta, Z: rz.Z, alpha: rz.alpha, hasOffense: offP.length > 0, RA, RD, fuerza: { ataque: Object.fromEntries(offP.map((id) => [id, fuerza[id]])), defensa: Object.fromEntries(defP.map((id) => [id, fuerza[id]])) }, captura: { lado: offReb ? 'ataque' : 'defensa', pesos: Object.fromEntries(capW.map((x) => [x.key, x.w])), probabilidades: pickProbabilities(capW) } },
    refs: { fuerza: [...offP.map((id) => ({ label: 'receta:rebote.fuerza', jugador: id, lado: 'ataque' })), ...defP.map((id) => ({ label: 'receta:rebote.fuerza', jugador: id, lado: 'defensa' }))], captura: capW.map((x) => ({ label: 'receta:rebote.captura', jugador: x.key, lado: offReb ? 'ataque' : 'defensa' })) }, salida: { pBase: round(pRO0, 8), p: round(pRO, 8) } });
  this.cover(offReb ? 'rebote ofensivo' : 'rebote defensivo');
  this.emit('rebound', { t, team: offT, intent: { origen: ft ? 'último libre fallado' : `tiro fallado ${zone}` }, participants: { captor, candidatos: cands }, stats: this.reboundStats(ex, ft ? 'freeThrowLast' : 'field', { team, player: captor }, missEvent), effects: { ofensivo: offReb, pRebOfensivo: round(pRO, 5), contactoAro: true, encargos: this.commitTrace(commit) } });
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
  this.stopLog.push({ seq: this.eventSeq, period: this.period, remaining: this.clock, reason }); // MOTOR-15: parada (balón muerto) para las ventanas del art. 45
  this.queueWindow({ reason, timeoutTeams: [0, 1], subs: true });
};

P.endPossession = function endPossession(kind, info) {
  this.closeOpenChain(this.poss); // MOTOR-17 §6.1: solo registro
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
    case 'sanctionRight': this.deadBall('derecho sancionador'); this.nextPoss = { team, entry: 'inbound', shotClock: toTenths(rules.penaltyThrowInShotClockSeconds), throwIn: info.throwIn }; break; // MOTOR-15: la cola de sanciones concede la posesión al otro equipo
    case 'live': this.nextPoss = { team: opp, entry: 'live', origin: info.origin, carrier: info.carrier, deficit: info.deficit ?? 0, shotClock: toTenths(rules.shotClockSeconds) }; this.clockRunning = true; break;
    default: throw new Error(`fin de posesión desconocido ${kind}`);
  }
};
