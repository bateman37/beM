// Tabla declarativa de elegibilidad de pase final (SIM-MOTOR-04B §7.4). Decide, para cada SALIDA del libro de fichas y para cada contexto sin ficha, si la finalización puede llevar una entrega final y con qué fundamento.
// No simula pases ni conducción: es una etiqueta compacta de procedencia que el generador lee al resolver una finalización. La asistencia sigue siendo causal (pasador real, mismo equipo, entrega generada ANTES de resolver
// el tiro); esta tabla solo fija qué finalizaciones admiten esa entrega. Derivada del catálogo vigente (`T.plays`), no de constantes sueltas.
//
// Clases (código numérico `elc` en el hecho de tiro; 0 = sin clase, finalización sin entrega posible):
//   1 `explicit_pass`      salida con `exec: 'pass'` y origen `from`: el catálogo declara el pase; conserva su productor y la regla existente.
//   2 `received_advantage` salida sin pase explícito cuyo ejecutante, según el catálogo, RECIBE antes de finalizar (rol de pool con etiqueta de recepción) y la ventaja puede conservarse: admite entrega con
//                           probabilidad `assist.receivedAdvantageP0` (decisión compacta); el pasador sorteado es un participante real.
//   3 `received_lost`      misma clase 2 cuando la ventaja NO se conserva (decisión negativa): sin entrega final. Se conserva como oportunidad para el denominador.
//   4 `transition`         transición: conserva su productor (`derived.transition.passShare`).
//   5 `spontaneous`        decisión espontánea: conserva su productor (`derived.spontaneous.passShare`).
//   0 salidas de ejecución individual (`dribble` del portador, `auto`): sin pase final añadido; continuación por rebote ofensivo: no hereda ni pase ni asistencia de la acción anterior.
export const ELC = Object.freeze({ NONE: 0, EXPLICIT: 1, RECEIVED: 2, RECEIVED_LOST: 3, TRANSITION: 4, SPONTANEOUS: 5 });
export const ELC_NAMES = Object.freeze(['none', 'explicit_pass', 'received_advantage', 'received_lost', 'transition', 'spontaneous']);
// Etiquetas de rol del catálogo que acreditan que el ejecutante recibe el balón antes de finalizar (rol de pool, nunca el director/portador).
export const RECEIVER_TAGS = Object.freeze(['highReceiver', 'screenerOpens']);

const cache = new WeakMap();
// Clase de una salida de una ficha. Devuelve { cls, basis } (el fundamento queda en el paquete como catálogo de elegibilidad).
export function classifyExit(play, ex) {
  if (ex.exec === 'pass') return { cls: ELC.EXPLICIT, basis: `exit.exec=pass; from=${ex.from ?? 'sin origen'}` };
  const role = play.roles?.[ex.role]; const tags = role?.tags ?? [];
  if (ex.exec === 'dribble' && role?.src === 'pool') { const hit = tags.filter((t) => RECEIVER_TAGS.includes(t)); if (hit.length) return { cls: ELC.RECEIVED, basis: `exit.exec=dribble; rol ${ex.role} de pool con etiqueta de recepción ${hit.join('+')}` }; }
  return { cls: ELC.NONE, basis: ex.exec === 'dribble' ? (role?.src === 'director' ? 'portador (director): conduce, no recibe' : `exit.exec=dribble; rol ${ex.role} sin etiqueta de recepción (${tags.join('+') || 'sin etiquetas'})`) : `exit.exec=${ex.exec}: ejecución individual sin pase` };
}
// Clase de la celda `c` de `compilePlan` (playId, role, exec). Memoizada por ficha.
export function classOfCell(T, c) {
  const play = T.plays[c.playId]; let m = cache.get(play); if (!m) { m = new Map(); cache.set(play, m); }
  const key = `${c.role}|${c.exec}|${c.zone}`; let v = m.get(key); if (v === undefined) { const ex = play.exits.find((e) => e.role === c.role && e.exec === c.exec && e.zones.includes(c.zone)); v = ex ? classifyExit(play, ex).cls : ELC.NONE; m.set(key, v); } return v;
}
// Catálogo completo de elegibilidad (una fila por salida y por contexto sin ficha) para el paquete de datos.
export function eligibilityCatalog(T) {
  const rows = [];
  for (const [id, play] of Object.entries(T.plays)) for (const ex of play.exits) { const { cls, basis } = classifyExit(play, ex); rows.push({ context: 'organized', play: id, family: play.family, role: ex.role, exec: ex.exec, zones: ex.zones.join('/'), weightShare: ex.weightShare, class: ELC_NAMES[cls], elc: cls, basis }); }
  rows.push({ context: 'transition', play: null, family: 'transition', role: null, exec: null, zones: 'rim/inside/three', weightShare: null, class: ELC_NAMES[ELC.TRANSITION], elc: ELC.TRANSITION, basis: 'derived.transition.passShare (situaciones ESP de llegada con TAR07); productor y probabilidad declarados sin cambio' });
  rows.push({ context: 'spontaneous', play: null, family: 'spontaneous', role: null, exec: null, zones: 'rim/inside/midrange/three', weightShare: null, class: ELC_NAMES[ELC.SPONTANEOUS], elc: ELC.SPONTANEOUS, basis: 'derived.spontaneous.passShare (situaciones ESP de inicio organizado con TAR07); productor y probabilidad declarados sin cambio' });
  rows.push({ context: 'putback', play: null, family: 'putback', role: null, exec: null, zones: 'rim/inside', weightShare: null, class: ELC_NAMES[ELC.NONE], elc: ELC.NONE, basis: 'continuación por rebote ofensivo: no hereda ficha, pase ni asistencia de la acción anterior' });
  return rows;
}
