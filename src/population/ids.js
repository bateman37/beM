// Identidad lógica e instancias de equipo (MOTOR-11 §10.2). Un equipo lógico (EQ04, una variante, un generado) puede aparecer dos veces en un encuentro: cada copia
// recibe una INSTANCIA con identificadores únicos (EQ04, EQ04_B) y conserva `source` con su identidad lógica y el remapeo. Los valores nunca cambian por una colisión de nombres.
import { deepCopy } from '../match/data.js';

export const TEAM_ID = /^[A-Z][A-Z0-9_]*$/;               // sin guion: el identificador de plaza es <equipo>-J<nn>
export const PLAYER_ID = /^([A-Z][A-Z0-9_]*)-J(\d\d)$/;
export const playerId = (teamId, n) => `${teamId}-J${String(n).padStart(2, '0')}`;
export const teamOfPlayer = (id) => PLAYER_ID.exec(id)?.[1] ?? null;
export const slotOfPlayer = (id) => PLAYER_ID.exec(id)?.[2] ?? null;

// Reasigna recursivamente todos los identificadores de jugador del equipo `from` al equipo `to` dentro de cualquier estructura. Las referencias a otros equipos
// (objetivos y marcas sobre el rival) no empiezan por `from-J` y no se tocan.
export function remapIds(value, from, to) {
  if (typeof value === 'string') { const m = PLAYER_ID.exec(value); return m && m[1] === from ? `${to}-J${m[2]}` : value; }
  if (Array.isArray(value)) return value.map((v) => remapIds(v, from, to));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remapIds(v, from, to)]));
  return value;
}

// Copia del equipo con otro identificador de equipo y de jugadores. Registra el remapeo en `source.instance`.
export function retargetTeam(team, newId) {
  if (!TEAM_ID.test(newId)) throw new Error(`identificador de equipo no válido: ${newId}`);
  const from = team.id; const t = deepCopy(team);
  if (from === newId) return t;
  const out = remapIds(t, from, newId);
  out.id = newId; out.plan.teamId = newId;
  out.players.forEach((p) => { p.teamId = newId; });
  out.source = { ...(out.source ?? {}), instance: { id: newId, of: team.source?.instance?.of ?? from, from } };
  return out;
}

// Primer identificador libre: el canónico y después _B, _C, … Devuelve la instancia (copia independiente).
export function instantiate(team, takenIds = []) {
  const taken = new Set(takenIds); const base = team.source?.instance?.of ?? team.id;
  if (!taken.has(base)) return retargetTeam(team, base);
  for (const suf of 'BCDEFGHIJKLMNOPQRSTUVWXYZ') { const id = `${base}_${suf}`; if (!taken.has(id)) return retargetTeam(team, id); }
  throw new Error(`no hay identificador de instancia libre para ${base}`);
}

// Quita del plan de `team` las referencias a jugadores que ya no están en el rival (marcas, objetivos, doble, no abandonar, objetivo de saque). Devuelve lo retirado
// para mostrarlo: nada se corrige en silencio y la validación sigue exigiendo lo que falte (p. ej. un box and one sin objetivo).
export function dropStaleRivalRefs(team, rivalPlayerIds) {
  const theirs = new Set(rivalPlayerIds); const plan = team.plan; const removed = [];
  const stale = (id) => id != null && !theirs.has(id);
  plan.marks = (plan.marks ?? []).filter((m) => { if (stale(m.attacker)) { removed.push(`marca de ${m.defender} sobre ${m.attacker}`); return false; } return true; });
  for (const k of ['target', 'targetAlt']) if (stale(plan[k])) { removed.push(`${k === 'target' ? 'objetivo' : 'alternativa'} ${plan[k]}`); plan[k] = null; }
  plan.specials = (plan.specials ?? []).filter((sp) => {
    const ids = [sp.principal, sp.alternate, sp.protected].filter((x) => x != null);
    if (ids.some(stale)) { removed.push(`${sp.id} sobre ${ids.join('/')}`); return false; }
    return true;
  });
  if (stale(plan.throwInDefense?.target)) { removed.push(`objetivo de saque ${plan.throwInDefense.target}`); plan.throwInDefense.target = null; }
  return removed;
}
