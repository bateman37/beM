# MOTOR-14 — Rendimiento, cierre funcional y candidato a motor v1 (parcial)

> [Prompt archivado](../prompts/MOTOR-14-rendimiento-cierre-y-motor-v1.md) · [Recorrido manual](../prompts/MOTOR-14-recorrido-manual.md) · [Estado](../estado.md) · evidencia en [`evidencia-motor14/`](evidencia-motor14/)

**Veredicto honesto: «MOTOR-14 parcial / candidato con bloqueos».** Se implementó y verificó el núcleo del cierre (registro de las siete capacidades, guardar/continuar real, inferioridad natural y terminación, equivalencia + AUD29, contrato para el manager, optimización neutral medida). **No** están cerrados: tiro en vuelo/interferencia, técnicas/antideportivas, compensación y art. 45, estado propio por tramo, asistencias con ruptura causal, REC10-01/02, pestaña «Cierre» y paquete de cierre, campaña C14-03…06 y recorrido de navegador. Detalle en §6.

## 1. Base

Rama `claude/busy-edison-b1fmnc`, partida del commit real de MOTOR-13 `16acd45` (la PR de MOTOR-13 sigue sin fusionar; no se fusionó nada). Baseline comprobado antes de tocar: 170 pruebas correctas, referencia `20261016` = 83–103, 6 505 sorteos, huella de trayectoria `ed353769…`.

## 2. Qué se hizo (por bloque)

| Bloque | Resultado | Verificación |
|---|---|---|
| Siete capacidades | `receta:rebote.fuerza/captura` (TEC17, TEC18, FIS05), `seleccion.lectura` (MEN02, MEN03), `lectura_defensiva`, `presion.perdida:*` (MEN07), `momento.consistencia` (MEN06), `gasto_resistencia` (FIS06): se registran desde el MISMO cálculo (sin sorteos ni cálculos nuevos; solo con registro completo). Contraste +1/+3/+5 con operaciones puras (`formulas.js`: `enduranceFactorAt`, `readingQRaw`, `consistencySigmaAt`, `pressureLossLogit`) con salida y unidad propias; Visión/Decisiones informan del cambio de opción más probable recalculando la mezcla registrada del mismo hecho. Proyección `PRJ-MOTOR14-R1`. | `tests/motor14` grupo 1; trayectoria idéntica con registro completo y reducido |
| Guardar/continuar | `src/match/snapshot.js` (isomorfo): estado vivo del núcleo + entrada y perfil congelados + posición exacta del generador (incl. sorteos pendientes de asociar) + seguimiento de filas; códec de grafo que conserva referencias compartidas. `SaveStore` (escritura atómica, confirmación por `meta.json`, SHA-256, rechazo sin tocar), `/api/saves`, tarjeta «Guardar y continuar» en Partido (la continuación es una **rama de laboratorio**). | grupos 2 y 3: continuar desde 4 fronteras (con órdenes pendientes y frontera de periodo) = mismo futuro; guardar no altera el partido vivo |
| Inferioridad natural | `onCourt` solo con presentes; `vacate` (vacante sin sustituto), `withdrawPlayer` (retirada externa, comando reproducible; aplazada si hay libres pendientes), `checkAvailability` + `terminate(kind:'insufficient_players')`: art. 21 (conserva el marcador favorable o 2–0; **no** «menos de cinco» = terminación). Defensa con ranuras sin defensor; rebote ofensivo sin cargadores = 0. Lector de quintetos con ocupación exacta. Extensión `SEM-MOTOR14-20261017` (fila RG-T02, tres fuentes F14, filas del diccionario). | grupo 6 + fuzz de 120 semillas (reducido y completo): 0 errores, 0 jugadores fantasma, conciliación válida |
| Equivalencia y AUD29 | `equivalence.js` (proyección de comparación, diferencias localizadas, conductor con guion por frontera deportiva), `npm run equivalence` → informe sellado `beM-equivalence-report/1`; AUD29 lo LEE (conforme / inconcluso por familias sin cubrir / defecto / informe alterado). | informe real: 8 comparaciones IGUALES (3 modalidades, x2–x16, reducido, guion por cuartos, 3 continuaciones) |
| Contrato manager | `src/engine/index.js`: `validateEntries`, `createEncounter`, `advance(step|possession|period|end)`, `requestOrder` (autoridad), `retirePlayer`, `query(public|own|diagnostic)`, `snapshot/restoreEncounter`, `result()` (final normal / parcial / adjudicación / fallo técnico), `readHistory`. Ver [contrato](motor14-contrato.md). | grupo 5, incluido aislamiento con dos encuentros alternados |
| Coste | `npm run cost`, perfil de CPU, dos optimizaciones neutrales (memo de la curva de severidad; memo de puntuaciones en la asignación defensiva). | huella de trayectoria idéntica antes/después en los dos casos |

## 3. Versiones y compatibilidad

