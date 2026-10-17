# Resumen del lote LOT-c268fba2

> Generado desde los mismos agregados que `agregados/*.csv`. Alcance: **índice global de un lote dividido**. Estado del trabajo: **completado**.

## Objetivo y qué cambia

- Objetivo/pregunta: Contraste inicial de integración: ¿cómo cambian pérdidas, creación y distribución de tiros al sumar +3 en Pase (TEC08) a los directores? (auditoría general de coherencia y distribuciones)
- Variante **V0** (Base) — base: sin cambios (0 cambios exactos listados en entradas/variantes.json)
- Variante **V1** (Candidata: +3 Pase (TEC08) a los directores): ability */director TEC08 3 (10 cambios exactos listados en entradas/variantes.json)
- Conservado: mismos equipos (fichas y planes) en cada caso; misma lista de semillas deportivas: las variantes de un mismo caso comparten semilla; mismo perfil efectivo congelado; misma localía y orden de agenda; estado inicial limpio en cada partido (energía, Forma, momentos, faltas, memoria).

## Versiones y población

- Motor `beM-motor-0.9.0-MOTOR09` · instrumentación `INSTR-MOTOR11-R1` · reglas `FIBA-2026-v1.1` · perfil efectivo `SEM-MOTOR01-20261016+SEM-MOTOR02-20261016+SEM-MOTOR03-20261016+SEM-MOTOR04-20261016+SEM-MOTOR05-20261016+SEM-MOTOR06-20261016+SEM-MOTOR07-20261016+SEM-MOTOR08-20261016+SEM-MOTOR09-20261016+SEM-MOTOR10-20261016+SEM-MOTOR11-20261017+SEM-MOTOR12-20261017` (huella d038f6bf4fd9e516) · registros `REG-MOTOR12-R1` · paquete `beM-analysis-package/1`
- Modo «Pares elegidos uno a uno», localía «Local fijo (A en casa)», 1 repeticiones por enfrentamiento y variante; semilla de lote 20261017 (derivación LOT-SEED-R1; 0 colisiones resueltas).
- Cantidades: 10 equipos → 5 pares; 1 repeticion por par → 5 casos deportivos; 2 variantes → 10 ejecuciones totales solicitadas

## Estado de las ejecuciones

| Solicitadas | Terminadas | Válidas | Fallidas | Interrumpidas | Pendientes | En curso | Reintentadas |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 | 10 | 10 | 0 | 0 | 0 | 0 | 0 |

Los estados primarios (pendiente + en curso + terminada + fallida + interrumpida) suman las solicitadas ✔. «Válidos» son terminadas que concilian; «iniciados» (10) se solapa con ellas.

Nivel de registro: **diagnostic** (diagnóstico completo capturado desde el inicio). Prosa: omitted.

## Resultados por variante (todos los equipos, equipos-partido válidos)

| Variante | n válidos | Pts/partido (media ± sd) | TC_PCT | T3_PCT | FT_PCT | EFG | TS | ORTG | PACE | PER100 | OREB_PCT |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| V0 | 10 | 90.5 ± 18.3 | 55.5 | 41.2 | 81.8 | 62.7 | 66.2 | 128.0 | 69.0 | 16.3 | 23.9 |
| V1 | 10 | 87.5 ± 17.0 | 55.7 | 41.3 | 79.7 | 63.6 | 66.1 | 131.2 | 66.7 | 15.1 | 28.5 |

_Tasas agregadas por exposición (Σnum/Σden), no medias de porcentajes de partido. n = equipos-partido. Un valor «—» es no calculable o no registrado, nunca un cero._

## Comparación base/candidata (casos emparejados)

