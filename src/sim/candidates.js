// Candidatas numéricas del generador estadístico (SIM-MOTOR-04B y 04C). GENERADO por scripts/sim04c/write-candidate.js desde el selector mecánico; no se edita a mano.
// Una candidata NO es un perfil activo: la base es SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023+SEM-SIM04C-20261024; cargarla en el panel de parámetros es una acción explícita y se identifica como provisional. «Elegida por el selector» no es «calibrada» ni aceptada por Dennis.
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
  }
].map((c) => Object.freeze({ ...c, overrides: Object.freeze(c.overrides.map((o) => Object.freeze(o))), rows: Object.freeze(c.rows.map((r) => Object.freeze(r))) })));
export const candidateById = (id) => SIM_CANDIDATES.find((c) => c.id === id) ?? null;
