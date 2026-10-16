// Pantalla «Preparación» (MOTOR-04): semilla, quinteto, director, disposición, roles por jugador, siete estilos agrupados,
// instrucción de media distancia y libro de quince fichas por familia con su ficha legible y su compatibilidad con el quinteto.
import { h, clear } from './dom.js';
import { store, PLAY_NAMES, persist, prepProfile, loadDemoPlan } from './store.js';
import { SLOTS, validateInput, createMatch, deepCopy } from '../match/index.js';
import { STYLE_DEFS, STYLE_GROUPS, STYLE_TITLES, MIDRANGE_OPTIONS, FAMILY_NAMES, FAMILY_ORDER, STATUS_TEXT, styleLevelLabels } from './styles.js';

export { STYLE_TITLES };
export const styleLabels = styleLevelLabels;

const FN_LABEL = (rep, fn) => rep.functions[fn]?.label ?? fn;
const ui = { open: new Set(), msg: '' };

// Compatibilidad del libro con el quinteto de cada equipo (sin sorteos). Si la entrada no es válida, no se calcula.
function compat(profile, edit) {
  try {
    const m = createMatch(deepCopy(edit), profile, { detail: 'minimal', track: false });
    return edit.teams.map((_, i) => m.bookCompatibility(i));
  } catch { return null; }
}

export function renderPrep(root) {
  clear(root);
  const { edit } = store; const profile = prepProfile();
  const legacy = !store.profile.repertoire;
  root.append(h('h2', {}, 'Preparación del encuentro'));
  if (legacy) root.append(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'El perfil activo es anterior a MOTOR-04. '), 'Puedes preparar la entrada (se valida con el perfil de MOTOR-04), pero no se podrá jugar hasta activar la base de MOTOR-04 o una candidata explícita (Panel de ajustes › Inicio).'));
  if (store.upgradeNotes?.length) root.append(h('p', { class: 'small muted' }, `Entrada guardada con una versión anterior: se añadieron explícitamente los campos nuevos de MOTOR-04 con su valor inicial (${store.upgradeNotes.join('; ')}).`));
  root.append(h('div', { class: 'card' },
    h('div', { class: 'row' },
      h('label', {}, 'Semilla entera ', h('input', { type: 'number', class: 'wide', step: 1, min: 0, max: 4294967295, value: edit.seed, onchange: (e) => { const v = Number(e.target.value); edit.seed = Number.isInteger(v) ? v : edit.seed; e.target.value = edit.seed; persist(); } })),
      h('span', { class: 'muted small' }, `Perfil ${profile.id} · `), h('span', { class: 'pill warn' }, profile.status),
      h('span', { class: 'muted small' }, 'Algoritmo xorshift32; la semilla 0 se sustituye de forma explícita.')),
    h('p', { class: 'small muted' }, 'Los coeficientes son semillas provisionales de desarrollo (SEM); no están calibrados ni son frecuencias reales. Los estilos, la disposición y los roles cambian opciones, participantes y encargos; ninguno suma acierto por su nombre.')));
  const errs = validateInput(edit, profile);
  root.append(errs.length ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, `La entrada no es válida (${errs.length}):`), h('ul', {}, errs.map((e) => h('li', {}, h('code', {}, e.path), ' — ', e.message)))) : h('p', {}, h('span', { class: 'pill ok' }, 'Entradas y referencias válidas')));
  if (ui.msg) root.append(h('p', { class: 'pill ok' }, ui.msg));
  const cmp = errs.length ? null : compat(profile, edit);
  root.append(h('div', { class: 'grid2' }, edit.teams.map((t, i) => teamPrep(t, i, profile, cmp?.[i] ?? null, root))));
}

