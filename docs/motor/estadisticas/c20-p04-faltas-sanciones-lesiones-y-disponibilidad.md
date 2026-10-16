<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 20 — Estadísticas: acta, atribución y magnitudes · parte 4 de 6
> Anterior: [c20-p03-atribucion-que-hecho-produce-cada-registro](c20-p03-atribucion-que-hecho-produce-cada-registro.md) · Siguiente: [c20-p05-catalogo-avanzado-y-formulas](c20-p05-catalogo-avanzado-y-formulas.md)
<!-- beM:nav-fin -->

<a id="grupo-20-14"></a>

### 20.14. Faltas, sanciones, lesiones y disponibilidad

*Procedencia: MD04, §12.*

<a id="src-md04-l0585"></a>

#### 20.14.1. Tres contadores separados

*Origen: MD04 §12.1.*

El diseño separa faltas estadísticas cargadas, faltas que cuentan para el bonus del equipo y contadores disciplinarios de descalificación. Una misma sanción puede afectar a varios, pero no siempre con idéntico efecto.

| Sujeto/efecto | Información necesaria |
|---|---|
| Jugador infractor | Tipo de falta, contador personal aplicable y retirada cuando corresponda. |
| Jugador receptor | Crédito de falta recibida cuando sea elegible. |
| Equipo | Contador de periodo y condición de bonus según reglamento. |
| Entrenador/banquillo | Sujeto y sanción propios; sin copiarla a un jugador. |
| Penalización | Libres, saque, conservación de control y reloj de reanudación. |
| Descalificación | Motivo reglamentario y momento de salida. |

La presentación puede agrupar FC en la tabla principal y desplegar el detalle. No se presupone que FC de un equipo sea igual a FR del contrario: sanciones técnicas o de banquillo pueden no tener jugador receptor acreditable.

<a id="src-md04-l0600"></a>

#### 20.14.2. Tipos y contexto

*Origen: MD04 §12.2.*

Se desea clasificar faltas de tiro, de control/ofensivas, de pantalla, tácticas para parar el reloj, contactos defensivos ordinarios y categorías disciplinarias de la edición elegida.

La intención táctica se registra cuando el motor la resolvió como orden/intención, no cuando el informe la deduce del número de faltas. El acto y la sanción deben seguir el reglamento: ordenar «falta táctica» no permite al entrenador escoger una penalización que no corresponde.

No se fijan aquí los nombres definitivos de las categorías especiales: el perfil 2026 y un perfil anterior pueden diferir. El diseño exige que el glosario, el acta y el relato consulten la edición activa.

<a id="src-md04-l0608"></a>

#### 20.14.3. Bonus y problemas de faltas

*Origen: MD04 §12.3.*

La cronología permite ver cuándo entró un equipo en bonus y qué cambios coincidieron con faltas personales. Un aviso de «problemas de faltas» debe mostrar el contador y el umbral que utiliza; la interpretación del entrenador puede ser más prudente que el límite reglamentario.

Los libres derivados del bonus mantienen su causa. No se transforman en faltas de tiro para explicar por qué hubo dos lanzamientos.

<a id="src-md04-l0614"></a>

#### 20.14.4. Lesiones y salidas

*Origen: MD04 §12.4.*

Una lesión durante el encuentro muestra momento, retirada efectiva y efecto sobre la rotación, con el nivel de información autorizado. No crea pérdidas, faltas o tiros por sí misma.

La causa médica y recuperación entre encuentros corresponden al sistema de salud posterior. Aquí se conserva el acontecimiento de disponibilidad necesario para el partido. No se añade un atributo de durabilidad.

<a id="src-md04-l0620"></a>

#### 20.14.5. Participación mínima y no jugó

*Origen: MD04 §12.5.*

Si un jugador entró en pista durante un intervalo brevísimo o durante libres sin consumo de reloj, debe distinguirse de quien no entró. La política de redondeo visible puede mostrar menos de un segundo o una indicación de participación; no se inventa un minuto de juego.

Su más-menos puede ser distinto de cero aunque su tiempo de juego registrado sea cero. En tal caso una tasa por minuto queda sin denominador; los puntos y créditos válidos permanecen.

<a id="grupo-20-15"></a>

### 20.15. Minutos, tramos y más-menos

*Procedencia: MD04, §13.*

<a id="src-md04-l0628"></a>

#### 20.15.1. Cálculo de minutos

*Origen: MD04 §13.1.*

