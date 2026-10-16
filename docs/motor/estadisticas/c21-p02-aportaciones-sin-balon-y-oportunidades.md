<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 21 — Análisis táctico, quintetos, filtros e informes · parte 2 de 3
> Anterior: [c21-p01-lectura-ofensiva-libro-y-direccion-de-juego](c21-p01-lectura-ofensiva-libro-y-direccion-de-juego.md) · Siguiente: [c21-p03-informes-para-entrenador-jugadores-y-rival](c21-p03-informes-para-entrenador-jugadores-y-rival.md)
<!-- beM:nav-fin -->

<a id="grupo-21-04"></a>

### 21.4. Aportaciones sin balón y oportunidades

*Procedencia: MD04, §22.*

<a id="src-md04-l1183"></a>

#### 21.4.1. Alcance deseado

*Origen: MD04 §22.1.*

El acta tradicional deja fuera parte del juego. Queremos poder mostrar aportaciones registradas de pantallas, cortes, ocupación útil, ayudas, seguimiento y cierre. Esto desarrolla la intención de que las tácticas se sientan vivas y que jueguen los cinco.

La condición es registrar tareas y efectos que ya forman parte de la resolución. No se añade un segundo simulador de movimientos para alimentar contadores.

<a id="src-md04-l1189"></a>

#### 21.4.2. Catálogo ampliado propuesto

*Origen: MD04 §22.2.*

| Aportación | Hecho necesario | Indicador posible | Frontera |
|---|---|---|---|
| Pantalla útil | Pantalla legal que crea contexto favorable registrado | Ejecuciones útiles y oportunidad posterior | No toda pantalla llamada es ejecutada ni útil. |
| Pantalla con canasta asociada | Relación con finalización de la cadena | Conteo propio de canastas tras pantalla | No AS oficial del bloqueador ni puntos exclusivos suyos. |
| Corte disponible | Movimiento que ofrece recepción/ventaja resuelta | Oportunidades ofrecidas, utilizadas/no utilizadas | No inferir cada corte que «habría podido» hacer. |
| Desmarque útil | Recepción o responsabilidad desplazada pertinente | Recepciones/ventajas registradas | No centímetros de separación ficticios. |
| Ocupación que limita ayuda | Defensor mantiene responsabilidad por amenaza resuelta | Situaciones registradas de ayuda condicionada | No medir disuasión invisible sin hecho explícito. |
| Continuación de pantalla | Opción creada como continuación/apertura | Recepciones y oportunidades por variante | Separar creación de finalización. |
| Ayuda pertinente | Intervención defensiva registrada | Ayudas, resultado local y continuidad | Fallo rival no prueba ayuda útil. |
| Recuperación de responsabilidad | Redistribución/recuperación representada | Recuperaciones y oposición resultante | No velocidad exacta ni ruta. |
| Seguimiento de pantalla | Navegación/respuesta resuelta | Opciones conservadas o concedidas | No puntuar por estar cerca. |
| Cierre útil | Acceso rival limitado por tarea resuelta | Cierres y captura del equipo asociada | Captura de compañero no prueba cierre si no se resolvió. |
| Desvío sin cambio de control | Intervención sobre el balón | Desvíos registrados | No REC. |
| Balón disputado recuperado | Disputa y control final | Recuperaciones propias/rivales | Distinguir rebote y recuperación fuera de tiro. |

Cada indicador propio lleva glosario. El término comercial «asistencia de pantalla», si se utiliza, debe identificarse como contribución ampliada y no mezclarse con AS oficiales.

<a id="src-md04-l1208"></a>

#### 21.4.3. Participación compartida

*Origen: MD04 §22.3.*

Una oportunidad puede tener varios colaboradores: pantalla, corte, pase y finalización. Se pueden mostrar participantes y funciones sin repartir artificialmente el 100 % del mérito.

La propuesta no asigna por defecto 40 % al pasador, 30 % al bloqueador y 30 % al tirador. Un reparto de valor necesitaría otra política. El registro de hechos ya puede mostrar una aportación sin fabricar un índice global.

<a id="src-md04-l1214"></a>

#### 21.4.4. Oportunidades creadas, ofrecidas y ejecutadas

