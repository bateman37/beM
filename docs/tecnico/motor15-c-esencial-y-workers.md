# MOTOR-15 · bloque C — nivel `world-essential`, trabajadores persistentes y medición

> Fragmento propio del bloque C (se integra en `motor15.md`). Prompt: [`MOTOR-15`](../prompts/MOTOR-15-cierre-funcional-y-rendimiento-del-mundo.md) §11–§13, §15.2. Matriz de consultas: [`motor15-c-matriz-consultas.md`](motor15-c-matriz-consultas.md). Evidencia de medida: [`evidencia-motor15-c/`](evidencia-motor15-c/).

**Veredicto:** implementado y comprobado a escala pequeña (≤ 8 partidos por configuración). **Objetivo de coste de cien partidos en cinco segundos: NO alcanzado en la configuración medida** (extrapolación ≈ 30 s con 4 workers; ver §5). No se ha ejecutado el benchmark de cien ni campañas grandes.

## 1. Tres ejes independientes

Modalidad de avance, detalle conservado y resolutor son ejes distintos. Este bloque añade solo un valor al eje de **detalle conservado**; el resolutor (`MatchCore`) es el mismo.

| Nivel de registro | Detalle del núcleo | Qué conserva |
|---|---|---|
| `diagnostic` (completo) | `full` | Todo MOTOR-12: hechos con `calc`, sorteos con ordinal, decisiones, tablas, ZIP. |
| `reduced` | `minimal` | Hechos y acta; JSONL de hechos/sorteos y tablas CSV. |
| **`world-essential`** | `minimal` | Un archivo compacto `esencial/<M>--<A>.json` por intento (ver §3). |

Selección explícita en: fachada (`createEncounter({ level: 'world-essential' })`, `enc.essential()`), CLI (`node scripts/run-match.js <semilla> --level=world-essential [--json f]`) y lotes (`recordLevel: 'world-essential'`; selector «Nivel de registro» de la pestaña Lotes). El nivel de un lote queda **congelado** en `entradas/lote.json`: no cambia en silencio; otro nivel = otra revisión de lote. No sustituye el registro diagnóstico del laboratorio.

**Neutralidad (comprobada, `tests/motor15-c.test.js` grupo 1 y benchmark):** para las mismas entradas y versión, trayectoria `TRAY-MOTOR12-R1`, sorteos, acta, marcador y estados son idénticos en completo, reducido y esencial. En el benchmark de 8 partidos el resumen de resultados con huella `full` coincide byte a byte entre `diagnostic`, `reduced` y `world-essential` (`digest b42e0f95460eae4f` en los tres).

## 2. Qué no genera (§11.3)

Sin prosa, sin árbol diagnóstico de candidatos, sin copias de perfil por decisión, sin tablas de auditoría y sin `calc` por decisión (el núcleo en `minimal` ya no los construye). No se «genera todo y se descarta»: el esencial lee el resultado que el motor ya produjo (acta, hechos, presencia) y no vuelve a calcular nada ni llama a lectores que actualicen estados. Lo único que añade el nivel por encima del reducido es evitar el JSONL de hechos completos, el JSONL de sorteos, las tablas CSV y la conciliación analítica por tabla.

Lo que **no** conserva (y lo declara en `integrity.not_retained`): sorteos con ordinal (solo la cuenta y la huella), parámetros consultados por hecho, `intent/effects` completos de cada hecho, pesos y contrafactuales, relato, tablas del catálogo MOTOR-10 y ZIP MOTOR-12. Un lote esencial **no genera agregados ni paquete MOTOR-12**: su extracción es el JSON esencial (los paquetes de MOTOR-15 los construye el cierre).

## 3. Datos comprometidos (§11.2) y dónde viven

`beM-essential-record/1` · `ESE-MOTOR15-R1`:

| Familia §11.2 | Campo | Contenido |
|---|---|---|
| Identidad/resultado | `identity`, `result`, `validity` | versiones (motor, registros, formato, perfiles, extensiones), semilla, equipos/instancias; estado, parciales, duración, **marcador de cancha** y **adjudicado (`administrative`) separados**; validez con conciliación del acta y analítica. |
| Acta | `acta` | líneas individuales (incl. DNP), colectivo, parciales, series, finales F, posesiones, partición de puntos, créditos. |
| Secuencia | `sequence` | filas compactas (`columns`/`rows`): orden estable, id, tipo, periodo, equipo, posesión, relojes, duración, quintetos, marcador, actor, créditos (`stats`). |
| Presencia | `presence` | tabla de quintetos y tramos de presencia (entradas/salidas, base de on-off, mixtas). |
| Posesión y F | `acta.possessions`, `acta.finals`, `acta.series` | origen/cierre, finalizaciones y series. |
| Tiro | `shots` | autor, zona, valor, resultado/validez, tapón, defensor, pasador, calidad (categoría), familia, sector, origen, contexto, ejecución, cobertura, organización defensiva. |
| Táctica observada | `tactics` | familias ejecutadas, cobertura y organización efectivas por posesión. |
| Dirección/estados | `direction`, `states` | órdenes y comandos, delegación efectiva; energía final, registro de cambios de estado y episodios. |
| Integridad/cobertura | `integrity` | huella, modo y versión de huella, pasos, sorteos, hechos, cobertura observada, `not_retained`. |

**Cruce jugador × defensa:** se conserva por fila en `shots` (autor y defensor en cada intento). Los marginales por jugador y por defensa no lo permiten reconstruir y no se ofrecen como sustituto (matriz, Q12).

**Huella:** tres modos por intento (`fingerprint`): `incremental` (por defecto en esencial; observador `TRAYINC-MOTOR15-R1` alimentado paso a paso durante la simulación, sin conservar objetos; coste medido ≈ 45 ms/partido, §5), `full` (`TRAY-MOTOR12-R1` sobre el resultado) y `none` (no se calcula; el registro lo declara con `trajectory_fp: null` y `trajectory_fp_mode: 'none'`). La huella de archivo (SHA-256 de bytes) y la de trayectoria no son intercambiables, y **la incremental y la TRAY-MOTOR12 son dos definiciones distintas** (no comparables entre sí; sí dentro de cada una entre niveles). El observador hashea los hechos sin `calc/params/instr` y el estado final (marcador, parciales, estado, pasos, sorteos, órdenes, comandos, administrativa, energía, estados comprometidos, episodios). Honestidad: el núcleo sigue reteniendo `m.events` en memoria; el observador evita retener una copia adicional, no los eventos del motor.

**Validación (`validation`):** `full` (por defecto: conciliación del acta + analítica, las mismas operaciones comunes) o `acta` (solo acta; declarado en `validity.mode`).

## 4. Trabajadores persistentes y controlador (§12)

- **Pool** `WorkerPool` (`src/batch/executors.js`): hasta 4 `worker_thread` de Node 22.22.0 (`node:worker_threads`) levantados una vez y reutilizados; un worker resuelve **un encuentro a la vez** con su propio `MatchCore`, memoria rival y azar. No hay worker por partido, ni `Promise.all` como paralelismo de CPU (el coordinador solo despacha a workers libres), ni memoria deportiva compartida.
- **Concurrencia (operativa, no deportiva):** `1` = un worker; `seq` solo en el script/inline (hilo principal, `InlineExecutor`); `2`, `4`; `auto` = `max(1, min(4, núcleos − 1))` con `os.availableParallelism()` y respaldo declarado (`os.cpus().length`, o 1). Se fija en la configuración congelada del lote (`concurrency`: 1, 2, 4 o `auto`) y puede sustituirse al arrancar (`ctl.run(id, { concurrency })`, `/api/batch/<id>/start {concurrency}`); la concurrencia efectiva, su origen y los límites quedan en el historial del job. La capacidad del servidor es 4.
- **Semillas e IDs** fijados antes de enviar (agenda congelada, `LOT-SEED-R1`, `M…`/`A…`): no dependen del worker, del orden de finalización, del reloj ni del número de hilos (comprobado: secuencial = 1/2/4 workers, mismo marcador, sorteos, huella, acta y secuencia).
- **Contenido inmutable:** cada worker carga el lote congelado una vez y lo invalida por **contenido** (clave `batchId#huella del lote.json` que envía el coordinador).
- **Un único escritor:** solo el coordinador escribe `job.json` y el índice append-only de MOTOR-12; los workers escriben el material de su intento en su directorio temporal (`.tmp`). Confirmación **atómica**: directorio renombrado y solo después línea de índice con `fsync`; un intento que cae no publica marcador.
- **Orden de terminación irrelevante:** las vistas se ordenan por agenda (`M000001…`).
- **Detener:** deja de despachar y **espera a los partidos en curso** (con concurrencia, varios); estado `detenido` con motivo; `status` y la UI muestran `active_count` y la lista de activos. Cambio respecto al singular «partido en curso» de MOTOR-12.
- **Worker caído:** su intento queda `fallida` (fase `proceso`), sin marcador, sin ganador/perdedor; el directorio parcial pasa a `.parcial`; el lote **continúa** con el resto; el worker se vuelve a levantar para el siguiente trabajo. Sin reintentos automáticos: el reintento es explícito (`ctl.retry`), usa la misma entrada y semilla con intento nuevo (`A2`), y el caso cuenta una vez (`solicitados` 4, `intentos` 5, `reintentados` 1). Tres caídas seguidas detienen el despacho (`interrumpido`) para evitar bucles. Los demás fallos de registro siguen interrumpiendo el lote como en MOTOR-12.
- **Reinicio:** sin cambios: el intento en curso se repite desde su inicio congelado; no hay snapshot por trabajador ni reanudación de una instrucción de JavaScript.
- **Interrupción inducida (prueba):** `ctl.run(id, { induce: { match_id, after_ms } })` termina el hilo mientras simula (trabajo real). El intento lo registra como inducido (`error.induced`, motivo «interrupción inducida (prueba controlada, no es un defecto del motor)»).

