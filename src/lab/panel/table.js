// Tabla maestra (MOTOR-03, §6.3): búsqueda, filtros, ordenación, columnas, filas fijadas, selección y edición conjunta.
// Una única fuente de datos con las vistas guiadas: los mismos objetos fila.
import { h, clear } from '../dom.js';
import { ps, ctx, rowIssues, valueText, unitText, diffText, classPill, coveragePill, resultMsg, repaint, toast } from './common.js';
import { openRow } from './rowdialog.js';
import { VIEWS, GROUPS } from '../../profiles/groups.js';
import { CLASSES, COVERAGE_STATES } from '../../profiles/rows.js';
import { bulkPreview, bulkApply, BULK_OPS } from '../../profiles/model.js';
import { parseNum, canonical } from '../../profiles/util.js';
import { isScalarNumber, scaleOf } from '../../profiles/validate.js';

const uniq = (rows, f) => [...new Set(rows.map(f).filter(Boolean))].sort();
const sel = (label, value, options, onchange) => h('label', { class: 'small' }, `${label} `, h('select', { onchange: (e) => onchange(e.target.value) }, h('option', { value: '' }, 'todos'), options.map(([v, t]) => h('option', { value: v, selected: value === v }, t))));

export function masterTable({ lockView = null, title = null } = {}) {
  const root = h('div', { class: 'card' });
  const paint = () => {
    const c = ctx(); const f = ps.filters; const all = c.cRows.rows;
    if (lockView) f.view = lockView;
    const cand = (r) => c.dRows?.byId.get(r.id); const base = (r) => c.bRows.byId.get(r.id);
    const mod = (r) => { const d = cand(r); return d ? canonical(d.value) !== canonical(c.parentRows.byId.get(r.id)?.value) : canonical(r.value) !== canonical(base(r)?.value); };
    let list = all.filter((r) => {
      if (f.ids && !f.ids.has(r.id)) return false;
      if (f.text) { const t = f.text.toLowerCase(); if (!(r.id.toLowerCase().includes(t) || r.label.toLowerCase().includes(t) || r.desc.toLowerCase().includes(t))) return false; }
      if (f.grp && r.grp !== f.grp) return false; if (f.view && !r.views.includes(f.view)) return false; if (f.cls && r.cls !== f.cls) return false;
      if (f.coverage && r.coverage !== f.coverage) return false; if (f.mech && r.mech !== f.mech) return false; if (f.type && r.type !== f.type) return false; if (f.ext && r.ext !== f.ext) return false;
      if (f.modified && !mod(r)) return false; if (f.issues && !rowIssues(c, r).length) return false;
      return true;
    });
    const key = { id: (r) => r.id, name: (r) => r.label, grp: (r) => r.grp, effective: (r) => (typeof r.value === 'number' ? r.value : -Infinity), diff: (r) => { const d = cand(r); return d && typeof d.value === 'number' && typeof r.value === 'number' ? Math.abs(d.value - r.value) : 0; } }[ps.sort.by] ?? ((r) => r.id);
    list = [...list].sort((a, b) => { const x = key(a); const y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * ps.sort.dir; });
    const pinned = list.filter((r) => ps.pinned.has(r.id)); const rest = list.filter((r) => !ps.pinned.has(r.id));
    const shown = [...pinned, ...rest.slice(0, ps.limit)];
    const th = (label, by) => h('th', { class: by ? 'sortable' : '', onclick: by ? () => { ps.sort = { by, dir: ps.sort.by === by ? -ps.sort.dir : 1 }; paint(); } : null }, label, ps.sort.by === by ? (ps.sort.dir > 0 ? ' ▲' : ' ▼') : '');
    const cols = ps.cols;
    const tbl = h('div', { class: 'scroll tall' }, h('table', { class: 'master' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, ''), th('Nombre', 'name'), cols.grp ? th('Grupo', 'grp') : null, cols.unit ? th('Unidad') : null, cols.base ? th('Base') : null, cols.effective ? th(c.consult.id === c.active.id ? 'Efectivo (activo)' : `Efectivo (${c.consult.id})`, 'effective') : null, cols.candidate && c.draft ? th(`Candidato (${c.draft.id})`) : null, cols.diff && c.draft ? th('Diferencia', 'diff') : null, cols.state ? th('Estado') : null)),
      h('tbody', {}, shown.map((r) => {
        const d = cand(r); const iss = rowIssues(c, r); const b = base(r);
        return h('tr', { class: `${ps.pinned.has(r.id) ? 'pinned' : ''} ${mod(r) ? 'modified' : ''}` },
          h('td', {}, h('input', { type: 'checkbox', 'aria-label': `seleccionar ${r.id}`, checked: ps.selected.has(r.id), onchange: (e) => { e.target.checked ? ps.selected.add(r.id) : ps.selected.delete(r.id); paintBulk(); } })),
          h('td', {}, h('button', { type: 'button', class: 'link', title: ps.pinned.has(r.id) ? 'desfijar' : 'fijar para comparar', onclick: () => { ps.pinned.has(r.id) ? ps.pinned.delete(r.id) : ps.pinned.add(r.id); paint(); } }, ps.pinned.has(r.id) ? '★' : '☆')),
          h('td', { class: 'name' }, h('button', { type: 'button', class: 'link', onclick: () => openRow(r.id) }, r.label), h('div', { class: 'small muted' }, r.id)),
          cols.grp ? h('td', {}, r.grp) : null, cols.unit ? h('td', { class: 'small' }, unitText(r)) : null,
          cols.base ? h('td', { class: 'num' }, b ? valueText(r, b.value) : '—') : null,
          cols.effective ? h('td', { class: 'num' }, valueText(r, r.value)) : null,
          cols.candidate && c.draft ? h('td', { class: `num ${d && canonical(d.value) !== canonical(r.value) ? 'chg' : ''}` }, d ? valueText(r, d.value) : '—') : null,
          cols.diff && c.draft ? h('td', { class: 'num' }, d ? diffText(r, r.value, d.value) : '') : null,
          cols.state ? h('td', {}, classPill(r.cls), ' ', coveragePill(r), iss.length ? h('span', { class: `pill ${iss.some((i) => i.severity === 'error') ? 'bad' : 'warn'}`, title: iss.map((i) => i.message).join('\n') }, `${iss.length} incid.`) : null) : null);
      }))));
    clear(root);
    root.append(
      h('div', { class: 'row' }, h('h3', { style: 'margin:0' }, title ?? 'Tabla maestra'), h('span', { class: 'muted small' }, `${list.length} de ${all.length} filas${ps.selected.size ? ` · ${ps.selected.size} seleccionadas` : ''}${pinned.length ? ` · ${pinned.length} fijadas` : ''}`),
        f.ids ? h('span', { class: 'pill' }, `filtro: ${f.idsLabel || 'conjunto'} `, h('button', { type: 'button', class: 'link', onclick: () => { f.ids = null; f.idsLabel = ''; paint(); } }, 'quitar')) : null),
      h('div', { class: 'filters' },
        h('input', { type: 'search', placeholder: 'Buscar por ID, nombre o descripción…', value: f.text, 'aria-label': 'buscar', oninput: (e) => { f.text = e.target.value; ps.limit = 150; clearTimeout(paint.t); paint.t = setTimeout(() => { paint(); const i = root.querySelector('input[type=search]'); i.focus(); i.setSelectionRange(f.text.length, f.text.length); }, 180); } }),
        sel('Grupo', f.grp, GROUPS.filter((g) => all.some((r) => r.grp === g.id)).map((g) => [g.id, g.id]), (v) => { f.grp = v; paint(); }),
        lockView ? null : sel('Vista', f.view, Object.entries(VIEWS), (v) => { f.view = v; paint(); }),
        sel('Clase', f.cls, Object.entries(CLASSES), (v) => { f.cls = v; paint(); }),
        sel('Cobertura', f.coverage, Object.entries(COVERAGE_STATES), (v) => { f.coverage = v; paint(); }),
        sel('Mecanismo', f.mech, uniq(all, (r) => r.mech).map((m) => [m, m]), (v) => { f.mech = v; paint(); }),
        sel('Tipo', f.type, uniq(all, (r) => r.type).map((m) => [m, m]), (v) => { f.type = v; paint(); }),
        sel('Procedencia', f.ext, uniq(all, (r) => r.ext).map((m) => [m, m]), (v) => { f.ext = v; paint(); }),
        h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: f.modified, onchange: (e) => { f.modified = e.target.checked; paint(); } }), ' modificado'),
        h('span', { class: 'small muted', title: 'No existe ninguna referencia contrastada ni evaluación deportiva' }, 'Todas las filas son SEM/provisionales y sin referencia'),
        h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: f.issues, onchange: (e) => { f.issues = e.target.checked; paint(); } }), ' con error/aviso de validación'),
        h('button', { type: 'button', class: 'btn secondary', onclick: () => { Object.assign(f, { text: '', grp: '', view: lockView ?? '', cls: '', coverage: '', mech: '', type: '', ext: '', modified: false, issues: false, ids: null, idsLabel: '' }); paint(); } }, 'Limpiar filtros')),
      h('details', { class: 'small' }, h('summary', {}, 'Columnas'), h('div', { class: 'row' }, Object.entries({ grp: 'Grupo', unit: 'Unidad', base: 'Base', effective: 'Efectivo', candidate: 'Candidato', diff: 'Diferencia', state: 'Estado' }).map(([k, t]) => h('label', {}, h('input', { type: 'checkbox', checked: cols[k], onchange: (e) => { cols[k] = e.target.checked; paint(); } }), ` ${t}`)))),
      h('div', { id: 'bulk-host' }), tbl,
      rest.length > ps.limit ? h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.limit += 200; paint(); } }, `Mostrar ${Math.min(200, rest.length - ps.limit)} más (${rest.length - ps.limit} restantes)`) : null);
    paintBulk();
  };
  const paintBulk = () => {
    const host = root.querySelector('#bulk-host'); if (!host) return; clear(host);
    if (!ps.selected.size) return;
    const c = ctx(); const ids = [...ps.selected]; const b = ps.bulk;
    const first = c.cRows.byId.get(ids[0]); const unit = first ? (scaleOf(first) === 100 ? 'puntos porcentuales' : first.unit) : '';
    const prev = b.preview;
    host.append(h('div', { class: 'card tight bulk' },
      h('div', { class: 'row' }, h('strong', {}, `Edición conjunta de ${ids.length} filas`),
        h('label', { class: 'small' }, 'Operación ', h('select', { onchange: (e) => { b.op = e.target.value; b.preview = null; paintBulk(); } }, Object.entries(BULK_OPS).map(([k, t]) => h('option', { value: k, selected: b.op === k }, t)))),
        h('label', { class: 'small' }, b.op === 'multiply' ? 'Factor ' : b.op === 'add' ? `Cantidad (${unit}) ` : `Valor (${scaleOf(first ?? {}) === 100 ? '%' : unit}) `, h('input', { type: 'text', class: 'numin', style: 'width:90px', value: b.amount, 'aria-label': 'cantidad', oninput: (e) => { b.amount = e.target.value; b.preview = null; } })),
        h('button', { type: 'button', class: 'btn secondary', onclick: () => { const x = parseNum(b.amount); b.preview = x == null ? { ok: false, items: [], problems: [`«${b.amount}» no es un número válido`] } : bulkPreview((c.dEff ?? c.consult.effective), ids, b.op, x); paintBulk(); } }, 'Previsualizar'),
        h('button', { type: 'button', class: 'btn secondary', onclick: () => { ps.selected.clear(); b.preview = null; paint(); } }, 'Vaciar selección')),
      h('p', { class: 'small muted' }, 'Solo filas numéricas compatibles (mismo tipo y unidad). Si algo es inválido no se modifica ninguna fila. +3 sobre una probabilidad son tres puntos porcentuales, no un 3 % relativo.'),
      prev ? h('div', {}, prev.problems.length ? h('div', { class: 'errbox' }, h('ul', {}, prev.problems.slice(0, 12).map((p) => h('li', {}, p)))) : null,
        prev.items.length ? h('div', { class: 'scroll', style: 'max-height:220px' }, h('table', { class: 'mini' }, h('thead', {}, h('tr', {}, ['Fila', 'Antes', 'Después'].map((t) => h('th', {}, t)))), h('tbody', {}, prev.items.map((i) => h('tr', {}, h('td', {}, i.row.label), h('td', { class: 'num' }, valueText(i.row, i.before)), h('td', { class: `num ${i.errors.length ? 'err' : ''}` }, valueText(i.row, i.after))))))) : null,
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', disabled: !prev.ok || !c.draft, onclick: () => { const r = c.L.editDraft(c.draft.id, bulkApply(c.dEff, prev), ps.reason || `edición conjunta (${BULK_OPS[b.op]} ${b.amount})`); if (resultMsg(r, `Aplicado a ${prev.items.length} filas del borrador`)) { ps.selected.clear(); b.preview = null; repaint(); } } }, 'Aplicar al borrador'), !c.draft ? h('span', { class: 'small err' }, 'Selecciona o crea un borrador para aplicar.') : null)) : null));
  };
  paint();
  root.repaintTable = paint;
  void toast;
  return root;
}
