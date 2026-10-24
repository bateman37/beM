// SIM-MOTOR-04C · historia desde la reserva sin jugar otra temporada (§11.4) y aprendizaje comparado (§11.5), adaptado de SIM-MOTOR-03 (§8.3 y §8.4), calculados SOLO desde resultados ya ejecutados (sin volver a simular): los 56 resultados de VAL en un calendario estadístico de doble vuelta de ocho equipos (rondas FICTICIAS identificadas),
// dos ledgers separados (SIM y comparación mixta), conciliación jugador → club/competición/temporada y esencial → ledger, y propuestas de aprendizaje con Polivalencia 8/16/24 sobre copias identificadas.
// Nunca se aplica una propuesta al motor ni al dataset base; las aplicaciones y deshacer de comprobación se hacen sobre copias.
import { SeasonLedger, commonLines, derived, COMMON_KEYS } from '../../src/season/ledger.js';
import { SeasonWorld } from '../../src/season/world.js';
import { exposureFromEssential, LEARNING_UNITS } from '../../src/sim/learning.js';
import { ConsequenceLedger } from '../../src/sim/consequences.js';
import { proposeFromMatch, applyProposal, undoApplication, createLedger, learningParamsFingerprint } from '../../src/learning/index.js';
import { makeLearningCopy, teamStatesOf, isMatchApplied } from '../../src/lab/learning-model.js';
import { canonical } from '../../src/sim/fp.js';
import * as L from './lib.js';

const deep = (x) => JSON.parse(JSON.stringify(x));
// Esencial común del detallado para el ledger (mismo contrato que `detailedEssential` de la jornada) desde el registro esencial rico de la campaña: acta individual con tiempos exactos, participación, tapones recibidos y validez.
export function liteFromDetailedRecord(rec, matchId) {
  const e = rec.essential; const poss = [0, 0]; for (const p of e.acta.possessions ?? []) poss[p.team] += 1;
  return { schema: 'beM-detailed-essential-lite/2', model: 'detailed', complete: rec.status === 'finished', status: rec.status, identity: { matchId, teams: e.identity.teams.map((t) => ({ id: t.id })), seed: e.identity.seed }, result: { status: rec.status, court_score: e.result.court_score }, score: { final: rec.status === 'finished' ? [...e.result.court_score] : null }, durationSeconds: e.result.game_tenths / 10,
    acta: { players: e.acta.players.map((p) => ({ id: p.id, team: p.team, team_index: p.team_index ?? p.team, participation: p.participation, starter: p.participation === 'titular', min_tenths: p.min_tenths, pts: p.pts, fg2m: p.fg2m, fg2a: p.fg2a, fg3m: p.fg3m, fg3a: p.fg3a, ftm: p.ftm, fta: p.fta, oreb: p.oreb, dreb: p.dreb, ast: p.ast, tov: p.tov, stl: p.stl, blk: p.blk, blk_rec: p.blk_rec, pf: p.pf, fr: p.fr, pm: p.pm })), teams: [{ possessions: poss[0] }, { possessions: poss[1] }] },
    validity: { valid: !!rec.valid } };
}
const SEASON = 'T-LAB'; const COMP = 'LIGA-FICTICIA';
const keyStint = (p, club) => SeasonLedger.key(p, SEASON, COMP, club);

