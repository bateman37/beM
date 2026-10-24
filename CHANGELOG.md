# Changelog

Registro breve de entregas. Una entrada por entrega; las más recientes primero.

## SIM-MOTOR-04C — Convergencia estadística con el detallado: rebote ofensivo, oportunidad interior y asistencias — 2026-10-24

- **Lectura**: canastas con pasador ≠ asistencias acreditadas (el detallado se lee del acta; CAL DET 1.017 acreditadas); versión visible `SIM-MOTOR-04C`; benchmark sin turnos de espera de otro control. SIM `0.3.2-SIMMOTOR04C`; los guardados de 04B se rechazan con explicación.
- **Mecanismos** (filas `SEM04C` neutrales, no activas por defecto): rama tras rebote ofensivo (inmediata / reinicio organizado con celdas organizadas admisibles, `rebound.organizedResetP0`), calidad de `inside` (`opportunity.simInsideQualityLogit`) y conversión provisional de `inside` (`conversion.simInsideLogitOffset`); embudo `reboundFunnel` y conciliación R27. Con las filas a 0 la trayectoria es la de 04B (24/24 casos idénticos).
- **Búsqueda** (solo CAL, reglas `SEL-SIM04C-R1` congeladas antes; 8 vectores completos R→I→P): elegida `C04C-FINAL-PROVISIONAL` = peso de aro 1,5 · calidad de aro 0,5 · reinicio 0,35 · calidad inside 0,5 · conversión inside 0,30 (M 2,64 → 1,45 en CAL; 2,58 → 1,70 en VAL). **eZ, eA, e2 y eR siguen fuera de banda** y eR empeora en VAL. No se activa por defecto.
- **Campaña**: CAL 240 SIM + 24 DET, VAL nueva 96 + 48, CONTRAST 32 + 8, TECH 18; 0 fallos. Jornada mixta, historia/aprendizaje y Chromium (50 pasos, consola 0, red 0) sin fallos. Suite 351/352 (una expectativa de versión visible corregida y verificada). Detallado intacto (83–98, 6.684 sorteos).
- **Rendimiento** con 2.000 clubes: lote 8,7–9,5 s (primera solicitud) y 5,3–5,4 s (pool reutilizado), publicación 1,61 s, RSS 1,54 GiB: **ningún objetivo cumplido**.
- Pendiente de Dennis: [recorrido manual](docs/prompts/SIM-MOTOR-04C-recorrido-manual.md). Ver [`docs/tecnico/sim-motor04c.md`](docs/tecnico/sim-motor04c.md).

## SIM-MOTOR-04B — Fatiga y cierre corregidos, convergencia acotada y paquete reproducible — 2026-10-23

- **Correcciones**: la rotación decide con la fatiga actual (un 20 con energía 5 ya sale; el referente 30 con energía 30 sigue); cierre, consulta y liberación idempotentes; suficiencia de exposición con cero esperado (T03); lectura de libres y unidades de coste; paquete reproducible con `scripts/sim03/lib.js`. SIM `0.3.1-SIMMOTOR04B`; los guardados de 04 se rechazan con explicación.
- **Convergencia** (solo CAL, reglas `SEL-SIM04B-R1` congeladas antes; ≤ 7 vectores Z→Q→A→E): **ningún vector admisible**; `C04B-FINAL-PROVISIONAL` = base neutral (volumen 19,5 · triples 0,70 · entrega final 0,90 · gasto 3), no activada. Z2 y Q2 mejoran eZ/eQ/eR y solo quedan fuera por la guarda acumulada de asistencias (DECISIÓN REQUERIDA).
- **Optimizaciones exactas** con igualdad probada (OPT 12/12, TECH 12/12, 1.000/1.000): F0 7,95 s frente a 9,38 s del control (**objetivo 5 s no cumplido**), publicación de barrera 1,36 s frente a 3,18 s (**objetivo 1 s no cumplido**), RSS de la jornada de mil 1,29 GiB.
- **Campaña**: 360 SIM + 64 detallados válidos (CAL, VAL, STRESS, CONTRAST, DIAG, OPT, TECH); jornada mixta (cuatro rutas), historia/aprendizaje, capacidades y auditorías sin fallos de conciliación. Chromium 60 pasos (consola 0, red 0). Detallado intacto (83–98, 6.684 sorteos).
- Pendiente de Dennis: [recorrido manual](docs/prompts/SIM-MOTOR-04B-recorrido-manual.md). Ver [`docs/tecnico/sim-motor04b.md`](docs/tecnico/sim-motor04b.md).

## SIM-MOTOR-04 — Correcciones verificables, convergencia estadística, rendimiento y auditoría final — 2026-10-23

- **Correcciones C04-01…06**: rebote ofensivo colectivo ponderado, lectores de zona con la regla común de intento de campo (la canasta con falta cuenta), bloqueador pertinente por rol de jugada, familiaridad de presión sobre la pérdida extra, prioridades 1/5 con cobertura del instrumento y denominadores de asistencia; conciliaciones R24–R26 (26 en total). Perfil `SEM-SIM04-20261023`, resultado `beM-sim-match/3`, guardado `/2` (los de 02/03 se rechazan con explicación).
- **Candidata provisional** `C04-FINAL-PROVISIONAL` por selección mecánica congelada (V→Z→A→E, 9 vectores): mejora observada en CAL y VAL (8/8 estados), subproduce puntos; no se activa por defecto ni equivale a aceptación deportiva.
- **Optimizaciones exactas** (eventos sin `delete`, caché de quintetos, cierre diferido, generación joven del worker): equivalencia OPT 56/56 y huellas 1.000/1.000; **objetivo de 5 s NO cumplido** (7,35–12,0 s frente a 8,2–12,2 s del control); jornada de mil 17,4 s, pausa pública 1,82 s, RSS 2,19 GiB.
- **Campaña**: 1.004 SIM válidas (CAL 616, VAL 168, STRESS 48, CONTRAST 88, DIAG 12, OPT 56, TECH 16) + 36 detallados; jornada mixta, historia desde VAL y aprendizaje con seis pares. Paquetes fuera de Git y comprobador offline `scripts/sim04/verify-delivery.js`.
- Pruebas S04-01…10; suite 335/335; Chromium 58 pasos (consola 0, red 0). Detallado intacto (83–98, 6.684 sorteos). Pendiente de Dennis: [recorrido manual](docs/prompts/SIM-MOTOR-04-recorrido-manual.md). Ver [`docs/tecnico/sim-motor04.md`](docs/tecnico/sim-motor04.md).

