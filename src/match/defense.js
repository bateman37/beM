// Defensa por funciones (MOTOR-05): referencias, responsabilidad actual, organización efectiva y alternativa de box and one.
// El CONTENIDO (organizaciones, funciones, áreas de responsabilidad, roles) vive en `profile.defenseRepertoire`; las magnitudes, en
// `profile.defense.*` (SEM-MOTOR05). Este fichero solo interpreta ese contenido: no hay coeficientes deportivos aquí.
//
// Dos conceptos distintos (apartado 6.1 del encargo):
//   · REFERENCIA: quién o qué función corresponde defender al organizarse (`ref`, se recalcula solo al cambiar el quinteto, la
//     disposición rival, el plan o al reorganizar; conserva lo compatible con 0,5 puntos de estabilidad).
//   · RESPONSABILIDAD ACTUAL: quién interviene ahora tras cambios, ayudas o recuperación (`poss.cur`, `poss.committed`).
import { MatchCore } from './core.js';
import { SLOTS } from './data.js';

const P = MatchCore.prototype;
const dedupe = (a) => [...new Set(a)];

P.dcfg = function dcfg() { return this.profile.defense; };
P.drep = function drep() { return this.profile.defenseRepertoire; };

// ---------------------------------------------------------------- estado
P.initDefense = function initDefense() {
  const rep = this.drep();
  this.defRoleOf = {};
  this.input.teams.forEach((t) => {
    for (const p of t.players) {
      const slot = SLOTS.find((x) => this.lineup[this.pl[p.id].teamIdx][x] === p.id);
      // Un rol declarado no se sobrescribe; si falta, se precarga por la función actual del quinteto (SEM editable, no una prohibición)
      this.defRoleOf[p.id] = p.defensiveRole?.code ?? (slot ? rep.defaultRolesBySlot[slot] : null);
    }
  });
  this.def = [0, 1].map(() => ({ eff: null, ref: null, key: null, shifts: [] }));
  this.defPlanVer = [0, 0];
};

P.defPlan = function defPlan(t) { return this.teams[t].plan; };

// ---------------------------------------------------------------- organización efectiva (box and one con objetivo ausente)
// Intención = lo declarado en el plan. Efectiva = lo que se ejecuta ahora: box and one solo mientras el objetivo (o la alternativa
// individual designada) está en pista; si no, la alternativa declarada (ORG02 por defecto). No se inventa otro objetivo.
P.resolveEffectiveOrg = function resolveEffectiveOrg(t) {
  const plan = this.defPlan(t);
  const intent = plan.defense;
  const rep = this.drep();
  if (rep.organizations[intent].kind !== 'boxAndOne') return { org: intent, intent, objective: null, alternate: false, reason: null };
  const avail = (pid) => pid && this.ps[pid]?.onCourt && this.ps[pid].available && this.pl[pid].teamIdx === 1 - t;
  if (avail(plan.target)) return { org: intent, intent, objective: plan.target, alternate: false, reason: null };
  if (avail(plan.targetAlt)) return { org: intent, intent, objective: plan.targetAlt, alternate: false, reason: 'objetivo principal fuera de pista: alternativa individual designada' };
  const fb = plan.fallbackOrg ?? this.dcfg().specials.boxAndOneDefaultFallback;
  return { org: fb, intent, objective: null, alternate: true, reason: 'ningún objetivo designado en pista: alternativa declarada del plan' };
};

