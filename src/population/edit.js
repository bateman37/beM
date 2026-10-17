// Edición de fichas (MOTOR-11 §11): +1/+3/+5 por puntos absolutos sobre jugadores × capacidades, con previsualización, saturación, deshacer EXACTO y diferencias por campo.
// Solo modifica entradas de preparación/variante, nunca un encuentro ya iniciado (la entrada del partido es una copia congelada).
import { ATTRS, deepCopy } from '../match/data.js';
import { PLAYER_ID } from './ids.js';

// Cambios previstos: nuevo = min(hi, anterior + incremento) sobre la precisión continua (17,35 no se redondea antes de sumar). Una selección vacía no cambia nada.
export function planBulk(teams, playerIds, attrs, delta, [lo, hi] = [1, 30]) {
  const changes = [];
  for (const t of teams) for (const p of t.players) {
    if (!playerIds.has(p.id)) continue;
    for (const a of ATTRS) {
      if (!attrs.has(a)) continue;
      const before = p.abilities[a];
      const after = Math.min(hi, Math.max(lo, before + delta));
      changes.push({ playerId: p.id, attr: a, before, after, limit: after !== before + delta, saturated: before === hi && delta > 0 });
    }
  }
  return changes;
}
export const bulkSummary = (changes) => ({ cells: changes.length, players: new Set(changes.map((c) => c.playerId)).size, changed: changes.filter((c) => c.after !== c.before).length, atLimit: changes.filter((c) => c.limit).length, alreadyAtLimit: changes.filter((c) => c.after === c.before).length });

// Aplica y devuelve un REGISTRO para deshacer: guarda el valor anterior exacto de cada celda (no se deshace restando el incremento: 29 con +3 pasa a 30 y vuelve a 29).
export function applyBulk(teams, changes, label = '') {
  const byId = Object.fromEntries(teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  const record = { label, cells: [] };
  for (const c of changes) { const p = byId[c.playerId]; record.cells.push({ playerId: c.playerId, attr: c.attr, before: p.abilities[c.attr], after: c.after }); p.abilities[c.attr] = c.after; }
  return record;
}
// Restaura los valores anteriores exactos. Si una celda se editó después con otro valor se conserva esa edición y se informa (no se pisa trabajo posterior).
export function undoBulk(teams, record) {
  const byId = Object.fromEntries(teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  let restored = 0; const conflicts = [];
  for (const c of [...record.cells].reverse()) {
    const p = byId[c.playerId];
    if (!p) { conflicts.push({ ...c, reason: 'el jugador ya no está en la entrada' }); continue; }
    if (p.abilities[c.attr] !== c.after) { conflicts.push({ ...c, now: p.abilities[c.attr], reason: 'la celda se editó después' }); continue; }
    p.abilities[c.attr] = c.before; restored += 1;
  }
  return { restored, conflicts };
}

// ---------------------------------------------------------------------------------------------- diferencias por campo
const SKIP = new Set(['source', 'provenance', 'name', 'demo', 'demoOf']);
const keyedBy = { playbook: 'playId', throwInBook: 'playId', pairs: 'slot' };
function norm(v, teamId) {
  if (typeof v === 'string') { const m = PLAYER_ID.exec(v); return m && m[1] === teamId ? `@-J${m[2]}` : v; }
  if (Array.isArray(v)) return v.map((x) => norm(x, teamId));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => !SKIP.has(k)).map(([k, x]) => [k, norm(x, teamId)]));
  return v;
}
function flat(v, path, out, key = null) {
  if (Array.isArray(v) && key && v.every((x) => x && typeof x === 'object' && key in x)) { for (const x of v) flat(x, `${path}[${x[key]}]`, out); return out; }
  if (Array.isArray(v)) { if (v.every((x) => x === null || typeof x !== 'object')) out[path] = v.join(', '); else v.forEach((x, i) => flat(x, `${path}[${i}]`, out)); return out; }
  if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out, keyedBy[k] ?? null); return out; }
  out[path] = v; return out;
}
// Diferencias entre dos equipos (misma plantilla lógica): lista [{ campo, antes, despues }]; los identificadores propios se normalizan para que dos instancias sean comparables.
export function diffTeams(before, after) {
  const a = flat(norm({ players: before.players, plan: before.plan }, before.id), '', {}); const b = flat(norm({ players: after.players, plan: after.plan }, after.id), '', {});
  const out = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out.push({ campo: k.replace(/^players\[(\d+)\]/, (_, i) => `jugador ${before.players[Number(i)]?.id?.split('-')[1] ?? i}`), antes: a[k] ?? null, despues: b[k] ?? null });
  return out;
}
export const copyTeam = (t) => deepCopy(t);
