<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: simulacion](README.md) · Capítulo 12 — Selección, oportunidad, ejecución y desenlace · parte 1 de 2
> Anterior: [c11-flujo-de-partido-posesiones-y-contexto-pequeno](c11-flujo-de-partido-posesiones-y-contexto-pequeno.md) · Siguiente: [c12-p02-tabla-1-seleccion-de-intenciones-y-participantes](c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md)
<!-- beM:nav-fin -->

<a id="cap-12"></a>

## 12. Selección, oportunidad, ejecución y desenlace

La selección de una intención, la oportunidad, la lectura y la ejecución se distinguen sin imponer tiradas separadas. El resultado utiliza distribución excluyente, logística binaria o relación condicional según la tarea.

<a id="grupo-12-01"></a>

### 12.1. Selección, oportunidades y desenlaces

*Procedencia: MD05, §5.*

<a id="src-md05-l0223"></a>

#### 12.1.1. Las tres tablas siguen siendo los tres grupos funcionales

*Origen: MD05 §5.1.*

| Grupo del Documento 03 | Decide | Datos administrables principales |
|---|---|---|
| Tabla 1: selección | Intención, opción y participantes pertinentes. | Elegibilidad, prioridades, pesos, roles, tendencias, libertad, lectura, urgencia y compatibilidad. |
| Tabla 2: oportunidades y desenlaces | Qué se logra, qué oposición existe, resultado y continuación. | Capacidades por tarea, referencias, sensibilidades, oposición, distribuciones y relaciones condicionales. |
| Tabla 3: tiempo, esfuerzo y estados | Tiempo consumido y actualización pertinente. | Duraciones, exposición, carga, recuperación, curvas de energía, forma, momento, presión y memoria. |

El panel puede ofrecer muchas hojas y vistas sobre estos grupos. No se obliga a meter toda la información en una única hoja imposible de usar ni a convertir cada fila en otro mecanismo deportivo.

<a id="src-md05-l0233"></a>

#### 12.1.2. Elegibilidad antes que preferencia

*Origen: MD05 §5.2.*

Primero se descartan opciones imposibles por disponibilidad, reloj, regla o requisitos funcionales. Después se ponderan las viables.

Una preferencia alta no crea espacio que la defensa no ha concedido, un jugador ausente, un pase imposible ni tiempo suficiente para una acción larga. Una opción poco preferida puede seguir siendo elegible y utilizarse.

La salida válida debe quedar definida. Si no hay ninguna ficha del libro utilizable, se puede conservar, reorganizar o decidir de manera directa según contexto y reloj. No se fuerza una ficha incompatible para evitar una lista vacía.

<a id="src-md05-l0241"></a>

#### 12.1.3. Pesos de selección

*Origen: MD05 §5.3.*

Se adopta la normalización de pesos no negativos entre opciones elegibles:

$$P(i)=\frac{w_i}{\sum_{j\in E}w_j}.$$

Cada peso tiene una procedencia identificada: plan, prioridad, compatibilidad preferente, función, tendencia, lectura y contexto. Los modificadores tienen límites y sentido explícitos.

Los pesos **8, 5, 3, 2, 1** para prioridades **1–5** se conservan como semilla provisional. No son porcentajes. Si dos únicas familias elegibles tienen peso 8 y 8, su reparto inicial es 50/50 antes de otros factores; no «80 % cada una».

Se selecciona familia antes de variante cuando se utiliza una familia. La masa inicial de una familia se basa en su mejor prioridad elegible; añadir varias fichas equivalentes no multiplica su presencia. Dentro de la familia se elige variante con las preferencias y requisitos correspondientes.

El mecanismo admite decisiones directas sin familia. En ese caso no se crea una familia ficticia para poder utilizar la fórmula.

<a id="src-md05-l0255"></a>

#### 12.1.4. Plan, libertad e iniciativa

*Origen: MD05 §5.4.*

La selección combina intención del entrenador y lectura del actor pertinente:

$$P_{\mathrm{elección}}=(1-L)P_{\mathrm{plan}}+LP_{\mathrm{lectura}}.$$

