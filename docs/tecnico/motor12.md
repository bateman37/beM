# Implementación de MOTOR-12 (simulación masiva y extracción completa)

Encargo archivado: [`../prompts/MOTOR-12-simulacion-masiva-y-extraccion.md`](../prompts/MOTOR-12-simulacion-masiva-y-extraccion.md). Recorrido manual: [`../prompts/MOTOR-12-recorrido-manual.md`](../prompts/MOTOR-12-recorrido-manual.md).

> **Naturaleza.** MOTOR-12 es **orquestación + registro + exportación**: ejecuta lotes de partidos completos con el **mismo núcleo** y descarga un paquete autocontenido para analizarlos. **No cambia el deporte**: la referencia `20261016` sigue en **83–103 con 6 505 sorteos**; el motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` no cambian. No se ha calibrado nada (MOTOR-13) ni optimizado el coste (MOTOR-14). Todo SEM.

## 1. Base real

| Dato | Valor |
|---|---|
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno; el encargo proponía `feature/MOTOR-12-lotes-y-extraccion`), **rehecha desde `origin/main` (`e53089e`)** porque la PR #12 de MOTOR-11 ya estaba **fusionada** (`bateman37/beM#12`, comprobado en GitHub: `merged_at` 2026-10-17T06:46:24Z). Por tanto no hay PR dependiente: la PR de MOTOR-12 solo muestra MOTOR-12. |
| Punto de partida comprobado (ejecutado, no leído del informe) | **149 pruebas** pasan (141 + 8 de MOTOR-11), `data:check` y la comprobación documental correctos, referencia `20261016` = **83–103 con 6 505 sorteos** (de nuevo con registro completo y reducido en este encargo). |
| Alcance final | Agenda y variantes, semillas congeladas, controlador serial con progreso/detención/continuación/reintento, persistencia progresiva en disco, registro diagnóstico completo, agregados/distribuciones/comparación, paquete ZIP (único o por partes + índice, con fragmentación), comprobador `npm run batch:check`, pestaña **Lotes**, extensión `SEM-MOTOR12-20261017`, huellas separadas. |

## 2. Mapa de requisitos

| Requisito | Código | Datos / archivos | Interfaz |
|---|---|---|---|
| §4 agenda, cantidades, localía | `src/batch/schedule.js` | `entradas/lote.json` | Lotes › «Revisar agenda y entradas» |
| §5 semillas, variantes, snapshot | `seeds.js`, `variants.js`, `freeze.js` | `entradas/{lote,variantes}.json`, `entradas/{perfiles,partidos,equipos,planes}/` | Lotes › preparar |
| §6–§7 controlador, estados, reintentos | `runner.js`, `state.js`, `jobstore.js`, `executors.js`, `worker.js` | `out/batches/<lote>/` (`job.json`, `indice.jsonl`, `intentos/`) | Lotes › progreso y control |
| §8–§9 agregados, comparación | `aggregate.js` | `agregados/*.csv` | Lotes › agregados |
| §10–§11 registro y relaciones | `records.js`, `schema.js`, `attempt.js` | `estadisticas/*.csv`, `eventos/`, `decisiones/` | — |
| §12–§15 paquete, manifest, partición | `package.js`, `zip.js`, `docs.js` | ZIP | Lotes › descargar |
| §16 validación | `check.js`, `scripts/batch-check.js` | `auditoria/validaciones.jsonl` | `npm run batch:check -- <ruta>` |
| §19 huellas | `fingerprint.js`, `hashing.js` | `trajectory_fp`, `entry_id`, `input_id`, `profile_id` | — |
| §20 parámetros | `data/match/motor12-seed-extension.json`, `src/profiles/rows-motor12.js` | tabla `batch` (6 filas LAB01 editables) | Panel › LAB01 |
| API local | `src/batch/api.js`, `scripts/dev-server.js` | `/api/batch/*` | — |

## 3. Agenda, cantidades, localía, variantes, semillas y snapshots

**Cantidades** (§4.2): entrada = *repeticiones por enfrentamiento y por variante*; la pantalla y el manifest muestran equipos, pares, repeticiones, casos por repetición (ida/vuelta = 2), variantes y ejecuciones totales. Ejemplo comprobado en `tests/motor12.test.js`: 12 equipos → 66 pares → 132 casos (ida y vuelta) → 264 ejecuciones con dos variantes. Atajos 10/100/1000 desde `batch.repetitionShortcuts` y cantidad editable. Orden estable de agenda: par → repetición → lado → variante; `match_id` (ordinal lógico `M000001…`) y `case_id` (`C000001…`) no dependen del tiempo de ejecución.

