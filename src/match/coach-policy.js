// Decisión del entrenador automático (MOTOR-08): funciones PURAS sobre la vista permitida del equipo (`coachView`). No importan el motor, no
// consumen azar y no leen estado interno rival: lo que no está en la vista no puede influir en una propuesta (contrato de información, §4.1).
// Cada función devuelve propuestas con su regla, motivo y observaciones; la autorización (delegación, órdenes manuales, recursos) y la
// ejecución en una ventana válida las hace `coach.js`. Las magnitudes viven en `profile.coach` / `profile.memory` (SEM-MOTOR08).
import { clamp, interpolate, round } from './mathx.js';

export const COACH_AREAS = ['rotation', 'adjustments', 'fouls', 'timeouts', 'endgame'];
const SLOTS5 = ['PG', 'SG', 'SF', 'PF', 'C'];

// ---------------------------------------------------------------- utilidad contextual (escala 1–30)
// Una sola receta de utilidad para el motor y para el entrenador: capacidades efectivas con la energía ya aplicada (curva selectiva con el deterioro
// máximo de `rotation.utilityMaxEnergyPenalty`). Quien la usa NO vuelve a restar energía ni la suma después a la probabilidad de ejecución.
export function utilityFor(profile, abilities, energy, weights) {
  const rot = profile.rotation; const sev = interpolate(profile.energy.severityNodes, energy);
  const [lo, hi] = profile.abilityBounds; let u = 0;
  for (const [attr, w] of Object.entries(weights)) u += w * clamp(abilities[attr] - sev * rot.utilityMaxEnergyPenalty, lo, hi);
  return u;
}
export const slotUtilityOf = (profile, p, slot) => utilityFor(profile, p.abilities, p.energy, profile.rotation.slotAbilityWeights[slot]);
// Utilidad con necesidad contextual: mezcla (1 − b)·función + b·media de las recetas de necesidad (misma energía, misma escala).
export function needUtilityOf(profile, cfg, p, slot, needs) {
  const base = slotUtilityOf(profile, p, slot);
  if (!needs?.length) return base;
  const b = cfg.rotation.needBlend;
  const m = needs.reduce((s, k) => s + utilityFor(profile, p.abilities, p.energy, cfg.rotation.needRecipes[k]), 0) / needs.length;
  return (1 - b) * base + b * m;
}

