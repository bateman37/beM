// Adaptador explícito de entrada (SIM-MOTOR-01 §4.1): lee la entrada del detallado (beM-match-input/6 o /7) SIN modificarla, valida solo lo que SIM consume y devuelve una vista normalizada.
// Los errores son localizados (ruta + mensaje); lo que SIM no representa se declara en `ignored` (no se descarta en silencio).
import { fpOf } from './profile.js';

const ATTRS = ['TEC01', 'TEC02', 'TEC03', 'TEC04', 'TEC05', 'TEC06', 'TEC07', 'TEC08', 'TEC09', 'TEC10', 'TEC11', 'TEC12', 'TEC13', 'TEC14', 'TEC15', 'TEC16', 'TEC17', 'TEC18',
  'FIS01', 'FIS02', 'FIS03', 'FIS04', 'FIS05', 'FIS06', 'FIS07', 'MEN01', 'MEN02', 'MEN03', 'MEN04', 'MEN05', 'MEN06', 'MEN07'];
export const SIM_ATTRS = ATTRS;
export const ACCEPTED_SCHEMAS = ['beM-match-input/6', 'beM-match-input/7'];
const deep = (x) => JSON.parse(JSON.stringify(x));
const PLAN_IGNORED = ['specials', 'throwInBook', 'throwInServers', 'throwInDefense', 'marks', 'navigation'];

export function validateSimInput(input, sp, tables) {
  const errs = []; const add = (path, message) => errs.push({ path, message });
  if (!input || typeof input !== 'object') { add('input', 'entrada ausente'); return errs; }
  if (!ACCEPTED_SCHEMAS.includes(input.schema)) add('schema', `esquema no admitido (${input.schema}); se admiten ${ACCEPTED_SCHEMAS.join(', ')}`);
  if (!Number.isInteger(input.seed) || input.seed < 0 || input.seed > 4294967295) add('seed', 'la semilla debe ser un entero entre 0 y 4294967295');
  if (!Object.keys(sp.v.pressure.importance).includes(input.importance ?? 'ordinary')) add('importance', `importancia no reconocida (${input.importance})`);
  if (!Array.isArray(input.teams) || input.teams.length !== 2) { add('teams', 'se necesitan exactamente dos equipos'); return errs; }
  const [lo, hi] = sp.v.abilityBounds;
  const seenT = new Set(); const seenP = new Set();
  input.teams.forEach((t, ti) => {
    const tp = `teams[${ti}](${t?.id})`;
    if (typeof t?.id !== 'string' || !t.id) { add(`${tp}.id`, 'identificador de equipo ausente'); return; }
    if (seenT.has(t.id)) add(`${tp}.id`, 'dos equipos con la misma identidad de instancia (use una copia con otro identificador)'); seenT.add(t.id);
    if (!Array.isArray(t.players) || t.players.length < 5 || t.players.length > 15) { add(`${tp}.players`, 'cada equipo necesita entre 5 y 15 jugadores'); return; }
    const ids = new Set(t.players.map((p) => p.id));
    t.players.forEach((p, pi) => {
      const pp = `${tp}.players[${pi}](${p.id})`;
      if (seenP.has(p.id)) add(`${pp}.id`, 'identificador de jugador duplicado en el encuentro'); seenP.add(p.id);
      for (const k of ATTRS) { const v = p.abilities?.[k]; if (typeof v !== 'number' || !Number.isFinite(v)) add(`${pp}.abilities.${k}`, 'capacidad ausente o no numérica'); else if (v < lo || v > hi) add(`${pp}.abilities.${k}`, `fuera de rango ${lo}-${hi}`); }
      const e = p.state?.energy; if (typeof e !== 'number' || e < 0 || e > 100) add(`${pp}.state.energy`, 'energía inicial entre 0 y 100');
      for (const k of ['initiative', 'finishingVocation']) if (typeof p[k] !== 'number' || p[k] < 0 || p[k] > 1) add(`${pp}.${k}`, 'valor entre 0 y 1');
      for (const z of ['rim', 'midrange', 'three']) if (typeof p.zonePreference?.[z] !== 'number') add(`${pp}.zonePreference.${z}`, 'preferencia de zona ausente');
      if (!Array.isArray(p.positions) || !p.positions.length) add(`${pp}.positions`, 'sin posiciones');
    });
    const pl = t.plan; if (!pl) { add(`${tp}.plan`, 'plan ausente'); return; }
    for (const k of tables.styleKeys) { const v = pl.styles?.[k]; if (!Number.isInteger(v) || v < 1 || v > 5) add(`${tp}.plan.styles.${k}`, 'nivel entero 1–5'); }
    for (const k of tables.defStyleKeys) { const v = pl.defStyles?.[k]; if (!Number.isInteger(v) || v < 1 || v > 5) add(`${tp}.plan.defStyles.${k}`, 'nivel entero 1–5'); }
    if (!tables.dispositions[pl.disposition]) add(`${tp}.plan.disposition`, `disposición ${pl.disposition} desconocida`);
    if (!tables.organizations[pl.defense]) add(`${tp}.plan.defense`, `organización ${pl.defense} desconocida`);
    if (!tables.coverages[pl.coverage]) add(`${tp}.plan.coverage`, `cobertura ${pl.coverage} desconocida`);
    if (!tables.heights.includes(pl.pressureHeight)) add(`${tp}.plan.pressureHeight`, `altura ${pl.pressureHeight} desconocida`);
    if (!tables.midrangePolicies.includes(pl.midrange)) add(`${tp}.plan.midrange`, 'política de media distancia desconocida');
    if (!Array.isArray(pl.playbook) || !pl.playbook.length) add(`${tp}.plan.playbook`, 'libro vacío');
    else for (const [i, e] of pl.playbook.entries()) { if (!tables.plays[e.playId]) add(`${tp}.plan.playbook[${i}]`, `ficha ${e.playId} desconocida`); if (!Number.isInteger(e.priority) || e.priority < 1 || e.priority > 5) add(`${tp}.plan.playbook[${i}].priority`, 'prioridad entera 1–5'); }
    for (const s of tables.slots) { const id = pl.starters?.[s]; if (!id || !ids.has(id)) add(`${tp}.plan.starters.${s}`, 'titular ausente o ajeno al equipo'); }
    if (new Set(Object.values(pl.starters ?? {})).size !== 5) add(`${tp}.plan.starters`, 'los cinco titulares deben ser distintos');
    for (const s of tables.slots) { const st = t.players.find((p) => p.id === pl.starters?.[s]); if (st && st.state?.available === false) add(`${tp}.plan.starters.${s}`, 'el titular figura como no disponible'); }
    if (t.players.filter((p) => p.state?.available !== false).length < 5) add(`${tp}.players`, 'menos de cinco jugadores disponibles');
    if (pl.coach?.policy && !tables.coachPolicies[pl.coach.policy]) add(`${tp}.plan.coach.policy`, `política ${pl.coach.policy} desconocida`);
    if (pl.defense === 'ORG06' && !pl.target) { /* el box and one pierde su objetivo → alternativa efectiva; se declara abajo */ }
  });
  return errs;
}

