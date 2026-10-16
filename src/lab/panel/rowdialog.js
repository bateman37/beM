// Ficha completa de una fila (MOTOR-03, §5.1): descripción, unidades, consumidores, valores, origen, dependencias, historial y editor.
import { h, table } from '../dom.js';
import { ps, ctx, rowsOf, rowIssues, valueText, unitText, diffText, classPill, coveragePill, resultMsg, repaint } from './common.js';
import { makeEditor } from './editors.js';
import { previewRow } from '../../profiles/preview.js';
import { GROUP_BY_ID, VIEWS } from '../../profiles/groups.js';
import { CLASSES, COVERAGE_STATES } from '../../profiles/rows.js';
import { QUESTIONS, questionRows } from '../../profiles/questions.js';
import { canonical } from '../../profiles/util.js';
import { store } from '../store.js';

export function constraintText(row) {
  const t = row.type;
  const m = {
    probabilityLogit: 'Probabilidad estrictamente entre 0 % y 100 % (entra en un logit; 0 y 100 no son transformables).',
    probability: 'Probabilidad entre 0 % y 100 %.', fraction: 'Fracción entre 0 % y 100 %.', distribution: 'Entre 0 % y 100 %; las masas del grupo deben sumar 100 %.',
    weight: 'Peso relativo no negativo; el reparto se normaliza entre las alternativas elegibles.', recipeWeight: 'No negativo; los pesos de la receta deben sumar 1 (se normaliza solo de forma explícita).',
    sensitivity: 'No negativa; unidad indicada.', logit: 'Cualquier número finito (logit).', multiplier: 'Mayor que 0.', energy: 'Dentro de la escala de energía (0–100).', energyRate: 'No negativa.', energyPenalty: 'No negativo (puntos de capacidad).',
    count: 'Entero no negativo.', seconds: 'Mayor que 0 (segundos de juego).', points: 'No negativo.', reference: 'Dentro de la escala de capacidades (1–30).',
    triangular: 'mínimo ≤ más probable ≤ máximo; máximo > mínimo; mínimo ≥ 0; máximo ≥ 0,1 s.', curve: 'Energías estrictamente crecientes que cubran 0–100; gravedad entre 0 y 1 (se avisa si crece con la energía).',
    slots: 'Posiciones del catálogo (PG, SG, SF, PF, C), al menos una, sin repetir.', vector5: 'Cinco valores, uno por nivel.', pair: { range: 'mínimo < máximo', bounds: 'positivos y mínimo ≤ máximo', mix: 'no negativos que suman 1', mixMax1: 'no negativos con suma ≤ 1', positiveMix: 'no negativos, no ambos nulos' }[row.pair] ?? 'Par de valores.',
  }[t];
  return typeof m === 'string' ? m : (m ?? 'Sin restricción numérica.');
}

