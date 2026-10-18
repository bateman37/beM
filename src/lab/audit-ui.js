// Pestaña «Auditorías» (MOTOR-13 §15): catálogo AUD01–32 (definición ≠ resultado), selección y verificación de la evidencia, análisis de LECTURA (no simula), hallazgos navegables, matriz de 32
// capacidades con contraste de cálculo fijo, fiabilidad y concentración, experimentos EXP13 (que SÍ lanzan partidos, rotulado aparte) y candidatas desde un hallazgo. Sin nota global del
// motor ni porcentaje de cobertura que mezcle implementado, observado y validado. El navegador solo consulta: el servidor lee `out/batches/` y guarda resultados en `out/audit/`.
import { h, table } from './dom.js';
import { store } from './store.js';
import { AUDIT_CATALOG, AREAS } from '../audit/catalog.js';

const API = '/api/audit';
const pill = (t, c = '') => h('span', { class: `pill ${c}` }, t);
const fmt = (x, d = 3) => (x == null || x === '' ? '—' : Number(x).toFixed(d));
const RES_CLS = { conforme: 'ok', defecto: 'bad', señal: 'warn', inconcluso: '', no_evaluado: '' };
const ui = { root: null, msg: null, lots: [], sel: new Set(), previews: null, results: [], resultId: null, result: null, filters: { area: '', type: '', res: '', q: '' }, tab: 'catalog', finding: null, capFilter: { cap: '', q: '' }, exps: null, busy: false };

async function api(path, opts = {}) { const r = await fetch(`${API}/${path}`, { ...opts, headers: { 'Content-Type': 'application/json' } }); const text = await r.text(); let body; try { body = JSON.parse(text); } catch { body = { raw: text }; } return { status: r.status, body }; }
const post = (path, data) => api(path, { method: 'POST', body: JSON.stringify(data ?? {}) });

export function renderAudit(root) {
  ui.root = root; repaint();
  Promise.all([api('sources'), api('results')]).then(([s, r]) => { ui.lots = s.body.lots ?? []; ui.results = r.body.results ?? []; if (!ui.resultId && ui.results[0]) return load(ui.results[0].id); repaint(); })
    .catch(() => { ui.msg = 'El servicio de auditoría no responde: arranca el laboratorio con «npm run dev» (la auditoría lee los lotes del servidor local).'; repaint(); });
}
async function load(id) { const r = await api(`results/${id}`); if (r.status === 200) { ui.resultId = id; ui.result = r.body; const [m, rel, conc] = await Promise.all([api(`results/${id}/matrix`), api(`results/${id}/reliability`), api(`results/${id}/concentration`)]); ui.result.matrix = m.body.matrix; ui.result.reliability = rel.body.reliability; ui.result.concentration = conc.body; } repaint(); }
function repaint() { const root = ui.root; if (!root) return; const y = window.scrollY; root.replaceChildren(); paint(root); window.scrollTo(0, y); }

function paint(root) {
  root.append(h('h2', {}, 'Auditorías, sensibilidad y calibración'),
    h('p', { class: 'small muted' }, 'Recorrido: elegir evidencia → verificar integridad → analizar (lectura: NO simula) → hallazgos y matriz → contrastes y candidatas. «Inconcluso» no es «aprobado»; la coherencia de muestreo no demuestra realismo deportivo; una muestra pequeña no es un fallo.'),
    ui.msg ? h('div', { class: 'card', id: 'audit-msg', role: 'status' }, ui.msg) : null, sourceCard(),
    h('div', { class: 'row', id: 'audit-tabs' }, ...[['catalog', 'Catálogo AUD01–32'], ['findings', 'Hallazgos'], ['matrix', 'Matriz de 32 capacidades'], ['reliab', 'Fiabilidad y distribuciones'], ['conc', 'Concentración'], ['exps', 'Experimentos EXP13'], ['calib', 'Calibración y candidatas'], ['dl', 'Informe y descargas']].map(([k, t]) => h('button', { type: 'button', class: `btn ${ui.tab === k ? '' : 'secondary'}`, id: `audit-tab-${k}`, onclick: () => { ui.tab = k; if (k === 'exps' && !ui.exps) loadExps(); repaint(); } }, t))),
    ({ catalog: catalogCard, findings: findingsCard, matrix: matrixCard, reliab: reliabCard, conc: concCard, exps: expsCard, calib: calibCard, dl: dlCard })[ui.tab]());
}

