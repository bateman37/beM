# MOTOR-17B · Cierre técnico y auditoría acotada

**Destinatario:** Claude Code, repositorio `bateman37/beM`.  
**Fecha del encargo:** 21 de octubre de 2026.  
**Modalidad:** implementación delimitada, verificaciones proporcionadas y extracción final para ChatGPT.  
**Resultado esperado:** cerrar los pendientes concretos de MOTOR-17 y entregar evidencia pequeña, íntegra y suficiente para revisarlos. La interpretación deportiva final corresponde a Dennis y ChatGPT.

## Índice

1. [Objetivo y alcance autorizado](#m17b-01)
2. [Base real, Git y lectura dirigida](#m17b-02)
3. [Hallazgos que hay que cerrar](#m17b-03)
4. [Organización defensiva en el registro esencial](#m17b-04)
5. [Sensibilidad de las 32 capacidades](#m17b-05)
6. [AUD05 y coherencia del auditor](#m17b-06)
7. [Crédito de robo y procedencia](#m17b-07)
8. [Perfiles, candidata y compatibilidad](#m17b-08)
9. [Propiedades deportivas que conservar](#m17b-09)
10. [Campaña final: 30 casos y 12 diagnósticos](#m17b-10)
11. [Datos que devolver para el análisis](#m17b-11)
12. [Pruebas y recorrido de interfaz](#m17b-12)
13. [ZIP, comprobador y descargas](#m17b-13)
14. [Documentación y requisitos posteriores](#m17b-14)
15. [Aceptación y mensaje de entrega](#m17b-15)

<a id="m17b-01"></a>

## 1. Objetivo y alcance autorizado

Dennis considera que la base del partido funciona y quiere conservarla. Esta entrega completa los pendientes identificados en la revisión independiente de MOTOR-17. Se trabaja sobre el motor por posesiones y acontecimientos existente.

Implementa estos cinco bloques:

1. Corregir la conservación de la organización defensiva efectiva en `world-essential`.
2. Completar los contrastes representativos de las 32 capacidades hasta la salida pertinente de sus operaciones reales.
3. Corregir los estados y motivos de AUD05 y mantener coherentes sus informes.
4. Resolver la excepción de crédito de robo con recogida controlada sin interceptor previo y unificar la procedencia del crédito.
5. Actualizar documentación, cobertura, pruebas de interfaz y evidencia final, con una auditoría acotada y ZIP descargables.

La auditoría forma parte de esta entrega y se ejecuta **después de implementar y congelar**. Claude hace las comprobaciones mecánicas y entrega los datos; ChatGPT realiza el análisis deportivo. No ajustes parámetros tras ver sus resultados.

### Límites

- Conserva las 32 capacidades, tácticas, repertorio, administración reglamentaria, energía, Forma, momentos, memoria y dirección existentes.
- Mantén el control numérico en las tablas y perfiles administrados.
- No cambies porcentajes de tiro, faltas, rebote, pérdidas, intervención defensiva, tiempos, gasto o recuperación para acercarte a medias externas.
- No modifiques población, planes naturales ni criterios de relevo para hacer jugar a todos o evitar jugadores de 40 minutos.
- No implementes el motor rápido, simultaneidad de jornadas, clasificación en directo, manager ni una renovación visual del partido.
- No repitas las campañas MOTOR-16 o MOTOR-17. No lances lotes de cien, doscientos o mil por rutina.
- No consultes otros repositorios, incluidos los proyectos anteriores. Un worktree aislado de **este mismo repositorio** sí está autorizado.
- No fusiones, publiques releases, te suscribas ni envíes mensajes a terceros.

Puedes resolver decisiones técnicas reversibles dentro de este alcance. Si aparece una decisión funcional nueva, registra evidencia y opciones y continúa los bloques independientes. No inventes una regla deportiva para desbloquear un lector.

<a id="m17b-02"></a>

## 2. Base real, Git y lectura dirigida

### 2.1 No asumir qué está fusionado

El último estado comunicado fue PR `bateman37/beM#17`, rama `claude/busy-edison-b1fmnc`, abierta contra `main`. La campaña congelada identificaba `fd75554`; el código empaquetado posteriormente, `01c8ade`. Son antecedentes, no garantía del estado actual.

Comprueba el estado real de Git y de esa PR:

- Si MOTOR-17 sigue pendiente, continúa sobre su código con commits identificados como MOTOR-17B y explica la dependencia. Actualiza la PR existente si corresponde a esa rama y a ese trabajo.
- Si está fusionado, crea la rama de MOTOR-17B desde el `main` actualizado y prepara una PR propia.
- No hagas resets destructivos, elimines cambios de Dennis ni mezcles trabajo ajeno. Conserva lo que encuentres y aísla esta entrega cuando sea necesario.
- Si algún pendiente ya está corregido, verifícalo y registra que estaba resuelto; no lo reimplementes para producir un diff.

Antes de editar, identifica un **CONTROL17** ejecutable e inmutable, con su commit completo. No uses el código final con una etiqueta antigua como supuesto control. Si no puedes obtener una base comparable, completa lo independiente y declara la comparación bloqueada; nunca sustituyas la evidencia por un resultado fabricado.

### 2.2 Lectura proporcionada

Lee las normas raíz, los índices y estado, este encargo, `docs/tecnico/motor17.md`, los contratos de registro/auditoría afectados y los módulos pertinentes. Consulta por temas el funcional vigente cuando lo necesites.

Si se adjunta `beM-MOTOR-17-REVISION-INDEPENDIENTE-Y-DECISIONES.md`, úsalo como evidencia de partida. Este prompt incluye los hallazgos necesarios y las decisiones para trabajar aunque el informe no esté adjunto. Los archivos históricos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen el funcional vigente.

Busca una vez la evidencia de MOTOR-17 en `out/motor17/` o en sus paquetes disponibles. Si no está, declara su ausencia y reproduce solamente los casos mínimos necesarios. No dediques la sesión a buscar archivos efímeros que no existen en ese entorno.

Conserva commit, estado inicial de Git, versiones de aplicación/motor/acta/registro/export, perfiles efectivos, entorno y evidencia disponible. No hace falta ejecutar toda la suite antes de comenzar si la base ya está acreditada.

<a id="m17b-03"></a>

## 3. Hallazgos que hay que cerrar

La revisión independiente leyó los paquetes completos recibidos de MOTOR-17 y contrastó los 448 esenciales principales y sus 10.752 líneas individuales. Estos hallazgos están localizados; comprueba su presencia en tu base actual antes de cambiarlos.

| ID | Hallazgo | Cierre exigido |
|---|---|---|
| B17-01 | `compactShots` guarda `intent.defensa` en `defense_org`; `compactTactics` repite ese objeto en `org`. Es información de intervención, no el código de organización efectiva. | Organización correcta en la frontera del hecho, con versión de conservación y semántica explícitas. |
| B17-02 | De 2.304 contrastes, 1.740 solo terminan en la receta intermedia. Las siete capacidades destacadas tienen salidas adicionales, pero muchas otras todavía no. | Contrastes representativos de las 32 capacidades hasta su salida pertinente, sin segundo simulador. |
| B17-03 | AUD05 fija siempre `exposicion: insuficiente` y una dependencia de capacidades ausentes, incluso con las 32 observadas. | Estado y motivos derivados de la evidencia, sin aprobación automática. |
| B17-04 | `liveStealCredit` requiere interceptor y recuperador; quedan cinco pérdidas vivas con recuperador identificado y sin crédito. La rama de robo directo conserva otra escritura de procedencia. | Un criterio compartido de atribución y procedencia, sin alterar recuperación, posesión, azar ni decisiones. |
| B17-05 | El rápido conserva resúmenes antiguos, un log documental fallido y un recorrido sin recibo de descarga, aunque el mensaje final declara verificaciones posteriores. | Evidencia final coherente, comprobación documental de copia limpia y descarga real acreditada. |

Antecedentes deportivos, **no dianas de calibración**: en A natural de MOTOR-17 con C17-02 se observaron 82,66 puntos, 7,15 robos y 10,79 pérdidas por equipo; eFG 60,16 %. Las rotaciones mejoraron. La calibración general sigue abierta.

El objetivo de cien partidos en cinco segundos no se alcanzó: las últimas medidas fueron aproximadamente 30,2 s para cien y 60,8 s para doscientos, con cuatro workers. No lo declares resuelto en MOTOR-17B ni conviertas esta entrega en otra campaña de optimización.

<a id="m17b-04"></a>

## 4. Organización defensiva en el registro esencial

### 4.1 Fuente correcta

En el código revisado, la lectura detallada obtiene la organización con `orgAt`, combinando plan inicial, órdenes aplicadas y hechos de organización efectiva. Reutiliza y, si hace falta, corrige esa lectura compartida. Evita dos interpretaciones independientes que puedan discrepar.

La organización de cada hecho debe proceder de lo vigente **antes de ese hecho según su secuencia**, no del plan final ni de una intención genérica. Dos acontecimientos con el mismo reloj pueden estar separados por una orden aplicada; el orden causal importa.

Conserva, con nombres acordes al contrato existente:

- Organización pretendida, efectiva y condición de alternativa cuando la información lo permita.
- Código de organización en el campo de organización efectiva.
- Decisiones de intervención —contener, negar, ayudar, intentar robo— en un campo separado, si ya se conservaban y son útiles.
- Estado y motivo de información no reconstruible; nunca una organización inventada.

Esto cubre tiros de libro, continuaciones, decisiones directas y juego espontáneo. La ausencia de ficha no implica ausencia de defensa.

### 4.2 Casos que tienen que distinguirse

| Situación | Resultado del registro |
|---|---|
| Individual o zona sin cambios | Código efectivo correcto. |
| Cambio de organización aplicado | Hechos anteriores con la anterior y posteriores con la nueva. |
| Orden pendiente o rechazada | No altera la organización efectiva antes de aplicarse. |
| Box and one y alternativa por ausencia del objetivo | Conserva lo realmente ejecutado y su condición de alternativa. |
| Decisión directa sin jugada del libro | Conserva igualmente la organización efectiva. |
| Varias organizaciones dentro de una posesión | Separa por hecho/intervalo o declara una posesión mixta con sus organizaciones; no atribuye todo al último valor. |

Corrige también los consumidores del campo esencial y sus etiquetas. Los datos diagnósticos privados siguen sujetos a sus audiencias; esta reparación no habilita probabilidades ni planes privados en exportaciones públicas.

### 4.3 Compatibilidad

Identifica la nueva conservación —por ejemplo `ESE-MOTOR17B-R1`, siguiendo el convenio real— y documenta el tipo/semántica de los campos afectados.

Un archivo antiguo con `defense_org` como objeto no equivale al nuevo campo. Se puede leer como histórico con su cobertura declarada. Solo se reconstruye la organización si las entradas y hechos conservados lo permiten. No sobrescribas originales ni presentes una conversión como observación original.

El arreglo es de registro y lectura: no cambia qué defensa ejecuta el motor.

<a id="m17b-05"></a>

## 5. Sensibilidad de las 32 capacidades

### 5.1 Alcance representativo, no otro motor dentro del auditor

Completa un mapa de las 32 capacidades con al menos un consumidor real representativo por capacidad y su salida pertinente. No hace falta contrastar todas las combinaciones de tareas, estados y participantes.

La cadena debe poder seguirse:

**capacidad y actor → tarea/contexto → capacidad efectiva → operación real → salida que consume el motor.**

Una receta intermedia puede mostrarse, pero no sustituye la salida de la operación que la utiliza. Para TEC01, por ejemplo, el contraste representativo de conversión debe llegar a la probabilidad de tiro correspondiente. No etiquetes un cambio de 0,9 puntos de receta como 0,9 puntos porcentuales o como puntos anotados.

| Familia de consumo | Salida pertinente, según la operación real |
|---|---|
| Conversión, control, intervención, acceso o llegada | Probabilidad final pertinente o resultado determinista si es lo que realmente consume esa operación. |
| Elección entre opciones | Pesos/probabilidades normalizados o puntuación final realmente utilizada por el selector. |
| Comparación determinista de candidatos | Puntuación consumida y su unidad; no inventar una probabilidad. |
| Rebote | Peso de captura o probabilidad de cierre/captura pertinente, diferenciados de la receta de fuerza intermedia. |
| Resistencia | Gasto energético del intervalo, con su límite real. |
| Consistencia | Amplitud de la variación con la innovación fijada; no exigir más aciertos por realización. |
| Presión | Penalización o efecto final pertinente en el contexto, con la unidad correcta. |

Reutiliza las funciones de producción. Si una operación está embebida, puedes extraer su cálculo puro y hacer que productor y auditor llamen a esa misma función. Mantén aritmética, orden, límites y resultado deportivo. No implementes fórmulas parecidas únicamente para el auditor.

### 5.2 Qué permanece fijo

Para +1/+3/+5 conserva contexto, participantes, energía, Forma, momentos, oposición, opciones competidoras, parámetros e innovaciones ya sorteadas. Recalcula las dependencias necesarias de esa capacidad dentro de la operación; no vuelvas a simular una posesión ni sortees otra alternativa.

El incremento corresponde a una capacidad de un jugador. Si aparece varias veces en la operación seleccionada, aplica el mismo cambio a sus apariciones pertinentes, sin incrementar jugadores distintos ni otras capacidades.

Conserva topes e inputs suficientes desde el punto existente de consumo. Los campos extra de diagnóstico no deben alterar la trayectoria ni introducir cálculos con efectos secundarios. Evita duplicar el perfil completo por cada término.

### 5.3 Exactitud y límites

Cada contraste debe identificar:

- Contexto global, actor, capacidad, tarea/consumidor y operación.
- Base original/modificada, incremento solicitado y efectivo.
- Estado y parámetros necesarios, topes, límites y saturación.
- Entrada intermedia antes/después, si se muestra.
- **Salida pertinente antes/después, delta y unidad.**
- Si es una distribución, sus opciones y probabilidades; no solo el nombre de la opción más probable.
- Método, función productora y referencia al registro que permite reproducirlo.
- Exactitud, precisión/tolerancia y cobertura: observado, reconstruido, aproximado o no registrado.

La salida base reconstruida debe contrastarse con la salida conservada del productor dentro de una precisión declarada y justificada por redondeos. No aumentes una tolerancia para ocultar discrepancias deportivas. Una reconstrucción con información insuficiente no puede llamarse exacta.

Con capacidad 30 e incremento efectivo cero, el cambio debe ser cero dentro de esa precisión. Usa los límites naturales observados cuando existan. Un caso de frontera construido para verificar saturación debe estar etiquetado como tal, no añadido a la muestra natural.

No exijas signo positivo universal: un menor gasto es favorable; una selección redistribuye probabilidades; Consistencia cambia amplitud. El contraste de contexto fijo no demuestra la mejora de un marcador concreto.

### 5.4 Volumen y cobertura

Para la auditoría de cierre selecciona hasta **ocho contextos reales distintos por capacidad**, con los tres incrementos: máximo 768 filas principales de contraste. Prioriza variedad pertinente y conserva un criterio estable de selección. No rellenes con duplicados para alcanzar ocho.

La matriz debe distinguir lectura para seleccionar candidatos, ejecución, estados y costes. «Declarado en el perfil», «consumido en un cálculo» y «acción ejecutada» no son equivalentes.

Si la evidencia no expone un consumidor necesario, utiliza primero un contexto de diagnóstico histórico compatible. Si hace falta un caso nuevo, créalo de forma dirigida y cuéntalo aparte. No amplíes toda la campaña buscando por azar una acción rara.

El objetivo es que las 32 tengan un contraste representativo trazable hasta su salida pertinente. Si alguna queda sin él, indica exactamente qué entrada o consumidor falta y conserva el cierre como parcial para ese punto.

<a id="m17b-06"></a>

## 6. AUD05 y coherencia del auditor

Corrige los estados y dependencias de AUD05 para que procedan de la evidencia real.

- Con las 32 capacidades observadas en cálculos, no debe declarar que faltan capacidades sin exposición.
- Si falta una, debe nombrarla y separar falta de exposición de falta de registro.
- Si hay observación pero el contraste termina antes de la salida pertinente, debe declararlo como cobertura de contraste pendiente.
- Si el alcance representativo implementado está comprobado, puede resultar conforme **a ese control**, indicando su alcance; no acredita todo el comportamiento de las 32 capacidades en cualquier partido.
- Un dato ausente no es cero ni una prueba de atributo muerto.

Usa una única ejecución como origen de `resumen.json`, CSV, informe, interfaz y cobertura del paquete. Incluye métricas explícitas: capacidades declaradas, observadas, con salida pertinente contrastada, aproximadas y pendientes.

Mantén las otras auditorías en su estado justificado. No conviertas las quince inconclusas de MOTOR-17 en conformes mediante cambios de umbral, etiquetas o exclusiones. Una ESP no expuesta no necesita una cuota artificial de aparición.

Las identidades de evidencia deben incluir estudio/versión de código, lote e intento. Los IDs locales de partido o decisión no bastan, tampoco cuando se reutilizan los mismos lotes para CONTROL17 y M17B.

<a id="m17b-07"></a>

## 7. Crédito de robo y procedencia

### 7.1 Criterio funcional de esta corrección

Fuente: **FIBA Statisticians’ Manual 2024, versión 1.0, capítulo 7, página 24 del PDF**:

https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf

ChatGPT consultó directamente esa fuente para este encargo. La síntesis pertinente es: la recogida tras un error ofensivo puede recibir robo sin intento previo de arrebato; entre varios defensores, se acredita al primer desviador que inició la pérdida. El balón fuera no concede robo. Existe una excepción de balón retenido con posesión alterna favorable al defensor, si el motor ya produce ese caso.

Para las rutas existentes aplica este criterio compartido:

| Hecho conservado | Crédito |
|---|---|
| Pérdida viva con primer toque/intervención causal identificada y recuperación defensiva | Al defensor que inicia el desvío. |
| Error atacante con recogida viva y control individual identificado, sin desviador anterior | Al recuperador, aunque no haya interceptor previo ni intento de robo. |
| Recuperación sin autor/control individual suficiente | No fabricar crédito; declarar la limitación. |
| Pérdida fuera, violación o falta ofensiva | Sin robo por esa pérdida, salvo una excepción estadística explícita ya representada. |

Un intento voluntario, por sí solo, no prueba un toque causal. Usa el significado real de los campos existentes y no añadas un sorteo de contacto. El recuperador debe ser un jugador que ya produce el desenlace, no uno nuevo elegido para completar el acta.

Cada crédito debe tener la pérdida rival correspondiente, autor válido, equipo y procedencia legibles. Máximo un crédito de robo por esa pérdida causal. Conserva la distinción entre desviador y recuperador cuando sean distintos.

Aplica el mismo criterio y procedencia a la rama de robo directo, pérdida viva organizada, avance presionado, saque forzado y balón suelto, en los términos que esas rutas realmente representen. Una función compartida puede resolver la atribución; los consumidores no deben cambiar la posesión ni la selección de participantes para satisfacerla.

### 7.2 Casos históricos localizados

En los doce diagnósticos R17 quedaron cinco pérdidas vivas sin crédito por ausencia de interceptor:

| Lote | Partido | Hecho | Recuperador registrado |
|---|---|---|---|
| B · EXP13-04 r01 | M000002 | E0267 | EQ01-J10 |
| B · EXP13-04 r01 | M000002 | E0550 | EQ02-J09 |
| B · EXP13-07 r01 | M000002 | E0189 | EQ03-J10 |
| C · ORG02–COB01 | M000001 | E0256 | EQ01-J07 |
| D · F2 LAB11-03 r01 | M000001 | E0379 | EQ01-J06 |

Si tienes los archivos, lee esos hechos y sus antecedentes. Su tratamiento debe justificarse por el control conservado. Si no están disponibles, prueba el criterio con contextos dirigidos del productor y declara que no inspeccionaste esos cinco originales.

**No cambies** `stealAttemptGivenAccessP0`, `stealGivenTurnover`, presión, ejecución, recuperación, transiciones o episodios de estado. Esta corrección es estadística. Si se demuestra que una IA consume el crédito y eso cambia decisiones, aísla ese efecto y decláralo antes de dar por lograda la neutralidad; no lo ocultes en una proyección.

No es una auditoría completa del reglamento FIBA 2026. No amplíes otras familias normativas en esta entrega. Si no puedes descargar el manual, usa la síntesis verificada de este encargo y registra esa procedencia, sin afirmar una lectura directa tuya.

<a id="m17b-08"></a>

## 8. Perfiles, candidata y compatibilidad

### 8.1 Dos referencias explícitas

| Clave | Contenido | Uso en este encargo |
|---|---|---|
| P0 | Perfil base MOTOR-17, gasto por minuto vivo 2. | Referencia histórica y compatibilidad. |
| P1 | Mismo contenido deportivo con C17-02: gasto 3,5. | Referencia provisional para la mayor parte de la auditoría. |

Conserva C17-01 como alternativa histórica; no prepara otra ronda de candidatas. No ajustes el 3,5 ni cambies recuperación, curvas, umbrales o utilidad de los relevos.

C17-02 se utiliza como referencia provisional de esta entrega. Esto no declara calibración externa ni aceptación manual definitiva. Los perfiles activos y guardados de Dennis no se migran ni activan en silencio.

En el Panel debe resultar claro cómo crear/activar de forma explícita una copia con C17-02 y qué única fila deportiva cambia. Si esa función ya existe, verifícala; no añadas otra ruta o política de activación.

### 8.2 Versiones y contratos

Identifica aplicación MOTOR-17B, motor, política estadística y conservación nueva según los convenios del repositorio. La cabecera y la consola deben mostrar la entrega actual; perfil/dataset/export siguen siendo identidades distintas.

No cambies un esquema de exportación por rutina si la modificación es aditiva y compatible. Si cambia un contrato, documenta sus consumidores, compatibilidad y motivo. Una reproducción o un guardado incompatible debe rechazarse con explicación y conservar el original.

No cambies coeficientes deportivos para resolver problemas de formatos, perfiles antiguos o comparadores. Distingue los datos normativos/de crédito de los parámetros calibrables.

<a id="m17b-09"></a>

## 9. Propiedades deportivas que conservar

Para una entrada y contenido deportivo idénticos entre CONTROL17 y M17B deben conservarse:

- Marcador, parciales, posesiones, acontecimientos deportivos y su orden.
- Relojes y tiempo consumido, participantes y recuperador real.
- Intentos e innovaciones aleatorias, su secuencia y contador.
- Tiros, pérdidas, faltas, rebotes y atribuciones no afectadas por el crédito corregido.
- Quintetos, minutos, sustituciones, energía, Forma y momentos.
- Decisiones del entrenador, órdenes, episodios y memoria deportiva.

Se permiten las diferencias justificadas de créditos de robo y sus derivados —por ejemplo valoración—, procedencia, organización leída correctamente, instrumentación, política e identidades de versión.

La comparación debe enumerar el cambio permitido y conservar el resto. No elimines todo `stats`, todas las decisiones, el reloj ni bloques completos de hechos para obtener igualdad. Si una huella incluye identidad de perfil o acta, explica su diferencia; no uses esa huella como prueba contradictoria de igualdad o desigualdad de toda la trayectoria.

Dentro de M17B, comparar diagnóstico y esencial debe conservar el mismo deporte, incluidos los créditos ya corregidos. Compara huellas únicamente cuando correspondan al mismo contrato; conserva por separado las familias de huellas.

La referencia histórica conocida con P0 era 83–98 y 6.684 sorteos en MOTOR-17. Compruébala en la base real y registra cualquier diferencia antes de atribuirla a MOTOR-17B. No la conviertas en un marcador objetivo. P1 tiene otro recorrido deportivo por su energía y no debe compararse como si solo cambiara la etiqueta del perfil.

<a id="m17b-10"></a>

## 10. Campaña final: 30 casos y 12 diagnósticos

### 10.1 Congelación y cantidad

Termina implementación y comprobaciones dirigidas antes de congelar esta campaña. Conserva un plan legible y legible por máquina con entradas, perfiles, órdenes, semillas, versiones y commit.

| Bloque | Casos lógicos | CONTROL17 esencial | M17B esencial | M17B diagnóstico |
|---|---:|---:|---:|---:|
| A · Doce enfrentamientos, ida/vuelta | 24 | 24 | 24 | 6 |
| B · Casos de cierre | 6 | 6 | 6 | 6 |
| **Total** | **30** | **30** | **30** | **12** |

**72 ejecuciones de partido planificadas.** Las doce diagnósticas repiten esenciales y no amplían la muestra deportiva. Los cálculos +1/+3/+5 no son partidos nuevos. Suite, reproducciones dirigidas y fallos reales se contabilizan aparte, sin ocultarlos ni presentarlos como nuevas observaciones naturales.

Es una campaña de verificación y extracción para revisión, no una estimación de medias de liga ni validación externa. No ajuste posterior de parámetros, selección de semillas favorables ni eliminación de casos válidos por sus marcadores.

### 10.2 Bloque A

Utiliza planes y equipos naturales conservados. Los doce pares son:

| p | Pareja |
|---:|---|
| 1 | EQ01–EQ02 |
| 2 | EQ02–EQ03 |
| 3 | EQ03–EQ04 |
| 4 | EQ04–EQ05 |
| 5 | EQ05–EQ06 |
| 6 | EQ06–EQ07 |
| 7 | EQ07–EQ08 |
| 8 | EQ08–EQ09 |
| 9 | EQ09–EQ10 |
| 10 | EQ10–EQ11 |
| 11 | EQ11–EQ12 |
| 12 | EQ12–EQ01 |

Cada pareja juega ambos órdenes de local/visitante con P1. No inventes ventaja de localía si el motor no la implementa.

Semilla deportiva por pareja: `371000000 + 1000*p + 1`. Se comparte por ambos órdenes y ambas versiones. Conserva las entradas completas, no solo sus referencias de biblioteca.

Los seis diagnósticos son el primer orden de p = **1, 2, 5, 7, 9 y 11**, elegidos antes de ver resultados.

### 10.3 Bloque B

| Caso | Perfil | Entrada / finalidad |
|---|---|---|
| B01 | P0 | Referencia histórica EQ01–EQ02 con sus planes históricos y semilla 20261016. |
| B02 | P0 | Dos copias de EQ01 con identificadores de instancia distintos, para pertenencia y contratos. |
| B03 | P1 | EQ01–EQ02, organización individual que cambia por una orden reproducible a una zona en una frontera existente. Verificar antes/después y el estado pendiente. |
| B04 | P1 | EQ01–EQ11, box and one con el objetivo y el jugador objetivo alternativo (`target` / `targetAlt`) no disponibles desde la entrada, de modo que se observe la organización alternativa reglada (`fallbackOrg`). Mantener suficientes jugadores elegibles. |
| B05 | P1 | Caso de energía inicial baja basado en LAB11-02, con energía 8 mediante los mecanismos de escenario existentes. |
| B06 | P1 | Referente con energía 30 basado en LAB11-03 y su contexto conservado. |

Salvo B01, semilla `372000000 + número de caso`. Usa las mismas entradas y órdenes en CONTROL17 y M17B. Los seis se repiten con diagnóstico en M17B.

Completa en el plan congelado los IDs reales de actores, organización de destino, frontera de orden y modificaciones exactas de los escenarios. Son elecciones técnicas de comprobación sobre mecanismos existentes, no reglas nuevas. Si una referencia LAB cambió de nombre, localiza su contenido equivalente y documenta la correspondencia; no sustituyas el escenario por otro elegido después de ver el marcador.

### 10.4 Fallos y exposición

Un fallo conserva entrada, semilla, intento, último hecho y error. Un reintento no borra el anterior ni convierte un fallo técnico en derrota.

Si un fallo exige corregir código, conserva el primer resultado, identifica la corrección y repite solamente la evidencia invalidada, explicando qué resultados pertenecen al código final. No mezcles dos commits bajo una versión sin distinguirlos.

Si una ruta necesaria no se expone, utiliza una comprobación dirigida de contexto o productor existente. Todo encuentro adicional debe tener causa, semilla y contador aparte. No repitas por rutina la campaña para conseguir que todas las ESP aparezcan o todos los controles se pongan verdes.

### 10.5 Rendimiento de esta entrega

Conserva tiempos, concurrencia, entorno, bytes y memoria que ya produzca el ejecutor. Separa pared total, fases acumuladas por trabajo y pausas técnicas. No sumes dos veces el observador incluido en simulación.

Esta campaña no sustituye al benchmark frío de cien/doscientos. No extrapoles sus tiempos como mediciones de esos tamaños. El objetivo heredado de cinco segundos sigue abierto para el siguiente trabajo de rendimiento y resolución del mundo.

<a id="m17b-11"></a>

## 11. Datos que devolver para el análisis

Reutiliza lotes, exportadores y AUD01–32. Añade solo el aplanado y campos necesarios. Audiencias diagnósticas y datos de laboratorio identificados.

### 11.1 Resumen verificable y tablas

El rápido debe incluir:

| Contenido | Grano / significado |
|---|---|
| Lectura inicial y estado final | Alcance, qué está corregido, parcial, no observado y pendiente. |
| Identidades | Commits completos de CONTROL17 y M17B, versión de código de cada etapa, motor, perfil efectivo, candidata, políticas y entorno. |
| Plan y mapa de casos | Una definición por caso; entradas, perfil, semilla, orden, lote, intento y vínculo de diagnóstico con su esencial. |
| Ejecuciones | Solicitadas, terminadas, válidas, fallidas, interrumpidas, no ejecutadas, reintentos y exclusiones. |
| Equipos | Acta y conteos por equipo/ejecución, posesiones, tiempos, particiones y conciliación. |
| Jugadores | Pertenencia explícita, minutos, acta, DNP/tramos y energía final. |
| Comparación causal CONTROL17–M17B | Igualdades deportivas y diferencias autorizadas, con IDs y ejemplos concretos de cualquier desviación. |
| Organización efectiva | Hecho, secuencia, equipo defensor, organización pretendida/efectiva/alternativa, origen de lectura y cobertura. |
| Embudo de robos | Pérdida, balón vivo/muerto, intento, toque causal, recuperador/control, autor acreditado, fuente y motivo de ausencia. |
| Cadenas de saque | Estado, receptor y causa terminal; interrumpida no equivale a abierta defectuosa. |
| Matriz de 32 capacidades | Declaración, consumo observado, finalidad, exposición, contexto y salida contrastada o pendiente. |
| Sensibilidad | +1/+3/+5, saturación, operación real, entradas, salidas, unidades, tolerancias y diferencias. |
| AUD01–32 | Ejecuciones, hallazgos, cobertura y resumen desde una misma ejecución. |
| Coste y comprobaciones | Trabajo realmente ejecutado, tiempos registrados y limitaciones. |

No hacen falta intervalos estadísticos ni un ensayo deportivo redactado por Claude para esta muestra pequeña. Devuelve conteos, cocientes con denominador y diferencias descriptivas, conservando A y B separados.

### 11.2 Reproducibilidad

En el detalle conserva los esenciales de las sesenta ejecuciones comparativas, los doce diagnósticos, entradas completas, perfiles, órdenes y los contextos de contraste. Las distribuciones extensas pueden ir en JSONL enlazado desde el CSV.

Usa claves globales de versión/estudio/lote/intento y contexto. Conserva el vínculo a su caso lógico para emparejar versiones. Nulo debe ser nulo, con motivo; no rellenar con cero.

Incluye la evidencia de errores y repeticiones reales y el código pertinente de M17B con diff frente a CONTROL17. Si el código CONTROL17 no está incluido, identifica el commit reproducible. No empaquetes otros repositorios, `.env`, secretos, `.git`, dependencias ni copias completas de MOTOR-16/17.

<a id="m17b-12"></a>

## 12. Pruebas y recorrido de interfaz

### 12.1 Automáticas proporcionadas

Reutiliza las pruebas existentes. Añade las regresiones imprescindibles, preferiblemente agrupadas en hasta seis bloques funcionales sobre comportamientos afectados:

1. Organización efectiva, secuencia de activación, alternativa y semántica de versiones antiguas.
2. AUD05 con exposición completa/incompleta y contraste pendiente, y coherencia de sus salidas.
3. Recogida sin interceptor, primer desviador distinto del recuperador, balón muerto y procedencia común de créditos.
4. Salidas reales de sensibilidad, saturación y precisión; productor y auditor comparten operación.
5. Neutralidad deportiva y pertenencia de instancias.
6. Contrato de cierre, paquetes y ausencia de enlaces o evidencias finales ficticias, si lo afectado lo requiere.

Son grupos, no obligación de fabricar seis pruebas ni de ignorar una regresión necesaria. Evita tests que solo repitan el código o verifiquen textos sin comportamiento. Los casos de cálculo fijo no deben lanzar partidos enteros innecesarios.

Ejecuta la suite completa una vez sobre el código final y los verificadores de datos/documentación requeridos. Si después cambias código o contenido que afecta esas comprobaciones, vuelve a ejecutar lo afectado; no atribuyas a la revisión final una prueba realizada sobre otra versión.

### 12.2 Navegador

Haz un único recorrido automatizado representativo en Chromium si está disponible:

- Arranque: consola y cabecera MOTOR-17B, identidades de perfil separadas.
- Panel con un perfil anterior, tarjeta de compatibilidad y creación explícita de copia C17-02 sin activación silenciosa.
- Un partido finalizado, análisis de defensa y separación de audiencias.
- Matriz/sensibilidad con salida y unidad, AUD05 y sus motivos reales.
- Vista Cierre con versiones, ejes y enlaces reales.
- Descargas reales según la sección 13.

Puedes reutilizar encuentros de la campaña para alimentar vistas; evita simular otros solo para navegar. Si la interfaz exige otro encuentro, decláralo en el contador de comprobación.

No hay obligación de otros navegadores, Node 24 o pruebas visuales extensivas en esta entrega. Si no están disponibles, di «no ejecutado».

Crea `docs/prompts/MOTOR-17B-recorrido-manual.md`, corto y específico: pasos, perfil, semilla o caso, resultado observable y señal de fallo. **El recorrido manual de Dennis queda pendiente**, también si Chromium automatizado pasa.

<a id="m17b-13"></a>

## 13. ZIP, comprobador y descargas

### 13.1 Archivos de entrega

En `out/motor17b/entrega-final/`, o ruta equivalente declarada:

1. **`MOTOR-17B-revision-rapida.zip`**: primer archivo para ChatGPT, objetivo hasta 5 MiB. Incluye resúmenes, CSV/JSON compactos, cobertura, lectura y logs pertinentes. No metas los esenciales brutos de benchmarks o partidos completos aquí.
2. **`MOTOR-17B-indice-partes.json`**: tamaños reales y SHA-256 del rápido y del detalle, versiones y contenido de cada parte.
3. **`MOTOR-17B-evidencia-detallada.zip`**, si cabe en 64 MiB; si no, partes numeradas de hasta 64 MiB con sus referencias en el índice. Evita duplicaciones entre partes.
4. **`MOTOR-17B-verificacion-final.json`**: recibo pequeño externo de comprobación y descarga de los archivos finales.

Si el rápido supera el objetivo, informa del tamaño y causa; no pierdas evidencia para falsear el tamaño. La partición puede ser distinta a la de MOTOR-17 siempre que el índice permita localizar cada caso y fichero.

### 13.2 Evitar el problema de evidencia antigua y dependencias circulares

El registro de navegación puede ir dentro del rápido. Después de generar los archivos finales, verifica y descarga realmente esos archivos; escribe el recibo final **fuera de los ZIP**, con nombre, tamaño, SHA-256 y resultado de descarga/comprobación.

El índice referencia rápido y detalle; el recibo referencia los archivos finales y el índice. El recibo no se incluye ni se autorreferencia dentro de esos mismos archivos. Así no hay que regenerar un ZIP para incluir la prueba de descarga de sí mismo.

Descarga el rápido, el índice y cada parte del detalle desde los enlaces de la aplicación. Compara los bytes descargados con los originales. Una prueba con cero archivos candidatos no puede marcar «descargas comprobadas» como verdadera; debe indicar que no se ejecutó.

Si no puedes hacer la descarga real, entrega los archivos y marca esa verificación pendiente con motivo. No afirmes un enlace público ni una publicación que no has hecho. Proporciona los adjuntos disponibles en tu entorno y explica dónde están conservados.

### 13.3 Comprobador reutilizable

Añade o reutiliza un comprobador reproducible —por ejemplo `scripts/m17b-verify-delivery.py`— que verifique:

- Integridad, tamaños, SHA-256 e índices, sin re-simular.
- Recuentos reales, claves únicas, enlaces entre registros y agenda.
- Pertenencia de jugadores, conciliaciones y comparación de versiones.
- Semántica/tipo de los nuevos campos de organización, no solo que el JSON abra.
- Alcance de sensibilidad, salidas/unidades presentes y comparación base con el productor según tolerancia.
- Coherencia AUD05/resumen/informe y distinción de exposición/contraste.
- Existencia y resultado real de las evidencias finales requeridas, distinguiendo una ausencia de un resultado correcto.

Un comprobador mecánico no otorga aceptación deportiva. Su salida debe declarar el alcance y las verificaciones no realizadas. Los comprobadores nativos de paquetes siguen utilizándose donde soportan el formato; no llames `batch:check` a una verificación estándar de un formato que no admite.

No repitas partidos para construir o verificar ZIP. Los archivos grandes siguen fuera de Git; scripts, planes pequeños, documentación y evidencia compacta se versionan según las normas del repo.

<a id="m17b-14"></a>

## 14. Documentación y requisitos posteriores

Archiva íntegro este prompt en `docs/prompts/MOTOR-17B-cierre-y-auditoria-acotada.md` o ruta equivalente del catálogo. Actualiza catálogo, estado, changelog, documentación técnica `motor17b.md` y páginas temáticas afectadas, manteniendo los índices y enlaces.

Documenta cada B17-01…05 con causa, cambio, consumidor, prueba/evidencia y estado final. Si algo amplía o corrige documentación anterior, indica su precedencia. Conserva la distinción entre confirmado, supuesto, no observado y pendiente.

La comprobación documental final debe pasar en una copia limpia del contenido versionado. No excluyas documentación nueva o enlaces reales para obtener verde. Las copias de soporte ignoradas de `out/` no deben confundirse con documentación vigente.

### 14.1 Estado de cierre por ejes

| Eje | Qué puede acreditar MOTOR-17B |
|---|---|
| Correcciones de esta entrega | Cerradas si se implementan y verifican B17-01…05. |
| Estabilidad técnica | Evidencia acotada de casos, invariantes, equivalencia y suite final. |
| Calibración deportiva general | Pendiente; no se cierra con esta muestra ni por elegir C17-02. |
| Rendimiento masivo del manager | Pendiente; objetivo de cinco segundos no alcanzado previamente. |
| Aceptación manual | Pendiente de Dennis. |
| Conformidad FIBA integral | No certificada por esta entrega. |

### 14.2 Contexto funcional que debe quedar registrado para el siguiente trabajo

Incorpora una nota de requisitos posteriores, **sin implementar el motor rápido ni el manager**:

- La base del motor completo se conserva para el partido del usuario y los elegidos previamente para visionar.
- Se estudiará una resolución del mundo más rápida, permitiendo cálculos diferentes con comportamiento estadístico y táctico comparable. No se exige el mismo marcador o trayectoria entre resolutores distintos.
- Los partidos a la misma hora deben poder seguirse simultáneamente con marcadores parciales y clasificación provisional en directo.
- El rápido debe poder producir progreso/cronología suficiente, además del acta, para alimentar esa experiencia. No se interpolarán marcadores ficticios a partir de un resultado final.
- El avance debe coordinarse sin filtrar información futura al jugador o a los entrenadores. Los partidos pueden estar en minutos distintos por pausas y prórrogas.
- Pausa y velocidad comunes para la sesión simultánea siguen siendo **propuesta pendiente de concretar**, no decisión cerrada ni tarea implementada aquí.
- La mejora visual del partido es otro trabajo posterior y no exige volver a movimientos por milisegundos.

Esta nota amplía el contexto posterior respecto al encargo de MOTOR-17, que todavía exigía equivalencia exacta del mismo resolutor para sus niveles de registro. En MOTOR-17B esa equivalencia entre registros del motor actual se mantiene.

<a id="m17b-15"></a>

## 15. Aceptación y mensaje de entrega

Antes de entregar, comprueba que la evidencia corresponde al código y perfiles declarados. Diferencia el commit de implementación auditada del commit posterior de documentación/embalaje; si cambia código después de auditar, identifica qué comprobación queda invalidada.

La aceptación técnica de MOTOR-17B exige:

- Organización efectiva correcta y contratos históricos explícitos.
- Las 32 capacidades con contraste representativo hasta salida pertinente, o un estado parcial que enumere las que faltan.
- AUD05 y sus motivos ajustados a la evidencia, coherentes entre archivos.
- Criterio de crédito y procedencia comunes sin alterar el recorrido deportivo.
- Campaña realizada, diferencias explicadas, archivos verificables y ausencia de verificaciones ficticias.

No declares terminado un punto solo porque la suite pasa. Si hay un bloqueo, entrega el resto con evidencia y el bloqueo localizado.

El mensaje final debe ser breve y derivado de los archivos:

1. Rama, PR y commits; si actualizaste la PR de MOTOR-17 o creaste otra. Sin fusionar.
2. Estado de B17-01…05 y cualquier diferencia deportiva observada.
3. Cuántas capacidades llegan a salida pertinente y cuántas siguen pendientes, con exactitud/precisión.
4. Ejecuciones reales: campaña prevista/terminada, diagnósticos, fallos, reintentos y extras. No confundir 30 casos con 72 observaciones independientes.
5. Suite final, datos, documentación, navegador y descargas: comprobado, fallido o no ejecutado.
6. Archivos adjuntos para ChatGPT, tamaños y comando exacto del comprobador.
7. Pasos manuales de Dennis y pendientes posteriores de calibración/rendimiento.

No redactes una valoración deportiva extensa ni una comparación nueva de ligas reales. No midas cuota con estimaciones. Entrega los datos para que ChatGPT haga esa revisión y Dennis decida la aceptación.
