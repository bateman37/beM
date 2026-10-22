// Tarjeta «Polivalencia y aprendizaje» del panel (MOTOR-18B §9.3): modelo efectivo del perfil activo, anclajes, unidad y comparación P8/P16/P24 con la misma dosis. Solo lectura: las filas
// editables viven en la mesa «¿Cómo aprenden y olvidan los jugadores?»; aquí se explica qué consume el aprendizaje y se separa del efecto deportivo del conocimiento.
import { h, table, fmt } from '../dom.js';
import { playerFactor, playerFactorModel, normalizeLevel } from '../../knowledge/model.js';
import { learnClosed } from '../../learning/core.js';

// Ejemplo fijo y reproducible (mismo que L18B-02): K=12, peak=12, 1 hora equivalente al objetivo, enseñanza y competencia 16, relacionados en 12, tasa táctica.
export function polyComparison(params, levels = [8, 16, 24]) {
  const f = params.learning.factors; const n16 = normalizeLevel(16, params); const n12 = normalizeLevel(12, params);
  const teaching = f.teaching.base + f.teaching.slope * n16; const content = f.content.base + f.content.slope * n16; const transfer = f.transfer.base + f.transfer.slope * n12;
  return levels.map((P) => {
    const pf = playerFactor(P, params); const F = pf.factor * teaching * content * transfer;
    const r = learnClosed({ level: 12, peak: 12, dose: 1, rate: params.learning.rates.tactic, F, params });
    return { P, factor: pf.factor, G: r.G, after: r.level, gain: r.level - 12, model: pf.model };
  });
}
export function polyCard(effective) {
  const P = effective?.familiarity; if (!P) return null;
  const model = playerFactorModel(P.learning.factors.player);
  const head = h('h3', { style: 'margin-top:0' }, 'Polivalencia y aprendizaje (rasgo de desarrollo)');
  const why = h('p', { class: 'small muted' }, 'La Polivalencia (1–30) no es una de las 32 capacidades y no cambia el partido: solo multiplica la dosis eficaz de aprendizaje entre partidos (sesiones y encuentros terminados). No altera el desuso, el suelo ni el techo de 30, y es distinta del efecto deportivo del conocimiento.');
  if (model === 'linear') {
    const f = P.learning.factors.player; const cmp = polyComparison(P);
    return h('div', { class: 'card', id: 'poly-card' }, head, h('p', { class: 'pill warn', id: 'poly-model' }, `Modelo efectivo: lineal de MOTOR-18 (${f.base} + ${f.slope}·n(P)). No es la curva de MOTOR-18B; no se convierte en silencio.`), why, cmpTable(cmp));
  }
  const pts = P.learning.factors.player.points; const cmp = polyComparison(P);
  return h('div', { class: 'card', id: 'poly-card' }, head, h('p', { class: 'pill ok', id: 'poly-model' }, `Modelo efectivo: curva lineal por tramos, ${pts.length} anclajes (MOTOR-18B). Perfil ${effective.effectiveId?.split('+').slice(-2).join('+') ?? ''}`), why,
    table(['Polivalencia (nivel)', 'Factor sobre la dosis eficaz', 'Lectura orientativa'], pts.map((p) => [String(p.level), fmt(p.factor, 2), { 1: 'aprende muy despacio', 8: 'le cuesta aprender responsabilidades nuevas', 16: 'referencia de aprendizaje', 24: 'aprende muy rápido', 30: 'facilidad excepcional' }[p.level] ?? '']), { numeric: [0, 1] }),
    h('p', { class: 'small muted' }, 'Unidad: multiplicador (×) sobre la dosis eficaz en horas equivalentes. Entre dos anclajes el factor se interpola linealmente; las lecturas son orientativas, no bandas.'), cmpTable(cmp));
}
function cmpTable(cmp) {
  return h('div', {}, h('h4', {}, 'Comparación con la misma dosis (1 hora equivalente, conocimiento 12, enseñanza y competencia 16)'),
    table(['Polivalencia', 'Factor del jugador', 'G (dosis × factores)', 'Nivel tras 1 h-eq', 'Ganancia'], cmp.map((c) => [String(c.P), fmt(c.factor, 4), fmt(c.G, 4), fmt(c.after, 4), fmt(c.gain, 4)]), { numeric: [0, 1, 2, 3, 4] }),
    h('p', { class: 'small muted' }, 'Aprendizaje, no deporte: la ganancia absoluta depende además de la cercanía a 30 y del reaprendizaje; no es un calendario de entrenamiento.'));
}
