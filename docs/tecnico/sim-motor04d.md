# SIM-MOTOR-04D · aproximación del acta al detallado: ±5 % en estadísticas y ±3 puntos porcentuales en acierto

Estado: **ejecutado, pendiente de Dennis**. Nada de lo que sigue está «calibrado», «estadísticamente equivalente», «aceptado por Dennis», «conforme FIBA integralmente» ni es un «motor cerrado». Encargo archivado en [`../prompts/SIM-MOTOR-04D-acta-y-tiro.md`](../prompts/SIM-MOTOR-04D-acta-y-tiro.md); recorrido manual en [`../prompts/SIM-MOTOR-04D-recorrido-manual.md`](../prompts/SIM-MOTOR-04D-recorrido-manual.md); diccionario en [`evidencia-sim-motor04d/DICCIONARIO.md`](evidencia-sim-motor04d/DICCIONARIO.md). **Sustituye** las decisiones de búsqueda y bandas de 04C (búsqueda secuencial R→I→P con `M` de ocho errores y bandas heterogéneas) por una búsqueda conjunta de vectores completos con `M04D`; las demás reglas de 04C se conservan.

## 1. Alcance y versiones
- Aplicación `SIM-MOTOR-04D` (incluye 04C, 04B, 04, 03 y 02B) · SIM `0.3.3-SIMMOTOR04D` · extensión de filas `SEM-SIM04D-20261024` · perfil `SEM-SIM01+SEM-SIM02+SEM-SIM04+SEM-SIM04B+SEM-SIM04C+SEM-SIM04D` · cobertura `COV-SIM04D-R1` · conciliación `RECON-SIM04D-R1` (27 comprobaciones, sin cambio de contenido) · resultado `beM-sim-match/3` y guardado `beM-sim-snapshot/2` (campos sin cambio). Los guardados de 04C se **rechazan para continuación** con su explicación y sin tocar el archivo (`tests/fixtures/sim-snapshot-04c.json` es un guardado real generado con el código de 04C).
- **Detallado sin cambio**: `src/match`, `src/population`, `src/knowledge` y `data/match` idénticos a `main` (79 archivos; referencia `20261016`, 83–98 y 6.684 sorteos). Las 32 capacidades, estilos, libro, roles, director, conocimiento congelado y aprendizaje al terminar no cambian.
- PR #22 estaba fusionada: la rama se reinició desde `main` actualizado (merge `0dad893`) y esta entrega es una PR nueva.

## 2. Qué cambia
| Id | Tipo | Cambio |
|---|---|---|
| D04-01a | lectura | La continuación inmediata tras rebote ofensivo (`src: putback`) se atribuye a la familia `putback`, no a la ficha POS cuya celda aproxima el tiro (la celda conserva `playId` como procedencia interna). Cubre tiros, canasta con falta, falta de tiro sin intento y serie de libres ligada. **No cambia participantes, decisiones, probabilidades ni sorteos.** En los 48 casos DEV: `putback` 166 → 451 FGA y fichas POS 3.116 → 2.831 (285 desplazados, FGA total 5.789 en ambos). El reinicio organizado conserva su ficha. |
| D04-01b | lectura | `diag-context` lee la asistencia del detallado del **crédito del acta**; columnas separadas de pasador representado, elegibilidad, entrega y AST acreditada; AST a libres y total beM nombrados. |
| D04-02 | lectura | Instrumentos de oportunidades y créditos de rebote (ver §4), de universos de AST (§7) y del denominador elegible del robo. **No se aplica ninguna corrección deportiva** (sin defecto demostrado). |
| D04-03 | filas | Seis filas SIM neutrales (§3) y reapertura de `assist.receivedAdvantageP0` en [0, 1]. |
| D04-05 | búsqueda | 36 vectores completos (9 × 4) sobre DEV; ver §5. |

