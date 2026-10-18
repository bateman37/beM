// Administración de incidencias tipadas y cola causal común de sanciones (MOTOR-15 §5.3, §6.1). Una incidencia entra como HECHO TIPADO (técnica de jugador, banquillo o entrenador, flagrante, disruptiva)
// por `requestIncident` (comando registrado y reproducible) y se administra en la siguiente frontera estable con las MISMAS funciones que un encuentro natural: matriz REG (`resolveFoul`), contadores,
// cola de sanciones (`combineSanctions`: orden, técnica primero, compensación del art. 43, último derecho) y series de libres reales (`shootFreeThrows`).
// No hay generación natural de técnicas ni de flagrantes: no se deduce mala conducta de las 32 capacidades (MOTOR-15 §5.3). La disruptiva (ESPD01) sí tiene productor natural y su falta pendiente se
// FUSIONA con la cola si llega otra incidencia en la misma parada. Sin azar propio: ni la sanción ni su ejecutor ni quién reanuda se sortean; los libres sí son tiros reales.
import { MatchCore } from './core.js';
import { deepCopy } from './data.js';
import { foulPeriodKey, toTenths, inPenalty } from './rules.js';
import { resolveFoul, combineSanctions, FOUL_CATEGORIES, COUNTER_KEY } from './regs.js';
import { coachDisqualified } from './incidents.js';

const P = MatchCore.prototype;
const pad = (n, w = 3) => String(n).padStart(w, '0');
const PLAYER_CATS = new Set(['tecnica1', 'tecnica2', 'disruptiva', 'flagrante']);
const STAFF_CATS = new Set(['tecnica_banquillo', 'tecnica_entrenador', 'descalificacion_banquillo']);

P.initIncidents = function initIncidents() {
  this.incidentInbox = []; this.incidentSeq = 0; this.sanctionOrder = 0; this.adminPlan = null; this.incidentLog = [];
  this.coachCounters = [{ C: 0, B: 0 }, { C: 0, B: 0 }]; this.coachOut = [false, false]; this.interfStats = {};
};

// ---------------------------------------------------------------- entrada tipada
// `inc`: { category, player? (infractor individual), team? (banquillo/entrenador), fouled? (receptor del contacto en disruptiva/flagrante), shotAction?, shotPoints?, shotMade?, startedLive?, note? }
P.validateIncident = function validateIncident(inc) {
  const bad = (reason) => ({ ok: false, reason });
  if (!inc || typeof inc !== 'object') return bad('la incidencia debe ser un objeto');
  const alias = this.profile.regulation.aliases?.[inc.category];
  if (alias) return bad(`«${inc.category}» es un alias histórico sin categoría propia: clasifica el hecho como ${alias.maps.join(' o ')} (${alias.rule})`);
  if (!FOUL_CATEGORIES.includes(inc.category) || ['personal', 'ofensiva'].includes(inc.category)) return bad(`categoría no admitida como incidencia tipada: «${inc.category}» (admitidas: ${[...PLAYER_CATS, ...STAFF_CATS].join(', ')})`);
  if (STAFF_CATS.has(inc.category)) {
    if (!(inc.team === 0 || inc.team === 1)) return bad('una técnica de banquillo o del entrenador identifica el equipo (0 o 1)');
    if (inc.player) return bad('una técnica de banquillo o del entrenador se imputa al entrenador: no lleva infractor individual');
  } else {
    if (!inc.player || !this.pl[inc.player]) return bad(`infractor desconocido: ${inc.player ?? 'ausente'}`);
    if (!this.ps[inc.player].available) return bad(`${inc.player} ya no está disponible`);
  }
  if (inc.category === 'disruptiva' || inc.category === 'flagrante') {
    if (!inc.fouled || !this.pl[inc.fouled]) return bad('una disruptiva o flagrante exige el jugador que recibió el contacto: no se inventa un receptor');
    if (this.pl[inc.fouled].teamIdx === this.pl[inc.player].teamIdx) return bad('quien recibe el contacto pertenece al equipo rival del infractor');
    if (inc.shotAction && !(inc.shotPoints >= 1)) return bad('una falta en acción de tiro declara el valor del intento');
  }
  if (inc.startedLive && typeof inc.startedLive !== 'boolean') return bad('startedLive es verdadero o falso');
  return { ok: true };
};

