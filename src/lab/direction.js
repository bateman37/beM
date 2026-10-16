// Panel de dirección del equipo dirigido: borrador separado del plan vigente, solicitudes y lista de órdenes con su ciclo de vida.
// Abrir un panel o mover un control NO modifica el partido: solo «Aplicar» registra órdenes (siempre como un conjunto atómico).
import { h } from './dom.js';
import { store, PLAY_NAMES } from './store.js';
import { SLOTS, deepCopy, ORDER_STATES, EDITABLE_STYLES } from '../match/index.js';
import { styleLevelLabels, STYLE_DEFS, STYLE_GROUPS, STYLE_TITLES, MIDRANGE_OPTIONS, MIDRANGE_LABEL, FAMILY_NAMES, FAMILY_ORDER } from './styles.js';

const optLabelShort = (id, m) => `${id}${m.ps[id].onCourt ? ' (en pista)' : ''}`;
const STATE_CLASS = { pendiente: 'warn', vigente: 'ok', consumida: 'ok', rechazada: 'bad', caducada: 'bad', sustituida: '', cancelada: '' };

// Plan efectivo + órdenes de plan pendientes (lo que quedará vigente). El borrador parte de aquí.
export function projectedPlan(m, team) {
  const plan = deepCopy(m.teams[team].plan);
  plan.roles = { ...m.roleOf };
  for (const o of m.orders) {
    if (o.team !== team || o.kind !== 'plan' || o.state !== 'pendiente') continue;
    if (o.type === 'styles') for (const [k, v] of Object.entries(o.content.styles)) { if (o.liveFields.includes(`styles.${k}`)) { if (k === 'midrange') plan.midrange = v; else plan.styles[k] = v; } }
    else if (o.type === 'priorities') for (const [k, v] of Object.entries(o.content.priorities)) {
      if (!o.liveFields.includes(`priorities.${k}`)) continue;
      const i = plan.playbook.findIndex((b) => b.playId === k);
      if (v === null) { if (i >= 0) plan.playbook.splice(i, 1); } else if (i >= 0) plan.playbook[i].priority = v; else plan.playbook.push({ playId: k, priority: v });
    }
    else if (o.type === 'director') plan.directorPriority = [...o.content.directorPriority];
    else if (o.type === 'disposition') plan.disposition = o.content.disposition;
    else if (o.type === 'roles') for (const [pid, code] of Object.entries(o.content.roles)) { if (o.liveFields.includes(`roles.${pid}`)) plan.roles[pid] = code; }
  }
  return plan;
}

// Prioridad por ficha del catálogo: número 1–5 si está activa, null si no.
const prioMap = (plan, catalog) => Object.fromEntries(catalog.map((id) => [id, plan.playbook.find((b) => b.playId === id)?.priority ?? null]));

export function newDraft(m, team) {
  const plan = projectedPlan(m, team);
  const cat = m.profile.activeCatalog.plays;
  return { team, styles: Object.fromEntries(EDITABLE_STYLES.map((k) => [k, plan.styles[k]])), midrange: plan.midrange, disposition: plan.disposition, roles: { ...plan.roles }, priorities: prioMap(plan, cat), director: [...plan.directorPriority], lineup: m.projectedLineup(team), dirty: { styles: {}, midrange: false, disposition: false, roles: {}, priorities: {}, director: false, lineup: false } };
}
// Lo que el usuario no ha tocado sigue al partido (p. ej. un relevo del entrenador básico); lo que sí tocó es su borrador.
export function syncDraft(m, team, d) {
  const f = newDraft(m, team);
  for (const k of EDITABLE_STYLES) if (!d.dirty.styles[k]) d.styles[k] = f.styles[k];
  if (!d.dirty.midrange) d.midrange = f.midrange;
  if (!d.dirty.disposition) d.disposition = f.disposition;
  for (const k of Object.keys(f.roles)) if (!d.dirty.roles[k]) d.roles[k] = f.roles[k];
  for (const k of Object.keys(f.priorities)) if (!d.dirty.priorities[k]) d.priorities[k] = f.priorities[k];
  if (!d.dirty.director) d.director = f.director;
  if (!d.dirty.lineup) d.lineup = f.lineup;
  return d;
}

