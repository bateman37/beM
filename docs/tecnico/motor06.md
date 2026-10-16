# Implementación de MOTOR-06 (transición, decisiones espontáneas y saques)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Encargo: [`../prompts/MOTOR-06-transicion-y-saques.md`](../prompts/MOTOR-06-transicion-y-saques.md). Base: [`motor05.md`](motor05.md) (y anteriores). Recorrido manual: [`../prompts/MOTOR-06-recorrido-manual.md`](../prompts/MOTOR-06-recorrido-manual.md).

Versión del motor `beM-motor-0.6.0-MOTOR06` · entrada `beM-match-input/4` · exportación `beM-match-export/5` (el `export/4` se rechaza como formato anterior) · perfil efectivo `SEM-MOTOR01-20261016+…+SEM-MOTOR05-20261016+SEM-MOTOR06-20261016` (SEM: provisional, no calibrado) · semilla de referencia `20261016`: **82–97**, parciales 13-28 | 18-24 | 21-23 | 30-22 (fixture `tests/fixtures/baseline-motor06.json`).

**El contenido operativo cambió otra vez**: los resultados no son comparables con MOTOR-05 (70–100). El marcador no se usa como objetivo ni se recalibró nada por él.

## Qué hay (mapa de rutas)

| Ruta | Contenido |
|---|---|
| `data/match/motor06-seed-extension.json` | Extensión `SEM-MOTOR06-20261016`: cifras del anexo A **copiadas literalmente** (`opportunities`, `throwIns`, `sharedResolution`, `existingPlans`; verificadas contra el prompt archivado por `npm run data:check`), reglas (`rules.throwInReleaseSeconds` = 5, `rules.receiveAndShootMinimumSeconds` = 0,3), repertorio declarativo ESP (`spontaneousRepertoire`) y de saques (`throwInRepertoire`, sin números), descriptores de cobertura de POS05–POS08 y campos de plan `throwInBook`, `throwInServers`, `throwInDefense`. |
| `src/match/spontaneous.js` | Catálogo ESP01–ESP20 como capa de clasificación, opciones directas (una sola partida «DIRECTA» y una «AUTONOMA» en la mezcla), recurso autónomo y registro de oportunidades. |
| `src/match/throwin.js` | Sacador, funciones del saque, llamadas puntuales, respuesta defensiva, calidad de la entrega, plazo de 5 s, cadena del saque y su cierre. |
| `src/match/flow.js`, `actions.js`, `defense-actions.js`, `defense-specials.js`, `plays.js` | Pase inicial real de POS05/06, recuperaciones y transición con contexto, urgencia, decisión única de robo, coberturas de mano a mano e indirectos, disruptiva frente a flagrante, regla de 0,3 s. |
| `src/match/diagnostics.js` | Consultas diagnósticas con numerador y denominador (denominador 0 = no calculable). |
| `src/match/orders.js`, `order-types.js` | `throwInBook`, `throwInServers`, `defThrowIn` (plan) y `throwInCall` (llamada puntual). Validación conjunta de la proyección, incluidas las órdenes de plan pendientes. |
| `src/match/replay.js`, `data.js` | `export/5`; `upgradeInput` añade explícitamente los valores por defecto de saques sin sobrescribir; `validateThrowPlan`. |
| `src/profiles/rows.js`, `groups.js`, `library.js` | Filas nuevas con consumidor, vista «saques», perfiles anteriores marcados como anteriores. |
| `src/lab/throwin-ui.js`, `prep.js`, `direction.js`, `game.js`, `coverage.js`, `panel/repertorio.js` | Controles y fichas de saques, tarjeta de oportunidades, cobertura y repertorio. |
| `tests/motor06.test.js` | 20 pruebas acotadas. |

## Cómo funciona