## SIM-MOTOR-03 (incluye 02B) — Correcciones, rendimiento exacto y campaña comparativa congelada — 2026-10-23

- **Cierre de 02B (C03-01…11)**: recuperación de la jornada con encuentros ya terminados, guardados independientes y coherentes con matriz de compatibilidad explícita, registro histórico validado y atómico, consulta histórica sin detalle futuro, consecuencias revertidas, estadísticas derivadas con universos correctos (defensa con faltas de tiro, quintetos con controles observados, tapones recibidos), conservación de Análisis con ausencia tipada, movimiento administrativo en la ronda siguiente, identidad de las órdenes del pool y política del entrenador coherente entre rutas (`advanceAutomatic`/`playAutomatic`; `finish()` queda como primitiva). SIM `0.2.1-SIMMOTOR02B`; perfil numérico de 02 intacto; C03-11 cambia trayectorias (registrado). [Nota](docs/tecnico/sim-motor02b.md).
- **Optimizaciones exactas**: plan compilado por identidad, pools de rol entre tramos y vista incremental del entrenador; huellas idénticas al control `ee14ec5` en 1.000/1.000 casos. Mejora ≈5–8 % en caliente; **objetivo de 5 s NO cumplido** (≈8,2–9,2 s caliente en esta máquina; control ≈8,4–9,7 s; RSS de la jornada de mil ≈2,66 GiB frente a ≈2,31 GiB).
- **Campaña SIM-MOTOR-03** congelada y ejecutada: 1.632 SIM + 72 detallados (todos válidos), equivalencia técnica 16/16, historia (72 resultados, ledgers SIM y mixto), aprendizaje (seis pares, Polivalencia 8/16/24), matriz de 32 capacidades × 8 situaciones, cobertura de controles, AUD01–32 sobre la muestra diagnóstica y conciliaciones R01–R23. Paquetes y comprobador offline (28 comprobaciones) fuera de Git. [Plan](docs/tecnico/sim-motor03-plan.md) · [resultados](docs/tecnico/sim-motor03-campana.md).
- Pruebas S03-01…12 y de sondas; suite completa 325/325; Chromium 46 pasos (consola 0, red 0). Detallado intacto (83–98, 6.684 sorteos; 0 archivos deportivos modificados). Pendiente de Dennis: [recorrido manual](docs/prompts/SIM-MOTOR-03-recorrido-manual.md). Sin calibración.

## SIM-MOTOR-02 — Correcciones, integración, simultaneidad e historia — 2026-10-23

- **Correcciones C02-01…05** de la revisión de SIM-MOTOR-01: prefijo público monótono (periodos, controles y estado desde hechos; sufijo privado), libres y finalizaciones únicas (`bonus_sin_familia`), gasto de presión al equipo que presiona, identidad canónica y validación estricta, tapón fuera como continuidad, receptor de falta ofensiva y contadores causales de faltas; 23 conciliaciones (R01–R23). Cambian trayectorias SIM (sin calibración).
- **Roles, director y familiaridad pertinente** con efecto antes del sorteo; **política pequeña del entrenador** (semillas `SEM-SIM02`); 11 lectores SIM con audiencias y ausencias tipadas.
- **Jornada simultánea** (`src/matchday/`, `beM-sim-matchday/1`): reloj virtual común, barreras, detallado + SIM, clasificación inicial/provisional/final, pool de trabajadores; **guardado real** (`beM-sim-snapshot/1`) y **lotes persistentes** recuperables tras SIGKILL; **historia de temporada** (72 encuentros, movimiento, profundidades, cierre) y **aprendizaje posterior** con guarda por encuentro lógico.
- Medición: P02-F 8,30 s y calientes 5,15–5,91 s (objetivo de 5 s **no alcanzado**); esenciales individuales 15,4 MiB. Pruebas S02-01…14; suite 307/307; Chromium 43 pasos (consola 0, red 0). Detallado intacto. Aplicación `SIM-MOTOR-02`. **Pendiente de Dennis.** Ver [`docs/tecnico/sim-motor02.md`](docs/tecnico/sim-motor02.md).

## SIM-MOTOR-01 — Generador estadístico por tramos y medición de 1.000 partidos — 2026-10-22

- **Nuevo modelo de resolución** `beM-sim-segment` (`src/sim/`, resultado `beM-sim-match/1`, perfil `SEM-SIM01-20261022`): generador por tramos con flujos agregados y materialización cronológica (faltas, bonus, exclusión a mitad de tramo, prórrogas), 32 capacidades y controles tácticos que alteran magnitudes antes del sorteo, 18 conciliaciones SIM, perfil editable con procedencia (heredada · derivada · SEM-SIM01) y adaptador de la entrada del detallado. No llama al resolutor detallado.
- **Laboratorio**: pantalla inicial con **Motor detallado** y **Motor ultrarrápido**, cabecera con modelo y versión, «Cambiar de motor», estado separado por modelo; pantalla SIM con Partido, Parámetros y Lote (agenda de 1.000 en Web Workers).
- **Medición real** B01/B02/B03 (1.000 partidos, agenda congelada 132×7+76): B01 un worker 15.89 s; B02 cuatro workers en frío 6.50 s (objetivo de 5 s **NO alcanzado**); B03 cuatro workers calientes 4.21 s (alcanzado; 4/4 pasadas ≤ 5 s); 1.000/1.000 válidos y B01 = B02 = B03 por caso; RSS máx. 438 MiB. Paquetes y recibo fuera de Git en `out/sim-motor01/entrega-final/`.
- Pruebas `S01-01…10`; suite completa 289/289; recorrido de Chromium 26/26 (consola 0, red 0). Referencia del detallado intacta (83–98, 6.684 sorteos; 176 archivos deportivos idénticos). Aplicación `SIM-MOTOR-01`; motor detallado, perfil y export sin cambio. **Pendiente de Dennis.** Ver [`docs/tecnico/sim-motor01.md`](docs/tecnico/sim-motor01.md).

