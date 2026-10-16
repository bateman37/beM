<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: configuracion](README.md) · Capítulo 26 — Panel, parámetros, perfiles y versiones · parte 2 de 2
> Anterior: [c26-p01-panel-de-administracion-finalidad-y-organizacion](c26-p01-panel-de-administracion-finalidad-y-organizacion.md) · Siguiente: [c27-p01-organizacion-de-los-datos](c27-p01-organizacion-de-los-datos.md)
<!-- beM:nav-fin -->

<a id="grupo-26-03"></a>

### 26.3. Perfiles, versiones y ciclo de mejora

*Procedencia: MD05, §19.*

<a id="src-md05-l1407"></a>

#### 26.3.1. Qué identifica un perfil completo

*Origen: MD05 §19.1.*

Un encuentro utiliza un conjunto compatible de núcleo deportivo, reglamento, parámetros, contenido y política estadística. Se conservan sus versiones y las entradas efectivas necesarias.

Un cambio de presentación no altera el perfil deportivo. Un cambio de probabilidad sí. Cambiar una fórmula compartida no se disfraza de una edición menor de un número.

El usuario debe poder conocer qué perfil se utilizó en un partido y en un lote. Las diferencias entre perfiles se muestran por fila y por grupo, además de una explicación de los cambios de mecanismo cuando existan.

<a id="src-md05-l1415"></a>

#### 26.3.2. Flujo funcional

*Origen: MD05 §19.2.*

1. Elegir una base conocida y crear una candidata editable.
2. Registrar la observación y la hipótesis del ajuste.
3. Editar una o varias filas relacionadas, con diferencia visible.
4. Validar estructura, referencias, unidades y compatibilidad.
5. Jugar o simular partidos completos adecuados a la hipótesis.
6. Ejecutar auditorías pertinentes y comparar con la base.
7. Revisar efectos buscados y efectos secundarios.
8. Activar la candidata para futuros partidos, conservarla como experimento o descartarla.
9. Registrar motivo, valores y evidencia de la decisión.

Este es un flujo de la herramienta futura. No exige que Dennis solicite permiso a ChatGPT para cada edición ni que se active nada en esta entrega documental.

<a id="src-md05-l1429"></a>

#### 26.3.3. Activación y congelación

*Origen: MD05 §19.3.*

El perfil numérico queda fijado al iniciar el encuentro. Editar el panel no cambia secretamente un partido en curso. Las órdenes tácticas válidas sí afectan al futuro todavía no resuelto.

Para probar otro perfil sobre las mismas entradas se crea una ejecución comparativa identificada. No se sobrescribe el resultado original ni se insertan parámetros candidatos a mitad de su historia.

La reversión de perfil afecta a partidos futuros. El historial conserva sus versiones. Restaurar un valor no cambia estadísticas ya producidas.

<a id="src-md05-l1437"></a>

#### 26.3.4. Recomendaciones entre Dennis y ChatGPT

*Origen: MD05 §19.4.*

Una recomendación debe ser concreta y revisable: problema observado, universo, evidencia, causa probable, filas propuestas, cambio de valor, efecto esperado, auditoría y criterio de aceptación.

Ejemplo de formato: «En este conjunto, las decisiones directas de triple tras bote tienen demasiada presencia entre tiros forzados tempranos. Revisar primero SEL08/SEL09; comparar uso y calidad antes de tocar RES02. Mantener separada la conversión». No «bajar triples» sin saber qué capa se corrige.

La recomendación no se aplica automáticamente al perfil activo. Dennis puede editarla, probarla o descartarla en el panel. Las herramientas pueden preparar propuestas y comparaciones, manteniendo visible cada cambio.

<a id="src-md05-l1445"></a>

#### 26.3.5. Importación, exportación y restauración

*Origen: MD05 §19.5.*

El perfil se puede exportar con identificación, dependencias y estado de sus datos. La importación valida compatibilidad y muestra conflictos antes de crear o sustituir una candidata.

