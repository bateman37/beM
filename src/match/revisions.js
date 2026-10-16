// Correcciones y revisiones de MOTOR-09 (§14). Tres naturalezas DISTINTAS:
//   · statistical  — atribución o clasificación de crédito sobre hechos conservados: revisa las proyecciones, no el marcador legal ni la continuación.
//   · regulatory   — cambia legalmente marcador, validez, elegibilidad o continuación en el encuentro (p. ej. dos/tres, validez temporal del tiro).
//                    Su legitimidad frente al art. 45 NO se valida (RG-R01 pendiente de contraste); se registra, se propaga y queda marcada «sin contrastar».
//   · technical    — un defecto del motor produce una ejecución inválida: se identifica la versión afectada; una simulación corregida es otra ejecución.
// El hecho original nunca se borra: se conserva en el registro (valores anterior y vigente) y las proyecciones se reconstruyen desde la copia revisada.
// No se re-simula ni se reconsumen números aleatorios; la continuación original se conserva y así se declara.
import { buildActa } from './acta.js';
import { reconcile } from './reconcile.js';

export const REVISION_VERSION = 'REV-MOTOR09-R1';
export const REVISION_CLASSES = {
  statistical: 'Corrección estadística (atribución o clasificación de crédito; no cambia el marcador legal)',
  regulatory: 'Corrección reglamentaria en el encuentro (cambia marcador, validez, elegibilidad o continuación)',
  technical: 'Corrección técnica del software (ejecución inválida; la versión corregida es otra ejecución)',
};
const SCOPE_ALL = ['marcador', 'acta', 'parciales', 'intentos', 'series', 'presencia y más-menos', 'F', 'posesiones'];

// Valida una revisión contra los hechos conservados. Devuelve { ok, problems }.
export function validateRevision(res, rev) {
  const problems = [];
  if (!rev?.id) problems.push('falta el identificador de la revisión');
  if (!REVISION_CLASSES[rev?.class]) problems.push(`clase desconocida: ${rev?.class}`);
  if (!rev?.reason) problems.push('falta el motivo');
  if (rev?.class === 'technical') { if (!rev.engineVersion) problems.push('una corrección técnica identifica la versión afectada del motor'); return { ok: problems.length === 0, problems }; }
  const ev = res.events.find((e) => e.id === rev?.fact?.event);
  if (!ev) { problems.push(`el hecho ${rev?.fact?.event} no existe`); return { ok: false, problems }; }
  const stat = ev.stats[rev.fact.index ?? ev.stats.findIndex((f) => f.k === rev.fact.k)];
  if (!stat) { problems.push(`el hecho ${ev.id} no contiene un crédito «${rev.fact.k}»`); return { ok: false, problems }; }
  const teamIds = (t) => res.input.teams[t].players.map((p) => p.id);
  if (rev.kind === 'reattribute') {
    const to = rev.change?.to; const field = rev.change?.field ?? 'p';
    if (!to) problems.push('falta el jugador al que se reatribuye');
    else {
      const team = field === 'feed.passer' ? stat.team : stat.team;
      if (!teamIds(team).includes(to)) problems.push(`${to} no pertenece al equipo del crédito`);
      const lineBy = Object.fromEntries(res.lineups.map((l) => [l.id, Object.values(l.slots)]));
      const present = ev.lineups.some((lid) => lineBy[lid].includes(to));
      if (!present) problems.push(`${to} no estaba en pista en ${ev.id}: una atribución no se reasigna a un jugador ausente`);
      if (stat.k === 'shot' && field === 'p' && stat.feed?.passer === to) problems.push('el nuevo anotador es el pasador del tiro: no existe la asistencia a uno mismo (revisa también el pase)');
    }
    if (rev.class !== 'statistical') problems.push('la reatribución de un crédito es una corrección estadística');
  } else if (rev.kind === 'shotValue' || rev.kind === 'shotValidity') {
    if (stat.k !== 'shot') problems.push('solo un hecho de tiro admite este tipo de revisión');
    if (rev.class !== 'regulatory') problems.push('cambiar el valor o la validez de un tiro cambia legalmente el marcador: debe clasificarse como corrección reglamentaria, no como «solo estadística»');
    if (!rev.source) problems.push('una corrección reglamentaria declara su fuente (artículo o interpretación)');
    if (!rev.recognizedAt) problems.push('una corrección reglamentaria declara el instante de reconocimiento');
    if (rev.kind === 'shotValue') {
      if (![2, 3].includes(rev.change?.points)) problems.push('el valor corregido es 2 o 3');
      if (stat.fromFoul && !stat.made) problems.push('el tiro fallado con falta administró libres según su valor: la revisión de valor exige revisar la serie (no se reajusta en silencio)');
    }
    if (rev.kind === 'shotValidity' && rev.change?.valid !== false) problems.push('la revisión de validez solo admite anular el tiro (valid: false)');
  } else problems.push(`tipo de revisión desconocido: ${rev.kind}`);
  return { ok: problems.length === 0, problems };
}

