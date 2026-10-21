// Conocimiento táctico en el laboratorio (MOTOR-18 §11.1, §11.3, §10.2): copia de aprendizaje explícita, apartado «Conocimiento» de la ficha, Polivalencia en «Desarrollo», edición masiva +1/+3/+5 con vista previa y
// deshacer exacto, resumen del quinteto en Preparación y consulta de familiaridad en el partido. Las fichas de referencia (EQ01–EQ12) y los planes naturales/históricos NO se tocan: todo vive en una COPIA identificada.
import { h, table, storage, fmt } from './dom.js';
import { store } from './store.js';
import { paramsOf, makeLearningCopy, teamStatesOf, planKnowledgeEdit, applyKnowledgeEdit, undoKnowledgeEdit, quintetSummary, chosenModules, serializeLearning, deserializeLearning, newLedgers, NEUTRAL_NOTE, categoryOf, levelOf, idsOf, keyOf } from './learning-model.js';
import { isLegacyNeutral, BLOCK_FIELD, DOMAINS } from '../knowledge/model.js';

const KEY = 'beM.m18.learning.v1';
const DOMAIN_LABEL = { position: 'Posición', offensiveRole: 'Rol ofensivo', defensiveRole: 'Rol defensivo', tactic: 'Módulo táctico' };
const k = { sel: new Set(), domain: 'tactic', ids: new Set(), delta: 3, mode: 'level', preview: null, filter: 'all', msg: '' };
export const kui = k;

export const learnParams = () => paramsOf(store.profile, store.baseNew);
export const profileHasFamiliarity = () => !!store.profile?.familiarity;

// ---------------------------------------------------------------- estado y persistencia (registro de aplicaciones fuera del núcleo deportivo)
export function persistLearning() {
  const ls = storage(); if (!ls) return;
  try { if (store.learn) ls.setItem(KEY, serializeLearning(store.learn)); else ls.removeItem(KEY); } catch { /* sin almacenamiento */ }
}
export function activateCopy(copy, { day = copy.day } = {}) {
  const P = learnParams(); const { states, errors } = teamStatesOf(copy.input, P, day);
  if (errors.length) throw new Error(`la copia no es coherente: ${errors.slice(0, 3).map((e) => `${e.team} ${e.path}: ${e.message}`).join('; ')}`);
  store.learn = { copy, day, states, ledgers: newLedgers(copy.input), undo: [], editUndo: [] };
  syncScenario(); persistLearning();
}
// La copia activa es la entrada del próximo partido (mismo mecanismo que las copias de contraste): no sustituye `store.edit`.
export function syncScenario() {
  const L = store.learn; if (!L) return;
  store.scenario = { scenario: { id: L.copy.id, name: 'Copia de aprendizaje MOTOR-18', question: 'Conocimiento táctico explícito sobre una copia identificada de la entrada.', diagnostic: false, multicause: false, learning: true }, input: L.copy.input, changes: L.copy.changes, plannedOrders: [] };
}
export function restoreLearning() {
  const ls = storage(); if (!ls || store.learn) return;
  try { const raw = ls.getItem(KEY); if (!raw) return; store.learn = deserializeLearning(raw); store.learn.editUndo = []; syncScenario(); } catch { /* copia ilegible: se ignora, no se borra nada */ }
}
export const copyPlayer = (pid) => store.learn?.copy.input.teams.flatMap((t) => t.players).find((p) => p.id === pid) ?? null;
export const copyTeam = (tid) => store.learn?.copy.input.teams.find((t) => t.id === tid) ?? null;

