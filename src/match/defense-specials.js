// Instrucciones especiales defensivas (MOTOR-05): ESPD01 falta táctica, ESPD02 doble a jugador, ESPD03 no abandonar tirador,
// y la consecuencia de abandonar una responsabilidad. La doble reutiliza el compromiso de dos de COB04 (un solo compromiso por interacción).
import { MatchCore } from './core.js';
import { sigmoid, logit, round } from './mathx.js';
import { foulPeriodKey } from './rules.js';
import { resolveFoul, disqualifies as disqualifiesByMatrix } from './regs.js';

const P = MatchCore.prototype;
const hp = (m, p, q) => sigmoid(logit(p) + m.profile.opportunity.helpDifferenceSensitivity * q);

// ---------------------------------------------------------------- responsabilidad abandonada
// Quien deja a un atacante: si un relevo llega, lo cubre; si no, queda abierto hasta una modificación pertinente de la posesión.
P.abandon = function abandon(attPid, relief) {
  if (!attPid) return;
  if (relief) this.setCurrent(attPid, relief); else (this.poss.openAtt ??= new Set()).add(attPid);
};

// ---------------------------------------------------------------- ESPD02 — doble a jugador
// Devuelve null o la traza. Modifica `ex` (mezcla de dos defensores) solo si hay un ejecutor compatible con acceso.
P.applyDouble = function applyDouble(ex) {
  const t = 1 - ex.team; const sp = this.activeSpecial(t, 'ESPD02'); if (!sp) return null;
  const ok = (id) => id && this.ps[id]?.onCourt && this.ps[id].available && this.pl[id].teamIdx === ex.team;
  const target = ok(sp.principal) ? sp.principal : (ok(sp.alternate) ? sp.alternate : null);
  if (!target) return { estado: 'suspendida', motivo: 'ninguno de los jugadores designados está en pista' };
  const triggers = sp.activation === 'reception' ? (ex.exec === 'pass' && ex.actor === target && ex.actor !== ex.holder) : (ex.exec === 'dribble' && ex.actor === target);
  if (!triggers) return null;
  if (ex.defMix) return { estado: 'no duplicada', motivo: 'ya hay un compromiso de dos en esta interacción (se conserva una sola causa)' };
  const first = this.defenderFor(target);
  if (!first) return { estado: 'limitada', motivo: 'el jugador está abierto: no hay defensor al que ayudar' };
  const prot = this.protectedAttackers(t); const committed = this.poss.committed ?? new Set();
  const leaves = (id) => this.responsibilityOf(id);
  const eligible = (id) => id && id !== first && this.ps[id]?.onCourt && this.ps[id].available && this.pl[id].teamIdx === t && !committed.has(id);
  const blocked = [];
  const usable = (id) => { if (!eligible(id)) return false; const a = leaves(id); if (a && prot.has(a)) { blocked.push(id); return false; } return true; };
  let second = [sp.executor, sp.executorAlt].find((id) => usable(id)) ?? null;
  let how = second ? 'ejecutor designado' : null;
  if (!second) { // alternativo funcional elegible: el mejor relevo compatible del jugador
    const alt = this.reliefFor(target).filter((id) => usable(id)); // reliefFor ya excluye comprometidos y al perseguidor dedicado
    if (alt.length) { second = [...alt].sort((a, b) => this.taskValue('TAR09', 'attack', { helper: b }) - this.taskValue('TAR09', 'attack', { helper: a }) || (a < b ? -1 : 1))[0]; how = 'alternativo funcional'; }
  }
  if (!second) return { estado: 'no ejecutada', motivo: blocked.length ? 'Doble no ejecutada: sin ayudante compatible con no abandonar' : 'Doble no ejecutada: sin ayudante compatible con acceso' };
  const abandoned = leaves(second);
  ex.defMix = { primary: first, second }; ex.defend = first; ex.icpt = first;
  this.poss.trapBy = this.poss.trapBy ?? 'ESPD02';
  this.commit(first, 'doble'); this.commit(second, 'doble');
  const o = this.profile.opportunity; let rot = null; let arrives = false;
  if (abandoned) {
    const rc = this.reliefFor(abandoned).filter((id) => id !== first && id !== second);
    if (rc.length) { rot = [...rc].sort((a, b) => this.taskValue('TAR09', 'attack', { helper: b }) - this.taskValue('TAR09', 'attack', { helper: a }) || (a < b ? -1 : 1))[0]; arrives = this.bernoulli(hp(this, o.helpExecutionP0, this.taskValue('TAR09', 'attack', { helper: rot }) - this.taskValue('TAR09', 'defense', { receiver: abandoned })), 'ESPD02:rotación_llega'); }
    this.abandon(abandoned, arrives ? rot : null);
  }
  ex.especial = { id: 'ESPD02' };
  this.cover('ESPD02 doble');
  return { estado: 'ejecutada', objetivo: target, activacion: sp.activation, defensores: { primero: first, segundo: second, via: how }, deja: abandoned, relevo: rot, relevoLlega: arrives };
};

