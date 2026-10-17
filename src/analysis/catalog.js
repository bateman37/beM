// Catálogo común de indicadores (MOTOR-10 §5.1 y §6). Un indicador = una definición + una función de cálculo. La misma definición alimenta tabla, gráfico,
// resumen, informe y exportación; no hay cinco fórmulas de PPP con el mismo nombre. No se fabrican ceros para indicadores no registrados:
// la cobertura declara «no registrado» o «dependiente de datos» con la dependencia concreta.
import { ratio, pctOf, eFG, TS, threeRate, ftPerFg, fgPointsPerAttempt, rating, tovPctConv, orebPctActa, drebPctActa, flatTotals, FT_COEF, ANALYSIS_VERSION } from './formulas.js';
import { ACTA_POLICY_ID } from '../match/acta.js';
import { assistReading, validShots } from './shooting.js';
import { closureShare, productionPer100, CREDITS } from './closures.js';

const COVER = { ok: 'disponible', partial: 'parcial', none: 'no registrado', dep: 'dependiente de datos', na: 'no aplicable' };
export const COVERAGE_STATES = COVER;
const ind = (id, label, group, nature, unit, d) => ({ id, label, group, nature, unit, version: 'R1', info: 'public', coverage: COVER.ok, scope: 'game', ...d });