// ------------------------------------------------------------------------------------------------------------------------------ fuente y verificación
function sourceCard() {
  const rows = ui.lots.map((l) => ({ cells: [h('input', { type: 'checkbox', 'aria-label': `elegir ${l.batch_id}`, checked: ui.sel.has(l.batch_id), onchange: (e) => { if (e.target.checked) ui.sel.add(l.batch_id); else ui.sel.delete(l.batch_id); for (const b of ['audit-verify', 'audit-run']) { const el = document.getElementById(b); if (el) el.disabled = ui.busy || !ui.sel.size; } } }), l.batch_id, l.label ?? '', pill(l.state, l.state === 'completado' ? 'ok' : ''), l.executions ?? '—'] }));
  return h('div', { class: 'card', id: 'audit-source' }, h('h3', { style: 'margin-top:0' }, '1 · Evidencia disponible'),
    h('p', { class: 'small muted' }, 'Lotes conservados en el servidor (`out/batches/`). Analizar los lee y calcula diagnósticos: no ejecuta ningún partido. El nivel reducido no conserva decisiones calculadas: lo que las necesite saldrá «inconcluso».'),
    ui.lots.length ? table(['', 'Lote', 'Etiqueta', 'Estado', 'Ejecuciones'], rows) : h('p', { class: 'small' }, 'No hay lotes conservados todavía. Crea uno en «Lotes» o lanza un experimento EXP13.'),
    h('div', { class: 'row' }, h('button', { class: 'btn secondary', type: 'button', id: 'audit-verify', disabled: ui.busy || !ui.sel.size, onclick: verify }, 'Verificar integridad (sin interpretar)'),
      h('button', { class: 'btn', type: 'button', id: 'audit-run', disabled: ui.busy || !ui.sel.size, onclick: run }, 'Analizar la evidencia elegida (lectura, no simula)'),
      ui.busy ? h('span', { class: 'small muted' }, 'trabajando…') : null),
    ui.previews ? table(['Fuente', 'Integridad', 'Archivos', 'Encuentros', 'Niveles', 'Válidos'], ui.previews.map((p) => [p.source?.id ?? '', p.error ? pill(p.error, 'bad') : p.integrity.ok ? pill('verificada', 'ok') : pill(`FALLA: ${p.integrity.problems[0] ?? ''}`, 'bad'), p.integrity?.files ?? '—', p.matches ?? '—', (p.levels ?? []).join(', '), p.valid ?? '—'])) : null,
    ui.results.length ? h('div', { class: 'row small' }, 'Resultados guardados: ', h('select', { id: 'audit-result', 'aria-label': 'resultado guardado', onchange: (e) => load(e.target.value) }, ui.results.map((r) => h('option', { value: r.id, selected: r.id === ui.resultId }, `${r.id} · ${r.created_at?.slice(0, 19)} · ${r.matches} partidos · ${r.findings} hallazgos`)))) : null);
}
const sources = () => [...ui.sel].map((id) => ({ kind: 'lote', id }));
async function verify() { ui.busy = true; repaint(); const r = await post('preview', { sources: sources() }); ui.previews = r.body.previews; ui.busy = false; repaint(); }
async function run() { ui.busy = true; ui.msg = null; repaint(); const r = await post('run', { sources: sources(), params: store.profile?.audit ?? store.baseNew?.audit }); ui.busy = false;
  if (!r.body.ok) { ui.msg = `La auditoría no se ejecutó: ${r.body.reason}`; repaint(); return; }
  ui.msg = `Auditoría ${r.body.id}: ${r.body.summary.sample.matches} partidos leídos (${r.body.summary.sample.diagnostic} con diagnóstico completo), ${r.body.summary.findings} hallazgos. ${r.body.summary.executor}.`;
  const l = await api('results'); ui.results = l.body.results; await load(r.body.id); }

