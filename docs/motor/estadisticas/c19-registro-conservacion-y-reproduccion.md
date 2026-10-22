<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 19 — Registro, conservación y reproducción
> Anterior: [c18-reglamento-y-administracion-deportiva](../reglamento/c18-reglamento-y-administracion-deportiva.md) · Siguiente: [c20-p01-unidad-de-finalizacion-de-tiro](c20-p01-unidad-de-finalizacion-de-tiro.md)
<!-- beM:nav-fin -->

<a id="cap-19"></a>

## 19. Registro, conservación y reproducción

<a id="grupo-19-01"></a>

### 19.1. Entradas, registros y vistas

*Procedencia: MD07, §28.*

<a id="src-md07-l1469"></a>

#### 19.1.1. Tres paquetes de entrada

*Origen: MD07 §28.1.*

| ID | Paquete | Datos requeridos |
|---|---|---|
| IN01 | Participantes | Identidad, convocatoria, disponibilidad, capacidades, cuerpo, tendencias y estados iniciales. |
| IN02 | Planes | Estilos, disposición, fichas/prioridades, roles, director, defensa, rotación, saques, política y delegación. |
| IN03 | Contexto/perfiles | Reglamento, estadística, información, importancia, versiones y datos de reproducción. |

Los estados colectivos iniciales y su política pertenecen a las entradas de equipo/perfil. Los valores requeridos no se inventan al primer uso. Un valor inicial neutral o energía completa solo se aplica si la política de entrada lo declara.

<a id="src-md07-l1479"></a>

#### 19.1.2. Ocho registros generados

*Origen: MD07 §28.2.*

| ID | Registro | Relaciones que conserva |
|---|---|---|
| <a id="ref-md07-r01"></a>MD07-R01 | Acontecimientos y continuidad | Identidad, secuencia, reloj, posesión, fase, participantes, causa y consecuencia. |
| <a id="ref-md07-r02"></a>MD07-R02 | Órdenes | Solicitud, validación, ámbito, frontera, vigencia, suspensión, consumo y cierre. |
| <a id="ref-md07-r03"></a>MD07-R03 | Responsabilidades | Referencia, responsabilidad actual, interacción modificadora y recuperación pertinente. |
| <a id="ref-md07-r04"></a>MD07-R04 | Finalizaciones, series y créditos | Acción origen, F, causa de serie, lanzador efectivo, puntos, créditos y revisiones. |
| <a id="ref-md07-r05"></a>MD07-R05 | Estados y episodios | Intervalo, estado previo, tarea, episodio agrupado, impulso y estado posterior. |
| <a id="ref-md07-r06"></a>MD07-R06 | Participación/tramos | Entradas, salidas, quintetos, minutos, presencia y cambios de plan pertinentes. |
| <a id="ref-md07-r07"></a>MD07-R07 | Memoria y decisiones | Patrón, relevancia, respuesta, política y explicación pertinente de elección. |
| <a id="ref-md07-r08"></a>MD07-R08 | Ejecuciones/auditorías | Entradas usadas, perfil, hipótesis, métricas, evidencia y comparación. |

Son responsabilidades semánticas. La implementación puede distribuirlas en estructuras distintas manteniendo identidad y relaciones. No se prescribe una base de datos concreta.

<a id="src-md07-l1494"></a>

#### 19.1.3. Vistas derivadas

*Origen: MD07 §28.3.*

Acta, mapa de tiros, parciales, eficiencia, análisis táctico, quintetos, informes y resumen utilizan esos hechos con sus políticas. La reconciliación de producción separa puntos ligados a F, sanción, administración y otros créditos identificados.

La vista de conocimiento del entrenador se construye con permisos antes de decidir. El núcleo puede usar estados reales para resolver sin que la política del entrenador reciba todos esos campos.

<a id="src-md07-l1500"></a>

#### 19.1.4. Diagnóstico ampliado

*Origen: MD07 §28.4.*

Se conserva todo lo necesario para consultas comprometidas. El nivel diagnóstico puede añadir pesos detallados, candidatos evaluados y contribuciones, identificando su cobertura.

