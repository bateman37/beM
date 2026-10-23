// Exposición de módulos tácticos desde las finalizaciones PUBLICADAS (§10.1). Unidad: operaciones de finalización SIM ponderadas (cada participante recibe, por finalización, un crédito total 1 repartido
// por los pesos normalizados de los módulos pertinentes de su contexto: el mismo criterio del productor del detallado, aplicado a la operación que SIM sí genera). No se convierte en horas aquí.
// Participantes compactos: tirador, pasador, director y bloqueador pertinente (ataque) y los defensores de la zona (defensa). Nunca el banquillo; la cobertura solo cuenta si es aplicable a la ficha.
import { coverageApplies } from './model.js';

const norm = (mods) => { const t = mods.reduce((a, x) => a + x.w, 0); return t > 0 ? mods.map((x) => ({ id: x.id, w: x.w / t })) : []; };
export function moduleExposure(m, evs) {
  const S = m.S; const T = m.T; const tcw = S.familiarity.tacticContextWeights; const out = {};
  const credit = (ids, mods) => { if (!mods.length) return; for (const id of ids) { if (id == null) continue; const e = (out[id] ??= {}); for (const x of mods) e[x.id] = (e[x.id] ?? 0) + x.w; } };
  const seen = new Set();
  for (const e of evs) {
    if (e.ty !== 'shot' && e.ty !== 'shootfoul') continue;
    const ctx = e.ctx; if (ctx !== 'organized' && ctx !== 'transition' && ctx !== 'spontaneous') continue;
    const key = `${e.tm}|${e.fin}`; if (seen.has(key) || seen.has(`${1 - e.tm}|${e.fin}`)) continue; seen.add(key); // una finalización se acredita UNA vez (tiro, falta de tiro y serie ligada)
    const k = e.ty === 'shot' ? e.tm : 1 - e.tm; const shooter = e.ty === 'shot' ? e.pl : e.victim;
    const seg = m.segments[e.sg]; const attackers = [...new Set([shooter, e.passer, e.dir, e.scr].filter((x) => x != null))]; const defenders = e.dfn ?? [];
    if (ctx === 'organized') {
      const play = T.plays[e.play]; const w = tcw.organized; const cov = seg.plans[1 - k].coverage; const apply = coverageApplies(play, cov);
      credit(attackers, norm([{ id: seg.plans[k].disposition, w: w.attack.disposition }, { id: `FAM:${e.src}`, w: w.attack.family }]));
      credit(defenders, norm([{ id: seg.org[1 - k], w: w.defense.organization }, ...(apply ? [{ id: cov, w: w.defense.coverage }] : [])]));
    } else if (ctx === 'transition') credit(attackers, norm([{ id: 'FAM:transition', w: tcw.transition.attack.transition }]));
    else credit(defenders, norm([{ id: seg.org[1 - k], w: tcw.spontaneous.defense.organization }]));
  }
  for (const id of Object.keys(out)) for (const k of Object.keys(out[id])) out[id][k] = Math.round(out[id][k] * 1e6) / 1e6;
  return out;
}

