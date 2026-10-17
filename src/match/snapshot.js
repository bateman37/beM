// Guardado y continuación de un encuentro (MOTOR-14 §10). Isomorfo (navegador y Node): sin node:*, sin DOM, sin reloj de pared.
//
// Qué es: la captura del ESTADO DEPORTIVO VIVO del núcleo en una frontera estable (entre dos pasos; `step()` es atómico), más lo necesario para no depender de lo que esté activo después:
// la entrada efectiva y el perfil congelados, la posición exacta del generador (estado, contador y sorteos ya hechos pero aún no asociados a un hecho) y las filas de perfil ya consultadas.
// Continuar = construir un núcleo con ESA entrada y ESE perfil y sobrescribir el estado vivo; no se re-simula ningún prefijo y no se sortea nada para guardar o para cargar.
//
// Qué NO es: ni re-ejecución con entradas y semilla (eso es `replay`), ni lectura de un histórico (eso es un `export`). El estado vivo es un grafo de datos planos (objetos, matrices, Set); se serializa
// con un códec propio que conserva referencias compartidas y ciclos (una misma ficha referenciada desde dos sitios sigue siendo una). Funciones, DOM y Proxies del perfil no se guardan.
import { MatchCore } from './core.js';
import { ENGINE_VERSION } from './data.js';

export const SNAPSHOT_SCHEMA = 'beM-match-snapshot/1';
export const SNAPSHOT_CODEC = 'graph-json/1';

// Campos que NO son estado vivo: configuración congelada (se reconstruye de la entrada y el perfil), seguimiento de filas (se restaura aparte) y generador (se guarda su posición exacta).
const DERIVED = new Set(['opts', 'profileData', 'tracker', 'profile', 'cfg', 'input', 'rng', 'pl']);

// ------------------------------------------------------------------------------------------------ códec de grafo (JSON válido, determinista, con aliasing)
// Cada objeto/matriz/Set/Map recibe un índice la primera vez que se encuentra (recorrido en anchura, orden de claves estable); las referencias se escriben como {"$":índice}.
export function graphEncode(root) {
  const nodes = []; const ids = new Map(); const queue = [];
  const ref = (x) => {
    if (x === undefined) return { $u: 1 };
    if (x === null || typeof x === 'string' || typeof x === 'boolean') return x;
    if (typeof x === 'number') return Number.isFinite(x) ? (Object.is(x, -0) ? { $n: '-0' } : x) : { $n: String(x) };
    if (typeof x === 'function' || typeof x === 'symbol' || typeof x === 'bigint') throw new Error(`guardado: el estado contiene un valor no serializable (${typeof x})`);
    let i = ids.get(x);
    if (i === undefined) { i = nodes.length; ids.set(x, i); nodes.push(null); queue.push([i, x]); }
    return { $: i };
  };
  const top = ref(root);
  for (let qi = 0; qi < queue.length; qi++) {
    const [i, x] = queue[qi];
    if (Array.isArray(x)) { const a = new Array(x.length); for (let k = 0; k < x.length; k++) a[k] = ref(x[k]); nodes[i] = ['a', a]; }
    else if (x instanceof Set) nodes[i] = ['s', [...x].map(ref)];
    else if (x instanceof Map) nodes[i] = ['m', [...x].map(([k, v]) => [ref(k), ref(v)])];
    else { const o = {}; for (const k of Object.keys(x)) o[k] = ref(x[k]); nodes[i] = ['o', o]; }
  }
  return { codec: SNAPSHOT_CODEC, root: top, nodes };
}

export function graphDecode(g) {
  if (!g || g.codec !== SNAPSHOT_CODEC || !Array.isArray(g.nodes)) throw new Error('guardado: códec del estado no reconocido');
  const made = g.nodes.map((n) => { if (!Array.isArray(n)) throw new Error('guardado: nodo de estado incompleto'); return n[0] === 'a' ? new Array(n[1].length) : n[0] === 's' ? new Set() : n[0] === 'm' ? new Map() : {}; });
  const val = (r) => {
    if (r === null || typeof r !== 'object') return r;
    if ('$' in r) { if (!(r.$ in made)) throw new Error('guardado: referencia rota en el estado'); return made[r.$]; }
    if ('$u' in r) return undefined;
    if ('$n' in r) return r.$n === '-0' ? -0 : Number(r.$n);
    throw new Error('guardado: valor de estado no reconocido');
  };
  g.nodes.forEach((n, i) => {
    const [t, body] = n; const o = made[i];
    if (t === 'a') for (let k = 0; k < body.length; k++) o[k] = val(body[k]);
    else if (t === 's') for (const x of body) o.add(val(x));
    else if (t === 'm') for (const [k, v] of body) o.set(val(k), val(v));
    else for (const k of Object.keys(body)) o[k] = val(body[k]);
  });
  return val(g.root);
}

