// Construcción y validación de la entrada del motor a partir del perfil SEM y las fichas CSV.
// Sin DOM, sin sistema de ficheros: recibe objetos/texto ya leídos.
import { parseCsv } from './csv.js';
import { validateParticipation, defaultParticipationPlan } from './coach-policy.js';
import { validateKnowledgeBlock, isLegacyNeutral } from '../knowledge/model.js';

export const ATTRS = [
  'TEC01','TEC02','TEC03','TEC04','TEC05','TEC06','TEC07','TEC08','TEC09','TEC10','TEC11','TEC12','TEC13','TEC14','TEC15','TEC16','TEC17','TEC18',
  'FIS01','FIS02','FIS03','FIS04','FIS05','FIS06','FIS07',
  'MEN01','MEN02','MEN03','MEN04','MEN05','MEN06','MEN07',
];
export const SLOTS = ['PG', 'SG', 'SF', 'PF', 'C'];
export const ZONES = ['rim', 'inside', 'midrange', 'three'];
// MOTOR-15: el motor deportivo cambia de identidad porque cambian sorteos y finales (liberación/resolución del tiro, interferencia condicionada, administración de incidencias y correcciones). Antes era 0.9.0-MOTOR09 desde MOTOR-09.
// MOTOR-15B: cambio normativo acotado (RG-I03 administra la técnica de categoría 2 del último libre; numeración del art. 45). Anterior: beM-motor-0.15.0-MOTOR15. Ningún coeficiente cambia.
export const ENGINE_VERSION = 'beM-motor-0.18.0-MOTOR18';
export const INPUT_SCHEMA = 'beM-match-input/7'; // MOTOR-18: conocimiento por jugador y datos de aprendizaje; una entrada /6 se lee (legacy-neutral) sin conocimiento
export const INPUT_SCHEMA_MOTOR17B = 'beM-match-input/6';
export const EXPORT_SCHEMA = 'beM-match-export/10';
export const EXPORT_SCHEMA_MOTOR17B = 'beM-match-export/9';
export const EXPORT_SCHEMA_MOTOR14 = 'beM-match-export/8';
export const EXPORT_SCHEMA_MOTOR08 = 'beM-match-export/7';
export const EXPORT_SCHEMA_MOTOR07 = 'beM-match-export/6';
export const EXPORT_SCHEMA_MOTOR06 = 'beM-match-export/5';
export const EXPORT_SCHEMA_MOTOR05 = 'beM-match-export/4';
export const EXPORT_SCHEMA_MOTOR04 = 'beM-match-export/3';
export const EXPORT_SCHEMA_MOTOR02 = 'beM-match-export/2';
export const MIDRANGE_POLICIES = ['avoid', 'openOnly', 'seek'];
export const EXPORT_SCHEMA_MOTOR01 = 'beM-match-export/1';

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

