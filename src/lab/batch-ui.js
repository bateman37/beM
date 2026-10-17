// Pestaña «Lotes» (MOTOR-12 §18): preparar repeticiones o cruces con variantes y semillas congeladas, ver la agenda y el total real antes de iniciar, seguir el progreso, detener al terminar el
// partido en curso, continuar, consultar resultados/agregados/comparación, abrir el análisis de cada partido y descargar el paquete completo de análisis (ZIP). El navegador solo DEFINE y CONSULTA:
// el servidor local congela, ejecuta en un hilo de trabajo y conserva progresivamente en `out/batches/`. Preparar o iniciar un lote no altera perfiles, plantillas ni escenarios guardados.
import { h, table } from './dom.js';
import { store, refTeam, logicalTeam, popProfile } from './store.js';
import { REFERENCE_IDS, labCatalog } from '../population/index.js';
import { MODES, VENUES, RECORD_LEVELS, LOCALIA_NOTE, batchDefaults, planCounts, normalizeSpec } from '../batch/schedule.js';
import { CHATGPT_GUIDE } from '../batch/docs.js';
import { QUANTILE_CONVENTION } from '../batch/aggregate.js';

const API = '/api/batch';
const pill = (t, c = '') => h('span', { class: `pill ${c}` }, t);
const fmt = (x, d = 2) => (x == null || x === '' ? '—' : Number(x).toFixed(d));
const mb = (n) => (n == null ? '—' : `${(n / 1048576).toFixed(2)} MiB`);
const ms = (n) => (n == null ? '—' : n < 1000 ? `${Math.round(n)} ms` : `${(n / 1000).toFixed(1)} s`);
const STATE_CLS = { completado: 'ok', ejecutandose: 'warn', detencion_solicitada: 'warn', detenido: '', interrumpido: 'bad', preparado: '' };
const STATE_TEXT = { preparado: 'Preparado', ejecutandose: 'Ejecutándose', detencion_solicitada: 'Detención solicitada (termina el partido en curso)', detenido: 'Detenido', completado: 'Completado', interrumpido: 'Interrumpido' };

const ui = { pkgKey: null, root: null, spec: null, prep: null, msg: null, batchId: null, status: null, timer: null, filters: { team: '', variant: '', valid: '', state: '', q: '' }, agg: null, aggTeam: '*', list: [], pkg: null, busy: false, matchInfo: null };
const batchProfile = () => (store.profile?.batch ? store.profile : store.baseNew);

function defaults() {
  const d = batchDefaults(batchProfile());
  return { mode: 'repeat', teamA: 'EQ01H', teamB: 'EQ02H', cross: ['EQ04', 'EQ05', 'EQ06'], pairs: [], pairA: 'EQ04', pairB: 'EQ05', selfPlay: false, repetitions: d.shortcuts[0], venue: 'fixed', batchSeed: 20261017, objective: '', question: '', level: d.level, prose: d.prose, partTargetMiB: d.partTargetMiB, importance: 'ordinary',
    source: 'teams', labScenario: null, labVariants: [], variants: [{ id: 'V0', label: 'Base', ops: [] }, { id: 'V1', label: 'Candidata', ops: [{ op: 'ability', team: '*', player: 'director', attrs: ['TEC08'], delta: 3 }] }] };
}
function teamOptions() {
  const pop = popProfile().population;
  return [...REFERENCE_IDS.map((id) => ({ key: id, label: `${id} · ${pop.teams[id].identity} (plan natural)` })), ...['EQ01', 'EQ02'].map((id) => ({ key: `${id}H`, label: `${id} · plan histórico de MOTOR-10 (R0)` })), ...store.pop.teams().map((r) => ({ key: r.id, label: `${r.id} · ${r.name ?? ''} (guardado/generado)` }))];
}
const makeTeam = (key) => (/^EQ0[12]H$/.test(key) ? refTeam(key.slice(0, 4), { revision: 'R0', planKind: 'historical' }) : REFERENCE_IDS.includes(key) ? refTeam(key) : logicalTeam(key));

function buildSpec() {
  const s = ui.spec; const spec = { mode: s.mode, repetitions: Number(s.repetitions), venue: s.venue, batchSeed: Number(s.batchSeed), objective: s.objective, question: s.question || null, recordLevel: s.level, prose: s.prose, partTargetMiB: Number(s.partTargetMiB), importance: s.importance, selfPlay: s.selfPlay, variants: s.variants.map((v) => ({ id: v.id, label: v.label, ops: v.ops, ...(v.lab ? { lab: v.lab } : {}) })), teams: {} };
  const used = new Set();
  if (s.source === 'lab') { spec.source = { kind: 'lab', scenario: s.labScenario }; spec.mode = 'repeat'; spec.venue = 'fixed'; spec.variants = s.labVariants.map((vid, i) => ({ id: `V${i}`, label: vid, ops: [], lab: vid })); }
  else if (s.mode === 'repeat') { spec.teamIds = [s.teamA, s.teamB]; used.add(s.teamA); used.add(s.teamB); }
  else if (s.mode === 'cross') { spec.teamIds = [...s.cross]; s.cross.forEach((k) => used.add(k)); }
  else { spec.pairs = s.pairs.map((p) => [...p]); s.pairs.flat().forEach((k) => used.add(k)); }
  for (const k of used) spec.teams[k] = makeTeam(k);
  return spec;
}
async function api(path, opts = {}) { const r = await fetch(`${API}/${path}`, { ...opts, headers: { 'Content-Type': 'application/json' } }); const text = await r.text(); let body; try { body = JSON.parse(text); } catch { body = { ok: false, reason: text }; } return { status: r.status, ok: r.ok, body, headers: r.headers }; }
const post = (path, data) => api(path, { method: 'POST', body: JSON.stringify(data ?? {}) });