`L` es una mezcla acotada del perfil; aumenta con la libertad concedida y la iniciativa personal. La expresión anterior del Documento 03 `L = F × (0,25 + 0,75 × I)` queda como semilla editable, no como porcentaje de decisiones correctas ni como regla definitiva validada.

El plan también puede autorizar aprovechar una oportunidad inmediata. Por ello libertad baja no significa ignorar obligatoriamente un aro libre. La lectura no conoce las opciones ocultas ni la futura realización del azar. Visión determina lo que puede detectar; Decisiones orienta lo que elige; Comprensión afecta a responsabilidades compartidas.

El actor puede ser el director o un receptor, anotador o recuperador que debe decidir ahora. El director no reclama el balón en todas las situaciones para aplicar el libro. Su influencia es mayor cuando existe una tarea real de organizar o leer el conjunto.

<a id="src-md05-l0267"></a>

#### 12.1.5. Capacidades por tarea

*Origen: MD05 §5.5.*

Cada tarea utiliza capacidades del participante que la ejecuta, con técnica principal dominante y apoyos pertinentes normalizados. Los requisitos imprescindibles pueden limitar elegibilidad o ejecución; no se adopta el mínimo de todas las notas como fórmula universal.

No se promedian cinco jugadores para ejecutar el triple de uno. El bloqueador utiliza Bloqueos; el defensor, navegación o contención según responsabilidad; el tirador, su técnica de distancia y preparación. Una cadena puede incorporar varias tareas sin necesitar una tirada separada por cada nombre lógico.

La función o el rol modifica participación. No añade habilidad por etiqueta. La edad y la reputación no corrigen el resultado después.

<a id="src-md05-l0275"></a>

#### 12.1.6. Tres tratamientos compatibles del resultado

*Origen: MD05 §5.6.*

| Situación | Tratamiento cerrado | Ejemplo de interpretación |
|---|---|---|
| Salidas incompatibles | Distribución conjunta entre resultados excluyentes. | Una interacción termina en conservación, pérdida o contacto de una clase elegible. |
| Éxito/fracaso pertinente | Probabilidad binaria calibrable mediante logística. | Convertir un tiro válido bajo una oposición ya determinada. |
| Hechos que pueden coexistir | Relación condicional declarada. | Canasta con falta; robo asociado a una pérdida elegible. |

No se sortean por separado hechos incompatibles y después se escoge arbitrariamente cuál conservar. La disposición técnica del cálculo puede agrupar operaciones; debe respetar estas relaciones.

La referencia logística es:

$$p=\operatorname{sigmoid}\left(\operatorname{logit}(p_0)+\Delta C-\Delta D+\Delta X\right).$$

`p0` declara población y situación de referencia. `ΔC`, `ΔD` y `ΔX` usan sensibilidades administradas y unidades compatibles. El panel debe mostrar la traducción a porcentaje sobre casos de referencia. No se mezclan notas 1–30, puntos porcentuales y unidades logit sin conversión declarada.

La función es compartida; los datos por tarea cambian. La calibración debe evitar saturaciones absurdas y preservar que un gran especialista pueda fallar y un jugador limitado pueda acertar.

<a id="src-md05-l0293"></a>

#### 12.1.7. Un efecto deportivo se aplica en un lugar identificable

*Origen: MD05 §5.7.*

| Hecho | Lugar de aplicación | Duplicación que se debe impedir |
|---|---|---|
| Defensor retrasado | Oposición o disponibilidad concreta. | Bonificación adicional por la misma pantalla perdida. |
| Ayuda comprometida | Responsabilidad que abandona y recepción correspondiente. | Mejora general de todos los tiros del equipo. |
| Director ve una salida | Opción percibida y elección. | Acierto extra universal del receptor. |
| Fatiga limita primer paso | Capacidad efectiva de esa tarea. | Segunda resta equivalente por energía en el mismo primer paso. |
| Forma altera ejecución | Efecto temporal pertinente una vez. | Multiplicar otra vez todas las notas. |
| Cierre reduce acceso al rebote | Participación y oposición de los candidatos. | Repetir el mismo cierre como otro bonus de captura. |
| Momento individual y colectivo | Presupuesto conjunto acotado de influencia. | Sumar también una tercera bonificación por racha. |

