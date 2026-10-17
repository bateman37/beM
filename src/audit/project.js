// Proyección de un intento (MOTOR-13 §12.2): UNA pasada por bloques sobre los registros ya conservados (decisiones, hechos, estados y tablas) que produce agregados reutilizables por
// todos los auditores. Se guarda en disco por huella de evidencia y política (`out/audit/cache/`): analizar de nuevo no vuelve a leer los cientos de MiB. No sortea, no simula y no
// toca ningún archivo original.
import { jsonlRecords, ensure, inc, fnv, r4, sum } from './util.js';
import { effectiveAbility } from '../match/core.js';

export const PROJECTION_VERSION = 'PRJ-MOTOR13-R3';
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

export function projectAttempt(src, a, profile, cfg) {
  const t0 = performance.now(); const taskMax = Object.fromEntries(Object.entries(profile.tasks ?? {}).map(([k, v]) => [k, v.maxEnergyPenalty]));
  const caps = new Set(profile.attributeOrder); const foulOut = profile.rules?.foulOut ?? 5;
  const P = { match_id: a.match_id, attempt_id: a.attempt_id, case_id: a.case_id, variant_id: a.variant_id, level: a.level, valid: a.valid, facts: a.facts, projection: PROJECTION_VERSION,
    binary: {}, dist: {}, cat: {}, recipes: { terms: 0, bad: [], weightBad: 0, valueBad: 0, effMismatch: 0, effChecked: 0, boundsBad: 0, capsUnknown: {}, byCap: {}, energyBands: {}, contexts: {}, byTask: {}, labelsSeen: {} },
    opp: { n: 0, procedencia: {}, tags: {}, eleccion: {} }, libro: { n: 0, prios: {}, ties: 0, noElegible: 0, badPrio: 0 }, coach: { n: 0, area: {}, estado: {}, regla: {} }, memoria: { n: 0, tipo: {}, claves: {}, maxOcupadas: 0 },
    saques: { n: 0, kind: {}, sinReceptor: 0, status: {} }, states: { changes: 0, ambito: {}, nuevoSum: {}, nuevoN: {}, episodes: {}, T: { n: 0, nonzero: 0 } }, orders: { n: 0, tipos: {} },
    rebote: { n: 0, label: {} }, durations: {}, calcKinds: {}, events: { n: 0, types: {}, durationBad: 0, clockBad: 0, scoreBad: 0, loop: { maxStreak: 0, streaks: 0, example: null }, byPeriodTenths: {} },
    tables: {}, bytes: {}, ms: {} };
  const rel = (m, k) => ensure(m, k, newRel);

  // ---------------------------------------------------------------- decisiones (la mayor parte del volumen)
  const dec = src.stream(a, 'decisiones'); P.bytes.decisiones = dec?.length ?? 0;
  if (dec) for (const r of jsonlRecords(dec)) {
    if (r.record_type === 'calculo') {
      inc(P.calcKinds, r.kind); const d = r.data ?? {};
      if (r.kind === 'binaria') { const lab = r.label.slice(8); addRel(rel(P.binary, lab), d.p, d.resultado ? 1 : 0, r.decision_id); }
      else if (r.kind === 'distribucion') {
        const lab = r.label.replace(/EQ\d+(_B)?-J\d+/g, 'J'); const opts = d.opciones ?? []; const R = rel(P.dist, lab);
        if (opts.length < 2) { R.degenerate = (R.degenerate ?? 0) + 1; continue; }
        R.decisions = (R.decisions ?? 0) + 1; for (const o of opts) addRel(R, o.p, o.clave === d.elegido ? 1 : 0, r.decision_id);
        if (!PLAYER.test(opts[0].clave)) for (const o of opts) { const c = ensure(ensure(P.cat, lab, () => ({})), o.clave, () => ({ n: 0, expected: 0, observed: 0 })); c.n += 1; c.expected += o.p; if (o.clave === d.elegido) c.observed += 1; }
      } else if (r.kind === 'receta') projectRecipe(P, r, taskMax, caps, profile);
      else if (r.kind === 'calidad_ataque') { for (const x of d.receta ?? []) { const c = ensure(P.recipes.qualityTerms ??= {}, x.cap, () => ({ uses: 0, sumEff: 0, sumShare: 0 })); c.uses += 1; c.sumEff += x.efectiva; } }
      else if (r.kind === 'libro') { const f = d.fichas ?? []; P.libro.n += 1; const el = f.filter((x) => x.elegible); if (!el.length) P.libro.noElegible += 1; /* prioridad null = ficha LLAMADA aunque no esté en el libro (la llamada puntual no la activa; prioridad efectiva 1): es legítima, no un error de rango (AUD07, corregida en MOTOR-13) */ for (const x of f) { if (x.prioridad == null) { P.libro.called = (P.libro.called ?? 0) + 1; continue; } inc(P.libro.prios, x.prioridad); if (!(x.prioridad >= 1 && x.prioridad <= 5)) P.libro.badPrio += 1; } const pr = el.map((x) => x.prioridad ?? 1); if (pr.length) { const m = Math.min(...pr); if (pr.filter((x) => x === m).length > 1) P.libro.ties += 1; } }
      else if (r.kind === 'rebote') { P.rebote.n += 1; inc(P.rebote.label, r.label); }
      else if (r.kind === 'duracion') { const x = ensure(P.durations, r.label, () => ({ n: 0, tenths: 0 })); x.n += 1; x.tenths += d.decimas ?? 0; }
    } else if (r.record_type === 'oportunidad') { P.opp.n += 1; inc(P.opp.procedencia, r.procedencia ?? 'null'); inc(P.opp.eleccion, r.eleccion ?? 'null'); for (const t of r.etiquetas ?? []) inc(P.opp.tags, t); }
    else if (r.record_type === 'entrenador') { P.coach.n += 1; inc(P.coach.area, r.area); inc(P.coach.estado, r.estado); inc(P.coach.regla, r.regla ?? 'null'); }
    else if (r.record_type === 'memoria') { P.memoria.n += 1; inc(P.memoria.tipo, r.tipo); inc(P.memoria.claves, r.clave ?? 'null'); P.memoria.maxOcupadas = Math.max(P.memoria.maxOcupadas, r.ocupadas ?? 0); }
    else if (r.record_type === 'cadena_saque') { P.saques.n += 1; inc(P.saques.kind, r.kind); inc(P.saques.status, r.status); if (r.status === 'cerrada' && !r.receptor) P.saques.sinReceptor += 1; if (r.status === 'abierta') P.saques.abiertas = (P.saques.abiertas ?? 0) + 1; }
  }
  P.ms.decisiones = performance.now() - t0;

  // ---------------------------------------------------------------- hechos (relojes, bucles, tipos)
  const ev = src.stream(a, 'eventos'); P.bytes.eventos = ev?.length ?? 0;
  if (ev) {
    let prev = null; let streak = 0; let prevSig = null; let prevScore = [0, 0]; const SKIP = new Set(['free_throw', 'foul', 'substitution', 'timeout', 'period_start', 'period_end', 'interval', 'tipoff']);
    for (const e of jsonlRecords(ev)) {
      P.events.n += 1; inc(P.events.types, e.type); P.events.byPeriodTenths[e.period] = (P.events.byPeriodTenths[e.period] ?? 0) + (e.durationTenths ?? 0);
      if ((e.durationTenths ?? 0) < 0 || (e.clock && e.clock.after > e.clock.before)) P.events.durationBad += 1;
      if (prev && prev.period === e.period && e.clock && prev.clock && e.clock.before !== prev.clock.after) { P.events.clockBad += 1; if (P.events.clockBad === 1) P.events.clockExample = { event_id: e.event_id, prev: prev.event_id, before: e.clock.before, prevAfter: prev.clock.after }; }
      if (e.score && (e.score[0] < prevScore[0] || e.score[1] < prevScore[1])) P.events.scoreBad += 1; prevScore = e.score ?? prevScore;
      const sig = `${e.type}|${e.team}|${e.possession_id}|${e.intent?.motivo ?? ''}|${e.clock?.after}`;
      if (!SKIP.has(e.type) && (e.durationTenths ?? 0) === 0 && sig === prevSig) { streak += 1; if (streak === 1) P.events.loop.streaks += 1; if (streak > P.events.loop.maxStreak) { P.events.loop.maxStreak = streak; P.events.loop.example = { event_id: e.event_id, signature: sig }; } } else streak = 0;
      prevSig = sig; prev = e;
    }
  }
  const st = src.stream(a, 'estados'); P.bytes.estados = st?.length ?? 0;
  if (st) for (const r of jsonlRecords(st)) {
    if (r.record_type === 'cambio_estado') { P.states.changes += 1; inc(P.states.ambito, r.ambito); inc(P.states.nuevoSum, r.ambito, r.nuevo ?? 0); inc(P.states.nuevoN, r.ambito); if (r.ambito === 'T') { P.states.T.n += 1; if (r.nuevo) P.states.T.nonzero += 1; } }
    else if (r.record_type === 'episodio') inc(P.states.episodes, r.tipo ?? r.id ?? 'episodio');
  }
  const or = src.stream(a, 'ordenes'); if (or) for (const r of jsonlRecords(or)) { P.orders.n += 1; inc(P.orders.tipos, r.record_type + ':' + (r.tipo ?? r.type ?? r.state ?? '')); }
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
  P.shots = { n: 0, byQuality: {}, defOrg: { n: 0, mismatch: 0, effective: {} }, noParticipants: 0 };
  for (const s of T.tiros ?? []) { if (!s.valid || s.annulled) continue; P.shots.n += 1; const q = ensure(P.shots.byQuality, s.quality ?? 'sin_calidad', () => ({ n: 0, sumPFinal: 0, sumPConv: 0, made: 0 })); q.n += 1; q.sumPFinal += s.p_final ?? 0; q.sumPConv += s.p_conversion ?? 0; if (s.made) q.made += 1; if (s.def_org_intended) { P.shots.defOrg.n += 1; inc(P.shots.defOrg.effective, s.def_org_effective ?? 'null'); if (s.def_org_effective !== s.def_org_intended) P.shots.defOrg.mismatch += 1; } if (!s.shooter_player_instance_id) P.shots.noParticipants += 1; }
  P.ms.total = performance.now() - t0;
  return P;
}

