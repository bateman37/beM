// Candidatas numéricas del generador estadístico (SIM-MOTOR-04B, 04C, 04D y 04E). GENERADO por scripts/sim04c|04d|04e/write-candidate.js desde el selector mecánico; no se edita a mano.
// Una candidata NO es un perfil activo: la base es SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023+SEM-SIM04C-20261024+SEM-SIM04D-20261024; cargarla en el panel de parámetros es una acción explícita y se identifica como provisional o experimental. «Elegida por el selector» no es «calibrada» ni aceptada por Dennis.
export const SIM_CANDIDATES = Object.freeze([
  {
    "id": "C04B-FINAL-PROVISIONAL",
    "version": "CAND-SIM04B-20261023-R1",
    "status": "provisional: el selector mecánico NO encontró ninguna fila adicional admisible con las guardas congeladas; el vector coincide con los cuatro valores de la candidata de 04 (volumen 19,5 · triples 0,70 · entrega final 0,90 · gasto 3) con las filas nuevas de 04B neutrales; pendiente de aceptación deportiva de Dennis",
    "baseProfile": "SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023",
    "baseFingerprint": "24bc933db1b01b33",
    "selectionRules": "SEL-SIM04B-R1",
    "selectionRulesSha256": "15de5306da3976ac516aa1a99fd9a411f80a43ebe4d085e033e9dc4ecf2ba499",
    "evidence": "out/sim-motor04b/07-CAL-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04.md",
    "overrides": [
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7
      },
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3
      }
    ],
    "rows": [
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5,
        "base": 16,
        "unit": "s por control",
        "origin": "SEM-SIM01",
        "effect": "Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo."
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de triple de cada contexto y renormaliza dentro del contexto; con 1, identidad exacta de la mezcla previa."
      },
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9,
        "base": 0.6,
        "unit": "probabilidad",
        "origin": "SEM-SIM01",
        "effect": "Probabilidad base de una entrega final en una finalización que admite pase."
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3,
        "base": 2,
        "unit": "energía 0–100 / factor",
        "origin": "heredada",
        "effect": "Gasto, recuperación y curva de gravedad de fatiga."
      }
    ]
  },
  {
    "id": "C04C-FINAL-PROVISIONAL",
    "version": "CAND-SIM04C-20261024-R1",
    "status": "provisional: elegida por el selector mecánico SEL-SIM04C-R1 solo con CAL (C04C-P30; M 1.449 frente a 2.639 de N04C; no todos los errores entran en banda); pendiente de aceptación deportiva de Dennis",
    "baseProfile": "SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023+SEM-SIM04C-20261024",
    "baseFingerprint": "7e1cb8e87a5c0019",
    "selectionRules": "SEL-SIM04C-R1",
    "selectionRulesSha256": "8be137b9d65ee586996ae85df96ea04d95bbcec091e5a06bcf2c4b435c5290b6",
    "evidence": "out/sim-motor04c/07-CAL-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04c.md",
    "overrides": [
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7
      },
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 0
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 1.5
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.35
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3
      }
    ],
    "rows": [
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5,
        "base": 16,
        "unit": "s por control",
        "origin": "SEM-SIM01",
        "effect": "Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo."
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de triple de cada contexto y renormaliza dentro del contexto; con 1, identidad exacta de la mezcla previa."
      },
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9,
        "base": 0.6,
        "unit": "probabilidad",
        "origin": "SEM-SIM01",
        "effect": "Probabilidad base de una entrega final en una finalización que admite pase."
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3,
        "base": 2,
        "unit": "energía 0–100 / factor",
        "origin": "heredada",
        "effect": "Gasto, recuperación y curva de gravedad de fatiga."
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 0,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04B",
        "effect": "Probabilidad de que una salida con recepción previa acreditada por el catálogo (tabla de elegibilidad de pase final) conserve su ventaja hasta finalizar y admita entrega final; no es un segundo multiplicador del crédito (la entrega usa assist.eligibleFinalPassP0). Con 0, ninguna salida sin pase explícito admite entrega."
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 1.5,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04B",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de aro YA existentes de cada contexto y renormaliza dentro del contexto conservando su masa previa; no crea salidas al aro donde la ficha o el contexto no las admiten. Con 1, identidad exacta."
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04B",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de aro, dentro de la misma formación de calidad y antes de sortearla; no toca el porcentaje base de tiro ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.35,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04C",
        "effect": "Tras un rebote ofensivo válido se decide UNA vez la rama de la continuación: inmediata (la existente, cercana al aro, sin pase ni ficha heredados) o reinicio organizado (nuevo registro terminal del mismo control con celdas organizadas admisibles del plan vigente, con sus participantes y créditos propios). Con 0 no hay sorteo ni cambio; con 1 siempre se intenta el reinicio."
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de la zona inside (también las de transición y espontáneo), antes de sortear la calidad y una sola vez, con objeto de calidad propio (no se muta el compartido con otras zonas). Con 0, identidad exacta."
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona inside, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca p0, recetas, pendientes, tapón ni libres. Con 0, identidad exacta."
      }
    ]
  },
  {
    "id": "C04D-FINAL-PROVISIONAL",
    "version": "CAND-SIM04D-20261024-R1",
    "status": "provisional: el selector mecánico SEL-SIM04D-R1 NO encontró ningún vector admisible con mejora relativa ≥ 5 % de M04D_comparable frente al control: coincide con Z0-A0 (D0_04D, el vector de 04C con los mecanismos nuevos neutrales); pendiente de aceptación deportiva de Dennis",
    "baseProfile": "SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023+SEM-SIM04C-20261024+SEM-SIM04D-20261024",
    "baseFingerprint": "490a3902d9ee5b8a",
    "selectionRules": "SEL-SIM04D-R1",
    "selectionRulesSha256": "e5fa2d6c052a9747acf14fdcdef31de91e65d5491ddbd4b153f576c0d75555a4",
    "evidence": "out/sim-motor04d/11-SELECCION-DEV.json (fuera de Git); resumen en docs/tecnico/sim-motor04d.md",
    "overrides": [
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5
      },
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 1.5
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.35
      },
      {
        "path": "shotMix.midrangeWeightFactor",
        "value": 1
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7
      },
      {
        "path": "conversion.simRimLogitOffset",
        "value": 0
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 0
      },
      {
        "path": "assist.spontaneousPassOddsFactor",
        "value": 1
      },
      {
        "path": "outcomes.simOrdinaryTurnoverWeightFactor",
        "value": 1
      },
      {
        "path": "outcomes.simStealGivenEligibleTurnoverLogit",
        "value": 0
      },
      {
        "path": "outcomes.simShootingFoulWeightFactor",
        "value": 1
      }
    ],
    "rows": [
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5,
        "base": 16,
        "unit": "s por control",
        "origin": "SEM-SIM01",
        "effect": "Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo."
      },
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9,
        "base": 0.6,
        "unit": "probabilidad",
        "origin": "SEM-SIM01",
        "effect": "Probabilidad base de una entrega final en una finalización que admite pase."
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3,
        "base": 2,
        "unit": "energía 0–100 / factor",
        "origin": "heredada",
        "effect": "Gasto, recuperación y curva de gravedad de fatiga."
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04B",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de aro, dentro de la misma formación de calidad y antes de sortearla; no toca el porcentaje base de tiro ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de la zona inside (también las de transición y espontáneo), antes de sortear la calidad y una sola vez, con objeto de calidad propio (no se muta el compartido con otras zonas). Con 0, identidad exacta."
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona inside, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca p0, recetas, pendientes, tapón ni libres. Con 0, identidad exacta."
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 1.5,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04B",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de aro YA existentes de cada contexto y renormaliza dentro del contexto conservando su masa previa; no crea salidas al aro donde la ficha o el contexto no las admiten. Con 1, identidad exacta."
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.35,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04C",
        "effect": "Tras un rebote ofensivo válido se decide UNA vez la rama de la continuación: inmediata (la existente, cercana al aro, sin pase ni ficha heredados) o reinicio organizado (nuevo registro terminal del mismo control con celdas organizadas admisibles del plan vigente, con sus participantes y créditos propios). Con 0 no hay sorteo ni cambio; con 1 siempre se intenta el reinicio."
      },
      {
        "path": "shotMix.midrangeWeightFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de media distancia YA existentes de cada contexto (organizado, transición, espontáneo) y renormaliza dentro del contexto conservando su masa previa; no crea celdas. Con 1, identidad exacta."
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de triple de cada contexto y renormaliza dentro del contexto; con 1, identidad exacta de la mezcla previa."
      },
      {
        "path": "conversion.simRimLogitOffset",
        "value": 0,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04D",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona rim, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca recetas, pendientes, protección defensiva, tapón ni libres, ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 0,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04B",
        "effect": "Probabilidad de que una salida con recepción previa acreditada por el catálogo (tabla de elegibilidad de pase final) conserve su ventaja hasta finalizar y admita entrega final; no es un segundo multiplicador del crédito (la entrega usa assist.eligibleFinalPassP0). Con 0, ninguna salida sin pase explícito admite entrega."
      },
      {
        "path": "assist.spontaneousPassOddsFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo de odds",
        "origin": "SEM-SIM04D",
        "effect": "Odds de entrega elegible en las finalizaciones espontáneas: odds(p') = odds(p) × factor sobre derived.spontaneous.passShare (extremos 0 y 1 intactos); no añade AST directamente: el pasador sigue siendo un compañero real distinto del tirador, sorteado antes del tiro. No se aplica a transición ni a continuación tras rebote. Con 1, identidad exacta."
      },
      {
        "path": "outcomes.simOrdinaryTurnoverWeightFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Multiplica una vez el peso de la pérdida ORDINARIA (sin el peso adicional de la presión adelantada) antes de normalizar los terminales; conserva incidencia de presión, habilidad y estilos. No toca faltas ofensivas ni violaciones. Con 1, identidad exacta."
      },
      {
        "path": "outcomes.simStealGivenEligibleTurnoverLogit",
        "value": 0,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04D",
        "effect": "Se suma una vez al logit del robo condicionado a una pérdida que ya admite ese crédito (pérdida ordinaria o balón suelto con balón vivo); el autor, la causalidad y un crédito por pérdida se conservan. No convierte faltas ofensivas ni violaciones en robo. Con 0, identidad exacta."
      },
      {
        "path": "outcomes.simShootingFoulWeightFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Multiplica una vez el peso de la falta en el tiro antes de normalizar los terminales (la razón de faltas no terminales se recalcula con el mismo total). No toca el porcentaje de libres ni el número reglamentario de libres de la serie. Con 1, identidad exacta."
      }
    ]
  },
  {
    "id": "C04E-FINAL-PROVISIONAL",
    "version": "CAND-SIM04E-20261024-R1",
    "status": "provisional: la búsqueda acotada SRCH-SIM04E-R1 NO encontró ninguna alternativa admisible (guardas frente a S0 y mejora relativa de M ≥ 5 %) sobre el desarrollo conjunto de 72 entradas: coincide con SIM_04E_BASE (S0, el vector de 04C/04D); ninguna alternativa admisible: se conserva S0; pendiente de aceptación deportiva de Dennis",
    "baseProfile": "SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023+SEM-SIM04C-20261024+SEM-SIM04D-20261024",
    "baseFingerprint": "490a3902d9ee5b8a",
    "selectionRules": "SEL-SIM04E-R1",
    "searchRulesSha256": "0c10b02a90d24ee1ec836d6c0b27cb5bb474b0085662bb2b63b601f1cf58710f",
    "searchVectorId": "V-c886b2edcac9",
    "evidence": "out/sim-motor04e/11-BUSQUEDA-Y-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04e.md",
    "aliasOf": "SIM_04E_BASE",
    "overrides": [
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3
      },
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 1.5
      },
      {
        "path": "shotMix.midrangeWeightFactor",
        "value": 1
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.35
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 0
      },
      {
        "path": "assist.spontaneousPassOddsFactor",
        "value": 1
      },
      {
        "path": "outcomes.simOrdinaryTurnoverWeightFactor",
        "value": 1
      },
      {
        "path": "outcomes.simStealGivenEligibleTurnoverLogit",
        "value": 0
      },
      {
        "path": "outcomes.simShootingFoulWeightFactor",
        "value": 1
      },
      {
        "path": "conversion.simRimLogitOffset",
        "value": 0
      },
      {
        "path": "shots.three.p0",
        "value": 0.35
      },
      {
        "path": "shots.midrange.p0",
        "value": 0.39
      },
      {
        "path": "shots.rim.blockP0",
        "value": 0.06
      },
      {
        "path": "shots.inside.blockP0",
        "value": 0.05
      },
      {
        "path": "shots.midrange.blockP0",
        "value": 0.015
      },
      {
        "path": "shots.three.blockP0",
        "value": 0.008
      }
    ],
    "rows": [
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9,
        "base": 0.6,
        "unit": "probabilidad",
        "origin": "SEM-SIM01",
        "effect": "Probabilidad base de una entrega final en una finalización que admite pase."
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3,
        "base": 2,
        "unit": "energía 0–100 / factor",
        "origin": "heredada",
        "effect": "Gasto, recuperación y curva de gravedad de fatiga."
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04B",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de aro, dentro de la misma formación de calidad y antes de sortearla; no toca el porcentaje base de tiro ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de la zona inside (también las de transición y espontáneo), antes de sortear la calidad y una sola vez, con objeto de calidad propio (no se muta el compartido con otras zonas). Con 0, identidad exacta."
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona inside, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca p0, recetas, pendientes, tapón ni libres. Con 0, identidad exacta."
      },
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 19.5,
        "base": 16,
        "unit": "s por control",
        "origin": "SEM-SIM01",
        "effect": "Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo."
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 1.5,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04B",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de aro YA existentes de cada contexto y renormaliza dentro del contexto conservando su masa previa; no crea salidas al aro donde la ficha o el contexto no las admiten. Con 1, identidad exacta."
      },
      {
        "path": "shotMix.midrangeWeightFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de media distancia YA existentes de cada contexto (organizado, transición, espontáneo) y renormaliza dentro del contexto conservando su masa previa; no crea celdas. Con 1, identidad exacta."
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.7,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de triple de cada contexto y renormaliza dentro del contexto; con 1, identidad exacta de la mezcla previa."
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.35,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04C",
        "effect": "Tras un rebote ofensivo válido se decide UNA vez la rama de la continuación: inmediata (la existente, cercana al aro, sin pase ni ficha heredados) o reinicio organizado (nuevo registro terminal del mismo control con celdas organizadas admisibles del plan vigente, con sus participantes y créditos propios). Con 0 no hay sorteo ni cambio; con 1 siempre se intenta el reinicio."
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 0,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04B",
        "effect": "Probabilidad de que una salida con recepción previa acreditada por el catálogo (tabla de elegibilidad de pase final) conserve su ventaja hasta finalizar y admita entrega final; no es un segundo multiplicador del crédito (la entrega usa assist.eligibleFinalPassP0). Con 0, ninguna salida sin pase explícito admite entrega."
      },
      {
        "path": "assist.spontaneousPassOddsFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo de odds",
        "origin": "SEM-SIM04D",
        "effect": "Odds de entrega elegible en las finalizaciones espontáneas: odds(p') = odds(p) × factor sobre derived.spontaneous.passShare (extremos 0 y 1 intactos); no añade AST directamente: el pasador sigue siendo un compañero real distinto del tirador, sorteado antes del tiro. No se aplica a transición ni a continuación tras rebote. Con 1, identidad exacta."
      },
      {
        "path": "outcomes.simOrdinaryTurnoverWeightFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Multiplica una vez el peso de la pérdida ORDINARIA (sin el peso adicional de la presión adelantada) antes de normalizar los terminales; conserva incidencia de presión, habilidad y estilos. No toca faltas ofensivas ni violaciones. Con 1, identidad exacta."
      },
      {
        "path": "outcomes.simStealGivenEligibleTurnoverLogit",
        "value": 0,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04D",
        "effect": "Se suma una vez al logit del robo condicionado a una pérdida que ya admite ese crédito (pérdida ordinaria o balón suelto con balón vivo); el autor, la causalidad y un crédito por pérdida se conservan. No convierte faltas ofensivas ni violaciones en robo. Con 0, identidad exacta."
      },
      {
        "path": "outcomes.simShootingFoulWeightFactor",
        "value": 1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Multiplica una vez el peso de la falta en el tiro antes de normalizar los terminales (la razón de faltas no terminales se recalcula con el mismo total). No toca el porcentaje de libres ni el número reglamentario de libres de la serie. Con 1, identidad exacta."
      },
      {
        "path": "conversion.simRimLogitOffset",
        "value": 0,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04D",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona rim, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca recetas, pendientes, protección defensiva, tapón ni libres, ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "shots.three.p0",
        "value": 0.35,
        "base": 0.35,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.midrange.p0",
        "value": 0.39,
        "base": 0.39,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.rim.blockP0",
        "value": 0.06,
        "base": 0.06,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.inside.blockP0",
        "value": 0.05,
        "base": 0.05,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.midrange.blockP0",
        "value": 0.015,
        "base": 0.015,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.three.blockP0",
        "value": 0.008,
        "base": 0.008,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      }
    ]
  },
  {
    "id": "C04E-EXPERIMENTAL",
    "version": "CAND-SIM04E-20261024-R1",
    "status": "EXPERIMENTAL, no recomendada: mejor perfil de desarrollo que no coincide con la base ni con la candidata (M 1.520 frente a 5.009 de S0), pero incumple guardas frente a S0 (guardas: fg3m,oreb,inside_share); nunca se activa ni se presenta como aceptada",
    "baseProfile": "SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023+SEM-SIM04C-20261024+SEM-SIM04D-20261024",
    "baseFingerprint": "490a3902d9ee5b8a",
    "selectionRules": "SEL-SIM04E-R1",
    "searchRulesSha256": "0c10b02a90d24ee1ec836d6c0b27cb5bb474b0085662bb2b63b601f1cf58710f",
    "searchVectorId": "V-ea7c466d124d",
    "evidence": "out/sim-motor04e/11-BUSQUEDA-Y-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04e.md",
    "experimental": true,
    "overrides": [
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3
      },
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 20
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 2.16350114
      },
      {
        "path": "shotMix.midrangeWeightFactor",
        "value": 0.695747032
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.502677436
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.7
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 1
      },
      {
        "path": "assist.spontaneousPassOddsFactor",
        "value": 2
      },
      {
        "path": "outcomes.simOrdinaryTurnoverWeightFactor",
        "value": 0.8
      },
      {
        "path": "outcomes.simStealGivenEligibleTurnoverLogit",
        "value": 0.7
      },
      {
        "path": "outcomes.simShootingFoulWeightFactor",
        "value": 1.1
      },
      {
        "path": "conversion.simRimLogitOffset",
        "value": 0.15
      },
      {
        "path": "shots.three.p0",
        "value": 0.35
      },
      {
        "path": "shots.midrange.p0",
        "value": 0.4
      },
      {
        "path": "shots.rim.blockP0",
        "value": 0.06
      },
      {
        "path": "shots.inside.blockP0",
        "value": 0.05
      },
      {
        "path": "shots.midrange.blockP0",
        "value": 0.015
      },
      {
        "path": "shots.three.blockP0",
        "value": 0.008
      }
    ],
    "rows": [
      {
        "path": "assist.eligibleFinalPassP0",
        "value": 0.9,
        "base": 0.6,
        "unit": "probabilidad",
        "origin": "SEM-SIM01",
        "effect": "Probabilidad base de una entrega final en una finalización que admite pase."
      },
      {
        "path": "energy.costPerLiveMinute",
        "value": 3,
        "base": 2,
        "unit": "energía 0–100 / factor",
        "origin": "heredada",
        "effect": "Gasto, recuperación y curva de gravedad de fatiga."
      },
      {
        "path": "opportunity.simRimQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04B",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de aro, dentro de la misma formación de calidad y antes de sortearla; no toca el porcentaje base de tiro ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "opportunity.simInsideQualityLogit",
        "value": 0.5,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Desplaza el logit de calidad de la oportunidad (cómoda frente a forzada) SOLO en las celdas de la zona inside (también las de transición y espontáneo), antes de sortear la calidad y una sola vez, con objeto de calidad propio (no se muta el compartido con otras zonas). Con 0, identidad exacta."
      },
      {
        "path": "conversion.simInsideLogitOffset",
        "value": 0.3,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04C",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona inside, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca p0, recetas, pendientes, tapón ni libres. Con 0, identidad exacta."
      },
      {
        "path": "volume.neutralSecondsPerControl",
        "value": 20,
        "base": 16,
        "unit": "s por control",
        "origin": "SEM-SIM01",
        "effect": "Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo."
      },
      {
        "path": "shotMix.rimWeightFactor",
        "value": 2.16350114,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04B",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de aro YA existentes de cada contexto y renormaliza dentro del contexto conservando su masa previa; no crea salidas al aro donde la ficha o el contexto no las admiten. Con 1, identidad exacta."
      },
      {
        "path": "shotMix.midrangeWeightFactor",
        "value": 0.695747032,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de media distancia YA existentes de cada contexto (organizado, transición, espontáneo) y renormaliza dentro del contexto conservando su masa previa; no crea celdas. Con 1, identidad exacta."
      },
      {
        "path": "shotMix.threeWeightFactor",
        "value": 0.502677436,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04",
        "effect": "Mezcla de zonas (no de acierto): multiplica una vez el peso de las celdas de triple de cada contexto y renormaliza dentro del contexto; con 1, identidad exacta de la mezcla previa."
      },
      {
        "path": "rebound.organizedResetP0",
        "value": 0.7,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04C",
        "effect": "Tras un rebote ofensivo válido se decide UNA vez la rama de la continuación: inmediata (la existente, cercana al aro, sin pase ni ficha heredados) o reinicio organizado (nuevo registro terminal del mismo control con celdas organizadas admisibles del plan vigente, con sus participantes y créditos propios). Con 0 no hay sorteo ni cambio; con 1 siempre se intenta el reinicio."
      },
      {
        "path": "assist.receivedAdvantageP0",
        "value": 1,
        "base": 0,
        "unit": "probabilidad",
        "origin": "SEM-SIM04B",
        "effect": "Probabilidad de que una salida con recepción previa acreditada por el catálogo (tabla de elegibilidad de pase final) conserve su ventaja hasta finalizar y admita entrega final; no es un segundo multiplicador del crédito (la entrega usa assist.eligibleFinalPassP0). Con 0, ninguna salida sin pase explícito admite entrega."
      },
      {
        "path": "assist.spontaneousPassOddsFactor",
        "value": 2,
        "base": 1,
        "unit": "factor multiplicativo de odds",
        "origin": "SEM-SIM04D",
        "effect": "Odds de entrega elegible en las finalizaciones espontáneas: odds(p') = odds(p) × factor sobre derived.spontaneous.passShare (extremos 0 y 1 intactos); no añade AST directamente: el pasador sigue siendo un compañero real distinto del tirador, sorteado antes del tiro. No se aplica a transición ni a continuación tras rebote. Con 1, identidad exacta."
      },
      {
        "path": "outcomes.simOrdinaryTurnoverWeightFactor",
        "value": 0.8,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Multiplica una vez el peso de la pérdida ORDINARIA (sin el peso adicional de la presión adelantada) antes de normalizar los terminales; conserva incidencia de presión, habilidad y estilos. No toca faltas ofensivas ni violaciones. Con 1, identidad exacta."
      },
      {
        "path": "outcomes.simStealGivenEligibleTurnoverLogit",
        "value": 0.7,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04D",
        "effect": "Se suma una vez al logit del robo condicionado a una pérdida que ya admite ese crédito (pérdida ordinaria o balón suelto con balón vivo); el autor, la causalidad y un crédito por pérdida se conservan. No convierte faltas ofensivas ni violaciones en robo. Con 0, identidad exacta."
      },
      {
        "path": "outcomes.simShootingFoulWeightFactor",
        "value": 1.1,
        "base": 1,
        "unit": "factor multiplicativo",
        "origin": "SEM-SIM04D",
        "effect": "Multiplica una vez el peso de la falta en el tiro antes de normalizar los terminales (la razón de faltas no terminales se recalcula con el mismo total). No toca el porcentaje de libres ni el número reglamentario de libres de la serie. Con 1, identidad exacta."
      },
      {
        "path": "conversion.simRimLogitOffset",
        "value": 0.15,
        "base": 0,
        "unit": "logit",
        "origin": "SEM-SIM04D",
        "effect": "Coeficiente PROVISIONAL de traducción agregada SIM (no regla deportiva): se suma una vez al logit del tiro de la zona rim, antes de la logística y de la perturbación de momento, y en la estimación de acierto de la decisión de finalización. No toca recetas, pendientes, protección defensiva, tapón ni libres, ni las demás zonas. Con 0, identidad exacta."
      },
      {
        "path": "shots.three.p0",
        "value": 0.35,
        "base": 0.35,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.midrange.p0",
        "value": 0.4,
        "base": 0.39,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.rim.blockP0",
        "value": 0.06,
        "base": 0.06,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.inside.blockP0",
        "value": 0.05,
        "base": 0.05,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.midrange.blockP0",
        "value": 0.015,
        "base": 0.015,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      },
      {
        "path": "shots.three.blockP0",
        "value": 0.008,
        "base": 0.008,
        "unit": "probabilidad / logit / puntos",
        "origin": "heredada",
        "effect": "Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base)."
      }
    ]
  }
].map((c) => Object.freeze({ ...c, overrides: Object.freeze(c.overrides.map((o) => Object.freeze(o))), rows: Object.freeze(c.rows.map((r) => Object.freeze(r))) })));
export const candidateById = (id) => SIM_CANDIDATES.find((c) => c.id === id) ?? null;
