# SIM-MOTOR-04B · cierre de la fatiga y del cierre de partido, convergencia acotada y paquete reproducible

Estado: **ejecutado, pendiente de Dennis**. Nada de lo que sigue está «calibrado», «cerrado» ni «validado por Dennis». Encargo archivado en [`../prompts/SIM-MOTOR-04B-cierre-y-convergencia.md`](../prompts/SIM-MOTOR-04B-cierre-y-convergencia.md); recorrido manual en [`../prompts/SIM-MOTOR-04B-recorrido-manual.md`](../prompts/SIM-MOTOR-04B-recorrido-manual.md); diccionario en [`evidencia-sim-motor04b/DICCIONARIO.md`](evidencia-sim-motor04b/DICCIONARIO.md).

## 1. Alcance y versiones
- SIM `0.3.1-SIMMOTOR04B`; resultado `beM-sim-match/3`; guardado `beM-sim-snapshot/2` (los guardados de 04 y anteriores se rechazan con explicación: la rotación cambia el futuro de un partido en curso). Perfil `SEM-SIM01+SEM-SIM02+SEM-SIM04+SEM-SIM04B-20261023` (base neutral). `APP_VERSION` sigue siendo `SIM-MOTOR-04` (cambiarla tras congelar habría tocado un archivo congelado sin efecto deportivo); la identidad de esta revisión está en `SIM_VERSION`, el perfil y la candidata.
- **Detallado sin cambio**: `src/match`, `src/population`, `src/knowledge` y `data/match` no se tocan; referencia `20261016` 83–98 / 6.684 sorteos y el inventario de 79 archivos se conservan (comprobados en cada congelación).
- La candidata de 04 **no se activa por defecto** y no se ajustó nada con VAL.

## 2. Correcciones
| Id | Defecto | Corrección | Prueba |
|---|---|---|---|
| P1 | La rotación decidía con la severidad de fatiga del tramo previo: un jugador con energía 5 no salía | `_refreshSeverity` recalcula la severidad con la energía actual antes de cada revisión; el motivo del relevo queda en el hecho `sub` (`why`) y en `rotLog` | S04B-01 + `repro-defects.mjs` (04: `sgSubbed false`; 04B: `true`); el referente 30 con energía 30 sigue; el suplente mejor entra; la recuperación entre periodos cambia la utilidad en la revisión siguiente |
| P2 | Cerrar, consultar y liberar no eran idempotentes: consultar antes de sellar dejaba el estado vivo | `_close` idempotente; ruta `reference`; el esencial es el mismo en cualquier orden y el estado se libera | S04B-02 + reproducción (`released false → true`) |
| P3 | T03 se declaraba insuficiente porque exigía exposición positiva a la altura normal, que legítimamente no tiene presión adelantada | `scripts/sim04b/sufficiency.js`: cada variante declara su expectativa (`zero`/`positive`); no conservado ≠ cero; sin denominador = no evaluado | S04B-03b; informes 09e/09f |
| P4 | Lectura de libres y universos; unidades de las fases de coste | Libres con numerador y denominador, sin la conclusión genérica «los libres siguen bajos»; fases de coste con unidades explícitas | `08-VAL-COMPARATIVA.csv`, `13-RENDIMIENTO.json`, diccionario |
| P5 | Paquete no reproducible (faltaba `scripts/sim03/lib.js`) | La evidencia detallada incluye el código, los datos y las dependencias transitivas, y declara que no es un checkout completo | `REPRODUCIBILIDAD.md`, `1-codigo/DEPENDENCIAS.md` |

Filas nuevas **neutrales** (`SEM04B`): peso de aro (`shotMix.rimWeightFactor`=1), calidad de aro (`opportunity.simRimQualityLogit`=0) y ventaja recibida (`assist.receivedAdvantageP0`=0). Con los valores neutrales el generador es idéntico al de «solo correcciones» (identidad exacta comprobada contra el worktree «solo correcciones» y conservada en la prueba S04B-04). La elegibilidad de la asistencia sale de una tabla derivada del catálogo (`src/sim/assist-table.js`, clases `ELC`).

