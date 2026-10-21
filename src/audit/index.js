// Orquestador de la auditoría (MOTOR-13): abre fuentes de evidencia, valida su integridad ANTES de interpretar, proyecta cada intento una sola vez (caché por huella), ejecuta los
// evaluadores AUD01–AUD32 y compone el resultado `beM-audit-result/1`. No simula, no sortea, no llama al entrenador y no altera ningún archivo original: lo que escribe (caché, resultado)
// va a `out/audit/` y es regenerable. Abrir, recalcular o exportar una auditoría no cambia estado, trajectory_fp ni sorteos (§19.8).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSource } from './source.js';
import { projectAttempt, PROJECTION_VERSION } from './project.js';
import { selectKnowledgeContexts, knowledgeSensitivity, knowledgeControls } from './knowledge.js';
import { reliability, concentration, selectContexts, sensitivity, capabilityMatrix, energyCurve, energyByTask, CAPABILITY_IDS } from './analysis.js';
import { AUDIT_CATALOG, AUDIT_BY_ID } from './catalog.js';
import { EVALUATORS } from './evaluators.js';
import { referencesFile } from './references.js';
import { experimentCatalog } from './experiments.js';
import { sha, mean } from './util.js';
import { ROOT } from '../../scripts/node-data.js';
import { loadEquivalenceReports } from './equivalence.js';

export const AUDIT_RESULT_SCHEMA = 'beM-audit-result/1';
export const DEFAULT_AUDIT_ROOT = process.env.BEM_AUDIT_ROOT ?? join(ROOT, 'out', 'audit');

function projectAll(src, attempts, profile, policyFp, cacheDir) {
  mkdirSync(cacheDir, { recursive: true }); const out = []; let hits = 0; let ms = 0; let bytes = 0;
  for (const a of attempts) {
    const fpKey = sha({ f: (a.files ?? []).map((x) => x.sha256), kind: src.kind, id: a.attempt_id, m: src.kind === 'paquete' ? src.fingerprint('x') : null, v: PROJECTION_VERSION, pol: policyFp }).slice(0, 20);
    const cp = join(cacheDir, `${fpKey}.json`);
    if (existsSync(cp)) { out.push(JSON.parse(readFileSync(cp, 'utf8'))); hits += 1; continue; }
    const t0 = performance.now(); const P = projectAttempt(src, a, profile, { sourceId: src.describe().id }); ms += performance.now() - t0; bytes += Object.values(P.bytes).reduce((x, y) => x + y, 0);
    P.source_id = src.describe().id; writeFileSync(cp, JSON.stringify(P)); out.push(P);
  }
  return { projs: out, hits, ms, bytes };
}

