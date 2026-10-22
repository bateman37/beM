// Panel de sesión mínimo del laboratorio de conocimiento y aprendizaje tras un partido (MOTOR-18 §8.5, §11.2). Solo propone y aplica con las funciones puras de src/learning; el registro de aplicaciones se persiste
// fuera del núcleo deportivo. Previsualizar, reabrir, analizar, descargar o ejecutar un lote NO aplican aprendizaje: aplicar es siempre una acción explícita aparte.
import { h, table, fmt } from './dom.js';
import { store } from './store.js';
import { proposeFromSession, proposeFromMatch, applyProposal, undoApplication, sourceIdOf, exposureFromResult } from '../learning/index.js';
import { learnParams, persistLearning, syncScenario, copyTeam, kui, adoptLearning } from './knowledge-ui.js';
import { writeStateToInput, IDLE_TEXT, NEUTRAL_NOTE, nextSessionSeq, sessionSourceId } from './learning-model.js';
import { idsOf, keyOf, categoryOf } from '../knowledge/model.js';

const S = { team: null, players: new Set(), collective: '', focus: {}, hours: 1, share: 0.6, idle: 0, preview: null, msg: '', ok: true };
const DOMAINS_IND = [['position', 'Posición'], ['offensiveRole', 'Rol ofensivo'], ['defensiveRole', 'Rol defensivo']];
const pct = (x) => `${fmt(x * 100, 0)} %`;

function commit(tid, prop) {
  const L = store.learn; const r = applyProposal(L.states[tid], L.ledgers[tid], prop, learnParams()); // MOTOR-18B: la propuesta queda ligada a la huella de los parámetros efectivos
  if (!r.ok) return r;
  L.states[tid] = r.state; L.ledgers[tid] = r.ledger; L.sessionSeq = Math.max(L.sessionSeq ?? 1, nextSessionSeq(L)); writeStateToInput(L.copy.input, r.state); L.undo.push({ team: tid, application: r.receipt.application, source_id: prop.source_id });
  syncScenario(); persistLearning(); return r;
}

function targetsTable(pl) {
  const rows = [];
  for (const [pid, p] of Object.entries(pl)) {
    for (const i of p.idle ?? []) rows.push([pid, `desuso ${i.domain}:${i.id}`, '—', `${fmt(i.before, 2)} → ${fmt(i.after, 2)}`, `${i.wearDays} días de desgaste · suelo ${fmt(i.floor, 2)}`]);
    for (const t of p.targets ?? []) rows.push([pid, t.key, `${fmt(t.dose, 3)} h-eq`, `${fmt(t.before.level, 2)} → ${fmt(t.after.level, 2)} (peak ${fmt(t.before.peak, 2)} → ${fmt(t.after.peak, 2)})`, `G=${fmt(t.G, 3)} · ×jugador ${fmt(t.factors.player, 2)} ×enseñanza ${fmt(t.factors.teaching, 2)} ×contenido ${fmt(t.factors.content, 2)} ×transferencia ${fmt(t.factors.transfer, 2)}${t.acceleratedDose > 0 ? ` · reaprendizaje ${fmt(t.acceleratedDose, 3)}` : ''}`]);
    if (p.skipped) rows.push([pid, '—', '—', p.skipped, '']);
    if (p.hours) rows.push([pid, 'presupuesto del día', `${fmt(p.hours.used, 2)} h`, `acumulado ${fmt(p.hours.budgetAfter, 2)} h de 4`, p.hours.clampedByDailyBudget ? 'recortado al saldo diario' : (p.hours.unusedCollective || p.hours.unusedIndividual ? `parte sin usar: ${fmt(p.hours.unusedCollective ?? 0, 2)} colectiva · ${fmt(p.hours.unusedIndividual ?? 0, 2)} individual (no se redistribuye)` : '')]);
  }
  return rows.length ? table(['Jugador', 'Objetivo', 'Dosis', 'Antes → después', 'Factores / presupuesto'], rows) : h('p', { class: 'small muted' }, 'Sin cambios.');
}