P.requestIncident = function requestIncident(inc) {
  this.logCommand('incident', { incident: inc });
  if (this.status === 'finished' || this.status === 'error') return { ok: false, reason: 'el encuentro ya terminó' };
  const v = this.validateIncident(inc);
  if (!v.ok) { this.incidentLog.push({ state: 'rechazada', reason: v.reason, category: inc?.category ?? null, step: this.stepSeq }); return v; }
  const rec = { id: `INC${pad(++this.incidentSeq)}`, ...deepCopy(inc), requestedStep: this.stepSeq };
  this.incidentInbox.push(rec);
  this.incidentLog.push({ id: rec.id, state: 'pendiente', category: rec.category, step: this.stepSeq });
  return { ok: true, id: rec.id, state: 'pendiente', pending: 'se administra en la siguiente frontera estable' };
};

// ---------------------------------------------------------------- unidad de incidencia (frontera propia)
P.incidentUnit = function incidentUnit() {
  if (this.incidentInbox.length) return this.intakeIncidents();
  return this.adminStep();
};

// Clasifica, cuenta y convierte cada incidencia en una sanción de la cola; fusiona la falta pendiente de la parada (si la hay); planifica y emite.
P.intakeIncidents = function intakeIncidents() {
  const rules = this.profile.rules; const inbox = this.incidentInbox.splice(0);
  const sanctions = []; const records = []; let absorbedEx = null;
  if (this.pendingFoul?.sanction) { sanctions.push({ ...this.pendingFoul.sanction }); absorbedEx = this.poss?.pendingFT ?? null; }
  for (const inc of inbox) {
    const staff = STAFF_CATS.has(inc.category);
    const committerTeam = staff ? inc.team : this.pl[inc.player].teamIdx;
    const key = foulPeriodKey(this.period, rules);
    const before = this.teamFouls[committerTeam][key] ?? 0;
    const cons = resolveFoul(this.profile, { category: inc.category, shotAction: !!inc.shotAction, shotPoints: inc.shotAction ? inc.shotPoints : null, shotMade: !!inc.shotMade, penalty: inPenalty(before, rules) });
    if (!cons.ok) { this.incidentLog.push({ id: inc.id, state: 'rechazada', reason: cons.diagnostic, step: this.stepSeq }); continue; }
    const rec = { inc, cons, committerTeam, staff, counters: {}, excluded: false, disqualified: false, coachDisqualified: false };
    if (staff) {
      const code = cons.counter.split(':')[1];
      this.coachCounters[committerTeam][code] += 1; rec.counters = { ...this.coachCounters[committerTeam] };
      if (coachDisqualified(this.profile, this.coachCounters[committerTeam]) && !this.coachOut[committerTeam]) { this.coachOut[committerTeam] = true; rec.coachDisqualified = true; }
    } else {
      const pid = inc.player;
      if (cons.playerFoul) this.ps[pid].fouls += 1;
      if (cons.teamFoul) this.teamFouls[committerTeam][key] = before + 1;
      const sc = this.sanctions(pid); if (COUNTER_KEY[inc.category]) sc[COUNTER_KEY[inc.category]] += 1;
      rec.counters = { ...sc };
      rec.disqualified = this.disqualifies(pid); rec.excluded = rec.disqualified || this.ps[pid].fouls >= rules.foulOut;
      if (rec.excluded) this.exclude(pid);
    }
    rec.sanction = { id: inc.id, order: ++this.sanctionOrder, team: committerTeam, category: inc.category, shotAction: !!inc.shotAction, shotPoints: inc.shotAction ? inc.shotPoints : null, shotMade: !!inc.shotMade, penalty: inPenalty(before, rules), committer: inc.player ?? null, fouled: inc.fouled ?? null, startedLive: !!inc.startedLive };
    sanctions.push(rec.sanction); records.push(rec);
  }
  if (!records.length) return { cont: 'incident' };
  const plan = combineSanctions(this.profile, sanctions, { priorContext: { kind: 'priorContext', shotClock: 'retained' } });
  if (!plan.ok) throw new Error(`cola de sanciones no válida: ${plan.diagnostic}`);
  if (this.pendingFoul?.sanction) { this.pendingFoul = null; if (this.poss) this.poss.pendingFT = null; } // la falta pendiente pasa a la cola común: una sola reanudación efectiva
  const mate = new Map(); for (const [a, b] of plan.compensated) { mate.set(a, b); mate.set(b, a); }
  this.adminPlan = { id: `ADM${pad(this.stepSeq)}`, steps: plan.steps.map((s) => ({ ...s })), index: 0, resume: plan.resume, compensated: plan.compensated, ex: absorbedEx, sanctions: sanctions.map((s) => s.id) };
  for (const r of records) {
    const { inc, cons } = r; const pid = inc.player ?? null; const staff = r.staff;
    const key = foulPeriodKey(this.period, rules);
    const adm = { plan: this.adminPlan.id, orden: r.sanction.order, compensadaCon: mate.get(inc.id) ?? null, pasos: plan.steps.map((s) => s.id), reanudacion: plan.resume.kind, reanudacionDe: plan.resume.from };
    this.emit('foul', {
      team: 1 - r.committerTeam,
      intent: { origen: 'incidencia tipada', tipo: inc.category, nota: inc.note ?? null },
      participants: { infractor: pid, sobre: inc.fouled ?? null },
      stats: staff ? [] : [{ k: 'foul', p: pid, team: r.committerTeam, kind: inc.category, teamFoul: !!cons.teamFoul, sobre: inc.fouled ?? null }],
      effects: {
        categoria: inc.category, regla: cons.row, contraste: cons.contrast, tirosLibres: cons.ft, lanzador: cons.shooter, ...(staff ? { entrenador: { equipo: r.committerTeam, contadores: r.counters, descalificado: r.coachDisqualified } }
          : { faltasPersonales: this.ps[pid].fouls, faltasColectivasPeriodo: this.teamFouls[r.committerTeam][key] ?? 0, contadores: r.counters, descalificado: r.disqualified, excluido: r.excluded }), administracion: adm, id: inc.id,
      },
    });
    this.cover(`incidencia ${inc.category}`);
  }
  if (plan.compensated.length) this.cover('sanciones compensadas (art. 43)');
  this.queueWindow({ reason: 'incidencia', timeoutTeams: [0, 1], subs: true }); // la exclusión/descalificación se resuelve en la ventana reglamentaria antes de los libres
  this.clockRunning = false;
  return { cont: 'incident' };
};

