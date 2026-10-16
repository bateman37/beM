// Resolución defensiva (MOTOR-05): ayudas con relevo, decisiones de estilo, coberturas de bloqueo y avance con presión.
// Reutiliza las recetas y referencias aceptadas (TAR02/TAR04/TAR06/TAR09, helpExecutionP0, sensibilidades). Los cinco estilos orientan
// ELECCIONES (odds f·p/(1−p+f·p), nivel 3 = 1) y encargos; ninguno descuenta la conversión rival. Las constantes SEM de este bloque están
// en `profile.defense` (anexo A del encargo) y se registran como filas consultadas.
import { MatchCore } from './core.js';
import { clamp, sigmoid, logit, round } from './mathx.js';
import { oddsAdjust } from './flow.js';
import { abilityFit } from './formulas.js';

const P = MatchCore.prototype;
const ZONE_NEAR = new Set(['rim', 'mid']);

P.dstyle = function dstyle(t, key) { return this.defPlan(t).defStyles[key]; };
P.defRoleBias = function defRoleBias(pid, tags) {
  const a = this.dcfg().assignment;
  return this.defRoleTags(pid).some((x) => tags.includes(x)) ? a.roleFitWeight : a.otherRoleFitWeight;
};
const specialActive = (sp, period) => !sp.scope || sp.scope.kind !== 'period' || sp.scope.period === period;
P.activeSpecial = function activeSpecial(t, id) { return (this.defPlan(t).specials ?? []).find((x) => x.id === id && specialActive(x, this.period)) ?? null; };
// ESPD03: atacantes que no se pueden abandonar.
P.protectedAttackers = function protectedAttackers(t) { const sp = this.activeSpecial(t, 'ESPD03'); return new Set(sp ? [sp.protected] : []); };

// ---------------------------------------------------------------- ayudas: candidatos con acceso, sin restricciones incompatibles
P.helpCandidates = function helpCandidates(ex) {
  const t = 1 - ex.team; const ref = this.defRef(t); const org = this.drep().organizations[ref.org];
  const prot = this.protectedAttackers(t); const committed = this.poss.committed ?? new Set();
  const dedicated = org.dedicated ? ref.fnOwner[org.chaser] : null;
  let pool = ref.kind === 'individual' ? this.onCourt(t).filter((id) => this.ps[id].available) : this.reliefFor(ex.actor);
  pool = pool.filter((id) => id !== ex.defend && id !== ex.icpt && id !== ex.denier && id !== dedicated && !committed.has(id));
  if (ref.kind === 'individual') pool = pool.filter((id) => { const a = this.responsibilityOf(id); return a && ZONE_NEAR.has(this.rep().functions[ref.fnMap[a]].access); });
  const before = pool.length;
  pool = pool.filter((id) => { const a = this.responsibilityOf(id); return !(a && prot.has(a)); }); // ESPD03: no abandonar al tirador protegido
  ex.protectedBlocked = before - pool.length; // se registra: «ayuda no disponible por no abandonar»
  return pool;
};

