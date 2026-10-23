// Registro de campaña de un encuentro SIM (SIM-MOTOR-03, §10): ejecuta el encuentro con la dirección automática de producto y devuelve el registro COMPACTO que se conserva de cada caso (esencial individual,
// agregados de Análisis, quintetos con controles observados, evolución, tramos, decisiones, estados y director efectivo) y, solo para la muestra diagnóstica, los hechos nativos completos. No altera el
// deporte: lee lo ya generado. Una ejecución fallida devuelve su estado y causa, sin marcador definitivo.
import { SimMatch } from './engine.js';
import './materialize.js';
import { buildSimResult } from './result.js';
import { reconcileResult } from './reconcile.js';
import { essentialFromResult } from './essential.js';
import { playAutomatic, advanceAutomatic } from './coachsim.js';
import { snapshotSim, restoreSim } from './snapshot.js';
import { ShardRunner } from './shard.js';
import { REVIEW_EVERY } from './coachsim.js';
import { SIM_VERSION, SIM_PROFILE_ID, SIM_COVERAGE_ID, SIM_STATS_POLICY_ID, SIM_RESULT_SCHEMA } from './version.js';

export const CAMPAIGN_RECORD_SCHEMA = 'beM-sim03-record/1';
export const DIAG04B_SCHEMA = 'beM-sim04b-diag/1';
const r1 = (x) => Math.round(x * 10) / 10;
const planBrief = (p) => ({ disposition: p.disposition, defense: p.defense, coverage: p.coverage, pressureHeight: p.pressureHeight, styles: { ...p.styles }, defStyles: { ...p.defStyles }, midrange: p.midrange, starters: { ...p.starters }, directorPriority: [...(p.directorPriority ?? [])], initialTeamMoment: p.initialTeamMoment ?? 0, coach: p.coach?.policy ?? null, playbook: (p.playbook ?? []).map((e) => `${e.playId}:${e.priority}`) });
// Director EFECTIVO por tramo (prioridad vigente entre los presentes; si ninguno, el PG del tramo), con intervalos fusionados. Las órdenes de campaña no cambian la prioridad de director.
function directorIntervals(m, input) {
  const out = [[], []];
  for (const s of m.segments) for (const k of [0, 1]) {
    const prio = m.teams[k].plan.directorPriority ?? input.teams[k].plan.directorPriority ?? []; const present = new Set(s.lineups[k]); let d = prio.find((id) => present.has(id));
    if (!d) d = Object.entries(s.slots[k]).find(([, slot]) => slot === 'PG')?.[0] ?? s.lineups[k][0];
    const last = out[k][out[k].length - 1]; if (last && last.id === d && Math.abs(last.end - s.start) < 0.06) last.end = r1(s.end); else out[k].push({ id: d, start: r1(s.start), end: r1(s.end) });
  }
  return out;
}

