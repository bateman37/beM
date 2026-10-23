// Adaptador explícito de entrada (SIM-MOTOR-01 §4.1): lee la entrada del detallado (beM-match-input/6 o /7) SIN modificarla, valida solo lo que SIM consume y devuelve una vista normalizada.
// Los errores son localizados (ruta + mensaje); lo que SIM no representa se declara en `ignored` (no se descarta en silencio).
import { fpOf } from './profile.js';
import { fpCanonical, canonical, fpString } from './fp.js';

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
      const fin = (v) => typeof v === 'number' && Number.isFinite(v);
      const e = p.state?.energy; if (!fin(e) || e < 0 || e > 100) add(`${pp}.state.energy`, 'energía inicial finita entre 0 y 100');
      if (p.state?.form != null && (!fin(p.state.form) || p.state.form < -1 || p.state.form > 1)) add(`${pp}.state.form`, 'forma finita entre -1 y 1');
      for (const k of ['M_TIR', 'M_OFE', 'M_DEF']) if (p.state?.[k] != null && (!fin(p.state[k]) || p.state[k] < -1 || p.state[k] > 1)) add(`${pp}.state.${k}`, 'momento finito entre -1 y 1');
      if (p.state?.available != null && typeof p.state.available !== 'boolean') add(`${pp}.state.available`, 'disponibilidad booleana');
      if (p.age != null && (!fin(p.age) || p.age < 10 || p.age > 60)) add(`${pp}.age`, 'edad finita entre 10 y 60');
      if (!fin(p.heightCm) || p.heightCm < 120 || p.heightCm > 250) add(`${pp}.heightCm`, 'estatura finita (120–250 cm)');
      if (!fin(p.wingspanCm) || p.wingspanCm < 120 || p.wingspanCm > 270) add(`${pp}.wingspanCm`, 'envergadura finita (120–270 cm)');
      for (const k of ['initiative', 'finishingVocation']) if (!fin(p[k]) || p[k] < 0 || p[k] > 1) add(`${pp}.${k}`, 'valor finito entre 0 y 1');
      for (const z of ['rim', 'midrange', 'three']) if (!fin(p.zonePreference?.[z]) || p.zonePreference[z] < 0) add(`${pp}.zonePreference.${z}`, 'preferencia de zona ausente o no finita');
      if (p.offensiveRole?.code != null && !tables.offensiveRoles?.[p.offensiveRole.code]) add(`${pp}.offensiveRole.code`, `rol ofensivo ${p.offensiveRole.code} desconocido`);
      if (p.defensiveRole?.code != null && !tables.defensiveRoles?.[p.defensiveRole.code]) add(`${pp}.defensiveRole.code`, `rol defensivo ${p.defensiveRole.code} desconocido`);
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
    if (pl.directorPriority != null && (!Array.isArray(pl.directorPriority) || pl.directorPriority.some((id) => !ids.has(id)))) add(`${tp}.plan.directorPriority`, 'prioridad de director con identificadores ajenos al equipo');
    for (const [i, pr] of (pl.participation?.pairs ?? []).entries()) { if (!ids.has(pr.starter) || !ids.has(pr.relief) || !tables.slots.includes(pr.slot) || !Number.isFinite(pr.starterMinutes)) add(`${tp}.plan.participation.pairs[${i}]`, 'pareja titular/relevo no válida'); }
    if (pl.initialTeamMoment != null && (!Number.isFinite(pl.initialTeamMoment) || Math.abs(pl.initialTeamMoment) > 1)) add(`${tp}.plan.initialTeamMoment`, 'momento colectivo inicial finito entre -1 y 1');
  });
  // órdenes programadas en la entrada: se validan por completo antes de crear estado alguno
  (input.orders ?? []).forEach((o, i) => { for (const e of validateOrder(o, input.teams.map((t) => t.id), tables)) add(`orders[${i}]${e.path ? `.${e.path}` : ''}`, e.message); });
  return errs;
}