export function renderBatch(root) {
  ui.root = root; ui.spec ??= defaults(); stopPoll();
  repaint();
  api('list').then((r) => {
    ui.list = r.body.batches ?? [];
    const live = ui.list.find((b) => ['ejecutandose', 'detencion_solicitada'].includes(b.state));
    if (ui.batchId == null && live) ui.batchId = live.batch_id;
    if (ui.batchId) refresh(); else repaint();
  }).catch(() => { ui.msg = 'El servicio de lotes no responde: arranca el laboratorio con «npm run dev» (los lotes se ejecutan en el servidor local).'; repaint(); });
}
let painting = false;
// Repintado a prueba de reentrada: un `change` pendiente se dispara al quitar un campo enfocado (blur) y volvería a repintar en mitad del repintado.
function repaint() {
  const root = ui.root; if (!root || painting) return; painting = true; const y = window.scrollY;
  try { paint(root); } finally { painting = false; }
  window.scrollTo(0, y);
}
function paint(root) {
  root.replaceChildren();
  root.append(h('h2', {}, 'Lotes: simulación masiva y extracción completa'),
    h('p', { class: 'small muted' }, 'Recorrido: plantillas/variantes → preparar experimento → revisar agenda y entradas → ejecutar lote → resultados y comparación → abrir partido/análisis → descargar el paquete completo. Mismo núcleo y mismas reglas que un partido ordinario: no hay simulador rápido. Los lotes se ejecutan y se conservan en el servidor local (directorio excluido de Git).'));
  const active = !!store.profile?.batch; const eff = batchProfile();
  root.append(h('p', { class: 'small muted', id: 'batch-profile' }, `Perfil con el que se congelará el lote: ${eff.effectiveId?.split('+').slice(-3).join('+')} — ${active ? 'el perfil activo' : 'la base de MOTOR-12 (el perfil activo es anterior y no incluye la tabla de lotes; actívala en Panel › Inicio si quieres que sea el activo)'}. Se congela una copia COMPLETA: cambiar o activar otro perfil después no altera el lote.`));
  if (ui.msg) root.append(h('div', { class: 'card', id: 'batch-msg', role: 'status' }, ui.msg));
  root.append(prepCard(), listCard());
  if (ui.batchId && ui.status) root.append(progressCard(), resultsCard(), aggregatesCard(), downloadCard());
}
const rerender = repaint;

// ------------------------------------------------------------------------------------------------------------------------------ preparar
function numInput(key, label, extra = {}) { return h('label', { class: 'small' }, `${label} `, h('input', { type: 'number', id: `b-${key}`, class: 'wide', value: ui.spec[key], 'aria-label': label, ...extra, onchange: (e) => { ui.spec[key] = e.target.value === '' ? '' : Number(e.target.value); ui.prep = null; rerender(); } })); }
function selInput(key, label, options, id = null) { return h('label', { class: 'small' }, `${label} `, h('select', { id: id ?? `b-${key}`, 'aria-label': label, onchange: (e) => { ui.spec[key] = e.target.value; ui.prep = null; rerender(); } }, options.map(([v, t]) => h('option', { value: v, selected: String(ui.spec[key]) === String(v) }, t)))); }
function teamSelect(key, label) { return selInput(key, label, teamOptions().map((o) => [o.key, o.label])); }

