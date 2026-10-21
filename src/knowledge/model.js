// Modelo de conocimiento de MOTOR-18 (KNOW-MOTOR18-R1): 62 niveles por jugador (5 posiciones + 15 roles ofensivos + 12 defensivos + 30 módulos tácticos), sin productos cartesianos.
// Funciones PURAS (sin DOM, sin fs, sin azar, sin reloj de pared) importables en Node y en el navegador. Todas las constantes salen de `params = profile.familiarity` (SEM18).
// Un bloque ausente o `legacy-neutral` NO es «dominio 1» ni «dominio 30»: `levelOf` devuelve null («no aplica») y el efecto deportivo de esta capa es cero.

export const DOMAINS = ['position', 'offensiveRole', 'defensiveRole', 'tactic'];
export const BLOCK_FIELD = { position: 'positions', offensiveRole: 'offensiveRoles', defensiveRole: 'defensiveRoles', tactic: 'tactics' };
export const keyOf = (domain, id) => `${domain}:${id}`;
export const parseKey = (k) => { const i = k.indexOf(':'); return { domain: k.slice(0, i), id: k.slice(i + 1) }; };

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function idsOf(domain, params) {
  const c = params.catalog;
  if (domain === 'position') return c.positions;
  if (domain === 'offensiveRole') return c.offensiveRoles;
  if (domain === 'defensiveRole') return c.defensiveRoles;
  if (domain === 'tactic') return c.modules.map((m) => m.id);
  throw new Error(`dominio de conocimiento desconocido: ${domain}`);
}
export function knowledgeKeys(params) { return DOMAINS.flatMap((domain) => idsOf(domain, params).map((id) => ({ domain, id }))); }

export const normalizeLevel = (K, params) => clamp((K - params.range.min) / (params.range.max - params.range.min), 0, 1);

export const emptyLegacyBlock = () => ({ version: 'KNOW-MOTOR18-R1', mode: 'legacy-neutral' });
export const isLegacyNeutral = (block) => block == null || block.mode === 'legacy-neutral';

export function levelOf(block, domain, id) {
  if (isLegacyNeutral(block)) return null;
  return block[BLOCK_FIELD[domain]]?.[id]?.level ?? null;
}
export const entryOf = (block, domain, id) => (isLegacyNeutral(block) ? null : block[BLOCK_FIELD[domain]]?.[id] ?? null);

// 1–6 inicial; >6–12 básico; >12–18 competente; >18–24 avanzado; >24–30 dominado (fronteras inclusivas por arriba, en params.presentation).
export function categoryOf(level, params) {
  const p = params.presentation; const b = p.categoryBoundaries;
  let i = 0; while (i < b.length && level > b[i]) i += 1;
  return { index: i, label: p.categoryLabels[i] };
}

