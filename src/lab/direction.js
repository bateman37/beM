// Panel de dirección del equipo dirigido: borrador separado del plan vigente, solicitudes y lista de órdenes con su ciclo de vida.
// Abrir un panel o mover un control NO modifica el partido: solo «Aplicar» registra órdenes (siempre como un conjunto atómico).
import { h } from './dom.js';
import { store, PLAY_NAMES } from './store.js';
import { SLOTS, deepCopy, ORDER_STATES, EDITABLE_STYLES } from '../match/index.js';
import { defenseControls, DEF_STYLE_TITLES } from './defense-ui.js';
import { throwInControls } from './throwin-ui.js';
import { styleLevelLabels, STYLE_DEFS, STYLE_GROUPS, STYLE_TITLES, MIDRANGE_OPTIONS, MIDRANGE_LABEL, FAMILY_NAMES, FAMILY_ORDER } from './styles.js';

const optLabelShort = (id, m) => `${id}${m.ps[id].onCourt ? ' (en pista)' : ''}`;
const STATE_CLASS = { pendiente: 'warn', vigente: 'ok', consumida: 'ok', rechazada: 'bad', caducada: 'bad', sustituida: '', cancelada: '' };

// Plan efectivo + órdenes de plan pendientes (lo que quedará vigente). El borrador parte de aquí.
export function projectedPlan(m, team) {
  const plan = deepCopy(m.teams[team].plan);
  plan.roles = { ...m.roleOf }; plan.defRoles = { ...m.defRoleOf };
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
    else if (o.type === 'defOrg') for (const f of ['defense', 'target', 'targetAlt', 'fallbackOrg']) { if (f in o.content) plan[f] = deepCopy(o.content[f]); }
    else if (o.type === 'defHeight') plan.pressureHeight = o.content.pressureHeight;
    else if (o.type === 'defStyles') for (const [k, v] of Object.entries(o.content.defStyles)) { if (o.liveFields.includes(`defStyles.${k}`)) plan.defStyles[k] = v; }
    else if (o.type === 'defCoverage') { plan.navigation = o.content.navigation ?? null; plan.coverage = o.content.coverage; }
    else if (o.type === 'defRoles') for (const [pid, code] of Object.entries(o.content.roles)) { if (o.liveFields.includes(`defRoles.${pid}`)) plan.defRoles[pid] = code; }
    else if (o.type === 'defMarks') plan.marks = deepCopy(o.content.marks);
    else if (o.type === 'defSpecial' && o.content.special !== 'ESPD01') { plan.specials = (plan.specials ?? []).filter((x) => x.id !== o.content.special); if (o.content.config) plan.specials.push({ id: o.content.special, ...deepCopy(o.content.config) }); }
    else if (o.type === 'throwInBook') for (const [k, v] of Object.entries(o.content.priorities)) {
      if (!o.liveFields.includes(`throwBook.${k}`)) continue;
      const i = plan.throwInBook.findIndex((b) => b.playId === k);
      if (v === null) { if (i >= 0) plan.throwInBook.splice(i, 1); } else if (i >= 0) plan.throwInBook[i].priority = v; else plan.throwInBook.push({ playId: k, priority: v });
    }
    else if (o.type === 'throwInServers') for (const k of ['band', 'endline']) { if (o.liveFields.includes(`throwServer.${k}`)) plan.throwInServers[k] = { ...plan.throwInServers[k], ...deepCopy(o.content[k]) }; }
    else if (o.type === 'defThrowIn') for (const f of ['band', 'endline', 'target']) { if (o.liveFields.includes(`defThrow.${f}`)) plan.throwInDefense[f] = o.content[f]; }
  }
  return plan;
}

// Prioridad por ficha del catálogo: número 1–5 si está activa, null si no.
const DEF_KEYS = ['defense', 'target', 'targetAlt', 'fallbackOrg', 'pressureHeight', 'coverage', 'navigation'];
const defOf = (plan) => ({ ...Object.fromEntries(DEF_KEYS.map((k) => [k, plan[k] ?? null])), defStyles: { ...plan.defStyles }, marks: deepCopy(plan.marks ?? []), specials: deepCopy(plan.specials ?? []) });
const prioMap = (plan, catalog) => Object.fromEntries(catalog.map((id) => [id, plan.playbook.find((b) => b.playId === id)?.priority ?? null]));