*Origen: MD04 §22.4.*

Se distinguen disponibilidad de opción, reconocimiento/elección y ejecución. Una opción no utilizada puede ser legítimamente descartada por otra mejor, por reloj o por percepción del director.

Si el motor representa candidatos funcionales al decidir, puede conservar la opción pertinente y motivo de elección para diagnóstico. No hace falta exponer al jugador una lista perfecta de alternativas que el director no vio.

La vista deportiva debe basarse en observaciones disponibles. «El corte estuvo disponible tres veces y se utilizó una» requiere que esa disponibilidad esté efectivamente registrada y autorizada; no puede inferirse retrospectivamente viendo solo una canasta.

<a id="src-md04-l1222"></a>

#### 21.4.5. Qué no se promete medir

*Origen: MD04 §22.5.*

No se calculan distancias recorridas, carga mecánica exacta, todos los espacios no ocupados, puntos evitados hipotéticos, probabilidades de cada ruta o la puntuación que se habría conseguido con otra elección.

Esto no recorta el alcance táctico acordado. Define qué preguntas admiten una lectura a partir de los hechos del motor y cuáles necesitan un modelo diferente que aún no hemos elegido.

<a id="grupo-21-05"></a>

### 21.5. Quintetos, parejas, grupos y rotaciones

*Procedencia: MD04, §23.*

<a id="src-md04-l1230"></a>

#### 21.5.1. Incluidos en el diseño máximo

*Origen: MD04 §23.1.*

Quintetos y grupos están incluidos funcionalmente. No se excluyen por una recomendación de implementación temprana ni se dejan reducidos a una posibilidad vaga.

Un quinteto se identifica por cinco jugadores concretos. Sus posiciones, funciones y planes son contexto adicional. El mismo grupo puede aparecer en varios tramos y con distinta disposición; la vista permite agregarlo o separarlo según la pregunta.

<a id="src-md04-l1236"></a>

#### 21.5.2. Catálogo por quinteto

*Origen: MD04 §23.2.*

| Campo | Origen/definición |
|---|---|
| Integrantes | Identidades de los jugadores presentes. |
| Veces/tramos | Apariciones estables, con criterio de división declarado. |
| Minutos | Suma exacta de intervalos con ese grupo. |
| Puntos a favor/en contra durante sus tramos | Anotaciones con el grupo en pista en ese instante. |
| Más-menos | Diferencia de esos puntos. |
| Acta de tramos | Créditos individuales y colectivos ocurridos en esa presencia. |
| Ataques propios completos | Posesiones enteras con el quinteto presente. |
| Ataques rivales completos | Posesiones enteras defendidas por el quinteto. |
| Puntos vinculados a ataques completos | Numerador compatible con esas unidades. |
| Eficiencia ofensiva/defensiva estable | Tasas calculadas solo en el universo completo correspondiente. |
| Posesiones mixtas | Unidades que atravesaron sustitución. |
| Perfil ofensivo/defensivo | Planes, oportunidades, tiros, faltas y rebote de los contextos elegibles. |
| Rival enfrentado | Quintetos y protagonistas del oponente cuando exista información. |

<a id="src-md04-l1254"></a>

#### 21.5.3. Dos universos visibles

*Origen: MD04 §23.3.*

**Universo de presencia:** todos los hechos mientras ese cinco estaba en pista. Sirve para puntos, minutos y más-menos reales.

**Universo de posesión completa:** ataques que transcurrieron íntegramente con ese cinco. Sirve para eficiencias por unidad sin adjudicar un ataque completo a quien solo estuvo en su último libre.

El producto puede ofrecer ambos y explicar la diferencia. No divide los puntos de presencia entre posesiones completas si parte de los puntos pertenece a ataques mixtos. La tasa usa sus propios puntos elegibles.

<a id="src-md04-l1262"></a>

#### 21.5.4. Ataques mixtos

*Origen: MD04 §23.4.*

Si se sustituye durante una serie de libres, el ataque puede ser mixto. Sus puntos de marcador se reparten por el grupo presente en cada anotación; la unidad completa aparece en una categoría mixta para el análisis de posesiones estables.