- **Un solo flujo de oportunidades.** Una acción organizada sale de **una** mezcla: las fichas llamadas, la partida «AUTONOMA» (recurso sencillo fuera del libro) y la partida «DIRECTA» (decisión espontánea del poseedor). Las tres comparten la ejecución física (salidas, calidad, resolución). No hay cuotas, ni probabilidad o sorteo por ESP, ni «ficha falsa»: el origen se registra como llamada, libro, recurso autónomo o decisión directa.
- **ESP01–ESP20 = clasificación.** Cada situación declara su contexto (`when`), sus opciones físicas compatibles, su decisor y su cierre. Una opción con varias etiquetas es **una** opción: las etiquetas no multiplican masa ni sorteos (prueba 2b). La percepción no es una puerta independiente: la capa se declara «no disponible» y la lectura usa la del poseedor.
- **Decisión directa.** El grupo directo pesa una media ponderada por preferencias de sus opciones, con el factor de calidad percibida aplicado una vez. La libertad del plan lo modula (con libertad mínima casi desaparece, sin cuota; prueba 3b). Un pase directo negado reorganiza o pasa a recurso sencillo (ESP15).
- **Recurso autónomo (ESP20).** Solo para jugadas que no están en el libro (candidatas POS05/06, POS02/POS01 temprana, POS09); se etiqueta ESP20 y conserva el nombre de la ficha real como procedencia.
- **Transición y recuperaciones.** `afterBallRecovery` (ESP12/13/14) conserva continuidad, balance y oposición tras robo, tapón vivo, rebote o balón suelto: no reinicia ni recoloca. `urgencyFactor` actúa una sola vez en la mezcla y en la cadena de pases extra. ESP19 solo cuando la calidad previa es forzada en un tiro temprano; un tiro temprano que falla no se llama precipitado por fallar (prueba 4b).
- **POS05/POS06 (cierra V01).** El director entrega primero al eje si este no tiene el balón: es un pase real (emisor y receptor, oposición, posible pérdida de esa interacción); no hay segunda probabilidad de pérdida ni asistencia automática. `participantsOf` añade `pasadorInicial` y `receptorInicial`.
- **POS14 (cierra V01).** El director es candidato válido a aislador (`directorOk`), sin prioridad ni obligación. Corregido el fallo `taken.delete` en la asignación de roles.
- **Coberturas de entregas e indirectos.** POS05–POS08 declaran `coverage` (tipo handoff o indirect, balón, quien se mueve, navegador, función del bloqueador y coberturas permitidas). COB01 (seguir/pasar por detrás) y COB02 (cambio) usan la misma maquinaria que el bloqueo directo con `kNav` para la rama ligera; lo no permitido se declara y no se sustituye por otra cobertura.
- **Robos.** `decideSteal` es la única decisión de intento (acceso → decisión → ejecución → control → crédito, cada paso distinto); el 0,25 (`stealAttemptGivenAccessP0`) se aplica una vez. No hay robo sin intento ni sorteo de crédito independiente (prueba 9). No se ha afinado nada al marcador.
- **Disruptiva y flagrante (FIBA 2026).** `disruptiveAdmin` sustituye a `unsportsmanlikeAdmin`. Categorías distintas: dos faltas disruptivas **no** descalifican; dos flagrantes, dos técnicas de categoría 1 o una de cada sí (`sanctions`/`disqualifies`). La regla de 8 s solo se corrige donde importa: el tiempo de saque no cuenta para ella. El PDF FIBA sigue inaccesible (403): lectura propia (ver abajo).
- **Saques.** `nextPoss.throwIn` marca saque de **fondo** tras canasta y último libre, y de **banda** tras pérdida muerta o falta no sancionada con tiros. Seis fichas ofensivas (SaqB01–03, SaqF01–03) y seis respuestas (DSaqB01–03, DSaqF01–03). El sacador está fuera de la pista y es distinto del receptor; se elige preferido → alternativo → política funcional y se revalida si sale. Primera opción negada → alternativa real dentro del mismo plazo; sin ninguna, envío forzado o infracción (no se inventa una recepción).
- **Tres tiempos distintos.** Plazo administrativo de 5 s del sacador (los sorteos de preparación lo consumen, el intervalo de suelta no); reloj de juego (solo corre si estaba corriendo, p. ej. tras canasta); reloj de posesión (arranca al primer toque). La regla de 0,3 s (art. 16.2.5): un tiro con límite menor y ejecución real expira.
- **Cadena de saque.** Empieza con su ejecución y termina en resultado o nueva organización (`reorganize`); los puntos posteriores no se cuentan dos veces (prueba 7b).
- **Llamada puntual (`throwInCall`).** Espera «el siguiente saque propio compatible del periodo»; otro origen incompatible no la consume; caduca con el periodo; lo imposible se rechaza con motivo (prueba 8).
- **Perfiles y entrada.** Una entrada `input/3` se migra de forma explícita con los valores por defecto (SaqB01 y SaqF03 a prioridad 3; DSaqB01/DSaqF01) sin sobrescribir lo configurado. Un perfil anterior sin repertorio de saques se marca como anterior y se ofrece una candidata explícita.
- **Registro.** `intent.procedencia`, `etiquetasESP`, `contexto`, `entregaInicial`, `cadenaRobo`, eventos `throw_in` con sacador, receptor, opción, plazos y calidad. El relato los muestra.
- **Diagnóstico.** Seis consultas (uso directo, tres de transición, aceptación inmediata, familia autónoma, tiro temprano forzado, primera opción del saque) con numerador y denominador; denominador 0 se muestra «no calculable», nunca cero.

## Cierre de las salvedades de MOTOR-05 (§2)

