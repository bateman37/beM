// MOTOR-18B §11.2: tabla L18B (cálculo puro, SIN partidos nuevos) y lectura «Polivalencia antes/después». Cada fila declara entradas, salidas, valor esperado (de la fórmula o de la tabla del encargo), tolerancia y comprobación.
// L18 (MOTOR-18) se conserva como tabla HISTÓRICA con el perfil de MOTOR-18; L18B usa el perfil de MOTOR-18B y, para «antes», el de MOTOR-18. Constantes: de `profile.familiarity` (SEM18/SEM18B).
// Uso: node scripts/m18b-l18b-table.js [--out=out/motor18b/rapido] [--docs=docs/tecnico/evidencia-motor18b/l18b]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import * as L from '../src/learning/index.js';
import * as K from '../src/knowledge/model.js';
import { createMatch, deepCopy } from '../src/match/index.js';
import { buildMatchInput } from '../src/match/index.js';
import { prepInputOf, matchSourceOf } from '../src/lab/prep-source.js';
import * as M from '../src/lab/learning-model.js';

const near = (a, b, t) => Math.abs(a - b) <= t;
const coachOf = (P, t = 16, m = 16) => ({ teaching: t, tacticalMastery: Object.fromEntries(K.idsOf('tactic', P).map((i) => [i, m])) });
const uniform = (P, level, day = 0) => { const b = K.allMastered(P, day); for (const d of K.DOMAINS) for (const id of K.idsOf(d, P)) b[K.BLOCK_FIELD[d]][id] = K.makeEntry(level, day); return b; };
const team = (P, blocks, tl = 16, coach = coachOf(P), day = 0) => { const r = L.createTeamState({ instanceId: 'T-L18B', players: Object.fromEntries(Object.entries(blocks).map(([k, b]) => [k, { block: b, tacticalLearning: tl }])), coach, day }, P); if (!r.ok) throw new Error(JSON.stringify(r.errors)); return r.state; };

// Ejemplo de referencia (§3.4): objetivo tactic:ORG02, K=12, peak=12, 1 hora equivalente EFECTIVA al objetivo, teaching 16, competencia 16, relacionados en 12, tasa táctica.
const F2 = (P, tl) => L.factorsFor({ domain: 'tactic', id: 'ORG02', block: uniform(P, 12), tacticalLearning: tl, coach: coachOf(P), params: P });
const TABLE_34 = [[1, 0.75, 0.25, 12.4451195113, 12.1496132881], [8, 0.8706896552, 0.5, 12.5157125829, 12.2979830131], [12, 0.9396551724, 0.75, 12.5559239538, 12.4451195113], [16, 1.0086206897, 1, 12.5960428442, 12.5910330331],
  [20, 1.0775862069, 1.5, 12.6360694669, 12.8792317238], [24, 1.1465517241, 2, 12.6760040341, 13.1626593971], [30, 1.25, 2.5, 12.7357337437, 13.4413950352]];