La categoría mixta debe ser visible: número de ataques, puntos vinculados y grupos implicados. No se oculta para conseguir una tasa más limpia ni se cuenta una posesión entera para cada grupo que participó.

El reparto de fracciones por exposición temporal o responsabilidades no es la convención adoptada: sería una estimación distinta y tiene problemas con sucesos sin reloj. La regla vigente conserva presencia exacta, posesiones completas y mixtas por separado.

<a id="src-md04-l1270"></a>

#### 21.5.5. Parejas y grupos parciales

*Origen: MD04 §23.5.*

Se desea poder analizar pareja de creadores, director–interior, dos tiradores, doble interior, tres jugadores concretos y conjuntos seleccionados por el usuario. El mismo ataque puede pertenecer a muchas combinaciones; sus totales son consultas solapadas.

El criterio de presencia completa se puede aplicar al grupo seleccionado sin exigir que el resto del quinteto permanezca estable. Si cambia un compañero ajeno al grupo, la pareja sigue presente durante toda la unidad; el contexto del resto queda visible.

Los grupos por perfil —por ejemplo, «con dos interiores»— requieren una definición estable del perfil/rol activo. No se deducen de un atributo oculto ni se reinventan después de ver el resultado.

<a id="src-md04-l1278"></a>

#### 21.5.6. Rotaciones y cobertura de funciones

*Origen: MD04 §23.6.*

Se desea estudiar tiempo sin director definido, tramos sin una función de cierre o protección que el entrenador considera necesaria y cambios de funciones dentro del grupo. Es una lectura del plan y de participantes, no un castigo automático por no tener una posición nominal.

Un quinteto sin base puede dirigirlo un alero. El informe distingue «sin jugador de posición base» de «sin director funcional». Los roles no crean aptitud técnica por sí mismos.

<a id="src-md04-l1284"></a>

#### 21.5.7. Comparación y lectura

*Origen: MD04 §23.7.*

La tabla debe mostrar minutos, ataques y rivales junto a la eficiencia. Un cinco de 90 segundos con dos triples puede tener una tasa extraordinaria y escasa evidencia.

Los rankings pueden ordenarse, pero cualquier filtro de mínimo de minutos/posesiones debe ser configurable y visible. La vista no declara «mejor quinteto» como verdad absoluta sin decir qué criterio utiliza.

<a id="grupo-21-06"></a>

### 21.6. Análisis on-off y comparación de contextos

*Procedencia: MD04, §24.*

<a id="src-md04-l1292"></a>

#### 21.6.1. Finalidad

*Origen: MD04 §24.1.*

On/off compara cómo fue el equipo cuando un jugador estaba en pista y cuando no estaba. Es una herramienta descriptiva del sistema y de la rotación, no un aislamiento automático del mérito individual.

Debe formar parte del diseño máximo tanto para un partido como para muestras históricas compatibles. No se decide aquí cuándo se construye.

<a id="src-md04-l1298"></a>

#### 21.6.2. Contenido deseado

*Origen: MD04 §24.2.*

| Grupo | Con jugador | Sin jugador |
|---|---|---|
| Exposición | Minutos y tramos | Minutos y tramos. |
| Marcador | Puntos a favor/en contra y margen durante presencia | Mismos campos durante ausencia. |
| Acta | Créditos ocurridos en ese estado | Mismos créditos en el otro. |
| Posesiones estables | Ataques completos con presencia continua | Ataques completos con ausencia continua. |
| Eficiencias | Numerador y denominador elegibles | Mismo criterio. |
| Perfil | Tiro, pérdidas, rebote y faltas | Mismas dimensiones. |
| Contexto | Compañeros, rivales, planes y periodos | Distribución correspondiente. |
| Mixtas | Ataques que cruzan entrada/salida | Categoría aparte, compartida como referencia. |

<a id="src-md04-l1311"></a>

#### 21.6.3. Diferencias

*Origen: MD04 §24.3.*

Se puede mostrar diferencia de NetRtg, puntos por posesión, frecuencia de triple, pérdidas por 100 ataques o rebote por oportunidad. Se mantiene el nombre completo: «diferencia observada del equipo con/sin el jugador».

