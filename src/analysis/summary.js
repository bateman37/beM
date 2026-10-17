// Resumen, claves, líderes y crónica (MOTOR-10 §15–§16). Los textos se generan SOLO con valores obtenidos de las consultas del catálogo y con plantillas deterministas;
// no hay un modelo de lenguaje, ni azar, ni una verdad numérica dentro de la plantilla. Menos de tres claves es un resultado válido (no se rellena con elogios).
import { evolution, unansweredRuns, inAdjustedFinal, comebacks } from './evolution.js';
import { production, qualityTable, validShots, shotLine } from './shooting.js';
import { coverageTable } from './defense.js';
import { lineupTable } from './presence.js';
import { throwInList } from './restarts.js';
import { periodName, clockText } from './facts.js';
import { FAMILY_LABEL } from './offense.js';

const nm = (ix, t) => ix.res.teams[t].name;
const stampText = (ix, s) => `${periodName(s.period)} ${clockText(s.remaining)}`;
const pc = (n, d) => (d > 0 ? `${Math.round((100 * n) / d)} %` : '—');

// ------------------------------------------------------------------ candidatos
export function keyCandidates(ix, ctx, params, shotsByTeam) {
  const cs = []; const S = params.summary; const P = production(ix, { clockEndTenths: params.conventions.clockEndTenths });
  const comp = [['two', 'tiros de dos', 'dos'], ['three', 'triples', 'exterior'], ['ft', 'libres', 'libres']];
  const kindKey = { two: 'fg2', three: 'fg3', ft: 'ft' };
  const line = (t, c) => { const v = validShots(shotsByTeam[t]); const f = (z) => v.filter((s) => (c === 'three' ? s.zone === 'three' : s.zone !== 'three') && (z ? s.made : true)); const a = ix.acta.teams[t].totals; return c === 'ft' ? `${a.ftm}/${a.fta}` : `${f(true).length}/${f(false).length}`; };
  const shotIds = (c) => ix.shots.filter((s) => s.valid && s.pub.made && (c === 'three' ? s.pub.zone === 'three' : s.pub.zone !== 'three')).map((s) => s.id);
  // PRODUCCIÓN
  comp.forEach(([c, label, group], i) => {
    const d = P[0].partitionKind[kindKey[c]] - P[1].partitionKind[kindKey[c]]; if (Math.abs(d) < S.productionDiffMin) return; const w = d > 0 ? 0 : 1;
    cs.push({ id: `SUM-P0${i + 1}`, category: 'producción', priority: 0, criterion: Math.abs(d), subject: w, group, text: `${nm(ix, w)} anotó ${Math.abs(d)} puntos más en ${label} (${P[w].partitionKind[kindKey[c]]} frente a ${P[1 - w].partitionKind[kindKey[c]]}; ${line(w, c)} frente a ${line(1 - w, c)} en intentos válidos).`,
      sample: c === 'ft' ? ix.acta.teams[w].totals.fta + ix.acta.teams[1 - w].totals.fta : ix.shots.filter((s) => s.valid && (c === 'three' ? s.pub.zone === 'three' : s.pub.zone !== 'three')).length, evidence: { ids: c === 'ft' ? [] : shotIds(c), query: { view: 'shots', filters: c === 'ft' ? {} : { zone: c === 'three' ? 'three' : ['rim', 'inside', 'midrange'] } } } });
  });
  for (const [lab, key, id, group] of [['puntos tras pérdida', 'afterTurnover', 'SUM-P04', 'tras pérdida'], ['puntos de segunda oportunidad', 'secondChance', 'SUM-P05', 'segunda']]) {
    const d = P[0].labels[key] - P[1].labels[key]; if (Math.abs(d) < S.productionDiffMin) continue; const w = d > 0 ? 0 : 1;
    cs.push({ id, category: 'producción', priority: 1, criterion: Math.abs(d), subject: w, group, text: `${nm(ix, w)} sumó ${Math.abs(d)} ${lab} más (${P[w].labels[key]} frente a ${P[1 - w].labels[key]}). Es una etiqueta de contexto que se solapa con otras: no se suma a las demás para explicar el margen.`, sample: null, evidence: { ids: [], query: { view: 'labels', label: key } } });
  }
  // EVOLUCIÓN
  const ev = evolution(ix, { adjustedFinal: params.adjustedFinal, unansweredMin: S.unansweredMin });
  ev.runs.forEach((r, i) => cs.push({ id: 'SUM-E01', category: 'evolución', priority: 0, criterion: r.points, subject: r.team, group: `run:${i}`, text: `${nm(ix, r.team)} firmó un parcial de ${r.points}-0 ${r.from.period === r.to.period ? `en ${periodName(r.from.period)}` : `entre ${periodName(r.from.period)} y ${periodName(r.to.period)}`} (el margen pasó de ${r.marginBefore > 0 ? '+' : ''}${r.marginBefore} a ${r.marginAfter > 0 ? '+' : ''}${r.marginAfter}).`, sample: r.events.length, evidence: { ids: r.events, query: { view: 'points', from: r.from.event, to: r.to.event } } }));
  for (const ch of ev.leadChanges.filter((c) => inAdjustedFinal(c.period, ix.byId[c.event]?.clock?.before, ix.scoreBefore[c.seq], params.adjustedFinal))) cs.push({ id: 'SUM-E02', category: 'evolución', priority: 1, criterion: 1, subject: ch.to, group: `lead:${ch.event}`, text: `${nm(ix, ch.to)} pasó a liderar en el final ajustado (${periodName(ch.period)} ${clockText(ix.byId[ch.event]?.clock?.after)}, ${ch.score.join('–')}).`, sample: 1, evidence: { ids: [ch.event], query: { view: 'points', event: ch.event, filters: { adjustedFinal: true } } } });
  for (const c of comebacks(ev)) cs.push({ id: 'SUM-E03', category: 'evolución', priority: 2, criterion: c.deficit, subject: c.team, group: `cb:${c.at.event}`, text: `${nm(ix, c.team)} remontó una desventaja de ${c.deficit} puntos hasta pasar a liderar (${stampText(ix, c.at)}).`, sample: 1, evidence: { ids: [c.at.event], query: { view: 'points', event: c.at.event } } });
  // TÁCTICA: lectura de ejecución/cobertura con relación deportiva registrada (cambio no completado)
  for (const d of [0, 1]) for (const r of coverageTable(ix, d).rows) {
    if (r.n < S.executionMin || !r.exchangeFailed) continue;
    cs.push({ id: 'SUM-T01', category: 'táctica', priority: 0, criterion: r.exchangeFailed / r.n, subject: d, group: `cov:${d}:${r.cov}:${r.family}`, text: `${nm(ix, d)} defendió con cambio ${r.n} ejecuciones de ${r.familyLabel} y no completó el cambio en ${r.exchangeFailed} de ellas (resultado local de esas ${r.n}: ${r.made} canastas, ${r.miss} fallos, ${r.tov} pérdidas).`, sample: r.n, evidence: { ids: r.ids, query: { view: 'coverage', team: d, filters: { coverage: r.cov, family: r.family } } } });
  }
  // calidad previa: diferencia de la proporción de oportunidades cómodas entre equipos
  const qa = [0, 1].map((t) => qualityTable(shotsByTeam[t])); const comf = qa.map((q) => q.find((x) => x.k === 'comfortable')); const tot = qa.map((q) => q.reduce((s, x) => s + x.att, 0));
  if (tot[0] >= S.qualityMinOpportunities && tot[1] >= S.qualityMinOpportunities) {
    const sh = [0, 1].map((t) => (tot[t] ? (100 * comf[t].att) / tot[t] : 0)); const dp = Math.abs(sh[0] - sh[1]);
    if (dp >= S.qualityDiffPp) { const w = sh[0] > sh[1] ? 0 : 1; cs.push({ id: 'SUM-T02', category: 'táctica', priority: 1, criterion: dp, subject: w, group: 'calidad', text: `${nm(ix, w)} generó ${comf[w].att} oportunidades cómodas de ${tot[w]} (${pc(comf[w].att, tot[w])}) frente a ${comf[1 - w].att} de ${tot[1 - w]} (${pc(comf[1 - w].att, tot[1 - w])}) del rival: ${dp.toFixed(0)} puntos porcentuales de diferencia en la proporción.`, sample: tot[w] + tot[1 - w], evidence: { ids: ix.shots.filter((s) => s.valid && s.pub.quality === 'comfortable').map((s) => s.id), query: { view: 'shots', filters: { quality: 'comfortable' } } } }); }
  }
  // quinteto con exposición suficiente
  for (const t of [0, 1]) { const lt = lineupTable(ix, t, { minSeconds: S.groupSeconds, minAttacks: S.groupAttacks }).rows.filter((r) => r.sufficient && r.ortg.value != null && r.drtg.value != null);
    lt.sort((a, b) => Math.abs(b.ortg.value - b.drtg.value) - Math.abs(a.ortg.value - a.drtg.value) || a.key.localeCompare(b.key)); const r = lt[0];
    if (r) cs.push({ id: 'SUM-T03', category: 'táctica', priority: 2, criterion: Math.abs(r.ortg.value - r.drtg.value), subject: t, group: `lineup:${r.key}`, text: `Un quinteto de ${nm(ix, t)} estuvo ${r.minutes.toFixed(1)} min con ${r.ownComplete} ataques completos propios y ${r.rivalComplete} rivales: ORtg estable ${r.ortg.value.toFixed(0)} y DRtg estable ${r.drtg.value.toFixed(0)} (descriptivo; posesiones mixtas aparte: ${r.mixed}).`, sample: r.ownComplete + r.rivalComplete, evidence: { ids: r.possessionIds, query: { view: 'lineup', team: t, players: r.players } } }); }
  // saque específico: hecho válido identificable
  for (const t of [0, 1]) for (const c of throwInList(ix, t, { audience: 'public', team: t }).filter((x) => x.directPoints >= 2)) cs.push({ id: 'SUM-T04', category: 'táctica', priority: 3, criterion: c.directPoints, subject: t, group: `saque:${c.id}`, text: `${nm(ix, t)} anotó ${c.directPoints} puntos en la secuencia directa de un saque de ${c.kind.toLowerCase()} (${periodName(c.period)}, ${c.id}); es un suceso concreto, no una superioridad general.`, sample: 1, evidence: { ids: [c.id], query: { view: 'throwins', team: t } } });
  return cs;
}