### Filas nuevas (neutrales; semillas de evaluación SIM, sin calibración externa)
| Ruta | Neutral | Rango | Aplicación única |
|---|---:|---:|---|
| `shotMix.midrangeWeightFactor` | 1 | 0,25–2 | peso de las celdas de media existentes, una vez por contexto, masa conservada, sin crear celdas |
| `conversion.simRimLogitOffset` | 0 | 0–0,25 | desplazamiento del logit al aro **y** de su estimación previa (misma traducción, una vez); inside, media y triple intactos |
| `outcomes.simOrdinaryTurnoverWeightFactor` | 1 | 0,6–1,2 | peso de la pérdida ordinaria `wTo` antes del peso adicional de la presión y de normalizar terminales |
| `outcomes.simStealGivenEligibleTurnoverLogit` | 0 | 0–1 | robo condicionado a una pérdida que ya admite el crédito (`to` y `lb`); no convierte falta ofensiva ni violación en robo |
| `outcomes.simShootingFoulWeightFactor` | 1 | 0,8–1,3 | peso de la falta en tiro `wSf` antes de normalizar; la razón de faltas no terminales usa el mismo total |
| `assist.spontaneousPassOddsFactor` | 1 | 1–2 | `odds(p') = odds(p) × factor` sobre `derived.spontaneous.passShare` (extremos 0/1 intactos); solo la entrega espontánea |

No se reutilizó ninguna fila equivalente (no existía ninguna con ese alcance). `assist.receivedAdvantageP0` ya existía (rango pasa de [0, 1) a [0, 1]); no se reclasificó ninguna salida del catálogo (sin fundamento de ficha/rol que lo justifique).

## 3. Neutralidad y pruebas
- Con las seis filas neutrales (por defecto o explícitas) la trayectoria es **idéntica** a la de 04C: huellas y sorteos de seis combinaciones obtenidos con el código de 04C (`S04D-01`) y los **48/48** casos DEV frente a los registros auténticos de 04C (huella deportiva, acta, zonas, embudos y sorteos); cuatro entradas más en el árbol auténtico de 04C sobre VAL04D.
- `tests/sim04d.test.js` (S04D-01…08): neutralidad; atribución `putback`/POS incluidos libres y canasta con falta; AST acreditada frente a mero pasador con un detallado real y universos de AST; oportunidades y créditos de rebote conciliados sin duplicados (SIM) y con causas de no crédito (detallado); mezcla de media (masa conservada, razones, sin celdas nuevas) y offset de aro (una vez, estimación previa, resto de zonas intactas); terminales normalizados, robo solo en pérdida elegible con autor del rival, entrega espontánea sin autocompañero ni crédito fabricado; selector (relativo frente a pp, ceros, sin denominador, control único, vectores completos, rechazo de una mejora agregada que daña una métrica ya dentro de banda, desempate); guardado/recuperación con las filas activas, público sin futuro y rechazo del guardado real de 04C.
- Resultado de la comprobación: `npm test` completa **358/360** después del último cambio de implementación y versiones; los dos fallos (S01-05 y S04-08) eran expectativas de identidad que no incluían `SEM-SIM04D`, no regresiones deportivas. Se corrigieron y se reejecutaron solo `sim01`, `sim04`, `sim04b`, `sim04c` y `sim04d` (45/45): **no se declara una segunda suite completa verde**. `data:check` correcto; comprobador documental correcto en copia limpia; Chromium 16 pasos (consola 0, red 0). Identidad del punto de partida de §3 del encargo: las 16 medias reales de 04C se reproducen exactamente (puntos 77,9375 / 82,4375 …).
- Defecto propio hallado al comprobar la neutralidad (un reemplazo dejó `M.pStealOob` dentro de un comentario): corregido antes de congelar, con el control de huellas como detector.

## 4. D04-02 · rebotes: oportunidades y créditos (sin corrección deportiva)
Diferencia de código comprobada: en el detallado (`src/match/actions.js::resolveBlocked`) un tapón con balón vivo se resuelve como recuperación de control (de la defensa con probabilidad `blockedLooseControlDefenseProbability` o del ataque) **sin crédito de rebote**; una expiración de posesión tras un fallo tampoco recibe crédito. En SIM todo fallo con oportunidad produce un crédito (el tapón vivo pasa por `_rebound(cause='block')`). Datos de VAL04D (192 actuaciones de equipo por modelo; medias por actuación del equipo que tira):

| Concepto | DET | SIM (C0_04C ≡ D0_04D) |
|---|---:|---:|
| Fallos de campo válidos sin tapón | 25,04 | 27,97 |
| Tapones (fuera / balón vivo) | 2,09 (0,41 / 1,68) | 2,56 (0,63 / 1,94) |
| Faltas de tiro fallidas sin FGA | 3,76 | 3,37 |
| Últimos libres fallados con balón vivo | n/c | 1,13 |
| Créditos de rebote (campo + tapón + libre) | 24,79 | 31,04 |
| ORB / DREB créditos | 6,84 / 17,95 | 8,80 / 22,23 |
| Fallos sin crédito (expiración · final de periodo · balón fuera · otras/tapón vivo) | 1,53 · 0,21 · 0,42 · 1,58 (3,74) | 0 |
| **P(ORB \| rebote acreditado)** | **27,6 %** | **28,4 %** |