// ---------------------------------------------------------------- ESPD01 — falta táctica
P.activateSpecialOrders = function activateSpecialOrders(poss) {
  for (const o of this.orders) {
    if (o.type !== 'defSpecial' || o.content.special !== 'ESPD01' || o.state !== 'pendiente' || o.team === poss.team) continue;
    if (o.scope.target === 'current' ? o.scope.possession === poss.id : poss.seq >= o.scope.minPossSeq) {
      o.bound = poss.id; o.activation = { step: this.stepSeq, period: this.period, clock: this.clock, possession: poss.id };
      this.setState(o, 'vigente', `ligada a la posesión rival ${poss.id}: espera una oportunidad pertinente`);
    }
  }
};
P.expireSpecialOrdersFor = function expireSpecialOrdersFor(poss) {
  for (const o of this.orders) {
    if (o.type !== 'defSpecial' || o.state !== 'vigente' || o.bound !== poss.id) continue;
    this.setState(o, 'caducada', `terminó la posesión ${poss.id}: ${o.notes.length ? o.notes.join('; ') : 'no hubo oportunidad pertinente'}`);
  }
};
P.tacticalFoulOrder = function tacticalFoulOrder(ex) {
  const defT = 1 - ex.team;
  return this.poss ? this.orders.find((o) => o.type === 'defSpecial' && o.content.special === 'ESPD01' && o.team === defT && o.state === 'vigente' && o.bound === this.poss.id) ?? null : null;
};

// Oportunidad pertinente: una interacción de la posesión rival con el objetivo (poseedor o jugador designado) y un ejecutor con acceso.
// La orden no detiene el reloj: solo un contacto real lo hace, y su clasificación sale de ese contacto.
P.tacticalFoul = function tacticalFoul(ex) {
  const o = this.tacticalFoulOrder(ex); if (!o) return null;
  const defT = 1 - ex.team; const c = o.content;
  const target = c.target === 'holder' || !c.target ? ex.holder : c.target;
  if (target !== ex.holder && target !== ex.actor) { this.noteCall(o, 'el objetivo no participó aún en una interacción pertinente'); return null; }
  const access = this.defenderFor(target);
  let exe = null;
  if (c.executor) exe = [access, ex.defend, ex.icpt].includes(c.executor) && this.ps[c.executor]?.onCourt && this.ps[c.executor].available ? c.executor : null;
  else exe = access;
  if (!exe) { this.noteCall(o, 'sin ejecutor con acceso al objetivo en esta interacción'); return null; }
  const d = this.dcfg().specials;
  const attempt = this.bernoulli(d.tacticalFoulAttemptGivenAccessP0, 'ESPD01:intento');
  if (!attempt) { this.noteCall(o, 'el ejecutor no llegó a intentar el contacto'); return null; }
  // clasificación del contacto: legítimo (ordinaria) o no legítimo (disruptiva). Referencia simétrica y sensibilidad compartida.
  const inner = ex.zone === 'rim' || ex.zone === 'inside';
  const legal = this.defensiveLegality(exe, inner ? 'TEC13' : 'TEC12');
  const pLegit = sigmoid(logit(this.dcfg().choiceReferences.symmetricTaskP0) + this.profile.outcomes.defensiveFoulSensitivity * (legal - this.profile.neutralAbility));
  const legit = this.bernoulli(pLegit, 'ESPD01:contacto_legítimo');
  const dur = this.sampleDuration(this.profile.durationSeconds.organizedFoul, 'falta táctica', { factor: this.profile.selection.organizedDurationFactor[this.styleOf(ex.team).organizedPace - 1], limit: this.limit() });
  const t = this.consume(dur, 'organized');
  const cls = legit ? 'personal ordinaria' : 'disruptiva';
  this.cover(legit ? 'ESPD01 falta ordinaria' : 'ESPD01 disruptiva');
  this.emit('attempt', { t, team: ex.team, intent: { origen: ex.origin, especial: 'ESPD01', clasificacion: cls, pContactoLegitimo: round(pLegit, 4) }, participants: { actor: ex.actor, poseedor: ex.holder, ejecutor: exe, objetivo: target }, effects: { faltaTactica: true, faltaDefensiva: exe, sobre: target, tipo: cls } });
  if (legit) this.foulAdmin(exe, target, { shooting: false, shotTeam: ex.team });
  else this.disruptiveAdmin(exe, target, ex.team);
  o.execution = { possession: this.poss.id, ejecutor: exe, objetivo: target, clasificacion: cls, step: this.stepSeq };
  this.setState(o, 'consumida', `ejecutada en ${this.poss.id}: falta ${cls}`);
  this.linkOrder(o.id, 'falta táctica ejecutada');
  this.poss.pendingFT = ex;
  return { cont: 'foulWindow' };
};

