# beM · SIM-MOTOR-04B

## Correcciones de cierre, convergencia con el detallado y rendimiento masivo

**Destinatario:** Claude Code.  
**Repositorio autorizado:** `bateman37/beM`, exclusivamente.  
**Fecha del encargo:** 23 de octubre de 2026.  
**Entrega:** SIM-MOTOR-04B, continuación acotada de SIM-MOTOR-04.  
**Resultado:** implementación, candidata explícita, comparación emparejada, medición real y paquetes descargables para que ChatGPT analice los datos y Dennis realice la aceptación manual.

Dennis autoriza ejecutar este encargo. Acepta abordar los cinco puntos de la revisión independiente y acercar al máximo razonable el comportamiento de SIM al detallado, conservando la sencillez del generador. La autorización incluye las correcciones, la búsqueda pequeña de candidatas y las optimizaciones exactas delimitadas aquí. No incluye activar una candidata por defecto, aprobarla deportivamente, alterar el motor detallado ni introducir otro resolutor.

**Orden de trabajo:** comprobar base → reproducir los defectos → corregir y reparar instrumentos → congelar mecanismos y plan CAL/VAL → ejecutar CAL y seleccionar → congelar candidata → optimizar con igualdad comprobada → congelar código → ejecutar VAL y auditoría final → empaquetar y entregar.

No detenerse en un diagnóstico o un plan: realizar la implementación autorizada y entregar la evidencia. Si un objetivo numérico no se alcanza dentro de este alcance, terminar los demás bloques y declarar el incumplimiento con mediciones reales. No abrir una investigación indefinida para obtener un resultado verde.

## Índice

