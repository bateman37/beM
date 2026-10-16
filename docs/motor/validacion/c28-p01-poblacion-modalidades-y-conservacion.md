<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: validacion](README.md) · Capítulo 28 — Auditorías y criterios de aceptación · parte 1 de 4
> Anterior: [c27-p03-diccionario-de-tablas-y-parametros](../configuracion/c27-p03-diccionario-de-tablas-y-parametros.md) · Siguiente: [c28-p02-conciliaciones-y-aceptacion-del-catalogo](c28-p02-conciliaciones-y-aceptacion-del-catalogo.md)
<!-- beM:nav-fin -->

<a id="cap-28"></a>

## 28. Auditorías y criterios de aceptación

Son criterios y catálogos para la futura implementación y evaluación. Las colecciones se relacionan y pueden solaparse; no se suman como pruebas únicas ni se convierten en una obligación de ejecutar todos los casos después de cada cambio.

<a id="grupo-28-01"></a>

### 28.1. Población, modalidades y conservación

*Procedencia: MD05, §15.*

<a id="src-md05-l1084"></a>

#### 28.1.1. Rendimiento y alcance técnico

*Origen: MD05 §15.7.*

El trabajo debe ser proporcional a acontecimientos y participantes pertinentes. Se puede preparar información estable del perfil y limitar el diagnóstico exhaustivo a las ejecuciones que lo soliciten.

El tamaño del panel o del catálogo no equivale a tamaño del contexto ni a cantidad de pasos por posesión. Las consultas históricas y las auditorías pueden tener otro coste sin cargarlo sobre cada decisión deportiva.

No se promete una duración en milisegundos sin medición. Una futura aproximación que cambie el baloncesto simulado requeriría una decisión expresa; reducir prosa o diagnóstico no exige cambiar el núcleo.

<a id="grupo-28-02"></a>

### 28.2. Auditorías y comparaciones

*Procedencia: MD05, §20.*

<a id="src-md05-l1463"></a>

#### 28.2.1. Finalidad y alcance

*Origen: MD05 §20.1.*

Las auditorías comprueban coherencia, comportamiento y sensibilidad sobre partidos completos. Ayudan a localizar causas y revisar parámetros. No son un mecanismo que corrija automáticamente el marcador ni un sustituto de observar el partido.

Se pueden acompañar de comprobaciones matemáticas o reglamentarias de mecanismos compartidos cuando proceda. El criterio deportivo sigue siendo que el conjunto funcione en partidos, con tácticas, jugadores y defensa integrados.

No se exige una cantidad masiva fija de partidos para cualquier modificación. El tamaño de muestra responde a la pregunta, la variabilidad y la frecuencia del fenómeno. Un suceso raro puede necesitar observación específica; una suma de créditos se puede validar sin miles de encuentros.

<a id="src-md05-l1471"></a>

#### 28.2.2. Ficha común de auditoría

*Origen: MD05 §20.2.*

| Campo | Requisito |
|---|---|
| Pregunta | Qué se intenta conocer o corregir. |
| Hipótesis | Qué efecto debería producir el cambio y por qué. |
| Base y candidata | Perfiles completos comparados. |
| Población/escenario | Equipos, capacidades, roles, planes, estados y contexto. |
| Cambios controlados | Qué se mantiene y qué cambia. |
| Reproducción | Versiones, entradas, semillas y órdenes cuando proceda. |
| Indicadores | Numeradores, denominadores, unidades y cobertura. |
| Muestra | Partidos, posesiones y oportunidades pertinentes. |
| Incertidumbre | Dispersión, intervalos o límites adecuados al indicador. |
| Expectativa | Dirección esperada y, si existe, banda de referencia identificada. |
| Resultado | Datos observados, incidencias y comparación. |
| Interpretación | Qué sostiene la muestra y qué sigue sin resolverse. |
| Decisión | Mantener, revisar, ampliar muestra o descartar ajuste. |

El informe debe poder abrir los partidos o acontecimientos que sustentan una incidencia. Una luz roja sin denominador ni ejemplo no ayuda a administrar el motor.

<a id="src-md05-l1491"></a>

#### 28.2.3. Catálogo de auditorías preconfiguradas