// Perfil efectivo = perfil SEM de MOTOR-01 (sin tocar) + extensiones SEM referenciadas por su identidad, en orden.
// El original no se sobrescribe: cada extensión queda listada en `extensions`. La de MOTOR-02 cuelga de `motor02`;
// la de MOTOR-03 aporta filas nuevas (`additions`, por ruta con puntos) que antes eran literales del código.
export function applyExtension(profile, ...exts) {
  const eff = deepCopy(profile);
  eff.extensions = [];
  const ids = [profile.id];
  for (const ext of exts) {
    const problems = validateExtension(profile, ext, eff); // los reemplazos se comprueban contra el perfil ya extendido por las anteriores
    if (problems.length) throw new Error(`Extensión de perfil no válida: ${problems.join('; ')}`);
    eff.extensions.push({ id: ext.seedExtensionId, status: ext.status, basedOn: ext.basedOn });
    ids.push(ext.seedExtensionId);
    const replaced = [];
    if (ext.replacements) {
      // Sustituciones EXPLÍCITAS y trazables (MOTOR-04): el campo debe existir; el valor anterior queda registrado en la identidad.
      for (const [path, value] of Object.entries(ext.replacements)) {
        const keys = path.split('.');
        let o = eff;
        for (const k of keys.slice(0, -1)) o = o[k];
        const last = keys[keys.length - 1];
        replaced.push({ path, before: deepCopy(o[last]), note: ext.replacementNotes?.[path] ?? null });
        o[last] = deepCopy(value);
      }
      eff.extensions[eff.extensions.length - 1].replaced = replaced;
    }
    if (ext.additions) {
      for (const [path, value] of Object.entries(ext.additions)) {
        const keys = path.split('.');
        let o = eff;
        for (const k of keys.slice(0, -1)) { if (!o[k] || typeof o[k] !== 'object') throw new Error(`Extensión ${ext.seedExtensionId}: no existe ${k} en ${path}`); o = o[k]; }
        const last = keys[keys.length - 1];
        if (last in o) throw new Error(`Extensión ${ext.seedExtensionId}: ${path} ya existe en el perfil base; no se sobrescribe`);
        o[last] = deepCopy(value);
      }
    } else eff.motor02 = deepCopy(ext);
  }
  eff.effectiveId = ids.join('+');
  return eff;
}
export function validateExtension(profile, ext, effective = profile) {
  const out = [];
  if (!ext || typeof ext !== 'object') return ['extensión ausente'];
  if (ext.basedOn !== profile.id) out.push(`la extensión se basa en ${ext.basedOn}, no en ${profile.id}`);
  if (ext.additions) {
    if (!ext.additions || typeof ext.additions !== 'object' || !Object.keys(ext.additions).length) out.push('additions vacías');
    for (const path of Object.keys(ext.replacements ?? {})) {
      let o = effective;
      for (const k of path.split('.')) { if (o == null || typeof o !== 'object' || !(k in o)) { out.push(`replacements: no existe ${path}`); o = undefined; break; } o = o[k]; }
    }
    return out;
  }
  if (!(ext.timeOutRecoveryEnergyPoints >= 0)) out.push('timeOutRecoveryEnergyPoints');
  const t = ext.timeOuts;
  if (!t) out.push('falta timeOuts');
  else for (const k of ['durationSeconds', 'firstHalf', 'secondHalf', 'perOvertime', 'finalWindowSeconds', 'maxInFinalWindow']) if (!Number.isInteger(t[k]) || t[k] < 0) out.push(`timeOuts.${k}`);
  return out;
}

// Entrada de encuentro para los dos equipos del escenario del perfil.
export function buildMatchInput(profile, allPlayers, { seed, importance } = {}) {
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
    importance: importance ?? 'ordinary', // MOTOR-07: importancia del encuentro (entrada visible; no cambia por un resultado parcial)
    teams,
  };
}

