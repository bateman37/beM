<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: configuracion](README.md) · Capítulo 29 — Perfil inicial y semillas numéricas · parte 2 de 2
> Anterior: [c29-p01-perfil-inicial-semillas-y-trabajo-numerico](c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md) · Siguiente: [c30-alcance-de-construccion-y-trabajos-por-completar](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md)
<!-- beM:nav-fin -->

<a id="src-md03-l1240"></a>

#### 29.2.9. Duración, carga y fatiga

*Origen: MD03 §A.9.*

| Situación | Duración orientativa central | Rango típico orientativo |
|---|---:|---|
| Ataque organizado | 16 s | 8–22 s |
| Ataque temprano | 9 s | 4–13 s |
| Transición | 5 s | 2–8 s |
| Segunda opción rápida | 4 s | 1–7 s |
| Reorganización tras rebote ofensivo | 8 s | Limitado por reloj |
| Reconsideración elegible | +3–5 s | Solo con tiempo |

No son pasos temporales ni duración mínima obligatoria. La forma inicial elegida es triangular acotada por contexto y desenlace. Los centros y rangos orientativos de esta tabla no constituyen automáticamente todos sus mínimos y máximos; deben completarse las filas compatibles con reloj y desenlace. Reloj insuficiente modifica elegibilidad/urgencia; no se recorta todo a un tiro automático en el último instante. Pérdida o contacto pueden llegar antes de la finalización prevista.

Energía propuesta: 0–100. Gasto de referencia: 2 unidades por minuto de juego para una carga neutral. Factor de Resistencia:

$$
f_R=\operatorname{clamp}(1-0{,}02(R-16),\,0{,}70,\,1{,}30).
$$

Se utiliza Resistencia de base para evitar retroalimentar gasto mediante la misma fatiga. Factor combinado de carga orientativo: 0,85–1,35, con tareas e intensidad.

Recuperación inicial propuesta: banquillo +1,5 por minuto de juego; tiempo muerto +2; intervalo de cuarto +4; descanso largo +10 en lugar del incremento de intervalo, sin duplicarlo.

**Sustitución aplicada:** la curva que comenzaba en E = 60 y sus máximos 6/4/1,8 no son reglas vigentes. Rige la curva de seis nodos aceptada como semilla —100, 70, 50, 30, 10 y 0— con deterioro selectivo por tarea; los máximos deben completarse y calibrarse. La capacidad base permanece y no se duplica el efecto mediante otro factor de fatiga.

<a id="src-md03-l1279"></a>

#### 29.2.10. Forma, momento, consistencia y presión

*Origen: MD03 §A.10.*

Forma propuesta F entre −1 y +1; máximo K de ejecución ofensiva ±0,35. Defensa y otros mecanismos necesitan coeficientes pertinentes propios.

Ejemplo de triple con Equilibrio 16, oposición neutral y resto neutral:

| Triple | Forma | Probabilidad ilustrativa |
|---|---|---:|
| 12 | Neutral | 29,50 % |
| 12 | +1 | 37,26 % |
| 18 | Neutral | 37,92 % |
| 18 | −1 | 30,09 % |

El ejemplo muestra el cruce posible sin cambiar capacidad permanente. No fija toda la evolución de forma. La persistencia semanal de 0,98 con variación pequeña es un antecedente provisional de posible evolución del manager, no una regla cerrada del encuentro; sus distribuciones y entradas pertenecen a ese sistema posterior. El laboratorio puede recibir F directamente.

**Sustitución aplicada:** el momento escalar y su fórmula de actualización histórica quedan reemplazados por M-TIR, M-OFE y M-DEF, más T colectivo. Se utiliza la dinámica temporal compartida, episodios EPI01–EPI06, agrupación causal y presupuesto conjunto; T no tiene contribución directa a conversión de tiro. Las amplitudes, persistencias y magnitudes por ámbito se completan en el perfil sin copiar los coeficientes escalares a todos los estados.

Presión inicial de importancia: ordinario 0,10; relevante 0,35; eliminación 0,60; final 0,80. Una situación decisiva puede elevar presión contextual a 1. La combinación inicial de importancia y tensión utiliza el máximo acotado; sensibilidades y ventanas pertinentes se completan en el perfil.

