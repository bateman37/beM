// Estado propio por tramo (MOTOR-15 §9.2). Consulta construida desde el estado inicial y las MUESTRAS realmente conservadas en las fronteras de periodo (diagnostics.stateSamples); no interpola
// aleatoriedad, no actualiza estados al leer y no repite el estado final en todos los periodos. Energía con número y barra propios; Forma y momentos como categorías autorizadas; los valores
// internos solo en diagnóstico. El rival y el entrenador automático no obtienen estados privados.
import { allowed } from './facts.js';
import { momentCategory, CATEGORY_LABELS } from '../match/formulas.js';
import { SCOPE_TEXT } from '../match/visibility.js';

export const STATES_VIEW_VERSION = 'EPT-MOTOR15-R1';
const bar = (e) => { const n = Math.max(0, Math.min(10, Math.round(e / 10))); return '█'.repeat(n) + '░'.repeat(10 - n); };

export function ownStatesByPeriod(ix, team, ctx) {
  const res = ix.res; const samples = res.diagnostics?.stateSamples;
  const base = { version: STATES_VIEW_VERSION, team, audience: ctx.audience };
  if (!allowed('own', { team }, ctx)) return { ...base, available: false, reason: 'La energía, la Forma y los momentos son información propia o de diagnóstico: no se entregan a otra audiencia ni al entrenador automático rival.' };
  if (!Array.isArray(samples) || !samples.length) return { ...base, available: false, reason: 'Este archivo no conserva muestras de estado por tramo (anterior a MOTOR-15 o registro sin ellas): no se reconstruyen ni se repite el estado final.' };
  const profile = res.profile; const ids = res.input.teams[team].players.map((p) => p.id); const diag = ctx.audience === 'diagnostic';
  const form = Object.fromEntries(res.input.teams[team].players.map((p) => [p.id, p.state?.form]));
  const initial = Object.fromEntries(res.input.teams[team].players.map((p) => [p.id, p.state?.energy]));
  const cat = (kind, v) => CATEGORY_LABELS[kind][momentCategory(profile, v)];
  const rows = ids.map((id) => ({
    player: id, initialEnergy: initial[id], form: cat('forma', form[id]), ...(diag ? { formValue: form[id] } : {}),
    samples: samples.map((s) => { const x = s.players[id]; if (!x) return null; return {
      n: s.n, kind: s.kind, period: s.period, afterEvent: s.seq, sportSeconds: s.sportSeconds, onCourt: x.on, available: x.av, energy: { value: Math.round(x.e), bar: bar(x.e) },
      moments: Object.fromEntries(Object.entries(x.m).map(([k, [v, until, proj]]) => [k, { scope: SCOPE_TEXT[k], category: cat('momento', proj), ...(diag ? { committed: v, updatedUntilSeconds: until, projection: proj } : {}) }])),
    }; }).filter(Boolean),
  }));
  const teamSeries = samples.map((s) => { const [v, until, proj] = s.T[team]; return { n: s.n, kind: s.kind, period: s.period, category: CATEGORY_LABELS.equipo[momentCategory(profile, proj)], ...(diag ? { committed: v, updatedUntilSeconds: until, projection: proj } : {}) }; });
  return { ...base, available: true, boundaries: samples.map((s) => ({ n: s.n, kind: s.kind, period: s.period, afterEvent: s.seq, sportSeconds: s.sportSeconds })), rows, team: teamSeries,
    note: 'Muestras en las fronteras de periodo (inicio y final) realmente conservadas; no hay muestra de un instante intermedio y no se interpola. Los momentos son la proyección determinista de atenuación sobre el último valor comprometido (sin sorteo al leer). Forma no cambia durante el encuentro.' };
}
