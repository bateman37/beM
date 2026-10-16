// API pública del motor de MOTOR-01. El núcleo se ejecuta sin DOM ni base de datos.
import { MatchCore } from './core.js';
import './rotation.js';
import './defense.js';
import './plays.js';
import './actions.js';
import './flow.js';
import './defense-actions.js';
import './defense-specials.js';
import './orders.js';
import { projectBox, teamTotals } from './box.js';
import { deepCopy, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, upgradeInput, ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, EXPORT_SCHEMA_MOTOR04, MIDRANGE_POLICIES, ATTRS, SLOTS } from './data.js';
import { ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES } from './order-types.js';

export { ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, EXPORT_SCHEMA_MOTOR04, MIDRANGE_POLICIES, upgradeInput, ATTRS, SLOTS, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, projectBox, teamTotals, deepCopy, ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES };

export const COVERAGE = {
  activos: {
    equipos: 'EQ01 y EQ02 (doce jugadores por equipo)', disposiciones: 'DIS01–DIS06 (5 abiertos, 4+1, 3+2, Horns, 1–4 alto, 1–4 bajo)',
    defensa: 'ORG01–ORG06 (individual, zonas 2–3, 3–2, 1–3–1, 1–2–2 y box and one con objetivo, alternativa y ORG02 por ausencia)',
    cobertura: 'COB01–COB04 (contener/drop con navegación por encima o por debajo, cambiar, show y atrapar) en las fichas de bloqueo directo',
    alturasDePresion: ['normal (avance existente)', 'tres cuartos', 'total (interacción de avance con demora, superación, pérdida o contacto; violación de 8 s)'],
    estilosDefensivos: ['ayudas', 'presión al balón', 'defensa de receptores', 'riesgo de robo', 'protección del tiro (5 niveles cada uno)'],
    rolesDefensivos: 'doce roles defensivos (orientan asignación y ayuda; no tocan capacidades)',
    especialesDefensivas: ['ESPD01 falta táctica (orden puntual; sanción ordinaria o antideportiva administrada)', 'ESPD02 doble a jugador (compromiso de dos compartido con COB04)', 'ESPD03 no abandonar tirador'],
    estilos: ['ritmo del ataque organizado', 'transición', 'elaboración', 'prioridad de finalización', 'libertad', 'riesgo ofensivo', 'después del tiro'], mediaDistancia: ['evitar', 'aceptar si está liberada', 'buscar con jugadores adecuados'],
    roles: 'quince roles ofensivos (orientan candidatos; no tocan capacidades)',
    fichas: ['POS01–POS15 (bloqueo directo ×4, mano a mano ×2, indirecto ×2, pase y corte ×2, poste ×3, aclarado ×2)'],
    continuaciones: ['CONT01–CONT09'],
    recursos: ['ESP01', 'ESP02', 'ESP06', 'ESP12', 'ESP13', 'ESP15', 'ESP16', 'ESP17'],
    estados: ['energía', 'carga (incluida la carga por encargo defensivo)', 'recuperación'],
    modalidades: ['simulado total', 'por cuartos (con prórrogas)', 'por tiempo a x2/x4/x8/x16 con pausa'],
    ordenes: ['estilos ofensivos (siete) y media distancia', 'prioridades del libro y activar/desactivar fichas', 'disposición', 'roles ofensivos', 'director y alternativas', 'llamada de ficha', 'organización defensiva (objetivo y alternativa)', 'altura de presión', 'estilos defensivos', 'cobertura y navegación', 'roles defensivos', 'marcas', 'doble a jugador y no abandonar', 'falta táctica', 'sustitución individual', 'cambio de quinteto (conjunto atómico)', 'devolver el quinteto al entrenador básico', 'tiempo muerto manual'],
    registro: ['JSON ampliado (órdenes, comandos, ciclo de vida, disposición, funciones, referencias y responsabilidad defensiva, coberturas, ayudas con relevo, organización efectiva)', 'reproducción desde JSON de esta versión'],
  },
  // Tabla breve de cobertura (estados distintos: no equivalen a «validado» ni «calibrado»)
  tabla: {
    comprobado: [
      'Catálogo defensivo (6 organizaciones, 5×5 estilos, 3 alturas, 4 coberturas, 12 roles, 3 especiales) con referencias y realizabilidad',
      'Responsabilidades zonales distintas ante la misma amenaza; sin referencias sin acceso ni cinco marcas rígidas',
      'Marcas manuales, adecuación funcional y estabilidad; la posición nominal ni prohíbe ni penaliza',
      'Cambio conserva responsables; show compromete y recupera; trampa deja una opción detrás y no duplica el especial',
      'Ayuda libera una responsabilidad y admite relevo; no abandonar limita al ayudante; el perseguidor dedicado no ayuda',
      'Objetivo ausente: alternativa individual u ORG02; retorno solo si la intención sigue vigente',
      'Presión alta con exposición, tiempo y carga reales; presión superada conserva el retorno; violación de 8 s',
      'Falta táctica con ejecutor y acceso, clasificación real, caducidad y sanción administrada',
      'Exportación y reproducción dentro de la versión; rechazo explícito de los formatos anteriores',
    ],
    pendienteRevisionManual: [
      'Recorrido de la interfaz de defensa (preparación y dirección en vivo) y su sensación de juego (SEM, sin calibrar)',
      'Contenido declarativo de organizaciones, funciones y responsabilidades (lectura de Claude de los apartados 4–10)',
    ],
    noImplementado: [
      ['Presiones zonales específicas (2–2–1, 1–2–1–1), orientación a mano dominante, planes automáticos', 'MOTOR-06 en adelante'],
      ['Catálogo completo de transición ESP01–ESP20, saques tácticos y defensas de saque (DEF08)', 'MOTOR-06'],
      ['Forma, momentos, Consistencia y Presión', 'MOTOR-07'], ['Memoria defensiva y adaptación estratégica (DEF09)', 'MOTOR-08'], ['Cierre reglamentario extraordinario (otras sanciones especiales)', 'MOTOR-09'],
    ],
  },
  pendientes: [
    'Presiones zonales específicas y orientación a mano dominante (entregas posteriores)',
    'Catálogo completo de transición y saques tácticos (MOTOR-06): se conservan las oportunidades espontáneas existentes',
    'Forma, momento, Consistencia y Presión (entrada neutral; MOTOR-07)',
    'Memoria rival y entrenador estratégico completo (MOTOR-08): la repetición de una ficha no tiene castigo automático',
    'Cierre reglamentario extraordinario y atribución exhaustiva del acta (MOTOR-09)', 'Generador, lotes y calibración final', 'Guardado de carreras y persistencia entre sesiones',
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
    input: { seed: m.input.seed, teams: m.input.teams },
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
    },
    coverage: COVERAGE,
  };
}