// Decide si hay ayuda adicional, quién, a quién deja, quién puede relevar y si llegan. Sustituye al mecanismo por posiciones nominales.
P.tryHelp = function tryHelp(ex) {
  const opp = this.profile.opportunity; const defT = 1 - ex.team; const d = this.dcfg();
  if (ex.zone !== 'rim' && ex.zone !== 'inside') return { K: 0 };
  const cands = this.helpCandidates(ex);
  if (!cands.length) return { K: 0, blocked: ex.protectedBlocked ?? 0 };
  const lv = this.defPlan(defT).defStyles;
  // «Ayudas» orienta cuántas oportunidades adicionales se aceptan; la protección interior pondera esa tarea candidata (no la conversión).
  const ratio = d.styles.additionalHelpOddsRatio[lv.help - 1] * d.styles.interiorProtectionChoiceWeight[lv.protection - 1];
  const pH = oddsAdjust(opp.helpProbability, ratio);
  this.note('ayuda:decisión', { base: opp.helpProbability, ratioAyudas: d.styles.additionalHelpOddsRatio[lv.help - 1], pesoProteccionInterior: d.styles.interiorProtectionChoiceWeight[lv.protection - 1], p: round(pH, 4), candidatos: cands });
  if (!this.bernoulli(pH, 'ayuda:compromiso')) return { K: 0 };
  const tags = ['rimHelp', 'teamHelp'];
  const helper = this.pick(cands.map((id) => ({ key: id, w: this.taskValue('TAR09', 'attack', { helper: id }) * this.defRoleBias(id, tags) })), 'ayuda:ayudante').key;
  const abandoned = this.responsibilityOf(helper);
  const Ah = this.taskValue('TAR09', 'attack', { helper }, 'ayuda:ayudante');
  const res = { K: 0, helper, abandoned, arrives: true, pArrive: null, relief: null, reliefArrives: false, blocked: ex.protectedBlocked ?? 0 };
  let Ar = null;
  if (abandoned) {
    Ar = this.taskValue('TAR09', 'defense', { receiver: abandoned }, 'ayuda:receptor_abandonado');
    res.pArrive = sigmoid(logit(opp.helpExecutionP0) + opp.helpDifferenceSensitivity * (Ah - Ar));
    res.arrives = this.bernoulli(res.pArrive, 'ayuda:llega');
    // Relevo: otro defensor compatible puede cubrir lo abandonado o mantener la protección interior (tarea candidata ponderada por el estilo).
    const rc = this.reliefFor(abandoned).filter((id) => id !== helper && id !== ex.defend && id !== ex.denier);
    if (rc.length) {
      const wRel = d.styles.exteriorProtectionChoiceWeight[lv.protection - 1]; const wHold = d.styles.interiorProtectionChoiceWeight[lv.protection - 1];
      const choice = this.pick([{ key: 'relevar', w: wRel }, { key: 'mantener', w: wHold }], 'ayuda:relevo').key;
      if (choice === 'relevar') {
        const best = [...rc].sort((a, b) => this.taskValue('TAR09', 'attack', { helper: b }) - this.taskValue('TAR09', 'attack', { helper: a }) || (a < b ? -1 : 1))[0];
        const pr = sigmoid(logit(opp.helpExecutionP0) + opp.helpDifferenceSensitivity * (this.taskValue('TAR09', 'attack', { helper: best }) - Ar));
        res.relief = best; res.reliefArrives = this.bernoulli(pr, 'ayuda:relevo_llega'); res.pRelief = pr;
        res.reliefLeaves = this.responsibilityOf(best);
      }
    }
  }
  this.commit(helper, 'ayuda');
  this.cover('ayuda comprometida');
  if (res.arrives) { res.K = opp.helperQualityLogit; this.cover('ayuda llega'); }
  if (res.relief) this.cover(res.reliefArrives ? 'relevo llega' : 'relevo no llega');
  return res;
};