export function validateKnowledgeBlock(block, params) {
  const errs = []; const add = (path, message) => errs.push({ path, message });
  if (block == null || typeof block !== 'object') { add('knowledge', 'bloque ausente o no es un objeto'); return errs; }
  if (block.version !== params.knowledgeVersion) add('knowledge.version', `versión ${block.version} distinta de ${params.knowledgeVersion}`);
  if (block.mode === 'legacy-neutral') return errs;
  if (block.mode !== 'explicit') { add('knowledge.mode', `modo desconocido «${block.mode}» (explicit | legacy-neutral)`); return errs; }
  if (!Number.isInteger(block.asOfDay) || block.asOfDay < 0) add('knowledge.asOfDay', 'el día de evaluación es un entero ≥ 0');
  const { min, max } = params.range;
  for (const domain of DOMAINS) {
    const field = BLOCK_FIELD[domain]; const obj = block[field]; const ids = idsOf(domain, params);
    if (obj == null || typeof obj !== 'object') { add(`knowledge.${field}`, 'falta el apartado (un bloque explícito incompleto no se rellena)'); continue; }
    for (const id of ids) {
      const e = obj[id]; const p = `knowledge.${field}.${id}`;
      if (e == null || typeof e !== 'object') { add(p, 'falta la entrada'); continue; }
      if (typeof e.level !== 'number' || !Number.isFinite(e.level) || e.level < min || e.level > max) add(`${p}.level`, `el nivel debe ser un número entre ${min} y ${max}`);
      if (typeof e.peak !== 'number' || !Number.isFinite(e.peak) || e.peak > max) add(`${p}.peak`, `el máximo histórico debe ser un número ≤ ${max}`);
      else if (typeof e.level === 'number' && e.peak < e.level) add(`${p}.peak`, 'el máximo histórico no puede ser inferior al nivel');
      if (!Number.isInteger(e.lastPracticeDay)) add(`${p}.lastPracticeDay`, 'la última práctica es un día entero');
      else if (Number.isInteger(block.asOfDay) && e.lastPracticeDay > block.asOfDay) add(`${p}.lastPracticeDay`, 'la última práctica no puede ser posterior al día de evaluación');
    }
    for (const id of Object.keys(obj)) if (!ids.includes(id)) add(`knowledge.${field}.${id}`, 'identificador ajeno al catálogo (no recibe interpretación deportiva)');
  }
  return errs;
}

export function validateTransfer(params) {
  const errs = []; const t = params.transfer;
  const chk = (domain, list, path) => { const ids = idsOf(domain, params); for (const id of list.flat(Infinity)) if (!ids.includes(id)) errs.push({ path, message: `${id} no existe en el catálogo de ${domain}` }); };
  chk('position', t.positionPairs, 'transfer.positionPairs');
  chk('offensiveRole', [...t.offensiveRoleGroups, ...t.offensiveRolePairs], 'transfer.offensiveRole*');
  chk('defensiveRole', [...t.defensiveRoleGroups, ...t.defensiveRolePairs], 'transfer.defensiveRole*');
  chk('tactic', [...t.moduleGroups, ...t.modulePairs], 'transfer.module*');
  return errs;
}

function relationLists(domain, params) {
  const t = params.transfer;
  if (domain === 'position') return { groups: [], pairs: t.positionPairs };
  if (domain === 'offensiveRole') return { groups: t.offensiveRoleGroups, pairs: t.offensiveRolePairs };
  if (domain === 'defensiveRole') return { groups: t.defensiveRoleGroups, pairs: t.defensiveRolePairs };
  if (domain === 'tactic') return { groups: t.moduleGroups, pairs: t.modulePairs };
  throw new Error(`dominio desconocido: ${domain}`);
}
// Relaciones simétricas directas (grupo = todos con todos; par = dos). Sin cierre transitivo: A–B y B–C no relacionan A con C.
export function relatedOf(domain, id, params) {
  const { groups, pairs } = relationLists(domain, params); const known = new Set(idsOf(domain, params)); const out = new Set();
  for (const g of groups) if (g.includes(id)) for (const x of g) if (x !== id) out.add(x);
  for (const [a, b] of pairs) { if (a === id) out.add(b); else if (b === id) out.add(a); }
  return [...out].filter((x) => known.has(x)).sort();
}

export function makeEntry(level, day, peak = level) { return { level, peak, lastPracticeDay: day }; }
export function allMastered(params, day) {
  const b = { version: params.knowledgeVersion, mode: 'explicit', asOfDay: day };
  for (const domain of DOMAINS) b[BLOCK_FIELD[domain]] = Object.fromEntries(idsOf(domain, params).map((id) => [id, makeEntry(params.range.max, day)]));
  return b;
}

