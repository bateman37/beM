# MOTOR-06 — Transición, decisiones espontáneas y saques

**Proyecto:** beM.  
**Destinatario:** Claude Code, exclusivamente en el repositorio `beM`.  
**Fecha:** 16 de octubre de 2026.  
**Estado:** preparado para ejecutar; no acredita inspección del código ni pruebas por ChatGPT.  
**Base comunicada:** Dennis confirma MOTOR-05 integrado en `main`. El informe de Claude, anterior a esa confirmación, citaba la PR #6 abierta. Prevalece la confirmación de Dennis; comprueba el estado real de Git sin volver a tramitar una fusión ya realizada.  
**Entrega:** MOTOR-06 del roadmap, una rama y una PR revisable sin fusionar.

## Índice

1. [Objetivo y resultado](#1-objetivo-y-resultado)
2. [Decisiones sobre el informe de MOTOR-05](#2-decisiones-sobre-el-informe-de-motor-05)
3. [Fuentes, preparación y límites](#3-fuentes-preparación-y-límites)
4. [Un solo flujo de oportunidades y decisiones](#4-un-solo-flujo-de-oportunidades-y-decisiones)
5. [Transición, temprano y continuidad](#5-transición-temprano-y-continuidad)
6. [Cobertura ejecutable de ESP01–ESP20](#6-cobertura-ejecutable-de-esp01esp20)
7. [Banda y fondo: libro ofensivo y respuesta defensiva](#7-banda-y-fondo-libro-ofensivo-y-respuesta-defensiva)
8. [Tiempo, administración y controles reglamentarios](#8-tiempo-administración-y-controles-reglamentarios)
9. [Interfaz, órdenes y delegación básica](#9-interfaz-órdenes-y-delegación-básica)
10. [Panel, perfil y trazabilidad](#10-panel-perfil-y-trazabilidad)
11. [Verificación acotada y recorrido manual](#11-verificación-acotada-y-recorrido-manual)
12. [Ejecución, documentación y cierre](#12-ejecución-documentación-y-cierre)
13. [Anexo A: datos iniciales SEM](#13-anexo-a-datos-iniciales-sem)
14. [Anexo B: catálogo funcional ESP](#14-anexo-b-catálogo-funcional-esp)
15. [Anexo C: fichas de saque y respuestas](#15-anexo-c-fichas-de-saque-y-respuestas)

## 1. Objetivo y resultado

Implementa el repertorio de situaciones ESP01–ESP20 y los seis saques ofensivos con seis respuestas defensivas sobre el núcleo actual. Debe sentirse que los jugadores pueden aprovechar lo que aparece, además de ejecutar un libro.

Desde el laboratorio se debe poder jugar un partido completo que combine llamadas, recursos autónomos y decisiones directas: llegar y tirar, lanzar de tres en transición, atacar una recuperación, cortar, pasar, conservar o reorganizar según oportunidades, actor, oposición, estilo y reloj.

No impongas una cuota de juego espontáneo ni un motor separado para ello. No conviertas cada situación ESP en una jugada obligatoria o en una lotería adicional. La oposición y las consecuencias siguen existiendo aunque no haya una ficha nominal.

El saque de banda/fondo usa las mismas tareas de recepción, desmarque, pantalla, pase, negación y finalización. Su primera opción puede ser negada; puede encontrar alternativa o incumplir el plazo si no existe salida. No produce recepción libre o canasta por haber elegido una ficha especial.

Al cerrar esta entrega queda implementado el repertorio inicial: **15 fichas posicionales + 6 de saque, 6 respuestas defensivas de saque, 9 continuaciones y 20 situaciones espontáneas**. Esa cobertura no demuestra calibración ni completa estados, memoria, entrenador avanzado o estadísticas futuras.

Conserva el contrato de sencillez: acontecimientos relevantes dentro de posesiones, contexto pequeño, un solo núcleo en total/cuarto/tiempo. Nada de ticks físicos, movimientos continuos de diez jugadores, búsqueda exhaustiva de futuros ni un motor por acción.

## 2. Decisiones sobre el informe de MOTOR-05

### 2.1. Entrada y evidencia

Dennis aporta que MOTOR-05 está en `main`. El informe anterior comunica 75 pruebas, `data:check`, cinco encuentros de cierre, una matriz de desarrollo de 24 cruces y recorrido Chromium. Son comprobaciones **comunicadas**, no repetidas por ChatGPT. El test manual de Dennis sigue pendiente salvo confirmación posterior.

Reutiliza su evidencia y consulta `docs/tecnico/motor05.md` —D01–D17— y el cierre de salvedades. No apruebes los diecisiete puntos en bloque ni repitas la matriz completa como trámite de MOTOR-06.

### 2.2. Decisiones de producto sobre POS05/POS06 y POS14

Estos criterios quedan definidos por este encargo, de acuerdo con el funcional y el prompt de MOTOR-01:

| Punto | Decisión | Implementación requerida |
|---|---|---|
| Entrega inicial del director al poseedor de POS05/POS06 | **Debe existir el envío previo si el poseedor de la entrega todavía no tiene el balón.** | El pasador es quien tiene realmente el balón —habitualmente el director— y el receptor es el futuro poseedor/hub. Si el balón ya está en el hub, no añadas otro pase ficticio. |
| Director como aislador en POS14 | **El director es candidato válido**, igual que otro jugador que cumpla la función. | Elimina la exclusión nominal o de identidad que lo impida. Si recibe otro aislador, resuelve el envío real; si aísla el poseedor/director, no exige pasarse a sí mismo. |

El pase inicial de mano a mano puede formar parte de un acontecimiento compuesto cuando no añade una frontera relevante, pero conserva emisor/receptor, ejecución/oposición pertinentes y duración/exposición sin duplicaciones. No se puede tener la pelota en otro jugador solo cambiando una etiqueta.

No conviertas el pase previo en una segunda probabilidad completa de pérdida si el modelo agregado ya lo incluía. Identifica qué intervalo/cobro se reutiliza y qué hecho nuevo se representa. Tampoco concede una asistencia automática al director por alimentar al hub.

La corrección permite al director aislarse; no lo obliga a hacerlo ni le da prioridad máxima por identidad. La selección conserva capacidades, rol, vocación, contexto y la mezcla de libro/lectura vigente.

### 2.3. Coberturas en entregas e indirectos

El informe limita las coberturas a POS01–POS04. Completa la respuesta defensiva compartida necesaria para las entregas, pantallas sin balón, ESP20 y saques:

- **Mano a mano:** seguimiento/contención, cambio o compromiso de dos cuando la interacción y la configuración preparada son compatibles. Conserva quién defiende a poseedor y receptor, y qué se concede si se niega/conserva la entrega.
- **Indirectos:** seguimiento/navegación, cambio compatible y negación/corte pertinente. No copies mecánicamente drop/show/trampa sobre el receptor sin balón como si cada pantalla fuera un bloqueo directo.
- **Saques:** DSaqB02/DSaqF03 usan persecución o cambio ya representados, con actores y responsabilidades reales.

Usa DEF04/TAR04 y demás operaciones actuales; no añadas coberturas nuevas. La compatibilidad se muestra y valida. No conviertas todos los cruces en válidos ni los sustituyas silenciosamente por otro encargo.

### 2.4. Robos y marcador

Se comunica unos dos robos por equipo y partido con `stealAttemptGivenAccessP0=0.25`, y referencia 70–100 para `20261016`. **No subas esa semilla para perseguir un número de robos ni cambies el tiro para obtener otro marcador.**

Comprueba en la traza que 0,25 no se aplica dos veces al mismo intento y que acceso, decisión de intervenir, ejecución, control y crédito se distinguen. Si es un error de conexión, corrígelo y versiona. Si el mecanismo coincide con el perfil, conserva SEM y evaluación pendiente.

Una pérdida no necesita robo; un robo real necesita intervención y control, no un sorteo de crédito independiente después. No conviertas toda presión fallida o pase fuera en recuperación acreditada.

Reutiliza el escenario de referencia para conciliación y diagnóstico; no abras una campaña de calibración ni un barrido de semillas por ese tanteo.

### 2.5. Interpretaciones reglamentarias y contenido defensivo

El informe reconoce que el PDF FIBA respondió 403 en su entorno y que la «antideportiva» y los 8 segundos fueron interpretados. ChatGPT ha podido consultar la fuente oficial enlazada del proyecto para preparar §8; su edición 2026 distingue categorías que **no deben sustituirse por un régimen antiguo genérico de antideportiva**.

Contrasta los hechos activos con esa referencia y corrige lo imprescindible, incluido su impacto en saques/transición. No declares validación normativa completa ni adelantes todos los supuestos de MOTOR-09.

Las funciones declarativas de zonas se revisan contra los contratos de MOTOR-05 y el funcional al conectar recepciones/saques; corrige discrepancias causales. Una implementación técnica equivalente puede mantenerse, documentada como tal. No reescribas toda la defensa ni des por aprobados D01–D17 sin leerlos.

## 3. Fuentes, preparación y límites

### 3.1. Lectura selectiva

Confirma `beM`, Git, normas, índices y estado actual. Lee `AGENTS.md`, `CLAUDE.md`, `docs/README.md` y el roadmap. Localiza páginas vigentes correspondientes a:

| Capítulo original del funcional unificado | Consulta pertinente |
|---|---|
| 9 | Tres procedencias, ESP01–ESP20, tareas y continuaciones. |
| 10 | Banda/fondo: SaqB01–03, SaqF01–03 y DSaqB01–03/DSaqF01–03. |
| 7–8 | Solo las funciones ofensivas/defensivas que interactúan con esas decisiones. |
| 11–13 | Contexto pequeño, resolución, tiempo, exposición y energía. |
| 15 y 18 | Órdenes, ventanas y administración de hechos activos. |
| 19 | Registro, versiones y reproducción. |
| 26–29 | Panel, perfiles, cobertura y SEM. |

Consulta los contratos vigentes de MOTOR-01–05 solo donde sea necesario, especialmente las salvedades aportadas. No vuelques el funcional completo, los ocho originales o todo el historial de prompts.

Los anexos B/C conservan el contenido funcional aprobado relevante. Si existe una corrección posterior expresamente aceptada, prevalece con trazabilidad.

### 3.2. Límites

Trabaja solo en `beM`; no abras otros repositorios. Conserva stack y arranque, sin añadir PostgreSQL, framework, autenticación, Docker o despliegue.

Resuelve decisiones técnicas reversibles. Las nuevas cifras deportivas están en el anexo A o se reutilizan de referencias aceptadas; no inventes otras para evitar un hueco. Si falta una decisión o magnitud indispensable, señala `DECISIÓN REQUERIDA`, referencia/efecto y avanza con lo independiente.

No incluye memoria, Forma/momentos completos, políticas avanzadas de finales, generador de equipos, estadísticas avanzadas completas, lotes ni calibración. No añadas un octavo estilo ofensivo o un segundo control de libertad.

Sí incluye comportamiento viable con reloj corto y planes ya declarados. Eso no autoriza a construir el librillo entero del entrenador automático de MOTOR-08 ni a generar tipos extraordinarios de incidente sin administración.

## 4. Un solo flujo de oportunidades y decisiones

### 4.1. Tres procedencias, no tres motores

| Procedencia | Qué significa |
|---|---|
| Llamada del plan | Una ficha elegible se inicia por libro u orden concreta; conserva su origen y alternativas. |
| Recurso autónomo | Un actor inicia una interacción sencilla conocida —entrega, pantalla, pase y corte— sin llamada específica. |
| Decisión directa | Tira, penetra, pasa o conserva porque la situación actual lo permite/exige; no necesita ficha nominal. |

Una posesión puede nacer en una llamada y terminar en una decisión directa del receptor. Conserva ambos vínculos, sin reclasificar toda la posesión como improvisación ni atribuir una llamada inexistente.

### 4.2. Generar opciones pertinentes una vez

Desde el contexto pequeño produce únicamente candidatos que tienen participantes, acceso, control y tiempo. Filtra elegibilidad antes de preferencia. No generes veinte ramas deportivas completas ni simules sus futuros para compararlas.

ESP es un catálogo de situaciones reconocibles, no veinte botones de ataque. Una misma oportunidad puede satisfacer varias etiquetas. Representa una sola opción física/decisión, con IDs estables y etiquetas diagnósticas pertinentes; no multipliques masa ni sorteos porque coincida con ESP02/ESP03/ESP18.

Una clave semántica puede combinar actor, operación, receptor, relación de entrada, preparación y sector conocido. La forma técnica es libre; debe impedir duplicar una opción al cambiarle nombre o añadirle etiquetas. Mantén diferenciada su vía de selección y el origen de posesión.

### 4.3. Percepción, elección y ejecución

Usa el lector actual, no siempre al base. Comprensión prepara lo colectivo; Visión reconoce; Decisiones compara; Iniciativa utiliza el margen permitido; rol/vocación/preferencia orientan uso; técnica y oposición ejecutan después.

Reutiliza la mezcla plan/autonomía, sus pesos vigentes y la utilidad/riesgo estimados de MOTOR-01–04. Las distribuciones comparadas usan el mismo conjunto elegible. La IA no recibe libro privado, notas internas o futuras tiradas del rival. La resolución sí usa capacidades reales de los actores.

Una opción clara puede ganar incluso con plan rígido si la política vigente lo permite. Una dudosa compite con continuar/conservar. Poco reloj puede hacer necesario aceptar una forzada, pero no la reclasifica como cómoda ni aumenta su puntería.

ESP19 surge de una elección precipitada posible bajo la mezcla/lectura real: no es un cupo de errores ni un fallo automático que se sortea para castigar libertad. Un tirador puede rechazar una buena oportunidad sin necesidad de reducir su técnica de tiro.

### 4.4. Una resolución compartida

Tras elegir, usa las mismas operaciones de control, separación, pase, recepción, contacto, preparación, oposición, tiro, rebote y administración. Un triple espontáneo puede entrar, fallar, recibir oposición o acabar en falta; una penetración puede descargar o perder.

No hay fórmula de acierto por ESP. Las filas nuevas orientan disponibilidad/aceptación donde falte cobertura, no suman otra prima de conversión.

## 5. Transición, temprano y continuidad

### 5.1. Origen y control real

Distingue recuperación viva, rebote defensivo, puesta en juego, presión superada, rebote ofensivo y balón suelto recuperado. Una canasta recibida requiere la administración de su reanudación; un desvío/tapón no cambia control por sí solo.

Tras nuevo control, conserva quién tiene balón, apoyos pertinentes, defensores con acceso y compromisos/retorno reales. No teletransportes a la marca de referencia o al director para dirigir todo inicio.

### 5.2. Superioridad pequeña y funcional

Representa la ventaja que basta para resolver: vía hacia aro, apoyo liberado, defensor retrasado o referencia de balance no lista. No calcules posiciones/velocidades continuas de los diez jugadores ni un contador de superioridad que conceda canasta.

El avance, pase extra y finalización se resuelven con actores reales. Llegar antes puede dar opción; no garantiza control/pase/tiro. Si la defensa recupera en una interacción pertinente, actualiza la relación sin borrar su origen histórico.

El estilo Transición decide cuánto intentar aprovecharla; Ritmo organizado decide otra cosa. Transición agresiva no crea robos ni superioridades. Conservadora no prohíbe una canasta inmediata clara cuando el plan y la lectura la admiten.

### 5.3. Transición a temprano/organizado

El contexto temprano se conserva mientras la llegada y primera interacción todavía presentan esa organización incompleta, según el criterio declarado del perfil vigente. Al existir nueva organización efectiva, termina esa fase; no depende del texto de relato.

No añadas aquí una ventana arbitraria de ocho segundos para decidir que todo tiro anterior es transición. Si la política temporal ya está definida, conserva su campo y significado. Una clasificación distinta debe ser explícita y compatible con registro/estadística.

Cuando no hay ventaja aceptada, el equipo puede asegurar y organizar. La renuncia no hace perder la posesión ni obliga a lanzar. Organizar/reorganizar consume el tiempo de su operación, una vez.

### 5.4. Balance y presión heredados

Usa los encargos de MOTOR-04 y las responsabilidades desplazadas de MOTOR-05. Aplica una sola vez el coste del mismo déficit; no acumules un multiplicador de «falta balance» y otro por describir al mismo defensor como retrasado.

Una transición tras robo puede tener ya esa ventaja representada. No la borres ni la cobres otra vez. Una recuperación tras tapón se clasifica cuando hay control real, manteniendo el tiro/rebote o balón dividido que corresponda.

El esfuerzo se carga a los actores/intervalos reales y la fatiga selectiva sigue vigente. El número de frases o etiquetas ESP no multiplica gasto ni riesgo.

## 6. Cobertura ejecutable de ESP01–ESP20

El anexo B es el catálogo obligatorio. Cada entrada debe vincular contexto/requisitos, candidatos, actor que percibe/decide, tareas compartidas, continuación/cierre y registro. **No necesita una operación o probabilidad independiente por ID.**

### 6.1. Llegada y primeras ventajas

ESP01/02/03/11/18 comparten lo existente de recuperación, balance, presión y llegada. Permiten finalizar, lanzar pronto, penetrar, pasar o asegurar cuando procede. Un triple en transición no requiere iniciar aclarado ni otra ficha ficticia.

### 6.2. Creación o lectura durante juego

ESP04/05/06/07/08/09/10 permiten suspensión tras separación, primer paso, recepción libre, ataque a recuperación, corte, desajuste y poste disponible. No crean ventaja solo por evaluar la etiqueta.

El desajuste se basa en tarea/capacidades/relación pertinentes, no en una penalización genérica de posición. Un cambio no convierte por sí mismo cualquier duelo en ventaja ganadora.

### 6.3. Rebote, balón suelto y sistema roto

ESP12/13/14/15 usan control obtenido, oposición actual y tiempo. Distingue palmeo permitido de captura y nuevo tiro; protege la continuidad del rebote ofensivo. Salir fuera o reorganizar no inicia otra posesión por conveniencia estadística.

Una salida segura existe solo si un receptor/control la permite. La negación puede acabar en recurso simple, emergencia, pérdida o reloj agotado, sin tiro regalado para cerrar el relato.

### 6.4. Reloj y autonomía colectiva

ESP16/17 filtran lo que cabe en ambos relojes. Pueden consumir tiempo conforme a plan válido, tirar anticipadamente o agotar; no comprimen cualquier acción larga hasta la bocina.

ESP20 inicia una interacción sencilla conocida usando las mismas tareas de entrega, pantalla de llegada o pase/corte. No concede coordinación perfecta de un sistema complejo no preparado ni cuenta como una llamada del entrenador.

ESP19 puede coincidir con otras situaciones: se registra una elección temprana forzada/mal evaluada cuando los hechos y clasificación previa lo sostienen. No se decide que fue precipitada solo porque falló.

## 7. Banda y fondo: libro ofensivo y respuesta defensiva

### 7.1. Doce contenidos obligatorios

| Libro ofensivo | Intención |
|---|---|
| SaqB01 | Recepción segura de banda. |
| SaqB02 | Liberación de tirador desde banda. |
| SaqB03 | Corte al aro desde banda. |
| SaqF01 | Corte al aro desde fondo. |
| SaqF02 | Salida de tirador desde fondo. |
| SaqF03 | Seguridad para organizar desde fondo. |

| Respuesta defensiva | Prioridad contextual |
|---|---|
| DSaqB01 | Negar primera recepción de banda. |
| DSaqB02 | Perseguir o cambiar bloqueos de banda. |
| DSaqB03 | Presión al sacador de banda. |
| DSaqF01 | Proteger aro desde fondo. |
| DSaqF02 | Negar objetivo principal desde fondo. |
| DSaqF03 | Perseguir o cambiar bloqueos de fondo. |

Utiliza los requisitos/alternativas del anexo C. Las seis respuestas no se suman simultáneamente. Cada una orienta un encargo principal compatible con obligaciones, sistema, cobertura, marcas y restricciones vigentes.

### 7.2. Preparación y selección

Libros de banda y fondo separados del posicional. Permite activar fichas y prioridad 1–5 compartida siguiendo el contrato existente; no añadas cuotas ni calidad por prioridad.

Configura sacador preferido y alternativa, receptor/objetivo cuando proceda, participantes sustituibles y seguridad. Un sacador está fuera del campo durante el saque y no puede ocupar a la vez su recepción inicial.

Box/stack/diamond pueden ser referencias de entrada internas compatibles, sin añadir disposiciones al selector general de seis ni exigir coordenadas. Usa solo colocaciones necesarias para las seis fichas.

La ficha solo es elegible en un saque de origen/condición compatible. Un saque administrativo de centro u otro origen no se convierte en banda/fondo porque sea cómodo para usar una ficha. Conserva su administración y entrada segura existentes.

Las reanudaciones ordinarias tras canasta pueden usar la entrada segura de fondo cuando sea compatible, sin obligación de preparar un bloqueo complejo en cada canasta. La tramitación rápida no regala una recepción ni ignora la presión rival.

### 7.3. Secuencia ofensiva

Con el balón a disposición, prepara la primera referencia y su ejecución pertinente. Si se niega, evalúa alternativa/seguridad que quepa en el plazo restante. El plazo no vuelve a empezar por mirar otro receptor o reemplazar una llamada.

El sacador y su oposición son actores reales. Una recepción se resuelve contra defensor/negación, con pantalla/desmarque solo si existen. Una línea negada no recibe el mismo peso pequeño que una línea imposible: la elegibilidad ya debe distinguirlas.

No exijas siempre primera opción → alternativa → seguridad. Una primera opción viable puede resolverse inmediatamente; la negación puede llevar a otra, a error, desvío, falta o infracción. No añadas varios sorteos de pérdida para describir un único envío.

Al entrar el balón y establecerse la relación pertinente, continúa con las nueve CONT y el mismo núcleo. El sacador puede incorporarse después como participante cuando sea legal/funcional, sin aparecer como receptor de su propio envío inicial.

### 7.4. Defensa y concesiones

Negar principal puede abrir corte o alternativa; perseguir/cambiar deja responsables reales; proteger aro puede conceder exterior; presionar al sacador compromete a su defensor y no le permite ayudar simultáneamente en otro lado.

No abandonar y perseguidor de box and one mantienen sus restricciones. Si sale el objetivo, aplica alternativa/suspensión vigente; no inventes un receptor principal rival a partir de su libro privado. La defensa puede responder al objetivo visible/designado u observación permitida, no leer el plan ofensivo oculto.

Las sustituciones/tiempos muertos se administran por ventanas; si cambia un participante antes del saque, revalida funciones. No usa al jugador ya retirado ni restaura una instrucción sustituida.

### 7.5. Producción directa y continuación posterior

La secuencia directa de saque empieza con su ejecución efectiva y termina por resultado o nueva organización pertinente. No termina necesariamente en el primer pase ni después de un número fijo de segundos.

Conserva origen de saque y su cadena aunque luego se organice una posesión. No cuentes los puntos posteriores otra vez como producción directa del saque. El cierre de esta cadena analítica tampoco crea otra posesión reglamentaria/estadística por sí mismo.

Registrar la frontera basta para las estadísticas futuras; no construyas ahora todo el informe avanzado de saques ni atribuyas una asistencia automática al sacador.

## 8. Tiempo, administración y controles reglamentarios

### 8.1. Tres tiempos distintos

Separa el plazo administrativo de sacar, el reloj de juego y el reloj de posesión. La pausa de interfaz es otra cosa: no consume plazo deportivo ni concede recuperación por reloj de pared.

Durante preparación del saque usa tiempo administrativo declarado. El momento legal de activación de relojes pertenece al administrador; no descuentas sin más todo ese intervalo del reloj de juego. Mantén separado su eventual coste de tarea, si existe en el modelo, de minutos jugados/descanso que no hayan ocurrido.

Reutiliza la administración de límites y consecuencias. Un desvío, captura, último libre o entrega de posesión por sanción no se tramita como nuevo control genérico. No repongas siempre el reloj al entrar por banda/fondo.

### 8.2. Referencia oficial verificada para esta preparación

Fuente: [FIBA Official Basketball Rules 2026 v1.1](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf), consultada el 16/10/2026. Resumen acotado de los puntos que requieren contraste:

<!-- INICIO_RESUMEN_NORMATIVO -->
- Art. 17.3: el sacador dispone de cinco segundos para soltar el balón.
- Art. 28: el avance en ocho segundos depende de control y entrada en pista delantera; ciertas reanudaciones conservan el tiempo restante.
- Arts. 37–38: **disruptive** y **flagrant** son categorías distintas. Interrumpir transición o reloj mediante contacto innecesario puede corresponder a la primera; no a una «antideportiva» genérica heredada.
- Arts. 38.2.3 y 41.4: dos flagrant, dos técnicas de categoría 1 o una de cada implican descalificación; no se aplica esa regla automáticamente a dos disruptive.
- Arts. 37.2/38.2: libres y derecho posterior dependen del hecho y acto de tiro; no siempre son dos libres.
- Arts. 17.2.7/29.2.6: la reanudación de esas sanciones tiene lugar y reloj específicos.
- Art. 16.2.5: recibir/controlar y lanzar requiere al menos 0,3 segundos; con 0,2/0,1 solo las finalizaciones directas previstas son admisibles.
<!-- FIN_RESUMEN_NORMATIVO -->

Esta referencia corrige una posible interpretación de implementación; no cambia la decisión funcional de usar FIBA 2026. No sustituye el análisis de los supuestos concretos del perfil, ni exige generar nuevas faltas ajenas al repertorio.

Si el PDF sigue inaccesible en el entorno, deja registrado el impedimento. Utiliza los artículos y el resumen contrastado de este encargo para los casos cubiertos, sin afirmar que has leído el PDF. Si un supuesto indispensable supera lo cubierto, pide el contenido exacto o identifica la decisión/evidencia faltante; no uses memoria de otra edición.

### 8.3. Corrección localizada de sanciones activas

Comprueba qué tipo de contacto genera ESPD01 y cómo se etiqueta/administra. Un simple alias de interfaz puede conservarse si el código tiene significado inequívoco, pero un único contador antiguo con expulsión automática para categorías distintas debe corregirse.

No añadas sucesos violentos ni amplíes todo el catálogo de técnicas para probar esta distinción. Garantiza solo que los hechos que sí se producen se clasifican/administran con el perfil y quedan trazables. Los supuestos extraordinarios completos siguen en MOTOR-09.

### 8.4. Con poco reloj

Filtra tareas por duración y tipo admisible antes de resolver. Una recepción con lanzamiento no se comprime para caber donde solo cabe una finalización directa. Si no hay opción legal, conserva la consecuencia del límite.

La selección puede priorizar una opción imperfecta viable frente a una secuencia mejor que no cabe. No concede un tiro milagroso tras cada negación ni corrige el marcador por necesidad narrativa.

## 9. Interfaz, órdenes y delegación básica

### 9.1. Preparación

Mantén jugadores, doce por equipo, 32 capacidades, edición masiva, siete estilos, seis disposiciones, roles/directores y defensa de MOTOR-05.

Añade apartados de libro **Banda** y **Fondo**, con las tres fichas respectivas, prioridad, sacador/alternativa y ficha consultable. La defensa configura respuesta de banda/fondo y objetivos/restricciones necesarios sin activar combinaciones incompatibles.

ESP no añade veinte interruptores al entrenador. Se orienta mediante controles actuales: transición, libertad, elaboración, ritmo, riesgo, selección de tiro, roles y tendencias de entrada. El catálogo es consultable en laboratorio/panel con cobertura real.

### 9.2. Dirección en los tres modos

Conserva total, por cuartos y por tiempo x2/x4/x8/x16. Planes y órdenes utilizan el contrato de MOTOR-02. La llamada de saque declara el próximo saque compatible de banda/fondo y una caducidad visible; no queda escondida durante periodos indefinidos.

Para este incremento, una llamada puntual de saque se dirige al siguiente saque compatible propio dentro del periodo actual; se consume al iniciar la ficha, o caduca al acabar el periodo si no lo hubo. No lo consume otro origen incompatible. Un plan persistente de banda/fondo sigue siendo distinto de esa llamada puntual.

Una configuración o llamada imposible se rechaza con motivo y conserva la última válida. No se aplican órdenes en medio de una resolución ya comprometida. Un cambio para el cuarto siguiente no altera el saque anterior.

El automático básico puede elegir ficha elegible del libro por sus prioridades/lectura actuales y ejecutar opciones según las operaciones compartidas. No necesita otra IA ni políticas estratégicas nuevas; sigue sin información oculta.

### 9.3. Pantalla contenida

Muestra marcador/reloj, control, plan, pendientes y relato. Cuando importa, explica «aprovecha la recuperación», «triple en transición», «primera recepción negada», «salida segura» o «llamada caducada» desde hechos reales.

El diagnóstico queda ampliable. No llames «ESP02» al botón del flujo ordinario ni muestres fórmulas al entrenador. No requiere animación 2D ni desplazamientos de todos los jugadores.

## 10. Panel, perfil y trazabilidad

### 10.1. Mismo sistema administrable

Amplía SEL03/05/06/08/09/10/11/12, CON03/04, DEF08 y los grupos RES/ACT/ENT07 pertinentes. Mantén sus IDs y responsables; no declares completos DEF09/memoria o estados por registrar una fila futura.

Cada campo nuevo tiene nombre legible, tipo, unidad, referencia, límites, consumidor, origen SEM y versión. Muestra diferencias entre frecuencia/disponibilidad, percepción/aceptación, ejecución, coste y clasificación.

No dejes probabilidades o tiempos nuevos ocultos por ID de ESP/saque. El contenido referencia operaciones/recetas comunes. Las definiciones pueden ser consultables en Repertorio; la edición permitida de pesos/condiciones soportadas debe estar accesible en la tabla maestra/detalle.

El perfil candidato conserva herencia, validación y configuración efectiva. No migres silenciosamente un activo anterior ni sobrescribas planes guardados. El partido iniciado no cambia sus números cuando se activa otra versión.

### 10.2. Ejes y denominadores

Registra por separado contexto de entrada, procedencia de decisión, preparación, sector conocido, calidad previa y resultado. Son cruces: un triple de transición también es triple, pero no otro intento adicional.

Para las consultas iniciales usa solo datos calculados:

| Consulta | Numerador / denominador |
|---|---|
| Uso directo inicial | Ataques iniciados por decisión directa / ataques elegibles del contexto declarado. |
| Triple de transición | Intentos de tres en transición / tiros de transición; por posesión es otra tasa con otro nombre. |
| Aceptación inmediata | Oportunidades percibidas aceptadas / oportunidades percibidas elegibles comparables. |
| Familia autónoma | Ejecuciones familiares sin llamada / ejecuciones de familia del universo comparable. |
| Temprano forzado | Tiros tempranos con calidad previa forzada / tiros tempranos. |
| Primera opción de saque | Inicios/recepciones reales, con exposición y negaciones declaradas, sin mezclar solicitudes con ejecuciones. |

Si una opción fue elegible pero no percibida, no la cuentes como rechazo consciente. Si no se registra una capa, indica no disponible; no la reconstruyas desde el fallo del tiro. Un denominador cero es no calculable, no cero observado.

No hace falta construir el catálogo estadístico avanzado ahora. Sí conservar hechos/relaciones y una lectura diagnóstica sencilla que permita investigar el repertorio. Las tasas empíricas externas sin definición comparable no se cargan como objetivos.

### 10.3. Reproducción y exportación

Incluye versiones, entrada congelada, configuración efectiva, semilla, órdenes, candidatos/decisiones realmente diagnosticados y vínculos entre posesión, origen, ficha, saque y continuación.

La reproducción vuelve a calcular con esos valores y anclajes deportivos. Cambiar velocidad o consultar un detalle no consume RNG. Las correcciones de esta entrega pueden cambiar resultados entre versiones; declara la nueva versión sin intentar imitar un bug anterior.

Conserva rechazo explícito de exports incompatibles anteriores y sus archivos intactos. No se exige implementar motores antiguos. No conviertas el JSON de un encuentro en el paquete masivo general de MOTOR-12.

## 11. Verificación acotada y recorrido manual

### 11.1. Checks nuevos por riesgo

Reutiliza las herramientas existentes. Casos pequeños/parametrizados deben cubrir:

1. Pase previo real en POS05/06 y director elegible en POS14, sin autoenvíos ni doble tiempo/riesgo.
2. Catalogación ESP01–20 con requisitos y consumidores; una opción etiquetada varias veces no multiplica masa ni sorteos.
3. Decisión directa y recurso autónomo mantienen origen/actor, ejecución compartida y calidad previa; no se asigna ficha falsa por el desenlace.
4. Recuperación/control, presión superada, rebote ofensivo y reorganización conservan continuidad/balance/oposición pertinentes.
5. Mano a mano/indirecto y defensa de saque aplican respuestas compatibles y responsables reales, sin copiar cuatro coberturas a toda acción.
6. Cada una de las seis fichas de saque y seis respuestas tiene una ruta funcional alcanzable en un contexto compatible; no exige un partido por pareja.
7. Sacador/receptor distintos; primera opción negada admite alternativa real o infracción, no salida garantizada.
8. Plazo de saque, activación de relojes, poco tiempo y cierre de secuencia directa correctos según los casos activos.
9. Sanciones activas contrastadas y ocho segundos corregidos solo donde proceda; no sorteo de crédito de robo duplicado.
10. Panel, validación de referencias/perfil, export y órdenes nuevas llegan a consumidores sin alterar históricos.

Los veinte ESP se pueden cubrir en una tabla de casos controlados y pocas pruebas parametrizadas. No se añaden veinte encuentros, una suite por ID ni snapshots gigantes.

### 11.2. Partidos completos

Referencia de cierre: **cinco ejecuciones completas**, reutilizadas para conciliación y diagnóstico:

- Base de la nueva versión con el plan conservado y semilla de referencia `20261016`.
- Variante orientada a transición/libertad para inspeccionar decisiones y concesiones, sin exigir más puntos o victorias.
- Variante con libros/respuestas de banda y fondo configurados, sin forzar artificialmente una cantidad de saques en el partido normal.
- Encuentro con guion breve de llamadas/cambio de sacador/orden defensiva en fronteras deportivas reproducibles.
- Reproducción de una ejecución anterior de esta lista en otro modo, con entrada y órdenes idénticas.

Los casos raros de saque o reloj se prueban con estados controlados. No simules cientos de partidos esperando que ocurran. No repitas la matriz de 24 organización×cobertura de MOTOR-05 por rutina ni la conviertas en requisito de todas las entregas.

Reutiliza checks de marcador, acta, tiros/intentos, minutos, quintetos, energía, control, relojes y referencias. Ejecuta los checks requeridos pertinentes del repositorio. Amplía solo por fallo o riesgo concreto, no para acumular cantidad de tests.

### 11.3. Recorrido manual para Dennis

Publica `docs/prompts/MOTOR-06-recorrido-manual.md` o equivalente aprobado, con comandos/URL reales. El informe anterior verifica `npm run dev` → `http://localhost:5173/`; comprueba que siguen siendo esos.

| Prueba | Qué revisar |
|---|---|
| Salvedades | POS05/06 reciben el envío inicial cuando corresponde; director puede ser aislador; cierre reglamentario localizado explicado. |
| Sin ficha | Tiro/penetración/pase directo existen sin inicio nominal falso. |
| Llegada | Puede aparecer triple temprano/transición, pase extra o conservación sin cuotas. |
| Actor posterior | Receptor corto, hub y recuperador leen con sus capacidades. |
| Decisión mala posible | Un forzado temprano puede existir; no se etiqueta solo por fallar ni garantiza error. |
| Continuidad | Rebote ofensivo/desvío conservado no reinician posesión; presión superada no recoloca cinco defensores. |
| Libros | Banda y fondo separados, seis fichas y prioridades compartidas. |
| Participantes | Sacador/alternativa y receptores válidos; cambio de quinteto revalida. |
| Negación | Primera opción puede fallar y salir por otra o terminar sin envío válido. |
| Defensa | Seis respuestas con concesiones, cobertura compatible y restricciones de no abandonar/box and one. |
| Poco reloj | No hay recepción y tiro imposible ni acción larga comprimida. |
| Caducidad | Llamada puntual espera solo su saque compatible dentro del periodo declarado. |
| Panel | Nuevos datos SEM visibles y editables cuando corresponde, con consumidores. |
| Diagnóstico | Origen, preparación, calidad y resultado separados; tasas con muestra/denominadores. |
| Reproducción | JSON actual reproduce bajo su versión; incompatible se rechaza con explicación. |
| Regresión | Tres modos, pausas, tiempos muertos, defensa, fichas, doce jugadores y edición masiva siguen utilizables. |

No registres pruebas manuales de Dennis hasta que confirme. Si tu entorno no permite UI real, informa qué recorrido queda pendiente; no afirmes clics por leer código. No instales navegadores/herramientas adicionales como trámite si no son necesarios para el entorno aprobado.

## 12. Ejecución, documentación y cierre

### 12.1. Secuencia

1. Confirma base actual de `main`, normas y dependencias. Crea `feature/MOTOR-06-transicion-y-saques` o equivalente según entorno/normas.
2. Archiva este prompt íntegro, anexos incluidos, en `docs/prompts/MOTOR-06-transicion-y-saques.md` o equivalente aprobado; registra su estado real.
3. Aplica las correcciones de participantes de §2 y contrasta lo reglamentario imprescindible. Conserva evidencia y versiones.
4. Integra candidatos/etiquetas ESP en la elección común; conecta transición/continuidad y cobertura compartida necesaria.
5. Carga seis fichas y seis respuestas de saque; conecta administración, alternativas, llamadas y continuidad.
6. Completa preparación/dirección y el panel/perfiles existentes, con diagnóstico/exportación/reproducción.
7. Ejecuta checks y partidos acotados, recorre UI cuando sea posible y corrige fallos del objetivo.
8. Actualiza páginas temáticas, índices, mapa técnico, cobertura, estado, changelog y catálogo de prompts. Añade `docs/tecnico/motor06.md` o equivalente con cierre de salvedades y criterios de clasificación.
9. Entrega commits coherentes y PR sin fusionar. Si el entorno usa otra rama de PR, explica relación y commits. Si no puedes abrirla, deja el trabajo preparado e identifica el impedimento.

Preserva funcional íntegro de consulta y originales históricos; no generes otro mega funcional duplicado. Los cambios de implementación, datos SEM y evidencia de evaluación tienen estados distintos.

### 12.2. Tiempo de sesión y pruebas

Referencia de tamaño: hasta aproximadamente el 50 % de una ventana de cinco horas de Claude Code, sin garantía ni porcentaje inventado. Si es medible, registra inicio/final y si hubo mezcla de sesiones; si no lo es, dilo.

No añadas trabajo para consumir cuota. Si no puedes terminar en la sesión, conserva checkpoint con rama/commit, último estado ejecutable, comprobaciones reales, bloqueo y siguiente paso. No declares terminado un catálogo solo por aparecer en la interfaz ni empieces MOTOR-07 sin encargo.

Automatización justa y revisión manual relevante por Dennis. No regreses a matrices masivas por entrega, tests espejo o simulaciones sin pregunta concreta.

### 12.3. Criterios de cierre

- [ ] Dependencias de `main` conservadas y dos decisiones de participantes de MOTOR-04 implementadas.
- [ ] Salvedades normativas/defensivas de MOTOR-05 contrastadas en su alcance pertinente, sin aprobación ciega de D01–D17.
- [ ] ESP01–ESP20 ejecutables en contextos compatibles, sin cuotas ni doble masa por solapamiento.
- [ ] Llamada, recurso autónomo y directo usan un mismo núcleo y conservan origen/lector real.
- [ ] Transición, temprano, balance y recuperación conservan relaciones y costes sin recolocación ni doble cobro.
- [ ] Seis fichas y seis respuestas de saque activas, sacador/alternativas/seguridad reales.
- [ ] Defensa de entregas/indirectos/saques usa respuestas compatibles y responsabilidades de los participantes.
- [ ] Relojes/plazos/urgencia y sanciones de hechos activos administrados; sin canastas o recepciones garantizadas.
- [ ] Secuencia directa de saque y producción posterior tienen frontera y vínculo sin dobles conteos.
- [ ] Controles nuevos reutilizan órdenes y panel actuales; no añaden otro control de libertad ni motor separado.
- [ ] Datos/perfiles congelados, versiones, reproducción, rechazo de incompatibilidad y trazas correctos.
- [ ] Diagnóstico separa ejes y denominadores, sin estadísticas o alternativas inventadas.
- [ ] SEM y cobertura pendiente explícitos; no se afirma calibración ni cierre de estados/entrenador/memoria.
- [ ] Comprobaciones acotadas y recorrido manual entregados con su estado real.
- [ ] Prompt íntegro y documentación en Git; PR revisable sin fusionar.

Respuesta final breve: qué puede probar Dennis, arranque/URL reales, semilla/perfil, decisiones cerradas y pendientes con evidencia, comprobaciones hechas, recorrido/prompt, PR o rama/commits y limitaciones. No uses el número de tests o un marcador como certificación de realismo.

## 13. Anexo A: datos iniciales SEM

### 13.1. Identidad y precedencia

Propuesta de ChatGPT para los campos nuevos no cubiertos por el perfil efectivo aceptado. **No son frecuencias reales ni calibración.** Reutiliza valores y recetas existentes cuando ya representen la responsabilidad; no aplica dos veces esta extensión y su equivalente antiguo.

```json
{
  "id": "SEM-MOTOR06-20261016",
  "status": "SEM: provisional, no calibrado",
  "scope": "Oportunidades ESP y banda/fondo sobre el núcleo vigente",
  "opportunities": {
    "newEligibleActionBaseWeight": 1,
    "perceivedQualityChoiceWeight": {"comfortable": 1.5, "normal": 1, "forced": 0.6},
    "sharedSituationLabelsMultiplyWeight": false,
    "independentRandomOpportunityPerEspId": false,
    "newUrgencyReferenceSeconds": 5,
    "newUrgencyContinuationWeightFactor": 0.4
  },
  "throwIns": {
    "newOptionPreparationSeconds": [0.2, 1, 2.5],
    "newReleasePassSeconds": [0.1, 0.3, 0.7],
    "eligibleVariantBaseWeight": 1,
    "priorityWeights": [8, 5, 3, 2, 1],
    "defaultBandOffensivePlan": "SaqB01",
    "defaultEndlineOffensivePlan": "SaqF03",
    "defaultBandDefensiveResponse": "DSaqB01",
    "defaultEndlineDefensiveResponse": "DSaqF01",
    "pointCallScope": "next_compatible_own_throw_in_within_current_period",
    "directSequenceEnd": "resolved_outcome_or_relevant_new_organization_not_fixed_seconds"
  },
  "sharedResolution": {
    "newSymmetricAccessTaskReferenceP0": 0.5,
    "inheritTaskSensitivityAndActorRecipes": true,
    "newShotConversionBonus": 0,
    "newGlobalStealTarget": null
  },
  "existingPlans": {
    "overwriteSavedPlayerRoles": false,
    "activateNewProfileSilently": false,
    "independentDefensivePriorityTotals": false
  }
}
```

### 13.2. Interpretación de los campos

**Opciones ESP.** El peso base 1 solo completa una opción nueva que no tiene preferencia previa. La calidad percibida orienta elección; usa estimación previa disponible para el actor, no el resultado futuro. Si la elección vigente ya pondera esa calidad, conserva esa receta y no multipliques de nuevo 1,5/1/0,6. Este anexo no redefine la mezcla de libro, libertad, Iniciativa, vocación, rol y utilidad aceptada.

Una etiqueta compartida no cambia el peso. No se sortea una oportunidad por cada ESP. Usa las relaciones reales que producen el núcleo y las referencias compartidas para los accesos nuevos indispensables. Una tarea binaria simétrica todavía sin referencia puede usar 0,5 y sensibilidad/receta vigentes; no es 50 % de tiro ni de cumplimiento del saque.

**Urgencia.** Si ya hay criterio de urgencia aceptado, consérvalo. Si no, la referencia inicial es cinco segundos del reloj efectivo limitante. El factor 0,4 reduce el peso de continuaciones que **todavía son viables**, sin crear viabilidad ni alterar calidad/acierto. Las que no caben se excluyen por sus duraciones. No dupliques ese factor con otro ajuste de urgencia equivalente ni desarrolles políticas estratégicas completas de final.

**Duraciones de saque.** Las triangulares son semillas para la preparación de una opción y la ejecución del envío si el modelo carece de sus duraciones. La primera cubre preparación hasta soltar el balón y consume plazo administrativo. Para esta semilla, la segunda representa el intervalo resumido entre la suelta y el primer toque legal: no prolonga el plazo de soltar ni descuenta reloj de juego antes de su activación. El administrador determina la frontera aplicable; no se modela una trayectoria física. No cargues ambos intervalos automáticamente al reloj de juego.

Si una pantalla/pase ya está incluida en la operación compuesta elegida, no añadas su tiempo otra vez. Si una negación obliga a probar otra opción real, consume solo el intervalo adicional que esa evaluación/acción representa. El plazo no se reinicia. No recortes un intervalo para que siempre quepa.

**Prioridades y valores iniciales.** Los pesos 8/5/3/2/1 son la semilla vigente de prioridades, no nuevos porcentajes. Si el sistema ya tiene otra versión aceptada, conserva esa. La respuesta defensiva elegida se interpreta como un encargo contextual, no seis porcentajes sumados.

Para entradas antiguas sin libro de saque, crea una candidata explícita con SaqB01 y SaqF03 activas a prioridad 3 y las respuestas DSaqB01/DSaqF01 identificadas. Es una precarga de desarrollo para jugar, no una recomendación de mejor táctica. No sobrescribas un plan ya configurado por Dennis ni una base publicada.

El sacador preferido inicial procede del plan si existe; en otro caso la política funcional selecciona un jugador disponible por la receta de Pase vigente y roles compatibles, con desempate estable, sin inventar un ID fijo. La alternativa usa otro elegible. Tras el envío, receptor y sacador siguen siendo actores distintos en esa primera interacción.

### 13.3. Datos que este anexo no introduce

No fija un porcentaje profesional de improvisación, cuota de triples de transición, objetivo de robos ni tanteo. No añade referencias de tiro, nuevos atributos, tendencias por variante, cuarto modo de partido o sistema de memoria.

Las definiciones regulatorias no son parámetros de balance SEM: proceden del componente reglamentario vigente y no se cambian para ajustar ratios.

## 14. Anexo B: catálogo funcional ESP

Extracto del funcional unificado, capítulo 9.8, procedente de MD07 §21. Conserva requisitos y solapamiento; no obliga a una probabilidad particular por fila.

*Procedencia: MD07, §21.*

### 14.1. Catálogo conservado

*Origen: MD07 §21.1.*

| ID | Situación | Opciones que deben poder elegirse | Condición pertinente |
|---|---|---|---|
| ESP01 | Recuperación con camino al aro. | Finalizar, avanzar o pasar al mejor situado. | Control, balance rival, velocidad y reloj. |
| ESP02 | Triple en transición. | Tirar, conducir o dar pase adicional. | Espacio percibido, técnica y oposición que llega. |
| ESP03 | Llegada temprana con espacio exterior. | Triple o media inmediata, o continuidad. | Preparación, riesgo de esperar y perfil. |
| ESP04 | Pequeña separación tras bote. | Suspensión de dos/tres, nuevo bote o pase. | Preparación en movimiento, distancia y contención. |
| ESP05 | Primer paso disponible. | Penetrar, parar y tirar o dividir/descargar. | Manejo, aceleración, defensor y ayuda. |
| ESP06 | Recepción liberada sin llamada. | Tirar o atacar recuperación. | Preparación, cierre defensivo y decisión. |
| ESP07 | Recuperación defensiva tardía. | Atacar espacio o pasar hacia la ayuda abandonada. | Relación actual y ejecución pertinente. |
| ESP08 | Corte espontáneo. | Cortar/recibir o fijar sin recibir. | Movimiento, lectura y responsabilidad rival. |
| ESP09 | Desajuste reconocido sin aclarado llamado. | Atacar, buscar posición o continuar el plan. | Desajuste pertinente y ayuda disponible. |
| ESP10 | Poste disponible tras transición o cambio. | Sellar/recibir, finalizar o sacar balón. | Posición, pase y defensa actual. |
| ESP11 | Presión superada. | Finalizar ventaja, pasar o asegurar. | Control y defensores recuperando. |
| ESP12 | Rebote ofensivo próximo. | Palmar/finalizar, asegurar o pasar fuera. | Control, oposición y reloj. |
| ESP13 | Rebote ofensivo con exterior disponible. | Pase fuera y tiro, circulación o reorganización. | Captura, envío, recepción y recuperación rival. |
| ESP14 | Balón suelto o desvío recuperado. | Finalizar si procede, proteger/pasar o reorganizar. | Control realmente obtenido. |
| ESP15 | Sistema negado o roto. | Recurso sencillo, penetración, seguridad o emergencia. | Tiempo, capacidades y presión. |
| ESP16 | Final de posesión. | Tiro viable, penetración corta, pase realizable o agotamiento. | Reloj real. |
| ESP17 | Última acción de periodo. | Consumir tiempo pertinente, anticipar o pasar. | Ambos relojes, margen y órdenes. |
| ESP18 | Oportunidad muy clara antes de colocación. | Aprovechar aro o recepción inmediata. | Permiso, percepción y seguridad. |
| ESP19 | Precipitación sin buena ventaja. | Tiro temprano forzado o penetración mal escogida. | Decisiones, iniciativa, presión y límites. |
| ESP20 | Recurso autónomo colectivo sencillo. | Entrega, pantalla de llegada o pase y corte conocidos. | Funciones comprensibles y capacidades reales. |

### 14.2. Uso y solapamiento

*Origen: MD07 §21.2.*

Las situaciones describen disponibilidad y contexto. Una recepción puede pertenecer a varias descripciones; eso no le concede varios pesos completos por la misma causa ni varias tiradas de aceptación.

Los candidatos mantienen origen de decisión y preparación. Transición, temprano, llamada, autonomía, directo y calidad son ejes distintos. Un tiro temprano puede venir de ficha; un tiro sin asistencia puede estar llamado.

### 14.3. Frecuencias

*Origen: MD07 §21.3.*

Cada situación tiene preferencias y condiciones explícitas en SEL/RES. No se fuerza un porcentaje por fila para demostrar su existencia. Se mide oportunidad, percepción, elección y resultado con denominadores compatibles.

Si una situación nunca aparece donde debería ser posible, se revisa primero su elegibilidad y exposición. No se aumenta directamente acierto para hacerla visible en el marcador.

Las frecuencias externas solo se usan con definiciones comparables. No se deduce «sin jugada» como complemento automático del ataque organizado ni se copia un reparto NBA como obligación del perfil FIBA.

## 15. Anexo C: fichas de saque y respuestas

Extracto del funcional unificado, capítulo 10.2, procedente de MD07 §20. Es contenido funcional aprobado; las recetas/tiempos se consultan en el perfil común y la extensión SEM anterior cuando falte cobertura.

*Procedencia: MD07, §20.*

### 15.1. Contrato común

*Origen: MD07 §20.1.*

SaqB01–SaqB03 corresponden a banda y SaqF01–SaqF03 a fondo. El sacador, su oposición, los receptores y el plazo reglamentario pertenecen al contexto.

Cada ficha tiene primera opción, alternativa y seguridad. El inicio y consumo de la llamada siguen el MD06. La secuencia directa de saque termina cuando corresponde por resultado o nueva organización, no necesariamente al primer pase.

La administración decide cuándo marcha el reloj y qué ventana existe. El tiempo muerto o el cambio no conceden una nueva recepción libre por sí mismos.

### 15.2. SaqB01 — Recepción segura de banda

*Origen: MD07 §20.2.*

| Campo | Desarrollo |
|---|---|
| Intención | Poner balón en control de un receptor compatible y continuar. |
| Funciones | Sacador, receptor principal, receptor alternativo y apoyos que no ocupen la misma tarea incompatible. |
| Primera opción | Desmarque y envío a receptor de seguridad. |
| Alternativa | Otra referencia elegible si la primera está negada. |
| Continuidad | Ataque temprano u organización según situación creada; posibilidad de ventaja inmediata si la defensa se desplaza. |
| Seguridad y límite | No inventar una recepción si se niegan ambas; presión y plazo pueden provocar error o infracción. |
| Registro | Objetivo previsto, recepción real, negación y control posterior. |

### 15.3. SaqB02 — Liberación de tirador desde banda

*Origen: MD07 §20.3.*

| Campo | Desarrollo |
|---|---|
| Intención | Obtener recepción preparada para un finalizador exterior. |
| Funciones | Sacador, receptor, bloqueador cuando lo requiera la variante y seguridad. |
| Primera opción | Recepción tras desmarque/pantalla compatible. |
| Alternativa | Corte ante negación, otra recepción o ventaja del apoyo. |
| Continuidad | Tiro si se acepta la oportunidad, ataque a recuperación o pase adicional. |
| Seguridad y límite | El tirador puede no liberarse; enviar a seguridad dentro del plazo si existe. |
| Registro | Pantalla, salida, recepción, preparación y producción directa de saque. |

### 15.4. SaqB03 — Corte al aro desde banda

*Origen: MD07 §20.4.*

| Campo | Desarrollo |
|---|---|
| Intención | Aprovechar corte y relación de pase hacia aro. |
| Funciones | Sacador, cortador, posible pantalla y receptor seguro. |
| Primera opción | Envío al corte compatible. |
| Alternativa | Receptor liberado por la ayuda o seguridad. |
| Continuidad | Finalización real o recepción con decisión posterior. |
| Seguridad y límite | La protección interior puede negar el corte; no se fuerza el pase automáticamente. |
| Registro | Corte ofrecido/negado, ayudante y receptor real. |

### 15.5. SaqF01 — Corte al aro desde fondo

*Origen: MD07 §20.5.*

| Campo | Desarrollo |
|---|---|
| Intención | Crear recepción próxima desde la relación de fondo. |
| Funciones | Sacador, cortador, apoyos y posible bloqueador. |
| Primera opción | Corte al aro con oposición real. |
| Alternativa | Salida exterior o referencia segura si la protección cierra. |
| Continuidad | Finalización o distribución desde recepción según contexto. |
| Seguridad y límite | La proximidad no garantiza entrada; pueden intervenir negación, contacto, desvío o plazo. |
| Registro | Primera opción, respuesta interior y continuidad del ataque. |

### 15.6. SaqF02 — Salida de tirador desde fondo

*Origen: MD07 §20.6.*

| Campo | Desarrollo |
|---|---|
| Intención | Liberar recepción exterior mediante funciones compatibles de salida. |
| Funciones | Sacador, receptor de tiro, bloqueador si procede y seguridad. |
| Primera opción | Recepción preparada para tiro. |
| Alternativa | Corte o recepción del apoyo ante negación/cambio. |
| Continuidad | Tiro, ataque a recuperación o CONT05. |
| Seguridad y límite | No se concede oposición ficticia ni liberación automática. |
| Registro | Seguimiento/cambio ejecutado, receptor y preparación final. |

### 15.7. SaqF03 — Seguridad para organizar desde fondo

*Origen: MD07 §20.7.*

| Campo | Desarrollo |
|---|---|
| Intención | Obtener control y entrada viable al ataque. |
| Funciones | Sacador, receptor seguro y alternativa. |
| Primera opción | Envío a referencia de control. |
| Alternativa | Otra recepción compatible dentro del plazo. |
| Continuidad | Organizar, avanzar o aprovechar ventaja si realmente existe. |
| Seguridad y límite | La seguridad es intención; una presión bien ejecutada puede dificultarla. |
| Registro | Recepción, avance posterior y frontera de nueva organización. |

### 15.8. Seis plantillas defensivas

*Origen: MD07 §20.8.*

| ID | Situación y prioridad | Ejecución y concesión |
|---|---|---|
| DSaqB01 | Banda: negar primera recepción. | Asignar negación compatible, mantener alternativa y asumir riesgo de corte o segunda recepción. |
| DSaqB02 | Banda: perseguir o cambiar bloqueos. | Resolver navegación/cambio según cobertura declarada y conservar responsabilidad resultante. |
| DSaqB03 | Banda: presión al sacador. | Comprometer defensor del sacador e incomodar envío sin regalar al mismo tiempo su ayuda en otra tarea. |
| DSaqF01 | Fondo: proteger aro. | Priorizar acceso interior compatible y asumir recepción exterior que se concede. |
| DSaqF02 | Fondo: negar objetivo principal. | Perseguir/limitar receptor identificado; conservar objetivo, alternativa y restricciones vigentes. |
| DSaqF03 | Fondo: perseguir o cambiar bloqueos. | Ejecutar respuesta declarada, con desajustes y recuperación reales. |

Estas plantillas reutilizan el sistema, las marcas y las tareas. La prioridad principal no prohíbe cumplir otras obligaciones compatibles, pero tampoco permite sumar simultáneamente todas las ventajas de las seis respuestas.

### 15.9. Conflictos y oportunidad

*Origen: MD07 §20.9.*

Una protección de no abandonar puede limitar la ayuda disponible. El perseguidor de box and one no se usa como ayudante ordinario si contradice su encargo. Un objetivo fuera de pista activa alternativa o suspensión.

Las sustituciones solo se aplican en ventana legal. Si un cambio invalida una función, se revisa la elegibilidad de la ficha; no se usa al jugador retirado.

### 15.10. Contenido de preparación

*Origen: MD07 §20.10.*

Box, stack o diamond pueden describir colocaciones de entrada de estas fichas. No se añaden al selector general de seis disposiciones por incluirse en un saque.

La colocación se representa mediante funciones y relaciones necesarias. Su incorporación no exige un recorrido continuo ni un subsistema físico de saques.
