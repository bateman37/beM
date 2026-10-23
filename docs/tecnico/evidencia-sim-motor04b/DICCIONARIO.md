# SIM-MOTOR-04B · diccionario de datos

Todos los CSV usan UTF-8, coma, comillas dobles escapadas, punto decimal y cabecera; los números van sin separador de millares. **Vacío = no conservado / no representado / no aplicable al modelo** (nunca un cero). Un cero es un cero observado. Las tasas se recalculan desde contadores brutos (siempre incluidos, con numerador y denominador).

## Claves de unión
- **Clave global de registro**: `campaña|bloque|caso lógico|identidad|resolutor|intento`, p. ej. `SIM04B-CAMPANA-20261023|VAL|VAL-EQ01-EQ03|R04B-N|sim|1`. No se usa un id local de lote ni se infiere identidad del prefijo del jugador.
- `case_id` (estable: `CAL-…`, `VAL-…`, `STRESS-…`, `CONTRAST-Tnn-Vn-On-Rn`) · `run` (identidad ejecutada) · `entry_id` (entrada canónica sin semilla, `plan/entries.jsonl.gz`) · `input_hash` (entrada completa con semilla, SHA-256) · `seed_key`/`seed` (SHA-256 de `20261023|SIM04B|<bloque>|<clave>|<etiqueta>`, primeros 32 bits; la clave excluye identidad, resolutor, intento, worker, lote y ruta) · `team_index` (0/1) · `player_id`.

## Identidades (columna `run` / `identity`)
- `R04` — código real de SIM-MOTOR-04 (`ad52c91`, versión `0.3.0-SIMMOTOR04`) con su candidata (19,5 / 0,70 / 0,90 / 3), en un worktree de solo lectura.
- `R04B-N` — código de 04B con los cuatro valores de 04 y las filas nuevas neutrales (`SEM04B`); demostrado idéntico en lo deportivo a un worktree «solo correcciones».
- `C04B-Z1, Z2, Q1, Q2, A1, A2, E1` — vectores limitados (≤ 7 filas adicionales, secuenciales) sobre `R04B-N`, medidos solo en CAL.
- `C04B-FINAL-PROVISIONAL` — vector elegido por las reglas congeladas con CAL; **coincide con `R04B-N`** porque ningún candidato fue admisible.
- `O04B-CONTROL` — código tras las correcciones y **antes** de las optimizaciones exactas; `O04B-FINAL` — código final optimizado.
- `DET` — detallado congelado (anclas), `DET-DIAG` — sus cuatro diagnósticos; `FINAL-DIAG` — diagnóstico nativo SIM; `TECH-auto|steps|recover|reference` — rutas técnicas del mismo caso.
- **Etiquetas heredadas de las tablas de `report.js`** (la herramienta es un derivado de la de 04): `R0` = `R04`; `R1` = `FINAL` = `C04-E1` = `R04B-N` (mismos registros con otro rótulo; que R1, FINAL y C04-E1 sean idénticos es el resultado de la selección, no un error).

## Poblaciones que NO se mezclan
- **CAL** (selección; 24 casos SIM, 24 anclas detalladas) · **VAL** (reserva sin reentrenar; 24 + 24) · **STRESS** (equipos de contexto; 16) · **CONTRAST** (T01–T07, T09, T06; 32) · **DIAG** (8 SIM + 4 detallados) · **OPT/TECH** (equivalencia técnica; no son observaciones nuevas) · **BENCH** (pasadas de coste; no entran en ningún resumen).
- Las comparaciones SIM/detallado se restringen a las anclas (misma entrada, misma semilla). Lo que falta en uno de los dos modelos se declara y no entra en ninguna media.

