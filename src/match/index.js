// API pública del motor de MOTOR-01. El núcleo se ejecuta sin DOM ni base de datos.
import { MatchCore } from './core.js';
import './rotation.js';
import './plays.js';
import './actions.js';
import './flow.js';
import './orders.js';
import { projectBox, teamTotals } from './box.js';
import { deepCopy, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, ENGINE_VERSION, EXPORT_SCHEMA, ATTRS, SLOTS } from './data.js';

export { ENGINE_VERSION, EXPORT_SCHEMA, ATTRS, SLOTS, validateInput, buildMatchInput, parsePlayersCsv, validateProfileAndFixtures, projectBox, teamTotals, deepCopy };

export const COVERAGE = {
  activos: {
    equipos: 'EQ01 y EQ02 (doce jugadores por equipo)', disposicion: 'DIS02', defensa: 'ORG01', cobertura: 'COB01',
    estilosEditables: ['ritmo organizado', 'prioridad de finalización', 'libertad'],
    fichas: ['POS01', 'POS05', 'POS07', 'POS09', 'POS11', 'POS14'],
    continuaciones: ['CONT01', 'CONT04', 'CONT05', 'CONT08', 'CONT09'],
    recursos: ['ESP01', 'ESP02', 'ESP06', 'ESP12', 'ESP13', 'ESP15', 'ESP16', 'ESP17'],
    estados: ['energía', 'carga', 'recuperación'],
  },
  pendientes: [
    'Resto del repertorio y disposiciones', 'Zonas y otras coberturas', 'Forma, momento, Consistencia y Presión (entrada neutral)',
    'Memoria rival', 'Dirección manual durante el partido y otros modos (MOTOR-02)', 'Panel completo',
    'Atribución exhaustiva del acta y estadísticas avanzadas (MOTOR-09)', 'Generador y lotes',
    'Estilos transición, elaboración, riesgo ofensivo y tras tiro: valor declarado, sin control',
    'Perfil final completo de los 81 grupos (este perfil es SEM provisional, no calibrado)',
  ],
};

// Crea un encuentro. input: salida de buildMatchInput (se copia y se congela). profile: perfil SEM.
export function createMatch(input, profile, opts = {}) {
  const errs = validateInput(input, profile);
  if (errs.length) { const e = new Error(`Entrada no válida: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
  return new MatchCore(input, profile, opts);
}

// Ejecuta hasta terminar. `yieldEvery` opcional: función async llamada tras cada posesión (cesión de ejecución).
export function runMatch(input, profile, opts = {}) {
  const m = createMatch(input, profile, opts);
  while (m.step()) { /* una posesión por paso */ }
  return buildResult(m);
}
export async function runMatchAsync(input, profile, opts = {}, onProgress) {
  const m = createMatch(input, profile, opts);
  let n = 0;
  while (m.step()) { n += 1; if (onProgress && n % 5 === 0) await onProgress(m); }
  return buildResult(m);
}

export function buildResult(m) {
  const box = projectBox(m.events, m.lineupTable, m.input);
  const teams = m.teams.map((t) => ({ id: t.id, name: t.name }));
  return {
    schema: EXPORT_SCHEMA,
    meta: m.meta(),
    status: m.status,
    errors: m.errors,
    input: { seed: m.input.seed, teams: m.input.teams },
    profile: m.profile,
    teams,
    lineups: m.lineupTable,
    events: m.events,
    score: [...m.score],
    periodScores: m.periodScores.map((p) => ({ period: p.period, points: [...p.points] })),
    box,
    diagnostics: {
      detail: m.opts.detail,
      eventCount: m.events.length,
      possessions: m.possSeq,
      sportingDraws: m.rng.count,
      coverageObserved: { ...m.coverageObserved },
      finalEnergy: Object.fromEntries(Object.entries(m.ps).map(([id, s]) => [id, Math.round(s.energy * 100) / 100])),
      finalFouls: Object.fromEntries(Object.entries(m.ps).map(([id, s]) => [id, s.fouls])),
      teamFoulsByPeriod: m.teamFouls,
    },
    coverage: COVERAGE,
  };
}
