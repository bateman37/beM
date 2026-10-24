# beM · SIM-MOTOR-04

## Correcciones verificables, convergencia estadística, rendimiento y auditoría final

**Destinatario:** Claude Code.  
**Repositorio autorizado:** `bateman37/beM`, exclusivamente.  
**Fecha:** 23 de octubre de 2026.  
**Entrega:** SIM-MOTOR-04, cuarta entrega del roadmap del generador estadístico por tramos.  
**Resultado esperado:** implementación, candidata deportiva identificada, medición real, auditoría acotada y archivos descargables para la revisión de ChatGPT y Dennis.

Dennis encarga ejecutar este documento. Las decisiones funcionales, el presupuesto de campaña y las semillas nuevas que figuran aquí están autorizados para construir y evaluar candidatas. La aceptación deportiva final y el recorrido manual corresponden a Dennis. No conviertas una selección mecánica de candidata en una aprobación empírica o en una autorización para cambiar el motor detallado.

**Orden vinculante:** comprobar base → reparar lectores e instrumentos → corregir mecanismos SIM → comparar candidatas dentro del presupuesto → fijar candidata → optimizar sin cambiar su deporte → congelar → ejecutar reserva y mediciones finales → empaquetar.

Una sola entrega y una PR según el estado real de Git. No abrir otra fase de diseño ni reconstruir la lógica por posesiones dentro de SIM.

## Índice

