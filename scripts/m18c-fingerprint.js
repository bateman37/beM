// Recalcula `teamFingerprint(state)` (src/learning/team.js) para los estados de un JSON {equipo: estado} leído de la entrada estándar. Lo usa el comprobador de la entrega para no copiar valores del informe.
import { teamFingerprint } from '../src/learning/index.js';
let raw = ''; for await (const c of process.stdin) raw += c;
const states = JSON.parse(raw); process.stdout.write(JSON.stringify(Object.fromEntries(Object.entries(states).map(([t, s]) => [t, teamFingerprint(s)]))));
