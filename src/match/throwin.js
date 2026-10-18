// Saques de banda y fondo (MOTOR-06): las seis fichas ofensivas (SaqB01–SaqB03, SaqF01–SaqF03) y las seis respuestas defensivas
// (DSaqB01–DSaqB03, DSaqF01–DSaqF03) del anexo C, sobre las MISMAS operaciones de recepción, desmarque, pantalla, pase, negación y finalización.
// No hay una probabilidad de recepción ni de canasta por ficha: una recepción se resuelve contra su defensor (calidad previa y negación) y puede
// ser negada; entonces el sacador evalúa la alternativa y la seguridad DENTRO del mismo plazo de cinco segundos (que no se reinicia) o comete
// infracción/error. Tres tiempos distintos: plazo administrativo de soltar, reloj de juego y reloj de posesión (este último arranca al primer toque).
// El contenido (roles, enfoques, continuaciones, respuestas) vive en `profile.throwInRepertoire`; las magnitudes, en `profile.throwIns`.
import { MatchCore } from './core.js';
import { fit } from './plays.js';
import { vocationFactor } from './formulas.js';
import { round } from './mathx.js';

const P = MatchCore.prototype;
const ZONE_TEC = { three: 'TEC01', midrange: 'TEC02', inside: 'TEC03', rim: 'TEC04' };
const TASK_ROLE = { TAR03: 'receiver', TAR04: 'screener', TAR02: 'handler', TAR07: 'passer', TAR05: 'post' };
const SCREEN_COVERAGE = { type: 'indirect', ball: 'receiver', mover: 'screener', navigator: 'receiver', screenerRole: 'screener', allowed: ['COB01', 'COB02'] };

P.tr = function tr() { return this.profile.throwInRepertoire; };
P.tcfg = function tcfg() { return this.profile.throwIns; };
P.chainOpen = function chainOpen(poss) { return !!poss?.chain && poss.chain.status === 'abierta'; };

// ---------------------------------------------------------------- plan: libro, sacador, respuesta
P.throwBook = function throwBook(team) { return this.teams[team].plan.throwInBook ?? []; };

// Sacador: preferido → alternativo → política funcional (receta de Pase vigente y roles compatibles, desempate estable). Nunca se inventa un ID fijo.
P.chooseServer = function chooseServer(team, kind) {
  const cfg = this.teams[team].plan.throwInServers?.[kind] ?? {};
  const ok = (id) => id && this.ps[id]?.onCourt && this.ps[id].available && this.pl[id].teamIdx === team;
  if (ok(cfg.preferred)) return { id: cfg.preferred, via: 'preferido' };
  if (ok(cfg.alternate)) return { id: cfg.alternate, via: cfg.preferred ? 'alternativo (el preferido no está en pista)' : 'alternativo' };
  const cands = this.onCourt(team).filter((id) => this.ps[id].available).map((id) => ({ id, w: this.taskValue('TAR07', 'attack', { passer: id }) * this.roleBias(id, ['passer', 'safety', 'director']) }));
  cands.sort((a, b) => b.w - a.w || (a.id < b.id ? -1 : 1));
  return { id: cands[0].id, via: 'política funcional (receta de Pase y roles compatibles)' };
};

// Peso de un candidato a una función del saque: receta de la tarea de la función (misma que en el resto del motor) × sesgo de rol (una vez).
P.throwRoleWeight = function throwRoleWeight(pid, def) {
  let w = fit(this.profile, this.taskValue(def.task, 'attack', { [TASK_ROLE[def.task]]: pid })) * this.roleBias(pid, def.tags ?? []);
  if (def.finisher) w *= vocationFactor(this.profile, this.pl[pid].finishingVocation);
  return w;
};
// Funciones de la ficha ocupadas por jugadores en pista distintos del sacador. Una opcional (p. ej. el bloqueador) puede quedar vacía.
P.assignThrowRoles = function assignThrowRoles(team, playId, server) {
  const spec = this.tr().plays[playId]; const roles = {}; const taken = new Set([server]);
  for (const [role, def] of Object.entries(spec.roles)) {
    const cands = this.onCourt(team).filter((id) => this.ps[id].available && !taken.has(id));
    if (!cands.length) { if (def.opt) continue; return { fail: `falta un jugador para «${def.label ?? role}»` }; }
    const items = cands.map((id) => ({ key: id, w: this.throwRoleWeight(id, def) }));
    const pk = cands.length === 1 ? items[0] : this.pick(items, `saque:rol:${playId}:${role}`);
    roles[role] = pk.key; taken.add(pk.key);
  }
  return { roles };
};