La trazabilidad del panel debe permitir detectar dónde entra cada causa. Dos tareas diferentes del mismo jugador pueden recibir efectos distintos si representan consecuencias deportivas distintas.

<a id="src-md05-l0307"></a>

#### 12.1.8. Ejecución y exposición

*Origen: MD05 §5.8.*

Cada riesgo declara su unidad. Un pase difícil se puede referir a una ejecución; el control prolongado bajo presión, a una exposición. Dividir el relato o el cálculo no debe multiplicar el riesgo.

Para una exposición homogénea es válida la referencia administrable:

$$p(t)=1-(1-p_{\mathrm{ref}})^{t/t_{\mathrm{ref}}}.$$

Es una construcción de tasa constante bajo esas condiciones, no una ley universal del baloncesto. Si el contexto cambia, se actualiza la exposición pertinente. Los riesgos incompatibles se resuelven conjuntamente, conservando la posibilidad de que el primer suceso termine la interacción.

Ejemplo matemático: una referencia del 10 % en ocho segundos corresponde al 19 % en dieciséis bajo la misma tasa. No corresponde al 20 % ni a cuatro sorteos del 10 % porque se hayan narrado cuatro frases.

<a id="src-md05-l0319"></a>

#### 12.1.9. Tiempo y rebote

*Origen: MD05 §5.9.*

Las duraciones se obtienen de distribuciones acotadas por situación y desenlace, con centro, dispersión y límites administrados. El reloj insuficiente cambia opciones; no comprime una jugada larga hasta hacerla instantánea.

Si la pérdida sucede antes del tiro esperado, se consume el intervalo hasta la pérdida. El resultado y su duración deben ser compatibles. No se camina segundo a segundo para encontrarla.

El rebote utiliza disputa colectiva pertinente y atribución posterior entre candidatos disponibles, como referencia del Documento 03. Cerrar puede ayudar a capturar a otro. Los jugadores que balancearon o quedaron fuera de la disputa no participan automáticamente por tener buen Rebote.

<a id="grupo-12-02"></a>

### 12.2. Ejemplos funcionales integrados

*Procedencia: MD05, §22.*

<a id="src-md05-l1659"></a>

#### 12.2.1. Anotador tras primer paso

*Origen: MD05 §22.2.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

El anotador recibe con una pequeña ventaja. Puede lanzar tras bote, penetrar o pasar. Iniciativa y libertad influyen en la preferencia; Visión y Decisiones actúan sobre lo que ve y elige. El defensor y la ayuda siguen presentes.

Si elige suspensión de tres, TEC06 contribuye a preparar y TEC01 a ejecutar. Si ataca aro, TEC07, físicas pertinentes y TEC04 participan en las tareas correspondientes. No se suman TEC06 y TEC04 como dos técnicas universales del mismo final.

Un jugador con iniciativa alta y malas decisiones puede abusar de una separación insuficiente. Un gran lector puede utilizar mejor la libertad, sin disponer de información perfecta.

<a id="grupo-12-03"></a>

### 12.3. Catálogo de finalizaciones y técnica principal

*Procedencia: MD06, §12.*

<a id="src-md06-l0675"></a>

#### 12.3.1. Cinco clasificaciones que no deben confundirse

*Origen: MD06 §12.1.*

| Eje | Describe | Ejemplos |
|---|---|---|
| Clase estadística de lanzamiento | Valor y tratamiento reglamentario del intento. | Dos puntos, triple, tiro libre. |
| Técnica principal | Capacidad técnica que resuelve la ejecución dominante. | TEC01, TEC02, TEC03, TEC04 o TEC05. |
| Preparación | Cómo se obtuvo o preparó el gesto. | Recepción, bote, salida de bloqueo, giro de poste. |
| Origen y fase | De dónde viene la oportunidad. | Ficha, decisión directa, transición, segunda oportunidad, saque. |
| Calidad de oportunidad | Condición previa al desenlace. | Cómoda, normal o forzada, según la política declarada. |

Un triple tras bote sigue siendo un triple estadístico. Que requiera preparación en movimiento no lo convierte en una finalización interior. Una canasta difícil sigue siendo forzada aunque entre.

