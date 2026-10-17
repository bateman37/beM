// Escenarios de contraste (MOTOR-11 §12–§13) dentro de «Plantillas»: catálogo LAB11-00…12 con pregunta, base y diferencias exactas, copias C00–C06 de MOTOR-07,
// escenarios guardados con export/import versionado y comparación base/variante sin lotes. Cada variante es una COPIA identificada: no toca fichas ni planes editados.
import { h, table } from './dom.js';
import { store, popProfile, prepProfile } from './store.js';
import { buildContrastScenario, CONTRAST_SCENARIOS } from '../match/index.js';
import { labCatalog, buildLabVariant, sameTeamsNote, exportScenario, importScenario, REFERENCE_IDS } from '../population/index.js';

const pill = (txt, cls = '') => h('span', { class: `pill ${cls}` }, txt);
const show = (v) => { if (v === null || v === undefined) return '—'; if (typeof v === 'number') return String(Number(v.toFixed(4))); return String(v); };

function download(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const changeRows = (changes) => changes.map((c) => [c.jugador ?? c.equipo ?? 'encuentro', c.campo, show(c.antes), show(c.despues)]);
const diffTable = (changes) => (changes.length ? table(['Sujeto', 'Campo', 'Antes', 'Después'], changeRows(changes)) : h('p', { class: 'small' }, 'Sin cambios: es la base neutral declarada.'));

function prepare(ctx, sc, variantId) {
  const { ui, rerender } = ctx; const prof = popProfile(); const pair = ui.sc.rival[sc.id] ?? null;
  try {
    const r = buildLabVariant(prof, store.players, sc.id, variantId, { lib: store.pop, seed: sc.historical ? prof.scenario.seed : store.edit.seed, importance: store.edit.importance ?? 'ordinary', pairing: pair ? { b: pair } : undefined });
    return r;
  } catch (e) { ui.msg = `No se pudo construir el escenario: ${e.message}`; rerender(); return null; }
}
function use(ctx, r) { store.scenario = r; ctx.ui.msg = `Copia activa para el próximo partido: ${r.scenario.id}.`; window.dispatchEvent(new CustomEvent('beM:goto', { detail: 'game' })); }

function labCard(ctx, sc) {
  const { ui, rerender } = ctx; const open = ui.sc.open === sc.id; const prof = popProfile();
  const rivalOptions = [...REFERENCE_IDS, ...store.pop.teams().map((r) => r.id)];
  const variants = open ? sc.variants.map((v) => {
    const key = `${sc.id}/${v.id}`; const shown = ui.sc.view === key; let built = null;
    if (shown) built = prepare(ctx, sc, v.id);
    return h('div', { class: 'card', style: 'margin:6px 0' },
      h('div', { class: 'row' }, h('strong', {}, v.label), (v.multicause ?? sc.multicause) ? pill('multicausa', 'warn') : null, sc.diagnostic ? pill('diagnóstico preparado', 'warn') : null),
      h('div', { class: 'row' },
        h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.sc.view = shown ? null : key; rerender(); } }, shown ? 'Ocultar diferencias' : 'Ver base, variante y diferencias'),
        h('button', { class: 'btn', type: 'button', id: `lab-${sc.id}-${v.id}`, onclick: () => { const r = prepare(ctx, sc, v.id); if (r) use(ctx, r); } }, 'Preparar el partido')),
      built ? h('div', {}, h('p', { class: 'small' }, `Equipos: ${built.input.teams.map((t) => `${t.id} (${t.source?.kind ?? '—'})`).join(' – ')} · semilla deportiva ${built.input.seed} · importancia ${built.input.importance}`),
        h('p', { class: 'small' }, h('strong', {}, 'Diferencias exactas respecto a la base: '), built.changes.length ? `${built.changes.length}` : 'ninguna (es la base)'), diffTable(built.changes),
        built.plannedOrders.length ? h('div', {}, h('p', { class: 'small' }, h('strong', {}, 'Órdenes previstas (se envían desde «Partido» en su frontera, no se aplican solas):')), h('ul', { class: 'small' }, built.plannedOrders.map((o) => h('li', {}, `${o.boundary}: ${o.spec.type} ${JSON.stringify(Object.fromEntries(Object.entries(o.spec).filter(([k]) => k !== 'type')))} — ${o.note}`)))) : null,
        h('p', { class: 'small muted' }, `Conservado: ${sc.conserved.join(', ')}. ${sameTeamsNote(built)}`)) : null);
  }) : null;
  return h('div', { class: 'card', style: 'margin:6px 0' },
    h('div', { class: 'row' }, h('strong', {}, `${sc.id} · ${sc.name}`), sc.diagnostic ? pill('diagnóstico', 'warn') : null, sc.multicause ? pill('multicausa', 'warn') : null, h('button', { class: 'link small', type: 'button', onclick: () => { ui.sc.open = open ? null : sc.id; rerender(); } }, open ? 'ocultar' : 'abrir')),
    h('p', { class: 'small' }, sc.question),
    open && sc.rivalFree ? h('label', { class: 'row small' }, 'Rival (libre) ', h('select', { 'aria-label': `rival de ${sc.id}`, onchange: (e) => { ui.sc.rival[sc.id] = e.target.value; rerender(); } }, rivalOptions.map((id) => h('option', { value: id, selected: (ui.sc.rival[sc.id] ?? (typeof sc.pairing.b === 'string' ? sc.pairing.b : '')) === id }, id)))) : null,
    variants);
  void prof;
}