// ---------------------------------------------------------------- llamada puntual de saque (próximo saque compatible propio dentro del periodo actual)
P.throwCallFor = function throwCallFor(team, kind) {
  return this.orders.find((o) => o.type === 'throwInCall' && o.team === team && o.state === 'pendiente' && o.scope.period === this.period && this.tr().plays[o.content.playId]?.kind === kind) ?? null;
};
P.consumeThrowCall = function consumeThrowCall(call, playId, poss) {
  call.execution = { play: playId, possession: poss.id, step: this.stepSeq };
  this.setState(call, 'consumida', `la ficha ${playId} comenzó en el saque de la posesión ${poss.id}`);
  this.linkOrder(call.id, 'llamada de saque iniciada');
};
P.expireThrowCalls = function expireThrowCalls(period, cause) {
  for (const o of this.orders) if (o.type === 'throwInCall' && o.state === 'pendiente' && o.scope.period <= period) this.setState(o, 'caducada', cause);
};

// ---------------------------------------------------------------- respuesta defensiva (un encargo contextual, no seis porcentajes sumados)
P.throwDefense = function throwDefense(poss, kind, server) {
  const team = poss.team; const defT = 1 - team; const rep = this.tr();
  const dplan = this.teams[defT].plan; const cfg = dplan.throwInDefense ?? {};
  const dflt = this.tcfg()[kind === 'band' ? 'defaultBandDefensiveResponse' : 'defaultEndlineDefensiveResponse'];
  const notes = []; let id = cfg[kind] ?? dflt;
  let resp = rep.responses[id];
  if (!resp || resp.kind !== kind) { notes.push(`la respuesta ${id} no corresponde a un saque de ${rep.kinds[kind].label.toLowerCase()}: se aplica ${dflt}`); id = dflt; resp = rep.responses[id]; }
  const out = { id, name: resp.name, resp, notes, deny: false, concede: false, target: null, press: null, chase: null };
  const mine = (pid) => pid && this.ps[pid]?.onCourt && this.ps[pid].available && this.pl[pid].teamIdx === team;
  if (resp.denyTarget) {
    if (mine(cfg.target)) out.target = cfg.target;
    else { notes.push('el objetivo designado no está en pista o no se designó: se aplica la alternativa vigente de la defensa de fondo'); id = dflt; resp = rep.responses[id]; out.id = id; out.name = resp.name; out.resp = resp; out.suspended = 'DSaqF02'; }
  }
  if (resp.denyFirst) out.deny = true;
  if (resp.protectRim) out.concede = true; // proteger el aro concede la recepción exterior
  if (resp.chaseOrSwitch) {
    const cob = dplan.coverage;
    if (['COB01', 'COB02'].includes(cob)) out.chase = cob;
    else notes.push(`${out.id} necesita persecución o cambio y la cobertura declarada (${cob}) no es compatible: sin efecto de cobertura en el saque`);
  }
  if (resp.pressServer) {
    const sm = this.defenderFor(server);
    const ref = this.defRef(defT); const org = this.drep().organizations[ref.org];
    const dedicated = org.dedicated ? ref.fnOwner[org.chaser] : null;
    if (!sm) notes.push('la estructura defensiva no asigna defensor al sacador: no hay presión');
    else if (sm === dedicated) notes.push('el defensor del sacador es el perseguidor dedicado del box and one: mantiene su encargo y no presiona');
    else if (this.protectedAttackers(defT).has(this.responsibilityOf(sm))) notes.push('el defensor del sacador no puede abandonar al tirador protegido: sin presión');
    else { out.press = sm; this.commit(sm, 'presión al sacador'); this.cover('presión al sacador'); }
  }
  return out;
};