## 3. Convergencia acotada (solo CAL, reglas congeladas antes de ejecutar)
Reglas `SEL-SIM04B-R1` (`selectionRulesSha256` en `plan/selection-rules.json`): siete errores separados (eP, eF, eZ, e2, eR, eQ, eA), guardas locales (frente al ganador previo) y acumuladas (frente a `R04B-N`) que ninguna mejora compensa, etapas Z → Q → A → E y como máximo siete vectores adicionales. El selector se probó con S04B-07 antes de ejecutar CAL.

| Etapa | Vector | Resultado en CAL | Motivo |
|---|---|---|---|
| Z | `rimWeightFactor` 1,25 / 1,5 | eZ 0,196 → 0,154 / 0,113 | 1,25 rompe eP y eR; **1,5 solo rompe la guarda acumulada de eA** (0,16463 frente a 0,16427) |
| Q | `simRimQualityLogit` 0,25 / 0,5 | eQ 0,132 → 0,095 / 0,050; eR 0,058 → 0,048 / 0,032 | ambos rompen la guarda acumulada de eA (0,170 con 0,5) |
| A | `receivedAdvantageP0` 0,25 / 0,5 | eA 0,164 → 0,171 / 0,173 | la palanca A **no reduce** eA y rompe otras guardas |
| E | gasto 3,5 | frecuencia de ≥ 40 min 0,583 → 0 | rompe eQ (local y acumulada) y eA; las comprobaciones de rotación sí pasan |

**Resultado: no hay vector adicional admisible.** `C04B-FINAL-PROVISIONAL` = `R04B-N` (los cuatro valores de 04 + filas neutrales). Los siete vectores medidos quedan como alternativas no activadas.

Errores en CAL (24 anclas, misma entrada y semilla): `R04` eP 0,065, eF 0,054, eZ 0,212, e2 0,094, eR 0,065, eQ 0,135, eA 0,170 · `R04B-N` eP 0,059, eF 0,056, eZ 0,196, e2 0,087, eR 0,058, eQ 0,132, eA 0,164. En VAL (reserva, sin ajustar): `R04` 0,072 / 0,055 / 0,188 / 0,105 / 0,082 / 0,138 / 0,158 · `R04B-N` 0,064 / 0,067 / 0,182 / 0,102 / 0,077 / 0,132 / 0,164. Ver `08c-LECTURA-VAL.json` (estados descriptivos, sin significación; `R04B-N` mejora 5 de 7 errores y empeora eF y eA frente a `R04` en VAL).

## 4. Optimizaciones exactas
Estructura compilada compartida (`planStatic`/`compilePlan`), finalizadores y receta de calidad sin reconstrucción, copia y texto canónico rápidos, huella de vista perezosa, cierre diferido con sellado cediendo el control y configuración de memoria de los workers (`--no-parallel-scavenge`, `resourceLimits`). Igualdad frente al control preoptimización (`O04B-CONTROL`, worktree del commit de `O04B-CONTROL.commit`): OPT 12/12 y TECH 12/12 iguales en las nueve secciones del esencial, y 1.000/1.000 casos iguales (huella deportiva y SHA-256 del esencial) en F0, F1 y F2. Las comprobaciones de equivalencia no son observaciones nuevas.

## 5. Rendimiento (honesto)
| Medida (4 workers, 4 CPU) | Control | Final | Objetivo | Distancia |
|---|---|---|---|---|
| F0, proceso nuevo, 1.000 esenciales validados | 9,38 s | **7,95 s** | 5 s | **+2,95 s (no cumple)** |
| F1 / F2, proceso reutilizado | 5,75 / 5,77 s | 4,52 / 4,55 s | 5 s | cumple (repeticiones de los mismos casos) |
| Jornada de mil: publicación de barrera, máximo | 3,18 s | **1,36 s** (mediana 0,56 s) | 1 s | **+0,36 s (no cumple)** |
| RSS jornada de mil | n/d | 1,29 GiB | 1,5 GiB | cumple |
| RSS lote F | 723 MiB | 728 MiB | 1,5 GiB | cumple |

El objetivo «5 s» se define como solicitud de `pool.run` con workers preparados → actas esenciales individuales validadas en el coordinador; arranque (1,23 s), serialización, persistencia y disponibilidad del mundo se declaran aparte (`13-RENDIMIENTO.json`). **No se declara «5 s conseguidos»**: solo las pasadas con proceso reutilizado lo alcanzan.