// Defensa del plan (MOTOR-05): organización, cobertura, altura, cinco estilos, marcas, objetivo y especiales persistentes.
// Una configuración conjunta irrealizable se rechaza entera con su motivo; nada se corrige en silencio.
export const DEFENSE_STYLE_KEYS = ['help', 'pressure', 'receivers', 'steal', 'protection'];
export function validateDefensePlan(plan, team, rival, profile, tp, add) {
  const cat = profile.activeCatalog; const rep = profile.defenseRepertoire;
  if (!(cat.defenses ?? []).includes(plan.defense)) add(`${tp}.plan.defense`, `organización ${plan.defense} fuera del catálogo activo`);
  if (!(cat.coverage ?? []).includes(plan.coverage)) add(`${tp}.plan.coverage`, `cobertura ${plan.coverage} fuera del catálogo activo`);
  if (!(cat.pressureHeights ?? []).includes(plan.pressureHeight)) add(`${tp}.plan.pressureHeight`, `altura de presión ${plan.pressureHeight} fuera del catálogo activo`);
  for (const k of DEFENSE_STYLE_KEYS) { const v = plan.defStyles?.[k]; if (!Number.isInteger(v) || v < 1 || v > 5) add(`${tp}.plan.defStyles.${k}`, 'los estilos defensivos son enteros 1-5'); }
  const nav = plan.navigation ?? null;
  if (nav !== null && !(rep.coverages[plan.coverage]?.navigation ?? []).includes(nav)) add(`${tp}.plan.navigation`, `la navegación «${nav}» no es compatible con ${plan.coverage}`);
  const mine = new Set(team.players.map((p) => p.id)); const theirs = new Set(rival.players.map((p) => p.id));
  const fns = Object.keys(rep.attackerFunctions);
  if (!Array.isArray(plan.marks)) add(`${tp}.plan.marks`, 'las marcas son una lista');
  else {
    const ds = new Set(); const as = new Set();
    plan.marks.forEach((m, i) => {
      if (!mine.has(m.defender)) add(`${tp}.plan.marks[${i}].defender`, `el defensor ${m.defender} no pertenece al equipo`);
      if (!(theirs.has(m.attacker) || (!m.attacker && fns.includes(m.fn)))) add(`${tp}.plan.marks[${i}]`, 'la marca necesita un atacante rival o una función ofensiva conocida');
      if (!['game', 'period'].includes(m.scope ?? 'game')) add(`${tp}.plan.marks[${i}].scope`, 'ámbito: game o period');
      if (ds.has(m.defender)) add(`${tp}.plan.marks[${i}].defender`, `${m.defender} ya tiene otra marca`);
      const key = m.attacker ?? m.fn; if (as.has(key)) add(`${tp}.plan.marks[${i}]`, `${key} ya está marcado por otra marca`);
      ds.add(m.defender); as.add(key);
    });
  }
  const org = rep.organizations[plan.defense];
  if (org?.kind === 'boxAndOne') {
    if (!theirs.has(plan.target)) add(`${tp}.plan.target`, 'box and one necesita un objetivo rival designado');
    if (plan.targetAlt != null && (!theirs.has(plan.targetAlt) || plan.targetAlt === plan.target)) add(`${tp}.plan.targetAlt`, 'la alternativa individual debe ser otro jugador rival');
    if (!(cat.defenses ?? []).includes(plan.fallbackOrg) || rep.organizations[plan.fallbackOrg]?.kind === 'boxAndOne') add(`${tp}.plan.fallbackOrg`, 'la alternativa debe ser otra organización admitida y realizable');
  } else {
    if (plan.target != null && !theirs.has(plan.target)) add(`${tp}.plan.target`, 'objetivo no válido');
  }
  const seenSp = new Set();
  (plan.specials ?? []).forEach((sp, i) => {
    const sp0 = `${tp}.plan.specials[${i}]`;
    if (!['ESPD02', 'ESPD03'].includes(sp.id)) add(`${sp0}.id`, 'solo ESPD02 y ESPD03 son instrucciones persistentes del plan (ESPD01 es una orden puntual)');
    if (seenSp.has(sp.id)) add(`${sp0}.id`, `${sp.id} repetida`); seenSp.add(sp.id);
    if (sp.id === 'ESPD02') {
      if (!theirs.has(sp.principal)) add(`${sp0}.principal`, 'doble: falta el jugador principal rival');
      if (sp.alternate != null && (!theirs.has(sp.alternate) || sp.alternate === sp.principal)) add(`${sp0}.alternate`, 'la alternativa individual debe ser otro rival');
      if (!['reception', 'firstDribble'].includes(sp.activation)) add(`${sp0}.activation`, 'activación: recepción o primer bote');
      for (const k of ['executor', 'executorAlt']) if (sp[k] != null && !mine.has(sp[k])) add(`${sp0}.${k}`, 'el ejecutor debe ser del equipo');
    }
    if (sp.id === 'ESPD03' && !theirs.has(sp.protected)) add(`${sp0}.protected`, 'no abandonar: falta el tirador rival protegido');
  });
  // conjunto: el ejecutor preferido de la doble no puede ser el defensor marcado sobre el tirador protegido
  const d2 = (plan.specials ?? []).find((x) => x.id === 'ESPD02'); const d3 = (plan.specials ?? []).find((x) => x.id === 'ESPD03');
  if (d2 && d3) {
    const execs = [d2.executor, d2.executorAlt].filter(Boolean);
    const bad = execs.length && execs.every((e) => (plan.marks ?? []).some((m) => m.attacker === d3.protected && m.defender === e));
    if (bad) add(`${tp}.plan.specials`, `conjunto irrealizable: ${execs.join(', ')} está marcado sobre ${d3.protected}, a quien no se puede abandonar`);
  }
}

