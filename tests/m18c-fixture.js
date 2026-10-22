// MOTOR-18C: escenarios T18C-01…04 ejecutados contra los CONSUMIDORES REALES (postMatchLearningCard y su manejador «Aplicar a esta variante», knowledge-ui.activateCopy, núcleo de aprendizaje) sobre un DOM mínimo.
// Lo comparten la prueba (tests/motor18c.test.js, que afirma con valores esperados escritos aparte) y el generador de evidencia (scripts/m18c-evidence.js). No usa reloj ni azar: es determinista.
import { data } from './helpers.js';
import { profile18b as profile, P18B as P, uniformBlock } from './m18-helpers.js';
import { buildMatchInput } from '../src/match/index.js';
import * as Core from '../src/learning/index.js';
import { BLOCK_FIELD, DOMAINS } from '../src/knowledge/model.js';
import { installFakeDom, byId } from './fake-dom.js';

installFakeDom();
const { store } = await import('../src/lab/store.js');
const UI = await import('../src/lab/learning-ui.js');
const KUI = await import('../src/lab/knowledge-ui.js');
const M = await import('../src/lab/learning-model.js');
store.baseNew = profile; // `learnParams()` = parámetros de familiaridad del perfil efectivo (sin biblioteca de perfiles en Node)
export { store, UI, KUI, M, Core, profile, P, byId };

// Copia de aprendizaje con margen para aprender (todo a nivel 12: un nivel ya situado en 30 no demostraría que la aplicación se ejecutó).
export function makeCopy(seq) {
  const c = M.makeLearningCopy(buildMatchInput(profile, data.players, { seed: 7 }), profile, { mode: 'synthetic', instanceSeq: seq });
  for (const t of c.input.teams) for (const p of t.players) p.knowledge = uniformBlock(12, 0);
  return c;
}
export const activate = (copy) => { KUI.activateCopy(copy); return store.learn; };
// Resultado terminado mínimo con la exposición completa del encuentro (40 minutos vivos por jugador): lo que consume la tarjeta.
export function resultFor(labMatchId, copy) {
  const full = { liveTenths: 24000, positions: { PG: 24000 }, offensiveRoles: { O01: 24000 }, defensiveRoles: { D01: 24000 }, modules: { ORG02: 1 } };
  const players = Object.fromEntries(copy.input.teams.flatMap((t) => t.players.map((p) => [p.id, full])));
  return { status: 'finished', input: { teams: copy.input.teams.map((t) => ({ id: t.id })), ...(labMatchId === undefined ? {} : { labMatchId }) }, diagnostics: { familiarity: { exposure: { players } } } };
}
// Pinta la tarjeta como lo hace game.js: `paint` es el repintado que recibe el manejador.
export function view(res) { const v = { card: null, repaints: 0 }; v.paint = () => { v.repaints += 1; v.card = UI.postMatchLearningCard(res, v.paint); }; v.paint(); v.repaints = 0; return v; }
export const apply = (v) => byId(v.card, 'apply-learning'); export const msgOf = (v) => byId(v.card, 'pl-msg');
const clone = (x) => JSON.parse(JSON.stringify(x));
export const snap = (L) => JSON.stringify(L);
export const registered = (L, tid) => L.ledgers[tid].applications.map((a) => ({ id: a.id, kind: a.kind, source_id: a.source_id, status: a.status }));
const teamIds = (L) => L.copy.input.teams.map((t) => t.id);
export const fingerprints = (L) => Object.fromEntries(Object.entries(L.states).map(([t, s]) => [t, Core.teamFingerprint(s)]));
const levelsOf = (s) => Object.fromEntries(Object.entries(s.players).map(([pid, ps]) => [pid, Object.fromEntries(DOMAINS.flatMap((d) => Object.entries(ps.block[BLOCK_FIELD[d]] ?? {}).map(([id, e]) => [`${d}:${id}`, [e.level, e.peak]])))]));
// Deshacer como lo hace la sesión del laboratorio: núcleo de aprendizaje + volcado del conocimiento a la entrada de la copia.
export function undoLast(L) {
  const u = L.undo[L.undo.length - 1]; const r = Core.undoApplication(L.states[u.team], L.ledgers[u.team], u.application); if (!r.ok) return r;
  L.states[u.team] = r.state; L.ledgers[u.team] = r.ledger; M.writeStateToInput(L.copy.input, r.state); L.undo.pop(); return r;
}