// Diferencias entre el borrador y lo ya vigente/pendiente: solo lo que cambia viaja como orden.
export function draftSpecs(m, team, draft) {
  const base = projectedPlan(m, team); const lineup = m.projectedLineup(team); const specs = [];
  const sd = {}; for (const k of EDITABLE_STYLES) if (draft.styles[k] !== base.styles[k]) sd[k] = draft.styles[k];
  if (draft.midrange !== base.midrange) sd.midrange = draft.midrange;
  if (Object.keys(sd).length) specs.push({ type: 'styles', styles: sd });
  const pd = {}; const bp = prioMap(base, m.profile.activeCatalog.plays);
  for (const id of Object.keys(bp)) if (draft.priorities[id] !== bp[id]) pd[id] = draft.priorities[id];
  if (Object.keys(pd).length) specs.push({ type: 'priorities', priorities: pd });
  if (draft.disposition !== base.disposition) specs.push({ type: 'disposition', disposition: draft.disposition });
  const rd = {}; for (const [pid, code] of Object.entries(draft.roles)) if (code !== base.roles[pid]) rd[pid] = code;
  if (Object.keys(rd).length) specs.push({ type: 'roles', roles: rd });
  if (draft.director.join('|') !== base.directorPriority.join('|')) specs.push({ type: 'director', directorPriority: [...draft.director] });
  if (SLOTS.some((s) => draft.lineup[s] !== lineup[s])) specs.push({ type: 'lineup', assignment: { ...draft.lineup } });
  return specs;
}
export const hasChanges = (m, team, draft) => draftSpecs(m, team, draft).length > 0;

const periodWord = (p) => (p <= 4 ? `${p}.º cuarto` : `${p - 4}.ª prórroga`);
const levelText = (labels, k, v) => (labels[k] ?? [])[v - 1] ?? String(v);

export function orderText(o) {
  const c = o.content;
  const lv = (k, v) => `${STYLE_TITLES[k] ?? k} → ${v}`;
  switch (o.type) {
    case 'styles': return `Estilos: ${Object.entries(c.styles).map(([k, v]) => (k === 'midrange' ? `Media distancia → ${MIDRANGE_LABEL[v]}` : lv(k, v))).join(' · ')}`;
    case 'priorities': return `Libro: ${Object.entries(c.priorities).map(([k, v]) => `${k} = ${v === null ? 'desactivada' : v}`).join(' · ')}`;
    case 'disposition': return `Disposición → ${c.disposition}`;
    case 'roles': return `Roles ofensivos: ${Object.entries(c.roles).map(([k, v]) => `${k} → ${v}`).join(' · ')}`;
    case 'director': return `Director y alternativas: ${c.directorPriority.join(' › ')}`;
    case 'delegate': return 'Devolver la gestión del quinteto al entrenador básico';
    case 'call': return `Llamada de ${c.playId} — ${PLAY_NAMES[c.playId] ?? ''} (${c.target === 'current' ? 'posesión actual' : 'siguiente posesión propia'})`;
    case 'substitution': return `Cambio: ${(c.swaps ?? []).map((s) => `sale ${s.out}, entra ${s.in}`).join('; ')}`;
    case 'lineup': return `Quinteto: ${SLOTS.map((s) => `${s} ${(c.assignment ?? c.target)?.[s] ?? '—'}`).join(' · ')}`;
    case 'timeout': return `Tiempo muerto${c.reason ? ` (${c.reason})` : ''}`;
    default: return o.type;
  }
}
// Mensaje funcional de una orden: dice qué se pidió, si es válida, cuándo entra y por qué espera (sin tablas ni fórmulas).
export function orderMessage(o) {
  const r = o.reason ?? '';
  switch (o.state) {
    case 'pendiente': return o.type === 'timeout' || o.kind === 'lineup' ? `${o.type === 'timeout' ? 'Tiempo muerto' : 'Cambio'} ${r.startsWith('pendiente') ? r : `pendiente de oportunidad reglamentaria`}` : r.charAt(0).toUpperCase() + r.slice(1);
    case 'vigente': return o.kind === 'call' ? r.charAt(0).toUpperCase() + r.slice(1) : `Vigente${o.activation ? ` desde ${periodWord(o.activation.period)}` : ''}`;
    case 'consumida': return r.charAt(0).toUpperCase() + r.slice(1);
    case 'caducada': return o.kind === 'call' ? `Llamada caducada: ${r}` : `Caducada: ${r}`;
    case 'rechazada': return `Cambio no aplicado: ${r}`;
    case 'cancelada': return 'Cancelada antes de aplicarse';
    case 'sustituida': return r.charAt(0).toUpperCase() + r.slice(1);
    default: return r;
  }
}

