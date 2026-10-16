<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 20 — Estadísticas: acta, atribución y magnitudes · parte 6 de 6
> Anterior: [c20-p05-catalogo-avanzado-y-formulas](c20-p05-catalogo-avanzado-y-formulas.md) · Siguiente: [c21-p01-lectura-ofensiva-libro-y-direccion-de-juego](c21-p01-lectura-ofensiva-libro-y-direccion-de-juego.md)
<!-- beM:nav-fin -->

<a id="grupo-20-20"></a>

### 20.20. Mapa de tiros y perfiles de finalización

*Procedencia: MD04, §18.*

<a id="src-md04-l0924"></a>

#### 20.20.1. Qué debe representar

*Origen: MD04 §18.1.*

El mapa debe permitir estudiar localización funcional, frecuencia, acierto, valor y contexto. No se simula una nube de coordenadas exactas cuando el motor solo sabe que el lanzamiento vino de una zona.

La visualización propuesta usa sectores de pista con conteos, color y leyenda. Un sector puede abrir la lista de intentos y sus circunstancias. Si más adelante existieran coordenadas verdaderamente resueltas, podrían añadirse; este diseño no las exige para conseguir una lectura profunda.

<a id="src-md04-l0930"></a>

#### 20.20.2. Catálogo vigente de sectores

*Origen: MD04 §18.2.*

Se utilizan los diez sectores funcionales aceptados, cuando el motor registra ese detalle deportivo:

| Sector | Clasificación funcional | Valor habitual | Propósito |
|---|---|---|---|
| Z01 | Aro/cercanía inmediata | Dos | Llegadas, mates, palmeos y finalizaciones próximas. |
| Z02 | Resto de pintura | Dos | Tiros cortos y posiciones interiores. |
| Z03 | Media izquierda | Dos | Perfil lateral de suspensión/intermedio. |
| Z04 | Media central | Dos | Perfil frontal/intermedio. |
| Z05 | Media derecha | Dos | Perfil lateral opuesto. |
| Z06 | Triple esquina izquierda | Tres | Espaciado y recepción en esquina. |
| Z07 | Triple exterior izquierda | Tres | Ala y salida exterior representadas. |
| Z08 | Triple central | Tres | Cabecera y finalizaciones frontales. |
| Z09 | Triple exterior derecha | Tres | Ala opuesta. |
| Z10 | Triple esquina derecha | Tres | Espaciado en la otra esquina. |

Esta división es una decisión propia de beM, aceptada en MD05 y conservada en MD07; no es una norma cartográfica ACB. El valor válido del tiro lo determina el acontecimiento reglamentario, no una suposición del dibujo. Los intentos muy lejanos o especiales pueden llevar una etiqueta adicional y sector conocido/desconocido.

Si una configuración solo representa interior, media y exterior, el mapa debe reconocer esa menor resolución. No distribuye aleatoriamente los intentos entre izquierda y derecha para parecer más detallado. El máximo deseado queda registrado; los datos disponibles determinan qué se puede mostrar honestamente.

<a id="src-md04-l0951"></a>

#### 20.20.3. Medidas por sector

*Origen: MD04 §18.3.*

| Medida | Lectura |
|---|---|
| Intentos y aciertos | Volumen y resultado con fracción visible. |
| Porcentaje | Conversión dentro del sector. |
| Frecuencia | Peso del sector entre los tiros elegibles. |
| Puntos de campo por intento | Valor de la producción de campo. |
| Canastas asistidas | Tipo de creación, sin equiparar AS a calidad universal. |
| Preparación | Recepción, bote, pantalla, corte u otra. |
| Oposición | Cómoda, normal o forzada, según la clasificación previa vigente. |
| Contexto de ataque | Organizado, transición, saque, segunda oportunidad. |
| Referencia | Diferencia frente a histórico o liga compatible. |

No se colorea un sector como «caliente» únicamente por un 1/1 sin mostrar muestra. Los mapas de frecuencia y eficacia usan escalas distintas; no se ofrece un rojo intenso ambiguo que pueda significar muchos tiros o mucho acierto.

<a id="src-md04-l0967"></a>

#### 20.20.4. Filtros y comparaciones

*Origen: MD04 §18.4.*

Se desea filtrar por equipo/jugador, periodo, rango temporal, cinco, director, familia, disposición, defensa, preparación, oposición, origen y condición de final de reloj.

