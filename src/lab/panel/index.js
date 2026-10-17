// Panel de ajustes (MOTOR-03): navegación, barra del borrador y vistas. Un único repintado coordinado.
import { h, clear } from '../dom.js';
import { ps, ctx, repaint, resultMsg, toast } from './common.js';
import { renderHome, renderMesa, renderVistas, renderCatalog } from './views.js';
import { masterTable } from './table.js';
import { renderPerfiles } from './profiles.js';
import { renderComparador } from './compareui.js';
import { renderIntercambio } from './exchange.js';
import { renderRepertorio } from './repertorio.js';
import { compatCard } from './compat-ui.js';

const SAFE_TABS = new Set(['inicio', 'catalogo', 'perfiles', 'intercambio']);
const TABS = [['inicio', 'Inicio'], ['mesa', 'Mesa de ajustes'], ['tabla', 'Tabla maestra'], ['vistas', 'Vistas temáticas'], ['repertorio', 'Repertorio'], ['catalogo', 'Catálogo 81 + 4'], ['perfiles', 'Perfiles'], ['comparador', 'Comparador'], ['intercambio', 'Intercambio']];

export function renderPanel(root) {
  ps.repaint = () => renderPanel(root);
  clear(root);
  let c;
  try { c = ctx(); } catch (e) { root.append(h('div', { class: 'errbox' }, `No se pudo preparar el panel: ${e.message}`)); return; }
  // MOTOR-15: con un perfil ilegible solo las vistas que no dependen de sus filas; la recuperación no depende de la vista que falló.
  const tabs = c.degraded ? TABS.filter(([id]) => SAFE_TABS.has(id)) : TABS;
  if (!tabs.some(([id]) => id === ps.tab)) ps.tab = 'inicio';
  root.append(h('h2', {}, 'Panel de ajustes del motor'),
    h('div', { class: 'seg tabs2', role: 'tablist' }, tabs.map(([id, t]) => h('button', { type: 'button', role: 'tab', 'aria-pressed': ps.tab === id, onclick: () => { ps.tab = id; repaint(); } }, t))),
    draftBar(c));
  const body = h('div', { id: 'panel-body' });
  const cc = ps.tab === 'inicio' ? null : compatCard(c); // en Inicio la tarjeta ya forma parte de la vista
  if (cc) root.append(cc);
  root.append(body, h('div', { id: 'toast', class: 'toast', hidden: true, role: 'status' }));
  try {
    const view = { inicio: renderHome, mesa: renderMesa, tabla: () => { ps.filters.view = ps.filters.view; return masterTable({}); }, vistas: renderVistas, repertorio: renderRepertorio, catalogo: renderCatalog, perfiles: renderPerfiles, comparador: renderComparador, intercambio: renderIntercambio }[ps.tab];
    body.append(c.degraded && ps.tab === 'inicio' ? renderHomeDegraded(c) : view());
  } catch (e) { body.append(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'Error al dibujar esta vista: '), e.message), h('pre', {}, String(e.stack).split('\n').slice(0, 6).join('\n'))); }
}

// Barra del borrador: siempre visible, distingue consultado / activo / en edición.
function draftBar(c) {
  const L = c.L;
  if (!c.draft) return h('div', { class: 'draftbar none' }, h('span', {}, `Consultando ${c.consult.id} «${c.consult.label}»${c.consult.id === c.active.id ? ' (activo)' : ''} — sin borrador en edición. `), h('button', { class: 'link', type: 'button', onclick: () => { ps.tab = 'perfiles'; repaint(); } }, 'Crear candidata'),
    L.saveState.saved ? null : h('span', { class: 'err' }, ` · ${L.saveState.error}`));
  const d = c.draft; const cur = L.validationIsCurrent(d.id);
  return h('div', { class: 'draftbar' },
    h('strong', {}, `Borrador ${d.id} «${d.name}»`), h('span', {}, `hereda de ${d.parent.id} · rev. ${d.revision} · ${Object.keys(d.overrides).length} filas cambiadas · `),
    h('span', { class: `pill ${cur ? (d.validation.summary.errors ? 'bad' : 'ok') : 'warn'}` }, cur ? (d.validation.summary.errors ? `${d.validation.summary.errors} errores` : 'validado') : 'validación obsoleta'),
    h('label', { class: 'small' }, 'Motivo / hipótesis ', h('input', { type: 'text', id: 'reason', style: 'width:260px', value: ps.reason, placeholder: 'se guarda con cada edición', oninput: (e) => { ps.reason = e.target.value; } })),
    h('button', { class: 'btn secondary', type: 'button', onclick: () => { resultMsg(L.validateDraft(d.id), 'Borrador validado'); repaint(); } }, 'Validar'),
    h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.tab = 'comparador'; ps.cmp.cand = d.id; repaint(); } }, 'Comparar'),
    h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.tab = 'perfiles'; repaint(); } }, 'Publicar…'),
    h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.editing = null; repaint(); } }, 'Dejar de editar'),
    L.saveState.saved ? null : h('span', { class: 'err' }, L.saveState.error));
}
void toast;

// Inicio con un perfil ilegible: solo identidad y recuperación (renderHome necesita las filas del perfil).
function renderHomeDegraded(c) { return h('div', {}, compatCard(c)); }
