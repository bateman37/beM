// Pantalla «Plantillas» (MOTOR-11): catálogo de doce equipos de referencia, generados y variantes; equipos en uso (A y B), plantilla y ficha completa editable,
// +1/+3/+5 con deshacer exacto, generador y escenarios de contraste. Edita las entradas del PRÓXIMO encuentro: un encuentro iniciado conserva su copia congelada.
import { h, clear, fmt } from './dom.js';
import { store, ATTR_GROUPS, planBulk, applyChanges, undoLast, persist, restoreInitial, prepProfile, slotDirty } from './store.js';
import { ATTRS, momentCategory, CATEGORY_LABELS } from '../match/index.js';
import { bulkSummary } from '../population/index.js';
import { slotsCard, catalogCard, inspectCard, generatorCard, playerSheet, defaultGen, srcText } from './population-ui.js';
import { scenariosCard } from './scenarios-ui.js';
import { learningCopyCard, knowledgeBulkCard, knowledgeSection } from './knowledge-ui.js';
import { sessionCard } from './learning-ui.js';

const ui = { diag: false, team: 0, openPlayer: null, selPlayers: new Set(), selAttrs: new Set(), delta: 3, preview: null, msg: '', inspect: null, inspectPlayer: null, diffSlot: null, gen: defaultGen(), scen: null, sc: null, root: null };

export function renderTeams(root) {
  ui.root = root; clear(root);
  const rerender = () => renderTeams(root); const ctx = { ui, rerender };
  const { edit } = store;
  root.append(h('h2', {}, 'Plantillas y fichas'),
    h('p', { class: 'muted small' }, 'Edición para el próximo encuentro. El acta de un encuentro terminado conserva su propia copia de entrada congelada. Las capacidades se miden en una escala absoluta 1–30 (no es un porcentaje de acierto, un percentil ni una nota relativa a la liga) y conservan su precisión continua.'));
  if (ui.msg) root.append(h('p', { class: 'pill ok', id: 'pop-msg' }, ui.msg));
  root.append(slotsCard(ctx));
  const team = edit.teams[ui.team];
  if (!ui.inspect) {
    root.append(statesCard(team, root));
    root.append(rosterCard(team, root));
    root.append(bulkCard(root));
    root.append(learningCopyCard(ctx), knowledgeBulkCard(ctx), sessionCard(ctx)); // MOTOR-18: conocimiento táctico sobre una copia explícita
    if (ui.openPlayer) { const p = team.players.find((x) => x.id === ui.openPlayer); if (p) root.append(playerCard(p, team, root)); }
  } else root.append(inspectCard(ctx));
  root.append(catalogCard(ctx));
  root.append(generatorCard(ctx));
  root.append(scenariosCard(ctx));
  root.append(h('div', { class: 'card' }, h('button', { class: 'btn danger', type: 'button', onclick: () => { if (confirm('¿Volver a la entrada inicial de MOTOR-10 (EQ01 y EQ02 con sus fichas y planes históricos)? Se perderán las ediciones de los dos equipos en uso. Tus variantes y escenarios guardados no se tocan.')) { restoreInitial(); ui.selPlayers.clear(); ui.preview = null; ui.inspect = null; ui.msg = 'Entrada inicial histórica restaurada (EQ01 y EQ02).'; renderTeams(root); } } }, 'Volver a la entrada inicial histórica (EQ01/EQ02)')));
}

function rosterCard(team, root) {
  const starterSlot = Object.fromEntries(Object.entries(team.plan.starters).map(([s, id]) => [id, s]));
  const all = team.players.every((p) => ui.selPlayers.has(p.id));
  const rows = team.players.map((p) => h('tr', { class: `${ui.selPlayers.has(p.id) ? 'sel' : ''} ${starterSlot[p.id] ? 'starter' : ''}` },
    h('td', {}, h('input', { type: 'checkbox', checked: ui.selPlayers.has(p.id), 'aria-label': `Seleccionar ${p.id}`, onchange: (e) => { e.target.checked ? ui.selPlayers.add(p.id) : ui.selPlayers.delete(p.id); ui.preview = null; renderTeams(root); } })),
    h('td', {}, p.id),
    h('td', {}, starterSlot[p.id] ? h('span', { class: 'pill' }, `Titular ${starterSlot[p.id]}`) : h('span', { class: 'muted' }, 'Banquillo')),
    h('td', {}, p.positions.join('|')),
    h('td', {}, `${p.offensiveRole.code} ${p.offensiveRole.name} · ${p.defensiveRole.code} ${p.defensiveRole.name}`),
    h('td', {}, `${p.heightCm} cm · ${p.age} a.`),
    h('td', { class: 'num' }, h('input', { type: 'number', min: 0, max: 100, step: 1, value: p.state.energy, 'aria-label': `Energía inicial de ${p.id}`, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0 && v <= 100) { p.state.energy = v; persist(); } else { e.target.value = p.state.energy; alert('La energía inicial debe estar entre 0 y 100.'); } } })),
    h('td', {}, h('button', { class: 'link', onclick: () => { ui.openPlayer = p.id; renderTeams(root); } }, 'Abrir ficha'))));
  return h('div', { class: 'card' }, h('h3', {}, `${team.id} — ${team.name} · doce jugadores`), h('p', { class: 'small muted' }, srcText(team.source)),
    h('div', { class: 'scroll' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, h('input', { type: 'checkbox', checked: all, 'aria-label': 'Seleccionar todos', onchange: (e) => { team.players.forEach((p) => (e.target.checked ? ui.selPlayers.add(p.id) : ui.selPlayers.delete(p.id))); ui.preview = null; renderTeams(root); } })), ['Jugador', 'Quinteto', 'Posiciones', 'Roles ofensivo y defensivo', 'Cuerpo', 'Energía inicial (0–100)', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, rows))));
}

