// Familiaridad táctica (MOTOR-18, FAM-MOTOR18-R1). Capa pequeña de conocimiento ADQUIRIDO sobre el motor por acontecimientos: nada de coordenadas, movimientos ni sorteos nuevos.
//   · Dos puntos de aplicación, un único ajuste por operación: la calidad de la oportunidad (se suma a `extraZ` de `qualityOf`) y el avance ante presión adelantada (se suma a `z` de `pressedAdvance`).
//   · Durante el partido NO se aprende ni se olvida: se consulta la instantánea congelada de la entrada y se ACUMULA EXPOSICIÓN (minutos vivos por posición/rol y crédito por módulo) para las funciones de aprendizaje.
//   · Con la capa desactivada, sin conocimiento explícito o con todos los niveles a 30 el resultado es el de MOTOR-17B (el ajuste es exactamente 0 y no se consume azar).
import { MatchCore } from './core.js';
import { round } from './mathx.js';
import { familiarityActor, familiaritySide, familiarityDelta } from './formulas.js';

const P = MatchCore.prototype;
export const FAMILIARITY_VERSION = 'FAM-MOTOR18-R1';
const uniq = (arr) => [...new Set(arr.filter((x) => x != null))];
const explicit = (k) => k != null && k.mode === 'explicit';
const lvl = (m, key) => { const e = m?.[key]; return e && typeof e.level === 'number' ? e.level : null; };

P.initFamiliarity = function initFamiliarity() {
  const f = this.profileData.familiarity ?? null; // copia congelada del perfil: sin lectura anotada
  const on = !!(f && f.activation && f.activation.enabled === true);
  this.fam = { on, anyExplicit: false, apps: {}, exp: { players: {}, operations: { quality: 0, pressedAdvance: 0, noApplicable: 0 } } };
  if (!on) return;
  this.fam.cfg = f;
  for (const t of this.input.teams) for (const p of t.players) if (explicit(p.knowledge)) this.fam.anyExplicit = true;
  this.profile.familiarity.activation.enabled; // consulta anotada de la fila de activación (diagnóstico)
};

const expOf = (m, pid) => (m.fam.exp.players[pid] ??= { liveTenths: 0, positions: {}, offensiveRoles: {}, defensiveRoles: {}, modules: {} });
// Juego vivo: minutos por posición asignada y por rol vigente (se divide automáticamente cuando una orden cambia el rol o el puesto). Llamada desde `consume`.
P.famTick = function famTick(dur) {
  const m = this;
  for (let t = 0; t < 2; t++) for (const id of m.onCourt(t)) {
    const e = expOf(m, id); const s = m.ps[id];
    e.liveTenths += dur; if (s.slot) e.positions[s.slot] = (e.positions[s.slot] ?? 0) + dur;
    const ro = m.roleOf[id]; if (ro) e.offensiveRoles[ro] = (e.offensiveRoles[ro] ?? 0) + dur;
    const rd = m.defRoleOf?.[id]; if (rd) e.defensiveRoles[rd] = (e.defensiveRoles[rd] ?? 0) + dur;
  }
};

// ---------------------------------------------------------------- contexto de una operación (participantes y módulos activos de cada lado)
P.famEffectiveOrg = function famEffectiveOrg(defT) { const e = this.def[defT].eff ?? this.resolveEffectiveOrg(defT); return e?.org ?? null; };
const MODULE_OF_CONT = (cfg, ex) => {
  const code = ex.label && /^CONT\d\d$/.test(ex.label) ? ex.label : null;
  if (!code) return ex.family ? `FAM:${ex.family}` : (ex.kind === 'continuation' ? 'FAM:continuity' : null);
  const rule = cfg.catalog.continuationFamily[code];
  if (rule === 'inherit') return ex.family ? `FAM:${ex.family}` : 'FAM:continuity';
  if (rule === 'continuity') return 'FAM:continuity';
  if (rule === 'give_and_go') return 'FAM:give_and_go';
  return null; // CONT09 (reorganización) u otro: sin módulo propio
};
const normalizeW = (list) => { const t = list.reduce((s, x) => s + x.w, 0); return t > 0 ? list.map((x) => ({ id: x.id, w: x.w / t })) : []; };

