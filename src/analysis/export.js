// Exportación analítica del encuentro (MOTOR-10 §20.3): JSON con metadatos, cobertura, indicadores con numeradores y denominadores, filtros, unidades, versiones y evidencia;
// CSV de la tabla actual con filas colectivas/desconocidas/mixtas; resumen Markdown con cifras e IDs. Aplica la audiencia real; no vuelca objetos internos.
import { ANALYSIS_VERSION } from './formulas.js';

export const ANALYSIS_EXPORT_SCHEMA = 'beM-analysis-export/1';
const csvCell = (v) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const toCsv = (header, rows) => [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');

export function metaOf(a) {
  return { schema: ANALYSIS_EXPORT_SCHEMA, analysisVersion: ANALYSIS_VERSION, policy: a.params.policy, actaPolicy: a.ix.acta.policy, engineVersion: a.ix.res.meta?.engineVersion ?? null, profile: a.ix.res.identity?.effectiveProfileId ?? null,
    seed: a.ix.res.input?.seed ?? null, audience: a.ctx.audience, perspective: a.ctx.audience === 'diagnostic' ? null : a.ctx.team, revision: a.ix.acta.revision?.effective ?? 'original', matchStatus: a.ix.acta.status, administrative: a.ix.res.administrative ?? null,
    diagnosticExport: a.ctx.audience === 'diagnostic' };
}

export function jsonExport(a, { team = a.ctx.team, filters = {} } = {}) {
  return { meta: { ...metaOf(a), filters }, coverage: a.coverageSummary(), indicators: [0, 1].map((t) => ({ team: t, results: a.indicators(t, filters).map((r) => ({ id: r.id, label: r.label, value: r.value, num: r.num, den: r.den, unit: r.unit, universe: r.universe, coverage: r.coverage, sample: r.sample ?? null, reason: r.reason ?? null, versions: r.versions, evidence: r.evidence })) })),
    sections: { summary: a.summary(), sectors: [0, 1].map((t) => a.sectors(t, filters)), quality: [0, 1].map((t) => a.quality(t, filters)), evolution: a.evolutionBrief(), margin: a.margin(), origin: [0, 1].map((t) => a.origin(t)), ownStates: [0, 1].map((t) => a.ownStates(t)), recommendations: [0, 1].map((t) => a.recommendations(t)) } };
}

// Tablas CSV disponibles (cada una con contexto suficiente: equipo, audiencia, versión y filtros).
export function csvTables(a, filters = {}) {
  const ctxCols = [a.ctx.audience, ANALYSIS_VERSION, JSON.stringify(filters)];
  const T = {};
  T.indicators = toCsv(['equipo', 'indicador', 'valor', 'numerador', 'denominador', 'unidad', 'universo', 'cobertura', 'muestra', 'motivo', 'audiencia', 'versión', 'filtros'],
    [0, 1].flatMap((t) => a.indicators(t, filters).map((r) => [a.ix.res.teams[t].id, r.id, r.value, r.num, r.den, r.unit, r.universe, r.coverage, r.sample?.n ?? '', r.reason ?? '', ...ctxCols])));
  T.sectors = toCsv(['equipo', 'sector', 'resolución', 'intentos', 'convertidos', 'acierto %', 'frecuencia %', 'puntos', 'audiencia', 'versión', 'filtros'],
    [0, 1].flatMap((t) => a.sectors(t, filters).map((s) => [a.ix.res.teams[t].id, s.id, s.resolution, s.att, s.made, s.pct.value, s.freq.value, s.points, ...ctxCols])));
  T.origin = toCsv(['equipo', 'origen', 'posesiones', 'frecuencia %', 'puntos vinculados', 'PPP', 'F', 'tiros', 'pérdidas', 'rebotes ofensivos', 'audiencia', 'versión', 'filtros'],
    [0, 1].flatMap((t) => { const o = a.origin(t); return [...o.rows.map((r) => [a.ix.res.teams[t].id, r.label, r.poss, r.freq.value, r.points, r.ppp.value, r.finals, r.shots, r.tov, r.oreb, ...ctxCols]), [a.ix.res.teams[t].id, 'Puntos sin vínculo a posesión (administrativos)', '', '', o.unlinkedPoints, '', '', '', '', '', ...ctxCols]]; }));
  T.lineups = toCsv(['equipo', 'jugadores', 'minutos', 'más-menos', 'ataques completos propios', 'ataques completos rivales', 'posesiones mixtas', 'ORtg estable', 'DRtg estable', 'exposición suficiente', 'audiencia', 'versión'],
    [0, 1].flatMap((t) => a.lineups(t).rows.map((r) => [a.ix.res.teams[t].id, r.players.join('|'), r.minutes.toFixed(2), r.plusMinus, r.ownComplete, r.rivalComplete, r.mixed, r.ortg.value, r.drtg.value, r.sufficient, a.ctx.audience, ANALYSIS_VERSION])));
  T.evolution = toCsv(['seq', 'evento', 'periodo', 'marcador A', 'marcador B', 'diferencia', 'equipo que anota', 'puntos'], a.ev().curve.map((c) => [c.seq, c.event, c.period, c.score[0], c.score[1], c.diff, c.team, c.pts]));
  return T;
}

export function markdownExport(a, filters = {}) {
  const S = a.summary(); const m = metaOf(a); const L = [];
  L.push(`# Resumen analítico del encuentro`, '', `- Audiencia: **${a.ctx.audience === 'diagnostic' ? 'DIAGNÓSTICO (no distribuir como informe de equipo)' : a.ctx.audience}**${a.ctx.audience === 'diagnostic' ? '' : ` · perspectiva ${a.ix.res.teams[a.ctx.team].name}`}`, `- Política analítica: ${m.analysisVersion} (${m.policy}) · acta ${m.actaPolicy} · motor ${m.engineVersion}`, `- Estado: ${S.statusText}`, `- Filtros: ${JSON.stringify(filters)}`, '');
  L.push(`## Resultado`, '', S.headline, '', ...S.partials.map((p) => `- ${p.label}: ${p.points.join('–')}`), '');
  L.push(`## Claves`, '', ...(S.keys.length ? S.keys.map((k, i) => `${i + 1}. ${k.text} _(regla ${k.id}, muestra ${k.sample ?? '—'}, evidencia: ${k.evidence.ids.slice(0, 8).join(', ') || 'ver consulta'}${k.evidence.ids.length > 8 ? '…' : ''})_`) : ['No hay claves con evidencia suficiente (los datos crudos siguen en las tablas).']), '');
  L.push(`## Margen del tanteo de cancha`, '', ...S.margin.parts.map(([l, v]) => `- ${l}: ${v > 0 ? '+' : ''}${v}`), `- Total = ${S.margin.total} (margen ${S.margin.margin})`, '');
  L.push(`## Líderes`, '', ...S.leaders.map((l) => `- ${l.label}: ${l.value} — ${l.leaders.map((x) => x.id).join(', ') || '—'}`), '');
  L.push(`## Crónica`, '', ...S.chronicle.map((c) => `- ${c.text}`), '');
  return L.join('\n');
}
