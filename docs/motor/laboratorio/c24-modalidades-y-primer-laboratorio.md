<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: laboratorio](README.md) · Capítulo 24 — Modalidades y primer laboratorio
> Anterior: [c23-visibilidad-e-informacion-disponible](../estadisticas/c23-visibilidad-e-informacion-disponible.md) · Siguiente: [c25-p01-contenido-y-poblacion-con-y-pob](../validacion/c25-p01-contenido-y-poblacion-con-y-pob.md)
<!-- beM:nav-fin -->

<a id="cap-24"></a>

## 24. Modalidades y primer laboratorio

El laboratorio utiliza el mismo motor integrado. Los requisitos solicitados y las concreciones propuestas en MD08 conservan su procedencia; los tamaños de lote ilustrativos no son promesas de rendimiento. La exportación completa amplía las salidas analíticas anteriores.

<a id="grupo-24-01"></a>

### 24.1. Requisitos solicitados del primer laboratorio

*Procedencia: MD08, §1.*

<a id="src-md08-l0006"></a>

Preparar plantillas, modificar jugadores, jugar partidos completos en tres modalidades y simular muchos encuentros para observar cómo responden los atributos, las tácticas y los estados.

Dennis solicita:

- Doce jugadores por equipo, con sus fichas individuales.
- Edición masiva mediante botones **+1, +3 y +5**.
- Tres modalidades: **simulado total, por cuartos y por tiempo**.
- Simulación masiva de partidos.
- Descarga de una extracción completa del partido o lote, con registros detallados y recopilación conjunta, para entregar paquetes masivos a ChatGPT y analizar el motor.

Se conserva el motor por acontecimientos dentro de las posesiones definido en los MD01–07. Las tres modalidades y los lotes ejecutan el mismo núcleo y las mismas reglas. La velocidad de presentación cambia la espera del usuario; el reloj deportivo y los hechos resueltos mantienen su coherencia.

<a id="grupo-24-02"></a>

### 24.2. Plantillas y fichas iniciales

*Procedencia: MD08, §2.*

<a id="src-md08-l0020"></a>

El MD07 define **doce equipos de referencia de doce jugadores: 144 fichas**. Sus identidades y contrastes deportivos sirven como precarga del laboratorio. Cada equipo puede enfrentarse a cualquiera de los demás y utilizar planes compatibles modificados por el usuario.

La ficha reúne los datos ya definidos: identidad, edad, posiciones, cuerpo, **32 atributos en escala 1–30**, tendencias, rol ofensivo y defensivo, energía, forma y estados iniciales aplicables. La experiencia se refleja mediante las capacidades y decisiones acordadas en los documentos anteriores.

**Contenido pendiente de completar:** los 144 perfiles numéricos y los planes iniciales de los equipos. El MD07 describe sus funciones y diferencias; esos valores concretos todavía deben rellenarse. Los perfiles conservarán fortalezas, limitaciones y especialistas reconocibles.

<a id="grupo-24-03"></a>

### 24.3. Edición masiva

*Procedencia: MD08, §3.*

<a id="src-md08-l0028"></a>

Seleccionar uno, varios o todos los jugadores de una plantilla; después, uno o varios atributos, un grupo —técnicos, físicos o mentales— o los 32. Los botones suman puntos a esa selección:

| Botón | Efecto |
|---|---|
| +1 | Suma un punto a cada atributo seleccionado. |
| +3 | Suma tres puntos a cada atributo seleccionado. |
| +5 | Suma cinco puntos a cada atributo seleccionado. |

Se respeta el límite de **30**: un 29 al recibir +3 queda en 30. Antes de aplicar se muestra el alcance de la modificación y los valores que alcanzarán el límite. Debe poder **deshacerse la operación, restaurar la referencia o guardar una variante**.

Cuerpo, edad, tendencias y estados tienen sus propios campos y unidades. Energía o forma se editan por separado. Un cambio prepara nuevas ejecuciones; los partidos iniciados o terminados conservan sus entradas originales.

<a id="grupo-24-04"></a>

### 24.4. Preparación y tres modalidades

*Procedencia: MD08, §4.*

<a id="src-md08-l0042"></a>

Antes de empezar se eligen equipos, localía, quintetos, director y alternativa, roles, rotación, estilos, disposiciones, libros y políticas de entrenador. Se parte de planes precargados editables. Se comprueba que la preparación tenga los datos obligatorios y las compatibilidades necesarias.

