// Adaptador de exposición SIM → aprendizaje posterior al partido (§10). El generador solo REGISTRA exposición; el aprendizaje lo calculan al terminar las funciones puras de `src/learning` (sin otra curva de
// Polivalencia, retención o enseñanza para SIM). Unidades: `liveTenths` y los tiempos de posición/rol son DÉCIMAS DE SEGUNDO DE JUEGO VIVO (600 = un minuto); los créditos de módulos están en operaciones de
// finalización SIM ponderadas (cada participante recibe 1 por finalización repartido por los pesos del contexto) y NO se convierten en horas: la dosis sale de su reparto normalizado. Un mayor número de registros
// no produce más presupuesto: la dosis máxima por minutos/dominio/día sigue la política común.
import { sourceIdOf } from '../learning/index.js';

export const LEARNING_UNITS = { liveTenths: 'décimas de segundo de juego vivo (600 = 1 min)', modules: 'finalizaciones SIM ponderadas por jugador (reparto normalizado; sin conversión a horas)' };

// `ess`: registro esencial (o `res.exposure`-equivalente). Devuelve la exposición completa de AMBOS equipos, lista para `proposeFromMatch` (que solo mira a los jugadores de la instancia).
// Un resultado no terminado se declara parcial: `proposeFromMatch` lo rechaza.
export function exposureFromEssential(ess, { source = ess.identity.matchId, batch = null, attempt = ess.identity.attemptId } = {}) {
  const teams = ess.identity.teams.map((t) => t.id);
  const players = {}; for (const [id, e] of Object.entries(ess.exposure ?? {})) players[id] = { liveTenths: e.liveTenths, positions: { ...e.positions }, offensiveRoles: { ...e.offensiveRoles }, defensiveRoles: { ...e.defensiveRoles }, modules: { ...e.modules } };
  return { players, status: ess.complete ? 'finished' : ess.status, complete: ess.complete === true, match: { source_id: sourceIdOf({ source, batch, attempt, teamInstance: teams.join('/') }), encounterId: ess.identity.matchId, teams, logicalMatch: ess.identity.matchId, attemptId: attempt, model: 'beM-sim-segment' }, units: LEARNING_UNITS };
}
// A partir del resultado completo de SIM (`buildSimResult`): la exposición se deriva de los mismos hechos publicados.
export function exposureFromSimResult(res) {
  const players = {};
  for (const [id, e] of Object.entries(res.exposure ?? {})) players[id] = { liveTenths: Math.round(Object.values(e.slotSec).reduce((a, x) => a + x, 0) * 10), positions: Object.fromEntries(Object.entries(e.slotSec).map(([k, v]) => [k, Math.floor(v * 10 + 1e-6)])), offensiveRoles: Object.fromEntries(Object.entries(e.roleSec).map(([k, v]) => [k, Math.floor(v * 10 + 1e-6)])), defensiveRoles: Object.fromEntries(Object.entries(e.defRoleSec ?? {}).map(([k, v]) => [k, Math.floor(v * 10 + 1e-6)])), modules: { ...(e.modules ?? {}) } };
  const teams = res.identity.teams.map((t) => t.id); const complete = res.finishedPublished === true && res.status === 'finished';
  return { players, status: complete ? 'finished' : res.status, complete, match: { source_id: sourceIdOf({ source: res.identity.matchId ?? `SIM|${res.identity.seed}`, attempt: res.identity.attemptId, teamInstance: teams.join('/') }), encounterId: res.identity.matchId, teams, logicalMatch: res.identity.matchId, attemptId: res.identity.attemptId, model: 'beM-sim-segment' }, units: LEARNING_UNITS };
}