// Se evalúa al empezar cada posesión (frontera pertinente): emite un hecho solo si la organización efectiva cambia.
P.refreshEffectiveOrg = function refreshEffectiveOrg(t) {
  const s = this.def[t]; const e = this.resolveEffectiveOrg(t);
  const prev = s.eff;
  const changed = !prev || prev.org !== e.org || prev.objective !== e.objective;
  s.eff = e;
  if (changed && (prev || e.org !== this.defPlan(t).defense || e.objective)) {
    const names = this.drep().organizations;
    s.shifts.push({ possession: this.poss?.id ?? null, org: e.org });
    this.emit('defense', { team: 1 - t, intent: { origen: 'organización defensiva efectiva', defiende: this.teams[t].id, intencion: e.intent, efectiva: e.org, nombreEfectiva: names[e.org].name, objetivo: e.objective, alternativa: e.alternate, motivo: e.reason ?? (prev && prev.alternate ? 'el objetivo vuelve y la intención sigue vigente' : null) }, effects: { sinCambioDeReloj: true } });
    this.cover(e.alternate ? 'alternativa de box and one' : 'organización efectiva');
  }
  return e;
};

// ---------------------------------------------------------------- funciones del ataque rival (observadas)
// Función de cada atacante: la de la disposición con la que el ataque se organiza (layout de la posesión) o, si aún no hay layout
// (transición, rebote), la función por defecto de su posición. No se lee el libro privado.
P.attackFunctions = function attackFunctions(offT) {
  const poss = this.poss; const map = {};
  const lay = poss && poss.team === offT ? poss.layout?.map : null;
  const fb = this.drep().fallbackFunctionBySlot;
  for (const id of this.onCourt(offT)) map[id] = lay?.[id] ?? fb[this.slotOf(id)];
  return map;
};

// Índice lateral estable entre atacantes de la misma función (orden de identificador): no se sortea izquierda/derecha.
function lateralIndex(fnMap) {
  const idx = {}; const seen = {};
  for (const id of Object.keys(fnMap).sort()) { const fn = fnMap[id]; idx[id] = seen[fn] ?? 0; seen[fn] = (seen[fn] ?? 0) + 1; }
  return idx;
}
const areaEntry = (org, fn, i) => { const a = org.areas[fn]; return Array.isArray(a) ? a[i % a.length] : a; };

// ---------------------------------------------------------------- asignación de referencias
P.defFit = function defFit(pid, recipe) { return this.recipeObj(this.dcfg().assignment[recipe], pid, null); };
P.defRoleTags = function defRoleTags(pid) { return this.drep().roles[this.defRoleOf[pid]]?.tags ?? []; };
// Adecuación = receta propia (1–30) × sesgo de rol (una vez, solo a la función favorecida) + estabilidad por referencia previa compatible.
P.defScore = function defScore(pid, recipe, tags, retained) {
  const a = this.dcfg().assignment;
  const favored = this.defRoleTags(pid).some((t) => tags.includes(t));
  return this.defFit(pid, recipe) * (favored ? a.roleFitWeight : a.otherRoleFitWeight) + (retained ? a.retainedReferenceScorePoints : 0);
};

// Mejor reparto de defensores (en orden de identificador) entre ranuras, respetando asignaciones forzadas. Determinista: ante empate
// gana la primera permutación en orden estable. Son a lo sumo 120 combinaciones: no hay búsqueda de futuros de partido.
function bestAssignment(defs, slots, score, forced) {
  const ds = [...defs].sort();
  const taken = new Set(); const out = {};
  for (const [slot, d] of Object.entries(forced)) { if (ds.includes(d) && slots.includes(slot) && !taken.has(d) && !(slot in out)) { out[slot] = d; taken.add(d); } }
  const freeSlots = slots.filter((s) => !(s in out)); const freeDefs = ds.filter((d) => !taken.has(d));
  let best = null; let bestV = -Infinity;
  const rec = (i, used, acc, v) => {
    if (i === freeSlots.length) { if (v > bestV + 1e-12) { bestV = v; best = { ...acc }; } return; }
    for (const d of freeDefs) { if (used.has(d)) continue; used.add(d); acc[freeSlots[i]] = d; rec(i + 1, used, acc, v + score(freeSlots[i], d)); used.delete(d); delete acc[freeSlots[i]]; }
  };
  rec(0, new Set(), {}, 0);
  return { ...out, ...best };
}

