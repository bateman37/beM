# beM · SIM-MOTOR-04C

## Convergencia estadística con el detallado: rebote ofensivo, oportunidad interior y asistencias

**Destinatario:** Claude Code.  
**Repositorio autorizado:** exclusivamente `bateman37/beM`.  
**Fecha:** 24 de octubre de 2026.  
**Resultado:** implementación acotada, candidata explícita, comparación emparejada y archivos auditables para ChatGPT. Dennis conserva la aceptación manual y deportiva.

Dennis autoriza ejecutar este encargo para acercar las estadísticas y el comportamiento táctico de SIM a los del detallado. Conservamos el generador estadístico por tramos y el detallado congelado. La autorización incluye las correcciones de lectura, la continuación compacta tras rebote, las filas SIM y la búsqueda limitada especificadas aquí. No autoriza activar una candidata por defecto, modificar el deporte del detallado, fusionar la PR o ampliar indefinidamente la calibración.

Trabaja hasta completar implementación, comprobaciones y entrega. Cuando un objetivo numérico no se alcance, conserva la evidencia y termina los otros bloques. Un objetivo incumplido no autoriza ampliar la parrilla, manipular datos o cambiar las reglas de selección después de verlos.

## Índice

1. [Objetivo y decisiones vigentes](#1-objetivo-y-decisiones-vigentes)
2. [Base, Git y documentación](#2-base-git-y-documentación)
3. [Evidencia de entrada](#3-evidencia-de-entrada)
4. [C04C-01 · Lectores e identidad](#4-c04c-01--lectores-e-identidad)
5. [C04C-02 · Continuación tras rebote ofensivo](#5-c04c-02--continuación-tras-rebote-ofensivo)
6. [C04C-03 · Traducción de oportunidad y conversión interior](#6-c04c-03--traducción-de-oportunidad-y-conversión-interior)
7. [Filas administrables y búsqueda limitada](#7-filas-administrables-y-búsqueda-limitada)
8. [Selector y criterios de validación](#8-selector-y-criterios-de-validación)
9. [Campaña emparejada](#9-campaña-emparejada)
10. [Rendimiento y simultaneidad](#10-rendimiento-y-simultaneidad)
11. [Pruebas y recorrido manual](#11-pruebas-y-recorrido-manual)
12. [Archivos que debe recibir ChatGPT](#12-archivos-que-debe-recibir-chatgpt)
13. [Cierre y respuesta final](#13-cierre-y-respuesta-final)

## 1. Objetivo y decisiones vigentes

Buscamos que valorar un jugador, estudiar un rival o cambiar un plan tenga consecuencias coherentes en ambos modelos. No buscamos igualdad de marcadores o trayectorias entre SIM y detallado, ni copiar cada frecuencia provisional del detallado como si fuera una verdad empírica.

### 1.1. Esta entrega hace cinco cosas

| Bloque | Trabajo |
|---|---|
| Lectura | Separar canastas con pasador de asistencias acreditadas; corregir versión visible y medición extrema a extrema |
| Continuación | Permitir finalización inmediata o reinicio organizado tras rebote ofensivo, sin simular movimientos |
| Interior | Descomponer y, dentro de las filas autorizadas, aproximar oportunidad y conversión de `inside` sin esconderla en el promedio de 2P |
| Selección | Probar Z2+Q2 conjuntamente y unas pocas variantes completas, con reglas congeladas y tolerancias uniformes |
| Evidencia | Validación nueva pequeña, controles técnicos y paquetes suficientes para que ChatGPT haga el análisis posterior |

### 1.2. Se conserva

- Detallado de MOTOR-18C: referencia `20261016`, **83–98, 6.684 sorteos**, con su huella y archivos deportivos congelados.
- Detallado para sénior propio y encuentros asignados expresamente a visionado detallado; SIM para los demás, incluida cantera propia.
- Las 32 capacidades, sus diferencias entre jugadores y sus consumidores. No añadir atributos.
- Estilos, disposiciones, libro, prioridades, roles, director, organización/cobertura defensiva y familiaridad mantienen su efecto.
- Conocimiento congelado durante el encuentro; aprendizaje propuesto al terminar y aplicado una vez al encuentro lógico/equipo/copia pertinentes.
- Partidos simultáneos con reloj virtual común, publicación por fronteras y clasificación en directo; ninguna consulta revela el futuro privado.
- Simulada y Referencia comparten generación y dirección. El nivel de registro no cambia el deporte.
- Perfiles y candidatas se cargan explícitamente. No migrar archivos ni activar ajustes en silencio.

### 1.3. Límites

No crear otro motor, posiciones espaciales, simulación por segundo, cadenas de movimientos/pases, nuevas jugadas, mundo, ligas, mercado o pantallas extensas. No reabrir la rotación corregida, el gasto 3/3,5 ni las curvas de Forma, momentos y energía.

No calibrar en esta entrega robos, libres, ritmo, factor de triples, volumen de controles o plantillas. Se registran sus resultados y posibles regresiones, pero no se usan para compensar puntos que faltan en otros mecanismos.

No consultar otros repositorios, incluidos `v-apps`, Basket Manager y BeManager. Los antiguos adjuntos DESIGN/CLAUDE de otros proyectos no sustituyen las normas y el funcional actuales de beM.

Este encargo sustituye la selección secuencial y las guardas acumuladas de SIM-MOTOR-04B. Amplía de manera expresa el ajuste SIM a `inside`, con las condiciones y semillas de los apartados 6–8. No cambia las reglas o coeficientes del detallado.

## 2. Base, Git y documentación

### 2.1. Comprueba el estado real

Estado comunicado: PR #22 abierta, sin fusionar, con SIM-MOTOR-01–04B, rama `claude/busy-edison-b1fmnc`. Código final de la evidencia 04B: `48bcdefdb0f34238b6e86070692b9e19d8fd5d0a`.

Verifica PR, HEAD, base, árbol y normas reales (`AGENTS.md`, instrucciones vigentes, índices). No des por hecho que el estado comunicado sigue vigente.

1. Si #22 sigue abierta y contiene 04B, continúa sobre esa serie y actualiza título y descripción para incluir 04C.
2. Si ya se fusionó, parte de `main` actualizado y abre una PR de 04C.
3. Si se cerró sin fusionar, conserva los commits de la serie y abre la PR necesaria con su base real. No reconstruyas SIM desde un `main` que todavía no lo contenga.
4. Conserva trabajo ajeno. Usa un worktree del mismo beM si hace falta aislarlo. No hagas reset, limpieza o reescritura de historia ajena.
5. Sube el resultado y deja la PR abierta, sin fusionar ni suscribirte.

Lee de forma dirigida las notas de 04B, contratos SIM, política de asistencias y operaciones afectadas. Usa los índices y temas del funcional antes de leer el funcional íntegro.

### 2.2. Archivo y versiones

Archiva este prompt íntegro como `docs/prompts/SIM-MOTOR-04C-convergencia-estadistica.md`, sin sustituir prompts anteriores. Actualiza catálogo, `docs/estado.md`, changelog, temas afectados y `docs/tecnico/sim-motor04c.md`.

- Versión visible: **SIM-MOTOR-04C**. Corregir `APP_VERSION` es un cambio de identidad de aplicación autorizado.
- Revisión SIM propia, por ejemplo `0.3.2-SIMMOTOR04C`.
- Extensión de filas `SEM-SIM04C-20261024`, sin mutar las extensiones históricas.
- Identificar por separado app, implementación, perfil, candidata, dataset, política estadística y formatos.
- Un resultado histórico legible no pasa a ser continuable por compartir esquema. Los snapshots 04B se rechazan para continuación si no se demuestra equivalencia completa de futuro; conservar el archivo y explicar el motivo. No implantar un resolutor histórico en el producto.

Actualizar versiones y compatibilidad **antes** de congelar la campaña. Tras la congelación final solo se permite documentación/evidencia; si cambia implementación, identificar el nuevo código y comprobar lo afectado.

### 2.3. Identidades de comparación

| Identidad | Significado |
|---|---|
| DET | Detallado congelado, mismas fichas y planes de entrada del caso emparejado |
| B04B | Código 04B real con candidata 19,5 / 0,70 / 0,90 / 3 y las otras filas neutrales |
| N04C | Código nuevo con filas nuevas neutrales y los mismos cuatro valores; control de neutralidad |
| C04C-* | Vectores completos de búsqueda limitada |
| C04C-FINAL-PROVISIONAL | Elegido solo con CAL, pendiente de Dennis |

No mezclar una corrección, un ajuste numérico y una optimización al explicar una diferencia.

Los ZIP antiguos de `out/` pueden haber desaparecido. No inventarlos ni repetir toda su campaña. Este prompt incorpora los datos necesarios; para nuevos controles usa el código, las entradas congeladas disponibles y los generadores del mismo repositorio. Si reproduces evidencia histórica ausente, identifícala como ejecución nueva.

## 3. Evidencia de entrada

Estos datos proceden de la revisión independiente de los ZIP 04B. Son diagnóstico, no marcadores objetivo.

### 3.1. Anclas VAL de 04B

24 encuentros por modelo, 48 actuaciones de equipo; porcentajes desde sumas de numeradores y denominadores:

| Métrica | SIM R04B-N | DET |
|---|---:|---:|
| Puntos reales por actuación | 76,75 | 81,98 |
| FGA reales por actuación | 63,38 | 59,42 |
| 2P% | 49,97 % | 60,15 % |
| Acierto `inside`, excluido aro | 48,11 % | 59,30 % |
| 3P% | 37,83 % | 40,00 % |
| FT% | 80,03 % | 79,72 % |
| FTA | 12,63 | 13,25 |
| Parte de FGA al aro | 27,45 % | 36,57 % |
| AST_FG / FGM | 52,98 % | 69,42 % |
| AST_FG por actuación | 15,21 | 21,90 |

En `inside`, SIM clasificó como forzados 142/688 intentos; DET, 2/597. También existe diferencia dentro de la calidad normal. No corresponde concluir que el porcentaje de libres está bajo ni que basta subir todo el 2P%.

### 3.2. Exploración conjunta de ChatGPT en CAL

Se reprodujeron 24 controles exactos de 04B y se ejecutaron otros 24 casos con `rimWeightFactor=1,5` y `simRimQualityLogit=0,5`, sin otras modificaciones. Los 48 fueron válidos. Es desarrollo conocido, no reserva independiente.

| Error | Base | Conjunto Z2+Q2 |
|---|---:|---:|
| eP | 0,05864 | 0,05707 |
| eF | 0,05590 | 0,04771 |
| eZ | 0,19648 | 0,11273 |
| e2 | 0,08666 | 0,07429 |
| eR | 0,05846 | 0,03453 |
| eQ | 0,13193 | 0,05690 |
| eA | 0,16427 | 0,15218 |

La combinación mejora los siete errores anteriores, pero su acierto `inside` baja de 45,74 % a 43,25 %. Por eso se añade el indicador interior separado y no se acepta por su 2P agregado.

### 3.3. Asistencias y rebote

- La palanca de ventaja recibida solo tuvo 35 oportunidades en CAL. A1 produjo 3 asistencias de esa clase y A2, 4. No está desconectada; tiene alcance insuficiente para cubrir un desfase de unas 218 asistencias a igual número de canastas.
- SIM CAL: 416 FGA de `putback`, 204 canastas, 0 asistencias.
- DET CAL: 359 rebotes ofensivos individuales; 309 con un tiro posterior en la misma posesión y periodo; 251 de esos tiros son organizados; 108 asistencias acreditadas en esos tiros posteriores.
- DET VAL: 346 rebotes; 288 con tiro posterior; 226 organizados; 104 asistencias acreditadas.
- Esos tiros posteriores incluyen fallos con falta y no son exclusivamente FGA. No se infiere de estas cifras un porcentaje empírico de reinicio.

### 3.4. Lectura y coste

El lector contexto × zona × calidad contabilizó canastas con pasador como asistencias. CAL DET: 1.137 con pasador frente a 1.017 AST_FG reales; VAL: 1.179 frente a 1.051. El acta y el selector eA sí usan los créditos correctos.

Coste 04B en su sesión: lote F0 7,951 s, F1/F2 4,516/4,547 s; jornada 13,485 s; publicación máxima 1,356 s; cierre completo máximo 2,666 s; pico 1.291,8 MiB = 1,26 GiB. Primera pasada excluye preparación; el total extremo a extremo del ensayo alternado incluye espera de orquestación y debe corregirse.

## 4. C04C-01 · Lectores e identidad

### 4.1. Asistencia acreditada y pasador son columnas distintas

Reproducir la diferencia en los registros disponibles. En DET, enlazar `event_id` del tiro con `essential.acta.credits`, crédito `k=ast`, tipo `canasta`, o su equivalente actual. En SIM leer su crédito causal ya producido.

Publicar separadamente:

- Canastas con un pasador representado.
- Canastas con AST_FG acreditada.
- AST_FT y series elegibles, fuera del denominador FGM.
- Pases/recepciones elegibles antes del resultado, y causas de ausencia/ruptura de ventaja cuando estén conservadas.

La tabla diagnóstica de AST_FG por contexto/zona debe conciliar con el acta. `made && passer != null` solo puede etiquetarse como canasta con pasador. No cambiar créditos para hacer coincidir el lector.

Si un archivo antiguo no conserva un vínculo necesario, devolver `null` y causa. Se permite regenerar tablas desde registros existentes sin repetir los encuentros.

### 4.2. Contextos comparables

Conservar etiquetas nativas y un mapeo explícito. No equiparar automáticamente `continuidad` del detallado a todos los rebotes ofensivos ni imponer su 90 % de «organizado» a SIM. Para comparar después de rebote, usar el crédito de rebote, la continuidad y el tiro/resultado posterior.

Controles SIM, posesiones beM y finalizaciones no son el mismo denominador. Mantenerlos separados. Excluir FGA anulados y fallos con falta según la política vigente, conservando canastas con falta.

### 4.3. Versiones y cronómetros

Actualizar la cabecera y consola a 04C, sin cambiar por ello el perfil activo del usuario.

En benchmark alternado, medir espera de orquestación aparte: `totalFromNewProcessToWorldData` no puede incluir el tiempo esperando a que corra el control y presentarse como coste autónomo. El ensayo de primera apertura debe ser continuo, sin ese turno de espera. Preparación, calentamiento y petición al pool son fases diferentes.

## 5. C04C-02 · Continuación tras rebote ofensivo

### 5.1. Decisión compacta autorizada

Después de capturar un rebote ofensivo, elegir una sola vez entre:

| Rama | Comportamiento |
|---|---|
| Inmediata | Continuación cercana existente; sin heredar pase, ficha, director o bloqueador del tiro anterior |
| Reinicio organizado | Nuevo registro terminal dentro del mismo control; celdas organizadas admisibles del plan vigente, con sus participantes y créditos propios |

Fila nueva `rebound.organizedResetP0`, neutral 0. Valores 0/1 permiten comprobar extremos sin sorteo innecesario; para 0<p<1 consumir una decisión Bernoulli por rebote ofensivo válido. Seleccionar la rama antes de saber cómo termina la continuación.

No llamar al resolutor detallado ni construir pasos intermedios. El nuevo cálculo cabe en la continuación agregada existente.

### 5.2. Reinicio organizado

- Mantener el mismo equipo y control lógico; no sumar un nuevo control para producir más tiros.
- Conservar el reparto terminal vigente: pueden ocurrir pérdida, falta o tiro según sus reglas. No garantizar que el reinicio sea un tiro o una asistencia.
- Cuando corresponda finalización con celda, elegir únicamente del subconjunto organizado **ya admisible** del plan/quinteto actual, renormalizando sus pesos. No elegir transición por reaprovechar todo `s.cells`.
- Respetar prioridades, director, roles, funciones, oposición y conocimiento pertinentes. Ningún jugador fuera de pista o excluido puede participar.
- La ficha y sus participantes son los de la nueva resolución. No heredar la ventaja ni el pase anterior al rebote.
- Una asistencia exige un nuevo pase representado, pasador real distinto del tirador y continuación elegible. Se aplica la política existente, antes del acierto; no sortear créditos después de saber si hubo canasta.
- Si no hay celdas organizadas admisibles, mantener la continuación inmediata y registrar `reset_unavailable`; no fabricar una ficha ni trasladar la masa a una jugada incompatible.
- Aplicar también al rebote ofensivo tras último libre fallado cuando se conserve el ataque. Su procedencia queda separada. Rebote defensivo, tapón fuera y reanudación por banda no disparan esta decisión.
- Un segundo rebote ofensivo puede volver a elegir, con el guard técnico de cadena existente. Alcanzar ese guard es un fallo diagnosticado; nunca regalar el siguiente control al rival.

La rama inmediata mantiene la aproximación actual de participantes/finalización cercana. No reabrir en esta entrega quién debe ejecutar exactamente un palmeo.

### 5.3. Tiempo, tramos y exposición

SIM conserva su presupuesto agregado de controles y duración del tramo. Este cambio no introduce un reloj de posesión individual ni segundos adicionales ficticios para cada pase. Mantener instantes ordenados, frontera de periodo, exclusiones y publicación; no emitir acciones más allá del presente público o del periodo por añadir un reinicio.

Declarar la aproximación temporal: no presentar una continuación agregada como una simulación exacta de los 14 segundos posteriores a rebote. Tampoco sumar un segundo consumo completo de energía al tiempo vivo ya contabilizado.

La exposición de aprendizaje se registra por lo que realmente se produjo: la inmediata no hereda un bloqueo; el reinicio puede exponer su ficha/familia/roles propios. No dar aprendizaje instantáneo ni premiar dos veces el mismo hecho.

### 5.4. Trazabilidad mínima

En registro analítico/diagnóstico conservar vínculo con el rebote y rama, resultado de la continuación, familia/ficha si existe, finalizador, pasador y crédito. En esencial bastan contadores compactos por equipo y causa, además de las estadísticas comprometidas:

`offensive_rebounds → immediate / organized_reset / reset_unavailable → FGA / shooting_foul / turnover / other`, y AST_FG/AST_FT posteriores con sus denominadores.

Contar decisiones de rama, no cadenas enteras como si fueran un único rebote. No contar rebotes defensivos. Las consultas no consumen azar.

Con probabilidad 0, no introducir sorteos ni reconstrucciones deportivas nuevas. Su control neutral debe conservar la trayectoria de 04B salvo metadatos de implementación separados.

Si antes de estas filas se demuestra y corrige una traducción deportiva defectuosa dentro del alcance, aislar esa corrección con su reproducción y diferencias frente a B04B. En ese caso, la neutralidad de las filas nuevas se comprueba contra el camino ya corregido previo a añadirlas; no se exige borrar una corrección real para recuperar un marcador histórico. N04C identifica con claridad esa base corregida. No usar esta excepción para justificar ajustes numéricos como si fueran defectos.

## 6. C04C-03 · Traducción de oportunidad y conversión interior

### 6.1. Descomposición obligatoria, pequeña

Antes de activar ajustes interiores, publicar para `rim` e `inside`, separados:

- Peso de selección y calidad cómoda/normal/forzada.
- FGA/FGM, fallos con falta, canastas con falta, tapones.
- Contexto nativo y posterior a rebote.
- Ejecutante y atributos/recetas efectivos; grupo de oposición realmente utilizado.
- En diagnósticos seleccionados, probabilidad de tiro ya calculada y su condición —por ejemplo, condicional a ausencia de tapón—; no convertir una probabilidad condicional en tasa global esperada.

Si se demuestra una duplicación o traducción incorrecta, corregirla y aislar su efecto antes de ajustar. No inventar un defecto para justificar un coeficiente. Si es una aproximación estadística, nombrarla como tal.

### 6.2. Ajuste de calidad de `inside`

Se autoriza `opportunity.simInsideQualityLogit`, neutral 0, exclusivo de la zona `inside`, antes de sortear calidad, aplicado una sola vez. Valores de búsqueda 0,5 y 1,0.

Reutilizar el mecanismo SIM de desplazamiento de calidad ya usado para aro, con objetos separados por zona. No cambiar `rim`, media o triple, no mutar por alias una calidad compartida y no duplicar familiaridad, ayudas o momentos.

No crear una oportunidad o zona que la ficha no admite. El ajuste cambia la distribución de calidad de celdas existentes y conserva diferencias de jugadores y planes.

### 6.3. Ajuste de conversión interior, condicionado y limitado

Se autoriza una segunda fila **solo de traducción SIM**, `conversion.simInsideLogitOffset`, neutral 0, si después del reinicio y del ajuste de calidad persiste una diferencia de conversión dentro de calidad normal que active la condición del apartado 7.

- Se suma una vez al logit ya formado del tiro `inside`, antes de la logística y de la perturbación de probabilidad de momento vigente.
- No modificar `shots.*.p0`, recetas, pendientes de atributos u oposición, probabilidad de tapón, acierto de libres ni el código del detallado.
- Neutral 0 conserva exactamente la operación anterior. Valores de búsqueda 0,15 y 0,30.
- No aplicar al aro ni al resto de zonas. Registrar el término como `delta_sim_inside`, separado del efecto táctico y de la calidad.
- Mantener respuesta de capacidades, preparación, fatiga, defensa y roles. No fijar una probabilidad final común para todos los jugadores.

Si un estimador de acierto de SIM utiliza ese mismo logit para valorar opciones antes de elegir, incorporar allí el término pertinente de manera coherente con la condición que estima. No aplicar dos veces el desplazamiento ni convertir una estimación de calidad neutra en el resultado futuro del tiro. Registrar dónde se aplica.

Es un coeficiente provisional de calibración de la traducción agregada, no una regla deportiva, una ventaja táctica observada o un arreglo acreditado. Este permiso sustituye para esta fila concreta la exclusión de ajustes de acierto de 04B; sigue prohibido subir genéricamente todo el 2P%.

Si la condición no se cumple, mantener 0 y omitir esa etapa. No sustituirla por otra fila o más candidatos.

## 7. Filas administrables y búsqueda limitada

### 7.1. Filas y neutros

| Fila | Neutral de código | Dominio editable | Evaluación autorizada |
|---|---:|---|---|
| `rebound.organizedResetP0` | 0 | [0,1] | 0; 0,35; 0,65; 0,85 |
| `opportunity.simInsideQualityLogit` | 0 | [0,1] logit | 0; 0,5; 1,0 |
| `conversion.simInsideLogitOffset` | 0 | 0 ≤ valor ≤ 0,30 logit | 0; 0,15; 0,30, solo con condición |

Todas son **SEM04C elegidas en este encargo**, sin calibración externa. Exponerlas en el panel existente con unidad, procedencia, explicación, neutro y validación finita. No imponer automáticamente una candidata al abrir.

Se fijan durante toda la búsqueda:

`volume.neutralSecondsPerControl=19,5`, `shotMix.threeWeightFactor=0,70`, `assist.eligibleFinalPassP0=0,90`, `energy.costPerLiveMinute=3`, `assist.receivedAdvantageP0=0`.

### 7.2. Hasta ocho vectores adicionales completos

N04C conserva aro=1, calidad de aro=0 y las tres filas nuevas a 0. Ejecutar después:

| Identidad | Peso aro | Calidad aro | Reinicio | Calidad inside | Conversión inside |
|---|---:|---:|---:|---:|---:|
| J0 | 1,5 | 0,5 | 0 | 0 | 0 |
| R35 | 1,5 | 0,5 | 0,35 | 0 | 0 |
| R65 | 1,5 | 0,5 | 0,65 | 0 | 0 |
| R85 | 1,5 | 0,5 | 0,85 | 0 | 0 |
| I50 | Del punto de trabajo R | | | 0,5 | 0 |
| I100 | Del mismo punto R | | | 1,0 | 0 |
| P15 | Del punto de trabajo I | | | | 0,15 |
| P30 | Del mismo punto I | | | | 0,30 |

Cada archivo declara el vector completo, padre y diferencias. No interpretar las celdas vacías como 0: I50/I100 heredan las otras filas del punto R; P15/P30 las del punto I. No hacer el producto cartesiano.

**Punto de trabajo R:** menor puntuación M del apartado 8 entre J0/R35/R65/R85, con el mismo desempate del selector final. Puede incumplir todavía una guarda estadística: sirve para explorar la corrección interior, no para activarse. Debe tener todos los errores evaluados e invariantes correctas. No abortar etapas porque una variación secundaria mínima bloquee un vector intermedio.

**Etapa I:** ejecutar I50/I100 si el punto R tiene `eI>0,05` o diferencia absoluta de proporción de calidad forzada de `inside` >0,05. Si no, omitir. Punto I = menor M entre punto R y los I ejecutados, con los mismos requisitos y desempate. Si no existe punto de trabajo calculable y técnicamente válido, omitir las etapas dependientes y declarar el motivo.

**Etapa P:** ejecutar P15/P30 solamente si el punto I tiene `eI>0,05`, hay al menos 80 FGA `inside` de calidad normal por modelo en CAL y `FG%_DET_normal_inside − FG%_SIM_normal_inside >0,03`. Informar numeradores. Si faltan denominadores o no se cumple, omitir. Esta condición es una regla funcional de búsqueda, no significación estadística.

La admisibilidad final se calcula al terminar sobre **todos los vectores completos ejecutados**, frente a N04C. Los puntos intermedios no son ganadores aceptados ni multiplican tolerancias. Máximo ocho adicionales; una omisión no concede intentos extra.

## 8. Selector y criterios de validación

### 8.1. Métricas y bandas provisionales

Sobre los mismos casos de cada modelo:

| Error | Definición | Banda orientativa b |
|---|---|---:|
| eP | `abs(meanPTS40_SIM / meanPTS40_DET − 1)` | 0,08 |
| eF | `abs(meanFGA40_SIM / meanFGA40_DET − 1)` | 0,08 |
| eZ | Suma de diferencias absolutas de cuota FGA en las cuatro zonas | 0,10 |
| e2 | Diferencia absoluta de 2PM/2PA agregados | 0,04 |
| eR | Diferencia absoluta de acierto `rim` | 0,05 |
| eI | Diferencia absoluta de acierto `inside`, sin aro | 0,05 |
| eQ | Diferencia absoluta de FGA al aro de calidad forzada / FGA al aro | 0,05 |
| eA | Diferencia absoluta de AST_FG/FGM | 0,08 |

Informar además calidad forzada de `inside`, 3P%, FT%, volumen de libres, pérdidas, robos, rebote ofensivo con denominador, minutos/uso, familias, dispersión, prórrogas y jerarquía por equipo. Sus resultados no desaparecen porque mejore M.

PTS40 y FGA40 se normalizan por actuación con la duración propia. Conservar también medias reales y sin prórroga. Para proporciones sumar numeradores/denominadores. Diferencia de 0,01 son un punto porcentual, no 1 % relativo. Denominador nulo: `null` y no evaluado, nunca cero.

### 8.2. Guardas uniformes contra N04C

Para un vector completo, con error inicial e0:

- eP/eF: `e ≤ max(0,08; e0+0,02)`.
- eZ: `e ≤ e0+0,02`.
- e2: `e ≤ max(0,04; e0+0,015)`.
- eR/eI/eQ: `e ≤ max(0,05; e0+0,02)`.
- eA: `e ≤ max(0,08; e0+0,02)`.
- Error de 3P%: `e3 ≤ max(0,05; e3_0+0,015)`.
- Error de FT%: `eFT ≤ max(0,04; eFT_0+0,02)`.

No hay una segunda guarda acumulada de tolerancia cero. Todas se refieren al mismo N04C; no se acumulan márgenes entre etapas. Las guardas son provisionales de producto, no intervalos de confianza.

Invariantes de créditos, sujetos válidos, tiempo, identidad, exclusión, conciliación, no filtración del futuro y aprendizaje no admiten tolerancia estadística.

### 8.3. Selección mecánica

Definir `M = max(eP/0,08; eF/0,08; eZ/0,10; e2/0,04; eR/0,05; eI/0,05; eQ/0,05; eA/0,08)`.

Conservar componentes y señalar qué error domina. Se minimiza el peor desfase normalizado; no sumar pérdidas que oculten un error interior mediante puntos o triples.

1. Descartar del conjunto final los vectores que fallen una guarda, tengan errores necesarios no evaluados o incumplan invariantes.
2. Elegir menor M entre los admisibles; exigir mejora relativa ≥5 % frente a N04C para proponer cambio.
3. En empate con precisión 1e-9, menor número de filas distintas de N04C, menor suma de diferencias divididas por el rango autorizado de cada fila y después identificador lexicográfico.
4. Si no hay mejora admisible, conservar N04C y entregar mejores alternativas con sus causas de descarte. No aumentar presupuesto o retocar reglas.

Congelar reglas, condiciones de etapas, agenda y hash **antes de CAL**. Congelar vector final y código deportivo antes de VAL.

### 8.4. Validación no elige

VAL compara N04C, candidata fijada y DET. Se consideran las mismas bandas y guardas como señales de aceptación provisional, sin reajustar con VAL. Mostrar si mejoran eA/e2/eI, si eZ/eQ mantienen las mejoras y si empeora un contexto o tipo de equipo.

Etiquetar con honestidad: mejora en CAL, confirmada/contradicha/inconclusa en VAL, indicadores aún fuera de banda y exposición insuficiente. Una candidata con M>1 no satisface todas las bandas aunque sea mejor.

Si hay un fallo técnico, conservar registro e incidencia y corregirlo dentro del alcance. Identificar nueva congelación y repeticiones. Si cambia el deporte después de haber leído VAL, esa reserva deja de ser independiente: no seguir llamándola validación ciega ni iniciar una búsqueda nueva con ella.

## 9. Campaña emparejada

### 9.1. Semillas e inputs

Generar y archivar antes de ejecutar entradas materializadas, planes efectivos, agenda, semilla completa/32 bits, hash de entrada sin semilla y con ella. Misma entrada y semilla por caso entre vectores y modelos. Igual semilla entre resolutores distintos no implica igualdad de sorteos ni convierte los tiros en observaciones emparejadas.

Para casos nuevos, clave UTF-8 `20261024|SIM04C|<bloque>|<caso>|R<replica>`. SHA-256, primeros 32 bits big endian; sustituir 0 por 1. Resolver colisiones determinísticamente con `#2`, `#3` y registrar ordinal. No introducir identidad de candidata o motor en la clave del mismo caso.

En CONTRAST, `<caso>` identifica factor y orientación; V0/V1 comparten intencionalmente la misma clave de semilla, aunque sus entradas y sus identificadores de ejecución sean diferentes. Registrar ese emparejamiento, no resolverlo como una colisión accidental.

### 9.2. Bloques cerrados

| Bloque | Casos lógicos | Ejecuciones previstas |
|---|---:|---|
| CAL | 24 | B04B y N04C: 24 SIM cada uno; hasta 8 adicionales ×24 SIM; DET 24 |
| VAL nueva | 48 | N04C y candidata: 48 SIM cada uno; DET 48 |
| CONTRAST | 16 | N04C y candidata: 16 SIM cada uno; DET en 8 anclas |
| DIAG | 4 casos VAL por modelo | Conservar diagnóstico al ejecutarlos; si la infraestructura exige repetir, declarar como máximo 4 SIM+4 DET extras |
| TECH | 6 entradas, 3 recorridos | 18 SIM, con control entre recorridos |

Si la candidata final es N04C, reutilizar sus resultados y declarar el alias; no simular otra vez para inflar la muestra.

**CAL:** reutilizar las 24 entradas CAL de 04B si están congeladas en el repositorio. No depender de que persistan sus resultados `out/`. Si faltan entradas, reconstruir con el mismo generador/código del mismo repositorio y su regla de semillas, anotando la reproducción; no sustituir por datos supuestos de los ZIP.

**VAL:** doce parejas no ordenadas nuevas: `(01,03), (03,05), (05,07), (07,09), (09,11), (11,01), (02,04), (04,06), (06,08), (08,10), (10,12), (12,02)`, donde 01 significa EQ01. Dos orientaciones y dos réplicas =48 casos. Planes naturales y fichas originales de los doce equipos. Usar las semillas nuevas de este apartado. La coincidencia de algún rival con una campaña pasada no permite reutilizar su marcador.

**CONTRAST:** reutilizar las definiciones actuales T01 —rebote/balance—, T02 —interior/exterior—, T05 —lectura del director— y T07 —familiaridad organizada— de 04B. V0/V1 × dos orientaciones × cuatro factores =16 entradas. DET solo en una orientación predeclarada de cada V0/V1 =8. No recalibrar estas definiciones. Misma semilla V0/V1 por pareja y orientación; tratarla como repetición intencional en el registro de colisiones.

**DIAG:** primeras cuatro entradas VAL en orden de agenda, cubriendo ambas réplicas de al menos una pareja. Elegirlas antes de leer resultados, no porque salgan mal. Conservar probabilidades nativas existentes, calidad y cadena posterior a rebote; en DET solo lo que su registro ya permite sin modificarlo.

**TECH:** seis entradas CAL predeclaradas con candidata; recorrido automático, avance por fronteras y guardar/recuperar con consultas intermedias. Conservar en alguna recuperación un sufijo generado privado. Igualdad de trayectoria entre recorridos, no igualdad SIM/DET.

### 9.3. Recuento y disciplina

Registrar solicitado, ejecutado, terminado, válido, no válido, fallido, interrumpido, reintento y no ejecutado, por bloque/modelo/vector. Fallos no tienen derrota ni marcador inventado. Mantener incidencias; no retirarlas silenciosamente del índice.

CAL máximo: 240 SIM y 24 DET. VAL: hasta 96 SIM y 48 DET. CONTRAST: hasta 32 SIM y 8 DET. TECH:18 SIM. Diagnósticos pueden estar incluidos; repeticiones adicionales se cuentan aparte. Benchmark, navegador y pruebas no son observaciones de calibración.

No lanzar otra campaña de miles de detallados ni reconstruir MOTOR-16. Si una fila queda sin exposición, conservar el no evaluado en vez de abrir una campaña adicional por ella.

## 10. Rendimiento y simultaneidad

El foco de 04C es deportivo. Corregir el cronómetro, medir el efecto del cambio y conservar la reutilización de pools existente. No iniciar otra reescritura de workers, retirar salidas o alterar el deporte para conseguir cinco segundos.

### 10.1. Ensayo limitado de coste

Preparar dos agendas de 1.000 encuentros con los mismos arquetipos de juego, pero semillas distintas entre agenda A y B. Usar clubes instanciados con identidades independientes: **2.000 clubes y sus jugadores remapeados por agenda**, un único partido por club en esa jornada. Reutilizar los doce arquetipos como fuente de fichas/planes, sin cambiar atributos para el benchmark. No presentar mil cruces de doce identidades reutilizadas como el coste ya acreditado del mundo.

Instanciar mediante las funciones válidas existentes o un generador de fixtures de benchmark que remapee todas las referencias de plan/jugador y valide las entradas. No crear un módulo nuevo de mundo. La materialización/preparación también se mide; no esconderla fuera de todo cronómetro.

Ejecutar como máximo:

1. B04B: apertura directa, agenda A de mil y después agenda B de mil con el pool reutilizado.
2. Código final con candidata: mismo recorrido y mismas agendas, en proceso nuevo separado, sin trabajo simultáneo del otro benchmark.
3. Una jornada final de mil con agenda A, reloj común, barreras de 120 s y actas esenciales finales. No ejecutar otra jornada de control para reconstruir cifras históricas ausentes.

Total de rendimiento previsto: 4.000 partidos de lote y 1.000 de jornada, separados de la calibración. Declarar los calentamientos adicionales, si existen, con su coste y número; no incluirlos entre los mil y no ocultarlos al medir apertura.

### 10.2. Medidas

- Máquina, CPU disponibles, Node, memoria y flags de runtime.
- Materialización de fixtures, carga, contexto/tablas, preparación/calentar workers.
- Primera solicitud y solicitud reutilizada → esenciales individuales validados en el coordinador.
- Serialización, persistencia y estadísticas anuales utilizables; total continuo desde apertura.
- Jornada: total coordinado, mediana/p95/máximo de publicación y de barrera completa, sellado, memoria RSS máxima del proceso y bytes.
- Correspondencia por caso de entradas, perfil y resultados; sin caché de resultados.

Mantener objetivos de 5 s para lote de mil con cuatro workers preparados, 1 s de publicación máxima y 1,5 GiB RSS para jornada. La apertura continua se informa además, sin confundirla con el objetivo de fase. Si no se cumplen, entregar distancia y causa observada, sin redefinir el objetivo como cumplido en caliente.

La mayor diversidad de identidades puede cambiar coste y memoria respecto al benchmark antiguo. Explicar esa diferencia de carga; no atribuirla automáticamente a una regresión de las nuevas filas ni extrapolar tiempos entre máquinas.

### 10.3. Contratos que deben seguir funcionando

Jornada mixta pequeña con un detallado y dos SIM, clasificación inicial/provisional/final, orden manual autorizada, un terminado y otro activo al guardar y recuperación tras recarga. Sin resultados futuros filtrados ni mensajes de aprendizaje duplicados.

Conservar cierre y liberación idempotentes, historia anual por jugador/club/competición y exposición posterior a rebote. Las consultas no cambian azar o resultado. No es necesario construir un campeonato nuevo para comprobarlo.

## 11. Pruebas y recorrido manual

Pruebas automáticas nuevas justas, centradas en los caminos cambiados. Agrupar sin duplicar toda la suite histórica:

1. Neutralidad: nuevas filas a 0, sin nuevo azar ni cambio deportivo respecto al camino equivalente anterior; contrastar B04B/N04C en CAL y aislar cualquier corrección deportiva demostrada conforme al apartado 5.4. Separar metadatos de huella si la versión entra en ella.
2. Reinicio 0/1 por el camino real, participantes válidos, pérdida/falta/tiro posibles; ausencia de celdas organizada con fallback declarado.
3. Cadena tras rebote: sin duplicar control/finalización, pase anterior borrado, AST solo con productor nuevo; incluir último libre fallado y otro rebote.
4. Crédito vs pasador: un caso con ruptura causal debe diferenciar columnas y conciliar con acta. Regenerar tablas no cambia el encuentro.
5. Calidad/conversión: se aplican una vez y solo a `inside`; neutralidad, independencia entre objetos de zonas y mantenimiento de respuesta a atributos/oposición.
6. Guardado/cierre y presente público de las nuevas continuaciones, sin duplicar aprendizaje al repetir aplicación lógica.
7. Selector: candidatos conjuntos, puntos intermedios no aceptados, guardas uniformes, condición de etapas, denominadores nulos y rechazo de una mejora agregada que infrinja la guarda interior.
8. Compatibilidad e identidad visible: archivo antiguo rechazado sin tocarlo y perfil activo sin activación silenciosa.

Añadir únicamente las regresiones necesarias si aparece un defecto demostrado. Reutilizar comprobadores de acta, exposición, determinismo y tablas. No escribir una prueba por cada fila numérica del informe.

Ejecutar la suite completa una vez sobre el código final, `data:check` y comprobador documental en copia limpia. Si después cambia implementación, ejecutar lo afectado y la verificación final apropiada; no repetir la suite por cambios exclusivamente documentales.

Recorrido automático de navegador pequeño: selección de motor, versión, carga explícita de candidata, parámetros nuevos, partido y análisis con crédito correcto, guardado/recuperación, jornada mixta y descarga real. No recorrer 60 pantallas ni lanzar mil partidos desde Chromium. Dennis hará la aceptación manual.

Crear `docs/prompts/SIM-MOTOR-04C-recorrido-manual.md` con unos 10 pasos, semillas, perfil requerido, resultado observable y señales de fallo. No usar un marcador concreto como criterio deportivo.

## 12. Archivos que debe recibir ChatGPT

### 12.1. Cuatro archivos finales

En `out/sim-motor04c/entrega-final/`, fuera de Git:

1. **`SIM-MOTOR-04C-revision-rapida.zip`**, objetivo ≤2 MiB: tablas suficientes para analizar sin abrir toda la evidencia.
2. **`SIM-MOTOR-04C-evidencia-detallada.zip`**, objetivo ≤60 MiB; si supera ese tamaño, partes de ≤60 MiB con índice. Partir por archivos/casos completos cuando sea posible.
3. **`SIM-MOTOR-04C-indice-partes.json`**, tamaños y SHA-256 de los ZIP, identidades y contenido por parte.
4. **`SIM-MOTOR-04C-verificacion-final.json`**, recibo fuera de los ZIP comprobados.

### 12.2. Contenido del rápido

| Archivo o grupo | Contenido requerido |
|---|---|
| `00-LEEME.md` | Estado real, orden de lectura, decisiones, límites y qué no se evaluó |
| `01-IDENTIDAD.json` | Base/commits, versiones, congelaciones, árboles e inventarios deportivos |
| `02-CAMBIOS.csv` | Lectura, mecanismo, ajuste numérico o metadato; efecto esperado y comprobación |
| `03-VECTORES-Y-REGLAS.json` | Todos los vectores completos, condiciones, omisiones, reglas y hashes |
| `04-AGENDA-Y-RECUENTO.csv` | Casos, bloques, réplicas, modelos, nivel y estado real |
| `05-RESULTADOS-EQUIPO.csv` | Una fila por ejecución y equipo, sin alias duplicados como muestra |
| `06-CAL-SELECCION.json` | Numeradores, ocho errores, guardas, M, puntos de trabajo y decisión final rederivables |
| `07-VAL-RESUMEN.csv` | N04C/candidata/DET sobre las mismas entradas; diferencias, bandas y numeradores |
| `08-CONTEXTO-ZONA-CALIDAD.csv.gz` | Intentos/aciertos, tiro con falta, canasta con pasador y AST acreditada; nativo y mapeado |
| `09-REBOTE-Y-ASISTENCIAS.csv` | Embudo de rama, elegibilidad/pase/crédito; causa y denominadores, antes y después de rebote |
| `10-USO-Y-CONTRASTES.csv` | Uso/minutos/concentración y deltas de cuatro factores, sin confundir señal con efecto medio demostrado |
| `11-RENDIMIENTO.json` | Mediciones reales y fases, identidades diversas, objetivos y distancias |
| `12-COMPROBACIONES.json` | Neutralidad, TECH, conciliaciones, aprendizaje, historial y jornada mixta |
| `13-LIMITES-Y-DECISIONES.md` | Diferencias residuales y preguntas concretas; sin aprobación deportiva automática |
| `DICCIONARIO.md` | Columnas, unidades, denominadores, nulos, flags y mapeos |

Si hay alias, declararlos en una tabla independiente. La identidad global de registro debe incluir campaña, vector/modelo, caso, intento y equipo; conservar ID lógico del partido para idempotencia y no confundirlo con el intento técnico.

Desglosar puntos/tiros/eficiencia por zona y contexto, tiros de los principales anotadores, minutos y distribución de puntos. Incluir rebote ofensivo como `ORB / (ORB + DREB_rival)` además de su volumen; AST_FG/FGM además de AST por encuentro. Las tablas ya construidas del laboratorio pueden reutilizarse.

### 12.3. Contenido del detalle

- Entradas congeladas, agendas y semillas completas, perfil efectivo y vectores.
- Registros esenciales nuevos de todos los encuentros de campaña y los diagnósticos seleccionados; no logs masivos de todos los partidos de benchmark.
- Registros existentes reutilizados que sean necesarios para una afirmación, o su ausencia declarada; nunca ZIP históricos ficticios.
- Tablas individuales, zonas, familias, quintetos y evolución disponibles, sin inventar dimensiones que SIM no representa.
- Instrumentos de lectura/selección y comprobador con dependencias transitivas. Una copia de código suficiente para reproducir lo prometido, con alcance claro; no llamarlo checkout completo si no lo es.
- Medición bruta de rendimiento por fase/caso y resultados de pruebas/recorrido.
- Plan, congelaciones y todas las incidencias, incluidos casos descartados y reejecutados.

Cuando un campo no existe, `null` con causa: no conservado, no instrumentado, no representado, no expuesto o no ejecutado son situaciones distintas.

### 12.4. Comprobador offline

Una orden documentada verifica los bytes finales sin simular de nuevo: ZIP/manifiestos, parseo, conteos, entradas/semillas, actas y tablas, créditos/contextos, embudo de rebote, selección desde numeradores, vector realmente usado en VAL y coste, y dependencias.

Debe detectar al menos una alteración de hash y una inconsistencia de numerador en una copia de prueba. No modificar los ZIP finales para probar el rechazo. Enumerar no evaluados; nunca contarlos como aprobados.

Confirma que los archivos existen y se pueden descargar. Adjuntarlos realmente si la plataforma lo permite. Si solo existen en el contenedor, dilo y da su ruta exacta y cómo obtenerlos; no afirmar «adjuntos» sin haberlos adjuntado. Recordar que `out/` no se conserva en Git.

## 13. Cierre y respuesta final

ChatGPT hará el análisis deportivo profundo sobre los archivos. Tu informe debe ser factual y breve, además del resultado mecánico del selector. No gastar otra fase en redactar una interpretación extensa de cada gráfico ni iniciar investigación externa FIBA/ACB en esta entrega.

Responder con:

1. PR/rama/base, commit de código final y estado real de fusión.
2. Qué se corrigió y qué cambia trayectorias. Referencia y archivos del detallado conservados.
3. Vector provisional elegido, condiciones omitidas/activadas, valores y si todos los errores entran o no en banda.
4. Tabla CAL/VAL de los ocho errores, más `inside` forzada, AST_FG/FGM y rama posterior al rebote. Explicar cualquier contradicción sin reajustar VAL.
5. Cantidades reales, fallos, repeticiones y extras separados.
6. Rendimiento de primera solicitud y reutilizada, total de apertura, publicación/cierre completos y memoria. Objetivos cumplidos/incumplidos.
7. Pruebas ejecutadas, navegador, no ejecutado y recorrido manual pendiente de Dennis.
8. Los cuatro archivos reales con tamaño y orden de envío: rápido, índice/recibo y detalle si ChatGPT lo necesita.

No declarar «calibrado», «estadísticamente equivalente», «aceptado por Dennis», «conforme FIBA integralmente» o «objetivo de cinco segundos resuelto» por pasar controles de coherencia o unas semillas. Si quedan diferencias, dejar una candidata útil con datos verificables y el alcance de esas diferencias.

**Resultado buscado:** una traducción SIM más próxima al detallado en zonas, oportunidad interior, circulación posterior al rebote y asistencias, conservando dirección táctica, estadísticas individuales, velocidad y simultaneidad. Implementación pequeña, búsqueda acotada y evidencia lista para decidir juntos el cierre deportivo.