// ------------------------------------------------------------------------------------------------------------------------------ catálogo
function catalogCard() {
  const f = ui.filters; const run = (id) => ui.result?.runs?.find((r) => r.id === id);
  const rows = AUDIT_CATALOG.filter((a) => (!f.area || a.area === f.area) && (!f.type || a.type === f.type) && (!f.res || (run(a.id)?.resultado ?? 'sin ejecutar') === f.res) && (!f.q || `${a.id} ${a.name} ${a.question}`.toLowerCase().includes(f.q.toLowerCase())));
  const sel = (key, label, opts) => h('label', { class: 'small' }, `${label} `, h('select', { id: `audit-f-${key}`, 'aria-label': label, onchange: (e) => { f[key] = e.target.value; repaint(); } }, [['', 'todas'], ...opts].map(([v, t]) => h('option', { value: v, selected: f[key] === v }, t ?? v))));
  return h('div', { class: 'card', id: 'audit-catalog' }, h('h3', { style: 'margin-top:0' }, 'Catálogo de auditorías: definición, estado y ejecución real'),
    h('p', { class: 'small muted' }, 'Una auditoría definida no es una auditoría ejecutada ni aprobada. Las columnas separan implementación del mecanismo, registro, exposición y resultado.'),
    h('div', { class: 'row' }, sel('area', 'Área', AREAS.map((a) => [a, a])), sel('type', 'Tipo de control', ['determinista', 'señal', 'descriptivo', 'cobertura'].map((a) => [a, a])), sel('res', 'Resultado', ['conforme', 'defecto', 'señal', 'inconcluso', 'no_evaluado', 'sin ejecutar'].map((a) => [a, a])), h('input', { type: 'search', id: 'audit-f-q', 'aria-label': 'buscar', placeholder: 'buscar', value: f.q, onchange: (e) => { f.q = e.target.value; repaint(); } })),
    table(['ID', 'Auditoría', 'Pregunta', 'Tipo', 'Implementación', 'Registro', 'Exposición', 'Resultado', 'Hallazgos'], rows.map((a) => { const r = run(a.id); return [a.id, a.name, a.question, a.type, r?.impl ?? '—', r?.registro ?? '—', r?.exposicion ?? '—', r ? pill(r.resultado, RES_CLS[r.resultado]) : pill('sin ejecutar'), r?.findings?.length ?? '—']; })),
    ui.result ? h('details', { id: 'audit-universe' }, h('summary', {}, 'Universo efectivo de la evidencia (fuente · encuentro · caso · marcador · huella)'), h('p', { class: 'small muted' }, `Fuentes: ${ui.result.sources.map((x) => x.id).join(', ')}. Los IDs locales (M000001) no identifican por sí solos encuentros de lotes distintos.`),
      table(['Fuente', 'Encuentro', 'Caso', 'Nivel', 'Marcador', 'Sorteos', 'Huella de trayectoria'], ui.result.matches.map((m) => [m.source ?? '—', m.match_id, m.case_id ?? '—', m.level, m.score, m.draws, String(m.trajectory_fp ?? '').slice(0, 12)])),
      (() => { const a26 = run('AUD26')?.metrics; const a17 = run('AUD17')?.metrics; return h('p', { class: 'small' }, a26?.clases ? `AUD26 · cadenas por clase: ${JSON.stringify(a26.clases)}; universo de tasas ${a26.universoDeTasas}. ` : '', a17?.terminosBajoEnergia10 != null ? `AUD17 · términos con energía < 10: ${a17.terminosBajoEnergia10} (mínima ${a17.energiaMinimaObservada}).` : ''); })()) : null,
    ui.result ? h('details', {}, h('summary', {}, 'Notas e indicadores de la última ejecución'), h('ul', { class: 'small' }, ui.result.runs.map((r) => h('li', {}, h('strong', {}, `${r.id} ${r.name}: `), r.note || '—', r.missing?.length ? ` · Faltan: ${r.missing.join('; ')}` : '')))) : null);
}