La comparación entre dos mapas conserva el mismo universo y escala. Una diferencia de porcentajes muestra ambas muestras. Si se comparan un partido y una temporada, debe señalarse la asimetría de tamaño.

El mapa del rival puede servir para preparar defensa, pero no revela un atributo oculto ni garantiza que repetirá la selección. Describe sus tiros registrados bajo los contextos consultados.

<a id="src-md04-l0975"></a>

#### 20.20.5. Calidad de oportunidad

*Origen: MD04 §18.5.*

La escala categórica vigente es **cómoda, normal y forzada**. Se clasifica antes del desenlace a partir de separación funcional, preparación, oposición y reloj. Sus condiciones y fronteras numéricas se completan en el perfil administrable.

No se define «cómoda» como probabilidad absoluta alta para todo jugador. Un mal tirador liberado puede tener poca probabilidad y una opción espacial cómoda. La vista pública puede mostrar contexto; la probabilidad específica resuelta y los pesos pertenecen al diagnóstico.

Una comparación de acierto frente a calidad debe mostrar tiros de los tres grupos y tamaño de muestra. Un único fallo cómodo no significa que el motor esté roto ni que el entrenador generara una mala opción.

<a id="grupo-20-21"></a>

### 20.21. Ejemplos completos de conciliación y lectura

*Procedencia: MD04, §33.*

<a id="src-md04-l1827"></a>

#### 20.21.1. Referencia ACB: producción que explica una diferencia

*Origen: MD04 §33.1.*

Las páginas facilitadas por Dennis corresponden al Leyma Coruña–Casademont Zaragoza y muestran un 71–92. Se utilizan como referencia de presentación y comprobación aritmética, no como objetivo obligatorio de rendimiento del motor.

| Equipo | Dos | Tres | Libres | Puntos |
|---|---|---|---|---|
| Coruña | 22/39 → 44 | 7/39 → 21 | 6/11 → 6 | 71 |
| Zaragoza | 18/35 → 36 | 15/22 → 45 | 11/20 → 11 | 92 |

La diferencia se concilia: Zaragoza obtuvo 24 puntos más de tres, 8 menos de dos y 5 más de libres; `24 − 8 + 5 = 21`.

Con esos intentos, eFG de Coruña es `100 × (29 + 0,5 × 7)/78 = 41,7 %`; eFG de Zaragoza, `100 × (33 + 0,5 × 15)/57 = 71,1 %`. El cálculo muestra producción de campo. Sin datos contextuales adicionales no demuestra por sí solo qué defensa o decisión táctica causó la diferencia.

