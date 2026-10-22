// Laboratorio del «Motor ultrarrápido» (SIM-MOTOR-01): generador estadístico por tramos. Tres vistas: Partido (equipos EQ01–EQ12, planes, semilla, resultado y descargas),
// Parámetros (perfil SIM editable por secciones con procedencia) y Lote (agenda congelada de 1.000 en Web Workers, con progreso y resumen descargable).
// Estado propio, separado del motor detallado: no modifica fichas, planes, perfiles ni escenarios guardados; usa la referencia detallada base (store.baseNew) solo como procedencia de datos.
import { h, clear, table } from './dom.js';
import { store } from './store.js';
import { makeContext, contextToJSON, SimMatch, buildSimResult, SIM_MODEL, SIM_RESULT_SCHEMA, SIM_VERSION } from '../sim/index.js';
import { referenceTeamMap, buildPairInput } from '../sim/teams.js';
import { applyOverrides, validateOverrides, diffProfile, profileSections } from '../sim/profile.js';
import { buildAgenda, TEAM_IDS } from '../sim/schedule.js';
import { CONTROL_ROWS } from '../sim/controls.js';

const pill = (t, c = '') => h('span', { class: `pill ${c}` }, t);
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const pct = (a, b) => (b > 0 ? `${((100 * a) / b).toFixed(1)} %` : '—');
const dl = (name, text, type = 'application/json') => { const url = URL.createObjectURL(new Blob([text], { type })); const l = h('a', { href: url, download: name }); document.body.append(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };

export const simState = {
  sub: 'match', teamA: 'EQ01', teamB: 'EQ02', seed: 20261022, input: null, overrides: [], result: null, resultInput: null, firstFp: null, repeatNote: null, view: 'acta', ctxKey: null, ctx: null, teams: null,
  edit: { filter: '', section: 'all', draft: {} }, batch: { running: false, done: 0, total: 1000, valid: 0, failed: 0, ms: 0, results: null, workers: 0, msg: null, started: 0 }, error: null,
};
const st = simState;
const detailed = () => store.baseNew;
function ensure() {
  const key = JSON.stringify(st.overrides);
  if (!st.ctx || st.ctxKey !== key) { st.ctx = makeContext(detailed(), st.overrides.length ? st.overrides : null); st.ctxKey = key; }
  if (!st.teams) st.teams = referenceTeamMap(detailed(), store.players);
  if (!st.input) st.input = buildPairInput(st.teams, st.teamA, st.teamB, { seed: st.seed });
}
const resetInput = () => { st.input = null; st.result = null; st.repeatNote = null; st.firstFp = null; };

// ------------------------------------------------------------------------------------------------------------------------------ vista Partido
function planEditor(ti) {
  const t = st.input.teams[ti]; const plan = t.plan; const repaint = () => { st.result = null; render(); };
  const sel = (label, value, opts, set, id) => h('label', { class: 'small' }, `${label} `, h('select', { id, onchange: (e) => { set(e.target.value); repaint(); } }, opts.map(([v, tx]) => h('option', { value: v, selected: String(v) === String(value) }, tx))));
  const lv = (obj, key) => sel(key, obj[key], [1, 2, 3, 4, 5].map((n) => [n, String(n)]), (v) => { obj[key] = Number(v); }, `plan${ti}-${key}`);
  const T = st.ctx.T;
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `${t.id} · ${t.name}`),
    h('p', { class: 'small muted' }, 'Estilos ofensivos 1–5'), h('div', { class: 'row' }, T.styleKeys.map((k) => lv(plan.styles, k))),
    h('p', { class: 'small muted' }, 'Estilos defensivos 1–5 (afectan al ataque del rival)'), h('div', { class: 'row' }, T.defStyleKeys.map((k) => lv(plan.defStyles, k))),
    h('div', { class: 'row', style: 'margin-top:8px' },
      sel('disposición', plan.disposition, Object.keys(T.dispositions).map((d) => [d, `${d} · ${T.dispositions[d].name}`]), (v) => { plan.disposition = v; delete plan._c; }, `plan${ti}-disposition`),
      sel('defensa', plan.defense, Object.keys(T.organizations).map((d) => [d, `${d} · ${T.organizations[d].name}`]), (v) => { plan.defense = v; }, `plan${ti}-defense`),
      sel('cobertura', plan.coverage, Object.keys(T.coverages).map((d) => [d, `${d} · ${T.coverages[d].name}`]), (v) => { plan.coverage = v; }, `plan${ti}-coverage`),
      sel('presión', plan.pressureHeight, T.heights.map((d) => [d, d]), (v) => { plan.pressureHeight = v; }, `plan${ti}-height`),
      sel('media distancia', plan.midrange, T.midrangePolicies.map((d) => [d, d]), (v) => { plan.midrange = v; }, `plan${ti}-midrange`)),
    h('p', { class: 'small muted' }, `Libro: ${plan.playbook.length} fichas (prioridades del plan natural). Sin efecto aparente en SIM: marcas, navegación, especiales defensivas, saques, roles (exclusivos del detallado).`));
}
function generate() {
  try {
    ensure(); const m = new SimMatch(st.input, st.ctx, { matchId: `LABSIM-${st.input.teams[0].id}-${st.input.teams[1].id}-${st.input.seed}`, attemptId: 1 }); m.finish();
    const res = buildSimResult(m, { events: true });
    st.repeatNote = st.firstFp && st.resultInput === JSON.stringify(st.input) ? (st.firstFp === res.sportFingerprint ? { ok: true, text: `Repetición con la misma entrada: huella idéntica (${res.sportFingerprint}).` } : { ok: false, text: `HUELLA DISTINTA: ${st.firstFp} ≠ ${res.sportFingerprint}` }) : null;
    st.firstFp = res.sportFingerprint; st.resultInput = JSON.stringify(st.input); st.result = res; st.error = null;
  } catch (e) { st.error = e.validation ? e.validation.map((v) => `${v.path}: ${v.message}`).join('; ') : String(e.message ?? e); }
  render();
}
function resultCards(res) {
  const A = res.identity.teams; const out = [];
  out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `${A[0].id} ${res.score.current[0]} – ${res.score.current[1]} ${A[1].id}`),
    h('p', { class: 'small' }, `Parciales ${res.score.periods.map((p) => p.join('-')).join(' | ')} · prórrogas ${res.score.overtimes} · ${res.segments.length} tramos · ${res.events?.length ?? 0} hechos · huella ${res.sportFingerprint}`),
    h('div', { class: 'row' }, pill(`conciliación ${res.reconciliation.passed}/${res.reconciliation.evaluated}`, res.reconciliation.valid ? 'ok' : 'bad'), pill(`estado ${res.status}`, res.status === 'finished' ? 'ok' : 'bad'), st.repeatNote ? pill(st.repeatNote.text, st.repeatNote.ok ? 'ok' : 'bad') : null)));
  const tabs = [['acta', 'Acta'], ['zonas', 'Mapa por zonas'], ['familias', 'Familias'], ['quintetos', 'Quintetos'], ['evolucion', 'Evolución'], ['concilia', 'Conciliación']];
  out.push(h('div', { class: 'tabs2', id: 'sim-viewtabs' }, tabs.map(([id, tx]) => h('button', { type: 'button', class: `btn ${st.view === id ? '' : 'secondary'}`, id: `simv-${id}`, onclick: () => { st.view = id; render(); } }, tx))));
  if (st.view === 'acta') for (const k of [0, 1]) {
    const rows = res.box.players.filter((p) => p.team === k).map((p) => ({ cls: p.starter ? 'starter' : '', cells: [p.id, p.positions.join('/'), p.dnp ? 'DNP' : f1(p.min), p.pts, `${p.fg2m}/${p.fg2a}`, `${p.fg3m}/${p.fg3a}`, `${p.ftm}/${p.fta}`, p.oreb, p.dreb, p.ast, p.tov, p.stl, p.blk, p.pf, p.pfd, p.pm, p.val] }));
    const t = res.box.teams[k]; rows.push({ cls: 'total', cells: [`Equipo ${res.identity.teams[k].id}`, '', f1(t.min), t.pts, `${t.fg2m}/${t.fg2a}`, `${t.fg3m}/${t.fg3a}`, `${t.ftm}/${t.fta}`, t.oreb, t.dreb, t.ast, t.tov, t.stl, t.blk, t.pf, t.pfd, '', ''] });
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Acta · ${res.identity.teams[k].id}`), table(['Jugador', 'Pos', 'Min', 'PTS', 'T2', 'T3', 'TL', 'RO', 'RD', 'AS', 'PER', 'ROB', 'TAP', 'FC', 'FR', '+/-', 'VAL'], rows, { numeric: [2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] }), h('p', { class: 'small muted' }, `Rebotes de equipo: ofensivos ${t.teamReb[0]}, defensivos ${t.teamReb[1]}. VAL = PTS + RT + AS + REC + TAP + FR − fallos de campo − fallos de libre − PER − TREC − FC (política EST-SIM01-R1).`)));
  }
  if (st.view === 'zonas') out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Tiros por zona del perfil (sin coordenadas ni lados)'),
    table(['Zona', `${A[0].id} aciertos/intentos`, `${A[0].id} %`, `${A[1].id} aciertos/intentos`, `${A[1].id} %`], res.zones.map((z) => [z.zone, `${z.teams[0].m}/${z.teams[0].a}`, pct(z.teams[0].m, z.teams[0].a), `${z.teams[1].m}/${z.teams[1].a}`, pct(z.teams[1].m, z.teams[1].a)])),
    h('h3', {}, 'Por jugador y zona (intentos · calidad cómoda/normal/forzada)'),
    table(['Jugador', 'Zona', 'Aciertos/intentos', 'Cómoda', 'Normal', 'Forzada'], res.box.players.flatMap((p) => ['rim', 'inside', 'midrange', 'three'].filter((z) => p.zones[z].a > 0).map((z) => [p.id, z, `${p.zones[z].m}/${p.zones[z].a}`, p.zones[z].q[0], p.zones[z].q[1], p.zones[z].q[2]])))));
  if (st.view === 'familias') [0, 1].forEach((k) => out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Uso táctico · ${A[k].id}`),
    h('p', { class: 'small muted' }, `Denominadores propios: ${res.familyDenominators[k].controls} controles y ${res.familyDenominators[k].finalizations} finalizaciones (tiros de campo + faltas de tiro).`),
    table(['Familia / ficha', 'TCI', 'TCC', 'PTS', 'AS', 'Con movimiento', 'Cómoda', 'Normal', 'Forzada', 'Faltas de tiro'], res.families[k].map((f) => [f.play ?? f.family, f.fga, f.fgm, f.pts, f.ast, f.moved, f.q[0], f.q[1], f.q[2], f.sf ?? 0]), { numeric: [1, 2, 3, 4, 5, 6, 7, 8, 9] }),
    h('p', { class: 'small muted' }, `Organización defensiva efectiva por tramo: ${[...new Set(res.segments.map((s) => s.org[k]))].join(', ')}.`))));
  if (st.view === 'quintetos') out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Quintetos (clave independiente del orden de puestos)'),
    table(['Equipo', 'Quinteto', 'Min', 'PF', 'PC', '+/-', 'TCI', 'PER', 'Intervalos'], res.quintets.slice().sort((a, b) => b.sec - a.sec).map((q) => [res.identity.teams[q.team].id, q.ids.map((x) => x.split('-')[1]).join(' '), f1(q.min), q.pf, q.pa, q.pf - q.pa, q.fga, q.tov, q.intervals.map((i) => `${i[0]}–${i[1]}`).join(', ')]), { numeric: [2, 3, 4, 5, 6, 7] })));
  if (st.view === 'evolucion') {
    const pts = res.evolution; const W = 720; const H = 160; const maxT = Math.max(...pts.map((p) => p.t), 1); const diffs = pts.map((p) => p.score[0] - p.score[1]); const m = Math.max(5, ...diffs.map(Math.abs));
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${(p.t / maxT) * W},${H / 2 - ((p.score[0] - p.score[1]) / m) * (H / 2 - 6)}`).join(' ');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('id', 'sim-evol');
    svg.innerHTML = `<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="#aab" stroke-dasharray="4 4"/><path d="${path}" fill="none" stroke="#1f5fbf" stroke-width="2"/>`;
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Diferencia de marcador (${A[0].id} − ${A[1].id}) al final de cada tramo`), svg,
      table(['Tramo', 'Fin (s)', 'Periodo', 'Marcador', 'Dif.'], pts.map((p) => [p.n, p.t, p.p, p.score.join('–'), p.score[0] - p.score[1]]), { numeric: [0, 1, 2, 4] })));
  }
  if (st.view === 'concilia') out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Conciliación SIM (separada de la evaluación deportiva)'),
    table(['Comprobación', 'Descripción', 'Universo', 'Resultado'], res.reconciliation.checks.map((c) => ({ cls: c.ok ? '' : 'sel', cells: [c.id, c.desc, c.universe, c.ok ? 'conforme' : `${c.failureCount} fallo(s)`] })))));
  out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Descargas'), h('div', { class: 'row' },
    h('button', { class: 'btn', id: 'sim-dl-input', type: 'button', onclick: () => dl(`beM-sim-entrada-${res.identity.seed}.json`, JSON.stringify({ input: JSON.parse(st.resultInput), simProfile: { id: st.ctx.sp.id, fingerprint: st.ctx.sp.fingerprint, overrides: st.overrides, rows: st.ctx.sp.rows } }, null, 1)) }, 'Entrada y perfil efectivo'),
    h('button', { class: 'btn', id: 'sim-dl-result', type: 'button', onclick: () => dl(`beM-sim-resultado-${res.identity.seed}.json`, JSON.stringify(res)) }, 'Resultado'),
    h('button', { class: 'btn', id: 'sim-dl-recon', type: 'button', onclick: () => dl(`beM-sim-conciliacion-${res.identity.seed}.json`, JSON.stringify(res.reconciliation, null, 1)) }, 'Conciliación'))));
  return out;
}
function matchView(root) {
  ensure(); const opts = TEAM_IDS.map((id) => h('option', { value: id }, `${id} · ${detailed().population.teams[id].identity}`));
  const pick = (key, label) => h('label', {}, `${label} `, h('select', { id: `sim-${key}`, onchange: (e) => { st[key] = e.target.value; resetInput(); render(); } }, opts.map((o) => { const c = o.cloneNode(true); if (c.value === st[key]) c.selected = true; return c; })));
  root.append(h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'Partido con el motor ultrarrápido'),
    h('p', { class: 'small muted' }, 'Generador estadístico por tramos (SIM-MOTOR). Genera un partido completo sin ejecutar el motor detallado. Calidad estadística aún sin validar frente al detallado ni a competiciones reales.'),
    h('div', { class: 'row' }, pick('teamA', 'Equipo A'), pick('teamB', 'Equipo B'),
      h('label', {}, 'Semilla ', h('input', { type: 'number', id: 'sim-seed', class: 'wide', value: st.seed, onchange: (e) => { st.seed = Number(e.target.value); resetInput(); render(); } })),
      h('button', { class: 'btn', id: 'sim-generate', type: 'button', onclick: generate }, st.result ? 'Repetir con la misma entrada' : 'Generar partido'),
      h('button', { class: 'btn secondary', id: 'sim-reset-plans', type: 'button', onclick: () => { resetInput(); render(); } }, 'Restaurar planes naturales')),
    h('p', { class: 'small' }, `Perfil SIM ${st.ctx.sp.id} (huella ${st.ctx.sp.fingerprint}${st.overrides.length ? `, candidata con ${st.overrides.length} fila(s) editada(s)` : ', base'}) · referencia detallada ${st.ctx.sp.detailedProfileId.split('+').slice(-1)[0]}. Equipos con identidades de instancia distintas (${st.input.teams[0].id} y ${st.input.teams[1].id}).`),
    st.error ? h('p', { class: 'small', style: 'color:var(--bad)', id: 'sim-error' }, `Entrada no válida o error: ${st.error}`) : null));
  root.append(h('div', { class: 'grid2' }, planEditor(0), planEditor(1)));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Controles tácticos soportados y su efecto'),
    table(['Control', 'Grupo', 'Estado', 'Efecto'], CONTROL_ROWS.map((r) => [r.label, r.group, r.status, r.effect]))));
  if (st.result) resultCards(st.result).forEach((c) => root.append(c));
}

