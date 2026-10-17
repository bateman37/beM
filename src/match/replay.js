// Reproducción de un encuentro desde su JSON exportado (MOTOR-02, §10.2–10.3).
// Se vuelve a CALCULAR el deporte desde la entrada congelada, la semilla y los comandos registrados, inyectados en la misma
// frontera de avance que en el original. Las activaciones del historial sirven solo para comprobar, nunca se reaplican.
// El archivo se trata como datos: no se evalúa ni se ejecuta nada de su contenido.
import { createMatch, buildResult } from './index.js';
import { validateInput, deepCopy, ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR01, EXPORT_SCHEMA_MOTOR02, EXPORT_SCHEMA_MOTOR04, EXPORT_SCHEMA_MOTOR05, EXPORT_SCHEMA_MOTOR06, EXPORT_SCHEMA_MOTOR07, EXPORT_SCHEMA_MOTOR08 } from './data.js';
import { buildActa } from './acta.js';
import { projectBox } from './box.js';

const COMMAND_KINDS = new Set(['submit', 'batch', 'cancel', 'withdraw']);
const REQUIRED_PROFILE_KEYS = ['id', 'rng', 'rules', 'selection', 'opportunity', 'outcomes', 'tasks', 'plays', 'shots', 'energy', 'rotation', 'durationSeconds', 'activeCatalog', 'attributeOrder', 'form', 'pressure', 'moment', 'teamMoment', 'episodes', 'stateTasks', 'episodeCatalog', 'coach', 'memory', 'regulation', 'statsPolicy'];

// Valida formato, versiones y referencias ANTES de ejecutar nada. Devuelve { ok, reproducible, legacy, problems }.
export function validateReplayFile(file) {
  const problems = [];
  const out = (extra = {}) => ({ ok: problems.length === 0, reproducible: problems.length === 0, legacy: false, problems, ...extra });
  if (!file || typeof file !== 'object' || Array.isArray(file)) { problems.push('el archivo no es un encuentro exportado (se esperaba un objeto JSON)'); return out(); }
  if (file.schema === EXPORT_SCHEMA_MOTOR01) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR01} de MOTOR-01: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION})`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema === EXPORT_SCHEMA_MOTOR02) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR02} de MOTOR-02/03: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION}); el contenido operativo cambió en MOTOR-04 y de nuevo en MOTOR-05`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema === EXPORT_SCHEMA_MOTOR04) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR04} de MOTOR-04: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION}); la defensa pasó de marcas por posición a funciones y responsabilidades en MOTOR-05. El archivo se conserva sin cambios y no se le asigna el perfil nuevo`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema === EXPORT_SCHEMA_MOTOR05) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR05} de MOTOR-05: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION}); MOTOR-06 añade las decisiones directas (ESP01–ESP20), los saques de banda y fondo y corrige entregas, indirectos y la falta táctica (disruptiva). El archivo se conserva sin cambios y no se le asigna el perfil nuevo`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema === EXPORT_SCHEMA_MOTOR06) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR06} de MOTOR-06: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION}); MOTOR-07 añade la entrada de Forma, momentos, T e importancia, la presión, los episodios y nuevas conexiones de capacidades, de modo que el mismo archivo no produce el mismo partido. El archivo se conserva sin cambios y no se le asigna el perfil nuevo`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema === EXPORT_SCHEMA_MOTOR07) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR07} de MOTOR-07: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION}); MOTOR-08 añade el entrenador automático con política y delegación por áreas, el plan de participación, la memoria defensiva y corrige entregas, saques y la falta disruptiva, de modo que el mismo archivo no produce el mismo partido. El archivo se conserva sin cambios y no se le asigna el perfil nuevo`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema === EXPORT_SCHEMA_MOTOR08) {
    problems.push(`formato ${EXPORT_SCHEMA_MOTOR08} de MOTOR-08: se puede consultar, pero no es reproducible con esta versión del motor (${file.meta?.engineVersion ?? 'versión desconocida'} ≠ ${ENGINE_VERSION}); MOTOR-09 añade la matriz reglamentaria con series y consecuencias, la política estadística del acta (un fallo con falta de tiro deja de contar como intento de campo), el registro de posesiones, la conciliación, las revisiones y la ruta B de la memoria, de modo que el mismo archivo no produce el mismo partido ni la misma acta. El archivo se conserva sin cambios y no se le asigna el perfil ni las reglas nuevas`);
    return out({ reproducible: false, legacy: true });
  }
  if (file.schema !== EXPORT_SCHEMA) { problems.push(`formato no reconocido: ${String(file.schema)} (se espera ${EXPORT_SCHEMA})`); return out(); }
  const ver = file.meta?.engineVersion;
  if (ver !== ENGINE_VERSION) problems.push(`versión del motor distinta: el archivo es de ${ver ?? 'versión desconocida'} y este motor es ${ENGINE_VERSION}; no se aparenta reproducibilidad`);
  if (file.identity && file.identity.engineVersion !== ver) problems.push('la identidad del archivo no coincide con su metadato de motor');
  const prof = file.profile;
  if (!prof || typeof prof !== 'object') problems.push('falta el perfil efectivo');
  else for (const k of REQUIRED_PROFILE_KEYS) if (!(k in prof)) problems.push(`perfil efectivo incompleto: falta ${k}`);
  if (!file.input) problems.push('falta la entrada congelada');
  else if (prof && !problems.length) for (const e of validateInput(file.input, prof)) problems.push(`entrada: ${e.path}: ${e.message}`);
  if (!Array.isArray(file.commands)) problems.push('faltan los comandos registrados');
  else file.commands.forEach((c, i) => {
    if (!c || typeof c !== 'object' || !COMMAND_KINDS.has(c.kind)) problems.push(`comando ${i + 1}: tipo no admitido`);
    else if (!Number.isInteger(c.afterStep) || c.afterStep < 0) problems.push(`comando ${i + 1}: frontera no válida`);
    else if (!c.payload || typeof c.payload !== 'object') problems.push(`comando ${i + 1}: sin contenido`);
    else if (i > 0 && file.commands[i - 1].afterStep > c.afterStep) problems.push(`comando ${i + 1}: fuera de secuencia`);
  });
  if (!Array.isArray(file.events) || !file.result || typeof file.result.stepCount !== 'number') problems.push('faltan los hechos o el resultado registrados');
  return out();
}

