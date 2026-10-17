// Programación de enfrentamientos de un lote (MOTOR-12 §4): modos «repetir enfrentamiento» y «cruces seleccionados», localía, cantidades inequívocas, orden estable de agenda,
// variantes, semillas deterministas por caso y prevalidación de TODAS las entradas antes de arrancar. Puro: no toca el sistema de ficheros ni el motor deportivo salvo para validar.
import { INPUT_SCHEMA, deepCopy, validateInput } from '../match/data.js';
import { instantiate } from '../population/ids.js';
import { buildLabVariant } from '../population/scenarios.js';
import { deriveCaseSeeds, SEED_DERIVATION } from './seeds.js';
import { applyVariantOps, validateVariants } from './variants.js';
import { fingerprint, pad } from './util.js';

export const LOT_VERSION = 'LOT-MOTOR12-R1';
export const VENUES = { fixed: 'Local fijo (A en casa)', home_away: 'Ida y vuelta (dos casos por repetición)', alternate: 'Alternada por repetición' };
export const MODES = { repeat: 'Repetir un enfrentamiento', cross: 'Cruces entre equipos seleccionados', pairs: 'Pares elegidos uno a uno' };
export const RECORD_LEVELS = { diagnostic: 'Diagnóstico completo', reduced: 'Reducido (sin decisiones calculadas)', 'world-essential': 'Esencial para el mundo (acta, secuencia compacta, presencia, tiros, táctica observada y estados; mismo resolutor)' };
export const LOCALIA_NOTE = 'El motor no implementa ninguna ventaja de localía: se conserva la etiqueta local/visitante (el local ocupa el puesto 0 de la entrada) sin inventar un efecto deportivo.';

// Valores por defecto: salen de la tabla `batch` del perfil (administrable); los que no existan se explicitan aquí.
export function batchDefaults(profile) {
  const b = profile?.batch ?? {};
  return { concurrency: b.concurrency ?? 1, shortcuts: b.repetitionShortcuts ?? [10, 100, 1000], level: b.defaultRecordLevel ?? 'diagnostic', prose: b.defaultProse ?? 'omitted', partTargetMiB: b.partTargetMiB ?? 64, progressMs: b.progressIntervalMs ?? 500, maxExecutions: b.maxExecutionsPerJob ?? 5000, maxReason: b.maxExecutionsReason ?? 'límite técnico', objective: b.defaultObjective ?? 'auditoría general de coherencia y distribuciones', version: b.version ?? LOT_VERSION };
}

export function normalizeSpec(spec, profile) {
  const d = batchDefaults(profile);
  const variants = spec.variants?.length ? spec.variants : [{ id: 'V0', label: 'Base', ops: [] }];
  return {
    mode: spec.mode ?? 'repeat', teamIds: [...(spec.teamIds ?? [])], pairs: (spec.pairs ?? []).map((p) => [p[0], p[1]]), selfPlay: !!spec.selfPlay, repetitions: spec.repetitions ?? d.shortcuts[0], venue: spec.venue ?? 'fixed',
    importance: spec.importance ?? 'ordinary', batchSeed: spec.batchSeed ?? 20261017, variants: variants.map((v, i) => ({ id: v.id ?? `V${i}`, label: v.label ?? (i === 0 ? 'Base' : `Candidata ${i}`), kind: v.kind ?? (v.lab ? 'lab' : 'ops'), ops: v.ops ?? [], ...(v.lab ? { lab: v.lab } : {}), ...(v.description ? { description: v.description } : {}) })),
    source: spec.source ?? { kind: 'teams' }, objective: (spec.objective ?? '').trim() || d.objective, objectiveDefaulted: !(spec.objective ?? '').trim(), question: spec.question ?? null, conserved: spec.conserved ?? null,
    recordLevel: spec.recordLevel ?? d.level, prose: spec.prose ?? d.prose, partTargetMiB: spec.partTargetMiB ?? d.partTargetMiB, concurrency: spec.concurrency ?? d.concurrency,
    teams: spec.teams ?? {}, label: spec.label ?? null, allowBaseOps: !!spec.allowBaseOps,
  };
}

