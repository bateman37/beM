# Diccionario de la evidencia de MOTOR-17

Claves de lectura. **Nulo = celda vacía (nunca cero).** Las unidades van en el nombre de la columna o en `unit`. Una firma de archivo (SHA-256) no es una firma de entrada ni una trayectoria: son contratos distintos y se conservan separados. Los tamaños son bytes UTF-8 reales.

## Identidades que no se mezclan
| Clave | Qué identifica | Qué NO es |
|---|---|---|
| `version` | `R0` (código 6a6814c, MOTOR-15B) o `R17` (código final + perfil con la candidata elegida) | no es el número de aplicación |
| `block` | A natural · B mecanismos (EXP13) · C defensa (ORG×COB) · D estados (LAB11) | |
| `purpose` | `principal` (universo de comparación) o `diagnostico_completo` (repetición con registro diagnóstico) | las repeticiones diagnósticas y los benchmarks **no** se añaden al universo natural |
| `batch_id`, `match_id`, `attempt_id` | identificadores **locales** de cada lote (`M000001` se repite entre lotes) | no identifican un partido por sí solos: la identidad global es `lote\|intento` (`row_key = version:batch_id:attempt_id`) |
| `logical_key` | `bloque\|grupo\|r..\|H0/H1/fija\|variante`: empareja el mismo caso entre R0 y R17 | |
| `sporting_seed` | semilla deportiva congelada del caso (compartida por versiones, variantes y localías del caso) | no es la semilla de lote |
| `trajectory_fp` | huella de trayectoria (`trajectory_fp_version`: `TRAYINC-MOTOR15-R1` incremental en esencial; `TRAY-MOTOR12-R1` completa en diagnóstico) | `TRAYINC` y `TRAY` **no** se comparan entre sí |

## Archivos de `rapido/`
| Archivo | Grano | Notas |
|---|---|---|
| `04-MAPA-CASOS.csv` | una ejecución | clave lógica, bloque, grupo, repetición, localía (`H0` = primer equipo local; `H1` = visitante), variante, semilla, propósito y enlace `principal_row_key` de las repeticiones |
| `05-EJECUCIONES.csv` | una ejecución | estado de ejecución y deportivo, validez y motivo de exclusión, marcador, periodos, prórrogas, `game_tenths` (décimas de juego), eventos, posesiones, pasos, sorteos, huellas, versiones de motor/registro/perfil efectivo |
| `06-EQUIPOS-POR-EJECUCION.csv` | un equipo en una ejecución | totales de acta (`tov_individual` + `tov_collective`), `team_index` (0 = local), faltas y tiempos muertos por periodo |
| `07-JUGADORES-POR-EJECUCION.csv` | un jugador en una ejecución | `participation`, `min_tenths` (décimas de juego: 600 = 1 minuto; 24000 = 40:00), línea de acta, `stints` (tramos en pista), `energy_final` (0–100), `team_index` explícito |
| `08-RENDIMIENTO-POR-EJECUCION.csv` | una ejecución | fases del trabajo en ms (se solapan entre workers), bytes del esencial y de archivos |
| `09-COMPARACION-R0-R17.csv` | métrica × bloque | medias de casos emparejados por clave lógica, diferencia R17−R0, desviación y error típico; intervalo solo con ≥ 20 pares (aproximación normal); no es un contraste de hipótesis y las repeticiones técnicas no amplían la muestra |
| `10-EMBUDO-PERDIDAS-ROBOS.csv` | una pérdida de los diagnósticos | ruta (A organizada · B avance presionado · C envío forzado de saque · D balón suelto), estado del balón, intento, defensor resuelto, recuperador, crédito de robo, `credit_source`/`credit_contact` |
| `11-CIERRES-DE-SAQUE.csv` | una cadena de saque diagnóstica | estado, causa de cierre, receptor, opción usada, negadas, clase (`ejecutada`, `sin_entrega_valida`, `interrumpida_fin_periodo`, `cerrada_sin_receptor_sin_causa`, `abierta (sin cierre)`) |
| `12-DECISIONES-DE-RELEVO-DIAGNOSTICAS.csv` | una decisión de rotación | regla, motivo, estado, saliente/entrante, energías, utilidades (escala 1–30), faltas |
| `13-SUSTITUCIONES-DIAGNOSTICAS.csv` | un cambio | origen, motivo, energías, faltas, si ocupa una posición no nominal, ventana |
| `14-TIROS-DIAGNOSTICOS.csv` | un tiro de campo diagnóstico | zona (sector), calidad (preparación), `p_conversion`, `p_final`, defensa efectiva |
| `15-RITMO-POR-TIPO-DE-HECHO.csv` | tipo de hecho × versión | décimas consumidas, total y media (solo diagnósticos: no se extrapola) |
| `16-ROTACION-POR-JUGADOR.csv` | `Jn` × bloque × versión | DNP, jugadores de 40:00 y minutos medios sobre actuaciones **sin prórroga**; son frecuencias observadas, **no cuotas** del motor |
| `resumen-tablas.json` | — | recuentos, comprobaciones y anomalías de las tablas |

## Auditorías (`auditoria/<lectura>/`)
Cada lectura es una ejecución de AUD01–32 sobre los doce diagnósticos de **una** versión. `R0-lectorR0` usa el lector de MOTOR-15B; `R0-lectorR17` lee los mismos archivos con el lector corregido (identidades globales, sensibilidad con tope); `R17-lectorR17` es la lectura de la versión final. `resumen.json` sale de la misma ejecución que `ejecuciones.csv` e `informe-auditoria.md`. `sensibilidad.csv` distingue `exactitud` (`exacta` con tope registrado o del perfil; `aproximada` solo en evidencia histórica sin tope) y `magnitud`/`unidad` (el `delta` es el cambio de la **entrada** de la operación final salvo las siete capacidades con salida real, cuyos valores van en `salida*`).

## Coste (`coste/`)
`coste-<versión>-<N>.json`: trabajo de cien o doscientos encuentros `world-essential` con cuatro workers, en **proceso nuevo**; `timing_ms.dispatch_to_last_persisted_wall` es la pared desde el despacho hasta el último resultado persistido y validado; `total_from_process_start` incluye arranque del proceso, importación, congelación y workers. `per_job_ms` son fases por trabajo (se solapan). La memoria es del proceso Node completo.
