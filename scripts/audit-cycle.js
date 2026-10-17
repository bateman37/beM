// Primer ciclo de revisión de MOTOR-13 (§14) sobre la campaña ya ejecutada: audita la evidencia (lectura), compara variantes, revisa la fiabilidad, contrasta la campaña R0 (con el
// defecto de lector) con la R1 (corregido) y escribe la evidencia reproducible en docs/tecnico/evidencia-motor13/. NO simula ningún partido y NO activa ni guarda ninguna candidata.
//   node scripts/audit-cycle.js [--campaign R1] [--baseline R0] [--out docs/tecnico/evidencia-motor13]
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, ROOT } from './node-data.js';
import { runAudit, saveResult } from '../src/audit/index.js';
import { openSource } from '../src/audit/source.js';
import { auditFiles, auditReport, writeAuditPackage, verifyAuditPackage } from '../src/audit/report.js';
import { reviewReliability } from '../src/audit/calibration.js';
import { experimentComparison, COMPARISON_HEADERS } from '../src/audit/compare.js';
import { experimentCatalog } from '../src/audit/experiments.js';
import { csvLine } from '../src/batch/util.js';

const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const tag = opt('--campaign', 'R1'); const baseTag = opt('--baseline', 'R0'); const out = opt('--out', join(ROOT, 'docs/tecnico/evidencia-motor13'));
const { profile, players } = loadData(); const aud = join(ROOT, 'out', 'audit');
const camp = JSON.parse(readFileSync(join(aud, `campaign-${tag}.json`), 'utf8')); const exps = experimentCatalog(profile, players);
mkdirSync(join(out, 'auditoria'), { recursive: true }); mkdirSync(join(out, 'calibracion'), { recursive: true });

// 1. auditoría de lectura
const res = runAudit(camp.experiments.map((e) => ({ kind: 'lote', id: e.batchId, root: camp.root })), { profile }); if (!res.ok) { console.error(res.reason); process.exit(1); }
saveResult(res);
// 2. comparación de variantes
const comp = []; for (const e of camp.experiments) { const src = openSource({ kind: 'lote', id: e.batchId, root: camp.root }); comp.push(...experimentComparison(src, exps.find((x) => x.id === e.experiment))); }
// 3. revisión de la fiabilidad y contraste R0/R1
const rev = reviewReliability(res.reliability, res.params);
let r0 = null; const p0 = join(aud, `campaign-${baseTag}.json`); if (existsSync(p0)) r0 = JSON.parse(readFileSync(p0, 'utf8'));
const traj = []; if (r0) for (const e1 of camp.experiments) { const e0 = r0.experiments.find((x) => x.experiment === e1.experiment); for (const m of e1.matches) { const m0 = e0?.matches.find((x) => x.variant_id === m.variant_id); traj.push({ experiment: e1.experiment, variant: m.variant_id, r0_valid: m0?.valid ?? null, r1_valid: m.valid, same_trajectory: m0?.trajectory_fp === m.trajectory_fp, same_score: m0?.score === m.score, same_draws: m0?.draws === m.draws }); } }
const hyp = { schema: 'beM-audit-hypothesis/1', question: 'Primer ciclo de revisión: ¿hay un defecto demostrado o una desviación con evidencia suficiente para proponer un ajuste de parámetros sobre la campaña inicial?', base: { effective_profile_id: camp.effective_profile_id, audit_version: res.audit_version }, campaign: { tag, experiments: camp.experiments.length, matches: res.sample.matches, diagnostic: res.sample.diagnostic, reduced: res.sample.reduced }, hypotheses_considered: rev.signals.map((s) => { const N = rev.mechanisms - rev.insufficient.length; const pAny = Math.round((1 - (1 - 0.0455) ** N) * 100); return { ...s, decision: 'no se propone cambio', razon: `señal aislada (z=${s.z}, n=${s.n}, ${s.partidos} partidos con diagnóstico completo de dos experimentos) entre ${N} mecanismos con muestra suficiente: se esperaban ≈ ${rev.expectedBySignal} con |z| ≥ 2 solo por azar y la probabilidad de ver al menos una es ≈ ${pAny} %; los acontecimientos de un partido comparten contexto, así que ni siquiera es una muestra de ensayos independientes. Se recomienda AMPLIAR la muestra con diagnóstico completo (Lotes) antes de tocar una probabilidad.`, alternativas_a_descartar: ['fluctuación de muestreo', 'efecto de la composición de plantillas (pocos equipos)', 'defecto del lector del mecanismo (el binario se lee de la misma operación que lo sortea)', 'p0 real mal calibrada (única hipótesis que justificaría tocar una fila)'] }; }), reliability_review: { mechanisms: rev.mechanisms, deterministicViolations: rev.deterministicViolations, signals: rev.signals, insufficient: rev.insufficient.map((x) => x.mecanismo), compatible: rev.compatible.length, expected_by_chance: rev.expectedBySignal, note: rev.note },
  changes: [], effective_rows_changed: 0, expected_effect: null, validation_reserve: { reserved: true, cases: ['EQ01H–EQ02H', 'EQ03–EQ09', 'EQ07–EQ08', 'EQ11–EQ12'], lot_seeds: [132001, 132002, 132003, 132004], launched: false, reason: 'no existe una candidata con cambio real: copias idénticas de la base no validan nada (§13.4); se conserva reservada y no se usó para ajustar' },
  decision: 'Base mantenida con evidencia y límites', decision_state: 'evaluación funcional SEM inicial (no validación externa)', defects_fixed: [{ id: 'DEF-LECTOR-QUINTETOS', cause: 'lector', summary: 'La tabla de quintetos (a) contaba dos veces minutos y puntos de dos alineaciones registradas con los mismos cinco jugadores en puestos distintos y (b) descartaba filas con puntos pero sin tiempo ni posesión completa, de modo que la conciliación analítica AN07/AN09 fallaba en 8 de 24 encuentros de la campaña R0 mientras el acta conciliaba', sport_changed: false }, { id: 'DEF-AUDITOR-AUD07', cause: 'auditor', summary: 'AUD07 leyó prioridad null (ficha llamada fuera del libro, prioridad efectiva 1) como error de rango' }, { id: 'DEF-AUDITOR-AUD13', cause: 'auditor', summary: 'AUD13 comparó la calidad con p_final (probabilidad de la selección) en lugar de p_conversion' }, { id: 'DEF-AUDITOR-AUD26', cause: 'auditor', summary: 'AUD26 trató como «sin receptor» cadenas de saque abiertas al sonar la bocina' }], trajectory_R0_vs_R1: traj, trajectory_unchanged: traj.length ? traj.every((t) => t.same_trajectory && t.same_score && t.same_draws) : null };
