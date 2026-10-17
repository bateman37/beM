// Filas del diccionario para SEM-MOTOR13 (LAB01/REF: auditoría, sensibilidad y calibración). Mismo contrato que rows.js. Son preferencias de LECTURA y pasos del editor:
// NO son multiplicadores deportivos, no cambian ninguna probabilidad ni el azar deportivo, no entran en la huella de trayectoria y ningún umbral de alerta limita un partido
// en ejecución. Un informe conserva los valores con que se calculó; cambiar estas filas después solo afecta a las lecturas siguientes.
const EXT = 'SEM-MOTOR13';
const A = { cls: 'balance', views: ['laboratorio'], ext: EXT, optional: true, grp: 'LAB01', mech: 'audit/index.js' };
const NOT_SPORT = 'Solo cambia cómo se lee y se avisa sobre evidencia ya generada; el deporte de cada partido y su azar no se tocan.';
const row = (path, type, unit, label, desc, effect = NOT_SPORT) => ({ ...A, path, type, unit, label: () => label, desc: () => desc, effect: () => effect });

export const MOTOR13_FAMILIES = [
  row('audit.contextsPerCapability', 'count', 'contextos', 'Auditoría · contextos fijos por capacidad', 'Máximo de contextos registrados por capacidad que usa el contraste de cálculo fijo (precarga 24, selección determinista por tarea/actor/fase antes de mirar el acierto). No recorta los registros originales.'),
  row('audit.sensitivityIncrements.0', 'count', 'puntos de capacidad', 'Auditoría · incremento de sensibilidad 1', 'Primer incremento del contraste de cálculo fijo (precarga +1; la capacidad se limita a 1–30 y la saturación se declara).'),
  row('audit.sensitivityIncrements.1', 'count', 'puntos de capacidad', 'Auditoría · incremento de sensibilidad 2', 'Segundo incremento (precarga +3).'),
  row('audit.sensitivityIncrements.2', 'count', 'puntos de capacidad', 'Auditoría · incremento de sensibilidad 3', 'Tercer incremento (precarga +5).'),
  row('audit.reliabilityBins', 'count', 'intervalos', 'Auditoría · intervalos de fiabilidad', 'Número de intervalos del diagrama de fiabilidad (precarga 5, fronteras fijas 0,2 / 0,4 / 0,6 / 0,8; el último incluye 1).'),
  row('audit.reliabilityWarn.minDecisions', 'count', 'decisiones', 'Auditoría · aviso de muestra de fiabilidad (decisiones)', 'Menos de este número de decisiones por grupo marca la lectura como muestra escasa (precarga 100). Cautela editorial, no prueba de precisión al superarlo.'),
  row('audit.reliabilityWarn.minMatches', 'count', 'partidos', 'Auditoría · aviso de muestra de fiabilidad (partidos)', 'Menos de este número de partidos por grupo marca la lectura como muestra escasa (precarga 3).'),
  row('audit.familyConcentration.share', 'fraction', 'fracción', 'Auditoría · concentración de familia', 'Una familia de ejecución por encima de esta fracción de las ejecuciones elegibles genera un aviso (precarga 0,80). Es un aviso, no un defecto.'),
  row('audit.familyConcentration.minUnits', 'count', 'ejecuciones', 'Auditoría · mínimo de ejecuciones para avisar por familia', 'Denominador mínimo (precarga 40).'),
  row('audit.familyConcentration.minMatches', 'count', 'partidos', 'Auditoría · mínimo de partidos para avisar por familia', 'Presencia mínima en partidos (precarga 3).'),
  row('audit.finalizerConcentration.share', 'fraction', 'fracción', 'Auditoría · concentración de finalizador', 'Un jugador por encima de esta fracción de las F de su equipo genera un aviso (precarga 0,60).'),
  row('audit.finalizerConcentration.minUnits', 'count', 'F', 'Auditoría · mínimo de F para avisar por finalizador', 'Denominador mínimo (precarga 40).'),
  row('audit.finalizerConcentration.minMatches', 'count', 'partidos', 'Auditoría · mínimo de partidos para avisar por finalizador', 'Presencia mínima en partidos (precarga 3).'),
  row('audit.loopRevisits', 'count', 'revisitas', 'Auditoría · repetición sin progreso', 'Revisitas consecutivas del mismo estado lógico sin avance de tiempo ni cambio causal que generan una señal (precarga 10). No corta la posesión.'),
  row('audit.examplesPerFinding', 'count', 'ejemplos', 'Auditoría · ejemplos iniciales de un hallazgo', 'Ejemplos mostrados de entrada; el resto de la evidencia queda paginado (precarga 5).'),
  row('audit.campaign.explorationMatches', 'count', 'encuentros', 'Auditoría · nuevos encuentros exploratorios', 'Doce contrastes × dos variantes (precarga 24).'),
  row('audit.campaign.fullDiagnostics', 'count', 'encuentros', 'Auditoría · diagnósticos completos nuevos', 'Cuatro dentro de los 24 (EXP13-08 y EXP13-11).'),
  row('audit.campaign.validationReserveMax', 'count', 'encuentros', 'Auditoría · reserva de validación (máximo)', 'Hasta ocho encuentros reducidos solo si existe candidata real (precarga 8).'),
  row('audit.campaign.explorationSeedBase', 'count', 'semilla de lote', 'Auditoría · semilla inicial exploratoria', 'EXP13-01 usa 131001, y así hasta 131012.'),
  row('audit.campaign.validationSeedBase', 'count', 'semilla de lote', 'Auditoría · semilla inicial de validación', 'Los cuatro casos reservados usan 132001–132004.'),
  row('audit.calibrationStep.p0Absolute', 'fraction', 'probabilidad absoluta', 'Calibración · paso de p0 binaria', 'Paso del editor de candidatas para p0 binaria (precarga ±0,01 absoluto, validando rango). No se aplica a umbrales reglamentarios.'),
  row('audit.calibrationStep.logitPerPoint', 'fraction', 'logit por punto', 'Calibración · paso de sensibilidad logit por punto', 'Paso para sensibilidades en logit por punto de capacidad (precarga ±0,005).'),
  row('audit.calibrationStep.loadFactorRelative', 'fraction', 'fracción del valor', 'Calibración · paso de factor de carga/desgaste', 'Paso relativo para factores de carga, desgaste o duración (precarga ±5 %).'),
  row('audit.calibrationStep.maxHypotheses', 'count', 'hipótesis', 'Calibración · hipótesis por pasada', 'Máximo de hipótesis de calibración de la primera pasada (precarga 1).'),
  row('audit.calibrationStep.maxChangedRows', 'count', 'filas', 'Calibración · filas efectivas por candidata', 'Máximo de filas efectivas alteradas por candidata en la primera pasada (precarga 3).'),
];
export const MOTOR13_EXEMPT = [/^audit\.(version|name|provenance|resultSchema)$/];