// ------------------------------------------------------------------------------------------------------------------------------ hallazgos
function findingsCard() {
  const r = ui.result; if (!r) return h('div', { class: 'card' }, 'Analiza una evidencia para ver hallazgos.');
  const SEV = { error: 'bad', 'señal': 'warn', cobertura: '', info: '' };
  return h('div', { class: 'card', id: 'audit-findings' }, h('h3', { style: 'margin-top:0' }, 'Hallazgos'), h('p', { class: 'small muted' }, 'Error determinista (un caso basta), aviso de cobertura, señal deportiva/estadística (requiere exposición y contexto) e información son categorías distintas. Un aviso no invalida un partido que cumple su contrato.'),
    r.findings.length ? table(['ID', 'Severidad', 'Auditoría / regla', 'Sujeto', 'Observado', 'Causa', 'Evidencias', ''], r.findings.map((f) => [f.id, pill(f.severity, SEV[f.severity]), `${f.audit} · ${f.rule}`, f.subject, JSON.stringify(f.counts), f.cause, f.evidenceCount, h('button', { class: 'btn secondary', type: 'button', onclick: () => openFinding(f.id) }, 'abrir')])) : h('p', {}, 'Sin hallazgos en esta lectura (no significa que todo esté validado: ver el catálogo).'),
    ui.finding ? findingDetail(ui.finding) : null);
}
async function openFinding(fid, offset = 0) { const r = await api(`results/${ui.resultId}/finding/${fid}?offset=${offset}&limit=${ui.result.params.examplesPerFinding}`); ui.finding = r.body; repaint(); }
function findingDetail(f) {
  return h('div', { class: 'card', id: 'audit-finding-detail' }, h('h3', { style: 'margin-top:0' }, `${f.id} · ${f.rule}`), h('p', { class: 'small' }, f.reason), h('p', { class: 'small' }, `Universo: ${f.universe} · observado/esperado: ${JSON.stringify(f.counts)} · causa: ${f.cause} · estado: ${f.state}`),
    h('p', { class: 'small muted' }, `Ejemplos ${f.offset + 1}–${Math.min(f.total, f.offset + f.limit)} de ${f.total} (el resto está paginado). Cada evidencia remite a partido/intento, hecho y decisión de la fuente: ábrelo en Lotes › resultados › abrir análisis.`),
    h('pre', { class: 'small', style: 'white-space:pre-wrap;max-height:260px;overflow:auto' }, JSON.stringify(f.evidence, null, 1)),
    h('div', { class: 'row' }, f.offset > 0 ? h('button', { class: 'btn secondary', type: 'button', onclick: () => openFinding(f.id, Math.max(0, f.offset - f.limit)) }, 'anteriores') : null, f.offset + f.limit < f.total ? h('button', { class: 'btn secondary', type: 'button', onclick: () => openFinding(f.id, f.offset + f.limit) }, 'siguientes') : null,
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.tab = 'calib'; repaint(); } }, 'preparar candidata desde este hallazgo')));
}