// ---------------------------------------------------------------- plan de participación SEM (cinco parejas funcionales 28/12)
// Precarga explícita y revisable: por posición, el titular y su mejor relevo declarado (primero las alternativas de director del plan, después el
// mejor ajuste funcional). Un jugador está como mucho en una pareja (sin objetivos acumulados); los dos restantes son recursos situacionales.
export function defaultParticipationPlan(profile, players, plan) {
  const cfg = profile.coach.rotation.participation; const slots = SLOTS5;
  const starters = new Set(slots.map((s) => plan.starters[s]));
  const bench = players.filter((p) => !starters.has(p.id));
  const used = new Set(); const pairs = [];
  const util = (p, slot) => utilityFor(profile, p.abilities, 100, profile.rotation.slotAbilityWeights[slot]);
  for (const slot of slots) {
    const pool = bench.filter((p) => !used.has(p.id));
    const strict = pool.filter((p) => p.positions.includes(slot));
    const cands = strict.length ? strict : pool;
    const rank = (p) => { const i = plan.directorPriority.indexOf(p.id); return slot === 'PG' && i >= 0 ? i : 99; };
    cands.sort((a, b) => rank(a) - rank(b) || util(b, slot) - util(a, slot) || (a.id < b.id ? -1 : 1));
    const relief = cands[0]?.id ?? null; if (relief) used.add(relief);
    pairs.push({ slot, starter: plan.starters[slot], relief, starterMinutes: cfg.starterMinutes, reliefMinutes: cfg.reliefMinutes });
  }
  return { source: 'SEM-MOTOR08: precarga explícita (cinco parejas funcionales 28/12; revisable)', pairs, situational: bench.map((p) => p.id).filter((id) => !used.has(id)) };
}
// Valida la asignación antes de usarla: solo la estructura y los límites declarados; los objetivos son orientación, no obligación.
export function validateParticipation(profile, plan, ids, path, add) {
  const part = plan.participation; const cfg = profile.coach.rotation.participation;
  if (!part || typeof part !== 'object') { add(`${path}.participation`, 'falta el plan de participación (cárgalo desde la precarga SEM o configúralo)'); return; }
  if (!Array.isArray(part.pairs) || part.pairs.length !== cfg.pairs) { add(`${path}.participation.pairs`, `el plan necesita ${cfg.pairs} parejas funcionales`); return; }
  const seen = new Set(); let sum = 0;
  part.pairs.forEach((q, i) => {
    const p = `${path}.participation.pairs[${i}]`;
    if (!SLOTS5.includes(q.slot)) add(`${p}.slot`, 'posición no válida');
    if (q.starter !== plan.starters?.[q.slot]) add(`${p}.starter`, `el titular de la pareja (${q.starter}) no es el del quinteto inicial en ${q.slot}: recarga el plan SEM`);
    for (const f of ['starter', 'relief']) { const id = q[f]; if (!ids.has(id)) add(`${p}.${f}`, `el jugador ${id} no pertenece al equipo`); else if (seen.has(id)) add(`${p}.${f}`, `${id} cubre dos funciones: no recibe dos objetivos acumulados`); seen.add(id); }
    for (const f of ['starterMinutes', 'reliefMinutes']) if (!Number.isFinite(q[f]) || q[f] < 0) add(`${p}.${f}`, 'los minutos objetivo son un número no negativo');
    sum += (q.starterMinutes ?? 0) + (q.reliefMinutes ?? 0);
  });
  if (!Array.isArray(part.situational)) add(`${path}.participation.situational`, 'los recursos situacionales son una lista');
  else for (const id of part.situational) { if (!ids.has(id)) add(`${path}.participation.situational`, `el jugador ${id} no pertenece al equipo`); else if (seen.has(id)) add(`${path}.participation.situational`, `${id} ya está en una pareja`); seen.add(id); }
  const regulation = (profile.rules.quarters * profile.rules.quarterSeconds) / 60; const target = regulation * 5;
  if (Math.abs(sum - target) > 1e-9) add(`${path}.participation`, `los objetivos suman ${sum} minutos y el tiempo reglamentario de cinco posiciones es ${target}`);
}

// ---------------------------------------------------------------- contextos de final (mismo motor, otras prioridades)
export function endgameState(view, cfg, policy) {
  const c = cfg.common; const { lastPeriod, remainingSeconds: s } = view.clock; const m = view.score.margin; const behind = -m;
  const out = { active: [], contexts: [], needs: [], urgent: false, state: m > 0 ? 'leading' : m < 0 ? 'trailing' : 'tied', margin: m, behind, seconds: s, lastPeriod };
  if (!lastPeriod) return out;
  if (s <= policy.closingWindow && Math.abs(m) <= c.closeMarginPoints) out.active.push('closeContest');
  if (behind >= c.urgent.deficitPoints && s <= c.urgent.seconds) out.active.push('urgent');
  if (behind >= c.fastAttack.deficitPoints && s <= c.fastAttack.seconds) out.active.push('fastAttack');
  if (behind >= c.seekThree.deficitPoints && s <= c.seekThree.seconds) out.active.push('seekThree');
  if (m >= 1 && s <= policy.closingWindow && s > 0) out.active.push('protectLead');
  out.urgent = out.active.some((k) => ['urgent', 'fastAttack', 'seekThree'].includes(k));
  const defs = Object.fromEntries(cfg.endgame.contexts.map((x) => [x.id, x]));
  out.contexts = out.active.map((k) => defs[k]).sort((a, b) => b.priority - a.priority || (a.id < b.id ? -1 : 1));
  // necesidades contextuales para valorar relevos (creación, defensa, rebote, pase, libres, tiro de tres)
  const state = m > 0 ? 'leading' : m < 0 ? 'trailing' : 'tied';
  const needs = new Set();
  for (const x of out.contexts) for (const n of x.needs[state] ?? []) needs.add(n);
  out.needs = [...needs].sort(); out.state = state;
  return out;
}