// Construye los participantes y los módulos de una operación de calidad. `ex` es la salida/ejecución en curso (`qualityOf`) o una salida candidata (estimación): no se seleccionan jugadores nuevos.
P.famQualityContext = function famQualityContext(ex, hasOpposition) {
  const cfg = this.fam.cfg; const team = ex.team ?? this.pl[ex.actor]?.teamIdx; const defT = 1 - team; const poss = this.poss;
  const inbound = ex.procedencia === 'saque' || ex.contexto === 'saque';
  const attackP = uniq([ex.holder, ex.actor, ex.passer, ex.offContact && (ex.offContact.kind === 'pantalla' || ex.offContact.kind === 'poste') ? ex.offContact.pid : null])
    .filter((id) => this.pl[id] && ((this.ps[id].onCourt && this.ps[id].available) || (inbound && id === ex.passer)));
  const defP = hasOpposition ? uniq([ex.defend, ex.icpt, ex.defMix?.primary, ex.defMix?.second, ex.helper, ex.presionSacador, !inbound ? poss?.coverage?.D1 : null, !inbound ? poss?.coverage?.D2 : null, ex.cobertura?.defensores?.delBalon, ex.cobertura?.defensores?.delBloqueador])
    .filter((id) => this.pl[id] && this.ps[id].onCourt) : [];
  let ctx; let atk = []; let dfn = [];
  const cov = !inbound ? (poss?.coverage && !poss.coverage.none ? poss.coverage.cob : null) : (ex.cobertura?.id && !ex.cobertura.limitada ? ex.cobertura.id : null);
  if (inbound) {
    ctx = 'throwIn'; const kind = poss?.throwIn?.kind; const w = cfg.tacticContextWeights.throwIn;
    if (kind === 'band' || kind === 'endline') { atk = [{ id: `SAQ:O:${kind}`, w: w.attack.throwIn }]; dfn = [{ id: `SAQ:D:${kind}`, w: w.defense.throwIn }]; }
    const org = this.famEffectiveOrg(defT); if (org) dfn.push({ id: org, w: w.defense.organization });
  } else if (ex.kind === 'transition') {
    ctx = 'transition'; const w = cfg.tacticContextWeights.transition; atk = [{ id: 'FAM:transition', w: w.attack.transition }]; // defensa sin organización estable representada: la organización no aplica
  } else {
    const organized = ex.kind === 'organized' && !!ex.family; ctx = organized ? 'organized' : 'spontaneous'; const w = cfg.tacticContextWeights[ctx];
    const fam = MODULE_OF_CONT(cfg, ex);
    if (fam) atk.push({ id: fam, w: w.attack.family });
    if (organized || ex.family) { const dis = this.teams[team]?.plan?.disposition; if (dis && (organized || ex.kind === 'continuation')) atk.push({ id: dis, w: w.attack.disposition }); }
    const org = this.famEffectiveOrg(defT); if (org) dfn.push({ id: org, w: w.defense.organization });
    if (cov) dfn.push({ id: cov, w: w.defense.coverage });
  }
  return { ctx, team, defT, attackP, defP, atk: normalizeW(atk), dfn: normalizeW(dfn), cov };
};
P.famPressedContext = function famPressedContext(handler, presser, support, height) {
  const cfg = this.fam.cfg; const team = this.pl[handler].teamIdx; const defT = 1 - team; const w = cfg.tacticContextWeights.pressBreak;
  const dfn = [{ id: 'PRESS', w: w.defense.press }]; const org = this.famEffectiveOrg(defT); if (org) dfn.push({ id: org, w: w.defense.organization });
  return { ctx: 'pressBreak', team, defT, attackP: uniq([handler]).filter((id) => this.ps[id].onCourt), defP: uniq([presser, support]).filter((id) => this.ps[id].onCourt), atk: normalizeW([{ id: 'FAM:press_break', w: w.attack.press_break }]), dfn: normalizeW(dfn), cov: null, height };
};