// Aplica revisiones válidas sobre una COPIA de los hechos y reconstruye todas las proyecciones desde la copia revisada.
// Devuelve { events, acta, score, periodScores, reconciliation, log, rejected, technical }.
export function applyRevisions(res, revisions, policy = {}) {
  const events = JSON.parse(JSON.stringify(res.events));
  const log = []; const rejected = []; let technical = null; let version = 0;
  for (const rev of revisions) {
    const v = validateRevision(res, rev);
    if (!v.ok) { rejected.push({ id: rev?.id ?? null, problems: v.problems }); continue; }
    if (rev.class === 'technical') { technical = { id: rev.id, engineVersion: rev.engineVersion, reason: rev.reason }; version += 1; log.push({ id: rev.id, class: 'technical', kind: 'ejecución inválida', fact: null, reason: rev.reason, source: rev.source ?? null, before: null, after: null, recognizedAt: rev.recognizedAt ?? null, scope: ['ejecución'], derivedVersion: version, contrast: 'n/a', note: 'La simulación con la versión corregida es una ejecución nueva, no una decisión arbitral ficticia.' }); continue; }
    const ev = events.find((e) => e.id === rev.fact.event);
    const idx = rev.fact.index ?? ev.stats.findIndex((f) => f.k === rev.fact.k); const f = ev.stats[idx];
    const before = JSON.parse(JSON.stringify(f)); let after;
    if (rev.kind === 'reattribute') {
      const field = rev.change.field ?? 'p';
      if (field === 'feed.passer') f.feed = { ...f.feed, passer: rev.change.to }; else f[field] = rev.change.to;
      if (f.k === 'ft') { /* la serie conserva su lanzador original en el registro; el crédito vigente es del nuevo jugador */ }
    } else if (rev.kind === 'shotValue') {
      const was = f.points; f.points = rev.change.points; f.zone = rev.change.points === 3 ? 'three' : (f.zone === 'three' ? 'midrange' : f.zone);
      f.revisedFrom = was;
    } else if (rev.kind === 'shotValidity') { f.made = false; f.annulled = true; }
    after = JSON.parse(JSON.stringify(f));
    version += 1;
    log.push({ id: rev.id, class: rev.class, kind: rev.kind, fact: { event: ev.id, k: f.k }, reason: rev.reason, source: rev.source ?? null, before, after, recognizedAt: rev.recognizedAt ?? null,
      scope: rev.class === 'statistical' ? ['acta', 'presencia y más-menos'].filter(Boolean).concat(['intentos', 'series']) : SCOPE_ALL, derivedVersion: version,
      contrast: rev.class === 'regulatory' ? 'pendiente (RG-R01: art. 45 sin contrastar)' : 'convención beM',
      note: rev.class === 'regulatory' ? 'La continuación original se conserva: el motor no re-simula ni reconsume azar; solo cambian marcador, créditos, series, F y posesiones derivadas.' : 'No cambia el marcador legal ni la continuación.' });
  }
  const acta = buildActa({ events, lineups: res.lineups, input: res.input, possessions: res.possessions, status: technical ? 'error' : res.status }, policy);
  acta.revision = { effective: version, ids: log.map((l) => l.id), version: REVISION_VERSION };
  const periodScores = (res.periodScores ?? []).map((p) => ({ period: p.period, points: [...(acta.periods.find((q) => q.period === p.period)?.points ?? [0, 0])] }));
  const reconciliation = reconcile({ events, lineups: res.lineups, input: res.input, score: acta.score, periodScores, possessions: res.possessions, status: technical ? 'error' : res.status, diagnostics: res.diagnostics, administrative: res.administrative ?? null }, acta);
  if (technical) { reconciliation.valid = 'inválida'; reconciliation.technical = technical; }
  return { events, acta, score: [...acta.score], periodScores, reconciliation, log, rejected, technical };
}
