// API pública del motor de MOTOR-01. El núcleo se ejecuta sin DOM ni base de datos.
import { MatchCore } from './core.js';
import './rotation.js';
import './defense.js';
import './plays.js';
import './actions.js';
import './flow.js';
import './defense-actions.js';
import './defense-specials.js';
import './spontaneous.js';
import './throwin.js';
import './states.js';
import './orders.js';
import { projectBox, teamTotals } from './box.js';
import { deepCopy, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, upgradeInput, ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, EXPORT_SCHEMA_MOTOR04, EXPORT_SCHEMA_MOTOR05, EXPORT_SCHEMA_MOTOR06, MIDRANGE_POLICIES, ATTRS, SLOTS } from './data.js';
import { diagnosticQueries } from './diagnostics.js';
export { ownStateView, rivalPublicView, diagnosticView, publicStreak, SCOPE_TEXT } from './visibility.js';
export { buildContrastScenario, CONTRAST_SCENARIOS } from './scenarios.js';
export { momentCategory, CATEGORY_LABELS, perturbBinary, perturbCategories, pressureLossLogit, consistencySigmaAt } from './formulas.js';
export { MOMENT_SCOPES } from './states.js';
import { ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES } from './order-types.js';

export { ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, EXPORT_SCHEMA_MOTOR04, EXPORT_SCHEMA_MOTOR05, EXPORT_SCHEMA_MOTOR06, MIDRANGE_POLICIES, upgradeInput, ATTRS, SLOTS, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, projectBox, teamTotals, deepCopy, ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES };

export const COVERAGE = {
  activos: {
    equipos: 'EQ01 y EQ02 (doce jugadores por equipo)', disposiciones: 'DIS01–DIS06 (5 abiertos, 4+1, 3+2, Horns, 1–4 alto, 1–4 bajo)',
    defensa: 'ORG01–ORG06 (individual, zonas 2–3, 3–2, 1–3–1, 1–2–2 y box and one con objetivo, alternativa y ORG02 por ausencia)',
    cobertura: 'COB01–COB04 en bloqueos directos; entregas: seguimiento/contención, cambio y compromiso de dos; indirectos: seguimiento/navegación y cambio (lo incompatible se declara, no se sustituye)',
    alturasDePresion: ['normal (avance existente)', 'tres cuartos', 'total (interacción de avance con demora, superación, pérdida o contacto; violación de 8 s)'],
    estilosDefensivos: ['ayudas', 'presión al balón', 'defensa de receptores', 'riesgo de robo', 'protección del tiro (5 niveles cada uno)'],
    rolesDefensivos: 'doce roles defensivos (orientan asignación y ayuda; no tocan capacidades)',
    especialesDefensivas: ['ESPD01 falta táctica (orden puntual; sanción ordinaria o disruptiva administrada)', 'ESPD02 doble a jugador (compromiso de dos compartido con COB04)', 'ESPD03 no abandonar tirador'],
    estilos: ['ritmo del ataque organizado', 'transición', 'elaboración', 'prioridad de finalización', 'libertad', 'riesgo ofensivo', 'después del tiro'], mediaDistancia: ['evitar', 'aceptar si está liberada', 'buscar con jugadores adecuados'],
    roles: 'quince roles ofensivos (orientan candidatos; no tocan capacidades)',
    fichas: ['POS01–POS15 (bloqueo directo ×4, mano a mano ×2 con envío previo del director, indirecto ×2, pase y corte ×2, poste ×3, aclarado ×2 con el director como aislador válido)'],
    continuaciones: ['CONT01–CONT09'],
    recursos: ['ESP01–ESP20 como catálogo de situaciones sobre un único flujo de oportunidades (llamada del plan, recurso autónomo y decisión directa)'],
    saques: ['SaqB01–SaqB03 y SaqF01–SaqF03 (libros de banda y de fondo con prioridad compartida, sacador preferido y alternativo, plazo de 5 s, primera opción, alternativa y seguridad)', 'DSaqB01–DSaqB03 y DSaqF01–DSaqF03 (una respuesta contextual por tipo de saque)', 'llamada puntual de saque (siguiente saque compatible propio del periodo)'],
    estados: ['energía (curva selectiva por tarea, carga por encargo y recuperación)', 'Forma recibida y estable durante el encuentro', 'tres momentos individuales (M-TIR, M-OFE, M-DEF) con Consistencia y actualización perezosa en tiempo deportivo', 'momento colectivo T (coordinación, no conversión)', 'presión = máximo(importancia, tensión) con MEN07', 'episodios EPI01–EPI06 con evidencia representada y atenuación por pausas'],
    modalidades: ['simulado total', 'por cuartos (con prórrogas)', 'por tiempo a x2/x4/x8/x16 con pausa'],
    ordenes: ['estilos ofensivos (siete) y media distancia', 'prioridades del libro y activar/desactivar fichas', 'disposición', 'roles ofensivos', 'director y alternativas', 'llamada de ficha', 'organización defensiva (objetivo y alternativa)', 'altura de presión', 'estilos defensivos', 'cobertura y navegación', 'roles defensivos', 'marcas', 'doble a jugador y no abandonar', 'falta táctica', 'libro de saques', 'sacadores', 'respuesta defensiva de saque', 'llamada puntual de saque', 'sustitución individual', 'cambio de quinteto (conjunto atómico)', 'devolver el quinteto al entrenador básico', 'tiempo muerto manual'],
    registro: ['JSON ampliado (órdenes, comandos, ciclo de vida, disposición, funciones, referencias y responsabilidad defensiva, coberturas, ayudas con relevo, organización efectiva, procedencia y etiquetas ESP, oportunidades y cadenas de saque)', 'reproducción desde JSON de esta versión'],
  },
  // Tabla breve de cobertura (estados distintos: no equivalen a «validado» ni «calibrado»)
  tabla: {
    comprobado: [
      'POS05/POS06: el director envía antes el balón al poseedor (pase real, sin segunda pérdida ni asistencia automática); POS14 admite al director como aislador sin prioridad por identidad',
      'Coberturas compatibles de entregas e indirectos con responsables reales; lo incompatible se declara',
      'ESP01–ESP20 catalogadas con requisitos; una opción con varias etiquetas es una sola opción (misma masa, un sorteo)',
      'Decisión directa y recurso autónomo (ESP20) comparten núcleo, origen y lector real con las fichas; ESP19 solo con calidad previa forzada',
      'Seis fichas de saque y seis respuestas alcanzables; sacador y receptor distintos; primera opción negada con alternativa real o infracción',
      'Plazo de 5 s, reloj de juego solo si nunca se paró, reloj de posesión desde el primer toque; llamada puntual con caducidad por periodo',
      'Falta táctica disruptiva (categoría propia) sin descalificación automática por dos disruptivas; cadena del robo trazable',
      'Cadena de saque con frontera y producción directa sin dobles conteos',
      'MOTOR-07: 32 sondas causales de capacidades; neutralidad de la salida final con pares de innovaciones opuestas (binarias y distribuciones); T sin efecto en conversión ni pase individual; Forma constante; episodios con evidencia y deduplicación; exportación/reproducción con estados comprometidos; rechazo de export/5',
    ],
    pendienteRevisionManual: [
      'Recorrido de la interfaz de saques, ESP y diagnóstico, y su sensación de juego (SEM, sin calibrar)',
      'Contenido declarativo de ESP01–ESP20, fichas y respuestas de saque (lectura de Claude de los anexos B y C) y de las tablas de tareas con estados y episodios (SEM-MOTOR07)',
      'Sensación de juego de Forma, momentos, presión y episodios (SEM sin calibrar; evaluación pendiente)',
    ],
    noImplementado: [
      ['Evolución de Forma entre encuentros, temporada, entrenamiento, química y moral acumulable', 'fuera del motor de partido'], ['Memoria y entrenador estratégico completo (DEF09, políticas de final)', 'MOTOR-08'],
      ['Cierre reglamentario extraordinario; contenido exacto de Arts. 37.2/38.2/17.2.7/29.2.6 (el PDF sigue sin ser accesible)', 'MOTOR-09'], ['Presiones zonales específicas y orientación a mano dominante', 'entregas posteriores'],
    ],
  },
  pendientes: [
    'Memoria rival y entrenador estratégico completo (MOTOR-08): la repetición de una ficha no tiene castigo automático',
    'Cierre reglamentario extraordinario y atribución exhaustiva del acta (MOTOR-09); la administración de la falta disruptiva es lectura propia hasta contrastar el texto exacto',
    'Una capa de percepción independiente en el diagnóstico (hoy «no disponible»: la lectura pondera la mezcla)',
    'Generador, lotes y calibración final', 'Guardado de carreras y persistencia entre sesiones',
    'Perfil final completo de los 81 grupos (este perfil es SEM provisional, no calibrado)',
  ],
};

