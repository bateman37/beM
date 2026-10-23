// Tablas declarativas de la evidencia de SIM-MOTOR-01 (alcance, procedencia de salidas, estados y tablas de efecto). Solo datos y generadores de filas: sin simular.
import { CAPABILITIES } from '../src/sim/capabilities.js';

// Estados admitidos: implementado · aproximado · no cubierto. Cada fila remite a su productor, su prueba y su ruta.
export const SCOPE_ROWS = [
  ['§1.2', 'Selector inicial de laboratorio y acceso inequívoco a cada modelo', 'implementado', 'src/lab/engine-select.js; src/lab/app.js', 'recorrido Chromium pasos 1–5 y 25', 'laboratorio → pantalla inicial'],
  ['§1.2', 'Generador independiente, ejecutable sin navegador y con interfaz mínima', 'implementado', 'src/sim/*; scripts/sim01-match.js; src/lab/sim-ui.js', 'S01-01, S01-10; recorrido Chromium', 'node scripts/sim01-match.js'],
  ['§1.2', 'Encuentros completos: periodos, prórrogas, participantes, rotaciones básicas y exclusiones', 'implementado', 'src/sim/engine.js; src/sim/materialize.js', 'S01-02, S01-03, S01-04', 'SimMatch.step/_materialize/_closePeriod'],
  ['§1.2', 'Acta individual y de equipo, quintetos/minutos, tiros por zona, familias tácticas y evolución compacta', 'implementado', 'src/sim/result.js', 'S01-02; recorrido (vistas)', 'buildSimResult'],
  ['§1.2', 'Capacidades y táctica que intervienen en las distribuciones; correspondencias documentadas', 'implementado', 'src/sim/model.js; src/sim/capabilities.js; src/sim/controls.js', 'S01-05', '04-CAPACIDADES-32.csv; 05-CONTROLES-Y-TABLAS.csv'],
  ['§1.2', 'Configuración propia, identificada y administrable desde una tabla sencilla del laboratorio', 'implementado', 'src/sim/profile.js; src/lab/sim-ui.js (Parámetros)', 'S01-05; recorrido pasos 16–19', '06-PARAMETROS.json'],
  ['§1.2', 'Ejecución real de 1.000 partidos con cuatro workers y comparación con un worker', 'implementado', 'scripts/sim01-bench.js; src/sim/pool.js', 'S01-09; B01/B02/B03', '09-RENDIMIENTO.json'],
  ['§1.2', 'Descargas y evidencia verificable para ChatGPT', 'implementado', 'scripts/sim01-package.js; scripts/sim01-check.js', 'recibo SIM-MOTOR-01-verificacion-final.json', 'out/sim-motor01/entrega-final/'],
  ['§1.3', 'La unidad de resolución es un tramo con quintetos estables; producción conjunta por categorías y materialización posterior', 'implementado', 'src/sim/engine.js (_genAttacks/_resolve); src/sim/model.js', 'S01-02', 'nota técnica §3'],
  ['§1.3', 'No se llama al resolutor detallado ni se reproducen posesiones, pases o decisiones por debajo', 'implementado', 'src/sim/* (sin importaciones de src/match salvo funciones puras de fórmulas)', 'S01-10', 'comprobación estática de importaciones'],
  ['§3', 'Cabecera persistente con modelo y versión de aplicación; perfil y versión de datos aparte; «Cambiar de motor»; estado por modelo', 'implementado', 'src/lab/app.js; src/lab/index.html', 'recorrido pasos 5 y 25', 'laboratorio'],
  ['§4.1', 'Fachada con las siete operaciones (validar, preparar, crear, avanzar, consultar, terminar, construir/validar resultado)', 'implementado', 'src/sim/index.js; adapt.js; context.js; engine.js; materialize.js; result.js; reconcile.js', 'S01-01, S01-07', 'src/sim/index.js'],
  ['§4.1', 'Adaptador explícito de entrada (plantillas y planes existentes) sin modificar el original; edades, cuerpo, tendencias, roles, 32 capacidades y conocimiento', 'implementado', 'src/sim/adapt.js', 'S01-07', 'validateSimInput/normalizeInput'],
  ['§4.1', 'Identidades de equipo y de instancia distintas; dos copias del mismo equipo funcionan', 'implementado', 'src/sim/teams.js', 'S01-01; recorrido paso 6', 'EQ03 y EQ03_B'],
  ['§4.1', 'Sin DOM, reloj de pared, almacenamiento global mutable ni perfil activo implícito', 'implementado', 'src/sim/*', 'S01-01 (intercalado); S01-10', 'contexto explícito por encuentro'],
  ['§4.2', 'Modelo beM-sim-segment; contrato beM-sim-match/1; perfil SEM-SIM01-20261022; identidad de encuentro e intento; semilla; huellas; referencia al detallado; matriz de cobertura y política estadística', 'implementado', 'src/sim/version.js; src/sim/result.js', 'S01-01', '01-IDENTIDAD.json'],
  ['§4.2', 'Huella deportiva sin CPU, ruta, orden de ejecución, worker ni etiquetas editoriales; incluye producción y orden temporal', 'implementado', 'src/sim/result.js (sportDigest)', 'S01-01; S01-09; B01=B02=B03', '11-DETERMINISMO.json'],
  ['§4.2', 'Un importador incompatible rechaza con causa y conserva el archivo original', 'implementado', 'src/sim/adapt.js (esquemas admitidos beM-match-input/6|7)', 'S01-07', 'el export deportivo del detallado no se toca'],
  ['§4.3', 'Todas las decisiones numéricas deportivas en tablas/perfil SIM con ruta, valor, unidad, procedencia y efecto', 'implementado', 'src/sim/profile.js', 'S01-05', '06-PARAMETROS.json (484 filas)'],
  ['§4.3', 'Tabla editable por secciones: validar, restaurar base y descargar candidata', 'implementado', 'src/lab/sim-ui.js', 'recorrido pasos 16–19', 'Parámetros'],
  ['§4.3', 'Ocho semillas SEM-SIM01 con los valores del encargo', 'implementado', 'src/sim/profile.js (SEM_ROWS)', 'S01-05', 'volume.*, segment.*, assist.*'],
  ['§4.3', 'Conversión de unidades: probabilidad por interacción → por control; denominadores conservados', 'aproximado', 'src/sim/model.js (attackModel: terminales normalizados por control)', 'S01-02', 'nota técnica §4.2 (aproximación declarada)'],
  ['§5.1', 'Presupuesto pequeño: estado mínimo, compilación fuera de la generación repetitiva, actualización por cambio de dato', 'aproximado', 'src/sim/model.js; src/sim/engine.js', 'medición', 'las magnitudes se recompilan cada tramo (energía); no se cachean entre tramos'],
  ['§5.2', 'Fronteras canónicas determinadas por el estado deportivo (exclusión, cambio de plan, periodo, ventana final); no dependen de consultas', 'implementado', 'src/sim/engine.js (_nextSegmentLength)', 'S01-01', 'tramo ≤120 s; ventana final 30 s'],
  ['§5.2', 'Avance/consulta publican solo hechos alcanzados; sin regenerar el prefijo; orden futura en la siguiente frontera con instante efectivo', 'implementado', 'src/sim/materialize.js (advance); src/sim/engine.js (submit)', 'S01-01', 'advance/submit'],
  ['§5.3', 'Presupuesto conjunto de controles con alternancia compartida, factor común de ritmo, redondeo aleatorio sin sesgo', 'implementado', 'src/sim/engine.js (step)', 'S01-05 (ritmo)', 'fórmula del encargo'],
  ['§5.3', 'Factor de ritmo desde los niveles de estilo, distinguiendo organizado y transición', 'implementado', 'src/sim/model.js (finishPace)', 'S01-05', 'organizedDurationFactor; derived.transitionPaceFactor'],
  ['§5.4', 'Generación conjunta con dependencias: multinomiales, binomiales, repartos ponderados, rebotes sobre fallos reboteables, créditos compatibles', 'implementado', 'src/sim/engine.js; src/sim/rng.js', 'S01-02', 'nota técnica §3'],
  ['§5.4', 'Aciertos por jugador mediante ensayos de Bernoulli individuales (equivalentes a binomiales por celda)', 'aproximado', 'src/sim/engine.js (_resolve)', '—', 'la probabilidad depende del tirador concreto; se declara el equivalente'],
  ['§5.5', 'Cronología compatible: orden estable, equipo en control coherente, series de libres con reloj parado, canasta con falta ≠ fallo con falta, último libre abre rebote, tapón ≠ robo/rebote', 'implementado', 'src/sim/materialize.js; src/sim/engine.js', 'S01-02, S01-03', 'R04, R06, R15'],
  ['§5.5', 'Pase final con emisor y receptor distintos y enlace a la finalización; asistencia a canasta y a libres según política', 'implementado', 'src/sim/engine.js; src/sim/result.js', 'S01-02 (R14)', 'EST-SIM01-R1'],
  ['§5.6', 'Faltas sin tiro con consecuencia según bonus; prórrogas arrastran contadores', 'implementado', 'src/sim/materialize.js', 'S01-03 (R16)', 'rules.teamPenaltyAfterFouls; overtimeFoulsCarryFromPeriod'],
  ['§5.6', 'Exclusión a mitad de tramo: el tramo se cierra en el hecho y el resto del paquete no se publica ni contabiliza', 'implementado', 'src/sim/materialize.js (fase 1/2)', 'S01-03', 'seg.cut'],
  ['§5.6', 'Rotación básica con prioridades y umbrales de energía/faltas/adecuación y permanencias mínimas; inferioridad con jugadores reales', 'aproximado', 'src/sim/engine.js (_rotate)', 'S01-03; fuzz de inferioridad', 'política ENTREF01–03; sin búsqueda de la mejor alineación'],
  ['§5.6', 'Empate final: prórrogas necesarias; límite técnico = fallo diagnosticado', 'implementado', 'src/sim/materialize.js (_closePeriod)', 'S01-04', 'rules.technicalGuardMaxOvertimes'],
  ['§6.1', 'Matriz de las 32 capacidades con consumidor, efecto, participantes, recálculo, ruta y contraste fijo +1/+3/+5', 'implementado', 'src/sim/capabilities.js; src/sim/probe.js', 'S01-05', '04-CAPACIDADES-32.csv'],
  ['§6.2', 'Pesos de prioridades 1–5, mezcla entrenador/oportunidad, finalizadores por adecuación sin prohibir por posición nominal, transición y espontáneo como categorías reales', 'implementado', 'src/sim/model.js (shotCells, finisherWeights)', 'S01-05', 'rolePreference: favorecida, no excluyente'],
  ['§6.2', 'Sin bonus universal por repetir la ficha con mayor media', 'implementado', 'src/sim/model.js', '—', 'no existe bonus de repetición ni memoria en SIM-01'],
  ['§6.3', 'Tabla de cobertura de estilos, media distancia, disposiciones, organizaciones y coberturas con ruta de parámetros', 'implementado', 'src/sim/controls.js', 'S01-05', '05-CONTROLES-Y-TABLAS.csv'],
  ['§6.3', 'box and one con objetivo/alternativa/ORG02; cobertura de bloqueo no se aplica a familias incompatibles', 'aproximado', 'src/sim/model.js (defenseAssignment, covK)', 'S01-05; fuzz', 'marca individual dedicada aproximada'],
  ['§6.3', 'Opciones exclusivamente detalladas identificadas sin efecto aparente', 'implementado', 'src/sim/controls.js; src/lab/sim-ui.js', '—', 'marcas, navegación, especiales, saques, roles'],
  ['§6.4', 'Familiaridad congelada: penalización limitada a calidad/control, ponderaciones una vez por cálculo, bloqueador participante; Polivalencia sin efecto en el partido; sin cambios de conocimiento', 'aproximado', 'src/sim/model.js (famQuality)', 'S01-06', 'solo calidad de la oportunidad; el avance presionado se aproxima por la altura de presión'],
  ['§6.4', 'Exposiciones compactas por posición y rol con unidad y procedencia', 'aproximado', 'src/sim/result.js (exposure)', 'S01-06', 'segundos por posición y rol ofensivo; no se declara cadena de saques'],
  ['§6.5', 'Energía por tiempo y carga de tramo con Resistencia; Forma constante; momentos individual/colectivo compactos; importancia y presión conocidas en la frontera; entrenador por plan', 'aproximado', 'src/sim/model.js; src/sim/engine.js (_updateMoments, _finishSegment)', 'S01-05', 'episodios EPI01–EPI06 y dinámica fina de momentos no se reconstruyen'],
  ['§7.1', 'Salida comprometida por partido (identidad, marcador, acta, DNP, zonas, familias, quintetos, registro temporal, conciliación)', 'implementado', 'src/sim/result.js', 'S01-02', 'contrato en docs/tecnico/sim-motor01.md'],
  ['§7.2', 'Mapa de procedencia de las salidas del catálogo del laboratorio', 'implementado', 'scripts/sim01-tables.js', '—', '03-OUTPUTS.csv'],
  ['§7.3', 'Invariantes obligatorios (18 comprobaciones SIM) sin reutilizar el comprobador del detallado', 'implementado', 'src/sim/reconcile.js', 'S01-02; 3.000 ejecuciones', '10-CONCILIACIONES.json'],
  ['§8', 'Interfaz mínima: equipos EQ01–EQ12, planes, semilla, perfil, acta/mapa/familias/quintetos/evolución, repetición, descargas y lote de 1.000', 'implementado', 'src/lab/sim-ui.js', 'recorrido 26 pasos', '13-PRUEBAS-Y-NAVEGADOR.md'],
  ['§8', 'Detener/reanudar tras reinicio, historia mundial y clasificación simultánea', 'no cubierto', '—', '—', 'corresponde a SIM-MOTOR-02'],
  ['§9', 'Medición real B01/B02/B03 con agenda congelada, cronómetros definidos y memoria sin sumar por worker', 'implementado', 'scripts/sim01-bench.js', 'B01/B02/B03', '09-RENDIMIENTO.json'],
  ['§9.1', 'Objetivo: 1.000 partidos en ≤5 s con cuatro workers', 'no cubierto', 'scripts/sim01-bench.js', 'B02 (frío) y B03 (caliente)', 'ver 00-LEEME.md y 09-RENDIMIENTO.json: resultado real, sin extrapolar'],
  ['§10.2', 'Recorrido automático de Chromium y descargas reales por sus bytes', 'implementado', 'scripts/browser/sim01-recorrido.mjs', 'recorrido 26 pasos', '13-PRUEBAS-Y-NAVEGADOR.md'],
  ['§13.1', 'Calidad estadística frente al detallado y competiciones reales', 'no cubierto', '—', '—', 'no validada por esta entrega (coeficientes de origen provisionales)'],
];