// Proyección deportiva: excluye fechas reales, duración de ejecución, detalle calculado, relato y metadatos de presentación.
export function sportsProjection(res) {
  return {
    events: res.events.map(({ calc, params, instr, ...e }) => e), // `instr`: datos de lectura añadidos en MOTOR-11 (ocupación de ayuda, disponibilidad de corte); un export/8 anterior sigue siendo reproducible
    score: res.score, periodScores: res.periodScores,
    box: projectBox(res.events, res.lineups, res.input),
    acta: (({ glossary, ...a }) => a)(buildActa({ events: res.events, lineups: res.lineups, input: res.input, possessions: res.possessions, status: res.status }, res.profile?.statsPolicy)), // MOTOR-09: acta reconstruida desde los hechos
    possessions: res.possessions ?? null,
    orders: res.orders, commands: res.commands,
    states: res.diagnostics?.states ?? null, episodes: res.diagnostics?.episodes ?? null, // MOTOR-07: estados y timestamps comprometidos y episodios (reproducibles)
    coach: (res.diagnostics?.coach?.decisions ?? null)?.map((d) => ({ ...d, version: d.version ? { ...d.version, versionDeLaBiblioteca: undefined } : d.version })), // la etiqueta de biblioteca es procedencia del perfil, no un hecho deportivo
     memory: res.diagnostics?.memory ?? null, // MOTOR-08: decisiones del entrenador y memoria (se regeneran y se contrastan; no se reinyectan)
    status: res.status, steps: res.result?.stepCount ?? res.diagnostics?.steps,
    ...(res.administrative ? { administrative: res.administrative } : {}), // MOTOR-14: terminación administrativa (solo si existe; la referencia sin ella conserva su huella)
  };
}

export function compareProjections(a, b) {
  const pa = sportsProjection(a); const pb = sportsProjection(b);
  const parts = {};
  for (const k of Object.keys(pa)) parts[k] = JSON.stringify(pa[k]) === JSON.stringify(pb[k]);
  let firstEventDifference = null;
  if (!parts.events) {
    const n = Math.max(pa.events.length, pb.events.length);
    for (let i = 0; i < n; i++) if (JSON.stringify(pa.events[i]) !== JSON.stringify(pb.events[i])) { firstEventDifference = { index: i, original: pa.events[i] ?? null, reproducido: pb.events[i] ?? null }; break; }
  }
  return { identical: Object.values(parts).every(Boolean), parts, firstEventDifference };
}

// Aplica los comandos registrados en la misma frontera y avanza hasta el mismo punto que el original.
export function replayMatch(file, { detail = 'minimal' } = {}) {
  const v = validateReplayFile(file);
  if (!v.reproducible) { const e = new Error(`No se puede reproducir: ${v.problems.join(' · ')}`); e.validation = v; throw e; }
  const profile = deepCopy(file.profile);
  const m = createMatch(deepCopy(file.input), profile, { detail, direction: file.direction ?? null, profileRef: file.identity?.profileRef ?? null });
  const cmds = file.commands;
  let i = 0;
  const inject = () => { while (i < cmds.length && cmds[i].afterStep === m.stepSeq) { m.applyCommand(cmds[i]); i += 1; } };
  const limit = file.result.complete ? Infinity : file.result.stepCount;
  inject();
  while (m.stepSeq < limit && m.step()) inject();
  if (m.status === 'finished') inject(); // comandos posteriores al final (rechazados) para igualar el registro
  const res = buildResult(m);
  return { result: res, comparison: compareProjections(file, res), validation: v };
}
