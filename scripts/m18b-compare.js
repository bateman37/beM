// MOTOR-18 §15.1: comparación neutral campo a campo CONTROL17B ↔ M18 sobre los registros esenciales ya conservados (bloque A). Compara marcador, parciales, reloj/secuencia de hechos, participantes, quintetos, tiros, acta completa
// (incluidos robos y valoración), órdenes, estados, regulación, sorteos y trayectoria; la primera discrepancia se informa con su ruta. NO excluye robos ni valoración. Las identidades/versiones y el bloque `familiarity` (nuevo en M18) no
// se comparan: son metadatos versionados. Lee `out/<dir>/lotes/*` y `plan/lotes-*.json`; no simula. Salida: `<out>/rapido/comparacion-neutral.json` y `.csv`.
// Uso: node scripts/m18-compare.js [--out=out/motor18b]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor18b'); const J = (p) => JSON.parse(readFileSync(p, 'utf8'));
const jl = (p) => readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const plans = { CONTROL17B: J(join(OUT, 'plan', 'lotes-CONTROL17B.json')), M18B: J(join(OUT, 'plan', 'lotes-M18B.json')) };
const SECTIONS = ['result', 'acta', 'presence', 'sequence', 'shots', 'tactics', 'direction', 'states', 'regulation'];
const INTEGRITY = ['steps', 'sporting_draws', 'events', 'trajectory_fp', 'trajectory_fp_mode'];
export function firstDiff(a, b, path = '') {
  if (a === b) return null; if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return { path, control: JSON.stringify(a)?.slice(0, 200) ?? null, m18: JSON.stringify(b)?.slice(0, 200) ?? null };
  if (Array.isArray(a) !== Array.isArray(b)) return { path, control: 'array/objeto', m18: 'objeto/array' };
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = firstDiff(a[k], b[k], `${path}/${k}`); if (d) return d; }
  return null;
}
function essentialOf(version, lot) {
  const dir = join(OUT, 'lotes', version, lot.batch_id); const idx = jl(join(dir, 'indice.jsonl')).filter((r) => r.type === 'attempt');
  return idx.map((a) => ({ attempt: a, rec: J(join(dir, 'intentos', a.match_id, a.attempt_id, 'esencial', `${a.match_id}--${a.attempt_id}.json`)) }));
}
const rows = []; const details = [];
for (const l0 of plans.CONTROL17B.lots) {
  const l1 = plans.M18B.lots.find((x) => x.block === 'A' && x.case === l0.case);
  if (!l1 || !existsSync(join(OUT, 'lotes', 'CONTROL17B', l0.batch_id, 'indice.jsonl')) || !existsSync(join(OUT, 'lotes', 'M18B', l1.batch_id, 'indice.jsonl'))) { rows.push({ case: l0.case, compared: false, reason: 'falta una de las dos ejecuciones (no se completa con cero)' }); continue; }
  const [a] = essentialOf('CONTROL17B', l0); const [b] = essentialOf('M18B', l1); const sec = {}; let first = null;
  for (const s of SECTIONS) { const d = firstDiff(a.rec[s], b.rec[s], `/${s}`); sec[s] = !d; first ??= d; }
  for (const s of INTEGRITY) { const d = firstDiff(a.rec.integrity[s], b.rec.integrity[s], `/integrity/${s}`); sec[`integrity.${s}`] = !d; first ??= d; }
  const dv = firstDiff({ valid: a.rec.validity.valid }, { valid: b.rec.validity.valid }, '/validity'); sec.validity = !dv; first ??= dv;
  rows.push({ case: l0.case, compared: true, neutrality: l1.neutral, control_attempt: a.attempt.attempt_id, m18_attempt: b.attempt.attempt_id, seed: a.rec.identity.seed, score_control: a.rec.result.court_score, score_m18: b.rec.result.court_score, events: a.rec.integrity.events, sporting_draws: a.rec.integrity.sporting_draws, equal: Object.values(sec).every(Boolean), sections: sec, first_difference: first,
    familiarity_m18: { enabled: b.rec.familiarity?.enabled ?? null, any_explicit: b.rec.familiarity?.anyExplicitKnowledge ?? null, quality_ops: b.rec.familiarity?.exposure?.operations?.quality ?? null, nonzero_delta_ops: Object.values(b.rec.familiarity?.applications?.quality ?? {}).reduce((s, x) => s + x.nonZeroDelta, 0) } });
  details.push({ case: l0.case, control_exec_ms: a.attempt.exec_ms ?? null, m18_exec_ms: b.attempt.exec_ms ?? null, control_bytes: a.attempt.bytes ?? null, m18_bytes: b.attempt.bytes ?? null });
}
mkdirSync(join(OUT, 'rapido'), { recursive: true });
const doc = { study: 'MOTOR18B-CIERRE-20261022', kind: 'comparacion-neutral', compares: 'CONTROL17B vs M18 · misma entrada deportiva y semilla · registros esenciales', sections: [...SECTIONS, ...INTEGRITY.map((x) => `integrity.${x}`), 'validity'], excluded: ['identidad y versiones', 'bloque familiarity (metadato nuevo de M18)'], pairs: rows, equal: rows.filter((r) => r.compared).length > 0 && rows.filter((r) => r.compared).every((r) => r.equal), compared: rows.filter((r) => r.compared).length, planned: plans.CONTROL17B.lots.length,
  note: 'Seis pares son una muestra muy pequeña: demuestran igualdad de ESTAS seis entradas, no una propiedad universal.' };
writeFileSync(join(OUT, 'rapido', 'comparacion-neutral.json'), JSON.stringify(doc, null, 1)); writeFileSync(join(OUT, 'rapido', 'coste-pares-neutrales.json'), JSON.stringify({ note: 'tiempos de ejecución de cada lado (muestra de seis; no se extrapola a cien o doscientos)', pairs: details }, null, 1));
writeFileSync(join(OUT, 'rapido', 'comparacion-neutral.csv'), `case,compared,neutrality,seed,score_control,score_m18,events,sporting_draws,equal,first_difference_path\n${rows.map((r) => [r.case, r.compared, r.neutrality ?? '', r.seed ?? '', r.score_control?.join('-') ?? '', r.score_m18?.join('-') ?? '', r.events ?? '', r.sporting_draws ?? '', r.equal ?? '', r.first_difference?.path ?? ''].join(',')).join('\n')}\n`);
console.log(JSON.stringify({ compared: doc.compared, planned: doc.planned, equal: doc.equal, pairs: rows.map((r) => [r.case, r.equal, r.first_difference?.path ?? null]) })); process.exit(doc.equal || !doc.compared ? 0 : 1);