// Exposición de la PRESIÓN ADELANTADA (C04-04), operación distinta de la finalización: una oportunidad de avance presionado = un control del equipo atacante PUBLICADO en un tramo cuyo rival presiona a tres cuartos o a pista completa.
// Cada oportunidad acredita como máximo UNA operación por participante, repartida entre sus módulos con los pesos comunes (`tacticContextWeights.pressBreak`): el director efectivo que organiza el avance (FAM:press_break)
// y los defensores en pista del tramo (PRESS y organización efectiva). Se deriva de los tramos y controles ya publicados: consultar, estimar o releer no genera dosis. Presión normal no cuenta.
export function pressExposure(m, segs, T, controlsReached) {
  const w = m.S.familiarity.tacticContextWeights.pressBreak; const byPlayer = {}; const opps = [0, 0]; const byHeight = {}; const delta = [0, 0]; const explicitOps = [0, 0];
  const credit = (id, mod, x) => { const e = (byPlayer[id] ??= {}); e[mod] = (e[mod] ?? 0) + x; };
  for (const s of segs) {
    if (!s.press) continue; const ctl = controlsReached(s, T);
    for (const k of [0, 1]) {
      const p = s.press[k]; const n = ctl[k]; if (!p || !(n > 0)) continue;
      opps[k] += n; (byHeight[p.height] ??= [0, 0])[k] += n; delta[k] += p.delta * n; if (p.explicit) explicitOps[k] += n;
      credit(p.director, 'FAM:press_break', n * w.attack.press_break);
      const tot = w.defense.press + w.defense.organization; for (const id of s.lineups[1 - k]) { credit(id, 'PRESS', n * w.defense.press / tot); credit(id, p.org, n * w.defense.organization / tot); }
    }
  }
  for (const id of Object.keys(byPlayer)) for (const k of Object.keys(byPlayer[id])) byPlayer[id][k] = Math.round(byPlayer[id][k] * 1e6) / 1e6;
  return { byPlayer, opportunities: opps, byHeight, sumDelta: delta.map((x) => Math.round(x * 1e9) / 1e9), explicitOpportunities: explicitOps, unit: 'controles del atacante publicados bajo presión adelantada (una operación por participante y oportunidad, repartida por pesos comunes)' };
}
// C04-06: denominadores de la asistencia por contexto y equipo, desde los hechos PUBLICADOS (sin cadena de pases). Una finalización cuenta una vez (tiro, falta de tiro y serie ligada comparten `fin`).
//  fin: finalizaciones · eligible: admiten entrega final · delivered: entrega producida (pasador sorteado) · eligibleBaskets: canastas de campo en finalizaciones elegibles · fgAssists: asistencias de campo
//  eligibleFtSeries: series de libres por falta de tiro (no la ligada) en finalizaciones elegibles · ftAssists: asistencias a libres
export const ASSIST_CTX = ['organized', 'transition', 'spontaneous', 'putback'];
export function assistDenominators(evs) { return assistTables(evs).den; }
// 04B §7.5: embudo causal del pase final POR CLASE de elegibilidad (tabla `assist-table.js`), distinto de `assistDenominators` (que es por contexto). Una finalización cuenta una vez. Por equipo atacante y clase:
//  opportunities: finalizaciones de la clase · eligible: las que admiten entrega (`elig`) · delivered: entrega producida (pasador sorteado) · eligibleBaskets: canastas de campo elegibles · fgAssists: asistencias de campo ·
//  eligibleFtSeries / ftAssists: series de libres por falta de tiro elegibles y asistencias a libres. `received_lost` es una oportunidad de la clase recepción cuya ventaja no se conservó (sin entrega).
export const FUNNEL_CLASSES = ['none', 'explicit_pass', 'received_advantage', 'received_lost', 'transition', 'spontaneous'];
export function assistFunnel(evs) { return assistTables(evs).funnel; }
// Una sola pasada sobre los hechos para los DOS lectores (denominadores por contexto y embudo por clase): misma definición de finalización única, elegibilidad, entrega y crédito para ambos (04B §9.2 A).
export function assistTables(evs) {
  const mk = () => ({ fin: 0, eligible: 0, delivered: 0, eligibleBaskets: 0, fgAssists: 0, eligibleFtSeries: 0, ftAssists: 0 });
  const mk2 = () => ({ opportunities: 0, eligible: 0, delivered: 0, eligibleBaskets: 0, fgAssists: 0, eligibleFtSeries: 0, ftAssists: 0 });
  const den = [0, 1].map(() => Object.fromEntries(ASSIST_CTX.map((c) => [c, mk()]))); const funnel = [0, 1].map(() => Object.fromEntries(FUNNEL_CLASSES.map((c) => [c, mk2()]))); const seen = new Set(); const seriesAssist = new Map();
  for (const e of evs) if (e.ty === 'ft' && e.cause === 'shooting' && e.made) seriesAssist.set(e.fin, true);
  for (const e of evs) {
    if (e.ty !== 'shot' && e.ty !== 'shootfoul') continue; const k = e.ty === 'shot' ? e.tm : 1 - e.tm; const c = den[k][e.ctx]; if (!c) continue;
    const f = e.ctx === 'putback' ? null : funnel[k][FUNNEL_CLASSES[e.elc ?? 0] ?? 'none'];
    const key = `${k}|${e.fin}`; const first = !seen.has(key); if (first) { seen.add(key); c.fin++; if (e.elig) c.eligible++; if (e.elig && e.passer) c.delivered++; if (f) { f.opportunities++; if (e.elig) f.eligible++; if (e.elig && e.passer) f.delivered++; } }
    if (e.ty === 'shot' && e.elig && e.made) { c.eligibleBaskets++; if (e.passer) c.fgAssists++; if (f) { f.eligibleBaskets++; if (e.passer) f.fgAssists++; } }
    if (e.ty === 'shootfoul' && !e.and1 && e.elig) { c.eligibleFtSeries++; const a = e.passer && seriesAssist.get(e.fin); if (a) c.ftAssists++; if (f) { f.eligibleFtSeries++; if (a) f.ftAssists++; } }
  }
  return { den, funnel };
}
