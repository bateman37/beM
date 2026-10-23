// Copia profunda con la semántica EXACTA de `JSON.parse(JSON.stringify(x))` para datos planos (objetos simples, listas, números, textos, booleanos y null), sin pasar por texto (SIM-MOTOR-04B §9.2 A).
// Diferencias con una copia ingenua que se replican aquí: los números no finitos pasan a `null`, `-0` pasa a `0`, las propiedades `undefined`/funciones se omiten en objetos y pasan a `null` en listas.
// Cualquier valor no plano (toJSON, Map, Date, BigInt…) o la clave `__proto__` usan el camino de texto original, de modo que el resultado es siempre el que daría JSON.
const viaJson = (x) => JSON.parse(JSON.stringify(x));
function walk(v) {
  if (v === null) return null;
  switch (typeof v) {
    case 'number': return Number.isFinite(v) ? (v === 0 ? 0 : v) : null;
    case 'string': case 'boolean': return v;
    case 'object': {
      if (typeof v.toJSON === 'function') throw FALLBACK;
      if (Array.isArray(v)) { const n = v.length; const out = new Array(n); for (let i = 0; i < n; i++) { const x = v[i]; out[i] = x === undefined || typeof x === 'function' || typeof x === 'symbol' ? null : walk(x); } return out; }
      const proto = Object.getPrototypeOf(v); if (proto !== Object.prototype && proto !== null) throw FALLBACK;
      const out = {}; for (const k of Object.keys(v)) { if (k === '__proto__') throw FALLBACK; const x = v[k]; if (x === undefined || typeof x === 'function' || typeof x === 'symbol') continue; out[k] = walk(x); } return out;
    }
    default: throw FALLBACK; // bigint u otros: JSON decide (lanza o convierte)
  }
}
const FALLBACK = new Error('fallback');
export function jsonClone(x) {
  if (x === undefined || typeof x === 'function' || typeof x === 'symbol') return viaJson(x); // misma excepción que el camino de texto
  try { return walk(x); } catch (e) { if (e === FALLBACK) return viaJson(x); throw e; }
}
