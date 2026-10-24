# SIM-MOTOR-04D · diccionario de columnas y convenciones

Valores `null` = no conservado, no instrumentado, no representado, no expuesto o no ejecutado (situaciones distintas, nunca cero). Un porcentaje de acierto se calcula siempre desde numeradores y denominadores **sumados**, no promediando porcentajes. Un **punto porcentual (pp)** es 0,01 de diferencia entre dos proporciones; un **porcentaje relativo** es `abs(SIM/DET − 1)`. No se confunden: 80 puntos con ±5 % relativo da 76–84; un 60 % de acierto con ±3 pp da 57–63 %.

## Identidades
- `DET` detallado congelado (MOTOR-18C, referencia `20261016`, 83–98 y 6.684 sorteos), mismas entradas y semillas que SIM.
- `C0_04C` código y perfil deportivo de 04C (candidata C04C-FINAL-PROVISIONAL). En DEV son los registros **auténticos** de 04C reutilizados (código 0.3.2-SIMMOTOR04C); en VAL04D se ejecuta con el código de 04D y el vector de 04C (trayectoria idéntica, comprobada).
- `D0_04D` / `Z0-A0` código de 04D con los seis mecanismos nuevos neutrales y el vector de 04C: control de la selección.
- `Zi-Aj` (Z0…Z8 × A0…A3) vectores completos de la búsqueda conjunta (§7 del encargo). `CAND` solo existe si la candidata difiere del control; si coincide, el alias es `C0_04C`.
- `C0_AUTH_04C` extra: las cuatro entradas DIAG de VAL04D ejecutadas en el árbol auténtico de 04C (comprobación de trayectoria; no es una condición de VAL).

## Claves de caso y semilla
`case_id`: `DEV-EQ01-EQ03-R1` (las 48 entradas VAL de 04C reutilizadas; correspondencia en `reused_from`), `VAL-EQ01-EQ04-R1` (VAL04D nueva), `CONTRAST-T01-V0-O1-R1` (las 16 entradas de 04C). `seed_key` de VAL04D = `20261024|SIM04D|VAL|<pareja-orientada>|R<réplica>`; `seed` = SHA-256 de la clave UTF-8, primeros 32 bits big endian (0 → 1); colisión real → sufijo `#2`, `#3`. La clave excluye condición, vector, resolutor, intento, worker y ruta. DEV y CONTRAST conservan las semillas de 04C.

## 04-AGENDA-Y-RECUENTO.csv
`section` count | case | incident. En `count`: solicitado, ejecutado, terminado, válido, no válido, fallido, interrumpido, reintento y no ejecutado por bloque, modelo e identidad; `reused_from` identifica registros reutilizados de 04C. Suite, navegador y benchmark son extras separados.

## 05-ACTA-EQUIPOS.csv (una fila por actuación de equipo; sin alias duplicados)
Conteos **reales** (`pts`, `fg2m/a`, `fg3m/a`, `ftm/a`, `oreb_total`, `dreb_total`, `ast_fg`, `ast_ft`, `ast_total`, `tov_total`, `stl`, `blk`, `pf`, `pfd`…) y, al final, el mismo conteo **normalizado a 40 minutos** (`<métrica>_40` = valor × 2400 / `duration_s`). `ast_total` = AST a canasta + AST a libres (total beM, nombrado). `controls_sim` (controles SIM), `possessions_beM` (posesiones del detallado) y `finalizations_sim` son universos distintos.

## 06-COMPARATIVA-ACTA.csv y 06b-M04D.json
Una fila por bloque (DEV/VAL), métrica y condición. `kind`: `count` (media por actuación a 40 min; `error` = `abs(SIM/DET − 1)`, banda 0,05), `rate` (acierto desde sumas completas; `error` = diferencia absoluta de proporciones, banda 0,03), `share` (cuota de FGA por zona; guarda funcional provisional de 0,03, **no** un ±3 % relativo fijado por Dennis), `forced` (proporción de intentos en calidad forzada; informativa). `status`: `ok`, `ceros_iguales`, `no_evaluado_relativo` (DET = 0 y SIM ≠ 0) o `sin_denominador`. `sim_ci95_*`/`det_ci95_*`: intervalo descriptivo por remuestreo de **partidos completos** (2.000 remuestreos deterministas, ambos equipos juntos); no es un contraste de hipótesis. `in_comparable_M04D` = 0 para las métricas del inventario de exclusiones (ORB, DREB, rebotes totales) y para la calidad forzada.
`M04D = max(error_relativo_conteos / 0,05 ; error_acierto / 0,03 ; error_cuota / 0,03)`; `M04D_comparable` omite el inventario de exclusiones; `M04D > 1` implica alguna banda incumplida. `eZ` = Σ de diferencias de cuota por zona (métrica histórica, informativa).