// ---------------------------------------------------------------- consecuencia de RG-I03 (MOTOR-15B §4.2)
// Interferencia defensiva en el último libre: el punto ya está concedido (acreditado una sola vez por la serie original). Aquí se carga al defensor infractor la técnica de categoría 2 con las MISMAS
// reglas que cualquier técnica de jugador (fila RG-F07 por `resolveFoul`, contadores individuales, falta colectiva, retirada por faltas) y se programa su libre adicional en la cola común: lanzador
// por la política existente (`designatedShooter`), tiro real con crédito y posibilidad de fallo, y una única reanudación (`afterLastFreeThrow`: saque de fondo del rival, como tras un último libre válido).
// No hay descalificación de categoría 1 ni nueva posesión por la técnica; no se sortea la sanción, el ejecutor ni la reanudación. El plan vive en `adminPlan`: se guarda y se continúa entre consecuencias.
P.interferenceTechnical = function interferenceTechnical(itf, f, ftEv, seriesId) {
  const spec = itf.res.additionalSanction; const rules = this.profile.rules; const pid = itf.infractor;
  if (!pid || !this.pl[pid]) throw new Error('interferencia defensiva sin infractor individual: no se inventa un sujeto');
  const team = this.pl[pid].teamIdx; const key = foulPeriodKey(this.period, rules); const before = this.teamFouls[team][key] ?? 0;
  const penalty = inPenalty(before, rules);
  const cons = resolveFoul(this.profile, { category: spec.category, shotAction: false, shotPoints: null, shotMade: false, penalty });
  if (!cons.ok) throw new Error(`técnica de la interferencia sin consecuencia válida: ${cons.diagnostic}`);
  if (cons.playerFoul) this.ps[pid].fouls += 1;
  if (cons.teamFoul) this.teamFouls[team][key] = before + 1;
  const sc = this.sanctions(pid); if (COUNTER_KEY[spec.category]) sc[COUNTER_KEY[spec.category]] += 1;
  const counters = { ...sc };
  const disqualified = this.disqualifies(pid); const excluded = disqualified || this.ps[pid].fouls >= rules.foulOut;
  if (excluded) this.exclude(pid);
  const id = `INT${pad(++this.incidentSeq)}`; const order = ++this.sanctionOrder;
  const plan = combineSanctions(this.profile, [{ id, order, team, category: spec.category, shotAction: false, shotPoints: null, shotMade: false, penalty, committer: pid, fouled: null, startedLive: false }], { priorContext: { kind: 'priorContext', shotClock: 'retained' } });
  if (!plan.ok) throw new Error(`cola de sanciones no válida: ${plan.diagnostic}`);
  if (plan.steps.length !== 1 || plan.steps[0].beneficiary !== f.shotTeam) throw new Error('la técnica de la interferencia debe beneficiar al equipo del lanzador del libre');
  const resume = { kind: 'afterLastFreeThrow', from: id, shooterTeam: f.shotTeam, convention: 'RG-I03: reanudación del último libre válido (saque de fondo del rival); la técnica no concede posesión (B15-N1 31.3.3, 36.2/36.3)' };
  this.adminPlan = { id: `ADM${pad(this.stepSeq)}`, steps: plan.steps.map((s) => ({ ...s })), index: 0, resume, compensated: [], ex: null, sanctions: [id], origin: { kind: 'interferencia', situation: itf.situation, event: ftEv.id, series: seriesId, infractor: pid } };
  this.emit('foul', {
    team: f.shotTeam,
    intent: { origen: 'interferencia defensiva en el último libre', tipo: spec.category, vinculo: ftEv.id },
    participants: { infractor: pid, sobre: null },
    stats: [{ k: 'foul', p: pid, team, kind: spec.category, teamFoul: !!cons.teamFoul, sobre: null }],
    effects: {
      categoria: spec.category, regla: cons.row, contraste: cons.contrast, tirosLibres: cons.ft, lanzador: cons.shooter, faltasPersonales: this.ps[pid].fouls, faltasColectivasPeriodo: this.teamFouls[team][key] ?? 0,
      contadores: counters, descalificado: disqualified, excluido: excluded, id,
      administracion: { plan: this.adminPlan.id, orden: order, compensadaCon: null, pasos: plan.steps.map((s) => s.id), reanudacion: resume.kind, reanudacionDe: id },
      origenInterferencia: { regla: itf.res.row, situacion: itf.situation, libreOriginal: ftEv.id, serie: seriesId, puntoConcedido: 1 },
    },
  });
  this.incidentLog.push({ id, state: 'administrada', category: spec.category, step: this.stepSeq, origin: 'interferencia' });
  this.cover(`incidencia ${spec.category} (interferencia)`);
  if (excluded) this.queueWindow({ reason: 'incidencia', timeoutTeams: [0, 1], subs: true }); // retirada obligatoria: se resuelve en la ventana reglamentaria antes del libre adicional
  this.clockRunning = false;
  return { cont: 'incident' };
};