// Vista normalizada (copia profunda): nada del original se modifica. Los jugadores añaden campos de ejecución mínimos.
export function normalizeInput(input, sp, tables) {
  const errs = validateSimInput(input, sp, tables);
  if (errs.length) { const e = new Error(`Entrada SIM no válida: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
  const norm = { schema: input.schema, seed: input.seed, importance: input.importance ?? 'ordinary', teams: [] };
  const ignored = new Set();
  for (const t of input.teams) {
    const plan = deep(t.plan);
    for (const k of PLAN_IGNORED) if (plan[k] != null && !(Array.isArray(plan[k]) && !plan[k].length)) ignored.add(`plan.${k}`);
    norm.teams.push({ id: t.id, name: t.name ?? t.id, plan, players: t.players.map((p) => ({ ...p, positions: p.positions, zonePreference: p.zonePreference, state: { ...p.state } })), sourceTeam: t.source?.teamId ?? t.source?.instance?.of ?? t.id });
  }
  norm.ignored = [...ignored].sort();
  norm.fingerprint = fpOf([{ path: 'i', value: JSON.stringify({ s: norm.seed, i: norm.importance, t: norm.teams.map((t) => [t.id, t.players.map((p) => [p.id, p.abilities, p.state, p.age, p.initiative, p.finishingVocation, p.zonePreference, p.positions, p.knowledge ?? null]), t.plan]) }) }]);
  return norm;
}
