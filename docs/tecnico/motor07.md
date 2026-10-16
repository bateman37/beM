# Implementación de MOTOR-07 (capacidades, energía, Forma y momentos completos)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Encargo: [`../prompts/MOTOR-07-capacidades-y-estados.md`](../prompts/MOTOR-07-capacidades-y-estados.md). Base: [`motor06.md`](motor06.md) (y anteriores). Recorrido manual: [`../prompts/MOTOR-07-recorrido-manual.md`](../prompts/MOTOR-07-recorrido-manual.md).

Versión del motor `beM-motor-0.7.0-MOTOR07` · entrada `beM-match-input/5` (añade `importance` y estados explícitos) · exportación `beM-match-export/6` (el `export/5` se rechaza con motivo y el archivo se conserva) · perfil efectivo `SEM-MOTOR01-20261016+…+SEM-MOTOR06-20261016+SEM-MOTOR07-20261016` (SEM: provisional, no calibrado) · semilla de referencia `20261016`: **83–97**, parciales 23-22 | 13-23 | 23-36 | 24-16 (fixture `tests/fixtures/baseline-motor07.json`). El marcador de MOTOR-06 era 82–97: el cambio procede de la presión ordinaria, los momentos, T, la lectura defensiva y el acceso de transición; **no se recalibró nada por él** y no es una prueba de realismo.

## Qué hay (mapa de rutas)

| Ruta | Contenido |
|---|---|
| `data/match/motor07-seed-extension.json` | Extensión `SEM-MOTOR07-20261016`: cifras del anexo A **copiadas literalmente** (verificadas contra el prompt archivado por `npm run data:check`) y dos tablas declarativas de lectura de Claude (`stateTasks`, `episodeCatalog`). Sustituye de forma trazable `motor02.momentDynamics`. |
| `src/match/states.js` | Forma, presión, momentos M-TIR/M-OFE/M-DEF con actualización perezosa, T, pausas, episodios, lectura defensiva y acceso de recorrido largo. |
| `src/match/formulas.js` | Funciones puras compartidas con el panel: `perturbBinary`, `perturbCategories`, `consistencySigmaAt`, `pressureLossLogit`, categorías. |
| `src/match/visibility.js` | Vistas propia / rival / diagnóstico (sin azar). |
| `src/match/scenarios.js` | Siete copias de contraste identificadas (C00–C06) con cambios listados. |
| `actions.js`, `flow.js`, `defense-actions.js`, `rotation.js`, `orders.js`, `core.js`, `index.js`, `replay.js`, `data.js` | Enganches: elección, calidad, control, conversión, libre, tapón, rebote, episodios, pausas, sustituciones, exportación y migración de entrada. |
| `src/profiles/rows-motor07.js`, `validate.js`, `preview.js`, `library.js` | Filas del diccionario con consumidor (644 filas en total), relaciones de validación (alpha < 1, T sin aporte directo…), previsualización de curvas y perfiles anteriores marcados. |
| `src/lab/*` | Entradas de estados, importancia, copias de contraste, vistas y diagnóstico. |
| `tests/motor07.test.js` | 11 pruebas acotadas y cinco partidos de cierre. |

## Mapa causal de las 32 capacidades

Cada fila se comprueba con una **sonda** de `tests/motor07.test.js` (prueba 1): cambia al editar la capacidad en su propietario y no al editarla en otro jugador. «Exposición» = si el partido la ejercita en cada encuentro; una capacidad sin exposición en una partida no está inerte.