// ---------------------------------------------------------------- una opción de recepción (misma resolución de calidad y negación)
P.prepareOption = function prepareOption(poss, spec, optSpec, role, pid, roles, server, def, idx) {
  const team = poss.team;
  const cutting = optSpec.approach === 'cut';
  const zone = cutting ? 'rim' : (optSpec.zones?.[0] ?? 'three');
  const mk = this.defenderFor(pid); const open = mk == null;
  const ex = { team, origin: spec.id, kind: 'continuation', actor: pid, exec: 'pass', passer: server, holder: server, zone, moved: false, offContact: null,
    icpt: mk, defend: open ? null : (cutting ? (this.shotDefenderFor(pid, 'rim') ?? mk) : mk), window: open, role: 'receiver', procedencia: 'saque', throwOption: idx };
  // pantalla compatible: persecución, cambio, etc. con los dos defensores reales (la cobertura declarada, solo si es compatible)
  let cvk = { k: 0, spaceFromCoverage: false };
  if (optSpec.approach === 'screen' && roles[optSpec.screener]) {
    const entry = { spec: { coverage: SCREEN_COVERAGE }, roles: { receiver: pid, screener: roles[optSpec.screener] } };
    this.poss.coverage = null;
    // DSaqB02/DSaqF03 resuelven persecución o cambio según la cobertura declarada; con otra respuesta el encargo principal está en otra tarea y la pantalla solo se sigue
    const cov = this.beginCoverage(entry, poss, { cob: def.chase ? null : 'COB01' });
    cvk = this.coverageForExit(ex, cov);
    if (cov && !cov.none) ex.cobertura = { id: cov.cob, ...cov.info }; else if (cov?.info?.limitada) ex.cobertura = { id: cov.cob, ...cov.info };
  } else if (optSpec.approach === 'screen') ex.sinBloqueador = true;
  // respuesta defensiva: negar (primera opción / objetivo) o conceder (proteger el aro concede lo exterior); en otro caso, la decisión de estilo habitual
  if (def.deny && idx === 0) ex.forceDeny = true;
  if (def.target && pid === def.target) ex.forceDeny = true;
  if (def.concede && !cutting) ex.forceConcede = true;
  return { ex, cvk, cutting };
};

P.optionQuality = function optionQuality(poss, ex, cvk, def, server) {
  ex.deferSteal = true;
  const intent = this.defenseIntent(ex); // negar o facilitar (una vez); la decisión de intervenir sobre el balón solo se toma si el envío forzado compite como pérdida
  let k = cvk.k;
  let q;
  const ca = this.taskValue('TAR03', 'attack', { receiver: ex.actor });
  if (ex.window || !ex.defend) q = this.qualityOf(ex, ca, 0, k, false);
  else {
    let cd = this.taskValue('TAR03', 'defense', { receiverMarker: ex.defend });
    if (def.press) { // presión al sacador: dos defensores en la misma tarea de negar el envío (mezcla 0,65/0,35; no se suma la defensa completa de ambos)
      const m = this.dcfg().coverage.sameTaskTwoDefenderMixture;
      cd = m.primary * cd + m.second * this.taskValue('TAR07', 'defense', { interceptor: def.press });
      ex.presionSacador = def.press;
    }
    q = this.qualityOf(ex, ca, cd, k, true);
  }
  ex.quality = q; ex.defTrace = intent;
  return q;
};

