# Diccionario de columnas — paquete rápido MOTOR-15

Convenciones: CSV UTF-8, separador coma, **punto decimal**, comillas dobles cuando el texto contiene coma o salto de línea. **Celda vacía = no registrado / no aplicable; nunca es cero.** Un intento fallido o interrumpido no tiene marcador y no cuenta como derrota. El resultado adjudicado y la producción de cancha son campos distintos (en este paquete solo hay producción de cancha).

| Archivo | Columna | Significado / unidad / universo |
|---|---|---|
| 05 | `kind` | `benchmark100` (agenda de cien en world-essential), `benchmark100_intento1_con_defecto` (primera ejecución, con un fallo real, conservada), `matriz` (4 entradas × configuración × pasada fría/caliente), `integracion` (C15-01…06, registro diagnóstico) |
| 05 | `run` | Pasada del mismo lote (1 = fría, 2 = caliente). No es un partido nuevo |
| 05 | `case_id` `variant_id` `attempt_id` `match_id` | Identidades separadas del proyecto. Una repetición de la misma pasada comparte `case_id`/semilla pero no `attempt_id` |
| 05 | `seed` | Semilla deportiva efectiva (entero de 32 bits), fijada antes de ejecutar |
| 05 | `exec_state` | `terminada` o `fallida`/`interrumpida`; con estas dos últimas `score_*`, `draws`, `valid` no representan un partido |
| 05 | `score_home` `score_away` | Puntos de cancha del equipo local/visitante (entero) |
| 05 | `draws` | Sorteos deportivos consumidos (entero) |
| 05 | `trajectory_fp` `fp_mode` | Huella de trayectoria; `incremental` (TRAYINC-MOTOR15-R1, solo world-essential) o `full` (TRAY-MOTOR12-R1). **No son intercambiables**. Vacía si el nivel no la calculó |
| 05 | `exec_ms` | Tiempo del trabajo (ms), inclusivo de sus fases; con varios workers se solapa |
| 05 | `bytes` | Bytes del registro del intento sin comprimir |
| 06 | `points … pf` | Totales de equipo del acta (política ACTA-MOTOR15-R1). `fg2a/fg3a` excluyen la falta en acto de tiro fallado; `ast` = a canasta + a libres; `tov` incluye pérdidas colectivas |
| 06 | `attack_possessions` | Posesiones con ataque activo del equipo (acta) |
| 06 | `periods_played` `overtime_periods` `game_tenths` | Periodos disputados, prórrogas y décimas de juego (tiempo de juego vivo registrado) |
| 07 | `kind` | `medición` (ejecutada), `estimación` (proyección lineal, **no** ejecutada), `declarada` (cifra citada de otra entrega), `objetivo` |
| 07 | `temperature` | `frío` (módulos y workers sin calentar) / `caliente` |
| 07 | `value` `unit` `n` | Valor, unidad (`ms`, `B`, `MiB`) y número de observaciones |
| 07 | `overlap_note` | Cómo se solapa la medida: el tiempo por trabajo con 4 workers **no** se suma como espera del usuario; la pared del lote sí |
| 08 | `result` | `IGUAL` / `DIFERENTE` / `NO_EJECUTADO`; `first_difference` vacío si IGUAL |
| 09 | `impl` `registro` `exposicion` `resultado` `revision_humana` | Ejes AUD separados: implementación, registro, exposición, conclusión y revisión humana. «inconcluso» no es «conforme» |
| 10 | `contrast_plus*` | Contraste de cálculo +1/+3/+5: disponible (operación pura) y ejecutado en esta evidencia |
| 11 | `contrast` | Estado de contraste de la fila normativa (`contrastada` = por síntesis de ChatGPT, nunca lectura directa de Claude) |
| 12 | `read_history` `replay` `continue` `edit` | Qué operaciones admite cada formato/perfil |