No se inventan alternativas que no fueron evaluadas ni futuros que no se resolvieron. Abrir una traza no consume azar ni actualiza momento por sí mismo.

<a id="src-md07-l1512"></a>

#### 19.1.5. Guardar y continuar

*Origen: MD07 §28.6.*

Se conserva estado suficiente para continuar con continuidad: relojes, participantes, administración pendiente, órdenes, responsabilidades, estados, memoria y reproducción pertinente.

Un tiro o serie pendiente no desaparece por guardar. Una llamada no se renueva indefinidamente al cargar. El cambio de versión de un perfil padre no altera el perfil congelado del encuentro.

<a id="grupo-19-02"></a>

### 19.2. Registro, versiones y modalidades

*Procedencia: MD06, §21.*

<a id="src-md06-l1352"></a>

#### 19.2.1. Registro funcional mínimo añadido

*Origen: MD06 §21.2.*

| Bloque | Datos necesarios |
|---|---|
| Contexto y participantes | Posesión o secuencia, fase, participantes pertinentes y organización efectiva. |
| Defensa | Referencias pertinentes, responsabilidad actual, interacción que la cambió y recuperación o desajuste conservado. |
| Objetivos | Principal, alternativa, disponibilidad, suspensión y sistema efectivo cuando cambia. |
| Cuerpo | Perfil corporal de entrada y contribución derivada pertinente cuando se utiliza. |
| Elección | Orden vigente, rol, grupo de tendencia utilizado, origen directo o ficha y opciones evaluadas al nivel de registro declarado. |
| Orden | Identidad, solicitud, validación, frontera, estado, sustitución y causa de cierre. |
| Ejecución de tiro | Clase, técnica principal, preparación, oportunidad previa, oposición y desenlace. |
| Finalización F | Apertura, acción origen, serie ligada, puntos, autor, lanzadores efectivos y cierre. |
| Estados | Estado previo pertinente, intervalo, episodio elegible, impulso y estado posterior. |
| Información | Vista o conocimiento permitido al entrenador y motivo de avisos relevantes. |
| Versiones | Reglas, contenido, balance, política estadística y política de información. |

El diagnóstico de pesos detallados puede ser más amplio en auditoría que en producción. Los vínculos necesarios para las estadísticas funcionales prometidas no son opcionales.

<a id="src-md06-l1370"></a>

#### 19.2.2. Contexto activo pequeño

*Origen: MD06 §21.3.*

Las asignaciones de cinco jugadores, las funciones del sistema y unas pocas responsabilidades modificadas bastan para representar muchos desajustes. Las fichas solo consultan participantes y relaciones pertinentes.

Los tres momentos individuales y T son estados ya aceptados, no mapas nuevos de todos los movimientos. El historial completo reside en el registro; no tiene que permanecer como contexto deportivo activo de cada decisión.

La memoria defensiva pequeña del MD05 se conserva con sus límites y decaimiento. El registro de órdenes no amplía esa memoria deportiva ni obliga a releer todas las posesiones para elegir una acción.

<a id="src-md06-l1391"></a>

#### 19.2.3. Lecturas sin efectos deportivos

*Origen: MD06 §21.5.*

Abrir una ficha, consultar una auditoría o desplegar un panel no consume una nueva oportunidad deportiva ni altera el azar de la siguiente acción.

Una consulta de estado no debe producir por sí sola otra actualización aleatoria. El mecanismo temporal conserva una evolución coherente con el intervalo y las reglas, independientemente del número de lecturas de interfaz.

<a id="src-md06-l1397"></a>

#### 19.2.4. Versiones y cambios de políticas

*Origen: MD06 §21.6.*

Un informe recalculado con una nueva convención analítica debe identificarse si ya no usa la política original. El marcador histórico y sus hechos no se reescriben para acomodar otra definición de F.

Las comparaciones entre versiones explican qué cambió. No se mezclan en una sola media estados generados bajo coeficientes incompatibles sin identificarlo.

<a id="src-md06-l1403"></a>