export function ordersCard(session, rerender, { limit = 14 } = {}) {
  const m = session.match;
  const mine = m.orders.filter((o) => o.issuer === 'manual' && o.team === session.managedTeam).slice().reverse();
  const open = mine.filter((o) => o.state === 'pendiente' || o.state === 'vigente');
  const rows = (list) => list.map((o) => h('li', { class: 'ord' },
    h('div', { class: 'row' }, h('span', { class: `pill ${STATE_CLASS[o.state] ?? ''}` }, ORDER_STATES[o.state]), h('strong', {}, orderText(o)),
      o.state === 'pendiente' ? h('button', { class: 'link small', onclick: () => { session.cancel(o.id); rerender(); } }, 'retirar') : null),
    h('div', { class: 'small muted' }, `${o.id} · ${orderMessage(o)}${o.activation && o.state !== 'pendiente' ? ` · activada tras el paso ${o.activation.step}` : ''}`)));
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Órdenes del equipo dirigido'),
    h('p', { class: 'small muted' }, 'Una solicitud válida aún pendiente no está aplicada. Solicitud, espera, vigencia, consumo y cierre se registran por separado.'),
    mine.length ? h('ul', { class: 'orders' }, rows(mine.slice(0, limit))) : h('p', { class: 'neutral' }, 'Todavía no hay órdenes.'),
    mine.length > limit ? h('p', { class: 'small muted' }, `Mostrando las ${limit} últimas de ${mine.length}; el JSON descargable conserva todas.`) : null,
    open.length ? null : h('p', { class: 'small muted' }, 'Sin órdenes pendientes ni vigentes.'));
}

