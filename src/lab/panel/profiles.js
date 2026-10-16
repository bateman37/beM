// Ciclo de los perfiles (MOTOR-03, §9): versiones, borradores, validación, publicación, activación, restauración e historial.
import { h, table } from '../dom.js';
import { ps, ctx, repaint, resultMsg, downloadBlob, stamp, toast } from './common.js';
import { openRow } from './rowdialog.js';
import { describeCoverage } from '../../profiles/validate.js';

const when = (ts) => ts.slice(0, 16).replace('T', ' ');
const sumIssues = (s) => (s ? `${s.errors} err · ${s.avisos} av` : '—');

export function renderPerfiles() {
  const c = ctx(); const L = c.L;
  if (ps._cloneActive) { ps._cloneActive = false; if (!c.draft) { const r = L.createDraft(L.activeId, { name: `Candidata sobre ${c.active.label}`, reason: ps.reason }); if (r.ok) ps.editing = r.draft.id; resultMsg(r, 'Borrador creado a partir del perfil activo'); return renderPerfiles(); } }
  if (ps._validate) { ps._validate = false; if (c.draft) resultMsg(L.validateDraft(c.draft.id), 'Borrador validado'); return renderPerfiles(); }
  const root = h('div', {});
  if (L.loadError) root.append(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'Datos locales dañados o ilegibles. '), L.loadError.message,
    h('p', { class: 'small' }, 'No se han reemplazado ni borrado. Mientras no los resuelvas, nada se guarda.'),
    h('div', { class: 'row' }, h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-perfiles-recuperable-${stamp()}.txt`, L.loadError.raw ?? '', 'text/plain') }, 'Descargar lo recuperable (texto original)'),
      h('button', { class: 'btn danger', type: 'button', onclick: () => { if (confirm('Se descartarán los datos locales dañados y se empezará desde la base protegida. ¿Continuar?')) { resultMsg(L.discardDamagedLocalData(), 'Datos locales descartados'); repaint(); } } }, 'Descartar datos locales y empezar desde la base'))));
  if (!L.saveState.saved && !L.loadError) root.append(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, L.saveState.error), h('div', { class: 'row' }, h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-biblioteca-${stamp()}.json`, JSON.stringify(L.exportLibrary())) }, 'Exportar toda la biblioteca ahora'))));

  // --- nueva candidata
  const srcSel = h('select', { id: 'clone-src', 'aria-label': 'versión de origen' }, L.versions().map((v) => h('option', { value: v.id, selected: v.id === L.activeId }, `${v.id} · ${v.label}${v.id === L.activeId ? ' (activo)' : ''}`)));
  const nameIn = h('input', { type: 'text', id: 'clone-name', placeholder: 'Nombre de la candidata', style: 'width:240px' });
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Nueva candidata'),
    h('p', { class: 'small muted' }, 'Clona una versión publicada y concreta: la candidata hereda de ella (nunca de un alias «última versión») y la base queda intacta.'),
    h('div', { class: 'row' }, h('label', { class: 'small' }, 'Origen ', srcSel), nameIn, h('button', { class: 'btn', type: 'button', id: 'clone-go', onclick: () => { const r = L.createDraft(srcSel.value, { name: nameIn.value, reason: ps.reason }); if (resultMsg(r, 'Borrador creado')) { ps.editing = r.draft.id; repaint(); } } }, 'Crear borrador'))));

  // --- borradores
  const drafts = L.drafts();
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Borradores abiertos (${drafts.length})`),
    drafts.length ? h('div', { class: 'scroll' }, h('table', {}, h('thead', {}, h('tr', {}, ['', 'Borrador', 'Hereda de', 'Rev.', 'Filas cambiadas', 'Validación (esta revisión)', 'Evaluación (esta revisión)', 'Acciones'].map((t) => h('th', {}, t)))),
      h('tbody', {}, drafts.map((d) => { const cur = L.validationIsCurrent(d.id); const ev = L.evaluationsFor(d.id).length;
        return h('tr', { class: ps.editing === d.id ? 'sel' : '' },
          h('td', {}, ps.editing === d.id ? '✎' : ''), h('td', {}, h('strong', {}, `${d.id} `), d.name, d.importedFrom ? h('span', { class: 'pill' }, 'importada') : null), h('td', {}, `${d.parent.id} «${d.parent.label}»`), h('td', { class: 'num' }, d.revision), h('td', { class: 'num' }, Object.keys(d.overrides).length),
          h('td', {}, cur ? h('span', { class: `pill ${d.validation.summary.errors ? 'bad' : 'ok'}` }, d.validation.summary.errors ? `${d.validation.summary.errors} errores` : `válida (${d.validation.summary.avisos} av.)`) : h('span', { class: 'pill warn' }, d.validation ? 'obsoleta (editado después)' : 'sin validar')),
          h('td', {}, ev ? h('span', { class: 'pill' }, `${ev} comparación(es) exploratoria(s)`) : h('span', { class: 'muted small' }, 'ninguna para esta revisión')),
          h('td', {}, h('div', { class: 'row' },
            h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.editing = d.id; ps.tab = 'tabla'; repaint(); } }, 'Editar'),
            h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.editing = d.id; resultMsg(L.validateDraft(d.id), 'Validado'); repaint(); } }, 'Validar'),
            h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.editing = d.id; ps.cmp.cand = d.id; ps.tab = 'comparador'; repaint(); } }, 'Comparar'),
            h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-perfil-${d.id}-${stamp()}.json`, JSON.stringify(L.exportDraft(d.id), null, 1)) }, 'Exportar'),
            h('button', { class: 'btn danger', type: 'button', onclick: () => { const why = prompt('Motivo del descarte (queda en el historial):', ''); if (why !== null) { resultMsg(L.discardDraft(d.id, why), 'Borrador descartado (conservado en el historial)'); if (ps.editing === d.id) ps.editing = null; repaint(); } } }, 'Descartar'))));
      })))) : h('p', { class: 'muted' }, 'No hay borradores. Crea una candidata arriba.')));

  // --- validación y publicación del borrador seleccionado
  if (c.draft) root.append(draftCycle(c));

  // --- versiones
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Versiones (${L.versions().length})`),
    h('p', { class: 'small muted' }, 'Las versiones son inmutables. Activar una versión solo afecta a los PRÓXIMOS encuentros; los partidos ya iniciados conservan su configuración congelada y los históricos no se reescriben.'),
    h('div', { class: 'scroll' }, h('table', {}, h('thead', {}, h('tr', {}, ['Versión', 'Nombre', 'Tipo', 'Hereda de', 'Huella', 'Validación', 'Creada', 'Acciones'].map((t) => h('th', {}, t)))),
      h('tbody', {}, L.versions().map((v) => h('tr', { class: v.id === L.activeId ? 'sel' : '' },
        h('td', {}, h('strong', {}, v.id), v.id === L.activeId ? h('span', { class: 'pill on' }, 'activo') : null, v.kind === 'base' ? h('span', { class: 'pill' }, 'protegida') : null),
        h('td', { style: 'white-space:normal;min-width:200px' }, v.label, h('div', { class: 'small muted' }, v.reason)), h('td', {}, v.kind), h('td', {}, v.parent ? `${v.parent.id}` : '—'), h('td', {}, h('code', {}, v.hash.slice(0, 10))), h('td', {}, sumIssues(v.validation?.summary)), h('td', { class: 'small' }, when(v.createdAt)),
        h('td', {}, h('div', { class: 'row' },
          h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.consult = v.id === L.activeId ? null : v.id; ps.tab = 'tabla'; repaint(); } }, 'Consultar'),
          v.id === L.activeId ? null : h('button', { class: 'btn', type: 'button', onclick: () => { if (confirm(`¿Activar ${v.id} «${v.label}» para los PRÓXIMOS encuentros? Los partidos ya iniciados no cambian.`)) { resultMsg(L.activate(v.id, ps.reason), `Activada ${v.id}`); repaint(); } } }, v.kind === 'base' ? 'Restaurar base' : 'Activar'),
          h('button', { class: 'btn secondary', type: 'button', onclick: () => { const r = L.createDraft(v.id, { name: `Candidata sobre ${v.label}`, reason: ps.reason }); if (resultMsg(r, 'Borrador creado')) { ps.editing = r.draft.id; repaint(); } } }, 'Clonar'),
          h('button', { class: 'btn secondary', type: 'button', onclick: () => downloadBlob(`beM-perfil-${v.id}-${stamp()}.json`, JSON.stringify(L.exportVersion(v.id), null, 1)) }, 'Exportar'))))))))));

  // --- historial
  const hist = [...L.history()].reverse().filter((x) => !ps.histFilter || JSON.stringify(x).toLowerCase().includes(ps.histFilter.toLowerCase()));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Historial (${L.history().length})`),
    h('div', { class: 'row' }, h('input', { type: 'search', placeholder: 'Filtrar el historial…', value: ps.histFilter, oninput: (e) => { ps.histFilter = e.target.value; clearTimeout(renderPerfiles.t); renderPerfiles.t = setTimeout(() => { repaint(); document.querySelector('input[placeholder="Filtrar el historial…"]')?.focus(); }, 250); } }), h('span', { class: 'small muted' }, 'Emisor: «Dennis» (no hay cuentas ni identidades autenticadas). La fecha es un metadato de auditoría, no azar deportivo.')),
    h('div', { class: 'scroll tall' }, h('table', {}, h('thead', {}, h('tr', {}, ['Fecha', 'Acción', 'Borrador/versión', 'Rev.', 'Motivo', 'Cambios (antes → después)'].map((t) => h('th', {}, t)))),
      h('tbody', {}, hist.slice(0, 200).map((x) => h('tr', {}, h('td', { class: 'small' }, when(x.ts)), h('td', {}, x.kind), h('td', {}, [x.draftId, x.versionId].filter(Boolean).join(' · ')), h('td', {}, x.revision ?? ''), h('td', { style: 'white-space:normal;min-width:180px' }, x.reason ?? ''),
        h('td', { style: 'white-space:normal;min-width:260px' }, (x.changes ?? []).slice(0, 4).map((ch) => h('div', { class: 'small' }, h('button', { class: 'link', type: 'button', onclick: () => openRow(ch.row) }, ch.row), ch.before !== undefined ? ` ${JSON.stringify(ch.before)} → ${JSON.stringify(ch.after)}` : ''), ), (x.changes?.length ?? 0) > 4 ? h('div', { class: 'small muted' }, `… y ${x.changes.length - 4} más`) : null))))))));
  return root;
}

