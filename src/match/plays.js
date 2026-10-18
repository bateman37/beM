// Repertorio ofensivo declarativo (MOTOR-04): las quince fichas, las seis disposiciones, la ocupación de funciones y la asignación
// de participantes. NO hay coeficientes deportivos aquí: el contenido (roles, salidas, etapas, requisitos) vive en el perfil
// (`profile.repertoire`, cargado desde data/match/motor04-seed-extension.json) y las magnitudes en sus filas
// (`selection.rolePreference`, `participantSlots`, `rotation.slotAbilityWeights`…). Este fichero solo interpreta ese contenido.
import { abilityFit, vocationFactor } from './formulas.js';
import { MatchCore } from './core.js';
import { SLOTS } from './data.js';

const P = MatchCore.prototype;
export const fit = abilityFit;

// Orden en el que se ocupan las funciones de una disposición: primero las más escasas (interiores), después laterales y esquinas.
const FN_ORDER = ['lowInside', 'block', 'inside', 'highInside', 'elbow', 'wing', 'corner'];

P.rep = function rep() { return this.profile.repertoire; };

// Definición efectiva de una ficha: contenido propio + recetas de la ficha donante si `recipeFrom` (no se copian: se referencian).
P.playDef = function playDef(id) {
  const spec = this.profile.repertoire.plays[id];
  if (!spec) throw new Error(`ficha desconocida ${id}`);
  const donorId = spec.recipeFrom ?? id;
  const donor = this.profile.plays.find((p) => p.id === donorId);
  if (!donor) throw new Error(`la ficha ${id} referencia una receta inexistente (${donorId})`);
  return { id, spec, family: spec.family, donorId, qualityAttack: donor.qualityAttack, qualityDefense: donor.qualityDefense, shotWeights: donor.shotWeights };
};

// ---------------------------------------------------------------- disposición: ocupación de funciones
// Asignación determinista: el director ocupa la cabecera; el resto de funciones las ocupa, por escasez, el jugador de mayor ajuste de
// capacidad (receta de posición existente `rotation.slotAbilityWeights` de la función). No hay prohibición por posición nominal.
P.layoutFor = function layoutFor(team, disId, director) {
  const rep = this.rep();
  const dis = rep.dispositions[disId];
  if (!dis) throw new Error(`disposición desconocida ${disId}`);
  const map = {};
  map[director] = 'top';
  const remaining = this.onCourt(team).filter((id) => id !== director && this.ps[id].available);
  const fns = dis.functions.slice(1).slice().sort((a, b) => FN_ORDER.indexOf(a) - FN_ORDER.indexOf(b));
  for (const fn of fns) {
    if (!remaining.length) break;
    const ab = rep.functions[fn].ability;
    const weights = this.profile.rotation.slotAbilityWeights[ab];
    let best = null; let bw = -Infinity;
    for (const id of [...remaining].sort()) {
      const w = fit(this.profile, this.weightedSum(id, weights));
      if (w > bw + 1e-12) { bw = w; best = id; }
    }
    map[best] = fn; remaining.splice(remaining.indexOf(best), 1);
  }
  const byFn = {};
  for (const [pid, fn] of Object.entries(map)) (byFn[fn] ??= []).push(pid);
  return { dis: disId, name: dis.name, map, byFn };
};

// Layout de la posesión: se calcula al primer uso y se conserva mientras no cambie la disposición.
P.layoutOf = function layoutOf(poss, director) {
  const disId = poss.disposition ?? this.teams[poss.team].plan.disposition;
  if (!poss.layout || poss.layout.dis !== disId || poss.layout.director !== director) {
    poss.layout = { ...this.layoutFor(poss.team, disId, director), director };
    poss.layoutLogged = false;
  }
  return poss.layout;
};

// ---------------------------------------------------------------- roles ofensivos: sesgo de uso (una vez, al elegir participante)
P.roleBias = function roleBias(pid, tags) {
  const sel = this.profile.selection;
  const r = this.rep().offensiveRoles[this.roleOf[pid]];
  if (!r) return sel.newVariantPreference.unknownRoleFunctionWeight;
  return tags.some((t) => r.favors.includes(t)) ? sel.rolePreference.favoredFunctionWeight : sel.rolePreference.otherFunctionWeight;
};

