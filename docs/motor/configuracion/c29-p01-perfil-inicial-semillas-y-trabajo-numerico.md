<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: configuracion](README.md) · Capítulo 29 — Perfil inicial y semillas numéricas · parte 1 de 2
> Anterior: [c28-p04-criterios-de-aceptacion-documental-y-funcional](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md) · Siguiente: [c29-p02-duracion-carga-y-fatiga](c29-p02-duracion-carga-y-fatiga.md)
<!-- beM:nav-fin -->

<a id="cap-29"></a>

## 29. Perfil inicial y semillas numéricas

Este capítulo conserva las semillas compatibles, las ilustraciones y el inventario de datos por completar. Se retiran como fórmulas vigentes la curva energética que empezaba en 60 y la actualización escalar antigua de momento. Los ejemplos matemáticos de distribución no se convierten en ratios de balance.

<a id="grupo-29-01"></a>

### 29.1. Perfil inicial, semillas y trabajo numérico

*Procedencia: MD07, §29.*

<a id="src-md07-l1520"></a>

#### 29.1.1. Estado de los datos

*Origen: MD07 §29.1.*

| Etiqueta de trabajo | Significado | Ejemplo |
|---|---|---|
| DEC | Regla o cantidad cerrada. | 32 capacidades; tres ámbitos individuales. |
| FUN | Contenido funcional definido. | POS11 y sus alternativas. |
| SEM | Valor inicial provisional explícito. | Prioridades 8–5–3–2–1. |
| CARGA | Datos concretos aún por completar. | Pesos numéricos de una tarea o 32 valores de un jugador. |
| EVAL | Evidencia de evaluación identificada. | Resultado futuro de una auditoría sobre versión concreta. |

Las etiquetas no son cinco estados excluyentes de toda una tabla. Una definición puede ser DEC/FUN y contener coeficientes SEM o CARGA. EVAL exige evidencia; no se asigna por aceptación de diseño.

<a id="src-md07-l1532"></a>

#### 29.1.2. Semillas concretadas en esta entrega

*Origen: MD07 §29.2.*

| Concepto | Precarga o regla | Estado |
|---|---|---|
| Pesos de prioridad | 8, 5, 3, 2, 1. | SEM compatible conservada. |
| Masa de familia | Mejor prioridad elegible, sin suma por duplicados. | DEC heredada; implementación debe respetarla. |
| Alcance | Combinación equilibrada de medidas normalizadas. | SEM de combinación; normalizaciones por cargar. |
| Duración | Triangular acotada en intervalos pertinentes. | DEC de forma; parámetros por cargar. |
| Energía | Seis nodos del apartado 10.3. | SEM aceptada para precarga. |
| Energía máxima presentada | 0–100 como rango del estado. | DEC. |
| T colectivo en conversión directa de tiro | Sin contribución directa. | DEC; no campo numérico vacío. |
| Peso corporal como modificador directo adicional | Sin efecto inicial. | DEC. |
| Memoria | Hasta ocho patrones como referencia inicial. | SEM; decaimiento exacto por cargar. |
| Tres claves principales | Tres, con ampliación. | DEC de presentación inicial. |

<a id="src-md07-l1547"></a>

#### 29.1.3. Semillas históricas

*Origen: MD07 §29.3.*

Otros valores de MD03–05 pueden conservarse como semillas si mantienen significado, unidad y compatibilidad con los cierres posteriores. No se importan en bloque sin revisar su procedencia.

En particular, la curva antigua que penalizaba desde un umbral distinto, la representación escalar de momento, una prima amplia de ejecución por T o la alternativa de box and one presentada como no decidida no sobreviven como reglas vigentes.

Una cifra de ejemplo puramente matemático no se convierte en semilla deportiva. La ilustración de una distribución de resultados no establece porcentajes de pérdida o falta del perfil.

<a id="src-md07-l1555"></a>

#### 29.1.4. Paquete numérico que debe completarse