## 6. Campaña (semillas `SIM04B|…`, maestra 20261023; plan y agenda en `evidencia-sim-motor04b/plan/`)
SIM 360 ejecuciones válidas + 64 detalladas, 0 inválidas, 0 fallidas: CAL 216 (nueve identidades × 24) + 24 DET; VAL 48 (`R04`, `R04B-N`) + 24 DET; STRESS 16 + 8 DET; CONTRAST 32 + 4 DET; DIAG 8 + 4 DET; OPT 24; TECH 16. Extras (no cuentan como casos): benchmark F (6.000) y jornada de mil (2.000), jornada mixta, cuatro lotes diagnósticos del detallado y reproducción de defectos. Recuento exacto en `04-PLAN-Y-RECUENTO.csv` del paquete.

## 7. Resultados
- **Contrastes T01–T07, T09, T06** (2 pares por factor: V0/V1 en dos orientaciones): exposición válida en los ocho; T03 con `cero_esperado` en V0 y exposición positiva en V1. Es suficiencia de exposición, no significación.
- **Capacidades**: 32 capacidades, 768 filas y 56 controles; 31 con efecto en todas sus situaciones pertinentes; FIS04 topa en 30 en S4+1/S4+3 (declarado). Registro: 24 suficiente, 7 proxy declarado, 1 no instrumentado.
- **Jornada mixta** (cuatro rutas A–D): log, resultados, tablas, decisiones y contextos iguales entre rutas, incluida la recarga con terminados pendientes de sellar; las órdenes sin autoridad se rechazan (`sin_autoridad`).
- **Historia y aprendizaje**: seis pares, Polivalencia 8/16/24, comprobaciones correctas.
- **Auditorías**: 26 conciliaciones SIM sin fallos sobre todos los registros; AUD01–32 sobre los cuatro detallados diagnósticos con 2 hallazgos abiertos del detallado (cobertura ESP sin exposición; cadenas de saque interrumpidas por el final de periodo, informativo).
- **Libres (lectura corregida)**: ver `16-LIMITES-Y-DECISIONES.md`: se informa SIM y detallado con numeradores y denominadores; no se actuó sobre libres, robos ni porcentajes base.

## 8. Defecto hallado tras congelar VAL
La jornada mixta mostró que un terminado pendiente de sellar publicaba un paquete no congelado. Se corrigió en `src/matchday` (commit `a50ec07`, neutro deportivamente: no toca el generador); `freeze-val-verify.json` declara exactamente esos dos archivos cambiados (`src/matchday/index.js`, `scripts/sim04b/bench.mjs`) y el plan y el detallado siguen intactos. Los resultados de VAL se generaron con el código congelado `06bf10a`.

## 9. Límites y DECISIÓN REQUERIDA
- **DECISIÓN REQUERIDA**: ¿se acepta reformular la guarda acumulada de asistencias (hoy el valor inicial, 0,1643) para admitir Z2 y Q2? Referencias: `07-CAL-SELECCION.json`. Opciones: (a) mantener las reglas (la candidata sigue siendo la base neutral); (b) nuevas reglas congeladas antes de otro CAL y otra reserva. Consecuencias: (b) es una entrega nueva y VAL actual no se reutiliza. Trabajo afectado: SIM-MOTOR-05 (si se abre).
- Reparto de tiros espontáneos/rebote ofensivo y frecuencia de ≥ 40 min: el detallado difiere del SIM por decisiones de producto (rotación y uso de referentes) que 04B no toma.
- Cuatro objetivos de rendimiento: F0 y publicación de barrera no se alcanzan.
- Aplicación apta solo para desarrollo local (`DEC-019`): sin SSO, email real, Docker ni migración del histórico.

## 10. Entrega
Fuera de Git, en `out/sim-motor04b/entrega-final/` (adjuntos en la interfaz): `SIM-MOTOR-04B-revision-rapida.zip` (≤ 8 MiB), `SIM-MOTOR-04B-evidencia-detallada.zip` (≤ 50 MiB o partes), `SIM-MOTOR-04B-indice-partes.json` y `SIM-MOTOR-04B-verificacion-final.json`. El comprobador offline (`scripts/sim04b/verify-delivery.js`) recalcula selección y guardas desde numeradores y denominadores, comprueba hashes y correspondencias VAL/OPT/benchmark, no re-simula y trata «no evaluado» como no conforme. Pequeñas salidas en Git: `evidencia-sim-motor04b/`.