// Un lanzador designado por el entrenador rival: política declarada (regulation.technical.shooterPolicy): el mejor lanzador de libres en pista; desempate por identificador. Sin sorteo.
P.designatedShooter = function designatedShooter(team) {
  const sh = this.profile.shots.freeThrow;
  const cands = this.onCourt(team).filter((id) => this.ps[id].available);
  if (!cands.length) return null;
  return [...cands].sort((a, b) => this.recipeObj(sh.attack, b, this.profile.energy.freeThrowTaskMax) - this.recipeObj(sh.attack, a, this.profile.energy.freeThrowTaskMax) || (a < b ? -1 : 1))[0];
};

// Una serie por frontera. La última aplica la reanudación única de la cola; las intermedias solo devuelven a la cola.
P.adminStep = function adminStep() {
  const plan = this.adminPlan;
  if (!plan) return { cont: 'incident' };
  if (plan.index >= plan.steps.length) return this.applyResume(plan.resume, plan, null, null);
  const st = plan.steps[plan.index]; plan.index += 1; const last = plan.index >= plan.steps.length;
  const shooter = st.shooter === 'designated' ? this.designatedShooter(st.beneficiary) : st.fouled;
  if (!shooter && st.ft > 0) throw new Error(`sanción ${st.id}: sin lanzador disponible`);
  const f = { fouled: shooter, n: st.ft, shotTeam: st.beneficiary, shooting: false, shotMade: false, kind: `sanción ${st.category}`, shotEvent: null, feed: null, stepOnly: !last, plan: last ? plan : null };
  const ex = plan.ex ?? { team: st.beneficiary, actor: shooter, origin: 'sanción', zone: 'freeThrow', kind: 'organized' };
  if (st.ft > 0) return this.shootFreeThrows(shooter, st.ft, f, ex);
  return last ? this.applyResume(plan.resume, plan, f, ex) : { cont: 'incident' };
};