// ------------------------------------------------------------------------------------------------------------------------------ matriz de capacidades
function matrixCard() {
  const r = ui.result; if (!r?.matrix) return h('div', { class: 'card' }, 'Analiza una evidencia con diagnóstico completo para ver la matriz.');
  const f = ui.capFilter; const rows = r.matrix.filter((m) => (!f.cap || m.cap === f.cap) && (!f.q || `${m.stratum} ${m.estado}`.toLowerCase().includes(f.q.toLowerCase())));
  const c = (m) => m.contrasteCalculo;
  return h('div', { class: 'card', id: 'audit-matrix' }, h('h3', { style: 'margin-top:0' }, 'Matriz de las 32 capacidades'),
    h('p', { class: 'small muted' }, 'Distingue declarado, observado, aplicado, contrastado y no expuesto. Los incrementos +1/+3/+5 son un contraste de CÁLCULO FIJO en el contexto registrado (valor de receta en puntos 1–30): no son un resultado que ocurrió ni puntos que habría añadido el jugador; el incremento efectivo respeta el máximo 30.'),
    h('div', { class: 'row' }, h('label', { class: 'small' }, 'Capacidad ', h('select', { id: 'audit-cap', 'aria-label': 'capacidad', onchange: (e) => { f.cap = e.target.value; repaint(); } }, [['', 'las 32'], ...[...new Set(r.matrix.map((m) => m.cap))].map((x) => [x, x])].map(([v, t]) => h('option', { value: v, selected: f.cap === v }, t)))), h('input', { type: 'search', id: 'audit-cap-q', placeholder: 'tarea/estado', 'aria-label': 'filtrar', value: f.q, onchange: (e) => { f.q = e.target.value; repaint(); } })),
    table(['Cap.', 'Tarea.rol', 'Usos', 'Base→efectiva', 'Peso medio', 'Saturadas', 'Δ +1', 'Δ +3', 'Δ +5', 'Contextos', 'Contraste de partidos', 'Estado'], rows.map((m) => [`${m.cap} ${m.nombre}`, m.stratum, m.usos, m.mediaBase != null ? `${fmt(m.mediaBase, 1)} → ${fmt(m.mediaEfectiva, 1)}` : '—', fmt(m.mediaPeso, 2), m.saturadas, c(m)?.['+1']?.mediaDelta ?? '—', c(m)?.['+3']?.mediaDelta ?? '—', c(m)?.['+5']?.mediaDelta ?? '—', c(m)?.contextos ?? '—', (m.contrastePartidos ?? []).join(', ') || '—', m.estado]), { numeric: [2, 4, 5, 6, 7, 8, 9] }));
}

