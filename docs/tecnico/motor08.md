# Implementación de MOTOR-08 (entrenador automático y memoria defensiva)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Encargo: [`../prompts/MOTOR-08-entrenador-y-memoria.md`](../prompts/MOTOR-08-entrenador-y-memoria.md). Base: [`motor07.md`](motor07.md) (y anteriores). Recorrido manual: [`../prompts/MOTOR-08-recorrido-manual.md`](../prompts/MOTOR-08-recorrido-manual.md).

Versión del motor `beM-motor-0.8.0-MOTOR08` · entrada `beM-match-input/6` (añade política, delegación y plan de participación por equipo) · exportación `beM-match-export/7` (el `export/6` y anteriores se rechazan con motivo y el archivo se conserva) · perfil efectivo `SEM-MOTOR01-20261016+…+SEM-MOTOR07-20261016+SEM-MOTOR08-20261016` (SEM: provisional, no calibrado) · semilla de referencia `20261016`: **88–110**, parciales 22–30 · 20–30 · 22–20 · 24–30 (cambia el resultado de MOTOR-07, 83–97, porque ahora ambos equipos tienen entrenador automático).

## Qué hay (mapa de rutas)

| Ruta | Contenido |
|---|---|
| `data/match/motor08-seed-extension.json` | Extensión `SEM-MOTOR08-20261016`: tres políticas ENTREF01–03 con los catorce parámetros del encargo **copiados literalmente** (verificados contra el prompt archivado por `npm run data:check`), comunes de final, recetas de necesidad, librillo de faltas (8 filas con prioridad), contextos de final, pausas, memoria (ocho patrones máximo, curva y seis patrones/catorce respuestas) y, por equipo, política y plan de participación precargados. Sustituye de forma trazable `rotation.*` de MOTOR-07 (marcadas `sin_consumidor` por `coach.supersedes`). |
| `src/match/coach-policy.js` | Funciones **puras** de política: `utilityFor`, `decideRotation`, `foulBookRow`, `endgameState`, `decideEndgame`, `timeoutCauses`, `decideTimeout`, `memoryProposals`, plan de participación. Solo reciben la vista permitida. |
| `src/match/coach.js` | Estado del entrenador en el motor: `coachView` (vista permitida), decisiones con ciclo de vida, órdenes automáticas (`autoOrder`), fronteras (`coachFrontier`), rotaciones, pausas, ajustes, finales, bloqueos manuales y respuestas a la memoria. |
| `src/match/memory.js` | Memoria defensiva: exposición, calidad observable, evidencia con decaimiento perezoso, capacidad, reemplazo y descarte. |
| `rotation.js`, `orders.js`, `order-types.js`, `flow.js`, `states.js`, `defense-actions.js`, `defense-specials.js`, `actions.js`, `core.js`, `index.js`, `replay.js`, `data.js` | Enganches: ventana de sustitución, orden `coachDelegation`, bloqueo manual, revalidación de pausas al llegar su ventana, observación de hechos para la memoria, protección por faltas, correcciones §12, diagnóstico y exportación/migración. |
| `src/profiles/rows-motor08.js`, `validate-motor08.js`, `rows.js`, `library.js`, `groups.js` | Filas del diccionario (familias `coach.*` y `memory.*`), validación de relaciones, vistas temáticas «Entrenador» y «Memoria», perfiles anteriores marcados. |
| `src/lab/coach-ui.js`, `prep.js`, `game.js`, `coverage.js` | Preparación (política, delegación, plan de participación), tarjeta del partido (delegación vigente, decisiones, bloqueos) y diagnóstico. |
| `tests/motor08.test.js` | 12 pruebas con propósito (10 de comportamiento, cinco partidos completos de integración y una de finales) con estados de prueba acotados y marcados como tales. |

## Cómo funciona

