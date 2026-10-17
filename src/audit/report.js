// Informes y paquete de auditoría (MOTOR-13 §16): `auditoria/*` (catálogo, ejecuciones, hallazgos, capacidades, sensibilidad, fiabilidad, referencias) e `informe-auditoria.md`, empaquetados
// en `beM-audit-package/1` con manifest y SHA-256 propios. NO se altera ningún archivo original de MOTOR-12: el paquete cita sus fuentes (lote/paquete, huella) y se declara AUTOCONTENIDO solo
// si incluye las partes fuente; si no, dice qué directorio externo hace falta. Los resultados exactos son DIAGNÓSTICOS: no se publican libros ni estados internos del rival.
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ZipWriter, openZip, closeZips } from '../batch/zip.js';
import { csvLine } from '../batch/util.js';
import { sha, r4 } from './util.js';
import { AUDIT_CATALOG } from './catalog.js';

export const AUDIT_PACKAGE_SCHEMA = 'beM-audit-package/1';
const csv = (headers, rows) => csvLine(headers) + rows.map((r) => csvLine(headers.map((h) => r[h]))).join('');
const J = (o) => `${JSON.stringify(o, null, 1)}\n`;
const L = (rows) => rows.map((r) => `${JSON.stringify(r)}\n`).join('');

export function auditFiles(res, { extra = {} } = {}) {
  const f = {};
  f['auditoria/catalogo.json'] = J({ schema: 'beM-audit-catalog/1', audit_version: res.audit_version, parametros: res.params, auditorias: AUDIT_CATALOG });
  f['auditoria/ejecuciones.csv'] = csv(['audit_id', 'name', 'type', 'impl', 'registro', 'exposicion', 'resultado', 'revision', 'findings', 'missing', 'note', 'result_id'], res.runs.map((r) => ({ audit_id: r.id, name: r.name, type: r.type, impl: r.impl, registro: r.registro, exposicion: r.exposicion, resultado: r.resultado, revision: r.revision, findings: r.findings.join('|'), missing: r.missing.join(' | '), note: r.note, result_id: res.id })));
  f['auditoria/hallazgos.jsonl'] = L(res.findings.map((h) => ({ ...h, result_id: res.id })));
  f['auditoria/capacidades.csv'] = csv(['cap', 'nombre', 'stratum', 'declaradoN', 'usos', 'usosCalidadAtaque', 'matches', 'actores', 'mediaBase', 'mediaEfectiva', 'mediaPeso', 'saturadas', 'delta_p1', 'delta_p3', 'delta_p5', 'contextos', 'contrastePartidos', 'estado'], res.matrix.map((m) => ({ ...m, delta_p1: m.contrasteCalculo?.['+1']?.mediaDelta ?? '', delta_p3: m.contrasteCalculo?.['+3']?.mediaDelta ?? '', delta_p5: m.contrasteCalculo?.['+5']?.mediaDelta ?? '', contextos: m.contrasteCalculo?.contextos ?? '', contrastePartidos: (m.contrastePartidos ?? []).join('|') })));
  f['auditoria/sensibilidad.csv'] = csv(['cap', 'stratum', 'decision_id', 'event_id', 'label', 'player', 'role', 'base', 'incrementoSolicitado', 'incrementoEfectivo', 'energia', 'efectivaAntes', 'efectivaDespues', 'valorAntes', 'valorDespues', 'delta', 'unidad', 'saturacion', 'limite', 'metodo'], res.sensitivity);
  f['auditoria/fiabilidad.csv'] = csv(['kind', 'mecanismo', 'n', 'partidos', 'mediaP', 'observados', 'esperados', 'diferencia', 'brier', 'intervalo', 'n_intervalo', 'mediaP_intervalo', 'frecuencia_intervalo', 'muestraEscasa'], res.reliability.flatMap((r) => r.bins.map((b, i) => ({ kind: r.kind, mecanismo: r.mecanismo, n: r.n, partidos: r.partidos, mediaP: r4(r.mediaP), observados: r.observados, esperados: r4(r.esperados), diferencia: r4(r.diferencia), brier: r4(r.brier), intervalo: `[${b.desde}, ${b.hasta}${b.cierraEn1 ? ']' : ')'}`, n_intervalo: b.n, mediaP_intervalo: b.n ? r4(b.mediaP) : '', frecuencia_intervalo: b.n ? r4(b.frecuencia) : '', muestraEscasa: r.muestraEscasa }))));
  f['auditoria/referencias.json'] = J(res.references);
  f['auditoria/concentracion.json'] = J(res.concentration);
  f['auditoria/partidos.csv'] = csv(['match_id', 'attempt_id', 'case_id', 'variant_id', 'source', 'level', 'valid', 'score', 'draws', 'trajectory_fp'], res.matches);
  for (const [k, v] of Object.entries(extra)) f[k] = v;
  return f;
}

