// Fuente de azar deportiva reproducible: xorshift32 (perfil SEM-MOTOR01, apartado rng).
// Operaciones enteras de 32 bits sin signo; salida = estado / 2^32.
// Registra secuencia, propósito y valor de cada sorteo. No usa Math.random ni fecha.

export function createRng(seed, config) {
  const divisor = config.outputDivisor;
  let x = (Number(seed) >>> 0);
  let replaced = false;
  if (x === 0) { x = config.zeroSeedReplacement >>> 0; replaced = true; }
  let n = 0;
  let buffer = [];
  const rng = {
    algorithm: config.algorithm,
    initialSeed: Number(seed) >>> 0,
    zeroSeedReplaced: replaced,
    get count() { return n; },
    // Sorteo uniforme en [0,1). `purpose` queda en el registro.
    next(purpose) {
      x ^= (x << 13); x >>>= 0;
      x ^= (x >>> 17); x >>>= 0;
      x ^= (x << 5); x >>>= 0;
      n += 1;
      const u = x / divisor;
      buffer.push({ n, purpose, u });
      return u;
    },
    // Recoge (y vacía) los sorteos hechos desde la última recogida.
    drain() { const b = buffer; buffer = []; return b; },
    state() { return x >>> 0; },
    // MOTOR-14: restaura la posición exacta del generador (continuación de un guardado). No vuelve a sortear.
    // `pending` son los sorteos ya hechos y aún no recogidos por un hecho (se asocian al siguiente acontecimiento).
    pending() { return buffer.map((b) => ({ ...b })); },
    restore(s) { x = s.state >>> 0; n = s.count; buffer = (s.pending ?? []).map((b) => ({ ...b })); },
  };
  return rng;
}