function teamPrep(team, idx, profile, cm, root) {
  const plan = team.plan; const rep = profile.repertoire;
  const again = () => { persist(); renderPrep(root); };
  const optLabel = (p) => `${p.id} · ${p.positions.join('|')} · ${p.offensiveRole.name}`;
  const starterSel = (slot) => h('label', { class: 'row' }, h('strong', { style: 'width:34px' }, slot),
    h('select', { onchange: (e) => {
      const nid = e.target.value; const old = plan.starters[slot];
      const other = SLOTS.find((s) => s !== slot && plan.starters[s] === nid);
      if (other) plan.starters[other] = old; // intercambio: un jugador no ocupa dos posiciones
      plan.starters[slot] = nid; again();
    } }, team.players.map((p) => h('option', { value: p.id, selected: p.id === plan.starters[slot] }, optLabel(p)))));
  const dirList = h('ol', {}, plan.directorPriority.map((id, i) => h('li', {}, id, ' ',
    h('button', { class: 'link small', disabled: i === 0, onclick: () => { [plan.directorPriority[i - 1], plan.directorPriority[i]] = [plan.directorPriority[i], plan.directorPriority[i - 1]]; again(); } }, '↑'), ' ',
    h('button', { class: 'link small', disabled: i === plan.directorPriority.length - 1, onclick: () => { [plan.directorPriority[i + 1], plan.directorPriority[i]] = [plan.directorPriority[i], plan.directorPriority[i + 1]]; again(); } }, '↓'), ' ',
    plan.directorPriority.length > 1 ? h('button', { class: 'link small err', onclick: () => { plan.directorPriority.splice(i, 1); again(); } }, 'quitar') : null)));
  const avail = team.players.filter((p) => !plan.directorPriority.includes(p.id));
  const addDir = avail.length ? h('label', { class: 'small' }, 'Añadir alternativa: ', h('select', { onchange: (e) => { if (e.target.value) { plan.directorPriority.push(e.target.value); again(); } } }, h('option', { value: '' }, '—'), avail.map((p) => h('option', { value: p.id }, optLabel(p))))) : null;

  // ---- disposición (funciones, no coordenadas) y funciones efectivas del quinteto actual
  const dis = rep.dispositions[plan.disposition];
  const layoutText = cm ? Object.entries(cm.layout.map).map(([pid, fn]) => `${FN_LABEL(rep, fn)}: ${pid.split('-')[1]}`).join(' · ') : null;
  const disposition = h('div', {},
    h('h3', {}, 'Disposición de entrada'),
    h('label', { class: 'row' }, h('select', { id: `dis-${idx}`, onchange: (e) => { plan.disposition = e.target.value; again(); } },
      profile.activeCatalog.dispositions.map((d) => h('option', { value: d, selected: plan.disposition === d }, `${d} · ${rep.dispositions[d].name}`)))),
    h('p', { class: 'small' }, dis.description),
    h('p', { class: 'small muted' }, `Funciones: ${dis.functions.map((f) => FN_LABEL(rep, f)).join(' · ')}.`),
    layoutText ? h('p', { class: 'small' }, h('strong', {}, 'Ocupación con tu quinteto: '), layoutText, ` (director ${cm.director.split('-')[1]})`) : null,
    h('p', { class: 'small muted' }, 'Son entradas del selector general (no saques box/stack/diamond). La disposición no da ni quita talento: un no tirador fuera sigue siendo no tirador. Otras fichas pueden iniciar tras una reorganización compatible que consume tiempo real.'));

  // ---- roles ofensivos por jugador (orientan candidatos; no modifican capacidades)
  const roleDict = profile.fixtureContract.offensiveRoleDictionary;
  const starterSet = new Set(Object.values(plan.starters));
  const roles = h('div', {}, h('h3', {}, 'Roles ofensivos'),
    h('p', { class: 'small muted' }, 'Orientan quién ocupa cada función y el protagonismo (peso moderado, una sola vez al elegir participante). No cambian capacidades ni prohíben nada por la posición nominal.'),
    h('div', { style: 'display:grid; gap:4px' }, team.players.map((p) => h('label', { class: 'row' }, h('span', { style: 'width:150px' }, `${p.id}${starterSet.has(p.id) ? ' ★' : ''}`),
      h('select', { onchange: (e) => { p.offensiveRole = { code: e.target.value, name: roleDict[e.target.value] }; again(); } }, Object.entries(roleDict).map(([c, n]) => h('option', { value: c, selected: p.offensiveRole.code === c }, `${c} ${n}`)))))));

  // ---- estilos agrupados + media distancia
  const labels = styleLevelLabels(profile);
  const styleRow = (d) => h('label', { class: 'row', title: d.help }, h('span', { style: 'width:230px' }, d.title),
    h('select', { onchange: (e) => { plan.styles[d.key] = Number(e.target.value); persist(); } }, labels[d.key].map((t, i) => h('option', { value: i + 1, selected: plan.styles[d.key] === i + 1 }, t))));
  const styles = h('div', {}, h('h3', {}, 'Estilos ofensivos (cinco niveles; 3 = equilibrado)'),
    STYLE_GROUPS.map((g) => h('div', { style: 'margin-bottom:6px' }, h('div', { class: 'small muted' }, g), h('div', { style: 'display:grid; gap:6px' }, STYLE_DEFS.filter((d) => d.group === g).map(styleRow)))),
    h('div', {}, h('div', { class: 'small muted' }, 'Media distancia (instrucción de selección)'),
      h('label', { class: 'row' }, h('select', { onchange: (e) => { plan.midrange = e.target.value; again(); } }, MIDRANGE_OPTIONS.map(([k, t]) => h('option', { value: k, selected: plan.midrange === k }, t)))),
      h('p', { class: 'small muted' }, MIDRANGE_OPTIONS.find(([k]) => k === plan.midrange)?.[2] ?? '')),
    h('p', { class: 'small muted' }, 'Ritmo y elaboración son ejes distintos. No hay otro control de frecuencia de bloqueo, poste o mano a mano: esa preferencia pertenece al libro.'));

  // ---- libro por familia
  const active = new Map(plan.playbook.map((b) => [b.playId, b]));
  const compatOf = (id) => cm?.plays.find((p) => p.id === id);
  const playRow = (id) => {
    const spec = rep.plays[id]; const b = active.get(id); const c = compatOf(id);
    const [cls, txt] = c ? STATUS_TEXT[c.status] : ['', '—'];
    const open = ui.open.has(`${idx}:${id}`);
    const status = c ? h('span', { class: `pill ${cls}`, title: c.reason ?? '' }, c.status === 'reorganiza' ? `${txt} a ${c.reorganizaA}` : txt) : null;
    return h('div', { class: 'playrow' },
      h('div', { class: 'row' },
        h('label', { style: 'width:330px' }, h('input', { type: 'checkbox', checked: !!b, onchange: (e) => { if (e.target.checked) plan.playbook.push({ playId: id, priority: 3 }); else plan.playbook.splice(plan.playbook.findIndex((x) => x.playId === id), 1); again(); } }), ` ${id} — ${spec.name}`),
        b ? h('select', { 'aria-label': `Prioridad de ${id}`, onchange: (e) => { b.priority = Number(e.target.value); persist(); } }, [1, 2, 3, 4, 5].map((n) => h('option', { value: n, selected: b.priority === n }, `Prioridad ${n} (peso ${profile.selection.priorityWeights[n - 1]})`))) : h('span', { class: 'muted small' }, 'desactivada'),
        status,
        h('button', { class: 'link small', onclick: () => { const k = `${idx}:${id}`; ui.open.has(k) ? ui.open.delete(k) : ui.open.add(k); renderPrep(root); } }, open ? 'ocultar ficha' : 'ver ficha')),
      c && c.reason && c.status !== 'natural' && c.status !== 'realizable' ? h('div', { class: 'small muted' }, c.reason) : null,
      open ? playSheet(id, spec, profile, c) : null);
  };
  const book = h('div', {}, h('h3', {}, 'Libro: quince fichas por familia, prioridades 1–5 (pueden repetirse)'),
    h('p', { class: 'small muted' }, 'Una ficha desactivada no se borra: solo deja de estar en el plan. La prioridad es preferencia, no cuota ni calidad. La masa de una familia es la de su mejor variante elegible: duplicar variantes no la aumenta.'),
    FAMILY_ORDER.map((f) => h('div', { class: 'fam' }, h('strong', { class: 'small' }, FAMILY_NAMES[f]), Object.keys(rep.plays).filter((id) => rep.plays[id].family === f).map(playRow))),
    h('div', { class: 'row', style: 'margin-top:8px' },
      h('button', { class: 'btn secondary', onclick: () => { if (confirm('¿Cargar la copia de demostración de MOTOR-04 en este equipo? Sustituye su libro, disposición y media distancia por: DIS02, quince fichas a prioridad 3 y los estilos actuales. Es un escenario de cobertura, no una recomendación táctica.')) { loadDemoPlan(idx); ui.msg = `Plan de demostración MOTOR-04 cargado en ${team.id} (copia identificada; los planes guardados no se tocan salvo este).`; renderPrep(root); } } }, 'Cargar plan de demostración (15 fichas a prioridad 3)'),
      plan.demo ? h('span', { class: 'pill warn' }, 'plan de demostración de cobertura') : null));

  return h('div', { class: 'card' }, h('h3', {}, `${team.id} — ${team.name}`),
    h('p', { class: 'small muted' }, `Defensa ${plan.defense} individual, altura normal · cobertura ${plan.coverage} contener/drop (únicas disponibles hasta MOTOR-05).`),
    disposition,
    h('h3', {}, 'Quinteto inicial'), h('div', { style: 'display:grid; gap:4px' }, SLOTS.map(starterSel)),
    h('h3', {}, 'Director (prioridad entre jugadores activos y disponibles)'), dirList, addDir,
    roles, styles, book);
}