// ---------------------------------------------------------------- librillo de faltas (tabla ordenada)
function foulRowMatches(row, view, pol, cfg, p, manual) {
  const w = row.when; const s = view.clock.remainingSeconds; const m = view.score.margin;
  if (w.unavailable != null && w.unavailable !== !p.available) return false;
  if (w.manualOrder != null && w.manualOrder !== manual) return false;
  if (w.period != null && !w.period.includes(view.clock.period)) return false; // periodos reglamentarios: una prórroga no es un nuevo Q1
  if (w.periodLast != null && w.periodLast !== view.clock.lastPeriod) return false;
  if (w.foulsMin != null && p.fouls < w.foulsMin) return false;
  if (w.closingWindow != null && (w.closingWindow === 'inside') !== (s <= pol.closingWindow)) return false; // ventana de cierre de la política
  if (w.secondsAtMost != null && !(s <= w.secondsAtMost)) return false;
  if (w.marginAbsMax != null && !(Math.abs(m) <= w.marginAbsMax)) return false;
  if (w.deficitMin != null && !(-m >= w.deficitMin)) return false;
  return true;
}
// Fila ganadora para un jugador: mayor prioridad; en empate, la más específica (más condiciones) y después el orden estable de la fila.
export function foulBookRow(view, cfg, p, manual = false) {
  const pol = cfg.policies[view.own.policy];
  const hits = cfg.foulBook.map((row, i) => ({ row, i, spec: Object.values(row.when).filter((v) => v != null).length })).filter((h) => foulRowMatches(h.row, view, pol, cfg, p, manual));
  hits.sort((a, b) => b.row.priority - a.row.priority || b.spec - a.spec || a.i - b.i);
  return hits[0]?.row ?? null;
}

// ---------------------------------------------------------------- rotaciones
const REASON_ORDER = ['energia_critica', 'proteccion_faltas', 'fatiga', 'faltas_cierre', 'tramo_largo', 'participacion', 'necesidad_final'];
// Qué ámbito delegado autoriza cada causa de revisión (rotaciones, gestión de faltas o finales).
const REASON_AREA = { energia_critica: 'rotation', fatiga: 'rotation', tramo_largo: 'rotation', participacion: 'rotation', proteccion_faltas: 'fouls', faltas_cierre: 'fouls', necesidad_final: 'endgame' };
const nominal = (r, slot) => (r.positions.includes(slot) ? 0 : 1);

// Objetivo de minutos de un jugador al ritmo del tiempo reglamentario transcurrido (las prórrogas no cambian el plan de tiempo reglamentario).
export function participationPace(view, cfg) {
  const part = view.own.participation; if (!part) return {};
  const reg = view.clock.regulationSeconds; const frac = clamp(view.clock.elapsedRegulationSeconds / reg, 0, 1);
  const out = {};
  for (const q of part.pairs) { out[q.starter] = { target: q.starterMinutes * frac, pair: q.relief }; out[q.relief] = { target: q.reliefMinutes * frac, pair: q.starter }; }
  return out;
}

