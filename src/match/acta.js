// Acta completa de MOTOR-09 (EST01, EST02, EST04): proyección determinista desde los HECHOS del encuentro y la política versionada.
// No hay acumuladores paralelos: marcador, acta individual y colectiva, parciales, series, finalizaciones F, posesiones, presencia y más-menos salen
// de la misma lectura ordenada por la secuencia estable de hechos. Una consulta no consume azar ni concede créditos nuevos.
export const ACTA_POLICY_ID = 'ACTA-MOTOR17-R1'; // MOTOR-17: robo con criterio único por pérdida viva recuperada con control (todas las rutas). MOTOR-15B: ACTA-MOTOR15B-R1 (solo balón suelto ganado en disputa). MOTOR-15: ACTA-MOTOR15-R1 (asistencias con productor causal). Un acta anterior no se reinterpreta con esta política

const ATTACK_TYPES = new Set(['attempt', 'foul', 'free_throw', 'loose_ball', 'rebound', 'reorganization', 'throw_in']);
const POSSESSION_CLOSE = {
  madeFG: 'canasta', ftMade: 'último libre anotado', dreb: 'rebote defensivo', steal: 'pérdida con robo', liveTurnover: 'pérdida viva recuperada por la defensa (con o sin robo acreditado)', deadTurnover: 'pérdida o infracción con balón muerto',
  looseLost: 'balón suelto perdido', blockRecovery: 'tapón con control defensivo', periodEnd: 'fin de periodo con ataque activo', blockedOOB: 'tapón fuera',
};
const pct = (m, a) => (a > 0 ? m / a : null);
const zeroLine = () => ({
  min: 0, pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, ast: 0, astFg: 0, astFt: 0, tov: 0, stl: 0, blk: 0, blkRec: 0, pf: 0, fr: 0, pm: 0,
  fouls: { personal: 0, tiro: 0, ofensiva: 0, disruptiva: 0, flagrante: 0, tecnica1: 0, tecnica2: 0, otras: 0 },
});

