// Definición de los siete estilos ofensivos, la instrucción de media distancia y las disposiciones para la interfaz (MOTOR-04).
// Solo presentación: los valores salen de las filas del perfil activo, no se duplican aquí.
const f2 = (v) => String(v).replace('.', ',');

export const STYLE_DEFS = [
  { key: 'organizedPace', title: 'Ritmo del ataque organizado', group: 'Tempo', names: ['Muy lento', 'Lento', 'Equilibrado', 'Rápido', 'Muy rápido'],
    effect: (s, i) => `duración del juego organizado ×${f2(s.organizedDurationFactor[i])} (no acelera libres ni capacidades físicas)`,
    help: 'Cuánto dura organizar e iniciar el ataque. Es independiente de la elaboración: se puede circular rápido con varias acciones o preparar lento una primera opción sencilla.' },
  { key: 'transition', title: 'Transición', group: 'Tempo', names: ['Muy conservadora', 'Conservadora', 'Equilibrado', 'Agresiva', 'Muy agresiva'],
    effect: (s, i) => `odds de intentar correr ×${f2(s.transitionAttemptOddsRatio[i])}`,
    help: 'Propensión a intentar correr cuando el origen (robo o rebote defensivo) y la ventaja ya lo permiten. No crea robos ni superioridades.' },
  { key: 'elaboration', title: 'Elaboración', group: 'Juego', names: ['Pocas acciones', 'Directo', 'Equilibrado', 'Elaborado', 'Muchas acciones'],
    effect: (s, i) => `peso de continuar ×${f2(s.elaborationContinuationWeightFactor[i])} frente a aceptar la finalización`,
    help: 'Preferencia por continuar, invertir o buscar otra opción frente a aceptar la disponible. Continuar consume tiempo y exige ejecución; no hay un número fijo de pases.' },
  { key: 'finishPreference', title: 'Prioridad de finalización', group: 'Juego', names: ['Interior', 'Preferencia interior', 'Equilibrado', 'Preferencia exterior', 'Exterior'],
    effect: (s, i) => `triple ×${f2(s.orientationThree[i])} · interior ×${f2(s.orientationInside[i])}`,
    help: 'Preferencia entre opciones interiores y exteriores realmente disponibles. No son cuotas ni prohibiciones: una entrada al poste puede acabar en triple tras una ayuda.' },
  { key: 'freedom', title: 'Libertad', group: 'Decisión', names: ['Muy rígido', 'Pautado', 'Equilibrado', 'Flexible', 'Mucha libertad'],
    effect: (s, i) => `libertad máxima F=${f2(s.freedom[i])}`,
    help: 'Mezcla entre plan y autonomía dentro de las opciones elegibles. La Iniciativa no equivale a buena lectura ni añade acierto.' },
  { key: 'offensiveRisk', title: 'Riesgo ofensivo', group: 'Decisión', names: ['Poco riesgo', 'Prudente', 'Equilibrado', 'Arriesgado', 'Mucho riesgo'],
    effect: (s, i) => `preferencia por el riesgo estimado: exp(${f2(s.offensiveRiskPreferenceTilt[i])}·r)`,
    help: 'Preferencia por opciones con distinto riesgo estimado. El coste lo produce la exposición y dificultad de la opción elegida, sin otra penalización universal.' },
  { key: 'afterShot', title: 'Después del tiro', group: 'Rebote y balance', names: ['Balance total', 'Priorizar balance', 'Equilibrado', 'Priorizar rebote', 'Carga total'],
    effect: (_s, i, p) => `objetivo de ${p.rebound.offensiveReboundAssignmentTarget[i]} jugador(es) cargando al rebote`,
    help: 'Encargos de carga al rebote y balance. Más participantes disputando = peor protección del retorno; no hay un bonus de captura gratuito.' },
];
export const STYLE_BY_KEY = Object.fromEntries(STYLE_DEFS.map((d) => [d.key, d]));
export const STYLE_GROUPS = ['Tempo', 'Juego', 'Decisión', 'Rebote y balance'];

export const MIDRANGE_OPTIONS = [
  ['avoid', 'Evitar', 'Las opciones de media distancia pesan poco al elegir (no se prohíben: si es la única viable por reloj, se toma).'],
  ['openOnly', 'Aceptar si está liberada', 'Pesan plenamente si la calidad previa es cómoda y menos en los demás casos.'],
  ['seek', 'Buscar con jugadores adecuados', 'Pesan más cuanto mejor es el Tiro de media distancia del ejecutor; sin umbral que prohíba un tiro.'],
];
export const MIDRANGE_LABEL = Object.fromEntries(MIDRANGE_OPTIONS.map(([k, t]) => [k, t]));
export const FAMILY_NAMES = { pick_and_roll: 'Bloqueo directo', handoff: 'Mano a mano', off_ball_screen: 'Bloqueo indirecto', give_and_go: 'Pase y corte', post: 'Poste', isolation: 'Aclarado' };
export const FAMILY_ORDER = ['pick_and_roll', 'handoff', 'off_ball_screen', 'give_and_go', 'post', 'isolation'];
export const STATUS_TEXT = {
  natural: ['ok', 'entrada natural'], realizable: ['', 'realizable (no es su entrada natural)'], reorganiza: ['warn', 'tras reorganizar'], contexto: ['', 'requiere una negación en la posesión'], no: ['bad', 'no realizable'],
};

export function styleLevelLabels(profile) {
  const out = {};
  for (const d of STYLE_DEFS) out[d.key] = d.names.map((n, i) => `${i + 1} — ${n} · ${d.effect(profile.selection, i, profile)}`);
  return out;
}
export const STYLE_TITLES = Object.fromEntries(STYLE_DEFS.map((d) => [d.key, d.title]));