// ---------------------------------------------------------------- decisiones de estilo de una interacción (una vez cada una)
// Devuelve el efecto de selección de esta interacción. Las decisiones solo existen donde hay un defensor con acceso real.
P.defenseIntent = function defenseIntent(ex) {
  const defT = 1 - ex.team; const d = this.dcfg(); const lv = this.defPlan(defT).defStyles; const refs = d.choiceReferences;
  const trace = {};
  if (ex.window) return trace;
  if (ex.exec === 'pass' && ex.defend && ex.actor !== ex.holder) {
    // una respuesta de saque (DSaq) asigna la negación o la concede; en cualquier otro caso decide el estilo como siempre
    let deny;
    if (ex.forceDeny || ex.forceConcede) { deny = !!ex.forceDeny; trace.respuestaDeSaque = deny ? 'asigna la negación' : 'concede la recepción'; }
    else deny = this.bernoulli(oddsAdjust(refs.receiverDenialChoiceP0, d.styles.receiverDenialChoiceOddsRatio[lv.receivers - 1]), 'defensa:negar');
    ex.denier = deny ? (ex.icpt ?? ex.defend) : null; ex.noDenial = !deny;
    trace.receptor = deny ? 'niega la recepción' : 'facilita la ayuda';
  }
  if (ex.exec === 'dribble' && ex.defend) {
    const p = oddsAdjust(refs.closePressureChoiceP0, d.styles.closePressureChoiceOddsRatio[lv.pressure - 1]);
    ex.pressureClose = this.bernoulli(p, 'defensa:presión');
    trace.balon = ex.pressureClose ? 'presión cercana' : 'distancia concedida';
  }
  if ((ex.exec === 'dribble' || ex.exec === 'pass') && ex.icpt && !ex.deferSteal) this.decideSteal(ex, trace);
  return trace;
};
// Decisión de intervenir sobre el balón (acceso → decisión). La referencia se aplica UNA vez por interacción, aquí; la ejecución, el control y el crédito se distinguen después.
// Un envío de saque la difiere (`deferSteal`): solo importa si el envío forzado llega a competir como pérdida.
P.decideSteal = function decideSteal(ex, trace = {}) {
  const defT = 1 - ex.team; const d = this.dcfg(); const lv = this.defPlan(defT).defStyles; const refs = d.choiceReferences;
  // MOTOR-07: el defensor decide intervenir leyendo las opciones existentes con SU Visión, Decisiones y Anticipación (nunca las del base); se usa el ajuste por
  // capacidad ya vigente (selection.abilityFit) como un factor de odds, una sola vez. Con la referencia neutra el factor es 1.
  const reader = ex.icpt ?? ex.defend;
  const reading = reader ? this.defensiveReading(reader) : null;
  const rf = reading == null ? 1 : abilityFit(this.profile, reading);
  const p = oddsAdjust(refs.stealAttemptGivenAccessP0, d.styles.stealAttemptChoiceOddsRatio[lv.steal - 1] * rf);
  if (reading != null) this.note('lectura_defensiva', { defensor: reader, lecturaEfectiva: round(reading, 3), factorDeOdds: round(rf, 4), nota: 'recetas MEN02/MEN03/MEN04 del defensor; la presión solo reduce la valoración de Decisiones' });
  ex.stealAttempt = this.bernoulli(p, 'defensa:robo'); ex.stealDecisionP = p;
  trace.robo = ex.stealAttempt ? 'intenta intervenir' : 'contiene';
  return trace;
};

// ---------------------------------------------------------------- coberturas del bloqueo
// Dos participantes identificables y una responsabilidad abandonada. No sustituye una cobertura por otra: si falta la pareja funcional, se
// declara la limitación y la interacción se resuelve sin efecto de cobertura.
// MOTOR-06 (§2.3): la misma respuesta defensiva compartida sirve a bloqueos directos (todas las coberturas), entregas (seguimiento/contención,
// cambio, compromiso de dos) y bloqueos indirectos (seguimiento/navegación y cambio). Una cobertura incompatible se declara; no se sustituye.
const PNR_SPEC = { type: 'pnr', ball: 'handler', mover: 'screener', navigator: 'handler', screenerRole: 'screener', allowed: ['COB01', 'COB02', 'COB03', 'COB04'] };
P.coverageSpec = function coverageSpec(entry) { const c = entry.spec.coverage; return !c ? null : c === true ? PNR_SPEC : c; };
P.screenPair = function screenPair(entry) {
  const sp = this.coverageSpec(entry); const r = entry.roles; if (!sp || !r[sp.ball] || !r[sp.mover]) return null;
  const D1 = this.defenderFor(r[sp.ball]); const D2 = this.defenderFor(r[sp.mover]);
  return { handler: r[sp.ball], screener: r[sp.mover], screenerPid: r[sp.screenerRole] ?? r[sp.mover], D1, D2, spec: sp };
};
const hp = (m, p, q) => sigmoid(logit(p) + m.profile.opportunity.helpDifferenceSensitivity * q);