export function sessionCard(ctx) {
  const { rerender } = ctx; const L = store.learn; const P = learnParams();
  const head = h('h3', { style: 'margin-top:0' }, 'Laboratorio de conocimiento: sesión de entrenamiento y desuso');
  if (!L || !P) return h('div', { class: 'card', id: 'learn-session' }, head, h('p', { class: 'small muted' }, 'Necesita una copia de aprendizaje activa.'), h('p', { class: 'small muted' }, IDLE_TEXT));
  adoptLearning(); // versión de aprendizaje de los parámetros efectivos, sin reconstruir el equipo
  const tids = L.copy.input.teams.map((t) => t.id); S.team = tids.includes(S.team) ? S.team : tids[0];
  const team = copyTeam(S.team); const state = L.states[S.team]; const L2 = P.learning.session; const mods = idsOf('tactic', P);
  const indOptions = DOMAINS_IND.flatMap(([d, lab]) => idsOf(d, P).map((id) => [keyOf(d, id), `${lab} ${id}`]));
  const sessionSpec = (onlyIdle) => ({ source_id: sessionSourceId(L.copy.id, S.team, nextSessionSeq(L)), // MOTOR-18B (R03): secuencia persistida por copia; tras recargar sigue el siguiente número libre
     idleDays: S.idle, onlyIdle, collectiveFocus: S.collective || null, shares: { collective: S.share, individual: 1 - S.share },
    players: Object.fromEntries([...S.players].map((pid) => { const f = S.focus[pid]; const [domain, id] = f ? [f.slice(0, f.indexOf(':')), f.slice(f.indexOf(':') + 1)] : [null, null]; return [pid, { hours: S.hours, individualFocus: f ? { domain, id } : null }]; })) });
  const preview = (onlyIdle) => { const r = proposeFromSession(state, sessionSpec(onlyIdle), P); S.preview = r; S.previewOnlyIdle = onlyIdle; S.msg = r.ok ? '' : `Propuesta rechazada: ${r.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`; rerender(); };
  const apply = () => { const r = commit(S.team, S.preview); S.msg = r.ok ? `Aplicado (${r.receipt.application}). Se puede deshacer.` : `No aplicado: ${r.reason}`; if (r.ok) S.preview = null; rerender(); };
  const lastUndo = L.undo[L.undo.length - 1];
  const undo = () => { const u = L.undo[L.undo.length - 1]; const r = undoApplication(L.states[u.team], L.ledgers[u.team], u.application); if (!r.ok) { S.msg = `No se pudo deshacer: ${r.reason}`; return rerender(); } L.states[u.team] = r.state; L.ledgers[u.team] = r.ledger; writeStateToInput(L.copy.input, r.state); L.undo.pop(); syncScenario(); persistLearning(); S.preview = null; S.msg = `Deshecho ${u.application}: conocimiento, peak, reloj y presupuestos restaurados (la aplicación queda como revertida y su rastro se conserva).`; rerender(); };
  const card = h('div', { class: 'card', id: 'learn-session' }, head, h('p', { class: 'small muted' }, IDLE_TEXT),
    h('div', { class: 'row' }, h('label', { class: 'small' }, 'Equipo de la copia ', h('select', { id: 'ls-team', onchange: (e) => { S.team = e.target.value; S.players.clear(); S.preview = null; rerender(); } }, tids.map((t) => h('option', { value: t, selected: t === S.team }, t)))),
      h('span', { class: 'small' }, `Día de aprendizaje: ${state.day}`)),
    h('div', { class: 'chips' }, team.players.map((p) => h('label', { class: `chip ${S.players.has(p.id) ? 'on' : ''}` }, h('input', { type: 'checkbox', checked: S.players.has(p.id), 'aria-label': `entrenar ${p.id}`, onchange: (e) => { e.target.checked ? S.players.add(p.id) : S.players.delete(p.id); S.preview = null; rerender(); } }), p.id))),
    h('div', { class: 'row' }, h('button', { class: 'btn secondary', type: 'button', onclick: () => { team.players.forEach((p) => S.players.add(p.id)); S.preview = null; rerender(); } }, 'Todos'), h('button', { class: 'btn secondary', type: 'button', onclick: () => { S.players.clear(); S.preview = null; rerender(); } }, 'Ninguno')),
    h('div', { class: 'grid2' },
      h('div', {}, h('h4', {}, 'Entrenador (sin tocar sus políticas deportivas)'),
        h('label', { class: 'row small' }, 'Enseñanza (teaching, 1–30) ', h('input', { type: 'number', id: 'ls-teaching', min: 1, max: 30, step: 1, value: state.coach.teaching, onchange: (e) => { const v = Number(e.target.value); if (v >= 1 && v <= 30) { state.coach.teaching = v; team.coachLearning.teaching = v; persistLearning(); S.preview = null; rerender(); } } })),
        h('label', { class: 'row small' }, 'Competencia en el módulo del foco colectivo ', S.collective ? h('input', { type: 'number', id: 'ls-mastery', min: 1, max: 30, step: 1, value: state.coach.tacticalMastery[S.collective], onchange: (e) => { const v = Number(e.target.value); if (v >= 1 && v <= 30) { state.coach.tacticalMastery[S.collective] = v; team.coachLearning.tacticalMastery[S.collective] = v; persistLearning(); S.preview = null; rerender(); } } }) : h('span', { class: 'muted' }, '(elige un foco)')),
        h('p', { class: 'small muted' }, 'En el partido estos datos no dan bonos directos: solo cambian cuánto se aprende entre encuentros.')),
      h('div', {}, h('h4', {}, 'Foco y horas'),
        h('label', { class: 'row small' }, 'Foco táctico colectivo ', h('select', { id: 'ls-collective', onchange: (e) => { S.collective = e.target.value; S.preview = null; rerender(); } }, h('option', { value: '' }, '— sin foco —'), mods.map((m) => h('option', { value: m, selected: S.collective === m }, m)))),
        h('label', { class: 'row small' }, `Horas por jugador y día (${L2.minHoursPerPlayerDay}–${L2.maxHoursPerPlayerDay}) `, h('input', { type: 'number', id: 'ls-hours', min: L2.minHoursPerPlayerDay, max: L2.maxHoursPerPlayerDay, step: 0.25, value: S.hours, onchange: (e) => { S.hours = Number(e.target.value); S.preview = null; rerender(); } })),
        h('label', { class: 'row small' }, `Reparto colectivo / individual: ${pct(S.share)} / ${pct(1 - S.share)} `, h('input', { type: 'range', id: 'ls-share', min: 0, max: 1, step: 0.05, value: S.share, 'aria-label': 'reparto colectivo', oninput: (e) => { S.share = Number(e.target.value); S.preview = null; rerender(); } }), h('span', { class: 'small muted' }, 'suma 1; una parte sin foco queda sin usar y se muestra'))
        , h('label', { class: 'row small' }, `Días sin práctica antes de la sesión (0–${L2.maxIdleDays}) `, h('input', { type: 'number', id: 'ls-idle', min: 0, max: L2.maxIdleDays, step: 1, value: S.idle, onchange: (e) => { S.idle = Math.round(Number(e.target.value)); S.preview = null; rerender(); } })))),
    S.players.size ? h('details', { open: true }, h('summary', {}, 'Foco individual por jugador (posición o rol ofensivo/defensivo)'),
      h('div', { style: 'display:grid; gap:4px' }, [...S.players].map((pid) => h('label', { class: 'row small' }, h('span', { style: 'width:110px' }, pid), h('select', { 'aria-label': `foco individual de ${pid}`, onchange: (e) => { S.focus[pid] = e.target.value; S.preview = null; rerender(); } }, h('option', { value: '' }, '— sin foco individual —'), indOptions.map(([v, t]) => h('option', { value: v, selected: S.focus[pid] === v }, t)))))))
      : null,
    h('div', { class: 'row', style: 'margin-top:8px' },
      h('button', { class: 'btn secondary', type: 'button', id: 'ls-preview', onclick: () => preview(false) }, 'Previsualizar sesión'),
      h('button', { class: 'btn secondary', type: 'button', id: 'ls-idle-only', onclick: () => preview(true) }, 'Previsualizar «solo desuso»'),
      h('button', { class: 'btn', type: 'button', id: 'ls-apply', disabled: !S.preview?.ok, onclick: apply }, 'Aplicar a la copia'),
      h('button', { class: 'btn secondary', type: 'button', id: 'ls-undo', disabled: !lastUndo, onclick: undo }, 'Deshacer la última aplicación')),
    S.msg ? h('p', { class: S.msg.startsWith('Aplicado') || S.msg.startsWith('Deshecho') ? 'pill ok' : 'pill bad', id: 'ls-msg' }, S.msg) : null);
  if (S.preview?.ok) card.append(h('div', { id: 'ls-preview-out' }, h('p', { class: 'small' }, h('strong', {}, `Vista previa (${S.preview.mode}) · fuente ${S.preview.source_id} · día ${S.preview.prevDay} → ${S.preview.day}`), ' — nada se escribe hasta pulsar «Aplicar».'), targetsTable(S.preview.players)));
  card.append(h('details', {}, h('summary', {}, `Registro de aplicaciones (${Object.values(L.ledgers).reduce((a, l) => a + l.applications.length, 0)})`), table(['Id', 'Equipo', 'Fuente', 'Estado'], Object.values(L.ledgers).flatMap((l) => l.applications).map((a) => [a.id, a.teamInstance, a.source_id, a.status])), h('p', { class: 'small muted' }, 'Fuera del núcleo deportivo; una fuente vigente no se aplica dos veces a la misma instancia.')));
  void NEUTRAL_NOTE; void categoryOf; void kui;
  return card;
}