// Revisa en una ventana de sustitución. Devuelve { proposals, kept, notes }. Las sustituciones obligatorias las resuelve la administración, no esta política.
export function decideRotation(view, cfg, profile, deleg = { rotation: true, fouls: true, endgame: true }) {
  const pol = cfg.policies[view.own.policy]; const eg = endgameState(view, cfg, pol); const rc = cfg.rotation;
  const manual = view.own.lineupControl === 'manual';
  const on = view.own.players.filter((p) => p.onCourt && p.available);
  const bench = view.own.players.filter((p) => !p.onCourt && p.available);
  const pace = participationPace(view, cfg); const inOT = !view.clock.regulation;
  const proposals = []; const kept = []; const notes = [];
  const usedIn = new Set(); const usedOut = new Set();
  const cand = [];
  for (const P of on) {
    const slot = P.slot; const row = foulBookRow(view, cfg, P, manual);
    const reasons = [];
    const protectRow = row && ['protect', 'reduce_risk_consider_relief'].includes(row.preference);
    const closingRow = row && row.preference === 'compare_closing_value';
    const acceptRow = row && row.preference === 'accept_risk_keep_reference';
    if (P.energy <= pol.criticalEnergyReview) reasons.push('energia_critica');
    if (protectRow) reasons.push('proteccion_faltas');
    if (P.energy <= pol.energyReview) reasons.push('fatiga');
    if (P.stintSeconds >= pol.maxOrdinaryStintReview) reasons.push('tramo_largo');
    const pc = pace[P.id];
    if (pc && !inOT && P.playedSeconds / 60 - pc.target >= rc.participation.reviewDeviationMinutes) reasons.push('participacion');
    if (closingRow || acceptRow) reasons.push('faltas_cierre');
    if (eg.contexts.length) reasons.push('necesidad_final');
    const ordered = [...new Set(reasons)].filter((r) => deleg[REASON_AREA[r]]).sort((a, b) => REASON_ORDER.indexOf(a) - REASON_ORDER.indexOf(b));
    if (!ordered.length) continue;
    cand.push({ P, slot, row, reasons: ordered, protectRow, closingRow, acceptRow });
  }
  for (const c of cand) {
    const { P, slot, row } = c; const pc = pace[P.id];
    const stintOk = P.stintSeconds >= pol.minCourtStint; const finalNeed = c.reasons.includes('necesidad_final');
    const stabilityException = c.reasons.includes('energia_critica') ? 'energía crítica (<' + pol.criticalEnergyReview + ')' : finalNeed ? 'necesidad final definida' : null;
    if (P.locked) { notes.push({ jugador: P.id, motivo: 'reentrada inmediata: espera a que corra el reloj' }); continue; }
    if (!stintOk && !stabilityException) { notes.push({ jugador: P.id, motivo: `estabilidad: lleva ${Math.round(P.stintSeconds)} s en pista (mínimo ${pol.minCourtStint} s)`, razones: c.reasons }); continue; }
    const urgentKeep = c.protectRow && eg.urgent;
    const poolAll = bench.filter((r) => !r.locked && !usedIn.has(r.id));
    const ready = poolAll.filter((r) => r.energy >= pol.benchReadyEnergy && (r.benchSeconds >= pol.minBenchStint || stabilityException));
    const uP = slotUtilityOf(profile, P, slot); const needsOn = eg.needs.length ? eg.needs : null;
    const uPn = needUtilityOf(profile, cfg, P, slot, needsOn);
    let chosen = null;
    for (const reason of c.reasons) {
      let accept; let basis;
      if (reason === 'proteccion_faltas') {
        if (urgentKeep) { kept.push({ jugador: P.id, fila: row.id, preferencia: row.preference, motivo: 'excepción: necesidad urgente', faltas: P.fouls, reduceRiesgo: false }); continue; }
        accept = (u) => u >= uP - pol.foulProtectionSacrifice; basis = 'U'; }
      else if (reason === 'energia_critica') { const t = Math.max(pol.fatigueUtilitySacrifice, rc.criticalUtilitySacrifice); accept = (u) => u >= uP - t; basis = 'U'; }
      else if (reason === 'fatiga') { accept = (u) => u >= uP - pol.fatigueUtilitySacrifice; basis = 'U'; }
      else if (reason === 'necesidad_final' || reason === 'faltas_cierre') { accept = (u, un) => un >= uPn + pol.replacementGain; basis = 'N'; }
      else { accept = (u) => u >= uP + pol.replacementGain; basis = 'U'; } // tramo largo y participación: ruta ordinaria
      const options = ready.map((r) => ({ r, u: slotUtilityOf(profile, r, slot), un: needUtilityOf(profile, cfg, r, slot, needsOn) })).filter((o) => o.r.id !== P.id && accept(o.u, o.un));
      if (!options.length) continue;
      const key = (o) => (basis === 'N' ? o.un : o.u);
      const best = Math.max(...options.map(key));
      const near = options.filter((o) => key(o) >= best - rc.partnerTieMargin);
      const partner = pc?.pair ? near.find((o) => o.r.id === pc.pair) : null;
      near.sort((a, b) => key(b) - key(a) || nominal(a.r, slot) - nominal(b.r, slot) || (a.r.id < b.r.id ? -1 : 1));
      const pick = partner ?? near[0];
      chosen = { reason, pick, basis, uP, uPn }; break;
    }
    if (!chosen) {
      if (row && deleg.fouls && (c.protectRow || c.closingRow || c.acceptRow)) {
        const reduce = c.protectRow && !urgentKeep && row.preference !== 'compare_closing_value';
        kept.push({ jugador: P.id, fila: row.id, preferencia: row.preference, motivo: c.protectRow ? 'recambio insuficiente: la pérdida de utilidad supera la tolerancia de protección o no hay un relevo listo' : 'la comparación de valor no justifica el cambio (se mantiene)', faltas: P.fouls, reduceRiesgo: reduce });
      }
      continue;
    }
    proposals.push({ out: P.id, in: chosen.pick.r.id, slot, reason: chosen.reason, razones: c.reasons, fila: row?.id ?? null, estabilidad: stabilityException ? { excepcion: stabilityException } : { tramoEnPista: Math.round(P.stintSeconds), minimo: pol.minCourtStint },
      utilidad: { saliente: round(uP, 3), entrante: round(chosen.pick.u, 3), ...(chosen.basis === 'N' ? { necesidades: eg.needs, salienteNecesidad: round(chosen.uPn, 3), entranteNecesidad: round(chosen.pick.un, 3) } : {}), escala: '1–30', receta: rc.recipeVersion },
      energia: { saliente: P.energy, entrante: chosen.pick.r.energy }, faltas: P.fouls, socioDelPlan: pc?.pair === chosen.pick.r.id });
  }
  // paquete ordinario: como máximo `ordinaryPackageMax` sustituciones por revisión, sin repetir jugadores
  proposals.sort((a, b) => REASON_ORDER.indexOf(a.reason) - REASON_ORDER.indexOf(b.reason) || SLOTS5.indexOf(a.slot) - SLOTS5.indexOf(b.slot));
  const accepted = [];
  for (const p of proposals) {
    if (accepted.length >= rc.ordinaryPackageMax) { notes.push({ jugador: p.out, motivo: `paquete ordinario completo (${rc.ordinaryPackageMax}): propuesta aplazada`, razon: p.reason }); continue; }
    if (usedIn.has(p.in) || usedOut.has(p.out)) continue;
    usedIn.add(p.in); usedOut.add(p.out); accepted.push(p);
  }
  return { proposals: accepted, kept, notes, endgame: { contextos: eg.active, necesidades: eg.needs } };
}