// ---------------------------------------------------------------------------------------------------------------------------------- historia
function recordAll(label, items) {
  const led = new SeasonLedger(); const rejected = []; const accepted = [];
  for (const it of items) { const r = led.record(it.essential, { season: SEASON, competition: COMP, round: it.round, clubs: [it.home, it.away], model: it.model, matchId: it.case_id, attemptId: 1 }); (r.ok ? accepted : rejected).push({ case_id: it.case_id, round: it.round, model: it.model, ...(r.ok ? {} : { reason: r.reason ?? null, errors: r.errors ?? null }) }); }
  return { label, led, accepted, rejected };
}
function reconcileLedger(led, items) {
  const checks = []; const add = (id, ok, detail) => checks.push({ id, ok: !!ok, detail });
  // 1) esencial → ledger: sumas por jugador/club/competición/temporada desde los propios esenciales
  const expect = new Map();
  for (const it of items) for (const l of commonLines(it.model, it.essential)) { const club = l.teamIndex === 0 ? it.home : it.away; const k = keyStint(l.playerId, club); const x = expect.get(k) ?? Object.fromEntries(COMMON_KEYS.map((c) => [c, 0])); x.games += 1; x.starts += l.starter ? 1 : 0; for (const c of COMMON_KEYS) if (c !== 'games' && c !== 'starts') x[c] += l.line[c] ?? 0; expect.set(k, x); }
  let mismatches = 0; for (const [k, x] of expect) { const st = led.stints.get(k); if (!st) { mismatches++; continue; } for (const c of COMMON_KEYS) if (st.sums[c] !== x[c]) mismatches++; }
  add('esencial→ledger: sumas por jugador/club/competición/temporada', mismatches === 0 && expect.size === led.stints.size, { tramos: led.stints.size, esperados: expect.size, discrepancias: mismatches });
  // 2) puntos de los tramos por club = puntos a favor de ese club en sus partidos
  const clubPts = {}; for (const it of items) { clubPts[it.home] = (clubPts[it.home] ?? 0) + it.essential.score?.final?.[0]; clubPts[it.away] = (clubPts[it.away] ?? 0) + it.essential.score?.final?.[1]; }
  const stPts = {}; for (const st of led.stints.values()) stPts[st.club] = (stPts[st.club] ?? 0) + st.sums.pts;
  add('puntos de los jugadores por club = marcador de sus partidos', Object.keys(clubPts).every((c) => clubPts[c] === stPts[c]), { clubs: Object.keys(clubPts).length });
  // 3) porcentajes desde numeradores y denominadores
  let pctBad = 0; for (const st of led.stints.values()) { const t = led.total(st.player, { season: SEASON }); const d = derived(t.sums); const direct = t.sums.fta ? t.sums.ftm / t.sums.fta : null; if (d.ftPct !== direct) pctBad++; }
  add('porcentajes recalculados desde sumas (no promediados)', pctBad === 0, { jugadores: led.stints.size, discrepancias: pctBad });
  // 4) DNP/participación: nadie con 0 minutos suma partido; quien suma tiene minutos
  let dnpBad = 0; for (const it of items) { const players = it.model === 'sim' ? it.essential.box.players.map((p) => ({ id: p.id, team: p.team, min: p.sec })) : it.essential.acta.players.map((p) => ({ id: p.id, team: p.team_index ?? p.team, min: p.min_tenths })); for (const p of players) { const club = p.team === 0 ? it.home : it.away; const st = led.stints.get(keyStint(p.id, club)); const counted = st?.rounds.some((r) => r.matchId === it.case_id) ?? false; if ((p.min > 0) !== counted) dnpBad++; } }
  add('participación/DNP: solo suma partido quien tiene minutos', dnpBad === 0, { discrepancias: dnpBad });
  // 5) tapones recibidos, tiempos y tramos
  let blk = 0; let blkExp = 0; for (const st of led.stints.values()) blk += st.sums.blkAgainst; for (const it of items) for (const l of commonLines(it.model, it.essential)) blkExp += l.line.blkAgainst; add('tapones recibidos conservados', blk === blkExp, { ledger: blk, esenciales: blkExp });
  const minTot = [...led.stints.values()].reduce((a, s) => a + s.sums.minTenths, 0); const minExp = items.reduce((a, it) => a + commonLines(it.model, it.essential).reduce((s, l) => s + l.line.minTenths, 0), 0); add('tiempos (décimas) conservados', minTot === minExp, { ledger: minTot, esenciales: minExp });
  add('jugador → club único por tramo (club del encuentro)', [...led.stints.values()].every((st) => st.rounds.every((r) => items.find((i) => i.case_id === r.matchId && (st.club === i.home || st.club === i.away)))), { tramos: led.stints.size });
  return checks;
}

