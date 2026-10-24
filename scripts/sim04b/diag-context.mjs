// SIM-MOTOR-04B · diagnóstico dirigido (§7.1): contexto × zona × calidad, finalizador y pases finales, leído de los hechos NATIVOS (SIM: eventos del encuentro; detallado: tiros del registro esencial).
// No ejecuta fórmulas de nuevo: cuenta lo que el motor generó. `node scripts/sim04b/diag-context.mjs [--root=<código>] [--overrides=<archivo>] [--cases=<lista>] [--out=<json>]`.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const root = resolve(arg('root', SELF)); const imp = (p) => import(pathToFileURL(resolve(root, p)).href);
const { loadAgenda } = await import('./exec.mjs');
const { loadData } = await imp('scripts/node-data.js'); const { makeContext } = await imp('src/sim/context.js'); const { SimMatch } = await imp('src/sim/engine.js'); await imp('src/sim/materialize.js'); const { playAutomatic } = await imp('src/sim/coachsim.js');
const ov = arg('overrides'); const overrides = ov ? (JSON.parse(readFileSync(ov, 'utf8')).overrides ?? JSON.parse(readFileSync(ov, 'utf8'))) : null;
const ctx = makeContext(loadData().profile, overrides);
const planDir = arg('plan', `${SELF}/docs/tecnico/evidencia-sim-motor04/plan`); const { agenda, entries } = loadAgenda(planDir);
const ids = arg('cases') ? arg('cases').split(',') : [...agenda.values()].filter((a) => a.block === 'CAL' && a.anchor === '1').map((a) => a.case_id);
const ZONES = ['rim', 'inside', 'midrange', 'three']; const QN = ['comfortable', 'normal', 'forced'];
const tally = () => ({ att: 0, made: 0, ast: 0, passable: 0, q: [0, 0, 0], qm: [0, 0, 0], zone: { rim: [0, 0], inside: [0, 0], midrange: [0, 0], three: [0, 0] }, zq: {} });
const T = { sim: {}, det: {} };
const add = (side, ctxName, zone, q, made, assisted) => { const t = (T[side][ctxName] ??= tally()); t.att++; t.made += made ? 1 : 0; t.ast += assisted ? 1 : 0; t.q[q]++; if (made) t.qm[q]++; t.zone[zone][0]++; if (made) t.zone[zone][1]++; const k = `${zone}|${q}`; const z = (t.zq[k] ??= [0, 0]); z[0]++; if (made) z[1]++; };
const SIMCTX = { organized: 'organizado', transition: 'transición', spontaneous: 'espontáneo', putback: 'continuación' };
const DETCTX = { organizado: 'organizado', 'transición': 'transición', temprano: 'transición', saque: 'saque', continuidad: 'continuación' };
const simOnly = ids.filter((id) => agenda.get(id));
for (const id of simOnly) {
  const a = agenda.get(id); const e = entries.get(a.entry_id); const input = { ...JSON.parse(JSON.stringify(e)), seed: a.seed };
  const m = new SimMatch(input, ctx, { matchId: id }); playAutomatic(m);
  for (const ev of m.events) if (ev.ty === 'shot') add('sim', SIMCTX[ev.ctx] ?? ev.ctx, ev.zone, ev.q, ev.made, ev.made && ev.passer != null);
}
// detallado: registros ya conservados de 04 (mismas entradas CAL de 04; otras semillas no cambian la distribución buscada)
const detPath = arg('det', `${SELF}/out/sim-motor04/campaign/records-detailed-DET.jsonl`);
try { for (const l of readFileSync(detPath, 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); if (!ids.includes(r.case_id)) continue; const c = r.essential.shots.columns; const ix = (n) => c.indexOf(n);
  for (const row of r.essential.shots.rows) { if (row[ix('annulled')] || (row[ix('from_foul')] && !row[ix('made')])) continue; const q = QN.indexOf(row[ix('quality')]); add('det', DETCTX[row[ix('context')]] ?? row[ix('context')], row[ix('zone')], q, row[ix('made')], row[ix('made')] && row[ix('passer')] != null); } } } catch (e) { T.detError = String(e.message); }
const out = { root, cases: ids.length, overrides, sim: T.sim, det: T.det, detError: T.detError ?? null };
const fmt = (side) => Object.entries(T[side]).map(([c, t]) => { const n = Object.values(T[side]).reduce((s, x) => s + x.att, 0); return `${side} ${c.padEnd(13)} att ${String(t.att).padStart(5)} (${(100 * t.att / n).toFixed(1)}%) fg ${(100 * t.made / t.att).toFixed(1)}%  rim ${t.zone.rim[0]} (${(100 * t.zone.rim[0] / t.att).toFixed(0)}%/${t.zone.rim[0] ? (100 * t.zone.rim[1] / t.zone.rim[0]).toFixed(0) : '-'}%) ins ${t.zone.inside[0]} mid ${t.zone.midrange[0]} 3pt ${t.zone.three[0]}  q ${t.q.map((x) => (100 * x / t.att).toFixed(0)).join('/')}  ast/made ${(100 * t.ast / Math.max(1, t.made)).toFixed(1)}%`; }).join('\n');
console.log(fmt('det')); console.log(fmt('sim'));
if (arg('out')) writeFileSync(arg('out'), JSON.stringify(out));
