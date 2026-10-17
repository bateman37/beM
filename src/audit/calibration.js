// Primer ciclo de calibración (MOTOR-13 §14): revisión de señales de fiabilidad, candidata EXPLÍCITA acotada y comparación base/candidata. No es un optimizador: no activa nada, no toca
// el perfil activo ni lotes congelados; la activación es siempre una acción explícita de Dennis desde el Panel. Los pasos del editor son precargas (tabla audit), no cambios obligatorios.
import { buildRows, indexRows } from '../profiles/rows.js';
import { diffEffective } from '../profiles/model.js';
import { r4 } from './util.js';

// Paso del editor para una fila: p0 binaria ±absoluto, sensibilidad logit ±absoluto, carga/desgaste/duración ±relativo; sin paso para filas reglamentarias o invariantes, ni para
// magnitudes que «parecen» una probabilidad pero son umbrales (el tipo y la clase mandan, no el nombre).
export function stepFor(row, params) {
  const s = params.calibrationStep; if (!row || !row.editable || row.cls === 'reglamento' || row.cls === 'invariante') return null;
  if ((row.type === 'probability' || row.type === 'probabilityLogit') && /\.p0$/.test(row.id)) return { kind: 'absoluto', step: s.p0Absolute, unit: 'probabilidad', note: 'p0 binaria: validar rango 0–1' };
  if (/(logit|sensitivity)/i.test(row.id) && row.type !== 'distribution') return { kind: 'absoluto', step: s.logitPerPoint, unit: 'logit por punto de capacidad', note: 'solo si esa es la unidad real de la fila' };
  if (/(load|wear|duration|cost)/i.test(row.id) && typeof row.value === 'number') return { kind: 'relativo', step: s.loadFactorRelative, unit: 'fracción del valor', note: 'respetar límites y unidades de la fila' };
  return null;
}

// Candidata desde una hipótesis única y hasta `maxChangedRows` filas. `edits`: [{ row, direction: +1|-1 } | { row, value }]. Devuelve el diff, la validación y la confirmación de que NO se activó.
export function proposeCandidate(library, baseId, { hypothesis, edits, evidence = [], reason = '' }, params) {
  const s = params.calibrationStep; if (!hypothesis) return { ok: false, reason: 'una candidata necesita su hipótesis (qué comportamiento motiva el ajuste y qué se espera)' };
  if (!edits?.length || edits.length > s.maxChangedRows) return { ok: false, reason: `una candidata de la primera pasada altera entre 1 y ${s.maxChangedRows} filas efectivas (recibidas: ${edits?.length ?? 0})` };
  const base = library.version(baseId); if (!base) return { ok: false, reason: `versión base desconocida: ${baseId}` };
  const rows = indexRows(buildRows(base.effective)).byId; const changes = {}; const detail = []; const problems = [];
  for (const e of edits) {
    const r = rows.get(e.row); if (!r || r.missing) { problems.push(`${e.row}: fila inexistente`); continue; }
    let next = e.value; let step = stepFor(r, params);
    if (next === undefined) { if (!step) { problems.push(`${e.row}: sin paso de editor admitido (indica el valor y justifícalo)`); continue; } next = step.kind === 'absoluto' ? r.value + e.direction * step.step : r.value * (1 + e.direction * step.step); next = Math.round(next * 1e6) / 1e6; }
    if ((r.type === 'probability' || r.type === 'probabilityLogit') && !(next >= 0 && next <= 1)) { problems.push(`${e.row}: fuera de rango 0–1`); continue; }
    changes[e.row] = next; detail.push({ row: e.row, label: r.label, unit: r.unit, source: r.source ?? r.ext ?? null, before: r.value, after: next, step: step ?? null, justification: step ? 'paso del editor' : (e.justification ?? 'valor explícito') });
  }
  if (problems.length) return { ok: false, reason: problems.join('; '), problems };
  const made = library.createDraft(baseId, { name: `Candidata MOTOR-13: ${hypothesis.slice(0, 60)}`, reason: hypothesis }); if (!made.ok) return made;
  const ed = library.editDraft(made.draft.id, changes, `${hypothesis}${reason ? ` — ${reason}` : ''}`); if (!ed.ok) return ed;
  const val = library.validateDraft(made.draft.id); const eff = library.draftEffective(made.draft.id); const diff = diffEffective(base.effective, eff);
  return { ok: true, draftId: made.draft.id, hypothesis, evidence, detail, diff: { changed: diff.changed.map((c) => ({ id: c.id, before: c.before, after: c.after })), onlyA: diff.onlyA, onlyB: diff.onlyB }, validation: { errors: val.validation?.summary?.errors ?? null, avisos: val.validation?.summary?.avisos ?? null }, activated: false, activeVersionUnchanged: library.activeVersion().id, note: 'Guardar la candidata no activa nada; evaluar y recomendar son pasos posteriores y la activación es una acción explícita.' };
}

// Revisión de la fiabilidad (§9, §14.1): separa señal estadística, muestra insuficiente y desviaciones compatibles con el azar. NO decide un cambio: formula hipótesis con alternativas.
export function reviewReliability(rel, params) {
  const warn = params.reliabilityWarn; const out = { mechanisms: rel.filter((x) => x.kind === 'binaria').length, deterministicViolations: [], signals: [], insufficient: [], compatible: [] };
  const z = (x) => { const v = x.bins.reduce((s, b) => s + (b.n ? b.mediaP * (1 - b.mediaP) * b.n : 0), 0); return v > 0 ? x.diferencia / Math.sqrt(v) : null; };
  for (const x of rel.filter((y) => y.kind === 'binaria')) {
    out.deterministicViolations.push(...x.determinista.bad.map((b) => ({ mecanismo: x.mecanismo, ...b })));
    const zz = z(x); const enough = x.n >= warn.minDecisions && x.partidos >= warn.minMatches;
    const signs = x.perMatch.map((m) => Math.sign(m.observado - m.esperado)); const consistent = signs.length > 0 && signs.every((s) => s === signs[0] && s !== 0);
    const item = { mecanismo: x.mecanismo, n: x.n, partidos: x.partidos, esperados: r4(x.esperados), observados: x.observados, diferencia: r4(x.diferencia), z: r4(zz), mismoSignoEnTodosLosPartidos: consistent };
    if (!enough) out.insufficient.push(item); else if (Math.abs(zz ?? 0) >= 2) out.signals.push(item); else out.compatible.push(item);
  }
  // Con ~N mecanismos independientes se esperan ≈ N·4,6 % desviaciones con |z| ≥ 2 solo por azar (aproximación normal): una señal aislada no justifica tocar una probabilidad.
  const n = out.signals.length + out.compatible.length; out.expectedBySignal = r4(n * 0.0455); out.note = `Con ${n} mecanismos suficientes se esperan ≈ ${out.expectedBySignal} con |z| ≥ 2 por azar (aproximación normal): la coherencia de muestreo no demuestra realismo y una señal aislada no justifica un cambio.`;
  return out;
}
