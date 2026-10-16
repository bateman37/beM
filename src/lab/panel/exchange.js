// Intercambio (MOTOR-03, §12): exportar perfiles y la biblioteca, importar como candidata con conflictos explicados.
import { h, table } from '../dom.js';
import { ps, ctx, repaint, resultMsg, downloadBlob, stamp } from './common.js';
import { diffEffective } from '../../profiles/model.js';
import { LIBRARY_EXPORT_FORMAT, PROFILE_EXPORT_FORMAT } from '../../profiles/library.js';
import { openRow } from './rowdialog.js';
import { valueText } from './common.js';

export function renderIntercambio() {
  const c = ctx(); const L = c.L; const x = ps.xchg;
  const root = h('div', {});
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Exportar'),
    h('p', { class: 'small muted' }, 'JSON con versión de formato, identidad, cobertura, procedencia, padre exacto incluido, sobreescrituras, conjunto efectivo completo y el diccionario necesario para interpretar las filas. Una exportación no convierte SEM en referencia contrastada ni contiene código ni secretos.'),
    h('div', { class: 'row' },
      h('label', { class: 'small' }, 'Versión ', h('select', { id: 'xp-version' }, L.versions().map((v) => h('option', { value: v.id, selected: v.id === c.consult.id }, `${v.id} · ${v.label}`)))),
      h('button', { class: 'btn', type: 'button', id: 'xp-go', onclick: () => { const id = document.getElementById('xp-version').value; downloadBlob(`beM-perfil-${id}-${stamp()}.json`, JSON.stringify(L.exportVersion(id), null, 1)); } }, 'Descargar perfil'),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-biblioteca-${stamp()}.json`, JSON.stringify(L.exportLibrary())) }, 'Descargar toda la biblioteca (copia recuperable)'))));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Importar'),
    h('p', { class: 'small muted' }, 'Se valida formato, versión del motor, huella, campos, límites, referencias e invariantes ANTES de crear nada. Un perfil válido entra como candidata (borrador): no se activa ni sobrescribe ninguna versión. Lo incompatible se rechaza con su motivo; no se eliminan campos desconocidos para hacerlo pasar.'),
    h('input', { type: 'file', accept: '.json,application/json', id: 'xp-file', onchange: async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try { const json = JSON.parse(await file.text()); x.file = json; x.name = file.name; x.message = null;
        if (json?.format === LIBRARY_EXPORT_FORMAT) x.analysis = { library: true };
        else x.analysis = L.analyzeImport(json);
      } catch (err) { x.analysis = { ok: false, problems: [`JSON no válido: ${err.message}`] }; x.file = null; }
      repaint();
    } }),
    x.analysis ? analysis(c, x) : null,
    x.message ? h('p', { class: 'small' }, x.message) : null));
  return root;
}

function analysis(c, x) {
  const a = x.analysis; const L = c.L;
  if (a.library) return h('div', { class: 'card tight' }, h('p', {}, `Archivo ${x.name}: copia de biblioteca.`), h('button', { class: 'btn', type: 'button', onclick: () => { const r = L.importLibrary(x.file); x.message = r.ok ? `Importadas ${r.report.versions} versiones, ${r.report.drafts} borradores; ${r.report.recognized} ya existían${r.report.rejected.length ? `; rechazados: ${r.report.rejected.join('; ')}` : ''}.` : r.error; x.analysis = null; repaint(); } }, 'Incorporar versiones y borradores (sin sobrescribir)'));
  if (!a.ok) return h('div', { class: 'errbox' }, h('strong', { class: 'err' }, `Archivo ${x.name}: rechazado`), h('ul', {}, a.problems.slice(0, 20).map((p) => h('li', {}, p))));
  const file = a.file; const base = L.version(L.baseId);
  const d = diffEffective(base.effective, file.effective);
  return h('div', { class: 'card tight' }, h('strong', {}, `Archivo ${x.name}: aceptable`), h('p', { class: 'small' }, `«${file.identity.label}» · huella ${file.identity.hash.slice(0, 10)} · ${file.coverage?.rows ?? '?'} filas · exportado ${file.exportedAt?.slice(0, 16).replace('T', ' ')}`),
    a.recognized ? h('p', { class: 'pill ok' }, `Ya existe con el mismo contenido: ${a.recognized.id} «${a.recognized.label ?? a.recognized.name}». No se duplica.`) : null,
    a.warnings?.length ? h('details', {}, h('summary', {}, `${a.warnings.length} avisos`), h('ul', { class: 'small' }, a.warnings.map((w) => h('li', {}, `${w.id}: ${w.message}`)))) : null,
    h('h3', {}, `Diferencias con la base protegida (${d.changed.length})`),
    d.changed.length ? table(['Fila', 'Base', 'Archivo'], d.changed.slice(0, 40).map((ch) => [h('button', { class: 'link', type: 'button', onclick: () => openRow(ch.id) }, ch.row.label), valueText(ch.row, ch.before), valueText(ch.row, ch.after)])) : h('p', { class: 'small muted' }, 'Idéntico a la base.'),
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', id: 'xp-import', disabled: !!a.recognized, onclick: () => { const r = L.importProfile(x.file); if (r.ok && r.draft) { x.message = `Creada la candidata ${r.draft.id} «${r.draft.name}» (no activada).`; ps.editing = r.draft.id; x.analysis = null; } else x.message = r.message ?? r.error; resultMsg(r, 'Importada como candidata'); repaint(); } }, 'Crear candidata desde este archivo')));
}
void PROFILE_EXPORT_FORMAT;