function prepCard() {
  const s = ui.spec; const d = batchDefaults(batchProfile()); const labCat = labCatalog(popProfile()).filter((x) => !x.fromNaturalPlans);
  const sc = labCat.find((x) => x.id === s.labScenario);
  const lab = s.source === 'lab';
  const mode = h('div', { class: 'row' }, ...Object.entries(MODES).map(([k, t]) => h('label', { class: 'small' }, h('input', { type: 'radio', name: 'b-mode', value: k, checked: s.mode === k && !lab, disabled: lab, onchange: () => { s.mode = k; ui.prep = null; rerender(); } }), ` ${t}`)));
  const teamsUi = lab ? h('div', {}, h('div', { class: 'row' }, selInput('labScenario', 'Escenario LAB11', [['', '— elige —'], ...labCat.map((x) => [x.id, `${x.id} · ${x.name}`])]), h('span', { class: 'small muted' }, 'La base y la candidata son variantes del escenario; el emparejamiento y las diferencias vienen del escenario.')),
    sc ? h('div', { class: 'row small' }, 'Variantes a ejecutar (la primera es la base): ', sc.variants.map((v) => h('label', {}, h('input', { type: 'checkbox', checked: s.labVariants.includes(v.id), onchange: (e) => { s.labVariants = e.target.checked ? [...s.labVariants, v.id] : s.labVariants.filter((x) => x !== v.id); ui.prep = null; rerender(); } }), ` ${v.label} `))) : null)
    : s.mode === 'repeat' ? h('div', { class: 'row' }, teamSelect('teamA', 'Equipo A'), teamSelect('teamB', 'Equipo B'), h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: s.selfPlay, onchange: (e) => { s.selfPlay = e.target.checked; ui.prep = null; rerender(); } }), ' permitir el mismo equipo contra sí mismo (dos instancias)'))
      : s.mode === 'cross' ? h('div', {}, h('p', { class: 'small muted' }, 'Selecciona los equipos: se juegan todos los pares distintos (sin repetir; sin autoenfrentamiento salvo marcarlo).'), h('div', { class: 'attrgrid' }, teamOptions().map((o) => h('label', { class: 'attr' }, h('input', { type: 'checkbox', checked: s.cross.includes(o.key), onchange: (e) => { s.cross = e.target.checked ? [...s.cross, o.key] : s.cross.filter((x) => x !== o.key); ui.prep = null; rerender(); } }), ` ${o.label}`))), h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: s.selfPlay, onchange: (e) => { s.selfPlay = e.target.checked; ui.prep = null; rerender(); } }), ' incluir autoenfrentamiento explícito'))
        : h('div', {}, h('div', { class: 'row' }, teamSelect('pairA', 'Equipo A'), teamSelect('pairB', 'Equipo B'), h('button', { class: 'btn secondary', type: 'button', id: 'b-addpair', onclick: () => { s.pairs.push([s.pairA, s.pairB]); ui.prep = null; rerender(); } }, 'Añadir par')), s.pairs.length ? h('ul', { class: 'small' }, s.pairs.map((p, i) => h('li', {}, `${p[0]} – ${p[1]} `, h('button', { class: 'link', type: 'button', onclick: () => { s.pairs.splice(i, 1); ui.prep = null; rerender(); } }, 'quitar')))) : h('p', { class: 'small muted' }, 'Ningún par elegido.'));
  const variantsUi = lab ? null : h('div', {}, h('h3', {}, 'Variantes: base y candidatas'), h('p', { class: 'small muted' }, 'La base no cambia nada. Cada candidata lista exactamente lo que cambia (+/− puntos absolutos sobre capacidades de jugadores elegidos de antemano: la selección no depende de lo que ocurra en el partido). Los equipos, planes y la lista de semillas se conservan.'),
    s.variants.map((v, i) => variantRow(v, i)), h('button', { class: 'btn secondary', type: 'button', id: 'b-addvariant', onclick: () => { s.variants.push({ id: `V${s.variants.length}`, label: `Candidata ${s.variants.length}`, ops: [{ op: 'ability', team: '*', player: 'director', attrs: ['TEC08'], delta: 3 }] }); ui.prep = null; rerender(); } }, 'Añadir candidata'));
  const counts = (() => { try { return planCounts(normalizeSpec(buildSpecSafe(), batchProfile())); } catch { return null; } })();
  return h('div', { class: 'card', id: 'batch-prep' }, h('h3', { style: 'margin-top:0' }, '1 · Preparar el experimento'),
    h('label', { class: 'small' }, 'Objetivo / pregunta ', h('input', { type: 'text', id: 'b-objective', style: 'width:min(720px,95%)', value: s.objective, placeholder: `${d.objective} (precarga si lo dejas vacío)`, onchange: (e) => { s.objective = e.target.value; ui.prep = null; } })),
    h('div', { class: 'row', style: 'margin-top:8px' }, h('label', { class: 'small' }, h('input', { type: 'radio', name: 'b-src', checked: !lab, onchange: () => { s.source = 'teams'; ui.prep = null; rerender(); } }), ' Equipos elegidos'), h('label', { class: 'small' }, h('input', { type: 'radio', name: 'b-src', checked: lab, onchange: () => { s.source = 'lab'; s.labScenario ??= ''; ui.prep = null; rerender(); } }), ' Base/variante desde un escenario LAB11')),
    h('div', { style: 'margin-top:6px' }, mode), teamsUi,
    h('div', { class: 'row', style: 'margin-top:10px' }, h('strong', { class: 'small' }, 'Repeticiones por enfrentamiento y por variante: '), ...d.shortcuts.map((n) => h('button', { class: `btn ${Number(s.repetitions) === n ? '' : 'secondary'}`, type: 'button', id: `b-rep-${n}`, onclick: () => { s.repetitions = n; ui.prep = null; rerender(); } }, String(n))), numInput('repetitions', 'cantidad editable', { min: 1, step: 1 })),
    h('div', { class: 'row', style: 'margin-top:8px' }, lab ? null : selInput('venue', 'Localía', Object.entries(VENUES)), numInput('batchSeed', 'Semilla de lote', { min: 0, max: 4294967295 }), selInput('level', 'Nivel de registro', Object.entries(RECORD_LEVELS)), selInput('prose', 'Prosa', [['omitted', 'omitida (hechos y estadística conservados)'], ['included', 'incluida (un relato por partido)']]), numInput('partTargetMiB', 'Objetivo de parte (MiB sin comprimir)', { min: 1 })),
    h('p', { class: 'small muted' }, `Semilla de GENERACIÓN (población de cada equipo generado: se materializa una vez al preparar), semilla de LOTE (la que ves aquí: deriva la lista) y semilla DEPORTIVA de cada caso (la consume el partido) son tres cosas distintas. El nivel «diagnóstico completo» captura desde el inicio; uno reducido no puede prometer después lo que no guardó. ${s.venue !== 'fixed' && !lab ? LOCALIA_NOTE : ''}`),
    variantsUi,
    counts ? h('p', { class: 'small', id: 'b-counts' }, h('strong', {}, 'Cantidades: '), counts.explain) : null,
    h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn secondary', type: 'button', id: 'b-preview', disabled: ui.busy, onclick: preview }, 'Revisar agenda y entradas'), h('button', { class: 'btn', type: 'button', id: 'b-start', disabled: !ui.prep?.ok || ui.busy, onclick: start }, 'Iniciar lote')),
    ui.prep ? previewBlock(ui.prep) : null);
}
function buildSpecSafe() { try { return buildSpec(); } catch { return { mode: ui.spec.mode, teamIds: [], pairs: [], repetitions: ui.spec.repetitions, venue: ui.spec.venue, variants: ui.spec.variants }; } }

