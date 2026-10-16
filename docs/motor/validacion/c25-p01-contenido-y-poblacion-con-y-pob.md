<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: validacion](README.md) · Capítulo 25 — Población de referencia y generación · parte 1 de 2
> Anterior: [c24-modalidades-y-primer-laboratorio](../laboratorio/c24-modalidades-y-primer-laboratorio.md) · Siguiente: [c25-p02-eq08-jovenes-atleticos-y-menor-comprension](c25-p02-eq08-jovenes-atleticos-y-menor-comprension.md)
<!-- beM:nav-fin -->

<a id="cap-25"></a>

## 25. Población de referencia y generación

Las 144 plazas de referencia tienen identidad y contraste funcional definidos. Sus 32 valores numéricos y demás entradas requeridas deben completarse antes de utilizarlas: esta especificación no presenta esas instancias como ya cargadas.

<a id="grupo-25-01"></a>

### 25.1. Contenido y población: CON y POB

*Procedencia: MD07, §13.*

<a id="src-md07-l0520"></a>

#### 25.1.1. Referencia manual y generación

*Origen: MD07 §13.3.*

Los perfiles manuales permiten entender relaciones. La generación añade variedad coherente. Ambos utilizan los mismos datos de partido, escala absoluta y operaciones.

Los equipos de referencia no reciben bonus por su etiqueta. «Exterior» significa que capacidades, preferencias y plan producen esa identidad, no que se aplique un multiplicador al triple por el nombre del equipo.

<a id="grupo-25-02"></a>

### 25.2. Doce equipos manuales y generación

*Procedencia: MD07, §23.*

<a id="src-md07-l1169"></a>

#### 25.2.1. Objetivo y alcance

*Origen: MD07 §23.1.*

Los equipos EQ01–EQ12 son una población ficticia de referencia para comprender efectos y estudiar distribuciones. No son clubes reales ni plantillas del mundo definitivo.