// ------------------------------------------------------------------------------------------------------------------------------ vista Parámetros
const fmtVal = (v) => (typeof v === 'number' ? String(v) : JSON.stringify(v));
function paramsView(root) {
  ensure(); const sp = st.ctx.sp; const base = st.ctx.base; const sections = profileSections(sp); const e = st.edit;
  const rows = sp.rows.filter((r) => (e.section === 'all' || r.path.startsWith(`${e.section}.`) || r.path === e.section) && (!e.filter || r.path.includes(e.filter)));
  const edited = new Map(st.overrides.map((o) => [o.path, o.value]));
  const apply = (path, text) => {
    let val; try { val = JSON.parse(text); } catch { e.draft[path] = { text, error: 'JSON no válido' }; render(); return; }
    const errs = validateOverrides(base, [{ path, value: val }]); if (errs.length) { e.draft[path] = { text, error: errs[0].message }; render(); return; }
    delete e.draft[path]; const ov = st.overrides.filter((o) => o.path !== path); if (JSON.stringify(base.index.get(path).value) !== JSON.stringify(val)) ov.push({ path, value: val }); st.overrides = ov; st.result = null; render();
  };
  root.append(h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'Perfil SIM (tabla editable por secciones)'),
    h('p', { class: 'small' }, `${sp.id} · huella ${sp.fingerprint} · ${sp.rows.length} filas · base ${base.fingerprint}. Procedencia: heredada (copia de una fila del detallado), derivada (transformación explícita) o SEM-SIM01 (semilla nueva del encargo, pendiente de auditoría).`),
    h('div', { class: 'row' }, h('label', {}, 'Sección ', h('select', { id: 'sim-section', onchange: (ev) => { e.section = ev.target.value; render(); } }, h('option', { value: 'all', selected: e.section === 'all' }, 'todas'), Object.keys(sections).map((s) => h('option', { value: s, selected: e.section === s }, `${s} (${sections[s].length})`)))),
      h('label', {}, 'Filtro ', h('input', { type: 'text', id: 'sim-filter', value: e.filter, oninput: (ev) => { e.filter = ev.target.value; } , onchange: () => render() })),
      h('button', { class: 'btn secondary', id: 'sim-validate', type: 'button', onclick: () => { const errs = validateOverrides(base, st.overrides); e.msg = errs.length ? `NO válida: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}` : `Candidata válida (${st.overrides.length} fila(s) editada(s)).`; render(); } }, 'Validar'),
      h('button', { class: 'btn secondary', id: 'sim-restore', type: 'button', onclick: () => { st.overrides = []; e.draft = {}; e.msg = 'Perfil restaurado a la base.'; st.result = null; render(); } }, 'Restaurar base'),
      h('button', { class: 'btn', id: 'sim-download-candidate', type: 'button', onclick: () => dl(`beM-sim-candidata-${sp.fingerprint}.json`, JSON.stringify({ model: SIM_MODEL, base: base.id, baseFingerprint: base.fingerprint, candidateFingerprint: sp.fingerprint, overrides: st.overrides, diff: diffProfile(base, sp) }, null, 1)) }, 'Descargar candidata')),
    e.msg ? h('p', { class: 'small', id: 'sim-params-msg' }, e.msg) : null,
    st.overrides.length ? h('div', { class: 'small' }, h('strong', {}, 'Diferencias frente a la base: '), diffProfile(base, sp).map((d) => `${d.path}: ${fmtVal(d.base)} → ${fmtVal(d.candidate)}`).join(' · ')) : null));
  root.append(h('div', { class: 'card' }, table(['Ruta', 'Valor', 'Unidad', 'Procedencia', 'Origen', 'Efecto'], rows.slice(0, 400).map((r) => {
    const d = e.draft[r.path]; const editable = typeof r.value === 'number' || (Array.isArray(r.value) && JSON.stringify(r.value).match(/^[\d.,\-\[\]e\s]+$/));
    const input = editable ? h('input', { type: 'text', 'data-path': r.path, class: edited.has(r.path) ? 'sel' : '', value: d ? d.text : fmtVal(edited.has(r.path) ? edited.get(r.path) : r.value), style: `width:${Array.isArray(r.value) ? 150 : 90}px`, onchange: (ev) => apply(r.path, ev.target.value) }) : h('span', { class: 'muted' }, typeof r.value === 'object' ? 'tabla' : fmtVal(r.value));
    return [r.path, h('span', {}, input, d?.error ? h('span', { style: 'color:var(--bad)', class: 'small' }, ` ${d.error}`) : null), r.unit, r.origin, r.source, r.effect];
  })), rows.length > 400 ? h('p', { class: 'small muted' }, `Mostrando 400 de ${rows.length} filas; usa el filtro o una sección.`) : null));
}

