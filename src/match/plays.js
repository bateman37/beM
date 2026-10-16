// Especificación estructural de las seis fichas activas de MOTOR-01 (POS01, POS05, POS07, POS09, POS11, POS14).
// Aquí no hay coeficientes deportivos: los pesos, recetas y probabilidades viven en el perfil (data/match).
// Lo que sí fija este fichero es la asignación de funciones del encargo §5.3 y qué salidas tiene cada ficha.
import { clamp } from './mathx.js';
import { MatchCore } from './core.js';

const P = MatchCore.prototype;

export const PLAY_SPEC = {
  POS01: {
    roles: { handler: 'director', screener: ['C', 'PF'], receiver: ['SG', 'SF', 'PF'] },
    screen: { role: 'screener', tech: 'TEC09' },
    exits: [
      { role: 'handler', zones: ['rim', 'inside', 'midrange', 'three'], exec: 'dribble', defend: 'primary', icpt: 'primary', moved: ['midrange', 'three'], pen: ['rim', 'inside'], pullupK: ['midrange', 'three'] },
      { role: 'screener', zones: ['rim', 'inside'], exec: 'pass', from: 'handler', defend: 'screenMarker', icpt: 'screenMarker', label: 'CONT01', rollerK: true },
      { role: 'receiver', zones: ['three', 'midrange'], exec: 'pass', from: 'handler', defend: 'receiverMarker', icpt: 'receiverMarker', label: 'CONT05' },
    ],
  },
  POS05: {
    roles: { hub: ['PF', 'C'], receiver: ['SG', 'SF', 'PF'] },
    initialPasserToHub: true,
    exits: [
      { role: 'receiver', zones: ['rim', 'inside', 'midrange', 'three'], exec: 'pass', from: 'hub', defend: 'receiverMarker', icpt: 'receiverMarker', moved: ['midrange', 'three'] },
    ],
  },
  POS07: {
    roles: { receiver: ['SG', 'SF', 'PF'], screener: ['C', 'PF'] },
    screen: { role: 'screener', tech: 'TEC09' },
    exits: [
      { role: 'receiver', zones: ['rim', 'inside', 'midrange', 'three'], exec: 'pass', from: 'director', defend: 'receiverMarker', icpt: 'receiverMarker', moved: ['midrange', 'three'] },
      { role: 'screener', zones: ['rim', 'inside'], exec: 'pass', from: 'director', defend: 'screenMarker', icpt: 'screenMarker' },
    ],
  },
  POS09: {
    roles: { cutter: 'director', passer: ['SG', 'SF', 'PF'] },
    exits: [
      { role: 'cutter', zones: ['rim', 'inside'], exec: 'pass', from: 'passer', defend: 'cutterMarker', icpt: 'cutterMarker' },
      { role: 'passer', zones: ['midrange', 'three'], exec: 'pass', from: 'director', defend: 'receiverMarker', icpt: 'receiverMarker' },
    ],
  },
  POS11: {
    roles: { post: ['C', 'PF'], receiver: ['SG', 'SF', 'PF'] },
    post: { role: 'post', tech: 'TEC11' },
    exits: [
      { role: 'post', zones: ['rim', 'inside', 'midrange'], exec: 'pass', from: 'director', defend: 'postMarker', icpt: 'postMarker' },
      { role: 'receiver', zones: ['three', 'midrange'], exec: 'pass', from: 'post', defend: 'receiverMarker', icpt: 'receiverMarker', label: 'CONT05' },
    ],
  },
  POS14: {
    roles: { handler: ['PG', 'SG', 'SF'], receiver: ['SG', 'SF', 'PF'] },
    exits: [
      { role: 'handler', zones: ['rim', 'inside', 'midrange', 'three'], exec: 'auto', defend: 'primary', icpt: 'primary', moved: ['midrange', 'three'], pen: ['rim', 'inside'] },
      { role: 'receiver', zones: ['three'], exec: 'pass', from: 'handler', defend: 'receiverMarker', icpt: 'receiverMarker', label: 'CONT05' },
    ],
  },
};

