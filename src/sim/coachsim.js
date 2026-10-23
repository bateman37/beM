// Política pequeña del entrenador en SIM (§5). Presupuesto de decisión acotado: (1) rotación/administración de faltas y energía (dentro del generador, con los umbrales de ENTREF01–03 y del libro de faltas
// como DATOS), (2) respuesta estadística a dos patrones observables del rival (predominio exterior / interior) y (3) ajuste de ritmo ante necesidad de resultado en el cierre.
// Sin búsqueda de planes óptimos, sin memoria por evento, sin rival omnisciente. El entrenador solo ve una VISTA con frontera de observación: hechos propios, información pública del rival y contexto externo ya
// publicado; nunca el estado diagnóstico del resolutor ni finales precalculados de otros partidos.
import { fpCanonical } from './fp.js';

// ---------------------------------------------------------------------------------------------------------------------- libro de faltas como datos (FB070/FB060/FB080/FB075)
// Devuelve la regla de mayor prioridad que aplica y su efecto: `protect` (sacar o reducir riesgo) o `keep` (mantener con riesgo o comparar valor de cierre).
export function foulRule(book, { period, quarters, fouls, left, closingWindow, margin }) {
  let best = null; const last = period >= quarters;
  for (const r of book) {
    const w = r.when; if (w.unavailable || w.manualOrder) continue;
    if (w.period && !w.period.includes(period)) continue; if (w.periodLast && !last) continue;
    if (w.foulsMin != null && fouls < w.foulsMin) continue;
    if (w.closingWindow === 'outside' && left <= closingWindow) continue; if (w.closingWindow === 'inside' && left > closingWindow) continue;
    if (w.marginAbsMax != null && Math.abs(margin) > w.marginAbsMax) continue; if (w.secondsAtMost != null && left > w.secondsAtMost) continue; if (w.deficitMin != null && -margin < w.deficitMin) continue;
    if (!best || r.priority > best.priority) best = r;
  }
  if (!best) return { rule: null, protect: false, keep: false };
  const keep = ['compare_closing_value', 'accept_risk_keep_reference'].includes(best.preference);
  return { rule: best.id, protect: !keep && ['protect', 'reduce_risk_consider_relief'].includes(best.preference), keep };
}

// ---------------------------------------------------------------------------------------------------------------------- estado y vista
export const newCoachState = () => ({ log: [], last: [{}, {}], patterns: [{}, {}] });
const zoneGroup = (z) => (z === 'three' ? 'exterior' : z === 'rim' || z === 'inside' ? 'interior' : 'media');

// Vista del entrenador del equipo `team` en el presente publicado `T`. Solo lee hechos publicados (eventos ≤ T y tramos iniciados) y contexto con `receivedAtPublished` ≤ T.
export function observationFor(m, team, T) {
  const S = m.S; const seg = m.segments.filter((s) => s.start < T - 1e-9); const win = seg.slice(-S.coachSim.observationWindowSegments); const winIdx = new Set(win.map((s) => s.n));
  const margin = { v: 0 }; const rival = { exterior: 0, interior: 0, media: 0 };
  // Lectura INCREMENTAL (agregación en lugar de recorrer todos los hechos en cada revisión): el marcador, el periodo y su inicio se acumulan sobre un puntero que solo avanza (el prefijo publicado es monótono);
  // el conteo de tiros rivales recorre solo los hechos de los tramos de la ventana. Mismo resultado que el recorrido completo; si T retrocede (consulta histórica) se recalcula desde cero.
  let c = m._obs; if (!c || c.events !== m.events || T < c.T - 1e-9) c = m._obs = { events: m.events, i: 0, sc: [0, 0], period: 1, periodStart: 0, T };
  const ev = m.events; let hi = c.i; while (hi < ev.length && ev[hi].t <= T + 1e-9) { const e = ev[hi]; if (e.ty === 'period') { c.period = e.p; c.periodStart = e.t; } else if (e.ty === 'shot') { if (e.made) c.sc[e.tm] += e.pts; } else if (e.ty === 'ft' && e.made) c.sc[e.tm] += 1; hi += 1; } c.i = hi; c.T = T;
  if (win.length) { const first = win[0].n; for (let j = hi - 1; j >= 0 && ev[j].sg >= first; j--) { const e = ev[j]; if (e.ty === 'shot' && e.tm === 1 - team && winIdx.has(e.sg)) rival[zoneGroup(e.zone)] += 1; } }
  const sc = c.sc.slice(); const period = c.period; const periodStart = c.periodStart;
  margin.v = sc[team] - sc[1 - team]; const len = period <= m.rules.quarters ? m.rules.quarterSeconds : m.rules.overtimeSeconds; const left = Math.max(0, periodStart + len - T);
  const external = m.contextLog.filter((c) => c.receivedAtPublished <= T + 1e-9);
  const base = { observedAt: Math.round(T * 10) / 10, team, period, secondsLeft: Math.round(left * 10) / 10, margin: margin.v, score: sc.slice(), rivalShots: { ...rival, window: win.map((s) => s.n) }, external };
  // La huella de la vista se calcula la PRIMERA vez que se lee (decisión tomada o publicación de la revisión) y se memoiza: mismo valor que antes, sin pagar un texto canónico por revisión cuando nadie la consulta.
  const view = { ...base }; let fp; Object.defineProperty(view, 'fingerprint', { enumerable: true, configurable: true, get() { return fp ??= fpCanonical({ ...base, window: win.map((s) => s.n) }); }, set(v) { fp = v; } });
  return view;
}

