# SIM-MOTOR-02 · correcciones, integración, simultaneidad e historia

Nota técnica de la segunda entrega del roadmap de cuatro de SIM-MOTOR (prompt: [`../prompts/SIM-MOTOR-02-correcciones-integracion-simultaneidad-historia.md`](../prompts/SIM-MOTOR-02-correcciones-integracion-simultaneidad-historia.md)). Continúa [`sim-motor01.md`](sim-motor01.md). **Estado: ejecutado, pendiente de Dennis.** Pendientes y límites: [`sim-motor02-pendientes.md`](sim-motor02-pendientes.md) · [recorrido manual](../prompts/SIM-MOTOR-02-recorrido-manual.md) · [evidencia](evidencia-sim-motor02/RESUMEN.md).

## Índice

1. [Identidades y versiones](#1-identidades-y-versiones) · 2. [Correcciones C02-01…05](#2-correcciones-c02-0105) · 3. [Roles, director y familiaridad](#3-roles-director-y-familiaridad) · 4. [Política del entrenador](#4-política-pequeña-del-entrenador) · 5. [Lectores y audiencias](#5-lectores-y-audiencias) · 6. [Jornada simultánea](#6-jornada-simultánea) · 7. [Guardado y lotes](#7-guardado-y-lotes-persistentes) · 8. [Historia de temporada](#8-historia-individual-de-temporada) · 9. [Aprendizaje posterior](#9-aprendizaje-posterior-al-partido) · 10. [Rendimiento](#10-rendimiento-y-cachés-exactas) · 11. [Límites](#11-límites)

## 1. Identidades y versiones

| Elemento | Valor |
|---|---|
| Aplicación | `SIM-MOTOR-02` · SIM `0.2.0-SIMMOTOR02` |
| Resultado / snapshot / jornada / esencial | `beM-sim-match/2` · `beM-sim-snapshot/1` · `beM-sim-matchday/1` · `beM-sim-essential/1` |
| Perfil | base `SEM-SIM01-20261022` + extensión `SEM-SIM02-20261022` (semillas de la política del entrenador y tablas de créditos por rol; **no es calibración**) |
| Conciliación | `RECON-SIM02-R1`: 23 comprobaciones (R01–R23) |
| Detallado | **sin cambio** (referencia 83–98 con 6.684 sorteos; ningún archivo deportivo detallado modificado, ver `13-DETALLADO-CONGELADO.json`) |

Las correcciones cambian salidas y trayectorias de SIM: **no se promete reproducir los resultados de 01**. Un histórico de 01 sigue siendo consultable con su cobertura declarada; no se reparan decisiones deportivas ni se rellenan datos que nunca se produjeron.

## 2. Correcciones C02-01…05

- **C02-01 · prefijo público monótono.** `buildSimResult` lee solo hechos e intervalos alcanzados: periodos, controles (cada tramo guarda el instante de sus controles: `seg.ct`/`seg.ck`), denominadores, familias, minutos, exposición y estado observable (alineación, faltas, bonus y energía **proyectada a la frontera**). `advance` publica de forma monótona: pedir un instante anterior devuelve un rechazo explícito; una vista histórica es otra operación (`buildSimResult({ at })`). Un final o una prórroga no se anuncian antes de publicarse. R01 se evalúa siempre (reconstrucción independiente por periodo); R20 comprueba que el sufijo generado no se publica.
- **C02-02 · libres y finalizaciones únicas.** Cada finalización (tiro, falta de tiro y serie ligada) lleva una identidad compacta `fin`; la canasta con falta es **una** finalización; los libres de bonus usan la categoría `bonus_sin_familia`. Las familias suman los puntos del acta (campo + libres) y conciliar (R19) recalcula tiros, libres, puntos y finalizaciones.
- **C02-03 · presión.** `energyLoad(S, M, ownPlan)`: la carga de ejecutar la presión pertenece al equipo que la ordena; el esfuerzo de atacarla solo viene de su mecanismo representado.
- **C02-04 · identidad y validación.** Representación canónica de la entrada consumida (jugadores, cuerpo, tendencias, roles, conocimiento, estados, planes, órdenes programadas, huellas de perfil y tablas); `root_input_fp` separado del registro de comandos y del contexto externo (`chain()`); huella de tablas sobre todos los catálogos consumidos; validación estricta (no finitos, rangos, referencias, órdenes validadas **antes** de mutar); entrada normalizada como copia profunda (congelación real).
- **C02-05 · continuidades y créditos.** Tapón fuera = reanudación compacta de la misma posesión (`_continue`); cadenas sin tope práctico (el guard de 64 es un fallo diagnosticado, nunca un abandono); receptor de la falta ofensiva (o sujeto colectivo declarado); contadores causales de faltas por hecho (`pfN`, `tfN`, `out` solo en la que alcanza el límite; R21).

## 3. Roles, director y familiaridad

- **Roles O01–O15 / D01–D12**: dejan de ser exclusivos del detallado. El factor heredado (`selection.rolePreference`, `defense.assignment.roleFitWeight/otherRoleFitWeight`) se aplica **una vez** en el reparto de participación (finalizador, pasador) o de créditos (tapón, robo, receptor de falta ofensiva) y en la asignación defensiva. La preferencia de celda usa el peso sin sesgo de rol (no se duplica la ventaja). Correspondencia de etiquetas editable en `roles.creditTags.*` (filas `SEM-SIM02`).
- **Director**: la lectura (`q`) sale del director efectivo del tramo; el rol de calidad «director» también.
- **Familiaridad pertinente**: módulos derivados de la ficha y la cobertura realmente aplicable; participantes funcionales (incluido el bloqueador), sin banquillo; transición y decisión espontánea con su contexto; un ajuste por cálculo. Con ignorancia simétrica el organizado y el espontáneo se compensan; la transición (sin organización defensiva estable) no, igual que en el detallado.

## 4. Política pequeña del entrenador

`src/sim/coachsim.js`. Rotación y faltas con los umbrales de ENTREF01–03 y el libro de faltas leído **como datos** (`foulRule`); respuesta a predominio exterior/interior (ventana de 2 tramos, ≥ 6 tiros, ≥ 60 %, ±1 nivel de `defStyles.protection`, `adjustmentHold`) y +1 de ritmo ante necesidad de resultado en la ventana de cierre. La vista del entrenador (`observationFor`) solo contiene hechos publicados, información pública del rival y contexto ya publicado. Una orden manual vigente no se sobrescribe; cada decisión registra razón, muestra, vista (huella) y cambio.

## 5. Lectores y audiencias

`src/sim/readers.js` (11 vistas) sobre hechos SIM; universos propios «controles SIM» y «finalizaciones SIM»; cuota de cierres y producción por 100 controles con presencia completa; ausencias tipadas (`no_representado`, `no_aplica`); resumen con umbrales editoriales identificados. Audiencias `public | own | diagnostic` construidas en `buildSimResult`; nada privado en lo público, tampoco al terminar.

## 6. Jornada simultánea

`src/matchday/`. Reloj común = **tiempo virtual deportivo** (tiempo local = tiempo disputado acumulado de periodos − desfase). Por barrera (120 s): publicar todos los encuentros → tablas → vistas congeladas → decidir/aplicar → generar el siguiente horizonte. El detallado se adapta por pasos atómicos (`DetailedFixture`): nunca se rebobina ni se interpola; se declara el instante de observación. Clasificación inicial (artificial), provisional (empate en curso = pendiente) y final (solo terminados válidos); convención de laboratorio, no el reglamento ACB/FIBA. Pool limitado (`MatchdayPool`, cuatro workers, fragmentos de encuentros, paquetes compactos).

## 7. Guardado y lotes persistentes

- `snapshotSim`/`restoreSim` (SHA-256; rechazo de guardados alterados, incompletos o de otra versión): continuación exacta desde una frontera y desde un prefijo con sufijo privado. `Matchday.snapshot/restore` y servidor local `/api/simsave`.
- `src/simbatch/`: agendas (repetir, cruces, pares, variantes), índice durable como fuente de verdad (archivo atómico → línea de índice con suma), recuperación, reintentos desde el inicio con intento nuevo, un único aceptado por encuentro lógico; CLI `scripts/sim-batch.js` y `/api/simbatch`. Probado con SIGKILL real.

## 8. Historia individual de temporada

`src/season/`. `SeasonLedger` acumula por jugador, temporada, competición y club (tramos), con sumas y consecuencias idempotentes por encuentro lógico (`ConsequenceLedger`); `SeasonWorld`: dos competiciones sénior de seis equipos y una Sub-20 de cuatro (copias identificadas con edades 16–18), calendario de ida y vuelta, movimiento administrativo (intercambio con planes válidos), profundidad Referencia/Simulada/Dirigible, cierre y apertura. El cierre no avanza edades (sin modelo decidido).

## 9. Aprendizaje posterior al partido

`src/sim/learning.js` adapta la exposición SIM a las funciones puras de `src/learning` (unidades: décimas de segundo de juego vivo; módulos en finalizaciones SIM ponderadas). La guarda por encuentro lógico (`ConsequenceLedger`) se añade a la fuente exacta del núcleo sin debilitarla. La UI conserva M1 ≠ M10, copia propia y re-validación de propiedad.

## 10. Rendimiento y cachés exactas

Medición con transporte de actas esenciales individuales (`scripts/sim02-bench.js`; máquina de 4 CPU lógicas, Node 22). Solo optimización exacta aplicada: serialización canónica sin objetos intermedios (misma salida). Resultados (ver `11-RENDIMIENTO.json`):

| Pasada | Cuatro workers, 1.000 partidos → esenciales en el coordinador | Hasta estadísticas disponibles para el mundo |
|---|---:|---:|
| P02-F (proceso nuevo) | **8,30 s** (objetivo de 5 s **no alcanzado**) | 9,23 s |
| P02-C1 / C2 / C3 (calientes) | 5,15 / 5,52 / 5,91 s (**no alcanzado** en las tres) | 5,67 / 6,01 / 6,39 s |

Esenciales individuales: 15,4 MiB (1,8 MiB comprimidos; ≈15,4 KB por partido); RSS máximo del proceso 851 MiB; igualdad F = C1 = C2 = C3 por caso y con la muestra de 64 con un worker. Jornada de 1.000 encuentros a igual hora virtual con política: 14,4 s de avance coordinado (28 barreras), 1.000/1.000 válidos, RSS 2,3 GiB (todos los encuentros vivos hasta terminar); no se reutiliza ningún resultado previo. La causa observada es el coste de generación por partido (≈16–20 ms caliente) más la construcción del esencial; no se rebajó la salida ni se tocaron reglas.

## 11. Límites

Calidad estadística no validada; objetivo de 5 s no acreditado; aproximaciones de 01 conservadas; sin ataques mixtos, alternativas de pase, ayudas, movimientos ni saques tácticos; el aprendizaje de lote agrupado no se confirma automáticamente (solo laboratorio de copias). No cierra «el motor completo» ni ejecuta SIM-MOTOR-03.
