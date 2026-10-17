// Agregados, distribuciones y comparación base/candidata (MOTOR-12 §8–§9). Reutiliza las fórmulas del catálogo de MOTOR-10: NO redefine posesión, TS ni ningún indicador; solo agrega
// sus numeradores y denominadores por partido. Dos agregaciones distintas y nunca intercambiables:
//   · tasa AGREGADA por exposición  = Σ numeradores / Σ denominadores de los partidos elegibles (el acierto global de triple no es la media de los porcentajes de partido);
//   · DISTRIBUCIÓN entre partidos   = cada partido aporta su valor individual elegible; con n propio, media, desviación muestral (n−1), mínimo, P05, P25, mediana, P75, P95 y máximo.
// Unidad de muestra: `team_games` (un equipo en un partido) para magnitudes de equipo; `match_count` para resultados de encuentros. Los fallidos, interrumpidos, pendientes y no válidos
// quedan fuera con su causa y nunca entran como ceros. Una exposición cero no es un cero observado.
import { describe } from './util.js';
import { CATALOG_BY_ID } from '../analysis/catalog.js';

export const AGG_VERSION = 'AGR-MOTOR12-R1';
export const QUANTILE_CONVENTION = 'cuantil interpolado: índice (n−1)·p con interpolación lineal entre posiciones contiguas (p ∈ [0,1]); desviación muestral n−1 (n<2: no calculable, vacío)';
const MAGNITUDES = [['pts', 'puntos'], ['pts_against', 'puntos'], ['fgm', 'conteo'], ['fga', 'conteo'], ['fg2m', 'conteo'], ['fg2a', 'conteo'], ['fg3m', 'conteo'], ['fg3a', 'conteo'], ['ftm', 'conteo'], ['fta', 'conteo'], ['oreb', 'conteo'], ['dreb', 'conteo'], ['reb', 'conteo'], ['ast', 'conteo'], ['tov', 'conteo'], ['stl', 'conteo'], ['blk', 'conteo'], ['pf', 'conteo'], ['possessions', 'posesiones'], ['finals', 'F cerradas'], ['points_f', 'puntos'], ['substitutions', 'sustituciones'], ['timeouts', 'tiempos muertos']];

const numOr = (x) => (x === '' || x == null ? null : Number(x));

// ---- población de un grupo: ejecuciones solicitadas y causa de exclusión de cada una
function exclusionOf(m) { if (m.exec_state === 'pendiente') return 'pendiente'; if (m.exec_state === 'en_curso') return 'en_curso'; if (m.exec_state === 'fallida') return 'fallida'; if (m.exec_state === 'interrumpida') return 'interrumpida'; if (!m.valid) return 'no_valida'; return null; }