// Libro, sacadores y respuesta defensiva de saque del plan (MOTOR-06). Una configuración imposible se rechaza entera con su motivo.
export function validateThrowPlan(plan, team, rival, profile, tp, add) {
  const cat = profile.activeCatalog; const rep = profile.throwInRepertoire;
  const mine = new Set(team.players.map((p) => p.id)); const theirs = new Set(rival.players.map((p) => p.id));
  if (!Array.isArray(plan.throwInBook)) add(`${tp}.plan.throwInBook`, 'el libro de saques es una lista (vacía si no se prepara ninguna ficha)');
  else {
    const seen = new Set();
    plan.throwInBook.forEach((b, i) => {
      if (!(cat.throwInPlays ?? []).includes(b.playId)) add(`${tp}.plan.throwInBook[${i}].playId`, `ficha de saque ${b.playId} fuera del catálogo activo`);
      if (seen.has(b.playId)) add(`${tp}.plan.throwInBook[${i}].playId`, `ficha de saque ${b.playId} repetida`);
      seen.add(b.playId);
      if (!Number.isInteger(b.priority) || b.priority < 1 || b.priority > 5) add(`${tp}.plan.throwInBook[${i}].priority`, 'la prioridad es un entero 1-5 (compartida por banda y fondo)');
    });
  }
  const sv = plan.throwInServers;
  if (!sv || typeof sv !== 'object') add(`${tp}.plan.throwInServers`, 'faltan los sacadores (preferido y alternativa) de banda y fondo');
  else for (const k of ['band', 'endline']) {
    const c = sv[k];
    if (!c || typeof c !== 'object') { add(`${tp}.plan.throwInServers.${k}`, 'falta la configuración del sacador'); continue; }
    for (const f of ['preferred', 'alternate']) if (c[f] != null && !mine.has(c[f])) add(`${tp}.plan.throwInServers.${k}.${f}`, `el jugador ${c[f]} no pertenece al equipo`);
    if (c.preferred != null && c.preferred === c.alternate) add(`${tp}.plan.throwInServers.${k}`, 'el sacador preferido y su alternativa deben ser distintos');
  }
  const df = plan.throwInDefense;
  if (!df || typeof df !== 'object') { add(`${tp}.plan.throwInDefense`, 'falta la respuesta defensiva de saque de banda y de fondo'); return; }
  for (const k of ['band', 'endline']) {
    const r = rep.responses[df[k]];
    if (!(cat.throwInResponses ?? []).includes(df[k]) || !r) add(`${tp}.plan.throwInDefense.${k}`, `respuesta ${df[k]} fuera del catálogo activo`);
    else if (r.kind !== k) add(`${tp}.plan.throwInDefense.${k}`, `${df[k]} es una respuesta de ${rep.kinds[r.kind].label.toLowerCase()}, no de ${rep.kinds[k].label.toLowerCase()}`);
    else if (r.chaseOrSwitch && !['COB01', 'COB02'].includes(plan.coverage)) add(`${tp}.plan.throwInDefense.${k}`, `${df[k]} necesita persecución o cambio y la cobertura declarada (${plan.coverage}) no es compatible`);
  }
  if (df.target != null && !theirs.has(df.target)) add(`${tp}.plan.throwInDefense.target`, 'el objetivo de saque debe ser un jugador rival');
  if (df.endline === 'DSaqF02' && df.target == null) add(`${tp}.plan.throwInDefense.target`, 'DSaqF02 necesita un objetivo rival designado (visible); sin él no se puede negar');
}

