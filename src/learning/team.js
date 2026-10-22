// Estado de aprendizaje de una INSTANCIA de equipo, propuestas (vista previa), aplicación idempotente y deshacer (MOTOR-18 §8). Puro: devuelve estados nuevos y recibos; nunca escribe.
// El libro de aplicaciones (`ledger`) vive FUERA del núcleo deportivo: el llamante lo persiste (laboratorio hoy; manager después). No toca capacidades, edad, cuerpo, energía ni forma.
import { DOMAINS, BLOCK_FIELD, keyOf, parseKey, idsOf, isLegacyNeutral, entryOf, fingerprintOf, validateKnowledgeBlock, playerFactorModel } from '../knowledge/model.js';
import { factorsFor, learnClosed, retainBlock, rateOf, thresholdOf } from './core.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const newLedger = (day) => ({ day, training: { hours: 0, doses: {} }, match: { used: {}, doses: {} }, practice: {} });
export const teamFingerprint = (state) => fingerprintOf({ instanceId: state.instanceId, day: state.day, coach: state.coach, players: state.players });
// MOTOR-18B (R05): una vista previa queda vinculada a la versión y a la huella de los parámetros EFECTIVOS que la produjeron (incluida la curva de Polivalencia). Si cambian antes de aplicar, la propuesta se invalida.
export const learningParamsFingerprint = (params) => fingerprintOf({ knowledgeVersion: params.knowledgeVersion, learningVersion: params.learningVersion, range: params.range, learning: params.learning, retention: params.retention, transfer: params.transfer });
export function playerCurveOf(params) {
  const f = params.learning.factors.player; const model = playerFactorModel(f);
  return model === 'piecewise-linear' ? { model, points: f.points.map((p) => ({ level: p.level, factor: p.factor })) } : { model, base: f.base, slope: f.slope };
}
const finiteIn = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
const SHARE_TOLERANCE = 1e-9; // tolerancia documentada del reparto colectivo + individual = 1
// Rasgos que consume el aprendizaje (Polivalencia de los jugadores implicados, enseñanza del entrenador): un valor ausente o no finito es un rechazo localizado, nunca un 16 silencioso.
function traitErrors(state, pids, params, modules = []) {
  const errors = []; const { min, max } = params.range;
  if (!finiteIn(state.coach?.teaching, min, max)) errors.push({ path: 'coach.teaching', message: `la enseñanza del entrenador es un número entre ${min} y ${max}` });
  for (const m of modules) if (!finiteIn(state.coach?.tacticalMastery?.[m], min, max)) errors.push({ path: `coach.tacticalMastery.${m}`, message: `la competencia del entrenador en ${m} es un número entre ${min} y ${max}` });
  for (const pid of pids) if (state.players[pid] && !finiteIn(state.players[pid].tacticalLearning, min, max)) errors.push({ path: `players.${pid}.tacticalLearning`, message: `la Polivalencia es un número finito entre ${min} y ${max}` });
  return errors;
}
// Adopta la versión de aprendizaje de los parámetros efectivos sin reconstruir el equipo: conserva conocimiento, peak, reloj, presupuestos y registros. Es una conversión técnica de metadatos y queda anotada.
export function adoptLearningParams(state, params) {
  if (state.learningVersion === params.learningVersion) return { state, adopted: false };
  const next = clone(state); next.adoptedFrom = [...(state.adoptedFrom ?? []), { from: state.learningVersion, to: params.learningVersion, day: state.day, note: 'conversión técnica de metadatos: conocimiento, peak, reloj, presupuestos y registro intactos' }];
  next.learningVersion = params.learningVersion;
  return { state: next, adopted: true };
}
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

const finish = (state, next, meta, params) => ({ ok: true, kind: 'proposal', ...meta, teamInstance: state.instanceId, prevFingerprint: teamFingerprint(state), nextFingerprint: teamFingerprint(next), prevDay: state.day, day: next.day, paramsVersion: params.learningVersion, paramsFingerprint: learningParamsFingerprint(params), playerCurve: playerCurveOf(params), nextState: next });

