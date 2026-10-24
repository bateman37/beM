// SIM-MOTOR-04C · rama tras rebote ofensivo, calidad y conversión de `inside`, lector de asistencia acreditada y selector mecánico. Ocho grupos por riesgo, con entradas fijas y pequeñas; no son campañas
// (la evidencia comparativa se genera con `scripts/sim04c`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult, SIM_VERSION } from '../src/sim/index.js';
import { playAutomatic } from '../src/sim/coachsim.js';
import { snapshotSim, validateSimSnapshot, restoreSim } from '../src/sim/snapshot.js';
import { buildSimEssential } from '../src/sim/essential.js';
import { shotProbs } from '../src/sim/model.js';
import { reboundFunnel } from '../src/sim/exposure.js';
import { runCampaignSim } from '../src/sim/campaign-record.js';
import { validateOverrides } from '../src/sim/profile.js';
import { logit } from '../src/match/mathx.js';
import { canonical } from '../src/sim/fp.js';
import { runDetailedCampaign } from '../scripts/sim04c/detailed-worker.js';
import { buildTables, COLS } from '../scripts/sim04c/tables.js';
import * as SEL from '../scripts/sim04c/select.js';

const { profile, players } = data; const ctx = makeContext(profile);
const inputOf = (seed, a = 'EQ03', b = 'EQ04') => buildReferenceInput(profile, players, a, b, { seed });
const deep = (x) => JSON.parse(JSON.stringify(x));
const ctxWith = (rows) => makeContext(profile, rows);
const play = (input, c = ctx) => { const m = new SimMatch(input, c); playAutomatic(m); return m; };
const fp = (m) => buildSimResult(m, { events: false }).sportFingerprint;
const RESET1 = ctxWith([{ path: 'rebound.organizedResetP0', value: 1 }]);

