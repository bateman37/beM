# SIM-MOTOR-04C · convergencia estadística con el detallado: rebote ofensivo, oportunidad interior y asistencias

Estado: **ejecutado, pendiente de Dennis**. Nada de lo que sigue está «calibrado», «estadísticamente equivalente» ni «validado por Dennis». Encargo archivado en [`../prompts/SIM-MOTOR-04C-convergencia-estadistica.md`](../prompts/SIM-MOTOR-04C-convergencia-estadistica.md); recorrido manual en [`../prompts/SIM-MOTOR-04C-recorrido-manual.md`](../prompts/SIM-MOTOR-04C-recorrido-manual.md); diccionario en [`evidencia-sim-motor04c/DICCIONARIO.md`](evidencia-sim-motor04c/DICCIONARIO.md).

## 1. Alcance y versiones
- Aplicación `SIM-MOTOR-04C` (`APP_VERSION`; incluye 04B, 04, 03 y 02B) · SIM `0.3.2-SIMMOTOR04C` · extensión de filas `SEM-SIM04C-20261024` · perfil `SEM-SIM01+SEM-SIM02+SEM-SIM04+SEM-SIM04B+SEM-SIM04C` · política de conciliación `RECON-SIM04C-R1` (añade R27) · cobertura `COV-SIM04C-R1` · resultado `beM-sim-match/3`, guardado `beM-sim-snapshot/2` y esencial `/2` (campos nuevos aditivos). Los guardados de 04B se **rechazan para continuación** con su explicación y sin tocar el archivo (`tests/fixtures/sim-snapshot-04b.json` es un guardado real de 48bcdef); no se implanta un resolutor histórico.
- **Detallado sin cambio**: `src/match`, `src/population`, `src/knowledge` y `data/match` idénticos a `main` (79 archivos; referencia `20261016` 83–98 / 6.684 sorteos). Las 32 capacidades, estilos, libro, roles, director, conocimiento congelado y aprendizaje al terminar no cambian.
- Ninguna candidata se activa al abrir; cargarla es una acción explícita del panel.

## 2. Qué cambia
| Id | Tipo | Cambio |
|---|---|---|
| C04C-01 | lectura | El lector contexto×zona×calidad publica por separado **canastas con pasador representado** y **asistencias acreditadas**; en el detallado la acreditada es el crédito `ast`/`canasta` del acta (`essential.acta.credits`), no `passer != null` (CAL DET: 1.137 con pasador frente a 1.017 acreditadas en la lectura anterior). En SIM el pasador representado es el crédito causal y ambas columnas coinciden. La versión visible es 04C y el benchmark mide sin turnos de espera de otro control. |
| C04C-02 | mecanismo | Tras un rebote ofensivo válido (campo, tapón sin salida o último libre fallado) se decide **una vez** la rama: *inmediata* (continuación cercana al aro de 04B, sin pase ni ficha heredados) o *reinicio organizado* (nuevo registro terminal del mismo control, celdas organizadas admisibles del plan vigente renormalizadas, participantes y créditos propios; pase y asistencia según la política vigente, antes del acierto). Sin celdas organizadas: `reset_unavailable` y continuación inmediata. Fila `rebound.organizedResetP0` (neutral 0; con 0 o 1 no hay sorteo). Sin reloj nuevo ni segundos añadidos; la aproximación temporal es la de la continuación agregada. |
| C04C-02b | lectura | `reboundFunnel` por equipo, procedencia y rama (decisiones → FGA / falta de tiro / pérdida / otro y AST_FG/AST_FT con denominadores) en resultado y esencial; conciliación **R27** (una decisión de rama por rebote ofensivo; hechos organizados tras reinicio, putback sin ficha ni pase tras la rama inmediata; P0 = 0 y 1 respetados). Metadato `rbb` en los hechos: no entra en la huella deportiva. |
| C04C-03 | mecanismo | `opportunity.simInsideQualityLogit` (neutral 0, rango [0, 1] logit): desplaza la calidad **solo de la zona `inside`** (organizada, transición y espontánea), con objeto de calidad propio por ficha, una vez y antes del sorteo. No toca aro, media distancia ni triple. |
| C04C-03b | ajuste (fila) | `conversion.simInsideLogitOffset` (neutral 0, rango [0; 0,30] logit): **coeficiente provisional de traducción agregada** (no regla deportiva) sumado una vez al logit del tiro `inside` (`delta_sim_inside`, separado del efecto táctico y de la calidad), antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización (`estP`; allí se aplica una sola vez porque la calidad es un sorteo posterior). No toca `p0`, recetas, pendientes, tapón ni libres. |

