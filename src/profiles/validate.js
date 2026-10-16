// Validación estructural y semántica del subconjunto activo (SUP04). Devuelve incidencias con fila/grupo, severidad, campo,
// regla, valor recibido y explicación; no corrige ni completa nada. Separa estructura, cobertura y evidencia deportiva (§10.3).
import { buildRows, uncoveredLeaves, indexRows, COVERAGE_STATES } from './rows.js';
import { canonical, getAt } from './util.js';
import { SLOTS } from '../match/data.js';

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const TOL = 1e-9; // precisión numérica de una suma; no admite otra distribución

export const scaleOf = (row) => (['probability', 'probabilityLogit', 'fraction', 'distribution'].includes(row.type) ? 100 : 1);
export const isScalarNumber = (row) => ['probability', 'probabilityLogit', 'fraction', 'distribution', 'weight', 'recipeWeight', 'sensitivity', 'logit', 'multiplier', 'energy', 'energyRate', 'energyPenalty', 'count', 'seconds', 'points', 'reference'].includes(row.type);

// Dominio de una fila numérica: devuelve null si es válida o el texto del motivo.
function scalarProblem(type, v, ctx) {
  if (!finite(v)) return 'debe ser un número finito';
  switch (type) {
    case 'probabilityLogit': return v > 0 && v < 1 ? null : 'debe estar estrictamente entre 0 y 1 porque entra en un logit (0 % y 100 % no son transformables)';
    case 'probability': case 'fraction': case 'distribution': return v >= 0 && v <= 1 ? null : 'debe estar entre 0 y 1 (0 % – 100 %)';
    case 'weight': case 'recipeWeight': case 'sensitivity': case 'energyRate': case 'energyPenalty': case 'points': return v >= 0 ? null : 'no puede ser negativo';
    case 'logit': return null;
    case 'multiplier': return v > 0 ? null : 'debe ser mayor que 0';
    case 'energy': return v >= ctx.energyRange[0] && v <= ctx.energyRange[1] ? null : `debe estar dentro de la escala de energía ${ctx.energyRange[0]}–${ctx.energyRange[1]}`;
    case 'count': return Number.isInteger(v) && v >= 0 ? null : 'debe ser un entero no negativo';
    case 'seconds': return v > 0 ? null : 'debe ser mayor que 0';
    case 'reference': return v >= ctx.bounds[0] && v <= ctx.bounds[1] ? null : `debe estar dentro de la escala de capacidades ${ctx.bounds[0]}–${ctx.bounds[1]}`;
    default: return null;
  }
}

