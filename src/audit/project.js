// Proyección de un intento (MOTOR-13 §12.2): UNA pasada por bloques sobre los registros ya conservados (decisiones, hechos, estados y tablas) que produce agregados reutilizables por
// todos los auditores. Se guarda en disco por huella de evidencia y política (`out/audit/cache/`): analizar de nuevo no vuelve a leer los cientos de MiB. No sortea, no simula y no
// toca ningún archivo original.
import { jsonlRecords, ensure, inc, fnv, r4, sum } from './util.js';
import { effectiveAbility } from '../match/core.js';
import { classifyDefOrg } from './aud11.js';
import { newKnowledge, noteFamiliarity, linkKnowledgeQuality, linkKnowledgeAdvance } from './knowledge.js';

export const PROJECTION_VERSION = 'PRJ-MOTOR18-R2'; // MOTOR-18 (R17B-SENS-01): cada operación enlazada conserva las recetas hermanas del mismo jugador y capacidad que la alimentan (`deps`); AUD11 clasificado; R2: contextos de sensibilidad de conocimiento (`familiaridad`, `salida:avance`);  MOTOR-17B: MOTOR-17B: contextos enlazados a la operación real que consume la receta (`salida:*`); MOTOR-15B: cadenas de saque con clasificación y casos; energía por ámbito y tarea con ejemplos
export const BIN_EDGES = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const binOf = (p) => { for (let i = 0; i < BIN_EDGES.length - 2; i++) if (p < BIN_EDGES[i + 1]) return i; return BIN_EDGES.length - 2; };
const PLAYER = /^EQ\d+(_B)?-J\d+$/;
const emptyBins = () => BIN_EDGES.slice(1).map(() => ({ n: 0, sumP: 0, sumY: 0 }));
const newRel = () => ({ n: 0, sumP: 0, sumY: 0, brier: 0, bins: emptyBins(), deterministic: { p0: 0, p1: 0, bad: [] } });
function addRel(rel, p, y, did) {
  rel.n += 1; rel.sumP += p; rel.sumY += y; rel.brier += (y - p) ** 2; const b = rel.bins[binOf(p)]; b.n += 1; b.sumP += p; b.sumY += y;
  if (p === 0) { rel.deterministic.p0 += 1; if (y === 1 && rel.deterministic.bad.length < 5) rel.deterministic.bad.push({ decision_id: did, p, y, regla: 'p=0 con resultado positivo' }); }
  if (p === 1) { rel.deterministic.p1 += 1; if (y === 0 && rel.deterministic.bad.length < 5) rel.deterministic.bad.push({ decision_id: did, p, y, regla: 'p=1 con resultado negativo' }); }
}
const taskOf = (label) => { const m = /^receta:(TAR\d+)\.(attack|defense)$/.exec(label); return m ? { task: m[1], side: m[2] } : null; };

// Selección determinista y CIEGA al resultado de los contextos del contraste B (§7.4): por (capacidad, tarea.rol) se conservan los 3 de menor hash FNV-1a del identificador de decisión; un
// estrato «LIMITE» recoge 2 por capacidad con base ≥ 28 o energía < 10 (donde la capacidad no debe o no puede influir). Se decide antes de mirar acierto alguno.
function keepSmall(list, item, k) { list.push(item); list.sort((a, b) => a.h - b.h); if (list.length > k) list.pop(); }