*Origen: MD07 §29.4.*

El perfil inicial requiere todas las referencias, sensibilidades, pesos, condiciones, límites, duraciones, cargas, recuperaciones, políticas y fronteras de categoría obligatorios de los 81 grupos aplicables.

También requiere correspondencias reglamentarias/estadísticas y datos de las 144 plazas, más sus planes. El generador necesita rangos y dependencias concretos. El laboratorio necesita escenarios y tolerancias iniciales declarados.

Este trabajo llena la estructura elegida. No reabre los modelos aceptados ni concede permiso para inventar otra habilidad o subsistema durante programación.

<a id="src-md07-l1563"></a>

#### 29.1.5. Responsable de cada decisión

*Origen: MD07 §29.5.*

Dennis decide cambios funcionales. ChatGPT prepara propuestas de contenido y valores con razones, procedencia y límites dentro del diseño. La implementación realiza las operaciones y validaciones, señalando una decisión ausente en vez de completarla silenciosamente.

Las decisiones técnicas reversibles pueden resolverse durante construcción si conservan el contrato funcional. La ausencia de una magnitud calibrada no exige diseñar otra arquitectura; necesita una semilla explícita y evaluación posterior.

<a id="src-md07-l1569"></a>

#### 29.1.6. Condición de entrega utilizable

*Origen: MD07 §29.6.*

El primer perfil operativo se entrega completo y preconfigurado. Dennis puede jugar un partido y empezar a ajustar sin introducir manualmente todas las cifras.

Completo significa que las filas requeridas existen y son válidas. Evaluado significa que hay evidencia sobre sus resultados. La primera condición debe cumplirse antes de jugar; la segunda se desarrolla con el motor ejecutable.

<a id="grupo-29-02"></a>

### 29.2. Valores y fórmulas iniciales provisionales

*Procedencia: MD03, anexo A.*

<a id="src-md03-l1004"></a>

**Todo este anexo es una propuesta numérica de trabajo.** Conserva las semillas planteadas después del Documento 02 para que no se pierdan al pasar la conversación a MD. Sus sumas y algunos ejemplos son comprobables aritméticamente; no se han calibrado ejecutando un motor de beM.

Estas cifras no bastan por sí solas para implementar toda la cobertura. Ayudas, recepciones, infracciones, interrupciones conservadas, estados por ámbitos y perfiles defensivos necesitan condiciones y parámetros concretos. Las definiciones funcionales del cuerpo del documento prevalecen ante una simplificación incompleta del anexo.

<a id="src-md03-l1010"></a>

#### 29.2.1. Convenciones matemáticas

*Origen: MD03 §A.1.*

Se trabaja provisionalmente con capacidades en escala continua equivalente 1–30 y una referencia neutral **16**. La representación vigente conserva precisión continua equivalente a 1–30 y redondea al presentar; el almacenamiento técnico equivalente no crea una segunda nota.

$$
a(A)=\frac{A-1}{29},\qquad
\sigma(z)=\frac{1}{1+e^{-z}},\qquad
\operatorname{logit}(p)=\ln\frac{p}{1-p}.
$$

Una mezcla de capacidades utiliza pesos pertinentes normalizados. Cada componente pertenece al participante correcto. Para elegir entre candidatos viables:

$$
P(i)=\frac{w_i}{\sum_{j\in V}w_j}.
$$

Las probabilidades binarias pertinentes pueden usar:

$$
P_e=\sigma\left(\operatorname{logit}(p_{0,e})+
s_{A,e}(A_{\mathrm{ef}}-16)-s_{D,e}(D_{\mathrm{ef}}-16)+K_e\right).
$$

Pesos, sensibilidades y modificadores son datos configurables. Probabilidades, segundos, centímetros y energía requieren unidades compatibles; no se suman sin interpretación.

<a id="src-md03-l1035"></a>

#### 29.2.2. Prioridades, libertad y elección

*Origen: MD03 §A.2.*

