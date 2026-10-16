<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: configuracion](README.md) · Capítulo 27 — Inventario de tablas y contratos de datos · parte 1 de 3
> Anterior: [c26-p02-perfiles-versiones-y-ciclo-de-mejora](c26-p02-perfiles-versiones-y-ciclo-de-mejora.md) · Siguiente: [c27-p02-estadistica-y-resumen-est01est08](c27-p02-estadistica-y-resumen-est01est08.md)
<!-- beM:nav-fin -->

<a id="cap-27"></a>

## 27. Inventario de tablas y contratos de datos

El recuento vigente es 81 grupos deportivos y de contenido más cuatro soportes transversales. Los 23 elementos T06 se clasifican como configuración, entrada, registro o vista; IN01–IN03 y R01–R08 son contratos semánticos, no nuevos grupos que haya que sumar.

<a id="grupo-27-01"></a>

### 27.1. Organización de los datos

*Procedencia: MD07, §4.*

<a id="src-md07-l0156"></a>

#### 27.1.1. Cuatro clases

*Origen: MD07 §4.1.*

| Clase | Contenido | Operación ordinaria |
|---|---|---|
| Configuración | Pesos, curvas, condiciones, referencias y políticas. | Editar un borrador, validar y versionar. |
| Contenido y entrada | Fichas, jugadores, equipos y planes. | Preparar, validar e identificar antes de usarlos. |
| Estado y registro | Lo que ocurre y sus relaciones pertinentes. | Generar, consultar y conservar con identidad. |
| Vista derivada | Acta, indicadores, resumen, mapas y comparaciones. | Calcular desde hechos y políticas compatibles. |

Una corrección admitida genera una revisión identificada. No se cambia una traza histórica para hacer parecer que otra configuración produjo el partido.

<a id="src-md07-l0167"></a>

#### 27.1.2. Recuento del inventario deportivo

*Origen: MD07 §4.2.*

| Prefijo | Cantidad | Ámbito |
|---|---:|---|
| SEL | 12 | Selección. |
| DEF | 9 | Defensa. |
| RES | 13 | Oportunidad y desenlace. |
| ACT | 12 | Tiempo, esfuerzo y estados. |
| ENT | 7 | Entrenador. |
| MEM | 4 | Adaptación. |
| CON | 4 | Contenido táctico. |
| POB | 3 | Población. |
| EST | 8 | Estadística e información. |
| REF | 2 | Referencias. |
| LAB | 1 | Escenarios y auditorías. |
| **Subtotal heredado** | **75** | Identificadores del MD05 conservados. |
| COR | 2 | Ubicación explícita del contenido corporal. |
| REG | 4 | Ubicación explícita de administración reglamentaria. |
| **Total deportivo y de contenido** | **81** | Grupos funcionales. |

