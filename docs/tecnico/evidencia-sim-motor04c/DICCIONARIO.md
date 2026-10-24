# SIM-MOTOR-04C · diccionario de columnas y convenciones

Valores `null` = no conservado, no instrumentado, no representado, no expuesto o no ejecutado (situaciones distintas, nunca cero). Un porcentaje se calcula siempre desde numeradores y denominadores sumados, no promediando porcentajes. Un punto porcentual es 0,01 (no «1 % relativo»).

## Identidades
`DET` detallado congelado (MOTOR-18C, 83–98, 6.684 sorteos) · `B04B` código real de 04B con la candidata 19,5 / 0,70 / 0,90 / 3 · `N04C` código de 04C con las tres filas nuevas a 0 (control de neutralidad) · `C04C-J0/R35/R65/R85/I50/I100/P15/P30` vectores completos de la búsqueda (CAL) · `FINAL` ejecuciones de VAL/CONTRAST/TECH con el vector de `C04C-FINAL-PROVISIONAL` (alias de `C04C-P30`) · `TECH-auto/steps/recover` recorridos técnicos. Alias en `ALIAS.csv`.

## Claves de caso y semilla
`case_id` (`CAL-EQ01-EQ02`, `VAL-EQ01-EQ03-R1`, `CONTRAST-T01-V0-O1-R1`) · `seed_key` = `<AAAAMMDD>|SIM04C|<bloque>|<caso>|R<réplica>` (CAL conserva las semillas e input_hash de 04B) · `seed` = SHA-256 de la clave UTF-8, primeros 32 bits big endian (0 → 1; colisión → `#2`) · `entry_id` entrada canónica sin semilla · `input_hash` entrada con semilla. V0/V1 de CONTRAST comparten semilla de forma intencionada. El `case_id` es el encuentro lógico (idempotencia); `attempt` es el intento técnico.

## 04-AGENDA-Y-RECUENTO.csv
`section` count | case | incident. En `count`: solicitado, ejecutado, terminado, válido, no_válido, fallido, interrumpido, reintento y no_ejecutado por bloque/modelo/identidad. `detailed_anchor` = el caso tiene ancla detallada.

## 05-RESULTADOS-EQUIPO.csv (una fila por ejecución y equipo)
Columnas de acta (`pts`, `fg2m/a`, `fg3m/a`, `ftm/a`, `oreb_ind/coll`, `dreb_*`, `ast_fg`, `ast_ft`, `tov_*`, `stl`, `blk`, `pf`…), `controls_sim` (controles SIM) frente a `possessions_beM` (posesiones del detallado) y `finalizations_sim` son denominadores distintos y no se mezclan. `rim_a/m`, `inside_a/m` (zona inside sin aro), `midrange_*`, `three_*`: intentos de campo por zona (canasta con falta cuenta; fallo con falta de tiro no es intento; tiro anulado no cuenta). `ast_den_*`: denominadores de asistencia (solo SIM). `players_40min`: jugadores con ≥ 40 min.

## 08-CONTEXTO-ZONA-CALIDAD.csv.gz
`context` nativo (SIM: organized/transition/spontaneous/putback; detallado traducido: organizado→organized, transición/temprano→transition, saque→inbound, continuidad→continuation; no se equiparan automáticamente). `quality` 0 cómoda, 1 normal, 2 forzada. `attempts`/`makes` de campo. **`made_with_passer`** = canastas con un pasador representado; **`ast_fg_credited`** = canastas con AST_FG acreditada (SIM: el pasador representado es el crédito causal; detallado: crédito `ast`/`canasta` del acta ligado al hecho del tiro). `foul_miss_no_attempt`: fallos con falta de tiro (no son intento).

## 09-REBOTE-Y-ASISTENCIAS.csv y 09b-REBOTE-EMBUDO.csv
Embudo tras rebote ofensivo. SIM: `branch` immediate | organized_reset | reset_unavailable; `decisions` = decisiones de rama (un segundo rebote encadenado es otra decisión); resultado de la continuación `fga` (+`fgm`), `shooting_foul`, `turnover`, `other`; `eligible` finalizaciones que admiten entrega, `delivered` entrega producida, `eligible_baskets`, `ast_fg`, `eligible_ft_series`, `ast_ft`; `origin` field | block | ft (procedencia del rebote). Detallado (`detailed_native`): rebotes ofensivos INDIVIDUALES del acta y primer tiro posterior en la misma posesión y periodo; `turnover` y elegibilidad = null (no conservados); `other` = rebotes sin tiro posterior. `ORB/(ORB+DREB_rival)` con denominador explícito.

## 07-VAL-RESUMEN.csv y 06-CAL-SELECCION.json
Errores (b = banda): eP, eF (relativos de media por 40 min), eZ (Σ diferencias de cuota de FGA por zona), e2, eR, eI (inside sin aro), eQ (calidad forzada al aro), eA (AST_FG/FGM) en puntos de proporción; e3 (3P%), eFT (FT%), `forcedInside`. `M = max(e/b)`. Guardas uniformes frente a N04C. `num_den_*`: numerador/denominador (o media para eP/eF).

## 10-USO-Y-CONTRASTES.csv
`uso`: minutos, usados, concentración y jugadores de 40 min por identidad/bloque. `contraste`: delta V1−V0 del equipo sometido en pares de la misma semilla (señal de exposición/dirección; n pequeño; no efecto medio demostrado).

## Conservación (esencial de Referencia)
Conservado: identidad, marcador, acta por jugador y equipo, zonas, familias, denominadores, embudos (asistencia y rebote), presión y exposición. No conservado (declarado): quintetos, evolución, defensa por organización (solo en Análisis).
