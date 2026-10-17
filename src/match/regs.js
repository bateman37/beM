// Administración reglamentaria de MOTOR-09 (REG01–REG04): matriz tipada hecho → consecuencias, sanciones combinadas, series de libres,
// disponibilidad e inferioridad y terminaciones administrativas. Funciones puras sobre `profile.regulation`; sin azar: una vez validado el hecho,
// su sanción, su ejecutor y quién reanuda no se vuelven a sortear. Los PDF de S09-01 a S09-04 no fueron accesibles (HTTP 403): cada fila declara su
// estado de contraste (`contrastada`, `heredada`, `provisional`, `pendiente`) y una fila `pendiente` NO ejecuta nada, rechaza con diagnóstico.
import { inPenalty, foulPeriodKey } from './rules.js';

export const CONTRAST = { contrastada: 'Contrastada con el texto de un encargo (MOTOR-09 §4.3 / MOTOR-14 §7.3: lectura de ChatGPT; no lectura directa del PDF por Claude)', heredada: 'Heredada de MOTOR-01 a MOTOR-08, sin contrastar con el PDF', provisional: 'Mecanismo ejecutable con un valor sin contrastar', pendiente: 'Tipada, sin ejecución: contenido exacto pendiente' };
export const FOUL_CATEGORIES = ['personal', 'ofensiva', 'disruptiva', 'flagrante', 'tecnica1', 'tecnica2', 'antideportiva'];

const getPath = (o, path) => path.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);

// ¿La condición tipada de una fila describe este hecho? Una clave ausente en `when` no restringe.
export function whenMatches(when, fact) {
  if (!when) return false;
  for (const [k, v] of Object.entries(when)) {
    if (k === 'category') { if (!v.includes(fact.category)) return false; } else if (fact[k] !== v) return false;
  }
  return true;
}

// Filas ejecutables o pendientes cuya condición cubre el hecho; gana la de mayor prioridad. Dos filas con la misma prioridad y consecuencias
// distintas son una contradicción normativa: nunca se desempata por orden alfabético.
export function matchRows(profile, fact) {
  const rows = (profile.regulation?.matrix ?? []).filter((r) => r.when && !('queue' in r.when) && !('availability' in r.when) && !('termination' in r.when) && !('revision' in r.when) && whenMatches(r.when, fact));
  if (!rows.length) return { rows: [], chosen: null, ambiguous: false };
  const top = Math.max(...rows.map((r) => r.priority));
  const best = rows.filter((r) => r.priority === top);
  const distinct = new Set(best.map((r) => JSON.stringify(r.consequence)));
  return { rows, chosen: best[0], ambiguous: best.length > 1 && distinct.size > 1, tied: best };
}

// Valores de la consecuencia: un número, una referencia `rules.x` o `{missed, made}` (depende del resultado del acto de tiro).
function resolveFt(spec, fact, rules) {
  if (typeof spec === 'number') return { n: spec, basis: `${spec} libre${spec === 1 ? '' : 's'} fijos` };
  if (typeof spec === 'string') { const v = getPath({ rules }, spec); return { n: v, basis: `${spec} = ${v}` }; }
  if (fact.shotMade) return { n: spec.made, basis: 'canasta válida: un libre adicional' };
  const n = spec.missed === 'shotPoints' ? fact.shotPoints : spec.missed;
  return { n, basis: `tiro fallado de ${fact.shotPoints} punto${fact.shotPoints === 1 ? '' : 's'}: ${n} libres` };
}