## MOTOR-18C — Identidad del aprendizaje del laboratorio — 2026-10-22

- **C18-01 (REV18B-01):** «ya aplicado» se decide por igualdad exacta de la fuente completa (`<copia>|M<n>|<equipo>`), equipo y recibo vigente; M10/M11/M100 ya no bloquean M1 (antes `startsWith`).
- **C18-02 (REV18B-02):** un resultado solo propone y aplica aprendizaje a su propia copia (igualdad exacta de la identidad de copia de `input.labMatchId`), al dibujar y al aplicar; aviso para copia ajena, sin forzar ni transferir; el manejador obsoleto se rechaza sin tocar ninguna copia.
- Pruebas T18C-01…04 sobre los manejadores reales con DOM mínimo; sin cambio deportivo (176 archivos de `src/`/`data/` idénticos). Aplicación `MOTOR-18C`; motor, perfil, entrada y export sin cambio. **Pendiente de Dennis.** Ver [`docs/tecnico/motor18c.md`](docs/tecnico/motor18c.md).

## MOTOR-18B — Cierre de familiaridad y mayor diferencia de Polivalencia — 2026-10-22

- **Curva de Polivalencia:** factor de aprendizaje lineal por tramos con cinco anclajes administrables (1→0,25 · 8→0,50 · 16→1,00 · 24→2,00 · 30→2,50; `SEM-MOTOR18B-20261022`, semillas del encargo, sin calibración). P24 aprende con el cuádruple de factor que P8; P16 = 1 exacto; los perfiles de MOTOR-18 conservan su factor lineal. Nada deportivo cambia: la Polivalencia sigue sin entrar en el partido.
- **R01–R06:** Preparación edita la copia de aprendizaje activa; el bloqueador efectivamente usado entra en los participantes de la familiaridad (caso fijo −0,045 logit; los seis diagnósticos pasan de 35 operaciones con bloqueador ausente a 0); secuencia de sesión, de instancia y de encuentro persistidas (entrenar → recargar → entrenar); aprendizaje de partido solo desde exposición terminada y sesiones validadas; estimación y resolución con el mismo contexto conocido (la cobertura solo cuenta en su interacción). `min_tenths` = décimas de segundo.
- **Campaña** `MOTOR18B-CIERRE-20261022` (36 ejecuciones planificadas) y paquetes fuera de Git. Motor `0.18.1-MOTOR18B`, `FAM/LEARN-MOTOR18B-R1`, `ESE-MOTOR18B-R1`; `beM-match-input/7` y `beM-match-export/10` sin cambio de esquema. **Pendiente de Dennis.** Ver [`docs/tecnico/motor18b.md`](docs/tecnico/motor18b.md).

## MOTOR-18 — Familiaridad táctica, roles, posiciones y aprendizaje — 2026-10-21

- **Conocimiento:** 62 niveles por jugador (posiciones, roles, 30 módulos) y ajuste logit único por operación en la calidad de la oportunidad y el avance presionado (máx. 0,30 por lado, SEM18); exposición acumulada sin aprender durante el partido; camino neutral exacto frente a CONTROL17B.
- **Aprendizaje:** Polivalencia y enseñanza, reaprendizaje, retención (posición 30 → 26,4 a 3650 días) y aplicación idempotente con deshacer; laboratorio de sesión, copias de aprendizaje y vista por audiencia.
- **Auditor:** R17B-SENS-01 (todas las entradas dependientes de la operación), AUD11 clasificado y sensibilidad de conocimiento aparte.
- **Campaña** `MOTOR18-CIERRE-20261021` (36 ejecuciones) y paquetes fuera de Git. Motor `0.18.0-MOTOR18`, `beM-match-input/7`, `beM-match-export/10`. **Pendiente de Dennis.** Ver [`docs/tecnico/motor18.md`](docs/tecnico/motor18.md).

## MOTOR-17B — Cierre técnico y auditoría acotada — 2026-10-21

- **Organización efectiva (B17-01):** `defense_org` del registro esencial es el código de la organización vigente antes de cada hecho (plan, orden aplicada, alternativa), leído con el mismo `orgAt` del análisis; la intención de intervención va en `defense_intervention`; `ESE-MOTOR17B-R1` y semántica explícita; un esencial anterior se declara histórico.
- **Sensibilidad (B17-02):** las 32 capacidades llegan a la salida pertinente de su operación real; las operaciones se extraen a funciones puras de `formulas.js` que usan a la vez el productor y el auditor; base reconstruida frente a la conservada con tolerancia declarada; hasta ocho contextos reales por capacidad (≤ 768 filas).
- **AUD05 (B17-03):** estado y motivos derivados de la evidencia (exposición, registro y contraste separados), una única ejecución como origen de resumen, CSV, informe e interfaz.
- **Robos (B17-04):** la recogida controlada sin interceptor previo se acredita al recuperador y la rama de robo directo comparte procedencia (`EST/ACTA-MOTOR17B-R1`, `SEM-MOTOR17B-20261021`); solo estadístico, deporte idéntico a CONTROL17 salvo créditos y derivados.
- **Evidencia (B17-05):** campaña `MOTOR17B-CIERRE-20261021` (30 casos lógicos, 72 ejecuciones planificadas: CONTROL17 `01c8ade` frente a M17B), paquete rápido, índice, evidencia detallada y recibo de verificación fuera de los ZIP, comprobador `m17b-verify-delivery.py`, descarga real desde Cierre y comprobación documental en copia limpia.
- Motor `0.17.1-MOTOR17B`, export `beM-match-export/9` sin cambio de esquema; referencia 83–98 / 6.684 sorteos sin cambio con P0. Calibración general, rendimiento masivo, aceptación manual y FIBA integral **siguen pendientes**. **Pendiente de Dennis.** Ver [`docs/tecnico/motor17b.md`](docs/tecnico/motor17b.md).

