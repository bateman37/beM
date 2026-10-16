// Dirección manual (MOTOR-02): solicitud, validación, espera, vigencia, consumo y cierre de órdenes sobre fronteras deportivas.
// Núcleo sin DOM ni reloj de ordenador. Toda intervención entra por submit / submitBatch / cancel, que se registran como
// «comandos» ancladas a la frontera de avance (`afterStep`), no a una hora: son lo que permite reproducir el encuentro.
import { MatchCore } from './core.js';
import { SLOTS, deepCopy } from './data.js';
import { ORDER_TYPES, EDITABLE_STYLES, TERMINAL_STATES } from './order-types.js';
import { newTimeoutLedger, timeoutAllowance, chargeTimeout } from './admin.js';

const P = MatchCore.prototype;
const pad = (n, w = 3) => String(n).padStart(w, '0');
const ordinal = (n) => `${n}.º`;

P.initDirection = function initDirection() {
  this.orders = []; this.orderSeq = 0; this.batchSeq = 0; this.commands = [];
  this.lineupControl = [{ mode: 'auto', cause: 'inicio' }, { mode: 'auto', cause: 'inicio' }];
  this.timeouts = [newTimeoutLedger(), newTimeoutLedger()];
  this.windowSeq = 0; this.pendingLinks = []; this.inStep = false;
};

// ---------------------------------------------------------------- frontera y registro de comandos
// Frontera de avance: `afterStep` es el número de pasos ya completados; la orden actúa antes del paso afterStep+1.
P.frontier = function frontier() {
  return {
    afterStep: this.stepSeq, status: this.status, period: this.period, clock: this.clock, shotClock: this.shotClock,
    possession: this.poss && !this.poss.done ? this.poss.id : null, possSeq: this.possSeq,
    lastEvent: this.events.length ? this.events[this.events.length - 1].id : null,
  };
};
P.logCommand = function logCommand(kind, payload) {
  const f = this.frontier();
  this.commands.push({ n: this.commands.length + 1, kind, afterStep: f.afterStep, period: f.period, clock: f.clock, possession: f.possession, payload: deepCopy(payload) });
};

P.setState = function setState(o, state, reason, extra = {}) {
  o.state = state; o.reason = reason ?? null;
  const f = this.frontier();
  o.history.push({ state, reason: reason ?? null, step: this.stepSeq, enPaso: this.inStep, period: this.period, clock: this.clock, possession: this.poss && !this.poss.done ? this.poss.id : null, lastEvent: f.lastEvent, ...extra });
};
// Razón de espera: se registra solo cuando cambia, para no llenar el historial.
P.setWait = function setWait(o, reason) {
  if (o.reason === reason) return;
  o.reason = reason;
  o.history.push({ state: o.state, reason, step: this.stepSeq, enPaso: this.inStep, period: this.period, clock: this.clock, espera: true });
};
P.linkOrder = function linkOrder(id, role) { this.pendingLinks.push({ id, role }); };

// ---------------------------------------------------------------- alta
const SPEC_META = ['team', 'type', 'issuer'];
P.makeOrder = function makeOrder(spec, batchId) {
  this.orderSeq += 1;
  const def = ORDER_TYPES[spec?.type];
  const content = {}; for (const [k, v] of Object.entries(spec ?? {})) if (!SPEC_META.includes(k)) content[k] = deepCopy(v);
  const o = {
    id: `O${pad(this.orderSeq)}`, seq: this.orderSeq, batchId: batchId ?? null, team: spec?.team, issuer: spec?.issuer ?? 'manual',
    type: spec?.type, kind: def?.kind ?? null, label: def?.label ?? null, scope: null, content, targets: [],
    anchor: this.frontier(), state: 'solicitada', reason: null, activation: null, execution: null,
    replaces: [], supersededBy: null, liveFields: null, notes: [], history: [],
  };
  this.orders.push(o);
  this.setState(o, 'solicitada', null);
  return o;
};

