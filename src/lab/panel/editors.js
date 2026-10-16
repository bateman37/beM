// Editores tipados de filas (MOTOR-03, §7): cada tipo tiene su control, su interpretación de números en español y su comprobación.
import { h } from '../dom.js';
import { parseNum, fmtNum, deepCopy } from '../../profiles/util.js';
import { validateRowValue } from '../../profiles/validate.js';
import { SLOTS } from '../../match/index.js';
import { isPct, unitText } from './common.js';

const SLOT_NAMES = { PG: 'Base', SG: 'Escolta', SF: 'Alero', PF: 'Ala-pívot', C: 'Pívot' };

// Texto de entrada ↔ valor interno. En las filas porcentuales se escribe el porcentaje (38 → 0,38).
const toInput = (pct, v) => (v == null ? '' : fmtNum(pct ? Number((v * 100).toPrecision(12)) : v, 10));
const fromInput = (pct, text) => { const x = parseNum(text); return x == null ? null : (pct ? Number((x / 100).toPrecision(12)) : x); };

// Devuelve { el, get() → valor | null, errors() → texto[] }. onChange se llama en cada cambio con el valor actual (o null si no se entiende).
export function makeEditor(row, value, ctxv, onChange) {
  const state = { v: deepCopy(value), bad: [] };
  const out = h('div', { class: 'editor' });
  const msg = h('div', { class: 'small' });
  const notify = () => {
    const bad = state.bad.filter(Boolean);
    const issues = !bad.length && state.v != null ? validateRowValue(row, state.v, ctxv) : [];
    msg.replaceChildren(...bad.map((b) => h('div', { class: 'err' }, b)), ...issues.map((i) => h('div', { class: i.severity === 'error' ? 'err' : 'warn-t' }, `${i.severity === 'error' ? '✘' : '⚠'} ${i.message}`)));
    onChange?.(bad.length ? null : state.v, issues);
  };
  const num = (pct, val, set, label, w = 100) => {
    const bad = (t) => (fromInput(pct, t) == null ? `«${t}» no es un número válido (usa coma o punto decimal, sin separador de miles)` : '');
    const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'numin', style: `width:${w}px`, value: toInput(pct, val), 'aria-label': label,
      oninput: (e) => { const t = e.target.value; const m = bad(t); inp.classList.toggle('bad', !!m); set(m ? null : fromInput(pct, t), m); notify(); } });
    return inp;
  };
  const pct = isPct(row);
  const t = row.type;
  if (t === 'vector5') {
    const cells = state.v.map((x, i) => h('label', { class: 'small' }, `${row.elems?.[i] ?? i + 1} `, num(row.elem === 'fraction', x, (val, m) => { if (val != null) state.v[i] = val; state.bad[i] = m ?? ''; }, row.elems?.[i], 80)));
    out.append(h('div', { class: 'row' }, cells, h('span', { class: 'muted small' }, row.elem === 'fraction' ? '(en %)' : '')));
  } else if (t === 'pair' || t === 'triangular') {
    const labels = row.elems ?? ['a', 'b', 'c'];
    out.append(h('div', { class: 'row' }, state.v.map((x, i) => h('label', { class: 'small' }, `${labels[i]} `, num(false, x, (val, m) => { if (val != null) state.v[i] = val; state.bad[i] = m ?? ''; }, labels[i], 90))), h('span', { class: 'muted small' }, row.unit)));
  } else if (t === 'curve') {
    const body = h('tbody');
    const draw = () => {
      body.replaceChildren(...state.v.map((nd, i) => h('tr', {}, h('td', {}, num(false, nd[0], (val, m) => { if (val != null) nd[0] = val; state.bad[`x${i}`] = m ?? ''; }, 'energía', 70)),
        h('td', {}, num(false, nd[1], (val, m) => { if (val != null) nd[1] = val; state.bad[`y${i}`] = m ?? ''; }, 'gravedad', 70)),
        h('td', {}, h('button', { type: 'button', class: 'link', onclick: () => { state.v.splice(i, 1); draw(); notify(); } }, 'quitar')))));
    };
    draw();
    out.append(h('table', { class: 'mini' }, h('thead', {}, h('tr', {}, h('th', {}, 'Energía'), h('th', {}, 'Gravedad (0–1)'), h('th', {}))), body),
      h('button', { type: 'button', class: 'btn secondary', onclick: () => { state.v.splice(state.v.length - 1, 0, [Math.round((state.v[state.v.length - 2][0] + state.v[state.v.length - 1][0]) / 2), state.v[state.v.length - 1][1]]); draw(); notify(); } }, 'Añadir nodo'));
  } else if (t === 'slots') {
    out.append(h('div', { class: 'row' }, SLOTS.map((s) => h('label', { class: 'chip' }, h('input', { type: 'checkbox', checked: state.v.includes(s), onchange: (e) => { state.v = SLOTS.filter((x) => (x === s ? e.target.checked : state.v.includes(x))); notify(); } }), `${s} ${SLOT_NAMES[s]}`))));
  } else if (t === 'bool') {
    out.append(h('label', {}, h('input', { type: 'checkbox', checked: !!state.v, onchange: (e) => { state.v = e.target.checked; notify(); } }), ' Activado'));
  } else {
    out.append(h('label', { class: 'row' }, num(pct, state.v, (val, m) => { if (val != null) state.v = val; state.bad[0] = m ?? ''; }, row.label, 120), h('span', { class: 'muted' }, unitText(row)), pct ? h('span', { class: 'muted small' }, `(valor interno: ${fmtNum(state.v, 8)})`) : null));
  }
  out.append(msg); notify();
  return { el: out, get: () => (state.bad.some(Boolean) ? null : state.v), issues: () => validateRowValue(row, state.v, ctxv) };
}
