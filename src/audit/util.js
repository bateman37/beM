// Utilidades puras de la auditoría (MOTOR-13): lectura de JSONL por bloques, huellas, estadística descriptiva y redondeo. Sin DOM; sin RNG; no tocan ningún partido.
import { createHash } from 'node:crypto';
export { mean, stdSample, describe, quantileSorted } from '../batch/util.js';

export const sha = (x) => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex');
// FNV-1a de 32 bits: selección determinista y ciega al resultado (no usa ningún dato de acierto).
export function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
export const r4 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1e4) / 1e4);
export const r6 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1e6) / 1e6);
export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const logit = (p) => Math.log(p / (1 - p));
export const sigmoid = (z) => 1 / (1 + Math.exp(-z));

// Itera las líneas de un Buffer UTF-8 (un JSON por línea) sin construir una cadena gigante; una línea final truncada se ignora y se cuenta.
export function* jsonlRecords(buf, stat = { bad: 0 }) {
  let start = 0; const n = buf.length;
  while (start < n) {
    let end = buf.indexOf(10, start); if (end < 0) end = n;
    if (end > start) { const line = buf.toString('utf8', start, end); if (line.trim()) { try { yield JSON.parse(line); } catch { stat.bad += 1; } } }
    start = end + 1;
  }
}
export const inc = (m, k, d = 1) => { m[k] = (m[k] ?? 0) + d; };
export const ensure = (m, k, mk) => { if (!(k in m)) m[k] = mk(); return m[k]; };