const throwOf = (plan, cat) => ({ priorities: Object.fromEntries(cat.map((id) => [id, plan.throwInBook.find((b) => b.playId === id)?.priority ?? null])), servers: deepCopy(plan.throwInServers), defense: deepCopy(plan.throwInDefense) });

export function newDraft(m, team) {
  const plan = projectedPlan(m, team);
  const cat = m.profile.activeCatalog.plays;
  return { team, styles: Object.fromEntries(EDITABLE_STYLES.map((k) => [k, plan.styles[k]])), midrange: plan.midrange, disposition: plan.disposition, roles: { ...plan.roles }, priorities: prioMap(plan, cat), director: [...plan.directorPriority], lineup: m.projectedLineup(team), def: defOf(plan), defRoles: Object.fromEntries(m.teams[team].ids.map((id) => [id, plan.defRoles[id]])), throwIns: throwOf(plan, m.profile.activeCatalog.throwInPlays), dirty: { styles: {}, midrange: false, disposition: false, roles: {}, priorities: {}, director: false, lineup: false, def: false, defRoles: {}, throwIns: false } };
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
  if (!d.dirty.def) d.def = f.def;
  if (!d.dirty.throwIns) d.throwIns = f.throwIns;
  for (const k of Object.keys(f.defRoles)) if (!d.dirty.defRoles[k]) d.defRoles[k] = f.defRoles[k];
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
  // defensa (MOTOR-05): cada grupo viaja como su propia orden; el conjunto se valida junto
  const bd = defOf(base); const dd = draft.def; const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (['defense', 'target', 'targetAlt', 'fallbackOrg'].some((k) => !same(dd[k], bd[k]))) specs.push({ type: 'defOrg', defense: dd.defense, target: dd.target, targetAlt: dd.targetAlt, fallbackOrg: dd.fallbackOrg });
  if (dd.pressureHeight !== bd.pressureHeight) specs.push({ type: 'defHeight', pressureHeight: dd.pressureHeight });
  const ds = {}; for (const k of Object.keys(dd.defStyles)) if (dd.defStyles[k] !== bd.defStyles[k]) ds[k] = dd.defStyles[k];
  if (Object.keys(ds).length) specs.push({ type: 'defStyles', defStyles: ds });
  if (dd.coverage !== bd.coverage || (dd.navigation ?? null) !== (bd.navigation ?? null)) specs.push({ type: 'defCoverage', coverage: dd.coverage, navigation: dd.navigation ?? null });
  const dr = {}; for (const [pid, code] of Object.entries(draft.defRoles)) if (code !== base.defRoles[pid]) dr[pid] = code;
  if (Object.keys(dr).length) specs.push({ type: 'defRoles', roles: dr });
  if (!same(dd.marks, bd.marks)) specs.push({ type: 'defMarks', marks: deepCopy(dd.marks) });
  // saques (MOTOR-06): libro, sacadores y respuesta defensiva viajan como sus propias órdenes; el conjunto se valida junto
  const bt = throwOf(base, m.profile.activeCatalog.throwInPlays); const dt = draft.throwIns;
  const tp = {}; for (const id of Object.keys(bt.priorities)) if (dt.priorities[id] !== bt.priorities[id]) tp[id] = dt.priorities[id];
  if (Object.keys(tp).length) specs.push({ type: 'throwInBook', priorities: tp });
  const ts = {}; for (const k of ['band', 'endline']) if (!same(dt.servers[k], bt.servers[k])) ts[k] = { ...dt.servers[k] };
  if (Object.keys(ts).length) specs.push({ type: 'throwInServers', ...ts });
  const td = {}; for (const f of ['band', 'endline', 'target']) if (dt.defense[f] !== bt.defense[f]) td[f] = dt.defense[f];
  if (Object.keys(td).length) specs.push({ type: 'defThrowIn', ...td });
  for (const id of ['ESPD02', 'ESPD03']) {
    const a = dd.specials.find((x) => x.id === id); const b = bd.specials.find((x) => x.id === id);
    if (!same(a ?? null, b ?? null)) { const { id: _i, ...config } = a ?? {}; specs.push({ type: 'defSpecial', special: id, config: a ? config : null }); }
  }
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
    case 'defOrg': return `Organización defensiva → ${c.defense}${c.target ? ` · objetivo ${c.target}` : ''}${c.targetAlt ? ` · alternativa ${c.targetAlt}` : ''}`;
    case 'defHeight': return `Altura de presión → ${c.pressureHeight}`;
    case 'defStyles': return `Estilos defensivos: ${Object.entries(c.defStyles).map(([k, v]) => `${DEF_STYLE_TITLES[k] ?? k} → ${v}`).join(' · ')}`;
    case 'defCoverage': return `Cobertura → ${c.coverage}${c.navigation ? ` (${c.navigation})` : ''}`;
    case 'defRoles': return `Roles defensivos: ${Object.entries(c.roles).map(([k, v]) => `${k} → ${v}`).join(' · ')}`;
    case 'defMarks': return `Marcas: ${c.marks.length ? c.marks.map((x) => `${x.defender} → ${x.attacker ?? x.fn}`).join(' · ') : 'ninguna'}`;
    case 'defSpecial': return c.special === 'ESPD01' ? `Falta táctica (${c.scope === 'current' ? 'posesión rival actual' : 'siguiente posesión rival'}${c.target && c.target !== 'holder' ? `, sobre ${c.target}` : ', sobre el poseedor'}${c.executor ? `, ejecutor ${c.executor}` : ''})` : `${c.special === 'ESPD02' ? 'Doble a jugador' : 'No abandonar tirador'}: ${c.config ? JSON.stringify(c.config) : 'retirada'}`;
    case 'throwInBook': return `Libro de saques: ${Object.entries(c.priorities).map(([k, v]) => `${k} = ${v === null ? 'desactivada' : v}`).join(' · ')}`;
    case 'throwInServers': return `Sacadores: ${['band', 'endline'].filter((k) => c[k]).map((k) => `${k === 'band' ? 'banda' : 'fondo'} ${c[k].preferred ?? 'política'}${c[k].alternate ? ` / alt. ${c[k].alternate}` : ''}`).join(' · ')}`;
    case 'defThrowIn': return `Respuesta de saque: ${['band', 'endline'].filter((k) => c[k]).map((k) => `${k === 'band' ? 'banda' : 'fondo'} → ${c[k]}`).join(' · ')}${'target' in c ? ` · objetivo ${c.target ?? 'ninguno'}` : ''}`;
    case 'throwInCall': return `Llamada de saque ${c.playId} (próximo saque compatible propio del periodo)`;
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
    case 'vigente': return o.kind === 'call' || o.kind === 'special' || o.kind === 'tcall' ? r.charAt(0).toUpperCase() + r.slice(1) : `Vigente${o.activation ? ` desde ${periodWord(o.activation.period)}` : ''}`;
    case 'consumida': return r.charAt(0).toUpperCase() + r.slice(1);
    case 'caducada': return o.kind === 'tcall' ? `Llamada de saque caducada: ${r}` : o.kind === 'call' ? `Llamada caducada: ${r}` : o.kind === 'special' ? `Falta táctica caducada: ${r}` : `Caducada: ${r}`;
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
  // defensa (MOTOR-05): mismos controles que la preparación, sobre el borrador
  const rival = m.input.teams[1 - team];
  const defense = h('div', {}, defenseControls(d.def, { profile: m.profile, players: tm.players, rivals: rival.players, disabled: dis, idPrefix: 'live', label: (id) => optLabelShort(id, m), refresh: rerender,
    touch: (f) => { if (f.startsWith('role.')) d.dirty.defRoles[f.slice(5)] = true; else d.dirty.def = true; },
    getRole: (pid) => d.defRoles[pid], setRole: (pid, code) => { d.defRoles[pid] = code; } }),
    h('p', { class: 'small muted' }, 'Organización, roles y marcas entran en la próxima asignación o reorganización pertinente; los estilos, en la siguiente decisión defensiva aún no resuelta; la cobertura, en la siguiente interacción compatible; la altura, en el próximo avance rival. La configuración conjunta se valida junta: si algo es irrealizable no se aplica nada.'));
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

  // saques de banda y fondo (MOTOR-06): mismos controles que la preparación, sobre el borrador
  const throwIns = h('div', {}, throwInControls({ profile: m.profile, players: tm.players, rivals: rival.players, disabled: dis, coverage: d.def.coverage, idPrefix: 'live-thr', refresh: rerender, label: (id) => optLabelShort(id, m),
    getPriority: (id) => d.throwIns.priorities[id], setPriority: (id, v) => { d.throwIns.priorities[id] = v; d.dirty.throwIns = true; },
    getServer: (k, f) => d.throwIns.servers[k][f], setServer: (k, f, v) => { d.throwIns.servers[k][f] = v; if (f === 'preferred' && v && d.throwIns.servers[k].alternate === v) d.throwIns.servers[k].alternate = null; d.dirty.throwIns = true; },
    getDef: (f) => d.throwIns.defense[f], setDef: (f, v) => { d.throwIns.defense[f] = v; d.dirty.throwIns = true; } }),
    h('p', { class: 'small muted' }, 'El libro, los sacadores y la respuesta entran en el siguiente saque compatible aún no resuelto; no cambian un saque ya iniciado ni reescriben una resolución comprometida. La configuración conjunta se valida junta (por ejemplo, persecución o cambio exigen COB01 o COB02): si algo es imposible se rechaza con su motivo y se conserva la última válida.'));
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
    callSection(session, ui, dis, msg), throwCallSection(session, ui, dis, msg), tacticalFoulSection(session, ui, dis, msg));

  return h('div', { class: 'card' }, head, status, h('div', { class: 'grid2' }, h('div', {}, styles, book), h('div', {}, director, roles, lineup)), h('details', { open: ui.defOpen, ontoggle: (e) => { ui.defOpen = e.target.open; } }, h('summary', {}, h('strong', {}, 'Defensa'), ` — ${d.def.defense} · ${d.def.pressureHeight} · ${d.def.coverage}`), defense), h('details', { open: ui.thrOpen, ontoggle: (e) => { ui.thrOpen = e.target.open; } }, h('summary', {}, h('strong', {}, 'Saques de banda y fondo'), ` — ${Object.values(d.throwIns.priorities).filter((v) => v != null).length} ficha(s) activa(s) · respuesta ${d.throwIns.defense.band} / ${d.throwIns.defense.endline}`), throwIns), applyRow, h('hr', { style: 'border:0;border-top:1px solid var(--line);margin:14px 0' }), quick);
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