const fail = (reason) => ({ ok: false, reason });
const ok = () => ({ ok: true });

P.validateOrder = function validateOrder(o) {
  if (!ORDER_TYPES[o.type]) return fail(`tipo de orden desconocido: ${o.type}`);
  if (o.team !== 0 && o.team !== 1) return fail('equipo no válido');
  if (this.status === 'created') return fail('el partido no ha comenzado: edita la preparación');
  if (this.status === 'finished') return fail('el partido ha terminado');
  if (this.status === 'error') return fail('el partido terminó con error');
  return this[`validate_${o.type}`](o);
};

P.planScope = function planScope() {
  return this.periodBreak != null ? { kind: 'periodo', targetPeriod: this.periodBreak } : { kind: 'persistente', targetPeriod: null };
};

P.validate_styles = function validate_styles(o) {
  const s = o.content.styles;
  if (!s || typeof s !== 'object' || !Object.keys(s).length) return fail('indica al menos un estilo');
  const editable = this.profile.activeCatalog.stylesEditable ?? EDITABLE_STYLES;
  for (const [k, v] of Object.entries(s)) {
    if (!editable.includes(k)) return fail(`«${k}» no es editable en esta entrega (valor declarado, sin efecto)`);
    if (!Number.isInteger(v) || v < 1 || v > 5) return fail(`${k}: los estilos son enteros de 1 a 5`);
  }
  o.scope = this.planScope(); o.liveFields = Object.keys(s).map((k) => `styles.${k}`);
  return ok();
};
P.validate_priorities = function validate_priorities(o) {
  const pr = o.content.priorities;
  if (!pr || typeof pr !== 'object' || !Object.keys(pr).length) return fail('indica al menos una prioridad');
  for (const [k, v] of Object.entries(pr)) {
    if (!this.profile.activeCatalog.plays.includes(k)) return fail(`la ficha ${k} no está activa`);
    if (!Number.isInteger(v) || v < 1 || v > 5) return fail(`${k}: la prioridad es un entero de 1 a 5`);
  }
  o.scope = this.planScope(); o.liveFields = Object.keys(pr).map((k) => `priorities.${k}`);
  return ok();
};
P.validate_director = function validate_director(o) {
  const list = o.content.directorPriority;
  if (!Array.isArray(list) || !list.length) return fail('la lista de director y alternativas no puede estar vacía');
  if (new Set(list).size !== list.length) return fail('un jugador aparece dos veces en la lista de director');
  for (const id of list) {
    if (!this.teams[o.team].ids.includes(id)) return fail(`${id} no pertenece al equipo`);
    if (!this.ps[id].available) return fail(`${id} no está disponible (excluido)`);
  }
  o.scope = this.planScope(); o.liveFields = ['director'];
  return ok();
};
P.validate_delegate = function validate_delegate(o) {
  if (o.content.domain !== 'lineup') return fail('solo se puede devolver el ámbito «quinteto» al entrenador básico en esta entrega');
  o.scope = this.planScope(); o.liveFields = ['lineupControl'];
  return ok();
};

P.validate_call = function validate_call(o) {
  const { playId, target } = o.content;
  if (!this.profile.activeCatalog.plays.includes(playId)) return fail(`la ficha ${playId} no está activa`);
  if (target !== 'current' && target !== 'next') return fail('el ámbito de la llamada es «posesión actual» o «siguiente posesión propia»');
  if (target === 'current') {
    const p = this.poss;
    if (!p || p.done || p.team !== o.team) return fail('el equipo no está atacando: no hay posesión propia en curso');
    if (p.playStarted) return fail('en la posesión actual ya empezó una ficha: no queda una selección de inicio');
    if (this.clock <= 0) return fail('no queda tiempo en el periodo');
    o.scope = { kind: 'posesión', target, possession: p.id, possSeq: this.possSeq };
  } else {
    o.scope = { kind: 'posesión', target, minPossSeq: this.possSeq + 1 };
  }
  return ok();
};

