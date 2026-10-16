# Implementación de MOTOR-09 (reglamento, administración y acta)

Documento técnico de lo realmente implementado. Encargo archivado: [`../prompts/MOTOR-09-reglamento-administracion-y-acta.md`](../prompts/MOTOR-09-reglamento-administracion-y-acta.md). Recorrido manual: [`../prompts/MOTOR-09-recorrido-manual.md`](../prompts/MOTOR-09-recorrido-manual.md).

## 1. Base de trabajo

| Dato | Valor |
|---|---|
| Rama de trabajo | `claude/busy-edison-b1fmnc` (rama designada por el entorno; el encargo proponía `feature/MOTOR-09-reglamento-y-acta`). Se rehízo desde `origin/main` porque su PR anterior ya estaba fusionada (no se apilaron commits sobre historia fusionada). |
| Commit base efectivo | `34d4c9e` («Merge pull request #9 … MOTOR-08»). |
| MOTOR-08 comprobado por su código, no por el nombre de una rama | Presentes en `main`: `src/match/coach.js`, `memory.js`, `coach-policy.js`, `data/match/motor08-seed-extension.json`, `tests/motor08.test.js`, `docs/tecnico/motor08.md`, `export/7`. |
| Punto de partida declarado, ahora **comprobado por Claude** en esta entrega | 118 pruebas (`npm test`, 0 fallos; 12 en `tests/motor08.test.js`), referencia `20261016` = 88–110, `export/6` rechazado. El perfil con sufijo `+SEM-MOTOR08-20261016` existe y se conserva. |
| Recorrido manual de MOTOR-08 | **Sigue pendiente de Dennis.** |

## 2. Mapa de requisitos a código, tablas y interfaz

| Requisito del encargo | Código | Datos / tablas | Interfaz |
|---|---|---|---|
| §4–§6 Perfil FIBA 2026 y matriz de consecuencias (REG01, REG02) | [`src/match/regs.js`](../../src/match/regs.js) (`resolveFoul`, `matchRows`, `validateMatrix`, `disqualifies`) | `regulation.*` en [`data/match/motor09-seed-extension.json`](../../data/match/motor09-seed-extension.json) (19 filas con estado de contraste) | Panel › Vistas › **Reglamento** |
| §5.1 cadena hecho → clasificación → consecuencia → crédito | `foulAdmin` y `disruptiveAdmin` consultan la matriz (`actions.js`, `defense-specials.js`); el crédito lo calcula `acta.js` desde los hechos | hechos con vínculos (`feed`, `series`, `shotEvent`, `of`, `sobre`) | acta |
| §9 faltas, series y combinadas (REG04) | `administerSeries`, `combineSanctions` (`regs.js`); series con identificador en `shootFreeThrows` | `RG-C01`, `RG-C02`, `RG-F01–F07` | Casos preparados |
| §10 disponibilidad, inferioridad y terminación | `availability`, `terminate` (`regs.js`); guarda `coachMandatory` (RG-D02) | `regulation.availability`, `regulation.termination` | Casos preparados |
| §11 posesiones beM, F y particiones | `startPossession`/`settlePossession` registran `possLog`; F y particiones en `acta.js` | — | Acta › «Posesiones, finalizaciones F y partición de puntos» |
| §12 política estadística y créditos | [`src/match/acta.js`](../../src/match/acta.js) | `statsPolicy.*` | Panel › Vistas › **Estadística e información** |
| §13 presencia, minutos, acta individual/colectiva, más-menos | `acta.js` (intervalos de presencia por secuencia estable, VAL) | — | Pestaña Partido › acta |
| §14 correcciones y revisiones | [`src/match/revisions.js`](../../src/match/revisions.js) | `regulation.revision` | Casos preparados › «Corrección…» |
| §15 conciliaciones e invariantes | [`src/match/reconcile.js`](../../src/match/reconcile.js) (33 comprobaciones) | — | Acta › «Diagnóstico de conciliación» |
| §16.1–§16.2 pendientes de MOTOR-08 (denominadores y rotación) | [`src/match/memory-report.js`](../../src/match/memory-report.js); `memory.js` registra inserción/actualización/episodio | — | script de integración; diagnóstico |
| §16.3 ruta B | `preparedCoverage` en `memory.js`, gancho en `runPlay` (`flow.js`) | `memory.routeB.*` | traza `preparacionMemoria` en el hecho |
| §17 panel y perfil `+SEM-MOTOR09-20261016` | `src/profiles/rows-motor09.js`, `validate.js` (matriz) | `SEM-MOTOR09-20261016` | Panel; activación explícita desde Inicio |
| §18 interfaz | [`src/lab/acta-ui.js`](../../src/lab/acta-ui.js), `game.js` | — | Partido |
| §19 registro y exportación | `index.js` (`acta`, `possessions`, `reconciliation`), `replay.js` | `beM-match-export/8` | descarga JSON, `npm run replay` |
| §18.3 casos de laboratorio | [`src/match/cases.js`](../../src/match/cases.js) | — | Partido › «Casos de laboratorio preparados» |

## 3. Fuentes consultadas e incidencias de acceso

| Id | Fuente | Acceso real |
|---|---|---|
| S09-01 | OBR 2026 v1.1 | `HTTP 403` desde el entorno de ejecución; reintento por la ruta oficial alternativa sin éxito (bloqueo de red del entorno). **No consultada.** |
| S09-02 | Interpretaciones 2026 v1.0 | No consultada (mismo bloqueo). |
| S09-03 | Statisticians' Manual 2024 v1.0 | No accesible. |
| S09-04 | Rule Changes 2026 v1.0a | No consultada. |

**Consecuencia:** ninguna fila de la matriz es «lectura directa del PDF». Cada fila declara uno de cuatro estados de contraste (visibles en el panel):

- **contrastada**: el texto exacto procede del propio encargo (§4.3) — libres y reanudación de la disruptiva y la flagrante, 14 s, descalificación por categorías (`RG-F05`, `RG-F06`, `RG-D01`).
- **heredada**: lectura ya implementada en MOTOR-01 a MOTOR-08, sin contrastar (`RG-F01–F04`, `RG-K01`, `RG-W01`, `RG-S01`, `RG-P01`, `RG-A01`, `RG-O01`).
- **provisional**: mecanismo ejecutable con un valor sin contrastar (`RG-C01`, `RG-D02`, `RG-T01`).
- **pendiente**: tipada y **sin ejecución**: rechaza con un diagnóstico y el contenido exacto necesario (`RG-F07` técnicas y antideportivas 2026, `RG-C02` compensación de sanciones, `RG-R01` art. 45).

No se sustituyó la fuente por reglas recordadas de 2024 ni de la NBA. Contenido exacto necesario para cerrarlas: capítulo de faltas técnicas/antideportivas 2026, artículo de situaciones especiales (varias sanciones y compensación), art. 45 e interpretaciones, y los artículos de continuación con menos de cinco jugadores y de terminación administrativa.

## 4. Matriz de cobertura reglamentaria por familia

Estado en tres ejes distintos: **administración** (la consecuencia está implementada), **exposición** (el motor produce la situación) y **generación natural** (aparece en un partido sin entrada diagnóstica). Una tasa SEM de cero no se presenta como generación natural.

| Familia (§6.1) | Fila(s) | Administración | Exposición | Generación natural | Verificación |
|---|---|---|---|---|---|
| Inicio y períodos | RG-P01 | ejecutable (heredada) | cubierta | sí | pruebas heredadas |
| Balón y control | RG-O01, RG-K01 | ejecutable | cubierta | sí | heredadas |
| Alternancia | RG-A01 | ejecutable | parcial (sin situaciones de salto en juego) | parcial | heredadas |
| Reloj deportivo y de lanzamiento | RG-K01, RG-S01 | ejecutable | cubierta; **sin tiro en vuelo** | sí | grupo 3 + heredadas |
| Avance y plazos, control/desplazamiento, fuera | RG-O01 (+ MOTOR-05/06) | ejecutable | cubierta | sí | heredadas |
| Tiro y señal | RG-S01 | parcial | una acción que no cabe antes del límite no se produce | parcial | grupo 3 |
| Interferencia | — | **no implementada como familia propia** | no cubierta | no | pendiente |
| Contacto, faltas especiales | RG-F01–F07 | F01–F06 ejecutables; F07 pendiente | personal, ofensiva y disruptiva cubiertas; flagrante y técnicas solo por entrada tipada | personal/ofensiva/disruptiva sí; flagrante y técnicas **no** | grupo 2 |
| Libres | RG-F01–F06 | serie como unidad causal; repetición/anulación admitida | repetición/anulación solo por caso preparado | no (sin generación) | grupos 5 y 6 |
| Saques | MOTOR-06 | ejecutable | cubierta | sí | heredadas |
| Pausas y cambios | RG-W01 | ejecutable | cubierta | sí | grupo 4 + heredadas MOTOR-02/08 |
| Combinadas | RG-C01 (provisional), RG-C02 (pendiente) | ejecutable sin compensación | caso preparado | no | grupo 5 |
| Correcciones | RG-R01 (pendiente) | registro y propagación; **sin validar contra el art. 45** | entrada diagnóstica | no | grupo 9 |
| Disponibilidad | RG-D01, RG-D02 | D01 ejecutable; D02 provisional | caso preparado; el motor natural falla con diagnóstico | no | grupos 2 y 10 |
| Terminaciones | RG-T01 | provisional | caso preparado | no | grupo 10 |

Atajos antiguos localizados y conducidos a la fuente común: la administración de la falta defensiva (libres, bonus), de la falta disruptiva (libres, posesión retenida) y la descalificación acumulada consultan ahora la matriz (`foulAdmin`, `disruptiveAdmin`, `disqualifies`). **No** se conducen a la matriz: la falta ofensiva (`resolveOffensiveFoul`, fila RG-F04 declarativa pero con el código previo, mismos efectos), los relojes de lanzamiento (siguen en `rules.js`, que es su fuente común) y las ventanas (`admin.js`).

## 5. Lecturas heredadas: confirmado, corregido, no contrastado

| Lectura heredada | Estado en MOTOR-09 |
|---|---|
| Disruptiva: dos libres a quien recibió la falta, saque delantero frente a la mesa con 14 s exactos | **Confirmada contra el texto del encargo §4.3** (no contra el PDF). Ahora sale de la fila `RG-F05`. |
| Con acto de tiro: canasta + un adicional / dos o tres | **Confirmada contra el encargo**; implementada en `RG-F06`, sin exposición natural. |
| Dos disruptivas no descalifican | **Confirmada** (`RG-D01`: solo flagrantes y técnicas de categoría 1). |
| Libres por falta ordinaria en tiro y bonus tras cuatro faltas | Heredada, **no contrastada**. |
| Falta ofensiva cuenta como falta de equipo | Heredada, **no contrastada**. |
| MOTOR-06/07/08 resumen anterior del PDF | Seguían apoyadas en resúmenes del encargo; **siguen sin auditarse contra el PDF**. |
| **Corregido:** un fallo con falta en acción de tiro se contaba como intento de campo en el acta | Ahora no cuenta como FGA (política `statsPolicy.shots`); abre F y su serie. Diferencia observada en la referencia: EQ01 T2 26/48 → 26/44 y T3 8/22 → 8/21. |
| **Corregido:** el acta no distinguía libres válidos de repetidos/anulados | `TLI` solo cuenta intentos válidos. |

## 6. Orden temporal, relojes, ventanas, series y combinadas

- **Hechos con secuencia estable**: `seq` e `id` únicos; el acta y el más-menos se leen en ese orden. Dos hechos con el mismo reloj no se ordenan por la interfaz sino por `seq` (grupo de pruebas 8).
- **Relojes**: el motor sigue saltando al siguiente acontecimiento; los relojes se consumen una vez por intervalo; la causa del reajuste vive en `rules.js` y en la matriz `RG-K01`. No hay bucle de milisegundos ni tiro en vuelo.
- **Señal con administración pendiente**: la serie de libres sigue siendo la siguiente unidad de posesión aunque el reloj marque cero y el periodo solo se cierra cuando la posesión termina (grupo 3). El acta parcial lo declara (`pendingSeries`, `openFinals`).
- **Ventanas**: sin cambios de comportamiento en esta entrega (REG03 hereda `admin.js`). Se comprueba que el lanzador de una serie pendiente no sale antes de tirar y que los recursos no quedan negativos. **No se auditó de nuevo** cada caso de §8.3 (la pausa manual que cancela la automática sigue cubierta por `tests/motor08.test.js`).
- **Series**: `shootFreeThrows` asigna `S001…`; cada libre lleva serie, índice, causa, hecho de tiro de origen y pase final. `administerSeries` distingue concedidos, administrados, válidos, repetidos y anulados; un libre repetido no duplica TLI ni abre otra F.
- **Combinadas**: `combineSanctions` resuelve cada sanción una sola vez por la matriz, en orden de ocurrencia, con una reanudación única (`RG-C01`, provisional). Dos sanciones iguales de equipos opuestos quedan en `pendiente_contraste` (`RG-C02`): ni se compensan ni se administran por intuición.

## 7. Posesiones beM, F y particiones de puntos

El registro `possLog` conserva identificador, equipo, periodo, inicio, cierre y causa. Una posesión sin ataque activo (solo avance o saque) no cuenta («no crea una posesión vacía»). Cierre por causa: canasta, último libre anotado, rebote defensivo, pérdida (con/sin robo, viva o con balón muerto), tapón con control defensivo, fin de periodo con ataque activo.

F abre con cada acción de tiro (también la falta sobre un tiro fallado, aunque no cuente como FGA) y liga su serie. Los libres por bonus, disruptiva o técnica **no** abren F. Ejemplo sintético conciliado (grupo 6): canasta de dos con falta y adicional → **una** F de 3 puntos; dos libres por bonus → 2 puntos «de sanción»; total 5 = 3 + 2 + 0 + 0; vinculados a posesión 5 + no vinculados 0.

Partición A (por origen): `PTS = F + sanción no de tiro + administrativos + otros`, con «otros» = 0 (solo admite créditos tipados). Partición B (por posesión): `PTS = vinculados a posesiones beM + no vinculados`. Son dos clasificaciones del mismo total; la conciliación comprueba cada una por separado. No se fuerza igualdad de posesiones por equipo.

Referencia `20261016`: 186 puntos de cancha (83 + 103), todos ligados a F en esa partida; en los partidos de integración 2–5 aparecen entre 2 y 4 puntos de «sanción no de tiro» (bonus).

## 8. Presencia, minutos, créditos colectivos y excepciones a invariantes simples

- Intervalos de presencia: cada entrada/salida abre/cierra un intervalo con `seq`, periodo y reloj de juego acumulado. Los minutos salen de los intervalos y se **contrastan** contra el cálculo por quintetos registrados (`PRES02`), de modo que son dos derivaciones independientes.
- Más-menos: suma de los puntos de cancha del equipo menos los del rival mientras el jugador está presente. No es causalidad individual ni se reparte un punto a un quinteto inexistente. En universo normal (cinco en cada anotación) la suma por equipo es 5 × margen; con inferioridad se usa Σ(puntos × ocupación) (comprobación `PM-*`).
- Participación: `titular`, `entró`, `entró sin tiempo` (entra y sale con 0:00), `DNP`, `indisponible`. Un porcentaje sin intentos es `—`, no 0 %. Mates: **no representados** (`—`).
- Créditos colectivos: pérdidas de equipo (violación de 24 s) y rebotes colectivos admitidos con su fila propia y conciliados contra la suma individual; **el motor natural no genera rebotes colectivos** (todo rebote tiene captor).
- Excepciones a invariantes simples (no se imponen): AS ≤ FGM, robos = pérdidas rivales, rebotes = fallos, cinco jugadores siempre, igualdad de posesiones por equipo.
- Asistencias: política `statsPolicy.assist` (convención beM sobre S09-03 cap. 6, **sin auditar el PDF**): un único candidato (último pase), receptor sin creación propia con movimiento (`moved`), asistencia a canasta de campo válida o a una serie de libres elegible (una por serie con ≥1 libre convertido). **Observación diagnóstica**: la referencia produce muchas asistencias (≈ tres de cada cuatro canastas) porque la mayoría de los tiros del motor llega por un pase final; es una consecuencia de la estructura del motor, SEM, sin calibrar.

## 9. Revisiones y propagación

Tres clases (`REV-MOTOR09-R1`): **estadística** (reatribución de crédito a un jugador presente y del mismo equipo; no cambia marcador ni continuación), **reglamentaria** (valor o validez de un tiro: cambia legalmente el marcador, por lo que clasificarla como estadística se **rechaza**; exige fuente e instante; su legitimidad frente al art. 45 está **sin contrastar**) y **técnica** (ejecución inválida con versión afectada; una simulación corregida es otra ejecución). El hecho original se conserva; las proyecciones (marcador, parciales, intentos, series, F, posesiones, presencia, más-menos, acta) se reconstruyen desde una copia revisada y la conciliación se recalcula. **No se re-simula ni se reconsume azar**; la continuación original se conserva y así queda declarado en el registro. Una reatribución del anotador al propio pasador se rechaza (no existe la asistencia a uno mismo).

## 10. Cierre de los pendientes de MOTOR-08

- **«Seis de veintiocho»**: no es un fallo. El informe separa denominadores (`memory-report.js`). En la referencia (MOTOR-09): 157 exposiciones válidas → 46 patrones únicos observados → 25 revisiones de reconocimiento = 21 episodios (cruces del umbral) de 9 patrones distintos → 7 recomendaciones nuevas → 7 compatibles, 7 autorizadas y 7 aplicadas por la ruta A (+ 2 preparaciones por la ruta B). Las no aplicadas se explican: la gran mayoría es «la defensa ya contiene el patrón» (oportunidad no cómoda en la proporción mínima), no incompatibilidad. No se relajó ningún requisito ni se fabricó una respuesta: **resultado conservado como diagnóstico SEM pendiente de evaluación deportiva**.
- **«Ochenta reemplazos con ocho entradas»**: las claves (`familia|salida`) no contienen ID de evento, reloj, valor aleatorio, acierto/fallo ni calidad. Con ~22–24 claves distintas por defensa y capacidad 8, el reemplazo es la consecuencia directa de la diversidad real bajo las claves acordadas; ahora se distinguen inserción inicial, reemplazo por capacidad, descarte por decaimiento y actualización de una entrada existente (en la referencia: 47/48 inserciones, 39/40 reemplazos, 0 descartes, 33/29 actualizaciones por equipo). **No** se tocó la capacidad ni se creó una novena entrada; no se corrigió ninguna fragmentación porque no se encontró evidencia de defecto en las claves.
- **Ruta B**: implementada y acotada (`preparedCoverage`). Requiere patrón reconocido (evidencia y proporción cómoda), ámbito «ajustes tácticos» delegado, una cobertura declarada del catálogo MEM/DEF compatible con la familia y distinta de la del plan, sin orden manual ni orden de ruta A pendiente sobre la cobertura, y como máximo una preparación por ataque. No abre ventana, no cambia el plan, no concede bonus: usa el `cob` forzado de `beginCoverage`, cuya ejecución real exige defensores y capacidades. Si la respuesta ya está activa se registra **continuidad**; si hay un bloqueo manual, **impedida**.
- **Fuentes FIBA, proyección y prueba heredada**: las lecturas del resumen se sustituyen por la tabla de estados de contraste (§3); no pudieron contrastarse con el PDF. La etiqueta de biblioteca sigue excluida de la proyección deportiva. La prueba de MOTOR-04 que excluye la falta táctica del entrenador no se tocó (el universo del acta y de la conciliación global incluye todas las faltas).

## 11. Versiones y compatibilidad

- Motor `beM-motor-0.9.0-MOTOR09`; export `beM-match-export/8`; perfil efectivo con sufijo `+SEM-MOTOR09-20261016`. Verificado el export vigente: era `/7` y **sí cambia su contrato** (acta, posesiones, conciliación, revisiones, matriz y ruta B), por eso sube.
- `export/7` y anteriores se **rechazan** con motivo (`validateReplayFile`) y el archivo original se conserva sin cambios; no se promete su reproducibilidad con las reglas nuevas.
- El perfil activo de un navegador no se migra en silencio: un perfil sin `regulation` se considera anterior, no puede jugar y ofrece activar la base de MOTOR-09 o crear una candidata explícita. `tablas añadidas`: `regulation`, `statsPolicy`, `memory.routeB`.
- Reproducción: el partido se re-simula desde la entrada congelada, la semilla y los comandos (no hay snapshot de continuación): por eso no se vuelven a conceder libres ni a consumir pausas. **No existe continuación desde un snapshot ni suspensión con partido parcial persistido**: un partido suspendido o sin terminar solo se muestra como acta parcial en la sesión (alcance real mínimo; no se construyó una plataforma de guardados).

## 12. Comprobaciones ejecutadas y pendientes

Ver la ficha de ejecución en [`../prompts/README.md`](../prompts/README.md#motor-09) y el recorrido manual. Resumen en [`../estado.md`](../estado.md).

**Cambia los resultados**: por la ruta B, la referencia `20261016` pasa de 88–110 a 83–103 (los tres primeros periodos son idénticos; el cuarto difiere desde la primera preparación). Es un efecto identificado (la preparación sustituye una cobertura en una interacción), no una calibración.

## 13. `DECISIÓN REQUERIDA` / contenido necesario

No hay decisiones deportivas nuevas que pedir a Dennis: son **contenidos normativos pendientes de acceso a la fuente** (§3). Quedan abiertos, sin cerrar y sin remitir como decisión deportiva: técnicas y antideportivas 2026 (`RG-F07`), compensación de sanciones iguales (`RG-C02`), art. 45 (`RG-R01`), umbral y terminación administrativa (`RG-D02`, `RG-T01`, valores provisionales), la política de asistencia completa de S09-03 cap. 6, e interferencia como familia propia (no implementada).

## 14. Límites conocidos

- El motor natural exige cinco elegibles: sin sustituto falla con diagnóstico (ejecución inválida). La inferioridad legal solo existe en casos preparados.
- Sin tiro en vuelo, sin técnicas, flagrantes ni interferencia generadas por el motor; sin correcciones aleatorias.
- Mates, faltas de entrenador/banquillo y rebotes colectivos: admitidos por el acta, no representados por el motor.
- Dorsales: la entrada no los tiene; el acta muestra `—`.
- MOTOR-10 (análisis, informes, mapas, on/off) no está iniciado; esta entrega solo conserva intervalos y relaciones para construirlo.