| Capacidad | Operación real y propietario | Fase |
|---|---|---|
| TEC01 / TEC02 / TEC03 / TEC04 | `shotAbility` de la zona (triple, media, tiro interior, finalización) del tirador; también preferencia y valor de elección | ejecución, elección |
| TEC05 | Serie de libres del lanzador (sin defensor) | ejecución |
| TEC06 | `prepAbility`: coste de preparar el tiro en movimiento (no es una segunda puntería) | oportunidad/coste |
| TEC07 / TEC08 | Control del balón (TAR06) y pase (TAR07) del poseedor/pasador; pérdidas | ejecución |
| TEC09 / TEC16 | Bloqueo (TAR04 ataque) y defensa del bloqueo (TAR04 defensa, coberturas) | oportunidad |
| TEC10 / TEC11 | Desmarque/recepción (TAR03) y poste (TAR05): crean la ventaja antes de resolver el tiro | oportunidad |
| TEC12 / TEC13 | Defensa perimetral/interior: calidad de la oportunidad, disputa del tiro y legalidad del contacto | oposición |
| TEC14 | Robo: TAR06 defensa, interferencia solo si el defensor decide intervenir | oposición |
| TEC15 | Tapón (receta del bloqueador) | oposición |
| TEC17 / TEC18 | Rebote: fuerza de participación y captura entre candidatos reales | disputa |
| FIS01 | Acceso de recorrido largo en transición (**nuevo**, sustituye a TAR02 como ponderación de quién termina) y llegada del defensor (`defenderArrival`) | transición |
| FIS02 / FIS03 | Primer paso y ajuste corto: TAR02, TAR03, ayudas | oportunidad |
| FIS04 / FIS05 / FIS07 | Fuerza (poste, contacto, rebote), Salto (tapón, rebote, aro) y Equilibrio (tiro, control, contacto) | ejecución |
| FIS06 | Gasto de energía bajo carga comparable (`enduranceFactor`); **sin** bonus directo de acierto | coste |
| MEN01 | Coordinación del director (TAR01) y calidad de la ficha | oportunidad |
| MEN02 / MEN03 | Lectura del que decide (director, receptor) y **lectura del defensor real** al decidir si interviene sobre el balón (**nuevo**, ver I-D1). La presión reduce solo la valoración de MEN03 | percepción, elección |
| MEN04 | Anticipación: oposición, ayudas, rebote, tapón | oposición |
| MEN05 | Atención y continuidad en control, pase y legalidad; no se repite en cada fase | ejecución |
| MEN06 | **Nuevo**: amplitud de la variación de los momentos (σ = 0,45 − 0,30·a(C)); no añade talento medio | estados |
| MEN07 | **Nuevo**: pérdida por presión k·P·(1 − a(C)) y puntos de Decisiones perdidos; solo reduce una pérdida | estados |

Escala absoluta 1–30 sin renormalizar; edad, peso, potencial y reputación no suman nada (prueba 1b: variar edad y peso solos reproduce exactamente el mismo deporte). El tamaño interviene una vez en la disputa del tiro y en el rebote; el salto es una capacidad dinámica separada. Gesto → técnica principal: triple/media/interior/finalización por zona real; TEC06 solo prepara; TEC11 crea la ventaja y el tiro usa su técnica; el libre no tiene defensor.

## Cómo funciona