export function openRow(rowId, { effective = null, refLabel = null, readOnly = false } = {}) {
  const c = ctx();
  const frozen = effective ? rowsOf(effective) : null;
  const src = frozen ?? c.cRows;
  const row = src.byId.get(rowId) ?? c.cRows.byId.get(rowId) ?? c.bRows.byId.get(rowId);
  const dlg = document.getElementById('rowdlg'); const body = document.getElementById('rowdlg-body');
  if (!row) { body.replaceChildren(h('p', { class: 'err' }, `La fila ${rowId} no existe en este perfil.`)); document.getElementById('rowdlg-title').textContent = rowId; dlg.showModal(); return; }
  document.getElementById('rowdlg-title').textContent = row.label;
  const bRow = c.bRows.byId.get(row.id); const eRow = (frozen ?? c.cRows).byId.get(row.id);
  const dRow = c.dRows?.byId.get(row.id); const pRow = c.parentRows?.byId.get(row.id);
  const g = GROUP_BY_ID[row.grp];
  const issues = readOnly || frozen ? [] : rowIssues(c, row);
  const canEdit = !readOnly && !frozen && !!c.draft && row.editable;
  const edit = (() => {
    if (!canEdit) return h('p', { class: 'small muted' }, readOnly || frozen ? 'Consulta del perfil congelado de un encuentro: solo lectura.' : !c.draft ? 'Para editar esta fila crea o selecciona un borrador (Perfiles → Clonar).' : `Fila no editable: ${row.cls === 'reglamento' ? 'obligación reglamentaria' : row.cls === 'invariante' ? 'invariante funcional' : row.locked ? 'solo lectura en esta entrega' : 'sin mecanismo que la consulte'}${row.note ? ` — ${row.note}` : ''}.`);
    const cur = dRow.value; const ctxv = { energyRange: c.dEff.energy.range, bounds: c.dEff.abilityBounds };
    let latest = cur; let apply = null; // `apply` se crea después: el editor avisa ya al construirse
    const ed = makeEditor(row, cur, ctxv, (v) => { latest = v; if (apply) apply.disabled = v == null; });
    apply = h('button', { class: 'btn', type: 'button', onclick: () => { if (latest == null) return; const r = c.L.editDraft(c.draft.id, { [row.id]: latest }, ps.reason); if (resultMsg(r, r.changed ? 'Aplicado al borrador' : 'Sin cambios')) { dlg.close(); repaint(); } } }, 'Aplicar al borrador');
    const reset = pRow && canonical(pRow.value) !== canonical(cur) ? h('button', { class: 'btn secondary', type: 'button', onclick: () => { const r = c.L.resetRow(c.draft.id, row.id); if (resultMsg(r, `Restablecida la herencia: vuelve a ${valueText(row, pRow.value)}`)) { dlg.close(); repaint(); } } }, `Restablecer herencia (${valueText(row, pRow.value)})`) : null;
    return h('div', { class: 'card tight' }, h('h3', { style: 'margin-top:0' }, `Editar en el borrador «${c.draft.name}»`), ed.el, h('div', { class: 'row' }, apply, reset, h('span', { class: 'small muted' }, 'Aplicar al borrador no activa nada para futuros partidos.')));
  })();
  const sib = row.group ? [...src.byId.values()].filter((r) => r.group === row.group && r.id !== row.id) : [];
  const hist = c.L.history().filter((x) => x.changes?.some((ch) => ch.row === row.id)).slice(-8).reverse();
  const qs = QUESTIONS.filter((q) => questionRows(q, [...src.byId.values()]).some((s) => s.rows.some((r) => r.id === row.id)));
  const pv = previewRow(row, effective ?? (c.dEff ?? c.consult.effective));
  const kv = (k, v) => [h('div', { class: 'k' }, k), h('div', {}, v)];
  body.replaceChildren(
    h('div', { class: 'row' }, h('code', {}, row.id), classPill(row.cls), coveragePill(row), h('span', { class: 'pill warn', title: 'Sin fuente empírica ni muestra declaradas' }, 'SEM'), refLabel ? h('span', { class: 'pill' }, refLabel) : null),
    h('div', { class: 'kv wide' },
      kv('Descripción', row.desc), kv('Efecto esperado', row.effect), row.note ? kv('Nota', row.note) : null,
      kv('Grupo funcional', g ? `${g.id} — ${g.resp} (entrega de ampliación prevista: ${g.delivery})` : row.grp),
      kv('Vistas', row.views.map((v) => VIEWS[v]).join(' · ')),
      kv('Mecanismo / tarea', row.mech ? `${row.mech}${row.params?.task ? ` · tarea ${row.params.task}` : ''}` : 'ninguno: ninguna operación consulta esta fila'),
      kv('Actor / contraparte', row.params?.role ? `participante «${row.params.role}»${row.params.side ? ` (${row.params.side === 'attack' || row.params.side === 'qualityAttack' ? 'aporte' : 'oposición'})` : ''}` : '—'),
      kv('Contexto', Object.entries(row.params ?? {}).filter(([k]) => ['zone', 'task', 'play', 'slot', 'c', 'o', 'kind'].includes(k)).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'global'),
      kv('Clase', CLASSES[row.cls]), kv('Tipo y unidad', `${row.type} · ${unitText(row)}`), kv('Restricciones', constraintText(row)),
      kv('Cobertura', COVERAGE_STATES[row.coverage]), kv('Evidencia', 'SEM (semilla provisional); sin fuente ni muestra declaradas, sin evaluación deportiva'),
      kv('Origen', `${row.ext} · perfil consultado: ${c.consult.id} «${c.consult.label}»`)),
    h('h3', {}, 'Valores'),
    table(['Base protegida', 'Heredado', 'Efectivo (consultado)', 'Candidato'], [[bRow ? valueText(row, bRow.value) : '—', pRow ? valueText(row, pRow.value) : '—', eRow ? valueText(row, eRow.value) : '—', dRow ? `${valueText(row, dRow.value)} (${diffText(row, eRow?.value, dRow.value)})` : '—']]),
    issues.length ? h('div', { class: 'errbox' }, h('strong', {}, 'Validación del borrador'), h('ul', {}, issues.map((i) => h('li', { class: i.severity === 'error' ? 'err' : 'warn-t' }, `${i.severity}: ${i.message}`)))) : null,
    edit,
    pv ? h('div', { class: 'card tight' }, h('h3', { style: 'margin-top:0' }, pv.title), h('p', { class: 'small muted' }, pv.note), pv.tables.map((t) => table(t.head, t.rows)), pv.chart ? curveChart(pv.chart) : null) : null,
    sib.length ? h('details', {}, h('summary', {}, `Dependencias: ${sib.length} filas del mismo conjunto («${row.group}»)`), table(['Fila', 'Valor'], sib.map((r) => [h('button', { class: 'link', type: 'button', onclick: () => openRow(r.id, { effective, refLabel, readOnly }) }, r.label), valueText(r, r.value)]))) : null,
    qs.length ? h('p', { class: 'small' }, 'Aparece en las preguntas guiadas: ', qs.map((q) => h('button', { class: 'link', type: 'button', onclick: () => { document.getElementById('rowdlg').close(); ps.tab = 'mesa'; ps.question = q.id; repaint(); } }, `«${q.title}» `))) : null,
    h('h3', {}, 'Historial de esta fila'),
    hist.length ? table(['Revisión', 'Fecha', 'Antes', 'Después', 'Motivo'], hist.map((x) => { const ch = x.changes.find((y) => y.row === row.id); return [`${x.kind}${x.revision ? ` r${x.revision}` : ''}`, x.ts.slice(0, 19).replace('T', ' '), ch.before === undefined ? '—' : valueText(row, ch.before), ch.after === undefined ? '—' : valueText(row, ch.after), x.reason || '(sin motivo)']; })) : h('p', { class: 'small muted' }, 'Sin cambios registrados en esta fila.'));
  dlg.showModal();
}

