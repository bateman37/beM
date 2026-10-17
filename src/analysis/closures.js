// Dos consultas pendientes de MOTOR-10 (completadas en MOTOR-11 §4.4) sobre las relaciones existentes (acta, posesiones, presencia). No son USG ni un overall.
//  · Cuota de cierres de posesión: cierres atribuibles al jugador / cierres elegibles del equipo en el mismo universo (posesiones activas del equipo).
//  · Producción por 100 ataques completos con presencia completa: 100 × créditos elegibles / ataques completos correspondientes (numerador y denominador en las MISMAS unidades).
import { ratio, pctOf } from './formulas.js';
import { unitStatus } from './presence.js';

const lastOf = (evs, f) => { for (let i = evs.length - 1; i >= 0; i--) { const r = f(evs[i]); if (r) return r; } return null; };

// Autoría causal del cierre de una posesión: quien realizó la acción que la cerró (canasta, último libre, tiro que acaba en rebote defensivo o tapón, pérdida). El fin de
// periodo, el balón suelto perdido y las pérdidas de equipo NO tienen actor individual: se conservan como cierre colectivo y no se cargan a ningún jugador.
export function closureOf(p) {
  const evs = p.events ?? []; const ek = p.endKind; const team = p.team;
  const shot = (made) => lastOf(evs, (e) => (e.stats ?? []).find((f) => f.k === 'shot' && f.team === team && (made == null || !!f.made === made)));
  const ft = lastOf(evs, (e) => (e.stats ?? []).find((f) => f.k === 'ft' && f.team === team && (f.status ?? 'administered') === 'administered'));
  const tov = lastOf(evs, (e) => (e.stats ?? []).find((f) => f.k === 'tov' && f.team === team));
  let actor = null; let how = null;
  if (ek === 'madeFG') { const f = shot(true); actor = f?.p ?? null; how = 'canasta'; }
  else if (ek === 'ftMade') { actor = ft?.p ?? null; how = 'último libre anotado'; }
  else if (ek === 'dreb') { const last = lastOf(evs, (e) => (e.stats ?? []).find((f) => (f.k === 'shot' || f.k === 'ft') && f.team === team)); actor = last?.p ?? null; how = last?.k === 'ft' ? 'último libre fallado con rebote defensivo' : 'tiro fallado con rebote defensivo'; }
  else if (ek === 'blockRecovery') { actor = shot(null)?.p ?? null; how = 'tiro taponado con control defensivo'; }
  else if (ek === 'steal' || ek === 'liveTurnover' || ek === 'deadTurnover') { actor = tov?.p ?? null; how = actor ? 'pérdida' : 'pérdida de equipo (sin actor individual)'; }
  else how = p.closeCause ?? ek ?? 'sin causa';
  return { actor, how, collective: actor == null, cause: p.closeCause ?? ek };
}

// Cierres de las posesiones activas del equipo: una fila por jugador y una fila colectiva propia. Σ individuales + colectivos = cierres elegibles (conciliado).
export function closureTable(ix, team) {
  const mine = ix.possessions.filter((p) => p.team === team); const rows = new Map(); const collective = { n: 0, causes: {}, ids: [] };
  for (const p of mine) {
    const c = closureOf(p);
    if (c.collective) { collective.n += 1; collective.causes[c.how] = (collective.causes[c.how] ?? 0) + 1; collective.ids.push(p.id); }
    else { const r = rows.get(c.actor) ?? { player: c.actor, n: 0, how: {}, ids: [] }; r.n += 1; r.how[c.how] = (r.how[c.how] ?? 0) + 1; r.ids.push(p.id); rows.set(c.actor, r); }
  }
  const eligible = mine.length;
  const list = [...rows.values()].sort((a, b) => b.n - a.n).map((r) => ({ ...r, share: pctOf(r.n, eligible) }));
  const individual = list.reduce((s, r) => s + r.n, 0);
  return { team, eligible, rows: list, collective: { ...collective, share: pctOf(collective.n, eligible) }, individual, reconciled: individual + collective.n === eligible,
    note: 'Universo: posesiones activas del equipo en el partido completo. Un cierre sin actor individual (fin de periodo, balón suelto, pérdida de equipo) tiene fila propia y no se carga a ningún jugador; no es USG ni mide cuánto organiza.' };
}
export function closureShare(ix, pid) {
  const t = ix.teamOf[pid]; const tab = closureTable(ix, t); const row = tab.rows.find((r) => r.player === pid);
  return { ...pctOf(row?.n ?? 0, tab.eligible), evidence: row?.ids ?? [], universe: 'cierres elegibles del equipo (posesiones activas; colectivos con fila propia)', collective: tab.collective.n, eligible: tab.eligible };
}

