// Congelación del lote (MOTOR-12 §5.3): al iniciar, la agenda, las semillas, las entradas efectivas (fichas con las 32 capacidades, cuerpo, tendencias y estados; planes completos; órdenes programadas)
// y el perfil efectivo se escriben UNA vez en `entradas/`. El lote no vuelve a leer el perfil activo ni los equipos del navegador: continuar usa SOLO esto. Los bloques compartidos se guardan una vez por huella.
import { INPUT_SCHEMA } from '../match/data.js';
import { ENGINE_VERSION, INSTRUMENTATION } from '../match/index.js';
import { ACTA_POLICY_ID } from '../match/acta.js';
import { ANALYSIS_VERSION } from '../analysis/formulas.js';
import { APP_VERSION } from '../version.js';
import { fpOf, sha256 } from './hashing.js';
import { profileFingerprint, profileSportFingerprint, TRAJECTORY_VERSION, INPUT_FP_VERSION } from './fingerprint.js';
import { LOT_VERSION } from './schedule.js';
import { RECORDS_VERSION, sourceTeamOf } from './records.js';
import { SEED_DERIVATION } from './seeds.js';
import { PACKAGE_SCHEMA } from './schema.js';
import { iso } from './util.js';

export function versionsOf(profile) {
  return { package_schema: PACKAGE_SCHEMA, lot: LOT_VERSION, records: RECORDS_VERSION, engine: ENGINE_VERSION, instrumentation: INSTRUMENTATION, app: APP_VERSION, rng: profile.rng.algorithm, seed_derivation: SEED_DERIVATION, rules_profile: profile.rules.profile,
    content_profile: profile.id, effective_profile_id: profile.effectiveId ?? profile.id, extensions: (profile.extensions ?? []).map((e) => e.id), analysis: ANALYSIS_VERSION, acta_policy: ACTA_POLICY_ID, trajectory: TRAJECTORY_VERSION, input_fingerprint: INPUT_FP_VERSION,
    population_dataset: profile.population?.version ?? null, generator: profile.generator?.version ?? null, lab_catalog: profile.lab?.version ?? null };
}

