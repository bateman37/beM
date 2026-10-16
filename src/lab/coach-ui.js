// Entrenador automático en la preparación (MOTOR-08): política, ámbitos delegados y plan de participación. La participación y la política se precargan
// de forma explícita desde la extensión SEM y son revisables; ninguna política es «mejor» que otra ni da acierto por su nombre.
import { h } from './dom.js';
import { COACH_AREAS, defaultParticipationPlan, describeDecision } from '../match/index.js';

export const AREA_NAMES = {
  rotation: ['Rotaciones', 'Quién entra y sale según energía, utilidad por posición, estabilidad y participación objetivo.'],
  adjustments: ['Ajustes tácticos', 'Respuestas a patrones repetidos de la memoria (cobertura, estilos defensivos) con cambios de plan validados.'],
  fouls: ['Gestión de faltas', 'Librillo de faltas ordenado: protección, cierre y urgencia. La exclusión reglamentaria no es delegable.'],
  timeouts: ['Tiempos muertos', 'Solicita pausas por causa y evidencia, con reserva y enfriamiento; espera su ventana legal.'],
  endgame: ['Finales', 'Prioridades de cierre por contexto (urgencia, ataque rápido, tres, proteger ventaja, falta táctica).'],
};

// Controles de un equipo. `plan.coach` y `plan.participation` son entradas del encuentro (se validan con el perfil de MOTOR-08).
export function coachPrepControls({ team, plan, profile, starterSet, refresh }) {
  const cfg = profile.coach; const pol = cfg.policies; const cur = plan.coach;
  const policyRow = h('div', {},
    h('label', { class: 'row' }, h('strong', {}, 'Política: '),
      h('select', { id: `coach-policy-${team.id}`, onchange: (e) => { cur.policy = e.target.value; refresh(); } }, Object.entries(pol).map(([id, p]) => h('option', { value: id, selected: cur.policy === id }, `${id} · ${p.name}`)))),
    h('p', { class: 'small' }, pol[cur.policy]?.description ?? ''),
    h('p', { class: 'small muted' }, `Parámetros literales (SEM, editables solo en el Panel de ajustes): revisión de energía ${pol[cur.policy].energyReview}, relevo listo desde ${pol[cur.policy].benchReadyEnergy}, tramo mínimo en pista ${pol[cur.policy].minCourtStint} s, ganancia de recambio ${pol[cur.policy].replacementGain}, sacrificio por fatiga ${pol[cur.policy].fatigueUtilitySacrifice}, ventana de cierre ${pol[cur.policy].closingWindow} s.`));
  const deleg = h('div', {}, h('h4', {}, 'Ámbitos delegados'),
    h('div', { style: 'display:grid; gap:4px' }, COACH_AREAS.map((a) => h('label', { class: 'row' },
      h('input', { type: 'checkbox', id: `coach-${team.id}-${a}`, checked: !!cur.delegation[a], onchange: (e) => { cur.delegation[a] = e.target.checked; refresh(); } }),
      h('strong', {}, ` ${AREA_NAMES[a][0]} `), h('span', { class: 'small muted' }, AREA_NAMES[a][1])))),
    h('p', { class: 'small muted' }, 'Un ámbito no delegado se queda como recomendación visible: el entrenador lo reconoce, lo registra y no ejecuta nada. Una orden manual tuya siempre prevalece sobre el entrenador en su campo.'));
  const part = plan.participation;
  const pid = (id) => `${id}${starterSet.has(id) ? ' ★' : ''}`;
  const players = (sel, onch) => h('select', { onchange: onch }, team.players.map((p) => h('option', { value: p.id, selected: p.id === sel }, pid(p.id))));
  const total = part ? part.pairs.reduce((s, q) => s + q.starterMinutes + q.reliefMinutes, 0) : 0;
  const target = (profile.rules.quarters * profile.rules.quarterSeconds / 60) * 5;
  const participation = part ? h('div', {}, h('h4', {}, 'Plan de participación (minutos objetivo)'),
    h('p', { class: 'small muted' }, `Origen: ${part.source}. Objetivos orientativos de reparto por pareja funcional: son una revisión del entrenador, no una cuota rígida ni una regla de juego.`),
    h('table', { class: 'small' }, h('thead', {}, h('tr', {}, ['Posición', 'Titular', 'Relevo', 'Min. titular', 'Min. relevo'].map((c) => h('th', {}, c)))),
      h('tbody', {}, part.pairs.map((q) => h('tr', {}, h('td', {}, q.slot), h('td', {}, pid(q.starter)),
        h('td', {}, players(q.relief, (e) => { const n = e.target.value; const other = part.pairs.find((x) => x !== q && x.relief === n); if (other) other.relief = q.relief; q.relief = n; part.situational = part.situational.filter((s) => s !== n); refresh(); })),
        h('td', {}, h('input', { type: 'number', min: 0, step: 1, value: q.starterMinutes, onchange: (e) => { q.starterMinutes = Number(e.target.value); refresh(); } })),
        h('td', {}, h('input', { type: 'number', min: 0, step: 1, value: q.reliefMinutes, onchange: (e) => { q.reliefMinutes = Number(e.target.value); refresh(); } })))))),
    h('p', { class: `small ${Math.abs(total - target) < 1e-9 ? 'muted' : 'err'}` }, `Suma ${total} min; el tiempo reglamentario de cinco posiciones es ${target} min.`),
    h('p', { class: 'small muted' }, `Recursos situacionales (sin objetivo): ${(part.situational ?? []).join(', ') || '—'}.`),
    h('button', { class: 'btn secondary', type: 'button', onclick: () => { plan.participation = defaultParticipationPlan(profile, team.players, plan); refresh(); } }, 'Recargar la precarga SEM para este quinteto'))
    : h('p', { class: 'err small' }, 'Falta el plan de participación.', ' ', h('button', { class: 'btn secondary', type: 'button', onclick: () => { plan.participation = defaultParticipationPlan(profile, team.players, plan); refresh(); } }, 'Cargar precarga SEM'));
  const summary = `${cur.policy} · ${COACH_AREAS.filter((a) => cur.delegation[a]).length}/${COACH_AREAS.length} ámbitos delegados`;
  return { summary, node: h('div', { style: 'margin-top:8px' }, policyRow, deleg, participation) };
}