// `scope`: 'shots' admite filtros de tiro (hechos); 'game' calcula sobre el partido completo y NO admite filtros de tiro; 'players' requiere un jugador.
export const CATALOG = [
  // ---- acta y tiro (hechos)
  ind('TC_PCT', 'TC %', 'Tiro', 'conteo', '%', { scope: 'shots', source: 'hechos shot (acta)', universe: 'intentos de campo válidos del equipo', calc: '100 × TCC/TCI', time: 'momento del tiro', evidence: 'ids de tiros', sample: 5,
    fn: (q) => { const v = validShots(q.shots); return { ...pctOf(v.filter((s) => s.made).length, v.length), evidence: v.map((s) => s.id), n: v.length }; } }),
  ind('T2_PCT', 'T2 %', 'Tiro', 'conteo', '%', { scope: 'shots', source: 'hechos shot', universe: 'intentos de dos válidos', calc: '100 × T2C/T2I', time: 'momento del tiro', sample: 5,
    fn: (q) => { const v = validShots(q.shots).filter((s) => s.zone !== 'three'); return { ...pctOf(v.filter((s) => s.made).length, v.length), evidence: v.map((s) => s.id), n: v.length }; } }),
  ind('T3_PCT', 'T3 %', 'Tiro', 'conteo', '%', { scope: 'shots', source: 'hechos shot', universe: 'triples intentados válidos', calc: '100 × T3C/T3I', time: 'momento del tiro', sample: 5,
    fn: (q) => { const v = validShots(q.shots).filter((s) => s.zone === 'three'); return { ...pctOf(v.filter((s) => s.made).length, v.length), evidence: v.map((s) => s.id), n: v.length }; } }),
  ind('EFG', 'eFG %', 'Tiro', 'razón', '%', { scope: 'shots', source: 'hechos shot', universe: 'intentos de campo válidos', calc: '100 × (TCC + 0,5 × T3C)/TCI (puede superar 100 %)', time: 'momento del tiro', sample: 5,
    fn: (q) => { const v = validShots(q.shots); const m = v.filter((s) => s.made); return { ...ratio(m.length + 0.5 * m.filter((s) => s.zone === 'three').length, v.length, { scale: 100, unit: '%', reason: 'sin tiros de campo' }), evidence: v.map((s) => s.id), n: v.length }; } }),
  ind('FREQ3', 'Frecuencia de triple', 'Tiro', 'descriptor', '%', { scope: 'shots', source: 'hechos shot', universe: 'intentos de campo válidos', calc: '100 × T3I/TCI (distribución, no acierto)', time: 'momento del tiro',
    fn: (q) => { const v = validShots(q.shots); return { ...pctOf(v.filter((s) => s.zone === 'three').length, v.length), evidence: v.map((s) => s.id), n: v.length }; } }),
  ind('FGPPA', 'Puntos de campo por intento', 'Tiro', 'razón', 'pts/TCI', { scope: 'shots', source: 'hechos shot', universe: 'intentos de campo válidos', calc: '(2 × T2C + 3 × T3C)/TCI; excluye libres', time: 'momento del tiro',
    fn: (q) => { const v = validShots(q.shots); const pts = v.filter((s) => s.made).reduce((a, s) => a + s.points, 0); return { ...ratio(pts, v.length, { unit: 'pts/TCI', reason: 'sin tiros de campo' }), evidence: v.map((s) => s.id), n: v.length }; } }),
  ind('AST_PCT', 'Canastas asistidas %', 'Tiro', 'razón', '%', { scope: 'shots', source: 'créditos AS-C del acta', universe: 'canastas de campo válidas elegibles (no usa AS-L ni AS total)', calc: '100 × AS_C/canastas elegibles', time: 'momento del tiro', coverage: COVER.partial, note: 'Criterio de asistencia: convención beM sobre S09-03 cap. 6 (extracto de ChatGPT; PDF no leído).',
    fn: (q) => { const made = validShots(q.shots).filter((s) => s.made); return { ...pctOf(made.filter((s) => s.credit).length, made.length), evidence: made.map((s) => s.id), n: made.length }; } }),
  // ---- partido completo (universos de posesión/F/acta)
  ind('FT_PCT', 'TL %', 'Tiro', 'conteo', '%', { source: 'acta (series)', universe: 'libres válidos', calc: '100 × TLC/TLI', time: 'partido', sample: 5, fn: (q) => { const t = flatTotals(q.acta.teams[q.team]); return { ...pctOf(t.ftm, t.fta), evidence: [], n: t.fta }; } }),
  ind('TS', 'TS % estimado', 'Tiro', 'estimación convencional', '%', { source: 'acta', universe: 'partido', calc: '100 × PTS/[2 × (TCI + 0,44 × TLI)]', time: 'partido', note: 'Convención estimada (0,44), no oportunidades exactas.', fn: (q) => ({ ...TS(flatTotals(q.acta.teams[q.team]), q.params.conventions.ftCoefficient), evidence: [] }) }),
  ind('FT_PER_FG', 'Libres por tiro de campo', 'Tiro', 'razón', 'TLI/TCI', { source: 'acta', universe: 'partido', calc: 'TLI/TCI (por 100 multiplica por 100)', time: 'partido', fn: (q) => ({ ...ftPerFg(flatTotals(q.acta.teams[q.team])), evidence: [] }) }),
  ind('PTS_F', 'Puntos por F', 'Posesión', 'razón', 'pts/F', { source: 'finalizaciones F del acta', universe: 'F cerradas del equipo', calc: 'PTS_F/F cerradas (excluye sanción no de tiro y administración)', time: 'partido', coverage: COVER.ok,
    fn: (q) => { const F = q.acta.finals.filter((f) => f.team === q.team && f.closed); return { ...ratio(F.reduce((s, f) => s + f.points, 0), F.length, { unit: 'pts/F', reason: 'sin F cerradas' }), evidence: F.map((f) => f.event), n: F.length }; } }),
  ind('ORTG', 'ORtg global', 'Eficiencia', 'razón', 'pts/100', { source: 'acta + posesiones beM', universe: 'posesiones del equipo', calc: '100 × PTS_A/P_A (incluye administrativos bajo política global)', time: 'partido', fn: (q) => { const P = q.acta.possessions.filter((p) => p.team === q.team).length; return { ...rating(q.acta.teams[q.team].points, P), evidence: [], n: P }; } }),
  ind('DRTG', 'DRtg global', 'Eficiencia', 'razón', 'pts/100', { source: 'acta + posesiones beM', universe: 'posesiones del rival', calc: '100 × PTS_B/P_B', time: 'partido', fn: (q) => { const P = q.acta.possessions.filter((p) => p.team !== q.team).length; return { ...rating(q.acta.teams[1 - q.team].points, P), evidence: [], n: P }; } }),
  ind('NETRTG', 'NetRtg', 'Eficiencia', 'razón', 'pts/100', { source: 'acta', universe: 'universos compatibles', calc: 'ORtg − DRtg', time: 'partido', fn: (q) => { const a = q.acta.possessions.filter((p) => p.team === q.team).length; const b = q.acta.possessions.length - a; const o = rating(q.acta.teams[q.team].points, a); const d = rating(q.acta.teams[1 - q.team].points, b); return o.value == null || d.value == null ? { value: null, unit: 'pts/100', reason: 'universo incompleto', evidence: [] } : { value: o.value - d.value, unit: 'pts/100', num: null, den: a + b, evidence: [] }; } }),
  ind('PACE', 'Ritmo', 'Eficiencia', 'razón', 'posesiones/40 min', { source: 'acta, duración disputada', universe: 'partido', calc: 'L × [(P_A + P_B)/2]/D (prórrogas en D, pausas fuera)', time: 'partido', fn: (q) => { const D = q.totalTenths / 600; const L = q.params.regulationMinutes ?? 40; const a = q.acta.possessions.filter((p) => p.team === 0).length; const b = q.acta.possessions.filter((p) => p.team === 1).length; return { ...ratio(L * ((a + b) / 2), D, { unit: 'posesiones/L', reason: 'duración disputada cero' }), evidence: [], n: a + b }; } }),
  ind('PER100', 'PER por 100 ataques', 'Control', 'razón', 'PER/100', { source: 'acta + posesiones beM', universe: 'posesiones del equipo', calc: '100 × PER/P (exacto bajo la convención beM)', time: 'partido', fn: (q) => { const P = q.acta.possessions.filter((p) => p.team === q.team).length; return { ...ratio(q.acta.teams[q.team].totals.tov, P, { scale: 100, unit: 'PER/100', reason: 'sin posesiones' }), evidence: [], n: P }; } }),
  ind('TOV_CONV', 'TOV % convencional', 'Control', 'estimación convencional', '%', { source: 'acta', universe: 'partido', calc: '100 × PER/(TCI + 0,44 × TLI + PER)', time: 'partido', note: 'Estimación distinta de PER por 100 ataques.', fn: (q) => ({ ...tovPctConv(flatTotals(q.acta.teams[q.team]), q.params.conventions.ftCoefficient), evidence: [] }) }),
  ind('POSS_EST', 'Posesiones estimadas', 'Control', 'estimación convencional', 'posesiones', { source: 'acta', universe: 'partido', calc: 'TCI + 0,44 × TLI − RO + PER (no sustituye P registrado)', time: 'partido', fn: (q) => { const x = flatTotals(q.acta.teams[q.team]); return { value: x.fga + q.params.conventions.ftCoefficient * x.fta - x.oreb + x.tov, num: null, den: null, unit: 'posesiones', evidence: [] }; } }),
  ind('OREB_PCT', 'RO % de acta', 'Rebote', 'razón', '%', { source: 'acta', universe: 'RO propios + RD rivales', calc: '100 × RO_A/(RO_A + RD_B)', time: 'partido', note: 'Política colectiva uniforme.', fn: (q) => ({ ...orebPctActa(flatTotals(q.acta.teams[q.team]), flatTotals(q.acta.teams[1 - q.team])), evidence: [] }) }),
  ind('DREB_PCT', 'RD % de acta', 'Rebote', 'razón', '%', { source: 'acta', universe: 'RD propios + RO rivales', calc: '100 × RD_A/(RD_A + RO_B)', time: 'partido', fn: (q) => ({ ...drebPctActa(flatTotals(q.acta.teams[q.team]), flatTotals(q.acta.teams[1 - q.team])), evidence: [] }) }),
  ind('STL100', 'REC por 100 ataques rivales', 'Defensa', 'razón', 'REC/100', { source: 'acta', universe: 'posesiones rivales', calc: '100 × REC/P rival elegible (no todas las recuperaciones)', time: 'partido', fn: (q) => { const P = q.acta.possessions.filter((p) => p.team !== q.team).length; return { ...ratio(q.acta.teams[q.team].totals.stl, P, { scale: 100, unit: 'REC/100', reason: 'sin posesiones rivales' }), evidence: [], n: P }; } }),
  ind('BLK_RIV', 'Tapones sobre tiros rivales', 'Defensa', 'razón', '%', { source: 'acta', universe: 'TCI rivales válidos (de campo, dos y tres)', calc: '100 × TAP/TCI rivales elegibles; universo declarado: todos los tiros de campo rivales', time: 'partido', fn: (q) => { const r = q.acta.teams[1 - q.team].totals; return { ...pctOf(q.acta.teams[q.team].totals.blk, r.fga), evidence: [], n: r.fga }; } }),
  ind('FOUL_RATE', 'Faltas por 100 ataques rivales', 'Disciplina', 'razón', 'FC/100', { source: 'acta', universe: 'posesiones rivales', calc: '100 × FC/P rival', time: 'partido', fn: (q) => { const P = q.acta.possessions.filter((p) => p.team !== q.team).length; return { ...ratio(q.acta.teams[q.team].totals.pf, P, { scale: 100, unit: 'FC/100', reason: 'sin posesiones rivales' }), evidence: [], n: P }; } }),
  // ---- no disponibles (se declaran, no se rellenan con cero)
  ind('REB_OPP', 'Rebote por oportunidad', 'Rebote', 'razón', '%', { coverage: COVER.partial, source: 'ofertas de rebote registradas', universe: 'capturas elegibles/ofertas registradas', calc: '100 × capturas elegibles/ofertas registradas', time: 'partido', note: 'Solo con diagnóstico: las ofertas por jugador (candidatos) se conservan en el hecho de rebote, pero no son información pública.', info: 'diag',
    fn: (q) => { if (q.audience !== 'diagnostic') return { value: null, reason: 'información diagnóstica: no disponible para esta audiencia', evidence: [] }; const rb = q.events.filter((e) => e.type === 'rebound' && e.team !== undefined); const offered = rb.length; const captured = rb.filter((e) => (e.stats ?? []).some((x) => x.k === 'reb' && x.team === q.team)).length; return { ...pctOf(captured, offered), evidence: rb.map((e) => e.id), n: offered }; } }),
  ind('CLOSE_SHARE', 'Cuota de cierres de posesión', 'Jugador', 'conteo', '%', { scope: 'players', source: 'posesiones activas y hechos de cierre', universe: 'cierres elegibles del equipo (colectivos o sin actor con fila propia)', calc: '100 × cierres atribuibles al jugador / cierres elegibles del equipo', time: 'partido', info: 'public', note: 'Autoría causal: canasta, último libre, tiro que acaba en rebote defensivo o tapón, pérdida con actor. Fin de periodo, balón suelto y pérdida de equipo = cierre colectivo. No es USG.',
    fn: () => ({ value: null, reason: 'consulta individual: elige un jugador en la ficha de Análisis › Acta y comparación', evidence: [] }) }),
  ind('PROD100', 'Producción por 100 ataques completos con presencia completa', 'Jugador', 'razón', 'créditos/100', { scope: 'players', source: 'acta + posesiones + presencia', universe: 'ataques completos del equipo (créditos ofensivos) o rivales (defensivos) con el jugador presente toda la unidad', calc: '100 × créditos elegibles / ataques completos correspondientes', time: 'partido', info: 'public', note: 'Mismas unidades en numerador y denominador; mixtas y parciales aparte; no es un ORtg/DRtg individual.',
    fn: () => ({ value: null, reason: 'consulta individual: elige un jugador en la ficha de Análisis › Acta y comparación', evidence: [] }) }),
  ind('HIST_PCTL', 'Media de temporada y percentiles', 'Historia', 'descriptor', '', { coverage: COVER.dep, source: 'historial de partidos', universe: 'varios encuentros compatibles', calc: '—', time: '—', note: 'No existe historial accesible: dependiente de datos (no es un cero).', fn: () => ({ value: null, reason: 'dependiente de datos: no existe historial de encuentros', evidence: [] }) }),
  ind('MATES', 'Mates', 'Tiro', 'conteo', '', { coverage: COVER.none, source: 'no representados por el motor', universe: '—', calc: '—', time: '—', note: 'El motor no representa mates (campo no registrado).', fn: () => ({ value: null, reason: 'no registrado: el motor no representa mates', evidence: [] }) }),
];
void CREDITS;
export const CATALOG_BY_ID = Object.fromEntries(CATALOG.map((c) => [c.id, c]));

