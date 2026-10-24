// Configuración de ejecución de los trabajadores físicos (SIM-MOTOR-04B §9.2). No cambia NINGÚN dato deportivo: solo cómo reparte V8 el trabajo de recolección de memoria entre hilos. Con cuatro trabajadores ocupando
// los cuatro núcleos, la recolección menor PARALELA de cada hilo compite con los demás trabajadores; en las mediciones de 04B desactivarla reduce el coste de una pasada de mil partidos (ver `docs/tecnico/sim-motor04b.md`).
// `SIM_GC=parallel` la deja como la define Node por defecto (control de medición). Idempotente y solo en Node.
import v8 from 'node:v8';
let applied = null;
export function configureWorkerRuntime() {
  if (applied !== null) return applied; const mode = process.env.SIM_GC === 'parallel' ? 'parallel' : 'no-parallel-scavenge';
  if (mode !== 'parallel') { try { v8.setFlagsFromString('--no-parallel-scavenge'); } catch { applied = 'parallel (no se pudo fijar la bandera)'; return applied; } }
  applied = mode; return applied;
}
