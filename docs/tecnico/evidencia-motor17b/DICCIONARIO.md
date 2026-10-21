# Diccionario de la evidencia de MOTOR-17B

Estudio `MOTOR17B-CIERRE-20261021`. Nulo = celda vacía (nunca cero). Las unidades van en el nombre de la columna o en la columna `*_unit`. **Clave global** de una ejecución: `MOTOR17B-CIERRE-20261021:<versión>:<lote>:<intento>` (`CONTROL17` o `M17B`); un `M000001` o un mismo lote pueden existir en las dos versiones, por eso ni el ID local de partido ni el de decisión identifican nada por sí solos.

## Versiones y perfiles (cosas distintas)

| Identidad | Significado |
|---|---|
| CONTROL17 | `01c8ade`: MOTOR-17 tal como se entregó, ejecutable e inmutable en un worktree aislado. Perfil base con `SEM-MOTOR17-20261018`. |
| M17B | implementación auditada de MOTOR-17B (commit completo en `03-IDENTIDADES-Y-GIT.json`). Perfil base con `SEM-MOTOR17-20261018` + `SEM-MOTOR17B-20261021` (solo crédito y procedencia). |
| P0 | perfil base, `energy.costPerLiveMinute = 2`. Referencia histórica y compatibilidad. |
| P1 | P0 + C17-02 (`energy.costPerLiveMinute = 3,5`). Referencia provisional: no es calibración externa ni aceptación manual. |
| `ESE-MOTOR17-R1` / `ESE-MOTOR17B-R1` | conservación del registro esencial; en `ESE-MOTOR17B-R1` `defense_org` es un código de organización efectiva. |
| `PRJ-MOTOR17B-R1` | proyección de la auditoría (contextos enlazados a la operación real). |

## Tablas (`05-RESULTADOS/`)

| Archivo | Grano / significado |
|---|---|
| `04-MAPA-CASOS.csv` | una fila por ejecución: caso lógico (`logical_key`), versión, lote, intento, perfil, semilla, nivel de registro y vínculo del diagnóstico con su esencial (`principal_row_key`). |
| `05-EJECUCIONES.csv` | 72 filas: estado, validez, marcador, periodos, décimas, hechos, posesiones, sorteos, huella de trayectoria (con su modo y versión) y órdenes programadas. |
| `06-EQUIPOS-POR-EJECUCION.csv` | acta por equipo y ejecución esencial; `players_pts_sum`, `players_stl_sum` y `reconciles_points` concilian con los jugadores. |
| `07-JUGADORES-POR-EJECUCION.csv` | pertenencia explícita (`team_index`, `team_id`, `in_entry_roster`), minutos en décimas (`min_tenths`), acta, DNP (`dnp`), tramos (`stints`) y energía final. |
| `08-RENDIMIENTO-POR-EJECUCION.csv` | fases acumuladas por trabajo en ms; `simulate_ms` incluye el observador incremental (`fingerprint_ms` no se suma si el modo es `incremental`). |
| `09-COMPARACION-CONTROL17-M17B.csv` | por caso lógico: ¿mismo deporte? (`all_sporting_equal`), qué comprobaciones fallan (`failing`), marcador, sorteos, hechos y créditos de robo en cada versión. `09b-DESVIACIONES-…json` enumera lo conservado, lo autorizado y cualquier desviación con ejemplos. |
| `10-ORGANIZACION-EFECTIVA.csv` | un tiro por fila: hecho, secuencia, equipo defensor, organización **efectiva**, **pretendida**, condición de **alternativa**, objetivo, versión de plan y origen (`plan` · `orden aplicada` · `alternativa` · `no reconstruible`). `10b` resume por caso. |
| `11-EMBUDO-ROBOS.csv` | pérdidas de los doce diagnósticos: ruta, balón vivo/muerto, defensor resuelto, intento, recuperador, autor del crédito, `credit_source`, `credit_contact` y motivo de ausencia. |
| `12-CIERRES-DE-SAQUE.csv` | cadena de saque, estado, receptor y causa terminal (interrumpida ≠ abierta defectuosa). |
| `13-DIAGNOSTICO-VS-ESENCIAL-M17B.csv` | cada diagnóstico frente a su esencial: mismo marcador, sorteos, hechos, orden/reloj y estadísticas incluidos los créditos de robo. |
| `14-COSTE-DE-LA-CAMPANA.json` | trabajo realmente ejecutado y tiempos registrados por versión y nivel; NO es el benchmark frío ni se extrapola. |

## Auditoría y sensibilidad (`06-AUDITORIA-Y-SENSIBILIDAD/M17B/`)

| Archivo | Significado |
|---|---|
| `resumen.json` | recuentos por resultado y métricas de AUD05 de ESTA ejecución (origen único de los demás archivos). |
| `ejecuciones.csv`, `informe-auditoria.md` | AUD01–32 con ejes separados (implementación, registro, exposición, resultado). |
| `capacidades.csv` | matriz de 32 capacidades: declarado, observado, exposición, salida pertinente (`salidaPertinente`, `salidaContextos`, `salidaConsumidores`), motivo de pendiente. |
| `sensibilidad.csv` | hasta 8 contextos × (+1, +3, +5) por capacidad (≤ 768 filas). `delta` es el cambio de la **receta intermedia** (puntos 1–30); `salida`, `salidaUnidad`, `salidaAntes`, `salidaDespues`, `salidaDelta` son los de la **operación real**; `salidaRegistrada`, `diferenciaBase`, `tolerancia` y `baseCoincide` contrastan la base reconstruida con la que conservó el productor; `opciones` lleva toda la distribución; `consumidor` y `funcion` identifican la operación y la función de producción compartida. |
| `contextos-contraste.jsonl` | cada contexto con sus entradas (términos de receta y notas `salida:*` de la operación): permite reproducir la fila sin re-simular. |

### Operaciones (consumidores) y su salida pertinente

| `consumidor` | Función compartida | Salida |
|---|---|---|
| `tiro` | `shotResolution` | probabilidad de acierto (tiro de campo o libre) |
| `tapon` | `blockResolution` | probabilidad de tapón |
| `rebote` | `reboundTeamResolution`, `pickProbabilities` | probabilidad de rebote ofensivo del equipo; probabilidad de captura de un jugador |
| `suelto` | `looseControlP` | probabilidad de que el ataque conserve el balón suelto |
| `control` | `categoryResolution` | probabilidad de la categoría (pérdida, falta, …) con la distribución completa |
| `calidad` | `qualityResolution` | probabilidad de calidad previa cómoda con la distribución completa |
| `mezcla:transicion` | `mixResolution` + `abilityFit` | probabilidad de ser el finalizador de la transición |
| `seleccion`, `aceptacion` | `mixResolution`, `acceptanceResolution` | distribución de opciones de la selección / probabilidad de aceptar una opción directa |
| `presion`, `consistencia`, `gasto` | `pressureLossLogit`, `consistencySigmaAt`, `enduranceFactorAt` | pérdida por presión (logit), amplitud σ del momento, gasto de energía del intervalo |

## Evidencia y lectura

`07-EVIDENCIA-DE-CAUSAS/cinco-casos-historicos.json`: reproducción dirigida de las cinco pérdidas vivas de MOTOR-17 (5 ejecuciones aparte). `08-LOGS-DE-EJECUCION/`: `runlog-*.jsonl` por lote. `09-PRUEBAS-Y-DATOS/`: suite, `data:check` y comprobación documental. `10-NAVEGADOR/`: recorrido de Chromium. El recibo `MOTOR-17B-verificacion-final.json` y la prueba de descarga están **fuera** de los ZIP.