// Peso de un candidato para una función: términos de esa función en la calidad de ataque de la ficha (o desmarque TAR03 si la función
// no figura en la receta) mediante abilityFit, × vocación de finalización si procede. Una sola vez; el sesgo de rol se aplica aparte.
P.actorWeight = function actorWeight(pid, role, play, finisher) {
  let terms = play.qualityAttack.filter((t) => t[0] === role);
  if (!terms.length) terms = this.profile.tasks.TAR03.attack.map(([, a, w]) => [role, a, w]);
  let num = 0; let den = 0;
  for (const [, attr, w] of terms) { num += w * this.eff(pid, attr); den += w; }
  let wgt = fit(this.profile, num / den);
  if (finisher) wgt *= vocationFactor(this.profile, this.pl[pid].finishingVocation);
  return wgt;
};

const fnOk = (fn, allowed) => allowed === 'any' || allowed.includes(fn);

// Candidatos de una función de la ficha: jugadores en pista, disponibles, no tomados, cuya función de disposición es admitida.
// V03 (MOTOR-05): la posición nominal (`participantSlots`) es solo una RECOMENDACIÓN visible (bookCompatibility / interfaz). Ya no filtra
// candidatos por niveles: decide el ajuste funcional (abilityFit de la receta de la función) y el sesgo de rol; un candidato competente
// no se degrada sistemáticamente por su posición.
P.roleCandidates = function roleCandidates(team, def, layout, taken) {
  return this.onCourt(team).filter((id) => this.ps[id].available && !taken.has(id) && fnOk(layout.map[id], def.fn));
};

// ¿Se pueden ocupar a la vez todas las funciones obligatorias? Emparejamiento (sin sorteos). `fixed` = jugadores ya tomados.
function matchable(roleList, candOf) {
  const owner = new Map();
  const tryRole = (r, seen) => {
    for (const p of candOf(r)) {
      if (seen.has(p)) continue; seen.add(p);
      if (!owner.has(p) || tryRole(owner.get(p), seen)) { owner.set(p, r); return true; }
    }
    return false;
  };
  return roleList.every((r) => tryRole(r, new Set()));
}