function projectRecipe(P, r, taskMax, caps, profile) {
  const R = P.recipes; const d = r.data ?? {}; const terms = d.terminos; const t = taskOf(r.label); inc(R.labelsSeen, t ? `${t.task}.${t.side}` : 'otras');
  if (!Array.isArray(terms)) return;
  let w = 0; let num = 0; const [lo, hi] = profile.abilityBounds;
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
    // coherencia de la operación pura con el valor registrado (solo con tope de tarea conocido)
    if (t && taskMax[t.task] != null && e != null) { R.effChecked += 1; const v = effectiveAbility(profile, x.base, e, x.cap, taskMax[t.task]); if (Math.abs(v - x.efectiva) > 0.06) { R.effMismatch += 1; if (R.bad.length < 5) R.bad.push({ decision_id: r.decision_id, cap: x.cap, base: x.base, energia: e, registrada: x.efectiva, pura: r4(v) }); } }
    // contextos del contraste B (selección ciega, determinista)
    const h = fnv(`${r.decision_id}|${x.cap}|${x.jugador}|${x.rol}`); const ctxList = ensure(R.contexts, x.cap, () => ({}));
    const item = { h, decision_id: r.decision_id, event_id: r.event_id, label: r.label, task: t ? `${t.task}.${t.side}` : null, taskMax: t ? taskMax[t.task] ?? null : null, stratum, player: x.jugador, rol: x.rol, cap: x.cap, base: x.base, eff: x.efectiva, energia: e, peso: x.peso, valor: d.valor, terminos: terms };
    keepSmall(ensure(ctxList, stratum, () => []), item, 3); if (x.base >= hi - 2 || (e != null && e < 10)) keepSmall(ensure(ctxList, 'LIMITE', () => []), item, 2);
  }
}