**Descomposición de `rim`/`inside`** (§6.1): la tabla `08-CONTEXTO-ZONA-CALIDAD.csv.gz` conserva, por contexto nativo, zona y calidad, intentos, aciertos, canastas con pasador y acreditadas; las probabilidades ya calculadas siguen disponibles en el diagnóstico seleccionado (`p` condicional a ausencia de tapón; no se convierte en tasa global). No se halló una duplicación ni una traducción defectuosa que corregir: la diferencia de acierto interior se trata como aproximación estadística nombrada (filas de calidad y conversión).

## 3. Neutralidad y pruebas
- Con las tres filas a 0, los 24 casos CAL son idénticos al código real de 04B (`B04B` frente a `N04C`: huella deportiva, acta, zonas y embudo; mismos errores). El mismo control está en `S04C-01` con huellas y sorteos obtenidos con el código de 04B.
- `tests/sim04c.test.js` (S04C-01…08): neutralidad, rama 0/1/p con y sin celdas, cadena tras rebote (último libre, segundo rebote, pase nuevo), crédito frente a pasador con el detallado real, calidad y conversión de `inside` (una vez, solo inside, sin alias, respuesta a atributos), guardado/cierre/público, selector y compatibilidad con 04B. Se actualizaron expectativas de identidad de 01/04/04B y las pruebas de versión visible. Defecto hallado al probar el registro de campaña (un comentario dejó la lectura en línea desactivada): corregido antes de congelar, sin efecto deportivo.

## 4. Búsqueda limitada (solo CAL, reglas `SEL-SIM04C-R1` congeladas antes)
Reglas, etapas, agenda y hash (`selectionRulesSha256` en `plan/selection-rules.json`) congelados antes de ejecutar CAL (`freeze-cal.json`). Ocho errores separados contra DET (eP, eF, eZ, e2, eR, eI, eQ, eA), `M = max(e/b)`, guardas **uniformes frente al mismo N04C** (sin guarda acumulada de tolerancia cero), puntos de trabajo R e I no aceptados por sí mismos, selección final sobre todos los vectores completos, mejora relativa ≥ 5 % y desempate por menos filas, menor distancia normalizada e id. Fijos: 19,5 · 0,70 · 0,90 · 3 · ventaja recibida 0.

| Vector | peso aro | calidad aro | reinicio | calidad inside | conversión inside | M | dominante |
|---|---:|---:|---:|---:|---:|---:|---|
| B04B / N04C | 1 | 0 | 0 | 0 | 0 | 2,639 | eQ |
| J0 | 1,5 | 0,5 | 0 | 0 | 0 | 2,839 | eI |
| **R35** (punto R) | 1,5 | 0,5 | 0,35 | 0 | 0 | 1,971 | eI |
| R65 | 1,5 | 0,5 | 0,65 | 0 | 0 | 2,421 | eI |
| R85 | 1,5 | 0,5 | 0,85 | 0 | 0 | 3,153 | eI |
| **I50** (punto I) | 1,5 | 0,5 | 0,35 | 0,5 | 0 | 1,583 | eA |
| I100 | 1,5 | 0,5 | 0,35 | 1,0 | 0 | 1,647 | eA |
| P15 | 1,5 | 0,5 | 0,35 | 0,5 | 0,15 | 1,727 | eA |
| **P30 (elegido)** | 1,5 | 0,5 | 0,35 | 0,5 | 0,30 | **1,449** | eA |