## MOTOR-17 — Ajustes, rendimiento y auditoría de cierre — 2026-10-18

- **Crédito y registro:** criterio único de robo por pérdida viva recuperada con control en las rutas organizada, avance, saque y balón suelto (solo estadístico; `EST/ACTA-MOTOR17-R1`); cierre de registro de las cadenas de saque (9 → 0 abiertas); identidad global en la auditoría (`matches`, contextos), `team_index` explícito, `tope` registrado en cada término de receta (sensibilidad exacta), `resumen.json` de auditoría.
- **Defecto hallado con la candidata:** responsabilidad obsoleta tras un relevo en la posesión abortaba un partido de cien; corregido sin cambiar los que ya terminaban.
- **Rendimiento:** optimización exacta (poda, memo en seco, claves sin cadenas, huella sin asignaciones; ≈ 7 %, salida idéntica); objetivo de cien en cinco segundos **no alcanzado** (≈ 30 s); cien y doscientos medidos de verdad en proceso nuevo.
- **Propuesta numérica (sin aceptar):** `energy.costPerLiveMinute` 2 → 3 (C17-01) / 3,5 (C17-02, elegida para el cierre antes de abrir resultados); Panel con borrador no activo.
- **Campaña de cierre** `MOTOR17-CIERRE-20261018` (R0 frente a R17, 472 ejecuciones + 600 de coste) y paquetes para ChatGPT fuera de Git.
- Motor `0.17.0-MOTOR17`, `SEM-MOTOR17-20261018`, export `beM-match-export/9` sin cambio de esquema; referencia 83–98 / 6.684 sorteos sin cambio con la base. **Pendiente de Dennis.** Ver [`docs/tecnico/motor17.md`](docs/tecnico/motor17.md).

## MOTOR-15B — Cierre de MOTOR-15 y diagnóstico técnico de robos — 2026-10-18

- **Norma:** RG-I03 administra el punto concedido, la técnica de categoría 2 al defensor y un libre adicional real, con una única reanudación; art. 45 numerado (45.4.1–45.4.8, 45.6). Procedencia: síntesis de ChatGPT; sin lectura directa de Claude.
- **Auditorías:** fuentes reales identificadas (el lote analizado en MOTOR-15 no contenía los C15); C15-01…05 reproducidos con semillas explícitas; AUD17 por ámbito y tarea (C15-05 leído aparte); AUD26 clasificado por cadena.
- **Robos:** defecto de crédito demostrado y corregido (balón suelto ganado en disputa real): hechos, sorteos y marcador idénticos, solo cambia el crédito (`EST/ACTA-MOTOR15B-R1`); coeficientes conservados; toque defensivo no representado (MOTOR-16/17).
- **Otros:** relevo obligatorio antes del tiempo muerto (defecto latente de MOTOR-15), cierre legible de cadenas de saque, guion de C15-06 aplicado (en MOTOR-15 no se aplicó), `bytes` UTF-8 reales.
- Motor `0.15.1-MOTOR15B`, `SEM-MOTOR15B-20261017`; referencia 83–98 / 6.684 sorteos sin cambio. **Pendiente de Dennis**; benchmark no repetido; objetivo de coste y calibración pendientes. Ver [`docs/tecnico/motor15b.md`](docs/tecnico/motor15b.md).

## MOTOR-15 — Cierre funcional, compatibilidad y rendimiento del mundo — 2026-10-17

- **Panel:** corregido «reading 'policies'» con perfiles anteriores (sin `coach`); tarjeta de compatibilidad y recuperación explícita, sin convertir ni activar nada solo.
- **Cambio deportivo versionado** (`SEM-MOTOR15-20261017`, motor `0.15.0-MOTOR15`, `export/9`): técnicas/contadores, compensación y cola del art. 43, correcciones del art. 45, tiro pendiente, interferencia condicionada, asistencias causales, estado propio por tramo, REC10-01/02. Referencia 83–98 / 6 684 sorteos; con semillas a cero = MOTOR-14. Semillas sin calibrar.
- **Mundo:** nivel `world-essential`, pool persistente de workers, huella incremental `TRAYINC-MOTOR15-R1`, pestaña **Cierre**, paquetes de revisión rápida y detallada con comprobador.
- **Completado técnicamente**; **pendiente de Dennis** (recorrido manual); **evaluación estadística pendiente** (MOTOR-16/17); **objetivo de coste no alcanzado** (≈27 s por 100 partidos frente a 5 s).
- Ver [`docs/tecnico/motor15.md`](docs/tecnico/motor15.md).

## MOTOR-14 — Rendimiento, cierre funcional y candidato a motor v1 (parcial) — 2026-10-17

