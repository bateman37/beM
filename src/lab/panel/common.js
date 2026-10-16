// Estado y utilidades comunes del panel de ajustes (MOTOR-03). Una única fuente de datos para tabla, vistas y mesa guiada.
import { h } from '../dom.js';
import { store } from '../store.js';
import { buildRows, indexRows, CLASSES, COVERAGE_STATES } from '../../profiles/rows.js';
import { validateProfile } from '../../profiles/validate.js';
import { fmtNum } from '../../profiles/util.js';
import { PRESENTATION } from '../../match/session.js';

export const ps = {
  tab: 'inicio', consult: null, editing: null, question: null, view: 'tiro', reason: '',
  filters: { text: '', grp: '', view: '', cls: '', coverage: '', mech: '', type: '', ext: '', modified: false, issues: false, ids: null, idsLabel: '' },
  sort: { by: 'id', dir: 1 }, cols: { grp: true, unit: true, base: true, effective: true, candidate: true, diff: true, state: true },
  pinned: new Set(), selected: new Set(), limit: 150, bulk: { op: 'add', amount: '', preview: null },
  cmp: { base: null, cand: null, question: '', hypothesis: '', report: null, running: false, error: null },
  xchg: { analysis: null, message: null }, histFilter: '', repaint: null,
};
export const lib = () => store.library;

const rowsCache = new Map();
export function rowsOf(effective, key) {
  const k = key ?? null;
  if (k && rowsCache.has(k)) return rowsCache.get(k);
  const rows = buildRows(effective, { presentation: PRESENTATION });
  const val = { rows, byId: indexRows(rows).byId };
  if (k) { rowsCache.set(k, val); if (rowsCache.size > 40) rowsCache.delete(rowsCache.keys().next().value); }
  return val;
}
const validCache = new Map();
function validation(key, effective, base) {
  if (validCache.has(key)) return validCache.get(key);
  const v = validateProfile(effective, { base });
  validCache.set(key, v); if (validCache.size > 20) validCache.delete(validCache.keys().next().value);
  return v;
}
// Contexto de la vista: perfil consultado (versión), borrador en edición y base protegida.
export function ctx() {
  const L = lib();
  const consultId = ps.consult && L.version(ps.consult) ? ps.consult : L.activeId;
  const consult = L.version(consultId);
  const base = L.version(L.baseId);
  const draft = ps.editing && L.draft(ps.editing)?.status === 'abierto' ? L.draft(ps.editing) : null;
  if (!draft) ps.editing = null;
  const cRows = rowsOf(consult.effective, `v:${consult.id}:${consult.hash}`);
  const bRows = rowsOf(base.effective, `v:${base.id}:${base.hash}`);
  let dRows = null; let dVal = null; let dEff = null; let parentRows = null;
  if (draft) {
    dEff = L.draftEffective(draft.id);
    dRows = rowsOf(dEff, `d:${draft.id}:${draft.revision}`);
    dVal = validation(`d:${draft.id}:${draft.revision}`, dEff, base.effective);
    parentRows = rowsOf(L.version(draft.parent.id).effective, `v:${draft.parent.id}:${draft.parent.hash}`);
  }
  const issuesByRow = new Map();
  if (dVal) for (const i of dVal.issues) { const k = i.group ?? i.id; if (!issuesByRow.has(k)) issuesByRow.set(k, []); issuesByRow.get(k).push(i); if (i.group) { /* los miembros del grupo la heredan */ } }
  return { L, consult, base, draft, cRows, bRows, dRows, dVal, dEff, parentRows, issuesByRow, active: L.activeVersion() };
}
export const rowIssues = (c, row) => [...(c.issuesByRow.get(row.id) ?? []), ...(row.group ? c.issuesByRow.get(row.group) ?? [] : [])];

// ------------------------------------------------------------------ formato de valores
const PCT = new Set(['probability', 'probabilityLogit', 'fraction', 'distribution']);
export const isPct = (row) => PCT.has(row.type) || (row.type === 'vector5' && row.elem === 'fraction');
const n = (v, d = 6) => fmtNum(v, d);
const pc = (v) => `${fmtNum(Number((v * 100).toPrecision(10)), 6)} %`;
export function valueText(row, v) {
  if (v === undefined) return 'ausente';
  if (v === null) return 'sin valor (declarado)';
  if (row.type === 'vector5') return `[${v.map((x) => (row.elem === 'fraction' ? pc(x) : n(x))).join(' · ')}]`;
  if (row.type === 'pair') return `${n(v[0])} / ${n(v[1])}`;
  if (row.type === 'triangular') return `${n(v[0])} · ${n(v[1])} · ${n(v[2])} s`;
  if (row.type === 'curve') return `${v.length} nodos: ${v.map(([x, y]) => `${n(x)}→${n(y)}`).join('; ')}`;
  if (row.type === 'slots' || row.type === 'strlist') return v.join(', ');
  if (row.type === 'bool') return v ? 'Sí' : 'No';
  if (row.type === 'text' || row.type === 'declarado') return String(v);
  if (PCT.has(row.type)) return pc(v);
  return n(v);
}
export const unitText = (row) => (PCT.has(row.type) ? '%' : row.unit);
export function diffText(row, a, b) {
  if (a === undefined || b === undefined) return '';
  if (typeof a === 'number' && typeof b === 'number') { const d = b - a; if (d === 0) return '—'; const sc = PCT.has(row.type) ? 100 : 1; const s = Number((d * sc).toPrecision(8)); return `${s > 0 ? '+' : ''}${fmtNum(s, 6)}${PCT.has(row.type) ? ' pp' : ''}`; }
  return JSON.stringify(a) === JSON.stringify(b) ? '—' : 'cambia';
}
export const classPill = (cls) => h('span', { class: `pill cls-${cls}`, title: CLASSES[cls] }, { balance: 'balance', contenido: 'contenido', reglamento: 'reglamento', invariante: 'invariante' }[cls]);
export const coveragePill = (row) => (row.coverage === 'consumido' ? null : h('span', { class: 'pill warn', title: COVERAGE_STATES[row.coverage] }, row.coverage === 'sin_consumidor' ? 'sin mecanismo' : 'no aplicable'));

export function downloadBlob(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
}
export const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
export function repaint() { if (ps.repaint) ps.repaint(); window.dispatchEvent(new Event('beM:repaint')); }
export function toast(msg, kind = 'ok') { const el = document.getElementById('toast'); if (!el) return; el.textContent = msg; el.className = `toast ${kind}`; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 5000); }
export const resultMsg = (r, okMsg) => { if (r.ok) { toast(okMsg ?? 'Hecho'); return true; } toast(r.error ?? 'No se pudo completar', 'bad'); return false; };