function contrastCard(ctx) {
  const { ui, rerender } = ctx; const prof = prepProfile();
  const cards = CONTRAST_SCENARIOS.map((sc) => {
    const prev = ui.scen === sc.id ? buildContrastScenario(sc.id, store.edit, prof) : null;
    return h('div', { class: 'card', style: 'margin:6px 0' }, h('strong', {}, `${sc.id} · ${sc.name}`), h('p', { class: 'small' }, sc.summary),
      h('div', { class: 'row' },
        h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.scen = ui.scen === sc.id ? null : sc.id; rerender(); } }, ui.scen === sc.id ? 'Ocultar cambios' : 'Ver los cambios de la copia'),
        h('button', { class: 'btn', type: 'button', id: `scen-${sc.id}`, onclick: () => { store.scenario = buildContrastScenario(sc.id, store.edit, prof); window.dispatchEvent(new CustomEvent('beM:goto', { detail: 'game' })); } }, 'Usar esta copia en «Partido»')),
      prev ? diffTable(prev.changes) : null);
  });
  return h('details', { open: ui.sc.openC, ontoggle: (e) => { ui.sc.openC = e.target.open; } }, h('summary', {}, h('strong', {}, 'Copias C00–C06 de MOTOR-07 (sobre los equipos en uso)')),
    h('p', { class: 'small muted' }, 'Cada copia parte de tu entrada actual, lista exactamente lo que cambia y no modifica tus fichas ni tus planes. Sirven para observar mecanismos; el marcador de una copia con varios cambios no atribuye causas.'), cards);
}

