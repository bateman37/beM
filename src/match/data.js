// Construcción y validación de la entrada del motor a partir del perfil SEM y las fichas CSV.
// Sin DOM, sin sistema de ficheros: recibe objetos/texto ya leídos.
import { parseCsv } from './csv.js';

export const ATTRS = [
  'TEC01','TEC02','TEC03','TEC04','TEC05','TEC06','TEC07','TEC08','TEC09','TEC10','TEC11','TEC12','TEC13','TEC14','TEC15','TEC16','TEC17','TEC18',
  'FIS01','FIS02','FIS03','FIS04','FIS05','FIS06','FIS07',
  'MEN01','MEN02','MEN03','MEN04','MEN05','MEN06','MEN07',
];
export const SLOTS = ['PG', 'SG', 'SF', 'PF', 'C'];
export const ZONES = ['rim', 'inside', 'midrange', 'three'];
export const ENGINE_VERSION = 'beM-motor-0.1.0-MOTOR01';
export const INPUT_SCHEMA = 'beM-match-input/1';
export const EXPORT_SCHEMA = 'beM-match-export/1';

const num = (v) => Number(v);

export function parsePlayersCsv(text, profile) {
  const { header, rows } = parseCsv(text);
  const cols = profile.fixtureContract.attributeColumns;
  for (const c of cols) if (!header.includes(c)) throw new Error(`CSV: falta la columna ${c}`);
  const init = profile.fixtureContract.initialState;
  const offDict = profile.fixtureContract.offensiveRoleDictionary;
  const defDict = profile.fixtureContract.defensiveRoleDictionary;
  return rows.map((r) => {
    const abilities = {};
    for (const c of cols) abilities[c] = num(r[c]);
    return {
      id: r.id,
      teamId: r.id.split('-')[0],
      name: `Jugador ${r.id}`,
      age: num(r.age),
      heightCm: num(r.heightCm),
      wingspanCm: num(r.wingspanCm),
      weightKg: num(r.weightKg),
      positions: r.positions.split('|'),
      offensiveRole: { code: r.offensiveRoleCode, name: offDict[r.offensiveRoleCode] ?? null },
      defensiveRole: { code: r.defensiveRoleCode, name: defDict[r.defensiveRoleCode] ?? null },
      initiative: num(r.initiative),
      finishingVocation: num(r.finishingVocation),
      zonePreference: { rim: num(r.rimPreference), midrange: num(r.midrangePreference), three: num(r.threePreference) },
      abilities,
      state: { ...init },
    };
  });
}

export function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

// Entrada de encuentro para los dos equipos del escenario del perfil.
export function buildMatchInput(profile, allPlayers, { seed } = {}) {
  const plans = profile.scenario.plans;
  const teams = plans.map((plan) => ({
    id: plan.teamId,
    name: profile.fixtureContract.teamNames[plan.teamId],
    players: allPlayers.filter((p) => p.teamId === plan.teamId).map(deepCopy),
    plan: deepCopy(plan),
  }));
  return {
    schema: INPUT_SCHEMA,
    seed: seed ?? profile.scenario.seed,
    teams,
  };
}