**Modos**: repetir un enfrentamiento; cruces (todos los pares distintos de los equipos seleccionados, sin repetir; autoenfrentamiento solo explícito, con instancias `EQ04` y `EQ04_B` sin colisión de jugadores); y **pares elegidos uno a uno** (añadido para poder expresar el lote de cierre de cinco enfrentamientos concretos). Un lote también puede partir de un **escenario LAB11** (su base y variantes con las diferencias exactas del escenario; solo «repetir», localía fija).

**Localía**: fija, ida/vuelta (dos casos por repetición) o alternada. El motor **no implementa ventaja de localía**: se conserva A/B y la etiqueta local/visitante (el local ocupa el puesto 0 de la entrada) sin inventar un efecto; el aviso se muestra en pantalla y se guarda.

**Variantes**: operaciones declarativas (`ability`, `state`, `field`, `style`, `plan`) sobre un selector de equipo (`A`, `B`, `*` o identidad lógica) y de jugador (`director`, `starters`, `all`, `Jnn`). Se **resuelven y listan antes de ejecutar** (`changes` exactos, saturación 1–30 visible); la candidata no cambia según lo que ocurra. La base no puede cambiar nada. Todas se guardan en `entradas/variantes.json` con las variables conservadas.

**Tres semillas distintas**: *generación* (de cada equipo generado: se materializa una vez al preparar, `source.seed` en la ficha; no se regenera por partido), *lote* (derivación) y *deportiva* de cada caso. Derivación **`LOT-SEED-R1`**: xorshift32 del perfil (tratamiento de cero heredado) sembrado con FNV-1a(`semilla|LOT-MOTOR12-R1|LOT-SEED-R1`); una salida por caso; salida repetida → se descarta y se toma la siguiente (colisión registrada). La lista completa se deriva **por adelantado** y se congela: pedir más casos no desplaza las semillas anteriores (prueba 1), detener/reanudar no la cambia, no se usa reloj, índice de worker ni orden de finalización. Las variantes de un mismo caso comparten semilla **a propósito**.

**Snapshot efectivo** (§5.3): al iniciar, `freezeBatch` escribe una vez la agenda, el perfil efectivo **completo** (`profile_id` = huella del perfil entero), las entradas (`entry_id` = huella canónica de la entrada sin semilla; `input_id` = SHA-256(`entry_id|semilla`)[:16]) y los bloques compartidos por huella (fichas con 32 capacidades, cuerpo, tendencias y estados en `entradas/equipos/`; planes en `entradas/planes/`). Continuar usa **solo** esto; editar después la plantilla fuente o activar otro perfil no lo toca (prueba 2). Cada partido se reconstruye desde una copia profunda de ese snapshot: no hay estado arrastrado (la misma entrada tras otro partido da la misma huella de trayectoria).

**Órdenes programadas**: se admiten con frontera de periodo (`period`, `boundary`) y se aplican por el mismo mecanismo de órdenes del motor (`submit` en la frontera real, con su ciclo de vida); el intento registra la orden programada (`record_type: orden_programada`). LAB11-10 **no** finge un clic humano: si la orden no se alcanza queda `no_alcanzada`.

**Prevalidación** (§4.3): cada combinación distinta (par × local × variante) se materializa y valida **una vez** (las repeticiones solo cambian la semilla); un caso inválido se informa con su causa y **no** se convierte en partido jugado ni se corrige. Una petición mayor que `batch.maxExecutionsPerJob` (5 000) se rechaza con su motivo antes de empezar (no se recorta).

## 4. Controlador, persistencia progresiva, estados y reintentos

**Ejecución**: un partido cada vez (concurrencia 1; otro valor se rechaza). En el servidor local el motor corre en un `worker_thread` (el hilo principal sigue atendiendo progreso, detención y descargas); en pruebas y scripts, en el mismo hilo (`InlineExecutor`). Ambos llaman a `executeAttempt` → `createMatch` / `step()`; **no hay simulador rápido**, no se espera animación y no se precalcula un marcador.

