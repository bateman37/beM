<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: jugadores](README.md) · Capítulo 14 — Forma, momento, consistencia y presión · parte 1 de 2
> Anterior: [c13-tiempo-esfuerzo-y-energia](../simulacion/c13-tiempo-esfuerzo-y-energia.md) · Siguiente: [c14-p02-catalogo-de-episodios-y-actualizacion-de-estados](c14-p02-catalogo-de-episodios-y-actualizacion-de-estados.md)
<!-- beM:nav-fin -->

<a id="cap-14"></a>

## 14. Forma, momento, consistencia y presión

Rigen M-TIR, M-OFE y M-DEF y un T por equipo. T se limita a coordinación, atención compartida y elección, sin contribución directa a conversión de tiro. La Forma permanece estable dentro del encuentro; Consistencia no añade talento medio por sí sola.

<a id="grupo-14-01"></a>

### 14.1. Forma, momento individual, consistencia y presión

*Procedencia: MD05, §9.*

<a id="src-md05-l0553"></a>

#### 14.1.1. Separación de los estados

*Origen: MD05 §9.1.*

| Elemento | Qué representa | Horizonte | Qué no debe sustituir |
|---|---|---|---|
| Energía | Reserva de esfuerzo actual. | Dentro del partido y recuperación entre encuentros. | Talento, forma o experiencia. |
| Forma | Rendimiento temporal persistente alrededor de la capacidad. | Semanas o etapas, incluso prolongadas. | Nota permanente o premio automático a una buena acta. |
| Momento individual | Altibajo breve y pertinente por ámbito. | Tramos del encuentro. | Batería o mejora de las 32 capacidades. |
| Momento colectivo | Estado breve de respuesta y coordinación del equipo. | Tramos del encuentro. | Racha de marcador, química de temporada o talento compartido. |
| Presión | Exigencia del contexto. | Importancia del partido y situación actual. | Otro estado de habilidad acumulable. |
| Consistencia | Capacidad que regula variación. | Perfil estable del jugador. | Bonificación a la media de talento. |

La separación es funcional; no obliga a una pantalla llena de medidores exactos. La información visible respeta los niveles de conocimiento del apartado 14.

<a id="src-md05-l0566"></a>

#### 14.1.2. Forma cerrada como estado persistente

*Origen: MD05 §9.2.*

La forma es continua, acotada y persistente entre partidos. El motor la recibe al inicio y la mantiene estable durante ese encuentro. El cansancio y el momento explican variación intrapartido sin modificar la forma sobre la marcha.

Puede permitir una etapa muy buena o mala, incluso una temporada por encima de lo habitual. No se reinicia al cambiar de año deportivo. No todo rendimiento extraordinario tiene que venir de forma: pueden haber cambiado rol, oportunidades, compañeros u oposición.

La evolución entre encuentros utiliza tiempo de calendario e inputs declarados del manager. No se actualiza mediante «anotó mucho, por tanto sube forma» ni «perdió, por tanto baja». Eso crearía una retroalimentación que convierte el resultado en causa automática del siguiente.

La sensibilidad ofensiva anterior de hasta ±0,35 logit se conserva solamente como semilla. Cada ámbito debe declarar su efecto. Una buena forma no transforma una incapacidad técnica en especialidad ni garantiza que un 12 supere a un 18 en cualquier contexto; permite variación de rendimiento compatible con sus diferencias y oportunidades.

<a id="src-md05-l0598"></a>

#### 14.1.3. Consistencia, neutralidad e ilustración matemática

*Origen: MD05 §9.5.*

Mayor Consistencia reduce variaciones injustificadas alrededor del nivel esperado; no añade una segunda mejora permanente a la habilidad. Menor Consistencia permite tramos más extremos, sin conceder por diseño un promedio mayor.

La neutralidad media se verifica en contextos controlados. Un ruido centrado antes de una logística no garantiza por sí solo una probabilidad media igual, porque la transformación es no lineal. La parametrización debe corregir ese efecto o utilizar una construcción que conserve el centro de referencia.

Una vía posible para una tarea binaria fija es un ajuste acotado directamente en probabilidad: `p' = p + a × M × min(p, 1 − p)`, con `M` centrado y acotado y `a < 1`. Es una ilustración matemática, no una fórmula cerrada para todos los desenlaces. Las distribuciones conjuntas deben seguir siendo coherentes.

En partidos reales del juego puede haber efectos indirectos: más riesgo, selección diferente o respuesta defensiva. La auditoría distingue esos efectos de una bonificación involuntaria a la media de conversión bajo contexto fijo.

<a id="src-md05-l0608"></a>

#### 14.1.4. Presión

*Origen: MD05 §9.6.*