- **Energía.** Sin cambios en la curva (`0→1`, `10→0,65`, `30→0,3`, `50→0,1`, `70→0,01`, `100→0`) ni en el gasto/recuperación: el deterioro se aplica al máximo de cada tarea (selectivo), nunca a las 32. Recuperación del tiempo muerto efectiva: **1,5** (extensión SEM-MOTOR02; no se vuelve a 2 por un antecedente). La rotación y sus umbrales no se tocan: un referente con E30 sigue valorándose por su utilidad real.
- **Forma.** Entrada `state.form` ∈ [−1, 1], constante durante todo el encuentro. Efecto por ámbito (tiro 0,35 · control 0,2 · defensa/disputa 0,2 · coordinación 0,15 logit): `k·F` del lado propio menos `k'·F` de la contraparte una vez, limitado al máximo del ámbito.
- **Presión.** `P = máx(importancia, tensión)`, con importancia ∈ {ordinaria 0,25, importante 0,6, decisiva 1} (entrada del encuentro) y tensión = peso del periodo · l (últimos 300 s) · c (margen ≤ 12). Pérdida del ejecutante `k·P·(1 − a(MEN07))`; presupuesto conjunto Forma−presión en [−0,6, 0,4] logit. Elección: hasta 2·P·(1 − a(MEN07)) puntos de MEN03 en la valoración. **Consecuencia que conviene saber:** la importancia «ordinaria» (0,25) no es neutral: resta unas centésimas de logit a los ejecutantes con MEN07 medio; es la semilla del anexo A.
- **Momentos.** Tres por jugador, dominio [−1, 1], `M_t = clamp(n + ρ·(M − n) + σ(C)·√(1−ρ²)·U)` con `ρ = 2^(−Δ/vida media)` (90 s en pista, 60 s en banquillo) y `U` uniforme en [−√3, √3] del generador deportivo (propósito `momento:<jugador>:<ámbito>` en los sorteos del hecho). **Actualización perezosa**: el intervalo pendiente de un jugador y ámbito se procesa de una vez cuando una tarea o un episodio lo necesita; la misma frontera no vuelve a sortear; renderizar, abrir el panel o la velocidad no actualizan nada. El banquillo solo atenúa (sin variación aleatoria; ver I-D2); una sustitución procesa antes el intervalo con la situación anterior.
- **Pausas deportivas.** Tiempo muerto, intervalo de cuarto/prórroga y descanso largo crean un **marcador** que cada estado procesa una sola vez y en su orden (factor de conservación 0,8/0,65/0,3 en momentos y 0,85/0,7/0,4 en T). Es distinto de la recuperación de energía; la pausa de pantalla no lo aplica.
- **T.** Un estado por equipo, decae de forma determinista (vida media 150 s), sin sorteo y solo cambia por episodios y pausas. Solo es elegible en la **calidad previa de la oportunidad** (coordinación): `Z = 0,7·M + 0,3·T`. No entra en la conversión de un tiro definido ni en el pase individual ya elegido (cero aporte directo, invariante validada). No hay remontada compensatoria.
- **Tareas con estados** (`stateTasks`): conversión de tiro, tiro libre, control del balón (pérdida/infracción/conservar), calidad previa de la oportunidad, tapón y rebote. Cada una declara su ámbito, su momento propio y el de la contraparte; si M-DEF ya explicó la oportunidad de esa acción (`ex.mdefUsed`), la conversión no lo vuelve a usar. Una sola mezcla y un solo `alpha` por tarea (0,2/0,18/0,18/0,16), también cuando coinciden T y momento individual.
- **Episodios** (`episodeCatalog`, solo con evidencia que el motor produce): EPI01 canasta con probabilidad previa ≤ 0,25 (M-TIR +0,10); EPI02 infracción de balón o pérdida sin intento de intervención (M-OFE −0,10); EPI03 reorganización tras ficha negada/rebote ofensivo/balón recuperado sin ventaja que llega a tiro o falta recibida sin pérdida (T +0,08, una vez por posesión); EPI04 ayuda que llega y el tiro falla (T +0,06); EPI05 ayuda que deja libre al receptor sin relevo (T −0,08); EPI06 pausa. Se aplican a partir de la frontera posterior, **nunca** a la acción que los causó (prueba 7); una señal equivalente de la misma cadena/destino/ámbito se registra sin otro impulso. Frecuencia observada en una partida: EPI02 ≈ 15, EPI03 ≈ 18, EPI04 ≈ 2, EPI01 0–3, EPI05 0–4.

## Neutralidad (mecanismo y límites)

La perturbación se aplica **sobre la probabilidad ya contextual**, no como ruido en el logit: binaria `p_m = p + α·Z·min(p, 1−p)`; distribución excluyente `p'_j = p_j + α·Z·v_j` con `v_j = p_j(1−P_G)` en el grupo favorable G y `−p_j·P_G` fuera (suma cero, positividad garantizada con α < 1). G se declara en datos (`control`: conservar el balón; `opportunityQuality`: cómoda). La prueba 6 usa **pares de innovaciones opuestas** (u = 0,9 / 0,1) en contexto fijo y estados neutrales y comprueba sobre la salida final (conversión, categorías de control y calidad) que la media coincide con la probabilidad de referencia, y que a menor Consistencia la amplitud es mayor sin mover el centro. **Límites:** no es una auditoría empírica de temporada; los episodios, la selección adaptativa, un estado inicial no neutral y las decisiones rivales sí cambian el rendimiento real, y la importancia ordinaria introduce una pérdida determinista por presión; no se exige neutralidad del marcador de partidos completos.

