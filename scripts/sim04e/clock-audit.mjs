// SIM-MOTOR-04E · auditoría de la frontera reloj/rebote/control sobre las entradas de desarrollo, VAL04E y las anclas de CONTRAST con un ÁRBOL de código dado (04D: --root=<worktree a4f59fb>; 04E: este árbol). Re-ejecuta el
// detallado (determinista, sin azar propio) y cuenta, por expiración, la causa y el reloj que realmente limita; la expiración «de periodo» con reloj de juego positivo es el patrón espurio de 04D (E0070/E0071).
//   node scripts/sim04e/clock-audit.mjs --root=<árbol> --stage=<nombre> [--slice=i/n]  →  out/sim-motor04e/clock/<stage>-<i>.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'; import { join } from 'node:path'; import { gunzipSync } from 'node:zlib'; import { pathToFileURL } from 'node:url';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const root = arg('root', SELF); const stage = arg('stage', 'head'); const [si, sn] = (arg('slice', '0/1')).split('/').map(Number); const outDir = join(SELF, 'out/sim-motor04e/clock'); mkdirSync(outDir, { recursive: true });
const PLAN = join(SELF, 'docs/tecnico/evidencia-sim-motor04e/plan');
const { loadData } = await import(pathToFileURL(join(root, 'scripts/node-data.js')).href); const { createMatch, buildResult } = await import(pathToFileURL(join(root, 'src/match/index.js')).href); const { profile } = loadData();
const [h, ...ls] = readFileSync(join(PLAN, 'agenda.csv'), 'utf8').trim().split('\n'); const cols = h.split(','); const ag = ls.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v]))).filter((a) => a.anchor === '1');
const em = new Map(gunzipSync(readFileSync(join(PLAN, 'entries.jsonl.gz'))).toString().split('\n').filter(Boolean).map((l) => { const x = JSON.parse(l); return [x.entry_id, x.input]; }));
const rows = []; const t0 = Date.now();
ag.forEach((a, k) => {
  if (k % sn !== si) return; const input = { ...JSON.parse(JSON.stringify(em.get(a.entry_id))), seed: Number(a.seed) }; const m = createMatch(input, profile, { detail: 'minimal' }); let g = 0; let err = null; try { while (m.step() && g++ < 2e6); } catch (e) { err = String(e.message).slice(0, 120); }
  const r = err ? null : buildResult(m); const ev = r?.events ?? []; const exps = []; let misses = 0; let rebounds = 0;
  ev.forEach((e, i) => { if (e.type === 'rebound') rebounds++; const failedFg = (x) => x?.type === 'attempt' && x.stats?.some((s) => s.k === 'shot' && !s.made && !s.fromFoul && !s.annulled); if (failedFg(e)) misses++;
    if (e.type !== 'expiry') return; const prev = ev[i - 1]; const next = ev.slice(i + 1).find((x) => x.possessionId && x.possessionId !== e.possessionId) ?? null; const afterMiss = failedFg(prev); const pat = e.effects?.fin === 'periodo' ? (e.clock.after > 0 ? 'falsa_expiracion_de_periodo' : 'fin_de_periodo_real') : 'violacion_24';
    exps.push({ id: e.id, pattern: pat, afterMiss, limitingClock: e.shotClock.before < e.clock.before ? 'posesion' : 'juego', clockBefore: e.clock.before, clockAfter: e.clock.after, shotBefore: e.shotClock.before, prevTeam: prev?.team ?? null, nextPossTeam: next?.team ?? null, nextEntry: next?.type ?? null, sameTeamResumes: pat === 'falsa_expiracion_de_periodo' && next != null && next.team === prev?.team, hadTov: e.stats?.some((s) => s.k === 'tov') ?? false }); });
  rows.push({ case_id: a.case_id, block: a.block, error: err, status: r?.status ?? 'error', valid: r?.reconciliation?.valid ?? null, score: r?.score ?? null, events: ev.length, misses, rebounds, expiries: exps });
});
writeFileSync(join(outDir, `${stage}-${si}.json`), JSON.stringify({ stage, root, slice: `${si}/${sn}`, wallMs: Date.now() - t0, rows })); console.log(JSON.stringify({ stage, slice: `${si}/${sn}`, cases: rows.length, wallMs: Date.now() - t0 }));
