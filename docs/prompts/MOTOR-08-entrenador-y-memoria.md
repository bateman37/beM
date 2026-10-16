# MOTOR-08 — Entrenador automático y memoria rival

> Prompt de implementación para Claude Code. Ejecutar en el repositorio **beM**. Dennis adjuntará este MD o copiará íntegramente su contenido. No es un nuevo diseño funcional del motor: concreta la entrega MOTOR-08 del roadmap y explicita sus semillas provisionales.
>
> Objetivo: que un partido completo pueda delegarse a un entrenador que toma decisiones comprensibles, y que la defensa aprenda de patrones recientes sin imponer resultados. El partido sigue resolviéndose por acontecimientos deportivos y posesiones, sin simular posiciones ni movimientos cada milisegundo.

## Índice

1. [Mandato y reglas de trabajo](#1-mandato-y-reglas-de-trabajo)
2. [Base, documentación y precedencia](#2-base-documentación-y-precedencia)
3. [Alcance y cierre de la entrega](#3-alcance-y-cierre-de-la-entrega)
4. [Contrato de información y decisión](#4-contrato-de-información-y-decisión)
5. [Delegación y ejecución de órdenes](#5-delegación-y-ejecución-de-órdenes)
6. [Rotaciones y continuidad](#6-rotaciones-y-continuidad)
7. [Librillo de faltas](#7-librillo-de-faltas)
8. [Tiempos muertos y ajustes](#8-tiempos-muertos-y-ajustes)
9. [Finales de partido](#9-finales-de-partido)
10. [Políticas de referencia y semillas](#10-políticas-de-referencia-y-semillas)
11. [Memoria colectiva pequeña](#11-memoria-colectiva-pequeña)
12. [Salvedades recibidas de MOTOR-07](#12-salvedades-recibidas-de-motor-07)
13. [Tablas administrables y perfiles](#13-tablas-administrables-y-perfiles)
14. [Interfaz y trazabilidad](#14-interfaz-y-trazabilidad)
15. [Compatibilidad y exportación](#15-compatibilidad-y-exportación)
16. [Pruebas automáticas y recorrido manual](#16-pruebas-automáticas-y-recorrido-manual)
17. [Documentación, entrega y límites](#17-documentación-entrega-y-límites)
18. [Lista de aceptación](#18-lista-de-aceptación)

## 1. Mandato y reglas de trabajo

Implementa MOTOR-08 de principio a fin sobre la arquitectura existente. Esta entrega incorpora entrenador automático, rotaciones contextuales, gestión de faltas y tiempos muertos, decisiones de final y memoria defensiva colectiva. Conserva los tres modos de partido y todas las capacidades ya implementadas.

Reglas obligatorias:

- Trabaja exclusivamente en beM y en su documentación. No inspecciones Basket Manager, ZenGM ni otros repositorios. Las referencias necesarias ya están en el funcional y en estos prompts.
- No sustituyas el motor por un simulador espacial. No introduzcas coordenadas, trayectorias, ticks, movimiento continuo, aprendizaje automático ni un optimizador que pruebe el futuro.
- Las decisiones cambian participantes, encargos, llamadas, preferencias o recursos disponibles. Sus consecuencias se resuelven mediante las operaciones deportivas existentes. No hay bonificaciones de acierto por haber elegido un entrenador o haber reconocido una jugada.
- No añadas atributos de entrenador, liderazgo oculto, un atributo 33, ni un overall universal.
- Los números de esta entrega son **SEM**, semillas provisionales administrables. No ajustes probabilidades para reproducir un resultado concreto o hacer que una política gane.
- Conserva la separación entre energía, Forma, momentos individuales, momento del equipo y memoria. No uses una de estas magnitudes como sustituto de las demás.
- Haz las pruebas automáticas imprescindibles. Dennis hará una parte importante del test manual. No construyas un laboratorio nuevo de cientos de partidos para cerrar esta entrega.
- No incorpores cambios de framework, infraestructura, base de datos o despliegue que este trabajo no necesite.
- Conserva cambios locales ajenos y decisiones documentadas. No hagas reinicios destructivos, no reescribas historial y no fusiones la PR.

El objetivo orientativo de tamaño es una entrega que pueda ocupar aproximadamente la mitad de una ventana de cinco horas de Claude Code. No puedes garantizar ni medir desde aquí ese consumo. No añadas alcance para gastar cuota. Si surge un límite real, deja un punto de continuación preciso y distingue lo terminado de lo pendiente; no declares completado un mecanismo solo porque tenga una tabla o pantalla.

## 2. Base, documentación y precedencia

### 2.1 Comprobar MOTOR-07 antes de editar

El último informe de Claude dice que MOTOR-07 está en la PR `bateman37/beM#8`, abierta contra `main`. Dennis no ha confirmado en este mensaje su fusión. **No presupongas que main contiene MOTOR-07.**

1. Lee las instrucciones del repositorio y comprueba rama, estado de trabajo y presencia real de los cambios de MOTOR-07.
2. Si `main` ya contiene MOTOR-07, crea la rama de MOTOR-08 desde esa base actualizada.
3. Si MOTOR-07 continúa sin fusionar y su rama está disponible, crea una rama de trabajo desde su commit real y documenta la dependencia. No fusiones MOTOR-07 por tu cuenta. Abre una PR dependiente contra su rama cuando sea necesario para que el diff muestre solo MOTOR-08; deja indicado el cambio de base posterior.
4. Si no puedes acceder a una base que contenga MOTOR-07, detén únicamente la implementación dependiente e informa de la dependencia concreta. No reimplementes MOTOR-07 a partir del informe ni continúes desde MOTOR-06 fingiendo que la base está completa.

Nombre propuesto: `feature/MOTOR-08-entrenador-y-memoria`. Respeta el mecanismo de ramas impuesto por el entorno si utiliza otro nombre y explica cuál ha sido la rama efectiva.

### 2.2 Lectura dirigida

Consulta, en este orden, los índices y documentos vigentes del repositorio:

- Normas raíz, instrucciones de trabajo y estado actual.
- Roadmap de entregas, apartado MOTOR-08 y fronteras MOTOR-09 en adelante.
- Funcional seccionado: dirección y entrenador, rotaciones, faltas, tiempos muertos, finales, memoria, ventanas, información visible, estados y auditoría.
- Inventario de tablas ENT, MEM y respuestas defensivas vinculadas.
- Documento funcional íntegro únicamente para contrastar una regla cuando el índice o el documento temático no baste.
- `docs/tecnico/motor07.md`, las interpretaciones I-D1 a I-D6, `stateTasks`, `episodeCatalog`, y salvedades heredadas de MOTOR-06.
- Código y datos que materializan esas reglas, incluyendo el recorrido manual de MOTOR-07.

No releas todos los documentos históricos por defecto. Los índices sirven para localizar decisiones sin consumir contexto innecesariamente.

### 2.3 Qué prevalece

Conserva las decisiones finales del funcional unificado. Este prompt concreta implementación, datos iniciales y cierre de salvedades, y debe archivarse como tal. Distingue:

- Regla funcional ya cerrada.
- Concreción de implementación de MOTOR-08.
- SEM modificable pendiente de calibración.
- Decisión nueva expresamente indicada en el apartado 12.

Si encuentras una contradicción material no resuelta aquí, identifica ambas reglas con sus referencias. No la tapes con una interpretación silenciosa. Las diferencias de nombres o estructura interna se resuelven mediante un mapa de equivalencias; no obligan a duplicar tablas.

## 3. Alcance y cierre de la entrega

Esta entrega debe permitir:

1. Simular un encuentro completo con ambos banquillos dirigidos automáticamente.
2. Delegar por áreas durante el visionado o el modo por cuartos y conservar la prioridad de las órdenes manuales.
3. Mantener un jugador con energía 30 cuando su utilidad contextual supera la de su recambio, y retirarlo cuando la comparación justifica hacerlo.
4. Aplicar un librillo de faltas con excepciones deportivas, sin inmunidades ni exclusiones inventadas.
5. Pedir tiempos muertos legales con intención identificada, consumo correcto y efectos ya existentes de pausa aplicados una sola vez.
6. Ajustar con estabilidad y actuar en finales mediante decisiones del motor común.
7. Reconocer unos pocos patrones ofensivos recientes y responder de forma compatible, sin penalización automática por repetición.
8. Explicar qué se observó, qué se decidió, por qué y cuándo se ejecutó.

No incluye el cierre exhaustivo del reglamento y acta de MOTOR-09, calibración poblacional, desarrollo de carrera, lesiones de temporada, scouting persistente, un nuevo catálogo estadístico completo ni reconstrucción de todos los exports históricos. Las correcciones reglamentarias puntuales del apartado 12 sí forman parte del saneamiento de la base utilizada.

## 4. Contrato de información y decisión

### 4.1 Una vista permitida para el entrenador

Construye o reutiliza una vista acotada del partido para decidir. No pases el estado interno completo al selector de decisiones por comodidad.

Puede consultar:

- Marcador, período, relojes, posesión, hechos públicos, faltas, elegibilidad, recursos reglamentarios y quintetos visibles.
- Su plan, encargos, capacidades conocidas de su plantilla, minutos y energía propios.
- Forma y momentos propios con el grado de precisión permitido en la vista ordinaria. Cuando esa vista solo ofrezca categorías, la decisión utiliza categorías, no el valor diagnóstico oculto.
- Acciones y oportunidades deportivas reconocibles ya observadas, con categorías visibles de dificultad y oposición.
- Memoria colectiva de su equipo y alternativas compatibles con su propia plantilla.

No puede consultar:

- Próximos números aleatorios, resultados futuros o posesiones simuladas de prueba.
- Probabilidad interna exacta de acierto rival, energía rival exacta, Forma rival, momentos rivales o atributos ocultos.
- El libro rival privado, una instrucción rival todavía no ejecutada o el motivo interno de una decisión rival.

La memoria puede recordar que el rival obtuvo tres continuaciones cómodas. No puede recordar que su probabilidad interna era 0,73. Una categoría observable debe proceder de un hecho deportivo reconocible; no basta con renombrar un número oculto.

### 4.2 Separar evaluar, proponer, ordenar y ejecutar

Cada decisión debe distinguir:

1. Hecho o frontera que provoca la revisión.
2. Información permitida examinada.
3. Regla declarativa que encaja y alternativas descartadas relevantes.
4. Propuesta de acción.
5. Autorización por delegación, prioridad y recursos.
6. Aplicación en una ventana válida o conservación como pendiente.
7. Resultado observado después, sin presentarlo como consecuencia causal demostrada.

Una solicitud no equivale a una acción ejecutada. No gastes un tiempo muerto al proponerlo, no cambies el quinteto antes de la sustitución legal y no alteres un encargo durante una acción que ya se está resolviendo.

### 4.3 Cuándo revisar

Revisa en fronteras deportivas ya existentes: inicio de período, final de una posesión relevante, incidencia de falta o indisponibilidad, ventana de sustitución o pausa, y entrada en un tramo final definido.

No revises cada segundo. Para evitar duplicados, una misma frontera y versión de contexto no producen varias decisiones equivalentes. Un hecho importante puede invalidar una propuesta pendiente, pero no crear una cola de órdenes antiguas que se ejecuten después sin volver a validar su pertinencia.

## 5. Delegación y ejecución de órdenes

Expón cinco áreas independientes:

| Área | Incluye |
|---|---|
| Rotaciones | Proponer sustituciones y mantener funciones del quinteto. |
| Ajustes tácticos | Cambios permitidos de encargos, estilos, coberturas y llamadas. |
| Gestión de faltas | Aplicar preferencias de protección y riesgo dentro de acciones legales. |
| Tiempos muertos | Solicitar una pausa por las causas definidas. |
| Finales | Aplicar prioridades contextuales de cierre usando recursos disponibles. |

Si el repositorio ya tiene una delegación equivalente, amplíala sin crear un segundo sistema. La falta táctica sigue siendo una orden puntual: delegar finales o faltas no equivale a que siempre deba producirse.

Prioridad común:

1. Administración reglamentaria obligatoria y elegibilidad.
2. Orden manual válida en su ámbito y duración declarados.
3. Plan y restricciones explícitas de Dennis.
4. Decisión automática autorizada.
5. Comportamiento ordinario existente cuando no hay orden aplicable.

Para una orden manual conserva la duración ya pactada por el producto. Si falta ese dato, la UI debe permitir distinguir «una ejecución», «hasta final de cuarto» y «hasta cambiarla» según el tipo de orden. No apliques esas tres duraciones a órdenes cuyo reglamento o naturaleza solo permita una ejecución. No sobrescribas una orden manual con un ajuste automático en la siguiente posesión.

En simulado total se puede delegar todo sin mostrar una pantalla por decisión. En cuartos, Dennis puede revisar entre períodos; dentro del cuarto se aplica su delegación. En visionado funcionan las mismas reglas, independientemente de x2, x4, x8 o x16. Velocidad y modo no cambian decisiones ni resultado a igualdad de entradas y semilla.

Los cambios de director, roles o disposición respetan la frontera de entrada o reorganización ya implementada. Una sustitución efectiva invalida propuestas que referían al jugador saliente y obliga a comprobar participantes de las fichas posteriores.

## 6. Rotaciones y continuidad

### 6.1 Plan de minutos y funciones

Utiliza el plan de participación existente: quinteto inicial, preferencias de relevo, funciones, director y alternativas, objetivos de minutos y preferencias de cierre cuando estén definidos.

Los objetivos de minutos son orientación, no un contrato que fuerce un cambio perjudicial. No todos los doce jugadores tienen que jugar. No generes minutos retrospectivos ni repartas automáticamente 200 minutos de manera uniforme. Las prórrogas añaden su tiempo real, sin cambiar a posteriori el plan de tiempo reglamentario.

Si las plantillas iniciales no tienen un plan completo, carga un plan SEM explícito y revisable a partir de sus funciones y relevos ya declarados. En ese caso utiliza cinco parejas funcionales de referencia con objetivo 28/12 minutos por pareja durante tiempo reglamentario, sin convertir la posición nominal en una prohibición. Muestra la asignación concreta y su suma. Un jugador que cubre dos funciones no recibe dos objetivos independientes acumulados; valida la asignación antes de utilizarla. Los otros dos jugadores pueden quedar como recursos situacionales. No sustituyas planes guardados por este ejemplo.

### 6.2 Orden de evaluación

1. Retirada o sustitución obligatoria si existe causa legal.
2. Orden manual y funciones indispensables.
3. Riesgo por faltas y disponibilidad de recambio compatible.
4. Valor actual del jugador y de las alternativas para la tarea pertinente.
5. Estabilidad de la rotación y desvío de participación respecto al plan.
6. Necesidad contextual: creación, defensa, rebote, pase, libres, tiempo o urgencia.

No evalúes los 792 quintetos posibles. Compara al jugador revisado con sus relevos compatibles y valida el quinteto resultante. Como máximo prepara un paquete de dos sustituciones por revisión ordinaria cuando sea necesario para conservar funciones. Las sustituciones obligatorias pueden exigir más y no deben bloquearse por ese límite deportivo ordinario.

### 6.3 Utilidad contextual

Reutiliza las recetas de capacidades y funciones que ya existen. Si una receta ya entrega utilidad efectiva con energía u otros estados aplicados, no vuelvas a restarlos. Mantén visibles los componentes utilizados y la versión de receta.

La comparación sirve para decidir quién realiza una función; **no se añade después a la probabilidad de ejecución** como una segunda bonificación. No crees un overall permanente.

La posición nominal orienta, pero no filtra por sí sola. Comprueba requisitos deportivos reales: quién dirige, quién puede ocupar la función, qué encargos quedan disponibles y si existe una reorganización válida.

Una estrella cansada puede seguir siendo mejor alternativa. Energía 30 provoca revisión, no expulsión del quinteto. Energía inferior a 10 refuerza la revisión y las consecuencias físicas existentes, sin inventar una retirada reglamentaria por cansancio.

Para comparar utilidades con umbrales SEM usa una escala documentada equivalente a 1–30. Si la implementación usa otra escala, convierte los umbrales explícitamente. No compares diferencias de 0,5 contra una magnitud 0–1 sin conversión.

### 6.4 Estabilidad

Conserva los mínimos de estancia en pista y banco, umbrales separados de revisión y disponibilidad, y la protección frente a intercambios repetitivos. La tabla del apartado 10 concreta los valores iniciales de esta entrega.

Las excepciones son: salida obligatoria, sustitución manual válida, lesión o indisponibilidad ya modelada, necesidad final definida o desaparición de una función indispensable. Registra qué excepción permite saltar el mínimo.

En una sustitución revisa director, referencias, marcas y participantes. Las preferencias transferibles se reasignan por una regla declarada. Una marca sobre un rival que ya no está en pista queda suspendida o usa su alternativa declarada; no se convierte en una persecución de un jugador inexistente.

No resetees Forma, momento del equipo o memoria al sustituir. Los estados de quien entra y sale siguen las reglas de MOTOR-07.

## 7. Librillo de faltas

### 7.1 Tabla ordenada, no varios if dispersos

Las filas deben identificar: prioridad, período o tramo, faltas relevantes, tiempo restante, diferencia de marcador, función, recambio adecuado, situación de bonus cuando corresponda, preferencia, excepción y código de motivo.

Utiliza estos casos iniciales, con límites SEM editables:

| Prioridad | Condición | Preferencia | Excepción |
|---|---|---|---|
| 100 | Exclusión o indisponibilidad reglamentaria | Retirar conforme al reglamento. | Ninguna excepción deportiva. |
| 90 | Orden manual válida | Respetar dentro de la elegibilidad. | La administración obligatoria prevalece. |
| 70 | Q1, al menos 2 faltas personales | Proteger con relevo compatible. | Urgencia o pérdida contextual de utilidad superior al umbral de protección. |
| 70 | Q2, al menos 3 | Proteger para la segunda mitad. | Igual criterio, sin retirada automática. |
| 70 | Q3, al menos 4 | Proteger participación final. | Igual criterio. |
| 60 | Q4, más de 180 s, al menos 4 | Considerar relevo y bajar riesgo evitable. | Recambio insuficiente o necesidad urgente. |
| 80 | Q4 o prórroga, 180 s o menos y margen absoluto de 8 o menos | Comparar valor de cierre; se puede mantener con 4. | Elegibilidad absoluta y orden manual. |
| 75 | Equipo pierde por al menos 12 y quedan como máximo 300 s del último período | Aceptar antes el riesgo de mantener una referencia. | Si el recambio es mejor para la tarea, no mantener por nombre. |

Una fila de prioridad superior prevalece; en empate resuelve por especificidad y después por orden estable de fila. Las prórrogas utilizan el contexto de cierre; no reinician las faltas personales ni se tratan como un nuevo Q1.

«Proteger» significa preferir un relevo si la pérdida de utilidad cabe en la tolerancia de la política, o reducir encargos de contacto evitable mediante controles existentes. No significa sacar siempre al jugador. El número de faltas y la regla de exclusión proceden de la administración común, no de esta tabla deportiva.

### 7.2 Riesgo real

Puedes reducir intentos voluntarios de robo o asignaciones especialmente expuestas usando decisiones ya implementadas. No reduzcas directamente la probabilidad de falta porque el jugador sea importante, esté al límite o el entrenador quiera conservarlo.

La falta táctica tiene que intentar producirse mediante una acción posible. Puede fallar en detener a tiempo, recibir otra clasificación o no conceder los efectos buscados. No conviertas la orden en una detención administrativa garantizada ni generes automáticamente una falta disruptiva o flagrante.

No permitas que una política invalide la clasificación reglamentaria de un contacto.

## 8. Tiempos muertos y ajustes

### 8.1 Motivos y disponibilidad

Motivos declarados: reorganizar, preparar una acción o saque, descanso contextual, revisar un problema defensivo repetido y actuar ante una racha con evidencia de desorden.

Usa exclusivamente recursos y ventanas del reglamento vigente en el motor. Si falta una ventana necesaria para una acción de este alcance, impleméntala con referencia identificada; no detengas arbitrariamente una posesión viva. La petición puede quedar pendiente hasta la siguiente oportunidad legal, y debe volver a validarse entonces.

No se pide una segunda pausa por el mismo problema mientras existe una solicitud vigente. Si la ventana llega cuando el motivo ya no existe o una orden manual lo invalida, cancela o actualiza la solicitud con motivo.

### 8.2 Racha y evidencia

No basta con «el rival anotó dos veces». Usa una ventana pequeña de hasta cuatro ataques recientes de cada equipo, con hechos ya registrados:

- Parcial adverso observable.
- Oportunidades cómodas repetidas, pérdidas evitables o una pérdida de organización identificable.
- Problema de asignación o preparación que permita proponer algo concreto.

Semilla de alarma de racha: parcial adverso de al menos 8 puntos, junto con al menos dos oportunidades cómodas rivales o dos incidencias propias de desorden/pérdida evitable dentro de esa ventana. «Evitable» debe ser una categoría fundada en el hecho; no toda pérdida cuenta automáticamente.

No inventes clasificaciones que el motor no pueda sostener. Si falta una categoría, deriva una descripción de sus causas ya conocidas o limita la alarma a la evidencia disponible y documenta el límite.

Una racha de tiros difíciles convertidos puede justificar observación o una pausa por otra causa, pero no demuestra por sí sola que la defensa deba cambiarlo todo.

### 8.3 Efectos de pausa

Aplica una sola vez los efectos existentes de energía y atenuación de estados, a ambos equipos cuando corresponda. El motivo elegido no añade multiplicadores de recuperación o de éxito.

Una pausa no borra memoria, no neutraliza mágicamente al rival, no garantiza una canasta posterior y no cancela un episodio ya ocurrido. Sus órdenes se ejecutan en las fronteras correspondientes.

La reserva de tiempos muertos del apartado 10 es una preferencia, no un recurso adicional. Una necesidad urgente puede consumirla; si se agotan las pausas, el entrenador utiliza las opciones legales restantes.

### 8.4 Ajustes acotados

Un ajuste ordinario cambia una dimensión principal: por ejemplo, cobertura, prioridad de negar una salida o una preferencia ofensiva. Puede usar un paquete ya declarado cuando sus elementos deban mantenerse coherentes. No combines siete cambios independientes bajo el nombre de paquete para eludir esta limitación.

Mantén el cambio durante el tramo mínimo de su política, salvo incompatibilidad sobrevenida, orden manual o urgencia final. No recorras todos los niveles de un control después de cada canasta.

Las alternativas proceden del repertorio real y del plan permitido. La memoria recomienda; la delegación y la compatibilidad autorizan. Una recomendación no autoriza a cambiar una organización bloqueada por Dennis.

## 9. Finales de partido

### 9.1 Un mismo motor con prioridades diferentes

Implementa una tabla pequeña de decisiones por contexto. No crees un resolutor de finales con porcentajes propios. Las prioridades modifican selección, riesgo, ritmo y recursos; tiro, pase, falta, rebote y oposición siguen las mismas operaciones.

Semillas iniciales de contexto:

- Cierre disputado: último período o prórroga, hasta 180 s y margen absoluto hasta 8.
- Necesidad urgente: se pierde por al menos 12 con hasta 300 s.
- Ataque rápido por necesidad: se pierde por al menos 4 con hasta 90 s.
- Buscar una opción de tres si resulta necesaria: se pierde por al menos 3 con hasta 30 s. Favorece una opción viable; no obliga a rechazar toda canasta de dos liberada.
- Proteger ventaja: se gana, queda poco tiempo y el reloj permite consumir tiempo sin provocar una infracción.

Los límites son SEM administrables y no afirman que exista una estrategia universal óptima.

### 9.2 Repertorio mínimo

| Intención | Qué puede ordenar | Qué no garantiza |
|---|---|---|
| Conservar ventaja | Menor riesgo voluntario, gestión del tiempo y receptores apropiados. | Posesión sin pérdidas ni agotamiento seguro del reloj. |
| Anotar rápido | Reducir elaboración y aceptar antes una opción suficiente. | Canasta inmediata ni calidad liberada. |
| Buscar tres | Priorizar recursos y receptores compatibles con ese tiro. | Fabricar un triple cuando la defensa no lo permite. |
| Preparar última acción | Usar tiempo restante y llamada posible. | Ser el último en atacar si hay pérdida, rebote o falta. |
| Detener reloj | Considerar una falta táctica legal y sus costes. | Detención instantánea o una sanción elegida por el entrenador. |
| Defender amenaza relevante | Priorizar una salida observada o proteger la opción que cambia el objetivo. | Acierto defensivo automático. |
| Sustitución situacional | Mejorar libres, pase, defensa o rebote si hay ventana. | Sustituir durante balón vivo ni recuperar al jugador sin otra ventana. |
| Preparar tras pausa | Llamada de saque o recurso existente compatible. | Recepción inventada o ejecución sin oposición. |

Para una falta táctica automática exige: equipo por detrás, tramo urgente habilitado, posesión rival y posibilidad real de contacto; registra bonus, tiempo y coste reglamentario conocido. No la ordenes por defecto con ventaja. Si faltan los datos necesarios, conserva una conducta legal ordinaria y deja constancia de por qué no se activó.

En un contexto de buscar tres o detener reloj, el entrenador utiliza la información presente. No calcula qué habría ocurrido con una semilla alternativa. La política cauta también puede asumir riesgo cuando va perdiendo; la agresiva también puede conservar una ventaja.

## 10. Políticas de referencia y semillas

### 10.1 Identidades y alcance

Conserva los IDs del funcional:

- `ENTREF01`: Cauta.
- `ENTREF02`: Equilibrada.
- `ENTREF03`: Agresiva en decisiones.

Son políticas, no niveles de inteligencia ni talentos. Ninguna recibe mejores lecturas del estado ni más probabilidad de acertar. No sobrescriben el estilo del equipo.

### 10.2 Precarga SEM

Usa estos valores si no existe una concreción posterior ya aprobada. Si sustituyen semillas anteriores, conserva la fila histórica, identifica el cambio y activa una nueva versión explícita.

| Parámetro | Unidad o significado | Cauta | Equilibrada | Agresiva |
|---|---|---:|---:|---:|
| `energyReview` | Energía propia que solicita revisión, no salida | 50 | 45 | 40 |
| `benchReadyEnergy` | Energía preferida de un relevo ordinario | 70 | 65 | 60 |
| `minCourtStint` | Segundos deportivos en pista | 360 | 360 | 360 |
| `minBenchStint` | Segundos deportivos en banco | 120 | 120 | 120 |
| `maxOrdinaryStintReview` | Segundos que provocan revisión adicional | 480 | 480 | 480 |
| `replacementGain` | Ventaja mínima de utilidad del relevo para cambio ordinario | 0,5 | 1,0 | 1,5 |
| `fatigueUtilitySacrifice` | Pérdida máxima aceptable al relevar por fatiga, escala 1–30 | 1,5 | 1,0 | 0,5 |
| `foulProtectionSacrifice` | Pérdida máxima aceptable al proteger por faltas | 4 | 3 | 2 |
| `criticalEnergyReview` | Revisión reforzada | 10 | 10 | 10 |
| `adjustmentHold` | Segundos deportivos de permanencia ordinaria de ajuste | 240 | 180 | 120 |
| `recognitionThreshold` | Evidencia reciente necesaria para proponer respuesta MEM | 2,5 | 2,0 | 1,5 |
| `timeoutCooldown` | Segundos deportivos desde la última pausa propia ordinaria | 180 | 120 | 90 |
| `timeoutReserve` | Pausas propias que se intenta conservar para el cierre | 1 | 1 | 0 |
| `closingWindow` | Segundos del último período o prórroga | 180 | 180 | 180 |

No conviertas `replacementGain` y `fatigueUtilitySacrifice` en dos descuentos simultáneos. Son rutas alternativas: mejora ordinaria o relevo por protección de fatiga. Las excepciones legales/contextuales tienen su prioridad declarada.

El período de banco y pista se mide en tiempo deportivo real, no en tiempo de reproducción del navegador. La recuperación de energía sigue su curva existente.

A igualdad de utilidad y condiciones, conserva al jugador actual; entre candidatos nuevos usa un desempate estable por preferencia de plan e ID. No añadas azar solo para variar sustituciones.

### 10.3 Datos comunes

Son comunes a las tres políticas, como SEM: alarma de racha 8 puntos con dos señales pertinentes en una ventana de cuatro ataques, margen de cierre 8, urgencia 12 puntos/300 s, ataque rápido 4 puntos/90 s, búsqueda de tres 3 puntos/30 s. El cooldown admite excepción para una causa nueva urgente o una preparación final necesaria; debe quedar identificada.

No existe un multiplicador global «entrenador agresivo». Cada diferencia se consume en su punto de decisión y figura en la trazabilidad.

## 11. Memoria colectiva pequeña

### 11.1 Qué almacena

Una memoria defensiva por equipo, persistente dentro del encuentro y con **máximo ocho patrones activos**. No una matriz por jugador, pareja, ficha y variante, ni una exploración del relato entero antes de cada decisión.

Cada entrada contiene, de forma acotada:

- Clave semántica de familia/recurso y tipo de salida relevante.
- Contexto específico mínimo si importa: protagonista principal, objetivo o función.
- Evidencia reciente, última observación y conteos pertinentes.
- Si la oportunidad obtenida fue incómoda, disputada o cómoda según causas deportivas observables.
- Respuesta intentada, concesión conocida y continuidad que importa.
- Último ajuste relacionado y su vigencia.

Una misma entrada puede contener un resumen general y su contexto específico; no crees otras ocho listas paralelas por cada contexto.

### 11.2 Identidad semántica

Cambiar el ID de una ficha no borra que el equipo repite directo y continuación hacia el mismo recurso. Cambiar un jugador secundario no elimina todo aprendizaje. Una continuación realmente distinta puede cambiar qué respuesta tiene sentido.

Utiliza las familias y salidas declaradas del repertorio; no inventes un clasificador de texto ni aprendizaje automático. Separa dos niveles de información: qué recurso se repite y qué actor/contexto específico hace aplicable una respuesta. Esa separación evita tanto olvidar todo como aplicar una marca a un jugador ausente.

### 11.3 Actualización por hechos, no por anotación

Registra exposición y calidad de oportunidad **antes de conocer el acierto**, cuando exista una interacción reconocible. Una continuación cómoda fallada sigue siendo evidencia; un tiro extraordinario convertido no demuestra una brecha táctica cómoda.

Como máximo incrementa una vez la evidencia de un mismo patrón dentro de un ataque continuo. Un rebote ofensivo o una continuación no multiplican artificialmente la repetición por cada subevento. Si aparecen recursos distintos realmente observables, pueden actualizar sus entradas distintas, dentro del máximo global.

No uses una etiqueta ESP como prueba suficiente de exposición, negación o calidad. Debe existir el hecho deportivo que la sostiene.

### 11.4 Curva SEM explícita

Precarga administrable:

- Capacidad: 8 entradas.
- Evidencia inicial: 0.
- Incremento por exposición válida: 1.
- Saturación: 4.
- Semivida: 7 ataques rivales sin nueva exposición de ese patrón.
- Umbral de descarte por irrelevancia: 0,25.
- Umbrales de propuesta: los de `recognitionThreshold` de cada política.

Para una entrada sin exposición durante `n` ataques rivales, la evidencia efectiva es:

`eActual = eGuardada × 2^(-n / 7)`.

Al observar el patrón, primero actualiza el decaimiento pendiente y después aplica `min(4, eActual + 1)`. Actualiza la referencia de ataque. No apliques dos veces el mismo tramo de decaimiento. Cuenta ataques deportivos identificados por el motor, no frames, tiros libres, órdenes o revisiones del entrenador.

Si una misma posesión reglamentaria contiene continuaciones, utiliza su identificador de ataque continuo y documenta la equivalencia con los contadores existentes. No cambies la definición estadística de posesión para acomodar MEM.

Tras siete ataques sin repetición queda la mitad de la evidencia; no una memoria eterna. Si se llena, reemplaza la entrada de menor evidencia efectiva, con desempate por mayor antigüedad y luego clave estable. No reemplace una entrada solo porque el último tiro falló.

El cambio de cuarto y el tiempo muerto no resetean la memoria. La sustitución conserva la evidencia general y vuelve a validar la pertinencia del componente específico. El partido siguiente empieza con memoria vacía: no construyas scouting de carrera.

### 11.5 De reconocer a responder

El umbral permite proponer una respuesta, no ejecutarla ni mejorar su éxito. Comprueba encargo, delegación, jugadores, compatibilidad, ventana y estabilidad del ajuste.

Carga un catálogo inicial pequeño usando recursos existentes:

| Patrón observado | Respuesta candidata | Comprobación y coste |
|---|---|---|
| Continuación repetida con ventaja | Ayuda compatible o cobertura existente que priorice contener esa salida. | No abandonar una amenaza protegida; reconoce el espacio concedido a otra salida. |
| Director consigue tiros cómodos tras directo | Mayor atención al poseedor o cobertura compatible que lo encuentre antes. | Exposición del continuador/pop y capacidades reales para recuperar. |
| Pop o apertura recibe libre repetidamente | Priorizar recuperación o cambio compatible. | No inventar un defensor adicional ni mantener simultáneamente dos coberturas incompatibles. |
| Recepción tras indirecto produce tiro cómodo | Negar recepción o respuesta existente de cambio/persecución compatible. | La cobertura debe ser válida para ese indirecto, no heredada indiscriminadamente del directo. |
| Poste genera ventaja repetida | Ayuda o doble ya permitidos por el plan. | Coste en pase de salida y restricción de no abandonar tirador. |
| Penetración y pase explota siempre la misma ayuda | Reducir esa ayuda o proteger la salida concreta dentro del plan. | Mayor responsabilidad del defensor inicial y espacio concedido a la penetración. |

Los nombres exactos de las coberturas se resuelven contra el catálogo real de beM, nunca suponiendo que COB01, COB02, etc. significan algo por su número. Registra en la tabla los IDs efectivos y sus requisitos. Cuando existan varias alternativas compatibles, usa prioridad declarada; no pruebes futuros desenlaces para elegir.

No es obligatorio cambiar si ninguna respuesta es mejor o compatible con la información disponible. Registra «reconocido, sin respuesta autorizada/compatible» y conserva la defensa actual.

La respuesta modifica preparación o decisión real. **No resta un porcentaje al acierto por ser la cuarta repetición.** La cuarta acción puede seguir funcionando por talento, lectura, alternativa, concesión o mala ejecución defensiva. Tampoco existe un cupo que obligue a dejar de usar una acción ofensiva.

### 11.6 Evitar duplicidades

MEM aporta evidencia histórica a una decisión. MEN02/MEN03/MEN04 y las capacidades pertinentes siguen resolviendo la lectura y ejecución actuales cuando corresponda. No sumes un bonus de memoria, otro de reconocimiento y otro de lectura por la misma ventaja.

Una propuesta que cambia el plan pasa por ENT y su ventana. Una preparación que ya está dentro del encargo actual puede utilizarse dentro de la acción correspondiente, sin fingir un cambio de plan previo. Identifica ambas rutas y no ejecutes dos respuestas por el mismo reconocimiento.

## 12. Salvedades recibidas de MOTOR-07

Este apartado no aprueba en bloque las interpretaciones anteriores. Debe quedar un registro por salvedad: fuente, situación encontrada, decisión, cambio y comprobación.

### 12.1 Faltas disruptiva y flagrante: referencia puntual verificada

Fuente oficial consultada para este encargo: **Official Basketball Rules 2026, versión 1.1, vigente desde 1 de octubre de 2026**:

<https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf>

Resumen de las reglas pertinentes, para evitar repetir el bloqueo de acceso del PDF:

| Artículo | Regla a contrastar con la implementación |
|---|---|
| 37.2 y 38.2 | En disruptiva y flagrante, lanza el jugador que recibió la falta. Sin acción de tiro: dos libres. Tiro convertido: cuenta la canasta y un libre. Tiro fallado: dos o tres libres según el intento. Después corresponde saque delantero frente a la mesa. |
| 17.2.7 | La reanudación por disruptiva, flagrante o descalificante se realiza en la línea de saque de pista delantera, enfrente de la mesa, salvo disposición distinta aplicable. |
| 29.2.6 | Ese saque de penalización dispone de catorce segundos de lanzamiento. |
| 38.2.3 | Descalifican dos flagrantes, dos técnicas de categoría 1 o una de cada clase. No se deduce una descalificación automática por dos disruptivas. |

Integra estas correcciones en las rutas ya implementadas y documenta su correspondencia con las categorías internas. «Posesión del lanzador» no significa que la persona deba recibir el saque: el derecho corresponde a su equipo. Conserva la administración de casos combinados y excepciones más amplias para MOTOR-09; no generalices este cuadro a todas las técnicas o descalificaciones posibles.

Si el código utiliza categorías antiguas, no cambies únicamente el texto visible: revisa clasificación, libres, lanzador, reanudación y exclusión efectiva de los casos activos. No añadas una probabilidad artificial de estas faltas para demostrar que existen.

### 12.2 COB04 en entregas POS05/POS06

Decisión de este encargo: puede existir una respuesta de dos defensores al poseedor tras una entrega, **si COB04 corresponde realmente a ese recurso en el catálogo** y los requisitos deportivos se cumplen.

Comprueba un poseedor real tras entrega, dos defensores accesibles, asignaciones y encargo compatibles, y el espacio que dejan. Reutiliza la resolución de esa respuesta existente; no crees otra bonificación o un robo automático. Si la situación no ofrece ese acceso, la respuesta es incompatible y debe utilizar una alternativa declarada.

Esta autorización es para entregas compatibles; no significa que todas las coberturas sean válidas para todos los indirectos ni que exista un doble antes de producirse la entrega. Documenta la tabla exacta de compatibilidad y la causa de rechazo.

### 12.3 Recepción forzada en saques

Decisión: **no se admite una recepción garantizada inventada como último recurso**.

Si se niegan todas las opciones previstas, puede aparecer una recepción difícil de un jugador real cuando exista una ventana deportiva, tiempo legal y un pase que todavía debe superar riesgo y oposición. La calidad forzada describe esa opción real; no la crea una etiqueta.

Si no existe ventana, el sacador continúa con una alternativa real disponible, arriesga un envío con sus consecuencias o incurre en la violación correspondiente al vencer el plazo. No resuelvas siempre con «recibe el jugador más cercano» ni suprimas la infracción para mantener el partido fluido.

Mantén la corrección de MOTOR-07: un envío forzado de saque no es por ello una falta en acción de tiro.

### 12.4 Lectura defensiva MEN02/MEN03/MEN04

Es válido utilizarlas en la decisión de intervenir sobre el balón cuando sean pertinentes. No conviertas esa ubicación en la afirmación de que toda la lectura defensiva ya está cubierta.

Revisa las rutas existentes de ayuda, negación, recuperación y elección de respuesta: usa la percepción y decisión común cuando el funcional lo exige, con información permitida y participantes reales. Evita duplicar el efecto en selección, intento de robo y resolución del mismo hecho.

No amplíes esta revisión a una reescritura completa de las 32 capacidades. Entrega un mapa acotado de tareas afectadas y justifica las que no consumen esas capacidades.

### 12.5 Banquillo y neutralidad

Se acepta para esta entrega la concreción de MOTOR-07: **el banquillo atenúa los momentos hacia neutral sin introducir nuevas innovaciones aleatorias**. Regístralo como precisión respecto a la formulación SEM anterior si esta proponía ruido también en banco.

No resetees los estados al entrar, no premies sentarse con un momento positivo ni cambies la Forma del partido. Conserva la dinámica activa y las pruebas de Consistencia ya implementadas.

La neutralidad comprobada en contexto fijo no demuestra igualdad de resultados en partidos completos. Estados iniciales no neutrales, episodios, selección de acciones y decisiones rivales pueden cambiar el rendimiento real; no cambies el mecanismo para forzar que todos los contextos den la misma media.

### 12.6 `stateTasks`, `episodeCatalog` e I-D1 a I-D6

Contrasta las filas que intervengan en esta entrega con el funcional y documenta el resultado por fila o grupo homogéneo identificable. Una tabla «pasa validación» no equivale a aprobación deportiva de su contenido.

Verifica especialmente:

- T no se añade directamente al tiro individual o al pase personal si el funcional lo excluye.
- El actor y el estado consumidos corresponden a la tarea real.
- Un episodio necesita causa deportiva y no solo etiqueta ESP, resultado final o importancia del partido.
- Un mismo hecho no dispara varias veces el mismo impulso ni lo aplica retroactivamente a su propio resultado.
- Tiempo muerto, sustitución y memoria no inventan episodios de liderazgo.

Las interpretaciones no afectadas por MOTOR-08 pueden quedar pendientes, identificadas con su impacto. No las declares aprobadas por omisión.

### 12.7 Calibración e importancia ordinaria

Los impulsos, alpha y la importancia ordinaria 0,25 siguen siendo SEM. Que esta última reste unas centésimas de logit a un MEN07 medio no autoriza a neutralizarla silenciosamente.

Conserva los valores actuales salvo contradicción funcional concreta. Expón dónde se consumen y deja la calibración para el trabajo correspondiente. No uses 83–97 ni un resultado nuevo como objetivo.

## 13. Tablas administrables y perfiles

### 13.1 Inventario mínimo

Mapea estas responsabilidades a las tablas canónicas ENT01–ENT07, MEM01–MEM04 y defensivas ya inventariadas. Si la estructura actual usa otros nombres físicos, documenta el vínculo uno a uno o uno a varios, sin duplicar fuentes de verdad.

| Responsabilidad de datos | Contenido mínimo |
|---|---|
| Políticas ENT | Tres referencias, umbrales y prioridades. |
| Revisión ENT | Fronteras, causas y deduplicación. |
| Rotación ENT | Estancias, energía, tolerancias, relevos y excepciones. |
| Faltas ENT | Filas ordenadas del librillo y acciones permitidas. |
| Pausas/ajustes ENT | Alarmas, reserva, cooldown, permanencia y motivos. |
| Finales ENT | Contextos, prioridades y órdenes compatibles. |
| Delegación ENT | Ámbitos, duración, precedencia y límites. |
| MEM01 | Claves semánticas y vínculo con recurso/salida reales. |
| MEM02 | Capacidad, evidencia, decaimiento, saturación y reemplazo. |
| MEM03 | Reconocimiento y catálogo de respuestas. |
| MEM04 | Aplicabilidad, sustituciones y cambios de contexto. |
| Respuestas defensivas | Requisitos, compatibilidades y concesiones de respuestas existentes. |

No es obligatorio crear exactamente doce tablas físicas: sí lo es que estas reglas se puedan encontrar y administrar sin buscar constantes deportivas por el código.

### 13.2 Panel

Amplía el panel y la tabla maestra existentes:

- Tabla o sección «Entrenador» y otra «Memoria», con filtros y descripción de cada parámetro.
- Valores, unidades, rango validado, origen SEM, versión y punto de consumo.
- Vínculos de una respuesta con sus requisitos y de una regla con su prioridad.
- Precarga de las tres políticas y comparación de sus diferencias.
- Modificación en perfil candidato, validación y activación explícita según MOTOR-03.

No conviertas el panel en un editor de JavaScript. Los datos declaran condiciones tipadas y acciones permitidas. El código conserva operaciones, validación y cumplimiento reglamentario.

Valida referencias, prioridades, unidades y límites. Capacidad de memoria y tamaños de ventana deben tener límites técnicos razonables; la base de esta entrega usa ocho entradas. No aceptes valores negativos, NaN, ventanas imposibles ni acciones que referencien una cobertura inexistente. Un ajuste extremo no puede invalidar elegibilidad ni consumir recursos inexistentes.

### 13.3 Perfil de referencia

Crea una base identificada con sufijo `+SEM-MOTOR08-20261016`, siguiendo la convención completa existente. No alteres el perfil activo de un navegador sin consentimiento explícito en la UI. Ofrece activar la base de MOTOR-08 o crear una candidata compatible a partir de un perfil anterior cuando sea seguro y visible.

No prometas compatibilidad automática de perfiles si faltan tablas o cambia el contrato. Explica la diferencia y conserva el original.

## 14. Interfaz y trazabilidad

### 14.1 Preparación

Permite elegir política por equipo, revisar el plan de participación y fijar la delegación por áreas. Los controles no obligan a Dennis a introducir todas las filas ENT para jugar un partido; la base debe estar lista para usar.

Muestra un resumen entendible: quién puede relevar al director, principales preferencias de cierre y qué áreas controla la máquina. No expongas matemáticas SEM en el flujo normal de preparación; están disponibles en el panel.

### 14.2 Partido

Conserva los controles actuales y añade:

- Estado de delegación y posibilidad de cambiarlo.
- Últimas decisiones ejecutadas y solicitudes pendientes.
- Motivo breve de una sustitución, pausa o ajuste.
- Indicación de una orden manual que impide un ajuste automático.

La información rival se limita a hechos públicos. No muestres «el rival tiene T = −0,6» como explicación de una pausa ni reveles sus umbrales privados en la vista ordinaria. El diagnóstico separado sí puede mostrar el funcionamiento de ambos lados para auditarlo.

### 14.3 Diagnóstico y registro

Una decisión registra como mínimo:

- ID, equipo, frontera y tiempo deportivo.
- Política, versión de perfil, regla y motivo.
- Observaciones permitidas que la sustentan.
- Acción propuesta, autorizada, pendiente, ejecutada, cancelada o rechazada.
- Causa de rechazo/espera y orden manual relacionada si existe.
- Participantes antes/después y función, cuando proceda.
- Diferencia de utilidad y receta, solo en diagnóstico.
- Patrón MEM y evidencia pertinente, sin duplicar todo el historial en cada fila.

La memoria registra exposición, calidad observada, decaimiento efectivo, reconocimiento, respuesta y concesión. No vuelques la misma instantánea completa por cada tick o cada línea de relato.

Ofrece conteos simples para revisar decisiones: sustituciones por motivo, excepciones de estabilidad, pausas solicitadas/ejecutadas/canceladas, ajustes propuestos/aplicados y patrones reconocidos/respondidos. Usa denominadores distintos: una propuesta no cuenta como ajuste aplicado. Estos conteos no sustituyen el catálogo estadístico final ni son una evaluación causal del entrenador.

## 15. Compatibilidad y exportación

Amplía el formato de exportación vigente. Si su contrato cambia, crea la siguiente versión conforme al mecanismo real del repositorio; partiendo de `export/6`, lo normal será `export/7`, pero verifica el formato canónico antes de escribirlo.

Incluye los datos necesarios para reproducir: semilla, versión de motor, perfil o referencia íntegra reproducible, políticas, planes, delegación inicial, órdenes humanas con su frontera, y decisiones/observaciones pertinentes del registro. El estado derivable de memoria no necesita duplicarse íntegro en cada evento si se reconstruye determinísticamente de sus hechos y parámetros.

Si se permiten snapshots intermedios, deben contener lo necesario para continuar sin perder cooldowns, propuestas, estancias o memoria. Si el producto solo reproduce desde inicio, no inventes un sistema completo de guardado intermedio para esta entrega.

La reproducción utiliza el contrato existente y comprueba las decisiones de manera coherente. No ejecuta una orden exportada y vuelve a generar otra equivalente consumiendo dos veces un recurso.

Los formatos antiguos no compatibles se rechazan con motivo claro y conservando el archivo. No los migres silenciosamente ni afirmes que siguen reproduciendo exactamente el mismo partido.

No añadas azar nuevo a desempates de políticas o memoria. Si una decisión deportiva ya necesita azar, usa el generador y la arquitectura reproducible existentes. La UI, el diagnóstico, el modo y la velocidad no deben consumir números deportivos.

## 16. Pruebas automáticas y recorrido manual

### 16.1 Automáticas: pocas y con propósito

Ejecuta la suite existente, `data:check` y el control documental disponible. Añade únicamente pruebas que protejan riesgos reales de esta entrega; agrupa casos relacionados en pruebas parametrizadas pequeñas cuando resulte más claro.

Cobertura mínima pertinente:

1. Estrella con energía 30 permanece frente a un relevo peor; un jugador fatigado sale cuando el relevo adecuado justifica el cambio. No basta con comprobar que se llama a una función.
2. Estabilidad impide el intercambio inmediato y permite una salida obligatoria.
3. Librillo distingue protección ordinaria de cierre/urgencia y nunca mantiene un jugador excluido.
4. Orden manual bloquea el ajuste automático correspondiente; una propuesta espera su ventana legal y no se duplica.
5. Tiempo muerto consume un recurso una sola vez y aplica una sola pausa. Puede ser cancelado si desaparece su causa.
6. MEM reconoce recursos equivalentes aunque cambie el ID de ficha, decae, mantiene el máximo de ocho y no depende del acierto para acreditar la oportunidad.
7. Reconocimiento no produce por sí solo una penalización de acierto ni autoriza una respuesta incompatible. Comprueba que la ruta modificada requiere ejecución real; no impongas que la cuarta repetición falle ni que acierte.
8. La vista del entrenador excluye información rival privada y resultados futuros. Una variación de un dato rival oculto no cambia la propuesta cuando todo lo permitido permanece idéntico.
9. Reproducción y tres modos conservan las decisiones y los hechos deportivos a igualdad de entradas, sin repetir órdenes.
10. Correcciones puntuales de faltas activas y saque sin receptor garantizado, si afectan código de esta entrega.

No hace falta convertir cada fila de datos en una prueba que repita literalmente su contenido. Valida referencias y rangos mediante el control de datos. No amplíes la suite para alcanzar un número de pruebas.

### 16.2 Partidos completos de cierre

Ejecuta cinco encuentros completos con invariantes, reutilizando plantillas existentes:

- Uno de referencia equilibrada/equilibrada, semilla `20261016`.
- Uno cauta/agresiva con el mismo contexto de plantilla cuando sea útil para inspeccionar decisiones.
- Uno con energía inicial baja de una referencia y relevos de distinto valor.
- Uno con exposición repetida a un recurso compatible con MEM, usando plan o fixture identificados, sin forzar anotaciones.
- Uno que permita revisar finales y recursos. Si el partido no llega a cierre disputado, complementa con un estado de prueba acotado; no busques a ciegas cientos de semillas ni manipules su marcador para presentarlo como natural.

Estos cinco encuentros son comprobación de integración, no calibración estadística ni evidencia de superioridad de una política. Informa los resultados observados sin compararlos como objetivo con 83–97.

### 16.3 Manual para Dennis

Crea `docs/prompts/MOTOR-08-recorrido-manual.md`, con preparación exacta, perfil, semilla, controles, observación esperada y cómo reconocer un problema. Usa lenguaje de producto.

Recorrido mínimo:

1. Arrancar con `npm run dev`; indicar la URL real.
2. Activar explícitamente la base MOTOR-08 y localizar Entrenador/Memoria en el panel.
3. Elegir políticas y ámbitos delegados; comprobar que estilos y plantillas no cambian al elegir una política.
4. Simulado total: revisar decisiones al final.
5. Por cuartos: cambiar una instrucción entre períodos y conservarla según su duración.
6. Visionado: cambiar una delegación, dar una orden manual y comprobar su prioridad.
7. Caso de referencia cansada frente a un recambio peor y otro adecuado, mediante copias diagnósticas identificadas.
8. Ver una protección por faltas y una excepción contextual, sin exigir que el partido ordinario produzca ambas.
9. Solicitar una pausa, ver petición/ejecución y recursos; comprobar que no promete cortar una racha.
10. Revisar un patrón MEM, una respuesta compatible y un caso reconocido sin autorización para cambiar.
11. Revisar final mediante encuentro o caso diagnóstico claramente marcado.
12. Exportar, reproducir y comprobar la explicación de un formato no compatible.

Las copias diagnósticas no alteran plantillas ni planes originales. No presentes un estado preparado como resultado espontáneo del motor. No marques «probado por Dennis» lo que solo hayas comprobado automáticamente.

Si recorres Chromium, informa pantallas y acciones efectivamente recorridas. No declares un recorrido manual completo a partir de que la página arrancó sin errores.

## 17. Documentación, entrega y límites

Antes de implementar, archiva este prompt íntegro en `docs/prompts/MOTOR-08-entrenador-y-memoria.md`, o en el nombre equivalente exigido por el catálogo existente. Conserva su contenido recibido; las interpretaciones y desviaciones se documentan aparte. Actualiza su estado en el catálogo: recibido/en ejecución/completado técnicamente/pendiente de revisión manual, según proceda.

Crea `docs/tecnico/motor08.md` con:

- Base real de trabajo, dependencia o fusión de MOTOR-07 y rama efectiva.
- Mapa de requisitos de este prompt a datos, código e interfaz.
- Tablas y parámetros añadidos; origen SEM, unidades, valores y punto único de consumo.
- Fronteras de revisión y ejecución, precedencia y deduplicación.
- Recetas de comparación de relevos y mecanismos que evitan aplicar estados dos veces.
- Reglas y excepciones del librillo, pausas, finales y estabilidad.
- Estructura y coste acotado de MEM, semántica, decaimiento y respuestas reales.
- Contrato de información del entrenador y qué queda solo en diagnóstico.
- Resolución individual de las salvedades del apartado 12, incluidas las que permanezcan abiertas y por qué.
- Referencia reglamentaria puntual y correcciones realizadas.
- Versión de perfil, export y compatibilidad.
- Comprobaciones reales y limitaciones.

Actualiza índices, páginas temáticas afectadas, `estado.md`, `CHANGELOG.md` y catálogo de prompts. No sobrescribas el funcional íntegro para hacerlo coincidir retrospectivamente con el código. Documenta las precisiones o cambios de perspectiva expresamente y enlázalos para su futura consolidación.

MOTOR-09 sigue siendo la entrega de administración reglamentaria y acta completas. No declares terminado el motor completo al cerrar MOTOR-08.

Entrega una PR revisable sin fusionar. Resume:

1. Qué puede probar Dennis: arranque, URL efectiva, perfil, semilla y recorrido.
2. Qué se implementó y qué decisiones ahora tienen efecto causal.
3. Qué pasó las comprobaciones y qué no se ejecutó.
4. Resultado de referencia observado, sin objetivo de calibración.
5. Salvedades cerradas, interpretaciones adicionales y limitaciones.
6. Rama, base y PR efectivas.

No informes consumo de cuota o duración de ventana si el entorno no proporciona esa información. No enumeres una decisión como «aceptada por Dennis» si solo la has interpretado tú.

## 18. Lista de aceptación

- [ ] Base contiene realmente MOTOR-07; dependencia de PR #8 resuelta o expresamente documentada.
- [ ] Tres políticas ENTREF01–03 ejecutables, sin atributos nuevos ni mejora artificial de capacidades.
- [ ] Cinco ámbitos delegables y prioridad manual respetada en los tres modos.
- [ ] Revisión por fronteras deportivas, sin ticks ni evaluación continua de quintetos.
- [ ] Rotaciones contextuales con estabilidad, relevos compatibles y posibilidad de mantener una referencia a energía 30.
- [ ] Plan de participación visible; objetivos no son obligaciones ciegas y posición nominal no prohíbe funciones.
- [ ] Librillo ordenado con protección, cierre, urgencia y elegibilidad absoluta.
- [ ] Pausas legales con motivo, reserva/cooldown, una sola aplicación de efectos y sin éxito garantizado.
- [ ] Finales cambian prioridades usando el motor común y recursos reales.
- [ ] Memoria por defensa, máximo ocho entradas, semántica deportiva, evidencia previa al acierto y decaimiento declarado.
- [ ] Respuestas compatibles y ejecutables, con sus concesiones; no hay castigo automático a la cuarta repetición.
- [ ] Entrenador sin acceso a información rival privada ni futuro aleatorio.
- [ ] Todas las constantes deportivas nuevas relevantes están en datos administrables con unidad, versión y validación.
- [ ] Perfil MOTOR-08 activable explícitamente, originales conservados.
- [ ] Registro permite distinguir observación, propuesta, autorización, espera y ejecución.
- [ ] Export/reproducción conserva el contrato, sin ejecutar decisiones dos veces.
- [ ] Salvedades de MOTOR-07 revisadas individualmente; calibración sigue SEM.
- [ ] Pruebas mínimas pertinentes y cinco partidos de integración; recorrido manual preparado y su ejecución real declarada.
- [ ] Prompt archivado íntegro, documentación temática y técnica actualizadas, PR sin fusionar.