Clasificación con evidencia: **no es un fallo normativo demostrado** (c20-p03 §20.13: «el desenlace del balón después del tapón se determina aparte»; no fija el crédito) y el criterio del detallado puede resultar dudoso, pero el repositorio no contiene una regla que fije el crédito; no se modifica el detallado ni se reducen rebotes legítimos de SIM. Se conservan ambos conteos; ORB, DREB y rebotes totales quedan **fuera de `M04D_comparable`** y su criterio queda **pendiente de decisión**. Dato útil: la probabilidad condicional de ORB entre rebotes acreditados coincide (27,6 % frente a 28,4 %); el exceso de rebotes de SIM viene del **volumen** de oportunidades (más fallos y tapones) y de los créditos extra, no de la fuerza del rebote ofensivo.

## 5. Búsqueda conjunta (solo DEV conocido; reglas congeladas antes)
Reglas `SEL-SIM04D-R1`, los 36 vectores completos, la agenda y el hash (`selectionRulesSha256` = `e5fa2d6c…`) se congelaron en el commit `74f3fdb` **antes** de ejecutar DEV (`plan/freeze-dev.json`); tras DEV se verificó que nada deportivo cambió (`freeze-dev-verify-at-val.json`). DEV son las 48 entradas VAL de 04C (conocidas y ya analizadas: **no es una reserva independiente**), mismas semillas por caso entre vectores y detallado reutilizado.

`M04D = max(error_relativo_conteos/0,05; error_acierto/0,03; error_cuota_zona/0,03)`. Como el criterio de crédito de rebote es una discrepancia demostrada, `M04D` completo se conserva como **no evaluable** y se selecciona con `M04D_comparable` (sin ORB, DREB ni rebotes totales). Guardas uniformes frente al control Z0-A0 (conteo `max(0,05; e0+0,02)`, acierto `max(0,03; e0+0,005)`, cuota `max(0,03; e0+0,01)`, calidad forzada +0,02).

| Control Z0-A0 (= vector de 04C) | Valor |
|---|---:|
| `M04D_comparable` DEV | **4,788** (dominante AST a canasta, 23,9 % frente a ±5 %) |
| `M04D` completo (no evaluable) | 6,405 (dominante DREB) |
| Mejor vector descartado | Z8-A2: 2,160 (guardas: FGA 5,9 % > 5,0 %, 3P% 4,2 pp > 3,5 pp, cuota inside 6,5 pp > 3,1 pp) |

**Resultado: ningún vector admisible; se conserva el control.** Los paquetes de circulación y terminales (A1–A3) reducen M (hasta 2,16–2,38) pero dañan métricas que el control tenía dentro de banda (cuota inside, FGA, 3P%, faltas) y los pesos de aro ≥ 2 desplazan la cuota inside. Mejores descartados con su causa exacta: Z8-A2, Z8-A3 (2,166), Z5-A3 (2,215), Z6-A2 (2,373), Z1-A3 (2,384), Z6-A1 (2,426); la tabla completa (36 filas, causa de cada descarte, numeradores) está en `11-SELECCION-DEV.json`. No se añadieron rondas ni se combinaron ganadores. **`C04D-FINAL-PROVISIONAL` = Z0-A0 (alias de D0_04D y, en trayectoria, de C0_04C)**, no activada por defecto.

DEV · control Z0-A0 frente al detallado (48 casos, 96 actuaciones por modelo; medias normalizadas a 40 min y reales):