// ---------------------------------------------------------------- tarjeta de copia de aprendizaje (Plantillas)
export function learningCopyCard(ctx) {
  const { ui, rerender } = ctx; const P = learnParams(); const L = store.learn;
  const make = (mode) => {
    if (!P) { k.msg = 'El perfil no incluye la familiaridad táctica.'; return rerender(); }
    if (L && !confirm('Ya hay una copia de aprendizaje activa. ¿Sustituirla por una nueva (la anterior y su registro de aplicaciones se descartan)?')) return;
    try { const src = store.scenario?.learning ? store.edit : (store.scenario?.input ?? store.edit); const copy = makeLearningCopy(src, store.baseNew.familiarity ? store.baseNew : store.profile, { mode, day: 0 }); activateCopy(copy); k.msg = `Copia activa para el próximo partido: ${copy.id} (${copy.changes.length} diferencias listadas). Tus fichas y planes no se han modificado.`; }
    catch (e) { k.msg = `No se pudo crear la copia: ${e.message}`; }
    rerender();
  };
  return h('div', { class: 'card', id: 'learning-copy' }, h('h3', { style: 'margin-top:0' }, 'Conocimiento táctico: copia de aprendizaje MOTOR-18'),
    h('p', { class: 'small muted' }, 'Las fichas de referencia (EQ01–EQ12), los planes naturales/históricos y tus fichas guardadas no tienen historial de aprendizaje: son «', NEUTRAL_NOTE, '» y su efecto deportivo es cero. El conocimiento solo existe en una copia explícita e identificada.'),
    P ? null : h('p', { class: 'pill bad' }, 'El perfil no incluye `familiarity`.'),
    P && !profileHasFamiliarity() ? h('p', { class: 'pill warn' }, 'El perfil ACTIVO no incluye la familiaridad de MOTOR-18 (versión anterior): la copia se puede preparar, pero el partido la rechazará hasta activar la base de MOTOR-18 en el Panel de ajustes (no se activa en silencio).') : null,
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', id: 'learn-make', onclick: () => make('synthetic') }, 'Crear copia de aprendizaje MOTOR-18'),
      h('button', { class: 'btn secondary', type: 'button', id: 'learn-make-mastered', onclick: () => make('mastered') }, 'Copia «todo dominado» (62 niveles a 30)'),
      L && !store.scenario?.learning ? h('button', { class: 'btn secondary', type: 'button', id: 'learn-use', onclick: () => { syncScenario(); k.msg = 'La copia vuelve a ser la entrada del próximo partido.'; rerender(); } }, 'Usar la copia en el próximo partido') : null,
      L ? h('button', { class: 'btn secondary', type: 'button', id: 'learn-drop', onclick: () => { store.learn = null; if (store.scenario?.learning) store.scenario = null; persistLearning(); k.msg = 'Copia descartada.'; rerender(); } }, 'Descartar la copia') : null),
    h('p', { class: 'small muted' }, 'La copia sintética es una fábrica de historia (posición habitual 30, relacionadas 18, otras 8; rol habitual 26…; plan cargado 24; módulos 12; Polivalencia y enseñanza 16): no es una inferencia ni una regla de aprendizaje, y cambiar después el libro no modifica ningún nivel. «Todo dominado» es una copia de laboratorio, no una historia observada.'),
    L ? h('p', { class: 'small' }, h('strong', {}, `Copia activa: ${L.copy.id}`), ` · ${L.copy.mode === 'mastered' ? 'todo dominado' : 'historia sintética SEM18'} · día de aprendizaje ${Object.values(L.states).map((s) => `${s.instanceId}: ${s.day}`).join(' · ')}`) : h('p', { class: 'small muted' }, 'No hay copia de aprendizaje activa.'),
    L ? h('details', {}, h('summary', {}, `Diferencias listadas (${L.copy.changes.length}) y recibo de la fábrica`), table(['Sujeto', 'Campo', 'Antes', 'Después'], L.copy.changes.slice(0, 40).map((c) => [c.jugador ?? c.equipo, c.campo, String(c.antes), String(c.despues)])),
      h('p', { class: 'small muted' }, `Recibo: ${Object.keys(L.copy.receipts).length} jugadores; en cada conflicto de semillas se tomó el MÁXIMO y la regla queda en el recibo (ver «Conocimiento» de la ficha, modo diagnóstico).`)) : null,
    k.msg ? h('p', { class: 'pill ok', id: 'learn-msg' }, k.msg) : null);
}

