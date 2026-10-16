// Acta completa, parcial y final (MOTOR-09 §18.2) y casos preparados (§18.3). Solo lee `res.acta` / `res.reconciliation`: no calcula ni concede créditos.
import { h, table, fmt } from './dom.js';
import { GLOSSARY } from '../match/acta.js';

const pc = (v) => (v == null ? '—' : `${Math.round(v * 100)} %`);
const periodName = (p) => (p <= 4 ? `C${p}` : `P${p - 4}`);

const COLS = ['Jugador', 'Estado', 'Min', 'Pts', 'T2', 'T3', 'TC', '%TC', 'TL', '%TL', 'RO', 'RD', 'RT', 'AS (c/l)', 'Per', 'Rec', 'Tap', 'TRec', 'FC', 'FR', '+/-', 'Val'];

export function statusBanner(acta, res = null) {
  const st = acta.status;
  const text = st.definitive ? 'Acta definitiva: el encuentro terminó y no queda ninguna serie pendiente.'
    : `Acta PARCIAL${st.pendingSeries.length ? ` · series pendientes: ${st.pendingSeries.join(', ')}` : ''}${st.openFinals.length ? ` · finalizaciones abiertas: ${st.openFinals.join(', ')}` : ''}. Un encuentro suspendido o sin terminar no se muestra como definitivo.`;
  const adm = res?.administrative;
  return h('div', { class: `card ${st.definitive ? '' : 'warn'}` },
    h('p', { style: 'margin:0' }, h('strong', {}, text)),
    adm ? h('p', { class: 'small' }, h('strong', {}, `Resultado ADJUDICADO por terminación administrativa: ${adm.awarded.join('–')}`), ` (${adm.reason}). Es un dato distinto del tanteo de cancha (${acta.score.join('–')}): ningún jugador anota esos puntos.`) : null,
    res?.reconciliation ? h('p', { class: 'small' }, `Conciliación (${res.reconciliation.version}): `, h('span', { class: `pill ${res.reconciliation.ok ? 'ok' : 'warn'}` }, res.reconciliation.valid), ` · ${res.reconciliation.total - res.reconciliation.failed.length}/${res.reconciliation.total} comprobaciones` ) : null);
}