**Persistencia** (`out/batches/<lote>/`, excluido de Git): `job.json` (estado del trabajo, reescritura atómica), `entradas/` (congelado), `indice.jsonl` (append-only con `fsync`: `attempt_started`, `attempt`, `attempt_interrupted`; **fuente de verdad** del estado) e `intentos/<M>/<A>/` (archivos de cada intento). El contexto en memoria es de **un partido**: sus filas y registros se escriben y se descargan antes del siguiente. Directorio sustituible con `BEM_BATCH_ROOT`.

**Confirmación** (§6.3): el intento se escribe en `<A>.tmp/` → se **renombra** a su directorio final → solo entonces se añade la línea `attempt` al índice. Un directorio sin línea de índice no es un partido confirmado; un reinicio no lo duplica.

**Estados**: del *trabajo* (`preparado`, `ejecutandose`, `detencion_solicitada`, `detenido`, `completado`, `interrumpido`) y de cada *ejecución lógica* (`pendiente`, `en_curso`, `terminada`, `fallida`, `interrumpida`; con intentos `…-A1`, `…-A2`). «Terminada» ≠ «partido válido»: `valid` (terminó y concilia) y la elegibilidad se conservan aparte. Contadores (UI y manifest): solicitados, iniciados, en curso, terminados, **válidos**, fallidos, interrumpidos, pendientes (+ reintentados); los estados primarios **reconcilian** con lo solicitado y `iniciados` se declara como derivado que se solapa.

**Detener y continuar**: «detener al terminar el partido actual» no corta a mitad; conserva lo terminado y la agenda pendiente. Continuar usa las mismas entradas y semillas y **no repite confirmados** (prueba 3). Si el motor, la instrumentación, el formato de registro o la derivación de semillas cambiaron mientras el lote estaba detenido, la continuación se **bloquea** (no se mezclan versiones: se prepara una nueva revisión).

**Reinicio del proceso**: al arrancar el servidor, `recover()` marca `interrumpido` los lotes que estaban en marcha y anota `attempt_interrupted` en el intento en curso, que se conserva como parcial. **No hay snapshot deportivo de continuación**: no se finge reanudar desde una posesión; el caso se repite **desde su inicio congelado con la misma semilla y un nuevo `attempt_id`** (`continuar`). La suspensión reglamentaria de MOTOR-09 no se resuelve aquí.

**Fallos y reintentos**: un error del motor conserva el último hecho confirmado (`last_event_id`, `last_sequence`), el error estructurado y los registros disponibles; **no** hay marcador ni derrota inventados, y queda fuera de los agregados. El lote continúa con los demás casos, salvo que falle la **conservación de registros** (error de escritura → `interrumpido` con causa) o haya tres fallos de preparación seguidos. El **reintento es explícito**, con la misma semilla; la salida canónica es la del último intento terminado: una fallida y su reintento exitoso **no cuentan dos veces** en la muestra (prueba 4).

## 5. Contrato de registro: R01–R08 y cobertura

El registro se **obtiene de las operaciones existentes**: con `detail: 'full'` el motor ya conservaba en cada hecho `calc` (cada receta con capacidad/valor base/efectivo/peso/energía, cada distribución con sus opciones, cada probabilidad binaria, duración y estado), `draws` (todos los sorteos con ordinal y propósito) y `params` (filas de configuración consultadas). MOTOR-12 solo los **normaliza y enlaza** (`records.js`); no vuelve a resolver nada, no llama a lectores que actualicen estados y no sortea. Con `detail: 'minimal'` (nivel reducido) el motor no conserva `calc`/`params`: el paquete lo declara en su cobertura.

| ID | Registro | Archivo | Productor | Cobertura |
|---|---|---|---|---|
| R01 | Acontecimientos y continuidad | `eventos/eventos-*.jsonl` | hechos del motor | completa |
| R02 | Órdenes | `eventos/ordenes-*.jsonl` | `res.orders`, `res.commands`, órdenes programadas | completa (solicitud, validación, frontera, vigencia, consumo, cierre; actor humano/automático/programado) |
| R03 | Responsabilidades | `eventos/eventos-*.jsonl` (`effects.defensa`, `intent`) | hechos | **parcial**: sin tabla propia de recuperación |
| R04 | F, series, créditos | `estadisticas/finalizaciones.csv`, `series.csv`, `creditos.csv` | acta MOTOR-09 | completa |
| R05 | Estados y episodios | `eventos/estados-*.jsonl` | `stateLog`, `episodes` | completa en diagnóstico; parcial en reducido |
| R06 | Participación/tramos | `estadisticas/tramos.csv`, `quintetos.csv` | acta, presencia | completa (`plan_revision_id` no es campo propio) |
| R07 | Memoria y decisiones | `decisiones/decisiones-*.jsonl`, `sorteos-*.jsonl` | `calc`, oportunidades, entrenador, memoria, cadenas de saque | completa en diagnóstico |
| R08 | Ejecuciones/auditorías | `auditoria/*` | controlador y comprobador | completa |