// MOTOR-15B §5.3: clasificación de cada cadena de saque con la última transición de su posesión (leída de los hechos del mismo intento; no se inventa ningún receptor ni pérdida).
//  · ejecutada: cerrada con receptor · sin entrega válida: cerrada SIN receptor con causa legible de pérdida de entrega (infracción del plazo, falta, pérdida o desvío en el saque: comportamiento válido)
//  · interrumpida por final de periodo (estado del productor desde 0.15.1, o derivada del último hecho de la posesión en evidencia anterior) · sin cierre tras desenlace (defecto de registro del productor)
const NO_DELIVERY_CAUSE = /infracción del plazo|falta en el saque|pérdida en el saque|desvío/;
export function classifyChains(P, lastOf) {
  const S = P.saques; S.clases = {}; S.casos = [];
  for (const c of S.cadenas) {
    const last = lastOf[c.possession] ?? null; let clase; let valida = true; let origen = 'productor'; let causa = c.cierre;
    if (c.status === 'interrumpida') { clase = 'interrumpida_fin_periodo'; }
    else if (c.status === 'cerrada' && c.receptor) clase = 'ejecutada';
    else if (c.status === 'cerrada') { if (NO_DELIVERY_CAUSE.test(c.cierre ?? '')) clase = 'sin_entrega_valida'; else { clase = 'cerrada_sin_receptor_sin_causa'; valida = false; } }
    else if (last && (last.type === 'period_end' || (last.type === 'expiry' && last.fin === 'periodo'))) { clase = 'interrumpida_fin_periodo'; origen = 'lector (derivada del último hecho de la posesión)'; causa = 'interrumpida: final de periodo'; }
    else { clase = 'sin_cierre_tras_desenlace'; valida = false; causa = last ? `la posesión terminó en «${last.type}»${last.perdida ? ' con pérdida' : ''} y la cadena seguía abierta` : 'sin hechos de la posesión'; }
    S.clases[clase] = (S.clases[clase] ?? 0) + 1;
    if (clase !== 'ejecutada') S.casos.push({ chain: c.id, possession: c.possession, period: c.period, kind: c.kind, origen: c.origen, status: c.status, cierre: c.cierre, receptor: c.receptor, negadas: c.negadas, intentos: c.intentos, ultimaTransicion: last, clase, valida, causa, evidenciaDe: origen });
  }
}