// Indicadores por jugador (formulario individual): X por 40, ratio AS/PER, USG estimado, cuotas de F y de rebote.
export function playerIndicators(ix, pid, FT_COEF = 0.44) {
  const l = ix.acta.players[pid]; const t = ix.acta.teams[l.team].totals; const D = ix.totalTenths / 600;
  const tm = flatTotals(ix.acta.teams[l.team]);
  const F = ix.acta.finals.filter((f) => f.team === l.team); const myF = F.filter((f) => f.shooter === pid);
  const rows = [
    { id: 'PTS40', label: 'Puntos por 40 minutos', ...ratio(40 * l.pts, l.min, { unit: 'por 40 min', reason: 'sin minutos' }), universe: 'minutos jugados', note: 'Extrapolación descriptiva, no predicción.' },
    { id: 'RT40', label: 'Rebotes por 40 minutos', ...ratio(40 * l.reb, l.min, { unit: 'por 40 min', reason: 'sin minutos' }), universe: 'minutos jugados' },
    { id: 'AST_PER', label: 'Ratio AS/PER', ...(l.tov > 0 ? ratio(l.ast, l.tov, { unit: 'AS/PER' }) : { value: null, num: l.ast, den: 0, unit: 'AS/PER', reason: 'PER = 0: se muestran los conteos, no hay ratio finito' }), universe: 'créditos del jugador' },
    { id: 'USG', label: 'USG estimado', ...ratio(100 * (l.fga + FT_COEF * l.fta + l.tov) * D, l.min * (tm.fga + FT_COEF * tm.fta + tm.tov), { unit: '%', reason: 'sin minutos o sin acciones de equipo' }), universe: 'aproximación por tiempo; no mide cuánto organiza el jugador' },
    { id: 'F_SHARE', label: 'Cuota de F', ...pctOf(myF.length, F.length), universe: 'F del equipo (descripción de finalización, no dirección)' },
    { id: 'CLOSE_SHARE', label: 'Cuota de cierres de posesión', ...closureShare(ix, pid), universe: 'cierres elegibles del equipo (posesiones activas; los colectivos o sin actor tienen fila propia)', note: 'Cierre atribuible = quien realizó la acción que cerró la posesión; no es USG ni mide cuánto organiza.' },
    ...['pts', 'ast', 'oreb', 'stl'].map((k) => { const r = productionPer100(ix, pid, k); return { id: `PROD100_${k.toUpperCase()}`, ...r, universe: `${r.complete.attacks} ataques completos con presencia completa (${r.mixed.attacks} mixtos y ${r.partial.attacks} parciales aparte)` }; }),
    { id: 'REB_SHARE', label: 'Cuota de rebote', ...pctOf(l.reb, t.reb), universe: 'rebotes de equipo (no probabilidad de capturar)' },
    { id: 'TS_PLAYER', label: 'TS % estimado', ...TS({ pts: l.pts, fga: l.fga, fta: l.fta }), universe: 'convención 0,44' },
  ];
  return rows;
}

