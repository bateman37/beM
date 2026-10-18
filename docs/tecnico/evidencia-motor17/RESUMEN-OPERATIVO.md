# Resumen operativo de MOTOR-17 (generado por `scripts/m17-summary.js` desde los archivos finales)

Sin ensayo deportivo: cantidades, estados y diferencias mecánicas. Interpretación y comparación externa: ChatGPT. Aceptación de las candidatas: Dennis y ChatGPT.

## 1 · Base real
| Etapa | Commit |
|---|---|
| R0 (MOTOR-15B, código) | `6a6814c619e6fc9451a5927ed6df9ed83079f795` |
| A17 (correcciones) | `a81c28d74f38ba6096ef34e049535d8894a3d2a3` + `e4a780ac7cc45281e18cace9f8d7f7040fb76e69` (corrección hallada con la candidata) |
| P17 (optimización exacta) | `a3caed633d7df3e5b1af73e1fa7604874ffd4ff7` + `bc8b916ddc7e9b064f779182a7f0ad704d467d99` |
| **R17 (código de la campaña)** | `fd75554fe5f8ecea9af02525ef93ca2c6910f5b5` (Git limpio en la congelación: true); perfil efectivo `…5-20261017+SEM-MOTOR15B-20261017+SEM-MOTOR17-20261018+C17-02` (candidata **C17-02**) |

Motor R17 `beM-motor-0.17.0-MOTOR17`, política `EST-MOTOR17-R1` / `ACTA-MOTOR17-R1`; R0 `beM-motor-0.15.1-MOTOR15B`, `EST-MOTOR15B-R1`. Entradas idénticas entre versiones: **true**. Node v22.22.0, 4 CPU (Intel(R) Xeon(R) Processor @ 2.80GHz), 16 GiB.

## 2 · Campaña de cierre `MOTOR17-CIERRE-20261018` (cantidades reales)
| Bloque · propósito | R0 | R17 |
|---|---:|---:|
| A · principal | 132 | 132 |
| B · principal | 48 | 48 |
| C · principal | 24 | 24 |
| D · principal | 20 | 20 |
| **Comparación principal** | **224** | **224** |
| Repeticiones diagnósticas (completo, relato omitido) | 12 | 12 |
| Benchmarks reales (100 + 200) | 300 | 300 |

Ejecuciones físicas de cierre: **472** (+ 600 de coste). Todas terminadas y válidas: **sí**; fallos conservados: 0; reintentos: 0. Diagnóstico frente a principal (mismas entradas y semilla con otro nivel de registro): 24 pares, mismo marcador 24, mismos sorteos 24, mismos hechos 24.
**Declaración de semillas:** el espacio de A del prompt (270000000) se usó en lecturas exploratorias de R0 durante el desarrollo; se cambió a 271000000 + 1000·p + 1 antes de abrir resultados. **Revisión B de R17:** tras abrir la primera pasada se vio que la sensibilidad de MEN02/MEN03 y FIS06 seguía aproximada; se registró el tope en su punto de consumo y se re-ejecutó TODO R17 (trayectorias idénticas: mismo digest de resultados en los benchmarks); la primera pasada se conserva identificada y no se usa.

## 3 · Defectos resueltos (hipótesis en `02-HIPOTESIS.csv`; cambios en `03-TABLA-DE-CAMBIOS.csv`)
Crédito de robo con criterio único (en los 24 casos de desarrollo: 2.63 → 7.31 robos por equipo con las mismas pérdidas; en los diagnósticos de cierre, pérdidas vivas con crédito R0 51/171 frente a R17 190/195); cierre de las nueve cadenas de saque (9 → 0 abiertas, hechos y sorteos idénticos); identidad global y `matches` de capacidades (R0 leído con lector R0: máximo 2; con lector R17: 12); `team_index` explícito (sin nulos en — filas de jugador); sensibilidad con tope registrado: R17 {"exacta":2304} frente a R0 con lector R17 {"aproximada":1293,"exacta":1011}; `resumen.json` de cada lectura; responsabilidad obsoleta tras un relevo en la posesión (excepción de un partido de cien con la candidata).

## 4 · Cambios numéricos (propuesta, sin aceptación deportiva)
| Fila | Base | C17-01 | C17-02 (elegida para R17) |
|---|---:|---:|---:|
| `energy.costPerLiveMinute` | 2 | 3 | 3,5 |

Muestra de desarrollo (24 encuentros por perfil; `resultados-desarrollo.csv`): energía final media 82.4 / 72.2 / 67.5; actuaciones de equipo con un jugador de 40:00 87.5 % / 17.5 % / 0.0 %; minutos máximos medios 39.8 / 37.2 / 34.5. Selección y criterios: `docs/tecnico/motor17.md` §6.1.