export const ORDER_KEYS = ['styles', 'disposition', 'defense', 'coverage', 'pressureHeight', 'defStyles', 'playbook', 'midrange'];
// Validación completa de una orden (equipo, instante y cambio de plan) SIN mutar nada: una orden rechazada no deja rastro.
export function validateOrder(o, teamIds, tables) {
  const errs = []; const add = (path, message) => errs.push({ path, message });
  if (!o || typeof o !== 'object') { add('', 'orden ausente'); return errs; }
  const ti = typeof o.team === 'number' ? o.team : teamIds.indexOf(o.team);
  if (!Number.isInteger(ti) || ti < 0 || ti >= teamIds.length) add('team', `equipo inexistente: ${o.team}`);
  if (!Number.isFinite(o.at) || o.at < 0) add('at', 'instante no válido (segundos de juego finitos y no negativos)');
  const pl = o.plan; if (!pl || typeof pl !== 'object' || Array.isArray(pl) || !Object.keys(pl).length) { add('plan', 'cambio de plan ausente o vacío'); return errs; }
  for (const k of Object.keys(pl)) if (!ORDER_KEYS.includes(k)) add(`plan.${k}`, `la orden SIM solo admite cambios de ${ORDER_KEYS.join(', ')} (no ${k})`);
  const lv = (obj, keys, path) => { if (obj == null || typeof obj !== 'object') { add(path, 'se esperaba un objeto de niveles'); return; } for (const k of Object.keys(obj)) { if (!keys.includes(k)) add(`${path}.${k}`, 'estilo desconocido'); else if (!Number.isInteger(obj[k]) || obj[k] < 1 || obj[k] > 5) add(`${path}.${k}`, 'nivel entero 1–5'); } };
  if (pl.styles) lv(pl.styles, tables.styleKeys, 'plan.styles'); if (pl.defStyles) lv(pl.defStyles, tables.defStyleKeys, 'plan.defStyles');
  if (pl.disposition != null && !tables.dispositions[pl.disposition]) add('plan.disposition', `disposición ${pl.disposition} desconocida`);
  if (pl.defense != null && !tables.organizations[pl.defense]) add('plan.defense', `organización ${pl.defense} desconocida`);
  if (pl.coverage != null && !tables.coverages[pl.coverage]) add('plan.coverage', `cobertura ${pl.coverage} desconocida`);
  if (pl.pressureHeight != null && !tables.heights.includes(pl.pressureHeight)) add('plan.pressureHeight', `altura ${pl.pressureHeight} desconocida`);
  if (pl.midrange != null && !tables.midrangePolicies.includes(pl.midrange)) add('plan.midrange', 'política de media distancia desconocida');
  if (pl.playbook != null) { if (!Array.isArray(pl.playbook) || !pl.playbook.length) add('plan.playbook', 'libro vacío'); else pl.playbook.forEach((e, i) => { if (!tables.plays[e?.playId]) add(`plan.playbook[${i}]`, `ficha ${e?.playId} desconocida`); if (!Number.isInteger(e?.priority) || e.priority < 1 || e.priority > 5) add(`plan.playbook[${i}].priority`, 'prioridad entera 1–5'); }); }
  return errs;
}

// Vista normalizada: copia profunda de TODO lo consumible (jugadores, conocimiento, estado y plan). Editar después la entrada, la copia de preparación o el conocimiento no altera un encuentro creado:
// la congelación exige aislar los datos, no conservar una referencia al objeto editable.
export function normalizeInput(input, sp, tables) {
  const errs = validateSimInput(input, sp, tables);
  if (errs.length) { const e = new Error(`Entrada SIM no válida: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
  const norm = { schema: input.schema, seed: input.seed, importance: input.importance ?? 'ordinary', teams: [], orders: deep(input.orders ?? []) };
  const ignored = new Set();
  for (const t of input.teams) {
    const plan = deep(t.plan);
    for (const k of PLAN_IGNORED) if (plan[k] != null && !(Array.isArray(plan[k]) && !plan[k].length)) ignored.add(`plan.${k}`);
    norm.teams.push({ id: t.id, name: t.name ?? t.id, plan, players: t.players.map((p) => deep(p)), sourceTeam: t.source?.teamId ?? t.source?.instance?.of ?? t.id });
  }
  norm.ignored = [...ignored].sort();
  const parts = canonicalInput(norm, sp, tables);
  norm.canonical = parts; const text = canonical(parts); norm.fingerprint = fpString(text); norm.canonicalLength = text.length; // un solo texto canónico (antes se construía dos veces por encuentro)
  return norm;
}

// Representación canónica de la entrada deportiva CONSUMIDA (§3 C02-04): jugadores/instancias, capacidades, cuerpo, tendencias, roles, conocimiento y estados iniciales; planes, prioridades, director,
// política y entrenador; identidades y huellas de perfil y tablas efectivos; semilla, importancia y órdenes programadas. Dos entradas que difieren en cualquiera de esos datos no comparten huella.
export function canonicalInput(norm, sp, tables) {
  return {
    schema: norm.schema, seed: norm.seed, importance: norm.importance, orders: norm.orders,
    profile: { id: sp.id, fp: sp.fingerprint }, tables: { fp: tables.fingerprint },
    teams: norm.teams.map((t) => ({
      id: t.id, plan: t.plan,
      players: t.players.map((p) => ({ id: p.id, abilities: p.abilities, state: p.state, age: p.age ?? null, heightCm: p.heightCm, wingspanCm: p.wingspanCm, initiative: p.initiative, finishingVocation: p.finishingVocation, zonePreference: p.zonePreference, positions: p.positions, offensiveRole: p.offensiveRole?.code ?? null, defensiveRole: p.defensiveRole?.code ?? null, knowledge: p.knowledge ?? null })),
    })),
  };
}
// Huella de la cadena reproducible: entrada raíz + comandos recibidos durante el partido + contexto externo publicado. La entrada raíz NO se renombra cuando llega una orden.
export const chainFingerprint = (rootFp, commands, context) => fpString(`${rootFp}|${fpCanonical(commands)}|${fpCanonical(context)}`);