const overlap = (a, b) => { const A = new Set(a); const B = new Set(b); if (!A.size || !B.size) return 0; let n = 0; for (const x of A) if (B.has(x)) n += 1; return n / Math.min(A.size, B.size); };

// Selección SEM: una clave de producción, una de evolución y una de táctica si cada una tiene evidencia; completar con otro válido no redundante; desempate por
// prioridad declarada, criterio homogéneo de la regla (valor mayor) y ID estable. Sin score de mérito oculto.
export function selectKeys(cands, params) {
  const S = params.summary; const sorted = [...cands].sort((a, b) => a.priority - b.priority || b.criterion - a.criterion || a.id.localeCompare(b.id) || String(a.group).localeCompare(String(b.group)));
  const chosen = []; const redundant = [];
  const redundantWith = (c) => chosen.find((k) => k.group === c.group || overlap(k.evidence.ids, c.evidence.ids) >= 0.6);
  const take = (c) => { const r = redundantWith(c); if (r) { redundant.push({ ...c, redundantWith: r.id }); return false; } chosen.push(c); return true; };
  for (const cat of S.categoryOrder) { if (chosen.length >= S.maxKeys) break; const c = sorted.find((x) => x.category === cat && !chosen.includes(x) && !redundantWith(x)); if (c) take(c); }
  for (const c of sorted) { if (chosen.length >= S.maxKeys) break; if (!chosen.includes(c)) take(c); }
  return { keys: chosen, redundant, candidates: cands.length, note: chosen.length < S.maxKeys ? 'Hay menos claves de las posibles porque no hubo más candidatos con evidencia suficiente y no redundantes; los datos crudos siguen visibles.' : null };
}