*Origen: MD05 §20.3.*

| ID | Auditoría | Comprobación principal | Salida útil para Dennis |
|---|---|---|---|
| AUD01 | Administración y acta | Consecuencias, marcador, créditos y disponibilidad coherentes. | Incidencia con hecho y regla aplicable. |
| AUD02 | Posesiones y continuidad | Rebote ofensivo/reanudación no generan cierres ficticios; origen único. | Cadena de ataque y conciliación. |
| AUD03 | Relojes y ventanas | Tiempos compatibles, órdenes aplicadas en oportunidad válida. | Órdenes pendientes/aplicadas y causa. |
| AUD04 | Perfiles y datos | Tipos, referencias, sumas, curvas, herencia y conflictos. | Filas que impiden validar. |
| AUD05 | Uso de las 32 capacidades | Cada capacidad interviene causalmente en situaciones pertinentes. | Mapa de cobertura, exposición y sensibilidad. |
| AUD06 | Selección frente a ejecución | Diferenciar frecuencia de elección, calidad y conversión. | Embudo de oportunidad → percepción → elección → resultado. |
| AUD07 | Libro y prioridades | Preferencias 1–5; varias familias al mismo nivel; invariancia ante duplicar nombres. | Uso observado por familia/variante y elegibilidad. |
| AUD08 | Libertad y director | Diferencias entre plan, iniciativa, visión y decisiones. | Desviación del plan, elección útil y errores pertinentes. |
| AUD09 | Juego espontáneo | Existencia de situaciones ESP01–ESP20 en contextos compatibles. | Frecuencias por eje y episodios de referencia. |
| AUD10 | Estilos ofensivos | Ritmo, elaboración, transición, reparto de tiro y riesgo. | Mezcla y coste, sin exigir ganancia universal. |
| AUD11 | Organizaciones defensivas | Responsabilidades y oportunidades que conceden. | Cambios de recepción, tiro, pérdida y recuperación. |
| AUD12 | Presión y ayudas | Riesgo/tiempo de avance, carga y consecuencias al superarlas. | Beneficio y concesión en la misma vista. |
| AUD13 | Oportunidad y defensa real | Calidad clasificada antes del resultado; oposición correcta. | Tiros cómodos/forzados, aciertos y fallos separados. |
| AUD14 | Finalizaciones y preparación | Fronteras TEC03/TEC04 y TEC06/técnica de distancia. | Diferencias por tarea, sin doble penalización. |
| AUD15 | Rebote y balance | Cierre, acceso, captura y retorno pertinentes. | Quién ayudó, quién capturó y qué se concedió. |
| AUD16 | Tiempo y exposición | No multiplicar riesgos o gasto por fragmentar la representación. | Comparación por dosis y duración. |
| AUD17 | Curva de energía | 100–70 casi neutro, deterioro creciente, bajo 10 considerable. | Curvas y casos equivalentes por tarea. |
| AUD18 | Rotación contextual | Jugador E = 30 puede seguir; ausencia de entradas/salidas repetidas sin motivo. | Decisiones, alternativas y estabilidad. |
| AUD19 | Librillo de faltas | Periodo, urgencia, riesgo y sustituto; límites legales. | Fila ganadora y excepciones aplicadas. |
| AUD20 | Forma y experiencia | Persistencia de forma; veteranos útiles en tareas pertinentes. | Rendimiento contextual sin bonus de edad. |
| AUD21 | Consistencia y momento individual | Amplitud, persistencia y neutralidad de referencia. | Distribución y media bajo contexto fijo. |
| AUD22 | Momento colectivo | Influencia moderada y jugadores que aportan sin anotar. | Señales, persistencia y efecto aplicado. |
| AUD23 | Presupuesto de estados | No duplicar energía, forma, presión, momento y racha sobre una misma causa. | Descomposición de influencias por tarea. |
| AUD24 | Tiempos muertos | Intención, pausa, órdenes y resultado incierto. | Antes/después descriptivo y ejemplos de éxito/fallo. |
| AUD25 | Memoria y repetición | Reconocimiento gradual; cuarta acción puede funcionar; renombrar no borra señal. | Patrón, respuesta y contrarrespuesta. |
| AUD26 | Saques y finales | Banda/fondo, recepción segura, secuencia directa y relojes. | Producción directa/posterior y decisiones de cierre. |
| AUD27 | Estadística y universos | Exacto/estimado, mixtas, puntos administrativos y denominadores. | Conciliaciones y diferencias explicadas. |
| AUD28 | Visibilidad y dirección | IA/humano usan información permitida; diagnóstico separado. | Datos consultados y permisos. |
| AUD29 | Modalidades y continuación | Velocidad, cuarto, automático y guardar/continuar coherentes. | Igualdad de hechos bajo las mismas condiciones. |
| AUD30 | Población y estilos de equipo | Perfiles coherentes, escala absoluta y variedad sin homogeneización artificial. | Distribuciones y casos atípicos revisables. |
| AUD31 | Partidos completos y colas | Ritmo, eficiencia, faltas, pérdidas, rebote, reparto y extremos plausibles. | Distribución de partidos y ejemplos a observar. |
| AUD32 | Conservación y coste | Vistas históricas sustentadas y cálculo proporcional a hechos pertinentes. | Cobertura disponible y medición de rendimiento. |