function variantRow(v, i) {
  const op = v.ops[0] ?? null; const base = i === 0;
  return h('div', { class: 'card', style: 'margin:6px 0' }, h('div', { class: 'row' }, pill(v.id), h('input', { type: 'text', 'aria-label': `nombre de ${v.id}`, value: v.label, onchange: (e) => { v.label = e.target.value; ui.prep = null; } }), base ? pill('base: no cambia nada', 'ok') : h('button', { class: 'link', type: 'button', onclick: () => { ui.spec.variants.splice(i, 1); ui.spec.variants.forEach((x, k) => { x.id = `V${k}`; }); ui.prep = null; rerender(); } }, 'quitar')),
    base ? null : h('div', { class: 'row small' }, 'Sumar ', h('input', { type: 'number', step: 'any', class: 'wide', 'aria-label': `delta de ${v.id}`, value: op?.delta ?? 3, onchange: (e) => { v.ops = [{ ...(v.ops[0] ?? { op: 'ability', team: '*', player: 'director', attrs: ['TEC08'] }), delta: Number(e.target.value) }]; ui.prep = null; rerender(); } }), ' puntos a ',
      h('select', { 'aria-label': `capacidades de ${v.id}`, multiple: true, size: 5, onchange: (e) => { v.ops = [{ ...(v.ops[0] ?? { op: 'ability', team: '*', player: 'director', delta: 3 }), attrs: [...e.target.selectedOptions].map((o) => o.value) }]; ui.prep = null; rerender(); } }, Object.entries(store.labels).map(([id, label]) => h('option', { value: id, selected: op?.attrs?.includes(id) }, `${id} ${label}`))),
      ' de ', h('select', { 'aria-label': `jugadores de ${v.id}`, onchange: (e) => { v.ops = [{ ...v.ops[0], player: e.target.value }]; ui.prep = null; rerender(); } }, [['director', 'los directores'], ['starters', 'los titulares'], ['all', 'toda la plantilla']].map(([k, t]) => h('option', { value: k, selected: op?.player === k }, t))),
      ' del ', h('select', { 'aria-label': `equipo de ${v.id}`, onchange: (e) => { v.ops = [{ ...v.ops[0], team: e.target.value }]; ui.prep = null; rerender(); } }, [['*', 'ambos equipos'], ['A', 'equipo A del par'], ['B', 'equipo B del par']].map(([k, t]) => h('option', { value: k, selected: op?.team === k }, t))), h('span', { class: 'muted' }, ' (la saturación a 1–30 queda visible en las diferencias)')));
}

function previewBlock(p) {
  if (!p.ok) return h('div', { class: 'errbox', id: 'b-problems' }, h('strong', {}, 'No se puede iniciar: '), h('ul', {}, p.problems.map((x) => h('li', {}, x))));
  const a = p.agenda;
  return h('div', { id: 'b-preview-out' }, h('p', { class: 'small' }, pill('agenda congelable', 'ok'), ` ${p.counts.explain}. Entradas distintas validadas: ${p.distinctEntries}. Huella de agenda ${p.agendaFp}.`),
    p.warnings?.length ? h('ul', { class: 'small' }, p.warnings.map((w) => h('li', {}, w))) : null,
    h('p', { class: 'small muted' }, `Semillas deportivas por adelantado (${a.seeds.derivation}, semilla de lote ${a.seeds.batchSeed}): ${a.seeds.count} semillas, ${a.seeds.collisions} colisión(es) resuelta(s). ${a.seeds.procedure}`),
    Object.entries(p.variantChanges ?? {}).map(([vid, ch]) => h('div', {}, h('strong', { class: 'small' }, `Diferencias exactas de ${vid} respecto a la base (primer enfrentamiento): `), ch.length ? table(['Sujeto', 'Campo', 'Antes', 'Después'], ch.map((c) => [c.jugador ?? c.equipo, c.campo, String(c.antes), `${c.despues}${c.saturada ? ' (saturada)' : ''}`])) : h('span', { class: 'small muted' }, 'ninguna (base)'))),
    h('div', { class: 'scroll', style: 'max-height:260px' }, table(['Ordinal', 'Caso', 'Variante', 'Par', 'Rep.', 'Lado', 'Local', 'Visitante', 'Semilla deportiva'], a.executions.map((e) => [e.ordinal, e.case_id, e.variant_id, e.pair_id, e.repetition, e.side, e.home_ref, e.away_ref, e.seed]), { numeric: [0, 4, 8] })), a.truncated ? h('p', { class: 'small muted' }, `Se muestran las primeras ${a.executions.length} de ${p.counts.executions}; la agenda completa se congela y viaja en entradas/lote.json.`) : null);
}
async function preview() {
  ui.busy = true; ui.msg = null; rerender();
  try { const spec = buildSpec(); const r = await post('prepare', { spec, profile: batchProfile() }); ui.prep = r.body; } catch (e) { ui.msg = `No se pudo preparar: ${e.message}`; }
  ui.busy = false; rerender();
}
async function start() {
  ui.busy = true; rerender();
  try {
    const spec = buildSpec(); const r = await post('create', { spec, profile: batchProfile(), label: spec.objective.slice(0, 60) || null });
    if (!r.ok) ui.prep = { ok: false, problems: r.body.problems ?? [r.body.reason] };
    else { ui.batchId = r.body.batchId; ui.msg = `Lote ${ui.batchId} congelado e iniciado: ${r.body.counts.explain}.`; ui.pkg = null; ui.agg = null; await refresh(); }
  } catch (e) { ui.msg = `No se pudo iniciar: ${e.message}`; }
  ui.busy = false; rerender();
}

