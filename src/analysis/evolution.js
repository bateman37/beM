// Evolución del marcador (MOTOR-10 §7): curva escalonada, ventaja máxima, empates, cambios de líder, tiempo por delante, parciales sin respuesta
// y final ajustado. Todo sale de las anotaciones válidas del acta (pointEvents) y de los intervalos deportivos de los hechos; los hechos con el
// mismo reloj conservan su secuencia (`seq`) y nunca se desplazan a segundos inventados.
import { stamp, periodName, clockText } from './facts.js';

export const DEFAULT_EVOLUTION = { adjustedFinal: { seconds: 120, margin: 5 }, unansweredMin: 8 };

const tenthsWindow = (sec) => sec * 10;

export function scoreCurve(ix) {
  const pts = ix.acta.pointEvents; let a = 0; let b = 0; const curve = [{ seq: 0, event: null, period: 1, remaining: 6000, score: [0, 0], diff: 0, team: null, pts: 0 }];
  for (const p of pts) {
    if (p.team === 0) a += p.pts; else b += p.pts; const ev = ix.byId[p.event];
    curve.push({ seq: p.seq, event: p.event, period: p.period, remaining: ev?.clock?.after ?? null, score: [a, b], diff: a - b, team: p.team, pts: p.pts, kind: p.kind, player: p.player ?? null });
  }
  return curve;
}

export function evolution(ix, cfg = DEFAULT_EVOLUTION) {
  const curve = scoreCurve(ix);
  const maxLead = [null, null]; const ties = []; const changes = []; let lastLeader = 0; let first = null;
  for (let i = 1; i < curve.length; i++) {
    const c = curve[i]; const prev = curve[i - 1];
    for (const t of [0, 1]) { const lead = t === 0 ? c.diff : -c.diff; if (lead > 0 && (!maxLead[t] || lead > maxLead[t].lead)) maxLead[t] = { lead, event: c.event, seq: c.seq, period: c.period, remaining: c.remaining, score: c.score }; }
    if (c.diff === 0 && prev.diff !== 0) ties.push({ event: c.event, seq: c.seq, period: c.period, remaining: c.remaining, score: c.score });
    const leader = Math.sign(c.diff);
    if (leader !== 0) {
      if (first == null) first = { team: leader > 0 ? 0 : 1, event: c.event, seq: c.seq, period: c.period, remaining: c.remaining };
      else if (lastLeader !== 0 && leader !== lastLeader) changes.push({ event: c.event, seq: c.seq, period: c.period, remaining: c.remaining, to: leader > 0 ? 0 : 1, score: c.score });
      lastLeader = leader;
    }
  }
  // tiempo por delante / empatado / por detrás con el marcador previo de cada intervalo de juego vivo (las pausas no suman)
  const ahead = [0, 0]; let tied = 0; let total = 0;
  for (const ev of ix.events) {
    const d = ev.durationTenths ?? 0; if (!d) continue; const [x, y] = ix.scoreBefore[ev.seq]; total += d;
    if (x > y) ahead[0] += d; else if (y > x) ahead[1] += d; else tied += d;
  }
  return { curve, maxLead, ties, leadChanges: changes, firstLead: first, time: { ahead, tied, total, unit: 'décimas de juego vivo' }, runs: unansweredRuns(ix, cfg.unansweredMin), config: cfg };
}

// Parciales sin respuesta: rachas de anotación consecutiva de un mismo equipo (un tiempo muerto no la rompe por sí solo).
export function unansweredRuns(ix, min = 8, { period = null } = {}) {
  const runs = []; let cur = null;
  for (const p of ix.acta.pointEvents) {
    if (period != null && p.period !== period) continue;
    if (cur && cur.team === p.team) { cur.pts += p.pts; cur.end = p; cur.events.push(p.event); }
    else { if (cur) runs.push(cur); cur = { team: p.team, pts: p.pts, start: p, end: p, events: [p.event] }; }
  }
  if (cur) runs.push(cur);
  return runs.filter((r) => r.pts >= min).map((r) => {
    const s0 = r.start; const before = ix.acta.pointEvents.filter((x) => x.seq < s0.seq).reduce((m, x) => { m[x.team] += x.pts; return m; }, [0, 0]);
    const after = [before[0], before[1]]; after[r.team] += r.pts;
    return { team: r.team, points: r.pts, from: { event: s0.event, period: s0.period, seq: s0.seq }, to: { event: r.end.event, period: r.end.period, seq: r.end.seq }, marginBefore: before[r.team] - before[1 - r.team], marginAfter: after[r.team] - after[1 - r.team], events: r.events };
  });
}

// Final ajustado estadístico: últimos N segundos de Q4 o de cada prórroga y margen previo absoluto ≤ M (se evalúa ANTES del hecho; no es la ventana del entrenador).
export function inAdjustedFinal(period, remainingBefore, scoreBefore, cfg = DEFAULT_EVOLUTION.adjustedFinal) {
  if (period < 4 || remainingBefore == null) return false;
  return remainingBefore <= tenthsWindow(cfg.seconds) && Math.abs(scoreBefore[0] - scoreBefore[1]) <= cfg.margin;
}
export const eventInAdjustedFinal = (ix, ev, cfg) => inAdjustedFinal(ev.period, ev.clock?.before, ix.scoreBefore[ev.seq], cfg);

// Parcial por período y marcador por cuarto (con prórrogas) desde el acta.
export function periodScores(ix) { return ix.acta.periods.map((p) => ({ period: p.period, label: periodName(p.period), points: p.points })); }

// Rachas de intentos válidos del mismo equipo (anotados o fallados consecutivos).
export function shotStreaks(ix, min = 4) {
  const out = []; for (const t of [0, 1]) {
    let cur = null; for (const s of ix.shots.filter((x) => x.team === t && x.valid)) {
      const r = s.pub.made ? 'made' : 'miss';
      if (cur && cur.kind === r) { cur.n += 1; cur.last = s.id; } else { if (cur && cur.n >= min) out.push(cur); cur = { team: t, kind: r, n: 1, first: s.id, last: s.id }; }
    }
    if (cur && cur.n >= min) out.push(cur);
  }
  return out;
}

// Remontadas observadas: mayor desventaja superada por el equipo que acaba liderando en un cambio de líder.
export function comebacks(ev) {
  const out = []; for (const ch of ev.leadChanges) {
    const team = ch.to; let worst = 0; for (const c of ev.curve) { if (c.seq >= ch.seq) break; const deficit = team === 0 ? -c.diff : c.diff; if (deficit > worst) worst = deficit; }
    if (worst >= 6) out.push({ team, deficit: worst, at: ch });
  }
  return out;
}
export const describeStamp = (s) => `${periodName(s.period)} ${clockText(s.remaining)}`;
export { stamp };