Zona y gesto también son independientes: un floater en progresión conserva TEC04 aunque su localización corresponda a otra zona de análisis. La frontera espacial del mapa no convierte por sí sola el gesto en un tiro desde apoyo.

El catálogo permite recursos reconocibles sin añadir otra capacidad por cada nombre de tiro. La técnica principal se decide por el gesto representado, no por una etiqueta narrativa aislada.

<a id="src-md06-l0691"></a>

#### 12.3.2. Tabla principal de ejecución

*Origen: MD06 §12.2.*

| Ejecución representada | Técnica principal | Apoyos pertinentes | Frontera que debe conservarse |
|---|---|---|---|
| Triple preparado tras recepción | TEC01 Triple. | Preparación de recepción y equilibrio cuando correspondan. | Recibir no añade TEC06 automáticamente a todo triple. |
| Triple tras bote o salida que exige preparar el tiro en movimiento | TEC01 Triple. | TEC06 Tiro en movimiento para la preparación; manejo y equilibrio si explican tareas distintas. | TEC06 no se suma como una segunda capacidad general de puntería. |
| Tiro de media distancia preparado | TEC02 Tiro de media distancia. | Equilibrio o preparación pertinente. | No usa TEC03 por valer dos puntos. |
| Tiro de media tras bote o salida en movimiento | TEC02 Tiro de media distancia. | TEC06 para la preparación y apoyos específicos. | La zona y el gesto de lanzamiento siguen determinando la principal. |
| Tiro corto controlado, desde apoyo estable, incluido gancho de esa naturaleza | TEC03 Tiro interior. | Equilibrio y contexto de oposición o contacto. | El hecho de venir de poste no hace de TEC11 la capacidad de acierto. |
| Entrada, bandeja, reverso o finalización en progresión | TEC04 Finalización en movimiento. | Manejo previo, equilibrio, contacto o salto según el caso. | La preparación con bote puede terminar antes de la ejecución de tiro. |
| Mate o finalización aérea | TEC04 Finalización en movimiento. | Salto, fuerza y alcance cuando son pertinentes. | No se crea una capacidad de mate ni se garantiza terminar por poder saltar. |
| Floater o runner en progresión | TEC04 Finalización en movimiento. | Equilibrio y preparación del recurso. | Se clasifica por continuar el movimiento, no por el nombre del relato. |
| Toque corto tras detenerse y controlar el apoyo | TEC03 Tiro interior. | Preparación y equilibrio pertinentes. | Llamarlo floater en un texto no cambia el gesto representado. |
| Palmeo directo de finalización | TEC04 Finalización en movimiento. | Acceso al rebote y salto en su tarea, según la secuencia. | Captura estadística y finalización se acreditan por sus reglas, no por el nombre. |
| Rebote asegurado y tiro corto posterior desde situación controlada | TEC03 Tiro interior. | Técnica y cuerpo de la captura anterior, después preparación del tiro. | El rebote no convierte el tiro posterior en palmeo directo. |
| Tiro libre | TEC05 Tiro libre. | Estado pertinente y presión conforme al modelo. | No usa la oposición de campo ni la Preferencia de zona. |

La fila del palmeo se refiere a un intento directo de anotar tras el balón de rebote. Un toque sin intento de anotación ni control suficiente no se convierte por defecto en tiro o captura.

<a id="src-md06-l0710"></a>

#### 12.3.3. Preparar y ejecutar son tareas diferentes

*Origen: MD06 §12.3.*

TEC06 conserva una función real: preparar el lanzamiento cuando el movimiento lo exige. Puede influir en la calidad alcanzada o en la dificultad de ejecutar desde esa preparación.

TEC01 o TEC02 resuelven el lanzamiento exterior correspondiente. No se aplica primero una ventaja completa de TEC06 a la calidad y después otra ventaja idéntica a la conversión.

TEC11 Juego de poste puede crear posición, giro o ventaja. La ejecución termina con TEC03, TEC04 o el tiro exterior correspondiente. Un jugador puede crear muy bien en poste y finalizar peor, o finalizar bien ventajas que otros le crean.