Los sorteos llevan `draw_index` contiguo `1..N`, propósito, `u`, `event_id` y `decision_id` (vacío cuando el sorteo no tiene un cálculo registrado, p. ej. la actualización perezosa de momentos, que sí figura en `estados`); nunca hay sorteos futuros. Que una capacidad aparezca en una receta no prueba impacto deportivo (MOTOR-13).

## 6. Esquemas, identificadores y relaciones

`src/batch/schema.js` es la **única fuente** de las 15 tablas CSV (columna, tipo, unidad, naturaleza, nulidad, descripción, audiencia): de ahí salen el generador de filas, `diccionario.json/md`, el manifest y el comprobador. Identificadores: `batch_id`, `variant_id`, `case_id`, `match_id`, `attempt_id` en **todas** las filas y registros; `team_instance_id`/`source_team_id`, `player_instance_id`/`source_player_id`, `event_id`/`sequence`, `possession_id` (nulo en administración sin posesión), `finalization_id`, `series_id`, `stint_id`, `lineup_id`, `decision_id`/`draw_index`, `entry_id`/`input_id`/`profile_id`. Cardinalidades y archivo que resuelve cada ID: `diccionario.md` § Relaciones. `revision_id` no se genera en lotes naturales (no hay correcciones). Los puntos tienen **dos particiones** (por origen: `equipos.points_f`/`points_admin`; por posesión: `posesiones.points`) que **no se suman**; el diccionario lo explica.

## 7. Agregados, distribuciones, comparación y exclusiones

Todo se agrega desde las tablas por partido (`estadisticas/indicadores.csv` reutiliza el catálogo de 26 indicadores de MOTOR-10 con numerador y denominador; **no** hay otra definición de posesión ni de TS).

- **Tasa agregada por exposición**: escala × Σnum/Σden de los partidos elegibles (el acierto global de triple **no** es la media de los porcentajes de partido; prueba 5).
- **Distribución entre partidos**: n propio, media, desviación **muestral n−1** (n<2 → vacío), mínimo, P05, P25, P50, P75, P95, máximo; cuantiles por índice `(n−1)·p` con interpolación lineal. Unidad `team_games` para equipos y `match_count` para resultados; no se duplica la muestra por las dos filas de acta.
- **Exclusiones** con causa y conteo en cada fila: pendiente/en curso, fallida, interrumpida, no válida (terminó pero no concilia) y **sin exposición** (denominador 0 o no registrado: no es un cero). Un indicador no registrado excluye solo ese indicador.
- **Comparación base/candidata** (`agregados/comparaciones.csv`): por `case_id` y puesto; solo **pares con las dos variantes válidas** y valor en ambos lados; un par incompleto queda fuera de la comparación (y se cuenta) sin borrar el resultado válido del otro lado en los agregados de su variante. Se informan la diferencia de **tasas agregadas** y la **media de diferencias por caso** (distintas), con desviación y cuantiles de las diferencias. La misma semilla no garantiza los mismos sorteos tras una decisión distinta: no es un efecto causal aislado.
- **Capacidades** (`agregados/capacidades.csv`): usos efectivos, valor base/efectivo medio y contribución calculada (peso normalizado × valor efectivo) por equipo, capacidad, tarea y rol; oportunidades no evaluadas = «no registrado».

## 8. Paquete, manifest, huellas y partición