// Decide la cobertura de la interacción. Registra compromisos, cambios y recuperaciones reales en la posesión (`poss.cur`, `committed`).
P.beginCoverage = function beginCoverage(entry, poss, { cob: forced = null } = {}) {
  const t = 1 - poss.team; const plan = this.defPlan(t); const cob = forced ?? plan.coverage; const d = this.dcfg();
  const pair = this.screenPair(entry);
  const info = { cobertura: cob };
  if (!pair) return null;
  const nav = plan.navigation ?? d.coverage.referenceNavigation[cob];
  info.navegacion = nav;
  if (!pair.D1 || !pair.D2 || pair.D1 === pair.D2) { info.limitada = 'falta la pareja funcional de defensores para la cobertura'; this.cover('cobertura no ejecutable'); return { info, pair, cob, none: true }; }
  const protectedScreener = this.protectedAttackers(t).has(pair.screener);
  if ((cob === 'COB03' || cob === 'COB04') && protectedScreener) { info.limitada = `${cob === 'COB04' ? 'Trampa' : 'Show'} no ejecutada: sin ayudante compatible con no abandonar`; this.cover('cobertura limitada por no abandonar'); return { info, pair, cob, none: true }; }
  if (cob === 'COB04' && poss.trapBy && poss.trapBy !== 'COB04') { info.limitada = 'ya hay un compromiso de dos activo (no se duplica la trampa)'; return { info, pair, cob, none: true }; }
  const { D1, D2 } = pair; const o = this.profile.opportunity; const refs = d.choiceReferences;
  if (!pair.spec.allowed.includes(cob)) { info.limitada = `${cob} no es una respuesta compatible con ${{ handoff: 'una entrega', indirect: 'un bloqueo indirecto', pnr: 'un bloqueo directo' }[pair.spec.type]}: se resuelve sin efecto de cobertura (no se sustituye por otra)`; this.cover('cobertura incompatible declarada'); return { info, pair, cob, none: true }; }
  const c = { info, pair, cob, nav, D1, D2, handlerExit: {}, screenerExit: {}, kHandler: 0, kRoller: 0, mix: null };
  info.defensores = { delBalon: D1, delBloqueador: D2 };
  const light = pair.spec.type !== 'pnr';
  if (light && cob === 'COB01') {
    // seguimiento/contención: el defensor del que navega sigue por la interacción (TAR04 defensa frente al bloqueo del compañero); si no la supera, el que navega gana espacio
    const Dn = pair.spec.navigator === pair.spec.ball ? D1 : D2;
    const p = hp(this, refs.symmetricTaskP0, this.taskValue('TAR04', 'defense', { primary: Dn }) - this.taskValue('TAR04', 'attack', { screener: pair.screenerPid }));
    c.follows = this.bernoulli(p, 'COB01:seguimiento'); info.seguimiento = { sigue: c.follows, p: round(p, 4) };
    c.kNav = c.follows ? 0 : o.coverageContainment.handlerPullupQualityLogit;
    this.cover(c.follows ? 'COB01 seguimiento supera la interacción' : 'COB01 seguimiento superado');
  } else if (light && cob === 'COB02') {
    const A = (this.taskValue('TAR04', 'defense', { primary: D1 }) + this.taskValue('TAR04', 'defense', { primary: D2 })) / 2;
    const p = hp(this, refs.symmetricTaskP0, A - this.taskValue('TAR04', 'attack', { screener: pair.screenerPid }));
    c.exchanged = this.bernoulli(p, 'COB02:cambio_completa'); info.cambio = { completa: c.exchanged, p: round(p, 4) };
    if (c.exchanged) { this.setCurrent(pair.handler, D2); this.setCurrent(pair.screener, D1); this.cover('COB02 cambio completado'); }
    else { c.kNav = o.coverageContainment.handlerPullupQualityLogit; this.cover('COB02 cambio no completado'); }
    this.commit(D1, 'cambio'); this.commit(D2, 'cambio');
  } else if (cob === 'COB01') {
    const cv = o.coverageContainment;
    c.kHandler = cv.handlerPullupQualityLogit; c.kRoller = cv.rollerQualityLogit; // drop: espacio al manejador, el bloqueador defiende al continuador
    if (nav === 'under') { // por debajo: el seguimiento recupera tras el tiro; puede dejar el tiro libre antes de recuperar
      const p = hp(this, o.helpExecutionP0, this.taskValue('TAR02', 'defense', { primary: D1 }) - this.taskValue('TAR02', 'attack', { handler: pair.handler }));
      c.underArrives = this.bernoulli(p, 'COB01:por_debajo_recupera'); info.porDebajo = { recupera: c.underArrives, p: round(p, 4) };
    }
    this.commit(D2, 'drop'); this.cover(nav === 'under' ? 'COB01 drop por debajo' : 'COB01 drop');
  } else if (cob === 'COB02') {
    const A = (this.taskValue('TAR04', 'defense', { primary: D1 }) + this.taskValue('TAR04', 'defense', { primary: D2 })) / 2;
    const p = hp(this, refs.symmetricTaskP0, A - this.taskValue('TAR04', 'attack', { screener: pair.screener }));
    c.exchanged = this.bernoulli(p, 'COB02:cambio_completa'); info.cambio = { completa: c.exchanged, p: round(p, 4) };
    if (c.exchanged) {
      this.setCurrent(pair.handler, D2); this.setCurrent(pair.screener, D1); // responsabilidad actual: persiste hasta una modificación pertinente
      this.cover('COB02 cambio completado');
    } else { c.kHandler = o.coverageContainment.handlerPullupQualityLogit; c.kRoller = -o.coverageContainment.rollerQualityLogit; this.cover('COB02 cambio no completado'); }
    this.commit(D1, 'cambio'); this.commit(D2, 'cambio');
  } else if (cob === 'COB03') {
    this.commit(D2, 'show');
    const p = hp(this, o.helpExecutionP0, this.taskValue('TAR09', 'attack', { helper: D2 }) - this.taskValue('TAR09', 'defense', { receiver: pair.screener }));
    c.recovers = this.bernoulli(p, 'COB03:recupera'); info.show = { recupera: c.recovers, p: round(p, 4) };
    this.cover(c.recovers ? 'COB03 recupera' : 'COB03 no recupera');
  } else if (cob === 'COB04') {
    c.mix = { primary: D1, second: D2 }; poss.trapBy = 'COB04';
    this.commit(D1, 'trampa'); this.commit(D2, 'trampa');
    const rc = this.reliefFor(pair.screener).filter((id) => id !== D1 && id !== D2);
    c.rotation = rc.length ? [...rc].sort((a, b) => this.taskValue('TAR09', 'attack', { helper: b }) - this.taskValue('TAR09', 'attack', { helper: a }) || (a < b ? -1 : 1))[0] : null;
    if (c.rotation) { const p = hp(this, o.helpExecutionP0, this.taskValue('TAR09', 'attack', { helper: c.rotation }) - this.taskValue('TAR09', 'defense', { receiver: pair.screener })); c.rotates = this.bernoulli(p, 'COB04:rotación_llega'); info.rotacion = { defensor: c.rotation, llega: c.rotates, p: round(p, 4) }; }
    this.abandon(pair.screener, c.rotates ? c.rotation : null); // el bloqueador queda con relevo o abierto para la siguiente opción
    this.cover('COB04 trampa');
  }
  poss.coverage = c;
  return c;
};

