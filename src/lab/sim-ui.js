// Laboratorio del «Motor ultrarrápido» (SIM-MOTOR-01): generador estadístico por tramos. Tres vistas: Partido (equipos EQ01–EQ12, planes, semilla, resultado y descargas),
// Parámetros (perfil SIM editable por secciones con procedencia) y Lote (agenda congelada de 1.000 en Web Workers, con progreso y resumen descargable).
// Estado propio, separado del motor detallado: no modifica fichas, planes, perfiles ni escenarios guardados; usa la referencia detallada base (store.baseNew) solo como procedencia de datos.
import { h, clear, table } from './dom.js';
import { store } from './store.js';
import { makeContext, contextToJSON, SimMatch, buildSimResult, SIM_MODEL, SIM_RESULT_SCHEMA, SIM_VERSION } from '../sim/index.js';
import { snapshotSim } from '../sim/snapshot.js';
import { analysisCards, learningCard, rebuildFrom, dl as dlx } from './sim-analysis-ui.js';
import { makeLearningCopy, teamStatesOf, nextMatchId, newLedgers } from './learning-model.js';
import { ConsequenceLedger } from '../sim/consequences.js';
import { playAutomatic } from '../sim/coachsim.js';
import { dayView } from './sim-day-ui.js';
import { seasonView } from './sim-season-ui.js';
import { pbatchView } from './sim-pbatch-ui.js';
import { referenceTeamMap, buildPairInput } from '../sim/teams.js';
import { applyOverrides, validateOverrides, diffProfile, profileSections } from '../sim/profile.js';
import { buildAgenda, TEAM_IDS } from '../sim/schedule.js';
import { CONTROL_ROWS } from '../sim/controls.js';

