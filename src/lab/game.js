// Pantalla «Partido» (MOTOR-02): preparar el encuentro, elegir modalidad y equipo dirigido, jugarlo (total, por cuartos o por tiempo),
// dirigirlo con órdenes, ver acta y relato, descargar el JSON y reproducir un encuentro exportado.
import { h, clear, fmt, table } from './dom.js';
import { store, PLAY_NAMES, matchSource, isLearningScenario } from './store.js';
import { validateInput, deepCopy, SLOTS, diagnosticQueries, ownStateView, rivalPublicView, diagnosticView } from '../match/index.js';
import { MatchSession, MODES, SESSION_STATES, PRESENTATION } from '../match/session.js';
import { replayMatch, validateReplayFile } from '../match/replay.js';
import { describeEvent, clockText } from '../match/narrative.js';
import { directionPanel, ordersCard, newDraft, syncDraft, draftSpecs } from './direction.js';
import { styleLevelLabels, STYLE_DEFS, MIDRANGE_LABEL } from './styles.js';
import { defenseSummary, defStyleLabels, DEF_STYLE_DEFS } from './defense-ui.js';
import { rowsOf, valueText, unitText } from './panel/common.js';
import { openRow } from './panel/rowdialog.js';
import { coachLiveCard, coachDiagnosticCard } from './coach-ui.js';
import { actaCards, casesCard } from './acta-ui.js';
import { LAB_CASES } from '../match/cases.js';
import { srcText } from './population-ui.js';
import { matchFamiliarityCard, persistLearning } from './knowledge-ui.js';
import { nextMatchId } from './learning-model.js';
import { postMatchLearningCard } from './learning-ui.js';

const ui = { saves: { list: null, msg: null, err: null, label: '', busy: false }, mode: 'total', managed: 0, speed: PRESENTATION.defaultSpeed, session: null, draft: null, msg: null, call: null, filter: 'all', limit: 150, showBox: false, storyLimit: 18, replay: null, compare: null, error: null, root: null };

const MODE_TEXT = {
  total: 'Los entrenadores básicos llevan el encuentro hasta el final sin clics entre periodos.',
  cuartos: 'Se resuelve un periodo completo, se revisa lo ocurrido y se prepara el siguiente conservando el partido acumulado (incluye prórrogas).',
  tiempo: 'Visionado a x2, x4, x8 o x16 con pausa; las órdenes afectan solo a lo que aún no se ha resuelto.',
};
const periodName = (p) => (p <= 4 ? `Cuarto ${p}` : `Prórroga ${p - 4}`);
const sched = () => ({
  setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (x) => clearTimeout(x), now: () => Date.now(),
  yield: async () => { paintProgress(); await new Promise((r) => setTimeout(r, 0)); }, // cesión por bloques, sin fotogramas ni hechos nuevos
});

export function renderGame(root) {
  store.liveResult = () => (ui.session ? ui.session.result() : null); // lectura parcial para la pestaña «Análisis» (no avanza el partido)
  ui.root = root; clear(root);
  root.append(h('h2', {}, 'Partido'), setupCard(), h('div', { id: 'live' }), h('div', { id: 'panel' }), h('div', { id: 'result' }));
  paintLive(); paintPanel(); paintResult(); refreshReplay();
}
const rerender = () => { if (ui.root && document.getElementById('live')) { paintLive(); paintPanel(); paintResult(); } };

// ---------------------------------------------------------------- preparación
function setupCard() {
  const { profile } = store; const edit = matchSource(); // copia de contraste activa o entrada editada
  const errs = validateInput(edit, profile);
  if (!profile.moment || !profile.coach || !profile.regulation) errs.push({ path: 'perfil activo', message: 'es anterior a MOTOR-09: activa la base de MOTOR-09 o una candidata explícita en el Panel de ajustes' });
  const s = ui.session;
  const live = s && !['finalizado', 'error'].includes(s.state);
  return h('div', { class: 'card' },
    h('h3', { style: 'margin-top:0' }, 'Preparar el encuentro'),
    h('div', { class: 'grid2' },
      h('div', {},
        h('div', { class: 'small muted' }, 'Modalidad'),
        h('div', { style: 'display:grid; gap:6px; margin:4px 0 10px' }, Object.entries(MODES).map(([k, label]) => h('label', { class: 'opt' },
          h('input', { type: 'radio', name: 'mode', checked: ui.mode === k, onchange: () => { ui.mode = k; renderGame(ui.root); } }),
          h('span', {}, h('strong', {}, label), h('br'), h('span', { class: 'small muted' }, MODE_TEXT[k]))))),
        ui.mode === 'tiempo' ? h('div', { class: 'row' }, h('span', { class: 'small muted' }, 'Velocidad inicial'), speedChips((v) => { ui.speed = v; renderGame(ui.root); }, ui.speed)) : null),
      h('div', {},
        h('label', { class: 'row' }, 'Equipo dirigido manualmente ', h('select', { id: 'managed', onchange: (e) => { ui.managed = Number(e.target.value); } }, edit.teams.map((t, i) => h('option', { value: i, selected: ui.managed === i }, `${t.id} — ${t.name}`)))),
        h('p', { class: 'small muted' }, 'El rival utiliza la delegación básica ya disponible (relevo del entrenador básico). Esa delegación no es un entrenador completo: no toma tiempos muertos ni cambia estilos (MOTOR-08).'),
        store.scenario ? h('p', { class: 'pill warn', id: 'scenario-badge' }, `Copia de contraste: ${store.scenario.scenario.id} · ${store.scenario.scenario.name} (${store.scenario.changes.length} cambios listados; tus fichas y planes no se tocan) `, h('button', { class: 'link', type: 'button', id: 'scenario-clear', onclick: () => { store.scenario = null; renderGame(ui.root); } }, 'quitar')) : null,
        h('label', { class: 'row' }, 'Importancia del encuentro ', h('select', { id: 'importance', disabled: !!store.scenario, onchange: (e) => { store.edit.importance = e.target.value; renderGame(ui.root); } }, Object.keys(profile.pressure.importance).map((k) => h('option', { value: k, selected: edit.importance === k }, { ordinary: 'Ordinario', important: 'Importante', decisive: 'Decisivo' }[k])))),
        h('p', { class: 'small muted' }, 'La importancia es una entrada visible: junto con la tensión de reloj y marcador forma la presión (el máximo de ambas, no su suma). No cambia por un resultado parcial.'),
        h('p', { class: 'small' }, `Equipo A: ${srcText(edit.teams[0].source)}`), h('p', { class: 'small' }, `Equipo B: ${srcText(edit.teams[1].source)}`),
        h('p', { class: 'small' }, `Semilla ${edit.seed} · ${edit.teams[0].id} vs ${edit.teams[1].id} · perfil ${store.library.activeId} «${store.library.activeVersion().label}» (${profile.effectiveId}) `, h('span', { class: 'pill warn' }, profile.status)))),
    errs.length ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'No se puede preparar: entrada no válida.'), h('ul', {}, errs.map((e) => h('li', {}, h('code', {}, e.path), ' — ', e.message)))) : null,
    ui.error ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, ui.error)) : null,
    h('div', { class: 'row' },
      h('button', { class: 'btn', id: 'prepare', disabled: errs.length > 0, onclick: prepare }, s ? 'Preparar otro encuentro (entrada nueva)' : 'Preparar encuentro'),
      live ? h('span', { class: 'small muted' }, 'Hay un encuentro en curso: preparar otro lo descarta junto con sus órdenes y temporizadores.') : null),
    h('p', { class: 'small muted' }, 'Al preparar se congela una copia de la entrada: editar fichas o planes después solo afecta al siguiente encuentro.'),
    savesCard(),
    replayCard());
}

