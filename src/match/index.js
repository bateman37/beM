// API pública del motor de MOTOR-01. El núcleo se ejecuta sin DOM ni base de datos.
import { MatchCore } from './core.js';
import './rotation.js';
import './plays.js';
import './actions.js';
import './flow.js';
import './orders.js';
import { projectBox, teamTotals } from './box.js';
import { deepCopy, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, ATTRS, SLOTS } from './data.js';
import { ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES } from './order-types.js';

export { ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, ATTRS, SLOTS, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, projectBox, teamTotals, deepCopy, ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES };

export const COVERAGE = {
  activos: {
    equipos: 'EQ01 y EQ02 (doce jugadores por equipo)', disposicion: 'DIS02', defensa: 'ORG01', cobertura: 'COB01',
    estilosEditables: ['ritmo organizado', 'prioridad de finalización', 'libertad'],
    fichas: ['POS01', 'POS05', 'POS07', 'POS09', 'POS11', 'POS14'],
    continuaciones: ['CONT01', 'CONT04', 'CONT05', 'CONT08', 'CONT09'],
    recursos: ['ESP01', 'ESP02', 'ESP06', 'ESP12', 'ESP13', 'ESP15', 'ESP16', 'ESP17'],
    estados: ['energía', 'carga', 'recuperación'],
    // MOTOR-02
    modalidades: ['simulado total', 'por cuartos (con prórrogas)', 'por tiempo a x2/x4/x8/x16 con pausa'],
    ordenes: ['estilos', 'prioridades del libro', 'director y alternativas', 'llamada de ficha (posesión actual o siguiente)', 'sustitución individual', 'cambio de quinteto (conjunto atómico)', 'devolver el quinteto al entrenador básico', 'tiempo muerto manual'],
    registro: ['JSON ampliado (órdenes, comandos, ciclo de vida)', 'reproducción desde JSON de esta versión'],
  },
  // Tabla breve de cobertura de MOTOR-02 (estados distintos: no equivalen a «validado» ni «calibrado»)
  tabla: {
    comprobado: [
      'Avance por fronteras: un solo núcleo para total, cuartos y tiempo; sin órdenes reproduce MOTOR-01 (salvo la corrección B01)',
      'Equivalencia deportiva entre modalidades y velocidades; pausa/velocidad sin efecto deportivo ni temporizadores duplicados',
      'Ciclo de vida, precedencia y conjuntos atómicos de órdenes; llamadas (consumo y caducidad)',
      'Sustituciones y quintetos con ventanas, revalidación, exclusión obligatoria y lanzador de libres',
      'Tiempos muertos: cupos, concesión, recuperación única y ventanas por causa',
      'Cierre de periodo, plan del siguiente periodo y prórroga (fixture controlado)',
      'Registro JSON ampliado y reproducción desde el archivo (con validación previa y detección de alteraciones)',
    ],
    pendienteRevisionManual: [
      'Recorrido de interfaz de las tres modalidades (recorrido automatizado en Chromium hecho; revisión de Dennis pendiente)',
      'Sensación de las velocidades x2/x4/x8/x16 (solo x2/x8/x16 recorridas en navegador; x4/x8 parametrizadas en pruebas)',
      'Mensajes, orden y claridad del panel de dirección',
    ],
    noImplementado: [
      ['Panel completo y perfiles editables', 'MOTOR-03'], ['Repertorio ofensivo ampliado', 'MOTOR-04'], ['Defensas, marcas, dobles y roles individuales', 'MOTOR-05'],
      ['Saques tácticos y ampliación espontánea', 'MOTOR-06'], ['Forma y momentos (la pausa no atenúa nada todavía)', 'MOTOR-07'],
      ['Políticas avanzadas del entrenador y tiempos muertos automáticos', 'MOTOR-08'], ['Cierre reglamentario extraordinario', 'MOTOR-09'],
    ],
  },
  pendientes: [
    'Resto del repertorio y disposiciones', 'Zonas y otras coberturas', 'Forma, momento, Consistencia y Presión (entrada neutral; la pausa no atenúa el momento hasta MOTOR-07)',
    'Memoria rival', 'Panel completo y perfiles editables (MOTOR-03)', 'Defensas, marcas, dobles y roles individuales editables (MOTOR-05/08)',
    'Políticas completas del entrenador, incluidos tiempos muertos automáticos (MOTOR-08)', 'Cierre reglamentario extraordinario (MOTOR-09)',
    'Atribución exhaustiva del acta y estadísticas avanzadas (MOTOR-09)', 'Generador y lotes', 'Guardado de carreras y persistencia entre sesiones',
    'Estilos transición, elaboración, riesgo ofensivo y tras tiro: valor declarado, sin control',
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
