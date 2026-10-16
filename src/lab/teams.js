// Pantalla «Plantillas»: dos plantillas, ficha de jugador, +1/+3/+5 al conjunto seleccionado, restauración y energía.
import { h, clear, fmt } from './dom.js';
import { store, ATTR_GROUPS, planBulk, applyChanges, persist, restoreInitial, prepProfile } from './store.js';
import { ATTRS, SLOTS, momentCategory, CATEGORY_LABELS, buildContrastScenario, CONTRAST_SCENARIOS } from '../match/index.js';

const ui = { diag: false, scen: null, team: 0, openPlayer: null, selPlayers: new Set(), selAttrs: new Set(), delta: 3, preview: null, msg: '' };

export function renderTeams(root) {
  clear(root);
  const { edit } = store;
  root.append(h('h2', {}, 'Plantillas y fichas'),
    h('p', { class: 'muted small' }, 'Edición para el próximo encuentro. El acta de un encuentro terminado conserva su propia copia de entrada congelada. Las capacidades se miden en una escala 1–30 (no es un porcentaje de acierto ni una nota relativa a la liga) y conservan su precisión continua.'));
  root.append(h('div', { class: 'row' },
    edit.teams.map((t, i) => h('button', { class: `btn ${ui.team === i ? '' : 'secondary'}`, onclick: () => { ui.team = i; ui.openPlayer = null; renderTeams(root); } }, `${t.id} — ${t.name}`)),
    h('button', { class: 'btn danger', onclick: () => { if (confirm('¿Restaurar las fichas y planes iniciales suministrados de ambos equipos? Se perderán las ediciones.')) { restoreInitial(); ui.selPlayers.clear(); ui.preview = null; ui.msg = 'Fichas y planes iniciales restaurados.'; renderTeams(root); } } }, 'Restaurar fichas iniciales')));
  if (ui.msg) root.append(h('p', { class: 'pill ok' }, ui.msg));
  const team = edit.teams[ui.team];
  root.append(statesCard(team, root));
  root.append(rosterCard(team, root));
  root.append(bulkCard(root));
  if (ui.openPlayer) { const p = team.players.find((x) => x.id === ui.openPlayer); if (p) root.append(playerCard(p, team, root)); }
  root.append(contrastCard(root));
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
  return h('div', { class: 'card' }, h('h3', {}, `${team.id} — ${team.name} · doce jugadores`),
    h('div', { class: 'scroll' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, h('input', { type: 'checkbox', checked: all, 'aria-label': 'Seleccionar todos', onchange: (e) => { team.players.forEach((p) => (e.target.checked ? ui.selPlayers.add(p.id) : ui.selPlayers.delete(p.id))); ui.preview = null; renderTeams(root); } })), ['Jugador', 'Quinteto', 'Posiciones', 'Roles ofensivo y defensivo', 'Cuerpo', 'Energía inicial (0–100)', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, rows))));
}

