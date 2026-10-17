// Fachada del motor para el futuro manager (MOTOR-14 §12). Módulo de aplicación (no un servicio HTTP ni un SDK): envuelve el núcleo existente sin duplicarlo ni cambiar el orden deportivo.
// Sin navegador, DOM, almacenamiento del navegador, reloj de pared ni perfil global mutable: cada encuentro posee su generador, su memoria, sus perfiles congelados y el estado de sus entrenadores.
// Dos encuentros alternados en el mismo proceso son independientes (se comprueba en tests/motor14.test.js). Todas las consultas son lecturas sin efectos deportivos.
import { createMatch, buildResult, validateInput, buildMatchInput, deepCopy, ENGINE_VERSION, EXPORT_SCHEMA, ownStateView, rivalPublicView, diagnosticView } from '../match/index.js';
import { snapshotMatch, restoreMatch, validateSnapshot } from '../match/snapshot.js';
import { missingRequired } from '../profiles/rows.js';
import { analyze } from '../analysis/index.js';
import { trajectoryFingerprint, inputFingerprint, profileSportFingerprint } from '../batch/fingerprint.js';
import { retargetTeam } from '../population/ids.js';

export const ENGINE_CONTRACT = 'beM-engine-contract/1';
export { ENGINE_VERSION, EXPORT_SCHEMA, buildMatchInput, retargetTeam };

// Fronteras que `advance` sabe alcanzar. «step» = una operación/acontecimiento resuelto (la frontera atómica del núcleo).
export const BOUNDARIES = ['step', 'possession', 'period', 'end'];
export const AUDIENCES = ['public', 'own', 'diagnostic'];

// ------------------------------------------------------------------------------------------------ validar entradas
// IN01 (plantillas, capacidades, cuerpo, tendencias y estados iniciales), IN02 (planes) e IN03 (semilla, importancia, perfil) viajan en una sola `input` + `profile`. No se inventa ningún dato requerido:
// un valor ausente es un error localizado. Los neutrales (energía completa, Forma 0…) solo se aplican si la política de entrada del llamante lo declara al construir la entrada, nunca aquí.
export function validateEntries({ input, profile }) {
  const errors = []; const incompatibilities = [];
  if (!profile || typeof profile !== 'object') return { ok: false, errors: [{ path: 'profile', message: 'perfil ausente' }], incompatibilities, profileCoverage: null, versions: { engine: ENGINE_VERSION } };
  let missing = [];
  try { missing = missingRequired(profile); } catch (e) { errors.push({ path: 'profile', message: `perfil ilegible: ${e.message}` }); }
  const inputErrors = input ? validateInput(input, profile) : [{ path: 'input', message: 'entrada ausente' }];
  errors.push(...inputErrors);
  if (input?.teams?.length === 2) {
    const ids = input.teams.flatMap((t) => t.players?.map((p) => p.id) ?? []); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (input.teams[0].id === input.teams[1].id) incompatibilities.push({ code: 'instancia', message: `los dos equipos comparten el identificador ${input.teams[0].id}: cree una instancia con retargetTeam(equipo, 'OTRO_ID') para que la identidad de instancia sea distinta de la deportiva de origen` });
    if (dup.length) incompatibilities.push({ code: 'instancia', message: `identificadores de jugador repetidos entre los dos equipos: ${[...new Set(dup)].slice(0, 6).join(', ')}` });
  }
  return {
    ok: errors.length === 0 && missing.length === 0 && incompatibilities.length === 0,
    errors, incompatibilities,
    profileCoverage: { complete: missing.length === 0, missingRequiredRows: missing.slice(0, 50), missingCount: missing.length, status: profile.status ?? null, extensions: profile.extensions ?? [] },
    versions: { engine: ENGINE_VERSION, exportSchema: EXPORT_SCHEMA, profile: profile.id ?? null, effectiveProfile: profile.effectiveId ?? profile.id ?? null },
  };
}

// ------------------------------------------------------------------------------------------------ encuentro
let instanceCounter = 0; // solo numera instancias del proceso para identificarlas; NO interviene en el deporte ni se guarda como estado del encuentro

export class Encounter {
  constructor(match, { id, controlledTeams, rootInputFp }) {
    this.match = match; this.id = id; this.controlledTeams = new Set(controlledTeams); this.rootInputFp = rootInputFp;
  }
  get status() { return this.match.status; }
  get done() { return this.match.status === 'finished' || this.match.status === 'error'; }