La misma distinción mantiene el papel de TEC08 Pase, TEC09 Bloqueos y TEC10 Movimiento sin balón. Crear una buena oportunidad no obliga a ser el mejor lanzador.

<a id="src-md06-l0720"></a>

#### 12.3.4. Defensores y oposición

*Origen: MD06 §12.4.*

La oposición utiliza las responsabilidades actuales del apartado 4. Contención, ayuda y tapón son intervenciones distintas cuando realmente existen. No se aplican varias penalizaciones completas por el mismo obstáculo.

Un defensor puede dificultar la llegada sin ser quien contesta el tiro final. El análisis conserva ambas intervenciones, con universos y nombres distintos.

La clasificación de cómoda, normal o forzada se fija con el contexto previo al desenlace. El resultado no reescribe quién llegó ni la calidad de oposición.

<a id="src-md06-l0728"></a>

#### 12.3.5. Rebote y segundo intento

*Origen: MD06 §12.5.*

Tras un fallo, el balón puede salir, quedar muerto, ser capturado o dar una continuación válida. La captura y el intento posterior tienen créditos propios. El reloj y la posesión se actualizan conforme al perfil reglamentario.

Un palmeo o mate directo puede satisfacer condiciones de intento y de crédito de rebote según la política FIBA. No es necesario representar una captura manual anterior inexistente, pero sí cumplir los criterios estadísticos pertinentes [MD06-S04](../referencias/c33-p02-fuentes-y-limites-de-la-investigacion.md#ref-md06-s04).

Una captura ofensiva con salida al exterior puede dar una finalización de otra zona varios acontecimientos después. Sigue siendo segunda oportunidad si cumple esa definición, sin tener que terminar inmediatamente el capturador.

<a id="src-md06-l0736"></a>

#### 12.3.6. Acciones sin tiro final

*Origen: MD06 §12.6.*

Una penetración puede terminar en pase, falta no de tiro, pérdida, balón fuera o continuación. No se genera una finalización de tiro únicamente porque el jugador quisiera anotar al iniciar la acción.

Un tiro negado que no llega a intentarse puede constar en el análisis de acciones y oportunidades si se ha representado esa interacción. No incrementa FGA ni la unidad de finalización de tiro sin cumplir su frontera.

<a id="src-md06-l0742"></a>

#### 12.3.7. Límites del catálogo

*Origen: MD06 §12.7.*

La técnica principal no resuelve por sí sola el desenlace. Intervienen oportunidad, oposición, estados y apoyos pertinentes conforme a las tablas del motor.

Las variaciones narrativas pueden enriquecer el relato siempre que describan los hechos. No inventan gestos, distancias o defensores que el motor no haya representado.

<a id="grupo-12-04"></a>

### 12.4. Ejemplos integrados

*Procedencia: MD06, §22.*

<a id="src-md06-l1493"></a>

#### 12.4.1. Floater frente a tiro corto controlado

*Origen: MD06 §22.11.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación A:** el conductor continúa su avance y suelta un floater antes de detenerse. La principal es TEC04.

**Situación B:** el jugador controla una recepción corta, se estabiliza y ejecuta un toque desde apoyo. La principal es TEC03.

**Registro:** el gesto distingue la técnica. Los nombres literarios pueden variar sin cambiar la clasificación acordada.

<a id="src-md06-l1501"></a>

#### 12.4.2. Palmeo y posterior tiro interior

*Origen: MD06 §22.12.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación A:** un jugador dirige el balón directamente al aro en una intervención de rebote que cumple condiciones de intento. La ejecución utiliza TEC04; los créditos de rebote y tiro siguen la política.

**Situación B:** asegura el rebote, controla el balón y tira desde apoyo. La captura es una tarea anterior y la principal del tiro es TEC03.

**Límite:** decir «segunda oportunidad» no obliga a que ambos casos tengan la misma preparación o técnica.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c11-flujo-de-partido-posesiones-y-contexto-pequeno](c11-flujo-de-partido-posesiones-y-contexto-pequeno.md) · Siguiente: [c12-p02-tabla-1-seleccion-de-intenciones-y-participantes](c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md)
