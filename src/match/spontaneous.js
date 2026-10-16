// Oportunidades espontáneas (MOTOR-06): ESP01–ESP20 como CLASIFICACIÓN declarativa sobre opciones físicas ya existentes y un único flujo de
// candidatos que compite con las fichas en la misma mezcla (`mixIntention`). No hay una operación, una probabilidad ni un sorteo por ID de ESP:
//   · el catálogo (`profile.spontaneousRepertoire`) dice qué situación reconoce cada opción (`when`), no cuánto pesa;
//   · una opción con varias etiquetas sigue siendo UNA opción (misma masa, mismo sorteo);
//   · la ejecución usa las operaciones compartidas (calidad, ayuda, pases adicionales, categoría de resultado, tiro, rebote).
// Tres procedencias, un solo núcleo: llamada del plan (ficha), recurso autónomo (ESP20) y decisión directa (el resto).
import { MatchCore } from './core.js';
import { fit } from './plays.js';
import { round, clamp } from './mathx.js';

const P = MatchCore.prototype;
const ZONE_TEC = { three: 'TEC01', midrange: 'TEC02', inside: 'TEC03', rim: 'TEC04' };

P.sp = function sp() { return this.profile.spontaneousRepertoire; };
P.oc = function oc() { return this.profile.opportunities; };

// ---------------------------------------------------------------- clasificación (etiquetas diagnósticas)
const asArr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
// ¿Esta situación del catálogo reconoce el contexto? Todas las claves de `when` deben cumplirse; `anyOf` basta con una bandera.
P.espTags = function espTags(ctx) {
  const active = this.profile.activeCatalog.spontaneous ?? [];
  const out = [];
  for (const [id, s] of Object.entries(this.sp().situations)) {
    if (!active.includes(id) || !s.frontier.includes(ctx.frontier)) continue;
    let ok = true;
    for (const [k, want] of Object.entries(s.when)) {
      if (k === 'anyOf') { if (!want.some((f) => !!ctx[f])) { ok = false; break; } continue; }
      if (typeof want === 'boolean') { if (!!ctx[k] !== want) { ok = false; break; } continue; }
      const have = asArr(ctx[k]);
      if (!have.some((x) => want.includes(x))) { ok = false; break; }
    }
    if (ok) out.push(id);
  }
  return out;
};

// Registro de decisiones/oportunidades para el diagnóstico (solo datos calculados; no consume azar).
P.logOpp = function logOpp(rec) {
  if (!this.oppLog) return;
  this.oppLog.push({ n: this.oppLog.length + 1, possession: this.poss?.id ?? null, period: this.period, clock: this.clock, ...rec });
};

// ---------------------------------------------------------------- calidad percibida (esperanza previa, no el resultado)
// Factor de elección de una opción nueva: Σ p(clase) · peso(clase) con p la esperanza de calidad previa (qualityDistribution, sin sorteo).
P.perceivedFactor = function perceivedFactor(e) {
  const oc = this.oc(); const w = oc.perceivedQualityChoiceWeight;
  const hasOpp = !!e.defend && !e.window;
  let ca; let cd = 0;
  if (e.exec === 'dribble') { ca = this.taskValue('TAR02', 'attack', { handler: e.actor }); if (hasOpp) cd = this.taskValue('TAR02', 'defense', { primary: e.defend }); }
  else if (e.qual === 'TAR05') { ca = this.taskValue('TAR05', 'attack', { post: e.actor }); if (hasOpp) cd = this.taskValue('TAR05', 'defense', { postMarker: e.defend }); }
  else { ca = this.taskValue('TAR03', 'attack', { receiver: e.actor }); if (hasOpp) cd = this.taskValue('TAR03', 'defense', { receiverMarker: e.defend }); }
  const p = this.qualityDistribution(ca, cd, 0, hasOpp).p;
  // peso base de una opción nueva (1: neutro) × calidad percibida esperada; una sola vez por opción, sin multiplicar por etiquetas
  return oc.newEligibleActionBaseWeight * (p.comfortable * w.comfortable + p.normal * w.normal + p.forced * w.forced);
};

// ---------------------------------------------------------------- opciones directas del inicio organizado
// Quién tiene el balón al empezar: en un contexto temprano, quien lo recuperó o recibió; si no, el director.
P.startHolder = function startHolder(poss, dir) {
  const c = poss.carrierPid;
  return poss.early && c && this.ps[c]?.onCourt && this.ps[c].available && this.pl[c].teamIdx === poss.team ? c : dir.id;
};