1. [Objetivo y límites](#1-objetivo-y-límites)
2. [Base, Git y documentación](#2-base-git-y-documentación)
3. [Diagnóstico de partida](#3-diagnóstico-de-partida)
4. [Correcciones obligatorias](#4-correcciones-obligatorias)
5. [Contratos, estados y aprendizaje](#5-contratos-estados-y-aprendizaje)
6. [Referencias y criterios de calibración](#6-referencias-y-criterios-de-calibración)
7. [Candidatas numéricas y selección reproducible](#7-candidatas-numéricas-y-selección-reproducible)
8. [Rendimiento exacto y memoria](#8-rendimiento-exacto-y-memoria)
9. [Plan congelado y presupuesto de ejecuciones](#9-plan-congelado-y-presupuesto-de-ejecuciones)
10. [Reserva deportiva y contrastes finales](#10-reserva-deportiva-y-contrastes-finales)
11. [Equivalencia, jornada, historia y aprendizaje](#11-equivalencia-jornada-historia-y-aprendizaje)
12. [Medición final de mil partidos](#12-medición-final-de-mil-partidos)
13. [Pruebas, interfaz y cierre](#13-pruebas-interfaz-y-cierre)
14. [Archivos para ChatGPT](#14-archivos-para-chatgpt)
15. [Comprobador y entrega accesible](#15-comprobador-y-entrega-accesible)
16. [Respuesta final y estados de aceptación](#16-respuesta-final-y-estados-de-aceptación)

## 1. Objetivo y límites

### 1.1 Qué debe quedar conseguido

SIM-MOTOR-04 tiene tres bloques internos:

| Bloque | Trabajo | Evidencia de cierre |
| --- | --- | --- |
| A · Corrección | Rebote colectivo, identificación del bloqueador, familiaridad de presión, lectores de zonas e instrumentos de prioridad | Regresiones pequeñas, cálculos sin azar y tablas conciliadas |
| B · Convergencia | Volumen, distribución de zonas, asistencias y gasto de energía mediante pocas candidatas | Diferencias exactas de perfiles, selección reproducible y reserva nueva |
| C · Escala | Evitar proyecciones innecesarias al construir el esencial, limitar retención y reducir el coste del cierre simultáneo | Igualdad deportiva frente al control preoptimización y mediciones de lote/jornada |

El objetivo no es igualar un marcador concreto. Es que el mismo jugador y el mismo plan produzcan un baloncesto reconocible en ambos resolutores, con estadísticas utilizables en el manager.

### 1.2 Decisiones que se conservan

- Motor detallado de MOTOR-18C congelado: conserva deporte, datos, decisiones y referencia. Se utiliza para el sénior propio y los encuentros que el diseño vigente asigne expresamente a visionado detallado.
- SIM resuelve el resto, incluida la cantera propia, mediante generación estadística por tramos.
- La ejecución agrupada de Referencia y la Simulada usan el mismo generador. Cambia la conservación, no las reglas deportivas ni la intervención automática del entrenador.
- Consultar un resultado no cambia su resolutor y no vuelve a simularlo.
- Permanecen las 32 capacidades. No crear nuevas capacidades deportivas.
- Polivalencia, enseñanza y competencia de aprendizaje conservan sus funciones posteriores al encuentro.
- El conocimiento se congela al preparar el partido. El aprendizaje se propone al terminar y se aplica una vez al encuentro lógico y equipo correspondiente.
- Los partidos simultáneos comparten presente deportivo y clasificación en directo. No requieren un hilo físico por encuentro.
- Toda cifra deportiva nueva o ajustable vive en las tablas/perfiles administrables, con origen, unidad, efecto y versión.
- No activar perfiles, convertir guardados ni aceptar candidatas silenciosamente.

### 1.3 Fuera de alcance

No implementar mercado, contratos, economía, calendario mundial definitivo, envejecimiento, entrenamiento de varias temporadas, interfaz visual de retransmisión, nuevas jugadas, desplazamientos ni normativa deportiva pendiente del detallado.

No crear un tercer motor. No reducir las estadísticas individuales, las capacidades, los controles tácticos soportados ni las revisiones del entrenador para alcanzar una cifra de tiempo.

No consultar otros repositorios: ni `v-apps`, ni Basket Manager, ni BeManager, ni repositorios de terceros. Los archivos antiguos DESIGN/CLAUDE de otros proyectos no son la autoridad funcional de esta entrega.

## 2. Base, Git y documentación

### 2.1 Estado comunicado, pendiente de comprobar en el entorno

- PR #21: comunicada abierta, título SIM-MOTOR-01 + 02 + 02B + 03.
- Rama: `claude/busy-edison-b1fmnc`.
- Base histórica: `606c33b`.
- SIM-MOTOR-02 terminaba en `4194158`.
- Código congelado de la campaña 03: `24187fe`.
- Commit final comunicado de 03: `c2145fd`.
- Control preoptimización de 03: `ee14ec5`.

Verifica el estado real antes de editar:

1. Leer AGENTS.md, normas y el índice del repositorio.
2. Registrar rama, HEAD, base de PR y estado de Git.
3. Si #21 sigue abierta y contiene 01–03, continuar en ella y actualizar título/descripción para reflejar el resultado final 01–04.
4. Si ya está fusionada, crear una rama desde main actualizado y una PR independiente.
5. Si hay trabajo ajeno o commits nuevos, conservarlos y explicar qué base utilizas. No reiniciar una rama ocupada ni forzar historia ajena.
6. Subir el trabajo y dejar la PR abierta, sin fusionar ni suscribirte.

Se pueden usar checkouts/worktrees aislados del mismo repositorio beM para ejecutar R0 y el control preoptimización. No introducir resolutores históricos alternativos en el producto para sostener el benchmark.

### 2.2 Lectura dirigida

Reutiliza las rutas actuales equivalentes a:

- `docs/prompts/`, notas técnicas y plan de SIM-MOTOR-03.
- `src/sim/`: model, engine, materialize, profile, tables, probe, result, analysis, essential, readers, reconcile, snapshot, shard, pool, exposure y learning.
- `src/matchday/`, `src/season/` y `src/simbatch/`.
- `scripts/sim03/`: lib, probes, tables, make-tables, rendimiento, package y verify-delivery.
- Catálogos de funciones, fichas, roles, familiaridad, políticas del entrenador y unidades de aprendizaje.

Consulta el funcional íntegro solo cuando las páginas temáticas y los contratos no resuelvan una cuestión. No releer ni reescribir cientos de páginas sin necesidad.

Archiva este prompt íntegro como `docs/prompts/SIM-MOTOR-04-correcciones-calibracion-y-cierre.md`, con entrada en el catálogo. No sustituirlo por un resumen.

### 2.3 Identidad y controles

Separar, como mínimo:

| Identidad | Significado |
| --- | --- |
| R0 | SIM-MOTOR-03 congelado, código y perfil históricos comprobados |
| R1 | SIM con las correcciones funcionales de 04 y sus semillas nuevas, sin las candidatas numéricas de calibración |
| C04-* | Vectores numéricos candidatos sobre R1 |
| C04-FINAL-PROVISIONAL | Vector elegido por las reglas de este encargo, pendiente de aceptación deportiva |
| O04-CONTROL | Código con mecanismos y vector final ya fijados, antes de las optimizaciones exactas |
| O04-FINAL | Código optimizado con los mismos mecanismos y el mismo vector que O04-CONTROL |

Registrar aplicación, implementación SIM, schema de entrada/resultado/estado, perfil efectivo, huella de parámetros, tablas, política estadística, cobertura, dataset y huella de entrada por separado.

La aplicación dice SIM-MOTOR-04. Añade una extensión de perfil identificada, por ejemplo `SEM-SIM04-20261023`, sin mutar las filas históricas de 01/02. La candidata incluye su vector y huella propios. Incrementa los formatos que realmente cambien; no renumeres todos los contratos por el mero número de entrega.

La referencia detallada de conservación sigue siendo semilla `20261016`, **83–98**, **6.684 sorteos** y su huella congelada. No usarla como objetivo de calibración de SIM.

## 3. Diagnóstico de partida

Estos datos proceden de la revisión de los paquetes de 03. Son contexto del encargo, no objetivos que deban reproducirse tras los cambios.

### 3.1 Comparación compartida

En las mismas 48 entradas naturales, 96 líneas de equipo por modelo:

| Media por equipo y partido | SIM | Detallado |
| --- | ---: | ---: |
| Puntos | 94,42 | 82,32 |
| Intentos de campo | 74,10 | 60,51 |
| Intentos de tres | 31,46 | 21,63 |
| Acierto de dos | 51,86 % | 58,48 % |
| Acierto de tres | 37,91 % | 39,84 % |
| Intentos de libre | 17,80 | 13,86 |
| Pérdidas | 15,59 | 9,85 |
| Robos | 7,78 | 6,92 |
| Asistencias a canasta | 13,15 | 20,74 |

La diferencia principal está en el volumen y su composición. No se autoriza bajar genéricamente la puntería para compensarlo. Tampoco subir robos de forma general por una impresión histórica.

En A completo de SIM: 94,54 puntos por equipo; 4,83 % de actuaciones por debajo de 70; 38,02 % de 100 o más. Son distribuciones de laboratorio, no una temporada real.

### 3.2 Hallazgos localizados

- La media de fuerza de los reboteadores enviados hace que añadir participantes más débiles reduzca la probabilidad ofensiva. En una sonda pasa de 36,52 % con uno a 27,06 % con cuatro.
- `zone.csv` contiene 82.030 filas SIM sin intentos informados: el esencial usa arrays y el lector espera objetos.
- Las zonas del detallado omiten 415 canastas con falta de los 72 encuentros: 8.194 intentos en CSV frente a 8.609 en el acta.
- Ninguna ficha tiene `play.screen.role`; sí existen funciones `roles.screener`. El registro de bloqueador queda vacío en los 1.632 SIM, aunque TEC09 participa en la calidad.
- B12/S4 despriorizan los bloqueos al asignarles prioridad 5. Los pesos `[8,5,3,2,1]` favorecen prioridad 1.
- El módulo de presión no tiene representación de familiaridad en el SIM actual.
- Las asistencias a canasta representan aproximadamente el 39 % de las canastas de SIM frente al 66 % del detallado en las entradas compartidas.
- En A de SIM, el 91,5 % de las actuaciones de equipo tiene algún jugador con 40 minutos o más. El detallado también muestra muchos casos.
- Los perfiles de estrés EQ06-J03 y EQ11-J03 promedian 52,49 y 43,15 puntos en SIM; también producen extremos en el detallado.

### 3.3 Rendimiento comunicado

- Media de seis pasadas calientes finales de 03: 8,70 s por 1.000, frente a 9,38 del control de la misma sesión.
- Jornada coordinada final: aproximadamente 19 s por 1.000.
- RSS de jornada final: 2.662–2.676 MiB, frente a unos 2.315 MiB del control.
- En la frontera de 2.400 s deportivos terminan 970 encuentros y su avance tarda unos 4,7–4,8 s.

El objetivo de **1.000 partidos en 5 s con cuatro workers y esencial individual validado y disponible en el coordinador** sigue abierto.

## 4. Correcciones obligatorias

Implementar las siguientes correcciones en SIM o sus lectores. No tocar el deporte detallado.

### C04-01 · Contribución colectiva al rebote ofensivo

**Causa:** `reboundModel` selecciona los mejores participantes y usa su media como RA. La media baja al añadir jugadores de menor fuerza. El coste de balance ya aumenta al enviar más.

**Decisión funcional:** usar una contribución colectiva con rendimientos decrecientes para el rebote de campo. Mantener recetas individuales, oposición, crédito del captor y coste de balance. La incorporación de un participante pertinente no puede reducir por construcción la capacidad colectiva, manteniendo constantes jugadores, rival y estado.

Se autoriza esta fórmula inicial, etiquetada **SEM04-REB**, como semilla de corrección, no como calibración empírica:

1. Calcular la fuerza efectiva individual con la receta/cuerpo/fatiga vigente.
2. Ordenar los participantes ofensivos de mayor a menor fuerza, con desempate estable.
3. Usar `positiveStrength = max(0, strength)` para esta contribución colectiva.
4. Pesos marginales administrables por orden: `[1, 0.5, 0.25, 0.125, 0.0625]`.
5. Normalizar por la suma de los pesos de los **dos primeros puestos**, referencia administrable `referenceParticipants = 2`.
6. `RA_collective = sum(weight[j] * positiveStrength[j]) / sum(weight[0:referenceParticipants])`.
7. Mantener RD de la selección defensiva actual y el resolutor logístico de rebote. RA es un índice colectivo, no una nueva capacidad individual ni un atributo que haya que truncar a 30.
8. Sin participantes ofensivos pertinentes, conservar la consecuencia definida para ausencia; no introducir un reboteador fantasma ni usar neutral como presencia inventada.

Con jugadores neutrales idénticos y dos enviados, RA debe seguir en el nivel neutral. Con uno o con tres/cuatro debe reflejar menor/mayor presencia con rendimiento marginal decreciente. Los límites numéricos de probabilidad siguen los del resolutor existente.

Estas filas solo pertenecen al perfil SIM. No cambiar el cálculo de último libre, que tiene sus plazas específicas, salvo una regresión directamente demostrada del mismo contrato; en tal caso documentarla sin ampliar el repertorio.

**Comprobaciones agrupadas:**

- Igual entrada con niveles 1–5; declarar que 1 y 2 pueden enviar el mismo número según `[1,1,2,3,4]`.
- Añadir participantes pertinentes no reduce pORB en cálculo fijo.
- Más capacidad de rebote de un participante no empeora su contribución.
- El balance rival sigue teniendo su coste real.
- La captura se acredita a un participante elegible y los rebotes cuadran con sus oportunidades.

No imponer una victoria, un número final de rebotes ni más puntos a cada semilla que cargue el rebote.

### C04-02 · Zonas SIM y canastas con falta del detallado

Reparar el contrato de lectura:

- El formato compacto SIM individual `[attempts,makes,q0,q1,q2]` se interpreta con su definición real. Un lector común puede aceptar también el objeto si ese formato está documentado.
- Intentos/aciertos/categorías por jugador suman los equipos y el acta.
- La zona real sigue siendo aro/interior/media/triple. No crear izquierda/derecha ni coordenadas.
- En el detallado, una canasta válida con falta cuenta como FGM y FGA. El tiro fallado con falta de tiro no cuenta como FGA. Las anulaciones siguen su política real.
- Corregir tanto las tablas de equipo como `zone.csv` y los lectores de comparación que compartan el defecto.
- No confundir un campo no conservado con cero. Tampoco dejar vacío un dato existente por un desajuste de estructura.

**Reparación de evidencia:** si los registros originales de 03 están disponibles, regenerar sus tablas en un directorio nuevo de lectura reparada, con versión del lector, hashes de origen y diferencias. No sobrescribir los ZIP originales.

Si `out/` ya no contiene los registros, declarar su ausencia. Corregir los lectores y usar las nuevas ejecuciones R0 de 04 para comparar. No repetir la campaña completa de 03 ni presentar reconstrucciones nuevas como sus archivos históricos.

**Comprobación:** una regresión agrupada que incluya array SIM, canasta con falta, fallo con falta, tiro ordinario y anulación. Además, en cada partido de la campaña, zonas suman FGA/FGM y calidades suman sus intentos del universo declarado.

### C04-03 · Bloqueador pertinente e identificación honesta de participantes

**Causa:** el generador busca `play.screen.role`, inexistente en el catálogo incluido en 03. Las funciones pertinentes ya están en `play.roles` y en las recetas.

**Decisión:** generar y registrar un participante compacto para la función de bloqueador que la ficha representa. No añadir el movimiento del bloqueo ni cambiar la receta de calidad por un bonus.

Mapeo inicial explícito:

| Fichas | Función de bloqueador |
| --- | --- |
| POS01–POS04 | `screener` |
| POS07–POS08 | `screener` |
| POS05–POS06 | Conservar `hub` como función de entrega; no inventarles `screener` si su catálogo no representa esa función |
| Resto | Sin bloqueador salvo función pertinente explícita del catálogo vigente |

- Derivar compatibilidad y pool de los datos de la ficha y del quinteto efectivo, sin filtrar por posición nominal.
- Si la salida ya tiene como ejecutante a quien ocupa `screener`, ese jugador es el participante; deduplicar su crédito.
- En las demás salidas, seleccionar del pool compatible con sus pesos existentes. Este encargo autoriza un sorteo de identidad cuando no está determinada: **es una corrección funcional, puede cambiar el RNG y se versiona antes del control de optimización**.
- Si el ejecutante no está ocupando la función de bloqueador, el bloqueador debe ser otro jugador. Aplicar además los requisitos de distinción de funciones de la ficha; no excluir o incluir al director por una regla de posición nominal nueva.
- Sin candidato compatible, conservar una causa explícita y tratar la disponibilidad conforme al catálogo; no rellenar con cualquier jugador ni con una identidad ficticia.
- Registrar `scr` o su equivalente, exposición y participación. Es un participante producido por el modelo estadístico, no una operación detallada que haya ocurrido por debajo.
- La calidad actual por grupos funcionales sigue siendo esa aproximación declarada. No rediseñarla para que dependa de un único actor sorteado.
- Conservar participantes de la finalización también cuando termina en falta de tiro. Canasta, falta y libres ligados no duplican exposición.
- Una continuación/putback sin nuevo bloqueo pertinente no hereda automáticamente el anterior.

**TEC09:** conservar su consumo en la receta actual y actualizar el instrumento para distinguir capacidad utilizada, participante registrado y efecto agregado. Que el contador antes fuese null no autoriza afirmar que TEC09 era un atributo muerto.

**Comprobación:** una ficha de bloqueo con ejecutante exterior, una con ejecutante bloqueador y una sin bloqueo; presencia elegible, crédito único y ausencia legítima en el tercer caso.

### C04-04 · Familiaridad de presión dentro del modelo compacto

Cerrar `familiarity.module.press` mediante los módulos reales del catálogo: **`FAM:press_break`** en ataque y **`PRESS`** en defensa. No crear nuevas capacidades ni usar esas cadenas como rutas inexistentes del perfil.

**Ámbito:** solo presión adelantada `three_quarters` o `full`. Presión normal no activa esta operación.

**Decisión pequeña autorizada:**

1. Calcular el ajuste de familiaridad con las funciones puras comunes, ámbito `pressedAdvance`, y los pesos ya declarados de `tacticContextWeights.pressBreak`.
2. Participante ofensivo de referencia: director efectivo que organiza el avance; participantes defensivos: grupo efectivo en cancha que el modelo usa para la presión colectiva. Documentar esta aproximación.
3. Módulos ofensivos: `FAM:press_break`. Defensivos: `PRESS` y organización efectiva con los pesos existentes. Usar posición asignada y rol pertinente, sin participantes del banquillo.
4. El ajuste `delta` está orientado a favor del ataque, como en la fórmula común.
5. Aplicarlo **una vez sobre el peso adicional de pérdida creado por la presión adelantada**: `pressureTurnoverWeightAdjusted = pressureTurnoverWeightBase * exp(-delta)`.
6. Mantener intacto el peso de pérdida ordinaria. Recalcular la normalización terminal con sus pesos compatibles. No sumar además el mismo delta a puntería, calidad general y duración.
7. Con capa desactivada, sin conocimiento explícito o con todos los módulos/roles/posiciones pertinentes dominados, el ajuste es neutral conforme a las funciones comunes.
8. El conocimiento se mantiene constante durante el encuentro. La exposición pertinente se conserva para la propuesta posterior.

**Exposición:** contabilizar las oportunidades de avance presionado realmente publicadas, no las veces que se compila una distribución. Se permite un contador compacto por tramo/control con sus participantes y módulos, sin construir acciones individuales de avance. Cada oportunidad acredita como máximo una operación por participante, repartida entre sus módulos con los pesos comunes. Una consulta, estimación o repetición de lectura no genera dosis. El presupuesto diario por minutos y dominio no cambia.

La exposición de presión y la de finalización son operaciones diferentes y deben estar identificadas; no duplicar una misma operación por observarla en dos registros.

**Comprobación sin azar:** ataque K8→K28 mejora o mantiene su salida ante la misma presión; defensa K8→K28 aumenta o mantiene su eficacia relativa; normal no aplica; neutral devuelve exactamente cero. Comprobar también exposición posterior y repetición inocua de consultas.

### C04-05 · Prioridades y cobertura del instrumento

- Mantener prioridad 1 como máxima y 5 como mínima; empates permitidos.
- En B12/S4 y sus equivalentes de 04, dar prioridad 1 a la familia que se quiere exponer y 5 al resto, o usar un libro de una sola familia cuando la ficha y la disposición sean compatibles.
- Corregir también etiquetas, descripciones y denominadores de las sondas que usaban 5 frente a 1.
- La prueba de cobertura elige fichas que admiten esa cobertura, con participantes y disposiciones compatibles.
- Registrar oportunidades elegibles, ejecuciones observadas y efecto puro pertinente. Una cobertura incompatible no aplica y no recibe exposición.
- No interpretar un marcador casi igual como ausencia de efecto ni aumentar la fuerza de una cobertura para compensar un instrumento mal preparado.

### C04-06 · Créditos de asistencia y evidencia para ajustarlos

Mantener la política estadística vigente y separar sus dos componentes:

1. La finalización permite una entrega final pertinente.
2. Existe un pasador distinto del anotador y la conversión permite asistencia conforme al contexto generado.

Registrar en diagnóstico compacto, por contexto, los denominadores necesarios: finalizaciones, elegibles para entrega, entregas producidas, canastas elegibles, asistencias de campo, series de libres elegibles y asistencias a libres. No reconstruir una cadena de pases.

- Putback sin pase nuevo y finalización autónoma sin entrega producida no generan asistencia.
- Máximo una asistencia por canasta o serie elegible. Mantener el tratamiento vigente de canasta con falta para evitar doble crédito por el mismo hecho causal.
- Conservar separadas `astC/ast_fg` y `astL/ast_ft`, más su total.
- Pasador, anotador y todos los créditos tienen participación temporal compatible.
- Mantener el efecto del rol y de la capacidad de pase antes del sorteo.
- Una corrección demostrada de duplicación o elegibilidad es funcional. Una subida de la probabilidad base pertenece a la calibración del §7.

No inventar «continuación de ventaja», desvíos ni acciones que SIM no representa. Si el modelo aún explica una parte de la distancia con el detallado, entregar ese límite y sus denominadores.

## 5. Contratos, estados y aprendizaje

### 5.1 Conservación por nivel

El esencial para mundo conserva lo comprometido: identidad, perfil/semilla/entrada, estado y validez, resultado/periodos/duración, acta individual y de equipo, zonas, familias y denominadores, exposición necesaria para historia y aprendizaje.

El nivel Simulada/Análisis conserva además los agregados compactos comprometidos para quintetos, evolución, organizaciones y lectura táctica. El diagnóstico exacto es seleccionado.

Una salida poco pesada no justifica calcular y retener todas las vistas de diagnóstico antes de desecharlas. Implementar la conservación solicitada con su trabajo necesario, conservando iguales datos deportivos en la intersección.

### 5.2 Compatibilidad

- Resultados antiguos: lectura según su contrato; aplicar un lector reparado de forma identificada, preservando el archivo original.
- Guardados antiguos: continuar solo si puede demostrarse que la revisión nueva conserva su semántica exacta. Si los cambios de rebote/presión/participantes alteran el futuro, rechazar con explicación y mantener el archivo. No afirmar compatibilidad por compartir schema.
- No mantener una segunda implementación deportiva histórica dentro de SIM para evitar el rechazo.
- Perfiles antiguos: tarjeta de compatibilidad con consulta y creación/activación explícita de una base/candidata nueva y sus diferencias.
- La instalación que ya tenía un perfil no se cambia sola. Las candidatas siempre están etiquetadas como provisionales.
- Snapshot nuevo y jornada nueva conservan RNG, conocimiento inicial, contadores nuevos, participantes, exposición, estados, planes, noticias y futuro privado necesarios para continuar exactamente.
- Histórico anual: conservar procedencia de modelo, versión y política estadística. No reescribir temporadas anteriores con una política nueva.

### 5.3 Estados y las 32 capacidades

No retocar Forma, curvas de momento, Consistencia, importancia ni capacidades de tiro para lograr una media de puntos. Conservar su consumo causal y la separación entre selección, oportunidad y conversión que SIM representa.

Reejecutar la matriz de cálculo puro existente de 32 capacidades × 8 contextos × +1/+3/+5, corrigiendo S4 y los contadores afectados. No son 768 partidos: son operaciones sin azar.

Actualizar el mapa de consumidores y exposición:

- Atributo consumido por operación pura.
- Operación expuesta en la campaña.
- Registro suficiente, proxy declarado o no instrumentado.
- Salida que cambia y saturación/clamp efectivo.

No exigir que Consistencia aumente la media. No exigir que cada incremento de habilidad gane más partidos en cuatro semillas. No convertir ausencia de exposición en un cero causal.

### 5.4 Aprendizaje y temporadas

Reutilizar el adaptador y las curvas comunes de MOTOR-18B/18C. La nueva participación no cambia la unidad ni concede presupuesto extra por tener más eventos.

Mantener:

- 600 décimas de segundo vivo = un minuto.
- Dosis derivada de minutos, reparto normalizado y presupuesto diario común.
- Exposición de posición/rol/familia/organización/cobertura/presión solo cuando corresponde.
- Sin dosis a quien no participa.
- Propuesta posterior a un resultado terminado y válido.
- Aplicación única por encuentro lógico/equipo/copia; un intento nuevo no duplica.
- Deshacer y recargar no reactivan una aplicación revertida.
- M1 y M10 son fuentes diferentes; una copia ajena no puede aplicar aprendizaje.
- El cierre estadístico no avanza edades.

Las ganancias brutas de los seis ejemplos de 03 diferían entre modelos. No multiplicar todo el aprendizaje de SIM para igualarlas: revisar por participante/dominio y separar la simplificación admitida de la exposición que faltaba.

## 6. Referencias y criterios de calibración

### 6.1 Dos referencias complementarias

1. Detallado congelado: coherencia de conceptos, jerarquía, identidad táctica y comportamiento relativo con las mismas entradas.
2. Datos reales: plausibilidad del volumen, distribución y extremos de una población comparable, con competición, fase, temporada y categoría declaradas.

El detallado no es verdad empírica. No debe imponerse su número de jugadores con 40 minutos ni su porcentaje de dos como objetivo universal. Tampoco se exige mismo marcador o ganador en la misma semilla entre resolutores diferentes.

### 6.2 Investigación externa ya realizada por ChatGPT

Estas son las referencias primarias verificadas en la revisión anterior:

| Fuente | Dato/definición disponible | Uso permitido |
| --- | --- | --- |
| ACB, Curiosidades de la Liga Endesa 2026-2027 | Medias por equipo de fase regular: 81,5 en 2022-23; 83,2 en 2023-24; 86,2 en 2024-25; 88,1 en 2025-26 | Contexto histórico; no una cuota universal de puntos |
| EuroLeague, premio de máximo anotador 2024-25 | Kendrick Nunn, 21,1 puntos por partido en fase regular | Contextualizar extremos; no imponer un tope al jugador |
| FIBA Statisticians' Manual 2024, v2.0, §2.1 y §6.1 | Canasta con falta cuenta como intento; tiro fallado con falta de tiro no; existen asistencias a libres elegibles | Definiciones de lectura estadística |

URLs:

- https://acb.com/es/liga/noticias/curiosidades-de-la-liga-endesa-2026-2027-146095
- https://mediacentre.euroleague.net/en/app/2/communication/communication/preview/23103
- https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf

Archivar en la evidencia un registro de fuentes con URL, fecha de consulta comunicada por ChatGPT, dato, fase, unidad y límite. Distinguir «dato aportado por ChatGPT desde fuente primaria» de «fuente leída directamente por Claude».

No perder tiempo en nuevos intentos masivos de descarga ni inventar medias externas. No se dispone en este encargo de un dataset externo completo de varias ligas. Por tanto, el resultado será una candidata funcional comparada, con plausibilidad externa parcial, y no una validación empírica integral de todas las categorías.

### 6.3 Poblaciones separadas

Para evitar ajustar toda la liga a dos perfiles de estrés:

- **Principal comparativa:** EQ01, EQ02, EQ03, EQ04, EQ05, EQ08, EQ09 y EQ12, planes naturales y fichas intactas.
- **Estrés/contexto:** EQ06/EQ11 para anotadores extremos, EQ07 para veterano y EQ10 para cantera; estados específicos en copias identificadas.

La primera es una selección de laboratorio, no una certificación de que represente ACB. No alterar sus capacidades, planes o rivales entre R0/R1/candidatas para mejorar las métricas.

## 7. Candidatas numéricas y selección reproducible

### 7.1 Presupuesto y alcance cerrado

Se autoriza una búsqueda secuencial pequeña sobre cuatro familias. **Máximo nueve vectores adicionales**, además de R1, no el producto cartesiano de todas las opciones. Todas las cifras de esta sección son **semillas de evaluación SEM04**, no valores ya calibrados.

| Etapa | Fila o familia | Valor inicial comprobado de 03 | Valores adicionales autorizados |
| --- | --- | ---: | --- |
| V · Volumen | `volume.neutralSecondsPerControl` | 16 | 17,5; 18,5; 19,5 |
| Z · Mezcla de zona | Nueva fila SIM `shotMix.threeWeightFactor` | 1 | 0,85; 0,70 |
| A · Entrega final | `assist.eligibleFinalPassP0` | 0,60 | 0,75; 0,90 |
| E · Energía | `energy.costPerLiveMinute` | 2 | 3; 3,5 |

Comprobar los valores efectivos al entrar. Si la base real contiene otros valores por un cambio autorizado posterior a 03, documentarlo y adaptar la comparación conservando el presupuesto; no atribuir a 03 unos números distintos.

La etapa siguiente parte del ganador provisional de la anterior. El ganador ya ejecutado se reutiliza; no repetir sus partidos para cada comparación.

No tocar en esta entrega los p0/sensibilidades de tiro, pendientes de atributos, pesos de robos, curvas de Forma/momento, controles de libertad, tablas de prioridades ni conocimiento para forzar la convergencia. Si un resultado sigue distante, conservar el diagnóstico y el límite.

### 7.2 Aplicación de la fila de mezcla

`shotMix.threeWeightFactor` es un ajuste de mezcla, no de acierto:

- Multiplicar una vez el peso de las celdas de triple dentro de cada contexto representado: organizado, transición y espontáneo.
- Renormalizar dentro de ese contexto manteniendo su masa total previa. Si no hay triple o ese contexto no tiene masa, no crear opciones nuevas.
- Conservar prioridades relativas de fichas de igual zona, diferencias entre niveles de preferencia de finalización, aptitud individual, oposición y calidad.
- Con valor 1, identidad exacta de la mezcla previa a esta fila.
- No aplicarlo también a la probabilidad de encestar ni añadir un corrector de puntos al resultado.

Exponer fila, valor, procedencia y efecto en el panel de parámetros. Validar finitud y positividad del factor. Validar también pesos de rebote finitos, no negativos y no crecientes, referencia entera positiva dentro del array y probabilidades estrictamente entre 0 y 1. Rechazar la candidata inválida con causa; no corregir valores en silencio.

### 7.3 Regla mecánica de selección

Guardar el plan y estas reglas antes de ejecutar CAL. Los objetivos son de **convergencia funcional de laboratorio**, no tolerancias estadísticas de una competición real.

Usar para comparar con el detallado únicamente los casos CAL que tengan ancla detallada de la misma entrada. Para porcentajes, sumar numeradores y denominadores; no promediar porcentajes individuales.

Para las pérdidas de selección V/Z/A, informar los partidos incluidos y sus duraciones. `meanPTS` y `meanFGA` en L_V son medias de equivalentes por 40 minutos (`valor × 2400 / duración deportiva`) para que una prórroga aislada no elija el ritmo. Conservar también puntos/tiros reales por encuentro y las cifras sin prórroga, con nombres distintos. Un final administrativo/adjudicado no entra en esa pérdida deportiva y se declara aparte, sin borrar su resultado.

**V · Volumen:** minimizar

`L_V = abs(meanPTS_SIM / meanPTS_DET - 1) + abs(meanFGA_SIM / meanFGA_DET - 1)`.

**Z · Mezcla:** minimizar

`L_Z = sum_z abs(shareAttempts_SIM[z] - shareAttempts_DET[z])`,

con las cuatro zonas de los lectores corregidos. No admitir un cambio que empeore L_V más de `max(0,02; 10 % del L_V previo)`.

**A · Asistencias:** minimizar

`L_A = abs(sumAST_FG_SIM / sumFGM_SIM - sumAST_FG_DET / sumFGM_DET)`.

Las asistencias a libres se informan aparte con su universo; no introducir un denominador aproximado para mejorar L_A. El cambio no debe alterar tiros, puntos ni participación por sí mismo fuera de los efectos que el generador realmente acople. Declarar cualquier acoplamiento de RNG: una probabilidad distinta puede cambiar draws posteriores aunque no cambie la magnitud de tiro en cálculo fijo.

**E · Energía:** comparar 2, 3 y 3,5 utilizando todos los CAL, los minutos, la energía y las decisiones de relevo. Elegir el menor valor que:

1. Reduzca al menos un 20 % relativo, frente al ganador previo con gasto 2, la frecuencia de actuaciones de equipo con algún jugador de 40 minutos en partidos sin prórroga. Medir con segundos/minutos originales y la precisión contractual, sin redondear antes; este 20 % es una señal de mejora autorizada, no una tasa real publicada.
2. No empeore L_V más de `max(0,04; 20 % del L_V previo)` ni L_A más de 0,05 absolutos.
3. Supere las comprobaciones de que un referente claramente superior puede seguir siendo preferible con energía 30, y de que hay relevos cuando resultan mejores, sin crear cambios obligatorios por un umbral nuevo.

Si ninguno cumple, conservar 2 en la candidata principal y entregar 3/3,5 como alternativas con el motivo de no elección. No modificar además la política de rotación a escondidas para hacer cumplir la regla. Un defecto lógico concreto demostrado de rotación puede corregirse, pero se registra como corrección funcional y exige una nueva R1 y comparación dirigida.

**Empates y mejoras pequeñas:** en V/Z/A mantener el valor previo si la reducción de la pérdida es inferior al 5 % relativo. Si el valor previo tiene pérdida cero, conservarlo. Entre valores con el mismo resultado a precisión declarada, elegir el más cercano al anterior; después, el menor cambio absoluto. Registrar los cálculos sin redondearlos antes de seleccionar.

Con un denominador nulo o un ancla no válida, declarar la métrica no evaluada, conservar el valor previo de esa etapa y explicar la falta de evidencia. No completar con ceros ni buscar semillas de sustitución.

Este selector solo propone un vector. No permite declarar «calibrado» porque una pérdida baje en 16 anclas. Dennis/ChatGPT valorarán la reserva y las limitaciones.

### 7.4 Efectos que se informan pero no se fuerzan

- Frecuencias <60, <70, 70–79, 80–89, 90–99, 100–109 y ≥110; dispersión, finales ajustados y prórrogas.
- Reparto de puntos, uso y minutos por jugador y equipo.
- Pérdidas/robos, faltas/libres y rebotes con sus oportunidades reales.
- Estrellas de estrés y respuesta al cambio de energía.
- Ordenaciones de equipos y producción de jugadores, indicando tamaño de muestra.
- Sensibilidad a roles, director, familiaridad, estados y entrenador.

No imponer que todos los equipos produzcan una media común ni que todos roten igual. No truncar puntuaciones altas ni sortear un «partido de marcador bajo» independiente del baloncesto generado.

## 8. Rendimiento exacto y memoria

### 8.1 Control correcto

Después de fijar mecanismos y vector final, capturar **O04-CONTROL** con commit/hash reproducible. Las optimizaciones se comparan contra él, no contra R0, que tiene otro deporte.

Mantener idénticos perfil, tablas, entradas, políticas, noticias, órdenes y conservación solicitada. Una mejora de tiempo causada por menos tiros tras calibrar no se atribuye a una optimización exacta.

### 8.2 Dos líneas de trabajo, guiadas por medición

Perfilar una muestra breve de hasta 12 encuentros ya planificados y un avance agrupado reutilizable. Separar entrada, cálculo de magnitudes, generación, lectura/agregación, conciliación, transporte, persistencia y disponibilidad para mundo.

**Línea 1 · Construcción del esencial y trabajo por cierre.**

Se ha localizado que `buildSimEssential` llama a `buildSimResult`, que prepara quintetos, evolución y otras proyecciones aunque el esencial no las conserve. Medirlo y construir la salida necesaria directamente, o mediante agregados compartidos con cobertura explícita.

- Evitar proyecciones no solicitadas; conservar acta, zonas, familias, exposición y validación completas.
- Reutilizar agregación común para que esencial y Análisis no diverjan.
- La ruta rápida y la ruta de lectura de referencia concilian exactamente en su intersección.
- Las comprobaciones no desaparecen: se pueden reformular con los mismos invariantes y datos, declarando la equivalencia.

**Línea 2 · Retención y ciclo de vida de jornada.**

- Medir dónde se retienen hechos, planes repetidos, caches por quinteto/tramo y copias de datos.
- Compartir datos realmente inmutables y acotar cachés según sus dependencias y vida útil.
- Liberar el estado de cada terminado una vez conservado y validado lo contratado; comprobar que recuperar/consultar devuelve ese contenido.
- Reducir el pico anterior a la liberación, no solo el RSS después del último partido.
- Evaluar agregación incremental de los hechos ya publicados y cierre en grupos pequeños con el mismo instante público.
- En la interfaz, el coordinador no debe bloquear el hilo de presentación al reconstruir cien veces las mismas tablas.

Una corrección pequeña ligada a esas líneas puede acompañarlas. No iniciar una búsqueda indefinida de microoptimizaciones ni una migración de stack.

### 8.3 Límites de exactitud

No está autorizado:

- Reutilizar probabilidades de otro tramo omitiendo energía, plan, jugadores, conocimiento, estados o contexto.
- Desactivar entrenador, familiaridad, controles o conciliaciones para medir.
- Sustituir actas individuales por medias de equipo.
- Resolver toda la jornada de antemano y representar después decisiones que no influyen.
- Publicar un ganador futuro antes del presente común.
- Mil workers, mensajes por cada segundo de cada partido o un resolutor detallado por encuentro.

Si faltan oportunidades de optimización exacta, entregar la atribución de coste y las alternativas futuras. No introducir otra aproximación deportiva sin decisión posterior de Dennis.

### 8.4 Presupuestos

El requisito existente de 5 s se mantiene. No se autoriza relajarlo a 8–10 s.

Además medir y buscar reducción del RSS de unos 2,6 GiB y de la pausa de cierre de unos 4,8 s. Como referencias de ingeniería de esta entrega, informar también distancia a **1.536 MiB de RSS en jornada de mil** y **1 s de actualización máxima de barrera**. Son objetivos de trabajo nuevos y provisionales de este encargo; no sustituir con ellos el requisito de 5 s ni afirmar que fueron resultados ya obtenidos.

Si no se alcanzan, declarar cada incumplimiento. No ampliar la campaña ni degradar información para conseguir una pasada favorable.

## 9. Plan congelado y presupuesto de ejecuciones

### 9.1 Dos congelaciones

**Antes de CAL:** congelar agenda, poblaciones, semillas, nueve vectores autorizados, reglas de selección, lista de contrastes, referencias y presupuesto. La implementación funcional de R1 debe estar verificada.

**Antes de la reserva:** fijar la candidata, terminar las optimizaciones exactas y congelar código/perfiles/tablas/entradas. Desde ese momento no ajustar parámetros ni reglas a partir de resultados VAL.

La reserva VAL no se abre para elegir una candidata. Sus valores estadísticos no se inspeccionan durante las etapas V/Z/A/E. Se puede validar su sintaxis y compatibilidad antes de ejecutarla sin simular sus resultados.

### 9.2 Semillas y agenda

Usar semilla maestra declarada `20261023` y namespaces distintos `SIM04|CAL`, `SIM04|VAL`, `SIM04|STRESS`, `SIM04|CONTRAST`, `SIM04|TECH` y `SIM04|BENCH`.

Derivar la semilla de cada caso de la clave canónica mediante SHA-256 y conversión de sus primeros 32 bits a entero sin signo. Incluir equipos ordenados tal como entran, réplica y etiqueta del bloque. Registrar cualquier colisión y resolverla determinísticamente con un sufijo ordinal antes de congelar.

Comprobar que las semillas/entradas VAL no son las usadas en 03 ni en CAL. Si las agendas históricas no están disponibles, conservar al menos namespaces e inputs nuevos y declarar que la ausencia impide esa comprobación histórica completa.

R0, R1 y candidatas de un caso comparten la misma entrada fuente, semilla, plan, jugadores, órdenes y contexto salvo el vector de parámetros o la corrección que se está comparando. Una semilla igual entre resolutores diferentes no implica azar emparejado ni marcador idéntico.

No hay localía deportiva representada: las dos orientaciones son orden de entrada, no casa/fuera.

### 9.3 Presupuesto máximo principal

| Bloque | Ejecuciones SIM máximas | Ejecuciones detalladas máximas | Definición |
| --- | ---: | ---: | --- |
| CAL | 616 | 16 | 56 casos × R0, R1 y hasta 9 vectores nuevos; 16 anclas detalladas |
| VAL | 168 | 16 | 56 entradas nuevas × R0, R1 y candidata final; 16 anclas nuevas |
| STRESS | 48 | 0 | 24 entradas × R0 y candidata final |
| CONTRAST | 88 | 0 | 11 factores × 4 pares × 2 variantes, solo candidata final |
| DIAG | 12 | 4 | Repeticiones identificadas de casos de VAL/CONTRAST, no observaciones nuevas |
| OPT | 56 | 0 | Repetir con O04-FINAL los 56 CAL de la candidata, conservados como control antes de optimizar |
| TECH | 16 | 0 | 8 controles ya ejecutados × 2 rutas adicionales |
| Jornada mixta | 12 | 3 | 4 SIM + 1 detallado, tres recorridos equivalentes |
| **Máximo principal y técnico** | **1.016** | **39** | Antes de benchmark, calentamiento y pruebas |

Estos máximos no son objetivos que rellenar. Si un vector resulta inválido en la validación previa, declararlo y no sustituirlo por otro inventado. Si dos identidades comparten exactamente código/vector/entrada y una reutilización es legítima, registrar el alias y no contar una simulación inexistente.

Las pruebas pequeñas, el navegador, el perfilado y el calentamiento se contabilizan aparte por ejecuciones reales, incluso si no se guardan. No presentarlos como parte de las 56 observaciones nuevas de VAL.

El benchmark del §12 tiene un presupuesto separado máximo ordinario de 8.000 SIM. Los miles de repetición de benchmark no son miles de observaciones deportivas independientes.

## 10. Reserva deportiva y contrastes finales

### 10.1 CAL y VAL

Sobre los ocho equipos principales, formar los 28 emparejamientos no ordenados y sus dos orientaciones: **56 casos por bloque**. Un bloque CAL y otro VAL con semillas distintas.

Las 16 anclas detalladas por bloque se eligen antes de jugar:

- Lista circular de los ocho equipos en el orden del §6.3.
- CAL: parejas a distancia 1 del círculo, en ambas orientaciones: 8 × 2.
- VAL: parejas a distancia 3, en ambas orientaciones: 8 × 2.
- Son un subconjunto de los 56 casos del bloque, sin cambiar su semilla ni su entrada fuente.

Las anclas detalladas se ejecutan una sola vez por caso y se reutilizan para los vectores. Su perfil y código son siempre los del detallado congelado.

Informar por separado población completa de 56 y subconjunto comparable de 16. No comparar una media de un subconjunto contra otra población como si fueran las mismas entradas.

### 10.2 STRESS

24 entradas: los seis emparejamientos entre EQ06, EQ07, EQ10 y EQ11, dos orientaciones y dos réplicas, con planes naturales.

Comparar R0 y candidata. Inspeccionar automáticamente los extremos individuales, minutos, faltas, eficiencia, dispersión y validez. Mantener las identidades de las plantillas originales.

No calibrar el motor para que el jugador de estrés deje de ser extraordinario. Si sigue produciendo extremos incompatibles con una población ordinaria, informar qué parte procede de las fichas y qué parte añade SIM.

### 10.3 CONTRAST

Cada factor tiene dos orientaciones y dos semillas por orientación: cuatro pares. Cambiar únicamente el factor indicado, en una copia del equipo modificado. Definir los participantes y las condiciones previas en el plan.

| Factor | V0 / V1 | Qué se comprueba principalmente |
| --- | --- | --- |
| T01 · Rebote/balance | Después del tiro 1 / 5 | Contribución pura y rebotes por oportunidad; coste de transición rival |
| T02 · Finalización | Interior / exterior, niveles 1 / 5 | Cambio de mezcla de zonas, con capacidad y plan constantes |
| T03 · Altura de presión | Normal / total | Pérdidas rivales, robos propios, faltas y energía, todos con sus denominadores |
| T04 · Cobertura | COB01 / COB03 | Fichas compatibles con bloqueo a prioridad 1; oportunidades del manejador/continuador |
| T05 · Director | MEN02 y MEN03 del director 8 / 24 | Lectura pura, selección y pérdidas; el resto de la ficha igual |
| T06 · Libertad | 1 / 5 | Peso efectivo del libro y decisiones espontáneas; no solo puntos |
| T07 · Familiaridad organizada | K8 / K28 de módulos pertinentes | Ajuste único y exposición de una familia seleccionada |
| T08 · Familiaridad de presión | K8 / K28 de PRESS en defensa | Operación nueva pertinente y crédito posterior; ataque constante |
| T09 · Energía inicial | 100 / 30 | Capacidad efectiva y participación sin reglas de sustitución ciegas |
| T10 · Forma | −0,5 / +0,5 | Aplicación de estado en las tareas pertinentes |
| T11 · Consistencia | MEN06 8 / 24 | Sigma/innovaciones y distribución de momentos; no exigir más media |

Reutilizar los equipos/constructores de contraste existentes de 03 donde correspondan, corrigiendo prioridad y funciones. No diseñar una población nueva distinta para cada versión.

Para T07/T08, construir conocimiento explícito en las copias y fijar los demás componentes pertinentes al mismo valor dominado, variando solo los módulos indicados. No cambiar Polivalencia ni aprender dentro del partido. Para T05 fijar el director efectivo y comprobar que permanece como tal en la operación de cálculo fijo. Los partidos posteriores pueden rotarlo de forma legítima.

Si una condición no se expone en los cuatro pares, marcar insuficiente y usar el cálculo fijo o caso dirigido correspondiente. No buscar cientos de semillas hasta producir la conclusión esperada.

### 10.4 Diagnóstico seleccionado

Elegir antes de ver resultados 12 casos SIM de VAL/CONTRAST y cuatro anclas detalladas VAL. Distribuir entre ellos bloques, presión, conocimiento, rotación, estados y resultado completo.

Conservar datos previos al sorteo y exposición suficientes para auditar las correcciones. No almacenar un diagnóstico completo de los 1.016 encuentros máximos.

### 10.5 Lectura de la reserva

Calcular las mismas métricas de selección en VAL, pero no volver a seleccionar ni ajustar.

Dar estados descriptivos separados:

- Mejora o empeora la distancia de puntos/FGA.
- Mejora o empeora la mezcla de zonas.
- Mejora o empeora la asistencia por canasta y sus denominadores.
- Cambia la distribución de minutos y energía.
- Conserva identidad y jerarquías en la muestra, con límites por número de partidos.
- Aparecen defectos deterministas o solo señales deportivas.

VAL prueba semillas nuevas sobre las mismas ocho plantillas principales; no acredita por sí sola generalización a jugadores o países no representados. STRESS aporta cobertura contextual distinta y se informa por separado.

Una diferencia pequeña no es significación estadística. Si se calculan intervalos, la unidad de remuestreo es el partido/caso completo, no tratar ambos equipos como independientes ni las repeticiones técnicas como partidos nuevos. No introducir una biblioteca pesada para ello.

Si VAL contradice CAL, entregar la contradicción y conservar el vector congelado como candidata no aceptada. No hacer un segundo entrenamiento sobre la reserva.

## 11. Equivalencia, jornada, historia y aprendizaje

### 11.1 Equivalencia de optimización

Sobre los 56 casos CAL de la candidata final, comparar O04-CONTROL y O04-FINAL. Los controles CAL ya ejecutados antes de optimizar se conservan; el bloque OPT autoriza 56 ejecuciones con el código final para compararlos. No repetir también los controles ni todos los vectores candidatos.

Comparar explícitamente:

- RNG/ordinal, hechos o proyección deportiva canónica y participantes.
- Marcador, periodos, minutos, quintetos y cambios efectivos.
- Planes, decisiones, órdenes y noticias.
- Acta, zonas, familias, denominadores y exposición.
- Consecuencias posteriores propuestas.

Comparar en la precisión definida por cada contrato; no añadir tolerancias nuevas para ocultar discrepancias. La comparación solo por marcador no basta. La huella no puede omitir precisamente el bloqueador, la presión o el campo nuevo que se acaba de añadir. Declarar metadatos de lectura que cambian legítimamente.

### 11.2 TECH

Ocho controles de VAL ya ejecutados; repetir cada uno:

1. Un worker, avance por cuartos/fronteras, consultas intermedias y esencial.
2. Cuatro workers, captura con sufijo privado, recuperación y Análisis.

Mantener iguales política, noticias y órdenes. Las velocidades x2/x4/x8/x16 cambian reproducción, no el cálculo. Distribuir esas comprobaciones entre los casos, sin crear otra campaña.

### 11.3 Jornada mixta

Cuatro SIM y un detallado; incluir un inicio desplazado para capturar un momento con un encuentro terminado y otro activo. Tres recorridos:

- Completo por barreras comunes.
- Pausas/consultas y avance por cuartos con el mismo calendario de revisión.
- Guardar cuando ya terminó uno, recargar de verdad y continuar.

Comprobar mismas publicaciones, resultados, noticias, decisiones y tablas con iguales entradas. Incluir una orden manual sobre el equipo autorizado y un rechazo sobre otro, en el mismo instante en los recorridos comparados.

La clasificación usa solo el presente deportivo. Una necesidad clasificatoria distinta es otra entrada contextual y puede cambiar el futuro; comprobar prefijo idéntico hasta la noticia, sin exigir igualdad posterior.

### 11.4 Historia desde la reserva, sin jugar otra temporada

Ordenar los 56 encuentros de VAL en un calendario estadístico de doble vuelta de ocho equipos. Construir:

- Histórico con los 56 resultados SIM de la candidata.
- Histórico mixto sustituyendo ocho casos por sus anclas detalladas disponibles, elegidas de antemano.

No cambiar los resultados ni evolucionar las plantillas entre esas ejecuciones ya realizadas. Es una conciliación histórica, no una simulación de desarrollo estacional.

Comprobar sumas por jugador/club/competición/temporada, porcentajes desde sumas, filtro hasta fecha, DNP, tapones recibidos, minutos y duplicados. Cada histórico concilia con sus propios resultados; no exigir que los dos históricos tengan iguales totales deportivos.

Reutilizar la regresión del intercambio administrativo de siguiente ronda. No programar otro mercado ni reasignar retrospectivamente estadísticas a un club nuevo.

### 11.5 Aprendizaje comparado

Elegir seis pares SIM/detallado de las anclas VAL y calcular propuestas con Polivalencia 8/16/24 sobre copias, sin jugar de nuevo.

Entregar por jugador/dominio/objetivo: minutos, presupuesto, exposición, dosis normalizada, conocimiento anterior, factores, ganancia y conocimiento propuesto. Distinguir bloqueador, presión y operaciones que no están representadas.

Verificar misma exposición normalizada → misma propuesta con las funciones comunes; multiplicar contadores brutos sin cambiar repartos no multiplica el presupuesto; aplicar/deshacer/reimportar conserva la protección por encuentro/copia/equipo.

No sumar las ganancias de objetivos distintos como si fueran una tasa anual. Informar diferencias de cobertura y de participación en vez de compensarlas con un multiplicador global.

## 12. Medición final de mil partidos

### 12.1 Agenda y cronómetros

Congelar una agenda de 1.000 casos con los doce equipos naturales, semilla BENCH y políticas automáticas activas. Misma agenda, perfil y salida entre O04-CONTROL y O04-FINAL. Generar los partidos realmente en cada pasada; no devolver resultados almacenados.

Cronómetros separados:

1. Proceso nuevo → importación, datos, workers y preparación.
2. Solicitud con cuatro workers preparados → 1.000 esenciales individuales completos, validados y transportados al coordinador. **Objetivo existente: ≤5.000 ms.**
3. Serialización/persistencia y confirmación de estadísticas de mundo.
4. Tiempo total desde proceso nuevo hasta datos utilizables por el mundo.

Declarar número y tiempo de todos los partidos de calentamiento. No ocultarlos en «arranque» ni utilizar cientos para presentar una pasada fría como caliente.

### 12.2 Seis pasadas de lote, sin búsqueda indefinida

| Versión | Pasadas | Partidos reales |
| --- | --- | ---: |
| O04-CONTROL | F0 proceso nuevo; F1 y F2 reutilizando workers | 3.000 |
| O04-FINAL | F0 proceso nuevo; F1 y F2 reutilizando workers | 3.000 |

Alternar las versiones en la misma sesión en orden declarado antes de medir; no ejecutar simultáneamente cargas competidoras. Registrar tiempos de cada pasada, no solo la mejor. Las limitaciones de entorno se informan, no se corrigen con multiplicadores de hardware.

La comparación de las 1.000 huellas se hace caso a caso y se acompañan conciliaciones y salida individual. La optimización debe conservar el deporte incluso si la pasada es más lenta.

### 12.3 Dos jornadas simultáneas de mil

Una jornada con O04-CONTROL y otra con O04-FINAL: **2.000 ejecuciones adicionales**. Mismo reloj virtual, barreras de 120 s, políticas y contexto.

- Marcadores públicos y clasificación desde el mismo presente.
- Esenciales disponibles al finalizar y acumulados confirmados.
- Pool de cuatro workers, no mil hilos.
- Mantener noticias pertinentes y futuro privado.
- No conservar mil detallados.

Por barrera registrar tiempo virtual, generación/avance, revisiones, construcción de esencial, conciliación, transporte, agregación del coordinador, tiempos de disponibilidad, bytes, activos/terminados y RSS.

Aislar la frontera de cierre de la mayoría de encuentros. Informar máximo, mediana y percentiles con método y número de barreras. Una pausa distribuida en tareas pequeñas sigue sumando CPU; informar ambas cosas sin cambiar el significado del reloj común.

### 12.4 Datos de coste

- Modelo CPU, CPU lógicas/cuota efectiva, Node, SO, RAM disponible, contenedor y carga observable.
- Workers efectivos, reparto y preparación.
- Mil solicitados/terminados/válidos/no válidos/fallidos/interrumpidos/duplicados y prórrogas.
- Tiempos por fase y throughput, junto con latencias observadas.
- Bytes esenciales por partido y total, transporte y persistencia.
- RSS máximo del proceso incluyendo workers, definición y muestreo; no sumar snapshots RSS de hilos como si fueran procesos independientes.
- Huellas de entrada, perfil y trayectoria por caso.
- Ganancia atribuible a O04-CONTROL → O04-FINAL, separada de R0 → candidata por cambio deportivo.

Presupuesto ordinario: **8.000 SIM** de benchmark/jornada. No hacer otras rondas hasta encontrar una favorable. Una repetición por error real o medida inválida conserva el intento previo y su causa; no lo elimina del recuento.

## 13. Pruebas, interfaz y cierre

### 13.1 Pruebas automáticas justas

Usar regresiones agrupadas de los mecanismos cambiados y los contratos de integración. Como orientación, unas 8–12 pruebas nuevas bien elegidas, no una prueba espejo para cada helper. Ampliar solo si un defecto o riesgo concreto lo requiere.

- Ejecutar pruebas dirigidas al implementar cada bloque.
- Ejecutar la suite completa una vez con el código final, además de `data:check` y el comprobador documental sobre copia limpia.
- Si después cambia código, datos o una aserción relevante, repetir lo que ese cambio invalida. No afirmar que la suite final pasa si solo se ejecutó antes de la última modificación funcional.
- No instalar versiones de Node ni varios navegadores para ampliar la matriz. Registrar el runtime real; si Node 24 ya está disponible, puede comprobarse una selección dirigida y declarar su alcance.
- Los partidos de pruebas y navegador se cuentan aparte, sin inflar la campaña.
- Actualizar aserciones de versión/compatibilidad/baseline cuando este encargo cambie legítimamente su contrato, documentando el motivo. No mantener una continuación antigua inexacta para conservar una prueba verde, ni relajar invariantes para hacer pasar un resultado nuevo.

### 13.2 Recorrido de Chromium y manual

Un recorrido automático reutilizable, con consola/red y descargas reales, y un guion breve para Dennis en `docs/prompts/SIM-MOTOR-04-recorrido-manual.md`.

Cubrir:

1. Selector inicial y separación de ambos motores; cabecera y versión.
2. Perfil anterior y activación explícita de la base/candidata con diferencias visibles.
3. Partido SIM: acta, zonas con datos reales, uso táctico, quintetos y evolución en el nivel que los conserva.
4. Parámetros nuevos y fila de candidata; restaurar y descargar sin modificar la referencia.
5. Bloqueador y familiaridad pertinentes en diagnóstico, sin exponer conocimiento privado al público.
6. Guardar/continuar y rechazo claro de un guardado incompatible.
7. Jornada mixta: un terminado y otro activo, guardar, recargar y seguir con clasificación coherente.
8. Historia anual y aplicación única de aprendizaje.
9. Lote persistente con detener/continuar y no duplicación, reutilizando el flujo existente.
10. Descargas de resultados, revisión rápida e índice/recibo cuando la interfaz las ofrezca.

El recorrido no incluye mil partidos en el navegador si ya se han medido por el ejecutor real. No sustituye la prueba manual de Dennis.

### 13.3 Fallos tras congelar

- Error de cálculo/acta: detener el bloque afectado, conservar evidencia, corregir, nueva identidad y repetir únicamente lo invalidado.
- Error de lector: reparar la lectura, conservar deporte y regenerar tablas; demostrarlo con hashes/controles.
- Resultado deportivo inesperado pero válido: conservarlo y analizar después. No es permiso para ajustar durante VAL.
- Error de infraestructura: conservar intento, causa y semilla; reintentar según el ejecutor existente, con un único resultado aceptado por encuentro lógico.

## 14. Archivos para ChatGPT

### 14.1 Reparto de trabajo

Claude implementa y ejecuta; entrega cálculos mecánicos reproducibles y una explicación breve de decisiones técnicas. **ChatGPT interpreta la auditoría deportiva y Dennis acepta.** Evitar miles de líneas de relato y análisis narrativo por partido.

Los datos deben permitir recalcular los hallazgos sin re-simular. Números JSON/CSV como números, punto decimal, unidades explícitas; ausencia tipada con causa. No miles de separadores de millares ni formatos locales ambiguos.

### 14.2 Ubicación y nombres

En `out/sim-motor04/entrega-final/`, fuera de Git:

- `SIM-MOTOR-04-revision-rapida.zip`.
- `SIM-MOTOR-04-evidencia-detallada.zip`, o partes completas identificadas si es necesario.
- `SIM-MOTOR-04-indice-partes.json`.
- `SIM-MOTOR-04-verificacion-final.json`, recibo offline fuera de los ZIP que comprueba.

Objetivo de tamaño: revisión rápida ≤5 MiB; partes detalladas preferiblemente ≤40 MiB cada una y agrupadas por función. No es permiso para quitar datos; evitar código duplicado, compresión repetida de los mismos resultados y trazas no necesarias.

### 14.3 Revisión rápida obligatoria

| Archivo | Contenido |
| --- | --- |
| `00-LEEME.md` | Orden de lectura, dictamen técnico factual, incumplimientos y qué buscar en cada parte |
| `01-IDENTIDAD-Y-CONGELACIONES.json` | Git/base, R0/R1/candidatas/control/final, perfiles, hashes, formatos, congelaciones y entorno |
| `02-CORRECCIONES.csv` | C04-01…06, causa, cambio, efecto deportivo/lector, regresión, estado y evidencia |
| `03-PARAMETROS-Y-CANDIDATAS.csv` | Antes/después exactos, unidad, origen, presupuesto y cada vector ejecutado |
| `04-PLAN-Y-RECUENTO.csv` | Por bloque/modelo/vector: solicitado, ejecutado, válido, fallido, no ejecutado, repetido y causa |
| `05-MAPA-CASOS.csv` | Clave global, entrada, semilla, perfil, modelo, variante, ruta y archivo/registro de evidencia |
| `06-RESULTADOS-EQUIPO.csv` | Una fila por caso/modelo/vector/equipo, incluidos denominadores y los extremos pertinentes |
| `07-CAL-SELECCION.json` | Pérdidas V/Z/A/E recalculables, restricciones, reutilizaciones, empates y vector elegido antes de VAL |
| `08-VAL-COMPARATIVA.csv` | Resúmenes completos y de anclas, separados por población y modelo |
| `08b-DISTRIBUCIONES.csv` | Bandas de puntos, dispersión, zonas, minutos, uso y estrellas; numerador/denominador |
| `09-CONTRASTES.csv` | Pares T01…T11, magnitudes puras pertinentes y resultados con exposición |
| `10-CAPACIDADES-Y-CONTROLES.csv` | Mapa de las 32, operación, salida, sensibilidad, exposición y límites del instrumento |
| `11-APRENDIZAJE-E-HISTORIA.json` | Conciliaciones históricas, dosis, duplicados y resumen por dominio de los seis pares |
| `12-EQUIVALENCIA.json` | Igualdad por secciones y casos; campos excluidos con motivo; controles de snapshot/jornada |
| `13-RENDIMIENTO.json` | Todas las pasadas, fases, RSS y barreras; distancias a los presupuestos |
| `14-AUDITORIAS.csv` | Invariantes y señales aplicables a SIM; no aplicar etiquetas del detallado sin instrumento equivalente |
| `15-PRUEBAS-Y-NAVEGADOR.md` | Comandos reales, commit final comprobado, pasos, descargas y no ejecutado |
| `16-LIMITES-Y-DECISIONES.md` | Pendientes concretos, aceptación separada y alternativas si falla coste/calidad |
| `DICCIONARIO.md` | Unidades, universos, comparabilidad, claves y semántica de ausencia |

Incluir una entrada real y resultados SIM/detallado comparables de VAL, más un snapshot válido que el comprobador restaure. El ejemplo no debe tener secciones capturadas en instantes distintos.

### 14.4 Evidencia detallada

Separar preferiblemente:

1. **Código y reproducción:** fuente de solo lectura suficiente, package/lock y comandos pertinentes, datos/perfiles efectivos, catálogo, agenda, reglas de selección, scripts y fixtures auxiliares necesarios. Incluir los helpers que los tests importan; el paquete de 03 omitía `tests/helpers.js`.
2. **Partidos y tablas:** esenciales de todos los casos principales, individuales/equipos/zonas/familias/quintetos/organizaciones/tramos/decisiones que se conservaron. R0/R1/candidatas diferenciados.
3. **Diagnóstico y consecuencias:** los 12 SIM y cuatro detallados seleccionados, exposiciones/propuestas por objetivo, ledgers y equivalencias.
4. **Coste y comprobación:** datos originales por pasada/barrera, validación, navegador y resultados del comprobador.

Una clave global contiene como mínimo versión/campaña, bloque, caso lógico, vector, modelo e intento. No reutilizar únicamente un id local de lote o intentar inferir identidad del prefijo del jugador.

En las tablas de tiro conservar numeradores y denominadores reales. Familia de ficha, contexto y cobertura tienen su universo propio. Controles SIM, finalizaciones, posesiones beM y estimadores de acta permanecen diferenciados.

No devolver como cero «no conservado», «no representado», «no registrado» o «no expuesto». Se pueden calcular indicadores aproximados, con nombre y fórmula explícitos; no utilizarlos como contador exacto al comparar modelos.

## 15. Comprobador y entrega accesible

Crear/reutilizar `scripts/sim04/verify-delivery.js` o equivalente pequeño. Debe verificar los archivos entregados, sin volver a simular la campaña.

Comprobar:

1. Tamaños y SHA-256 de contenedores y archivos internos; miembros declarados y referencias relativas seguras.
2. JSON/JSONL/CSV parseables y schemas/columnas esperados.
3. Recuento desde índices reales, sin contar intenciones de agenda como ejecuciones.
4. Trazabilidad de R0/R1/candidatas, selección CAL y congelación anterior a VAL.
5. Recalcular las pérdidas y el selector desde los resultados, no aceptar un booleano `selected=true` como prueba.
6. Zonas suman intentos/aciertos y calidades; canastas con falta incluidas cuando corresponden.
7. Identidades de participantes y créditos de bloqueador/presión compatibles con los registros conservados.
8. Totales esenciales y ledgers desde sus propios resultados, ausencia de doble consecuencia.
9. Equivalencias de optimización y rutas por sus secciones deportivas conservadas.
10. Cifras de rendimiento desde las mediciones; marcar explícitamente objetivos no cumplidos.
11. Validar la estructura de los ejemplos y comprobar el recibo de una restauración/continuación real del snapshot ejecutada antes de empaquetar. Esa continuación es una comprobación técnica aparte, contada como ejecución extra; el comprobador offline no vuelve a simularla.
12. Lo que no se pueda verificar con un paquete se declara no evaluado con causa, sin marcarlo conforme.

El recibo identifica versión del comprobador, archivos realmente revisados, verificaciones correctas/fallidas/no evaluadas y momento de ejecución. No crear una suma imposible sobre el propio ZIP que todavía se está construyendo.

**Entrega al usuario:** adjuntar realmente revisión rápida, índice y recibo, y las partes detalladas cuando el entorno lo permita. Verificar que existen y decir sus tamaños. Un path `/home/user/.../out/...` no es un enlace descargable para Dennis. Si no puedes adjuntar desde tu entorno, explicar la limitación, dar pasos concretos para obtener los archivos y conservar su ubicación/regeneración; no afirmar que los has adjuntado.

No publicar evidencia en servicios externos ni subir `out/` a Git sin autorización. Los ZIP históricos ausentes se declaran ausentes.

## 16. Respuesta final y estados de aceptación

### 16.1 Documentación que debe quedar en Git

- Prompt íntegro y catálogo.
- `docs/tecnico/sim-motor04.md`: correcciones, semillas, aproximaciones, selección y coste, con enlaces a tablas/evidencia.
- Contrato SIM para el manager actualizado o enlazado: preparar, seleccionar resolutor, avanzar, publicar, ordenar, guardar, recuperar, leer, confirmar historia/aprendizaje y garantizar una sola aplicación.
- Matriz de compatibilidad de perfiles/resultados/guardados.
- Páginas temáticas afectadas de táctica, familiaridad, aprendizaje, estadísticas, simultaneidad y conservación; no dejarlas únicamente en una nota de entrega.
- `docs/prompts/SIM-MOTOR-04-recorrido-manual.md`.
- Estado, changelog y límites reales.
- Manifiesto/plan/resúmenes pequeños necesarios para reproducir, sin versionar los grandes paquetes de `out/`.

### 16.2 Respuesta a Dennis, breve y comprobable

En este orden:

1. PR, rama, base, commit de código final y commit de evidencia; si seguía abierta #21 o ya era una nueva.
2. Qué probar: `npm run dev`, selector, activación explícita y ruta del recorrido manual.
3. Correcciones hechas y su efecto sobre trayectorias. Diferenciar cambios deportivos, de lectura y de rendimiento.
4. Vector seleccionado y diferencias numéricas exactas; declarar que es candidata provisional, no aceptación deportiva.
5. Recuento real por bloque y extras; fallos/reintentos conservados.
6. Resultados CAL frente a VAL por los universos correctos, sin convertir una señal en una conclusión universal.
7. Rendimiento: todas las pasadas, referencia/control exacto, objetivo de cinco segundos sí/no, RSS y máxima pausa de jornada.
8. Detallado congelado: control de referencia y hash de archivos protegidos.
9. Pruebas, navegador y no ejecutado; pendiente manual de Dennis.
10. Nombres/tamaños de archivos realmente adjuntos y comando del comprobador offline.
11. Pendientes para Dennis/ChatGPT, precisos y vinculados a evidencia.

### 16.3 Estado final independiente por dimensión

| Dimensión | Estados admitidos |
| --- | --- |
| Corrección funcional | Comprobada en alcance / parcial con defecto concreto |
| Integridad de evidencia | Correcta / incorrecta / incompleta |
| Convergencia de candidata | Mejora observada / mixta / contradicha / insuficiente |
| Validación externa | Parcial con fuentes declaradas / pendiente; no integral con este corpus |
| Rendimiento de lote | Cumple o no cumple por pasada, con frío/caliente y costes separados |
| Memoria y fluidez de jornada | Mediciones y objetivos de trabajo cumplidos o pendientes |
| Aceptación manual/deportiva | Pendiente de Dennis salvo aceptación expresa posterior |

Si el resultado es técnicamente útil pero no alcanza velocidad o convergencia, termina el trabajo autorizado, entrega los paquetes y explica el límite. No declarar el motor terminado en todas sus dimensiones porque el comprobador esté verde.

**Ejecuta el encargo completo dentro de este alcance. No te detengas en un plan, no solicites permisos rutinarios ya dados y no amplíes el modelo para llenar la entrega.**
