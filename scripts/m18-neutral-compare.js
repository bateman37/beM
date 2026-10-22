// MOTOR-18: comparación neutral CONTROL17B ↔ MOTOR-18 con la misma entrada deportiva y semilla (§6.4, §15.1). No ajusta nada: carga dos árboles de código, construye la MISMA entrada deportiva en cada uno
// (capacidades, estados, planes, órdenes y semilla idénticos; solo cambian metadatos y, en M18, los bloques de conocimiento neutrales) y compara marcador, parciales, reloj, hechos/orden, participantes, quintetos,
// sorteos, acta, órdenes y estados. La primera discrepancia se informa con su ruta. Uso: node scripts/m18-neutral-compare.js --control=/ruta/control17b --seeds=20261016,382000002 [--mode=none|all30]
import { pathToFileURL } from 'node:url';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const CONTROL = arg('control', '/home/user/control17b'); const NEW = arg('tree', process.cwd()); const seeds = arg('seeds', '20261016').split(',').map(Number); const mode = arg('mode', 'none');
const imp = (tree, p) => import(pathToFileURL(`${tree}/${p}`).href);
const [dc, dn] = [await imp(CONTROL, 'scripts/node-data.js'), await imp(NEW, 'scripts/node-data.js')];
const [mc, mn] = [await imp(CONTROL, 'src/match/index.js'), await imp(NEW, 'src/match/index.js')];
const A = dc.loadData(); const B = dn.loadData();
const sport = (r) => ({ status: r.status, score: r.score, periodScores: r.periodScores, events: r.events.map((e) => [e.seq, e.id, e.type, e.period, e.possessionId, e.team, e.clock, e.shotClock, e.durationTenths, e.lineups, e.intent, e.participants, e.stats, e.effects, e.score, e.draws]),
  orders: (r.orders ?? []).map((o) => [o.id, o.team, o.type, o.state, o.content]), box: r.box, acta: r.acta ?? null, draws: r.diagnostics?.sportingDraws ?? null });
function firstDiff(a, b, path = '') {
  if (a === b) return null; if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return { path, a: JSON.stringify(a)?.slice(0, 200), b: JSON.stringify(b)?.slice(0, 200) };
  if (Array.isArray(a) !== Array.isArray(b)) return { path, a: 'array/obj', b: 'obj/array' };
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) { const d = firstDiff(a[k], b[k], `${path}/${k}`); if (d) return d; }
  return null;
}
const out = [];
for (const seed of seeds) {
  const t0 = performance.now(); const ra = mc.runMatch(mc.buildMatchInput(A.profile, A.players, { seed }), A.profile, { detail: 'full' }); const t1 = performance.now();
  const inB = mn.buildMatchInput(B.profile, B.players, { seed });
  if (mode === 'all30') { const km = await imp(NEW, 'src/knowledge/model.js').catch(() => null); if (km) for (const t of inB.teams) for (const p of t.players) p.knowledge = km.allMastered(B.profile.familiarity, 0); }
  const rb = mn.runMatch(inB, B.profile, { detail: 'full' }); const t2 = performance.now();
  const d = firstDiff(sport(ra), sport(rb)); out.push({ seed, equal: !d, first: d, eventsA: ra.events.length, eventsB: rb.events.length, scoreA: ra.score, scoreB: rb.score, msA: Math.round(t1 - t0), msB: Math.round(t2 - t1) });
}
console.log(JSON.stringify(out, null, 1)); process.exit(out.every((x) => x.equal) ? 0 : 1);
