// Agendas de lotes SIM (§8.2): los tres tipos existentes —repetir un enfrentamiento, cruces y pares elegidos— más variantes con diferencias visibles. Las semillas se CONGELAN al preparar el lote:
// semilla de caso = FNV-1a de 32 bits sobre «<maestra>|<caso>|<A>-<B>» (algoritmo estable de rng.js). Identidades: caso lógico global y estable, variante y semilla; el intento técnico se asigna al ejecutar.
import { deriveSeed } from '../sim/rng.js';
import { fpString } from '../sim/fp.js';
import { TEAM_IDS } from '../sim/schedule.js';

export const BATCH_KINDS = ['repeat', 'crossings', 'pairs', 'variants'];
const pad = (n) => String(n).padStart(4, '0');
export function validateBatchSpec(spec) {
  const errs = []; const add = (m) => errs.push(m); const ok = (id) => TEAM_IDS.includes(id);
  if (!spec || typeof spec !== 'object') return ['especificación ausente'];
  if (!BATCH_KINDS.includes(spec.kind)) add(`tipo de lote desconocido (${spec.kind}); se admite ${BATCH_KINDS.join(', ')}`);
  if (!Number.isInteger(spec.master) || spec.master < 0) add('la semilla maestra debe ser un entero no negativo');
  if (spec.kind === 'repeat' || spec.kind === 'variants') { if (!ok(spec.a) || !ok(spec.b)) add('equipos A y B de la lista EQ01–EQ12'); if (!Number.isInteger(spec.count) || spec.count < 1 || spec.count > 5000) add('count entre 1 y 5000'); }
  if (spec.kind === 'crossings') { if (!Number.isInteger(spec.rounds) || spec.rounds < 1 || spec.rounds > 50) add('rounds entre 1 y 50'); if (spec.teams && !spec.teams.every(ok)) add('equipos desconocidos'); }
  if (spec.kind === 'pairs') { if (!Array.isArray(spec.pairs) || !spec.pairs.length || !spec.pairs.every(([a, b]) => ok(a) && ok(b))) add('pares elegidos no válidos'); if (!Number.isInteger(spec.rounds) || spec.rounds < 1) add('rounds ≥ 1'); }
  if (spec.kind === 'variants') { if (!Array.isArray(spec.variants) || spec.variants.length < 2) add('al menos dos variantes con diferencias visibles'); else for (const v of spec.variants) { if (!v.id || !v.patch || !Object.keys(v.patch).length) add(`la variante ${v.id ?? '?'} necesita identificador y diferencias de plan visibles (patch)`); } }
  return errs;
}
export function batchId(spec) { return `SB-${fpString(JSON.stringify(spec)).slice(0, 10)}`; }
// Devuelve { id, cases[] } con casos { n, id, a, b, seed, variant?, patch? }. El identificador de caso incluye el del lote: es global y estable.
export function buildBatch(spec) {
  const errs = validateBatchSpec(spec); if (errs.length) { const e = new Error(`lote no válido: ${errs.join('; ')}`); e.validation = errs; throw e; }
  const id = batchId(spec); const cases = []; let n = 0; const push = (a, b, extra = {}) => { n += 1; const cid = `${id}-C${pad(n)}`; cases.push({ n, id: cid, a, b, seed: deriveSeed(spec.master, `${cid}|${a}-${b}`), importance: spec.importance ?? 'ordinary', ...extra }); };
  if (spec.kind === 'repeat') for (let i = 0; i < spec.count; i++) push(spec.a, spec.b);
  else if (spec.kind === 'crossings') { const teams = spec.teams ?? TEAM_IDS; for (let r = 0; r < spec.rounds; r++) for (const a of teams) for (const b of teams) if (a !== b) push(a, b, { round: r + 1 }); }
  else if (spec.kind === 'pairs') for (let r = 0; r < spec.rounds; r++) for (const [a, b] of spec.pairs) push(a, b, { round: r + 1 });
  else for (let i = 0; i < spec.count; i++) for (const v of spec.variants) push(spec.a, spec.b, { variant: v.id, patch: v.patch, repetition: i + 1 });
  return { id, spec, cases };
}