// Quinteto previsto: el de la última orden de quinteto pendiente del equipo o, si no hay, el actual.
P.projectedLineup = function projectedLineup(team) {
  const pend = this.orders.filter((x) => x.kind === 'lineup' && x.team === team && x.state === 'pendiente').pop();
  return pend ? { ...pend.content.target } : { ...this.lineup[team] };
};
P.validateTarget = function validateTarget(o, base, target) {
  const ids = SLOTS.map((s) => target[s]);
  if (ids.some((id) => !id)) return fail('falta un jugador en alguna posición');
  if (new Set(ids).size !== 5) return fail('el quinteto necesita cinco jugadores distintos');
  for (const id of ids) {
    if (!this.teams[o.team].ids.includes(id)) return fail(`${id} no pertenece al equipo`);
    if (!this.ps[id].available) return fail(`${id} no está disponible (excluido)`);
  }
  for (const s of SLOTS) {
    const onBase = SLOTS.find((x) => base[x] === target[s]);
    if (onBase && onBase !== s) return fail(`${target[s]} ya está en pista como ${onBase}: mover a un jugador en pista a otra posición no está disponible en esta entrega`);
  }
  if (SLOTS.every((s) => base[s] === target[s])) return fail('el quinteto ya es ese');
  o.content.target = { ...target };
  o.targets = SLOTS.filter((s) => base[s] !== target[s]).map((s) => target[s]);
  o.scope = { kind: 'ventana', window: 'sustitución' };
  return ok();
};
P.validate_lineup = function validate_lineup(o) {
  const a = o.content.assignment;
  if (!a || typeof a !== 'object') return fail('indica el jugador de cada posición');
  return this.validateTarget(o, this.projectedLineup(o.team), a);
};
P.validate_substitution = function validate_substitution(o) {
  const swaps = o.content.swaps;
  if (!Array.isArray(swaps) || !swaps.length) return fail('indica al menos un cambio (sale → entra)');
  const base = this.projectedLineup(o.team);
  const target = { ...base };
  const seenIn = new Set(); const seenOut = new Set();
  for (const sw of swaps) {
    const slot = SLOTS.find((s) => base[s] === sw.out);
    if (!slot) return fail(`${sw.out} no está en pista`);
    if (seenOut.has(sw.out) || seenIn.has(sw.in)) return fail('un jugador aparece dos veces en el cambio');
    if (SLOTS.some((s) => base[s] === sw.in)) return fail(`${sw.in} ya está en pista`);
    if (!this.teams[o.team].ids.includes(sw.in)) return fail(`${sw.in} no pertenece al equipo`);
    seenOut.add(sw.out); seenIn.add(sw.in); target[slot] = sw.in;
  }
  return this.validateTarget(o, base, target);
};

P.timeoutStatus = function timeoutStatus(team) {
  const cfg = this.cfg?.timeOuts;
  if (!cfg) return null;
  const al = timeoutAllowance(this.timeouts[team], this.period || 1, this.period ? this.clock : 6000, cfg, this.profile.rules);
  const pending = this.orders.find((x) => x.type === 'timeout' && x.team === team && x.state === 'pendiente') ?? null;
  return { ...al, pending: pending ? pending.id : null };
};
P.validate_timeout = function validate_timeout(o) {
  const cfg = this.cfg?.timeOuts;
  if (!cfg) return fail('el perfil no incluye la extensión de MOTOR-02 (tiempos muertos)');
  if (this.periodBreak != null || this.periodStartPending) return fail('entre periodos no se piden tiempos muertos: el intervalo ya es una parada');
  if (this.orders.some((x) => x.type === 'timeout' && x.team === o.team && x.state === 'pendiente')) return fail('ya hay un tiempo muerto solicitado y pendiente');
  const al = this.timeoutStatus(o.team);
  if (al.effective <= 0) return fail(`sin tiempos muertos disponibles (${al.reason ?? 'cupo agotado'})`);
  o.scope = { kind: 'ventana', window: 'tiempo muerto' };
  return ok();
};