$$
K_{\mathrm{presión}}=-0{,}35P\left(1-a(\mathrm{Rendimiento\ bajo\ presión})\right).
$$

Es una referencia para ejecución pertinente. Control/elección requieren intensidad específica; no se reutiliza la misma penalización en todas las etapas. Experiencia y edad tienen coeficiente directo adicional cero dentro del partido.

<a id="src-md03-l1316"></a>

#### 29.2.11. Entrenador automático y revisión neutral

*Origen: MD03 §A.11.*

Primeras referencias de rotación propuestas: considerar descanso alrededor de E = 45, retorno alrededor de E = 65 y tramos orientativos de 6–8 minutos. Deben combinarse con faltas, periodo, roles, alternativas y situación; no son prohibiciones de uso ni sustitución instantánea fuera de una ventana legal.

Las políticas funcionales de ajustes, pausas, finales, director alternativo y objetivos están definidas en el diseño vigente. Sus filas, umbrales y magnitudes iniciales deben completarse; no se añade un catálogo de capacidades del entrenador.

Referencias provisionales para revisar un escenario neutral de partido FIBA:

| Magnitud | Intervalo de revisión inicial |
|---|---|
| Posesiones por equipo | 70–78 |
| Acierto de dos | 50–56 % |
| Acierto de tres | 33–37 % |
| Acierto de libres | 72–78 % |
| Pérdidas por equipo | 11–16 |
| Rebote ofensivo | 22–30 % |

No proceden de una muestra estadística oficial recogida para beM. Son objetivos iniciales pendientes de contraste con competición/población y con las definiciones del apartado 19. No se fuerzan durante el encuentro y no aplican por igual a cualquier plantilla, estilo o rival.

La propuesta numérica permanece abierta a revisión. El paso siguiente no consiste en añadir más fórmulas aisladas, sino en cerrar el perfil coherente y observar sus efectos en partidos completos.

<a id="grupo-29-03"></a>

### 29.3. Filas de ejemplo para el panel

*Procedencia: MD05, anexo A.*

<a id="src-md05-l1908"></a>

#### 29.3.1. Finalidad y estados

*Origen: MD05 §A.1.*

Este anexo concreta el aspecto funcional de las tablas administradas. **No es un archivo de configuración listo para importar ni el perfil numérico completo del motor.** Evita presentar las pocas semillas disponibles como si ya cubrieran todos los mecanismos.

Los identificadores siguientes son ejemplos estables de diccionario, no una elección obligatoria de nombres técnicos. Los valores tienen estos estados:

- **D:** decisión de estructura o restricción funcional cerrada.
- **S:** semilla numérica provisional heredada o conservada para ajuste.
- **I:** ilustración nueva de presentación o cálculo; no valor ratificado.
- **C:** dato requerido por completar en el perfil inicial, bajo la estructura decidida.

El futuro panel no iniciará un partido si falta un dato requerido. La presente especificación sí puede registrar que ese dato necesita autoría, sin confundirlo con una decisión funcional pendiente.

<a id="src-md05-l1921"></a>

#### 29.3.2. Selección y cálculo

*Origen: MD05 §A.2.*

