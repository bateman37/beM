// Fragmento de jornada: posee un conjunto de encuentros SIM y los avanza por BARRERAS comunes (§7). Es la misma lógica en proceso y dentro de un trabajador: la jornada no crea un hilo por partido ni un mensaje
// por segundo; reparte grupos de encuentros y recibe PAQUETES de progreso compactos (marcador, estado, cursor) y los registros esenciales de los terminados. El estado SIM vive aquí; el coordinador solo ve proyecciones.
import { SimMatch } from './engine.js';
import './materialize.js';
import { coachReview } from './coachsim.js';
import { buildSimResult } from './result.js';
import { buildSimEssential } from './essential.js';
import { snapshotSim, restoreSim } from './snapshot.js';
import { contextFromJSON } from './context.js';

export class ShardRunner {
  constructor(ctx = null) { this.ctx = ctx; this.matches = new Map(); }
  setContext(ctxJSON) { this.ctx = contextFromJSON(ctxJSON); }
  // `fx`: { id, input, opts, start } ; el encuentro empieza en el instante virtual `start` (desfase sobre la agenda).
  add(fx) { this.matches.set(fx.id, { id: fx.id, start: fx.start ?? 0, m: new SimMatch(fx.input, this.ctx, { matchId: fx.id, attemptId: fx.attemptId ?? 1, ...(fx.opts ?? {}) }), essential: null }); return fx.id; }
  restore(fx, snap) { this.matches.set(fx.id, { id: fx.id, start: fx.start ?? 0, m: restoreSim(snap, this.ctx, { matchId: fx.id }), essential: null }); }
  has(id) { return this.matches.has(id); }
  // Tiempo local = tiempo disputado acumulado de periodos (virtual deportivo) menos el desfase de inicio; un partido no iniciado no publica nada.
  localTime(e, T) { return Math.max(0, T - e.start); }
  progressOf(e, T) {
    const m = e.m; const p = m.syncPub(); const local = this.localTime(e, T); const started = T >= e.start - 1e-9;
    return { id: e.id, resolver: 'sim', start: e.start, local: Math.round(local * 10) / 10, started, status: m.status === 'error' ? 'error' : p.ended ? 'finished' : started ? 'running' : 'scheduled', published: Math.round(m.published * 10) / 10, score: p.score.slice(), periods: p.periods.map((x) => x.slice()), finished: p.ended, observedAt: Math.round(m.published * 10) / 10 };
  }
  // Publica los hechos alcanzados hasta el instante virtual `T` en todos los encuentros del fragmento (orden estable por identificador). Devuelve los paquetes de progreso.
  advanceAll(T) {
    const out = [];
    for (const id of [...this.matches.keys()].sort()) { const e = this.matches.get(id); const local = this.localTime(e, T); if (local > 0 && e.m.status === 'running' && local > e.m.published + 1e-9) e.m.advance({ until: local }); out.push(this.progressOf(e, T)); }
    return out;
  }
  // Revisión de los entrenadores en la frontera `T` con el contexto ya publicado de cada encuentro (`needs[id] = [{ team, ... }]`). Devuelve las decisiones y las omitidas con su causa.
  review(T, needs = {}, { policy = true } = {}) {
    const out = {};
    for (const id of [...this.matches.keys()].sort()) {
      const e = this.matches.get(id); if (e.m.status !== 'running' || T < e.start) continue;
      for (const n of needs[id] ?? []) { const last = [...e.m.contextLog].reverse().find((c) => c.kind === n.kind && c.team === n.team); if (!last || last.requiredMargin !== n.requiredMargin || last.source !== n.source) e.m.addContext(n); }
      if (policy) { out[id] = [0, 1].map((team) => { const r = coachReview(e.m, team, e.m.published); return { team, decisions: r.decisions, skipped: r.skipped, view: r.view.fingerprint }; }); }
    }
    return out;
  }
  order(id, spec) { const e = this.matches.get(id); return e.m.submit(spec); }
  result(id, opts = {}) { return buildSimResult(this.matches.get(id).m, opts); }
  essential(id) { const e = this.matches.get(id); if (!e.essential) e.essential = buildSimEssential(e.m); return e.essential; }
  snapshot(id) { return snapshotSim(this.matches.get(id).m); }
  drop(id) { this.matches.delete(id); }
}
