// Adaptador del encuentro DETALLADO para la jornada (§7.2). Usa el contrato existente (`createEncounter`, `advance`, `requestOrder`, `snapshot`) sin cambiar su deporte: el núcleo se resuelve por pasos atómicos y NUNCA
// se rebobina ni se interpola. Si un paso termina después del horizonte de publicación, sus datos futuros se retienen y se conserva el último estado publicable, con su instante de observación declarado.
// Tiempo local = tiempo disputado acumulado de periodos (reloj deportivo virtual) menos el desfase de inicio; no es una duración real de partido.
import { createEncounter, restoreEncounter } from '../engine/index.js';

const playedOf = (m) => { const q = m.profileData.rules ?? m.profile.rules; const quarters = q.quarters; const qs = q.quarterSeconds; const os = q.overtimeSeconds; const per = m.period; const before = per <= quarters ? (per - 1) * qs : quarters * qs + (per - quarters - 1) * os; const len = per <= quarters ? qs : os; return before + (len - m.clock / 10); };

export class DetailedFixture {
  constructor({ id, input, profile, controlledTeams = [0], start = 0, enc = null, timeline = null }) {
    this.id = id; this.start = start; this.controlledTeams = controlledTeams;
    this.enc = enc ?? createEncounter({ input, profile, controlledTeams, instanceId: id });
    this.timeline = timeline ?? [{ t: 0, score: [0, 0], period: 1, seq: 0 }]; // un registro por paso resuelto: tiempo disputado, marcador y periodo tras el paso
  }
  get done() { return this.enc.done; }
  // Resuelve pasos atómicos mientras el último estado resuelto no alcance el horizonte local. El último paso puede terminar por delante: queda en el sufijo privado.
  advanceTo(local) {
    const m = this.enc.match; let guard = 0;
    // también se resuelve el cierre de un periodo cuyo reloj ya llegó a cero dentro del horizonte (se sabrá si hay prórroga o final)
    while (!this.enc.done && (this.timeline[this.timeline.length - 1].t < local - 1e-9 || (this.timeline[this.timeline.length - 1].t <= local + 1e-9 && m.clock === 0)) && guard++ < 1e6) { this.enc.advance({ until: 'step' }); this.timeline.push({ t: playedOf(m), score: [...m.score], period: m.period, seq: m.stepSeq }); }
    return this.published(local);
  }
  // Último estado publicable en `local`: el último paso resuelto con t ≤ local (nunca un estado interpolado).
  published(local) {
    let i = this.timeline.length - 1; while (i > 0 && this.timeline[i].t > local + 1e-9) i--; const r = this.timeline[i]; const finished = this.enc.done && i === this.timeline.length - 1;
    return { id: this.id, resolver: 'detailed', start: this.start, local: Math.round(Math.max(0, local) * 10) / 10, started: local > 0 || this.start === 0, status: this.enc.match.status === 'error' ? 'error' : finished ? 'finished' : local > 0 ? 'running' : 'scheduled', published: Math.round(r.t * 10) / 10, observedAt: Math.round(r.t * 10) / 10, score: r.score.slice(), periods: null, finished, step: r.seq, aheadSteps: this.timeline.length - 1 - i, controlledTeams: this.controlledTeams.slice() };
  }
  // Orden del usuario: entra en la ventana que el motor detallado admite en su estado ACTUAL (puede estar un paso por delante del presente publicado); se devuelve desde cuándo rige.
  order(spec, localPublished) { const t = this.timeline[this.timeline.length - 1].t; const r = this.enc.requestOrder(spec); return { ...r, publishedAt: localPublished, engineAt: Math.round(t * 10) / 10, note: 'el motor detallado aplica la orden en su siguiente frontera atómica legal' }; }
  snapshot(label = null) { return { engine: this.enc.snapshot({ label }), timeline: this.timeline, controlledTeams: this.controlledTeams, start: this.start }; }
  static restore(id, snap) { const enc = restoreEncounter(snap.engine, { controlledTeams: snap.controlledTeams, instanceId: id }); return new DetailedFixture({ id, enc, timeline: snap.timeline, controlledTeams: snap.controlledTeams, start: snap.start }); }
  result() { return this.enc.result(); }
  essential() { return this.enc.essential(); }
}