// ---------------------------------------------------------------- ficha: «Conocimiento» y Polivalencia
function levelCell(p, key, diag, rerender) {
  const e = p.knowledge[BLOCK_FIELD[key.domain]][key.id]; const P = learnParams(); const cat = categoryOf(e.level, P).label;
  const set = (v, mode) => { const ch = planKnowledgeEdit(store.learn.copy.input, P, [p.id], [key], { set: v, mode }); const rec = applyKnowledgeEdit(store.learn.copy.input, ch, `${p.id} ${keyOf(key.domain, key.id)} → ${v} (${mode === 'synthetic' ? 'historia sintética' : 'solo nivel'})`); store.learn.editUndo.push(rec); syncAfterEdit(); rerender(); };
  return [h('td', { class: 'num' }, fmt(e.level, 1)), h('td', {}, cat),
    ...(diag ? [h('td', { class: 'num' }, fmt(e.peak, 1)), h('td', { class: 'num' }, String(e.lastPracticeDay)),
      h('td', {}, h('input', { type: 'number', min: 1, max: 30, step: 0.5, value: e.level, 'aria-label': `Nivel de ${key.id}`, onchange: (ev) => { const v = Number(ev.target.value); if (Number.isFinite(v)) set(v, 'level'); } }),
        h('button', { class: 'link small', type: 'button', title: 'nivel = peak y última práctica = día evaluado', onclick: () => set(e.level, 'synthetic') }, 'sintética'))] : [])];
}
export function syncAfterEdit() { const L = store.learn; if (!L) return; const { states } = teamStatesOf(L.copy.input, learnParams(), Object.fromEntries(Object.entries(L.states).map(([t, st]) => [t, st.day]))); for (const [tid, s] of Object.entries(states)) if (L.states[tid]) L.states[tid] = { ...L.states[tid], players: Object.fromEntries(Object.entries(L.states[tid].players).map(([pid, ps]) => [pid, { ...ps, block: s.players[pid].block, tacticalLearning: s.players[pid].tacticalLearning }])), coach: s.coach }; persistLearning(); }

export function knowledgeSection(p, team, { diag = false, rerender }) {
  const P = learnParams(); const cp = copyPlayer(p.id);
  const poly = (obj, editable) => h('div', { class: 'row', id: 'poly-row' }, h('strong', {}, 'Polivalencia · aprendizaje táctico'),
    obj ? (editable ? h('input', { type: 'number', min: 1, max: 30, step: 1, value: obj.development?.tacticalLearning ?? '', 'aria-label': 'Polivalencia', onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 1 && v <= 30) { obj.development = { ...(obj.development ?? {}), tacticalLearning: v }; syncAfterEdit(); rerender(); } } }) : h('span', {}, String(obj.development?.tacticalLearning ?? '—'))) : h('span', { class: 'muted' }, '—'),
    h('span', { class: 'small muted' }, 'Rasgo de desarrollo (1–30, semilla 16): facilidad para aprender posiciones, roles y sistemas. No es una de las 32 capacidades, no entra en ninguna media y no cambia el partido: solo la cantidad que se aprende entre encuentros.'));
  const dev = h('div', { class: 'card', id: 'dev-poly' }, h('h4', { style: 'margin-top:0' }, 'Desarrollo'), poly(cp, !!cp && diag), cp && !diag ? h('p', { class: 'small muted' }, 'Se edita en modo diagnóstico de laboratorio.') : null);
  if (!cp || isLegacyNeutral(cp.knowledge)) return [dev, h('details', { id: 'knowledge-sec' }, h('summary', {}, 'Conocimiento'), h('p', { class: 'small' }, `${NEUTRAL_NOTE}. `, 'Crea una copia de aprendizaje MOTOR-18 (en esta pantalla) para ver y editar el conocimiento; las fichas de referencia no lo tienen.'))];
  const mods = chosenModules(copyTeam(team.id) ?? team, store.baseNew); const chosen = new Set(mods.map((m) => m.id));
  const rows = []; const passes = (d, id) => k.filter === 'all' || (k.filter === 'plan' && d === 'tactic' && chosen.has(id)) || k.filter === d;
  for (const d of DOMAINS) for (const id of idsOf(d, P)) if (passes(d, id)) rows.push(h('tr', {}, h('td', {}, DOMAIN_LABEL[d]), h('td', {}, id), ...levelCell(cp, { domain: d, id }, diag, rerender)));
  const filt = [['all', 'Todo'], ['plan', 'Módulos elegidos por el plan'], ...DOMAINS.map((d) => [d, DOMAIN_LABEL[d]])];
  return [dev, h('details', { id: 'knowledge-sec', open: true }, h('summary', {}, `Conocimiento (${cp.knowledge.mode}, día ${cp.knowledge.asOfDay})`),
    h('label', { class: 'small' }, 'Mostrar ', h('select', { 'aria-label': 'filtro de conocimiento', onchange: (e) => { k.filter = e.target.value; rerender(); } }, filt.map(([v, t]) => h('option', { value: v, selected: k.filter === v }, t)))),
    h('p', { class: 'small muted' }, 'Nivel 1–30 de familiaridad adquirida (conocimiento, no talento). Categorías: inicial ≤ 6 · básico ≤ 12 · competente ≤ 18 · avanzado ≤ 24 · dominado > 24; son solo etiquetas, la fórmula deportiva es continua.', diag ? ' Modo diagnóstico: máximo histórico (peak), última práctica y edición («solo nivel» o «sintética» = nivel = peak).' : ''),
    h('div', { class: 'scroll', style: 'max-height:340px' }, h('table', {}, h('thead', {}, h('tr', {}, ['Dominio', 'Id', 'Nivel', 'Categoría', ...(diag ? ['Peak', 'Última práctica', 'Editar'] : [])].map((t) => h('th', {}, t)))), h('tbody', {}, rows))))];
}