// ---------------------------------------------------------------------------------------------------------------------- procedencia de las salidas del catálogo del laboratorio
const G = 'Generado'; const D = 'Derivado'; const S = 'Secuencia compatible'; const X = 'Exclusivo del detallado'; const P = 'Pendiente de integración (02)'; const N = 'Sin dato deportivo';
const IND = {
  TC_PCT: [D, 'aciertos/intentos de campo', 'intentos de campo válidos', 'derivable'], T2_PCT: [D, 'T2C/T2I', 'intentos de dos', 'derivable'], T3_PCT: [D, 'T3C/T3I', 'triples intentados', 'derivable'],
  EFG: [D, '(TCC + 0,5·T3C)/TCI', 'intentos de campo', 'derivable'], FREQ3: [D, 'T3I/TCI', 'intentos de campo', 'derivable'], FGPPA: [D, 'puntos de campo/TCI', 'intentos de campo', 'derivable'],
  AST_PCT: [D, 'canastas con pase final/canastas elegibles (la asistencia es el pase final de una canasta, política EST-SIM01-R1)', 'canastas de campo', 'derivable'],
  FT_PCT: [D, 'TLC/TLI', 'libres', 'en acta'], TS: [D, 'PTS/[2·(TCI + 0,44·TLI)] (estimador con nombre, no oportunidades exactas)', 'partido', 'derivable'], FT_PER_FG: [D, 'TLI/TCI', 'partido', 'derivable'],
  PTS_F: [D, 'puntos de finalización/finalizaciones SIM (tiros de campo + faltas de tiro); universo propio de SIM, no F de posesión beM', 'finalizaciones SIM', 'derivable'],
  ORTG: [D, '100·PTS/controles propios (universo SIM)', 'controles generados', 'derivable'], DRTG: [D, '100·PTS rival/controles rivales', 'controles generados', 'derivable'], NETRTG: [D, 'ORtg − DRtg', 'controles generados', 'derivable'],
  PACE: [D, 'controles/40 min (prórrogas en la duración)', 'tiempo disputado', 'derivable'], PER100: [D, '100·PER/controles', 'controles generados', 'derivable'], TOV_CONV: [D, 'PER/(TCI + 0,44·TLI + PER) (estimador con nombre)', 'partido', 'derivable'],
  POSS_EST: [D, 'estimador TCI + 0,44·TLI − RO + PER, nombrado aparte; el universo generado es `controls`', 'partido', 'derivable'], OREB_PCT: [D, 'RO/(RO + RD rival)', 'rebotes', 'derivable'], DREB_PCT: [D, 'RD/(RD + RO rival)', 'rebotes', 'derivable'],
  STL100: [D, '100·ROB/controles rivales', 'controles rivales', 'derivable'], BLK_RIV: [D, 'TAP/TCI rivales', 'intentos rivales', 'derivable'], FOUL_RATE: [D, '100·FC/controles rivales', 'controles rivales', 'derivable'],
  REB_OPP: [D, 'rebotes/oportunidades (cada oportunidad se resuelve o tiene causa terminal explícita)', 'oportunidades de rebote', 'derivable'], CLOSE_SHARE: [P, 'consulta individual sobre cierres', 'cierres del equipo', 'pendiente'], PROD100: [P, 'consulta individual sobre créditos y presencia', 'ataques con presencia completa', 'pendiente'],
  HIST_PCTL: [N, 'requiere historial de varios partidos compatibles', '—', 'ausencia tipada'], MATES: [N, 'el motor no representa mates (campo no registrado)', '—', 'ausencia tipada'],
};
const BLK = {
  acta: [G, 'acta individual y de equipo completa en el resultado', 'jugadores y equipos', 'en resultado'], formulas: [D, 'fórmulas de la política de acta sobre los hechos', 'partido', 'derivable'],
  evolution: [S, 'evolución por tramo + registro temporal de hechos', 'tramos y hechos', 'en resultado'], map: [G, 'mapa por zonas del perfil (aro, interior, media, triple) y calidad previa por clase; sin coordenadas ni lados', 'intentos', 'en resultado'],
  offense: [G, 'uso y producción por familia/ficha y fuente (organizado, transición, espontáneo, rebote); director, alternativas y lecturas = exclusivo del detallado', 'finalizaciones', 'en resultado (parcial)'], defense: [G, 'organización/cobertura/altura efectivas por tramo; responsabilidades y ayudas exactas = exclusivo del detallado', 'tramos', 'en resultado (parcial)'],
  restarts: [X, 'SIM no genera saques ni cadenas de saque', '—', 'sin salida SIM'], offball: [X, 'trabajo útil sin balón requiere instrumentación de movimientos que SIM no ejecuta', '—', 'sin salida SIM'],
  presence: [G, 'quintetos con intervalos, minutos y producción atribuible; on/off derivable', 'intervalos', 'en resultado'], summary: [P, 'resumen, claves, líderes y crónica del laboratorio', '—', 'pendiente (02)'],
  reports: [P, 'informes propio/rival/individual', '—', 'pendiente (02)'], export: [P, 'exportación analítica completa del laboratorio; SIM tiene su propia descarga de entrada, resultado y conciliación', '—', 'pendiente (02)'],
};
const FAM = {
  shots: [G, 'intentos, aciertos, valor, zona, calidad y tirador; un fallo con falta de tiro no es intento de campo, la canasta con falta conserva su libre ligado', 'intentos', 'en resultado'], assists: [G, 'pase final generado (emisor ≠ receptor) y crédito por canasta o serie de libres elegible', 'canastas/series', 'en resultado'],
  turnovers: [G, 'pérdida con autor; robo enlazado uno a uno con pérdida rival robable', 'pérdidas', 'en resultado'], rebounds: [G, 'oportunidad → rebote RO/RD individual o causa terminal explícita', 'oportunidades', 'en resultado'],
  blocks: [G, 'tapón dentro de un intento elegible', 'intentos', 'en resultado'], fouls: [G, 'faltas cometidas y recibidas, bonus y exclusión; técnicas/antideportivas sin generación natural', 'faltas', 'en resultado'],
  presence: [S, 'intervalos de presencia por tramo; más/menos desde los puntos de cancha', 'intervalos', 'en resultado'], possessions: [D, 'controles SIM (universo propio); distinto de la «posesión beM» del acta del detallado, que es exclusiva del detallado', 'controles', 'en resultado (`controls`)'],
  valuation: [D, 'VAL = PTS + RT + AS + REC + TAP + FR − fallos de campo − fallos de libre − PER − TREC − FC', 'jugador', 'en acta'],
};
const UNREP = { dunks: [N, 'mates no representados', '—', 'ausencia tipada'], teamRebounds: [G, 'sujeto colectivo `teamReb`; SIM solo lo genera si no hay participantes elegibles', 'oportunidades', 'en resultado (0 en la práctica)'], coachFouls: [N, 'faltas de entrenador no representadas', '—', 'ausencia tipada'], benchFouls: [N, 'faltas de banquillo no representadas', '—', 'ausencia tipada'] };
export function outputRows(catalog, blocks, families) {
  const rows = []; const row = (kind, id, label, m) => rows.push([kind, id, label, m[0], m[1], m[2], m[3]]);
  for (const c of catalog) row('indicador', c.id, c.label, IND[c.id] ?? [P, 'sin clasificar', '—', 'pendiente']);
  for (const b of blocks) row('bloque analítico', b.id, b.block, BLK[b.id] ?? [P, 'sin clasificar', '—', 'pendiente']);
  for (const f of families) row('familia de la política estadística', f.id, f.label, FAM[f.id] ?? [P, 'sin clasificar', '—', 'pendiente']);
  for (const [k, m] of Object.entries(UNREP)) row('no representado por el detallado', k, k, m);
  return rows;
}
export const OUTPUT_HEADER = ['tipo', 'id', 'elemento', 'clase_de_procedencia', 'definicion_o_nota', 'universo', 'disponibilidad_en_SIM'];