// ---------------------------------------------------------------- secuencia completa de un saque
// Devuelve null si no corresponde una ficha (saque administrativo de centro, libro vacío…): entonces la administración existente sigue igual.
P.throwInPhase = function throwInPhase(poss, spec) {
  const kind = spec.kind; const team = poss.team;
  if (kind !== 'band' && kind !== 'endline') return null;
  if (!(this.profile.activeCatalog.throwInPlays ?? []).length) return null;
  const rep = this.tr(); const cfg = this.tcfg(); const rules = this.profile.rules;
  const running = this.clockRunning && !spec.frontcourt;
  const minPrep = Math.round(cfg.newOptionPreparationSeconds[0] * 10); const minRel = Math.round(cfg.newReleasePassSeconds[0] * 10);
  if (running && this.clock <= minPrep + minRel + 1) return null; // sin tiempo para la secuencia: la administración existente decide
  const call = this.throwCallFor(team, kind);
  // libro del tipo de saque + llamada puntual (aunque la ficha no esté activa en el libro)
  const book = this.throwBook(team).filter((b) => rep.plays[b.playId]?.kind === kind);
  const ids = [...book.map((b) => b.playId)]; if (call && !ids.includes(call.content.playId)) ids.push(call.content.playId);
  if (!ids.length) return null;
  const sv = this.chooseServer(team, kind);
  const server = sv.id;
  // elegibilidad ANTES de preferencia: participantes realizables (se revalidan en este saque, con el quinteto actual)
  const el = []; const diag = [];
  for (const id of ids) {
    const priority = book.find((b) => b.playId === id)?.priority ?? null;
    el.push({ playId: id, priority: priority ?? 1, called: priority == null });
    diag.push({ ficha: id, prioridad: priority, elegible: true });
  }
  this.note('saque:elegibilidad', { tipo: kind, sacador: server, fichas: diag });
  let playId;
  const pw = cfg.priorityWeights; const vb = cfg.eligibleVariantBaseWeight;
  if (call && el.some((e) => e.playId === call.content.playId)) playId = call.content.playId;
  else {
    const items = el.filter((e) => !e.called).map((e) => ({ key: e.playId, w: pw[e.priority - 1] * vb }));
    if (!items.length) return null;
    playId = items.length === 1 ? items[0].key : this.pick(items, 'saque:ficha').key;
  }
  const play = rep.plays[playId]; const pspec = { id: playId, ...play };
  const asg = this.assignThrowRoles(team, playId, server);
  if (asg.fail) { if (call) this.noteCall(call, `${playId} no realizable: ${asg.fail}`); return null; }
  const roles = asg.roles;
  const fromCall = !!(call && call.content.playId === playId);
  if (fromCall) this.consumeThrowCall(call, playId, poss);
  // la respuesta defensiva se fija una vez para todo el saque
  const def = this.throwDefense(poss, kind, server);
  // cadena analítica de saque: empieza con su ejecución efectiva y termina por resultado o nueva organización (no por segundos fijos)
  this.closeOpenChain(poss); // la cadena anterior de esta misma posesión (si quedó abierta) termina aquí
  this.chainSeq += 1;
  const chain = { id: `S${String(this.chainSeq).padStart(3, '0')}`, possession: poss.id, period: this.period, team, kind, origen: spec.origin, ficha: playId, sacador: server, via: sv.via, respuesta: def.id, respuestaOriginal: def.suspended ?? null, llamada: fromCall, criterioDeCierre: this.tcfg().directSequenceEnd, status: 'abierta', cierre: null, receptor: null, opcionUsada: null, intentos: [], puntosDirectos: 0, accepting: true, tail: false, plazo: { limiteDecimas: rules.throwInReleaseSeconds * 10, usadoDecimas: 0 } };
  this.throwChains.push(chain); poss.chain = chain; poss.throwInOrigin = { id: chain.id, play: playId };
  this.cover(playId); this.cover(def.id); this.cover(`saque de ${rep.kinds[kind].label.toLowerCase()}`);
  for (const n of def.notes) this.note('saque:respuesta_limitada', { nota: n });
  // ---- opciones: primera, alternativa y seguridad, dentro de un único plazo (la preparación de cada una consume plazo; el envío no lo prolonga)
  const deadline = rules.throwInReleaseSeconds * 10;
  const tried = new Set(); let prepSum = 0; const preps = [];
  const options = [];
  const optList = [
    { idx: 0, kind: 'primera', spec: play.first, role: play.first.role },
    { idx: 1, kind: 'alternativa', spec: play.alternative, role: play.alternative.role },
    { idx: 2, kind: 'seguridad', spec: { approach: 'free', cont: play.safety.cont, role: null }, role: null },
  ];
  let delivered = null; let violation = false;
  const prepDist = cfg.newOptionPreparationSeconds;
  for (const o of optList) {
    // receptor de la opción: el de su función o, para la seguridad, el compañero con balón seguro (receta CONT08) aún no probado
    let pid;
    if (o.role) pid = roles[o.role];
    else {
      const cands = this.onCourt(team).filter((id) => id !== server && this.ps[id].available && !tried.has(id));
      if (!cands.length) break;
      pid = cands.length === 1 ? cands[0] : this.pick(cands.map((id) => ({ key: id, w: this.weightedSum(id, this.profile.selection.safeReceiverWeights) })), 'saque:receptor_seguro').key;
    }
    if (!pid || tried.has(pid)) { const alt = this.onCourt(team).filter((id) => id !== server && this.ps[id].available && !tried.has(id)); if (!alt.length) break; pid = alt[0]; }
    // preparar la opción consume plazo administrativo (no se recorta para que quepa)
    const prep = this.sampleDuration(prepDist, `saque:preparación opción ${o.idx + 1}`);
    prepSum += prep; preps.push(prep);
    if (prepSum >= deadline) { violation = true; options.push({ opcion: o.kind, receptor: pid, preparacionDecimas: prep, sinPlazo: true }); break; }
    const { ex, cvk, cutting } = this.prepareOption(poss, pspec, o.spec, o.role ?? 'safety', pid, roles, server, def, o.idx);
    const q = this.optionQuality(poss, ex, cvk, def, server);
    const denied = q.cls === 'forced' && !ex.window;
    tried.add(pid);
    options.push({ opcion: o.kind, receptor: pid, enfoque: cutting ? 'corte' : o.spec.approach, calidad: q.cls, negada: denied, ventanaLibre: !!ex.window, defensor: ex.defend ?? null, preparacionDecimas: prep, ...(ex.cobertura ? { cobertura: ex.cobertura } : {}), ...(ex.defTrace && Object.keys(ex.defTrace).length ? { defensa: ex.defTrace } : {}) });
    chain.intentos.push({ opcion: o.kind, receptor: pid, negada: denied });
    if (!denied) { delivered = { o, ex, pid, q, cutting }; break; }
    this.cover(o.idx === 0 ? 'primera opción de saque negada' : o.idx === 1 ? 'alternativa de saque negada' : 'seguridad de saque negada');
    delivered = { o, ex, pid, q, cutting, last: true, deniedAll: true };
  }
  chain.plazo.usadoDecimas = Math.min(prepSum, deadline);
  const deniedAll = delivered?.deniedAll === true && !violation;
  if (!delivered && !violation) violation = true; // sin ninguna opción posible: no se inventa una recepción
  const traceBase = { origen: spec.origin, saque: kind, ficha: playId, nombre: play.name, procedencia: fromCall ? 'llamada' : 'libro', sacador: server, viaSacador: sv.via, respuestaDefensiva: def.id, respuestaNombre: def.name, ...(def.suspended ? { respuestaSuspendida: def.suspended } : {}), ...(def.notes.length ? { limitaciones: def.notes } : {}), roles, opciones: options, plazo: { limiteDecimas: deadline, preparacionDecimas: prepSum }, relojDeJuegoEnMarcha: running, cadena: chain.id };
  // ---- tiempo: el plazo es administrativo; solo corre el reloj de juego si nunca se paró (canasta con reloj en marcha). El reloj de posesión arranca al primer toque.
  const consumeAdmin = (tenths) => {
    if (!running) return this.snap();
    const wasOn = this.shotClockOn; this.shotClockOn = false;
    try { return this.consume(tenths, 'organized'); } finally { this.shotClockOn = wasOn; }
  };
  const total = (violation ? Math.min(prepSum, deadline) : prepSum);
  if (running && total >= this.clock) {
    const wasOn = this.shotClockOn; this.shotClockOn = false;
    try { return this.expire({ team, origin: playId }, 'saque'); } finally { this.shotClockOn = wasOn; }
  }
  if (violation) {
    const t = consumeAdmin(total);
    this.emit('expiry', { team, t, intent: { ...traceBase, motivo: 'violación de 5 segundos del sacador: no suelta el balón dentro del plazo' }, participants: { sacador: server }, stats: [{ k: 'tov', p: null, team, cause: 'violacion_5' }], effects: { fin: 'posesion', plazoAgotado: true } });
    this.cover('violación de 5 s en el saque'); this.closeChain(poss, 'infracción del plazo');
    this.endPossession('deadTurnover', { team });
    return { end: 'deadTurnover' };
  }
  // ---- envío (una sola causa de pérdida: si nadie queda libre, el envío forzado puede perderse, desviarse, provocar falta o completarse)
  const rel = this.sampleDuration(cfg.newReleasePassSeconds, 'saque:envío');
  const d = delivered; const { ex } = d;
  if (running && total + rel >= this.clock) {
    const wasOn = this.shotClockOn; this.shotClockOn = false;
    try { return this.expire({ team, origin: playId }, 'saque'); } finally { this.shotClockOn = wasOn; }
  }
  const t = consumeAdmin(total + rel);
  if (deniedAll) {
    // todas las opciones negadas: el envío forzado compite en la categoría habitual (pérdida con robo, falta, desvío o recepción forzada)
    this.note('saque:envío_forzado', { receptor: d.pid });
    if (ex.icpt) this.decideSteal(ex, ex.defTrace ?? {});
    ex.quality = { cls: 'forced', K: this.profile.opportunity.qualityShotLogit.forced, z: d.q.z };
    const w = this.categoryWeights(ex);
    const items = [{ key: 'turnover', w: w.turnover ?? 0 }, { key: 'foul', w: (w.defensiveNonShootingFoul ?? 0) }, { key: 'looseBall', w: w.looseBall ?? 0 }, { key: 'delivered', w: w.fieldShot ?? 0 }].filter((i) => i.w > 0);
    const cat = this.pick(items, 'saque:envío forzado').key;
    const base = { t, team, intent: { ...traceBase, categoria: cat, ejecucion: 'pase', calidad: 'forced', negadas: options.length }, participants: { sacador: server, receptor: d.pid, defensor: ex.defend ?? null, interceptor: ex.icpt ?? null } };
    if (cat === 'turnover') { this.closeChain(poss, 'resultado: pérdida en el saque'); return this.resolveTurnover(ex, base); }
    if (cat === 'foul') { this.closeChain(poss, 'resultado: falta en el saque'); ex.passer = server; return this.resolveDefensiveFoul(ex, base); }
    if (cat === 'looseBall') { this.closeChain(poss, 'resultado: desvío'); return this.resolveLooseBall(ex, base); }
    // recepción forzada: el receptor controla sin ventaja alguna
    return this.completeThrowIn(poss, spec, traceBase, t, d, options, running, true);
  }
  return this.completeThrowIn(poss, spec, traceBase, t, d, options, running, false);
};

