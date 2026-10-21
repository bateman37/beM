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
import { validateMatrix } from '../../match/regs.js';
import { CATALOG } from '../../analysis/catalog.js';
import { VISIBILITY } from '../../analysis/visibility.js';
import { compatCard } from './compat-ui.js';
import { assessProfile } from '../../profiles/compat.js';
import { APP_VERSION, ENGINE_VERSION, EXPORT_SCHEMA } from '../../version.js';

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
  // MOTOR-15: la tarjeta de compatibilidad (identidad, módulos no compatibles y recuperación explícita) sustituye a la de «anterior a MOTOR-09».
  const legacyCard = compatCard({ ...c, consult: a, assessment: c.consult.id === a.id ? c.assessment : assessProfile(a.effective), degraded: c.consult.id === a.id ? c.degraded : null });
  const noAnalysis = !L.isLegacy(a.id) && !L.version(a.id)?.effective?.analysis;
  const analysisCard = noAnalysis ? h('div', { class: 'card' }, h('strong', {}, 'El perfil activo no incluye la política analítica de MOTOR-10. '), 'Puede jugar con normalidad: el análisis usa entonces los valores por defecto del código y lo identifica («por defecto del código»). ',
    h('button', { class: 'btn secondary', type: 'button', id: 'activate-m10', onclick: () => { L.activate(L.baseId, 'activar la base de MOTOR-10 (política analítica administrable)'); window.dispatchEvent(new Event('beM:repaint')); repaint(); } }, 'Activar la base de MOTOR-10'),
    h('p', { class: 'small muted' }, 'La activación es explícita y no migra nada en silencio; una versión activa anterior sigue siendo jugable y reproducible.')) : null;
  const noPopulation = !L.isLegacy(a.id) && !L.version(a.id)?.effective?.population;
  const popCard = noPopulation ? h('div', { class: 'card' }, h('strong', {}, 'El perfil activo no incluye la población y el generador de MOTOR-11. '), 'Puede jugar con normalidad: Plantillas usa entonces la receta y los equipos de la base de MOTOR-11 y lo identifica («de la base de MOTOR-11»). ',
    h('button', { class: 'btn secondary', type: 'button', id: 'activate-m11', onclick: () => { L.activate(L.baseId, 'activar la base de MOTOR-11 (población de referencia, planes naturales, receta del generador y escenarios; +SEM-MOTOR11-20261017)'); window.dispatchEvent(new Event('beM:repaint')); repaint(); } }, 'Activar la base de MOTOR-11'),
    h('p', { class: 'small muted' }, 'La activación es explícita y no migra nada en silencio: tus perfiles antiguos, candidatas, planes y variantes guardadas se conservan; cargar los planes naturales sigue siendo una acción visible en Preparación.')) : null;
  const noBatch = !L.isLegacy(a.id) && !L.version(a.id)?.effective?.batch;
  const batchCard = noBatch ? h('div', { class: 'card' }, h('strong', {}, 'El perfil activo no incluye los parámetros técnicos de lotes de MOTOR-12. '), 'Puede jugar con normalidad: la pestaña Lotes usa entonces la base de MOTOR-12 (con sus valores técnicos precargados) y lo identifica. ',
    h('button', { class: 'btn secondary', type: 'button', id: 'activate-m12', onclick: () => { L.activate(L.baseId, 'activar la base de MOTOR-12 (parámetros técnicos de lotes; +SEM-MOTOR12-20261017, sin cambio deportivo)'); window.dispatchEvent(new Event('beM:repaint')); repaint(); } }, 'Activar la base de MOTOR-12'),
    h('p', { class: 'small muted' }, 'Son preferencias de ejecución y exportación (concurrencia, atajos, objetivo de parte, progreso, límite de ejecuciones): no cambian ningún peso ni probabilidad de juego. La activación es explícita; un lote ya congelado conserva sus valores.')) : null;
  const noFam = !L.isLegacy(a.id) && !L.version(a.id)?.effective?.familiarity;
  const famCard = noFam ? h('div', { class: 'card', id: 'fam-card' }, h('strong', {}, 'El perfil activo no incluye la familiaridad y el aprendizaje de MOTOR-18. '), 'Puede jugar con normalidad: la capa queda desactivada (compatibilidad neutra, efecto deportivo cero) y sus fichas no se interpretan como «dominan todas las tácticas». ',
    h('button', { class: 'btn secondary', type: 'button', id: 'activate-m18', onclick: () => { L.activate(L.baseId, 'activar la base de MOTOR-18 (familiaridad y aprendizaje; semillas SEM18; no cambia el deporte con la política legacy-neutral)'); window.dispatchEvent(new Event('beM:repaint')); repaint(); } }, 'Activar la base de MOTOR-18'),
    h('p', { class: 'small muted' }, 'Las cifras son SEM18 (semillas provisionales de producto, no calibración). La activación es explícita y no migra nada en silencio: tus fichas y perfiles se conservan.')) : null;
  const versionCard = h('div', { class: 'card', id: 'versions' }, h('h3', { style: 'margin-top:0' }, 'Versiones visibles (cuatro cosas distintas)'),
    table(['', 'Valor'], [['Aplicación / motor cargados', `${APP_VERSION} — motor ${ENGINE_VERSION}`], ['Perfil numérico/analítico activo', `${a.id} «${a.label}» · ${(L.version(a.id)?.effective?.effectiveId ?? '').split('+').slice(-2).join('+')} · ${a.status}`],
      ['Dataset, plan o escenario seleccionado', `${(L.version(a.id)?.effective?.population ?? store.baseNew.population)?.version}${L.version(a.id)?.effective?.population ? '' : ' (base de MOTOR-11; el perfil activo es anterior)'} · ${store.scenario ? `escenario ${store.scenario.scenario.id}` : 'sin escenario activo'}`], ['Formato de exportación del encuentro', EXPORT_SCHEMA]]),
    h('p', { class: 'small muted' }, 'Un perfil guardado con una versión anterior no convierte la aplicación en esa versión: conserva su identidad y, si el motor rechaza su contrato, se explica la incompatibilidad sin perder datos.'));
  return h('div', {},
    legacyCard, analysisCard, popCard, batchCard, famCard, versionCard,
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
  if (v === 'reglamento') root.append(regulationCard(c.consult.effective));
  if (v === 'estadistica') root.append(statsPolicyCard(c.consult.effective), analysisCatalogCard(c.consult.effective));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `${VIEWS[v]}: grupos funcionales de este tema`),
    table(['ID', 'Responsabilidad', 'Filas activas', 'Cobertura', 'Entrega prevista'], groups.map((g) => { const n = c.cRows.rows.filter((r) => r.grp === g.id).length; return [g.id, g.resp, n, h('span', { class: `pill ${n ? 'ok' : 'warn'}` }, n ? 'parcial' : 'pendiente'), g.delivery]; }))));
  if (rows.length) { ps.filters.view = v; root.append(masterTable({ lockView: v, title: `Filas de «${VIEWS[v]}»` })); } else root.append(h('div', { class: 'card' }, h('p', { class: 'muted' }, 'Este tema no tiene todavía filas ejecutadas por el motor actual. Su ficha funcional está arriba; no se rellena con valores inventados ni con ceros.')));
  return root;
}