| Prioridad del libro | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|
| Peso inicial propuesto | 8 | 5 | 3 | 2 | 1 |

Son pesos relativos. La distribución final utiliza elegibilidad, contexto y normalización. Las prioridades no imponen un número de usos.

Regla vigente: seleccionar familia y después variante; la masa inicial de familia utiliza la mejor prioridad elegible, evitando sumar masa por duplicados. La elección interna entre variantes considera prioridad, requisitos y ajuste. Los coeficientes conservan su condición de semillas.

| Libertad | Muy rígido | Pautado | Equilibrado | Flexible | Mucha libertad |
|---|---:|---:|---:|---:|---:|
| F propuesto | 0,05 | 0,20 | 0,40 | 0,65 | 0,85 |

Con iniciativa I normalizada entre 0 y 1:

$$
L=F(0{,}25+0{,}75I),\qquad
P_{\mathrm{elección}}=(1-L)P_{\mathrm{entrenador}}+LP_{\mathrm{jugador}}.
$$

$$
q=\frac{0{,}55\,\mathrm{Visión}+0{,}45\,\mathrm{Decisiones}-1}{29},\qquad
P_{\mathrm{jugador}}=qP_{\mathrm{adaptación}}+(1-q)P_{\mathrm{preferencias}}.
$$

Adaptación utiliza estimaciones y señales disponibles, no el desenlace futuro. q no concede conocimiento perfecto. La percepción de opciones y sus errores requieren el contrato correspondiente.

Ejemplo: F = 0,85 e I = 0,8 producen L = 0,7225. Es el peso de una distribución, no porcentaje de decisiones acertadas ni cuota de una jugada.

Para ajuste técnico de un candidato se propuso:

$$
\mathrm{ajuste}(A)=\operatorname{clamp}(1+0{,}035(A-16),\,0{,}35,\,1{,}50).
$$

Debe aplicarse a una capacidad realmente pertinente, junto a rol, disponibilidad y situación. No sustituye la probabilidad de éxito.

<a id="src-md03-l1073"></a>

#### 29.2.3. Preferencias ofensivas y reparto inicial de salidas

*Origen: MD03 §A.3.*

| Familia | Llegada al aro | Interior estable | Media | Triple |
|---|---:|---:|---:|---:|
| Bloqueo directo | 45 | 10 | 10 | 35 |
| Mano a mano | 25 | 5 | 10 | 60 |
| Bloqueo indirecto | 10 | 5 | 10 | 75 |
| Pase y corte | 60 | 10 | 5 | 25 |
| Poste | 20 | 55 | 15 | 10 |
| Aclarado | 40 | 15 | 15 | 30 |

Cada fila suma 100 como peso inicial. No es distribución final de tiros ni cuota. Receptor, variante, defensa, preparación y órdenes deben modificar o excluir candidatos.

| Parámetro por nivel 1–5 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|
| Multiplicador de duración organizada | 1,20 | 1,10 | 1,00 | 0,90 | 0,80 |
| Preferencia de triple | 0,55 | 0,80 | 1,00 | 1,30 | 1,65 |
| Preferencia interior | 1,45 | 1,20 | 1,00 | 0,85 | 0,65 |
| Reconsideración elegible | 5 % | 10 % | 20 % | 35 % | 50 % |
| Modificador logit de riesgo ofensivo | −0,25 | −0,12 | 0 | +0,12 | +0,25 |
| Modificador logit rebote/balance | −0,60 | −0,30 | 0 | +0,30 | +0,60 |
| Intentar transición tras recuperación viva elegible | 30 % | 45 % | 60 % | 75 % | 90 % |
| Intentar transición tras rebote defensivo elegible | 15 % | 25 % | 35 % | 45 % | 60 % |

Los niveles corresponden a la dimensión nombrada; no se aplica toda la columna como un paquete. La reconsideración añadiría aproximadamente 3–5 segundos si puede realizarse, sin exigir resolver cada pase.