// ------------------------------------------------------------------------------------------------------------------------------ lotes anteriores
function listCard() {
  if (!ui.list.length) return null;
  return h('div', { class: 'card', id: 'batch-list' }, h('h3', { style: 'margin-top:0' }, `Lotes en el servidor local (${ui.list.length})`), h('p', { class: 'small muted' }, 'Si cierras el navegador con un lote en marcha, el servidor lo sigue ejecutando: vuelve aquí y ábrelo.'),
    table(['Lote', 'Estado', 'Solicitadas', 'Terminadas', 'Válidas', 'Fallidas', 'Pendientes', 'Objetivo', ''], ui.list.map((b) => [b.batch_id, pill(STATE_TEXT[b.state] ?? b.state, STATE_CLS[b.state] ?? ''), b.counters?.solicitados ?? '', b.counters?.terminados ?? '', b.counters?.validos ?? '', b.counters?.fallidos ?? '', (b.counters?.pendientes ?? 0) + (b.counters?.en_curso ?? 0), (b.objective ?? '').slice(0, 60), h('button', { class: 'link', type: 'button', onclick: () => { ui.batchId = b.batch_id; ui.pkg = null; ui.agg = null; refresh(); } }, 'abrir')]), { numeric: [2, 3, 4, 5, 6] }));
}