El tiempo se obtiene sumando intervalos entre entrada y salida con reloj de juego. No necesita actualizarse cada segundo. Una permanencia de 4:37 se acredita como tal aunque dentro de ella el motor solo haya resuelto un conjunto de acontecimientos.

La pausa no consume minutos. Las prórrogas sí. Un jugador que continúa entre dos periodos tiene presencia en ambos, aunque se separen los intervalos para el desglose.

Si hay cinco jugadores en pista durante todo el tiempo de juego, la suma exacta de minutos individuales de un equipo es cinco veces la duración disputada. Si el reglamento permite una situación excepcional con menos jugadores, la comprobación usa el número activo real por intervalo; no añade minutos a un sustituto ficticio.

<a id="src-md04-l0636"></a>

#### 20.15.2. Qué es un tramo

*Origen: MD04 §13.2.*

Un tramo identifica un intervalo con una combinación estable para la pregunta estudiada. Puede dividirse por cambio de cinco, de director, de plan o de periodo. No se crean tramos por cada segundo.

Un cambio de cinco y un cambio táctico pueden ocurrir en el mismo momento. El orden de aplicación y de anotación decide qué combinación está vigente en cada hecho. El identificador de tramo permite reconstruirlo sin depender del orden visual de filas.

<a id="src-md04-l0642"></a>

#### 20.15.3. Más-menos individual

*Origen: MD04 §13.3.*

Cada anotación válida suma el cambio de margen a quienes estaban efectivamente en pista en ese momento. El cálculo atiende al orden del registro incluso si varias acciones tienen el mismo reloj.

El más-menos responde «qué diferencia hubo durante su presencia». No mide aisladamente mérito personal. Depende de compañeros, rivales, acierto, momento y rotación. Debe consultarse junto a minutos y contexto.

<a id="src-md04-l0648"></a>

#### 20.15.4. Más-menos de combinaciones

*Origen: MD04 §13.4.*

Un quinteto recibe la diferencia de puntos de sus tramos reales. Una pareja recibe los hechos en que ambos estaban presentes; varias parejas se solapan y sus cifras no se suman como una partición del resultado.

El marcador durante una presencia y el resultado de posesiones completas en esa presencia son universos distintos. Si se cambia a un jugador antes del último libre, el reparto del marcador sigue a quienes lanzan/defienden en pista; el análisis de posesión puede clasificar ese ataque como mixto. Ninguno de los dos debe falsear al otro.

<a id="src-md04-l0654"></a>

#### 20.15.5. Rotación visual

*Origen: MD04 §13.5.*

La propuesta máxima incluye una banda temporal por jugador con periodos, entradas, salidas, retiradas y cambios relevantes. Los tramos pueden mostrar duración, puntos del equipo, puntos rivales y planes activos.

La banda representa intervalos de presencia. No necesita animar movimientos ni mostrar una muestra por segundo. Puede permitir pulsar un tramo y abrir los acontecimientos que lo componen.

<a id="grupo-20-16"></a>

### 20.16. Posesiones, continuaciones y eficiencia

*Procedencia: MD04, §14.*

<a id="src-md04-l0662"></a>

#### 20.16.1. Definición vigente de posesión beM

*Origen: MD04 §14.1.*

Se utiliza una unidad ofensiva que empieza cuando un equipo obtiene control o el derecho efectivo a iniciar un ataque y termina cuando ese ataque se cierra, el rival adquiere el control/derecho correspondiente o finaliza el periodo mientras el ataque estaba activo.

Dentro de ella pueden existir varios tiros, rebotes ofensivos, faltas, libres y reanudaciones. El número de acontecimientos calculados no es su número de posesiones. Tampoco lo es el número de familias o pases.

Esta definición se denomina **posesión beM registrada**. Es exacta respecto al criterio del propio motor, pero no se presenta como equivalente universal de todas las convenciones FIBA, ACB, NBA o fórmulas estimadas desde un acta. La continuidad quedó aceptada en MD05 y se mantiene en MD06–07. Es la convención vigente de beM.

<a id="src-md04-l0670"></a>

#### 20.16.2. Tabla de continuidad

*Origen: MD04 §14.2.*