// MOTOR-09: matriz normativa (REG02–REG04) y política estadística (EST01–EST04). La norma (con su estado de contraste) se distingue de los ratios SEM de generación.
const CONTRAST_PILL = { contrastada: 'ok', heredada: 'warn', provisional: 'warn', pendiente: 'bad' };
function regulationCard(profile) {
  const reg = profile.regulation;
  if (!reg) return h('div', { class: 'card' }, h('p', { class: 'muted' }, 'Este perfil es anterior a MOTOR-09 y no contiene la matriz normativa. La candidata de MOTOR-09 se crea explícitamente desde Inicio; no se migra en silencio.'));
  const issues = validateMatrix(profile);
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Reglamento · ${reg.edition} · ${reg.version}`),
    h('p', { class: 'small' }, 'Las constantes normativas (insignias de contraste) se distinguen de los ratios SEM de generación: una norma no se calibra, se contrasta con su fuente. Ninguna fila es lectura directa del PDF (acceso denegado, HTTP 403).'),
    h('p', {}, 'Validación de la matriz: ', issues.length ? h('span', { class: 'pill bad' }, `${issues.length} incidencia(s)`) : h('span', { class: 'pill ok' }, 'coherente'), issues.length ? h('ul', {}, issues.map((i) => h('li', { class: 'small' }, `${i.rule}: ${i.message}`))) : null),
    h('h4', {}, 'Fuentes'), table(['Id', 'Documento', 'Acceso real'], reg.sources.map((s) => [s.id, `${s.title} — ${s.use}`, s.access])),
    h('h4', {}, `Matriz de consecuencias y cobertura (${reg.matrix.length} filas)`),
    table(['Fila', 'Familia', 'Fuente y artículo', 'Contraste', 'Condición', 'Consecuencia', 'Cobertura', 'Punto de consumo', 'Verificación'], reg.matrix.map((r) => [r.id, r.family, `${r.source.doc} · ${r.source.article}${r.source.case ? ` · ${r.source.case}` : ''} (${r.source.reading})`, h('span', { class: `pill ${CONTRAST_PILL[r.contrast]}` }, r.contrast), r.when ? JSON.stringify(r.when) : '—', r.consequence ? JSON.stringify(r.consequence) : 'sin ejecución', `admin: ${r.coverage.admin} · exposición: ${r.coverage.exposure} · natural: ${r.coverage.natural}`, r.coverage.consume, r.coverage.verify])),
    h('p', { class: 'small muted' }, 'Estados: contrastada (texto del encargo §4.3), heredada (lectura implementada en MOTOR-01 a MOTOR-08 sin contrastar), provisional (mecanismo con valor sin contrastar), pendiente (tipada, sin ejecución). Un perfil que contradiga FIBA necesita nombre e identidad propios.'));
}
function statsPolicyCard(profile) {
  const sp = profile.statsPolicy;
  if (!sp) return h('div', { class: 'card' }, h('p', { class: 'muted' }, 'Este perfil es anterior a MOTOR-09 y no declara política estadística.'));
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Acta y créditos · ${sp.id}`), h('p', { class: 'small' }, sp.name, '. ', sp.basedOn),
    table(['Familia', 'Lectura', 'Regla', 'Contraste'], sp.families.map((f) => [f.label, f.reading, f.rule, f.contrast])),
    h('p', { class: 'small muted' }, `No representado por el hecho (se muestra «—», no 0): ${sp.unrepresented.join(', ')}. Fórmula de valoración: ${sp.valuation.formula}.`));
}

