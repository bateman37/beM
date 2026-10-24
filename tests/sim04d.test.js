// SIM-MOTOR-04D · atribución de la continuación inmediata, asistencia acreditada, oportunidades de rebote, seis filas nuevas (mezcla de media, offset de aro, pérdida/robo/falta, entrega espontánea), selector M04D y
// guardado/recuperación con las filas activas. Ocho grupos por riesgo con entradas fijas y pequeñas; no son campañas (la evidencia comparativa se genera con `scripts/sim04d`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { makeContext, buildReferenceInput, SimMatch, buildSimResult, SIM_VERSION } from '../src/sim/index.js';
import { playAutomatic, advanceAutomatic } from '../src/sim/coachsim.js';
import { snapshotSim, restoreSim } from '../src/sim/snapshot.js';
import { runCampaignSim } from '../src/sim/campaign-record.js';
import { validateOverrides } from '../src/sim/profile.js';
import { scaleOdds, shotProbs, finisherWeights } from '../src/sim/model.js';
import { readFileSync } from 'node:fs';
import { validateSimSnapshot } from '../src/sim/snapshot.js';
import { canonical } from '../src/sim/fp.js';
import { logit } from '../src/match/mathx.js';
import { runDetailedCampaign } from '../scripts/sim04d/detailed-worker.js';
import { buildTables, COLS, detRebOpp, detAstUniverse } from '../scripts/sim04d/tables.js';
import * as SEL from '../scripts/sim04d/select.js';

const { profile, players } = data; const ctx = makeContext(profile);
const inputOf = (seed, a = 'EQ03', b = 'EQ04') => buildReferenceInput(profile, players, a, b, { seed });
const ctxWith = (rows) => makeContext(profile, rows);
const play = (input, c = ctx) => { const m = new SimMatch(input, c); playAutomatic(m); return m; };
const fp = (m) => buildSimResult(m, { events: false }).sportFingerprint;
const FINAL04C = [{ path: 'volume.neutralSecondsPerControl', value: 19.5 }, { path: 'shotMix.threeWeightFactor', value: 0.7 }, { path: 'assist.eligibleFinalPassP0', value: 0.9 }, { path: 'energy.costPerLiveMinute', value: 3 }, { path: 'assist.receivedAdvantageP0', value: 0 }, { path: 'shotMix.rimWeightFactor', value: 1.5 }, { path: 'opportunity.simRimQualityLogit', value: 0.5 }, { path: 'rebound.organizedResetP0', value: 0.35 }, { path: 'opportunity.simInsideQualityLogit', value: 0.5 }, { path: 'conversion.simInsideLogitOffset', value: 0.3 }];
const NEUTRAL6 = [{ path: 'shotMix.midrangeWeightFactor', value: 1 }, { path: 'conversion.simRimLogitOffset', value: 0 }, { path: 'outcomes.simOrdinaryTurnoverWeightFactor', value: 1 }, { path: 'outcomes.simStealGivenEligibleTurnoverLogit', value: 0 }, { path: 'outcomes.simShootingFoulWeightFactor', value: 1 }, { path: 'assist.spontaneousPassOddsFactor', value: 1 }];
const compiled = (rows, seed = 3, mod = (i) => i) => { const c = rows ? ctxWith(rows) : ctx; const i = inputOf(seed); mod(i); const m = new SimMatch(i, c); m._prepareSides(120); m._compile(0); return m; };

