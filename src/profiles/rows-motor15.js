// Filas del diccionario para SEM-MOTOR15 (§7–§8): margen liberación→resolución del tiro de campo (SEM15-TIR-01), masas de interferencia por oportunidad elegible (SEM15-INT-01…04)
// y límites de descalificación del entrenador. Mismo contrato que rows.js. Las semillas son SEM, provisionales y sin calibrar; no proceden de frecuencias FIBA/ACB.
const EXT = 'SEM-MOTOR15';
const S = { cls: 'balance', ext: EXT };
const NOTE = 'SEM15 (encargo MOTOR-15 §8): decisión de arranque provisional, editable y versionada. No se compensa modificando otras tasas.';

export const MOTOR15_FAMILIES = [
  { ...S, views: ['tiempo', 'tiro', 'reglamento'], path: 'shotFlight.pendingLagSeconds', type: 'seconds', unit: 's', grp: 'REG02', mech: 'actions.js · resolveShot (liberación y resolución)',
    label: () => 'Tiro de campo · margen abstracto entre liberación y resolución (SEM15-TIR-01)', desc: () => 'Segundos de margen entre la liberación del tiro y su resolución, DENTRO de la duración ya existente de la operación de tiro: lag = min(margen, duración) y liberación en inicio + duración − lag. Convención temporal SEM, no física del balón (precarga 0,35 s).',
    effect: () => 'No añade tiempo ni un sorteo de duración ni de acierto. Solo importa si la señal de final de periodo cae entre liberación y resolución: el tiro liberado antes cuenta y se resuelve con el reloj a 0. ' + NOTE },
  ...[['fieldGoal.defensiveP', 'SEM15-INT-01', 'defensiva', 'tiro de campo', 'tiro'], ['fieldGoal.offensiveP', 'SEM15-INT-02', 'ofensiva', 'tiro de campo', 'tiro'], ['lastFreeThrow.defensiveP', 'SEM15-INT-03', 'defensiva', 'último libre', 'libre'], ['lastFreeThrow.offensiveP', 'SEM15-INT-04', 'ofensiva', 'último libre', 'libre']]
    .map(([p, sem, side, where]) => ({ ...S, views: ['reglamento', 'tiro'], path: `interference.${p}`, type: 'probability', unit: 'probabilidad por oportunidad elegible', grp: 'REG02', mech: 'incidents.js · interferenceOpportunity',
      label: () => `Interferencia ${side} · ${where} (${sem})`, desc: () => `Probabilidad de interferencia ${side} por OPORTUNIDAD ELEGIBLE de ${where} (no por tiro ni por partido). Resultados excluyentes por oportunidad: ninguna, ofensiva o defensiva; la masa residual es 1 − suma y no se redistribuye si un lado no es elegible.`,
      effect: () => `Con valor 0 desaparece esa incidencia en su situación. La consecuencia (validez, crédito, reanudación) sale de la matriz RG-I01…I04, no de este valor. ${NOTE}` })),
  ...[['cLimit', 'técnicas C'], ['totalLimit', 'técnicas C + B']].map(([k, what]) => ({ cls: 'reglamento', views: ['reglamento'], ext: EXT, path: `regulation.coachDisqualification.${k}`, type: 'count', unit: 'técnicas', grp: 'REG04', mech: 'incidents.js · coachDisqualified', locked: true,
    label: () => `Entrenador · descalificación por ${what}`, desc: () => `Límite de ${what} que descalifica al entrenador (N15-03, lectura selectiva de ChatGPT).`, effect: () => 'Obligación reglamentaria: se modifica como un conjunto coherente del perfil reglamentario, no como un coeficiente de juego.' })),
];
// Contenido normativo declarativo: política de técnica, alias, compensación, correcciones, descalificación (contraste/nota) e identidad de las semillas.
export const MOTOR15_EXEMPT = [
  /^shotFlight\.(version|ids\.|provenance)/, /^interference\.(version|ids\.|provenance|fieldGoal\.zones)/,
  /^regulation\.(technical|aliases|compensation|corrections)\./, /^regulation\.coachDisqualification\.(counters|contrast|note)/,
];