// Aplica la cobertura a la salida elegida: defensor/es, ventana libre y contexto de calidad. Devuelve el ajuste de contexto de calidad.
P.coverageForExit = function coverageForExit(ex, c) {
  const out = { k: 0, spaceFromCoverage: false };
  if (!c || c.none) return out;
  const sp = c.pair.spec;
  const isHandler = ex.role === sp.ball; const isScreener = ex.role === sp.mover;
  if (sp.type !== 'pnr' && (c.cob === 'COB01' || c.cob === 'COB02')) {
    if (c.cob === 'COB02' && c.exchanged) { if (isHandler) { ex.defend = c.D2; ex.icpt = c.D2; } else if (isScreener) { ex.defend = c.D1; ex.icpt = c.D1; } }
    else if (ex.role === sp.navigator && c.kNav) { out.k += c.kNav; out.spaceFromCoverage = true; }
    ex.cobertura = { id: c.cob, ...c.info };
    return out;
  }
  if (c.cob === 'COB01') {
    if (isHandler && ex.pullup) { out.k += c.kHandler; out.spaceFromCoverage = true; }
    if (isScreener && ex.roller) out.k += c.kRoller;
    if (c.nav === 'under' && isHandler && (ex.zone === 'midrange' || ex.zone === 'three') && !c.underArrives) { ex.window = true; ex.helpWindow = 'tiro antes de recuperar (por debajo)'; ex.defend = null; ex.icpt = null; }
  } else if (c.cob === 'COB02') {
    if (c.exchanged) { if (isHandler) { ex.defend = c.D2; ex.icpt = c.D2; } else if (isScreener) { ex.defend = c.D1; ex.icpt = c.D1; } }
    else { if (isHandler) { out.k += c.kHandler; out.spaceFromCoverage = true; } if (isScreener) out.k += c.kRoller; }
  } else if (c.cob === 'COB03') {
    if (isScreener) { if (c.recovers) { ex.defend = c.D2; ex.icpt = c.D2; } else { ex.window = true; ex.helpWindow = 'continuador libre mientras el defensor recupera'; ex.defend = null; ex.icpt = null; } }
    if (isHandler && ex.pullup) { out.k += this.profile.opportunity.coverageContainment.handlerPullupQualityLogit; out.spaceFromCoverage = true; }
  } else if (c.cob === 'COB04') {
    if (isHandler) { ex.defMix = c.mix; ex.defend = c.D1; ex.icpt = c.D1; }
    else if (isScreener) { if (c.rotation && c.rotates) { ex.defend = c.rotation; ex.icpt = c.rotation; } else { ex.window = true; ex.helpWindow = 'pase de salida: ventaja detrás de la trampa'; ex.defend = null; ex.icpt = null; } }
  }
  ex.cobertura = { id: c.cob, ...c.info };
  return out;
};