// Dominio de un lado: posición realmente asignada, rol vigente (ofensivo o defensivo según el lado) y módulos, con los niveles de la instantánea de cada participante.
P.famSide = function famSide(pids, mods, side) {
  const cfg = this.fam.cfg; const out = []; const doms = [];
  for (const id of pids) {
    const k = this.pl[id].knowledge; const slot = this.ps[id].slot;
    if (!explicit(k)) { out.push({ pid: id, neutral: true, D: null }); continue; }
    const code = side === 'attack' ? this.roleOf[id] : this.defRoleOf?.[id];
    const parts = {
      position: slot ? lvl(k.positions, slot) : null,
      role: code ? lvl(side === 'attack' ? k.offensiveRoles : k.defensiveRoles, code) : null,
      modules: mods.map((m) => ({ w: m.w, K: lvl(k.tactics, m.id) })),
    };
    const a = familiarityActor(cfg, parts);
    doms.push(a.D);
    out.push({ pid: id, slot: slot ?? null, rol: code ?? null, pos: parts.position, rolNivel: parts.role, modulos: parts.modules.map((x, i) => ({ id: mods[i].id, w: round(x.w, 4), nivel: x.K })), D: a.D == null ? null : a.D, omitidos: a.comps.filter((c) => c.n == null).map((c) => c.key) });
  }
  return { actors: out, D: familiaritySide(doms) };
};

// Ajuste de una operación (puro: sin registro de exposición ni azar). Con la capa apagada o sin conocimiento explícito devuelve 0 sin recorrer nada.
P.famAdjust = function famAdjust(c, scope) {
  if (!this.fam.anyExplicit) return { delta: 0, neutral: true, ctx: c.ctx };
  const A = this.famSide(c.attackP, c.atk, 'attack'); const D = this.famSide(c.defP, c.dfn, 'defense'); const r = familiarityDelta(this.fam.cfg, scope, A.D, D.D);
  return { delta: r.delta, ctx: c.ctx, DA: A.D, DD: D.D, UA: r.UA, UD: r.UD, max: r.max, ataque: A.actors, defensa: D.actors, neutral: A.D == null && D.D == null };
};
// Exposición de módulos: una sola vez por jugador–módulo–operación, repartiendo el crédito de la operación por los pesos normalizados (§6.3). No se acredita nada por estimaciones.
P.famCredit = function famCredit(c) {
  for (const [pids, mods] of [[c.attackP, c.atk], [c.defP, c.dfn]]) if (mods.length) for (const id of pids) { const e = expOf(this, id); for (const mm of mods) e.modules[mm.id] = (e.modules[mm.id] ?? 0) + mm.w; }
};
// Resumen compacto de aplicación por ámbito y contexto (numerador, denominador y unidad: se conserva en el esencial sin las trazas por operación).
P.famApplied = function famApplied(scope, a) {
  const s = ((this.fam.apps[scope] ??= {})[a.ctx] ??= { operations: 0, withExplicitKnowledge: 0, nonZeroDelta: 0, sumDelta: 0, minDelta: null, maxDelta: null, sumAttackDeficit: 0, sumDefenseDeficit: 0, attackSides: 0, defenseSides: 0 });
  s.operations += 1; if (a.neutral) return; s.withExplicitKnowledge += 1; s.sumDelta += a.delta; if (a.delta !== 0) s.nonZeroDelta += 1;
  s.minDelta = s.minDelta == null ? a.delta : Math.min(s.minDelta, a.delta); s.maxDelta = s.maxDelta == null ? a.delta : Math.max(s.maxDelta, a.delta);
  if (a.DA != null) { s.sumAttackDeficit += a.UA; s.attackSides += 1; } if (a.DD != null) { s.sumDefenseDeficit += a.UD; s.defenseSides += 1; }
};
const rnd = (x) => (x == null ? null : round(x, 6));
P.famRecord = function famRecord(scope, c, a) {
  if (this.opts.detail !== 'full') return;
  this.note('familiaridad', { version: FAMILIARITY_VERSION, aplica: true, ambito: scope, contexto: a.ctx, delta: rnd(a.delta), DA: rnd(a.DA ?? null), DD: rnd(a.DD ?? null), cargaAtaque: rnd(a.UA ?? 0), cargaDefensa: rnd(a.UD ?? 0), maximos: a.max ?? null, neutral: !!a.neutral,
    modulosAtaque: c.atk.map((x) => ({ id: x.id, w: rnd(x.w) })), modulosDefensa: c.dfn.map((x) => ({ id: x.id, w: rnd(x.w) })), participantes: { ataque: a.ataque ?? null, defensa: a.defensa ?? null } });
};

