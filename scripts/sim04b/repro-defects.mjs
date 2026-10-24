// SIM-MOTOR-04B · reproducción de los dos defectos de cierre del encargo (§4.1 fatiga/rotación y §5.1 consulta/sellado). Se ejecuta contra la raíz de código indicada (por defecto, la actual) para demostrar
// el comportamiento anterior (worktree de 04) y el corregido con el MISMO guion. No modifica el producto: el defecto se observa, no se introduce.
//   node scripts/sim04b/repro-defects.mjs [raíz-de-código]
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const root = resolve(process.argv[2] ?? new URL('../..', import.meta.url).pathname);
const imp = (p) => import(pathToFileURL(resolve(root, p)).href);
const { loadEnv } = await imp('scripts/sim03/lib.js');
const { SimMatch } = await imp('src/sim/engine.js'); await imp('src/sim/materialize.js');
const { ATTR_ORDER } = await imp('src/sim/profile.js');
const { buildPairInput } = await imp('src/sim/teams.js');
const { ShardRunner } = await imp('src/sim/shard.js');
const env = loadEnv(); const ctx = env.ctx;
const setAbilities = (p, v) => { for (const a of ATTR_ORDER) p.abilities[a] = v; };

// ---- §4.1 fatiga: primer tramo REAL (step), sin llamar a _rotate a mano
function fatigue(cfg) {
  const input = buildPairInput(env.teamMap, 'EQ01', 'EQ02', { seed: 11 }); const t = input.teams[0]; t.plan.participation = { pairs: [] };
  const sg = t.plan.starters.SG; const starters = new Set(Object.values(t.plan.starters));
  for (const p of t.players) { if (p.id === sg) { setAbilities(p, cfg.sg); p.state.energy = cfg.sgEnergy; } else if (starters.has(p.id)) { setAbilities(p, cfg.others); p.state.energy = 100; } else { setAbilities(p, cfg.bench); p.state.energy = 100; } }
  const m = new SimMatch(input, ctx); m.step();
  const sub = m.events.find((e) => e.ty === 'sub' && e.tm === 0 && e.t <= 0.05);
  return { sgSubbed: !!(sub && sub.out.includes(sg)), sub: sub ? { out: sub.out, in: sub.in } : null, sgSev: m.teams[0].byId[sg].sev };
}
const out = { root, fatigue: {} };
out.fatigue.sg20_energy5_bench16 = fatigue({ sg: 20, sgEnergy: 5, bench: 16, others: 30 });
out.fatigue.sg30_energy30_bench12 = fatigue({ sg: 30, sgEnergy: 30, bench: 12, others: 30 });
out.fatigue.sg20_energy30_bench16 = fatigue({ sg: 20, sgEnergy: 30, bench: 16, others: 30 });

// ---- §5.1 cierre: consultar antes de sellar con releaseFinished
function closure(order) {
  const sr = new ShardRunner(ctx, { releaseFinished: true }); sr.teamMap = env.teamMap; sr.add({ id: 'M1', spec: { a: 'EQ01', b: 'EQ02', seed: 112 }, start: 0 });
  let T = 0; for (let guard = 0; guard < 400; guard++) { T += 120; const pk = sr.advanceAll(T, { defer: true }); if (pk.every((p) => p.finished)) break; }
  const r = {}; const get = () => { try { const e = sr.essential('M1'); return { ok: !!e, complete: e?.complete ?? e?.meta?.complete ?? null }; } catch (err) { return { error: String(err.message ?? err).slice(0, 120) }; } };
  if (order === 'query-seal') { r.essential1 = get(); r.seal = sr.seal(); } else { r.seal = sr.seal(); r.essential1 = get(); }
  r.released = sr.released('M1'); r.essentialAfter = get();
  try { r.essentialId = JSON.stringify(sr.matches.get('M1').essential?.score ?? null).slice(0, 80); } catch { /* sin lectura */ }
  return r;
}
out.closure = { 'seal-query': closure('seal-query'), 'query-seal': closure('query-seal') };
console.log(JSON.stringify(out, null, 1));