// Reconocimiento de predominio (§5.1): al menos `minShotAttempts` tiros de campo del rival en la ventana y una zona agrupada ≥ `zoneShareMin`. Exterior = triples; interior = aro + interior; la media distancia no fuerza ninguno.
export function recognizePatterns(S, rivalShots) {
  const total = rivalShots.exterior + rivalShots.interior + rivalShots.media; const out = [];
  if (total >= S.coachSim.minShotAttempts) for (const g of ['exterior', 'interior']) { const share = rivalShots[g] / total; if (share >= S.coachSim.zoneShareMin) out.push({ pattern: g, attempts: total, group: rivalShots[g], share: Math.round(share * 1000) / 1000 }); }
  return out.slice(0, S.coachSim.maxPatterns);
}

// Controles que una orden MANUAL ya aplicada cambió (la configuración manual tiene prioridad en su ámbito y no se sobrescribe en silencio).
const lockedDims = (m, team) => { const set = new Set(); for (const o of m.orders) { if (o.team !== team || (o.source ?? 'manual') !== 'manual') continue; for (const k of o.changed ?? []) set.add(k); } return set; };
const pendingDims = (m, team) => { const set = new Set(); for (const o of m.orders) if (o.team === team && !o.applied) for (const k of Object.keys(o.plan)) set.add(k); return set; };

