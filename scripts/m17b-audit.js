// MOTOR-17B §5.4/§6: ejecuta AUD01–32 sobre los doce diagnósticos de M17B (nunca mezclados con CONTROL17, que solo conserva el nivel esencial) con hasta ocho contextos reales por capacidad (+1/+3/+5: máximo 768 filas principales).
// No simula ni modifica nada: lee lotes ya conservados. `resumen.json`, los CSV, el informe y la cobertura del paquete salen de ESTA ejecución. Un «inconcluso» no se cambia.
// El máximo de ocho contextos es un parámetro de ESTA ejecución (el perfil conserva `audit.contextsPerCapability`); queda registrado en `catalogo.json` y en `lectura.json`.
// Uso: node scripts/m17b-audit.js --tree=/ruta --plan=out/motor17b/plan/lotes-M17B.json --lots-root=out/motor17b/lotes/M17B [--out=out/motor17b/auditoria] [--label=M17B] [--zip] [--commit=<sha>]
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const TREE = arg('tree', null); const PLAN = arg('plan', null); const LOTS = arg('lots-root', null); const LABEL = arg('label', 'M17B'); const OUT = arg('out', 'out/motor17b/auditoria'); const ZIP = process.argv.includes('--zip'); const COMMIT = arg('commit', null); const PER_CAP = Number(arg('contexts', 8));
if (!TREE || !PLAN || !LOTS) { console.error('uso: --tree --plan --lots-root'); process.exit(2); }
const imp = (p) => import(pathToFileURL(`${TREE}/${p}`).href);
const { loadData } = await imp('scripts/node-data.js'); const { runAudit } = await imp('src/audit/index.js'); const R = await imp('src/audit/report.js'); const { PROJECTION_VERSION } = await imp('src/audit/project.js'); const { ENGINE_VERSION } = await imp('src/match/index.js');
const { profile, players } = loadData(); const plan = JSON.parse(readFileSync(PLAN, 'utf8')); const dir = join(OUT, LABEL); mkdirSync(dir, { recursive: true });
const lots = plan.lots.filter((l) => l.kind === 'diagnostico'); const specs = lots.map((l) => ({ kind: 'lote', id: l.batch_id, root: LOTS }));
const params = { ...profile.audit, contextsPerCapability: PER_CAP }; const identity = { study: plan.study, code_version: `${LABEL}${COMMIT ? `@${COMMIT.slice(0, 12)}` : ''}`, engine: ENGINE_VERSION };
const t0 = performance.now(); const res = runAudit(specs, { profile, players, params, identity, auditRoot: join(dir, 'raiz-auditoria') });
if (!res.ok) { console.error('AUDITORÍA NO EJECUTADA:', res.reason); process.exit(1); }
const report = R.auditReport(res, { title: `Informe de auditoría · ${LABEL} (${lots.length} diagnósticos de ${plan.study})` });
writeFileSync(join(dir, 'informe-auditoria.md'), report);
const files = R.auditFiles(res); for (const [k, v] of Object.entries(files)) { const p = join(dir, k.replace(/^auditoria\//, '')); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, v); }
// contextos de contraste con las entradas de la operación real (lo que permite reproducir cada fila sin re-simular): uno por línea, identidad global estudio · versión de código · lote · intento · decisión
writeFileSync(join(dir, 'contextos-contraste.jsonl'), Object.entries(res.selected_contexts).flatMap(([cap, list]) => list.map((c) => JSON.stringify({ study: identity.study, code_version: identity.code_version, cap, stratum: c.stratum, gdec: c.gdec, decision_id: c.decision_id, event_id: c.event_id, label: c.label, player: c.player, role: c.rol, base: c.base, efectiva: c.eff, energia: c.energia, tope: c.taskMax, topeRegistrado: c.topeRegistrado, valor: c.valor, limite: !!c.limite, sinSalida: !!c.sinSalida, terminos: c.terminos, operaciones: (c.ops ?? []).map((o) => ({ operacion: o.op, entrada_de_la_operacion: o.refKey, peso: o.peso, lado: o.lado, nota: o.note })), ...(c.ex ? { entradas_derivadas: { mix: c.ex.mix ?? null, aceptacion: c.ex.accept ?? null } } : {}) }))).map((l) => `${l}\n`).join(''));
const meta = { label: LABEL, study: plan.study, version_de_codigo_auditado: COMMIT, engine: ENGINE_VERSION, lector: { tree: TREE, projection: PROJECTION_VERSION, audit_version: res.audit_version, result_id: res.id }, parametros_de_esta_ejecucion: { contextsPerCapability: PER_CAP, sensitivityIncrements: params.sensitivityIncrements, nota: 'el perfil conserva audit.contextsPerCapability; MOTOR-17B fija ocho contextos por capacidad para la auditoría de cierre' }, lotes: lots.map((l) => ({ label: l.label, batch_id: l.batch_id })), partidos: res.sample, ms: Math.round(performance.now() - t0) };
writeFileSync(join(dir, 'lectura.json'), JSON.stringify(meta, null, 1));
const cnt = {}; for (const r of res.runs) cnt[r.resultado] = (cnt[r.resultado] ?? 0) + 1; const a5 = res.runs.find((r) => r.id === 'AUD05');
console.log(`${LABEL}: ${res.id} · ${res.sample.matches} partidos (${res.sample.diagnostic} completos) · integridad ${res.integrity.ok ? 'ok' : 'FALLA'} · ${JSON.stringify(cnt)} · ${meta.ms} ms`);
console.log(`AUD05 ${a5.resultado}: ${JSON.stringify({ observadas: a5.metrics.capacidadesObservadasEnCalculos, conSalida: a5.metrics.capacidadesConSalidaPertinenteContrastada, exactas: a5.metrics.capacidadesConSalidaExacta, pendientes: a5.metrics.pendientesDeContraste, sinExposicion: a5.metrics.sinExposicionEnLaEvidencia, filas: res.sensitivity.length })}`);
if (ZIP) { const w = await R.writeAuditPackage(res, join(dir, `${res.id}.zip`), { report }); const v = R.verifyAuditPackage(w.path); console.log(`paquete ${w.path} · comprobador ${v.ok ? 'CORRECTO' : 'FALLOS'}`); if (!v.ok) process.exit(1); }