function bulkCard(root) {
  const nP = ui.selPlayers.size; const nA = ui.selAttrs.size; const last = store.undo[store.undo.length - 1];
  const chip = (a) => h('label', { class: `chip ${ui.selAttrs.has(a) ? 'on' : ''}` }, h('input', { type: 'checkbox', checked: ui.selAttrs.has(a), onchange: (e) => { e.target.checked ? ui.selAttrs.add(a) : ui.selAttrs.delete(a); ui.preview = null; renderTeams(root); } }), `${a} ${store.labels[a]}`);
  const groups = ATTR_GROUPS.map(([g, list]) => h('div', {}, h('strong', { class: 'small' }, g, ' '), h('button', { class: 'link small', onclick: () => { const on = list.every((a) => ui.selAttrs.has(a)); list.forEach((a) => (on ? ui.selAttrs.delete(a) : ui.selAttrs.add(a))); ui.preview = null; renderTeams(root); } }, 'grupo'), h('div', { class: 'chips' }, list.map(chip))));
  const preview = () => { ui.preview = planBulk(store.edit, ui.selPlayers, ui.selAttrs, ui.delta, store.profile.abilityBounds); renderTeams(root); };
  const card = h('div', { class: 'card', id: 'bulk' }, h('h3', { style: 'margin-top:0' }, 'Mejora al conjunto seleccionado: +1, +3 o +5'),
    h('p', { class: 'muted small' }, 'Se aplica una sola vez al conjunto jugadores × capacidades seleccionado, por puntos absolutos sobre la precisión continua (nuevo = mínimo(30, anterior + incremento)), sin wraparound. Una selección vacía no modifica nada. No incluye edad, cuerpo, tendencias, energía ni Forma. Modifica entradas de preparación, nunca un encuentro ya iniciado.'),
    h('div', { class: 'row' }, h('span', {}, `Jugadores seleccionados: ${nP}`), h('span', {}, `Capacidades seleccionadas: ${nA}`),
      h('button', { class: 'btn secondary', onclick: () => { ui.selPlayers.clear(); store.edit.teams[ui.team].players.forEach((p) => ui.selPlayers.add(p.id)); ui.preview = null; renderTeams(root); } }, 'Todos los jugadores del equipo abierto'),
      h('button', { class: 'btn secondary', onclick: () => { store.edit.teams.forEach((t) => t.players.forEach((p) => ui.selPlayers.add(p.id))); ui.preview = null; renderTeams(root); } }, 'Todos los jugadores (A y B)'),
      h('button', { class: 'btn secondary', onclick: () => { ATTRS.forEach((a) => ui.selAttrs.add(a)); ui.preview = null; renderTeams(root); } }, 'Las 32 capacidades'),
      h('button', { class: 'btn secondary', onclick: () => { ui.selPlayers.clear(); ui.selAttrs.clear(); ui.preview = null; renderTeams(root); } }, 'Vaciar selección')),
    h('div', { class: 'row', style: 'margin-top:8px' }, h('span', {}, 'Incremento:'),
      h('span', { class: 'seg' }, [1, 3, 5].map((d) => h('button', { 'aria-pressed': ui.delta === d, onclick: () => { ui.delta = d; ui.preview = null; renderTeams(root); } }, `+${d}`))),
      h('button', { class: 'btn secondary', id: 'bulk-preview', onclick: preview }, 'Ver qué se va a modificar'),
      h('button', { class: 'btn secondary', id: 'bulk-undo', disabled: !last, onclick: () => { const r = undoLast(store.edit); persist(); ui.preview = null; ui.msg = r ? `Deshecho «${r.label}»: ${r.restored} valores restaurados a su valor anterior exacto${r.conflicts.length ? `; ${r.conflicts.length} no se tocaron porque se editaron después` : ''}.` : 'Nada que deshacer.'; renderTeams(root); } }, last ? `Deshacer: ${last.label}` : 'Deshacer')),
    h('div', { style: 'margin-top:10px; display:grid; gap:8px' }, groups));
  if (ui.preview) {
    const ch = ui.preview; const sm = bulkSummary(ch);
    card.append(h('div', { style: 'margin-top:12px' },
      h('p', {}, ch.length === 0 ? h('span', { class: 'neutral' }, 'Selección vacía: no se modificará nada.') : `Se revisarán ${sm.cells} celdas de ${sm.players} jugadores: ${sm.changed} cambian de valor, ${sm.atLimit} llegan al límite ${store.profile.abilityBounds.join('–')} y se quedan en él, ${sm.alreadyAtLimit} ya estaban en el límite.`),
      ch.length ? h('details', {}, h('summary', {}, 'Detalle de cambios previstos'), h('div', { class: 'scroll', style: 'max-height:260px' }, h('table', {}, h('thead', {}, h('tr', {}, ['Jugador', 'Capacidad', 'Antes', 'Después'].map((t) => h('th', {}, t)))), h('tbody', {}, ch.map((c) => h('tr', {}, h('td', {}, c.playerId), h('td', {}, `${c.attr} ${store.labels[c.attr]}`), h('td', { class: 'num' }, fmt(c.before, 3)), h('td', { class: 'num' }, `${fmt(c.after, 3)}${c.limit ? ' (límite)' : ''}`))))))) : null,
      h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn', id: 'bulk-apply', disabled: !ch.length, onclick: () => { const n = applyChanges(store.edit, ch, `+${ui.delta} a ${sm.players} jugadores`); persist(); ui.preview = null; ui.msg = `Aplicado +${ui.delta}: ${n} valores revisados (una sola vez). Puedes deshacerlo con el valor anterior exacto.`; renderTeams(root); } }, `Aplicar +${ui.delta} una vez`))));
  }
  return card;
}

function playerCard(p, team, root) {
  return h('div', { class: 'card', id: 'player-card' },
    h('div', { class: 'row' }, h('h3', { style: 'margin:0' }, `Ficha ${p.id} — ${p.name}`), h('button', { class: 'btn secondary', onclick: () => { ui.openPlayer = null; renderTeams(root); } }, 'Cerrar ficha')),
    h('div', { style: 'margin-top:10px' }, playerSheet(p, team, { diag: ui.diag, onRepaint: () => renderTeams(root) })),
    h('div', { style: 'margin-top:10px' }, ...knowledgeSection(p, team, { diag: ui.diag, rerender: () => renderTeams(root) })));
}

// Estados de equipo y modo diagnóstico: T inicial (conexión del equipo) e importancia del encuentro.
function statesCard(team, root) {
  const prof = prepProfile(); const [lo, hi] = prof.teamMoment.range;
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Estados de entrada del equipo'),
    h('label', { class: 'row' }, h('input', { type: 'checkbox', id: 'diag-mode', checked: ui.diag, onchange: (e) => { ui.diag = e.target.checked; renderTeams(root); } }), ' Modo diagnóstico de laboratorio: editar los números de Forma, momentos y T (entrada controlada; no es una orden de entrenador)'),
    h('div', { class: 'row', style: 'margin-top:6px' }, h('span', {}, 'Conexión del equipo (T) inicial: '),
      ui.diag ? h('input', { type: 'number', min: lo, max: hi, step: 0.05, value: team.plan.initialTeamMoment, 'aria-label': 'T inicial', onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= lo && v <= hi) { team.plan.initialTeamMoment = v; persist(); } else e.target.value = team.plan.initialTeamMoment; } }) : null,
      h('span', { class: 'pill' }, CATEGORY_LABELS.equipo[momentCategory(prof, team.plan.initialTeamMoment)]), h('span', { class: 'small muted' }, 'Respuesta y coordinación del equipo, no un multiplicador de tiro. Una sustitución no la borra.')),
    ui.diag ? h('p', { class: 'pill warn' }, 'Modo diagnóstico activo: los estados no ordinarios son entradas preparadas, no acontecimientos naturales.') : null,
    h('p', { class: 'small muted' }, 'Estados ordinarios de un escenario nuevo: energía 100, Forma y momentos neutros, T neutral. La importancia del encuentro (ordinario, importante, decisivo) se elige en «Partido». La edad y el peso no tienen efecto deportivo directo.'));
}
void slotDirty;
