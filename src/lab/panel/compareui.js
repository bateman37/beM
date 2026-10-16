// Comparador base/candidata (MOTOR-03, §11): pregunta, diferencias, dos encuentros completos, informe y decisión explícita.
import { h, table } from '../dom.js';
import { ps, ctx, repaint, resultMsg, downloadBlob, stamp, valueText, toast } from './common.js';
import { openRow } from './rowdialog.js';
import { store } from '../store.js';
import { runComparison, comparisonSummary, comparisonExport, comparisonMarkdown } from '../../profiles/compare.js';
import { diffEffective } from '../../profiles/model.js';
import { buildMatchInput } from '../../match/index.js';

const f = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d).replace('.', ','));
const metricFmt = (m, v) => (v == null ? '—' : m.unit === '%' ? `${f(v * 100, 1)} %` : f(v, Number.isInteger(v) ? 0 : 2));

export function renderComparador() {
  const c = ctx(); const L = c.L; const cmp = ps.cmp;
  const baseId = cmp.base ?? L.baseId;
  const options = [...L.versions().map((v) => ({ value: `v:${v.id}`, label: `${v.id} · ${v.label}` })), ...L.drafts().map((d) => ({ value: `d:${d.id}`, label: `${d.id} · ${d.name} (borrador, rev. ${d.revision})` }))];
  const candKey = cmp.cand ? (L.draft(cmp.cand) ? `d:${cmp.cand}` : `v:${cmp.cand}`) : (c.draft ? `d:${c.draft.id}` : `v:${L.activeId}`);
  const baseKey = `v:${baseId}`;
  const resolve = (key) => { const [k, id] = key.split(':'); if (k === 'v') { const v = L.version(id); return { ref: L.profileRef(id), effective: v.effective, label: `${v.id} ${v.label}`, draftId: null }; } const d = L.draft(id); return { ref: { versionId: d.id, label: d.name, kind: 'borrador', hash: null, revision: d.revision }, effective: L.draftEffective(id), label: `${d.id} ${d.name}`, draftId: id, revision: d.revision }; };
  const baseSel = h('select', { id: 'cmp-base', onchange: (e) => { cmp.base = e.target.value.slice(2); repaint(); } }, L.versions().map((v) => h('option', { value: `v:${v.id}`, selected: `v:${v.id}` === baseKey }, `${v.id} · ${v.label}`)));
  const candSel = h('select', { id: 'cmp-cand', onchange: (e) => { cmp.cand = e.target.value.slice(2); repaint(); } }, options.map((o) => h('option', { value: o.value, selected: o.value === candKey }, o.label)));
  const B = resolve(baseKey); const C = resolve(candKey);
  const diff = diffEffective(B.effective, C.effective);
  const input = store.edit; const seed = input.seed;
  const root = h('div', {});
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Comparar un partido por perfil'),
    h('p', { class: 'small muted' }, 'Ejecuta DOS encuentros completos por el mismo núcleo con las mismas fichas, estados iniciales, localía, plan inicial y semilla. Solo cambia la configuración que el experimento declara. No activa ni publica nada y no es el constructor de lotes (MOTOR-12).'),
    h('div', { class: 'row' }, h('label', { class: 'small' }, 'Base ', baseSel), h('label', { class: 'small' }, 'Candidata ', candSel)),
    h('p', { class: 'small' }, `Escenario: ${input.teams[0].id} vs ${input.teams[1].id} · semilla ${seed} (la del laboratorio; cámbiala en «Preparación»). Las fichas son las que tienes ahora en «Plantillas».`),
    h('div', { class: 'row' }, h('label', { class: 'small', style: 'flex:1' }, 'Pregunta o hipótesis ', h('input', { type: 'text', id: 'cmp-q', style: 'width:100%', value: cmp.question, placeholder: 'p. ej. ¿Subir el gasto de energía hace que el cansancio se note más?', oninput: (e) => { cmp.question = e.target.value; } }))),
    diff.identical ? h('p', { class: 'small err' }, 'Base y candidata tienen exactamente los mismos valores efectivos: no hay nada que comparar.') : h('div', {}, h('h3', {}, `Cambios por fila (${diff.changed.length})`),
      diff.onlyA.length || diff.onlyB.length ? h('p', { class: 'err small' }, 'Esquemas distintos: hay filas sin correspondencia; no se supone equivalencia por nombre.') : null,
      table(['Fila', 'Unidad', 'Base', 'Candidata'], diff.changed.slice(0, 60).map((x) => [h('button', { class: 'link', type: 'button', onclick: () => openRow(x.id) }, x.row.label), x.row.unit, valueText(x.row, x.before), valueText(x.row, x.after)]))),
    cmp.error ? h('div', { class: 'errbox' }, cmp.error) : null,
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', id: 'cmp-run', disabled: cmp.running || diff.identical, onclick: async () => {
      cmp.running = true; cmp.error = null; repaint();
      try {
        await new Promise((r) => setTimeout(r, 30));
        const players = input; void players;
        const report = await runComparison({ base: { ref: B.ref, effective: B.effective }, candidate: { ref: C.ref, effective: C.effective }, input, question: cmp.question, draft: C.draftId ? { id: C.draftId, revision: C.revision } : null, onProgress: async () => { await new Promise((r) => setTimeout(r, 0)); } });
        cmp.report = report;
        L.recordComparison({ ...comparisonSummary(report), draftId: C.draftId, candidateRevision: C.revision ?? null });
        toast('Comparación terminada: no se ha activado nada');
      } catch (e) { cmp.error = `No se pudo ejecutar la comparación: ${e.message}`; } finally { cmp.running = false; repaint(); }
    } }, cmp.running ? 'Ejecutando dos encuentros completos…' : 'Comparar un partido por perfil'), cmp.running ? h('span', { class: 'small muted' }, 'Tarda unos segundos (dos encuentros con diagnóstico completo).') : null)));
  if (cmp.report) root.append(renderReport(cmp.report, c));
  return root;
}