| Métrica | DET (40 min) | SIM (40 min) | Δ | Error | Banda | Estado | DET real | SIM real |
|---|---:|---:|---:|---:|---:|---|---:|---:|
| Puntos | 82.44 | 77.58 | -4.86 | 5.9 % | 5 % | FUERA | 82.44 | 77.94 |
| FGM | 31.17 | 29.22 | -1.95 | 6.2 % | 5 % | FUERA | 31.17 | 29.35 |
| FGA | 58.36 | 60.00 | +1.63 | 2.8 % | 5 % | dentro | 58.36 | 60.30 |
| 2PM | 23.02 | 20.43 | -2.59 | 11.3 % | 5 % | FUERA | 23.02 | 20.52 |
| 2PA | 38.61 | 37.03 | -1.58 | 4.1 % | 5 % | dentro | 38.61 | 37.23 |
| 3PM | 8.15 | 8.79 | +0.64 | 7.9 % | 5 % | FUERA | 8.15 | 8.83 |
| 3PA | 19.75 | 22.96 | +3.21 | 16.3 % | 5 % | FUERA | 19.75 | 23.07 |
| FTM | 11.96 | 10.35 | -1.61 | 13.4 % | 5 % | FUERA | 11.96 | 10.40 |
| FTA | 14.29 | 12.55 | -1.74 | 12.2 % | 5 % | FUERA | 14.29 | 12.60 |
| ORB | 7.16 | 8.81 | +1.65 | 23.1 % | 5 % | FUERA · excluida de comparable | 7.16 | 8.84 |
| DREB | 17.15 | 22.64 | +5.49 | 32.0 % | 5 % | FUERA · excluida de comparable | 17.15 | 22.77 |
| Rebotes totales | 24.30 | 31.44 | +7.14 | 29.4 % | 5 % | FUERA · excluida de comparable | 24.30 | 31.61 |
| AST a canasta | 21.06 | 16.02 | -5.04 | 23.9 % | 5 % | FUERA | 21.06 | 16.10 |
| AST a libres | 2.29 | 1.89 | -0.40 | 17.6 % | 5 % | FUERA | 2.29 | 1.90 |
| AST total beM (canasta + libres) | 23.35 | 17.91 | -5.45 | 23.3 % | 5 % | FUERA | 23.35 | 18.00 |
| Pérdidas totales | 10.62 | 12.98 | +2.35 | 22.1 % | 5 % | FUERA | 10.62 | 13.03 |
| Robos | 7.39 | 6.51 | -0.87 | 11.8 % | 5 % | FUERA | 7.39 | 6.54 |
| Tapones | 2.43 | 2.20 | -0.23 | 9.5 % | 5 % | FUERA | 2.43 | 2.21 |
| Faltas cometidas | 12.80 | 12.28 | -0.52 | 4.1 % | 5 % | dentro | 12.80 | 12.33 |
| Faltas recibidas | 12.79 | 12.28 | -0.51 | 4.0 % | 5 % | dentro | 12.79 | 12.33 |
| Campo | 53.40 % | 48.68 % | -4.72 pp | 4.72 pp | 3 pp | FUERA | — | — |
| Dos | 59.62 % | 55.12 % | -4.50 pp | 4.50 pp | 3 pp | FUERA | — | — |
| Tres | 41.24 % | 38.28 % | -2.96 pp | 2.96 pp | 3 pp | dentro | — | — |
| Libres | 83.67 % | 82.48 % | -1.19 pp | 1.19 pp | 3 pp | dentro | — | — |
| Aro | 64.84 % | 58.93 % | -5.91 pp | 5.91 pp | 3 pp | FUERA | — | — |
| Inside sin aro | 56.83 % | 57.61 % | +0.78 pp | 0.77 pp | 3 pp | dentro | — | — |
| Media distancia | 40.40 % | 40.22 % | -0.18 pp | 0.18 pp | 3 pp | dentro | — | — |
| Cuota aro | 37.71 % | 31.34 % | -6.37 pp | 6.38 pp | 3 pp | FUERA | — | — |
| Cuota inside | 21.29 % | 19.19 % | -2.10 pp | 2.10 pp | 3 pp | dentro | — | — |
| Cuota media | 7.16 % | 11.21 % | +4.05 pp | 4.05 pp | 3 pp | FUERA | — | — |
| Cuota triple | 33.84 % | 38.26 % | +4.42 pp | 4.42 pp | 3 pp | FUERA | — | — |

## 6. VAL04D (96 encuentros nuevos; no elige ni reajusta)
Doce parejas × dos orientaciones × cuatro réplicas (16 actuaciones por equipo), fichas y planes naturales; semillas `20261024|SIM04D|VAL|<pareja-orientada>|R<réplica>` (0 colisiones). Condiciones: detallado congelado, `C0_04C` (código y perfil de 04C; ejecutado con el código de 04D y el vector de 04C, trayectoria idéntica comprobada) y la candidata, que **coincide con el control** (alias: no se duplican registros; 96 DET + 96 SIM). `M04D_comparable` = **4,587** (dominante tapones, 22,9 %); `M04D` completo 5,825 (no evaluable). **M04D > 1: siguen incumplidas** las bandas listadas (todas las marcadas FUERA):