**Esquema `beM-analysis-package/1`** (distinto de `export/8` y de `beM-scenario/1`; **no** se sube `export/8` por crear un contenedor). Contenido: `README.md`, `manifest.json`, `diccionario.{json,md}`, `resumen.md`, `entradas/`, `estadisticas/*.csv`, `agregados/*.csv`, `eventos/*.jsonl`, `decisiones/*.jsonl`, `auditoria/{validaciones.jsonl,incidencias.jsonl,cobertura.csv,rendimiento.csv}` (y `relato/` si se pidió prosa). CSV UTF-8, coma, punto decimal, CRLF, comillas dobles; JSONL una línea por registro; fechas ISO 8601 UTC; unidades en el diccionario (décimas **deportivas** frente a ms de ejecución); nulo = celda vacía; JSON sin NaN/Infinity; capacidades 1–30.

**Manifest**: identidad (paquete, lote, alcance `lote`/`lote_parcial`/`partido`/`extracto`/`parte`/`indice`, revisión), estado (trabajo, completitud, nivel de registro, `integrity_verified`), versiones (paquete, lote, registros, motor, instrumentación, reglas, perfil, extensiones, análisis, acta, trayectoria, dataset), agenda, conteos globales, agregación (universos y convención), inventario de archivos (ruta, formato, bytes, **registros lógicos**, **SHA-256**, ámbito, audiencia), relaciones, partición y auditoría. **Sin circularidad**: el manifest no contiene su propio hash; el índice de un lote dividido lista tamaño y SHA-256 de cada ZIP final de parte (las partes no contienen el hash del índice). Un checksum se calcula siempre sobre los bytes finales.

**Tres huellas distintas** (`fingerprint.js`): (1) *checksum de archivo/paquete* (bytes); (2) *huella de entrada* (`entry_id`, `input_id`, `profile_id`, `profile_sport_fp`: perfil sin identificación ni tablas de lectura/construcción); (3) *huella de trayectoria* `trajectory_fp` (proyección deportiva canónica **sin** `version.perfil` de las decisiones del entrenador, ids de lote ni tiempos). **Hallazgo**: la proyección deportiva existente cambia de hash solo por el id del perfil en las decisiones del entrenador (588 apariciones en la referencia); por eso las pruebas heredadas comparan ahora contra `tests/fixtures/baseline-motor12.json` (la proyección bruta con el id de MOTOR-12 **y** `trajectorySha256`), sin tocar `baseline-motor11.json`. Renombrar el perfil, cambiar preferencias técnicas, el nivel de registro o la prosa **no** cambia `trajectory_fp` (prueba 6 y 9).

**Partición** (§15): objetivo por parte `batch.partTargetMiB` = **64 MiB sin comprimir** (semilla técnica, no límite de plataforma). Las partes son **por casos completos** (todas las variantes de un caso juntas para que la comparación emparejada quede completa); un caso que no cabe se divide por partidos (marcado `comparison_split`); un **partido mayor que el objetivo se fragmenta por secuencia** (límites exactos y contiguos, dependencias declaradas, estadísticas y acta canónicas solo en el fragmento 1). Cada parte lleva sus entradas, diccionario, guía, agregados de ámbito `parte` y validaciones; el índice (`beM-lote-<id>-indice.zip`) lleva los agregados **globales**, el catálogo global de partidos/intentos y `indice.json`. Los totales globales y los de parte se identifican y **no se suman**. Cada partido canónico está en exactamente una parte.

## 9. Validación y comprobador

Antes de ofrecer la descarga el constructor valida los datos preparados y escribe `auditoria/validaciones.jsonl`; el comprobador independiente (`npm run batch:check -- <ZIP | directorio | directorio con índice y partes>`) lee los ZIP **sin volver a simular**. Controles: V00 manifest; V01 legibilidad/encoding/formato; V02 SHA-256, bytes, registros lógicos y archivos sin inventariar (+ V02b índice ↔ partes); V03 identificadores únicos (partidos, intentos, posesiones, F, series, jugadores, tramos, tiros, equipos, periodos, quintetos); V04 referencias resolubles; V05 agenda/estados/intentos concilian, un intento canónico por ejecución, sin duplicidad entre partes; V06 marcador = último hecho = Σ periodos = Σ jugadores, y puntos = 2·T2C+3·T3C+TLC; V07 puntos de F y series ligadas; V08 Σ tramos = Σ minutos; V09 **agregados recalculados** desde las tablas coinciden con los archivos; V10 sorteos contiguos, enlaces y secuencias (con fragmentos); V11 entradas necesarias en cada parte y dependencias de fragmentos; V12 audiencia/permisos; V13 cabeceras = esquema. No evaluados y declarados: contraste FIBA, reejecución del deporte y auditorías de MOTOR-13. La prueba 8 demuestra que detecta un archivo alterado, una fila duplicada con manifest «reparado» (parseable y con hash correcto) y una referencia rota.

