// Presencia, quintetos, grupos y on/off descriptivo (MOTOR-10 §13). Tres universos que no se mezclan:
//  · presencia: puntos y hechos mientras el grupo estaba en pista (minutos y más-menos);
//  · posesiones completas estables: toda la unidad transcurrió con el grupo presente (o ausente): su numerador son los puntos VINCULADOS a esas posesiones;
//  · mixtas: cruzan una entrada/salida pertinente; visibles aparte y nunca desaparecen de la conciliación.
// La diferencia con/sin es OBSERVADA (misma definición en ambos lados), nunca «impacto causal». Sin exposición completa en una mitad no hay diferencia finita.
import { ratio, rating, diffRate } from './formulas.js';

export const DEFAULT_PRESENCE = { minSeconds: 180, minAttacks: 8 };

const teamOfGroup = (ix, G) => { const t = new Set(G.map((id) => ix.teamOf[id])); if (t.size !== 1) throw new Error('un grupo pertenece a un único equipo'); return [...t][0]; };

// Estado de un grupo respecto de una posesión: 'complete' | 'mixed' | 'absent' | 'partial'.
export function unitStatus(ix, p, G, t, exact = false) {
  const lid = p.lineups?.[t]; const on = lid ? new Set(ix.lineupPlayers[lid] ?? []) : null;
  if (!on) return 'mixed';
  const present = G.filter((id) => on.has(id)); const subs = p.subs.filter((e) => ix.teamOf[e.participants?.sale ?? e.participants?.entra] === t);
  if (exact && present.length === G.length && on.size !== G.length) return 'partial'; // MOTOR-14: con ocupación exacta, un grupo contenido en un quinteto mayor no es «el mismo quinteto» (inferioridad)
  if (present.length === G.length) return subs.some((e) => G.includes(e.participants?.sale)) ? 'mixed' : 'complete';
  if (present.length === 0) return subs.some((e) => G.includes(e.participants?.entra)) ? 'mixed' : 'absent';
  return 'partial';
}

const evPresent = (ix, ev, G, t, exact = false) => { const lid = ev.lineups?.[t]; const on = lid ? ix.lineupPlayers[lid] : null; if (!on) return null; const c = G.filter((id) => on.includes(id)).length; return c === G.length ? (exact && on.length !== G.length ? 'partial' : 'with') : c === 0 ? 'without' : 'partial'; };

export function groupReading(ix, G, cfg = DEFAULT_PRESENCE, { exact = false } = {}) {
  const t = teamOfGroup(ix, G); const out = { group: G, team: t, with: null, without: null };
  const acc = () => ({ tenths: 0, ptsFor: 0, ptsAgainst: 0, adminFor: 0, adminAgainst: 0, own: { complete: [], mixed: [] }, rival: { complete: [], mixed: [] }, fg: { att: 0, made: 0, three: 0, threeMade: 0 }, tov: 0, partialExcluded: 0 });
  const A = { with: acc(), without: acc() }; let partialTenths = 0;
  for (const ev of ix.events) { const s = evPresent(ix, ev, G, t, exact); const d = ev.durationTenths ?? 0; if (s === 'with' || s === 'without') A[s].tenths += d; else partialTenths += d; }
  for (const pe of ix.acta.pointEvents) {
    const onSet = new Set(pe.on[t]); const c = G.filter((id) => onSet.has(id)).length; const k = c === G.length ? (exact && onSet.size !== G.length ? null : 'with') : c === 0 ? 'without' : null; if (!k) continue;
    const mine = pe.team === t; if (pe.kind === 'admin') { if (mine) A[k].adminFor += pe.pts; else A[k].adminAgainst += pe.pts; } else if (mine) A[k].ptsFor += pe.pts; else A[k].ptsAgainst += pe.pts;
  }
  for (const s of ix.shots) { if (s.team !== t || !s.valid) continue; const k = evPresent(ix, ix.byId[s.id], G, t, exact); if (k !== 'with' && k !== 'without') continue; const x = A[k].fg; x.att += 1; if (s.pub.made) x.made += 1; if (s.pub.zone === 'three') { x.three += 1; if (s.pub.made) x.threeMade += 1; } }
  for (const ev of ix.events) for (const f of ev.stats ?? []) if (f.k === 'tov' && f.team === t) { const k = evPresent(ix, ev, G, t, exact); if (k === 'with' || k === 'without') A[k].tov += 1; }
  for (const p of ix.possessions) {
    const st = unitStatus(ix, p, G, t, exact); const side = p.team === t ? 'own' : 'rival';
    if (st === 'complete') A.with[side].complete.push(p); else if (st === 'mixed') A.with[side].mixed.push(p); else if (st === 'absent') A.without[side].complete.push(p); else A.with.partialExcluded += 1;
  }
  for (const k of ['with', 'without']) {
    const a = A[k]; const ownPts = a.own.complete.reduce((s, p) => s + p.points, 0); const rivPts = a.rival.complete.reduce((s, p) => s + p.points, 0);
    out[k] = { ...a, minutes: a.tenths / 600, plusMinus: a.ptsFor - a.ptsAgainst, ownCompletePoints: ownPts, rivalCompletePoints: rivPts, ortgStable: rating(ownPts, a.own.complete.length), drtgStable: rating(rivPts, a.rival.complete.length), mixedCount: a.own.mixed.length + a.rival.mixed.length };
  }
  out.partialTenths = partialTenths; out.cfg = cfg;
  out.sufficient = out.with.tenths >= cfg.minSeconds * 10 && out.with.own.complete.length >= cfg.minAttacks && out.with.rival.complete.length >= cfg.minAttacks;
  out.note = 'Presencia (puntos de cancha mientras estaba el grupo), posesiones completas estables y mixtas son universos distintos. Los puntos administrativos durante la presencia se muestran aparte y no entran en las tasas estables.';
  return out;
}