function teamCard(acta, t) {
  const T = acta.teams[t];
  const rows = T.players.map((id) => {
    const l = acta.players[id];
    return { cls: l.participation === 'DNP' || l.participation === 'indisponible' ? 'muted' : (l.starter ? 'starter' : ''), cells: [
      id, `${l.participation}${l.exit !== '—' ? ` · ${l.exit}` : ''}`, fmt(l.min), l.pts, `${l.fg2m}/${l.fg2a}`, `${l.fg3m}/${l.fg3a}`, `${l.fgm}/${l.fga}`, pc(l.pct.fg), `${l.ftm}/${l.fta}`, pc(l.pct.ft), l.oreb, l.dreb, l.reb, `${l.ast} (${l.astFg}/${l.astFt})`, l.tov, l.stl, l.blk, l.blkRec, l.pf, l.fr, l.pm > 0 ? `+${l.pm}` : l.pm, l.val] };
  });
  const x = T.totals; const c = T.collective;
  rows.push({ cls: 'muted', cells: ['Sujeto colectivo', 'equipo', '', '', '', '', '', '', '', '', c.rebOff || 0, c.rebDef || 0, c.reb || 0, '', c.tov, '', '', '', '', '', '', ''] });
  rows.push({ cls: 'starter', cells: ['Total equipo', '', fmt(x.min), x.pts, `${x.fg2m}/${x.fg2a}`, `${x.fg3m}/${x.fg3a}`, `${x.fgm}/${x.fga}`, pc(x.fga ? x.fgm / x.fga : null), `${x.ftm}/${x.fta}`, pc(x.fta ? x.ftm / x.fta : null), x.oreb, x.dreb, x.reb, `${x.ast} (${x.astFg}/${x.astFt})`, x.tov, x.stl, x.blk, x.blkRec, x.pf, x.fr, '', ''] });
  const fouls = Object.entries(T.fouls).map(([p, n]) => `${periodName(Number(p))}: ${n}`).join(' · ') || 'sin faltas de equipo';
  const tos = Object.entries(T.timeouts).map(([p, n]) => `${periodName(Number(p))}: ${n}`).join(' · ') || 'ninguno';
  const detail = h('details', {}, h('summary', {}, 'Detalle de faltas por tipo'),
    table(['Jugador', 'Personal', 'En tiro', 'Ofensiva', 'Disruptiva', 'Otras'], T.players.filter((id) => acta.players[id].pf).map((id) => { const f = acta.players[id].fouls; return [id, f.personal, f.tiro, f.ofensiva, f.disruptiva, f.otras]; }), { numeric: [1, 2, 3, 4, 5] }));
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Acta — ${T.id} ${T.name} · ${T.points} puntos`),
    table(COLS, rows, { numeric: Array.from({ length: COLS.length - 2 }, (_, i) => i + 2) }),
    h('p', { class: 'small muted' }, `Faltas de equipo por periodo (las prórrogas acumulan con el cuarto): ${fouls}. Tiempos muertos: ${tos}. Porcentaje sin intentos: «—», no 0 %. Mates: no representados («—»).`),
    c.tov || c.reb ? h('p', { class: 'small muted' }, `Conciliación del equipo: pérdidas individuales ${T.individualOnly.tov} + colectivas ${c.tov} = ${x.tov}; rebotes individuales ${T.individualOnly.reb} + colectivos ${c.reb} = ${x.reb}. Los créditos de equipo no se esconden en una ficha.`) : null,
    detail);
}

export function actaCards(res, acta = res.acta) {
  const parts = h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Periodo'), h('th', {}, `${acta.teams[0].id}`), h('th', {}, `${acta.teams[1].id}`))),
    h('tbody', {}, acta.periods.map((p) => h('tr', {}, h('td', {}, periodName(p.period)), h('td', { class: 'num' }, p.points[0]), h('td', { class: 'num' }, p.points[1])))));
  const part = acta.partition; const o = part.byOrigin;
  const F = acta.finals; const poss = acta.possessions;
  const byTeam = [0, 1].map((t) => ({ poss: poss.filter((p) => p.team === t).length, f: F.filter((f) => f.team === t).length, fp: F.filter((f) => f.team === t).reduce((s, f) => s + f.points, 0) }));
  const dets = h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Posesiones, finalizaciones F y partición de puntos'),
    table(['Equipo', 'Posesiones beM', 'F', 'Puntos de F'], [0, 1].map((t) => [acta.teams[t].id, byTeam[t].poss, byTeam[t].f, byTeam[t].fp]), { numeric: [1, 2, 3] }),
    h('p', { class: 'small muted' }, 'Las posesiones no tienen por qué ser iguales para ambos equipos. F ≠ FGA ≠ posesión.'),
    h('p', { class: 'small' }, `Partición A (por origen): F ${o.f} + sanción no de tiro ${o.sanction} + administrativos ${o.administrative} + otros ${o.other} = ${part.total}.`),
    h('p', { class: 'small' }, `Partición B (por posesión): vinculados a posesiones beM ${part.byPossession.linked} + no vinculados ${part.byPossession.unlinked} = ${part.total}. Son dos clasificaciones del mismo total, no se suman.`),
    h('details', {}, h('summary', {}, `Series de libres (${acta.series.length})`), table(['Serie', 'Lanzador', 'Causa', 'Concedidos', 'Administrados', 'Válidos', 'Repetidos', 'Anulados', 'Convertidos', 'F ligada'], acta.series.map((s) => [s.id, s.shooter, s.cause, s.granted, s.administered, s.valid, s.repeated, s.annulled, s.made, s.final ?? '—']), { numeric: [3, 4, 5, 6, 7, 8] })),
    h('details', {}, h('summary', {}, `Cierre de posesiones (${poss.length})`), table(['Posesión', 'Equipo', 'Periodo', 'Cierre', 'Puntos', 'F'], poss.map((p) => [p.id, acta.teams[p.team].id, periodName(p.period), p.closeCause, p.points, p.finals]), { numeric: [4, 5] })),
    acta.revision ? h('p', { class: 'small' }, `Revisión efectiva ${acta.revision.effective} (${acta.revision.ids.join(', ') || '—'}).`) : null);
  const conc = res.reconciliation ? h('details', { class: 'card' }, h('summary', {}, `Diagnóstico de conciliación · ${res.reconciliation.valid} (${res.reconciliation.version})`),
    h('p', { class: 'small muted' }, 'Separado de la lectura ordinaria del acta: universo, esperado, observado y hechos causantes. Una desviación no se corrige alterando el acta.'),
    table(['Id', 'Área', 'Universo', 'Esperado', 'Observado', 'Resultado'], res.reconciliation.checks.map((c) => ({ cls: c.ok ? '' : 'warn', cells: [c.id, c.area, c.universe, JSON.stringify(c.expected), JSON.stringify(c.observed), c.ok ? 'correcto' : `DESVIACIÓN ${c.facts.join(', ')}`] })))) : null;
  const gl = h('details', { class: 'card' }, h('summary', {}, 'Glosario de abreviaturas'), h('dl', {}, Object.entries(GLOSSARY).flatMap(([k, v]) => [h('dt', {}, h('strong', {}, k)), h('dd', {}, v)])));
  return [statusBanner(acta, res), h('div', { class: 'grid2' }, [0, 1].map((t) => teamCard(acta, t))), h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Parciales'), parts), dets, conc, gl];
}

// ---------------------------------------------------------------- casos preparados
export function casesCard(cases, runCase, lastResult) {
  const out = h('div', { id: 'case-out' });
  const run = (c) => {
    out.replaceChildren();
    let r; try { r = c.run({ profile: runCase.profile, players: runCase.players, result: lastResult }); } catch (e) { out.append(h('p', { class: 'warn' }, `El caso no se pudo cargar: ${e.message}`)); return; }
    if (r.needsResult) { out.append(h('p', { class: 'warn' }, 'Este caso necesita un encuentro ya jugado: juega uno en «Partido» o usa «Partido de referencia».')); return; }
    out.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, c.title), h('p', {}, h('span', { class: 'pill warn' }, 'Caso preparado'), ' Cargado sobre una copia; no altera plantillas, planes ni partidos históricos.'),
      h('h4', {}, 'Entradas'), h('ul', {}, c.inputs.map((x) => h('li', {}, x))), h('h4', {}, 'Resultado esperado'), h('ul', {}, c.expected.map((x) => h('li', {}, x))),
      h('h4', {}, 'Resultado obtenido'), h('pre', {}, JSON.stringify(r.highlights, null, 1))));
    const res = r.res ?? r.full ?? null;
    if (r.acta && res) out.append(...actaCards({ ...res, acta: r.acta, reconciliation: r.reconciliation, administrative: r.administrative ?? null }, r.acta));
  };
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Casos de laboratorio preparados'),
    h('p', { class: 'small muted' }, 'Situaciones difíciles de encontrar de forma natural. Están rotuladas como preparadas y muestran sus entradas; pasan por la misma matriz reglamentaria, acta, conciliación y revisiones que un encuentro natural.'),
    h('div', { class: 'chips' }, cases.map((c) => h('button', { type: 'button', class: 'chip', onclick: () => run(c) }, `${c.title}`))), out);
}