const FINISHER_ROLES = new Set(['receiver', 'post', 'handler', 'screener', 'cutter', 'passer', 'hub']);

export const fit = (profile, x) => {
  const f = profile.selection.abilityFit;
  return clamp(1 + f.slope * (x - 16), f.min, f.max);
};

// Peso de un candidato para un rol: términos del rol en qualityAttack normalizados + abilityFit
// (+ vocación de finalización en receptor/poste/finalizador). Si el rol no figura en la receta (p. ej.
// el receptor de apoyo) se usa la receta de desmarque TAR03.
P.actorWeight = function actorWeight(pid, role, play, finisher) {
  let terms = play.qualityAttack.filter((t) => t[0] === role);
  if (!terms.length) terms = this.profile.tasks.TAR03.attack.map(([, a, w]) => [role, a, w]);
  let num = 0; let den = 0;
  for (const [, attr, w] of terms) { num += w * this.eff(pid, attr); den += w; }
  let wgt = fit(this.profile, num / den);
  if (finisher) wgt *= 0.35 + 0.65 * this.pl[pid].finishingVocation;
  return wgt;
};

// Asigna funciones. Devuelve { roles, def } o null si la ficha no es realizable con el quinteto actual.
P.assignRoles = function assignRoles(team, playId, director) {
  const spec = PLAY_SPEC[playId];
  const play = this.profile.plays.find((p) => p.id === playId);
  const roles = { director };
  const taken = new Set([director]);
  for (const [role, source] of Object.entries(spec.roles)) {
    if (source === 'director') { roles[role] = director; continue; }
    const slots = source;
    let cands = this.playersAtSlots(team, slots).filter((id) => !taken.has(id));
    if (!cands.length) return null;
    const items = cands.map((id) => ({ key: id, w: this.actorWeight(id, role, play, FINISHER_ROLES.has(role)) }));
    const chosen = cands.length === 1 ? items[0] : this.pick(items, `rol:${playId}:${role}`);
    roles[role] = chosen.key; taken.add(chosen.key);
  }
  const opp = (pid) => (pid ? this.markerOf(pid) : undefined);
  const def = {
    primary: opp(roles.handler),
    screenMarker: opp(roles.screener),
    receiverMarker: opp(roles.receiver ?? (playId === 'POS09' ? roles.passer : undefined)),
    cutterMarker: opp(roles.cutter),
    postMarker: opp(roles.post),
  };
  return { roles, def };
};

// Construye las salidas (jugador, zona) con ejecución, oposición y contactos.
P.buildExits = function buildExits(team, playId, roles, def) {
  const spec = PLAY_SPEC[playId];
  const exits = [];
  for (const e of spec.exits) {
    const actor = roles[e.role];
    if (!actor) continue;
    for (const zone of e.zones) {
      let exec = e.exec; let from = e.from ?? null;
      if (exec === 'auto') { // POS14: el director debe pasar al aislador si no lo es
        if (roles.handler === roles.director) { exec = 'dribble'; from = null; } else { exec = 'pass'; from = 'director'; }
      }
      const passer = exec === 'pass' ? roles[from] : null;
      let offContact = null;
      if (spec.screen) offContact = { pid: roles[spec.screen.role], tech: spec.screen.tech, kind: 'pantalla' };
      if (spec.post) offContact = { pid: roles[spec.post.role], tech: spec.post.tech, kind: 'poste' };
      if (e.pen && e.pen.includes(zone) && exec !== 'pass') offContact = { pid: actor, tech: 'TEC07', kind: 'penetración' };
      exits.push({
        key: `${e.role}:${zone}`, role: e.role, actor, zone, exec, passer,
        icpt: def[e.icpt] ?? null, defend: def[e.defend] ?? null,
        label: e.label ?? null, moved: !!(e.moved && e.moved.includes(zone)),
        offContact, pullup: !!(e.pullupK && e.pullupK.includes(zone)), roller: !!e.rollerK,
        holder: exec === 'pass' ? passer : actor,
      });
    }
  }
  return exits;
};