## Registro, visibilidad y reproducción

- `ev.calc` (detalle completo) añade `estados:forma_presion:<tarea>` (propios, contraparte, ejecutantes, Forma, exigencia, pérdida, ajuste y límites) y `estados:momento:<tarea>` (momentos, T, Z, alpha, grupo favorable, probabilidades base y finales). `diagnostics.states` guarda valores y marcas de tiempo **comprometidos**, `stateLog` la evolución (desde, hasta, previo, nuevo, variación, pausas) y `episodes` cada episodio (cadena, destino, signo, magnitud, límite, evidencia y deduplicación). Sin muestras por segundo.
- **Propia**: energía con número y barra; Forma y momentos como categorías con su ámbito (Muy frío … Muy caliente; Forma Muy mala … Muy buena); T como «conexión del equipo». **Rival**: solo hechos públicos (en pista, faltas, racha observable); nunca números internos. **Diagnóstico de laboratorio**: números, proyección determinista (solo atenuación) y episodios; no se entrega al decisor ni al entrenador automático (la prueba 8 verifica que la lectura del que decide no cambia con los estados rivales). Ninguna vista consume azar (prueba 4).
- `export/6` conserva entrada (con `importance` y estados), perfil efectivo completo y `contrast` si procede; la reproducción vuelve a calcular el encuentro y compara hechos, sorteos, acta, **estados, episodios** y órdenes. Una entrada anterior se migra solo con valores explícitos de `initialStatePolicy` y se anota; un perfil anterior se marca como anterior.
- **Escenarios de contraste** (Plantillas): C00 base neutral · C01 Forma ± · C02 referente fatigado/recambio · C03 veterano técnico/joven atlético · C04 Consistencia alta/baja · C05 momentos, T e importancia decisiva · C06 Forma y energía. Son **copias** con cambios listados; no tocan fichas ni planes de Dennis.

## Cierre de las salvedades de MOTOR-06 (§2)

| Punto | Resultado |
|---|---|
| Disruptiva/flagrante, descalificación | Contrastado con el resumen normativo del encargo MOTOR-06: categorías distintas y descalificación por categoría ya correctas. |
| Libres y reanudación de la disruptiva | **DECISIÓN REQUERIDA** (abajo): sigue siendo «dos libres y posesión» por lectura propia; el resumen dice que dependen del hecho y del acto de tiro. El PDF sigue sin ser accesible desde el entorno (impedimento registrado; no se afirma haberlo leído). |
| ESP15 | Corregido: la calidad forzada la produce una negación real, no la etiqueta. |
| Envío forzado de saque | Corregido: sin «falta en tiro» (un saque no tiene acto de tiro). Que la «recepción forzada» tras negar todas las opciones sea válida **sigue pendiente de decisión**. |
| Respuestas de POS05–POS08 | Revisión independiente acotada. Confirmado: **COB04 en mano a mano** (POS05/06) se trata como un bloqueo directo copiado sobre el receptor (`beginCoverage` solo trata como ligeras COB01/COB02). No se corrige en esta entrega: exige decidir si COB04 es jugable en entregas. POS07/POS08 correctos. |
| Etiquetas ESP | Divergencias de **etiqueta** (no causales) confirmadas y pendientes: ESP19 sobre un pase negado, ESP16/ESP17 por reloj de periodo vs posesión, ESP09 por cambio sin desajuste, ESP03/04/05/08 sin ventana o separación, y opciones del anexo que el flujo no ofrece (ESP08 fijar, ESP10, ESP11, ESP17 consumir tiempo). Se documentan como cobertura parcial. |
| Latentes | DSaqB02/F03 con cobertura incompatible fuerzan COB01 (inalcanzable: la validación rechaza el plan); la elegibilidad de fichas de saque se comprueba tras el sorteo. |

No se aprueba en bloque el contenido declarativo: la revisión fue de ESP, fichas y respuestas de saque y coberturas, no de D01–D17.

## Interpretaciones técnicas (reversibles, para revisión)