// Defensa de un duelo con mezcla de dos defensores en una tarea conjunta (0,65 / 0,35), sin sumar la defensa completa de ambos.
P.mixedValue = function mixedValue(ex, fn) {
  const m = this.dcfg().coverage.sameTaskTwoDefenderMixture;
  return m.primary * fn(ex.defMix.primary) + m.second * fn(ex.defMix.second);
};

// ---------------------------------------------------------------- carga por encargo (una sola vez por intervalo; máximo, no producto)
// `duty`: { jugador: factor }. consume() aplica clamp(carga · factor) con los límites de carga vigentes solo a los comprometidos.
P.withDuty = function withDuty(duty, fn) {
  const prev = this.duty; this.duty = { ...(prev ?? {}) };
  for (const [id, f] of Object.entries(duty)) this.duty[id] = Math.max(this.duty[id] ?? 1, f);
  try { return fn(); } finally { this.duty = prev; }
};
P.dutyFor = function dutyFor(ex) {
  const duty = {}; const d = this.dcfg(); const poss = this.poss;
  const c = poss?.coverage;
  if (c && !c.none && ex.cobertura) { const f = d.coverage.committedActorLoad[c.cob]; for (const id of [c.D1, c.D2]) if (id) duty[id] = Math.max(duty[id] ?? 1, f); }
  if (ex.especial?.id === 'ESPD02' && ex.defMix) { const f = d.coverage.committedActorLoad.COB04; for (const id of [ex.defMix.primary, ex.defMix.second]) duty[id] = Math.max(duty[id] ?? 1, f); } // mismo compromiso de dos: una sola carga
  return duty;
};

// Calidad defensiva de la ficha con defensores sustituidos (cambio, trampa): misma receta, otros actores reales.
P.cdWith = function cdWith(entry, over) {
  const merged = { ...entry.roles, ...entry.def, ...over };
  return this.recipe(entry.play.qualityDefense, merged, null, 'calidad_defensa:cobertura');
};
P.mixDuelCD = function mixDuelCD(entry, ex) {
  const m = this.dcfg().coverage.sameTaskTwoDefenderMixture;
  return m.primary * this.cdWith(entry, { primary: ex.defMix.primary }) + m.second * this.cdWith(entry, { primary: ex.defMix.second });
};

