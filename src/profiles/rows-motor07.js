// Filas del diccionario para SEM-MOTOR07 (Forma, presión, momentos, T, episodios y conexiones nuevas). Mismo contrato que las familias de rows.js:
// cada magnitud tiene tipo, unidad, rango, clase, grupo, consumidor y efecto; las políticas codificadas se declaran «sin consumidor» en lugar de
// fingir que el motor las lee. Las tablas declarativas (stateTasks, episodeCatalog) son contenido: se ven en el panel pero no se editan como balance.
const EXT = 'SEM-MOTOR07';
const SCOPES = ['shot', 'offensiveControl', 'defenseDispute', 'coordination'];
const SCOPE_N = { shot: 'tiro', offensiveControl: 'control ofensivo', defenseDispute: 'defensa y disputa', coordination: 'coordinación' };
const MOM = { M_TIR: 'M-TIR (tiro)', M_OFE: 'M-OFE (control y ejecución ofensiva)', M_DEF: 'M-DEF (defensa y disputa)', T: 'T (momento colectivo del equipo)' };
const PAUSES = { timeout: 'tiempo muerto', shortInterval: 'intervalo corto (cuarto o prórroga)', halftime: 'descanso largo' };
const TASKS07 = ['shotConversion', 'freeThrow', 'control', 'opportunityQuality', 'block', 'rebound'];
const TASK07_N = { shotConversion: 'conversión de un tiro de campo', freeThrow: 'tiro libre', control: 'control del balón', opportunityQuality: 'calidad previa de la oportunidad', block: 'tapón', rebound: 'rebote' };
const EPIS = ['EPI01', 'EPI02', 'EPI03', 'EPI04', 'EPI05', 'EPI06'];
const fam = (f) => f;
const base = { cls: 'balance', views: ['estados'], ext: EXT };