// Asigna funciones de la ficha. Devuelve { roles, def, spec, layout } o { fail } (motivo funcional, no nominal).
// `dry` evalúa realizabilidad sin sorteos. `poss` aporta las negaciones observadas (POS10).
// MOTOR-17 (P17): la comprobación en seco (`dry`) es una función PURA de (ficha, director, disposición y su mapa de funciones, jugadores en pista y disponibles): no sortea ni registra nada. Se memoriza por encuentro
// (nunca compartida entre encuentros) solo sin rastreo de parámetros (registro `minimal`/esencial: con `full` cada consulta numera filas y debe repetirse igual que en A17) y sin contexto de negación (depende de la posesión).
const LAYOUT_SIG = new WeakMap();
const layoutSig = (layout) => { let v = LAYOUT_SIG.get(layout); if (v === undefined) { v = `${layout.dis}~${Object.entries(layout.map).map(([id, fn]) => `${id}:${fn}`).join(',')}`; LAYOUT_SIG.set(layout, v); } return v; };
P.assignRoles = function assignRoles(team, playId, director, layout, poss, opts = {}) {
  if (!opts.dry || this.tracker) return this.assignRolesImpl(team, playId, director, layout, poss, opts);
  const spec = this.playDef(playId).spec; if (spec.requires?.context === 'denial') return this.assignRolesImpl(team, playId, director, layout, poss, opts);
  const key = `${team}|${playId}|${director}|${layoutSig(layout)}|${this.onCourt(team).filter((id) => this.ps[id].available).join(',')}`;
  const memo = (this.dryRoleMemo ??= new Map()); let v = memo.get(key);
  if (v === undefined) { const r = this.assignRolesImpl(team, playId, director, layout, poss, opts); v = r.ok ? true : r.fail; memo.set(key, v); }
  return v === true ? { ok: true, spec, layout } : { fail: v };
};
P.assignRolesImpl = function assignRolesImpl(team, playId, director, layout, poss, { dry = false } = {}) {
  const play = this.playDef(playId); const spec = play.spec;
  const roles = { director };
  const taken = new Set([director]);
  if (spec.requires?.context === 'denial') {
    const den = (poss?.denials ?? []).filter((d) => this.ps[d.actor]?.onCourt && this.pl[d.actor].teamIdx === team && d.actor !== director).pop();
    if (!den) return { fail: 'requiere una negación observada en esta posesión (no se activa por nombre)' };
    // el receptor negado pasa a ser el cortador de la ficha
    for (const [role, def] of Object.entries(spec.roles)) if (def.src === 'denied') { roles[role] = den.actor; taken.add(den.actor); }
  }
  for (const rq of spec.requires?.functions ?? []) {
    const n = this.onCourt(team).filter((id) => rq.any.includes(layout.map[id])).length;
    if (n < rq.min) return { fail: `falta la función ${rq.any.map((f) => this.rep().functions[f].label).join(' / ')} en la disposición ${layout.dis}` };
  }
  for (const [role, def] of Object.entries(spec.roles)) if (def.src === 'director') roles[role] = director;
  const pools = Object.entries(spec.roles).filter(([, d]) => d.src === 'pool');
  const needed = pools.filter(([, d]) => !d.opt).map(([r]) => r);
  // MOTOR-06: un rol con `directorOk` (aislador de POS14) admite al director como candidato más, sin prioridad por identidad; si lo elige,
  // el director cumple ambas funciones (aísla él mismo y no necesita pasarse el balón).
  const candOf = (r) => this.roleCandidates(team, spec.roles[r], layout, spec.roles[r].directorOk ? new Set([...taken].filter((x) => x !== director)) : taken);
  if (!matchable(needed, candOf)) {
    const missing = needed.find((r) => !candOf(r).length) ?? needed[0];
    const d = spec.roles[missing];
    return { fail: `falta una función «${missing}» (${d.fn === 'any' ? 'cualquiera' : d.fn.map((f) => this.rep().functions[f].label).join(' / ')}) en la disposición ${layout.dis}` };
  }
  if (dry) return { ok: true, spec, layout };
  // orden de ocupación: obligatorias antes que opcionales; dentro, la de menos candidatos primero (estable)
  const nCand = new Map(pools.map(([r]) => [r, candOf(r).length])); // MOTOR-17 (P17): una sola evaluación por función antes de ocupar ninguna (el orden resultante es el mismo)
  const order = [...pools].sort((a, b) => ((a[1].opt ? 1 : 0) - (b[1].opt ? 1 : 0)) || (nCand.get(a[0]) - nCand.get(b[0])));
  for (const [role, def] of order) {
    let cands = candOf(role);
    // no consumir a quien otra función obligatoria pendiente necesita
    const pending = needed.filter((r) => roles[r] == null && r !== role);
    if (pending.length) {
      const keep = cands.filter((id) => { const had = taken.has(id); taken.add(id); const ok = matchable(pending, candOf); if (!had) taken.delete(id); return ok; });
      if (keep.length) cands = keep;
    }
    if (!cands.length) { if (def.opt) continue; return { fail: `falta una función «${role}»` }; }
    const rec = def.slotGroup ? this.profile.participantSlots[def.slotGroup] : null; // recomendación visible (V03): se registra, no filtra
    if (rec) this.note(`recomendación:${playId}:${role}`, { posicionesRecomendadas: rec, candidatos: cands.map((id) => ({ id, posicion: this.slotOf(id), recomendado: rec.includes(this.slotOf(id)) })) });
    const items = cands.map((id) => ({ key: id, w: this.actorWeight(id, role, play, true) * this.roleBias(id, def.tags ?? []) }));
    const chosen = cands.length === 1 ? items[0] : this.pick(items, `rol:${playId}:${role}`);
    roles[role] = chosen.key; taken.add(chosen.key);
  }
  const opp = (pid) => (pid ? this.markerOf(pid) : undefined);
  const defs = { primary: opp(roles.handler), screenMarker: opp(roles.screener), receiverMarker: opp(roles.receiver), cutterMarker: opp(roles.cutter), postMarker: opp(roles.post) };
  for (const [role, pid] of Object.entries(roles)) { const k = `${role}Marker`; if (defs[k] === undefined) defs[k] = opp(pid); }
  for (const [k, r] of Object.entries(spec.markers ?? {})) defs[k] = opp(roles[r]);
  return { roles, def: defs, spec, layout };
};

