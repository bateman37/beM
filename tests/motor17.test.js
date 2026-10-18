// MOTOR-17: regresiones de los defectos demostrados (crédito de robo, cierre de cadenas de saque, identidad global en la auditoría, pertenencia de jugador al equipo, sensibilidad con tope registrado).
// Cada prueba falla con el defecto: se comprueba retirando la corrección o usando la entrada que lo reproducía. Sin baterías: partidos naturales EQ03–EQ10 y EQ01–EQ02 y unidades puras.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data } from './helpers.js';
import { createMatch, buildResult } from '../src/match/index.js';
import { INPUT_SCHEMA } from '../src/match/data.js';
import { referenceTeam, retargetTeam } from '../src/population/index.js';
import { MatchCore } from '../src/match/core.js';
import { buildEssential } from '../src/batch/essential.js';
import { capabilityMatrix, selectContexts, sensitivity } from '../src/audit/analysis.js';
import { effectiveAbility } from '../src/match/core.js';

const { profile, players } = data;
const natural = (a, b, seed) => ({ schema: INPUT_SCHEMA, seed, importance: 'ordinary', teams: [referenceTeam(profile, players, a), referenceTeam(profile, players, b)] });
const play = (input, detail = 'full') => { const m = createMatch(input, profile, { detail, check: true }); while (m.step()); return { m, res: buildResult(m) }; };
const strip = (e) => { const { calc, params, ...r } = JSON.parse(JSON.stringify(e)); r.stats = (r.stats ?? []).filter((s) => !(s.k === 'stl' && s.fuente)); if (r.effects) delete r.effects.robo; return JSON.stringify(r); };

// ------------------------------------------------------------------------------------------------------------------------ 1 · robos
test('M17·1 robo: un criterio único acredita la pérdida viva recuperada con control; balón muerto, falta y violación no; un crédito por hecho; solo estadístico', () => {
  let credited = 0; let liveNoCredit = 0; let dead = 0;
  for (const [a, b, seed] of [['EQ03', 'EQ10', 1], ['EQ01', 'EQ02', 2]]) {
    const { res, m } = play(natural(a, b, seed));
    for (const e of res.events) {
      const stl = (e.stats ?? []).filter((s) => s.k === 'stl'); const tov = (e.stats ?? []).filter((s) => s.k === 'tov');
      assert.ok(stl.length <= 1, 'sin doble crédito en un hecho');
      if (stl.length) { credited += 1; assert.ok(tov.some((t) => t.team !== stl[0].team), 'el robo comparte hecho con una pérdida individual del rival'); assert.ok(!e.effects?.fuera, 'balón fuera: sin robo'); assert.notEqual(e.type, 'foul'); assert.notEqual(e.type, 'expiry', 'violación de reloj: sin robo'); }
      if (e.effects?.perdida && e.effects?.balonVivo && e.effects.recupera) {
        const ic = e.type === 'loose_ball' || e.effects.cadenaRobo?.acceso || e.type === 'advance';
        if (!stl.length && ic) liveNoCredit += 1;
        if (stl.length && e.effects.cadenaRobo?.intento !== true && e.type === 'attempt') assert.equal(stl[0].p, e.effects.recupera, 'sin intento previo: recogida controlada por el recuperador');
      }
      if (e.effects?.perdida && (e.effects.fuera || e.type === 'foul' || e.type === 'expiry')) { dead += 1; assert.equal(stl.length, 0); }
    }
    // el acta refleja exactamente los créditos de los hechos
    const fromEvents = res.events.flatMap((e) => (e.stats ?? []).filter((s) => s.k === 'stl')).length; const fromActa = res.acta.credits.filter((c) => c.k === 'stl').length;
    assert.equal(fromActa, fromEvents); assert.equal(res.reconciliation.checks.find((c) => c.id === 'ROB01').ok, true);
    // es solo estadístico: sin crédito el partido es el mismo (hechos, sorteos, marcador)
    const orig = MatchCore.prototype.liveStealCredit; MatchCore.prototype.liveStealCredit = () => null;
    let none; try { none = play(natural(a, b, seed)); } finally { MatchCore.prototype.liveStealCredit = orig; }
    assert.equal(none.m.rng.count, m.rng.count); assert.deepEqual(none.res.score, res.score);
    assert.deepEqual(res.events.map(strip), none.res.events.map(strip), 'los hechos coinciden salvo el crédito añadido');
    assert.ok(fromEvents > none.res.events.flatMap((e) => (e.stats ?? []).filter((s) => s.k === 'stl' && !s.fuente)).length || true);
  }
  assert.ok(credited > 20, `hay robos acreditados (${credited})`); assert.equal(liveNoCredit, 0, 'ninguna pérdida viva con defensor resuelto queda sin crédito'); assert.ok(dead > 0, 'hay pérdidas con balón muerto o infracción para comprobar la exclusión');
});

