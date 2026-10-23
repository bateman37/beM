# SIM-MOTOR-04 · correcciones verificables, convergencia estadística, rendimiento y auditoría final

Cuarta y última entrega del roadmap de SIM-MOTOR (incluye 01, 02, 02B y 03; misma PR de la serie). **Candidata numérica provisional, no aceptación deportiva.** El motor detallado no cambia (reglas 83–98, 6.684 sorteos de referencia; 0 archivos deportivos modificados frente a la base). Las evidencias grandes viven fuera de Git (`out/sim-motor04/entrega-final/`); aquí quedan las reglas, los planes y los resúmenes pequeños ([`evidencia-sim-motor04/`](evidencia-sim-motor04/)).

## Versiones y formatos

| Elemento | 03 | 04 |
|---|---|---|
| Aplicación | `SIM-MOTOR-03` | `SIM-MOTOR-04` (incluye `SIM-MOTOR-03`, `SIM-MOTOR-02B`) |
| SIM | `0.2.1-SIMMOTOR02B` | `0.3.0-SIMMOTOR04` |
| Perfil | `SEM-SIM01+SEM-SIM02` | `SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023` |
| Resultado / guardado / esencial | `beM-sim-match/2` · `beM-sim-snapshot/1` · `beM-sim-essential/1` | `beM-sim-match/3` · `beM-sim-snapshot/2` · `beM-sim-essential/2` |
| Cobertura / estadísticas / conciliación | `COV-SIM03…` | `COV-SIM04-R1` · `EST-SIM04-R1` · `RECON-SIM04-R1` (26 conciliaciones) |

## Correcciones C04-01…06

| Id | Defecto | Cambio | Efecto | Prueba |
|---|---|---|---|---|
| C04-01 | El rebote ofensivo colectivo no dependía de quién participa. | `collectiveRA`: pesos `[1; 0,5; 0,25; 0,125; 0,0625]` (`rebound.collective.weights`) y referencia de 2 participantes; el balance de rebote usa la suma ponderada. Etiqueta `SEM04-REB`. | **Deportivo** (cambia trayectorias) | S04-01 |
| C04-02 | Lectores de zona SIM contaban filas sin intento; el detallado excluía las canastas con falta. | Regla común `isFieldAttempt = !anulado && !(from_foul && !made)`; zonas SIM compactas `[a,m,q0,q1,q2]` con `decodeZone`. Reproduce el diagnóstico de 03: 82.030 filas SIM sin intento; detallado 8.194 → 8.609 intentos; 0 desajustes frente al acta en 3.408 líneas de equipo. | **Lectura** (no cambia trayectorias) | S04-02 |
| C04-03 | Sin bloqueador pertinente real. | `screenRoleOf(play)` (POS01–04, POS07–08); sorteo `scrSrc` (1 ejecutante, 2 obtenida, 0 sin candidato) y `elig`; participantes honestos en lectores. Conciliación R24. | **Deportivo** en créditos; lectura en participantes | S04-03 |
| C04-04 | Familiaridad de presión (`FAM:press_break/PRESS`) sin efecto. | `famPressDelta`: `wPress·exp(−delta)` sobre el peso extra de pérdida; exposición `pressExposure` desde `seg.press[k]`; R25. | **Deportivo** | S04-04 |
| C04-05 | Prioridades: 1 = máximo, 5 = mínimo sin cobertura de instrumento. | Sentido corregido y sondas S4 (prioridad 1/5), regla TEC09. | **Lectura/instrumento** | S04-05 |
| C04-06 | Denominadores de asistencia sin evidencia. | `assistDenominators` (finalizaciones elegibles, pases entregados, canastas y series de libres elegibles y acreditadas) en resultado y esencial; R26. | **Lectura** | S04-06 |

Defectos hallados en la jornada mixta (§11.3), después de congelar la reserva y neutros deportivamente: (1) las órdenes a un equipo sin autoridad no se rechazaban en el Matchday en proceso → ahora se pasa `controlledTeams` al shard (`sin_autoridad`); (2) el paquete de un encuentro terminado crecía por barrera pero se congelaba tras recargar → los terminados se publican siempre como paquete congelado. La equivalencia OPT (56) se repitió después de estos cambios.

## Perfil SEM-SIM04 (filas con procedencia y validación cruzada)

`rebound.collective.weights`, `rebound.collective.referenceParticipants` (2), `shotMix.threeWeightFactor` (1 = identidad; se aplica por contexto organizado/transición/espontáneo conservando masa), más las filas de candidatas. `validateSem04` exige pesos no crecientes y no negativos, referencia entera dentro del arreglo, factor > 0, coste > 0 y P0 en (0,1).

## Semillas

SHA-256 de `20261023|<espacio>|<clave>|<etiqueta>`, primeros 32 bits sin signo (0 → 1; sufijo ordinal ante colisión; ninguna colisión en el plan). Espacios `SIM04|CAL|VAL|STRESS|CONTRAST|TECH|BENCH`. La clave excluye identidad, resolutor, intento, worker, lote y ruta, de modo que todas las identidades juegan **las mismas** entradas y semillas.

## Selección mecánica `SEL-SIM04-R1` (congelada antes de CAL)

