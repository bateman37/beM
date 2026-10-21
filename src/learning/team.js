// Estado de aprendizaje de una INSTANCIA de equipo, propuestas (vista previa), aplicación idempotente y deshacer (MOTOR-18 §8). Puro: devuelve estados nuevos y recibos; nunca escribe.
// El libro de aplicaciones (`ledger`) vive FUERA del núcleo deportivo: el llamante lo persiste (laboratorio hoy; manager después). No toca capacidades, edad, cuerpo, energía ni forma.
import { DOMAINS, BLOCK_FIELD, keyOf, parseKey, idsOf, isLegacyNeutral, entryOf, fingerprintOf, validateKnowledgeBlock } from '../knowledge/model.js';
import { factorsFor, learnClosed, retainBlock, rateOf, thresholdOf } from './core.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const newLedger = (day) => ({ day, training: { hours: 0, doses: {} }, match: { used: {}, doses: {} }, practice: {} });
export const teamFingerprint = (state) => fingerprintOf({ instanceId: state.instanceId, day: state.day, coach: state.coach, players: state.players });
export const sourceIdOf = ({ source, batch = null, attempt = null, teamInstance }) => [source, batch, attempt, teamInstance].filter((x) => x != null).join('|');

// players: { pid: { block, tacticalLearning } }; coach: { teaching, tacticalMastery:{módulo:nivel} }. Todos los bloques explícitos deben estar evaluados el mismo `day`.
export function createTeamState({ instanceId, players, coach, day }, params) {
  const errors = [];
  const { min, max } = params.range;
  const inRange = (v) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
  if (!inRange(coach?.teaching)) errors.push({ path: 'coach.teaching', message: `la capacidad de enseñanza es un número entre ${min} y ${max}` });
  for (const id of idsOf('tactic', params)) if (!inRange(coach?.tacticalMastery?.[id])) errors.push({ path: `coach.tacticalMastery.${id}`, message: `falta o fuera de rango ${min}-${max}` });
  const out = {};
  for (const [pid, p] of Object.entries(players)) {
    if (!inRange(p.tacticalLearning)) errors.push({ path: `players.${pid}.tacticalLearning`, message: `la Polivalencia es un número entre ${min} y ${max}` });
    for (const e of validateKnowledgeBlock(p.block, params)) errors.push({ path: `players.${pid}.${e.path}`, message: e.message });
    if (!isLegacyNeutral(p.block) && p.block.asOfDay !== day) errors.push({ path: `players.${pid}.knowledge.asOfDay`, message: `el bloque está evaluado el día ${p.block.asOfDay}, no el día ${day} del equipo` });
    out[pid] = { block: clone(p.block), tacticalLearning: p.tacticalLearning, ledger: newLedger(day), closedDays: [] };
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, state: { schema: 'beM-learning-team/1', learningVersion: params.learningVersion, instanceId, day, coach: clone(coach), players: out } };
}

// Avanza el reloj del equipo: cierra el recibo del día de cada jugador y aplica el desuso en bloque. No hay desuso si destDay == day.
export function advanceTeam(state, destDay, params) {
  if (!Number.isInteger(destDay) || destDay < state.day) return { ok: false, errors: [{ path: 'day', message: `día destino ${destDay} anterior al día evaluado ${state.day}` }] };
  if (destDay === state.day) return { ok: true, state, changes: {} };
  const next = clone(state); const changes = {};
  for (const [pid, ps] of Object.entries(next.players)) {
    ps.closedDays.push({ day: ps.ledger.day, training: ps.ledger.training, match: ps.ledger.match });
    const r = retainBlock(ps.block, destDay, params); ps.block = r.block; changes[pid] = r.changes; ps.ledger = newLedger(destDay);
  }
  next.day = destDay;
  return { ok: true, state: next, changes };
}