// ---------------------------------------------------------------- edición masiva del conocimiento (distinta del control de atributos deportivos)
export function knowledgeBulkCard(ctx) {
  const { ui, rerender } = ctx; const L = store.learn; const P = learnParams();
  if (!L) return h('div', { class: 'card', id: 'k-bulk' }, h('h3', { style: 'margin-top:0' }, 'Mejora de conocimiento al conjunto seleccionado'), h('p', { class: 'small muted' }, 'Necesita una copia de aprendizaje activa. No modifica los atributos deportivos ni las fichas de referencia.'));
  const teams = L.copy.input.teams; const players = teams.flatMap((t) => t.players);
  const sel = new Set([...ui.selPlayers].filter((id) => players.some((p) => p.id === id)));
  const keysSel = [...k.ids].map((id) => ({ domain: k.domain, id }));
  const last = L.editUndo[L.editUndo.length - 1];
  const preview = () => { k.preview = planKnowledgeEdit(L.copy.input, P, [...sel], keysSel, { delta: k.delta, mode: k.mode }); rerender(); };
  const card = h('div', { class: 'card', id: 'k-bulk' }, h('h3', { style: 'margin-top:0' }, 'Mejora de conocimiento al conjunto seleccionado: +1, +3 o +5'),
    h('p', { class: 'small muted' }, 'Aplica a jugadores × conocimientos seleccionados de la COPIA (nivel = mínimo(30, anterior + incremento)); no toca las 32 capacidades. «Solo nivel» eleva el nivel (y el peak si lo supera); «historia sintética» fija nivel = peak y última práctica = día evaluado. Nunca deja peak < nivel.'),
    h('div', { class: 'row' }, h('span', {}, `Jugadores seleccionados (los de la tabla de arriba): ${sel.size}`), h('span', {}, `Conocimientos: ${k.ids.size}`)),
    h('div', { class: 'row' }, h('label', { class: 'small' }, 'Dominio ', h('select', { 'aria-label': 'dominio', onchange: (e) => { k.domain = e.target.value; k.ids.clear(); k.preview = null; rerender(); } }, DOMAINS.map((d) => h('option', { value: d, selected: k.domain === d }, DOMAIN_LABEL[d])))),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { idsOf(k.domain, P).forEach((id) => k.ids.add(id)); k.preview = null; rerender(); } }, 'Todos los de este dominio'),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { k.ids.clear(); k.preview = null; rerender(); } }, 'Vaciar')),
    h('div', { class: 'chips' }, idsOf(k.domain, P).map((id) => h('label', { class: `chip ${k.ids.has(id) ? 'on' : ''}` }, h('input', { type: 'checkbox', checked: k.ids.has(id), onchange: (e) => { e.target.checked ? k.ids.add(id) : k.ids.delete(id); k.preview = null; rerender(); } }), id))),
    h('div', { class: 'row', style: 'margin-top:8px' }, h('span', {}, 'Incremento:'), h('span', { class: 'seg' }, [1, 3, 5].map((d) => h('button', { type: 'button', 'aria-pressed': k.delta === d, onclick: () => { k.delta = d; k.preview = null; rerender(); } }, `+${d}`))),
      h('label', { class: 'small' }, h('input', { type: 'radio', name: 'kmode', checked: k.mode === 'level', onchange: () => { k.mode = 'level'; k.preview = null; rerender(); } }), ' solo nivel'),
      h('label', { class: 'small' }, h('input', { type: 'radio', name: 'kmode', checked: k.mode === 'synthetic', onchange: () => { k.mode = 'synthetic'; k.preview = null; rerender(); } }), ' historia sintética'),
      h('button', { class: 'btn secondary', type: 'button', id: 'k-preview', onclick: preview }, 'Ver qué se va a modificar'),
      h('button', { class: 'btn secondary', type: 'button', id: 'k-undo', disabled: !last, onclick: () => { const n = undoKnowledgeEdit(L.copy.input, L.editUndo.pop()); syncAfterEdit(); k.preview = null; k.msg = `Deshecho: ${n} valores restaurados exactamente.`; rerender(); } }, 'Deshacer la última edición')));
  if (k.preview) {
    const ch = k.preview; const changed = ch.filter((c) => c.changed).length;
    card.append(h('p', {}, ch.length ? `Se revisarán ${ch.length} entradas: ${changed} cambian, ${ch.length - changed} ya están en el máximo.` : 'Selección vacía: no se modificará nada.'),
      ch.length ? h('details', {}, h('summary', {}, 'Detalle'), table(['Jugador', 'Conocimiento', 'Antes (nivel/peak)', 'Después (nivel/peak)'], ch.slice(0, 200).map((c) => [c.player, c.key, `${fmt(c.before.level, 2)} / ${fmt(c.before.peak, 2)}`, `${fmt(c.after.level, 2)} / ${fmt(c.after.peak, 2)}`]))) : null,
      h('button', { class: 'btn', type: 'button', id: 'k-apply', disabled: !changed, onclick: () => { const rec = applyKnowledgeEdit(L.copy.input, ch, `+${k.delta} (${k.mode}) a ${sel.size} jugadores`); L.editUndo.push(rec); syncAfterEdit(); k.preview = null; k.msg = `Aplicado: ${changed} valores (se puede deshacer).`; rerender(); } }, 'Aplicar'));
  }
  return card;
}

