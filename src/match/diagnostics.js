// Consultas diagnósticas iniciales de MOTOR-06 (§10.2): solo datos calculados del propio encuentro. Cada tasa lleva su numerador y su
// denominador; un denominador cero es «no calculable», nunca cero observado. Si una capa no se registra se declara «no disponible»: no se
// reconstruye desde el fallo de un tiro. No es el catálogo estadístico avanzado (MOTOR-09) ni carga tasas empíricas externas.
const rate = (num, den) => ({ num, den, tasa: den > 0 ? num / den : null, calculable: den > 0 });

export function diagnosticQueries(res) {
  const opps = res.diagnostics.opportunities ?? [];
  const chains = res.diagnostics.throwInChains ?? [];
  const attempts = res.events.filter((e) => e.type === 'attempt');
  const shots = attempts.filter((e) => e.stats?.some((s) => s.k === 'shot'));
  const famOf = (id) => res.profile.repertoire?.plays?.[id]?.family ?? null;

  const starts = opps.filter((o) => o.frontier === 'organizedStart');
  const uso = (f) => { const el = starts.filter((o) => o.directasElegibles > 0 && f(o)); return { ...rate(el.filter((o) => o.procedencia === 'decisión directa').length, el.length), nombre: 'Uso directo inicial', definicion: 'ataques iniciados por decisión directa / ataques elegibles (con al menos una opción directa) del contexto declarado' }; };

  const transShots = shots.filter((e) => e.intent?.contexto === 'transición');
  const triple = { ...rate(transShots.filter((e) => e.intent?.zona === 'three').length, transShots.length), nombre: 'Triple de transición', definicion: 'intentos de tres en transición / tiros de transición (por posesión sería otra tasa con otro nombre)' };

  const acc = opps.filter((o) => o.frontier === 'acceptance');
  const bySit = {};
  for (const o of acc) { const k = o.situacion; (bySit[k] ??= { ofrecidas: 0, aceptadas: 0 }); bySit[k].ofrecidas += 1; if (o.aceptada) bySit[k].aceptadas += 1; }
  const aceptacion = { ...rate(acc.filter((o) => o.aceptada).length, acc.length), nombre: 'Aceptación inmediata', definicion: 'oportunidades inmediatas aceptadas / oportunidades inmediatas ofrecidas y comparables (misma situación); una opción elegible pero no ofrecida a una decisión no cuenta como rechazo consciente', porSituacion: Object.fromEntries(Object.entries(bySit).map(([k, v]) => [k, rate(v.aceptadas, v.ofrecidas)])) };

  const plays = starts.filter((o) => o.eleccion === 'ficha' || o.eleccion === 'recurso autónomo');
  const familias = {};
  for (const o of plays) { const f = famOf(o.opcion); if (!f) continue; const r = (familias[f] ??= { auto: 0, total: 0 }); r.total += 1; if (o.eleccion === 'recurso autónomo') r.auto += 1; }
  const autonoma = { nombre: 'Familia autónoma', definicion: 'ejecuciones familiares sin llamada del plan (recurso autónomo) / ejecuciones de esa familia del universo comparable', porFamilia: Object.fromEntries(Object.entries(familias).map(([f, v]) => [f, rate(v.auto, v.total)])), ...rate(Object.values(familias).reduce((s, v) => s + v.auto, 0), Object.values(familias).reduce((s, v) => s + v.total, 0)) };

  const early = shots.filter((e) => ['temprano', 'transición'].includes(e.intent?.contexto));
  const temprano = { ...rate(early.filter((e) => e.intent?.calidad === 'forced').length, early.length), nombre: 'Temprano forzado', definicion: 'tiros tempranos o de transición con calidad previa forzada (clasificada antes del desenlace) / tiros tempranos o de transición' };

  const withFirst = chains.filter((c) => c.intentos.length > 0);
  const saque = {
    nombre: 'Primera opción de saque', definicion: 'inicios y recepciones REALES con su exposición y sus negaciones; las solicitudes (llamadas) se cuentan aparte y no se mezclan con las ejecuciones',
    inicios: chains.length, primeraOpcionRecibida: withFirst.filter((c) => !c.intentos[0].negada).length, primeraOpcionNegada: withFirst.filter((c) => c.intentos[0].negada).length,
    alternativaUsada: chains.filter((c) => c.opcionUsada === 'alternativa').length, seguridadUsada: chains.filter((c) => c.opcionUsada === 'seguridad').length, infraccionDePlazo: chains.filter((c) => c.cierre === 'infracción del plazo').length,
    ...rate(withFirst.filter((c) => c.intentos[0].negada).length, withFirst.length),
    solicitudes: { llamadas: res.orders.filter((o) => o.type === 'throwInCall').length, consumidas: res.orders.filter((o) => o.type === 'throwInCall' && o.state === 'consumida').length, caducadas: res.orders.filter((o) => o.type === 'throwInCall' && o.state === 'caducada').length },
    produccionDirecta: { puntos: chains.reduce((s, c) => s + c.puntosDirectos, 0), nota: 'solo puntos de la secuencia directa del saque; los posteriores a una nueva organización no se cuentan otra vez' },
  };
  return {
    capas: { elegible: 'disponible', percibida: 'no disponible (la lectura q pondera la mezcla; no hay una puerta de percepción independiente)', elegida: 'disponible', ejecutada: 'disponible', resultado: 'disponible' },
    usoDirectoInicial: { todos: uso(() => true), temprano: uso((o) => o.temprano), organizado: uso((o) => !o.temprano) },
    tripleDeTransicion: triple, aceptacionInmediata: aceptacion, familiaAutonoma: autonoma, tempranoForzado: temprano, primeraOpcionDeSaque: saque,
  };
}