// Copia profunda a datos planos que conserva referencias compartidas y ciclos. Atraviesa los Proxies del seguimiento de filas del perfil (el diagnóstico `calc` puede referirlos) y los materializa.
export function plainClone(v, seen = new WeakMap()) {
  if (v === null || typeof v !== 'object') { if (typeof v === 'function') throw new Error('guardado: el estado contiene una función'); return v; }
  if (seen.has(v)) return seen.get(v);
  if (Array.isArray(v)) { const a = []; seen.set(v, a); for (let i = 0; i < v.length; i++) a[i] = plainClone(v[i], seen); return a; }
  if (v instanceof Set) { const s = new Set(); seen.set(v, s); for (const x of v) s.add(plainClone(x, seen)); return s; }
  if (v instanceof Map) { const mp = new Map(); seen.set(v, mp); for (const [k, x] of v) mp.set(plainClone(k, seen), plainClone(x, seen)); return mp; }
  const o = {}; seen.set(v, o);
  for (const k of Object.keys(v)) o[k] = plainClone(v[k], seen);
  return o;
}

export function liveStateOf(m) {
  const live = {};
  for (const k of Object.keys(m)) if (!DERIVED.has(k)) live[k] = m[k];
  return live;
}

// Suma de verificación rápida e isomorfa (FNV-1a de 32 bits en dos pasadas con semillas distintas) sobre un texto: detecta truncados y alteraciones accidentales.
// La integridad criptográfica (SHA-256 del archivo) la añade el almacén de servidor al escribir; no se simula aquí.
export function checksum(text) {
  let a = 0x811c9dc5; let b = 0x9747b28c;
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); a = Math.imul(a ^ c, 0x01000193) >>> 0; b = Math.imul(b ^ (c + i), 0x85ebca6b) >>> 0; }
  return `${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`;
}

const TERMINAL_ORDER = new Set(['aplicada', 'rechazada', 'cancelada', 'caducada', 'sustituida', 'consumida', 'finalizada']);

// ------------------------------------------------------------------------------------------------ capturar
// Frontera estable: el núcleo solo se guarda entre pasos. Una llamada reentrante (dentro de una operación) se rechaza, no se espera ni se fuerza.
export function snapshotMatch(m, { label = null, savedAt = null, lab = null } = {}) {
  if (m.inStep) throw new Error('guardado: el encuentro está dentro de una operación; solo se guarda en una frontera estable');
  if (m.status === 'error') throw new Error('guardado: un encuentro en error no se guarda como continuable');
  // La lectura de los Proxies del perfil que referencia el diagnóstico `calc` no debe anotarse como consulta del encuentro que sigue vivo (guardar no cambia nada).
  const plain = m.tracker ? m.tracker.quiet(() => plainClone(liveStateOf(m))) : plainClone(liveStateOf(m));
  const state = JSON.stringify(graphEncode(plain));
  const rng = { state: m.rng.state(), count: m.rng.count, pending: m.rng.pending(), initialSeed: m.rng.initialSeed };
  const trk = m.tracker ? m.tracker.state() : null;
  const pending = m.orders.filter((o) => !TERMINAL_ORDER.has(o.state));
  const eventsChecksum = checksum(JSON.stringify(m.events.map((e) => [e.id, e.seq, e.type, e.score, e.draws?.length ?? 0])));
  const prefixLast = m.events.length ? m.events[m.events.length - 1].id : null;
  return {
    schema: SNAPSHOT_SCHEMA, codec: SNAPSHOT_CODEC,
    label, savedAt, lab,
    identity: {
      engineVersion: ENGINE_VERSION, rulesProfile: m.profileData.rules?.profile ?? null, contentProfile: m.profileData.id, effectiveProfileId: m.profileData.effectiveId ?? m.profileData.id,
      extensions: m.profileData.extensions ?? [], profileRef: m.opts.profileRef ?? null, seed: m.input.seed, teams: m.teams.map((t) => ({ id: t.id, name: t.name })),
    },
    position: {
      status: m.status, period: m.period, clockTenths: m.clock, shotClockTenths: m.shotClock, score: [...m.score], stepSeq: m.stepSeq, eventCount: m.events.length, lastEvent: prefixLast, possSeq: m.possSeq,
      rngDraws: m.rng.count, periodBreak: m.periodBreak ?? null,
      pendingOrders: pending.map((o) => ({ id: o.id, team: o.team, type: o.type, state: o.state })), pendingWindows: m.pendingWindows?.length ?? 0, pendingFoul: !!m.pendingFoul,
      openPossession: !!(m.poss && !m.poss.done), openThrowInChain: (m.throwChains ?? []).some((c) => c.status === 'abierta'),
    },
    options: { detail: m.opts.detail, check: !!m.opts.check, track: m.opts.track !== false, direction: m.opts.direction ?? null },
    input: m.input, profile: m.profileData,
    rng, tracker: trk,
    state,
    integrity: { stateChecksum: checksum(state), eventsChecksum, stateChars: state.length },
  };
}

