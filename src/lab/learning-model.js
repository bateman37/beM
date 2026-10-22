// Lógica PURA del laboratorio de conocimiento (MOTOR-18 §10.2, §11): copias de aprendizaje, ediciones de conocimiento con deshacer exacto, resúmenes de quinteto y serialización de la copia.
// Sin DOM ni almacenamiento: la interfaz (knowledge-ui.js, learning-ui.js) solo pinta y persiste. No toca fichas de referencia: trabaja SIEMPRE sobre una copia identificada de la entrada.
import { INPUT_SCHEMA, deepCopy } from '../match/data.js';
import { syntheticHistory, allMastered, categoryOf, levelOf, normalizeLevel, idsOf, BLOCK_FIELD, isLegacyNeutral, knowledgeKeys, keyOf, parseKey } from '../knowledge/model.js';
import { createTeamState, teamFingerprint, createLedger, sourceIdOf } from '../learning/index.js';

export const LEARNING_STORE_SCHEMA = 'beM-lab-learning/1';
// MOTOR-18B (R03): identidades persistidas. Administración de laboratorio: no consumen azar deportivo ni cambian trayectorias.
export const NEUTRAL_NOTE = 'sin historial de aprendizaje; compatibilidad neutra';
export const IDLE_TEXT = 'Laboratorio de conocimiento: no adelanta diez años la edad del jugador ni simula fatiga, lesiones o una temporada al pulsar «3650 días». El reloj real del manager se conectará después.';

// Los bloques solo existen en el perfil que incluye la familiaridad (activo o, si no, la base de MOTOR-18).
export const paramsOf = (...profiles) => profiles.map((p) => p?.familiarity).find(Boolean) ?? null;

const playFamilyMap = (profile) => Object.fromEntries(Object.entries(profile.repertoire?.plays ?? {}).map(([id, s]) => [id, s.family]));

// Copia de aprendizaje: «synthetic» (fábrica de historia sintética §10.2) o «mastered» (todo a 30: copia de laboratorio, no historia observada). Devuelve la entrada nueva, la lista de diferencias y los recibos por jugador.
export function makeLearningCopy(input, profile, { mode = 'synthetic', day = 0, id = null, instanceSeq = null } = {}) {
  const P = paramsOf(profile); if (!P) throw new Error('el perfil no incluye la familiaridad táctica de MOTOR-18');
  const out = deepCopy(input); out.schema = INPUT_SCHEMA; const changes = []; const receipts = {}; const fam = playFamilyMap(profile); const L = P.learning.traits;
  for (const t of out.teams) {
    for (const p of t.players) {
      if (mode === 'mastered') { p.knowledge = allMastered(P, day); receipts[p.id] = { mode: 'todo dominado (copia de laboratorio explícita)' }; }
      else { const r = syntheticHistory(p, t.plan, P, day, fam); p.knowledge = r.block; receipts[p.id] = r.receipt; }
      p.development = { ...(p.development ?? {}), tacticalLearning: L.tacticalLearningSeed };
      changes.push({ jugador: p.id, campo: 'conocimiento (62 niveles)', antes: 'sin bloque (compatibilidad neutra)', despues: mode === 'mastered' ? 'explicit · todos a 30' : 'explicit · historia sintética SEM18' });
      changes.push({ jugador: p.id, campo: 'Polivalencia · aprendizaje táctico', antes: '—', despues: L.tacticalLearningSeed });
    }
    t.coachLearning = { teaching: L.teachingSeed, tacticalMastery: Object.fromEntries(idsOf('tactic', P).map((m) => [m, L.coachMasterySeed])) };
    changes.push({ equipo: t.id, campo: 'enseñanza del entrenador (teaching)', antes: '—', despues: L.teachingSeed });
    changes.push({ equipo: t.id, campo: 'competencia táctica del entrenador (por módulo)', antes: '—', despues: L.coachMasterySeed });
  }
  const copyId = id ?? `LEARN18-${mode === 'mastered' ? 'M' : 'S'}-${(out.teams.map((t) => t.id).join('-'))}-d${day}${instanceSeq != null ? `-I${instanceSeq}` : ''}`;
  return { id: copyId, instanceSeq, mode, day, input: out, changes, receipts, paramsVersion: P.version };
}

// Estados de aprendizaje por instancia de equipo (el libro de aplicaciones vive aparte).
export function teamStatesOf(input, params, day) {
  const states = {}; const errors = [];
  for (const t of input.teams) {
    const players = Object.fromEntries(t.players.map((p) => [p.id, { block: p.knowledge ?? { version: params.knowledgeVersion, mode: 'legacy-neutral' }, tacticalLearning: p.development?.tacticalLearning ?? params.learning.traits.tacticalLearningSeed }]));
    const r = createTeamState({ instanceId: t.id, players, coach: t.coachLearning, day: typeof day === 'object' ? day[t.id] : day }, params);
    if (r.ok) states[t.id] = r.state; else errors.push(...r.errors.map((e) => ({ team: t.id, ...e })));
  }
  return { states, errors };
}
// Vuelca el conocimiento de un estado de equipo en la entrada de la copia (solo bloques de conocimiento; capacidades y planes no se tocan).
export function writeStateToInput(input, state) {
  const t = input.teams.find((x) => x.id === state.instanceId); if (!t) return;
  for (const p of t.players) { const ps = state.players[p.id]; if (ps && !isLegacyNeutral(ps.block)) p.knowledge = deepCopy(ps.block); }
}