// `specs`: [{ kind: 'lote', id, root } | { kind: 'paquete', path }]. `opts`: { profile (efectivo, para parámetros por defecto), auditRoot, ids (subconjunto AUD), now }.
export function runAudit(specs, opts = {}) {
  const t0 = performance.now(); const auditRoot = opts.auditRoot ?? DEFAULT_AUDIT_ROOT; const cacheDir = join(auditRoot, 'cache'); const now = (opts.now ?? Date.now)();
  const sources = specs.map((s) => openSource(s)); const params = opts.params ?? opts.profile?.audit; if (!params) throw new Error('faltan los parámetros de auditoría (tabla audit del perfil)');
  // 1. integridad antes de interpretar
  const integ = sources.map((s) => ({ source: s.describe(), ...s.verifyIntegrity() })); const integrity = { ok: integ.every((i) => i.ok), files: integ.reduce((a, i) => a + (i.files ?? 0), 0), bytes: integ.reduce((a, i) => a + (i.bytes ?? 0), 0), problems: integ.flatMap((i) => i.problems), method: [...new Set(integ.map((i) => i.method))].join(' · '), sources: integ };
  const base = { schema: AUDIT_RESULT_SCHEMA, audit_version: params.version, created_at: new Date(now).toISOString(), params: JSON.parse(JSON.stringify(params)), integrity, sources: sources.map((s) => s.describe()) };
  if (!integrity.ok) return { ok: false, ...base, reason: 'la integridad de la fuente falla: no se interpreta evidencia no verificada', runs: [], findings: [{ audit: 'AUD32', rule: 'INTEGRIDAD-ARCHIVOS', severity: 'error', subject: 'integridad de la fuente', universe: 'archivos verificados', counts: { observed: integrity.problems.length, expected: 0 }, reason: 'bytes o SHA-256 distintos del índice', evidence: integrity.problems.slice(0, 50).map((p) => ({ problema: p })), evidenceCount: integrity.problems.length, cause: 'productor', state: 'abierto', id: 'H-AUD32-001' }] };
  // 2. perfil congelado y proyección
  const attempts = sources.flatMap((s) => s.attempts().map((a) => ({ ...a, _src: s }))); const prof = sources.map((s) => s.kind === 'lote' ? s.frozenFile(`entradas/perfiles/${s.lote.profile.profile_id}.json`) : null).find(Boolean) ?? opts.profile;
  const policyFp = sha({ params: { c: params.contextsPerCapability, i: params.sensitivityIncrements } }).slice(0, 8); const proj = { projs: [], hits: 0, ms: 0, bytes: 0 };
  for (const s of sources) { const r = projectAll(s, s.attempts(), prof, policyFp, cacheDir); proj.projs.push(...r.projs); proj.hits += r.hits; proj.ms += r.ms; proj.bytes += r.bytes; }
  const projs = proj.projs;
  // 3. agregaciones
  const exps = experimentCatalog(opts.profile ?? { audit: params, attributeOrder: CAPABILITY_IDS }, opts.players ?? null, { lite: true });
  const sportFps = [...new Set(sources.map((s) => (s.kind === 'lote' ? s.lote?.profile?.profile_sport_fp : null)).filter(Boolean))]; base.profile_sport_fps = sportFps; base.profile_note = sportFps.length > 1 ? `las fuentes usan ${sportFps.length} perfiles deportivos distintos: las constantes del perfil se leen de la primera fuente salvo las que el productor registró (coste de gasto por minuto vivo); la base reconstruida se compara siempre con la salida conservada` : null;
  const identity = opts.identity ?? null; // MOTOR-17B §6: estudio y versión de código del lector; con el lote y el intento forman la identidad global (un mismo lote puede existir en CONTROL17 y en M17B)
  const diagProjs = projs.filter((p) => p.level === 'diagnostic'); const selected = selectContexts(diagProjs, params.contextsPerCapability); const sens = sensitivity(selected, prof, params.sensitivityIncrements);
  const kctx = prof.familiarity ? selectKnowledgeContexts(diagProjs, params.contextsPerCapability, prof.familiarity.range.max) : []; const ksens = prof.familiarity ? knowledgeSensitivity(kctx, prof, params.sensitivityIncrements) : []; const kcontrols = prof.familiarity ? knowledgeControls(diagProjs, ksens, prof) : null; // MOTOR-18 §13.2: lectura SEPARADA de conocimiento
  if (identity) for (const r of sens) { r.study = identity.study; r.code_version = identity.code_version; }
  const rel = reliability(diagProjs, params); const conc = concentration(projs, params); const matrix = capabilityMatrix(diagProjs, prof, sens, exps); const energy = energyCurve(diagProjs); const energyTask = energyByTask(diagProjs);
  const teamProfiles = []; const seenT = new Set(); for (const s of sources) for (const f of s.listFrozen?.('entradas/equipos') ?? []) { const t = s.frozenFile(f); if (!t || seenT.has(t.id)) continue; seenT.add(t.id); const vals = t.players.flatMap((p) => CAPABILITY_IDS.map((c) => p.abilities[c])); teamProfiles.push({ team: t.id, mean: Math.round(mean(vals) * 100) / 100 }); }
  const cost = { projections_ms: Math.round(proj.ms), projection_bytes_read: proj.bytes, cache_hits: proj.hits, attempts: attempts.length, per_attempt_ms: attempts.length - proj.hits ? Math.round(proj.ms / (attempts.length - proj.hits)) : null, note: 'medido en este entorno, no extrapolable; la proyección se reutiliza por huella (caché)' };
  const equivalence = opts.equivalence ?? loadEquivalenceReports(opts.equivalenceDir ?? join(auditRoot, '..', 'equivalence'));
  const ctx = { projs, matrix, sens, rel, conc, energy, energyTask, integrity, cost, equivalence, audiences: sources.flatMap((s) => s.audiences?.() ?? []), teamProfiles, params };
  // 4. evaluadores
  const ids = opts.ids ?? AUDIT_CATALOG.map((a) => a.id); const runs = []; const findings = [];
  for (const id of ids) {
    const def = AUDIT_BY_ID[id]; const r = EVALUATORS[id]({ ...ctx, id });
    const own = r.findings.map((f, i) => ({ ...f, id: `H-${id}-${String(i + 1).padStart(3, '0')}`, examples: f.evidence.slice(0, params.examplesPerFinding), versions: { audit: params.version } })); findings.push(...own);
    runs.push({ id, name: def.name, area: def.area, type: def.type, impl: r.impl, registro: r.registro, exposicion: r.exposicion, resultado: r.resultado, revision: r.revision, metrics: r.metrics, missing: r.missing, note: r.note, findings: own.map((f) => f.id), evidence: { projections: projs.length, level: [...new Set(projs.map((p) => p.level))] } });
  }
  const matches = projs.map((p) => ({ ...(identity ? { study: identity.study, code_version: identity.code_version } : {}), batch_id: p.batch_id ?? null, match_id: p.match_id, attempt_id: p.attempt_id, case_id: p.case_id, variant_id: p.variant_id, source: p.source_id, level: p.level, valid: p.valid, score: `${p.facts.score_home}–${p.facts.score_away}`, draws: p.facts.draws, trajectory_fp: p.facts.trajectory_fp }));
  const result = { ok: true, ...base, ...(identity ? { identity } : {}), id: `AUDR-${sha({ s: sources.map((x) => x.describe()), p: policyFp, a: attempts.map((a) => a.attempt_id), t: Math.floor(now / 1000) }).slice(0, 8)}`, matches, runs, findings, matrix, sensitivity: sens, knowledge_sensitivity: ksens, knowledge_controls: kcontrols, sensitivity_contexts: Object.fromEntries(Object.entries(selected).map(([k, v]) => [k, v.length])), reliability: rel.map(({ perMatch, ...x }) => ({ ...x, perMatch })), concentration: conc, energy, energyTask, references: referencesFile(), sample: { matches: projs.length, diagnostic: diagProjs.length, reduced: projs.length - diagProjs.length, contextsPerCapability: params.contextsPerCapability, selection: 'determinista y ciega al resultado: hash FNV-1a del identificador de decisión; 3 menores por (capacidad, tarea.rol) + 2 de estrato LIMITE; reparto rotatorio hasta el máximo' }, cost, elapsed_ms: Math.round(performance.now() - t0) };
  Object.defineProperty(result, 'knowledge_selected_contexts', { value: kctx, enumerable: false });
  Object.defineProperty(result, 'selected_contexts', { value: selected, enumerable: false }); // contextos de contraste con sus entradas (solo para quien analiza en proceso; no se serializa con el resultado)
  return result;
}

export function saveResult(result, auditRoot = DEFAULT_AUDIT_ROOT) { const dir = join(auditRoot, 'resultados'); mkdirSync(dir, { recursive: true }); const p = join(dir, `${result.id}.json`); writeFileSync(p, JSON.stringify(result)); return p; }