Media distancia: multiplicador de preferencia 0,40 para Evitar, 1,00 para Aceptar liberada y 1,50 para Buscar con adecuados. Son preferencias; la condición de liberación/adecuación debe existir.

Se propuso una afinidad moderada disposición/familia entre 0,75 y 1,25. No representa un bonus directo al tiro. Valores por pareja y requisitos siguen pendientes.

<a id="src-md03-l1103"></a>

#### 29.2.4. Defensa y memoria: primeras referencias

*Origen: MD03 §A.4.*

| Preferencia de ayudas 1–5 | 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|
| Ayuda adicional cuando es elegible | 10 % | 25 % | 40 % | 55 % | 70 % |

Se refiere a ayuda adicional pertinente, no a suprimir responsabilidades inherentes de una zona. Participante, coste de responsabilidad y calidad de recuperación deben resolverse.

| Altura de presión | K de pérdida | Tiempo añadido orientativo | Carga añadida orientativa |
|---|---:|---:|---:|
| Normal | 0 | 0 s | 0 % |
| Tres cuartos | +0,10 | +1 s | +8 % |
| Total | +0,20 | +2 s | +15 % |

Son efectos de referencia condicionados al avance bajo presión. Superarla puede producir ventaja; no se añade el castigo de presión otra vez al ataque ya liberado.

Quedan sin coeficiente final la intensidad de presión sobre balón, negación, riesgo defensivo, protección interior/exterior y diferencias de cobertura. No se consideran implementadas por tener un control.

Memoria inicial propuesta: últimos **8 patrones**, relevancia por recencia y efecto máximo **0,30** sobre la creación de oportunidad en unidades de su fórmula. Es un antecedente provisional de magnitud por revisar dentro de una respuesta deportiva compatible, ejecutada con anticipación, comprensión y recursos reales. No autoriza una penalización automática por reconocimiento ni una resta adicional de acierto por contador. No significa 30 puntos porcentuales de tiro.

Box and one utiliza su alternativa declarada ante ausencia de objetivos elegibles. La alternativa de organización preconfigurada aceptada es 2–3; puede declararse otra admitida y compatible. El retorno se sujeta a la intención vigente y su frontera pertinente.

<a id="src-md03-l1125"></a>

#### 29.2.5. Mezclas iniciales para crear oportunidades

*Origen: MD03 §A.5.*

Cada fila suma 100 % por lado. Es una aproximación inicial; no incluye todos los mecanismos del mapa completo.

| Situación | Capacidad ofensiva CA | Capacidad defensiva CD |
|---|---|---|
| Bloqueo directo | Manejo 40 %; Bloqueos 30 %; Aceleración 15 %; Comprensión 15 % | Defensa de bloqueos 40 %; Perimetral 30 %; Interior 20 %; Anticipación 10 % |
| Mano a mano | Pase 30 %; Manejo 30 %; Movimiento sin balón 20 %; Comprensión 20 % | Perimetral 40 %; Defensa de bloqueos 35 %; Anticipación 25 % |
| Indirecto | Movimiento sin balón 45 %; Bloqueos 30 %; Comprensión 15 %; Agilidad 10 % | Defensa de bloqueos 55 %; Perimetral 25 %; Anticipación 20 % |
| Corte | Movimiento sin balón 45 %; Pase 30 %; Anticipación 15 %; Aceleración 10 % | Perimetral 45 %; Anticipación 35 %; Comprensión 20 % |
| Poste | Poste 55 %; Fuerza 25 %; Comprensión 10 %; Equilibrio 10 % | Interior 65 %; Fuerza 25 %; Anticipación 10 % |
| Aclarado | Manejo 60 %; Aceleración 25 %; Agilidad 15 % | Perimetral 55 %; Agilidad 30 %; Anticipación 15 % |
| Transición | Velocidad 45 %; Aceleración 30 %; Finalización 15 %; Pase 10 % | Velocidad 45 %; Aceleración 30 %; Comprensión 25 % |