// ---------------------------------------------------------------- edición de conocimiento (individual y masiva) con deshacer exacto
// keys: [{ domain, id }]. mode 'level' = solo el nivel (peak = max(peak, nivel): nunca peak < nivel); 'synthetic' = historia sintética coherente (nivel = peak, última práctica = día evaluado).
export function planKnowledgeEdit(input, params, playerIds, keys, { delta = null, set = null, mode = 'level' } = {}) {
  const [lo, hi] = [params.range.min, params.range.max]; const ch = []; const byId = Object.fromEntries(input.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  for (const pid of playerIds) { const p = byId[pid]; if (!p || isLegacyNeutral(p.knowledge)) continue;
    for (const k of keys) { const e = p.knowledge[BLOCK_FIELD[k.domain]]?.[k.id]; if (!e) continue;
      const target = Math.min(hi, Math.max(lo, set != null ? set : e.level + (delta ?? 0)));
      const after = mode === 'synthetic' ? { level: target, peak: target, lastPracticeDay: p.knowledge.asOfDay } : { level: target, peak: Math.max(e.peak, target), lastPracticeDay: e.lastPracticeDay };
      ch.push({ player: pid, key: keyOf(k.domain, k.id), domain: k.domain, id: k.id, before: { ...e }, after, mode, changed: after.level !== e.level || after.peak !== e.peak || after.lastPracticeDay !== e.lastPracticeDay, atLimit: delta > 0 && e.level >= hi }); } }
  return ch;
}
export function applyKnowledgeEdit(input, changes, label = '') {
  const byId = Object.fromEntries(input.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  for (const c of changes) Object.assign(byId[c.player].knowledge[BLOCK_FIELD[c.domain]][c.id], c.after);
  return { label, changes: changes.map((c) => ({ player: c.player, domain: c.domain, id: c.id, before: c.before })) };
}
export function undoKnowledgeEdit(input, rec) {
  const byId = Object.fromEntries(input.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  for (const c of rec.changes) Object.assign(byId[c.player].knowledge[BLOCK_FIELD[c.domain]][c.id], c.before);
  return rec.changes.length;
}

// ---------------------------------------------------------------- resúmenes de quinteto (Preparación y partido): solo lectura
// Módulos «elegidos» por el plan de un equipo: disposición, organización defensiva, cobertura y las familias del libro. Los IDs salen del plan, no se inventan.
export function chosenModules(team, profile) {
  const plan = team.plan; const rep = profile.repertoire; const fams = [...new Set((plan.playbook ?? []).map((b) => rep.plays[b.playId]?.family).filter(Boolean))];
  return [{ id: plan.disposition, label: `Disposición ${plan.disposition}` }, { id: plan.defense, label: `Organización ${plan.defense}` }, { id: plan.coverage, label: `Cobertura ${plan.coverage}` }, ...fams.map((f) => ({ id: `FAM:${f}`, label: `Familia ${f}` }))];
}
export function quintetSummary(team, params, profile) {
  const starters = Object.entries(team.plan.starters); const byId = Object.fromEntries(team.players.map((p) => [p.id, p])); const mods = chosenModules(team, profile);
  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const rows = starters.map(([slot, pid]) => { const p = byId[pid]; const k = p.knowledge; const lv = (d, id) => levelOf(k, d, id);
    return { slot, pid, neutral: isLegacyNeutral(k), position: lv('position', slot), offensiveRole: lv('offensiveRole', p.offensiveRole?.code), defensiveRole: lv('defensiveRole', p.defensiveRole?.code), modules: Object.fromEntries(mods.map((m) => [m.id, lv('tactic', m.id)])) }; });
  const explicit = rows.filter((r) => !r.neutral);
  const modSummary = mods.map((m) => { const xs = explicit.map((r) => r.modules[m.id]).filter((v) => v != null); const v = mean(xs); return { ...m, mean: v, category: v == null ? null : categoryOf(v, params).label, n: xs.length }; });
  const lowest = explicit.map((r) => { const vals = [r.position, r.offensiveRole, r.defensiveRole, ...Object.values(r.modules)].filter((v) => v != null); return { pid: r.pid, slot: r.slot, mean: mean(vals), min: Math.min(...vals) }; }).sort((a, b) => a.mean - b.mean).slice(0, 3);
  return { rows, modules: modSummary, lowest, neutralPlayers: rows.length - explicit.length, norm: (K) => normalizeLevel(K, params) };
}

// ---------------------------------------------------------------- persistencia (registro de aplicaciones fuera del núcleo deportivo)
export function serializeLearning(L) { return JSON.stringify({ schema: LEARNING_STORE_SCHEMA, copy: L.copy, day: L.day, states: L.states, ledgers: L.ledgers, undo: L.undo ?? [], sessionSeq: L.sessionSeq ?? nextSessionSeq(L), matchSeq: L.matchSeq ?? 0 }); }
export function deserializeLearning(text) {
  const o = JSON.parse(text); if (o?.schema !== LEARNING_STORE_SCHEMA) throw new Error(`esquema ${o?.schema ?? 'ausente'} no reconocido`);
  const L = { copy: o.copy, day: o.day, states: o.states, ledgers: o.ledgers ?? {}, undo: o.undo ?? [], matchSeq: o.matchSeq ?? 0 };
  L.sessionSeq = Math.max(o.sessionSeq ?? 1, nextSessionSeq({ ...L, sessionSeq: 1 })); // una copia anterior sin contador deriva el siguiente número libre de sus recibos
  return L;
}
// Secuencia de sesión por copia de aprendizaje: el siguiente número libre sale del contador persistido y de TODOS los recibos de sesión (aplicados y revertidos). Nunca reutiliza un número ya emitido.
const SESSION_TAIL = /\|S(\d+)$/;
export function nextSessionSeq(L) {
  let max = Math.max(0, (L.sessionSeq ?? 1) - 1);
  for (const led of Object.values(L.ledgers ?? {})) for (const a of led.applications ?? []) { const m = SESSION_TAIL.exec(a.source_id ?? ''); if (m) max = Math.max(max, Number(m[1])); }
  for (const u of L.undo ?? []) { const m = SESSION_TAIL.exec(u.source_id ?? ''); if (m) max = Math.max(max, Number(m[1])); }
  return max + 1;
}
export const sessionSourceId = (copyId, teamId, seq) => `lab|${copyId}|${teamId}|S${seq}`;
// Identidad estable de un encuentro de la copia: se asigna al prepararlo y viaja en la entrada congelada (guardar, continuar, reabrir y exportar la conservan).
export function nextMatchId(L) { L.matchSeq = (L.matchSeq ?? 0) + 1; return `${L.copy.id}|M${L.matchSeq}`; }

// MOTOR-18C (C18-02): lectura y validación mínima de la identidad emitida por `nextMatchId`: `<identidad completa de la copia>|M<n>`, con n entero positivo sin ceros a la izquierda.
const MATCH_TAIL = /^(.+)\|M([1-9]\d*)$/;
export function parseMatchId(id) {
  if (id == null || id === '') return { ok: false, reason: 'el resultado no trae identidad de encuentro de la copia de aprendizaje' };
  const m = typeof id === 'string' ? MATCH_TAIL.exec(id) : null; const seq = m ? Number(m[2]) : NaN;
  if (!m || !Number.isSafeInteger(seq)) return { ok: false, reason: `la identidad de encuentro «${String(id).slice(0, 80)}» no tiene el formato <copia>|M<n>` };
  return { ok: true, matchId: id, copyId: m[1], seq };
}
// Pertenencia por IGUALDAD EXACTA de la identidad completa de copia (nunca por prefijo: I1 no es I10). Se usa al dibujar la tarjeta y de nuevo al aplicar.
export const OTHER_COPY_TEXT = 'Este partido pertenece a otra copia de aprendizaje. No se puede aplicar a la copia activa.';
export function matchBelongsToCopy(labMatchId, activeCopyId) {
  const p = parseMatchId(labMatchId); if (!p.ok) return { ...p, activeCopyId: activeCopyId ?? null };
  if (typeof activeCopyId !== 'string' || p.copyId !== activeCopyId) return { ok: false, foreign: true, reason: OTHER_COPY_TEXT, resultCopyId: p.copyId, activeCopyId: activeCopyId ?? null, seq: p.seq };
  return { ok: true, resultCopyId: p.copyId, activeCopyId, seq: p.seq };
}
// MOTOR-18C (C18-01): un encuentro está aplicado a un equipo solo si hay una aplicación VIGENTE de ese equipo cuya fuente es IGUAL a la fuente completa esperada (M1 no es M10 ni M100).
export const matchSourceFor = (source, teamId) => sourceIdOf({ source, teamInstance: teamId });
export const isMatchApplied = (ledger, source, teamId) => { const full = matchSourceFor(source, teamId); return (ledger?.applications ?? []).some((a) => a.status === 'aplicada' && a.teamInstance === teamId && a.source_id === full); };
export const newLedgers = (input) => Object.fromEntries(input.teams.map((t) => [t.id, createLedger()]));
export { teamFingerprint, knowledgeKeys, parseKey, keyOf, categoryOf, levelOf, idsOf };