// Devuelve una lista de { path, message }. Vacía = válida. No corrige ni completa nada.
export function validateInput(input, profile) {
  const errs = [];
  const add = (path, message) => errs.push({ path, message });
  if (!input || typeof input !== 'object') { add('input', 'entrada ausente'); return errs; }
  if (!Number.isInteger(input.seed) || input.seed < 0 || input.seed > 4294967295) add('seed', 'la semilla debe ser un entero entre 0 y 4294967295');
  if (!Array.isArray(input.teams) || input.teams.length !== 2) { add('teams', 'se necesitan exactamente dos equipos'); return errs; }
  const [lo, hi] = profile.abilityBounds;
  const styleKeys = Object.keys(profile.scenario.plans[0].styles);
  const playIds = profile.activeCatalog.plays;
  input.teams.forEach((t, ti) => {
    const tp = `teams[${ti}](${t.id})`;
    if (!Array.isArray(t.players) || t.players.length !== 12) { add(`${tp}.players`, 'cada equipo necesita doce jugadores'); return; }
    const ids = new Set();
    t.players.forEach((p, pi) => {
      const pp = `${tp}.players[${pi}](${p.id})`;
      if (ids.has(p.id)) add(`${pp}.id`, 'identificador duplicado');
      ids.add(p.id);
      for (const k of ATTRS) {
        const v = p.abilities?.[k];
        if (typeof v !== 'number' || !Number.isFinite(v)) add(`${pp}.abilities.${k}`, 'falta la capacidad o no es numérica');
        else if (v < lo || v > hi) add(`${pp}.abilities.${k}`, `fuera de rango ${lo}-${hi} (valor ${v})`);
      }
      const e = p.state?.energy;
      if (typeof e !== 'number' || !Number.isFinite(e) || e < 0 || e > 100) add(`${pp}.state.energy`, 'la energía inicial debe estar entre 0 y 100');
      if (!Array.isArray(p.positions) || p.positions.length === 0) add(`${pp}.positions`, 'sin posiciones');
      for (const f of ['heightCm', 'wingspanCm', 'weightKg', 'initiative', 'finishingVocation']) {
        if (typeof p[f] !== 'number' || !Number.isFinite(p[f])) add(`${pp}.${f}`, 'valor ausente o no numérico');
      }
      if (typeof p.initiative === 'number' && (p.initiative < 0 || p.initiative > 1)) add(`${pp}.initiative`, 'iniciativa fuera de 0-1');
      if (typeof p.finishingVocation === 'number' && (p.finishingVocation < 0 || p.finishingVocation > 1)) add(`${pp}.finishingVocation`, 'vocación de finalización fuera de 0-1');
      for (const z of ['rim', 'midrange', 'three']) {
        const v = p.zonePreference?.[z];
        if (typeof v !== 'number' || v < 0) add(`${pp}.zonePreference.${z}`, 'preferencia de zona ausente o negativa');
      }
    });
    const plan = t.plan;
    if (!plan) { add(`${tp}.plan`, 'plan ausente'); return; }
    for (const k of styleKeys) {
      const v = plan.styles?.[k];
      if (!Number.isInteger(v) || v < 1 || v > 5) add(`${tp}.plan.styles.${k}`, 'los estilos son enteros 1-5');
    }
    const startersSeen = new Set();
    for (const s of SLOTS) {
      const id = plan.starters?.[s];
      if (!id) add(`${tp}.plan.starters.${s}`, 'falta titular para la posición');
      else if (!ids.has(id)) add(`${tp}.plan.starters.${s}`, `el jugador ${id} no pertenece al equipo`);
      else if (startersSeen.has(id)) add(`${tp}.plan.starters.${s}`, `el jugador ${id} ocupa dos posiciones`);
      else startersSeen.add(id);
    }
    if (!Array.isArray(plan.directorPriority) || plan.directorPriority.length === 0) add(`${tp}.plan.directorPriority`, 'lista de directores vacía');
    else plan.directorPriority.forEach((id, i) => { if (!ids.has(id)) add(`${tp}.plan.directorPriority[${i}]`, `el jugador ${id} no pertenece al equipo`); });
    const seen = new Set();
    (plan.playbook ?? []).forEach((b, i) => {
      if (!playIds.includes(b.playId)) add(`${tp}.plan.playbook[${i}].playId`, `ficha ${b.playId} no activa en MOTOR-01`);
      if (seen.has(b.playId)) add(`${tp}.plan.playbook[${i}].playId`, `ficha ${b.playId} repetida`);
      seen.add(b.playId);
      if (!Number.isInteger(b.priority) || b.priority < 1 || b.priority > 5) add(`${tp}.plan.playbook[${i}].priority`, 'la prioridad es un entero 1-5');
    });
    for (const id of playIds) if (!seen.has(id)) add(`${tp}.plan.playbook`, `falta la ficha ${id}`);
    for (const f of ['disposition', 'defense', 'coverage']) {
      if (!plan[f]) add(`${tp}.plan.${f}`, 'falta');
    }
    if (plan.disposition !== 'DIS02') add(`${tp}.plan.disposition`, 'solo DIS02 está activa en MOTOR-01');
    if (plan.defense !== 'ORG01') add(`${tp}.plan.defense`, 'solo ORG01 está activa en MOTOR-01');
    if (plan.coverage !== 'COB01') add(`${tp}.plan.coverage`, 'solo COB01 está activa en MOTOR-01');
  });
  if (input.teams[0].id === input.teams[1].id) add('teams', 'los dos equipos no pueden ser el mismo');
  return errs;
}