// MOTOR-18: conocimiento por jugador (KNOW-MOTOR18-R1), Polivalencia y datos de enseñanza del entrenador. Un bloque `legacy-neutral` o ausente es válido (efecto cero); un bloque `explicit` incompleto o inválido es un
// error localizado y NUNCA se rellena con dominio 30 en silencio. Si hay conocimiento explícito y el perfil no incluye `familiarity`, se declara (no se ignora en silencio).
function validateLearningData(t, tp, profile, add) {
  const fam = profile.familiarity ?? null; const [lo, hi] = fam?.learning?.traits?.range ? [fam.learning.traits.range.min, fam.learning.traits.range.max] : [1, 30];
  t.players.forEach((p, pi) => {
    const pp = `${tp}.players[${pi}](${p.id})`;
    if (p.development?.tacticalLearning !== undefined) { const v = p.development.tacticalLearning; if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) add(`${pp}.development.tacticalLearning`, `Polivalencia · aprendizaje táctico: número entre ${lo} y ${hi}`); }
    if (p.knowledge === undefined || p.knowledge === null || isLegacyNeutral(p.knowledge)) return;
    if (!fam) { add(`${pp}.knowledge`, 'el perfil activo no incluye la familiaridad táctica de MOTOR-18: el conocimiento explícito no se ignora en silencio (active la base de MOTOR-18 o quite el bloque)'); return; }
    for (const e of validateKnowledgeBlock(p.knowledge, fam)) add(`${pp}.${e.path || 'knowledge'}`, e.message);
  });
  const cl = t.coachLearning;
  if (cl !== undefined && cl !== null) {
    if (typeof cl.teaching !== 'number' || cl.teaching < lo || cl.teaching > hi) add(`${tp}.coachLearning.teaching`, `capacidad de enseñanza: número entre ${lo} y ${hi}`);
    if (fam) for (const m of fam.catalog.modules) { const v = cl.tacticalMastery?.[m.id]; if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) add(`${tp}.coachLearning.tacticalMastery.${m.id}`, `competencia del entrenador en ${m.id}: número entre ${lo} y ${hi}`); }
  }
}