// ---------------------------------------------------------------- aceptación (efectos de una solicitud válida)
const WAIT = {
  plan: (o) => (o.scope.kind === 'periodo' ? `vigente desde el inicio del ${ordinal(o.scope.targetPeriod)} periodo` : 'vigente desde la próxima elección'),
  call: (o) => (o.scope.target === 'current' ? 'pendiente de la selección de inicio de la posesión actual' : 'pendiente de la siguiente posesión ofensiva propia'),
  lineup: () => 'pendiente de oportunidad reglamentaria',
  timeout: () => 'pendiente de oportunidad reglamentaria',
};

P.acceptOrder = function acceptOrder(o) {
  this.setState(o, 'pendiente', WAIT[o.kind](o));
  if (o.kind === 'plan') {
    // la última solicitud explícita válida sustituye a las pendientes del mismo campo; el historial se conserva
    for (const old of this.orders) {
      if (old === o || old.kind !== 'plan' || old.team !== o.team || old.state !== 'pendiente' || !old.liveFields) continue;
      old.liveFields = old.liveFields.filter((f) => !o.liveFields.includes(f));
      if (!old.liveFields.length) { old.supersededBy = o.id; o.replaces.push(old.id); this.setState(old, 'sustituida', `sustituida por ${o.id} antes de activarse`); }
    }
  } else if (o.kind === 'call' || o.kind === 'lineup') {
    for (const old of this.orders) {
      if (old === o || old.kind !== o.kind || old.team !== o.team || old.state !== 'pendiente') continue;
      old.supersededBy = o.id; o.replaces.push(old.id); this.setState(old, 'sustituida', `sustituida por ${o.id} (la última solicitud válida prevalece)`);
    }
  }
};

// Una o varias solicitudes presentadas como un conjunto: se validan conjuntamente; si alguna es inválida no se activa ninguna.
P.intake = function intake(specs, batchId) {
  const orders = specs.map((s) => this.makeOrder(s, batchId));
  const results = orders.map((o) => this.validateOrder(o));
  if (orders.length > 1) {
    const lineups = orders.filter((o) => o.kind === 'lineup' && o.team === orders[0].team);
    if (lineups.length > 1) results[orders.indexOf(lineups[1])] = fail('un conjunto no puede contener dos cambios de quinteto');
    const calls = orders.filter((o) => o.kind === 'call');
    if (calls.length > 1) results[orders.indexOf(calls[1])] = fail('un conjunto no puede contener dos llamadas');
  }
  const bad = results.findIndex((r) => !r.ok);
  if (bad >= 0) {
    orders.forEach((o, i) => this.setState(o, 'rechazada', results[i].ok ? `conjunto no aplicado: ${results[bad].reason}` : results[i].reason));
    return orders;
  }
  orders.forEach((o) => this.acceptOrder(o));
  return orders;
};

P.submit = function submit(spec) {
  this.logCommand('submit', { spec });
  return this.intake([spec], null)[0];
};
P.submitBatch = function submitBatch(specs, label = null) {
  this.logCommand('batch', { specs, label });
  this.batchSeq += 1;
  return this.intake(specs, `B${pad(this.batchSeq)}`);
};
P.cancel = function cancel(orderId) {
  this.logCommand('cancel', { orderId });
  const o = this.orders.find((x) => x.id === orderId);
  if (!o) return { ok: false, reason: 'orden desconocida' };
  if (o.state === 'pendiente') { this.setState(o, 'cancelada', 'cancelada por el usuario antes de aplicarse'); return { ok: true, order: o }; }
  if (o.state === 'vigente') return { ok: false, reason: 'ya está vigente: solicita otro cambio para una frontera futura válida' };
  if (o.state === 'consumida') return { ok: false, reason: 'ya se ha producido: una concesión o ejecución consumada no se cancela' };
  return { ok: false, reason: `la orden está ${o.state}` };
};
// Reproducción: aplica un comando registrado (las mismas operaciones públicas, mismos datos).
P.applyCommand = function applyCommand(c) {
  if (c.kind === 'submit') return this.submit(c.payload.spec);
  if (c.kind === 'batch') return this.submitBatch(c.payload.specs, c.payload.label);
  if (c.kind === 'cancel') return this.cancel(c.payload.orderId);
  throw new Error(`comando desconocido: ${c.kind}`);
};