La presión combina importancia del partido y tensión de la situación. Se adopta inicialmente el máximo de ambas señales, acotado, para evitar sumarlas dos veces como exigencias completas equivalentes.

Las categorías de competición son entradas comprensibles; la intensidad puede ser continua. La tensión considera reloj, margen y tarea pertinente. La ventana estadística «final ajustado» no delimita toda la presión: una acción importante puede ocurrir antes.

Rendimiento bajo presión ayuda a preservar decisión y ejecución bajo exigencia. No añade talento universal ni una bonificación por jugar una final. La capacidad técnica y la oposición siguen siendo necesarias.

La magnitud por tarea y la curva de resistencia a presión son parámetros del panel. La exigencia se aplica donde corresponde una vez, sin repetirla en cada fase lógica de la misma ejecución.

<a id="grupo-14-02"></a>

### 14.2. Momento colectivo y jugadores que dan vida al equipo

*Procedencia: MD05, §10.*

<a id="src-md05-l0657"></a>

#### 14.2.1. Jugadores que dan vida al equipo

*Origen: MD05 §10.4.*

Debe poder ocurrir que un jugador mejore la respuesta colectiva estando en pista: un director que ordena, un defensor que organiza una ayuda o un participante que encadena acciones útiles y facilita la respuesta de los demás.

Se expresa mediante **funciones y acontecimientos reales**, utilizando las capacidades existentes, especialmente Comprensión táctica, Decisiones, Anticipación, Concentración y las técnicas pertinentes; Visión cuando debe percibir opciones; Consistencia y Rendimiento bajo presión según el ámbito.

| Manifestación | Mecanismo funcional | Qué no se añade |
|---|---|---|
| Director reorganiza tras pérdidas | Tarea pertinente de lectura/organización y órdenes compartidas. | Bonus por ser nominalmente base. |
| Referencia defensiva facilita respuesta | Responsabilidad, ayuda o comunicación funcional representada al resolver. | Aumento general de Defensa de los compañeros. |
| Jugador activa al grupo con esfuerzo útil | Hecho significativo e impulso colectivo acotado. | Carisma oculto o premio por cualquier rebote. |
| Especialista estabiliza una tarea | Mejor ejecución real reduce desorden y conserva opciones. | Talento prestado al resto de la plantilla. |

No se incorpora una nueva capacidad de liderazgo ni se asigna una aura automática por nombre, edad, reputación o estar sobre el parqué. La influencia puede mantenerse durante un tramo porque sus intervenciones estabilizan al equipo, no porque el quinteto tenga un multiplicador permanente por su presencia.

Salir del campo no borra de inmediato lo que dejó. Entrar no fija automáticamente un momento positivo. El sustituto puede sostenerlo, alterarlo o no influir todavía.

<a id="grupo-14-03"></a>

### 14.3. Ejemplos funcionales integrados

*Procedencia: MD05, §22.*

<a id="src-md05-l1691"></a>

#### 14.3.1. Jugador que estabiliza sin anotar

*Origen: MD05 §22.6.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

Entra un director que entiende mejor las funciones y conserva el balón. En interacciones pertinentes ayuda a reorganizar, elige salidas seguras y permite ejecutar responsabilidades. El equipo puede recuperar un momento colectivo más favorable con impulsos moderados.

No obtiene puntos ficticios ni mejora las notas de sus compañeros. Su influencia se sostiene en tareas y hechos. Si sale, el estado colectivo no desaparece inmediatamente; los nuevos ejecutores tienen que sostener la organización.

<a id="grupo-14-04"></a>

### 14.4. Momento individual

*Procedencia: MD06, §15.*

<a id="src-md06-l0906"></a>

#### 14.4.1. Los tres ámbitos vigentes

*Origen: MD06 §15.1.*

| Ámbito | Nombre funcional | Aplicación pertinente | Exclusiones principales |
|---|---|---|---|
| M-TIR | Tiro. | Variación temporal limitada de ejecución de lanzamientos pertinentes. | No mejora manejo, visión, velocidad ni defensa. |
| M-OFE | Control y ejecución ofensiva no de tiro. | Manejo, pase, continuidad y atención ofensiva pertinentes. | No añade directamente precisión al triple o al tiro libre. |
| M-DEF | Defensa y disputa. | Atención, seguimiento, respuesta y disputa pertinentes, incluido rebote. | No presta capacidad ofensiva ni altera tamaño corporal. |

Se conservan los tres ámbitos del MD05, con el mismo mecanismo de actualización. No se mantiene un estado diferente para cada una de las 32 capacidades.

<a id="src-md06-l0916"></a>

#### 14.4.2. Estado, resultado y evidencia

*Origen: MD06 §15.2.*

El momento representa un altibajo breve del rendimiento pertinente. El estado no es una copia de la secuencia de canastas o fallos.

