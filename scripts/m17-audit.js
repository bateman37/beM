// MOTOR-17 §16: ejecuta AUD01–32 sobre los diagnósticos de UNA versión (R0 o R17), nunca mezcladas, con el lector del árbol indicado (`--tree`). Para R0 se conservan dos lecturas de los mismos archivos: la de su propio lector
// (R0) y la del lector corregido (R17), identificadas por versión de lector. No simula ni modifica nada: lee lotes ya conservados. Un «inconcluso» no se cambia.
// Uso: node scripts/m17-audit.js --tree=/ruta --plan=out/motor17/plan/lotes-R0.json --lots-root=out/motor17/lotes/R0 --label=R0-lectorR0 [--out=out/motor17/auditoria] [--zip]
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const TREE = arg('tree', null); const PLAN = arg('plan', null); const LOTS = arg('lots-root', null); const LABEL = arg('label', null); const OUT = arg('out', 'out/motor17/auditoria'); const ZIP = process.argv.includes('--zip'); const EQV = arg('equivalence-dir', null);
if (!TREE || !PLAN || !LOTS || !LABEL) { console.error('uso: --tree --plan --lots-root --label'); process.exit(2); }
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const { loadData } = await imp('scripts/node-data.js'); const { runAudit } = await imp('src/audit/index.js'); const R = await imp('src/audit/report.js'); const { PROJECTION_VERSION } = await imp('src/audit/project.js');
const { profile, players } = loadData(); const plan = JSON.parse(readFileSync(PLAN, 'utf8')); const dir = join(OUT, LABEL); mkdirSync(dir, { recursive: true });
const lots = plan.lots.filter((l) => l.kind === 'diagnostico'); const specs = lots.map((l) => ({ kind: 'lote', id: l.batch_id, root: LOTS }));
const t0 = performance.now(); const res = runAudit(specs, { profile, players, auditRoot: join(dir, 'raiz-auditoria'), ...(EQV ? { equivalenceDir: EQV } : {}) });
if (!res.ok) { console.error('AUDITORÍA NO EJECUTADA:', res.reason); process.exit(1); }
const report = R.auditReport(res, { title: `Informe de auditoría · ${LABEL} (${lots.length} diagnósticos de ${plan.version})` });
writeFileSync(join(dir, 'informe-auditoria.md'), report);
const files = R.auditFiles(res); for (const [k, v] of Object.entries(files)) { const p = join(dir, k.replace(/^auditoria\//, '')); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, v); }
const meta = { label: LABEL, version_de_codigo_auditado: plan.version, lector: { tree: TREE, projection: PROJECTION_VERSION, audit_version: res.audit_version, result_id: res.id }, lotes: lots.map((l) => ({ label: l.label, batch_id: l.batch_id })), partidos: res.sample, ms: Math.round(performance.now() - t0) };
writeFileSync(join(dir, 'lectura.json'), JSON.stringify(meta, null, 1));
const cnt = {}; for (const r of res.runs) cnt[r.resultado] = (cnt[r.resultado] ?? 0) + 1; console.log(`${LABEL}: ${res.id} · ${res.sample.matches} partidos (${res.sample.diagnostic} completos) · integridad ${res.integrity.ok ? 'ok' : 'FALLA'} · ${JSON.stringify(cnt)} · ${meta.ms} ms`);
if (ZIP) { const w = await R.writeAuditPackage(res, join(dir, `${res.id}.zip`), { report }); const v = R.verifyAuditPackage(w.path); console.log(`paquete ${w.path} · comprobador ${v.ok ? 'CORRECTO' : 'FALLOS'}`); if (!v.ok) process.exit(1); }