export function projectAttempt(src, a, profile, cfg) {
  const t0 = performance.now(); const taskMax = Object.fromEntries(Object.entries(profile.tasks ?? {}).map(([k, v]) => [k, v.maxEnergyPenalty]));
  const caps = new Set(profile.attributeOrder); const foulOut = profile.rules?.foulOut ?? 5;
  const sourceId = cfg?.sourceId ?? null; // MOTOR-17 §6.2: un `M000001`/`E0052` local no identifica nada entre lotes; la identidad global es fuente|intento
  const P = { source_id: sourceId, global_attempt: `${a.batch_id ?? sourceId ?? ''}|${a.attempt_id}`, batch_id: a.batch_id ?? null, match_id: a.match_id, attempt_id: a.attempt_id, case_id: a.case_id, variant_id: a.variant_id, level: a.level, valid: a.valid, facts: a.facts, projection: PROJECTION_VERSION,
    binary: {}, dist: {}, cat: {}, recipes: { terms: 0, bad: [], weightBad: 0, valueBad: 0, effMismatch: 0, effChecked: 0, boundsBad: 0, capsUnknown: {}, byCap: {}, energyBands: {}, energyByTask: {}, contexts: {}, byTask: {}, labelsSeen: {} },
    opp: { n: 0, procedencia: {}, tags: {}, eleccion: {} }, libro: { n: 0, prios: {}, ties: 0, noElegible: 0, badPrio: 0 }, coach: { n: 0, area: {}, estado: {}, regla: {} }, memoria: { n: 0, tipo: {}, claves: {}, maxOcupadas: 0 },
    saques: { n: 0, kind: {}, sinReceptor: 0, status: {}, cadenas: [] }, states: { changes: 0, ambito: {}, nuevoSum: {}, nuevoN: {}, episodes: {}, T: { n: 0, nonzero: 0 } }, orders: { n: 0, tipos: {} },
    rebote: { n: 0, label: {} }, knowledge: newKnowledge(profile.familiarity?.range?.max ?? 30), durations: {}, calcKinds: {}, events: { n: 0, types: {}, durationBad: 0, clockBad: 0, scoreBad: 0, loop: { maxStreak: 0, streaks: 0, example: null }, byPeriodTenths: {} },
    tables: {}, bytes: {}, ms: {} };
  const rel = (m, k) => ensure(m, k, newRel);

  // ---------------------------------------------------------------- decisiones (la mayor parte del volumen)
  const dec = src.stream(a, 'decisiones'); P.bytes.decisiones = dec?.length ?? 0;
  if (dec) for (const r of jsonlRecords(dec)) {
    if (r.record_type === 'calculo') {
      if (P._ev && P._ev.id !== r.event_id) flushEvent(P);
      inc(P.calcKinds, r.kind); const d = r.data ?? {};
      if (r.kind === 'binaria') { const lab = r.label.slice(8); addRel(rel(P.binary, lab), d.p, d.resultado ? 1 : 0, r.decision_id); }
      else if (r.kind === 'distribucion') {
        const lab = r.label.replace(/EQ\d+(_B)?-J\d+/g, 'J'); const opts = d.opciones ?? []; const R = rel(P.dist, lab);
        if (opts.length < 2) { R.degenerate = (R.degenerate ?? 0) + 1; continue; }
        R.decisions = (R.decisions ?? 0) + 1; for (const o of opts) addRel(R, o.p, o.clave === d.elegido ? 1 : 0, r.decision_id);
        if (!PLAYER.test(opts[0].clave)) for (const o of opts) { const c = ensure(ensure(P.cat, lab, () => ({})), o.clave, () => ({ n: 0, expected: 0, observed: 0 })); c.n += 1; c.expected += o.p; if (o.clave === d.elegido) c.observed += 1; }
      } else if (r.kind === 'receta') projectRecipe(P, r, taskMax, caps, profile);
      else if (P._lastSel && r.event_id === P._lastSel.event && r.label?.startsWith('mezcla:')) { P._lastSel.ex.mix = { label: r.label, L: d.L, q: d.q, opciones: d.opciones, entradas: d.entradas ?? null }; P._lastSel = null; linkMix(P, r); }
      else if (P._lastSel && r.event_id === P._lastSel.event && r.label === 'aceptación' && d.entradas) { P._lastSel.ex.accept = { entradas: d.entradas, salida: d.salida }; P._lastSel = null; }
      else if (r.kind === 'familiaridad') noteFamiliarity(P, r);
      else if (r.kind === 'salida' && r.label === 'salida:avance') linkKnowledgeAdvance(P, r);
      else if (r.kind === 'salida') linkOp(P, r);
      else if (r.kind === 'calidad') { linkQuality(P, r); linkKnowledgeQuality(P, r); }
      else if (r.label === 'mezcla:salida:transición') linkMix(P, r);
      else if (r.kind === 'calidad_ataque') { for (const x of d.receta ?? []) { const c = ensure(P.recipes.qualityTerms ??= {}, x.cap, () => ({ uses: 0, sumEff: 0, sumShare: 0 })); c.uses += 1; c.sumEff += x.efectiva; } }
      else if (r.kind === 'libro') { const f = d.fichas ?? []; P.libro.n += 1; const el = f.filter((x) => x.elegible); if (!el.length) P.libro.noElegible += 1; /* prioridad null = ficha LLAMADA aunque no esté en el libro (la llamada puntual no la activa; prioridad efectiva 1): es legítima, no un error de rango (AUD07, corregida en MOTOR-13) */ for (const x of f) { if (x.prioridad == null) { P.libro.called = (P.libro.called ?? 0) + 1; continue; } inc(P.libro.prios, x.prioridad); if (!(x.prioridad >= 1 && x.prioridad <= 5)) P.libro.badPrio += 1; } const pr = el.map((x) => x.prioridad ?? 1); if (pr.length) { const m = Math.min(...pr); if (pr.filter((x) => x === m).length > 1) P.libro.ties += 1; } }
      else if (r.kind === 'rebote') { P.rebote.n += 1; inc(P.rebote.label, r.label); }
      else if (r.kind === 'duracion') { const x = ensure(P.durations, r.label, () => ({ n: 0, tenths: 0 })); x.n += 1; x.tenths += d.decimas ?? 0; }
    } else if (r.record_type === 'oportunidad') { P.opp.n += 1; inc(P.opp.procedencia, r.procedencia ?? 'null'); inc(P.opp.eleccion, r.eleccion ?? 'null'); for (const t of r.etiquetas ?? []) inc(P.opp.tags, t); }
    else if (r.record_type === 'entrenador') { P.coach.n += 1; inc(P.coach.area, r.area); inc(P.coach.estado, r.estado); inc(P.coach.regla, r.regla ?? 'null'); }
    else if (r.record_type === 'memoria') { P.memoria.n += 1; inc(P.memoria.tipo, r.tipo); inc(P.memoria.claves, r.clave ?? 'null'); P.memoria.maxOcupadas = Math.max(P.memoria.maxOcupadas, r.ocupadas ?? 0); }
    else if (r.record_type === 'cadena_saque') { P.saques.n += 1; inc(P.saques.kind, r.kind); inc(P.saques.status, r.status); if (r.status === 'cerrada' && !r.receptor) P.saques.sinReceptor += 1; if (r.status === 'abierta') P.saques.abiertas = (P.saques.abiertas ?? 0) + 1;
      P.saques.cadenas.push({ id: r.id, possession: r.possession, period: r.period, kind: r.kind, origen: r.origen, status: r.status, cierre: r.cierre ?? null, receptor: r.receptor ?? null, opcionUsada: r.opcionUsada ?? null, negadas: (r.intentos ?? []).filter((x) => x.negada).length, intentos: (r.intentos ?? []).length }); }
  }
  flushEvent(P);
  P.ms.decisiones = performance.now() - t0;

  // ---------------------------------------------------------------- hechos (relojes, bucles, tipos)
  const ev = src.stream(a, 'eventos'); P.bytes.eventos = ev?.length ?? 0; const lastOf = {}; const orgEv = []; const seqOf = {};
  if (ev) {
    let prev = null; let streak = 0; let prevSig = null; let prevScore = [0, 0]; const SKIP = new Set(['free_throw', 'foul', 'substitution', 'timeout', 'period_start', 'period_end', 'interval', 'tipoff', 'correction']);
    for (const e of jsonlRecords(ev)) {
      P.events.n += 1; inc(P.events.types, e.type); P.events.byPeriodTenths[e.period] = (P.events.byPeriodTenths[e.period] ?? 0) + (e.durationTenths ?? 0);
      const corr = e.type === 'correction' || prev?.type === 'correction'; // MOTOR-15: una corrección identificada (art. 45) puede romper la monotonía aparente del reloj o del marcador: no es un defecto ni un bucle
      if (!corr && ((e.durationTenths ?? 0) < 0 || (e.clock && e.clock.after > e.clock.before))) P.events.durationBad += 1;
      if (!corr && prev && prev.period === e.period && e.clock && prev.clock && e.clock.before !== prev.clock.after) { P.events.clockBad += 1; if (P.events.clockBad === 1) P.events.clockExample = { event_id: e.event_id, prev: prev.event_id, before: e.clock.before, prevAfter: prev.clock.after }; }
      if (e.type !== 'correction' && e.score && (e.score[0] < prevScore[0] || e.score[1] < prevScore[1]) ) P.events.scoreBad += 1; prevScore = e.score ?? prevScore;
      const sig = `${e.type}|${e.team}|${e.possession_id}|${e.intent?.motivo ?? ''}|${e.clock?.after}`;
      if (!SKIP.has(e.type) && (e.durationTenths ?? 0) === 0 && sig === prevSig) { streak += 1; if (streak === 1) P.events.loop.streaks += 1; if (streak > P.events.loop.maxStreak) { P.events.loop.maxStreak = streak; P.events.loop.example = { event_id: e.event_id, signature: sig }; } } else streak = 0;
      prevSig = sig; prev = e; seqOf[e.event_id] = e.sequence;
      if (e.type === 'defense' && e.intent?.origen === 'organización defensiva efectiva') orgEv.push({ id: e.event_id, seq: e.sequence, team: e.intent.defiende, idx: e.team == null ? null : 1 - e.team, intencion: e.intent.intencion, efectiva: e.intent.efectiva, alternativa: !!e.intent.alternativa, objetivo: e.intent.objetivo ?? null, motivo: e.intent.motivo ?? null });
      if (e.possession_id) lastOf[e.possession_id] = { id: e.event_id, type: e.type, fin: e.effects?.fin ?? null, perdida: !!e.effects?.perdida };
    }
  }
  classifyChains(P, lastOf);
  const st = src.stream(a, 'estados'); P.bytes.estados = st?.length ?? 0;
  if (st) for (const r of jsonlRecords(st)) {
    if (r.record_type === 'cambio_estado') { P.states.changes += 1; inc(P.states.ambito, r.ambito); inc(P.states.nuevoSum, r.ambito, r.nuevo ?? 0); inc(P.states.nuevoN, r.ambito); if (r.ambito === 'T') { P.states.T.n += 1; if (r.nuevo) P.states.T.nonzero += 1; } }
    else if (r.record_type === 'episodio') inc(P.states.episodes, r.tipo ?? r.id ?? 'episodio');
  }
  const defOrders = []; const or = src.stream(a, 'ordenes'); P._ordersSeen = !!or; if (or) for (const r of jsonlRecords(or)) { if (r.record_type === 'orden' && r.type === 'defOrg') defOrders.push({ id: r.order_id ?? r.id, team: r.team, state: r.state, defense: r.content?.defense ?? null, fallback: r.content && 'fallbackOrg' in r.content ? r.content.fallbackOrg : undefined, lastEvent: r.activation?.lastEvent ?? null, step: r.activation?.step ?? null }); P.orders.n += 1; inc(P.orders.tipos, r.record_type + ':' + (r.tipo ?? r.type ?? r.state ?? '')); }
  P.bytes.sorteos = src.stream(a, 'sorteos')?.length ?? 0;

  // ---------------------------------------------------------------- tablas
  const T = {}; for (const n of ['posesiones', 'finalizaciones', 'ejecuciones', 'jugadores', 'equipos', 'tiros']) T[n] = src.table(a, n);
  for (const [n, rows] of Object.entries(T)) P.tables[n] = rows ? rows.length : null;
  const play = T.jugadores ?? []; const posRows = T.posesiones ?? []; const fin = T.finalizaciones ?? [];
  const chk = P.checks = {};
  const dupIds = (rows, key) => { const s = new Set(); let d = 0; for (const r of rows) { if (s.has(r[key])) d += 1; s.add(r[key]); } return d; };
  chk.possessionDuplicates = dupIds(posRows, 'possession_id'); chk.finalizationDuplicates = dupIds(fin, 'finalization_id');
  const sorted = [...posRows].sort((x, y) => x.start_seq - y.start_seq); let overlap = 0; let inverted = 0; for (let i = 0; i < sorted.length; i++) { if (sorted[i].end_seq != null && sorted[i].end_seq < sorted[i].start_seq) inverted += 1; if (i && sorted[i - 1].end_seq != null && sorted[i].start_seq <= sorted[i - 1].end_seq) overlap += 1; }
  chk.possessionOverlap = overlap; chk.possessionInverted = inverted; chk.possessions = posRows.length;
  const posIds = new Set(posRows.map((r) => r.possession_id)); const roster = new Map(play.map((p) => [p.player_instance_id, p]));
  chk.finalizationOrphans = fin.filter((f) => f.possession_id && !posIds.has(f.possession_id)).length; chk.finalizationUnknownShooter = fin.filter((f) => !roster.has(f.shooter_player_instance_id)).length;
  chk.finalizationWrongTeam = fin.filter((f) => roster.get(f.shooter_player_instance_id) && roster.get(f.shooter_player_instance_id).team_instance_id !== f.team_instance_id).length;
  chk.foulOutExceeded = play.filter((p) => (p.pf ?? 0) > foulOut).map((p) => p.player_instance_id);
  const eq = T.equipos ?? []; chk.teamVsPlayers = [];
  for (const e of eq) { const ps = play.filter((p) => p.team_instance_id === e.team_instance_id); for (const k of ['pts', 'fga', 'fgm', 'fta', 'ftm', 'oreb', 'dreb', 'ast', 'tov', 'pf']) { const s = sum(ps.map((p) => (k === 'fgm' ? (p.fg2m ?? 0) + (p.fg3m ?? 0) : k === 'fga' ? (p.fg2a ?? 0) + (p.fg3a ?? 0) : p[k] ?? 0))); const coll = k === 'tov' ? e.collective_tov : 0; if (s + (coll ?? 0) !== e[k] && s !== e[k]) chk.teamVsPlayers.push({ team: e.team_instance_id, k, players: s, team_row: e[k] }); } }
  // finalizadores y familias (§11.1): unidades y presencia por equipo
  P.finalizers = {}; for (const f of fin) { if (!f.closed) continue; const x = ensure(P.finalizers, f.team_instance_id, () => ({ total: 0, byPlayer: {} })); x.total += 1; inc(x.byPlayer, f.shooter_player_instance_id); }
  P.families = {}; for (const r of T.ejecuciones ?? []) { const x = ensure(P.families, r.team_instance_id, () => ({ total: 0, byFamily: {}, byFicha: {} })); x.total += 1; inc(x.byFamily, r.family ?? 'sin_familia'); if (r.ficha) inc(x.byFicha, r.ficha); }
  P.shots = { n: 0, byQuality: {}, defOrg: { n: 0, mismatch: 0, effective: {}, clases: {}, motivos: {}, ejemplos: {} }, noParticipants: 0 }; const planCache = {};
  for (const s of T.tiros ?? []) { if (!s.valid || s.annulled) continue; P.shots.n += 1; const q = ensure(P.shots.byQuality, s.quality ?? 'sin_calidad', () => ({ n: 0, sumPFinal: 0, sumPConv: 0, made: 0 })); q.n += 1; q.sumPFinal += s.p_final ?? 0; q.sumPConv += s.p_conversion ?? 0; if (s.made) q.made += 1; if (s.def_org_intended) { const D = P.shots.defOrg; D.n += 1; inc(D.effective, s.def_org_effective ?? 'null'); if (s.def_org_effective !== s.def_org_intended) { D.mismatch += 1; const c = classifyDefOrg(s, { orgEv, defOrders, seqOf, ordersSeen: P._ordersSeen, planOf: (id) => planCache[id] ??= (src.planOf?.(a, id) ?? null), defaultFallback: profile.defense?.specials?.boxAndOneDefaultFallback ?? null }); inc(D.clases, c.clase); if (c.motivo) inc(D.motivos, `${c.clase}: ${c.motivo}`); const ex = (D.ejemplos[c.clase] ??= []); if (ex.length < 2) ex.push({ attempt_id: a.attempt_id, event_id: s.event_id, intended: s.def_org_intended, effective: s.def_org_effective, ...c }); } } if (!s.shooter_player_instance_id) P.shots.noParticipants += 1; }
  P.ms.total = performance.now() - t0;
  delete P._lastSel; delete P._ordersSeen;
  return P;
}