// Reanudación única al terminar la cola (art. 43): el último derecho sancionador, la de la última sanción sin derecho, o el contexto previo.
P.applyResume = function applyResume(resume, plan, f, ex) {
  this.adminPlan = null;
  const poss = this.poss && !this.poss.done ? this.poss : null;
  const from = plan.steps.find((s) => s.id === resume.from);
  switch (resume.kind) {
    case 'priorContext': {
      if (!poss) return { cont: 'incident' }; // entre posesiones: sigue la posesión ya programada
      poss.advanced = poss.advanced ?? false; this.clockRunning = false; this.cover('reanudación en el contexto previo (técnica)');
      poss.pendingThrowIn = { kind: 'band', origin: 'saque tras sanción (reanudación del contexto previo; el reloj de posesión no cambia)', frontcourt: !!poss.advanced };
      return { cont: 'inboundAfterFoul' };
    }
    case 'penaltyThrowIn': {
      const team = from ? from.beneficiary : (poss ? poss.team : 0);
      this.shotClock = toTenths(this.profile.rules.penaltyThrowInShotClockSeconds); this.clockRunning = false;
      const spec = { kind: 'band', origin: 'saque de penalización (derecho sancionador; línea de pista delantera, enfrente de la mesa; 14 s)', frontcourt: true, penalty: true };
      this.cover('posesión conservada tras sanción');
      if (poss && poss.team === team) { poss.advanced = true; poss.pendingThrowIn = spec; return { cont: 'inboundAfterFoul' }; }
      this.endPossession('sanctionRight', { team, throwIn: spec });
      return { end: 'sanctionRight' };
    }
    case 'afterLastFreeThrow': { // MOTOR-15B: tras la técnica de RG-I03 el último libre original ya fue válido: saque del rival, sin otra posesión por la técnica ni rebote
      this.cover('reanudación tras último libre válido (técnica por interferencia)');
      this.endPossession('ftMade', { team: resume.shooterTeam }); return { end: 'ftMade' };
    }
    case 'afterSeries': { // balón vivo tras el último libre: canasta → saque del rival; fallo → rebote (lo resuelve la serie, no esta rama)
      return { cont: 'incident' };
    }
    default: {
      this.shotClock = Math.max(this.shotClock, toTenths(this.profile.rules.frontcourtResetSeconds));
      if (poss) { poss.advanced = true; poss.pendingThrowIn = { kind: 'band', origin: 'saque de banda tras sanción', frontcourt: true }; return { cont: 'inboundAfterFoul' }; }
      return { cont: 'incident' };
    }
  }
};
