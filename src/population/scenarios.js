// Escenarios de contraste MOTOR-11 (LAB11-00…12, §12). El catálogo es DATOS versionados (`profile.lab`): pregunta, base, equipos, diferencias exactas (operaciones declarativas)
// y variables conservadas. Cada variante es una COPIA de la entrada: no sobrescribe fichas ni planes, lista lo que cambia y se identifica en su entrada congelada.
// Reutiliza las copias C00–C06 de MOTOR-07 (`ref`) sin duplicarlas. Un solo partido no atribuye causas: las variantes multicausa se rotulan.
import { INPUT_SCHEMA, deepCopy } from '../match/data.js';
import { buildContrastScenario } from '../match/scenarios.js';
import { instantiate } from './ids.js';
import { REFERENCE_IDS, referenceTeam, historicalPair } from './reference.js';
import { generateTeam } from './generator.js';
import { playerId } from './ids.js';

const clampTo = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));

// Equipo lógico a partir de una referencia: id de referencia, id guardado en la biblioteca o configuración de generación.
export function resolveTeam(profile, csvPlayers, lib, ref) {
  if (ref && typeof ref === 'object' && ref.generated) return generateTeam(profile, csvPlayers, ref.generated);
  if (REFERENCE_IDS.includes(ref)) return referenceTeam(profile, csvPlayers, ref);
  const t = lib?.team(ref); if (t) return t;
  throw new Error(`equipo desconocido: ${typeof ref === 'string' ? ref : JSON.stringify(ref)}`);
}

// Catálogo expandido: LAB11-01 genera una variante por plan natural.
export function labCatalog(profile) {
  const lab = profile.lab; if (!lab) return [];
  return lab.scenarios.map((sc) => {
    if (!sc.fromNaturalPlans) return sc;
    const ids = REFERENCE_IDS;
    return { ...sc, variants: ids.map((id, i) => ({ id, label: `${id} · ${profile.population.teams[id].identity} (plan natural ${profile.population.teams[id].planVersion})`, pairing: { a: id, b: ids[(i + 1) % ids.length] }, multicause: true, ops: [] })) };
  });
}