Cada equipo tiene doce plazas con identidad estable. El [anexo de origen MD07 B](#cap-25) describe las 144 plazas funcionales. Antes de utilizarlas deben recibir sus 32 valores, cuerpo, tendencias, estados, disponibilidad y plan completo.

Este diseño no presenta esas 144 instancias numéricas como ya cargadas. Define su composición y la obligación de completarlas dentro de POB01.

<a id="src-md07-l1177"></a>

#### 25.2.2. Catálogo y planes naturales

*Origen: MD07 §23.2.*

| ID | Identidad | Qué permite estudiar | Entrada y defensa naturales de referencia |
|---|---|---|---|
| EQ01 | Equilibrado | Base de comparación sin especialidad dominante. | 4–1 e individual. |
| EQ02 | Exterior | Amenaza, recepción, preparación y costes del tiro exterior. | 5 abiertos y 3–2. |
| EQ03 | Interior | Poste, continuaciones, alto-bajo y congestión. | 3–2 ofensivo y 2–3 defensivo. |
| EQ04 | Dos creadores | Reparto de dirección y decisiones de otro receptor. | Horns e individual. |
| EQ05 | Director pasador con poca anotación | Organización sin que el director tenga que finalizar. | 4–1 y 1–2–2. |
| EQ06 | Anotador dominante con lectura limitada | Diferencia entre técnica, iniciativa y buena elección. | 5 abiertos e individual. |
| EQ07 | Veteranos técnicos y menos físicos | Lectura, especialidad y límites de llegada/esfuerzo. | 1–4 bajo e individual. |
| EQ08 | Jóvenes atléticos y menor comprensión | Físicas, errores pertinentes y aplicación del plan. | 5 abiertos e individual. |
| EQ09 | Protección interior | Contención, ayuda, oposición, cierre y captura. | 3–2 ofensivo y 2–3 defensivo. |
| EQ10 | Velocidad y presión | Avance, presión superada, carga y balance. | 4–1 e individual adelantada. |
| EQ11 | Estrella con poco recambio | Rotación contextual y valor del referente cansado. | 4–1 e individual. |
| EQ12 | Plantilla profunda | Reparto de carga y alternativas funcionales reales. | Horns y 1–2–2. |

Los planes naturales son precarga de referencia modificable. No se afirma que cada identidad solo pueda usar esa disposición o defensa. El laboratorio debe permitir cruzar planes y participantes compatibles.

<a id="src-md07-l1196"></a>

#### 25.2.3. Composición individual

*Origen: MD07 §23.3.*

Las plazas cubren dirección, creación, tiro, corte, movilidad interior, poste, pase, continuación, defensa y rebote. Pueden existir carencias deliberadas según equipo. No se rellenan todas con especialistas perfectos.

Cada jugador tiene rol ofensivo y defensivo independientes. Las posiciones recomendadas no impiden funciones alternativas. Un plan puede reasignar director principal y suplente sin convertirlo en un bonus del quinteto.

La edad puede describir el caso veterano o joven. El resultado utiliza capacidades y estados actuales, no una corrección por la etiqueta de edad.

<a id="src-md07-l1204"></a>

#### 25.2.4. Coherencia numérica

*Origen: MD07 §23.4.*

Los valores 1–30 conservan significado absoluto. Se documenta el nivel de referencia y las diferencias deliberadas. No se igualan equipos mediante un overall universal que después se use en las tareas.

Si se quiere aislar una causa, se prepara una variante controlada del mismo equipo o jugador. Cambiar toda la plantilla y llamarla «misma fuerza» no garantiza una comparación causal.

<a id="src-md07-l1210"></a>

#### 25.2.5. Generador correlacionado

*Origen: MD07 §23.5.*

El generador utiliza perfiles y dependencias explícitos para capacidades, cuerpo y tendencias. Permite variación y combinaciones poco frecuentes plausibles. No genera 32 valores uniformes independientes ni convierte cada capacidad alta en preferencia máxima.

Las correlaciones de población no se reaplican como bonus en partido. Si un cuerpo influyó en una distribución generada de Fuerza, el peso no vuelve a añadir otra mejora directa inicial de contacto.

<a id="src-md07-l1216"></a>

#### 25.2.6. Estados y variantes de referencia

*Origen: MD07 §23.6.*

Las variantes pueden cambiar energía inicial, Forma, presión, faltas disponibles, rotación, libro o política. Su alcance se identifica y el resto se conserva cuando la pregunta lo exige.

Entre los conjuntos deben existir: energía alta y crítica; referente cansado frente a recambio; iniciativa alta/baja con lectura distinta; veterano de 40 años con físicas menores; plan rígido/libre; carga/balance; y objetivos que entran/salen.

La preparación de estos casos no exige construir calendario, mercado, entreno o desarrollo antes del laboratorio. Sus entradas son explícitas.

<a id="grupo-25-03"></a>

### 25.3. Las 144 plazas de referencia

*Procedencia: MD07, anexo B.*

<a id="src-md07-l1867"></a>

#### 25.3.1. Convención de lectura

*Origen: MD07 §B.1.*

Cada equipo tiene doce identidades EQxx-Jxx. Las filas describen función y contraste deseados; **no son 144 jugadores numéricamente instanciados**. Los roles son una recomendación de precarga modificable por el plan.

«Alto», «menor», «limitado» o «competente» describen relaciones del perfil de referencia. Antes de ejecutar, cada una se traduce a valores explícitos 1–30, cuerpo y tendencias, preservando escala absoluta y procedencia.

Los jugadores pueden ocupar posiciones compatibles y asumir otras tareas. La función de referencia no concede capacidad ni impide probar otro rol. Las diferencias entre plazas no deben convertirse en un overall oculto.

El conjunto debe permitir carencias, especialistas y alternativas. El laboratorio puede copiar una entrada y modificar una causa para compararla, conservando la base original.

<a id="src-md07-l1877"></a>

#### 25.3.2. EQ01 — Equilibrado

*Origen: MD07 §B.2.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ01-J01 | Organizador | Contenedor | Dirección y pase competentes; amenaza propia moderada. |
| EQ01-J02 | Apoyo exterior | Presionador del balón | Control y apoyo fiables; menor creación de ventajas. |
| EQ01-J03 | Anotador | Marcador de una amenaza principal | Anotación con balón competente; debe leer las ayudas. |
| EQ01-J04 | Tirador de recepción | Perseguidor de tiradores | Recepción y triple útiles; manejo limitado bajo presión. |
| EQ01-J05 | Tirador en movimiento | Perseguidor | Preparación en movimiento útil; requiere una recepción realizable. |
| EQ01-J06 | Alero organizador | Ayudador de equipo | Distribución desde ala; no concentra toda la dirección. |
| EQ01-J07 | Cortador | Defensor versátil para cambios | Corte y defensa versátil; tiro de referencia moderado. |
| EQ01-J08 | Interior abierto | Interior móvil | Apertura interior útil; defensa de poste menos fuerte. |
| EQ01-J09 | Interior pasador | Ayudador del aro | Pase interior competente; finalización sin privilegio automático. |
| EQ01-J10 | Bloqueador y continuador | Defensor del poste | Pantalla y continuación; apertura exterior limitada. |
| EQ01-J11 | Anotador al poste | Protector del aro | Poste y oposición próxima; movilidad exterior menor. |
| EQ01-J12 | Creador secundario | Ayudador perimetral | Recambio de creación; especialidades más discretas que titulares. |

<a id="src-md07-l1894"></a>

#### 25.3.3. EQ02 — Exterior

*Origen: MD07 §B.3.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ02-J01 | Organizador | Contenedor | Visión y pase para encontrar receptores; anotación interior menor. |
| EQ02-J02 | Apoyo exterior | Presionador del balón | Apoyo exterior con tiro; creación propia limitada. |
| EQ02-J03 | Anotador | Marcador de una amenaza principal | Amenaza exterior con balón; selección condicionada por lectura. |
| EQ02-J04 | Tirador de recepción | Perseguidor de tiradores | Triple de recepción fuerte; defensa y control no necesariamente equivalentes. |
| EQ02-J05 | Tirador en movimiento | Perseguidor | Preparación de tiro en movimiento fuerte; requiere ejecución de apoyos. |
| EQ02-J06 | Alero organizador | Ayudador de equipo | Pase y amenaza de ala; contacto interior limitado. |
| EQ02-J07 | Cortador | Defensor versátil para cambios | Corte ante negación exterior; amplitud sin garantizar recepción. |
| EQ02-J08 | Interior abierto | Interior móvil | Interior abierto con amenaza; cierre/defensa interior más discretos. |
| EQ02-J09 | Interior pasador | Ayudador del aro | Pasador para activar exteriores; tiro propio secundario. |
| EQ02-J10 | Bloqueador y continuador | Defensor del poste | Bloqueador útil para tiradores; amenaza de apertura menor. |
| EQ02-J11 | Anotador al poste | Protector del aro | Referencia interior de seguridad; no otro gran tirador automático. |
| EQ02-J12 | Finalizador exterior | Ayudador perimetral | Finalizador exterior de recambio; menor creación bajo presión. |

<a id="src-md07-l1911"></a>

#### 25.3.4. EQ03 — Interior

*Origen: MD07 §B.4.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ03-J01 | Organizador | Contenedor | Entrada de pase y lectura interior; triple menos prioritario. |
| EQ03-J02 | Apoyo exterior | Presionador del balón | Seguridad de control; menos capacidad de decidir bajo presión. |
| EQ03-J03 | Anotador | Marcador de una amenaza principal | Penetración y contacto; amenaza exterior más discreta. |
| EQ03-J04 | Tirador de recepción | Perseguidor de tiradores | Tirador suficiente para ofrecer salida; volumen contextual. |
| EQ03-J05 | Tirador en movimiento | Perseguidor | Receptor móvil de apoyo; menor especialidad de triple. |
| EQ03-J06 | Alero organizador | Ayudador de equipo | Pasador de ala para conexión; creación individual moderada. |
| EQ03-J07 | Cortador | Defensor versátil para cambios | Corte desde ayudas; recepción exterior menos amenazante. |
| EQ03-J08 | Interior abierto | Interior móvil | Apertura utilizable; evita que dos interiores sean siempre idénticos. |
| EQ03-J09 | Interior pasador | Ayudador del aro | Distribución alta y lectura del compañero bajo; velocidad menor. |
| EQ03-J10 | Bloqueador y continuador | Defensor del poste | Continuación, fuerza y cierre; tiro exterior limitado. |
| EQ03-J11 | Anotador al poste | Protector del aro | Poste y tiro corto; desplazamiento exterior menor. |
| EQ03-J12 | Creador secundario | Ayudador perimetral | Recambio de dirección; menor anotación propia. |

<a id="src-md07-l1928"></a>

#### 25.3.5. EQ04 — Dos creadores

*Origen: MD07 §B.5.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ04-J01 | Organizador | Contenedor | Primer director con pase y lectura; anotación suficiente. |
| EQ04-J02 | Creador con balón | Contenedor | Segundo creador con manejo y tiro; decisiones distintas del principal. |
| EQ04-J03 | Anotador | Marcador de una amenaza principal | Finalizador con balón; no monopoliza siempre la iniciativa. |
| EQ04-J04 | Tirador de recepción | Perseguidor de tiradores | Receptor exterior fiable; creación con bote menor. |
| EQ04-J05 | Tirador en movimiento | Perseguidor | Receptor tras movimiento; dependencia de preparación real. |
| EQ04-J06 | Alero organizador | Ayudador de equipo | Tercera función de organización; menor amenaza de suspensión. |
| EQ04-J07 | Cortador | Defensor versátil para cambios | Corte y defensa intercambiable; pase de creación más limitado. |
| EQ04-J08 | Interior abierto | Interior móvil | Apertura interior compatible con espacio; contacto discreto. |
| EQ04-J09 | Interior pasador | Ayudador del aro | Interior pasador para otra fase; velocidad de transición menor. |
| EQ04-J10 | Bloqueador y continuador | Defensor del poste | Pantalla y llegada; decisiones de recepción corta no perfectas. |
| EQ04-J11 | Anotador al poste | Protector del aro | Recurso de poste alternativo; no exige utilizarlo por cuota. |
| EQ04-J12 | Creador secundario | Ayudador perimetral | Recambio creador; permite estudiar sustitución de ambos directores. |

<a id="src-md07-l1945"></a>

#### 25.3.6. EQ05 — Director pasador con poca anotación

*Origen: MD07 §B.6.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ05-J01 | Organizador | Contenedor | Visión, Decisiones y Pase fuertes; técnica de tiro propia baja respecto a su dirección. |
| EQ05-J02 | Apoyo exterior | Presionador del balón | Director alternativo competente; menor visión que el principal. |
| EQ05-J03 | Anotador | Marcador de una amenaza principal | Anotador receptor de ventajas; no recibe visión prestada. |
| EQ05-J04 | Tirador de recepción | Perseguidor de tiradores | Tiro de recepción útil; manejo bajo presión limitado. |
| EQ05-J05 | Tirador en movimiento | Perseguidor | Salida de pantalla útil; debe ejecutar su propia preparación. |
| EQ05-J06 | Alero organizador | Ayudador de equipo | Organización de ala complementaria; amenaza de aro moderada. |
| EQ05-J07 | Cortador | Defensor versátil para cambios | Movimiento y corte; elección propia no sustituida por el base. |
| EQ05-J08 | Interior abierto | Interior móvil | Interior abierto para ofrecer otra salida; defensa de contacto menor. |
| EQ05-J09 | Interior pasador | Ayudador del aro | Pase desde alto y lectura compartida; no aura de coordinación. |
| EQ05-J10 | Bloqueador y continuador | Defensor del poste | Continuación y pantalla; recursos con balón más limitados. |
| EQ05-J11 | Anotador al poste | Protector del aro | Poste de seguridad y defensa próxima; movilidad menor. |
| EQ05-J12 | Creador secundario | Ayudador perimetral | Recambio de continuidad; permite observar cambio real de calidad de dirección. |

<a id="src-md07-l1962"></a>

#### 25.3.7. EQ06 — Anotador dominante con lectura limitada

*Origen: MD07 §B.7.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ06-J01 | Organizador | Contenedor | Director de apoyo con lectura; amenaza anotadora discreta. |
| EQ06-J02 | Apoyo exterior | Presionador del balón | Control de recambio; menos capacidad para crear ventaja. |
| EQ06-J03 | Anotador | Marcador de una amenaza principal | Técnica anotadora y vocación altas; Visión/Decisiones menores e Iniciativa elevada. |
| EQ06-J04 | Tirador de recepción | Perseguidor de tiradores | Receptor preparado; no necesita asumir toda creación. |
| EQ06-J05 | Tirador en movimiento | Perseguidor | Receptor móvil que puede quedar infrautilizado según decisiones reales. |
| EQ06-J06 | Alero organizador | Ayudador de equipo | Organizador de ala que ofrece alternativa; volumen propio moderado. |
| EQ06-J07 | Cortador | Defensor versátil para cambios | Cortador que puede ofrecer ventaja no percibida. |
| EQ06-J08 | Interior abierto | Interior móvil | Apertura interior; calidad de recepción condicionada por pase real. |
| EQ06-J09 | Interior pasador | Ayudador del aro | Pasador interior capaz; utilización depende del plan. |
| EQ06-J10 | Bloqueador y continuador | Defensor del poste | Bloqueador que crea opciones; no corrige automáticamente malas lecturas. |
| EQ06-J11 | Anotador al poste | Protector del aro | Poste alternativo con límites físicos; no solución universal. |
| EQ06-J12 | Creador secundario | Ayudador perimetral | Creador secundario más prudente; menor técnica de tiro que la estrella. |

<a id="src-md07-l1979"></a>

#### 25.3.8. EQ07 — Veteranos técnicos y menos físicos

*Origen: MD07 §B.8.*

| Plaza | Rol ofensivo de referencia | Rol defensivo de referencia | Perfil y contraste funcional |
|---|---|---|---|
| EQ07-J01 | Organizador | Contenedor | Referencia de 40 años: comprensión, pase y decisiones altas; aceleración y velocidad menores. |
| EQ07-J02 | Apoyo exterior | Presionador del balón | Organizador alternativo estable; menor técnica y algo más de movilidad. |
| EQ07-J03 | Anotador | Marcador de una amenaza principal | Anotador técnico con físicas reducidas; capacidad de tiro preservada. |
| EQ07-J04 | Tirador de recepción | Perseguidor de tiradores | Tirador de recepción veterano; separación con bote limitada. |
| EQ07-J05 | Tirador en movimiento | Perseguidor | Técnica de preparación útil; menor velocidad de salida. |
| EQ07-J06 | Alero organizador | Ayudador de equipo | Lectura desde ala fuerte; llegada defensiva físicamente limitada. |
| EQ07-J07 | Cortador | Defensor versátil para cambios | Cortador con anticipación; explosividad menor. |
| EQ07-J08 | Interior abierto | Interior móvil | Interior abierto técnico; salto reducido y longitud conservada. |
| EQ07-J09 | Interior pasador | Ayudador del aro | Pasador interior experimentado; desplazamiento lento. |
| EQ07-J10 | Bloqueador y continuador | Defensor del poste | Bloqueador con fuerza y técnica; menor acceso vertical. |
| EQ07-J11 | Anotador al poste | Protector del aro | Poste técnico con alcance; no recupera al aro si no llega. |
| EQ07-J12 | Creador secundario | Ayudador perimetral | Recambio más móvil y menos técnico; permite comparar alternativas reales. |

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c24-modalidades-y-primer-laboratorio](../laboratorio/c24-modalidades-y-primer-laboratorio.md) · Siguiente: [c25-p02-eq08-jovenes-atleticos-y-menor-comprension](c25-p02-eq08-jovenes-atleticos-y-menor-comprension.md)