// ---------------------------------------------------------------------------------------------------------------------------------- 1 · neutralidad
test('S04D-01 neutralidad: con las seis filas nuevas neutrales (por defecto o explícitas) la trayectoria es EXACTAMENTE la de 04C (huella deportiva y consumo de azar), con el perfil base y con el vector de 04C; las filas declaran unidad, origen y efecto', () => {
  // huellas y sorteos obtenidos con el CÓDIGO de 04C (commit 0dad893) para las mismas entradas
  const gold = [['default', 'EQ03', 'EQ04', 7, '58f77489aae9605a', 6102], ['default', 'EQ01', 'EQ02', 11, '556bb8ad184b7f51', 6158], ['default', 'EQ05', 'EQ09', 31, 'dea39934e71eebe5', 6024],
    ['final', 'EQ03', 'EQ04', 7, '2ba9552ed4c5904c', 5328], ['final', 'EQ01', 'EQ02', 11, '5222bd4a401f4b4b', 5223], ['final', 'EQ05', 'EQ09', 31, '9d24f589adfbd0f9', 5421]];
  for (const [which, a, b, seed, digest, draws] of gold) for (const c of [ctxWith(which === 'final' ? FINAL04C : []), ctxWith([...(which === 'final' ? FINAL04C : []), ...NEUTRAL6])]) { const m = play(inputOf(seed, a, b), c); assert.equal(fp(m), digest, `${which} ${a}-${b}: huella de 04C`); assert.equal(m.rng.draws, draws, `${which} ${a}-${b}: mismos sorteos`); }
  for (const r of NEUTRAL6) { const row = ctx.sp.index.get(r.path); assert.equal(row.value, r.value, `${r.path} neutral`); assert.ok(row.unit && row.effect && row.origin === 'SEM-SIM04D', `${r.path} declara unidad, origen y efecto`); }
  assert.equal(SIM_VERSION, '0.3.4-SIMMOTOR04E');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 2 · atribución putback / ficha
test('S04D-02 atribución: la continuación inmediata tras rebote se publica como familia `putback` (tiros, canasta con falta y libres ligados), no como ficha POS; el reinicio organizado conserva su ficha; las sumas concilian y la lectura no cambia deporte', () => {
  let putbackFga = 0; let resetShots = 0;
  for (const [seed, rows] of [[21, []], [22, []], [23, [{ path: 'rebound.organizedResetP0', value: 0.5 }]], [24, [{ path: 'rebound.organizedResetP0', value: 0.5 }]], [25, []]]) {
    const m = play(inputOf(seed, 'EQ05', 'EQ09'), ctxWith(rows)); const res = buildSimResult(m, { events: true });
    assert.equal(res.reconciliation.valid, true, res.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id).join());
    for (const k of [0, 1]) {
      const pb = res.families[k].find((f) => f.key === 'putback'); const evPb = m.events.filter((e) => e.ty === 'shot' && e.tm === k && e.ctx === 'putback'); const evFtPb = m.events.filter((e) => e.ty === 'ft' && e.tm === k && e.src === 'putback' && e.cause !== 'bonus');
      assert.equal(pb?.fga ?? 0, evPb.length, 'cada tiro de continuación inmediata está en la familia putback'); assert.equal(pb?.fta ?? 0, evFtPb.length, 'los libres ligados a un putback también');
      putbackFga += evPb.length;
      const posFga = res.families[k].filter((f) => /^POS/.test(f.key)).reduce((s, f) => s + f.fga, 0); const evPos = m.events.filter((e) => e.ty === 'shot' && e.tm === k && e.ctx === 'organized').length;
      assert.equal(posFga, evPos, 'las fichas solo suman ejecuciones organizadas reales (incluido el reinicio)');
      const sum = res.families[k].reduce((s, f) => s + f.fga, 0); assert.equal(sum, res.box.teams[k].fga, 'las familias concilian con el acta'); const shoots = res.families[k].reduce((s, f) => s + f.pts, 0); assert.equal(shoots, res.box.teams[k].pts);
      for (const e of m.events) if (e.ty === 'shot' && e.tm === k && e.cont === 'offensive_rebound' && e.ctx === 'organized') resetShots++;
    }
  }
  assert.ok(putbackFga > 10, 'el camino real produce continuaciones inmediatas'); assert.ok(resetShots > 0, 'y reinicios con ficha propia');
  // la lectura no consume ni cambia azar: misma huella que antes de corregirla (gold de 04C del grupo 1) y el mismo consumo
  assert.equal(fp(play(inputOf(7))), '58f77489aae9605a');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 3 · AST acreditada y universos
test('S04D-03 asistencia acreditada: en el detallado la AST es el crédito del acta (no el mero pasador representado); los universos total / fuera / posterior al rebote concilian en SIM y detallado y están separados', () => {
  const det = runDetailedCampaign({ case_id: 'T', input: inputOf(12, 'EQ05', 'EQ09'), attempt: 1 }); const rec = det.record ?? det; assert.equal(rec.status, 'finished');
  const e = rec.essential; const creditedN = e.acta.credits.filter((c) => c.k === 'ast' && c.type === 'canasta').length; const cols = e.shots.columns; const ix = (n) => cols.indexOf(n);
  const withPasser = e.shots.rows.filter((r) => r[ix('made')] && !r[ix('annulled')] && r[ix('passer')] != null).length;
  const { tables } = buildTables([], [{ ...rec, case_id: 'T', block: 'DEV', scenario: 's', variant: 'v', orientation: 'o', replicate: 1, resolver: 'detailed', run: 'DET', seed: 1 }]); const czq = tables.czq; const ci = (n) => COLS.czq.indexOf(n);
  assert.equal(czq.reduce((s, r) => s + (r[ci('ast_fg_credited')] ?? 0), 0), creditedN, 'la columna acreditada suma los créditos del acta'); assert.ok(withPasser >= creditedN, 'mero pasador ≥ acreditada');
  const u = detAstUniverse(e); const tot = u.reduce((s, t) => s + t.total.ast, 0); assert.equal(tot, creditedN, 'universo total = créditos del acta'); for (const t of u) { assert.equal(t.outside.fgm + t.postRebound.fgm, t.total.fgm); assert.equal(t.outside.ast + t.postRebound.ast, t.total.ast); assert.equal(t.postImmediate.fgm + t.postReset.fgm + t.postOther.fgm, t.postRebound.fgm); }
  // SIM: lo mismo con el registro de campaña (pasador sorteado = crédito causal) y reinicio activo
  const sim = runCampaignSim(ctxWith([{ path: 'rebound.organizedResetP0', value: 0.5 }]), { case_id: 'S', input: inputOf(13, 'EQ05', 'EQ09'), attempt: 1, policy: true }).record; assert.equal(sim.valid, true);
  const au = sim.diag04d.astUniverse; const astC = sim.essential.box.players.reduce((s, p) => s + p.astC, 0); assert.equal(au.reduce((s, t) => s + t.total.ast, 0), astC);
  for (const t of au) { assert.equal(t.outside.fgm + t.postRebound.fgm, t.total.fgm); assert.equal(t.outside.ast + t.postRebound.ast, t.total.ast); assert.equal(t.postImmediate.fgm + t.postReset.fgm + t.postOther.fgm, t.postRebound.fgm); }
  assert.ok(au.some((t) => t.postReset.fgm > 0), 'con reinicio activo hay canastas del reinicio');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 4 · oportunidades y créditos de rebote
test('S04D-04 rebotes: oportunidades y créditos conciliados sin duplicados (SIM) y fallos del detallado = créditos + causas de no crédito (04E: el tapón con balón vivo tiene crédito individual y el tapón fuera colectivo en ambos motores; la expiración tras fallo sigue sin crédito)', () => {
  for (const seed of [41, 42, 43]) {
    const rec = runCampaignSim(ctxWith(FINAL04C), { case_id: `r${seed}`, input: inputOf(seed, 'EQ01', 'EQ08'), attempt: 1, policy: true }).record; assert.equal(rec.valid, true);
    const rebs = rec.essential.box.teams.reduce((s, t) => s + t.oreb + t.dreb + t.teamReb[0] + t.teamReb[1], 0); let credits = 0;
    for (const k of [0, 1]) {
      const o = rec.diag04d.rebOpp[k]; const sum = (cause) => Object.entries(o.credits).filter(([key]) => key.startsWith(`${cause}|`)).reduce((s, [, v]) => s + v, 0);
      assert.equal(sum('field'), o.fgMiss, 'cada fallo de campo sin tapón tiene exactamente un crédito de rebote'); assert.equal(sum('block'), o.blockedLive, 'cada tapón con balón vivo, un crédito (criterio de SIM)'); assert.equal(sum('block_out_of_bounds'), o.blockedOob, 'cada tapón fuera, un crédito colectivo ofensivo (04E)'); assert.equal(o.credits['block_out_of_bounds|off|coll'] ?? 0, o.blockedOob); assert.equal(o.blocked, o.blockedOob + o.blockedLive); assert.equal(sum('ft'), o.ftLastMiss, 'cada último libre fallado, un crédito');
      credits += sum('field') + sum('block') + sum('block_out_of_bounds') + sum('ft');
    }
    assert.equal(credits, rebs, 'sin créditos duplicados ni huérfanos');
  }
  const det = runDetailedCampaign({ case_id: 'D', input: inputOf(14, 'EQ01', 'EQ08'), attempt: 1 }); const rec = det.record ?? det; const opp = detRebOpp(rec.essential);
  for (const o of opp) { const credited = Object.entries(o.credits).filter(([k]) => !k.startsWith('ft|')).reduce((s, [, v]) => s + v, 0); const unc = Object.values(o.unc).reduce((s, v) => s + v, 0); assert.equal(o.fgMiss + o.blocked, credited + unc, 'fallos de campo = créditos + causas sin crédito'); const blk = (o.credits['block|def|ind'] ?? 0) + (o.credits['block|off|ind'] ?? 0) + (o.credits['block|off|coll'] ?? 0); assert.equal(blk, o.blocked, 'SIM-MOTOR-04E: el detallado acredita rebote tras tapón (individual con balón vivo, colectivo si sale fuera)'); }
});

// ---------------------------------------------------------------------------------------------------------------------------------- 5 · mezcla de media distancia y offset de aro
test('S04D-05 mezcla y aro: la media distancia se pondera UNA vez por contexto conservando su masa, sin crear celdas; el offset de aro desplaza el logit exactamente una vez, la estimación de decisión lo ve, y inside, media y triple quedan intactos', () => {
  const neut = (i) => { for (const t of i.teams) t.plan.defStyles.protection = 3; };
  const base = compiled(null, 3, neut); const f = 0.5; const down = compiled([{ path: 'shotMix.midrangeWeightFactor', value: f }], 3, neut);
  for (const k of [0, 1]) for (const pred of [(c) => c.kind === 'play', (c) => c.kind === 'trans', (c) => c.kind === 'spont']) {
    const b = base.sides[k].cells.filter(pred); const u = down.sides[k].cells.filter(pred); const mass = (xs) => xs.reduce((s, c) => s + c.w, 0); const mid = (xs) => xs.filter((c) => c.cell.zone === 'midrange').reduce((s, c) => s + c.w, 0);
    assert.ok(Math.abs(mass(b) - mass(u)) < 1e-12, 'masa del contexto conservada'); const mb = mid(b); const mu = mid(u); const tb = mass(b);
    if (mb > 0 && mb < tb) assert.ok(Math.abs(mu / (mass(u) - mu) - f * mb / (tb - mb)) < 1e-9, 'razón media/resto multiplicada exactamente una vez'); b.forEach((c, i) => { if (c.w === 0) assert.equal(u[i].w, 0, 'no se crean celdas de media'); });
    // la respuesta relativa entre celdas que no son de media se conserva (mismas razones)
    const nb = b.filter((c) => c.cell.zone !== 'midrange' && c.w > 0); const nu = u.filter((c) => c.cell.zone !== 'midrange' && c.w > 0); if (nb.length > 1) assert.ok(Math.abs(nb[0].w / nb[1].w - nu[0].w / nu[1].w) < 1e-9, 'razones entre el resto conservadas');
  }
  // offset de aro: sobre `shotProbs` real; inside/media/triple idénticos; el logit de la probabilidad base sube exactamente el offset
  const off = 0.15; const m0 = compiled(null); const m1 = compiled([{ path: 'conversion.simRimLogitOffset', value: off }]); const cell0 = m0.sides[0].cells.find((c) => c.w > 0 && c.cell.zone === 'rim'); const shooter = m0.sides[0].view.players[0]; const M0 = m0.sides[0].M; const M1 = m1.sides[0].M;
  const probe = (m, M, zone) => { const cell = m.sides[0].cells.find((c) => c.cell.zone === zone && c.w > 0); const info = { cell: { ...cell.cell, moved: false }, kind: cell.kind }; return shotProbs(m.S, m.T, m.sides, 0, M, info, shooter, 1, zone); };
  for (const z of ['rim', 'inside', 'midrange', 'three']) { const a = probe(m0, M0, z); const b = probe(m1, M1, z); if (z === 'rim') { assert.ok(Math.abs((logit(b.pBase) - logit(a.pBase)) - off) < 1e-9, 'el logit del aro sube exactamente el offset, una vez'); assert.equal(b.dIn, off); } else assert.equal(b.pBase, a.pBase, `${z} intacto`); }
  {
    // estimación previa de la decisión: la misma traducción entra UNA vez en `pEst` de las celdas de aro; inside, media y triple no la reciben
    const pEstOf = (m, zone) => { const c = m.sides[0].cells.find((x) => x.kind === 'play' && x.cell.zone === zone && x.w > 0); const side = m.sides[0]; const comp = side.plan._c; return finisherWeights(m.S, m.T, side.view, m.T.plays[c.cell.playId], { ...c.cell, kind: 'play' }, side.plan, comp).pEst; };
    assert.ok(pEstOf(m1, 'rim') > pEstOf(m0, 'rim'), 'la decisión ve el offset del aro'); for (const z of ['inside', 'midrange', 'three']) assert.equal(pEstOf(m1, z), pEstOf(m0, z), `${z}: estimación intacta`);
    const bad = (rows) => validateOverrides(ctx.sp, rows).map((e) => `${e.path}: ${e.message}`);
    assert.deepEqual(bad(NEUTRAL6), []); assert.ok(bad([{ path: 'conversion.simRimLogitOffset', value: 0.3 }]).some((x) => /desplazamiento/.test(x))); assert.ok(bad([{ path: 'shotMix.midrangeWeightFactor', value: 0.2 }]).length); assert.ok(bad([{ path: 'assist.spontaneousPassOddsFactor', value: 0.9 }]).length);
    assert.ok(bad([{ path: 'outcomes.simShootingFoulWeightFactor', value: 1.4 }]).length); assert.ok(bad([{ path: 'outcomes.simOrdinaryTurnoverWeightFactor', value: 1.3 }]).length); assert.ok(bad([{ path: 'outcomes.simStealGivenEligibleTurnoverLogit', value: 1.1 }]).length); assert.deepEqual(bad([{ path: 'assist.receivedAdvantageP0', value: 1 }]), [], '04D reabre la ventaja recibida en [0, 1]');
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------- 6 · pérdida, robo, falta y entrega espontánea
test('S04D-06 terminales y entrega: la pérdida ordinaria y la falta en tiro reponderan los terminales normalizados; el robo desplaza solo el reparto condicionado y solo existe en pérdidas elegibles con autor válido; la entrega espontánea escala odds sin pasador propio ni efecto en transición', () => {
  const sumTerm = (M) => Object.values(M.term).reduce((a, b) => a + b, 0);
  const b0 = compiled(null); const to = compiled([{ path: 'outcomes.simOrdinaryTurnoverWeightFactor', value: 0.6 }]); const sf = compiled([{ path: 'outcomes.simShootingFoulWeightFactor', value: 1.3 }]); const st = compiled([{ path: 'outcomes.simStealGivenEligibleTurnoverLogit', value: 1 }]);
  for (const k of [0, 1]) {
    const A = b0.sides[k].M; assert.ok(Math.abs(sumTerm(A) - 1) < 1e-12); for (const m of [to, sf, st]) assert.ok(Math.abs(sumTerm(m.sides[k].M) - 1) < 1e-12, 'terminales normalizados');
    assert.ok(to.sides[k].M.term.to < A.term.to, 'menos pérdida ordinaria'); assert.ok(to.sides[k].M.term.fs > A.term.fs, 'el resto de terminales absorbe la masa');
    assert.ok(sf.sides[k].M.term.sf > A.term.sf, 'más falta en tiro'); assert.ok(sf.sides[k].M.dnRatio < A.dnRatio, 'la razón de faltas no terminales se recalcula con el nuevo total'); assert.ok(Math.abs(sf.sides[k].M.term.of / sf.sides[k].M.term.bv - A.term.of / A.term.bv) < 1e-9, 'otros terminales conservan su razón');
    assert.ok(Math.abs(logit(st.sides[k].M.pSteal) - logit(A.pSteal) - 1) < 1e-9, 'el robo condicionado sube exactamente el offset'); assert.equal(st.sides[k].M.term.to, A.term.to, 'no cambia la incidencia de pérdida');
  }
  // camino real: el robo solo cuelga de pérdidas elegibles (to/lb), con autor del rival, y cada pérdida tiene a lo sumo un crédito; sin pasador propio en espontáneo y AST no añadida directamente
  const vec = ctxWith([{ path: 'outcomes.simStealGivenEligibleTurnoverLogit', value: 0.9 }, { path: 'assist.spontaneousPassOddsFactor', value: 2 }, { path: 'outcomes.simOrdinaryTurnoverWeightFactor', value: 0.85 }, { path: 'outcomes.simShootingFoulWeightFactor', value: 1.2 }]);
  let steals = 0; let spont = 0; let spontPass = 0;
  for (const seed of [51, 52, 53, 54]) {
    const m = play(inputOf(seed, 'EQ02', 'EQ10'), vec); const res = buildSimResult(m, { events: true }); assert.equal(res.reconciliation.valid, true, res.reconciliation.checks.filter((c) => !c.ok).map((c) => c.id).join());
    const byId = (id) => m.teams.findIndex((t) => t.byId[id]);
    for (const e of m.events) {
      if (e.ty === 'tov' && e.sub === 'steal') { steals++; assert.ok(e.kind === 'to' || e.kind === 'lb', 'solo pérdida elegible'); assert.equal(byId(e.stl), 1 - e.tm, 'autor del rival'); }
      if (e.ty === 'tov' && (e.kind === 'of' || e.kind === 'bv')) assert.equal(e.stl, null, 'falta ofensiva y violación no son robo');
      if (e.ty === 'shot' && e.ctx === 'spontaneous') { spont++; if (e.passer) { spontPass++; assert.notEqual(e.passer, e.pl, 'el pasador es un compañero distinto del tirador'); assert.equal(byId(e.passer), e.tm); } }
      if (e.ty === 'shot' && e.ctx === 'putback') assert.equal(e.passer, null, 'la continuación no hereda pase'); if (e.ty === 'shot' && e.ctx === 'spontaneous' && !e.elig) assert.equal(e.passer, null);
    }
    const ast = res.box.players.reduce((s, p) => s + p.astC + p.astL, 0); const made = m.events.filter((e) => e.ty === 'shot' && e.made && e.passer).length + m.events.filter((e) => e.ty === 'ft' && e.assist).length; assert.equal(ast, made, 'la AST sigue siendo causal: ningún crédito fabricado');
  }
  assert.ok(steals > 5 && spont > 5 && spontPass > 0);
  // odds: factor 1 identidad; extremos 0/1 intactos; odds' = odds × factor
  assert.equal(scaleOdds(0.3, 1), 0.3); assert.equal(scaleOdds(0, 2), 0); assert.equal(scaleOdds(1, 2), 1); const p = 0.4; const q = scaleOdds(p, 2); assert.ok(Math.abs(q / (1 - q) - 2 * p / (1 - p)) < 1e-12);
  // la transición conserva su probabilidad de entrega y solo la espontánea la escala
  const s0 = compiled(null); const s2 = compiled([{ path: 'assist.spontaneousPassOddsFactor', value: 2 }]); for (const k of [0, 1]) { const tr0 = s0.sides[k].cells.filter((c) => c.kind === 'trans')[0].cell.passShare; const tr2 = s2.sides[k].cells.filter((c) => c.kind === 'trans')[0].cell.passShare; assert.equal(tr0, tr2); const sp0 = s0.sides[k].cells.filter((c) => c.kind === 'spont')[0].cell.passShare; const sp2 = s2.sides[k].cells.filter((c) => c.kind === 'spont')[0].cell.passShare; assert.ok(sp2 > sp0); }
});

// ---------------------------------------------------------------------------------------------------------------------------------- 7 · selector M04D
const mkPop = (o = {}) => { const counts = Object.fromEntries(SEL.COUNTS.map((c) => [c.id, { mean40: o[c.id] ?? 10, meanReal: o[c.id] ?? 10, meanNoOT: o[c.id] ?? 10 }])); const sums = { fgm: 100, fga: 200, fg2m: 60, fg2a: 120, fg3m: 40, fg3a: 80, ftm: 50, fta: 70, rim_m: 40, rim_a: 70, inside_m: 20, inside_a: 40, midrange_m: 5, midrange_a: 20, three_m: 40, three_a: 70, oreb_total: 1, dreb_total: 1, ast_fg: 1, ast_ft: 1, ast_total: 1, ...o.sums }; return { n: 96, games: 48, counts, sums, forced: { rim: { att: 70, forced: 7 }, inside: { att: 40, forced: 4 }, ...o.forced } }; };
test('S04D-07 selector: bandas relativas (conteos) frente a puntos porcentuales (acierto), sin denominador, control único, vectores completos y rechazo de una mejora agregada que daña una métrica ya dentro de banda', () => {
  const det = mkPop(); const e0 = SEL.errorsOf(mkPop({ pts: 10.4 }), det); const pts = e0.find((e) => e.id === 'pts'); assert.ok(Math.abs(pts.error - 0.04) < 1e-12 && pts.band === 0.05, '80 → 76–84 como ±5 % relativo');
  const rateOk = SEL.errorsOf(mkPop({ sums: { fg3m: 0.63 * 80 } }), mkPop({ sums: { fg3m: 0.6 * 80 } })).find((e) => e.id === 'three_pct'); assert.ok(Math.abs(rateOk.error - 0.03) < 1e-9 && rateOk.band === 0.03, '60 % → 57–63 %: ±3 pp, no ±3 % relativo');
  // sin denominador y ceros
  const zero = mkPop({ blk: 0 }); const z1 = SEL.errorsOf(zero, zero).find((e) => e.id === 'blk'); assert.equal(z1.status, 'ceros_iguales'); assert.equal(z1.error, 0); const z2 = SEL.errorsOf(mkPop({ blk: 1 }), zero).find((e) => e.id === 'blk'); assert.equal(z2.status, 'no_evaluado_relativo'); assert.equal(z2.error, null); assert.ok(SEL.scoreM(SEL.errorsOf(mkPop({ blk: 1 }), zero)).M === null, 'una métrica no evaluable impide M04D (no se aprueba por omisión)');
  const noDen = SEL.errorsOf(mkPop({ sums: { fga: 0 } }), det); assert.equal(noDen.find((e) => e.id === 'fg_pct').status, 'sin_denominador');
  // M04D = máximo (no suma) y comparable sin rebotes
  const sim = mkPop({ pts: 11, oreb: 13 }); const errs = SEL.errorsOf(sim, det); const both = SEL.scoreBoth(errs); assert.ok(Math.abs(both.full.M - 0.3 / 0.05) < 1e-9 && both.full.dominant === 'oreb'); assert.ok(Math.abs(both.comparable.M - 0.1 / 0.05) < 1e-9 && both.comparable.dominant === 'pts'); assert.equal(both.comparable.comps.some((c) => /reb/.test(c.id)), false);
  // guardas y selección sobre el mismo control: una mejora agregada que daña una métrica ya dentro de banda se rechaza
  const control = { id: SEL.CONTROL_ID, errs: SEL.errorsOf(mkPop({ pts: 11.5, stl: 10.2 }), det) }; const good = SEL.errorsOf(mkPop({ pts: 10.2, stl: 10.3 }), det); const harm = SEL.errorsOf(mkPop({ pts: 10.0, stl: 10.8 }), det);
  assert.ok(SEL.guardsOf(control.errs, good).ok); const gh = SEL.guardsOf(control.errs, harm); assert.equal(gh.ok, false); assert.ok(gh.fails.some((f) => f.id === 'stl'), 'robos pasaba de 2 % a 8 %: supera max(5 %; 2 %+2 %)');
  const sel = SEL.selectFinal(control, [{ id: 'Z1-A0', errs: harm, invariantsOk: true }, { id: 'Z2-A0', errs: good, invariantsOk: true }]); assert.equal(sel.chosenId, 'Z2-A0'); assert.equal(sel.rows.find((r) => r.id === 'Z1-A0').admissible, false);
  const keep = SEL.selectFinal(control, [{ id: 'Z1-A0', errs: harm, invariantsOk: true }]); assert.equal(keep.kept, true); assert.equal(keep.chosenId, SEL.CONTROL_ID);
  const marginal = SEL.selectFinal({ id: SEL.CONTROL_ID, errs: SEL.errorsOf(mkPop({ pts: 10.5 }), det) }, [{ id: 'Z1-A0', errs: SEL.errorsOf(mkPop({ pts: 10.49 }), det), invariantsOk: true }]); assert.equal(marginal.kept, true, 'sin mejora relativa ≥ 5 % se conserva el control');
  const inval = SEL.selectFinal(control, [{ id: 'Z2-A0', errs: good, invariantsOk: false }]); assert.equal(inval.kept, true, 'un vector con casos no válidos no es admisible');
  // vectores: 36 completos, control único y propiedades de la parrilla
  assert.equal(SEL.VECTORS.length, 36); assert.equal(new Set(SEL.VECTORS.map((v) => v.id)).size, 36); assert.ok(SEL.VECTORS.every((v) => v.overrides.length === SEL.FIXED.length + SEL.ROWS.length)); assert.equal(SEL.rowsChanged(SEL.vectorById('Z0-A0')), 0); assert.equal(SEL.distance(SEL.vectorById('Z0-A0')), 0);
  const ctl = SEL.vectorById('Z0-A0'); assert.deepEqual(Object.fromEntries(ctl.overrides.map((o) => [o.path, o.value])), { 'volume.neutralSecondsPerControl': 19.5, 'assist.eligibleFinalPassP0': 0.9, 'energy.costPerLiveMinute': 3, 'opportunity.simRimQualityLogit': 0.5, 'opportunity.simInsideQualityLogit': 0.5, 'conversion.simInsideLogitOffset': 0.3, 'shotMix.rimWeightFactor': 1.5, 'rebound.organizedResetP0': 0.35, 'shotMix.midrangeWeightFactor': 1, 'shotMix.threeWeightFactor': 0.7, 'conversion.simRimLogitOffset': 0, 'assist.receivedAdvantageP0': 0, 'assist.spontaneousPassOddsFactor': 1, 'outcomes.simOrdinaryTurnoverWeightFactor': 1, 'outcomes.simStealGivenEligibleTurnoverLogit': 0, 'outcomes.simShootingFoulWeightFactor': 1 });
  for (const v of SEL.VECTORS) assert.deepEqual(validateOverrides(ctx.sp, v.overrides), [], `${v.id} es una candidata válida`);
  // desempate: menos filas, menor distancia, id lexicográfico
  const eq = SEL.errorsOf(mkPop({ pts: 10.2 }), det); const tie = SEL.selectFinal(control, [{ id: 'Z8-A3', errs: eq, invariantsOk: true }, { id: 'Z1-A0', errs: eq, invariantsOk: true }, { id: 'Z2-A0', errs: eq, invariantsOk: true }]); assert.equal(tie.chosenId, 'Z1-A0', 'menos filas (5) y menor distancia (reinicio 0,65 frente a 0,85)');
});

// ---------------------------------------------------------------------------------------------------------------------------------- 8 · guardado/recuperación y público con las filas activas
test('S04D-08 con las filas nuevas ACTIVAS: guardar/recuperar con sufijo privado conserva la huella; el público no ve el futuro; un guardado de 04C se rechaza con explicación y sin tocarse', () => {
  const rows = [...FINAL04C, { path: 'shotMix.midrangeWeightFactor', value: 0.7 }, { path: 'conversion.simRimLogitOffset', value: 0.15 }, { path: 'outcomes.simOrdinaryTurnoverWeightFactor', value: 0.85 }, { path: 'outcomes.simStealGivenEligibleTurnoverLogit', value: 0.7 }, { path: 'outcomes.simShootingFoulWeightFactor', value: 1.1 }, { path: 'assist.spontaneousPassOddsFactor', value: 1.5 }, { path: 'assist.receivedAdvantageP0', value: 0.5 }];
  const c = ctxWith(rows); const input = inputOf(61, 'EQ02', 'EQ10'); const ref = play(input, c); const m = new SimMatch(input, c); advanceAutomatic(m, { until: 900 });
  const pub = buildSimResult(m, { events: false, audience: 'public' }); assert.ok(pub.published <= 900 + 1e-6 && pub.score.current[0] + pub.score.current[1] <= buildSimResult(ref, { events: false }).score.current[0] + buildSimResult(ref, { events: false }).score.current[1], 'el público no ve el futuro');
  const snap = JSON.parse(JSON.stringify(snapshotSim(m, { embedContext: false }))); const back = restoreSim(snap, c, { matchId: 'x' }); advanceAutomatic(back, { until: 'end' }); assert.equal(fp(back), fp(ref), 'guardar y recuperar no cambia la trayectoria con las filas activas');
  assert.equal(back.rng.draws, ref.rng.draws);
  const old = JSON.parse(readFileSync(new URL('./fixtures/sim-snapshot-04c.json', import.meta.url), 'utf8')).snap; const before = canonical(old); assert.equal(old.simVersion, '0.3.2-SIMMOTOR04C');
  const errs = validateSimSnapshot(old); assert.ok(errs.some((e) => /SIM-MOTOR-04D añade seis filas SIM/.test(e.message) && /no se implanta un resolutor histórico/.test(e.message)), errs.map((e) => e.message).join('|')); assert.equal(canonical(old), before, 'el archivo no se toca');
  assert.throws(() => restoreSim(JSON.parse(JSON.stringify(old)), c), /rechazado/); assert.deepEqual(validateSimSnapshot(snap), [], 'el guardado de 04D continúa');
});