// ------------------------------------------------------------------------------------------------------------------------------ vista Lote (Web Workers)
let workers = [];
function stopBatch(msg) { for (const w of workers) w.terminate(); workers = []; st.batch.running = false; if (msg) st.batch.msg = msg; render(); }
async function startBatch() {
  ensure(); const b = st.batch; const agenda = buildAgenda(); const n = Math.max(1, Math.min(4, navigator.hardwareConcurrency ?? 2)); b.workers = n;
  Object.assign(b, { running: true, done: 0, total: agenda.length, valid: 0, failed: 0, results: new Array(agenda.length), ms: 0, msg: null, started: performance.now() }); render();
  try {
    const ctxJSON = contextToJSON(st.ctx); const key = st.ctx.sp.fingerprint; let next = 0; let id = 1;
    workers = Array.from({ length: n }, () => new Worker(new URL('../sim/worker-web.js', import.meta.url), { type: 'module' }));
    const send = (w, msg) => new Promise((res, rej) => { const myId = id++; const on = (ev) => { if (ev.data.id !== myId) return; w.removeEventListener('message', on); ev.data.type === 'error' ? rej(new Error(ev.data.error)) : res(ev.data); }; w.addEventListener('message', on); w.addEventListener('error', rej, { once: true }); w.postMessage({ ...msg, id: myId }); });
    await Promise.all(workers.map((w) => send(w, { type: 'init', key, ctx: ctxJSON, teams: st.teams, warm: [] })));
    let lastPaint = 0;
    await Promise.all(workers.map(async (w) => { for (;;) { if (!b.running) return; const from = next; if (from >= agenda.length) return; next = Math.min(agenda.length, from + 5); const r = await send(w, { type: 'run', cases: agenda.slice(from, next) }); r.results.forEach((x, i) => { b.results[from + i] = x; b.done++; if (x.valid) b.valid++; else if (x.status !== 'finished') b.failed++; }); b.ms = performance.now() - b.started; if (performance.now() - lastPaint > 150) { lastPaint = performance.now(); paintBatch(); } } }));
    b.ms = performance.now() - b.started; stopBatch(b.running ? 'Agenda terminada.' : b.msg);
  } catch (e) { stopBatch(`Error en el lote: ${e.message ?? e}`); }
}
function paintBatch() { const el = document.getElementById('sim-batch-progress'); if (!el) return; const b = st.batch; el.value = b.done; el.max = b.total; const t = document.getElementById('sim-batch-text'); if (t) t.textContent = batchText(); }
const batchText = () => { const b = st.batch; return `${b.done}/${b.total} terminados · válidos ${b.valid} · fallidos/inválidos ${b.done - b.valid} · ${(b.ms / 1000).toFixed(1)} s · ${b.ms > 0 ? (b.done / (b.ms / 1000)).toFixed(0) : '—'} partidos/s · ${b.workers} worker(s)`; };
function batchView(root) {
  ensure(); const b = st.batch; const ag = buildAgenda();
  root.append(h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'Agenda congelada de 1.000 partidos'),
    h('p', { class: 'small muted' }, `132 cruces ordenados × 7 vueltas + los primeros 76 de una octava (${ag.length} casos). Semilla maestra 20261022; semilla de caso = FNV-1a(«maestra|Cnnnn|A-B»). No es una campaña deportiva balanceada ni sirve para calibrar: mide coste y coherencia inicial. Se ejecuta en Web Workers y deja la interfaz utilizable.`),
    h('div', { class: 'row' }, h('button', { class: 'btn', id: 'sim-batch-start', type: 'button', disabled: b.running, onclick: startBatch }, 'Ejecutar agenda de 1.000'),
      h('button', { class: 'btn danger', id: 'sim-batch-stop', type: 'button', disabled: !b.running, onclick: () => stopBatch('Detenido por el usuario (resultados parciales).') }, 'Detener'),
      b.results && !b.running ? h('button', { class: 'btn', id: 'sim-batch-download', type: 'button', onclick: () => { const rs = b.results.filter(Boolean); dl(`beM-sim-lote-resumen-${st.ctx.sp.fingerprint}.json`, JSON.stringify({ model: SIM_MODEL, version: SIM_VERSION, profile: st.ctx.sp.id, profileFingerprint: st.ctx.sp.fingerprint, cases: rs.length, valid: rs.filter((x) => x.valid).length, wallMs: b.ms, workers: b.workers, results: rs }, null, 1)); } }, 'Descargar resumen') : null),
    h('p', {}, h('progress', { id: 'sim-batch-progress', value: b.done, max: b.total, style: 'width:100%' })), h('p', { class: 'small', id: 'sim-batch-text' }, batchText()),
    b.msg ? h('p', { class: 'small', id: 'sim-batch-msg' }, b.msg) : null,
    b.results && !b.running ? h('p', { class: 'small' }, `Resultado: ${b.valid} válidos de ${b.done}; tiempo de pared ${(b.ms / 1000).toFixed(2)} s con ${b.workers} worker(s) (incluye arranque de los workers y la compilación inicial en el navegador; la medición oficial de coste se hace con scripts/sim01-bench.js).`) : null));
  if (b.results && !b.running) { const rs = b.results.filter(Boolean); const sample = rs.slice(0, 20); root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Primeros 20 casos'), table(['Caso', 'Cruce', 'Marcador', 'Prórrogas', 'Válido', 'Huella'], sample.map((x) => [x.id, `${x.a}–${x.b}`, x.score ? x.score.join('–') : '—', x.overtimes ?? '—', x.valid ? 'sí' : 'NO', x.fp ?? '—'])))); }
}

