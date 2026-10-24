// SIM-MOTOR-04B · comprobaciones de la rotación (§4.2 y §8.3 etapa E): se ejecutan por el CAMINO REAL del generador (`SimMatch.step()` vía `advance`), no llamando a `_rotate` a mano con un estado construido. La política de rotación NO se toca:
// (a) un referente claramente superior (30) puede seguir en pista con energía 30 frente a un suplente 12; (b) un suplente que resulta mejor entra; (c) la fatiga ACTUAL decide (la energía de 5 con severidad recalculada provoca el relevo
// que la severidad desfasada del código de 04 no provocaba); (d) la recuperación entre periodos modifica la utilidad del suplente en la SIGUIENTE revisión. `emulateStale` reproduce el orden anterior (rotar con la severidad
// del tramo previo y recalcularla después) mediante una sustitución acotada dentro de la prueba, sin modificar el producto.
import { SimMatch } from '../../src/sim/engine.js';
import '../../src/sim/materialize.js';
import { ATTR_ORDER } from '../../src/sim/profile.js';
import { buildPairInput } from '../../src/sim/teams.js';

const setAbilities = (p, v) => { for (const a of ATTR_ORDER) p.abilities[a] = v; };
export function scenario(env, ctx, { curAb, benchAb, curEnergy, benchEnergy = 100, othersAb = 30, until = 900, emulateStale = false }) {
  const input = buildPairInput(env.teamMap, 'EQ01', 'EQ02', { seed: 11 }); const t = input.teams[0]; t.plan.participation = { pairs: [] };
  const sg = t.plan.starters.SG; const starters = new Set(Object.values(t.plan.starters));
  for (const p of t.players) { if (p.id === sg) { setAbilities(p, curAb); p.state.energy = curEnergy; } else if (starters.has(p.id)) { setAbilities(p, othersAb); p.state.energy = 100; } else { setAbilities(p, benchAb); p.state.energy = benchEnergy; } }
  const m = new SimMatch(input, ctx, { rotationDiag: true });
  if (emulateStale) { // orden de 04: rotar con la severidad del tramo previo y recalcularla DESPUÉS, al preparar el tramo
    const refresh = SimMatch.prototype._refreshSeverity; const prep = SimMatch.prototype._prepareSides; for (const tm of m.teams) for (const p of tm.players) p.sev = 0; // en 04 la severidad se inicializaba a 0 aunque la energía fuese baja
    m._refreshSeverity = function noop() {}; m._prepareSides = function late(d) { refresh.call(this); return prep.call(this, d, true); };
  }
  m.advance({ until });
  const outs = m.events.filter((e) => e.ty === 'sub' && e.tm === 0 && e.out.includes(sg)); const energyOuts = outs.filter((e) => (e.why ?? []).some((w) => /^SG:(energia|energia_critica|tramo_largo)$/.test(w)));
  return { m, sg, outs, energyOuts, firstOutAt: outs[0]?.t ?? null, decisions: (m.rotLog ?? []).filter((d) => d.tm === 0 && d.slot === 'SG') };
}
// Recuperación entre periodos (§4.2): el suplente más útil permanece en el banquillo y el referente tiene motivo de revisión en cada tramo; la energía del suplente sube con la recuperación del descanso y su utilidad en la SIGUIENTE
// revisión es mayor (misma capacidad, menor severidad). Devuelve las dos revisiones consecutivas que cruzan el cambio de periodo.
function recovery(env, ctx) {
  const s = scenario(env, ctx, { curAb: 30, benchAb: 12, curEnergy: 100, benchEnergy: 60, until: 1500 }); const d = s.decisions.filter((x) => x.cand && x.reason === 'tramo_largo'); let pair = null;
  const periodEnds = [600, 1200]; for (const pe of periodEnds) { const before = [...d].reverse().find((x) => x.t < pe - 1e-9); const after = d.find((x) => x.t >= pe - 1e-9); if (before && after && before.cand.id === after.cand.id) { pair = { period: pe, before, after }; break; } }
  return pair;
}
export function rotationChecks(env, ctx) {
  const superior = scenario(env, ctx, { curAb: 30, benchAb: 12, curEnergy: 30 }); const relief = scenario(env, ctx, { curAb: 10, benchAb: 24, curEnergy: 30 });
  const fresh = scenario(env, ctx, { curAb: 20, benchAb: 16, curEnergy: 5, until: 5 }); const stale = scenario(env, ctx, { curAb: 20, benchAb: 16, curEnergy: 5, until: 5, emulateStale: true });
  const rec = recovery(env, ctx); const recOk = !!rec && rec.after.cand.energy >= rec.before.cand.energy + 3.9 && rec.after.cand.utility > rec.before.cand.utility;
  return {
    superior30: superior.energyOuts.length === 0 && superior.decisions.length > 0, relief: relief.energyOuts.length > 0 && relief.firstOutAt <= 900,
    freshSeverity: fresh.outs.length > 0, staleSeverityEmulation: stale.outs.length === 0, recoveryChangesUtility: recOk,
    detail: {
      superiorAt30: { stays: superior.energyOuts.length === 0, decisionsReviewed: superior.decisions.length, reasons: [...new Set(superior.decisions.map((d) => d.reason))] },
      betterBench: { subbedAt: relief.firstOutAt, reason: relief.outs[0]?.why ?? null },
      criticalEnergy5: { fresh: fresh.outs.length > 0, stale04Order: stale.outs.length > 0, firstDecision: fresh.decisions[0] ?? null, staleFirstDecision: stale.decisions[0] ?? null },
      recoveryAcrossPeriod: rec ? { periodEnd: rec.period, before: rec.before, after: rec.after } : null,
    },
    cost: ctx.sp.v.energy.costPerLiveMinute,
  };
}