1. **Una sola utilidad 1–30.** `utilityFor` aplica las capacidades efectivas con la energía ya aplicada (curva de `rotation.utilityMaxEnergyPenalty`) y la usa tanto la sustitución como el entrenador: no se resta la energía dos veces ni se suma después a la probabilidad de ejecución.
2. **Fronteras.** El entrenador revisa al **final de cada posesión**, al **inicio de cada periodo** y en cada **ventana reglamentaria de sustitución** (balón muerto con reloj parado). Entre fronteras no hay decisiones.
3. **Rotaciones** (área `rotation`). Razones, en orden: salida obligatoria por exclusión (no delegable), energía crítica, protección por faltas, fatiga (`U(R) ≥ U(P) − fatigueUtilitySacrifice`), ordinaria (`U(R) ≥ U(P) + replacementGain`), faltas de cierre, tramo largo, participación y necesidad de final. Estabilidad: tramo mínimo en pista y en banquillo, sin intercambio inmediato; la energía crítica y la necesidad de final son **excepciones declaradas y registradas**.
4. **Librillo de faltas** (área `fouls`). Filas ordenadas: FB100 exclusión reglamentaria (sin excepción), FB090 orden manual sobre el quinteto, FB080 cierre disputado (compara el valor de cierre y puede mantener), FB075 urgencia, FB070 protección Q1/Q2/Q3, FB060 reducción de riesgo en Q4. Protegido sin cambio: baja un nivel el estilo de **intentos voluntarios** de robo (`foulProtection.stealStyleLevelReduction`); no cambia la probabilidad de falta.
5. **Pausas** (área `timeouts`). Causas con evidencia observable (racha con desorden, problema defensivo repetido, descanso contextual, preparación en acción, reorganización) con **reserva** y **enfriamiento**. La solicitud nace pendiente, espera su ventana legal y se **revalida** al llegar: si la causa ya no se cumple se cancela sin gastar el recurso. Una orden manual prevalece sobre la automática.
6. **Ajustes y memoria** (área `adjustments`). La memoria recomienda; la delegación y la compatibilidad **autorizan**. Una respuesta es una orden de plan validada (`checkDefensePlan`) que entra en su frontera; nunca cambia una probabilidad.
7. **Finales** (área `endgame`). Cinco contextos (`urgent`, `fastAttack`, `seekThree`, `protectLead`, `closeContest`) mediante una **tabla** de estilos ofensivos/defensivos, necesidades y falta táctica (ESPD01, orden puntual que no garantiza el contacto). Se restauran los estilos que cambió el entrenador al terminar el contexto.
8. **Bloqueos manuales.** Una orden manual de plan fija sus campos «hasta cambiarla» o «hasta final de cuarto» (`lockUntil`); el entrenador no los sobrescribe. `coachDelegation {releaseLocks:true}` los libera de forma explícita.

## Memoria defensiva (MEM01–MEM04)

- Una por equipo defensor, **máximo 8 patrones**. Clave `familia semántica | rol` (no la ficha): el mismo recurso con otra ficha es el mismo patrón.
- **Exposición** registrada una vez por ataque continuo y **antes** de conocer el acierto; la calidad observable (cómoda / disputada / incómoda) procede de **causas** (receptor libre, ventana de ayuda, fallo de coordinación, cobertura superada, distancia concedida), no del resultado ni de una etiqueta ESP.
- Evidencia: `e ← e·2^(−n/7) + 1` (n = ataques rivales desde la última referencia; el decaimiento se aplica una sola vez por tramo), saturación 4, descarte por debajo de 0,25, reemplazo por menor evidencia efectiva → antigüedad → clave.
- **Reconocer no penaliza**: sin ámbito delegado, con memoria reconocida, los hechos deportivos son idénticos (prueba 7). Repetir un recurso no lo castiga.

## Contrato de información

El entrenador solo recibe `coachView`: lo propio (energía, faltas, Forma y momentos **como categorías**, marcador, reloj, tiempos muertos, historial público del partido y resumen de **su** memoria) y del rival solo hechos públicos (en pista, faltas, disponibilidad). No hay energía, Forma, momentos, capacidades ni T del rival, ni el estado del generador de azar. La prueba 8 varía todos esos datos ocultos y comprueba que la vista y las propuestas no cambian.

## Salvedades de MOTOR-07 (§12 del encargo), una a una

| Salvedad | Resolución |
|---|---|
| Falta disruptiva/flagrante fuera del acto de tiro | Dos tiros libres para quien recibió la falta; saque de su equipo con **14 s exactos** (`rules.penaltyThrowInShotClockSeconds`), no «al menos 14». Dos disruptivas no descalifican automáticamente. Texto y comentarios con arts. 37.2/38.2/17.2.7/29.2.6. **Fuente: el resumen del encargo; el PDF FIBA no se ha consultado.** |
| COB04 en entregas POS05/POS06 | Jugable como **compromiso de dos sobre el receptor** (`slot:'receiverMarker'`, primario D2, segundo D1). Exige entrega al receptor y que el que entrega no esté protegido; si no se cumple, **fallback declarado** a COB01 (`defenseRepertoire.handoffDoubleTeam`). |
| Recepción forzada de saques | **No garantizada**: con las opciones negadas el envío compite en las categorías habituales (recepción difícil de un jugador real o pérdida). |
| MEN02/03/04 | Mapa acotado: **solo la decisión de robo consume MEN** (I-D1 de MOTOR-07). El resto de tareas no lo usa; no hay otra tarea defensiva de percepción. |
| Banquillo | Solo atenúa hacia neutral (I-D2). Sin cambios. |
| `stateTasks` / episodios | Siguen siendo tablas declarativas de lectura de Claude; documentadas en MOTOR-07, sin cambios. |
| Calibración | Todo SEM. Nada calibrado. |