Debe poder restaurarse una base conocida o un valor heredado sin perder el registro de lo ensayado. Un perfil importado no renombra como contrastados sus valores provisionales ni elimina su procedencia.

La sintaxis concreta del archivo es decisión técnica. Su significado, versión y capacidad de comparación forman parte del requisito funcional.

<a id="src-md05-l1453"></a>

#### 26.3.6. Ajustar sin perseguir un marcador

*Origen: MD05 §19.6.*

No se ajusta un perfil porque un partido terminó con un resultado que no gustó. Se estudian distribuciones, oportunidades, selección, ejecución y contexto.

Un objetivo de referencia debe indicar población y muestra. No se obliga a que cada encuentro alcance una media, ni se cambia el motor durante el partido para corregir su desviación. Los extremos plausibles forman parte del baloncesto.

El panel debe permitir encontrar monopolios y defectos sin eliminar toda personalidad. Un equipo de especialistas puede lanzar mucho más de tres; la auditoría pregunta si la mezcla es coherente con oportunidades y capacidades, no si todos convergen al mismo porcentaje.

<a id="grupo-26-04"></a>

### 26.4. Ejemplos funcionales integrados

*Procedencia: MD05, §22.*

<a id="src-md05-l1705"></a>

#### 26.4.1. Ajuste del motor desde el panel

*Origen: MD05 §22.8.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

Dennis observa demasiados triples tempranos forzados en varios equipos que no deberían buscarlos. Abre el filtro de contexto temprano, decisión directa, preparación tras bote y calidad forzada.

Comprueba oportunidades, percepción y selección. Si la conversión está razonable pero la elección es excesiva, prepara una candidata en SEL08/SEL09 y deja la referencia de tiro intacta. Valida, compara partidos completos y revisa si también desaparecieron oportunidades buenas que sí quería conservar.

Puede aceptar el ajuste, reducirlo o descartarlo. El informe conserva filas y valores. Ningún partido histórico cambia y ningún jugador pierde su atributo Triple para arreglar una preferencia del motor.

<a id="grupo-26-05"></a>

### 26.5. Ampliación del panel administrable

*Procedencia: MD06, §20.*

<a id="src-md06-l1257"></a>

#### 26.5.1. Mismo panel, más contenido declarado

*Origen: MD06 §20.1.*

Se amplía el panel del MD05. Dennis debe poder localizar una regla, entender su efecto, ajustar sus parámetros permitidos, comparar versiones y consultar auditorías sin buscar pesos deportivos dispersos en el código.

No se prescribe una única tabla física gigante. Se exige una experiencia de administración integrada, con vistas relacionadas y exportación del perfil completo. Las relaciones entre tablas evitan que una misma regla se mantenga contradictoriamente en diez sitios.

<a id="src-md06-l1263"></a>

#### 26.5.2. Áreas añadidas o precisadas

*Origen: MD06 §20.2.*

| Área | Datos administrados | Vista de revisión |
|---|---|---|
| Asignación defensiva | Funciones, criterios, pesos y estabilidad. | Referencia frente a responsabilidad actual y cambios. |
| Objetivos y alternativas | Objetivo, alternativa, suspensión y recuperación. | Qué instrucción estuvo disponible y por qué. |
| Cuerpo | Derivación de alcance, referencias y pertinencia por tarea. | Contribución corporal sin duplicados. |
| Tendencias | Definiciones, escalas, límites y contribución por decisión. | Elecciones comparables, participación y zona. |
| Aplicación de órdenes | Tipo, frontera, ámbito y caducidad. | Solicitud → vigencia → hecho ejecutado. |
| Compatibilidad | Requisitos y conflictos entre instrucciones. | Rechazos y conservación de configuración válida. |
| Finalizaciones | Gesto, principal, preparación y créditos relacionados. | Catálogo y cobertura de casos. |
| Unidad F | Causas de apertura, enlace, cierre y exclusión. | F abiertas/cerradas y puntos reconciliados. |
| Episodios | Elegibilidad, destino, signo, agrupación y magnitud. | Señales usadas, descartadas y estado posterior. |
| Influencia de momento | Tareas elegibles y presupuesto compartido. | Cero influencia directa de T sobre conversión de tiro. |
| Información | Permiso, precisión y presentación por campo y audiencia. | Qué vio cada actor al decidir. |
| Auditoría | Escenario, población, métrica y tolerancia declarada. | Resultado por versión y diferencias. |