#### 19.2.5. Diagnóstico sin omnisciencia narrativa

*Origen: MD06 §21.7.*

El registro puede explicar alternativas que se evaluaron. No debe inventar «habría entrado el pase» si nunca se resolvió ese contrafactual.

Una probabilidad es una estimación del motor bajo sus entradas. No es una certeza de que otro camino hubiese ganado el partido.

<a id="grupo-19-03"></a>

### 19.3. Conservación, historial y partidos del mundo

*Procedencia: MD04, §30.*

<a id="src-md04-l1665"></a>

#### 19.3.1. Objetivo funcional

*Origen: MD04 §30.1.*

Un partido que el usuario no vio debe seguir siendo un encuentro real del mundo de beM, con resultado y producción deportiva coherentes. Los modos rápidos pueden omitir animación o prosa sin perder el acta.

El alcance máximo desea también análisis de rivales, quintetos y tácticas en esos partidos. Por tanto, se conserva la información deportiva necesaria para los productos ofrecidos, no solamente puntos totales y una valoración individual.

<a id="src-md04-l1671"></a>

#### 19.3.2. Familias de información a conservar

*Origen: MD04 §30.2.*

| Familia | Contenido deseado | Qué permite |
|---|---|---|
| Identidad y versiones | Equipos, convocatoria, reglas, política, estado y revisiones | Comparabilidad e historial estable. |
| Resultado | Marcador, periodos, duración y desenlace | Clasificación, resumen y calendario. |
| Acta | Créditos individuales/colectivos y totales | Estadísticas habituales y carrera. |
| Secuencia de anotación | Orden, reloj, valor y sujeto | Evolución, parciales, tiempos de ventaja y momentos. |
| Presencia | Entradas, salidas, funciones y grupos | Minutos, más-menos, rotación, quintetos y on/off. |
| Posesiones y acciones | Origen, continuidad, participantes y cierre | Eficiencias y lectura táctica. |
| Tiros y oportunidades | Valor, sector, preparación, oposición y validez | Mapas y selección de tiro. |
| Cambios efectivos de plan | Momento y contexto aplicable | Antes/después y ejecución del propio plan. |
| Hechos ampliados | Pantallas, ayudas, cierres y creación realmente registrados | Contribuciones sin balón. |
| Estados autorizados | Energía y otros estados con visibilidad definida | Análisis propio de carga y rendimiento. |

La presentación narrativa puede generarse desde esos hechos. Conservar todas las frases del relato no es requisito para conservar el partido deportivo.

<a id="src-md04-l1688"></a>

#### 19.3.3. Compatibilidad entre modalidades

*Origen: MD04 §30.3.*

| Modalidad | Resultado/acta | Alcance analítico deseado | Diferencia permitida |
|---|---|---|---|
| Visionado completo | Mismo catálogo | Completo | Ritmo visual x2/x4/x8/x16. |
| Avance por cuartos | Mismo catálogo | Acumulado y por periodo | Intervención en ventanas correspondientes. |
| Simulado completo | Mismo catálogo | Completo | Entrenadores automáticos y presentación posterior. |
| Partido del mundo sin visionado | Mismo catálogo | Completo para las vistas ofrecidas | Puede omitir prosa/animación. |
| Historial antiguo con datos reducidos | Acta y derivados reconstruibles | Según cobertura real | Debe indicar qué no se conservó. |

La semilla y las órdenes idénticas aplicadas en los mismos momentos deportivos deben producir el mismo desarrollo, aunque se consuma con distinta velocidad. Un usuario que interviene cambia las entradas, por lo que la comparación no exige el mismo partido.

<a id="src-md04-l1700"></a>

#### 19.3.4. Agregados y consulta retrospectiva

*Origen: MD04 §30.4.*

Un agregado de temporada puede acelerar una consulta, pero no debe alterar el significado de campos. Si se ofrece un cruce retrospectivo por familia, cinco y presión, se necesita conservar sus relaciones o un agregado que responda exactamente a esa consulta.