Este ejemplo usa las cifras consultadas de la referencia. No se han auditado todos los acontecimientos del partido real ni se deduce su número exacto de posesiones desde el acta. Las fuentes figuran en el [anexo de origen MD04 C](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#cap-33).

<a id="src-md04-l1842"></a>

#### 20.21.2. Ejemplo ficticio de cuatro posesiones completas

*Origen: MD04 §33.2.*

Este ejemplo explica contabilidad; no propone construir ni ensayar una acción aislada del motor.

| Posesión A | Secuencia resumida | Puntos | Créditos principales |
|---|---|---|---|
| A1 | Canasta de dos | 2 | T2: 1/1. |
| A2 | Pérdida | 0 | PER: 1; eventual REC rival si existe intervención elegible. |
| A3 | Falta de tiro en fallo no contabilizable; 1/2 libres; control rival | 1 | TL: 1/2; sin TCI; falta y rebote final según política. |
| A4 | Fallo de dos, rebote ofensivo, canasta de dos | 2 | T2: 1/2; RO: 1; misma posesión. |

Totales de A: 5 puntos, T2 2/3, TL 1/2, una pérdida, un rebote ofensivo y cuatro posesiones. `ORtg = 100 × 5/4 = 125`, si no existen otros puntos ni situaciones administrativas en ese universo.

Hay tres intentos de campo y una serie de libres. No hay cinco posesiones porque A4 tenga continuación. La estimación de acta daría `3 + 0,44 × 2 − 1 + 1 = 3,88`; es una aproximación, no una corrección que deba reemplazar las cuatro unidades registradas.

<a id="src-md04-l1857"></a>

#### 20.21.3. Ejemplo ficticio de origen y ejecución

*Origen: MD04 §33.3.*

Una posesión inicia bloqueo directo con prioridad 1. La defensa cambia; el ataque continúa hacia poste con prioridad 3 y termina en canasta de dos.

| Lectura | Resultado correcto |
|---|---|
| Posesiones por origen | Una de bloqueo directo, dos puntos vinculados. |
| Ejecuciones | Una ejecución de bloqueo directo y una de poste. |
| Finalización | Una finalización de dos desde el contexto representado. |
| Prioridad | Uso registrado de prioridad 1 y continuación de prioridad 3. |
| Defensa | Cambio realmente ejecutado, seguido de oposición correspondiente. |
| Resumen | Puede describir adaptación al cambio si esa relación está registrada. |

No son dos posesiones ni cuatro puntos. No se califica la prioridad 3 como desobediencia. Tampoco se declara que todos los cambios defensivos sean ineficaces por esta única secuencia.

<a id="src-md04-l1880"></a>

#### 20.21.4. Ejemplo ficticio de etiquetas de puntos

*Origen: MD04 §33.5.*

Un suplente convierte una entrada tras un robo acreditado a su equipo y la pérdida rival correspondiente, en transición, dentro de pintura.

Los mismos dos puntos aparecen en banquillo, pintura, tras pérdida y transición. El total sigue siendo dos. La tabla por valor de tiro muestra dos puntos de dos. El resumen puede describir las etiquetas, pero no sumar ocho puntos de «ventajas».

<a id="src-md04-l1886"></a>

#### 20.21.5. Ejemplo ficticio de calidad y resultado

*Origen: MD04 §33.6.*

Un jugador dispone de cinco tiros cómodos y convierte uno; otro convierte dos de tres forzados. El acta refleja ambos resultados. El mapa contextual conserva clasificación previa.

El resumen puede decir que el primero no aprovechó esas cinco oportunidades observadas y que el segundo convirtió tiros exigentes. No identifica al segundo como mejor decisión táctica en todas las ocasiones ni transforma las tres oportunidades en cómodas porque entraron.

<a id="grupo-20-22"></a>

### 20.22. Estadística y resumen: EST01–EST08

*Procedencia: MD07, §24.*

<a id="src-md07-l1237"></a>

#### 20.22.1. Catálogo conservado

*Origen: MD07 §24.1.*

Se mantiene todo el alcance vigente del MD04–06: acta individual/colectiva; tiros y mapa; creación, pérdidas, robos, tapones y rebotes; faltas y disponibilidad; minutos y tramos; posesiones y eficiencia; producción; parciales; análisis táctico; saques y finales; sin balón; quintetos/on-off; informes, historial y exportación.

El diccionario de cada indicador contiene definición, hecho necesario, unidad, numerador/denominador, universo, filtros, naturaleza, cobertura, muestra y permiso. No se sustituye el catálogo por una selección de pocos KPI.

<a id="grupo-20-23"></a>

### 20.23. Convenciones estadísticas y resumen

*Procedencia: MD05, §14.*

<a id="src-md05-l0942"></a>

#### 20.23.1. Posesión continua y conteo exacto beM

*Origen: MD05 §14.3.*

La posesión beM conserva continuidad tras rebote ofensivo y reanudación del mismo ataque. Tiene inicio, continuaciones y cierre explícitos. Los segmentos resueltos dentro de ella no se cuentan cada uno como otra posesión.

El conteo registrado es exacto **respecto a esta convención**. Una estimación convencional desde el acta puede mostrarse para comparación externa, con su fórmula y etiqueta de estimación. No sustituye el conteo del propio partido.

Los puntos administrativos no vinculados a una unidad ordinaria se conservan aparte. Una eficiencia global puede usar todos los puntos si lo declara; una eficiencia de origen táctico solo usa puntos vinculados a ese universo. No se fuerza una atribución táctica ficticia para cuadrar la suma.

<a id="grupo-20-24"></a>

### 20.24. Políticas estadísticas resueltas

*Procedencia: MD05, §23.*

<a id="src-md05-l1797"></a>

#### 20.24.1. Resolución de los veinte puntos de política estadística

*Origen: MD05 §23.6.*

| ID anterior | Estado tras MD05 | Decisión o tratamiento vigente | Trabajo restante delimitado |
|---|---|---|---|
| P04-01 Edición | **Cerrado** | FIBA 2026 v1.1 y perfil identificable. | Mapear y verificar sus casos al implementar. |
| P04-02 Acta | **Cerrado en política** | Referencia FIBA declarada, adaptación explícita a categorías 2026. | Completar tabla de correspondencias y excepciones de edición. |
| P04-03 Posesión | **Cerrado** | Continuidad beM, cierre explícito y estimaciones externas separadas. | Implementar y auditar fronteras. |
| P04-04 Sanciones/puntos | **Cerrado en criterio** | Causa y unidad vinculada; administrativos fuera cuando corresponda. | Completar los casos del perfil y su conciliación. |
| P04-05 Rebote colectivo | **Cerrado en criterio** | Crédito conforme a política, inclusión y universo declarados. | Completar clasificación de casos y ratios por oportunidades elegibles. |
| P04-06 Calidad | **Cerrado en estructura** | Cómoda/normal/forzada antes de resultado. | Parametrizar condiciones y probar su lectura. |
| P04-07 Sectores | **Cerrado** | Diez funcionales; detalle desconocido no se inventa. | Contenido de asignación y representación visual. |
| P04-08 Ejecución/localidad | **Cerrado en criterio** | Interacción efectivamente resuelta y resultado local enlazado. | Precisar filas de registro por mecanismo y ejemplos. |
| P04-09 Saque directo | **Cerrado** | Secuencia inicial antes de nueva organización. | Marcar frontera en contenido y registro. |
| P04-10 Sin balón | **Cerrado en criterio** | Tareas/efectos resueltos, sin inferencia ficticia. | Completar catálogo de utilidad y exposición. |
| P04-11 Quintetos/on-off | **Cerrado** | Presencia, completas y mixtas separados. | Construir consultas coherentes. |
| P04-12 Final ajustado | **Cerrado como consulta configurable** | Configuración inicial 2 minutos/5 puntos de margen previo. | Mostrar parámetros y validar filtros; no usarlo como toda la presión. |
| P04-13 Resumen | **Cerrado en comportamiento** | Entrada breve y ampliación al catálogo, claves sustentadas. | Orden visual y selección de contenido; cantidad inicial vigente: tres claves principales ampliables (MD07). |
| P04-14 Protagonista global | **Resuelto sin nueva fórmula** | Líderes por criterio; no se adopta nota integral MVP. | Diseño de presentación. Otra selección editorial sería una decisión nueva. |
| P04-15 Muestras | **Cerrado en criterio** | Conteos visibles, alertas/eligibilidad por indicador. | Cargar umbrales provisionales y referencias. |
| P04-16 Visibilidad | **Cerrado** | Público, propio/conocido y diagnóstico. | Matriz por campo cerrada en MD06; completar presentación y fronteras de categorías requeridas. |
| P04-17 Ajustadas/causales | **No adoptadas como métricas del núcleo** | No fabricar producción esperada o mérito causal desde el acta. | Conservar posibilidades del catálogo con estado no implementado/no definido. |
| P04-18 Historial/cobertura | **Cerrado en requisito** | Conservar relaciones suficientes para consultas prometidas. | Solución técnica, agregación y cobertura por versión. |
| P04-19 Exportación | **Cerrado en contenido semántico** | Unidades, filtros, universo, versión y permisos preservados. | Extracción completa definida en MD08: ZIP con CSV, JSON y JSONL, registros, entradas, guía y recopilación; completar su implementación y parámetros operativos. |
| P04-20 Momento | **Cerrado en estructura** | Tres ámbitos individuales más un estado colectivo; rachas separadas. | Tres ámbitos M-TIR/M-OFE/M-DEF, T restringido y episodios EPI01–EPI06 definidos en MD06; parametrizar magnitudes y auditar. |

«Cerrado en criterio» significa que ya no se comparan arquitecturas alternativas para ese comportamiento. No significa que todos los valores, excepciones normativas o campos técnicos estén rellenados en este documento.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c20-p05-catalogo-avanzado-y-formulas](c20-p05-catalogo-avanzado-y-formulas.md) · Siguiente: [c21-p01-lectura-ofensiva-libro-y-direccion-de-juego](c21-p01-lectura-ofensiva-libro-y-direccion-de-juego.md)