function renderReport(r, c) {
  const root = h('div', { class: 'card', id: 'cmp-report' });
  const s = (x) => x.summary.teams.map((t) => `${t.id} ${t.pts}`).join(' – ');
  const ok = r.checks.every((x) => x.ok);
  root.append(h('h3', { style: 'margin-top:0' }, 'Informe de la comparación'),
    h('p', { class: 'small' }, `Pregunta: ${r.question || '(sin indicar)'} · semilla ${r.scenario.seed} · motor ${r.engineVersion}`),
    h('div', { class: 'errbox warn-box' }, h('strong', {}, 'Cómo leerlo: '), r.limits[0]),
    h('div', { class: 'grid2' },
      h('div', { class: 'card tight' }, h('strong', {}, `Base · ${r.runs.base.ref?.versionId} ${r.runs.base.ref?.label ?? ''}`), h('div', { class: 'score' }, s(r.runs.base)), h('div', { class: 'small muted' }, `parciales ${r.runs.base.summary.periods.map((p) => p.join('-')).join(' | ')} · huella ${r.runs.base.profileHash.slice(0, 10)}${r.runs.base.reused ? ' · encuentro base reutilizado (misma entrada y versión)' : ''}`)),
      h('div', { class: 'card tight' }, h('strong', {}, `Candidata · ${r.runs.candidate.ref?.versionId} ${r.runs.candidate.ref?.label ?? ''}`), h('div', { class: 'score' }, s(r.runs.candidate)), h('div', { class: 'small muted' }, `parciales ${r.runs.candidate.summary.periods.map((p) => p.join('-')).join(' | ')} · huella ${r.runs.candidate.profileHash.slice(0, 10)}`))),
    h('p', { class: 'small' }, `Muestra: ${r.sample.matchesPerProfile} partido por perfil · completos ${r.sample.completeBase + r.sample.completeCandidate}/2 · errores ${r.sample.errors}.`),
    h('div', { class: 'scroll tall' }, h('table', {}, h('thead', {}, h('tr', {}, ['Métrica', 'Base', 'Candidata', 'Δ abs.', 'Δ rel.', 'Denominador (base / candidata)'].map((t) => h('th', {}, t)))),
      h('tbody', {}, r.metrics.map((m) => h('tr', {}, h('td', {}, m.label), h('td', { class: 'num' }, metricFmt(m, m.base)), h('td', { class: 'num' }, metricFmt(m, m.candidate)), h('td', { class: 'num' }, m.abs == null ? 'no calculable' : (m.unit === '%' ? `${f(m.abs * 100, 1)} pp` : f(m.abs))), h('td', { class: 'num' }, m.rel == null ? 'no calculable' : `${f(m.rel * 100, 1)} %`), h('td', { class: 'small' }, m.denominator ? `${m.denominator.base} / ${m.denominator.candidate} ${m.denominator.label}` : '')))))),
    h('h3', {}, 'Comprobaciones de coherencia ejecutadas'), h('p', { class: 'small muted' }, r.checksScope),
    h('ul', { class: 'small' }, r.checks.map((k) => h('li', { class: k.ok ? '' : 'err' }, `${k.ok ? '✔' : '✘'} ${k.id}: ${k.detail}`))), h('p', { class: `small ${ok ? '' : 'err'}` }, ok ? 'Todas las comprobaciones de coherencia son correctas.' : 'Hay comprobaciones fallidas: revisa antes de interpretar.'),
    h('details', {}, h('summary', {}, 'Métricas pendientes y limitaciones'), h('ul', { class: 'small' }, [...r.pending, ...r.limits.slice(1)].map((x) => h('li', {}, x)))),
    h('div', { class: 'row' },
      h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-comparacion-${r.scenario.seed}-${stamp()}.json`, JSON.stringify(comparisonExport(r))) }, 'Descargar comparación (JSON con los dos encuentros)'),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-comparacion-${r.scenario.seed}-${stamp()}.md`, comparisonMarkdown({ ...r, checksOk: ok ? 'todas correctas' : 'hay fallos' }), 'text/markdown') }, 'Descargar resumen (Markdown)'),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { store.last = r.results.candidate; toast('El encuentro de la candidata alimenta ahora los indicadores de la mesa'); } }, 'Usar el encuentro de la candidata como indicadores')),
    h('p', { class: 'small muted' }, 'Los dos partidos completos solo existen en memoria hasta que descargas la comparación; en el historial se conserva el resumen.'),
    h('h3', {}, 'Decisión (explícita, nunca automática)'),
    h('div', { class: 'row' }, c.draft ? [h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.tab = 'perfiles'; repaint(); } }, 'Ir a validar / publicar / activar'),
      h('button', { class: 'btn danger', type: 'button', onclick: () => { const why = prompt('Motivo del descarte:', 'comparación: no aporta'); if (why !== null) { resultMsg(c.L.discardDraft(c.draft.id, why), 'Candidata descartada (conservada en el historial)'); ps.editing = null; repaint(); } } }, 'Descartar la candidata'), h('span', { class: 'small muted' }, 'O no hagas nada: la candidata se conserva como borrador.')] : h('span', { class: 'small muted' }, 'La candidata comparada es una versión publicada; actívala desde «Perfiles» si quieres usarla.')));
  return root;
}