// ------------------------------------------------------------------------------------------------------------------------------ fiabilidad y concentración
function reliabCard() {
  const r = ui.result; if (!r?.reliability) return h('div', { class: 'card' }, 'Analiza una evidencia con diagnóstico completo.');
  return h('div', { class: 'card', id: 'audit-reliab' }, h('h3', { style: 'margin-top:0' }, 'Fiabilidad de las probabilidades consumidas'),
    h('p', { class: 'small muted' }, 'Por mecanismo: p final antes del sorteo frente al resultado de ESE sorteo; cinco intervalos fijos [0;0,2) … [0,8;1] (el último incluye 1), sin interpolar intervalos vacíos. Brier descriptivo. Esto mide coherencia de muestreo del motor consigo mismo, NO realismo del baloncesto; los acontecimientos de un partido comparten contexto y no son ensayos independientes.'),
    table(['Tipo', 'Mecanismo', 'n', 'Partidos', 'p media', 'Observados', 'Esperados', 'Dif.', 'Brier', 'Lectura', 'Intervalos (n · p̄ → frecuencia)'], r.reliability.sort((a, b) => b.n - a.n).map((x) => [x.kind, x.mecanismo, x.n, x.partidos, fmt(x.mediaP), x.observados, fmt(x.esperados, 1), fmt(x.diferencia, 1), fmt(x.brier), x.muestraEscasa ? pill('muestra escasa', 'warn') : pill('umbral editorial superado'), x.bins.map((b) => (b.n ? `${b.n} · ${fmt(b.mediaP, 2)} → ${fmt(b.frecuencia, 2)}` : '(sin observaciones)')).join(' | ')]), { numeric: [2, 3, 4, 5, 6, 7, 8] }));
}
function concCard() {
  const c = ui.result?.concentration; if (!c) return h('div', { class: 'card' }, 'Analiza una evidencia para ver la concentración.');
  const top = [...c.families].sort((a, b) => b.share - a.share).slice(0, 25); const fin = [...c.finalizers].sort((a, b) => b.share - a.share).slice(0, 25);
  return h('div', { class: 'card', id: 'audit-conc' }, h('h3', { style: 'margin-top:0' }, 'Concentración por familia y finalizador (aviso, no defecto)'), h('p', { class: 'small muted' }, `Aviso SEM si una familia supera ${ui.result.params.familyConcentration.share * 100} % (≥${ui.result.params.familyConcentration.minUnits} ejecuciones y ≥${ui.result.params.familyConcentration.minMatches} partidos) o un jugador ${ui.result.params.finalizerConcentration.share * 100} % de las F de su equipo. Con menos denominador queda «muestra insuficiente»; un partido nunca se invalida por esto.`),
    table(['Equipo', 'Familia', 'n', 'Total', 'Partidos', 'Cuota', 'Estado'], top.map((x) => [x.team, x.family, x.n, x.total, `${x.matches}/${x.matchesTotal}`, fmt(x.share, 2), x.aviso ? pill('AVISO', 'warn') : x.suficiente ? pill('sin aviso') : pill('muestra insuficiente')]), { numeric: [2, 3, 5] }),
    table(['Equipo', 'Jugador', 'F', 'F del equipo', 'Partidos', 'Cuota', 'Estado'], fin.map((x) => [x.team, x.player, x.n, x.total, `${x.matches}/${x.matchesTotal}`, fmt(x.share, 2), x.aviso ? pill('AVISO', 'warn') : x.suficiente ? pill('sin aviso') : pill('muestra insuficiente')]), { numeric: [2, 3, 5] }));
}