| Métrica | DET (40 min) | SIM (40 min) | Δ | Error | Banda | Estado | DET real | SIM real |
|---|---:|---:|---:|---:|---:|---|---:|---:|
| Puntos | 83.47 | 78.43 | -5.04 | 6.0 % | 5 % | FUERA | 83.91 | 78.51 |
| FGM | 31.25 | 29.55 | -1.70 | 5.4 % | 5 % | FUERA | 31.42 | 29.59 |
| FGA | 58.23 | 60.04 | +1.81 | 3.1 % | 5 % | dentro | 58.55 | 60.12 |
| 2PM | 22.33 | 20.38 | -1.95 | 8.7 % | 5 % | FUERA | 22.44 | 20.41 |
| 2PA | 37.16 | 37.33 | +0.17 | 0.4 % | 5 % | dentro | 37.34 | 37.38 |
| 3PM | 8.92 | 9.18 | +0.25 | 2.8 % | 5 % | dentro | 8.98 | 9.18 |
| 3PA | 21.07 | 22.72 | +1.65 | 7.8 % | 5 % | FUERA | 21.20 | 22.74 |
| FTM | 12.03 | 10.14 | -1.89 | 15.7 % | 5 % | FUERA | 12.09 | 10.15 |
| FTA | 14.83 | 12.33 | -2.49 | 16.8 % | 5 % | FUERA | 14.90 | 12.35 |
| ORB | 6.81 | 8.79 | +1.98 | 29.1 % | 5 % | FUERA · excluida de comparable | 6.84 | 8.80 |
| DREB | 17.85 | 22.20 | +4.35 | 24.4 % | 5 % | FUERA · excluida de comparable | 17.95 | 22.23 |
| Rebotes totales | 24.66 | 30.99 | +6.33 | 25.7 % | 5 % | FUERA · excluida de comparable | 24.79 | 31.04 |
| AST a canasta | 20.76 | 16.22 | -4.54 | 21.9 % | 5 % | FUERA | 20.86 | 16.23 |
| AST a libres | 2.09 | 1.82 | -0.27 | 13.0 % | 5 % | FUERA | 2.10 | 1.82 |
| AST total beM (canasta + libres) | 22.85 | 18.04 | -4.81 | 21.1 % | 5 % | FUERA | 22.97 | 18.06 |
| Pérdidas totales | 10.68 | 12.81 | +2.14 | 20.0 % | 5 % | FUERA | 10.73 | 12.83 |
| Robos | 7.72 | 6.47 | -1.25 | 16.2 % | 5 % | FUERA | 7.76 | 6.48 |
| Tapones | 2.08 | 2.56 | +0.48 | 22.9 % | 5 % | FUERA | 2.09 | 2.56 |
| Faltas cometidas | 13.30 | 12.32 | -0.98 | 7.4 % | 5 % | FUERA | 13.36 | 12.33 |
| Faltas recibidas | 13.30 | 12.32 | -0.98 | 7.4 % | 5 % | FUERA | 13.36 | 12.33 |
| Campo | 53.66 % | 49.21 % | -4.45 pp | 4.45 pp | 3 pp | FUERA | — | — |
| Dos | 60.08 % | 54.59 % | -5.49 pp | 5.49 pp | 3 pp | FUERA | — | — |
| Tres | 42.35 % | 40.37 % | -1.98 pp | 1.98 pp | 3 pp | dentro | — | — |
| Libres | 81.19 % | 82.20 % | +1.01 pp | 1.01 pp | 3 pp | dentro | — | — |
| Aro | 65.11 % | 60.02 % | -5.09 pp | 5.08 pp | 3 pp | FUERA | — | — |
| Inside sin aro | 57.47 % | 55.06 % | -2.41 pp | 2.41 pp | 3 pp | dentro | — | — |
| Media distancia | 43.11 % | 38.30 % | -4.81 pp | 4.81 pp | 3 pp | FUERA | — | — |
| Cuota aro | 35.92 % | 32.03 % | -3.89 pp | 3.90 pp | 3 pp | FUERA | — | — |
| Cuota inside | 20.37 % | 18.93 % | -1.44 pp | 1.44 pp | 3 pp | dentro | — | — |
| Cuota media | 7.49 % | 11.22 % | +3.73 pp | 3.73 pp | 3 pp | FUERA | — | — |
| Cuota triple | 36.22 % | 37.83 % | +1.61 pp | 1.61 pp | 3 pp | dentro | — | — |