- **Sin cambio deportivo en la referencia** (`20261016` = 83–103, 6 505 sorteos, misma huella de trayectoria); motor `0.9.0-MOTOR09` y `export/8` sin cambios.
- Siete capacidades antes sin receta (TEC17, TEC18, MEN02, MEN03, MEN06, MEN07, FIS06) registradas desde su cálculo y contrastadas (+1/+3/+5) con operaciones puras.
- Guardar/continuar real (`beM-match-snapshot/1`), almacén atómico `out/saves/`, API y tarjeta en Partido; continuación = rama de laboratorio.
- Inferioridad natural (vacantes sin jugador fantasma), retirada externa reproducible y terminación por falta de jugadores (art. 21 según el encargo; resultado adjudicado distinto del de cancha); extensión `SEM-MOTOR14-20261017`.
- Equivalencia entre modalidades/velocidades/registro/continuación, AUD29 ejecutable (`npm run equivalence`), fachada `src/engine`, `npm run cost`, `scripts/closure-inventory.js` y dos optimizaciones neutrales (completo −55 %, reducido −32 % en este entorno).
- **Parcial**: ver [`docs/tecnico/motor14.md`](docs/tecnico/motor14.md) §6 (interferencia/tiro en vuelo, técnicas, art. 45, estado por tramo, pestaña Cierre, campaña y navegador sin hacer). Pendiente de validación de Dennis.

## MOTOR-13 — Auditorías, sensibilidad y calibración — 2026-10-17

