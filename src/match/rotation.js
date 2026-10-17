// Rotaciones (MOTOR-01/02 → MOTOR-08): ventanas legales, utilidad por posición y sustitución. La decisión voluntaria la toma el entrenador
// automático (`coach.js`, política ENTREF01–03 delegada por áreas); la sustitución obligatoria por exclusión es administración reglamentaria.
import { SLOTS } from './data.js';
import { round } from './mathx.js';
import { MatchCore } from './core.js';
import { slotUtilityOf } from './coach-policy.js';

const P = MatchCore.prototype;

// Utilidad de un jugador para una posición: una sola receta (rotation.slotAbilityWeights con la energía ya aplicada, escala 1–30), compartida con el entrenador.
P.slotUtility = function slotUtility(pid, slot) { return slotUtilityOf(this.profile, { abilities: this.pl[pid].abilities, energy: this.ps[pid].energy }, slot); };

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
  const dec = ctx.decision ?? null;
  // La decisión delegada se registra como solicitud automática (no se reinyecta al reproducir: se regenera y se contrasta).
  const auto = ctx.order ? null : this.makeOrder({ team, type: 'substitution', issuer: 'auto', swaps: [{ out: outId, in: inId }], motivo: reason });
  const ev = this.emit('substitution', {
    team,
    intent: ctx.order ? { origen: 'orden manual', motivo: reason, solicitud: ctx.order } : { origen: 'relevo', motivo: reason, ...(dec ? { decision: dec.id, politica: dec.politica, regla: dec.regla } : {}) },
    participants: { sale: outId, entra: inId, posicion: slot },
    effects: { fueraDePosicionNominal: offPosition, ventana: ctx.window ?? null, energiaSale: round(outS.energy, 2), energiaEntra: round(inS.energy, 2), foulsSale: outS.fouls },
  });
  if (auto) { auto.execution = { eventIds: [ev.id], window: ctx.window ?? null }; auto.scope = { kind: 'delegada' }; if (dec) auto.decisionId = dec.id; this.setState(auto, 'consumida', `entrenador automático${dec ? ` (${dec.politica})` : ''}: ${reason}`); }
  if (dec) { this.dset(dec, 'ejecutada', `sustitución efectiva en ${ctx.window ?? 'ventana reglamentaria'}`, { hecho: ev.id, participantes: { ...dec.participantes, despues: this.onCourt(team).slice() } }); if (auto) dec.orden = auto.id; }
  return ev;
};

// MOTOR-14 (RG-D02, inferioridad natural): la posición del saliente queda VACANTE cuando no existe un sustituto elegible. No se mantiene al excluido en pista ni se inventa un sexto
// jugador; el equipo continúa con los participantes presentes (la reorganización de tareas y responsabilidades usa `onCourt`). Un solo hecho `substitution` con `entra: null`.
P.vacate = function vacate(team, slot, outId, reason, ctx = {}) {
  const outS = this.ps[outId];
  this.beforeStatusChange(outId);
  outS.onCourt = false; outS.slot = null; outS.benchTenths = 0; outS.stintTenths = 0; outS.locked = true;
  delete this.lineup[team][slot];
  this.registerLineups();
  this.cover('inferioridad: posición vacante sin sustituto');
  const dec = ctx.decision ?? null;
  const ev = this.emit('substitution', {
    team,
    intent: { origen: 'administración reglamentaria', motivo: reason, ...(dec ? { decision: dec.id, politica: dec.politica, regla: dec.regla } : {}) },
    participants: { sale: outId, entra: null, posicion: slot },
    effects: { sinSustituto: true, inferioridad: this.onCourt(team).length, ventana: ctx.window ?? null, energiaSale: round(outS.energy, 2), foulsSale: outS.fouls, regla: 'RG-D02' },
  });
  if (dec) this.dset(dec, 'ejecutada', `retirada sin sustituto en ${ctx.window ?? 'ventana reglamentaria'}: ${this.onCourt(team).length} jugadores en pista`, { hecho: ev.id, participantes: { ...dec.participantes, despues: this.onCourt(team).slice() } });
  return ev;
};

// Ventana legal de sustitución (balón muerto con reloj parado, o intervalo de periodo).
// Nunca se llama entre tiros libres de una misma serie.
P.substitutionWindow = function substitutionWindow(window) {
  // Lanzador de una serie de libres pendiente: no puede salir antes de tirar (ni por el entrenador ni por una orden manual).
  const shooter = this.pendingFoul && this.pendingFoul.n > 0 ? this.pendingFoul.fouled : null;
  // Órdenes manuales de quinteto (MOTOR-02): primero, por equipo; las obligaciones reglamentarias se resuelven después.
  for (let team = 0; team < 2; team++) this.applyManualLineups(team, window, shooter);
  const used = [new Set(), new Set()];
  // primero las sustituciones obligatorias de ambos equipos (administración, no delegable); después las voluntarias de la política delegada
  for (let team = 0; team < 2; team++) this.coachMandatory(team, window, used[team]);
  for (let team = 0; team < 2; team++) this.coachRotation(team, window, shooter, used[team]);
};