## Universos
- `controls_sim` (controles/posesiones del generador), `finalizations_sim` (tiro + falta de tiro + serie ligada, una vez), `possessions_beM` (solo detallado). **Incompatibles** entre sí.
- **Zonas**: `rim|inside|midrange|three _a/_m` (intentos/aciertos de campo). Un intento de campo es el no anulado y que no sea «falta sin canasta»; la canasta con falta **sí** cuenta.
- **Tiros libres y universo (04B)**: `ft_pct = ftm/fta` y `three_share = fg3a/fga` se publican siempre con su numerador y su denominador (`num_ftm/den_fta`, `num_fg3a/den_fga`); un denominador nulo deja la tasa vacía, no en cero.
- **Asistencias**: `ast_den_elig_fin`, `ast_den_delivered`, `ast_den_elig_baskets`, `ast_den_fg_assists`, `ast_den_elig_ft_series`, `ast_den_ft_assists`; `astPerFgm = ast_fg/fgm`. El detallado no conserva estos denominadores (vacío). En 04B la elegibilidad de asistencia sale de una tabla derivada del catálogo (clases `ELC`).
- **Calidad de aro**: `q_forced` (intentos al aro en calidad forzada) y `attempts` de la tabla `tabla-zone.csv`; `eQ` compara la cuota forzada.

## Unidades de las fases de coste (04B)
`measuredMs`/`phasesMs` en milisegundos de reloj de pared; `workerBusyMs` en milisegundos de CPU ocupada por worker; `latencyMs` por caso dentro del worker (entrada + generación + construcción + conciliación, percentil por rango inferior); `rssMaxMiB` en MiB; `bytes.*` en bytes. `serialize`, `persistFsync` y `worldAvailability` se informan aparte y **no** forman parte del objetivo de 5 s, que se define como «solicitud de `pool.run` con workers preparados → actas esenciales individuales de los 1.000 casos, validadas y en poder del coordinador».

## Errores de selección (SEL-SIM04B-R1, `07-CAL-SELECCION.json` y `07-REGLAS-DE-SELECCION.json`)
`eP` (puntos por 40 min, relativo) · `eF` (tiros de campo por 40 min, relativo) · `eZ` (Σ |cuota de zona SIM − DET|) · `e2` (acierto de dos) · `eR` (acierto en aro) · `eQ` (cuota de intentos al aro en calidad forzada) · `eA` (asistencias por canasta). Bandas: eP 0,08, eF 0,08, e2 0,04, eR 0,05, eQ 0,05, eA 0,08. Guardas locales (frente al ganador previo) y acumuladas (frente a `R04B-N`); ninguna guarda se compensa con la mejora de otra. Etapas secuenciales Z (peso de aro) → Q (calidad de aro) → A (ventaja recibida) → E (gasto de energía 3,5 solo si reduce ≥ 20 % relativo la frecuencia de 40 min y supera las guardas y los casos de rotación). `freq40` = fracción de actuaciones de equipo con algún jugador ≥ 40 min en partidos **sin** prórroga, con segundos originales. Empates y «no evaluado»: se conserva el valor previo (nunca una pérdida cero ficticia).

## Suficiencia de exposición de los contrastes (`09e`, `09f`)
Cada variante declara su expectativa: `zero` (el numerador 0 es legítimo siempre que haya denominador; p. ej. T03 V0, altura normal: sin presión adelantada) o `positive` (numerador > 0). Estados: `cero_esperado`, `exposicion_positiva`, `exposicion_inesperada`, `sin_exposicion`, `no_conservado`, `no_evaluado`. El veredicto habla de **exposición**, no de significación estadística (dos pares por contraste —V0/V1 en dos orientaciones— son una muestra reducida).

## Ausencias tipadas
`no_conservado`, `no_representado`, `no_aplica`, `no_evaluado`, `no_instrumentado`, `denominador_cero`, `sin_autoridad`. Cero observado ≠ ninguna de ellas. «No evaluado» nunca cuenta como conforme.

## Datos externos
Fuentes externas declaradas en `docs/tecnico/evidencia-sim-motor04/fuentes-externas.json` (investigación previa de ChatGPT, validación **parcial**). El detallado es una referencia funcional congelada, no verdad empírica; esta evidencia no acredita validación externa integral.