| Modalidad confirmada | Funcionamiento heredado y concreción |
|---|---|
| **Simulado total** | El usuario prepara los planes y los entrenadores dirigen automáticamente hasta finalizar. |
| **Por cuartos** | El encuentro se detiene al terminar cada periodo y resolver su administración pendiente. Se permite revisar el plan antes del siguiente periodo, incluidas las prórrogas. |
| **Por tiempo** | Se entiende como visionado con reloj a **x2, x4, x8 y x16**, pausa y órdenes durante el encuentro, según lo acordado anteriormente. |

La pausa de interfaz permite consultar y decidir. Las órdenes se aplican en la siguiente frontera válida; sustituciones y tiempos muertos respetan sus ventanas reglamentarias. El tiempo que el usuario permanece en pausa no genera descanso deportivo.

<a id="grupo-24-05"></a>

### 24.5. Simulación masiva

*Procedencia: MD08, §5.*

<a id="src-md08-l0054"></a>

Configurar **repeticiones de un enfrentamiento** o **cruces entre equipos seleccionados**, con cantidad de partidos y reparto de localía explícitos. Como accesos rápidos iniciales se proponen **10, 100 y 1.000 partidos**, además de cantidad editable; son tamaños de lote, no promesas de rendimiento.

Cada lote utiliza una versión identificada del motor, sus parámetros, plantillas y planes. Una semilla del lote genera semillas distintas y registradas para cada partido. Así se puede repetir una ejecución o comparar variantes con la misma lista de enfrentamientos y semillas.

Cada repetición comienza con los estados iniciales configurados: energía, forma, momento, disponibilidad, faltas y memoria. Los efectos de un encuentro no se arrastran al siguiente. Esto permite estudiar partidos comparables; una continuidad entre encuentros requeriría otro escenario declarado.

Se muestra el progreso, se permite detener el lote al finalizar el partido en curso y se conservan los resultados terminados. Los encuentros fallidos se identifican con su motivo y quedan separados de los agregados válidos.

<a id="grupo-24-06"></a>

### 24.6. Resultados y comparación

*Procedencia: MD08, §6.*

<a id="src-md08-l0064"></a>

Para cada partido se conserva el acceso al **marcador, parciales, acta, resumen, estadísticas y diagnóstico** definidos en los MD anteriores.

El lote ofrece una lectura inicial con victorias, puntos, posesiones, tiros y acierto, pérdidas, rebotes, faltas, tiros libres y rendimiento individual. Muestra tamaño de muestra y variación entre partidos, con acceso al catálogo completo aplicable. Los porcentajes agregados se calculan con totales compatibles de aciertos e intentos.

Se propone guardar una **base** y una **variante**, indicando qué cambió: por ejemplo, aumentar Pase de los bases o modificar la presión defensiva. La comparación conserva resultados y diferencias observadas; compartir semillas ayuda a comparar, aunque una decisión distinta puede cambiar el desarrollo posterior del partido.

La vista de entrenador mantiene los permisos de información acordados. El diagnóstico del laboratorio permite inspeccionar datos internos sin conceder esa información adicional a las decisiones deportivas del entrenador automático.

<a id="grupo-24-07"></a>

### 24.7. Exportación completa del lote para análisis

*Procedencia: MD08, §7.*

<a id="src-md08-l0076"></a>

#### 24.7.1. Descarga y alcance

*Origen: MD08 §7.1.*

Se incorpora la petición de Dennis: **«Descargar paquete completo de análisis»**, disponible para un partido o un lote. Incluye todos sus encuentros, resultados, entradas y registros necesarios para investigar lo sucedido. También se pueden descargar lotes interrumpidos, identificando su cobertura y estado.

**Formato recomendado:** un **ZIP** con tablas **CSV**, configuración **JSON** y registros **JSONL** —un registro estructurado por línea—, acompañado de una guía y un resumen legibles. Este formato permite a ChatGPT calcular distribuciones sobre miles de partidos, cruzar datos y localizar después las decisiones concretas que expliquen una anomalía.

El paquete es autocontenido: sus referencias a jugadores, planes y parámetros se resuelven con los archivos incluidos y conservan los valores usados en esa ejecución.

<a id="src-md08-l0084"></a>

#### 24.7.2. Contenido mínimo del paquete

*Origen: MD08 §7.2.*