Es un catálogo funcional. Las auditorías pueden reutilizar el mismo lote y los mismos datos. No exige 32 simuladores ni ejecutar todos los paquetes tras una edición de una etiqueta.

<a id="src-md05-l1530"></a>

#### 28.2.4. Conjuntos de referencia

*Origen: MD05 §20.4.*

El laboratorio contará con conjuntos manuales entendibles y variantes generadas correlacionadas. Entre los casos útiles deben aparecer:

- Equipos equilibrados y equipos con especialidad exterior, interior o de dirección.
- Buen director con bajo poder anotador y anotador con lectura limitada.
- Quinteto con veterano inteligente y físicas bajas.
- Titular decisivo cansado frente a sustituto fresco claramente inferior o mejor adaptado.
- Defensas individuales, zonas, box and one y distintos niveles de presión.
- Plan rígido frente a libertad alta, con iniciativa y capacidad de lectura diferenciadas.
- Carga al rebote frente a balance, y rivales que puedan aprovechar la concesión.
- Problemas de faltas en distintos periodos y urgencias de marcador.
- Ataque temprano y directo, recursos autónomos y libro estructurado.
- Saques, cierres, prórrogas e incidencias que exijan una administración concreta.

No se pretende cubrir todas las combinaciones de 32 capacidades, estilos y jugadores. Se eligen situaciones que ponen a prueba una relación deportiva y luego se comprueba su convivencia en partidos completos.

<a id="src-md05-l1547"></a>

#### 28.2.5. Comparación base/candidata

*Origen: MD05 §20.5.*

Se mantiene una base conocida y se cambia una hipótesis identificable. Se pueden reutilizar conjuntos de semillas para reducir ruido, pero una elección distinta puede cambiar el orden y cantidad de sorteos posteriores.

Por ello no se promete que cada posesión de dos partidos divergentes sea una pareja idéntica salvo el parámetro editado. Se comparan distribuciones y contextos compatibles, conservando episodios para inspección.

Si se utilizan técnicas de azar compartido más finas, deberán documentarse. No son necesarias para comprender la comparación ni autorizan a forzar el mismo relato con probabilidades distintas.

<a id="src-md05-l1555"></a>

#### 28.2.6. Calibración: más que acertar una media

*Origen: MD05 §20.6.*

| Nivel | Pregunta |
|---|---|
| Coherencia matemática | ¿Las distribuciones y unidades son válidas? |
| Fiabilidad del mecanismo | ¿Los resultados agregados son compatibles con sus probabilidades condicionadas, con muestra suficiente? |
| Relación deportiva | ¿Cambiar una capacidad o táctica altera lo que debe, en contextos pertinentes? |
| Partido completo | ¿La mezcla de hechos se parece a un partido y conserva variedad? |
| Población y estilo | ¿Se mantienen diferencias coherentes entre equipos y jugadores? |
| Lectura del usuario | ¿Puede entender por qué ocurrió y qué podría cambiar? |

Cumplir una probabilidad interna no prueba que esa probabilidad sea buena. Reproducir el promedio de puntos tampoco demuestra que estén bien pérdidas, oportunidades, reparto o finales.