Guardar solo totales marginales por cada eje no permite reconstruir todos sus cruces. Saber diez tiros contra zona y diez tiros del jugador no permite saber cuántos tiros de ese jugador fueron contra zona. El diseño debe evitar prometer filtros que los datos conservados no pueden contestar.

La elección técnica entre hechos, agregados y ambos queda abierta. El requisito funcional es saber qué preguntas quedan respondidas y mantener el alcance máximo elegido, sin simular por segundo para conservarlo.

<a id="src-md04-l1708"></a>

#### 19.3.5. Historial de identidad

*Origen: MD04 §30.5.*

Los partidos conservan equipo, plantilla, rol/posición contextual y reglas de aquel momento. Un traspaso no mueve puntos antiguos al nuevo club. Un cambio de rol no reescribe la actuación histórica.

La carrera puede mostrar totales por club, competición, temporada y etapa. La comparación intercompetición tiene que exponer diferencias de reglas, duración y política, sin convertir la escala de atributos en una valoración estadística única.

<a id="src-md04-l1714"></a>

#### 19.3.6. Correcciones y clasificaciones

*Origen: MD04 §30.6.*

Una corrección invalida o recalcula derivados dependientes: totales de temporada, récords, resumen, mapas, parciales y comparaciones. El cambio debe propagarse de forma coherente.

Un récord o clasificación con un partido corregido identifica la versión vigente. El usuario no tiene que descubrir el error comparando dos pantallas que ofrecen resultados incompatibles.

<a id="grupo-19-04"></a>

### 19.4. Información funcional que necesita el registro

*Procedencia: MD04, §32.*

<a id="src-md04-l1770"></a>

#### 19.4.1. Inventario semántico

*Origen: MD04 §32.1.*

Este apartado describe información necesaria, no un esquema técnico obligatorio. No fija tablas de base de datos, clases, formatos JSON ni una API.

| Familia | Información semántica requerida |
|---|---|
| Orden | Identificador de hecho, orden estable, periodo, reloj y tiempo de juego consumido. |
| Contexto deportivo | Marcador previo, posesión activa, control/derecho, relojes y continuidad. |
| Participantes | Sujetos pertinentes, equipo, función y responsabilidad resuelta. |
| Presencia | Cinco efectivo en cada anotación y relaciones con entradas/salidas. |
| Plan | Versión activa propia, disposición/organización ejecutada y ventana de aplicación. |
| Acción | Familia/variante iniciada, decisión, respuesta y alternativa representada. |
| Oportunidad | Clasificación previa, preparación, sector y oposición funcional. |
| Tiro | Tirador, validez, valor, resultado, tipo y eventual causa de anulación/repetición. |
| Pase | Emisor, receptor, relación creadora y contexto requerido para asistencia. |
| Control | Causa de pérdida, intervención defensiva y captor posterior si difiere. |
| Rebote | Fallo elegible, control final, sujeto y contexto ofensivo/defensivo. |
| Falta | Infractor, receptor elegible, tipo, contadores y penalización. |
| Libres | Serie, causa, intentos, validez, anotación y reanudación. |
| Cierre | Motivo, tiempo final, puntos vinculados y categoría administrativa separada. |
| Estado | Cambios pertinentes de energía/disponibilidad y visibilidad. |
| Revisión | Hecho corregido, motivo, versión y consecuencias estadísticas. |

Cada acontecimiento solo necesita las familias aplicables. Un cambio de jugador no lleva campos de tiro; un libre no genera artificialmente una cobertura de pantalla. La riqueza procede de relacionar hechos pertinentes.

<a id="src-md04-l1795"></a>

#### 19.4.2. Identificadores funcionales

*Origen: MD04 §32.2.*

Es necesario relacionar partido, periodo, posesión, acción/continuación, intento, serie de libres, pase elegible, crédito y tramo. Un mismo número de reloj no basta para identificarlos.

Las identidades de jugador/equipo deben ser estables. El nombre de una jugada no sirve como identidad de patrón si puede duplicarse o renombrarse. La continuidad se relaciona con la acción deportiva que se ejecutó.

<a id="src-md04-l1801"></a>