// ------------------------------------------------------------------------------------------------------------------------------ experimentos (NUEVOS PARTIDOS)
async function loadExps() { const r = await api('experiments'); ui.exps = r.body; repaint(); }
function expsCard() {
  const e = ui.exps; if (!e) return h('div', { class: 'card' }, 'Cargando experimentos…');
  const total = e.experiments.reduce((s, x) => s + (x.executions ?? 0), 0);
  return h('div', { class: 'card', id: 'audit-exps' }, h('h3', { style: 'margin-top:0' }, 'Doce contrastes iniciales EXP13-01…12 (ejecutor de NUEVOS PARTIDOS)'),
    h('p', { class: 'small' }, h('strong', {}, 'Lanzar ejecuta partidos completos '), `con el controlador de lotes (un caso por experimento × dos variantes = ${total} encuentros en total). Intervención, actores y variables conservadas se muestran antes de lanzar; las semillas de lote 131001–131012 y las deportivas derivadas quedan congeladas. Analizar la evidencia NO simula nada.`),
    table(['ID', 'Contraste', 'Par', 'Registro', 'Encuentros', 'Semilla de lote', 'Semillas deportivas', 'Variantes', ''], e.experiments.map((x) => [x.id, h('span', {}, x.name, h('br'), h('span', { class: 'small muted' }, x.hypothesis)), x.pair.join(' – '), x.level === 'diagnostic' ? 'diagnóstico completo' : 'reducido', x.executions, x.lot_seed, [...new Set(x.derived_seeds.map((s) => s.seed))].join(', '), x.variants.map((v) => v.label).join(' / '), h('button', { class: 'btn', type: 'button', id: `audit-launch-${x.id}`, disabled: ui.busy, onclick: () => launch(x) }, `Lanzar (${x.executions} partidos)`)])),
    h('p', { class: 'small muted' }, 'Reserva de validación (hasta 8 encuentros reducidos, semillas 132001–132004): solo si existe una candidata con cambio real; no se usa para repetir ciclos de ajuste.'));
}
async function launch(x) {
  if (!window.confirm(`${x.id}: se van a EJECUTAR ${x.executions} partidos completos (${x.level === 'diagnostic' ? 'diagnóstico completo' : 'reducido'}). ¿Continuar?`)) return;
  ui.busy = true; repaint(); const sp = await api(`experiment-spec/${x.id}`); const prof = store.profile?.batch ? store.profile : store.baseNew;
  const cr = await fetch('/api/batch/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spec: sp.body.spec, profile: prof, label: `${x.id} · ${x.name}` }) }).then((r) => r.json());
  if (!cr.ok) { ui.msg = `No se pudo preparar ${x.id}: ${(cr.problems ?? [cr.reason]).join('; ')}`; ui.busy = false; repaint(); return; }
  // `/api/batch/create` congela e inicia el lote (mismo comportamiento que la pestaña Lotes): no hace falta un segundo `start`.
  ui.msg = `${x.id} lanzado como lote ${cr.batchId}: sigue su progreso en «Lotes»; cuando termine, vuelve aquí a analizarlo.`; ui.busy = false; const s = await api('sources'); ui.lots = s.body.lots; repaint();
}

// ------------------------------------------------------------------------------------------------------------------------------ calibración
// MOTOR-17 §10–§11: candidatas PROPUESTAS (hasta dos, ≤ 6 controles cada una). Se muestran con fila localizable, unidad, valor base/candidata, consumidor, causa y efectos previsto y observado en desarrollo.
// «Crear borrador» usa el mismo mecanismo de candidatas de MOTOR-13 (borrador no activo sobre la versión activa): no activa nada ni toca lotes ni encuentros.
function candidates17Card() {
  const c = store.candidates17; if (!c?.candidates?.length) return h('p', { class: 'small muted' }, 'Sin candidatas MOTOR-17 cargadas (data/match/motor17-candidates.json).');
  return h('div', { id: 'audit-cand17' }, h('h4', {}, 'Candidatas propuestas por MOTOR-17 (sin aceptación deportiva)'), h('p', { class: 'small muted' }, c.status),
    ...c.candidates.map((cd) => h('div', { class: 'card', id: `cand-${cd.id}` }, h('strong', {}, `${cd.id} · ${cd.name}`), h('p', { class: 'small' }, cd.hypothesis),
      table(['Fila (Panel)', 'Unidad', 'Base → candidata', 'Consumidor', 'Causa', 'Efecto previsto', 'Observado en desarrollo (24 encuentros)'], cd.controls.map((k) => [k.row, k.unit, `${k.before} → ${k.after}`, k.consumer, k.cause, k.expected, k.observedDev ? `energía final ${k.observedDev.energia_final_media}; <30: ${(k.observedDev.energia_final_bajo_30 * 100).toFixed(1)} %; con un jugador de 40:00: ${(k.observedDev.con_jugador_de_40 * 100).toFixed(1)} %; minutos máx. ${k.observedDev.minutos_maximos_medios}` : '—'])),
      h('p', { class: 'small muted' }, `Control contra doble conteo: ${cd.doubleCountGuard}.`),
      h('button', { class: 'btn secondary', type: 'button', id: `cand-draft-${cd.id}`, onclick: () => { const lib = store.library; if (!lib) { ui.msg = 'El Panel aún no está cargado.'; return repaint(); } const baseId = lib.activeVersion().id; const made = lib.createDraft(baseId, { name: `Candidata MOTOR-17 ${cd.id}`, reason: `${cd.id}: ${cd.hypothesis}` }); if (!made.ok) { ui.msg = `${cd.id}: ${made.reason ?? 'no se pudo crear el borrador'}`; return repaint(); } const ed = lib.editDraft(made.draft.id, Object.fromEntries(cd.controls.map((k) => [k.row, k.after])), `${cd.id}: ${cd.hypothesis}`); ui.msg = ed.ok ? `${cd.id}: borrador ${made.draft.id} creado en el Panel (NO activado; la versión activa sigue siendo ${lib.activeVersion().id}).` : `${cd.id}: ${ed.reason ?? 'no se pudo editar el borrador'}`; repaint(); } }, 'Crear borrador en el Panel (no activa)'))),
    h('p', { class: 'small muted' }, 'Las candidatas no forman parte del perfil efectivo MOTOR-17. Elegir la que se propone para el cierre y su justificación: docs/tecnico/motor17.md §8.'));
}
function calibCard() {
  return h('div', { class: 'card', id: 'audit-calib' }, h('h3', { style: 'margin-top:0' }, 'Calibración: candidatas explícitas, nunca automáticas'),
    h('p', { class: 'small' }, 'Desde un hallazgo se abre la fila de parámetros en el Panel, se copia la base a una candidata, se edita con el paso del editor y se previsualiza el diff. «Guardar candidata» no toca el perfil activo, lotes congelados ni encuentros históricos; validar, evaluar, recomendar y activar son estados distintos y la activación es siempre una acción explícita tuya.'),
    h('p', { class: 'small' }, `Presupuesto de la primera pasada: ${store.baseNew?.audit?.calibrationStep?.maxHypotheses ?? 1} hipótesis y hasta ${store.baseNew?.audit?.calibrationStep?.maxChangedRows ?? 3} filas efectivas. Pasos precargados: p0 binaria ±${store.baseNew?.audit?.calibrationStep?.p0Absolute ?? 0.01}, sensibilidad logit ±${store.baseNew?.audit?.calibrationStep?.logitPerPoint ?? 0.005}, carga/desgaste ±${(store.baseNew?.audit?.calibrationStep?.loadFactorRelative ?? 0.05) * 100} %. No se aplican a umbrales reglamentarios.`),
    candidates17Card(),
    h('div', { class: 'row' }, h('button', { class: 'btn secondary', type: 'button', id: 'audit-open-panel', onclick: () => window.dispatchEvent(new CustomEvent('beM:goto', { detail: 'panel' })) }, 'Abrir el Panel de ajustes'), h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.tab = 'dl'; repaint(); } }, 'Ver la conclusión y las descargas')),
    h('p', { class: 'small muted' }, 'La conclusión del primer ciclo (base mantenida con evidencia y límites, o candidata) está en el informe de calibración y en docs/tecnico/motor13.md.'));
}