Ocho vectores adicionales, ninguna etapa omitida (I: `eI` 0,099 y calidad forzada inside 0,20 de diferencia; P: 275/390 FGA inside normal por modelo, FG% 141/275 frente a 219/390). J0 y R85 incumplen una guarda (eI); el resto es admisible; P30 mejora M un 45,1 % frente a N04C. **`C04C-FINAL-PROVISIONAL` = P30**, no activada por defecto. Con todos los errores de CAL: eP 0,036 · eF 0,032 · eZ 0,124 · e2 0,039 · eR 0,038 · eI 0,004 · eQ 0,038 · eA 0,116: **eZ y eA quedan fuera de banda** (b 0,10 y 0,08).

## 5. Campaña emparejada (misma entrada y semilla por caso entre vectores y modelos)
Semillas nuevas `20261024|SIM04C|<bloque>|<caso>|R<réplica>` (SHA-256, 32 bits; 0 colisiones; los 8 pares V0/V1 de CONTRAST comparten semilla por diseño). CAL reutiliza las 24 entradas congeladas de 04B (input_hash idéntico al plan de 04B). VAL: doce parejas × 2 orientaciones × 2 réplicas = 48. CONTRAST: T01, T02, T05 y T07 × V0/V1 × 2 orientaciones = 16 (DET en las ocho anclas O1). DIAG = los cuatro primeros casos de VAL (cubren ambas réplicas de ambas orientaciones de la primera pareja). TECH: seis entradas CAL × recorridos auto/steps/recover.

Ejecuciones reales (SIM / detallado): CAL 240 / 24 · VAL 96 / 48 · CONTRAST 32 / 8 · TECH 18 / 0; 0 inválidas, 0 fallidas, 0 reintentos. Benchmark (4.000 partidos de lote y 1.000 de jornada) y pruebas, aparte.

### VAL (48 casos por modelo; no elige ni reajusta)
| error | banda | N04C | candidata | cambio / banda |
|---|---:|---:|---:|---|
| eP | 0,08 | 0,0907 | 0,0589 | mejora; dentro |
| eF | 0,08 | 0,0198 | 0,0280 | empeora; dentro |
| eZ | 0,10 | 0,2250 | 0,1695 | mejora; FUERA |
| e2 | 0,04 | 0,0634 | 0,0450 | mejora; FUERA |
| eR | 0,05 | 0,0472 | 0,0591 | **empeora; FUERA (contradice CAL)** |
| eI | 0,05 | 0,0512 | 0,0077 | mejora; dentro |
| eQ | 0,05 | 0,1288 | 0,0286 | mejora; dentro |
| eA | 0,08 | 0,1395 | 0,1272 | mejora; FUERA |
| M | 1 | 2,577 | 1,695 | mejora; FUERA (dominante eZ) |

Todas las guardas uniformes se cumplen. Inside: 57,6 % frente a 56,8 % del detallado (666/1.288 en N04C); calidad forzada de inside 119/1.111 frente a 11/1.193 (el detallado casi no tiene tiros forzados en inside). Asistencias: AST_FG/FGM 0,549 frente a 0,676; tras rebote ofensivo, la rama de reinicio produce AST_FG/FGM 0,743 (78 asistidas de 105 canastas) (detallado: 0,649 con 192 sobre 296 en sus primeros tiros posteriores; 08/09 detallan numeradores) y fuera del rebote SIM queda en 0,601 frente a 0,679: **el desfase de asistencias no es solo del rebote**. Puntos por 40 min: 77,6 frente a 82,4. Contradicciones CAL/VAL y exposición insuficiente: eR (arriba); el reinicio tiene poca exposición (269 decisiones de reinicio en 96 actuaciones).