// ---------------------------------------------------------------------------------------------------------------------- estados, entrenador y tablas de efecto
export const STATE_ROWS = [
  ['energía', 'estado', 'Gasto por minuto vivo (energy.costPerLiveMinute × factor de Resistencia × carga del tramo), recuperación de banquillo y descansos; severidad por curva de nodos', 'energy.*', 'cada tramo; severidad a tarea técnica/física', 'probe: FIS06 → energy.cost', 'implementado'],
  ['Forma', 'estado', 'Constante durante el encuentro; logit máximo por tarea (form.taskMaxLogit) separado de la energía', 'form.*', 'entrada fija', 'probe pMake / term.to', 'implementado'],
  ['momentos individuales M-TIR/M-OFE/M-DEF', 'estado', 'Proceso de decaimiento a semivida (moment.playingHalfLifeSeconds) con innovación de amplitud MEN06 (acotada); perturba binarias y categorías con alfa por tarea', 'moment.*', 'cada tramo', 'MEN06 → moment.sigma', 'aproximado'],
  ['momento colectivo T', 'estado', 'Decae con la semivida del equipo; innovación 0 (perfil heredado); solo mejora la calidad previa de la oportunidad', 'teamMoment.*; plan.initialTeamMoment', 'cada tramo', 'tests de probe', 'aproximado'],
  ['importancia y presión', 'estado', 'P = máx(importancia, tensión) con tensión por periodo, cercanía al final y diferencia en la frontera; pérdida (1 − a(MEN07)); no usa el marcador futuro del tramo', 'pressure.*', 'frontera del tramo', 'MEN07 → pressure.lossShot', 'aproximado'],
  ['entrenador (rotación y faltas)', 'estado', 'Política ENTREF01–03: revisión de energía, permanencias mínimas, protección por faltas del librillo y retorno de titulares', 'tablas coach.policies / coach.foulBook', 'cada frontera', 'comparación de sustituciones', 'aproximado'],
  ['familiaridad (posición, rol, táctica)', 'conocimiento', 'Penalización limitada a calidad de la oportunidad (maxDefensa·U_D − maxAtaque·U_A); congelada; legacy-neutral sin conocimiento explícito', 'familiarity.*', 'cada tramo', 'S01-06', 'aproximado'],
  ['Polivalencia', 'aprendizaje posterior', 'Sin efecto en el partido; solo aprendizaje posterior (02)', '—', '—', 'S01-06', 'implementado'],
];
export function capabilityRows(contrast) {
  const meta = Object.fromEntries(CAPABILITIES.map((c) => [c.id, c]));
  return contrast.map((c) => [c.id, meta[c.id].name, meta[c.id].consumers, meta[c.id].effect, meta[c.id].participants, meta[c.id].recalc, meta[c.id].params.join(' · '), c.contrast.map((x) => `+${x.delta}: ${x.changedKeys} magnitudes (${x.expectedKeys} esperadas)${x.capped ? ` tope 30 en ${x.capped} jugador(es)` : ''}`).join(' | '), c.contrast[0].examples.map((e) => `${e.key} ${Number(e.base).toPrecision(5)}→${Number(e.after).toPrecision(5)}`).join('; '), c.used ? 'sí' : 'NO']);
}
export const CAPABILITY_HEADER = ['id', 'capacidad', 'receta_o_variable_consumidora', 'efecto', 'participantes', 'frecuencia_de_recalculo', 'ruta_de_parametros', 'contraste_fijo_+1/+3/+5 (quinteto titular de EQ03, contexto fijo, importancia «important»)', 'ejemplo_base→tras_+1', 'usada'];
export function controlRows(contrasts) { return contrasts.map((c) => [c.group, c.id, c.label, c.status, (c.values ?? []).join('/'), c.effect ?? c.note ?? '', (c.params ?? []).join(' · '), (c.changed ?? []).length, (c.per ?? []).map((p) => `${p.value}: ${p.changedKeys ?? p.error} cambios${p.top?.length ? ` [${p.top.slice(0, 2).join(', ')}]` : ''}`).join(' | ')]); }
export const CONTROL_HEADER = ['grupo', 'control', 'nombre', 'estado', 'valores_probados', 'efecto_representado', 'ruta_de_parametros', 'magnitudes_distintas_que_cambian', 'detalle_por_valor (misma entrada salvo el control; EQ03 contra EQ04)'];