export const MOTOR07_FAMILIES = [
  // ------------------------------------------------------------------ Forma (ACT06)
  fam({ ...base, path: 'form.range', node: 'array', type: 'pair', pair: 'range', unit: 'escala de Forma', cls: 'invariante', grp: 'ACT06', mech: 'validateInput', elems: ['mínimo', 'máximo'],
    label: () => 'Escala de Forma', desc: () => 'Forma continua y acotada: de −1 (muy mala etapa) a +1 (muy buena etapa). Se recibe al empezar el encuentro y se valida contra este rango.', effect: () => 'Protegida: la Forma no sube por anotar ni baja por perder; no se reinicia al cambiar de periodo.' }),
  fam({ ...base, path: 'form.neutral', type: 'logit', unit: 'Forma', cls: 'invariante', grp: 'ACT06', mech: 'upgradeInput', coverage: 'sin_consumidor',
    label: () => 'Forma neutral', desc: () => 'Valor sin efecto. La política de entrada inicial usa `initialStatePolicy`; esta fila solo declara el centro del dominio.', effect: () => 'Declarada: el centro simétrico es 0 por construcción.' }),
  fam({ ...base, path: 'form.taskMaxLogit.{s}', dom: { s: SCOPES }, type: 'weight', unit: 'logit con Forma ±1', grp: 'ACT06', mech: 'formPressure',
    label: (m) => `Forma · efecto máximo en ${SCOPE_N[m.s]}`, desc: (m) => `Logit que aporta la Forma ±1 al lado ejecutante de una tarea de ${SCOPE_N[m.s]}; con contraparte, se resta su aporte y el resultado conjunto se limita a este máximo.`,
    effect: () => 'Se aplica por ámbito, una sola vez por tarea, sin alterar las notas permanentes, la velocidad ni el tamaño. Un 12 en buena Forma no supera automáticamente a un 18.' }),
  // ------------------------------------------------------------------ Presión (ACT09)
  fam({ ...base, path: 'pressure.importance.{k}', dom: { k: ['ordinary', 'important', 'decisive'] }, type: 'fraction', unit: 'exigencia (0–1)', grp: 'ACT09', mech: 'pressureNow',
    label: (m) => `Importancia del encuentro · ${{ ordinary: 'ordinario', important: 'importante', decisive: 'decisivo' }[m.k]}`, desc: () => 'Exigencia de importancia que corresponde a la categoría de competición elegida en la entrada del encuentro.',
    effect: () => 'La exigencia de presión es el máximo entre importancia y tensión, no su suma. No cambia automáticamente por un resultado parcial.' }),
  fam({ ...base, path: 'pressure.latePeriodWindowSeconds', type: 'seconds', unit: 's', grp: 'ACT09', mech: 'pressureNow',
    label: () => 'Tensión · ventana final del periodo', desc: () => 'Segundos finales del periodo en los que crece la tensión de reloj (l = 1 − restante/ventana).', effect: () => 'Semilla: no es una definición universal de «final ajustado».' }),
  fam({ ...base, path: 'pressure.closeMarginPoints', type: 'points', unit: 'puntos', grp: 'ACT09', mech: 'pressureNow',
    label: () => 'Tensión · margen que se considera ajustado', desc: () => 'Margen de puntos con el que la tensión de marcador es máxima (c = 1 − |margen|/margen de referencia).', effect: () => 'Sin conocimiento del siguiente resultado; se calcula con el marcador actual.' }),
  fam({ ...base, path: 'pressure.periodTensionWeight.{k}', dom: { k: ['Q1_Q2_Q3', 'Q4_OT'] }, type: 'fraction', unit: 'peso (0–1)', grp: 'ACT09', mech: 'pressureNow',
    label: (m) => `Tensión · peso del periodo ${m.k === 'Q4_OT' ? 'cuarto y prórrogas' : 'primero a tercero'}`, desc: () => 'Peso de la tensión según el periodo: tension = peso · l · c.', effect: () => 'Una acción importante puede ocurrir antes del último cuarto: el peso no es cero en los primeros periodos.' }),
  fam({ ...base, path: 'pressure.taskMaxLogitLoss.{s}', dom: { s: SCOPES }, type: 'weight', unit: 'logit con exigencia 1', grp: 'ACT09', mech: 'formPressure',
    label: (m) => `Presión · pérdida máxima en ${SCOPE_N[m.s]}`, desc: (m) => `Logit que pierde el ejecutante de una tarea de ${SCOPE_N[m.s]} con exigencia 1 y Rendimiento bajo presión mínimo: k · P · (1 − a(MEN07)).`,
    effect: () => 'MEN07 reduce la pérdida, no añade talento: con MEN07 máximo la pérdida es cero, no una ganancia.' }),
  fam({ ...base, path: 'pressure.choiceMaximumDecisionPointsLost', type: 'points', unit: 'puntos de Decisiones', grp: 'ACT09', mech: 'choicePenalty',
    label: () => 'Presión · puntos máximos de Decisiones perdidos en una elección', desc: () => 'En una elección pertinente la presión reduce MEN03 efectivo hasta 2·P·(1 − a(MEN07)) puntos para esa valoración, sin tocar la nota base.', effect: () => 'No se repite como castigo adicional a la ejecución: selección y técnica son tareas distintas.' }),
  fam({ ...base, path: 'pressure.combinedFormPressureLogitBounds', node: 'array', type: 'pair', pair: 'range', unit: 'logit', grp: 'ACT11', mech: 'formPressure', elems: ['mínimo', 'máximo'],
    label: () => 'Presupuesto conjunto de Forma y presión', desc: () => 'Límites del ajuste determinista conjunto (Forma − pérdida por presión) de una tarea, en logit.', effect: () => 'Se aplica una vez por tarea; no se usa para anular el deterioro de energía.' }),
  // ------------------------------------------------------------------ Momento individual (ACT07, ACT08, ACT11, ACT12)
  fam({ ...base, path: 'moment.range', node: 'array', type: 'pair', pair: 'range', unit: 'escala de momento', cls: 'invariante', grp: 'ACT07', mech: 'flushMoment', elems: ['mínimo', 'máximo'],
    label: () => 'Escala de los momentos', desc: () => 'Cada ámbito (M-TIR, M-OFE, M-DEF) y T viven en [−1, 1].', effect: () => 'Protegida.' }),
  fam({ ...base, path: 'moment.neutral', type: 'logit', unit: 'momento', cls: 'invariante', grp: 'ACT07', mech: 'flushMoment',
    label: () => 'Momento neutral', desc: () => 'Centro hacia el que decae el momento.', effect: () => 'Protegida.' }),
  fam({ ...base, path: 'moment.{k}', dom: { k: ['playingHalfLifeSeconds', 'benchHalfLifeSeconds'] }, type: 'seconds', unit: 's de juego', grp: 'ACT07', mech: 'flushMoment',
    label: (m) => (m.k === 'playingHalfLifeSeconds' ? 'Momento · vida media en pista' : 'Momento · vida media en el banquillo'), desc: () => 'Tiempo deportivo en el que el estado recorre la mitad de su camino hacia neutral. rho = 2^(−Δ/vida media).',
    effect: () => 'Sentarse no concede impulsos y volver no reinicia la distribución; el banquillo solo atenúa (sin variación aleatoria).' }),
  fam({ ...base, path: 'moment.{k}', dom: { k: ['innovationSigmaLowConsistency', 'innovationSigmaHighConsistency'] }, type: 'weight', unit: 'amplitud', grp: 'ACT08', mech: 'consistencySigma',
    label: (m) => (m.k === 'innovationSigmaLowConsistency' ? 'Consistencia · amplitud con la mínima' : 'Consistencia · amplitud con la máxima'), desc: () => 'Desviación de la variación temporal del momento con Consistencia mínima/máxima; interpola linealmente con a(MEN06).',
    effect: () => 'Regula cuánto se aleja el momento de neutral, no el talento medio: la perturbación final es de media cero en contexto fijo.' }),
  fam({ ...base, path: 'moment.probabilityAlphaByTask.{s}', dom: { s: SCOPES }, type: 'fraction', unit: 'alpha (<1)', grp: 'ACT11', mech: 'perturbBinary',
    label: (m) => `Momento · alpha en ${SCOPE_N[m.s]}`, desc: () => 'Amplitud máxima relativa de la perturbación: p_m = p + alpha·Z·min(p, 1−p), con |Z| ≤ 1 y alpha < 1. Se aplica una sola vez por tarea, también cuando coinciden T y momento individual.',
    effect: () => 'Es el presupuesto conjunto de momento de la tarea. Con Z centrado la media de la salida final no cambia.' }),
  fam({ ...base, path: 'moment.{k}.{w}', dom: { k: ['individualCollectiveMixture'], w: ['individual', 'team'] }, type: 'recipeWeight', unit: 'peso (suma 1)', grp: 'ACT11', mech: 'momentMix', group: (m) => `moment.${m.k}`, sum: 1,
    label: (m) => `Mezcla individual/colectivo · ${m.w === 'team' ? 'T' : 'momento individual'}`, desc: () => 'En tareas colectivas permitidas, Z propio = peso individual · M + peso T · T. Las tareas individuales excluidas de T usan solo M.', effect: () => 'T no entra en la conversión de un tiro ya definido ni en el pase individual ya elegido.' }),
  fam({ ...base, path: 'moment.{k}.{w}', dom: { k: ['opposedMomentMixture'], w: ['actor', 'counterpart'] }, type: 'recipeWeight', unit: 'peso (suma 1)', grp: 'ACT11', mech: 'momentMix', group: (m) => `moment.${m.k}`, sum: 1,
    label: (m) => `Mezcla de tarea opuesta · ${m.w === 'actor' ? 'lado propio' : 'contraparte'}`, desc: () => 'Z = peso propio · Z propio − peso contraparte · Z contraparte; sin contraparte elegible se omite su término (no se inventa un defensor).', effect: () => 'El estado de la contraparte no se presta al decisor como conocimiento.' }),
  fam({ ...base, path: 'moment.pauseAttenuation.{k}', dom: { k: ['timeout', 'shortInterval', 'halftime'] }, type: 'fraction', unit: 'fracción que se conserva', grp: 'ACT12', mech: 'pauseMarker',
    label: (m) => `Momento · lo que conserva tras un ${PAUSES[m.k]}`, desc: () => 'Factor que multiplica el momento individual al pasar la pausa deportiva (una vez, para ambos equipos). 1 = no atenúa; 0 = neutral.',
    effect: () => 'No fija a neutral ni garantiza cortar una racha. Es distinto de la recuperación de energía. Una pausa de pantalla no lo aplica.' }),
  fam({ ...base, path: 'moment.categoryBoundaries', node: 'array', type: 'thresholds', unit: 'momento (−1…1)', cls: 'contenido', locked: true, grp: 'ACT07', mech: 'momentCategory',
    label: () => 'Fronteras de las categorías de momento', desc: () => 'Cuatro fronteras crecientes: Muy frío / Frío / Estable / Caliente / Muy caliente. Valen para M-TIR, M-OFE, M-DEF, T y Forma (con etiquetas adaptadas).', effect: () => 'Solo presentación cualitativa: una categoría no equivale a un porcentaje de tiro.' }),
  // ------------------------------------------------------------------ Momento colectivo (ACT10)
  fam({ ...base, path: 'teamMoment.range', node: 'array', type: 'pair', pair: 'range', unit: 'escala de T', cls: 'invariante', grp: 'ACT10', mech: 'teamMomentOf', elems: ['mínimo', 'máximo'],
    label: () => 'Escala de T', desc: () => 'Un solo T por equipo, acotado.', effect: () => 'Protegida.' }),
  fam({ ...base, path: 'teamMoment.neutral', type: 'logit', unit: 'T', cls: 'invariante', grp: 'ACT10', mech: 'teamMomentOf',
    label: () => 'T neutral', desc: () => 'Centro hacia el que decae T.', effect: () => 'Protegida.' }),
  fam({ ...base, path: 'teamMoment.halfLifeSeconds', type: 'seconds', unit: 's de juego', grp: 'ACT10', mech: 'teamMomentOf',
    label: () => 'T · vida media', desc: () => 'T decae de forma determinista: T_t = 2^(−Δ/vida media) · T.', effect: () => 'Una sustitución no lo borra ni lo recalcula como media de los cinco.' }),
  fam({ ...base, path: 'teamMoment.randomInnovationSigma', type: 'weight', unit: 'amplitud', cls: 'invariante', coverage: 'sin_consumidor', grp: 'ACT10', mech: null,
    label: () => 'T · variación aleatoria', desc: () => 'Declarada 0: T cambia solo por hechos reales (episodios colectivos) y por la entrada configurada.', effect: () => 'Invariante codificado: T no sortea; la validación del perfil rechaza un valor distinto de 0.' }),
  fam({ ...base, path: 'teamMoment.{k}', dom: { k: ['directShotConversionContribution', 'directChosenIndividualPassContribution'] }, type: 'weight', unit: 'logit', cls: 'invariante', coverage: 'sin_consumidor', grp: 'ACT10', mech: null,
    label: (m) => (m.k === 'directShotConversionContribution' ? 'T · aporte directo a la conversión de un tiro' : 'T · aporte directo al pase individual ya elegido'), desc: () => 'Declarado 0: T puede mejorar coordinación, atención compartida y elección (la calidad previa de la oportunidad), no la técnica de un tiro o pase ya definidos.',
    effect: () => 'Invariante codificado en stateTasks (team = no); la validación del perfil rechaza un valor distinto de 0.' }),
  fam({ ...base, path: 'teamMoment.pauseAttenuation.{k}', dom: { k: ['timeout', 'shortInterval', 'halftime'] }, type: 'fraction', unit: 'fracción que se conserva', grp: 'ACT12', mech: 'pauseMarker',
    label: (m) => `T · lo que conserva tras un ${PAUSES[m.k]}`, desc: () => 'Factor que multiplica T al pasar la pausa deportiva (una vez, para ambos equipos).', effect: () => 'No fija a neutral ni garantiza cortar una racha.' }),
  // ------------------------------------------------------------------ Episodios (ACT10)
  fam({ ...base, path: 'episodes.{k}', dom: { k: ['EPI01IndividualImpulse', 'EPI02IndividualImpulse', 'EPI03TeamImpulse', 'EPI04TeamImpulse', 'EPI05TeamImpulse'] }, type: 'logit', unit: 'impulso sobre el estado (±)', grp: 'ACT10', mech: 'episode',
    label: (m) => `Impulso máximo de ${m.k.slice(0, 5)}`, desc: (m) => `Magnitud máxima inicial de una señal elegible de ${m.k.slice(0, 5)}; se suma al estado efectivo de su frontera y se acota. No premia cualquier canasta.`,
    effect: () => 'Solo se aplica con evidencia representada por el motor; nunca a la probabilidad de la acción que lo causó.' }),
  fam({ ...base, path: 'episodes.difficultExecutionReferenceProbabilityMaximum', type: 'probability', unit: '%', grp: 'ACT10', mech: 'episodeShot',
    label: () => 'EPI01 · probabilidad previa máxima de una ejecución difícil', desc: () => 'Un tiro anotado cuenta como ejecución difícil significativa si su probabilidad previa (antes del momento) era como máximo esta.', effect: () => 'Subirla amplía el conjunto de canastas elegibles; sigue sin valer cualquier canasta.' }),
  fam({ ...base, path: 'episodes.deduplication', type: 'text', unit: 'política', cls: 'invariante', coverage: 'sin_consumidor', grp: 'ACT10', mech: null,
    label: () => 'Episodios · deduplicación', desc: () => 'Un impulso equivalente por cadena causal, destinatario y ámbito; las señales equivalentes posteriores se registran sin otro impulso.', effect: () => 'Invariante codificado (clave cadena|destino|ámbito en el registro de episodios tratados).' }),
  // ------------------------------------------------------------------ conexiones nuevas de capacidades (RES01)
  fam({ ...base, path: 'missingTaskConnections.longTravelAccessAttack.{cap}', dom: { cap: ['FIS01', 'FIS02', 'MEN04', 'TEC07'] }, type: 'recipeWeight', unit: 'peso (suma 1)', grp: 'RES01', mech: 'longTravelAccess', group: () => 'missingTaskConnections.longTravelAccessAttack', sum: 1, views: ['capacidades', 'estados'],
    label: (m, A) => `Recorrido largo de ataque · peso de ${A(m.cap)}`, desc: () => 'Receta del acceso de un atacante a la finalización de una transición (recorrido largo resumido). Sustituye a la receta de manejo (TAR02) como ponderación de quién termina la transición: no se suma a ella.',
    effect: () => 'Velocidad participa en llegar a la ventaja de transición; no mejora el acierto del tiro posterior ni crea rutas continuas.' }),
  fam({ ...base, path: 'missingTaskConnections.longTravelReturnDefense.{cap}', dom: { cap: ['FIS01', 'FIS02', 'MEN04'] }, type: 'recipeWeight', unit: 'peso (suma 1)', coverage: 'sin_consumidor', grp: 'RES01', mech: null, group: () => 'missingTaskConnections.longTravelReturnDefense', sum: 1, views: ['capacidades', 'estados'],
    label: (m, A) => `Retorno defensivo largo · peso de ${A(m.cap)}`, desc: () => 'Receta propuesta para el retorno defensivo. La tarea equivalente ya existe (selection.direct.defenderArrival conecta FIS01 y FIS02): no se aplica una segunda vez.', effect: () => 'Sin efecto como fila independiente (evita duplicar Velocidad en la misma causa).' }),
  fam({ ...base, path: 'missingTaskConnections.defensiveOptionReading.{cap}', dom: { cap: ['MEN02', 'MEN03', 'MEN04'] }, type: 'recipeWeight', unit: 'peso (suma 1)', grp: 'RES01', mech: 'defensiveReading', group: () => 'missingTaskConnections.defensiveOptionReading', sum: 1, views: ['capacidades', 'estados'],
    label: (m, A) => `Lectura defensiva de opciones · peso de ${A(m.cap)}`, desc: () => 'Receta con la que el defensor lee las opciones ofensivas existentes al decidir si intenta intervenir sobre el balón. Orienta la decisión con el ajuste por capacidad ya vigente (selection.abilityFit); no da conocimiento perfecto ni usa notas del base.',
    effect: () => 'Interpretación técnica reversible (la decisión de robo era solo de estilo). Un mejor lector decide intervenir con más frecuencia; la ejecución sigue siendo TAR07 (Robo, Anticipación y Agilidad).' }),
  fam({ ...base, path: 'missingTaskConnections.physicalAccessMaxEnergyPenalty', type: 'energyPenalty', unit: 'puntos de capacidad', grp: 'RES01', mech: 'longTravelAccess', views: ['capacidades', 'estados'],
    label: () => 'Acceso físico largo · deterioro máximo por energía', desc: () => 'Deterioro máximo por energía de la receta de recorrido largo.', effect: () => 'Selectivo: aplica la curva de gravedad de energía al máximo de esa tarea, no una reducción global.' }),
  // ------------------------------------------------------------------ política de entrada
  fam({ ...base, path: 'initialStatePolicy.{k}', dom: { k: ['form', 'M_TIR', 'M_OFE', 'M_DEF', 'T'] }, type: 'logit', unit: 'estado inicial', grp: 'ACT06', mech: 'upgradeInput',
    label: (m) => `Estado inicial por defecto · ${{ form: 'Forma', M_TIR: 'M-TIR', M_OFE: 'M-OFE', M_DEF: 'M-DEF', T: 'T' }[m.k]}`, desc: () => 'Política de entrada neutral: se aplica explícitamente al migrar una entrada anterior sin esos campos y se anota en la migración. Una entrada histórica con otra escala no se interpreta por adivinación.',
    effect: () => 'No sobrescribe un estado ya configurado ni una base publicada.' }),
  // ------------------------------------------------------------------ tablas declarativas
  fam({ ...base, path: 'stateTasks.tasks.{t}.{k}', dom: { t: TASKS07, k: ['scope', 'ownMoment', 'counterMoment', 'formCounterScope'] }, type: 'text', unit: 'declaración', cls: 'contenido', locked: true, grp: 'ACT11', mech: 'stateTask',
    label: (m) => `Tarea con estados · ${TASK07_N[m.t]} · ${{ scope: 'ámbito (alpha y límites)', ownMoment: 'momento propio', counterMoment: 'momento de la contraparte', formCounterScope: 'ámbito de Forma de la contraparte' }[m.k]}`,
    desc: (m) => `Declaración de la tarea «${TASK07_N[m.t]}»: qué ámbito, qué momento y qué tipo de distribución usa. Una tarea que no figura aquí no usa Forma, presión ni momentos.`, effect: () => 'Contenido: cambiarlo exige un mecanismo (el consumidor lo lee al resolver).' }),
  fam({ ...base, path: 'stateTasks.tasks.{t}.{k}', dom: { t: TASKS07, k: ['label', 'kind', 'note'] }, type: 'text', unit: 'texto documental', cls: 'contenido', locked: true, coverage: 'sin_consumidor', grp: 'ACT11', mech: null,
    label: (m) => `Tarea con estados · ${TASK07_N[m.t]} · ${{ label: 'nombre', kind: 'tipo de resultado', note: 'nota' }[m.k]}`,
    desc: (m) => `Texto documental de la tarea «${TASK07_N[m.t]}»: el motor no lo consulta; describe el tipo de resultado y su límite.`, effect: () => 'Sin efecto deportivo.' }),
  fam({ ...base, path: 'stateTasks.tasks.{t}.{k}', dom: { t: TASKS07, k: ['team', 'pressure'] }, type: 'bool', unit: 'sí/no', cls: 'invariante', locked: true, grp: 'ACT11', mech: 'stateTask',
    label: (m) => `Tarea con estados · ${TASK07_N[m.t]} · ${m.k === 'team' ? 'T elegible' : 'aplica presión'}`, desc: (m) => (m.k === 'team' ? 'Si T (momento colectivo) puede entrar en esta tarea. Solo la calidad previa de la oportunidad (coordinación) lo admite.' : 'Si la exigencia de presión se aplica a esta tarea.'),
    effect: () => 'Invariante funcional: T no entra en la conversión directa del tiro ni en el pase individual ya elegido.' }),
  fam({ ...base, path: 'stateTasks.tasks.control.favorableOutcomes', node: 'array', type: 'strlist', unit: 'resultados', cls: 'contenido', locked: true, grp: 'ACT11', mech: 'perturbCategories',
    label: () => 'Control del balón · resultados del grupo favorable G', desc: () => 'Resultados excluyentes en los que el ataque conserva el balón. La perturbación de momento reparte masa entre G y el resto con suma cero.', effect: () => 'G se vincula a los resultados reales del mecanismo de categorías; canasta y falta no se tratan como excluyentes dentro de la conversión.' }),
  fam({ ...base, path: 'stateTasks.tasks.opportunityQuality.favorableClasses', node: 'array', type: 'strlist', unit: 'clases', cls: 'contenido', locked: true, grp: 'ACT11', mech: 'perturbCategories',
    label: () => 'Calidad previa · clases del grupo favorable G', desc: () => 'Clases de calidad previa favorables al ataque. Una mejor coordinación crea una oportunidad más cómoda; el tiro posterior no recibe otra prima.', effect: () => 'Contenido: coherente con las clases cómoda/normal/forzada del mecanismo.' }),
  fam({ ...base, path: 'episodeCatalog.episodes.{e}.{k}', dom: { e: EPIS, k: ['name', 'target', 'impulseKey'] }, type: 'text', unit: 'declaración', cls: 'contenido', locked: true, grp: 'ACT10', mech: 'episode',
    variant: (m) => (m.e === 'EPI06' && m.k !== 'name' ? { coverage: 'sin_consumidor', note: 'EPI06 no produce un impulso: es una atenuación por pausa (moment.pauseAttenuation y teamMoment.pauseAttenuation).' } : {}),
    label: (m) => `${m.e} · ${{ name: 'nombre', target: 'destino', impulseKey: 'impulso (fila de episodes)' }[m.k]}`, desc: (m) => `Catálogo ${m.e}: hacia qué estado va su impulso y qué fila de episodes lo fija.`, effect: () => 'Contenido: no se infiere solo de puntos, racha o que el rival anotara.' }),
  fam({ ...base, path: 'episodeCatalog.episodes.{e}.evidence', dom: { e: EPIS }, type: 'text', unit: 'texto documental', cls: 'contenido', locked: true, coverage: 'sin_consumidor', grp: 'ACT10', mech: null,
    label: (m) => `${m.e} · evidencia exigida`, desc: (m) => `Hecho que el motor realmente representa y que prueba ${m.e}. Texto documental: la condición está codificada en el punto donde el motor produce ese hecho.`, effect: () => 'Si el motor no produjo la evidencia, no hay episodio: no se infiere a posteriori.' }),
  fam({ ...base, path: 'episodeCatalog.episodes.{e}.sign', dom: { e: EPIS }, type: 'logit', unit: 'signo', cls: 'invariante', locked: true, coverage: 'sin_consumidor', grp: 'ACT10', mech: null,
    label: (m) => `${m.e} · signo`, desc: () => 'Signo del impulso (+1 favorable, −1 desfavorable, 0 para la pausa). Documental: el signo real lo fija la fila de episodes.', effect: () => 'Invariante del catálogo.' }),
];

// Hojas de esta extensión que son texto libre de contexto, no filas.
export const MOTOR07_EXEMPT = [/^stateTasks\.note$/, /^episodeCatalog\.note$/];
