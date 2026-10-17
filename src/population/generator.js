// Generador correlacionado sencillo (POB02/POB03, MOTOR-11 §8–§10). Condicionado por una plantilla de referencia: los doce perfiles numéricos de la identidad base son los
// centros y se perturban con factores compartidos (equipo e individuo por grupo) más un residuo por capacidad. Solo CONSTRUYE entradas: las correlaciones no se reaplican como
// bonus al resolver tareas del encuentro. Reproducible: misma semilla + receta + dataset + configuración → mismos valores, posiciones, roles y plan lógico.
// No usa Math.random, la fecha ni el RNG de ninguna simulación abierta: cada campo tiene su propio stream derivado de forma estable.
import { ATTRS, deepCopy } from '../match/data.js';
import { createRng } from '../match/rng.js';
import { fnv1a32, fingerprint, canonicalJson } from './hash.js';
import { genOf, popOf, referenceTeam } from './reference.js';
import { retargetTeam, TEAM_ID, playerId } from './ids.js';

const round = (v, d) => { const k = 10 ** d; return Math.round(v * k) / k; };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const DISPERSION_NAMES = { contained: 'contenida', ordinary: 'ordinaria', wide: 'amplia' };

// Streams separados por clave canónica. La derivación es FNV-1a de 32 bits sobre «semilla|receta|dataset|identidad|clave» y el RNG es el xorshift32 del perfil.
export function streamFactory(profile, cfg, base, seed) {
  const gen = genOf(profile);
  return (key) => {
    const s = fnv1a32(`${seed}|${gen.version}|${gen.datasetVersion}|${base}|${key}`);
    const rng = createRng(s, profile.rng);
    for (let i = 0; i < gen.rng.warmup; i++) rng.next('calentamiento');
    const u = () => { const v = rng.next(key); rng.drain(); return v; };
    return { u, tri: () => u() + u() - 1 };
  };
}

export const generatedId = (base, seed, dispersion) => `GEN${base.slice(2)}_${seed}_D${String(dispersion).replace('.', '')}`;
export function validateConfig(profile, cfg) {
  const gen = genOf(profile); const pop = popOf(profile); const errs = [];
  if (!gen || !pop) return ['el perfil no incluye la receta del generador (activa la base de MOTOR-11)'];
  if (!pop.teams[cfg.base]) errs.push(`identidad base desconocida: ${cfg.base}`);
  if (!Number.isInteger(cfg.seed) || cfg.seed < 0 || cfg.seed > 4294967295) errs.push('la semilla de generación debe ser un entero entre 0 y 4294967295');
  if (!(typeof cfg.dispersion === 'number' && Number.isFinite(cfg.dispersion) && cfg.dispersion > 0 && cfg.dispersion <= 3)) errs.push('la dispersión debe ser un número mayor que 0 y no superior a 3');
  return errs;
}