| ID de ejemplo | Nombre que ve Dennis | Valor/criterio | Unidad o tipo | Estado | Dónde actúa |
|---|---|---|---|---|---|
| `sel.priority.1` | Preferencia prioridad 1 | 8 | Peso relativo | S | Preferencia del libro. |
| `sel.priority.2` | Preferencia prioridad 2 | 5 | Peso relativo | S | Preferencia del libro. |
| `sel.priority.3` | Preferencia prioridad 3 | 3 | Peso relativo | S | Preferencia del libro. |
| `sel.priority.4` | Preferencia prioridad 4 | 2 | Peso relativo | S | Preferencia del libro. |
| `sel.priority.5` | Preferencia prioridad 5 | 1 | Peso relativo | S | Preferencia del libro. |
| `sel.family.mass` | Masa inicial de familia | Mejor prioridad elegible | Regla de agregación | D | Evitar masa por duplicados. |
| `sel.freedom.mix` | Mezcla de lectura | `F × (0,25 + 0,75 × I)` | Proporción acotada | S | Plan/lectura. |
| `sel.direct.context` | Preferencia de oportunidad directa | Por contexto, rol y preparación | Filas de peso | C | Recursos ESP01–ESP20. |
| `sel.immediate.acceptance` | Aceptación de oportunidad inmediata | Por calidad percibida, reloj y estilo | Curva/preferencia | C | Tirar/penetrar/pasar o continuar. |
| `res.task.attributes` | Capacidades de una tarea | Principal, apoyos y oposición identificados | Pesos/sensibilidades | C | Tareas comunes del MD03. |
| `res.binary.reference` | Probabilidad de referencia | Una referencia por situación declarada | Probabilidad | C | Binaria pertinente. |
| `res.exclusive.outputs` | Salidas de interacción | Categorías elegibles y distribución | Distribución | C | Hechos excluyentes. |
| `res.contact.finish` | Conversión bajo contacto elegible | Condicional, no copia de tiro sin contacto | Probabilidad | C | Combinación compatible. |
| `risk.exposure.reference` | Riesgo sostenido de referencia | Probabilidad y duración de referencia | Probabilidad + segundos | C | Exposición homogénea pertinente. |
| `time.context.distribution` | Duración de situación | Centro, dispersión y límites por desenlace | Segundos/distribución | C | Tiempo hasta hecho. |

Los campos C son un conjunto de filas por mecanismo, no una sola casilla que use el mismo valor para todo. Su autoría reutiliza las tablas y semillas del Documento 03, completando referencias y condiciones.

<a id="src-md05-l1943"></a>

#### 29.3.3. Energía y estados

*Origen: MD05 §A.3.*

| ID de ejemplo | Nombre que ve Dennis | Valor/criterio | Unidad o tipo | Estado | Observación |
|---|---|---|---|---|---|
| `energy.range` | Rango de reserva | 0–100 | Energía | D | Batería actual. |
| `energy.cost.neutral` | Gasto neutral | 2 | Energía/minuto de juego | S | Carga y Resistencia modifican gasto. |
| `energy.load.reference_range` | Rango inicial de carga | 0,85–1,35 | Factor | S | No se cobra repetido por fases lógicas. |
| `energy.recovery.bench` | Recuperación en banquillo | 1,5 | Energía/minuto de juego | S | No tiempo de espera en pantalla. |
| `energy.recovery.timeout` | Recuperación de pausa | +2 | Energía/tiempo muerto | S | Una vez por pausa concedida. |
| `energy.recovery.short_interval` | Recuperación de intervalo corto | +4 | Energía/intervalo | S | Límite superior 100. |
| `energy.recovery.halftime` | Recuperación de descanso largo | +10 | Energía/descanso | S | Sustituye el corto equivalente. |
| `energy.severity.100` | Severidad a energía 100 | 0,00 | Fracción de máximo de tarea | S | Nodo aceptado como semilla de precarga en MD07. |
| `energy.severity.70` | Severidad a energía 70 | 0,01 | Fracción de máximo de tarea | S | Tramo casi neutro. |
| `energy.severity.50` | Severidad a energía 50 | 0,10 | Fracción de máximo de tarea | S | Curva inicial provisional. |
| `energy.severity.30` | Severidad a energía 30 | 0,30 | Fracción de máximo de tarea | S | No implica perder 30 % de todas las notas. |
| `energy.severity.10` | Severidad a energía 10 | 0,65 | Fracción de máximo de tarea | S | Reserva crítica. |
| `energy.severity.0` | Severidad a energía 0 | 1,00 | Fracción de máximo de tarea | S | Máximo de cada sensibilidad. |
| `energy.task.max_effect` | Deterioro máximo de tarea | Selectivo por ámbito | Unidad del mecanismo | C | Debe cumplir coste considerable bajo 10. |
| `form.match.evolution` | Forma durante el encuentro | Estable | Regla | D | No se deriva de puntos o VAL. |
| `form.offense.reference_limit` | Sensibilidad ofensiva de forma | Hasta ±0,35 | Logit de referencia | S | No aplicar idéntico a toda tarea. |
| `form.calendar.evolution` | Evolución persistente de forma | Persistencia, retorno y entradas declaradas | Curva temporal | C | Integración posterior con manager. |
| `moment.individual.domains` | Ámbitos individuales | 3 | Cantidad/estructura | D | Tiro, control, defensa/disputa. |
| `moment.individual.profile` | Dinámica de altibajos | Amplitud, persistencia e impulsos por ámbito | Perfil | C | Con neutralidad de referencia. |
| `moment.team.states` | Estado colectivo por equipo | 1 | Cantidad/estructura | D | No otra colección de reservas emocionales. |
| `moment.team.profile` | Respuesta colectiva | Límites, persistencia y señales | Perfil | C | Aportes reales sin aura fija. |
| `moment.combined.budget` | Influencia máxima conjunta | Límite por tarea y combinación | Unidad del mecanismo | C | No sumar dos máximos completos. |
| `pressure.combine` | Combinar importancia/tensión | Máximo acotado | Regla inicial | S | Evita suma duplicada; magnitudes administrables. |