// Cantidades inequívocas (§4.2): equipos, pares, repeticiones, casos por repetición, variantes, casos deportivos y ejecuciones totales.
export function planCounts(spec) {
  const n = spec.mode === 'pairs' ? new Set(spec.pairs.flat()).size : spec.mode === 'repeat' ? spec.teamIds.length : new Set(spec.teamIds).size;
  const pairs = spec.mode === 'pairs' ? spec.pairs.length : spec.mode === 'repeat' ? (spec.teamIds.length === 2 ? 1 : 0) : (n * (n - 1)) / 2 + (spec.selfPlay ? n : 0);
  const selfOnly = spec.mode === 'repeat' && spec.teamIds.length === 2 && spec.teamIds[0] === spec.teamIds[1];
  const pairsFinal = selfOnly ? 1 : pairs;
  const sides = spec.venue === 'home_away' ? 2 : 1;
  const variants = spec.variants.length; const reps = Number(spec.repetitions);
  const cases = pairsFinal * reps * sides;
  return { teams: n, pairs: pairsFinal, repetitions: reps, sidesPerRepetition: sides, variants, cases, executions: cases * variants,
    explain: `${n} equipo${n === 1 ? '' : 's'} → ${pairsFinal} par${pairsFinal === 1 ? '' : 'es'}; ${reps} repeticion${reps === 1 ? '' : 'es'} por par${sides === 2 ? ' (cada una con ida y vuelta: 2 casos)' : ''} → ${cases} caso${cases === 1 ? '' : 's'} deportivo${cases === 1 ? '' : 's'}; ${variants} variante${variants === 1 ? '' : 's'} → ${cases * variants} ejecuciones totales solicitadas` };
}

function buildPairs(spec) {
  const ids = spec.mode === 'repeat' ? spec.teamIds.slice(0, 2) : [...new Set(spec.teamIds)];
  const pairs = [];
  if (spec.mode === 'pairs') for (const [a, b] of spec.pairs) pairs.push({ a, b });
  else if (spec.mode === 'repeat') { if (ids.length === 2) pairs.push({ a: ids[0], b: ids[1] }); }
  else { for (let i = 0; i < ids.length; i++) { if (spec.selfPlay) pairs.push({ a: ids[i], b: ids[i] }); for (let j = i + 1; j < ids.length; j++) pairs.push({ a: ids[i], b: ids[j] }); } }
  return pairs.map((p, i) => ({ ...p, pair_id: `${p.a}-${p.b}`, index: i + 1 }));
}

// Agenda estable por pares → repetición → lado → variante; ordinal lógico independiente del tiempo de ejecución.
export function buildAgenda(spec, profile) {
  const pairs = buildPairs(spec); const cases = []; const executions = [];
  for (const pr of pairs) {
    const self = pr.a === pr.b;
    for (let rep = 1; rep <= spec.repetitions; rep++) {
      const sides = spec.venue === 'home_away' && !self ? [pr.a, pr.b] : spec.venue === 'alternate' && !self ? [rep % 2 === 1 ? pr.a : pr.b] : [pr.a];
      sides.forEach((home, si) => {
        const ordinal = cases.length + 1;
        cases.push({ case_id: `C${pad(ordinal)}`, ordinal, pair_id: pr.pair_id, repetition: rep, side: sides.length === 2 ? (si === 0 ? 'ida' : 'vuelta') : (spec.venue === 'alternate' ? 'alternada' : 'fija'), home_ref: home, away_ref: home === pr.a ? pr.b : pr.a, self });
      });
    }
  }
  const sd = deriveCaseSeeds({ batchSeed: spec.batchSeed, count: cases.length, rngConfig: profile.rng, lotVersion: LOT_VERSION });
  cases.forEach((c, i) => { c.seed = sd.seeds[i]; });
  let ord = 0;
  for (const c of cases) for (const v of spec.variants) { ord += 1; executions.push({ match_id: `M${pad(ord)}`, ordinal: ord, case_id: c.case_id, variant_id: v.id, pair_id: c.pair_id, repetition: c.repetition, side: c.side, home_ref: c.home_ref, away_ref: c.away_ref, seed: c.seed }); }
  return { pairs, cases, executions, seeds: { batchSeed: spec.batchSeed, derivation: SEED_DERIVATION, procedure: sd.procedure, mix: sd.mix, collisions: sd.collisions, zeroSeedReplaced: sd.zeroSeedReplaced, count: sd.seeds.length } };
}