1. [Objetivo y límites](#1-objetivo-y-límites)
2. [Base, Git y autoridades](#2-base-git-y-autoridades)
3. [Hechos de la revisión independiente](#3-hechos-de-la-revisión-independiente)
4. [Punto 1 · Fatiga y rotaciones](#4-punto-1--fatiga-y-rotaciones)
5. [Punto 2 · Cierre, consultas y liberación](#5-punto-2--cierre-consultas-y-liberación)
6. [Punto 3 · Lecturas, exposición y trazabilidad](#6-punto-3--lecturas-exposición-y-trazabilidad)
7. [Punto 4 · Convergencia deportiva dirigida](#7-punto-4--convergencia-deportiva-dirigida)
8. [Candidatas y selección reproducible](#8-candidatas-y-selección-reproducible)
9. [Punto 5 · Rendimiento y memoria](#9-punto-5--rendimiento-y-memoria)
10. [Campaña acotada y reserva nueva](#10-campaña-acotada-y-reserva-nueva)
11. [Contratos, simultaneidad y aprendizaje](#11-contratos-simultaneidad-y-aprendizaje)
12. [Pruebas y recorrido manual](#12-pruebas-y-recorrido-manual)
13. [Archivos para ChatGPT](#13-archivos-para-chatgpt)
14. [Verificación, documentación y respuesta final](#14-verificación-documentación-y-respuesta-final)

## 1. Objetivo y límites

### 1.1. Los cinco puntos autorizados

| Punto | Implementación necesaria | Cierre esperado |
|---|---|---|
| 1 | Actualizar correctamente la fatiga utilizada por las rotaciones | Decisiones basadas en la energía actual, sin cambiar la curva ni imponer sustituciones obligatorias |
| 2 | Unificar el cierre y la liberación después de consultar el esencial | Consulta → sellado y sellado → consulta conservan el mismo resultado y liberan correctamente el estado |
| 3 | Corregir suficiencia de T03, interpretación de libres, fases de coste y reproducción del paquete | Informes verificables que distinguen cero esperado, no expuesto, no conservado y pendiente |
| 4 | Acercar mezcla/calidad al aro, pase final y participación al detallado | Candidata seleccionada con pocas filas y reserva nueva; sin compensar con más tiros o libres |
| 5 | Reducir estado intermedio, reconstrucciones y cálculo repetido del generador | Menor coste real con las mismas reglas, estadísticas, dirección y presente público |

Se busca coherencia de comportamientos y distribuciones, no el mismo marcador, ganador o secuencia de azar entre SIM y detallado.

### 1.2. Decisiones que permanecen vigentes

- Detallado de MOTOR-18C congelado, con referencia `20261016`: **83–98 y 6.684 sorteos**. Conservar también su huella e inventario de archivos deportivos.
- Detallado para el sénior propio y los encuentros expresamente asignados a visionado detallado. SIM para el resto, incluida la cantera propia.
- Simulada y Referencia comparten generador, reglas y dirección automática. Sus diferencias son de conservación y lectura.
- Se mantienen las 32 capacidades y sus consumidores; no crear atributos nuevos.
- Las posiciones nominales recomiendan, no prohíben participantes por sí solas.
- El entrenador, el director, las prioridades, los roles y el conocimiento mantienen efectos causales.
- Conocimiento congelado al preparar el encuentro; aprendizaje propuesto después de terminar y aplicado una sola vez al encuentro lógico, equipo y copia correspondientes.
- Partidos simultáneos con reloj virtual común, resultados públicos por frontera y clasificación en directo.
- Toda cifra deportiva nueva o ajustable en perfil/tablas administrables con procedencia, unidad, límites y efecto.
- Candidatas y cambios de perfil se activan explícitamente. No convertir archivos o perfiles en silencio.

### 1.3. Exclusiones

No implementar nuevas pantallas extensas, retransmisión visual, ligas, mercado, calendario definitivo, envejecimiento, nuevas jugadas, simulación de movimientos, pases intermedios paso a paso o un tercer motor.

No ajustar las fichas, los equipos, el detallado o las reglas estadísticas para hacer coincidir una media. No tocar genéricamente robos, libres, porcentajes base de tiro, curvas de Forma/momento o pendientes de atributos. No imponer topes de puntos o minutos. No eliminar controles tácticos, estadísticas individuales, mapas, exposición de aprendizaje o revisiones del entrenador para cumplir el cronómetro.

No consultar otros repositorios, incluido `v-apps`, Basket Manager o BeManager. Los archivos antiguos DESIGN/CLAUDE de otros proyectos no son autoridad funcional de esta entrega.

## 2. Base, Git y autoridades

### 2.1. Estado comunicado que debes verificar

- PR #21: cerrada sin fusionar.
- PR #22: comunicada abierta, con la serie SIM-MOTOR-01–04.
- Rama: `claude/busy-edison-b1fmnc`.
- Código y HEAD de 04: `ad52c914654fef3d4649f47093d05702e153f272`.
- Identidad SIM: `0.3.0-SIMMOTOR04`.
- Perfil efectivo SIM de 04: `SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023`.
- Candidata de 04: volumen 19,5; factor de triples 0,70; probabilidad base de pase final 0,90; gasto 3.

Leer primero las normas reales del repositorio, AGENTS.md si existe, índices y notas técnicas de 04. Registrar HEAD, base, rama y estado del árbol.

1. Si #22 sigue abierta y contiene la serie 01–04, continuar en su rama y actualizar título/descripción a 01–04B.
2. Si #22 ya se fusionó, partir de main actualizado y abrir una PR independiente para 04B.
3. Si #22 está cerrada sin fusionar, conservar la serie pendiente y abrir una PR que incluya lo necesario; no partir de un main que todavía no contiene SIM fingiendo que ya está integrado.
4. Conservar commits y trabajo ajeno. Ante un árbol ocupado, usar un worktree aislado del mismo beM. No resetear, limpiar ni forzar historia ajena.
5. Subir el resultado y dejar la PR abierta, sin fusionar ni suscribirte.

Los controles históricos se pueden ejecutar en worktrees de solo lectura del mismo repositorio. No mantener resolutores históricos adicionales dentro del producto.

### 2.2. Lectura dirigida y documentación

Usar las páginas temáticas y los contratos antes del funcional completo. Revisar especialmente:

- `src/sim/engine.js`, `model.js`, `materialize.js`, `profile.js`, `result.js`, `essential.js`, `reconcile.js`, `exposure.js`, `learning.js`, `shard.js`, `snapshot.js`, `coachsim.js` y sus equivalentes actuales.
- Coordinador y pool de `src/matchday/`, lotes persistentes y lectores de temporada.
- `scripts/sim04/`, sobre todo selección, rotación, exposición, tablas, jornada, benchmark y paquete.
- `docs/tecnico/sim-motor04.md`, prompt de 04, catálogo de fichas/salidas y política de asistencias implementada.

Archivar **este prompt íntegro** como `docs/prompts/SIM-MOTOR-04B-cierre-y-convergencia.md`, con entrada en el catálogo. Actualizar nota técnica, estado, changelog y temas afectados. No sustituir prompts anteriores ni reescribir todo el funcional.

La revisión independiente de ChatGPT, si se adjunta o ya está disponible, es evidencia de trabajo. Este encargo incorpora lo necesario para ejecutarse aunque los ZIP de `out/` de sesiones anteriores hayan desaparecido. No inventar esos archivos ni exigir que Dennis los regenere para empezar las correcciones.

### 2.3. Identidades obligatorias

| Identidad | Significado |
|---|---|
| DET | Detallado congelado, con el mismo perfil/fichas/planes de entrada de cada caso comparado |
| R04 | Código real de 04, ejecutado con su candidata 19,5 / 0,70 / 0,90 / 3 |
| R04B-N | Correcciones y traducciones verificadas de 04B, parámetros nuevos neutrales y los cuatro valores anteriores |
| C04B-* | Candidatas limitadas de este documento sobre R04B-N |
| C04B-FINAL-PROVISIONAL | Candidata seleccionada solo con CAL; pendiente de aceptación de Dennis |
| O04B-CONTROL | Código con mecanismos y candidata fijados, anterior a optimizar |
| O04B-FINAL | Código optimizado, mismo deporte y mismos valores que su control |

No mezclar «corrección», «calibración» y «optimización» en una única explicación de diferencias. El coste debe comparar O04B-CONTROL y O04B-FINAL; la convergencia debe mostrar R04, R04B-N, candidata y DET.

Usar una revisión de implementación propia de 04B, por ejemplo `0.3.1-SIMMOTOR04B`, y extensión `SEM-SIM04B-20261023` si hay filas nuevas. Separar versión de aplicación, implementación, perfil, política, dataset y formatos.

## 3. Hechos de la revisión independiente

Estos datos son diagnóstico de entrada, **no objetivos de marcador ni resultados que debas copiar**.

### 3.1. Comparación de las mismas 16 anclas VAL de 04

32 actuaciones de equipo por modelo; medias reales por partido, con las prórrogas que haya producido cada motor. Porcentajes calculados desde sumas de numeradores y denominadores.

| Métrica | R1 de 04 | Candidata de 04 | DET |
|---|---:|---:|---:|
| Puntos | 91,72 | 75,47 | 78,13 |
| Intentos de campo | 74,13 | 60,09 | 57,72 |
| Acierto de dos | 49,82 % | 50,85 % | 57,19 % |
| Intentos de tres | 30,59 | 23,47 | 20,13 |
| Libres intentados | 16,78 | 14,59 | 13,97 |
| Acierto de libres | 80,82 % | 82,01 % | 81,66 % |
| Asistencias de campo | 12,88 | 15,00 | 20,31 |
| Asistencias / canastas de campo | 38,69 % | 54,79 % | 69,08 % |
| Jugadores utilizados | 8,69 | 9,19 | 8,88 |

En aro: reparto 26,78 % frente a 35,35 %; acierto 52,23 % frente a 61,72 %; tiros forzados 18,83 % frente a 6,89 %. Interior y media tienen aciertos mucho más próximos. No corresponde subir todo el acierto de dos ni los libres para compensar esa diferencia localizada.

El selector anterior cumplió la regla acordada. Su pérdida combinada permitía compensar aproximaciones entre puntos y tiros; «ocho estados de mejora» no certificaba todas las dimensiones deportivas. Esta entrega utiliza objetivos separados y guardas explícitas.

### 3.2. Coste anterior

- Mil partidos: 12,01 s en F0; 7,81 y 7,35 s reutilizando proceso.
- Jornada de mil: 17,44 s; RSS 2.188,5 MiB, aproximadamente 2,14 GiB.
- Barrera de 2.400 s: publicación/revisión/consulta 1.823,6 ms más sellado 2.839,3 ms = 4.662,9 ms.
- En F2, generación media dentro del worker 23,57 ms; construcción 2,60 y conciliación 1,10. No basta con quitar serialización para asegurar cinco segundos.

La revisión confirmó igualdad de mil huellas y esenciales del control/optimización en cada pasada conservada. No debe perderse esa separación entre neutralidad de optimización y cambios deportivos autorizados.

## 4. Punto 1 · Fatiga y rotaciones

### 4.1. Defecto que debes reproducir

`_utility()` utiliza `pl.sev`. `step()` llama a `_rotate()` antes de `_prepareSides()`, que actualiza esa severidad desde la energía. La energía cambia al finalizar tramos y al recuperarse entre periodos. En el arranque `sev` se inicializa a cero incluso con energía baja.

Caso dirigido ya reproducido en el código de 04:

1. Entrada de EQ01–EQ02, semilla 11, sin parejas de participación en EQ01.
2. Titular de SG con todas sus capacidades a 20 y energía inicial 5.
3. Suplentes con todas las capacidades a 16 y energía 100. Los otros titulares pueden estar a 30 para aislar esa sustitución.
4. Ejecutar el primer tramo real, no solo una fórmula de prueba.
5. El código anterior compara utilidad 20 con severidad 0 y mantiene al titular. Refrescar la severidad existente da 0,825, utilidad 15,875 y relevo.

Es una reproducción de defecto, no una norma nueva de quién debe jugar. Hay además casos de revisión con energía 30 que cambian por el mismo desfase.

### 4.2. Corrección

La comparación de titular y suplentes debe utilizar la severidad derivada de **su energía actual**. Refrescar el dato antes de revisar la rotación o leerlo de manera equivalente en la operación existente.

- Mantener la curva y todos los pesos/umbrales de la política actual.
- Actualizar también suplentes recuperados, inicialización y reanudación tras descanso/guardado.
- No aplicar dos veces fatiga ni introducir un penalizador nuevo.
- Conservar la continuidad de tramos y los mínimos de permanencia.
- No obligar a salir por llegar a 30 de energía ni fijar un máximo de minutos.

Reparar `scripts/sim04/rotation-checks.js` o su sucesor: sus pruebas deben configurar energía y severidad coherentes y llamar al camino real. Verificar tanto un referente 30 claramente superior a un suplente 12 que puede continuar con energía 30, como un suplente que resulta mejor y debe entrar.

Comprobar también que la recuperación modifica la utilidad en la siguiente revisión. No atribuir toda la frecuencia de 40 minutos a este defecto sin medición.

**Efecto esperado:** puede cambiar trayectorias de SIM. Debe quedar identificado como corrección funcional, separado de cambiar gasto 3 a 3,5.

## 5. Punto 2 · Cierre, consultas y liberación

### 5.1. Defecto que debes reproducir

Con `ShardRunner(ctx, { releaseFinished: true })`:

1. Añadir EQ01–EQ02 con semilla 112.
2. Avanzar por barreras de 120 s con `{ defer: true }` hasta terminar.
3. Consultar `essential(id)` antes de sellar.
4. Llamar a `seal()`.

En 04, el esencial existe, está completo y es válido. `seal()` devuelve cero sellados y cero pendientes, pero `released(id)` sigue siendo falso: conserva el partido y sus eventos. La consulta llenó `e.essential` y el sellado saltó esa entrada sin liberar `e.m`.

### 5.2. Corrección

Centralizar un cierre idempotente por partido. Cuando corresponde liberar, debe:

- Construir el esencial si falta o reutilizar el completo ya validado.
- Conservar el paquete público final con la identidad, instantes y score originales.
- Liberar el estado generador y las referencias pesadas propias del partido.
- Registrar un estado de conservación coherente aunque el esencial se haya consultado antes.

Verificar estos recorridos con el mismo resultado deportivo:

| Recorrido | Resultado exigido |
|---|---|
| Terminar → sellar → consultar | Esencial final válido y estado liberado |
| Terminar → consultar → sellar | Igual esencial y estado liberado |
| Consultar y sellar repetidamente | Sin duplicados, azar ni liberaciones contradictorias |
| Consulta de partido en curso, si la API la admite | Vista parcial identificada; no cachear ese parcial como esencial definitivo |
| Guardar/recuperar antes y después del cierre | Conservación y resultado compatibles con la fase real |

No liberar antes de conservar lo necesario para el nivel elegido. Si una API deja de admitir snapshots del estado generador ya liberado, devolver el rechazo tipado que corresponda y mantener disponible el resultado final; no lanzar errores de nulos sin explicar la fase.

El cambio de orden de consulta, sellado y descarga no puede cambiar estadísticas, exposición, hash deportivo ni draws. No presentar esta corrección como explicación demostrada de todo el pico de memoria de 04: su benchmark no seguía el recorrido defectuoso.

## 6. Punto 3 · Lecturas, exposición y trazabilidad

### 6.1. T03: cero esperado en el control

El contraste normal/total de 04 registra cero presión adelantada en sus cuatro controles normales y exposición positiva en sus cuatro tratamientos. La tabla de suficiencia lo calificó como insuficiente porque exigió exposición positiva en ambos lados.

Corregir la evaluación con una expectativa declarada por variante:

- Control normal: ausencia de presión adelantada esperada; numerador 0 legítimo con controles rivales presentes.
- Tratamiento total: oportunidades positivas y denominador correcto.
- No conservado/no instrumentado: `null` con causa; no convertirlo en 0.
- Falta real de controles rivales: no evaluado con causa.

Releer los datos existentes si están disponibles. Si no lo están, la regresión pequeña puede usar esos contadores explícitos; no fabricar una campaña histórica. Cuatro pares siguen siendo una muestra reducida del efecto medio, aunque su exposición sea válida.

### 6.2. Libres y universos

Corregir la conclusión genérica «los libres siguen bajos». Separar oportunidades de falta, series concedidas, intentos y acierto. En las anclas emparejadas de 04, 14,59 FTA y 82,01 % no son inferiores a 13,97 y 81,66 % del detallado.

Mantener intentos de campo con canasta y falta, excluir fallos con falta de tiro y tiros anulados según la política vigente. Separar asistencia de campo y asistencia a libres, con sus denominadores. Conservar la finalización única y el bonus sin familia inventada.

Controles SIM, posesiones beM y finalizaciones son universos distintos. No crear una tasa comparativa mezclándolos. Para porcentajes usar sumas de numeradores/denominadores; para medias por 40 minutos normalizar cada actuación con su duración, conservando también cifras reales y sin prórroga.

### 6.3. Fases y unidades de coste

Separar preparación, generación, construcción, conciliación, transporte, guardado, acumulación anual, publicación y sellado. Declarar MiB/GiB correctamente. No llamar «barrera completa» a una fase que deja 2,84 s de sellado fuera.

### 6.4. Congelaciones y dependencias

La identidad de 04 registra congelación CAL en `84fe1b2`, ejecución R1 en `414a2f1` y congelación VAL en `bce62df`. Aclarar la función de cada identificador. No inventar un único commit que represente árboles diferentes.

Las nuevas campañas se ejecutan con código y plan confirmados, árbol limpio e inventario de hashes. Datos de `out/` no cuentan como modificación de implementación. Después de congelar VAL, no cambiar deporte, coeficientes ni reglas de selección.

El paquete de 04 omitía `scripts/sim03/lib.js`, requerido por los scripts/pruebas de 04. Incluir las dependencias transitivas necesarias para el comprobador y las reproducciones prometidas. Distinguir el paquete de lectura de un checkout completo; no afirmar que incluye las 335 pruebas reproducibles si no las incluye.

## 7. Punto 4 · Convergencia deportiva dirigida

### 7.1. Diagnóstico previo, con operaciones pequeñas

Usar los registros de 04 conservados; si faltan, emplear los nuevos controles CAL de este encargo. No repetir la campaña histórica completa.

Antes de ajustar, descomponer por contexto —organizado, transición, espontáneo y continuación—:

- Zona, calidad, intentos, aciertos y canastas con falta.
- Finalizador, función, presencia del director y bloqueador pertinente.
- Selección de zona frente a conversión del tiro seleccionado.
- Participantes utilizados para calidad y oposición: evitar interpretar un grupo funcional como defensor exacto observado.
- Oportunidades de pase final, pase generado, conservación/ruptura de ventaja representada y crédito de asistencia.
- Minutos/energía y cambios de quinteto tras corregir la rotación.

Comprobar si existe una traducción objetivamente incorrecta, un efecto duplicado o un campo del catálogo mal interpretado. Corregir un defecto demostrado con una regresión; no añadir un ajuste numérico para ocultarlo. No asumir que cada diferencia respecto a DET es un defecto: SIM tiene simplificaciones declaradas.

### 7.2. Mezcla al aro

Se autoriza una fila SIM neutral `shotMix.rimWeightFactor = 1`, si la mezcla existente no permite expresar el ajuste delimitado de la sección 8.

- Aplicar una vez a las celdas ya existentes de aro.
- Renormalizar dentro de cada contexto preservando su masa total previa.
- No crear una salida al aro en una ficha/contexto que no la admite.
- Mantener prioridades relativas, preferencia interior/exterior, media distancia, aptitud, lectura, roles y oposición.
- Con factor 1: identidad exacta de la mezcla previa a esa fila.
- No aplicarlo al acierto ni añadir puntos después del partido.

### 7.3. Calidad al aro

Primero resolver las traducciones/duplicaciones acreditadas. Si queda una diferencia de calidad que justifica evaluar un ajuste, se autoriza **una sola fila SIM de desplazamiento de calidad al aro**, por ejemplo `opportunity.simRimQualityLogit`, neutral 0.

Ese valor entra en la formación existente de calidad de las celdas de aro antes de sortearla. No modifica el porcentaje base de tiro, no reetiqueta un tiro ya resuelto y no se aplica al interior/media/triple.

Usar una sola vez el procedimiento de calidad. No duplicar familiaridad, momentos, ayudas o fatiga. Una celda no puede mutar por alias las calidades de otras zonas al reutilizar un objeto. La fila no elimina la diferencia entre buenos y malos jugadores ni entre tácticas.

Si un arreglo funcional ya resuelve la diferencia y no procede esta fila, omitir su búsqueda y dejar el motivo registrado. No es obligatorio utilizar todas las semillas autorizadas.

### 7.4. Pase final: traducción compacta y causal

Investigar la condición actual `c.exec === 'pass'`. El tipo de ejecución de una salida no demuestra por sí solo que no hubiese una recepción anterior. Tampoco convierte todo tiro en asistible.

Construir una pequeña tabla declarativa de elegibilidad basada en las salidas/familias vigentes y en la política de asistencia implementada. Para cada clase usada, conservar fundamento y una de estas situaciones:

| Clase | Tratamiento |
|---|---|
| Pase final explícito en la salida | Conservar su productor y la regla existente |
| Recepción previa acreditada por la ficha, con ventaja que puede conservarse hasta finalizar | Representar esa posibilidad mediante una decisión compacta y un pasador real |
| Acción individual/ventaja rota o ausencia de fundamento para recepción | Sin pase final añadido |
| Transición o espontáneo | Conservar su productor y las probabilidades declaradas; no heredar una ficha que no existió |
| Putback | No heredar asistencia ni pase de la acción anterior |

No crear secuencias completas de pases o conducción. Basta un estado/etiqueta compacto de procedencia y un participante real entre los elegibles. Si no hay fundamento en el catálogo para una recepción, mantenerlo como no acreditado, sin inventarla para alcanzar un porcentaje.

Para las recepciones acreditadas cuya conservación de ventaja necesita una probabilidad compacta, se autoriza una sola fila nueva, por ejemplo `assist.receivedAdvantageP0`, neutral 0 y con los valores de evaluación de la sección 8. Esa probabilidad no permite generar una recepción donde la tabla no la admite.

La regla causal de crédito se mantiene: pasador real distinto del finalizador, del mismo equipo, participante válido, pase generado antes de resolver el tiro y resultado elegible. No sortear la asistencia después de ver si se ha anotado para cuadrar su media. No acreditar dos asistencias a una misma finalización ni arrastrarlas entre continuaciones.

Conservar `assist.eligibleFinalPassP0 = 0,90` durante la búsqueda. La fila nueva no es un segundo multiplicador del crédito estadístico: representa únicamente la posibilidad pendiente y acreditada de conservar una ventaja tras recepción. Explicar su relación con la entrega final existente y registrar ambos denominadores.

Si la revisión del catálogo no acredita casos de esa segunda clase, no crearla por intuición. Reparar lo demostrable, conservar la diferencia y declararla como límite; no ampliar el motor para perseguir un 69 %.

### 7.5. Instrumentación que necesitamos para entender el resultado

Añadir o reparar lectores/contadores de auditoría, sin nuevas decisiones deportivas:

- Tabla **contexto × zona × calidad** con intentos y aciertos, tanto en SIM como DET cuando el registro lo permita.
- Separar tiro ordinario, canasta con falta y fallo con falta sin intento de campo.
- En diagnóstico seleccionado: calidad previa, probabilidad de tiro y términos ya calculados, indicando si la probabilidad es condicional a ausencia de tapón u otra condición.
- Embudo de pase final con clases de elegibilidad, oportunidades, pases generados, canastas elegibles, AST_FG, series y AST_FT.
- Decisiones de relevo con energía/severidad/utilidades reales cuando haya diagnóstico.

No volver a ejecutar fórmulas para presentar una probabilidad como si hubiese producido el resultado: leer el cálculo existente o etiquetar expresamente un contraste puro. Lo no conservado queda `null` con causa.

Los contadores intensivos pueden ser de auditoría seleccionada; su activación no altera RNG, deporte ni revisión del entrenador. El benchmark utiliza el nivel de salida comprometido, no instrumentación masiva innecesaria.

## 8. Candidatas y selección reproducible

### 8.1. Alcance numérico cerrado

La base R04B-N conserva volumen **19,5**, triples **0,70**, entrega final **0,90** y gasto **3**, más valores neutrales de las filas nuevas. No reabrir el ajuste de ritmo, triples, libres o robos en esta entrega.

Se autorizan **hasta siete vectores adicionales secuenciales**, no el producto cartesiano de las parrillas:

| Etapa | Fila | Base | Valores adicionales | Máximo de vectores |
|---|---|---:|---|---:|
| Z | `shotMix.rimWeightFactor` | 1 | 1,25; 1,50 | 2 |
| Q | Desplazamiento de calidad al aro | 0 | +0,25; +0,50 logit | 2 |
| A | Conservación de ventaja tras recepción acreditada | 0 | 0,25; 0,50 | 2 |
| E | `energy.costPerLiveMinute` | 3 | 3,5 | 1 |

Son **semillas SEM04B autorizadas para evaluación**, no cifras empíricas ni decisiones deportivas aceptadas. La etapa siguiente parte del ganador de la anterior. Reutilizar resultados del ganador; no repetirlo como un candidato nuevo.

Si una etapa no es pertinente o no mejora de manera admisible, conservar el valor previo. No sustituir una etapa omitida por más intentos de otra ni superar siete vectores sin un encargo posterior.

Todas las filas nuevas deben aparecer en el panel con neutral, valor, rango, unidad, procedencia y efecto. Validar valores finitos; factores positivos; probabilidades válidas y offsets dentro del rango autorizado. No arreglar automáticamente una candidata inválida.

### 8.2. Métricas separadas

Calcular sobre las mismas entradas CAL y sus anclas DET:

- `eP = abs(meanPTS40_SIM / meanPTS40_DET - 1)`.
- `eF = abs(meanFGA40_SIM / meanFGA40_DET - 1)`.
- `eZ = Σ_z abs(shareFGA_SIM[z] - shareFGA_DET[z])`.
- `e2 = abs(Σ2PM_SIM/Σ2PA_SIM - Σ2PM_DET/Σ2PA_DET)`.
- `eR = abs(ΣrimM_SIM/ΣrimA_SIM - ΣrimM_DET/ΣrimA_DET)`.
- `eQ = abs(forcedRimShare_SIM - forcedRimShare_DET)`.
- `eA = abs(ΣAST_FG_SIM/ΣFGM_SIM - ΣAST_FG_DET/ΣFGM_DET)`.
- Frecuencia de actuación de equipo con algún jugador ≥ 40 min, solo en partidos sin prórroga y con segundos originales.

Informar también intentos, libres, triples, pérdidas, robos, rebotes, titulares/banquillo, concentración de uso, prórrogas y dispersión. No convertir la media de puntuación en el único criterio.

### 8.3. Regla de selección predeclarada

Guardar estas reglas y su hash antes de ejecutar CAL. Usar valores sin redondear.

**Guardas comunes para aceptar un cambio respecto al ganador previo:**

- `eP_cand ≤ max(0,08; eP_previo + 0,02)`.
- `eF_cand ≤ max(0,08; eF_previo + 0,02)`.
- `e2_cand ≤ max(0,04; e2_previo + 0,01)`.
- `eR_cand ≤ max(0,05; eR_previo + 0,01)`.
- `eA_cand ≤ max(0,08; eA_previo + 0,02)`.
- `eZ_cand ≤ eZ_previo + 0,02` y `eQ_cand ≤ max(0,05; eQ_previo + 0,02)`.

Además de esas guardas locales, aplicar un límite acumulado respecto a R04B-N: para eP/eF/e2/eR/eQ/eA, el error no puede superar el mayor entre el error inicial y la banda orientativa correspondiente —0,08 / 0,08 / 0,04 / 0,05 / 0,05 / 0,08—; eZ no puede superar su valor inicial. Así, varias etapas no pueden sumar tolerancias locales para terminar con una deriva oculta.

Son guardas funcionales provisionales, no intervalos de confianza ni estándares publicados. Una candidata debe cumplir todas las guardas, locales y acumuladas; no compensar el incumplimiento de una con mejoras de otra.

**Objetivo por etapa:**

| Etapa | Objetivo entre las candidatas admisibles |
|---|---|
| Z | Menor `eZ` |
| Q | Menor `max(eR/0,05; eQ/0,05; e2/0,04)`; conserva todos sus componentes visibles |
| A | Menor `eA` |
| E | Subir a 3,5 solo si reduce ≥ 20 % relativo la frecuencia de 40 min frente al ganador previo con gasto 3, cumple las guardas y supera los casos de rotación corregidos |

En Z/Q/A conservar el previo si el objetivo ya es cero o la mejora relativa es inferior al 5 %. En empate con precisión `1e-9`, conservar el cambio menor respecto al previo y, después, el valor menor. Denominador ausente/nulo: no evaluado y se conserva el previo; nunca pérdida cero ficticia.

Las guardas se aplican respecto al ganador previo. Conservar además diferencias acumuladas frente a R04B-N y R04 para que varias etapas no oculten una deriva. El resultado elegido sigue siendo provisional aunque pase las reglas.

### 8.4. Lectura de la reserva

En VAL mostrar por separado los siete errores y sus numeradores. Utilizar como bandas orientativas: eP/eF ≤ 8 %; e2 ≤ 4 puntos porcentuales; eR/eQ ≤ 5 puntos; eA ≤ 8 puntos; diferencias por zona visibles. No afirmar calibración definitiva porque entre en esas bandas.

Comparar también deltas emparejados, distribución de puntos, extremos y resultados por equipo/estilo. Con muestras pequeñas, una diferencia de medias no acredita por sí sola una causa.

**VAL no elige ni reajusta la candidata.** Si contradice CAL o deja un desfase, conservarla como provisional y entregar el diagnóstico. No utilizar VAL y luego seguir llamándolo reserva independiente.

## 9. Punto 5 · Rendimiento y memoria

### 9.1. Objetivos que se mantienen

- Mil partidos en **≤ 5 s**, con cuatro workers activos, desde solicitud al pool preparado hasta esenciales individuales validados en poder del coordinador.
- Declarar además proceso nuevo → datos disponibles para el mundo, con arranque, calentamiento, guardado y acumulación incluidos.
- RSS de lote y jornada **≤ 1,5 GiB**.
- Publicación de una barrera de mil encuentros **≤ 1 s**, informando también sellado y tiempo completo.
- Mismo deporte y mismos outputs comprometidos, incluidos acta individual y estadísticas utilizables en el manager.

No rebajar metas ni declararlas cumplidas en otro hardware por extrapolación. Si no se alcanzan, devolver lo medido y su distancia. No trasladar trabajo obligatorio fuera del cronómetro para hacerlo desaparecer del coste total.

### 9.2. Intervenciones autorizadas y orden

**A. Estado y acumulación:** evitar reconstruir las mismas estadísticas por consulta; actualizar acumulados compactos de acta, zonas, familias, presencia, exposición y ventana observada del entrenador. Reutilizar un resultado final sellado y liberar referencias de su estado deportivo.

**B. Cálculo repetido por tramo:** medir y optimizar las dos operaciones dominantes concretas del generador. Precompilar estructura inmutable y reutilizar cálculos solo con dependencias e invalidación completas.

Un cambio de quinteto, rol, disposición, plan, cobertura, conocimiento, energía, Forma, momento, presión/contexto o perfil debe invalidar exactamente lo que corresponda. No reutilizar una magnitud dinámica de otro tramo como aproximación encubierta.

**C. Publicación y cierre:** desacoplar publicación de resultados y construcción de esenciales cuando la API lo permita, con trabajo de sellado acotado y cesión real de control. Demostrar en interfaz que el marcador se actualiza antes de completar el sellado; una llamada separada en un benchmark no basta.

Conservar la misma frontera pública para todos los encuentros. Puede existir estado deportivo terminado con acta aún en preparación: mostrar esa diferencia. La clasificación pública es provisional hasta que los resultados aplicables estén validados; no presentar un acta parcial como final válida.

Reutilizar los niveles de conservación actuales. No escribir otra ruta que elimine al entrenador o cambie el partido para acelerar el nivel Referencia.

### 9.3. Presupuesto de optimización

Realizar una pasada de reducción de estado/construcción y una de los dos puntos de cálculo dominantes, con perfiles y una verificación pequeña por cambio. No crear una búsqueda ilimitada de microoptimizaciones.

Una representación compacta/incremental está autorizada si conserva los contratos. No perder campos necesarios para snapshots, lectores, familias, finalizaciones, créditos, exposición o acumulados anuales.

Las huellas se calculan sobre los mismos hechos deportivos y reglas de proyección. No eliminar campos de una comparación ni cambiar su definición después de ver una diferencia para declarar igualdad. Si una huella adicional resulta necesaria por la representación, versionarla y conservar una comprobación independiente de los campos deportivos originales en los casos de control.

Las aproximaciones nuevas que alteren decisiones, frecuencias, revisiones o distribuciones para ganar tiempo **quedan fuera de este bloque exacto**. Describirlas como alternativa si hicieran falta; no introducirlas silenciosamente.

### 9.4. Medición de lote

Congelar la misma agenda de 1.000 casos para ambos códigos. Usar cuatro workers activos; no ejecutar cargas competidoras simultáneas.

Comparar O04B-CONTROL y O04B-FINAL con F0, F1 y F2. Preferir orden alternado: control F0 → final F0 → final F1 → control F1 → control F2 → final F2, manteniendo un proceso preparado por versión cuando sea necesario. Medir cada proceso por separado; solo un pool trabaja cada vez.

F0 es primera pasada del proceso, con preparación/calentamiento declarados. F1/F2 reutilizan ese proceso. Registrar todos los casos de calentamiento y su tiempo, fuera de la agenda y sin ocultarlos en el coste de arranque.

Guardar por caso ID, entrada, semilla, estado, validez, marcador, duración, prórrogas, huella deportiva y hash del esencial. Comprobar igualdad de los mil casos por pasada. Conservar latencia media/p50/p95/máxima, fases, bytes, RSS de proceso con workers incluidos y disponibilidad para el mundo.

No usar solo la mejor pasada. No llamar p95 de rendimiento a tres tiempos globales; los percentiles por caso y por barrera sí tienen sus respectivas poblaciones.

### 9.5. Jornada de mil

Ejecutar una jornada de mil para el control y otra para el final, misma agenda, cuatro workers, barreras públicas de 120 s. Incluir prórrogas hasta finalizar todos.

Por barrera registrar: presente virtual, activos/terminados, nuevos cierres, publicación, revisión, consulta, sellado, cola pendiente, actas listas, estados liberados, transporte, RSS y clasificación pública.

Informar dos latencias: hasta publicar marcador/clasificación y hasta completar el trabajo obligatorio de esa barrera. Si el sellado se solapa o termina más tarde, aportar una línea temporal que evite sumar dos veces fases solapadas o descontar trabajo pendiente.

En navegador, un caso pequeño debe verificar que el progreso se repinta, se pueden usar controles y no se filtran futuros mientras hay sellado pendiente. No hace falta representar mil tarjetas en el DOM.

## 10. Campaña acotada y reserva nueva

### 10.1. Plan, entradas y semillas

Crear plan y agendas antes de simular. Confirmarlos en Git con árbol limpio. Semilla maestra **20261023**, con espacios de nombres nuevos `SIM04B|CAL`, `VAL`, `STRESS`, `CONTRAST`, `OPT`, `TECH`, `BENCH`.

Derivar semillas mediante el mecanismo determinista SHA-256 ya utilizado: clave lógica, bloque, equipos ordenados y réplica. Excluir resolutor, candidata, worker, intento y nivel de registro. Controlar colisiones de claves/semillas y conservar el registro de resolución determinista si aparece alguna.

Misma entrada materializada, seed y contexto para cada caso emparejado. Los modelos pueden consumir azar de forma distinta; no se exige mismo resultado entre SIM y DET. No modificar fichas, planes o rival entre variantes salvo el factor explícito de un contraste.

La evidencia CAL/VAL de 04 ya fue examinada y puede orientar desarrollo. **No reutilizar sus resultados como nueva reserva.**

### 10.2. Población principal

Mantener como población principal de selección: **EQ01, EQ02, EQ03, EQ04, EQ05, EQ08, EQ09 y EQ12**, planes naturales intactos. EQ06/EQ11 extraordinarios, EQ07 veterano y EQ10 cantera quedan en estrés, no determinan los parámetros globales.

Con el orden anterior indexado 0…7:

- **CAL, 24 casos:** parejas no ordenadas del anillo de distancia 1 —ocho aristas— y las cuatro parejas opuestas de distancia 4; ejecutar ambas orientaciones. Cada equipo aparece seis veces, tres en cada lado.
- **VAL, 24 casos:** las ocho parejas únicas de distancia 2 y las cuatro parejas `(0,3)`, `(2,5)`, `(4,7)`, `(6,1)`; ambas orientaciones, namespace VAL. Es otro conjunto de rivales, equilibrado y separado de CAL.

Cada caso tiene una réplica. Congelar también las entradas VAL antes de ejecutar CAL; mantener sus resultados sin calcular ni consultar hasta fijar candidata y optimización. Esta diversidad no convierte la muestra en una temporada representativa de ACB.

### 10.3. Presupuesto máximo de ejecuciones principales

| Bloque | Diseño | SIM máximo | DET máximo |
|---|---|---:|---:|
| CAL | 24 × (R04 + R04B-N + hasta 7 candidatas), con ganadores reutilizados | 216 | 24 |
| VAL | 24 × (R04 + R04B-N + candidata final), mismos casos | 72 | 24 |
| STRESS | 16 casos × (R04B-N + final); anclas DET de la primera réplica | 32 | 8 |
| CONTRAST | 8 factores × 2 variantes × 2 orientaciones; cuatro anclas DET | 32 | 4 |
| DIAG | Repeticiones seleccionadas, no observaciones independientes | 8 | 4 |
| OPT | 12 entradas CAL × control/final, seis con perfil neutral y seis con candidata | 24 | 0 |
| TECH | Cuatro entradas × cuatro rutas equivalentes | 16 | 0 |
| **Máximo principal** | No obligación de agotar candidatas omitidas | **400** | **64** |

Es una campaña de hasta **464 ejecuciones principales**, no 464 observaciones independientes. No generar miles de detallados.

Aparte: benchmark de seis pasadas de mil y dos jornadas de mil = **8.000 ejecuciones SIM de rendimiento**, más calentamientos declarados. Las pruebas y navegador se identifican aparte. No presentar estos repetidos de coste como muestra deportiva adicional.

Si hay un defecto real descubierto, conservar la incidencia, reparar y repetir únicamente el bloque afectado con los mismos IDs/semillas y un intento nuevo. No borrar fallos ni mezclarlos con los aceptados. No repetir una campaña por un marcador que no guste.

### 10.4. Estrés y contrastes

**STRESS:** parejas EQ06–EQ02, EQ11–EQ09, EQ07–EQ10 y EQ06–EQ11; dos orientaciones × dos semillas = 16 casos. Primera réplica con DET en las ocho orientaciones. Esas anclas actuales sustituyen comparaciones causales con medias históricas no emparejadas. No imponer un tope a la estrella ni convertir cantera en el objetivo global.

**CONTRAST:** conservar fichas salvo el factor de cada par:

1. Preferencia interior/exterior 1/5.
2. Rebote/balance después del tiro 1/5.
3. Altura de presión normal/total.
4. COB01/COB03, con libro rival compatible en ambos casos y prioridades correctas.
5. MEN02/MEN03 del director efectivo 8/24.
6. Familiaridad pertinente K8/K28, restantes componentes constantes.
7. Energía inicial 100/30.
8. Libertad 1/5, mismo director y lectura.

Usar los pares de equipos existentes de T01…T09/T06 cuando proceda y documentar el mapeo; no elegirlos después de ver marcadores. Dos orientaciones, una réplica, dos variantes por factor: cuatro SIM por factor. Las cuatro anclas DET corresponden a ambas variantes de preferencia interior/exterior y del director, en una orientación fijada antes de ejecutar.

Evaluar primero el cálculo fijo pertinente y la exposición real; los cuatro partidos por factor no garantizan un efecto medio preciso ni que cada variante mejor gane siempre.

Reejecutar la matriz **existente** de 32 capacidades × ocho contextos × +1/+3/+5 y las sondas existentes de controles como operaciones puras, no partidos. Conservar saturaciones, proxies y ausencia de instrumentación; detectar nuevas desconexiones. Incluir PRESS K8/K28 con altura adelantada y su no aplicación con altura normal. No exigir que Consistencia suba la media o que cada atributo eleve puntos.

**DIAG:** los cuatro casos VAL serán EQ01→EQ04, EQ02→EQ09, EQ05→EQ12 y EQ09→EQ01, todos presentes en la agenda indicada. Ejecutar esos cuatro en DET y final SIM; los otros cuatro SIM diagnósticos cubren presión total, familiaridad K28, director 24 y energía inicial 30 de CONTRAST, orientación 1 en cada caso. Enlazar cada repetición al caso principal y comprobar su igualdad deportiva. La flecha indica el orden de equipos, no un ganador.

### 10.5. Congelación y uso de resultados

Los defectos y la traducción declarativa se resuelven antes de congelar CAL. Las parrillas, reglas, agendas y estructura de mecanismo también quedan fijadas antes de comparar candidatas.

Seleccionar solo con CAL. Fijar perfil y valores. Optimizar contra el mismo código deportivo preoptimización. Congelar implementación/perfil/lectores de VAL y ejecutar la reserva con árbol limpio.

Después de VAL solo se permite documentación/empaquetado y correcciones que no afecten su evidencia. Un cambio deportivo obliga a declarar invalidada la reserva para esa versión; no seguir afirmando que validó el código final. No hacer ajustes nuevos con VAL dentro de esta entrega.

## 11. Contratos, simultaneidad y aprendizaje

### 11.1. Equivalencias técnicas

En TECH, cuatro casos fijados antes de ejecutar, con la candidata final:

1. Partido automático de una vez, registro normal.
2. Avance por fronteras con consultas públicas/propias/diagnósticas intermedias.
3. Guardado y restauración en una frontera común, continuando con las mismas revisiones/noticias.
4. Nivel Referencia con registro mínimo comprometido y resultado esencial.

Mismos hechos deportivos, marcador, acta, exposición y dirección cuando las entradas son equivalentes. No permitir que consultar active azar, reconozca patrones futuros o adelante aprendizajes.

OPT y benchmark prueban igualdad de la optimización. TECH prueba igualdad entre rutas dentro de la implementación nueva. No usar uno como sustituto del otro.

### 11.2. Jornada mixta y control de autoridad

Un recorrido pequeño de cuatro encuentros simultáneos —uno DET y tres SIM— debe cubrir:

- Reloj común, partido ya terminado y otro activo.
- Clasificación inicial, provisional y final.
- Noticia de necesidad de resultado entregada solo al alcanzar su frontera pública.
- Orden al equipo autorizado; rechazo tipado a otro equipo/partido terminado.
- Pausa, guardado, recarga real y recuperación.
- Esencial consultado antes del sellado y estabilidad del paquete final tras recarga.
- Progreso visible mientras termina el sellado.

Si se compara recuperación con ejecución continua, usar dos ejecuciones del mismo guion y contarlas como extras de interfaz, no como nuevos casos deportivos. Sin noticias, agrupar o consultar no puede cambiar la trayectoria; con noticias equivalentes, tampoco.

### 11.3. Temporada y aprendizaje

Reutilizar los resultados de VAL para comprobar acumulados por jugador, club y competición. No simular otra temporada completa solo para sumar sus actas. Conservar modelo, versión, política y denominadores.

Mantener el comportamiento existente: finalizar estadísticas no aumenta edades; no implementar manager nuevo.

Aprendizaje con funciones comunes de MOTOR-18B/18C:

- Un minuto vivo = 600 décimas de segundo; presupuesto y reparto normalizados.
- Exposición real por participante/dominio; sin dosis a quien no participa.
- Propuesta solo después de resultado terminado y válido.
- Aplicación única por encuentro lógico/equipo/copia, aunque cambie el intento.
- M1 distinto de M10; rechazo de copia ajena y de manejador obsoleto.
- Polivalencia cambia aprendizaje posterior, no el partido ya disputado.

Las nuevas recepciones/pases no conceden presupuesto de aprendizaje adicional por generar más etiquetas. No modificar conocimientos durante el encuentro.

### 11.4. Compatibilidad

04B corrige decisiones futuras de rotación y puede cambiar generación de oportunidades/pases. Por tanto, los guardados en curso de `0.3.0-SIMMOTOR04` no deben continuarse como si fueran la misma semántica.

- Rechazo explicado y archivo original intacto para esos guardados en la nueva implementación.
- Resultados terminados antiguos: lectura según su contrato, sin re-simular ni completar datos ausentes.
- Cambiar schema solo si cambia su estructura; la compatibilidad también valida revisión de implementación.
- Guardados nuevos conservan acumulados, RNG, conocimiento inicial, futuros privados, revisiones y fases de cierre necesarios.
- Perfiles/candidatas históricos se consultan y se copian mediante una acción explícita; no activar una versión nueva al abrir.
- No incluir un segundo kernel histórico en el producto para evitar el rechazo.

## 12. Pruebas y recorrido manual

Pruebas automáticas **justas y dirigidas**. Reutilizar las existentes; no crear una matriz de tests por cada fila de informe ni tests que solo repitan constantes de implementación.

Agrupar las regresiones necesarias en aproximadamente ocho grupos, ampliando solo por un defecto nuevo demostrado:

1. Fatiga actual en la rotación, recuperación y referente superior.
2. Consulta/sellado/liberación idempotentes, incluido parcial si se admite.
3. Exposición T03 con cero esperado y tratamiento real; `null` distinguido de cero.
4. Mezcla/calidad al aro: identidad neutral, una aplicación, normalización y ausencia de alias entre zonas.
5. Pase/ventaja/crédito: productor real, no asistencia inventada, participante válido y continuación sin herencia indebida.
6. Equivalencia de acumulación y prefijos, snapshots y exposición tras compactar.
7. Selector y guardas: ninguna compensación de una guarda incumplida; reserva no utilizada para elegir.
8. Paquete y dependencias realmente reproducibles, usando el comprobador existente cuando cubra el riesgo.

Demostrar con el comportamiento anterior que las dos regresiones de cierre/fatiga fallan por el motivo correcto. No modificar el producto para introducir deliberadamente el fallo; usar control/worktree o sustitución acotada dentro de la prueba.

Ejecutar las pruebas dirigidas al cambiar el área; suite completa una vez al finalizar código y pruebas; `data:check` y documental sobre copia limpia. Si hay cambios de código posteriores o una nueva incertidumbre material, repetir lo afectado y el cierre necesario. No repetir la suite por retoques de texto sin motivo.

Recorrido Chromium acotado a controles afectados y jornada pequeña, con consola/red, descargas reales y guardado/recarga. No recorrer todas las pantallas antiguas de nuevo. No afirmar pruebas en otros navegadores o Node 24 si no se han hecho.

Entregar `docs/prompts/SIM-MOTOR-04B-recorrido-manual.md`, con pasos, semilla, perfil, resultado esperado y señal de fallo. Incluir candidata explícita, rotación, aprendizaje, consulta antes de sellado, jornada, recuperación y descargas. **Dennis realiza la aceptación manual; la automatización no la sustituye.**

## 13. Archivos para ChatGPT

### 13.1. Archivos finales

En `out/sim-motor04b/entrega-final/`, fuera de Git:

1. `SIM-MOTOR-04B-revision-rapida.zip` —objetivo ≤ 8 MiB—.
2. `SIM-MOTOR-04B-evidencia-detallada.zip` —preferentemente una pieza ≤ 50 MiB; si no, partes verificables—.
3. `SIM-MOTOR-04B-indice-partes.json`.
4. `SIM-MOTOR-04B-verificacion-final.json`, recibo del comprobador, fuera de los ZIP.

Adjuntar realmente los cuatro archivos en la interfaz disponible. No basta con afirmar que están en el contenedor; `out/` puede desaparecer y no está en Git. Si no existe capacidad de adjuntar, decirlo y dar las rutas y pasos de descarga reales, sin inventar enlaces ni publicar datos en otro servicio sin autorización.

Si la revisión independiente de ChatGPT está disponible, conservarla como antecedente identificado; no presentarla como una auditoría realizada por Claude.

### 13.2. Contenido del rápido, indexado y compacto

| Archivo | Contenido mínimo |
|---|---|
| `00-LEEME.md` | Orden de lectura, conclusión factual por bloque y límites |
| `01-IDENTIDAD.json` | Base/HEAD, congelaciones, árbol, versiones, parámetros, inventario y hashes |
| `02-CORRECCIONES.csv` | Reproducción anterior/nueva, archivo/operación, tipo: deporte/lector/optimización |
| `03-PARAMETROS-Y-CANDIDATAS.csv` | Filas, valores, unidades, procedencia, activación, neutral y diferencias |
| `04-PLAN-Y-RECUENTO.csv` | Solicitados/ejecutados/válidos/fallos/interrumpidos/no ejecutados; extras separados |
| `05-MAPA-CASOS.csv` | Identidad global, caso, bloque, modelo, variante, réplica, seed, hashes, intento y ruta del registro |
| `06-EQUIPOS.csv` | Acta, minutos/uso, dispersión y denominadores por actuación de equipo |
| `07-SELECCION-CAL.json` | Reglas, hash, todos los componentes, candidatas descartadas y elección re-derivable |
| `08-VAL-COMPARATIVA.csv` | R04/R04B-N/final/DET emparejados, cifras reales/40 min/sin prórroga |
| `08b-ZONA-CONTEXTO-CALIDAD.csv` | Intentos/aciertos y calidades por contexto y zona, causas de ausencia |
| `08c-PASES-Y-ASISTENCIAS.csv` | Clases y embudo causal, pases/canastas/series/créditos |
| `08d-ROTACIONES.csv` | Minutos, energía/severidad, razones y frecuencia sin prórroga |
| `09-CONTRASTES.csv` | Deltas emparejados, cálculo fijo, exposición y límites de muestra |
| `10-CAPACIDADES.csv` | Matriz existente, consumidores, proxies, saturaciones y cambios respecto a 04 |
| `11-HISTORIA-Y-APRENDIZAJE.json` | Conciliación de acumulados, propuesta posterior y aplicación única |
| `12-EQUIVALENCIAS.json` | OPT/TECH, hashes por caso, qué se compara y qué no |
| `13-RENDIMIENTO.json` | Datos originales resumidos de cada pasada/barrera; fases completas, RSS, preparación y metas |
| `14-AUDITORIA.csv` | Invariantes evaluadas, exposición, estado, fallos y causa de no evaluación |
| `15-PRUEBAS-Y-NAVEGADOR.md` | Comandos, versiones, resultados reales y recorrido manual pendiente |
| `16-LIMITES-Y-DECISIONES.md` | Diferencias deportivas restantes, metas incumplidas y aceptación pendiente |
| `DICCIONARIO.md` | Unidades, campos, categorías y universos; significado de cero/null/no aplica |

No reducir el rápido a medias globales. Incluir equipo y jugador, aciertos e intentos, distribución y casos emparejados necesarios para que ChatGPT pueda recalcular. Puede organizarse en subcarpetas; conservar un índice claro.

### 13.3. Detalle suficiente, sin trazas gigantes

- Entradas materializadas y perfiles de cada vector, con diff exacto y semillas.
- Registros esenciales de todas las ejecuciones principales aceptadas y registro separado de incidencias/intentos descartados.
- Tablas por jugador, zona/calidad/contexto, familia, quinteto, defensa y director cuando el nivel los conserva.
- Diagnósticos nativos de la muestra fijada, enlazados con sus gemelos principales.
- Embudo de pases y catálogo de elegibilidad con fundamento de cada clase.
- Mediciones originales, perfiles de coste, digest y huellas de los mil casos por pasada, memoria y barreras.
- Casos de defecto anterior y resultado corregido, sin resumirlos como «pasa».
- Un guardado nuevo continuable y su entrada/perfil/resultado final, coherentes con el mismo partido.
- Código de lectura y dependencias transitivas necesarias para recalcular las tablas/selección, comprobar archivos y reproducir los ejemplos prometidos.

Guardar registros comprimidos sin necesidad de inflar miles de trazas. No inventar campos ausentes ni re-simular un partido para afirmar que sus nuevas etiquetas estaban en el original.

CSV UTF-8, números sin formato local ambiguo y claves estables. No sustituir un valor ausente por cadena vacía sin una causa interpretable. Identificar `match_id`, caso lógico, intento, equipo y modelo por separado; no mezclar un reintento con otro partido.

## 14. Verificación, documentación y respuesta final

### 14.1. Comprobador offline

Reutilizar/extender los comprobadores existentes. El comando final debe funcionar con la carpeta de entrega y **no volver a simular**.

Comprobar:

- Tamaños y SHA-256 de contenedores y archivos declarados.
- Parseo, esquemas, integridad de referencias e inventario frente a agenda.
- Cero claves lógicas aceptadas duplicadas; fallos sin marcador ni derrota inventados.
- Consistencia de acta, zonas, familias, asistencias y acumulados.
- Re-derivación de selección y guardas CAL desde numeradores y denominadores, no desde la conclusión guardada.
- Correspondencia del vector elegido con VAL, OPT y benchmark.
- Identidades de entrada, perfil, implementación y huellas por caso.
- Reproducciones y dependencias incluidas: si algo requiere checkout, declararlo y no contarlo como reproducción autónoma del ZIP.

Un `no evaluado` no es conforme. El recibo debe contener cada comprobación, su estado, dato examinado y motivo de exclusión, sin utilizar un total verde para ocultar pendientes.

### 14.2. Estados de cierre

Informar separadamente:

| Estado | Qué acredita |
|---|---|
| Corrección técnica | Defectos reproducidos y resueltos, contratos y pruebas pertinentes |
| Convergencia funcional | Resultado comparado por métricas y exposición; no mismo marcador |
| Candidata deportiva | Vector elegido solo con CAL, con VAL y límites disponibles |
| Rendimiento | Medición real por meta, con fases completas; cumplido/no cumplido |
| Aceptación manual | Pendiente de Dennis hasta que él la realice |
| Validación externa/FIBA integral | No cerrada por esta campaña |

Las referencias externas primarias ya aportadas en 04 sirven como contexto, no como cuotas universales de anotación para estos equipos sintéticos. No gastar esta entrega en reintentos de PDF bloqueados ni afirmar lectura directa que no has hecho. ChatGPT realizará la interpretación deportiva profunda de los paquetes.

### 14.3. Respuesta final que debe recibir Dennis

Entregar una respuesta factual y breve con:

1. PR/rama, base, commit deportivo final y commit de empaquetado; si son distintos, qué cambió entre ambos.
2. Las dos correcciones reproducidas y sus comprobaciones, más reparación de T03/lectores.
3. Vector final provisional, selección, reserva y diferencias que permanecen; ninguna aceptación automática.
4. Tabla resumida CAL/VAL emparejada: puntos, tiros, reparto/acierto al aro, dos, triples, libres, asistencia y participación.
5. Tabla de coste completa F0/F1/F2, jornada, publicación/sellado, memoria y cumplimiento de cada meta.
6. Cantidad real por bloque y extras; fallos, repeticiones y no ejecutados sin ocultarlos.
7. Pruebas/navegador realmente ejecutados y recorrido manual de Dennis.
8. Los cuatro archivos adjuntos, tamaños, hashes, rutas y comando offline que acaba de pasar sobre sus bytes finales.
9. Confirmación del detallado conservado mediante referencia **e inventario de hashes**, y de que no se consultaron otros repositorios.

No declarar «motor cerrado», «calibrado» o «cinco segundos conseguidos» si la evidencia no lo acredita. No pedir permiso para completar lo que este encargo ya autoriza. La entrega debe dejar una base concreta y revisable: correcciones implementadas, candidata identificada y datos suficientes para que ChatGPT y Dennis decidan su aceptación.
