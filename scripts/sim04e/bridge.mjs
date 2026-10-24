// SIM-MOTOR-04E · puente antes/después (E03 §7.2): ejecuta las mismas entradas DEV con un árbol de código dado y resume la DINÁMICA deportiva (tipo, equipo, posesión, relojes, duraciones, quintetos, marcador y secuencia de sorteos)
// sin los campos observacionales, el patrón de falsa expiración y el acta de rebotes. Se usa con tres árboles: 04D (a4f59fb), crédito (e45d9fa) y reloj (cabeza). Sin azar propio.
//   node scripts/sim04e/bridge.mjs --root=<árbol> --stage=<nombre> [--n=8] [--out=out/sim-motor04e/bridge]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'; import { gunzipSync } from 'node:zlib'; import { createHash } from 'node:crypto'; import { join } from 'node:path'; import { pathToFileURL } from 'node:url';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const root = arg('root', SELF); const stage = arg('stage', 'head'); const N = Number(arg('n', 8)); const out = arg('out', join(SELF, 'out/sim-motor04e/bridge'));
const PLAN = join(SELF, 'docs/tecnico/evidencia-sim-motor04c/plan'); const sha = (x) => createHash('sha256').update(x).digest('hex').slice(0, 16);
const { loadData } = await import(pathToFileURL(join(root, 'scripts/node-data.js')).href); const { createMatch, buildResult } = await import(pathToFileURL(join(root, 'src/match/index.js')).href);
const { profile } = loadData();
const em = new Map(gunzipSync(readFileSync(join(PLAN, 'entries.jsonl.gz'))).toString().split('\n').filter(Boolean).map((l) => { const x = JSON.parse(l); return [x.entry_id, x.input]; }));
const [h, ...ls] = readFileSync(join(PLAN, 'agenda.csv'), 'utf8').trim().split('\n'); const cols = h.split(',');
const ag = ls.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v]))).filter((a) => a.block === 'VAL').slice(0, N);
const rows = [];
for (const a of ag) {
  const input = { ...JSON.parse(JSON.stringify(em.get(a.entry_id))), seed: Number(a.seed) }; const m = createMatch(input, profile, { detail: 'full' }); let g = 0; while (m.step() && g++ < 2e6);
  const r = buildResult(m); const ev = r.events;
  const dyn = ev.map((e) => [e.type, e.team, e.possessionId, e.clock.before, e.clock.after, e.shotClock.before, e.shotClock.after, e.durationTenths, JSON.stringify(e.lineups)].join('|')).join('\n');
  const draws = ev.flatMap((e) => e.draws); let falseExp = 0; ev.forEach((e) => { if (e.type === 'expiry' && e.effects?.fin === 'periodo' && e.clock.after > 0) falseExp += 1; });
  const tot = r.acta.teams.map((t) => ({ pts: t.totals.pts ?? t.points, fga: t.totals.fga, tov: t.totals.tov, oreb: t.totals.oreb, dreb: t.totals.dreb, reb: t.totals.reb }));
  rows.push({ case_id: a.case_id, seed: Number(a.seed), score: r.score, events: ev.length, draws: draws.length, dyn_sha: sha(dyn), draws_sha: sha(JSON.stringify(draws)), false_expiry: falseExp, acta: tot });
}
mkdirSync(out, { recursive: true }); writeFileSync(join(out, `stage-${stage}.json`), JSON.stringify({ stage, root, rows }, null, 1)); console.log(JSON.stringify({ stage, n: rows.length, falseExpiry: rows.reduce((s, x) => s + x.false_expiry, 0) }));
