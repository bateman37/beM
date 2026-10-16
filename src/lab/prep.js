// Pantalla «Preparación»: semilla, quinteto y director, tres estilos activos y prioridades 1-5 de las seis fichas.
import { h, clear } from './dom.js';
import { store, PLAY_NAMES, persist } from './store.js';
import { SLOTS, validateInput } from '../match/index.js';

const f2 = (v) => String(v).replace('.', ',');

function styleLabels(profile) {
  const s = profile.selection;
  return {
    organizedPace: s.organizedDurationFactor.map((f, i) => `${i + 1} — duración organizada ×${f2(f)}`),
    finishPreference: s.orientationThree.map((t, i) => `${i + 1} — triple ×${f2(t)} · interior ×${f2(s.orientationInside[i])}`),
    freedom: s.freedom.map((f, i) => `${i + 1} — libertad F=${f2(f)}`),
  };
}
const STYLE_TITLES = { organizedPace: 'Ritmo organizado', finishPreference: 'Prioridad de finalización (1 interior … 5 exterior)', freedom: 'Libertad' };
const LOCKED = { transition: 'Transición', elaboration: 'Elaboración', offensiveRisk: 'Riesgo ofensivo', afterShot: 'Tras tiro' };

export function renderPrep(root) {
  clear(root);
  const { edit, profile } = store;
  const labels = styleLabels(profile);
  root.append(h('h2', {}, 'Preparación del encuentro'),
    h('div', { class: 'card' },
      h('div', { class: 'row' },
        h('label', {}, 'Semilla entera ', h('input', { type: 'number', class: 'wide', step: 1, min: 0, max: 4294967295, value: edit.seed, onchange: (e) => { const v = Number(e.target.value); edit.seed = Number.isInteger(v) ? v : edit.seed; e.target.value = edit.seed; persist(); } })),
        h('span', { class: 'muted small' }, `Perfil ${profile.id} · `), h('span', { class: 'pill warn' }, profile.status),
        h('span', { class: 'muted small' }, 'Algoritmo xorshift32; la semilla 0 se sustituye de forma explícita.')),
      h('p', { class: 'small muted' }, 'Valores iniciales tomados del anexo A. Los coeficientes son semillas provisionales de desarrollo; no están calibrados ni son frecuencias reales.')));
  const errs = validateInput(edit, profile);
  root.append(errs.length ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, `La entrada no es válida (${errs.length}):`), h('ul', {}, errs.map((e) => h('li', {}, h('code', {}, e.path), ' — ', e.message)))) : h('p', {}, h('span', { class: 'pill ok' }, 'Entradas y referencias válidas')));
  root.append(h('div', { class: 'grid2' }, edit.teams.map((t) => teamPrep(t, labels, root))));
}

function teamPrep(team, labels, root) {
  const plan = team.plan;
  const optLabel = (p) => `${p.id} · ${p.positions.join('|')} · ${p.offensiveRole.name}`;
  const starterSel = (slot) => h('label', { class: 'row' }, h('strong', { style: 'width:34px' }, slot),
    h('select', { onchange: (e) => {
      const nid = e.target.value; const old = plan.starters[slot];
      const other = SLOTS.find((s) => s !== slot && plan.starters[s] === nid);
      if (other) plan.starters[other] = old; // intercambio: un jugador no ocupa dos posiciones
      plan.starters[slot] = nid; persist(); renderPrep(root);
    } }, team.players.map((p) => h('option', { value: p.id, selected: p.id === plan.starters[slot] }, optLabel(p)))));
  const dirList = h('ol', {}, plan.directorPriority.map((id, i) => h('li', {}, id, ' ',
    h('button', { class: 'link small', disabled: i === 0, onclick: () => { [plan.directorPriority[i - 1], plan.directorPriority[i]] = [plan.directorPriority[i], plan.directorPriority[i - 1]]; persist(); renderPrep(root); } }, '↑'), ' ',
    h('button', { class: 'link small', disabled: i === plan.directorPriority.length - 1, onclick: () => { [plan.directorPriority[i + 1], plan.directorPriority[i]] = [plan.directorPriority[i], plan.directorPriority[i + 1]]; persist(); renderPrep(root); } }, '↓'), ' ',
    plan.directorPriority.length > 1 ? h('button', { class: 'link small err', onclick: () => { plan.directorPriority.splice(i, 1); persist(); renderPrep(root); } }, 'quitar') : null)));
  const avail = team.players.filter((p) => !plan.directorPriority.includes(p.id));
  const addDir = avail.length ? h('label', { class: 'small' }, 'Añadir alternativa: ', h('select', { onchange: (e) => { if (e.target.value) { plan.directorPriority.push(e.target.value); persist(); renderPrep(root); } } }, h('option', { value: '' }, '—'), avail.map((p) => h('option', { value: p.id }, optLabel(p))))) : null;
  const style = (k) => h('label', { class: 'row' }, h('span', { style: 'width:230px' }, STYLE_TITLES[k]), h('select', { onchange: (e) => { plan.styles[k] = Number(e.target.value); persist(); } }, labels[k].map((t, i) => h('option', { value: i + 1, selected: plan.styles[k] === i + 1 }, t))));
  const book = plan.playbook.map((b) => h('label', { class: 'row' }, h('span', { style: 'width:330px' }, `${b.playId} — ${PLAY_NAMES[b.playId]}`), h('select', { onchange: (e) => { b.priority = Number(e.target.value); persist(); } }, [1, 2, 3, 4, 5].map((n) => h('option', { value: n, selected: b.priority === n }, `Prioridad ${n} (peso ${store.profile.selection.priorityWeights[n - 1]})`)))));
  return h('div', { class: 'card' }, h('h3', {}, `${team.id} — ${team.name}`),
    h('p', { class: 'small muted' }, `Disposición ${plan.disposition} (cuatro abiertos y un interior) · defensa ${plan.defense} individual, altura normal · cobertura ${plan.coverage} contener/drop.`),
    h('h3', {}, 'Quinteto inicial'), h('div', { style: 'display:grid; gap:4px' }, SLOTS.map(starterSel)),
    h('h3', {}, 'Director (prioridad entre jugadores activos y disponibles)'), dirList, addDir,
    h('h3', {}, 'Estilos activos'), h('div', { style: 'display:grid; gap:6px' }, Object.keys(STYLE_TITLES).map(style)),
    h('p', { class: 'small muted', style: 'margin-top:8px' }, 'Sin efecto en esta entrega (valor declarado, cobertura pendiente): ', Object.entries(LOCKED).map(([k, t]) => `${t} = ${plan.styles[k]}`).join(' · ')),
    h('h3', {}, 'Libro: prioridades 1–5 (pueden repetirse)'), h('div', { style: 'display:grid; gap:6px' }, book));
}
