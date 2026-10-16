// Relevo básico (apartado 7.2): ventanas legales, utilidad por posición, protección de faltas.
import { SLOTS } from './data.js';
import { clamp, interpolate, round } from './mathx.js';
import { MatchCore } from './core.js';

const P = MatchCore.prototype;

// Utilidad de un jugador para una posición: rotation.slotAbilityWeights, con severidad de energía selectiva.
P.slotUtility = function slotUtility(pid, slot) {
  const rot = this.profile.rotation;
  const sev = interpolate(this.profile.energy.severityNodes, this.ps[pid].energy);
  let u = 0;
  const [lo, hi] = this.profile.abilityBounds;
  for (const [attr, w] of Object.entries(rot.slotAbilityWeights[slot])) {
    u += w * clamp(this.pl[pid].abilities[attr] - sev * rot.utilityMaxEnergyPenalty, lo, hi);
  }
  return u;
};

P.benchCandidates = function benchCandidates(team, slot, { strictPosition }) {
  return this.teams[team].ids.filter((id) => {
    const s = this.ps[id];
    if (!s.available || s.onCourt) return false;
    if (strictPosition && !this.pl[id].positions.includes(slot)) return false;
    return true;
  });
};

// Motivo de relevo del titular de una posición, o null. Devuelve { reason, tolerance, needsReady }.
P.relevoReason = function relevoReason(pid) {
  const rot = this.profile.rotation;
  const s = this.ps[pid];
  const stintSec = s.stintTenths / 10;
  if (!s.available) return { reason: 'excluido', tolerance: Infinity, mandatory: true };
  if (s.energy <= rot.criticalEnergy) return { reason: 'energia_critica', tolerance: rot.criticalReplacementTolerance };
  for (const row of rot.foulProtection) {
    if (this.period === row.period && s.fouls >= row.fouls) return { reason: 'proteccion_faltas', tolerance: rot.foulProtectionTolerance };
  }
  if (stintSec >= rot.maximumNormalStintSeconds) return { reason: 'tramo_largo', tolerance: rot.longStintTolerance };
  if (s.energy < rot.reviewEnergy && stintSec >= rot.minimumStintSeconds) return { reason: 'fatiga', tolerance: rot.replacementUtilityTolerance };
  return null;
};

// Aplica la sustitución: el entrante hereda la posición del saliente (asignación explícita).
P.substitute = function substitute(team, slot, outId, inId, reason, ctx = {}) {
  const outS = this.ps[outId]; const inS = this.ps[inId];
  this.beforeStatusChange(outId); this.beforeStatusChange(inId); // MOTOR-07: el intervalo pendiente se procesa con la situación anterior (pista/banquillo)
  outS.onCourt = false; outS.slot = null; outS.benchTenths = 0; outS.stintTenths = 0;
  inS.onCourt = true; inS.slot = slot; inS.stintTenths = 0; inS.benchTenths = 0;
  outS.locked = true; inS.locked = true; // reentrada inmediata: hasta que corra el reloj no se vuelve a cambiar a ninguno de los dos
  this.lineup[team][slot] = inId;
  this.registerLineups();
  const offPosition = !this.pl[inId].positions.includes(slot);
  this.cover('sustitución');
  if (ctx.order) this.linkOrder(ctx.order, 'sustitución ejecutada');
  // La decisión delegada se registra como solicitud automática (no se reinyecta al reproducir: se regenera y se contrasta).
  const auto = ctx.order ? null : this.makeOrder({ team, type: 'substitution', issuer: 'auto', swaps: [{ out: outId, in: inId }], motivo: reason });
  const ev = this.emit('substitution', {
    team,
    intent: ctx.order ? { origen: 'orden manual', motivo: reason, solicitud: ctx.order } : { origen: 'relevo', motivo: reason },
    participants: { sale: outId, entra: inId, posicion: slot },
    effects: { fueraDePosicionNominal: offPosition, ventana: ctx.window ?? null, energiaSale: round(outS.energy, 2), energiaEntra: round(inS.energy, 2), foulsSale: outS.fouls },
  });
  if (auto) { auto.execution = { eventIds: [ev.id], window: ctx.window ?? null }; auto.scope = { kind: 'delegada' }; this.setState(auto, 'consumida', `entrenador básico: ${reason}`); }
  return ev;
};

// Ventana legal de sustitución (balón muerto con reloj parado, o intervalo de periodo).
// Nunca se llama entre tiros libres de una misma serie.
P.substitutionWindow = function substitutionWindow(window) {
  const rot = this.profile.rotation;
  // Lanzador de una serie de libres pendiente: no puede salir antes de tirar (ni por el entrenador ni por una orden manual).
  const shooter = this.pendingFoul && this.pendingFoul.n > 0 ? this.pendingFoul.fouled : null;
  // Órdenes manuales de quinteto (MOTOR-02): primero, por equipo; las obligaciones reglamentarias se resuelven después.
  for (let team = 0; team < 2; team++) this.applyManualLineups(team, window, shooter);
  const used = [new Set(), new Set()];
  // primero las sustituciones obligatorias de ambos equipos; después las voluntarias
  for (const pass of ['obligatorias', 'voluntarias']) {
    for (let team = 0; team < 2; team++) {
      for (const slot of SLOTS) {
        const out = this.lineup[team][slot];
        const why = this.relevoReason(out);
        if (!why || (pass === 'obligatorias') !== !!why.mandatory) continue;
        const mandatory = !!why.mandatory;
        if (!mandatory && out === shooter) { this.note('relevo:retenido', { saliente: out, motivo: 'lanzador de libres pendiente' }); continue; }
        if (!mandatory && this.lineupControl[team].mode === 'manual') { this.note('relevo:retenido por orden manual', { saliente: out, motivo: why.reason }); continue; }
        const pool = this.benchCandidates(team, slot, { strictPosition: true }).filter((id) => !used[team].has(id));
        let cands = pool;
        if (!cands.length && mandatory) cands = this.benchCandidates(team, slot, { strictPosition: false }).filter((id) => !used[team].has(id));
        cands = cands.filter((id) => {
          const s = this.ps[id];
          if (mandatory) return true;
          return s.energy >= rot.benchReadyEnergy && s.benchTenths / 10 >= rot.minimumBenchSeconds;
        });
        if (!cands.length) continue;
        const curU = mandatory ? -Infinity : this.slotUtility(out, slot);
        const scored = cands.map((id) => ({ id, u: this.slotUtility(id, slot) })).sort((a, b) => b.u - a.u || (a.id < b.id ? -1 : 1));
        const best = scored[0];
        if (!mandatory && best.u < curU - why.tolerance) { this.note('relevo:descartado', { saliente: out, motivo: why.reason, utilidadSaliente: round(curU, 3), mejorEntrante: best.id, utilidadEntrante: round(best.u, 3), tolerancia: why.tolerance }); continue; }
        this.note('relevo:aplicado', { saliente: out, motivo: why.reason, utilidadSaliente: mandatory ? null : round(curU, 3), entrante: best.id, utilidadEntrante: round(best.u, 3), tolerancia: why.tolerance });
        used[team].add(best.id);
        this.substitute(team, slot, out, best.id, why.reason, { window });
      }
    }
  }
};