export function polivalenciaAntesDespues(p18, p18b) {
  const P0 = p18.familiarity; const P = p18b.familiarity; const rows = []; const G = {}; const gain = {};
  for (const [tl, fOld, fNew, kOld, kNew] of TABLE_34) {
    const a = F2(P0, tl); const b = F2(P, tl); const ra = L.learnClosed({ level: 12, peak: 12, dose: 1, rate: P0.learning.rates.tactic, F: a.product, params: P0 }); const rb = L.learnClosed({ level: 12, peak: 12, dose: 1, rate: P.learning.rates.tactic, F: b.product, params: P });
    G[tl] = rb.G; gain[tl] = rb.level - 12;
    rows.push({ polivalencia: tl, factor_anterior: a.player, factor_nuevo: b.player, factor_anterior_tabla: fOld, factor_nuevo_tabla: fNew, teaching: a.teaching, contenido: a.content, transferencia: b.transfer, producto_anterior: a.product, producto_nuevo: b.product, G_anterior: ra.G, G_nuevo: rb.G,
      K_final_anterior: ra.level, K_final_nuevo: rb.level, K_final_anterior_tabla: kOld, K_final_nuevo_tabla: kNew, ganancia_anterior: ra.level - 12, ganancia_nueva: rb.level - 12, ok: near(a.player, fOld, 1e-9) && near(b.player, fNew, 1e-12) && near(ra.level, kOld, 2e-9) && near(rb.level, kNew, 2e-9) });
  }
  const need = (tl) => L.doseToReach({ level: 12, peak: 12, target: 18, rate: P.learning.rates.tactic, F: F2(P, tl).product, params: P });
  const dose = [8, 16, 24].map((tl) => ({ polivalencia: tl, dosis_efectiva_necesaria_h_eq: need(tl), referencia_encargo: { 8: 24.289281, 16: 12.14464, 24: 6.07232 }[tl] }));
  return { unit: 'dosis eficaz en horas equivalentes dirigidas al OBJETIVO (no es una sesión total repartida 60/40); factores constantes salvo la Polivalencia',
    scenario: { target: 'tactic:ORG02', level: 12, peak: 12, dose_h_eq: 1, teaching: 16, content_mastery: 16, related_levels: 12, rate: P.learning.rates.tactic, transfer: '1 + 0,5·11/29', no_relearning: true },
    anchors: P.learning.factors.player.points, curve_kind: P.learning.factors.player.kind, anterior_model: P0.learning.factors.player, formula: 'fJugador(P) = Fa + (Fb − Fa)·(P − Pa)/(Pb − Pa) entre anclajes consecutivos; extremos exactos', rows,
    ratios: { G24_over_G8: G[24] / G[8], expected_G_ratio: 4, gain24_over_gain8: gain[24] / gain[8], expected_gain_ratio: 3.901764, note: 'cociente 4 en G, no en la ganancia absoluta: actúan la cercanía a 30 y el reaprendizaje' },
    dose_to_reach_K12_to_K18: dose, dose_ratio_P8_over_P24: need(8) / need(24), dose_note: 'comparación controlada de producto con factores constantes; no es una promesa de días de entrenamiento real' };
}