// ---------------------------------------------------------------- alarma de racha y pausas
// Evidencia pequeña (hasta cuatro ataques recientes de cada equipo) con hechos ya registrados; «evitable» es una categoría fundada en el hecho.
export function runAlarm(view, cfg) {
  const a = cfg.common.runAlarm; const own = view.recent.own.slice(-a.windowAttacks); const opp = view.recent.opp.slice(-a.windowAttacks);
  const sum = (xs, k) => xs.reduce((s, x) => s + (x[k] ?? 0), 0);
  const adverse = sum(opp, 'points') - sum(own, 'points');
  const comfortable = sum(opp, 'comfortable');
  const disorder = sum(own, 'avoidableLosses') + sum(own, 'denialReorganizations') + sum(opp, 'opponentCoordinationFailures');
  const active = own.length > 0 && opp.length > 0 && adverse >= a.adverseMarginPoints && (comfortable >= a.comfortableOpportunities || disorder >= a.disorderIncidents);
  return { active, adverse, comfortable, disorder, ataquesPropios: own.length, ataquesRivales: opp.length, umbrales: { parcial: a.adverseMarginPoints, comodas: a.comfortableOpportunities, desorden: a.disorderIncidents } };
}

// Causas declaradas que se cumplen ahora (en el orden de evaluación del perfil). Sirve a la decisión y a la revalidación de una solicitud pendiente.
export function timeoutCauses(view, cfg, recognized, mem) {
  const pol = cfg.policies[view.own.policy]; const tc = cfg.timeouts;
  const order = tc.reasons; const cr = tc.contextualRest; // orden de evaluación y umbrales de descanso: la tabla de causas se evalúa completa
  const reasons = [];
  const m = view.score.margin; const s = view.clock.remainingSeconds;
  if (view.clock.lastPeriod && s <= tc.prepareAction.secondsMax && m <= 0 && -m <= tc.prepareAction.deficitMax && view.possession.next === 'own') reasons.push({ code: 'prepareAction', evidence: { segundos: s, diferencia: m, saque_o_posesion: 'propia' } });
  const ra = runAlarm(view, cfg);
  if (ra.active) reasons.push({ code: 'runWithDisorder', evidence: ra });
  const rp = (recognized ?? []).find((r) => r.evidence >= tc.repeatedDefensiveProblem.minEvidence && r.comfortableShare >= mem.recognition.minComfortableShare);
  if (rp) reasons.push({ code: 'repeatedDefensiveProblem', evidence: { patron: rp.key, evidencia: round(rp.evidence, 3), cómodas: round(rp.comfortableShare, 3) } });
  const lostDirector = view.own.players.find((p) => p.id === view.own.directorPriority[0]);
  const recentMand = view.own.mandatoryRecent ?? 0;
  if ((lostDirector && !lostDirector.available) || recentMand >= tc.reorganize.mandatorySubstitutionsMin) reasons.push({ code: 'reorganize', evidence: { directorPrincipalFuera: !!(lostDirector && !lostDirector.available), sustitucionesObligatoriasRecientes: recentMand } });
  const on = view.own.players.filter((p) => p.onCourt && p.available);
  const tired = on.filter((p) => p.energy <= pol.energyReview).length; const mean = on.reduce((x, p) => x + p.energy, 0) / (on.length || 1);
  if (tired >= cr.minPlayersAtOrBelowReview && mean <= cr.meanEnergyMax) reasons.push({ code: 'contextualRest', evidence: { energiaMediaEnPista: round(mean, 1), jugadoresEnRevision: tired } });
  return reasons.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
}