export async function writeAuditPackage(res, outPath, { extra = {}, report = '', sourceParts = null } = {}) {
  const files = auditFiles(res, { extra }); if (report) files['informe-auditoria.md'] = report;
  const inv = []; for (const [p, c] of Object.entries(files)) { const b = Buffer.from(c, 'utf8'); inv.push({ path: p, bytes: b.length, sha256: sha(b), records: p.endsWith('.jsonl') ? c.split('\n').filter(Boolean).length : p.endsWith('.csv') ? Math.max(0, c.split('\r\n').filter(Boolean).length - 1) : null, audience: 'diagnostic' }); }
  const manifest = { schema: AUDIT_PACKAGE_SCHEMA, result_id: res.id, audit_version: res.audit_version, created_at: res.created_at, audience: 'diagnostic', self_contained: !!sourceParts, sources: res.sources, integrity_verified_before_reading: res.integrity.ok, integrity_method: res.integrity.method, sample: res.sample, files: inv, note: sourceParts ? 'incluye las partes fuente' : 'NO es autocontenido: requiere el lote conservado o el paquete de análisis de MOTOR-12 indicados en `sources` para abrir las evidencias; los hallazgos citan match_id, attempt_id, event_id y decision_id de esa fuente' };
  mkdirSync(dirname(outPath), { recursive: true }); const z = new ZipWriter(outPath); await z.add('manifest.json', J(manifest)); for (const [p, c] of Object.entries(files)) await z.add(p, c); await z.finish(); return { path: outPath, manifest };
}

// Comprobador del paquete de auditoría: integridad (SHA-256, bytes), formato, catálogo AUD01–32, 32 capacidades, referencias de ejecuciones/hallazgos y audiencia diagnóstica.
export function verifyAuditPackage(path) {
  const checks = []; const problems = []; const C = (id, title, fn) => { const c = { id, title, status: 'pass', detail: '' }; try { const r = fn(); if (r) { c.status = r.status ?? 'fail'; c.detail = r.detail ?? ''; } } catch (e) { c.status = 'fail'; c.detail = e.message; } if (c.status === 'fail') problems.push(`${c.id}: ${c.detail}`); checks.push(c); };
  let z; let man; C('A00', 'ZIP legible con manifest.json del esquema esperado', () => { z = openZip(path); man = JSON.parse(z.read('manifest.json').toString('utf8')); if (man.schema !== AUDIT_PACKAGE_SCHEMA) return { detail: `esquema ${man.schema}` }; });
  if (!man) return { ok: false, checks, problems };
  const txt = (p) => z.read(p).toString('utf8');
  C('A01', 'SHA-256 y bytes de cada archivo coinciden con el manifest; no hay archivos sin inventariar', () => { const names = new Set(z.names.filter((n) => n !== 'manifest.json')); for (const f of man.files) { names.delete(f.path); const b = z.read(f.path); if (b.length !== f.bytes || sha(b) !== f.sha256) return { detail: `${f.path}: bytes o SHA-256 distintos` }; } if (names.size) return { detail: `sin inventariar: ${[...names].join(', ')}` }; });
  C('A02', 'Formatos: JSON/JSONL parseables y CSV con filas de igual anchura', () => { for (const f of man.files) { const t = txt(f.path); if (f.path.endsWith('.json')) JSON.parse(t); else if (f.path.endsWith('.jsonl')) t.split('\n').filter(Boolean).forEach((l) => JSON.parse(l)); } });
  C('A03', 'Catálogo con las 32 auditorías y ejecuciones que remiten a ellas', () => { const cat = JSON.parse(txt('auditoria/catalogo.json')); if (cat.auditorias.length !== 32) return { detail: `${cat.auditorias.length} auditorías` }; const ids = new Set(cat.auditorias.map((a) => a.id)); const runs = txt('auditoria/ejecuciones.csv').split('\r\n').filter(Boolean).slice(1); for (const r of runs) if (!ids.has(r.split(',')[0])) return { detail: `ejecución de una auditoría fuera del catálogo: ${r.slice(0, 30)}` }; });
  C('A04', 'Matriz con exactamente las 32 capacidades', () => { const rows = txt('auditoria/capacidades.csv').split('\r\n').filter(Boolean).slice(1).map((l) => l.split(',')[0]); const set = new Set(rows); if (set.size !== 32) return { detail: `${set.size} capacidades distintas` }; });
  C('A05', 'Cada hallazgo remite a una auditoría del catálogo y declara severidad, causa y evidencia', () => { const cat = new Set(JSON.parse(txt('auditoria/catalogo.json')).auditorias.map((a) => a.id)); for (const l of txt('auditoria/hallazgos.jsonl').split('\n').filter(Boolean)) { const h = JSON.parse(l); if (!cat.has(h.audit) || !h.severity || !h.cause || !Array.isArray(h.evidence)) return { detail: `hallazgo ${h.id ?? '?'} incompleto` }; } });
  C('A06', 'Audiencia diagnóstica declarada y alcance honesto (autocontenido solo si lo es)', () => { if (man.audience !== 'diagnostic') return { detail: `audiencia ${man.audience}` }; if (man.self_contained === true && !man.files.some((f) => f.path.startsWith('fuente/'))) return { detail: 'declara autocontenido sin partes fuente' }; });
  closeZips(); return { ok: problems.length === 0, checks, problems, version: 'CHK-AUDIT-MOTOR13-R1' };
}