Un buen tirador puede fallar con momento favorable. Un jugador frío puede anotar. Dos triples consecutivos pueden explicarse por calidad de las oportunidades y azar, sin exigir que el motor haya encendido un estado positivo.

El relato debe respetar esta distinción. Una racha visible puede describirse como tal. Para afirmar un estado propio se utiliza la información propia prevista, sin convertir cualquier parcial rival en conocimiento de su número interno.

<a id="src-md06-l0924"></a>

#### 14.4.3. Evolución compartida

*Origen: MD06 §15.3.*

La evolución contiene persistencia limitada, retorno gradual hacia neutral, variación acotada relacionada con Consistencia e impulsos de episodios elegibles.

Una expresión de responsabilidades es:

\[
M_{nuevo}=\operatorname{acotar}\left(\mathcal{P}(M_{previo},\Delta,\text{situación})+\varepsilon_{ámbito}+I_{episodio}\right)
\]

\(\mathcal{P}\) conserva y atenúa el estado según el intervalo y la situación; \(\varepsilon\) representa variación temporal acotada; \(I\) es el impulso admisible. La ecuación no escoge una distribución, una amplitud ni una vida media numérica. Esas decisiones de parametrización deben figurar en el perfil.

El intervalo se procesa de una vez cuando hace falta resolver o actualizar. Un acontecimiento de catorce segundos no exige catorce actualizaciones. El texto emitido y la velocidad del visionado no son relojes de estado.

<a id="src-md06-l0938"></a>

#### 14.4.4. Consistencia y neutralidad

*Origen: MD06 §15.4.*

MEN06 Consistencia regula la amplitud de los altibajos individuales. Un valor alto favorece estabilidad; uno bajo permite más extremos. Ninguno debe recibir por esa sola razón una mejora injustificada de rendimiento medio en contexto controlado.

La auditoría se hace sobre la salida de la transformación completa. Un ruido centrado antes de una logística no basta para garantizar probabilidades medias iguales.

No se exige que dos perfiles produzcan idéntico resultado en un partido ni que la variación real carezca de consecuencias. Se exige separar el efecto deportivo de una distribución más variable de un aumento accidental del centro de referencia.

<a id="src-md06-l0946"></a>

#### 14.4.5. Relación con Forma, Energía y presión

*Origen: MD06 §15.5.*

| Elemento | Sigue siendo | Relación con momento |
|---|---|---|
| Energía | Reserva de esfuerzo, con curva de fatiga. | Un momento favorable no repone pilas ni elimina el coste de energía. |
| Forma | Estado persistente recibido al inicio del encuentro. | Se mantiene estable durante el partido; no cambia tras cada episodio. |
| Presión | Exigencia contextual. | Rendimiento bajo presión ayuda en tareas pertinentes, sin duplicar la misma exigencia. |
| Momento | Variación breve por ámbito. | No sustituye ninguno de los anteriores. |

La curva de energía del MD05 se conserva: efecto muy reducido aproximadamente entre 100 y 70 como orientación funcional, crecimiento no lineal y deterioro muy considerable por debajo de 10. Las sensibilidades exactas siguen siendo parámetros.

Un jugador con energía 30 puede seguir siendo decisivo. El entrenador valora alternativas, contexto y tareas. La utilidad deportiva no se convierte en una regla de sustitución obligatoria por color de barra.

<a id="src-md06-l0959"></a>

#### 14.4.6. Banquillo y regreso

*Origen: MD06 §15.6.*

El jugador en el banquillo mantiene evolución temporal según su situación, con retorno gradual y sin impulsos por acciones que no ha ejecutado. Salir no borra instantáneamente su momento; volver no reinicia la distribución.

La recuperación de energía del descanso y la atenuación del momento son actualizaciones diferentes. Ambas utilizan el intervalo pertinente una sola vez.

<a id="src-md06-l0965"></a>

#### 14.4.7. Momento y tendencia

*Origen: MD06 §15.7.*

Un episodio no reescribe la Iniciativa, la Vocación de finalización o la Preferencia de zona permanentes. Los cambios de elección a corto plazo deben explicarse por contexto, órdenes, lectura y el alcance declarado de estados, sin crear un cuarto grupo de tendencias mutable para imitar lo mismo.

<a id="grupo-14-05"></a>

### 14.5. Momento colectivo y su alcance restringido

*Procedencia: MD06, §16.*

<a id="src-md06-l0971"></a>

#### 14.5.1. Un estado por equipo

*Origen: MD06 §16.1.*

Se mantiene un estado colectivo breve y acotado, T, por equipo. Representa conexión y respuesta compartida durante un tramo.

No equivale a moral de temporada, química del vestuario, conocimiento permanente del sistema o suma de los cinco momentos individuales. Esas materias no se añaden aquí como nuevas reservas del encuentro.