// Crea un encuentro. input: salida de buildMatchInput (se copia y se congela). profile: perfil SEM.
// opts.direction = { managedTeam, mode } es metadato de presentación/dirección (se exporta; no decide el deporte).
export function createMatch(input, profile, opts = {}) {
  const errs = validateInput(input, profile);
  if (errs.length) { const e = new Error(`Entrada no válida: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
  return new MatchCore(input, profile, opts);
}

// Ejecuta hasta terminar. `yieldEvery` opcional: función async llamada tras cada posesión (cesión de ejecución).
export function runMatch(input, profile, opts = {}) {
  const m = createMatch(input, profile, opts);
  while (m.step()) { /* una frontera por paso */ }
  return buildResult(m);
}
export async function runMatchAsync(input, profile, opts = {}, onProgress) {
  const m = createMatch(input, profile, opts);
  let n = 0;
  while (m.step()) { n += 1; if (onProgress && n % 5 === 0) await onProgress(m); }
  return buildResult(m);
}

export function buildResult(m, extra = {}) {
  const box = projectBox(m.events, m.lineupTable, m.input);
  const teams = m.teams.map((t) => ({ id: t.id, name: t.name }));
  const complete = m.status === 'finished';
  return {
    schema: EXPORT_SCHEMA,
    identity: {
      formatVersion: EXPORT_SCHEMA, engineVersion: ENGINE_VERSION, rulesProfile: m.profile.rules.profile,
      contentProfile: m.profile.id, extensions: m.profile.extensions ?? [], effectiveProfileId: m.profile.effectiveId ?? m.profile.id, profileRef: m.opts.profileRef ?? null,
    },
    meta: m.meta(),
    status: m.status,
    errors: m.errors,
    input: { seed: m.input.seed, importance: m.input.importance, ...(m.input.contrast ? { contrast: m.input.contrast } : {}), teams: m.input.teams },
    profile: m.profileData,
    teams,
    lineups: m.lineupTable,
    events: m.events,
    score: [...m.score],
    periodScores: m.periodScores.map((p) => ({ period: p.period, points: [...p.points] })),
    box,
    direction: m.opts.direction ?? null,
    commands: m.commands,
    orders: m.orders,
    result: { complete, status: m.status, stepCount: m.stepSeq, incompleteReason: complete ? null : (m.status === 'error' ? 'error de ejecución' : 'encuentro no terminado en el momento de la exportación') },
    presentation: extra.presentation ?? null,
    diagnostics: {
      detail: m.opts.detail,
      eventCount: m.events.length,
      possessions: m.possSeq,
      steps: m.stepSeq,
      sportingDraws: m.rng.count,
      coverageObserved: { ...m.coverageObserved },
      paramTable: m.tracker ? [...m.tracker.table] : null,
      finalEnergy: Object.fromEntries(Object.entries(m.ps).map(([id, s]) => [id, Math.round(s.energy * 100) / 100])),
      finalFouls: Object.fromEntries(Object.entries(m.ps).map(([id, s]) => [id, s.fouls])),
      teamFoulsByPeriod: m.teamFouls,
      timeouts: m.timeouts.map((l) => ({ used: { ...l.used }, finalWindow: l.final })),
      opportunities: m.oppLog, throwInChains: m.throwChains,
      // MOTOR-07: estados y episodios comprometidos (sin materializar nada al exportar); la evolución conserva intervalo deportivo y estado previo/posterior
      states: m.stateSnapshot(), stateLog: m.stateLog, episodes: m.episodeLog,
    },
    coverage: COVERAGE,
  };
}

// Consultas diagnósticas con numerador y denominador (calculadas del resultado exportado).
export { diagnosticQueries };