## 10. Permisos

Un paquete de lote es **diagnóstico del laboratorio** (`audience.package = diagnostic`); cada archivo declara su audiencia (tabla con columnas `diagnostic`/`own` → su máximo) y el comprobador rechaza un archivo declarado por debajo de su contenido o un paquete por debajo de sus archivos. El README lo advierte. Los exports públicos/propios del análisis (MOTOR-10) y el export reproducible `export/8` se conservan sin cambios y aplican sus permisos antes de generar archivos. Nada de esto llega al entrenador automático ni cambia el deporte o la IA: el registro es un lector pasivo del resultado.

## 11. Neutralidad del registro (evidencia)

- Referencia `20261016`: **83–103 con 6 505 sorteos** con registro completo y con reducido, y **misma huella de trayectoria** (`scripts/integration-motor12.js` y prueba 6).
- Un partido registrado con nivel **reducido** y reproducido con diagnóstico completo (ruta `…/match/<id>/export`) da la **misma** huella de trayectoria (comprobado por HTTP en el recorrido).
- La prosa (`relato/`) y el nivel de registro solo cambian lo que se conserva (prueba 6).

## 12. Mediciones, controles reales y límites

Entorno de las mediciones: `node v22.22.0 · linux 6.18.44 · 4 CPU Intel Xeon @ 2,80 GHz` (contenedor de ejecución, **no** el equipo de Dennis). Son **mediciones** de esta ejecución; no hay extrapolación: 100 y 1.000 partidos son controles de producto para Dennis y el rendimiento final es de MOTOR-14.

### 12.1 Controles ejecutados por Claude

| Qué | Resultado |
|---|---|
| `npm test` | **161 pruebas** pasan (149 previas + **12 nuevas**), 0 fallos (≈ 226 s). Se actualizaron tres pruebas heredadas por la identidad de perfil (`baseline-motor12.json`) y se añadió `batch.` a las filas «condicionales» de `profiles.test.js` (validadas aparte en la prueba 12) |
| `npm run data:check` | correcto (incluye `checkMotor12`: la extensión solo añade `batch` y el perfil efectivo es idéntico al de MOTOR-11 salvo `batch`, `extensions` y `effectiveId`) |
| Comprobación documental | `check_engine_docs.py` correcta tras reconstruir el exportado |
| Referencia `20261016` | **83–103, 6 505 sorteos**, mismo marcador, mismos sorteos y misma huella de trayectoria con registro completo y reducido |
| Lote de cierre (`node scripts/integration-motor12.js`) | **5 casos × 2 variantes = 10 encuentros reales**, 10 terminados y **10 válidos**, 0 fallidos; base y candidata (+3 Pase, TEC08, a los directores); EQ01/EQ02 con plan histórico, EQ04/EQ05, EQ06/EQ10, EQ07/EQ08 y EQ11/EQ12 naturales; marcadores 80–111/86–83, 74–62/68–62, 106–103/106–103 (trayectorias distintas, mismo marcador por coincidencia), 66–94/74–87 y 102–107/115–91; 6 396–9 761 sorteos por partido. EQ04–EQ06 y EQ10 naturales reciben por primera vez una comprobación de partido completo. Resultados **observados, no objetivos**: un 124–92 o un 115–91 no se corrigen, se conservan para auditoría |
| Paquete de cierre ([evidencia](evidencia-motor12/README.md): resumen, manifest e índice del lote `LOT-c268fba2`) | índice + **9 partes** (10 ZIP, 404 archivos), **27,5 MiB** de ZIP para **378,6 MiB** sin comprimir (ratio ≈ 13,8); el **comprobador** da los 15 controles ✔ y «Paquete correcto» |
| Pruebas de MOTOR-12 | 12 grupos (`tests/motor12.test.js`) sobre **un** lote real de diagnóstico completo de dos encuentros reutilizado (agenda, semillas, snapshot, detención/continuación/interrupción, fallo y reintento con ejecutor de prueba —resultados sintéticos, no partidos—, agregados, neutralidad, ZIP/partes/fragmentos, comprobador negativo, audiencias/huellas, reproducción, AN08, exclusiones de filas) |
| Chromium automatizado | cabecera `MOTOR-12`; cantidades 10/100/ida-vuelta/cruces (12 equipos → 66 → 132 → 264) y rechazo por límite (5 280) y par repetido; lote de 4 encuentros con progreso responsive, **detener tras el actual** (2 confirmados, 2 pendientes), descarga real del paquete **parcial** (`…-parcial.zip`, 4,55 MiB), reapertura de la pantalla, **continuar sin repetir**, agregados, **abrir análisis** de un partido, descarga real del **índice y las dos partes** y `batch:check` sobre ellas (✔) y sobre una **copia alterada** de una parte (✘ V01/V02/V02b/V10). Cero respuestas ≥ 400 y cero errores de consola. La coincidencia de la huella de trayectoria al abrir un partido se comprobó por la API (`X-Trajectory-Match: true`, también con un lote registrado en nivel reducido y reproducido con diagnóstico) y en las pruebas 6 y 10. No es un recorrido humano |
| No ejecutado | lotes de 100/1.000, Node 24, otros navegadores, Chromium con perfil de usuario real, reinicio real del servidor con un lote en marcha (cubierto con ejecutor de prueba), recorrido humano de Dennis |

