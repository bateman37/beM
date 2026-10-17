# Inventario de cierre generado (MOTOR-14)

Generado por `node scripts/closure-inventory.js` desde `src/profiles/groups.js` y las filas reales del perfil efectivo `EM-MOTOR13-20261017+SEM-MOTOR14-20261017`. **Una fila con consumidor no prueba el comportamiento**; los grupos sin filas editables son contenido declarativo (catálogos, fichas) verificado por las pruebas de cada entrega.

Totales: 81 grupos funcionales + 4 soportes; 1100 filas con grupo.

| Familia | Grupos | Filas | Grupos sin filas editables |
|---|---:|---:|---:|
| SEL | 12 | 81 | 1 |
| DEF | 9 | 65 | 1 |
| RES | 13 | 211 | 2 |
| COR | 2 | 8 | 0 |
| ACT | 12 | 194 | 1 |
| ENT | 7 | 232 | 0 |
| MEM | 4 | 143 | 0 |
| CON | 4 | 19 | 2 |
| POB | 3 | 49 | 1 |
| EST | 8 | 23 | 3 |
| REG | 4 | 36 | 0 |
| REF | 2 | 0 | 2 |
| LAB | 1 | 36 | 0 |
| SUP | 4 | 3 | 3 |

| Grupo | Entrega | Filas (consumidas/total) | Mecanismos de lectura | Nota de cierre |
|---|---|---:|---|---|
| SEL01 | MOTOR-04 | 5/5 | coachPlayDistribution; roleBias; throwInPhase |  |
| SEL02 | MOTOR-04 | 4/4 | zoneStyleMult; durationKindFor; mixIntention |  |
| SEL03 | MOTOR-04 | 8/8 | transitionPhase |  |
| SEL04 | MOTOR-04 | 29/29 | midrangeFactor; scoreExits |  |
| SEL05 | MOTOR-04 | 2/2 | libertyAndReading |  |
| SEL06 | MOTOR-04 | 6/8 | libertyAndReading; perceivedFactor |  |
| SEL07 | MOTOR-04 | 11/13 | abilityFit; vocationFactor; assignRoles; roleBias |  |
| SEL08 | MOTOR-04 | 4/4 | estimateValue; acceptance |  |
| SEL09 | MOTOR-04 | 1/1 | mixIntention |  |
| SEL10 | MOTOR-04 | 5/5 | simpleResource; extraPassChain; runPlay |  |
| SEL11 | MOTOR-08 | 2/2 | urgencyFactor |  |
| SEL12 | MOTOR-04 | 0/0 | — |  |
| DEF01 | MOTOR-05 | 16/17 | defScore |  |
| DEF02 | MOTOR-05 | 9/9 | tryHelp; defenseIntent; beginCoverage |  |
| DEF03 | MOTOR-05 | 13/15 | advancePhase; pressedAdvance; categoryWeights |  |
| DEF04 | MOTOR-05 | 12/12 | runPlay; dutyFor; mixedValue; beginCoverage |  |
| DEF05 | MOTOR-05 | 4/4 | tryHelp; runPlay |  |
| DEF06 | MOTOR-05 | 3/5 | resolveEffectiveOrg; validate_defSpecial; tacticalFoul |  |
| DEF07 | MOTOR-05 | 1/1 | defenseIntent |  |
| DEF08 | MOTOR-06 | 0/0 | — |  |
| DEF09 | MOTOR-08 | 2/2 | preparedCoverage |  |
| RES01 | MOTOR-04 | 82/85 | taskValue; shotAbility; shotDefense; resolveShot; eff; longTravelAccess |  |
| RES02 | MOTOR-04 | 5/5 | resolveShot |  |
| RES03 | MOTOR-04 | 18/22 | categoryWeights; resolveShot; afterMiss; shotLogit |  |
| RES04 | MOTOR-04 | 7/7 | categoryWeights |  |
| RES05 | MOTOR-04 | 7/7 | resolveShot; categoryWeights |  |
| RES06 | MOTOR-04 | 1/1 | resolveShot |  |
| RES07 | MOTOR-04 | 0/0 | — |  |
| RES08 | MOTOR-04 | 42/42 | playQuality |  |
| RES09 | MOTOR-04 | 6/7 | resolveTurnover; resolveShot |  |
| RES10 | MOTOR-04 | 18/24 | reboundCommitments; transitionPhase; afterMiss |  |
| RES11 | MOTOR-05 | 0/0 | — |  |
| RES12 | MOTOR-04 | 8/8 | qualityOf; resolveShot |  |
| RES13 | MOTOR-04 | 2/3 | resolveBlocked |  |
| COR01 | MOTOR-05 | 3/3 | reachOf |  |
| COR02 | MOTOR-05 | 3/5 | shotDefense; afterMiss |  |
| ACT01 | cada entrega que añada hechos | 13/13 | sampleDuration; throwInPhase |  |
| ACT02 | MOTOR-07 | 0/0 | — |  |
| ACT03 | cada entrega que añada tareas | 9/9 | consume; enduranceFactor |  |
| ACT04 | cada entrega que añada pausas | 5/5 | consume; beginPeriod; grantTimeouts |  |
| ACT05 | cada entrega que añada tareas | 19/20 | taskValue; resolveShot; categoryWeights; afterMiss; consume; severity |  |
| ACT06 | MOTOR-07 | 10/11 | validateInput; upgradeInput; formPressure |  |
| ACT07 | MOTOR-07 | 5/5 | flushMoment; momentCategory |  |
| ACT08 | MOTOR-07 | 2/2 | consistencySigma |  |
| ACT09 | MOTOR-07 | 12/12 | pressureNow; formPressure; choicePenalty |  |
| ACT10 | MOTOR-07 | 25/43 | teamMomentOf; episode; episodeShot |  |
| ACT11 | MOTOR-07 | 47/65 | formPressure; perturbBinary; momentMix; stateTask; perturbCategories |  |
| ACT12 | MOTOR-07 | 6/9 | pauseMarker |  |
| ENT01 | MOTOR-08 | 4/4 | validateParticipation; defaultParticipationPlan; decideRotation |  |
| ENT02 | MOTOR-08 | 87/97 | relevoReason; substitutionWindow; slotUtility; decideRotation; coachRespond; memoryProposals |  |
| ENT03 | MOTOR-08 | 44/47 | relevoReason; foulBookRow; decideSteal |  |
| ENT04 | MOTOR-08 | 13/13 | runAlarm; timeoutCauses; decideTimeout |  |
| ENT05 | MOTOR-08 | 2/2 | coachMemoryAdjust; coachBuildResponse |  |
| ENT06 | MOTOR-08 | 59/59 | endgameState; decideEndgame |  |
| ENT07 | MOTOR-08 | 4/10 | validate_throwInCall; throwInPhase; validate_coachDelegation; coachVersion |  |
| MEM01 | MOTOR-08 | 25/25 | memKey; observableOpportunity; memUpdate |  |
| MEM02 | MOTOR-08 | 8/10 | memUpdate; memTrim; coachVersion |  |
| MEM03 | MOTOR-08 | 103/103 | memoryProposals; coachMemoryAdjust; coachBuildResponse |  |
| MEM04 | MOTOR-08 | 1/5 | coachRespond |  |
| CON01 | MOTOR-04 | 15/15 | validateInput |  |
| CON02 | MOTOR-05 | 0/0 | — |  |
| CON03 | MOTOR-06 | 0/0 | — |  |
| CON04 | MOTOR-06 | 4/4 | upgradeInput; throwDefense |  |
| POB01 | por asignar (población) | 0/0 | — |  |
| POB02 | por asignar (población) | 45/45 | population/generator.js |  |
| POB03 | por asignar (población) | 4/4 | population/generator.js |  |
| EST01 | MOTOR-09 | 1/1 | formulas (estimaciones convencionales) |  |
| EST02 | MOTOR-09 | 0/0 | — |  |
| EST03 | MOTOR-10 | 1/1 | shooting.production |  |
| EST04 | MOTOR-10 | 4/4 | presence.groupReading; summary.keyCandidates | Estado propio por tramo (energía, Forma, momentos en cada tramo de presencia): NO implementado como consulta histórica propia; solo muestras en fronteras (pendiente declarado). |
| EST05 | MOTOR-10 | 0/0 | — | Asistencia con ruptura causal/desvío: sin productor de la interacción (pendiente declarado); lateralidad desconocida = simplificación aceptada. |
| EST06 | MOTOR-10 | 5/5 | evolution.inAdjustedFinal; filters (antes/después); catalog.runIndicator; evolution.unansweredRuns |  |
| EST07 | MOTOR-10 | 0/0 | — |  |
| EST08 | MOTOR-10 | 12/12 | summary.selectKeys; summary.keyCandidates; recommend.rec01; recommend.rec02 |  |
| REG01 | MOTOR-09 | 16/16 | rules.js; resolveAttempt; step |  |
| REG02 | MOTOR-09 | 6/6 | resolveShot; shootFreeThrows | Tiro en vuelo/interferencia: administrador no generable sin fila numérica (vuelo, frecuencia de interferencia): contenido pendiente declarado. |
| REG03 | MOTOR-09 | 6/7 | timeoutAllowance |  |
| REG04 | MOTOR-09 | 5/7 | availability.js · checkAvailability; regs.terminate; MatchCore.disqualifies; availability.js · checkAvailability → regs.terminate | Inferioridad y terminación (art. 21) implementadas en el flujo natural; técnicas/antideportivas (RG-F07), compensación (RG-C02) y art. 45 (RG-R01) siguen PENDIENTES por falta del texto normativo; flagrante sin generación natural. |
| REF01 | MOTOR-13 | 0/0 | — |  |
| REF02 | MOTOR-13 | 0/0 | — |  |
| LAB01 | MOTOR-12 / MOTOR-13 | 35/36 | createRng; batch/runner.js; audit/index.js |  |
| SUP01 | MOTOR-03 (continuidad en cada entrega) | 0/0 | — |  |
| SUP02 | MOTOR-03 (continuidad en cada entrega) | 0/3 | — |  |
| SUP03 | MOTOR-03 (continuidad en cada entrega) | 0/0 | — |  |
| SUP04 | MOTOR-03 (continuidad en cada entrega) | 0/0 | — |  |
