# SIM-MOTOR-01 — resumen operativo de la evidencia

Generado desde el `00-LEEME.md` del paquete `SIM-MOTOR-01-revision-rapida.zip` (fuera de Git: `out/sim-motor01/entrega-final/`). Las cifras salen de las ejecuciones reales B01/B02/B03; el detalle completo vive en los paquetes.

Generador estadístico por tramos (`beM-sim-segment` 0.1.0-SIMMOTOR01, resultado `beM-sim-match/1`, perfil `SEM-SIM01-20261022`). Commit de código comprobado: `4f5cb8c` (cabeza `4f5cb8c`; base `606c33b` = main tras la PR #20, sin dependencia de 18C pendiente).

## Orden de lectura
1. Este archivo → 2. `02-ALCANCE.csv` → 3. `09-RENDIMIENTO.json` y `08-RESULTADOS.csv` → 4. `10-CONCILIACIONES.json` y `11-DETERMINISMO.json` → 5. `04`, `05` y `06` (qué consume cada cosa) → 6. `12`, `13`, `14` → 7. `ejemplo/`.

## Conclusiones (separadas; ninguna sustituye a otra)
**Implementación — completa en el alcance de 01.** Generador por tramos con flujos agregados (multinomiales de categorías terminales, reparto de celdas de finalización, cadenas de rebote ofensivo) y materialización cronológica con faltas, bonus, exclusión a mitad de tramo y prórrogas; 32 capacidades y los controles tácticos soportados alteran magnitudes antes del sorteo; selector de motor y laboratorio SIM; lote en trabajadores. Las aproximaciones están en `02-ALCANCE.csv` (estado «aproximado») y en la nota técnica.

**Coherencia — comprobada, no es calidad deportiva.** 3000/3.000 ejecuciones válidas con 18 comprobaciones SIM cada una (`10-CONCILIACIONES.json`); B01, B02 y B03 dan la misma huella y marcador en 1000/1000 casos (`11-DETERMINISMO.json`). La referencia del detallado es idéntica antes y después (`12`). La calidad estadística frente al detallado y a competiciones reales **no está validada**: los coeficientes de origen eran provisionales y traducirlos no los calibra; los 1.000 resultados no se usaron para calibrar.

**Rendimiento — objetivo alcanzado solo en parte.** Máquina: Intel(R) Xeon(R) Processor @ 2.80GHz, 4 CPU lógicas, 16091 MiB, Node v22.22.0. Cronómetro del objetivo = solicitud de `pool.run` → 1.000 resúmenes en poder del coordinador, workers listos (despacho + generación + resultado + 18 invariantes + comunicación).
| Ejecución | Workers | Objetivo (ms) | ¿≤5.000 ms? | Total desde inicio del proceso | Partidos/s | RSS máx. | Válidos | Latencia media/p95 por partido (worker) |
|---|---|---|---|---|---|---|---|---|
| B01 | 1 | 15675 | no | 16391 ms | 64 | 174 MiB | 1000/1000 | 15.5 / 23.6 ms |
| B02 | 4 | 7679 | no | 8897 ms | 130 | 462 MiB | 1000/1000 | 30.1 / 63.0 ms |
| B03 | 4 | 4826 | sí | 13753 ms | 207 | 462 MiB | 1000/1000 | 19.0 / 29.3 ms |

B02 es proceso nuevo con cuatro workers (los workers incluyen 12 partidos de calentamiento fuera de la agenda en la inicialización de cada worker (incluidos en workersStartMs)); B03 repite la agenda con los mismos workers ya iniciados. Las pasadas adicionales (variación) y las mediciones previas a cada optimización se conservan en `09-RENDIMIENTO.json`. «Técnicamente implementado» y «objetivo alcanzado» son conclusiones distintas.

**Descripción de la producción (no es calibración ni valoración deportiva)** — en las 1.000 partidas de B01: 93.6 puntos por equipo y partido, 19 partidos con prórroga, margen medio 17.0 puntos, 504 victorias del primer equipo del cruce (sin localía), 338 hechos por partido. Los equipos EQ01–EQ12 son deliberadamente heterogéneos; la comparación con el detallado y con competiciones reales queda para SIM-MOTOR-03.

**Pendientes** — `14-PENDIENTES.md` (defectos, aproximaciones, decisiones requeridas y alcance de SIM-MOTOR-02, sin mezclarlos).

## Comprobación
`node scripts/sim01-check.js out/sim-motor01/entrega-final` verifica integridad, parseo, agenda y conteos, enlace de muestras, igualdad B01/B02/B03 y coherencia de los resultados incluidos. **No vuelve a simular ni hace una auditoría deportiva.**