export function decideTimeout(view, cfg, recognized, mem) {
  const pol = cfg.policies[view.own.policy]; const tc = cfg.timeouts; const ts = view.timeouts; const eg = endgameState(view, cfg, pol); const s = view.clock.remainingSeconds;
  const none = (motivo) => ({ none: motivo });
  if (!ts) return none('el perfil no define tiempos muertos');
  if (ts.pending) return none('ya hay una solicitud vigente (no se pide una segunda pausa por el mismo problema)');
  if (ts.effective <= 0) return none(`sin tiempo muerto disponible (${ts.reason ?? 'cupo agotado'})`);
  const reasons = timeoutCauses(view, cfg, recognized, mem);
  if (!reasons.length) return none('ninguna causa declarada se cumple');
  const rejected = [];
  for (const r of reasons) {
    const urgent = tc.urgentReasons.includes(r.code);
    const inClosing = view.clock.lastPeriod && s <= pol.closingWindow;
    const sinceLast = ts.lastGrantedSecondsAgo;
    const prepFinal = r.code === 'prepareAction';
    const newUrgent = urgent && ts.lastReason !== r.code;
    if (sinceLast != null && sinceLast < pol.timeoutCooldown && !(prepFinal || newUrgent)) { rejected.push({ causa: r.code, motivo: `cooldown: faltan ${Math.ceil(pol.timeoutCooldown - sinceLast)} s desde la última pausa propia` }); continue; }
    if (ts.effective <= pol.timeoutReserve && !inClosing && !urgent) { rejected.push({ causa: r.code, motivo: `reserva: se intenta conservar ${pol.timeoutReserve} pausa(s) para el cierre` }); continue; }
    return { reason: r.code, evidence: r.evidence, urgent, cooldownException: sinceLast != null && sinceLast < pol.timeoutCooldown ? (prepFinal ? 'preparación final necesaria' : 'causa nueva urgente') : null, reserveUse: ts.effective <= pol.timeoutReserve ? (inClosing ? 'cierre' : 'necesidad urgente') : null, rechazadas: rejected, finales: eg.active };
  }
  return { none: 'cooldown o reserva', rechazadas: rejected };
}

