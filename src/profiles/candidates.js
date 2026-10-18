// MOTOR-17 §10 y §11: candidatas numéricas EXPLÍCITAS sobre los controles existentes. Una candidata es una lista de filas (ruta del perfil efectivo, valor anterior, valor nuevo, causa, consumidor); este módulo solo
// construye, a partir de ella, una COPIA del perfil efectivo con identidad propia (`effectiveId` distinto: varias candidatas comparten el `id` base) y la lista de diferencias exactas. No activa nada, no toca el
// perfil activo ni los lotes congelados, y no decide: la activación es siempre una acción explícita desde el Panel. Puro, sin DOM ni RNG.
import { deepCopy } from './util.js';

export const CANDIDATES_SCHEMA = 'beM-candidates/1';
export const MAX_CONTROLS = 6; // MOTOR-17 §10.2: como máximo seis controles numéricos independientes por candidata
export const MAX_CANDIDATES = 2;

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
function put(obj, path, value) { const ks = path.split('.'); let o = obj; for (const k of ks.slice(0, -1)) o = o[k]; o[ks.at(-1)] = value; }

// Valida la definición contra un perfil efectivo: filas existentes, valor anterior = efectivo, tipos numéricos, máximos. Devuelve la lista de problemas (vacía = válida).
export function validateCandidate(profile, cand) {
  const problems = [];
  if (!cand?.id) problems.push('candidata sin identificador');
  if (!cand?.controls?.length || cand.controls.length > MAX_CONTROLS) problems.push(`${cand?.id}: entre 1 y ${MAX_CONTROLS} controles`);
  for (const c of cand?.controls ?? []) {
    const cur = get(profile, c.row);
    if (cur === undefined) { problems.push(`${cand.id}: la fila ${c.row} no existe en el perfil`); continue; }
    if (typeof cur !== 'number' || typeof c.after !== 'number' || !Number.isFinite(c.after)) problems.push(`${cand.id}: ${c.row} debe ser numérica`);
    if (cur !== c.before) problems.push(`${cand.id}: ${c.row} vale ${cur} en el perfil y la candidata declara ${c.before}`);
    for (const f of ['unit', 'consumer', 'cause', 'expected']) if (!c[f]) problems.push(`${cand.id}: ${c.row} sin ${f}`);
  }
  return problems;
}

// Copia del perfil efectivo con las filas de la candidata. Identidad: `<effectiveId>+<id candidata>`; la extensión añadida lista cada cambio (antes → después) y marca la copia como CANDIDATA.
export function candidateProfile(profile, cand) {
  const problems = validateCandidate(profile, cand); if (problems.length) throw new Error(`candidata no válida: ${problems.join('; ')}`);
  const p = deepCopy(profile);
  for (const c of cand.controls) put(p, c.row, c.after);
  const base = profile.effectiveId ?? profile.id;
  p.effectiveId = `${base}+${cand.id}`;
  p.extensions = [...(profile.extensions ?? []), { id: cand.id, status: 'CANDIDATA propuesta: sin aceptación deportiva; activación explícita', basedOn: base, replaced: cand.controls.map((c) => ({ path: c.row, before: c.before, after: c.after, note: `${c.cause}: ${cand.hypothesis}` })) }];
  return p;
}

// Diferencias exactas candidata → base para el Panel y para el paquete (fila, unidad, consumidor, causa, efecto previsto/observado).
export function candidateDiff(cand) {
  return cand.controls.map((c) => ({ candidate: cand.id, row: c.row, before: c.before, after: c.after, delta: Number((c.after - c.before).toFixed(6)), unit: c.unit, consumer: c.consumer, cause: c.cause, expected: c.expected, observedDev: c.observedDev ?? null }));
}
