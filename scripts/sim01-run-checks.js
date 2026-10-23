// Ejecuta una sola vez los controles de cierre de SIM-MOTOR-01 y guarda su resultado en out/sim-motor01/pruebas.json: suite completa, pruebas SIM (con el número de partidos que crean),
// `data:check` y el comprobador documental. Uso: node scripts/sim01-run-checks.js
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './node-data.js';
const run = (cmd, args) => { const t = Date.now(); const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }); return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}`, s: (Date.now() - t) / 1000 }; };
const num = (s, k) => Number((new RegExp(`# ${k} (\\d+)`).exec(s) ?? [])[1] ?? NaN);
const full = run('npm', ['test', '--silent']);
const simT = run('node', ['--test', 'tests/sim01.test.js']); const part = /SIM01_PARTIDOS (\{.*\})/.exec(simT.out); const dc = run('npm', ['run', '--silent', 'data:check']); // El comprobador documental recorre también `out/` (evidencia local de entregas anteriores): se ejecuta sobre una copia limpia del commit (como en las entregas anteriores).
const clean = mkdtempSync(join(tmpdir(), 'sim01-clean-')); spawnSync('sh', ['-c', `git archive HEAD | tar -x -C ${clean}`], { cwd: ROOT });
const doc = (() => { const t = Date.now(); const r = spawnSync('python3', ['scripts/docs/check_engine_docs.py'], { cwd: clean, encoding: 'utf8' }); return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}`, s: (Date.now() - t) / 1000 }; })();
const res = { npmTest: { tests: num(full.out, 'tests'), pass: num(full.out, 'pass'), fail: num(full.out, 'fail'), durationS: full.s, code: full.code }, sim01: { tests: num(simT.out, 'tests'), pass: num(simT.out, 'pass'), fail: num(simT.out, 'fail'), ...(part ? { partidosCreados: JSON.parse(part[1]).creados, partidosCompletos: JSON.parse(part[1]).completos } : {}) },
  dataCheck: { ok: dc.code === 0, last: dc.out.trim().split('\n').slice(-1)[0] }, docCheck: { ok: doc.code === 0, last: `${doc.out.trim().split('\n').slice(-1)[0]} (copia limpia del commit)` } };
mkdirSync(join(ROOT, 'out/sim-motor01'), { recursive: true }); writeFileSync(join(ROOT, 'out/sim-motor01/pruebas.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); process.exit(full.code === 0 && simT.code === 0 && dc.code === 0 && doc.code === 0 ? 0 : 1);