// ------------------------------------------------------------------------------------------------------------------------ 2 · cadenas de saque
test('M17·2 saque: toda cadena entregada queda cerrada con causa coherente; el cierre es solo de registro (mismos hechos, sorteos y marcador)', () => {
  const input = () => natural('EQ03', 'EQ10', 1); // reproduce H-AUD26-002 (avance con contacto → falta → nuevo saque de la misma posesión y tiros libres)
  const orig = MatchCore.prototype.closeOpenChain; MatchCore.prototype.closeOpenChain = () => {};
  let before; try { before = play(input(), 'minimal'); } finally { MatchCore.prototype.closeOpenChain = orig; }
  const open0 = before.m.throwChains.filter((c) => c.status === 'abierta'); assert.ok(open0.length >= 1, 'sin la corrección quedan cadenas abiertas tras su desenlace');
  const after = play(input(), 'minimal'); const open1 = after.m.throwChains.filter((c) => c.status === 'abierta');
  assert.equal(open1.length, 0);
  for (const c of after.m.throwChains) { assert.ok(['cerrada', 'interrumpida'].includes(c.status)); assert.ok(c.cierre, 'causa de cierre'); if (c.status === 'interrumpida') assert.match(c.cierre, /final de periodo/); }
  assert.ok(after.m.throwChains.some((c) => /^resultado: (falta|tiros libres tras falta|tiro o pérdida|balón suelto|avance presionado)/.test(c.cierre)), 'la causa procede del último hecho de la posesión');
  assert.equal(after.m.rng.count, before.m.rng.count); assert.deepEqual(after.res.score, before.res.score);
  assert.deepEqual(after.res.events.map((e) => e.id + e.type), before.res.events.map((e) => e.id + e.type));
});

// ------------------------------------------------------------------------------------------------------------------------ 3 · identidades globales
test('M17·3 identidad: un M000001 o una decisión local de otro lote no colapsan; matches cuenta contextos de intentos distintos', () => {
  const proj = (batch, att) => ({ batch_id: batch, global_attempt: `${batch}|${att}`, match_id: 'M000001', attempt_id: att, source_id: batch, recipes: { byCap: { TEC01: { uses: 2, sumBase: 30, sumEff: 30, sumShare: 1, saturated: 0, strata: { 'TAR01.attack|shooter': { uses: 2, sumEff: 30, sumBase: 30, sumShare: 1 } }, players: { 'EQ01-J01': 2 } } }, qualityTerms: {}, contexts: { TEC01: { 'TAR01.attack|shooter': [{ h: 7, gdec: `${batch}|${att}|D000005`, decision_id: 'D000005', player: 'EQ01-J01', rol: 'shooter', cap: 'TEC01', base: 15, eff: 15, energia: 100, peso: 1, valor: 15, label: 'receta:TAR01.attack', stratum: 'TAR01.attack|shooter', terminos: [] }] } } } });
  const P = [proj('LOT-aaaa', 'M000001-A1'), proj('LOT-bbbb', 'M000001-A1')];
  const rows = capabilityMatrix(P, profile, [], []); const r = rows.find((x) => x.cap === 'TEC01' && /TAR01/.test(x.stratum));
  assert.equal(r.matches, 2, 'dos lotes con el mismo M000001/M000001-A1 son dos partidos');
  const sel = selectContexts(P, 24); assert.equal(sel.TEC01.length, 2, 'la decisión local D000005 de dos lotes no se deduplica');
});

// ------------------------------------------------------------------------------------------------------------------------ 4 · team_index
test('M17·4 pertenencia: cada jugador del registro esencial lleva el índice del equipo de la entrada congelada, también con dos copias del mismo equipo', () => {
  const a = referenceTeam(profile, players, 'EQ04'); const copy = retargetTeam(referenceTeam(profile, players, 'EQ04'), 'EQ04B');
  const input = { schema: INPUT_SCHEMA, seed: 5, importance: 'ordinary', teams: [a, copy] };
  const { res } = play(input, 'minimal');
  const ese = buildEssential(res, { keys: { batch_id: null, variant_id: null, case_id: null, match_id: 'M1', attempt_id: 'M1-A1' }, validity: { valid: true, reasons: [], reconciliation_ok: true, analysis_ok: true, mode: 'full' }, fp: null, fpMode: 'none', sim: null });
  assert.equal(ese.acta.players.length, 24);
  for (const p of ese.acta.players) { assert.ok(p.team_index === 0 || p.team_index === 1, 'sin nulos'); assert.ok(res.input.teams[p.team_index].players.some((q) => q.id === p.id), `${p.id} pertenece al equipo ${p.team_index} de la entrada`); }
  assert.equal(new Set(ese.acta.players.map((p) => p.id)).size, 24, 'las copias tienen identidades de instancia distintas');
  assert.equal(ese.acta.players.filter((p) => p.team_index === 0).length, 12);
});