// Construye las salidas (jugador, zona) de una lista declarativa (primer nivel de la ficha o una etapa).
P.buildExits = function buildExits(team, playId, roles, def, list = null, stage = false) {
  const spec = this.rep().plays[playId];
  const exits = [];
  for (const e of list ?? spec.exits) {
    const actor = roles[e.role];
    if (!actor) continue;
    for (const zone of e.zones) {
      let exec = e.exec; let from = e.from ?? null;
      if (exec === 'auto') { // aclarado: si el director no es el aislador, debe pasarle
        if (roles.handler === roles.director) { exec = 'dribble'; from = null; } else { exec = 'pass'; from = 'director'; }
      }
      const passer = exec === 'pass' ? roles[from] : null;
      if (exec === 'pass' && (!passer || passer === actor)) continue; // nadie puede pasar, o sería pasador y receptor del mismo envío
      let offContact = null;
      if (!stage && spec.screen) offContact = { pid: roles[spec.screen.role], tech: spec.screen.tech, kind: 'pantalla' };
      if (!stage && spec.post) offContact = { pid: roles[spec.post.role], tech: spec.post.tech, kind: 'poste' };
      if (e.pen && e.pen.includes(zone) && (exec !== 'pass' || e.catchDrive)) offContact = { pid: actor, tech: 'TEC07', kind: 'penetración' };
      // Defensa (MOTOR-05): el atacante abierto (sin función que lo cubra) recibe sin oposición; en zona, la finalización en el aro la
      // defiende la función de protección del aro y no cualquier marcador (la amenaza de la interacción, no la posición nominal).
      const open = this.isOpen(actor);
      const shotDef = open ? null : (this.shotDefenderFor(actor, zone) ?? def[e.defend] ?? null);
      exits.push({
        key: `${e.role}:${zone}${e.stage ? `:${e.stage}` : ''}`, role: e.role, actor, zone, exec, passer,
        icpt: open ? null : (def[e.icpt] ?? null), defend: shotDef, ...(open ? { window: true, helpWindow: 'abierto por la estructura defensiva' } : {}),
        label: e.label ?? null, moved: !!(e.moved && e.moved.includes(zone)),
        offContact, pullup: !!(e.pullupK && e.pullupK.includes(zone)), roller: !!e.rollerK,
        holder: exec === 'pass' ? passer : actor, stage: e.stage ?? null, qual: e.qual ?? null, cont: !!e.label,
      });
    }
  }
  return exits;
};

export { SLOTS };

// Compatibilidad del libro con el quinteto actual: SIN sorteos ni consumo de tiempo. La usan la preparación y el panel para explicar,
// por función (no por posición nominal), qué fichas son entrada natural, cuáles son realizables y cuáles necesitan reorganizar.
P.bookCompatibility = function bookCompatibility(team, disId = this.teams[team].plan.disposition) {
  const rep = this.rep();
  const director = this.pickDirector(team).id;
  const poss = { denials: [], team };
  const layout = this.layoutFor(team, disId, director);
  const catalog = this.profile.activeCatalog.dispositions;
  const plays = Object.keys(rep.plays).map((id) => {
    const spec = rep.plays[id];
    const base = { id, name: spec.name, family: spec.family, natural: spec.natural.includes(disId), naturalDispositions: spec.natural };
    const r = this.assignRoles(team, id, director, layout, poss, { dry: true });
    if (r.ok) return { ...base, status: spec.natural.includes(disId) ? 'natural' : 'realizable' };
    if (spec.requires?.context === 'denial') return { ...base, status: 'contexto', reason: r.fail };
    for (const dis of spec.natural.filter((x) => x !== disId && catalog.includes(x))) {
      if (this.assignRoles(team, id, director, this.layoutFor(team, dis, director), poss, { dry: true }).ok) return { ...base, status: 'reorganiza', reorganizaA: dis, reason: r.fail };
    }
    return { ...base, status: 'no', reason: r.fail };
  });
  return { disposition: disId, director, layout, plays };
};