### 12.2 Mediciones por fase (diagnóstico completo, 10 intentos del lote de cierre)

| Fase | Media por partido | Notas |
|---|---:|---|
| Simulación (motor real, `detail: full`) | **4 950 ms** | incluye el seguimiento de `calc`, `params` y sorteos que ya hacía el motor |
| Construcción de registros y tablas (acta, análisis MOTOR-10, normalización) | **665 ms** | lector pasivo del resultado |
| Escritura en disco (15 CSV por partido + JSONL) | **443 ms** | |
| **Total por intento** | **6 059 ms** (mín. 4 681, máx. 7 161) | el lote de 10 tardó 60,8 s serial |
| Nivel **reducido** (6 intentos) | 988 + 149 + 38 = **1 176 ms** | sin `calc` ni `params` |
| Construcción del paquete (10 ZIP, validación previa incluida) | 24,6 s | agregación + ensamblado + compresión |
| Comprobador independiente (índice + 9 partes) | 17,5 s | lee y verifica todo, sin simular |

| Contenido (10 partidos) | MiB sin comprimir | Registros |
|---|---:|---:|
| `decisiones/` | 302,5 (**82 %**) | 510 696 |
| `eventos/` (hechos) | 32,4 | 5 722 |
| `decisiones/sorteos-*` | 25,0 | 82 609 |
| `eventos/estados-*` (estados y episodios) | 5,8 | 18 526 |
| Tablas CSV (15) | ≈ 3,5 | `capacidades-uso` 14 770; tiros 1 284; ejecuciones 1 601; posesiones 1 374; … |
| **Total** | **369,5** (≈ **36,9 MiB por partido**) | |

El registro **reducido** ocupa ≈ **3,5 MiB por partido** sin comprimir. La partición por defecto (64 MiB) produce **una parte por partido** salvo que un caso completo (las dos variantes) quepa: dos variantes de un caso ocupan ≈ 75 MiB, así que el primer caso (57 MiB) forma una parte y los demás se dividen por partidos (`comparison_split`; la comparación emparejada completa está en el índice, no en cada parte). El objetivo es una semilla de medición: con estos tamaños puede convenir subirlo (p. ej. 128 MiB) o usar el nivel reducido en lotes grandes.

### 12.3 Límites de almacenamiento y de continuación

- Espacio: el servidor guarda todo en `out/batches/` (≈ 37 MiB por partido con diagnóstico); un error de escritura detiene el lote con su causa y conserva lo confirmado (no entrega un ZIP «completo» al que le falte el final).
- No hay snapshot de continuación: un intento interrumpido se repite desde el inicio (misma semilla, nuevo intento). La suspensión reglamentaria de MOTOR-09 no se resuelve.
- ZIP64 no está soportado: un ZIP o un archivo de 4 GiB o más es un error explícito (las partes van muy por debajo).
- Límite técnico de ejecuciones por trabajo (`batch.maxExecutionsPerJob` = 5 000): visible y administrable; una petición mayor se rechaza antes de empezar.