## Interpretaciones técnicas (reversibles, para revisión)

| ID | Interpretación |
|---|---|
| I-M08-1 | **Excepción de estabilidad por energía crítica**: el entrenador puede relevar antes del tramo mínimo con energía por debajo de `criticalEnergyReview`. Se registra en la decisión (`estabilidad.excepcion`) y se cuenta aparte. |
| I-M08-2 | **Ruta B (preparación en acción) no implementada**: solo la ruta A (órdenes de plan que entran en su frontera). |
| I-M08-3 | Orden manual de tiempo muerto **cancela** la automática pendiente del equipo (una sola pausa, la de Dennis). |
| I-M08-4 | Las decisiones registran `versionDeLaBiblioteca` como procedencia; la proyección deportiva **no** la incluye, de modo que el mismo partido con otra etiqueta de perfil sigue siendo idéntico. |
| I-M08-5 | `export/7` (y no `export/6`): la entrada y las decisiones cambian el contrato. Las órdenes automáticas **no son comandos**: se regeneran al reproducir y se contrastan. |
| I-M08-6 | Las filas `coach.*`/`memory.*` que solo se leen en un contexto concreto (p. ej. prioridades del librillo, necesidades de final, respuestas MEM) están declaradas condicionales en la prueba de consumo; su efecto se comprueba en `motor08.test.js` con estados de prueba acotados. |

## DECISIÓN REQUERIDA

1. **Respuestas MEM poco frecuentes.** Con el repertorio actual, de ~28 patrones reconocidos por partido se responden ~6 (el resto no tiene respuesta compatible o está bloqueado). ¿Se amplía el catálogo de respuestas (producto) o se acepta como está hasta calibrar?
2. **Reemplazos de memoria.** Con el máximo de ocho patrones se observan ~80 reemplazos por partido; es un efecto de la capacidad, no un error. ¿Se mantiene el máximo de ocho del encargo?
3. **Texto FIBA.** Las lecturas de §12 salen del resumen del encargo; ¿se contrastan con el PDF cuando esté accesible?
4. **Políticas.** Los catorce parámetros son los del encargo (SEM). No se ha calibrado cuál política «rinde» mejor ni se pretende: ninguna es una capacidad.

## Comprobaciones

`npm test` (118 pruebas, 0 fallos): 12 nuevas en `tests/motor08.test.js` — 1 energía 30 y fatiga · 2 estabilidad y salida obligatoria · 3 librillo · 4 orden manual y delegación · 5 pausas · 6 memoria · 7 reconocer no penaliza · 8 contrato de información · 9 exportar/reproducir y modos · 10 disruptiva y saque forzado · 11 **cinco partidos completos** · 12 finales. Adaptadas por el cambio deliberado de contrato: `motor04` (la falta táctica ordenada por el entrenador no es resolución compuesta), `motor06`, `motor07` (esquemas), `profiles` (baseline `baseline-motor08.json` y consumo de filas). `npm run data:check` correcto.

Cinco partidos de integración (con `check:true`, **no calibración**): referencia `20261016` 88–110 · cauta/agresiva 89–95 · energía inicial baja 86–102 · exposición repetida con libro de una ficha (`20261017`) 124–92 · finales (`20261018`) 92–95. El de exposición repetida es deliberadamente un escenario extremo. Los estados de prueba de las pruebas 3, 5 y 12 (periodo, reloj, marcador, faltas) son **preparados, no espontáneos**.

## Cobertura

| Estado | Contenido |
|---|---|
| Implementado y comprobado | Todo lo anterior salvo lo indicado abajo. |
| Implementado, pendiente de revisión manual | Sensación de juego de las tres políticas, tiempos muertos y finales, respuestas de la memoria, interfaz de delegación y diagnóstico. |
| No implementado (fuera de alcance) | Ruta B (preparación en acción), entrenamiento y temporada, memoria entre encuentros, cierre reglamentario extraordinario (MOTOR-09), calibración. |

## Límites conocidos

- Node 22 solo; Chromium solo. No ejecutado: Node 24, otros navegadores.
- El PDF FIBA no se ha consultado; lecturas tomadas del resumen del encargo.
- El tiempo de sesión y la cuota de Claude Code no son medibles desde el entorno.
