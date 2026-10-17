// Sesión de partido (MOTOR-02): un único controlador de avance sobre el núcleo común para las tres modalidades.
// Sin DOM y sin reloj propio: el planificador se inyecta (setTimeout/cedido en el navegador; reloj controlado en las pruebas).
// La modalidad y la velocidad pertenecen a la presentación: NO alteran el deporte. Todas llaman a MatchCore.step().
import { createMatch, buildResult } from './index.js';
import { snapshotMatch, restoreMatch } from './snapshot.js';

export const MODES = { total: 'Simulado total', cuartos: 'Por cuartos', tiempo: 'Por tiempo' };
export const SESSION_STATES = {
  preparado: 'Preparado', enMarcha: 'En marcha', enPausa: 'En pausa', revision: 'Revisión entre periodos',
  tiempoMuerto: 'Tiempo muerto concedido', finalizado: 'Finalizado', error: 'Error',
};

// Parámetros de PRESENTACIÓN (no deportivos): cambiar una espera no crea otro perfil de baloncesto.
export const PRESENTATION = { speeds: [2, 4, 8, 16], defaultSpeed: 2, baseMsPerGameSecond: 1000, minWaitMs: 30, maxWaitMs: 8000, chunkSteps: 40 };

const browserScheduler = {
  setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (h) => clearTimeout(h),
  yield: () => new Promise((r) => setTimeout(r, 0)), now: () => Date.now(),
};