SUP01–SUP04 añaden cuatro soportes transversales. Los tres paquetes de entrada y ocho registros del [MD07 §28](../estadisticas/c19-registro-conservacion-y-reproduccion.md#cap-19) pertenecen a otra clasificación; no se suman como parámetros deportivos.

<a id="src-md07-l0189"></a>

#### 27.1.3. Relación con las tres tablas

*Origen: MD07 §4.3.*

| Tabla funcional | Consulta principal |
|---|---|
| Selección | SEL, planes CON, preferencias POB, políticas ENT y respuestas DEF/MEM pertinentes. |
| Oportunidades y desenlaces | RES, COR, responsabilidades DEF y estados aplicables. |
| Tiempo, esfuerzo y estados | ACT, REG, cambios ENT, memoria MEM y registro resultante. |

Las métricas y el resumen consumen hechos. Un cambio de presentación estadística no modifica probabilidades deportivas.

<a id="src-md07-l0199"></a>

#### 27.1.4. Granularidad elegida

*Origen: MD07 §4.4.*

Una tarea tiene una referencia compartida. Una excepción declara qué causa exige otro valor: preparación, reloj, oposición, disponibilidad u otra condición representada.

La excepción sustituye la referencia del mismo concepto. No vuelve a sumar esa referencia como bonus. Los modificadores compatibles tienen composición y límites definidos.

La especificidad y prioridad entre filas deben resolver una única configuración efectiva. Una colisión no resuelta impide validar el perfil.

<a id="src-md07-l0207"></a>

#### 27.1.5. Cantidad de filas

*Origen: MD07 §4.5.*

Los 81 grupos no fijan un número artificial de coeficientes. Un grupo puede contener una definición o numerosas filas pertinentes. Las condiciones y excepciones justificadas determinan ese contenido.

La cobertura de publicación exige todas las filas requeridas y referencias resueltas. La ausencia no se completa con una constante deportiva escondida en código.

<a id="grupo-27-02"></a>

### 27.2. Contrato de una fila completa

*Procedencia: MD07, §5.*

<a id="src-md07-l0215"></a>

#### 27.2.1. Campos comunes

*Origen: MD07 §5.1.*

| Campo | Requisito funcional |
|---|---|
| ID y nombre | Identidad estable y etiqueta comprensible. |
| Grupo y propósito | Qué controla y qué problema deportivo representa. |
| Tipo | Peso, distribución, probabilidad, sensibilidad, duración, nodo, condición, categoría o referencia. |
| Unidad | Peso relativo, proporción, puntos porcentuales, segundos, energía u otra unidad declarada. |
| Contexto | Campos y condiciones tipados que activan la fila. |
| Actor y contraparte | Quién ejecuta y quién se opone cuando corresponde. |
| Operación | Tarea compartida o administración que interpreta el dato. |
| Valor y límites | Valor efectivo, rango, neutralidad y restricciones aplicables. |
| Composición | Sustitución, combinación o exclusión respecto a otras filas. |
| Continuidad | Qué contexto, derecho o tarea queda después cuando procede. |
| Registro y métricas | Hecho de origen y consultas que necesitan el dato. |
| Información | Audiencia y precisión permitidas. |
| Procedencia | Decisión, semilla, referencia externa o ajuste evaluado. |
| Versión | Perfil de origen, herencia y cambio. |
| Cobertura | Casos y auditorías que pueden comprobarla. |

Los campos se aplican según el tipo de fila. Una etiqueta de pantalla no necesita contraparte defensiva. Una referencia binaria sí necesita universo y condición.

<a id="src-md07-l0237"></a>

#### 27.2.2. Tipos que deben conservar significado

*Origen: MD07 §5.2.*

Un peso 8 no es una probabilidad del 80 %. Una subida de tres puntos porcentuales no es multiplicar por 1,03. Un cero no es un dato ausente. Restablecer herencia no pone el valor a cero.

Las distribuciones de resultados excluyentes deben ser válidas en su universo. Las relaciones condicionales mantienen su condición explícita. Los créditos compatibles no se modelan como categorías que necesariamente se excluyen entre sí.

<a id="src-md07-l0243"></a>

#### 27.2.3. Terminación de una ficha de contenido

*Origen: MD07 §5.3.*

Una ficha completa identifica intención, requisitos, funciones, opciones, continuaciones, seguridad, inicio efectivo, causas de cierre y relaciones de registro. Su prioridad pertenece al plan que la utiliza.

Una etiqueta que dice «bloqueo lateral» sin esos elementos no constituye una ficha completa. Tampoco hace falta una trayectoria continua para completarla.

<a id="grupo-27-03"></a>

### 27.3. Selección: SEL01–SEL12

*Procedencia: MD07, §6.*

<a id="src-md07-l0249"></a>

| ID | Contenido requerido | Salida comprobable |
|---|---|---|
| SEL01 | Pesos 1–5, agregación por familia y selección de variante elegible. | Preferencia efectiva sin aumentar masa por duplicación de fichas. |
| SEL02 | Mapeo de cada nivel de los 12 estilos a preferencias, condiciones o límites pertinentes. | Diferencias de elección o encargo al cambiar el nivel. |
| SEL03 | Origen, organización rival y condiciones de transición, temprano u organizado. | Oportunidad disponible frente a vía utilizada. |
| SEL04 | Prioridad interior/exterior y tres instrucciones de media distancia. | Elecciones condicionadas, sin cuotas obligatorias. |
| SEL05 | Plan, libertad, Iniciativa y procedencia llamada/autonomía/directo. | Uso del margen y desviación explicable. |
| SEL06 | Percepción y elección con Visión, Decisiones, contexto y reloj. | Diferencia entre opción existente, percibida y elegida en diagnóstico. |
| SEL07 | Funciones, disponibilidad, roles, capacidades pertinentes y ocupación de tareas. | Director, ejecutante y apoyos compatibles. |
| SEL08 | Aceptación de oportunidad inmediata según calidad percibida, preparación y alternativa. | Tirar, penetrar, pasar o continuar. |
| SEL09 | Preferencias de riesgo y decisiones precipitadas dentro del contexto. | Errores de elección posibles y acotados. |
| SEL10 | Conservación, salida segura y reorganización elegibles. | Una negación no termina siempre en tiro forzado o pérdida. |
| SEL11 | Objetivo de reloj/marcador y necesidad temporal. | Elección viable para el tiempo realmente disponible. |
| SEL12 | Ejecutor preferido, sustituto funcional y prioridad manual válida. | La ausencia de un nombre no rompe toda ficha compatible. |

<a id="src-md07-l0266"></a>

#### 27.3.1. Regla común

*Origen: MD07 §6.1.*

Elegibilidad y obligaciones se aplican antes de preferencias. Los candidatos relacionan jugador, preparación, oportunidad y oposición. No se elige un tirador aislado para asignarle después un recurso imposible.

Las prioridades 1–5 admiten varias fichas en el mismo nivel. Una preferencia baja puede elegirse; una alta puede ser inviable. Se conserva la agregación que evita premiar duplicados.

<a id="src-md07-l0272"></a>

#### 27.3.2. Tendencias y lectura

*Origen: MD07 §6.2.*

Iniciativa orienta disposición a utilizar el margen. Vocación de finalización orienta asumir el desenlace. Preferencia de zona orienta reparto relativo entre opciones elegibles. Ninguna sustituye Comprensión, Visión o Decisiones.

El jugador que recibe y decide utiliza sus capacidades. La calidad del director anterior no se distribuye como una mejora general del quinteto.

<a id="src-md07-l0278"></a>

#### 27.3.3. Continuación y urgencia

*Origen: MD07 §6.3.*

Continuar requiere tiempo, control y una opción pertinente. La elaboración no obliga a encadenar varias acciones. La proximidad de reloj cambia qué merece la pena aceptar, sin conocer el desenlace futuro.

El riesgo tiene unidad declarada. Una circulación resumida no cobra la probabilidad completa de pérdida de una posesión por cada pase mencionado.

<a id="grupo-27-04"></a>

### 27.4. Defensa: DEF01–DEF09

*Procedencia: MD07, §7.*

<a id="src-md07-l0284"></a>

| ID | Contenido requerido | Salida comprobable |
|---|---|---|
| DEF01 | Funciones de individual, 2–3, 3–2, 1–3–1, 1–2–2 y box and one. | Referencias y responsabilidades de quienes intervienen. |
| DEF02 | Mapeo de ayudas, presión al balón, receptores, riesgo de robo y protección. | Amenaza contenida y concesión correspondiente. |
| DEF03 | Altura normal, tres cuartos y total, con intensidad separada. | Avance, carga y ventaja resultante si se supera. |
| DEF04 | Drop, cambio, show y atrapar; navegación compatible. | Seguimiento, intercambio, compromiso y recuperación reales. |
| DEF05 | Elegibilidad, compromiso y recuperación de ayuda. | Receptor menos protegido y respuesta posterior posible. |
| DEF06 | Objetivo principal, alternativa, doble y no abandonar. | Aplicación, suspensión o limitación explicadas. |
| DEF07 | Decisión de contener o intentar intervención sobre balón/tiro. | Oportunidad, intento, coste y autor correctos. |
| DEF08 | Plantillas defensivas de saque y necesidades de último ataque. | Recepción negada o concedida y continuidad. |
| DEF09 | Respuestas compatibles sugeridas por memoria. | Reconocimiento traducido a una decisión ejecutable. |

<a id="src-md07-l0298"></a>

#### 27.4.1. Organización y ejecución

*Origen: MD07 §7.1.*

Seis fichas de organización declaran funciones y reutilizan contención, negación, ayuda, recuperación y oposición. No hay un porcentaje global que sustituya esas diferencias.

La asignación de referencia se conserva estable cuando es compatible. La responsabilidad actual mantiene lo que han producido cambios y ayudas. La defensa no vuelve gratuitamente a cinco emparejamientos ideales en cada nueva decisión.

<a id="src-md07-l0304"></a>

#### 27.4.2. Concesiones y conflictos

*Origen: MD07 §7.2.*

Una ayuda compromete un participante y una responsabilidad. La presión puede consumir tiempo y dificultar control, y también dejar ventaja si se supera. La validación de la orden no garantiza ejecución.

No abandonar restringe al ayudante. La doble utiliza otro elegible o queda limitada. La protección del tirador no se viola silenciosamente.

<a id="src-md07-l0310"></a>

#### 27.4.3. Objetivos ausentes

*Origen: MD07 §7.3.*

Se utiliza la alternativa individual declarada o se suspende la instrucción. Box and one utiliza su organización alternativa, 2–3 preconfigurada, cuando corresponde. El regreso del objetivo solo recupera ese plan si sigue vigente, en una frontera pertinente.

<a id="grupo-27-05"></a>

### 27.5. Resolución: RES01–RES13

*Procedencia: MD07, §8.*

<a id="src-md07-l0314"></a>

| ID | Contenido requerido | Salida comprobable |
|---|---|---|
| RES01 | Principal, apoyos y contraparte por tarea; propiedad de cada capacidad. | Mapa causal de las 32 y pesos pertinentes. |
| RES02 | Referencia binaria por situación y población identificadas. | Probabilidad de referencia y contexto. |
| RES03 | Normalización, sensibilidades, límites y correcciones pertinentes. | Respuesta gradual a capacidad y oposición. |
| RES04 | Alternativas excluyentes y su universo. | Distribución válida de acontecimientos. |
| RES05 | Contacto, canasta y sanción compatibles bajo condición. | Combinación coherente, con causa y administración. |
| RES06 | Preparación por recepción, bote, desplazamiento y estabilidad. | Función de TEC06 sin doble prima de puntería. |
| RES07 | Catálogo de gesto y principal de tiro. | Fronteras TEC01–TEC05, incluidas floater y palmeo. |
| RES08 | Creación mediante balón, poste, corte, pantalla o entrega. | Oportunidad antes de su ejecución final. |
| RES09 | Riesgo por ejecución o exposición y causas de interrupción. | Una incidencia ocurre en su contexto pertinente. |
| RES10 | Participación, cierre, acceso, disputa, captura y salida. | Captor, ayuda del cerrador y continuidad distintos. |
| RES11 | Uso y recuperación de relaciones activas. | Ventaja o desajuste conservado hasta modificación real. |
| RES12 | Condiciones de calidad previa. | Cómoda, normal o forzada antes del desenlace. |
| RES13 | Incidencias condicionadas menos frecuentes. | Activación pertinente y consecuencia reglamentaria enlazada. |

<a id="src-md07-l0332"></a>

#### 27.5.1. Modelo elegido

*Origen: MD07 §8.1.*

Se mantiene la combinación aceptada: distribución de resultados excluyentes cuando corresponde, logística para binarias pertinentes y relaciones condicionales para combinaciones compatibles.

La tabla de cada tarea declara qué operación usa. No se sortean separadamente varias categorías incompatibles para arreglarlas después. Una canasta con falta conserva su relación causal.

<a id="src-md07-l0338"></a>

#### 27.5.2. Una aplicación por causa

*Origen: MD07 §8.2.*

Una mejor preparación puede producir una oportunidad mejor. Si esa mejora ya está representada, no reaparece como otra prima equivalente a la conversión.

La técnica principal mantiene su función. Los apoyos no convierten una técnica muy baja en una especialidad por simple promedio. No se utiliza un overall del quinteto para resolver tareas individuales.

<a id="src-md07-l0344"></a>

#### 27.5.3. Tiro y créditos

*Origen: MD07 §8.3.*

Un floater en progresión utiliza TEC04; un toque corto controlado desde apoyo utiliza TEC03. El palmeo directo utiliza TEC04 cuando representa ese intento. El rebote asegurado y posterior tiro corto controlado utiliza TEC03 para el lanzamiento.

TEC06 prepara cuando corresponde, mientras TEC01 o TEC02 ejecutan su tiro exterior. El crédito estadístico de intento, rebote, tapón o asistencia se decide por su política, no por el nombre narrativo.

<a id="src-md07-l0350"></a>

#### 27.5.4. Alcance de la precarga

*Origen: MD07 §8.4.*

Las referencias, sensibilidades y mezclas por tarea deben estar cargadas antes de publicar el perfil. Los documentos contienen semillas parciales; esta especificación no las presenta como una matriz numérica completa ya preparada.

<a id="grupo-27-06"></a>

### 27.6. Cuerpo: COR01–COR02

*Procedencia: MD07, §9.*

<a id="src-md07-l0354"></a>

| ID | Contenido requerido | Límite |
|---|---|---|
| COR01 | Derivación de alcance funcional desde altura y envergadura; referencias, normalización y límites. | No crea otra capacidad ni afirma medir alcance de pie en centímetros. |
| COR02 | Pertinencia y sensibilidad por tarea del alcance y del componente dinámico separado. | No concede intervención a quien no llega ni repite tres ventajas de tamaño. |

<a id="grupo-27-07"></a>

### 27.7. Tiempo y estados: ACT01–ACT12

*Procedencia: MD07, §10.*

<a id="src-md07-l0381"></a>

| ID | Contenido requerido | Comprobación |
|---|---|---|
| ACT01 | Duración por contexto y desenlace: mínimo, habitual y máximo. | Tiempo hasta el hecho compatible con relojes. |
| ACT02 | Unidad y referencia de exposición sostenida. | Fragmentar representación no multiplica riesgo. |
| ACT03 | Gasto por intervalo/carga y sensibilidad a Resistencia. | Coste de tareas reales, una vez. |
| ACT04 | Recuperación por banquillo y pausas, con límites. | Un intervalo no se cobra dos veces. |
| ACT05 | Curva de energía y deterioro máximo por tarea. | 100–70 casi neutro y reserva crítica muy costosa. |
| ACT06 | Efecto de Forma por ámbito y contrato de entrada. | Se mantiene estable dentro del encuentro. |
| ACT07 | Persistencia, variación e impulsos de tres ámbitos individuales. | Ámbitos separados con retorno gradual. |
| ACT08 | Efecto de Consistencia y control de neutralidad. | Dispersión distinta sin talento medio añadido accidentalmente. |
| ACT09 | Exigencia e influencia de presión por tarea. | Importancia y tensión no se duplican. |
| ACT10 | Momento colectivo: límites, persistencia y episodios. | Influencia compartida breve sin aura. |
| ACT11 | Combinación de estados y presupuesto por tarea. | Los máximos no se acumulan sin límite. |
| ACT12 | Pausa y reorganización aplicables. | Atenuación, descanso y orden válidos sin reset garantizado. |

<a id="grupo-27-08"></a>

### 27.8. Entrenador: ENT01–ENT07

*Procedencia: MD07, §11.*

<a id="src-md07-l0445"></a>

| ID | Contenido requerido | Comprobación |
|---|---|---|
| ENT01 | Participación prevista, funciones esenciales y alternativas. | Intención frente a minutos y funciones reales. |
| ENT02 | Revisión de descanso/retorno, estabilidad y excepciones. | Rotación contextual sin entradas y salidas repetidas. |
| ENT03 | Librillo por periodo, faltas, urgencia y recambio. | Fila que motivó retirar o mantener. |
| ENT04 | Pausas por intención, señales, recursos y reserva. | Solicitud y concesión válidas, efecto posterior incierto. |
| ENT05 | Ajustes autorizados, evidencia y estabilidad. | Cambio comprensible desde información permitida. |
| ENT06 | Prioridades de final por reloj, margen, bonus y control. | Decisión viable y coherente con objetivo. |
| ENT07 | Delegación y ciclo de órdenes, ámbitos y conflictos. | Solicitada, vigente y ejecutada diferenciadas. |

<a id="grupo-27-09"></a>

### 27.9. Memoria: MEM01–MEM04

*Procedencia: MD07, §12.*

<a id="src-md07-l0475"></a>

| ID | Contenido requerido | Límite |
|---|---|---|
| MEM01 | Identidad semántica general/específica del patrón. | Renombrar una ficha no borra reconocimiento. |
| MEM02 | Capacidad, recencia, saturación, decaimiento y reemplazo. | Resumen pequeño y gradual. |
| MEM03 | Reconocimiento y respuestas compatibles. | La respuesta debe poder ejecutarse realmente. |
| MEM04 | Aplicabilidad tras cambios, pausas y continuidad. | No borrado automático ni conocimiento eterno. |

<a id="grupo-27-10"></a>

### 27.10. Contenido y población: CON y POB

*Procedencia: MD07, §13.*

<a id="src-md07-l0496"></a>

| ID | Contenido requerido | Terminación |
|---|---|---|
| CON01 | 15 fichas posicionales y relaciones con familia/situación. | Requisitos, funciones, opciones y cierre definidos. |
| CON02 | Seis disposiciones, roles y compatibilidades. | Funciones realizables y sustituciones válidas. |
| CON03 | ESP01–ESP20 y procedencia de decisión. | Condiciones y opciones registrables, sin familia ficticia. |
| CON04 | Seis fichas ofensivas y seis respuestas de saque. | Sacador, primera opción, alternativa, seguridad y continuidad. |
| POB01 | Doce equipos manuales de doce plazas. | Perfiles individuales completos e identidad reproducible al cargar datos. |
| POB02 | Generación ficticia correlacionada. | Rangos, dispersión y dependencias explícitos. |
| POB03 | Tres grupos de tendencias y perfiles funcionales. | Preferencia y capacidad separadas, con límites. |

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c26-p02-perfiles-versiones-y-ciclo-de-mejora](c26-p02-perfiles-versiones-y-ciclo-de-mejora.md) · Siguiente: [c27-p02-estadistica-y-resumen-est01est08](c27-p02-estadistica-y-resumen-est01est08.md)