// ---------------------------------------------------------------- panel de dirección
export function directionPanel(session, ui, rerender) {
  const m = session.match; const team = session.managedTeam; const tm = m.input.teams[team];
  const enabled = session.canDirect() && session.state !== 'enMarcha';
  const msg = (text, cls = 'pill') => { ui.msg = text ? { text, cls } : null; rerender(); };
  if (!ui.draft || ui.draft.team !== team) ui.draft = newDraft(m, team);
  const d = syncDraft(m, team, ui.draft); const labels = styleLevelLabels(store.profile); const view = m.planView(team); const rep = m.profile.repertoire;
  const dis = !enabled;
  const optLabel = (id) => { const p = tm.players.find((x) => x.id === id); const s = m.ps[id]; return `${id} · ${p.positions.join('|')} · energía ${Math.round(s.energy)} · faltas ${s.fouls}${s.available ? '' : ' · excluido'}`; };

  const head = h('div', {}, h('h3', { style: 'margin-top:0' }, `Dirección de ${tm.id} — ${tm.name}`),
    h('p', { class: 'small muted' }, enabled ? 'Lo que edites aquí es un borrador hasta pulsar «Aplicar». Las órdenes entran en la siguiente frontera válida: no reescriben nada ya resuelto ni dan descanso por mirar la pantalla.' : session.state === 'enMarcha' ? 'El visionado está en marcha: pausa para consultar y decidir (la pausa de pantalla no da descanso deportivo).' : 'La dirección está disponible cuando el encuentro está preparado y en pausa, en revisión entre periodos o con un tiempo muerto concedido.'));
  const status = ui.msg ? h('p', { class: ui.msg.cls }, ui.msg.text) : null;

  // estilos (siete, agrupados) y media distancia
  const styles = h('div', {}, h('h3', {}, 'Estilos ofensivos (cinco niveles)'),
    STYLE_GROUPS.map((g) => h('div', { style: 'margin-bottom:6px' }, h('div', { class: 'small muted' }, g), h('div', { style: 'display:grid; gap:6px' }, STYLE_DEFS.filter((x) => x.group === g).map((x) => h('label', { class: 'row', title: x.help }, h('span', { style: 'width:230px' }, x.title),
      h('select', { disabled: dis, onchange: (e) => { d.styles[x.key] = Number(e.target.value); d.dirty.styles[x.key] = true; rerender(); } }, labels[x.key].map((t, i) => h('option', { value: i + 1, selected: d.styles[x.key] === i + 1 }, t)))))))),
    h('label', { class: 'row' }, h('span', { style: 'width:230px' }, 'Media distancia'),
      h('select', { disabled: dis, onchange: (e) => { d.midrange = e.target.value; d.dirty.midrange = true; rerender(); } }, MIDRANGE_OPTIONS.map(([k, t]) => h('option', { value: k, selected: d.midrange === k }, t)))),
    h('label', { class: 'row' }, h('span', { style: 'width:230px' }, 'Disposición'),
      h('select', { disabled: dis, onchange: (e) => { d.disposition = e.target.value; d.dirty.disposition = true; rerender(); } }, m.profile.activeCatalog.dispositions.map((x) => h('option', { value: x, selected: d.disposition === x }, `${x} · ${rep.dispositions[x].name}`)))),
    h('p', { class: 'small muted' }, 'La disposición y los roles entran en la próxima entrada de posesión o reorganización compatible; no recolocan a cinco jugadores en mitad de una ventaja ni cambian una ficha ya comprometida.'));
  // libro por familia: activar/desactivar y prioridad
  const book = h('div', {}, h('h3', {}, 'Libro: prioridades 1–5 (pueden repetirse)'),
    FAMILY_ORDER.map((f) => h('div', {}, h('strong', { class: 'small' }, FAMILY_NAMES[f]), h('div', { style: 'display:grid; gap:4px' }, Object.keys(d.priorities).filter((pid) => rep.plays[pid].family === f).map((pid) => h('label', { class: 'row' },
      h('input', { type: 'checkbox', disabled: dis, checked: d.priorities[pid] !== null, 'aria-label': `Activar ${pid}`, onchange: (e) => { d.priorities[pid] = e.target.checked ? 3 : null; d.dirty.priorities[pid] = true; rerender(); } }),
      h('span', { style: 'width:300px' }, `${pid} — ${PLAY_NAMES[pid]}`),
      d.priorities[pid] === null ? h('span', { class: 'muted small' }, 'desactivada') : h('select', { disabled: dis, onchange: (e) => { d.priorities[pid] = Number(e.target.value); d.dirty.priorities[pid] = true; rerender(); } }, [1, 2, 3, 4, 5].map((n) => h('option', { value: n, selected: d.priorities[pid] === n }, `Prioridad ${n} (peso ${store.profile.selection.priorityWeights[n - 1]})`)))))))));
  // roles ofensivos
  const roleDict = m.profile.fixtureContract.offensiveRoleDictionary;
  const roles = h('div', {}, h('h3', {}, 'Roles ofensivos'),
    h('div', { style: 'display:grid; gap:4px' }, tm.players.map((p) => h('label', { class: 'row' }, h('span', { style: 'width:150px' }, optLabelShort(p.id, m)),
      h('select', { disabled: dis, onchange: (e) => { d.roles[p.id] = e.target.value; d.dirty.roles[p.id] = true; rerender(); } }, Object.entries(roleDict).map(([c, n]) => h('option', { value: c, selected: d.roles[p.id] === c }, `${c} ${n}`)))))),
    h('p', { class: 'small muted' }, 'El rol orienta candidatos y protagonismo en la siguiente asignación; no cambia capacidades permanentes.'));
  // director
  const avail = tm.players.filter((p) => !d.director.includes(p.id) && m.ps[p.id].available);
  const move = (i, dlt) => { const j = i + dlt; [d.director[i], d.director[j]] = [d.director[j], d.director[i]]; d.dirty.director = true; rerender(); };
  const director = h('div', {}, h('h3', {}, 'Director y alternativas'),
    h('ol', {}, d.director.map((id, i) => h('li', {}, optLabel(id), i === 0 ? h('span', { class: 'pill' }, 'director') : i === 1 ? h('span', { class: 'pill' }, 'alternativa') : null, ' ',
      h('button', { class: 'link small', disabled: dis || i === 0, onclick: () => move(i, -1) }, '↑'), ' ', h('button', { class: 'link small', disabled: dis || i === d.director.length - 1, onclick: () => move(i, 1) }, '↓'), ' ',
      d.director.length > 1 ? h('button', { class: 'link small err', disabled: dis, onclick: () => { d.director.splice(i, 1); d.dirty.director = true; rerender(); } }, 'quitar') : null))),
    avail.length ? h('label', { class: 'small' }, 'Añadir alternativa: ', h('select', { disabled: dis, onchange: (e) => { if (e.target.value) { d.director.push(e.target.value); d.dirty.director = true; rerender(); } } }, h('option', { value: '' }, '—'), avail.map((p) => h('option', { value: p.id }, optLabel(p.id))))) : null,
    h('p', { class: 'small muted' }, 'Si el director no está en pista decide la alternativa; el hecho registra quién decidió realmente.'));
  // quinteto
  const proj = m.projectedLineup(team); const projSet = new Set(SLOTS.map((s) => proj[s]));
  const lineup = h('div', {}, h('h3', {}, 'Quinteto'),
    h('p', { class: 'small muted' }, `Control del quinteto: ${view.lineupControl.mode === 'manual' ? 'MANUAL (hasta devolverlo al entrenador, cambiarlo o terminar el periodo; las exclusiones reglamentarias prevalecen)' : 'automático (entrenador básico)'}. Un jugador en pista no cambia de posición: entra un jugador del banquillo en su lugar.`),
    h('div', { style: 'display:grid; gap:4px' }, SLOTS.map((slot) => h('label', { class: 'row' }, h('strong', { style: 'width:34px' }, slot),
      h('select', { disabled: dis, onchange: (e) => { d.lineup[slot] = e.target.value; d.dirty.lineup = true; rerender(); } },
        [proj[slot], ...tm.players.map((p) => p.id).filter((id) => !projSet.has(id))].map((id) => h('option', { value: id, selected: d.lineup[slot] === id }, `${optLabel(id)}${id === proj[slot] ? ' (en el quinteto previsto)' : ''}`)))))));

  const specs = hasChanges(m, team, d) ? draftSpecs(m, team, d) : [];
  const applyRow = h('div', { class: 'row', style: 'margin-top:10px' },
    session.mode === 'cuartos' && session.state === 'revision'
      ? h('span', { class: 'small muted' }, specs.length ? `${specs.length} cambio(s) en el borrador; se aplicarán juntos al pulsar «Aplicar plan y jugar siguiente periodo».` : 'Sin cambios en el borrador: el siguiente periodo seguirá con el plan vigente.')
      : [h('button', { class: 'btn', disabled: dis || !specs.length, onclick: () => {
        const os = session.submitBatch(specs, 'cambios del panel');
        const bad = os.filter((o) => o.state === 'rechazada');
        if (bad.length) { ui.msg = { text: `Cambio no aplicado: ${bad.map((o) => o.reason).join(' · ')}`, cls: 'errbox' }; rerender(); return; }
        ui.draft = newDraft(m, team); msg(`Solicitado: ${os.length} orden(es) pendiente(s) de su frontera. Revisa «Órdenes».`, 'pill ok');
      } }, `Aplicar cambios (${specs.length})`),
      h('button', { class: 'btn secondary', disabled: dis || !specs.length, onclick: () => { ui.draft = newDraft(m, team); ui.msg = null; rerender(); } }, 'Descartar borrador')]);

  // acciones inmediatas (cada una es su propia solicitud)
  const tmStat = view.timeouts;
  const outOpts = SLOTS.map((s) => m.lineup[team][s]);
  const benchOpts = tm.players.map((p) => p.id).filter((id) => !SLOTS.some((s) => m.lineup[team][s] === id) && m.ps[id].available);
  const quick = h('div', {},
    h('h3', {}, 'Tiempo muerto'),
    h('div', { class: 'row' },
      h('button', { class: 'btn secondary', disabled: dis || session.state === 'revision' || !tmStat || tmStat.effective <= 0 || tmStat.pending, onclick: () => {
        const o = session.submit({ type: 'timeout', reason: 'petición del entrenador' });
        msg(o.state === 'rechazada' ? `Tiempo muerto no solicitado: ${o.reason}` : 'Tiempo muerto solicitado: pendiente de oportunidad reglamentaria (no consume cupo hasta su concesión).', o.state === 'rechazada' ? 'errbox' : 'pill ok');
      } }, 'Pedir tiempo muerto'),
      tmStat?.pending ? h('button', { class: 'btn danger', disabled: dis, onclick: () => { session.cancel(tmStat.pending); msg('Solicitud de tiempo muerto retirada.'); } }, 'Retirar solicitud') : null,
      tmStat ? h('span', { class: 'small' }, `Quedan ${tmStat.remaining} en este bloque (cupo ${tmStat.quota}, usados ${tmStat.used})${tmStat.reason && tmStat.effective < tmStat.remaining ? ` · ${tmStat.reason}` : ''}${tmStat.pending ? ' · solicitud pendiente' : ''}` ) : null),
    h('h3', {}, 'Sustitución individual'),
    h('div', { class: 'row' }, h('label', {}, 'Sale ', h('select', { id: 'sub-out', disabled: dis }, outOpts.map((id) => h('option', { value: id }, optLabel(id))))),
      h('label', {}, 'Entra ', h('select', { id: 'sub-in', disabled: dis }, benchOpts.map((id) => h('option', { value: id }, optLabel(id))))),
      h('button', { class: 'btn secondary', disabled: dis || !benchOpts.length, onclick: () => {
        const o = session.submit({ type: 'substitution', swaps: [{ out: document.getElementById('sub-out').value, in: document.getElementById('sub-in').value }] });
        ui.draft = newDraft(m, team);
        msg(o.state === 'rechazada' ? `Cambio no aplicado: ${o.reason}` : 'Cambio solicitado: pendiente de oportunidad reglamentaria (no entra durante juego vivo).', o.state === 'rechazada' ? 'errbox' : 'pill ok');
      } }, 'Pedir cambio')),
    h('div', { class: 'row', style: 'margin-top:6px' }, h('button', { class: 'btn secondary', disabled: dis || view.lineupControl.mode !== 'manual', onclick: () => { const o = session.submit({ type: 'delegate', domain: 'lineup' }); msg(o.state === 'rechazada' ? o.reason : 'El quinteto volverá al entrenador básico en la siguiente decisión delegada (sin cambios retroactivos).', 'pill ok'); } }, 'Devolver el quinteto al entrenador')),
    callSection(session, ui, dis, msg));

  return h('div', { class: 'card' }, head, status, h('div', { class: 'grid2' }, h('div', {}, styles, book), h('div', {}, director, roles, lineup)), applyRow, h('hr', { style: 'border:0;border-top:1px solid var(--line);margin:14px 0' }), quick);
}