// ---------------------------------------------------------------------------------------------------------- materialización de entradas
const teamRecord = (spec, ref) => { const t = spec.teams[ref]; if (!t) throw new Error(`falta el equipo «${ref}» en la definición del lote`); return t; };

// Entrada SIN semilla de una (par, local, variante): copia profunda, instancias sin colisión de identificadores, operaciones de variante aplicadas y diferencias listadas.
export function materializeEntry(spec, profile, { pair, homeRef, awayRef, variant, players }) {
  const seed = 1; let input; let changes = []; let planned = [];
  if (spec.source?.kind === 'lab') {
    const r = buildLabVariant(profile, players, spec.source.scenario, variant.lab ?? variant.id, { seed, importance: spec.importance });
    input = r.input; changes = r.changes; planned = r.plannedOrders ?? [];
  } else {
    const home = instantiate(teamRecord(spec, homeRef), []); const away = instantiate(teamRecord(spec, awayRef), [home.id]);
    input = { schema: INPUT_SCHEMA, seed, importance: spec.importance, teams: [deepCopy(home), deepCopy(away)] };
    changes = applyVariantOps(input, variant.ops, { pair: { a: pair.a, b: pair.b }, bounds: profile.abilityBounds });
  }
  return { input, changes, plannedOrders: planned };
}

