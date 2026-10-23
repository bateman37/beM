// Matriz de las 32 capacidades (SIM-MOTOR-01 §6.1). Cada fila declara receta/variable consumidora, efecto, participantes, frecuencia de recálculo y ruta de parámetros; el contraste fijo +1/+3/+5
// se ejecuta sobre las magnitudes puras del tramo (contexto idéntico, sin azar) y registra qué magnitudes cambian. El tope 30 se declara cuando se alcanza.
import { probeVector, bumpAbilities, diffVectors } from './probe.js';

const SHOOT = 'Recetas de tiro del perfil: shots.<zona>.attack (sensibilidad sA) con energía a tarea técnica/física por defecto';
const ROW = (id, name, consumers, effect, participants, params, expect) => ({ id, name, consumers, effect, participants, recalc: 'cada tramo (energía) y al cambiar el quinteto', params, expect });
export const CAPABILITIES = [
  ROW('TEC01', 'Triple', SHOOT, 'Conversión del triple y peso como finalizador en tiros de tres', 'tirador', ['shots.three.attack', 'shots.three.sA'], /pMake\.three/),
  ROW('TEC02', 'Tiro de media distancia', SHOOT, 'Conversión de media distancia; adecuación a la política «buscar»', 'tirador', ['shots.midrange.attack', 'selection.midrangePolicy'], /pMake\.midrange/),
  ROW('TEC03', 'Tiro interior', SHOOT, 'Conversión interior y resistencia al tapón', 'tirador', ['shots.inside.attack', 'block.resistanceTechniqueWeight'], /pMake\.inside/),
  ROW('TEC04', 'Finalización en movimiento', SHOOT, 'Conversión al aro / penetración', 'tirador', ['shots.rim.attack'], /pMake\.rim/),
  ROW('TEC05', 'Tiro libre', 'shots.freeThrow.attack', 'Conversión de libres', 'lanzador de la serie', ['shots.freeThrow.attack', 'shots.freeThrow.sA'], /pFT/),
  ROW('TEC06', 'Tiro en movimiento', 'tasks.TAR11 (receta de preparación) → shotPreparation', 'Coste logit de los tiros con preparación en movimiento (distinto de la recepción estática)', 'tirador', ['shotPreparation.movementMaximumLogitCost'], /pMake\.movedThree/),
  ROW('TEC07', 'Manejo de balón', 'tasks.TAR06/TAR02 (manejador)', 'Control del balón: pérdidas, riesgo de las salidas de bote y calidad de la penetración', 'manejador', ['tasks.TAR06', 'outcomes.controlSensitivity'], /term\.to|OffC/),
  ROW('TEC08', 'Pase', 'tasks.TAR07 + assist.passAbilityLogitSlope', 'Entrega final (probabilidad de pase previo) y riesgo de las salidas de pase', 'pasador', ['assist.passAbilityLogitSlope', 'tasks.TAR07'], /assist\.p|mix\./),
  ROW('TEC09', 'Bloqueos', 'tasks.TAR04 / qualityAttack de las fichas con bloqueo', 'Calidad de las fichas que usan bloqueo', 'bloqueador', ['tasks.TAR04', 'opportunity.advantageSensitivity'], /quality|mix\./),
  ROW('TEC10', 'Movimiento sin balón', 'tasks.TAR03 / qualityAttack de fichas con receptor', 'Calidad de recepción, cortes e indirectos', 'receptor/cortador', ['tasks.TAR03'], /quality|mix\./),
  ROW('TEC11', 'Juego de poste', 'qualityAttack de las fichas de poste (TAR05)', 'Calidad y producción de la familia de poste', 'jugador de poste', ['tasks.TAR05'], /quality|mix\./),
  ROW('TEC12', 'Defensa perimetral', 'shots.three/midrange.defense, defense.assignment.perimeterFit, tasks.TAR06/TAR02 (primario)', 'Oposición exterior, control del rival y legalidad del contacto', 'defensores perimetrales', ['shots.three.sD', 'defense.assignment.perimeterFit', 'contact.defensiveLegality'], /pMake\.(three|midrange)|term\./),
  ROW('TEC13', 'Defensa interior', 'shots.inside/rim.defense, defense.assignment.interiorFit', 'Oposición interior y protección del aro', 'defensores interiores', ['shots.rim.sD', 'defense.assignment.interiorFit'], /pMake\.(rim|inside)/),
  ROW('TEC14', 'Robo', 'tasks.TAR07 (interceptor) / TAR06 defensa', 'Probabilidad y reparto del robo dentro de las pérdidas elegibles', 'interceptor', ['tasks.TAR07', 'outcomes.stealGivenTurnover'], /pSteal|term\.to/),
  ROW('TEC15', 'Tapón', 'block.attack', 'Probabilidad y crédito de tapón de un intento elegible', 'taponador', ['block.attack', 'block.sA'], /pBlock/),
  ROW('TEC16', 'Defensa de bloqueos', 'qualityDefense de fichas con bloqueo; defense.assignment.screenPursuitFit', 'Oposición en familias de bloqueo (no es un bonus defensivo universal)', 'defensor del bloqueo', ['defense.assignment.screenPursuitFit'], /quality|mix\.|pMake/),
  ROW('TEC17', 'Cierre de rebote', 'rebound.strength (peso 0,30)', 'Acceso/oposición en el reparto de oportunidades de rebote', 'participantes de rebote', ['rebound.strength', 'rebound.sensitivity'], /pOrb/),
  ROW('TEC18', 'Captura de rebote', 'rebound.strength (0,35) y rebound.captor (0,60)', 'Captura y crédito individual de rebote', 'participantes de rebote', ['rebound.captor', 'rebound.strength'], /pOrb/),
  ROW('FIS01', 'Velocidad', 'selection.direct.defenderArrival.FIS01', 'Llegada defensiva en transición (calidad de la transición)', 'defensores', ['selection.direct.defenderArrival'], /quality/),
  ROW('FIS02', 'Aceleración', 'tasks.TAR02/TAR06 + defenderArrival.FIS02 + TAR17', 'Penetración, desmarque y transición; disputa de balones sueltos', 'manejador/defensores', ['tasks.TAR02', 'selection.direct.defenderArrival'], /./),
  ROW('FIS03', 'Agilidad', 'tasks.TAR02/TAR03/TAR06 + perimeterFit', 'Manejo, oposición y cambios pertinentes', 'manejador/defensores', ['tasks.TAR02'], /./),
  ROW('FIS04', 'Fuerza', 'shots.inside.defense, tasks.TAR05, rebound.strength, contact.offensiveLegality', 'Poste, bloqueo, interior y rebote', 'interiores', ['rebound.strength', 'contact.offensiveLegality'], /./),
  ROW('FIS05', 'Salto', 'shots.rim.attack (0,05), block.attack, rebound.strength/captor', 'Finalización, tapón y rebote', 'interiores', ['block.attack', 'rebound.strength'], /./),
  ROW('FIS06', 'Resistencia', 'energy.enduranceSlope y enduranceFactorBounds', 'Gasto de energía por minuto vivo y conservación del rendimiento', 'todos en pista', ['energy.enduranceSlope', 'energy.baseEnduranceReference'], /energy\.cost/),
  ROW('FIS07', 'Equilibrio', 'shots.*.attack (FIS07), tasks.TAR06, shotPreparation (TAR11), contact.offensiveLegality', 'Recetas técnicas de tiro, control y contacto', 'tirador/manejador', ['shots.three.attack', 'contact.offensiveLegality'], /./),
  ROW('MEN01', 'Comprensión táctica', 'qualityAttack de las fichas (director, receptor)', 'Ejecución/coordinación de la familia y adecuación al plan', 'director y participantes', ['opportunity.advantageSensitivity'], /quality|mix\./),
  ROW('MEN02', 'Visión de juego', 'selection.readingMix.MEN02 + assist (pase/lectura)', 'Lectura del director (mezcla libro/oportunidad) y distribución de ventajas', 'quinteto', ['selection.readingMix', 'assist.passAbilityLogitSlope'], /reading\.q|assist\.p/),
  ROW('MEN03', 'Decisiones', 'selection.readingMix.MEN03', 'Mezcla entre libro y oportunidades, riesgo y elección de producción', 'quinteto', ['selection.readingMix'], /reading\.q/),
  ROW('MEN04', 'Anticipación', 'tasks.TAR03/TAR06/TAR07 (defensa), block.attack, rebound.strength/captor, contact.defensiveLegality', 'Lectura defensiva, robo, acceso y rebote', 'defensores', ['tasks.TAR07', 'rebound.captor'], /./),
  ROW('MEN05', 'Concentración', 'tasks.TAR07/TAR06 (ataque), shots.freeThrow, contact.defensiveLegality', 'Control y recetas técnicas que la requieren', 'manejador/pasador/lanzador', ['tasks.TAR07'], /./),
  ROW('MEN06', 'Consistencia', 'moment.innovationSigmaLowConsistency/HighConsistency', 'Amplitud de la variación del momento (sin peor media por construcción)', 'todos', ['moment.innovationSigmaLowConsistency', 'moment.innovationSigmaHighConsistency'], /moment\.sigma/),
  ROW('MEN07', 'Rendimiento bajo presión', 'pressure.taskMaxLogitLoss (× P × (1 − a(MEN07)))', 'Respuesta contextual a importancia/final ajustado', 'todos', ['pressure.taskMaxLogitLoss', 'pressure.importance'], /pressure\.lossShot|term\.|pMake/),
];

export function capabilityContrast(ctx, input, deltas = [1, 3, 5]) {
  const starters = Object.values(input.teams[0].plan.starters); const base = probeVector(ctx, input, { importance: 'important' }).vector; const out = [];
  for (const cap of CAPABILITIES) {
    const per = deltas.map((d) => {
      const bumped = bumpAbilities(input, starters, [cap.id], d); const capped = input.teams[0].players.filter((p) => starters.includes(p.id)).filter((p) => p.abilities[cap.id] + d > 30).length;
      const diff = diffVectors(base, probeVector(ctx, bumped, { importance: 'important' }).vector);
      const hit = diff.filter((x) => cap.expect.test(x.key));
      return { delta: d, capped, changedKeys: diff.length, expectedKeys: hit.length, examples: (hit.length ? hit : diff).slice(0, 3).map((x) => ({ key: x.key, base: x.base, after: x.after })) };
    });
    out.push({ ...cap, expect: String(cap.expect), contrast: per, used: per.every((p) => p.changedKeys > 0), asExpected: per.every((p) => p.expectedKeys > 0) });
  }
  return out;
}