// Validación del valor de UNA fila (sirve también para previsualizar ediciones). `ctx` = { energyRange, bounds }.
export function validateRowValue(row, v, ctx) {
  const out = [];
  const bad = (rule, message) => out.push({ severity: 'error', rule, message });
  const warn = (rule, message) => out.push({ severity: 'aviso', rule, message });
  const t = row.type;
  if (row.type === 'vector5') {
    if (!Array.isArray(v) || v.length !== 5) { bad('forma', 'debe ser una lista de 5 valores (uno por nivel)'); return out; }
    v.forEach((x, i) => { const p = scalarProblem(row.elem === 'logit' ? 'logit' : row.elem, x, ctx); if (p) bad('dominio', `${row.elems?.[i] ?? `elemento ${i + 1}`}: ${p}`); });
    if (!out.length && row.order) {
      const ok = v.every((x, i) => i === 0 || (row.order === 'asc' ? x >= v[i - 1] : x <= v[i - 1]));
      if (!ok) warn('orden-esperado', `se espera ${row.order === 'asc' ? 'creciente' : 'decreciente'} con el nivel; un orden distinto invierte el sentido del estilo`);
    }
    return out;
  }
  if (t === 'pair') {
    if (!Array.isArray(v) || v.length !== 2 || !v.every(finite)) { bad('forma', 'debe ser un par de números finitos'); return out; }
    const [a, b] = v;
    if (row.pair === 'range' && !(a < b)) bad('rango', 'el mínimo debe ser menor que el máximo');
    if (row.pair === 'bounds' && !(a > 0 && b >= a)) bad('rango', 'los límites deben ser positivos y mínimo ≤ máximo');
    if (row.pair === 'mix' && (a < 0 || b < 0 || Math.abs(a + b - 1) > TOL)) bad('suma', `los dos coeficientes deben ser no negativos y sumar 1 (suman ${a + b})`);
    if (row.pair === 'mixMax1' && (a < 0 || b < 0 || a + b > 1 + TOL)) bad('suma', `los coeficientes deben ser no negativos y su suma no puede superar 1 (suman ${a + b})`);
    if (row.pair === 'positiveMix' && (a < 0 || b < 0 || a + b <= 0)) bad('suma', 'los coeficientes deben ser no negativos y no ambos nulos');
    return out;
  }
  if (t === 'triangular') {
    if (!Array.isArray(v) || v.length !== 3 || !v.every(finite)) { bad('forma', 'debe ser [mínimo, más probable, máximo] con números finitos'); return out; }
    const [mn, mo, mx] = v;
    if (mn < 0) bad('duración', 'el mínimo no puede ser negativo');
    if (!(mn <= mo && mo <= mx)) bad('orden', `debe cumplirse mínimo ≤ más probable ≤ máximo (recibido ${mn} / ${mo} / ${mx})`);
    if (!(mx > mn)) bad('rango', 'el máximo debe ser estrictamente mayor que el mínimo');
    if (mx < 0.1) bad('duración', 'el máximo debe ser al menos 0,1 s (una décima, resolución del reloj)');
    return out;
  }
  if (t === 'curve') {
    if (!Array.isArray(v) || v.length < 2 || !v.every((n) => Array.isArray(n) && n.length === 2 && n.every(finite))) { bad('forma', 'debe ser una lista de al menos 2 nodos [energía, gravedad] numéricos'); return out; }
    for (let i = 1; i < v.length; i++) if (!(v[i][0] > v[i - 1][0])) { bad('abscisas', `las energías de los nodos deben ser estrictamente crecientes (nodo ${i + 1})`); break; }
    if (v[0][0] !== ctx.energyRange[0] || v[v.length - 1][0] !== ctx.energyRange[1]) bad('extremos', `la curva debe cubrir toda la escala: empezar en ${ctx.energyRange[0]} y acabar en ${ctx.energyRange[1]}`);
    v.forEach((n, i) => { if (n[1] < 0 || n[1] > 1) bad('dominio', `la gravedad del nodo ${i + 1} debe estar entre 0 y 1`); });
    if (!out.length && v.some((n, i) => i > 0 && n[1] > v[i - 1][1] + TOL)) warn('monotonía', 'la gravedad debería no crecer al subir la energía; una curva creciente penaliza más a quien está más descansado');
    return out;
  }
  if (t === 'slots') {
    if (!Array.isArray(v) || !v.length) { bad('vacía', 'debe incluir al menos una posición'); return out; }
    if (v.some((s) => !SLOTS.includes(s))) bad('catálogo', `solo se admiten posiciones del catálogo (${SLOTS.join(', ')})`);
    if (new Set(v).size !== v.length) bad('duplicado', 'posición repetida');
    return out;
  }
  if (t === 'bool') { if (typeof v !== 'boolean') bad('tipo', 'debe ser verdadero o falso'); return out; }
  if (t === 'strlist') { if (!Array.isArray(v) || v.some((s) => typeof s !== 'string')) bad('tipo', 'debe ser una lista de identificadores'); return out; }
  if (t === 'text' || t === 'declarado' || t === 'presentacion') return out;
  const p = scalarProblem(t, v, ctx);
  if (p) bad('dominio', p);
  return out;
}

