// SIM-MOTOR-04E · resumen compacto de M/errores por bloque y condición (lectura, sin azar):  node scripts/sim04e/summary.mjs [--out=out/sim-motor04e/campaign]
import { readFileSync } from 'node:fs'; import { join } from 'node:path';
import { evaluate, detTables } from './evaluate.js'; import * as S from './select.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SELF = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const out = arg('out', join(SELF, 'out/sim-motor04e/campaign')); const planDir = join(SELF, 'docs/tecnico/evidencia-sim-motor04e/plan');
const ids = (b) => readFileSync(join(planDir, 'agenda.csv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split(',')).filter((f) => f[1] === b).map((f) => f[0]);
const sets = { 'DEV-A': [['DEV'], ids('DEV')], 'DEV-B': [['DEVB'], ids('DEVB')], 'DEV-conjunto': [['DEV', 'DEVB'], [...ids('DEV'), ...ids('DEVB')]], VAL: [['VAL'], ids('VAL')] };
const conds = ['SIM_04E_BASE', 'SIM_04E_EXP']; const rows = [];
for (const [name, [blocks, caseIds]] of Object.entries(sets)) {
  const det = detTables(out, blocks, caseIds);
  for (const c of conds) { try { const ev = evaluate({ out, identity: c, block: blocks, caseIds, det }); const sc = S.scoreM(ev.errs); rows.push({ set: name, cond: c, M: +sc.M?.toFixed(3), L: +sc.L.toFixed(3), violated: sc.violated, dominant: sc.dominant, cases: ev.comparableCases }); } catch (e) { rows.push({ set: name, cond: c, error: String(e.message).slice(0, 80) }); } }
}
console.table(rows);