function callSection(session, ui, dis, msg) {
  const m = session.match; const team = session.managedTeam;
  const c = ui.call ??= { playId: 'POS01', target: 'next' };
  const poss = m.poss;
  const canCurrent = !!poss && !poss.done && poss.team === team && !poss.playStarted && m.clock > 0;
  if (c.target === 'current' && !canCurrent) c.target = 'next';
  const desc = c.target === 'current'
    ? 'Posesión actual: solo si aún no empezó ninguna ficha. Caduca al cerrar la posesión si no se inicia.'
    : 'Siguiente posesión ofensiva propia (la que empiece tras la actual). Caduca al cerrar esa posesión si no se inicia; no se arrastra a más ataques.';
  return h('div', {}, h('h3', {}, 'Llamar una ficha'),
    h('div', { class: 'row' },
      h('select', { disabled: dis, onchange: (e) => { c.playId = e.target.value; } }, store.profile.activeCatalog.plays.map((p) => h('option', { value: p, selected: c.playId === p }, `${p} — ${PLAY_NAMES[p]}${m.teams[team].plan.playbook.some((b) => b.playId === p) ? '' : ' (no activa en el libro)'}`))),
      h('label', {}, h('input', { type: 'radio', name: 'call-target', disabled: dis || !canCurrent, checked: c.target === 'current', onchange: () => { c.target = 'current'; msg(null); } }), ' Posesión actual'),
      h('label', {}, h('input', { type: 'radio', name: 'call-target', disabled: dis, checked: c.target === 'next', onchange: () => { c.target = 'next'; msg(null); } }), ' Siguiente posesión propia'),
      h('button', { class: 'btn secondary', disabled: dis, onclick: () => {
        const o = session.submit({ type: 'call', playId: c.playId, target: c.target });
        msg(o.state === 'rechazada' ? `Llamada no registrada: ${o.reason}` : `Llamada de ${c.playId} confirmada para ${c.target === 'current' ? 'la posesión actual' : 'la siguiente posesión propia'}: no garantiza que se inicie ni que se anote.`, o.state === 'rechazada' ? 'errbox' : 'pill ok');
      } }, 'Confirmar llamada')),
    h('p', { class: 'small muted' }, desc));
}
