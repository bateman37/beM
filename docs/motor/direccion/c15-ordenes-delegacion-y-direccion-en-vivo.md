<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: direccion](README.md) · Capítulo 15 — Órdenes, delegación y dirección en vivo
> Anterior: [c14-p02-catalogo-de-episodios-y-actualizacion-de-estados](../jugadores/c14-p02-catalogo-de-episodios-y-actualizacion-de-estados.md) · Siguiente: [c16-p01-rotaciones-funciones-y-gestion-de-faltas](c16-p01-rotaciones-funciones-y-gestion-de-faltas.md)
<!-- beM:nav-fin -->

<a id="cap-15"></a>

## 15. Órdenes, delegación y dirección en vivo

<a id="grupo-15-01"></a>

### 15.1. Identidad y ciclo de vida de las órdenes

*Procedencia: MD06, §9.*

<a id="src-md06-l0510"></a>

#### 15.1.1. Tres preguntas distintas

*Origen: MD06 §9.1.*

| Nivel | Pregunta | Ejemplo |
|---|---|---|
| Solicitud | ¿Qué ha pedido el entrenador? | Cambiar a zona 3–2. |
| Vigencia | ¿Desde qué frontera válida forma parte del plan efectivo? | La defensa se reorganiza y la 3–2 pasa a estar vigente. |
| Ejecución | ¿Qué ha hecho el equipo y con qué resultado? | Llega tarde a una ayuda dentro de la 3–2. |

Una orden aceptada no modifica el acontecimiento ya resuelto. Una orden vigente tampoco otorga a los jugadores la capacidad de ejecutarla bien.

<a id="src-md06-l0520"></a>

#### 15.1.2. Identidad funcional mínima

*Origen: MD06 §9.2.*

Cada orden tiene identificador, emisor, secuencia, tipo, ámbito, contenido, objetivos cuando existan, momento de solicitud, regla de activación, duración o causa de caducidad y relación con la orden sustituida.

El momento funcional se expresa mediante estado del encuentro, reloj deportivo e identificador o secuencia de acontecimiento. La hora real de una sesión puede conservarse como dato auxiliar, pero no decide la reproducción deportiva.

Una orden pendiente conoce la razón de espera. No se guarda solo un valor nuevo en el plan perdiendo la diferencia entre «pedido» y «ya vigente».

<a id="src-md06-l0528"></a>

#### 15.1.3. Estados del ciclo de vida

*Origen: MD06 §9.3.*

| Estado | Significado | Salida habitual |
|---|---|---|
| Solicitada | Ha llegado una petición identificada. | Validación. |
| Rechazada | Es inválida o incompatible y se conserva la configuración válida. | Explicación y posible nueva solicitud. |
| Pendiente | Es válida, pero falta su frontera de aplicación. | Activación, sustitución, cancelación o caducidad. |
| Vigente | Integra el plan desde una frontera registrada. | Se mantiene, se consume, caduca o se sustituye. |
| Suspendida por condición | La instrucción sigue declarada, pero no es aplicable ahora. | Recuperación de condición, sustitución o caducidad. |
| Consumida | Una instrucción de alcance limitado ha iniciado su objeto válido. | Cierre histórico de esa solicitud. |
| Caducada | Ha terminado su ámbito sin poder iniciarse o mantenerse. | Motivo registrado. |
| Sustituida o cancelada | Otra orden válida la reemplaza, o se retira dentro de su alcance. | Conservación del historial. |

Son estados de instrucciones. «Ejecutada correctamente» pertenece al registro de la acción, no debe confundirse con «vigente».

<a id="src-md06-l0543"></a>

#### 15.1.4. Persistentes y acotadas

*Origen: MD06 §9.4.*

Los estilos, disposiciones, prioridades o sistemas pueden mantenerse hasta sustitución válida. Una llamada concreta puede dirigirse a una oportunidad o posesión definida. Las sustituciones y los tiempos muertos siguen su administración reglamentaria.

Una llamada no permanece oculta durante cinco ataques porque su primera oportunidad no existió. Su ámbito y caducidad deben verse al solicitarla.

El plan persistente de una ficha es distinto de la orden puntual de utilizarla ahora. Consumir una llamada puntual no elimina la ficha del libro.

<a id="src-md06-l0551"></a>