function bulkCard(root) {
  const nP = ui.selPlayers.size; const nA = ui.selAttrs.size;
  const chip = (a) => h('label', { class: `chip ${ui.selAttrs.has(a) ? 'on' : ''}` }, h('input', { type: 'checkbox', checked: ui.selAttrs.has(a), onchange: (e) => { e.target.checked ? ui.selAttrs.add(a) : ui.selAttrs.delete(a); ui.preview = null; renderTeams(root); } }), `${a} ${store.labels[a]}`);
  const groups = ATTR_GROUPS.map(([g, list]) => h('div', {}, h('strong', { class: 'small' }, g, ' '), h('button', { class: 'link small', onclick: () => { const on = list.every((a) => ui.selAttrs.has(a)); list.forEach((a) => (on ? ui.selAttrs.delete(a) : ui.selAttrs.add(a))); ui.preview = null; renderTeams(root); } }, 'grupo'), h('div', { class: 'chips' }, list.map(chip))));
  const preview = () => {
    ui.preview = planBulk(store.edit, ui.selPlayers, ui.selAttrs, ui.delta, store.profile.abilityBounds);
    renderTeams(root);
  };
  const card = h('div', { class: 'card' }, h('h3', {}, 'Mejora al conjunto seleccionado: +1, +3 o +5'),
    h('p', { class: 'muted small' }, 'Se aplica una sola vez al conjunto jugadores × capacidades seleccionado. Se respeta el límite 1–30, sin wraparound. Una selección vacía no modifica nada.'),
    h('div', { class: 'row' }, h('span', {}, `Jugadores seleccionados: ${nP}`), h('span', {}, `Capacidades seleccionadas: ${nA}`),
      h('button', { class: 'btn secondary', onclick: () => { store.edit.teams.forEach((t) => t.players.forEach((p) => ui.selPlayers.add(p.id))); ui.preview = null; renderTeams(root); } }, 'Seleccionar todos los jugadores (ambos equipos)'),
      h('button', { class: 'btn secondary', onclick: () => { ATTRS.forEach((a) => ui.selAttrs.add(a)); ui.preview = null; renderTeams(root); } }, 'Todas las capacidades'),
      h('button', { class: 'btn secondary', onclick: () => { ui.selPlayers.clear(); ui.selAttrs.clear(); ui.preview = null; renderTeams(root); } }, 'Vaciar selección')),
    h('div', { class: 'row', style: 'margin-top:8px' }, h('span', {}, 'Incremento:'),
      h('span', { class: 'seg' }, [1, 3, 5].map((d) => h('button', { 'aria-pressed': ui.delta === d, onclick: () => { ui.delta = d; ui.preview = null; renderTeams(root); } }, `+${d}`))),
      h('button', { class: 'btn secondary', onclick: preview }, 'Ver qué se va a modificar')),
    h('div', { style: 'margin-top:10px; display:grid; gap:8px' }, groups));
  if (ui.preview) {
    const ch = ui.preview; const real = ch.filter((c) => c.after !== c.before); const lim = ch.filter((c) => c.limit);
    card.append(h('div', { style: 'margin-top:12px' },
      h('p', {}, ch.length === 0 ? h('span', { class: 'neutral' }, 'Selección vacía: no se modificará nada.') : `Se modificarán ${real.length} valores de ${new Set(ch.map((c) => c.playerId)).size} jugadores (${lim.length} llegan al límite ${store.profile.abilityBounds.join('–')} y se quedan en él; ${ch.length - real.length} ya estaban en el límite).`),
      ch.length ? h('details', {}, h('summary', {}, 'Detalle de cambios previstos'), h('div', { class: 'scroll', style: 'max-height:260px' }, h('table', {}, h('thead', {}, h('tr', {}, ['Jugador', 'Capacidad', 'Antes', 'Después'].map((t) => h('th', {}, t)))), h('tbody', {}, ch.map((c) => h('tr', {}, h('td', {}, c.playerId), h('td', {}, `${c.attr} ${store.labels[c.attr]}`), h('td', { class: 'num' }, fmt(c.before, 2)), h('td', { class: 'num' }, `${fmt(c.after, 2)}${c.limit ? ' (límite)' : ''}`))))))) : null,
      h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn', disabled: !ch.length, onclick: () => { const n = applyChanges(store.edit, ch); persist(); ui.preview = null; ui.msg = `Aplicado +${ui.delta}: ${n} valores revisados (una sola vez).`; renderTeams(root); } }, `Aplicar +${ui.delta} una vez`))));
  }
  return card;
}

function playerCard(p, team, root) {
  const setAttr = (a, v) => { p.abilities[a] = v; persist(); };
  const groups = ATTR_GROUPS.map(([g, list]) => h('div', {}, h('h3', {}, g), h('div', { class: 'attrgrid' }, list.map((a) => h('div', { class: 'attr' },
    h('label', { for: `a-${p.id}-${a}` }, `${a} ${store.labels[a]}`),
    h('input', { id: `a-${p.id}-${a}`, type: 'number', min: 1, max: 30, step: 0.1, value: Number(p.abilities[a].toFixed(4)), onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 1 && v <= 30) setAttr(a, v); else { e.target.value = p.abilities[a]; alert('La capacidad debe estar entre 1 y 30.'); } } }))))));
  return h('div', { class: 'card' },
    h('div', { class: 'row' }, h('h3', { style: 'margin:0' }, `Ficha ${p.id} — ${p.name}`), h('button', { class: 'btn secondary', onclick: () => { ui.openPlayer = null; renderTeams(root); } }, 'Cerrar ficha')),
    h('div', { class: 'grid2', style: 'margin-top:10px' },
      h('div', {}, h('h3', {}, 'Cuerpo y datos'),
        h('div', { class: 'kv' }, kv('Edad', p.age), kv('Altura', `${p.heightCm} cm`), kv('Envergadura', `${p.wingspanCm} cm`), kv('Peso', `${p.weightKg} kg (efecto directo adicional: cero)`), kv('Posiciones', p.positions.join('|')))),
      h('div', {}, h('h3', {}, 'Tendencias'),
        h('div', { class: 'kv' }, kv('Iniciativa', p.initiative), kv('Vocación de finalización', p.finishingVocation), kv('Preferencia aro', p.zonePreference.rim), kv('Preferencia media distancia', p.zonePreference.midrange), kv('Preferencia triple', p.zonePreference.three), kv('Rol ofensivo', `${p.offensiveRole.code} ${p.offensiveRole.name}`), kv('Rol defensivo', `${p.defensiveRole.code} ${p.defensiveRole.name}`))),
      h('div', {}, h('h3', {}, 'Estados de entrada'),
        h('div', { class: 'kv' }, kv('Energía inicial', p.state.energy), kv('Forma', stateEdit(p, 'form', 'forma')), kv('M-TIR (tiro)', stateEdit(p, 'M_TIR', 'momento')), kv('M-OFE (control y ejecución ofensiva)', stateEdit(p, 'M_OFE', 'momento')), kv('M-DEF (defensa y disputa)', stateEdit(p, 'M_DEF', 'momento')), kv('Faltas', p.state.fouls), kv('Disponible', p.state.available ? 'Sí' : 'No')),
        h('p', { class: 'small muted' }, 'La Forma se recibe al empezar y no cambia durante el partido; los momentos son altibajos breves por ámbito. Se muestran como categorías; el número exacto se edita solo en el modo diagnóstico de laboratorio (no son instrucciones del entrenador ni capacidades: los botones +1/+3/+5 no los tocan).'))),
    groups);
}
const kv = (k, v) => [h('div', { class: 'muted' }, k), h('div', {}, v)];
// Categoría cualitativa de un estado de entrada; con el modo diagnóstico activo, además, el valor numérico editable (−1…1).
const catOf = (kind, v) => CATEGORY_LABELS[kind][momentCategory(prepProfile(), v)];
function stateEdit(p, key, kind) {
  const prof = prepProfile(); const [lo, hi] = key === 'form' ? prof.form.range : prof.moment.range;
  if (!ui.diag) return `${catOf(kind, p.state[key])}`;
  return h('span', {}, h('input', { type: 'number', min: lo, max: hi, step: 0.05, value: p.state[key], 'aria-label': `${key} inicial de ${p.id}`, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= lo && v <= hi) { p.state[key] = v; persist(); } else e.target.value = p.state[key]; } }), ` ${catOf(kind, p.state[key])}`);
}