// Revisión de un entrenador en la frontera `T`. Aplica como mucho un paso de un nivel por dimensión (`maxLevelStepPerReview`), respeta `adjustmentHold`, las órdenes manuales vigentes y la delegación del plan,
// y registra razón, muestra, vista y cambio. Devuelve las decisiones tomadas y las omitidas con su causa.
export function coachReview(m, team, T) {
  const S = m.S; const t = m.teams[team]; const pol = m.T.coachPolicies[t.plan.coach?.policy ?? 'ENTREF02'] ?? m.T.coachPolicies.ENTREF02; const deleg = { adjustments: true, endgame: true, ...(t.plan.coach?.delegation ?? {}) };
  const view = observationFor(m, team, T); const st = m.coach; const decisions = []; const skipped = []; const locks = lockedDims(m, team); const pend = pendingDims(m, team);
  const tryChange = (dim, key, delta, reason, sample) => {
    const [group, name] = dim.split('.'); const cur = t.plan[group][name]; const to = Math.min(5, Math.max(1, cur + Math.max(-S.coachSim.maxLevelStepPerReview, Math.min(S.coachSim.maxLevelStepPerReview, delta)))); if (to === cur) { skipped.push({ dim, reason, cause: 'ya está en el límite del control' }); return; }
    if (locks.has(dim)) { skipped.push({ dim, reason, cause: 'orden manual vigente sobre ese control' }); return; }
    if (pend.has(group)) { skipped.push({ dim, reason, cause: 'ya hay una orden pendiente sobre ese grupo de controles' }); return; }
    const last = st.last[team][dim]; if (last != null && T - last < pol.adjustmentHold - 1e-9) { skipped.push({ dim, reason, cause: `permanencia: faltan ${Math.ceil(pol.adjustmentHold - (T - last))} s de la política` }); return; }
    const patch = { [group]: { ...t.plan[group], [name]: to } }; const r = m.submit({ at: T, team, plan: patch, source: 'coach', why: { dim, reason, from: cur, to, sample, view: view.fingerprint } });
    if (!r.ok) { skipped.push({ dim, reason, cause: r.error }); return; }
    st.last[team][dim] = T; const d = { at: T, team, dim, from: cur, to, reason, sample, observedAt: view.observedAt, viewFingerprint: view.fingerprint, effectiveAt: r.effectiveAt, order: r.id, source: 'coach-policy' }; decisions.push(d); st.log.push(d); void key;
  };
  if (deleg.adjustments) {
    const pats = recognizePatterns(S, view.rivalShots); st.patterns[team] = Object.fromEntries(pats.map((p) => [p.pattern, { ...p, at: T }]));
    // exterior → proteger el exterior (nivel +1 en la tabla); interior → proteger el interior (nivel −1): la tabla interior/exterior de protección crece hacia el exterior
    for (const p of pats) tryChange('defStyles.protection', 'protection', p.pattern === 'exterior' ? +1 : -1, `predominio_${p.pattern}`, { attempts: p.attempts, group: p.group, share: p.share, window: view.rivalShots.window });
  } else if (recognizePatterns(S, view.rivalShots).length) skipped.push({ dim: 'defStyles.protection', reason: 'patrón', cause: 'ajustes no delegados al entrenador' });
  // necesidad de resultado en el cierre: el objetivo procede del contexto publicado (p. ej. clasificación provisional); no es un atributo nuevo
  const closing = view.period >= m.rules.quarters && view.secondsLeft <= pol.closingWindow;
  if (closing) {
    const needs = view.external.filter((c) => c.kind === 'need' && c.team === team); const need = needs.length ? needs[needs.length - 1] : null;
    if (need && need.requiredMargin > view.margin) { if (deleg.endgame) tryChange('styles.organizedPace', 'pace', +1, 'necesidad_cierre', { requiredMargin: need.requiredMargin, margin: view.margin, secondsLeft: view.secondsLeft, source: need.source ?? null }); else skipped.push({ dim: 'styles.organizedPace', reason: 'necesidad_cierre', cause: 'cierre no delegado al entrenador' }); }
  }
  return { view, decisions, skipped };
}

// Recorre el partido por barreras de revisión cada `every` s publicados (en una jornada son las barreras comunes). `policy` activa la revisión de ambos entrenadores; sin ella solo se publica por fronteras
// (misma trayectoria que `finish()`). `context(m, T)` puede añadir contexto externo ya publicado antes de cada revisión.
export function playWithBarriers(m, { every = 120, policy = true, context = null, onBarrier = null } = {}) {
  for (let T = every; m.status === 'running'; T += every) {
    m.advance({ until: T }); if (m.status !== 'running') break;
    if (context) context(m, T); if (policy) for (const team of [0, 1]) coachReview(m, team, T);
    if (onBarrier) onBarrier(m, T);
  }
  m.advance({ until: 'end' }); return m;
}

// Ruta de PRODUCTO de dirección automática (C03-11): la misma configuración de entrenador, órdenes y noticias usa el mismo calendario deportivo de revisiones (cada 120 s de juego publicado, ambos entrenadores) en
// partido completo, lotes, temporada y jornada, aunque la interfaz avance de golpe. `SimMatch.finish()` queda como PRIMITIVA de generación sin política (control técnico identificado, no producto).
export const REVIEW_EVERY = 120;
// Avanza con dirección automática hasta `until` (segundos publicados; 'end' = hasta terminar) revisando a ambos entrenadores en CADA múltiplo de `every` que se cruza: da igual que la interfaz avance de golpe,
// por cuartos o por barreras, el calendario deportivo de revisiones es el mismo. Una llamada que termina en un instante no múltiplo no revisa en él; la siguiente continúa en el múltiplo pendiente.
export function advanceAutomatic(m, { until = 'end', every = REVIEW_EVERY, context = null, onBarrier = null } = {}) {
  const lim = until === 'end' ? Infinity : until;
  for (let T = (Math.floor(m.published / every + 1e-9) + 1) * every; m.status === 'running' && T <= lim + 1e-9; T += every) {
    m.advance({ until: T }); if (m.status !== 'running') break;
    if (context) context(m, T); for (const team of [0, 1]) coachReview(m, team, T);
    if (onBarrier) onBarrier(m, T);
  }
  if (until === 'end' || lim >= m.published) m.advance({ until });
  return m;
}
export const playAutomatic = (m, opts = {}) => advanceAutomatic(m, { ...opts, until: 'end' });
