// Inicio, mesa de ajustes por pregunta, vistas temáticas y catálogo 81 + 4 (MOTOR-03, §6).
import { h, table } from '../dom.js';
import { ps, ctx, repaint, valueText, unitText, classPill, coveragePill } from './common.js';
import { masterTable } from './table.js';
import { openRow } from './rowdialog.js';
import { VIEWS, GROUPS } from '../../profiles/groups.js';
import { QUESTIONS, QUESTION_BY_ID, questionRows } from '../../profiles/questions.js';
import { previewRow } from '../../profiles/preview.js';
import { describeCoverage } from '../../profiles/validate.js';
import { store } from '../store.js';
import { canonical } from '../../profiles/util.js';

const go = (tab, extra = {}) => { ps.tab = tab; Object.assign(ps, extra); repaint(); };
const light = (state, label, detail) => h('div', { class: `light ${state}` }, h('strong', {}, label), h('div', { class: 'small' }, detail));

// ---------------------------------------------------------------- inicio
export function renderHome() {
  const c = ctx(); const L = c.L; const a = c.active;
  const val = a.validation?.summary; const cov = val?.coverage;
  const frozen = store.matchRef;
  const mods = c.draft ? Object.keys(c.draft.overrides).length : 0;
  const dv = c.draft?.validation && L.validationIsCurrent(c.draft.id) ? c.draft.validation.summary : null;
  const evals = c.draft ? L.evaluationsFor(c.draft.id).length : 0;
  const legacyCard = L.isLegacy(a.id) ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'El perfil activo es anterior a MOTOR-06. '), 'Conserva su identidad y no se migra en silencio: no puede jugar la defensa nueva. ',
    h('button', { class: 'btn', type: 'button', id: 'legacy-activate', onclick: () => { L.activate(L.baseId, 'activar la base de MOTOR-06'); window.dispatchEvent(new Event('beM:repaint')); repaint(); } }, 'Activar la base de MOTOR-06'), ' ',
    h('button', { class: 'btn secondary', type: 'button', id: 'legacy-upgrade', onclick: () => { const r = L.upgradeCandidate(a.id); if (r.ok) { ps.editing = r.draft.id; ps.tab = 'perfiles'; } else alert(r.error); repaint(); } }, 'Crear candidata MOTOR-05 desde esta versión'),
    h('p', { class: 'small muted' }, 'La candidata es un borrador sobre la base de MOTOR-06 con los valores que esta versión había cambiado (las filas sustituidas por la extensión no se trasladan). Hay que validarla y publicarla.')) : null;
  return h('div', {},
    legacyCard,
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Perfil activo para futuros partidos'),
      h('div', { class: 'row' }, h('strong', { style: 'font-size:18px' }, `${a.id} · ${a.label}`), h('span', { class: 'pill warn' }, `${a.status}`), h('span', { class: 'pill' }, a.kind), h('code', { title: a.hash }, a.hash.slice(0, 12))),
      h('p', { class: 'small muted' }, `Versión ${a.id}${a.parent ? `, hereda de ${a.parent.id} «${a.parent.label}» (huella ${a.parent.hash.slice(0, 8)})` : ', base protegida sin padre'} · creada ${a.createdAt.slice(0, 16).replace('T', ' ')} por ${a.actor}`),
      h('p', { class: 'small' }, a.reason),
      h('div', { class: 'lights' },
        light(val?.structure === 'valida' ? 'ok' : 'bad', 'Estructura', val ? (val.structure === 'valida' ? `válida (${val.avisos} avisos)` : `${val.errors} errores`) : 'sin validar'),
        light(cov?.incrementalComplete ? 'ok' : 'bad', 'Cobertura incremental', cov ? describeCoverage(cov) : '—'),
        light('pending', 'Evaluación deportiva', `${L.comparisons().length} comparaciones exploratorias (un partido por perfil); sin calibración ni contraste con referencias (EVAL pendiente)`)),
      h('p', { class: 'small muted' }, 'Operativo para el subconjunto activo de MOTOR-01/02, no calibrado globalmente. Un semáforo verde de estructura no significa que el baloncesto esté validado.')),
    h('div', { class: 'grid2' },
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Tres cosas que no se confunden'),
        table(['', 'Perfil'], [
          ['Seleccionado para consultar', h('span', {}, `${c.consult.id} «${c.consult.label}» `, h('select', { 'aria-label': 'perfil consultado', onchange: (e) => { ps.consult = e.target.value === a.id ? null : e.target.value; repaint(); } }, L.versions().map((v) => h('option', { value: v.id, selected: v.id === c.consult.id }, `${v.id} · ${v.label}`))))],
          ['Activo para futuros partidos', `${a.id} «${a.label}»`],
          ['Borrador en edición', c.draft ? `${c.draft.id} «${c.draft.name}» (hereda de ${c.draft.parent.id})` : 'ninguno'],
          ['Partido abierto en Partido', frozen ? `${frozen.versionId} «${frozen.label}» (perfil congelado de ese encuentro)` : 'ninguno preparado'],
        ])),
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Cambios pendientes'),
        c.draft ? h('div', {}, h('p', {}, `Borrador ${c.draft.id}: ${mods} filas modificadas, revisión ${c.draft.revision}.`),
          h('p', { class: 'small' }, dv ? `Validación de esta revisión: ${dv.structure === 'valida' ? 'estructura válida' : `${dv.errors} errores`}, ${dv.avisos} avisos.` : 'Validación obsoleta o sin hacer para esta revisión.'), h('p', { class: 'small' }, evals ? `${evals} comparación(es) hecha(s) con esta revisión exacta.` : 'Sin evaluación para esta revisión.'))
          : h('p', { class: 'muted' }, 'No hay borrador en edición.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: () => go('perfiles', { _cloneActive: true }) }, c.draft ? 'Ir al ciclo del borrador' : 'Crear candidata (clonar el activo)'),
          h('button', { class: 'btn secondary', type: 'button', disabled: !c.draft, onclick: () => go('perfiles', { _validate: true }) }, 'Validar'),
          h('button', { class: 'btn secondary', type: 'button', disabled: !c.draft, onclick: () => go('comparador') }, 'Comparar'),
          h('button', { class: 'btn secondary', type: 'button', onclick: () => go('perfiles') }, 'Publicar / activar / restaurar'),
          h('button', { class: 'btn secondary', type: 'button', onclick: () => go('intercambio') }, 'Importar / exportar'))),
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Conservación local'),
        h('p', { class: L.saveState.saved ? 'small' : 'small err' }, L.saveState.saved ? (L.saveState.memoryOnly ? 'Biblioteca solo en memoria (sin almacenamiento local en este navegador).' : `Guardado en este navegador (${L.saveState.at?.slice(0, 19).replace('T', ' ') ?? ''}).`) : L.saveState.error),
        h('p', { class: 'small muted' }, 'Alcance local: perfiles, borradores e historial viven en este navegador. Para trasladarlos a otro ordenador o conservar una copia usa Intercambio. Los partidos completos de una comparación solo están en memoria hasta que descargas el informe.'))),
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, '¿Por dónde empiezo?'), h('p', { class: 'small' }, 'Si tienes una duda deportiva, abre la ', h('button', { class: 'link', type: 'button', onclick: () => go('mesa') }, 'mesa de ajustes por pregunta'), '; si sabes qué buscas, usa la ', h('button', { class: 'link', type: 'button', onclick: () => go('tabla') }, 'tabla maestra'), ' o las ', h('button', { class: 'link', type: 'button', onclick: () => go('vistas') }, 'vistas temáticas'), '.')));
}

