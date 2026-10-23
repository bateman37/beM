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
