// Candidatas numéricas del generador estadístico (SIM-MOTOR-04B). GENERADO por scripts/sim04b/write-candidate.js desde el selector mecánico (SEL-SIM04B-R1); no se edita a mano.
// Una candidata NO es un perfil activo: la base sigue siendo SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023; cargarla en el panel de parámetros es una acción explícita y se identifica como provisional. «Elegida por el selector» no es «calibrada» ni aceptada por Dennis.
export const SIM_CANDIDATES = Object.freeze([{
  id: 'C04B-FINAL-PROVISIONAL', version: 'CAND-SIM04B-20261023-R1', status: "provisional: el selector mecánico NO encontró ninguna fila adicional admisible con las guardas congeladas; el vector coincide con los cuatro valores de la candidata de 04 (volumen 19,5 · triples 0,70 · entrega final 0,90 · gasto 3) con las filas nuevas de 04B neutrales; pendiente de aceptación deportiva de Dennis",
  baseProfile: "SEM-SIM01-20261022+SEM-SIM02-20261022+SEM-SIM04-20261023+SEM-SIM04B-20261023", baseFingerprint: "24bc933db1b01b33", selectionRules: "SEL-SIM04B-R1", selectionRulesSha256: "15de5306da3976ac516aa1a99fd9a411f80a43ebe4d085e033e9dc4ecf2ba499", evidence: 'out/sim-motor04b/07-CAL-SELECCION.json (fuera de Git); resumen en docs/tecnico/sim-motor04.md',
  overrides: Object.freeze([{"path":"volume.neutralSecondsPerControl","value":19.5},{"path":"shotMix.threeWeightFactor","value":0.7},{"path":"assist.eligibleFinalPassP0","value":0.9},{"path":"energy.costPerLiveMinute","value":3}]),
  rows: Object.freeze([
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
  ]),
}]);
export const candidateById = (id) => SIM_CANDIDATES.find((c) => c.id === id) ?? null;
