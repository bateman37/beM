// Pestaña «Análisis» (MOTOR-10 §17): resumen, acta y comparación, evolución, tiro y calidad, ataque, defensa, rotaciones/quintetos, informes y diagnóstico.
// Solo LEE el resultado: no ejecuta partidos, no consume azar y no modifica nada deportivo. Cada cifra lleva su muestra y cada afirmación abre su evidencia.
import { h, clear, table, fmt } from './dom.js';
import { store } from './store.js';
import { analyze, AUDIENCES, VISIBILITY, FILTER_FIELDS, filterCompat, CATALOG, ANALYSIS_VERSION } from '../analysis/index.js';
import { reconcileAnalysis } from '../analysis/reconcile.js';
import { fmtVal } from '../analysis/formulas.js';
import { periodName, clockText } from '../analysis/facts.js';
import { AUDIENCE_LABEL } from '../analysis/visibility.js';
import { FAMILY_LABEL } from '../analysis/offense.js';
import { COVERAGE_CATEGORIES } from '../analysis/coverage.js';
import { validateReplayFile } from '../match/replay.js';

const VIEWS = [['resumen', 'Resumen'], ['acta', 'Acta y comparación'], ['evolucion', 'Evolución'], ['tiro', 'Tiro y calidad'], ['ataque', 'Ataque'], ['defensa', 'Defensa'], ['rotaciones', 'Rotaciones y quintetos'], ['informes', 'Informes'], ['diagnostico', 'Diagnóstico y cobertura'], ['exportar', 'Exportar']];
const st = { order: null, source: 'last', file: null, fileName: null, audience: 'public', team: 0, view: 'resumen', filters: {}, through: null, group: [], player: null, root: null, open: null };
const pc = (r) => (r == null || r.value == null ? '—' : `${r.value.toFixed(1)} %`);
const cnt = (r) => (r == null ? '' : `${r.num}/${r.den}`);
const pill = (txt, cls = '') => h('span', { class: `pill ${cls}` }, txt);

function currentResult() {
  if (st.source === 'file') return st.file;
  if (st.source === 'live') return store.liveResult?.() ?? null;
  return store.last ?? null;
}
const repaint = () => { if (st.root) renderAnalysis(st.root); };
const tn = (res, t) => `${res.teams[t].name} (${res.teams[t].id})`;
const who = (res, id) => (id ? `${id}` : '—');

export function renderAnalysis(root) {
  st.root = root; clear(root);
  root.append(h('h2', {}, 'Análisis del encuentro'));
  const res = currentResult();
  root.append(sourceBar(res));
  if (!res) { root.append(h('div', { class: 'card' }, h('p', {}, 'Todavía no hay un encuentro que leer. Termina uno en «Partido», abre el partido en curso (lectura parcial) o carga un encuentro exportado.'))); return; }
  if (!res.acta && !res.events) { root.append(h('div', { class: 'errbox' }, 'El archivo no contiene hechos analizables.')); return; }
  const a = analyze(res, { audience: st.audience, team: st.team });
  root.append(controlBar(res, a));
  root.append(h('div', { class: 'chips', role: 'tablist' }, VIEWS.map(([id, label]) => h('button', { type: 'button', class: `chip ${st.view === id ? 'on' : ''}`, 'aria-pressed': st.view === id, onclick: () => { st.view = id; repaint(); } }, label))));
  const body = h('div', { id: 'analysis-body' }); root.append(body);
  try { body.append(...VIEW_FN[st.view](res, a)); } catch (e) { body.append(h('div', { class: 'errbox' }, h('strong', { class: 'err' }, 'No se pudo construir esta vista: '), e.message)); console.error(e); }
}

function sourceBar(res) {
  const file = h('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'cargar encuentro exportado', onchange: async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const data = JSON.parse(await f.text()); if (!Array.isArray(data.events) || !data.input || !data.acta) throw new Error('no es un encuentro exportado por esta versión (faltan hechos, entrada o acta)'); st.file = data; st.fileName = f.name; st.source = 'file'; st.filters = {}; repaint(); } catch (err) { alert(`No se pudo leer el archivo: ${err.message}`); }
  } });
  const src = (id, label) => h('button', { type: 'button', class: `btn ${st.source === id ? '' : 'secondary'}`, onclick: () => { st.source = id; st.filters = {}; repaint(); } }, label);
  const info = res ? `${res.teams[0].id} ${res.score[0]}–${res.score[1]} ${res.teams[1].id} · semilla ${res.meta?.rng?.initialSeed ?? res.input?.seed} · estado ${res.status}${st.source === 'file' ? ` · archivo ${st.fileName}` : ''}` : 'sin encuentro';
  return h('div', { class: 'card' }, h('div', { class: 'row' }, h('strong', {}, 'Fuente: '), src('last', 'Último encuentro terminado'), src('live', 'Partido en curso (lectura parcial)'), h('label', { class: 'small' }, 'Encuentro exportado: ', file)),
    h('p', { class: 'small muted' }, `${info}. Leer, filtrar, narrar y exportar no modifica el partido ni consume azar. El análisis de un encuentro exportado no lo reproduce: lee sus hechos y su acta tal como se guardaron.`));
}

function controlBar(res, a) {
  const sel = (label, value, opts, on) => h('label', { class: 'small' }, `${label} `, h('select', { 'aria-label': label, onchange: (e) => on(e.target.value) }, opts.map(([v, t]) => h('option', { value: v, selected: String(v) === String(value) }, t))));
  return h('div', { class: 'card' }, h('div', { class: 'row' },
    sel('Audiencia', st.audience, AUDIENCES.map((x) => [x, AUDIENCE_LABEL[x]]), (v) => { st.audience = v; repaint(); }),
    st.audience === 'diagnostic' ? pill('DIAGNÓSTICO: no se distribuye como informe de equipo', 'warn') : sel('Equipo (sujeto de las tablas y perspectiva)', st.team, [0, 1].map((t) => [t, tn(res, t)]), (v) => { st.team = Number(v); repaint(); }),
    pill(`política ${a.params.policy}`), pill(`acta ${a.ix.acta.policy}`)),
  h('p', { class: 'small muted' }, st.audience === 'public' ? 'Público/rival: hechos observables, acta, acciones y organizaciones ejecutadas. No incluye prioridades, procedencia de la decisión, sacador preferido ni probabilidades.' : st.audience === 'own' ? `Propia (${res.teams[st.team].id}): añade plan y libro conocidos de ${res.teams[st.team].id}; del rival solo se ve lo público.` : 'Diagnóstico de laboratorio: probabilidades y cálculos exactos. Acceso separado; no se entrega al entrenador ni se mezcla con la vista pública.'));
}