// Marcas manuales válidas del equipo defensor: { defensor, atacante|función, ámbito }. Una marca no prohíbe cambiar: eso exige una
// cobertura compatible explícita.
P.validMarks = function validMarks(t, fnMap) {
  const marks = this.defPlan(t).marks ?? [];
  const out = [];
  for (const m of marks) {
    if (!this.ps[m.defender]?.onCourt || !this.ps[m.defender].available) continue;
    let att = m.attacker ?? null;
    if (!att && m.fn) att = Object.keys(fnMap).sort().find((id) => fnMap[id] === m.fn) ?? null;
    if (!att || !(att in fnMap)) continue;
    out.push({ defender: m.defender, attacker: att, scope: m.scope ?? 'game' });
  }
  const used = new Set(); const usedAtt = new Set();
  return out.filter((m) => { if (used.has(m.defender) || usedAtt.has(m.attacker)) return false; used.add(m.defender); usedAtt.add(m.attacker); return true; });
};

// Calcula la referencia de la defensa del equipo `t` frente al ataque actual.
P.computeReference = function computeReference(t) {
  const s = this.def[t]; const e = s.eff ?? this.refreshEffectiveOrg(t);
  const rep = this.drep(); const org = rep.organizations[e.org];
  const offT = 1 - t;
  const fnMap = this.attackFunctions(offT);
  const idx = lateralIndex(fnMap);
  const defs = this.onCourt(t).filter((id) => this.ps[id].available);
  const atts = this.onCourt(offT);
  const prev = s.ref && s.ref.org === e.org ? s.ref.pairs : new Set();
  const marks = this.validMarks(t, fnMap);
  const pairs = new Set(); const why = [];
  const ref = { org: e.org, kind: org.kind, objective: e.objective, fnMap, idx, assign: {}, fnOwner: {}, defFn: {}, marks, open: [], eff: e };
  if (org.kind === 'individual') {
    const forced = {}; for (const m of marks) { forced[m.attacker] = m.defender; why.push(`marca manual ${m.defender} → ${m.attacker}`); }
    const score = (att, d) => { const f = rep.attackerFunctions[fnMap[att]]; return this.defScore(d, f.fit, f.tags, prev.has(`${att}|${d}`)); };
    const asg = bestAssignment(defs, atts, score, forced);
    for (const att of atts) { ref.assign[att] = asg[att] ?? null; if (asg[att]) { ref.defFn[asg[att]] = att; pairs.add(`${att}|${asg[att]}`); } }
  } else {
    const fnKeys = Object.keys(org.functions);
    const forced = {};
    for (const m of marks) {
      // En zona una marca coloca al defensor en la función cuya área cubre la del atacante señalado (no hay cinco marcas personales).
      let slot = null;
      if (org.kind === 'boxAndOne' && m.attacker === e.objective) slot = org.chaser;
      else if (org.kind === 'zone' || (org.kind === 'boxAndOne' && m.attacker !== e.objective)) slot = areaEntry(org, fnMap[m.attacker], idx[m.attacker])?.first ?? null;
      if (slot && !(slot in forced)) { forced[slot] = m.defender; why.push(`marca manual ${m.defender} → función ${slot}`); }
    }
    if (org.kind === 'boxAndOne' && e.objective) { /* el perseguidor se elige por adecuación al encargo (función X) salvo marca */ }
    const score = (slot, d) => { const f = org.functions[slot]; return this.defScore(d, f.fit, f.tags, prev.has(`${slot}|${d}`)); };
    const asg = bestAssignment(defs, fnKeys, score, forced);
    for (const k of fnKeys) { ref.fnOwner[k] = asg[k] ?? null; if (asg[k]) { ref.defFn[asg[k]] = k; pairs.add(`${k}|${asg[k]}`); } }
    // cobertura: cada atacante recibe la función de su área (primera referencia o relevo) sin que una función cubra a dos a la vez
    const pending = [...atts].sort((a, b) => rep.attackerPriority.indexOf(fnMap[a]) - rep.attackerPriority.indexOf(fnMap[b]) || (a < b ? -1 : 1));
    const usedFn = new Set(); const cov = {};
    if (org.kind === 'boxAndOne' && e.objective && atts.includes(e.objective)) { cov[e.objective] = org.chaser; usedFn.add(org.chaser); }
    const freeAtts = pending.filter((a) => !(a in cov));
    const allowed = fnKeys.filter((k) => !(org.kind === 'boxAndOne' && k === org.chaser && e.objective));
    const rate = (att, fn) => { const a = areaEntry(org, fnMap[att], idx[att]); if (!a) return 0; if (a.first === fn) return 3; const r = a.relief.indexOf(fn); return r >= 0 ? 2 - 0.1 * r : 0; };
    let bestV = -1; let bestM = null;
    const rec = (i, acc, used, v) => {
      if (i === freeAtts.length) { if (v > bestV + 1e-12) { bestV = v; bestM = { ...acc }; } return; }
      const att = freeAtts[i];
      for (const fn of allowed) { if (used.has(fn)) continue; const r = rate(att, fn); if (r <= 0) continue; used.add(fn); acc[att] = fn; rec(i + 1, acc, used, v + r); used.delete(fn); delete acc[att]; }
      rec(i + 1, acc, used, v - 0.0001); // atacante sin función que lo cubra: queda abierto (concesión estructural)
    };
    rec(0, {}, usedFn, 0);
    Object.assign(cov, bestM ?? {});
    for (const att of atts) { const fn = cov[att] ?? null; ref.assign[att] = fn ? ref.fnOwner[fn] : null; ref.coverFn ??= {}; ref.coverFn[att] = fn; }
  }
  ref.open = atts.filter((a) => !ref.assign[a]);
  ref.pairs = pairs; ref.why = why;
  return ref;
};