Los seis nodos de severidad quedaron aceptados como semillas de precarga en MD07. Deben cargarse junto con los máximos por tarea y conservar su carácter provisional hasta evaluarlos.

<a id="src-md05-l1973"></a>

#### 29.3.4. Dirección, memoria y estadística

*Origen: MD05 §A.4.*

| ID de ejemplo | Nombre que ve Dennis | Valor/criterio | Tipo | Estado | Observación |
|---|---|---|---|---|---|
| `coach.rotation.energy_review` | Considerar descanso | Umbral condicionado | Parámetro de política | C | Nunca equivale por sí solo a retirada. |
| `coach.rotation.return_review` | Considerar retorno | Distinto del anterior | Parámetro de política | C | Con estabilidad y alternativas. |
| `coach.rotation.minimum_stint` | Estabilidad de tramo | Mínimos y excepciones | Política | C | Sin impedir una obligación legal. |
| `coach.fouls.book` | Librillo de faltas | Filas por periodo, faltas, urgencia y sustituto | Política ordenada | C | Criterios provisionales de §11.6. |
| `coach.timeouts.intent` | Motivo de pausa | Racha, reorganizar, preparar, final u otra intención definida | Categoría | D | Intención distinta de resultado. |
| `coach.timeouts.triggers` | Cuándo considerar pausa | Señales, ventana y disponibilidad | Política | C | Sin leer el futuro ni momento rival exacto. |
| `coach.adjustments.stability` | Mantener ajuste | Tramo y causas de revisión | Política | C | Evitar cambiar todos los estilos continuamente. |
| `memory.patterns.capacity` | Patrones relevantes conservados | Hasta 8 como referencia inicial | Cantidad | S | El libro no queda limitado a ocho fichas. |
| `memory.patterns.decay` | Pérdida de relevancia | Referencia de 6–8 ataques sin repetición | Horizonte orientativo | S | Completar una curva de decaimiento cargable. |
| `memory.patterns.identity` | Reconocer parecido | Señal general/específica semántica | Regla | D | Nombre editable fuera de la clave. |
| `stats.quality.categories` | Calidad pública | Cómoda, normal, forzada | Categorías | D | Antes de conocer el resultado. |
| `stats.shot.sectors` | Sectores de tiro | Diez funcionales y detalle desconocido si procede | Categorías | D | No inventar ubicación. |
| `stats.clutch.seconds` | Ventana de final ajustado | 120 | Segundos | S | Cuarto final o prórroga. |
| `stats.clutch.margin` | Margen de final ajustado | 5 | Puntos de margen previo | S | Incluye igualdad en el límite. |
| `stats.lineups.universes` | Quintetos | Presencia, completas, mixtas | Convención | D | Tasas con universos compatibles. |
| `stats.visibility.policy` | Ámbitos de información | Público, propio/conocido, diagnóstico | Política | D | Permisos por campo/vista. |
| `summary.highlight.count` | Claves iniciales del resumen | 3 claves principales ampliables | Presentación | D | Menos si la evidencia válida es insuficiente; no altera hechos deportivos. |
| `population.generator.profile` | Generación de perfiles | Rangos, dependencias y dispersión | Perfil | C | No uniformes independientes de 32 notas. |

