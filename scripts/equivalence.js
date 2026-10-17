// Informe de equivalencia para AUD29 (MOTOR-14 §11). Ejecuta encuentros REALES con las mismas entradas por modalidad, velocidad, registro y continuación, y escribe `out/equivalence/EQV-*.json`
// (`beM-equivalence-report/1`, sellado). Uso: node scripts/equivalence.js [semilla=20261016]. ~11 encuentros completos equivalentes (declarado en el informe).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, ROOT } from './node-data.js';
import { buildMatchInput, createMatch, buildResult, ENGINE_VERSION } from '../src/match/index.js';
import { MatchSession } from '../src/match/session.js';
import { snapshotMatch, restoreMatch } from '../src/match/snapshot.js';
import { driveMatch, compareRuns, runScripted } from '../src/match/equivalence.js';
import { trajectoryFingerprint, inputFingerprint } from '../src/batch/fingerprint.js';
import { sealReport, EQUIVALENCE_SCHEMA } from '../src/audit/equivalence.js';
import { APP_VERSION } from '../src/version.js';

const seed = Number(process.argv[2] ?? 20261016);
const { profile, players } = loadData();
const input = buildMatchInput(profile, players, { seed });
const SCRIPT = [
  { period: 1, label: 'guion P1', specs: [{ team: 0, type: 'styles', styles: { freedom: 5, organizedPace: 4 } }] },
  { period: 2, label: 'guion P2', specs: [{ team: 0, type: 'styles', styles: { offensiveRisk: 2 } }, { team: 1, type: 'priorities', priorities: { POS01: 5 } }] },
  { afterStep: 40, spec: { team: 0, type: 'styles', styles: { freedom: 2 } } },
];
const fakeScheduler = () => { let t = 0; let n = 0; let q = []; return { setTimeout(fn, ms) { const h = ++n; q.push({ h, at: t + ms, fn }); return h; }, clearTimeout(h) { q = q.filter((x) => x.h !== h); }, yield: () => Promise.resolve(), now: () => t,
  runNext() { if (!q.length) return false; q.sort((a, b) => a.at - b.at || a.h - b.h); const x = q.shift(); t = x.at; x.fn(); return true; } }; };
async function viaSession(inp, mode, { speeds = null, specsByPeriod = {} } = {}) {
  const sch = fakeScheduler(); const s = new MatchSession({ input: inp, profile, mode, scheduler: sch }); await s.start();
  if (mode === 'cuartos') while (s.state === 'revision') { const p = s.match.period; await s.playNextPeriod(specsByPeriod[p]?.specs ?? [], specsByPeriod[p]?.label); }
  if (mode === 'tiempo') { let n = 0; while (s.state !== 'finalizado' && n < 1e7) { if (speeds && n % 120 === 0) s.setSpeed(speeds[(n / 120 | 0) % speeds.length]); if (!sch.runNext()) break; n += 1; if (s.state === 'enPausa' || s.state === 'tiempoMuerto') s.resume(); } }
  return s.result();
}
const comparisons = []; const runs = []; let fullEquivalent = 0;
const reg = (id, kind, res) => runs.push({ id, kind, status: res.status, score: res.score, draws: res.diagnostics.sportingDraws, steps: res.diagnostics.steps, trajectory_fp: trajectoryFingerprint(res), input_fp: inputFingerprint(res.input) });
const add = (family, label, a, b) => comparisons.push({ family, ...compareRuns(a, b, { label }) });

const ref = createMatch(input, profile, { detail: 'full' }); while (ref.step()) { /* hasta el final */ } const refRes = buildResult(ref); reg('ref-completo', 'registro completo, simulado directo', refRes); fullEquivalent += 1;
const total = await viaSession(input, 'total'); reg('modo-total', 'simulado total', total); add('modalidad', 'total ↔ referencia', refRes, total); fullEquivalent += 1;
const cuartos = await viaSession(input, 'cuartos'); reg('modo-cuartos', 'por cuartos', cuartos); add('modalidad', 'por cuartos ↔ referencia', refRes, cuartos); fullEquivalent += 1;
const tiempo = await viaSession(input, 'tiempo', { speeds: [2, 4, 8, 16] }); reg('modo-tiempo-x2-x16', 'por tiempo con x2/x4/x8/x16', tiempo); add('velocidad', 'visionado x2/x4/x8/x16 con pausas ↔ referencia', refRes, tiempo); fullEquivalent += 1;
const red = createMatch(input, profile, { detail: 'reduced' }); while (red.step()) { /* */ } const redRes = buildResult(red); reg('registro-reducido', 'registro reducido', redRes); add('registro', 'reducido ↔ completo (hechos deportivos)', refRes, { ...redRes, events: redRes.events }); fullEquivalent += 0.25;
// guion de órdenes (frontera deportiva): cuartos y núcleo
const input2 = buildMatchInput(profile, players, { seed: 141006 });
const sref = runScripted(input2, profile, SCRIPT).res; reg('guion-ref', 'núcleo con guion de órdenes', sref); fullEquivalent += 1;
const scr = SCRIPT.filter((x) => x.period); const refP = runScripted(input2, profile, scr).res; reg('guion-periodos-ref', 'núcleo, guion por periodos', refP); fullEquivalent += 1;
const byP = Object.fromEntries(scr.map((x) => [x.period, { specs: x.specs, label: x.label }]));
const sc = await viaSession(input2, 'cuartos', { specsByPeriod: byP }); reg('guion-cuartos', 'por cuartos con el mismo guion', sc); add('modalidad', 'por cuartos con guion ↔ núcleo con guion', refP, sc); fullEquivalent += 1;
// continuación desde guardados (colas)
let tails = 0;
for (const [fam, cut, label] of [['continuacion', 215, 'continuación en la frontera de periodo 2 con órdenes pendientes'], ['frontera', 120, 'guardado con una orden vigente y pendientes'], ['frontera', 40, 'guardado en la frontera de una orden registrada']]) {
  const m = createMatch(input2, profile, { detail: 'full' }); const done = new Set(); driveMatch(m, SCRIPT, { done, stopAfterSteps: cut });
  const snap = JSON.parse(JSON.stringify(snapshotMatch(m))); const m2 = restoreMatch(snap); driveMatch(m2, SCRIPT, { done: new Set(done) });
  const r2 = buildResult(m2); reg(`cont-${cut}`, label, r2); add(fam, label, sref, r2); tails += 1 - cut / (sref.diagnostics.steps || 1);
}
fullEquivalent += tails;
const body = { schema: EQUIVALENCE_SCHEMA, id: `EQV-${seed}-${Date.now().toString(36)}`, created_at: new Date().toISOString(), engineVersion: ENGINE_VERSION, appVersion: APP_VERSION, seeds: [seed, 141006],
  work: { fullMatchEquivalents: Math.round(fullEquivalent * 10) / 10, note: 'mismos casos reutilizados por AUD29; las colas de continuación se cuentan por su fracción restante' }, runs, comparisons };
const dir = join(ROOT, 'out', 'equivalence'); mkdirSync(dir, { recursive: true });
const sealed = sealReport(body); writeFileSync(join(dir, `${body.id}.json`), JSON.stringify(sealed, null, 1));
for (const c of comparisons) console.log(`${c.equal ? 'IGUAL ' : c.compatible ? 'DIFIERE' : 'INCOMP.'} [${c.family}] ${c.label}`);
console.log(`informe ${body.id} · ${comparisons.length} comparaciones · ≈${body.work.fullMatchEquivalents} partidos completos equivalentes`);
process.exit(comparisons.every((c) => c.equal) ? 0 : 1);