// ------------------------------------------------------------------------------------------------------------------------------ descargas
function dlCard() {
  const id = ui.resultId; if (!id) return h('div', { class: 'card' }, 'Analiza una evidencia para descargar informe y paquete.');
  return h('div', { class: 'card', id: 'audit-dl' }, h('h3', { style: 'margin-top:0' }, 'Informe y paquete de auditoría'),
    h('p', { class: 'small' }, 'El paquete `beM-audit-package/1` lleva manifest y SHA-256 propios y es DIAGNÓSTICO (no es público: contiene probabilidades y estados exactos). No es autocontenido: cita el lote/paquete fuente, que debes incluir tú al compartirlo con ChatGPT. No se envía nada automáticamente.'),
    h('div', { class: 'row' }, h('a', { class: 'btn', id: 'audit-dl-report', href: `${API}/results/${id}/report.md`, download: `informe-${id}.md` }, 'Descargar informe (Markdown)'), h('a', { class: 'btn secondary', id: 'audit-dl-pkg', href: `${API}/results/${id}/package.zip`, download: `${id}.zip` }, 'Descargar paquete de auditoría (ZIP)')),
    h('p', { class: 'small muted' }, 'Verifica el paquete con: `npm run audit:check -- <ZIP>`; para el lote fuente, `npm run batch:check`.'));
}