<a id="src-md05-l1996"></a>

#### 29.3.5. Ejemplo de edición de pesos

*Origen: MD05 §A.5.*

Tres familias elegibles tienen pesos 8, 8 y 3. Antes de otros modificadores, el reparto es aproximadamente **42,11 %, 42,11 % y 15,79 %**. Son probabilidades resultantes de esos pesos en ese conjunto, no cuotas por partido.

Si se añade una segunda ficha de la primera familia con la misma mejor prioridad, su masa inicial no pasa a 16. Se reparte su elección de variante dentro de la familia.

Si una familia deja de ser elegible, se vuelve a normalizar entre las restantes. La interfaz muestra ese contexto cuando ofrece una previsualización; no promete un porcentaje fijo de uso de la familia para todo el encuentro.

<a id="src-md05-l2004"></a>

#### 29.3.6. Ejemplo de distribución y relación condicional

*Origen: MD05 §A.6.*

Ejemplo puramente matemático: una interacción tiene 75 % conservación, 15 % pérdida y 10 % contacto de una clase elegible. Son alternativas excluyentes y suman 100 %. Para reducir pérdidas, no se cambia 15 a 10 dejando el total en 95 % sin explicar dónde va la masa restante.

En otra resolución compatible con tiro bajo contacto puede existir una probabilidad del 10 % de contacto y una probabilidad condicional del 40 % de conversión bajo ese contacto. Su probabilidad conjunta sería 4 % bajo esas definiciones. No es un 40 % de todas las posesiones ni se obtiene multiplicando una conversión tomada de otro contexto incompatible.

Estos porcentajes son ilustraciones de unidades y relaciones; **no son frecuencias reales ni semillas de balance de beM**.

<a id="src-md05-l2012"></a>

#### 29.3.7. Ejemplo de curva de energía

*Origen: MD05 §A.7.*

Con los nodos aceptados como semilla y la interpolación por tramos de [MD05 §8.3](../simulacion/c13-tiempo-esfuerzo-y-energia.md#src-md05-l0492), E = 5 da severidad 0,825, mientras E = 30 da 0,30. Cada valor aplica la parte correspondiente del efecto máximo de una tarea.

Si se revisa el máximo de una tarea, la previsualización debe mostrar el cambio de esa tarea para todo el rango. Si se revisan los nodos, debe mostrar qué tareas se ven afectadas. Así se evita confundir forma de la curva con magnitud final del deterioro.

El panel debe permitir comparar el jugador cansado con alternativas reales, sin transformar la severidad en una nota global de influencia.

<a id="src-md05-l2020"></a>

#### 29.3.8. Ejemplo de propuesta de ajuste documentada

*Origen: MD05 §A.8.*

| Campo | Ejemplo funcional |
|---|---|
| Observación | Exceso de triples tempranos forzados de decisión directa en perfiles que no deberían priorizarlos. |
| Evidencia | Lote y partidos identificados; oportunidades, elecciones y calidad previa. |
| Hipótesis | La preferencia de aceptación pesa demasiado frente a preparación/oposición percibida. |
| Datos candidatos | Filas concretas de SEL08/SEL09, con valores base y candidatos visibles. |
| Datos que se conservan en esa comparación | Referencia de conversión, capacidades de jugadores y reglas. |
| Efecto esperado | Menos aceptación de opciones forzadas sin eliminar el triple temprano cómodo. |
| Auditorías | Selección/ejecución, juego espontáneo, oportunidad, estilos y partidos completos. |
| Posible efecto secundario | Bajar también tiros buenos o aumentar pérdidas al esperar. |
| Decisión posterior | Aceptar, reducir, descartar o recoger más muestra. |

La propuesta no contiene un porcentaje inventado como objetivo. Si existe una referencia comparable, se incorpora con su definición y muestra.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c29-p01-perfil-inicial-semillas-y-trabajo-numerico](c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md) · Siguiente: [c30-alcance-de-construccion-y-trabajos-por-completar](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md)