// ---------------------------------------------------------------- evidencia
function evidence(res, a, ids, query) {
  if (!ids?.length && !query) return null;
  const shown = (ids ?? []).slice(0, 30);
  return h('details', { class: 'small' }, h('summary', {}, `Evidencia (${ids?.length ?? 0} hechos${query ? ` · consulta ${JSON.stringify(query)}` : ''})`),
    h('div', { class: 'chips' }, shown.map((id) => h('button', { class: 'chip', type: 'button', title: describeId(a, id), onclick: () => alert(describeId(a, id)) }, id)), (ids?.length ?? 0) > 30 ? h('span', { class: 'muted' }, `… y ${ids.length - 30} más`) : null),
    query ? h('p', { class: 'muted' }, 'Consulta reproducible: ', h('code', {}, JSON.stringify(query)), '. ', h('button', { class: 'link', type: 'button', onclick: () => openQuery(query) }, 'Abrir la tabla con este filtro')) : null);
}
function openQuery(q) {
  const view = { shots: 'tiro', executions: 'ataque', coverage: 'defensa', lineup: 'rotaciones', throwins: 'defensa', points: 'evolucion', labels: 'acta', rebounds: 'informes' }[q.view] ?? 'tiro';
  st.view = view; st.filters = { ...(q.filters ?? {}) }; if (q.team != null && st.audience !== 'diagnostic') st.team = q.team; if (q.players) st.group = q.players; repaint();
}
function describeId(a, id) {
  const ev = a.ix.byId[id]; if (ev) { const sh = (ev.stats ?? []).find((x) => x.k === 'shot'); return `${id} · ${periodName(ev.period)} ${clockText(ev.clock?.before)} · ${ev.type}${sh ? ` · ${sh.p} ${sh.zone} ${sh.made ? 'convertido' : 'fallado'}` : ''} · marcador ${ev.score?.join('–')}`; }
  const p = a.ix.possessions.find((x) => x.id === id); if (p) return `${id} · posesión de ${a.name(p.team)} · ${periodName(p.period)} · ${p.points} puntos · cierre: ${p.closeCause}`;
  return id;
}