function prepare() {
  const s0 = ui.session;
  if (s0 && !['finalizado', 'error'].includes(s0.state) && s0.match.stepSeq > 0 && !confirm('Hay un encuentro en curso. ¿Descartarlo y preparar uno nuevo con la entrada actual?')) return;
  if (s0) s0.dispose(); // invalida callbacks y temporizadores del anterior
  ui.error = null; ui.draft = null; ui.msg = null; ui.compare = null; ui.call = null; ui.filter = 'all'; ui.limit = 150; ui.storyLimit = 18; ui.showBox = false;
  try {
    const frozen = deepCopy(matchSource());
    if (isLearningScenario() && store.learn) { frozen.labMatchId = nextMatchId(store.learn); persistLearning(); } // MOTOR-18B (R03): identidad estable del encuentro de la copia (viaja en la entrada congelada)
    const s = new MatchSession({ input: frozen, profile: store.profile, profileRef: store.profileRef, mode: ui.mode, managedTeam: ui.managed, speed: ui.speed, scheduler: sched() });
    store.matchRef = store.profileRef; // perfil congelado de este encuentro (se muestra en el panel)
    s.subscribe(onSession); ui.session = s;
  } catch (e) { ui.error = `No se pudo preparar el encuentro: ${e.message}`; ui.session = null; }
  renderGame(ui.root);
}

function onSession(s) {
  if (s !== ui.session) return;
  if (s.state === 'enMarcha' && s.mode === 'tiempo') { paintLive(); return; } // el visionado repinta solo la zona viva
  renderGame(ui.root);
}

const speedChips = (onPick, cur) => h('span', { class: 'seg' }, PRESENTATION.speeds.map((v) => h('button', { type: 'button', 'aria-pressed': cur === v, onclick: () => onPick(v) }, `x${v}`)));

// ---------------------------------------------------------------- zona viva
function paintProgress() {
  const s = ui.session; const el = document.getElementById('progress-i'); if (!s || !el) return;
  const m = s.match; const len = (p) => (p <= 4 ? 6000 : 3000);
  el.style.width = `${m.period ? Math.round(Math.min(((Math.min(m.period, 4) - 1) + (1 - m.clock / len(m.period))) / 4, 1) * 100) : 0}%`;
}

function paintLive() {
  const box = document.getElementById('live'); const s = ui.session; if (!box) return;
  clear(box); if (!s) return;
  const m = s.match; const st = s.state;
  const teamId = (i) => m.teams[i].id;
  const attacking = m.poss && !m.poss.done ? teamId(m.poss.team) : null;
  const periodLabel = m.period === 0 ? 'Sin empezar' : m.periodBreak != null ? `Final del ${periodName(m.period).toLowerCase()}` : periodName(m.period);
  box.append(h('div', { class: 'card' },
    h('div', { class: 'row' },
      h('div', { class: 'score', id: 'score' }, `${teamId(0)} ${m.score[0]} – ${m.score[1]} ${teamId(1)}`),
      h('span', { class: `pill ${st === 'finalizado' ? 'ok' : st === 'error' ? 'bad' : st === 'tiempoMuerto' || st === 'revision' ? 'warn' : ''}`, id: 'state' }, SESSION_STATES[st]),
      h('span', { class: 'pill' }, MODES[s.mode]), s.mode === 'tiempo' ? h('span', { class: 'pill' }, `x${s.speed}`) : null,
      h('span', { class: 'pill' }, `Dirige ${teamId(s.managedTeam)}`)),
    h('div', { class: 'row', style: 'margin-top:6px' },
      h('span', { id: 'period' }, h('strong', {}, periodLabel)), h('span', { id: 'clock' }, m.period ? `reloj ${clockText(m.clock)}` : ''),
      h('span', { id: 'shot' }, m.poss && !m.poss.done ? `posesión ${fmt(m.shotClock / 10)} s` : ''), attacking ? h('span', {}, `ataca ${attacking}`) : null,
      h('span', { class: 'small muted' }, `paso ${m.stepSeq} · ${m.events.length} acontecimientos`)),
    controls(s),
    st === 'enMarcha' && s.mode !== 'tiempo' ? h('div', { class: 'bar', style: 'margin-top:8px' }, h('i', { id: 'progress-i', style: 'width:0%' })) : null,
    st === 'error' ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'La ejecución terminó con error: '), m.errors.map((e) => e.message).join('; '), ' Se conserva la última frontera válida y el registro parcial; no se certifica un partido terminado.') : null));
  if (st === 'tiempoMuerto') {
    const ev = [...m.events].reverse().find((e) => e.type === 'timeout');
    box.append(h('div', { class: 'card', style: 'border-color:var(--warn)' }, h('strong', {}, `Tiempo muerto concedido a ${ev ? teamId(ev.team) : ''}.`), ' Es una parada deportiva (distinta de la pausa de pantalla): ya se aplicó su recuperación, una sola vez. Revisa el plan y pulsa «Reanudar»; no hace falta esperar el minuto real.'));
  }
  if (st === 'revision') box.append(reviewCard(s));
  if (st === 'preparado') box.append(h('p', { class: 'small muted' }, 'Encuentro preparado con la entrada congelada. Quintetos y plan iniciales:'));
  box.append(h('div', { class: 'grid2' }, teamCard(s, s.managedTeam), teamCard(s, 1 - s.managedTeam)));
  box.append(planCard(s), coachLiveCard(s, rerender), ordersCard(s, rerender), storyBlock(s), boxBlock(s));
  if (s.log.restoredFrom) box.prepend(h('p', { class: 'pill warn', id: 'restored-badge' }, `Rama de laboratorio continuada desde el guardado ${s.log.restoredFrom.saveId ?? ''} (paso ${s.log.restoredFrom.stepSeq}${s.log.restoredFrom.period ? `, periodo ${s.log.restoredFrom.period}` : ''})`));
  if (st !== 'preparado' && st !== 'finalizado' && st !== 'error') box.append(h('div', { class: 'small muted' }, 'Guardar y continuar: sección «Guardar y continuar» de la preparación (frontera: entre dos acontecimientos; no avanza el partido).'));
  paintProgress();
}