// Llamada puntual de saque (MOTOR-06): se dirige al SIGUIENTE saque compatible propio dentro del periodo actual; se consume al iniciar la ficha
// y caduca al acabar el periodo. No la consume un saque de otro origen incompatible (p. ej. uno de banda no consume una llamada de fondo).
function throwCallSection(session, ui, dis, msg) {
  const m = session.match; const team = session.managedTeam; const rep = m.profile.throwInRepertoire;
  const c = ui.tcall ??= { playId: m.profile.activeCatalog.throwInPlays[0] };
  const pend = m.orders.find((o) => o.type === 'throwInCall' && o.team === team && o.state === 'pendiente');
  return h('div', {}, h('h3', {}, 'Llamar un saque (siguiente saque compatible)'),
    h('div', { class: 'row' },
      h('select', { disabled: dis, 'aria-label': 'ficha de saque', onchange: (e) => { c.playId = e.target.value; } }, m.profile.activeCatalog.throwInPlays.map((p) => h('option', { value: p, selected: c.playId === p }, `${p} — ${rep.plays[p].name} (${rep.kinds[rep.plays[p].kind].label.toLowerCase()})${m.teams[team].plan.throwInBook.some((b) => b.playId === p) ? '' : ' (no activa en el libro)'}`))),
      h('button', { class: 'btn secondary', disabled: dis, onclick: () => {
        const o = session.submit({ type: 'throwInCall', playId: c.playId });
        msg(o.state === 'rechazada' ? `Llamada de saque no registrada: ${o.reason}` : `Llamada de ${c.playId} confirmada para el siguiente saque ${rep.kinds[rep.plays[c.playId].kind].label.toLowerCase()} propio del periodo: caduca si no llega ese saque; no garantiza recepción ni canasta.`, o.state === 'rechazada' ? 'errbox' : 'pill ok');
      } }, 'Confirmar llamada de saque'),
      pend ? h('button', { class: 'btn danger', disabled: dis, onclick: () => { session.cancel(pend.id); msg('Llamada de saque retirada.'); } }, 'Retirar llamada pendiente') : null),
    h('p', { class: 'small muted' }, pend ? `Pendiente: ${orderText(pend)}. ${pend.reason}.` : 'Sin llamada de saque pendiente. Un plan persistente de banda o fondo (libro y prioridades) es distinto de esta llamada puntual.'));
}