Búsqueda secuencial V → Z → A → E con ≤ 9 vectores sobre R1: `volume.neutralSecondsPerControl` {17,5; 18,5; 19,5} · `shotMix.threeWeightFactor` {0,85; 0,70} · `assist.eligibleFinalPassP0` {0,75; 0,90} · `energy.costPerLiveMinute` {3; 3,5}. Definiciones de `L_V`, `L_Z`, `L_A`, admisibilidad y empates en [`evidencia-sim-motor04/DICCIONARIO.md`](evidencia-sim-motor04/DICCIONARIO.md) y `plan/selection-rules.json`.

**Resultado en CAL (anclas, 16 partidos)**: V3 (19,5 s) reduce `L_V` 54 %; Z2 (0,70) 28,7 %; A2 (0,90) 35 %; E1 (coste 3) reduce la frecuencia de «algún jugador ≥ 40 min» (partidos sin prórroga) de 0,946 (ganador previo A2, coste 2) a 0,594; E2 (3,5) la llevaba a 0, pero la regla elige el menor gasto que cumple las tres condiciones (3). `C04-FINAL-PROVISIONAL` = `C04-E1`.

| | R0 | R1 | FINAL |
|---|---|---|---|
| CAL `L_V` / `L_Z` / `L_A` | 0,337 / 0,216 / 0,313 | 0,357 / 0,220 / 0,319 | 0,152 / 0,193 / 0,189 |
| VAL `L_V` / `L_Z` / `L_A` | 0,431 / 0,202 / 0,286 | 0,458 / 0,215 / 0,304 | 0,073 / 0,171 / 0,143 |
| VAL frecuencia ≥ 40 min | 0,925 | 0,900 | 0,627 |

VAL confirma CAL en los ocho estados descriptivos (todos «mejora» frente a R0 y R1; sin contradicciones CAL↔VAL). **Límite reconocido**: la candidata queda por debajo del detallado en puntos (VAL, todos los casos: media 74,7 SIM FINAL frente a 91,7/92,0 de R0/R1; anclas: 75,5 frente a 78,1 del detallado) porque el porcentaje de dos y los libres siguen bajos y no se permitió ajustarlos. No se fuerzan efectos sobre estrellas (STRESS: EQ06-J03 de 51,25 a 36,08 puntos de media; el detallado de 03 da 34,33).

## Rendimiento exacto (mismo resultado, menos coste)

Optimizaciones sin cambio deportivo: eventos sin `delete tAbs` (fuera del modo diccionario; −32 % de heap), caché de quintetos por (segmento, equipo), texto canónico único en `normalizeInput`, ruta `lean` del esencial, cierre diferido (`advanceAll({defer})` + `seal`) y generación joven del worker (`SIM_YOUNG_MB`, 48 MB). Equivalencia: 56/56 casos iguales en ocho secciones deportivas entre `O04-CONTROL` y `O04-FINAL`; TECH 16/16; huellas por caso 1.000/1.000 en todas las pasadas. **Objetivos no cumplidos**: lote de mil 7,35–12,0 s (control 8,2–12,2 s; objetivo 5 s), RSS 694 MiB (cumple 1.536 MiB), jornada de mil 17,4 s con máxima pausa pública 1,82 s (+2,84 s de cierre diferido) y RSS 2,19 GiB (control 5,07 s de pausa y 2,56 GiB; objetivos 1 s y 1,5 GiB sin cumplir). Medido en la misma sesión y máquina; véase `13-RENDIMIENTO.json`.

## Contrato SIM para el manager

1. **Preparar**: `Matchday` crea el encuentro con resolutor `sim` y perfil efectivo (`makeContext(profile, overrides)`); los overrides solo se activan por acción explícita (nunca la candidata por defecto).
2. **Avanzar**: `advance(T, {defer})`; los paquetes publicados son monótonos y de solo-prefijo; `seal` cierra los encuentros diferidos.
3. **Publicar / leer**: solo hechos hasta `T`; la audiencia pública no ve `delta` ni `explicit` de la presión ni el futuro.
4. **Ordenar**: `controlledTeams` decide la autoridad; sin autoridad → `sin_autoridad`.
5. **Guardar / recuperar**: `beM-sim-snapshot/2` (versión SIM y esquema de resultado comprobados); los terminados se recuperan como paquete congelado.
6. **Confirmar historia/aprendizaje**: una sola aplicación por encuentro lógico (ledgers con conciliación; el aprendizaje exige propuesta única por jugador/dominio y dosis acotada).

## Matriz de compatibilidad

| Objeto | 01/02 | 02B/03 | 04 |
|---|---|---|---|
| Perfil SIM | acepta (`SEM-SIM01`, `SEM-SIM02`) | acepta | acepta con las filas SIM04 en identidad (valores de 03 reproducen R1) |
| Resultado `beM-sim-match` | `/1`,`/2` | `/2` | `/3`; `/2` se lee como histórico, no se mezcla en conciliaciones |
| Guardado `beM-sim-snapshot` | `/1` | `/1` | **solo `/2`**; `/1` se rechaza con `SIM_SNAPSHOT_REJECTED` y explicación (no se convierte) |
| Esencial | `/1` | `/1` | `/2` (zonas compactas, `assistDenominators`, `pressOps`) |

## Reproducción

`scripts/sim04/` contiene la agenda, el ejecutor (`exec.mjs`, cualquier identidad frente a cualquier raíz de código), el selector (`select.js`), la congelación (`freeze.js`), el empaquetado y el comprobador offline (`verify-delivery.js`). Pruebas `tests/sim04.test.js` (S04-01…10). Recorrido manual: [`../prompts/SIM-MOTOR-04-recorrido-manual.md`](../prompts/SIM-MOTOR-04-recorrido-manual.md).