<a id="src-md06-l1280"></a>

#### 26.5.3. Ficha de cualquier parámetro

*Origen: MD06 §20.3.*

Cada parámetro deportivo debe tener nombre legible, identificador, tabla, descripción, unidad, rango válido, valor del perfil, neutralidad si procede, tareas afectadas, dependencias, procedencia, estado de calibración y versión.

También debe indicar qué permite cambiar. Un peso ajustable no es una obligación reglamentaria. Un permiso de información no es un porcentaje de tiro. Una causa de exclusión no debe convertirse en una preferencia porque resulte cómodo ponerle un número.

<a id="src-md06-l1286"></a>

#### 26.5.4. Cuatro clases de administración

*Origen: MD06 §20.4.*

| Clase | Ejemplo | Tratamiento |
|---|---|---|
| Regla reglamentaria | Ventana válida de sustitución. | Perfil reglamentario coherente; no se altera para arreglar un ratio. |
| Decisión funcional | T no modifica directamente conversión de tiro. | Invariante del diseño; cambiarla exige nueva decisión funcional. |
| Parámetro de balance | Sensibilidad de una preferencia o persistencia de M. | Ajustable en borrador, con límites y auditoría. |
| Contenido | Ficha, requisitos y alternativa declarada. | Editable dentro del contrato; debe superar validación de contenido. |

Dennis conserva control sobre los datos y puede promover una nueva decisión si quiere cambiar un invariante. El panel debe distinguir conscientemente esa operación de un ajuste ordinario de balance.

<a id="src-md06-l1297"></a>

#### 26.5.5. Estados del perfil

*Origen: MD06 §20.5.*

Se mantienen borrador, validación, comparación, aprobación y publicación del MD05. Una publicación identifica el conjunto completo y compatible de reglas, contenido, escalas y políticas.

Un encuentro utiliza su versión congelada. Un ajuste posterior sirve para nuevos encuentros o para una nueva ejecución comparativa, conservando los resultados anteriores.

No hay un control de administración que cambie sin rastro la probabilidad de una posesión en curso y deje después el partido asociado a la versión vieja.

<a id="src-md06-l1305"></a>

#### 26.5.6. Relaciones y validación

*Origen: MD06 §20.6.*

La validación comprueba referencias existentes, rangos, requisitos realizables, alternativa defensiva utilizable, correspondencia entre técnica y tarea, estados de orden completos y audiencias válidas.

También detecta:

- Altura, envergadura y alcance usados como tres primas equivalentes.
- Tendencia conectada a una fórmula de conversión en vez de a una elección.
- Momento colectivo aplicado directamente al acierto del tiro.
- Llamadas sin ámbito o sin causa de cierre.
- Serie de libres enlazada por proximidad en vez de causa.
- Puntos administrativos atribuidos a F sin acción ligada.
- Permisos que revelen estados rivales internos al entrenador.

<a id="src-md06-l1319"></a>

#### 26.5.7. Experimentos y recomendaciones

*Origen: MD06 §20.7.*

El panel permite preparar comparaciones controladas entre versiones, elegir poblaciones representativas y revisar distribuciones de partidos completos. La misma semilla puede ayudar a comparar, pero no convierte cada acción en un contrafactual idéntico si cambian las decisiones y el consumo aleatorio.

Una recomendación de ajuste debe explicar problema observado, parámetro implicado, efecto esperado, incertidumbre y métricas a revisar. No se corrigen porcentajes agregados sumando un bonus sin identificar qué selección o tarea está mal.