// Ficha legible de una jugada del libro: intención, funciones, entradas naturales, opciones, salidas y compatibilidad.
function playSheet(id, spec, profile, c) {
  const rep = profile.repertoire;
  const roleText = Object.entries(spec.roles).map(([r, d]) => {
    if (d.src === 'director') return `${r}: el director`;
    if (d.src === 'denied') return `${r}: el receptor negado`;
    return `${r}: ${d.fn === 'any' ? 'cualquiera' : d.fn.map((f) => FN_LABEL(rep, f)).join(' / ')}${d.opt ? ' (opcional)' : ''}`;
  });
  const exitText = (spec.exits ?? []).map((e) => `${e.role} → ${e.zones.join('/')}${e.label ? ` (${e.label})` : ''}${e.stage ? ' · el receptor decide después' : ''}`);
  return h('div', { class: 'sheet small' },
    h('p', {}, h('strong', {}, 'Intención: '), spec.intent),
    h('p', {}, h('strong', {}, 'Entradas naturales: '), spec.natural.map((d) => `${d} ${rep.dispositions[d].name}`).join(', '), '. Otras disposiciones pueden iniciarla tras reorganizar (consume tiempo real).'),
    h('p', {}, h('strong', {}, 'Funciones: '), roleText.join(' · '), spec.requires?.context === 'denial' ? ' · requiere una negación observada en la posesión' : '', spec.requires?.functions?.length ? ` · requiere ${spec.requires.functions.map((f) => f.any.map((x) => FN_LABEL(rep, x)).join('/')).join(', ')}` : ''),
    h('p', {}, h('strong', {}, 'Primera intención y salidas: '), exitText.join(' · ')),
    h('p', {}, h('strong', {}, 'Opciones: '), spec.options.join(' · '), ' · ', h('strong', {}, 'Seguridad: '), spec.safety.join(', ')),
    spec.recipeFrom ? h('p', { class: 'muted' }, `Recetas de calidad y pesos zonales: los de ${spec.recipeFrom} (referencia compartida, sin base propia de acierto).`) : null,
    c ? h('p', {}, h('strong', {}, 'Con tu quinteto: '), STATUS_TEXT[c.status][1], c.reorganizaA ? ` a ${c.reorganizaA}` : '', c.reason ? ` — ${c.reason}` : '') : null,
    h('p', { class: 'muted' }, 'Ninguna ficha concede un tiro garantizado: puede acabar en tiro, pérdida, falta, desvío, conservación o reloj agotado.'));
}
void PLAY_NAMES;
