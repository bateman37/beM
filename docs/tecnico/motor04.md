# Implementación de MOTOR-04 (ataque posicional completo)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Encargo: [`../prompts/MOTOR-04-ataque-posicional.md`](../prompts/MOTOR-04-ataque-posicional.md). Base: [`motor01.md`](motor01.md), [`motor02.md`](motor02.md), [`motor03.md`](motor03.md). Recorrido manual: [`../prompts/MOTOR-04-recorrido-manual.md`](../prompts/MOTOR-04-recorrido-manual.md).

Versión del motor `beM-motor-0.4.0-MOTOR04` · entrada `beM-match-input/2` · exportación `beM-match-export/3` · perfil efectivo `SEM-MOTOR01-20261016+SEM-MOTOR02-20261016+SEM-MOTOR03-20261016+SEM-MOTOR04-20261016` (SEM: provisional, no calibrado) · semilla de referencia `20261016` (resultado de la versión: 90–126, parciales 9-30 | 34-37 | 21-28 | 26-31; fixture `tests/fixtures/baseline-motor04.json`).

**El contenido operativo cambió**: los resultados no son comparables con MOTOR-02/03 (la referencia anterior era 94–89). Los archivos `beM-match-export/2` se identifican como anteriores y no se reproducen con este motor.

## Qué hay (mapa de rutas)

| Ruta | Contenido |
|---|---|
| `data/match/motor04-seed-extension.json` | Extensión `SEM-MOTOR04-20261016`: **cifras SEM del anexo A** (literales, verificadas contra el prompt archivado por `npm run data:check`), contenido declarativo del repertorio (`repertoire`), planes de demostración y sustituciones explícitas (`replacements`). |
| `src/match/plays.js` | Intérprete del repertorio: `layoutFor` (ocupación de funciones por disposición), `assignRoles` (participantes por función), `buildExits`, `bookCompatibility`. Sin coeficientes. |
| `src/match/actions.js` | `eligiblePlays` (elegibilidad + reorganización compatible), `coachPlayDistribution`, `mixIntention` (elaboración, riesgo y media distancia, una vez cada uno), `midrangeFactor`, `reboundCommitments`. |
| `src/match/flow.js` | `organizedAction`/`runPlay`, `receiverDecision` (decisión del receptor), `denialAlternative` (CONT06/CONT07), transición con odds y déficit de balance, `playTrace`. |
| `src/match/orders.js`, `order-types.js` | Órdenes nuevas `disposition` y `roles`; `styles` admite siete estilos y media distancia; `priorities` admite `null` (desactivar) y activar una ficha ausente. |
| `src/profiles/rows.js`, `library.js` | Filas nuevas con consumidor; `upgradeCandidate` (candidata explícita desde un perfil anterior). |
| `src/lab/` | `styles.js`, `prep.js` (preparación completa), `direction.js` (dirección en vivo), panel › «Repertorio». |
| `tests/motor04.test.js` | 10 pruebas acotadas (63 en total con las heredadas). |

## Cómo funciona

