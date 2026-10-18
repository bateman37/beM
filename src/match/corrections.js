// Corrección de errores (art. 45; MOTOR-15 §6.2–§6.4): funciones puras sobre `profile.regulation.corrections`. La ventana se decide con hechos del propio encuentro (paradas, reanudaciones, control,
// canasta posterior, final), nunca con el marcador final. Fuente: síntesis selectiva de N15-01 45.1–45.6 (ChatGPT, 17/10/2026); sin lectura directa del PDF.
// Categoría 1: errores de libres, lanzador, puntos, infractor, mesa y reloj de juego. Categoría 2: reloj de posesión. No son las categorías de técnica (dominio distinto).

export const CLASS_IDS = ['C1-FT-IMPROPER', 'C1-FT-OMITTED', 'C1-SHOOTER-PERMITTED', 'C1-SHOOTER-DIRECTED', 'C1-POINTS', 'C1-SUBJECT', 'C1-TABLE', 'C1-CLOCK', 'C2-SHOTCLOCK'];
export const classOf = (profile, id) => (profile.regulation?.corrections?.classes ?? []).find((c) => c.id === id) ?? null;

const inLastTwoOrOvertime = (cfg, period, remaining, quarters = 4) => period > quarters || (period === cfg.thresholdPeriod && remaining <= cfg.thresholdSecondsRemaining * 10);

// ctx: {
//   period, remaining     instante en que se pide la corrección (periodo y reloj de juego restante en décimas)
//   errorPeriod, errorRemaining   instante del error (hecho original)
//   firstStop             { period, remaining } primera parada posterior al error (o null si no la hubo)
//   resumesSinceError     cuántas reanudaciones (balón vivo tras una parada) ocurrieron ya desde el error
//   finished              el encuentro terminó
//   errorAfterLastStop    el error se produjo después de la última parada (solo relevante al final)
//   immediate             la corrección se pide inmediatamente al reconocerse (sin que el juego haya continuado)
//   controlChanged, basketSince   solo categoría 2: cambio de control de balón vivo o canasta válida desde el error
// }
// Devuelve { open, rule, reason }. `rule` es la rama aplicada (para el registro); `reason` explica el cierre de la ventana.
export function evaluateWindow(profile, cat, ctx) {
  const cfg = profile.regulation.corrections;
  if (cat === 2) {
    if (ctx.finished) return { open: false, rule: 'C2-final', reason: 'la corrección del reloj de posesión caduca con el final del encuentro' };
    if (ctx.basketSince) return { open: false, rule: 'C2-canasta', reason: 'caducó: hubo una canasta válida desde el error' };
    if (ctx.controlChanged) return { open: false, rule: 'C2-control', reason: 'caducó: cambió el control del balón vivo desde el error' };
    if (ctx.immediate || ctx.resumesSinceError === 0) return { open: true, rule: ctx.immediate ? 'C2-inmediata' : 'C2-primera-parada', reason: 'inmediatamente o en la primera parada, manteniendo el control y el derecho' };
    return { open: false, rule: 'C2-primera-parada', reason: 'caducó: el juego ya se reanudó tras la primera parada posterior' };
  }
  if (ctx.finished) {
    if (ctx.errorAfterLastStop && ctx.immediate) return { open: true, rule: 'C1-final-excepcion', reason: 'excepción al final: error posterior a la última parada, con corrección inmediata' };
    return { open: false, rule: 'C1-final', reason: 'al final solo sobrevive la excepción del error posterior a la última parada con corrección inmediata' };
  }
  const errorInFinal = inLastTwoOrOvertime(cfg, ctx.errorPeriod, ctx.errorRemaining);
  const nowInFinal = inLastTwoOrOvertime(cfg, ctx.period, ctx.remaining);
  if (errorInFinal) {
    // últimos 2:00 del cuarto periodo o prórroga: antes de reanudar tras la primera parada posterior al error
    return ctx.resumesSinceError === 0
      ? { open: true, rule: 'C1-ultimos-2min', reason: 'últimos 2:00 o prórroga: se corrige antes de reanudar tras la primera parada posterior' }
      : { open: false, rule: 'C1-ultimos-2min', reason: 'caducó: el juego ya se reanudó tras la primera parada posterior al error' };
  }
  if (!nowInFinal) return { open: true, rule: 'C1-antes-del-umbral', reason: 'antes de los últimos 2:00 del cuarto periodo: corregible antes del umbral' };
  // el error fue antes del umbral y se reconoce ya dentro: solo si la primera parada posterior cruza el umbral y aún no se reanudó
  const crosses = ctx.firstStop && inLastTwoOrOvertime(cfg, ctx.firstStop.period, ctx.firstStop.remaining);
  if (crosses && ctx.resumesSinceError === 0) return { open: true, rule: 'C1-parada-cruza-umbral', reason: 'la primera parada posterior cruza el umbral: se corrige antes de reanudar' };
  return { open: false, rule: 'C1-oportunidad-perdida', reason: 'caducó: se cruzó el umbral sin una primera parada posterior sin reanudar' };
}

// Valida la entrada tipada (sin consultar el estado del encuentro). Devuelve { ok, problems[] }.
export function validateCorrectionInput(profile, c) {
  const cfg = profile.regulation.corrections; const problems = [];
  if (!c || typeof c !== 'object') return { ok: false, problems: ['la corrección debe ser un objeto'] };
  const cls = classOf(profile, c.class);
  if (!cls) problems.push(`clase de corrección desconocida: «${c.class}» (admitidas: ${CLASS_IDS.join(', ')})`);
  if (!cfg.authorizedRequesters.includes(c.requester)) problems.push(`solicitante no habilitado: «${c.requester ?? 'ausente'}» (admitidos: ${cfg.authorizedRequesters.join(', ')})`);
  if (!c.error || typeof c.error !== 'object') problems.push('falta la descripción del error (hecho original, tipo)');
  else if (cls && c.error.kind !== cls.error) problems.push(`el tipo de error «${c.error.kind ?? 'ausente'}» no corresponde a la clase ${cls.id} (se espera ${cls.error})`);
  if (!c.correct || typeof c.correct !== 'object') problems.push('faltan los valores correctos autorizados: no se infiere el valor desde el marcador final');
  if (!c.recognizedAt || !(c.recognizedAt.immediate === true || c.recognizedAt.immediate === false)) problems.push('falta el instante de reconocimiento (recognizedAt.immediate)');
  return { ok: problems.length === 0, problems, class: cls };
}
