# MOTOR-12 — Simulación masiva y extracción completa

> Prompt para Claude Code en **beM**. Entrega del roadmap: ejecutar lotes sobre el mismo núcleo y descargar una extracción autocontenida que permita analizar todos sus partidos, entradas, decisiones y resultados.
>
> El paquete debe servir para que Dennis pueda pasárselo a ChatGPT y estudiar el motor sin volver al repositorio ni reconstruir manualmente las configuraciones. No se calibra el juego en esta entrega.

## Índice

1. [Mandato y normas](#1-mandato-y-normas)
2. [Base real y conclusiones de MOTOR-11](#2-base-real-y-conclusiones-de-motor-11)
3. [Flujo y alcance de producto](#3-flujo-y-alcance-de-producto)
4. [Programación de enfrentamientos](#4-programación-de-enfrentamientos)
5. [Variantes, semillas y entradas congeladas](#5-variantes-semillas-y-entradas-congeladas)
6. [Ejecución progresiva y conservación](#6-ejecución-progresiva-y-conservación)
7. [Estados, interrupciones y fallos](#7-estados-interrupciones-y-fallos)
8. [Agregados y distribuciones](#8-agregados-y-distribuciones)
9. [Comparación base y candidata](#9-comparación-base-y-candidata)
10. [Registro diagnóstico completo](#10-registro-diagnóstico-completo)
11. [Identificadores y relaciones](#11-identificadores-y-relaciones)
12. [Contenido del paquete](#12-contenido-del-paquete)
13. [Manifest, versiones e integridad](#13-manifest-versiones-e-integridad)
14. [CSV, JSON y JSONL](#14-csv-json-y-jsonl)
15. [Paquetes grandes y partición](#15-paquetes-grandes-y-partición)
16. [Validación y cobertura](#16-validación-y-cobertura)
17. [Resumen y entrega útil para ChatGPT](#17-resumen-y-entrega-útil-para-chatgpt)
18. [Interfaz y permisos](#18-interfaz-y-permisos)
19. [Huellas y compatibilidad](#19-huellas-y-compatibilidad)
20. [Panel y parámetros de ejecución](#20-panel-y-parámetros-de-ejecución)
21. [Pruebas automáticas acotadas](#21-pruebas-automáticas-acotadas)
22. [Recorrido manual y documentación](#22-recorrido-manual-y-documentación)
23. [Límites y respuesta de entrega](#23-límites-y-respuesta-de-entrega)
24. [Criterios de aceptación](#24-criterios-de-aceptación)

## 1. Mandato y normas

Implementa lotes, comparación, registros progresivos y descarga completa de análisis. Reutiliza el motor deportivo, las consultas de MOTOR-10, los equipos/variantes/escenarios de MOTOR-11 y el panel existente.

Reglas obligatorias:

- Trabaja exclusivamente en beM. No consultes `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios.
- Mismo núcleo, mismas reglas y operaciones. No crees un simulador rápido que sortee marcadores o reparta estadísticas para ahorrar tiempo.
- No introduzcas ticks, movimientos continuos, más atributos, un overall o otra memoria deportiva.
- Relato, diagnóstico, consulta, almacenamiento y exportación no consumen azar deportivo ni modifican decisiones o estados.
- Se conserva el lote completo, sin muestreo, truncamiento o exclusiones silenciosas. Un extracto se identifica como extracto.
- Cada partido empieza con sus entradas congeladas, sin arrastrar energía, Forma, momentos, faltas o memoria del anterior.
- Fallos e incompletos se conservan con su contexto y quedan fuera de las estadísticas que exigen un partido válido terminado.
- Todo agregado identifica población, muestra, exclusiones, numerador, denominador, unidad y versión.
- No cambies coeficientes de juego para corregir una anomalía observada en esta entrega. Regístrala para MOTOR-13, salvo un defecto concreto que haga inválida la propia ejecución o extracción.
- Pruebas automáticas justas y pertinentes. No ejecutes 100 o 1.000 partidos como obligación de desarrollo; esos tamaños son controles de producto para Dennis.
- Conserva cambios locales, perfiles e históricos. No hagas resets destructivos, no reescribas historial ni fusiones la PR.
- No cambies stack o base de datos ni añadas Docker, una cola distribuida, un servicio de IA o infraestructura externa.

Tamaño orientativo: aproximadamente la mitad de una ventana de cinco horas de Claude Code, sin prometer ni inventar consumo. No añadas trabajo para gastar cuota. Si hay un límite real, registra lo completado y la continuación exacta; no declares terminado un paquete que no contiene los registros comprometidos.

## 2. Base real y conclusiones de MOTOR-11

### 2.1 Comprobar la base

El informe recibido sitúa MOTOR-11 en la PR `bateman37/beM#12`, abierta y sin fusionar. No presupongas su integración en `main`.

- Si ya está fusionado, crea la rama desde `main` actualizado.
- Si sigue en su rama y está disponible, parte de su commit real y documenta una PR dependiente que muestre solo MOTOR-12. No lo fusiones por tu cuenta.
- Si no hay una base accesible que contenga MOTOR-11, informa de esa dependencia; no lo reimplementes desde el informe.

Rama propuesta: `feature/MOTOR-12-lotes-y-extraccion`, o la que imponga el entorno. Conserva base/commit y rama efectivos.

### 2.2 Punto de partida declarado

Verifica antes de editar:

- 149 pruebas, ocho nuevas de MOTOR-11.
- `data:check` y comprobación documental correctos.
- Referencia `20261016`: 83–103 y 6.505 sorteos deportivos.
- Doce equipos, planes naturales versionados, generador correlacionado, variantes y LAB11-00–12/C00–C06.
- `export/8` sigue siendo el contrato deportivo declarado; comprueba su estado real.
- Edición masiva y undo, export/import de escenarios y análisis por partido disponibles.
- Versión MOTOR-11 común en consola/cabecera, con perfil/dataset/formato separados.

No declares que has ejecutado esos controles por haber leído el informe.

### 2.3 Lectura dirigida

Lee normas raíz, índices, roadmap y estado. Después consulta:

- Funcional de laboratorio, lotes y extracción completa; capítulo 24, especialmente §24.5–24.7 del unificado.
- Contratos IN01–IN03 y registros R01–R08; versiones, visibilidad, posesiones/F, acta y consultas.
- Inventario LAB, REF, EST y soportes SUP.
- `docs/tecnico/motor11.md`, datos/planes generados, recorridos y mecanismo de persistencia.
- Código actual del motor, RNG, productores de hechos/diagnóstico, export de partido y servidor local.

Los adjuntos históricos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen el diseño actual de beM. Este encargo parte del funcional disponible y del informe, no afirma una auditoría del código de la PR.

### 2.4 Interpretaciones y saneamiento acotado

Las lecturas 4–1 = DIS02 y 3–2 ofensivo = DIS03 se confirman si esos IDs corresponden a las disposiciones funcionales del catálogo. El nombre «3–2 ofensivo» significa tres referencias exteriores y dos interiores, no la zona defensiva.

EQ07 buscando media distancia con jugadores adecuados y EQ10 prefiriendo mostrar/recuperar ya eran semillas del encargo MOTOR-11. Confirma que COB03 representa esa cobertura y conserva requisitos/alternativa; no apruebes una correspondencia solo por el número.

El script de construcción de datos no debe convertirse en el control deportivo que Dennis tenga que editar. Los valores efectivos editables viven en las tablas/perfiles administrables; un script puede materializar la precarga, con procedencia y sin duplicar fuentes.

Conserva la corrección de `reconcile.js` que eliminó el jugador fijo EQ01-J01. Revisa las exclusiones de pruebas por categoría de fila: las del generador pueden tener otra cobertura de partido, pero siguen necesitando validación de datos. No se excluyen de todos los controles.

Localiza el 404 observado en Chromium por URL y petición. Corrige la causa si pertenece a la aplicación. No lo declares favicon por suposición ni emprendas una remodelación de interfaz por este incidente.

## 3. Flujo y alcance de producto

Recorrido: **plantillas/variantes → preparar experimento → revisar agenda y entradas → ejecutar lote → resultados y comparación → abrir partido/análisis → descargar paquete completo**.

Debe servir para:

1. Repetir un enfrentamiento con semillas distintas.
2. Cruzar equipos seleccionados con repeticiones/localía declaradas.
3. Comparar base/candidata usando la misma agenda y lista de semillas.
4. Ver progreso, detener al finalizar el encuentro actual, conservar y continuar pendientes.
5. Consultar cada partido terminado y los registros disponibles de un fallo.
6. Descargar un partido o el lote, incluso parcial, con entradas y diagnóstico completo de lo resuelto.
7. Particionar la descarga sin perder encuentros o dependencias.

No incluye el catálogo completo de auditorías/sensibilidad y calibración de MOTOR-13 ni la optimización final de MOTOR-14. Sí incluye las validaciones de integridad/conciliación necesarias para fiarse del paquete y las mediciones básicas del coste de producirlo.

## 4. Programación de enfrentamientos

### 4.1 Modos

**Repetir enfrentamiento:** equipos A/B, versiones, planes/escenario, repeticiones y localía.

**Cruces seleccionados:** equipos de referencia, generados o variantes; pares no repetidos por defecto. No hay autoenfrentamiento salvo selección explícita de dos instancias, por ejemplo base y copia.

Localía: fija, ida/vuelta o alternada por repetición. Si el motor no tiene efecto deportivo de localía implementado, conserva A/B y la etiqueta local/visitante sin inventar una ventaja. Indica esa cobertura.

### 4.2 Cantidades inequívocas

Accesos rápidos **10, 100, 1.000** y cantidad editable. Define la entrada como repeticiones por enfrentamiento y por variante, y muestra antes de iniciar:

- Equipos y pares.
- Repeticiones y si cada ida/vuelta genera dos casos.
- Número de variantes.
- Casos deportivos y ejecuciones totales solicitadas.
- Registro seleccionado y estimación de tamaño solo si existe una medición que la sostenga.

Ejemplo de conteo: 12 equipos distintos producen 66 pares; una ida/vuelta produce 132 casos por repetición; con dos variantes son 264 ejecuciones. No llames «100 partidos» a 100 por cada uno de esos pares sin explicar la multiplicación.

Orden estable de agenda por pares, repetición, lado y variante. Conserva un ordinal lógico por caso, independiente del tiempo de ejecución.

### 4.3 Prevalidación

Materializa y valida equipos, planes, roles/director, elegibilidad, perfiles, variantes y órdenes programadas antes de arrancar. Una misma persona no ocupa dos plazas por colisión de ID.

Un caso inválido de preparación se muestra con causa y no se convierte en un partido jugado. No cambies automáticamente el plan o una plantilla para que el lote empiece.

Conserva si el usuario corrige y vuelve a guardar la configuración: será una nueva revisión/ejecución de lote, no una modificación silenciosa de la agenda congelada.

## 5. Variantes, semillas y entradas congeladas

### 5.1 Definición del experimento

Incluye pregunta/objetivo, base, candidata o candidatas, cambios declarados, población y variables conservadas. Precarga objetivo «auditoría general de coherencia y distribuciones» cuando Dennis no escriba uno.

Ejemplo: mismos equipos/planes/semillas; candidata +3 en TEC08 de los directores; estudiar pérdidas, creación y distribución de tiros. La selección de jugadores se resuelve y se lista antes de ejecutar, no cambia según quién termine teniendo más asistencias.

### 5.2 Tres semillas distintas

Distingue semilla de generación de población, semilla de lote y semilla deportiva de cada caso. La población se materializa una vez al preparar el lote; no se regenera en cada partido por detrás.

Deriva y guarda por adelantado la lista completa de semillas deportivas desde el RNG de lote versionado. Deben ser distintas entre casos de repetición, salvo una duplicación expresamente declarada. Las variantes del **mismo caso comparado** comparten su semilla a propósito.

Reutiliza algoritmo/derivación deterministas existentes; si se usa xorshift32, aplica su tratamiento de cero y conserva estados/orden. Detecta colisiones y resuélvelas de forma estable antes de congelar la agenda, registrando el procedimiento. No uses el reloj del sistema para variar una repetición.

No derives la semilla del índice de un worker, del orden de finalización o de un reintento. Detener/reanudar no desplaza la lista.

### 5.3 Snapshot efectivo

Congela IN01–IN03: fichas con las 32 capacidades/cuerpo/tendencias/estados, planes/roles/rotaciones/libros/defensa/saques, política/delegación, importancia y perfiles efectivos de reglas/estadística/información/generador cuando corresponda.

Incluye valores efectivos de parámetros, no solamente la referencia a una base que puede cambiar en el navegador. Los compartidos pueden almacenarse una vez y referenciarse por huella.

El siguiente encuentro parte de una copia limpia de sus entradas; no del objeto mutable que terminó el anterior. Memoria, recursos y estados no se arrastran accidentalmente.

### 5.4 Órdenes programadas

Las órdenes reproducibles existentes pueden formar parte del escenario, con frontera deportiva y condición identificadas. Se aplican por el mismo mecanismo de órdenes, prioridad y ventanas del partido.

LAB11-10 no se automatiza fingiendo que Dennis envió una orden. Si requiere una orden prevista, debe guardarse como entrada programada explícita o el escenario se identifica como no automatizable en ese aspecto. No la envíes en una milésima arbitraria ni suspendas el lote esperando clics humanos ocultos.

## 6. Ejecución progresiva y conservación

### 6.1 Núcleo y controlador de lote

Un controlador agenda partidos completos y llama al motor existente. La primera implementación puede ejecutar **un partido cada vez**, con pausas de control entre encuentros. No hace falta un sistema distribuido.

El hilo/interfaz debe seguir respondiendo para mostrar progreso y solicitar detención. Usa el servidor local o el mecanismo de ejecución ya apropiado del proyecto; separa el control del lote de la reproducción visual. Evita un bucle síncrono de 1.000 partidos que bloquee la UI sin oportunidad de procesar la petición.

Ningún partido espera tiempo de animación x2/x4. Omitir la prosa reduce presentación, no cambia acontecimientos. No precomputes un marcador diferente.

### 6.2 Escritura progresiva

Conserva el resultado y registro de cada encuentro conforme se produce. No guardes el lote completo en un array del navegador para generar un ZIP gigante al final.

Reutiliza persistencia existente. Si falta soporte, implementa almacenamiento local mínimo para trabajos/archivos mediante el servidor ya utilizado, con directorio de salida identificado y excluido de Git. No añadas una nueva base de datos o nube.

Emite registros en bloques razonables y descarga memoria de encuentros finalizados después de conservarlos. El contexto deportivo activo sigue siendo pequeño; el historial vive aparte.

La proyección de resultados puede ser incremental, pero la reconstrucción desde archivos/hechos debe verificarla. No escribe una segunda verdad sin vínculo con el motor.

### 6.3 Confirmación de un encuentro

Un encuentro queda confirmado cuando sus entradas y salida/registros disponibles se han conservado y su estado final se ha identificado. Actualiza el índice/checkpoint de forma consistente para que un reinicio no lo duplique.

No necesitas una transacción distribuida: archivos temporales y publicación final/índice ordenado pueden bastar en la arquitectura actual. Un archivo incompleto no se presenta como partido confirmado.

## 7. Estados, interrupciones y fallos

### 7.1 Dos niveles de estado

**Trabajo/lote:** preparado, ejecutándose, detención solicitada, detenido, completado, interrumpido por error u otro estado equivalente documentado.

**Ejecución lógica de partido:** pendiente, en curso, terminada, fallida o interrumpida sin completar. Cada una tiene variante/caso y, si hay reintentos, ID de intento separado.

«Terminada» como ejecución y «partido deportivo finalizado válido» no son sinónimos. Conserva también estado deportivo, validez y elegibilidad para agregación.

Contadores visibles y exportados: solicitados, iniciados, en curso, terminados, válidos deportivos finalizados, fallidos, interrumpidos y pendientes. Los estados primarios deben reconciliar el total; los contadores derivados, como iniciados, pueden solaparse y lo explican.

### 7.2 Detener y continuar

«Detener al terminar el partido actual» no lo corta a mitad por conveniencia. Conserva los ya terminados y mantiene la agenda pendiente. Permite descargar el lote parcial y continuar después con las mismas entradas/semillas.

Si se cierra navegador pero el servidor sigue activo, el progreso se recupera al volver a abrir. Si se cierra el proceso, identifica los encuentros que quedaron en curso. Sin snapshot deportivo de continuación, **no finjas reanudación desde una posesión**: conserva el intento parcial y ofrece repetir ese caso desde su inicio congelado, con misma semilla y nuevo ID de intento.

No se encarga resolver la suspensión reglamentaria persistida de MOTOR-09 para dar continuidad al controlador de lotes. Son problemas distintos.

### 7.3 Fallos y reintentos

Un error conserva último hecho/decisión confirmado, secuencia, entradas, error estructurado y registros disponibles. No inventes un marcador final ni una derrota deportiva.

Puede continuar con otros casos, identificando el fallo, salvo que el error haga inválida la configuración compartida o impida conservar los registros: en ese caso detén con causa.

Reintento explícito, sin buscar otra semilla hasta que salga bien. Conserva todos los intentos; una sola salida canónica por ejecución lógica puede entrar en agregados. No cuentes fallida y repetida exitosa como dos partidos de muestra.

### 7.4 Exclusiones

Los agregados principales de rendimiento usan partidos deportivos finalizados válidos y cubiertos por su indicador. Suspendidos, ejecuciones fallidas/inválidas y datos parciales quedan en sus tablas de incidencias y conteos.

Resultados administrativos, si existen, se separan de producción de cancha y tienen universos propios. No se mezclan sus marcadores adjudicados con distribución de tiros o puntos por posesión.

Una métrica avanzada no registrada excluye solo ese indicador y declara su exposición; no convierte en inválido todo el partido ni se rellena con cero.

## 8. Agregados y distribuciones

### 8.1 Reutilizar MOTOR-10

Usa el catálogo y fórmulas comunes: resultados, puntos, parciales, duración, posesiones beM, F, tiros/libres, pérdidas/robos, rebotes, faltas, energía/estados cuando exista registro, dirección, familias/coberturas, saques, presencia y quintetos.

No crees otra definición de posesión o TS para el lote. Los indicadores conservan permiso, cobertura, unidad y política.

Los equipos pueden aparecer como A/B o local/visitante. Agrupa por identidad lógica/fuente y revisión/variante, no por nombre de texto ni por un ID de instancia nuevo en cada partido.

### 8.2 Dos agregaciones distintas

- **Tasa agregada por exposición:** suma de numeradores/suma de denominadores elegibles.
- **Distribución entre partidos:** cada partido aporta su valor individual elegible, con n propio.

Ejemplo: acierto global de triple no es la media simple de los porcentajes de partido. La media de porcentajes por encuentro puede ofrecerse como otra medida, con su nombre.

Para partidos por equipo usa `team_games`; para resultados de encuentros, `match_count`. No dupliques la muestra porque cada acta tenga dos filas de equipo.

### 8.3 Salida mínima

Por variante, equipo/enfrentamiento y grupos pertinentes:

- N solicitados, válidos, elegibles para indicador y excluidos por causa.
- Totales, exposición, numerador/denominador y tasa.
- Media, desviación estándar entre partidos, mínimo, P05, P25, mediana/P50, P75, P95 y máximo cuando tenga sentido.
- Victorias/derrotas sobre resultados deportivos elegibles, localía y diferencia de puntos.
- Referencias a partidos extremos/atípicos observados, sin llamarlos error solo por ser extremos.

Precarga estadística: desviación muestral con n−1; para n=1 no calculable. Cuantiles interpolados con índice `(n−1)×p`, interpolación lineal entre posiciones contiguas, con p entre 0 y 1. Documenta esta convención para reproducir el CSV.

No calcules percentiles sobre un cero que representaba dato ausente. No conviertas variación de puntos en una medición directa de Consistencia.

### 8.4 Lectura táctica y de capacidades

Agrega origen/ejecución/decisión directa, oportunidad previa/conversión, organizaciones/coberturas, presión, memoria/rutas A/B, rotaciones y tiempos muertos usando sus universos compatibles.

Por capacidad distingue: tareas pertinentes con exposición registrada, usos efectivos, actor, valor base/efectivo y contribución realmente calculada. Si no existe un contador de oportunidad no evaluada, no lo inventes desde la cantidad de posesiones.

Que una capacidad aparezca muchas veces en la traza no prueba impacto deportivo. El lote prepara evidencia; sensibilidad y calibración corresponden a MOTOR-13.

## 9. Comparación base y candidata

### 9.1 Emparejamiento

`case_id` identifica mismo enfrentamiento, repetición, lado y semilla. Cada variante produce su ejecución del caso con entradas/diff propios. Guarda también el remapeo lógico de participantes cuando haya instancias distintas.

Muestra resultados por variante y diferencias de casos válidos emparejados. Si falta un lado, no lo rellenes: queda par incompleto y se excluye de la comparación emparejada, sin borrar el resultado válido de los agregados de su variante.

### 9.2 Qué informar

Por indicador: tasa agregada de cada lado con exposición, diferencia en unidades correctas, distribución de diferencias por caso cuando sea aplicable, pares elegibles/incompletos y contexto conservado/cambiado.

No promedies diferencias de porcentajes para llamar al resultado «diferencia de acierto global»: la diferencia de tasas agregadas y la media de diferencias por partido son medidas distintas.

Misma semilla no garantiza que cada jugada consuma los mismos sorteos después de una decisión distinta. No prometas un efecto causal aislado universal ni que +3 mejore cada marcador.

Si solo cambian nombres/etiquetas de presentación, los hechos deportivos deben mantenerse. Si cambian parámetros reales, la diferencia se estudia sin exigir una victoria concreta.

### 9.3 Extensión futura

No implementes ajuste automático de coeficientes, tests de significación de todo el catálogo, regresiones, intervalos causales o un optimizador de tácticas. Presenta muestra y dispersión; la decisión de calibrar se tomará con MOTOR-13 y Dennis.

## 10. Registro diagnóstico completo

### 10.1 Instrumentar al resolver, no reconstruir después

La extracción completa diagnóstica captura las operaciones efectivamente resueltas. Conserva valores desde sus variables ya calculadas o mediante un observador pasivo común.

No vuelvas a llamar a un getter que actualice momento/energía para imprimirlo, no repitas una resolución, no vuelvas a sortear y no calcules alternativas nuevas para explicar un resultado ya ocurrido.

Relato puede omitirse. La información semántica y diagnóstica comprometida para el lote completo se registra desde el principio; no se recupera inventando después razones del entrenador.

### 10.2 Acontecimientos y órdenes

Todos los hechos producidos: avance, acción, respuesta/ayuda, tiro, rebote, disputa, falta, libres, pérdida, saque, sustitución, tiempo muerto, cambio de plan, administración y cierre.

Órdenes: solicitud, validación, frontera de aplicación, vigencia, suspensión/cancelación, consumo y cierre, con actor humano/automático/programado. Una solicitud no cuenta como aplicación.

Estados: intervalos/episodios y cambios relevantes con causa, anterior/posterior y sujeto. No es una serie temporal por milisegundo.

### 10.3 Decisiones y resoluciones

Cada tarea/resolución pertinente debe permitir conocer:

- Acción/intención, actor/participantes, función, fase, disposición/defensa/cobertura real y continuidad.
- Opciones efectivamente evaluadas, descartes por requisito y elección/motivo.
- Filas de configuración consumidas y versión, pesos/componentes, límites y valor final.
- Capacidades pertinentes con ID/propietario, valor base y efectivo realmente usados.
- Energía, Forma, momentos/presión/cuerpo cuando influyeron, en su punto real de aplicación.
- Distribución excluyente completa que se calculó, o probabilidad binaria/condicional pertinente.
- Sorteos consumidos con ordinal, valor y vínculo a decisión; resultado y acontecimientos derivados.

No fuerces una descomposición aditiva si el mecanismo aplica un estado sobre probabilidad final: conserva el lugar real y sus valores antes/después. No presentes atributos ajenos a la tarea como si influyeran.

Cada alternativa distingue evaluada/rechazada/no evaluada. No existe una lista omnisciente de todo lo que habría podido pasar.

### 10.4 Sorteos y cobertura

Conserva todos los sorteos deportivos consumidos en el nivel completo, con ordinal estable y decisión/operación consumidora. Una tabla/archivo normalizado puede evitar repetir el mismo dato en varias trazas. Nunca incluye sorteos futuros.

Si un mecanismo todavía no expone un componente que sí calcula, instrumenta ese punto común. No basta con poner un archivo vacío de decisiones y llamarlo extracción completa.

Si un dato no se calcula o una tarea no existe, registra estado y cobertura. Los partidos antiguos con menor detalle siguen siendo parciales en ese aspecto; no les asignes una traza fabricada.

### 10.5 Capacidad de elegir detalle

Puede existir registro ordinario reducido y diagnóstico completo. «Descargar paquete completo diagnóstico» usa la cobertura completa capturada para ese trabajo. Activar/omitir prosa o cambiar detalle solo modifica qué se conserva, nunca el deporte.

Un lote iniciado con registro reducido no puede prometer después componentes que no guardó. Ofrece su extracción con cobertura real o una nueva ejecución explícita con otra configuración de registro; no sustituye los resultados originales.

## 11. Identificadores y relaciones

Campos semánticos, con nombres físicos equivalentes documentados:

| Campo | Función |
|---|---|
| `batch_id` | Experimento/lote congelado. |
| `variant_id` | Base/candidata. |
| `case_id` | Enfrentamiento/repetición/lado/semilla comparables. |
| `match_id` | Ejecución lógica de ese caso y variante. |
| `attempt_id` | Intento concreto, incluidos fallos/repeticiones. |
| `input_id` / `profile_id` | Snapshot efectivo incluido, no referencia mutable. |
| `team_instance_id` / `source_team_id` | Participación en partido frente a identidad de población. |
| `player_instance_id` / `source_player_id` | Jugador participante frente a ficha/plaza fuente. |
| `event_id` / `sequence` | Hecho y orden estable dentro del intento. |
| `possession_id` | Posesión beM cuando existe. |
| `execution_id` | Interacción/familia/decisión directa ejecutada. |
| `finalization_id` | F cuando corresponde. |
| `series_id` | Serie de libres y su causa. |
| `stint_id` / `plan_revision_id` | Presencia/plan efectivos. |
| `decision_id` / `draw_index` | Resolución y aleatoriedad consumida. |
| `revision_id` | Corrección efectiva. |

Nulos legítimos para administración sin posesión/F. No inventes una posesión para evitar una clave nula. Conserva tipos, cardinalidad y dependencias en el diccionario.

Una referencia se resuelve dentro del paquete o mediante una dependencia explícita de fragmento señalada en su índice. Un enlace a una ruta local del repositorio no hace autocontenido el ZIP.

## 12. Contenido del paquete

Nombre propuesto: `beM-lote-<id>-completo.zip`; para un solo encuentro, mismo esquema con alcance de un partido.

| Ruta/conjunto | Contenido |
|---|---|
| `README.md` | Pregunta, alcance, variantes, cómo leer, cobertura y limitaciones. |
| `manifest.json` | Identidad/estado, versiones, contadores, inventario, integridad, alcance y exclusiones. |
| `diccionario.json` y `diccionario.md` | Tipos, campos, unidades, categorías, nulos, relaciones y políticas. |
| `entradas/lote.json` | Agenda completa, semillas, configuración/objetivo y referencias a snapshots. |
| `entradas/variantes.json` | Base/candidatas, diferencias, selección efectiva y variables conservadas. |
| `entradas/perfiles/*.json` | Todos los parámetros efectivos de motor/reglas/estadística/información requeridos. |
| `entradas/equipos/*.json` | Doce fichas por equipo/variante, capacidades, cuerpo, tendencias y estados. |
| `entradas/planes/*.json` | Planes completos, roles, libros, rotación, políticas, delegación y órdenes previstas. |
| `estadisticas/partidos.csv` | Una fila por ejecución lógica, estado, validez, resultados, semillas, duración, cobertura y referencias. |
| `estadisticas/periodos.csv` | Parciales válidos, secuencia/administración y duración aplicable. |
| `estadisticas/equipos.csv` | Acta total/filas colectivas y magnitudes con universos declarados. |
| `estadisticas/jugadores.csv` | Acta, participación/DNP, minutos y contexto de ficha/variante. |
| `estadisticas/posesiones.csv` | Origen, inicio/cierre, puntos vinculados, continuaciones y mezcla pertinente. |
| `estadisticas/finalizaciones.csv` | F, técnica/preparación, calidad previa, resultado y serie ligada. |
| `estadisticas/tiros.csv` | Intentos válidos/anulados/repetidos, valor, sector real y oposición. |
| `estadisticas/ejecuciones.csv` | Familias/variantes/decisiones directas, respuesta, resultado local y continuidad. |
| `estadisticas/tramos.csv` | Presencia/planes, intervalos, jugadores y mezcla. |
| `estadisticas/quintetos.csv` | Presencia, completas/mixtas y eficiencias con exposición. |
| `agregados/indicadores.csv` | Totales/tasas por grupo, numerador, denominador, elegibilidad y unidad. |
| `agregados/distribuciones.csv` | Estadísticas entre partidos con convención y n. |
| `agregados/comparaciones.csv` | Base/candidata y diferencias, emparejamiento e incompletos. |
| `agregados/capacidades.csv` | Exposición/usos/contribuciones disponibles por capacidad/tarea/actor/grupo. |
| `eventos/*.jsonl` | Todos los hechos y relaciones, ordenados por intento/secuencia. |
| `decisiones/*.jsonl` | Tareas, opciones, cálculos, contribuciones, motivos y resultados reales. |
| `decisiones/sorteos-*.jsonl` | Sorteos consumidos y operaciones vinculadas, si se normalizan fuera de la traza. |
| `auditoria/validaciones.jsonl` | Controles ejecutados, resultado, universo y evidencia. |
| `auditoria/incidencias.jsonl` | Fallos, interrupciones, créditos pendientes y causas. |
| `auditoria/cobertura.csv` | Campos/productores, nivel real de registro y qué no se comprobó. |
| `auditoria/rendimiento.csv` | Tiempos/bytes/coste por fase y entorno, sin promesas. |
| `resumen.md` | Recopilación global, cambios, resultados, dispersión e incidencias navegables. |

Las rutas pueden seguir convenciones existentes si se mantiene mapa claro y todo el contenido. Entradas compartidas se guardan una vez por huella dentro de cada paquete que las necesite.

Una tabla sin hechos pertinentes puede tener cabecera y cobertura «sin observaciones elegibles». No confundas eso con un productor ausente. Los intentos fallidos conservan lo disponible y su índice, aunque no tengan acta final.

## 13. Manifest, versiones e integridad

### 13.1 Campos mínimos

| Bloque | Información obligatoria |
|---|---|
| Identidad | ID de paquete, lote, alcance partido/lote/parte/extracto, fecha de creación y revisión. |
| Estado | Estado del trabajo, nivel de registro, integridad verificada y cobertura efectiva. |
| Versiones | Esquema de paquete, motor/commit identificable, RNG/derivación, reglas, contenido/dataset, perfiles/políticas de crédito/análisis/información. |
| Agenda | Casos/variantes, ejecuciones lógicas, semillas, intentos y entrada efectiva referenciada. |
| Conteos | Solicitados, iniciados, pendientes, en curso, terminados, fallidos, interrumpidos y válidos/eligibles. |
| Agregación | Universos, filtros, exclusiones, fórmula y convención de distribución. |
| Archivos | Ruta relativa, formato/encoding, bytes, registros lógicos, checksum SHA-256 y alcance. |
| Relaciones | Tipos de ID, dependencias y archivos que los resuelven. |
| Partición | Índice/total de partes, casos incluidos, fragmentos, dependencias y vínculo al índice global. |
| Auditoría | Validaciones ejecutadas, fallos, advertencias de cobertura y mediciones. |

Esquema de paquete inicial propuesto: `beM-analysis-package/1`. Es distinto de `export/8` de reproducción deportiva y del contrato de escenarios. Verifica y reutiliza convenciones existentes si ya hay un formato equivalente.

### 13.2 Checksums sin circularidad

SHA-256 sobre bytes reales de cada archivo de contenido. El manifest no incluye su propio hash dentro de sí mismo; su integridad puede cubrirse desde el índice externo o hash del ZIP. Un índice de partes puede listar tamaño/hash del ZIP final de cada parte sin crear dependencia circular.

Los conteos de CSV son registros lógicos, no líneas físicas cuando una celda contiene salto de línea. JSONL cuenta objetos válidos por línea; JSON declara si es objeto único o colección. El inventario distingue esos casos.

No calcules el checksum antes de terminar de escribir el archivo. Un archivo temporal no conserva el hash de otro intento anterior.

### 13.3 Versiones y reproducción

El paquete lleva los datos necesarios para análisis offline sin consultar el repositorio. Para **reejecutar** el deporte sigue siendo necesaria una versión compatible del motor identificada; el ZIP no pretende contener un ejecutable universal ni todo el código fuente.

Si el motor/configuración compartida cambia mientras el lote está detenido, no continúes mezclando versiones en el mismo experimento congelado. Conserva el lote y prepara una nueva ejecución/revisión con correspondencia explícita o bloquea la continuación incompatible.

Los históricos mantienen versión de reglas, créditos y entradas. Un análisis bajo una política nueva se identifica como nueva proyección, no altera el resultado original.

## 14. CSV, JSON y JSONL

### 14.1 Formato tabular

CSV UTF-8, cabeceras estables, separador coma y punto decimal. Entrecomillado/escape correcto de comas, comillas y saltos de línea. No dependas de la configuración regional del ordenador de Dennis.

Fechas ISO 8601 con zona/desplazamiento declarado. Duraciones con unidad en campo/diccionario: segundos deportivos frente a milisegundos de ejecución. Porcentajes y razones tienen escalas explícitas.

Celdas nulas pueden quedar vacías, acompañadas de estado/motivo cuando sea necesario para distinguir ausencia y cero. No uses `—` dentro de una columna numérica de análisis. JSON usa `null` y estado; nunca NaN/Infinity.

Preserva precisión de cálculo; el redondeo de la UI no se convierte en el valor del CSV. Las capacidades siguen continuas en 1–30.

### 14.2 Campos de relación

Las tablas comparten al menos IDs de lote/variante/caso/partido/intento y las claves pertinentes de su entidad. No obliga a repetir todas las capacidades en cada fila de tiro; el snapshot las resuelve.

Para estructuras repetidas complejas utiliza JSONL o una tabla hija. No metas el historial completo serializado dentro de una celda de cada jugador.

Incluye `estadisticas/intentos.csv` o equivalente si el índice de partidos solo tiene una fila canónica: todos los intentos fallidos/repetidos siguen localizables con su estado y archivos de traza.

### 14.3 Diccionario operativo

Para cada campo/indicador declara tipo, unidad, valores/categorías, nulidad, naturaleza, política/fórmula, relación, filtros y permiso. Distingue exacto bajo convención beM, estimación convencional, inferencia identificada y no registrado.

Campos propios como F, origen, mixtas o patrones de memoria deben poder interpretarse sin leer el código. El diccionario explica las dos particiones de puntos y cómo evitar sumarlas entre sí.

### 14.4 Procesado por bloques

JSONL se lee línea a línea y CSV por registros; archivos organizados por partidos o tramos de partidos. No generes un JSON único que obligue a cargar en RAM todos los eventos del lote para localizar un tiro.

El orden de registros deportivos se identifica por partido/intento/secuencia, no por la marca de tiempo real de escritura.

## 15. Paquetes grandes y partición

### 15.1 Política inicial

Precarga técnica configurable: objetivo **64 MiB de contenido sin comprimir por parte**. Es una semilla de partición para medir, no el límite de subida de ninguna plataforma ni una garantía de tamaño comprimido.

Particiona prioritariamente por partidos completos. Cada ZIP numerado tiene README, manifest, diccionario, entradas/perfiles que necesita, sus tablas/registros y agregados de su ámbito. Evita depender de un fichero mutable fuera del paquete.

Genera un índice global descargable con total de partes, tamaños/hashes finales, partidos incluidos y estado. Ejemplo de nombre: `beM-lote-<id>-indice.zip`, con `indice.json`, resumen global y guía; después `...-parte-001-de-N.zip`.

No hace falta un índice ZIP separado cuando todo cabe en un único paquete; su manifest cumple esa función.

### 15.2 Partido mayor que una parte

Si un partido por sí solo supera el objetivo, puede fragmentarse su registro por secuencia, con límites exactos, rango de eventos/decisiones/sorteos y partes necesarias para reconstruirlo.

Cada fragmento incluye contexto de entrada y su propia cobertura. Declara explícitamente referencias a hechos de otros fragmentos; no presenta el fragmento como partido completo autocontenido.

El índice permite localizar todos sus fragmentos. El acta y agregado canónico del encuentro se cuentan una vez, no una por fragmento. Los puntos y sorteos tampoco se duplican al reensamblar.

### 15.3 Global frente a parte

Archivos globales llevan ámbito global; los de una parte, ámbito de esa parte. Si repites el resumen global dentro de varias partes, debe estar identificado como la misma proyección y no sumarse otra vez.

No repitas las filas estadísticas de un mismo partido en dos partes para repartir sus eventos sin marcar su carácter de referencia/no agregable. La validación comprueba la lista canónica de partidos.

### 15.4 Límite real de recursos

Construye partes y libera buffers progresivamente. No necesita mantener el contenido de todos los ZIP en el navegador simultáneamente. Descarga/serve archivos ya conservados mediante el mecanismo local apropiado.

Si se agota espacio o falla escritura/export, detén la operación con motivo conservando archivos confirmados. No entregues un ZIP anunciado como completo si falta el final del lote. Permite descargar lo disponible con manifest parcial.

No reduzcas detalle automáticamente, no borres eventos antiguos ni muestrees los primeros partidos para cumplir un tamaño. Cambiar política de registro exige nueva ejecución explícita y cobertura declarada.

## 16. Validación y cobertura

### 16.1 Validaciones antes de descargar

Comprueba con herramientas propias del proyecto:

1. Archivos parseables, encoding y esquema.
2. Checksums, bytes y conteos lógicos.
3. IDs únicos según entidad y referencias resolubles.
4. Agenda/estados/intentos y contadores reconciliados.
5. Partidos canónicos sin duplicidad en agregados/partes.
6. Acta y marcador reconstruibles desde hechos/política, con conciliaciones existentes.
7. Posesiones/F/series y puntos administrativos sin duplicidad.
8. Minutos/presencia, relojes y ventanas según controles disponibles.
9. Agregados recalculados desde encuentros elegibles coinciden con tablas y UI.
10. Sorteos y decisiones conservan cobertura/orden, sin introducir tiradas nuevas.
11. Cada parte incluye entradas/perfiles necesarios y dependencias de fragmentos explícitas.
12. Audiencia/permiso del paquete y de todos sus ficheros coherentes.

No exige ejecutar todas las auditorías deportivas del catálogo de MOTOR-13. Identifica qué controles están disponibles y cuáles no.

### 16.2 Comprobador reutilizable

Entrega un comando de verificación del paquete/directorio producido, documentado en README/recorrido y ejecutable con el entorno existente. Puede ser `npm run batch:check -- <ruta>` o equivalente integrado.

Debe comprobar integridad y relaciones sin volver a simular los partidos ni necesitar consultar datos mutables del navegador. La implementación puede reutilizar las mismas operaciones validadoras de la aplicación.

No se limita a comprobar «el ZIP se abre». Un archivo con filas duplicadas o una referencia rota puede ser parseable y aun así inválido.

### 16.3 Cobertura y límites heredados

El paquete registra el estado real de MOTOR-09/10/11:

- FIBA no contrastada directamente/casos no ejecutados, si siguen así.
- Inferioridad natural no soportada y falta de snapshot reglamentario de continuación.
- Lateralidad desconocida cuando solo hay aro/pintura/media/triple; función de esquina/ala no se presenta como lado exacto.
- Asistencias sin operación de continuación/desviación cuando esa dependencia persiste.
- Ocupación que limita ayuda y disponibilidad de corte disponibles solo en nuevos registros propios/diagnósticos.
- Estado propio por tramo u otros productores todavía no registrados.

No rellenes esos huecos ni los marques resueltos por aumentar la muestra. Las recomendaciones distintas de REC10-01/02 no son un requisito nuevo: MOTOR-10 solo precargaba esas dos. No inventes más para cerrar una etiqueta de pendiente.

Un indicador no registrado tiene cobertura; un incidente no observado en un mecanismo activo tiene conteo cero. La distinción queda en las tablas y en el resumen.

## 17. Resumen y entrega útil para ChatGPT

### 17.1 Resumen de lote

Genera `resumen.md` desde los mismos agregados, con:

- Objetivo/pregunta y qué cambió entre variantes.
- Versiones, población, planes y estados iniciales.
- Solicitados/terminados/validos/excluidos/pendientes y cobertura de registro.
- Resultados principales y dispersión, con unidades/exposición.
- Comparación base/candidata y pares incompletos.
- Incidencias de integridad/conciliación y extremos observados, con IDs.
- Qué controles pasaron y qué no se evaluó.
- Guía breve de archivos/partes y cómo abrir un partido concreto.
- Límites de inferencia: un extremo no prueba fallo; una diferencia en una muestra pequeña no demuestra superioridad general.

No impongas exactamente tres claves a un lote: esa regla corresponde al resumen de partido. La recapitulación masiva debe informar cobertura y experimento además de resultados.

No genera recomendaciones de calibración definitivas ni modifica el perfil activo. Puede señalar «revisar estos casos» con evidencia, sin inventar un diagnóstico causal.

### 17.2 Cómo quiero recibirlo para analizarlo

Incluye en README y en la UI una guía con esta preferencia:

> Adjuntar el paquete completo; si está dividido, el índice y todas las partes. Añadir el objetivo y los cambios de la comparación. Por ejemplo: «Base y variante con +3 en Pase de estos directores; mismos enfrentamientos y semillas; estudiar pérdidas, creación y tiros». Si no hay una pregunta concreta, pedir auditoría general de coherencia y distribuciones.

Orden de lectura recomendado: README/manifest/cobertura → agregados/comparaciones → partidos extremos o anómalos → entradas → eventos/decisiones vinculados. No hace falta pegar miles de líneas de logs en el chat.

El paquete debe permitir responder qué versión se ejecutó, con qué datos, qué registros están completos, qué partidos se excluyeron y qué operación concreta sustenta una anomalía.

No envíes archivos automáticamente a ChatGPT, GitHub, correo ni otro servicio. Es una descarga local que Dennis decidirá compartir.

## 18. Interfaz y permisos

### 18.1 Preparar lote

Añade «Lotes» o sección equivalente al laboratorio existente:

- Modo repetición/cruces, selección de equipos/planes/escenarios y localía.
- Repeticiones rápidas 10/100/1.000 y cantidad editable.
- Semilla de lote, variantes/diff y objetivo.
- Nivel de registro y prosa, con explicación de cobertura.
- Vista previa de agenda, total real de ejecuciones y validaciones.
- Iniciar, sin alterar perfiles o plantillas guardados.

No obligues a reconstruir un equipo manualmente para usar una variante MOTOR-11. Mantén separados escenarios preparados y partidos ordinarios.

### 18.2 Progreso y control

Solicitados/confirmados/válidos/fallidos/pendientes, partido actual y progreso. Tiempo transcurrido y ETA solo como estimación basada en ritmo medido, identificada como aproximación.

Acciones: detener tras el actual, continuar pendientes, ver incidencia, abrir resultados y descargar parcial. No un botón que silenciosamente mate el partido y lo contabilice como derrota.

La UI puede actualizar cada 500 ms y al confirmar un encuentro como precarga técnica. No escribe un acontecimiento deportivo por cada actualización visual.

### 18.3 Resultados

Tabla de partidos con estado, variantes, semilla, marcador real o motivo de ausencia, cobertura y acceso al análisis MOTOR-10. Filtros por equipo/caso/variante/validez/incidencia.

Tablas agregadas/distribuciones y comparación. Al pulsar un extremo o incidencia se abre partido/consulta pertinente; si falló, el contexto conservado. No hace falta un dashboard distinto por cada combinación de filtros.

### 18.4 Descargas

«Descargar paquete completo de análisis» para lote o partido. En laboratorio, la extracción completa es **diagnóstica**, rotulada como tal. No se confunde con CSV de una vista pública ni con export reproducible deportivo.

Conserva los exports públicos/propios existentes aplicando permisos antes de generar archivos. Los datos internos no se entregan al entrenador automático por estar presentes en el diagnóstico del lote.

Si se exporta un filtro o extracto, su manifest/README dice qué se seleccionó y qué se excluyó; no se etiqueta como lote íntegro.

## 19. Huellas y compatibilidad

### 19.1 Tres conceptos distintos

El informe MOTOR-11 indica que el hash llamado deportivo cambia solo por el ID del perfil. Para esta entrega separa claramente:

1. **Checksum de archivo/paquete:** bytes exactos, incluidos metadatos si están dentro del archivo.
2. **Huella de entrada efectiva:** configuración/participantes/estados/órdenes relevantes, canonicalizados y con referencias resueltas; metadatos decorativos identificados aparte.
3. **Huella de trayectoria deportiva:** proyección canónica de hechos/decisiones/resultado pertinentes, sin nombre de biblioteca del perfil, ID de lote/parte, tiempos de ejecución o texto de presentación.

La definición/campos de cada una se documentan y versionan. No uses el mismo nombre para dos contratos ni cambies silenciosamente baselines históricos.

Los identificadores de participantes y relaciones funcionales se conservan o normalizan mediante un remapeo declarado; no se eliminan para que dos partidos distintos parezcan iguales. Una renominación puramente decorativa de perfil no debe cambiar la trayectoria.

### 19.2 Determinismo y metadatos

A igualdad de entradas deportivas, versión y órdenes, prosa/diagnóstico/export no cambian hechos ni los 6.505 sorteos de la referencia si se confirmó esa base.

Los ZIP pueden llevar fechas y mediciones diferentes y por tanto tener otros bytes/checksums. Eso no demuestra una diferencia de juego. La comparación deportiva usa su proyección identificada, no el hash bruto del ZIP.

Si la instrumentación cambia resultado, distribución de RNG o estados, es un defecto que hay que resolver antes de declarar neutralidad de registro. No recalibres para recuperar el tanteo.

### 19.3 Formatos

Verifica los formatos actuales de partido y escenario. El paquete masivo tiene versión independiente. No subas de `export/8` solo por crear un contenedor ZIP de datos ya expresables.

Si un contrato deportivo realmente cambia para conservar campos imprescindibles, versiona con motivo y trata formatos anteriores según la política vigente, conservando archivos. No prometas reproducción con un motor deportivo diferente.

## 20. Panel y parámetros de ejecución

Amplía los soportes LAB/SUP/EST existentes. Parámetros técnicos iniciales editables y separados de balance deportivo:

Actualiza a MOTOR-12 la fuente común de versión de consola y cabecera, conservando perfil/dataset/esquemas separados. Prepara una base de configuración de laboratorio identificada con sufijo `+SEM-MOTOR12-20261017`, siguiendo la convención vigente, sin cambiar parámetros deportivos para introducir el controlador de lotes.

La activación de esa base es explícita; los perfiles anteriores quedan conservados y el partido de referencia histórico mantiene sus entradas. Las preferencias de registro/partición no deben convertirse en pesos deportivos ni alterar la huella de trayectoria.

| Parámetro | Precarga | Significado |
|---|---:|---|
| Concurrencia de partidos | 1 | Ejecución serial inicial; no requiere workers distribuidos. |
| Atajos de repeticiones | 10, 100, 1.000 | Cantidad por enfrentamiento/variante, total mostrado. |
| Nivel por defecto del paquete completo | Diagnóstico completo | Captura real desde inicio, sin alterar deporte. |
| Prosa en lote | Omitida | Hechos/estadística conservados. |
| Objetivo de parte | 64 MiB sin comprimir | Umbral técnico de partición, no límite de plataforma. |
| Actualización de progreso | 500 ms y confirmaciones | Presentación, sin pasos deportivos. |
| Cuantiles | Interpolación lineal descrita | Reproducción de distribuciones. |
| Desviación | Muestral n−1 | n<2, no calculable. |

Valida cantidad entera positiva, referencias, semillas, límites de recursos coherentes y espacio/errores de escritura cuando se detecten. Si necesitas un límite técnico de ejecuciones por trabajo, hazlo visible y administrable, con causa; no un recorte silencioso a los primeros N.

La lista de agenda y configuración congeladas se conserva aunque cambie después el panel. Continuar un lote no lee los nuevos valores activos como si fueran los originales.

No hace falta crear una tabla física por parámetro ni otro panel distinto. Los scripts pueden materializar datos, pero las decisiones deportivas y parámetros ajustables no se esconden en constantes dispersas.

## 21. Pruebas automáticas acotadas

### 21.1 Grupos necesarios

Ejecuta suite existente, `data:check` y control documental. Añade pocos grupos que verifiquen riesgos materiales:

1. Agenda/cantidades/localía, semillas congeladas, variantes emparejadas y colisiones de instancia.
2. Estados iniciales limpios entre partidos y snapshot inmune a edición posterior.
3. Detener/continuar sin duplicar confirmados; interrupción de proceso distingue intento parcial y repetición desde inicio.
4. Fallo identificado, sin resultado ficticio, exclusión adecuada y reintento no duplicado en muestra.
5. Agregados ponderados, distribución/quantiles, n=0/1, desconocidos y pares incompletos.
6. Registro completo y reducido/prosa dan el mismo deporte/RNG; trazas contienen realmente operaciones, contribuciones y sorteos, no solo cabeceras.
7. ZIP/partes parseables, hashes/conteos/referencias, sin duplicación de partidos; fragmento excepcional con cobertura explícita.
8. Verificación detecta archivo alterado, referencia rota y fila estadística duplicada; no solo error de sintaxis.
9. Audiencias correctas en UI y archivos; etiquetas decorativas no cambian huella deportiva.
10. Abrir un partido de lote y reproducirlo con entradas efectivas coincide con su registro.

Usa fixtures pequeños o un ejecutor de prueba para estados de trabajo y errores. Un resultado sintético de prueba no se presenta como partido deportivo real. No fuerces un fallo natural para demostrar el mecanismo.

### 21.2 Integración con pocos encuentros

Reutiliza resultados en las comprobaciones; no ejecutes cinco partidos por cada export o nivel de detalle.

Lote de contraste inicial: **cinco casos y dos variantes = diez encuentros**, con base y candidata de cambio identificado, por ejemplo +3 en Pase de los directores seleccionados. Incluye estos enfrentamientos o equivalentes de los escenarios existentes:

- EQ01/EQ02 con planes históricos.
- EQ04/EQ05 naturales.
- EQ06/EQ10 naturales.
- EQ07/EQ08 naturales.
- EQ11/EQ12 naturales.

Así EQ04–EQ06 y EQ10 naturales reciben por primera vez una comprobación de partido completo si no hubo otra anterior. No ejecutes además todos los cruces para certificarlo.

La referencia histórica `20261016` se comprueba en la base con esa semilla mediante caso explícito o comprobación reutilizada al inicio; conserva 83–103/6.505 sorteos si la base se confirmó. El resto de casos usa la agenda/semillas declaradas. No fuerces un resultado esperado de la candidata.

Complementa con un lote muy pequeño de detención/continuación y fallos preparados solo donde no pueda cubrirse con los anteriores/fixtures. Un contraste de registro completo/reducido puede reutilizar una referencia adicional; no exige repetir todo el lote.

Fuerza una partición pequeña **solo para la comprobación**, suficiente para obtener dos partes sin simular cientos de encuentros. Valida sus totales globales/parciales y un intento fallido conservado.

No ejecutes 100/1.000 como prueba de rutina. El producto debe aceptar esas configuraciones y conservar progresivamente; las mediciones grandes serán trabajo de laboratorio/rendimiento pertinente.

### 21.3 Qué informar

Número real de encuentros completos, intentos de fixture y paquetes/partes verificados. Tiempo por simulación, registro, agregación y export, bytes sin comprimir/ZIP y entorno. Distingue medición de estimación.

Un paquete de diez partidos comprueba integración, no realismo estadístico ni calibración. Un extremo 124–92 no se corrige por resultar llamativo: se conserva para auditoría.

## 22. Recorrido manual y documentación

### 22.1 Guion para Dennis

Crea `docs/prompts/MOTOR-12-recorrido-manual.md`, con arranque/URL real, perfil/escenarios/semillas, clics, observación esperada y señal de fallo. Debe funcionar desde la UI sin editar código:

1. Arrancar, verificar MOTOR-12 y perfil/dataset separados.
2. Preparar repetición de enfrentamiento; ver diferencia entre repeticiones, casos y ejecuciones con dos variantes.
3. Crear base/candidata desde escenario MOTOR-11; revisar diff y semillas independientes de generación/lote/partido.
4. Ver agenda de cruces/localía y total antes de iniciar.
5. Ejecutar un lote pequeño con registro completo; comprobar UI/progreso responsive.
6. Solicitar detención tras el actual, ver confirmados/pendientes y descargar parcial.
7. Volver a abrir la pantalla y continuar sin repetir confirmados; explicar reinicio de proceso y límite de continuación de un partido en curso.
8. Consultar válidos/incidencias y un fallo preparado claramente identificado.
9. Abrir partido, acta y análisis MOTOR-10 desde una fila.
10. Ver agregados/distribuciones/exclusiones y comparación con un par incompleto preparado.
11. Descargar paquete completo, abrir README/manifest/resumen y localizar un partido de una incidencia.
12. Probar dos partes con objetivo técnico pequeño y comprobar índice, entradas y totales.
13. Ejecutar el comprobador documentado sobre el paquete; mostrar cómo reconoce un archivo alterado de una copia de prueba, sin modificar el original.
14. Diferenciar export público/propio, diagnóstico completo y export deportivo reproducible.
15. Reproducir un partido del lote y comprobar que consultas/export no lo cambian.

No marques probado por Dennis lo que ejecutaste automáticamente. Si recorres Chromium, incluye descargas reales de ZIP/índice/partes y CSV cuando estén en alcance; identifica cada petición fallida, incluido el 404 heredado. No certifiques Node 24 u otros navegadores sin ejecutarlos.

### 22.2 Documentación técnica

Archiva íntegro este prompt como `docs/prompts/MOTOR-12-simulacion-masiva-y-extraccion.md` o equivalente del catálogo, con estado real de ejecución y revisión manual.

Crea `docs/tecnico/motor12.md` con:

- Base real de MOTOR-11, dependencia/commit, rama y alcance final.
- Agenda, conteos, localía, variantes, semillas y snapshots.
- Controlador, persistencia progresiva, confirmación/checkpoint y estados/reintentos.
- Contrato de registro y mapa R01–R08 a archivos, productores e información capturada.
- Esquemas/diccionario, identificadores, cardinalidades y cobertura.
- Reglas de agregación/distribución/pares/exclusiones.
- Manifest, checksums, huellas y partición/fragmentación sin circularidades.
- Formatos, versionado y compatibilidad de escenarios/partidos/paquetes.
- Permisos por paquete y ausencia de efectos en deporte/IA.
- Mediciones, controles reales, paquetes verificados y límites de almacenamiento/continuación.
- Estado de interpretaciones de MOTOR-11 y localización/resolución del 404.
- Pendientes heredados y pendientes propios separados de calibración/rendimiento futuros.

Incluye la guía de análisis con ChatGPT dentro de los paquetes y en documentación indexada. Actualiza páginas temáticas, índice, estado, changelog, diccionario y catálogo de prompts. Los prompts siempre se guardan en MD; no modifiques retrospectivamente el encargo para ajustarlo al código.

Conserva el funcional íntegro de consulta. Las precisiones que cambien una perspectiva anterior se anotan con procedencia/alcance para consolidación futura.

## 23. Límites y respuesta de entrega

### 23.1 Lo que sigue después

MOTOR-13 utilizará estos paquetes para auditorías de comportamiento, sensibilidad de capacidades/tácticas, monopolios y calibración. MOTOR-14 cerrará coste/rendimiento/versión 1. No los presentes como ejecutados porque existan CSV y controles de suma.

El paquete declara las reglas/productores aún incompletos, sin convertirlos en nuevas decisiones requeridas cuando el funcional ya definió su comportamiento. Una contradicción real aporta referencias e impacto; una carencia de implementación se identifica como tal.

### 23.2 Cierre real de esta entrega

No está completa si:

- El ZIP solo contiene resúmenes y omite entradas efectivas o decisiones que se prometen completas.
- Solo se pueden analizar los primeros partidos porque el resto fue descartado por memoria.
- Detener pierde confirmados, continuar cambia semillas o un reintento duplica la muestra.
- Los agregados incluyen fallidos como ceros o mezclan universos/partes.
- Un diagnóstico altera sorteos, lectura de estados o decisiones.
- Los archivos necesitan consultar el perfil actual del navegador para explicar el pasado.

Una limitación de productor histórico o reglamento se declara con su alcance. No se resuelve inventando registros. Para partidos nuevos, los cálculos ya existentes sí deben instrumentarse en su punto real cuando forman parte de la extracción comprometida.

### 23.3 Respuesta final de Claude

Entrega una PR revisable sin fusionar. Resume:

1. Qué puede probar Dennis: arranque, URL, perfil, lotes/semillas y recorrido.
2. Qué ejecución/persistencia/descarga existe realmente, incluidos parciales/partes.
3. Número de partidos/variantes y archivos/registros del paquete de cierre.
4. Comprobaciones, conciliaciones, integridad y reproducción ejecutadas.
5. Evidencia de neutralidad del registro y separación de hashes.
6. Mediciones por fase/bytes/entorno, sin extrapolación no medida.
7. 404, interpretaciones MOTOR-11, deuda heredada y pendientes reales.
8. Base/commit, rama y PR; test manual y entornos no ejecutados.

No fusiones ni suscribas PRs ni envíes mensajes a terceros. No informes cuota o tiempo de ventana si el entorno no los proporciona. No declares el motor completo terminado o calibrado.

## 24. Criterios de aceptación

- [ ] Base real con MOTOR-11 y dependencia de PR identificada.
- [ ] Repeticiones/cruces/localía y cantidad total inequívocos, con agenda previa.
- [ ] Base/candidata y diferencias congeladas; generación, lote y semilla deportiva separados.
- [ ] Mismo núcleo, estados limpios por partido y órdenes por fronteras reales.
- [ ] Progreso responsive, detención tras actual y conservación/continuación de pendientes.
- [ ] Escritura progresiva, intentos/canonización y ausencia de duplicidad tras reinicio/reintento.
- [ ] Fallos/incompletos conservados con causa y excluidos de universos incompatibles.
- [ ] Agregados/distribuciones/exposiciones/pares correctos, con métodos y n visibles.
- [ ] Eventos/decisiones/capacidades/estados/sorteos realmente calculados capturados sin nuevos efectos deportivos.
- [ ] Registro completo/reducido/prosa conserva el mismo deporte y RNG.
- [ ] IDs y relaciones permiten pasar de agregado a partido/entrada/acción/decisión.
- [ ] ZIP autocontenido con CSV, JSON, JSONL, diccionario, guía y resumen.
- [ ] Manifest incluye versiones, estados, cobertura, conteos y checksums verificables.
- [ ] Partes numeradas e índice global sin muestreo ni duplicación; fragmentos excepcionales explícitos.
- [ ] Comprobador reconstruye/valida datos e identifica archivos alterados o referencias rotas.
- [ ] UI abre análisis de cada partido y contexto conservado de fallos.
- [ ] Permisos de público/propio/diagnóstico respetados en archivos y consultas.
- [ ] Huellas de archivo, entrada y trayectoria separadas; perfil decorativo no altera la deportiva.
- [ ] Parámetros de ejecución/export en soportes administrables, sin cambiar balance.
- [ ] Verificación acotada, descargas reales y guion manual preparados con cobertura declarada.
- [ ] Prompt/documentación actualizados, deuda separada y PR sin fusionar.
