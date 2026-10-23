// Guardado y continuación reales de un encuentro SIM (`beM-sim-snapshot/1`, §8.1). Conserva entrada/perfil/tablas congelados, azar completo y su ordinal, tiempo generado y publicado, sufijo privado,
// contadores, participantes, estados, planes y órdenes, registros de comandos y contexto, y los hechos/tramos ya generados. Restaurar NO vuelve a sortear nada: la continuación es idéntica a no haber parado.
// Un guardado alterado, incompleto o de una versión incompatible se rechaza con causa, sin tocar el archivo ni la sesión activa. SHA-256 detecta alteraciones accidentales o editadas a mano.
import { SimMatch } from './engine.js';
import './materialize.js';
import { contextToJSON, contextFromJSON } from './context.js';
import { sha256Hex, canonical } from './fp.js';
import { SIM_SNAPSHOT_SCHEMA, SIM_MODEL, SIM_VERSION, SIM_RESULT_SCHEMA, SIM_SNAPSHOT_COMPAT } from './version.js';

const deep = (x) => JSON.parse(JSON.stringify(x));
const PLAYER_STATE = ['energy', 'form', 'available', 'fouls', 'out', 'onCourt', 'slot', 'courtSince', 'benchSince', 'minutes', 'sev', 'lastMoment'];

// Entrada original reconstruida desde la vista normalizada (que nunca se muta): es la misma entrada que se pasó al crear el encuentro.
const inputOfNorm = (norm) => ({ schema: norm.schema, seed: norm.seed, importance: norm.importance, orders: deep(norm.orders), teams: norm.teams.map((t) => ({ id: t.id, name: t.name, plan: deep(t.plan), players: deep(t.players), source: { teamId: t.sourceTeam } })) });

// C03-02: el guardado es un INSTANTE independiente: el estado mutable (hechos, tramos, registros, planes, jugadores) se copia por valor; solo el contexto incorporado (perfil y tablas, inmutables y compartidos
// por identidad de huella) se referencia. La suma de comprobación se calcula sobre la representación que realmente se guarda.
export function snapshotSim(m, { embedContext = true, label = null } = {}) {
  const raw = {
    schema: SIM_SNAPSHOT_SCHEMA, model: SIM_MODEL, simVersion: SIM_VERSION, resultSchema: SIM_RESULT_SCHEMA, label,
    meta: { matchId: m.opts.matchId ?? null, attemptId: m.opts.attemptId ?? null },
    input: inputOfNorm(m.norm), rootInputFingerprint: m.norm.fingerprint,
    context: { profileFingerprint: m.ctx.sp.fingerprint, tablesFingerprint: m.ctx.T.fingerprint, profileId: m.ctx.sp.id, ...(embedContext ? { embedded: contextToJSON(m.ctx) } : { embedded: null }) },
    state: {
      rng: { s: Array.from(m.rng.s), draws: m.rng.draws },
      gt: m.gt, period: m.period, periodStart: m.periodStart, periodLen: m.periodLen, status: m.status, error: m.error, published: m.published, score: m.score.slice(), periodScore: deep(m.periodScore), teamFouls: deep(m.teamFouls),
      controlTeam: m.controlTeam, seq: m.seq, finSeq: m.finSeq, pendingFrac: m.pendingFrac,
      coach: deep(m.coach), orders: deep(m.orders), appliedOrders: deep(m.appliedOrders), orderLog: deep(m.orderLog), commandLog: deep(m.commandLog), contextLog: deep(m.contextLog),
      events: m.events, segments: m.segments,
      teams: m.teams.map((t) => ({ plan: deep(Object.fromEntries(Object.entries(t.plan).filter(([k]) => k !== '_c'))), tLast: t.tLast, players: t.players.map((p) => ({ id: p.id, ...Object.fromEntries(PLAYER_STATE.map((k) => [k, p[k]])), M: { ...p.M }, slotMin: { ...p.slotMin }, roleMin: { ...p.roleMin } })) })),
    },
  };
  const embedded = raw.context.embedded; raw.context.embedded = null; const payload = deep(raw); payload.context.embedded = embedded;
  const body = canonical(payload);
  return { ...payload, integrity: { algorithm: 'sha256', digest: sha256Hex(body), bytes: body.length } };
}

