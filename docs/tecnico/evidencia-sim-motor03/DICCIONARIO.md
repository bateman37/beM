# SIM-MOTOR-03 · diccionario de datos

Todos los CSV usan UTF-8, coma, comillas dobles escapadas y cabecera. **Vacío = no conservado / no representado / no aplicable al modelo** (nunca un cero). Un cero es un cero observado. Las tasas se recalculan desde contadores brutos (siempre incluidos).

## Claves de unión
`case_id` (estable y global: `A-<eq0>-<eq1>-R<n>`, `B-<escenario>-<V0|V1>-O<1|2>-R<n>`, `C-<Cnn>-R<n>`; el gemelo detallado añade `@DET`) · `entry_id` (entrada canónica **sin** semilla, 32 hex; `plan/entries.jsonl.gz`) · `input_hash` (entrada completa con semilla, SHA-256) · `seed_key`/`seed` (semilla de partido = `deriveSeed(20261023, seed_key)`; la clave **excluye** variante, resolutor, intento, worker, lote y ruta) · `team_index` (0/1 en la entrada) · `player_id`. Nunca se une por un número de caso local.

## Universos que NO se mezclan
- **controles SIM** (`controls_sim`): posesiones del generador alcanzadas · **finalizaciones SIM** (`finalizations_sim`): tiro + falta de tiro + serie ligada, una vez por identidad; las series de **bonus sin familia** no son finalizaciones (`bonus_fta`, `opp_bonus_series`) · **posesiones beM** (`possessions_beM`): solo el detallado.
- Una comparación entre modelos es **directa** para marcador, periodos, intentos/aciertos, rebotes, asistencias, pérdidas, robos, tapones, faltas, minutos y zonas; **aproximada** para asistencias a canasta/libres y rebotes colectivos (definición distinta) y para el uso por ficha (familia SIM frente a `origen` del detallado); **incompatible** para controles/finalizaciones/posesiones y para quintetos con tasas por control.

## 06-RESULTADOS-EQUIPO (`team.csv`): una fila por partido y equipo
Identidad: `case_id…resolver, seed, team_index, team_id, opponent_id, is_test_team` (1 = equipo sometido al factor en B/C) · `status` (`finished`/`failed`) · `valid` (1 = conciliaciones superadas) · `error`.
Marcador: `pts, opp_pts, diff, win` (victoria en cancha; **un fallido no tiene marcador ni cuenta como derrota**), `p1…p4`, `ot_pts` (suma de prórrogas), `periods`, `overtimes`, `duration_s`, `band` (banda de anotación del equipo: <60, 60-69, 70-79, 80-89, 90-99, 100-109, >=110; cortes descriptivos, no estándares de realismo).
Brutos: `fg2m…fta, fgm, fga, fg_pts, ft_pts` (`fg_pts/ft_pts` solo SIM), `oreb_ind/dreb_ind` (a jugadores), `oreb_coll/dreb_coll` (colectivos, sin jugador), `oreb_total/dreb_total`, `ast_fg/ast_ft/ast_total` (asistencias a canasta y a libres), `tov_ind/tov_coll/tov_total`, `stl, blk, blk_against, pf, pfd` (cometidas / recibidas), `exclusions` (jugadores con 5 faltas), `bonus_fta/bonus_ftm, shoot_fouls, and1` (SIM).
Derivados (fórmula): `fg_pct=fgm/fga` · `ts_pct=pts/(2·(fga+0,44·fta))` · `efg_pct=(fgm+0,5·fg3m)/fga` · `ft_rate=fta/fga` · `three_share=fg3a/fga` · `pts_per_control_sim=pts/controls_sim` · `pts_per_finalization_sim=pts/finalizations_sim` · `pts_per_possession_beM=pts/possessions_beM` · `tov_per100_controls_sim`/`tov_per100_possessions_beM` = 100·tov_total/universo · `oreb_pct_own=oreb_total/(oreb_total+dreb_total rival)`.
Uso: `players_used` (con minutos), `max_minutes`, `top3_minutes_share`, `top1_fga_share`, `top1_pts_share`, `hhi_fga`, `hhi_minutes` (Herfindahl; concentración descriptiva), `starters`.
Zonas: `rim|inside|midrange|three _a/_m` (intentos/aciertos de campo por zona; en el detallado se excluyen los tiros con falta, igual que SIM). Estados: `energy_start_mean`, `energy_end_mean`, `form_start_mean` (SIM: energía final del núcleo; detallado: `final_energy` si existe). `decisions` (decisiones del entrenador automático, SIM), `applied_orders` (órdenes aplicadas por audiencia).

## Tablas de la evidencia detallada
`player.csv` (una fila por jugador y partido: `participation` jugó/sin_minutos (SIM) o titular/entró/DNP… (detallado), `minutes`, `seconds` exactos, contadores, `finalizations_sim`, `closing_share=finalizations_sim/finalizaciones del equipo`, `controls_on`/`controls_against_on` (controles SIM con el jugador en pista; presencia completa del tramo), `pts_per100_controls_sim`, energía inicial/final, forma) · `zone.csv` (jugador × zona: intentos, aciertos, calidad cómoda/normal/forzada) · `family.csv` (familia/ficha SIM o `origen` del detallado) · `quintet.csv` (quinteto como conjunto de personas, orden alfabético; SIM: `controls_for_sim/controls_against_sim` observados y tasas `off_prod_per100=100·PF/ctl propios`, `conceded_prod_per100=100·PC/ctl rivales`, `balance_per100=off−conceded`, `diff_per100_own_controls=100·(PF−PC)/ctl propios` —**no** es el balance—; detallado: posesiones beM, sin tasas por control) · `defense.csv` (SIM Análisis: por organización/cobertura/altura efectivas: segundos, puntos y finalizaciones rivales, series de bonus aparte) · `period.csv` · `decision.csv` · `director.csv` (director efectivo por intervalos).

## Resúmenes (07) y contrastes (08)
Cada equipo-partido cuenta una vez. Percentiles: interpolación lineal entre rangos (tipo R-7); desviación típica muestral (n−1). `todos/sin_prorroga/con_prorroga` separados. Contrastes: pareja V0/V1 por escenario, orientación y réplica (misma semilla); `*_delta = V1 − V0`; las diferencias exactas de entrada de cada escenario están en `plan.json` y se recalculan de `entries.jsonl.gz`. Las repeticiones técnicas (E) y las pasadas de benchmark (F) **no** entran en ningún resumen.

## Ausencias tipadas
`no_conservado` (el nivel no lo guarda), `no_representado` (el modelo no lo produce), `no_aplica`, `no_evaluado` (no se comprobó), `denominador_cero` (`{absent: …}` en los JSON), `sin_autorizacion` (audiencia). Cero observado ≠ ninguna de ellas.

## Datos externos
No hay datasets externos con procedencia comprobable en el repositorio: **referencia externa pendiente de investigación por ChatGPT**. El detallado es una referencia funcional congelada, no verdad empírica.