// Candidatos (jugador, operación) con participantes, acceso, control y tiempo. Solo se conservan las opciones que el catálogo reconoce como
// situación (≥ 1 etiqueta ESP). La forma física es la de las salidas existentes: scoreExits, qualityOf y resolveAttempt las entienden.
P.directExits = function directExits(poss, H) {
  const team = poss.team; const early = !!poss.early; const rec = poss.recovery?.kind ?? null;
  if (this.limit() <= Math.round(this.profile.durationSeconds.continuation[0] * 10) + 1) return [];
  const on = this.onCourt(team).filter((id) => this.ps[id].available);
  const ref = this.defRef(1 - team);
  const switched = (id) => { const cur = poss.cur?.[id]; return !!cur && cur !== ref.assign[id]; };
  const late = (id, def) => !!(poss.committed?.size && ((def && poss.committed.has(def)) || poss.openAtt?.has(id)));
  const exits = [];
  const add = (e) => {
    const tags = this.espTags({ frontier: 'organizedStart', early, window: !!e.window, exec: e.exec, zone: e.zone, actorRole: e.actorRole, switched: switched(e.actor), lateRecovery: late(e.actor, e.defend), recovery: rec ? [rec] : [], autonomous: false });
    if (!tags.length) return;
    exits.push({ ...e, espTags: tags, early, key: `${e.actorRole}:${e.actor}:${e.zone}` });
  };
  const hDef = this.defenderFor(H);
  for (const zone of ['rim', 'midrange', 'three']) {
    add({ actorRole: 'holder', role: 'directo', actor: H, zone, exec: 'dribble', passer: null, icpt: hDef, defend: hDef == null ? null : (zone === 'rim' ? (this.shotDefenderFor(H, 'rim') ?? hDef) : hDef), window: hDef == null, moved: zone !== 'rim', offContact: zone === 'rim' ? { pid: H, tech: 'TEC07', kind: 'penetración' } : null, holder: H, qual: 'TAR02' });
  }
  for (const id of on) {
    if (id === H) continue;
    const mk = this.defenderFor(id); const open = mk == null;
    const tier = this.accessTier(id);
    add({ actorRole: 'receiver', role: 'directo', actor: id, zone: 'three', exec: 'pass', passer: H, icpt: mk, defend: mk, window: open, moved: false, offContact: null, holder: H, qual: null });
    const post = tier === 0;
    add({ actorRole: post ? 'post' : 'cutter', role: 'directo', actor: id, zone: 'rim', exec: 'pass', passer: H, icpt: mk, defend: open ? null : (this.shotDefenderFor(id, 'rim') ?? mk), window: open, moved: false, offContact: post ? { pid: id, tech: 'TEC11', kind: 'poste' } : null, holder: H, qual: post ? 'TAR05' : null });
  }
  return exits;
};

// Elemento único de la mezcla para TODAS las opciones directas: la masa no crece con el número de candidatos ni de etiquetas (media ponderada
// por preferencia, como la de una ficha respecto a sus salidas). La calidad percibida orienta la elección una sola vez.
P.directItem = function directItem(poss, dir, H) {
  const team = poss.team;
  const exits = this.directExits(poss, H);
  if (!exits.length) return null;
  const groups = { TAR02: exits.filter((e) => e.exec === 'dribble'), TAR05: exits.filter((e) => e.exec !== 'dribble' && e.qual === 'TAR05'), TAR03: exits.filter((e) => e.exec !== 'dribble' && e.qual !== 'TAR05') };
  for (const [q, list] of Object.entries(groups)) if (list.length) this.scoreExits(team, list, null, q);
  for (const e of exits) { e.fq = this.perceivedFactor(e); e.pref *= e.fq; e.adapt *= e.fq; }
  const tot = exits.reduce((s, e) => s + e.pref, 0);
  if (!(tot > 0)) return null;
  const wavg = (f) => exits.reduce((s, e) => s + (e.pref / tot) * f(e), 0);
  const anyMid = exits.some((e) => e.mid != null);
  this.note('opciones_directas', { titular: H, temprano: !!poss.early, recuperacion: poss.recovery?.kind ?? null, opciones: exits.map((e) => ({ clave: e.key, etiquetas: e.espTags, calidadPercibida: round(e.fq, 4), pref: round(e.pref, 4), valor: round(e.adapt, 4) })) });
  return { key: 'DIRECTA', coach: 0, pref: wavg((e) => e.pref), adapt: wavg((e) => e.adapt), risk: wavg((e) => e.riskEst ?? 0), mid: anyMid ? wavg((e) => e.mid ?? 1) : null, cont: false, direct: true, exits, holder: H };
};

