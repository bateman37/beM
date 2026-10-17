// AUD29 (MOTOR-14 §11.4): lectura de informes de equivalencia `beM-equivalence-report/1`. El informe lo produce `npm run equivalence` (o la campaña de cierre), que SÍ ejecuta encuentros con las mismas
// entradas en distintas modalidades, velocidades, niveles de registro y continuaciones; la auditoría solo LEE el informe (no simula). Una comparación sobre entradas distintas es INCOMPATIBLE, no un
// fallo del motor, y una equivalencia deducida de «comparten función» sin comparación NO se acepta como conforme.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const EQUIVALENCE_SCHEMA = 'beM-equivalence-report/1';
// Familias que deben tener al menos una comparación compatible para que la auditoría pueda declararse conforme.
export const EQUIVALENCE_FAMILIES = {
  modalidad: 'simulado total, por cuartos y por tiempo con las mismas entradas y delegación',
  velocidad: 'x2/x4/x8/x16 y pausas del controlador de visionado',
  registro: 'registro completo y reducido (con y sin prosa)',
  continuacion: 'continuación desde un guardado frente a ejecución sin interrupción',
  frontera: 'guardado con una consecuencia o administración pendiente',
};

export const reportSeal = (body) => createHash('sha256').update(JSON.stringify(body)).digest('hex');
export function sealReport(body) { return { ...body, seal: reportSeal(body) }; }
export function verifyReport(r) {
  const problems = [];
  if (!r || r.schema !== EQUIVALENCE_SCHEMA) return { ok: false, problems: ['esquema no reconocido'] };
  const { seal, ...body } = r;
  if (seal !== reportSeal(body)) problems.push('el sello del informe no coincide (copia alterada)');
  if (!Array.isArray(r.comparisons) || !r.comparisons.length) problems.push('sin comparaciones');
  return { ok: problems.length === 0, problems };
}

export function loadEquivalenceReports(dir) {
  if (!dir || !existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    try { const r = JSON.parse(readFileSync(join(dir, f), 'utf8')); if (r?.schema === EQUIVALENCE_SCHEMA) out.push({ ...r, _file: f, _verify: verifyReport(r) }); } catch { /* archivo ajeno: se ignora */ }
  }
  return out;
}

// Evaluación pura sobre los informes cargados.
export function evaluateEquivalence(reports) {
  const valid = reports.filter((r) => r._verify?.ok ?? verifyReport(r).ok);
  const rejected = reports.filter((r) => !(r._verify?.ok ?? verifyReport(r).ok));
  const cmps = valid.flatMap((r) => r.comparisons.map((c) => ({ ...c, report: r.id })));
  const compatible = cmps.filter((c) => c.compatible); const incompatible = cmps.filter((c) => !c.compatible);
  const diffs = compatible.filter((c) => c.equal === false);
  const covered = {}; for (const fam of Object.keys(EQUIVALENCE_FAMILIES)) covered[fam] = compatible.filter((c) => c.family === fam).length;
  const missing = Object.keys(EQUIVALENCE_FAMILIES).filter((f) => !covered[f]);
  return { reports: valid.length, rejected: rejected.map((r) => ({ file: r._file, problems: r._verify?.problems })), comparisons: cmps.length, compatible: compatible.length, incompatible: incompatible.length, differences: diffs, covered, missing };
}
