// Administración reglamentaria de MOTOR-02 (funciones puras): cupos de tiempos muertos y ventanas de oportunidad.
// Las cifras (cupos, duración, ventana final) viven en data/match/motor02-seed-extension.json; aquí solo hay lógica.
// Lectura propia del reglamento FIBA 2026 v1.1 NO contrastada con el PDF (no accesible desde el entorno): ver T01 y U-series
// en docs/tecnico/motor02.md.

// Bloque de cupo al que pertenece un periodo: primera mitad, segunda mitad o cada prórroga por separado.
export function timeoutBlock(period, rules) {
  if (period > rules.quarters) return `ot${period - rules.quarters}`;
  return period <= rules.quarters / 2 ? 'h1' : 'h2';
}

export const newTimeoutLedger = () => ({ used: {}, final: 0 });

// Cupo disponible para un equipo en este instante. `ledger`: { used: {bloque: n}, final: n en la ventana final }.
// Sin arrastre: cada bloque tiene su propio cupo. En los últimos 2 minutos del cuarto periodo, como máximo `maxInFinalWindow`.
export function timeoutAllowance(ledger, period, clockTenths, cfg, rules) {
  const block = timeoutBlock(period, rules);
  const quota = block === 'h1' ? cfg.firstHalf : block === 'h2' ? cfg.secondHalf : cfg.perOvertime;
  const used = ledger.used[block] ?? 0;
  let remaining = Math.max(0, quota - used);
  const inFinalWindow = period === rules.quarters && clockTenths <= cfg.finalWindowSeconds * 10;
  let effective = remaining;
  let reason = null;
  if (inFinalWindow) {
    const left = Math.max(0, cfg.maxInFinalWindow - ledger.final);
    if (left < effective) { effective = left; reason = `en los últimos ${cfg.finalWindowSeconds / 60} minutos solo se admiten ${cfg.maxInFinalWindow} tiempos muertos`; }
  }
  if (remaining === 0) reason = 'sin tiempos muertos en este bloque';
  return { block, quota, used, remaining, effective, inFinalWindow, reason };
}

export function chargeTimeout(ledger, period, clockTenths, cfg, rules) {
  const block = timeoutBlock(period, rules);
  ledger.used[block] = (ledger.used[block] ?? 0) + 1;
  if (period === rules.quarters && clockTenths <= cfg.finalWindowSeconds * 10) ledger.final += 1;
  return block;
}

// Ventanas de oportunidad reglamentaria por causa (qué equipos pueden pedir tiempo muerto y si hay oportunidad de sustitución).
// 'canasta recibida': canasta con reloj en marcha; solo el equipo que la recibe puede obtener tiempo muerto y no se abre
// oportunidad de sustitución por sí sola. Un tiempo muerto concedido abre sustitución para ambos equipos.
export const WINDOW_KINDS = {
  falta: { timeouts: 'ambos', subs: true },
  'tapón fuera': { timeouts: 'ambos', subs: true },
  'balón muerto': { timeouts: 'ambos', subs: true },
  'último libre': { timeouts: 'ambos', subs: true },
  'canasta con reloj parado': { timeouts: 'ambos', subs: true },
  'canasta recibida': { timeouts: 'receptor', subs: false },
  intervalo: { timeouts: 'ninguno', subs: true },
  'tiempo muerto': { timeouts: 'ninguno', subs: true },
};