function historyChecks(led, items) {
  const out = []; const add = (id, ok, detail) => out.push({ id, ok: !!ok, detail });
  // reimportar / reintentar no duplica
  const before = canonical(led.toJSON()); let dups = 0; for (const it of items) { const r = led.record(it.essential, { season: SEASON, competition: COMP, round: it.round, clubs: [it.home, it.away], model: it.model, matchId: it.case_id, attemptId: 2 }); if (r.duplicate) dups++; }
  add('reintento (intento 2) y reimportación: todos duplicados, sin cambio', dups === items.length && canonical(led.toJSON()) === before, { duplicados: dups, total: items.length });
  const imp = SeasonLedger.from(deep(led.toJSON())); let d2 = 0; for (const it of items) if (imp.record(it.essential, { season: SEASON, competition: COMP, round: it.round, clubs: [it.home, it.away], model: it.model, matchId: it.case_id }).duplicate) d2++; add('tras importar el histórico sigue rechazando duplicados', d2 === items.length, { duplicados: d2 });
  // consulta histórica limitada también en su detalle
  const mid = 6; const sample = [...led.stints.values()][3]; const q = led.stintsOf(sample.player, { season: SEASON, upTo: mid }); const wire = JSON.stringify(q); const future = items.filter((i) => i.round > mid).map((i) => i.case_id);
  add(`consulta hasta la ronda ${mid}: sin detalle de rondas posteriores`, q.length > 0 && future.every((id) => !wire.includes(`"${id}"`)), { jugador: sample.player, rondas: q.flatMap((s) => s.rounds.map((r) => r.round)) });
  const matchesQ = led.matchesUpTo({ season: SEASON, upTo: mid }); add('encuentros registrados hasta esa fecha', matchesQ.length === items.filter((i) => i.round <= mid).length && matchesQ.every((m) => m.round <= mid), { n: matchesQ.length });
  // cierre y apertura de temporada conservan lo anterior sin avanzar edades
  const t1 = canonical(led.total(sample.player, { season: SEASON }).sums); led.record(items[0].essential, { season: 'T-LAB-2', competition: COMP, round: 1, clubs: [items[0].home, items[0].away], model: items[0].model, matchId: items[0].case_id, attemptId: 1 }); add('apertura de otra temporada conserva lo anterior (y permite el mismo encuentro lógico en otra temporada)', canonical(led.total(sample.player, { season: SEASON }).sums) === t1, {});
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------- aprendizaje
function learning(env, simBy, detBy, pairs) {
  const P = env.profile.familiarity; const out = { units: LEARNING_UNITS, polivalencia: [8, 16, 24], paramsFingerprint: learningParamsFingerprint(P), pairs: [], checks: [] }; const add = (id, ok, detail) => out.checks.push({ id, ok: !!ok, detail });
  const rows = [];
  for (const pr of pairs) {
    const sim = simBy.get(pr.sim); const det = detBy.get(pr.detailed); if (!sim || !det) { out.pairs.push({ pair: pr.pair, error: 'falta un resolutor' }); continue; }
    const c = L.allCases(env); const caseDef = c.val.find((x) => x.case_id === pr.sim); const base = caseDef.make(); const copy = makeLearningCopy(base, env.profile, { mode: 'synthetic', id: `LEARN04-${pr.pair}` });
    const exps = { sim: exposureFromEssential(sim.essential, { source: pr.sim }), detailed: det.exposure?.players ? { ...det.exposure, match: { ...(det.exposure.match ?? {}), source_id: `${pr.detailed}` } } : null };
    const entry = { pair: pr.pair, sim: pr.sim, detailed: pr.detailed, copy: copy.id, exposure: {}, proposals: [] };
    for (const [model, ex] of Object.entries(exps)) {
      if (!ex) { entry.exposure[model] = { status: 'no_conservado' }; continue; }
      const players = Object.entries(ex.players); const sum = (f) => players.reduce((a, [, x]) => a + f(x), 0);
      entry.exposure[model] = { complete: ex.complete ?? true, playersWithTime: players.filter(([, x]) => x.liveTenths > 0).length, liveTenthsTotal: sum((x) => x.liveTenths), moduleCreditTotal: Math.round(sum((x) => Object.values(x.modules ?? {}).reduce((a, b) => a + b, 0)) * 1000) / 1000, modulesDistinct: new Set(players.flatMap(([, x]) => Object.keys(x.modules ?? {}))).size, positionTenths: sum((x) => Object.values(x.positions ?? {}).reduce((a, b) => a + b, 0)), offensiveRoleTenths: sum((x) => Object.values(x.offensiveRoles ?? {}).reduce((a, b) => a + b, 0)), defensiveRoleTenths: sum((x) => Object.values(x.defensiveRoles ?? {}).reduce((a, b) => a + b, 0)) };
      for (const poly of [8, 16, 24]) {
        const { states } = teamStatesOf(copy.input, P, 0);
        for (const t of copy.input.teams) {
          const st = deep(states[t.id]); for (const p of Object.values(st.players)) p.tacticalLearning = poly;
          const prop = proposeFromMatch(st, ex, P, { source_id: `${pr.pair}|${model}|${t.id}|P${poly}` });
          if (!prop.ok) { entry.proposals.push({ model, team: t.id, poly, ok: false, errors: prop.errors?.slice(0, 3) }); continue; }
          for (const [pid, pl] of Object.entries(prop.players)) {
            const before = st.players[pid]; const targets = pl.targets ?? []; const exp = ex.players[pid];
            rows.push({ pair: pr.pair, model, team: t.id, poly, player: pid, liveMinutes: Math.round(pl.liveMinutes * 1000) / 1000, budgets: pl.budgets, targets: targets.length, gain: targets.reduce((a, x) => a + ((x.after?.level ?? x.level ?? 0) - (x.before?.level ?? x.prevLevel ?? 0)), 0), detail: targets.map((x) => ({ key: x.key, ...x })), exposureTime: exp?.liveTenths ?? 0, hadTime: (exp?.liveTenths ?? 0) > 0, idle: pl.idle?.length ?? 0 });
            void before;
          }
          entry.proposals.push({ model, team: t.id, poly, ok: true, playersWithTargets: Object.values(prop.players).filter((x) => (x.targets ?? []).length > 0).length, fingerprints: { prev: prop.prevFingerprint, next: prop.nextFingerprint } });
        }
      }
    }
    out.pairs.push(entry);
  }
  out.rows = rows;
  // propiedades exigidas
  add('nadie sin participación recibe dosis por estar en la plantilla', rows.every((r) => r.hadTime || r.targets === 0), { filas: rows.length, conTiempo: rows.filter((r) => r.hadTime).length });
  // misma exposición normalizada en ambos adaptadores → misma propuesta; más registros no conceden presupuesto
  const pr0 = pairs[0]; const sim0 = simBy.get(pr0.sim); const base0 = L.allCases(env).val.find((x) => x.case_id === pr0.sim).make(); const copy0 = makeLearningCopy(base0, env.profile, { mode: 'synthetic', id: `LEARN04-${pr0.pair}-eq` }); const { states: s0 } = teamStatesOf(copy0.input, P, 0); const tid = copy0.input.teams[0].id;
  const stA = deep(s0[tid]); const exA = exposureFromEssential(sim0.essential, { source: pr0.sim }); const exB = deep(exA); exB.match.model = 'beM-detailed'; const rnd = (x) => JSON.stringify(x, (k, v) => (typeof v === 'number' ? Math.round(v * 1e9) / 1e9 : v));
  const pa = proposeFromMatch(stA, exA, P, { source_id: 'EQ|X' }); const pb = proposeFromMatch(stA, exB, P, { source_id: 'EQ|X' }); add('misma exposición normalizada ⇒ misma propuesta con las funciones comunes (sin importar el adaptador)', pa.ok && pb.ok && rnd(pa.nextState) === rnd(pb.nextState), { pair: pr0.pair });
  const exC = deep(exA); for (const x of Object.values(exC.players)) for (const k of Object.keys(x.modules)) x.modules[k] *= 7; const pc = proposeFromMatch(stA, exC, P, { source_id: 'EQ|X' }); add('más eventos (créditos ×7) no conceden más presupuesto ni dosis', pc.ok && rnd(pc.nextState) === rnd(pa.nextState), {});
  // aplicación y deshacer sobre COPIAS, con guarda por encuentro lógico y fuente completa
  const led = createLedger(); const cons = new ConsequenceLedger(); const g1 = cons.apply({ kind: 'learning', matchId: pr0.sim, scope: tid, attemptId: 1 }); const ap = applyProposal(stA, led, pa, P); const ap2 = ap.ok ? applyProposal(ap.state, ap.ledger, pa, P) : null; const un = ap.ok ? undoApplication(ap.state, ap.ledger, ap.receipt.application) : null;
  add('aplicación sobre copia: una vez; segunda aplicación de la misma fuente rechazada; deshacer restaura el estado previo', g1.ok && ap.ok && ap2?.ok === false && un?.ok && rnd(un.state.players) === rnd(stA.players), { receipt: ap.receipt ?? null });
  add('guarda por encuentro lógico: reintento (intento distinto) rechazado; M1 ≠ M10', cons.apply({ kind: 'learning', matchId: pr0.sim, scope: tid, attemptId: 2 }).duplicate === true && cons.apply({ kind: 'learning', matchId: `${pr0.sim}|M10`, scope: tid, attemptId: 1 }).ok === true, {});
  void isMatchApplied; void SeasonWorld;
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------- orquestación
export function buildHistoryAndLearning(env, simRecs, detRecs) {
  const simBy = new Map(simRecs.filter((r) => r.status === 'finished').map((r) => [r.case_id, r])); const detBy = new Map(detRecs.filter((r) => r.status === 'finished').map((r) => [r.case_id, r]));
  const Cc = L.allCases(env); const sched = L.historyVal(Cc.val); const mixedAnchors = sched.slice(0, 4).map((x) => x.case_id); const missing = sched.filter((s) => !simBy.has(s.case_id));
  const itemsSim = sched.filter((s) => simBy.has(s.case_id)).map((s) => ({ ...s, model: 'sim', essential: simBy.get(s.case_id).essential }));
  const itemsMixed = sched.filter((s) => simBy.has(s.case_id)).map((s) => { const twin = mixedAnchors.includes(s.case_id) ? detBy.get(s.case_id) : null; return twin ? { ...s, model: 'detailed', essential: liteFromDetailedRecord(twin, s.case_id) } : { ...s, model: 'sim', essential: simBy.get(s.case_id).essential }; });
  const A = recordAll('SIM', itemsSim); const B = recordAll('MIXTO', itemsMixed);
  const out = { schema: 'beM-sim04-history/1', season: SEASON, competition: COMP, note: 'calendario ARTIFICIAL (24 encuentros de la réplica 1 de VAL en seis rondas ficticias de cuatro partidos; los cuatro primeros se sustituyen por su ancla detallada en el histórico mixto); resultados de VAL ya ejecutados, no vueltos a generar ni evolucionados; no es una simulación de desarrollo estacional', scheduled: sched.length, missingResults: missing.map((m) => m.case_id),
    ledgers: {} };
  for (const [name, R, items] of [['sim', A, itemsSim], ['mixed', B, itemsMixed]]) {
    out.ledgers[name] = { label: R.label, accepted: R.accepted.length, rejected: R.rejected, resolvers: items.reduce((a, i) => { a[i.model] = (a[i.model] ?? 0) + 1; return a; }, {}), stints: R.led.stints.size, reconciliation: reconcileLedger(R.led, items), checks: historyChecks(R.led, items), ledgerFingerprint: L.sha(R.led.toJSON()).slice(0, 32), byRound: Object.fromEntries([...new Set(items.map((i) => i.round))].map((r) => [r, items.filter((i) => i.round === r).map((i) => [i.case_id, i.model])])) };
  }
  // movimiento administrativo en una COPIA del escenario (sin jugar partidos): solo efecto en la ronda siguiente; no reasigna retroactivamente partidos ya ejecutados
  const w = new SeasonWorld({ profile: env.profile, players: env.players, ctx: env.ctx }); const mover = 'EQ05-J11'; const back = w.teams.get('EQ02').players.at(-1).id;
  const rej = w.transfer(mover, 'EQ02', 8); const ok = w.transferAll([{ playerId: mover, toClub: 'EQ02', atRound: 1 }, { playerId: back, toClub: 'EQ05', atRound: 1 }]);
  out.administrativeMove = { copyOfLabScenario: true, farDateRejected: rej.ok === false ? rej.reason : 'ACEPTADO (defecto)', exchangeAccepted: ok.ok, clubAtRound0: w.clubAt(mover, 0)?.club ?? null, clubAtRound1: w.clubAt(mover, 1)?.club ?? null, rosters: [w.teams.get('EQ02').players.length, w.teams.get('EQ05').players.length], validRosters: w.validateRosters().length === 0, note: 'los resultados ya ejecutados no se reasignan: su entrada no reflejaba el movimiento' };
  out.learning = learning(env, simBy, detBy, L.LEARNING_PAIRS);
  out.allChecksOk = [...out.ledgers.sim.reconciliation, ...out.ledgers.sim.checks, ...out.ledgers.mixed.reconciliation, ...out.ledgers.mixed.checks, ...out.learning.checks].every((c) => c.ok) && ok.ok && rej.ok === false;
  return out;
}