<a id="src-md06-l0977"></a>

#### 14.5.2. Restricción expresa respecto al MD05

*Origen: MD06 §16.2.*

La referencia del MD05 a «ejecución pertinente» se interpreta desde esta entrega de forma restringida: **coordinación, atención compartida y elección**.

**T no aumenta directamente la técnica ni la probabilidad de conversión del tiro ya definido por el mero hecho de que el equipo esté conectado.** Tampoco concede un plus físico universal.

Puede mejorar la oportunidad al facilitar una respuesta coordinada, una ayuda pertinente, una recepción preparada o una continuidad mejor elegida. El tiro posterior utiliza esa oportunidad real y las capacidades y estados individuales que correspondan.

Esta distinción permite que el buen momento del equipo se sienta en el juego sin convertirlo en una prima invisible a todos los porcentajes.

<a id="src-md06-l0987"></a>

#### 14.5.3. Tabla de aplicación

*Origen: MD06 §16.3.*

| Tarea | T colectivo | Momento individual pertinente | Límite |
|---|---|---|---|
| Coordinar una continuidad ofensiva compartida | Sí, de forma limitada. | M-OFE cuando la tarea individual lo requiere. | Presupuesto conjunto en esa tarea. |
| Reconocer y asumir una opción dentro de la respuesta del equipo | Sí, en la elección o coordinación pertinente. | Ámbito individual pertinente según tarea. | No aporta conocimiento perfecto de opciones ocultas. |
| Coordinar ayuda y recuperación | Sí. | M-DEF para respuesta individual pertinente. | Los defensores deben poder intervenir realmente. |
| Ejecutar un pase individual ya elegido | No como segunda prima general de técnica. | M-OFE. | Una recepción mejor coordinada puede haber cambiado antes su dificultad. |
| Convertir un lanzamiento ya definido | **No directamente.** | M-TIR, con influencia individual limitada. | No se añade otro bonus por racha colectiva. |
| Correr más rápido, saltar más o medir más | No. | El momento no sustituye capacidades físicas o cuerpo. | Energía y capacidades físicas mantienen su causalidad. |
| Administrar reglamento o dar un crédito estadístico | No. | No procede. | La administración depende de hechos validados. |

<a id="src-md06-l0999"></a>

#### 14.5.4. Presupuesto compartido

*Origen: MD06 §16.4.*

Cuando T y el ámbito individual son elegibles en la misma tarea, comparten un máximo de influencia. La combinación, pesos y límites pertenecen a una sola regla administrada.

No se suman un máximo individual, otro colectivo y otro de racha. La racha no es un tercer estado de rendimiento.

La influencia previa sobre coordinación tampoco reaparece después como una segunda prima idéntica al tiro. El registro distingue «mejoró la oportunidad por coordinación» de «modificó ejecución individual».

<a id="src-md06-l1007"></a>

#### 14.5.5. Jugadores que dan vida al equipo

*Origen: MD06 §16.5.*

Un director puede reorganizar tras un problema real. Un defensor puede ordenar una respuesta útil. Un jugador de esfuerzo puede producir una intervención significativa que moviliza al grupo.

Esas acciones utilizan capacidades existentes y hechos deportivos. Si cumplen el catálogo de episodios, pueden producir un impulso colectivo limitado. El jugador no necesita anotar para influir.

Estar en pista no concede una aura. Edad, fama, posición nominal o etiqueta de capitán no sustituyen una intervención real. No se añade una capacidad de Liderazgo.

<a id="src-md06-l1015"></a>

#### 14.5.6. Continuidad y cambios de quinteto

*Origen: MD06 §16.6.*

T pertenece al equipo. Una sustitución no lo borra ni obliga a recalcularlo como media de los nuevos cinco. Los nuevos participantes pueden sostener, alterar o no influir todavía en la dinámica.

La contribución del jugador que salió puede persistir brevemente a través del estado, con retorno gradual. No queda una bonificación permanente a su equipo por haber participado antes.

<a id="src-md06-l1021"></a>

#### 14.5.7. Marcador y remontadas

*Origen: MD06 §16.7.*

Una ventaja grande, un parcial o un mal porcentaje no activan por sí solos un aumento compensatorio de T para quien pierde. No hay un mecanismo de remontada destinado a corregir el marcador.

Los equipos pueden responder tácticamente a una racha, cambiar quinteto, pedir tiempo muerto o asumir más riesgo. Esas respuestas sí modifican el partido mediante decisiones y ejecución reales.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c13-tiempo-esfuerzo-y-energia](../simulacion/c13-tiempo-esfuerzo-y-energia.md) · Siguiente: [c14-p02-catalogo-de-episodios-y-actualizacion-de-estados](c14-p02-catalogo-de-episodios-y-actualizacion-de-estados.md)
