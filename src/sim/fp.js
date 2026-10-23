// Huella de 64 bits sobre texto (dos carriles de 32 bits tipo FNV/Murmur con Math.imul; sin dependencias, válida en navegador y Node). No es criptográfica: identifica contenido.
export function fpString(s) {
  let h1 = 0x811c9dc5 ^ s.length; let h2 = 0x9e3779b9;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 0x01000193); h2 = Math.imul(h2 ^ c, 0x85ebca6b); h2 ^= h2 >>> 13; h1 ^= h1 >>> 15; }
  h1 = Math.imul(h1 ^ (h2 >>> 16), 0x85ebca6b); h2 = Math.imul(h2 ^ (h1 >>> 13), 0xc2b2ae35);
  return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'));
}

// SHA-256 en JavaScript puro (sin dependencias; válido en Node y navegador). Sirve para detectar un guardado o un paquete alterado; no sustituye a un control de acceso.
const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
export function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text); const len = bytes.length; const total = (((len + 9 + 63) >> 6) << 6); const buf = new Uint8Array(total); buf.set(bytes); buf[len] = 0x80;
  const dv = new DataView(buf.buffer); dv.setUint32(total - 8, Math.floor((len * 8) / 4294967296)); dv.setUint32(total - 4, (len * 8) >>> 0);
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]); const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3); const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) { const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25); const ch = (e & f) ^ (~e & g); const t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0; const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22); const mj = (a & b) ^ (a & c) ^ (b & c); const t2 = (S0 + mj) >>> 0; h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0; }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0; H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return Array.from(H, (x) => x.toString(16).padStart(8, '0')).join('');
}
// JSON canónico (claves ordenadas): la misma estructura produce el mismo texto, con independencia del orden de inserción.
// Misma salida que `JSON.stringify` con claves ordenadas (las propiedades `undefined` se omiten y en listas figuran como `null`), sin crear objetos intermedios: se llama una vez por encuentro.
// Las claves se citan una sola vez (texto JSON de cada clave memoizado) y los números finitos se escriben con `String` (idéntico a JSON.stringify para números finitos, incluido -0 → «0»).
const quoted = new Map();
const qk = (k) => { let q = quoted.get(k); if (q === undefined) { q = JSON.stringify(k); quoted.set(k, q); } return q; };
export function canonical(x) {
  if (x === null) return 'null';
  switch (typeof x) {
    case 'number': return Number.isFinite(x) ? String(x) : 'null';
    case 'string': return JSON.stringify(x);
    case 'boolean': return x ? 'true' : 'false';
    case 'object': break;
    default: return JSON.stringify(x) ?? 'null';
  }
  if (typeof x.toJSON === 'function') return canonical(x.toJSON());
  if (Array.isArray(x)) { let s = '['; for (let i = 0; i < x.length; i++) { if (i) s += ','; const v = x[i]; s += v === undefined || typeof v === 'function' ? 'null' : canonical(v); } return `${s}]`; }
  const ks = Object.keys(x).sort(); let s = '{'; let first = true;
  for (let i = 0; i < ks.length; i++) { const k = ks[i]; const v = x[k]; if (v === undefined || typeof v === 'function') continue; if (!first) s += ','; first = false; s += `${qk(k)}:${canonical(v)}`; }
  return `${s}}`;
}
const canonicalReference = (x) => JSON.stringify(x, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((kk) => [kk, v[kk]])) : v));
export { canonicalReference };
export const fpCanonical = (x) => fpString(canonical(x));