| Archivo o conjunto | Contenido funcional |
|---|---|
| `README.md` y diccionario | Qué se simuló, objetivo del experimento, variantes y cambios deliberados. Definiciones de campos, unidades, categorías, nulos y relaciones entre archivos. |
| `manifest.json` | Identidad del lote y de la exportación; fecha; versiones de formato, motor, reglas y contenido; partidos solicitados, iniciados, terminados, fallidos y pendientes. Inventario de archivos, cantidades de registros, cobertura y comprobaciones de integridad. |
| `entradas/*.json` | Copia de plantillas con los 32 atributos, cuerpo, tendencias y estados iniciales; planes, roles, rotaciones, políticas, contexto y **parámetros efectivos del motor**, incluidos pesos, curvas, límites y ajustes. Semillas, generador aleatorio y derivación utilizada; órdenes manuales y automáticas vinculadas a su aplicación. |
| `estadisticas/*.csv` | Tablas de partidos, periodos, equipos, jugadores y demás universos del catálogo vigente: posesiones, finalizaciones, tiros, acciones, quintetos y tramos cuando correspondan. Los intentos y oportunidades acompañan a los aciertos. |
| `agregados/*.csv` | Recopilación del lote, distribuciones y comparaciones entre variantes. Incluye número de partidos, exposición, numeradores, denominadores, medias, dispersión y percentiles pertinentes. |
| `eventos/*.jsonl` | Todos los acontecimientos deportivos resueltos, ordenados y relacionados: acciones, tiros, rebotes, faltas, tiros libres, pérdidas, sustituciones, tiempos muertos, cambios tácticos, administración y finales. Incluye cambios de estado relevantes. |
| `decisiones/*.jsonl` | Traza de las elecciones y resoluciones efectivamente calculadas: participantes, tareas, entradas, opciones consideradas, probabilidades o pesos, sorteos, resultado y motivos estructurados. |
| `auditoria/*` | Validaciones ejecutadas y sus resultados, incidencias, errores y contexto de fallo; conciliaciones de marcador, acta, minutos, posesiones y relojes; cobertura de registro y tiempos de ejecución/exportación con sus unidades. Lo no comprobado queda identificado. |
| `resumen.md` | Lectura inicial del lote: muestra, configuración, cambios, resultados principales, dispersión, anomalías y enlaces o identificadores para investigar. Diferencia observaciones, estimaciones e hipótesis. |

Las entradas compartidas se guardan una vez por versión y se referencian desde cada encuentro. Una variante conserva tanto la referencia original como la modificación efectiva. Las tablas derivadas identifican su fuente y política estadística.

<a id="src-md08-l0100"></a>

#### 24.7.3. Qué debe explicar el log detallado

*Origen: MD08 §7.3.*

Cada registro se enlaza mediante **lote, variante, partido, secuencia, posesión, fase, finalización y evento**, según corresponda. Incluye periodo, reloj y duración deportiva, equipos y participantes pertinentes, quintetos o referencia a su tramo, y relación con el hecho o decisión que lo originó. También admite administración fuera de una posesión.

En cada resolución quedan disponibles los datos realmente utilizados:

- Intención, origen —libro, lectura, transición o decisión espontánea—, disposición, defensa, cobertura, responsabilidades y continuidad pertinentes.
- Atributos utilizados con su identificador, valor base y efectivo; energía, forma, momento individual o colectivo y demás modificadores aplicados. Los cambios de estado indican su causa y valor anterior/posterior.
- Referencias a las filas de configuración y pesos aplicados; componentes de la combinación, límites y valor final. Se conserva la distribución completa realmente calculada cuando hay alternativas excluyentes, o la probabilidad binaria y sus condiciones cuando corresponda.
- Opciones efectivamente evaluadas, descartes por requisito, elección, sorteos y desenlace, incluidos los resultados condicionales compatibles. Una alternativa no evaluada se distingue de una evaluada y rechazada.
- Peticiones tácticas, activación y ejecución; decisiones de rotación y sus factores; respuestas defensivas y actualizaciones de memoria cuando intervengan.

El registro se obtiene de las operaciones deportivas existentes. **Capturar o exportar mantiene las decisiones y los resultados y no consume sorteos deportivos adicionales.** La precisión corresponde a los acontecimientos resueltos y sus cambios; se preserva el modelo por acontecimientos acordado.

Un dato ausente, no aplicable o no calculado lleva un estado explícito. El relato y el resumen se apoyan en los hechos registrados. Una explicación causal posterior no se presenta como una razón observada durante la ejecución.

<a id="src-md08-l0116"></a>

#### 24.7.4. Cómo recibir lotes grandes de forma útil

*Origen: MD08 §7.4.*

La forma preferida de entrega para análisis con ChatGPT es **paquete completo + resumen de lote + objetivo de la comparación**. Ejemplo: «Mismos equipos y semillas; variante B con +3 en Pase de los bases; estudiar pérdidas, creación y distribución de tiros». Si Dennis no aporta una pregunta, el objetivo inicial será una auditoría general de coherencia y distribuciones.

