# MOTOR-15 — Cierre funcional, compatibilidad y rendimiento del mundo

**Destinatario:** Claude Code, repositorio `bateman37/beM`.

**Mandato:** corrige el panel de ajustes, completa los pendientes funcionales de MOTOR-14 y prepara una ejecución exacta y eficiente para los partidos del mundo. Devuelve el producto comprobable y los paquetes de evidencia especificados en este encargo.

**Base de este prompt:** funcional vigente, prompts anteriores, informe de MOTOR-14 y decisiones aceptadas por Dennis. No se ha inspeccionado directamente el código de su PR para preparar este documento. Los nombres físicos se contrastan con el repositorio antes de implementar.

**Secuencia aprobada:** MOTOR-15 completa y prepara; MOTOR-16 realizará la campaña amplia de diagnóstico; MOTOR-17 aplicará las conclusiones que Dennis y ChatGPT decidan. Tener presupuesto disponible permite terminar el trabajo necesario, no ejecutar campañas sin una pregunta ni ampliar el diseño deportivo por iniciativa propia.

## Índice

1. [Reglas, precedencia y resultado](#m15-01)
2. [Base real, conservación y lectura dirigida](#m15-02)
3. [Bloques de ejecución y límites](#m15-03)
4. [Error del panel y perfiles anteriores](#m15-04)
5. [Cierre normativo y procedencia](#m15-05)
6. [Contrato de correcciones y sanciones](#m15-06)
7. [Lanzamiento pendiente e interferencia](#m15-07)
8. [Semillas nuevas explícitas](#m15-08)
9. [Asistencias, estados y recomendaciones](#m15-09)
10. [Conservar MOTOR-14 y terminar su integración](#m15-10)
11. [Salida esencial para el mundo](#m15-11)
12. [Trabajadores persistentes y controlador](#m15-12)
13. [Medición, objetivos y optimización](#m15-13)
14. [Versiones, perfiles y compatibilidad](#m15-14)
15. [Plan de verificación compartido](#m15-15)
16. [Navegador y recorrido manual](#m15-16)
17. [Auditorías y preparación de MOTOR-16](#m15-17)
18. [Devolución: paquete de lectura rápida](#m15-18)
19. [Devolución: evidencia detallada](#m15-19)
20. [Integridad y comprobador de la devolución](#m15-20)
21. [Documentación y cierre consultable](#m15-21)
22. [Aceptación y límites de la entrega](#m15-22)
23. [Informe final para Dennis y ChatGPT](#m15-23)

<a id="m15-01"></a>

## 1. Reglas, precedencia y resultado

### 1.1 Mandato deportivo

Continúa el motor por acontecimientos dentro de posesiones. Mantén contexto activo pequeño, operaciones compartidas, memoria limitada y resolución de participantes pertinentes. El resultado debe seguir pareciendo un partido jugado con decisiones tácticas, atributos, continuidad, esfuerzo, administración y acta conectados.

- Trabaja exclusivamente en beM. No inspecciones `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios. Puedes consultar las fuentes públicas normativas y técnicas identificadas en este encargo.
- No añadas ticks, movimiento continuo de diez jugadores, coordenadas físicas, un simulador aislado de bloqueos ni otra arquitectura deportiva.
- Conserva las 32 capacidades y sus ámbitos. No añadas un overall, atributos de disciplina, nuevas notas mentales ni bonus universales de edad, experiencia o reputación.
- No calibres ahora el marcador, las probabilidades generales de tiro o la variación para acercarte a una media ACB. Es materia de MOTOR-16/17.
- Las nuevas filas SEM de §8 completan incidencias concretas; no son una calibración poblacional ni datos observados en baloncesto real.
- Una optimización, consulta, cambio de registro o ejecución en trabajadores debe conservar el deporte bajo iguales entradas/versiones/órdenes.
- Una corrección deportiva o estadística tiene causa y versión propias. No mantengas una regla errónea para conservar un marcador histórico.
- Parámetros de juego y auditoría administrados desde el panel. Límites operativos separados. Las consecuencias reglamentarias no son tasas SEM.
- Preserva perfiles, entradas, partidos, guardados y archivos del usuario. No borres almacenamiento del navegador, reinicies la base de datos ni hagas migraciones silenciosas.
- Pruebas automáticas necesarias y proporcionadas; Dennis hará mucha revisión manual. Reutiliza invariantes y ejecuciones, sin crear una prueba o campaña por cada fila.
- Resuelve las decisiones técnicas locales y reversibles. No devuelvas como nueva decisión deportiva lo ya fijado aquí o en el funcional.
- No cambies stack ni infraestructura. No migres el laboratorio a PostgreSQL, no añadas servicios externos, IA, sistemas distribuidos ni una carrera de manager.
- No fusiones ni publiques, no crees release, no te suscribas a la PR y no envíes mensajes a terceros.

### 1.2 Cambios explícitos respecto a MOTOR-14

Este prompt amplía y precisa el cierre anterior:

1. El grupo local de trabajadores persistentes queda autorizado, con aislamiento, límites y medición. Sustituye la preferencia anterior por dejarlo fuera del cierre.
2. Se añade un nivel de conservación esencial para el mundo, con el mismo resolutor exacto. No sustituye el registro completo de laboratorio.
3. Se suministran semillas SEM concretas para ordenar el lanzamiento pendiente y generar interferencia bajo condiciones pertinentes.
4. Se autoriza un único lote final de cien ejecuciones para medir rendimiento, además de las comprobaciones pequeñas. Es un benchmark, no la campaña de calibración de MOTOR-16.
5. Se fijan objetivos de evaluación de coste y un contrato concreto de archivos de devolución.

Estas precisiones se documentan como decisiones MOTOR-15. No reescribas el funcional para afirmar que siempre estuvieron implementadas.

### 1.3 Resultado exigido

Al terminar debe ser posible entrar al panel con un perfil anterior, recuperar una configuración compatible de forma explícita, jugar y continuar desde UI, resolver los pendientes definidos, ejecutar encuentros sin carga diagnóstica innecesaria y distribuirlos entre trabajadores con resultados reproducibles.

El producto se acompaña de evidencia legible y verificable. MOTOR-15 no declara calibración externa, aprobación manual de Dennis ni rendimiento suficiente si las mediciones no lo sostienen.

<a id="m15-02"></a>

## 2. Base real, conservación y lectura dirigida

### 2.1 Comprobar la dependencia

El último informe sitúa MOTOR-14 como parcial, en la PR `bateman37/beM#15`, abierta sin fusionar, partiendo de MOTOR-13 ya en `main`. Comprueba el estado real:

- Si `main` contiene MOTOR-14, parte de esa base actualizada.
- Si sigue sin fusionar y su rama está disponible, parte de su commit real y declara la PR dependiente. No lo fusiones por tu cuenta.
- Si la base necesaria no está accesible, identifica esa dependencia sin reconstruir MOTOR-14 desde su resumen.

Preserva cambios ajenos y registra estado inicial, commit base y rama efectiva. Rama sugerida: `feature/MOTOR-15-cierre-y-mundo`, o la impuesta por el entorno.

### 2.2 Declaraciones que contrastar

| Área | Informe recibido de MOTOR-14 |
|---|---|
| Suite | 176 pruebas, seis nuevas; datos y documentación correctos. |
| Referencia | `20261016`: 83–103, 6.505 sorteos, misma trayectoria. |
| Capacidades | TEC17/TEC18/MEN02/MEN03/MEN06/MEN07/FIS06 capturadas desde cálculos existentes. |
| Guardados | Cuatro continuaciones con mismo futuro; alterados/incompletos/incompatibles rechazados. |
| Inferioridad | Continuación con cuatro/tres/dos; terminación por debajo del límite del perfil; unas 120 semillas declaradas. |
| Equivalencia | Ocho casos; `npm run equivalence`; AUD29 ejecutable. |
| Contrato | `src/engine/index.js`, explicado en `docs/tecnico/motor14-contrato.md`. |
| Coste | Simulación completa 3,05 → 1,37 s; reducida 0,77 → 0,52 s, cuatro vCPU y Node 22. |
| Pendiente | Vuelo/interferencia, categorías y combinadas, art. 45, análisis propio por tramo, asistencias causales, REC10, cierre, campaña parcial, auditorías actualizadas y navegador. |

No son comprobaciones realizadas por ti. Verifica lo material y conserva diferencias. Aclara qué fueron aquellas 120 semillas: partidos completos, estados preparados u otro alcance. No las repitas por defecto ni las cuentes como evidencia nueva.

### 2.3 Lectura dirigida

Normas raíz, índices, estado, roadmap, `docs/tecnico/motor14.md` §6, `docs/tecnico/evidencia-motor14/inventario.md` y contrato. Después abre el tema/productor implicado.

Consulta los prompts MOTOR-09/10/13/14 y capítulos del unificado relacionados con reglamento, conservación, análisis, panel, auditoría y coste. Conserva las correcciones de quintetos, posesiones mixtas, puntos sin tiempo y `lineup_ids`.

Los adjuntos históricos `DESIGN(1).md` y `CLAUDE.odt` no son especificación vigente de beM. No releas todo el documento unificado en cada fase: utiliza sus páginas temáticas y enlaces.

<a id="m15-03"></a>

## 3. Bloques de ejecución y límites

| Bloque | Trabajo | Evidencia de salida |
|---|---|---|
| A | Compatibilidad y recuperación del panel. | Causa localizada y recorrido de perfil anterior sin pérdida de datos. |
| B | Pendientes normativos, tiro/serie y análisis. | Productores/administración comunes, créditos y guardados coherentes. |
| C | Registro esencial y trabajadores. | Igualdad deportiva y control correcto del lote. |
| D | Medición y cierre. | Resultados reales, navegador, paquetes y estado preparado para MOTOR-16. |

Usa commits revisables por bloque, manteniendo una PR de entrega. Resuelve primero el error de acceso al panel; no lo dejes para después de un benchmark largo.

No rehagas lo que ya funciona en MOTOR-14. Completar un consumidor o extraer una función pura es preferible a una reescritura general. Si una corrección cambia el comportamiento, toma una referencia de esa versión antes de optimizarla.

Fuera de alcance: resolución deportiva agregada alternativa, mundo/calendario/carrera, campañas amplias de calibración, optimización automática de coeficientes y catálogo nuevo de estadísticas. Esas decisiones se tomarán tras MOTOR-16.

<a id="m15-04"></a>

## 4. Error del panel y perfiles anteriores

### 4.1 Hecho observado

Al acceder al panel de ajustes aparece:

`No se pudo preparar el panel: Cannot read properties of undefined (reading 'policies')`

La captura muestra aplicación MOTOR-13, perfil activo protegido V0 de la cadena SEM hasta MOTOR-04 y dataset POB-MOTOR11-R1, con aviso de perfil anterior. Esto es una pista de compatibilidad, no una causa demostrada.

### 4.2 Diagnóstico y arreglo

Reproduce con un perfil equivalente válido de aquella versión o una copia conservada si está disponible. Captura traza, petición/etapa fallida y objeto cuyo padre es `undefined`; identifica archivo, función y supuesto incorrecto.

Comprueba si falla la lectura de un perfil, un catálogo de entrenador, una proyección de módulos o cualquier otra dependencia real. No deduzcas el origen solo por el nombre `policies`.

Corrige la carga/validación en su frontera. No añadas objetos vacíos o encadenamiento opcional indiscriminadamente para esconder configuración deportiva obligatoria ausente.

### 4.3 Comportamiento aprobado

- Un perfil anterior no hace caer toda la preparación del panel.
- El panel muestra identidad, versión y capacidades disponibles; distingue módulos no compatibles de valores cero.
- Las vistas de catálogo y la recuperación siguen accesibles aunque ese perfil no pueda ejecutar alguna función nueva.
- Se ofrece crear una candidata compatible desde la base actual y sus diferencias, o activar explícitamente la base actual.
- El original protegido, planes y variantes permanecen intactos. No hay conversión ni activación silenciosa.
- Si un campo requerido no puede reconstruirse de forma declarada, el perfil no se presenta como listo para un partido que lo necesita.
- El recorrido de recuperación no depende de entrar precisamente en la vista que ha fallado.

Una adaptación técnica de metadatos o campos opcionales tiene reglas versionadas. Las semillas deportivas nuevas se incorporan a la candidata según su base y diff explícitos, no como defaults ocultos al consultar.

### 4.4 Verificación específica

Incluye un perfil anterior, uno actual y un perfil genuinamente inválido. Verifica apertura del panel, mensaje localizado, recuperación, conservación del original y ausencia de activación accidental. Reutiliza una comprobación parametrizada y un recorrido real de navegador.

Entrega causa y cambio concreto. Si no reproduces la captura exacta, dilo y aporta el caso equivalente verificado; no afirmes que era caché ni que se resolvió por añadir un favicon.

<a id="m15-05"></a>

## 5. Cierre normativo y procedencia

### 5.1 Perfil y fuentes

Mantén FIBA 2026 v1.1 y la política estadística declarada. No crees una tercera categoría «antideportiva» encima de disruptiva/flagrante por conservar una etiqueta histórica; los alias necesitan correspondencia explícita.

| ID | Fuente primaria | Uso dirigido |
|---|---|---|
| N15-01 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf> | Reglamento principal, en especial 10/17/29/31/35–45. |
| N15-02 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-interpretations-v1-0.pdf> | Casos 43 y 45 y excepciones pertinentes. |
| N15-03 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-rule-changes-v10a.pdf> | Antecedente oficial de cambios 2026; prevalece N15-01 ante discrepancias. |
| N15-04 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf> | Créditos, con adaptación identificada a 2026. |

Las síntesis siguientes proceden de lectura selectiva de ChatGPT del 17/10/2026. Si el PDF te devuelve 403, puedes utilizar el contenido suministrado con esa procedencia. No lo presentes como lectura directa tuya ni como auditoría exhaustiva del documento completo.

Usa primero el material ya conservado. No gastes la entrega repitiendo descargas fallidas. Un supuesto ajeno a lo descrito requiere identificación precisa de la excepción; no permite declarar bloqueado todo el administrador ni inventar consecuencias.

### 5.2 Contadores y categorías: contrato heredado y precisión

Conserva las sanciones de disruptiva/flagrante, reanudación y reloj ya suministradas en MOTOR-09/14; confirma su consumo efectivo. La incidencia de una categoría no se decide de nuevo dentro del administrador.

Síntesis de categorías contrastada con N15-03:

> Técnicas de jugador: categoría 1 cuenta para descalificación acumulada; categoría 2 no. Ambas cuentan como falta individual y colectiva. La técnica de banquillo se imputa al entrenador y no al contador colectivo. Un jugador queda descalificado por dos técnicas de categoría 1, dos flagrantes o una de cada; no por dos disruptivas. El entrenador tiene sus contadores C y B/BD diferenciados: dos C o tres con la combinación reglamentaria correspondiente. La descalificación acumulada no añade por sí sola otra sanción. Las disruptivas y flagrantes conservan sus propios registros y consecuencias, sin mezclarlas con una técnica ordinaria.

No sumes contadores incompatibles. La retirada obligatoria, sustitución y reorganización usan el flujo natural de MOTOR-14. No inventes un receptor individual de una técnica sin sujeto que haya recibido contacto.

### 5.3 Ocurrencia y administración

Implementa la administración tipada aunque una incidencia se reciba desde el contexto o un escenario. Reutiliza las condiciones/frecuencias deportivas existentes para su aparición natural. No añadas una personalidad arbitral ni un generador de mala conducta derivado de las 32 capacidades.

El informe distingue: administrador ejecutable, productor natural conectado, contexto externo admitido y exposición observada. Un caso preparado valida administración; no acredita frecuencia natural.

Si el motor ya produce una incidencia, su ruta real debe llegar a la misma administración. No conserves un handler completo únicamente para tests y otro atajo incorrecto para partidos.

<a id="m15-06"></a>

## 6. Contrato de correcciones y sanciones

### 6.1 Cola causal común

Completa las categorías pendientes, combinadas y compensación utilizando la cola y series existentes. Cada incidencia conserva orden, sujeto, equipo, clasificación, efecto en contadores, penalización, contexto de control/derecho y estado de administración.

La equivalencia de dos penalizaciones incluye sus derechos, no solo el número de libres. Compensar sanciones no borra las faltas cargadas ni crea una posesión ficticia. El sistema conserva una sola reanudación efectiva al terminar la administración.

Síntesis selectiva de N15-02, artículo 43:

> Ordena las incidencias y compensa penalizaciones equivalentes por orden. Una técnica ordinaria se administra prioritariamente; la excepción de técnica imputada al entrenador por descalificación de otra persona de banquillo conserva el orden del caso. Una penalización ya iniciada con balón vivo no vuelve a utilizarse para compensar. El último derecho de posesión sancionador sustituye derechos anteriores. Sin sanciones restantes, recupera la reanudación correspondiente al contexto previo. En 43-5, canasta más adicional y posterior técnica del anotador conservan la canasta y compensan las sanciones equivalentes. En 43-7, el adicional por flagrante y la técnica no equivalen: la técnica se administra primero y se conserva el derecho sancionador. Las técnicas ordinarias conceden un libre sin alineación y recuperan la situación de juego aplicable.

Conserva condición y consumidor por caso. Una regla normativa no es una preferencia ajustable para conseguir más o menos puntos.

### 6.2 Artículo 45: ventanas y contrato de entrada

La entrada de corrección identifica error, tipo, hecho original, instante de reconocimiento, contexto de paradas/control, valores correctos autorizados y solicitante habilitado. No es un botón de retroceder a voluntad ni una inferencia desde el marcador final.

Síntesis de N15-01, 45.1–45.6:

> Categoría 1: errores de libres, lanzador, puntos, infractor, mesa y reloj de juego. Antes de los últimos 2:00 del cuarto cuarto, corrige antes del umbral; si la primera parada posterior lo cruza, antes de reanudar. En los últimos 2:00 o prórroga, antes de reanudar tras la primera parada posterior. Al final solo sobrevive la excepción del error posterior a la última parada, con corrección inmediata. La actividad posterior legítima permanece. Libres indebidos: anular; omitidos: administrar salvo excepción de canasta posterior del mismo equipo tras saque erróneo. Lanzador permitido incorrectamente: cancelar serie y posesión sancionadora; dirigido incorrectamente: sustituir la serie por la del lanzador correcto. Puntos, sujetos, recursos y reloj se rectifican con sus efectos. Categoría 2: reloj de posesión; corregible inmediatamente o en primera parada manteniendo control/derecho. Caduca con cambio de control de balón vivo, canasta válida o final. La reanudación respeta contexto y excepciones del caso.

No confundas las categorías de corrección con las categorías de técnica: son dominios distintos.

### 6.3 Correspondencia ejecutable y supuestos

Completa filas y operaciones existentes para las clases anteriores. La fila conserva referencia a 45.4.1–45.4.8 o 45.6 y los datos que distinguen sus ramas: reloj iniciado, cambio de control, canasta posterior, lanzador permitido/dirigido, derecho previo y juego ya continuado.

No generalices que cualquier error permite repetir libres ni que toda corrección anula todo lo sucedido después. Tampoco utilices la política de corrección estadística tras final para saltarte una ventana reglamentaria del encuentro.

Verifica al menos, agrupando casos:

- Error corregible y el mismo error con ventana caducada.
- Primera parada que cruza el umbral frente a una oportunidad ya perdida.
- Lanzador permitido frente a dirigido erróneamente, con resultados diferenciados.
- Corrección del reloj de posesión conservando control frente a caducidad por cambio de control o canasta.
- Rectificación de puntos o sujeto que propaga cambios a los derivados pertinentes.

Si un supuesto requiere una excepción no cubierta por las fuentes/extractos disponibles, registra exactamente artículo, rama y dato faltante y continúa las demás ramas. No devuelvas «art. 45 sin implementar porque el PDF da 403» cuando las operaciones anteriores sí están suministradas.

### 6.4 Registro y derivados

La revisión conserva original y rectificación enlazados. Actualiza acta, parciales, presencia/más-menos, resumen, análisis y conciliaciones según sus dependencias. Invalida cachés de la revisión afectada.

No vuelvas a sortear un hecho ya producido para corregir su lectura. Una nueva serie legalmente debida sí ejecuta sus intentos reales en el momento correspondiente. La carga física realizada y la validez estadística de un intento son datos diferentes.

Una corrección de reloj puede romper su monotonía aparente: los detectores deben reconocer la administración identificada. No la conviertas en bucle ni fuerces minutos o créditos para esconder el ajuste.

No generes errores arbitrales aleatorios para ejercitar estas rutas. Reciben incidencias tipadas y casos preparados que usan el mismo administrador que el juego.

<a id="m15-07"></a>

## 7. Lanzamiento pendiente e interferencia

### 7.1 Dos hitos discretos

Representa liberación y adjudicación/resolución pendiente. Reutiliza el tiro, sus participantes, duración y desenlace; no construyas física del balón ni otra fórmula de acierto.

La semilla de §8 divide el intervalo de la operación final de tiro ya existente: `lag = min(pendingLagSeconds, duración_de_esa_operación)` y liberación en `inicio + duración - lag`; resolución en la frontera final existente. No uses la duración de toda la posesión o reorganización.

Ese margen es una convención temporal SEM. No añade tiempo al que ya consumía la operación. No añade un sorteo de duración ni un sorteo adicional de acierto. Si el motor dispone de una distinción temporal equivalente válida, conserva su intervalo y documenta cómo adopta la semilla sin duplicarlo.

Si la señal queda entre liberación y resolución, conserva el lanzamiento pendiente y aplica el perfil antes de cerrar periodo/partido. El reloj no se vuelve negativo ni se añaden minutos posteriores a la señal. Si no se liberó válidamente, no inventes un intento para cuadrar el acta.

Los libres siguen su serie y su reloj deportivo propio; el margen del tiro de campo no hace correr reloj de juego durante un libre. Guardar en una frontera estable conserva fase, datos ya sorteados y consecuencias pendientes.

### 7.2 Interferencia condicionada

Completa administración y generación contextual usando las filas de §8. La elegibilidad procede de una interacción representada y participantes presentes:

- En tiro de campo, un lanzamiento válido de aro/pintura, con intervención próxima al aro ya representada.
- Para incidencia defensiva, existe defensor participante en esa disputa/intervención; no un defensor remoto escogido por conveniencia.
- Para incidencia ofensiva, existe atacante adicional implicado en continuación/disputa próxima; no se inventa un receptor ni se asigna a un ausente.
- En un último libre con posibilidad de disputa, usa los participantes y condiciones de esa serie; no generes la incidencia en un libre sin contexto compatible.
- Una sanción o balón muerto incompatible excluye la oportunidad. El perfil determina compatibilidades específicas.

No hay un sorteo de interferencia en cada posesión ni en un triple lejano por etiqueta. Cada oportunidad pertinente ofrece resultados excluyentes: ninguna, ofensiva o defensiva, con masa residual explícita. Si un lado no es elegible, su masa no se redistribuye al otro.

Usa la selección y capacidades ya resueltas para los participantes; el administrador no realiza otra tirada de mérito. Las semillas iniciales no pretenden explicar la conducta individual completa del infractor.

### 7.3 Consecuencia y crédito

El tipo conserva su causa, sujeto, fase y relación con el tiro/serie. Resuelve validez, crédito extraordinario, reanudación y eventual sanción adicional desde las políticas comunes. No generes canasta y rebote de un mismo desenlace incompatible, ni un TAP adicional por la misma interferencia.

El crédito estadístico sigue la política documentada, distinguiendo acción física, intento válido y puntos concedidos. Las incidencias de libres no se tratan automáticamente como un tiro de campo. Completa la correspondencia pertinente con N15-01/N15-04 y conserva los supuestos tipados del administrador ya existente.

Para comprobar estas ramas puedes proporcionar el hecho tipado o una copia SEM extrema de laboratorio, claramente identificada. No incrementes las frecuencias de referencia para que aparezcan en seis partidos ni uses esos casos para medir su frecuencia real.

### 7.4 Cambio semántico reconocido

Esta incorporación puede cambiar sorteos y finales respecto a MOTOR-14. Versiona el deporte y explica la diferencia. La igualdad exigida después es entre las modalidades/registros/trabajadores de la misma versión MOTOR-15, y entre antes/después de una optimización neutral de esa versión.

<a id="m15-08"></a>

## 8. Semillas nuevas explícitas

Las filas siguientes son decisiones de arranque de este encargo, **SEM, provisionales y sin calibrar**. Son editables y versionadas; no proceden de frecuencias empíricas FIBA/ACB. No modifiques otras tasas para compensarlas.

| ID semántico | Valor inicial | Unidad y ámbito |
|---|---:|---|
| SEM15-TIR-01 | 0,35 | Segundos de margen abstracto entre liberación y resolución del tiro de campo, dentro de su duración ya existente. |
| SEM15-INT-01 | 0,001 | Probabilidad de interferencia defensiva por oportunidad elegible de tiro de campo. |
| SEM15-INT-02 | 0,0005 | Probabilidad de interferencia ofensiva por oportunidad elegible de tiro de campo. |
| SEM15-INT-03 | 0,0005 | Probabilidad de interferencia defensiva por oportunidad elegible de último libre. |
| SEM15-INT-04 | 0,00025 | Probabilidad de interferencia ofensiva por oportunidad elegible de último libre. |

No son porcentajes sobre todos los tiros ni sobre todos los partidos. Los denominadores se conservan por tipo de oportunidad, junto a exclusiones y resultados. La residual es `1 - suma(masas elegibles)`; valida rango, compatibilidad y exclusión de resultados.

Si existen filas equivalentes ya definidas, no crees un segundo consumidor. Migra explícitamente a la extensión/candidata MOTOR-15 conservando valor anterior, nuevo valor, motivo y correspondencia. Los originales no se reescriben.

La distinción liberación/resolución es el requisito; esta semilla no obliga a animación ni a una curva física por distancia. Las frecuencias nuevas se revisarán en MOTOR-16/17. La administración de una incidencia clasificada nunca se sortea usando estas tasas.

No añadas tasas para equivocaciones arbitrales, personalidad disciplinaria o desviaciones de pase simplemente para completar el anexo. La ocurrencia natural y la entrada de incidencias tipadas se identifican por separado.

<a id="m15-09"></a>

## 9. Asistencias, estados y recomendaciones

### 9.1 Vínculo de asistencia

Completa el productor del candidato causal: pase/receptor previsto y efectivo, sector de recepción, continuidad de ventaja, creación propia posterior y motivo de cierre. Registra las interacciones que el núcleo realmente resuelve; no simules botes o movimientos para contarlos después.

Síntesis de N15-04, capítulo 6, conservada en MOTOR-10:

> Solo el último pase puede acreditarse. Recepción y anotación dentro de pintura, sin abandonarla, mantienen elegibilidad; fuera, distingue tiro sin bote y continuidad de ventaja frente a nueva creación ante defensor colocado. Recepción en campo propio con recorrido autónomo y desvío claro hacia otro destinatario excluyen el candidato. Una serie elegible por falta de tiro puede acreditar una asistencia si anota algún libre. Fallo y rebote intermedios rompen la relación anterior.

Aplica la jerarquía de esa política: no invalida automáticamente una asistencia interior elegible cualquier gesto individual. Las ayudas posteriores y un nuevo enfrentamiento contra el defensor colocado no son la misma situación.

Si el núcleo decide aislamiento/creación exterior nueva o continuar una ventaja recibida, conserva esa decisión y el contexto defensivo que la respalda. El crédito no recibe un nuevo sorteo.

Si existe un desvío real hacia otro destinatario, conéctalo. Si esa interacción no se genera, no la inventes para reducir AS: implementa la invalidación ante el hecho tipado y declara su alcance de generación. La ausencia de ese hecho en una muestra no se convierte en una desviación supuesta.

Mantén AS a canasta y AS a libres separados y el total según política. No uses AS total/FGM como porcentaje de canastas asistidas ni impongas AS total ≤ FGM. Las versiones históricas no se rellenan con información que no conservaron.

### 9.2 Estado propio por tramo

Construye una consulta desde estado inicial y cambios registrados. Energía con número/barra propios; Forma y momentos con categorías autorizadas; valores internos solo en diagnóstico.

Muestra valores de las fronteras/tramos realmente conservados. Si falta información para un instante intermedio, indica la muestra disponible. No interpolar aleatoriedad, actualizar estados al leer ni repetir el estado final en todos los periodos.

Mantén Forma estable durante el encuentro, neutralidad de Consistencia, atenuación del banquillo y ámbito limitado de T. No conviertas esta lectura en una recalibración.

La consulta de rival o entrenador automático no obtiene estados privados. Las exportaciones y cachés conservan audiencia y política.

### 9.3 Dos recomendaciones declarativas existentes

Completa REC10-01 y REC10-02 con las condiciones ya fijadas:

| ID | Condición SEM vigente | Lectura permitida |
|---|---|---|
| REC10-01 | Cuatro ejecuciones ante una misma respuesta, dos negaciones de salida y dos oportunidades de alternativa registradas y autorizadas. | Considerar una variante disponible que utilice esa alternativa, mostrando concesión/riesgo. |
| REC10-02 | Cinco fallos propios con encargo de carga y dos transiciones rivales enlazadas a esos fallos. | Revisar carga/balance, mostrando también rebotes ofensivos en ese universo. |

Los parámetros y textos viven en datos. No generes otra estrategia, no apliques automáticamente el consejo y no prometas el desenlace de un contrafactual no resuelto. Si falta exposición o permiso, muestra insuficiencia; no una recomendación genérica idéntica para las dos reglas.

### 9.4 Correcciones de lector conservadas

Mantén identidad de conjuntos y puestos diferenciada, posesiones mixtas aparte y puntos válidos en tramos sin tiempo. `lineup_ids` y los CSV deben seguir conciliando. Un cambio de lectura no modifica hechos deportivos.

<a id="m15-10"></a>

## 10. Conservar MOTOR-14 y terminar su integración

No reconstruyas guardado, inferioridad ni equivalencia si sus contratos ya funcionan. Revisa su integración con los hechos y administración añadidos.

- El snapshot conserva tiro/serie/cola/revisión pendientes, azar y cualquier resultado ya sorteado. Reanudar no revive órdenes de un uso ni repite créditos.
- Una retirada natural llega a la misma reorganización que los casos preparados; no se usan participantes fantasma.
- La presencia y minutos admiten inferioridad legal y rectificaciones identificadas; no fuerzan una ocupación de cinco inexistente.
- El resultado administrativo sigue separado de la producción disputada y de un fallo técnico.
- Las modalidades y velocidades comparten reglas, estados, costes deportivos y órdenes efectivas. Una lectura o espera de navegador no altera el encuentro.
- La fachada `src/engine/index.js`, o su equivalente real, sigue siendo utilizable sin navegador y con sesiones aisladas.

Actualiza compatibilidad de snapshots si cambió el estado requerido. No cargues un guardado de otro motor aplicando reglas nuevas en silencio. Una consulta histórica y una continuación ejecutable mantienen contratos distintos.

Prueba guardar/restaurar desde UI, además de la API. Incluye una situación pendiente y cambios de versión/perfil activo fuera del encuentro para confirmar su congelación.

<a id="m15-11"></a>

## 11. Salida esencial para el mundo

### 11.1 Tres ejes independientes

Modalidad de avance, detalle conservado y resolutor son ejes distintos. Visionado, cuartos y simulado total ya usan el núcleo común. Esta entrega añade conservación esencial; no crea una resolución deportiva alternativa.

Mantén completo y reducido actuales. Añade `world-essential`, o nombre equivalente documentado, como selección explícita en la fachada, CLI y lotes. No cambies silenciosamente el nivel de un lote ya creado ni sustituyas el diagnóstico completo del laboratorio.

### 11.2 Datos mínimos comprometidos

| Familia | Información a conservar |
|---|---|
| Identidad/resultado | Equipos/instancias, contexto, versiones, estado, parciales, duración y resultado de cancha/adjudicado separados. |
| Acta | Participantes/DNP, minutos, tiros, puntos y créditos individuales/colectivos de la política vigente. |
| Secuencia | Hechos deportivos compactos suficientes para anotación, cierre y revisión; orden estable y referencias. |
| Presencia | Entradas/salidas, grupos, puestos contextuales y vínculos necesarios para quintetos/on-off/mixtas. |
| Posesión y F | Origen, continuidad, acciones efectivas, participantes, finalizaciones/series y cierres. |
| Tiro | Autor, sector funcional, valor, preparación/oposición en categorías, resultado/validez y causa. |
| Táctica observada | Organización/cobertura efectivas y familias ejecutadas que sustentan los análisis ofrecidos. |
| Dirección/estados | Cambios efectivos de plan y estados propios autorizados por tramo; relaciones causales pertinentes. |
| Integridad/cobertura | Políticas, revisión, capacidades de lectura y hashes disponibles con alcance declarado. |

No es obligatorio tener un JSON enorme por acontecimiento. Se pueden usar filas compactas, referencias, diccionarios compartidos y agregados que preserven exactamente las consultas comprometidas.

Conservar solo marginales por jugador y por defensa no permite reconstruir el cruce jugador×defensa. Si una vista necesita esa relación, consérvala o calcula su agregado conjunto fiel. No sigas ofreciendo un filtro cuyo dato se ha perdido.

### 11.3 Qué se evita construir

En ese nivel no generes prosa, árbol diagnóstico completo de candidatos, copias de perfiles por decisión ni tablas de auditoría extensas durante cada encuentro. No basta con generar todo y descartarlo al final.

Reutiliza las operaciones deportivas reales. Si una lista de candidatos es necesaria para elegir, se calcula; lo que se omite es su representación diagnóstica ampliada cuando no se conserva. El generador deportivo no se usa para elegir frases, muestras de logs o tareas de escritura.

Los agregados operativos pueden actualizarse sobre el flujo de hechos con identidad estable. Conserva lo necesario para revisarlos/invalidarlos si un hecho cambia. Una corrección posterior no deja dos pantallas con totales distintos.

### 11.4 Cobertura y neutralidad

Publica matriz consulta → dato → nivel de registro. Pesos detallados o contrafactuales pueden no estar disponibles en `world-essential`; las consultas deportivas comprometidas sí deben seguir sustentadas.

Compara trayectoria, acta, estados y sorteos en la misma versión deportiva entre completo/reducido/esencial. La huella de trayectoria puede obtenerse mediante un observador incremental de verificación, sin conservar todos los objetos. Mide su coste y no afirmes que se calculó si se desactivó.

Una huella de archivo y una de trayectoria no son intercambiables. No elimines campos deportivos de la proyección canónica para conseguir igualdad.

<a id="m15-12"></a>

## 12. Trabajadores persistentes y controlador

### 12.1 Un grupo local acotado

Implementa trabajadores locales persistentes de Node, reutilizando el proceso/controlador actual. No un worker nuevo por partido, no `Promise.all` como supuesto paralelismo de CPU, no servicios externos ni memoria deportiva compartida mutable.

Referencia técnica: <https://nodejs.org/download/release/v22.22.0/docs/api/worker_threads.html>. La documentación recomienda grupos reutilizables para estas tareas. Verifica APIs con la versión real del proyecto; no impongas una actualización mayor de Node.

Ofrece modo secuencial y concurrencia explícita. El valor automático inicial será `max(1, min(4, núcleos_disponibles - 1))`, con detección compatible y fallback declarado. Las opciones manuales pueden usar 1, 2 o 4 donde el entorno lo admita. Es configuración operativa, no una fila de probabilidad deportiva.

### 12.2 Unidad de trabajo y aislamiento

Cada trabajo identifica lote/caso/variante/intento, entradas congeladas, semilla efectiva, motor/perfiles, nivel de registro y destino autorizado. Un worker resuelve un encuentro por vez con su propia sesión y azar.

Las semillas y IDs se fijan antes de enviar. No dependen de worker, orden de finalización, reloj de pared ni número de hilos. Dos sesiones no comparten memoria rival, estados, planes mutables o resultados.

Carga/compila contenido inmutable una vez por worker cuando sea correcto y usa referencias por huella/versiones. Invalida por contenido, no solo por etiqueta. No conserves entre encuentros una memoria deportiva que deba empezar vacía.

### 12.3 Persistencia y mensajes

Mantén el índice de MOTOR-12 como fuente de verdad. Un único coordinador confirma estados/intentos y publica resultados; evita varios escritores simultáneos sobre el índice.

Los workers pueden escribir material por intento en destinos separados y comunicar resumen/referencias, evitando transportar diagnósticos enormes entre hilos. La confirmación de finalización es atómica: no publica un marcador terminado antes de tener su resultado íntegro.

El orden de terminación no cambia agregados ni comparación. Ordena vistas por sus IDs/agenda; no conviertas el primer worker en local ni mezcles variantes.

### 12.4 Detener, continuar, reintentar y fallo

Con concurrencia, detener significa no despachar trabajos nuevos y terminar los ya en curso. Muestra cuántos quedan activos; precisa este cambio respecto al singular «partido en curso» anterior.

Un worker caído deja su intento fallido/interrumpido según el contrato, sin marcador y sin derrota. El resto del lote conserva sus resultados. Un reintento usa la misma entrada/semilla con nuevo intento y no cuenta dos veces el caso.

El reinicio del lote puede seguir repitiendo desde inicio el encuentro interrumpido, conforme a MOTOR-12. No lo confundas con continuar el snapshot individual. No se exige autosnapshot de cada trabajador ni reanudación de cualquier instrucción de JavaScript.

Evita reintentos automáticos infinitos. Conserva causa, estado, temporales y recuperación identificada. Prueba al menos una interrupción controlada con trabajo real, sin presentarla como defecto natural del motor.

<a id="m15-13"></a>

## 13. Medición, objetivos y optimización

### 13.1 Objetivos aprobados para evaluar

- Cien partidos del mundo: objetivo de cinco segundos.
- Doscientos: objetivo de diez segundos.

Son presupuestos de producto aceptados para orientar la decisión, no capacidad demostrada ni una razón para alterar el deporte. Registra equipo/entorno y si se cumple el objetivo en la configuración medida. Si no se alcanza, cuantifica la distancia y el cuello restante.

El lote final de cien se mide realmente. El de doscientos puede proyectarse en esta entrega, marcado como estimación; no se declara su objetivo verificado sin ejecución. La campaña mayor será MOTOR-16.

### 13.2 Medidas separadas

Conserva tiempo total de lote, preparación/validación, cálculo deportivo, captura/serialización, agregación, escritura y finalización. Relato/diagnóstico quedan identificados cuando estén activos.

En paralelo distingue tiempo de pared, tiempo por trabajo y tiempos inclusivos: no sumes segundos de cuatro workers como si fueran la espera del usuario. Si una etapa incluye otra, declara su solapamiento.

Mide tamaño sin comprimir/comprimido cuando proceda, volumen por familia y memoria/pico con el alcance real de medición. El pico del coordinador no es el pico de todo el grupo; evita sumar valores superpuestos como si fueran distintos procesos.

Separa arranque frío y reutilización. No uses duraciones de visionado ni esperas de UI como tiempo de simulación. Publica observaciones individuales y mediana/rango en muestras pequeñas, sin un p95 pretendidamente fiable sobre tres datos.

### 13.3 Baseline y perfil de CPU

Confirma las medidas disponibles de MOTOR-14 en su versión, o indica que solo son declaradas. Después de completar las correcciones deportivas, congela una base MOTOR-15 y mide antes/después de optimizar esa misma semántica.

Usa perfil de CPU/instrumentación sobre pocos casos representativos. Referencia: <https://nodejs.org/download/release/v22.22.0/docs/api/cli.html#--cpu-prof>. No ejecutes el profiler en todos los partidos ni lo incluyas en las medidas finales comparativas.

Prioriza material diagnóstico evitado, acceso repetido a contenido congelado, serialización/copias, agregados duplicados y retención de historial. Optimiza operaciones deportivas solo con causa medida, preservando orden, precisión pertinente, candidatos, desempates y azar.

No infieras que el 82 % de bytes de decisiones de MOTOR-12 era el 82 % de CPU actual. Tampoco prometas que multiplicar trabajadores divide el tiempo por ese mismo factor.

### 13.4 Límite de investigación

Aplica mejoras locales justificadas y prueba el grupo acotado. No abras una reescritura en otro lenguaje, GPU, simulación estadística de actas o reducción del repertorio para alcanzar el objetivo.

Si el presupuesto sigue fuera de alcance, entrega el resultado exacto más eficiente conseguido y una conclusión concreta para MOTOR-16/17: coste residual, evidencia y opciones. La construcción de una resolución agregada distinta requiere su decisión y dimensionamiento posteriores.

<a id="m15-14"></a>

## 14. Versiones, perfiles y compatibilidad

Actualiza la fuente común de aplicación a MOTOR-15 en consola/cabecera. Motor deportivo, perfil, dataset, política estadística, snapshot, auditoría y paquete se identifican separadamente.

Una identidad de motor que seguía llamándose MOTOR09 no puede ocultar un cambio semántico nuevo: revisa el contrato real de versión/fingerprint y actualízalo donde corresponda. No basta cambiar una etiqueta visual.

Prepara extensión `SEM-MOTOR15-20261017` según la convención vigente. Distingue datos normativos, semillas §8, configuración de auditoría y opciones operativas. La activación de base/candidata es explícita, con diferencias y conservación del perfil protegido anterior.

Registra primero la referencia MOTOR-14 si está disponible: 83–103/6.505. Los cambios de §7/8 o correcciones legítimas pueden cambiarla; crea la referencia MOTOR-15 con causa y primer punto de divergencia. Las optimizaciones posteriores y los trabajadores sí deben conservar esa nueva trayectoria.

No cambies baselines en bloque para poner la suite en verde. Separa cambios de lectura, crédito, reloj/administración, semilla y rendimiento. Conserva sus versiones y relación con el resultado.

Versiona un formato solo si el contrato lo necesita. Comprueba lectura histórica, reejecución compatible y continuación por separado. Rechazos explicados, sin alterar archivos. No aumentes ni conserves `export/8` por rutina si su compatibilidad real dice otra cosa.

No reescribas hechos anteriores con los nuevos campos de asistencia/estados. La cobertura desconocida permanece desconocida.

<a id="m15-15"></a>

## 15. Plan de verificación compartido

### 15.1 Casos de integración

Congela un plan pequeño antes de mirar resultados y reutiliza cada ejecución para acta, análisis, auditoría, exportación y continuidad:

| Caso | Datos | Objetivo |
|---|---|---|
| C15-01 | EQ01–EQ02, semilla `20261016`. | Referencia anterior/nueva, versiones y neutralidad. |
| C15-02 | EQ03–EQ09, semilla `151002`. | Contexto interior/defensa y tiro/interferencia. |
| C15-03 | EQ07–EQ08, semilla `151003`. | Capacidades, estados por tramo y veterano/joven. |
| C15-04 | EQ11–EQ12, semilla `151004`. | Rotación, reproducción y caso común del controlador. |
| C15-05 | Copia extrema aprobada de fatiga, semilla `151005`. | Exposición a energía inferior a diez sin modificar la curva. |
| C15-06 | Escenario de órdenes/finales, semilla `151006`. | Solicitudes pendientes, guardar y continuar. |

Para C15-05 reutiliza la definición de C14-05: titulares EQ11 con energía 8, suplentes 30, tres primeras posesiones con rotación manual y posterior delegación normal, sin impedir retiradas reglamentarias. Conserva sus diferencias exactas.

Completa C14-03…06 no ejecutados con estos casos o una correspondencia explícita, sin duplicarlos solo por cambiar ID. Los escenarios raros de administración se verifican con estados preparados del núcleo, sin un partido completo por artículo.

### 15.2 Matriz pequeña de ejecución

Sobre cuatro entradas congeladas representativas, contrasta secuencial y grupo con 1/2/4 trabajadores cuando el entorno lo admita; compara completo/reducido/esencial mediante el subconjunto mínimo que cubra cada eje.

No ejecutes el producto cartesiano de modos, velocidades, registros, trabajadores, equipos y semillas. Reutiliza AUD29 y `equivalence`; cualquier combinación no ejecutada queda identificada.

Mantén semilla/órdenes efectivas y compara trayectoria, sorteos, estados y acta. Las medidas de coste se etiquetan por frío/caliente, niveles y concurrencia.

### 15.3 Benchmark final de cien

Una vez elegida la configuración de coste, ejecuta una agenda de cien partidos reales en `world-essential`. Selecciona los emparejamientos del catálogo existente, congela la lista completa y deriva semillas con el mecanismo estable del proyecto bajo el espacio de nombres `PERF-M15-20261017`.

Incluye variedad de planes/equipos y conserva todos los resultados, válidos/errores/intentos. No es una población ACB ni una muestra para ajustar anotación. No utilices las semillas reservadas para MOTOR-17.

Esa agenda permite medir coste extremo a extremo, memoria, almacenamiento y controlador. Comprueba acta y conciliación de todos los partidos con las operaciones comunes; analiza distribución solo como descripción de esa agenda, sin conclusiones de calibración.

No repitas cien por cada concurrencia. La selección de configuración se hace con la muestra pequeña. Si un defecto invalida el benchmark, corrige y repite solo lo necesario, conservando versión, causa y número real de ejecuciones.

### 15.4 Pruebas y presupuesto

Ejecuta la suite existente, datos y documentación. Añade pocos grupos útiles: compatibilidad, administración/pendientes, causalidad/lectura, conservación esencial, aislamiento/controlador, descarga/integridad. Reutiliza funciones y regresiones previas.

El objetivo de campaña de esta entrega es alrededor de 130–160 ejecuciones nuevas, incluyendo el benchmark; no hay que consumir ese rango si bastan menos. La suite existente y colas/prefijos se cuentan aparte con su alcance. Una repetición por un defecto se explica; no aumenta la muestra independiente.

No repitas campañas MOTOR-12/13 ni otras 120 semillas de inferioridad por inercia. Dennis ha autorizado los recursos necesarios, pero no una expansión de pruebas sin causa.

<a id="m15-16"></a>

## 16. Navegador y recorrido manual

Realiza un recorrido real en un navegador disponible; API y sintaxis no sustituyen esta parte. Identifica navegador/versión, ruta, acción, resultado observado, errores de consola/red y lo no ejecutado.

Como mínimo recorre:

1. Arranque/versiones y entrada al panel con perfil anterior.
2. Recuperación explícita creando candidata/activando base, sin perder el original.
3. Preparación de un partido y dirección con solicitud pendiente/aplicada.
4. Guardar, reiniciar el proceso o recargar según corresponda y continuar desde la UI.
5. Un pendiente administrativo o de serie/tiro representado en un caso preparado, sin duplicados al continuar.
6. Análisis con estados por tramo y las dos recomendaciones, o insuficiencia justificada según sus condiciones.
7. Lote pequeño con nivel esencial, concurrencia, detener/continuar y resultados/errores bien diferenciados.
8. Auditorías, cobertura de las 32 capacidades y cierre.
9. Descarga real del paquete rápido y la evidencia, seguida del comprobador.
10. Cambio de audiencia y comprobación de que el export deportivo no filtra diagnóstico privado.

El benchmark de cien puede ejecutarse por CLI; no exige ver cien partidos en navegador. El lote pequeño puede compartir entradas y evidencia con §15.

Crea `docs/prompts/MOTOR-15-recorrido-manual.md`: arranque, URL real, perfiles/semillas, pasos, observación esperada y señales de fallo. Incluye cómo localizar recuperación del panel, guardados, nivel esencial, concurrencia y descargas.

No marques como aceptados por Dennis recorridos anteriores ni atribuyas automáticamente un 404 al favicon. Los fallos que observes se localizan y corrigen; después repite la parte afectada.

<a id="m15-17"></a>

## 17. Auditorías y preparación de MOTOR-16

Actualiza AUD01–AUD32 con la evidencia real de esta entrega. Conserva estados de implementación, registro, exposición, conclusión y revisión humana separados. Reutiliza las correcciones de AUD07/AUD13/AUD26 y de quintetos.

Entrega la matriz de las 32 capacidades con sus consumidores, captura y exposición. Las siete instrumentadas no se declaran contrastadas si el caso correspondiente no se evaluó. No añadas un segundo efecto para que aparezcan.

Completa AUD29 para las nuevas opciones de conservación/concurrencia donde su contrato lo permita y AUD32 con coste/conservación. La energía inferior a diez y los ESP no observados conservan su estado real. No ajustes probabilidades para poner todas las auditorías conformes.

Prepara para MOTOR-16:

- Entrada/CLI reproducible para ejecutar agenda congelada y exportar métricas compactas.
- Diccionario de unidades, numeradores, denominadores y cobertura por nivel.
- Acceso a resultados por partido/equipo, acciones, estados y oportunidades pertinentes.
- Distinción entre población representativa, contrastes y escenarios extremos.
- Catálogo de referencias con fuente/competición/temporada/fase/definición, sin inventar valores ausentes.
- Espacios de semillas separados para benchmark, diagnóstico futuro y reserva de validación.

No ejecutes la campaña masiva de MOTOR-16 ni consumas su reserva ahora. No es necesario construir un gestor nuevo si lotes/auditorías ya cubren el trabajo.

La sospecha de anotación elevada y falta de partidos bajos queda registrada como hipótesis. No se resuelve con un descuento global de acierto ni un estado adicional de «mal día» en MOTOR-15.

<a id="m15-18"></a>

## 18. Devolución: paquete de lectura rápida

### 18.1 Entrega real, no solo un mensaje

Genera una descarga `MOTOR-15-revision-rapida.zip`, o equivalente inequívoco, y deja un comando exacto reproducible para construirla. Reutiliza formatos/comprobadores existentes si son compatibles; no cambies arbitrariamente el contenedor deportivo.

Objetivo orientativo: menos de 10 MiB comprimidos. Si el contenido supera el objetivo, separa detalle en el paquete completo y conserva índice/referencias; no recortes silenciosamente hallazgos ni datos necesarios.

Debe ser posible que Dennis nos pase primero este ZIP y que ChatGPT empiece por índice y resultados sin abrir cientos de megabytes de trazas.

### 18.2 Archivos obligatorios

| Archivo sugerido | Contenido que debe devolver |
|---|---|
| `00-LEEME.md` | Índice, orden recomendado de lectura, versiones/commit, comandos de comprobación y ubicación de la evidencia detallada. |
| `01-RESUMEN.md` | Estado de cada bloque, hallazgos principales, referencia antes/después, coste y pendientes. Preferiblemente menos de 2.500 palabras, sin ocultar bloqueos. |
| `02-CAMBIOS.csv` | Cambio, clase —deporte/crédito/lectura/registro/rendimiento/UI—, causa, archivos y efecto/versiones. |
| `03-COBERTURA.csv` | Requisito, fuente, consumidor, registro, exposición, comprobación, estado y evidencia. |
| `04-HALLAZGOS.csv` | ID, severidad, origen, esperado/observado, muestra/unidad, casos/hechos, corrección o acción pendiente. |
| `05-PARTIDOS.csv` | Una fila por ejecución/intento, identidad de caso, equipos, semilla, versiones, nivel, concurrencia, estado, marcador si procede, tiempo y referencias. |
| `06-EQUIPOS-PARTIDO.csv` | Una fila por equipo/encuentro: acta y magnitudes básicas con contadores/universos, tiempo reglamentario/prórroga separados donde sea posible. |
| `07-RENDIMIENTO.csv` | Mediciones individuales, fase/solapamiento, unidad, frío/caliente, configuración, entorno, bytes y memoria con su alcance. |
| `08-EQUIVALENCIA.csv` | Pares comparados, condiciones, huellas/sorteos, campos contrastados, resultado y primera diferencia si existe. |
| `09-AUDITORIAS.csv` | AUD01–32: versión, ejecución, alcance, n/evidencia y estado real, sin convertir inconcluso en conforme. |
| `10-CAPACIDADES.csv` | Las 32: consumidor, exposición, captura, tipo de salida, contraste +1/+3/+5 disponible/ejecutado y evidencia. |
| `11-NORMATIVA.csv` | Caso/fila, edición/artículo, origen de lectura, administración/productor/exposición, verificación y limitación concreta. |
| `12-COMPATIBILIDAD.csv` | Perfil/formato/versión, lectura/reproducción/continuación/edición permitidas, adaptación/rechazo y evidencia. |
| `13-NAVEGADOR.md` | Pasos realmente recorridos, perfil/datos, resultados, consola/red, recuperaciones y no ejecutado. |
| `14-PENDIENTES-MOTOR16.md` | Preguntas que los datos deben resolver, datos disponibles/faltantes, coste observado y límites de la futura campaña. |
| `manifest.json` | Identidad, esquemas, archivos con tamaño/hash, cobertura, versiones y vínculos con la evidencia detallada. |

Adapta nombres si el proyecto ya tiene equivalentes, pero conserva el índice que permite encontrar cada responsabilidad. No dupliques una tabla bajo dos nombres ni generes datos de ejemplo como si fueran resultados reales.

### 18.3 Diccionario y convenciones

Incluye un diccionario pequeño de las columnas: significado, tipo, unidad, universo, precisión y nulos. CSV UTF-8, encabezados estables y convención numérica inequívoca; no mezcles coma decimal con separador sin declararlo.

Un dato no registrado/no aplicable no es cero. Si una ejecución falla, no tiene marcador deportivo final ni cuenta como derrota. Los resultados adjudicados y la producción efectiva ocupan campos distintos.

Conserva por separado `case_id`, `variant_id`, `attempt_id`, `match_id` y las identidades/huellas que el proyecto utilice. La tabla de ejecuciones no confunde reintentos con partidos independientes.

Cada hallazgo debe permitir saltar a un caso y hecho concreto o a una consulta reproducible. Una frase «todo OK» no constituye evidencia.

<a id="m15-19"></a>

## 19. Devolución: evidencia detallada

Genera un paquete completo o índice más partes, reutilizando la extracción de lotes/auditorías. Se conserva fuera de Git y se puede descargar desde el cierre o la ubicación actual de exportación. Enlázalo desde `00-LEEME.md`.

Incluye:

- Planes congelados de integración y benchmark, versiones, entorno y agenda de trabajos/intentos.
- Perfiles/entradas usados y diferencias de la extensión MOTOR-15, incluidas semillas nuevas y configuración operativa por separado.
- Resultado deportivo completo suficiente de los cien encuentros, con cobertura esencial declarada. No hacen falta cien diagnósticos ampliados.
- Export actual de al menos un encuentro integrado y material para reproducirlo con el motor compatible.
- Dos guardados reales de verificación, uno con pendiente, con entradas/prefijo necesarios y resultados de continuación enlazados.
- Hechos compactos y análisis de los casos de integración; trazas ampliadas seleccionadas para explicar correcciones, fases nuevas y consumidores pertinentes.
- Casos normativos preparados, con entrada/salida reales del administrador común y referencia del supuesto. Identificados como preparados, no ocurrencias naturales.
- Evidencia de interrupción controlada/reintento con worker real, conservando la diferencia entre fallo inducido y defecto del motor.
- Reportes de suite, datos, documentación, equivalencia y comprobadores pertinentes, con comando y código de salida.
- Medidas basales/posteriores y perfil de CPU cuando se haya utilizado, identificando su formato/tamaño.
- Si hubo fallos: entradas reproducibles, semilla, traza y último contexto necesario; si no hubo, indicación explícita de ausencia, no archivos ficticios.

Las trazas completas se eligen con criterio: casos definidos por el plan y errores realmente detectados. No conserves solamente partidos cuyo resultado nos guste. La selección de ejemplos no se presenta como muestra estadística independiente.

No incluyas `node_modules`, compilaciones enteras, copias de otros repositorios, secretos de entorno ni volcados del equipo. No hace falta copiar los manuales FIBA completos ni acumular capturas de navegador. El informe textual de interacción y sus referencias basta para esta devolución.

Los paquetes diagnósticos son material del laboratorio, no información pública del rival ni entrada omnisciente del entrenador automático.

<a id="m15-20"></a>

## 20. Integridad y comprobador de la devolución

Usa los validadores actuales cuando reconozcan el formato y extiéndelos localmente para los nuevos apartados si es necesario. Si el paquete rápido necesita comprobador propio, que sea pequeño y reutilizable, con comando exacto en `00-LEEME.md`.

La comprobación debe realizarse sobre los archivos realmente descargados, sin re-simular encuentros, y verificar:

- Manifiesto, presencia de archivos requeridos, tamaños y hashes.
- Esquemas/columnas/versiones y referencias entre casos, partidos, perfiles y evidencia.
- Conteos: agenda, intentos, terminados, válidos, fallidos/interrumpidos y variantes, sin duplicados de producción.
- Marcadores/acta y particiones con el alcance de las conciliaciones existentes.
- Coherencia de los pares de equivalencia y campos realmente comparados.
- Correspondencia del coste con su entorno/configuración, sin estimaciones etiquetadas como mediciones.
- Nulos y cobertura; no completar información ausente al validar.
- Paquete alterado o incompleto rechazado con motivo y sin modificar originales.

No afirmes que `batch:check` o `audit:check` validó todo el ZIP si solo reconoce una parte. El resultado identifica qué comprobador cubre cada componente.

Si separas en partes, el índice enumera todas, hashes, relaciones y cobertura. Descarga/comprueba el índice y las partes necesarias; no declares validada una parte que nunca se abrió.

### 20.1 Puerta de calidad para la devolución

Antes del mensaje final, confirma que:

1. Los paquetes existen, se pueden descargar y se han comprobado.
2. El resumen coincide con los CSV y las ejecuciones reales.
3. No hay informes que digan MOTOR-14 donde deban identificar MOTOR-15, ni perfiles/versiones confundidos.
4. Los pendientes están localizados y no escondidos detrás de una etiqueta «sin calibrar».
5. La guía explica qué archivo debe enviarnos Dennis primero.

<a id="m15-21"></a>

## 21. Documentación y cierre consultable

Archiva este prompt íntegro en `docs/prompts/MOTOR-15-cierre-funcional-y-rendimiento-del-mundo.md`, o equivalente establecido, y actualiza catálogo/índice. Los prompts para Claude Code se entregan y conservan en MD.

Crea `docs/tecnico/motor15.md` con base real, causa del panel, mapa de cambios/consumidores, correspondencias normativas, semántica temporal, semillas, asistencia/estados, conservación, trabajadores, coste, compatibilidad y verificaciones.

Mantén íntegro el funcional de consulta y actualiza páginas temáticas/decisiones con las precisiones de este encargo. No generes otra megaespecificación duplicada ni cambies el diseño para hacerlo coincidir con una omisión.

Completa una vista pequeña de «Cierre» dentro de la navegación existente: estado funcional, cobertura, auditorías, perfiles/versiones, coste y enlaces a informes/descargas. No requiere un panel nuevo de gestión de proyectos ni un porcentaje universal de realismo.

Actualiza estado y changelog distinguiendo completado técnicamente, pendiente manual, evaluación estadística pendiente y objetivo de coste alcanzado/no alcanzado/no medido.

Versiona planes, métricas resumidas, manifiestos, informes y evidencia pequeña necesaria. Mantén fuera de Git resultados masivos, temporales, grandes perfiles de CPU y paquetes; conserva sus comandos de producción y localización efectiva.

No diseñes ya el funcional completo del manager. Documenta que la fachada recibe y devuelve datos deportivos y que la evolución entre partidos, salud, calendario y carrera pertenecen al siguiente proyecto funcional.

<a id="m15-22"></a>

## 22. Aceptación y límites de la entrega

- [ ] Base MOTOR-14 real, rama y dependencias identificadas; cambios ajenos preservados.
- [ ] Panel con causa localizada, perfiles anteriores accesibles/recuperables y originales conservados.
- [ ] Categorías y administración pendientes implementadas en el flujo común, con cobertura/supuesto precisos.
- [ ] Correcciones y sanciones no se resuelven mediante nuevos sorteos de consecuencia ni un rewind genérico.
- [ ] Lanzamiento pendiente y generación contextual de interferencia con semillas administradas e identificadas como SEM.
- [ ] Asistencias con datos causales suficientes para la política, estado propio por tramo y REC10 diferenciadas.
- [ ] Guardado, inferioridad, equivalencia y fachada de MOTOR-14 conservados e integrados con los hechos nuevos.
- [ ] `world-essential` conserva el deporte y las consultas comprometidas, evitando material diagnóstico innecesario.
- [ ] Grupo local persistente con semillas/sesiones aisladas, controlador y recuperación comprobados.
- [ ] Benchmark real de cien, coste extremo a extremo y resultado honesto frente a los objetivos.
- [ ] Nuevas referencias deportivas separadas de optimizaciones neutrales y de simples cambios de lectura.
- [ ] Suite/comprobadores pertinentes y recorrido real de navegador ejecutados, con lo no ejecutado explícito.
- [ ] AUD01–32 y matriz de capacidades actualizadas sin aparentar exposición o validación externa inexistentes.
- [ ] Paquete rápido y evidencia detallada reales, descargados/comprobados y con índice para ChatGPT.
- [ ] Documentación, versiones, prompt, catálogo, estado y changelog coherentes.
- [ ] MOTOR-16 preparado sin haber ejecutado ni ajustado su campaña masiva ni consumido la reserva MOTOR-17.

### 22.1 Estados que deben permanecer separados

| Eje | Resultado que declarar |
|---|---|
| Funcional | Completo en el alcance o con bloqueos concretos restantes. |
| Rendimiento | Medido, objetivo alcanzado/no alcanzado, entorno y cuello residual. |
| Evaluación deportiva | Evidencia de integración; calibración poblacional aún pendiente de MOTOR-16/17. |
| Aceptación | Revisión de Claude ejecutada y pruebas de Dennis pendientes donde lo estén. |

Un objetivo de coste no alcanzado no autoriza fabricar un resolutor nuevo ni maquillar mediciones. Una función requerida ausente tampoco se convierte en «cuestión de calibración».

Si aparece un límite real, entrega lo construido con estado por bloque, punto de continuación y material exacto que falta. Continúa el trabajo independiente y no bloquees todo por una excepción concreta. El presupuesto disponible permite persistir en el cierre necesario, no afirmar lo que no pudo comprobarse.

<a id="m15-23"></a>

## 23. Informe final para Dennis y ChatGPT

Abre una PR sin fusionar ni suscribirte. El mensaje final debe permitir que Dennis sepa qué probar y qué pasarnos, sin tener que reconstruir la entrega a partir de commits.

Devuelve en este orden:

1. **Estado real:** bloques terminados, bloqueos funcionales si quedan y objetivo de coste alcanzado o no.
2. **Qué puede probar Dennis:** arranque, URL real, perfil/semilla, recuperación del panel, guardados, nivel esencial, concurrencia y recorrido manual.
3. **Error del panel:** causa demostrada, archivo/función, perfil reproducido y conservación verificada.
4. **Pendientes cerrados:** norma/tiro/interferencia/asistencia/estados/REC10/cierre, con sus límites de generación y exposición.
5. **Deporte y referencia:** MOTOR-14 frente a MOTOR-15, causa de cambios y neutralidad de registros/trabajadores/optimizaciones.
6. **Coste:** datos individuales/resumen, benchmark de cien, memoria/bytes, entorno y estimación de doscientos separada de ejecución real.
7. **Verificación:** suite, comprobadores, navegador, casos preparados, interrupción inducida, no ejecutado y número real de partidos/reintentos/prefijos.
8. **Archivos para ChatGPT:** nombre/ruta descargable y tamaño del ZIP rápido; nombre/ruta del índice y partes de evidencia; comando y resultado del comprobador.
9. **Preparación MOTOR-16:** preguntas pendientes, datos disponibles, campos no conservados y capacidad medida para dimensionar la campaña.
10. **Git:** base/commit, rama efectiva, PR y ubicación de documentación/evidencia.

No sustituyas los archivos por un resumen en el chat ni prometas un ZIP que no generaste. Si el entorno no permite adjuntar archivos, deja la descarga desde la UI y la ruta/comando de obtención verificados. Dennis debe poder pasarnos primero el paquete rápido y después solo el detalle que necesitemos.

No afirmes aceptación de Dennis ni conformidad normativa exhaustiva por tener un acta conciliada. No declares calibrado el motor porque se conserva una semilla o el benchmark termina sin errores. Esta entrega debe dejar una base utilizable, comprobable y preparada para que la campaña MOTOR-16 mida las preguntas reales.
