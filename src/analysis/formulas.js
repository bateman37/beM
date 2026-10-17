// Fórmulas de MOTOR-10 §6.2 (funciones puras). Cada razón devuelve { value, num, den, unit, reason } con numerador y denominador del MISMO universo.
// Sin denominador válido: value = null y `reason` explica el motivo (se muestra «—», nunca 0, infinito ni NaN). El redondeo es de presentación.
export const ANALYSIS_VERSION = 'ANA-MOTOR10-R1';
export const FT_COEF = 0.44; // coeficiente de las estimaciones convencionales (TS %, TOV %, posesiones estimadas); parámetro de análisis, no multiplicador deportivo

export function ratio(num, den, { scale = 1, unit = '', minDen = 0, reason = 'sin denominador válido' } = {}) {
  if (!(den > minDen)) return { value: null, num, den, unit, reason };
  return { value: (scale * num) / den, num, den, unit, reason: null };
}
export const pctOf = (num, den) => ratio(num, den, { scale: 100, unit: '%', reason: 'sin intentos' });

// Agregación ponderada: suma(numeradores)/suma(denominadores). Nunca promedia porcentajes de tramos con distinto número de intentos.
export function pooled(parts, opts = {}) {
  let n = 0; let d = 0; for (const p of parts) { n += p.num ?? 0; d += p.den ?? 0; }
  return ratio(n, d, opts);
}

export const fmtVal = (r, digits = 1) => (r == null || r.value == null ? '—' : `${(Math.round(r.value * 10 ** digits) / 10 ** digits).toFixed(digits)}${r.unit === '%' ? ' %' : ''}`);

export const eFG = (t) => ratio(t.fgm + 0.5 * t.fg3m, t.fga, { scale: 100, unit: '%', reason: 'sin tiros de campo' });
export const TS = (t, c = FT_COEF) => ratio(t.pts, 2 * (t.fga + c * t.fta), { scale: 100, unit: '%', reason: 'sin tiros de campo ni libres' });
export const threeRate = (t) => pctOf(t.fg3a, t.fga);
export const ftPerFg = (t) => ratio(t.fta, t.fga, { unit: 'TLI/TCI', reason: 'sin tiros de campo' });
export const fgPointsPerAttempt = (t) => ratio(2 * t.fg2m + 3 * t.fg3m, t.fga, { unit: 'pts/TCI', reason: 'sin tiros de campo' });
export const assistedPct = (astFg, eligible) => pctOf(astFg, eligible); // solo AS-C sobre canastas de campo elegibles
export const rating = (pts, poss) => ratio(pts, poss, { scale: 100, unit: 'pts/100', reason: 'sin posesiones' });
export const pace = (L, pA, pB, D) => ratio(L * ((pA + pB) / 2), D, { unit: 'posesiones/L', reason: 'duración disputada cero' });
export const turnoverPer100 = (per, poss) => ratio(per, poss, { scale: 100, unit: 'PER/100', reason: 'sin posesiones' });
export const tovPctConv = (t, c = FT_COEF) => ratio(t.tov, t.fga + c * t.fta + t.tov, { scale: 100, unit: '%', reason: 'sin tiros ni pérdidas' });
export const estPossessions = (t, c = FT_COEF) => t.fga + c * t.fta - t.oreb + t.tov;
export const orebPctActa = (a, b) => pctOf(a.oreb, a.oreb + b.dreb);
export const drebPctActa = (a, b) => pctOf(a.dreb, a.dreb + b.oreb);
export const per40 = (x, minTenths) => ratio(40 * x, minTenths / 600, { unit: 'por 40 min', reason: 'sin minutos' });
export const perMin = (x, minTenths) => ratio(x, minTenths / 600, { unit: 'por minuto', reason: 'sin minutos' });
export const astPerTov = (ast, tov) => (tov > 0 ? ratio(ast, tov, { unit: 'AS/PER' }) : { value: null, num: ast, den: tov, unit: 'AS/PER', reason: 'PER = 0: sin ratio finito' });
export const usgEst = (p, team, D, c = FT_COEF) => ratio(100 * (p.fga + c * p.fta + p.tov) * D, (p.minTenths / 600) * (team.fga + c * team.fta + team.tov), { unit: '%', reason: 'sin minutos o sin acciones de equipo' });

// Diferencia de porcentajes: puntos porcentuales con las muestras de ambos lados (o ausencia de cálculo si falta una).
export function diffPct(a, b) {
  if (a.value == null || b.value == null) return { value: null, unit: 'pp', reason: a.value == null ? 'sin exposición en el primer lado' : 'sin exposición en el segundo lado', denA: a.den, denB: b.den };
  return { value: a.value - b.value, unit: 'pp', reason: null, denA: a.den, denB: b.den };
}
// Diferencia observada con/sin (on/off): solo si hay exposición completa en ambas mitades.
export function diffRate(on, off) {
  if (on.value == null || off.value == null) return { value: null, unit: on.unit, reason: 'sin posesiones completas en una de las dos mitades de la comparación (no se muestra 0)', denOn: on.den, denOff: off.den };
  return { value: on.value - off.value, unit: on.unit, reason: null, denOn: on.den, denOff: off.den };
}

// Totales de equipo en forma plana para las fórmulas.
export function flatTotals(T) { const x = T.totals; return { pts: x.pts, fgm: x.fgm, fga: x.fga, fg2m: x.fg2m, fg2a: x.fg2a, fg3m: x.fg3m, fg3a: x.fg3a, ftm: x.ftm, fta: x.fta, oreb: x.oreb, dreb: x.dreb, tov: x.tov, ast: x.ast, astFg: x.astFg, stl: x.stl, blk: x.blk, min: x.min }; }