// ------------------------------------------------------------------ líderes
export function leaders(ix) {
  const crit = [['PTS', 'Puntos', (l) => l.pts], ['RT', 'Rebotes', (l) => l.reb], ['AS', 'Asistencias', (l) => l.ast], ['VAL', 'Valoración (convención de acta)', (l) => l.val], ['REC+TAP', 'Recuperaciones y tapones registrados', (l) => l.stl + l.blk]];
  return crit.map(([id, label, f]) => { const rows = Object.values(ix.acta.players).map((l) => ({ id: l.id, team: l.team, v: f(l) })); const max = Math.max(...rows.map((r) => r.v)); return { id, label, value: max, leaders: max > 0 || id === 'VAL' ? rows.filter((r) => r.v === max).map((r) => ({ id: r.id, team: r.team })) : [], note: rows.filter((r) => r.v === max).length > 1 ? 'empate conservado' : null }; });
}

// ------------------------------------------------------------------ crónica
// Cada bloque usa solo los hechos y el contexto disponibles hasta el cierre de SU periodo (nunca el resultado futuro).
export function chronicle(ix, params, { through = Infinity } = {}) {
  const periods = [...new Set(ix.events.map((e) => e.period))].filter((p) => p >= 1 && p <= through); const out = [];
  for (const p of periods) {
    const pe = ix.acta.pointEvents.filter((x) => x.period <= p); const own = ix.acta.pointEvents.filter((x) => x.period === p);
    const cum = [0, 0]; for (const x of pe) cum[x.team] += x.pts; const part = [0, 0]; for (const x of own) part[x.team] += x.pts;
    const runs = unansweredRuns({ ...ix, acta: { ...ix.acta, pointEvents: pe } }, params.summary.unansweredMin, { period: p }); // solo hechos hasta el cierre de este periodo
    const byP = {}; for (const x of own) if (x.player) byP[x.player] = (byP[x.player] ?? 0) + x.pts; const top = Object.entries(byP).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    const sentences = []; const lead = cum[0] === cum[1] ? `empate a ${cum[0]}` : `${nm(ix, cum[0] > cum[1] ? 0 : 1)} por delante ${Math.max(...cum)}–${Math.min(...cum)}`;
    sentences.push(`${periodName(p)}: ${nm(ix, 0)} ${part[0]}–${part[1]} ${nm(ix, 1)} en el periodo; al cierre, ${lead}.`);
    for (const r of runs) sentences.push(`${nm(ix, r.team)} encadenó un ${r.points}-0 (margen de ${r.marginBefore > 0 ? '+' : ''}${r.marginBefore} a ${r.marginAfter > 0 ? '+' : ''}${r.marginAfter}).`);
    if (top && top[1] >= 6) sentences.push(`${top[0]} anotó ${top[1]} puntos en el periodo.`);
    out.push({ period: p, label: periodName(p), text: sentences.join(' '), closes: cum, partial: part });
  }
  return out;
}