// Aplica un conjunto de dosis (training|match) a un jugador en el día actual del estado. La transferencia usa el conocimiento previo a esta transacción.
function learnPlayer(ps, doseList, coach, day, params) {
  if (isLegacyNeutral(ps.block)) return { ps, targets: [], skipped: 'sin historial de aprendizaje; compatibilidad neutra' };
  const before = ps.block; const block = clone(before); const ledger = clone(ps.ledger); const agg = {};
  for (const d of doseList) { if (!(d.dose > 0)) continue; agg[d.key] = (agg[d.key] ?? 0) + d.dose; const bucket = d.origin === 'match' ? ledger.match.doses : ledger.training.doses; bucket[d.key] = (bucket[d.key] ?? 0) + d.dose; ledger.practice[d.key] = (ledger.practice[d.key] ?? 0) + d.dose; }
  const targets = [];
  for (const [key, dose] of Object.entries(agg).sort()) {
    const { domain, id } = parseKey(key); const e0 = entryOf(before, domain, id);
    if (!e0) throw new Error(`objetivo ajeno al catálogo: ${key}`);
    const factors = factorsFor({ domain, id, block: before, tacticalLearning: ps.tacticalLearning, coach, params });
    const r = learnClosed({ level: e0.level, peak: e0.peak, dose, rate: rateOf(domain, params), F: factors.product, params });
    const e = block[BLOCK_FIELD[domain]][id]; e.level = r.level; e.peak = r.peak;
    const renewed = ledger.practice[key] >= thresholdOf(domain, params); if (renewed) e.lastPracticeDay = day;
    targets.push({ key, dose, rate: rateOf(domain, params), factors, G: r.G, acceleratedDose: r.acceleratedDose, normalDose: r.normalDose, before: { level: e0.level, peak: e0.peak, lastPracticeDay: e0.lastPracticeDay }, after: { level: e.level, peak: e.peak, lastPracticeDay: e.lastPracticeDay }, practiceAggregatedToday: ledger.practice[key], practiceRenewed: renewed });
  }
  return { ps: { ...ps, block, ledger }, targets };
}

const finish = (state, next, meta) => ({ ok: true, kind: 'proposal', ...meta, teamInstance: state.instanceId, prevFingerprint: teamFingerprint(state), nextFingerprint: teamFingerprint(next), prevDay: state.day, day: next.day, paramsVersion: next.learningVersion, nextState: next });