// Genera un equipo ficticio de doce jugadores. `csvPlayers` son las fichas R0 del CSV; `cfg` = { base, seed, dispersion, label?, revision? }.
export function generateTeam(profile, csvPlayers, cfg) {
  const errs = validateConfig(profile, cfg); if (errs.length) throw new Error(errs.join('; '));
  const gen = genOf(profile); const [lo, hi] = profile.abilityBounds; const d = cfg.dispersion;
  const ref = referenceTeam(profile, csvPlayers, cfg.base, { revision: cfg.revision ?? null });
  const stream = streamFactory(profile, cfg, cfg.base, cfg.seed);
  const groupOf = {}; for (const [g, v] of Object.entries(gen.groups)) for (const a of v.abilities) groupOf[a] = g;
  const missing = ATTRS.filter((a) => !groupOf[a]); const dup = ATTRS.filter((a) => Object.values(gen.groups).filter((v) => v.abilities.includes(a)).length > 1);
  if (missing.length || dup.length || Object.values(gen.groups).flatMap((v) => v.abilities).length !== 32) throw new Error('la receta no cubre exactamente las 32 capacidades con un grupo principal cada una');
  const C = gen.coefficients; const P = gen.precision;
  // factores de equipo (uno por grupo y uno corporal)
  const T = {}; for (const g of Object.keys(gen.groups)) T[g] = stream(`team|${g}`).tri(); const Tbody = stream('team|body').tri();
  const teamId = cfg.id ?? generatedId(cfg.base, cfg.seed, d);
  if (!TEAM_ID.test(teamId)) throw new Error(`identificador generado no válido: ${teamId}`);
  const players = ref.players.map((rp) => {
    const jk = rp.id.slice(rp.id.lastIndexOf('-') + 1); // J01…J12
    const Z = {}; for (const g of Object.keys(gen.groups)) Z[g] = stream(`${jk}|Z|${g}`).tri(); const Zbody = stream(`${jk}|Z|body`).tri();
    const abilities = {};
    for (const a of ATTRS) {
      const e = stream(`${jk}|e|${a}`).tri(); const g = groupOf[a];
      const cross = Object.entries(gen.cross[a] ?? {}).reduce((s, [k, c]) => s + c * (k === 'body' ? Zbody : Z[k]), 0);
      abilities[a] = round(clamp(rp.abilities[a] + d * (C.team * T[g] + C.player * Z[g] + C.residual * e + cross), lo, hi), P.abilityDecimals);
    }
    // cuerpo relacionado: un único factor corporal; el motor sigue usando solo los efectos corporales ya aprobados (peso sin efecto directo)
    const B = gen.body; const L = B.limits;
    const eh = stream(`${jk}|body|eAltura`).tri(); const ew = stream(`${jk}|body|ePeso`).tri(); const es = stream(`${jk}|body|eEnvergadura`).tri();
    const height = round(clamp(rp.heightCm + d * (B.heightCm.team * Tbody + B.heightCm.player * Zbody + B.heightCm.residual * eh), L.heightCm.min, L.heightCm.max), P.bodyDecimals);
    const weight = round(clamp(rp.weightKg + d * (B.weightKg.team * Tbody + B.weightKg.player * Zbody + B.weightKg.residual * ew), L.weightKg.min, L.weightKg.max), P.bodyDecimals);
    const wLo = Math.max(L.wingspanCm.min, height + L.wingspanMinusHeightCm.min); const wHi = Math.min(L.wingspanCm.max, height + L.wingspanMinusHeightCm.max);
    const wing = round(clamp(height + (rp.wingspanCm - rp.heightCm) + d * (B.wingspanCm.player * Zbody + B.wingspanCm.residual * es), Math.min(wLo, wHi), wHi), P.bodyDecimals);
    // edad: perturbación entera propia dentro de los límites de la identidad; sin curva de envejecimiento sobre las 32
    const bnd = gen.age.bounds[cfg.base] ?? gen.age.bounds.default;
    const age = clamp(rp.age + Math.floor(gen.age.span * stream(`${jk}|age`).u()) + gen.age.offset, bnd.min, bnd.max);
    // tendencias: independientes de las capacidades
    const Tn = gen.tendencies; const td = P.tendencyDecimals;
    const initiative = round(clamp(rp.initiative + Tn.initiative * d * stream(`${jk}|t|initiative`).tri(), 0, 1), td);
    const finishingVocation = round(clamp(rp.finishingVocation + Tn.finishingVocation * d * stream(`${jk}|t|vocation`).tri(), 0, 1), td);
    const zk = ['rim', 'midrange', 'three']; const raw = zk.map((z) => Math.max(0, rp.zonePreference[z] + Tn.zonePreference * d * stream(`${jk}|t|zone|${z}`).tri()));
    const sum = raw.reduce((s, v) => s + v, 0); let safeguard = null; let zonePreference;
    if (sum > 0) { const n = raw.map((v) => round(v / sum, td)); n[2] = round(1 - n[0] - n[1], td); zonePreference = { rim: n[0], midrange: n[1], three: n[2] }; }
    else { zonePreference = deepCopy(rp.zonePreference); safeguard = 'suma cero: se conserva el vector base válido'; }
    const id = playerId(teamId, Number(jk.slice(1)));
    return {
      id, teamId, name: `Jugador ${id}`, age, heightCm: height, wingspanCm: wing, weightKg: weight, positions: [...rp.positions],
      offensiveRole: { ...rp.offensiveRole }, defensiveRole: { ...rp.defensiveRole }, initiative, finishingVocation, zonePreference, abilities,
      state: deepCopy(profile.fixtureContract.initialState), // neutral ordinario (§5.4): la semilla de población no genera Forma ni momentos extremos
      provenance: [{ revision: 'generado', source: `${gen.version} · plaza ${jk} de ${cfg.base} · semilla ${cfg.seed} · d=${d}`, label: 'Generado', ...(safeguard ? { safeguard } : {}) }],
    };
  });
  // plan lógico: el plan natural de la identidad con todos los identificadores propios remapeados al equipo generado
  const template = retargetTeam({ ...ref, players, id: cfg.base }, teamId); // misma estructura; players ya llevan el ID nuevo (el remapeo solo toca el plan)
  const plan = template.plan; plan.teamId = teamId; delete plan.demo; plan.natural = { ...(ref.plan.natural ?? {}), generatedFrom: cfg.base };
  const name = cfg.label?.trim() || `Generado desde ${cfg.base} «${popOf(profile).teams[cfg.base].identity}» · semilla ${cfg.seed} · dispersión ${d}`;
  const recipe = { version: gen.version, dataset: gen.datasetVersion, params: fingerprint({ dispersions: gen.dispersions, coefficients: gen.coefficients, cross: gen.cross, precision: gen.precision, body: gen.body, age: gen.age, tendencies: gen.tendencies, groups: gen.groups }) };
  const team = { id: teamId, name, players, plan };
  team.source = { kind: 'generated', base: cfg.base, baseRevision: ref.source.revision, basePlan: ref.source.planVersion, seed: cfg.seed, dispersion: d, recipe, label: cfg.label ?? null, rngDerivation: gen.rng.derivation };
  team.source.fingerprint = fingerprint({ players: team.players.map(({ provenance, ...p }) => p), plan: team.plan });
  return team;
}

// Diferencias de un equipo generado respecto de sus centros (para la previsualización): por plaza, capacidades con mayor desplazamiento y cuerpo/edad.
export function diffToCenters(team, ref) {
  return team.players.map((p, i) => {
    const r = ref.players[i];
    const deltas = ATTRS.map((a) => ({ attr: a, before: r.abilities[a], after: p.abilities[a], delta: p.abilities[a] - r.abilities[a] }));
    return { id: p.id, center: r.id, ageDelta: p.age - r.age, heightDelta: round(p.heightCm - r.heightCm, 2), weightDelta: round(p.weightKg - r.weightKg, 2), wingspanDelta: round(p.wingspanCm - r.wingspanCm, 2),
      maxAbs: Math.max(...deltas.map((x) => Math.abs(x.delta))), mean: deltas.reduce((s, x) => s + x.delta, 0) / deltas.length, deltas };
  });
}
export const recipeSummary = (profile) => { const g = genOf(profile); return g ? `${g.version} · ${g.datasetVersion}` : null; };
export { canonicalJson };