// `src`: { events, lineups, input, possessions?, status?, periodScores? }. `policy`: política estadística del perfil (statsPolicy) o la de referencia.
export function buildActa(src, policy = {}) {
  const { events, input } = src;
  const asst = { requiresDirectContinuation: true, fieldGoal: true, freeThrowSeries: true, maxPerSeries: 1, ...(policy.assist ?? {}) };
  const feedOk = (feed) => !!feed && (feed.close ? feed.close.eligible : !(asst.requiresDirectContinuation && feed.moved)); // MOTOR-15: el motivo de cierre del productor decide; un hecho anterior sin él usa la regla de MOTOR-09
  const players = {}; const teamOf = {}; const info = {};
  input.teams.forEach((t, ti) => t.players.forEach((p) => {
    players[p.id] = zeroLine(); teamOf[p.id] = ti;
    info[p.id] = { id: p.id, team: ti, name: p.name, number: null, position: p.positions?.[0] ?? null, role: p.offensiveRole?.name ?? null, starter: false, available: p.state?.available !== false };
  }));
  const onCourt = input.teams.map((t) => new Set(Object.values(t.plan.starters)));
  for (const t of input.teams) for (const id of Object.values(t.plan.starters)) info[id].starter = true;
  const entered = new Set(); onCourt.forEach((s) => s.forEach((id) => entered.add(id)));
  const collective = input.teams.map(() => ({ tov: 0, reb: 0, rebOff: 0, rebDef: 0, tovCauses: {} }));
  const teamFouls = input.teams.map(() => ({})); const teamPoints = [0, 0]; const periods = {};
  const timeouts = input.teams.map(() => ({}));
  const coachTech = input.teams.map(() => ({ C: 0, B: 0, descalificado: false })); // MOTOR-15: técnicas imputadas al entrenador (no son faltas de jugador ni de equipo)
  const excluded = new Set(); const exitSeq = {};
  const pointEvents = []; const series = {}; const finals = []; const finalByShot = {};
  const credits = []; // trazabilidad: cada crédito remite a su hecho
  const intervals = []; const open = {}; // intervalos de presencia por jugador
  let game = 0; let lastPeriod = 0;
  const openInterval = (pid, ev) => { open[pid] = { player: pid, team: teamOf[pid], startSeq: ev ? ev.seq : 0, startPeriod: ev ? ev.period : 1, startGame: game, tenths: 0 }; };
  for (const s of onCourt) for (const id of s) openInterval(id, null);
  const closeInterval = (pid, ev) => { const iv = open[pid]; if (!iv) return; iv.endSeq = ev.seq; iv.endPeriod = ev.period; iv.endGame = game; intervals.push(iv); delete open[pid]; };
  const addPoint = (ev, team, pts, kind, player, extra = {}) => {
    teamPoints[team] += pts; (periods[ev.period] ??= [0, 0])[team] += pts;
    const on = [[...onCourt[0]], [...onCourt[1]]];
    pointEvents.push({ seq: ev.seq, event: ev.id, period: ev.period, team, pts, kind, player, possession: ev.possessionId ?? null, on, ...extra });
    for (const id of on[team]) players[id].pm += pts; for (const id of on[1 - team]) players[id].pm -= pts;
  };

  for (const ev of events) {
    lastPeriod = ev.period;
    if (ev.durationTenths > 0) { for (const s of onCourt) for (const id of s) { players[id].min += ev.durationTenths; if (open[id]) open[id].tenths += ev.durationTenths; } game += ev.durationTenths; }
    if (ev.type === 'substitution') {
      const { sale, entra } = ev.participants;
      if (sale) { closeInterval(sale, ev); onCourt[teamOf[sale]].delete(sale); exitSeq[sale] = ev.seq; }
      if (entra) { onCourt[teamOf[entra]].add(entra); entered.add(entra); openInterval(entra, ev); }
    }
    if (ev.type === 'timeout') { const t = ev.team; if (t != null) timeouts[t][ev.period] = (timeouts[t][ev.period] ?? 0) + 1; }
    if (ev.effects?.excluido && ev.participants?.infractor) { excluded.add(ev.participants.infractor); }
    if (ev.effects?.entrenador) { const ce = ev.effects.entrenador; coachTech[ce.equipo] = { C: ce.contadores.C, B: ce.contadores.B, descalificado: coachTech[ce.equipo].descalificado || !!ce.descalificado }; credits.push({ k: 'tec-entrenador', team: ce.equipo, categoria: ev.effects.categoria, event: ev.id }); }
    if (ev.effects?.interferencia) credits.push({ k: 'interferencia', situacion: ev.effects.interferencia.situacion, lado: ev.effects.interferencia.lado, infractor: ev.effects.interferencia.infractor, efecto: ev.effects.interferencia.efecto, event: ev.id });
    for (const f of ev.stats) {
      switch (f.k) {
        case 'shot': {
          const pl = players[f.p]; const three = f.zone === 'three';
          const foulMiss = (f.fromFoul && !f.made) || f.annulled; // un fallo con falta en acto de tiro, o un tiro anulado, NO es un intento de campo válido (S09-03, adaptación 2026)
          if (!foulMiss) { if (three) { pl.fg3a += 1; if (f.made) pl.fg3m += 1; } else { pl.fg2a += 1; if (f.made) pl.fg2m += 1; } }
          if (f.made) { pl.pts += f.points; addPoint(ev, f.team, f.points, 'fg', f.p, { zone: f.zone }); }
          if (f.blockedBy) { pl.blkRec += 1; credits.push({ k: 'trec', p: f.p, event: ev.id }); }
          // asistencia a canasta: el pase final alimenta un tiro válido del receptor sin creación propia con movimiento
          if (f.made && asst.fieldGoal && feedOk(f.feed)) { players[f.feed.passer].ast += 1; players[f.feed.passer].astFg += 1; credits.push({ k: 'ast', type: 'canasta', p: f.feed.passer, shooter: f.p, event: ev.id }); }
          // F: la acción de tiro abre una finalización (también la falta sobre un tiro fallado, aunque no cuente como FGA); un tiro anulado no abre F
          if (f.annulled) break;
          const F = { id: `F${String(finals.length + 1).padStart(3, '0')}`, possession: ev.possessionId, team: f.team, shooter: f.p, event: ev.id, period: ev.period, zone: f.zone, value: f.points, made: !!f.made, fromFoul: !!f.fromFoul, blocked: !!f.blockedBy, series: null, fieldPoints: f.made ? f.points : 0, seriesPoints: 0, closed: !f.fromFoul };
          finals.push(F); finalByShot[ev.id] = F;
          break;
        }
        case 'ft': {
          const pl = players[f.p]; const valid = (f.status ?? 'administered') === 'administered'; // un libre anulado o repetido no es un intento válido ni abre otra F
          if (valid) pl.fta += 1;
          const s = (series[f.series] ??= { id: f.series, shooter: f.p, team: f.team, granted: f.n, cause: f.cause, shooting: !!f.shooting, shotEvent: f.shotEvent ?? null, shotMade: !!f.shotMade, feed: f.feed ?? null, attempts: [], events: [] });
          s.attempts.push({ i: f.i, made: !!f.made, status: f.status ?? 'administered', corrected: f.corrected?.id ?? null }); s.events.push(ev.id);
          if (f.made && valid) { pl.ftm += 1; pl.pts += 1; addPoint(ev, f.team, 1, 'ft', f.p, { series: f.series, linked: f.shotEvent ? finalByShot[f.shotEvent]?.id ?? null : null }); }
          break;
        }
        case 'reb': {
          if (f.p == null) { collective[f.team].reb += 1; if (f.off) collective[f.team].rebOff += 1; else collective[f.team].rebDef += 1; } else if (f.off) players[f.p].oreb += 1; else players[f.p].dreb += 1;
          credits.push({ k: 'reb', p: f.p ?? null, team: f.team, off: !!f.off, of: f.of ?? null, event: ev.id });
          break;
        }
        case 'tov': if (f.p) players[f.p].tov += 1; else { collective[f.team].tov += 1; collective[f.team].tovCauses[f.cause ?? 'equipo'] = (collective[f.team].tovCauses[f.cause ?? 'equipo'] ?? 0) + 1; } break;
        case 'stl': players[f.p].stl += 1; credits.push({ k: 'stl', p: f.p, event: ev.id }); break;
        case 'blk': players[f.p].blk += 1; credits.push({ k: 'blk', p: f.p, event: ev.id }); break;
        case 'foul': {
          const pl = players[f.p]; pl.pf += 1;
          const kind = ['personal', 'tiro', 'ofensiva', 'disruptiva', 'flagrante', 'tecnica1', 'tecnica2'].includes(f.kind) ? f.kind : 'otras'; pl.fouls[kind] += 1;
          if (f.sobre && players[f.sobre]) players[f.sobre].fr += 1; // falta recibida solo cuando existe un receptor individual identificado
          if (f.teamFoul) { const key = ev.period <= 4 ? ev.period : 4; teamFouls[f.team][key] = (teamFouls[f.team][key] ?? 0) + 1; }
          break;
        }
        case 'adminPts': addPoint(ev, f.team, f.points, 'admin', null, { cause: f.cause ?? null }); break;
        default: throw new Error(`hecho de acta desconocido ${f.k}`);
      }
    }
  }
  for (const id of Object.keys(open)) { const iv = open[id]; iv.endSeq = events.length ? events[events.length - 1].seq : 0; iv.endPeriod = lastPeriod; iv.endGame = game; intervals.push(iv); }

  // ---------------------------------------------------------------- series y F: enlace por el hecho de tiro que las origina
  for (const s of Object.values(series)) {
    const madeN = s.attempts.filter((a) => a.made && a.status === 'administered').length;
    const validN = s.attempts.filter((a) => a.status === 'administered').length;
    s.made = madeN; s.administered = s.attempts.length; s.valid = validN; s.annulled = s.attempts.filter((a) => a.status === 'annulled').length; s.repeated = s.attempts.filter((a) => a.status === 'repeated').length; s.cancelled = s.attempts.length > 0 && s.attempts.every((a) => a.status === 'annulled' && a.corrected); // serie anulada por una corrección (art. 45): no queda pendiente ni abre F
    s.pending = validN < s.granted && !s.cancelled; s.points = madeN;
    const F = s.shotEvent ? finalByShot[s.shotEvent] : null;
    if (F) { F.series = s.id; F.seriesPoints += madeN; F.closed = !s.pending; s.final = F.id; }
    // asistencia a una serie elegible: tiro fallado con falta, pase final elegible y al menos un libre convertido (una por serie)
    if (asst.freeThrowSeries && s.shooting && !s.shotMade && feedOk(s.feed) && madeN >= 1) {
      players[s.feed.passer].ast += asst.maxPerSeries; players[s.feed.passer].astFt += asst.maxPerSeries;
      credits.push({ k: 'ast', type: 'libres', p: s.feed.passer, shooter: s.shooter, series: s.id });
    }
  }
  for (const F of finals) F.points = F.fieldPoints + F.seriesPoints;

  // ---------------------------------------------------------------- posesiones beM
  const ps = src.possessions ?? derivePossessions(events);
  const bySeq = {}; for (const ev of events) (bySeq[ev.possessionId] ??= []).push(ev);
  const possessions = [];
  for (const p of ps) {
    const evs = bySeq[p.id] ?? []; const active = evs.some((e) => ATTACK_TYPES.has(e.type) || (e.type === 'expiry' && e.stats.some((x) => x.k === 'tov')));
    if (!active) continue; // un cierre sin ataque activo no crea una posesión vacía
    const pts = pointEvents.filter((x) => x.possession === p.id).reduce((s, x) => s + x.pts, 0);
    possessions.push({ id: p.id, team: p.team, period: p.period, startSeq: p.startSeq, endSeq: p.endSeq, endKind: p.endKind, closeCause: POSSESSION_CLOSE[p.endKind] ?? (p.endKind ?? 'abierta'), points: pts, finals: finals.filter((f) => f.possession === p.id).length, events: evs.length });
  }

  // ---------------------------------------------------------------- particiones de puntos (dos clasificaciones del mismo total)
  const total = teamPoints[0] + teamPoints[1];
  const sum = (f) => pointEvents.filter(f).reduce((s, x) => s + x.pts, 0);
  const finalIds = new Set(finals.map((f) => f.id));
  const partition = {
    byOrigin: {
      f: sum((x) => x.kind === 'fg' || (x.kind === 'ft' && x.linked && finalIds.has(x.linked))),
      sanction: sum((x) => x.kind === 'ft' && !(x.linked && finalIds.has(x.linked))),
      administrative: sum((x) => x.kind === 'admin'), other: 0,
    },
    byPossession: { linked: sum((x) => x.possession && possessions.some((p) => p.id === x.possession)), unlinked: 0 },
    total,
  };
  partition.byPossession.unlinked = total - partition.byPossession.linked;
  partition.byOrigin.other = total - partition.byOrigin.f - partition.byOrigin.sanction - partition.byOrigin.administrative; // «otros» solo recoge créditos tipados: debe quedar en 0 hoy

  // ---------------------------------------------------------------- líneas individuales, estado de participación y VAL
  const lines = {};
  for (const id of Object.keys(players)) {
    const l = players[id]; const inf = info[id];
    const fgm = l.fg2m + l.fg3m; const fga = l.fg2a + l.fg3a; const reb = l.oreb + l.dreb;
    let participation;
    if (!inf.available) participation = 'indisponible'; else if (!entered.has(id)) participation = 'DNP'; else participation = l.min > 0 ? (inf.starter ? 'titular' : 'entró') : 'entró sin tiempo';
    const val = l.pts + reb + l.ast + l.stl + l.blk + l.fr - (fga - fgm) - (l.fta - l.ftm) - l.tov - l.blkRec - l.pf;
    lines[id] = { ...inf, ...l, min: l.min / 600, minTenths: l.min, fgm, fga, reb, participation, exit: excluded.has(id) ? 'excluido por faltas' : '—', exitSeq: exitSeq[id] ?? null,
      pct: { fg2: pct(l.fg2m, l.fg2a), fg3: pct(l.fg3m, l.fg3a), ft: pct(l.ftm, l.fta), fg: pct(fgm, fga) }, dunks: null, val };
  }
  const teams = input.teams.map((t, ti) => {
    const ids = t.players.map((p) => p.id); const L = ids.map((id) => lines[id]);
    const s = (k) => L.reduce((x, l) => x + l[k], 0); const c = collective[ti];
    const tot = { pts: s('pts'), fg2m: s('fg2m'), fg2a: s('fg2a'), fg3m: s('fg3m'), fg3a: s('fg3a'), ftm: s('ftm'), fta: s('fta'), oreb: s('oreb') + c.rebOff, dreb: s('dreb') + c.rebDef, ast: s('ast'), astFg: s('astFg'), astFt: s('astFt'), tov: s('tov') + c.tov, stl: s('stl'), blk: s('blk'), blkRec: s('blkRec'), pf: s('pf'), fr: s('fr'), min: s('min') };
    tot.fgm = tot.fg2m + tot.fg3m; tot.fga = tot.fg2a + tot.fg3a; tot.reb = tot.oreb + tot.dreb;
    return { index: ti, id: t.id, name: t.name, players: ids, points: teamPoints[ti], totals: tot, collective: c, individualOnly: { tov: s('tov'), reb: s('oreb') + s('dreb') }, fouls: teamFouls[ti], timeouts: timeouts[ti], coach: coachTech[ti], minutesExpected: null };
  });
  const periodList = Object.entries(periods).map(([p, pts]) => ({ period: Number(p), points: pts }));
  const pendingSeries = Object.values(series).filter((s) => s.pending).map((s) => s.id);
  const openFinals = finals.filter((f) => !f.closed).map((f) => f.id);
  const status = src.status ?? 'finished';
  return {
    policy: ACTA_POLICY_ID, status: { match: status, partial: status !== 'finished', pendingSeries, openFinals, definitive: status === 'finished' && !pendingSeries.length },
    players: lines, teams, periods: periodList, series: Object.values(series), finals, possessions, partition, presence: { intervals, game }, pointEvents, credits,
    score: [...teamPoints], glossary: GLOSSARY,
  };
}