function activeCard(ctx) {
  const { ui, rerender } = ctx; const sc = store.scenario; const prof = popProfile();
  const logs = store.pop.results().filter((r) => sc && r.scenario?.split('/')[0] === sc.scenario.id.split('/')[0]);
  return h('div', { class: 'card', id: 'scenario-active' }, h('h3', { style: 'margin-top:0' }, 'Escenario activo, guardado e intercambio'),
    sc ? h('div', {}, h('div', { class: 'row' }, pill(`Copia activa: ${sc.scenario.id}`, 'warn'), sc.scenario.diagnostic ? pill('diagnóstico preparado', 'warn') : null, sc.scenario.multicause ? pill('multicausa', 'warn') : null,
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { store.scenario = null; rerender(); } }, 'Quitar'),
      h('button', { class: 'btn', type: 'button', id: 'scenario-save', onclick: () => { const name = prompt('Nombre del escenario guardado:', sc.scenario.name); if (name === null) return; const r = store.pop.saveScenario({ name, question: sc.scenario.question ?? sc.scenario.summary, diagnostic: sc.scenario.diagnostic, multicause: sc.scenario.multicause, lab: sc.scenario.labVersion ?? null, changes: sc.changes, plannedOrders: sc.plannedOrders ?? [], input: sc.input, scenario: sc.scenario }); ui.msg = r.ok ? `Escenario guardado como ${r.id}.` : `No se guardó: ${r.error}`; rerender(); } }, 'Guardar escenario'),
      h('button', { class: 'btn secondary', type: 'button', id: 'scenario-export', onclick: () => download(`beM-scenario-${sc.scenario.id.replace(/\W+/g, '_')}.json`, exportScenario(sc, prof, { profileRef: store.profileRef })) }, 'Exportar JSON')),
      h('p', { class: 'small' }, `${sc.scenario.name}: ${sc.changes.length} diferencias listadas respecto a su base. ${sc.scenario.question ? '' : ''}`), diffTable(sc.changes),
      logs.length ? h('div', {}, h('p', { class: 'small' }, h('strong', {}, `Resultados de encuentros individuales de ${sc.scenario.id.split('/')[0]} (sin lotes):`)), table(['Variante', 'Equipos', 'Semilla', 'Marcador', 'Estado'], logs.map((r) => [r.scenario, r.teams.join(' – '), r.seed, r.score?.join('–') ?? '—', r.status])), h('p', { class: 'small muted' }, 'Un solo partido por variante: no atribuye causas ni demuestra mejora. Una misma semilla ayuda a comparar, pero un cambio de decisión puede alterar los sorteos posteriores; no se prometen resultados emparejados. Los lotes de 10/100/1 000 partidos son de MOTOR-12.')) : h('p', { class: 'small muted' }, 'Aún no hay encuentros terminados con esta copia. Tras jugar uno, su resultado aparece aquí y en «Análisis» (mismo análisis de MOTOR-10).'))
      : h('p', { class: 'small muted' }, 'No hay ninguna copia activa: los partidos usan tus equipos en uso tal como están.'),
    h('div', { class: 'row', style: 'margin-top:8px' }, h('label', { class: 'btn secondary' }, 'Importar escenario (JSON) ', h('input', { type: 'file', id: 'scenario-import', accept: 'application/json,.json', style: 'display:none', onchange: async (e) => {
      const f = e.target.files?.[0]; if (!f) return; let msg;
      try { const file = JSON.parse(await f.text()); const r = importScenario(file, prepProfile()); if (!r.ok) msg = `Importación rechazada (el archivo no se modifica ni se ejecuta): ${r.problems.slice(0, 4).join(' · ')}`; else { const s = store.pop.saveScenario(r.record); msg = s.ok ? `Escenario importado como ${s.id}.${r.warnings.length ? ` Avisos: ${r.warnings.join(' · ')}` : ''}${r.notes.length ? ` ${r.notes.join(' · ')}` : ''}` : `No se guardó: ${s.error}`; } } catch (err) { msg = `El archivo no es JSON válido: ${err.message}`; }
      ui.msg = msg; e.target.value = ''; rerender(); } }))),
    h('h3', {}, `Escenarios guardados (${store.pop.scenarios().length})`),
    store.pop.scenarios().length ? table(['Id', 'Nombre', 'Equipos', 'Diferencias', 'Guardado', ''], store.pop.scenarios().map((s) => [s.id, s.name, s.input.teams.map((t) => t.id).join(' – '), s.changes?.length ?? 0, String(s.savedAt ?? '').slice(0, 16).replace('T', ' '),
      h('span', {}, h('button', { class: 'link', type: 'button', onclick: () => { store.scenario = { input: JSON.parse(JSON.stringify(s.input)), changes: s.changes ?? [], plannedOrders: s.plannedOrders ?? [], scenario: s.scenario ?? { id: s.id, name: s.name, summary: s.question ?? '', question: s.question, diagnostic: s.diagnostic, multicause: s.multicause } }; ui.msg = `Escenario guardado ${s.id} cargado como copia activa (el original guardado no se modifica).`; rerender(); } }, 'cargar'), ' ',
        h('button', { class: 'link', type: 'button', onclick: () => { store.pop.duplicateScenario(s.id); rerender(); } }, 'duplicar'), ' ', h('button', { class: 'link', type: 'button', onclick: () => download(`beM-scenario-${s.id}.json`, exportScenario({ ...s, scenario: s.scenario }, prof)) }, 'exportar'), ' ',
        h('button', { class: 'link err', type: 'button', onclick: () => { if (confirm(`¿Eliminar el escenario guardado ${s.id}?`)) { store.pop.removeScenario(s.id); rerender(); } } }, 'eliminar'))])) : h('p', { class: 'small muted' }, 'Ninguno.'));
}

export function scenariosCard(ctx) {
  const { ui } = ctx; ui.sc ??= { open: null, view: null, rival: {}, q: '', origin: 'all', openC: false };
  const prof = popProfile(); const cat = labCatalog(prof);
  const q = ui.sc.q.trim().toLowerCase(); const match = (s) => !q || `${s.id} ${s.name} ${s.question}`.toLowerCase().includes(q);
  return h('div', { class: 'card', id: 'scenarios' }, h('h3', { style: 'margin-top:0' }, `Escenarios de contraste (${prof.lab?.version ?? 'sin catálogo'})`),
    h('p', { class: 'small muted' }, prof.lab?.note ?? ''),
    h('div', { class: 'row' }, h('label', { class: 'small' }, 'Buscar por pregunta ', h('input', { type: 'search', 'aria-label': 'buscar escenario', value: ui.sc.q, onchange: (e) => { ui.sc.q = e.target.value; ctx.rerender(); } })),
      h('label', { class: 'small' }, 'Origen ', h('select', { 'aria-label': 'origen', onchange: (e) => { ui.sc.origin = e.target.value; ctx.rerender(); } }, [['all', 'todos'], ['lab', 'LAB11 (MOTOR-11)'], ['c', 'C00–C06 (MOTOR-07)'], ['saved', 'guardados e importados']].map(([v, t]) => h('option', { value: v, selected: ui.sc.origin === v }, t))))),
    activeCard(ctx),
    ['all', 'lab'].includes(ui.sc.origin) ? h('div', {}, h('h3', {}, 'LAB11: preguntas, base y diferencias'), cat.filter(match).map((s) => labCard(ctx, s)), cat.filter(match).length ? null : h('p', { class: 'small muted' }, 'Ningún escenario coincide.')) : null,
    ['all', 'c'].includes(ui.sc.origin) ? contrastCard(ctx) : null);
}