| Desenlace | Tratamiento vigente de la posesión |
|---|---|
| Canasta de campo normal sin continuidad especial | Cierra; el rival inicia cuando recibe control/derecho. |
| Canasta y libre adicional | Mantiene la unidad hasta resolver la serie y su continuación. |
| Fallo y rebote ofensivo | Continúa la misma posesión. |
| Fallo y rebote defensivo | Cierra y abre el ataque rival. |
| Pérdida con cambio de control | Cierra, aunque no llegó a iniciarse familia táctica. |
| Falta con saque para el mismo ataque | Continúa. |
| Libres ordinarios y control posterior rival | Cierra tras resolver la serie y la continuación. |
| Último libre fallado y rebote ofensivo | Continúa. |
| Sanción con libres y saque retenido para el mismo ataque | Continúa si existe la misma unidad ofensiva; conserva el contexto especial. |
| Balón fuera con saque del mismo equipo | Continúa. |
| Cambio por alternancia | Cierra o continúa según a quién se concede el siguiente derecho. |
| Fin de periodo con ataque activo | Cierra con causa «fin de periodo»; no fabrica PER. |
| Periodo termina sin ataque activo | No crea una posesión vacía para rellenar una alternancia. |
| Libre administrativo sin ataque propio | No crea por sí solo una posesión nueva. |

El reloj reglamentario de posesión y la unidad estadística no tienen que reiniciarse juntos. Un reinicio a 14 segundos tras rebote ofensivo no cambia el identificador de esta unidad.

<a id="src-md04-l0691"></a>

#### 20.16.3. Puntos vinculados y puntos administrativos

*Origen: MD04 §14.3.*

Se vinculan a la posesión los puntos ordinarios de sus acciones y sanciones ofensivas pertinentes. Una sanción administrativa independiente, especialmente si anota el equipo que no estaba atacando, conserva su causa separada sin fabricarle una posesión de duración cero.

El total del marcador incluye todos los puntos válidos. Por tanto:

`PTS totales = PTS vinculados a posesiones + PTS administrativos no vinculados`

La eficiencia global del equipo puede usar todos los puntos del marcador por posesión registrada, siempre indicando esta política. La eficiencia por familia táctica usa puntos vinculados a esas posesiones; la fila administrativa queda separada. No se exige que la suma de una tabla de familias sin esa fila cuadre por sí sola el marcador.

La causa y la unidad vinculada determinan la atribución: F, sanción y administración se distinguen según su definición vigente. Las correspondencias de casos extraordinarios se completan como contenido reglamentario y estadístico, conservando el detalle necesario sin inventar ataques.

<a id="src-md04-l0715"></a>

#### 20.16.4. Conteos por periodo y por tiempo

*Origen: MD04 §14.5.*

Las posesiones cierran antes de pasar al siguiente periodo y no lo atraviesan. Pueden cruzar cambios de quinteto, director o plan dentro del periodo.

Para bloques temporales internos se propone clasificar el cierre por su instante, conservando inicio y duración. El filtro debe decir si usa cierre, inicio o contención completa. No se cambia el criterio dependiendo del resultado.

Una ventana que corta un ataque no puede repartirlo en dos posesiones reales. Puede ofrecer créditos de hechos ocurridos dentro de la ventana y, separadamente, resultados de posesiones completas elegibles.

<a id="src-md04-l0723"></a>

#### 20.16.5. Posesiones exactas y estimadas

*Origen: MD04 §14.6.*

El motor dispone del registro para contar sus unidades reales. No necesita aplicar `TCI + 0,44 × TLI − RO + PER` para inventarlas. Esa expresión puede conservarse como estimación convencional de comparación, con su etiqueta y sus límites.

Los equipos pueden acabar con una posesión registrada de diferencia por condiciones de inicio/cierre. No se fuerza que tengan el mismo número mediante medias o unidades ficticias.

<a id="src-md04-l0729"></a>

#### 20.16.6. Denominadores de eficacia

*Origen: MD04 §14.7.*

Para cualquier eficiencia deben conocerse equipo, universo y puntos incluidos. «1,12 puntos por posesión» no basta si unas filas usan puntos propios totales y otras solamente tiros tras una acción.

Las vistas distinguen eficiencia global, por posesión de origen táctico, por ejecución concreta y por finalización. Una ejecución exitosa puede dar una ventaja que termina en otra acción; eso no produce dos créditos de puntos en el total principal.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c20-p03-atribucion-que-hecho-produce-cada-registro](c20-p03-atribucion-que-hecho-produce-cada-registro.md) · Siguiente: [c20-p05-catalogo-avanzado-y-formulas](c20-p05-catalogo-avanzado-y-formulas.md)