// Derivación mínima de posesiones desde los hechos cuando no se dispone del registro del motor (conserva inicio y cierre por identificador).
export function derivePossessions(events) {
  const out = []; const seen = new Map();
  for (const ev of events) {
    if (!ev.possessionId) continue;
    let p = seen.get(ev.possessionId);
    if (!p) { p = { id: ev.possessionId, team: ev.team, period: ev.period, startSeq: ev.seq, endSeq: ev.seq, endKind: null }; seen.set(ev.possessionId, p); out.push(p); }
    p.endSeq = ev.seq;
  }
  return out;
}

export const GLOSSARY = {
  MIN: 'Minutos de presencia efectiva (décimas reales de juego con el jugador en pista).', PTS: 'Puntos de cancha.', T2C: 'Tiros de dos convertidos (intentos válidos).', T2I: 'Tiros de dos intentados válidos.', T3C: 'Triples convertidos.', T3I: 'Triples intentados válidos.',
  TLC: 'Libres convertidos.', TLI: 'Libres intentados (administrados y válidos).', TCC: 'Tiros de campo convertidos (T2C + T3C).', TCI: 'Tiros de campo intentados (T2I + T3I); un fallo con falta en acción de tiro no cuenta.',
  RO: 'Rebotes ofensivos.', RD: 'Rebotes defensivos.', RT: 'Rebotes totales.', AS: 'Asistencias (a canasta + a libres).', 'AS-C': 'Asistencias a canasta.', 'AS-L': 'Asistencias a una serie de libres (una por serie).', PER: 'Pérdidas atribuidas al sujeto responsable.',
  REC: 'Robos (intervención defensiva resuelta en la misma acción).', TAP: 'Tapones.', TREC: 'Tapones recibidos (comparte intento con TAP).', FC: 'Faltas cometidas.', FR: 'Faltas recibidas (solo con receptor individual identificado).', '+/-': 'Más-menos de presencia: puntos de cancha del equipo menos los del rival mientras el jugador está presente; no atribuye causalidad individual.',
  VAL: 'PTS + RT + AS + REC + TAP + FR − (TCI − TCC) − (TLI − TLC) − PER − TREC − FC (convención de acta, no un overall).', F: 'Finalización: una acción de tiro y su serie causal ligada.', DNP: 'Convocado que no entró en pista.', '—': 'No aplicable: no hay intentos (no es un 0 %), o el hecho no se representa.',
};

// Totales de equipo con el formato de MOTOR-01 (compatibilidad con el laboratorio y las consultas heredadas).
export function legacyTotals(acta, teamIdx) { const t = acta.teams[teamIdx]; const x = t.totals; return { pts: x.pts, fg2m: x.fg2m, fg2a: x.fg2a, fg3m: x.fg3m, fg3a: x.fg3a, ftm: x.ftm, fta: x.fta, oreb: x.oreb, dreb: x.dreb, tov: t.individualOnly.tov, teamTov: t.collective.tov, pf: x.pf, stl: x.stl, blk: x.blk, min: x.min }; }