## 5 · Comparación mecánica R0 → R17 (casos emparejados, bloques A–D, `09-COMPARACION-R0-R17.csv`)
| Métrica | n pares | R0 | R17 | R17 − R0 |
|---|---:|---:|---:|---:|
| pts (puntos por equipo) | 224 | 84.949 | 84.011 | -0.938 |
| efg (razón) | 224 | 0.612 | 0.606 | -0.006 |
| fga (intentos) | 224 | 60.109 | 59.949 | -0.161 |
| fta (intentos) | 224 | 14.386 | 14.234 | -0.152 |
| reb (rebotes) | 224 | 25.708 | 25.911 | 0.203 |
| ast (asistencias) | 224 | 22.868 | 22.473 | -0.395 |
| tov (pérdidas) | 224 | 10.638 | 10.683 | 0.045 |
| stl (robos) | 224 | 2.246 | 7.165 | 4.920 |
| pf (faltas) | 224 | 12.826 | 12.824 | -0.002 |
| players_40min (jugadores de 40:00 por actuación de equipo (sin prórroga)) | 213 | 1.246 | 0.002 | -1.244 |
| max_player_min (minutos del jugador con más minutos) | 213 | 39.651 | 35.041 | -4.610 |
| dnp_players (jugadores sin participar por actuación de equipo) | 213 | 3.418 | 2.092 | -1.326 |

Efecto combinado de código y candidata: no aísla causas. Dos semillas por mecanismo o familia no certifican efectos universales; las repeticiones técnicas no amplían la muestra deportiva.

## 6 · Auditorías AUD01–32 por versión (sobre los doce diagnósticos de cada una; nunca mezcladas)
| Lectura | Conformes | Inconclusas | AUD17 | AUD26 | AUD29 | `matches` máx. | Sensibilidad (filas · exactitud) |
|---|---:|---:|---|---|---|---:|---|
| R0-lectorR0 (lector PRJ-MOTOR15B-R1) | 16 | 16 | inconcluso | conforme | conforme | 2 | 2304 · {"(columna ausente en el lector anterior)":2304} |
| R0-lectorR17 (lector PRJ-MOTOR17-R1) | 16 | 16 | inconcluso | conforme | conforme | 12 | 2304 · {"aproximada":1293,"exacta":1011} |
| R17-lectorR17 (lector PRJ-MOTOR17-R1) | 17 | 15 | conforme | conforme | conforme | 12 | 2304 · {"exacta":2304} |

Un «inconcluso» no se cambia: AUD05 y AUD09 siguen sin exposición suficiente en las dos versiones.

## 7 · Rendimiento (trabajos reales, proceso nuevo, 4 workers, `world-essential`)
| Versión · trabajo | Pared despacho→último persistido | Total desde el proceso | Partidos/s (pared) | Válidos | Pico RSS (proceso completo) |
|---|---:|---:|---:|---:|---:|
| R0-100 | 34.2 s | 34.8 s | 2.9 | 100/100 | 496 MiB |
| R0-200 | 60.5 s | 61.2 s | 3.3 | 200/200 | 523 MiB |
| R17-100 | 30.2 s | 30.8 s | 3.3 | 100/100 | 606 MiB |
| R17-200 | 60.8 s | 61.5 s | 3.3 | 200/200 | 640 MiB |

Variación entre pasadas del MISMO trabajo (todas las medidas reales hechas, `coste/repeticiones.json`): R0-100: 31.8 / 34.2 s · R0-200: 62.8 / 60.5 s · R17-100: 30 / 32.9 / 30.2 s · R17-200: 51.3 / 56.8 / 60.8 s — el margen es de ≈ ±10 %, de modo que la diferencia R0/R17 se lee con él.

**Objetivo de cien en cinco segundos: NO alcanzado** (R17: 30.2 s de pared, 30.8 s con arranque; R0: 34.2 s). Doscientos: medición real (no extrapolación). Mejora exacta A17f→P17 (misma versión de perfil, cuatro pasadas alternadas): 31.6 s → 29.3 s (7.4 %); la comparación global R0/R17 incluye el efecto de la candidata sobre el número de decisiones y sustituciones y no aísla la optimización.

## 8 · Equivalencia
A17f↔P17 (mismas entradas, perfil y observador; hechos con `calc`/`params`, acta, estados, dirección, reloj, marcador, energía, sorteos, cadenas, memoria y huellas TRAY/TRAYINC): **iguales** en 8 entradas de desarrollo (d = 1…8, r = 1) × 32 ejecuciones (diagnóstico completo y mínimo). `npm run equivalence` (modalidades, velocidades x2–x16, registro y continuaciones): informe en `09-EQUIVALENCIA/`, AUD29 conforme. Referencia histórica 20261016 (planes históricos): R0 (6a6814c, perfil MOTOR-15B): 83–98, 6684 sorteos · P17 base (código final, sin candidata): 83–98, 6684 sorteos · R17 (código final + C17-02): 97–83, 6506 sorteos · R17 con C17-01 (candidata no elegida): 80–84, 6493 sorteos.

## 9 · Comprobaciones
Suite `npm test`: 208/208 (fallos 0); `data:check`: correcto; comprobador documental: RESULTADO: 2 comprobaciones fallidas.; recorrido de navegador (Chromium): 15/16 pasos, consola 1, red 0; recuperación de perfil anterior: 16 pasos correctos; verificación mecánica de la entrega: pendiente. **No ejecutado:** otros navegadores, Node 24, lectura directa de FIBA, recorrido manual de Dennis.

## 10 · Pendientes
Objetivo de coste de 5 s (coste pendiente, sin segundo motor); aceptación deportiva de C17-02 (propuesta); calibración externa; interpretación de producto del crédito de recogida sin intervención (función aislada, reversible); H11 y H12 sin resolver (datos para ChatGPT); aceptación manual de Dennis.