| ID | Interpretación |
|---|---|
| I-D1 | `defensiveOptionReading` (MEN02 .5/MEN03 .3/MEN04 .2) se aplica a la **decisión de intervenir sobre el balón** del defensor real, como factor de odds `abilityFit(lectura)` (una vez; neutro con 16). El motor decidía el robo solo por estilo; no existe otra tarea defensiva de percepción. |
| I-D2 | El banquillo solo atenúa hacia neutral, sin innovación aleatoria («retorno gradual sin episodios»). |
| I-D3 | `longTravelAccessAttack` **sustituye** a TAR02 en la ponderación de quién termina una transición (ambas incluyen Aceleración y Manejo); `longTravelReturnDefense` no se aplica: `defenderArrival` ya conecta FIS01 y FIS02. |
| I-D4 | Reglas de las tareas: calidad previa usa a quien conduce y a quien recibe frente a sus marcadores; la conversión no repite M-DEF si ya explicó la oportunidad; el rebote no usa presión ni T; el tapón compara M-DEF del bloqueador con M-TIR del tirador. |
| I-D5 | EPI02 solo cubre errores del poseedor/pasador; los errores defensivos de atención no tienen un hecho representado distinto del duelo y no producen episodio. |
| I-D6 | `export/6` (y no `export/5`): la entrada y los estados comprometidos cambian el contrato y un `export/5` no reproduce el mismo partido. |

## DECISIÓN REQUERIDA

1. **Libres y derecho posterior de la falta disruptiva fuera del acto de tiro** (FIBA 2026 arts. 37.2/38.2/17.2.7/29.2.6): se conserva la lectura propia (dos libres, posesión y saque en ataque) porque el PDF no es accesible (403). Necesito el texto exacto de esos artículos.
2. **COB04 (compromiso de dos) en entregas POS05/POS06**: ¿jugable? Si sí, necesita su propia rama (dos defensores sobre el receptor sin ventana automática); si no, quitarla de `allowed`.
3. **«Recepción forzada»** cuando se niegan todas las opciones de un saque: ¿cuenta como recepción inventada?
4. **Episodios y presión**: semillas del anexo A (impulsos, alpha, importancia ordinaria 0,25). Sin calibrar; evaluación pendiente.

## Comprobaciones

`npm test`: 11 pruebas nuevas en `tests/motor07.test.js` (1 mapa de 32 sondas · 1b gestos y cuerpo · 1c conexiones nuevas · 2 energía · 3 Forma y presión · 4 momentos, pausas y sustitución · 5 T y presupuesto · 6 neutralidad · 7 episodios · 8 entrada, visibilidad y export/5 · 9 **cinco partidos completos**), más las heredadas ajustadas a la versión (formato de entrada/export, baseline `20261016`, filas documentales y presión ordinaria en la causalidad del tiro). `npm run data:check`: correcto (anexo A literal). Cinco partidos de cierre con `check: true` (invariantes por hecho): C00 base 83–97 · C06 Forma+energía 87–82 · C03+C04 veterano/joven con Consistencia 80–98 · C05 momentos/T/decisivo 92–85 · repetición de C00 por cuartos idéntica en estados y episodios. **No se atribuye causalidad al marcador de las variantes**: son recorridos integrados; la atribución la dan los casos controlados y la traza. Recorrido de interfaz con Chromium automatizado (copia C05, partido completo, diagnóstico, panel): sin errores de página.

## Cobertura

| Estado | Contenido |
|---|---|
| Implementado y comprobado | Todo lo anterior. |
| Implementado, pendiente de revisión manual | Sensación de juego de Forma, momentos, presión y episodios; tablas declarativas de tareas y episodios; interfaz de estados y copias de contraste. |
| No implementado (fuera de alcance) | Evolución de Forma entre encuentros, temporada, entrenamiento, envejecimiento, química, moral acumulable, memoria rival (MOTOR-08), cierre reglamentario extraordinario (MOTOR-09), calibración. Loose ball y captor de rebote no usan estados. |

## Límites conocidos

- Node 22 solo; Chromium solo. No ejecutado: Node 24, otros navegadores.
- El PDF FIBA no es accesible; lecturas propias marcadas.
- El tiempo de sesión y la cuota de Claude Code no son medibles desde el entorno.