- **Lectura y diagnóstico; sin cambio deportivo**: referencia `20261016` sigue en **83–103** con 6 505 sorteos y la misma huella de trayectoria; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios.
- `src/audit/`: catálogo **AUD01–AUD32** con evaluador y estados separados (implementación, registro, exposición, resultado, revisión); lectura de lote conservado o paquete verificable con integridad previa; proyección por intento con caché; hallazgos navegables; matriz de **32 capacidades** con contraste de cálculo fijo +1/+3/+5 (`effectiveAbility`, extraída sin cambiar semántica); fiabilidad por mecanismo (cinco intervalos fijos, Brier descriptivo); concentración y bucles como avisos; referencias sin rangos inventados.
- Pestaña **Auditorías**, API `/api/audit/*`, paquete `beM-audit-package/1` con comprobador (`npm run audit:check`), extensión `SEM-MOTOR13-20261017` (tabla `audit`, 25 filas LAB01) y versión `MOTOR-13`.
- **Campaña inicial**: doce contrastes EXP13-01…12 × 2 variantes = 24 encuentros (plan congelado antes de ejecutar); el lector dejó 8 con la conciliación analítica en fallo: **defecto de lector de MOTOR-10 corregido** (quintetos con los mismos jugadores en puestos distintos contaban doble; filas con puntos sin tiempo se descartaban) y campaña repetida con las mismas semillas (24/24 válidos, trayectorias idénticas). Tres defectos de auditor corregidos (AUD07, AUD13, AUD26).
- **Primer ciclo: base mantenida** con evidencia y límites (una señal aislada |z| ≈ 2,1 entre 13 mecanismos; muestra de 4 partidos completos); reserva de validación sin lanzar; ninguna candidata. Bandera `allowBaseOps` en lotes y columna aditiva `lineup_ids` en `quintetos.csv`.
- Pruebas: 9 grupos nuevos. Documentación: [`docs/tecnico/motor13.md`](docs/tecnico/motor13.md), [evidencia](docs/tecnico/evidencia-motor13/README.md), [recorrido manual](docs/prompts/MOTOR-13-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-12 — Simulación masiva y extracción completa — 2026-10-17

- **Orquestación, registro y exportación; sin cambio deportivo**: referencia `20261016` sigue en **83–103** con 6 505 sorteos (con registro completo y reducido, misma huella de trayectoria); motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios.
- Pestaña **Lotes**: repetir enfrentamiento, cruces y pares elegidos con cantidades desglosadas (12 equipos → 66 pares → 132 casos → 264 ejecuciones con dos variantes), localía fija/ida-vuelta/alternada (sin efecto deportivo), variantes con diferencias exactas o desde LAB11, tres semillas distintas (lista `LOT-SEED-R1` congelada por adelantado), snapshot efectivo completo, progreso responsive, detener tras el actual, continuar sin duplicar, reintento explícito y recuperación tras reinicio (el intento en curso se repite desde su inicio congelado).
- Servidor local con `worker_thread`, escritura progresiva y atómica en `out/batches/` (confirmación por directorio + índice append-only), estados de trabajo y de ejecución que reconcilian, bloqueo de continuación con versiones distintas.
- Registro diagnóstico completo capturado de las operaciones existentes (sin sorteos nuevos): hechos, órdenes (incl. programadas), estados/episodios, recetas con capacidad base/efectiva y peso, distribuciones, oportunidades, entrenador, memoria y **todos** los sorteos con ordinal; nivel reducido y prosa opcionales.
- Paquete **`beM-analysis-package/1`**: ZIP autocontenido con 15 tablas CSV, JSONL, diccionario, guía para ChatGPT, resumen, agregados (tasas por exposición, distribuciones con cuantiles/n−1, comparación base/candidata con pares incompletos, lectura táctica, capacidades), auditoría y cobertura; partes por casos completos con índice y fragmentación por secuencia; **tres huellas separadas** (archivo, entrada, trayectoria).
- **`npm run batch:check`**: 15 controles (hashes, registros lógicos, duplicados, referencias, conteos, marcador/minutos, sorteos, agregados recalculados, permisos) sin re-simular; detecta archivos alterados, filas duplicadas y referencias rotas.
- Extensión `SEM-MOTOR12-20261017` (tabla `batch`, seis filas LAB01), versión común `MOTOR-12`, favicon declarado, corrección de AN08 en la conciliación analítica (hallazgo del lote de cierre).
- ****161 pruebas** (12 nuevas)**, lote de cierre de diez encuentros reales verificado, Chromium automatizado con descargas reales. Documentación: [`docs/tecnico/motor12.md`](docs/tecnico/motor12.md), [recorrido manual](docs/prompts/MOTOR-12-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-11 — Población de referencia, generador y escenarios — 2026-10-17

- **Datos, lectura e interfaz; sin cambio deportivo**: referencia `20261016` sigue en **83–103** con 6 505 sorteos; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios (un `export/8` anterior sigue reproduciéndose).
- Doce equipos y 144 fichas seleccionables (A/B) con instancias sin colisión, revisión R1 de EQ07-J01 (40 años; R0 conservada), doce planes naturales materializados (`SEM-MOTOR11-20261017`, generados por `scripts/build-motor11-data.js` y verificados por `data:check`), inspección y edición completa de fichas, +1/+3/+5 con deshacer exacto y variantes con diferencias.
- Generador correlacionado reproducible (FNV-1a → xorshift32, streams por campo, huella SHA-256), guardado con procedencia; escenarios LAB11-00…12 como datos, export/import `beM-scenario/1`, guardado local y resultados individuales sin lotes.
- Pendientes de MOTOR-10: cuota de cierres y producción por 100 en presencia completa; organización efectiva por tiro; OB05 y corte instrumentados (`instr`, fuera de la proyección deportiva); lateralidad y desvío de asistencias confirmados sin productor; actor observable separado de la configuración privada.
- Versión común `src/version.js` (consola, cabecera, Panel › Inicio) separada de motor, perfil, dataset y formato de export.
- **149 pruebas** (8 nuevas), cinco partidos de integración conciliados, Chromium automatizado. Documentación: [`docs/tecnico/motor11.md`](docs/tecnico/motor11.md), [recorrido manual](docs/prompts/MOTOR-11-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-10 — Análisis, estadísticas y resumen — 2026-10-17

- **Lector del partido, sin cambio deportivo**: capa `src/analysis/` sobre los hechos y el acta de MOTOR-09. La referencia `20261016` sigue en **83–103** con los mismos 6 505 sorteos; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios (el acta no se tocó: la política de asistencias de MOTOR-09 se **auditó** contra los estados funcionales y se confirmó; el criterio procede del extracto de ChatGPT, el PDF no se abrió).
- Catálogo común de 26 indicadores (identidad, naturaleza, unidad, fuente, universo, cálculo, cobertura, información, muestra, evidencia) con numerador y denominador del mismo universo, `—` con motivo en lugar de ceros y agregación ponderada; indicadores no registrados o dependientes de datos declarados, no rellenados.
- Evolución (curva escalonada, ventaja máxima, empates, cambios de líder, tiempo por delante, parciales sin respuesta, final ajustado 120 s / 5 puntos previos), mapa sectorial (zona real, sin lateralidad inventada) y calidad previa, origen único de posesión y ejecuciones encadenadas, libro/director (solo información propia), organización/cobertura/ayuda/responsabilidades, saques banda/fondo, trabajo sin balón derivado de hechos existentes, quintetos/grupos/on-off descriptivo (completas, mixtas y parciales separadas) y antes/después de una orden aplicada.
- Resumen con hasta tres claves sustentadas y deduplicadas (siembras SEM editoriales), líderes con empates, crónica por periodo sin futuro, recomendaciones condicionadas REC10-01/02 y exportación analítica (JSON `beM-analysis-export/1`, CSV, Markdown) con audiencia pública/propia/diagnóstico aplicada **antes** de construir consultas, textos, caché y export.
- Pestaña «Análisis» en el laboratorio, catálogo en Panel › Estadística e información, extensión `SEM-MOTOR10-20261016` (23 filas editables, `optional`: un perfil anterior sigue jugando y reproduciéndose), conciliación analítica de 23 comprobaciones, matriz de cobertura heredada y tres listas de pendientes separadas.
- **141 pruebas** (10 nuevas), cinco partidos de integración con acta y análisis conciliados, recorrido automatizado en Chromium. Documentación: [`docs/tecnico/motor10.md`](docs/tecnico/motor10.md), [recorrido manual](docs/prompts/MOTOR-10-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-09 — Reglamento, administración y acta — 2026-10-16

- Matriz normativa REG (19 filas) con **estado de contraste por fila** (`contrastada`, `heredada`, `provisional`, `pendiente`): los PDF de FIBA (S09-01 a S09-04) devolvieron HTTP 403, así que ninguna fila es lectura directa del PDF; lo contrastado procede del texto del encargo §4.3. La administración de faltas defensivas, la disruptiva (libres y saque con 14 s) y la descalificación acumulada consultan ya la matriz. Técnicas/antideportivas, compensación de sanciones y art. 45 quedan **tipadas sin ejecución** (diagnóstico, no una regla inventada).
- Series de libres como unidad causal (concedidos, administrados, válidos, repetidos, anulados), sanciones combinadas en cola con reanudación única, disponibilidad/inferioridad y terminación administrativa (casos preparados; el motor natural falla con diagnóstico si no hay cinco elegibles).
- Acta completa desde los hechos: AS a canasta/libres, REC, TAP/TREC, FC/FR, más-menos por intervalos de presencia con secuencia estable, VAL, DNP y participación sin tiempo, sujetos colectivos, parciales, posesiones beM, finalizaciones F y dos particiones de puntos. **Un fallo con falta en acción de tiro deja de contar como intento de campo.**
- Conciliación consultable (33 comprobaciones con universo, esperado y observado), revisiones estadística/reglamentaria/técnica con propagación y casos de laboratorio preparados.
- Pendientes de MOTOR-08: informe de la memoria con denominadores separados, auditoría de claves y rotación (sin tocar la capacidad) y **ruta B** (cobertura preparada dentro de la acción, sin ventana, sin cambio de plan, sin bonus).
- Extensión `SEM-MOTOR09-20261016`, `beM-match-export/8` (el `export/7` se rechaza con motivo y se conserva), vistas «Reglamento» y «Estadística e información» del panel.
- **Cambia los resultados** (referencia `20261016`: 88–110 → 83–103, por la ruta B). 131 pruebas (13 nuevas). Documentación: [`docs/tecnico/motor09.md`](docs/tecnico/motor09.md), [recorrido manual](docs/prompts/MOTOR-09-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-08 — Entrenador automático y memoria defensiva — 2026-10-16

- Entrenador automático con tres políticas (ENTREF01–03, catorce parámetros literales del encargo) y cinco ámbitos delegables: rotaciones contextuales con estabilidad, librillo de faltas ordenado, tiempos muertos con causa, reserva y enfriamiento, ajustes tácticos y finales por tabla de contextos. Una sola utilidad 1–30 compartida con la sustitución; la exclusión reglamentaria no es delegable.
- Memoria defensiva colectiva (máximo ocho patrones, clave semántica, decaimiento 2^(−n/7), saturación 4, descarte 0,25) con exposición registrada antes del acierto; reconocer no cambia ninguna probabilidad y las respuestas son órdenes de plan validadas en su frontera.
- Contrato de información: el entrenador solo usa su vista permitida (sin datos rivales privados ni futuro). Órdenes manuales con bloqueo `lockUntil` y orden `coachDelegation`; una petición manual de tiempo muerto prevalece sobre la automática.
- Salvedades de MOTOR-07: falta disruptiva (lanza quien la recibe, saque con 14 s exactos), COB04 en entregas con fallback declarado, recepción forzada de saques no garantizada, mapa acotado de MEN02/03/04.
- Extensión `SEM-MOTOR08-20261016` (verificada por `npm run data:check`), perfil con filas `coach.*`/`memory.*`, vistas «Entrenador» y «Memoria», interfaz de preparación, tarjeta del partido y diagnóstico, `beM-match-input/6` y `beM-match-export/7` (el `export/6` se rechaza con motivo).
- **Cambia los resultados** (referencia `20261016`: 83–97 → 88–110). 118 pruebas (12 nuevas). Documentación: [`docs/tecnico/motor08.md`](docs/tecnico/motor08.md), [recorrido manual](docs/prompts/MOTOR-08-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-07 — Capacidades, energía, Forma y momentos completos — 2026-10-16

- Uso causal comprobado de las 32 capacidades (mapa y 32 sondas): nuevos consumidores de FIS01 (acceso de transición), MEN02/MEN03 (lectura del defensor real), MEN06 (amplitud de los momentos) y MEN07 (presión); energía selectiva sin cambios.
- Forma recibida y estable, presión = máximo(importancia, tensión), tres momentos individuales con actualización perezosa en tiempo deportivo, T colectivo sin aporte directo a la conversión, pausas como marcadores y episodios EPI01–EPI06 con evidencia y deduplicación. Perturbación neutral `p + α·Z·min(p, 1−p)` y vector de suma cero sobre la salida final.
- Extensión `SEM-MOTOR07-20261016` (anexo A literal verificado por `npm run data:check`), 644 filas con consumidor, entradas de estados e importancia, copias de contraste C00–C06, vistas propia/rival/diagnóstico, `beM-match-export/6` (el `export/5` se rechaza con motivo).
- Salvedades de MOTOR-06 contrastadas de forma acotada: corregidos ESP15 y el envío forzado de saque; COB04 en entregas, libres de la disruptiva y etiquetas ESP quedan pendientes (ver `DECISIÓN REQUERIDA`).
- **Cambia los resultados** (referencia `20261016`: 82–97 → 83–97). 106 pruebas (11 nuevas). Documentación: [`docs/tecnico/motor07.md`](docs/tecnico/motor07.md), [recorrido manual](docs/prompts/MOTOR-07-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-06 — Transición, decisiones espontáneas y saques — 2026-10-16

- Catálogo ESP01–ESP20 como capa de clasificación sobre un único flujo de oportunidades (llamada, recurso autónomo y decisión directa comparten ejecución; sin cuotas ni sorteos por ESP), transición con continuidad y urgencia, seis saques ofensivos (SaqB01–03, SaqF01–03) y seis respuestas (DSaqB01–03, DSaqF01–03) con plazo único de 5 s y tres relojes distintos, y llamada puntual de saque.
- Cierre de salvedades de MOTOR-05: POS05/06 con pase inicial real, POS14 con director candidato, coberturas en entregas e indirectos, decisión única de robo, disruptiva y flagrante como categorías distintas.
- Extensión `SEM-MOTOR06-20261016` (anexo A literal verificado por `npm run data:check`), filas con consumidor, órdenes de saque, interfaz de saques, diagnóstico con numerador y denominador, JSON `beM-match-export/5` (el `export/4` se rechaza).
- **Cambia los resultados** (referencia `20261016`: 70–100 → 82–97). 20 pruebas nuevas. Documentación: [`docs/tecnico/motor06.md`](docs/tecnico/motor06.md), [recorrido manual](docs/prompts/MOTOR-06-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-05 — Defensa completa y cierre de salvedades de MOTOR-04 — 2026-10-16

- Seis organizaciones (individual, zonas 2–3/3–2/1–3–1/1–2–2 y box and one) como **funciones y responsabilidades** (referencia frente a responsabilidad actual), cinco estilos defensivos con efecto en elecciones y encargos, tres alturas de presión (avance presionado, violación de 8 s), cuatro coberturas con persistencia del cambio, doce roles, marcas, ayudas con relevo y las tres especiales (falta táctica con sanción antideportiva administrada, doble a jugador, no abandonar tirador); box and one con objetivo, alternativa individual y ORG02 por ausencia.
- Extensión `SEM-MOTOR05-20261016` (cifras del anexo A verificadas por `npm run data:check`), filas `defense.*` con consumidor, órdenes defensivas con validación conjunta, controles en Preparación y dirección en vivo, panel › Repertorio defensivo, JSON `beM-match-export/4` (los `export/2` y `/3` se rechazan sin tocarse).
- Salvedades de MOTOR-04: V03 corregido (la posición nominal ya no filtra candidatos), V05 y V09 verificados, V01 contrastado de forma independiente (sin aprobación en bloque; quedan POS05/06 y POS14 pendientes de decisión), 90–126 revisado sin evidencia de error.
- **Cambia los resultados** (referencia `20261016`: 90–126 → 70–100). 75 pruebas (12 nuevas). Documentación: [`docs/tecnico/motor05.md`](docs/tecnico/motor05.md), [recorrido manual](docs/prompts/MOTOR-05-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-04 — Ataque posicional completo — 2026-10-16

- Siete estilos ofensivos con efecto causal (transición, elaboración, riesgo y «después del tiro» ya no son valores declarados) e instrucción de media distancia; seis disposiciones como funciones; quince roles ofensivos; libro por familias con POS01–POS15 y CONT01–CONT09 sobre tareas reutilizadas (nueve fichas referencian la receta de su donante); decisión del receptor con su propia lectura; escalera de negación (CONT06/CONT07).
- Encargos de rebote y balance con coste real (transición rival, odds ×1,2 por referencia); se retira el efecto abstracto de carga en la nueva ruta (sustitución identificada).
- Extensión `SEM-MOTOR04-20261016` (cifras del anexo A verificadas por `npm run data:check`), filas nuevas con consumidor, panel › Repertorio, candidata explícita desde perfiles anteriores, órdenes `disposition`/`roles`, registro de disposición/funciones/decisión/encargos, JSON `beM-match-export/3`.
- **Cambia los resultados** (referencia `20261016`: 94–89 → 90–126). 63 pruebas. Documentación: [`docs/tecnico/motor04.md`](docs/tecnico/motor04.md), [recorrido manual](docs/prompts/MOTOR-04-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-03 — Panel administrable, perfiles y comparación — 2026-10-16

- Diccionario de ~390 filas del perfil (SUP01) con ficha, clase (balance/contenido/reglamento/invariante), cobertura real y consumidor; literales del código convertidos en filas con su valor exacto (`SEM-MOTOR03-20261016`). Equivalencia deportiva con la referencia anterior comprobada.
- Panel de ajustes: inicio, mesa por 7 preguntas, tabla maestra con filtros, vistas temáticas, catálogo 81 + 4, edición tipada y conjunta, ciclo de perfiles (borrador → validación → publicación → activación → restauración), comparador de un partido por perfil e intercambio JSON.
- Perfil efectivo congelado por partido, `profileRef` en el resultado y filas consultadas por hecho en el detalle diagnóstico. 53 pruebas.
- Documentación: [`docs/tecnico/motor03.md`](docs/tecnico/motor03.md), [recorrido manual](docs/prompts/MOTOR-03-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-02 — Tres modalidades y dirección manual — 2026-10-16

- Avance por fronteras (`step()`), ventanas reglamentarias como frontera propia y `MatchSession` como único controlador: simulado total, por cuartos (con prórroga) y por tiempo a x2/x4/x8/x16 con pausa. Misma semilla y órdenes ⇒ mismo deporte en cualquier modalidad.
- Órdenes con ciclo de vida (estilos, prioridades, director, llamada, sustitución/quinteto, delegación, tiempo muerto), precedencia, lotes atómicos y quinteto manual; tiempos muertos con cupos y recuperación única (extensión SEM `SEM-MOTOR02-20261016`).
- JSON `beM-match-export/2` y reproducción desde archivo (`npm run replay`); laboratorio con panel de dirección.
- Corrección B01: el lanzador de libres ya no sale antes de tirar (cambia resultados de referencia de MOTOR-01). 40 pruebas.
- Documentación: [`docs/tecnico/motor02.md`](docs/tecnico/motor02.md), [recorrido manual](docs/prompts/MOTOR-02-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-01 — Primer partido completo y laboratorio inicial — 2026-10-16

- Motor por acontecimientos en `src/match/` (azar xorshift32, energía, reglas FIBA 2026 del funcional, fichas POS01/05/07/09/11/14, continuaciones, recursos ESP, relevo básico) y laboratorio en `src/lab/` (`npm run dev`).
- Perfil SEM y 144 fichas extraídos programáticamente del prompt archivado ([`data/`](data/catalog.json)); provisionales, sin calibrar.
- Acta proyectada desde los hechos, relato por posesiones, detalle calculado y descarga JSON. 23 pruebas (`npm test`).
- Documentación: [`docs/tecnico/motor01.md`](docs/tecnico/motor01.md), [recorrido manual](docs/prompts/MOTOR-01-recorrido-manual.md). Pendiente de validación de Dennis.

## DOC-001 — Organización documental y normas — 2026-10-16

- Incorporadas las normas de trabajo N01–N12 y las responsabilidades en [`AGENTS.md`](AGENTS.md) y [`CLAUDE.md`](CLAUDE.md) (N11 y N12 son nuevas).
- Funcional unificado del motor importado y seccionado por temas en [`docs/motor/`](docs/motor/README.md) (34 capítulos en 74 archivos, sin resumir). Copia original congelada en [`docs/historico/motor/`](docs/historico/motor/unificado-original.md) con SHA-256; completo vigente generado en [`docs/exportados/`](docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md).
- Índices, mapa por tareas, estado, registro de decisiones, catálogo y plantilla de prompts. Prompt archivado: [`DOC-001`](docs/prompts/DOC-001-organizacion-documental-y-normas.md).
- Utilidades `scripts/docs/build_engine_docs.py` y `check_engine_docs.py`. Comprobaciones: ver [`docs/motor/COBERTURA.md`](docs/motor/COBERTURA.md).
- Sin implementación del motor ni del laboratorio. Los ocho originales no fueron suministrados. Pendiente de validación de Dennis.