// Sesión de laboratorio (§8.2, §9.2). session = { source_id, idleDays (0–3650), onlyIdle, collectiveFocus: módulo|null, shares:{collective,individual}, players:{pid:{hours, individualFocus:{domain,id}|null}} }.
// «Dejar transcurrir N días y entrenar»: primero desuso hasta el día destino y después UNA sesión de ese día. «Solo desuso»: sin sesión ni horas.
export function proposeFromSession(state, session, params) {
  const L = params.learning.session; const errors = [];
  if (typeof session.source_id !== 'string' || !session.source_id.trim()) return { ok: false, errors: [{ path: 'source_id', message: 'la fuente de la sesión necesita un identificador no vacío (copia|equipo|secuencia de sesión)' }] };
  const idle = session.idleDays ?? 0;
  if (!Number.isInteger(idle) || idle < 0 || idle > L.maxIdleDays) return { ok: false, errors: [{ path: 'idleDays', message: `los días sin práctica son un entero entre 0 y ${L.maxIdleDays}` }] };
  const sh = session.shares ?? { collective: L.collectiveShare, individual: L.individualShare };
  if (!session.onlyIdle) {
    if (!finiteIn(sh.collective, 0, 1) || !finiteIn(sh.individual, 0, 1)) errors.push({ path: 'shares', message: 'el reparto colectivo e individual son números finitos entre 0 y 1' });
    else if (Math.abs(sh.collective + sh.individual - 1) > SHARE_TOLERANCE) errors.push({ path: 'shares', message: `el reparto colectivo + individual debe sumar 1 (tolerancia ${SHARE_TOLERANCE})` });
    if (!Object.keys(session.players ?? {}).length) errors.push({ path: 'players', message: 'la sesión necesita al menos un jugador (una sesión vacía no es una dosis cero válida)' });
  }
  if (!session.onlyIdle && session.collectiveFocus != null && !idsOf('tactic', params).includes(session.collectiveFocus)) errors.push({ path: 'collectiveFocus', message: `módulo ${session.collectiveFocus} ajeno al catálogo` });
  if (!session.onlyIdle) for (const [pid, p] of Object.entries(session.players ?? {})) {
    if (!state.players[pid]) errors.push({ path: `players.${pid}`, message: 'jugador ajeno a la instancia del equipo' });
    if (!(typeof p.hours === 'number' && Number.isFinite(p.hours) && p.hours >= L.minHoursPerPlayerDay && p.hours <= L.maxHoursPerPlayerDay)) errors.push({ path: `players.${pid}.hours`, message: `las horas de sesión van de ${L.minHoursPerPlayerDay} a ${L.maxHoursPerPlayerDay}` });
    const f = p.individualFocus; if (f && (f.domain === 'tactic' || !DOMAINS.includes(f.domain) || !idsOf(f.domain, params).includes(f.id))) errors.push({ path: `players.${pid}.individualFocus`, message: 'el foco individual es una posición o un rol ofensivo/defensivo del catálogo' });
  }
  if (!session.onlyIdle && !errors.length) errors.push(...traitErrors(state, Object.keys(session.players ?? {}), params, session.collectiveFocus != null ? [session.collectiveFocus] : []));
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
  return finish(state, next, { source_id: session.source_id, mode: session.onlyIdle ? 'solo-desuso' : 'sesion', session: { idleDays: idle, collectiveFocus: session.collectiveFocus ?? null, shares: sh }, players }, params);
}
export const evaluateSession = proposeFromSession; // vista previa: misma función, nada se escribe hasta applyProposal

// MOTOR-18B (R04/R05): el aprendizaje normal de partido exige una exposición TERMINADA (`complete === true`), una fuente global y datos numéricamente válidos. Una exposición parcial puede consultarse como parcial,
// pero no se transforma en experiencia aplicable. El bloque puede traer a los dos equipos: solo se validan los jugadores de la instancia; el rival legítimo no se confunde con un jugador propio.
export function exposureErrors(state, exposure, params) {
  const errors = []; const add = (path, message) => errors.push({ path, message });
  if (exposure == null || typeof exposure !== 'object') return [{ path: 'exposure', message: 'exposición ausente' }];
  if (exposure.complete !== true) add('exposure.complete', exposure.complete === false ? 'la exposición es parcial (encuentro no terminado): no es experiencia aplicable' : 'la exposición no declara `complete: true`: no se supone un encuentro terminado');
  if (exposure.status != null && exposure.status !== 'finished') add('exposure.status', `el estado declarado del encuentro es «${exposure.status}», no «finished»`);
  if (exposure.players == null || typeof exposure.players !== 'object') { add('exposure.players', 'faltan los datos de exposición por jugador'); return errors; }
  const teams = exposure.match?.teams; if (Array.isArray(teams) && !teams.includes(state.instanceId)) add('exposure.match.teams', `la exposición es de ${teams.join('/')}, no de la instancia ${state.instanceId}`);
  const own = Object.keys(exposure.players).filter((pid) => state.players[pid]);
  if (!own.length && !errors.length) add('exposure.players', `la exposición no contiene jugadores de la instancia ${state.instanceId}`);
  const num = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  for (const pid of own) {
    const x = exposure.players[pid]; const base = `exposure.players.${pid}`;
    if (x == null || typeof x !== 'object') { add(base, 'datos de exposición ausentes'); continue; }
    if (!num(x.liveTenths)) add(`${base}.liveTenths`, 'el tiempo vivo (décimas de segundo) es un número finito no negativo');
    for (const [domain, field] of [['position', 'positions'], ['offensiveRole', 'offensiveRoles'], ['defensiveRole', 'defensiveRoles'], ['tactic', 'modules']]) {
      const obj = x[field]; if (obj == null) { add(`${base}.${field}`, 'falta el apartado de exposición'); continue; }
      const ids = idsOf(domain, params); let total = 0;
      for (const [id, v] of Object.entries(obj)) { if (!ids.includes(id)) add(`${base}.${field}.${id}`, 'identificador ajeno al catálogo'); if (!num(v)) add(`${base}.${field}.${id}`, 'el valor es un número finito no negativo'); else total += v; }
      if (field !== 'modules' && num(x.liveTenths) && total > x.liveTenths + 1e-6) add(`${base}.${field}`, `la suma (${total}) supera el tiempo vivo (${x.liveTenths}) del jugador`);
    }
  }
  return errors;
}