// Devuelve una lista de { path, message }. Vacía = válida. No corrige ni completa nada.
export function validateInput(input, profile) {
  const errs = [];
  const add = (path, message) => errs.push({ path, message });
  if (!input || typeof input !== 'object') { add('input', 'entrada ausente'); return errs; }
  if (!Number.isInteger(input.seed) || input.seed < 0 || input.seed > 4294967295) add('seed', 'la semilla debe ser un entero entre 0 y 4294967295');
  if (profile.pressure && !Object.keys(profile.pressure.importance).includes(input.importance)) add('importance', `la importancia del encuentro es una de: ${Object.keys(profile.pressure.importance).join(', ')}`);
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
      // MOTOR-07: Forma y los tres momentos individuales son entradas explícitas acotadas (nunca un valor por defecto oculto)
      if (profile.form && profile.moment) {
        const [fl, fh] = profile.form.range; const [ml, mh] = profile.moment.range;
        for (const [k, lo, hi, name] of [['form', fl, fh, 'La Forma'], ['M_TIR', ml, mh, 'El momento M-TIR'], ['M_OFE', ml, mh, 'El momento M-OFE'], ['M_DEF', ml, mh, 'El momento M-DEF']]) {
          const v = p.state?.[k];
          if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) add(`${pp}.state.${k}`, `${name} inicial debe ser un número entre ${lo} y ${hi}`);
        }
      }
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
    // MOTOR-08: política de entrenador, delegación por áreas y plan de participación (asignación validada antes de usarla)
    if (profile.coach) {
      const c = plan.coach;
      if (!c || typeof c !== 'object') add(`${tp}.plan.coach`, 'falta la política de entrenador y la delegación por áreas');
      else {
        if (!(profile.activeCatalog.coachPolicies ?? []).includes(c.policy)) add(`${tp}.plan.coach.policy`, `política ${c.policy} fuera del catálogo activo (${(profile.activeCatalog.coachPolicies ?? []).join(', ')})`);
        for (const a of profile.coach.areas) if (typeof c.delegation?.[a] !== 'boolean') add(`${tp}.plan.coach.delegation.${a}`, 'delegar un ámbito es verdadero o falso');
      }
      validateParticipation(profile, plan, ids, `${tp}.plan`, add);
    }
    if (profile.teamMoment) {
      const [tl, th] = profile.teamMoment.range; const v = plan.initialTeamMoment;
      if (typeof v !== 'number' || !Number.isFinite(v) || v < tl || v > th) add(`${tp}.plan.initialTeamMoment`, `el momento colectivo T inicial debe ser un número entre ${tl} y ${th}`);
    }
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
      if (!playIds.includes(b.playId)) add(`${tp}.plan.playbook[${i}].playId`, `ficha ${b.playId} fuera del catálogo activo`);
      if (seen.has(b.playId)) add(`${tp}.plan.playbook[${i}].playId`, `ficha ${b.playId} repetida`);
      seen.add(b.playId);
      if (!Number.isInteger(b.priority) || b.priority < 1 || b.priority > 5) add(`${tp}.plan.playbook[${i}].priority`, 'la prioridad es un entero 1-5');
    });
    // MOTOR-04: el libro lista solo las fichas ACTIVAS; una ficha ausente está desactivada (no se borra su definición global).
    for (const f of ['disposition', 'defense', 'coverage']) {
      if (!plan[f]) add(`${tp}.plan.${f}`, 'falta');
    }
    if (plan.disposition && !(profile.activeCatalog.dispositions ?? []).includes(plan.disposition)) add(`${tp}.plan.disposition`, `disposición ${plan.disposition} fuera del catálogo activo`);
    if (!MIDRANGE_POLICIES.includes(plan.midrange)) add(`${tp}.plan.midrange`, `la media distancia es una de: ${MIDRANGE_POLICIES.join(', ')}`);
    validateDefensePlan(plan, t, input.teams[1 - ti], profile, tp, add);
    validateThrowPlan(plan, t, input.teams[1 - ti], profile, tp, add);
    validateLearningData(t, tp, profile, add);
    const roleDict = profile.fixtureContract.offensiveRoleDictionary;
    t.players.forEach((p, pi) => { if (!roleDict[p.offensiveRole?.code]) add(`${tp}.players[${pi}](${p.id}).offensiveRole`, `rol ofensivo ${p.offensiveRole?.code ?? 'ausente'} fuera del catálogo`); });
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