export function buildL18B(p18, p18b) {
  const P0 = p18.familiarity; const P = p18b.familiarity; const rows = []; const add = (id, title, inputs, outputs, tolerance, checks) => rows.push({ id, title, inputs, outputs, tolerance, checks, ok: Object.values(checks).every(Boolean) });
  const pf = (x) => K.playerFactor(x, P).factor; const pad = polivalenciaAntesDespues(p18, p18b);
  // L18B-01
  let mono = true; let cont = true; let prev = null; for (let x = 1; x <= 30; x += 0.125) { const f = pf(x); if (prev != null) { if (f < prev - 1e-12) mono = false; if (f - prev > 0.0625 + 1e-9) cont = false; } prev = f; }
  const thrown = [NaN, undefined, null, 0, 31].map((v) => { try { K.playerFactor(v, P); return false; } catch (e) { return e instanceof RangeError; } });
  add('L18B-01', 'Anclajes exactos, P12 y P20 interpolados, continuidad y monotonía; entradas inválidas = error localizado', { anchors: P.learning.factors.player.points, probes: [1, 8, 12, 16, 20, 24, 30] }, { factors: [1, 8, 12, 16, 20, 24, 30].map(pf) }, 'exacto en anclajes; 1e-12 interpolados',
    { anclajes_exactos: [[1, 0.25], [8, 0.5], [16, 1], [24, 2], [30, 2.5]].every(([x, f]) => pf(x) === f), p12: near(pf(12), 0.75, 1e-12), p20: near(pf(20), 1.5, 1e-12), monotona: mono, continua: cont, invalidas_rechazadas: thrown.every(Boolean), modelo_lineal_anterior_conservado: near(K.playerFactor(16, P0).factor, 0.75 + 0.5 * (15 / 29), 1e-12) });
  // L18B-02
  add('L18B-02', 'Ejemplo ORG02 (K12, 1 h-eq): siete niveles de P, antes y nuevo; G24/G8 = 4', { example: pad.scenario }, { rows: pad.rows.map((r) => ({ P: r.polivalencia, K_anterior: r.K_final_anterior, K_nuevo: r.K_final_nuevo })), ratios: pad.ratios }, '2e-9 en K; 1e-12 en cocientes',
    { siete_niveles: pad.rows.every((r) => r.ok), G_ratio_4: near(pad.ratios.G24_over_G8, 4, 1e-12), ganancia_ratio_3_901764: near(pad.ratios.gain24_over_gain8, 3.901764, 1e-6), no_es_4_en_ganancia: pad.ratios.gain24_over_gain8 < 4 });
  // L18B-03
  const d = pad.dose_to_reach_K12_to_K18; add('L18B-03', 'Dosis eficaz necesaria K12→K18 con factores constantes: P8 necesita 4× la de P24', { from: 12, to: 18, peak: 12 }, { doses: d, ratio: pad.dose_ratio_P8_over_P24 }, '1e-6 h-eq',
    { p8: near(d[0].dosis_efectiva_necesaria_h_eq, 24.289281, 1e-6), p16: near(d[1].dosis_efectiva_necesaria_h_eq, 12.14464, 1e-6), p24: near(d[2].dosis_efectiva_necesaria_h_eq, 6.07232, 1e-6), cociente_4: near(pad.dose_ratio_P8_over_P24, 4, 1e-12),
      coincide_con_la_ganancia: near(L.learnClosed({ level: 12, peak: 12, dose: d[1].dosis_efectiva_necesaria_h_eq, rate: 0.8, F: F2(P, 16).product, params: P }).level, 18, 1e-9) });
  // L18B-04
  const full = { liveTenths: 24000, positions: { PG: 24000 }, offensiveRoles: { O01: 24000 }, defensiveRoles: { D01: 24000 }, modules: { ORG02: 1 } }; const seenDomains = new Set(); let uniformFactor = true;
  for (const tl of [8, 16, 24]) { const st = team(P, { a: uniform(P, 12) }, tl); const s = L.proposeFromSession(st, { source_id: `S${tl}`, collectiveFocus: 'ORG02', players: { a: { hours: 2, individualFocus: { domain: 'position', id: 'PG' } } } }, P); const m = L.proposeFromMatch(st, { complete: true, match: { source_id: `M${tl}` }, players: { a: full } }, P);
    for (const t of [...s.players.a.targets, ...m.players.a.targets]) { seenDomains.add(t.key.split(':')[0]); if (!near(t.factors.player, pf(tl), 1e-12)) uniformFactor = false; } }
  add('L18B-04', 'El factor se consume igual en los cuatro dominios y en fuentes de sesión y de partido; no cambia ninguna capacidad', { polivalencias: [8, 16, 24], fuentes: ['sesion', 'partido'] }, { dominios: [...seenDomains].sort() }, '1e-12', { cuatro_dominios: seenDomains.size === 4, mismo_factor: uniformFactor, solo_conocimiento_y_presupuestos: JSON.stringify(Object.keys(team(P, { a: uniform(P, 12) }).players.a).sort()) === JSON.stringify(['block', 'closedDays', 'ledger', 'tacticalLearning']) });
  // L18B-05
  const F24 = F2(P, 24).product; const run = (level, peak, dose) => L.learnClosed({ level, peak, dose, rate: 0.8, F: F24, params: P }); const cut = run(19.5, 20, 6); let additive = true; for (const [lv, pk, dd] of [[12, 12, 4], [10, 20, 8], [26, 30, 2]]) { const h = run(lv, pk, dd / 2); if (!near(run(lv, pk, dd).level, run(h.level, h.peak, dd / 2).level, 1e-12)) additive = false; }
  add('L18B-05', 'Reaprendizaje solo hasta el peak; dividir la dosis con factores constantes no cambia el resultado (curva nueva incluida)', { P: 24, casos: ['10→peak 20', '19,5→peak 20', '20→peak 20'] }, { recortado: { dosisAcelerada: cut.acceleratedDose, dosisNormal: cut.normalDose, nivel: cut.level } }, '1e-12',
    { acelera_hasta_el_peak: cut.acceleratedDose < 6 && cut.level > 20, G_coherente: near(cut.G, 0.8 * F24 * (2 * cut.acceleratedDose + cut.normalDose), 1e-12), sin_reaprendizaje_si_nivel_igual_peak: run(20, 20, 2).acceleratedDose === 0, aditiva: additive });
  // L18B-06
  const lo = L.advanceTeam(team(P, { a: uniform(P, 30) }, 8), 3650, P).state; const hi = L.advanceTeam(team(P, { a: uniform(P, 30) }, 30), 3650, P).state;
  add('L18B-06', 'Posición 30, peak 30 y 3.650 días sin practicar: 26,4; la Polivalencia no cambia desuso ni suelo', { dias: 3650, polivalencias: [8, 30] }, { posicion_PG: lo.players.a.block.positions.PG.level, tactica_ORG02: lo.players.a.block.tactics.ORG02.level }, '1e-9',
    { posicion_26_4: near(lo.players.a.block.positions.PG.level, 26.4, 1e-9), tactica_suelo_18: near(lo.players.a.block.tactics.ORG02.level, 18, 1e-9), polivalencia_no_cambia: JSON.stringify(lo.players.a.block) === JSON.stringify(hi.players.a.block) });
  // L18B-07
  const st7 = team(P, { a: uniform(P, 12), b: uniform(P, 12) }); const before = JSON.stringify(st7); const base = { source_id: 'S1', collectiveFocus: 'ORG02', players: { a: { hours: 4, individualFocus: { domain: 'position', id: 'PG' } } } };
  const bad = { 'colectivo 2 / individual −1': { ...base, shares: { collective: 2, individual: -1 } }, 'reparto NaN': { ...base, shares: { collective: NaN, individual: NaN } }, 'fuente vacía': { ...base, source_id: '' }, 'horas NaN': { ...base, players: { a: { hours: NaN } } }, 'sin jugadores': { ...base, players: {} }, 'jugador ajeno': { ...base, players: { z: { hours: 1 } } } };
  const rej = Object.fromEntries(Object.entries(bad).map(([k, v]) => { const r = L.proposeFromSession(st7, v, P); return [k, { rechazada: r.ok === false, errores: (r.errors ?? []).map((e) => `${e.path}: ${e.message}`) }]; }));
  const s1 = L.proposeFromSession(st7, base, P); const a1 = L.applyProposal(st7, L.createLedger(), s1, P); const s2 = L.proposeFromSession(a1.state, { ...base, source_id: 'S2' }, P);
  add('L18B-07', 'Repartos inválidos, no finitos y fuentes vacías rechazados sin cambiar el estado; presupuestos diarios conservados', { casos: Object.keys(bad) }, { rechazos: rej, horas_primera_sesion: s1.players.a.hours.used, horas_segunda_el_mismo_dia: s2.players.a.hours.used }, 'exacto',
    { todas_rechazadas: Object.values(rej).every((x) => x.rechazada && x.errores.length), estado_intacto: JSON.stringify(st7) === before, presupuesto_4h: s1.players.a.hours.used === 4 && s2.players.a.hours.used === 0 && s2.players.a.hours.clampedByDailyBudget === true });
  // L18B-08
  const st8 = team(P, { a: uniform(P, 12) }); const mk = (x) => ({ match: { source_id: 'M1' }, players: { a: full }, ...x }); const partial = L.proposeFromMatch(st8, mk({ complete: false }), P); const missing = L.proposeFromMatch(st8, mk({}), P);
  const ok8 = L.proposeFromMatch(st8, mk({ complete: true }), P); const ap = L.applyProposal(st8, L.createLedger(), ok8, P); const dup = L.applyProposal(ap.state, ap.ledger, ok8, P); const un = L.undoApplication(ap.state, ap.ledger, 'APL-1');
  add('L18B-08', 'Exposición incompleta rechazada; completa produce propuesta; aplicar/repetir/deshacer respetan identidad y presupuesto', { fuente: 'M1' }, { parcial: partial.errors?.map((e) => e.message), sin_indicador: missing.errors?.map((e) => e.message), repetida: dup.reason }, 'exacto',
    { parcial_rechazada: partial.ok === false, sin_indicador_rechazada: missing.ok === false, completa_valida: ok8.ok === true, aplicada: ap.ok === true, repetida_rechazada: dup.ok === false, deshacer_exacto: L.teamFingerprint(un.state) === L.teamFingerprint(st8), curva_en_el_recibo: ok8.playerCurve?.model === 'piecewise-linear' && !!ok8.paramsFingerprint });
  // L18B-09 / 10 (lógica pura de Preparación y de identidades; el recorrido real de navegador está en preparacion-y-persistencia.json)
  const edit = buildMatchInput(p18b, loadData().players, { seed: 7 }); const refSnap = JSON.stringify(edit); const copy = M.makeLearningCopy(edit, p18b, { mode: 'synthetic', instanceSeq: 1 }); const store = { edit, scenario: { scenario: { id: copy.id, learning: true }, input: copy.input } };
  const tgt = prepInputOf(store); tgt.teams[0].plan.defense = tgt.teams[0].plan.defense === 'ORG02' ? 'ORG03' : 'ORG02'; tgt.teams[0].players[0].offensiveRole = { code: 'O12', name: 'prueba' }; const mm = createMatch(deepCopy(matchSourceOf(store)), p18b, { detail: 'minimal' }); mm.init();
  add('L18B-09', 'Entrada efectiva de Preparación = entrada congelada; referencias intactas; el conocimiento no cambia al editar el plan', { edita: 'defensa y rol ofensivo del primer jugador de la copia activa' }, { defensa_en_la_copia: tgt.teams[0].plan.defense, defensa_en_el_partido: mm.teams[0].plan.defense }, 'exacto',
    { misma_entrada: prepInputOf(store) === matchSourceOf(store), el_partido_recibe_lo_editado: mm.teams[0].plan.defense === tgt.teams[0].plan.defense, referencia_intacta: JSON.stringify(edit) === refSnap, conocimiento_sin_cambios_por_editar_el_plan: tgt.teams[0].players.every((p) => p.knowledge.mode === 'explicit') });
  const { states } = M.teamStatesOf(copy.input, P, 0); const Lr = { copy, day: 0, states, ledgers: M.newLedgers(copy.input), undo: [], sessionSeq: 1, matchSeq: 0 };
  const sess = (seq) => ({ source_id: M.sessionSourceId(copy.id, 'EQ01', seq), collectiveFocus: 'ORG02', players: { 'EQ01-J01': { hours: 1 } } }); const ap10 = (spec) => { const pr = L.proposeFromSession(Lr.states.EQ01, spec, P); const r = L.applyProposal(Lr.states.EQ01, Lr.ledgers.EQ01, pr, P); if (r.ok) { Lr.states.EQ01 = r.state; Lr.ledgers.EQ01 = r.ledger; Lr.sessionSeq = Math.max(Lr.sessionSeq, M.nextSessionSeq(Lr)); } return { pr, r }; };
  const s10a = ap10(sess(M.nextSessionSeq(Lr))); const re = M.deserializeLearning(M.serializeLearning(Lr)); const seqAfter = M.nextSessionSeq(re); const s10b = (() => { const pr = L.proposeFromSession(re.states.EQ01, sess(seqAfter), P); return { pr, r: L.applyProposal(re.states.EQ01, re.ledgers.EQ01, pr, P) }; })();
  const rep = L.applyProposal(re.states.EQ01, re.ledgers.EQ01, L.proposeFromSession(re.states.EQ01, sess(1), P), P);
  add('L18B-10', 'Tras persistir/recuperar, una sesión nueva obtiene fuente nueva; repetir la misma fuente real se rechaza', { copia: copy.id }, { primera: s10a.pr.source_id, tras_recargar: s10b.pr.source_id, repetida_rechazada: rep.reason }, 'exacto',
    { primera_aplicada: s10a.r.ok, fuente_nueva_tras_recargar: s10b.r.ok && s10b.pr.source_id !== s10a.pr.source_id && /\|S2$/.test(s10b.pr.source_id), repetida_rechazada: rep.ok === false, presupuesto_acumulado: re.states.EQ01.players['EQ01-J01'].ledger.training.hours === 1 });
  // L18B-11 · L18B-12 (motor): bloqueador y estimación
  const input = buildMatchInput(p18b, loadData().players, { seed: 7 }); for (const t of input.teams) for (const p of t.players) p.knowledge = K.allMastered(P, 0); input.teams[0].players.find((p) => p.id === 'EQ01-J03').knowledge.tactics['FAM:pick_and_roll'] = K.makeEntry(1, 0);
  const m = createMatch(input, p18b, { detail: 'full' }); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  const ex = { team: 0, origin: 'PRUEBA', kind: 'organized', actor: 'EQ01-J01', zone: 'rim', exec: 'dribble', passer: null, icpt: 'EQ02-J01', defend: 'EQ02-J01', moved: false, offContact: { pid: 'EQ01-J01', tech: 'TEC07', kind: 'penetración' }, holder: 'EQ01-J01', family: 'pick_and_roll', blocker: 'EQ01-J03', inter: 1, coverageExpected: true };
  const a11 = m.famAdjust(m.famQualityContext(ex, true), 'quality'); const old11 = m.famAdjust(m.famQualityContext({ ...ex, blocker: undefined }, true), 'quality'); const cont11 = m.famAdjust(m.famQualityContext({ ...ex, blocker: null, inter: null, label: 'CONT05', kind: 'continuation' }, true), 'quality');
  add('L18B-11', 'Bloqueador del caso fijo: −0,045 logit; antes (sin bloqueador) 0; una continuación ajena no arrastra al anterior', { manejador: 'D=1', bloqueador: 'D=0,70 (FAM:pick_and_roll=1)', modulos_ofensivos: 'disposición 0,40 / familia 0,60', componentes: 'posición 0,20 / rol 0,30 / táctica 0,50', max_ofensivo: 0.3 }, { delta: a11.delta, DA: a11.DA, delta_anterior: old11.delta, delta_continuacion: cont11.delta }, '1e-12',
    { menos_0_045: near(a11.delta, -0.045, 1e-12), lado_ofensivo_0_85: near(a11.DA, 0.85, 1e-12), anterior_daba_0: old11.delta === 0, continuacion_no_arrastra: cont11.delta === 0 });
  const mm2 = (() => { const i2 = buildMatchInput(p18b, loadData().players, { seed: 7 }); for (const t of i2.teams) for (const p of t.players) p.knowledge = K.allMastered(P, 0); for (const id of ['EQ02-J01', 'EQ02-J03']) i2.teams[1].players.find((p) => p.id === id).knowledge.tactics.COB01 = K.makeEntry(1, 0); const q = createMatch(i2, p18b, { detail: 'full' }); q.init(); q.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); return q; })();
  const e12 = { ...ex, blocker: null, inter: 41 }; mm2.poss.coverage = { cob: 'COB01', D1: 'EQ02-J01', D2: 'EQ02-J03', inter: 41, pair: {}, info: {} }; const res12 = mm2.famAdjust(mm2.famQualityContext(e12, true), 'quality'); const det = mm2.famEstimateDetail(e12, true);
  mm2.poss.coverage = null; const lim = mm2.famEstimateDetail(e12, true); mm2.poss.coverage = { cob: 'COB01', D1: 'EQ02-J01', D2: 'EQ02-J03', inter: 99, pair: {}, info: {} }; const stale = mm2.famEstimateDetail(e12, true);
  mm2.poss.coverage = { cob: 'COB01', D1: 'EQ02-J01', D2: 'EQ02-J03', inter: 41, pair: {}, info: {} }; const snapA = JSON.stringify({ c: mm2.poss.coverage, x: mm2.fam.exp, d: mm2.rng.count, a: mm2.fam.apps }); for (let i = 0; i < 5; i++) mm2.famEstimateDetail(e12, true); const snapB = JSON.stringify({ c: mm2.poss.coverage, x: mm2.fam.exp, d: mm2.rng.count, a: mm2.fam.apps });
  add('L18B-12', 'Estimación: contexto determinado coincide con la operación resuelta; contexto incompleto identificado; cero azar, exposición y mutaciones', { caso: 'COB01 desconocida en los dos defensores; resto a 30' }, { resuelta: res12.delta, estimacion_determinada: det.delta, estimacion_limitada: lim.delta, alcance_limitado: lim.scope, faltan: lim.missing, referencia_de_otra_interaccion: stale.scope }, '1e-15',
    { determinada_coincide: det.scope === 'determinada' && near(det.delta, res12.delta, 1e-15) && near(res12.delta, 0.045, 1e-12), limitada_identificada: lim.scope === 'limitada' && lim.missing.length === 2 && lim.delta === 0, otra_interaccion_no_se_reutiliza: stale.scope === 'limitada', sin_efectos: snapA === snapB });
  return { id: 'L18B', study: 'MOTOR18B', learningVersion: P.learningVersion, famVersion: P.version, player_curve: P.learning.factors.player, rows, all_ok: rows.every((r) => r.ok), polivalencia: pad };
}

