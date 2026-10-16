// Pantalla «Partido»: simulación completa, marcador, acta, quintetos, elecciones, relato por posesiones,
// detalle calculado separado de la vista normal y descarga del encuentro en JSON.
import { h, clear, fmt, table } from './dom.js';
import { store, PLAY_NAMES } from './store.js';
import { runMatchAsync, validateInput, deepCopy, teamTotals } from '../match/index.js';
import { describeEvent, clockText } from '../match/narrative.js';

const ui = { running: false, progress: 0, filter: 'all', limit: 150, compare: null, error: null };

export function renderGame(root) {
  clear(root);
  const { edit, profile } = store;
  const errs = validateInput(edit, profile);
  const bar = h('div', { class: 'bar' }, h('i', { id: 'progress-i', style: `width:${ui.progress}%` }));
  root.append(h('h2', {}, 'Partido'),
    h('div', { class: 'card' }, h('div', { class: 'row' },
      h('button', { class: 'btn', id: 'simulate', disabled: ui.running || errs.length > 0, onclick: () => simulate(root, deepCopy(edit)) }, 'Simular partido'),
      h('span', { class: 'muted' }, `${edit.teams[0].id} ${edit.teams[0].name} vs ${edit.teams[1].id} ${edit.teams[1].name} · semilla ${edit.seed}`),
      h('span', { id: 'run-state', class: 'pill' }, ui.running ? 'Simulando…' : store.last ? 'Último resultado disponible' : 'Sin simular')),
    ui.running ? bar : null,
    errs.length ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'No se puede simular: entrada no válida.'), h('ul', {}, errs.map((e) => h('li', {}, h('code', {}, e.path), ' — ', e.message)))) : null,
    ui.error ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'La simulación terminó con error: '), ui.error) : null));
  if (store.last) renderResult(root, store.last);
}

async function simulate(root, input) {
  ui.running = true; ui.progress = 0; ui.error = null; ui.compare = null; ui.filter = 'all'; ui.limit = 150;
  renderGame(root);
  const len = (p) => (p <= 4 ? 6000 : 3000);
  try {
    const res = await runMatchAsync(input, store.profile, { detail: 'full' }, async (m) => {
      const frac = m.period ? ((Math.min(m.period, 4) - 1) + (1 - m.clock / len(m.period))) / 4 : 0;
      ui.progress = Math.round(Math.min(frac, 1) * 100);
      const el = document.getElementById('progress-i'); if (el) el.style.width = `${ui.progress}%`;
      await new Promise((r) => setTimeout(r, 0)); // cesión de ejecución entre posesiones, sin fotogramas
    });
    store.last = res;
    if (res.status !== 'finished') ui.error = `${res.status}: ${res.errors.map((e) => e.message).join('; ')} (registro parcial disponible)`;
  } catch (e) { ui.error = e.message; }
  ui.running = false;
  renderGame(root);
}

function renderResult(root, res) {
  const name = (id) => id;
  const teamName = (i) => `${res.teams[i].id}`;
  const ot = res.periodScores.length > 4 ? res.periodScores.length - 4 : 0;
  root.append(h('div', { class: 'card' },
    h('div', { class: 'row' }, h('div', { class: 'score' }, `${res.teams[0].id} ${res.score[0]} – ${res.score[1]} ${res.teams[1].id}`), h('span', { class: `pill ${res.status === 'finished' ? 'ok' : 'bad'}` }, res.status === 'finished' ? 'Partido terminado' : res.status), ot ? h('span', { class: 'pill' }, `${ot} prórroga(s)`) : null),
    h('p', { class: 'muted small' }, `Semilla ${res.meta.rng.initialSeed} · ${res.meta.rng.algorithm} · ${res.meta.rng.draws} sorteos deportivos · ${res.diagnostics.possessions} posesiones · ${res.events.length} acontecimientos · motor ${res.meta.engineVersion} · perfil ${res.meta.profileId} (${res.meta.profileStatus}) · reglas ${res.meta.rulesProfile}`),
    table(['Periodo', ...res.teams.map((t) => t.id)], res.periodScores.map((p) => [p.period <= 4 ? `Cuarto ${p.period}` : `Prórroga ${p.period - 4}`, ...p.points]), { numeric: [1, 2] }),
    h('div', { class: 'row', style: 'margin-top:10px' },
      h('button', { class: 'btn secondary', onclick: () => download(res) }, 'Descargar encuentro (JSON)'),
      h('button', { class: 'btn secondary', onclick: () => repeat(root, res) }, 'Repetir con la entrada congelada'),
      ui.compare ? h('span', { class: `pill ${ui.compare.same ? 'ok' : 'bad'}` }, ui.compare.same ? `Repetición idéntica (${ui.compare.n} acontecimientos, mismo marcador)` : 'La repetición difiere') : null)));
  root.append(h('div', { class: 'grid2' }, [0, 1].map((t) => boxCard(res, t))));
  root.append(lineupsCard(res), choicesCard(res), storyCard(root, res, name, teamName));
}