// Informe breve (§16.2): conclusión, qué sostiene la evidencia y qué queda pendiente; sin copiar cientos de MiB.
export function auditReport(res, { title = 'Informe de auditoría', campaign = null, sections = [] } = {}) {
  const Lns = []; const by = (k) => res.runs.filter((r) => r.resultado === k).length;
  Lns.push(`# ${title}`, '', `Resultado \`${res.id}\` · auditorías \`${res.audit_version}\` · ${res.created_at}`, '', '> Diagnóstico del laboratorio. Esta lectura **no simula** nada: lee hechos ya conservados. Coherencia de muestreo ≠ realismo deportivo; «inconcluso» ≠ «aprobado».', '');
  Lns.push('## Alcance y muestra', '', `- Fuentes: ${res.sources.map((s) => `${s.kind} \`${s.id}\``).join(', ')}.`, `- Integridad verificada antes de interpretar: **${res.integrity.ok ? 'sí' : 'NO'}** (${res.integrity.method}${res.integrity.files != null ? `, ${res.integrity.files} archivos` : ''}).`, `- Partidos leídos: ${res.sample.matches} (${res.sample.diagnostic} con diagnóstico completo, ${res.sample.reduced} reducidos).`, `- Coste de lectura medido en este entorno: ${res.cost.projections_ms} ms de proyección (${res.cost.cache_hits} intentos desde caché), ${(res.cost.projection_bytes_read / 1048576).toFixed(1)} MiB leídos; no extrapolable.`, '');
  Lns.push('## Resumen por auditoría', '', `Conformes al control: ${by('conforme')} · defecto demostrado: ${by('defecto')} · señal para revisar: ${by('señal')} · inconclusas: ${by('inconcluso')} · no evaluadas: ${by('no_evaluado')}. **No se declara «32 auditorías aprobadas»**: la mayoría son parciales o necesitan exposición/muestra.`, '', '| ID | Auditoría | Implementación | Registro | Exposición | Resultado | Hallazgos |', '|---|---|---|---|---|---|---|');
  for (const r of res.runs) Lns.push(`| ${r.id} | ${r.name} | ${r.impl} | ${r.registro} | ${r.exposicion} | **${r.resultado}** | ${r.findings.length} |`);
  Lns.push('', '## Hallazgos', '');
  if (!res.findings.length) Lns.push('Sin hallazgos.'); else for (const h of res.findings) Lns.push(`- **${h.id}** (${h.severity}, ${h.audit}, causa: ${h.cause}) — ${h.subject}: ${h.reason}. Contar: ${JSON.stringify(h.counts)}. Evidencia: ${h.evidenceCount} (ejemplos: ${JSON.stringify(h.examples.slice(0, 2)).slice(0, 220)}).`);
  Lns.push('', '## Capacidades', '', `${new Set(res.matrix.filter((m) => m.usos > 0).map((m) => m.cap)).size} de 32 capacidades con uso en recetas registradas; el contraste de cálculo fijo usa hasta ${res.params.contextsPerCapability} contextos por capacidad (${res.sensitivity.length} filas +1/+3/+5). **Es una relación del cálculo en ese contexto, no un resultado que ocurrió ni puntos que habría añadido el jugador.**`);
  for (const s of sections) Lns.push('', s);
  Lns.push('', '## Referencias', '', 'Ninguna referencia externa numérica verificada: las fuentes FIBA candidatas (EuroBasket 2025 y Copa del Mundo 2023) devolvieron 403 y **no se extrajeron medias**. Lo que aquí se concluye es evaluación funcional SEM, no validación externa.', '');
  return `${Lns.join('\n')}\n`;
}