// MOTOR-14: recetas de las siete capacidades antes sin registro. Se conserva una copia pequeña de sus entradas para el contraste +1/+3/+5 sobre la operación pura (no se recalcula nada aquí).
export const SPECIAL_LABEL = /^receta:(rebote\.|seleccion\.lectura|lectura_defensiva|presion\.perdida|momento\.consistencia|gasto_resistencia)/;
function specialExtra(P, r, d) {
  const { terminos, ...rest } = d; const ex = { ...rest };
  if (r.label === 'receta:seleccion.lectura') P._lastSel = { event: r.event_id, ex }; // se completa con la mezcla de opciones del mismo hecho
  return ex;
}

function projectRecipe(P, r, taskMax, caps, profile) {
  const R = P.recipes; const d = r.data ?? {}; const terms = d.terminos; const t = taskOf(r.label); inc(R.labelsSeen, t ? `${t.task}.${t.side}` : 'otras');
  if (!Array.isArray(terms)) return;
  const evItems = []; let w = 0; let num = 0; const [lo, hi] = profile.abilityBounds; R._bounds = [lo, hi]; const ex = SPECIAL_LABEL.test(r.label) ? specialExtra(P, r, d) : null;
  for (const x of terms) { w += x.peso; num += x.peso * x.efectiva; }
  if (Math.abs(w - 1) > 1e-6 && t) R.weightBad += 1; if (w > 0 && Math.abs(num / w - d.valor) > 0.01) { R.valueBad += 1; if (R.bad.length < 5) R.bad.push({ decision_id: r.decision_id, label: r.label, valor: d.valor, recomputado: r4(num / w) }); }
  for (const x of terms) {
    R.terms += 1; if (!caps.has(x.cap)) { inc(R.capsUnknown, x.cap); continue; }
    if (!(x.base >= lo && x.base <= hi) || !(x.efectiva >= lo - 1e-9 && x.efectiva <= hi + 1e-9) || !(x.peso > 0)) R.boundsBad += 1;
    const stratum = t ? `${t.task}.${t.side}|${x.rol}` : `${r.label.replace(/^receta:/, '')}|${x.rol}`;
    const c = ensure(R.byCap, x.cap, () => ({ uses: 0, sumBase: 0, sumEff: 0, sumShare: 0, saturated: 0, strata: {}, players: {} }));
    c.uses += 1; c.sumBase += x.base; c.sumEff += x.efectiva; c.sumShare += x.peso / (w || 1); if (x.base >= hi) c.saturated += 1;
    const s = ensure(c.strata, stratum, () => ({ uses: 0, sumEff: 0, sumBase: 0, sumShare: 0 })); s.uses += 1; s.sumEff += x.efectiva; s.sumBase += x.base; s.sumShare += x.peso / (w || 1);
    inc(c.players, x.jugador);
    // brecha de energía por banda (AUD17): base − efectiva
    const e = x.energia; const band = e >= 70 ? '70–100' : e >= 40 ? '40–70' : e >= 10 ? '10–40' : '<10'; const kind = x.cap.startsWith('FIS') ? 'FIS' : 'TEC/MEN'; const eb = ensure(R.energyBands, `${kind}|${band}`, () => ({ n: 0, gap: 0 })); eb.n += 1; eb.gap += x.base - x.efectiva;
    // MOTOR-15B: la brecha de tareas con distinto tope de deterioro NO es la misma magnitud: se conserva por (ámbito, tarea, banda) con su numerador, denominador y dos casos de ejemplo
    { const tk = `${kind}|${t ? `${t.task}.${t.side}` : 'otras'}|${band}`; const et = ensure(R.energyByTask, tk, () => ({ n: 0, gap: 0, baseSum: 0, minEnergy: e, examples: [] })); et.n += 1; et.gap += x.base - x.efectiva; et.baseSum += x.base; if (e < et.minEnergy) et.minEnergy = e; if (et.examples.length < 2) et.examples.push({ decision_id: r.decision_id, event_id: r.event_id, player: x.jugador, cap: x.cap, base: x.base, efectiva: x.efectiva, energia: e }); }
    // coherencia de la operación pura con el valor registrado (solo con tope de tarea conocido)
    const tmx = x.tope ?? (t ? taskMax[t.task] : null); if (t && tmx != null && e != null) { R.effChecked += 1; const v = effectiveAbility(profile, x.base, e, x.cap, tmx); if (Math.abs(v - x.efectiva) > 0.06) { R.effMismatch += 1; if (R.bad.length < 5) R.bad.push({ decision_id: r.decision_id, cap: x.cap, base: x.base, energia: e, registrada: x.efectiva, pura: r4(v) }); } }
    // contextos del contraste B (selección ciega, determinista)
    const gdec = `${P.global_attempt}|${r.decision_id}`; const h = fnv(`${gdec}|${x.cap}|${x.jugador}|${x.rol}`); const ctxList = ensure(R.contexts, x.cap, () => ({}));
    const item = { h, gdec, decision_id: r.decision_id, event_id: r.event_id, label: r.label, task: t ? `${t.task}.${t.side}` : null, taskMax: x.tope ?? (t ? taskMax[t.task] : null) ?? null, topeRegistrado: x.tope != null, stratum, player: x.jugador, rol: x.rol, cap: x.cap, base: x.base, eff: x.efectiva, energia: e, peso: x.peso, valor: d.valor, terminos: terms };
    if (ex) item.ex = ex; // MOTOR-14: entradas del cálculo derivado de las siete capacidades recién registradas
    evItems.push(item);
  }
  if (evItems.length) { const ev = (P._ev ??= { id: r.event_id, recs: [], items: [] }); ev.recs.push({ label: r.label, jugador: terms[0]?.jugador ?? null, valor: d.valor, items: evItems }); ev.items.push(...evItems); }
}