Para grandes volúmenes, la descarga genera ZIP independientes numerados, con un índice global y archivos internos divididos por partidos completos. Cada paquete incluye las entradas necesarias y sus identificadores; los totales globales y los de cada parte se diferencian. El tamaño objetivo es configurable y se ajustará con mediciones de los primeros lotes. Un partido excepcionalmente grande puede dividir sus registros por secuencia, indicando las partes necesarias.

Se exporta el lote completo, sin muestreo ni recorte silencioso. Un extracto seleccionado o un registro incompleto declara su alcance. Los agregados generales cubren todos los encuentros válidos incluidos; las muestras y exclusiones acompañan a cada indicador.

Para explorar masivamente se utilizan CSV en UTF-8, con cabeceras estables, separador coma, punto decimal y campos entrecomillados cuando proceda. JSON y JSONL también usan UTF-8; fechas y unidades quedan declaradas. El esquema conserva versión e identificadores estables. Esto permite analizar primero los agregados y después recorrer los registros en bloques, sin tener que cargar todo el lote simultáneamente.

<a id="src-md08-l0126"></a>

#### 24.7.5. Utilidad y comprobaciones

*Origen: MD08 §7.5.*

El paquete debe permitir estudiar realismo global, diferencias tácticas, elección de participantes, uso de las **32 capacidades**, fatiga y estados, rotación, repetición/adaptación, situaciones espontáneas y coherencia estadística. Para cada atributo interesa distinguir **oportunidades de intervenir, usos efectivos y contribuciones calculadas**. Que aparezca en el log no demuestra por sí solo que tenga suficiente impacto; las comparaciones entre variantes ayudan a investigarlo.

Antes de entregar la descarga se comprueba que los archivos puedan leerse, sus relaciones se resuelvan, los conteos coincidan y los resultados concilien con los hechos. Las incidencias se incluyen en el paquete. Fallos, interrupciones y partidos incompletos conservan sus registros disponibles y se separan de los agregados de encuentros terminados.

El laboratorio conserva desde el inicio la información necesaria para la extracción completa y escribe los registros de forma progresiva. Se medirán almacenamiento y coste de registro/exportación. El nivel de cobertura real queda identificado en cada lote; las reconstrucciones y estimaciones se distinguen de los valores observados.

<a id="grupo-24-08"></a>

### 24.8. Recorrido funcional y relación con el panel

*Procedencia: MD08, §8.*

<a id="src-md08-l0134"></a>

El primer laboratorio utiliza el diseño vigente. Se reutiliza el panel administrable de parámetros y auditorías de los MD05–07 para ajustar el motor y se amplía su salida con la exportación completa solicitada. El recorrido principal queda en **plantillas y fichas → preparación → partido o lote → resultados, comparación y descarga**.

<a id="grupo-24-09"></a>

### 24.9. Población, modalidades y conservación

*Procedencia: MD05, §15.*

<a id="src-md05-l1056"></a>

#### 24.9.1. Mismo partido en todas las modalidades

*Origen: MD05 §15.4.*

| Modalidad | Política de avance | Consecuencia funcional |
|---|---|---|
| Visionado x2/x4/x8/x16 | Presentación y agrupación ajustadas. | Mismos hechos, reloj deportivo, gasto y probabilidades ante las mismas órdenes. |
| Cuarto a cuarto | Avanza hasta la frontera de periodo y permite preparar el siguiente tramo. | Plan y automatismos actúan dentro del cuarto. |
| Simulado completo | Avanza al final con dirección automática conforme al plan. | Mismo núcleo, sin marcador sorteado por otra fórmula. |
| Partidos del mundo | Presentación mínima o sin prosa. | Cobertura deportiva y estadística compatible con lo prometido. |
| Laboratorio | Avance inspeccionable y comparaciones. | Diagnóstico adicional; no reglas deportivas privilegiadas. |

Sin cambios de órdenes, entradas ni versión, cambiar la velocidad visual no debe alterar el partido. Si el usuario interviene antes de resolver el futuro, ese futuro puede cambiar. No se precomputa un final inamovible y luego se representa como interactivo.

<a id="grupo-24-10"></a>

### 24.10. Registro, versiones y modalidades

*Procedencia: MD06, §21.*

<a id="src-md06-l1378"></a>

#### 24.10.1. Modalidades y reproducción

*Origen: MD06 §21.4.*