// FÁBRICA SEM de historia sintética (§10.2). No infiere ni aprende: asigna semillas por regla y, si varias reglas coinciden, toma el máximo (recibo `rules`).
// `player.positions`: se tratan como posiciones habituales TODAS las listadas en la ficha (30); las relacionadas por transferencia con alguna de ellas 18; el resto 8.
// `playFamily`: {POS01:'pick_and_roll',…} (spec.family del repertorio); sin él no se asignan las familias de las fichas prioritarias del plan.
export function syntheticHistory(player, plan, params, day, playFamily = null) {
  const s = params.syntheticSeeds; const cand = {};
  const offer = (domain, id, value, rule) => { (cand[keyOf(domain, id)] ??= []).push({ rule, value }); };
  const habitual = player.positions ?? [];
  for (const id of idsOf('position', params)) offer('position', id, s.otherPosition, 'otherPosition');
  for (const h of habitual) { offer('position', h, s.nominalPosition, 'nominalPosition'); for (const r of relatedOf('position', h, params)) offer('position', r, s.relatedPosition, 'relatedPosition'); }
  const roles = [['offensiveRole', player.offensiveRole?.code, 'Offensive'], ['defensiveRole', player.defensiveRole?.code, 'Defensive']];
  for (const [domain, code, cap] of roles) {
    for (const id of idsOf(domain, params)) offer(domain, id, s[`other${cap}Role`], `other${cap}Role`);
    if (code) { offer(domain, code, s[`habitual${cap}Role`], `habitual${cap}Role`); for (const r of relatedOf(domain, code, params)) offer(domain, r, s[`related${cap}Role`], `related${cap}Role`); }
  }
  const mods = idsOf('tactic', params);
  for (const id of mods) offer('tactic', id, s.generalModule, 'generalModule');
  for (const id of [plan?.defense, plan?.coverage, plan?.disposition]) if (id && mods.includes(id)) offer('tactic', id, s.loadedPlanModule, 'loadedPlanModule');
  if (playFamily) for (const b of plan?.playbook ?? []) if (b.priority <= s.priorityFamilyMaxPriority && playFamily[b.playId]) offer('tactic', `FAM:${playFamily[b.playId]}`, s.priorityFamily, 'priorityFamily');
  const block = { version: params.knowledgeVersion, mode: 'explicit', asOfDay: day }; const rules = {};
  for (const domain of DOMAINS) {
    block[BLOCK_FIELD[domain]] = {};
    for (const id of idsOf(domain, params)) {
      const list = cand[keyOf(domain, id)]; const best = list.reduce((a, b) => (b.value > a.value ? b : a));
      block[BLOCK_FIELD[domain]][id] = makeEntry(best.value, day); rules[keyOf(domain, id)] = { value: best.value, rule: best.rule, candidates: list };
    }
  }
  return { block, receipt: { factory: 'syntheticHistory', version: params.knowledgeVersion, day, conflictPolicy: 'máximo de las semillas propuestas', rules } };
}

// ---------------------------------------------------------------- huella estable (FNV-1a, 2×32 bits con semillas distintas; JS puro, sin node:crypto)
export function canonicalJson(x) {
  if (x === null || typeof x !== 'object') return JSON.stringify(x);
  if (Array.isArray(x)) return `[${x.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(x).filter((k) => x[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(x[k])}`).join(',')}}`;
}
export function fingerprintOf(x) {
  const s = canonicalJson(x); let h1 = 0x811c9dc5; let h2 = 0x9747b28c;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0; h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0; }
  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}
export const knowledgeFingerprint = (block) => fingerprintOf(block ?? emptyLegacyBlock());

// Resumen del quinteto: media con pesos iguales de los jugadores con bloque explícito; los legacy-neutral no cuentan (se cuentan aparte). No guarda nada colectivo.
export function teamSummary(blocks, params) {
  const explicit = blocks.filter((b) => !isLegacyNeutral(b)); const out = { explicit: explicit.length, legacyNeutral: blocks.length - explicit.length, domains: {} };
  for (const domain of DOMAINS) {
    out.domains[domain] = {};
    for (const id of idsOf(domain, params)) {
      const lv = explicit.map((b) => levelOf(b, domain, id)).filter((v) => v != null);
      out.domains[domain][id] = lv.length ? lv.reduce((a, b) => a + b, 0) / lv.length : null;
    }
  }
  return out;
}