- **Disposición = funciones.** Cada una de las seis disposiciones declara cinco funciones (cabecera del director, ala, esquina, codo, interior alto/bajo…). `layoutFor` ocupa las funciones de forma **determinista**: primero las más escasas (interiores), y cada una la toma el jugador de mayor ajuste de capacidad (receta de posición `rotation.slotAbilityWeights`, ya existente). No hay coordenadas, coeficiente de victoria ni prohibición por posición nominal. Se calcula al primer uso de la posesión y se registra en el primer hecho (`intent.disposicion`, `intent.funciones`).
- **Fichas declarativas.** Las quince fichas declaran roles funcionales (con las funciones de disposición admitidas, las posiciones **recomendadas**, las tareas favorecibles por rol y si son opcionales), salidas de primer nivel, **etapas** de decisión posterior, alternativas ante negación, opciones y seguridad. Las nueve que reutilizan receta (`recipeFrom`: POS02, 03, 04, 06, 08, 10, 12, 13, 15) **no copian** calidad de ataque/defensa ni pesos zonales: referencian los de su ficha donante; no existen quince bases de acierto.
- **Elegibilidad antes de preferencia.** Una ficha es elegible si todas sus funciones obligatorias pueden ocuparse (emparejamiento sin sorteos). Si falta una función que aporta una de sus entradas naturales y cabe una reorganización (`durationSeconds.reorganization` × ritmo), es elegible tras **reorganizar a esa disposición**, que consume tiempo real y queda registrada (`reorganization` con `intent.disposicion`). La masa de la familia es la de su mejor prioridad elegible; la variante nueva pesa `eligibleVariantBaseWeight` (1).
- **Roles ofensivos.** El rol favorece funciones (tabla del anexo A, en `repertoire.offensiveRoles`): ×1,25 **una vez** al elegir participante; nunca inelegible ni toca capacidades. Los cambios de rol son una orden (`roles`) que entra en la siguiente asignación.
- **Etapas (CONT02/CONT03, alto-bajo).** Una salida de recepción **agrega** (en el reparto del entrenador) las salidas finales de su etapa; si se elige, el **receptor decide** entre ellas con **su** Visión, Decisiones, Iniciativa y libertad (`receiverDecision` → `libertyAndReading(receptor)`), sin heredar la lectura del director ni el pase del base. La duración suma un intervalo de continuación por la recepción real y otro por un pase posterior; el riesgo de desenlace se cobra **una vez** (el eslabón final), como CONT05 de MOTOR-01 (T09).
- **Negación.** Una recepción cuya calidad previa resulta «forzada» registra la negación en la posesión (`poss.denials`) y abre una escalera: CONT06 (corte ante negación, si la ficha lo declara) y CONT07 (rechazo de la primera opción), cada una con la aceptación de oportunidad inmediata existente; si no, CONT09/CONT08/ESP15 como antes. POS10 solo es elegible con una negación observada: el receptor negado es su cortador.
- **Estilos** (cada efecto en un único punto): transición → odds `p' = f·p/(1−p+f·p)` del intento de correr; elaboración → factor sobre los pesos de continuaciones elegibles y sobre la probabilidad de pase adicional (misma fórmula); riesgo → `exp(tilt·r)` con `r` = estimación de pérdida que ya produce la valoración de opciones; después del tiro → encargos de rebote. Nivel 3 = factor 1 en todos.
- **Media distancia.** Instrucción de **selección** (evitar 0,3; aceptar si liberada 1/0,4; buscar `0,65+0,7·a(TEC02)`), nunca cero. «Aceptar si liberada» usa la **esperanza** de calidad cómoda (`qualityDistribution`, compartida con `qualityOf`) porque la calidad real se sortea después de elegir.
- **Rebote y balance.** `reboundCommitments`: nivel 3 = candidatos históricos (`offenseParticipantSlots`) + tirador cercano al aro por acceso; niveles 1–2 = un cargador (en el 1 el tirador cercano se queda en balance; en el 2 puede acompañar); niveles 4–5 suman jugadores por acceso funcional (rim < mid < far) y fuerza de rebote, con tope de cuatro (siempre queda una referencia de seguridad). El déficit de balance frente a la base neutral multiplica ×1,2 por referencia los odds de la **ventaja** (`unopposedChance…`) de la transición del rival (inverso si hay una de más). El efecto abstracto `rebound.loadLogitByLevel` queda en **0** en este perfil (sustitución registrada con su valor anterior en `identity.extensions[].replaced`); el perfil de MOTOR-03 conserva su versión.
- **Órdenes.** `disposition` y `roles` solo entran en la **entrada de posesión** o en una **reorganización compatible** (nunca en mitad de una ventaja). Una llamada se consume al inicio efectivo (para POS13 desde DIS02: tras reorganizar); una llamada a una ficha desactivada es puntual y no la activa.
- **Perfiles anteriores.** Se conservan identificados; no hay migración silenciosa. «Panel › Inicio» ofrece **Activar la base de MOTOR-04** o **Crear candidata MOTOR-04 desde esta versión** (borrador sobre la base nueva con los valores que esa versión había cambiado; las filas sustituidas por la extensión no se trasladan). La entrada editada guardada se actualiza con el valor inicial de `midrange` y se informa en Preparación.

## Interpretaciones técnicas (para revisión de Dennis / ChatGPT)

No son decisiones de producto nuevas; son huecos de implementación resueltos de forma local y reversible.

