# SIM-MOTOR-03 · plan congelado de la campaña comparativa

> **Este documento se escribió ANTES de ejecutar la campaña.** Las cifras reales, los fallos y los límites están en la nota de resultados [`sim-motor03-campana.md`](sim-motor03-campana.md), redactada después. No es una calibración: la campaña no cambia ningún coeficiente deportivo ni acepta candidatas (eso es SIM-MOTOR-04).

Encargo: [`../prompts/SIM-MOTOR-03-correcciones-02B-y-campana.md`](../prompts/SIM-MOTOR-03-correcciones-02B-y-campana.md). Cierre de 02B: [`sim-motor02b.md`](sim-motor02b.md).

## Identidad y base

| Dato | Valor |
|---|---|
| Aplicación | `SIM-MOTOR-03` (incluye `SIM-MOTOR-02B`) |
| Revisión SIM | `0.2.1-SIMMOTOR02B` (propia; no es la compilación de 02, `0.2.0-SIMMOTOR02`) |
| Perfil numérico SIM | `SEM-SIM01-20261022+SEM-SIM02-20261022` (valores deportivos de 02 **intactos**) |
| Resultado / guardado / jornada | `beM-sim-match/2` · `beM-sim-snapshot/1` · `beM-sim-matchday/1` (compatibilidad por matriz explícita, `SIM_SNAPSHOT_COMPAT`) |
| Detallado congelado | MOTOR-18C: referencia semilla 20261016, marcador 83–98, 6.684 sorteos (control de conservación, no objetivo) |
| Semilla maestra de la campaña | 20261023; `deriveSeed(master, seed_key)` (FNV-1a 32 bits, `src/sim/rng.js`) |
| Clave de semilla | `bloque\|enfrentamiento_o_escenario\|orientación\|réplica`; **excluye** variante, resolutor, intento, worker, lote y ruta |
| Base de Git | PR [bateman37/beM#21](https://github.com/bateman37/beM/pull/21), base `606c33b`; SIM-MOTOR-02 termina en `4194158` |

Los ZIP históricos de 01/02 no existen (`out/` no se versiona): se reproduce desde la base comprobable de Git y no se fabrica ningún archivo histórico.

## Presupuesto cerrado

| Bloque | SIM | Detallado | Uso |
|---|---:|---:|---|
| A · cruces naturales (12 × 11 orientados × 8 réplicas) | 1.056 | 48 | distribución, jerarquía, producción natural |
| B · contrastes (16 escenarios × 2 variantes × 2 orientaciones × 8 réplicas) | 512 | 24 | sensibilidad táctica y de estados |
| C · contextos específicos (8 entradas × 8 réplicas) | 64 | 0 | estados y cantera |
| **Comparación deportiva** | **1.632** | **72** | sin calibrar |
| E · repeticiones técnicas (8 casos × {E1, E2}) | 16 | 0 | equivalencia; no son observaciones nuevas |
| F · rendimiento (cuatro pasadas de mil + jornada de mil) | 5.000 | 0 | las pasadas repiten sus mil casos |

Total de ejecuciones explícitas de campaña: 6.648 SIM y 72 detalladas. Las pruebas, el recorrido de Chromium, los controles y las muestras de perfilado se cuentan **aparte**; las cuatro ejecuciones detalladas extra del lote diagnóstico de auditoría (mismas entradas y semillas de la muestra) también (verificación).

Agendas y materialización (en Git, [`evidencia-sim-motor03/plan/`](evidencia-sim-motor03/plan/)): `agenda-sim.csv` (1.632), `agenda-detallado.csv` (72), `agenda-benchmark.csv` (1.000, la de 01/02: 132 × 7 + 76, maestra 20261022), `entries.jsonl.gz` (198 entradas canónicas sin semilla, deduplicadas por hash), `plan.json` y `freeze.json`. La ejecución regenera cada entrada y **comprueba su `entry_id`/`input_hash` contra el plan**: una entrada distinta aborta el caso.

## Bloque A
Doce equipos EQ01–EQ12 con sus planes naturales; los 132 pares orientados distintos × 8 réplicas. Plantillas, planes y estados iniciales congelados por caso; no hay localía modelada ni acumulación de aprendizaje o cansancio entre casos. **Detallado**: las doce parejas A-D01…A-D12 del encargo (cada equipo en dos), ambas orientaciones y las réplicas 1–2 (48). No se eligieron viendo marcadores.

## Bloque B
Equipo sometido al factor (T1) y rival (T2) fijos por escenario; orientación O1 = T1 es el equipo 0 de la entrada, O2 = equipo 1. La variante cambia **solo** el factor; cualquier condición preparada para hacer pertinente la interacción se mantiene en ambas variantes.

| Id | Factor (V0 → V1) | Par T1–T2 | Detallado |
|---|---|---|---|
| B01 | ritmo organizado 1 → 5 | EQ01–EQ02 | sí |
| B02 | preferencia de finalización: extremo interior (nivel 1) → exterior (nivel 5) | EQ03–EQ04 | sí |
| B03 | después del tiro: menor → mayor carga al rebote (1 → 5) | EQ05–EQ06 | no |
| B04 | riesgo ofensivo 1 → 5 | EQ07–EQ08 | no |
| B05 | libertad 1 → 5, con el mismo director de lectura alta (titular de mayor MEN02+MEN03) | EQ09–EQ10 | no |
| B06 | director: candidato PG (MEN02=MEN03=6) → SG (=26) con prioridad; fichas idénticas | EQ11–EQ12 | sí |
| B07 | rol ofensivo del SG titular: O02 (anotación) → O12 (creación) | EQ02–EQ03 | no |
| B08 | rol defensivo del C titular: D12 (protección interior) → D11 (función perimetral) | EQ04–EQ05 | no |
| B09 | altura de presión normal → total | EQ06–EQ07 | sí |
| B10 | tendencia al robo 1 → 5 | EQ08–EQ09 | no |
| B11 | organización: individual (ORG01) → zona 2–3 (ORG02); conocimiento neutral | EQ10–EQ11 | no |
| B12 | cobertura COB01 → COB03; el rival ataca con prioridad 5 en las fichas con bloqueo (POS01–POS08) y 2 en el resto | EQ12–EQ01 | no |
| B13 | familiaridad de los módulos tácticos pertinentes 8 → 28 (resto 16, Polivalencia 16) | EQ01–EQ07 | sí |
| B14 | energía inicial 100 → 30 (todo el equipo) | EQ03–EQ09 | sí |
| B15 | forma −0,5 → +0,5 | EQ05–EQ11 | no |
| B16 | consistencia MEN06 8 → 24 | EQ02–EQ08 | no |

Detallado: B01, B02, B06, B09, B13 y B14; ambas variantes, réplicas 1–2 y solo O1 (24). Todas las entradas se validaron en **ambos** modelos antes de ejecutar (0 incompatibilidades).

## Bloque C
Base común EQ05–EQ06 (se modifica EQ05): C01 energía 8 · C02 energía 70 · C03 momentos individuales −0,5 · C04 +0,5 · C05 momento colectivo −0,5 · C06 +0,5 · C07 importancia decisiva · C08 dos equipos Sub-20 (EQ01U–EQ02U) del escenario existente. Son cobertura, no una distribución real de competición.

## Muestra diagnóstica (elegida antes de ejecutar)
SIM (8): `A-EQ01-EQ02-R1`, `A-EQ03-EQ09-R1`, `A-EQ07-EQ08-R1`, `A-EQ11-EQ12-R1`, `B-B01-V0-O1-R1`, `B-B06-V1-O1-R1`, `B-B13-V1-O1-R1`, `C-C01-R1`. Detallados (4): `A-EQ01-EQ02-R1@DET`, `A-EQ03-EQ09-R1@DET`, `B-B01-V0-O1-R1@DET`, `B-B13-V1-O1-R1@DET`. Conservan hechos nativos completos; el resto, entrada efectiva, esencial, agregados de Análisis y proyecciones compactas.

## Historia, aprendizaje, capacidades y auditorías (todo desde lo ya ejecutado)
- **Historia** (§8.3): 72 resultados de A (réplica 1) en 12 rondas **ficticias** (círculo; seis partidos por ronda); ledger SIM y ledger mixto separados (el detallado sustituye a SIM cuando existe su gemelo; nunca los dos en un ledger); conciliación esencial → ledger.
- **Aprendizaje** (§8.4): seis pares A-D01…A-D06 (réplica 1, SIM y detallado, doce exposiciones), Polivalencia 8/16/24 sobre copias identificadas, mismas funciones comunes; nunca se aplica al motor ni al dataset base.
- **Capacidades y controles** (§8.1, §8.2): `scripts/sim03/probes.js` (magnitudes previas al sorteo, sin azar); 8 situaciones fijas × 32 capacidades × +1/+3/+5; inventario de controles con su exposición real calculada de los registros de la campaña.
- **Auditorías** (§8.5): catálogo AUD01–32 heredado sobre un lote diagnóstico de los 4 detallados de la muestra; conciliaciones R01–R23 de SIM sobre los 1.632 casos; lo no aplicable a SIM se declara, no se fabrica.

## Equivalencia (E) y rendimiento (F)
- **E**: ocho casos SIM de A/B/C (ritmo extremo, energía, forma, cobertura, cantera…) × E1 (un worker, avance por instantes/cuartos con consultas intermedias) y E2 (cuatro workers, guardar/serializar/restaurar con sufijo privado, nivel Análisis). Comparación por **seis secciones deportivas** (marcador/periodos, hechos y acta, presencia/quintetos/tiempos, órdenes y decisiones, azar/ordinal, zonas/familias/exposición/estados), con su propia huella y primera diferencia.
- **F**: agenda de mil de 01/02; F0 (proceso nuevo; arranque, calentamiento y carga medidos aparte), F1–F3 (workers preparados, agenda regenerada, sin caché de resultados), con la política automática activa y el esencial individual completo transportado; después la jornada de mil con reloj virtual y barreras de 120 s. Control preoptimización: el commit `ee14ec5` (correcciones funcionales ya hechas), medido en la **misma sesión** que el código final.

## Reglas de ejecución
Cuatro workers SIM; uno o dos para el detallado según memoria; persistencia progresiva y reanudación; un caso terminado (válido o no) no se repite; un fallo determinista se conserva como fallido (sin marcador, sin derrota); solo una causa operativa identificada se reintenta, con la misma entrada y semilla y un intento nuevo; si un defecto sistemático inutiliza un bloque, se detiene ese bloque, se guarda la reproducción y se entrega el alcance real. No se amplía la campaña si los resultados parecen raros.

## Qué queda congelado
`freeze.json` registra el SHA-256 de todo `src/`, `data/`, `scripts/node-data.js`, `scripts/sim03-bench.js`, `scripts/sim03/*` (campaña, tablas, historia, equivalencia, sondas, auditorías) y los archivos del plan, además de los archivos deportivos del detallado frente a la base `4194158` (cambiados: ninguno). `node scripts/sim03/freeze.js --mode=verify` lo comprueba antes y después de la campaña. El empaquetado, el comprobador de entrega y la documentación se registran aparte y no reescriben resultados.