// ---------------------------------------------------------------- Preparación: dominio del quinteto de la copia para lo elegido en el plan
const cls = (v) => (v == null ? 'pill' : v <= 12 ? 'pill bad' : v <= 18 ? 'pill warn' : 'pill ok');
export function quintetCard(team, profile, { title = 'Familiaridad del quinteto', id = 'fam-quintet' } = {}) {
  const P = learnParams(); if (!P) return null;
  const sum = quintetSummary(team, P, profile);
  if (sum.neutralPlayers === sum.rows.length) return h('div', { class: 'small muted', id }, `${title}: ${NEUTRAL_NOTE} (no hay copia de aprendizaje para este equipo; efecto cero).`);
  return h('div', { id }, h('h4', {}, title), h('p', { class: 'small muted' }, 'Resumen de solo lectura con los conocimientos de los titulares actuales; se recalcula al cambiar quinteto o plan sin entrenar ni alterar fichas. No es un porcentaje de acierto.'),
    h('div', { class: 'chips' }, sum.modules.map((m) => h('span', { class: m.mean == null ? 'pill' : cls(m.mean), title: `${m.n} titulares con dato` }, `${m.label}: ${m.mean == null ? '—' : `${fmt(m.mean, 1)} · ${m.category}`}`))),
    table(['Puesto', 'Jugador', 'Posición asignada', 'Rol ofensivo', 'Rol defensivo'], sum.rows.map((r) => [r.slot, r.pid, r.neutral ? NEUTRAL_NOTE : fmt(r.position, 1), r.neutral ? '' : fmt(r.offensiveRole, 1), r.neutral ? '' : fmt(r.defensiveRole, 1)]), { numeric: [2, 3, 4] }),
    sum.lowest.length ? h('p', { class: 'small' }, h('strong', {}, 'Menor familiaridad media: '), sum.lowest.map((x) => `${x.pid} (${x.slot}, media ${fmt(x.mean, 1)}, mínimo ${fmt(x.min, 1)})`).join(' · ')) : null,
    sum.modules.some((m) => m.mean != null && m.mean <= 12) ? h('p', { class: 'pill warn', id: 'fam-warning' }, 'Hay tácticas poco conocidas por el quinteto: pueden ordenarse igualmente, pero se ejecutarán con menos coordinación (no hay ventana de confirmación).') : null);
}
export function prepFamiliarity(team, idx, profile) {
  const ct = copyTeam(team.id); if (!ct) return null;
  // el plan mostrado es el de Preparación (store.edit); el conocimiento es el de la copia
  const view = { plan: team.plan, players: ct.players };
  return h('div', {}, quintetCard(view, profile, { title: 'Familiaridad del quinteto actual (copia de aprendizaje)', id: `fam-quintet-${idx}` }),
    h('p', { class: 'small muted' }, 'Al asignar otra posición o rol se muestra su familiaridad en la tabla; nunca se bloquea por la posición nominal ni se promete un porcentaje. Las capacidades pertinentes son las de la ficha y no cambian con el conocimiento.'));
}
// Etiqueta junto a un selector de posición/rol: familiaridad del jugador con ese puesto o rol (solo lectura).
export function familiarityHint(pid, domain, id) {
  const cp = copyPlayer(pid); if (!cp || isLegacyNeutral(cp.knowledge)) return h('span', { class: 'small muted' }, NEUTRAL_NOTE);
  const v = levelOf(cp.knowledge, domain, id); return h('span', { class: cls(v) }, v == null ? '—' : `${fmt(v, 1)} · ${categoryOf(v, learnParams()).label}`);
}

// ---------------------------------------------------------------- partido: familiaridad propia con lo que se va a pedir
export function matchFamiliarityCard(match, teamIdx) {
  const P = match.profileData.familiarity ?? null; if (!P) return null;
  const v = match.planView(teamIdx); const dv = match.defenseView(teamIdx); const players = match.input.teams[teamIdx].players;
  if (players.every((p) => isLegacyNeutral(p.knowledge))) return h('p', { class: 'small muted', id: 'fam-live' }, `Familiaridad: ${NEUTRAL_NOTE}.`);
  const team = { plan: { starters: v.lineup, disposition: v.disposition, playbook: v.playbook, defense: dv.plan.defense, coverage: dv.plan.coverage }, players };
  return h('div', { class: 'card', id: 'fam-live' }, quintetCard(team, match.profileData, { title: `Familiaridad de ${match.teams[teamIdx].id} con lo que se pide (quinteto en pista)`, id: 'fam-live-q' }),
    h('p', { class: 'small muted' }, 'Consulta de solo lectura: los cambios de plan actúan desde su frontera reglamentaria y no cambian el nivel aprendido. El rival no revela su conocimiento.'));
}