#### 19.4.3. Qué puede derivarse y qué necesita dato original

*Origen: MD04 §32.3.*

| Puede derivarse con registros suficientes | Necesita información previa que no se recupera del acta |
|---|---|
| Puntos, porcentajes y valoración | Sector y preparación del tiro. |
| Minutos desde presencia | Responsabilidades defensivas de la acción. |
| Más-menos desde presencia + anotaciones | Calidad previa de oportunidad. |
| Parciales desde secuencia de puntos | Familia efectivamente iniciada y alternativas. |
| On/off desde presencia + posesiones | Director de la decisión si difiere del puesto nominal. |
| Mapas desde tiros clasificados | Pantallas, ayudas o cierres sin crédito de acta. |
| Comparación por periodo | Orden pendiente/activa y motivo representado de cambio. |

Si falta el dato original, no se inventa retrospectivamente. Un 2/8 no revela si fueron ocho tiros forzados o ocho liberados.

<a id="src-md04-l1815"></a>

#### 19.4.4. Relación con los tres grupos del motor

*Origen: MD04 §32.4.*

| Grupo del Documento 03 | Aporta al registro | Lecturas que habilita |
|---|---|---|
| Selección de intenciones y participantes | Origen, director, familia, participantes y contexto disponible | Uso del libro, roles y alternativas. |
| Oportunidades y desenlaces | Preparación, oposición, resultado y continuidad | Acta, mapas, creación y lectura defensiva. |
| Tiempo, esfuerzo y estados | Duración, presencia, carga, reanudación y disponibilidad | Minutos, energía, ritmo, rotación y evolución. |

La estadística observa lo que esas tablas producen. No añade otra fase de resolución que cambie sus resultados para alcanzar medias deseadas.

<a id="grupo-19-05"></a>

### 19.5. Población, modalidades y conservación

*Procedencia: MD05, §15.*

<a id="src-md05-l1068"></a>

#### 19.5.1. Guardar, continuar y reproducir

*Origen: MD05 §15.5.*

Una continuación conserva estado deportivo, contexto activo, estados individuales/colectivos, memoria, órdenes pendientes y situación del azar o una reconstrucción equivalente. Reabrir no recupera energía gratuitamente ni olvida al rival.

La semilla sola no basta si cambian algoritmo, parámetros o entradas. Para repetir se necesita identificar el conjunto completo pertinente. Las órdenes manuales deben incluir su oportunidad efectiva de aplicación.

Consultar un partido histórico usa sus hechos conservados. No vuelve a simular bajo parámetros nuevos para reconstruir su resumen.

### Nota de implementación MOTOR-18 (Exposición y audiencias de la familiaridad (MOTOR-18))

El resultado exportado y el registro esencial conservan la instantánea de conocimiento, un resumen de aplicación y la exposición final por jugador y conocimiento (con unidad). El público y el rival no reciben conocimiento, Polivalencia ni enseñanza; la audiencia propia solo su equipo; el diagnóstico va identificado. Detalle: `docs/tecnico/motor18.md`.

### Nota de implementación MOTOR-18B (Exposición terminada, unidades y reproducción)

El aprendizaje de partido exige una exposición **terminada** (`complete === true`) producida por un productor común. Unidades: `min_tenths`/`liveTenths` son **décimas de segundo de juego vivo** (600 = 1 minuto; 24.000 = 40 minutos; nombre histórico del campo conservado); los créditos de módulo son participaciones ponderadas por operación (no horas ni posesiones) y las dosis son horas equivalentes. El resultado conserva, solo en el laboratorio, la identidad estable del encuentro (`input.labMatchId`). Un export de MOTOR-18 se consulta como histórico y no se reproduce con el motor `0.18.1-MOTOR18B`. Detalle: `docs/tecnico/motor18b.md`.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c18-reglamento-y-administracion-deportiva](../reglamento/c18-reglamento-y-administracion-deportiva.md) · Siguiente: [c20-p01-unidad-de-finalizacion-de-tiro](c20-p01-unidad-de-finalizacion-de-tiro.md)