// ---------------------------------------------------------------- partido: delegación vigente, decisiones y bloqueos manuales
const STATE_PILL = { pendiente: 'warn', ejecutada: 'ok', cancelada: '', rechazada: 'bad', autorizada: 'ok', propuesta: '' };
export function coachLiveCard(s, rerender) {
  const m = s.match; const t = s.managedTeam; const st = m.coachState?.[t]; if (!st) return null;
  const locks = m.manualLocks(t); const decs = m.decisions.filter((d) => d.teamIdx === t).slice(-8).reverse();
  const open = s.state === 'enMarcha' || s.state === 'tiempoMuerto';
  const send = (spec) => { const o = s.submit({ type: 'coachDelegation', ...spec }); if (o.state === 'rechazada') alert(o.reason); rerender(); };
  const rival = m.coachState[1 - t];
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Entrenador de ${m.teams[t].id} · ${st.policy}`),
    h('p', { class: 'small muted' }, `Rival: ${m.teams[1 - t].id}, entrenador ${rival.policy} con ${COACH_AREAS.filter((a) => rival.delegation[a]).length}/${COACH_AREAS.length} ámbitos delegados (usa solo su vista permitida).`),
    h('div', { class: 'row' }, COACH_AREAS.map((a) => h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: !!st.delegation[a], disabled: open && false, onchange: (e) => send({ areas: { [a]: e.target.checked } }) }), ` ${AREA_NAMES[a][0]} `))),
    h('p', { class: 'small' }, locks.size ? h('span', { class: 'pill warn' }, `Control manual activo sobre: ${[...locks.keys()].join(', ')}`) : h('span', { class: 'muted' }, 'Sin bloqueos manuales: el entrenador puede ajustar los campos delegados.'), ' ',
      h('button', { class: 'btn secondary', type: 'button', disabled: !locks.size, onclick: () => send({ releaseLocks: true }) }, 'Devolver el control al entrenador')),
    h('p', { class: 'small muted' }, 'Un cambio de delegación entra en la siguiente frontera legal (nunca retroactivo). Una orden manual de plan fija su campo «hasta cambiarla» o «hasta final de cuarto».'),
    decs.length ? h('ul', { class: 'small' }, decs.map((d) => h('li', {}, h('span', { class: `pill ${STATE_PILL[d.estado] ?? ''}` }, d.estado), ` P${d.frontera.periodo ?? ''} · ${describeDecision(d)}`))) : h('p', { class: 'small muted' }, 'Todavía no hay decisiones del entrenador.'));
}

// ---------------------------------------------------------------- diagnóstico: registro de decisiones, conteos con su denominador y memoria
const row = (cells) => h('tr', {}, cells.map((c) => h('td', {}, c == null ? '—' : String(c))));
const tbl = (head, rows) => h('table', { class: 'small' }, h('thead', {}, h('tr', {}, head.map((c) => h('th', {}, c)))), h('tbody', {}, rows.map(row)));
export function coachDiagnosticCard(res) {
  const c = res.diagnostics.coach; const mem = res.diagnostics.memory; if (!c) return null;
  const k = c.counts;
  const counts = [
    ['Sustituciones', `${k.sustituciones.ejecutadas} ejecutadas de ${k.sustituciones.propuestas} propuestas · motivos: ${Object.entries(k.sustituciones.porMotivo).map(([a, b]) => `${a} ${b}`).join(', ') || '—'} · excepciones de estabilidad ${k.sustituciones.excepcionesDeEstabilidad}`],
    ['Tiempos muertos', `${k.tiemposMuertos.ejecutados} ejecutados de ${k.tiemposMuertos.solicitados} solicitados · ${k.tiemposMuertos.cancelados} cancelados · ${k.tiemposMuertos.rechazados} rechazados`],
    ['Ajustes', `${k.ajustes.aplicados} aplicados de ${k.ajustes.propuestos} propuestos · ${k.ajustes.reconocidos} patrones reconocidos (${k.ajustes.sinRespuesta} sin respuesta autorizada o compatible)`],
    ['Finales', `${k.finales.ejecutadas} ejecutadas de ${k.finales.decisiones} decisiones`], ['Faltas', `${k.faltas.decisiones} decisiones del librillo · ${k.faltas.mantener} de mantener`],
    ['Órdenes automáticas', `${k.ordenesAutomaticas} (no son comandos: se regeneran al reproducir)`]];
  const logN = (t) => mem.log.filter((x) => x.tipo === t).length;
  return h('details', { class: 'card' }, h('summary', {}, h('strong', {}, 'Entrenador y memoria (diagnóstico de laboratorio)')),
    h('p', { class: 'small muted' }, 'Cada conteo lleva su propio denominador: no son comparables entre sí. Las decisiones registran política, regla, frontera, observaciones y estado; reconocer un patrón no cambia ninguna probabilidad.'),
    tbl(['Concepto', 'Conteo'], counts),
    h('h4', {}, 'Memoria defensiva final'),
    h('p', { class: 'small muted' }, `Exposiciones ${logN('exposición')} · reconocimientos ${logN('reconocimiento')} · respuestas ${logN('respuesta')} · reemplazos ${logN('reemplazo')} · descartes ${logN('descarte')}. Máximo ocho patrones activos; evidencia con semivida de siete ataques rivales.`),
    ...mem.final.map((f) => h('div', {}, h('strong', { class: 'small' }, `${f.equipo} (${f.ataquesRivales} ataques rivales)`), f.entradas.length ? tbl(['Patrón', 'Evidencia', 'Cómodas', 'Exposiciones', 'Respuesta'], f.entradas.map((e) => [e.key + (e.patternName ? ` · ${e.patternName}` : ''), e.evidence, e.comfortableShare, e.exposures, e.response?.id ?? '—'])) : h('p', { class: 'small muted' }, 'Sin patrones activos.'))),
    h('h4', {}, `Registro de decisiones (${c.decisions.length})`),
    tbl(['Id', 'Equipo', 'Área', 'P', 'Reloj', 'Regla', 'Estado', 'Motivo'], c.decisions.slice(0, 250).map((d) => [d.id, d.equipo, d.area, d.frontera.periodo, d.frontera.reloj, d.regla, d.estado, d.motivo])));
}