// ---------------------------------------------------------------- activación de órdenes de plan
P.supersedeActive = function supersedeActive(o) {
  for (const old of this.orders) {
    if (old === o || old.kind !== 'plan' || old.team !== o.team || old.state !== 'vigente' || !old.liveFields) continue;
    old.liveFields = old.liveFields.filter((f) => !o.liveFields.includes(f));
    if (!old.liveFields.length) { old.supersededBy = o.id; o.replaces.push(old.id); this.setState(old, 'sustituida', `sustituida por ${o.id}`); }
  }
};
P.applyPlanOrder = function applyPlanOrder(o) {
  const plan = this.teams[o.team].plan;
  if (o.type === 'styles') for (const [k, v] of Object.entries(o.content.styles)) { if (o.liveFields.includes(`styles.${k}`)) plan.styles[k] = v; }
  else if (o.type === 'priorities') for (const [k, v] of Object.entries(o.content.priorities)) { if (o.liveFields.includes(`priorities.${k}`)) plan.playbook.find((b) => b.playId === k).priority = v; }
  else if (o.type === 'director') plan.directorPriority = [...o.content.directorPriority];
  else if (o.type === 'delegate') this.lineupControl[o.team] = { mode: 'auto', cause: 'devuelto al entrenador', orderId: o.id };
  o.activation = { step: this.stepSeq, period: this.period, clock: this.clock, possession: this.poss && !this.poss.done ? this.poss.id : null, lastEvent: this.events.length ? this.events[this.events.length - 1].id : null };
  this.supersedeActive(o);
  this.setState(o, 'vigente', o.scope.kind === 'periodo' ? `vigente desde el inicio del ${ordinal(o.scope.targetPeriod)} periodo` : 'vigente desde la elección actual');
};
P.activatePlanOrders = function activatePlanOrders(period = this.period) {
  for (const o of this.orders) {
    if (o.kind !== 'plan' || o.state !== 'pendiente') continue;
    if (o.scope.targetPeriod != null && o.scope.targetPeriod > period) continue;
    this.applyPlanOrder(o);
  }
};

// ---------------------------------------------------------------- llamadas de ficha
P.activateCalls = function activateCalls(poss) {
  for (const o of this.orders) {
    if (o.kind !== 'call' || o.state !== 'pendiente' || o.team !== poss.team) continue;
    if (o.scope.target === 'current' ? o.scope.possession === poss.id : poss.seq >= o.scope.minPossSeq) {
      o.bound = poss.id;
      o.activation = { step: this.stepSeq, period: this.period, clock: this.clock, possession: poss.id };
      this.setState(o, 'vigente', `ligada a la posesión ${poss.id}: espera la selección de inicio`);
    }
  }
};
P.callFor = function callFor(poss) { return this.orders.find((o) => o.kind === 'call' && (o.state === 'vigente' || o.state === 'suspendida') && o.bound === poss.id && o.team === poss.team) ?? null; };
P.noteCall = function noteCall(call, cause) { if (call && !call.notes.includes(cause)) call.notes.push(cause); };
// «Suspendida por condición»: la llamada sigue declarada pero la ficha no es realizable ahora (sin participante compatible);
// puede recuperarse dentro de su ámbito (p. ej. tras una reorganización) o caducar con motivo al cerrar la posesión.
P.suspendCall = function suspendCall(call, cause) {
  if (!call) return;
  this.noteCall(call, cause);
  if (call.state === 'vigente') this.setState(call, 'suspendida', `suspendida: ${cause}`);
};
P.resumeCall = function resumeCall(call) { if (call && call.state === 'suspendida') this.setState(call, 'vigente', 'la ficha vuelve a ser realizable'); };
P.consumeCall = function consumeCall(poss, playId) {
  const call = this.callFor(poss);
  if (!call || call.content.playId !== playId) return;
  call.execution = { play: playId, possession: poss.id, step: this.stepSeq };
  this.setState(call, 'consumida', `la ficha ${playId} comenzó en la posesión ${poss.id}`);
  this.linkOrder(call.id, 'llamada iniciada');
};
P.expireCallsFor = function expireCallsFor(poss) {
  for (const o of this.orders) {
    if (o.kind !== 'call' || (o.state !== 'vigente' && o.state !== 'suspendida') || o.bound !== poss.id) continue;
    const why = o.notes.length ? o.notes.join('; ') : 'la ficha no llegó a iniciarse';
    this.setState(o, 'caducada', `terminó la posesión ${poss.id}: ${why}`);
  }
};