function editor(input, bounds) {
  const changes = []; const byId = Object.fromEntries(input.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  const rec = (o) => { changes.push(o); };
  return {
    changes,
    state(id, key, value) { const p = byId[id]; const before = p.state[key]; p.state[key] = value; rec({ jugador: id, campo: `estado ${key}`, antes: before, despues: value }); },
    field(id, key, value) { const p = byId[id]; const before = p[key]; p[key] = value; rec({ jugador: id, campo: key, antes: before, despues: value }); },
    ability(id, attr, delta) { const p = byId[id]; const before = p.abilities[attr]; p.abilities[attr] = clampTo(before + delta, bounds); rec({ jugador: id, campo: `capacidad ${attr}`, antes: before, despues: p.abilities[attr] }); },
    style(idx, key, value) { const t = input.teams[idx]; const before = t.plan.styles[key]; t.plan.styles[key] = value; rec({ equipo: t.id, campo: `plan.styles.${key}`, antes: before, despues: value }); },
    plan(idx, key, value) { const t = input.teams[idx]; const before = t.plan[key]; t.plan[key] = value; rec({ equipo: t.id, campo: `plan.${key}`, antes: before, despues: value }); },
    top(key, value) { const before = input[key]; input[key] = value; rec({ campo: key, antes: before, despues: value }); },
  };
}

// «director» = primero de la lista de directores del equipo; «Jnn» = esa plaza; «starters» = el quinteto inicial.
export function resolveWho(input, who) {
  const t = input.teams[who.team];
  if (who.player === 'director') return [t.plan.directorPriority[0]];
  if (who.player === 'starters') return Object.values(t.plan.starters);
  if (/^J\d\d$/.test(who.player)) return [playerId(t.id, Number(who.player.slice(1)))];
  throw new Error(`jugador de escenario no reconocido: ${who.player}`);
}
const refVal = (input, v) => (v && typeof v === 'object' && 'team' in v && 'player' in v ? resolveWho(input, v)[0] : v);

function applyOps(ops, input, ed) {
  for (const o of ops) {
    if (o.op === 'state') resolveWho(input, o.who).forEach((id) => ed.state(id, o.key, o.value));
    else if (o.op === 'field') resolveWho(input, o.who).forEach((id) => ed.field(id, o.key, o.value));
    else if (o.op === 'ability') resolveWho(input, o.who).forEach((id) => o.attrs.forEach((a) => ed.ability(id, a, o.delta)));
    else if (o.op === 'style') ed.style(o.team, o.key, o.value);
    else if (o.op === 'plan') ed.plan(o.team, o.key, refVal(input, o.value));
    else if (o.op === 'top') ed.top(o.key, o.value);
    else throw new Error(`operación de escenario desconocida: ${o.op}`);
  }
}

// Construye la entrada de una variante. `opts`: { seed, importance, lib, pairing: {a?,b?} (rival libre) }.
// Devuelve { input, changes, scenario, base, plannedOrders } o lanza con el motivo.
export function buildLabVariant(profile, csvPlayers, scenarioId, variantId, opts = {}) {
  const sc = labCatalog(profile).find((s) => s.id === scenarioId); if (!sc) throw new Error(`escenario desconocido: ${scenarioId}`);
  const v = sc.variants.find((x) => x.id === variantId) ?? sc.variants[0]; if (!v) throw new Error(`variante desconocida: ${variantId}`);
  const pairing = { ...sc.pairing, ...(v.pairing ?? {}), ...(sc.rivalFree || opts.allowOverride ? (opts.pairing ?? {}) : {}) };
  let teams;
  if (sc.historical) teams = historicalPair(profile, csvPlayers);
  else {
    const a = resolveTeam(profile, csvPlayers, opts.lib, pairing.a); const bRaw = resolveTeam(profile, csvPlayers, opts.lib, pairing.b);
    const A = instantiate(a, []); const B = instantiate(bRaw, [A.id]); teams = [A, B];
  }
  const seed = opts.seed ?? sc.seed ?? profile.scenario.seed;
  const base = { schema: INPUT_SCHEMA, seed, importance: opts.importance ?? 'ordinary', teams: deepCopy(teams) };
  let input = deepCopy(base); const ed = editor(input, profile.abilityBounds);
  let changes;
  if (v.ref) { const r = buildContrastScenario(v.ref, input, profile); input = r.input; changes = r.changes; }
  else { applyOps(v.ops ?? [], input, ed); changes = ed.changes; }
  const ref = sc.id === 'LAB11-12' ? 'generated' : null; void ref;
  const labId = `${sc.id}/${v.id}`;
  input.contrast = { id: labId, name: `${sc.name} · ${v.label}`, lab: profile.lab.version };
  const planned = (v.plannedOrders ?? []).map((po) => ({ ...po, spec: { ...Object.fromEntries(Object.entries(po.spec).map(([k, x]) => [k, refVal(input, x)])) } }));
  const multicause = v.multicause ?? sc.multicause;
  return {
    input, changes, base, plannedOrders: planned,
    scenario: { id: labId, name: `${sc.name} · ${v.label}`, summary: sc.question, question: sc.question, lab: sc.id, variant: { id: v.id, label: v.label }, labVersion: profile.lab.version, diagnostic: !!sc.diagnostic, multicause: !!multicause, conserved: sc.conserved,
      pairing: { a: input.teams[0].id, b: input.teams[1].id } },
  };
}
export const sameTeamsNote = (r) => (r.scenario.diagnostic ? 'Entrada preparada de diagnóstico: no es un acontecimiento natural.' : r.scenario.multicause ? 'Contraste multicausa: cambian varias entradas; un solo partido no atribuye causas.' : 'Un solo partido no atribuye causas ni garantiza que el cambio mejore el resultado.');
