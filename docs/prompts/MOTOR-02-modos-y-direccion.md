# MOTOR-02 — Tres modalidades y dirección manual del partido

**Proyecto:** beM.  
**Destinatario:** Claude Code, trabajando exclusivamente en el repositorio `beM`.  
**Fecha:** 16 de octubre de 2026.  
**Estado del prompt:** preparado para ejecutar; no acredita implementación ni pruebas realizadas.  
**Punto de partida comunicado por Dennis:** MOTOR-01 integrado en `main`, arranque local y recorrido manual probados correctamente.  
**Entrega:** MOTOR-02 del roadmap aceptado. Una rama, una PR revisable, sin fusionarla.

## Índice

1. [Encargo y resultado esperado](#1-encargo-y-resultado-esperado)
2. [Autoridad y lectura selectiva](#2-autoridad-y-lectura-selectiva)
3. [Alcance y límites](#3-alcance-y-límites)
4. [Un motor incremental para las tres modalidades](#4-un-motor-incremental-para-las-tres-modalidades)
5. [Experiencia de cada modalidad](#5-experiencia-de-cada-modalidad)
6. [Órdenes, vigencia y ejecución](#6-órdenes-vigencia-y-ejecución)
7. [Controles deportivos que debe ofrecer esta entrega](#7-controles-deportivos-que-debe-ofrecer-esta-entrega)
8. [Sustituciones, tiempos muertos y administración](#8-sustituciones-tiempos-muertos-y-administración)
9. [Pantalla de partido y recorrido completo](#9-pantalla-de-partido-y-recorrido-completo)
10. [Registro y reproducción](#10-registro-y-reproducción)
11. [Datos, versiones y cobertura](#11-datos-versiones-y-cobertura)
12. [Comprobaciones automáticas acotadas](#12-comprobaciones-automáticas-acotadas)
13. [Pruebas manuales para Dennis](#13-pruebas-manuales-para-dennis)
14. [Ejecución, documentación y entrega](#14-ejecución-documentación-y-entrega)
15. [Criterios de cierre](#15-criterios-de-cierre)

## 1. Encargo y resultado esperado

Implementa MOTOR-02 completo sobre MOTOR-01. No te limites a escribir un plan ni a crear botones sin comportamiento deportivo.

El laboratorio debe permitir preparar el mismo encuentro y elegir:

- **Simulado total:** los entrenadores básicos existentes lo llevan hasta el final sin intervención obligatoria del usuario.
- **Por cuartos:** se resuelve un periodo completo, se revisa lo ocurrido y se prepara el siguiente conservando el partido acumulado.
- **Por tiempo:** se ve el partido en marcha a **x2, x4, x8 o x16**, se pausa y se dirige mediante órdenes que afectan al futuro todavía sin resolver.

Las tres modalidades utilizan las mismas operaciones deportivas, reglas, datos y azar. La velocidad pertenece a la presentación. Una pausa de pantalla no da descanso a los jugadores. La orden solicitada, su entrada en vigor y lo que los jugadores consiguen ejecutar deben poder distinguirse.

Dennis debe poder jugar un encuentro entero en cada modalidad desde la interfaz, cambiar el plan dentro del repertorio disponible, hacer sustituciones legales, solicitar un tiempo muerto y descargar un registro que permita reproducir lo ocurrido.

Mantén el objetivo del proyecto: que parezca un partido de baloncesto vivo y táctico mediante acontecimientos relevantes dentro de las posesiones. No introduzcas simulación física por segundos o milisegundos, trayectorias de diez jugadores ni un segundo motor agregado.

## 2. Autoridad y lectura selectiva

### 2.1. Lee primero lo necesario

Confirma repositorio, rama y estado de Git. Lee `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, el índice del motor, el estado de MOTOR-01 y el roadmap. Respeta cambios ajenos y la base técnica existente.

Busca las páginas temáticas vigentes que correspondan a estos capítulos del funcional unificado:

| Capítulo original | Lectura necesaria para MOTOR-02 |
|---|---|
| 15 | Ciclo de las órdenes, fronteras, precedencia y dirección en vivo. |
| 24 | Preparación, modalidades, pausa y separación entre presentación y deporte. |
| 18 | Administración y ventanas pertinentes a hechos ya activos. |
| 19 | Identidades, semilla, versiones y registro reproducible. |
| 16 | Solo rotación básica existente y relación con órdenes; las políticas completas son MOTOR-08. |
| 11–13 | Solo contratos de avance y resolución que debas adaptar. |
| 29 y roadmap | Cobertura incremental y obligaciones de esta entrega. |

Consulta también el prompt archivado de MOTOR-01 para entender sus límites, no para reconstruir lo que ya funciona. Utiliza índices y búsquedas. No vuelques el funcional completo ni releas los ocho originales o todos los prompts en cada tarea.

El diseño temático vigente y sus decisiones aceptadas prevalecen. Este prompt concreta la implementación incremental; no cambia el catálogo final. Si una versión posterior expresamente aceptada ya resuelve un campo, consérvala e indica la correspondencia.

### 2.2. Límites de autonomía

- Trabaja exclusivamente en `beM`. No abras, clones ni inspecciones `basket-manager`, BeManager, ZenGM ni otros repositorios.
- Conserva el stack, el arranque local y la organización aprobados. No migres framework ni añadas PostgreSQL, ORM, Docker, autenticación o despliegue por esta entrega. Que Dennis haya creado una base `bem` no obliga a utilizarla aquí.
- Puedes resolver decisiones técnicas internas reversibles. No inventes sistemas de juego ni nuevas políticas deportivas para completar un hueco.
- Si falta una decisión funcional indispensable no resuelta por este documento ni por el diseño vigente, señala `DECISIÓN REQUERIDA`, referencia y efecto; avanza con lo independiente. Lo expresamente diferido en el roadmap no exige volver a pedir autorización.
- No conviertas las pruebas manuales de Dennis en una exigencia de aceptación automática: prepara el recorrido y deja su revisión pendiente.

No se ha inspeccionado desde ChatGPT el código fusionado de MOTOR-01. Tu primera tarea es localizar sus contratos reales y reutilizarlos; las rutas e interfaces sugeridas aquí son referencias semánticas, no afirmaciones sobre archivos que deban existir.

## 3. Alcance y límites

### 3.1. Incluido

1. Avance incremental y suspensión segura del encuentro por acontecimientos.
2. Las tres modalidades, cuatro velocidades y pausa/continuación del visionado.
3. Plan para el siguiente periodo, también en prórroga.
4. Órdenes persistentes y llamadas puntuales con estado, ámbito y fronteras explícitos.
5. Cambios de estilos activos, prioridades, director y alternativas; llamada de fichas activas.
6. Sustituciones individuales y cambios de quinteto como solicitud conjunta validada.
7. Solicitud, cancelación cuando sea legal, concesión y consumo de tiempos muertos.
8. Precedencia entre reglamento, órdenes manuales y delegación básica existente.
9. Consulta de plan vigente, pendientes y resultado de cada solicitud.
10. Registro exportable de entradas, órdenes, hechos y estados; reproducción de un partido de esta versión.

### 3.2. Conservado de MOTOR-01

Dos equipos de doce jugadores, fichas y 32 capacidades, edición masiva, preparación, perfiles provisionales, energía, rotación básica, acta, relato y descarga. Continúa usando los datos aceptados y la semilla inicial disponible, originalmente `20261016`.

La base prevista de MOTOR-01 comprendía DIS02, ORG01 y COB01; seis fichas POS01/POS05/POS07/POS09/POS11/POS14; continuaciones y oportunidades espontáneas iniciales; tres estilos editables. Verifica la cobertura real y documenta cualquier diferencia. No reintroduzcas contenido antiguo si el repositorio contiene una corrección posterior aceptada.

### 3.3. Fuera de esta entrega

El panel completo y perfiles editables llegan en MOTOR-03; el repertorio ofensivo en MOTOR-04; las defensas en MOTOR-05; saques tácticos y ampliación espontánea en MOTOR-06; forma y momentos en MOTOR-07; políticas avanzadas del entrenador y memoria en MOTOR-08; cierre reglamentario extraordinario en MOTOR-09; estadísticas avanzadas y lotes en sus entregas.

No añadas zonas, presión total, coberturas o dobles si todavía no existen. Un selector con un único sistema puede mostrarse como información vigente, sin aparentar posibilidades implementadas. Los roles u objetivos adicionales solo se editan si su efecto real ya está implementado y documentado; no basta con guardar un campo.

No implementes guardado de carreras, persistencia entre sesiones, rebobinado con bifurcaciones, animación 2D, generador de equipos ni paquetes masivos. La reproducción solicitada aquí es repetir un encuentro desde su entrada y órdenes, no reanudar una carrera tras cerrar el navegador.

## 4. Un motor incremental para las tres modalidades

### 4.1. Una sesión deportiva y varios controladores de avance

Extrae o adapta la operación común que resuelve el siguiente acontecimiento/frontera y actualiza el estado. El simulado total la repite hasta terminar; el modo por cuartos hasta cerrar el periodo; el visionado la invoca según su control de presentación.

No mantengas una copia diferente del código de selección, duración, tiro, falta, rebote, energía o administración para cada modo. La API interna puede ser síncrona o asíncrona según el stack, pero debe poder detenerse entre operaciones sin perder información.

El estado suspendido conserva al menos lo ya utilizado por MOTOR-01: periodo, relojes, control y reanudación, fase/continuidad, participantes y responsabilidades pertinentes, quintetos, elegibilidad, acta, energía, planes, órdenes, alternancia, consecuencias pendientes y estado exacto del generador aleatorio.

No reinicialices una posesión porque se pausó, se cambió la velocidad o se abrió un panel. El tiempo de posesión no vuelve a 24 por continuar. La posesión conserva sus ventajas y compromisos pertinentes.

### 4.2. Frontera de compromiso

Una operación deportiva ya resuelta es indivisible para la intervención posterior. La interfaz muestra el último estado resuelto y la siguiente orden actúa desde una frontera todavía no resuelta que realmente exista.

No descompongas un gesto en decenas de pasos solo para poder insertar una orden. Si MOTOR-01 resuelve conjuntamente una acción y su desenlace, conserva esa unidad salvo que una frontera administrativa indispensable requiera separarla de forma localizada. No ofrezcas intervención dentro de ese gesto.

Sí deben poder distinguirse las ventanas necesarias para sustituciones, tiempos muertos y cierre de periodo. No consumas dentro de una llamada indivisible todas las reanudaciones de un cuarto si eso impide dirigir legalmente el encuentro.

### 4.3. Ejecución única y controles seguros

Solo un controlador puede avanzar una sesión. Evita temporizadores duplicados y doble ejecución al pulsar varias veces iniciar, continuar o avanzar cuarto. Cada acontecimiento, orden y gasto se procesa una vez.

Pausar cancela el siguiente avance pendiente; continuar programa uno solo. Volver a preparar otro partido invalida callbacks del anterior. Cambiar pestaña o abrir un detalle no inicia otra simulación.

El simulado total y el avance de un cuarto pueden ceder trabajo en bloques acotados para mantener la interfaz usable; ese reparto técnico no añade acontecimientos ni cambia el azar. Conserva el criterio deportivo de parada aunque el bloque técnico tenga más capacidad de trabajo.

## 5. Experiencia de cada modalidad

### 5.1. Preparación común

Selecciona modalidad antes de iniciar. Conserva equipos, semilla, quintetos, director, alternativas, estilos y libro de MOTOR-01. Identifica el equipo dirigido manualmente; el rival utiliza la delegación básica existente.

En el laboratorio se puede preparar el plan inicial de ambos equipos como ya permita MOTOR-01. Durante el partido, la dirección ordinaria corresponde al equipo seleccionado; los datos diagnósticos no conceden información extra a la IA rival.

Congela una copia de la entrada al iniciar. La edición de las fichas para un futuro encuentro no modifica el que está en curso ni sus actas anteriores.

No es requisito cambiar de modalidad a mitad del encuentro. Si ya existe esa capacidad, debe conservar una única sesión y sus órdenes; no lo utilices como excusa para ampliar el alcance.

### 5.2. Simulado total

Resuelve el encuentro completo, incluidas prórrogas, sobre el núcleo común. No exige clics entre periodos. Aplica los planes y rotación básica de MOTOR-01, además de las obligaciones reglamentarias.

La dirección automática de esta entrega no implica inventar ajustes estratégicos, optimizadores o tiempos muertos automáticos: las políticas completas siguen en MOTOR-08. Explica que se delega al entrenador básico actualmente disponible.

Terminado el encuentro, muestra las mismas salidas de resultado y registro que en las demás modalidades. No calcules un marcador independiente para luego repartir estadísticas.

### 5.3. Por cuartos

Botón inicial «Jugar primer cuarto». Al cerrar el periodo, presenta parcial, acumulado, acta, energía, faltas, quinteto y plan. No comiences el siguiente por un temporizador de fondo.

Permite preparar estilos, libro, director y quinteto del siguiente periodo dentro de la cobertura. Usa un borrador claramente separado del plan ya vigente. El botón «Aplicar plan y jugar siguiente periodo» valida y envía el conjunto una sola vez.

Una configuración inválida no arranca el periodo ni aplica la mitad. El plan se activa en la frontera adecuada del periodo objetivo. No sustituye retrospectivamente el plan del que terminó.

Antes de presentar el cierre resuelve las consecuencias pendientes que pertenezcan al periodo: por ejemplo, un lanzamiento o libres que deban administrarse por hechos anteriores a la bocina. La recuperación reglada de intervalo se aplica una vez, en una transición identificada. Indica en pantalla si la energía mostrada es anterior o posterior a ese descanso.

En empate tras el cuarto periodo ofrece jugar la prórroga, y repite si sigue habiendo empate. No reinicies faltas, estados ni recursos que el reglamento conserva. En partido terminado no ofrezcas «siguiente cuarto».

El tiempo real empleado por Dennis en revisar el parcial no produce recuperación adicional.

### 5.4. Por tiempo

Controles: iniciar/continuar, pausar y velocidades x2/x4/x8/x16. Muestra marcador, periodo y reloj con los acontecimientos ya resueltos.

Las velocidades modifican la espera de presentación entre acontecimientos con la misma referencia temporal. Puedes interpolar visualmente el reloj o actualizarlo por acontecimientos. No hace falta animación fluida por segundo. Si hay límites técnicos o redondeos de presentación, documenta su alcance; no alteres duraciones deportivas para que la velocidad aparente encaje.

No precalcules el partido entero y reproduzcas una película inmutable. No resuelvas un futuro oculto al usuario que después no pueda cambiar con sus órdenes. La pausa muestra el último compromiso deportivo; el resto aún debe poder resolverse con la nueva entrada.

El renderizado, la espera real, un navegador en segundo plano o la inspección de detalles no consumen tiradas deportivas ni dan descanso. Al volver de una pestaña oculta no simules de golpe todo el tiempo de reloj de pared transcurrido.

Entre periodos en este modo puede continuar automáticamente la presentación si no se ha pausado; la administración y descanso reglado siguen siendo los mismos. Un tiempo muerto concedido debe verse como acontecimiento y permitir revisar el plan antes de reanudar, sin obligar a esperar un minuto real.

## 6. Órdenes, vigencia y ejecución

### 6.1. Contrato mínimo

Cada solicitud conserva identificador estable, equipo y emisor, secuencia, tipo, ámbito, contenido, objetivos, frontera deportiva de solicitud, activación, duración/condición de caducidad, estado, razón y relación con órdenes sustituidas.

La frontera utiliza identificadores o secuencias deportivas, periodo y relojes. La hora del ordenador puede registrarse como metadato, pero no decide el deporte ni la reproducción.

Separa los estados que procedan: solicitada, rechazada, pendiente, vigente, suspendida por condición, consumida, caducada, sustituida y cancelada. No fuerces todos los estados sobre todos los tipos: una sustitución consumada conserva su ejecución, no necesita fingir vigencia táctica indefinida.

La solicitud, su transición y su ejecución no son tres órdenes diferentes. Una orden «vigente» puede conducir a una ejecución fallida. La recepción de una llamada no garantiza que el equipo la inicie ni que anote.

### 6.2. Ámbitos explícitos

- Estilos, prioridades, director y plan persistente: hasta sustitución válida o fin de su ámbito declarado.
- Plan de periodo: dirigido al siguiente periodo concreto; no se arrastra ocultamente a todos los futuros.
- Llamada puntual: siguiente posesión ofensiva propia; si se pide durante una posesión propia y aún queda una selección de inicio compatible, puede dirigirse a la actual. La interfaz muestra el ámbito elegido antes de confirmar. Caduca al cerrar esa posesión si no inicia.
- Sustitución: próxima oportunidad legal, salvo cancelación, sustitución o invalidez posterior.
- Tiempo muerto: solicitud y concesión reglamentarias; no equivale a la pausa del visionado.

La llamada se consume cuando comienza realmente la ficha, no al considerarla candidata. Una negación previa, falta de actor u opción directa anterior al inicio se distingue de una ficha iniciada que fracasa o continúa.

### 6.3. Precedencia y conjunto atómico

Aplica: obligaciones reglamentarias y elegibilidad; orden manual válida y específica; plan vigente compatible; decisiones delegadas; preferencias del jugador en el margen disponible.

Para el mismo campo y ámbito prevalece la última solicitud explícita válida según secuencia. Dos cambios al mismo segundo deportivo se ordenan por esa secuencia. Una nueva orden inválida no elimina la última válida.

Valida conjuntamente lo que el usuario presenta como una configuración conjunta. No apliques cuatro miembros de un quinteto si el quinto es inválido. Conserva el historial aunque una orden pendiente sea reemplazada.

La cancelación de algo pendiente no cambia la cancha. Retirar una instrucción vigente constituye otro cambio para una frontera futura válida. No permitas cancelar una concesión reglamentaria o ejecución ya consumada.

### 6.4. No reescribir las acciones comprometidas

| Solicitud | Aplicación pertinente |
|---|---|
| Ritmo, prioridad de finalización y libertad | Próxima elección relevante todavía sin resolver. |
| Prioridades del libro | Próxima selección compatible; no borra una ficha ya iniciada. |
| Director y alternativa | Siguiente asignación/elección compatible; no cambia quién ejecutó un pase anterior. |
| Llamar una ficha | Inicio compatible dentro de su posesión objetivo; conserva posibilidad de negación y lectura. |
| Disposición u organización defensiva ya implementadas | Entrada/reorganización compatible, si hay una alternativa real disponible. |
| Sustitución/quinteto | Ventana reglamentaria, con administración y participantes válidos. |
| Tiempo muerto | Oportunidad de concesión legal y recursos disponibles. |
| Plan del siguiente periodo | Entrada pertinente de ese periodo. |
| Devolver ámbito al entrenador | Siguiente decisión delegada de ese ámbito. |

No hagas que todos los cambios esperen otra posesión si existe una frontera pertinente en la actual. Tampoco los actives instantáneamente porque el usuario haya pausado la pantalla.

## 7. Controles deportivos que debe ofrecer esta entrega

### 7.1. Plan y libro

Los tres estilos activos de MOTOR-01 siguen teniendo cinco niveles. Editarlos durante el encuentro cambia sus entradas futuras en las mismas recetas que ya los consumen. No añade otro bonus de acierto.

Permite cambiar prioridades 1–5 de las seis fichas activas y compartir prioridades. Conserva selección por familia, elegibilidad, libertad y lectura del director. No multipliques las probabilidades de una familia por copiar fichas ni conviertas prioridad 1 en una obligación absoluta.

Incluye una llamada puntual de cada ficha activa. No la fuerces cuando no cumple requisitos y no sustituyas el resultado por una canasta guionizada. Las oportunidades espontáneas siguen existiendo según las reglas del perfil.

Director y alternativa deben ser jugadores elegibles. Una salida de pista no deja referencias inválidas; utiliza la alternativa declarada y registra quién decide efectivamente. No prohíbas una función por una posición nominal si el diseño permite participantes sustituibles.

### 7.2. Defensa, roles y objetivos

Muestra el sistema y cobertura vigentes de verdad. Ofrece edición solo de alternativas que ya tengan operaciones deportivas completas. Si MOTOR-01 contiene únicamente individual/drop, mantenlos e informa de la ampliación prevista; MOTOR-02 no debe implementar de improviso el catálogo defensivo.

El cambio de director, la llamada y los participantes son objetivos reales iniciales. No construyas marcas, dobles, «no abandonar» o roles nuevos como campos cosméticos. Conserva el contrato extensible de órdenes para su llegada en MOTOR-04/05/08.

### 7.3. Delegación inicial y restricciones manuales

Identifica qué dirige el usuario y qué queda delegado. Permite devolver la gestión del quinteto al entrenador básico sin borrar la historia.

Una selección manual de quinteto indica explícitamente su vigencia —para esta entrega, hasta devolver ese ámbito a automático, cambiarla o terminar el periodo—. Mientras esté vigente, el entrenador básico no la contradice por una revisión ordinaria. Las exclusiones y obligaciones sí prevalecen y se explican.

Cuando cese la restricción, el entrenador continúa con su política básica desde el estado actual. No dispara sustituciones retroactivas ni simula decisiones que no tomó. Mantén energía y utilidad selectiva: una estrella fatigada puede seguir siendo importante, pero la fijación manual no la hace inmune al cansancio.

No añadas una IA rival que consulte capacidades ocultas, energía interna rival o futuras tiradas. Conserva la separación entre información de laboratorio y conocimiento del entrenador.

## 8. Sustituciones, tiempos muertos y administración

### 8.1. Un administrador compartido

Utiliza la administración FIBA del perfil vigente, con ventanas explícitas. Consulta, si hace falta, los artículos 18–19 y las consecuencias pertinentes de la fuente oficial del proyecto:

<https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf>

Referencia comprobada para esta preparación: FIBA 2026 v1.1, vigente desde el 1 de octubre de 2026. Integra únicamente las reglas necesarias para los hechos y órdenes activos; no conviertas esta entrega en el cierre de todos los casos excepcionales de MOTOR-09.

Resumen de control: tiempos muertos de un minuto; cupos 2 en primera mitad, 3 en segunda y 1 por prórroga, sin arrastre y con restricción de los dos minutos finales. La concesión distingue balón muerto y canasta recibida. Las sustituciones tienen oportunidades propias, cierre de ventana y restricciones tras cambio. Una canasta corriente no permite sustituir siempre a ambos equipos. Verifica los supuestos completos en la fuente, sin equiparar ambas ventanas.

### 8.2. Sustituciones

Valida cinco identidades distintas, disponibilidad y asignaciones. El jugador entrante debe poder entrar en esa oportunidad concreta. El saliente permanece en cancha, acumula minutos y gasta energía hasta que el cambio se ejecuta.

Una orden válida sin ventana espera. Si cambia la elegibilidad antes de aplicarse, revalida y explica el resultado. Una exclusión obligatoria no espera a que Dennis encuentre el botón ni permite seguir compitiendo con un jugador excluido.

Conserva las restricciones a reentrada inmediata y los casos de lanzador de libres aplicables a los hechos activos. No permitas sacar al lanzador entre intentos por tratar un libre como un balón muerto genérico.

Una orden de quinteto completa se resuelve como conjunto compatible en la oportunidad legal. No sumes tiempo deportivo ficticio por cada cambio de ese conjunto.

### 8.3. Tiempo muerto deportivo

Botón propio «Pedir tiempo muerto», recursos restantes y estado de la solicitud. Una solicitud no consume el cupo hasta su concesión. Permite retirarla antes del punto reglamentario que la hace irreversible, si sigue siendo cancelable.

Si falta oportunidad, espera; si faltan recursos o la solicitud es inválida, informa y conserva el partido. Registra equipo, concesión, recurso gastado y reanudación. El reloj de juego y posesión se administran conforme a la causa, sin regalar un nuevo ataque.

Tras concederlo, permite revisar los controles activos del equipo antes de continuar. En visionado se presenta esa parada deportiva; en total o cuartos, una reproducción de órdenes puede resolverla sin intervención de pantalla. La recuperación se produce una vez por tiempo muerto concedido, nunca cada vez que se abre el panel.

No implementes todavía una política automática de cortar rachas. Tampoco concedas un fallo rival, un reset de forma o un bonus de acierto por pedirlo.

### 8.4. Recuperación: concreción provisional de esta entrega

Primero conserva cualquier dato de recuperación por tiempo muerto ya aceptado y versionado en el repositorio. Si no existe, utiliza esta semilla explícita, preparada por ChatGPT para MOTOR-02:

```json
{
  "seedExtensionId": "SEM-MOTOR02-20261016",
  "status": "SEM: provisional, no calibrado",
  "timeOutRecoveryEnergyPoints": 1.5,
  "timeOutRecoveryRecipients": "all_available_players_both_teams",
  "timeOutRecoveryApplication": "once_per_granted_time_out",
  "momentDynamics": "not_implemented_until_MOTOR07"
}
```

El valor 1,5 toma como referencia el descanso por minuto de banquillo del perfil inicial de MOTOR-01. **Es una semilla de desarrollo, no una frecuencia real ni una norma FIBA.** No autoriza a Claude a recalibrar el partido. La duración reglamentaria del tiempo muerto es una cosa; su efecto modelado sobre energía es otra.

Aplica el incremento de energía a ambos equipos, acotado a 100. No acumules además recuperación de banquillo por el mismo minuto ni minutos jugados. Conserva los descansos de periodo ya existentes sin duplicarlos. El tiempo real de la pausa visual no influye.

Forma y momentos siguen en la cobertura neutral existente hasta MOTOR-07. No introduzcas aquí atenuaciones inventadas del momento. Registra esa limitación con precisión, conservando el requisito funcional para su entrega.

Si necesitas una extensión de perfil, conserva el original sin sobrescribirlo silenciosamente, referencia su identidad y guarda la configuración efectiva completa. No declares que esta extensión completa los 81 grupos finales.

## 9. Pantalla de partido y recorrido completo

### 9.1. Información principal

Mantén una pantalla contenida con:

- Equipos, marcador, periodo, reloj y control cuando proceda.
- Modalidad, velocidad y estado de avance o pausa.
- Quinteto propio con energía y faltas; banquillo accesible para cambios.
- Plan vigente resumido y acceso a estilos, director y libro.
- Solicitudes pendientes relevantes y su razón de espera.
- Último acontecimiento y relato cronológico real.
- Acceso al acta parcial y a detalles de laboratorio separados.

No vuelques tablas de probabilidades, IDs internos o el registro JSON en el flujo ordinario. Mantén etiquetas españolas y desplazamiento cómodo para tablas.

### 9.2. Mensajes y borradores

Usa mensajes deportivos como «Cambio pendiente de oportunidad reglamentaria», «Prioridades vigentes desde la próxima elección», «Llamada caducada: terminó la posesión» o «Plan preparado para el tercer cuarto».

Lo que el usuario está editando es un borrador hasta pulsar aplicar. Abrir un panel o mover un control sin confirmar no modifica el partido. Al enviar, muestra lo pedido; al activarse, actualiza lo vigente. Una solicitud válida todavía pendiente no se pinta como ya aplicada.

### 9.3. Estados de sesión

Distingue preparación, ejecución, pausa de visionado, revisión entre periodos, tiempo muerto concedido, finalizado y error, o sus equivalentes en el stack. No confundas un descanso deportivo con la suspensión técnica del avance.

Al terminar, desactiva órdenes de juego y conserva resultado/descarga. Un nuevo encuentro parte de una entrada nueva explícita, sin heredar órdenes o temporizadores del anterior.

Si una ejecución falla, conserva la última frontera válida y diagnóstico disponible. No muestres marcador final ni certificación de partido terminado si faltó resolver una consecuencia.

## 10. Registro y reproducción

### 10.1. Fuente y contenido

Amplía el JSON descargable de MOTOR-01, reutilizando su estructura donde corresponda. Debe incluir:

| Bloque | Contenido necesario |
|---|---|
| Identidad | Versión de formato, motor, reglas, contenido y configuración efectiva. |
| Entrada | Equipos y jugadores congelados, planes, estados y semilla/generador. |
| Solicitudes | Órdenes manuales y automáticas con secuencia y anclaje deportivo. |
| Ciclo | Aceptación/rechazo, espera, activación, consumo, sustitución, cancelación y caducidad efectivamente ocurridos. |
| Hechos | Acontecimientos reales y vínculos con las órdenes pertinentes. |
| Resultado | Acta, parciales, estado final o condición de ejecución incompleta. |
| Presentación | Modalidad y cambios de velocidad/pausa como metadatos separados. |
| Cobertura | Repertorio y estados disponibles, pendientes y semilla provisional. |

No uses timestamps de ordenador como anclaje de órdenes reproducibles. Mantén una secuencia de fronteras de avance independiente de registros de renderizado o de mensajes administrativos; insertar una nota diagnóstica no debe desplazar una orden deportiva.

### 10.2. Reproducción utilizable

Añade un acceso de laboratorio «Reproducir partido desde JSON» para archivos exportados por esta versión. Valida formato, versiones y referencias antes de ejecutar. No ejecutes contenido del archivo como código.

La reproducción vuelve a calcular desde la entrada y semilla, inyectando las solicitudes registradas antes de la misma frontera deportiva que en el original. El historial de activaciones sirve para comprobar lo ocurrido, no para aplicar dos veces una orden. Las decisiones automáticas se regeneran con la misma política y se contrastan; no se duplican mediante reinyección adicional.

No basta mostrar el acta del archivo ni reproducir un relato ya cerrado. Debe reconstruirse el deporte. Permite reproducir al menos en simulado total; no es requisito un editor de replay ni importación de todos los formatos históricos.

Si la versión no es compatible, informa con claridad y no aparentes reproducibilidad. Un JSON previo de MOTOR-01 puede seguir siendo consultable si ya existe esa función; no requiere inventar equivalencia entre versiones distintas del motor.

### 10.3. Equivalencia correcta

Para la misma versión, entrada, semilla y solicitudes con los mismos anclajes deportivos, deben coincidir acontecimientos deportivos, sorteos, acta y estados finales, independientemente de modo/velocidad/pausas de pantalla.

Compara proyecciones deportivas; excluye fechas reales, duración de ejecución, formato del relato y metadatos de presentación. Una orden deportiva distinta sí puede cambiar el encuentro. Tampoco compares una dirección manual con una delegación distinta como si fueran entradas equivalentes.

No afirmes que cada intervención debe cambiar el marcador de una semilla concreta. La evidencia puede ser cambio de plan, participantes o distribución usada, aunque casualmente el tiro termine igual.

## 11. Datos, versiones y cobertura

Conserva atributos, pesos, recetas y tasas aprobados de MOTOR-01. Refactorizar para avanzar incrementalmente no justifica recalibrarlos. Si corriges un bug necesario, documenta causa, alcance y nueva versión; no fuerces el resultado para que coincida con un error antiguo.

Coloca los tipos de orden, ámbitos y fronteras en una definición explícita reutilizable. Usa las tablas/grupos existentes si ya hay estructura; no construyas ahora el mega panel. Las invariantes de administración pueden estar en código; sus constantes reglamentarias y coeficientes deportivos deben mantener identidad en datos versionados.

Conserva separados parámetros de presentación —velocidades, esperas y formato— y parámetros deportivos. Cambiar una espera no crea otro perfil de baloncesto.

Publica una tabla breve de cobertura: implementado y comprobado; implementado pendiente de revisión manual; no implementado y entrega prevista. No marques todas las capacidades, defensas, políticas o estadísticas como cerradas por disponer de sus campos.

## 12. Comprobaciones automáticas acotadas

Dennis hará buena parte de la validación manual. Haz las pruebas mínimas que protejan los riesgos nuevos, reutilizando las anteriores. No instales otra infraestructura de testing si las herramientas actuales bastan.

### 12.1. Casos focalizados

1. Pausar/continuar/cambiar velocidad no modifica estado deportivo ni generador sin avance; no duplica callbacks, hechos o recuperaciones.
2. Última orden válida del mismo ámbito sustituye a la anterior; inválida conserva la válida; configuración conjunta inválida no se aplica parcialmente.
3. Una llamada se consume por inicio y caduca si termina su ámbito sin iniciarse; una acción comprometida no se reescribe.
4. Sustitución espera ventana, revalida elegibilidad y conserva quinteto/minutos correctos; obligación reglamentaria prevalece sobre restricción manual.
5. Tiempo muerto solicitado no consume recursos hasta concesión; concesión consume/recupera una vez y no por minutos de pausa visual.
6. Cierre de periodo administra lo pendiente una vez; plan siguiente no altera periodo anterior y se contempla prórroga.

Son reglas, no un mandato de crear una prueba por cada setter. Usa estados pequeños o fixtures controlados para ventanas raras; no simules cientos de partidos hasta encontrarlas. No inventes resultados de baloncesto para obligar a que el caso ocurra.

### 12.2. Comprobación integrada de equivalencia

Usa un único escenario completo y la semilla base. Ejecuta sin órdenes manuales nuevas en total, cuartos, x2 y x16. El plan inicial y delegación deben ser idénticos; en cuartos continúa sin editar. Compara la proyección deportiva y las conciliaciones ya existentes.

Después ejecuta un encuentro completo con una secuencia determinista pequeña de solicitudes —cambio de estilo/prioridad, llamada, sustitución y tiempo muerto— ancladas a fronteras deportivas. Reprodúcelo desde el archivo y compara. Seis ejecuciones completas como referencia total para estas dos comprobaciones; reutiliza resultados y no añadas un barrido de semillas sin una causa concreta.

Las velocidades se comprueban con reloj de presentación controlado: las pruebas no esperan veinte minutos de tiempo real. x4 y x8 se verifican mediante la parametrización del controlador y recorrido de interfaz, sin otros dos partidos completos obligatorios.

Ejecuta los checks del repositorio requeridos para la entrega. Si existe una suite muy costosa, aplica las normas vigentes de pruebas acotadas y deja constancia del alcance ejecutado. No añadas cobertura por porcentaje, snapshots enormes, E2E masivos ni auditorías estadísticas de calibración.

## 13. Pruebas manuales para Dennis

Deja este plan accesible desde la documentación de la entrega, con el comando real de arranque y URL local reales del repositorio. No adivines el puerto.

| Prueba | Pasos | Resultado que revisar |
|---|---|---|
| Regresión inicial | Abrir laboratorio, editar ficha y usar +1/+3/+5. | Funciones de MOTOR-01 conservadas; la edición no altera partidos anteriores. |
| Total | Preparar y simular completo. | Termina sin clics entre periodos y conserva acta/descarga. |
| Cuartos | Jugar primero, revisar y preparar segundo. | Parcial y acumulado correctos; pausa sin futuro resuelto; cambios para el periodo objetivo. |
| Cuartos sin cambios | Continuar hasta el final. | No hay resets de energía, faltas, acta o reloj de posesión indebidos. |
| Tiempo | Empezar a x2, cambiar x4/x8/x16. | Avance perceptiblemente distinto sin saltos deportivos inventados. |
| Pausa | Pausar y permanecer un rato mirando acta/fichas. | Relojes, energía y hechos permanecen constantes. |
| Estilos/libro | Pausar, editar, aplicar y continuar. | Distingue borrador, petición y vigencia; efectos futuros reales. |
| Llamada | Llamar una ficha y seguir su estado. | Inicio, negación o caducidad explicables; no garantiza canasta. |
| Director | Cambiar director/alternativa dentro de elegibilidad. | Quién decide queda trazado desde la frontera pertinente. |
| Sustitución | Pedir cambio y revisar espera/aplicación. | No entra durante juego vivo por conveniencia; cinco jugadores válidos. |
| Quinteto | Solicitar conjunto inválido y luego uno válido. | Error comprensible; sin cambios parciales silenciosos. |
| Tiempo muerto | Solicitar, observar concesión y reanudar. | Recurso, pausa deportiva y recuperación una vez para ambos equipos. |
| Delegación | Fijar quinteto manualmente y devolver a automático. | La IA respeta ámbito manual y luego recupera su gestión básica. |
| Reproducción | Descargar e importar el JSON recién terminado. | Nuevo cálculo con el mismo resultado deportivo bajo la misma versión. |
| Nuevo partido | Terminar y preparar otro. | Sin órdenes, temporizadores o estados arrastrados accidentalmente. |

No fuerces un empate en la interfaz normal para enseñar una prórroga. Su administración puede probarse con un fixture controlado, claramente identificado como tal.

Si no puedes recorrer la interfaz en tu entorno, dilo y deja el recorrido pendiente para Dennis. No escribas que has hecho clic en pantallas que solo has leído en código.

## 14. Ejecución, documentación y entrega

### 14.1. Secuencia de trabajo

1. Localiza contratos actuales, estado y normas. Crea `feature/MOTOR-02-modos-y-direccion` o la rama equivalente exigida por el repositorio.
2. Archiva **este prompt íntegro**, incluidas tablas y semilla provisional, en `docs/prompts/MOTOR-02-modos-y-direccion.md`, o ruta equivalente ya aprobada. Registra estado real de ejecución.
3. Reutiliza el núcleo de MOTOR-01; separa avance deportivo y control de presentación. Mantén funcionando el simulado total durante la adaptación.
4. Introduce contrato de órdenes y fronteras compartidas; conecta las operaciones activas.
5. Construye modo por cuartos y modo por tiempo con controles seguros.
6. Completa sustituciones, tiempo muerto manual y precedencia con la delegación básica.
7. Amplía exportación y reproducción; preserva entradas/versiones y diagnóstico.
8. Ejecuta comprobaciones acotadas y recorrido de interfaz; corrige los fallos que impidan el objetivo.
9. Actualiza documentación afectada, mapa técnico, estado, changelog e índice/registro de prompts. Entrega commits coherentes y PR sin fusionar.

No despliegues ni fusiones la PR. Si abrirla no está disponible, deja la rama/commits preparados e identifica el impedimento concreto.

### 14.2. Documentación y trazabilidad

Mantén íntegro el funcional completo de consulta. Actualiza las páginas temáticas pertinentes y sus índices según las normas de DOC-001, sin duplicar el funcional entero dentro de la entrega ni alterar los originales históricos.

Documenta fronteras realmente implementadas, alcance de delegación, formato reproducible, perfil/semilla, cobertura pendiente y plan manual. Registra esta ampliación como implementación de decisiones aceptadas, diferenciando la semilla energética provisional de las normas deportivas.

Registra que Dennis comunicó MOTOR-01 validado manualmente; no atribuyas esa revisión a Claude. MOTOR-02 queda pendiente de su validación hasta que Dennis la confirme.

### 14.3. Consumo y continuidad

La referencia de tamaño es hasta aproximadamente el 50 % de una ventana de cinco horas de Claude Code; no es una promesa medible desde este documento. La medición de MOTOR-01 quedó mezclada entre sesiones, así que no hay un porcentaje fiable de referencia.

Si ves el indicador, registra inicio/final y condiciones de medición sin atribuir consumos de otra sesión. No añadas tareas para agotar cuota ni dejes trabajo a medias para coincidir con el contador.

Si una limitación de sesión impide acabar, conserva un checkpoint: rama/commit, último estado ejecutable, comprobaciones hechas, bloqueo y siguiente paso. No declares MOTOR-02 completo con controles decorativos ni empieces MOTOR-03 por tu cuenta.

## 15. Criterios de cierre

- [ ] MOTOR-01 conserva preparación, fichas, edición, datos, acta y recorrido local.
- [ ] Tres modalidades utilizables desde la interfaz sobre un solo núcleo deportivo.
- [ ] Cuartos y prórrogas conservan estado y permiten planificar el periodo siguiente.
- [ ] x2/x4/x8/x16, pausa y continuidad funcionan sin modificar deporte por tiempo de pantalla.
- [ ] El futuro dirigible no está precalculado como un resultado inmutable.
- [ ] Estilos, prioridades, director y llamadas activas afectan a operaciones futuras pertinentes.
- [ ] Solicitud, espera, vigencia, consumo y cierre de órdenes quedan diferenciados y explicados.
- [ ] Precedencia, reemplazo y validación conjunta conservan el último estado válido.
- [ ] Sustituciones/quintetos respetan elegibilidad, ventanas y restricciones manuales.
- [ ] Tiempo muerto manual respeta recursos, concesión, administración y efectos una sola vez.
- [ ] La delegación básica no invade ámbitos manuales ni se presenta como entrenador completo.
- [ ] JSON contiene entrada efectiva y órdenes reproducibles; importarlo vuelve a calcular el encuentro.
- [ ] Equivalencia deportiva comprobada bajo mismas entradas y órdenes; metadatos visuales separados.
- [ ] Semillas, versiones y cobertura provisional identificadas, sin afirmar cierre de los 81 grupos.
- [ ] Pruebas automáticas acotadas realizadas y plan manual accesible, con límites reales declarados.
- [ ] Prompt exacto, documentación, estado y changelog archivados; PR revisable sin fusionar.

Tu respuesta final debe indicar: qué puede probar Dennis, cómo arrancar localmente con los comandos reales, rutas del plan manual y del prompt archivado, comprobaciones realizadas, versión/semilla/perfil, enlace a PR o rama/commits y limitaciones concretas. No sustituyas esa información por un número de tests o líneas de código.