writeFileSync(join(out, 'calibracion', 'hipotesis.json'), `${JSON.stringify(hyp, null, 1)}\n`);
writeFileSync(join(out, 'calibracion', 'comparacion.csv'), csvLine(COMPARISON_HEADERS) + comp.map((r) => csvLine(COMPARISON_HEADERS.map((h) => r[h]))).join(''));
// 4. archivos de auditoría + informe + paquete
const files = auditFiles(res); const report = auditReport(res, { title: `Informe de auditoría · campaña inicial ${tag}`, sections: [`## Primer ciclo de calibración\n\n**Decisión: ${hyp.decision}** (${hyp.decision_state}). ${rev.note} Señales con |z| ≥ 2: ${rev.signals.map((s) => `${s.mecanismo} (z=${s.z}, n=${s.n})`).join('; ') || 'ninguna'}. Violaciones deterministas p=0/p=1: ${rev.deterministicViolations.length}. Mecanismos con muestra insuficiente: ${rev.insufficient.length}.`, `## Campaña R0 frente a R1\n\nLa campaña R0 (24 encuentros) dejó 8 encuentros con la conciliación analítica en fallo por un defecto de lector; tras corregirlo se repitió con las mismas entradas y semillas (R1): ${traj.length ? `${traj.filter((t) => t.same_trajectory).length}/${traj.length} trayectorias idénticas, ${traj.filter((t) => t.r1_valid).length}/${traj.length} válidos` : 'sin R0 disponible'}.`] });
for (const [p, c] of Object.entries(files)) if (!p.endsWith('sensibilidad.csv') || c.length < 400000) { mkdirSync(join(out, p.split('/').slice(0, -1).join('/')), { recursive: true }); writeFileSync(join(out, p), c); }
writeFileSync(join(out, 'informe-auditoria.md'), report);
const w = await writeAuditPackage(res, join(aud, 'informes', `${res.id}-${tag}.zip`), { report, extra: { 'calibracion/hipotesis.json': readFileSync(join(out, 'calibracion', 'hipotesis.json'), 'utf8'), 'calibracion/comparacion.csv': readFileSync(join(out, 'calibracion', 'comparacion.csv'), 'utf8') } }); const v = verifyAuditPackage(w.path);
console.log(`auditoría ${res.id}: ${res.sample.matches} partidos, ${res.findings.length} hallazgos, comprobador del paquete ${v.ok ? 'CORRECTO' : 'FALLOS'} · ${w.path}`);
console.log('señales |z|≥2:', rev.signals.map((s) => `${s.mecanismo} z=${s.z}`).join(', ') || 'ninguna', '· insuficientes:', rev.insufficient.length, '· compatibles:', rev.compatible.length, '· esperadas por azar:', rev.expectedBySignal);
console.log('R0→R1 trayectoria sin cambio:', hyp.trajectory_unchanged, `(${traj.length} encuentros)`);
console.log('comparaciones:', comp.length, 'filas');
