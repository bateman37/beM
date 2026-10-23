// Adaptador del encuentro DETALLADO para la jornada (§7.2). Usa el núcleo isomorfo existente (`createMatch`, `step`, `submit`, `snapshotMatch`) sin cambiar su deporte, de modo que funciona igual en Node y en el
// navegador. El núcleo se resuelve por pasos atómicos y NUNCA se rebobina ni se interpola: si un paso termina después del horizonte de publicación, sus datos futuros se retienen y se conserva el último estado
// publicable, con su instante de observación declarado. Tiempo local = tiempo disputado acumulado de periodos (reloj deportivo virtual) menos el desfase de inicio; no es una duración real de partido.
import { createMatch, buildResult, validateInput } from '../match/index.js';
import { snapshotMatch, restoreMatch } from '../match/snapshot.js';

const playedOf = (m) => { const q = m.profileData.rules ?? m.profile.rules; const quarters = q.quarters; const qs = q.quarterSeconds; const os = q.overtimeSeconds; const per = m.period; const before = per <= quarters ? (per - 1) * qs : quarters * qs + (per - quarters - 1) * os; const len = per <= quarters ? qs : os; return before + (len - m.clock / 10); };
const isDone = (m) => m.status === 'finished' || m.status === 'error';

// Registro esencial común del detallado para el mundo: acta individual desde el resultado exportado del núcleo (sin fabricar nada que no exista).
export function detailedEssential(m) {
  const res = buildResult(m); const players = Object.values(res.acta.players).map((p) => ({ id: p.id, team: p.team, team_index: p.team, participation: p.participation, starter: !!p.starter, min_tenths: p.minTenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, tov: p.tov, stl: p.stl, blk: p.blk, blk_rec: p.blkRec, pf: p.pf, fr: p.fr, pm: p.pm }));
  return { schema: 'beM-detailed-essential-lite/2', model: 'detailed', complete: m.status === 'finished', status: m.status, identity: { teams: m.teams.map((t) => ({ id: t.id })), seed: res.identity?.seed ?? null, effectiveProfile: res.identity?.effectiveProfileId ?? null }, result: { status: m.status, court_score: [...m.score] }, score: { final: m.status === 'finished' ? [...m.score] : null }, durationSeconds: playedOf(m), acta: { players, teams: [{ possessions: null }, { possessions: null }] }, validity: { valid: m.status === 'finished' && res.reconciliation?.ok !== false, reconciliation_ok: res.reconciliation?.ok ?? null } };
}
export class DetailedFixture {
  constructor({ id, input, profile, controlledTeams = [0], start = 0, match = null, timeline = null }) {
    this.id = id; this.start = start; this.controlledTeams = controlledTeams; this.profile = profile;
    if (!match) { const errs = validateInput(input, profile); if (errs.length) throw new Error(`entrada no válida para el detallado: ${errs.slice(0, 4).map((e) => `${e.path}: ${e.message}`).join('; ')}`); }
    this.match = match ?? createMatch(input, profile, { detail: 'full' });
    this.timeline = timeline ?? [{ t: 0, score: [0, 0], period: 1, seq: 0 }]; // un registro por paso resuelto: tiempo disputado, marcador y periodo tras el paso
  }
  get done() { return isDone(this.match); }
  // Resuelve pasos atómicos mientras el último estado resuelto no alcance el horizonte local. El último paso puede terminar por delante: queda en el sufijo privado. También se resuelve el cierre de un periodo
  // cuyo reloj ya llegó a cero dentro del horizonte (se sabrá si hay prórroga o final).
  advanceTo(local) {
    const m = this.match; let guard = 0;
    while (!isDone(m) && (this.timeline[this.timeline.length - 1].t < local - 1e-9 || (this.timeline[this.timeline.length - 1].t <= local + 1e-9 && m.clock === 0)) && guard++ < 1e6) { m.step(); this.timeline.push({ t: playedOf(m), score: [...m.score], period: m.period, seq: m.stepSeq }); }
    return this.published(local);
  }
  // Último estado publicable en `local`: el último paso resuelto con t ≤ local (nunca un estado interpolado).
  published(local) {
    let i = this.timeline.length - 1; while (i > 0 && this.timeline[i].t > local + 1e-9) i--; const r = this.timeline[i]; const finished = isDone(this.match) && i === this.timeline.length - 1;
    return { id: this.id, resolver: 'detailed', start: this.start, local: Math.round(Math.max(0, local) * 10) / 10, started: local > 0 || this.start === 0, status: this.match.status === 'error' ? 'error' : finished ? 'finished' : local > 0 ? 'running' : 'scheduled', published: Math.round(r.t * 10) / 10, observedAt: Math.round(r.t * 10) / 10, score: r.score.slice(), periods: null, finished, step: r.seq, aheadSteps: this.timeline.length - 1 - i, controlledTeams: this.controlledTeams.slice() };
  }
  // Orden del usuario: entra en la ventana que el motor detallado admite en su estado ACTUAL (puede estar un paso por delante del presente publicado); se devuelve desde cuándo rige.
  order(spec, localPublished) { if (!this.controlledTeams.includes(spec.team)) return { state: 'rechazada', cause: `sin autoridad sobre el equipo ${spec.team}`, order: null }; if (isDone(this.match)) return { state: 'rechazada', cause: 'el encuentro terminó', order: null }; const t = this.timeline[this.timeline.length - 1].t; const o = this.match.submit(spec); return { state: o.state, cause: o.reason ?? null, order: { id: o.id, type: o.type, state: o.state }, publishedAt: localPublished, engineAt: Math.round(t * 10) / 10, note: 'el motor detallado aplica la orden en su siguiente frontera atómica legal' }; }
  snapshot(label = null) { return { engine: snapshotMatch(this.match, { label }), timeline: this.timeline, controlledTeams: this.controlledTeams, start: this.start }; }
  static restore(id, snap, profile = null) { const match = restoreMatch(snap.engine); return new DetailedFixture({ id, match, timeline: snap.timeline, controlledTeams: snap.controlledTeams, start: snap.start, profile }); }
  result() { return buildResult(this.match); }
  essential() { return detailedEssential(this.match); }
}
// Juega un encuentro detallado completo sin intervención (el sénior propio ya dirigido por defecto): devuelve su registro esencial común.
export function playDetailed(input, profile) { const m = createMatch(input, profile, { detail: 'full' }); while (m.step()); return detailedEssential(m); }