// Relaciones entre filas (umbrales, límites, composición). Cada regla lee valores efectivos del perfil.
function relationIssues(profile, add) {
  const g = (p) => getAt(profile, p.split('.'));
  const rot = profile.rotation; const e = profile.energy;
  if (finite(rot?.criticalEnergy) && finite(rot?.reviewEnergy) && !(rot.criticalEnergy < rot.reviewEnergy)) add('rotation.criticalEnergy', 'error', 'umbrales', 'la energía crítica debe ser menor que el umbral de revisión (de lo contrario la fatiga normal nunca se distingue de la crítica)', rot.criticalEnergy);
  if (finite(rot?.minimumStintSeconds) && finite(rot?.maximumNormalStintSeconds) && rot.minimumStintSeconds > rot.maximumNormalStintSeconds) add('rotation.minimumStintSeconds', 'error', 'umbrales', 'el tramo mínimo no puede superar el tramo normal máximo', rot.minimumStintSeconds);
  if (finite(rot?.benchReadyEnergy) && finite(rot?.reviewEnergy) && rot.benchReadyEnergy < rot.criticalEnergy) add('rotation.benchReadyEnergy', 'aviso', 'umbrales', 'un suplente con menos energía que la crítica puede entrar antes de estar listo', rot.benchReadyEnergy);
  for (const it of rot?.foulProtection ?? []) if (finite(it.fouls) && it.fouls >= (profile.rules?.foulOut ?? 5)) add(`rotation.foulProtection.p${it.period}.fouls`, 'aviso', 'umbrales', `la protección solo actúa si el jugador sigue disponible: ${it.fouls} faltas equivalen a la exclusión (${profile.rules.foulOut})`, it.fouls);
  const lb = e?.loadBounds;
  if (Array.isArray(lb)) for (const [k, v] of Object.entries(e.load ?? {})) if (finite(v) && (v < lb[0] || v > lb[1])) add(`energy.load.${k}`, 'aviso', 'composición', `el valor queda limitado a ${lb[0]}–${lb[1]} en ejecución (límites de carga); no se aplica tal cual`, v);
  const ef = e?.enduranceFactorBounds;
  if (Array.isArray(ef) && !(ef[0] <= ef[1])) add('energy.enduranceFactorBounds', 'error', 'rango', 'mínimo mayor que máximo', ef);
  const af = profile.selection?.abilityFit;
  if (af && finite(af.min) && finite(af.max) && af.min > af.max) add('selection.abilityFit.min', 'error', 'rango', 'el mínimo del ajuste no puede superar el máximo', af.min);
  const q = profile.opportunity?.qualityShotLogit;
  if (q && q.comfortable < q.normal) add('opportunity.qualityShotLogit.comfortable', 'aviso', 'orden-esperado', 'una calidad «cómoda» debería acertar al menos como la «normal»', q.comfortable);
  if (q && q.forced > q.normal) add('opportunity.qualityShotLogit.forced', 'aviso', 'orden-esperado', 'una calidad «forzada» no debería acertar más que la «normal»', q.forced);
  for (const [k, t] of Object.entries(profile.tasks ?? {})) if (finite(t.maxEnergyPenalty) && t.maxEnergyPenalty > 29) add(`tasks.${k}.maxEnergyPenalty`, 'aviso', 'dominio', 'un deterioro superior a 29 puntos sale de la escala de capacidades (1–30)', t.maxEnergyPenalty);
  if (finite(profile.selection?.candidateRead?.opponentAbilityEstimate)) { /* validado como referencia */ }
}

