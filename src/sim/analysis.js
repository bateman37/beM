// Agregados COMPACTOS del nivel Simulada / Análisis (SIM-MOTOR-03 · C03-07/C03-08), calculados una sola vez desde los hechos ya generados al construir el resultado: no añaden acciones al generador ni retienen
// la secuencia completa. Un lector que no encuentra ni hechos ni estos agregados devuelve «no conservado» con su motivo; nunca un cero.
export const ANALYSIS_SCHEMA = 'beM-sim-analysis/1';
const r1 = (x) => Math.round(x * 10) / 10; const r3 = (x) => Math.round(x * 1000) / 1000;
export const ABSENT_ZERO = Object.freeze({ absent: 'denominador_cero' });
// Cociente con denominador cero tipado (nunca Infinity, NaN ni un cero inventado).
export const ratio = (num, den, mult = 1, digits = 3) => (den > 0 ? Math.round((mult * num / den) * 10 ** digits) / 10 ** digits : { ...ABSENT_ZERO });
export const isAbsent = (v) => v != null && typeof v === 'object' && 'absent' in v;

const defKey = (s, k) => `${s.org?.[k] ?? '—'}|${s.plans?.[k]?.coverage ?? '—'}|${s.plans?.[k]?.pressureHeight ?? '—'}`;
// Defensa por organización/cobertura/altura EFECTIVAS (tramo a tramo). Equipo defensor k; atacante = el otro. Una finalización SIM (tiro, falta de tiro y serie ligada, una vez por identidad `fin`) y los puntos del
// rival se atribuyen a la configuración vigente en el tramo del hecho. Las series de BONUS no tienen identidad de finalización: su categoría real es `oppBonusSeries` / `oppBonusPts` (no se mezclan en finalizaciones).
// `segments`: tramos con { n, start, end, org, plans }; `events`: hechos con `sg` (índice de tramo), `t` ≤ T.
export function defenseTable(segments, events, T = Infinity) {
  const by = new Map(segments.map((s) => [s.n, s]));
  return [0, 1].map((k) => {
    const rows = new Map();
    for (const s of segments) { const d = Math.max(0, Math.min(s.end, T) - s.start); const key = defKey(s, k); let r = rows.get(key); if (!r) { r = { org: s.org?.[k] ?? null, coverage: s.plans?.[k]?.coverage ?? null, pressureHeight: s.plans?.[k]?.pressureHeight ?? null, sec: 0, oppPts: 0, oppBonusPts: 0, fins: new Set(), oppBonusSeries: 0 }; rows.set(key, r); } r.sec += d; }
    for (const e of events) {
      if (e.t > T + 1e-9) break; const atk = e.ty === 'shootfoul' ? 1 - e.tm : e.tm; if (atk !== 1 - k) continue; if (e.ty !== 'shot' && e.ty !== 'ft' && e.ty !== 'shootfoul') continue;
      const s = by.get(e.sg); if (!s) continue; const row = rows.get(defKey(s, k)); if (!row) continue;
      if (e.ty === 'shot') { if (e.made) row.oppPts += e.pts; if (e.fin != null) row.fins.add(e.fin); }
      else if (e.ty === 'shootfoul') { if (e.fin != null) row.fins.add(e.fin); }
      else { if (e.made) { row.oppPts += 1; if (e.cause === 'bonus') row.oppBonusPts += 1; } if (e.fin != null) row.fins.add(e.fin); if (e.cause === 'bonus' && e.k === 1) row.oppBonusSeries += 1; }
    }
    return [...rows.values()].map((r) => ({ org: r.org, coverage: r.coverage, pressureHeight: r.pressureHeight, sec: Math.round(r.sec * 1000) / 1000, min: r1(r.sec / 60), oppPts: r.oppPts, oppBonusPts: r.oppBonusPts, oppFinalizations: r.fins.size, oppBonusSeries: r.oppBonusSeries, oppPtsPerFinalizationSim: ratio(r.oppPts - r.oppBonusPts, r.fins.size) }));
  });
}

// Agregados de Análisis desde los hechos del prefijo `evs` (≤ T). `audience`/`team` filtran lo que no es público (órdenes).
export function buildAnalysis({ segs, evs, T, audience, team }) {
  const part = [{}, {}]; const finBy = {}; const orders = [];
  const bump = (o, a, b) => { const x = (o[a] ??= {}); x[b] = (x[b] ?? 0) + 1; };
  for (const e of evs) {
    if (e.ty === 'shot') {
      if (e.fin != null) (finBy[e.pl] ??= new Set()).add(e.fin);
      if (e.play) { const p = (part[e.tm][e.play] ??= { shooters: {}, directors: {}, screeners: {} }); p.shooters[e.pl] = (p.shooters[e.pl] ?? 0) + 1; if (e.dir) p.directors[e.dir] = (p.directors[e.dir] ?? 0) + 1; if (e.scr) p.screeners[e.scr] = (p.screeners[e.scr] ?? 0) + 1; }
    } else if (e.ty === 'shootfoul') { if (e.fin != null && e.victim) (finBy[e.victim] ??= new Set()).add(e.fin); }
    else if (e.ty === 'plan' && audience !== 'public' && (audience === 'diagnostic' || e.tm === team)) orders.push({ t: e.t, team: e.tm, change: e.change, order: e.order, source: e.source ?? 'manual' });
  }
  void bump;
  return { schema: ANALYSIS_SCHEMA, horizon: r1(T), defense: defenseTable(segs, evs, T), participation: part, playerFinalizations: Object.fromEntries(Object.entries(finBy).map(([id, s]) => [id, s.size])), orders: audience === 'public' ? { status: 'sin_autorizacion', reason: 'la audiencia pública no ve las órdenes aplicadas' } : orders, note: 'agregados compactos calculados desde los hechos generados; no hay secuencia completa' };
}
void r3;