// Referencia vigente: se recalcula solo ante un cambio pertinente (posesión, disposición, reorganización, quinteto o plan).
P.defRef = function defRef(t) {
  const poss = this.poss; const s = this.def[t];
  const key = [poss?.id ?? '-', poss?.layout?.dis ?? '-', poss?.layout?.director ?? '-', poss?.reorgCount ?? 0, this.lineupId[0], this.lineupId[1], this.defPlanVer[t], s.eff?.org ?? '-', s.eff?.objective ?? '-'].join('|');
  if (s.ref && s.key === key) return s.ref;
  const ref = this.computeReference(t);
  s.ref = ref; s.key = key;
  this.cover('referencias defensivas calculadas');
  return ref;
};

// ---------------------------------------------------------------- responsabilidad actual
// Defensor actual de un atacante: cambio vigente (`poss.cur`) o, si no hay, su referencia. null = abierto (sin defensor).
P.defenderFor = function defenderFor(attPid) {
  const t = 1 - this.pl[attPid].teamIdx;
  const ref = this.defRef(t);
  const cur = this.poss?.cur?.[attPid];
  if (cur && this.ps[cur]?.onCourt && this.ps[cur].available) return cur;
  return ref.assign[attPid] ?? null;
};
// Cercano para recetas que necesitan siempre un actor (calidad de la ficha): primera referencia o relevo; nunca decide la apertura.
P.nearestDefender = function nearestDefender(attPid) {
  const t = 1 - this.pl[attPid].teamIdx; const ref = this.defRef(t);
  const own = this.defenderFor(attPid); if (own) return own;
  const org = this.drep().organizations[ref.org];
  if (org.kind !== 'individual') { const a = areaEntry(org, ref.fnMap[attPid], ref.idx[attPid]); for (const f of [a?.first, ...(a?.relief ?? [])]) if (f && ref.fnOwner[f]) return ref.fnOwner[f]; }
  return this.onCourt(t).filter((id) => this.ps[id].available).sort()[0];
};
P.markerOf = function markerOf(pid) { return this.nearestDefender(pid); };
P.isOpen = function isOpen(attPid) { return this.defenderFor(attPid) == null; };