<a id="src-md06-l1325"></a>

#### 26.5.8. Ratios útiles para esta entrega

*Origen: MD06 §20.8.*

| Área | Ratios o distribuciones de revisión | Precaución |
|---|---|---|
| Asignaciones | Cambios de referencia, cambios reales, desajustes mantenidos y corregidos. | No fijar un número artificial de cambios por partido para todos los estilos. |
| Objetivos | Tiempo aplicable, suspensión, alternativa y reactivación. | No contar alternativa como uso de la defensa objetivo. |
| Tendencias | Participación, decisiones directas y reparto zonal por contexto. | La distribución observada no es una cuota obligatoria. |
| Finalizaciones | Gesto, zona, calidad, técnica y desenlace. | No sumar etiquetas superpuestas como intentos adicionales. |
| F | Unidades, puntos ligados, sanción y administración. | Reconciliar con acta, posesiones y series. |
| Momento | Ocupación de categorías, duración, impulsos y efecto por tarea. | Separar estado de racha y selección de conversión. |
| Órdenes | Espera, aplicación, caducidad y ejecución. | No confundir imposibilidad con fallo de habilidad. |
| Información | Campos entregados y motivos visibles. | La ausencia de filtración se comprueba en la entrada del decisor. |

<a id="src-md06-l1338"></a>

#### 26.5.9. Qué no se exige para disponer de control

*Origen: MD06 §20.9.*

La administración declarativa no significa inventar un lenguaje de programación para Dennis. Las condiciones deben expresarse con campos deportivos, operadores acotados y catálogos comprensibles.

Los mecanismos generales seguirán necesitando implementación. Lo que no debe quedar oculto son los pesos, curvas, compatibilidades y políticas deportivas que se promete poder ajustar.

<a id="grupo-26-06"></a>

### 26.6. Soportes y funcionamiento del panel

*Procedencia: MD07, §27.*

<a id="src-md07-l1441"></a>

#### 26.6.1. Perfil utilizable

*Origen: MD07 §27.5.*

La activación requiere cobertura completa de datos obligatorios, referencias resueltas, curvas y distribuciones válidas, alternativas realizables y conflictos resueltos.

Una validación estructural correcta no demuestra realismo deportivo. El perfil puede estar completo y pendiente de evaluación. El estado de ambas comprobaciones se muestra por separado.

<a id="grupo-26-07"></a>

### 26.7. Diccionario y ejemplos de lectura

*Procedencia: MD07, anexo C.*

<a id="src-md07-l2116"></a>

#### 26.7.1. Dos formas de editar el mismo mecanismo

*Origen: MD07 §C.2.*

El modo guiado puede mostrar probabilidad de referencia y ejemplos de respuesta ante jugadores/oposición. El avanzado puede mostrar la transformación y sensibilidades empleadas.

La representación legible no añade otra cifra que mande por debajo. Ambos modos modifican los mismos datos, con el mismo perfil y versión.

El panel debe poder previsualizar la relación en varios puntos. Una sensibilidad no equivale a añadir el mismo número de puntos porcentuales en toda la curva.

<a id="src-md07-l2162"></a>

#### 26.7.2. Ejemplo de ajuste de selección

*Origen: MD07 §C.8.*

Se observa exceso de triples tempranos forzados. La revisión distingue cuántas oportunidades existían, cuáles se percibieron, cuáles se aceptaron y qué calidad tenían antes del resultado.

Si la hipótesis afecta aceptación, las filas candidatas estarán en SEL08/SEL09. Se comparan elección, tiempo, pérdidas y oportunidades posteriores. La referencia de conversión del tiro conserva su identidad salvo que exista otra hipótesis explícita para cambiarla.

El informe del ajuste indica qué se conserva, qué cambia y qué podría empeorar. Puede descartarse si reduce también oportunidades buenas o aumenta otros costes.

<a id="src-md07-l2190"></a>