| ID | Interpretación | Dónde |
|---|---|---|
| V01 | **El contenido declarativo del repertorio (roles, funciones admitidas, salidas, etapas, alternativas) es lectura de Claude** del anexo B y de los capítulos de referencia; las cifras son las del anexo A. Funciones por disposición: DIS01 `top+2 alas+2 esquinas`, DIS02 `top+2 alas+esquina+interior`, DIS03 `top+2 alas+interior alto+bajo`, DIS04 `top+2 codos+2 esquinas`, DIS05 `top+2 codos+2 alas`, DIS06 `top+2 bloques+2 esquinas`. | `repertoire` |
| V02 | La ocupación de funciones es determinista (máximo ajuste de capacidad por función); la asignación de **participantes** dentro de una ficha sigue siendo ponderada y con sorteo (como en MOTOR-01). | `plays.js` |
| V03 | Posiciones nominales (`participantSlots`) = **recomendación por niveles**: si algún candidato de las posiciones recomendadas cumple la función, se elige entre ellos; si no hay, valen todos. No es una prohibición. | `roleCandidates` |
| V04 | El agregado de una salida de recepción suma las salidas finales de su etapa (el receptor compite en cada zona como un finalizador más). El reparto zonal histórico solo se aplica a finalizaciones elegibles y a su actor real. | `scoreExits` |
| V05 | «Aceptar si está liberada»: esperanza sobre la calidad previa (ver arriba). | `midrangeFactor` |
| V06 | `plan.midrange` por defecto = «aceptar si está liberada» (valor SEM inicial, escrito en el plan, no oculto); planes guardados antiguos se actualizan de forma explícita. | `scenario.plans`, `upgradeInput` |
| V07 | La escalera de negación usa `acceptance(...)` (suelo + libertad)·lectura·ajuste técnico para CONT06/CONT07: no se añade ninguna probabilidad nueva. CONT07 elige entre las demás salidas de la ficha con la lectura del que tiene el balón. | `denialAlternative` |
| V08 | Los `denials` solo se registran cuando una **recepción** (exec pase, receptor ≠ poseedor) resulta negada. Es la única fuente de negación hasta MOTOR-05. | `runPlay` |
| V09 | El déficit de balance se calcula en el tiro (`crash − (histórico + tirador cercano)`) y se aplica en la siguiente posesión rival tras rebote defensivo o tapón recuperado; no tras robos. | `reboundCommitments`, `transitionPhase` |
| V10 | `rebound.balance.preserveNeutralBaselineAssignmentsWhenCompatible` queda «declarada sin mecanismo»: el motor siempre conserva el neutral, no hay alternativa definida. | `rows.js` |
| V11 | La calidad de las salidas de etapa y de CONT06/CONT07 es la de desmarque (TAR03), manejo (TAR02) o poste (TAR05) del actor final frente a su marcador, no la calidad nativa de la ficha. | `runPlay` |
| V12 | POS05/POS06 incorporan la **conservación por el poseedor** (salida propia del `hub`), que el anexo B cita como alternativa del contenido ya previsto. POS09 registra `corte: {recibe:false}` cuando la salida elegida no es la del cortador. | `repertoire`, `runPlay` |
| V13 | Los siete estilos son editables desde el partido; los tres nuevos que MOTOR-02 llamaba «sin control» cambian de estado. |

## DECISIÓN REQUERIDA

Ninguna bloquea esta entrega. Conviene que Dennis/ChatGPT confirmen el contenido declarativo (V01, funciones por disposición) y las lecturas V03/V05/V09, porque cambian el reparto de participantes y resultados.

## Comprobaciones (`npm test`, 63 pruebas)

`tests/motor04.test.js`: (1) catálogo y referencias · (2) elegibilidad, prioridad compartida, masa familiar · (3) funciones y propietarios de capacidad · (4) POS03/04/10/13 · (5) estilos causales sin tocar la conversión · (6) un cobro por causa, reloj, libro vacío · (7) rebote/balance · (8) filas → consumidores, órdenes, exportación y reproducción · (9) **cuatro partidos completos** (base, Horns, 1–4 bajo y base por cuartos) con acta/reloj/quintetos conciliados e invariantes activas · (10) llamadas. Ajustadas las heredadas que fijaban el comportamiento anterior (estilo «no editable», fixture de realizabilidad, referencia de equivalencia). No se lanzan lotes masivos.

Barrido de desarrollo (30 semillas, **fuera de la entrega**, solo plausibilidad): 94,4 puntos/equipo, ≈147 posesiones/partido, 10,3 pérdidas, 14,3 libres y 29,9 triples intentados por equipo, 0 errores con invariantes.

## Cobertura

| Estado | Contenido |
|---|---|
| Implementado y comprobado | Lo listado arriba. |
| Implementado, pendiente de revisión manual | Interfaz (preparación, libro por familia, dirección en vivo, panel › Repertorio; recorrido automatizado en Chromium hecho), sensación de juego de cada disposición y ficha. |
| No implementado (entrega prevista) | Zonas/otras coberturas/roles defensivos (MOTOR-05), ESP completo y saques tácticos (MOTOR-06), Forma/momentos (MOTOR-07), memoria y adaptación (MOTOR-08, **sin castigo automático por repetición**), cierre extraordinario (MOTOR-09). |

## Límites conocidos

- Node 22 solo; Chromium solo. DIS01/03/05 y el resto de estilos se cubren con pruebas pequeñas y el recorrido manual, no con partidos automáticos propios.
- POS10 es poco frecuente por diseño (requiere una negación previa); CONT08 y CONT06 son raras.
- Consumo de cuota de Claude Code: no hay indicador visible desde el entorno; no se mide.