  position() {
    const m = this.match;
    return { status: m.status, period: m.period, clockTenths: m.clock, shotClockTenths: m.shotClock, score: [...m.score], stepSeq: m.stepSeq, events: m.events.length, possessions: m.possSeq, periodBreak: m.periodBreak != null, rngDraws: m.rng.count };
  }

  // Avanza hasta la frontera pedida (o hasta que se agote `maxSteps`, que es una protección técnica y no una adjudicación). Resuelve, no adjudica ni oculta un error.
  advance({ until = 'step', maxSteps = 100000 } = {}) {
    if (!BOUNDARIES.includes(until)) throw new Error(`frontera desconocida: ${until} (admite ${BOUNDARIES.join(', ')})`);
    const m = this.match; const startPoss = m.possSeq; let steps = 0; let reached = false;
    while (!this.done && steps < maxSteps) {
      const alive = m.step(); steps += 1;
      if (!alive) { reached = true; break; }
      if (until === 'step') { reached = true; break; }
      if (until === 'possession' && (m.possSeq !== startPoss || (m.poss && m.poss.done))) { reached = true; break; }
      if (until === 'period' && m.periodBreak != null) { reached = true; break; }
    }
    return { reached: reached || this.done, steps, boundary: this.done ? 'end' : until, done: this.done, position: this.position(), ...(m.status === 'error' ? { error: m.errors } : {}) };
  }

  // Solicitud de orden: valida AUTORIDAD (solo los equipos que este llamante controla), ámbito y frontera con las reglas existentes del núcleo. Devuelve aceptada/pendiente/rechazada y la causa.
  requestOrder(spec, { authority = null } = {}) {
    const team = spec?.team;
    const allowed = authority == null ? this.controlledTeams : new Set(authority);
    if (!Number.isInteger(team) || !allowed.has(team)) return { state: 'rechazada', cause: `sin autoridad sobre el equipo ${team}: este encuentro se controla desde ${[...allowed].join(', ') || 'ningún equipo'}`, order: null };
    if (this.done) return { state: 'rechazada', cause: `el encuentro está ${this.match.status === 'finished' ? 'terminado' : 'en error'}`, order: null };
    const o = this.match.submit(spec);
    const state = o.state === 'rechazada' ? 'rechazada' : (o.state === 'pendiente' || o.state === 'solicitada') ? 'pendiente' : 'aceptada';
    return { state, cause: o.reason ?? null, order: { id: o.id, type: o.type, state: o.state, reason: o.reason ?? null, anchor: o.anchor } };
  }
  cancelOrder(orderId, { authority = null } = {}) {
    const o = this.match.orders.find((x) => x.id === orderId); if (!o) return { ok: false, reason: 'orden desconocida' };
    const allowed = authority == null ? this.controlledTeams : new Set(authority);
    if (!allowed.has(o.team)) return { ok: false, reason: `sin autoridad sobre el equipo ${o.team}` };
    return this.match.cancel(orderId);
  }

  // Indisponibilidad externa (p. ej. del manager): retira al jugador por la MISMA administración que una exclusión (sustitución si hay un elegible; si no, vacante y continuación en inferioridad;
  // con menos de dos jugadores listos termina administrativamente). Valida autoridad sobre el equipo del jugador. Riesgo clínico, lesión aleatoria y recuperación entre partidos no se modelan aquí.
  retirePlayer(playerId, { cause = 'indisponibilidad externa', authority = null } = {}) {
    const st = this.match.ps[playerId]; if (!st) return { ok: false, reason: `jugador desconocido: ${playerId}` };
    const team = this.match.pl[playerId].teamIdx; const allowed = authority == null ? this.controlledTeams : new Set(authority);
    if (!allowed.has(team)) return { ok: false, reason: `sin autoridad sobre el equipo ${team}` };
    return this.match.withdrawPlayer(playerId, { cause });
  }

