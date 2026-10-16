// Utilidades mínimas de DOM (sin dependencias).
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'value') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
export const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '—');
export function table(headers, rows, { numeric = [] } = {}) {
  return h('div', { class: 'scroll' }, h('table', {},
    h('thead', {}, h('tr', {}, headers.map((t, i) => h('th', { class: numeric.includes(i) ? 'num' : '' }, t)))),
    h('tbody', {}, rows.map((r) => h('tr', { class: r.cls }, (r.cells ?? r).map((c, i) => h('td', { class: numeric.includes(i) ? 'num' : '' }, c)))))));
}
export function storage() {
  try { const k = '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch { return null; }
}