// ---------------------------------------------------------------- avance con presión (tres cuartos / total) y violación de 8 s
// Una sola interacción con resultados excluyentes (anexo A, apartado 16.4): control, demora, presión superada, pérdida o contacto. Sin tiradas
// por metro ni por pase rutinario. Los pesos base se ajustan con las recetas vigentes (manejo del poseedor frente al presionador); la
// presión cercana pondera una vez exposición (pérdida/contacto) y la posibilidad de ser superado. El factor de altura actúa una vez sobre
// la duración del avance y sobre la carga de los comprometidos.
P.defensiveLegality = function defensiveLegality(pid, dt) {
  const c = this.profile.contact;
  return this.recipe([['d', dt, c.defensiveLegality.defenseTechnique], ['d', 'MEN04', c.defensiveLegality.MEN04], ['d', 'MEN05', c.defensiveLegality.MEN05]], { d: pid }, c.maximumEnergyPenalty, 'legalidad_defensiva');
};

// Violación de 8 segundos: pérdida de equipo con balón muerto. Interpretación propia (saque ordinario con 24 s; pendiente de contraste con el PDF).
P.backcourtViolation = function backcourtViolation(poss) {
  const rules = this.profile.rules;
  const t = this.consume(Math.min(rules.backcourtSeconds * 10, this.limit() - 1), 'organized');
  this.emit('expiry', { team: poss.team, t, intent: { origen: 'avance', motivo: 'violación de 8 segundos' }, stats: [{ k: 'tov', p: null, team: poss.team, cause: 'violacion_8' }], effects: { fin: 'posesion' } });
  this.cover('violación 8 s');
  this.endPossession('deadTurnover', { team: poss.team });
  return { end: 'deadTurnover' };
};