#### 15.1.5. Cancelación, sustitución y simultaneidad

*Origen: MD06 §9.5.*

Una solicitud pendiente puede cancelarse antes de la frontera pertinente. Si ya está vigente, la cancelación es otro cambio que se aplica sin alterar hechos anteriores.

Para el mismo campo y ámbito, la última orden explícita válida sustituye a la anterior. La secuencia registrada resuelve peticiones recibidas en el mismo reloj deportivo. No se depende del orden accidental de consultas técnicas.

Si se presenta un conjunto de cambios como una única configuración, se valida como conjunto. Un cambio incompatible no debe activar silenciosamente solo la mitad que el usuario no habría elegido por separado.

<a id="src-md06-l0559"></a>

#### 15.1.6. Pausa del visionado

*Origen: MD06 §9.6.*

Pausar el visionado detiene el avance antes de resolver el siguiente acontecimiento y muestra el último estado resuelto. Las órdenes posteriores actúan sobre lo que todavía no se ha resuelto.

No se promete insertar una orden en medio de un gesto que el motor ya resolvió conjuntamente. Tampoco se precalcula un futuro deportivo inmutable que convierta las órdenes visibles en decorado.

La pausa de interfaz no es un tiempo muerto deportivo: no concede recuperación, reorganización reglamentaria ni atenuación de estados por mantener una pantalla abierta.

<a id="grupo-15-02"></a>

### 15.2. Tabla de aplicación por tipo de orden

*Procedencia: MD06, §10.*

<a id="src-md06-l0569"></a>

#### 15.2.1. Fronteras vigentes

*Origen: MD06 §10.1.*

| Tipo de orden | Frontera de aplicación | Qué conserva | Qué no hace |
|---|---|---|---|
| Ritmo, selección de tiro, riesgo, libertad y demás estilos ofensivos | Siguiente elección pertinente aún no resuelta. | Acción ya iniciada y ventajas existentes. | Recalcular un tiro anterior. |
| Estilos defensivos y ayudas | Siguiente decisión defensiva pertinente aún no resuelta. | Compromisos e intervenciones ya producidos. | Hacer aparecer una ayuda instantánea sin tarea. |
| Disposición ofensiva | Entrada o reorganización compatible. | Continuidad y reloj. | Recolocar gratuitamente cinco jugadores en mitad de una ventaja. |
| Prioridades del libro | Siguiente selección compatible aún no resuelta. | Ficha iniciada y continuaciones disponibles. | Cancelar automáticamente una ejecución vigente. |
| Llamada de ficha | Oportunidad válida del ámbito declarado. | Requisitos, sustituciones de participantes y lectura. | Garantizar que se inicia si no hay condición. |
| Organización defensiva | Siguiente reorganización defensiva pertinente. | Estado deportivo y desajustes que aún no se hayan corregido. | Reiniciar la posesión ni borrar ventajas. |
| Cobertura de una interacción | Siguiente interacción compatible que todavía no se ha resuelto. | Lo ocurrido en interacciones anteriores. | Cambiar retrospectivamente un cambio ya ejecutado. |
| Marca, objetivo, doble o no abandonar | Siguiente asignación o intervención pertinente y válida. | Responsabilidades actuales hasta su modificación real. | Dar presencia física inmediata a otro defensor. |
| Rol individual | Siguiente elección o reorganización que use esa función. | Tareas ya comprometidas. | Modificar capacidades o personalidad. |
| Orden de falta táctica | Próxima oportunidad pertinente y legal bajo el perfil. | Posibilidad de que no se ejecute o tenga otra consecuencia reglamentaria. | Otorgar una falta ordinaria garantizada. |
| Sustitución | Ventana reglamentaria válida, con administración del perfil FIBA. | Hechos anteriores, quinteto y minutos reales hasta el cambio. | Entrar durante juego vivo por ser conveniente. |
| Tiempo muerto | Solicitud y concesión conforme a la ventana reglamentaria. | Hechos anteriores y recursos realmente disponibles. | Detener retroactivamente una canasta. |
| Plan del siguiente cuarto | Inicio y entradas pertinentes del periodo objetivo. | Estado acumulado y órdenes de mayor prioridad vigentes. | Cambiar el cuarto que ya terminó. |
| Delegación automática | Siguiente decisión del ámbito delegado. | Restricciones manuales válidas y conocimiento permitido. | Anular una instrucción manual sin autorización del ámbito. |