// ---------------------------------------------------------------------------------------------- producción por 100 en presencia completa
export const CREDITS = {
  pts: { label: 'Puntos de campo y libres', side: 'own', unit: 'puntos' }, ast: { label: 'Asistencias', side: 'own', unit: 'AS' }, oreb: { label: 'Rebotes ofensivos', side: 'own', unit: 'RO' }, tov: { label: 'Pérdidas', side: 'own', unit: 'PER' },
  stl: { label: 'Recuperaciones', side: 'rival', unit: 'REC' }, blk: { label: 'Tapones', side: 'rival', unit: 'TAP' }, dreb: { label: 'Rebotes defensivos', side: 'rival', unit: 'RD' },
};
function creditsByPossession(ix, pid, key) {
  const out = {}; const add = (poss) => { if (poss) out[poss] = (out[poss] ?? 0) + 1; };
  const A = ix.acta; const finalPoss = Object.fromEntries(A.finals.map((f) => [f.id, f.possession])); const seriesFinal = Object.fromEntries(A.series.map((s) => [s.id, s.final]));
  if (key === 'pts') { for (const pe of A.pointEvents) if (pe.player === pid && (pe.kind === 'fg' || pe.kind === 'ft')) out[pe.possession] = (out[pe.possession] ?? 0) + pe.pts; return out; }
  if (key === 'tov') { for (const ev of ix.events) for (const f of ev.stats ?? []) if (f.k === 'tov' && f.p === pid) add(ev.possessionId); return out; }
  for (const c of A.credits) {
    if (c.p !== pid) continue;
    if (key === 'ast' && c.k === 'ast') add(c.event ? ix.byId[c.event]?.possessionId : finalPoss[seriesFinal[c.series]]);
    else if (key === 'oreb' && c.k === 'reb' && c.off) add(ix.byId[c.event]?.possessionId);
    else if (key === 'dreb' && c.k === 'reb' && !c.off) add(ix.byId[c.event]?.possessionId);
    else if ((key === 'stl' && c.k === 'stl') || (key === 'blk' && c.k === 'blk')) add(ix.byId[c.event]?.possessionId);
  }
  return out;
}
// Una unidad es la posesión: el numerador solo cuenta créditos de posesiones con presencia completa (sin entrada ni salida del jugador en la unidad); las unidades mixtas y las de presencia
// parcial se muestran aparte y no entran en la tasa. Los créditos defensivos usan los ataques RIVALES; los ofensivos, los propios.
export function productionPer100(ix, pid, key = 'pts') {
  const def = CREDITS[key]; if (!def) throw new Error(`crédito desconocido: ${key}`);
  const t = ix.teamOf[pid]; const credits = creditsByPossession(ix, pid, key);
  const universe = ix.possessions.filter((p) => (def.side === 'own' ? p.team === t : p.team !== t));
  const acc = { complete: { attacks: 0, credits: 0, ids: [] }, mixed: { attacks: 0, credits: 0 }, partial: { attacks: 0, credits: 0 }, absent: { attacks: 0, credits: 0 } };
  for (const p of universe) {
    const st = unitStatus(ix, p, [pid], t); const a = acc[st] ?? acc.partial; a.attacks += 1; a.credits += credits[p.id] ?? 0; if (st === 'complete') a.ids.push(p.id);
  }
  const c = acc.complete;
  const r = ratio(c.credits, c.attacks, { scale: 100, unit: `${def.unit} por 100 ataques completos`, reason: 'sin ataques completos con presencia completa' });
  return { ...r, credit: key, label: `${def.label} por 100 ataques completos${def.side === 'rival' ? ' rivales' : ''} con presencia completa`, side: def.side, complete: c, mixed: acc.mixed, partial: acc.partial, absent: acc.absent,
    note: 'Numerador y denominador usan las mismas unidades (posesiones con el jugador presente toda la unidad). Las unidades mixtas y parciales no entran en la tasa; no son todos los puntos de presencia ni un ORtg individual.' };
}