P.pressedAdvance = function pressedAdvance(poss, height) {
  const team = poss.team; const defT = 1 - team; const d = this.dcfg(); const cfg = d.pressure; const refs = d.choiceReferences;
  const o = this.profile.outcomes; const opp = this.profile.opportunity; const lv = this.defPlan(defT).defStyles; const dur = this.profile.durationSeconds;
  const lim0 = this.limit();
  if (lim0 <= Math.round(dur.advance[0] * 10)) return this.expire({ team, origin: 'avance' }, 'avance');
  const handler = poss.carrierPid && this.ps[poss.carrierPid]?.onCourt ? poss.carrierPid : this.pickDirector(team).id;
  const presser = this.nearestDefender(handler);
  const support = this.reliefFor(handler).filter((id) => id !== presser).sort((a, b) => this.taskValue('TAR07', 'defense', { interceptor: b }) - this.taskValue('TAR07', 'defense', { interceptor: a }) || (a < b ? -1 : 1))[0] ?? null;
  const close = this.bernoulli(oddsAdjust(refs.closePressureChoiceP0, d.styles.closePressureChoiceOddsRatio[lv.pressure - 1]), 'avance:presión_cercana');
  const attempt = this.bernoulli(oddsAdjust(refs.stealAttemptGivenAccessP0, d.styles.stealAttemptChoiceOddsRatio[lv.steal - 1]), 'avance:intento_de_robo');
  const exp = close ? cfg.closePressureExposureWeightFactor : 1; const N = this.profile.neutralAbility;
  const offC = this.taskValue('TAR02', 'attack', { handler }, 'avance:control_ataque'); const defC = this.taskValue('TAR02', 'defense', { primary: presser }, 'avance:control_defensa');
  const z = opp.advantageSensitivity * (offC - defC);
  const offB = this.taskValue('TAR06', 'attack', { handler }); const defB = attempt ? this.taskValue('TAR06', 'defense', { primary: presser }) : N;
  const legal = this.defensiveLegality(presser, 'TEC12');
  const bw = cfg.newAdvancedInteractionBaseWeights;
  const items = [
    { key: 'controlledAdvance', w: bw.controlledAdvance * Math.exp(z) },
    { key: 'delayedAdvance', w: bw.delayedAdvance * Math.exp(-z) },
    { key: 'pressureBeaten', w: close ? bw.pressureBeaten * Math.exp(z) * cfg.closePressureBeatenWeightFactor : 0 },
    { key: 'turnover', w: bw.turnover * Math.exp(o.controlSensitivity * (defB - offB)) * exp },
    { key: 'contact', w: bw.contact * Math.exp(o.defensiveFoulSensitivity * (N - legal)) * exp },
  ];
  const outcome = this.pick(items, 'avance:resultado').key;
  const factor = cfg.advanceDurationFactorByHeight[height];
  let tenths = this.sampleDuration(dur.advance, 'avance', { factor, limit: lim0 });
  let extra = 0;
  if (outcome === 'delayedAdvance' && lim0 - tenths > 2) extra = this.sampleDuration(cfg.delayedAdvanceAdditionalSeconds, 'avance:demora', { limit: lim0 - tenths });
  const total = tenths + extra;
  const duty = {}; const lf = cfg.committedActorLoadByHeight[height]; duty[presser] = lf; if (support) duty[support] = lf;
  const trace = { altura: height, poseedor: handler, presionador: presser, apoyo: support, presionCercana: close, intentoDeRobo: attempt, resultado: outcome, demoraSegundos: extra / 10 };
  this.cover(`presión ${height}`);
  if (total >= this.profile.rules.backcourtSeconds * 10) { this.note('avance:violación_8s', trace); return this.backcourtViolation(poss); }
  const t = this.withDuty(duty, () => this.consume(total, 'organized'));
  const base = { t, team, participants: { poseedor: handler, presionador: presser, apoyo: support } };
  if (outcome === 'turnover') {
    const stats = [{ k: 'tov', p: handler, team, cause: 'presión' }];
    const stole = attempt && this.bernoulli(o.stealGivenTurnover, 'avance:robo');
    if (stole) {
      stats.push({ k: 'stl', p: presser, team: defT });
      this.emit('advance', { ...base, intent: { origen: 'avance presionado', ...trace }, stats, effects: { perdida: true, robo: presser, balonVivo: true } });
      this.cover('robo en la presión'); this.endPossession('live', { team, origin: 'robo', carrier: presser });
      return { end: 'steal' };
    }
    if (this.bernoulli(o.turnoverOutOfBoundsIfNotSteal, 'avance:pérdida_fuera')) {
      this.emit('advance', { ...base, intent: { origen: 'avance presionado', ...trace }, stats, effects: { perdida: true, fuera: true, robo: null } });
      this.endPossession('deadTurnover', { team }); return { end: 'deadTurnover' };
    }
    const carrier = this.pickRecoverer(defT, presser);
    this.emit('advance', { ...base, intent: { origen: 'avance presionado', ...trace }, stats, effects: { perdida: true, robo: null, balonVivo: true, recupera: carrier } });
    this.endPossession('live', { team, origin: 'pérdida', carrier }); return { end: 'liveTurnover' };
  }
  if (outcome === 'contact') {
    this.emit('advance', { ...base, intent: { origen: 'avance presionado', ...trace }, effects: { contacto: true } });
    this.foulAdmin(presser, handler, { shooting: false, shotTeam: team });
    this.poss.pendingFT = { team, actor: handler, origin: 'avance', zone: 'three', kind: 'organized' };
    this.cover('falta en el avance');
    return { cont: 'foulWindow' };
  }
  if (outcome === 'pressureBeaten') {
    // el presionador queda retrasado/comprometido: el apoyo asume al poseedor y el superado recupera al hombre que deja (retorno real)
    const left = support ? this.responsibilityOf(support) : null;
    if (support) { this.setCurrent(handler, support); if (left) this.setCurrent(left, presser); this.commit(presser, 'superado'); trace.retorno = { asume: support, recupera: left }; }
    this.cover('presión superada');
    poss.carrierPid = handler; poss.early = true; poss.recovery = { kind: 'pressBeaten', holder: handler, presser }; // ESP11: ventaja real mientras los defensores recuperan
  }
  this.emit('advance', { ...base, intent: { origen: 'avance a pista de ataque', ...trace } });
  poss.advanced = true; this.clockRunning = true;
  return null;
};
