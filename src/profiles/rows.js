// Diccionario de filas del perfil (SUP01): cada magnitud calibrable que el motor consulta, con su ficha completa.
// Una única fuente alimenta la tabla maestra, las vistas guiadas, la validación, la resolución y el diagnóstico.
// Las filas se DERIVAN del perfil efectivo recorriendo las familias de este catálogo; ninguna fila nace sin un valor real
// del perfil ni se inventa un valor para que la tabla parezca completa (§10.2). Lo que el perfil contiene y no es fila ni
// excepción conocida se detecta como «hoja sin clasificar» (comprobación de cobertura).
import { getAt, pathKey } from './util.js';

export const CLASSES = {
  balance: 'Parámetro de balance',
  contenido: 'Contenido declarativo',
  reglamento: 'Obligación reglamentaria',
  invariante: 'Invariante funcional',
};
export const COVERAGE_STATES = {
  consumido: 'Consumido por el motor',
  sin_consumidor: 'Declarado, sin mecanismo que lo consulte',
  no_aplicable: 'No aplicable a este elemento',
};

export const ZONES5 = ['three', 'midrange', 'inside', 'rim', 'freeThrow'];
export const ZN = { three: 'triple', midrange: 'media distancia', inside: 'tiro interior', rim: 'finalización en el aro', freeThrow: 'tiro libre' };
export const TASKS = ['TAR01', 'TAR02', 'TAR03', 'TAR04', 'TAR05', 'TAR06', 'TAR07', 'TAR09', 'TAR11', 'TAR17'];
export const TASK_NAMES = {
  TAR01: 'Coordinación del director', TAR02: 'Manejo y progresión del base', TAR03: 'Desmarque y recepción', TAR04: 'Bloqueo y defensa del bloqueo',
  TAR05: 'Juego de poste', TAR06: 'Control del balón en el bote', TAR07: 'Pase', TAR09: 'Ayuda defensiva', TAR11: 'Preparación del tiro en movimiento', TAR17: 'Disputa de balón suelto',
};
export const PLAY_NAMES = {
  POS01: 'Bloqueo directo central con continuación', POS05: 'Mano a mano desde cabecera', POS07: 'Indirecto descendente para recepción',
  POS09: 'Pase y corte', POS11: 'Poste bajo', POS14: 'Aclarado desde cabecera',
};
const DUR = {
  advance: 'Avance a la pista de ataque', organizedShot: 'Tiro de juego organizado', organizedFoul: 'Falta en juego organizado', organizedTurnover: 'Pérdida o infracción en juego organizado',
  transition: 'Acción en transición', continuation: 'Pase de continuación', reorganization: 'Reorganización del ataque', rebound: 'Rebote', looseBall: 'Balón suelto',
  runningClockInbound: 'Saque con reloj en marcha', urgentShot: 'Tiro urgente al final del reloj',
};
const OUT = { turnover: 'pérdida', defensiveNonShootingFoul: 'falta defensiva sin tiro', shootingFoul: 'falta defensiva en tiro', fieldShot: 'tiro de campo', looseBall: 'balón suelto', offensiveFoul: 'falta ofensiva', ballViolation: 'infracción de balón' };
const QC = { comfortable: 'cómoda', normal: 'normal', forced: 'forzada' };
const LOADK = { organized: 'juego organizado', transition: 'transición', continuation: 'continuación', rebound: 'rebote y balón suelto' };
const SLOT_GROUP = { screener: 'Bloqueador', hub: 'Pivote de cabecera', receiver: 'Receptor', post: 'Poste', isolationHandler: 'Aislador', additionalHelper: 'Ayudante adicional' };
const SLOTN = { PG: 'base', SG: 'escolta', SF: 'alero', PF: 'ala-pívot', C: 'pívot' };