// 04B §7.5: tablas de auditoría leídas de los hechos nativos (sin decisiones deportivas nuevas ni azar): contexto × zona × calidad con intentos, aciertos y asistidos por equipo atacante; fallos con falta de tiro (no son
// intentos de campo); sustituciones con su motivo y, solo en diagnóstico seleccionado, decisiones de relevo y probabilidades ya calculadas. Un campo no conservado queda `null` con su causa en el diccionario.
function diag04b(m, detail) {
  const czq = {}; const foulMiss = {}; const subs = []; const shots = [];
  for (const e of m.events) {
    if (e.ty === 'shot') { const k = `${e.tm}|${e.ctx}|${e.zone}|${e.q}`; const x = (czq[k] ??= [0, 0, 0]); x[0]++; if (e.made) { x[1]++; if (e.passer) x[2]++; } if (detail && e.diag) shots.push([e.t, e.tm, e.ctx, e.zone, e.q, e.made ? 1 : 0, e.blk ? 1 : 0, e.diag.p, e.diag.pBase, e.diag.K, e.diag.blkP, ...e.diag.qp]); }
    else if (e.ty === 'shootfoul' && !e.and1) { const k = `${1 - e.tm}|${e.ctx}|${e.zone}`; foulMiss[k] = (foulMiss[k] ?? 0) + 1; }
    else if (e.ty === 'sub') subs.push([e.t, e.tm, (e.why ?? []).join('|'), e.out.length, e.in.length]);
  }
  return { schema: DIAG04B_SCHEMA, czqColumns: ['tm|ctx|zone|q(0 cómoda,1 normal,2 forzada)', ['attempts', 'makes', 'assistedMakes']], czq, foulMissNote: 'fallos con falta de tiro: sin intento de campo', foulMiss, subsColumns: ['t', 'tm', 'why(slot:reason|…)', 'nOut', 'nIn'], subs,
    ...(detail ? { rotationDecisions: m.rotLog, shotsColumns: ['t', 'tm', 'ctx', 'zone', 'q', 'made', 'blocked', 'p(condicional a no tapón)', 'pBase', 'K', 'pBlock', 'qPrior.comfortable', 'qPrior.normal', 'qPrior.forced'], shots } : {}) };
}
// Ruta de ejecución (repeticiones técnicas E, §9.1): 'auto' (de golpe con dirección automática), 'steps' (avance por los instantes `c.steps` con consultas intermedias, sin azar) o 'recover' (en los instantes
// `c.cuts` se guarda, se serializa y se restaura el encuentro con su sufijo privado). Todas usan la misma política, revisiones y noticias; solo cambia CÓMO se avanza.
function drive(ctx, m, c, route) {
  const consult = () => { buildSimResult(m, { events: false, reconcile: false, audience: 'public' }); buildSimResult(m, { events: false, reconcile: false, audience: 'own', team: 0 }); route.consults += 1; };
  const name = c.route ?? 'auto'; route.name = name;
  if (name === 'steps') { for (const u of c.steps) { if (m.status !== 'running') break; advanceAutomatic(m, { until: u }); consult(); } route.steps = c.steps; }
  else if (name === 'recover') { for (const cut of c.cuts) { if (m.status !== 'running') break; advanceAutomatic(m, { until: cut }); consult(); const snap = JSON.parse(JSON.stringify(snapshotSim(m, { embedContext: false }))); m = restoreSim(snap, ctx, { matchId: c.case_id, attemptId: c.attempt ?? 1 }); route.restores += 1; } route.cuts = c.cuts; }
  if (c.policy === false) m.finish(); else advanceAutomatic(m, { until: 'end' });
  return m;
}
// Ruta `reference` (04B §11.1, ruta 4): el camino del MUNDO. Barreras comunes de 120 s con revisión de ambos entrenadores, cierre diferido, esencial consultado ANTES de sellar, sellado con liberación del estado y esencial final
// de Referencia (registro mínimo comprometido). Misma trayectoria deportiva que `auto`; el registro conserva el esencial y el estado de cierre, no el análisis completo.
function runReference(ctx, c, base, t0) {
  const sr = new ShardRunner(ctx, { releaseFinished: true }); const id = c.case_id; sr.add({ id, input: c.input, start: 0, opts: { matchId: id, attemptId: c.attempt ?? 1 } });
  let barriers = 0; for (let T = REVIEW_EVERY; ; T += REVIEW_EVERY) { const pk = sr.advanceAll(T, { defer: true }); barriers++; if (pk.every((p) => p.finished)) break; sr.review(T, {}, { policy: true }); if (barriers > 400) throw new Error('tope de barreras'); }
  const before = sr.essential(id); const hadComplete = before.complete === true; const seal = sr.seal(); const after = sr.essential(id); const released = sr.released(id);
  const m = sr.matches.get(id); const status = after.complete ? 'finished' : 'running';
  return { record: { ...base, status, error: null, valid: after.validity?.valid === true, failedChecks: after.validity?.failedIds ?? [], identity: { seed: after.identity.seed, inputFingerprint: after.identity.inputFingerprint, sportFingerprint: after.identity.sportFingerprint }, essential: after,
    route: { name: 'reference', barriers, consultedBeforeSeal: hadComplete, seal, released, finalPacketScore: m.final?.score ?? null }, ms: { total: r1(performance.now() - t0) } } };
}
// `c`: { case_id, input, attempt?, diag?, policy?, route?, steps?, cuts? } ; devuelve { record, diag? }.
export function runCampaignSim(ctx, c) {
  const t0 = performance.now(); const input = c.input; let m = null;
  const base = { schema: CAMPAIGN_RECORD_SCHEMA, case_id: c.case_id, resolver: 'sim', attempt: c.attempt ?? 1, versions: { sim: SIM_VERSION, profile: SIM_PROFILE_ID, coverage: SIM_COVERAGE_ID, statsPolicy: SIM_STATS_POLICY_ID, result: SIM_RESULT_SCHEMA }, policy: c.policy !== false };
  try {
    if (c.route === 'reference') return runReference(ctx, c, base, t0);
    m = new SimMatch(input, ctx, { matchId: c.case_id, attemptId: c.attempt ?? 1, ...(c.diag ? { rotationDiag: true, shotDiag: true } : {}) });
    const s0 = m.teams.map((t) => t.players.map((p) => ({ id: p.id, energy: p.energy, form: p.form, M_TIR: p.M.TIR, M_OFE: p.M.OFE, M_DEF: p.M.DEF, available: p.available })));
    const route = { name: 'auto', consults: 0, restores: 0 }; m = drive(ctx, m, c, route);
    const tGen = performance.now();
    const res = buildSimResult(m, { events: false, reconcile: false, analysis: true }); const rec = reconcileResult(m, res, m.events); const ess = essentialFromResult(res, { reconcile: rec });
    const valid = m.status === 'finished' && rec.valid === true;
    const record = { ...base, status: m.status, error: m.error?.cause ?? null, valid, failedChecks: rec.checks.filter((x) => !x.ok).map((x) => x.id), checks: rec.checks.length, notEvaluated: rec.notEvaluated ?? [], recon: rec.checks.map((x) => [x.id, x.ok ? 1 : 0, x.universe, x.failureCount ?? 0]),
      identity: { seed: res.identity.seed, importance: res.identity.importance, inputFingerprint: res.identity.inputFingerprint, effectiveInputFingerprint: res.identity.effectiveInputFingerprint, nCommands: res.identity.nCommands, sportFingerprint: res.sportFingerprint, ignoredInput: res.identity.ignoredInput, teams: res.identity.teams.map((t) => t.id) },
      essential: ess, diag04b: diag04b(m, !!c.diag), analysis: res.analysis, rngDraws: m.rng.draws, events: m.events.length, route,
      quintets: res.quintets.map((q) => ({ team: q.team, ids: q.ids, sec: q.sec, pf: q.pf, pa: q.pa, ctlFor: q.ctlFor, ctlAgainst: q.ctlAgainst, fga: q.fga, fgm: q.fgm, fg3a: q.fg3a, fg3m: q.fg3m, fta: q.fta, ftm: q.ftm, tov: q.tov, oreb: q.oreb, dreb: q.dreb, ast: q.ast, stl: q.stl, blk: q.blk, intervals: q.intervals })),
      evolution: res.evolution, segments: res.segments.map((s) => ({ n: s.n, start: s.start, end: s.end, period: s.period, controls: s.controls, lineups: s.lineups, org: s.org, coverage: s.plans.map((p) => p.coverage ?? null), pressureHeight: s.plans.map((p) => p.pressureHeight ?? null), cut: s.cut })),
      director: directorIntervals(m, input), decisions: res.decisions ?? [], commands: res.commands ?? [],
      plans: m.norm.teams.map((t, k) => ({ id: t.id, source: t.sourceTeam, initial: planBrief(input.teams[k].plan), final: planBrief(m.teams[k].plan) })),
      states: { start: s0, end: m.teams.map((t) => t.players.map((p) => ({ id: p.id, energy: Math.round(p.energy * 100) / 100, form: p.form, M_TIR: Math.round(p.M.TIR * 1000) / 1000, M_OFE: Math.round(p.M.OFE * 1000) / 1000, M_DEF: Math.round(p.M.DEF * 1000) / 1000, fouls: p.fouls, out: p.out, minutes: r1(p.minutes) }))) },
      ms: { gen: r1(tGen - t0), total: r1(performance.now() - t0) } };
    const out = { record };
    if (c.diag) { const full = buildSimResult(m, { events: true, reconcile: true, audience: 'diagnostic', includeSuffix: true, analysis: true }); out.diag = { schema: 'beM-sim03-diag/1', case_id: c.case_id, result: full, rawEvents: m.events, rawSegments: m.segments, coachLog: m.coach.log, commandLog: m.commandLog, contextLog: m.contextLog, rng: { draws: m.rng.draws } }; }
    return out;
  } catch (e) { return { record: { ...base, status: 'failed', valid: false, error: String(e.message ?? e).slice(0, 400), identity: m ? { seed: m.norm.seed, inputFingerprint: m.norm.fingerprint } : null, ms: { total: r1(performance.now() - t0) } } }; }
}