// Migración EXPLÍCITA de una entrada editada con una versión anterior: añade solo los campos nuevos (MOTOR-04: media distancia «aceptar si está
// liberada»; MOTOR-05: estilos, marcas, objetivo y especiales defensivos) con su valor SEM inicial. Devuelve { input, added } para informar; no cambia ningún otro valor.
export function upgradeInput(input, profile) {
  const out = deepCopy(input); const added = [];
  const mid = profile.scenario?.plans?.[0]?.midrange ?? 'openOnly';
  for (const t of out.teams ?? []) {
    if (t.plan && !t.plan.midrange) { t.plan.midrange = mid; added.push(`${t.id}: media distancia = ${mid}`); }
    for (const k of Object.keys(profile.scenario.plans[0].styles)) if (t.plan?.styles && t.plan.styles[k] == null) { t.plan.styles[k] = profile.scenario.plans[0].styles[k]; added.push(`${t.id}: estilo ${k}`); }
    // MOTOR-05: campos defensivos nuevos con su valor inicial (ORG01/COB01 siguen válidos; no se cambia a una zona por actualizar el código)
    const p0 = profile.scenario.plans[0];
    if (t.plan) {
      for (const f of ['defStyles', 'navigation', 'marks', 'target', 'targetAlt', 'fallbackOrg', 'specials']) if (t.plan[f] === undefined) { t.plan[f] = JSON.parse(JSON.stringify(p0[f])); added.push(`${t.id}: defensa ${f}`); }
      if (!t.plan.pressureHeight) { t.plan.pressureHeight = 'normal'; added.push(`${t.id}: altura de presión = normal`); }
      // MOTOR-06: candidata explícita de saques (precarga de desarrollo, no una recomendación táctica): nunca sobrescribe un plan ya configurado
      const ti = profile.throwIns;
      if (t.plan.throwInBook === undefined) { t.plan.throwInBook = [{ playId: ti.defaultBandOffensivePlan, priority: 3 }, { playId: ti.defaultEndlineOffensivePlan, priority: 3 }]; added.push(`${t.id}: libro de saques con ${ti.defaultBandOffensivePlan} y ${ti.defaultEndlineOffensivePlan} a prioridad 3 (precarga explícita)`); }
      if (t.plan.throwInServers === undefined) { t.plan.throwInServers = { band: { preferred: null, alternate: null }, endline: { preferred: null, alternate: null } }; added.push(`${t.id}: sacadores de banda y fondo por política funcional`); }
      if (t.plan.throwInDefense === undefined) { t.plan.throwInDefense = { band: ti.defaultBandDefensiveResponse, endline: ti.defaultEndlineDefensiveResponse, target: null }; added.push(`${t.id}: respuestas defensivas de saque ${ti.defaultBandDefensiveResponse} y ${ti.defaultEndlineDefensiveResponse} (precarga explícita)`); }
      for (const p of t.players ?? []) if (!p.defensiveRole?.code) { const slot = SLOTS.find((s) => t.plan.starters?.[s] === p.id); const code = slot ? profile.defenseRepertoire.defaultRolesBySlot[slot] : null; if (code) { p.defensiveRole = { code, name: profile.fixtureContract.defensiveRoleDictionary[code] ?? null, preload: true }; added.push(`${t.id}: rol defensivo de ${p.id} precargado (${code}, editable)`); } }
    }
  }
  // MOTOR-07: estados iniciales y importancia. Una entrada anterior se migra solo con valores EXPLÍCITOS de la política neutral del perfil (anotados);
  // un campo ya presente no se toca. Un valor presente con otra escala no se interpreta por adivinación: la validación lo rechaza.
  const pol = profile.initialStatePolicy;
  if (pol) {
    if (out.importance === undefined) { out.importance = 'ordinary'; added.push('importancia del encuentro = ordinary (política neutral explícita)'); }
    for (const t of out.teams ?? []) {
      if (t.plan && t.plan.initialTeamMoment === undefined) { t.plan.initialTeamMoment = pol.T; added.push(`${t.id}: T inicial = ${pol.T}`); }
      for (const p of t.players ?? []) {
        p.state = p.state ?? {};
        for (const [k, key] of [['form', 'form'], ['M_TIR', 'M_TIR'], ['M_OFE', 'M_OFE'], ['M_DEF', 'M_DEF']]) if (p.state[k] === undefined) { p.state[k] = pol[key]; added.push(`${t.id}: ${p.id} ${k} inicial = ${pol[key]}`); }
      }
    }
  }
  // MOTOR-08: política de entrenador, delegación y plan de participación. Precarga EXPLÍCITA y anotada (ENTREF02, todo delegado; cinco parejas 28/12 SEM); un plan ya configurado no se toca.
  if (profile.coach) {
    for (const t of out.teams ?? []) {
      if (!t.plan) continue;
      if (t.plan.coach === undefined) { t.plan.coach = JSON.parse(JSON.stringify(profile.scenario.plans[0].coach)); added.push(`${t.id}: política de entrenador ${t.plan.coach.policy} con los cinco ámbitos delegados (precarga explícita)`); }
      if (t.plan.participation === undefined && t.players?.length === 12 && t.plan.starters) { t.plan.participation = defaultParticipationPlan(profile, t.players, t.plan); added.push(`${t.id}: plan de participación SEM (cinco parejas funcionales 28/12, revisable)`); }
    }
  }
  out.schema = INPUT_SCHEMA;
  return { input: out, added };
}