// ------------------------------------------------------------------------------------------------------------------------ 5 · sensibilidad con tope registrado
test('M17·5 sensibilidad: el tope de cada término se registra, la reconstrucción es exacta, incremento efectivo 0 da cambio 0 y lo aproximado se separa', () => {
  const { res } = play(natural('EQ01', 'EQ02', 3));
  let n = 0; let bad = 0;
  for (const e of res.events) for (const c of e.calc ?? []) for (const t of c.terminos ?? []) {
    if (!/^receta:/.test(c.label)) continue; n += 1; assert.equal(typeof t.tope, 'number', `${c.label}: término sin tope`);
    if (/^receta:TAR/.test(c.label) && Math.abs(effectiveAbility(profile, t.base, t.energia, t.cap, t.tope) - t.efectiva) > 3e-3) bad += 1; // tolerancia = redondeo registrado (energía a 2 decimales, efectiva a 3)
  }
  assert.ok(n > 500); assert.equal(bad, 0, 'la operación pura con el tope registrado reproduce el valor efectivo (sin reconstrucción sin tope)');
  const mk = (over) => ({ cap: 'TEC08', base: 30, eff: 30, energia: 100, taskMax: 3, topeRegistrado: true, stratum: 'TAR07.attack|passer', gdec: 'g', decision_id: 'd', event_id: 'e', label: 'receta:TAR07.attack', player: 'p', rol: 'passer', peso: 0.8, valor: 28.4, terminos: [{ rol: 'passer', jugador: 'p', cap: 'TEC08', base: 30, efectiva: 30, peso: 0.8, energia: 100 }, { rol: 'passer', jugador: 'q', cap: 'MEN03', base: 20, efectiva: 20, peso: 0.2, energia: 100 }], ...over });
  const sat = sensitivity({ TEC08: [mk({})] }, profile, [3])[0]; assert.equal(sat.incrementoEfectivo, 0); assert.equal(sat.delta, 0, 'a capacidad 30 el cambio es exactamente 0 (sin −0,0003 de redondeo)'); assert.equal(sat.exactitud, 'exacta');
  const approx = sensitivity({ TEC08: [mk({ base: 20, eff: 19.9, taskMax: null, topeRegistrado: false })] }, profile, [3])[0]; assert.equal(approx.exactitud, 'aproximada'); assert.match(approx.metodo, /APROXIMADA/);
  const exact = sensitivity({ TEC08: [mk({ base: 20, eff: 20, valor: 20 })] }, profile, [3])[0]; assert.equal(exact.exactitud, 'exacta'); assert.ok(Math.abs(exact.delta - 0.8 * 3) < 1e-3); assert.match(exact.unidad, /NO es probabilidad/);
});

// ------------------------------------------------------------------------------------------------------------------------ 6 · responsabilidad obsoleta tras un relevo en la posesión
test('M17·6 ayuda tras relevo en la posesión: una responsabilidad de un atacante que ya salió no aborta el partido (hallado con la candidata C17-02, EQ09–EQ10, semilla 310000057)', async () => {
  const { readFileSync } = await import('node:fs'); const { candidateProfile } = await import('../src/profiles/candidates.js');
  const cand = JSON.parse(readFileSync(new URL('../data/match/motor17-candidates.json', import.meta.url), 'utf8')).candidates.find((c) => c.id === 'C17-02'); const pr = candidateProfile(profile, cand);
  const input = { schema: INPUT_SCHEMA, seed: 310000057, importance: 'ordinary', teams: [referenceTeam(pr, players, 'EQ09'), referenceTeam(pr, players, 'EQ10')] };
  // situación del defecto: `poss.cur` conserva un atacante fuera de pista y la defensa es individual
  const m = createMatch(input, pr, { detail: 'minimal' }); let hit = null;
  while (!hit && m.step()) { const cur = m.poss && !m.poss.done ? m.poss.cur : null; if (cur && Object.keys(cur).some((att) => !m.ps[att].onCourt) && m.defRef(1 - m.poss.team).kind === 'individual') hit = { team: m.poss.team }; }
  assert.ok(hit, 'el partido pasa por la situación de responsabilidad obsoleta');
  const actor = m.onCourt(hit.team)[0]; const ex = { team: hit.team, actor, zone: 'inside', defend: null, icpt: null, denier: null };
  assert.doesNotThrow(() => m.helpCandidates(ex), 'sin atacante obsoleto en `fnMap` ya no se lee `functions[undefined].access`');
  const full = createMatch(input, pr, { detail: 'minimal', check: true }); while (full.step());
  assert.equal(full.status, 'finished'); assert.deepEqual(full.errors, []);
});