// Sesión de laboratorio (§8.2, §9.2). session = { source_id, idleDays (0–3650), onlyIdle, collectiveFocus: módulo|null, shares:{collective,individual}, players:{pid:{hours, individualFocus:{domain,id}|null}} }.
// «Dejar transcurrir N días y entrenar»: primero desuso hasta el día destino y después UNA sesión de ese día. «Solo desuso»: sin sesión ni horas.
export function proposeFromSession(state, session, params) {
  const L = params.learning.session; const errors = [];
  const idle = session.idleDays ?? 0;
  if (!Number.isInteger(idle) || idle < 0 || idle > L.maxIdleDays) return { ok: false, errors: [{ path: 'idleDays', message: `los días sin práctica son un entero entre 0 y ${L.maxIdleDays}` }] };
  const sh = session.shares ?? { collective: L.collectiveShare, individual: L.individualShare };
  if (!session.onlyIdle && Math.abs(sh.collective + sh.individual - 1) > 1e-9) errors.push({ path: 'shares', message: 'el reparto colectivo + individual debe sumar 1' });
  if (!session.onlyIdle && session.collectiveFocus != null && !idsOf('tactic', params).includes(session.collectiveFocus)) errors.push({ path: 'collectiveFocus', message: `módulo ${session.collectiveFocus} ajeno al catálogo` });
  if (!session.onlyIdle) for (const [pid, p] of Object.entries(session.players ?? {})) {
    if (!state.players[pid]) errors.push({ path: `players.${pid}`, message: 'jugador ajeno a la instancia del equipo' });
    if (!(p.hours >= L.minHoursPerPlayerDay && p.hours <= L.maxHoursPerPlayerDay)) errors.push({ path: `players.${pid}.hours`, message: `las horas de sesión van de ${L.minHoursPerPlayerDay} a ${L.maxHoursPerPlayerDay}` });
    const f = p.individualFocus; if (f && (f.domain === 'tactic' || !DOMAINS.includes(f.domain) || !idsOf(f.domain, params).includes(f.id))) errors.push({ path: `players.${pid}.individualFocus`, message: 'el foco individual es una posición o un rol ofensivo/defensivo del catálogo' });
  }
  if (errors.length) return { ok: false, errors };
  const adv = advanceTeam(state, state.day + idle, params); if (!adv.ok) return adv;
  let next = clone(adv.state); const players = {};
  for (const pid of Object.keys(next.players)) players[pid] = { idle: adv.changes?.[pid] ?? [], targets: [], hours: null };
  if (!session.onlyIdle) for (const [pid, p] of Object.entries(session.players ?? {})) {
    const ps = next.players[pid]; const remaining = Math.max(0, L.maxHoursPerPlayerDay - ps.ledger.training.hours); const used = Math.min(p.hours, remaining);
    const cDose = session.collectiveFocus != null ? used * sh.collective : 0; const iDose = p.individualFocus ? used * sh.individual : 0;
    const list = [];
    if (cDose > 0) list.push({ key: keyOf('tactic', session.collectiveFocus), dose: cDose, origin: 'training' });
    if (iDose > 0) list.push({ key: keyOf(p.individualFocus.domain, p.individualFocus.id), dose: iDose, origin: 'training' });
    const r = learnPlayer(ps, list, next.coach, next.day, params);
    const ps2 = r.ps; ps2.ledger.training.hours += used; next.players[pid] = ps2;
    players[pid] = { ...players[pid], targets: r.targets, skipped: r.skipped ?? null, hours: { requested: p.hours, used, clampedByDailyBudget: used < p.hours, budgetAfter: ps2.ledger.training.hours, unusedCollective: session.collectiveFocus != null ? 0 : used * sh.collective, unusedIndividual: p.individualFocus ? 0 : used * sh.individual } };
  }
  return finish(state, next, { source_id: session.source_id, mode: session.onlyIdle ? 'solo-desuso' : 'sesion', session: { idleDays: idle, collectiveFocus: session.collectiveFocus ?? null, shares: sh }, players });
}
export const evaluateSession = proposeFromSession; // vista previa: misma función, nada se escribe hasta applyProposal

// Dosis de un encuentro terminado (§8.3). exposure = { match:{source_id,…}, players:{pid:{liveTenths, positions:{PG:décimas}, offensiveRoles:{}, defensiveRoles:{}, modules:{id:crédito}}} }.
// Por dominio: min(minutosVivos/40, 1), repartido por minutos reales (posición, roles) o por exposición ponderada (módulos). Presupuesto de experiencia: máx. 1 por jugador, dominio y día.
export function proposeFromMatch(state, exposure, params, { source_id = exposure.match?.source_id, day = state.day } = {}) {
  if (!source_id) return { ok: false, errors: [{ path: 'source_id', message: 'la fuente del partido necesita un identificador global (fuente|lote|intento|instancia)' }] };
  const adv = advanceTeam(state, day, params); if (!adv.ok) return adv;
  const next = clone(adv.state); const players = {}; const M = params.learning.match;
  for (const [pid, x] of Object.entries(exposure.players ?? {})) {
    const ps = next.players[pid]; if (!ps) continue;
    const full = Math.min((x.liveTenths ?? 0) / 600 / M.liveMinutesForFullDose, 1); const list = []; const budgets = {};
    const spread = (domain, weights) => {
      const total = Object.values(weights ?? {}).reduce((a, b) => a + b, 0); const used = ps.ledger.match.used[domain] ?? 0;
      const allowed = Math.max(0, Math.min(full, M.domainBudgetPerDay - used)); budgets[domain] = { requested: full, allowed, usedBefore: used, cap: M.domainBudgetPerDay, exposureTotal: total };
      if (!(total > 0) || !(allowed > 0)) return;
      ps.ledger.match.used[domain] = used + allowed;
      for (const [id, w] of Object.entries(weights)) if (w > 0) list.push({ key: keyOf(domain, id), dose: allowed * (w / total), origin: 'match' });
    };
    spread('position', x.positions); spread('offensiveRole', x.offensiveRoles); spread('defensiveRole', x.defensiveRoles); spread('tactic', x.modules);
    const r = learnPlayer(ps, list, next.coach, next.day, params);
    next.players[pid] = r.ps;
    players[pid] = { targets: r.targets, skipped: r.skipped ?? null, liveMinutes: (x.liveTenths ?? 0) / 600, budgets, idle: adv.changes?.[pid] ?? [] };
  }
  return finish(state, next, { source_id, mode: 'partido', players });
}