// ------------------------------------------------------------------------------------------------------------------------------ montaje
let rootEl = null;
export const SIM_TABS = [['match', 'Partido'], ['params', 'Parámetros'], ['batch', 'Lote']];
export function renderSim(root) {
  rootEl = root; clear(root);
  try { if (st.sub === 'match') matchView(root); else if (st.sub === 'params') paramsView(root); else batchView(root); const pb = document.getElementById('profile-badge'); if (pb) pb.textContent = `perfil SIM ${st.ctx.sp.id}${st.overrides.length ? ' (candidata)' : ''} · huella ${st.ctx.sp.fingerprint} · datos ${detailed().population.version}`; } catch (e) { root.append(h('div', { class: 'card' }, h('p', { style: 'color:var(--bad)' }, `Error del motor ultrarrápido: ${e.message ?? e}`))); }
}
// El repintado se difiere un turno: un `change` disparado por el desenfoque de un campo no debe reentrar en la limpieza del contenedor.
let pending = false;
function render() { if (!rootEl || pending) return; pending = true; setTimeout(() => { pending = false; if (rootEl) renderSim(rootEl); }, 0); }
export function simHeaderLine() { return `Motor ultrarrápido · ${SIM_MODEL} ${SIM_VERSION} · resultado ${SIM_RESULT_SCHEMA}`; }
export const simSetSub = (s) => { st.sub = s; };