La diferencia no se denomina «impacto causal» ni «puntos que aporta». El jugador puede entrar con titulares frente a suplentes y salir en contextos muy distintos. La vista debe permitir ver esas distribuciones.

<a id="src-md04-l1317"></a>

#### 21.6.4. Compatibilidad de numeradores

*Origen: MD04 §24.4.*

Si el indicador usa ataques completos con presencia, todos sus puntos y créditos deben proceder de esos mismos ataques. Los puntos anotados durante una presencia breve dentro de una unidad mixta quedan en el marcador de presencia, pero no entran en el numerador de eficiencia estable.

Para la defensa se usan ataques rivales completos bajo la misma condición. No se divide la producción rival por los ataques propios del equipo.

Los créditos sin posesión vinculada se muestran como administrativos durante presencia/ausencia. La política global puede incluirlos en su tasa de partido; la tasa estable debe declarar si los excluye o aplica otra regla explícita.

<a id="src-md04-l1325"></a>

#### 21.6.5. Agregación entre encuentros

*Origen: MD04 §24.5.*

Se suman puntos elegibles, ataques y tiempo; después se calculan tasas. No se promedian diferencias on/off de partidos con denominadores distintos como si todos aportaran la misma evidencia.

El usuario puede comparar bajo el mismo entrenador, rol, competición o tramo de temporada. Si la muestra mezcla cambios de función, reglas o política, se muestra esa mezcla o se separa.

<a id="src-md04-l1331"></a>

#### 21.6.6. Ajustes más allá del on/off

*Origen: MD04 §24.6.*

Se conserva la posibilidad de estudiar comparaciones ajustadas por compañeros, rivales y contexto, pero no se introduce un modelo de regresión o una nota de impacto como consecuencia automática de disponer de quintetos.

Si se adopta una métrica ajustada, deberá definir objetivo, supuestos, tamaño de muestra, regularización, incertidumbre y compatibilidad con el motor. Hasta entonces on/off y quintetos explican el rendimiento observado, con contexto explícito.

<a id="grupo-21-07"></a>

### 21.7. Filtros, desgloses y comparaciones

*Procedencia: MD04, §25.*

<a id="src-md04-l1339"></a>

#### 21.7.1. Catálogo máximo de filtros

*Origen: MD04 §25.1.*

| Eje | Opciones deseadas | Precaución |
|---|---|---|
| Sujeto | Equipo, jugador, grupo, rival | Un grupo puede solaparse con otro. |
| Tiempo | Partido, periodo, prórroga, intervalo | Definir inclusión por hecho o posesión. |
| Presencia | En pista, fuera, cinco, pareja | Tasas de posesión estable separadas del marcador del intervalo. |
| Marcador | Por delante, empate, detrás, margen | Usar estado previo del hecho/ataque para clasificar. |
| Contexto final | Final ajustado, final de reloj/periodo | Umbrales visibles y versionados. |
| Origen | Pérdida, rebote, saque, inicio de periodo, canasta rival | Un origen principal con contexto complementario. |
| Ataque | Disposición, familia, variante, prioridad | Lo realmente iniciado/ejecutado. |
| Director | Jugador que dirige la decisión pertinente | Puede cambiar dentro del ataque. |
| Rol | Rol ofensivo/defensivo activo | No equivale a posición permanente ni atributo. |
| Defensa | Organización, presión, cobertura, ayuda | No mezclar categorías de distinto nivel. |
| Finalización | Valor, sector, preparación, oposición | Son ejes distintos del mismo intento. |
| Disciplina | Tipo de falta/sanción, bonus | No confundir falta recibida y contador de equipo. |
| Estado visible | Energía/condición conocida del propio equipo | Matriz de visibilidad vigente; no usar atributos ocultos del rival. |
| Historia | Competición, temporada, fase, entrenador, rol | Comparabilidad y cambios de versión. |

<a id="src-md04-l1358"></a>

#### 21.7.2. Universo de consulta

*Origen: MD04 §25.2.*

Antes de calcular una tasa, la vista determina el universo. Se proponen tres modos claramente identificados:

1. **Hechos:** qué tiros, créditos o anotaciones ocurrieron dentro del filtro.
2. **Posesiones:** qué unidades cumplen el criterio de inicio, cierre o contención seleccionado.
3. **Tramos:** qué ocurrió mientras estaba vigente una presencia/plan durante ese intervalo.

El usuario no necesita elegir siempre estos conceptos manualmente. Cada vista puede ofrecer una opción recomendada y explicar el criterio. La regla sí debe existir y ser consistente.

Ejemplo: «tiros del tercer cuarto» se basa en el periodo del intento. «Ataques con libertad alta» exige decidir si el plan estuvo activo al inicio, durante toda la unidad o al producir la ejecución. No se dejan esos tres significados mezclados en una misma tabla.

<a id="src-md04-l1370"></a>

#### 21.7.3. Cruces compatibles

*Origen: MD04 §25.3.*

Un filtro por tiros de esquina no puede mostrar sin explicación todas las posesiones ofensivas como denominador de su porcentaje de acierto. Un filtro por «asistido» en tiros no incluye automáticamente asistencias a libres que no produjeron canasta.

Si un cruce carece de sentido, la interfaz debe explicar qué parte no es aplicable u ofrecer la métrica compatible. No produce un cero silencioso.

Una consulta que cruza varios ejes puede quedarse sin muestra. La respuesta es «sin hechos elegibles», conservando filtros, no una pantalla que interpreta eso como ausencia de capacidad.

<a id="src-md04-l1378"></a>

#### 21.7.4. Total y categorías

*Origen: MD04 §25.4.*

Las categorías excluyentes de un eje deben sumar su total elegible, incluidos desconocido, mixto u otro cuando proceda. Las etiquetas solapadas no lo hacen y deben indicar que no son una partición.

El usuario debe poder ver por qué algunas posesiones están fuera del cálculo: mezcla de cinco, dato no registrado, sanción administrativa o filtro. Es una condición de confianza, no una exigencia de enseñar datos internos.

<a id="src-md04-l1384"></a>

#### 21.7.5. Comparación de jugadores y equipos

*Origen: MD04 §25.5.*

Se desea comparar dos sujetos con columnas homogéneas: total, tiempo, posesiones, oportunidades, eficiencia y contexto. La comparación puede incluir perfiles de selección, dirección, rebote y defensa.

Si se comparan roles diferentes, la tabla no los transforma en una única nota. Puede mostrar diferencias y responsabilidades: un anotador termina más; un creador dirige más; un cerrador puede capturar menos y contribuir a rebotes de compañeros.

Los percentiles de competición, si se utilizan, necesitan grupo de comparación y mínimo de muestra. No se informa «percentil 90» sin población, temporada y criterio de elegibilidad.

<a id="src-md04-l1392"></a>

#### 21.7.6. Referencias históricas

*Origen: MD04 §25.6.*

Se desea comparar el encuentro con media de temporada, últimos N partidos, partidos en el mismo rol, contra cierto tipo de defensa, local/visitante, victoria/derrota y mismo entrenador.

El histórico suma numeradores y denominadores antes de calcular porcentajes. También puede mostrar distribución entre partidos: mediana, rango, percentiles y variación, sin convertirla en una medición directa de Consistencia.

Un periodo anterior del mismo equipo permite describir tendencia. No basta para demostrar que una orden nueva produjo el cambio, especialmente si cambian rival, minutos, rol o estado de forma.

<a id="src-md04-l1400"></a>

#### 21.7.7. Lectura temporal de decisiones

*Origen: MD04 §25.7.*

Las comparaciones antes/después de una orden deben empezar cuando se aplicó. Un tramo anterior a la aplicación no se atribuye a la nueva táctica.

Las ventanas pueden definirse por tiempo o por ataques. Debe verse cuánto abarcan y qué rivales enfrentaron. La propuesta permite recorrer varios cambios del partido, no elegir retrospectivamente una única ventana favorable para confirmar que el entrenador acertó.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c21-p01-lectura-ofensiva-libro-y-direccion-de-juego](c21-p01-lectura-ofensiva-libro-y-direccion-de-juego.md) · Siguiente: [c21-p03-informes-para-entrenador-jugadores-y-rival](c21-p03-informes-para-entrenador-jugadores-y-rival.md)