## 5. Medición (§13.2)

Entorno: Node v22.22.0, Linux 6.18, 4 vCPU Intel Xeon @ 2,10 GHz (`availableParallelism` = 4), 16 GiB; commit de la rama (ver informe). Comando: `node scripts/bench-world.js --n=8 --concurrency=<seq|1|2|4|auto> --runs=2 --json=…`. Agenda: 8 de los 66 pares del catálogo de 12 equipos de referencia (zancada 7), `PERF-M15-20261017` como espacio (`batchSeed` = FNV-1a del nombre) y semillas LOT-SEED-R1. **Es un benchmark de coste, no una muestra de calibración.** Ocho partidos por pasada: no se publica p95 y las medianas son de 8 datos. Pasada 1 = **fría** (módulos y workers sin calentar); pasada 2 = **caliente** (mismo lote como revisión nueva). Todas las muestras en [`evidencia-motor15-c/`](evidencia-motor15-c/).

### 5.1 Tiempo de pared de la ejecución (de despachar a terminar), 8 partidos, `world-essential`, huella incremental, validación completa

| Concurrencia | Fría (ms) | Caliente (ms) | Caliente por partido (ms) | Aceleración caliente vs 1 | Suma de tiempos por trabajo, caliente (ms) |
|---|---:|---:|---:|---:|---:|
| secuencial (hilo principal) | 5 857 | 4 974 | 622 | — | 4 925 |
| 1 worker | 5 870 | 4 928 | 616 | 1,0× | 4 868 |
| 2 workers | 4 028 | 2 903 | 363 | 1,7× | 5 697 |
| 4 workers | 4 076 | 2 375 | 297 | 2,1× | 8 938 |

La suma de tiempos por trabajo **no es la espera del usuario** y sube con la concurrencia (4 workers: 8 938 ms frente a 4 925 ms): cada partido tarda ≈ 1,8× más cuando hay cuatro a la vez en 4 vCPU (contienen núcleo, GC y ancho de banda de memoria con el coordinador). Con 8 partidos y 4 workers hay además cola final (2 partidos por worker). Multiplicar workers no divide el tiempo por el mismo factor.

### 5.2 Fases (mediana por trabajo, caliente, secuencial, 8 partidos)

| Fase | Mediana (ms) | Notas |
|---|---:|---|
| preparación de la entrada (`inputFor`) | 0,7 | |
| **cálculo deportivo (simulación)** | **588,6** | 94 % del trabajo |
| validación (acta + analítica) | 31,9 | `validation=acta` la reduce; ahorro total medido ≈ 0,06 s/partido junto a quitar la huella |
| huella incremental | 45,2 | `none` la elimina; `full` (TRAY-MOTOR12) cuesta similar (+0,01 s/partido medido) |
| captura del registro compacto | 0,6 | |
| serialización | 2,2 | |
| escritura | 1,7 | |
| finalización del coordinador (renombrado + índice) | 0,1 | |
| prepar. del lote (crear/congelar/validar, una vez) | 28 (total) | |
| agregación descriptiva | ≈ 0 | |

### 5.3 Comparación de niveles (misma agenda de 8, secuencial, caliente)

