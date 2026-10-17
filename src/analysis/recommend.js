// Recomendaciones condicionadas (MOTOR-10 §17.5): un repertorio declarativo mínimo sustentado en consultas y alternativas ya existentes.
// Cada recomendación declara observación, muestra, condición y coste/alternativa. No se aplica ningún cambio ni se promete un efecto. Sin evidencia, no hay recomendación.
import { allowed } from './facts.js';
import { FAMILY_LABEL } from './offense.js';

const fill = (tpl, o) => tpl.replace(/\{(\w+)\}/g, (_, k) => o[k]);

// REC10-01 · salida negada: ≥ N ejecuciones frente a la misma respuesta, ≥ D negaciones de la salida prevista y ≥ A oportunidades de alternativa registradas y AUTORIZADAS
// para esta audiencia. Si la alternativa solo existe en diagnóstico, la recomendación ordinaria no puede utilizarla.
function rec01(ix, team, ctx, p) {
  const cfg = p.recommendations['REC10-01']; if (!cfg?.enabled) return [];
  const authorized = allowed('own', { team }, ctx); // la alternativa del libro (libro, prioridad) es información propia
  const groups = new Map();
  for (const e of ix.events) {
    if (e.type !== 'attempt' || e.team !== team) continue; const it = e.intent ?? {}; const resp = it.defensa?.receptor; if (!resp || !it.familia) continue;
    const k = `${it.familia}|${resp}`; const g = groups.get(k) ?? { family: it.familia, response: resp, executions: 0, denials: 0, alternatives: 0, ids: [] }; g.executions += 1; g.ids.push(e.id);
    if (it.negacionPrevia) { g.denials += 1; if (it.corte || it.continuacion) g.alternatives += 1; }
    groups.set(k, g);
  }
  const out = [];
  // MOTOR-15 §9.3: sin permiso o sin exposición suficiente se muestra la INSUFICIENCIA de esta regla (con lo observado y lo exigido), no una recomendación genérica ni silencio.
  if (!authorized) return [{ id: 'REC10-01', team, title: cfg.title, status: 'no disponible para esta audiencia', reason: 'La alternativa registrada (libro y prioridad) es información propia o diagnóstica: la recomendación ordinaria de salida negada no puede utilizarla.', evidence: [] }];
  const best = [...groups.values()].sort((a, b) => b.executions - a.executions || b.denials - a.denials || b.alternatives - a.alternatives)[0] ?? null;
  const qualifies = (g) => g.executions >= cfg.minExecutions && g.denials >= cfg.minDenials && g.alternatives >= cfg.minAlternatives;
  if (![...groups.values()].some(qualifies)) {
    const missing = best ? [['ejecuciones frente a la misma respuesta', best.executions, cfg.minExecutions], ['negaciones de la salida prevista', best.denials, cfg.minDenials], ['oportunidades de alternativa registradas y autorizadas', best.alternatives, cfg.minAlternatives]].filter(([, o, m]) => o < m) : [];
    return [{ id: 'REC10-01', team, title: cfg.title, status: 'insuficiente', reason: best ? `Mejor caso observado: ${FAMILY_LABEL[best.family] ?? best.family} frente a «${best.response}» (${best.executions} ejecuciones, ${best.denials} negaciones, ${best.alternatives} alternativas). Falta: ${missing.map(([w, o, m]) => `${w} (${o} de ${m})`).join('; ')}.` : 'No hay ejecuciones con una respuesta defensiva registrada sobre la que evaluar la salida negada.', sample: best ? { executions: best.executions, denials: best.denials, alternatives: best.alternatives } : null, evidence: best?.ids ?? [] }];
  }
  for (const g of groups.values()) {
    if (!qualifies(g)) continue;
    out.push({ id: 'REC10-01', team, title: cfg.title, status: 'condicionada', observation: `${FAMILY_LABEL[g.family] ?? g.family}: ${g.executions} ejecuciones frente a «${g.response}»`,
      text: fill(cfg.text, { denials: g.denials, executions: g.executions, alternatives: g.alternatives }), sample: { executions: g.executions, denials: g.denials, alternatives: g.alternatives }, condition: `≥ ${cfg.minExecutions} ejecuciones, ≥ ${cfg.minDenials} negaciones y ≥ ${cfg.minAlternatives} alternativas registradas`,
      cost: 'Una variante distinta cambia la concesión o el riesgo conocido de esa ficha; no se aplica automáticamente ni se promete que funcione.', evidence: g.ids, query: { view: 'executions', team, filters: { family: g.family } } });
  }
  return out;
}