const pill = (t, c = '') => h('span', { class: `pill ${c}` }, t);
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const pct = (a, b) => (b > 0 ? `${((100 * a) / b).toFixed(1)} %` : '—');
const dl = (name, text, type = 'application/json') => { const url = URL.createObjectURL(new Blob([text], { type })); const l = h('a', { href: url, download: name }); document.body.append(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };

export const simState = {
  sub: 'match', teamA: 'EQ01', teamB: 'EQ02', seed: 20261022, input: null, overrides: [], result: null, resultInput: null, firstFp: null, repeatNote: null, ctxKey: null, ctx: null, teams: null,
  audience: 'diagnostic', team: 0, at: 'end', view: 'resumen', match: null, learn: null, useCopy: false, day: null, season: null, pb: null, edit: { filter: '', section: 'all', draft: {} }, batch: { running: false, done: 0, total: 1000, valid: 0, failed: 0, ms: 0, results: null, workers: 0, msg: null, started: 0 }, error: null,
};
const st = simState;
const detailed = () => store.baseNew;
function ensure() {
  const key = JSON.stringify(st.overrides);
  if (!st.ctx || st.ctxKey !== key) { st.ctx = makeContext(detailed(), st.overrides.length ? st.overrides : null); st.ctxKey = key; }
  if (!st.teams) st.teams = referenceTeamMap(detailed(), store.players);
  if (!st.input) st.input = buildPairInput(st.teams, st.teamA, st.teamB, { seed: st.seed });
}
const resetInput = () => { st.input = null; st.result = null; st.match = null; st.repeatNote = null; st.firstFp = null; };

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
    h('details', { class: 'small' }, h('summary', {}, `Resumen del plan: ${plan.playbook.length} fichas, titulares, roles y estado`),
      table(['Ficha', 'Nombre', 'Familia', 'Prioridad (1 = más)'], plan.playbook.map((e) => { const pl = st.ctx.T.plays[e.playId]; return [e.playId, pl.name, pl.family, e.priority]; })),
      table(['Puesto', 'Titular', 'Rol ofensivo', 'Rol defensivo', 'Energía', 'Forma', 'M-TIR/OFE/DEF'], Object.entries(plan.starters).map(([slot, id]) => { const p = t.players.find((x) => x.id === id); return [slot, id, `${p.offensiveRole?.code ?? '—'} ${p.offensiveRole?.name ?? ''}`, `${p.defensiveRole?.code ?? '—'} ${p.defensiveRole?.name ?? ''}`, p.state.energy, p.state.form ?? 0, `${p.state.M_TIR ?? 0}/${p.state.M_OFE ?? 0}/${p.state.M_DEF ?? 0}`]; }), { numeric: [4, 5] })),
    h('p', { class: 'small muted' }, 'Sin efecto aparente en SIM (exclusivos del detallado): marcas, navegación, especiales defensivas, saques y roles; se aceptan en la entrada y se declaran como ignorados.'));
}
function generate() {
  try {
    ensure(); let input = st.input; let matchId = `LABSIM-${input.teams[0].id}-${input.teams[1].id}-${input.seed}`;
    // copia de aprendizaje sintética (opcional): conocimiento explícito y rasgos de aprendizaje en una COPIA; la entrada de preparación no se toca
    if (st.useCopy) { const P = detailed().familiarity; if (!st.learn || st.learn.baseKey !== JSON.stringify([input.teams.map((t) => t.id), input.seed])) { const copy = makeLearningCopy(input, detailed(), { mode: 'synthetic', day: 0, id: `LEARN18-S-${input.teams.map((t) => t.id).join('-')}-d0-I${(st.learn?.instanceSeq ?? 0) + 1}`, instanceSeq: (st.learn?.instanceSeq ?? 0) + 1 }); const { states } = teamStatesOf(copy.input, P, 0); st.learn = { copy, states, ledgers: newLedgers(copy.input), cons: new ConsequenceLedger(), matchSeq: 0, instanceSeq: copy.instanceSeq, baseKey: JSON.stringify([input.teams.map((t) => t.id), input.seed]) }; } matchId = nextMatchId(st.learn); st.learn.copy.input.labMatchId = matchId; input = st.learn.copy.input; } else st.learn = null;
    const m = new SimMatch(input, st.ctx, { matchId, attemptId: 1 }); playAutomatic(m); st.match = m; st.matchInput = JSON.stringify(input);
    const res = rebuildFrom(m, st);
    st.repeatNote = st.firstFp && st.resultInput === JSON.stringify(input) ? (st.firstFp === res.sportFingerprint ? { ok: true, text: `Repetición con la misma entrada: huella idéntica (${res.sportFingerprint}).` } : { ok: false, text: `HUELLA DISTINTA: ${st.firstFp} → ${res.sportFingerprint}` }) : null;
    st.firstFp = res.sportFingerprint; st.resultInput = JSON.stringify(input); st.result = res; st.error = null;
  } catch (e) { st.error = e.validation ? e.validation.map((v) => `${v.path}: ${v.message}`).join('; ') : String(e.message ?? e); }
  render();
}
function resultCards(res0) {
  // el resultado se reconstruye desde los hechos del encuentro vivo según audiencia y horizonte (leer no consume azar ni cambia la publicación)
  const res = st.match ? rebuildFrom(st.match, st) : res0; st.result = res;
  const extra = [h('button', { class: 'btn', id: 'sim-dl-input', type: 'button', onclick: () => dlx(`beM-sim-entrada-${res.identity.seed}.json`, JSON.stringify({ input: JSON.parse(st.matchInput ?? st.resultInput), simProfile: { id: st.ctx.sp.id, fingerprint: st.ctx.sp.fingerprint, overrides: st.overrides } })) }, 'Entrada y perfil'),
    h('button', { class: 'btn', id: 'sim-dl-result', type: 'button', onclick: () => dlx(`beM-sim-resultado-${res.identity.seed}.json`, JSON.stringify(res)) }, 'Resultado'),
    h('button', { class: 'btn', id: 'sim-dl-recon', type: 'button', onclick: () => dlx(`beM-sim-conciliacion-${res.identity.seed}.json`, JSON.stringify(res.reconciliation ?? null, null, 1)) }, 'Conciliación'),
    st.match ? h('button', { class: 'btn', id: 'sim-dl-snap', type: 'button', onclick: () => dlx(`beM-sim-guardado-${res.identity.seed}.json`, JSON.stringify(snapshotSim(st.match))) }, 'Guardado (continuable)') : null];
  const cards = analysisCards(res, { st, repaint: () => render(), extra });
  cards.push(learningCard(res, st, () => render(), detailed()));
  return cards;
}
function matchView(root) {
  ensure(); const opts = TEAM_IDS.map((id) => h('option', { value: id }, `${id} · ${detailed().population.teams[id].identity}`));
  const pick = (key, label) => h('label', {}, `${label} `, h('select', { id: `sim-${key}`, onchange: (e) => { st[key] = e.target.value; resetInput(); render(); } }, opts.map((o) => { const c = o.cloneNode(true); if (c.value === st[key]) c.selected = true; return c; })));
  root.append(h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'Partido con el motor ultrarrápido'),
    h('p', { class: 'small muted' }, 'Generador estadístico por tramos (SIM-MOTOR). Genera un partido completo sin ejecutar el motor detallado. Calidad estadística aún sin validar frente al detallado ni a competiciones reales.'),
    h('div', { class: 'row' }, pick('teamA', 'Equipo A'), pick('teamB', 'Equipo B'),
      h('label', {}, 'Semilla ', h('input', { type: 'number', id: 'sim-seed', class: 'wide', value: st.seed, onchange: (e) => { st.seed = Number(e.target.value); resetInput(); render(); } })),
      h('label', { class: 'small', title: 'Genera el partido con conocimiento explícito (historia sintética SEM18) en una copia; no cambia la preparación' }, h('input', { type: 'checkbox', id: 'sim-learn-copy', checked: st.useCopy, onchange: (e) => { st.useCopy = e.target.checked; render(); } }), ' copia de aprendizaje sintética'),
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
export const SIM_TABS = [['match', 'Partido'], ['params', 'Parámetros'], ['batch', 'Lote'], ['pbatch', 'Lotes persistentes'], ['day', 'Jornada'], ['season', 'Temporadas']];
export function renderSim(root) {
  rootEl = root; clear(root);
  try { if (st.sub === 'match') matchView(root); else if (st.sub === 'params') paramsView(root); else if (st.sub === 'batch') batchView(root); else if (st.sub === 'pbatch') pbatchView(root, { st, detailed, ensure, render }); else if (st.sub === 'day') dayView(root, { st, detailed, ensure, render, store, resultCards }); else seasonView(root, { st, detailed, ensure, render, store }); const pb = document.getElementById('profile-badge'); if (pb) pb.textContent = `perfil SIM ${st.ctx.sp.id}${st.overrides.length ? ' (candidata)' : ''} · huella ${st.ctx.sp.fingerprint} · datos ${detailed().population.version}`; } catch (e) { root.append(h('div', { class: 'card' }, h('p', { style: 'color:var(--bad)' }, `Error del motor ultrarrápido: ${e.message ?? e}`))); }
}
// El repintado se difiere un turno: un `change` disparado por el desenfoque de un campo no debe reentrar en la limpieza del contenedor.
let pending = false;
function render() { if (!rootEl || pending) return; pending = true; setTimeout(() => { pending = false; if (rootEl) renderSim(rootEl); }, 0); }
export function simHeaderLine() { return `Motor ultrarrápido · ${SIM_MODEL} ${SIM_VERSION} · resultado ${SIM_RESULT_SCHEMA}`; }
export const simSetSub = (s) => { st.sub = s; };