La asignación al actor es obligatoria: Pase del emisor, Movimiento del receptor, Bloqueos del bloqueador, etc. La semilla de transición mezcla acceso y técnica de llegada; debe revisarse al separar preparación y finalización para no duplicar el mismo efecto.

La ampliación funcional requiere pesos concretos de lectura defensiva, concentración, recepción y ayudas que estas filas no cierran. No se debe forzar su inclusión simbólica en todas las mezclas.

Referencia para calidad cómoda, normal o forzada:

$$
z=0{,}06(CA-CD)+K,\qquad
w_{\mathrm{cómoda}}=0{,}25e^z,\quad
w_{\mathrm{normal}}=0{,}55,\quad
w_{\mathrm{forzada}}=0{,}20e^{-z}.
$$

Se normalizan esos tres pesos. Con CA = CD y K = 0, resultan 25/55/20 %. Con ventaja CA − CD = 10, resultan aproximadamente 40,84/49,31/9,84 %.

K representa condiciones aún no recogidas en las mezclas. La calidad no sustituye a la identificación del defensor/oposición real.

<a id="src-md03-l1156"></a>

#### 29.2.6. Sucesos principales y control

*Origen: MD03 §A.6.*

Semilla de desenlaces principales para una secuencia de referencia:

| Desenlace | Peso/probabilidad inicial |
|---|---:|
| Pérdida | 13 % |
| Falta sin tiro | 7 % |
| Falta de tiro | 10 % |
| Tiro normal | 70 % |

**Estas cuatro categorías son una referencia parcial.** Faltan clasificación y magnitudes de interrupciones, disputas y variantes reglamentarias del contrato completo. El final por reloj puede venir determinado por la situación, no por un sorteo arbitrario añadido.

Para alternativas exclusivas se propuso:

$$
P_j=\frac{p_{0,j}e^{z_j}}{\sum_k p_{0,k}e^{z_k}}.
$$

Solo elevar el modificador de pérdida a +0,35 convierte el 13 % en aproximadamente 17,50 % y renormaliza las otras categorías. No conserva a la vez todos sus porcentajes iniciales.

Control inicial: Manejo 55 %, Pase 30 %, Concentración 15 %. Intervención defensiva inicial: Robo 40 %, Perimetral 30 %, Anticipación 20 %, Agilidad 10 %.

$$
z_{\mathrm{pérdida}}=0{,}045(C_{\mathrm{def}}-C_{\mathrm{control}})
+K_{\mathrm{riesgo}}+K_{\mathrm{presión}}+K_{\mathrm{estado}}+K_{\mathrm{exposición}}.
$$

La mezcla se adapta a una tarea con bote o pase; no implica que una pérdida por mal envío dependa del manejo de un jugador distinto. Un subtipo solo puede ocurrir cuando su causa esté presente.

Referencia de contacto: técnica pertinente 60 %, Fuerza 25 %, Equilibrio 15 %. Legalidad defensiva inicial: defensa pertinente 70 %, Anticipación 20 %, Concentración 10 %. Sensibilidades, contextos y separación de contactos ofensivos siguen pendientes.

<a id="src-md03-l1188"></a>

#### 29.2.7. Tiros, preparación y tapones

*Origen: MD03 §A.7.*

| Tipo | p₀ | Capacidad ofensiva A | Oposición D | sA | sD |
|---|---:|---|---|---:|---:|
| Triple | 0,35 | Triple 90 %; Equilibrio 10 % | Perimetral 100 % | 0,070 | 0,035 |
| Media | 0,39 | Media 90 %; Equilibrio 10 % | Perimetral 100 % | 0,070 | 0,035 |
| Interior estable | 0,56 | Interior 85 %; Equilibrio 15 % | Interior 80 %; Fuerza 20 % | 0,065 | 0,040 |
| Llegada al aro | 0,64 | Finalización 80 %; Equilibrio 15 %; Salto 5 % | Interior 80 %; Fuerza 20 % | 0,065 | 0,040 |
| Libre | 0,75 | Libre 95 %; Concentración 5 % | Sin defensa | 0,150 | 0 |

