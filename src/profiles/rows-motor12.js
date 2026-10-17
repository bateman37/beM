// Filas del diccionario para SEM-MOTOR12 (LAB01: ejecución masiva y extracción). Mismo contrato que rows.js. Son preferencias TÉCNICAS de orquestación, registro y
// exportación de lotes: NO son multiplicadores deportivos, no cambian ninguna probabilidad ni el azar deportivo y no entran en la huella de trayectoria. Un lote en marcha
// conserva los valores con que se congeló (agenda, semillas y configuración); cambiar estas filas después solo afecta a los lotes que se preparen a partir de entonces.
const EXT = 'SEM-MOTOR12';
const A = { cls: 'balance', views: ['laboratorio'], ext: EXT, optional: true, grp: 'LAB01', mech: 'batch/runner.js' };
const NOT_SPORT = 'Solo cambia cómo se orquesta, registra o exporta un lote; el deporte de cada partido y su azar no se tocan.';
const row = (path, type, unit, label, desc, effect = NOT_SPORT) => ({ ...A, path, type, unit, label: () => label, desc: () => desc, effect: () => effect });

export const MOTOR12_FAMILIES = [
  row('batch.concurrency', 'count', 'partidos a la vez', 'Lotes · concurrencia de partidos', 'Partidos simultáneos del controlador (precarga 1: secuencial). Desde MOTOR-15 el grupo local de trabajadores admite 1, 2 o 4 (y «auto» = max(1, min(4, núcleos − 1)) como opción de ejecución); es configuración OPERATIVA, no una probabilidad deportiva. Otro valor se rechaza al preparar el lote.'),
  row('batch.repetitionShortcuts.0', 'count', 'repeticiones', 'Lotes · acceso rápido 1', 'Primer acceso rápido de repeticiones por enfrentamiento y por variante (precarga 10). El total real se muestra siempre antes de iniciar.'),
  row('batch.repetitionShortcuts.1', 'count', 'repeticiones', 'Lotes · acceso rápido 2', 'Segundo acceso rápido (precarga 100).'),
  row('batch.repetitionShortcuts.2', 'count', 'repeticiones', 'Lotes · acceso rápido 3', 'Tercer acceso rápido (precarga 1.000).'),
  row('batch.partTargetMiB', 'count', 'MiB sin comprimir', 'Lotes · objetivo de tamaño por parte', 'Objetivo técnico de contenido sin comprimir por ZIP de parte (precarga 64 MiB). Es una semilla de partición que se ajustará midiendo, no el límite de subida de ninguna plataforma ni una garantía de tamaño comprimido.'),
  row('batch.progressIntervalMs', 'count', 'milisegundos', 'Lotes · actualización de progreso', 'Cada cuánto consulta la interfaz el progreso (precarga 500 ms) además de al confirmarse cada encuentro. Presentación: no escribe ningún acontecimiento deportivo.'),
  row('batch.maxExecutionsPerJob', 'count', 'ejecuciones lógicas', 'Lotes · límite técnico de ejecuciones por trabajo', 'Tope visible y administrable de ejecuciones lógicas por trabajo (precarga 5.000). Una petición mayor se rechaza antes de empezar con su motivo; nunca se recorta a los primeros N.'),
];
// Texto de identificación y enumeraciones (la versión, el nombre, el esquema, los niveles y los métodos son contenido declarativo, no filas numéricas).
export const MOTOR12_EXEMPT = [/^batch\.(version|name|provenance|packageSchema|defaultRecordLevel|defaultProse|quantileMethod|stdMethod|defaultObjective|seedDerivation|maxExecutionsReason)$/];