// ---------------------------------------------------------------- ventanas: tiempos muertos y quinteto manual
P.grantTimeouts = function grantTimeouts(w) {
  const cfg = this.cfg?.timeOuts; if (!cfg) return [];
  const granted = [];
  const pend = this.orders.filter((o) => o.type === 'timeout' && o.state === 'pendiente' && w.timeoutTeams.includes(o.team));
  for (const o of pend) {
    const al = timeoutAllowance(this.timeouts[o.team], this.period, this.clock, cfg, this.profile.rules);
    if (al.effective <= 0) { this.setState(o, 'caducada', `no se pudo conceder: ${al.reason ?? 'cupo agotado'}`); continue; }
    const block = chargeTimeout(this.timeouts[o.team], this.period, this.clock, cfg, this.profile.rules);
    const pts = this.cfg.timeOutRecoveryEnergyPoints;
    this.recoverAll(pts); // una vez por tiempo muerto concedido, a todos los disponibles de ambos equipos
    this.clockRunning = false;
    const after = timeoutAllowance(this.timeouts[o.team], this.period, this.clock, cfg, this.profile.rules);
    this.pendingLinks.push({ id: o.id, role: 'tiempo muerto concedido' });
    const ev = this.emit('timeout', {
      team: o.team,
      intent: { origen: 'solicitud manual', solicitud: o.id, motivo: o.content.reason ?? null },
      effects: { ventana: w.reason, bloque: block, restantesBloque: after.remaining, duracionReglamentariaSegundos: cfg.durationSeconds, recuperacionEnergia: pts, destinatarios: 'todos los jugadores disponibles de ambos equipos' },
    });
    this.cover('tiempo muerto');
    o.execution = { eventIds: [ev.id], window: w.reason, restantesBloque: after.remaining };
    this.setState(o, 'consumida', `concedido en ${w.reason}`);
    granted.push(ev);
  }
  return granted;
};
P.expireTimeoutRequests = function expireTimeoutRequests(cause) {
  for (const o of this.orders) if (o.type === 'timeout' && o.state === 'pendiente') this.setState(o, 'caducada', cause);
};