// Dosis de un encuentro terminado (§8.3). exposure = { match:{source_id,…}, players:{pid:{liveTenths, positions:{PG:décimas}, offensiveRoles:{}, defensiveRoles:{}, modules:{id:crédito}}} }.
// Por dominio: min(minutosVivos/40, 1), repartido por minutos reales (posición, roles) o por exposición ponderada (módulos). Presupuesto de experiencia: máx. 1 por jugador, dominio y día.
export function proposeFromMatch(state, exposure, params, { source_id = exposure?.match?.source_id, day = state.day } = {}) {
  if (typeof source_id !== 'string' || !source_id.trim()) return { ok: false, errors: [{ path: 'source_id', message: 'la fuente del partido necesita un identificador global (fuente|lote|intento|instancia)' }] };
  const bad = exposureErrors(state, exposure, params); if (bad.length) return { ok: false, errors: bad };
  const traits = traitErrors(state, Object.keys(exposure.players).filter((pid) => state.players[pid]), params); if (traits.length) return { ok: false, errors: traits };
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
  return finish(state, next, { source_id, mode: 'partido', players }, params);
}

// ---------------------------------------------------------------- libro de aplicaciones (fuera del núcleo deportivo)
export const createLedger = () => ({ schema: 'beM-learning-ledger/1', applications: [] });
export function applyProposal(state, ledger, proposal, params = null) {
  if (!proposal?.ok || proposal.kind !== 'proposal') return { ok: false, reason: 'la propuesta no es válida' };
  if (params && proposal.paramsFingerprint && learningParamsFingerprint(params) !== proposal.paramsFingerprint) return { ok: false, reason: 'los parámetros de aprendizaje efectivos cambiaron desde la vista previa (curva de Polivalencia, tasas o retención): hace falta una vista previa nueva' };
  if (proposal.teamInstance !== state.instanceId) return { ok: false, reason: `la propuesta es de la instancia ${proposal.teamInstance}, no de ${state.instanceId}` };
  const dup = ledger.applications.find((a) => a.source_id === proposal.source_id && a.teamInstance === proposal.teamInstance && a.status === 'aplicada');
  if (dup) return { ok: false, reason: `la fuente ${proposal.source_id} ya se aplicó a la instancia ${proposal.teamInstance} (${dup.id})`, duplicateOf: dup.id };
  if (teamFingerprint(state) !== proposal.prevFingerprint) return { ok: false, reason: 'el estado actual ya no coincide con el que se previsualizó (huella previa distinta)' };
  const id = `APL-${ledger.applications.length + 1}`;
  const rec = { id, source_id: proposal.source_id, teamInstance: proposal.teamInstance, status: 'aplicada', mode: proposal.mode, prevFingerprint: proposal.prevFingerprint, nextFingerprint: proposal.nextFingerprint, prevDay: proposal.prevDay, day: proposal.day, paramsFingerprint: proposal.paramsFingerprint ?? null, paramsVersion: proposal.paramsVersion ?? null, playerCurve: proposal.playerCurve ?? null, prevState: clone(state), kind: 'aplicacion' };
  return { ok: true, state: proposal.nextState, ledger: { ...ledger, applications: [...ledger.applications, rec] }, receipt: { application: id, source_id: proposal.source_id, prevFingerprint: proposal.prevFingerprint, nextFingerprint: proposal.nextFingerprint, paramsFingerprint: proposal.paramsFingerprint ?? null, playerCurve: proposal.playerCurve ?? null, players: proposal.players } };
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