## 07-TIRO-Y-ZONAS.csv
`level` zona (`rim`, `inside`, `midrange`, `three`) o `contexto|zona`; intentos y aciertos de campo válidos (sin tiro anulado ni fallo con falta de tiro), cuota, porcentaje y proporción forzada. Los contextos nativos no se equiparan uno a uno (SIM: organized/transition/spontaneous/putback; detallado: organizado/transición/temprano/saque/continuidad).

## 08-REBOTES-Y-RECUPERACIONES.csv
Medias por actuación de equipo (equipo que tira) de: fallos de campo válidos sin tapón (`fg_miss_valid`), tapones (`blocked`, `blocked_out_of_bounds`, `blocked_live`), faltas de tiro fallidas sin intento (`shoot_foul_miss_no_fga`), últimos libres fallados con balón vivo (SIM), créditos por `causa|sentido|individual-colectivo` (`credits_field_off_ind` …; causa `block` = rebote tras tapón con balón vivo, solo existe en SIM) y fallos sin crédito por causa (`uncredited_*`, solo detallado, leídos de la secuencia; `other_or_not_reconstructible` incluye el tapón vivo y lo no reconstruible). `p_off_given_credited` = ORB / (ORB + DREB) entre créditos: probabilidad condicional entre oportunidades **con crédito**. SIM acredita todo fallo con oportunidad; el detallado no acredita rebote tras tapón con balón vivo ni tras expiración de posesión tras fallo.

## 09-ASISTENCIAS.csv
Universos **separados** de AST a canasta: `total`, `fuera_del_rebote`, `posterior_a_rebote_ofensivo` y, de este, `posterior_inmediata`, `posterior_reinicio`, `posterior_otra_rama`. En SIM los separa la rama decidida tras el rebote; en el detallado el primer rebote ofensivo de la posesión abre el universo «posterior» y la separación inmediata/reinicio es **aproximada** (contexto `continuidad` frente a otro). Las filas `embudo:<clase>` son la elegibilidad de pase final de SIM (oportunidades, elegibles, entregas, canastas elegibles y AST). AST a libres y total beM están en 05 (`ast_ft`, `ast_total`).

## 10-EQUIPOS-USO-Y-DISTRIBUCION.csv y 10b/10c/10d
Resúmenes por identidad, bloque, equipo y escenario (media, desviación típica muestral, mediana, p10, p90, mínimo y máximo; método de percentil R-7); bandas de puntos por actuación (<60, 60–69, 70–79, 80–89, 90–99, 100–109, ≥110); contrastes V1 − V0 de CONTRAST (misma semilla; señal de exposición, n pequeño).

## 11-SELECCION-DEV.json
Por vector: poblaciones (`sim`/`det`: medias reales y a 40 min, sumas de numeradores y denominadores, calidad forzada), errores por métrica, `M04D`, `M04D_comparable`, guardas frente a Z0-A0 y causa de descarte. El comprobador offline recalcula errores, máximos, guardas y elección desde esos numeradores.

## 12-RENDIMIENTO.json
Procesos independientes y secuenciales con 4 workers, 2.000 clubes (24.000 jugadores remapeados por agenda) y un partido por club: lote de mil del control, lote de mil de la candidata y jornada de mil final (3.000 ejecuciones). `distanceMs` = medido − objetivo.

## Conservación
Esencial de Referencia: identidad, marcador, acta por jugador y equipo, zonas, familias, denominadores, embudos (asistencia y rebote), presión y exposición. No conservado (declarado): quintetos, evolución y defensa por organización fuera del nivel Análisis.
