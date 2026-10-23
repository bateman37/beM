// Fragmento de jornada: posee un conjunto de encuentros SIM y los avanza por BARRERAS comunes (§7). Es la misma lógica en proceso y dentro de un trabajador: la jornada no crea un hilo por partido ni un mensaje
// por segundo; reparte grupos de encuentros y recibe PAQUETES de progreso compactos (marcador, estado, cursor) y los registros esenciales de los terminados. El estado SIM vive aquí; el coordinador solo ve proyecciones.
import { SimMatch } from './engine.js';
import './materialize.js';
import { coachReview } from './coachsim.js';
import { buildSimResult } from './result.js';
import { buildSimEssential } from './essential.js';
import { snapshotSim, restoreSim } from './snapshot.js';
import { contextFromJSON } from './context.js';
import { buildPairInput } from './teams.js';

export class ShardRunner {
  // `releaseFinished`: al terminar un encuentro se conserva solo su registro esencial y su último paquete (se libera el estado SIM con sus hechos): imprescindible para jornadas de miles de encuentros.
  constructor(ctx = null, { releaseFinished = false } = {}) { this.ctx = ctx; this.matches = new Map(); this.teamMap = null; this.releaseFinished = releaseFinished; }
  setContext(ctxJSON) { this.ctx = contextFromJSON(ctxJSON); }
  // `fx`: { id, input, opts, start } ; el encuentro empieza en el instante virtual `start` (desfase sobre la agenda).
  // `fx.spec` ({ a, b, seed, importance }) construye la entrada en el propio fragmento con las doce plantillas ya enviadas (no se viaja una entrada de cientos de KB por encuentro).
  add(fx) { if (!fx.input && fx.spec) fx = { ...fx, input: buildPairInput(this.teamMap, fx.spec.a, fx.spec.b, { seed: fx.spec.seed, importance: fx.spec.importance ?? 'ordinary' }) }; this.matches.set(fx.id, { id: fx.id, start: fx.start ?? 0, controlledTeams: fx.controlledTeams ?? null, m: new SimMatch(fx.input, this.ctx, { matchId: fx.id, attemptId: fx.attemptId ?? 1, ...(fx.opts ?? {}) }), essential: null }); return fx.id; }
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
    for (const id of [...this.matches.keys()].sort()) { const e = this.matches.get(id); if (!e.m) { out.push(e.final); continue; } const local = this.localTime(e, T); if (local > 0 && e.m.status === 'running' && local > e.m.published + 1e-9) e.m.advance({ until: local }); const p = this.progressOf(e, T); if (this.releaseFinished && p.finished && !e.essential) { e.essential = buildSimEssential(e.m); e.final = p; e.m = null; } out.push(p); }
    return out;
  }
  // Revisión de los entrenadores en la frontera `T` con el contexto ya publicado de cada encuentro (`needs[id] = [{ team, ... }]`). Devuelve las decisiones y las omitidas con su causa.
  review(T, needs = {}, { policy = true } = {}) {
    const out = {};
    for (const id of [...this.matches.keys()].sort()) {
      const e = this.matches.get(id); if (!e.m || e.m.status !== 'running' || T < e.start || e.m.published <= 1e-9) continue; // sin revisión antes de empezar: el calendario de revisiones es el mismo que el de playAutomatic (publicado > 0)
      for (const n of needs[id] ?? []) { const last = [...e.m.contextLog].reverse().find((c) => c.kind === n.kind && c.team === n.team); if (!last || last.requiredMargin !== n.requiredMargin || last.source !== n.source) e.m.addContext(n); }
      if (policy) { out[id] = [0, 1].map((team) => { const r = coachReview(e.m, team, e.m.published); return { team, decisions: r.decisions, skipped: r.skipped, view: r.view.fingerprint }; }); }
    }
    return out;
  }
  // Orden manual a un encuentro (C03-10): rechazo TIPADO si es desconocido, ya terminó (estado liberado) o el equipo no está bajo autoridad del usuario (`controlledTeams` declarado al añadir); nunca lanza por un id ausente.
  order(id, spec) {
    const e = this.matches.get(id); if (!e) return { ok: false, rejected: true, code: 'desconocido', reason: `encuentro desconocido: ${id}` };
    if (!e.m || e.m.status === 'finished' || e.m.status === 'error') return { ok: false, rejected: true, code: 'terminado', reason: 'el encuentro ya terminó' };
    if (e.controlledTeams) { const ti = typeof spec?.team === 'number' ? spec.team : e.m.teams.findIndex((t) => t.id === spec?.team); if (!e.controlledTeams.includes(ti)) return { ok: false, rejected: true, code: 'sin_autoridad', reason: `sin autoridad sobre el equipo ${spec?.team}` }; }
    const r = e.m.submit(spec); return r.ok ? r : { ...r, rejected: true, code: 'invalida' };
  }
  result(id, opts = {}) { return buildSimResult(this.matches.get(id).m, opts); }
  essential(id) { const e = this.matches.get(id); if (!e.essential) e.essential = buildSimEssential(e.m); return e.essential; }
  released(id) { return this.matches.get(id)?.m == null; }
  snapshot(id) { return snapshotSim(this.matches.get(id).m); }
  drop(id) { this.matches.delete(id); }
}