export function runScenarios() {
  const identity = []; const states = {}; const errors = {}; const guard = (id, fn) => { try { fn(); } catch (e) { errors[id] = String(e?.message ?? e); } }; // un fallo de un escenario se registra y no impide ver los demás
  const rec = (o) => { identity.push(o); return o; };
  const base = (L, matchId, tid) => ({ result_copy: M.parseMatchId(matchId).copyId ?? null, active_copy: L?.copy?.id ?? null, match: matchId, team: tid, expected_source: M.parseMatchId(matchId).ok ? `${matchId}|${tid}` : null });

  // ------------------------------------------------------------------------------------------------ T18C-01 · M10/M11/M100 no bloquean M1
  guard('T18C-01', () => { for (const [i, other] of [10, 11, 100].entries()) {
    const L = activate(makeCopy(100 + i)); const id = (n) => `${L.copy.id}|M${n}`;
    const vo = view(resultFor(id(other), L.copy)); apply(vo).click(); // se aplica M<other> a los dos equipos
    for (const t of teamIds(L)) rec({ case: 'T18C-01', sub: `M${other} aplicado`, ...base(L, id(other), t), registered: registered(L, t), action: `aplicar M${other}`, accepted: true, reason: msgOf(vo)?.textContent ?? null });
    const v1 = view(resultFor(id(1), L.copy)); const before = { disabled: apply(v1).disabled === true, registered: Object.fromEntries(teamIds(L).map((t) => [t, registered(L, t)])) };
    for (const t of teamIds(L)) rec({ case: 'T18C-01', sub: `M1 con M${other} aplicado: botón`, ...base(L, id(1), t), registered: before.registered[t], action: 'consultar si M1 figura como aplicado', accepted: before.disabled === false, reason: before.disabled ? 'el botón queda deshabilitado (M1 figura como aplicado)' : 'M1 no figura como aplicado: el botón está habilitado' });
    apply(v1).click();
    for (const t of teamIds(L)) rec({ case: 'T18C-01', sub: `M1 aplicado tras M${other}`, ...base(L, id(1), t), registered: registered(L, t), action: 'aplicar M1', accepted: L.ledgers[t].applications.some((a) => a.source_id === `${id(1)}|${t}` && a.status === 'aplicada'), reason: msgOf(v1)?.textContent ?? null });
    const v1b = view(resultFor(id(1), L.copy)); const dis = apply(v1b).disabled === true; const n0 = snap(L); apply(v1b).listeners.click[0](); // aunque el botón no reciba clics, el manejador tampoco escribe de nuevo
    for (const t of teamIds(L)) rec({ case: 'T18C-01', sub: `M1 ya aplicado tras M${other}`, ...base(L, id(1), t), registered: registered(L, t), action: 'repetir M1 (botón y manejador)', accepted: false, reason: `botón ${dis ? 'deshabilitado' : 'habilitado'}; manejador: ${msgOf(view(resultFor(id(1), L.copy)))?.textContent ?? ''}`, state_unchanged: snap(L) === n0 });
    if (other === 10) { // equipo y recibo vigente: revertir la aplicación de M1 a EQ02 (la última) reabre solo EQ02
      undoLast(L); const vu = view(resultFor(id(1), L.copy)); const enabled = apply(vu).disabled !== true; apply(vu).click();
      for (const t of teamIds(L)) rec({ case: 'T18C-01', sub: 'equipo y recibo revertido', ...base(L, id(1), t), registered: registered(L, t), action: 'deshacer M1 de EQ02 y volver a aplicar', accepted: enabled, reason: msgOf(vu)?.textContent ?? null });
    }
  }});

  // ------------------------------------------------------------------------------------------------ T18C-02 · un resultado no se propone ni aplica a otra copia
  const foreign = {};
  guard('T18C-02', () => { for (const [r, a] of [[11, 12], [10, 1], [1, 10]]) {
    const cr = makeCopy(r); const ca = makeCopy(a); const res = resultFor(`${cr.id}|M1`, cr);
    const L = activate(ca); L.states.EQ01 = { ...L.states.EQ01, learningVersion: 'LEARN-MOTOR18-R1' }; // metadatos adoptables: una tarjeta propia los adoptaría; la ajena no debe tocarlos
    const before = snap(L); const v = view(res); const after = snap(L);
    const card = v.card; const text = card?.textContent ?? '';
    for (const t of teamIds(L)) rec({ case: 'T18C-02', sub: `resultado I${r} · copia activa I${a}`, ...base(L, `${cr.id}|M1`, t), registered: registered(L, t), action: 'dibujar la tarjeta', accepted: apply(v) != null, reason: text.slice(0, 160), state_unchanged: before === after, controls: { apply: apply(v) != null, see: byId(card, 'see-learning') != null, foreign_notice: byId(card, 'pl-foreign') != null } });
    foreign[`I${r}-I${a}`] = { text, applyPresent: apply(v) != null, seePresent: byId(card, 'see-learning') != null, noticePresent: byId(card, 'pl-foreign') != null, unchanged: before === after, belongs: M.matchBelongsToCopy(`${cr.id}|M1`, ca.id), copies: [cr.id, ca.id] };
  }});
  const malformed = {};
  guard('T18C-02b', () => { const L = activate(makeCopy(40)); for (const bad of ['', null, 7, 'sin-formato', `${L.copy.id}|M0`, `${L.copy.id}|M01`, `${L.copy.id}|M-1`, `${L.copy.id}|M1.5`, `${L.copy.id}|Mx`, '|M1']) {
    const before = snap(L); const v = view(resultFor(bad, L.copy)); const p = M.parseMatchId(bad); malformed[String(bad)] = { parsed: p, applyPresent: apply(v) != null, unchanged: before === snap(L), text: v.card?.textContent.slice(0, 140) ?? null };
    rec({ case: 'T18C-02', sub: `identidad no válida «${String(bad)}»`, ...base(L, String(bad), 'EQ01'), registered: registered(L, 'EQ01'), action: 'dibujar la tarjeta', accepted: apply(v) != null, reason: p.ok ? 'aceptada' : p.reason }); } });

  // ------------------------------------------------------------------------------------------------ T18C-03 · manejador obsoleto
  const stale = {};
  guard('T18C-03', () => { const A = activate(makeCopy(21)); const resA = resultFor(`${A.copy.id}|M1`, A.copy); const v = view(resA); const btn = apply(v); const snapA = snap(A); const serA = M.serializeLearning(A);
    const B = activate(makeCopy(22)); const snapB = snap(B); btn.click();
    const okA = snap(A) === snapA; const okB = snap(store.learn) === snapB && store.learn === B;
    stale.switchedToB = { activeNow: store.learn.copy.id, resultCopy: A.copy.id, retainedCopyUnchanged: okA, activeCopyUnchanged: okB, repaints: v.repaints, accepted: false };
    for (const t of teamIds(B)) rec({ case: 'T18C-03', sub: 'activar B antes de invocar el manejador de A', ...base(B, `${A.copy.id}|M1`, t), registered: registered(B, t), action: 'invocar el manejador creado para A', accepted: false, reason: 'rechazado: otra copia activa', state_unchanged: okA && okB, retained_copy_unchanged: okA, active_copy_unchanged: okB });
    store.learn = M.deserializeLearning(serA); store.learn.editUndo = []; const back = view(resA); // la copia A vuelve (restaurada): el aviso de rechazo se conserva y puede aplicarse a su propia copia
    stale.restoredA = { message: msgOf(back)?.textContent ?? null, messageClass: msgOf(back)?.className ?? null, applyEnabled: apply(back) != null && apply(back).disabled !== true, belongs: M.matchBelongsToCopy(`${A.copy.id}|M1`, store.learn.copy.id).ok };
    store.learn = null; let threw = null; try { btn.listeners.click[0](); } catch (e) { threw = String(e?.message ?? e); } stale.noActiveCopy = { rejected: threw === null && store.learn === null, threw, stateIsNull: store.learn === null };
    states.T18C_03 = { copyA_before: JSON.parse(snapA), copyA_after: JSON.parse(snap(A)), copyB_before: JSON.parse(snapB), copyB_after: JSON.parse(snap(B)), sha: { A_before: snapA.length, B_before: snapB.length } }});

  // ------------------------------------------------------------------------------------------------ T18C-04 · copia correcta: una vez, repetición rechazada, deshacer y restaurar la misma copia
  const ok4 = {};
  guard('T18C-04', () => { const L = activate(makeCopy(31)); const id = `${L.copy.id}|M1`; const res = resultFor(id, L.copy); const v = view(res);
    const beforeStates = clone(L.states); const beforeLedgers = clone(L.ledgers); const beforeSeq = { sessionSeq: L.sessionSeq, matchSeq: L.matchSeq, undo: clone(L.undo) }; const beforeFp = fingerprints(L); const beforeLevels = Object.fromEntries(teamIds(L).map((t) => [t, levelsOf(L.states[t])]));
    apply(v).click(); const afterStates = clone(L.states); const afterLedgers = clone(L.ledgers); const afterFp = fingerprints(L); const afterLevels = Object.fromEntries(teamIds(L).map((t) => [t, levelsOf(L.states[t])]));
    const changed = Object.fromEntries(teamIds(L).map((t) => [t, Object.entries(afterLevels[t]).reduce((n, [pid, e]) => n + Object.entries(e).filter(([k, lp]) => JSON.stringify(lp) !== JSON.stringify(beforeLevels[t][pid][k])).length, 0)]));
    ok4.first = { message: msgOf(v)?.textContent, changed, applied: Object.fromEntries(teamIds(L).map((t) => [t, registered(L, t)])), matchBudgetUsed: Object.fromEntries(teamIds(L).map((t) => [t, Object.fromEntries(Object.entries(L.states[t].players).map(([pid, ps]) => [pid, ps.ledger.match.used]))])), undoStack: clone(L.undo) };
    for (const t of teamIds(L)) rec({ case: 'T18C-04', sub: 'aplicación legítima única', ...base(L, id, t), registered: registered(L, t), action: 'aplicar a esta variante', accepted: L.ledgers[t].applications.filter((a) => a.status === 'aplicada').length === 1, reason: ok4.first.message, changed_entries: changed[t] });
    const nBefore = snap(L); const v2 = view(res); ok4.disabledAfter = apply(v2).disabled === true; apply(v2).listeners.click[0](); ok4.repeatMessage = msgOf(view(res))?.textContent ?? null; ok4.repeatUnchanged = snap(L) === nBefore;
    const dupCore = Core.applyProposal(L.states.EQ01, L.ledgers.EQ01, Core.proposeFromMatch(beforeStates.EQ01, Core.exposureFromResult(res, { source_id: id }).exposure, P, { source_id: `${id}|EQ01` }), P); ok4.coreRejectsDuplicate = { ok: dupCore.ok, reason: dupCore.reason ?? null };
    for (const t of teamIds(L)) rec({ case: 'T18C-04', sub: 'repetición rechazada', ...base(L, id, t), registered: registered(L, t), action: 'repetir la aplicación (botón y manejador; núcleo)', accepted: false, reason: `botón deshabilitado=${ok4.disabledAfter}; manejador: ${ok4.repeatMessage}; núcleo: ${ok4.coreRejectsDuplicate.reason}`, state_unchanged: ok4.repeatUnchanged });
    // restaurar la misma copia (serializar y recuperar): la identidad persiste y la aplicación sigue reconocida
    const restored = M.deserializeLearning(M.serializeLearning(L)); restored.editUndo = []; store.learn = restored; const vr = view(res);
    ok4.restored = { copyId: restored.copy.id, belongs: M.matchBelongsToCopy(id, restored.copy.id).ok, applyDisabled: apply(vr).disabled === true, registered: Object.fromEntries(teamIds(restored).map((t) => [t, registered(restored, t)])) };
    for (const t of teamIds(L)) rec({ case: 'T18C-04', sub: 'restaurar la misma copia', ...base(restored, id, t), registered: registered(restored, t), action: 'serializar/restaurar y volver a consultar', accepted: ok4.restored.belongs && ok4.restored.applyDisabled, reason: 'pertenece a la copia restaurada y la aplicación vigente sigue reconocida' });
    // deshacer en orden inverso y verificar la restauración exacta
    const u1 = undoLast(restored); const u2 = undoLast(restored); const undoneFp = fingerprints(restored);
    ok4.undo = { ok: u1.ok && u2.ok, fingerprintsRestored: JSON.stringify(undoneFp) === JSON.stringify(beforeFp), statuses: Object.fromEntries(teamIds(restored).map((t) => [t, registered(restored, t)])) };
    for (const t of teamIds(L)) rec({ case: 'T18C-04', sub: 'deshacer', ...base(restored, id, t), registered: registered(restored, t), action: 'deshacer (orden inverso)', accepted: ok4.undo.ok && ok4.undo.fingerprintsRestored, reason: 'estado, presupuestos y reloj restaurados; las aplicaciones quedan como revertidas con su rastro' });
    const vu = view(res); ok4.reapplyEnabled = apply(vu).disabled !== true; apply(vu).click(); ok4.reapply = Object.fromEntries(teamIds(restored).map((t) => [t, registered(restored, t)]));
    states.T18C_04 = { before: { learning: beforeStates, registry: beforeLedgers, sequences: beforeSeq, fingerprints: beforeFp }, after_apply: { learning: afterStates, registry: afterLedgers, sequences: { sessionSeq: restored.sessionSeq, matchSeq: restored.matchSeq, undo: ok4.first.undoStack }, fingerprints: afterFp }, after_undo: { fingerprints: undoneFp, registry: clone(restored.ledgers).EQ01 ? Object.fromEntries(teamIds(restored).map((t) => [t, registered(restored, t)])) : null } }});
  return { identity, states, foreign, malformed, stale, ok4, errors };
}