// §11.3: módulos que los seis diagnósticos de MOTOR-18 no observaron (ORG04, ORG05, ORG06, COB04, DIS03…DIS06): sus correspondencias se comprueban con CONTEXTOS FIJOS (sin forzar su aparición en partidos y sin afirmar que equivalgan a exposición natural).
export function fixedContextModules(p18b) {
  const P = p18b.familiarity; const players = loadData().players; const out = []; const W = P.tacticContextWeights.organized;
  const make = (patch0, patch1) => { const input = buildMatchInput(p18b, players, { seed: 7 }); for (const t of input.teams) for (const p of t.players) p.knowledge = K.allMastered(P, 0); Object.assign(input.teams[0].plan, patch0 ?? {}); Object.assign(input.teams[1].plan, patch1 ?? {}); const m = createMatch(input, p18b, { detail: 'full' }); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); return m; };
  const ex = { team: 0, origin: 'PRUEBA', kind: 'organized', actor: 'EQ01-J01', zone: 'rim', exec: 'dribble', passer: null, icpt: 'EQ02-J01', defend: 'EQ02-J01', moved: false, offContact: null, holder: 'EQ01-J01', family: 'pick_and_roll', inter: 5, coverageExpected: true };
  for (const org of ['ORG04', 'ORG05', 'ORG06']) { const m = make({}, org === 'ORG06' ? { defense: org, target: 'EQ01-J01', targetAlt: 'EQ01-J03' } : { defense: org }); m.refreshEffectiveOrg?.(1); const c = m.famQualityContext(ex, true); const hit = c.dfn.find((x) => x.id === org); out.push({ module: org, kind: 'organización efectiva', context: c.ctx, weight_in_context_normalized: hit?.w ?? null, raw_weight: W.defense.organization, side: 'defensa', ok: !!hit && c.ctx === 'organized' }); }
  { const m = make(); const [d1, d2] = m.onCourt(1); m.poss.coverage = { cob: 'COB04', D1: d1, D2: d2, inter: 5, pair: {}, info: {} }; const c = m.famQualityContext({ ...ex, defend: d1, icpt: d1 }, true); const hit = c.dfn.find((x) => x.id === 'COB04'); out.push({ module: 'COB04', kind: 'cobertura ejecutada', context: c.ctx, weight_in_context_normalized: hit?.w ?? null, raw_weight: W.defense.coverage, side: 'defensa', defenders_in_participants: [d1, d2].every((id) => c.defP.includes(id)), ok: !!hit && [d1, d2].every((id) => c.defP.includes(id)) }); }
  for (const dis of ['DIS03', 'DIS04', 'DIS05', 'DIS06']) { const m = make({ disposition: dis }); const c = m.famQualityContext(ex, true); const hit = c.atk.find((x) => x.id === dis); out.push({ module: dis, kind: 'disposición', context: c.ctx, weight_in_context_normalized: hit?.w ?? null, raw_weight: W.attack.disposition, side: 'ataque', ok: !!hit && c.ctx === 'organized' }); }
  return { note: 'correspondencia módulo → contexto con entradas FIJAS; no es exposición natural ni afirma que estos módulos aparezcan en un partido', rows: out, all_ok: out.every((r) => r.ok) };
}

