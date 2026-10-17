// Huellas con node:crypto (solo servidor/CLI): el SHA-256 en JS puro de población/hash.js es correcto pero lento para MiB de contenido. Mismo resultado para el mismo texto.
import { createHash } from 'node:crypto';
import { canonicalJson } from '../population/hash.js';
export const sha256 = (data) => createHash('sha256').update(data).digest('hex');
export const fpOf = (value, n = 16) => sha256(canonicalJson(value)).slice(0, n);
export { canonicalJson };