| Candidata | Indicador | Pares | Incompletos | Base | Candidata | Δ tasas agregadas | Media Δ por caso (± sd) |
|---|---|---:|---:|---:|---:|---:|---|
| V1 | TC_PCT (%) | 10 | 0 | 55.46 | 55.74 | 0.28 | 0.28 ± 4.92 |
| V1 | T3_PCT (%) | 10 | 0 | 41.23 | 41.30 | 0.07 | -0.65 ± 10.47 |
| V1 | TS (%) | 10 | 0 | 66.19 | 66.12 | -0.07 | 0.08 ± 7.61 |
| V1 | ORTG (pts/100) | 10 | 0 | 128.01 | 131.18 | 3.18 | 3.28 ± 19.90 |
| V1 | PER100 (PER/100) | 10 | 0 | 16.27 | 15.14 | -1.12 | -1.13 ± 3.87 |
| V1 | OREB_PCT (%) | 10 | 0 | 23.89 | 28.51 | 4.63 | 5.12 ± 14.19 |
| V1 | MAG:pts (puntos) | 10 | 0 | 90.50 | 87.50 | -3.00 | -3.00 ± 12.04 |

_La diferencia de tasas agregadas y la media de diferencias por caso son medidas distintas. Misma semilla no garantiza que cada jugada consuma los mismos sorteos tras una decisión distinta: no es un efecto causal aislado ni promete que el cambio mejore cada marcador. Una muestra pequeña no demuestra superioridad general._

## Partidos extremos observados (con IDs; un extremo no prueba un fallo)

- Mayor margen: M000001 (EQ01 80–111 EQ02, variante V0, intento M000001-A1); M000007 (EQ07 66–94 EQ08, variante V0, intento M000007-A1); M000010 (EQ11 115–91 EQ12, variante V1, intento M000010-A1)
- Menor margen: M000002 (EQ01 86–83 EQ02, variante V1, intento M000002-A1); M000005 (EQ06 106–103 EQ10, variante V0, intento M000005-A1); M000006 (EQ06 106–103 EQ10, variante V1, intento M000006-A1)
- Más puntos: M000005 (EQ06 106–103 EQ10, variante V0, intento M000005-A1); M000006 (EQ06 106–103 EQ10, variante V1, intento M000006-A1); M000009 (EQ11 102–107 EQ12, variante V0, intento M000009-A1)
- Menos puntos: M000004 (EQ04 68–62 EQ05, variante V1, intento M000004-A1); M000003 (EQ04 74–62 EQ05, variante V0, intento M000003-A1); M000007 (EQ07 66–94 EQ08, variante V0, intento M000007-A1)

## Incidencias

- Ninguna fallida, interrumpida ni no válida registrada (conteo cero en un mecanismo activo).


## Comprobaciones

- ✔ **IDX01** El índice enumera todas las partes con tamaño y SHA-256 de su ZIP final: 9 partes
- ✔ **IDX02** Cada partido canónico aparece en exactamente una parte (fragmentos explícitos)

Una conciliación correcta prueba consistencia bajo las reglas vigentes, no conformidad normativa ni calibración. Lo no comprobado está en auditoria/cobertura.csv.

## Dónde mirar

- Empieza por `README.md`, `manifest.json` y `auditoria/cobertura.csv`; después `agregados/*.csv`; luego los partidos extremos; luego `entradas/`; por último `eventos/` y `decisiones/` del `match_id` que interese.
- Para abrir un partido concreto: busca su `match_id` en `estadisticas/partidos.csv` (intento canónico, semilla, entrada) y abre `eventos/eventos-<match_id>--<attempt_id>.jsonl`; sus cálculos y sorteos están en `decisiones/` con el mismo sufijo.
- Este lote está dividido en 9 partes; consulta `indice.json` para localizar el partido (`parts[].matches`).

## Límites de inferencia

- Un partido extremo no es un error por sí solo. Una diferencia en una muestra pequeña no demuestra superioridad general. Esto prepara evidencia: sensibilidad, monopolios y calibración corresponden a MOTOR-13; coste y rendimiento final a MOTOR-14.
- Paquete: beM-lote-LOT-c268fba2-indice.zip.
