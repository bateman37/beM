// MOTOR-17 §18: paquetes `beM-analysis-package/1` (función existente buildPackage, partes de 64 MiB) de los 24 diagnósticos de cierre (12 por versión), con comprobación de lotes (`batch:check`) de cada uno.
// Uso: node scripts/m17-diag-packages.mjs [--out=out/motor17]
import { readFileSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { buildPackage } from '../src/batch/package.js';
import { verifyTarget } from '../src/batch/check.js';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor17'); let bad = 0; const recs = [];
for (const v of ['R0', 'R17']) {
  const plan = JSON.parse(readFileSync(join(OUT, 'plan', `lotes-${v}.json`), 'utf8')); const store = new JobStore(join(OUT, 'lotes', v)); const ctl = new BatchController({ store, executor: null });
  for (const l of plan.lots.filter((x) => x.kind === 'diagnostico')) {
    const outDir = join(OUT, 'paquetes', l.label); mkdirSync(outDir, { recursive: true }); const t0 = performance.now(); const pk = await buildPackage(ctl, l.batch_id, { partTargetMiB: 64, outDir });
    if (!pk.ok) { console.log('FALLO', l.label, pk.reason); bad += 1; continue; }
    const c = verifyTarget(outDir); const rec = { label: l.label, version: v, batch_id: l.batch_id, kind: pk.kind, zips: pk.packages.map((p) => ({ name: p.name, bytes: p.bytes, sha256: p.sha256, uncompressed: p.uncompressed })), build_ms: Math.round(performance.now() - t0), batch_check_ok: c.ok, problems: c.problems.slice(0, 5) }; recs.push(rec);
    console.log(l.label, pk.kind, pk.packages.length, 'zip', c.ok ? 'CHECK OK' : 'CHECK FALLA'); if (!c.ok) bad += 1;
  }
}
mkdirSync(join(OUT, 'logs'), { recursive: true }); writeFileSync(join(OUT, 'logs', 'paquetes-diagnosticos.json'), JSON.stringify(recs, null, 1)); void appendFileSync;
console.log('paquetes', recs.length, 'incidencias', bad); process.exit(bad ? 1 : 0);
