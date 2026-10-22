// Huella de 64 bits sobre texto (dos carriles de 32 bits tipo FNV/Murmur con Math.imul; sin dependencias, válida en navegador y Node). No es criptográfica: identifica contenido.
export function fpString(s) {
  let h1 = 0x811c9dc5 ^ s.length; let h2 = 0x9e3779b9;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 0x01000193); h2 = Math.imul(h2 ^ c, 0x85ebca6b); h2 ^= h2 >>> 13; h1 ^= h1 >>> 15; }
  h1 = Math.imul(h1 ^ (h2 >>> 16), 0x85ebca6b); h2 = Math.imul(h2 ^ (h1 >>> 13), 0xc2b2ae35);
  return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'));
}