// Recepción real: el balón queda en control del receptor; la continuidad usa el mismo núcleo (aceptación de oportunidad inmediata o nueva organización).
P.completeThrowIn = function completeThrowIn(poss, spec, traceBase, t, d, options, running, forced) {
  const team = poss.team; const rep = this.tr(); const { ex, o, pid } = d;
  const chain = poss.chain;
  chain.receptor = pid; chain.opcionUsada = o.kind;
  this.emit('throw_in', { t, team, intent: { ...traceBase, resultado: 'recepción', opcionUsada: o.kind, continuidad: rep.continuations[o.spec.cont] }, participants: { sacador: ex.passer, receptor: pid, primeraOpcion: options[0]?.receptor ?? null }, effects: { recibe: pid, opcionUsada: o.kind, negaciones: options.filter((x) => x.negada).length, calidadDeLaRecepcion: ex.quality?.cls ?? null, forzada: forced, cadena: chain.id } });
  this.cover(`saque: recibe la ${o.kind} opción`);
  poss.carrierPid = pid; poss.advanced = poss.advanced || false;
  poss.early = running;
  // continuidad: la misma aceptación de oportunidad inmediata de ESP06; si no se acepta, el receptor continúa (organiza o ataca temprano)
  if (!forced && (o.spec.cont === 'shot' || o.spec.cont === 'rim')) {
    const zones = o.spec.cont === 'rim' ? ['rim'] : (o.spec.zones ?? ['three']);
    const dec = this.libertyAndReading(team, pid);
    const cand = zones.map((zone) => ({ key: `${pid}:${zone}`, role: 'saque', actor: pid, zone, exec: 'none', passer: null, icpt: null, defend: ex.defend, moved: false, offContact: null, holder: pid, window: !!ex.window }));
    const sc = this.scoreExits(team, cand, null, 'TAR03');
    const pk = cand.length === 1 ? sc[0] : this.pick(this.mixIntention(sc.map((x) => this.exitItem(x)), dec, `saque:${traceBase.ficha}:salida`), `saque:${traceBase.ficha}:salida`).exit;
    const pAcc = this.acceptance(team, pid, this.eff(pid, ZONE_TEC[pk.zone]));
    const accepted = this.bernoulli(pAcc, `saque:aceptación:${pk.zone}`);
    this.logOpp({ frontier: 'acceptance', situacion: `${traceBase.ficha}:${o.spec.cont}`, aceptada: accepted, decide: pid, pAceptacion: round(pAcc, 4) });
    if (accepted) {
      const sx = { ...pk };
      Object.assign(sx, { team, origin: traceBase.ficha, kind: 'continuation', roles: { sacador: ex.passer, receptor: pid }, procedencia: 'saque', contexto: 'saque', quality: ex.quality, window: !!ex.window, espTags: ex.window ? ['ESP06'] : [], directo: true });
      if (ex.window) this.cover('ESP06 recepción liberada');
      poss.early = false; poss.playStarted = true;
      return this.resolveAttempt(sx);
    }
  }
  return { cont: 'throwIn' };
};