// Validación completa de un perfil efectivo. `base`: perfil base protegido para comprobar reglamento/invariantes.
export function validateProfile(profile, { base = null, players = null, validateFixtures = null } = {}) {
  const issues = [];
  const add = (id, severity, rule, message, received, extra = {}) => issues.push({ id, severity, rule, message, received, field: extra.field ?? id, group: extra.group ?? null });
  let rows;
  try { rows = buildRows(profile); } catch (e) { return { issues: [{ id: 'perfil', severity: 'error', rule: 'estructura', message: `no se puede interpretar el perfil: ${e.message}`, received: null, field: 'perfil' }], rows: [], summary: { errors: 1, avisos: 0, structure: 'invalida', coverage: null } }; }
  const ctx = { energyRange: profile.energy?.range ?? [0, 100], bounds: profile.abilityBounds ?? [1, 30] };
  // 1. ausencias y hojas desconocidas
  for (const r of rows) if (r.missing && r.required) add(r.id, 'error', 'ausente-requerida', 'fila requerida ausente: el motor no la sustituye por un valor por defecto', undefined);
  for (const k of uncoveredLeaves(profile, rows)) add(k, 'error', 'campo-desconocido', 'campo del perfil que no pertenece al diccionario: no se ignora ni se elimina para hacerlo pasar', getAt(profile, k.split('.')));
  // 2. valores por fila y protección
  const baseRows = base ? indexRows(buildRows(base)).byId : null;
  for (const r of rows) {
    if (r.missing || r.source === 'presentation') continue;
    if (r.coverage !== 'no_aplicable') for (const i of validateRowValue(r, r.value, ctx)) add(r.id, i.severity, i.rule, `${i.message}`, r.value);
    const protectedRow = r.cls === 'reglamento' || r.cls === 'invariante' || r.locked || r.coverage !== 'consumido';
    if (protectedRow && baseRows) {
      const b = baseRows.get(r.id);
      if (!b) add(r.id, 'error', 'protegida', 'fila protegida que no existe en la base', r.value);
      else if (canonical(b.value) !== canonical(r.value)) add(r.id, 'error', 'protegida', `${r.cls === 'reglamento' ? 'obligación reglamentaria' : r.cls === 'invariante' ? 'invariante funcional' : 'fila sin mecanismo que la consulte'}: no se altera desde un perfil (base: ${canonical(b.value)})`, r.value);
    }
  }
  // 3. grupos con suma
  const groups = new Map();
  for (const r of rows) if (r.group && !r.missing) { if (!groups.has(r.group)) groups.set(r.group, []); groups.get(r.group).push(r); }
  for (const [gid, members] of groups) {
    const sum = members.reduce((s, r) => s + (finite(r.value) ? r.value : NaN), 0);
    const kind = members[0].sum;
    if (kind === 1 && !(Math.abs(sum - 1) <= TOL)) add(gid, 'error', 'suma', `las filas del grupo deben sumar 1 y suman ${Number(sum.toPrecision(12))}; usa «Normalizar» (se muestra la transformación antes de aplicarla)`, sum, { group: gid });
    if (kind === 'positive' && !(sum > 0)) add(gid, 'error', 'masa', 'el conjunto debe tener masa positiva: no se puede normalizar desde cero', sum, { group: gid });
  }
  relationIssues(profile, add);
  // 4. fixtures (receta de existentes) opcional
  if (players && validateFixtures) for (const e of validateFixtures(profile, players)) add(e.path, 'error', 'datos', e.message, undefined);
  const consumed = rows.filter((r) => r.coverage === 'consumido' && !r.missing).length;
  const summary = {
    errors: issues.filter((i) => i.severity === 'error').length,
    avisos: issues.filter((i) => i.severity === 'aviso').length,
    structure: issues.some((i) => i.severity === 'error') ? 'invalida' : 'valida',
    coverage: {
      rows: rows.length, required: rows.filter((r) => r.required).length, missing: rows.filter((r) => r.missing && r.required).length,
      consumed, withoutConsumer: rows.filter((r) => r.coverage === 'sin_consumidor').length, notApplicable: rows.filter((r) => r.coverage === 'no_aplicable').length,
      incrementalComplete: !rows.some((r) => r.missing && r.required),
    },
    sem: rows.filter((r) => r.evidence === 'SEM').length,
  };
  return { issues, rows, summary };
}

export function describeCoverage(c) { return `${c.rows} filas · ${c.consumed} consumidas · ${c.withoutConsumer} declaradas sin mecanismo · ${c.notApplicable} no aplicables · ${c.missing} requeridas ausentes`; }
export { COVERAGE_STATES };