export function onOff(ix, G, cfg) {
  const r = groupReading(ix, G, cfg);
  const net = (k) => { const o = r[k].ortgStable; const d = r[k].drtgStable; return o.value == null || d.value == null ? { value: null, unit: 'pts/100', reason: 'sin posesiones completas propias o rivales' } : { value: o.value - d.value, unit: 'pts/100' }; };
  const netWith = net('with'); const netWithout = net('without');
  return { ...r, netWith, netWithout, diffOrtg: diffRate(r.with.ortgStable, r.without.ortgStable), diffDrtg: diffRate(r.with.drtgStable, r.without.drtgStable),
    diffNet: netWith.value == null || netWithout.value == null ? { value: null, reason: 'sin exposición completa en una de las dos mitades (no se muestra 0)' } : { value: netWith.value - netWithout.value, unit: 'pts/100' },
    label: 'Diferencia observada con − sin bajo la misma definición; no es impacto causal ni puntos que aporta el jugador.' };
}

// Quintetos usados: una fila por QUINTETO (grupo de cinco jugadores) con tiempo, tramos, producción y posesiones completas/mixtas.
// MOTOR-13 (defectos de lector confirmados con partidos reales de la campaña, causa «lector»): (1) la lectura de presencia es por CONJUNTO de jugadores, de modo que dos alineaciones registradas
// con los mismos cinco jugadores en puestos distintos (p. ej. tras una rotación que reasigna puestos) se leían como dos quintetos y contaban dos veces minutos y puntos: ahora se agrupan por
// conjunto (la fila lleva todos los ids de tramo registrados en `lineupIds`); (2) una fila con puntos o tiempo en presencia pero sin posesión completa (p. ej. solo unos libres con el quinteto en
// pista y 0 décimas) se descartaba y esos puntos desaparecían de la conciliación: ahora solo se omite una fila sin ninguna presencia.
export function lineupTable(ix, team, cfg = DEFAULT_PRESENCE) {
  const sets = new Map(); for (const l of ix.res.lineups ?? []) if (l.team === team) { const setKey = l.key.split('|').slice().sort().join('|'); const e = sets.get(setKey); if (e) e.ids.push(l.id); else sets.set(setKey, { key: l.key, G: l.key.split('|'), ids: [l.id] }); }
  const rows = []; for (const { key, G, ids } of sets.values()) {
    const r = groupReading(ix, G, cfg, { exact: true }); const w = r.with; if (!w.tenths && !w.own.complete.length && !w.mixedCount && !w.ptsFor && !w.ptsAgainst && !w.adminFor && !w.adminAgainst) continue;
    const tramos = ix.acta.presence.intervals.length ? new Set(ix.events.filter((e) => evPresent(ix, e, G, team, true) === 'with').map((e) => e.lineups[team])).size : 0;
    rows.push({ key, lineupIds: ids, players: G, minutes: w.minutes, plusMinus: w.plusMinus, ptsFor: w.ptsFor, ptsAgainst: w.ptsAgainst, ownComplete: w.own.complete.length, rivalComplete: w.rival.complete.length, mixed: w.mixedCount, ortg: w.ortgStable, drtg: w.drtgStable, sufficient: r.sufficient, tramos, possessionIds: [...w.own.complete, ...w.rival.complete].map((p) => p.id) });
  }
  return { team, rows: rows.sort((a, b) => b.minutes - a.minutes), orderCriterion: 'minutos en pista (descendente); sin mínimo de exposición no se puede hablar del «mejor quinteto»', minimum: cfg };
}