// ------------------------------------------------------------------------------------------------------------------------------ progreso
function stopPoll() { if (ui.timer) { clearTimeout(ui.timer); ui.timer = null; } }
async function refresh() {
  stopPoll(); if (!ui.batchId) return;
  try {
    // Progreso ligero cada ciclo; la tabla de ejecuciones (puede ser grande) solo se pide cuando cambia algo (un encuentro confirmado, otro estado) o aún no se tiene.
    const light = await api(`${ui.batchId}/status`);
    if (!light.ok) { ui.msg = light.body.reason; ui.status = null; }
    else {
      const key = (x) => JSON.stringify([x.state, x.counters, x.current?.match_id ?? null]); const prev = ui.status && ui.status.batch_id === light.body.batch_id ? ui.status : null;
      if (prev?.matches && key(prev) === key(light.body)) ui.status = { ...light.body, matches: prev.matches };
      else { const full = await api(`${ui.batchId}/status?rows=1`); ui.status = full.ok ? full.body : light.body; }
    }
  } catch { ui.msg = 'No se pudo consultar el progreso.'; }
  const list = await api('list').catch(() => null); if (list?.ok) ui.list = list.body.batches ?? [];
  if (ui.pkg && ui.pkgKey !== (ui.status ? JSON.stringify(ui.status.counters) : null)) ui.pkg = null; // el paquete ofrecido describe un estado anterior del lote
  rerender();
  const running = ui.status && ['ejecutandose', 'detencion_solicitada'].includes(ui.status.state);
  if (running) ui.timer = setTimeout(refresh, document.getElementById('batch-progress') ? batchDefaults(batchProfile()).progressMs : 2000);
}
function progressCard() {
  const s = ui.status; const c = s.counters; const done = c.terminados + c.fallidos + c.interrumpidos; const pct = c.solicitados ? Math.round((100 * done) / c.solicitados) : 0; const running = ['ejecutandose', 'detencion_solicitada'].includes(s.state);
  const failedOrInt = s.matches.filter((m) => ['fallida', 'interrumpida'].includes(m.exec_state)).map((m) => m.match_id);
  return h('div', { class: 'card', id: 'batch-progress' }, h('h3', { style: 'margin-top:0' }, `2 · Progreso y control · ${s.batch_id}`),
    h('div', { class: 'row' }, pill(STATE_TEXT[s.state] ?? s.state, STATE_CLS[s.state] ?? ''), s.state_reason ? h('span', { class: 'small muted' }, s.state_reason) : null, pill(`registro ${s.config.record_level}`), pill(`partes ${s.config.part_target_mib} MiB`)),
    h('div', { style: 'background:#e6e9f0;border-radius:6px;height:12px;margin:8px 0', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div', { style: `background:#1f5fbf;height:12px;border-radius:6px;width:${pct}%` })),
    h('div', { class: 'row small', id: 'b-counters' }, ...[['Solicitadas', c.solicitados], ['Confirmadas (terminadas)', c.terminados], ['Válidas', c.validos], ['Fallidas', c.fallidos], ['Interrumpidas', c.interrumpidos], ['Pendientes', c.pendientes], ['En curso', c.en_curso], ['Reintentadas', c.reintentados]].map(([k, v]) => h('span', {}, h('strong', {}, `${v} `), k))),
    h('p', { class: 'small muted' }, `Estados primarios (pendiente + en curso + terminada + fallida + interrumpida) = solicitadas${c.reconciled ? ' ✔' : ' ✘'}. «Terminada» no es «válida»: ${c.no_validos_terminados} terminada(s) no concilia(n). Iniciadas: ${c.iniciados} (se solapa con las anteriores).`),
    h('p', { class: 'small' }, s.current ? `Partido actual: ${s.current.match_id} · caso ${s.current.case_id} · ${s.current.variant_id} · ${s.current.pair_id}.` : 'Sin partido en curso.', ` Tiempo transcurrido ${ms(s.elapsed_ms)}${s.eta_ms != null && running ? ` · ETA aproximada ≈ ${ms(s.eta_ms)} (ritmo medio medido ${ms(s.avg_exec_ms)} por partido; es una estimación, no una promesa)` : ''}.`),
    h('div', { class: 'row' }, h('button', { class: 'btn danger', type: 'button', id: 'b-stop', disabled: s.state !== 'ejecutandose', onclick: async () => { await post(`${s.batch_id}/stop`); await refresh(); } }, 'Detener al terminar el partido actual'),
      h('button', { class: 'btn', type: 'button', id: 'b-continue', disabled: running || s.state === 'completado', onclick: async () => { const r = await post(`${s.batch_id}/start`); ui.msg = r.ok ? 'Continuando con los pendientes (mismas entradas y semillas congeladas).' : `No se puede continuar: ${r.body.reason}${r.body.diffs ? ` (${r.body.diffs.join('; ')})` : ''}`; await refresh(); } }, s.state === 'preparado' ? 'Iniciar' : 'Continuar pendientes'),
      h('button', { class: 'btn secondary', type: 'button', id: 'b-retry', disabled: !failedOrInt.length || running, onclick: async () => { const r = await post(`${s.batch_id}/retry`, { matchIds: failedOrInt }); ui.msg = r.ok ? `Reintento explícito de ${failedOrInt.length} ejecución(es) con la misma semilla y nuevo intento.` : `No se pudo reintentar: ${(r.body.problems ?? []).join('; ')}`; await refresh(); } }, `Reintentar fallidas/interrumpidas (${failedOrInt.length})`),
      h('button', { class: 'btn secondary', type: 'button', onclick: refresh }, 'Actualizar')),
    h('p', { class: 'small muted' }, 'Detener no corta el partido a mitad: conserva los terminados y mantiene la agenda pendiente. Si se reinicia el proceso del servidor, el intento en curso queda como interrumpido y se ofrece repetir ese caso desde su inicio congelado (no hay snapshot deportivo para reanudar una posesión).'));
}

// ------------------------------------------------------------------------------------------------------------------------------ resultados
function resultsCard() {
  const s = ui.status; const f = ui.filters; const q = f.q.trim().toLowerCase();
  const teams = [...new Set(s.matches.flatMap((m) => [m.home_source_team_id, m.away_source_team_id]))].sort(); const variants = [...new Set(s.matches.map((m) => m.variant_id))];
  const rows = s.matches.filter((m) => (!f.team || m.home_source_team_id === f.team || m.away_source_team_id === f.team) && (!f.variant || m.variant_id === f.variant) && (!f.state || m.exec_state === f.state) && (f.valid === '' || (f.valid === 'si' ? m.valid : !m.valid && m.exec_state === 'terminada')) && (!q || `${m.match_id} ${m.case_id} ${m.pair_id}`.toLowerCase().includes(q)));
  const sel = (key, label, opts) => h('label', { class: 'small' }, `${label} `, h('select', { 'aria-label': label, onchange: (e) => { f[key] = e.target.value; rerender(); } }, [['', 'todos'], ...opts].map(([v, t]) => h('option', { value: v, selected: f[key] === v }, t))));
  return h('div', { class: 'card', id: 'batch-results' }, h('h3', { style: 'margin-top:0' }, '3 · Resultados por partido'),
    h('div', { class: 'row' }, sel('team', 'Equipo', teams.map((t) => [t, t])), sel('variant', 'Variante', variants.map((v) => [v, v])), sel('state', 'Estado', ['pendiente', 'en_curso', 'terminada', 'fallida', 'interrumpida'].map((x) => [x, x])), sel('valid', 'Validez', [['si', 'válidos'], ['no', 'terminados no válidos']]), h('label', { class: 'small' }, 'Buscar ', h('input', { type: 'search', value: f.q, 'aria-label': 'buscar partido', onchange: (e) => { f.q = e.target.value; rerender(); } }))),
    h('div', { class: 'scroll', style: 'max-height:380px' }, table(['Partido', 'Caso', 'Var.', 'Par', 'Estado', 'Validez', 'Marcador (local–visitante)', 'Semilla', 'Sorteos', 'Tiempo', ''], rows.map((m) => [m.match_id, m.case_id, m.variant_id, m.pair_id, m.exec_state, m.exec_state === 'terminada' ? pill(m.valid ? 'válido' : 'no válido', m.valid ? 'ok' : 'warn') : '', m.exec_state === 'terminada' && m.facts.score_home != null ? `${m.home_team_instance_id} ${m.facts.score_home}–${m.facts.score_away} ${m.away_team_instance_id}` : (m.error ? `sin marcador: ${m.error.message}`.slice(0, 80) : m.exec_state === 'fallida' ? 'sin marcador (fallo)' : '—'), m.seed, m.facts.draws ?? '', ms(m.exec_ms),
      h('span', {}, m.exec_state === 'terminada' ? h('button', { class: 'link', type: 'button', onclick: () => openMatch(m.match_id) }, 'abrir análisis') : null, ['fallida', 'interrumpida'].includes(m.exec_state) || (m.exec_state === 'terminada' && !m.valid) ? h('button', { class: 'link', type: 'button', onclick: () => showIncident(m) }, ' incidencia') : null)]), { numeric: [7, 8] })),
    h('p', { class: 'small muted' }, `${rows.length} de ${s.matches.length} ejecuciones. «Abrir análisis» reproduce el partido desde su entrada congelada (misma semilla y órdenes programadas), comprueba que la huella de trayectoria coincide con la registrada y abre el análisis MOTOR-10; consultar no cambia el partido.`),
    ui.matchInfo ? h('div', { class: 'card', id: 'b-incident', style: 'background:#fffaf0' }, h('strong', {}, `Contexto conservado de ${ui.matchInfo.match.match_id}`), h('pre', { class: 'small', style: 'white-space:pre-wrap' }, JSON.stringify(ui.matchInfo, null, 1).slice(0, 4000)), h('button', { class: 'link', type: 'button', onclick: () => { ui.matchInfo = null; rerender(); } }, 'cerrar')) : null);
}
async function showIncident(m) { const r = await api(`${ui.batchId}/match/${m.match_id}`); ui.matchInfo = r.body; ui.matchInfo.error = m.error; ui.matchInfo.exclusion_reason = m.exclusion_reason; rerender(); }
async function openMatch(mid) {
  ui.msg = `Reproduciendo ${mid} desde su entrada congelada…`; rerender();
  const r = await fetch(`${API}/${ui.batchId}/match/${mid}/export`); const match = r.headers.get('X-Trajectory-Match'); const res = await r.json();
  store.last = res; ui.msg = `Partido ${mid} abierto en Análisis (${match === 'true' ? 'la huella de trayectoria coincide con la registrada en el lote' : 'ATENCIÓN: la huella de trayectoria NO coincide con la registrada'}).`;
  window.dispatchEvent(new CustomEvent('beM:goto', { detail: 'analysis' }));
}

// ------------------------------------------------------------------------------------------------------------------------------ agregados
function aggregatesCard() {
  const box = h('div', { class: 'card', id: 'batch-aggregates' }, h('h3', { style: 'margin-top:0' }, '4 · Agregados, distribuciones y comparación'));
  if (!ui.agg) { box.append(h('button', { class: 'btn secondary', type: 'button', id: 'b-load-agg', onclick: async () => { const r = await api(`${ui.batchId}/aggregates`); ui.agg = r.body; rerender(); } }, 'Calcular agregados de los partidos válidos'), h('p', { class: 'small muted' }, 'Solo partidos válidos y cubiertos por el indicador; fallidos, interrumpidos, pendientes y no válidos quedan fuera con su causa. Una exposición cero no es un cero.')); return box; }
  const a = ui.agg; const teams = ['*', ...new Set(a.indicadores.filter((r) => r.group_type === 'equipo').map((r) => r.source_team_id))];
  const gt = ui.aggTeam === '*' ? 'variante' : 'equipo'; const KEY = ['RES_WIN', 'RES_DIFF', 'TC_PCT', 'T3_PCT', 'FT_PCT', 'EFG', 'TS', 'ORTG', 'DRTG', 'PACE', 'PER100', 'OREB_PCT'];
  box.append(h('label', { class: 'small' }, 'Grupo ', h('select', { 'aria-label': 'grupo de agregados', onchange: (e) => { ui.aggTeam = e.target.value; rerender(); } }, teams.map((t) => h('option', { value: t, selected: ui.aggTeam === t }, t === '*' ? 'todos los equipos (por variante)' : t)))),
    h('p', { class: 'small muted' }, `Tasa agregada = Σ numeradores / Σ denominadores (no la media de porcentajes). Distribución entre partidos: ${QUANTILE_CONVENTION}.`));
  const rowsI = a.indicadores.filter((r) => r.group_type === gt && (gt === 'variante' || r.source_team_id === ui.aggTeam) && KEY.includes(r.indicator_id));
  box.append(table(['Variante', 'Indicador', 'Unidad', 'n válidos', 'n elegibles', 'Excl. (pend/fallo/interr/no válido)', 'Σ num', 'Σ den', 'Tasa agregada'], rowsI.map((r) => [r.variant_id, `${r.indicator_id} · ${r.label}`, r.unit, r.n_valid, r.n_eligible, `${r.n_excl_pending}/${r.n_excl_failed}/${r.n_excl_interrupted}/${r.n_excl_invalid}`, fmt(r.numerator_sum, 1), fmt(r.denominator_sum, 1), r.status === 'ok' ? fmt(r.pooled_value) : `— (${r.status})`]), { numeric: [3, 4, 6, 7, 8] }));
  const rowsD = a.distribuciones.filter((r) => r.group_type === gt && (gt === 'variante' || r.source_team_id === ui.aggTeam) && (KEY.includes(r.indicator_id) || ['MAG:pts', 'MAG:tov', 'MAG:fga'].includes(r.indicator_id)));
  box.append(h('h3', {}, 'Distribución entre partidos'), table(['Variante', 'Indicador', 'n', 'Media', 'Desv. (n−1)', 'Mín', 'P05', 'P25', 'P50', 'P75', 'P95', 'Máx'], rowsD.map((r) => [r.variant_id, r.indicator_id, r.n, fmt(r.mean), fmt(r.sd), fmt(r.min), fmt(r.p05), fmt(r.p25), fmt(r.p50), fmt(r.p75), fmt(r.p95), fmt(r.max)]), { numeric: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }));
  const rowsC = a.comparaciones.filter((r) => r.group_type === gt && (gt === 'variante' || r.source_team_id === ui.aggTeam) && (KEY.includes(r.indicator_id) || r.indicator_id === 'MAG:pts'));
  box.append(h('h3', {}, 'Comparación base / candidata (casos emparejados)'), rowsC.length ? table(['Candidata', 'Indicador', 'Pares', 'Incompletos', 'Base', 'Candidata', 'Δ tasas agregadas', 'Media Δ por caso', 'Desv. Δ'], rowsC.map((r) => [r.candidate_variant, r.indicator_id, r.n_eligible_pairs, r.n_cases_incomplete, fmt(r.base_rate), fmt(r.candidate_rate), fmt(r.diff_of_rates), fmt(r.mean_case_diff), fmt(r.sd_case_diff)]), { numeric: [2, 3, 4, 5, 6, 7, 8] }) : h('p', { class: 'small muted' }, 'Sin candidatas que comparar (una sola variante) o sin pares válidos.'),
    h('p', { class: 'small muted' }, 'La diferencia de tasas agregadas y la media de las diferencias por caso son medidas distintas. Misma semilla no garantiza los mismos sorteos tras una decisión distinta; una muestra pequeña no demuestra superioridad general.'));
  return box;
}

// ------------------------------------------------------------------------------------------------------------------------------ descargas
function downloadCard() {
  const s = ui.status; const pk = ui.pkg; const partial = s.counters.pendientes + s.counters.en_curso + s.counters.interrumpidos > 0;
  return h('div', { class: 'card', id: 'batch-download' }, h('h3', { style: 'margin-top:0' }, '5 · Descargar el paquete completo de análisis'),
    h('p', { class: 'small' }, 'ZIP autocontenido (CSV, JSON y JSONL, diccionario, guía y resumen) con entradas efectivas, hechos, decisiones, sorteos, agregados, auditoría y cobertura. ', pill('DIAGNÓSTICO del laboratorio', 'warn'), ' No es el export público/propio del análisis ni el export deportivo reproducible (export/8). Un lote parcial se descarga con su manifest parcial y su cobertura.'),
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', id: 'b-package', disabled: ui.busy, onclick: async () => { ui.busy = true; ui.msg = 'Construyendo el paquete (se valida antes de ofrecerlo)…'; rerender(); const r = await post(`${s.batch_id}/package`, {}); ui.busy = false; if (r.ok) { ui.pkg = r.body; ui.pkgKey = JSON.stringify(s.counters); ui.msg = `Paquete construido: ${r.body.packages.length} ZIP, verificación previa ${r.body.summary.verified ? 'correcta' : 'CON FALLOS'}.`; } else ui.msg = `No se pudo construir el paquete: ${r.body.reason}`; rerender(); } }, partial ? 'Descargar paquete parcial de análisis' : 'Descargar paquete completo de análisis')),
    pk ? h('div', { id: 'b-package-out' }, h('p', { class: 'small' }, `Alcance ${pk.summary.scope} · ${pk.summary.kind === 'multi' ? 'dividido en partes: descarga el índice y TODAS las partes' : 'un único ZIP'} · construcción ${ms(pk.summary.total_ms)}.`),
      table(['Archivo', 'ZIP', 'Sin comprimir', 'Verificado', 'SHA-256', ''], pk.packages.map((p) => [p.name, mb(p.bytes), mb(p.uncompressed), p.integrity_verified ? pill('sí', 'ok') : pill('NO', 'bad'), p.sha256.slice(0, 12), h('a', { href: p.url, download: p.name, class: 'dl' }, 'descargar')]), { numeric: [1, 2] })) : null,
    h('h4', {}, 'Cómo entregarlo para analizarlo'), h('pre', { class: 'small', style: 'white-space:pre-wrap' }, CHATGPT_GUIDE),
    h('p', { class: 'small muted' }, 'No se envía nada a ChatGPT, GitHub ni a ningún servicio: es una descarga local que decides compartir. Para comprobarlo tú mismo: npm run batch:check -- <ruta>.'));
}