function controls(s) {
  const st = s.state; const m = s.match;
  const row = [];
  if (st === 'preparado') row.push(h('button', { class: 'btn', id: 'start', onclick: () => s.start() }, s.mode === 'total' ? 'Iniciar simulación completa' : s.mode === 'cuartos' ? 'Jugar primer cuarto' : 'Iniciar visionado'));
  if (s.mode === 'tiempo' && st !== 'preparado' && st !== 'finalizado' && st !== 'error') {
    if (st === 'enMarcha') row.push(h('button', { class: 'btn secondary', id: 'pause', onclick: () => s.pause() }, 'Pausar'));
    else row.push(h('button', { class: 'btn', id: 'resume', onclick: () => s.resume() }, st === 'tiempoMuerto' ? 'Reanudar' : 'Continuar'));
  }
  if (s.mode === 'tiempo' && st !== 'finalizado' && st !== 'error') row.push(h('span', { class: 'row' }, h('span', { class: 'small muted' }, 'Velocidad'), speedChips((v) => { s.setSpeed(v); ui.speed = v; }, s.speed)));
  if (st === 'revision') row.push(h('button', { class: 'btn', id: 'next-period', onclick: nextPeriod }, 'Aplicar plan y jugar siguiente periodo'));
  if (st === 'enPausa' && s.mode === 'tiempo') row.push(h('span', { class: 'small muted' }, 'Pausa de pantalla: relojes, energía y hechos permanecen constantes; no hay descanso deportivo.'));
  if (st === 'enMarcha' && s.mode === 'total') row.push(h('span', { class: 'muted' }, 'Simulando hasta el final…'));
  if (st === 'enMarcha' && s.mode === 'cuartos') row.push(h('span', { class: 'muted' }, 'Jugando el periodo…'));
  return h('div', { class: 'row', style: 'margin-top:8px' }, row);
}

async function nextPeriod() {
  const s = ui.session; if (!s || s.busy) return;
  const specs = ui.draft && ui.draft.team === s.managedTeam ? draftSpecs(s.match, s.managedTeam, syncDraft(s.match, s.managedTeam, ui.draft)) : [];
  const p = s.match.periodBreak;
  const r = await s.playNextPeriod(specs, `plan para ${periodName(p).toLowerCase()}`);
  if (!r.ok) {
    ui.msg = { text: `${r.reason}${r.orders ? `: ${r.orders.filter((o) => o.state === 'rechazada').map((o) => o.reason).join(' · ')}` : ''}. El periodo no ha empezado y el plan anterior sigue vigente.`, cls: 'errbox' };
  } else { ui.draft = null; ui.msg = null; }
  renderGame(ui.root);
}

function reviewCard(s) {
  const m = s.match; const last = m.periodScores[m.periodScores.length - 1]; const acc = m.score;
  const nextP = m.periodBreak; const tie = m.period >= 4 && m.score[0] === m.score[1];
  return h('div', { class: 'card', style: 'border-color:var(--warn)' },
    h('h3', { style: 'margin-top:0' }, `Revisión: final del ${periodName(m.period).toLowerCase()}`),
    h('p', {}, `Parcial ${m.teams[0].id} ${last.points[0]}–${last.points[1]} ${m.teams[1].id} · acumulado ${acc[0]}–${acc[1]}. ${tie ? 'Empate tras el cuarto periodo: se juega una prórroga.' : ''}`),
    table(['Periodo', m.teams[0].id, m.teams[1].id], m.periodScores.map((p) => [periodName(p.period), ...p.points]), { numeric: [1, 2] }),
    h('p', { class: 'small', style: 'margin-top:8px' }, h('strong', {}, 'La energía mostrada es ANTERIOR al descanso reglado.'), ` La recuperación de intervalo se aplicará una sola vez al empezar ${nextP <= 4 ? 'el ' + periodName(nextP).toLowerCase() : 'la ' + periodName(nextP).toLowerCase()}. El tiempo que dediques a revisar no da descanso adicional.`),
    ui.msg ? h('div', { class: ui.msg.cls }, ui.msg.text) : null);
}

// ---------------------------------------------------------------- equipos y plan
function teamCard(s, t) {
  const m = s.match; const tm = m.input.teams[t]; const mine = t === s.managedTeam;
  const showEnergy = mine; // la energía interna rival no se muestra en la vista ordinaria
  // Vista PROPIA: energía (número y barra), Forma y momentos como categorías con su ámbito. Vista RIVAL: solo hechos públicos. No consume azar.
  const own = mine ? ownStateView(m, t) : null; const byId = own ? Object.fromEntries(own.jugadores.map((p) => [p.id, p])) : {};
  const bar = (e) => h('span', { class: 'bar', style: 'display:inline-block;width:46px;vertical-align:middle;margin-left:6px', title: `energía ${e}`, role: 'img', 'aria-label': `energía ${e} de 100` }, h('i', { style: `width:${e}%` }));
  const row = (id, slot) => {
    const p = m.ps[id]; const st = byId[id];
    return { cls: !p.available ? 'muted' : '', cells: [slot ?? '—', id, showEnergy ? h('span', {}, fmt(p.energy, 0), bar(Math.round(p.energy))) : '·', st ? st.formaCategoria : '·',
      st ? `${st.momentos.M_TIR.categoria} / ${st.momentos.M_OFE.categoria} / ${st.momentos.M_DEF.categoria}` : '·', p.fouls, p.available ? (slot ? 'en pista' : 'banquillo') : 'excluido'] };
  };
  const onCourt = SLOTS.map((slot) => row(m.lineup[t][slot], slot));
  const bench = tm.players.filter((p) => !SLOTS.some((sl) => m.lineup[t][sl] === p.id)).map((p) => row(p.id, null));
  const before = m.periodBreak != null && m.period > 0;
  const pub = mine ? null : rivalPublicView(m, t);
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `${tm.id} — ${tm.name}${mine ? ' · dirigido' : ' · delegado'}`),
    table(['Pos', 'Jugador', showEnergy ? `Energía${before ? ' (antes del descanso)' : ''}` : 'Energía', 'Forma', 'Momento (tiro / ofensivo / defensivo)', 'Faltas', 'Estado'], [...onCourt, ...bench], { numeric: [2, 5] }),
    own ? h('p', { class: 'small' }, h('strong', {}, 'Conexión del equipo: '), own.conexionDelEquipo.categoria, ' · ', h('span', { class: 'muted' }, 'La Forma se recibió al empezar y no cambia durante el partido; los momentos se muestran como categorías (proyección determinista, sin azar). No equivalen a porcentajes de tiro.')) : null,
    pub?.racha ? h('p', { class: 'small' }, h('strong', {}, 'Racha pública: '), pub.racha.texto) : null,
    h('p', { class: 'small muted' }, `Faltas colectivas del periodo: ${m.teamFouls[t][Math.min(Math.max(m.period, 1), 4)] ?? 0}${showEnergy ? '' : ' · la energía, la Forma y los momentos internos del rival no se muestran'}.`));
}

