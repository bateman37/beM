// Productor común de exposición para el aprendizaje de partido (MOTOR-18B, R04). Puro: no simula, no escribe y no completa datos que falten.
// Un encuentro terminado produce una exposición `complete: true`; uno parcial puede consultarse, pero se declara `complete: false` y `proposeFromMatch` lo rechaza.
// Un resultado histórico completo pasa por `exposureFromResult`, que COMPRUEBA su estado antes de construir la exposición; si faltan datos devuelve error, nunca una finalización fabricada.

// `exposure`: salida de `famExposure()` (jugadores con décimas por posición/rol y crédito por módulo). `status`: estado del encuentro.
export function buildExposure({ exposure, status, source_id = null, teams = null, encounterId = null }) {
  if (!exposure || typeof exposure !== 'object') return null;
  return { ...exposure, status, complete: status === 'finished', match: { source_id, ...(encounterId != null ? { encounterId } : {}), teams } };
}
// Solo un encuentro terminado se convierte en experiencia aplicable.
export function finishedExposure(args) {
  const x = buildExposure(args);
  if (!x) return { ok: false, errors: [{ path: 'exposure', message: 'el encuentro no registra exposición de familiaridad (capa desactivada o perfil anterior)' }] };
  if (!x.complete) return { ok: false, errors: [{ path: 'status', message: `el encuentro no ha terminado (estado ${args.status ?? 'desconocido'}): una exposición parcial no es experiencia aplicable` }], exposure: x };
  return { ok: true, exposure: x };
}
// Resultado final (`buildResult`) de un partido del laboratorio o de un lote.
export function exposureFromResult(res, { source_id } = {}) {
  if (!res || typeof res !== 'object') return { ok: false, errors: [{ path: 'result', message: 'resultado ausente' }] };
  const fam = res.diagnostics?.familiarity;
  if (!fam?.exposure?.players) return { ok: false, errors: [{ path: 'result.diagnostics.familiarity.exposure', message: 'el resultado no contiene exposición de familiaridad' }] };
  return finishedExposure({ exposure: fam.exposure, status: res.status, source_id, teams: (res.input?.teams ?? []).map((t) => t.id) });
}