// Prevalida y materializa cada combinación distinta (par, local, variante) UNA vez (las repeticiones solo cambian la semilla). Un caso inválido se informa con su causa.
export function prepareBatch(specIn, profile, { players = null } = {}) {
  const spec = normalizeSpec(specIn, profile); const d = batchDefaults(profile); const problems = []; const warnings = [];
  if (!MODES[spec.mode]) problems.push(`modo desconocido: ${spec.mode}`);
  if (!VENUES[spec.venue]) problems.push(`localía desconocida: ${spec.venue}`);
  if (!RECORD_LEVELS[spec.recordLevel]) problems.push(`nivel de registro desconocido: ${spec.recordLevel}`);
  if (!Number.isInteger(spec.repetitions) || spec.repetitions < 1) problems.push('las repeticiones deben ser un entero positivo');
  if (!Number.isInteger(spec.batchSeed) || spec.batchSeed < 0 || spec.batchSeed > 4294967295) problems.push('la semilla de lote debe ser un entero entre 0 y 4294967295');
  if (spec.concurrency !== 1) problems.push('solo se admite concurrencia 1 (ejecución serial) en esta versión');
  if (!Number.isFinite(spec.partTargetMiB) || spec.partTargetMiB <= 0) problems.push('el objetivo de parte debe ser un número positivo de MiB');
  if (spec.source?.kind === 'lab') { if (spec.mode !== 'repeat') problems.push('un lote desde escenario LAB11 solo admite el modo «repetir enfrentamiento»'); if (spec.venue !== 'fixed') problems.push('un lote desde escenario LAB11 conserva su emparejamiento: localía fija'); }
  else if (spec.mode === 'pairs') {
    if (!spec.pairs.length) problems.push('indica al menos un par de equipos');
    const seenP = new Set(); for (const [a, b] of spec.pairs) { if (!a || !b) problems.push('un par está incompleto'); const k = `${a}-${b}`; if (seenP.has(k)) problems.push(`el par ${k} está repetido (los pares no se repiten por defecto: usa más repeticiones)`); seenP.add(k); if (a === b && !spec.selfPlay) problems.push(`el par ${k} enfrenta a un equipo consigo mismo: márcalo explícitamente`); }
  }
  else if (spec.mode === 'repeat') { if (spec.teamIds.length !== 2) problems.push('repetir un enfrentamiento necesita exactamente dos equipos'); else if (spec.teamIds[0] === spec.teamIds[1] && !spec.selfPlay) problems.push('un equipo contra sí mismo exige marcarlo explícitamente (dos instancias, p. ej. base y copia)'); }
  else if (new Set(spec.teamIds).size < 2 && !spec.selfPlay) problems.push('los cruces necesitan al menos dos equipos distintos (o autoenfrentamiento explícito)');
  problems.push(...validateVariants(spec.variants, { attrs: profile.attributeOrder, allowBaseOps: !!spec.allowBaseOps }));
  // Desde un escenario LAB11 el emparejamiento lo define el escenario: se materializa cada variante UNA vez para fijar el par (todas deben compartirlo) antes de programar la agenda.
  if (spec.source?.kind === 'lab' && !problems.length) {
    try {
      const pairs = spec.variants.map((v) => { const r = buildLabVariant(profile, players, spec.source.scenario, v.lab ?? v.id, { seed: 1, importance: spec.importance }); return r.input.teams.map((t) => t.source?.instance?.of ?? t.id); });
      if (new Set(pairs.map((p) => p.join('|'))).size > 1) problems.push('las variantes elegidas del escenario no comparten emparejamiento: un lote compara variantes del mismo enfrentamiento');
      else { spec.teamIds = pairs[0]; spec.selfPlay = pairs[0][0] === pairs[0][1]; }
    } catch (e) { problems.push(`escenario ${spec.source.scenario}: ${e.message}`); }
  }
  if (problems.length) return { ok: false, spec, problems, warnings };
  const counts = planCounts(spec);
  if (counts.executions > d.maxExecutions) return { ok: false, spec, problems: [`${counts.executions} ejecuciones superan el límite técnico por trabajo (${d.maxExecutions}): ${d.maxReason}. Se rechaza antes de empezar; no se recorta a los primeros N.`], warnings, counts };
  if (spec.venue !== 'fixed') warnings.push(LOCALIA_NOTE);
  if (spec.source?.kind !== 'lab') for (const ref of new Set([...spec.teamIds, ...spec.pairs.flat()])) if (!spec.teams[ref]) problems.push(`falta el equipo «${ref}» (registro completo) en la definición`);
  if (problems.length) return { ok: false, spec, problems, warnings, counts };
  const agenda = buildAgenda(spec, profile);
  // entradas distintas
  const entries = new Map(); const invalid = [];
  const variantById = Object.fromEntries(spec.variants.map((v) => [v.id, v]));
  for (const ex of agenda.executions) {
    const key = `${ex.pair_id}|${ex.home_ref}|${ex.variant_id}`;
    if (entries.has(key)) { ex.entry_key = key; continue; }
    ex.entry_key = key;
    const pr = agenda.pairs.find((p) => p.pair_id === ex.pair_id);
    try {
      const e = materializeEntry(spec, profile, { pair: pr, homeRef: ex.home_ref, awayRef: ex.away_ref, variant: variantById[ex.variant_id], players });
      const errs = validateInput(e.input, profile);
      if (errs.length) { invalid.push({ key, pair_id: ex.pair_id, variant_id: ex.variant_id, home: ex.home_ref, problems: errs.map((x) => `${x.path}: ${x.message}`) }); entries.set(key, { invalid: true }); continue; }
      entries.set(key, e);
    } catch (err) { invalid.push({ key, pair_id: ex.pair_id, variant_id: ex.variant_id, home: ex.home_ref, problems: [err.message] }); entries.set(key, { invalid: true }); }
  }
  if (invalid.length) return { ok: false, spec, problems: invalid.map((i) => `caso inválido ${i.pair_id} (local ${i.home}, variante ${i.variant_id}): ${i.problems.slice(0, 3).join('; ')}`), invalid, warnings, counts, agenda };
  // diff por variante: lista exacta frente a la base, tomada de la primera entrada de cada variante
  const diffs = {}; for (const [key, e] of entries) { const vid = key.split('|')[2]; (diffs[vid] ??= []).push({ entry: key, changes: e.changes.length }); }
  const agendaFp = fingerprint({ spec: { mode: spec.mode, teamIds: spec.teamIds, pairs: spec.pairs, repetitions: spec.repetitions, venue: spec.venue, variants: spec.variants, batchSeed: spec.batchSeed, importance: spec.importance, source: spec.source, selfPlay: spec.selfPlay }, executions: agenda.executions.map((e) => [e.match_id, e.case_id, e.variant_id, e.seed, e.home_ref, e.away_ref]) });
  return { ok: true, spec, problems: [], warnings, counts, agenda, entries, agendaFp, distinctEntries: entries.size, diffs };
}