// MOTOR-17B (B17-02): una receta es un valor INTERMEDIO; lo que el motor consume es la salida de la operación que la utiliza. Cada operación registra sus entradas y su salida en una nota `salida:*` (o `calidad`, o la mezcla de
// la transición) del MISMO hecho. Aquí se enlaza esa nota con los términos de las recetas que la alimentan (la última receta del mismo rótulo y jugador antes de la nota). Los contextos se retienen al cerrar el hecho,
// cuando ya se sabe si tienen operación enlazada; un término sin operación enlazada solo conserva su contexto intermedio (marcado) y nunca se presenta como salida.
const REFKEYS = { 'salida:tiro': ['A', 'D', 'prep'], 'salida:tapon': ['blk'], 'salida:rebote': ['fuerza', 'captura'], 'salida:suelto': ['ra', 'rd'], 'salida:control': ['off', 'def', 'legalDef', 'legalOff'] };
function attachOp(P, ref, op) {
  const ev = P._ev; if (!ev || !ref) return;
  for (let i = ev.recs.length - 1; i >= 0; i--) { const rc = ev.recs[i]; if (rc.label === ref.label && rc.jugador === ref.jugador) { for (const it of rc.items) (it.ops ??= []).push({ ...op, peso: ref.peso ?? 1, lado: ref.lado ?? null }); return; } }
}
function linkOp(P, r) {
  const d = r.data ?? {}; const keys = REFKEYS[r.label]; if (!keys || !P._ev || P._ev.id !== r.event_id) return;
  for (const key of keys) { const refs = d.refs?.[key]; if (!refs) continue; for (const ref of Array.isArray(refs) ? refs : [refs]) attachOp(P, ref, { op: r.label, refKey: key, note: d }); }
}
// La calidad previa consume CA y CD: se enlazan por valor (la nota conserva `ca`/`cd` sin etiqueta de receta) con la última receta compatible del mismo hecho.
const CA_LABELS = /^receta:TAR0[235]\.attack$/; const CD_LABELS = /^receta:(TAR0[235]\.defense|calidad_defensa:.+)$/;
function linkQuality(P, r) {
  const d = r.data ?? {}; if (!d.entradas || !P._ev || P._ev.id !== r.event_id) return;
  const find = (re, v) => { if (v == null) return null; for (let i = P._ev.recs.length - 1; i >= 0; i--) { const rc = P._ev.recs[i]; if (re.test(rc.label) && Math.abs(rc.valor - v) < 6e-4) return rc; } return null; };
  for (const [key, re, v] of [['ca', CA_LABELS, d.entradas.ca], ['cd', CD_LABELS, d.entradas.cd]]) { const rc = find(re, v); if (rc) for (const it of rc.items) (it.ops ??= []).push({ op: 'calidad', refKey: key, peso: 1, lado: null, note: d }); }
}
// La elección de la finalización en transición pondera cada opción del actor con la receta de recorrido largo (FIS01/FIS02): se enlaza por actor.
function linkMix(P, r) {
  const d = r.data ?? {}; if (!d.entradas || !P._ev || P._ev.id !== r.event_id) return;
  const actors = new Set(d.entradas.items.map((i) => String(i.clave).split(':')[0]));
  for (const a of actors) attachOp(P, { label: 'receta:acceso_recorrido_largo', jugador: a, peso: 1 }, { op: 'mezcla:transicion', refKey: 'acceso', note: { ...d, actor: a } });
}
// Cierra el hecho: retiene (selección ciega y determinista por hash) los contextos con operación enlazada o con entradas derivadas (siete capacidades de MOTOR-14); el resto queda como contexto intermedio de reserva.
const PERTINENT_SPECIAL = /^receta:(seleccion\.lectura|presion\.perdida|momento\.consistencia|gasto_resistencia)/; // magnitudes que ya eran la salida consumida (MOTOR-14); rebote y lectura defensiva son intermedios
// MOTOR-18 (R17B-SENS-01): la misma capacidad del mismo jugador puede alimentar DOS recetas de la misma operación (p. ej. FIS07 → A y prep del tiro; MEN04 → def y legalDef del control). Para cada op de un item se
// conservan, como copias ligeras sin referencias circulares, las recetas hermanas del MISMO hecho que comparten la nota de la operación y contienen esa capacidad de ese jugador. Se deduplica por (entrada, receta):
// un incremento no se suma dos veces.
function linkDeps(ev) {
  const recOf = new Map(); for (const rc of ev.recs) for (const it of rc.items) recOf.set(it, rc);
  for (const item of ev.items) {
    if (!item.ops?.length) continue; const rc = recOf.get(item);
    for (const op of item.ops) {
      const seen = new Set([`${op.refKey}|${item.label}`]); const deps = [];
      for (const other of ev.items) {
        if (other === item || other.cap !== item.cap || other.player !== item.player || recOf.get(other) === rc) continue;
        for (const o2 of other.ops ?? []) {
          if (o2.note !== op.note) continue; const k = `${o2.refKey}|${other.label}`; if (seen.has(k)) continue; seen.add(k);
          deps.push({ refKey: o2.refKey, peso: o2.peso ?? 1, lado: o2.lado ?? null, label: other.label, valor: other.valor, base: other.base, eff: other.eff, energia: other.energia, taskMax: other.taskMax, topeRegistrado: other.topeRegistrado, terminos: other.terminos, player: other.player, cap: other.cap });
        }
      }
      if (deps.length) op.deps = deps;
    }
  }
}
function flushEvent(P) {
  const ev = P._ev; if (!ev) return; P._ev = null; const R = P.recipes; const [, hi] = R._bounds; linkDeps(ev);
  for (const item of ev.items) {
    const out = item.ops?.length || (item.ex && PERTINENT_SPECIAL.test(item.label) && (!/seleccion/.test(item.label) || item.ex.mix?.entradas || item.ex.accept?.entradas)); const ctxList = ensure(R.contexts, item.cap, () => ({}));
    const stratum = out ? item.stratum : `INTERMEDIO|${item.stratum}`;
    keepSmall(ensure(ctxList, stratum, () => []), item, out ? 8 : 2); if (item.base >= hi - 2 || (item.energia != null && item.energia < 10)) keepSmall(ensure(ctxList, out ? 'LIMITE' : 'LIMITE_INTERMEDIO', () => []), item, 2);
  }
}