const fam = (f) => f;
// m = comodines resueltos; A(id) = etiqueta de capacidad.
export const FAMILIES = [
  // ------------------------------------------------------------------ selección y entrenador
  fam({ path: 'selection.priorityWeights', node: 'array', type: 'vector5', elem: 'weight', order: 'desc', unit: 'peso relativo', cls: 'balance', grp: 'SEL01', views: ['seleccion', 'entrenador'], mech: 'coachPlayDistribution',
    label: () => 'Peso de cada prioridad del libro (1–5)', elems: ['Prioridad 1', 'Prioridad 2', 'Prioridad 3', 'Prioridad 4', 'Prioridad 5'],
    desc: () => 'Masa que recibe una ficha según la prioridad (1 a 5) que el entrenador le asigna en su libro. La masa de una familia es la de su mejor variante elegible y dentro de la familia se reparte con estos mismos pesos.',
    effect: () => 'Subir el peso de la prioridad 1 frente a las demás concentra las llamadas del entrenador en las fichas más prioritarias. No fija un porcentaje de uso: la libertad y la lectura del director mezclan después este reparto con sus propias preferencias.' }),
  fam({ path: 'selection.freedom', node: 'array', type: 'vector5', elem: 'fraction', order: 'asc', unit: '% de libertad', cls: 'balance', grp: 'SEL05', views: ['seleccion', 'entrenador'], mech: 'libertyAndReading',
    label: () => 'Libertad máxima por nivel de libertad (1–5)', elems: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'],
    desc: () => 'Parte máxima del encargo del entrenador que el jugador que decide puede sustituir por su propio criterio (F). Se multiplica después por su Iniciativa (L = F·(a + b·Iniciativa)).',
    effect: () => 'Subir un nivel aleja más las elecciones del libro y las acerca a la preferencia y la adaptación del director. No garantiza mejores ni peores resultados.' }),
  fam({ path: 'selection.initiativeMix', node: 'array', type: 'pair', pair: 'mixMax1', unit: 'coeficientes', cls: 'balance', grp: 'SEL05', views: ['seleccion', 'entrenador'], mech: 'libertyAndReading',
    label: () => 'Mezcla de Iniciativa en la libertad efectiva [a, b]', elems: ['a: parte fija', 'b: peso de la Iniciativa'],
    desc: () => 'L = F·(a + b·I): la libertad efectiva de un jugador es su libertad máxima F multiplicada por una parte fija (a) más una parte proporcional a su Iniciativa I (0–1).',
    effect: () => 'Subir b hace que la Iniciativa de cada jugador diferencie más su margen de decisión. a + b no debe superar 1 para que L no exceda F.' }),
  fam({ path: 'selection.readingMix.{cap}', dom: { cap: ['MEN02', 'MEN03'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'SEL06', views: ['seleccion', 'capacidades'], mech: 'libertyAndReading', group: () => 'selection.readingMix', sum: 1,
    label: (m, A) => `Lectura del director · peso de ${A(m.cap)}`,
    desc: (m, A) => `Parte de ${A(m.cap)} en la calidad de lectura q del que decide: q = (mezcla de capacidades − 1)/29.`,
    effect: () => 'Más peso a una capacidad hace que la lectura del juego dependa más de ella. Las dos deben sumar 1.' }),
  fam({ path: 'selection.abilityFit.{k}', dom: { k: ['slope', 'min', 'max'] }, type: ({ k }) => (k === 'slope' ? 'sensitivity' : 'multiplier'), unit: ({ k }) => (k === 'slope' ? 'factor por punto de capacidad' : '×'), cls: 'balance', grp: 'SEL07', views: ['seleccion', 'capacidades'], mech: 'abilityFit',
    label: (m) => ({ slope: 'Ajuste por capacidad · pendiente', min: 'Ajuste por capacidad · mínimo', max: 'Ajuste por capacidad · máximo' }[m.k]),
    desc: (m) => ({ slope: 'Cuánto sube o baja el peso de elección de un candidato por cada punto de capacidad por encima o debajo de la referencia neutra: 1 + pendiente·(capacidad − neutra).', min: 'Suelo del ajuste por capacidad: ningún candidato pesa menos que este factor.', max: 'Techo del ajuste por capacidad: ningún candidato pesa más que este factor.' }[m.k]),
    effect: () => 'Aplica a quién asume cada función de una ficha, a quién recibe el reparto de tiros y a la aceptación de una oportunidad. No modifica la probabilidad de acierto.' }),
  fam({ path: 'selection.roleEligibilityMinimumAbility', type: 'declarado', unit: '—', cls: 'invariante', coverage: 'sin_consumidor', grp: 'SEL07', views: ['seleccion'], mech: null,
    label: () => 'Capacidad mínima para ser elegible a una función', desc: () => 'Declarado como «sin mínimo» (null) en el perfil. Ninguna operación lo consulta todavía.', effect: () => 'Sin efecto: el motor actual no define mínimos deportivos de técnica principal. Si hiciera falta un valor numérico, es una decisión funcional pendiente.' }),
  fam({ path: 'selection.candidateRead.opponentAbilityEstimate', type: 'reference', unit: 'capacidad (1–30)', cls: 'balance', grp: 'SEL08', views: ['seleccion', 'adaptacion'], mech: 'estimateValue',
    label: () => 'Capacidad estimada del rival al valorar una opción', desc: () => 'Capacidad (1–30) que el jugador supone en el defensor cuando estima el valor de una opción. Con 16 (referencia neutra) la estimación no añade ni resta nada al tiro ni al riesgo de pérdida.',
    effect: () => 'Subirla hace que los candidatos se valoren como más difíciles (menos acierto estimado y más riesgo de pérdida estimado). Solo cambia lo que el jugador cree; el resultado real lo resuelve la oposición verdadera.' }),
  fam({ path: 'selection.candidateRead.expectedTurnoverCostPoints', type: 'points', unit: 'puntos', cls: 'balance', grp: 'SEL08', views: ['seleccion', 'adaptacion'], mech: 'estimateValue',
    label: () => 'Coste esperado de una pérdida (puntos)', desc: () => 'Puntos que el jugador resta a una opción por cada unidad de riesgo de pérdida estimado al valorarla (Padaptación).', effect: () => 'Subirlo desincentiva las opciones con bote o pase arriesgado en la elección. No cambia la probabilidad real de perder el balón.' }),
  fam({ path: 'selection.candidateRead.minimumUtility', type: 'points', unit: 'puntos', cls: 'balance', grp: 'SEL08', views: ['seleccion', 'adaptacion'], mech: 'estimateValue',
    label: () => 'Utilidad mínima de una opción (puntos)', desc: () => 'Suelo del valor estimado de una opción: ninguna opción se valora por debajo de este número, de modo que siempre conserve algo de masa de elección.', effect: () => 'Subirlo aplana las diferencias de valor entre opciones malas; bajarlo las hace desaparecer de la elección.' }),
  fam({ path: 'selection.direct.{k}', dom: { k: ['attemptAfterLiveSteal', 'attemptAfterDefensiveRebound', 'unopposedChanceAfterSteal', 'unopposedChanceAfterRebound'] }, type: 'probability', unit: '%', cls: 'balance', grp: 'SEL03', views: ['seleccion', 'oportunidades'], mech: 'transitionPhase',
    label: (m) => ({ attemptAfterLiveSteal: 'Intento de transición tras robo', attemptAfterDefensiveRebound: 'Intento de transición tras rebote defensivo', unopposedChanceAfterSteal: 'Transición sin oposición tras robo', unopposedChanceAfterRebound: 'Transición sin oposición tras rebote' }[m.k]),
    desc: (m) => ({ attemptAfterLiveSteal: 'Probabilidad de que el equipo que roba intente correr antes de organizar su ataque.', attemptAfterDefensiveRebound: 'Probabilidad de que el equipo que captura un rebote defensivo intente correr.', unopposedChanceAfterSteal: 'Probabilidad de que la carrera tras robo encuentre la pista sin defensor que llegue.', unopposedChanceAfterRebound: 'Probabilidad de que la carrera tras rebote encuentre la pista sin defensor que llegue.' }[m.k]),
    effect: () => 'Más intentos de transición reducen el juego organizado y su duración; la calidad del tiro resultante la fija después la oposición real.' }),
  fam({ path: 'selection.direct.acceptanceFloor', type: 'fraction', unit: '% (suelo)', cls: 'balance', grp: 'SEL08', views: ['seleccion'], mech: 'acceptance',
    label: () => 'Suelo de aceptación de una oportunidad inmediata', desc: () => 'Parte fija que se suma a la libertad L en la probabilidad de aceptar una oportunidad inmediata (transición, descarga, rebote ofensivo): p = (suelo + L)·q·ajuste.', effect: () => 'Subirlo hace que se acepten más oportunidades directas incluso con poca libertad o poca lectura.' }),
  fam({ path: 'selection.orientation{k}', dom: { k: ['Three', 'Inside'] }, node: 'array', type: 'vector5', elem: 'multiplier', order: ({ k }) => (k === 'Three' ? 'asc' : 'desc'), unit: '×', cls: 'balance', grp: 'SEL02', views: ['seleccion', 'entrenador'], mech: 'zoneStyleMult',
    label: (m) => (m.k === 'Three' ? 'Orientación hacia el triple por nivel de prioridad de finalización' : 'Orientación hacia el interior por nivel de prioridad de finalización'), elems: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'],
    desc: (m) => (m.k === 'Three' ? 'Multiplicador del peso de elección de las salidas de triple según el nivel de «prioridad de finalización» del estilo (1 = interior, 5 = exterior).' : 'Multiplicador del peso de elección de las salidas interiores (aro e interior) según el nivel de «prioridad de finalización» del estilo.'),
    effect: (m) => `Afecta a QUÉ tiro se elige (frecuencia de intentos de ${m.k === 'Three' ? 'triple' : 'zona interior'}), no a su eficacia: el acierto lo gobiernan las filas de tiro.` }),
  fam({ path: 'selection.organizedDurationFactor', node: 'array', type: 'vector5', elem: 'multiplier', order: 'desc', unit: '×', cls: 'balance', grp: 'SEL02', views: ['seleccion', 'tiempo'], mech: 'durationKindFor',
    label: () => 'Factor de duración del juego organizado por ritmo', elems: ['Ritmo 1', 'Ritmo 2', 'Ritmo 3', 'Ritmo 4', 'Ritmo 5'],
    desc: () => 'Multiplica las duraciones del juego organizado según el nivel de «ritmo organizado» del estilo (1 = pausado, 5 = rápido).', effect: () => 'Menos duración por posesión equivale a más posesiones en un cuarto. Es duración deportiva, distinta de la velocidad de visionado.' }),
  fam({ path: 'selection.finishingVocationMix', node: 'array', type: 'pair', pair: 'positiveMix', unit: 'coeficientes', cls: 'balance', grp: 'SEL07', views: ['seleccion', 'poblacion'], mech: 'vocationFactor', ext: 'SEM-MOTOR03',
    label: () => 'Efecto de la vocación de finalización [a, b]', elems: ['a: parte fija', 'b: peso de la vocación'],
    desc: () => 'Factor a + b·v que multiplica el peso de elección de un finalizador según su vocación v (0–1), en el reparto de tiros, la asignación de funciones de remate y la preferencia.', effect: () => 'Subir b hace que la vocación individual de cada jugador diferencie más quién termina las jugadas.' }),
  fam({ path: 'selection.direct.defenderArrival.{cap}', dom: { cap: ['FIS01', 'FIS02'] }, type: 'recipeWeight', unit: 'peso', cls: 'balance', grp: 'SEL03', views: ['seleccion', 'capacidades'], mech: 'transitionPhase', ext: 'SEM-MOTOR03', group: () => 'selection.direct.defenderArrival',
    label: (m, A) => `Defensor que llega a la transición · peso de ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} en la probabilidad de que un defensor sea el que llega a defender una transición (suma ponderada, no normalizada).`, effect: () => 'Más peso a una capacidad hace que los defensores que la tienen alta lleguen más a menudo.' }),
  fam({ path: 'selection.direct.defenderArrivalMinimumWeight', type: 'weight', unit: 'peso', cls: 'balance', grp: 'SEL03', views: ['seleccion'], mech: 'transitionPhase', ext: 'SEM-MOTOR03',
    label: () => 'Peso mínimo de un defensor que llega', desc: () => 'Suelo del peso de cada defensor al elegir quién llega en una transición; evita pesos nulos.', effect: () => 'Con capacidades dentro de 1–30 el suelo no llega a actuar; solo protege contra pesos nulos.' }),
  fam({ path: 'selection.safeReceiverWeights.{cap}', dom: { cap: ['TEC07', 'MEN05'] }, type: 'recipeWeight', unit: 'peso', cls: 'balance', grp: 'SEL10', views: ['seleccion', 'capacidades'], mech: 'simpleResource', ext: 'SEM-MOTOR03', group: () => 'selection.safeReceiverWeights',
    label: (m, A) => `Receptor de salida segura · peso de ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} al elegir el compañero con balón seguro que recibe un pase de seguridad (CONT08).`, effect: () => 'Más peso a una capacidad hace que la salida segura se dirija más a quien la tiene alta.' }),
  fam({ path: 'continuation.extraPassProbability', type: 'probability', unit: '%', cls: 'balance', grp: 'SEL10', views: ['seleccion', 'oportunidades'], mech: 'extraPassChain',
    label: () => 'Probabilidad de pase adicional (CONT05)', desc: () => 'Probabilidad de que, antes de resolver la salida elegida, el balón pase a otro compañero libre. Se repite mientras haya alternativas y tiempo.', effect: () => 'Más pases adicionales alargan la posesión y cambian al ejecutante; cada pase añade riesgo de pérdida y tiempo.' }),
  fam({ path: 'continuation.reorganizeIfDeniedProbability', type: 'probability', unit: '%', cls: 'balance', grp: 'SEL10', views: ['seleccion', 'oportunidades'], mech: 'runPlay',
    label: () => 'Probabilidad de reorganizar si la ficha es negada (CONT09)', desc: () => 'Cuando la defensa niega una ficha, probabilidad de abandonarla y reorganizar el ataque (si hay tiempo) en lugar de caer al recurso sencillo.', effect: () => 'Subirla reduce los tiros forzados tras una negación a costa de gastar reloj.' }),
  fam({ path: 'continuation.maxExtraPasses', type: 'count', unit: 'pases', cls: 'balance', grp: 'SEL10', views: ['seleccion'], mech: 'extraPassChain', ext: 'SEM-MOTOR03',
    label: () => 'Máximo de pases adicionales encadenados', desc: () => 'Tope de pases adicionales (CONT05) que puede encadenar una misma salida.', effect: () => 'Solo actúa si la probabilidad de pase adicional es alta; limita la cadena.' }),
  fam({ path: 'continuation.liveLooseBallSameTeamQualityPolicy', type: 'declarado', unit: 'política', cls: 'invariante', coverage: 'sin_consumidor', grp: 'RES13', views: ['oportunidades'], mech: null,
    label: () => 'Política de calidad tras balón suelto vivo del mismo equipo', desc: () => 'Política declarada (conservar el contexto y resolver la oposición actual). Ninguna operación la consulta como dato: es el comportamiento codificado.', effect: () => 'Sin efecto como parámetro.' }),
  fam({ path: 'participantSlots.{g}', dom: { g: ['screener', 'hub', 'receiver', 'post', 'isolationHandler', 'additionalHelper'] }, node: 'array', type: 'slots', unit: 'posiciones', cls: 'contenido', grp: 'SEL07', views: ['seleccion', 'contenido'], mech: 'assignRoles',
    label: (m) => `Posiciones elegibles · ${SLOT_GROUP[m.g]}`, desc: (m) => `Posiciones del quinteto entre las que se elige quién cumple la función «${SLOT_GROUP[m.g]}» en las fichas que la usan. El orden no importa.`, effect: () => 'Ampliar el conjunto abre la función a más jugadores; reducirlo la concentra. Si ninguno de esos puestos tiene un jugador disponible, la ficha no es realizable.' }),
  // ------------------------------------------------------------------ oportunidad y desenlaces
  fam({ path: 'opportunity.advantageSensitivity', type: 'sensitivity', unit: 'logit por punto de capacidad', cls: 'balance', grp: 'RES12', views: ['oportunidades', 'capacidades'], mech: 'qualityOf',
    label: () => 'Sensibilidad de la calidad de oportunidad a la ventaja', desc: () => 'Cuánto desplaza la calidad previa (cómoda/normal/forzada) la diferencia entre la calidad de ataque y la de defensa de la ficha, por punto de capacidad.', effect: () => 'Subirla hace que ganar o perder el duelo táctico se note más en la calidad de tiro que se consigue.' }),
  fam({ path: 'opportunity.qualityBase.{c}', dom: { c: ['comfortable', 'normal', 'forced'] }, type: 'distribution', unit: '% (suma 100)', cls: 'balance', grp: 'RES12', views: ['oportunidades', 'tiro'], mech: 'qualityOf', group: () => 'opportunity.qualityBase', sum: 1,
    label: (m) => `Calidad previa base · ${QC[m.c]}`, desc: (m) => `Masa base de que una oportunidad sea de calidad ${QC[m.c]} antes de aplicar la ventaja de la ficha.`, effect: () => 'Es una distribución excluyente: las tres masas deben sumar 100 %. Más masa cómoda sube la calidad media de los tiros antes de su resultado.' }),
  fam({ path: 'opportunity.qualityShotLogit.{c}', dom: { c: ['comfortable', 'normal', 'forced'] }, type: 'logit', unit: 'logit', cls: 'balance', grp: 'RES12', views: ['oportunidades', 'tiro'], mech: 'resolveShot',
    label: (m) => `Efecto de la calidad ${QC[m.c]} en el acierto`, desc: (m) => `Ajuste logit que se suma a la probabilidad de acierto cuando el tiro es de calidad ${QC[m.c]}.`, effect: () => 'Es el puente entre la calidad de la oportunidad y el acierto. +0,1 logit equivale aproximadamente a +2,5 puntos porcentuales cerca del 50 %.' }),
  fam({ path: 'opportunity.helpProbability', type: 'probability', unit: '%', cls: 'balance', grp: 'DEF05', views: ['defensa', 'oportunidades'], mech: 'tryHelp',
    label: () => 'Probabilidad de que un defensor se comprometa a ayudar', desc: () => 'En salidas interiores, probabilidad de que algún defensor disponible abandone a su par para ayudar.', effect: () => 'Más ayudas generan más ventanas libres para el receptor abandonado y más tiros interiores contestados.' }),
  fam({ path: 'opportunity.helpDifferenceSensitivity', type: 'sensitivity', unit: 'logit por punto de capacidad', cls: 'balance', grp: 'DEF05', views: ['defensa'], mech: 'tryHelp',
    label: () => 'Sensibilidad de la llegada de la ayuda', desc: () => 'Cuánto cambia la probabilidad de que la ayuda llegue a tiempo según la diferencia entre la capacidad del ayudante y la del receptor abandonado.', effect: () => 'Subirla hace que la calidad del ayudante y del receptor decidan más si la ayuda llega.' }),
  fam({ path: 'opportunity.helpExecutionP0', type: 'probabilityLogit', unit: '%', cls: 'balance', grp: 'DEF05', views: ['defensa'], mech: 'tryHelp',
    label: () => 'Probabilidad de referencia de que la ayuda llegue', desc: () => 'Probabilidad de que la ayuda llegue cuando el ayudante y el receptor abandonado tienen la misma capacidad.', effect: () => 'Subirla hace que las ayudas lleguen más a menudo.' }),
  fam({ path: 'opportunity.helperQualityLogit', type: 'logit', unit: 'logit', cls: 'balance', grp: 'DEF05', views: ['defensa', 'tiro'], mech: 'runPlay',
    label: () => 'Efecto de una ayuda que llega en la calidad del tiro', desc: () => 'Ajuste logit de contexto cuando la ayuda llega (negativo = tiro más difícil).', effect: () => 'Más negativo penaliza más a los tiros interiores con ayuda; está acotado por el contexto máximo.' }),
  fam({ path: 'opportunity.maximumQualityContextLogit', type: 'weight', unit: 'logit', cls: 'balance', grp: 'RES12', views: ['oportunidades'], mech: 'qualityOf',
    label: () => 'Límite del ajuste de contexto sobre la calidad', desc: () => 'Tope (en valor absoluto) del ajuste de contexto de calidad y valor de una ventana realmente libre.', effect: () => 'Subirlo permite que el contexto (ayudas, cobertura, ventana libre) modifique más la calidad de la oportunidad.' }),
  fam({ path: 'opportunity.coverageContainment.{k}', dom: { k: ['handlerPullupQualityLogit', 'rollerQualityLogit'] }, type: 'logit', unit: 'logit', cls: 'balance', grp: 'DEF04', views: ['defensa', 'oportunidades'], mech: 'runPlay',
    label: (m) => (m.k === 'handlerPullupQualityLogit' ? 'Cobertura COB01 · tiro de parada del base' : 'Cobertura COB01 · continuación del bloqueador'),
    desc: (m) => (m.k === 'handlerPullupQualityLogit' ? 'Ajuste de calidad al tiro de parada del base en el bloqueo directo contra la cobertura activa.' : 'Ajuste de calidad a la continuación del bloqueador en el bloqueo directo contra la cobertura activa.'), effect: () => 'Positivo favorece esa salida; negativo la penaliza. Solo afecta a POS01.' }),
  fam({ path: 'outcomes.base.{o}', dom: { o: Object.keys(OUT) }, type: 'distribution', unit: '% (suma 100)', cls: 'balance', grp: 'RES04', views: ['oportunidades'], mech: 'categoryWeights', group: () => 'outcomes.base', sum: 1,
    label: (m) => `Distribución base de desenlaces · ${OUT[m.o]}`, desc: (m) => `Masa base de que una acción resuelta termine en «${OUT[m.o]}» antes de aplicar las capacidades y la oposición.`,
    effect: () => 'Son alternativas excluyentes que deben sumar 100 %. Cada masa se corrige por capacidades y se normaliza después con las que apliquen a esa acción.' }),
  fam({ path: 'outcomes.{k}', dom: { k: ['controlSensitivity', 'defensiveFoulSensitivity', 'offensiveFoulSensitivity', 'looseControlSensitivity'] }, type: 'sensitivity', unit: ({ k }) => (k === 'looseControlSensitivity' ? 'logit por punto de capacidad' : 'ln-factor por punto de capacidad'), cls: 'balance', grp: 'RES03', views: ['oportunidades', 'capacidades'], mech: 'categoryWeights',
    label: (m) => ({ controlSensitivity: 'Sensibilidad de la pérdida al control (bote/pase)', defensiveFoulSensitivity: 'Sensibilidad de la falta defensiva a la legalidad', offensiveFoulSensitivity: 'Sensibilidad de la falta ofensiva a la legalidad', looseControlSensitivity: 'Sensibilidad de la disputa de balón suelto' }[m.k]),
    desc: (m) => ({ controlSensitivity: 'Cómo crece o decrece la masa de pérdida según la diferencia entre la defensa del balón (robo/intercepción) y el control del que lo maneja.', defensiveFoulSensitivity: 'Cómo varía la masa de falta defensiva con la legalidad del defensor frente a la referencia neutra.', offensiveFoulSensitivity: 'Cómo varía la masa de falta ofensiva con la legalidad del atacante frente a la referencia neutra.', looseControlSensitivity: 'Cómo reparte el control de un balón suelto la diferencia de capacidad de disputa entre los dos contendientes.' }[m.k]),
    effect: () => 'Subirla hace que la diferencia de capacidad pese más en ese desenlace. Un punto de diferencia multiplica la masa por exp(sensibilidad) (o desplaza el logit en esa cantidad).' }),
  fam({ path: 'outcomes.{k}', dom: { k: ['stealGivenTurnover', 'turnoverOutOfBoundsIfNotSteal'] }, type: 'probability', unit: '%', cls: 'balance', grp: 'RES09', views: ['oportunidades'], mech: 'resolveTurnover',
    label: (m) => (m.k === 'stealGivenTurnover' ? 'Probabilidad de robo dada una pérdida con oposición' : 'Probabilidad de pérdida fuera de banda si no hay robo'),
    desc: (m) => (m.k === 'stealGivenTurnover' ? 'Dada una pérdida con defensor que interviene, probabilidad de que sea un robo con balón vivo.' : 'Si la pérdida no es robo, probabilidad de que el balón salga de la pista (balón muerto).'), effect: () => 'Cambia cómo termina una pérdida (robo con transición, balón vivo o saque), no cuántas pérdidas hay.' }),
  fam({ path: 'outcomes.shootingContactLogit', type: 'logit', unit: 'logit', cls: 'balance', grp: 'RES05', views: ['oportunidades', 'tiro'], mech: 'resolveShot',
    label: () => 'Efecto del contacto en el acierto de un tiro con falta', desc: () => 'Ajuste logit al acierto cuando el tiro llega con contacto de falta (la canasta con falta es menos probable).', effect: () => 'Más negativo reduce las canastas con falta y tiro adicional.' }),
  // ------------------------------------------------------------------ recetas por tarea y por ficha
  fam({ kind: 'terms', path: 'tasks.{task}.{side}', dom: { task: TASKS, side: ['attack', 'defense'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES01', views: ['capacidades'], mech: 'taskValue',
    group: (m) => `tasks.${m.task}.${m.side}`, sum: 1,
    label: (m, A) => `${m.task} ${TASK_NAMES[m.task]} · ${m.side === 'attack' ? 'aporte' : 'oposición'} · ${m.role} · ${A(m.attr)}`,
    desc: (m, A) => `Peso de ${A(m.attr)} del participante «${m.role}» en la receta de ${m.side === 'attack' ? 'aporte' : 'oposición'} de la tarea ${m.task} (${TASK_NAMES[m.task]}).`,
    effect: () => 'La receta es una media ponderada de las capacidades EFECTIVAS (tras energía) de ese participante; sus pesos deben sumar 1. No cambia a quién pertenece la capacidad.',
    variant: (m) => (m.task === 'TAR04' ? { coverage: 'sin_consumidor', note: 'La tarea TAR04 figura en el perfil, pero ninguna operación de MOTOR-01/02 la consulta: el bloqueo entra por la calidad de la ficha y por la legalidad ofensiva. Se muestra para su ampliación futura.' } : null) }),
  fam({ path: 'tasks.{task}.maxEnergyPenalty', dom: { task: TASKS }, type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'estados', 'capacidades'], mech: 'taskValue',
    label: (m) => `${m.task} ${TASK_NAMES[m.task]} · deterioro máximo por energía`, desc: (m) => `Puntos de capacidad que pierde, como máximo, quien ejecuta la tarea ${m.task} con la energía agotada. Con energía intermedia se multiplica por la curva de gravedad.`, effect: () => 'Es lo que hace que el cansancio se note en esta tarea. Con 0 la tarea es insensible a la fatiga.',
    variant: (m) => (m.task === 'TAR04' ? { coverage: 'sin_consumidor', note: 'La tarea TAR04 no la consulta ninguna operación de MOTOR-01/02.' } : null) }),
  fam({ kind: 'terms', path: 'plays.{play}.{side}', plays: true, dom: { side: ['qualityAttack', 'qualityDefense'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES08', views: ['capacidades', 'oportunidades'], mech: 'playQuality',
    group: (m) => `plays.${m.play}.${m.side}`, sum: 1,
    label: (m, A) => `${m.play} ${PLAY_NAMES[m.play] ?? ''} · ${m.side === 'qualityAttack' ? 'calidad de ataque' : 'calidad de defensa'} · ${m.role} · ${A(m.attr)}`,
    desc: (m, A) => `Peso de ${A(m.attr)} del participante «${m.role}» en la ${m.side === 'qualityAttack' ? 'calidad de ataque' : 'calidad de defensa'} de la ficha ${m.play}.`, effect: () => 'Compara la ventaja táctica de la ficha antes de elegir el tiro: afecta a la calidad (cómoda/normal/forzada), no directamente al acierto.' }),
  fam({ path: 'plays.{play}.shotWeights.{zone}', plays: true, dom: { zone: ['rim', 'inside', 'midrange', 'three'] }, type: 'weight', unit: 'peso relativo', cls: 'balance', grp: 'SEL04', views: ['seleccion', 'entrenador'], mech: 'scoreExits', group: (m) => `plays.${m.play}.shotWeights`, sum: 'positive',
    label: (m) => `${m.play} ${PLAY_NAMES[m.play] ?? ''} · peso de salida a ${ZN[m.zone]}`, desc: (m) => `Peso con el que el libro de la ficha ${m.play} reparte sus salidas hacia ${ZN[m.zone]} (se normaliza entre las zonas de la ficha).`, effect: (m) => `Subirlo dirige más salidas de esta ficha a ${ZN[m.zone]}. El estilo (prioridad de finalización) y la preferencia del jugador lo corrigen después.` }),
  // ------------------------------------------------------------------ tiro
  fam({ path: 'shots.{zone}.p0', dom: { zone: ZONES5 }, type: 'probabilityLogit', unit: '%', cls: 'balance', grp: 'RES02', views: ['tiro'], mech: 'resolveShot',
    label: (m) => `Probabilidad de referencia · ${ZN[m.zone]}`, desc: (m) => `Probabilidad de acierto de ${ZN[m.zone]} con capacidad y oposición neutras y calidad normal. Es el punto de partida del logit.`,
    effect: (m) => `Pasar de 35 % a 38 % son +3 puntos porcentuales (≈ +8,6 % relativo). Es EFICACIA: no cambia cuántos ${ZN[m.zone]} se intentan.` }),
  fam({ path: 'shots.{zone}.{k}', dom: { zone: ZONES5, k: ['sA', 'sD'] }, type: 'sensitivity', unit: 'logit por punto de capacidad', cls: 'balance', grp: 'RES03', views: ['tiro', 'capacidades'], mech: 'resolveShot',
    label: (m) => `${m.k === 'sA' ? 'Sensibilidad a la capacidad del tirador' : 'Sensibilidad a la oposición'} · ${ZN[m.zone]}`,
    desc: (m) => (m.k === 'sA' ? `Cuántos logit gana el acierto de ${ZN[m.zone]} por cada punto de capacidad ofensiva efectiva sobre la referencia neutra.` : `Cuántos logit pierde el acierto de ${ZN[m.zone]} por cada punto de capacidad defensiva efectiva sobre la referencia neutra.`),
    effect: () => 'Subirla hace que la diferencia de capacidad pese más en el acierto. No cambia la frecuencia con la que se elige el tiro.',
    variant: (m) => (m.zone === 'freeThrow' && m.k === 'sD' ? { coverage: 'no_aplicable', cls: 'invariante', note: 'El tiro libre no tiene defensor.' } : null) }),
  fam({ path: 'shots.{zone}.blockP0', dom: { zone: ZONES5 }, type: 'probabilityLogit', unit: '%', cls: 'balance', grp: 'RES09', views: ['tiro', 'oportunidades'], mech: 'resolveShot',
    label: (m) => `Probabilidad de referencia de tapón · ${ZN[m.zone]}`, desc: (m) => `Probabilidad de que el defensor tape un ${ZN[m.zone]} con capacidades neutras.`, effect: () => 'Un tapón corta el tiro: no hay intento de conversión. Con defensor y sin rama de falta.',
    variant: (m) => (m.zone === 'freeThrow' ? { coverage: 'no_aplicable', cls: 'invariante', note: 'El tiro libre no se tapona.' } : null) }),
  fam({ path: 'shots.{zone}.attack.{cap}', dom: { zone: ZONES5 }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES01', views: ['tiro', 'capacidades'], mech: 'shotAbility', group: (m) => `shots.${m.zone}.attack`, sum: 1,
    label: (m, A) => `${ZN[m.zone]} · aporte del tirador · ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} del tirador en la capacidad ofensiva de ${ZN[m.zone]}.`, effect: () => 'La capacidad del tirador es la media ponderada de estas capacidades efectivas. TEC06 (movimiento) no se suma aquí: entra por la preparación del tiro.' }),
  fam({ path: 'shots.{zone}.defense.{cap}', dom: { zone: ZONES5 }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES01', views: ['tiro', 'capacidades', 'defensa'], mech: 'shotDefense', group: (m) => `shots.${m.zone}.defense`, sum: 1,
    label: (m, A) => `${ZN[m.zone]} · oposición del defensor · ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} del defensor en su capacidad defensiva contra ${ZN[m.zone]}.`, effect: () => 'Se combina con la diferencia de alcance entre defensor y atacante (sin doble prima de altura).' }),
  fam({ path: 'shots.{zone}.points', dom: { zone: ZONES5 }, type: 'count', unit: 'puntos', cls: 'reglamento', grp: 'REG02', views: ['reglamento', 'tiro'], mech: 'resolveShot',
    label: (m) => `Puntos de ${ZN[m.zone]}`, desc: (m) => `Valor reglamentario de una canasta de ${ZN[m.zone]}.`, effect: () => 'Obligación reglamentaria del perfil FIBA: no se altera para corregir ratios.' }),
  fam({ path: 'shots.{zone}.ordinaryMissContactsRing', dom: { zone: ZONES5 }, type: 'bool', unit: 'sí/no', cls: 'invariante', coverage: 'sin_consumidor', grp: 'RES10', views: ['rebote', 'reglamento'], mech: null,
    label: (m) => `Un fallo ordinario de ${ZN[m.zone]} toca el aro`, desc: () => 'Invariante del diseño: un fallo ordinario contacta el aro (reloj de posesión y rebote). El rebote del motor lo asume siempre; no lo consulta como dato.', effect: () => 'Protegida: cambiarla requiere decisión funcional.' }),
  fam({ path: 'shotPreparation.movementMaximumLogitCost', type: 'weight', unit: 'logit', cls: 'balance', grp: 'RES06', views: ['tiro'], mech: 'resolveShot',
    label: () => 'Coste máximo del tiro en movimiento', desc: () => 'Penalización logit máxima de un tiro de triple o media distancia tras movimiento; se reduce con la capacidad TEC06 (preparación) del tirador.', effect: () => 'Subirla castiga más a los tiros en movimiento de quien no tiene buena preparación. Sin doble prima: TEC06 solo actúa aquí.' }),
  fam({ path: 'shotPreparation.maxEnergyPenalty', type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'tiro'], mech: null,
    label: () => 'Reservado: deterioro de la preparación del tiro', desc: () => 'Declarado en el perfil para la preparación del tiro. El motor usa el deterioro máximo de la tarea TAR11 (fila tasks.TAR11.maxEnergyPenalty).', effect: () => 'Sin efecto actual: ver la fila de TAR11.', coverage: 'sin_consumidor' }),
  // ------------------------------------------------------------------ cuerpo y alcance
  fam({ path: 'body.{k}', dom: { k: ['heightRangeCm', 'wingspanRangeCm'] }, node: 'array', type: 'pair', pair: 'range', unit: 'cm', cls: 'balance', grp: 'COR01', views: ['capacidades', 'poblacion'], mech: 'reachOf', elems: ['mínimo', 'máximo'],
    label: (m) => (m.k === 'heightRangeCm' ? 'Rango de referencia de altura (cm)' : 'Rango de referencia de envergadura (cm)'), desc: (m) => `Extremos con los que se normaliza ${m.k === 'heightRangeCm' ? 'la altura' : 'la envergadura'} a 0–1 para derivar el alcance funcional.`, effect: () => 'No crea una capacidad nueva: define la escala del alcance (0–1) que usan oposición de tiro y rebote.' }),
  fam({ path: 'body.normalizedMix', node: 'array', type: 'pair', pair: 'mix', unit: 'coeficientes', cls: 'balance', grp: 'COR01', views: ['capacidades'], mech: 'reachOf', elems: ['altura', 'envergadura'],
    label: () => 'Mezcla de altura y envergadura en el alcance', desc: () => 'Alcance = a·altura normalizada + b·envergadura normalizada (a + b = 1).', effect: () => 'Decide cuánto del alcance funcional viene de la altura y cuánto de la envergadura.' }),
  fam({ path: 'body.{k}', dom: { k: ['contestAbilitySensitivity', 'reboundStrengthSensitivity'] }, type: 'sensitivity', unit: 'puntos de capacidad por unidad de alcance', cls: 'balance', grp: 'COR02', views: ['capacidades', 'tiro', 'rebote'], mech: ({ k }) => (k === 'contestAbilitySensitivity' ? 'shotDefense' : 'afterMiss'),
    label: (m) => (m.k === 'contestAbilitySensitivity' ? 'Efecto del alcance en la oposición de tiro' : 'Efecto del alcance en la fuerza de rebote'), desc: (m) => (m.k === 'contestAbilitySensitivity' ? 'Puntos de capacidad defensiva que suma o resta la diferencia de alcance (defensor − atacante, 0–1) al contestar un tiro.' : 'Puntos de fuerza de rebote que suma o resta el alcance del jugador respecto a la referencia.'), effect: () => 'Es la única vía por la que el tamaño entra en esas tareas (sin doble prima).' }),
  fam({ path: 'body.reboundReachReference', type: 'fraction', unit: 'alcance 0–1', cls: 'balance', grp: 'COR02', views: ['capacidades', 'rebote'], mech: 'afterMiss', ext: 'SEM-MOTOR03',
    label: () => 'Alcance neutro en el rebote', desc: () => 'Alcance normalizado (0–1) que no suma ni resta fuerza de rebote; por encima suma, por debajo resta.', effect: () => 'Subirlo hace que más jugadores queden por debajo de la referencia y pierdan fuerza de rebote.' }),
  fam({ path: 'body.{k}', dom: { k: ['directWeightEffect', 'directAgeEffect'] }, type: 'declarado', unit: '—', cls: 'invariante', coverage: 'sin_consumidor', grp: 'COR02', views: ['capacidades'], mech: null,
    label: (m) => (m.k === 'directWeightEffect' ? 'Efecto directo del peso corporal' : 'Efecto directo de la edad/experiencia'), desc: () => 'Invariante funcional: ni el peso ni la edad suman un bonus directo. Se declara 0 y ninguna operación lo consulta.', effect: () => 'Protegida: no se permite crear un bonus de edad/experiencia ni de peso desde el panel.' }),
  // ------------------------------------------------------------------ tapón
  fam({ path: 'block.attack.{cap}', type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES01', views: ['tiro', 'capacidades', 'defensa'], mech: 'resolveShot', group: () => 'block.attack', sum: 1,
    label: (m, A) => `Tapón · aporte del defensor · ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} en la capacidad de taponar.`, effect: () => 'Define quién tapona mejor.' }),
  fam({ path: 'block.{k}', dom: { k: ['resistanceTechniqueWeight', 'resistanceBalanceWeight'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES01', views: ['tiro', 'capacidades'], mech: 'resolveShot', group: () => 'block.resistance', sum: 1,
    label: (m) => (m.k === 'resistanceTechniqueWeight' ? 'Resistencia al tapón · peso de la técnica de tiro' : 'Resistencia al tapón · peso del equilibrio'), desc: (m) => `Peso ${m.k === 'resistanceTechniqueWeight' ? 'de la capacidad de tiro' : 'del equilibrio (FIS07)'} en la resistencia del tirador al tapón.`, effect: () => 'Los dos pesos deben sumar 1.' }),
  fam({ path: 'block.{k}', dom: { k: ['sA', 'sD'] }, type: 'sensitivity', unit: 'logit por punto de capacidad', cls: 'balance', grp: 'RES03', views: ['tiro', 'capacidades'], mech: 'resolveShot',
    label: (m) => (m.k === 'sA' ? 'Tapón · sensibilidad a la capacidad de taponar' : 'Tapón · sensibilidad a la resistencia del tirador'), desc: () => 'Logit por punto de capacidad sobre la referencia neutra.', effect: () => 'Subirla hace que la diferencia entre taponador y tirador pese más en la probabilidad de tapón.' }),
  fam({ path: 'block.{k}', dom: { k: ['outOfBoundsGivenBlock', 'blockedLooseControlDefenseProbability'] }, type: 'probability', unit: '%', cls: 'balance', grp: 'RES13', views: ['tiro', 'rebote'], mech: 'resolveBlocked',
    label: (m) => (m.k === 'outOfBoundsGivenBlock' ? 'Tapón que sale fuera' : 'Tapón: balón vivo que recupera la defensa'), desc: (m) => (m.k === 'outOfBoundsGivenBlock' ? 'Probabilidad de que el balón taponado salga de la pista (saque del ataque, sin contacto de aro).' : 'Con balón vivo tras tapón, probabilidad de que la defensa lo controle.'), effect: () => 'Cambia cómo continúa la posesión tras un tapón.' }),
  fam({ path: 'block.maximumEnergyPenalty', type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'tiro'], mech: 'resolveShot',
    label: () => 'Tapón · deterioro máximo por energía', desc: () => 'Puntos de capacidad que pierde, como máximo, el taponador sin energía.', effect: () => 'Hace que el tapón sea sensible a la fatiga.' }),
  // ------------------------------------------------------------------ contacto
  fam({ path: 'contact.{side}.{k}', dom: { side: ['defensiveLegality', 'offensiveLegality'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES05', views: ['oportunidades', 'capacidades'], mech: 'categoryWeights', group: (m) => `contact.${m.side}`, sum: 1,
    label: (m, A) => `${m.side === 'defensiveLegality' ? 'Legalidad defensiva' : 'Legalidad ofensiva'} · ${m.k === 'defenseTechnique' ? 'técnica defensiva de la zona' : m.k === 'actionTechnique' ? 'técnica de la acción' : A(m.k)}`,
    desc: (m) => `Peso de este componente en la capacidad de ${m.side === 'defensiveLegality' ? 'defender sin cometer falta' : 'atacar sin cometer falta'}.`, effect: () => 'Se compara con la referencia neutra para corregir la masa de la falta correspondiente.' }),
  fam({ path: 'contact.maximumEnergyPenalty', type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'oportunidades'], mech: 'categoryWeights',
    label: () => 'Legalidad del contacto · deterioro máximo por energía', desc: () => 'Puntos de capacidad que pierde, como máximo, quien defiende o ataca sin energía en la legalidad del contacto.', effect: () => 'Más deterioro hace que el cansancio aumente las faltas.' }),
  // ------------------------------------------------------------------ rebote
  fam({ path: 'rebound.{k}', dom: { k: ['fieldOffensiveP0', 'lastFreeThrowOffensiveP0'] }, type: 'probabilityLogit', unit: '%', cls: 'balance', grp: 'RES10', views: ['rebote'], mech: 'afterMiss',
    label: (m) => (m.k === 'fieldOffensiveP0' ? 'Rebote ofensivo de referencia tras tiro de campo' : 'Rebote ofensivo de referencia tras el último tiro libre'), desc: () => 'Probabilidad de que el ataque recupere el rebote con fuerza equilibrada y carga neutra.', effect: () => 'Es EFICACIA del rebote: más rebotes ofensivos alargan la posesión y generan más tiros.' }),
  fam({ path: 'rebound.sensitivity', type: 'sensitivity', unit: 'logit por punto de capacidad', cls: 'balance', grp: 'RES03', views: ['rebote', 'capacidades'], mech: 'afterMiss',
    label: () => 'Sensibilidad del rebote a la diferencia de fuerza', desc: () => 'Logit por punto de diferencia entre la fuerza media de rebote del ataque y de la defensa.', effect: () => 'Subirla hace que el equipo con mejores reboteadores domine más el rebote.' }),
  fam({ path: 'rebound.{r}.{cap}', dom: { r: ['strength', 'captor'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'RES10', views: ['rebote', 'capacidades'], mech: ({ r }) => (r === 'strength' ? 'afterMiss' : 'afterMiss'), group: (m) => `rebound.${m.r}`, sum: 1,
    label: (m, A) => `${m.r === 'strength' ? 'Fuerza de rebote del equipo' : 'Captor del rebote'} · ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} en ${m.r === 'strength' ? 'la fuerza de rebote de cada participante (decide qué equipo coge el rebote)' : 'la probabilidad de que cada candidato sea quien captura el rebote'}.`, effect: () => 'Son dos preguntas distintas: qué equipo gana el rebote y quién lo captura.' }),
  fam({ path: 'rebound.{k}', dom: { k: ['offenseParticipantSlots', 'defenseParticipantSlots', 'liveLastFreeThrowOffenseSlots', 'liveLastFreeThrowDefenseSlots'] }, node: 'array', type: 'slots', unit: 'posiciones', cls: 'contenido', grp: 'RES10', views: ['rebote', 'contenido'], mech: 'afterMiss',
    label: (m) => ({ offenseParticipantSlots: 'Participantes de ataque en el rebote de campo', defenseParticipantSlots: 'Participantes de defensa en el rebote de campo', liveLastFreeThrowOffenseSlots: 'Participantes de ataque en el rebote de último libre', liveLastFreeThrowDefenseSlots: 'Participantes de defensa en el rebote de último libre' }[m.k]),
    desc: () => 'Posiciones del quinteto que disputan el rebote.', effect: () => 'Más posiciones diluyen la ventaja de los pívots; menos la concentran.' }),
  fam({ path: 'rebound.addShooterIfNearRim', type: 'bool', unit: 'sí/no', cls: 'contenido', grp: 'RES10', views: ['rebote', 'contenido'], mech: 'afterMiss',
    label: () => 'El tirador cercano al aro disputa su propio rebote', desc: () => 'Si el fallo es de aro o interior y el tirador no estaba ya en la lista de ataque, se añade como participante.', effect: () => 'Activado, los jugadores interiores tienen más opciones de rebote ofensivo.' }),
  fam({ path: 'rebound.maxEnergyPenalty', type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'rebote'], mech: 'afterMiss',
    label: () => 'Rebote · deterioro máximo por energía', desc: () => 'Puntos de capacidad que pierde, como máximo, un reboteador sin energía.', effect: () => 'Hace que el rebote sea sensible a la fatiga.' }),
  fam({ path: 'rebound.loadLogitByLevel', node: 'array', type: 'vector5', elem: 'logit', order: 'asc', unit: 'logit', cls: 'balance', grp: 'RES10', views: ['rebote', 'seleccion'], mech: 'afterMiss',
    label: () => 'Carga de rebote ofensivo por nivel «tras tiro»', elems: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'], desc: () => 'Ajuste logit del rebote ofensivo según el nivel del estilo «tras tiro» (1 = volver a defender, 5 = cargar el rebote).', effect: () => 'Cargar el rebote sube las opciones de rebote ofensivo; el coste defensivo posterior no está modelado todavía.' }),
  // ------------------------------------------------------------------ duraciones
  fam({ path: 'durationSeconds.{kind}', dom: { kind: Object.keys(DUR) }, node: 'array', type: 'triangular', unit: 's', cls: 'balance', grp: 'ACT01', views: ['tiempo'], mech: 'sampleDuration', elems: ['mínimo', 'más probable', 'máximo'],
    label: (m) => `Duración · ${DUR[m.kind]}`, desc: (m) => `Distribución triangular [mínimo, más probable, máximo] en segundos de ${DUR[m.kind].toLowerCase()}. El valor más probable no es un tiempo garantizado.`, effect: () => 'Duración DEPORTIVA del hecho en el reloj de juego; no tiene relación con la velocidad de visionado.' }),
  // ------------------------------------------------------------------ energía
  fam({ path: 'energy.range', node: 'array', type: 'pair', pair: 'range', unit: 'energía', cls: 'invariante', grp: 'ACT05', views: ['tiempo', 'estados'], mech: 'consume', elems: ['mínimo', 'máximo'],
    label: () => 'Escala de energía', desc: () => 'Dominio de la energía (0–100). Es la escala de la curva de gravedad y de los umbrales.', effect: () => 'Protegida: la escala absoluta no se redefine desde el panel.' }),
  fam({ path: 'energy.costPerLiveMinute', type: 'energyRate', unit: 'energía por minuto de juego', cls: 'balance', grp: 'ACT03', views: ['tiempo', 'estados'], mech: 'consume',
    label: () => 'Gasto de energía por minuto de juego en pista', desc: () => 'Energía que pierde un jugador en pista por cada minuto de reloj de juego en juego vivo, antes de carga y Resistencia.', effect: () => 'Es la palanca principal de «el cansancio apenas se nota»: subirla agota antes a todos.' }),
  fam({ path: 'energy.baseEnduranceReference', type: 'reference', unit: 'capacidad (1–30)', cls: 'balance', grp: 'ACT03', views: ['tiempo', 'estados'], mech: 'enduranceFactor',
    label: () => 'Resistencia de referencia del gasto', desc: () => 'Resistencia (FIS06) con la que el gasto por minuto no se modifica.', effect: () => 'Por encima, el jugador gasta menos; por debajo, más.' }),
  fam({ path: 'energy.enduranceSlope', type: 'sensitivity', unit: 'factor por punto de Resistencia', cls: 'balance', grp: 'ACT03', views: ['tiempo', 'estados'], mech: 'enduranceFactor',
    label: () => 'Sensibilidad del gasto a la Resistencia', desc: () => 'Cuánto reduce el gasto por minuto cada punto de Resistencia sobre la referencia.', effect: () => 'Subirla hace que la Resistencia diferencie más quién se cansa antes.' }),
  fam({ path: 'energy.{k}', dom: { k: ['enduranceFactorBounds', 'loadBounds'] }, node: 'array', type: 'pair', pair: 'bounds', unit: '×', cls: 'balance', grp: 'ACT03', views: ['tiempo', 'estados'], mech: 'consume', elems: ['mínimo', 'máximo'],
    label: (m) => (m.k === 'enduranceFactorBounds' ? 'Límites del factor de Resistencia' : 'Límites del factor de carga'), desc: () => 'Mínimo y máximo del factor multiplicador aplicado al gasto.', effect: () => 'Evita que una Resistencia extrema o una carga múltiple dispare o anule el gasto.' }),
  fam({ path: 'energy.benchRecoveryPerLiveMinute', type: 'energyRate', unit: 'energía por minuto de juego', cls: 'balance', grp: 'ACT04', views: ['tiempo', 'estados'], mech: 'consume',
    label: () => 'Recuperación en el banquillo por minuto de juego', desc: () => 'Energía que gana un jugador en el banquillo por cada minuto de reloj de juego vivo.', effect: () => 'Subirla hace más rentable la rotación; no cobra un intervalo dos veces.' }),
  fam({ path: 'energy.{k}', dom: { k: ['quarterRecovery', 'halftimeRecovery', 'overtimeIntervalRecovery'] }, type: 'energy', unit: 'energía', cls: 'balance', grp: 'ACT04', views: ['tiempo', 'estados'], mech: 'beginPeriod',
    label: (m) => ({ quarterRecovery: 'Recuperación en el intervalo entre cuartos', halftimeRecovery: 'Recuperación en el descanso largo', overtimeIntervalRecovery: 'Recuperación antes de una prórroga' }[m.k]), desc: () => 'Energía que recuperan todos los jugadores disponibles en ese intervalo.', effect: () => 'Se aplica una sola vez por intervalo.' }),
  fam({ path: 'energy.severityNodes', node: 'array', type: 'curve', unit: 'gravedad (0–1)', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'estados'], mech: 'severity',
    label: () => 'Curva de gravedad de la fatiga', desc: () => 'Nodos [energía, gravedad 0–1] con interpolación lineal. La penalización de una tarea es gravedad × deterioro máximo de la tarea.', effect: () => 'Define cuánto se nota la fatiga a cada nivel de energía. 100–70 casi neutro y reserva crítica muy costosa son el criterio del diseño.' }),
  fam({ path: 'energy.load.{k}', dom: { k: Object.keys(LOADK) }, type: 'multiplier', unit: '×', cls: 'balance', grp: 'ACT03', views: ['tiempo', 'estados'], mech: 'consume',
    label: (m) => `Carga de energía · ${LOADK[m.k]}`, desc: (m) => `Multiplicador del gasto de energía durante ${LOADK[m.k]}.`, effect: () => 'Más de 1 cansa más que el juego organizado base; el factor está acotado por los límites de carga.' }),
  fam({ path: 'energy.{k}', dom: { k: ['defaultPhysicalTaskMax', 'defaultTechnicalTaskMax', 'freeThrowTaskMax'] }, type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'estados', 'capacidades'], mech: 'penFor',
    label: (m) => ({ defaultPhysicalTaskMax: 'Deterioro máximo por defecto de una capacidad física', defaultTechnicalTaskMax: 'Deterioro máximo por defecto de una capacidad técnica o mental', freeThrowTaskMax: 'Deterioro máximo del tiro libre' }[m.k]), desc: () => 'Puntos de capacidad que pierde, como máximo, una capacidad efectiva sin energía cuando la tarea no declara el suyo.', effect: () => 'Hace que el cansancio se note en las lecturas de capacidad efectiva fuera de tareas con deterioro propio.' }),
  // ------------------------------------------------------------------ rotación
  fam({ path: 'rotation.{k}', dom: { k: ['reviewEnergy', 'benchReadyEnergy', 'criticalEnergy'] }, type: 'energy', unit: 'energía', cls: 'balance', grp: 'ENT02', views: ['entrenador', 'estados'], mech: 'relevoReason',
    label: (m) => ({ reviewEnergy: 'Umbral de energía para revisar un relevo', benchReadyEnergy: 'Energía mínima del suplente para entrar', criticalEnergy: 'Energía crítica (relevo casi obligado)' }[m.k]), desc: (m) => ({ reviewEnergy: 'Por debajo de esta energía, y tras el tramo mínimo, el entrenador básico se plantea el cambio.', benchReadyEnergy: 'Un suplente solo entra voluntariamente si ha recuperado al menos esta energía.', criticalEnergy: 'Con esta energía o menos se busca el relevo con una tolerancia de utilidad muy amplia.' }[m.k]), effect: () => 'Subir el umbral de revisión saca antes del campo a los titulares cansados («las estrellas salen demasiado»).' }),
  fam({ path: 'rotation.{k}', dom: { k: ['minimumStintSeconds', 'minimumBenchSeconds', 'maximumNormalStintSeconds'] }, type: 'seconds', unit: 's', cls: 'balance', grp: 'ENT02', views: ['entrenador', 'estados'], mech: 'relevoReason',
    label: (m) => ({ minimumStintSeconds: 'Tramo mínimo en pista antes de revisar por fatiga', minimumBenchSeconds: 'Descanso mínimo en banquillo antes de volver', maximumNormalStintSeconds: 'Tramo largo: duración normal máxima en pista' }[m.k]), desc: () => 'Duración en segundos de reloj de juego.', effect: () => 'Estabiliza la rotación: evita entradas y salidas repetidas.' }),
  fam({ path: 'rotation.{k}', dom: { k: ['replacementUtilityTolerance', 'longStintTolerance', 'criticalReplacementTolerance', 'foulProtectionTolerance'] }, type: 'weight', unit: 'puntos de utilidad', cls: 'balance', grp: 'ENT02', views: ['entrenador'], mech: 'substitutionWindow',
    label: (m) => ({ replacementUtilityTolerance: 'Tolerancia de utilidad del relevo por fatiga', longStintTolerance: 'Tolerancia de utilidad del relevo por tramo largo', criticalReplacementTolerance: 'Tolerancia de utilidad del relevo por energía crítica', foulProtectionTolerance: 'Tolerancia de utilidad del relevo por protección de faltas' }[m.k]),
    desc: () => 'Cuánta utilidad puede perder la posición al cambiar (utilidad del suplente ≥ utilidad del titular − tolerancia) para que el relevo se haga.', effect: () => 'Más tolerancia = relevos más fáciles, aunque entre un jugador peor para esa posición («umbral de revisión, utilidad, tolerancias»).' }),
  fam({ kind: 'items', path: 'rotation.foulProtection', field: 'fouls', idBy: 'period', type: 'count', unit: 'faltas', cls: 'balance', grp: 'ENT03', views: ['entrenador'], mech: 'relevoReason',
    label: (m) => `Protección de faltas · periodo ${m.id}`, desc: (m) => `Faltas personales a partir de las cuales el entrenador protege al jugador en el periodo ${m.id}.`, effect: () => 'Menos faltas = protege antes.' }),
  fam({ path: 'rotation.slotAbilityWeights.{slot}.{cap}', dom: { slot: ['PG', 'SG', 'SF', 'PF', 'C'] }, type: 'recipeWeight', unit: 'peso (suma 1)', cls: 'balance', grp: 'ENT02', views: ['entrenador', 'capacidades'], mech: 'slotUtility', group: (m) => `rotation.slotAbilityWeights.${m.slot}`, sum: 1,
    label: (m, A) => `Utilidad de ${SLOTN[m.slot]} · ${A(m.cap)}`, desc: (m, A) => `Peso de ${A(m.cap)} en la utilidad de un jugador para la posición de ${SLOTN[m.slot]} al evaluar relevos.`, effect: () => 'Define qué considera el entrenador básico «buen sustituto» en cada posición.' }),
  fam({ path: 'rotation.utilityMaxEnergyPenalty', type: 'energyPenalty', unit: 'puntos de capacidad', cls: 'balance', grp: 'ACT05', views: ['tiempo', 'entrenador'], mech: 'slotUtility',
    label: () => 'Utilidad de relevo · deterioro máximo por energía', desc: () => 'Puntos de capacidad que se descuentan, como máximo, por fatiga al calcular la utilidad de un jugador para un relevo.', effect: () => 'Subirla hace que la fatiga pese más al valorar a titulares y suplentes.' }),
  // ------------------------------------------------------------------ reglamento y protegidos
  fam({ path: 'rules.{k}', dom: { k: ['profile', 'quarters', 'quarterSeconds', 'overtimeSeconds', 'shotClockSeconds', 'frontcourtResetSeconds', 'backcourtSeconds', 'foulOut', 'teamPenaltyAfterFouls', 'freeThrowsForOrdinaryBonus', 'stopClockAfterGoalFinalSeconds', 'overtimeFoulsCarryFromPeriod'] }, type: ({ k }) => (k === 'profile' ? 'text' : 'count'), unit: ({ k }) => (/Seconds$/.test(k) ? 's' : k === 'profile' ? 'perfil' : 'nº'), cls: 'reglamento', grp: 'REG01', views: ['reglamento'], mech: 'rules.js', rulesOf: true,
    label: (m) => ({ profile: 'Perfil reglamentario', quarters: 'Cuartos', quarterSeconds: 'Duración del cuarto', overtimeSeconds: 'Duración de la prórroga', shotClockSeconds: 'Reloj de posesión', frontcourtResetSeconds: 'Reloj de posesión tras reanudación en ataque', backcourtSeconds: 'Segundos para pasar de campo', foulOut: 'Faltas para la exclusión', teamPenaltyAfterFouls: 'Faltas de equipo antes de penalización', freeThrowsForOrdinaryBonus: 'Tiros libres por falta en penalización', stopClockAfterGoalFinalSeconds: 'Reloj parado tras canasta en los últimos segundos', overtimeFoulsCarryFromPeriod: 'Periodo cuyas faltas de equipo acumulan las prórrogas' }[m.k]),
    desc: (m) => `Valor del perfil reglamentario (${'FIBA 2026 v1.1, lectura propia no contrastada con el PDF'}).`, effect: () => 'Obligación reglamentaria: se consulta con su perfil y fuente, pero no se altera para arreglar ratios.' }),
  fam({ path: 'rules.{k}', dom: { k: ['technicalGuardMaxEvents', 'technicalGuardMaxOvertimes'] }, type: 'count', unit: 'nº', cls: 'invariante', grp: 'REG01', views: ['reglamento'], mech: 'step',
    label: (m) => (m.k === 'technicalGuardMaxEvents' ? 'Guarda técnica: acontecimientos máximos' : 'Guarda técnica: prórrogas máximas'), desc: () => 'Tope de seguridad del motor para evitar bucles; no es una regla deportiva.', effect: () => 'Protegida.' }),
  fam({ path: 'rng.{k}', dom: { k: ['algorithm', 'zeroSeedReplacement', 'outputDivisor'] }, type: 'text', unit: '—', cls: 'invariante', grp: 'LAB01', views: ['laboratorio'], mech: 'createRng',
    label: (m) => ({ algorithm: 'Generador de azar deportivo', zeroSeedReplacement: 'Sustituto de la semilla 0', outputDivisor: 'Divisor de salida del generador' }[m.k]), desc: () => 'Parámetro del azar deportivo reproducible (xorshift32).', effect: () => 'Protegido: cambiarlo cambia todos los partidos y su reproducibilidad.' }),
  fam({ path: 'rng.defaultSeed', type: 'count', unit: 'semilla', cls: 'invariante', coverage: 'sin_consumidor', grp: 'LAB01', views: ['laboratorio'], mech: null,
    label: () => 'Semilla por defecto declarada', desc: () => 'Semilla declarada en el perfil. El escenario del laboratorio lleva la suya (scenario.seed); el motor no consulta esta fila.', effect: () => 'Sin efecto: la semilla de cada partido es una entrada del encuentro.' }),
  fam({ path: 'abilityBounds', node: 'array', type: 'pair', pair: 'range', unit: 'capacidad', cls: 'invariante', grp: 'RES01', views: ['capacidades'], mech: 'eff', elems: ['mínimo', 'máximo'],
    label: () => 'Escala absoluta de capacidades', desc: () => 'Las 32 capacidades viven en una escala absoluta de 1 a 30.', effect: () => 'Protegida: invariante funcional.' }),
  fam({ path: 'neutralAbility', type: 'reference', unit: 'capacidad (1–30)', cls: 'invariante', grp: 'RES03', views: ['capacidades'], mech: 'shotLogit',
    label: () => 'Capacidad de referencia neutra', desc: () => 'Capacidad de la que cuelgan todas las sensibilidades (capacidad − referencia). Es la mitad de la escala.', effect: () => 'Protegida: moverla desplazaría a la vez todas las probabilidades del motor.' }),
  fam({ path: 'activeCatalog.{k}', dom: { k: ['dispositions', 'defenses', 'coverage', 'plays', 'continuations', 'spontaneous', 'stylesEditable'] }, node: 'array', type: 'strlist', unit: 'identificadores', cls: 'contenido', locked: true, grp: 'CON01', views: ['contenido'], mech: 'validateInput',
    label: (m) => ({ dispositions: 'Disposiciones activas', defenses: 'Organizaciones defensivas activas', coverage: 'Coberturas activas', plays: 'Fichas ofensivas activas', continuations: 'Continuaciones activas', spontaneous: 'Recursos espontáneos activos', stylesEditable: 'Estilos editables' }[m.k]),
    desc: () => 'Contenido ejecutable por el motor de esta versión. Añadir contenido exige implementar su mecanismo en una entrega de repertorio.', effect: () => 'Solo lectura en MOTOR-03.' }),
  // ------------------------------------------------------------------ MOTOR-02: tiempos muertos
  fam({ path: 'motor02.timeOutRecoveryEnergyPoints', type: 'energy', unit: 'energía', cls: 'balance', grp: 'ACT04', views: ['tiempo', 'entrenador'], mech: 'grantTimeouts',
    label: () => 'Recuperación por tiempo muerto', desc: () => 'Energía que recuperan todos los jugadores disponibles de ambos equipos por cada tiempo muerto concedido (una vez por concesión). Semilla SEM de MOTOR-02.', effect: () => 'Subirla hace más valiosos los tiempos muertos; la atenuación de momento no existe todavía (MOTOR-07).' }),
  fam({ path: 'motor02.timeOuts.{k}', dom: { k: ['durationSeconds', 'firstHalf', 'secondHalf', 'perOvertime', 'finalWindowSeconds', 'maxInFinalWindow'] }, type: 'count', unit: ({ k }) => (/Seconds$/.test(k) ? 's' : 'nº'), cls: 'reglamento', grp: 'REG03', views: ['reglamento', 'entrenador'], mech: 'timeoutAllowance',
    label: (m) => ({ durationSeconds: 'Duración del tiempo muerto', firstHalf: 'Tiempos muertos en la primera mitad', secondHalf: 'Tiempos muertos en la segunda mitad', perOvertime: 'Tiempos muertos por prórroga', finalWindowSeconds: 'Ventana final de los últimos segundos', maxInFinalWindow: 'Máximo de tiempos muertos en la ventana final' }[m.k]), desc: () => 'Cupo reglamentario (lectura propia de FIBA 2026 v1.1, sin contrastar con el PDF).', effect: () => 'Obligación reglamentaria: consultable, no editable.' }),
  fam({ path: 'motor02.timeOuts.carryOver', type: 'bool', unit: 'sí/no', cls: 'reglamento', coverage: 'sin_consumidor', grp: 'REG03', views: ['reglamento'], mech: null, label: () => 'Los tiempos muertos se arrastran', desc: () => 'Declarado «no»: cada bloque tiene su propio cupo. El motor lo asume por construcción.', effect: () => 'Obligación reglamentaria declarada.' }),
  fam({ path: 'motor02.{k}', dom: { k: ['timeOutRecoveryRecipients', 'timeOutRecoveryApplication', 'momentDynamics'] }, type: 'text', unit: 'política', cls: 'invariante', coverage: 'sin_consumidor', grp: 'ACT12', views: ['estados'], mech: null,
    label: (m) => ({ timeOutRecoveryRecipients: 'Quién recupera con un tiempo muerto', timeOutRecoveryApplication: 'Cuándo se aplica la recuperación', momentDynamics: 'Dinámica de momento' }[m.k]), desc: () => 'Política declarada; el comportamiento está codificado y no se consulta como dato.', effect: () => 'Solo lectura. La dinámica de momento no está implementada hasta MOTOR-07.' }),
];

// Hojas del perfil que NO son filas: identidad, procedencia y estructura de contenido, no magnitudes calibrables (§4.1).
export const EXEMPT_LEAF = [
  /^id$/, /^status$/, /^scope$/, /^effectiveId$/, /^provenance\./, /^deferred/, /^scenario\./, /^fixtureContract\./, /^attributeOrder/, /^attributeDictionary/,
  /^extensions\./, /^motor02\.(seedExtensionId|status|basedOn|origin)$/, /^profileRef\./, /^plays\.\d+\.(id|family|roles|continuations)/, /^tasks\.[^.]+\.(attack|defense)\.\d+\.[01]$/, /^plays\.\d+\.(qualityAttack|qualityDefense)\.\d+\.[01]$/,
  /^rotation\.foulProtection\.\d+\.period$/,
];

// Excepciones explicadas: valores del código que NO se convierten en filas (§4.1).
export const CODE_EXCEPTIONS = [
  { what: 'Conversión de escala (x − 1)/29 y 1 − (prep − 1)/29', why: 'Conversión de unidad de la escala 1–30 a 0–1; estructural, no un coeficiente de balance.', where: 'libertyAndReading, estimateValue, resolveShot' },
  { what: 'Sorteo de la disputa inicial u < 0,5', why: 'Moneda justa del salto inicial: invariante de equidad, no calibrable.', where: 'MatchCore.init' },
  { what: 'Conversión décimas ↔ segundos (×10, /600)', why: 'Constante de unidad del reloj.', where: 'rules.js, consume' },
  { what: 'Tope técnico de 64 acciones por posesión y 1 décima de margen en comprobaciones de tiempo', why: 'Guarda técnica y granularidad del reloj; no son reglas deportivas.', where: 'possessionUnit, planDuration' },
  { what: 'Zonas del recurso sencillo (aro, media, triple) y posiciones exteriores del rebote ofensivo (PG, SG, SF)', why: 'Estructura de los recursos ESP13/ESP15: contenido de la ficha, no balance. Ampliarlas es repertorio (MOTOR-04/06).', where: 'simpleResource, afterOffensiveRebound' },
  { what: 'Multiplicador 1 de la masa de balón suelto', why: 'Identidad matemática (la masa base ya es la fila outcomes.base.looseBall).', where: 'categoryWeights' },
  { what: 'Velocidades x2/x4/x8/x16 y esperas del visionado', why: 'Parámetros de PRESENTACIÓN (no deportivos): se listan como filas de solo consulta fuera del perfil.', where: 'session.js PRESENTATION' },
];

// ---------------------------------------------------------------------------------------------- construcción de filas
const attrLabelFn = (profile) => { const m = Object.fromEntries((profile.attributeDictionary ?? []).map((a) => [a.id, a.label])); return (id) => `${m[id] ?? id} (${id})`; };

function resolveVal(v, m) { return typeof v === 'function' ? v(m) : v; }

function expandTemplate(profile, template, dom = {}) {
  // Devuelve [{ path:[...], m:{...}, missing }]. Los comodines con dominio generan la ruta aunque falte (ausencia requerida).
  const segs = template.split('.');
  let acc = [{ path: [], m: {}, node: profile, missing: false }];
  for (const seg of segs) {
    const next = [];
    const w = /^\{(\w+)\}$/.exec(seg);
    const pre = /^([A-Za-z]+)\{(\w+)\}$/.exec(seg); // «orientation{k}»
    for (const a of acc) {
      if (!w && !pre) { next.push({ path: [...a.path, seg], m: a.m, node: a.node && typeof a.node === 'object' ? a.node[seg] : undefined, missing: a.missing || a.node == null || !(seg in a.node) }); continue; }
      const name = w ? w[1] : pre[2];
      const keys = dom[name] ?? (a.node && typeof a.node === 'object' ? Object.keys(a.node) : []);
      for (const k of keys) {
        const real = w ? k : `${pre[1]}${k}`;
        next.push({ path: [...a.path, real], m: { ...a.m, [name]: k }, node: a.node && typeof a.node === 'object' ? a.node[real] : undefined, missing: a.missing || a.node == null || !(real in a.node) });
      }
    }
    acc = next;
  }
  return acc;
}

const isLeaf = (v) => v === null || typeof v !== 'object';

export function buildRows(profile, { presentation = null } = {}) {
  const A = attrLabelFn(profile);
  const rows = []; const seen = new Map();
  const push = (f, base, m, extra) => {
    const type = resolveVal(f.type, m);
    const v = f.variant?.(m) ?? {};
    const cls = v.cls ?? f.cls;
    const coverage = v.coverage ?? f.coverage ?? 'consumido';
    const id = base.id ?? base.path.join('.');
    if (seen.has(id)) throw new Error(`diccionario: fila duplicada ${id}`);
    const row = {
      id, path: base.path, family: f.path, type, pair: f.pair ?? null, elem: f.elem ?? null, order: resolveVal(f.order, m) ?? null, elems: f.elems ?? null,
      unit: resolveVal(f.unit, m), cls, label: f.label(m, A), desc: f.desc(m, A), effect: f.effect(m, A), note: v.note ?? null,
      grp: f.grp, views: f.views, mech: resolveVal(f.mech, m) ?? null, group: f.group ? f.group(m) : null, sum: f.sum ?? null, ext: f.ext ?? 'SEM-MOTOR01/02',
      coverage, locked: !!f.locked, required: !!base.required, missing: !!base.missing, value: base.missing ? undefined : getAt(profile, base.path), params: { ...m, ...extra },
      editable: (cls === 'balance' || cls === 'contenido') && coverage === 'consumido' && !f.locked,
      evidence: 'SEM', source: 'Perfil de desarrollo SEM (sin fuente empírica declarada)',
    };
    seen.set(id, row); rows.push(row);
  };
  for (const f of FAMILIES) {
    if (f.kind === 'terms') {
      const list = f.plays
        ? (profile.plays ?? []).flatMap((p, i) => (f.dom.side ?? []).map((side) => ({ path: ['plays', i, side], m: { play: p.id, side }, node: p[side], missing: !Array.isArray(p[side]) })))
        : expandTemplate(profile, f.path, f.dom);
      for (const e of list) {
        if (!Array.isArray(e.node)) { if (e.missing) rows.push({ id: pathKey(e.path), path: e.path, missing: true, required: true, family: f.path, cls: f.cls, coverage: 'consumido', label: `${f.path} ausente`, views: f.views, grp: f.grp, type: 'recipeWeight', editable: false, locked: true }); continue; }
        e.node.forEach((t, i) => {
          const m = { ...e.m, role: t[0], attr: t[1] };
          push(f, { path: [...e.path, i, 2], id: `${e.m.play ? `plays.${e.m.play}.${e.m.side}` : pathKey(e.path)}.${t[0]}.${t[1]}`, required: true }, m, {});
        });
      }
      continue;
    }
    if (f.kind === 'items') {
      const arr = getAt(profile, f.path.split('.'));
      if (!Array.isArray(arr)) { rows.push({ id: f.path, path: f.path.split('.'), missing: true, required: true, family: f.path, cls: f.cls, coverage: 'consumido', label: `${f.path} ausente`, views: f.views, grp: f.grp, type: f.type, editable: false, locked: true }); continue; }
      arr.forEach((it, i) => push(f, { path: [...f.path.split('.'), i, f.field], id: `${f.path}.p${it[f.idBy]}.${f.field}`, required: true }, { id: it[f.idBy] }, {}));
      continue;
    }
    const exp = f.plays
      ? (profile.plays ?? []).flatMap((p, i) => (f.dom.zone ?? []).map((zone) => ({ path: ['plays', i, f.path.split('.')[2], zone], m: { play: p.id, zone }, node: p[f.path.split('.')[2]]?.[zone], missing: p[f.path.split('.')[2]]?.[zone] === undefined })))
      : expandTemplate(profile, f.path.replace(/\.\{cap\}$/, '.{cap}'), f.dom);
    for (const e of exp) {
      if (f.node === 'array') { if (e.missing) { push(f, { path: e.path, required: true, missing: true }, e.m, {}); continue; } push(f, { path: e.path, required: true }, e.m, {}); continue; }
      if (!isLeaf(e.node) && !e.missing) continue; // nodo intermedio ya cubierto por comodines posteriores
      push(f, { path: e.path, required: Object.values(f.dom ?? {}).length > 0 || !/\{/.test(f.path), id: f.plays ? `plays.${e.m.play}.shotWeights.${e.m.zone}` : undefined, missing: e.missing }, e.m, {});
    }
  }
  if (presentation) {
    for (const [k, v] of Object.entries(presentation)) rows.push({
      id: `presentation.${k}`, path: ['presentation', k], family: 'presentation', type: 'presentacion', unit: Array.isArray(v) ? 'x' : (/Ms$/.test(k) ? 'ms' : 'x'), cls: 'invariante', coverage: 'consumido', source: 'presentation', editable: false, locked: true,
      label: { speeds: 'Velocidades de visionado', defaultSpeed: 'Velocidad inicial', baseMsPerGameSecond: 'Milisegundos reales por segundo de juego (x1)', minWaitMs: 'Espera mínima entre hechos', maxWaitMs: 'Espera máxima entre hechos', chunkSteps: 'Fronteras por bloque en modo total' }[k] ?? k,
      desc: 'Parámetro de PRESENTACIÓN del visionado por tiempo (no deportivo): cambiarlo no crea otro perfil de baloncesto.', effect: 'No altera el deporte: una misma semilla y órdenes dan el mismo partido a cualquier velocidad.', grp: 'LAB01', views: ['tiempo', 'laboratorio'], mech: 'MatchSession', value: v, missing: false, required: false,
    });
  }
  return rows;
}

export function indexRows(rows) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const byPath = new Map(rows.filter((r) => r.path && r.family !== 'presentation').map((r) => [pathKey(r.path), r]));
  return { byId, byPath };
}

// Hojas del perfil que no pertenecen a ninguna fila ni a una excepción conocida.
export function uncoveredLeaves(profile, rows) {
  const { byPath } = indexRows(rows);
  const out = [];
  const walk = (o, path) => {
    const key = pathKey(path);
    if (byPath.has(key)) return;
    if (isLeaf(o)) { if (!EXEMPT_LEAF.some((re) => re.test(key))) out.push(key); return; }
    if (Array.isArray(o) || typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, [...path, k]);
  };
  walk(profile, []);
  return out;
}

// Filas requeridas que no están en el perfil: configuración incompleta, no se rellena con valores por defecto (§4.2).
export function missingRequired(profile) {
  return buildRows(profile).filter((r) => r.missing && r.required).map((r) => r.id);
}
export class ConfigError extends Error {
  constructor(missing) { super(`Perfil incompleto: faltan filas requeridas (${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ` y ${missing.length - 8} más` : ''})`); this.name = 'ConfigError'; this.missing = missing; }
}
export function assertProfileComplete(profile) {
  const miss = missingRequired(profile);
  if (miss.length) throw new ConfigError(miss);
}
