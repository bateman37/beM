// Relaciones y referencias de las tablas de entrenador y memoria (MOTOR-08, §13.2): referencias, prioridades, unidades y límites. No acepta valores
// negativos, NaN, ventanas imposibles ni acciones que referencien una cobertura, un estilo o una política inexistentes; un ajuste extremo no puede
// invalidar la elegibilidad (la exclusión por faltas procede de la administración común) ni consumir recursos inexistentes.
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const KNOWN_PREFERENCES = ['remove', 'obey_manual', 'protect', 'reduce_risk_consider_relief', 'compare_closing_value', 'accept_risk_keep_reference'];
const KNOWN_WHEN = ['unavailable', 'manualOrder', 'period', 'periodLast', 'foulsMin', 'closingWindow', 'secondsAtMost', 'marginAbsMax', 'deficitMin'];
const KNOWN_TIMEOUT_REASONS = ['prepareAction', 'runWithDisorder', 'repeatedDefensiveProblem', 'reorganize', 'contextualRest'];
const KNOWN_CONTEXTS = ['seekThree', 'fastAttack', 'urgent', 'closeContest', 'protectLead'];
const RESPONSE_TYPES = ['defCoverage', 'defStylesDelta', 'defSpecial'];

export function motor08Issues(profile, add) {
  const c = profile.coach; const m = profile.memory;
  if (!c || !m) return;
  const rules = profile.rules ?? {}; const cat = profile.activeCatalog ?? {};
  const attrs = profile.attributeOrder ?? [];
  const err = (id, rule, msg, v) => add(id, 'error', rule, msg, v);
  const warn = (id, rule, msg, v) => add(id, 'aviso', rule, msg, v);
  // --- políticas
  const policyIds = Object.keys(c.policies ?? {});
  if (JSON.stringify(policyIds) !== JSON.stringify(cat.coachPolicies ?? [])) err('coach.policies', 'catálogo', 'las políticas del perfil deben coincidir con el catálogo activo de políticas', policyIds);
  for (const [id, p] of Object.entries(c.policies ?? {})) {
    const at = (k) => `coach.policies.${id}.${k}`;
    for (const k of ['energyReview', 'benchReadyEnergy', 'criticalEnergyReview']) if (fin(p[k]) && (p[k] < 0 || p[k] > 100)) err(at(k), 'dominio', 'la energía está entre 0 y 100', p[k]);
    if (fin(p.criticalEnergyReview) && fin(p.energyReview) && !(p.criticalEnergyReview < p.energyReview)) err(at('criticalEnergyReview'), 'umbrales', 'la energía crítica debe ser menor que la de revisión (si no, la fatiga normal no se distingue de la crítica)', p.criticalEnergyReview);
    if (fin(p.energyReview) && fin(p.benchReadyEnergy) && !(p.benchReadyEnergy > p.energyReview)) warn(at('benchReadyEnergy'), 'histéresis', 'el umbral de retorno debería superar el de revisión: con el mismo valor se devuelve al jugador en cuanto lo cruza por una unidad', p.benchReadyEnergy);
    if (fin(p.minCourtStint) && fin(p.maxOrdinaryStintReview) && p.minCourtStint > p.maxOrdinaryStintReview) err(at('minCourtStint'), 'umbrales', 'el tramo mínimo en pista no puede superar el tramo que provoca la revisión adicional', p.minCourtStint);
    for (const k of ['minCourtStint', 'minBenchStint', 'maxOrdinaryStintReview', 'adjustmentHold', 'timeoutCooldown', 'closingWindow']) if (fin(p[k]) && (p[k] < 0 || p[k] > 3600)) err(at(k), 'dominio', 'los segundos deportivos están entre 0 y 3600', p[k]);
    if (fin(p.closingWindow) && p.closingWindow > (rules.overtimeSeconds ?? 300) * 2 + (rules.quarterSeconds ?? 600)) warn(at('closingWindow'), 'dominio', 'la ventana de cierre supera el periodo: no distingue un cierre', p.closingWindow);
    if (fin(p.replacementGain) && !(p.replacementGain > 0)) err(at('replacementGain'), 'dominio', 'la ventaja mínima ordinaria debe ser positiva: a igualdad de utilidad se conserva al jugador actual', p.replacementGain);
    for (const k of ['fatigueUtilitySacrifice', 'foulProtectionSacrifice']) if (fin(p[k]) && (p[k] < 0 || p[k] > 29)) err(at(k), 'dominio', 'la pérdida de utilidad aceptable está entre 0 y 29 puntos de la escala 1–30', p[k]);
    if (fin(p.timeoutReserve) && (!Number.isInteger(p.timeoutReserve) || p.timeoutReserve > 5)) err(at('timeoutReserve'), 'dominio', 'la reserva de pausas es un entero pequeño', p.timeoutReserve);
    if (fin(p.recognitionThreshold) && fin(m.saturation) && p.recognitionThreshold > m.saturation) err(at('recognitionThreshold'), 'umbrales', 'el umbral de reconocimiento supera la saturación de la memoria: nunca se reconocería un patrón', p.recognitionThreshold);
  }
  if (!policyIds.includes(c.defaultPolicy)) err('coach.defaultPolicy', 'catálogo', 'la política por defecto debe existir', c.defaultPolicy);
  // --- comunes y rotación
  const ra = c.common?.runAlarm; if (ra) for (const k of ['windowAttacks', 'adverseMarginPoints', 'comfortableOpportunities', 'disorderIncidents']) if (!fin(ra[k]) || ra[k] < 1) err(`coach.common.runAlarm.${k}`, 'dominio', 'debe ser un número positivo', ra[k]);
  for (const k of ['urgent', 'fastAttack', 'seekThree']) { const x = c.common?.[k]; if (x && (!fin(x.deficitPoints) || x.deficitPoints < 1 || !fin(x.seconds) || x.seconds < 1)) err(`coach.common.${k}`, 'dominio', 'desventaja y segundos deben ser positivos', x); }
  const rot = c.rotation;
  if (rot) {
    if (!Number.isInteger(rot.ordinaryPackageMax) || rot.ordinaryPackageMax < 1 || rot.ordinaryPackageMax > 5) err('coach.rotation.ordinaryPackageMax', 'dominio', 'el paquete ordinario es de 1 a 5 sustituciones', rot.ordinaryPackageMax);
    if (fin(rot.needBlend) && (rot.needBlend < 0 || rot.needBlend > 1)) err('coach.rotation.needBlend', 'dominio', 'el peso de la necesidad está entre 0 y 1', rot.needBlend);
    const pt = rot.participation;
    if (pt && fin(pt.starterMinutes) && fin(pt.reliefMinutes) && fin(pt.pairs)) {
      const reg = ((rules.quarters ?? 4) * (rules.quarterSeconds ?? 600)) / 60;
      if (Math.abs(pt.starterMinutes + pt.reliefMinutes - reg) > 1e-9) err('coach.rotation.participation.starterMinutes', 'suma', `titular + relevo deben sumar el tiempo reglamentario (${reg} min): un jugador que cubre dos funciones no recibe dos objetivos acumulados`, pt.starterMinutes + pt.reliefMinutes);
      if (pt.pairs !== 5) err('coach.rotation.participation.pairs', 'dominio', 'cinco parejas funcionales (una por posición)', pt.pairs);
    }
    for (const [n, rec] of Object.entries(rot.needRecipes ?? {})) for (const cap of Object.keys(rec)) if (!attrs.includes(cap)) err(`coach.rotation.needRecipes.${n}.${cap}`, 'catálogo', 'capacidad desconocida', cap);
  }
  // --- librillo: referencias, prioridades y límites (ninguna fila excepciona la exclusión por faltas)
  (c.foulBook ?? []).forEach((r, i) => {
    const at = `coach.foulBook.${i}`;
    if (!KNOWN_PREFERENCES.includes(r.preference)) err(`${at}.preference`, 'catálogo', `preferencia desconocida (${KNOWN_PREFERENCES.join(', ')})`, r.preference);
    if (!Number.isInteger(r.priority) || r.priority < 0) err(`${at}.priority`, 'dominio', 'la prioridad es un entero no negativo', r.priority);
    for (const k of Object.keys(r.when ?? {})) if (!KNOWN_WHEN.includes(k)) err(`${at}.when.${k}`, 'catálogo', 'condición desconocida', k);
    const w = r.when ?? {};
    if (w.foulsMin != null && (!Number.isInteger(w.foulsMin) || w.foulsMin < 0)) err(`${at}.when.foulsMin`, 'dominio', 'las faltas mínimas son un entero no negativo', w.foulsMin);
    if (w.foulsMin != null && w.foulsMin >= (rules.foulOut ?? 5) && r.preference !== 'remove') err(`${at}.when.foulsMin`, 'elegibilidad', `con ${w.foulsMin} faltas el jugador ya está excluido (${rules.foulOut}): ninguna fila de entrenador puede mantenerlo`, w.foulsMin);
    if (w.period != null && (!Array.isArray(w.period) || w.period.some((p) => !Number.isInteger(p) || p < 1 || p > (rules.quarters ?? 4)))) err(`${at}.when.period`, 'dominio', 'los periodos reglamentarios son enteros de 1 al último cuarto (una prórroga no es un nuevo primer cuarto)', w.period);
    if (w.closingWindow != null && !['inside', 'outside'].includes(w.closingWindow)) err(`${at}.when.closingWindow`, 'catálogo', 'dentro o fuera de la ventana de cierre', w.closingWindow);
    for (const k of ['secondsAtMost', 'marginAbsMax', 'deficitMin']) if (w[k] != null && (!fin(w[k]) || w[k] < 0)) err(`${at}.when.${k}`, 'dominio', 'no puede ser negativo', w[k]);
  });
  // --- pausas
  const t = c.timeouts;
  if (t) {
    for (const k of t.reasons ?? []) if (!KNOWN_TIMEOUT_REASONS.includes(k)) err('coach.timeouts.reasons', 'catálogo', `causa de pausa desconocida: ${k}`, k);
    for (const k of t.urgentReasons ?? []) if (!(t.reasons ?? []).includes(k)) err('coach.timeouts.urgentReasons', 'catálogo', `la causa urgente ${k} no está entre las causas de pausa`, k);
    for (const [g, o] of Object.entries(t)) if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) if (!fin(v) || v < 0) err(`coach.timeouts.${g}.${k}`, 'dominio', 'no puede ser negativo ni NaN', v);
  }
  const ad = c.adjustments?.styleLevelBounds;
  if (ad && (ad[0] !== 1 || ad[1] !== 5)) err('coach.adjustments.styleLevelBounds', 'invariante', 'los estilos son niveles enteros de 1 a 5', ad);
  // --- finales
  const ids = new Set(); const styleKeys = Object.keys(profile.scenario?.plans?.[0]?.styles ?? {}); const defKeys = Object.keys(profile.scenario?.plans?.[0]?.defStyles ?? {});
  (c.endgame?.contexts ?? []).forEach((x, i) => {
    const at = `coach.endgame.contexts.${i}`;
    if (!KNOWN_CONTEXTS.includes(x.id)) err(`${at}.id`, 'catálogo', `contexto desconocido: ${x.id}`, x.id); if (ids.has(x.id)) err(`${at}.id`, 'duplicado', 'contexto repetido', x.id); ids.add(x.id);
    for (const [k, v] of Object.entries(x.offenseStyles ?? {})) if (!styleKeys.includes(k) || !Number.isInteger(v) || v < 1 || v > 5) err(`${at}.offenseStyles.${k}`, 'catálogo', 'estilo ofensivo conocido con nivel entero 1–5', v);
    for (const [k, v] of Object.entries(x.defenseStyles ?? {})) if (!defKeys.includes(k) || !Number.isInteger(v) || v < 1 || v > 5) err(`${at}.defenseStyles.${k}`, 'catálogo', 'estilo defensivo conocido con nivel entero 1–5', v);
    for (const s of ['leading', 'trailing', 'tied']) for (const n of x.needs?.[s] ?? []) if (!(n in (c.rotation?.needRecipes ?? {}))) err(`${at}.needs.${s}`, 'catálogo', `necesidad sin receta: ${n}`, n);
  });
  for (const [i, w] of (c.endgame?.stopClockWindows ?? []).entries()) if (!fin(w.deficitMin) || w.deficitMin < 1 || !fin(w.secondsMax) || w.secondsMax <= 0) err(`coach.endgame.stopClockWindows.${i}`, 'dominio', 'ventana imposible: desventaja ≥ 1 y segundos positivos', w);
  // --- memoria: capacidad y curva con límites técnicos razonables
  if (!Number.isInteger(m.capacity) || m.capacity < 1 || m.capacity > 16) err('memory.capacity', 'dominio', 'la capacidad es un entero de 1 a 16 (la semilla es 8; aumentarla por comodidad no es una mejora demostrada)', m.capacity);
  if (!fin(m.halfLifeAttacks) || m.halfLifeAttacks < 1 || m.halfLifeAttacks > 50) err('memory.halfLifeAttacks', 'dominio', 'la semivida está entre 1 y 50 ataques rivales', m.halfLifeAttacks);
  if (fin(m.saturation) && fin(m.incrementPerExposure) && !(m.saturation >= m.incrementPerExposure && m.incrementPerExposure > 0)) err('memory.saturation', 'umbrales', 'la saturación debe alcanzar al menos un incremento y el incremento ser positivo', m.saturation);
  if (fin(m.discardThreshold) && fin(m.saturation) && !(m.discardThreshold < m.saturation)) err('memory.discardThreshold', 'umbrales', 'el umbral de descarte debe ser menor que la saturación', m.discardThreshold);
  if (fin(m.recognition?.minComfortableShare) && (m.recognition.minComfortableShare < 0 || m.recognition.minComfortableShare > 1)) err('memory.recognition.minComfortableShare', 'dominio', 'la proporción está entre 0 y 1', m.recognition.minComfortableShare);
  const pids = new Set((m.patterns ?? []).map((p) => p.id));
  const byPattern = {};
  (m.responses ?? []).forEach((r, i) => {
    const at = `memory.responses.${i}`; const o = r.order ?? {};
    if (!pids.has(r.pattern)) err(`${at}.pattern`, 'referencia', `el patrón ${r.pattern} no existe`, r.pattern);
    (byPattern[r.pattern] ??= []).push(r.priority);
    if (!RESPONSE_TYPES.includes(o.type)) err(`${at}.order.type`, 'catálogo', `acción desconocida: ${o.type}`, o.type);
    if (o.type === 'defCoverage' && !(cat.coverage ?? []).includes(o.coverage)) err(`${at}.order.coverage`, 'referencia', `la cobertura ${o.coverage} no existe en el catálogo activo`, o.coverage);
    if (o.type === 'defStylesDelta' && (!defKeys.includes(o.key) || !Number.isInteger(o.delta) || o.delta === 0 || Math.abs(o.delta) > 2)) err(`${at}.order`, 'referencia', 'estilo defensivo conocido y variación entera de ±1 o ±2 niveles', o);
    if (o.type === 'defSpecial' && !['ESPD02', 'ESPD03'].includes(o.special)) err(`${at}.order.special`, 'referencia', 'solo ESPD02 y ESPD03 son instrucciones persistentes del plan', o.special);
  });
  for (const [p, list] of Object.entries(byPattern)) if (new Set(list).size !== list.length) err(`memory.responses`, 'prioridad', `el patrón ${p} tiene dos respuestas con la misma prioridad`, list);
}
