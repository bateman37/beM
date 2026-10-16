# MOTOR-04 — Ataque posicional completo

**Proyecto:** beM.  
**Destinatario:** Claude Code, trabajando exclusivamente en `beM`.  
**Fecha:** 16 de octubre de 2026.  
**Estado:** prompt preparado para ejecutar; no acredita implementación ni pruebas.  
**Dependencias:** MOTOR-01/02 y panel/perfiles de MOTOR-03 disponibles. Dennis ha solicitado avanzar a MOTOR-04; comprueba en el repositorio el estado real de integración y conserva la base vigente.  
**Entrega:** una rama y una PR revisable, sin fusionarla.

## Índice

1. [Encargo y resultado](#1-encargo-y-resultado)
2. [Fuentes y autoridad](#2-fuentes-y-autoridad)
3. [Alcance y fronteras con las siguientes entregas](#3-alcance-y-fronteras-con-las-siguientes-entregas)
4. [Los siete estilos y media distancia](#4-los-siete-estilos-y-media-distancia)
5. [Las seis disposiciones y sus participantes](#5-las-seis-disposiciones-y-sus-participantes)
6. [Roles ofensivos y director](#6-roles-ofensivos-y-director)
7. [Libro, familias y llamadas](#7-libro-familias-y-llamadas)
8. [Quince fichas y nueve continuaciones](#8-quince-fichas-y-nueve-continuaciones)
9. [Resolución compartida y continuidad](#9-resolución-compartida-y-continuidad)
10. [Datos iniciales explícitos y perfil provisional](#10-datos-iniciales-explícitos-y-perfil-provisional)
11. [Interfaz, panel, registro y reproducción](#11-interfaz-panel-registro-y-reproducción)
12. [Comprobaciones acotadas y recorrido manual](#12-comprobaciones-acotadas-y-recorrido-manual)
13. [Ejecución, documentación y cierre](#13-ejecución-documentación-y-cierre)
14. [Anexo A: extensión numérica SEM](#14-anexo-a-extensión-numérica-sem)
15. [Anexo B: fichas funcionales de referencia](#15-anexo-b-fichas-funcionales-de-referencia)

## 1. Encargo y resultado

Implementa el ataque posicional completo del diseño aceptado sobre el motor común que ya juega partidos enteros. No entregues solo catálogos, selectores o un plan de trabajo.

Dennis debe poder preparar un equipo con siete estilos graduados, elegir entre seis disposiciones, asignar roles ofensivos y director, construir un libro con las quince fichas y prioridades compartidas 1–5, jugarlo en los tres modos y comprobar qué está ocurriendo en el partido y en el diagnóstico.

La disposición, el director, los roles y el libro deben cambiar opciones, participantes, lectura, ejecución, tiempo y consecuencias donde corresponda. No se aceptan bonus generales por nombre de sistema, ni jugadas que siempre producen el mismo finalizador o una canasta garantizada.

Construye sobre encuentros completos. Los casos pequeños sirven para comprobar reglas y ramas difíciles, no para convertir el trabajo en entregas dedicadas a simular un único bloqueo. El objetivo es un partido reconocible, con secuencias breves cuando bastan y continuaciones cuando ocurren.

Mantén el contrato fundamental: **acontecimientos relevantes dentro de posesiones, contexto pequeño y operaciones compartidas**. No simulación por segundos/milisegundos, trayectorias continuas, microdecisiones de diez jugadores ni un motor diferente para cada jugada.

## 2. Fuentes y autoridad

### 2.1. Lectura selectiva

Confirma `beM`, Git, normas y estado. Lee `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, los índices y el roadmap. Localiza las páginas vigentes correspondientes a estos capítulos originales del funcional unificado:

| Capítulo | Qué necesitas |
|---|---|
| 7 | Siete estilos, seis disposiciones, roles, libro y director. |
| 9 | Tareas compartidas, nueve continuaciones y contratos POS01–POS15. |
| 5 | Iniciativa, vocación de finalización y preferencia de zona; no son capacidades nuevas. |
| 11–13 | Contexto pequeño, selección, resolución, relojes y esfuerzo. |
| 15 | Órdenes, fronteras y vigencia durante el encuentro. |
| 26–27 | Panel, perfiles y grupos de datos que deben ampliarse. |
| 19 y 29 | Registro, versiones, estado SEM y límites de cobertura. |

Consulta lo pertinente de MOTOR-01/02/03 archivado cuando necesites sus contratos. Usa búsquedas e índices; no vuelques el funcional completo ni releas todos los originales o prompts.

El anexo B conserva el contenido funcional aprobado de las quince fichas. Sus ejemplos de entradas naturales no se convierten en prohibiciones arbitrarias para otras entradas compatibles. Si una decisión posterior aceptada en el repositorio modifica una definición, consérvala y documenta la correspondencia.

### 2.2. Límites de autonomía

- Trabaja solo en `beM`. No abras, clones ni inspecciones basket-manager, BeManager, ZenGM u otros repositorios.
- Conserva stack y arranque local. No impongas PostgreSQL, ORM, Docker, autenticación, otro framework o despliegue.
- ChatGPT no ha inspeccionado aquí el código fusionado: localiza contratos y reutiliza lo válido. Las rutas sugeridas son semánticas, no instrucciones para duplicar lo existente.
- Resuelve decisiones técnicas internas reversibles. No inventes mecánicas deportivas, atributos, nuevos tipos de tendencia o cifras de balance.
- Los valores nuevos propuestos por ChatGPT en este prompt son **SEM explícitas**, no calibración. Una versión posterior ya aceptada para el mismo campo prevalece con trazabilidad.
- Si falta una decisión funcional o una magnitud indispensable no resuelta por el perfil vigente, las referencias compartidas o los anexos, identifica `DECISIÓN REQUERIDA` con el dato exacto y su efecto. Avanza con lo independiente; no sustituyas el hueco por una constante oculta.

Si MOTOR-03 no está integrado, conserva lo que haya y explica la dependencia concreta; no construyas un panel paralelo para sortearla. No atribuyas a Dennis una prueba manual que no haya confirmado.

## 3. Alcance y fronteras con las siguientes entregas

### 3.1. Incluido

1. Los siete estilos ofensivos, cinco niveles por dimensión y la instrucción secundaria de media distancia.
2. DIS01–DIS06 con funciones, ocupación inicial, reorganización pertinente y participantes sustituibles.
3. Los quince roles ofensivos del catálogo, independientes de prohibiciones por posición nominal.
4. Director y alternativa; comprensión, lectura, elección y ejecución con sus propietarios reales.
5. Libro organizado por familias y variantes, prioridades 1–5 compartibles, elegibilidad y llamadas puntuales.
6. POS01–POS15 declarativas y CONT01–CONT09, con requisitos, alternativas y salidas reales.
7. Tareas compartidas necesarias para esas fichas, sin secuencias obligatorias de diecisiete tiradas.
8. Impacto funcional de rebote/balance y del estilo de transición sobre las oportunidades ya disponibles.
9. Controles de preparación y dirección en total/cuarto/tiempo, con fronteras de MOTOR-02.
10. Integración completa de los nuevos datos en el panel, perfiles, comparación y diagnóstico de MOTOR-03.

### 3.2. Qué no se amplía aquí

- **MOTOR-05:** zonas, otras coberturas, alturas de presión, especiales y roles defensivos completos. Trabaja frente a las respuestas defensivas ya implementadas, sin fabricarlas para que una ficha parezca distinta.
- **MOTOR-06:** catálogo completo de transición/ESP01–ESP20 y saques tácticos. Conserva las oportunidades espontáneas existentes. No obligues al equipo a preparar una ficha ante una opción inmediata válida.
- **MOTOR-07:** dinámica completa de Forma, momentos, Consistencia y Presión. Mantén su estado de cobertura, sin inventar una activación por usar más jugadas.
- **MOTOR-08:** memoria defensiva y adaptación estratégica completa. No añadas un castigo automático por cuarta repetición ni un antispam artificial. La repetición sigue condicionada por requisitos, oposición y contexto actuales; la memoria gradual llega después.
- **MOTOR-09–14:** cierre extraordinario reglamentario, estadísticas avanzadas, población completa, lotes y calibración final en sus entregas.

La lectura del rival usa información permitida; no su libro privado ni estados internos ocultos. Un mayor detalle diagnóstico del laboratorio no amplía el conocimiento del entrenador automático.

## 4. Los siete estilos y media distancia

### 4.1. Catálogo visible obligatorio

| Dimensión | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 |
|---|---|---|---|---|---|
| Ritmo del ataque organizado | Muy lento | Lento | Equilibrado | Rápido | Muy rápido |
| Transición | Muy conservadora | Conservadora | Equilibrado | Agresiva | Muy agresiva |
| Elaboración | Pocas acciones | Directo | Equilibrado | Elaborado | Muchas acciones |
| Prioridad de finalización | Interior | Preferencia interior | Equilibrado | Preferencia exterior | Exterior |
| Libertad | Muy rígido | Pautado | Equilibrado | Flexible | Mucha libertad |
| Riesgo ofensivo | Poco riesgo | Prudente | Equilibrado | Arriesgado | Mucho riesgo |
| Después del tiro | Balance total | Priorizar balance | Equilibrado | Priorizar rebote | Carga total |

Conserva IDs técnicos actuales si ya existen. No dupliques estilo porque cambie su etiqueta visible. No añadas otro deslizador de frecuencia de bloqueo, poste o mano a mano: esa preferencia pertenece al libro.

### 4.2. Efectos y costes separados

| Estilo | Punto de impacto | Límite y coste |
|---|---|---|
| Ritmo | Duración de organización/inicio. | No acelera libres, capacidades físicas ni todas las tareas. Puede dejar preparación/tiempo distintos según la acción real. |
| Transición | Propensión a intentar correr cuando el origen y ventaja representada lo permiten. | No crea robos ni superioridades; conserva las condiciones y riesgos del repertorio actual. |
| Elaboración | Preferencia por continuar, invertir o buscar otra opción frente a aceptar la disponible. | Continuar consume tiempo y exige ejecución; una canasta clara o urgencia puede imponerse. |
| Finalización | Preferencia entre opciones interiores y exteriores realmente disponibles. | No cuotas ni prohibiciones; una entrada al poste puede acabar en triple tras ayuda. |
| Libertad | Mezcla plan/autonomía dentro de opciones elegibles. | Iniciativa no equivale a buena lectura ni añade acierto. |
| Riesgo | Preferencia por opciones con riesgo estimado diferente. | La exposición y dificultad de la opción elegida producen el coste, sin otra penalización universal duplicada. |
| Después del tiro | Encargos de carga al rebote y balance. | Acceso real, más participantes frente a peor protección del retorno; no bonus de captura gratuito. |

Ritmo y elaboración son ejes diferentes: se puede circular rápido con varias acciones o preparar lento una primera opción sencilla. Transición agresiva y ataque organizado pausado pueden convivir.

### 4.3. Media distancia

Opciones: **Evitar**, **Aceptar si está liberada**, **Buscar con jugadores adecuados**. Se aplican a opciones de media distancia, no a todos los tiros de dos.

Son instrucciones de selección. No modifican directamente la nota de tiro ni su probabilidad de conversión una vez fijada la ejecución. Conserva salidas viables por urgencia de reloj: «evitar» no genera pases infinitos ni una violación voluntaria cuando queda una única opción.

Las semillas del anexo A cubren los campos que no estén ya definidos. No copies a la vez el mismo efecto en selección, preparación y acierto.

## 5. Las seis disposiciones y sus participantes

### 5.1. Funciones de entrada

| ID | Nombre | Cinco referencias funcionales iniciales |
|---|---|---|
| DIS01 | 5 abiertos | Director y cuatro referencias exteriores, sin ocupación interior fija obligatoria. |
| DIS02 | 4 abiertos y 1 interior | Director, tres referencias exteriores y una interior. |
| DIS03 | 3 abiertos y 2 interiores | Director, dos referencias exteriores y dos funciones interiores compatibles, alta/baja cuando proceda. |
| DIS04 | Horns | Director arriba, dos apoyos altos en codos y dos referencias exteriores de esquina. |
| DIS05 | 1–4 alto | Director arriba y cuatro referencias de entrada alta: apoyos y salidas laterales compatibles. |
| DIS06 | 1–4 bajo | Director arriba y cuatro referencias bajas que permiten salidas, cortes y espacio superior. |

Estas referencias son funciones y sectores conocidos, no coordenadas ni diez celdas que deban recalcularse en cada instante. Mantén el detalle realmente representado: si solo se conoce lateral, no sorteas izquierda/derecha después para completar un gráfico.

### 5.2. La disposición no congela ni da talento

Un jugador puede cortar desde 5-out; un apoyo de Horns puede abrir, bloquear o recibir; una entrada baja puede salir hacia arriba. Actualiza las relaciones afectadas por una interacción, conservando las demás.

Un no tirador colocado fuera sigue siendo no tirador. Puede ser útil bloqueando, cortando o pasando. Un interior abierto necesita sus capacidades para amenazar o ejecutar; el rol no se las regala.

Dos interiores pueden crear una relación alto-bajo y también congestionar otra vía. No concedas al mismo tiempo todas las ventajas de dos interiores y una amplitud exterior perfecta.

No añadas un multiplicador general de «5-out contra individual» o «Horns +X %». Las diferencias deben venir de funciones, receptores posibles, líneas, ocupación, oposición y capacidades pertinentes.

### 5.3. Asignación y compatibilidad por requisitos

Asigna funciones sobre los cinco jugadores disponibles, con director y roles, usando el ajuste de capacidad pertinente ya existente y los sesgos de rol declarados. No prohíbas por PG/SG/SF/PF/C nominal: son recomendaciones, no fronteras deportivas absolutas.

Una función no puede estar ocupada simultáneamente por dos identidades incompatibles ni un jugador actuar como pasador y receptor del mismo envío. Una misma persona puede encadenar tareas en momentos diferentes, como pasar y cortar o bloquear y abrir.

Cada ficha declara requisitos funcionales. Las disposiciones citadas en el funcional son entradas naturales. Otras pueden iniciar tras una reorganización compatible que consuma su tiempo real. No fabriques una matriz binaria basada únicamente en nombres.

Si no hay configuración realizable, informa qué función falta. Una habilidad baja dificulta la ejecución; no introduce un umbral de elegibilidad nuevo. Conserva salida segura/reorganización cuando existe, y urgencia o consecuencia reglamentaria cuando no existe.

Cambiar de disposición durante el partido entra en la próxima entrada/reorganización compatible. No recoloca cinco jugadores gratuitamente en mitad de una ventaja.

## 6. Roles ofensivos y director

### 6.1. Catálogo cerrado

| Rol | Preferencia de utilización |
|---|---|
| Organizador | Dirigir, distribuir y preparar. |
| Creador con balón | Crear ventajas con manejo, pantalla y amenaza propia. |
| Anotador | Asumir finalizaciones con balón. |
| Apoyo exterior | Compartir dirección y ofrecer apoyo sin balón. |
| Tirador de recepción | Ofrecer salida y tirar tras recibir. |
| Tirador en movimiento | Buscar salidas tras cortes, entregas o indirectos. |
| Penetrador | Atacar defensor, carril o recuperación. |
| Creador secundario | Dirigir una continuación y resolver la siguiente ventaja. |
| Finalizador exterior | Aprovechar oportunidades exteriores creadas. |
| Cortador | Atacar espacios y espalda del defensor. |
| Alero organizador | Asumir dirección desde la función de alero. |
| Interior abierto | Ofrecer amenaza exterior y apertura tras pantalla. |
| Bloqueador y continuador | Pantalla y recepción hacia aro. |
| Anotador al poste | Posición, recepción y creación desde poste. |
| Interior pasador | Recibir alto/interior para distribuir y activar compañeros. |

Los roles compartidos entre posiciones son la misma definición. Conserva IDs ya aprobados; si falta un ID técnico, asígnalo estable sin cambiar el significado ni inventar otro rol.

El rol orienta candidatos y protagonismo. No incrementa habilidades, preparación o acierto por su etiqueta. Un rol puede realizar una tarea secundaria necesaria: interior pasador también bloquea; anotador también pasa.

### 6.2. Director y propietarios de las decisiones

Mantén director principal y alternativa, con sustitución funcional cuando los designados no estén en cancha conforme al contrato vigente. El poseedor actual no es siempre el director inicial.

- **Iniciativa:** tendencia a utilizar la libertad permitida.
- **MEN01 Comprensión:** preparación e interpretación de las funciones.
- **MEN02 Visión:** reconocer oportunidades y respuestas.
- **MEN03 Decisiones:** elegir entre lo reconocido según riesgo, tiempo y plan.
- **Pase/Manejo/técnicas:** ejecutar la decisión con los atributos del actor real.

Conserva la mezcla y las recetas efectivas aceptadas de MOTOR-01/03. El receptor corto de POS04 o el interior de POS12 hace su lectura con sus propias capacidades. No le prestes la Visión del base ni la calidad de Pase del compañero.

Iniciativa alta con mala lectura puede conducir a elecciones peores; iniciativa baja no vuelve imposible resolver una emergencia. No representes una mala elección bajando artificialmente la habilidad técnica de pase.

El director no concede un aura de acierto al quinteto. Cambiarlo puede modificar organización y selección futuras, pero los demás ejecutan sus tareas reales. No añadas experiencia/edad como otra capacidad o multiplicador.

## 7. Libro, familias y llamadas

### 7.1. Familias y prioridades

Las seis familias son: bloqueo directo; mano a mano; bloqueo indirecto; pase y corte; poste; aclarado. Las quince fichas son variantes declaradas de ellas.

Cada ficha activa en el plan recibe prioridad 1–5 y varias pueden compartirla. Usa la semilla vigente 8/5/3/2/1 o su versión aceptada posterior. Es preferencia, no cuota, turno de uso ni calidad.

Filtra primero elegibilidad. Calcula masa familiar por mejor prioridad elegible y elige variante dentro de familia. Duplicar nombre o variante no aumenta la masa familiar ni reinicia una identidad deportiva.

Las opciones autónomas y oportunidades inmediatas continúan fuera de una ficha nominal cuando corresponde. No conviertas cualquier bote y tiro en POS14 ni toda descarga en una nueva familia. La procedencia se registra como llamada, libro/autonomía o recurso directo según lo ocurrido.

### 7.2. Ficha editable y comprensible

En el libro muestra nombre, familia, requisitos, entradas naturales, funciones, primera intención, alternativas, salidas, prioridad y compatibilidad con el quinteto.

No hay un límite deportivo inventado de fichas activas. Permite activar/desactivar fichas mediante el plan, sin borrar su definición global. Un libro sin ficha elegible debe dar una salida conocida viable o un error de preparación si falta una obligación; no forzar el primer ID del catálogo.

### 7.3. Llamadas y cambios durante el encuentro

Extiende el contrato de MOTOR-02 a las quince fichas, roles, estilos y disposiciones. Conserva solicitud, espera, vigencia, consumo y caducidad.

Una llamada se consume al inicio efectivo, no al evaluarla. Si la defensa niega el inicio o faltan funciones, puede esperar dentro de su ámbito y caducar. Si ya inició y deriva a otra salida, se conserva ese inicio.

Prioridades nuevas afectan la próxima selección; no cancelan una ficha comprometida. El cambio de rol afecta la siguiente asignación/elección pertinente y no cambia capacidades permanentes. El plan del siguiente periodo no reescribe el anterior.

## 8. Quince fichas y nueve continuaciones

### 8.1. Repertorio obligatorio

| ID | Ficha | Familia | Diferencia funcional que debe existir |
|---|---|---|---|
| POS01 | Bloqueo directo central con continuación | Bloqueo directo | Separación central y recepción/amenaza de llegada. |
| POS02 | Bloqueo directo lateral con continuación | Bloqueo directo | Relación lateral, apoyos y vías de ayuda/salida pertinentes. |
| POS03 | Bloqueo directo central con apertura | Bloqueo directo | Bloqueador abre; recepción exterior o distribución real. |
| POS04 | Bloqueo directo lateral con recepción corta | Bloqueo directo | Receptor intermedio toma su propia decisión. |
| POS05 | Mano a mano desde cabecera | Mano a mano | Entrega alta, recepción, devolución o conservación. |
| POS06 | Mano a mano desde ala | Mano a mano | Entrega lateral y apoyos propios de esa relación. |
| POS07 | Indirecto descendente para recepción | Bloqueo indirecto | Pantalla y salida del receptor, con corte ante negación. |
| POS08 | Indirecto hacia el exterior | Bloqueo indirecto | Separación exterior o alternativa ante su negación. |
| POS09 | Pase y corte | Pase y corte | Pase, corte y decisión de devolución; también puede fijar sin recibir. |
| POS10 | Puerta atrás ante negación | Pase y corte | Requiere negación pertinente y una vía de corte real. |
| POS11 | Poste bajo | Poste | Ganar recepción y crear; salida ante ayuda. |
| POS12 | Recepción alta para distribuir | Poste | Decisión desde recepción alta y activación de otro compañero. |
| POS13 | Alto-bajo | Poste | Dos referencias interiores, enlace y defensa del receptor bajo. |
| POS14 | Aclarado desde cabecera | Aclarado | Inicio deliberado de espacio para creación superior. |
| POS15 | Aclarado lateral | Aclarado | Duelo desde lado, vías y límites de esa relación. |

Cada ficha utiliza los requisitos, alternativas y registros del anexo B. No basta heredar una ficha cambiando nombre e ID. Sí reutiliza sus operaciones y parámetros compartidos cuando representan la misma tarea.

### 8.2. Continuaciones

| ID | Continuación | Requisito distintivo |
|---|---|---|
| CONT01 | Continuación al aro | Participante, llegada y recepción hacia aro viables. |
| CONT02 | Apertura exterior | Apoyo que abre y línea de envío compatible. |
| CONT03 | Recepción corta con lectura | Ventana intermedia; receptor decide tras recibir. |
| CONT04 | Penetración y descarga | División y responsabilidad defensiva comprometida. |
| CONT05 | Pase adicional o inversión | Otra referencia disponible y tiempo. |
| CONT06 | Corte ante ayuda o negación | Espacio y responsabilidad desplazada pertinentes. |
| CONT07 | Rechazo de primera opción | Vía alternativa conocida, permitida y real. |
| CONT08 | Salida segura | Receptor/protección realmente disponibles. |
| CONT09 | Reorganización | Control y tiempo suficientes; consume tiempo sin borrar contexto gratis. |

No actives las nueve en todas las fichas. No exijas que se ejecute una continuación por aparecer escrita. La lectura puede aceptar una opción inmediata; la defensa puede negar incluso la salida segura.

### 8.3. Requisitos y contenido declarativo

Cada ficha declara: ID/familia, intención, roles funcionales, entradas naturales, requisitos tipados, tareas/recetas compartidas, opciones/continuaciones permitidas, seguridad, referencias temporales y registro de inicio/cierre.

Las condiciones usan campos admitidos del contexto. POS10 no inventa una negación para volverse elegible. POS13 no usa dos funciones interiores ocupadas simultáneamente por el mismo jugador. POS03 puede abrir con un mal tirador, pero no lo convierte en un buen ejecutor.

Una recepción puede ser útil, difícil o negada según la resolución. Una ficha puede terminar en tiro, pérdida, falta/contacto, desvío, conservación o reloj agotado. No garantices un tiro final por haber seleccionado una ficha.

## 9. Resolución compartida y continuidad

### 9.1. Reutiliza tareas; no construyas quince motores

Utiliza las tareas TAR01–TAR17 del catálogo cuando sean pertinentes: preparación, separación, desmarque, pantalla, posición, protección, pase/recepción, intervención, ayuda/recuperación, contacto, preparación del tiro, oposición, tapón, tiro, libre, rebote y balón dividido.

Son funciones del cálculo. No son diecisiete fases temporales ni diecisiete sorteos por posesión. Preparación, lectura y ejecución pueden resolverse conjuntamente cuando no haya un hecho intermedio que necesite estado propio.

Reutiliza las recetas actuales por tarea. Si una composición nueva necesita otro actor, vincula su rol real a la misma receta; no copies el atributo de otro jugador para rellenar una referencia.

Si mantienes recetas agregadas por familia de MOTOR-01, las fichas nuevas reutilizan las equivalentes por función con participantes remapeados. No dupliques después otra tirada de la misma pantalla/pase por haber añadido su TAR al registro. Una causa se cobra una vez.

### 9.2. Oposición real y cinco jugadores útiles

La creación usa capacidades del creador; el pase, las del emisor; desmarque/recepción, las del receptor; pantalla, las del bloqueador; oposición, la del defensor que puede intervenir. El defensor inicial no reaparece automáticamente después de una ayuda.

Los jugadores sin balón abren, fijan, cortan, aseguran pase, cierran o balancean cuando eso cambia la situación. No necesitan una tirada cada uno ni una nueva estadística oficial por cumplir un encargo.

Amenaza y capacidad técnica pueden intervenir en causas distintas, como opción ofrecida y tiro finalmente resuelto. No sumes dos veces una misma prima de tiro. Las elecciones de la política defensiva usan la información permitida; la resolución puede utilizar las capacidades reales de los participantes pertinentes, sin filtrarlas a ese decisor.

No utilices una reputación mágica por etiqueta de rol/equipo para decidir respeto defensivo. Si el conocimiento rival disponible es una referencia neutral, conserva esa limitación, sin inventar un sistema de scouting dentro de esta entrega.

### 9.3. Sectores y relaciones pequeños

El contexto ordinario debe explicarse en una ficha breve: balón/actor, sector conocido, oposición, intervención adicional pertinente, receptor o ventaja y continuidad. No agregues un árbol de todas las opciones posibles ni estados psicológicos por relación.

Una puerta atrás actualiza cortador, responsable y ayuda pertinente. Una apertura actualiza al bloqueador/receptor y la recuperación. Una inversión puede cambiar la oposición disponible. No se recalculan los diez jugadores sin motivo.

Conserva ventajas y responsabilidades hasta que una interacción pertinente las modifique. No las borres por cambiar de frase o ficha, ni las mantengas eternamente por falta de actualización.

### 9.4. Tiempo y exposición

Entrada, continuación y reorganización usan duraciones de sus operaciones compartidas. No sumes la duración agregada completa de MOTOR-01 y además la de todas las tareas que esa duración ya incluía.

Si mantienes una resolución compuesta, sus tareas rutinarias se incluyen en su intervalo. Una continuación que añade una recepción/decisión real usa su intervalo adicional. Registra qué duración cubre cada hecho para evitar doble cómputo.

Elaborar más puede consumir más tiempo y exposición real. No repitas una probabilidad completa de pérdida por cada pase rutinario de una descripción más larga. Si una operación sostiene exposición, usa su unidad declarada y un único riesgo por esa dosis.

El reloj limita las opciones; no hay un número fijo obligatorio de acciones. No introduzcas «máximo tres pases» ni un corte que regale un tiro al llegar al límite técnico. Una prevención de bucle debe detectar falta de progreso y registrar error/coherencia, no crear un resultado deportivo arbitrario.

Con poco reloj solo entran acciones viables. Si una acción aún no producida queda más allá de la bocina, se administra el límite; no se recorta siempre para conceder el tiro final.

### 9.5. Rebote y balance con coste real

Asigna encargos al tiro según estilo, rol, acceso y ubicación funcional. El conjunto que puede disputar el rebote se deriva de esos encargos y del acceso; no de añadir un bonus al tirador por «carga total».

Los que se quedan para cargar no están simultáneamente como primeras referencias de balance. Tras recuperación rival, esa relación afecta la organización/ventaja de su transición actualmente implementada. No exige calcular carreras de regreso ni abrir el catálogo completo de MOTOR-06.

Conserva recetas actuales de cierre y captura. Si una semilla antigua contiene un modificador abstracto de carga y ahora los participantes ya producen ese efecto, retíralo de esa ruta explícitamente en la nueva versión; no cobres ambos como la misma ventaja.

## 10. Datos iniciales explícitos y perfil provisional

### 10.1. Qué conservar

Parte de la configuración efectiva aceptada tras MOTOR-03, con herencia y versiones. Conserva las referencias de tiro, resultados, tareas, contacto, energía y reglamento que no cambian por el repertorio nuevo.

El anexo A aporta una extensión **SEM-MOTOR04-20261016**, preparada por ChatGPT para campos nuevos. No afirma frecuencias reales ni realismo calibrado. Usa un dato posterior aceptado si ya existe para la misma responsabilidad y registra su procedencia.

No crees quince bases independientes de acierto, pérdidas o duración. Las fichas referencian los mecanismos comunes. Una variante lateral no recibe por su nombre otra probabilidad general de tiro.

### 10.2. Reutilización explícita de recetas para fichas nuevas

| Ficha nueva | Base común disponible | Cambio funcional obligatorio |
|---|---|---|
| POS02 | Pantalla/separación y receta familiar de POS01 | Sector lateral, apoyos y salida del lado pertinente. |
| POS03 | Pantalla/separación de POS01 y pase/recepción compartido | Bloqueador abre, CONT02; decisión posterior real. |
| POS04 | Pantalla de POS01 y recepción/pase compartidos | Recepción corta CONT03; lectura y pase del receptor actual. |
| POS06 | Entrega/desmarque de POS05 | Entrada lateral y referencias de ese lado. |
| POS08 | Pantalla/desmarque de POS07 | Salida exterior, corte/rechazo e inversión compatibles. |
| POS10 | Desmarque/corte y pase de POS09 | Negación previa pertinente y oportunidad de puerta atrás. |
| POS12 | Recepción/posición de POS11 y pase compartido | Referencia alta; creación posterior por lectura/pase del interior. |
| POS13 | Posición/recepción de POS11 y pase compartido | Dos interiores; emisor alto y receptor bajo distintos. |
| POS15 | Separación/creación de POS14 | Relación lateral y vías de ayuda/salida realmente disponibles. |

La tabla indica reutilización de tareas, no copiar íntegramente todas las distribuciones zonales del donante. En POS03, por ejemplo, solo existen tiro del manejador, recepción del abierto u otras opciones que la interacción ofrece; el bloqueador no recibe una continuación interior ficticia por conservar pesos de POS01.

Si el motor mantiene pesos zonales históricos como preferencias, aplícalos solo a finalizaciones elegibles y a su actor real. La zona no se sortea primero para inventar después la acción que la justifique. Apertura, recepción corta o puerta atrás deben ocurrir antes de atribuirles una finalización.

### 10.3. Semillas funcionales de roles y asignaciones

El anexo A define un único sesgo moderado para funciones favorecidas por rol. El resto conserva peso 1; nunca se vuelve inelegible por rol. Usa el sesgo una vez al seleccionar participante/tarea, no como bonus de ejecución.

El ajuste de capacidades existente sigue diferenciando quién es competente. Iniciativa, vocación y preferencias individuales conservan sus dominios actuales y no se recalculan por el rol. No apliques dos veces el mismo término de vocación si ya participó en el peso del candidato finalizador.

Las seis disposiciones se cargan como contenido funcional. No necesitan un coeficiente de victoria propio. Compatibilidad y alternativa se expresan en requisitos, con tiempo de reorganización del perfil existente cuando haga falta.

### 10.4. Planes listos para jugar sin alterar decisiones de Dennis

Amplía el catálogo disponible de los dos equipos actuales; no actives automáticamente todas las fichas nuevas en planes guardados.

Conserva planes existentes y crea una copia de demostración identificada para probar el repertorio completo: misma plantilla, DIS02, valores actuales de los siete estilos y las quince fichas a prioridad 3. Es un escenario de cobertura, no una recomendación de mejor táctica.

Si falta una asignación de rol en un fixture, utiliza el rol ya declarado por el funcional/fixture original. Si ese dato realmente falta, aplica esta precarga explícita solo a esa entrada: PG Organizador, SG Tirador de recepción, SF Cortador, PF Interior abierto y C Bloqueador y continuador, según su función actual de quinteto. Déjala SEM y editable; no cambies el rol de un jugador ya configurado por Dennis.

Las referencias de slots son asignaciones del quinteto, no prohibiciones por posición nominal. Un sustituto conserva o recibe su función táctica declarada, sin modificar su personalidad.

## 11. Interfaz, panel, registro y reproducción

### 11.1. Preparación y dirección

Mantén las fichas de jugador, edición +1/+3/+5, dos equipos, doce jugadores, semillas y tres modos existentes.

En preparación ofrece siete estilos agrupados, media distancia, seis disposiciones, roles por jugador, director/alternativa y libro por familia. Permite leer la ficha antes de activarla. Muestra incompatibilidad con causa funcional, sin presentar capacidades bajas como errores de posición.

Durante el partido, utiliza los paneles y ciclo de órdenes de MOTOR-02. El usuario ve plan vigente, borrador y pendientes. Un cambio puede esperar entrada/reorganización o la siguiente elección. No sobrescribas una acción comprometida ni el plan de un cuarto terminado.

La pantalla principal sigue contenida: marcador/reloj, participantes, energía/faltas, plan resumido, pendientes relevantes y relato real. El detalle técnico queda ampliable. No requiere una cancha 2D ni diagramas de movimiento.

### 11.2. Mismo panel de MOTOR-03

Registra filas activas nuevas y sus consumidores, unidades, límites, fuente SEM, herencia y validaciones en los grupos pertinentes: SEL01–SEL12 donde corresponda, RES por tarea, ACT por tiempo/carga y CON01–CON02. Amplía POB03 solo para las tendencias ya existentes que se usen; no crees otra personalidad.

Los datos de defensa usados por operaciones actuales se conservan en sus grupos. No marques DEF completo. La ampliación de órdenes enlaza ENT07 sin declarar completado el entrenador estratégico.

Las referencias de las fichas al perfil común y sus alternativas deben poder inspeccionarse. Publicación, congelación, importación/exportación, comparación y restauración continúan sobre el mismo sistema. Un parámetro de balance nuevo no queda escondido en un `switch` por ID.

### 11.3. Registro real

Conserva partido, posesión, acontecimiento, ficha/origen y vínculos de continuidad. Para decisiones diagnosticadas registra lo realmente calculado:

- Fichas/familias elegibles, prioridades y motivo de exclusión pertinente.
- Disposición de entrada y funciones/participantes efectivos.
- Director o lector actual, procedencia de decisión e influencia plan/autonomía.
- Tarea compartida, actores y oposición real; filas de perfil utilizadas.
- Primera opción, negación, recepción y continuación cuando ocurrieron.
- Preparación/calidad antes del desenlace, sin reclasificarla por acierto.
- Duración/exposición efectiva y encargos de rebote/balance relevantes.
- Solicitud y comienzo efectivo de llamada, consumo/caducidad y cierre.

El relato no inventa una pantalla, pase o ayuda para explicar un tiro sorteado de otra forma. No atribuyas asistencia, crédito de pantalla o utilidad sin balón que no fue resuelta. La estadística avanzada conserva su entrega prevista.

### 11.4. Reproducción y compatibilidad

La exportación de partido incluye versión de contenido y configuración efectiva nueva. La reproducción vuelve a calcular el mismo encuentro con sus órdenes y datos, sin consultar el perfil activo actual.

La ampliación puede cambiar resultados frente a la versión anterior porque cambia el contenido operativo. Identifica esa versión; no prometas equivalencia entre motores distintos. Dentro de la misma versión, mismas entradas/semilla/órdenes producen los mismos hechos sin depender de velocidad o renderizado.

Los perfiles antiguos que no cubran las nuevas filas se conservan identificados como anteriores. Para usarlos con el nuevo repertorio, crea una candidata explícita con la extensión y valida. No introduzcas una migración silenciosa que cambie su identidad histórica.

## 12. Comprobaciones acotadas y recorrido manual

### 12.1. Automatización necesaria

Reutiliza las herramientas y checks del repositorio. No crees pruebas por cada setter, suites E2E masivas, cientos de partidos o una exigencia de cobertura porcentual.

Comprueba con pocos casos deterministas o parametrizados:

1. Catálogo completo 7 estilos/6 disposiciones/15 fichas/9 continuaciones/15 roles y referencias válidas; no significa ejecutar un partido por combinación.
2. Elegibilidad antes de preferencia, prioridad compartida, masa familiar e invariancia ante duplicación de nombres.
3. Asignaciones sin participantes incompatibles; baja técnica no invalida una función; sustitución y lector posterior conservan propietarios de atributos.
4. POS03 abre; POS04 decide con receptor; POS10 exige negación; POS13 exige dos funciones distintas. Casos pequeños de contenido, no una campaña de encuentros por ficha.
5. Efecto causal determinista de nuevos estilos en pesos/encargos, sin alterar conversión del mismo tiro por rol/libertad/tendencia.
6. Continuidad: ayuda/ventaja conservada, reorganización con coste, reloj limitado y sin cobro doble de tiempo/riesgo.
7. Rebote/balance: candidato con acceso, encargo incompatible protegido y sin bonus abstracto duplicado.
8. Filas del panel llegan a consumidores; exportación/reproducción mantienen contenido y órdenes de la versión.

No fuerces que la prioridad 1 gane siempre, que una disposición sea mejor universalmente o que +5 garantice más puntos en una semilla.

### 12.2. Partidos completos de cierre

Usa los dos equipos existentes y semilla de referencia del laboratorio:

- Un encuentro base con el plan conservado.
- Dos variantes de entrada/plan para recorrer funciones altas/interiores y bajas/exteriores: Horns y 1–4 bajo, con libros compatibles. No necesitas probar todos los estilos simultáneamente en cada variante.
- Una repetición del base mediante otro modo de avance/reproducción, con idénticas órdenes deportivas, para comprobar equivalencia de la versión.

Referencia: **cuatro ejecuciones completas**, reutilizando esas salidas para conciliación y diagnóstico. DIS01, DIS03 y DIS05 se cubren en validación/fixtures de asignación y recorrido manual; no exigen otros partidos automáticos completos. Usa contextos controlados para las ramas raras; no simules hasta que salgan por azar.

Comprueba acta, relojes, minutos, quintetos, energía, referencias y cierre sin resultados artificiales. No impongas un marcador objetivo ni declare calibrado el nuevo perfil.

### 12.3. Plan manual para Dennis

Deja esta lista en una página breve enlazada desde la entrega, con comandos y URL reales del proyecto:

| Prueba | Qué revisar |
|---|---|
| Estilos | Siete controles y media distancia legibles; nivel 3 Equilibrado; efectos explicados sin promesas de victoria. |
| Ritmo/elaboración | Pueden combinarse independientemente; el número de pases no es una cuota. |
| Disposiciones | Seleccionar las seis y revisar funciones, requisitos y salidas; no cambia talento por colocar fuera. |
| Horns y 1–4 | Son entradas del selector general; no se mezclan con saques box/stack/diamond. |
| Roles | Cambiar rol ofensivo y observar asignación/protagonismo; atributos intactos. |
| Director | Cambiarlo y revisar quién organiza y quién lee tras una recepción. |
| Libro | Ver quince fichas agrupadas, activar/desactivar y compartir prioridad 1. |
| Llamadas | Pedir ficha y revisar inicio/negación/consumo/caducidad reales. |
| Apertura/corta | POS03 y POS04 producen opciones distintas; el receptor corto no hereda la lectura del base. |
| Indirecto/corte | Puede haber salida negada y corte útil sin recepción inventada. |
| Poste/alto-bajo | POS11/POS12/POS13 usan posiciones y actores distintos; no garantizan recepción profunda. |
| Aclarado/directo | POS14/POS15 exigen intención organizada; un tiro espontáneo no se etiqueta automáticamente como ficha. |
| Rebote/balance | Cambian encargos y acceso, con coste visible en la organización del retorno. |
| Dirección en vivo | Cambios esperan frontera válida; no alteran jugadas anteriores. |
| Panel | Nuevas filas SEM localizables, editables cuando corresponde y con consumidor real. |
| Comparación | Base/candidata conserva entradas, muestra y límites; no activa un ajuste automáticamente. |
| Exportación | Descarga y reproduce encuentro con nuevas fichas bajo la misma versión. |
| Regresión | Total/cuarto/tiempo, pausas, sustituciones, tiempos muertos y edición de jugadores siguen utilizables. |

Si no puedes recorrer una interfaz real en tu entorno, indica qué quedó pendiente. No registres que Dennis probó MOTOR-04 hasta que lo confirme.

## 13. Ejecución, documentación y cierre

### 13.1. Secuencia de trabajo

1. Confirma estado de dependencias y contratos actuales. Crea `feature/MOTOR-04-ataque-posicional`, o rama equivalente según las normas.
2. Archiva este prompt íntegro, incluidos anexos, en `docs/prompts/MOTOR-04-ataque-posicional.md` o equivalente aprobado y registra su estado real.
3. Carga repertorio declarativo y referencias a tareas compartidas; crea candidata de perfil con las extensiones SEM necesarias.
4. Conecta disposiciones/roles/asignación, estilos y selección al mismo núcleo de partidos completos.
5. Completa las quince fichas y nueve continuaciones por operaciones reutilizadas, manteniendo reloj, actores y oposición.
6. Integra controles y órdenes en preparación, cuartos y visionado; conserva modo total delegado.
7. Amplía panel, validación, trazas, comparación y exportación/reproducción.
8. Ejecuta comprobaciones acotadas, recorrido UI posible y corrige los fallos del objetivo.
9. Actualiza páginas temáticas, índices, mapa técnico, cobertura, decisiones de implementación, estado, changelog y catálogo de prompts.
10. Entrega commits coherentes y PR sin fusionar. Si no puedes abrirla, deja rama/commits e informa del impedimento.

Conserva el funcional íntegro de consulta y originales históricos. No sustituyas las normas por un nuevo mega archivo. Registra diferencias entre contenido funcional aprobado, semillas provisionales y evidencia de ejecución.

### 13.2. Tamaño y continuidad

Referencia: hasta aproximadamente el 50 % de la ventana de cinco horas de Claude Code, sin garantizar consumo. Si el indicador permite medirlo, registra inicio/final y condiciones. No atribuyas a esta entrega consumo mezclado con otra sesión.

No añadas trabajo para gastar cuota ni pares una modificación a medias por el contador. Si la sesión limita el cierre, deja checkpoint con rama/commit, estado ejecutable, comprobaciones reales, bloqueo y siguiente paso. No declares completo un catálogo cuyos nombres no tienen ejecución ni empieces MOTOR-05 por tu cuenta.

### 13.3. Criterios de aceptación

- [ ] MOTOR-01/02/03 siguen utilizables sobre un solo motor.
- [ ] Siete estilos y media distancia tienen efecto pertinente, con costes y sin cuotas ni bonus de acierto duplicados.
- [ ] DIS01–DIS06 representan funciones reales, ocupación y reorganización compatibles.
- [ ] Quince roles orientan participación sin modificar talento ni prohibir por posición nominal.
- [ ] Director, Iniciativa y capacidades mentales/técnicas mantienen funciones y propietarios distintos.
- [ ] Libro por familia/variante, prioridades compartidas y llamadas respetan elegibilidad y fronteras.
- [ ] POS01–POS15 y CONT01–CONT09 pueden ejecutarse, negarse o continuar cuando corresponde; no son alias decorativos.
- [ ] Tareas reutilizadas, contexto pequeño, tiempo/riesgo/esfuerzo una vez por causa; sin ticks físicos ni una secuencia universal de sorteos.
- [ ] Rebote/balance cambia encargos y consecuencias, sin acceso imposible ni prima duplicada.
- [ ] Nuevos parámetros y contenido están en el panel y los perfiles, con filas, unidades y validaciones trazables.
- [ ] Registro explica los hechos reales; reproducción y equivalencia de modos válidas dentro de la versión.
- [ ] SEM y cobertura diferida identificadas; no afirma defensa, memoria, estados, estadísticas o calibración completos.
- [ ] Checks acotados y plan manual entregados con estado real.
- [ ] Prompt íntegro, documentación e índices actualizados; PR revisable sin fusionar.

Respuesta final: qué puede probar Dennis, comando/URL reales, semilla/perfil de referencia, comprobaciones, rutas del plan manual y prompt, PR o rama/commits y limitaciones concretas. No sustituyas el resultado por número de tests o líneas de código.

## 14. Anexo A: extensión numérica SEM

### 14.1. Identidad y precedencia

Los valores siguientes son propuestas explícitas de ChatGPT para completar este incremento sin delegar cifras deportivas en Claude. **No son frecuencias observadas ni calibración.** Se aplican solo si el campo equivalente no tiene una versión posterior aceptada. Conserva la base efectiva de MOTOR-03 mediante herencia resuelta e identidad nueva.

```json
{
  "id": "SEM-MOTOR04-20261016",
  "status": "SEM: provisional, no calibrado",
  "scope": "Ampliación de ataque posicional y estilos sobre el perfil efectivo aceptado de MOTOR-03",
  "newStyleSeeds": {
    "transitionAttemptOddsRatio": [0.5, 0.75, 1, 1.35, 1.75],
    "elaborationContinuationWeightFactor": [0.55, 0.75, 1, 1.3, 1.65],
    "offensiveRiskPreferenceTilt": [-2, -1, 0, 1, 2],
    "offensiveReboundAssignmentTarget": [1, 1, 2, 3, 4]
  },
  "midrangePolicy": {
    "avoidWeight": 0.3,
    "openOnlyComfortableWeight": 1,
    "openOnlyOtherWeight": 0.4,
    "suitablePlayerBase": 0.65,
    "suitablePlayerAbilitySlope": 0.7
  },
  "rolePreference": {
    "favoredFunctionWeight": 1.25,
    "otherFunctionWeight": 1,
    "application": "once_in_participant_selection_not_in_execution"
  },
  "newVariantPreference": {
    "eligibleVariantBaseWeight": 1,
    "unknownRoleFunctionWeight": 1,
    "application": "only_where_no_existing_variant_preference_is_declared"
  },
  "reboundBalance": {
    "assignmentPolicy": "rank_by_existing_access_and_rebound_fit_without_nominal_position_ban",
    "preserveNeutralBaselineAssignmentsWhenCompatible": true,
    "abstractLoadLogitWhenAssignmentAlreadyAccountsForLoad": 0,
    "unreadyReturnerOpportunityOddsRatio": 1.2
  },
  "previewPlan": {
    "initialDisposition": "DIS02",
    "allPlayPriorities": 3,
    "changeSavedPlansAutomatically": false
  }
}
```

### 14.2. Interpretación exacta de los campos

**Transición.** Aplica el factor a los *odds* de la probabilidad de intentar transición del contexto existente: `p' = f*p / (1-p+f*p)`. Para p=0 o p=1 conserva el extremo. No multipliques la calidad ni la probabilidad de tiro. No se usa si no existe oportunidad compatible. Mantén riesgos y repertorio actual; no incrementes aparte las oportunidades de robo/rebote.

**Elaboración.** Multiplica por el factor los pesos de continuaciones realmente elegibles frente a la aceptación de finalización, antes de normalizar opciones. Conserva la valoración y restricciones existentes. No multipliques otra vez por el mismo factor una probabilidad derivada de esos pesos. Una continuación real usa el tiempo/exposición que le corresponde; el nivel no suma segundos por sí mismo.

**Riesgo.** Para cada opción elegible con riesgo estimado `r` entre 0 y 1, pondera su preferencia por `exp(tilt*r)`. Usa la estimación permitida de riesgo que ya produce el mecanismo; el nivel 3 conserva factor 1. No inventes un riesgo por nombre de ficha ni una nueva tirada global. Su probabilidad de pérdida/contacto deriva de la ejecución de la opción elegida. Si las opciones tienen igual riesgo, el estilo no tiene por qué diferenciarlas en ese contexto.

**Media distancia.** Evitar aplica 0,3 al peso de una opción de media. Aceptar liberada aplica 1 si la calidad previa es cómoda y 0,4 en los demás casos. Buscar adecuados aplica `0.65 + 0.7*a(TEC02 del ejecutor)`, con `a(x)=(x-1)/29`, sin umbral que prohíba un tiro. Se normaliza con otras opciones reales. No se aplica al acierto ni elimina la única opción legal por poco reloj.

**Roles.** Peso 1,25 para una función favorecida en la tabla siguiente y 1 para el resto. Se combina una sola vez con el ajuste de capacidades vigente al elegir participante. No se acumula por encajar en varios sinónimos del mismo rol.

| Rol | Funciones favorecidas |
|---|---|
| Organizador | Director, pasador, apoyo de seguridad. |
| Creador con balón | Manejador/creador con balón. |
| Anotador | Manejador y finalizador con balón. |
| Apoyo exterior | Apoyo de pase exterior, seguridad y dirección alternativa. |
| Tirador de recepción | Receptor para tiro exterior de recepción. |
| Tirador en movimiento | Receptor de indirecto/entrega o corte para tirar. |
| Penetrador | Manejador de penetración y ataque a recuperación. |
| Creador secundario | Receptor que decide, pasador y dirección alternativa. |
| Finalizador exterior | Receptor/finalizador exterior. |
| Cortador | Cortador y receptor hacia aro. |
| Alero organizador | Director, pasador y receptor que decide. |
| Interior abierto | Bloqueador que abre y apoyo exterior. |
| Bloqueador y continuador | Bloqueador y receptor de continuación. |
| Anotador al poste | Receptor/creador de poste. |
| Interior pasador | Receptor alto/corto y pasador desde esa recepción. |

**Variantes.** El peso 1 es neutral para una variante nueva donde falta otra preferencia explícita. Se combina con prioridad/requisitos bajo la masa familiar vigente. No hace que cuatro variantes de bloqueo cuadripliquen la familia.

**Rebote/balance.** La cifra por nivel es un objetivo de encargos, no participantes garantizados ni cuota de rebotes. Selecciona entre funciones con acceso mediante las recetas actuales; en neutral conserva los candidatos históricos cuando son compatibles. El tirador cercano que ya se incorpora por acceso no se añade dos veces ni queda físicamente lejos para el retorno por un mero contador.

Niveles 1 y 2 comparten un objetivo de un cargador, pero difieren en el comportamiento permitido del apoyo: en nivel 1 permanece en balance salvo necesidad de disputa ya comprometida; en nivel 2 puede acompañar cuando la interacción ya lo sitúa con acceso, conservando una referencia de seguridad. No se exige simular distancias nuevas para diferenciarlos.

En nivel 3 se conservan las relaciones neutrales del perfil inicial. Tras control defensivo rival, compara las funciones de retorno listas con esa base neutral: por cada referencia de retorno que falte por un compromiso de carga adicional, aplica una vez factor 1,2 a los *odds* de la oportunidad de ventaja de transición ya modelada. Una referencia adicional de balance usa su inverso. Cuenta solo diferencias funcionales realmente representadas, no toda la plantilla. No se aplica a la conversión del tiro ni añade otra penalización si el mismo déficit ya figura en la operación de transición. El contador está acotado por los cinco participantes, sin nuevos estados continuos.

**Reutilización de referencias de tareas.** Las operaciones nuevas usan las referencias, sensibilidad, límites, duraciones y recetas compartidas ya cargadas para esa tarea. Si hay que exponer como operación binaria una relación de acceso/desmarque que el núcleo no resuelve todavía, utiliza provisionalmente referencia 0,5 y sensibilidad de ventaja vigente del perfil, con la fórmula logística común y oposición elegible real. Este valor expresa una referencia matemática de tarea simétrica, **no 50 % de canasta ni una cuota de recepción**. No añadas esa binaria si la relación ya estaba resuelta por una operación compuesta.

Para una tarea sin oposición elegible no inventes un defensor de nota cero; conserva la política vigente de omitir ese término. Si la tarea requiere una referencia distinta no cubierta por esta reutilización, identifica ese campo en vez de inventarla.

### 14.3. Cambios respecto a entregas anteriores

- Amplía el subconjunto de tres estilos editables a siete y media distancia.
- Amplía DIS02 a seis disposiciones y seis fichas iniciales a quince, con nueve continuaciones completas.
- Sustituye, en la nueva ruta de encargos de rebote, el efecto abstracto duplicado de carga si existía por sus participantes y acceso. Conserva la versión histórica de ese perfil; no reescribe partidos anteriores.
- Mantiene referencias de ejecución, reglamento, energía y contratos válidos no afectados por la ampliación.
- No cierra defensa, repertorio espontáneo completo, momentos, memoria, entrenador avanzado ni perfil final de los 81 grupos.

## 15. Anexo B: fichas funcionales de referencia

Extracto del capítulo 9.7 del funcional unificado, procedente de MD07 §19. Se conserva para que el contenido operativo no dependa de inventar alternativas durante programación. Los enlaces históricos pueden localizarse por los encabezados equivalentes del índice vigente.

*Procedencia: MD07, §19.*

### 15.1. Contrato común de las fichas POS

*Origen: MD07 §19.1.*

Los identificadores POS01–POS15 fijan el contenido inicial. Cada ficha admite prioridad 1–5 del plan y participantes sustituibles por función. La prioridad no forma parte de su calidad intrínseca.

Las disposiciones indicadas son entradas naturales. La compatibilidad efectiva se decide por las funciones necesarias y la reorganización realmente disponible; una lista de ejemplos no debe convertirse en una matriz arbitraria de victorias entre disposiciones.

Una llamada se consume al inicio efectivo. Evaluar la ficha o pedirla no cuenta como inicio. Tras comenzar, una negación puede derivar a otra opción o seguridad. El registro distingue esas situaciones de una llamada que nunca llegó a iniciar.

Las fichas permiten finalización, contacto, pérdida, desvío o continuación según los hechos pertinentes. Ninguna concede un tiro garantizado. Los pesos, duraciones y costes se consultan en sus grupos comunes; no se copian dentro de cada ficha.

### 15.2. POS01 — Bloqueo directo central con continuación

*Origen: MD07 §19.2.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo directo; director superior, bloqueador disponible y apoyos que no ocupen de forma incompatible la continuación. Entradas naturales DIS01, DIS02 y DIS04. |
| Participantes | Manejador, bloqueador, posibles receptores y defensores que intervienen. |
| Intención | Crear separación central y amenaza del continuador hacia aro. |
| Requisitos | Balón controlado, posibilidad de iniciar pantalla y referencia de recepción o avance. La técnica baja dificulta ejecución; no invalida por sí sola la existencia de la función. |
| Lecturas | Espacio del manejador, oposición al continuador, ayuda comprometida y receptor que deja de estar protegido. |
| Opciones | Tiro/penetración del manejador; CONT01 hacia aro; CONT03 si se dispone de recepción corta; CONT04/CONT05 ante ayuda. |
| Seguridad | CONT08 o CONT09 si existen control y tiempo; CONT07 si se reconoce otra vía compatible. |
| Registro | Inicio de familia, cobertura ejecutada, responsables actuales, receptor, continuidad y oportunidad final. |

El cambio defensivo conserva el emparejamiento resultante. Una contención que concede tiro no garantiza que el manejador lo acepte o convierta. La defensa puede recuperar si resuelve una interacción pertinente.

### 15.3. POS02 — Bloqueo directo lateral con continuación

*Origen: MD07 §19.3.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo directo desde referencia lateral; amplitud y apoyo de salida compatibles. |
| Participantes | Manejador lateral, bloqueador, referencia de seguridad y receptores pertinentes. |
| Intención | Atacar la relación lateral y generar continuación o ayuda desde ese lado. |
| Requisitos | Línea funcional de inicio y espacio no ocupado de forma incompatible. El lado se representa por sector, sin trayectoria continua. |
| Lecturas | Orientación de la contención, espacio de avance, continuador y defensa que puede comprometer ayuda. |
| Opciones | Ataque del manejador; CONT01; CONT03 cuando existe recepción intermedia; CONT04 hacia receptor liberado. |
| Seguridad | Rechazo compatible CONT07, salida CONT08 o inversión/reorganización con tiempo. |
| Registro | Lado conocido, cobertura, ayudante real, responsabilidad abandonada y origen de la oportunidad. |

La diferencia respecto a POS01 reside en las relaciones y apoyos disponibles. No recibe otra probabilidad general de tiro simplemente por llamarse lateral.

### 15.4. POS03 — Bloqueo directo central con apertura

*Origen: MD07 §19.4.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo directo central con función de apertura exterior del bloqueador. DIS01, DIS02 o entrada alta compatible. |
| Participantes | Manejador, bloqueador que abre y apoyos. |
| Intención | Combinar ataque del balón y recepción exterior tras la pantalla. |
| Requisitos | Referencia exterior disponible para abrir y línea de envío pertinente. La amenaza depende de las capacidades reales. |
| Lecturas | Compromiso sobre manejador, defensor que recupera y ayuda que puede negar la apertura. |
| Opciones | Ataque propio; CONT02 al abierto; ataque a recuperación o CONT05 desde su recepción. |
| Seguridad | Conservar y distribuir si la defensa no concede ventaja; CONT09 cuando es viable. |
| Registro | Apertura ofrecida, recepción intentada/obtenida, oposición y decisión posterior. |

Que el bloqueador abra no convierte a un no tirador en amenaza competente. Puede recibir y distribuir; el motor debe permitir que la defensa lo respete menos si su información deportiva lo justifica.

### 15.5. POS04 — Bloqueo directo lateral con recepción corta

*Origen: MD07 §19.5.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo lateral con salida intermedia para recibir y decidir. |
| Participantes | Manejador, receptor corto y referencias de aro/exterior compatibles. |
| Intención | Utilizar el compromiso defensivo sobre balón para crear una decisión intermedia. |
| Requisitos | Ventana de recepción y funciones que permitan otra opción después. La lectura del receptor se evalúa al recibir. |
| Lecturas | Si hay espacio para avanzar o tirar, ayuda interior y receptor exterior liberado. |
| Opciones | CONT03; desde ella finalización, pase a aro, CONT04 o CONT05. El manejador conserva opción propia si se la conceden. |
| Seguridad | No forzar el envío si la línea no está disponible; CONT08/CONT09 compatibles. |
| Registro | Compromiso de dos defensores cuando existe, pase, recepción y decisión del receptor corto. |

La calidad del director inicial no sustituye Visión, Decisiones o Pase del receptor que toma la siguiente decisión. No se representa automáticamente una superioridad perfecta después del envío.

### 15.6. POS05 — Mano a mano desde cabecera

*Origen: MD07 §19.6.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Mano a mano; poseedor alto y exterior que puede acercarse a una entrega. |
| Participantes | Poseedor, receptor y apoyos compatibles. |
| Intención | Crear recepción con continuidad de tiro o ataque desde la relación de entrega. |
| Requisitos | Control, proximidad funcional representada y entrega posible. No hace falta una trayectoria de encuentro calculada por segundos. |
| Lecturas | Seguimiento, negación de la entrega, cambio y apoyo menos protegido. |
| Opciones | Recibir y tirar; atacar con balón; devolver; conservar el poseedor si la defensa anticipa; CONT04/CONT05. |
| Seguridad | Mantener control con el poseedor o salida CONT08. |
| Registro | Entrega intentada/negada, conservación, receptor y preparación del tiro si aparece. |

La conservación por el poseedor es una alternativa del contenido ya previsto, no otra familia. La principal del tiro y la preparación se deciden por el gesto final.

### 15.7. POS06 — Mano a mano desde ala

*Origen: MD07 §19.7.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Mano a mano desde referencia lateral con apoyos de ese lado y salida alternativa. |
| Participantes | Poseedor lateral, receptor y ayuda de seguridad. |
| Intención | Crear una recepción o avance desde ala que comprometa seguimiento y ayudas pertinentes. |
| Requisitos | Entrega realizable y ocupación compatible del espacio de avance. |
| Lecturas | Persecución, cambio, negación y recuperación defensiva posterior. |
| Opciones | Tiro tras recepción; penetración; devolución o conservación; CONT04/CONT05. |
| Seguridad | Pase a referencia disponible o reorganización, sin regalar una salida si está negada. |
| Registro | Sector lateral, intervención defensiva y continuidad real. |

La variante reutiliza entrega, desmarque y control. El contexto lateral puede cambiar qué receptores se ofrecen; no añade un multiplicador independiente de eficacia.

### 15.8. POS07 — Indirecto descendente para recepción

*Origen: MD07 §19.8.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo indirecto descendente que ofrece salida de receptor. |
| Participantes | Pasador, bloqueador, receptor y apoyos. |
| Intención | Obtener recepción preparada del jugador liberado. |
| Requisitos | Funciones de pantalla, salida y envío compatibles. El pasador debe tener una línea real. |
| Lecturas | Seguimiento por pantalla, negación, cambio y alternativa del cortador. |
| Opciones | Recepción para tiro o avance; CONT06 ante negación; salida del bloqueador si el contexto la ofrece. |
| Seguridad | Mantener balón en pasador y utilizar otra referencia disponible. |
| Registro | Pantalla útil o negada, desmarque, recepción, preparación y responsabilidad final. |

La utilidad del bloqueador puede registrarse aunque otro dé la asistencia. No se conceden dos asistencias oficiales ni una canasta por haber elegido un tirador en movimiento.

### 15.9. POS08 — Indirecto hacia el exterior

*Origen: MD07 §19.9.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo indirecto que busca separación y recepción exterior. |
| Participantes | Pasador, bloqueador, receptor exterior y referencias restantes. |
| Intención | Separar seguimiento y ofrecer envío a una referencia de tiro. |
| Requisitos | Espacio exterior compatible y línea de pase posible. |
| Lecturas | Persecución, cambio, negación exterior y corte disponible. |
| Opciones | Tiro tras recepción; atacar recuperación; CONT06 si niegan la salida; CONT05 para otra ventaja. |
| Seguridad | Conservar o invertir si la salida no existe. |
| Registro | Opción ofrecida, recepción obtenida/negada, preparación y oposición real. |

La calidad de la oportunidad se decide antes del acierto. Un tiro convertido no vuelve exitosa retrospectivamente una pantalla que no produjo separación.

### 15.10. POS09 — Pase y corte

*Origen: MD07 §19.10.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Pase a apoyo y corte del emisor hacia espacio disponible. |
| Participantes | Emisor/cortador, receptor que decide y referencias de seguridad. |
| Intención | Crear devolución o desplazar responsabilidad mediante el corte. |
| Requisitos | Pase inicial y corte compatibles con ocupación y reloj. |
| Lecturas | Seguimiento del cortador, ayuda interior y opciones que abre su movimiento. |
| Opciones | Devolución para finalizar; CONT05 al liberado; mantener ataque si el corte solo fija. |
| Seguridad | No forzar devolución; conservar con receptor y continuar. |
| Registro | Pase inicial, corte útil, envío posterior y resultado, distinguiendo fijación de recepción. |

No todo corte útil recibe balón. El análisis puede registrar utilidad resuelta sin inventar una recepción ni un pase que no se produjo.

### 15.11. POS10 — Puerta atrás ante negación

*Origen: MD07 §19.11.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Pase y corte; alternativa a una recepción negada. |
| Participantes | Pasador, receptor negado que corta y apoyos. |
| Intención | Aprovechar la responsabilidad adelantada del defensor. |
| Requisitos | Negación pertinente y espacio de corte/enlace posible. No se activa contra cualquier defensa por nombre. |
| Lecturas | Acceso al corte, ayuda interior y seguridad del envío. |
| Opciones | Recepción hacia aro; pase a otra referencia si la ayuda responde; continuidad si la línea se cierra. |
| Seguridad | Conservar sin envío forzado y reorganizar cuando proceda. |
| Registro | Negación observada, corte, ventana, intento de pase y respuesta real. |

La negación puede crear riesgo de puerta atrás, pero no garantiza que pasador y cortador lo perciban ni que completen el envío.

### 15.12. POS11 — Poste bajo

*Origen: MD07 §19.12.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Juego al poste con referencia baja y apoyos de pase/salida. |
| Participantes | Receptor de poste, pasador, posibles cortadores y tiradores. |
| Intención | Ganar recepción y crear finalización o ventaja ante ayuda. |
| Requisitos | Posición/recepción posible; ocupación compatible y tiempo de creación. |
| Lecturas | Defensa de recepción, oposición actual, doble/ayuda y compañero liberado. |
| Opciones | Recurso de poste; tiro según gesto; CONT04/CONT05 al liberado; CONT06 de compañero. |
| Seguridad | Devolver, invertir o reorganizar sin asumir recepción profunda automática. |
| Registro | Recepción solicitada y obtenida, creación de poste, ayuda y principal de tiro real. |

TEC11 crea la opción. TEC03, TEC04 o la técnica exterior correspondiente resuelve el tiro. La existencia de un desajuste ayuda solo en sus tareas pertinentes y puede provocar respuesta defensiva.

### 15.13. POS12 — Recepción alta para distribuir

*Origen: MD07 §19.13.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Juego al poste con receptor alto que organiza desde recepción. |
| Participantes | Receptor alto, pasador de entrada y referencias de corte/tiro. |
| Intención | Crear otra opción desde una recepción que concentra atención defensiva. |
| Requisitos | Recepción alta y funciones de salida compatibles. |
| Lecturas | Cortes, receptor liberado, oposición propia y posibilidad de conservar. |
| Opciones | Pase al corte; CONT05 exterior; tiro viable del receptor; entrega o continuidad conocida compatible. |
| Seguridad | Devolución al apoyo y CONT09 si no aparece ventaja. |
| Registro | Entrada, opciones representadas, decisión del receptor y resultado del envío/tiro. |

Interior pasador es un rol de uso. No regala Visión ni Pase. Un jugador competente puede ordenar la continuidad sin que todas sus intervenciones activen momento colectivo.

### 15.14. POS13 — Alto-bajo

*Origen: MD07 §19.14.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Juego al poste con dos referencias interiores compatibles, una alta y otra baja. |
| Participantes | Receptor alto, referencia baja, pasador de entrada y salidas exteriores. |
| Intención | Utilizar relación entre interiores para obtener recepción favorable o desplazar ayuda. |
| Requisitos | Dos funciones interiores realizables y línea de enlace que la defensa puede negar. DIS03 y entradas equivalentes son naturales. |
| Lecturas | Sello/negación de la referencia baja, ayuda y salida exterior. |
| Opciones | Pase alto-bajo; tiro del receptor alto; CONT05; corte o continuación si la ayuda desplaza responsabilidades. |
| Seguridad | Devolver o reorganizar conservando el contexto. |
| Registro | Posiciones funcionales, recepción alta, intento al bajo y oposición final. |

Dos interiores también pueden congestionar opciones. La ficha no concede simultáneamente todo el beneficio interior y amplitud perfecta del exterior.

### 15.15. POS14 — Aclarado desde cabecera

*Origen: MD07 §19.15.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Aclarado con atacante superior y apoyos que permiten su intención. |
| Participantes | Atacante principal, defensor actual y receptores de salida. |
| Intención | Crear desde el duelo y aprovechar la respuesta de ayudas. |
| Requisitos | Control del atacante y organización compatible para iniciar esa intención. |
| Lecturas | Separación, vía de penetración, tiro, ayuda y compañero liberado. |
| Opciones | Tiro tras creación; penetración; CONT04/CONT05; conservación. |
| Seguridad | Salida disponible o continuidad cuando el duelo no ofrece ventaja. |
| Registro | Inicio deliberado, oposición, creación y salida. |

Una acción directa sin ficha no se etiqueta automáticamente como POS14. Esta ficha exige que la intención organizada de aclarado haya comenzado realmente.

### 15.16. POS15 — Aclarado lateral

*Origen: MD07 §19.16.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Aclarado desde ala o referencia lateral. |
| Participantes | Atacante lateral, defensor actual y apoyos compatibles. |
| Intención | Atacar desde esa relación lateral y sus vías reales. |
| Requisitos | Espacio y salida compatibles con ocupación y reloj. |
| Lecturas | Dirección de contención, ayuda de fondo/interior, tiro y pase de salida. |
| Opciones | Penetración, suspensión, CONT04/CONT05 o CONT07. |
| Seguridad | Devolver o reorganizar si existe tiempo. |
| Registro | Sector conocido, duelo, ayuda y resolución pertinente. |

La línea lateral puede limitar alternativas en el contexto representado. No se simulan coordenadas para expresar esa limitación ni se atribuye ventaja universal a esta variante.

### 15.17. Terminación de la colección POS

*Origen: MD07 §19.17.*

La colección contiene cuatro fichas de bloqueo directo, dos de mano a mano, dos de indirecto, dos de pase y corte, tres de poste y dos de aclarado. Total: 15.

Antes de cargarla como contenido utilizable deben estar resueltas referencias de tareas, participantes, compatibilidad, continuaciones y perfiles de tiempo/riesgo. La descripción funcional anterior no sustituye esa validación de datos.