// Faltas con categoría propia (FIBA Official Basketball Rules 2026 v1.1, Arts. 37–38 y 41.4; resumen contrastado del encargo MOTOR-06 §8.2: el
// PDF sigue sin ser accesible desde el entorno). «Disruptiva» y «flagrante» son categorías DISTINTAS: interrumpir la transición o el reloj con
// un contacto innecesario (ESPD01) es disruptiva, no una «antideportiva» genérica heredada. La descalificación se cuenta por categoría
// (Arts. 38.2.3/41.4): dos flagrantes, dos técnicas de categoría 1 o una de cada; dos disruptivas NO descalifican por sí solas.
// Hoy solo se produce la disruptiva (ESPD01); los contadores de las demás existen para que la regla no dependa de un único contador.
P.sanctions = function sanctions(pid) { return ((this.sanc ??= {})[pid] ??= { disruptive: 0, flagrant: 0, technicalCat1: 0 }); };
P.disqualifies = function disqualifies(pid) { return disqualifiesByMatrix(this.profile, this.sanctions(pid)); }; // MOTOR-09: el límite acumulado procede de regulation.disqualification (RG-D01)
// Administración de la falta disruptiva (MOTOR-08 §12.1, resumen del encargo contrastado con OBR 2026 v1.1 arts. 37.2/38.2/17.2.7/29.2.6): falta personal y de equipo; lanza el jugador que
// recibió la falta; sin acto de tiro, dos libres (con acto de tiro valdrían la canasta y un libre o dos/tres libres, pero ESPD01 se resuelve antes de la acción); después saque de su equipo en la
// línea de pista delantera enfrente de la mesa con 14 s. No hay probabilidad artificial de disruptiva ni de flagrante: solo la produce un contacto representado.
P.disruptiveAdmin = function disruptiveAdmin(committer, fouled, shotTeam) {
  const rules = this.profile.rules; const defTeam = 1 - shotTeam; const key = foulPeriodKey(this.period, rules);
  this.ps[committer].fouls += 1;
  this.teamFouls[defTeam][key] = (this.teamFouls[defTeam][key] ?? 0) + 1;
  const sc = this.sanctions(committer); sc.disruptive += 1;
  const cons = resolveFoul(this.profile, { category: 'disruptiva', shotAction: false }); // MOTOR-09: libres, ejecutor y reanudación salen de la fila RG-F05
  if (!cons.ok) throw new Error(`falta disruptiva sin consecuencia válida: ${cons.diagnostic}`);
  const dq = this.disqualifies(committer); const out = this.ps[committer].fouls >= rules.foulOut;
  if (dq || out) this.exclude(committer);
  this.emit('foul', {
    team: shotTeam, intent: { origen: 'falta defensiva', tipo: 'disruptiva' },
    participants: { infractor: committer, sobre: fouled },
    stats: [{ k: 'foul', p: committer, team: defTeam, kind: 'disruptiva', teamFoul: true, sobre: fouled }],
    effects: { faltasPersonales: this.ps[committer].fouls, faltasColectivasPeriodo: this.teamFouls[defTeam][key], tirosLibres: cons.ft, regla: cons.row, categoria: 'disruptiva', disruptivasDelJugador: sc.disruptive, descalificado: dq, excluido: out || dq, causaTirosLibres: 'falta disruptiva sin acto de tiro (arts. 37.2/38.2): dos libres para quien recibió la falta, después saque de penalización de su equipo en la línea de pista delantera enfrente de la mesa (art. 17.2.7) con 14 s (art. 29.2.6)', reglamento: 'OBR 2026 v1.1 arts. 37.2, 38.2, 17.2.7, 29.2.6 (resumen del encargo MOTOR-08; el PDF no se ha consultado desde el entorno)' },
  });
  this.cover('falta disruptiva');
  this.pendingFoul = { fouled, n: cons.ft, shotTeam, shooting: false, shotMade: false, kind: 'falta disruptiva', retain: cons.resume.retains === true, shotEvent: null, feed: null };
  this.deadBall('falta disruptiva');
};