// REC10-02 · revisar balance: ≥ N fallos propios con encargo de carga identificado y ≥ T transiciones rivales enlazadas a esos fallos. Describe coexistencia.
function rec02(ix, team, ctx, p) {
  const cfg = p.recommendations['REC10-02']; if (!cfg?.enabled) return [];
  if (!allowed('own', { team }, ctx)) return [{ id: 'REC10-02', team, title: cfg.title, status: 'no disponible para esta audiencia', reason: 'El encargo de carga al rebote es información propia o diagnóstica: la revisión de carga/balance no puede utilizarla.', evidence: [] }];
  let misses = 0; let transitions = 0; let orebs = 0; const ids = [];
  for (const s of ix.shots) {
    if (s.team !== team || !s.valid || s.pub.made) continue;
    const rb = ix.events.find((e) => e.type === 'rebound' && (e.stats ?? []).some((x) => x.k === 'reb' && x.of === s.id)); if (!rb) continue;
    const enc = rb.effects?.encargos; if (!enc?.cargan?.length) continue;
    misses += 1; ids.push(s.id); const stat = rb.stats.find((x) => x.k === 'reb');
    if (stat.off) orebs += 1; else {
      const next = ix.possessions.find((q) => q.startSeq > rb.seq && q.team !== team && q.origin === 'rebote'); const first = next?.attempts.find((e) => e.intent?.procedencia || e.intent?.familia);
      if (first?.intent?.contexto === 'transición') transitions += 1;
    }
  }
  if (misses < cfg.minMisses || transitions < cfg.minTransitions) {
    const missing = [['fallos propios con encargo de carga identificado', misses, cfg.minMisses], ['transiciones rivales enlazadas a esos fallos', transitions, cfg.minTransitions]].filter(([, o, m]) => o < m);
    return [{ id: 'REC10-02', team, title: cfg.title, status: 'insuficiente', reason: `Observado: ${misses} fallos con encargo de carga y ${transitions} transiciones rivales enlazadas (${orebs} rebotes ofensivos en ese universo). Falta: ${missing.map(([w, o, m]) => `${w} (${o} de ${m})`).join('; ')}.`, sample: { misses, transitions, orebs }, evidence: ids }];
  }
  return [{ id: 'REC10-02', team, title: cfg.title, status: 'condicionada', observation: `${misses} fallos con encargo de carga y ${transitions} transiciones rivales enlazadas`, text: fill(cfg.text, { misses, transitions, orebs }),
    sample: { misses, transitions, orebs }, condition: `≥ ${cfg.minMisses} fallos con encargo de carga y ≥ ${cfg.minTransitions} transiciones rivales enlazadas`, cost: 'Reducir la carga puede costar rebotes ofensivos (se muestran los capturados en ese universo); describe coexistencia, no causa.', evidence: ids, query: { view: 'rebounds', team } }];
}

export function recommendations(ix, team, ctx, params) {
  return { team, items: [...rec01(ix, team, ctx, params), ...rec02(ix, team, ctx, params)], note: 'Sin evidencia suficiente se muestra la insuficiencia de cada regla (lo observado y lo exigido), nunca una recomendación genérica. No consulta capacidades ocultas ni resultados futuros y no cambia el plan del siguiente partido.' };
}
