// Utilidades puras de MOTOR-12 (sin DOM ni sistema de ficheros): CSV UTF-8 RFC 4180, JSONL, estadística de distribuciones y huellas. Mismo comportamiento en Node y en el navegador.
import { canonicalJson, fingerprint, sha256Hex } from '../population/hash.js';
export { canonicalJson, fingerprint, sha256Hex };

// Celda CSV: vacío para null/undefined/no finito; números con precisión completa (el redondeo es de presentación, no del dato); entrecomillado ante coma, comilla, salto o espacio inicial/final.
export function csvCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\r\n]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export const csvLine = (cells) => `${cells.map(csvCell).join(',')}\r\n`;
export const toCsv = (headers, rows) => csvLine(headers) + rows.map((r) => csvLine(r)).join('');
// Lee un CSV completo (registros lógicos: una celda entrecomillada puede contener saltos de línea). Devuelve { header, rows } con filas como arrays de texto.
export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false; let i = 0; const n = text.length; let any = false;
  while (i < n) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i += 2; continue; } q = false; i += 1; continue; }
      cell += c; i += 1; continue;
    }
    if (c === '"') { q = true; any = true; i += 1; continue; }
    if (c === ',') { row.push(cell); cell = ''; any = true; i += 1; continue; }
    if (c === '\r') { i += 1; continue; }
    if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; any = false; i += 1; continue; }
    cell += c; any = true; i += 1;
  }
  if (q) throw new Error('CSV mal formado: comilla sin cerrar');
  if (any || cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift() ?? [];
  for (const r of rows) if (r.length !== header.length) throw new Error(`CSV mal formado: una fila tiene ${r.length} celdas y la cabecera ${header.length}`);
  return { header, rows };
}
export const rowsAsObjects = ({ header, rows }) => rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
export const num = (s) => (s === '' || s === undefined || s === null ? null : Number(s));

// JSON nunca lleva NaN/Infinity: se convierten en null (con el estado en otro campo cuando importa).
export const safeJson = (v) => JSON.stringify(v, (_k, x) => (typeof x === 'number' && !Number.isFinite(x) ? null : x));
export const jsonl = (obj) => `${safeJson(obj)}\n`;

// ---------- estadística de distribuciones (convención documentada en `batch.quantileMethod` / `batch.stdMethod`)
export const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
// Desviación MUESTRAL (n−1): para n < 2 no es calculable (null, no 0).
export function stdSample(xs) { const n = xs.length; if (n < 2) return null; const m = mean(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1)); }
// Cuantil interpolado: índice (n−1)·p, interpolación lineal entre posiciones contiguas, p ∈ [0, 1]. `sorted` debe estar ordenado ascendentemente.
export function quantileSorted(sorted, p) {
  const n = sorted.length; if (!n) return null;
  if (!(p >= 0 && p <= 1)) throw new Error('p fuera de [0,1]');
  const idx = (n - 1) * p; const lo = Math.floor(idx); const hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
export function describe(values) {
  const xs = values.filter((v) => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b); const n = xs.length;
  return { n, mean: mean(xs), sd: stdSample(xs), min: n ? xs[0] : null, p05: quantileSorted(xs, 0.05), p25: quantileSorted(xs, 0.25), p50: quantileSorted(xs, 0.5), p75: quantileSorted(xs, 0.75), p95: quantileSorted(xs, 0.95), max: n ? xs[n - 1] : null };
}
export const pad = (n, w = 6) => String(n).padStart(w, '0');
export const iso = (ms) => new Date(ms).toISOString();
