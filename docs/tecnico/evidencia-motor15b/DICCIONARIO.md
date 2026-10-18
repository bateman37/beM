# Diccionario de columnas — paquete rápido MOTOR-15B

Convenciones: CSV UTF-8, separador coma, **punto decimal**, comillas dobles cuando el texto contiene coma o salto de línea. **Celda vacía = no registrado / no aplicable; nunca es cero.** Un intento fallido o interrumpido no tiene marcador y no cuenta como derrota. El resultado adjudicado y la producción de cancha son campos distintos (aquí solo hay producción de cancha). Los tamaños (`bytes`) son **bytes UTF-8 reales** y los hashes SHA-256 de esos bytes.

| Archivo | Columna | Significado / unidad / universo |
|---|---|---|
| 05, 06, 07 | `origin` | `histórico MOTOR-15` (conservado, no repetido) o `nuevo MOTOR-15B`. Los cien resultados del benchmark son históricos |
| 05 | `kind` | Histórico: `benchmark100`, `benchmark100_intento1_con_defecto` (con un fallo real conservado), `matriz`, `integracion`. Nuevo: `integracion_15B` (reejecución), `reproduccion_auditoria_15B` (lotes de reproducción de C15-01…05), `preparado_RG-I03_15B`, `cola_*` (colas de continuación: **no son muestras independientes**) |
| 05 | `match_id` | Identidad textual: `C15-0x@15B` (reejecución), `LOT-…:M000001` (reproducción). Los IDs locales M000001 de lotes distintos no se confunden |
| 05 | `seed` | Semilla deportiva efectiva (entero de 32 bits), congelada antes de ejecutar |
| 05 | `exec_state` | `terminada` o `fallida`/`interrumpida`; con estas dos últimas `score_*`, `draws`, `valid` no representan un partido |
| 05 | `trajectory_fp` `fp_mode` | Huella de trayectoria; `incremental` (TRAYINC-MOTOR15-R1, world-essential) o `full` (TRAY-MOTOR12-R1). **No son intercambiables** y no se comparan entre sí |
| 06 | `points … pf` | Totales de equipo del acta (política del acta de cada partido: `ACTA-MOTOR15-R1` en el histórico, `ACTA-MOTOR15B-R1` en 15B). `stl` incluye el robo por balón suelto desde 15B |
| 07 | `kind` | `medición` (ejecutada), `estimación` (proyección lineal, **no** ejecutada), `declarada` (cifra citada), `objetivo` |
| 07 | `overlap_note` | Cómo se solapa la medida: el tiempo por trabajo con 4 workers no es la espera del usuario; `produccion_del_lote_por_encuentro_…` es ejecución/100, **no latencia**; las filas `cpu_*` son del perfil de CPU de un proceso (exclusivo o inclusivo) |
| 08 | `kind` | `igualdad misma versión`, `igualdad entre versiones`, `diferencia legítima MOTOR-15 → MOTOR-15B (solo crédito)`, `histórico …`, `no comparable` |
| 08 | `input` `versions` `effective_orders` `levels_modes` | Entradas, versión(es), órdenes efectivas y niveles o modos comparados |
| 08 | `fields_compared` `observer` | Campos realmente contrastados y observador (proyección) usado; un mismo observador en ambos lados |
| 08 | `result` `first_difference` `evidence` | `IGUAL`/`DIFERENTE`/`NO_EJECUTADO`; primera diferencia (vacía si IGUAL); archivo o prueba que lo sustenta |
| 09 | `universe` | `C15-normales (A)`, `C15-extremo (B)` o `histórico LOT-9e1cfb78`: **qué encuentros** sustentan cada fila (no un rótulo genérico de seis partidos) |
| 09 | `impl` `registro` `exposicion` `resultado` | Ejes AUD separados. «inconcluso» no es «conforme». AUD17 y AUD26 llevan numerador, denominador y casos en el informe de auditoría |
| 10 | `universe` `contrast_plus*` | Universo de la matriz; contraste +1/+3/+5 disponible y ejecutado |
| 11 | `contrast` | `contrastada` = por síntesis de ChatGPT (nunca lectura directa de Claude); las filas `SEM15:*` son probabilidades sin calibrar, **distintas** de las consecuencias normativas |
| 12 | `read_history` `replay` `continue` `edit` | Qué operaciones admite cada formato/perfil |
| 15 | `route` | `A_interaccion_organizada`, `B_avance_presionado`, `C_envio_forzado_de_saque`, `D_balon_suelto`, `TOTAL_EQUIPO` |
| 15 | `team_id` | Equipo **defensor** (el que acredita el robo) |
| 15 | `stage` `numerator` `denominator` `unit` | Etapa o métrica (decisiones, intentos, pérdidas atacantes, pérdidas vivas recuperadas sin crédito, balón fuera, robos acreditados, otras pérdidas sin robo posible, disputas de balón suelto y ganadas por la defensa). Las categorías exclusivas forman una partición de las pérdidas atacantes; `decisiones`/`intentos` son contadores solapados y no se suman a ellas |
| 15 | `before` `after` | Antes (MOTOR-15) y después (reejecución con MOTOR-15B) cuando existen; vacío si no hay «antes» comparable (C15-06) |
| 16 | `kind` | `positivo`, `exclusión`, `defecto corregido`, `observación (no corregida)`, `límite documentado (no corregido)`, `defecto latente corregido` |
| 16 | `provenance` | `natural`, `preparado`, reproducción o `límite del motor` |
| 17 | `source` `file` `bytes` `sha256` `included` `consumed_by` | Fuente/lote, archivo y su hash; si va incluido o referenciado (paquete base) y qué auditorías o comparaciones lo consumen |