<a id="src-md05-l1568"></a>

#### 28.2.7. Señales y tolerancias

*Origen: MD05 §20.7.*

Las alertas deben distinguir error de invariante, desviación de una referencia comparable, incertidumbre por muestra pequeña y comportamiento llamativo pendiente de revisión.

Un hecho imposible exige corrección aunque sea uno. Una frecuencia rara no exige ajuste si la muestra no permite concluir. Los umbrales estadísticos y bandas de diseño son administrables y se etiquetan; no se convierten en límites que el partido deba obedecer durante su resolución.

Las colas se inspeccionan: partidos muy anotadores, muy lentos, prórrogas, jugadores con uso extremo, malas rachas, rachas largas y actuaciones excepcionales. No se eliminan simplemente porque se alejan de la media.

<a id="src-md05-l1576"></a>

#### 28.2.8. Resultado de una auditoría

*Origen: MD05 §20.8.*

El panel ofrece resumen legible, tabla de indicadores, muestra y cobertura, comparación con base, diferencias de parámetros, episodios y límites de interpretación. Permite guardar la conclusión junto al perfil.

Las recomendaciones pueden ordenar posibles causas, pero no activan ajustes ni introducen correctores automáticos de resultado. El control de Dennis consiste en ver qué cambia y evaluar si mejora el comportamiento buscado.

<a id="grupo-28-03"></a>

### 28.3. Casos de aceptación del conjunto

*Procedencia: MD05, anexo B.*

<a id="src-md05-l2036"></a>

Estos casos son criterios para revisar la futura implementación. No afirman que el motor exista ni que se hayan ejecutado pruebas deportivas en esta entrega.

