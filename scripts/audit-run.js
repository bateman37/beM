// Auditoría de evidencia ya generada (MOTOR-13). NO simula ningún partido: lee un lote conservado, un paquete de MOTOR-12 verificable o la campaña de MOTOR-13.
//   npm run audit -- --campaign R1                      (lotes de out/audit/campaign-R1.json)
//   npm run audit -- --lot LOT-xxxx [--root out/batches]
//   npm run audit -- --package <ZIP|directorio>
//   opciones: --out <directorio de informes> · --zip (escribe el paquete de auditoría) · --json
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, ROOT } from './node-data.js';
import { runAudit, saveResult } from '../src/audit/index.js';
import { auditReport, writeAuditPackage, auditFiles, verifyAuditPackage } from '../src/audit/report.js';

const args = process.argv.slice(2); const flag = (k) => args.includes(k); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const { profile } = loadData(); const root = opt('--root', process.env.BEM_BATCH_ROOT ?? join(ROOT, 'out', 'batches')); const specs = [];
if (opt('--campaign')) { const c = JSON.parse(readFileSync(join(ROOT, 'out', 'audit', `campaign-${opt('--campaign')}.json`), 'utf8')); for (const e of c.experiments) specs.push({ kind: 'lote', id: e.batchId, root: c.root }); }
else if (opt('--lot')) for (const id of opt('--lot').split(',')) specs.push({ kind: 'lote', id, root });
else if (opt('--package')) specs.push({ kind: 'paquete', path: opt('--package') });
else { console.error('uso: --campaign <tag> | --lot <id[,id]> | --package <ruta>'); process.exit(2); }
const res = runAudit(specs, { profile });
if (!res.ok) { console.error('AUDITORÍA NO EJECUTADA:', res.reason, res.findings?.[0]?.evidence); process.exit(1); }
const p = saveResult(res); const outDir = opt('--out', join(ROOT, 'out', 'audit', 'informes', res.id)); mkdirSync(outDir, { recursive: true });
const report = auditReport(res, { title: `Informe de auditoría · ${opt('--campaign') ? `campaña ${opt('--campaign')}` : specs.map((s) => s.id ?? s.path).join(', ')}` });
writeFileSync(join(outDir, 'informe-auditoria.md'), report);
if (flag('--json')) console.log(JSON.stringify(res, null, 1));
else { console.log(`auditoría ${res.id} · ${res.sample.matches} partidos (${res.sample.diagnostic} completos) · ${res.elapsed_ms} ms · integridad ${res.integrity.ok ? 'ok' : 'FALLA'}`); for (const r of res.runs) console.log(`${r.id} ${r.resultado.padEnd(10)} ${r.impl.padEnd(10)} ${r.exposicion.padEnd(13)} ${r.findings.length ? `hallazgos ${r.findings.join(',')}` : ''}`); console.log(`hallazgos: ${res.findings.length} · resultado guardado en ${p}`); }
if (flag('--zip')) { const w = await writeAuditPackage(res, join(outDir, `${res.id}.zip`), { report }); const v = verifyAuditPackage(w.path); console.log(`paquete de auditoría: ${w.path} · comprobador ${v.ok ? 'CORRECTO' : 'FALLOS'}`); for (const c of v.checks) console.log(` ${c.status === 'pass' ? '✔' : '✘'} ${c.id} ${c.title}${c.detail ? ` — ${c.detail}` : ''}`); if (!v.ok) process.exit(1); }
void auditFiles;