const csvCell = (v) => { const s = typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
if (process.argv[1] && process.argv[1].endsWith('m18b-l18b-table.js')) {
  const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
  const OUT = arg('out', 'out/motor18b/rapido'); const DOCS = arg('docs', 'docs/tecnico/evidencia-motor18b/l18b'); const { profile, profile18 } = loadData(); const res = buildL18B(profile18, profile);
  for (const dir of [OUT, DOCS]) {
    mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'L18B.json'), JSON.stringify(res, null, 1));
    writeFileSync(join(dir, 'L18B.csv'), `id,titulo,ok,tolerancia,comprobaciones,entradas,salidas\n${res.rows.map((r) => [r.id, r.title, r.ok, r.tolerance, r.checks, r.inputs, r.outputs].map(csvCell).join(',')).join('\n')}\n`);
    writeFileSync(join(dir, 'polivalencia-antes-despues.json'), JSON.stringify(res.polivalencia, null, 1));
    const pr = res.polivalencia.rows; writeFileSync(join(dir, 'polivalencia-antes-despues.csv'), `polivalencia,factor_anterior,factor_nuevo,producto_anterior,producto_nuevo,G_anterior,G_nuevo,K_final_anterior,K_final_nuevo,ganancia_anterior,ganancia_nueva,ok\n${pr.map((r) => [r.polivalencia, r.factor_anterior, r.factor_nuevo, r.producto_anterior, r.producto_nuevo, r.G_anterior, r.G_nuevo, r.K_final_anterior, r.K_final_nuevo, r.ganancia_anterior, r.ganancia_nueva, r.ok].join(',')).join('\n')}\n`);
    const md = ['# Tabla L18B (MOTOR-18B)', '', `Versiones: familiaridad \`${res.famVersion}\`, aprendizaje \`${res.learningVersion}\`. Cálculo puro, sin partidos nuevos. L18 (MOTOR-18) permanece como tabla histórica (\`../evidencia-motor18/l18/\`).`, '', `Resultado: **${res.rows.filter((r) => r.ok).length}/${res.rows.length}** casos conformes.`, '',
      '| Caso | Propiedad | Tolerancia | Resultado |', '|---|---|---|---|', ...res.rows.map((r) => `| ${r.id} | ${r.title} | ${r.tolerance} | ${r.ok ? 'conforme' : 'NO conforme'} |`), '', '## Polivalencia antes / después (ejemplo ORG02, K=12, 1 hora equivalente efectiva al objetivo)', '',
      '| P | Factor anterior | Factor nuevo | K final anterior | K final nuevo | G nuevo |', '|---:|---:|---:|---:|---:|---:|', ...pr.map((r) => `| ${r.polivalencia} | ${r.factor_anterior.toFixed(10)} | ${r.factor_nuevo} | ${r.K_final_anterior.toFixed(10)} | ${r.K_final_nuevo.toFixed(10)} | ${r.G_nuevo.toFixed(6)} |`), '',
      `G(P24)/G(P8) = ${res.polivalencia.ratios.G24_over_G8.toFixed(6)} (cociente 4 en la dosis eficaz); ganancia(P24)/ganancia(P8) = ${res.polivalencia.ratios.gain24_over_gain8.toFixed(6)} (≈ 3,901764: no es multiplicar por cuatro la ganancia absoluta).`, '',
      'Dosis eficaz necesaria de K12 a K18 (h-eq al objetivo, factores constantes): ' + res.polivalencia.dose_to_reach_K12_to_K18.map((d) => `P${d.polivalencia} = ${d.dosis_efectiva_necesaria_h_eq.toFixed(6)}`).join(' · ') + '. Comparación controlada de producto; no es un calendario real.', '',
      'Las cifras de la curva son semillas SEM18B autorizadas por el encargo: no son calibración empírica.', ''];
    writeFileSync(join(dir, 'L18B.md'), md.join('\n')); writeFileSync(join(dir, 'modulos-no-observados.json'), JSON.stringify(fixedContextModules(profile), null, 1));
  }
  console.log(JSON.stringify({ all_ok: res.all_ok, rows: res.rows.map((r) => [r.id, r.ok]) })); process.exit(res.all_ok ? 0 : 1);
}
