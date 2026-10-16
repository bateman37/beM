// API pública del motor de MOTOR-01. El núcleo se ejecuta sin DOM ni base de datos.
import { MatchCore } from './core.js';
import './rotation.js';
import './defense.js';
import './plays.js';
import './actions.js';
import './flow.js';
import './defense-actions.js';
import './orders.js';
import { projectBox, teamTotals } from './box.js';
import { deepCopy, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, upgradeInput, ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, MIDRANGE_POLICIES, ATTRS, SLOTS } from './data.js';
import { ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES } from './order-types.js';

export { ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, MIDRANGE_POLICIES, upgradeInput, ATTRS, SLOTS, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, applyExtension, validateExtension, projectBox, teamTotals, deepCopy, ORDER_TYPES, ORDER_STATES, TERMINAL_STATES, EDITABLE_STYLES };

export const COVERAGE = {
  activos: {
    equipos: 'EQ01 y EQ02 (doce jugadores por equipo)', disposiciones: 'DIS01–DIS06 (5 abiertos, 4+1, 3+2, Horns, 1–4 alto, 1–4 bajo)', defensa: 'ORG01', cobertura: 'COB01',
    estilos: ['ritmo del ataque organizado', 'transición', 'elaboración', 'prioridad de finalización', 'libertad', 'riesgo ofensivo', 'después del tiro'], mediaDistancia: ['evitar', 'aceptar si está liberada', 'buscar con jugadores adecuados'],
    roles: 'quince roles ofensivos (orientan candidatos; no tocan capacidades)',
    fichas: ['POS01–POS15 (bloqueo directo ×4, mano a mano ×2, indirecto ×2, pase y corte ×2, poste ×3, aclarado ×2)'],
    continuaciones: ['CONT01–CONT09'],
    recursos: ['ESP01', 'ESP02', 'ESP06', 'ESP12', 'ESP13', 'ESP15', 'ESP16', 'ESP17'],
    estados: ['energía', 'carga', 'recuperación'],
    modalidades: ['simulado total', 'por cuartos (con prórrogas)', 'por tiempo a x2/x4/x8/x16 con pausa'],
    ordenes: ['estilos (siete) y media distancia', 'prioridades del libro y activar/desactivar fichas', 'disposición', 'roles ofensivos', 'director y alternativas', 'llamada de ficha (posesión actual o siguiente)', 'sustitución individual', 'cambio de quinteto (conjunto atómico)', 'devolver el quinteto al entrenador básico', 'tiempo muerto manual'],
    registro: ['JSON ampliado (órdenes, comandos, ciclo de vida, disposición, funciones, decisión del receptor, encargos de rebote)', 'reproducción desde JSON de esta versión'],
  },
  // Tabla breve de cobertura (estados distintos: no equivalen a «validado» ni «calibrado»)
  tabla: {
    comprobado: [
      'Catálogo completo (siete estilos, seis disposiciones, quince fichas, nueve continuaciones, quince roles) con referencias válidas',
      'Elegibilidad antes de preferencia, prioridades compartidas, masa familiar invariante ante duplicados y llamadas',
      'Asignación de funciones por disposición sin participantes incompatibles; propietarios de capacidad distintos (director, lector posterior)',
      'POS03 abre, POS04 decide el receptor corto, POS10 exige negación, POS13 exige dos funciones interiores distintas',
      'Estilos con efecto causal en pesos/encargos sin tocar la conversión del mismo tiro; encargos de rebote y coste de balance',
      'Continuidad, reorganización con coste de tiempo, reloj limitado sin doble cobro; filas del panel con consumidor real',
      'Exportación y reproducción dentro de la versión; equivalencia entre modalidades',
    ],
    pendienteRevisionManual: [
      'Recorrido de la interfaz de preparación, libro por familia, dirección en vivo y panel (recorrido automatizado en Chromium hecho si consta en la documentación técnica; revisión de Dennis pendiente)',
      'Sensación de juego de cada disposición y de cada ficha (SEM, sin calibrar)',
    ],
    noImplementado: [
      ['Zonas, otras coberturas, alturas de presión y roles defensivos completos', 'MOTOR-05'], ['Catálogo completo de transición ESP01–ESP20 y saques tácticos', 'MOTOR-06'],
      ['Forma, momentos, Consistencia y Presión', 'MOTOR-07'], ['Memoria defensiva y adaptación estratégica', 'MOTOR-08'], ['Cierre reglamentario extraordinario', 'MOTOR-09'],
    ],
  },
  pendientes: [
    'Zonas y otras coberturas; defensas, marcas, dobles y roles defensivos (MOTOR-05)',
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
