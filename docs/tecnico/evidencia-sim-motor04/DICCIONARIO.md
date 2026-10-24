# SIM-MOTOR-04 · diccionario de datos

Todos los CSV usan UTF-8, coma, comillas dobles escapadas, punto decimal y cabecera; los números van sin separador de millares. **Vacío = no conservado / no representado / no aplicable al modelo** (nunca un cero). Un cero es un cero observado. Las tasas se recalculan desde contadores brutos (siempre incluidos, con numerador y denominador).

## Claves de unión
- **Clave global de registro**: `campaña|bloque|caso lógico|identidad|resolutor|intento`, p. ej. `SIM04-CAMPANA-20261023|VAL|VAL-EQ01-EQ12|FINAL|sim|1`. No se usa un id local de lote ni se infiere identidad del prefijo del jugador.
- `case_id` (estable: `CAL-…`, `VAL-…`, `STRESS-…`, `CONTRAST-Tnn-Vn-On-Rn`) · `run` (identidad ejecutada) · `entry_id` (entrada canónica sin semilla, `plan/entries.jsonl.gz`) · `input_hash` (entrada completa con semilla, SHA-256) · `seed_key`/`seed` (SHA-256 de `20261023|<espacio>|<clave>|<etiqueta>`, primeros 32 bits; la clave excluye identidad, resolutor, intento, worker, lote y ruta) · `team_index` (0/1) · `player_id`.

## Identidades (columna `run` / `identity`)
`R0` (perfil de SIM-MOTOR-03 en su código, worktree de solo lectura) · `R1` (código de 04 con el perfil de 03, factor 1: referencia de convergencia) · `C04-V1…V3, Z1, Z2, A1, A2, E1, E2` (candidatas, ≤ 9 vectores sobre R1) · `FINAL` (= `C04-FINAL-PROVISIONAL`, el vector elegido en CAL, usado en VAL/STRESS/CONTRAST/DIAG) · `O04-CONTROL` (código tras las correcciones, **antes** de las optimizaciones exactas) · `O04-FINAL` (código final optimizado, vector `C04-E1`) · `DET` (detallado congelado, solo anclas) · `TECH-E1/E2` (repeticiones técnicas).

## Poblaciones que NO se mezclan
- **CAL** (selección; 56 casos SIM, 16 anclas detalladas) · **VAL** (reserva sin reentrenar; 56 + 16) · **STRESS** (equipos de contexto; 24) · **CONTRAST** (T01–T11, 88) · **DIAG** (12 SIM + 4 detallados) · **OPT/TECH** (equivalencia técnica; no son observaciones nuevas) · **BENCH** (8.000 ejecuciones de coste; no entran en ningún resumen).
- Las comparaciones SIM/detallado se restringen a las 16 anclas (misma entrada, misma semilla). La población completa de 56 se informa aparte.

## Universos
- `controls_sim` (controles/posesiones del generador), `finalizations_sim` (tiro + falta de tiro + serie ligada, una vez), `possessions_beM` (solo detallado). **Incompatibles** entre sí.
- **Zonas**: `rim|inside|midrange|three _a/_m` (intentos/aciertos de campo). Regla común de lectura (C04-02): un intento de campo es el no anulado y que no sea «falta sin canasta»; la canasta con falta **sí** cuenta. SIM las lee del compacto `[a, m, q0, q1, q2]` con `decodeZone`.
- **Asistencias (C04-06)**: `ast_den_elig_fin` (finalizaciones elegibles), `ast_den_delivered` (con pase final entregado), `ast_den_elig_baskets`, `ast_den_fg_assists`, `ast_den_elig_ft_series`, `ast_den_ft_assists`. `astPerFgm = ast_fg/fgm`; el detallado no conserva estos denominadores (vacío).
- **Presión (C04-04)**: `pressOps` por equipo (columnas 06: `press_opps`, `press_explicit_opps`, `press_sum_delta`): segmentos y segundos con presión representada, con/sin familiaridad explícita, y `delta` aplicado al peso extra de pérdida (`wPress·exp(−delta)`). La audiencia pública no ve `delta`/`explicit`.
- **Bloqueador (C04-03)**: `scr_recorded_fin` (créditos de bloqueador registrados en 06) y `analysis.participation[*].screeners`: `scrSrc` 1 = ejecutante, 2 = obtenida la falta, 0 = sin candidato; el crédito del bloqueador solo existe cuando la jugada tiene el rol (POS01–04, POS07–08).

## 06-RESULTADOS-EQUIPO (una fila por caso, identidad y equipo)
Marcador (`pts, opp_pts, diff, win, p1…p4, ot_pts, periods, overtimes, duration_s`), brutos (`fg2m…fta, fgm, fga`, rebotes individuales/colectivos, asistencias a canasta/libres, pérdidas, robos, tapones, faltas, `exclusions`, `bonus_*`, `shoot_fouls`, `and1`), derivados con fórmula (`fg_pct, ts_pct=pts/(2·(fga+0,44·fta)), efg_pct, ft_rate, three_share, pts_per_control_sim, …`), uso (`players_used, max_minutes, max_player_pts, players_40min, top3_minutes_share, top1_fga_share, hhi_*`), zonas, estados y los denominadores de asistencia. Un fallido no tiene marcador ni cuenta como derrota.

## Selector mecánico SEL-SIM04-R1 (`07-CAL-SELECCION.json`)
`L_V=|ptsSIM/ptsDET−1|+|fgaSIM/fgaDET−1|` (equivalentes por 40 min, anclas CAL) · `L_Z=Σ|cuota zona SIM − DET|` (admisible si `L_V` no empeora más de máx(0,02; 10 %)) · `L_A=|ΣAST_FG/ΣFGM SIM − DET|` · etapa E: menor gasto de {2, 3, 3,5} con ≥ 20 % de reducción relativa de la frecuencia de «algún jugador ≥ 40 min» y los límites de `L_V`/`L_A` y de rotación. Empates: se conserva el anterior si la mejora es < 5 % o no hay pérdida. El comprobador **recalcula** estas pérdidas desde los registros, no acepta un booleano.

## Ausencias tipadas
`no_conservado`, `no_representado`, `no_aplica`, `no_evaluado`, `no_instrumentado`, `denominador_cero`, `sin_autoridad`. Cero observado ≠ ninguna de ellas. Los indicadores aproximados llevan nombre y fórmula y no se usan como contador exacto al comparar modelos.

## Datos externos
Fuentes externas declaradas en `fuentes-externas.json` (investigación previa de ChatGPT, validación **parcial**). El detallado es una referencia funcional congelada, no verdad empírica; esta evidencia no acredita validación externa integral.