function planCard(s) {
  const m = s.match; const t = s.managedTeam; const v = m.planView(t); const labels = styleLevelLabels(store.profile); const rep = m.profile.repertoire;
  const tmx = v.timeouts; const dv = m.defenseView(t); const defSum = defenseSummary(m.profile, dv); const dlabels = defStyleLabels(m.profile);
  const ctl = v.lineupControl.mode === 'manual' ? 'MANUAL — el entrenador básico no lo contradice por una revisión ordinaria; las exclusiones prevalecen.' : 'Automático (entrenador básico).';
  const proj = SLOTS.some((sl) => v.projectedLineup[sl] !== v.lineup[sl]) ? ` · previsto tras la ventana: ${SLOTS.map((sl) => v.projectedLineup[sl].split('-')[1]).join(' ')}` : '';
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Plan vigente de ${m.teams[t].id}`),
    h('div', { class: 'kv' },
      ...STYLE_DEFS.flatMap((x) => [h('span', { class: 'muted' }, x.title), h('span', {}, labels[x.key][v.styles[x.key] - 1])]),
      h('span', { class: 'muted' }, 'Media distancia'), h('span', {}, MIDRANGE_LABEL[v.midrange]),
      h('span', { class: 'muted' }, 'Disposición'), h('span', {}, `${v.disposition} · ${rep.dispositions[v.disposition].name}`),
      h('span', { class: 'muted' }, 'Director y alternativas'), h('span', {}, v.directorPriority.join(' › ')),
      h('span', { class: 'muted' }, 'Libro (prioridad)'), h('span', {}, v.playbook.map((b) => `${b.playId}=${b.priority}`).join(' · ')),
      h('span', { class: 'muted' }, 'Quinteto'), h('span', {}, `${ctl}${proj}`),
      h('span', { class: 'muted' }, 'Defensa'), h('span', {}, defSum.text, defSum.diverge ? h('span', { class: 'pill warn', style: 'margin-left:6px' }, defSum.diverge) : null),
      ...DEF_STYLE_DEFS.flatMap((x) => [h('span', { class: 'muted' }, `Defensa · ${x.title}`), h('span', {}, dlabels[x.key][dv.plan.styles[x.key] - 1])]),
      h('span', { class: 'muted' }, 'Pendientes defensivos'), h('span', {}, (v.pending.filter((o) => /^def/.test(o.type)).map((o) => o.reason ?? o.state).join(' · ')) || '—'),
      h('span', { class: 'muted' }, 'Tiempos muertos'), h('span', {}, tmx ? `quedan ${tmx.remaining} en este bloque (cupo ${tmx.quota})${tmx.pending ? ' · solicitud pendiente' : ''}` : '—'),
      h('span', { class: 'muted' }, 'Rival'), h('span', {}, `${m.teams[1 - t].id}: entrenador automático ${m.coachState?.[1 - t]?.policy ?? ''} (MOTOR-08)`)));
}

// ---------------------------------------------------------------- relato y acta parcial
function storyBlock(s) {
  const m = s.match; const name = (id) => id; const teamName = (i) => m.teams[i].id;
  const evs = m.events.slice(-ui.storyLimit);
  const body = h('ul', {});
  let lastPoss = null;
  for (const ev of evs) {
    if (ev.possessionId && ev.possessionId !== lastPoss) { lastPoss = ev.possessionId; body.append(h('li', { class: 'poss' }, `Periodo ${ev.period} · posesión ${ev.possessionId} · ataca ${teamName(ev.team)} · marcador ${ev.score.join('–')}`)); }
    body.append(h('li', {}, h('span', { class: 't' }, `${clockText(ev.clock.before)}→${clockText(ev.clock.after)}`), describeEvent(ev, { name, teamName }), ' ', h('button', { class: 'link small', onclick: () => showDetail(ev, m.teams, { profile: m.profileData, table: m.tracker?.table, ref: m.opts.profileRef }) }, `detalle ${ev.id}`)));
  }
  const last = m.events[m.events.length - 1];
  return h('div', { class: 'card story' }, h('h3', { style: 'margin-top:0' }, 'Último acontecimiento y relato'),
    last ? h('p', { id: 'last-event' }, h('strong', {}, describeEvent(last, { name, teamName }))) : h('p', { class: 'neutral' }, 'Todavía no se ha resuelto ningún acontecimiento.'),
    body, m.events.length > evs.length ? h('button', { class: 'btn secondary', style: 'margin-top:8px', onclick: () => { ui.storyLimit += 40; paintLive(); } }, `Mostrar más (${m.events.length - evs.length} anteriores)`) : null);
}

function boxBlock(s) {
  const d = h('details', {}, h('summary', {}, 'Acta parcial y detalles de laboratorio'));
  d.open = ui.showBox;
  d.addEventListener('toggle', () => { ui.showBox = d.open; if (d.open) paintLive(); });
  if (ui.showBox && s.match.events.length) { const res = s.result(); d.append(...actaCards(res), h('p', { class: 'small muted' }, 'El acta se proyecta desde los hechos ya resueltos. Los detalles calculados de cada acontecimiento están en «detalle» (laboratorio), no en el flujo ordinario.')); }
  return h('div', { class: 'card' }, d);
}

function showDetail(ev, teams, src = null) {
  const dlg = document.getElementById('detail');
  document.getElementById('detail-title').textContent = `${ev.id} · ${ev.type} · periodo ${ev.period}`;
  const body = document.getElementById('detail-body'); clear(body);
  const sec = (t, o) => h('div', {}, h('h3', {}, t), h('pre', {}, JSON.stringify(o, null, 1)));
  body.append(
    h('p', { class: 'small muted' }, 'Vista de detalle calculado (laboratorio): no forma parte del relato normal. Incluye capacidades base y efectivas usadas, pesos, energía, probabilidades, sorteos y resultado.'),
    sec('Hecho', { tipo: ev.type, periodo: ev.period, posesion: ev.possessionId, equipoEnAtaque: ev.team == null ? null : teams[ev.team].id, relojAntes: clockText(ev.clock.before), relojDespues: clockText(ev.clock.after), relojPosesion: [ev.shotClock.before / 10, ev.shotClock.after / 10], duracionSegundos: ev.durationTenths / 10, quintetos: ev.lineups, marcador: ev.score, ordenesVinculadas: ev.orders ?? [] }),
    sec('Intención y procedencia', ev.intent), sec('Participantes', ev.participants), sec('Consecuencias', ev.effects), sec('Hechos de acta que produce', ev.stats),
    sec('Cálculo (recetas, distribuciones, mezclas, binarias)', ev.calc ?? 'Sin detalle calculado (modo mínimo).'), sec('Sorteos deportivos consumidos', ev.draws),
    paramsSection(ev, src));
  dlg.showModal();
}

// Filas del PERFIL CONGELADO de este encuentro que se consultaron al resolver el hecho (no el perfil activo de hoy).
function paramsSection(ev, src) {
  if (!src?.table || !ev.params) return h('div', {}, h('h3', {}, 'Filas del perfil consultadas'), h('p', { class: 'small muted' }, 'Sin registro de filas: encuentro en modo mínimo o de una versión anterior.'));
  const idx = rowsOf(src.profile).byId;
  const ids = ev.params.map((i) => src.table[i]);
  const label = src.ref ? `${src.ref.versionId} «${src.ref.label}» (huella ${String(src.ref.hash ?? '').slice(0, 8)})` : 'perfil congelado de este encuentro';
  return h('div', {}, h('h3', {}, `Filas del perfil consultadas al resolver este hecho (${ids.length})`),
    h('p', { class: 'small muted' }, `Valores del perfil congelado ${label}; aunque hoy esté activo otro perfil. Solo aparecen las filas que el motor leyó de verdad.`),
    table(['Fila', 'Valor usado', 'Unidad'], ids.map((id) => { const r = idx.get(id); return r ? [h('button', { class: 'link', type: 'button', onclick: () => openRow(id, { effective: src.profile, refLabel: `perfil congelado ${src.ref?.versionId ?? ''}`, readOnly: true }) }, id), valueText(r, r.value), unitText(r)] : [id, '—', '']; })));
}

// ---------------------------------------------------------------- panel de dirección y resultado final
function paintPanel() {
  const box = document.getElementById('panel'); if (!box) return; clear(box);
  const s = ui.session; if (!s || ['finalizado', 'error', 'preparado'].includes(s.state)) { if (s?.state === 'preparado') box.append(h('p', { class: 'small muted' }, 'La dirección se habilita al iniciar el encuentro (la preparación inicial se edita en «Preparación»).'), matchFamiliarityCard(s.match, s.managedTeam)); return; }
  box.append(matchFamiliarityCard(s.match, s.managedTeam), plannedOrdersCard(s), directionPanel(s, ui, rerender)); // MOTOR-18: familiaridad propia con lo que se pide (el rival no revela la suya)
}

// Órdenes previstas del escenario (MOTOR-11 §12, LAB11-10): se guardan con su frontera y se ENVÍAN a mano en ella; el motor las aplica solo en su ventana real (no por magia).
function plannedOrdersCard(s) {
  const planned = store.scenario?.plannedOrders ?? []; if (!planned.length) return null;
  const m = s.match;
  return h('div', { class: 'card', id: 'planned-orders' }, h('h3', { style: 'margin-top:0' }, 'Órdenes previstas del escenario'),
    h('p', { class: 'small muted' }, 'Guardadas con el escenario y su frontera. No se aplican solas: se envían desde aquí y siguen el ciclo normal de órdenes (validación, ventana real de aplicación).'),
    planned.map((o) => { const mine = o.team === s.managedTeam; const ready = m.period >= o.period - 1 && !['finalizado', 'error'].includes(s.state);
      return h('div', { class: 'row small' }, h('span', {}, `${o.boundary} · equipo ${m.teams[o.team].id}: ${o.spec.type} ${JSON.stringify(Object.fromEntries(Object.entries(o.spec).filter(([k]) => k !== 'type')))}`),
        h('button', { class: 'btn secondary', type: 'button', disabled: !mine || !ready, title: mine ? '' : 'Dirige ese equipo para enviarla', onclick: () => { try { s.submit({ ...o.spec, team: o.team }); ui.msg = 'Orden prevista enviada: se aplicará en su ventana real.'; } catch (e) { ui.msg = `No se pudo enviar: ${e.message}`; } rerender(); } }, mine ? (ready ? 'Enviar ahora' : 'Aún no es su frontera') : 'Dirige ese equipo para enviarla')); }));
}

function paintResult() {
  const box = document.getElementById('result'); if (!box) return; clear(box);
  const s = ui.session; if (!s || !['finalizado', 'error'].includes(s.state)) return;
  const res = s.result(); store.last = res;
  if (!s._logged) { s._logged = true; store.pop?.logResult({ scenario: res.input?.contrast?.id ?? null, seed: res.meta.rng.initialSeed, teams: res.teams.map((t) => t.id), score: res.score, status: res.status, engine: res.identity.engineVersion, profile: res.identity.effectiveProfileId }); } // comparación sin lotes: un resultado por encuentro
  renderResult(box, res, { live: true, refresh: paintResult });
}

function renderResult(root, res, { live = false, banner = null, refresh = paintResult } = {}) {
  const teamName = (i) => `${res.teams[i].id}`;
  const ot = res.periodScores.length > 4 ? res.periodScores.length - 4 : 0;
  const finished = res.status === 'finished';
  root.append(h('div', { class: 'card' },
    banner,
    h('div', { class: 'row' }, h('div', { class: 'score' }, `${res.teams[0].id} ${res.score[0]} – ${res.score[1]} ${res.teams[1].id}`), h('span', { class: `pill ${finished ? 'ok' : 'bad'}` }, finished ? 'Partido terminado' : `Ejecución incompleta (${res.status})`), ot ? h('span', { class: 'pill' }, `${ot} prórroga(s)`) : null),
    h('p', { class: 'muted small' }, `Semilla ${res.meta.rng.initialSeed} · ${res.meta.rng.algorithm} · ${res.meta.rng.draws} sorteos deportivos · ${res.diagnostics.possessions} posesiones · ${res.diagnostics.steps} fronteras · ${res.events.length} acontecimientos · motor ${res.meta.engineVersion} · perfil ${res.meta.effectiveProfileId} (${res.meta.profileStatus}) · reglas ${res.meta.rulesProfile}`),
    h('p', { class: 'muted small' }, `Órdenes manuales: ${res.orders.filter((o) => o.issuer === 'manual').length} · decisiones delegadas registradas: ${res.orders.filter((o) => o.issuer === 'auto').length} · comandos reproducibles: ${res.commands.length}${res.direction ? ` · modalidad ${MODES[res.direction.mode]}, dirige ${res.teams[res.direction.managedTeam].id}` : ''}`),
    table(['Periodo', ...res.teams.map((t) => t.id)], res.periodScores.map((p) => [periodName(p.period), ...p.points]), { numeric: [1, 2] }),
    h('div', { class: 'row', style: 'margin-top:10px' },
      h('button', { class: 'btn secondary', id: 'download', onclick: () => download(res) }, 'Descargar encuentro (JSON)'),
      h('button', { class: 'btn', id: 'open-analysis', type: 'button', onclick: () => { store.last = res; window.dispatchEvent(new CustomEvent('beM:goto', { detail: 'analysis' })); } }, 'Abrir análisis y resumen'),
      live ? [h('button', { class: 'btn secondary', onclick: () => recompute(res) }, 'Reproducir este encuentro (recalcular)'),
        ui.compare ? h('span', { class: `pill ${ui.compare.identical ? 'ok' : 'bad'}` }, ui.compare.identical ? 'Recálculo idéntico: mismos hechos, sorteos, acta y órdenes' : 'El recálculo difiere') : null] : null)));
  root.append(...[live ? postMatchLearningCard(res, refresh) : null].filter(Boolean), ...actaCards(res), casesCard(LAB_CASES, { profile: store.baseNew, players: store.players }, res), lineupsCard(res), choicesCard(res), opportunitiesCard(res), statesDiagnosticCard(res), coachDiagnosticCard(res), finalStory(refresh, res, teamName));
}

// Diagnóstico ampliable de oportunidades y saques (MOTOR-06): ejes separados (procedencia, contexto, calidad previa, resultado) con numerador
// y denominador; un denominador cero es «no calculable». No es el catálogo estadístico avanzado ni una calibración.
function opportunitiesCard(res) {
  let q; try { q = diagnosticQueries(res); } catch { return null; }
  const pct = (r) => (r.calculable ? `${r.num}/${r.den} (${fmt(r.tasa * 100, 1)} %)` : `${r.num}/${r.den} — no calculable`);
  const proc = {}; const tags = {}; const ctx = {};
  for (const ev of res.events) if (ev.type === 'attempt' && ev.intent?.procedencia) { proc[ev.intent.procedencia] = (proc[ev.intent.procedencia] ?? 0) + 1; ctx[ev.intent.contexto ?? '—'] = (ctx[ev.intent.contexto ?? '—'] ?? 0) + 1; for (const t of ev.intent.etiquetasESP ?? []) tags[t] = (tags[t] ?? 0) + 1; }
  const s = q.primeraOpcionDeSaque;
  const rows = [
    [q.usoDirectoInicial.todos.nombre, `${pct(q.usoDirectoInicial.todos)} · temprano ${pct(q.usoDirectoInicial.temprano)} · organizado ${pct(q.usoDirectoInicial.organizado)}`, q.usoDirectoInicial.todos.definicion],
    [q.tripleDeTransicion.nombre, pct(q.tripleDeTransicion), q.tripleDeTransicion.definicion],
    [q.aceptacionInmediata.nombre, `${pct(q.aceptacionInmediata)} · ${Object.entries(q.aceptacionInmediata.porSituacion).map(([k, v]) => `${k} ${v.num}/${v.den}`).join(', ') || '—'}`, q.aceptacionInmediata.definicion],
    [q.familiaAutonoma.nombre, `${pct(q.familiaAutonoma)} · ${Object.entries(q.familiaAutonoma.porFamilia).map(([k, v]) => `${k} ${v.num}/${v.den}`).join(', ') || '—'}`, q.familiaAutonoma.definicion],
    [q.tempranoForzado.nombre, pct(q.tempranoForzado), q.tempranoForzado.definicion],
    [s.nombre, `inicios ${s.inicios} · primera opción recibida ${s.primeraOpcionRecibida}, negada ${s.primeraOpcionNegada} (${pct(s)}) · alternativa ${s.alternativaUsada} · seguridad ${s.seguridadUsada} · infracción de plazo ${s.infraccionDePlazo} · solicitudes de llamada ${s.solicitudes.llamadas} (consumidas ${s.solicitudes.consumidas}, caducadas ${s.solicitudes.caducadas}) · producción directa ${s.produccionDirecta.puntos} pts`, s.definicion],
  ];
  const chains = res.diagnostics.throwInChains ?? [];
  return h('details', { class: 'card' }, h('summary', {}, h('strong', {}, 'Oportunidades, procedencia y saques (diagnóstico)')),
    h('p', { class: 'small muted' }, 'Ejes separados: procedencia de la decisión (llamada/libro, recurso autónomo, decisión directa, saque), contexto de entrada, calidad previa y resultado. Una opción con varias etiquetas ESP cuenta una vez. Capas: ', Object.entries(q.capas).map(([k, v]) => `${k}: ${v}`).join(' · ')),
    table(['Consulta', 'Resultado', 'Definición'], rows),
    h('p', { class: 'small' }, `Procedencia de los intentos: ${Object.entries(proc).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'} · contexto: ${Object.entries(ctx).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'}`),
    h('p', { class: 'small' }, `Situaciones etiquetadas: ${Object.entries(tags).sort().map(([k, v]) => `${k} ${v}`).join(' · ') || 'ninguna'}`),
    chains.length ? table(['Saque', 'Posesión', 'Ficha', 'Sacador', 'Respuesta', 'Intentos', 'Cierre', 'Puntos directos'], chains.map((c) => [c.id, c.possession, c.ficha, c.sacador, c.respuesta, c.intentos.map((x) => `${x.opcion}${x.negada ? ' (negada)' : ''}`).join(' → '), c.cierre ?? 'abierta', c.puntosDirectos])) : h('p', { class: 'small muted' }, 'Sin saques de banda o fondo con ficha en este encuentro.'));
}

// Estados y episodios (diagnóstico de LABORATORIO): números comprometidos y timestamps. No se entrega al decisor ni al entrenador automático.
const CAT = (res, v) => { const b = res.profile.moment.categoryBoundaries; let i = 0; while (i < b.length && v >= b[i]) i += 1; return ['Muy frío', 'Frío', 'Estable', 'Caliente', 'Muy caliente'][i]; };
function statesDiagnosticCard(res) {
  const st = res.diagnostics.states; if (!st) return null;
  const rows = Object.entries(st.jugadores).map(([id, p]) => [id, fmt(p.forma, 2), ...['M_TIR', 'M_OFE', 'M_DEF'].map((k) => `${fmt(p.momentos[k].valor, 3)} · ${CAT(res, p.momentos[k].valor)} (hasta ${fmt(p.momentos[k].actualizadoHasta, 0)} s)`), fmt(p.energia, 1)]);
  const ep = res.diagnostics.episodes ?? [];
  return h('details', { class: 'card' }, h('summary', {}, h('strong', {}, 'Estados y episodios (diagnóstico de laboratorio)')),
    h('p', { class: 'small muted' }, `Importancia ${st.importancia} · reloj deportivo ${fmt(st.relojDeportivoSegundos, 0)} s de juego vivo. Valores comprometidos en su última frontera de actualización (la actualización es perezosa: un estado se procesa cuando una tarea o un episodio lo necesita). Es diagnóstico de laboratorio: no se filtra al entrenador automático.`),
    table(['Equipo', 'T final', 'Actualizado hasta (s)'], st.equipos.map((t) => [t.id, fmt(t.T, 3), fmt(t.actualizadoHasta, 0)]), { numeric: [1, 2] }),
    table(['Jugador', 'Forma', 'M-TIR', 'M-OFE', 'M-DEF', 'Energía'], rows),
    h('p', { class: 'small' }, `Pausas deportivas: ${st.pausas.map((p) => `${p.tipo} (periodo ${p.periodo})`).join(' · ') || 'ninguna'}. Episodios: ${ep.length} registros.`),
    ep.length ? table(['Episodio', 'Cadena', 'Destino', 'Magnitud', 'Estado', 'Evidencia'], ep.slice(0, 120).map((e) => [`${e.id} ${e.nombre}`, e.cadena, e.destino, `${e.signo > 0 ? '+' : e.signo < 0 ? '−' : ''}${fmt(e.magnitud ?? 0, 2)}`, e.estado, JSON.stringify(e.evidencia ?? e.tipoDePausa ?? '')])) : null);
}

function lineupsCard(res) {
  const mins = {};
  for (const ev of res.events) if (ev.durationTenths) for (const lid of ev.lineups) mins[lid] = (mins[lid] ?? 0) + ev.durationTenths;
  const rows = res.lineups.filter((l) => mins[l.id]).map((l) => [res.teams[l.team].id, l.id, Object.entries(l.slots).map(([s, id]) => `${s}:${id.split('-')[1]}`).join(' '), fmt(mins[l.id] / 600, 1)]);
  const subs = res.events.filter((e) => e.type === 'substitution'); const tos = res.events.filter((e) => e.type === 'timeout');
  const used = res.input.teams.map((t) => t.players.filter((p) => res.box.players[p.id].min > 0).length);
  return h('div', { class: 'card' }, h('h3', {}, 'Jugadores utilizados, quintetos, sustituciones y tiempos muertos'),
    h('p', {}, `Jugadores utilizados: ${res.teams[0].id} ${used[0]} · ${res.teams[1].id} ${used[1]} · sustituciones: ${subs.length} (${subs.filter((e) => e.intent.origen === 'orden manual').length} por orden manual) · tiempos muertos concedidos: ${tos.length}`),
    h('div', { class: 'grid2' },
      h('div', {}, h('h3', {}, 'Quintetos (minutos con el quinteto en pista)'), table(['Equipo', 'Quinteto', 'Posiciones', 'Min'], rows, { numeric: [3] })),
      h('div', {}, h('h3', {}, 'Sustituciones'), table(['Periodo', 'Reloj', 'Equipo', 'Entra', 'Sale', 'Origen', 'Motivo', 'Ventana'], subs.map((e) => [e.period, clockText(e.clock.after), res.teams[e.team].id, e.participants.entra, e.participants.sale, e.intent.origen, e.intent.motivo, e.effects.ventana ?? '']))),
      tos.length ? h('div', {}, h('h3', {}, 'Tiempos muertos'), table(['Periodo', 'Reloj', 'Equipo', 'Ventana', 'Restantes en el bloque'], tos.map((e) => [e.period, clockText(e.clock.after), res.teams[e.team].id, e.effects.ventana, e.effects.restantesBloque]))) : null));
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

function finalStory(refresh, res, teamName) {
  const periods = res.periodScores.map((p) => p.period); const name = (id) => id;
  const evs = res.events.filter((e) => ui.filter === 'all' || e.period === Number(ui.filter));
  const shown = evs.slice(0, ui.limit);
  const body = h('ul', {}); let lastPoss = null;
  for (const ev of shown) {
    if (ev.possessionId && ev.possessionId !== lastPoss) { lastPoss = ev.possessionId; body.append(h('li', { class: 'poss' }, `Periodo ${ev.period} · posesión ${ev.possessionId} · ataca ${teamName(ev.team)} · marcador ${ev.score.join('–')}`)); }
    body.append(h('li', {}, h('span', { class: 't' }, `${clockText(ev.clock.before)}→${clockText(ev.clock.after)} · pos. ${fmt(ev.shotClock.after / 10)}`), describeEvent(ev, { name, teamName }), ' ', h('button', { class: 'link small', onclick: () => showDetail(ev, res.teams, { profile: res.profile, table: res.diagnostics.paramTable, ref: res.meta.profileRef }) }, `ver detalle ${ev.id}`)));
  }
  return h('div', { class: 'card story' }, h('h3', {}, 'Relato cronológico por periodos y posesiones'),
    h('div', { class: 'row' }, h('label', {}, 'Periodo ', h('select', { onchange: (e) => { ui.filter = e.target.value; ui.limit = 150; refresh(); } }, h('option', { value: 'all', selected: ui.filter === 'all' }, 'Todos'), periods.map((p) => h('option', { value: p, selected: String(p) === String(ui.filter) }, periodName(p))))), h('span', { class: 'muted small' }, `Mostrando ${shown.length} de ${evs.length} acontecimientos. El relato se pagina; la descarga JSON conserva todos los registros.`)),
    body, evs.length > shown.length ? h('button', { class: 'btn secondary', style: 'margin-top:8px', onclick: () => { ui.limit += 200; refresh(); } }, 'Mostrar más') : null);
}

function download(res) {
  const blob = new Blob([JSON.stringify(res)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `beM-MOTOR02-${res.meta.rng.initialSeed}-${res.teams.map((t) => t.id).join('-')}.json` });
  document.body.append(a); a.click(); a.remove();
}

function recompute(res) {
  try { ui.compare = replayMatch(deepCopy(res)).comparison; } catch (e) { ui.compare = { identical: false, error: e.message }; }
  paintResult();
}

// ---------------------------------------------------------------- reproducir un JSON exportado
// ---------------------------------------------------------------- guardar y continuar (MOTOR-14 §10)
const savedLine = (m) => `${m.teams.map((t) => t.id).join(' – ')} · ${m.position.period ? (m.position.period <= 4 ? `C${m.position.period}` : `P${m.position.period - 4}`) : 'sin empezar'} ${clockText(m.position.clockTenths)} · ${m.position.score.join('–')} · paso ${m.position.stepSeq}`;
async function refreshSaves() {
  try { const r = await fetch('/api/saves'); ui.saves.list = (await r.json()).saves; ui.saves.err = null; } catch (e) { ui.saves.err = `No se pudo leer el almacén de guardados: ${e.message}`; }
  renderGame(ui.root);
}
async function saveNow() {
  const s = ui.session; if (!s || ui.saves.busy || ['preparado', 'finalizado', 'error'].includes(s.state)) return;
  ui.saves.busy = true; ui.saves.msg = null;
  try {
    const snap = s.snapshot({ label: ui.saves.label || null });
    const r = await fetch('/api/saves', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ snapshot: snap, label: ui.saves.label || null, branchOf: s.log.restoredFrom?.saveId ?? null }) });
    const j = await r.json();
    ui.saves.msg = j.ok ? `Guardado ${j.save.id} (${savedLine(j.save)}). La partida sigue en su estado actual.` : `No se guardó: ${j.reason}`;
  } catch (e) { ui.saves.msg = `No se guardó: ${e.message}`; }
  ui.saves.busy = false; await refreshSaves();
}
async function continueSave(id) {
  ui.saves.busy = true; ui.saves.msg = null;
  try {
    const r = await fetch(`/api/saves/${id}`); const j = await r.json();
    if (!j.ok) { ui.saves.msg = `No se puede continuar: ${j.reason}`; }
    else {
      const s0 = ui.session; if (s0) s0.dispose();
      const s = MatchSession.fromSnapshot(j.snapshot, { scheduler: sched() }); s.log.restoredFrom.saveId = id;
      ui.mode = s.mode; ui.managed = s.managedTeam; ui.draft = null; ui.compare = null; ui.call = null;
      store.matchRef = j.snapshot.identity.profileRef ?? store.profileRef; // el perfil congelado es el del guardado, no el activo
      s.subscribe(onSession); ui.session = s;
      ui.saves.msg = `Continuando ${id} como rama de laboratorio: el guardado original no se modifica. Perfil congelado del guardado: ${j.snapshot.identity.effectiveProfileId}.`;
    }
  } catch (e) { ui.saves.msg = `No se puede continuar: ${e.message}`; }
  ui.saves.busy = false; renderGame(ui.root);
}
function savesCard() {
  const s = ui.session; const canSave = s && !['preparado', 'finalizado', 'error'].includes(s.state);
  const list = ui.saves.list;
  return h('details', { id: 'saves', open: !!ui.saves.msg || !!canSave, style: 'margin-top:8px', ontoggle: (e) => { if (e.target.open && list == null) refreshSaves(); } }, h('summary', {}, 'Guardar y continuar'),
    h('p', { class: 'small muted' }, 'Guardar conserva el estado deportivo exacto del encuentro (azar, relojes, órdenes, energía, memoria y consecuencias pendientes) en la frontera actual, sin avanzarlo. Continuar retoma ese mismo encuentro con SU entrada y SU perfil congelados; cerrar la aplicación o pausar el visionado no crea una suspensión reglamentaria. Una continuación es una rama de laboratorio: el guardado original no se modifica.'),
    h('div', { class: 'row' },
      h('input', { type: 'text', id: 'save-label', placeholder: 'Etiqueta (opcional)', value: ui.saves.label, oninput: (e) => { ui.saves.label = e.target.value; } }),
      h('button', { class: 'btn', id: 'save-now', disabled: !canSave || ui.saves.busy, onclick: saveNow }, 'Guardar ahora'),
      h('button', { class: 'btn secondary', id: 'saves-refresh', onclick: refreshSaves }, 'Actualizar lista'),
      canSave ? null : h('span', { class: 'small muted' }, 'Se guarda un encuentro iniciado y no terminado.')),
    ui.saves.msg ? h('p', { id: 'saves-msg', class: 'small' }, ui.saves.msg) : null, ui.saves.err ? h('div', { class: 'errbox' }, ui.saves.err) : null,
    list == null ? h('p', { class: 'small muted' }, 'Abra la sección o pulse «Actualizar lista».') : !list.length ? h('p', { class: 'small muted' }, 'Sin guardados.') :
      table(['Guardado', 'Encuentro', 'Archivo', 'Motor · perfil', 'Estado', ''], list.map((m) => [m.label ? `${m.id} · ${m.label}` : m.id, m.position ? savedLine(m) : '—', m.savedAt ? m.savedAt.replace('T', ' ').slice(0, 19) : '—', m.engineVersion ? `${m.engineVersion} · ${m.effectiveProfileId}` : '—',
        m.complete && m.compatible ? h('span', { class: 'pill ok' }, 'Continuable') : h('span', { class: 'pill bad', title: m.problem ?? '' }, m.problem ?? 'No continuable'),
        h('span', { class: 'row' }, h('button', { class: 'btn secondary', disabled: !(m.complete && m.compatible) || ui.saves.busy, onclick: () => continueSave(m.id) }, 'Continuar'), m.complete ? h('a', { href: `/api/saves/${m.id}/download`, class: 'small' }, 'Descargar') : null)])));
}

function replayCard() {
  const r = ui.replay;
  const input = h('input', { type: 'file', accept: '.json,application/json', id: 'replay-file', onchange: onReplayFile });
  const body = [];
  if (r?.error) body.push(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'No se pudo leer el archivo: '), r.error));
  else if (r) {
    const v = r.validation;
    body.push(h('p', { class: 'small' }, `Archivo: ${r.name} · formato ${r.file.schema ?? '—'} · motor ${r.file.meta?.engineVersion ?? '—'}`));
    if (!v.reproducible) body.push(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, v.legacy ? 'No reproducible con esta versión.' : 'No se puede reproducir.'), h('ul', {}, v.problems.map((p) => h('li', {}, p)))));
    else body.push(h('div', { class: 'row' }, h('span', { class: 'pill ok' }, 'Formato, versión y referencias válidos'), h('button', { class: 'btn', id: 'replay-run', onclick: runReplay }, 'Reproducir (recalcular desde la entrada, la semilla y las órdenes)')));
    if (r.error2) body.push(h('div', { class: 'errbox' }, r.error2));
    if (r.run) {
      const c = r.run.comparison;
      body.push(h('p', {}, h('span', { class: `pill ${c.identical ? 'ok' : 'bad'}`, id: 'replay-verdict' }, c.identical ? 'Reproducción idéntica: mismos hechos, sorteos, acta, parciales y órdenes bajo la misma versión' : `La reproducción difiere (${Object.entries(c.parts).filter(([, ok]) => !ok).map(([k]) => k).join(', ')})`),
        c.firstEventDifference ? h('span', { class: 'small muted' }, ` Primer hecho distinto: #${c.firstEventDifference.index + 1}`) : null));
      body.push(h('div', { id: 'replay-result' }));
    }
  }
  return h('details', { open: !!r, style: 'margin-top:8px' }, h('summary', {}, 'Reproducir partido desde JSON'),
    h('p', { class: 'small muted' }, 'Acepta archivos exportados por esta versión del motor. Se valida formato, versión y referencias antes de ejecutar nada; el contenido del archivo se trata como datos. Se vuelve a calcular el deporte (no se muestra el acta guardada).'),
    h('div', { class: 'row' }, input), body);
}

async function onReplayFile(e) {
  const f = e.target.files?.[0]; if (!f) return;
  try {
    const file = JSON.parse(await f.text());
    ui.replay = { name: f.name, file, validation: validateReplayFile(file), run: null, error: null };
  } catch (err) { ui.replay = { name: f.name, file: {}, error: `JSON no válido (${err.message})` }; }
  renderGame(ui.root);
}
function runReplay() {
  const r = ui.replay;
  try { r.run = replayMatch(deepCopy(r.file), { detail: 'full' }); r.error2 = null; } catch (err) { r.run = null; r.error2 = err.message; }
  renderGame(ui.root);
  refreshReplay();
}
function refreshReplay() {
  const host = document.getElementById('replay-result'); const r = ui.replay; if (!host || !r?.run) return;
  clear(host); renderResult(host, r.run.result, { refresh: refreshReplay, banner: h('p', { class: 'small muted' }, 'Resultado del recálculo desde el archivo (no el acta almacenada).') });
}