// Consecuencia de una falta ya clasificada. Devuelve `{ ok, ... }`; con `ok: false` el motivo es un diagnóstico explícito (no se produce un acta falsa).
export function resolveFoul(profile, fact) {
  const rules = profile.rules;
  const miss = (reason) => ({ ok: false, diagnostic: reason, fact });
  if (!FOUL_CATEGORIES.includes(fact.category)) return miss(`categoría de falta desconocida: «${fact.category}»`);
  if (fact.shotAction === undefined || fact.shotAction === null) return miss('el hecho no declara si hubo acción de tiro: no se asume «falta personal normal»');
  if (fact.shotAction && !(fact.shotPoints >= 1)) return miss('falta en acción de tiro sin valor del intento');
  const m = matchRows(profile, fact);
  if (!m.chosen) return miss(`ninguna fila de la matriz cubre la falta ${fact.category}${fact.shotAction ? ' en acción de tiro' : ' sin acción de tiro'}`);
  if (m.ambiguous) return miss(`filas incompatibles con la misma prioridad: ${m.tied.map((r) => r.id).join(', ')}`);
  const row = m.chosen;
  if (row.contrast === 'pendiente' || !row.consequence) return { ok: false, pending: true, row: row.id, diagnostic: `${row.id}: contenido normativo pendiente de contraste (${row.source.article}). ${row.source.note}`, fact };
  const c = row.consequence;
  const ft = resolveFt(c.ft, fact, rules);
  return { ok: true, row: row.id, contrast: row.contrast, source: row.source, ft: ft.n, ftBasis: ft.basis, shooter: c.shooter ?? null, playerFoul: !!c.playerFoul, teamFoul: !!c.teamFoul, turnover: !!c.turnover,
    counter: c.counter === 'byCategory' ? fact.category : null, shotValidity: c.shotValidity ?? null, resume: { ...(c.resume ?? {}) }, explanation: row.explanation, fact };
}

// Hecho de falta defensiva a partir del estado del motor (la constante `penalty` procede de los contadores de equipo del periodo, no de un sorteo).
export function foulFact(rules, { category, shotAction, shotPoints = null, shotMade = false, teamFoulsBefore = 0 }) {
  return { category, shotAction: !!shotAction, shotPoints, shotMade: !!shotMade, penalty: inPenalty(teamFoulsBefore, rules) };
}

// Descalificación acumulada: flagrantes y técnicas de categoría 1 (las disruptivas no cuentan por sí solas).
export function disqualifies(profile, counters) {
  const d = profile.regulation.disqualification;
  return d.sumOf.reduce((s, k) => s + (counters?.[k] ?? 0), 0) >= d.limit;
}

// ---------------------------------------------------------------- validación de la matriz (perfil candidato)
export function validateMatrix(profile) {
  const out = []; const bad = (rule, message) => out.push({ severity: 'error', rule, message });
  const reg = profile.regulation; if (!reg) return [{ severity: 'error', rule: 'presencia', message: 'el perfil no contiene la sección «regulation»' }];
  const ids = new Set();
  for (const r of reg.matrix) {
    if (ids.has(r.id)) bad('identidad', `fila repetida ${r.id}`); ids.add(r.id);
    if (!r.source?.doc || !r.source?.article || !r.source?.reading) bad('fuente', `${r.id}: falta fuente, artículo o tipo de lectura`);
    if (!CONTRAST[r.contrast]) bad('contraste', `${r.id}: estado de contraste desconocido (${r.contrast})`);
    if (r.contrast === 'pendiente' && r.consequence) bad('contraste', `${r.id}: una fila pendiente no puede llevar una consecuencia ejecutable`);
    if (r.contrast !== 'pendiente' && r.when && r.family !== 'Combinadas' && r.family !== 'Disponibilidad' && r.family !== 'Terminaciones' && !r.consequence) bad('consecuencia', `${r.id}: fila con condición y sin consecuencia no pendiente`);
    if (r.consequence?.ft && typeof r.consequence.ft === 'string' && getPath(profile, r.consequence.ft) == null) bad('referencia', `${r.id}: la constante ${r.consequence.ft} no existe`);
    if (r.consequence?.resume?.shotClock === 'fixed14' && getPath(profile, 'rules.penaltyThrowInShotClockSeconds') !== 14) bad('constante', `${r.id}: el saque de penalización dispone de 14 s`);
  }
  // Ambigüedad: se recorre la rejilla de hechos posibles; dos filas incompatibles con la misma prioridad invalidan el perfil.
  for (const category of FOUL_CATEGORIES) for (const shotAction of [false, true]) for (const penalty of [false, true]) {
    const m = matchRows(profile, { category, shotAction, penalty, shotMade: false, shotPoints: 2 });
    if (m.ambiguous) bad('ambigüedad', `la falta ${category} (${shotAction ? 'en tiro' : 'sin tiro'}${penalty ? ', con bonus' : ''}) encaja en filas incompatibles con la misma prioridad: ${m.tied.map((r) => r.id).join(', ')}`);
  }
  for (const category of ['personal', 'ofensiva', 'disruptiva', 'flagrante']) for (const shotAction of [false, true]) {
    if (!matchRows(profile, { category, shotAction, penalty: false, shotMade: false, shotPoints: 2 }).chosen) bad('cobertura', `la falta ${category} ${shotAction ? 'en tiro' : 'sin tiro'} no está cubierta por ninguna fila`);
  }
  const a = reg.availability; const t = reg.termination;
  if (!(Number.isInteger(a?.minPlayersToContinue) && a.minPlayersToContinue >= 1 && a.minPlayersToContinue <= 5)) bad('dominio', 'regulation.availability.minPlayersToContinue debe ser un entero de 1 a 5');
  if (!(Number.isInteger(t?.forfeitWinnerPoints) && t.forfeitWinnerPoints > t.forfeitLoserPoints && t.forfeitLoserPoints >= 0)) bad('dominio', 'el resultado adjudicado debe favorecer a un equipo (ganador > perdedor ≥ 0)');
  const ip = t?.insufficientPlayers;
  if (ip && !(typeof ip.retainLeadingScore === 'boolean' && Number.isInteger(ip.otherwiseWinnerPoints) && Number.isInteger(ip.otherwiseLoserPoints) && ip.otherwiseWinnerPoints > ip.otherwiseLoserPoints && ip.otherwiseLoserPoints >= 0)) bad('dominio', 'regulation.termination.insufficientPlayers: conservar marcador (sí/no) y un adjudicado ganador > perdedor ≥ 0');
  return out;
}