Calidad forzada (informativa): aro 10,2 % frente a 6,3 % en el detallado; inside 12,4 % frente a 0,6 %. Puntos por actuación: ver `10-EQUIPOS-USO-Y-DISTRIBUCION.csv` (bandas <60 … ≥110, desviación, prórrogas) y `06-COMPARATIVA-ACTA.csv` (intervalos descriptivos por remuestreo de partidos completos).

## 7. Asistencias: cuatro universos separados (VAL04D, AST a canasta)
| Universo | DET FGM / AST (tasa) | SIM FGM / AST (tasa) |
|---|---:|---:|
| Total | 6.032 / 4.006 (66,4 %) | 5.681 / 3.117 (54,9 %) |
| Fuera del rebote | 5.465 / 3.658 (66,9 %) | 4.943 / 2.954 (59,8 %) |
| Posterior a rebote ofensivo (cualquier rama) | 567 / 348 (61,4 %) | 738 / 163 (22,1 %) |
| · inmediata | 137 / 54 (39,4 %)* | 495 / 0 (0 %) |
| · reinicio organizado | 430 / 294 (68,4 %)* | 243 / 163 (67,1 %) |

*Correspondencia **aproximada** en el detallado (contexto `continuidad` frente a otro tras el primer rebote ofensivo de la posesión); en SIM la separan la rama decidida. El 74,3 % de 04C (solo la rama de reinicio) no representa todas las canastas posteriores a ORB: el universo completo está en 22,1 % frente a 61,4 %, y fuera del rebote en 59,8 % frente a 66,9 %. AST a libres y total beM se mantienen nombrados en `05-ACTA-EQUIPOS.csv`.

## 8. Rendimiento (honesto; 3.000 ejecuciones)
Procesos independientes y secuenciales, 4 workers, 2.000 clubes (24.000 jugadores remapeados), un partido por club. **Máquina de esta sesión, más lenta que la de 04C** (no comparable con sus cifras absolutas): control `C04C` (código auténtico de 04C) y candidata en la misma máquina.

| Medida | Control C0_04C | Candidata 04D | Objetivo | Distancia (04D) |
|---|---:|---:|---:|---:|
| Lote de mil (primera solicitud, pool preparado) | 13.872 ms | 14.009 ms (+1,0 %) | 5.000 | +9.009 ms |
| Apertura continua hasta datos | 18.928 ms | 18.955 ms | — | informativa |
| Jornada de mil: publicación máxima / mediana / p95 | — | 2.310 / 793 / 2.083 ms | 1.000 máx | +1.310 ms |
| Jornada de mil: RSS máximo | — | 1.548,7 MiB | 1.536 MiB | +12,7 MiB |

**Ningún objetivo se cumple**; no se abrió otra optimización. La diferencia entre control y candidata (+1,0 %) es pequeña y no se atribuye a una fila sin medición aislada. Nota de unidades: 1.540,5 MiB de 04C = 1,5044 GiB (exceso histórico de 4,5 MiB sobre 1,5 GiB), no 1,54 GiB; y VAL de 04C incluía doce equipos.

## 9. Límites y decisiones
Ver `14-LIMITES-Y-DECISIONES.md` del paquete rápido. **No** se toma ninguna decisión de producto. Preguntas para Dennis/ChatGPT: (1) criterio de crédito de rebote tras tapón con balón vivo y tras expiración (decidir si cambia el detallado o SIM; hasta entonces, métrica no comparable); (2) aceptar el control de 04C como referencia provisional o autorizar otra ronda con guardas distintas (las guardas uniformes bloquean todas las combinaciones que mejoran el máximo); (3) objetivo de rendimiento con miles de clubes. Aplicación apta solo para desarrollo local (`DEC-019`).

## 10. Entrega
Fuera de Git, en `out/sim-motor04d/entrega-final/`: `SIM-MOTOR-04D-revision-rapida.zip` (≤ 3 MiB), `SIM-MOTOR-04D-evidencia-detallada.zip` (partes ≤ 60 MiB con índice), `SIM-MOTOR-04D-indice-partes.json` y `SIM-MOTOR-04D-verificacion-final.json`. El comprobador offline (`scripts/sim04d/verify-delivery.js`) lee los ZIP, comprueba hashes, semillas y entradas, recalcula errores, `M04D`, guardas y elección desde numeradores, la atribución `putback`, los embudos de rebote y de robo, el vector realmente aplicado y la neutralidad, y rechaza una copia alterada y un numerador incoherente; no simula. Pequeña evidencia en Git: [`evidencia-sim-motor04d/`](evidencia-sim-motor04d/README.md).
