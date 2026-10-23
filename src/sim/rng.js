// Azar de SIM: xoshiro128** sembrado con splitmix32. Un único flujo por encuentro; consultar/avanzar por fronteras no altera su consumo.
// Todas las distribuciones se implementan aquí para que la huella dependa solo de la semilla y de la secuencia de llamadas deportivas.
const rotl = (x, k) => ((x << k) | (x >>> (32 - k))) >>> 0;
function splitmix32(a) { return () => { a = (a + 0x9e3779b9) >>> 0; let t = a ^ (a >>> 16); t = Math.imul(t, 0x21f0aaad) >>> 0; t ^= t >>> 15; t = Math.imul(t, 0x735a2d97) >>> 0; return (t ^ (t >>> 15)) >>> 0; }; }

export class Rng {
  constructor(seed) {
    const sm = splitmix32((Number(seed) >>> 0) || 1);
    this.s = [sm(), sm(), sm(), sm()]; this.draws = 0;
  }
  u32() {
    const s = this.s; const r = Math.imul(rotl(Math.imul(s[1], 5) >>> 0, 7), 9) >>> 0; const t = (s[1] << 9) >>> 0;
    s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t; s[3] = rotl(s[3], 11);
    this.draws += 1; return r;
  }
  next() { return this.u32() / 4294967296; }
  bernoulli(p) { return p > 0 && (p >= 1 || this.next() < p); }
  // Binomial exacta por ensayos (los n de SIM son pequeños: intentos por tramo).
  binomial(n, p) { if (n <= 0 || p <= 0) return 0; if (p >= 1) return n; let k = 0; for (let i = 0; i < n; i++) if (this.next() < p) k++; return k; }
  // Multinomial por binomiales condicionadas secuenciales. `probs` no necesita sumar exactamente 1 (se normaliza); devuelve conteos en el mismo orden.
  multinomial(n, probs) {
    const out = new Array(probs.length).fill(0); let rest = n; let tot = 0; for (const p of probs) tot += p;
    for (let i = 0; i < probs.length - 1 && rest > 0; i++) { const q = tot > 0 ? Math.min(1, probs[i] / tot) : 0; const k = this.binomial(rest, q); out[i] = k; rest -= k; tot -= probs[i]; }
    if (rest > 0) out[probs.length - 1] += rest; return out;
  }
  // Redondeo aleatorio sin sesgo: E[roundUnbiased(x)] = x.
  roundUnbiased(x) { const f = Math.floor(x); return f + (this.next() < x - f ? 1 : 0); }
  // Índice ponderado (pesos ≥ 0). Si todos son 0, devuelve -1 sin consumir azar.
  weighted(ws) { let tot = 0; for (let i = 0; i < ws.length; i++) tot += ws[i]; if (!(tot > 0)) return -1; let x = this.next() * tot; for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x < 0 && ws[i] > 0) return i; } for (let i = ws.length - 1; i >= 0; i--) if (ws[i] > 0) return i; return -1; }
  // Igual que `weighted` sobre la propiedad `key` de cada elemento, sin crear arreglos intermedios (misma aritmética y orden).
  weightedBy(arr, key) { let tot = 0; for (let i = 0; i < arr.length; i++) tot += arr[i][key]; if (!(tot > 0)) return -1; let x = this.next() * tot; for (let i = 0; i < arr.length; i++) { x -= arr[i][key]; if (x < 0 && arr[i][key] > 0) return i; } for (let i = arr.length - 1; i >= 0; i--) if (arr[i][key] > 0) return i; return -1; }
  normal() { let u = 0; while (u === 0) u = this.next(); const v = this.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
}

// Derivación estable de semillas de caso: FNV-1a de 32 bits sobre «maestra|clave». Documentado en el contrato de agenda.
export function deriveSeed(master, key) {
  let h = 0x811c9dc5; const s = `${master}|${key}`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0 || 1;
}