Las p₀ de campo son referencias condicionadas a tiro sin tapón previo, preparación normal, capacidades/oposición neutrales y estados neutrales. No son porcentajes finales de equipo. La oposición debe pertenecer al defensor elegible y adaptarse al contexto; una opción completamente libre no utiliza una oposición ficticia.

Calidad propuesta en unidades logit: cómoda +0,45; normal 0; forzada −0,55. La preparación en movimiento, cuando proceda, utiliza:

$$
K_{\mathrm{movimiento}}=-0{,}40\left(1-a(\mathrm{Tiro\ en\ movimiento})\right).
$$

Se aplica a la preparación pertinente, no automáticamente a todas las entradas al aro. Alcance, recuperación y oposición adicional necesitan su referencia acotada, sin repetir la misma ventaja corporal.

| Tipo susceptible de tapón | p₀ de tapón propuesto |
|---|---:|
| Llegada al aro | 0,060 |
| Interior estable | 0,050 |
| Media | 0,015 |
| Triple | 0,008 |

Solo con defensor elegible. Capacidad de intervención inicial: Tapón 60 %, Salto 25 %, Anticipación 15 %. Resistencia a esa intervención: técnica del tiro 75 %, Equilibrio 25 %.

El tapón impide la canasta de ese intento y deja un destino del balón por resolver. El acierto se calcula condicionado a no haber sido taponado. Ejemplo neutral de llegada: 0,64 × (1 − 0,06) = 0,6016. La tasa observada incorpora ambas etapas.

El peso directo del peso corporal se dejó en cero como punto inicial para no duplicar Fuerza. El alcance necesita una representación única y limitada. El peso sin efecto directo adicional y el alcance derivado único son decisiones vigentes. Su parametrización por tarea es provisional; no son mediciones biomecánicas.

<a id="src-md03-l1221"></a>

#### 29.2.8. Rebote

*Origen: MD03 §A.8.*

Referencia ofensiva tras fallo de campo: **p₀ = 0,26**. La selección depende de participantes elegibles, cierre, acceso y contexto, no de los cinco jugadores de forma automática.

Mezcla colectiva inicial: Captura 35 %, Cierre 30 %, Salto 15 %, Fuerza 10 %, Anticipación 10 %. Tras determinar el equipo, mezcla inicial de candidato capturador: Captura 60 %, Salto 25 %, Anticipación 15 %, con disponibilidad y acceso.

El efecto del cierre en el equipo y la atribución de captura son funciones distintas. Su combinación debe evitar duplicar una misma posición.

$$
P_{\mathrm{RO}}=\sigma\left(\operatorname{logit}(0{,}26)
+s_R(R_A-R_D)+K_{\mathrm{carga}}+K_{\mathrm{contexto}}\right).
$$

sR y los factores contextuales son magnitudes requeridas por completar y calibrar dentro del modelo de rebote elegido. Con equipos neutrales y solo los cinco modificadores de carga del [MD03 §A.3](#src-md03-l1073), los resultados serían aproximadamente 16,16; 20,65; 26,00; 32,17 y 39,03 %.

Ese aumento debe tener coste de retorno según quién cargó y cómo quedó el equipo. No altera mágicamente el rebote cuando el participante no puede acceder.

Se propuso **p₀ = 0,12** para rebote ofensivo de último libre fallado con balón vivo, mediante ficha propia y participantes reglamentarios. No se aplica a cada fallo de una serie ni usa automáticamente la carga de cinco jugadores del juego normal.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c28-p04-criterios-de-aceptacion-documental-y-funcional](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md) · Siguiente: [c29-p02-duracion-carga-y-fatiga](c29-p02-duracion-carga-y-fatiga.md)