| Modalidad | Qué cambia | Qué permanece |
|---|---|---|
| Visionado x2/x4/x8/x16 | Presentación y velocidad de avance. | Núcleo, hechos, estados, órdenes y estadísticas. |
| Avance por cuartos | Fronteras de intervención y cantidad de relato mostrado. | Resolución por acontecimientos y plan del tramo. |
| Simulación completa automática | Política de dirección delegada. | Mismo motor, conocimiento permitido y administración. |
| Partidos del mundo | Dirección automática y detalle de presentación disponible. | Categorías deportivas y datos necesarios para el catálogo comprometido. |
| Reproducción histórica | Consulta de hechos ya registrados. | Resultado histórico y versión original. |
| Comparación de laboratorio | Nueva ejecución con entradas o perfil identificados. | No sobrescribe el partido histórico como si fuera el mismo resultado. |

La igualdad de reproducción exige mismas entradas, versión, aleatoriedad y órdenes en las mismas fronteras. Si el usuario decide otra orden, está cambiando el partido; no se exige entonces el mismo resultado.

<a id="grupo-24-11"></a>

### 24.11. Ejemplos integrados

*Procedencia: MD06, §22.*

<a id="src-md06-l1579"></a>

#### 24.11.1. Mismo encuentro en x2 y x16

*Origen: MD06 §22.22.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación:** se conservan entradas, versión y órdenes en idénticas fronteras deportivas.

**Resolución vigente:** la velocidad de presentación no altera estados, probabilidades ni resultado. Si se omiten frases, no desaparecen hechos necesarios para el acta o el catálogo.

**Pausa:** abrir un panel no recupera energía ni atenúa el momento por tiempo real de lectura.

<a id="grupo-24-12"></a>

### 24.12. Modalidades, presentación y rendimiento

*Procedencia: MD03, §18.*

<a id="src-md03-l0799"></a>

#### 24.12.1. Núcleo común

*Origen: MD03 §18.1.*

| Modalidad | Funcionamiento |
|---|---|
| Visionado completo | Resuelve futuro y presenta acontecimientos; órdenes en ventanas permitidas |
| x2, x4, x8, x16 | Acelera presentación entre acontecimientos |
| Cuarto por cuarto | Resuelve posesiones del periodo y conserva estado al parar |
| Simulación completa | Mismo núcleo con dirección automática |
| Otros partidos del mundo | Mismo núcleo con salida de relato/diagnóstico reducida cuando no se necesita |

La misma semilla y órdenes en los mismos momentos deportivos producen el mismo desarrollo independientemente de velocidad. Si cambian las órdenes, cambia la entrada deportiva.

No se calcula un marcador final antes de la dirección en vivo. Las decisiones influyen en acontecimientos futuros.

<a id="src-md03-l0813"></a>

#### 24.12.2. Presentación

*Origen: MD03 §18.2.*

El reloj visual puede avanzar entre acontecimientos y el relato explicar la secuencia resumida. Esa presentación no introduce un bucle físico en el núcleo.

Una animación futura puede ilustrar participantes y desenlace ya resueltos; no tiene que reproducir una simulación de trayectorias que el motor no realizó. El detalle narrado debe corresponder al registro y no inventar pérdidas, asistencias o intervenciones adicionales.

<a id="grupo-24-13"></a>

### 24.13. Configuración, exportación y correcciones

*Procedencia: MD04, §31.*

<a id="src-md04-l1752"></a>

#### 24.13.1. Exportación: alcance deseado

*Origen: MD04 §31.4.*

Se conserva el alcance de exportación deportiva de resultado, acta, tablas filtradas, mapas, resumen e informe, con texto/Markdown, datos tabulares, formatos estructurados y presentación imprimible. Para análisis masivo, MD08 concreta el paquete ZIP con CSV, JSON y JSONL, guía, índice, entradas, registros y resumen.

Una exportación debe indicar encuentro, fecha de revisión, universo, filtros, unidades, política y cobertura. Incluye numeradores/denominadores cuando sean necesarios para interpretar tasas.

La exportación deportiva respeta la vista autorizada. La extracción diagnóstica completa del laboratorio incluye los datos internos declarados por MD08 bajo ese acceso; su disponibilidad no los entrega a la vista deportiva ni al entrenador automático.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c23-visibilidad-e-informacion-disponible](../estadisticas/c23-visibilidad-e-informacion-disponible.md) · Siguiente: [c25-p01-contenido-y-poblacion-con-y-pob](../validacion/c25-p01-contenido-y-poblacion-con-y-pob.md)