  // Consulta SIN efectos deportivos según audiencia: pública = lo observable; propia = estado de un equipo con las categorías autorizadas; diagnóstico = laboratorio.
  query({ audience = 'public', team = 0 } = {}) {
    if (!AUDIENCES.includes(audience)) throw new Error(`audiencia desconocida: ${audience}`);
    const m = this.match; const base = { audience, position: this.position(), teams: m.teams.map((t) => ({ id: t.id, name: t.name })), pendingOrders: m.orders.filter((o) => ['pendiente', 'vigente'].includes(o.state)).filter((o) => audience === 'diagnostic' || o.team === team).map((o) => ({ id: o.id, team: o.team, type: o.type, state: o.state })) };
    if (audience === 'public') return { ...base, teamsPublic: [0, 1].map((t) => rivalPublicView(m, t)) };
    if (audience === 'own') return { ...base, own: ownStateView(m, team), rival: rivalPublicView(m, 1 - team) };
    return { ...base, diagnostic: diagnosticView(m) };
  }

  snapshot(info = {}) { return snapshotMatch(this.match, info); }

  // Resultado consumible. `outcome.kind` distingue final normal, producción parcial, adjudicación administrativa y fallo técnico; un fallo NO es una derrota ni lleva marcador definitivo.
  result() {
    const m = this.match; const res = buildResult(m); const adm = res.administrative ?? null;
    let outcome;
    if (m.status === 'error') outcome = { kind: 'fallo_tecnico', definitiveScore: null, producedScore: [...m.score], reason: m.errors.map((e) => e.message).join('; ') || 'error de ejecución', winner: null };
    else if (adm) outcome = { kind: 'adjudicacion_administrativa', definitiveScore: adm.awarded, producedScore: [...m.score], winner: adm.awarded[0] > adm.awarded[1] ? 0 : adm.awarded[1] > adm.awarded[0] ? 1 : null, reason: adm.reason, row: adm.row };
    else if (m.status === 'finished') outcome = { kind: 'final_normal', definitiveScore: [...m.score], producedScore: [...m.score], winner: m.score[0] === m.score[1] ? null : (m.score[0] > m.score[1] ? 0 : 1), reason: null };
    else outcome = { kind: 'produccion_parcial', definitiveScore: null, producedScore: [...m.score], winner: null, reason: 'encuentro no terminado' };
    return { contract: ENGINE_CONTRACT, encounterId: this.id, outcome, result: res, fingerprints: { trajectory: m.status === 'finished' ? trajectoryFingerprint(res) : null, input: this.rootInputFp }, versions: { engine: ENGINE_VERSION, exportSchema: EXPORT_SCHEMA, profile: res.identity.effectiveProfileId }, coverage: { detail: m.opts.detail } };
  }

  dispose() { this.match = null; }
}

export function createEncounter({ input, profile, controlledTeams = [0, 1], detail = 'full', profileRef = null, instanceId = null } = {}) {
  const v = validateEntries({ input, profile });
  if (!v.ok) { const e = new Error(`entradas no válidas: ${[...v.errors.map((x) => `${x.path}: ${x.message}`), ...v.incompatibilities.map((x) => x.message)].slice(0, 6).join('; ')}`); e.validation = v; throw e; }
  const match = createMatch(input, profile, { detail, profileRef });
  instanceCounter += 1;
  const fp = inputFingerprint(match.input);
  return new Encounter(match, { id: instanceId ?? `ENC-${fp.slice(0, 8)}-${instanceCounter}`, controlledTeams, rootInputFp: fp });
}

// Continuación real de un guardado (§10): con SU entrada y SU perfil congelados. Rechaza con motivo un guardado incompatible, incompleto o alterado.
export function restoreEncounter(snapshot, { controlledTeams = [0, 1], instanceId = null } = {}) {
  const match = restoreMatch(snapshot);
  instanceCounter += 1;
  const fp = inputFingerprint(match.input);
  return new Encounter(match, { id: instanceId ?? `ENC-${fp.slice(0, 8)}-${instanceCounter}`, controlledTeams, rootInputFp: fp });
}
export { validateSnapshot };

// Leer un histórico (resultado exportado o producido) SIN re-simular. La audiencia limita lo visible; el diagnóstico completo no se entrega a un entrenador automático.
export function readHistory(result, { audience = 'public', team = 0 } = {}) {
  if (!AUDIENCES.includes(audience)) throw new Error(`audiencia desconocida: ${audience}`);
  return analyze(result, { audience, team });
}
export { profileSportFingerprint, inputFingerprint, trajectoryFingerprint, deepCopy };
