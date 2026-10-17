// Validación de la población (MOTOR-11 §15.2): equipos canónicos, doce plazas distintas, 32 capacidades continuas, tendencias normalizadas, cuerpo/edad/estados
// dentro del contrato, roles y referencias existentes y planes realizables frente a un rival cualquiera. No corrige ni completa nada.
import { ATTRS, SLOTS, validateInput } from '../match/data.js';
import { retargetTeam, PLAYER_ID, TEAM_ID } from './ids.js';
import { REFERENCE_IDS, popOf } from './reference.js';

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

// Devuelve [{ path, message }]. Vacía = válida.
export function validateTeamRecord(team, profile, { rivalCheck = true } = {}) {
  const errs = []; const add = (path, message) => errs.push({ path, message });
  if (!team || typeof team !== 'object') return [{ path: 'team', message: 'equipo ausente' }];
  if (!TEAM_ID.test(team.id ?? '')) add('id', `identificador de equipo no válido (${team.id})`);
  if (!Array.isArray(team.players) || team.players.length !== 12) { add('players', 'cada equipo necesita doce jugadores'); return errs; }
  const [lo, hi] = profile.abilityBounds; const ids = new Set(); const slots = new Set();
  const body = profile.body; const off = profile.fixtureContract.offensiveRoleDictionary; const def = profile.fixtureContract.defensiveRoleDictionary;
  team.players.forEach((p, i) => {
    const pp = `players[${i}](${p?.id})`; const m = PLAYER_ID.exec(p?.id ?? '');
    if (!m || m[1] !== team.id) add(`${pp}.id`, `el identificador debe ser ${team.id}-Jnn`); else { if (slots.has(m[2])) add(`${pp}.id`, 'plaza repetida'); slots.add(m[2]); if (Number(m[2]) < 1 || Number(m[2]) > 12) add(`${pp}.id`, 'la plaza debe ser J01–J12'); }
    if (ids.has(p.id)) add(`${pp}.id`, 'identificador duplicado'); ids.add(p.id);
    if (p.teamId !== team.id) add(`${pp}.teamId`, 'no coincide con el equipo');
    const keys = Object.keys(p.abilities ?? {});
    if (keys.length !== 32 || !ATTRS.every((a) => keys.includes(a))) add(`${pp}.abilities`, 'deben ser exactamente las 32 capacidades acordadas');
    for (const a of ATTRS) { const v = p.abilities?.[a]; if (!finite(v) || v < lo || v > hi) add(`${pp}.abilities.${a}`, `capacidad continua finita entre ${lo} y ${hi} (valor ${v})`); }
    if (!Number.isInteger(p.age) || p.age < 14 || p.age > 60) add(`${pp}.age`, 'la edad es un entero razonable');
    if (!finite(p.heightCm) || p.heightCm < body.heightRangeCm[0] || p.heightCm > body.heightRangeCm[1]) add(`${pp}.heightCm`, `altura fuera del contrato corporal ${body.heightRangeCm.join('–')} cm`);
    if (!finite(p.wingspanCm) || p.wingspanCm < body.wingspanRangeCm[0] || p.wingspanCm > body.wingspanRangeCm[1]) add(`${pp}.wingspanCm`, `envergadura fuera del contrato corporal ${body.wingspanRangeCm.join('–')} cm`);
    if (!finite(p.weightKg) || p.weightKg <= 0) add(`${pp}.weightKg`, 'peso ausente o no positivo (kg)');
    if (!Array.isArray(p.positions) || !p.positions.length || p.positions.some((s) => !SLOTS.includes(s))) add(`${pp}.positions`, 'posiciones del catálogo (PG, SG, SF, PF, C)');
    if (!off[p.offensiveRole?.code]) add(`${pp}.offensiveRole`, 'rol ofensivo fuera del catálogo');
    if (!def[p.defensiveRole?.code]) add(`${pp}.defensiveRole`, 'rol defensivo fuera del catálogo');
    for (const k of ['initiative', 'finishingVocation']) if (!finite(p[k]) || p[k] < 0 || p[k] > 1) add(`${pp}.${k}`, 'tendencia entre 0 y 1');
    const z = p.zonePreference; const zs = ['rim', 'midrange', 'three'].map((k) => z?.[k]);
    if (zs.some((v) => !finite(v) || v < 0) || Math.abs(zs.reduce((s, v) => s + v, 0) - 1) > 1e-6) add(`${pp}.zonePreference`, 'las preferencias de zona son no negativas y suman 1');
    const st = p.state ?? {};
    if (!finite(st.energy) || st.energy < 0 || st.energy > 100) add(`${pp}.state.energy`, 'energía 0–100');
    for (const k of ['form', 'M_TIR', 'M_OFE', 'M_DEF']) { const rg = k === 'form' ? profile.form.range : profile.moment.range; if (!finite(st[k]) || st[k] < rg[0] || st[k] > rg[1]) add(`${pp}.state.${k}`, `${k} entre ${rg[0]} y ${rg[1]}`); }
  });
  if (!team.plan) { add('plan', 'plan ausente'); return errs; }
  if (rivalCheck && !errs.length) {
    let rival; try { rival = retargetTeam(team, 'ZZ_RIVAL'); } catch { rival = null; }
    if (rival) for (const e of validateInput({ seed: 1, importance: 'ordinary', teams: [team, rival] }, profile)) if (e.path.startsWith('teams[0]')) add(e.path.replace(/^teams\[0\]\([^)]*\)\./, ''), e.message);
  }
  return errs;
}

// §15.2: doce equipos canónicos, 144 IDs únicos, campos completos, planes naturales válidos y revisión de edad identificada.
export function validateReferenceSet(profile, teams) {
  const errs = []; const add = (path, message) => errs.push({ path, message });
  const pop = popOf(profile);
  if (!pop) return [{ path: 'population', message: 'el perfil no incluye la población de MOTOR-11' }];
  if (teams.length !== 12 || !REFERENCE_IDS.every((id) => teams.some((t) => t.id === id))) add('teams', 'deben ser los doce equipos canónicos EQ01–EQ12');
  const all = teams.flatMap((t) => t.players.map((p) => p.id)); if (all.length !== 144 || new Set(all).size !== 144) add('players', 'deben ser 144 identificadores únicos');
  for (const t of teams) for (const e of validateTeamRecord(t, profile)) add(`${t.id}.${e.path}`, e.message);
  for (const t of teams) { const s = t.plan.starters; if (new Set(Object.values(s)).size !== 5) add(`${t.id}.plan.starters`, 'cinco titulares distintos'); }
  const eq07 = teams.find((t) => t.id === 'EQ07')?.players.find((p) => p.id === 'EQ07-J01');
  if (eq07 && eq07.age !== 40) add('EQ07-J01.age', `la revisión vigente de referencia debe tener 40 años (tiene ${eq07.age})`);
  return errs;
}
