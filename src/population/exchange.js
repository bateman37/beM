// Intercambio de escenarios (MOTOR-11 §13.2): contrato versionado `beM-scenario/1`, validación antes de aceptar y remapeo de instancia. Importar NO ejecuta texto ni código,
// no sobrescribe una referencia protegida por coincidencia de nombre y conserva el archivo original (la entrada se guarda tal cual dentro del registro del escenario).
import { INPUT_SCHEMA, ENGINE_VERSION, validateInput, deepCopy } from '../match/data.js';
import { fingerprint } from './hash.js';
import { instantiate } from './ids.js';
import { validateTeamRecord } from './validate.js';

export const SCENARIO_SCHEMA = 'beM-scenario/1';

export function exportScenario(sc, profile, { profileRef = null } = {}) {
  const input = deepCopy(sc.input);
  return {
    schema: SCENARIO_SCHEMA,
    id: sc.scenario?.id ?? sc.id ?? null, name: sc.scenario?.name ?? sc.name, question: sc.scenario?.question ?? sc.question ?? null, diagnostic: !!(sc.scenario?.diagnostic ?? sc.diagnostic), multicause: !!(sc.scenario?.multicause ?? sc.multicause),
    lab: sc.scenario?.labVersion ?? sc.lab ?? null,
    createdWith: { engineVersion: ENGINE_VERSION, inputSchema: INPUT_SCHEMA, profile: profile?.effectiveId ?? profile?.id ?? null, profileRef },
    changes: deepCopy(sc.changes ?? []), plannedOrders: deepCopy(sc.plannedOrders ?? []),
    // Las entradas efectivas viajan completas (fichas, planes, estados, procedencia de generación): importar no regenera nada.
    input,
    fingerprint: fingerprint({ seed: input.seed, importance: input.importance, teams: input.teams.map((t) => ({ id: t.id, players: t.players.map(({ provenance, ...p }) => p), plan: t.plan })) }),
  };
}

// Valida el archivo ANTES de aceptarlo: formato, versión, estructura, huella y entrada con el perfil vigente. Devuelve { ok, problems, warnings }.
export function validateScenarioFile(file, profile) {
  const problems = []; const warnings = [];
  if (!file || typeof file !== 'object' || Array.isArray(file)) return { ok: false, problems: ['el archivo no es un escenario exportado (se esperaba un objeto JSON)'], warnings };
  if (file.schema !== SCENARIO_SCHEMA) problems.push(`formato no reconocido: ${String(file.schema)} (se espera ${SCENARIO_SCHEMA})`);
  if (!file.input || typeof file.input !== 'object') problems.push('falta la entrada del escenario');
  if (problems.length) return { ok: false, problems, warnings };
  if (file.createdWith?.engineVersion && file.createdWith.engineVersion !== ENGINE_VERSION) warnings.push(`creado con otro motor (${file.createdWith.engineVersion}); esta versión es ${ENGINE_VERSION}: puede jugarse si la entrada es válida, pero no se promete reproducir resultados antiguos`);
  const errs = validateInput(file.input, profile);
  for (const e of errs.slice(0, 20)) problems.push(`entrada: ${e.path}: ${e.message}`);
  if (errs.length > 20) problems.push(`… y ${errs.length - 20} problemas más en la entrada`);
  if (!problems.length) {
    const want = fingerprint({ seed: file.input.seed, importance: file.input.importance, teams: file.input.teams.map((t) => ({ id: t.id, players: t.players.map(({ provenance, ...p }) => p), plan: t.plan })) });
    if (file.fingerprint && file.fingerprint !== want) problems.push('la huella no coincide con la entrada: el archivo se modificó después de exportarse');
    file.input.teams.forEach((t, i) => { for (const e of validateTeamRecord(t, profile, { rivalCheck: false })) problems.push(`equipo ${i + 1}: ${e.path}: ${e.message}`); });
  }
  return { ok: problems.length === 0, problems, warnings };
}

// Convierte el archivo en un registro de escenario guardable. Remapea instancias si hiciera falta (dos equipos con el mismo identificador): nunca cambia valores.
export function importScenario(file, profile) {
  const v = validateScenarioFile(file, profile); if (!v.ok) return { ...v, record: null };
  let input = deepCopy(file.input); const notes = [];
  if (input.teams[0].id === input.teams[1].id) { const inst = instantiate(input.teams[1], [input.teams[0].id]); notes.push(`instancia remapeada: ${input.teams[1].id} → ${inst.id}`); input = { ...input, teams: [input.teams[0], inst] }; }
  return { ...v, notes, record: { name: `${file.name ?? 'Escenario importado'} (importado)`, question: file.question ?? null, diagnostic: !!file.diagnostic, multicause: !!file.multicause, lab: file.lab ?? null, changes: file.changes ?? [], plannedOrders: file.plannedOrders ?? [], input, importedFrom: { schema: file.schema, fingerprint: file.fingerprint ?? null, createdWith: file.createdWith ?? null, id: file.id ?? null } } };
}