// ------------------------------------------------------------------------------------------------ validar sin tocar nada
// Devuelve { ok, problems[] } con el motivo de cada rechazo. Un guardado incompatible NO se «actualiza» a otro motor para conseguir que cargue.
export function validateSnapshot(snap, { engineVersion = ENGINE_VERSION } = {}) {
  const problems = [];
  const bad = (code, message) => problems.push({ code, message });
  if (!snap || typeof snap !== 'object') { bad('formato', 'el archivo no es un guardado'); return { ok: false, problems }; }
  if (snap.schema !== SNAPSHOT_SCHEMA) bad('esquema', `esquema ${snap.schema ?? 'ausente'}: este motor solo continúa ${SNAPSHOT_SCHEMA}`);
  if (snap.codec !== SNAPSHOT_CODEC) bad('codec', `códec ${snap.codec ?? 'ausente'} no reconocido`);
  for (const k of ['identity', 'position', 'options', 'input', 'profile', 'rng', 'state', 'integrity']) if (snap[k] === undefined || snap[k] === null) bad('incompleto', `falta ${k}`);
  if (problems.length) return { ok: false, problems };
  if (snap.identity.engineVersion !== engineVersion) bad('motor', `guardado con el motor ${snap.identity.engineVersion}; el motor actual es ${engineVersion}. No se reinterpreta con otras reglas: reejecute desde el inicio o use el motor original`);
  if (typeof snap.state !== 'string' || checksum(snap.state) !== snap.integrity.stateChecksum) bad('integridad', 'la suma de verificación del estado no coincide (archivo alterado o truncado)');
  if (snap.state.length !== snap.integrity.stateChars) bad('integridad', 'el tamaño del estado no coincide (archivo truncado)');
  if (snap.position.status === 'finished') bad('terminado', 'el encuentro ya terminó: no hay nada que continuar');
  if (snap.rng.count !== snap.position.rngDraws) bad('azar', 'el contador del generador no coincide con la posición guardada');
  return { ok: problems.length === 0, problems };
}

// ------------------------------------------------------------------------------------------------ restaurar
// Construye un núcleo con LA ENTRADA Y EL PERFIL CONGELADOS DEL GUARDADO (no con los activos) y sobrescribe su estado vivo. Lanza con el motivo si no es válido.
export function restoreMatch(snap, { engineVersion = ENGINE_VERSION, direction = undefined } = {}) {
  const v = validateSnapshot(snap, { engineVersion });
  if (!v.ok) { const e = new Error(`guardado no válido: ${v.problems.map((p) => p.message).join('; ')}`); e.problems = v.problems; throw e; }
  const live = graphDecode(JSON.parse(snap.state));
  if (checksum(JSON.stringify(live.events.map((e) => [e.id, e.seq, e.type, e.score, e.draws?.length ?? 0]))) !== snap.integrity.eventsChecksum) throw new Error('guardado no válido: el prefijo de hechos no coincide con su huella');
  const opts = { detail: snap.options.detail, check: snap.options.check, track: snap.options.track, profileRef: snap.identity.profileRef, ...(direction !== undefined ? { direction } : (snap.options.direction ? { direction: snap.options.direction } : {})) };
  const m = new MatchCore(snap.input, snap.profile, opts);
  for (const [k, val] of Object.entries(live)) m[k] = val;
  m.rng.restore({ state: snap.rng.state, count: snap.rng.count, pending: snap.rng.pending });
  if (m.tracker && snap.tracker) m.tracker.restore(snap.tracker);
  return m;
}