// ---------------------------------------------------------------- vistas
const VIEW_FN = {
  resumen(res, a) {
    const S = a.summary(); const out = [];
    out.push(h('div', { class: 'card' }, h('div', { class: 'score' }, S.headline), h('p', { class: 'small' }, S.statusText),
      table(['Periodo', ...res.teams.map((t) => t.id)], S.partials.map((p) => [p.label, ...p.points]), { numeric: [1, 2] })));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, S.keys.length ? `Claves (${S.keys.length} de hasta ${a.params.summary.maxKeys})` : 'Claves'),
      S.keys.length ? h('ol', {}, S.keys.map((k) => h('li', {}, h('div', {}, k.text), h('div', { class: 'small muted' }, `Regla ${k.id} · ${k.category} · muestra ${k.sample ?? '—'} · versión ${ANALYSIS_VERSION}`), evidence(res, a, k.evidence.ids, k.evidence.query))))
        : h('p', {}, 'No hay claves con evidencia suficiente: los datos crudos siguen en las demás vistas.'),
      S.keyNote ? h('p', { class: 'small muted' }, S.keyNote) : null,
      S.redundant.length ? h('p', { class: 'small muted' }, `Descartadas por redundancia (misma explicación): ${S.redundant.map((r) => `${r.id}~${r.redundantWith}`).join(', ')}.`) : null,
      h('p', { class: 'small muted' }, 'Los umbrales de destaque son editoriales (SEM), no significación estadística. La ausencia de un destaque no impide explicar el marcador con el desglose siguiente.')));
    out.push(h('div', { class: 'grid2' },
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Margen del tanteo de cancha, explicado'), table(['Componente', 'Diferencia (A − B)'], S.margin.parts.map(([l, v]) => [l, v > 0 ? `+${v}` : v]), { numeric: [1] }),
        h('p', { class: 'small' }, `Suma = ${S.margin.total} · margen ${S.margin.margin} ${S.margin.ok ? '(cuadra)' : '(NO cuadra: desviación)'}`), h('p', { class: 'small muted' }, 'Las etiquetas tras pérdida, transición o segunda oportunidad se solapan y no se suman como causas independientes.')),
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Líderes'), table(['Criterio', 'Valor', 'Jugadores'], S.leaders.map((l) => [l.label, l.value, `${l.leaders.map((x) => x.id).join(', ') || '—'}${l.note ? ` (${l.note})` : ''}`]), { numeric: [1] }),
        h('p', { class: 'small muted' }, 'Un nombre puede repetirse en varias categorías; los empates se conservan. No se anuncian récords sin historial comparable.'))));
    if (S.chronicle.length) out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Crónica por periodo (${S.chronicleKind})`), h('ul', {}, S.chronicle.map((c) => h('li', {}, c.text))), h('p', { class: 'small muted' }, 'Cada bloque usa solo los hechos hasta el cierre de su periodo (no conoce el resultado futuro).')));
    else out.push(h('div', { class: 'card warn' }, 'Sin crónica normal: el encuentro no terminó de forma válida. Solo se muestra lo ocurrido válidamente.'));
    return out;
  },

  acta(res, a) {
    const ind0 = a.indicators(0); const ind1 = a.indicators(1);
    const rows = ind0.map((r, i) => ({ cls: r.coverage !== 'disponible' ? 'muted' : '', cells: [h('span', { title: `${r.calc ?? ''} · universo: ${r.universe ?? '—'} · ${r.note ?? ''}` }, r.label), r.display, r.sample?.warn ? pill('muestra corta', 'warn') : '', ind1[i].display, ind1[i].sample?.warn ? pill('muestra corta', 'warn') : '', r.unit, r.coverage] }));
    const ff = a.fourFactors(); const rt = a.ratings(); const pace = a.pace();
    const out = [h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Comparación de equipos (catálogo común)'),
      table(['Indicador', tn(res, 0), '', tn(res, 1), '', 'Unidad', 'Cobertura'], rows, { numeric: [1, 3] }),
      h('p', { class: 'small muted' }, 'Pasa el ratón por el nombre para ver la fórmula y el universo. «—» siempre lleva motivo (sin denominador, no registrado, dependiente de datos o información diagnóstica); nunca es un cero. eFG y TS pueden superar 100 %.')),
    h('div', { class: 'grid2' },
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Cuatro factores'), table(['', tn(res, 0), tn(res, 1)], [['eFG %', fmtVal(ff[0].eFG), fmtVal(ff[1].eFG)], ['PER por 100 ataques (exacto beM)', fmtVal(ff[0].tov100), fmtVal(ff[1].tov100)], ['TOV % convencional', fmtVal(ff[0].tovConv), fmtVal(ff[1].tovConv)], ['RO % de acta', fmtVal(ff[0].oreb), fmtVal(ff[1].oreb)], ['Libres por tiro de campo', fmtVal(ff[0].ftRate, 2), fmtVal(ff[1].ftRate, 2)]], { numeric: [1, 2] }), h('p', { class: 'small muted' }, ff[0].note)),
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Eficiencia y ritmo'), table(['', tn(res, 0), tn(res, 1)], [['Posesiones beM', rt[0].poss, rt[1].poss], ['ORtg global', fmtVal(rt[0].ortg), fmtVal(rt[1].ortg)], ['DRtg global', fmtVal(rt[0].drtg), fmtVal(rt[1].drtg)], ['NetRtg', rt[0].net.value == null ? '—' : rt[0].net.value.toFixed(1), rt[1].net.value == null ? '—' : rt[1].net.value.toFixed(1)]], { numeric: [1, 2] }),
        h('p', { class: 'small' }, `Ritmo ${pace.pace == null ? '—' : pace.pace.toFixed(1)} posesiones por ${pace.L} min (D disputada ${pace.D.toFixed(1)} min).`), h('p', { class: 'small muted' }, rt[0].note))),
    productionCard(res, a), assistCard(res, a),
    h('p', { class: 'small' }, 'Acta completa por jugador y conciliación: pestaña «Partido» (se lee la misma acta).')];
    return out;
  },

  evolucion(res, a) {
    const e = a.ev(); const out = [];
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Diferencia de marcador (equipo A − B)'), curveSvg(e.curve, res), h('p', { class: 'small muted' }, 'Curva escalonada por anotaciones válidas. Los hechos con el mismo reloj conservan su secuencia; un libre puede cambiar el líder sin sumar tiempo.')));
    const ml = e.maxLead; const sh = (x) => (x ? `+${x.lead} (${periodName(x.period)} ${clockText(x.remaining)}, ${x.score.join('–')})` : 'nunca por delante');
    out.push(h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Ventaja, empates y líder'),
      table(['Dato', 'Valor'], [[`Máxima ventaja ${res.teams[0].id}`, sh(ml[0])], [`Máxima ventaja ${res.teams[1].id}`, sh(ml[1])], ['Primera ventaja', e.firstLead ? `${res.teams[e.firstLead.team].id} (${periodName(e.firstLead.period)} ${clockText(e.firstLead.remaining)})` : '—'], ['Empates producidos por anotación (sin el 0–0 inicial)', e.ties.length], ['Cambios de líder (la primera ventaja no cuenta)', e.leadChanges.length],
        [`Tiempo por delante ${res.teams[0].id}`, `${(e.time.ahead[0] / 600).toFixed(1)} min`], [`Tiempo por delante ${res.teams[1].id}`, `${(e.time.ahead[1] / 600).toFixed(1)} min`], ['Tiempo empatado', `${(e.time.tied / 600).toFixed(1)} min`]]),
      h('p', { class: 'small muted' }, 'Tiempo por intervalos de juego vivo con el marcador previo; las pausas no suman.')),
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Parciales sin respuesta (≥ ${a.params.summary.unansweredMin})`), e.runs.length ? table(['Equipo', 'Puntos', 'Desde', 'Hasta', 'Margen'], e.runs.map((r) => [res.teams[r.team].id, r.points, `${periodName(r.from.period)} ${r.from.event}`, `${periodName(r.to.period)} ${r.to.event}`, `${r.marginBefore} → ${r.marginAfter}`]), { numeric: [1] }) : h('p', { class: 'small' }, 'Ninguno alcanza el umbral.'),
      h('p', { class: 'small muted' }, 'Un tiempo muerto no rompe por sí solo un parcial. El total puede atravesar cuartos; la consulta de un periodo se restringe a él.'))));
    const adj = adjustedList(res, a); out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Final ajustado (últimos ${a.params.adjustedFinal.seconds} s de Q4/prórroga y margen previo ≤ ${a.params.adjustedFinal.margin})`), adj));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Crónica hasta un periodo (sin futuro)'), h('div', { class: 'chips' }, e.curve.length ? [...new Set(a.ix.events.map((x) => x.period))].filter((p) => p >= 1).map((p) => h('button', { type: 'button', class: `chip ${st.through === p ? 'on' : ''}`, onclick: () => { st.through = st.through === p ? null : p; repaint(); } }, `hasta ${periodName(p)}`)) : null),
      h('ul', {}, (st.through ? a.chronicleThrough(st.through) : a.summary().chronicle).map((c) => h('li', {}, c.text)))));
    return out;
  },

  tiro(res, a) {
    const t = st.audience === 'diagnostic' ? st.team : st.team; const out = [filterBar(res, a, ['period', 'scoreState', 'adjustedFinal', 'clockEnd', 'zone', 'quality', 'result', 'shooter', 'family', 'coverage'])];
    const info = a.shots(t, st.filters); const lines = [];
    out.push(h('div', { class: 'card' }, h('p', { class: 'small' }, `Vista de HECHOS (tiros) de ${tn(res, t)}: ${info.shots.length} elegibles, ${info.excluded} excluidos por el filtro${info.empty ? ` · ${info.empty}` : ''}. ${info.warnings.join(' ')}`)));
    const sec = a.sectors(t, st.filters); const max = Math.max(1, ...sec.map((s) => s.att));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Mapa sectorial (frecuencia y acierto: dos escalas distintas)'),
      table(['Sector', 'Resolución', 'Intentos', 'Convertidos', 'Acierto', 'Frecuencia', 'Puntos', 'Frecuencia (barra)'], sec.map((s) => [s.label, s.resolution, s.att, s.made, pc(s.pct), pc(s.freq), s.points, h('div', { class: 'bar' }, h('i', { style: `width:${(100 * s.att) / max}%` }))]), { numeric: [2, 3, 4, 5, 6] }),
      h('p', { class: 'small muted' }, 'El motor registra la zona (aro, resto de pintura, media, triple), no el lado: no se reparten tiros entre izquierda y derecha. «Sector desconocido» se conserva aunque esté a cero. El valor del tiro procede del hecho vigente, no del dibujo.')));
    const sd = a.sectorDetail(t, st.filters);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Triples y media distancia por función del tirador (lado desconocido)'),
      sd.length ? table(['Zona', 'Función del tirador en la disposición vigente', 'Intentos', 'Convertidos', 'Acierto'], sd.map((r) => [r.zone === 'three' ? 'Triple' : 'Media distancia', r.label, r.att, r.made, pc(r.pct)]), { numeric: [2, 3, 4] }) : h('p', { class: 'muted small' }, 'Sin tiros exteriores en este filtro.'),
      h('p', { class: 'small muted' }, 'Dato propio conservado de la disposición (esquina, ala, cabecera…); el motor no resuelve el lado, que sigue siendo desconocido: no se sortea izquierda/derecha. Sin disposición (transición, recurso) la función es desconocida. La audiencia pública no ve la función del tirador.')));
    const q = a.quality(t, st.filters);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Calidad previa frente al resultado'), table(['Calidad previa', 'Intentos', 'Convertidos', 'Acierto', 'Frecuencia'], q.map((r) => [r.label, r.att, r.made, pc(r.pct), pc(r.freq)]), { numeric: [1, 2, 3, 4] }),
      h('p', { class: 'small muted' }, 'La calidad se fija antes del desenlace (preparación, oposición, contexto y reloj). Una estrella puede convertir una forzada y un mal tirador fallar una cómoda; ambas se quedan en su categoría. No se calcula producción esperada ni puntos evitados.')));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Indicadores de tiro con este filtro'), h('p', { class: 'small muted' }, 'Los indicadores de partido completo (posesión, F, acta) no se habilitan con un filtro de tiros: se explica en la propia fila.'),
      table(['Indicador', 'Valor', 'Numerador/denominador', 'Muestra', 'Nota'], a.indicators(t, st.filters).filter((r) => ['TC_PCT', 'T2_PCT', 'T3_PCT', 'EFG', 'FREQ3', 'FGPPA', 'AST_PCT', 'ORTG', 'PTS_F'].includes(r.id)).map((r) => [r.label, r.display, r.num == null ? '' : `${Math.round(r.num * 10) / 10}/${r.den}`, r.sample?.n ?? '—', r.incompatible ? h('span', { class: 'small' }, r.reason) : (r.sample?.message ?? '')]), { numeric: [1, 2, 3] }),
      evidence(res, a, info.shots.map((s) => s.id), { view: 'shots', team: t, filters: st.filters })));
    out.push(shotList(res, a, info.shots));
    return out.concat(lines);
  },

  ataque(res, a) {
    const t = st.team; const out = [filterBar(res, a, ['period', 'scoreState', 'adjustedFinal'], 'possessions')];
    const o = a.origin(t, st.filters);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Origen principal de posesión — ${tn(res, t)} (${o.total} posesiones)`),
      table(['Origen', 'Posesiones', 'Frecuencia', 'Puntos vinculados', 'PPP', 'F', 'Tiros', 'Libres', 'Pérdidas', 'Rebotes of.', 'Cómodas/normales/forzadas'], o.rows.map((r) => [r.label, r.poss, pc(r.freq), r.points, fmtVal(r.ppp, 2), r.finals, r.shots, r.fta, r.tov, r.oreb, `${r.quals.comfortable}/${r.quals.normal}/${r.quals.forced}`]), { numeric: [1, 2, 3, 4, 5, 6, 7, 8, 9] }),
      h('p', { class: 'small' }, `Las filas ${o.reconciles ? 'reconcilian' : 'NO reconcilian'} el total elegible. Puntos sin vínculo a posesión (administrativos): ${o.unlinkedPoints} (fuera de todo PPP).`), h('p', { class: 'small muted' }, o.note)));
    const ex = a.executions(t);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Ejecuciones encadenadas (${ex.executions} en ${ex.possessions} posesiones)`),
      table(['Familia / ficha', 'Ejecuciones', '% de ejecuciones', 'Posesiones donde aparece', '% de posesiones', 'Resultado local'], ex.rows.map((r) => [r.label, r.ex, pc(r.pctEx), r.poss, pc(r.pctPoss), r.local]), { numeric: [1, 2, 3, 4] }), h('p', { class: 'small muted' }, ex.note)));
    const bk = a.book(t); const dr = a.directors(t);
    out.push(h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Libro y prioridades (propio)'), bk.available ? [table(['Prioridad', '1', '2', '3', '4', '5', 'Fuera de libro', 'Sin dato'], [['Ejecuciones', ...Object.values(bk.priorities), bk.outOfBook, bk.unknown]]), h('p', { class: 'small muted' }, bk.note)] : h('p', { class: 'small' }, bk.reason)),
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Director (propio)'), dr.rows ? [table(['Director', 'Ataques dirigidos', 'Puntos', 'PPP', 'Finalizaciones propias', 'Pérdidas'], dr.rows.map((r) => [r.director, r.directed, r.points, fmtVal(r.ppp, 2), r.ownFinishes, r.tov]), { numeric: [1, 2, 3, 4, 5] }), h('p', { class: 'small muted' }, dr.note)] : h('p', { class: 'small' }, dr.reason))));
    const oa = a.observableActors(t);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Actor observable de la primera interacción (hecho permitido para todas las audiencias)'),
      table(['Actor', 'Primeras interacciones', 'Puntos de esas posesiones', 'Con pase previo'], oa.rows.map((r) => [r.actor, r.first, r.points, r.passes]), { numeric: [1, 2, 3] }), h('p', { class: 'small muted' }, oa.note)));
    out.push(offBallCard(res, a, t));
    return out;
  },

  defensa(res, a) {
    const t = st.team; const out = [];
    const org = a.organizations(t); const cov = a.coverages(t); const help = a.help(t); const rs = a.responsibilities(t);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Organización defensiva efectiva — ${tn(res, t)} (altura de presión: ${org.pressureHeight})`),
      table(['Organización', 'Ataques rivales', 'Puntos concedidos', 'PPP concedido', 'Tiros', '% campo', 'Cómodas/normales/forzadas', 'Pérdidas rivales', 'Robos', 'Faltas', 'RD'], org.rows.map((r) => [r.org, r.poss, r.points, fmtVal(r.ppp, 2), r.shots, pc(r.fgPct), `${r.quals.comfortable}/${r.quals.normal}/${r.quals.forced}`, r.tov, r.stl, r.fouls, r.dreb]), { numeric: [1, 2, 3, 4, 5, 7, 8, 9, 10] }), h('p', { class: 'small muted' }, org.note)));
    const of = a.organizationsByFact(t);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Tiros recibidos por organización efectiva en la frontera de cada hecho — ${tn(res, t)}`),
      table(['Organización efectiva', 'Versión de plan', 'Alternativa', 'Tiros', 'Convertidos', 'Puntos', 'Cómodas/normales/forzadas'], of.rows.map((r) => [r.org + (r.intended !== r.org ? ` (prevista ${r.intended})` : ''), `v${r.planVersion}`, r.alternate ? 'sí' : '', r.att, r.made, r.points, `${r.quals.comfortable}/${r.quals.normal}/${r.quals.forced}`]), { numeric: [3, 4, 5] }),
      h('p', { class: 'small muted' }, of.note, of.unreconstructable ? ` ${of.unreconstructable} hecho(s) sin reconstrucción posible.` : '')));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Coberturas realmente ejecutadas frente a la familia ofensiva'),
      table(['Cobertura', 'Navegación', 'Familia', 'Ejecuciones', 'Canastas', 'Fallos', 'Pérdidas', 'Faltas', 'Cambio completado', 'Cambio no completado', 'Con ayuda'], cov.rows.map((r) => [r.cov, r.nav.join('/'), r.familyLabel, r.n, r.made, r.miss, r.tov, r.foul, r.exchangeDone, r.exchangeFailed, r.help]), { numeric: [3, 4, 5, 6, 7, 8, 9, 10] }), h('p', { class: 'small muted' }, cov.note)));
    out.push(h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Cadena de ayuda (${help.n})`), table(['Dato', 'Valor'], [['Ayudas comprometidas', help.n], ['La ayuda llega', help.arrived], ['Relevo comprometido y no llega', help.reliefFailed], ['Canastas tras la cadena', help.madeAfter]], { numeric: [1] }), h('p', { class: 'small muted' }, help.note)),
      h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Responsabilidades (tres consultas distintas)'), table(['Jugador', 'Responsabilidad inicial', 'Oposición final al tiro', 'Participaciones'], [...new Set([...rs.initial, ...rs.finalOpposition, ...rs.participations].map((x) => x.id))].map((id) => [id, rs.initial.find((x) => x.id === id)?.n ?? 0, rs.finalOpposition.find((x) => x.id === id)?.n ?? 0, rs.participations.find((x) => x.id === id)?.n ?? 0]), { numeric: [1, 2, 3] }), h('p', { class: 'small muted' }, rs.note))));
    const ti = a.throwIns(t === 0 ? 0 : 1); const tj = a.throwInList(t);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Saques propios de ${tn(res, t)} (banda/fondo; ${ti.total} cerrados)`),
      table(['Tipo', 'Saques', 'Primera opción', 'Alternativa', 'Negaciones', 'Puntos directos', 'PPP directo', 'Puntos de la posesión completa', 'PPP posesión'], ti.rows.map((r) => [r.label, r.n, `${r.firstOption} (${pc(r.firstPct)})`, r.alternative, r.denied, r.direct, fmtVal(r.directPpp, 2), r.possPts, fmtVal(r.possPpp, 2)]), { numeric: [1, 3, 4, 5, 6, 7, 8] }),
      h('p', { class: 'small muted' }, ti.note), h('details', {}, h('summary', {}, `Lista de saques (${tj.length})`), table(['Cadena', 'Posesión', 'Periodo', 'Tipo', 'Causa', 'Receptor', 'Opción', 'Negadas', 'Puntos directos', ...(tj.some((x) => x.ficha !== undefined) ? ['Ficha', 'Sacador'] : [])], tj.map((c) => [c.id, c.possession, periodName(c.period), c.kind, c.cause, c.receiver ?? '—', c.option ?? '—', c.denied, c.directPoints, ...(c.ficha !== undefined ? [c.ficha, c.sacador] : [])]), { numeric: [7, 8] })),
      h('details', {}, h('summary', {}, 'Casos reglamentarios NO ejecutados (no son «cero incidencias»)'), h('ul', {}, ti.notExecuted.map((x) => h('li', {}, x))))));
    const fl = a.fouls(t); out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Faltas cometidas por ${tn(res, t)} (${fl.length})`), table(['Hecho', 'Periodo', 'Reloj', 'Infractor', 'Sobre', 'Tipo', 'Regla', 'Libres', 'Bonus'], fl.map((f) => [f.event, periodName(f.period), clockText(f.remaining), f.by ?? '—', f.on ?? '—', f.kind ?? '—', f.rule ?? '—', f.ft, f.bonus ? 'sí' : 'no']))));
    return out;
  },

  rotaciones(res, a) {
    const t = st.team; const lu = a.lineups(t); const out = [];
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Quintetos de ${tn(res, t)}`),
      table(['Jugadores', 'Min', 'Más-menos', 'A favor', 'En contra', 'Ataques completos propios', 'Rivales', 'Mixtas', 'ORtg estable', 'DRtg estable', 'Exposición'], lu.rows.map((r) => [r.players.join(' · '), fmt(r.minutes), r.plusMinus > 0 ? `+${r.plusMinus}` : r.plusMinus, r.ptsFor, r.ptsAgainst, r.ownComplete, r.rivalComplete, r.mixed, fmtVal(r.ortg, 0), fmtVal(r.drtg, 0), r.sufficient ? pill('suficiente', 'ok') : pill('insuficiente', 'warn')]), { numeric: [1, 2, 3, 4, 5, 6, 7, 8, 9] }),
      h('p', { class: 'small muted' }, `Orden: ${lu.orderCriterion}. Exposición suficiente: ≥ ${a.params.sample.lineupMinSeconds} s y ≥ ${a.params.sample.lineupMinAttacks} ataques completos de cada lado. Las tasas estables usan solo puntos vinculados a posesiones completas; las mixtas se muestran aparte y los grupos solapados son consultas, no una partición.`)));
    const ids = res.input.teams[t].players.map((p) => p.id); const sel = st.group.filter((id) => ids.includes(id));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Jugador, pareja o grupo: con / sin'),
      h('div', { class: 'chips' }, ids.map((id) => h('button', { type: 'button', class: `chip ${sel.includes(id) ? 'on' : ''}`, onclick: () => { st.group = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]; repaint(); } }, id))),
      sel.length ? onOffTable(a, sel) : h('p', { class: 'small muted' }, 'Elige uno o varios jugadores (de este equipo). La presencia no obliga a un quinteto fijo: una pareja permanece aunque cambie un tercer compañero.')));
    out.push(statesCard(res, a, t));
    return out;
  },

  informes(res, a) {
    const t = st.team; const rival = 1 - t; const out = [];
    out.push(h('div', { class: 'card' }, h('p', { class: 'small' }, `Informe de ${AUDIENCE_LABEL[st.audience]}${st.audience === 'diagnostic' ? '' : ` para ${tn(res, t)}`}. Reutiliza las mismas consultas con la audiencia elegida. Cambia la audiencia arriba para comparar qué se ve y qué no.`)));
    const rec = a.recommendations(t);
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Recomendaciones condicionadas'), rec.items.length ? rec.items.map((r) => h('div', { class: 'card' }, h('strong', {}, `${r.id}${r.title ? ` · ${r.title}` : ''}`), r.status === 'condicionada' ? [h('p', {}, h('em', {}, r.observation)), h('p', {}, r.text), h('p', { class: 'small muted' }, `Muestra ${JSON.stringify(r.sample)} · condición: ${r.condition}. Coste/alternativa: ${r.cost}`), evidence(res, a, r.evidence, r.query)] : h('p', { class: 'small' }, `${r.status}: ${r.reason}`))) : h('p', { class: 'small' }, 'Sin evidencia suficiente: no se genera ninguna recomendación.'),
      h('p', { class: 'small muted' }, `${rec.note} No se aplica nada al siguiente partido.`)));
    out.push(beforeAfterCard(res, a));
    out.push(h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Informe propio — ${tn(res, t)}`), resumenEquipo(res, a, t)), h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Informe rival — ${tn(res, rival)}`), resumenEquipo(res, a, rival), h('p', { class: 'small muted' }, 'Lo observado, no el libro: la ausencia de una jugada en este partido significa «no observada en la muestra».'))));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Ficha individual'), h('div', { class: 'chips' }, res.input.teams.flatMap((tm) => tm.players.map((p) => p.id)).map((id) => h('button', { type: 'button', class: `chip ${st.player === id ? 'on' : ''}`, onclick: () => { st.player = id; repaint(); } }, id))), st.player ? playerSheet(res, a, st.player) : h('p', { class: 'small muted' }, 'Elige un jugador desde aquí, desde el acta o desde un líder.')));
    return out;
  },

  diagnostico(res, a) {
    const c = a.coverageSummary(); const rc = reconcileAnalysis(res); const out = [];
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Qué prueba y qué no prueba esta vista'), h('p', {}, c.note), h('p', { class: 'small' }, `Conciliación analítica ${rc.version}: `, pill(rc.ok ? 'todas cuadran' : 'DESVIACIONES', rc.ok ? 'ok' : 'bad'), ` ${rc.total - rc.failed.length}/${rc.total} comprobaciones. Prueba consistencia de la lectura con el acta y los hechos, no conformidad normativa.`),
      h('details', {}, h('summary', {}, 'Comprobaciones'), table(['Id', 'Área', 'Universo', 'Esperado', 'Observado', 'Resultado'], rc.checks.map((x) => ({ cls: x.ok ? '' : 'warn', cells: [x.id, x.area, x.universe, JSON.stringify(x.expected), JSON.stringify(x.observed), x.ok ? 'correcto' : 'DESVIACIÓN'] }))))));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Matriz de cobertura normativa heredada de MOTOR-09'), table(['Fila', 'Familia', 'Contraste', 'Categoría', 'Administración', 'Exposición', 'Generación natural'], c.matrix.map((r) => [r.id, r.family, r.contrast, r.category, r.admin, r.exposure, r.natural])),
      h('ul', { class: 'small' }, Object.entries(COVERAGE_CATEGORIES).map(([k, v]) => h('li', {}, h('strong', {}, `${k}: `), v, ` (${c.byCategory[k] ?? 0})`))), h('p', { class: 'small muted' }, 'Ninguna fila es lectura directa del PDF de FIBA. Un acta cuadrada prueba consistencia bajo estas reglas, no conformidad completa.')));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Bloques analíticos: productor, consulta, permiso y cobertura'), table(['Bloque', 'Productor', 'Consulta', 'Permiso', 'Cobertura', 'Nota'], c.blocks.map((b) => [b.block, b.producer, b.query, b.permission, b.coverage, b.note]))));
    out.push(h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Deuda de MOTOR-09 (conservada)'), table(['Pendiente', 'Impacto', 'Cierre'], c.debt.map((d) => [d.item, d.impact, d.close]))), h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Pendientes de MOTOR-10 revisados en MOTOR-11 (uno a uno)'), table(['Pendiente', 'Estado', 'Impacto', 'Cierre'], c.pending.map((d) => [d.item, d.status, d.impact, d.close])), h('h3', {}, 'Entregas posteriores'), h('ul', { class: 'small' }, c.later.map((l) => h('li', {}, `${l.item} — ${l.where}`))))));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Matriz de visibilidad'), table(['Campo', 'Público/rival', 'Propia', 'Diagnóstico'], VISIBILITY.map((v) => [v.field, v.public, v.own, v.diag]))));
    out.push(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Catálogo de indicadores (definición, universo y cobertura)'), table(['Id', 'Indicador', 'Naturaleza', 'Unidad', 'Fuente', 'Universo', 'Cálculo', 'Cobertura'], CATALOG.map((d) => [d.id, d.label, d.nature, d.unit, d.source, d.universe, d.calc, d.coverage]))));
    return out;
  },

  exportar(res, a) {
    const dl = (name, text, type) => { const url = URL.createObjectURL(new Blob([text], { type })); const l = h('a', { href: url, download: name }); document.body.append(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
    const stem = `beM-analisis-${st.audience}${st.audience === 'diagnostic' ? '' : `-${res.teams[st.team].id}`}-${res.input?.seed ?? 'x'}`;
    const tables = a.exportCsv(st.filters);
    return [h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Exportación analítica del encuentro'), h('p', { class: 'small' }, `Audiencia: ${AUDIENCE_LABEL[st.audience]}. El archivo aplica los permisos de esta audiencia; el diagnóstico se descarga identificado y separado. Filtros activos: ${JSON.stringify(st.filters)}.`),
      h('div', { class: 'row' }, h('button', { class: 'btn', id: 'dl-json', type: 'button', onclick: () => dl(`${stem}.json`, JSON.stringify(a.exportJson({ filters: st.filters }), null, 1), 'application/json') }, 'JSON analítico'),
        h('button', { class: 'btn', id: 'dl-md', type: 'button', onclick: () => dl(`${stem}.md`, a.exportMarkdown(st.filters), 'text/markdown') }, 'Resumen Markdown'),
        Object.keys(tables).map((k) => h('button', { class: 'btn secondary', type: 'button', onclick: () => dl(`${stem}-${k}.csv`, tables[k], 'text/csv') }, `CSV · ${k}`))),
      h('p', { class: 'small muted' }, 'El export reproducible del partido (descarga JSON en «Partido») es distinto: este es una lectura. El ZIP masivo (CSV/JSON/JSONL de muchos partidos) pertenece a MOTOR-12.'))];
  },
};

// ---------------------------------------------------------------- componentes
function filterBar(res, a, keys, level = 'shots') {
  const f = st.filters; const set = (k, v) => { if (v === '' || v == null || v === false) delete st.filters[k]; else st.filters[k] = v; repaint(); };
  const own = st.audience !== 'public'; const players = res.input.teams[st.team].players.map((p) => p.id);
  const OPT = { period: [['', 'todos'], ...[...new Set(a.ix.events.map((e) => e.period))].filter((p) => p >= 1).map((p) => [p, periodName(p)])], scoreState: [['', 'cualquiera'], ['ahead', 'delante'], ['tied', 'empate'], ['behind', 'detrás']], zone: [['', 'todas'], ['rim', 'aro'], ['inside', 'pintura'], ['midrange', 'media'], ['three', 'triple']], quality: [['', 'todas'], ['comfortable', 'cómoda'], ['normal', 'normal'], ['forced', 'forzada']], result: [['', 'todos'], ['made', 'convertido'], ['missed', 'fallado']], shooter: [['', 'todos'], ...players.map((p) => [p, p])], family: [['', 'todas'], ...Object.entries(FAMILY_LABEL)], coverage: [['', 'todas'], ['COB01', 'COB01'], ['COB02', 'COB02'], ['COB03', 'COB03'], ['COB04', 'COB04']] };
  const ctl = (k) => {
    const def = FILTER_FIELDS[k]; if (!def || (def.own && !own)) return null;
    if (k === 'adjustedFinal' || k === 'clockEnd') return h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: !!f[k], onchange: (e) => set(k, e.target.checked) }), ` ${def.label}`);
    return h('label', { class: 'small' }, `${def.label} `, h('select', { 'aria-label': def.label, onchange: (e) => set(k, k === 'period' && e.target.value ? Number(e.target.value) : e.target.value) }, (OPT[k] ?? [['', '—']]).map(([v, t]) => h('option', { value: v, selected: String(f[k] ?? '') === String(v) }, t))));
  };
  const compat = filterCompat(f, level);
  return h('div', { class: 'card' }, h('div', { class: 'row' }, keys.map(ctl), h('button', { class: 'btn secondary', type: 'button', onclick: () => { st.filters = {}; repaint(); } }, 'Quitar filtros')),
    h('p', { class: 'small muted' }, level === 'shots' ? 'Esta vista filtra HECHOS (tiros).' : level === 'possessions' ? 'Esta vista filtra UNIDADES (posesiones); el final ajustado usa la condición de inicio de la posesión.' : 'Esta vista filtra TRAMOS.'), compat.ok ? null : h('p', { class: 'small err' }, compat.message));
}

function productionCard(res, a) {
  const P = a.production(); const k = (x) => x.partitionKind; const o = (x) => x.partitionOrigin; const L = (x) => x.labels;
  return h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Producción: dos particiones excluyentes'),
    table(['', tn(res, 0), tn(res, 1)], [['Tiros de dos', k(P[0]).fg2, k(P[1]).fg2], ['Triples', k(P[0]).fg3, k(P[1]).fg3], ['Libres', k(P[0]).ft, k(P[1]).ft], ['Créditos administrativos', k(P[0]).admin, k(P[1]).admin], ['— por origen: F', o(P[0]).f, o(P[1]).f], ['— por origen: sanción no de tiro', o(P[0]).sanction, o(P[1]).sanction], ['— por origen: administración', o(P[0]).administrative, o(P[1]).administrative]], { numeric: [1, 2] })),
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Etiquetas de contexto (se solapan: no se suman)'), table(['Puntos', tn(res, 0), tn(res, 1)], [['Pintura', L(P[0]).paint, L(P[1]).paint], ['Banquillo', L(P[0]).bench, L(P[1]).bench], ['Tras pérdida', L(P[0]).afterTurnover, L(P[1]).afterTurnover], ['Transición beM', L(P[0]).transition, L(P[1]).transition], ['Segunda oportunidad', L(P[0]).secondChance, L(P[1]).secondChance], ['Con cadena de saque', L(P[0]).restart, L(P[1]).restart], ['Final de reloj de posesión', L(P[0]).clockEnd, L(P[1]).clockEnd]], { numeric: [1, 2] }),
      h('p', { class: 'small muted' }, 'Puntos sin las oportunidades correspondientes no bastan para valorar una frecuencia. Contrataque de convención externa: no se renombra la transición beM.')));
}
function assistCard(res, a) {
  const r = [0, 1].map((t) => a.assists(t));
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Asistencias a canasta: estados funcionales'),
    table(['', tn(res, 0), tn(res, 1)], [['Canastas de campo elegibles', r[0].eligible, r[1].eligible], ['AS-C acreditadas', r[0].astFg, r[1].astFg], ['Canastas asistidas %', pc(r[0].pct), pc(r[1].pct)], ...['recepción interior', 'recepción exterior', 'creación nueva', 'sin pase final'].map((s) => [`— ${s}`, r[0].byState[s] ?? 0, r[1].byState[s] ?? 0])], { numeric: [1, 2] }),
    h('p', { class: 'small muted' }, 'Criterio: solo el último pase puede recibir asistencia; recibir y anotar en la pintura mantiene el crédito; fuera de ella, sin bote acredita y con movimiento propio es creación nueva (no acredita). Procede del extracto de S09-03 cap. 6 aportado por ChatGPT; Claude no abrió el PDF (HTTP 403). «Continuación de ventaja» y «desviación» no están representadas. El porcentaje de canastas asistidas no es un objetivo a reducir.'));
}
function offBallCard(res, a, t) {
  const rows = a.offBall(t);
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Trabajo útil sin balón — ${tn(res, t)}`), table(['Aportación', 'Estado', 'Valor registrado', 'Evidencia mínima'], rows.map((r) => [r.label, r.status, r.value, r.evidence])),
    h('p', { class: 'small muted' }, 'No atribuye utilidad al bloqueador porque entre el tiro ni al cerrador porque un compañero capture. Una oportunidad puede tener varios colaboradores: no hay reparto de mérito ni índice universal sin balón. «No registrado» identifica la dependencia concreta.'),
    h('details', {}, h('summary', {}, 'Evidencias por aportación'), rows.filter((r) => r.evidence_ids?.length).map((r) => h('div', {}, h('strong', {}, r.label), evidence(res, a, r.evidence_ids)))));
}
function shotList(res, a, shots) {
  const rows = shots.slice(0, 120).map((s) => [s.id, periodName(s.period), clockText(s.clock.before), s.shooter, ({ rim: 'aro', inside: 'pintura', midrange: 'media', three: 'triple' })[s.zone] ?? s.zone, s.made ? 'convertido' : (s.fromFoul ? 'falta en tiro' : 'fallado'), s.quality ?? '—', s.familia ? (FAMILY_LABEL[s.familia] ?? s.familia) : (s.origen ?? '—'), s.coverage ?? '—', s.passer ?? '—', s.credit ? 'AS' : '', s.defender ?? '—', ...(s.prioridad !== undefined ? [s.procedencia ?? '—', s.prioridad ?? '—'] : []), ...(s.pFinal !== undefined ? [s.pConversion ?? '—'] : [])]);
  const extra = shots[0]?.prioridad !== undefined ? ['Procedencia', 'Prioridad'] : []; const diag = shots[0]?.pConversion !== undefined || (shots[0] && 'pConversion' in shots[0]) ? ['p conversión'] : [];
  return h('div', { class: 'card' }, h('details', { open: shots.length > 0 && shots.length <= 12 }, h('summary', {}, `Tiros elegibles (${shots.length}${shots.length > 120 ? ', primeros 120' : ''})`), table(['Hecho', 'Periodo', 'Reloj', 'Tirador', 'Zona', 'Resultado', 'Calidad', 'Acción', 'Cobertura', 'Pasador', 'Crédito', 'Defensor', ...extra, ...diag], rows)));
}
function adjustedList(res, a) {
  const rows = a.viewedShots(0).concat(a.viewedShots(1)).filter((s) => a.shots(s.team, { adjustedFinal: true }).shots.some((x) => x.id === s.id)).sort((x, y) => x.seq - y.seq);
  return rows.length ? [table(['Hecho', 'Equipo', 'Periodo', 'Reloj previo', 'Marcador previo', 'Tirador', 'Resultado'], rows.map((s) => [s.id, res.teams[s.team].id, periodName(s.period), clockText(s.clock.before), s.scoreBefore.join('–'), s.shooter, s.made ? 'convertido' : 'fallado'])), h('p', { class: 'small muted' }, 'Se evalúa el tiempo y el margen ANTES del hecho; no se seleccionan solo los que resultaron decisivos. La crónica puede destacar un tiro decisivo como desenlace sin cambiar este filtro.')] : h('p', { class: 'small' }, 'Ningún tiro cumple el filtro (sin hechos elegibles).');
}
function beforeAfterCard(res, a) {
  const orders = a.appliedOrders(); const id = st.order && orders.some((o) => o.id === st.order) ? st.order : orders[0]?.id;
  const r = id ? a.beforeAfter(id) : null;
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Antes y después de una orden aplicada'),
    orders.length ? h('label', { class: 'small' }, 'Orden ', h('select', { 'aria-label': 'orden', onchange: (e) => { st.order = e.target.value; repaint(); } }, orders.map((o) => h('option', { value: o.id, selected: o.id === id }, `${o.id} · ${res.teams[o.team].id} · ${o.type} · ${o.issuer}`)))) : h('p', { class: 'small' }, 'Este encuentro no tiene órdenes aplicadas de plan.'),
    r?.ok ? [table(['Ventana', 'Ataques completos', 'Puntos', 'PPP', 'Tiros', 'Convertidos', 'Cómodos'], [['Antes', r.before.attacks, r.before.points, fmtVal(r.before.ppp, 2), r.before.shots, r.before.made, r.before.comfortable], ['Después', r.after.attacks, r.after.points, fmtVal(r.after.ppp, 2), r.after.shots, r.after.made, r.after.comfortable]], { numeric: [1, 2, 3, 4, 5, 6] }), h('p', { class: 'small muted' }, `${r.note} Mixtos aparte: ${r.mixed.length ? r.mixed.join(', ') : 'ninguno'}. Una orden enviada o pendiente no cuenta como aplicada.`)] : (r ? h('p', { class: 'small' }, r.reason) : null));
}
function resumenEquipo(res, a, t) {
  const ind = a.indicators(t).filter((r) => ['TC_PCT', 'T3_PCT', 'EFG', 'AST_PCT', 'ORTG', 'DRTG', 'PER100', 'OREB_PCT', 'FT_PER_FG'].includes(r.id)); const o = a.origin(t); const q = a.quality(t);
  return [table(['Indicador', 'Valor', 'Muestra'], ind.map((r) => [r.label, r.display, r.sample?.n ?? '—']), { numeric: [1, 2] }), h('p', { class: 'small' }, `Origen más frecuente: ${o.rows[0]?.label ?? '—'} (${o.rows[0]?.poss ?? 0} de ${o.total} posesiones).`), h('p', { class: 'small' }, `Calidad previa: ${q.map((r) => `${r.label} ${r.att}`).join(' · ')}.`)];
}
function playerSheet(res, a, id) {
  const l = a.ix.acta.players[id]; const rows = a.playerIndicators(id); const sh = a.viewedShots(l.team).filter((s) => s.shooter === id && s.valid);
  return h('div', {}, h('p', { class: 'small' }, `${id} · ${l.participation} · ${fmt(l.min)} min · ${l.pts} pts · T2 ${l.fg2m}/${l.fg2a} · T3 ${l.fg3m}/${l.fg3a} · TL ${l.ftm}/${l.fta} · RT ${l.reb} · AS ${l.ast} · PER ${l.tov} · FC ${l.pf} · +/- ${l.pm}`),
    table(['Indicador', 'Valor', 'Universo'], rows.map((r) => [r.label, r.value == null ? `— (${r.reason})` : `${r.value.toFixed(1)}${r.unit === '%' ? ' %' : ''}`, r.universe]), { numeric: [1] }),
    h('p', { class: 'small' }, `Tiros propios: ${sh.length} · cómodos ${sh.filter((s) => s.quality === 'comfortable').length} · forzados ${sh.filter((s) => s.quality === 'forced').length}.`), h('p', { class: 'small muted' }, 'La ficha no reduce la evaluación a puntos por minuto ni a una nota nueva.'));
}
function onOffTable(a, sel) {
  const r = a.onOff(sel); const m = (x) => (x == null || x.value == null ? '—' : x.value.toFixed(1));
  return [table(['', 'Con el grupo', 'Sin el grupo'], [['Minutos', fmt(r.with.minutes), fmt(r.without.minutes)], ['Marcador de presencia (a favor – en contra)', `${r.with.ptsFor}–${r.with.ptsAgainst}`, `${r.without.ptsFor}–${r.without.ptsAgainst}`], ['Ataques completos propios', r.with.own.complete.length, r.without.own.complete.length], ['Ataques completos rivales', r.with.rival.complete.length, r.without.rival.complete.length], ['Posesiones mixtas', r.with.mixedCount, '—'], ['ORtg estable', m(r.with.ortgStable), m(r.without.ortgStable)], ['DRtg estable', m(r.with.drtgStable), m(r.without.drtgStable)], ['Net estable', m(r.netWith), m(r.netWithout)], ['Puntos administrativos durante la presencia (aparte)', `${r.with.adminFor}/${r.with.adminAgainst}`, `${r.without.adminFor}/${r.without.adminAgainst}`]]),
    h('p', {}, h('strong', {}, 'Diferencia observada (con − sin) en Net: '), r.diffNet.value == null ? `— (${r.diffNet.reason})` : `${r.diffNet.value.toFixed(1)} pts/100`), h('p', { class: 'small muted' }, `${r.label} Exposición ${r.sufficient ? 'suficiente' : 'insuficiente'} según el mínimo editorial; ${r.partialTenths ? `${(r.partialTenths / 600).toFixed(1)} min con el grupo parcialmente en pista quedan fuera de ambas mitades.` : ''}`)];
}
function curveSvg(curve, res) {
  const W = 760; const H = 160; const NS = 'http://www.w3.org/2000/svg'; const max = Math.max(5, ...curve.map((c) => Math.abs(c.diff)));
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Diferencia de marcador a lo largo del partido'); svg.style.width = '100%'; svg.style.maxWidth = '900px';
  const x = (i) => 30 + ((W - 40) * i) / Math.max(1, curve.length - 1); const y = (d) => H / 2 - ((H / 2 - 12) * d) / max;
  const mk = (n, at) => { const e = document.createElementNS(NS, n); for (const [k, v] of Object.entries(at)) e.setAttribute(k, v); return e; };
  svg.append(mk('line', { x1: 30, x2: W - 10, y1: H / 2, y2: H / 2, stroke: '#9aa4b8', 'stroke-dasharray': '3 3' }));
  let d = ''; curve.forEach((c, i) => { const px = x(i); d += `${i ? `L${px},${y(curve[i - 1].diff)} ` : 'M'}${px},${y(c.diff)} `; });
  svg.append(mk('path', { d, fill: 'none', stroke: '#1f5fbf', 'stroke-width': 1.6 }));
  const t1 = mk('text', { x: 2, y: 12, 'font-size': 10, fill: '#5d667a' }); t1.textContent = `+${max} ${res.teams[0].id}`; svg.append(t1);
  const t2 = mk('text', { x: 2, y: H - 4, 'font-size': 10, fill: '#5d667a' }); t2.textContent = `−${max} ${res.teams[1].id}`; svg.append(t2);
  return h('div', { class: 'scroll' }, svg);
}