// ---------------------------------------------------------------- libro de aplicaciones (fuera del núcleo deportivo)
export const createLedger = () => ({ schema: 'beM-learning-ledger/1', applications: [] });
export function applyProposal(state, ledger, proposal) {
  if (!proposal?.ok || proposal.kind !== 'proposal') return { ok: false, reason: 'la propuesta no es válida' };
  if (proposal.teamInstance !== state.instanceId) return { ok: false, reason: `la propuesta es de la instancia ${proposal.teamInstance}, no de ${state.instanceId}` };
  const dup = ledger.applications.find((a) => a.source_id === proposal.source_id && a.teamInstance === proposal.teamInstance && a.status === 'aplicada');
  if (dup) return { ok: false, reason: `la fuente ${proposal.source_id} ya se aplicó a la instancia ${proposal.teamInstance} (${dup.id})`, duplicateOf: dup.id };
  if (teamFingerprint(state) !== proposal.prevFingerprint) return { ok: false, reason: 'el estado actual ya no coincide con el que se previsualizó (huella previa distinta)' };
  const id = `APL-${ledger.applications.length + 1}`;
  const rec = { id, source_id: proposal.source_id, teamInstance: proposal.teamInstance, status: 'aplicada', mode: proposal.mode, prevFingerprint: proposal.prevFingerprint, nextFingerprint: proposal.nextFingerprint, prevDay: proposal.prevDay, day: proposal.day, prevState: clone(state), kind: 'aplicacion' };
  return { ok: true, state: proposal.nextState, ledger: { ...ledger, applications: [...ledger.applications, rec] }, receipt: { application: id, source_id: proposal.source_id, prevFingerprint: proposal.prevFingerprint, nextFingerprint: proposal.nextFingerprint, players: proposal.players } };
}
// Restaura el estado previo a la aplicación (conocimiento, peak, reloj y presupuestos). Solo si es la última aplicación vigente. La restauración queda identificada y la fuente deja de estar vigente.
export function undoApplication(state, ledger, applicationId) {
  const rec = ledger.applications.find((a) => a.id === applicationId);
  if (!rec) return { ok: false, reason: 'aplicación desconocida' };
  if (rec.status !== 'aplicada') return { ok: false, reason: 'la aplicación ya estaba revertida' };
  if (teamFingerprint(state) !== rec.nextFingerprint) return { ok: false, reason: 'hay cambios posteriores a esa aplicación; se deshacen en orden inverso' };
  const restoreId = `RST-${ledger.applications.length + 1}`;
  const applications = ledger.applications.map((a) => (a.id === applicationId ? { ...a, status: 'revertida', revertedBy: restoreId } : a));
  applications.push({ id: restoreId, kind: 'restauracion', of: applicationId, source_id: rec.source_id, teamInstance: rec.teamInstance, status: 'restauracion', prevFingerprint: rec.nextFingerprint, nextFingerprint: rec.prevFingerprint });
  return { ok: true, state: clone(rec.prevState), ledger: { ...ledger, applications }, receipt: { restored: applicationId, restoration: restoreId } };
}