| Punto | Resultado |
|---|---|
| POS05/06 | Corregido (pase inicial real). Cambio aceptado documentado en `docs/motor/tacticas/c09-p03-…`. |
| POS14 | Corregido (director candidato válido sin prioridad). Idem. |
| Coberturas en entregas e indirectos | Implementadas con las coberturas existentes; incompatibles declaradas. |
| Robos / 0,25 | Una sola aplicación; fases distintas. Sin recalibrar. |
| Disruptiva / flagrante | Categorías distintas; documentado en `docs/motor/reglamento/c18-…`. |
| 8 s | Sin cambio funcional salvo no contar el tiempo de saque. |
| D01–D17 | Revisados uno a uno solo donde el encargo los toca (D10 coberturas → ampliado; D13 8 s → sin cambio; D14 antideportiva → sustituido por disruptiva/flagrante; D15 y D16 sin cambio). Ninguna se aprueba en bloque; el resto sigue como interpretación abierta. |

## Interpretaciones técnicas (para revisión de Dennis / ChatGPT)

No son decisiones de producto nuevas: huecos locales y reversibles.

| ID | Interpretación |
|---|---|
| I01 | ESP es una **capa declarativa de clasificación** (`when`) sobre opciones físicas; no un motor paralelo ni un conjunto de probabilidades. |
| I02 | El grupo DIRECTA entra en la mezcla como **una** partida (media ponderada por preferencia, factor de calidad percibida una vez); AUTONOMA, otra. |
| I03 | ESP20 solo para jugadas fuera del libro (POS05/06, POS02/POS01 temprana, POS09). |
| I04 | La percepción no es una puerta independiente; la capa se declara «no disponible». |
| I05 | Entrega del saque: clase de calidad por TAR03 (receptor frente a marcador); negada = clase forzada y sin ventana; presión sobre el sacador = mezcla 0,65/0,35 de dos defensores; la entrega final forzada elige entre pérdida, falta, balón suelto o entrega con `categoryWeights`. |
| I06 | El plazo de 5 s lo consumen los sorteos de preparación; no se reinicia; el intervalo de suelta no es parte del plazo. |
| I07 | El reloj de juego solo se consume si corría; el de posesión empieza en el primer toque. |
| I08 | DSaqF01 concede la banda restringida (efecto «restringida concedida»); la cobertura de B02/F03 elige COB01/COB02 por compatibilidad declarada. |
| I09 | `kind` plan/call/lineup/special/tcall; `early` solo en el primer tramo de posesión y se limpia al reorganizar. |

## Observaciones y DECISIÓN REQUERIDA

Ninguna bloquea esta entrega.

1. **Sanción exacta de disruptiva y flagrante** (arts. 37.2, 38.2, 17.2.7, 29.2.6 de la FIBA 2026): el PDF no es accesible (403) y se aplica la lectura propia descrita arriba. **Impedimento registrado**. Dennis/ChatGPT deben confirmar tiros libres, posesión y descalificación exactos.
2. **Tabla de coberturas por ficha** (POS05–POS08): qué coberturas son realmente jugables en cada entrega/indirecto es contenido declarativo de lectura de Claude; las incompatibles se declaran.
3. **Robos:** igual que en MOTOR-05 (0,25 con una sola aplicación); decidir si esa referencia era para otra población de interacciones sigue siendo de Dennis/ChatGPT.

## Comprobaciones

`npm test`: 20 pruebas nuevas en `tests/motor06.test.js` (1 POS05/06 y POS14 · 1b coberturas · 2/2b catálogo ESP y etiquetas · 3/3b origen y libertad · 4/4b recuperaciones y ESP19 · 5/5b/6 seis fichas, sacador, negación · 7/7b tres tiempos y cadena · 8/8b llamada puntual y migración de entrada · 9/9b robo y sanciones · 10/10b exportación, rechazo de `export/4` y filas · 11 **cinco partidos completos** de cierre), más las heredadas ajustadas. `npm run data:check`: correcto. Recorrido de interfaz con Chromium automatizado (preparación con bloque de saques, partido completo, tarjeta de oportunidades, relato, panel › Repertorio y pestaña de cobertura): sin errores de página. Barrido de desarrollo (fuera de la entrega): las seis fichas y respuestas alcanzables; ESP01–ESP20 observadas con configuraciones adecuadas (ESP09 solo con COB02; ESP07 rara); decisiones directas ≈3 % de los inicios organizados con libertad por defecto; recurso autónomo ≈6 % de las posesiones; rendimiento sin cambio (mínimo ≈1 s, completo ≈4,8 s).

## Cobertura

| Estado | Contenido |
|---|---|
| Implementado y comprobado | Todo lo anterior. |
| Implementado, pendiente de revisión manual | Sensación de juego de los saques y de la decisión directa, contenido declarativo ESP y de saques, controles de interfaz. |
| No implementado (entrega prevista) | Forma/momentos (MOTOR-07), memoria (MOTOR-08), sanciones extraordinarias y cierre administrativo (MOTOR-09), calibración final. |

## Límites conocidos

- Node 22 solo; Chromium solo. No ejecutado: Node 24, otros navegadores.
- El PDF FIBA no es accesible desde el entorno; lecturas propias a contrastar.
- El tiempo de sesión y la consumición de cuota de Claude Code no son medibles desde el entorno.