## 13. Interpretaciones de MOTOR-11, saneamiento y 404

- **Disposiciones y cobertura (confirmado por el catálogo, no por número)**: «4–1» = **DIS02** («4 abiertos y 1 interior»); «3–2 ofensivo» = **DIS03** («3 abiertos y 2 interiores»: tres referencias exteriores y dos interiores, no la zona defensiva). EQ07 usa media distancia **«buscar con jugadores adecuados»** (`seek`) y EQ10 prefiere mostrar/recuperar con **COB03 = «Salir y recuperar (show)»**, navegación `over_and_recover`, con su compromiso y su concesión («el continuador puede quedar disponible mientras recupera»); el motor sigue declarando la limitación cuando la cobertura no es aplicable (`COB04`/fallback).
- **El script de datos no es el control deportivo**: `scripts/build-motor11-data.js` solo **materializa** la precarga de los doce planes en `data/match/motor11-seed-extension.json` (con procedencia por plan); los valores efectivos editables viven en el perfil/población y en las fichas y planes de la interfaz, y `data:check` exige que el archivo coincida con lo que produce el script para impedir fuentes duplicadas. MOTOR-12 no añade constantes deportivas dispersas: sus parámetros están en la tabla `batch` (panel LAB01).
- **`reconcile.js`**: se conserva la corrección de MOTOR-11 que elimina el jugador fijo EQ01-J01 (la conciliación on/off toma el primer jugador del equipo 0). **Se corrige además AN08** (conciliación de posesiones completas/mixtas): sumaba las filas de cada quinteto y una posesión que cruza un cambio de quinteto es «mixta» para **dos** quintetos, así que partidos válidos (hallado por el lote de cierre: EQ07–EQ08, semilla 1021757814) se marcaban no válidos. Ahora cuenta posesiones **distintas** (prueba 11). Es un defecto del *lector*, no del deporte ni de coeficientes.
- **Exclusiones de pruebas por categoría de fila**: las filas `generator.*`, `analysis.*` y ahora `batch.*` están excluidas solo de «consumidas por un partido» (`CONDITIONAL` de `profiles.test.js`); la prueba 12 comprueba que **siguen** validándose (dominio de cada fila), están en el diccionario (LAB01, no requeridas) y no dejan hojas sin cubrir.
- **404 de Chromium**: **no se pudo reproducir**. Se registraron todas las peticiones del navegador y todas las respuestas del servidor con Chromium *headless shell*, Chromium completo en nuevo *headless* y Chromium con ventana (bajo `xvfb`), con la página tal como estaba en MOTOR-11 (sin icono declarado) y con la actual, recorriendo todas las pestañas y el flujo escenario → partido completo → análisis → descarga: **ninguna respuesta ≥ 400 y ningún error de consola**. La única petición que el servidor responde con 404 por diseño es la que cae fuera de `src/` y `data/`; un navegador de escritorio la hace para `/favicon.ico`. Como medida de aplicación se **declara el icono en la propia página** (`<link rel="icon" href="data:,">`) para que el navegador no necesite pedirlo (prueba 10). No se declara que ese fuera el 404 de MOTOR-11: sigue sin localizarse una petición que lo produzca.

## 14. Pendientes

1. **MOTOR-12 no ejecutable**: ninguno conocido.
2. **Heredados** (declarados en `auditoria/cobertura.csv` de cada paquete): FIBA sin contrastar, técnicas/compensación/inferioridad natural, tiro en vuelo, continuación desde snapshot, lateralidad del mapa, desvío/continuación de asistencias, estado propio visible por tramo, recomendaciones distintas de REC10-01/02 y `plan_revision_id`/responsabilidades como tabla propia.
3. **Propios**: el nivel reducido no guarda recetas; el registro diagnóstico ocupa decenas de MiB por partido sin comprimir (ver mediciones); la ejecución es serial; un partido en curso no se puede reanudar tras un cierre del proceso (se repite).
4. **Posteriores**: auditorías de comportamiento, sensibilidad y calibración (MOTOR-13); coste, rendimiento y versión 1 (MOTOR-14). Este paquete prepara la evidencia; **no** calibra ni recomienda cambios de coeficientes.
5. Recorrido manual de MOTOR-08/09/10/11/12 pendiente de Dennis; no ejecutado: Node 24 y otros navegadores.