// Resultado estándar de una consulta (§5.2): valor, conteos base, unidad, universo/filtros, muestra, exclusiones, cobertura y versiones.
export function runIndicator(def, q) {
  const base = { id: def.id, label: def.label, group: def.group, nature: def.nature, unit: def.unit, universe: def.universe, calc: def.calc, time: def.time, source: def.source, coverage: def.coverage, note: def.note ?? null,
    filters: q.filterInfo?.filters ?? {}, versions: { analysis: ANALYSIS_VERSION, indicator: def.version, acta: ACTA_POLICY_ID, policy: q.params.policy } };
  if (def.info === 'diag' && q.audience !== 'diagnostic') return { ...base, value: null, display: '—', reason: 'información diagnóstica: no disponible para esta audiencia', evidence: [] };
  if (q.filtered && def.scope !== 'shots') return { ...base, value: null, display: '—', incompatible: true, reason: `${def.label} usa el partido completo (posesiones/F/acta): un filtro de tiros no lo habilita; usa la métrica de tiro adecuada o quita el filtro`, evidence: [] };
  const r = def.fn(q); const n = r.n ?? r.den ?? null;
  const warn = def.sample != null && n != null && n < q.params.sample.warnBelow;
  const display = r.value == null ? '—' : `${(Math.round(r.value * 10) / 10).toFixed(1)}${def.unit === '%' ? ' %' : ''}`;
  return { ...base, value: r.value, num: r.num ?? null, den: r.den ?? null, display, reason: r.reason ?? null, sample: { n, warn, message: warn ? `muestra de ${n} observaciones (< ${q.params.sample.warnBelow}): aviso editorial, no significación estadística` : null }, exclusions: q.filterInfo?.excluded ?? 0, evidence: r.evidence ?? [] };
}