// ---------------------------------------------------------------- ESP20: recurso autónomo colectivo sencillo
// Entrega, pantalla de llegada o pase y corte CONOCIDOS que el libro del equipo no incluye. Reutiliza las fichas de esa interacción (mismas tareas
// y capacidades reales, sin reorganizar ni la coordinación de un sistema preparado) y no cuenta como llamada del entrenador.
P.autonomousIds = function autonomousIds(team, poss, callId) {
  if (!(this.profile.activeCatalog.spontaneous ?? []).includes('ESP20')) return [];
  const book = new Set(this.teams[team].plan.playbook.map((b) => b.playId));
  const out = [];
  for (const a of this.sp().autonomous) {
    if (a.when?.early && !poss.early) continue;
    const id = a.candidates.find((c) => !book.has(c) && c !== callId && !(poss.excludePlays?.has(c)));
    if (id) out.push(id);
  }
  return out;
};

// ---------------------------------------------------------------- ejecución de una decisión directa (misma resolución compartida)
P.runDirect = function runDirect(poss, ex, lq) {
  const team = poss.team;
  Object.assign(ex, { team, origin: ex.espTags[0], kind: ex.early ? 'transition' : 'continuation', roles: { portador: ex.holder }, procedencia: 'decisión directa', directo: true });
  const cvk = { k: 0, spaceFromCoverage: false };
  const st = this.interactionResolve(poss, ex, lq, team, null, 0, false, cvk);
  const k = st.kctx + st.kd;
  let q;
  if (ex.qual === 'TAR02' && !ex.chain?.length) {
    q = ex.window || !ex.defend ? this.qualityOf(ex, this.taskValue('TAR02', 'attack', { handler: ex.actor }), 0, k, false)
      : this.qualityOf(ex, this.taskValue('TAR02', 'attack', { handler: ex.actor }), ex.defMix ? this.mixedValue(ex, (id) => this.taskValue('TAR02', 'defense', { primary: id })) : this.taskValue('TAR02', 'defense', { primary: ex.defend }), k, true);
  } else if (ex.qual === 'TAR05' && !ex.window && ex.defend) {
    q = this.qualityOf(ex, this.taskValue('TAR05', 'attack', { post: ex.actor }), ex.defMix ? this.mixedValue(ex, (id) => this.taskValue('TAR05', 'defense', { postMarker: id })) : this.taskValue('TAR05', 'defense', { postMarker: ex.defend }), k, true);
  } else {
    const ca = this.taskValue('TAR03', 'attack', { receiver: ex.actor });
    q = ex.window || !ex.defend ? this.qualityOf(ex, ca, 0, k, false) : this.qualityOf(ex, ca, ex.defMix ? this.mixedValue(ex, (id) => this.taskValue('TAR03', 'defense', { receiverMarker: id })) : this.taskValue('TAR03', 'defense', { receiverMarker: ex.defend }), k, true);
  }
  ex.quality = q;
  if (ex.window) { ex.opportunity = ex.opportunity ?? 'ESP06'; this.cover('ESP06 recepción liberada'); }
  // ESP19: elección temprana cuya calidad PREVIA resultó forzada (hecho clasificado antes del desenlace; no se etiqueta por fallar)
  if (ex.early && q.cls === 'forced' && (this.profile.activeCatalog.spontaneous ?? []).includes('ESP19') && !ex.espTags.includes('ESP19')) { ex.espTags = [...ex.espTags, 'ESP19']; this.cover('ESP19 elección temprana forzada'); }
  for (const t of ex.espTags) this.cover(`${t} ${this.sp().situations[t].name}`);
  // una recepción directa negada no es un tiro regalado: se reorganiza o se cae al recurso sencillo (como una ficha negada)
  if (q.cls === 'forced' && ex.exec === 'pass' && !ex.window) {
    this.cover('sistema negado');
    (poss.denials ??= []).push({ ficha: ex.origin, actor: ex.actor, holder: ex.holder });
    const pr = this.profile.continuation.reorganizeIfDeniedProbability;
    const f = this.profile.selection.organizedDurationFactor[this.styleOf(team).organizedPace - 1];
    const d = this.profile.durationSeconds;
    const reorgViable = this.limit() > Math.round((d.reorganization[0] + d.organizedShot[0]) * f * 10);
    if (reorgViable && this.bernoulli(pr, 'negada:reorganizar') && this.reorganize(poss, `opción directa ${ex.origin} negada`, null)) return { cont: 'reorganized' };
    return this.simpleResource(poss, { origin: 'ESP15', denied: ex.origin });
  }
  return this.resolveAttempt(ex);
};