| ID | Caso | Comportamiento exigido |
|---|---|---|
| CA01 | Mismo encuentro sin intervención a x2 y x16 | Mismos hechos deportivos; distinta presentación. |
| CA02 | Avance de un cuarto y después continuación | Conserva estado, memoria, órdenes y azar pertinente. |
| CA03 | Pausa visual con solicitud de cambio | La solicitud espera oportunidad legal si no existe. |
| CA04 | Incidencia sancionada | Consecuencia común y determinista del perfil. |
| CA05 | Contacto y lanzamiento compatibles | Hechos condicionados y créditos coherentes, sin sorteos contradictorios. |
| CA06 | Negación de primera intención | Alternativa o salida válida según lectura y tiempo. |
| CA07 | Participante previsto fuera de pista | Alternativa elegible o ficha excluida; no usa capacidades del ausente. |
| CA08 | Oportunidad clara sin llamada | Puede aprovecharse sin inventar una ficha. |
| CA09 | Triple de transición | Puede ocurrir; oposición, técnica y contexto siguen resolviéndose. |
| CA10 | Suspensión tras bote espontánea | Preparación y técnica de distancia diferenciadas. |
| CA11 | Alta iniciativa con malas decisiones | Puede elegir peor; libertad no garantiza lectura excelente. |
| CA12 | Duplicar nombre/ficha equivalente | No multiplica masa de familia ni borra memoria. |
| CA13 | Repetir una salida cuatro veces | No existe fallo obligatorio; defensa puede responder gradualmente. |
| CA14 | Defensa ayuda y deja receptor | La opción está vinculada al defensor comprometido y puede caducar por recuperación pertinente. |
| CA15 | Juego detenido sin interacción nueva | No recalcula rutinariamente los movimientos de diez jugadores. |
| CA16 | Reserva 100–70 | Deterioro por energía casi imperceptible bajo condiciones comparables. |
| CA17 | Reserva inferior a 10 | Deterioro muy considerable en tareas sensibles, sin fallo total obligatorio. |
| CA18 | Titular E = 30 frente a relevo inferior | Puede mantenerse por utilidad actual, pagando fatiga. |
| CA19 | Cruce oscilante de energía alrededor de umbral | No entra y sale en ventanas consecutivas sin motivo suficiente. |
| CA20 | Faltas tempranas con alternativa | Considera protección conforme al librillo. |
| CA21 | Mismas faltas con urgencia y mala alternativa | Puede mantener si sigue siendo elegible. |
| CA22 | Límite reglamentario o no elegibilidad | Retirada/administración obligatoria aunque sea importante. |
| CA23 | Tiempo muerto para cortar racha | Registra intención, pausa y ajustes; no garantiza detenerla. |
| CA24 | Momento de tiro positivo de un jugador | No mejora automáticamente físicas, control y defensa ni todos los compañeros. |
| CA25 | Director útil sin anotar | Puede ayudar a estabilizar respuesta colectiva mediante tareas resueltas. |
| CA26 | Parcial favorable con momento neutral | Es posible; racha y estado no son equivalentes. |
| CA27 | Momento individual y colectivo coincidentes | Se respeta el presupuesto conjunto; no se suma un tercer bonus por racha. |
| CA28 | Forma buena durante varios encuentros | Persiste según política, sin derivarse automáticamente de puntos o victorias. |
| CA29 | Veterano con físicas bajas y mentales altas | Útil en tareas adecuadas, limitado en las físicamente exigentes. |
| CA30 | Consistencia distinta bajo contexto fijo | Cambia variación sin crear talento medio involuntario. |
| CA31 | Rebote ofensivo y nueva finalización | Misma posesión beM; cadena y origen conservados. |
| CA32 | Cambio de quinteto dentro de continuidad legal | Presencia exacta y ataque mixto; no duplica posesiones ni puntos. |
| CA33 | Tiro cómodo fallado y forzado convertido | Mantienen clasificación previa al resultado. |
| CA34 | Acción sin familia que inicia ataque | Origen directo permitido; no todo se etiqueta como aclarado. |
| CA35 | Dato no registrado en partido antiguo | Se muestra cobertura insuficiente; no se inventa ni se convierte en cero. |
| CA36 | Consulta de rival | No revela libro privado ni números internos ocultos. |
| CA37 | Edición de un parámetro calibrable | Puede localizarse y modificarse desde el panel con efecto explicado. |
| CA38 | Perfil con distribución inválida o referencia rota | No se valida; informa fila y causa. |
| CA39 | Perfil activo editado durante un partido | Se conserva la configuración del partido iniciado; se crea candidata para comparaciones/futuro. |
| CA40 | Restaurar perfil anterior | Afecta a futuros encuentros; no reescribe el historial. |
| CA41 | Auditoría de una táctica poco utilizada | Distingue falta de elegibilidad, percepción, preferencia y ejecución. |
| CA42 | Informe final y relato | Derivan de los mismos hechos y concilian con el acta. |
| CA43 | Generación de población | Produce perfiles correlacionados y variedad coherente, sin normalizar habilidades por liga. |
| CA44 | Partido del mundo sin prosa | Conserva la cobertura estadística y relaciones prometidas. |

<a id="src-md05-l2087"></a>

#### 28.3.1. Criterio de aceptación del panel

*Origen: MD05 §B.1.*

Dennis debe poder realizar por sí mismo una secuencia completa: localizar una observación, abrir sus indicadores, encontrar filas relacionadas, ver qué valor está en uso y de dónde viene, crear una candidata, editar, validar, comparar, leer límites de la evidencia y activar o descartar.

Si necesita pedir que alguien cambie una constante deportiva oculta para una calibración ordinaria, el panel no cumple el requisito. Si una edición tiene efectos que no puede rastrear ni comparar, tampoco.

<a id="src-md05-l2093"></a>

#### 28.3.2. Criterio de aceptación de sencillez

*Origen: MD05 §B.2.*

Una nueva ficha debe poder expresarse mediante requisitos, funciones y operaciones ya admitidas. Una nueva pantalla estadística debe consultar hechos conservados. Una nueva referencia de balance debe poder cargarse como dato.

Si añadir contenido exige otro simulador, una red de excepciones por cruce o nuevos estados que duplican los existentes, se revisa el diseño antes de ampliar. La complejidad útil debe verse en el partido y en las decisiones del usuario.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c27-p03-diccionario-de-tablas-y-parametros](../configuracion/c27-p03-diccionario-de-tablas-y-parametros.md) · Siguiente: [c28-p02-conciliaciones-y-aceptacion-del-catalogo](c28-p02-conciliaciones-y-aceptacion-del-catalogo.md)
