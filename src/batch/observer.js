// Observador incremental de huella de trayectoria (MOTOR-15 §11.4). Se alimenta durante la simulación (tras cada paso) con los hechos nuevos y no conserva nada: solo el estado del SHA-256.
// NO es la huella TRAY-MOTOR12-R1 (`trajectoryFingerprint`, que proyecta el resultado completo): tiene su propia etiqueta `TRAYINC-MOTOR15-R1` y su propia definición; las dos NO son intercambiables.
// Contenido hasheado, en orden: cada hecho con todos sus campos deportivos (sin `calc`, `params`, `instr`, que son diagnóstico o lectura) incluidos sus sorteos (`draws`), y al cerrar el estado final
// (marcador, parciales, estado, pasos, sorteos consumidos, órdenes, comandos, terminación administrativa, energía final, estados comprometidos y episodios). Sirve para comparar completo/reducido/esencial en la misma versión deportiva.
import { createHash } from 'node:crypto';
import { canonicalJson } from './hashing.js';

export const INCREMENTAL_FP_VERSION = 'TRAYINC-MOTOR15-R1';

export class TrajectoryObserver {
  constructor() { this.h = createHash('sha256'); this.seen = 0; this.events = 0; this.ms = 0; this.closed = false; }
  // `events`: la lista viva del núcleo (m.events); se consumen solo los hechos aún no vistos.
  consume(events) {
    const t0 = performance.now();
    for (; this.seen < events.length; this.seen++) { const { calc, params, instr, ...e } = events[this.seen]; void calc; void params; void instr; this.h.update(canonicalJson(e)); this.h.update('\n'); this.events += 1; }
    this.ms += performance.now() - t0;
  }
  finish(m) {
    this.consume(m.events); const t0 = performance.now();
    const tail = { score: [...m.score], periodScores: m.periodScores.map((p) => ({ period: p.period, points: [...p.points] })), status: m.status, steps: m.stepSeq, draws: m.rng.count, orders: m.orders, commands: m.commands, administrative: m.administrative ?? null,
      finalEnergy: Object.fromEntries(Object.entries(m.ps).map(([id, s]) => [id, Math.round(s.energy * 100) / 100])), states: m.stateSnapshot(), episodes: m.episodeLog ?? null };
    this.h.update(canonicalJson(tail)); this.closed = true; this.ms += performance.now() - t0;
    return { version: INCREMENTAL_FP_VERSION, sha256: this.h.digest('hex'), events: this.events, ms: this.ms };
  }
}
