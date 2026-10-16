// Funciones matemáticas comunes del perfil (apartado 5.4 del encargo MOTOR-01).

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const sigmoid = (z) => 1 / (1 + Math.exp(-z));
export const logit = (p) => Math.log(p / (1 - p));
// a(x) = (x-1)/29: capacidad 1-30 a [0,1].
export const a01 = (x) => (x - 1) / 29;

// Interpolación lineal por nodos [[x,y],...] ordenados por x.
export function interpolate(nodes, x) {
  if (x <= nodes[0][0]) return nodes[0][1];
  for (let i = 1; i < nodes.length; i++) {
    const [x1, y1] = nodes[i];
    if (x <= x1) {
      const [x0, y0] = nodes[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return nodes[nodes.length - 1][1];
}

// Distribución triangular [min, moda, max] por inversión, truncada opcionalmente a <= hi.
// Devuelve { value, uUsed } para dejar rastro; u es un uniforme [0,1).
export function triangularFromU(u, [min, mode, max], hi = Infinity) {
  const cdf = (v) => {
    if (v <= min) return 0;
    if (v >= max) return 1;
    if (v <= mode) return ((v - min) * (v - min)) / ((max - min) * (mode - min || 1e-12));
    return 1 - ((max - v) * (max - v)) / ((max - min) * (max - mode || 1e-12));
  };
  const top = hi >= max ? 1 : cdf(hi);
  const uu = u * top;
  const c = (mode - min) / (max - min);
  let value;
  if (uu < c) value = min + Math.sqrt(uu * (max - min) * (mode - min));
  else value = max - Math.sqrt((1 - uu) * (max - min) * (max - mode));
  return value;
}

export const round = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;