// Estados de equipo y modo diagnóstico: T inicial (conexión del equipo) e importancia del encuentro.
function statesCard(team, root) {
  const prof = prepProfile(); const [lo, hi] = prof.teamMoment.range;
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Estados de entrada del equipo'),
    h('label', { class: 'row' }, h('input', { type: 'checkbox', id: 'diag-mode', checked: ui.diag, onchange: (e) => { ui.diag = e.target.checked; renderTeams(root); } }), ' Modo diagnóstico de laboratorio: editar los números de Forma, momentos y T (entrada controlada; no es una orden de entrenador)'),
    h('div', { class: 'row', style: 'margin-top:6px' }, h('span', {}, 'Conexión del equipo (T) inicial: '),
      ui.diag ? h('input', { type: 'number', min: lo, max: hi, step: 0.05, value: team.plan.initialTeamMoment, 'aria-label': 'T inicial', onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= lo && v <= hi) { team.plan.initialTeamMoment = v; persist(); } else e.target.value = team.plan.initialTeamMoment; } }) : null,
      h('span', { class: 'pill' }, CATEGORY_LABELS.equipo[momentCategory(prof, team.plan.initialTeamMoment)]), h('span', { class: 'small muted' }, 'Respuesta y coordinación del equipo, no un multiplicador de tiro. Una sustitución no la borra.')),
    h('p', { class: 'small muted' }, 'La importancia del encuentro (ordinario, importante, decisivo) se elige en «Partido». La edad y el peso de las fichas no tienen efecto deportivo directo.'));
}

// Escenarios de contraste: COPIAS identificadas de la entrada actual con cambios listados. No sobrescriben las fichas ni los planes editados.
function contrastCard(root) {
  const prof = prepProfile();
  const cards = CONTRAST_SCENARIOS.map((sc) => {
    const prev = ui.scen === sc.id ? buildContrastScenario(sc.id, store.edit, prof) : null;
    return h('div', { class: 'card', style: 'margin:6px 0' }, h('strong', {}, `${sc.id} · ${sc.name}`), h('p', { class: 'small' }, sc.summary),
      h('div', { class: 'row' },
        h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.scen = ui.scen === sc.id ? null : sc.id; renderTeams(root); } }, ui.scen === sc.id ? 'Ocultar cambios' : 'Ver los cambios de la copia'),
        h('button', { class: 'btn', type: 'button', id: `scen-${sc.id}`, onclick: () => { store.scenario = buildContrastScenario(sc.id, store.edit, prof); window.dispatchEvent(new CustomEvent('beM:goto', { detail: 'game' })); } }, 'Usar esta copia en «Partido»')),
      prev ? h('div', { class: 'scroll', style: 'max-height:220px' }, h('table', {}, h('thead', {}, h('tr', {}, ['Sujeto', 'Campo', 'Antes', 'Después'].map((x) => h('th', {}, x)))), h('tbody', {}, prev.changes.length ? prev.changes.map((c) => h('tr', {}, h('td', {}, c.jugador ?? c.equipo ?? 'encuentro'), h('td', {}, c.campo), h('td', { class: 'num' }, String(Number(Number(c.antes).toFixed(3)) || c.antes)), h('td', { class: 'num' }, String(Number(Number(c.despues).toFixed(3)) || c.despues)))) : [h('tr', {}, h('td', { colspan: 4 }, 'Sin cambios: la base neutral declarada.'))]))) : null);
  });
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Escenarios de contraste (copias identificadas)'),
    h('p', { class: 'small muted' }, 'Cada copia parte de tu entrada actual, lista exactamente lo que cambia y no modifica tus fichas ni tus planes. Sirven para observar mecanismos; el marcador de una copia con varios cambios no atribuye causas.'),
    store.scenario ? h('p', { class: 'pill warn' }, `Copia activa para el próximo partido: ${store.scenario.scenario.id} · ${store.scenario.scenario.name}`) : null, ...cards);
}
