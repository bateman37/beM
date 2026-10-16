# Implementación de MOTOR-01 (primer partido completo)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Diseño funcional: [`../motor/README.md`](../motor/README.md). Encargo: [`../prompts/MOTOR-01-primer-partido-completo.md`](../prompts/MOTOR-01-primer-partido-completo.md).

## Base técnica seguida

No había base técnica aprobada, así que se usó la propuesta del §9.2 del encargo: JavaScript ESM, HTML/CSS estándar, `node:http`, `node:test`; **sin dependencias de ejecución, sin base de datos, sin framework**. `.nvmrc` declara 24 (propuesta); `engines` exige `>=22` porque el entorno de ejecución solo disponía de Node 22.22.0, con el que se ha comprobado todo. No se ha probado con Node 24.

Comandos: `npm run dev` (laboratorio en <http://localhost:5173/>, `PORT` configurable), `npm test`, `npm run data:check`, `npm run match -- 20261016`.

## Mapa de rutas

| Ruta | Contenido |
|---|---|
| `data/match/motor01-seed-profile.json` | Anexo A extraído programáticamente (SEM, no calibrado). |
| `data/fixtures/reference-players-MOTOR01.csv` | Anexo B: 144 fichas ficticias. |
| `data/catalog.json` | Hashes SHA-256 y estado de ambos materiales. |
| `src/match/` | Núcleo sin DOM ni BD: `rng` (xorshift32), `mathx`, `data` (carga/validación), `core` (estado, tiempo, energía, registro, recetas), `rules` (reglas FIBA puras), `rotation` (relevo), `plays` (fichas), `actions` (resolución, faltas, rebote), `flow` (posesiones, ESP, periodos), `box` (acta proyectada), `narrative` (relato), `index` (API). |
| `src/lab/` | Laboratorio: plantillas, preparación, partido, cobertura. |
| `scripts/` | `dev-server.js`, `run-match.js`, `print-match.js`, `check-data.js`, `node-data.js`. |
| `tests/` | `data`, `match`, `rules`. |

## Cómo funciona (resumen)

- Un paso del motor = una posesión; dentro, cada **resolución** agrupa preparación, lectura, elección y ejecución y descuenta su duración una sola vez. No hay bucle por segundo.
- Selección: familia (mejor prioridad elegible, `[8,5,3,2,1]`) → ficha → salida (jugador, zona), con `Pintencion=(1−L)·Pentrenador+L·(q·Padaptación+(1−q)·Ppreferencias)`.
- Después: ayuda (`helpProbability`, TAR09), ventana libre y descarga (CONT04), pases adicionales (CONT05, `extraPassProbability`), calidad (`qualityBase`, `advantageSensitivity`), negación = calidad forzada → reorganización CONT09 (`reorganizeIfDeniedProbability`) o recurso ESP15 / salida segura CONT08 si no hay tiempo, y categoría de `outcomes.base` con causas pertinentes; tiro con tapón/conversión/contacto; rebote por participantes de los slots del perfil.
- Transición tras robo/rebote defensivo (ESP01/ESP02, `selection.direct`) y tras rebote ofensivo (ESP12/ESP13); ESP06 (recepción liberada), ESP16/ESP17 (poco reloj).
- El acta (`box.js`) se **proyecta de `event.stats` y duraciones**; el estado solo conserva faltas/energía/estancia para decidir, y los tests concilian ambos.
- Cada encuentro guarda entrada efectiva, perfil, semilla, hechos, sorteos (secuencia, propósito, valor), detalle calculado (`detail:'full'`), diagnóstico, acta y cobertura. `detail:'minimal'` omite solo el detalle y no cambia el partido.

## Interpretaciones técnicas (para revisión de Dennis / ChatGPT)

No son decisiones de producto nuevas: son huecos de implementación que se resolvieron con los números ya declarados o con lectura reglamentaria. Cualquiera es reversible y está localizada.

| ID | Interpretación | Dónde |
|---|---|---|
| T01 | **No se ha podido consultar el PDF FIBA** (el proxy devolvió 403 para `assets.fiba.basketball`). Las reglas aplicadas son las del funcional y del encargo; los puntos siguientes son lectura propia no contrastada con el PDF. | — |
| T02 | Falta ofensiva: cuenta como falta personal y como falta colectiva del periodo, pero **nunca da libres**. | `actions.js` `resolveOffensiveFoul` |
| T03 | Reloj de posesión tras contacto de aro (rebote ofensivo) y tras falta/infracción defensiva con saque en ataque: se completa a 14 s **solo si quedaban menos**; si no, continúa. Tapón sin aro: el reloj no cambia. | `rules.js` |
| T04 | Periodos 2.º en adelante y prórrogas empiezan con saque según la flecha (que se invierte al usarla); la flecha se inicializa en contra del equipo que gana el salto. | `flow.js` `startPeriod` |
| T05 | Ventana de sustitución: balón muerto con reloj parado (falta, fuera, infracción, canasta con reloj parado en los últimos 120 s, último libre anotado) e intervalos; nunca entre libres. Los obligatorios se resuelven antes que los voluntarios y, sin compañero de la posición, entra cualquier disponible (se marca `fueraDePosicionNominal`). | `rotation.js` |
| T06 | Negación de una ficha = oportunidad de calidad `forced`; derivación con `reorganizeIfDeniedProbability`. Un recurso ESP15 nace con calidad forzada. | `flow.js` |
| T07 | Ventana realmente libre (sin oposición): `Kcontexto = +maximumQualityContextLogit` (extremo del rango declarado) y sin término defensivo. | `actions.js` `qualityOf` |
| T08 | Alcance corporal (`contestAbilitySensitivity`) se aplica **solo** a la defensa del tiro (conversión), no al tapón. | `actions.js` |
| T09 | Pases adicionales y descarga se suman a la duración de la **misma** resolución (una categoría por resolución), sin repetir la probabilidad completa de pérdida por envío. | `flow.js` |
| T10 | Si ningún tiro organizado cabe en el reloj, el tiro usa `urgentShot`; los tiempos se **truncan** al límite (no se recortan al último instante). Si ni la distribución urgente cabe, expira (bocina o violación de 24 s). | `actions.js` `planDuration` |
| T11 | Energía: intervalos de cuarto/descanso/prórroga recuperan a todos los jugadores; el desgaste usa `FIS06` como Resistencia base; los máximos por tarea salen de `tasks`, `shots`, `block`, `rebound`, `contact` y, para términos de calidad, de `defaultTechnicalTaskMax`/`defaultPhysicalTaskMax`. | `core.js` |
| T12 | Aceptación de ESP: `clamp((acceptanceFloor+L)·q·ajusteTecnico,0,1)` con `ajusteTecnico = abilityFit` de la técnica de la opción y `q`, `L` del que decide (director, portador o captor). | `flow.js` |
| T13 | En la coordinación de POS01 se sustituye el término `MEN01` del director por `TAR01` (MEN01 0,7 + MEN05 0,3). | `flow.js` `playQuality` |
| T14 | Pesos de preferencia por zona: vocación de finalización × preferencia de zona × `abilityFit` × multiplicador de estilo. El «rol» solo interviene por la asignación de funciones: el seed no trae coeficientes numéricos por rol. | `actions.js` `prefWeight` |
| T15 | Director sin ninguno de la lista en pista: primer disponible por orden PG, SG, SF, PF, C (marcado `fallback`). | `actions.js` |
| T16 | Los tiros de equipo sin jugador (violación de 24 s) constan como pérdida de equipo, fuera de las filas de jugador. | `box.js` |

## DECISIÓN REQUERIDA

Ninguna bloquea esta entrega. Lo que Dennis debería confirmar es T01–T04 (lectura reglamentaria) porque cambian resultados de forma visible.

## Observaciones con evidencia (sin ajustar nada)

Barrido de desarrollo de 60 semillas (5001–5060, no forma parte de la entrega ni de las pruebas): 0 fallos, invariantes verificadas tras cada acontecimiento. Medias por equipo y partido: 91,6 puntos, ≈72 posesiones, ≈11 pérdidas, ≈12,6 faltas, ≈14,5 libres intentados, ≈28,5 triples intentados, rebote ofensivo ≈28 %; 2 de 60 con prórroga. Las faltas son bajas y el marcador algo alto para una referencia FIBA, pero **no se han tocado coeficientes** (encargo §2.3). CONT08 y la violación de 24 s son raras (7 y 11 apariciones en 60 partidos) y ESP12/ESP13 aparecen ≈1,4 y ≈2,4 veces por partido: es falta de oportunidades aceptadas, no un fallo de elegibilidad.

Partidos de referencia (entrada por defecto, `npm run match -- <semilla>`): 20261016 → EQ01 98–85 EQ02 (23-23 | 32-13 | 23-21 | 20-28); 20261017 → 105–110 (26-25 | 23-30 | 28-25 | 28-30); 20261018 → 89–75 (32-21 | 19-18 | 22-16 | 16-20). Tiempo ≈0,2–0,4 s por partido.

## Límites conocidos

- Cobertura restante y pendientes: ver [`../../src/match/index.js`](../../src/match/index.js) (`COVERAGE`) y la pestaña «Cobertura».
- Sin saques tácticos, tiempos muertos, lesiones ni faltas técnicas; sin asistencias ni créditos de equipo distintos de la violación de 24 s.
- Forma, momento, Consistencia y Presión: entrada neutral. Estilos de transición, elaboración, riesgo y tras tiro: valor declarado, sin control.
- No se comprobó el PDF FIBA (T01), ni Node 24, ni la interfaz en otros navegadores que Chromium.
