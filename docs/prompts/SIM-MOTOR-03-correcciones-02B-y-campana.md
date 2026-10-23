# beM · SIM-MOTOR-02B + SIM-MOTOR-03
## Correcciones, rendimiento exacto y campaña comparativa congelada

**Destinatario:** Claude Code.  
**Repositorio autorizado:** bateman37/beM, exclusivamente.  
**Fecha:** 23 de octubre de 2026.  
**Entrega:** un único encargo y una PR: cerrar las correcciones de SIM-MOTOR-02B y ejecutar después SIM-MOTOR-03 sobre una versión congelada.

Dennis ha aprobado este alcance. Avanza con las decisiones funcionales de este documento; resuelve las decisiones técnicas ordinarias dentro de sus límites. Entrega código, documentación y paquetes descargables. ChatGPT analizará la evidencia deportiva y Dennis decidirá los ajustes de SIM-MOTOR-04.

**Orden vinculante:** implementar → verificar → congelar → auditar → empaquetar. La campaña no es una fase de calibración. No cambies el motor para mejorar los resultados mientras lo auditas.

## Índice

1. [Objetivo y decisiones cerradas](#1-objetivo-y-decisiones-cerradas)
2. [Base, Git y consulta dirigida](#2-base-git-y-consulta-dirigida)
3. [Correcciones obligatorias de 02B](#3-correcciones-obligatorias-de-02b)
4. [Conservación de datos y contrato estadístico](#4-conservación-de-datos-y-contrato-estadístico)
5. [Rendimiento y memoria](#5-rendimiento-y-memoria)
6. [Verificación, congelación y condiciones de ejecución](#6-verificación-congelación-y-condiciones-de-ejecución)
7. [Agenda deportiva de SIM-MOTOR-03](#7-agenda-deportiva-de-sim-motor-03)
8. [Capacidades, controles, historia y aprendizaje](#8-capacidades-controles-historia-y-aprendizaje)
9. [Equivalencia y medición final](#9-equivalencia-y-medición-final)
10. [Datos que debe devolver la auditoría](#10-datos-que-debe-devolver-la-auditoría)
11. [Paquetes, comprobador y descarga](#11-paquetes-comprobador-y-descarga)
12. [Documentación y respuesta final](#12-documentación-y-respuesta-final)

## 1. Objetivo y decisiones cerradas

### 1.1 Resultado esperado

Un generador por tramos con sus problemas de integración corregidos, una medición honesta de coste/memoria y evidencia comparativa suficiente para que ChatGPT estudie:

- Estadísticas de equipo, jugador, zona, familia y quinteto.
- Diferencias de comportamiento frente al detallado con entradas comparables.
- Sensibilidad a capacidades, planes, roles, director, conocimiento y estados.
- Coherencia de historia individual, exposición y aprendizaje posterior.
- Simultaneidad, publicación del presente, recuperación y consecuencias únicas.
- Rendimiento real con estadísticas individuales transportadas y utilizables.

Se mantienen las cuatro entregas principales del roadmap. 02B se incorpora al comienzo de 03; no crea otra fase de diseño ni amplía el manager.

### 1.2 Modelo y asignación

- El motor detallado de MOTOR-18C permanece congelado.
- En el manager representado, solo los partidos del sénior dirigido por el usuario usan el detallado.
- El resto, incluida la cantera propia, utiliza SIM.
- Referencia y Simulada usan el mismo generador; cambia la conservación de información.
- El laboratorio puede enfrentar cualquier plantilla con ambos modelos para compararlos.
- Consultar un partido no cambia su resolutor ni vuelve a simularlo.
- SIM sigue siendo un generador estadístico por tramos; no añadas un resolutor de posesiones, movimientos o cadenas de acciones del detallado.
- Las 32 capacidades deportivas permanecen. Polivalencia y enseñanza siguen perteneciendo al aprendizaje ya existente.

### 1.3 Decisiones que quedan cerradas en este encargo

| Tema | Decisión |
| --- | --- |
| Clasificación del laboratorio | Conservar victorias, diferencia de puntos, puntos a favor e identificador estable, como ya fijaba SIM-MOTOR-02. No es el reglamento completo de una competición real. |
| Edad al cerrar temporada | No avanzar edades desde el cierre estadístico. La edad corresponderá al calendario y ciclo de vida del manager. |
| Movimiento administrativo | En este laboratorio solo se admite con efecto en la siguiente ronda. No implementar movimientos programados a varias rondas vista. |
| Nivel Simulada / Análisis | Conservar los datos compactos necesarios para las vistas comprometidas, incluidos denominadores y efectos defensivos observados. |
| Referencia | Conservar el esencial individual compatible con historia y aprendizaje; declarar los desgloses no conservados. |
| Aprendizaje | Se calcula después del partido con las funciones comunes. El generador registra exposición; no mejora capacidades ni conocimiento durante el encuentro. |
| Calibración | No cambiar coeficientes deportivos ni aceptar candidatas. Se decidirá en SIM-MOTOR-04 tras analizar los paquetes. |
| Objetivo de velocidad | Sigue abierto: 1.000 encuentros con cuatro workers y estadísticas esenciales individuales disponibles en el coordinador en 5 s, con arranque y otros costes declarados aparte. |
| Investigación externa | ChatGPT realizará la interpretación y el contraste externo. Claude ejecuta, conserva y resume mecánicamente los datos. |

No amplíes mercado, contratos, calendario mundial, envejecimiento, entrenamiento, scouting, economía ni normativa pendiente.

## 2. Base, Git y consulta dirigida

### 2.1 Estado comunicado y comprobación inicial

El último informe sitúa SIM-MOTOR-01 + SIM-MOTOR-02 en la PR #21, abierta contra main, base 606c33b, código de 01 en 0b2b43a y último commit de 02 en 4194158. Son referencias históricas: verifica el estado real.

1. Lee las normas del repositorio, AGENTS.md y el índice documental.
2. Registra rama, commit inicial, estado de Git y base real de SIM-MOTOR-02.
3. Si #21 sigue abierta y contiene ambas entregas, continúa allí y actualiza título/descripción para reflejar el alcance final 01 + 02 + 02B + 03.
4. Si ya está fusionada, crea una rama nueva desde main actualizado y una PR independiente.
5. Conserva trabajo ajeno y las evidencias anteriores. No fuerces historia para reutilizar una rama ocupada.
6. Sube los commits y deja la PR abierta, sin fusionar ni suscribirte.

### 2.2 Lectura por temas

Reutiliza, buscando sus equivalentes actuales:

- docs/prompts y notas técnicas de SIM-MOTOR-01/02; roadmap v2 de cuatro entregas.
- src/sim: engine, materialize, model, adapt, result, readers, reconcile, essential, snapshot, consequences, context, shard, pool, probe, learning y exposure.
- src/matchday: index, detailed, pool, worker-node, standings y escenario.
- src/season: ledger y world.
- src/simbatch y sus interfaces de laboratorio.
- Contratos existentes del detallado, aprendizaje, conocimiento y comprobadores.
- Catálogos de capacidades, roles, organizaciones, coberturas, planes, entrenador y familiaridad.

No releas íntegramente el funcional unificado si los índices temáticos resuelven la consulta. Guarda este prompt íntegro en docs/prompts y actualiza su catálogo.

Trabaja solo en beM. No abras v-apps, Basket Manager, BeManager ni otros repositorios. No descargues repositorios de terceros. No introduzcas dependencias pesadas para la campaña.

Los ZIP históricos pueden no existir porque out/ no se versiona. Declara su ausencia y reproduce desde la base comprobable de Git. No fabriques archivos históricos ni informes que aparenten haberse ejecutado antes.

### 2.3 Identidad y referencia

Registra por separado aplicación, código, generador, formatos, perfil efectivo, política estadística, cobertura y dataset.

- La aplicación identifica SIM-MOTOR-03 y declara que incluye 02B.
- Identifica la revisión de implementación SIM de 02B con versión propia; no la presentes como la misma compilación que 02.
- Los valores numéricos deportivos del perfil de SIM-MOTOR-02 permanecen intactos. C03-11 puede cambiar decisiones y trayectorias de rutas que antes omitían la política; registrar esa corrección funcional por separado.
- Una corrección de lectura o conservación puede cambiar el contrato/política de salida, pero no autoriza una recalibración.
- Si un formato cambia, versiona y documenta la compatibilidad. No conviertas ni actives perfiles en silencio.
- Mantén los originales de archivos antiguos. Toda lectura reparada debe ser identificable y apoyarse en hechos conservados.

La referencia detallada, con su entrada y perfil efectivos correctos, sigue siendo semilla 20261016, marcador 83–98, 6.684 sorteos y su huella congelada. Son un control de conservación, no un objetivo de calibración.

## 3. Correcciones obligatorias de 02B

Los casos siguientes proceden de una revisión independiente sobre los paquetes y código de SIM-MOTOR-02. Las reproducciones puntuales se hicieron con Node 24.19.0. No acreditan toda la aplicación en Node 24.

Agrupa las regresiones por riesgo; no crees una campaña de partidos distinta para cada aserción.

### C03-01 · Recuperación con encuentros ya terminados

**Reproducción:** dos encuentros SIM con la misma entrada válida; EARLY empieza en T=0 y LATE en T=1200. Avanzar hasta que EARLY termine y LATE continúe. Guardar, serializar, restaurar y avanzar.

En 02, ambos aparecen inmediatamente tras restaurar; en la siguiente barrera EARLY desaparece del conjunto publicado. Consultarlo falla al buscar un estado SIM que ya no se restauró. Aunque ambos resultados quedan almacenados, la jornada no se declara terminada.

**Causa localizada:** restore conserva los resultados terminados sin instanciar su partido; _publish vuelve a construir paquetes solo desde los resolutores activos y pierde esos resultados.

**Corrección:**

- Reconstruir cada publicación desde la unión de resultados aceptados terminados y resolutores activos.
- Conservar identidad, estado, marcador, validez, instante observado, competición y duración de los terminados.
- La clasificación incluye cada encuentro una vez.
- Consultar un terminado recuperado devuelve lo realmente conservado, con su cobertura; no intenta acceder a un motor inexistente ni lo regenera.
- done depende del estado completo de todos los encuentros, incluyendo terminados recuperados y errores declarados.
- Terminar con error no equivale a partido válido ni a derrota.

**Comprobación:** misma jornada sin interrupción frente a recuperación cuando ya acabó uno; igualdad del resto de resultados, tablas y decisiones con las mismas noticias. Cubrir inicio desplazado y cierre con prórroga mediante entradas conocidas o evidencia existente, sin buscar miles de semillas.

### C03-02 · Snapshot independiente y coherente

**Reproducción:** capturar snapshotSim tras publicar 125 s; validar; continuar el partido original hasta el final; validar y restaurar la captura anterior.

En 02, events y segments conservan referencias vivas. El snapshot mantiene un tiempo generado antiguo mientras sus arrays crecen con el partido. Su integridad deja de coincidir. El archivo ejemplo/snapshot-ejemplo.json entregado también está afectado: estado generado 1560 s con eventos y tramos que llegan a 2400 s.

**Corrección:**

- El snapshot devuelto representa un instante independiente, aunque el llamador lo serialice después.
- Capturar coherentemente entrada, contexto, RNG/ordinal, equipos, planes, órdenes, política, eventos, tramos y registros necesarios.
- Aplicar el mismo criterio a la sesión de jornada, sus resultados, log y decisiones.
- Las estructuras puras compartidas pueden serializarse mediante referencias identificadas seguras; las estructuras mutables no pueden seguir vinculadas a la sesión.
- Calcular la integridad sobre la representación que realmente se guarda.
- Modificar la captura tampoco debe modificar el partido vivo.
- Mantener la separación entre presente publicado y sufijo privado.

**Comprobación:** capturar → continuar original → serializar captura → restaurar → continuar; mismo partido que el control. Añadir una comprobación equivalente sobre la jornada. El comprobador de entrega debe validar y restaurar los snapshots finales incluidos en los ZIP, no limitarse a comprobar que son JSON.

No “repares” el snapshot defectuoso recalculando únicamente su checksum: sus secciones corresponden a instantes diferentes. Conserva el original como evidencia y regenera un ejemplo coherente desde una ejecución real identificada.

### C03-03 · Compatibilidad explícita

En 02, validateSimSnapshot comprueba schema/model/integridad, pero no limita simVersion ni resultSchema. Un archivo con versión 99.0.0-INCOMPATIBLE y resultado beM-sim-match/999, con checksum coherente, se acepta.

**Corrección:**

- Matriz explícita de versiones de estado y formatos que el lector sabe continuar.
- Comprobar semántica de compatibilidad además de integridad.
- Rechazar versiones desconocidas/incompatibles con un motivo concreto y sin alterar archivo ni sesión.
- Si un snapshot válido de SIM-MOTOR-02 puede continuar exactamente, documentar ese caso y comprobarlo. No afirmar compatibilidad por compartir un número de schema.
- Si necesita conversión, que sea explícita, identificada y con original conservado.
- Aplicar el criterio al guardado de jornada y sus componentes.

**Comprobación:** archivo válido conocido, incompatible con checksum correcto, incompleto y alterado. Son casos diferentes; no hacer pasar la prueba de incompatibilidad mediante un checksum roto.

### C03-04 · Registro histórico validado y atómico

**Reproducción:** construir el esencial de un encuentro publicado a 125 s, todavía running, complete=false y validity.valid=false. SeasonLedger.record lo acepta y suma estadísticas. Con una entrada mal formada, el registro puede anotar la consecuencia antes de fallar, bloqueando el reintento válido.

**Corrección:**

1. Validar identidad, resultado aceptado, finalización, validez, equipos, participantes, contadores y denominadores antes de mutar.
2. Rechazar parciales, errores, no válidos y estructuras incompletas como histórico definitivo.
3. Confirmar juntas estadísticas, detalle y protección contra duplicados; un rechazo no consume la consecuencia ni deja sumas parciales.
4. Un reintento no duplica un encuentro lógico ya aceptado.
5. La clave del encuentro y su ámbito permiten distinguir temporadas, competiciones y copias independientes. No deducir club actual del prefijo del id del jugador.
6. Mantener provisional de un partido separado del histórico definitivo.

No inventar la validez si no se evaluó: conservar ese estado y rechazar su confirmación definitiva hasta disponer de la comprobación pertinente.

**Comprobación:** parcial rechazado sin mutar; entrada mal formada rechazada sin mutar; después, entrada válida del mismo encuentro aceptada; importación/reintento posteriores rechazados como duplicados; sumas exactas.

### C03-05 · Consulta histórica sin detalle futuro

**Reproducción:** con el ledger de la temporada entregada, consultar EQ01-J01 hasta ronda 1. sums y rounds corresponden a una jornada, pero perMatch conserva rondas 1 a 10.

**Corrección:**

- Filtrar todas las secciones temporales del resultado, incluido detalle por encuentro, tramos y agregados por modelo.
- Los objetos devueltos no pueden permitir modificar el registro interno.
- Filtrar temporadas y competiciones de forma coherente.
- Evitar que exportaciones o vistas autorizadas reciban información posterior a la fecha solicitada.

**Comprobación:** serializar la respuesta histórica y verificar que no contiene encuentros futuros, además de comprobar sus sumas. La consulta no altera el histórico completo.

### C03-06 · Consecuencias revertidas

**Reproducción:** ConsequenceLedger.apply → revert → toJSON → from. Inmediatamente después de deshacer, has=false; tras reconstruir, has=true porque el índice vuelve a incluir anotaciones revertidas.

**Corrección:**

- Reconstruir el índice de aplicaciones vigentes; conservar las revertidas como historial.
- Mantener causalidad de deshacer y la protección frente a aprendizajes posteriores.
- Una reaplicación válida posterior a deshacer no puede ser anulada al reconstruir por una anotación antigua.
- Respetar la identidad completa de encuentro, copia, equipo y fuente, incluidas las protecciones M1/M10 y copia ajena de MOTOR-18C.
- Si falla una propuesta, el rollback de la guarda tampoco puede reaparecer como aplicado tras reconstruir.

**Comprobación:** aplicar → deshacer → serializar/restaurar registro → reaplicar → serializar/restaurar; vigente una vez, sin doble presupuesto ni pérdida de historial.

### C03-07 · Estadísticas derivadas con universos correctos

**A. Eficiencia defensiva.** En el ejemplo reproducido 76–83, la vista defensiva atribuye correctamente puntos pero cuenta 64 finalizaciones frente a 65 reales y 61 frente a 63, porque solo añade las que tienen shot. Debe incluir las finalizaciones elegibles de faltas/libres, una vez por serie/identidad.

- Asignar puntos y finalizaciones a organización/cobertura/altura efectivas.
- Incluir tiro, falta de tiro y serie ligada con el criterio de finalización SIM ya aprobado.
- Una canasta con falta cuenta una finalización.
- El bonus sin familia tiene su categoría real.
- Comprobar que el desglose suma el total rival del mismo universo.

**B. Quintetos.** El lector estima controles proporcionalmente a minutos aunque los tramos ya conservan controles observados. En un quinteto del ejemplo hay +5 puntos en 16 controles propios: +31,25 por 100, mientras la vista devuelve +32,5.

- Conservar y usar controles ofensivos y defensivos realmente observados durante la presencia del quinteto.
- Mostrar producción ofensiva = 100 × PF / controles propios; producción concedida = 100 × PC / controles rivales; diferencia de ambas tasas como balance por 100.
- Si se ofrece además diferencia de puntos por 100 controles propios, darle ese nombre y fórmula explícitos. No confundirla con la diferencia de tasas.
- Denominador cero produce ausencia tipada, no Infinity ni un cero inventado.
- Calcular también la producción individual por 100 con presencia completa y cuota de cierres desde sus numeradores observados.

**C. Tapones recibidos del detallado.** detailedEssential pierde el contador blkRec, y commonLines asigna blkAgainst=0. En un encuentro reconstruido había cuatro tapones recibidos y el histórico registraba cero.

- Transportar ese contador desde el acta existente, sin cambiar el crédito deportivo.
- Auditar el resto de contadores comunes del adaptador para evitar pérdidas equivalentes.
- Utilizar los tiempos exactos del acta cuando existan, evitando reconstruirlos desde un texto redondeado.
- Conservar participación y DNP; un convocado sin participación no suma un partido jugado por su mera inscripción.

Estas correcciones afectan a lectura, conservación y agregación, no al resolutor detallado.

### C03-08 · Conservación útil y ausencia tipada

En el mundo, depth=analysis conserva buildSimResult con events=false. El lector defensivo devuelve cero puntos recibidos al faltar eventos, aunque el marcador sea 76–83. También pierde lecturas de órdenes/participación que el nivel Análisis debe poder responder.

Implementa el contrato del apartado 4. Para datos antiguos sin hechos ni agregados suficientes, devolver “no conservado” con motivo. No regenerarlos ni tratarlos como cero.

### C03-09 · Movimiento administrativo efectivo en la siguiente ronda

**Reproducción:** en ronda 0, transferir EQ05-J12 a EQ02 con atRound=8. El historial lo mantiene en EQ05 en ronda 1, pero la entrada de esa ronda ya lo alinea con EQ02.

**Decisión funcional:** este laboratorio solo permite atRound = ronda actual + 1. Rechaza cualquier otra fecha antes de tocar plantilla, plan o pertenencia.

- Validar el movimiento completo antes de confirmar.
- El intercambio de prueba debe ser atómico: si el segundo movimiento no puede realizarse, tampoco confirmar el primero.
- Conservar identidad de persona, validez de planes y estadísticas previas.
- Mantener las doce fichas cuando el escenario vaya a utilizar el detallado.
- No construir un sistema de traspasos diferidos ni un mercado.

### C03-10 · Identidad de las órdenes en el pool de jornada

**Reproducción adicional:** iniciar MatchdayPool con un worker, añadir ORDER-FIXTURE con entrada válida, avanzar a 120 s y enviar una orden válida al encuentro. Falla en ShardRunner.order al buscar un partido inexistente.

**Causa localizada:** _send usa id para la correlación de la petición y sobrescribe el id del encuentro enviado por order. El worker interpreta el identificador de petición como identificador de partido.

**Corrección:**

- Separar request_id y fixture_id en los mensajes y sus respuestas.
- Revisar las rutas de mensajes que puedan compartir esa colisión.
- Una orden válida llega exactamente al encuentro/equipo indicado, una vez y con acuse coherente.
- Desconocido, terminado o sin autoridad produce un rechazo tipado; no deja promesas sin resolver ni bloquea los demás encuentros.
- Mantener las fronteras de aplicación, el bloqueo manual y el registro de comandos existentes.

**Comprobación:** dos partidos en el mismo worker; orden a uno, el otro permanece intacto. Comparar resultado con la ejecución equivalente en proceso usando el mismo guion y noticias.

### C03-11 · Política del entrenador coherente entre rutas

**Reproducción adicional:** con la entrada del ejemplo de 02, terminar directamente con SimMatch.finish produce 76–83 y cero decisiones; ejecutar playWithBarriers cada 120 s con policy=true produce 77–79 y ocho decisiones. Los lectores ya probaban neutralidad de avances con policy=false, pero eso no acredita equivalencia funcional de la simulación automática del usuario.

**Corrección funcional:**

- Una misma configuración de entrenador, órdenes y noticias utiliza el mismo calendario deportivo de revisiones, tanto en partido completo como en lotes, temporadas y jornada.
- Separar la primitiva de generación, que puede conservar finish sin política, de las rutas de producto que prometen dirección automática.
- Las revisiones del entrenador se ejecutan en las fronteras canónicas ya fijadas, aunque la interfaz avance de golpe.
- No introducir otro entrenador, más patrones ni más decisiones por segundo.
- Las rutas públicas y el benchmark representativo usan las políticas que realmente tendrá el mundo. No ganar rendimiento omitiéndolas en silencio.
- Un modo técnico sin política puede existir, claramente identificado, como control adicional; no sustituye al benchmark de aceptación.
- La igualdad entre completo y jornada solo se exige cuando órdenes, políticas y noticias externas son iguales. Una noticia clasificatoria distinta puede cambiar legítimamente el futuro.

Esta corrección puede cambiar la trayectoria de las rutas que antes omitían la política. Identifica ese cambio funcional y su coste por separado; no lo atribuyas a calibración ni a una optimización exacta.

**Comprobación:** misma entrada, política, fronteras y noticias en completo, avance por cuartos, jornada y worker; mismas decisiones aplicadas y datos deportivos. Añadir un caso con noticia externa distinta: prefijo anterior igual, respuesta futura permitida distinta.

## 4. Conservación de datos y contrato estadístico

### 4.1 Dos niveles de conservación, una producción

| Información | Simulada / Análisis | Referencia / Esencial |
| --- | --- | --- |
| Identidades, seed, perfiles y políticas | Completa | Completa |
| Resultado, periodos, duración y validez | Sí | Sí |
| Acta individual y de equipo | Sí | Sí |
| Numeradores y denominadores compatibles con temporada | Sí | Sí |
| Zonas y familias con libres/finalizaciones únicas | Sí | Mantener los desgloses compactos ya comprometidos |
| Quintetos y evolución temporal compacta | Sí | No exigidos si se declaran no conservados |
| Producción por organización/cobertura/altura | Sí, desde hechos o agregados observados | Solo si se conserva; en otro caso, ausencia tipada |
| Cuota de cierres y participantes por familia/ficha | Sí, con conteos compactos | Solo lo explícitamente conservado |
| Órdenes aplicadas y su momento | Sí, por audiencia | Metadatos de identidad necesarios; detalle según contrato |
| Exposición posterior de aprendizaje | Sí | Sí |
| Trazas completas de decisiones | Solo diagnóstico seleccionado | No |

Se admiten agregados suficientes calculados desde hechos ya generados, sin retener toda la secuencia en cada partido. Esto no añade acciones al generador.

No borres información que el nivel ya prometía para acelerar el benchmark. No reconstruyas retrospectivamente alternativas, ayudas o saques que SIM no modela.

### 4.2 Reglas de lectura

- Todos los desgloses se calculan desde los mismos registros comprometidos.
- Una suma compatible debe conciliar con el acta y el periodo correspondiente.
- Los porcentajes de temporada se recalculan desde sumas.
- Cero observado, no conservado, no representado, no aplicable y no evaluado son estados distintos.
- Mantén identificadas las asistencias a canasta y a libres donde la política las distinga; no cambies créditos para igualar el detallado.
- No mezcles controles SIM, finalizaciones SIM y posesiones beM en una tasa única.
- Las diferencias de definición estadística se documentan como tales.
- Información pública, propia y diagnóstica sigue separada en vistas y exportaciones, también al terminar.
- Una consulta histórica o parcial no recibe decisiones, resultados ni detalle que solo se conocieron después del horizonte solicitado.

No crear nuevas capacidades, bonuses universales o mecanismos tácticos durante esta reparación.

## 5. Rendimiento y memoria

### 5.1 Punto de partida observado

SIM-MOTOR-02 declaró:

| Medida | Resultado |
| --- | ---: |
| 1.000, proceso nuevo y workers preparados, cronómetro objetivo | 8,30 s |
| 1.000, caliente, tres pasadas | 5,15 / 5,52 / 5,91 s |
| Disponibilidad para mundo, pasada fría declarada | 9,23 s |
| Esenciales individuales | 15,4 MiB; 1,8 MiB comprimidos |
| RSS máximo del benchmark | 851 MiB |
| Jornada coordinada de 1.000 | 14,4 s |
| RSS máximo de esa jornada | Aproximadamente 2,3 GiB |

Arranque y calentamiento estaban declarados aparte. No atribuir diferencias entre sesiones al hardware sin un control comparable. SIM-01 y SIM-02 tampoco transportaban exactamente la misma salida.

### 5.2 Intervención acotada

Perfila primero una muestra breve y separa:

1. Entrada/validación/identidad.
2. Preparación y cálculo de magnitudes por tramo.
3. Generación/materialización.
4. Construcción de acta, agregados, esencial y conciliación.
5. Mensajería/transporte.
6. Persistencia y disponibilidad para mundo.
7. Estado retenido por encuentro, por jornada y en guardados.

Aplica como máximo dos líneas estructurales de optimización, elegidas por la medición:

- Preparación/reutilización exacta de datos estáticos, reduciendo trabajo y objetos temporales por tramo.
- Representación y ciclo de vida del estado: agregación incremental, compartición inmutable y liberación/compactación de datos ya innecesarios.

Una corrección pequeña directamente necesaria puede acompañarlas. Evita una búsqueda indefinida de microoptimizaciones, flags o pruebas de hardware.

### 5.3 Condiciones

- Mismo resultado, participantes, créditos, tiempos, cambios, consumo de azar y trayectoria deportiva.
- Las dependencias dinámicas de una caché incluyen energía, estados, participantes, conocimiento, plan y contexto que realmente afecten al cálculo.
- No reutilizar probabilidades antiguas para varios tramos omitiendo esas dependencias.
- No reducir repertorio, capacidades, órdenes, exposición, salida individual ni política para cumplir el objetivo.
- La igualdad se comprueba por datos deportivos canónicos; no se reduce a marcador o a un hash opaco.
- Si compactas el estado, demostrar también continuación exacta y disponibilidad de los análisis comprometidos.
- Mantener estado suficiente para reaccionar a noticias actuales; no resolver irrevocablemente la jornada completa y después representar decisiones decorativas.
- Reducir guardados sin suprimir el estado necesario del detallado. No modificar su deporte.
- La jornada de mil debe seguir usando un pool limitado, no mil hilos ni un mensaje por segundo por partido.

Captura un control preoptimización reproducible desde la misma versión con las correcciones funcionales ya hechas. Compara las optimizaciones contra ese control. No atribuyas al ahorro de CPU los efectos de cambiar formato o reparar contadores.

Si no se alcanza el objetivo, entrega la medida real, sus fases y el límite. El incumplimiento de coste no impide ejecutar una campaña técnicamente íntegra y declararlo pendiente.

## 6. Verificación, congelación y condiciones de ejecución

### 6.1 Pruebas justas

- Agrupa casos de recuperación, captura/compatibilidad, consecuencias/historia, lectores/retención y mensajes/órdenes.
- Usa entradas fijas y pequeñas que reproduzcan cada riesgo.
- Las regresiones deben fallar con el comportamiento anterior correspondiente.
- Reutiliza encuentros y resultados entre aserciones cuando sea correcto.
- No añadas cientos de partidos como pruebas unitarias.
- Ejecuta las pruebas dirigidas durante el trabajo y una suite completa al cerrar el código.
- Ejecuta data:check y el comprobador documental.
- Si después cambias código relevante, vuelve a comprobar lo afectado; documentar o empaquetar no justifica repetir toda la suite.

Recorrido automático de Chromium acotado: selector de motores, jornada con un terminado y otro activo guardada/recuperada tras recarga real, análisis con conservación compacta, aprendizaje/deshacer, lote y descarga real. Verifica consola/red y bytes de lo descargado.

El recorrido manual de Dennis queda pendiente y debe entregarse como tal. No sustituirlo por el navegador automático ni afirmar que ya aceptó la entrega.

### 6.2 Congelación antes de auditar

Antes de la campaña:

1. Cerrar las correcciones y comprobar la neutralidad de las optimizaciones.
2. Registrar hashes de los archivos deportivos detallados antes/después y referencia congelada.
3. Identificar commit de código, perfil numérico, políticas, dataset y contratos.
4. Guardar en Git el plan exacto de campaña y las agendas/materialización de sus casos.
5. Registrar la huella de todos los archivos que pueden alterar generación, lectores y métricas.
6. Conservar una copia de solo lectura del código/datos necesarios para interpretar la entrega.

Desde ese punto no cambies src/, datos deportivos, perfil, métricas del auditor ni agendas. Las correcciones de documentación y empaquetado se registran aparte y no reescriben resultados.

Si el auditor tiene un defecto de lectura detectado tras congelar, conservar su versión/resultados originales y declarar el problema. Toda lectura reparada debe llevar otra identidad y demostrar que no vuelve a simular; no recalibrar para tapar la discrepancia.

### 6.3 Fallos durante la campaña

- Conservar solicitados, iniciados, terminados válidos, no válidos, fallidos, interrumpidos y no ejecutados.
- Fallido no tiene marcador definitivo ni cuenta como derrota.
- Reintento solo por causa operativa identificada, con la misma entrada/semilla y un intento nuevo.
- Un no válido deportivo se conserva; no se elimina ni se reintenta hasta obtener un partido válido.
- Si un defecto sistemático hace inútil el resto de la campaña, detener el bloque afectado, guardar reproducción y entregar el alcance real. Continuar los bloques independientes que sigan siendo fiables.
- No iniciar una reparación deportiva ni recalibración durante esta fase.

El cero de defectos no es requisito para entregar evidencia honesta. “No evaluado” nunca se transforma en aprobado.

## 7. Agenda deportiva de SIM-MOTOR-03

### 7.1 Presupuesto cerrado de comparación

| Bloque | SIM | Detallado | Uso |
| --- | ---: | ---: | --- |
| A · Cruces naturales | 1.056 | 48 | Distribución, jerarquía y producción natural |
| B · Contrastes controlados | 512 | 24 | Sensibilidad táctica y de estados |
| C · Contextos específicos | 64 | 0 | Cobertura de estados y cantera |
| **Comparación deportiva** | **1.632** | **72** | Sin calibrar |
| E · Repeticiones técnicas, apartado 9 | 16 | 0 | Equivalencia; no observaciones nuevas |
| F · Rendimiento, apartado 9 | 5.000 | 0 | Cuatro pasadas de mil más jornada de mil |

Total planificado de ejecuciones explícitas de campaña: 6.648 SIM y 72 detalladas. Las 4.000 de las pasadas del benchmark repiten sus mil casos; las repeticiones técnicas tampoco son observaciones independientes.

Las pruebas, recorrido de navegador, controles de referencia y muestras breves de perfilado se contabilizan aparte. No ocultarlos en el total ni ampliar automáticamente la campaña si sus resultados parecen raros.

La campaña de historia/aprendizaje reutiliza partidos de estos bloques. Si una regresión de un movimiento exige otra ejecución pequeña, contarla como verificación de 02B, no como partido independiente de comparación.

No ejecutar 528 partidos detallados ni una temporada detallada completa por defecto.

Ejecuta mediante scripts y pools existentes, con persistencia progresiva. Limita SIM a cuatro workers; en el detallado utiliza uno o como máximo dos según la memoria medida. No mantengas en memoria todas las trazas completas. No utilices agentes para leer/interpretar cada partido ni conviertas los logs en mensajes: la campaña es ejecución programada y tablas.

### 7.2 Entrada y trazabilidad

Para cada caso:

- case_id global y estable; bloque, escenario, réplica, orientación, variante y resolutor.
- entry_id canónico, hash de entrada y ruta de la entrada materializada.
- Semilla de partido derivada de un master fijo 20261023 y una seed_key estable con la función existente. La seed_key identifica bloque, enfrentamiento/escenario, orientación y réplica; excluye variante, resolutor, intento, worker, lote y ruta.
- Misma semilla y mismos datos de origen en las dos variantes de un contraste; conservar sus diferencias exactas.
- Una comparación entre modelos utiliza una entrada fuente común: mismas personas, capacidades, cuerpo, estados, conocimiento, entrenador y plan representable.
- Conservar por modelo el adaptador, entrada efectiva, cobertura e información ignorada.
- No reemplazar silenciosamente un plan por otro compatible con el modelo.
- La semilla compartida no exige idénticos resultados ni idéntico uso del azar entre modelos.

Las identidades operativas no modifican el azar. Agenda, resultados y archivos se enlazan por claves completas, nunca solo por número de caso local.

### 7.3 Bloque A · Cruces naturales

SIM:

- Doce equipos EQ01–EQ12 con sus planes naturales actuales.
- Todos los pares orientados distintos: 12 × 11 = 132 enfrentamientos.
- Ocho réplicas por enfrentamiento: 1.056 partidos.
- Identificar orientación; no inventar un efecto de localía si el perfil no lo modela.
- Mantener plantillas/planes/estados iniciales congelados por caso. No acumular aprendizaje ni cansancio entre estos partidos independientes.

Detallado: subconjunto preseleccionado de A con estas doce parejas:

| Pareja | Equipo 1 | Equipo 2 |
| --- | --- | --- |
| A-D01 | EQ01 | EQ02 |
| A-D02 | EQ03 | EQ09 |
| A-D03 | EQ07 | EQ08 |
| A-D04 | EQ11 | EQ12 |
| A-D05 | EQ04 | EQ10 |
| A-D06 | EQ05 | EQ06 |
| A-D07 | EQ01 | EQ06 |
| A-D08 | EQ02 | EQ07 |
| A-D09 | EQ03 | EQ08 |
| A-D10 | EQ04 | EQ09 |
| A-D11 | EQ05 | EQ12 |
| A-D12 | EQ10 | EQ11 |

Ambas orientaciones y las dos primeras réplicas de cada enfrentamiento de A: 12 × 2 × 2 = 48 detallados. Cada equipo aparece en dos parejas.

No seleccionar los detallados después de ver los marcadores SIM.

### 7.4 Bloque B · Contrastes

Dieciséis escenarios × dos variantes × dos orientaciones × ocho réplicas = 512 SIM.

Congela el contenido exacto de cada escenario antes de ejecutar. En todos, la variante cambia solo el factor declarado; cualquier condición preparada para hacer pertinente la interacción se mantiene igual en ambas variantes.

| Id | Factor | Variantes y contexto |
| --- | --- | --- |
| B01 | Ritmo organizado | Niveles 1 y 5; resto idéntico |
| B02 | Preferencia de finalización | Extremo interior y extremo exterior del catálogo vigente |
| B03 | Después del tiro | Extremos de carga al rebote/balance del estilo vigente |
| B04 | Riesgo ofensivo | Niveles 1 y 5 |
| B05 | Libertad | Niveles 1 y 5, con el mismo director de lectura alta y libro común |
| B06 | Director | Prioridad entre dos candidatos de lectura baja/alta; fichas idénticas entre variantes y cambio solo de prioridad |
| B07 | Rol ofensivo | Rol de anotación frente a creación del catálogo, aplicado al mismo jugador participante |
| B08 | Rol defensivo | Protección interior frente a función perimetral del catálogo, con jugadores/plan comunes |
| B09 | Altura de presión | Normal frente a total |
| B10 | Tendencia al robo | Niveles 1 y 5 del estilo defensivo; presión y demás estilos fijos |
| B11 | Organización | Individual frente a 2–3, con plan rival compatible y conocimiento neutral |
| B12 | Cobertura | COB01 frente a COB03 en un repertorio donde la cobertura sea pertinente |
| B13 | Familiaridad | Nivel 8 frente a 28 en los módulos pertinentes; resto del conocimiento y Polivalencia fijos |
| B14 | Energía inicial | 100 frente a 30 del mismo equipo |
| B15 | Forma | −0,5 frente a +0,5, dentro de los límites reales del perfil |
| B16 | Consistencia | MEN06 = 8 frente a 24 en los mismos jugadores; demás capacidades fijas |

Preparación:

- Usa copias identificadas de las plantillas y planes existentes.
- Para roles, declara sus códigos reales, etiquetas y jugador afectado. No inventes roles ni capacidades.
- Para B06, prepara dos candidatos con diferencias de lectura explícitas en ambas variantes; modifica únicamente quién dirige. No cambies sus habilidades entre V0/V1.
- B12/B13 deben exponer realmente la interacción: usa fichas compatibles del repertorio existente, con prioridades comunes a ambas variantes.
- Valida las entradas en ambos modelos antes de ejecutar; declara las incompatibilidades reales. No sustituir el caso por uno favorable al resultado esperado.
- Si un control carece de representación en un modelo, registrar esa cobertura y conservar la comparación pertinente; no añadir un mecanismo nuevo en la campaña.

Detallado: B01, B02, B06, B09, B13 y B14; ambas variantes, las dos primeras réplicas y solo la primera orientación declarada: 6 × 2 × 2 = 24.

### 7.5 Bloque C · Estados y cantera

Ocho entradas congeladas × ocho réplicas = 64 SIM:

| Id | Contexto |
| --- | --- |
| C01 | Equipo con energía inicial 8; resto neutral |
| C02 | Mismo equipo con energía 70; resto neutral |
| C03 | Momentos individuales TIR/OFE/DEF iniciales −0,5; equipo colectivo neutral |
| C04 | Momentos individuales iniciales +0,5; equipo colectivo neutral |
| C05 | Momento colectivo inicial −0,5; momentos individuales neutrales |
| C06 | Momento colectivo inicial +0,5; momentos individuales neutrales |
| C07 | Importancia decisiva, con estados iniciales neutrales |
| C08 | Dos equipos Sub-20 identificados del escenario existente |

Usa una pareja base común en C01–C07 y valores admitidos por el perfil. Identifica qué equipo recibe la modificación y mantén fijo el rival. Estos casos buscan cobertura, no representan la distribución real de una competición.

El veterano de EQ07 se observa también en A y en sus comparaciones detalladas. No añadir una campaña de envejecimiento ni degradar atributos por edad durante el encuentro.

## 8. Capacidades, controles, historia y aprendizaje

### 8.1 Matriz de las 32 capacidades

Este bloque usa cálculo fijo y los resultados ya ejecutados; no añade partidos a los 1.632 SIM ni a los 72 detallados.

Entrega una fila por capacidad y situación pertinente con:

- Código, nombre, grupo y unidad de la capacidad.
- Operación que la consume, operandos, peso/fórmula y parámetros efectivos.
- Participante o grupo al que pertenece.
- Variable anterior al sorteo que puede cambiar.
- Tarea deportiva y métricas observables pertinentes.
- Nivel base, cambio solicitado +1/+3/+5, cambio realmente aplicado y límite alcanzado.
- Contexto, módulos de conocimiento, plan y participantes.
- Valor antes/después; no limitarse a afirmar “el atributo se usa”.
- Fuente de evidencia: cálculo fijo, ejecución expuesta, no expuesto o no instrumentado.

Usa los ocho contextos fijos siguientes con entradas base identificadas:

1. Finalización exterior.
2. Finalización interior/contacto.
3. Control y pase del director.
4. Participación en bloqueo/continuación.
5. Defensa exterior/recuperación.
6. Defensa interior/rebote.
7. Energía/fatiga y rotación.
8. Consistencia, presión de partido importante y estados.

Aplica los incrementos individualmente al jugador o participante pertinente, dentro de 1–30, manteniendo fijo el resto. Conserva las filas sin efecto y su causa. Un tope no se registra como un incremento completo.

En cada sonda, el azar debe estar ausente o congelado como operación pura. No compares dos sorteos diferentes para inferir que una capacidad interviene.

Si el instrumento existente no expone un operando, declara “no instrumentado” y aporta el lugar de consumo encontrado en el código. No añadas cálculos deportivos, alteres la instrumentación después de congelar ni marques como probado un uso solo porque aparece un nombre en una receta.

No imponer que cualquier incremento de cualquier capacidad mejore todas las métricas del equipo: registra la operación y la compensación que el modelo realmente produce.

### 8.2 Cobertura de controles

Inventario completo de:

- Siete estilos ofensivos y media distancia.
- Disposiciones y funciones.
- Libro/prioridades, familias y continuaciones representadas.
- Roles ofensivos/defensivos y director efectivo.
- Organización, presión, coberturas y estilos defensivos.
- Órdenes manuales, política del entrenador y contexto externo.
- Familiaridad por posición, rol y módulo pertinente.
- Energía, Forma, momentos individuales/colectivos, Consistencia e importancia.

Por cada elemento: representado/aproximado/no representado; productor; efecto previo al sorteo; exposición real en A/B/C; muestra y limitación. Un control no expuesto no está validado por un partido con acta correcta.

No convertir la matriz en una obligación de simular automáticamente todas las combinaciones.

### 8.3 Temporada y consecuencias desde evidencia existente

Usa 72 resultados ya ejecutados y preseleccionados de A para una historia de prueba, asignados a rondas ficticias identificadas. No vuelvas a generarlos.

- Los escenarios artificiales de calendario se identifican como tales.
- Registra una historia SIM y una historia de comparación mixta en ledgers separados.
- Para el subconjunto mixto usa las versiones detalladas existentes de los mismos casos, sin confirmar ambos resolutores del mismo encuentro en un único ledger.
- Reconcilia jugador → club/competición/temporada y sumas del esencial → sumas del ledger.
- Comprueba porcentajes desde numeradores/denominadores, DNP y participación, tapones recibidos, tiempos y tramos por club.
- Reimportar/reintentar no duplica; una consulta histórica limita también su detalle.
- Un intercambio administrativo usa una copia del escenario de laboratorio; no reasignes retroactivamente clubes de partidos cuya entrada no reflejaba el movimiento.
- Cierre y apertura de temporada conservan lo anterior sin avanzar edades.

Reutiliza las regresiones de 02B para el movimiento, rechazo de parciales, rollback y reconstrucción de consecuencias. No construir una temporada detallada nueva.

### 8.4 Aprendizaje posterior comparativo

Selecciona antes de ejecutar seis casos emparejados de A que tengan SIM y detallado y exposición pertinente. Conserva los doce conjuntos de exposición de esas ejecuciones.

Sobre copias de aprendizaje identificadas:

- Declarar exactamente las unidades: décimas de segundo de juego vivo, minutos convertidos y créditos de módulos normalizados.
- Mantener estado de conocimiento inicial común, entrenador, día y presupuestos.
- Calcular propuestas con Polivalencia 8, 16 y 24 reutilizando la misma exposición, sin volver a jugar.
- Conservar por jugador/dominio: nivel, peak, exposición, reparto, dosis, presupuesto, factores, límites y ganancia propuesta.
- Misma exposición normalizada en ambos adaptadores debe producir la misma propuesta con las funciones comunes.
- La exposición real de SIM y detallado puede ser distinta; registrar esas diferencias y su repercusión.
- Mayor número de eventos no concede automáticamente más horas ni más presupuesto.
- Nadie sin participación recibe dosis por estar en la plantilla.
- No aplicar una propuesta al motor ni al dataset base. Las aplicaciones/deshacer de comprobación se hacen sobre copias.
- Mantener las protecciones por encuentro lógico y fuente completa.

No declarar equivalencia anual de desarrollo a partir de estos seis pares. Entregar las magnitudes para que ChatGPT valore el sesgo y la cobertura.

### 8.5 Auditorías existentes

Ejecuta las auditorías reutilizables sobre el subconjunto diagnóstico congelado, sin duplicar simulaciones.

Entrega por auditoría:

- Definición, universo, numerador, denominador y umbral si existe.
- Aplicable/no aplicable a SIM y al detallado.
- Casos/observaciones realmente evaluados.
- Resultado automático literal y evidencias enlazadas.
- No evaluado/inconcluso con causa.

No obligues al generador a producir diagnósticos internos exclusivos del detallado para hacer pasar AUD01–32. Separa el catálogo heredado de las conciliaciones propias de SIM.

## 9. Equivalencia y medición final

### 9.1 Bloque E · Dieciséis repeticiones técnicas

Selecciona ocho casos SIM ya incluidos en A/B, con variedad de ritmo, estados y planes. Cada caso tiene su control ya ejecutado y dos ejecuciones adicionales:

- E1: un worker, avance por fronteras/cuarto y registro compacto.
- E2: cuatro workers, guardado/recuperación con sufijo privado y nivel Análisis.

Total: ocho × dos = 16 repeticiones SIM.

Mantén iguales política, revisiones, noticias y órdenes del control. Reparte entre los ocho casos cambios de velocidad, consultas intermedias, pausas y recuperación con otros partidos ya terminados. La orden manual, su rechazo y las noticias externas se cubren con las regresiones C03-10/11; no añadirlas solo a una repetición y después exigir igualdad con un control que no las recibió.

Las comprobaciones que solo consultan o serializan no son simulaciones nuevas.

Comparar:

- Marcador y periodos.
- Hechos deportivos canónicos, incluyendo participantes y créditos.
- Presencia, cambios de quinteto y tiempos.
- Órdenes/decisiones efectivas y registro de contexto.
- Consumo de azar y ordinal cuando exista.
- Acta, zonas, familias, exposición y consecuencias propuestas.
- Tablas publicadas cuando el contexto es igual.

Identificar aparte metadatos operativos y campos de lectura que legítimamente cambian por formato. No utilizar únicamente una huella que pueda omitir los datos relevantes.

### 9.2 Bloque F · Benchmark de mil

Congela una agenda de 1.000 encuentros naturales reales antes de medir. Puedes reutilizar la agenda del benchmark anterior si sus entradas son recuperables y están identificadas. No devolver resultados guardados.

Cuatro pasadas, cada una con los 1.000 encuentros completos:

| Pasada | Condición |
| --- | --- |
| F0 | Proceso nuevo; costes de importación/carga/arranque/calentamiento medidos por separado |
| F1 | Mismos workers preparados, agenda regenerada |
| F2 | Segunda repetición caliente, sin caché de resultados |
| F3 | Tercera repetición caliente, sin caché de resultados |

**Cronómetro objetivo:** solicitud de ejecutar la agenda con workers preparados → esencial individual completo, validado y transportado al coordinador para todos los casos.

Además registrar tiempo desde proceso nuevo hasta estadísticas confirmadas/disponibles para el mundo. Declarar todo calentamiento: número de encuentros, semillas, duración y si produce archivos. No trasladar cientos de partidos al arranque sin reflejar su coste.

Obligatorio:

- Cuatro workers efectivos como referencia; si el entorno tiene menos, declararlo y no atribuirle un resultado de cuatro.
- Políticas automáticas activas como en el mundo, conforme a C03-11.
- Salida esencial individual de cada partido, no solo marcador/huella.
- Guardado y reconstrucción de acumulados de mundo reales en la medida end-to-end.
- Contar terminados, válidos, no válidos, errores, prórrogas y duplicados.
- Tiempos por fase, throughput, latencia por partido y ocupación por worker.
- Bytes transportados, persistidos y comprimidos.
- RSS máximo del proceso con workers, muestreo y definición de la medida.
- Comparación caso a caso de las cuatro pasadas; mismos partidos, no 4.000 observaciones deportivas independientes.

No comparar objetivos entre muestras de retención diferentes como si midieran lo mismo. El nivel Análisis debe medirse sobre la muestra técnica ya prevista; no hace falta otro benchmark de mil completo.

### 9.3 Jornada de mil simultáneos

Quinta ejecución de esos 1.000 casos, coordinada con reloj virtual y barreras de 120 s.

- Mismos planes, políticas y noticias que el control de equivalencia que se quiera afirmar.
- Noticias clasificatorias adicionales se identifican como otra entrada; no prometer igualdad de resultados si cambian.
- Pool limitado a cuatro workers.
- Paquetes públicos por barrera, clasificación desde el mismo presente y esenciales al terminar.
- No conservar mil instancias del detallado.
- Liberación/compactación del estado SIM cuando sea segura para el contrato.
- Una consulta no consume azar ni publica el futuro.

Registrar por barrera: instante virtual, duración real, generación, revisión de entrenadores, mensajes/bytes, encuentros activos/terminados, memoria y decisiones.

Entregar también el coste máximo y percentiles de actualización de barrera. Distinguir:

1. Coste de completar toda la jornada.
2. Coste y fluidez de acompañar un visionado mientras avanza el reloj virtual.

El reloj de reproducción no es una medición de CPU. No afirmar que la jornada “tarda 40 minutos” por su duración deportiva.

### 9.4 Lectura del coste y límites

- Entregar todas las pasadas, no solo la mejor.
- Objetivo cumplido/no cumplido por pasada y con el margen observado.
- No garantizar rendimiento de otros equipos o navegadores.
- Comparar con el control preoptimización equivalente, con parámetros y política iguales.
- Desglosar el coste añadido al corregir una omisión funcional y el ahorro de las optimizaciones exactas.
- No ampliar la búsqueda de optimizaciones tras congelar para conseguir un número favorable.

## 10. Datos que debe devolver la auditoría

### 10.1 Reparto de trabajo

Claude prepara entradas, ejecuta, verifica y entrega datos. ChatGPT hace el análisis deportivo, el contraste externo y las recomendaciones; Dennis decide.

No redactar un ensayo de interpretación ni afirmar que un estilo es superior por una media. Se admiten resúmenes mecánicos: conteos, sumas, medias, medianas, desviación y percentiles identificados.

No aceptar/rechazar una calibración, modificar pesos ni buscar marcadores objetivo.

### 10.2 Por encuentro y equipo

Para todos los partidos válidos y con errores/ausencias tipados:

- Identidades de caso, entrada, perfil, modelo, formato, políticas y ejecución.
- Solicitud/estado/validez, fallo y razón.
- Marcador por equipo/periodo, duración, prórrogas, diferencia y vencedor.
- Controles SIM / posesiones beM / finalizaciones, cada uno en su universo.
- Intentos y aciertos de dos, tres y libres; puntos de campo/libres.
- Rebotes ofensivos, defensivos y colectivos; oportunidades si están registradas.
- Asistencias a canasta/libres, pérdidas individuales/colectivas y robos.
- Tapones puestos/recibidos, faltas cometidas/recibidas, exclusiones.
- Número de jugadores usados, distribución de minutos y máximo de minutos.
- Producción y frecuencia por zona, calidad y origen/familia.
- Ritmo, eficiencia, TS/eFG y tasas existentes con numeradores, denominadores y fórmula/política.
- Estados iniciales/finales y uso de rotación; energía por jugador y presencia cuando el registro lo permita.
- Decisiones de entrenador y órdenes aplicadas: tipo, instante, razón y control afectado.

No confundir dato no conservado con cero. Conservar los contadores brutos aunque entregues porcentajes calculados.

### 10.3 Individual, táctico y temporal

- Una fila por jugador y partido con identidad estable, club del encuentro, participación, titularidad, tiempo exacto y estadísticas.
- Zonas por jugador con intentos/aciertos; calidad cuando esté representada.
- Participación/producción por familia y ficha, incluyendo libres y cierres únicos.
- Director efectivo y roles pertinentes como diagnóstico propio, con intervalos si cambian.
- Quintetos: intervalos, minutos, PF/PC, controles ofensivos/defensivos y tasas declaradas.
- Organización/cobertura/altura: tiempo, puntos recibidos y finalizaciones rivales observadas.
- Evolución por cuarto y tramos/fronteras disponibles.
- Antecedente y posterior a una orden aplicada, con muestra y horizonte.
- Reparto de uso por jugador y concentración de tiros/puntos/minutos, sin interpretar causalidad.

Los mismos jugadores presentes en puestos distintos no se duplican como dos quintetos de personas. Si la posición es relevante, conservarla en un desglose separado identificado.

### 10.4 Resúmenes que ahorran lectura

Entregar resúmenes por:

- Modelo, bloque, equipo y enfrentamiento.
- Escenario/variante y orientación.
- Sin prórroga y con prórroga, separados.
- Estados/energía, roles, director y módulos pertinentes.
- Puntos, volumen, eficiencia, pérdidas, faltas, libres, rebote, asistencias y uso individual.

Incluir conteos de anotaciones de equipo en bandas: <60; 60–69; 70–79; 80–89; 90–99; 100–109; ≥110. Son cortes descriptivos del encargo, no estándares de realismo.

Declarar método de percentiles. No sumar las repeticiones del benchmark o diagnósticos como observaciones independientes.

SIM-MOTOR-02 tenía en su benchmark una media observada de 94,517 puntos por equipo y 94,415 sin prórrogas. Son una señal previa del laboratorio, no una meta ni una referencia ACB. Las rutas corregidas de 02B pueden cambiar esa distribución.

### 10.5 Definiciones comparables y referencias externas

- Entregar un diccionario de cada campo/universo/unidad.
- Identificar qué comparaciones entre modelos son directas y cuáles aproximadas o incompatibles.
- Conservar datos brutos para poder recalcular tasas de forma homogénea después.
- No sumar controles SIM y posesiones beM bajo una etiqueta común de eficiencia.
- El detallado es una referencia funcional congelada; no se considera verdad empírica por estar implementado antes.
- Si el repositorio contiene datasets externos con procedencia comprobable, incluirlos sin modificar con su fuente/temporada/cobertura.
- Si no existen, registrar “referencia externa pendiente de investigación por ChatGPT”.
- No realizar una investigación web extensa, inventar medias de ACB/FIBA/EuroLeague ni dar conformidad FIBA a partir del acta conciliada.

La comparación con competiciones reales se hará al interpretar estos paquetes. La ausencia de esa referencia limita la conclusión deportiva; no impide producir esta evidencia.

### 10.6 Muestra diagnóstica elegida antes de ejecutar

Conservar hechos/diagnóstico completos nativos de:

- Ocho SIM de la comparación: cuatro de A y cuatro de B/C.
- Cuatro detallados: dos de A y dos de B.

Son subconjuntos de las ejecuciones previstas, no doce partidos nuevos. Seleccionarlos antes de conocer el resultado.

Para el resto, conservar entrada efectiva, salida esencial, agregados de auditoría y las proyecciones compactas necesarias para verificar las estadísticas comprometidas.

Las trazas nativas pueden ser grandes. No imprimirlas en consola ni convertirlas en texto narrativo. No retener todos los logs completos si ya existe el registro compacto comprometido.

## 11. Paquetes, comprobador y descarga

### 11.1 Nombres y ubicación

Generar en out/sim-motor03/entrega-final:

- SIM-MOTOR-03-revision-rapida.zip
- SIM-MOTOR-03-indice-partes.json
- SIM-MOTOR-03-evidencia-detallada.zip, o partes numeradas si hace falta
- SIM-MOTOR-03-verificacion-final.json

El rápido identifica que incluye el cierre de 02B. No exigir que Dennis envíe otra vez los ZIP históricos para entender esta entrega.

### 11.2 Revisión rápida

Objetivo orientativo: hasta 8 MiB comprimidos, con datos tabulares manejables. Si se supera, explicar el contenido, sin eliminar información esencial para cumplir un tamaño artificial.

| Archivo | Contenido |
| --- | --- |
| 00-LEEME.md | Orden de lectura, estado real, límites y cómo localizar el detalle |
| 01-IDENTIDAD-Y-CONGELACION.json | Commits, hashes, versiones, perfiles, políticas, dataset, entorno y plan congelado |
| 02-CORRECCIONES-02B.csv | C03-01…11: reproducción, causa, cambio, regresión, evidencia y efecto sobre trayectoria |
| 03-COBERTURA.csv | Requisito/control → productor, estado, audiencia, exposición, limitación |
| 04-PLAN-Y-RECUENTO.csv | Solicitados/ejecutados/válidos/fallidos/etc. por bloque y resolutor |
| 05-MAPA-CASOS.csv | Claves globales, variantes, réplicas, orientaciones, semillas y rutas |
| 06-RESULTADOS-EQUIPO.csv | Contadores brutos y métricas por encuentro/equipo de A/B/C |
| 07-RESUMENES.csv | Resúmenes mecánicos y bandas, separados por modelo/bloque/contexto |
| 08-CONTRASTES.csv | V0/V1 por caso, diferencias de entrada, métricas y tamaños de muestra |
| 09-CAPACIDADES-Y-CONTROLES.csv | Matriz de las 32 capacidades, +1/+3/+5 y controles |
| 10-HISTORIA-Y-APRENDIZAJE.json | Conciliaciones, fuentes, unidades, presupuestos y propuestas comparables |
| 11-EQUIVALENCIA.json | Comparaciones técnicas, diferencias esperadas y diferencias inesperadas |
| 12-RENDIMIENTO.json | Control, optimizaciones, cuatro pasadas, jornada, memoria, costes y salida |
| 13-AUDITORIAS.csv | Resultados automáticos, universos y estados no evaluados |
| 14-PRUEBAS-Y-NAVEGADOR.md | Hecho/pendiente/no ejecutado y recuento de ejecuciones |
| 15-PENDIENTES-Y-LIMITES.md | Defectos/limitaciones reales para análisis y SIM-MOTOR-04 |
| DICCIONARIO.md | Campos, unidades, fórmulas, universos, ausencias y claves de unión |
| ejemplos/ | Una entrada fuente, sus adaptaciones y resultados SIM/detallado, y snapshot válido coherente |

Los nombres son el contrato de lectura de la entrega. Se pueden añadir tablas relacionadas cuando haga falta, sin meter millones de filas dentro de un único JSON.

### 11.3 Evidencia detallada

Incluir:

- Plan/agenda congelados y materialización de entradas; deduplicación por hash admitida.
- Perfiles y tablas efectivas completas con procedencia; diferencias frente a 02.
- Resultados esenciales individuales de A/B/C y benchmarks.
- Tablas individuales, zonas, familias/fichas, quintetos y defensa compacta de Análisis.
- Datos de las sondas de capacidades y controles, con operandos y valores base/modificados.
- Propuestas/recibos de aprendizaje y ledger de historia de prueba.
- Reproducciones de correcciones, snapshots coherentes y comprobaciones de restauración.
- Repeticiones técnicas, resultados comparados y diffs canónicos.
- Mediciones brutas de rendimiento/memoria y muestra de perfilado.
- Resultados nativos de los doce diagnósticos seleccionados y lecturas compactas del resto.
- Fallos, no válidos, interrupciones y reintentos, incluidos los que existieran antes de corregir durante 02B.
- Código de solo lectura suficiente para interpretar generador, lectores, adaptadores, fórmulas, aprendizaje, configuración y scripts de campaña/comprobación.

Si hay herramientas de auditoría nuevas, incluirlas con identidad y versión. No incluir secretos, dependencias instaladas, cachés, sesiones de navegador ni node_modules.

### 11.4 Índice y tamaño

- Índice externo con nombre/tamaño/SHA-256 de cada ZIP.
- Dentro de cada ZIP, manifiesto de ficheros con tamaño/SHA-256.
- Rutas relativas seguras, sin enlaces a archivos que solo existían en el contenedor.
- Partes detalladas de unos 25 MiB comprimidos como máximo orientativo.
- Agrupar por casos completos cuando sea posible; si un diagnóstico necesita dividirse, conservar un índice de reconstrucción explícito.
- Declarar archivos esperados ausentes; no sustituciones ficticias.
- Separar huella de archivo, entrada y trayectoria.

### 11.5 Comprobador offline

Reutiliza/amplía el comprobador existente. Debe funcionar sobre los archivos entregados, sin Git, sin red y sin volver a simular la campaña.

Verificar:

1. ZIP legibles, miembros esperados, tamaños y hashes.
2. Parseo JSON/JSONL/CSV y relaciones entre agendas/entradas/resultados.
3. Recuentos reales, identidad global e intentos aceptados únicos.
4. Sumas de acta, periodos, zonas/familias/libres, cierres y desgloses conservados.
5. Denominadores de quintetos y defensa, incluidos sus conciliaciones con totales.
6. Historia, temporalidad, rechazo de parciales y consecuencias.
7. Dosis/unidades de aprendizaje y protección contra doble aplicación.
8. Comparaciones de equivalencia desde sus datos, sin aceptar solo un booleano precalculado.
9. Lectura/compatibilidad/integridad de los snapshots finales y restauración técnica de sus estados. Restaurar no exige repetir el partido.
10. Conservar original de un ejemplo inválido cuando documente una corrección y no contabilizarlo como guardado utilizable.
11. Congelación de código/datos durante la campaña.
12. Muestra alterada detectada con un rechazo concreto.

El recibo enumera cada comprobación, su fuente, resultado y elementos no evaluados. Un archivo con hashes correctos no acredita por sí solo que sus estadísticas son correctas ni que el motor es realista.

Ejecutar el comprobador sobre los ZIP finales ya construidos, una vez; repetir solo si cambian esos bytes o el propio comprobador. Añadir el recibo fuera del ZIP evita referencias circulares de hashes.

### 11.6 Entrega accesible

Además de conservarlos en out/, adjunta realmente el rápido, el índice y el recibo en la respuesta, y el detallado o sus partes mediante el mecanismo de archivos disponible.

- Comprobar existencia, tamaño y bytes de los adjuntos si la herramienta lo permite.
- Si solo puedes crear archivos del contenedor, decirlo con claridad y dar la ruta y comando de regeneración.
- No afirmar “adjuntados” si no se realizó la acción.
- No dar una ruta de contenedor como enlace descargable.
- No subir los ZIP masivos a Git ni publicarlos en un servicio externo sin una instrucción adicional.

## 12. Documentación y respuesta final

### 12.1 Git y documentación

Actualizar:

- Prompt íntegro y catálogo de docs/prompts.
- Nota técnica de 02B: reproducciones, decisiones, cambios y compatibilidad.
- Nota de campaña de 03: plan congelado, ejecución real, presupuesto y archivos.
- Páginas temáticas pertinentes: guardado/jornada, consecuencias/historia, estadística, retención, entrenador y rendimiento.
- docs/estado.md, changelog e índice del roadmap.
- Recorrido manual SIM-MOTOR-03-recorrido-manual.md con semillas, perfil, pasos y señales de fallo.

El plan congelado debe existir antes de ejecutar; la nota de resultados, después. No redactar la historia como si se hubiese planificado después de conocer los resultados.

No marcar el motor terminado, calibrado, conforme integralmente a FIBA o aceptado manualmente por Dennis.

### 12.2 Respuesta de Claude a Dennis

Responder de forma breve y factual, en este orden:

1. PR, rama, base, commit de código congelado y commit final.
2. C03-01…11: corregido/comprobado/pendiente, con enlaces documentales.
3. Qué cambió en resultados por corrección funcional; qué conserva exactamente la optimización; detallado congelado.
4. Qué puede probar Dennis y dónde está el recorrido manual.
5. Recuento real por bloque/modelo: válidos, no válidos, fallidos, interrumpidos, no ejecutados, reintentos y extras de verificación.
6. Rendimiento: cuatro pasadas, jornada, memoria, fases y objetivo cumplido/no cumplido.
7. Pruebas y navegador hechos; pendiente de Dennis; no ejecutado.
8. Archivos adjuntos reales, tamaños, comprobador y orden de envío a ChatGPT.
9. Límites y defectos pendientes, sin interpretación/calibración deportiva.

No prometer cuota o tiempo de Claude si no se pueden medir. No ofrecer suscripciones, fusiones ni otras acciones ajenas al encargo.

**Cierre de esta entrega:** correcciones verificadas, versión de campaña congelada, datos comparativos íntegros y accesibles. El siguiente paso es que ChatGPT analice esos archivos y proponga a Dennis los ajustes de SIM-MOTOR-04.