| Nivel | Por partido (ms) | Bytes por partido (sin comprimir) | Total 8 sin comprimir / gz | Pico RSS del proceso |
|---|---:|---:|---|---:|
| `world-essential` (incremental + validación completa) | 622 | 0,25 MiB | 1,94 MiB / 0,24 MiB | 163 MiB |
| `world-essential` (sin huella, validación `acta`) | 558 | 0,25 MiB | 1,94 MiB / 0,24 MiB | 154 MiB |
| `world-essential` (huella `full`) | 635 | 0,25 MiB | 1,94 MiB / 0,24 MiB | 206 MiB |
| `reduced` | 687 | 3,7 MiB | 29,2 MiB / 2,2 MiB | 245 MiB |
| `diagnostic` | 2 610 | 40 MiB | 323,7 MiB / 23,4 MiB | 660 MiB |

El esencial reduce **≈ 15× los bytes** frente al reducido y **≈ 160×** frente al diagnóstico con ≈ 9 % y ≈ 76 % menos tiempo respectivamente; la simulación (≈ 0,5–0,6 s) domina, por lo que el nivel **no** acerca el objetivo de coste por sí solo.

**Memoria (alcance declarado):** `maxRSS` es el máximo del **proceso** (coordinador + workers en el mismo proceso); el heap del coordinador (≈ 16 MiB con workers, 58 MiB en secuencial) no incluye el de los workers. Con 4 workers: 405 MiB de RSS de proceso. No hay medida por hilo.

### 5.4 Objetivos de producto (§13.1)

| Objetivo | Medido / proyectado | Estado |
|---|---|---|
| 100 partidos en 5 s | **no medido**; proyección lineal con 4 workers caliente: 100 × 0,297 s ≈ **30 s** (≈ 6× por encima) | **no alcanzado** en la configuración medida (extrapolación, no ejecución) |
| 200 partidos en 10 s | proyección ≈ **60 s** | estimación, **no verificada** |

Cuello residual: la simulación del núcleo (94 %), perfil de CPU plano en una ejecución (ningún punto caliente > 6 %: GC 6,2 %, `rec` de `defense.js` 3,7 %, `canonicalJson` 2,8 %, carga de módulos ~5 % en una ejecución fría). El propio registro cuesta < 10 %. Con la limitación de 4 vCPU el techo realista del pool es ≈ 2–2,5× sobre secuencial. Opciones para MOTOR-16/17 (no decididas aquí): reducir coste del núcleo por posesión; más núcleos; o, como decisión de producto separada, una resolución agregada distinta (fuera de alcance de este bloque).

## 6. Pruebas (`tests/motor15-c.test.js`, 4 grupos; suite completa 183/183 con las de MOTOR-15 A)

1. Neutralidad del nivel esencial (2 entradas): trayectoria, sorteos, acta; huella incremental independiente del detalle; fachada; `none` declarado; matriz.
2. Aislamiento/controlador: secuencial = 1/2/4 workers sobre 4 entradas congeladas (marcador, sorteos, huella, acta y secuencia); vistas por agenda; `auto`; concurrencia 3 rechazada; workers levantados una sola vez.
3. Caída inducida de un worker con trabajo real + reintento explícito sin duplicar el caso; los demás resultados intactos; el reintento reproduce la referencia.
4. Detener/continuar con concurrencia 2 sobre 6 partidos: dos activos a la vez, ninguno queda a medias, continuación = ejecución sin pausa (secuencial).

Se modificó un test existente por cambio de contrato autorizado (§1.2): `tests/motor12.test.js` ya no exige rechazar concurrencia 2 (ahora se rechaza 3).

## 7. Límites y no hecho

- No se ejecutó el benchmark de cien ni la matriz completa de §15.2 (solo la de este bloque: seq/1/2/4 × essential, más niveles y opciones, 8 partidos).
- Agregados y paquete ZIP MOTOR-12 **no** soportan el nivel esencial (sin tablas CSV): extracción propia por el JSON esencial.
- Cuando el lote usa `auto`, la concurrencia depende de la máquina: queda registrada en el job, pero dos máquinas pueden usar valores distintos con resultados deportivos idénticos (comprobado).
- La fila `batch.concurrency` del perfil (SEM-MOTOR12) sigue con valor 1 y su texto dice «solo se admite 1»; **debe actualizarse en la extensión SEM-MOTOR15** (valores 1/2/4/`auto`; operativa, no deportiva). No se tocó `data/match` ni `src/profiles` (zona del bloque B).
- Un fallo de memoria (OOM) de un worker o un `process.exit` del hilo se trata igual que una caída (intento fallido); no se probó OOM real.
- No se probó Node 24 ni otros entornos.