// MOTOR-10: catálogo común de indicadores del análisis (definición, naturaleza, unidad, fuente, universo, cálculo, cobertura, información, mínimo SEM y punto de consumo).
// Los parámetros editoriales y de muestra son filas del perfil (tabla maestra, vista «Estadística e información»); el catálogo en sí es contenido declarativo del código.
function analysisCatalogCard(profile) {
  const a = profile.analysis; const min = (d) => (d.sample != null ? `${a?.sample?.warnBelow ?? 5} (aviso)` : '—');
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Análisis del encuentro · ${a?.version ?? 'sin tabla analysis (se usan los valores por defecto del código)'}`),
    h('p', { class: 'small' }, 'Catálogo común: la misma definición alimenta tabla, gráfico, resumen, informe y exportación. No hay una tabla física por indicador ni fórmulas ejecutables desde el panel. Los parámetros editoriales y de muestra (final ajustado, antes/después, avisos, destaques del resumen, REC10-01/02) son filas editables en una candidata; no son multiplicadores deportivos.'),
    h('div', { class: 'scroll tall' }, table(['Id', 'Indicador', 'Naturaleza', 'Unidad', 'Fuente', 'Universo', 'Cálculo', 'Cobertura', 'Información', 'Mínimo de muestra', 'Consumo'], CATALOG.map((d) => [d.id, d.label, d.nature, d.unit, d.source, d.universe, d.calc, d.coverage, d.info === 'diag' ? 'diagnóstico' : 'público', min(d), 'src/analysis/catalog.js'])),),
    h('details', {}, h('summary', {}, 'Matriz de visibilidad (EST07)'), table(['Campo', 'Público/rival', 'Propia', 'Diagnóstico'], VISIBILITY.map((v) => [v.field, v.public, v.own, v.diag]))));
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