// `execs`: filas lógicas (matchRows); `teamRows`: filas de equipos.csv (objetos) de los partidos válidos; `indRows`: indicadores.csv. Devuelve las tablas de agregados.
export function aggregate({ batchId, scope = 'lote', execs, teamRows, indRows, capRows = [] }) {
  const out = { indicadores: [], distribuciones: [], capacidades: [] };
  const execById = new Map(execs.map((m) => [m.match_id, m]));
  // equipos de cada ejecución (también las no válidas, para contar la población solicitada)
  const requested = []; // { variant, pair, team, match, exclusion }
  for (const m of execs) for (const [side, src] of [[0, m.home_source_team_id], [1, m.away_source_team_id]]) requested.push({ variant: m.variant_id, pair: m.pair_id, team: src, match: m.match_id, side, ex: exclusionOf(m), m });
  const groups = new Map(); // gkey → { type, variant, pair, team, reqs[] }
  const add = (type, variant, pair, team, r, side = '') => { const k = `${type}|${variant}|${pair}|${team}|${side}`; let g = groups.get(k); if (!g) { g = { type, variant, pair, team, side, reqs: [] }; groups.set(k, g); } g.reqs.push(r); };
  for (const r of requested) { add('equipo', r.variant, '', r.team, r); add('enfrentamiento', r.variant, r.m.pair_id, r.team, r); add('variante', r.variant, '', '*', r); add('localia', r.variant, '', '*', r, r.side === 0 ? 'home' : 'away'); }
  const teamRowIdx = new Map(teamRows.map((t) => [`${t.match_id}|${t.team_index}`, t]));
  const indIdx = new Map(); for (const r of indRows) { const k = `${r.match_id}|${r.team_index ?? ''}|${r.indicator_id}`; void k; }
  const indByMatchTeam = new Map(); for (const r of indRows) { const k = `${r.match_id}|${r.team_instance_id}`; if (!indByMatchTeam.has(k)) indByMatchTeam.set(k, new Map()); indByMatchTeam.get(k).set(r.indicator_id, r); }
  void indIdx;
  const instOf = (m, side) => (side === 0 ? m.home_team_instance_id : m.away_team_instance_id);
  const ids = [...new Set(indRows.map((r) => r.indicator_id))];
  const sortedGroups = [...groups.values()].sort((a, b) => `${a.type}|${a.variant}|${a.pair}|${a.team}|${a.side}`.localeCompare(`${b.type}|${b.variant}|${b.pair}|${b.team}|${b.side}`));
  for (const g of sortedGroups) {
    const nReq = g.reqs.length; const cause = (c) => g.reqs.filter((r) => r.ex === c).length; const valid = g.reqs.filter((r) => r.ex === null);
    const base = { batch_id: batchId, scope, variant_id: g.variant, group_type: g.type, pair_id: g.pair, source_team_id: g.team, side: g.side, n_requested: nReq, n_valid: valid.length, n_excl_pending: cause('pendiente') + cause('en_curso'), n_excl_failed: cause('fallida'), n_excl_interrupted: cause('interrumpida'), n_excl_invalid: cause('no_valida') };
    // indicadores del catálogo
    for (const id of ids) {
      const def = CATALOG_BY_ID[id]; let num = 0; let den = 0; const vals = []; let scale = null; let consistent = true; let elig = 0; let anyDen = false; let label = def?.label ?? id; let unit = def?.unit ?? ''; let cov = null; let statuses = new Set();
      for (const r of valid) {
        const row = indByMatchTeam.get(`${r.match}|${instOf(r.m, r.side)}`)?.get(id); if (!row) continue; cov = row.coverage; statuses.add(row.status); label = row.label ?? label; unit = row.unit ?? unit;
        const v = numOr(row.value); const n = numOr(row.num); const d = numOr(row.den);
        if (v != null) vals.push(v);
        if (v != null && n != null && d != null && d > 0) {
          elig += 1; num += n; den += d; anyDen = true;
          if (n !== 0) { const s = (v * d) / n; if (scale == null) scale = s; else if (Math.abs(s - scale) > 1e-6 * Math.max(1, Math.abs(scale))) consistent = false; }
        }
      }
      const pooledOk = anyDen && consistent && scale != null;
      const status = vals.length === 0 ? (statuses.has('no_registrado') ? 'no_registrado' : statuses.has('no_aplicable') ? 'no_aplicable' : 'sin_exposicion') : pooledOk ? 'ok' : anyDen ? 'escala_no_consistente' : 'no_agregable';
      out.indicadores.push({ ...base, indicator_id: id, label, unit, n_eligible: vals.length, n_excl_no_exposure: valid.length - vals.length, numerator_sum: anyDen ? num : null, denominator_sum: anyDen ? den : null, scale: pooledOk ? scale : null, pooled_value: pooledOk ? (scale * num) / den : null, status, coverage: cov, aggregation: 'tasa agregada = escala × Σ numeradores / Σ denominadores (partidos elegibles)', unit_of_sample: 'team_games' });
      const dsc = describe(vals); out.distribuciones.push({ ...base, indicator_id: id, label, unit, kind: 'indicador', n: dsc.n, mean: dsc.mean, sd: dsc.sd, min: dsc.min, p05: dsc.p05, p25: dsc.p25, p50: dsc.p50, p75: dsc.p75, p95: dsc.p95, max: dsc.max, convention: 'linear-(n-1)p / sample-n-1', unit_of_sample: 'team_games' });
    }
    // magnitudes de equipo y resultados
    const trs = valid.map((r) => teamRowIdx.get(`${r.match}|${r.side}`)).filter(Boolean);
    for (const [k, u] of MAGNITUDES) { const vals = trs.map((t) => numOr(t[k])).filter((x) => x != null); const dsc = describe(vals); out.distribuciones.push({ ...base, indicator_id: `MAG:${k}`, label: `Magnitud por partido: ${k}`, unit: u, kind: 'magnitud', n: dsc.n, mean: dsc.mean, sd: dsc.sd, min: dsc.min, p05: dsc.p05, p25: dsc.p25, p50: dsc.p50, p75: dsc.p75, p95: dsc.p95, max: dsc.max, convention: 'linear-(n-1)p / sample-n-1', unit_of_sample: 'team_games' }); }
    const diffs = trs.map((t) => numOr(t.pts) - numOr(t.pts_against)); const dd = describe(diffs); out.distribuciones.push({ ...base, indicator_id: 'RES_DIFF', label: 'Diferencia de puntos por partido (a favor − en contra)', unit: 'puntos', kind: 'resultado', n: dd.n, mean: dd.mean, sd: dd.sd, min: dd.min, p05: dd.p05, p25: dd.p25, p50: dd.p50, p75: dd.p75, p95: dd.p95, max: dd.max, convention: 'linear-(n-1)p / sample-n-1', unit_of_sample: 'match_count' });
    const decided = trs.filter((t) => t.win !== '' && t.win != null); const wins = decided.filter((t) => Number(t.win) === 1).length;
    out.indicadores.push({ ...base, indicator_id: 'RES_WIN', label: 'Victorias sobre resultados deportivos elegibles', unit: '%', n_eligible: decided.length, n_excl_no_exposure: valid.length - decided.length, numerator_sum: decided.length ? wins : null, denominator_sum: decided.length ? decided.length : null, scale: 100, pooled_value: decided.length ? (100 * wins) / decided.length : null, status: decided.length ? 'ok' : 'sin_exposicion', coverage: 'disponible', aggregation: 'victorias / partidos con ganador (los empates y los no válidos no cuentan)', unit_of_sample: 'match_count' });
    out.indicadores.push({ ...base, indicator_id: 'RES_DIFF', label: 'Diferencia de puntos media', unit: 'puntos/partido', n_eligible: diffs.length, n_excl_no_exposure: valid.length - diffs.length, numerator_sum: diffs.length ? diffs.reduce((a, b) => a + b, 0) : null, denominator_sum: diffs.length || null, scale: 1, pooled_value: diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null, status: diffs.length ? 'ok' : 'sin_exposicion', coverage: 'disponible', aggregation: 'Σ diferencia / partidos válidos', unit_of_sample: 'match_count' });
  }
  // capacidades: variante × equipo fuente × capacidad × tarea × rol (solo partidos válidos)
  const capAgg = new Map();
  for (const r of capRows) {
    const m = execById.get(r.match_id); if (!m || exclusionOf(m)) continue;
    const srcTeam = (r.team_instance_id === m.home_team_instance_id) ? m.home_source_team_id : m.away_source_team_id; const k = `${m.variant_id}|${srcTeam}|${r.capability}|${r.task}|${r.role}`;
    let a = capAgg.get(k); if (!a) { a = { variant_id: m.variant_id, source_team_id: srcTeam, capability: r.capability, task: r.task, role: r.role, uses: 0, matches: new Set(), actors: new Set(), w: 0, ws: 0, base: 0, eff: 0, contrib: 0 }; capAgg.set(k, a); }
    a.uses += Number(r.uses); a.matches.add(r.match_id); a.actors.add(r.source_player_id); a.w += Number(r.weight_sum); a.ws += Number(r.weight_share_sum); a.base += Number(r.base_sum); a.eff += Number(r.effective_sum); a.contrib += Number(r.contribution_sum);
  }
  for (const a of [...capAgg.values()].sort((x, y) => `${x.variant_id}|${x.source_team_id}|${x.capability}|${x.task}|${x.role}`.localeCompare(`${y.variant_id}|${y.source_team_id}|${y.capability}|${y.task}|${y.role}`))) {
    out.capacidades.push({ batch_id: batchId, scope, variant_id: a.variant_id, source_team_id: a.source_team_id, capability: a.capability, task: a.task, role: a.role, n_matches: a.matches.size, n_actors: a.actors.size, uses: a.uses, weight_sum: a.w, weight_share_sum: a.ws, base_mean: a.base / a.uses, effective_mean: a.eff / a.uses, contribution_sum: a.contrib, contribution_per_use: a.contrib / a.uses, unevaluated_opportunities: null, unevaluated_status: 'no registrado: el motor no cuenta oportunidades no evaluadas; no se infieren de las posesiones', note: 'Que una capacidad aparezca muchas veces no prueba impacto deportivo; sensibilidad y calibración son de MOTOR-13.' });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- lectura táctica (§8.4)
// Cada dimensión es un universo propio y compatible: los TIROS de campo válidos (calidad previa, familia, ficha de origen, contexto, cobertura y organización defensiva efectiva, con conversión), las POSESIONES
// beM (entrada/origen, con puntos vinculados y puntos por posesión) y las EJECUCIONES encadenadas (resultado local y procedencia). No se mezclan entre sí. Presión, memoria/rutas A/B, rotaciones y tiempos muertos
// no se agregan aquí: sus registros por partido están en eventos/decisiones y su cobertura se declara.
export const TACTICS_UNIVERSES = { tiro: 'tiros de campo válidos (no anulados ni con falta sin canasta)', posesion: 'posesiones beM (ataques activos) del equipo', ejecucion: 'ejecuciones encadenadas registradas' };
const TACTIC_DIMS = [
  ['tiro_calidad', 'tiro', 'quality'], ['tiro_familia', 'tiro', 'family'], ['tiro_origen', 'tiro', 'origin'], ['tiro_contexto', 'tiro', 'context'], ['tiro_cobertura', 'tiro', 'coverage'], ['tiro_organizacion_defensiva', 'tiro', 'def_org_effective'],
  ['posesion_entrada', 'posesion', 'entry'], ['posesion_origen', 'posesion', 'origin'], ['ejecucion_resultado', 'ejecucion', 'result'], ['ejecucion_procedencia', 'ejecucion', 'procedencia'], ['ejecucion_familia', 'ejecucion', 'family'],
];
export function aggregateTactics({ batchId, scope = 'lote', execs, shotRows, possRows, execRows }) {
  const byMatch = new Map(execs.map((m) => [m.match_id, m])); const out = new Map();
  const srcOf = (m, inst) => (inst === m.home_team_instance_id ? m.home_source_team_id : m.away_source_team_id);
  const valid = (m) => !!m && m.exec_state === 'terminada' && m.valid;
  const bump = (dim, universe, m, inst, cat, f) => {
    const team = srcOf(m, inst); const key = `${m.variant_id}|${team}|${dim}|${cat}`; let a = out.get(key);
    if (!a) { a = { batch_id: batchId, scope, variant_id: m.variant_id, source_team_id: team, dimension: dim, category: cat === '' || cat == null ? '(no registrado)' : cat, universe: TACTICS_UNIVERSES[universe], n: 0, made: 0, points: 0, matches: new Set() }; out.set(key, a); }
    a.n += 1; a.points += f.points ?? 0; a.made += f.made ?? 0; a.matches.add(m.match_id);
  };
  for (const [dim, u, col] of TACTIC_DIMS) {
    const rows = u === 'tiro' ? shotRows : u === 'posesion' ? possRows : execRows;
    for (const r of rows) { const m = byMatch.get(r.match_id); if (!valid(m)) continue; if (u === 'tiro' && r.valid !== 'true') continue; bump(dim, u, m, r.team_instance_id, r[col], u === 'tiro' ? { points: r.made === 'true' ? Number(r.points) : 0, made: r.made === 'true' ? 1 : 0 } : u === 'posesion' ? { points: Number(r.points) } : {}); }
  }
  const tot = new Map(); for (const a of out.values()) { const k = `${a.variant_id}|${a.source_team_id}|${a.dimension}`; tot.set(k, (tot.get(k) ?? 0) + a.n); }
  return [...out.values()].sort((x, y) => `${x.variant_id}|${x.source_team_id}|${x.dimension}|${x.category}`.localeCompare(`${y.variant_id}|${y.source_team_id}|${y.dimension}|${y.category}`)).map((a) => {
    const isShot = a.dimension.startsWith('tiro'); const isPoss = a.dimension.startsWith('posesion'); const total = tot.get(`${a.variant_id}|${a.source_team_id}|${a.dimension}`);
    return { batch_id: a.batch_id, scope: a.scope, variant_id: a.variant_id, source_team_id: a.source_team_id, dimension: a.dimension, category: a.category, universe: a.universe, unit_of_sample: 'team_games', n_matches: a.matches.size, n: a.n, share_pct: (100 * a.n) / total,
      made: isShot ? a.made : null, conversion_pct: isShot ? (100 * a.made) / a.n : null, points: isShot || isPoss ? a.points : null, points_per_unit: isShot ? a.points / a.n : isPoss ? a.points / a.n : null, points_unit: isShot ? 'puntos por tiro de campo' : isPoss ? 'puntos por posesión (partición por posesión)' : null,
      note: 'frecuencia y conversión descriptivas: no atribuyen causa; muestras pequeñas no demuestran superioridad' };
  });
}

// ---------------------------------------------------------------------------------------------------------------- comparación base / candidata (§9)
export function compare({ batchId, scope = 'lote', execs, teamRows, indRows, baseVariant, candVariants }) {
  const rows = []; const byCase = new Map();
  for (const m of execs) { if (!byCase.has(m.case_id)) byCase.set(m.case_id, new Map()); byCase.get(m.case_id).set(m.variant_id, m); }
  const indBy = new Map(); for (const r of indRows) indBy.set(`${r.match_id}|${r.team_instance_id}|${r.indicator_id}`, r);
  const ids = [...new Set(indRows.map((r) => r.indicator_id))]; const teamBy = new Map(teamRows.map((t) => [`${t.match_id}|${t.team_index}`, t]));
  const inst = (m, side) => (side === 0 ? m.home_team_instance_id : m.away_team_instance_id); const src = (m, side) => (side === 0 ? m.home_source_team_id : m.away_source_team_id);
  const ok = (m) => !!m && exclusionOf(m) === null;
  for (const cand of candVariants) {
    // grupos: lote (todos), por equipo fuente y por enfrentamiento
    const groups = new Map();
    const touch = (type, pair, team, c, side) => { const k = `${type}|${pair}|${team}`; if (!groups.has(k)) groups.set(k, { type, pair, team, items: [] }); groups.get(k).items.push({ c, side }); };
    for (const [caseId, vs] of byCase) {
      const b = vs.get(baseVariant); const a = vs.get(cand); const ref = b ?? a; if (!ref) continue;
      for (const side of [0, 1]) { touch('variante', '', '*', { caseId, b, a }, side); touch('equipo', '', src(ref, side), { caseId, b, a }, side); touch('enfrentamiento', ref.pair_id, src(ref, side), { caseId, b, a }, side); }
    }
    for (const g of [...groups.values()].sort((x, y) => `${x.type}|${x.pair}|${x.team}`.localeCompare(`${y.type}|${y.pair}|${y.team}`))) {
      const paired = g.items.filter(({ c }) => ok(c.b) && ok(c.a)); const incomplete = g.items.length - paired.length;
      const onlyBase = g.items.filter(({ c }) => ok(c.b) && !ok(c.a)).length; const onlyCand = g.items.filter(({ c }) => !ok(c.b) && ok(c.a)).length;
      const meta = { batch_id: batchId, scope, group_type: g.type, pair_id: g.pair, source_team_id: g.team, base_variant: baseVariant, candidate_variant: cand, n_cases_total: g.items.length, n_cases_paired: paired.length, n_cases_incomplete: incomplete, n_valid_base_only: onlyBase, n_valid_candidate_only: onlyCand };
      const metrics = [...ids.map((id) => ({ id, get: (m, side) => indBy.get(`${m.match_id}|${inst(m, side)}|${id}`) })), { id: 'MAG:pts', get: (m, side) => { const t = teamBy.get(`${m.match_id}|${side}`); return t ? { value: t.pts, num: t.pts, den: 1, unit: 'puntos' } : null; } }, { id: 'RES_DIFF', get: (m, side) => { const t = teamBy.get(`${m.match_id}|${side}`); return t ? { value: Number(t.pts) - Number(t.pts_against), num: Number(t.pts) - Number(t.pts_against), den: 1, unit: 'puntos' } : null; } }];
      for (const mt of metrics) {
        let bn = 0; let bd = 0; let an = 0; let ad = 0; let scale = null; let consistent = true; const diffs = []; let unit = ''; let n = 0;
        for (const { c, side } of paired) {
          const rb = mt.get(c.b, side); const ra = mt.get(c.a, side); if (!rb || !ra) continue; unit = rb.unit ?? ra.unit ?? unit;
          const vb = numOr(rb.value); const va = numOr(ra.value); if (vb == null || va == null) continue; n += 1; diffs.push(va - vb);
          for (const [r, which] of [[rb, 'b'], [ra, 'a']]) { const nn = numOr(r.num); const dd = numOr(r.den); if (nn == null || dd == null || !(dd > 0)) continue; if (which === 'b') { bn += nn; bd += dd; } else { an += nn; ad += dd; } const v = numOr(r.value); if (nn !== 0 && v != null) { const s = (v * dd) / nn; if (scale == null) scale = s; else if (Math.abs(s - scale) > 1e-6 * Math.max(1, Math.abs(scale))) consistent = false; } }
        }
        const dsc = describe(diffs); const pooled = n > 0 && bd > 0 && ad > 0 && scale != null && consistent;
        rows.push({ ...meta, indicator_id: mt.id, unit, n_eligible_pairs: n, base_numerator: pooled ? bn : null, base_denominator: pooled ? bd : null, base_rate: pooled ? (scale * bn) / bd : null, candidate_numerator: pooled ? an : null, candidate_denominator: pooled ? ad : null, candidate_rate: pooled ? (scale * an) / ad : null,
          diff_of_rates: pooled ? (scale * an) / ad - (scale * bn) / bd : null, mean_case_diff: dsc.mean, sd_case_diff: dsc.sd, min_case_diff: dsc.min, p50_case_diff: dsc.p50, max_case_diff: dsc.max,
          note: n === 0 ? 'sin pares elegibles: no se rellena ningún lado' : 'diferencia de tasas agregadas (candidata − base) y media de diferencias por caso son medidas distintas; misma semilla no garantiza los mismos sorteos tras una decisión distinta: no es un efecto causal aislado' });
      }
    }
  }
  return rows;
}
export const AGG_TABLES = {
  indicadores: ['batch_id', 'scope', 'variant_id', 'group_type', 'pair_id', 'source_team_id', 'side', 'indicator_id', 'label', 'unit', 'unit_of_sample', 'n_requested', 'n_valid', 'n_eligible', 'n_excl_pending', 'n_excl_failed', 'n_excl_interrupted', 'n_excl_invalid', 'n_excl_no_exposure', 'numerator_sum', 'denominator_sum', 'scale', 'pooled_value', 'status', 'coverage', 'aggregation'],
  distribuciones: ['batch_id', 'scope', 'variant_id', 'group_type', 'pair_id', 'source_team_id', 'side', 'indicator_id', 'label', 'unit', 'kind', 'unit_of_sample', 'n_requested', 'n_valid', 'n_excl_pending', 'n_excl_failed', 'n_excl_interrupted', 'n_excl_invalid', 'n', 'mean', 'sd', 'min', 'p05', 'p25', 'p50', 'p75', 'p95', 'max', 'convention'],
  comparaciones: ['batch_id', 'scope', 'group_type', 'pair_id', 'source_team_id', 'base_variant', 'candidate_variant', 'indicator_id', 'unit', 'n_cases_total', 'n_cases_paired', 'n_cases_incomplete', 'n_valid_base_only', 'n_valid_candidate_only', 'n_eligible_pairs', 'base_numerator', 'base_denominator', 'base_rate', 'candidate_numerator', 'candidate_denominator', 'candidate_rate', 'diff_of_rates', 'mean_case_diff', 'sd_case_diff', 'min_case_diff', 'p50_case_diff', 'max_case_diff', 'note'],
  tactica: ['batch_id', 'scope', 'variant_id', 'source_team_id', 'dimension', 'category', 'universe', 'unit_of_sample', 'n_matches', 'n', 'share_pct', 'made', 'conversion_pct', 'points', 'points_per_unit', 'points_unit', 'note'],
  capacidades: ['batch_id', 'scope', 'variant_id', 'source_team_id', 'capability', 'task', 'role', 'n_matches', 'n_actors', 'uses', 'weight_sum', 'weight_share_sum', 'base_mean', 'effective_mean', 'contribution_sum', 'contribution_per_use', 'unevaluated_opportunities', 'unevaluated_status', 'note'],
};