// Valida un guardado SIN modificarlo ni restaurar nada: devuelve la lista de causas (vacía si es utilizable).
export function validateSimSnapshot(snap) {
  const errs = []; const add = (path, message) => errs.push({ path, message });
  if (!snap || typeof snap !== 'object') { add('snapshot', 'guardado ausente o no es un objeto'); return errs; }
  if (!SIM_SNAPSHOT_COMPAT.schemas.includes(snap.schema)) { add('schema', `versión incompatible (${snap.schema}); este motor lee ${SIM_SNAPSHOT_SCHEMA}`); return errs; }
  if (snap.model !== SIM_MODEL) add('model', `el guardado es de otro modelo (${snap.model})`);
  for (const k of ['input', 'context', 'state', 'integrity', 'rootInputFingerprint']) if (snap[k] == null) add(k, 'sección ausente: guardado incompleto');
  if (errs.length) return errs;
  for (const k of ['rng', 'events', 'segments', 'teams', 'orders', 'score', 'periodScore', 'teamFouls']) if (snap.state[k] == null) add(`state.${k}`, 'dato de estado ausente: guardado incompleto');
  if (errs.length) return errs;
  // compatibilidad semántica (C03-03), distinta de la integridad: un archivo coherente de una revisión o formato desconocido no se continúa
  if (!SIM_SNAPSHOT_COMPAT.simVersions.includes(snap.simVersion)) add('simVersion', `revisión SIM incompatible (${snap.simVersion ?? 'ausente'}); este lector continúa ${SIM_SNAPSHOT_COMPAT.simVersions.join(', ')}`);
  if (!SIM_SNAPSHOT_COMPAT.resultSchemas.includes(snap.resultSchema)) add('resultSchema', `formato de resultado incompatible (${snap.resultSchema ?? 'ausente'}); este lector continúa ${SIM_SNAPSHOT_COMPAT.resultSchemas.join(', ')}`);
  const { integrity, ...rest } = snap; const body = canonical(rest);
  if (integrity.algorithm !== 'sha256' || sha256Hex(body) !== integrity.digest || body.length !== integrity.bytes) add('integrity', 'el contenido no coincide con su suma de comprobación: el guardado está alterado o dañado');
  return errs;
}

// Restaura un encuentro. `ctx`: contexto SIM (si se omite, se usa el incorporado). Comprueba que el perfil y las tablas efectivos son los congelados en el guardado.
export function restoreSim(snap, ctx = null, opts = {}) {
  const errs = validateSimSnapshot(snap); if (errs.length) { const e = new Error(`guardado SIM rechazado: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
  const c = ctx ?? (snap.context.embedded ? contextFromJSON(snap.context.embedded) : null);
  if (!c) { const e = new Error('guardado SIM sin contexto incorporado: se necesita el contexto del que procede'); e.validation = [{ path: 'context', message: 'contexto ausente' }]; throw e; }
  if (c.sp.fingerprint !== snap.context.profileFingerprint || c.T.fingerprint !== snap.context.tablesFingerprint) { const e = new Error('guardado SIM rechazado: el perfil o las tablas efectivos no son los del guardado'); e.validation = [{ path: 'context', message: `perfil ${c.sp.fingerprint}/${snap.context.profileFingerprint}, tablas ${c.T.fingerprint}/${snap.context.tablesFingerprint}` }]; throw e; }
  const m = new SimMatch(deep(snap.input), c, { ...(snap.meta ?? {}), ...opts });
  if (m.norm.fingerprint !== snap.rootInputFingerprint) { const e = new Error('guardado SIM rechazado: la entrada raíz no reproduce su huella'); e.validation = [{ path: 'input', message: 'huella de entrada distinta' }]; throw e; }
  const st = deep(snap.state);
  m.rng.s = st.rng.s; m.rng.draws = st.rng.draws;
  Object.assign(m, { gt: st.gt, period: st.period, periodStart: st.periodStart, periodLen: st.periodLen, status: st.status, error: st.error, published: st.published, score: st.score, periodScore: st.periodScore, teamFouls: st.teamFouls, controlTeam: st.controlTeam, seq: st.seq, finSeq: st.finSeq, pendingFrac: st.pendingFrac, orders: st.orders, coach: st.coach, appliedOrders: st.appliedOrders, orderLog: st.orderLog, commandLog: st.commandLog, contextLog: st.contextLog, events: st.events, segments: st.segments });
  st.teams.forEach((ts, ti) => { const t = m.teams[ti]; t.plan = ts.plan; t.tLast = ts.tLast; m.sides[ti].plan = t.plan; ts.players.forEach((ps) => { const p = t.byId[ps.id]; for (const k of PLAYER_STATE) p[k] = ps[k]; p.M = ps.M; p.slotMin = ps.slotMin; p.roleMin = ps.roleMin; }); });
  m._lineupSnapshot();
  return m;
}