## 6. Comprobaciones
Neutralidad 24/24; TECH: tres recorridos iguales entre sí y con la ejecución CAL del mismo vector en las seis entradas (con guardado/recuperación con sufijo privado); R01–R27 sin fallos en todos los registros SIM (R27 ausente solo en B04B, que es el código de 04B); misma entrada y semilla por caso entre identidades y modelos; historia (24 encuentros VAL) y aprendizaje (seis pares, Polivalencia 8/16/24) correctos; jornada mixta (cuatro SIM y un detallado, cuatro rutas A–D, guardado con terminado y activo, cierre diferido, orden manual con autoridad y rechazo tipado) con resultados, tablas y decisiones iguales entre rutas. Recorrido de Chromium: 50 pasos, 0 fallidos, consola 0, red 0 (incluye candidata explícita, filas nuevas, guardado/recuperación con recarga real, rechazo del guardado de 04B y descargas reales).

## 7. Rendimiento (honesto)
Procesos independientes y secuenciales, 4 workers, 4 CPU, 2.000 clubes (26.000 identidades distintas de equipo y jugador) y un partido por club y agenda; A y B emparejan y siembran distinto.

| Medida | B04B | 04C | Objetivo | Distancia (04C) |
|---|---:|---:|---:|---:|
| Agenda A (primera solicitud tras apertura) | 8.685 ms | 9.537 ms | 5.000 | +4.537 ms |
| Agenda B (pool reutilizado) | 5.271 ms | 5.430 ms | 5.000 | **+430 ms** |
| Apertura continua hasta datos de A | 11.890 ms | 12.935 ms | — | informativa |
| Jornada de mil: publicación máxima / mediana / p95 | n/m | 1.612 / 525 / 1.339 ms | 1.000 máx | **+612 ms** |
| Jornada de mil: RSS máximo | n/m | 1.540 MiB | 1.536 MiB | **+4,5 MiB** |

**Ningún objetivo se cumple** con esta carga. La diferencia con 04B (F1/F2 4,5 s; publicación 1,36 s; RSS 1,29 GiB) se debe sobre todo a la diversidad de identidades; el control B04B con los mismos fixtures cuesta 8,7/5,3 s, y 04C añade un 9,8 % (A) y un 3,0 % (B) con la candidata activa: no se atribuye a una regresión sin una medición aislada, que no se hizo. No se hizo otra reescritura de workers.

## 8. Límites y decisiones
Ver `13-LIMITES-Y-DECISIONES.md` del paquete rápido. **No** se toma ninguna decisión de producto: se propone una candidata provisional. Preguntas para Dennis/ChatGPT: (1) aceptar `C04C-FINAL-PROVISIONAL` pese a eA, eZ, e2 y eR fuera de banda o conservar N04C; (2) autorizar actuar sobre la elegibilidad de pase final fuera del rebote; (3) revisar aro frente a inside (eR empeora en VAL; otra entrega, la reserva dejaría de ser independiente); (4) objetivo de rendimiento con miles de clubes. Aplicación apta solo para desarrollo local (`DEC-019`).

## 9. Entrega
Fuera de Git, en `out/sim-motor04c/entrega-final/`: `SIM-MOTOR-04C-revision-rapida.zip` (≤ 2 MiB), `SIM-MOTOR-04C-evidencia-detallada.zip` (≤ 60 MiB o partes con índice), `SIM-MOTOR-04C-indice-partes.json` y `SIM-MOTOR-04C-verificacion-final.json`. El comprobador offline (`scripts/sim04c/verify-delivery.js`) lee los ZIP, recalcula errores, M, guardas y la elección desde numeradores, comprueba hashes, créditos/contextos, embudo de rebote, el vector usado en VAL y el coste, y trata «no evaluado» como no conforme; no simula. Pequeña evidencia en Git: [`evidencia-sim-motor04c/`](evidencia-sim-motor04c/README.md).
