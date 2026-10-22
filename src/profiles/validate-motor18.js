// Validación del árbol `familiarity` de SEM-MOTOR18 (encargo §10.1). Errores localizados; no corrige ni completa nada. Un perfil sin `familiarity` (anterior a MOTOR-18) es válido:
// la capa queda desactivada y no se activa en silencio.
import { playerFactorModel, validatePlayerCurve } from '../knowledge/model.js';
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const POLICIES = ['legacy-neutral'];
const DOMAINS = ['position', 'offensiveRole', 'defensiveRole', 'tactic'];
const MODULE_GROUPS = ['organization', 'coverage', 'disposition', 'family', 'otherOffense', 'pressure', 'throwIn'];
const EXPECTED_MODULES = 30;
const CTX_MODULES = { organized: { attack: ['disposition', 'family'], defense: ['organization', 'coverage'] }, transition: { attack: ['transition'], defense: ['organization'] }, pressBreak: { attack: ['press_break'], defense: ['press', 'organization'] }, throwIn: { attack: ['throwIn'], defense: ['throwIn', 'organization'] }, spontaneous: { attack: ['disposition', 'family'], defense: ['organization', 'coverage'] } };

export function familiarityIssues(profile, add) {
  const f = profile.familiarity; if (!f) return;
  const bad = (path, message, received) => add(`familiarity.${path}`, 'error', 'familiaridad', message, received);
  const num = (path, v, ok, msg) => { if (!finite(v)) bad(path, 'debe ser un número finito', v); else if (!ok(v)) bad(path, msg, v); };
  const [lo, hi] = [f.range?.min, f.range?.max];
  if (!finite(lo) || !finite(hi) || !(lo < hi)) bad('range', 'el rango de niveles debe ser [mínimo < máximo] numérico', f.range);
  const level = (path, v) => num(path, v, (x) => x >= lo && x <= hi, `el nivel debe estar entre ${lo} y ${hi}`);
  if (f.activation && typeof f.activation.enabled !== 'boolean') bad('activation.enabled', 'debe ser verdadero o falso', f.activation.enabled);
  if (!POLICIES.includes(f.activation?.compatibilityPolicy)) bad('activation.compatibilityPolicy', `política no admitida (admitidas: ${POLICIES.join(', ')})`, f.activation?.compatibilityPolicy);
  const cw = f.componentWeights ?? {};
  for (const k of ['position', 'role', 'tactic']) num(`componentWeights.${k}`, cw[k], (x) => x > 0, 'el peso debe ser positivo');
  // catálogo: 30 módulos únicos con grupos coherentes y listas de posiciones/roles únicas
  const cat = f.catalog ?? {}; const mods = cat.modules ?? [];
  const ids = new Set(); const modIds = new Set();
  if (!Array.isArray(mods) || mods.length !== EXPECTED_MODULES) bad('catalog.modules', `el catálogo debe tener ${EXPECTED_MODULES} módulos`, Array.isArray(mods) ? mods.length : mods);
  for (const [i, m] of (Array.isArray(mods) ? mods : []).entries()) {
    if (typeof m?.id !== 'string' || !m.id) { bad(`catalog.modules.${i}.id`, 'identificador ausente', m?.id); continue; }
    if (modIds.has(m.id)) bad(`catalog.modules.${i}.id`, `módulo duplicado ${m.id}`, m.id); modIds.add(m.id);
    if (!MODULE_GROUPS.includes(m.group)) bad(`catalog.modules.${i}.group`, `grupo desconocido (${MODULE_GROUPS.join(', ')})`, m.group);
  }
  const lists = { position: cat.positions, offensiveRole: cat.offensiveRoles, defensiveRole: cat.defensiveRoles };
  const domainIds = { tactic: modIds };
  for (const [k, l] of Object.entries(lists)) {
    if (!Array.isArray(l) || !l.length || l.some((x) => typeof x !== 'string')) { bad(`catalog.${k}`, 'debe ser una lista no vacía de identificadores', l); domainIds[k] = new Set(); continue; }
    if (new Set(l).size !== l.length) bad(`catalog.${k}`, 'identificadores duplicados', l);
    domainIds[k] = new Set(l);
  }
  for (const id of ids) void id;
  const cf = cat.continuationFamily ?? {};
  for (const [c, v] of Object.entries(cf)) if (!['inherit', 'none'].includes(v) && !modIds.has(`FAM:${v}`)) bad(`catalog.continuationFamily.${c}`, `familia «${v}» sin módulo FAM:${v} en el catálogo`, v);
  // pesos de módulos por contexto: positivos, solo módulos conocidos, normalizables
  for (const [c, sides] of Object.entries(f.tacticContextWeights ?? {})) {
    if (!CTX_MODULES[c]) { bad(`tacticContextWeights.${c}`, 'contexto desconocido', c); continue; }
    for (const [s, ws] of Object.entries(sides)) {
      if (!CTX_MODULES[c][s]) { bad(`tacticContextWeights.${c}.${s}`, 'lado desconocido', s); continue; }
      let total = 0;
      for (const [m, w] of Object.entries(ws ?? {})) { if (!CTX_MODULES[c][s].includes(m)) bad(`tacticContextWeights.${c}.${s}.${m}`, 'módulo no previsto para este contexto', m); num(`tacticContextWeights.${c}.${s}.${m}`, w, (x) => x > 0, 'el peso debe ser positivo'); total += finite(w) ? w : 0; }
      if (!(total > 0)) bad(`tacticContextWeights.${c}.${s}`, 'los pesos no son normalizables (suma no positiva)', total);
    }
  }
  for (const [k, sides] of Object.entries(f.maxLogit ?? {})) for (const [s, v] of Object.entries(sides)) num(`maxLogit.${k}.${s}`, v, (x) => x >= 0, 'el máximo logit no puede ser negativo');
  // relaciones de transferencia: referencias a IDs existentes, sin duplicados ni auto-relaciones
  const tr = f.transfer ?? {}; const seenPair = new Set();
  const checkIds = (path, list, dom) => { for (const id of list) if (!domainIds[dom]?.has(id)) bad(path, `${id} no existe en el catálogo de ${dom}`, id); };
  const pairs = (path, arr, dom) => { for (const [i, p] of (arr ?? []).entries()) { if (!Array.isArray(p) || p.length !== 2 || p[0] === p[1]) { bad(`${path}.${i}`, 'debe ser un par de identificadores distintos', p); continue; } checkIds(`${path}.${i}`, p, dom); const key = `${dom}|${[...p].sort().join('|')}`; if (seenPair.has(key)) bad(`${path}.${i}`, `relación duplicada ${p.join('–')}`, p); seenPair.add(key); } };
  const groups = (path, arr, dom) => { for (const [i, g] of (arr ?? []).entries()) { if (!Array.isArray(g) || g.length < 2 || new Set(g).size !== g.length) { bad(`${path}.${i}`, 'un grupo necesita al menos dos identificadores distintos', g); continue; } checkIds(`${path}.${i}`, g, dom); for (let a = 0; a < g.length; a++) for (let b = a + 1; b < g.length; b++) { const key = `${dom}|${[g[a], g[b]].sort().join('|')}`; if (seenPair.has(key)) bad(`${path}.${i}`, `relación duplicada ${g[a]}–${g[b]}`, g); seenPair.add(key); } } };
  pairs('transfer.positionPairs', tr.positionPairs, 'position'); groups('transfer.offensiveRoleGroups', tr.offensiveRoleGroups, 'offensiveRole'); pairs('transfer.offensiveRolePairs', tr.offensiveRolePairs, 'offensiveRole');
  groups('transfer.defensiveRoleGroups', tr.defensiveRoleGroups, 'defensiveRole'); pairs('transfer.defensiveRolePairs', tr.defensiveRolePairs, 'defensiveRole');
  groups('transfer.moduleGroups', tr.moduleGroups, 'tactic'); pairs('transfer.modulePairs', tr.modulePairs, 'tactic');
  // aprendizaje
  const L = f.learning ?? {}; const tr0 = L.traits ?? {};
  level('learning.traits.range.min', tr0.range?.min); level('learning.traits.range.max', tr0.range?.max);
  for (const k of ['tacticalLearningSeed', 'teachingSeed', 'coachMasterySeed']) level(`learning.traits.${k}`, tr0[k]);
  for (const k of DOMAINS) num(`learning.rates.${k}`, L.rates?.[k], (x) => x >= 0, 'la tasa no puede ser negativa');
  const pm = playerFactorModel(L.factors?.player);
  if (pm === 'piecewise-linear') { for (const e of validatePlayerCurve(L.factors.player, f.range ?? {})) bad(e.path, e.message, undefined); }
  else if (pm !== 'linear') bad('learning.factors.player', 'el factor de Polivalencia debe ser una curva piecewise-linear o {base, pendiente}', L.factors?.player);
  for (const k of (pm === 'linear' ? ['player', 'teaching', 'content', 'transfer'] : ['teaching', 'content', 'transfer'])) { num(`learning.factors.${k}.base`, L.factors?.[k]?.base, (x) => x > 0, 'la base debe ser positiva'); num(`learning.factors.${k}.slope`, L.factors?.[k]?.slope, (x) => x >= 0, 'la pendiente no puede ser negativa'); }
  num('learning.factors.relearning', L.factors?.relearning, (x) => x >= 1, 'el reaprendizaje no puede ser inferior a 1');
  num('learning.gainDivisor', L.gainDivisor, (x) => x > 0, 'debe ser positivo');
  num('learning.snapToMaxThreshold', L.snapToMaxThreshold, (x) => x >= lo && x <= hi, `debe estar entre ${lo} y ${hi}`);
  const se = L.session ?? {};
  for (const k of ['minHoursPerPlayerDay', 'maxHoursPerPlayerDay']) num(`learning.session.${k}`, se[k], (x) => x > 0, 'el presupuesto debe ser positivo');
  if (finite(se.minHoursPerPlayerDay) && finite(se.maxHoursPerPlayerDay) && se.minHoursPerPlayerDay > se.maxHoursPerPlayerDay) bad('learning.session.minHoursPerPlayerDay', 'el mínimo de sesión no puede superar el presupuesto diario', se.minHoursPerPlayerDay);
  for (const k of ['collectiveShare', 'individualShare']) num(`learning.session.${k}`, se[k], (x) => x >= 0 && x <= 1, 'debe estar entre 0 y 1');
  if (finite(se.collectiveShare) && finite(se.individualShare) && Math.abs(se.collectiveShare + se.individualShare - 1) > 1e-9) bad('learning.session', `los repartos de sesión deben sumar 1 (suman ${se.collectiveShare + se.individualShare})`, se);
  num('learning.session.maxIdleDays', se.maxIdleDays, (x) => Number.isInteger(x) && x >= 0, 'debe ser un entero no negativo');
  for (const k of ['liveMinutesForFullDose', 'domainBudgetPerDay']) num(`learning.match.${k}`, L.match?.[k], (x) => x > 0, 'debe ser positivo');
  for (const k of DOMAINS) num(`learning.practiceThresholds.${k}`, L.practiceThresholds?.[k], (x) => x > 0, 'el umbral debe ser positivo');
  for (const k of DOMAINS) { const r = f.retention?.[k] ?? {}; num(`retention.${k}.graceDays`, r.graceDays, (x) => Number.isInteger(x) && x >= 0, 'debe ser un entero no negativo'); num(`retention.${k}.lossPerYear`, r.lossPerYear, (x) => x >= 0, 'la pérdida no puede ser negativa'); num(`retention.${k}.floorFraction`, r.floorFraction, (x) => x >= 0 && x <= 1, 'la fracción retenida debe estar entre 0 y 1'); }
  // presentación y semillas
  const pb = f.presentation?.categoryBoundaries ?? [];
  if (!Array.isArray(pb) || !pb.length || pb.some((x, i) => !finite(x) || x < lo || x > hi || (i && x <= pb[i - 1]))) bad('presentation.categoryBoundaries', 'las fronteras deben ser números crecientes dentro del rango de niveles', pb);
  else if (f.presentation.categoryLabels?.length !== pb.length + 1) bad('presentation.categoryLabels', 'debe haber una etiqueta más que fronteras', f.presentation.categoryLabels);
  for (const [k, v] of Object.entries(f.syntheticSeeds ?? {})) { if (k === 'priorityFamilyMaxPriority') num(`syntheticSeeds.${k}`, v, (x) => Number.isInteger(x) && x >= 1 && x <= 5, 'prioridad entera 1–5'); else level(`syntheticSeeds.${k}`, v); }
}