// Aplica la orden de quinteto pendiente del equipo en esta ventana, si procede. Conjunto atómico: o se aplica entera o espera.
P.applyManualLineups = function applyManualLineups(team, window, shooter) {
  const o = this.orders.find((x) => x.kind === 'lineup' && x.team === team && x.state === 'pendiente');
  if (!o) return;
  const target = o.content.target;
  const changes = [];
  for (const s of SLOTS) if (this.lineup[team][s] !== target[s]) changes.push({ slot: s, out: this.lineup[team][s], in: target[s] });
  if (!changes.length) { this.setState(o, 'consumida', 'el quinteto ya estaba en pista'); return; }
  for (const c of changes) {
    if (!this.ps[c.in].available) { this.setState(o, 'caducada', `${c.in} ya no está disponible`); return; }
    if (this.ps[c.in].onCourt) { this.setState(o, 'caducada', `${c.in} ya está en pista: la situación cambió antes de aplicarse`); return; }
  }
  for (const c of changes) {
    if (shooter && c.out === shooter) { this.setWait(o, 'pendiente: el lanzador de libres no puede salir antes de tirar'); return; }
    if (this.ps[c.out].available && (this.ps[c.out].locked || this.ps[c.in].locked)) { this.setWait(o, 'pendiente: reentrada inmediata, espera a que corra el reloj'); return; }
  }
  const eventIds = [];
  for (const c of changes) eventIds.push(this.substitute(team, c.slot, c.out, c.in, 'orden manual', { window, order: o.id }).id);
  this.lineupControl[team] = { mode: 'manual', cause: 'quinteto fijado por orden manual', orderId: o.id, desdePeriodo: this.period };
  for (const d of this.orders) if (d.type === 'delegate' && d.team === team && d.state === 'vigente') { d.supersededBy = o.id; this.setState(d, 'sustituida', `sustituida por ${o.id}`); }
  o.execution = { eventIds, window, cambios: changes.map((c) => ({ posicion: c.slot, sale: c.out, entra: c.in })) };
  this.setState(o, 'consumida', `aplicada en ${window}`);
};

// ---------------------------------------------------------------- cierre de periodo y de partido
P.releaseLineupControl = function releaseLineupControl() {
  for (let t = 0; t < 2; t++) if (this.lineupControl[t].mode === 'manual') this.lineupControl[t] = { mode: 'auto', cause: 'terminó el periodo' };
};
P.closeOrdersAtFinish = function closeOrdersAtFinish() {
  for (const o of this.orders) if (!TERMINAL_STATES.has(o.state) && o.state !== 'vigente') this.setState(o, 'caducada', 'terminó el partido');
  for (const o of this.orders) if (o.kind === 'call' && (o.state === 'vigente' || o.state === 'suspendida')) this.setState(o, 'caducada', 'terminó el partido');
};

// ---------------------------------------------------------------- consulta para la interfaz y el registro
P.planView = function planView(team) {
  const plan = this.teams[team].plan;
  const pending = this.orders.filter((o) => o.team === team && (o.state === 'pendiente' || o.state === 'vigente') && o.kind !== 'plan' || (o.team === team && o.kind === 'plan' && o.state === 'pendiente'));
  return {
    styles: { ...plan.styles }, playbook: plan.playbook.map((b) => ({ ...b })), directorPriority: [...plan.directorPriority],
    lineup: { ...this.lineup[team] }, projectedLineup: this.projectedLineup(team), lineupControl: { ...this.lineupControl[team] },
    timeouts: this.timeoutStatus(team), pending,
  };
};
P.describeOrder = function describeOrder(o) {
  const c = o.content;
  switch (o.type) {
    case 'styles': return `Estilos: ${Object.entries(c.styles).map(([k, v]) => `${k} = ${v}`).join(', ')}`;
    case 'priorities': return `Prioridades: ${Object.entries(c.priorities).map(([k, v]) => `${k} = ${v}`).join(', ')}`;
    case 'director': return `Director y alternativas: ${c.directorPriority.join(' › ')}`;
    case 'delegate': return 'Devolver la gestión del quinteto al entrenador básico';
    case 'call': return `Llamar ${c.playId} (${c.target === 'current' ? 'posesión actual' : 'siguiente posesión propia'})`;
    case 'substitution': return `Cambio: ${(c.swaps ?? []).map((s) => `sale ${s.out}, entra ${s.in}`).join('; ')}`;
    case 'lineup': return `Quinteto: ${SLOTS.map((s) => `${s} ${c.assignment?.[s] ?? c.target?.[s] ?? '—'}`).join(' · ')}`;
    case 'timeout': return `Tiempo muerto${c.reason ? ` (${c.reason})` : ''}`;
    default: return o.type;
  }
};
