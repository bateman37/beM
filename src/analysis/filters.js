// Filtro común de MOTOR-10 (§14). Cada vista declara si filtra HECHOS (tiros/créditos), UNIDADES (posesiones) o TRAMOS (presencia): un filtro de tiros no habilita
// PPP con todas las posesiones del partido; se explica la incompatibilidad. Las consultas guardan el filtro normalizado y lo conservan al abrir el detalle y al exportar.
import { inAdjustedFinal } from './evolution.js';

export const FILTER_FIELDS = {
  period: { label: 'Periodo', levels: ['shots', 'possessions'] },
  scoreState: { label: 'Marcador previo (delante/empate/detrás respecto del sujeto)', levels: ['shots', 'possessions'] },
  marginMax: { label: 'Margen previo absoluto máximo', levels: ['shots', 'possessions'] },
  adjustedFinal: { label: 'Final ajustado (120 s / 5 puntos previos, configurable)', levels: ['shots', 'possessions'] },
  clockEnd: { label: 'Final de reloj de posesión', levels: ['shots'] },
  zone: { label: 'Valor/sector', levels: ['shots'] },
  quality: { label: 'Calidad previa', levels: ['shots'] },
  result: { label: 'Resultado del intento', levels: ['shots'] },
  shooter: { label: 'Jugador que finaliza', levels: ['shots'] },
  defender: { label: 'Defensor en el intento', levels: ['shots'] },
  family: { label: 'Familia ofensiva', levels: ['shots'] },
  coverage: { label: 'Cobertura ejecutada', levels: ['shots'] },
  procedencia: { label: 'Procedencia de la decisión (propia)', levels: ['shots'], own: true },
  priority: { label: 'Prioridad conocida (propia)', levels: ['shots'], own: true },
  director: { label: 'Director (propio)', levels: ['shots'], own: true },
  origin: { label: 'Origen ofensivo', levels: ['possessions'] },
  entry: { label: 'Origen de entrada', levels: ['possessions'] },
};
export const normalizeFilters = (f) => { const o = {}; for (const k of Object.keys(f ?? {}).sort()) if (f[k] !== undefined && f[k] !== null && f[k] !== '' && f[k] !== false) o[k] = f[k]; return o; };

export function filterCompat(filters, level) {
  const bad = Object.keys(normalizeFilters(filters)).filter((k) => FILTER_FIELDS[k] && !FILTER_FIELDS[k].levels.includes(level));
  return bad.length ? { ok: false, message: `Esta vista filtra ${level === 'shots' ? 'tiros (hechos)' : level === 'possessions' ? 'posesiones (unidades)' : 'tramos'}; el filtro ${bad.map((k) => `«${FILTER_FIELDS[k].label}»`).join(', ')} selecciona otra clase de elemento. Usa la vista de ${bad.some((k) => FILTER_FIELDS[k].levels.includes('shots')) ? 'tiro y calidad' : 'ataque'} o quítalo.`, fields: bad } : { ok: true };
}

const stateOf = (sc, team) => { const d = sc[team] - sc[1 - team]; return d > 0 ? 'ahead' : d < 0 ? 'behind' : 'tied'; };
const eqOrIn = (v, want) => (Array.isArray(want) ? want.includes(v) : v === want);

// Filtra tiros ya vistos por la audiencia (los campos propios solo existen si la audiencia los tiene: un filtro propio sobre un rival no filtra, avisa).
export function filterShots(ix, shots, filters, params, subject = null) {
  const f = normalizeFilters(filters); const applied = []; const warnings = [];
  const out = shots.filter((s) => {
    const sc = s.scoreBefore; const sub = subject ?? s.team;
    if (f.period != null && !eqOrIn(s.period, f.period)) return false;
    if (f.scoreState && stateOf(sc, sub) !== f.scoreState) return false;
    if (f.marginMax != null && Math.abs(sc[0] - sc[1]) > f.marginMax) return false;
    if (f.adjustedFinal && !inAdjustedFinal(s.period, s.clock.before, sc, params.adjustedFinal)) return false;
    if (f.clockEnd && !((ix.byId[s.id]?.shotClock?.after ?? 999) <= params.conventions.clockEndTenths)) return false;
    if (f.zone && !eqOrIn(s.zone, f.zone)) return false;
    if (f.quality && !eqOrIn(s.quality, f.quality)) return false;
    if (f.result && (f.result === 'made') !== !!s.made) return false;
    if (f.shooter && s.shooter !== f.shooter) return false;
    if (f.defender && s.defender !== f.defender) return false;
    if (f.family && !eqOrIn(s.familia, f.family)) return false;
    if (f.coverage && !eqOrIn(s.coverage, f.coverage)) return false;
    if (f.procedencia && s.procedencia !== f.procedencia) return false;
    if (f.priority && s.prioridad !== f.priority) return false;
    if (f.director && s.director !== f.director) return false;
    return true;
  });
  const OWN_FIELD = { procedencia: 'procedencia', priority: 'prioridad', director: 'director' };
  for (const k of Object.keys(f)) {
    applied.push(FILTER_FIELDS[k]?.label ?? k);
    if (FILTER_FIELDS[k]?.own && shots.length && shots.every((s) => s[OWN_FIELD[k]] === undefined)) warnings.push(`«${FILTER_FIELDS[k].label}» es información propia: no está disponible para esta audiencia y equipo, así que el filtro no selecciona nada`);
  }
  return { shots: out, excluded: shots.length - out.length, applied, warnings, filters: f, empty: out.length === 0 ? 'sin hechos elegibles' : null };
}

export function filterPossessions(ix, poss, filters, params, subject = null, originOf = null) {
  const f = normalizeFilters(filters);
  const out = poss.filter((p) => {
    const first = p.events[0]; const sc = ix.scoreBefore[p.startSeq] ?? [0, 0]; const sub = subject ?? p.team;
    if (f.period != null && !eqOrIn(p.period, f.period)) return false;
    if (f.scoreState && stateOf(sc, sub) !== f.scoreState) return false;
    if (f.marginMax != null && Math.abs(sc[0] - sc[1]) > f.marginMax) return false;
    if (f.adjustedFinal && !inAdjustedFinal(p.period, first?.clock?.before, sc, params.adjustedFinal)) return false; // condición de INICIO de la posesión (listado de ataques)
    if (f.entry && p.entry !== f.entry) return false;
    if (f.origin && originOf && originOf(p).key !== f.origin) return false;
    return true;
  });
  return { possessions: out, excluded: poss.length - out.length, filters: f, empty: out.length === 0 ? 'sin hechos elegibles' : null };
}
