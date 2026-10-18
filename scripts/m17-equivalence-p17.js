// MOTOR-17 §15.2: equivalencia EXACTA entre dos árboles de código (A17 → P17) con las mismas entradas y el mismo perfil. Compara hechos completos (también `calc`, `params` e `instr`), acta, estados, dirección,
// reloj, marcador, parciales, energía final, número de sorteos, huella de trayectoria completa (TRAY-MOTOR12-R1) e incremental (TRAYINC-MOTOR15-R1). No simula nada que no sea la pareja de ejecuciones por entrada.
// Uso: node scripts/m17-equivalence-p17.js --a=/ruta/a17 --b=/ruta/p17 [--n=8] [--out=ruta.json] [--detail=full|minimal]
// Entradas: las del plan de desarrollo (§13.1): d = 1…n, r = 1 (par de ciclo EQ01–EQ02, …, EQ11–EQ12, EQ01–EQ12), seed_dev = 210000000 + 1000·d + r.
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const A = arg('a', null); const B = arg('b', null); const N = Number(arg('n', 8)); const OUT = arg('out', null); const DETAIL = arg('detail', 'full');
if (!A || !B) { console.error('uso: --a=<raíz A17> --b=<raíz P17>'); process.exit(2); }

async function tree(root) {
  const imp = (p) => import(pathToFileURL(`${root}/${p}`).href);
  const { loadData } = await imp('scripts/node-data.js'); const P = await imp('src/population/index.js'); const M = await imp('src/match/index.js'); const D = await imp('src/match/data.js');
  const F = await imp('src/batch/fingerprint.js'); const O = await imp('src/batch/observer.js');
  const data = loadData(); const team = (id) => P.referenceTeam(data.profile, data.players, id);
  return { root, data, run: (a, b, seed) => {
    const input = { schema: D.INPUT_SCHEMA, seed, importance: 'ordinary', teams: [team(a), team(b)] };
    const m = M.createMatch(input, data.profile, { detail: DETAIL, direction: null }); const obs = new O.TrajectoryObserver();
    while (m.step()) obs.consume(m.events);
    const res = M.buildResult(m); const inc = obs.finish(m);
    return { res, full: F.trajectoryFingerprint(res), inc: inc.sha256, draws: m.rng.count };
  } };
}
const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
const ta = await tree(A); const tb = await tree(B);
const ids = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`); const cyc = []; for (let i = 0; i < 11; i++) cyc.push([ids[i], ids[i + 1]]); cyc.push([ids[0], ids[11]]);
const rows = []; let allEqual = true;
for (let d = 1; d <= N; d++) {
  const [a, b] = cyc[d - 1]; const seed = 210000000 + 1000 * d + 1;
  const t0 = performance.now(); const x = ta.run(a, b, seed); const t1 = performance.now(); const y = tb.run(a, b, seed); const t2 = performance.now();
  const parts = { events: (r) => r.res.events, acta: (r) => r.res.acta, states: (r) => ({ s: r.res.diagnostics?.states, log: r.res.diagnostics?.stateLog, samples: r.res.diagnostics?.stateSamples, ep: r.res.diagnostics?.episodes }),
    direction: (r) => ({ orders: r.res.orders, commands: r.res.commands, coach: r.res.diagnostics?.coach, decisions: r.res.diagnostics?.coach }), clock: (r) => r.res.events.map((e) => [e.id, e.t ?? null, e.clock ?? null, e.durationTenths ?? null]),
    score: (r) => [r.res.score, r.res.periodScores], energy: (r) => r.res.diagnostics?.finalEnergy, draws: (r) => r.draws, chains: (r) => r.res.diagnostics?.throwInChains, memory: (r) => r.res.diagnostics?.memory };
  const cmp = {}; for (const [k, f] of Object.entries(parts)) cmp[k] = sha(f(x)) === sha(f(y));
  cmp.trajectory_full = x.full === y.full; cmp.trajectory_incremental = x.inc === y.inc;
  const eq = Object.values(cmp).every(Boolean); allEqual &&= eq;
  rows.push({ d, pair: `${a}-${b}`, seed, equal: eq, score: x.res.score, draws: [x.draws, y.draws], ms: [Math.round(t1 - t0), Math.round(t2 - t1)], failing: Object.entries(cmp).filter(([, v]) => !v).map(([k]) => k), fp: { full: x.full.slice(0, 12), inc: x.inc.slice(0, 12) } });
  console.log(`d=${d} ${a}-${b} seed ${seed}: ${eq ? 'IGUAL' : `DIFIERE (${rows.at(-1).failing.join(', ')})`} · ${x.res.score.join('–')} · sorteos ${x.draws}/${y.draws} · ${Math.round(t1 - t0)} ms → ${Math.round(t2 - t1)} ms`);
}
const msA = rows.reduce((s, r) => s + r.ms[0], 0); const msB = rows.reduce((s, r) => s + r.ms[1], 0);
const report = { schema: 'beM-p17-equivalence/1', a: A, b: B, detail: DETAIL, inputs: rows.length, executions: rows.length * 2, allEqual, comparedFields: ['events (con calc, params e instr)', 'acta', 'estados', 'dirección (órdenes, comandos, entrenador)', 'reloj por hecho', 'marcador y parciales', 'energía final', 'sorteos', 'cadenas de saque', 'memoria', 'huella TRAY-MOTOR12-R1', 'huella TRAYINC-MOTOR15-R1'], msA, msB, rows };
if (OUT) writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ allEqual, executions: report.executions, msA, msB, ratio: +(msB / msA).toFixed(3) }));
process.exit(allEqual ? 0 : 1);