App `MOTOR-14`; motor `beM-motor-0.9.0-MOTOR09` y `export/8` **sin cambios**; perfil `…+SEM-MOTOR14-20261017` (solo `regulation`); snapshot `beM-match-snapshot/1` (códec `graph-json/1`); informe `beM-equivalence-report/1`; proyección de auditoría `PRJ-MOTOR14-R1`. Baseline: `tests/fixtures/baseline-motor14.json` conserva `trajectorySha256`; solo cambia el `sha256` por la identidad del perfil. **Cambio de deporte: ninguno** en la referencia (83–103, 6 505 sorteos). Cambia, por diseño, solo lo que antes era un error (equipos sin sustituto).

| Operación | Compatible con |
|---|---|
| Leer un histórico | `export/8` y anteriores legibles; trazas antiguas NO reciben las siete recetas |
| Reejecutar desde el inicio | mismo motor y perfil congelado del archivo |
| Continuar un guardado | solo `beM-match-snapshot/1` del MISMO motor; otro motor/esquema/archivo alterado/incompleto/terminado se rechaza con motivo, sin tocarlo |

## 4. Mediciones (entorno: Node v22.22.0, 4 vCPU Xeon 2,1 GHz, 16 GiB, commit `b9e6b8c`→cambios sin confirmar; un único proceso, 5 repeticiones, calentadas tras la primera)

Simulación (mediana, ms; rango en el JSON): C14-01 completo **3054 → 1369**, reducido **766 → 523**; C14-02 completo **2976 → 1249**, reducido **804 → 531**. Mismas semillas, mismas huellas (`ed353769…`, `e8e18f92…`). La mejora grande del completo procede de que el seguimiento de filas (Proxies) multiplicaba el coste de las lecturas repetidas de la curva de severidad y de la asignación defensiva. Resto de etapas (C14-01 completo, mediana): resultado→JSON 207 ms, análisis+resumen 14 ms, guardado en frontera 337 ms, restauración 252 ms; tamaños: resultado 15,2 MB (1,76 MB gz) completo / 1,6 MB (0,24 MB gz) reducido; guardado 14,1 MB (1,3 MB gz). Pico de heap observado ≈180 MiB. **No medido**: ZIP/partes/descarga, auditoría con caché, concurrencia. Las cifras de MOTOR-12/13 (≈5,9 s) vienen de otro equipo y no se comparan.

Proyección **lineal (estimación, no lote ejecutado)** con el reducido calentado (0,53 s) y 1,6 MB/partido: 8 → 4 s y 13 MB; 24 → 13 s y 38 MB; 120 → 64 s y 192 MB; 240 → 127 s y 384 MB (completo ×2,6 en tiempo y ×9,5 en bytes). Comando para medir de verdad: `npm run batch:integration` / lotes desde la pestaña Lotes. **Aceptación del presupuesto de escala: pendiente de Dennis.** Siguiente cuello: `recipeObj/recipe/interpolate` y la asignación defensiva (perfil plano, GC 8 %); no se abordó escritura por bloques de ZIP.

## 5. Pruebas y comprobaciones reales

`tests/motor14.test.js` (6 grupos); **suite completa 176/176 correcta** (170 previas + 6), `data:check` correcto y `check_engine_docs.py` correcto. Ajustes de tests heredados (versión, identidad de perfil, baseline, comprobadores M12/M13 contra el perfil previo, el caso «el motor falla sin sustituto» que ya no es cierto). Campaña real: informe de equivalencia ≈ 9,5 partidos completos equivalentes + fuzz de inferioridad (≈180 encuentros, reducido/completo); NO se ejecutaron los 32 de §16.

## 6. Pendientes (inventario consultable en [`evidencia-motor14/inventario.md`](evidencia-motor14/inventario.md))

| Pendiente | Estado | Motivo / siguiente acción |
|---|---|---|
| Fuentes F14 | **sin lectura directa** | `assets.fiba.basketball` y `www.fiba.basketball` rechazados por el proxy (dos intentos acotados); lo contrastado es lectura de ChatGPT |
| RG-F07 técnicas/antideportivas (consecuencia), RG-C02 compensación, RG-R01 art. 45 | **pendientes** | falta el texto de arts. 36–37, 42/orden de compensaciones y 45; el encargo §7.3 no los contiene. Acumulación disciplinaria (RG-D01) ya contrastada |
| Flagrante: entrada explícita de incidencia | **no implementada** | contadores y filas existen; sin generación natural ni intake |
| Tiro en vuelo / interferencia (RG-S01) | **administrador no implementado; contenido numérico pendiente** | filas necesarias: `durationSeconds.shotFlight` (por zona) y `interference.*` (frecuencia por situación); no existen en el funcional |
| Estado propio por tramo; asistencias con ruptura; REC10-01/02 | **no cerrados** | sin productor/consulta; no se inventan |
| Pestaña «Cierre», informe/paquete de cierre exportable | **no hecho** | solo `inventario.md/json`, `coste-*.json`, informe de equivalencia |
| Campaña C14-03…06, energía < 10 (C14-05), 11 ESP, re-evaluación AUD01–32 | **no ejecutada** | el estado de las 32 auditorías NO se actualiza aquí; AUD29 sí es ejecutable |
| Navegador real | **no ejecutado** | la UI de guardados solo está verificada por sintaxis y API; recorrido pendiente |
| Referencias externas / calibración | sin cambios | base mantenida; sin referencias numéricas |
| Aceptación manual de Dennis | **pendiente** | también MOTOR-08 a MOTOR-13 |