export class MatchSession {
  constructor({ input, profile, profileRef = null, mode = 'total', managedTeam = 0, speed = PRESENTATION.defaultSpeed, scheduler = browserScheduler, presentation = PRESENTATION, pauseOnTimeout = true, match = null } = {}) {
    if (!MODES[mode]) throw new Error(`modalidad desconocida: ${mode}`);
    this.mode = mode; this.managedTeam = managedTeam; this.speed = speed; this.sched = scheduler; this.pres = presentation; this.pauseOnTimeout = pauseOnTimeout;
    // copia congelada de la entrada y del perfil efectivo: activar otro perfil después no cambia este encuentro
    this.match = match ?? createMatch(input, profile, { detail: 'full', direction: { managedTeam, mode }, profileRef }); // `match`: núcleo ya restaurado de un guardado (MOTOR-14)
    this.state = 'preparado'; this.token = 0; this.timer = null; this.running = false; this.listeners = new Set();
    this.pendingBaseMs = 0;
    this.log = { mode, managedTeam, initialSpeed: speed, speedChanges: [], pauses: [], resumes: [], reviews: [], startedAt: null, finishedAt: null };
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit() { for (const fn of this.listeners) fn(this); }
  _now() { return this.sched.now ? this.sched.now() : null; }
  get busy() { return this.running || this.timer != null; }

  // El estado de sesión nunca se confunde con el deportivo: «en pausa» solo detiene el avance, no concede descanso.
  _settle() {
    const m = this.match;
    if (m.status === 'finished') { this.state = 'finalizado'; this.log.finishedAt = this._now(); }
    else if (m.status === 'error') this.state = 'error';
    else if (m.periodBreak != null && this.mode !== 'tiempo') { this.state = 'revision'; this.log.reviews.push({ atStep: m.stepSeq, period: m.period, wall: this._now() }); }
    else this.state = 'enPausa';
    this._emit();
  }

  // ---------------- avance en bloques (total y cuartos): se cede la ejecución sin añadir hechos ni cambiar el azar
  async _runUntil(stop) {
    const token = this.token; this.running = true; this.state = 'enMarcha'; this._emit();
    let n = 0;
    try {
      while (token === this.token) {
        const alive = this.match.step();
        if (!alive || stop(this.match)) break;
        n += 1;
        if (n % this.pres.chunkSteps === 0) { await this.sched.yield(); if (token !== this.token) return false; }
      }
    } finally { if (token === this.token) this.running = false; }
    if (token !== this.token) return false;
    this._settle();
    return true;
  }

  // Iniciar: simulado total hasta el final; por cuartos hasta el primer cierre de periodo; por tiempo, visionado.
  async start() {
    if (this.busy || this.state !== 'preparado') return false;
    this.log.startedAt = this._now();
    if (this.mode === 'total') return this._runUntil(() => false);
    if (this.mode === 'cuartos') return this._runUntil((m) => m.periodBreak != null);
    this._playTimed(); return true;
  }

  // Continuar tras restaurar un guardado (o iniciar uno preparado). Por cuartos, en una revisión pendiente use `playNextPeriod` (admite el plan del siguiente periodo).
  async proceed() {
    if (this.busy || this.state === 'finalizado' || this.state === 'error') return false;
    if (this.state === 'preparado') return this.start();
    if (this.mode === 'tiempo') return this.resume();
    if (this.mode === 'cuartos') return this.state === 'revision' ? (await this.playNextPeriod()).ok : this._runUntil((m) => m.periodBreak != null);
    return this._runUntil(() => false);
  }

  // Por cuartos: «Aplicar plan y jugar siguiente periodo». Valida el conjunto entero; si no es válido no arranca el periodo.
  async playNextPeriod(draftSpecs = [], label = 'plan del siguiente periodo') {
    if (this.mode !== 'cuartos' || this.busy || this.state !== 'revision') return { ok: false, reason: 'no hay un periodo pendiente de jugar' };
    let orders = [];
    if (draftSpecs.length) {
      orders = this.match.submitBatch(draftSpecs.map((x) => ({ team: this.managedTeam, ...x })), label);
      const bad = orders.filter((o) => o.state === 'rechazada');
      if (bad.length) { this._emit(); return { ok: false, reason: 'conjunto no aplicado', orders }; }
    }
    await this._runUntil((m) => m.periodBreak != null);
    return { ok: true, orders };
  }

  // ---------------- visionado por tiempo: un solo temporizador pendiente, un acontecimiento resuelto por tick
  _playTimed() { this.state = 'enMarcha'; this._emit(); this._schedule(0); }
  _schedule(ms) {
    const token = this.token;
    this.timer = this.sched.setTimeout(() => { this.timer = null; if (token === this.token) this._tick(); }, ms);
  }
  _tick() {
    if (this.state !== 'enMarcha') return;
    const m = this.match;
    const alive = m.step();
    const info = m.lastStep;
    if (!alive) { this._settle(); return; }
    if (this.pauseOnTimeout && info.timeouts > 0) { this.state = 'tiempoMuerto'; this.log.reviews.push({ atStep: m.stepSeq, timeout: true, wall: this._now() }); this._emit(); return; }
    // Espera = duración deportiva resuelta en este paso, a la escala de la velocidad. Un navegador en segundo plano retrasa el
    // siguiente tick pero nunca encadena varios: no se simula de golpe el tiempo transcurrido.
    let tenths = 0; for (let i = info.firstEvent; i < m.events.length; i++) tenths += m.events[i].durationTenths;
    this.pendingBaseMs = (tenths / 10) * this.pres.baseMsPerGameSecond;
    this._emit();
    this._schedule(this._wait(this.pendingBaseMs));
  }
  _wait(baseMs) { return Math.min(this.pres.maxWaitMs, Math.max(this.pres.minWaitMs, baseMs / this.speed)); }

  pause() {
    if (this.mode !== 'tiempo' || this.state !== 'enMarcha') return false;
    if (this.timer != null) { this.sched.clearTimeout(this.timer); this.timer = null; }
    this.state = 'enPausa'; this.log.pauses.push({ atStep: this.match.stepSeq, wall: this._now() }); this._emit();
    return true;
  }
  resume() {
    if (this.mode !== 'tiempo' || this.busy || (this.state !== 'enPausa' && this.state !== 'tiempoMuerto')) return false;
    this.log.resumes.push({ atStep: this.match.stepSeq, wall: this._now() });
    this.state = 'enMarcha'; this._emit(); this._schedule(0);
    return true;
  }
  setSpeed(v) {
    if (!this.pres.speeds.includes(v) || v === this.speed) return false;
    this.log.speedChanges.push({ atStep: this.match.stepSeq, from: this.speed, to: v, wall: this._now() });
    this.speed = v;
    if (this.timer != null) { this.sched.clearTimeout(this.timer); this.timer = null; this._schedule(this._wait(this.pendingBaseMs)); } // un solo temporizador
    this._emit();
    return true;
  }

  // ---------------- dirección: las órdenes se registran en la frontera actual; no consumen azar ni dan descanso
  canDirect() { return !['preparado', 'finalizado', 'error'].includes(this.state); }
  submit(spec) { const o = this.match.submit({ team: this.managedTeam, ...spec }); this._emit(); return o; }
  submitBatch(specs, label) { const os = this.match.submitBatch(specs.map((s) => ({ team: this.managedTeam, ...s })), label); this._emit(); return os; }
  cancel(id) { const r = this.match.cancel(id); this._emit(); return r; }

  // ---------------- guardar y continuar (MOTOR-14 §10). Guardar solo LEE el estado en una frontera estable: no avanza, no sortea y no concede ventanas. Los datos de presentación
  // (modalidad, equipo dirigido, velocidad) viajan aparte en `lab.presentation` y no forman parte del estado deportivo.
  snapshot({ label = null, savedAt = null } = {}) {
    return snapshotMatch(this.match, { label, savedAt: savedAt ?? this._now(), lab: { presentation: { mode: this.mode, managedTeam: this.managedTeam, speed: this.speed } } });
  }
  // Continuar un guardado con SU entrada y SU perfil congelados. Queda en pausa/revisión: el usuario decide cuándo reanudar (no se avanza al restaurar).
  static fromSnapshot(snap, { scheduler = browserScheduler, presentation = PRESENTATION, mode = null, managedTeam = null, speed = null, pauseOnTimeout = true } = {}) {
    const pres = snap.lab?.presentation ?? {};
    const md = mode ?? pres.mode ?? 'total'; const mt = managedTeam ?? pres.managedTeam ?? 0;
    const match = restoreMatch(snap, { direction: { managedTeam: mt, mode: md } });
    const s = new MatchSession({ input: match.input, profile: match.profileData, mode: md, managedTeam: mt, speed: speed ?? pres.speed ?? PRESENTATION.defaultSpeed, scheduler, presentation, pauseOnTimeout, match });
    s.log.restoredFrom = { stepSeq: snap.position.stepSeq, period: snap.position.period, label: snap.label ?? null };
    if (match.status === 'created') s.state = 'preparado'; else s._settle();
    return s;
  }

  // ---------------- salidas
  result() { return buildResult(this.match, { presentation: { ...this.log, speed: this.speed, state: this.state } }); }
  dispose() { this.token += 1; if (this.timer != null) { this.sched.clearTimeout(this.timer); this.timer = null; } this.running = false; this.listeners.clear(); }
}