// ---------------------------------------------------------------- mesa de ajustes por pregunta
export function renderMesa() {
  const c = ctx(); const qid = ps.question;
  const root = h('div', {});
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Mesa de ajustes por pregunta'),
    h('p', { class: 'small muted' }, 'Caminos de consulta y posibles causas vinculados a filas reales. No son diagnósticos automáticos ni recetas: ningún botón cambia valores y un indicador solo se muestra si el acta lo registra.'),
    h('div', { class: 'chips' }, QUESTIONS.map((q) => h('button', { type: 'button', class: `chip ${qid === q.id ? 'on' : ''}`, onclick: () => { ps.question = q.id; repaint(); } }, q.title)))));
  const q = QUESTION_BY_ID[qid]; if (!q) return root;
  const rows = c.cRows.rows; const secs = questionRows(q, rows); const last = store.last;
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, q.title), h('p', {}, q.summary)));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Indicadores disponibles'),
    last ? [h('p', { class: 'small muted' }, `Fuente: acta del último encuentro jugado en el laboratorio (semilla ${last.meta.rng.initialSeed}, perfil ${last.meta.profileRef?.versionId ?? last.meta.effectiveProfileId}). Una sola partida no es una demostración estadística.`), table(['Indicador', 'Valor', 'Universo / denominador', 'Fuente'], q.indicators(last).map((i) => [i.label, i.value, i.denominator, i.source]))]
      : h('p', { class: 'small' }, 'Aún no hay ningún encuentro terminado en esta sesión: juégalo en «Partido» o usa el comparador para obtener indicadores. No se estiman desde el marcador.'),
    q.pending.length ? h('ul', { class: 'small muted' }, q.pending.map((p) => h('li', {}, `Limitación: ${p}`))) : null));
  for (const s of secs) {
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, s.title), h('p', { class: 'small muted' }, s.text),
      h('div', { class: 'scroll' }, h('table', {}, h('thead', {}, h('tr', {}, ['Fila', 'Valor efectivo', 'Unidad', 'Estado'].map((t) => h('th', {}, t)))),
        h('tbody', {}, s.rows.slice(0, 40).map((r) => h('tr', {}, h('td', {}, h('button', { class: 'link', type: 'button', onclick: () => openRow(r.id) }, r.label)), h('td', { class: 'num' }, valueText(r, r.value)), h('td', { class: 'small' }, unitText(r)), h('td', {}, classPill(r.cls), ' ', coveragePill(r))))))),
      s.rows.length > 40 ? h('p', { class: 'small muted' }, `Se muestran 40 de ${s.rows.length} filas; ábrelas todas en la tabla.`) : null,
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { ps.filters.ids = new Set(s.rows.map((r) => r.id)); ps.filters.idsLabel = `${q.title} · ${s.title}`; ps.filters.view = ''; ps.tab = 'tabla'; repaint(); } }, 'Abrir este conjunto en la tabla maestra')));
  }
  const pv = (() => { const r = rows.find((x) => x.id === ({ triples: 'shots.three.p0', cansancio: 'energy.severityNodes', libro: 'selection.priorityWeights', rapido: 'durationSeconds.organizedShot', jugada: 'selection.priorityWeights', perdidas: 'outcomes.base.turnover' }[q.id])); return r ? previewRow(r, c.consult.effective) : null; })();
  if (pv) root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Mecanismo: ${pv.title}`), h('p', { class: 'small muted' }, pv.note), pv.tables.map((t) => table(t.head, t.rows))));
  return root;
}

// ---------------------------------------------------------------- vistas temáticas y catálogo
export function renderVistas() {
  const c = ctx(); const v = ps.view;
  const root = h('div', {});
  root.append(h('div', { class: 'card' }, h('div', { class: 'chips' }, Object.entries(VIEWS).map(([k, t]) => h('button', { type: 'button', class: `chip ${v === k ? 'on' : ''}`, onclick: () => { ps.view = k; ps.limit = 150; repaint(); } }, t))),
    h('p', { class: 'small muted' }, 'Los mismos datos de la tabla maestra, organizados por tema. Las áreas futuras muestran su ficha funcional y su estado pendiente, no controles inactivos.')));
  const rows = c.cRows.rows.filter((r) => r.views.includes(v));
  const groups = GROUPS.filter((g) => g.view === v);
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `${VIEWS[v]}: grupos funcionales de este tema`),
    table(['ID', 'Responsabilidad', 'Filas activas', 'Cobertura', 'Entrega prevista'], groups.map((g) => { const n = c.cRows.rows.filter((r) => r.grp === g.id).length; return [g.id, g.resp, n, h('span', { class: `pill ${n ? 'ok' : 'warn'}` }, n ? 'parcial' : 'pendiente'), g.delivery]; }))));
  if (rows.length) { ps.filters.view = v; root.append(masterTable({ lockView: v, title: `Filas de «${VIEWS[v]}»` })); } else root.append(h('div', { class: 'card' }, h('p', { class: 'muted' }, 'Este tema no tiene todavía filas ejecutadas por el motor actual. Su ficha funcional está arriba; no se rellena con valores inventados ni con ceros.')));
  return root;
}

export function renderCatalog() {
  const c = ctx(); const rows = c.cRows.rows;
  const by = Object.fromEntries(GROUPS.map((g) => [g.id, rows.filter((r) => r.grp === g.id)]));
  const active = GROUPS.filter((g) => !g.support && by[g.id].length);
  return h('div', {},
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Catálogo funcional: 81 grupos deportivos + SUP01–SUP04'),
      h('p', { class: 'small' }, `${active.length} de 81 grupos tienen filas ejecutadas en el motor actual (cobertura parcial); ${81 - active.length} están pendientes. Es un índice de responsabilidades de datos, no una exigencia de 81 tablas. La entrega de ampliación es la prevista por el roadmap aceptado, no un compromiso de contenido.`),
      h('p', { class: 'small muted' }, 'La asignación de cada fila a un grupo es de Claude (propuesta a revisar por Dennis); el número de filas de un grupo no significa que el grupo esté completo ni calibrado.')),
    h('div', { class: 'card' }, h('div', { class: 'scroll tall' }, h('table', {},
      h('thead', {}, h('tr', {}, ['ID', 'Responsabilidad funcional', 'Resultado / contrato de referencia', 'Filas', 'Cobertura real', 'Entrega prevista', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, GROUPS.map((g) => { const n = by[g.id].length; const cons = by[g.id].filter((r) => r.coverage === 'consumido').length;
        return h('tr', {}, h('td', {}, h('strong', {}, g.id)), h('td', { style: 'white-space:normal;min-width:260px' }, g.resp), h('td', { style: 'white-space:normal;min-width:240px' }, g.contract), h('td', { class: 'num' }, n),
          h('td', {}, g.support ? h('span', { class: 'pill ok' }, 'transversal (esta entrega)') : h('span', { class: `pill ${n ? 'ok' : 'warn'}` }, n ? `parcial · ${cons} consumidas` : 'pendiente')), h('td', { class: 'small' }, g.delivery),
          h('td', {}, n ? h('button', { class: 'link', type: 'button', onclick: () => { ps.filters.ids = new Set(by[g.id].map((r) => r.id)); ps.filters.idsLabel = g.id; ps.filters.view = ''; ps.tab = 'tabla'; repaint(); } }, 'ver filas') : ''));
      }))))));
}
void canonical;