// ---------------------------------------------------------------- finales: prioridades por contexto sobre el mismo motor
// Cada contexto reclama dimensiones (ataque, defensa, falta táctica, llamada); gana la de mayor prioridad que la define.
export function decideEndgame(view, cfg) {
  const pol = cfg.policies[view.own.policy]; const eg = endgameState(view, cfg, pol); const out = { contexts: eg.active, offense: null, defense: null, tacticalFoul: null, call: null };
  const m = view.score.margin; const s = view.clock.remainingSeconds;
  for (const c of eg.contexts) {
    if (Object.keys(c.offenseStyles).length && !out.offense) out.offense = { context: c.id, styles: { ...c.offenseStyles } };
    if (Object.keys(c.defenseStyles).length && !out.defense && m > 0 && m <= c.defenseWhenLeadAtMost) out.defense = { context: c.id, defStyles: { ...c.defenseStyles } };
  }
  // falta táctica para detener el reloj: equipo por detrás, tramo urgente habilitado, posesión rival y posibilidad real de contacto
  const tf = eg.contexts.find((c) => c.tacticalFoul);
  const win = view.clock.lastPeriod ? cfg.endgame.stopClockWindows.find((w) => -m >= w.deficitMin && s <= w.secondsMax) : null;
  if ((tf || win) && -m >= 1 && (view.possession.holder === 'opp' || view.possession.next === 'opp') && s > 0 && view.own.players.some((p) => p.onCourt && p.available)) {
    out.tacticalFoul = { context: tf?.id ?? 'stopClock', ventana: win ?? null, bonusRival: view.bonus.rivalShootsOnOurFoul ? 'el rival tira en bonus (dos libres)' : 'sin bonus del rival (saque tras la falta)', faltasColectivasPropias: view.teamFouls.own, segundos: s };
  }
  const la = cfg.endgame.lastAction; const c = eg.contexts.find((x) => x.call);
  if (c && view.clock.lastPeriod && s <= la.secondsMax && m <= 0 && -m <= la.deficitMax && (view.possession.holder === 'own' || view.possession.next === 'own')) out.call = { context: c.id, segundos: s, diferencia: m };
  return out;
}

// ---------------------------------------------------------------- respuestas de memoria (MEM03): candidatas ordenadas, sin tocar el plan
// Devuelve, por patrón reconocido, la lista de candidatas con la compatibilidad que se puede comprobar solo con la vista (bloqueos, vigencia de
// lo específico, ya vigente). La validez conjunta del plan (cobertura admitida, referencias reales) la comprueba `coach.js` con la validación de órdenes.
export function memoryProposals(view, cfg, mem) {
  const pol = cfg.policies[view.own.policy]; const out = [];
  for (const e of view.own.memory) {
    if (e.evidence < pol.recognitionThreshold) continue;
    const pattern = mem.patterns.find((p) => p.id === e.pattern);
    const reco = { key: e.key, pattern: e.pattern, evidence: e.evidence, comfortableShare: e.comfortableShare, threshold: pol.recognitionThreshold, specific: e.specific };
    if (e.comfortableShare < mem.recognition.minComfortableShare) { out.push({ ...reco, outcome: 'reconocido_sin_respuesta', causa: `la oportunidad concedida no fue cómoda en la proporción mínima (${round(e.comfortableShare, 2)} < ${mem.recognition.minComfortableShare}): la defensa ya contiene el patrón` }); continue; }
    if (!pattern) { out.push({ ...reco, outcome: 'reconocido_sin_respuesta', causa: 'patrón reconocido sin respuesta declarada en el catálogo' }); continue; }
    const cands = mem.responses.filter((r) => r.pattern === pattern.id).sort((a, b) => a.priority - b.priority);
    out.push({ ...reco, outcome: 'candidatas', patternName: pattern.name, candidates: cands });
  }
  return out;
}
