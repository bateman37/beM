// SIM-MOTOR-04 · comprobaciones de la etapa E (§7.3, condición 3): con la política de rotación SIN tocar, (a) un referente claramente superior puede seguir siendo preferible con energía 30 (no hay cambio obligatorio por un
// umbral nuevo) y (b) hay relevo cuando el sustituto resulta mejor. Cálculo directo sobre la rotación real (`_rotate`), sin azar. El gasto por minuto no altera estas decisiones (solo la velocidad de la energía): se comprueban
// con el perfil de la candidata para dejar constancia de ello.
import { SimMatch } from '../../src/sim/engine.js';
import '../../src/sim/materialize.js';
import { ATTR_ORDER } from '../../src/sim/profile.js';
import { buildPairInput } from '../../src/sim/teams.js';

const setAbilities = (p, v) => { for (const a of ATTR_ORDER) p.abilities[a] = v; };
function scenario(env, ctx, { curAb, benchAb, curEnergy }) {
  const input = buildPairInput(env.teamMap, 'EQ01', 'EQ02', { seed: 11 }); const t = input.teams[0]; const sg = t.plan.starters.SG; const cur = t.players.find((p) => p.id === sg); setAbilities(cur, curAb); cur.state.energy = curEnergy;
  const bench = t.players.filter((p) => !Object.values(t.plan.starters).includes(p.id)); for (const b of bench) { setAbilities(b, benchAb); b.state.energy = 100; }
  t.plan.participation = { pairs: [] }; const m = new SimMatch(input, ctx); const team = m.teams[0]; m.gt = 500; m.periodStart = 0; m.periodLen = 600;
  for (const p of team.players) { p.courtSince = 0; p.benchSince = 0; p.minutes = p.onCourt ? 500 : 0; }
  m._rotate(team); const sub = m.events.find((e) => e.ty === 'sub' && e.tm === 0); return { subbed: !!(sub && sub.out.includes(sg)), event: sub ?? null };
}
export function rotationChecks(env, ctx) {
  const superior = scenario(env, ctx, { curAb: 30, benchAb: 12, curEnergy: 30 }); const relief = scenario(env, ctx, { curAb: 10, benchAb: 24, curEnergy: 30 });
  return { superior30: superior.subbed === false, relief: relief.subbed === true, detail: { superiorAt30: { stays: superior.subbed === false }, betterBench: { subbed: relief.subbed } }, cost: ctx.sp.v.energy.costPerLiveMinute };
}