// `prep`: resultado de prepareBatch (ok). Devuelve { batchId, files: Map(ruta relativa → contenido), job }.
export function freezeBatch(prep, profile, { batchId, now = Date.now(), label = null, revisionOf = null, revision = 1 }) {
  const { spec, agenda, counts, entries } = prep; const files = new Map(); const sharedEq = new Map(); const sharedPl = new Map();
  const profile_id = profileFingerprint(profile); files.set(`entradas/perfiles/${profile_id}.json`, profile);
  // entradas distintas → registros con bloques compartidos por huella
  const entryByKey = {}; const entryRecords = [];
  for (const [key, e] of entries) {
    const teams = e.input.teams.map((t, i) => {
      const { plan, ...rest } = t; const players_ref = `${t.id}-${fpOf(rest, 12)}`; const plan_ref = `${t.id}-${fpOf(plan, 12)}`;
      sharedEq.set(players_ref, rest); sharedPl.set(plan_ref, plan);
      return { index: i, team_instance_id: t.id, source_team_id: sourceTeamOf(t), name: t.name, players_ref, plan_ref, source: t.source ?? null };
    });
    const body = { schema: 'beM-batch-entry/1', input_schema: e.input.schema ?? INPUT_SCHEMA, importance: e.input.importance, ...(e.input.contrast ? { contrast: e.input.contrast } : {}), planned_orders: e.plannedOrders ?? [], teams };
    const entry_id = `EN-${fpOf({ ...body, teams: teams.map((t) => [t.players_ref, t.plan_ref]) }, 14)}`;
    const [pair_id, home_ref, variant_id] = key.split('|');
    const rec = { ...body, entry_id, entry_key: key, pair_id, home_ref, variant_id, changes: e.changes };
    entryByKey[key] = rec; entryRecords.push(rec); files.set(`entradas/partidos/${entry_id}.json`, rec);
  }
  for (const [ref, v] of sharedEq) files.set(`entradas/equipos/${ref}.json`, v);
  for (const [ref, v] of sharedPl) files.set(`entradas/planes/${ref}.json`, v);
  const exs = agenda.executions.map((x) => { const en = entryByKey[x.entry_key]; return { match_id: x.match_id, ordinal: x.ordinal, case_id: x.case_id, variant_id: x.variant_id, pair_id: x.pair_id, repetition: x.repetition, side: x.side, home_ref: x.home_ref, away_ref: x.away_ref, home_team_instance_id: en.teams[0].team_instance_id, away_team_instance_id: en.teams[1].team_instance_id, home_source_team_id: en.teams[0].source_team_id, away_source_team_id: en.teams[1].source_team_id, seed: x.seed, entry_key: x.entry_key, entry_id: en.entry_id, input_id: sha256(`${en.entry_id}|${x.seed}`).slice(0, 16) }; });
  const createdAt = now(); const versions = versionsOf(profile);
  const lote = {
    schema: 'beM-batch-input/1', batch_id: batchId, revision, revision_of: revisionOf, label, created_at: iso(createdAt), objective: spec.objective, objective_defaulted: spec.objectiveDefaulted, question: spec.question, mode: spec.mode, venue: spec.venue, repetitions: spec.repetitions, importance: spec.importance, source: spec.source,
    record_level: spec.recordLevel, prose: spec.prose, part_target_mib: spec.partTargetMiB, concurrency: spec.concurrency, self_play: spec.selfPlay, team_ids: spec.teamIds,
    counts: { ...counts, distinct_entries: entries.size }, seeds: { ...agenda.seeds, generation_note: 'La semilla de GENERACIÓN de población pertenece a cada equipo generado (source.seed en entradas/equipos); no se regenera por partido. La semilla de LOTE deriva la lista de semillas DEPORTIVAS de los casos (columna seed).' },
    profile: { profile_id, profile_sport_fp: profileSportFingerprint(profile), effective_profile_id: profile.effectiveId ?? profile.id, file: `entradas/perfiles/${profile_id}.json`, batch_table: profile.batch ?? null },
    versions, agenda_fp: prep.agendaFp, pairs: agenda.pairs.map(({ pair_id, a, b }) => ({ pair_id, a, b })), cases: agenda.cases, entries: entryRecords.map((e) => e.entry_id), agenda: exs, warnings: prep.warnings,
    fingerprints: { input: 'input_id = SHA-256(entry_id | semilla)[:16]; entry_id = huella canónica de la entrada sin semilla (equipos, planes, órdenes programadas)', profile: 'profile_id = SHA-256 canónico del perfil efectivo completo; profile_sport_fp excluye identificación y tablas de lectura/construcción (batch, analysis, population, generator, lab)', trajectory: 'trajectory_fp = SHA-256 canónico de la proyección deportiva sin nombre de perfil (src/batch/fingerprint.js)' },
  };
  files.set('entradas/lote.json', lote);
  const vdefs = spec.variants.map((v) => ({ id: v.id, label: v.label, kind: v.kind, description: v.description ?? null, ops: v.ops, lab: v.lab ?? null, diff: entryRecords.filter((e) => e.variant_id === v.id).map((e) => ({ entry_id: e.entry_id, pair_id: e.pair_id, home_ref: e.home_ref, changes: e.changes })) }));
  files.set('entradas/variantes.json', { schema: 'beM-batch-variants/1', batch_id: batchId, base_variant_id: spec.variants[0].id, variants: vdefs, conserved: spec.conserved ?? ['mismos equipos (fichas y planes) en cada caso', 'misma lista de semillas deportivas: las variantes de un mismo caso comparten semilla', 'mismo perfil efectivo congelado', 'misma localía y orden de agenda', 'estado inicial limpio en cada partido (energía, Forma, momentos, faltas, memoria)'], note: 'La misma semilla no garantiza que cada jugada consuma los mismos sorteos tras una decisión distinta: la comparación no es un efecto causal aislado.' });
  const job = { schema: 'beM-batch-job/1', batch_id: batchId, revision, revision_of: revisionOf, label, state: 'preparado', state_reason: null, stop_requested: false, created_at: createdAt, updated_at: createdAt, versions, config: { mode: spec.mode, venue: spec.venue, repetitions: spec.repetitions, record_level: spec.recordLevel, prose: spec.prose, part_target_mib: spec.partTargetMiB, concurrency: spec.concurrency, objective: spec.objective, agenda_fp: prep.agendaFp }, counts_requested: counts.executions, current: null, history: [{ at: createdAt, from: null, to: 'preparado', reason: 'lote congelado' }], timing: { started_at: null, elapsed_ms: 0 }, notes: [] };
  return { batchId, files, job, lote };
}