function boxCard(res, t) {
  const rows = res.input.teams[t].players.map((p) => { const b = res.box.players[p.id]; return { cls: b.min === 0 ? 'muted' : '', cells: [p.id, fmt(b.min), b.pts, `${b.fg2m}/${b.fg2a}`, `${b.fg3m}/${b.fg3a}`, `${b.ftm}/${b.fta}`, b.oreb, b.dreb, b.tov, b.pf, b.stl, b.blk, fmt(res.diagnostics.finalEnergy[p.id], 0)] }; });
  const tt = teamTotals(res.box, res.input, t);
  rows.push({ cls: 'starter', cells: ['Total equipo', fmt(tt.min), tt.pts, `${tt.fg2m}/${tt.fg2a}`, `${tt.fg3m}/${tt.fg3a}`, `${tt.ftm}/${tt.fta}`, tt.oreb, tt.dreb, tt.tov, tt.pf, tt.stl, tt.blk, ''] });
  return h('div', { class: 'card' }, h('h3', {}, `Acta — ${res.teams[t].id} ${res.teams[t].name}`),
    table(['Jugador', 'Min', 'Pts', 'T2', 'T3', 'TL', 'RO', 'RD', 'Per', 'Fal', 'Rob', 'Tap', 'Energía final'], rows, { numeric: [1, 2, 6, 7, 8, 9, 10, 11, 12] }),
    h('p', { class: 'small muted' }, `Pérdidas de equipo (violación de reloj de posesión, sin jugador): ${res.box.teams[t].teamTov}. Rebotes, robos y tapones solo constan cuando proceden de hechos reales. `, `Métricas aún no implementadas, omitidas (no son ceros observados): ${res.box.pending.join('; ')}.`));
}

function lineupsCard(res) {
  const mins = {};
  for (const ev of res.events) if (ev.durationTenths) for (const lid of ev.lineups) mins[lid] = (mins[lid] ?? 0) + ev.durationTenths;
  const rows = res.lineups.filter((l) => mins[l.id]).map((l) => [res.teams[l.team].id, l.id, Object.entries(l.slots).map(([s, id]) => `${s}:${id.split('-')[1]}`).join(' '), fmt(mins[l.id] / 600, 1)]);
  const subs = res.events.filter((e) => e.type === 'substitution');
  const used = res.input.teams.map((t) => t.players.filter((p) => res.box.players[p.id].min > 0).length);
  return h('div', { class: 'card' }, h('h3', {}, 'Jugadores utilizados, quintetos y sustituciones'),
    h('p', {}, `Jugadores utilizados: ${res.teams[0].id} ${used[0]} · ${res.teams[1].id} ${used[1]} · sustituciones: ${subs.length}`),
    h('div', { class: 'grid2' },
      h('div', {}, h('h3', {}, 'Quintetos (minutos con el quinteto en pista)'), table(['Equipo', 'Quinteto', 'Posiciones', 'Min'], rows, { numeric: [3] })),
      h('div', {}, h('h3', {}, 'Sustituciones'), table(['Periodo', 'Reloj', 'Equipo', 'Entra', 'Sale', 'Motivo', 'Ventana'], subs.map((e) => [e.period, clockText(e.clock.after), res.teams[e.team].id, e.participants.entra, e.participants.sale, e.intent.motivo, e.effects.ventana ?? '']))))
  );
}

function choicesCard(res) {
  const by = {}; const cats = {};
  for (const ev of res.events) {
    if (ev.type !== 'attempt') continue;
    const t = res.teams[ev.team].id; const o = ev.intent.origen;
    (by[t] ??= {})[o] = ((by[t] ??= {})[o] ?? 0) + 1;
    const c = (cats[t] ??= {}); const k = `${ev.intent.categoria}${ev.intent.zona && (ev.intent.categoria === 'fieldShot' || ev.intent.categoria === 'shootingFoul') ? `:${ev.intent.zona}` : ''}`; c[k] = (c[k] ?? 0) + 1;
  }
  const origins = [...new Set(Object.values(by).flatMap((o) => Object.keys(o)))].sort();
  const catKeys = [...new Set(Object.values(cats).flatMap((o) => Object.keys(o)))].sort();
  return h('div', { class: 'card' }, h('h3', {}, 'Elecciones producidas (una sola partida no es una demostración estadística)'),
    h('div', { class: 'grid2' },
      h('div', {}, table(['Origen de la acción', ...res.teams.map((t) => t.id)], origins.map((o) => [`${o}${PLAY_NAMES[o] ? ` — ${PLAY_NAMES[o]}` : ''}`, ...res.teams.map((t) => by[t.id]?.[o] ?? 0)]), { numeric: [1, 2] })),
      h('div', {}, table(['Desenlace de la acción', ...res.teams.map((t) => t.id)], catKeys.map((k) => [k, ...res.teams.map((t) => cats[t.id]?.[k] ?? 0)]), { numeric: [1, 2] }))));
}