// ---------------------------------------------------------------- cadena de saque: frontera y producción directa
P.closeChain = function closeChain(poss, how) {
  const c = poss?.chain; if (!c || c.status !== 'abierta') return;
  c.status = 'cerrada'; c.cierre = how;
};
// MOTOR-17 §6.1 (H-AUD26-002): una cadena que ya entregó y cuya posesión termina (o se reanuda con otro saque) por un desenlace distinto del primer tiro —falta tras un avance con contacto, tiros libres, balón
// suelto— quedaba `abierta` porque solo la cerraba un tiro. Cierre solo de REGISTRO, con la causa del último hecho de la posesión: no cambia hechos, sorteos ni la producción directa (que sigue el hook).
const CHAIN_END_CAUSE = { foul: 'falta', free_throw: 'tiros libres tras falta', loose_ball: 'balón suelto', attempt: 'tiro o pérdida', advance: 'avance presionado', expiry: 'violación de reloj', rebound: 'rebote', reorganization: 'reorganización', timeout: 'tiempo muerto', substitution: 'cambio' };
P.closeOpenChain = function closeOpenChain(poss) {
  const c = poss?.chain; if (!c || c.status !== 'abierta') return;
  const last = this.events[this.events.length - 1];
  const how = last && last.possessionId === poss.id ? (CHAIN_END_CAUSE[last.type] ?? last.type) : 'cambio de posesión';
  this.closeChain(poss, `resultado: ${how}`);
};
// Llamado desde emit: asocia el hecho a la cadena abierta y acumula la producción DIRECTA (no los puntos de una posesión ya reorganizada).
P.chainHook = function chainHook(ev) {
  const poss = this.poss; const c = poss?.chain; if (!c || ev.possessionId !== poss.id || ev.type === 'throw_in') return;
  // MOTOR-15B §5.3: cierre legible. Una cadena no se queda «abierta» tras un desenlace ya ocurrido en su posesión; solo registro (no cambia hechos, sorteos ni marcador). Un final de periodo que
  // impide el desarrollo es una INTERRUPCIÓN, no una ejecución terminada: estado propio `interrumpida`, fuera del universo de las tasas de cadenas ejecutadas.
  if (c.status === 'abierta') {
    if (ev.type === 'period_end' || (ev.type === 'expiry' && ev.effects?.fin === 'periodo')) { c.status = 'interrumpida'; c.cierre = 'interrumpida: final de periodo'; }
    else if (ev.type === 'expiry') { // violaciones de reloj con balón muerto; la de 5 s del sacador la cierra su propia ruta («infracción del plazo») justo después de emitir
      const cause = (ev.stats ?? []).find((x) => x.k === 'tov')?.cause;
      if (cause === 'violacion_24') this.closeChain(poss, 'resultado: violación de reloj de posesión'); else if (cause === 'violacion_8') this.closeChain(poss, 'resultado: violación de 8 segundos');
    }
    else if (ev.type === 'advance' && ev.effects?.perdida) this.closeChain(poss, 'resultado: pérdida en el avance presionado');
  }
  const direct = c.status === 'abierta' || c.tail;
  if (!direct) return;
  let pts = 0;
  for (const st of ev.stats ?? []) { if (st.k === 'shot' && st.made && st.team === c.team) pts += st.points; if (st.k === 'ft' && st.made && st.team === c.team) pts += 1; }
  c.puntosDirectos += pts;
  if (ev.type === 'attempt') {
    ev.intent = { ...(ev.intent ?? {}), cadenaSaque: c.id };
    if (c.status === 'abierta') { this.closeChain(poss, 'resultado'); c.tail = !!ev.effects?.falta || !!ev.effects?.faltaDefensiva; }
  } else if (ev.type === 'free_throw' && ev.effects?.ultimo) c.tail = false;
  else if (ev.type !== 'foul' && ev.type !== 'free_throw') c.tail = false;
};