function draftCycle(c) {
  const L = c.L; const d = c.draft; const cur = L.validationIsCurrent(d.id); const v = cur ? d.validation : null;
  const labelIn = h('input', { type: 'text', id: 'pub-label', style: 'width:260px', placeholder: 'Nombre de la versión', value: d.name });
  const issues = v ? v.issues : [];
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Ciclo del borrador ${d.id} «${d.name}»`),
    h('div', { class: 'lights' },
      h('div', { class: `light ${v ? (v.summary.errors ? 'bad' : 'ok') : 'pending'}` }, h('strong', {}, 'Estructura válida'), h('div', { class: 'small' }, v ? (v.summary.errors ? `${v.summary.errors} errores` : `sí (${v.summary.avisos} avisos)`) : 'sin validar esta revisión')),
      h('div', { class: `light ${v?.summary.coverage?.incrementalComplete ? 'ok' : 'pending'}` }, h('strong', {}, 'Cobertura incremental completa'), h('div', { class: 'small' }, v ? describeCoverage(v.summary.coverage) : '—')),
      h('div', { class: 'light pending' }, h('strong', {}, 'Evaluación deportiva'), h('div', { class: 'small' }, L.evaluationsFor(d.id).length ? `${L.evaluationsFor(d.id).length} comparación(es) exploratoria(s) de esta revisión; sin calibración` : 'pendiente: sin comparación para esta revisión'))),
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', id: 'validate-go', onclick: () => { resultMsg(L.validateDraft(d.id), 'Borrador validado'); repaint(); } }, cur ? 'Volver a validar' : 'Validar esta revisión'),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.cmp.cand = d.id; ps.tab = 'comparador'; repaint(); } }, 'Comparar con la base')),
    issues.length ? h('div', { class: 'scroll', style: 'max-height:260px' }, h('table', {}, h('thead', {}, h('tr', {}, ['Severidad', 'Fila / grupo', 'Regla', 'Valor recibido', 'Explicación'].map((t) => h('th', {}, t)))),
      h('tbody', {}, issues.map((i) => h('tr', {}, h('td', {}, h('span', { class: `pill ${i.severity === 'error' ? 'bad' : 'warn'}` }, i.severity)), h('td', {}, h('button', { class: 'link', type: 'button', onclick: () => openRow(i.id) }, i.id)), h('td', {}, i.rule), h('td', { class: 'small' }, i.received === undefined ? '—' : JSON.stringify(i.received)), h('td', { style: 'white-space:normal;min-width:300px' }, i.message)))))) : (v ? h('p', { class: 'small' }, 'Sin incidencias.') : null),
    h('h3', {}, 'Publicar'),
    h('p', { class: 'small muted' }, 'Publicar crea una versión inmutable; activarla es una decisión aparte y explícita. Un error de validación impide publicar y activar; un aviso solo declara una limitación.'),
    h('div', { class: 'row' }, labelIn,
      h('button', { class: 'btn', type: 'button', id: 'publish-go', disabled: !cur || !!v?.summary.errors, title: !cur ? 'Valida primero esta revisión' : '', onclick: () => { const r = L.publish(d.id, { label: labelIn.value, reason: ps.reason }); if (resultMsg(r, `Publicada como ${r.version?.id}`)) { ps.editing = null; repaint(); } } }, 'Publicar'),
      h('button', { class: 'btn secondary', type: 'button', id: 'publish-activate', disabled: !cur || !!v?.summary.errors, onclick: () => { const r = L.publish(d.id, { label: labelIn.value, reason: ps.reason }); if (r.ok && confirm(`Versión ${r.version.id} publicada. ¿Activarla para los PRÓXIMOS encuentros?`)) resultMsg(L.activate(r.version.id, ps.reason), `Activada ${r.version.id}`); else resultMsg(r, `Publicada como ${r.version?.id}`); if (r.ok) ps.editing = null; repaint(); } }, 'Publicar y activar…')));
}
void toast; void table;