// Operación de CALIDAD (resuelta de verdad): ajuste + exposición + registro. Devuelve el delta que `qualityOf` suma a `extraZ`.
P.famQuality = function famQuality(ex, hasOpposition) {
  if (!this.fam.on) return 0;
  const c = this.famQualityContext(ex, hasOpposition); const a = this.famAdjust(c, 'quality');
  this.famCredit(c); this.fam.exp.operations.quality += 1; this.famApplied('quality', a); this.famRecord('quality', c, a);
  return a.delta;
};
// Estimación (media distancia, calidad percibida): misma función pura con el conocimiento pertinente; sin exposición, sin registro y sin azar.
P.famQualityEstimate = function famQualityEstimate(e, hasOpposition, hint = null) {
  if (!this.fam?.on || !this.fam.anyExplicit) return 0;
  const team = e.team ?? this.pl[e.actor]?.teamIdx; const view = { ...e, team, ...(hint?.family && !e.family ? { family: hint.family, kind: 'organized' } : {}) };
  return this.famAdjust(this.famQualityContext(view, hasOpposition), 'quality').delta;
};
// Calidad heredada o determinista (negada sin sorteo de coordinación, recepción de saque ya resuelta): no abre operación nueva ni cobra otra vez.
P.famNotApplicable = function famNotApplicable(reason, ex) {
  if (!this.fam.on) return;
  this.fam.exp.operations.noApplicable += 1;
  if (this.opts.detail === 'full') this.note('familiaridad', { version: FAMILIARITY_VERSION, aplica: false, motivo: `no aplica: ${reason}`, actor: ex?.actor ?? null });
};
// Avance ante presión adelantada: mismo tipo de ajuste, sumado una vez a `z`.
P.famPressed = function famPressed(handler, presser, support, height) {
  if (!this.fam.on) return 0;
  const c = this.famPressedContext(handler, presser, support, height); const a = this.famAdjust(c, 'pressedAdvance');
  this.famCredit(c); this.fam.exp.operations.pressedAdvance += 1; this.famApplied('pressedAdvance', a); this.famRecord('pressedAdvance', c, a);
  return a.delta;
};

// Exposición final por jugador y conocimiento (numerador, denominador y unidad), para el esencial, el export y la propuesta de aprendizaje. Solo lectura.
P.famExposure = function famExposure() {
  if (!this.fam.on) return null;
  const players = {};
  for (const [pid, e] of Object.entries(this.fam.exp.players)) players[pid] = { liveTenths: e.liveTenths, positions: { ...e.positions }, offensiveRoles: { ...e.offensiveRoles }, defensiveRoles: { ...e.defensiveRoles }, modules: Object.fromEntries(Object.entries(e.modules).map(([k, v]) => [k, round(v, 9)])) };
  return { version: FAMILIARITY_VERSION, units: { liveTenths: 'décimas de juego vivo', positions: 'décimas', offensiveRoles: 'décimas', defensiveRoles: 'décimas', modules: 'crédito ponderado por operación real (1 por jugador–operación repartido entre sus módulos)' }, operations: { ...this.fam.exp.operations }, players };
};

// Informe único para el export y el esencial (solo lectura): identidad, política, resumen de aplicación y exposición. La instantánea completa de conocimiento vive UNA vez en la entrada.
P.famReport = function famReport() {
  if (!this.fam) return null;
  const c = this.profileData.familiarity ?? null;
  if (!this.fam.on) return { version: FAMILIARITY_VERSION, enabled: false, reason: c ? 'capa desactivada en el perfil' : 'el perfil no incluye `familiarity` (perfil anterior a MOTOR-18): compatibilidad neutra' };
  const apps = {}; for (const [sc, byCtx] of Object.entries(this.fam.apps)) apps[sc] = Object.fromEntries(Object.entries(byCtx).map(([k, v]) => [k, { ...v, sumDelta: round(v.sumDelta, 9), minDelta: v.minDelta == null ? null : round(v.minDelta, 9), maxDelta: v.maxDelta == null ? null : round(v.maxDelta, 9), sumAttackDeficit: round(v.sumAttackDeficit, 9), sumDefenseDeficit: round(v.sumDefenseDeficit, 9) }]));
  const modes = {}; for (const [pid, pl] of Object.entries(this.pl)) modes[pid] = explicit(pl.knowledge) ? 'explicit' : 'legacy-neutral';
  return { version: FAMILIARITY_VERSION, knowledgeVersion: c.knowledgeVersion, learningVersion: c.learningVersion, enabled: true, compatibilityPolicy: c.activation.compatibilityPolicy, anyExplicitKnowledge: this.fam.anyExplicit, modes, applications: apps, exposure: this.famExposure() };
};