function curveChart({ points, xLabel, yLabel }) {
  const W = 360; const H = 150; const P = 28;
  const xs = points.map((p) => p.x); const x0 = Math.min(...xs); const x1 = Math.max(...xs);
  const X = (x) => P + ((x - x0) / (x1 - x0 || 1)) * (W - P - 8); const Y = (y) => H - P - y * (H - P - 10);
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a, txt) => { const e = document.createElementNS(ns, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (txt) e.textContent = txt; return e; };
  const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${yLabel} frente a ${xLabel}` });
  svg.append(el('line', { x1: P, y1: H - P, x2: W - 8, y2: H - P, stroke: '#888' }), el('line', { x1: P, y1: 10, x2: P, y2: H - P, stroke: '#888' }));
  svg.append(el('polyline', { points: points.map((p) => `${X(p.x)},${Y(p.y)}`).join(' '), fill: 'none', stroke: '#1f5fbf', 'stroke-width': 2 }));
  for (const p of points) svg.append(el('circle', { cx: X(p.x), cy: Y(p.y), r: 3, fill: '#1f5fbf' }), el('text', { x: X(p.x), y: H - 12, 'font-size': 10, 'text-anchor': 'middle' }, String(p.x)));
  svg.append(el('text', { x: 4, y: 12, 'font-size': 10 }, yLabel), el('text', { x: W - 8, y: H - 2, 'font-size': 10, 'text-anchor': 'end' }, xLabel));
  return h('div', {}, svg);
}
void store;