function storyCard(root, res, name, teamName) {
  const periods = res.periodScores.map((p) => p.period);
  const evs = res.events.filter((e) => ui.filter === 'all' || e.period === Number(ui.filter));
  const shown = evs.slice(0, ui.limit);
  const body = h('ul', {}); let lastPoss = null;
  for (const ev of shown) {
    if (ev.possessionId && ev.possessionId !== lastPoss) { lastPoss = ev.possessionId; body.append(h('li', { class: 'poss' }, `Periodo ${ev.period} · posesión ${ev.possessionId} · ataca ${teamName(ev.team)} · marcador ${ev.score.join('–')}`)); }
    body.append(h('li', {}, h('span', { class: 't' }, `${clockText(ev.clock.before)}→${clockText(ev.clock.after)} · pos. ${fmt(ev.shotClock.after / 10)}`), describeEvent(ev, { name, teamName }), ' ', h('button', { class: 'link small', onclick: () => showDetail(ev, res) }, `ver detalle ${ev.id}`)));
  }
  return h('div', { class: 'card story' }, h('h3', {}, 'Relato cronológico por periodos y posesiones'),
    h('div', { class: 'row' }, h('label', {}, 'Periodo ', h('select', { onchange: (e) => { ui.filter = e.target.value; ui.limit = 150; renderGame(root); } }, h('option', { value: 'all', selected: ui.filter === 'all' }, 'Todos'), periods.map((p) => h('option', { value: p, selected: String(p) === String(ui.filter) }, p <= 4 ? `Cuarto ${p}` : `Prórroga ${p - 4}`)))), h('span', { class: 'muted small' }, `Mostrando ${shown.length} de ${evs.length} acontecimientos. El relato se pagina; la descarga JSON conserva todos los registros.`)),
    body, evs.length > shown.length ? h('button', { class: 'btn secondary', style: 'margin-top:8px', onclick: () => { ui.limit += 200; renderGame(root); } }, 'Mostrar más') : null);
}

function showDetail(ev, res) {
  const dlg = document.getElementById('detail');
  document.getElementById('detail-title').textContent = `${ev.id} · ${ev.type} · periodo ${ev.period}`;
  const body = document.getElementById('detail-body'); clear(body);
  const sec = (t, o) => h('div', {}, h('h3', {}, t), h('pre', {}, JSON.stringify(o, null, 1)));
  body.append(
    h('p', { class: 'small muted' }, 'Vista de detalle calculado: no forma parte del relato normal. Incluye capacidades base y efectivas usadas, pesos, energía, probabilidades, sorteos y resultado.'),
    sec('Hecho', { tipo: ev.type, periodo: ev.period, posesion: ev.possessionId, equipoEnAtaque: ev.team == null ? null : res.teams[ev.team].id, relojAntes: clockText(ev.clock.before), relojDespues: clockText(ev.clock.after), relojPosesion: [ev.shotClock.before / 10, ev.shotClock.after / 10], duracionSegundos: ev.durationTenths / 10, quintetos: ev.lineups, marcador: ev.score }),
    sec('Intención y procedencia', ev.intent), sec('Participantes', ev.participants), sec('Consecuencias', ev.effects), sec('Hechos de acta que produce', ev.stats),
    sec('Cálculo (recetas, distribuciones, mezclas, binarias)', ev.calc ?? 'Sin detalle calculado (modo mínimo).'), sec('Sorteos deportivos consumidos', ev.draws));
  dlg.showModal();
}

function download(res) {
  const blob = new Blob([JSON.stringify(res)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `beM-MOTOR01-${res.meta.rng.initialSeed}-${res.teams.map((t) => t.id).join('-')}.json` });
  document.body.append(a); a.click(); a.remove();
}

async function repeat(root, res) {
  ui.running = true; renderGame(root);
  const again = await runMatchAsync(deepCopy(res.input), store.profile, { detail: 'full' });
  const strip = (r) => JSON.stringify(r.events.map(({ calc, ...x }) => x));
  ui.compare = { same: strip(again) === strip(res) && again.score.join() === res.score.join(), n: again.events.length };
  ui.running = false; renderGame(root);
}