#### 26.7.3. Ejemplo de edición y versión

*Origen: MD07 §C.12.*

Se copia un perfil publicado y se cambia un conjunto de pesos. El borrador conserva origen, diferencias y motivo. Tras validar y evaluar lo pertinente, puede activarse como versión nueva para encuentros nuevos.

El partido ya iniciado conserva sus valores efectivos. Una comparación vuelve a ejecutar con la candidata como ejecución identificada, sin sobrescribir el resultado histórico atribuido a la base.

<a id="grupo-26-08"></a>

### 26.8. Configuración, exportación y correcciones

*Procedencia: MD04, §31.*

<a id="src-md04-l1722"></a>

#### 26.8.1. Qué es configurable

*Origen: MD04 §31.1.*

| Grupo | Opciones funcionales propuestas |
|---|---|
| Reglamento | Edición, duración, sanciones y condiciones deportivas pertinentes. |
| Atribución | Perfil de asistencias, créditos colectivos y excepciones de tiro/rebote. |
| Posesión | Inicio/cierre, continuidad de sanciones y puntos administrativos. |
| Métricas | Fórmulas, normalización, inclusión de colectivos y nombres visibles. |
| Oportunidades | Criterios categóricos y ámbitos observables. |
| Sectores | Granularidad representada y correspondencia visual. |
| Final ajustado | Tiempo, margen previo, periodos y prórrogas. |
| Muestras | Umbrales de ranking, aviso y comparación. |
| Resumen | Selección, longitud visual, claves y momentos. |
| Historial | Universos de comparación y compatibilidad de políticas. |
| Visibilidad | Información pública, propia, observada y diagnóstica. |

Esto añade configuración de interpretación/presentación, no otra tabla que decida aciertos después del motor. Cambiar una política de asistencia puede cambiar AS, pero no debe volver a tirar el partido para alterar las canastas.

<a id="src-md04-l1740"></a>

#### 26.8.2. Qué no debe ser un ajuste arbitrario del usuario

*Origen: MD04 §31.2.*

No se permite cambiar retrospectivamente créditos para beneficiar a un equipo sin una corrección identificada. Tampoco variar denominadores de una tabla y seguir mostrando el mismo nombre como si no hubiera cambiado la definición.

La configuración global o del mundo determina convenciones consistentes. Los filtros personales modifican lo que se consulta; no reescriben los hechos deportivos.

<a id="src-md04-l1746"></a>

#### 26.8.3. Versiones y compatibilidad

*Origen: MD04 §31.3.*

Cada fórmula/criterio tiene versión cuando su modificación cambia resultados. La versión del motor y la política estadística son conceptos distintos: un nuevo peso de selección altera partidos futuros; una nueva atribución puede reinterpretar hechos existentes si tienen información suficiente.

Si se recalculan datos antiguos con política nueva, se marca la conversión y se conserva trazabilidad. Si no existe información para hacerlo, no se presenta una cifra reconstruida como exacta.

<a id="src-md04-l1760"></a>

#### 26.8.4. Presentación y accesibilidad

*Origen: MD04 §31.5.*

Como alcance funcional se contempla consulta en pantallas amplias y estrechas, columnas agrupadas, encabezados claros, glosario, ordenación, teclado y una alternativa textual a colores o gráficos.

El rojo/verde no puede ser la única forma de distinguir acierto, frecuencia o ventaja. Un mapa debe poder leerse también como tabla de sectores. Una evolución debe ofrecer momentos y cifras sin depender únicamente de la curva.

Se desea mantener unidades y nombres consistentes en todos los idiomas. Las abreviaturas pueden traducirse, pero el identificador funcional conserva significado. La moneda o economía del manager no afecta al acta deportiva.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c26-p01-panel-de-administracion-finalidad-y-organizacion](c26-p01-panel-de-administracion-finalidad-y-organizacion.md) · Siguiente: [c27-p01-organizacion-de-los-datos](c27-p01-organizacion-de-los-datos.md)