// MOTOR-15 §9.2: estado propio por tramo (energía con número y barra; Forma y momentos como categorías; valores internos solo en diagnóstico).
function statesCard(res, a, t) {
  const q = a.ownStates(t);
  if (!q.available) return h('div', { class: 'card', id: 'states-card' }, h('h3', { style: 'margin-top:0' }, `Estado propio por tramo de ${res.teams[t].id}`), h('p', { class: 'small' }, q.reason));
  const diag = q.audience === 'diagnostic';
  return h('div', { class: 'card', id: 'states-card' }, h('h3', { style: 'margin-top:0' }, `Estado propio por tramo de ${res.teams[t].id}`),
    table(['Jugador', 'Forma', 'Energía inicial', ...q.boundaries.map((b) => `${b.kind === 'inicio' ? 'Inicio' : 'Final'} ${b.period <= 4 ? `C${b.period}` : `P${b.period - 4}`}`)],
      q.rows.map((r) => [r.player, diag ? `${r.form} (${r.formValue})` : r.form, r.initialEnergy, ...q.boundaries.map((b) => { const x = r.samples.find((s) => s.n === b.n); return x ? `${x.energy.value} ${x.energy.bar} · ${Object.values(x.moments).map((m) => m.category).join('/')}${x.onCourt ? '' : ' (banquillo)'}` : '—'; })])),
    h('p', { class: 'small muted' }, `Momentos: ${Object.values(q.rows[0]?.samples[0]?.moments ?? {}).map((m) => m.scope).join(' / ')}. Equipo (T): ${q.team.map((x) => x.category).join(' → ')}. ${q.note}`));
}
