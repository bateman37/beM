// Estado derivado del lote (MOTOR-12 §7): se reconstruye SIEMPRE desde la agenda congelada y el índice append-only; ningún contador es una segunda verdad.
// Dos niveles: estado del TRABAJO (preparado, ejecutandose, detencion_solicitada, detenido, completado, interrumpido) y estado de cada EJECUCIÓN LÓGICA (pendiente, en_curso, terminada,
// fallida, interrumpida). «Terminada» como ejecución no es «partido deportivo finalizado válido»: `valid` y la elegibilidad se conservan aparte.
export const JOB_STATES = { preparado: 'Preparado', ejecutandose: 'Ejecutándose', detencion_solicitada: 'Detención solicitada (termina el partido en curso)', detenido: 'Detenido', completado: 'Completado', interrumpido: 'Interrumpido' };
export const EXEC_STATES = ['pendiente', 'en_curso', 'terminada', 'fallida', 'interrumpida'];

export function deriveState(lote, records) {
  const info = new Map(lote.agenda.map((x) => [x.match_id, { ex: x, attempts: [], exec_state: 'pendiente', canonical: null }]));
  const byAttempt = new Map();
  for (const r of records) {
    const m = info.get(r.match_id); if (!m) continue;
    if (r.type === 'attempt_started') { const a = { attempt_id: r.attempt_id, attempt_no: r.attempt_no, started_at: r.started_at, state: 'en_curso' }; byAttempt.set(r.attempt_id, a); m.attempts.push(a); }
    else if (r.type === 'attempt') { const a = byAttempt.get(r.attempt_id) ?? { attempt_id: r.attempt_id, attempt_no: r.attempt_no }; if (!byAttempt.has(r.attempt_id)) { byAttempt.set(r.attempt_id, a); m.attempts.push(a); } Object.assign(a, r, { state: r.exec_state }); }
    else if (r.type === 'attempt_interrupted') { const a = byAttempt.get(r.attempt_id); if (a) { a.state = 'interrumpida'; a.interrupted_reason = r.reason; a.finished_at = r.at; } }
  }
  for (const m of info.values()) {
    m.attempts.sort((a, b) => a.attempt_no - b.attempt_no);
    const done = [...m.attempts].reverse().find((a) => a.state === 'terminada');
    const last = m.attempts[m.attempts.length - 1];
    m.canonical = done ?? last ?? null;
    m.exec_state = last?.state === 'en_curso' ? 'en_curso' : (m.canonical?.state ?? 'pendiente');
    if (last && last.state !== 'en_curso' && done && last !== done) m.exec_state = done.state; // un reintento posterior fallido no quita la salida canónica válida
  }
  return info;
}

export function countersOf(lote, info) {
  const c = { solicitados: lote.agenda.length, pendientes: 0, en_curso: 0, terminados: 0, fallidos: 0, interrumpidos: 0, iniciados: 0, validos: 0, no_validos_terminados: 0, reintentados: 0, intentos: 0 };
  for (const m of info.values()) {
    c.intentos += m.attempts.length;
    if (m.attempts.length) c.iniciados += 1; if (m.attempts.length > 1) c.reintentados += 1;
    if (m.exec_state === 'pendiente') c.pendientes += 1; else if (m.exec_state === 'en_curso') c.en_curso += 1; else if (m.exec_state === 'terminada') { c.terminados += 1; if (m.canonical?.valid) c.validos += 1; else c.no_validos_terminados += 1; } else if (m.exec_state === 'fallida') c.fallidos += 1; else if (m.exec_state === 'interrumpida') c.interrumpidos += 1;
  }
  c.reconciled = c.pendientes + c.en_curso + c.terminados + c.fallidos + c.interrumpidos === c.solicitados;
  return c;
}

// Fila lógica por ejecución (la usan la tabla de resultados de la interfaz y `partidos.csv`).
export function matchRows(lote, info) {
  return lote.agenda.map((x) => {
    const m = info.get(x.match_id); const a = m.canonical; const f = a?.facts ?? {};
    return { ...x, attempt_id: a?.attempt_id ?? null, attempts: m.attempts.length, exec_state: m.exec_state, sporting_status: a?.sporting_status ?? null, valid: !!a?.valid, eligible: !!a?.valid, exclusion_reason: a ? (a.valid ? '' : a.exclusion_reason ?? a.interrupted_reason ?? '') : '', record_level: a?.record_level ?? null, exec_ms: a?.exec_ms ?? null, error: a?.error ?? null, facts: f };
  });
}