// Validación del perfil y de las 144 fichas (comprobación de datos, §10.1 del encargo).
export function validateProfileAndFixtures(profile, allPlayers) {
  const errs = [];
  const add = (path, message) => errs.push({ path, message });
  if (profile.attributeOrder.length !== 32 || new Set(profile.attributeOrder).size !== 32) add('attributeOrder', 'deben ser 32 capacidades distintas');
  if (JSON.stringify(profile.attributeOrder) !== JSON.stringify(ATTRS)) add('attributeOrder', 'orden de capacidades distinto del esperado');
  if (JSON.stringify(profile.fixtureContract.attributeColumns) !== JSON.stringify(profile.attributeOrder)) add('fixtureContract.attributeColumns', 'no coincide con attributeOrder');
  const sum = (o) => Object.values(o).reduce((s, v) => s + v, 0);
  const near1 = (v) => Math.abs(v - 1) < 1e-9;
  const checkRecipe = (path, terms) => {
    if (!terms.length) return;
    const w = terms.reduce((s, t) => s + t[2], 0);
    if (!near1(w)) add(path, `los pesos suman ${w}, no 1`);
    for (const t of terms) if (!profile.attributeOrder.includes(t[1])) add(path, `capacidad desconocida ${t[1]}`);
  };
  for (const [k, t] of Object.entries(profile.tasks)) { checkRecipe(`tasks.${k}.attack`, t.attack); checkRecipe(`tasks.${k}.defense`, t.defense); }
  for (const p of profile.plays) {
    checkRecipe(`plays.${p.id}.qualityAttack`, p.qualityAttack);
    checkRecipe(`plays.${p.id}.qualityDefense`, p.qualityDefense);
    if (sum(p.shotWeights) <= 0) add(`plays.${p.id}.shotWeights`, 'suma no positiva');
  }
  for (const [k, s] of Object.entries(profile.shots)) {
    if (s.points !== undefined && !near1(sum(s.attack))) add(`shots.${k}.attack`, 'pesos no suman 1');
    if (Object.keys(s.defense).length && !near1(sum(s.defense))) add(`shots.${k}.defense`, 'pesos no suman 1');
  }
  if (!near1(sum(profile.outcomes.base))) add('outcomes.base', `suman ${sum(profile.outcomes.base)}, no 1`);
  if (!near1(sum(profile.rebound.strength))) add('rebound.strength', 'pesos no suman 1');
  if (!near1(sum(profile.rebound.captor))) add('rebound.captor', 'pesos no suman 1');
  if (!near1(sum(profile.block.attack))) add('block.attack', 'pesos no suman 1');
  for (const [slot, w] of Object.entries(profile.rotation.slotAbilityWeights)) if (!near1(sum(w))) add(`rotation.slotAbilityWeights.${slot}`, 'pesos no suman 1');
  // 144 fichas, IDs únicos, 12 por equipo, rangos
  const ids = new Set(allPlayers.map((p) => p.id));
  if (allPlayers.length !== 144) add('players', `hay ${allPlayers.length} fichas, se esperaban 144`);
  if (ids.size !== allPlayers.length) add('players', 'identificadores duplicados');
  const perTeam = {};
  for (const p of allPlayers) perTeam[p.teamId] = (perTeam[p.teamId] ?? 0) + 1;
  for (const id of Object.keys(profile.fixtureContract.teamNames)) if (perTeam[id] !== 12) add(`players.${id}`, `${perTeam[id] ?? 0} plazas, se esperaban 12`);
  const [lo, hi] = profile.abilityBounds;
  for (const p of allPlayers) {
    for (const k of ATTRS) { const v = p.abilities[k]; if (!Number.isFinite(v) || v < lo || v > hi) add(`players.${p.id}.${k}`, `valor ${v} fuera de ${lo}-${hi}`); }
    if (!profile.fixtureContract.offensiveRoleDictionary[p.offensiveRole.code]) add(`players.${p.id}.offensiveRole`, `rol ${p.offensiveRole.code} sin definición`);
    if (!profile.fixtureContract.defensiveRoleDictionary[p.defensiveRole.code]) add(`players.${p.id}.defensiveRole`, `rol ${p.defensiveRole.code} sin definición`);
  }
  // referencias de los dos escenarios activos
  for (const plan of profile.scenario.plans) {
    const mine = allPlayers.filter((p) => p.teamId === plan.teamId);
    const mids = new Set(mine.map((p) => p.id));
    for (const [s, id] of Object.entries(plan.starters)) if (!mids.has(id)) add(`scenario.${plan.teamId}.starters.${s}`, `${id} no existe`);
    for (const id of plan.directorPriority) if (!mids.has(id)) add(`scenario.${plan.teamId}.directorPriority`, `${id} no existe`);
  }
  return errs;
}