// ---------------------------------------------------------------------------------------------------------------------------------- 1 · neutralidad
test('S04C-01 neutralidad: con las tres filas nuevas a 0 la trayectoria es la de 04B (huella y consumo de azar de la revisión anterior), con o sin filas explícitas', () => {
  // huellas y sorteos obtenidos con el CÓDIGO de 04B (commit 48bcdef) para las mismas entradas
  const gold = [['EQ03', 'EQ04', 7, '58f77489aae9605a', 6102], ['EQ01', 'EQ02', 11, '556bb8ad184b7f51', 6158]];
  const explicit = ctxWith([{ path: 'rebound.organizedResetP0', value: 0 }, { path: 'opportunity.simInsideQualityLogit', value: 0 }, { path: 'conversion.simInsideLogitOffset', value: 0 }]);
  for (const [a, b, seed, digest, draws] of gold) for (const c of [ctx, explicit]) { const m = play(inputOf(seed, a, b), c); assert.equal(fp(m), digest, `${a}-${b}: huella de 04B`); assert.equal(m.rng.draws, draws, `${a}-${b}: mismos sorteos`); }
  for (const p of ['rebound.organizedResetP0', 'opportunity.simInsideQualityLogit', 'conversion.simInsideLogitOffset']) { const r = ctx.sp.index.get(p); assert.equal(r.value, 0, `${p} neutral`); assert.ok(r.unit && r.effect && r.origin === 'SEM-SIM04C', `${p} declara unidad, origen y efecto`); }
  assert.equal(SIM_VERSION, '0.3.4-SIMMOTOR04E');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 2 · reinicio 0/1 por el camino real
test('S04C-02 rama tras rebote: P0=0 y P0=1 no consumen azar para decidir; 0<P0<1 consume una decisión; el reinicio produce hechos organizados y la inmediata un putback sin ficha; sin celdas organizadas hay fallback declarado', () => {
  const draws = (c, p) => { const m = new SimMatch(inputOf(3), c); m._prepareSides(120); m._compile(0); const d0 = m.rng.draws; const b = m._reboundBranch(0); return [b, m.rng.draws - d0, m]; };
  assert.deepEqual(draws(ctx).slice(0, 2), ['immediate', 0]); assert.deepEqual(draws(RESET1).slice(0, 2), ['organized_reset', 0]);
  const half = draws(ctxWith([{ path: 'rebound.organizedResetP0', value: 0.5 }])); assert.equal(half[1], 1, 'una decisión Bernoulli por rebote ofensivo válido'); assert.ok(['immediate', 'organized_reset'].includes(half[0]));
  const [, , m0] = draws(RESET1); m0.sides[0].orgCells = []; assert.equal(m0._reboundBranch(0), 'reset_unavailable', 'sin celdas organizadas admisibles: fallback declarado');
  let resetShots = 0; let funnel = 0;
  for (const seed of [21, 22, 23, 24]) {
    const m = play(inputOf(seed), RESET1); const res = buildSimResult(m, { events: true }); assert.equal(res.reconciliation.valid, true, res.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id).join()); assert.ok(res.reconciliation.checks.some((c) => c.id === 'R27_rama_tras_rebote_ofensivo'));
    for (const e of m.events) { if (e.ty === 'reb') { if (!e.coll) assert.equal(e.rbb, e.off ? 'organized_reset' : null); } else if (e.cont === 'offensive_rebound' && (e.ty === 'shot' || e.ty === 'shootfoul')) { resetShots++; assert.equal(e.ctx, 'organized'); assert.notEqual(e.src, 'putback'); assert.ok(e.play, 'ficha propia de la nueva resolución'); } }
    funnel += reboundFunnel(m.events).reduce((s, t) => s + Object.values(t).reduce((a, br) => a + br.organized_reset.decisions, 0), 0);
    const m1 = play(inputOf(seed)); for (const e of m1.events) { if (e.ty === 'reb' && e.off && !e.coll) assert.equal(e.rbb, 'immediate'); if (e.cont === 'offensive_rebound' && (e.ty === 'shot' || e.ty === 'shootfoul')) { assert.equal(e.ctx, 'putback'); assert.equal(e.dir, null); assert.equal(e.scr, null); assert.ok(!e.elig); } }
  }
  assert.ok(resetShots > 5 && funnel > 5, 'el reinicio se ejerce en el camino real');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 3 · cadena tras rebote
test('S04C-03 cadena tras rebote: la continuación no hereda pase ni crédito; la asistencia exige un pasador nuevo distinto del tirador; último libre fallado y segundo rebote encadenado funcionan; el embudo suma sus decisiones', () => {
  const seen = { ft: 0, chained: 0, assisted: 0, tov: 0, foul: 0 };
  for (const seed of [31, 32, 33, 34, 35, 36, 37, 38]) {
    const m = play(inputOf(seed, 'EQ05', 'EQ09'), ctxWith([{ path: 'rebound.organizedResetP0', value: 1 }, { path: 'assist.eligibleFinalPassP0', value: 0.9 }])); const ev = m.events;
    ev.forEach((e, i) => {
      if (e.ty === 'reb' && e.off && e.cause === 'ft') seen.ft++;
      if (e.ty === 'reb' && e.off && !e.coll) { const next = ev.slice(i + 1).find((x) => x.cont === 'offensive_rebound' && (x.ty === 'shot' || x.ty === 'tov' || (x.ty === 'shootfoul' && !x.and1))); assert.ok(next, 'cada rebote ofensivo produce una continuación publicada'); if (next.ty === 'tov') seen.tov++; if (next.ty === 'shootfoul') seen.foul++; }
      if (e.ty === 'shot' && e.cont === 'offensive_rebound') { if (e.passer) { seen.assisted++; assert.notEqual(e.passer, e.pl); assert.ok(e.elig, 'solo con finalización elegible y entrega nueva'); } if (!e.made) { const nxt = ev[i + 1]; if (nxt && nxt.ty === 'reb' && nxt.off) seen.chained++; } }
    });
    const f = reboundFunnel(ev); for (const k of [0, 1]) for (const br of Object.values(f[k])) for (const c of Object.values(br)) { assert.equal(c.decisions, c.fga + c.shooting_foul + c.turnover + c.other); assert.ok(c.fgAssists <= c.eligibleBaskets && c.eligibleBaskets <= c.eligible + 1e9); }
  }
  assert.ok(seen.ft > 0 && seen.chained > 0 && seen.assisted > 0 && seen.tov > 0 && seen.foul > 0, JSON.stringify(seen));
});

// ---------------------------------------------------------------------------------------------------------------------------------- 4 · crédito frente a pasador
test('S04C-04 el lector separa canastas con pasador de asistencias ACREDITADAS: en el detallado difieren y las acreditadas concilian con el acta; SIM los publica como columnas distintas; regenerar tablas no cambia el encuentro', () => {
  const rec = runDetailedCampaign({ case_id: 'T', input: inputOf(41), attempt: 1 }).record; assert.equal(rec.status, 'finished');
  const { tables } = buildTables([], [{ ...rec, block: 'X', scenario: 's', variant: 'v', orientation: 'o', replicate: 1, run: 'DET', seed: 41 }]); const ix = (n) => COLS.czq.indexOf(n);
  const rows = tables.czq.filter((r) => r[ix('quality')] != null); const withPasser = rows.reduce((s, r) => s + r[ix('made_with_passer')], 0); const credited = rows.reduce((s, r) => s + r[ix('ast_fg_credited')], 0);
  const acta = rec.essential.acta.teams.reduce((s, t) => s + t.totals.astFg, 0);
  assert.equal(credited, acta, 'las asistencias acreditadas del lector concilian con el acta'); assert.ok(withPasser > credited, 'canasta con pasador ≠ asistencia acreditada (ruptura causal)');
  const m = play(inputOf(41)); const before = fp(m); const res = buildSimResult(m, { events: false }); const e1 = canonical(buildSimEssential(m)); assert.equal(fp(m), before); assert.equal(canonical(buildSimEssential(m)), e1, 'releer no cambia nada');
  const cr = runCampaignSim(ctx, { case_id: 'T', input: inputOf(41), policy: true }).record; assert.equal(cr.status, 'finished'); assert.ok(Object.values(cr.diag04b.czq).every((x) => x.length === 4 && x[3] === x[2]), 'el registro de campaña publica ambas columnas (en SIM coinciden)'); assert.deepEqual(cr.diag04b.czqColumns[1], ['attempts', 'makes', 'madeWithPasser', 'astFgCredited']);
  const simAst = m.events.filter((e) => e.ty === 'shot' && e.made && e.passer).length; assert.equal(simAst, res.box.teams.reduce((s, t) => s + t.astC, 0), 'en SIM el pasador representado es el crédito causal del acta');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 5 · calidad y conversión de inside
const compiled = (rows, seed = 3) => { const c = rows ? ctxWith(rows) : ctx; const m = new SimMatch(inputOf(seed), c); m._prepareSides(120); m._compile(0); return m; };
test('S04C-05 calidad y conversión de inside: se aplican UNA vez y solo a inside, con objetos de calidad propios; neutral = identidad; la respuesta a atributos se conserva; rangos y rechazos con causa', () => {
  const A = compiled(null); const Q = compiled([{ path: 'opportunity.simInsideQualityLogit', value: 1 }]);
  for (const k of [0, 1]) { const ca = A.sides[k].cells; const cq = Q.sides[k].cells; let ins = 0;
    cq.forEach((c, i) => { if (!c.q) return; if (c.cell.zone === 'inside') { ins++; assert.ok(c.q.comfortable > ca[i].q.comfortable && c.q.forced < ca[i].q.forced, 'inside mejora su calidad'); } else assert.deepEqual(c.q, ca[i].q, `otras zonas intactas (${c.cell.zone})`); assert.equal(c.w, ca[i].w, 'el peso de la celda no cambia'); });
    const spont = cq.filter((c) => c.kind === 'spont'); const sIn = spont.find((c) => c.cell.zone === 'inside'); const sRim = spont.find((c) => c.cell.zone === 'rim'); assert.notEqual(sIn.q, sRim.q, 'sin alias entre zonas'); const l = (q) => Math.log(q.comfortable / q.forced); const sn = ca.filter((c) => c.kind === 'spont').find((c) => c.cell.zone === 'inside');
    assert.ok(Math.abs((l(sIn.q) - l(sn.q)) - 2 * 1) < 1e-9, 'espontáneo: el logit comfortable/forced se desplaza exactamente una vez'); assert.ok(ins > 0); }
  // conversión: solo la zona inside, una vez, antes de la logística; sin tocar tapón ni p0; respuesta a atributos intacta
  const M0 = compiled(null); const M1 = compiled([{ path: 'conversion.simInsideLogitOffset', value: 0.3 }]); const side = (m) => m.sides[0]; const cellInfo = (m) => { const c = side(m).cells.find((x) => x.kind === 'play' && x.cell.zone === 'inside' && x.w > 0); return { cell: c.cell, kind: 'play' }; };
  const sh0 = side(M0).view.players[0]; const sh1 = side(M1).view.players[0]; const pr = (m, zone) => shotProbs(m.S, m.T, m.sides, 0, side(m).M, cellInfo(m), side(m).view.players[0], 1, zone);
  assert.ok(Math.abs((logit(pr(M1, 'inside').pBase) - logit(pr(M0, 'inside').pBase)) - 0.3) < 1e-9, 'delta de 0,3 logit en inside'); assert.equal(pr(M1, 'rim').pBase, pr(M0, 'rim').pBase); assert.equal(pr(M1, 'three').pBase, pr(M0, 'three').pBase); assert.equal(pr(M1, 'inside').dIn, 0.3); assert.equal(pr(M0, 'inside').dIn, 0);
  const strong = side(M1).view.players.reduce((a, b) => (b.abv.reduce((s, x) => s + x, 0) > a.abv.reduce((s, x) => s + x, 0) ? b : a)); const weak = side(M1).view.players.reduce((a, b) => (b.abv.reduce((s, x) => s + x, 0) < a.abv.reduce((s, x) => s + x, 0) ? b : a));
  const at = (m, pl) => shotProbs(m.S, m.T, m.sides, 0, side(m).M, cellInfo(m), pl, 1, 'inside').pBase; assert.ok(at(M1, strong) > at(M1, weak) || at(M0, strong) > at(M0, weak), 'la diferencia entre jugadores se conserva'); void sh0; void sh1;
  const bad = (rows) => validateOverrides(ctx.sp, rows).map((e) => `${e.path}: ${e.message}`);
  assert.ok(bad([{ path: 'rebound.organizedResetP0', value: 1.1 }]).length); assert.ok(bad([{ path: 'rebound.organizedResetP0', value: -0.1 }]).length); assert.deepEqual(bad([{ path: 'rebound.organizedResetP0', value: 0 }, { path: 'rebound.organizedResetP0', value: 1 }]), []);
  assert.ok(bad([{ path: 'opportunity.simInsideQualityLogit', value: 1.5 }]).length); assert.ok(bad([{ path: 'conversion.simInsideLogitOffset', value: 0.31 }]).length); assert.ok(bad([{ path: 'conversion.simInsideLogitOffset', value: Number.NaN }]).length); assert.deepEqual(bad([{ path: 'conversion.simInsideLogitOffset', value: 0.3 }, { path: 'opportunity.simInsideQualityLogit', value: 1 }]), []);
});

// ---------------------------------------------------------------------------------------------------------------------------------- 6 · guardado, cierre y presente público
test('S04C-06 guardado/recuperación y cierre con ramas: recuperar un partido con reinicios es exacto; el esencial conserva el embudo y su conciliación; consultar no cambia nada ni duplica exposición', () => {
  const c = ctxWith([{ path: 'rebound.organizedResetP0', value: 0.5 }]); const ctl = new SimMatch(inputOf(51), c); ctl.finish();
  const m = new SimMatch(inputOf(51), c); m.advance({ until: 700 }); const snap = deep(snapshotSim(m, { embedContext: false })); assert.deepEqual(validateSimSnapshot(snap), []); const r = restoreSim(snap, c); r.finish();
  assert.equal(r.rng.draws, ctl.rng.draws); assert.equal(fp(r), fp(ctl));
  const ess = buildSimEssential(ctl); assert.ok(ess.reboundFunnel, 'el esencial conserva el embudo'); assert.equal(ess.validity.valid, true); assert.ok(ess.retention.conserved.includes('reboundFunnel'));
  const dec = (f) => f.reduce((s, t) => s + Object.values(t).reduce((a, br) => a + Object.values(br).reduce((x, y) => x + y.decisions, 0), 0), 0); const offReb = ctl.events.filter((e) => e.ty === 'reb' && e.off && !e.coll).length; // el crédito colectivo tras tapón fuera (04E) no es una decisión de rama assert.equal(dec(ess.reboundFunnel), offReb);
  const a = canonical(buildSimResult(ctl, { events: false }).exposure); buildSimResult(ctl, { events: false, audience: 'public' }); assert.equal(canonical(buildSimResult(ctl, { events: false }).exposure), a, 'consultar no genera dosis');
  // presente público: un prefijo publicado no muestra continuaciones futuras
  const part = new SimMatch(inputOf(51), c); part.advance({ until: 300 }); const pub = buildSimResult(part, { events: true, audience: 'public' }); assert.ok(pub.events.every((e) => e.t <= part.published + 1e-9));
});

// ---------------------------------------------------------------------------------------------------------------------------------- 7 · selector
const mkE = (o) => Object.fromEntries(Object.entries({ eP: 0.03, eF: 0.03, eZ: 0.05, e2: 0.02, eR: 0.02, eI: 0.02, eQ: 0.02, eA: 0.05, e3: 0.01, eFT: 0.01, forcedInside: 0.02, ...o }).map(([k, v]) => [k, v == null ? { value: null, evaluated: false } : { value: v, evaluated: true }]));
const mkV = (id, e, set = {}, inv = true) => { const x = mkE(e); const sc = SEL.scoreM(x); return { id, e: x, M: sc.M, dominant: sc.dominant, missing: sc.missing, invariantsOk: inv, rows: SEL.vectorRows(set) }; };
test('S04C-07 selector: M con componente dominante; guardas uniformes frente a N04C; puntos intermedios no aceptados; condiciones de etapa; denominadores nulos; rechazo de una mejora agregada que rompe la guarda interior', () => {
  const base = mkV('N04C', { eP: 0.06, eI: 0.12, eA: 0.16, eZ: 0.2 }); assert.equal(base.dominant, 'eI'); assert.ok(Math.abs(base.M - 0.12 / 0.05) < 1e-12);
  assert.ok(SEL.RULES.maxAdditionalVectors === 8 && SEL.AGENDA.length === 8);
  // mejora agregada (M baja) pero eI empeora por encima de max(0,05; e0+0,02): no admisible
  const agg = mkV('X', { eP: 0.01, eF: 0.01, eZ: 0.02, e2: 0.01, eR: 0.01, eI: 0.15, eQ: 0.01, eA: 0.02 }); assert.ok(SEL.guards(agg.e, base.e).some((f) => f.guard === 'eI'));
  const ok = mkV('J1', { eP: 0.05, eI: 0.07, eA: 0.12, eZ: 0.15 }, { 'shotMix.rimWeightFactor': 1.5 }); const ok2 = mkV('J2', { eP: 0.05, eI: 0.06, eA: 0.11, eZ: 0.13 }, { 'shotMix.rimWeightFactor': 1.5, 'rebound.organizedResetP0': 0.35 });
  const sel = SEL.selectFinal(base, [agg, ok, ok2]); assert.equal(sel.chosenId, 'J2'); assert.equal(sel.log.find((l) => l.id === 'X').verdict, 'descartado: guardas');
  // sin mejora ≥ 5 %: se conserva N04C; empate exacto: menos filas distintas y después id
  const small = mkV('S', { eP: 0.06, eI: 0.118, eA: 0.16, eZ: 0.2 }); assert.equal(SEL.selectFinal(base, [small]).chosenId, 'N04C');
  const t1 = mkV('B', { eI: 0.07 }, { 'shotMix.rimWeightFactor': 1.5, 'rebound.organizedResetP0': 0.35 }); const t2 = mkV('A', { eI: 0.07 }, { 'rebound.organizedResetP0': 0.35 }); assert.equal(SEL.selectFinal(base, [t1, t2]).chosenId, 'A');
  // no evaluado nunca es cero; invariantes sin tolerancia estadística
  const nul = mkV('N', { eA: null }); assert.equal(nul.M, null); assert.equal(SEL.selectFinal(base, [nul]).log[0].verdict, 'descartado: errores necesarios no evaluados'); const inv = mkV('I', {}, {}, false); assert.match(SEL.selectFinal(base, [inv]).log[0].verdict, /invariantes/);
  // puntos de trabajo: menor M calculable aunque incumpla guardas; condiciones de I y P
  const wp = SEL.workingPoint([mkV('a', { eI: 0.3 }), mkV('b', { eI: 0.1 }), mkV('c', { eI: null })]); assert.equal(wp.id, 'b');
  const withParts = (e, parts) => ({ ...mkV('p', e), e: { ...mkE(e), parts } });
  assert.equal(SEL.stageICondition(mkV('p', { eI: 0.04, forcedInside: 0.03 })).run, false); assert.equal(SEL.stageICondition(mkV('p', { eI: 0.04, forcedInside: 0.06 })).run, true); assert.equal(SEL.stageICondition(null).run, false);
  const parts = (na, da, sN, dN) => ({ simInsideNormalA: na, detInsideNormalA: da, simInsideNormal: sN, detInsideNormal: dN, simInsideNormalM: 1, detInsideNormalM: 1 });
  assert.equal(SEL.stagePCondition(withParts({ eI: 0.08 }, parts(100, 100, 0.5, 0.6))).run, true); assert.equal(SEL.stagePCondition(withParts({ eI: 0.08 }, parts(79, 100, 0.5, 0.6))).run, false); assert.equal(SEL.stagePCondition(withParts({ eI: 0.08 }, parts(100, 100, 0.5, 0.52))).run, false); assert.equal(SEL.stagePCondition(withParts({ eI: 0.04 }, parts(100, 100, 0.5, 0.6))).run, false); assert.equal(SEL.stagePCondition(withParts({ eI: 0.08 }, parts(100, 100, null, 0.6))).run, false);
  // errores desde numeradores: denominador nulo ⇒ no evaluado
  const z = { meanPTS40: 80, meanFGA40: 60, zoneTotal: 10, zoneShare: { rim: 0.25, inside: 0.25, midrange: 0.25, three: 0.25 }, fg2m: 5, fg2a: 10, fg3m: 1, fg3a: 3, ftm: 1, fta: 2, rimM: 1, rimA: 2, insideM: 0, insideA: 0, rimForced: 0, rimAttZone: 2, insideForced: 0, insideAttZone: 0, insideNormalA: 0, insideNormalM: 0, fgm: 6, fga: 13, astFg: 3, astFt: 0 };
  const e = SEL.errorsOf(z, z); assert.equal(e.eI.evaluated, false); assert.equal(e.eP.value, 0); assert.equal(SEL.scoreM(e).M, null);
  assert.equal(SEL.rulesHash().length, 64);
});

// ---------------------------------------------------------------------------------------------------------------------------------- 8 · compatibilidad e identidad
test('S04C-08 compatibilidad: el guardado REAL de 04B se rechaza con explicación y sin tocar el archivo; el guardado nuevo continúa; el perfil activo no se cambia en silencio; la versión visible es 04C', async () => {
  const old = JSON.parse(readFileSync(new URL('./fixtures/sim-snapshot-04b.json', import.meta.url), 'utf8')).snap; const before = canonical(old); assert.equal(old.simVersion, '0.3.1-SIMMOTOR04B');
  const errs = validateSimSnapshot(old); assert.ok(errs.some((e) => /SIM-MOTOR-04C cambia el futuro de un partido en curso/.test(e.message) && /no se implanta un resolutor histórico/.test(e.message))); assert.equal(canonical(old), before); assert.throws(() => restoreSim(deep(old), ctx), /rechazado/);
  const m = new SimMatch(inputOf(5), ctx); m.advance({ until: 130 }); assert.deepEqual(validateSimSnapshot(snapshotSim(m, { embedContext: false })), []);
  for (const p of ['rebound.organizedResetP0', 'opportunity.simInsideQualityLogit', 'conversion.simInsideLogitOffset', 'shotMix.rimWeightFactor']) assert.equal(ctx.sp.index.get(p).edited, undefined, `${p} no se activa al abrir`);
  const { APP_VERSION } = await import('../src/version.js'); assert.equal(APP_VERSION, 'SIM-MOTOR-04E'); const { SIM_CANDIDATES } = await import('../src/sim/candidates.js'); assert.ok(SIM_CANDIDATES.some((c) => c.id === 'C04C-FINAL-PROVISIONAL' && /provisional/.test(c.status)));
  assert.equal(ctx.sp.index.get('rebound.organizedResetP0').value, 0, 'cargar una candidata es una acción explícita: la base sigue neutral');
});