// Quién defiende el tiro/finalización de una salida en el aro: en zona, la función de protección del aro; en individual, su defensor.
P.shotDefenderFor = function shotDefenderFor(attPid, zone) {
  const t = 1 - this.pl[attPid].teamIdx; const ref = this.defRef(t);
  const base = this.defenderFor(attPid);
  if (ref.kind === 'individual' || (zone !== 'rim' && zone !== 'inside')) return base;
  const org = this.drep().organizations[ref.org];
  for (const fn of org.rim) { const o = ref.fnOwner[fn]; if (o && !this.poss?.committed?.has(o) && !(org.dedicated && fn === org.chaser)) return o; }
  return base;
};

// A quién deja un defensor si interviene en otra tarea (responsabilidad actual que abandona).
P.responsibilityOf = function responsibilityOf(defPid) {
  const t = this.pl[defPid].teamIdx; const ref = this.defRef(t); const cur = this.poss?.cur ?? {};
  for (const [att, d] of Object.entries(cur)) if (d === defPid) return att;
  return Object.keys(ref.assign).sort().find((att) => (cur[att] ?? ref.assign[att]) === defPid) ?? null;
};

// Funciones de relevo compatibles de un atacante: defensores que pueden recuperar si su referencia se compromete.
P.reliefFor = function reliefFor(attPid) {
  const t = 1 - this.pl[attPid].teamIdx; const ref = this.defRef(t);
  const org = this.drep().organizations[ref.org];
  const committed = this.poss?.committed ?? new Set();
  let list;
  if (org.kind === 'individual') {
    const f = this.drep().attackerFunctions[ref.fnMap[attPid]];
    list = this.onCourt(t).filter((id) => this.ps[id].available).sort((a, b) => this.defScore(b, 'helpRecoveryFit', f.tags, false) - this.defScore(a, 'helpRecoveryFit', f.tags, false) || (a < b ? -1 : 1));
  } else {
    const a = areaEntry(org, ref.fnMap[attPid], ref.idx[attPid]);
    list = (a?.relief ?? []).map((fn) => ref.fnOwner[fn]).filter(Boolean);
    if (org.dedicated) list = list.filter((id) => ref.defFn[id] !== org.chaser);
  }
  const me = this.defenderFor(attPid);
  const dedicatedPid = ref.kind === 'boxAndOne' ? ref.fnOwner[this.drep().organizations[ref.org].chaser] : null;
  return dedupe(list).filter((id) => id !== me && id !== dedicatedPid && !committed.has(id));
};

// Un cambio persiste en la posesión hasta una modificación pertinente (reorganización, nueva posesión o recuperación real).
P.setCurrent = function setCurrent(attPid, defPid) { const p = this.poss; (p.cur ??= {})[attPid] = defPid; };
P.resetCurrent = function resetCurrent() { if (this.poss) { this.poss.cur = {}; } };
P.commit = function commit(defPid, kind) { (this.poss.committed ??= new Set()).add(defPid); (this.poss.commitKinds ??= {})[defPid] = kind; };

// Resumen para la interfaz y el registro.
P.defenseView = function defenseView(t) {
  const s = this.def[t]; const plan = this.defPlan(t);
  const ref = this.defRef(t);
  return { plan: { org: plan.defense, coverage: plan.coverage, height: plan.pressureHeight, styles: { ...plan.defStyles }, marks: (plan.marks ?? []).map((m) => ({ ...m })), target: plan.target, targetAlt: plan.targetAlt, fallbackOrg: plan.fallbackOrg, navigation: plan.navigation, specials: (plan.specials ?? []).map((x) => ({ ...x })) },
    effective: s.eff ?? this.resolveEffectiveOrg(t), roles: Object.fromEntries(this.onCourt(t).map((id) => [id, this.defRoleOf[id]])), assign: { ...ref.assign }, fnOwner: { ...ref.fnOwner }, open: [...ref.open] };
};

export { SLOTS };
