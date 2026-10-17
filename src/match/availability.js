// Disponibilidad e inferioridad en el flujo natural (MOTOR-14 §8, RG-D02/RG-T01). Una exclusión, descalificación o indisponibilidad externa retira al jugador; si hay un sustituto elegible entra en la
// ventana pertinente (coach.js · coachMandatory); si no, la posición queda VACANTE (rotation.js · vacate) y el equipo sigue con los presentes: sin jugador fantasma, sin bonus de inferioridad y sin
// estadísticas inventadas. Aquí: la retirada externa y la terminación administrativa cuando un equipo no tiene al menos el mínimo de jugadores listos. Sin azar.
import { MatchCore } from './core.js';
import { terminate } from './regs.js';

const P = MatchCore.prototype;

// Indisponibilidad sobrevenida recibida de fuera (p. ej. del futuro manager): equivale a la retirada administrativa de una exclusión. La sustitución o la vacante se resuelven en la siguiente
// ventana reglamentaria. Es una orden del núcleo (queda registrada como comando y se reproduce). Riesgo clínico, lesión aleatoria y recuperación entre partidos están fuera de esta entrega.
P.withdrawPlayer = function withdrawPlayer(pid, { cause = 'indisponibilidad externa' } = {}) {
  this.logCommand('withdraw', { pid, cause });
  const s = this.ps[pid];
  if (!s) return { ok: false, reason: `jugador desconocido: ${pid}` };
  if (this.status === 'finished' || this.status === 'error') return { ok: false, reason: 'el encuentro ya terminó' };
  if (!s.available) return { ok: false, reason: `${pid} ya no está disponible` };
  // Quien tiene una serie de libres pendiente la termina antes de retirarse (la retirada se aplica al cerrarse la serie): no se cambia al lanzador entre tiros ni se improvisa un lanzador.
  if (this.pendingFoul && this.pendingFoul.fouled === pid && this.pendingFoul.n > 0) {
    (this.deferredWithdrawals ??= []).push({ pid, cause, requestedStep: this.stepSeq });
    return { ok: true, deferred: true, pending: 'se aplica al terminar su serie de tiros libres pendiente' };
  }
  this.applyWithdrawal(pid, cause);
  return { ok: true, pending: s.onCourt ? 'retirada en la siguiente ventana reglamentaria (sustitución o vacante)' : 'sin efecto inmediato en pista' };
};
P.applyWithdrawal = function applyWithdrawal(pid, cause) {
  const s = this.ps[pid]; if (!s.available) return;
  this.beforeStatusChange(pid);
  s.available = false; this.cover('indisponibilidad externa');
  this.withdrawals = [...(this.withdrawals ?? []), { pid, cause, step: this.stepSeq, period: this.period, clock: this.clock }];
};
P.applyDeferredWithdrawals = function applyDeferredWithdrawals() {
  if (!this.deferredWithdrawals?.length || (this.pendingFoul && this.pendingFoul.n > 0)) return;
  const q = this.deferredWithdrawals; this.deferredWithdrawals = [];
  for (const d of q) this.applyWithdrawal(d.pid, d.cause);
};

// Jugadores listos de un equipo: todos los disponibles (en pista o en banquillo).
P.readyPlayers = function readyPlayers(t) { return this.teams[t].ids.filter((id) => this.ps[id].available).length; };

// Comprobación al final de cada paso: menos de `minPlayersToContinue` listos → terminación administrativa. NO se identifica «menos de cinco» con terminación (art. 21).
P.checkAvailability = function checkAvailability() {
  if (this.status !== 'running') return false;
  this.applyDeferredWithdrawals();
  if ((this.poss && !this.poss.done) || this.pendingFoul) return false; // solo en una frontera estable: la posesión en curso (y sus libres pendientes) se administra hasta su cierre
  const min = this.profile.regulation.availability.minPlayersToContinue;
  for (let t = 0; t < 2; t++) {
    if (this.readyPlayers(t) >= min) continue;
    const reason = `${this.teams[t].id} no tiene al menos ${min} jugadores listos (${this.readyPlayers(t)})`;
    const adm = terminate(this.profile, { favored: 1 - t, played: [...this.score], reason, kind: 'insufficient_players' });
    this.administrative = adm;
    this.emit('termination', { team: 1 - t, intent: { origen: 'terminación administrativa', motivo: reason, regla: 'RG-T01' }, effects: { administrativa: true, marcadorDeCancha: [...this.score], adjudicado: adm.awarded, base: adm.awardedBasis, favorecido: this.teams[1 - t].id, contraste: adm.contrast } });
    this.status = 'finished'; this.closeOrdersAtFinish();
    this.cover('terminación administrativa por falta de jugadores');
    return true;
  }
  return false;
};