// ESPD01 · Falta táctica: orden puntual. No detiene el reloj; un ejecutor con acceso intenta la acción en una oportunidad pertinente de la
// posesión rival declarada (puede no llegar ni encontrar oportunidad antes de que acabe el ámbito).
function tacticalFoulSection(session, ui, dis, msg) {
  const m = session.match; const team = session.managedTeam; const rivals = m.input.teams[1 - team].players; const mine = m.input.teams[team].players;
  const c = ui.foul ??= { scope: 'next', target: 'holder', executor: '' };
  const p = m.poss; const canCurrent = !!p && !p.done && p.team !== team && m.clock > 0;
  if (c.scope === 'current' && !canCurrent) c.scope = 'next';
  return h('div', {}, h('h3', {}, 'Falta táctica (ESPD01)'),
    h('div', { class: 'row' },
      h('label', {}, h('input', { type: 'radio', name: 'foul-scope', disabled: dis || !canCurrent, checked: c.scope === 'current', onchange: () => { c.scope = 'current'; msg(null); } }), ' Posesión rival actual'),
      h('label', {}, h('input', { type: 'radio', name: 'foul-scope', disabled: dis, checked: c.scope === 'next', onchange: () => { c.scope = 'next'; msg(null); } }), ' Siguiente posesión rival'),
      h('select', { disabled: dis, 'aria-label': 'objetivo de la falta táctica', onchange: (e) => { c.target = e.target.value; } }, h('option', { value: 'holder', selected: c.target === 'holder' }, 'El poseedor'), rivals.map((r) => h('option', { value: r.id, selected: c.target === r.id }, r.id))),
      h('select', { disabled: dis, 'aria-label': 'ejecutor', onchange: (e) => { c.executor = e.target.value; } }, h('option', { value: '' }, 'Ejecutor: quien defiende al objetivo'), mine.map((r) => h('option', { value: r.id, selected: c.executor === r.id }, r.id))),
      h('button', { class: 'btn secondary', disabled: dis, onclick: () => {
        const o = session.submit({ type: 'defSpecial', special: 'ESPD01', scope: c.scope, target: c.target, executor: c.executor || null });
        msg(o.state === 'rechazada' ? `Falta táctica no registrada: ${o.reason}` : 'Falta táctica solicitada: no detiene el reloj. Un ejecutor con acceso intentará el contacto en una oportunidad pertinente; puede no llegar o caducar al terminar la posesión.', o.state === 'rechazada' ? 'errbox' : 'pill ok');
      } }, 'Pedir falta táctica')),
    h('p', { class: 'small muted' }, 'La sanción depende del contacto representado (falta personal ordinaria o disruptiva con dos libres y posesión), nunca de preferir una falta barata. Aplica el perfil FIBA del proyecto (lectura propia: el PDF no es accesible desde el entorno).'));
}