// ---------------------------------------------------------------- sanciones combinadas (cola de penalizaciones pendientes)
// Cada sanción se resuelve UNA vez con la matriz, en el orden en que se produjo. Dos sanciones iguales de equipos opuestos son candidatas a
// compensación: la fila RG-C02 está pendiente de contraste, así que el caso se marca y NO se compensa ni se administra por intuición.
export function combineSanctions(profile, sanctions) {
  const queue = []; const warnings = []; const seen = new Set();
  const ordered = [...sanctions].sort((a, b) => a.order - b.order);
  for (const s of ordered) {
    if (seen.has(s.id)) { warnings.push(`la sanción ${s.id} aparece repetida: se administra una sola vez`); continue; }
    seen.add(s.id);
    const r = resolveFoul(profile, { category: s.category, shotAction: s.shotAction, shotPoints: s.shotPoints ?? null, shotMade: !!s.shotMade, penalty: !!s.penalty });
    queue.push({ id: s.id, team: s.team, order: s.order, committer: s.committer ?? null, fouled: s.fouled ?? null, resolution: r, administered: false });
  }
  const failed = queue.filter((q) => !q.resolution.ok);
  const candidates = [];
  for (let i = 0; i < queue.length; i++) for (let j = i + 1; j < queue.length; j++) {
    const a = queue[i]; const b = queue[j];
    if (a.team !== b.team && a.resolution.ok && b.resolution.ok && a.resolution.ft === b.resolution.ft && a.resolution.row === b.resolution.row) candidates.push([a.id, b.id]);
  }
  const compRow = profile.regulation.matrix.find((r) => r.id === 'RG-C02');
  if (failed.length) return { ok: false, status: 'rechazada', queue, diagnostic: failed.map((q) => `${q.id}: ${q.resolution.diagnostic}`).join(' · '), warnings };
  if (candidates.length) return { ok: false, status: 'pendiente_contraste', queue, candidates, diagnostic: `${compRow.id}: ${candidates.map((c) => c.join(' ↔ ')).join(', ')} serían candidatas a compensación; ${compRow.source.note}`, warnings };
  // administración secuencial: una ejecución por sanción; la reanudación es única y la de la última sanción administrada (RG-C01, provisional)
  const steps = queue.map((q) => ({ id: q.id, team: q.team, fouled: q.fouled, ft: q.resolution.ft, row: q.resolution.row, resumeIfLast: q.resolution.resume }));
  const last = steps[steps.length - 1];
  return { ok: true, status: 'resuelta', queue, steps, resume: last ? { ...last.resumeIfLast, from: last.id, convention: 'RG-C01 (provisional, art. de situaciones especiales sin contrastar)' } : null, warnings, totalFreeThrows: steps.reduce((x, s) => x + s.ft, 0) };
}