La frontera es deportiva. Puede darse en la misma posesión cuando existe una reanudación o reorganización pertinente; no se exige esperar siempre otra posesión. También puede no existir antes de que la orden caduque.

<a id="src-md06-l0590"></a>

#### 15.2.2. Inicio y consumo de una llamada

*Origen: MD06 §10.2.*

Una ficha puntual se consume cuando empieza la ejecución que cumple sus requisitos. La mera evaluación de la candidata no la consume.

Si el inicio no llega a producirse por negación, falta de participante, cambio de contexto o decisión directa compatible, el registro distingue esas causas de una ficha iniciada que fracasa. Al terminar su ámbito, la llamada pendiente caduca con motivo.

Si la ficha comienza y después es negada o deriva a una continuación compartida, sí hubo inicio. El análisis de uso y eficacia respeta esa frontera.

<a id="src-md06-l0598"></a>

#### 15.2.3. Reanudaciones y tiempos muertos

*Origen: MD06 §10.3.*

Una interrupción puede dar una frontera útil para aplicar cambios de organización y participantes. La posibilidad concreta depende de la administración reglamentaria y de qué instrucción se haya solicitado.

Las ventanas de sustitución y tiempo muerto proceden del perfil FIBA; no se equiparan a cualquier momento en que el entrenador puede dirigirse a sus jugadores [MD06-S03](../referencias/c33-p02-fuentes-y-limites-de-la-investigacion.md#ref-md06-s03).

Un tiempo muerto puede servir para cambiar plan, recuperar energía y atenuar estados conforme a sus reglas. No garantiza ejecución posterior, ni permite una sustitución que el perfil no autorice en esa situación.

Los saques de banda y fondo mantienen sus fichas ofensivas y respuestas defensivas. La orden puede seleccionar una opción de ese catálogo sin generar otro motor distinto de saques.

<a id="src-md06-l0608"></a>

#### 15.2.4. Faltas tácticas y protección del reglamento

*Origen: MD06 §10.4.*

La intención de detener, presionar o negar no sustituye la clasificación del hecho. El contacto representado se administra conforme al perfil: una instrucción de falta táctica no fuerza siempre la sanción más favorable al entrenador.

La orden puede no encontrar oportunidad antes del final, ejecutarse tarde o producir una clasificación distinta de la pretendida. Se conserva intención, acción efectiva y consecuencia.

<a id="src-md06-l0614"></a>

#### 15.2.5. Traducción a interfaz

*Origen: MD06 §10.5.*

El usuario recibe expresiones como «pendiente de reorganización», «vigente desde la próxima elección», «suspendida: objetivo fuera de pista» o «caducada: terminó la posesión objetivo».

No se muestran fronteras internas como una sucesión de microprocesos técnicos. La información sirve para dirigir y comprender el partido.

<a id="grupo-15-03"></a>

### 15.3. Precedencia y conflictos

*Procedencia: MD06, §11.*

<a id="src-md06-l0622"></a>

#### 15.3.1. Jerarquía funcional

*Origen: MD06 §11.1.*

1. Obligaciones reglamentarias y elegibilidad.
2. Orden manual válida y específica dentro de su ámbito.
3. Plan vigente del entrenador y restricciones generales compatibles.
4. Decisiones delegadas al entrenador automático.
5. Preferencias, rol y elección del jugador dentro del margen disponible.

Una orden más específica restringe la general; no elimina obligaciones. La jerarquía no convierte cualquier petición nueva en válida.

<a id="src-md06-l0632"></a>

#### 15.3.2. Reglas de compatibilidad

*Origen: MD06 §11.2.*

| Conflicto | Resolución funcional |
|---|---|
| Dos valores para el mismo campo y ámbito | Sustituye el último cambio explícito válido, con secuencia registrada. |
| Nueva configuración incompatible | Se rechaza o se pide corregir la combinación en la interfaz; sigue vigente la última configuración válida. |
| Orden válida pero aún sin frontera | Se mantiene pendiente; no se finge aplicación. |
| Objetivo temporalmente ausente | Alternativa declarada o suspensión según el apartado 5. |
| Orden manual frente a cambio automático del mismo ámbito | Prevalece la manual válida; el automático puede informar de su recomendación. |
| Obligación reglamentaria frente a instrucción táctica | Prevalece la obligación; se registra por qué no se cumple la intención. |
| Ficha llamada incompatible con participantes actuales | No inicia; puede esperar dentro de su ámbito o caducar con motivo. |
| Nuevo sistema incompatible con una especial persistente | Se valida la combinación y se conserva o retira la especial de forma explícita. |

No se arregla un conflicto inventando una defensa, cambiando en secreto el objetivo ni otorgando una ayuda imposible.

<a id="src-md06-l0647"></a>

#### 15.3.3. Doble y orden de no abandonar

*Origen: MD06 §11.3.*

«No abandonar a A» restringe la elección del ayudante. Si hay otro defensor elegible, la doble puede utilizarlo, asumiendo las concesiones correspondientes. Si no existe, la instrucción de doble queda limitada o no se ejecuta en esa interacción.

El motor no viola silenciosamente la protección de A para fabricar la doble. El usuario debe poder ver «doble no ejecutada: sin ayudante compatible» cuando sea relevante.

La restricción puede tener coste deportivo. Proteger un receptor puede dejar menos recursos para contener al objetivo. No se compensa concediendo una ayuda gratis de otro jugador.

<a id="src-md06-l0655"></a>

#### 15.3.4. Una marca específica y el cambio defensivo

*Origen: MD06 §11.4.*

La marca de referencia establece quién toma al objetivo al organizarse. Una cobertura de cambio puede modificar la responsabilidad actual durante la acción. Eso no constituye por sí mismo incumplimiento de la referencia.

Si la intención es evitar ese cambio sobre el objetivo, el plan debe declarar una cobertura compatible. No se interpreta cualquier marca manual como una prohibición universal de intercambiar responsabilidades.

<a id="src-md06-l0661"></a>

#### 15.3.5. Ausencias, exclusiones e indisponibilidad

*Origen: MD06 §11.5.*

Una sustitución, lesión o exclusión puede invalidar una asignación o participante. La administración resuelve la elegibilidad y después se reconstruyen solo las referencias necesarias.

El libreto de faltas y la rotación contextual del MD05 se mantienen. Ningún umbral de energía de este documento obliga a retirar a una estrella que sigue siendo la mejor opción; su fatiga sí debe seguir afectando donde corresponda.

<a id="src-md06-l0667"></a>

#### 15.3.6. Conflicto resuelto no equivale a éxito

*Origen: MD06 §11.6.*

Una configuración válida puede ser arriesgada o mala frente al rival. La validación protege coherencia, no garantiza conveniencia deportiva.

Una doble compatible puede llegar tarde; una zona válida puede conceder un buen tiro; una orden bien recibida puede ejecutarse mal. Esa incertidumbre pertenece al partido y debe mantenerse.

<a id="grupo-15-04"></a>

### 15.4. Dirección desde la interfaz y relato

*Procedencia: MD06, §19.*

<a id="src-md06-l1202"></a>

#### 15.4.1. Pantalla principal contenida

*Origen: MD06 §19.1.*

La pantalla de partido concentra marcador, periodo y reloj, posesión cuando proceda, quinteto, energía propia, faltas, plan vigente, órdenes pendientes relevantes y relato del hecho.

Los estilos, libro, roles y defensa se abren en sus paneles. Los tres ámbitos de momento se pueden ampliar en la ficha propia. El diagnóstico no ocupa el flujo ordinario de dirección.

El diseño funcional admite mucho detalle consultable sin exigir que el usuario vigile decenas de medidores a la vez.

<a id="src-md06-l1210"></a>

#### 15.4.2. Respuesta a una orden

*Origen: MD06 §19.2.*

La interfaz confirma qué se ha pedido, si es válido, cuándo puede entrar y por qué espera. Al activarse o caducar, actualiza ese estado.

Ejemplos de mensajes:

| Situación | Mensaje funcional suficiente |
|---|---|
| Cambio defensivo válido aún no aplicable. | «3–2 pendiente de reorganización». |
| Objetivo de box and one en banquillo. | «2–3 activa como alternativa; objetivo fuera de pista». |
| Llamada que no llegó a iniciar. | «Llamada caducada al terminar la posesión; inicio negado». |
| Especial limitada por otra orden. | «Doble no ejecutada: sin ayudante compatible con no abandonar». |
| Sustitución aún sin ventana. | «Sustitución pendiente de oportunidad reglamentaria». |
| Configuración incompatible. | «Cambio no aplicado: revisa estas dos instrucciones». |

Los mensajes identifican la instrucción y su causa sin volcar nombres de tablas o fórmulas en la pantalla del partido.

<a id="grupo-15-05"></a>

### 15.5. Ejemplos integrados

*Procedencia: MD06, §22.*

<a id="src-md06-l1469"></a>

#### 15.5.1. Cambio de estilo durante una continuación

*Origen: MD06 §22.8.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación:** se pide menos riesgo después de una recepción ya resuelta, antes de la siguiente decisión.

**Resolución vigente:** el cambio puede influir en la próxima elección pertinente. No deshace el pase anterior ni elimina la ventaja existente. Si la continuación ya se resolvió conjuntamente con la recepción, entra después de esa frontera.

**Información:** la interfaz muestra el estado real, sin fingir una aplicación intermedia que el motor no representa.

<a id="src-md06-l1477"></a>

#### 15.5.2. Llamada que nunca inicia

*Origen: MD06 §22.9.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación:** se llama una ficha para la posesión. El rival niega su requisito de inicio y el ataque termina usando una alternativa directa.

**Resolución vigente:** la ficha no recibe un inicio estadístico. La llamada puede permanecer pendiente dentro de su ámbito y termina caducada cuando este acaba.

**Informe:** se puede contar como oportunidad de llamada no iniciada por negación, sin etiquetarla como fallo de conversión de esa familia.

<a id="src-md06-l1485"></a>

#### 15.5.3. Doble sin ayudante compatible

*Origen: MD06 §22.10.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación:** se pide una doble al interior y se protege al tirador del lado pertinente con «no abandonar». No hay otro ayudante elegible en la interacción.

**Resolución vigente:** no se fabrica la doble. Se conserva la restricción válida, se resuelve la defensa posible y se informa de la limitación relevante.

**Consecuencia:** el interior puede tener una opción favorable. El coste es deportivo; no se arregla concediendo otra ayuda sin abandonar responsabilidad.

<a id="grupo-15-06"></a>

### 15.6. Dirección durante el partido

*Procedencia: MD01, §19.*

<a id="src-md01-l0605"></a>

El usuario debe poder:

- Sustituir jugadores.
- Cambiar el director y su alternativa.
- Ajustar estilos.
- Modificar disposición y roles.
- Cambiar prioridades o llamar una ficha.
- Cambiar organización y altura de presión.
- Ajustar coberturas, marcas e instrucciones especiales.

Los cambios se aplican al **estado real del partido todavía en curso** desde el siguiente momento permitido y afectan a su desarrollo posterior.

No se calcula el resultado completo para después reproducirlo como si el usuario pudiera intervenir.

La tabla vigente de aplicación por tipo distingue elección, interacción, entrada, reorganización y ventana reglamentaria. La interfaz indica solicitud, espera, vigencia, consumo y cierre pertinentes.

El comportamiento dirigible debe ser común a liga, copa y playoffs cuando se construyan las competiciones.

<a id="grupo-15-07"></a>

### 15.7. Entrenador: ENT01–ENT07

*Procedencia: MD07, §11.*

<a id="src-md07-l0457"></a>

#### 15.7.1. Delegación

*Origen: MD07 §11.1.*

La decisión automática utiliza las mismas reglas de información deportiva que el humano. Puede consultar estado propio permitido, hechos públicos y observación rival autorizada. No utiliza el número interno de energía o momento rival ni futuras tiradas.

Se mantiene la precedencia: obligación reglamentaria, orden manual válida y específica, plan vigente y decisión delegada dentro de su ámbito.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c14-p02-catalogo-de-episodios-y-actualizacion-de-estados](../jugadores/c14-p02-catalogo-de-episodios-y-actualizacion-de-estados.md) · Siguiente: [c16-p01-rotaciones-funciones-y-gestion-de-faltas](c16-p01-rotaciones-funciones-y-gestion-de-faltas.md)
