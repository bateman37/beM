// Variantes de un lote (MOTOR-12 §5): operaciones DECLARATIVAS aplicadas a la entrada de cada caso. La variante base no cambia nada; una candidata lista exactamente lo que cambia.
// La selección de jugadores se resuelve y se LISTA antes de ejecutar (`changes`), nunca depende de lo que ocurra durante el partido.
// Selectores de equipo: 'A' / 'B' (los dos equipos lógicos del par, con independencia de quién sea local), '*' (ambos) o el identificador de un equipo lógico (p. ej. «EQ04»).
// Selectores de jugador: 'director' (primero de la lista de directores), 'starters', 'all' o una plaza «Jnn».
import { playerId } from '../population/ids.js';

export const OPS = ['ability', 'state', 'field', 'style', 'plan'];
const clampTo = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));

// Índices (puesto en la entrada) del equipo designado por el selector. `sides`: [{ logical, instance }] por puesto 0/1; `pair`: { a, b } con las referencias lógicas.
export function resolveTeams(sel, input, pair) {
  const ids = input.teams.map((t) => t.source?.instance?.of ?? t.id);
  const idx = (ref) => ids.map((x, i) => (x === ref ? i : -1)).filter((i) => i >= 0);
  if (sel === '*') return [0, 1];
  if (sel === 'A') return pair.a === pair.b ? [0] : idx(pair.a);
  if (sel === 'B') return pair.a === pair.b ? [1] : idx(pair.b);
  const found = idx(sel);
  if (!found.length) throw new Error(`el selector de equipo «${sel}» no corresponde a ningún equipo del caso`);
  return found;
}
function resolvePlayers(who, team) {
  if (who === 'director') return [team.plan.directorPriority[0]];
  if (who === 'starters') return Object.values(team.plan.starters);
  if (who === 'all') return team.players.map((p) => p.id);
  if (/^J\d\d$/.test(who)) { const id = playerId(team.id, Number(who.slice(1))); if (!team.players.some((p) => p.id === id)) throw new Error(`${team.id} no tiene la plaza ${who}`); return [id]; }
  throw new Error(`selector de jugador no reconocido: ${who}`);
}

// Aplica las operaciones sobre una COPIA de la entrada (el llamador entrega la copia). Devuelve la lista exacta de cambios.
export function applyVariantOps(input, ops, { pair, bounds }) {
  const changes = []; const byId = Object.fromEntries(input.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  for (const o of ops ?? []) {
    if (!OPS.includes(o.op)) throw new Error(`operación de variante desconocida: ${o.op}`);
    for (const ti of resolveTeams(o.team ?? '*', input, pair)) {
      const t = input.teams[ti];
      if (o.op === 'style') { const b = t.plan.styles[o.key]; t.plan.styles[o.key] = o.value; changes.push({ equipo: t.id, campo: `plan.styles.${o.key}`, antes: b, despues: o.value }); continue; }
      if (o.op === 'plan') { const b = t.plan[o.key]; t.plan[o.key] = o.value; changes.push({ equipo: t.id, campo: `plan.${o.key}`, antes: b, despues: o.value }); continue; }
      for (const id of resolvePlayers(o.player ?? 'all', t)) {
        const p = byId[id];
        if (o.op === 'ability') for (const a of o.attrs) { if (!(a in p.abilities)) throw new Error(`capacidad desconocida: ${a}`); const b = p.abilities[a]; p.abilities[a] = clampTo(b + o.delta, bounds); changes.push({ jugador: id, campo: `capacidad ${a}`, antes: b, despues: p.abilities[a], saturada: p.abilities[a] !== b + o.delta }); }
        else if (o.op === 'state') { const b = p.state[o.key]; p.state[o.key] = o.value; changes.push({ jugador: id, campo: `estado ${o.key}`, antes: b, despues: o.value }); }
        else if (o.op === 'field') { const b = p[o.key]; p[o.key] = o.value; changes.push({ jugador: id, campo: o.key, antes: b, despues: o.value }); }
      }
    }
  }
  return changes;
}

// Validación estructural de la definición (antes de materializar nada).
export function validateVariants(variants, { attrs } = {}) {
  const problems = []; const seen = new Set();
  if (!Array.isArray(variants) || !variants.length) return ['hace falta al menos la variante base'];
  variants.forEach((v, i) => {
    const p = `variante ${i + 1}`;
    if (!v.id || !/^[A-Za-z0-9_]+$/.test(v.id)) problems.push(`${p}: identificador no válido`);
    if (seen.has(v.id)) problems.push(`${p}: identificador repetido (${v.id})`); seen.add(v.id);
    if (i === 0 && v.ops?.length) problems.push('la primera variante es la base y no puede cambiar nada');
    for (const o of v.ops ?? []) {
      if (!OPS.includes(o.op)) problems.push(`${p}: operación desconocida «${o.op}»`);
      if (o.op === 'ability') { if (!Number.isFinite(o.delta)) problems.push(`${p}: delta no numérico`); if (!Array.isArray(o.attrs) || !o.attrs.length || (attrs && o.attrs.some((a) => !attrs.includes(a)))) problems.push(`${p}: capacidades no válidas`); }
    }
  });
  return problems;
}