// ---------------------------------------------------------------- series de libres: concedidos, administrados, anulados, repetidos y válidos
// `attempts`: [{ made, status? }] con status 'administered' (por defecto), 'annulled' o 'repeated' (el intento original no cuenta como válido).
export function administerSeries(series) {
  const attempts = series.attempts.map((a, i) => ({ i: i + 1, made: !!a.made, status: a.status ?? 'administered' }));
  const valid = attempts.filter((a) => a.status === 'administered');
  const out = { id: series.id, granted: series.granted, administered: attempts.length, annulled: attempts.filter((a) => a.status === 'annulled').length, repeated: attempts.filter((a) => a.status === 'repeated').length, valid: valid.length, made: valid.filter((a) => a.made).length };
  out.fta = out.valid; // un libre repetido no se duplica en el porcentaje ni abre otra F
  out.points = out.made;
  out.consistent = out.valid + out.annulled + out.repeated === out.administered && out.valid <= out.granted;
  return out;
}

// ---------------------------------------------------------------- disponibilidad, inferioridad y terminación
export function availability(profile, roster) {
  const eligible = roster.filter((p) => p.available !== false && !p.excluded);
  const min = profile.regulation.availability.minPlayersToContinue;
  const onCourt = Math.min(5, eligible.length);
  return { eligible: eligible.length, onCourt, inferiority: onCourt < 5, canContinue: eligible.length >= min, minPlayersToContinue: min, row: 'RG-D02', contrast: profile.regulation.availability.contrast };
}

// Terminación administrativa: se conserva lo disputado y el resultado ADJUDICADO es un dato distinto (nunca puntos de un jugador).
// `kind`: 'insufficient_players' (art. 21 de F14-01, lectura del encargo MOTOR-14 §7.3: menos de dos jugadores listos durante el encuentro; el beneficiario CONSERVA su marcador si va por delante y,
// si no, se adjudica 2–0) o 'forfeit' (incomparecencia: resultado fijo de la fila; sigue siendo la convención provisional de MOTOR-09). El marcador de cancha nunca se reescribe.
export function terminate(profile, { favored, played, reason, kind = 'forfeit' }) {
  const t = profile.regulation.termination;
  if (kind === 'insufficient_players') {
    const ip = t.insufficientPlayers;
    const leading = played[favored] > played[1 - favored];
    const awarded = leading && ip.retainLeadingScore ? [...played] : (favored === 0 ? [ip.otherwiseWinnerPoints, ip.otherwiseLoserPoints] : [ip.otherwiseLoserPoints, ip.otherwiseWinnerPoints]);
    return { kind: 'administrative', cause: kind, reason, row: 'RG-T01', contrast: ip.contrast, played: [...played], awarded, awardedBasis: leading && ip.retainLeadingScore ? 'marcador favorable del beneficiario conservado' : 'adjudicado 2–0 (el beneficiario no iba por delante)', favored, awardedIsCourtScore: false };
  }
  const awarded = favored === 0 ? [t.forfeitWinnerPoints, t.forfeitLoserPoints] : [t.forfeitLoserPoints, t.forfeitWinnerPoints];
  return { kind: 'administrative', cause: kind, reason, row: 'RG-T01', contrast: t.contrast, played: [...played], awarded, awardedBasis: 'resultado fijo de la fila de incomparecencia', favored, awardedIsCourtScore: false };
}

export { foulPeriodKey };