// ---------------------------------------------------------------- tras un partido terminado: aprendizaje propuesto y aplicación SEPARADA
const MS = { open: false, msg: '' };
// MOTOR-18B (R03): identidad estable del encuentro (copia + secuencia de encuentro de la copia), asignada al prepararlo y guardada en la entrada congelada. Ni la semilla, ni el marcador, ni los sorteos ni el número de hechos identifican un partido.
const matchSource = (res) => res.input?.labMatchId ?? null;
export function postMatchLearningCard(res, repaint) {
  const L = store.learn; const P = learnParams(); const fam = res.diagnostics?.familiarity;
  if (!L || !P || !fam?.exposure || res.status !== 'finished') return null; // el aprendizaje de partido solo se propone desde un encuentro TERMINADO
  const same = res.input.teams.every((t) => L.copy.input.teams.some((x) => x.id === t.id));
  if (!same) return null;
  adoptLearning();
  const src = matchSource(res);
  if (!src) return h('div', { class: 'card', id: 'post-learning' }, h('h3', { style: 'margin-top:0' }, 'Aprendizaje propuesto por este partido'), h('p', { class: 'pill warn' }, 'Este partido no se preparó desde la copia de aprendizaje (no tiene identidad de encuentro de la copia): no se propone aprendizaje. Prepara y juega un partido con la copia activa.'));
  const made = exposureFromResult(res, { source_id: src }); // productor común: comprueba el estado y marca la exposición como completa
  if (!made.ok) return h('div', { class: 'card', id: 'post-learning' }, h('p', { class: 'pill bad' }, made.errors.map((e) => e.message).join('; ')));
  const exposure = made.exposure;
  const props = L.copy.input.teams.map((t) => ({ tid: t.id, prop: proposeFromMatch(L.states[t.id], exposure, P, { source_id: sourceIdOf({ source: src, teamInstance: t.id }), day: L.states[t.id].day }) }));
  const done = (tid) => L.ledgers[tid].applications.some((a) => a.status === 'aplicada' && a.source_id.startsWith(src) && a.teamInstance === tid);
  const applyAll = () => { const out = props.map(({ tid, prop }) => (done(tid) ? `${tid}: ya aplicado` : (prop.ok ? (() => { const r = commit(tid, prop); return r.ok ? `${tid}: aplicado (${r.receipt.application})` : `${tid}: ${r.reason}`; })() : `${tid}: ${prop.errors?.map((e) => e.message).join('; ')}`))); MS.msg = out.join(' · '); repaint(); };
  return h('div', { class: 'card', id: 'post-learning' }, h('h3', { style: 'margin-top:0' }, 'Aprendizaje propuesto por este partido'),
    h('p', { class: 'small muted' }, 'La exposición del encuentro (minutos por posición y rol, crédito por módulo) propone una actualización del conocimiento de la copia. Reabrir, analizar, descargar o ejecutar un lote NO aplica nada: «Aplicar a esta variante» es una acción separada y la misma fuente no se aplica dos veces.'),
    h('div', { class: 'row' }, h('button', { class: 'btn secondary', type: 'button', id: 'see-learning', onclick: () => { MS.open = !MS.open; repaint(); } }, MS.open ? 'Ocultar aprendizaje propuesto' : 'Ver aprendizaje propuesto'),
      h('button', { class: 'btn', type: 'button', id: 'apply-learning', disabled: props.every(({ tid }) => done(tid)), onclick: applyAll }, 'Aplicar a esta variante')),
    MS.msg ? h('p', { class: 'pill ok', id: 'pl-msg' }, MS.msg) : null,
    MS.open ? props.map(({ tid, prop }) => h('div', {}, h('h4', {}, `${tid} · fuente ${prop.source_id ?? src}`), prop.ok ? targetsTable(Object.fromEntries(Object.entries(prop.players).map(([pid, p]) => [pid, { ...p, targets: (p.targets ?? []).filter((t) => t.after.level !== t.before.level || t.after.peak !== t.before.peak).slice(0, 6) }]))) : h('p', { class: 'pill bad' }, prop.errors?.map((e) => e.message).join('; ')))) : null);
}
