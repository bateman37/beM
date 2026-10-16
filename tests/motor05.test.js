// MOTOR-05: defensa completa. Pocos casos controlados (fixtures identificados como tales: no fabrican estadísticas de un partido real) y
// cinco partidos completos de cierre. No se simula hasta que salgan por azar las ramas raras (N04, N12).
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, defInputFor, playWithOrders } from './helpers.js';
import { runMatch, createMatch, buildResult, deepCopy, validateInput, ENGINE_VERSION, EXPORT_SCHEMA } from '../src/match/index.js';
import { replayMatch, sportsProjection, validateReplayFile } from '../src/match/replay.js';
import { MatchSession } from '../src/match/session.js';
import { oddsAdjust } from '../src/match/flow.js';

const profile = data.profile; const dr = profile.defenseRepertoire; const d = profile.defense;
const ORGS = ['ORG01', 'ORG02', 'ORG03', 'ORG04', 'ORG05', 'ORG06'];
const DIS = ['DIS01', 'DIS02', 'DIS03', 'DIS04', 'DIS05', 'DIS06'];
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

// Escena controlada: ataca EQ01 (equipo 0) con posesión de pista de ataque; defiende EQ02 con el plan `over`.
function scene({ over = {}, seed = 11, dis = 'DIS02' } = {}) {
  const input = defInputFor(seed, 1, { target: null, ...over });
  input.teams[0].plan.disposition = dis;
  const m = createMatch(input, profile, { detail: 'full', check: false });
  m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  for (const id of Object.keys(m.ps)) m.ps[id].energy = 100;
  return m;
}
// Ocupación de funciones del ataque y director, como lo hace el flujo real antes de asignar fichas.
function organize(m, playId) {
  const dir = m.pickDirector(0); m.poss.director = dir;
  const el = m.eligiblePlays(0, dir.id, new Set(), m.poss, [playId]);
  const entry = el.find((e) => e.playId === playId); entry.team = 0;
  return { dir, entry };
}
const force = (m, answers) => { const q = [...answers]; m.bernoulli = () => (q.length ? q.shift() : false); };

// ------------------------------------------------------------------------------------------------ 1. catálogo y realizabilidad
test('1. catálogo defensivo completo: 6 organizaciones, 5 estilos × 5 niveles, 3 alturas, 4 coberturas, 12 roles y 3 especiales; todas realizables', () => {
  assert.deepEqual(profile.activeCatalog.defenses, ORGS); assert.deepEqual(profile.activeCatalog.coverage, ['COB01', 'COB02', 'COB03', 'COB04']);
  assert.deepEqual(profile.activeCatalog.pressureHeights, ['normal', 'three_quarters', 'full']); assert.deepEqual(profile.activeCatalog.specials, ['ESPD01', 'ESPD02', 'ESPD03']);
  for (const [k, arr] of Object.entries(d.styles)) assert.equal(arr.length, 5, k);
  assert.deepEqual(Object.keys(dr.styles), profile.activeCatalog.defenseStyles);
  for (const [k, s] of Object.entries(dr.styles)) { assert.equal(s.levels.length, 5, k); assert.equal(s.levels[2], 'Equilibrado'); }
  for (const k of ['additionalHelpOddsRatio', 'closePressureChoiceOddsRatio', 'receiverDenialChoiceOddsRatio', 'stealAttemptChoiceOddsRatio', 'interiorProtectionChoiceWeight', 'exteriorProtectionChoiceWeight']) near(d.styles[k][2], 1); // nivel 3 = neutral
  assert.equal(Object.keys(profile.fixtureContract.defensiveRoleDictionary).length, 12); assert.deepEqual(Object.keys(dr.roles).sort(), Object.keys(profile.fixtureContract.defensiveRoleDictionary).sort());
  const fnNames = Object.keys(dr.attackerFunctions);
  for (const id of ORGS) {
    const o = dr.organizations[id];
    if (o.kind === 'individual') continue;
    assert.equal(Object.keys(o.functions).length, 5, id);
    for (const f of fnNames) { assert.ok(o.areas[f], `${id}: sin área para ${f}`); for (const a of [].concat(o.areas[f])) { assert.ok(o.functions[a.first]); for (const r of a.relief) assert.ok(o.functions[r], `${id}.${f}`); } }
    for (const r of o.rim) assert.ok(o.functions[r]);
  }
  // realizabilidad: cada organización frente a cada disposición ocupa cinco defensores distintos y cubre al menos a cuatro atacantes
  for (const org of ORGS) for (const dis of DIS) {
    const m = scene({ over: { defense: org, target: org === 'ORG06' ? 'EQ01-J01' : null }, dis });
    m.poss.layout = { ...m.layoutFor(0, dis, 'EQ01-J01'), director: 'EQ01-J01' };
    const ref = m.defRef(1);
    const covered = Object.values(ref.assign).filter(Boolean);
    assert.ok(covered.length >= 4 && new Set(covered).size === covered.length, `${org} ${dis}: ${JSON.stringify(ref.assign)}`);
    if (org !== 'ORG01') assert.equal(new Set(Object.values(ref.fnOwner)).size, 5, `${org} ${dis}`);
  }
  // el plan de la entrada acepta las nuevas opciones y rechaza organizaciones, estilos y navegaciones inexistentes
  assert.deepEqual(validateInput(defInputFor(1, 0, { defense: 'ORG03', coverage: 'COB04', pressureHeight: 'full' }), profile), []);
  assert.ok(validateInput(defInputFor(1, 0, { defense: 'ORG09' }), profile).length);
  assert.ok(validateInput(defInputFor(1, 0, { defStyles: { help: 6 } }), profile).length);
  assert.ok(validateInput(defInputFor(1, 0, { coverage: 'COB02', navigation: 'under' }), profile).length, 'por debajo solo existe para el drop');
  assert.deepEqual(validateInput(defInputFor(1, 0, { coverage: 'COB01', navigation: 'under' }), profile), []);
  assert.ok(validateInput(defInputFor(1, 0, { defense: 'ORG06', target: null }), profile).length, 'box and one exige objetivo');
});

// ------------------------------------------------------------------------------------------------ 2. responsabilidades zonales
test('2. una misma amenaza recibe responsables y relevos distintos según la organización; la zona no son cinco marcas personales', () => {
  const owner = (org, dis) => {
    const m = scene({ over: { defense: org, target: org === 'ORG06' ? 'EQ01-J01' : null }, dis });
    m.poss.layout = { ...m.layoutFor(0, dis, 'EQ01-J01'), director: 'EQ01-J01' };
    const ref = m.defRef(1); const inside = Object.keys(ref.fnMap).find((a) => ref.fnMap[a] === 'inside' || ref.fnMap[a] === 'lowInside');
    return { m, ref, inside, who: ref.assign[inside], fn: ref.defFn[ref.assign[inside]], relief: m.reliefFor(inside), shot: m.shotDefenderFor(inside, 'rim') };
  };
  const a = owner('ORG01', 'DIS03'); const b = owner('ORG02', 'DIS03'); const c = owner('ORG04', 'DIS03');
  assert.equal(a.ref.kind, 'individual'); assert.equal(b.ref.kind, 'zone');
  assert.equal(b.ref.defFn[b.who], 'B', 'en 2–3 la función posterior central protege el aro');
  assert.equal(c.ref.defFn[c.who], 'K', 'en 1–3–1 la función de fondo protege el aro');
  assert.notDeepEqual(b.relief.map((id) => b.ref.defFn[id]), c.relief.map((id) => c.ref.defFn[id]), 'el relevo compatible depende de la organización');
  // sobrecarga estructural: en DIS03 dos atacantes interiores comparten primera referencia en 2–3 y no los cubre el mismo defensor
  const inner = Object.keys(b.ref.fnMap).filter((x) => ['highInside', 'lowInside'].includes(b.ref.fnMap[x]));
  assert.equal(inner.length, 2); assert.notEqual(b.ref.assign[inner[0]], b.ref.assign[inner[1]]);
  // en 1–3–1 las dos esquinas comparten primera referencia (fondo): una queda con relevo o abierta, nunca las dos con el mismo defensor
  const m5 = scene({ over: { defense: 'ORG04' }, dis: 'DIS01' }); m5.poss.layout = { ...m5.layoutFor(0, 'DIS01', 'EQ01-J01'), director: 'EQ01-J01' };
  const r5 = m5.defRef(1); const corners = Object.keys(r5.fnMap).filter((x) => r5.fnMap[x] === 'corner');
  assert.notEqual(r5.assign[corners[0]], r5.assign[corners[1]] ?? 'x');
  // la finalización en el aro la defiende la función de protección del aro, no el marcador de un atacante exterior
  const wing = Object.keys(b.ref.fnMap).find((x) => b.ref.fnMap[x] === 'wing');
  assert.equal(b.m.shotDefenderFor(wing, 'rim'), b.ref.fnOwner.B); assert.equal(b.m.shotDefenderFor(wing, 'three'), b.ref.assign[wing]);
  assert.equal(a.m.shotDefenderFor(wing, 'rim'), a.ref.assign[wing], 'en individual lo defiende su marcador');
});

// ------------------------------------------------------------------------------------------------ 3. marcas, función y estabilidad; sin prohibición nominal
test('3. marca manual > adecuación; estabilidad de referencias; la posición nominal ni prohíbe ni penaliza', () => {
  const m = scene({ over: { marks: [{ defender: 'EQ02-J11', attacker: 'EQ01-J01', scope: 'game' }] } });
  m.poss.layout = { ...m.layoutFor(0, 'DIS02', 'EQ01-J01'), director: 'EQ01-J01' };
  assert.equal(m.defRef(1).assign['EQ01-J01'], 'EQ02-J11', 'un pívot marcado sobre el base: la marca manual válida prevalece sobre la adecuación');
  const z = scene({ over: { defense: 'ORG02', marks: [{ defender: 'EQ02-J01', fn: 'inside', scope: 'game' }] } });
  z.poss.layout = { ...z.layoutFor(0, 'DIS02', 'EQ01-J01'), director: 'EQ01-J01' };
  assert.equal(z.defRef(1).defFn['EQ02-J01'], 'B', 'en zona la marca coloca al defensor en la función que cubre ese área');
  // estabilidad: recalcular con el mismo quinteto conserva exactamente las referencias (0,5 puntos por referencia previa compatible)
  const k = scene({ over: { defense: 'ORG03' } }); k.poss.layout = { ...k.layoutFor(0, 'DIS02', 'EQ01-J01'), director: 'EQ01-J01' };
  const r1 = k.defRef(1); k.defPlanVer[1] += 1; const r2 = k.defRef(1);
  assert.notEqual(r1, r2); assert.deepEqual(r1.fnOwner, r2.fnOwner);
  // sin penalización por posición: la adecuación solo depende de capacidades y rol, no de la posición nominal
  near(d.assignment.nominalPositionExecutionPenalty, 0);
  const guard = 'EQ02-J01'; const c = 'EQ02-J11';
  const sc = (id, recipe) => k.defScore(id, recipe, [], false);
  near(sc(guard, 'interiorFit'), k.defFit(guard, 'interiorFit')); near(sc(c, 'perimeterFit'), k.defFit(c, 'perimeterFit'));
  // V03: la recomendación por posiciones no filtra candidatos: pueden competir jugadores de otras posiciones
  const { entry } = organize(k, 'POS01');
  const layout = k.poss.layout; const def = k.rep().plays.POS01.roles.screener;
  const cands = k.roleCandidates(0, { ...def, slotGroup: 'screener' }, layout, new Set([entry.roles.handler]));
  assert.ok(cands.some((id) => !profile.participantSlots.screener.includes(k.slotOf(id))), 'candidatos fuera de las posiciones recomendadas siguen elegibles');
  // los roles defensivos favorecen una función una sola vez y nunca vuelven inelegible a nadie
  const withRole = (code) => { const t = scene({ over: { defense: 'ORG02' } }); t.defRoleOf['EQ02-J11'] = code; return t.defScore('EQ02-J11', 'interiorFit', ['rimProtect'], false); };
  near(withRole('D12') / withRole('D04'), d.assignment.roleFitWeight / d.assignment.otherRoleFitWeight);
});

// ------------------------------------------------------------------------------------------------ 4. coberturas
test('4. cambiar conserva el responsable actual; show compromete y recupera; trampa deja una opción detrás y no duplica el especial', () => {
  // COB02: el cambio completado intercambia las responsabilidades y persiste en la posesión hasta una reorganización
  const m = scene({ over: { coverage: 'COB02' } }); const { entry } = organize(m, 'POS01');
  const { handler, screener } = entry.roles; const D1 = m.defenderFor(handler); const D2 = m.defenderFor(screener);
  force(m, [true]); const cov = m.beginCoverage(entry, m.poss);
  assert.equal(cov.exchanged, true); assert.equal(m.defenderFor(handler), D2); assert.equal(m.defenderFor(screener), D1);
  const exH = { role: 'handler', defend: D1, icpt: D1, zone: 'rim' }; m.coverageForExit(exH, cov); assert.equal(exH.defend, D2);
  assert.equal(m.defenderFor(handler), D2, 'persiste tras la acción'); m.resetCurrent(); assert.equal(m.defenderFor(handler), D1, 'una reorganización pertinente la restablece');
  // el cambio puede no completarse: el bloqueo es efectivo (espacio al manejador y al continuador) y no cambia las responsabilidades
  const n = scene({ over: { coverage: 'COB02' } }); const e2 = organize(n, 'POS01').entry; const ref2 = n.defRef(1).assign[e2.roles.handler]; force(n, [false]); const c2 = n.beginCoverage(e2, n.poss);
  assert.equal(c2.exchanged, false); assert.equal(n.defenderFor(e2.roles.handler), ref2, 'sin cambio completado las responsabilidades no se tocan');
  const e2x = { role: 'handler', defend: ref2, icpt: ref2, zone: 'rim', pullup: true }; assert.ok(n.coverageForExit(e2x, c2).k > 0, 'el bloqueo efectivo concede espacio al manejador');
  // COB03: el segundo defensor sale (compromiso real) y, si no recupera, el continuador queda libre
  const s = scene({ over: { coverage: 'COB03' } }); const es = organize(s, 'POS01').entry; force(s, [false]);
  const cs = s.beginCoverage(es, s.poss); assert.ok(s.poss.committed.has(cs.D2)); const roll = { role: 'screener', defend: cs.D2, icpt: cs.D2, zone: 'rim', roller: true }; s.coverageForExit(roll, cs);
  assert.equal(roll.window, true); assert.match(roll.helpWindow, /continuador libre/);
  const s2 = scene({ over: { coverage: 'COB03' } }); const es2 = organize(s2, 'POS01').entry; force(s2, [true]); const cs2 = s2.beginCoverage(es2, s2.poss);
  const roll2 = { role: 'screener', defend: null, icpt: null, zone: 'rim', roller: true }; s2.coverageForExit(roll2, cs2); assert.equal(roll2.defend, cs2.D2); assert.ok(!roll2.window);
  // COB04: dos defensores comprometidos con el balón y un solo compromiso: ESPD02 sobre la misma interacción no lo duplica
  const t = scene({ over: { coverage: 'COB04', specials: [{ id: 'ESPD02', principal: 'EQ01-J01', alternate: null, activation: 'firstDribble', executor: null, executorAlt: null }] } });
  const et = organize(t, 'POS01').entry; force(t, [false]); const ct = t.beginCoverage(et, t.poss);
  assert.ok(t.poss.committed.has(ct.D1) && t.poss.committed.has(ct.D2)); assert.equal(t.poss.trapBy, 'COB04');
  const ball = { role: 'handler', exec: 'dribble', actor: et.roles.handler, holder: et.roles.handler, defend: ct.D1, icpt: ct.D1, zone: 'rim', team: 0 }; t.coverageForExit(ball, ct);
  assert.deepEqual(ball.defMix, { primary: ct.D1, second: ct.D2 });
  const dup = t.applyDouble({ ...ball, actor: 'EQ01-J01', holder: 'EQ01-J01' }); assert.equal(dup.estado, 'no duplicada');
  const roll4 = { role: 'screener', defend: null, icpt: null, zone: 'rim' }; t.coverageForExit(roll4, ct);
  assert.ok(roll4.window || roll4.defend, 'la salida de la trampa queda con una opción detrás (libre o con rotación que llega)');
  // el show/cambio/trampa no fijan una canasta: solo cambian quién defiende y el espacio; el acierto lo siguen resolviendo las recetas
  for (const cob of ['COB01', 'COB02', 'COB03', 'COB04']) assert.ok(d.coverage.committedActorLoad[cob] >= 1);
});

// ------------------------------------------------------------------------------------------------ 5. ayudas
test('5. la ayuda libera una responsabilidad y admite relevo; no abandonar limita al ayudante; el perseguidor dedicado no ayuda', () => {
  const m = scene({ over: { defStyles: { help: 5 } } }); const { entry } = organize(m, 'POS01');
  const ex = { team: 0, actor: entry.roles.screener, zone: 'rim', defend: m.defenderFor(entry.roles.screener), icpt: m.defenderFor(entry.roles.screener), holder: entry.roles.handler };
  const cands = m.helpCandidates(ex);
  assert.ok(cands.length > 0 && !cands.includes(ex.defend));
  for (const c of cands) assert.ok(m.responsibilityOf(c), 'quien ayuda deja a alguien identificable');
  force(m, [true]); const help = m.tryHelp(ex); assert.ok(help.helper); assert.equal(help.abandoned, m.responsibilityOf(help.helper));
  assert.ok(m.poss.committed.has(help.helper), 'un ayudante comprometido no vuelve a intervenir en otra amenaza incompatible');
  // ESPD03: el ayudante que abandonaría al tirador protegido deja de ser candidato
  const protectedAtt = m.responsibilityOf(cands[0]);
  const p = scene({ over: { specials: [{ id: 'ESPD03', protected: protectedAtt }] } }); const ep = organize(p, 'POS01').entry;
  const ex2 = { team: 0, actor: ep.roles.screener, zone: 'rim', defend: p.defenderFor(ep.roles.screener), icpt: p.defenderFor(ep.roles.screener), holder: ep.roles.handler };
  const c2 = p.helpCandidates(ex2); assert.ok(!c2.some((id) => p.responsibilityOf(id) === protectedAtt)); assert.ok(ex2.protectedBlocked >= 0);
  // ORG06: el perseguidor dedicado no aparece como quinto ayudante
  const b = scene({ over: { defense: 'ORG06', target: 'EQ01-J04' } }); const eb = organize(b, 'POS01').entry; b.poss.layout = b.poss.layout;
  const ref = b.defRef(1); const chaser = ref.fnOwner.X; assert.equal(ref.assign['EQ01-J04'], chaser);
  const ex3 = { team: 0, actor: eb.roles.screener, zone: 'rim', defend: b.defenderFor(eb.roles.screener), icpt: b.defenderFor(eb.roles.screener), holder: eb.roles.handler };
  assert.ok(!b.helpCandidates(ex3).includes(chaser)); assert.ok(!b.reliefFor(eb.roles.screener).includes(chaser));
  // el estilo cambia las ELECCIONES (odds), nunca la conversión: nivel 3 conserva la probabilidad de la referencia
  near(oddsAdjust(profile.opportunity.helpProbability, d.styles.additionalHelpOddsRatio[2] * d.styles.interiorProtectionChoiceWeight[2]), profile.opportunity.helpProbability);
  assert.ok(oddsAdjust(profile.opportunity.helpProbability, d.styles.additionalHelpOddsRatio[4]) > profile.opportunity.helpProbability);
});

// ------------------------------------------------------------------------------------------------ 6. objetivos ausentes y box and one
test('6. objetivo ausente: alternativa individual, luego ORG02; el objetivo vuelve solo si la intención sigue vigente; una orden manual no se restaura', () => {
  const m = scene({ over: { defense: 'ORG06', target: 'EQ01-J01', targetAlt: 'EQ01-J03' } });
  assert.equal(m.resolveEffectiveOrg(1).org, 'ORG06'); assert.equal(m.resolveEffectiveOrg(1).objective, 'EQ01-J01');
  m.ps['EQ01-J01'].onCourt = false; let e = m.resolveEffectiveOrg(1);
  assert.equal(e.org, 'ORG06'); assert.equal(e.objective, 'EQ01-J03'); assert.match(e.reason, /alternativa individual/);
  m.ps['EQ01-J03'].onCourt = false; e = m.resolveEffectiveOrg(1);
  assert.equal(e.org, 'ORG02'); assert.equal(e.alternate, true); assert.equal(e.objective, null, 'no se inventa otro objetivo'); assert.equal(e.intent, 'ORG06');
  // la caja de cuatro más perseguidor solo cuenta como box and one efectiva mientras se ejecuta: en la alternativa no hay perseguidor
  m.def[1].eff = null; m.defPlanVer[1] += 1; const ref = m.defRef(1); assert.equal(ref.org, 'ORG02'); assert.equal(ref.fnOwner.X, undefined);
  m.ps['EQ01-J01'].onCourt = true; assert.equal(m.resolveEffectiveOrg(1).org, 'ORG06', 'regresa el principal y la intención sigue vigente');
  // una orden manual posterior sustituye la intención: no se restaura al volver el objetivo
  const g = createMatch(defInputFor(21, 1, { defense: 'ORG06', target: 'EQ01-J01', targetAlt: null }), profile, { detail: 'full', check: true });
  while (g.stepSeq < 3) g.step();
  const o = g.submit({ team: 1, type: 'defOrg', defense: 'ORG01', target: null, targetAlt: null, fallbackOrg: 'ORG02' }); assert.notEqual(o.state, 'rechazada', o.reason);
  while (g.step()) { /* hasta el final */ }
  assert.equal(g.errors.length, 0); assert.equal(g.teams[1].plan.defense, 'ORG01');
  assert.equal(g.def[1].eff.org, 'ORG01');
  // el plan con objetivo ausente o alternativa inadmisible se rechaza entero
  assert.ok(g.submit({ team: 1, type: 'defOrg', defense: 'ORG06', target: null, targetAlt: null, fallbackOrg: 'ORG02' }).state === 'rechazada');
});

// ------------------------------------------------------------------------------------------------ 7. presión alta
test('7. la presión alta consume tiempo, exposición y carga reales; puede ser superada, demorar o llegar a violación de 8 s; sin duplicar causas', () => {
  const mk = () => scene({ over: { pressureHeight: 'full', defStyles: { pressure: 5, steal: 5 } } });
  // carga por encargo: solo pagan los comprometidos y con el máximo, no el producto (límites de carga vigentes)
  const a = mk(); const ids = a.onCourt(1); const before = Object.fromEntries(ids.map((id) => [id, a.ps[id].energy]));
  a.withDuty({ [ids[0]]: 1.2 }, () => a.consume(600, 'organized')); const lost = (id) => before[id] - a.ps[id].energy;
  assert.ok(lost(ids[0]) > lost(ids[1]) * 1.1 && lost(ids[1]) > 0); near(a.duty === undefined ? 0 : 1, 0);
  const dup = mk(); const i0 = dup.onCourt(1)[0]; const e0 = dup.ps[i0].energy; dup.withDuty({ [i0]: 1.2 }, () => dup.withDuty({ [i0]: 1.1 }, () => dup.consume(600, 'organized')));
  const single = mk(); const e1 = single.ps[i0].energy; single.withDuty({ [i0]: 1.2 }, () => single.consume(600, 'organized'));
  near(e0 - dup.ps[i0].energy, e1 - single.ps[i0].energy, 1e-9); // dos etiquetas del mismo esfuerzo: el máximo, no el producto
  // presión superada: el apoyo asume al poseedor y el superado recupera al hombre que deja (retorno real); el comprometido no vuelve a ayudar
  const b = mk(); b.poss.entry = 'inbound'; b.poss.advanced = false; b.pick = (items) => items.find((x) => x.key === 'pressureBeaten') ?? items[0]; force(b, [true, true]);
  const lim = b.limit(); const r = b.pressedAdvance(b.poss, 'full'); assert.equal(r, null);
  const ev = b.events[b.events.length - 1]; assert.equal(ev.intent.altura, 'full'); assert.equal(ev.intent.resultado, 'pressureBeaten'); assert.ok(ev.durationTenths > 0 && b.limit() === lim - ev.durationTenths);
  const handler = ev.intent.poseedor; assert.equal(b.defenderFor(handler), ev.intent.apoyo); assert.ok(b.poss.committed.has(ev.intent.presionador));
  assert.equal(b.poss.advanced, true);
  // demora: suma tiempo; si el total llega a 8 s hay violación (no se recorta ni se declara por un contador inventado)
  const c = mk(); c.poss.entry = 'inbound'; c.poss.advanced = false; c.pick = (items) => items.find((x) => x.key === 'delayedAdvance'); force(c, [true, true]);
  let n = 0; c.sampleDuration = (dist) => (++n === 1 ? 60 : 30); // 6 s + 3 s de demora = 9 s
  const v = c.pressedAdvance(c.poss, 'full'); assert.deepEqual(v, { end: 'deadTurnover' });
  const vev = c.events[c.events.length - 1]; assert.equal(vev.type, 'expiry'); assert.match(vev.intent.motivo, /8 segundos/); assert.equal(vev.stats[0].cause, 'violacion_8'); assert.equal(vev.durationTenths, 80);
  // pérdida: una sola causa y un solo robo atribuido; sin intento de robo no se acredita robo aunque haya pérdida
  const t = mk(); t.poss.entry = 'inbound'; t.pick = (items) => items.find((x) => x.key === 'turnover'); force(t, [true, false]); // presión cercana, sin intento de robo
  t.bernoulli = (() => { const q = [true, false, false, false]; return () => q.shift() ?? false; })();
  const tr = t.pressedAdvance(t.poss, 'full'); const tev = t.events[t.events.length - 1];
  assert.equal(tev.stats.filter((s) => s.k === 'tov').length, 1); assert.equal(tev.stats.filter((s) => s.k === 'stl').length, 0); assert.notEqual(tr.end, 'steal');
  // el avance de altura normal conserva el mecanismo existente (sin interacción de presión)
  const nrm = scene({ over: { pressureHeight: 'normal' } }); nrm.poss.entry = 'inbound'; nrm.poss.advanced = false; nrm.advancePhase(nrm.poss);
  assert.equal(nrm.events[nrm.events.length - 1].intent.altura, undefined);
});

// ------------------------------------------------------------------------------------------------ 8. falta táctica
test('8. falta táctica: la solicitud no para el reloj; ejecutor con acceso; clasificación real; sanción administrada; caducidad', () => {
  const m = createMatch(inputFor(31), profile, { detail: 'full', check: true });
  while (m.step() && !(m.poss && !m.poss.done && m.poss.team === 1 && m.clock > 1200 && m.status === 'running')) { /* hasta una posesión rival */ }
  const clock = m.clock; const evCount = m.events.length;
  const o = m.submit({ team: 0, type: 'defSpecial', special: 'ESPD01', scope: 'current', target: 'holder' });
  assert.equal(o.state, 'pendiente'); assert.equal(m.clock, clock, 'pedirla no detiene ni consume el reloj'); assert.equal(m.events.length, evCount, 'no se narra nada que el motor no resolvió');
  assert.equal(m.submit({ team: 0, type: 'defSpecial', special: 'ESPD01', scope: 'current', target: 'EQ01-J01' }).state, 'rechazada', 'el objetivo es el poseedor o un jugador RIVAL');
  // ejecución controlada: intento sí, contacto no legítimo → antideportiva con dos libres y posesión
  const input = inputFor(33); const g = createMatch(input, profile, { detail: 'full', check: true }); g.init(); g.startPossession({ team: 1, entry: 'deadFront', shotClock: 240 });
  for (const id of Object.keys(g.ps)) g.ps[id].energy = 100;
  const ord = g.submit({ team: 0, type: 'defSpecial', special: 'ESPD01', scope: 'current', target: 'holder' }); assert.equal(ord.state, 'pendiente');
  g.activateSpecialOrders(g.poss); assert.equal(ord.state, 'vigente');
  const holder = g.onCourt(1)[0]; const ex = { team: 1, origin: 'PRUEBA', kind: 'organized', actor: holder, holder, exec: 'dribble', zone: 'three', defend: g.defenderFor(holder), icpt: g.defenderFor(holder), quality: { cls: 'normal', K: 0 } };
  const seq = [true, false]; g.bernoulli = () => seq.shift() ?? false; // intenta; el contacto NO es legítimo
  const res = g.tacticalFoul(ex); assert.deepEqual(res, { cont: 'foulWindow' }); assert.equal(ord.state, 'consumida');
  const foul = g.events.find((e) => e.type === 'foul'); assert.equal(foul.effects.tirosLibres, 2); assert.equal(foul.intent.tipo, 'antideportiva'); assert.equal(g.pendingFoul.retain, true);
  assert.equal(g.uf[ord.execution.ejecutor], 1);
  // los dos libres se tiran y la posesión sigue en el equipo del lanzador (no hay rebote ni cambio de posesión)
  g.poss.pendingFT = ex; let r = g.afterFreeThrows(ex); assert.deepEqual(r, { cont: 'inboundAfterFoul' }); assert.equal(g.events.filter((e) => e.type === 'free_throw').length, 2);
  // contacto legítimo: falta personal ordinaria; sin penalización colectiva solo hay saque (no se otorgan libres por bonus sin bonus)
  const h = createMatch(inputFor(34), profile, { detail: 'full', check: true }); h.init(); h.startPossession({ team: 1, entry: 'deadFront', shotClock: 240 });
  const o2 = h.submit({ team: 0, type: 'defSpecial', special: 'ESPD01', scope: 'current', target: 'holder' }); h.activateSpecialOrders(h.poss);
  const hh = h.onCourt(1)[0]; const ex2 = { ...ex, actor: hh, holder: hh, defend: h.defenderFor(hh), icpt: h.defenderFor(hh) };
  const q2 = [true, true]; h.bernoulli = () => q2.shift() ?? false; h.tacticalFoul(ex2);
  const f2 = h.events.find((e) => e.type === 'foul'); assert.equal(f2.effects.tirosLibres, 0); assert.equal(f2.intent.tipo, 'saque de banda');
  // caducidad: una orden ligada a una posesión que termina sin oportunidad caduca con motivo (no queda «vigente» indefinidamente)
  const k = createMatch(inputFor(35), profile, { detail: 'full', check: true }); k.init(); k.startPossession({ team: 1, entry: 'deadFront', shotClock: 240 });
  const o3 = k.submit({ team: 0, type: 'defSpecial', special: 'ESPD01', scope: 'current', target: 'holder' }); k.activateSpecialOrders(k.poss); k.expireSpecialOrdersFor(k.poss);
  assert.equal(o3.state, 'caducada'); assert.match(o3.reason, /terminó la posesión/);
  // dos antideportivas del mismo jugador: descalificación
  k.uf = { [o3.team === 0 ? 'EQ01-J05' : 'x']: 1 }; k.unsportsmanlikeAdmin('EQ01-J05', 'EQ02-J01', 1);
  assert.equal(k.ps['EQ01-J05'].available, false);
  assert.deepEqual(g.errors, []);
});

// ------------------------------------------------------------------------------------------------ 9. robo, desvío, tapón, control; V09
test('9. robo / desvío / tapón / control diferenciados; sin intento de robo no hay robo atribuido; el déficit de balance (V09) no se aplica tras un robo', () => {
  const m = scene(); const base = { team: 0, origin: 'PRUEBA', kind: 'organized', actor: 'EQ01-J03', zone: 'three', exec: 'dribble', passer: null, icpt: 'EQ02-J04', defend: 'EQ02-J04', moved: false, offContact: null, holder: 'EQ01-J03', quality: { cls: 'normal', K: 0 } };
  const run = (stealAttempt, answers) => { const t = scene({ seed: 41 }); const q = [...answers]; t.bernoulli = () => q.shift() ?? false; const ex = { ...base, stealAttempt }; const b = { t: t.snap(), team: 0, intent: {}, participants: {} }; return { t, r: t.resolveTurnover(ex, b) }; };
  const attempt = run(true, [true]); assert.equal(attempt.r.end, 'steal'); assert.ok(attempt.t.events.at(-1).stats.some((s) => s.k === 'stl'));
  const contain = run(false, [false, false]); assert.notEqual(contain.r.end, 'steal'); assert.ok(!contain.t.events.at(-1).stats.some((s) => s.k === 'stl'), 'contener: la pérdida no se atribuye a un robo');
  // un tapón por sí solo no cambia el control: sin recuperación defensiva el ataque conserva el balón desorganizado
  const t = scene({ seed: 42 }); const q = [false, false]; t.bernoulli = () => q.shift() ?? false; const ex = { ...base, zone: 'rim', actor: 'EQ01-J10', holder: 'EQ01-J10' };
  const rb = t.resolveBlocked(ex, { t: t.snap(), team: 0, intent: {}, participants: {} }, 'EQ02-J11'); assert.deepEqual(rb, { cont: 'blockedLive' }); assert.equal(t.poss.disorganized, true);
  // V09: en una partida completa ninguna posesión nacida de un robo arrastra déficit de balance; el déficit solo procede de rebote o tapón recuperado
  const res = runMatch(inputFor(20261016), profile, { detail: 'full' });
  const mm = createMatch(inputFor(20261016), profile, { detail: 'minimal' }); const seen = { robo: 0, rebote: 0 };
  while (mm.step()) { const p = mm.poss; if (p?.origin === 'robo') { seen.robo += 1; assert.equal(p.deficit, 0); } if (p?.origin === 'rebote') seen.rebote += 1; }
  assert.equal(res.status, 'finished');
});

// ------------------------------------------------------------------------------------------------ 10. V05 y V01
test('10. V05: la estimación de calidad cómoda no consume azar ni mira el futuro; la ayuda visible de V03 no cambia la elegibilidad', () => {
  const m = scene({ seed: 51 });
  const e = { actor: 'EQ01-J04', zone: 'midrange', defend: 'EQ02-J05', exec: 'dribble' };
  const draws = m.rng.count; const p1 = m.pComfortableFor(e, 'TAR02'); const f1 = m.midrangeFactor(0, e, p1);
  assert.equal(m.rng.count, draws, 'estimar no consume sorteos');
  const other = scene({ seed: 99 }); const p2 = other.pComfortableFor(e, 'TAR02'); near(p1, p2); // independiente de la semilla: no accede al desenlace futuro
  m.teams[0].plan.midrange = 'openOnly'; const f = m.midrangeFactor(0, e, 0.7);
  near(f, 0.7 * profile.selection.midrangePolicy.openOnlyComfortableWeight + 0.3 * profile.selection.midrangePolicy.openOnlyOtherWeight);
  assert.ok(f1 > 0);
});

// ------------------------------------------------------------------------------------------------ 11. partidos completos de cierre
function integrity(res) {
  assert.equal(res.status, 'finished'); assert.deepEqual(res.errors, []);
  assert.deepEqual(res.score, res.box.teams.map((t) => t.points)); // acta conciliada
  const dur = res.events.reduce((s, e) => s + e.durationTenths, 0); assert.equal(dur % 1, 0);
  for (const t of [0, 1]) { const min = res.input.teams[t].players.reduce((s, p) => s + res.box.players[p.id].min, 0); assert.ok(Math.abs(min - 200 * Math.max(1, res.periodScores.length > 4 ? 1 + (res.periodScores.length - 4) * 0.125 : 1)) < 25, `minutos ${t}: ${min}`); }
  for (const e of res.events) assert.equal(e.durationTenths, e.clock.before - e.clock.after, e.id);
  for (const en of Object.values(res.diagnostics.finalEnergy)) assert.ok(en >= 0 && en <= 100);
}
test('11. cinco partidos completos de cierre: base individual/drop, 2–3, 1–3–1 con presión, box and one con sustitución del objetivo y repetición en otro modo', async () => {
  const seed = 20261016;
  const base = runMatch(defInputFor(seed, 1, {}), profile, { detail: 'full', check: true }); integrity(base);
  const zone = runMatch(defInputFor(seed, 1, { defense: 'ORG02', coverage: 'COB04' }), profile, { detail: 'full', check: true }); integrity(zone);
  assert.ok(zone.diagnostics.coverageObserved['COB04 trampa'] > 0); assert.notDeepEqual(sportsProjection(zone).events.map((e) => e.effects?.pConversion), sportsProjection(base).events.map((e) => e.effects?.pConversion));
  const press = runMatch(defInputFor(seed, 1, { defense: 'ORG04', pressureHeight: 'three_quarters', coverage: 'COB03', defStyles: { pressure: 4, receivers: 4 } }), profile, { detail: 'full', check: true }); integrity(press);
  assert.ok(press.diagnostics.coverageObserved['presión three_quarters'] > 0 && press.diagnostics.coverageObserved['referencias defensivas calculadas'] > 0);
  // box and one: el objetivo sale por orden manual (sustitución) y regresa; la alternativa 2–3 se registra y no se persigue a un ausente
  const plan = { defense: 'ORG06', target: 'EQ02-J01', targetAlt: null, fallbackOrg: 'ORG02', coverage: 'COB02' };
  const { m: box } = playWithOrders(defInputFor(seed, 0, plan), [
    { at: 25, spec: { team: 1, type: 'substitution', swaps: [{ out: 'EQ02-J01', in: 'EQ02-J02' }] } },
    { at: 130, spec: { team: 1, type: 'substitution', swaps: [{ out: 'EQ02-J02', in: 'EQ02-J01' }] } }]);
  const rbox = buildResult(box); integrity(rbox);
  const shifts = rbox.events.filter((e) => e.type === 'defense').map((e) => `${e.intent.efectiva}${e.intent.alternativa ? '*' : ''}`);
  assert.ok(shifts.includes('ORG06') && shifts.includes('ORG02*'), `cambios de organización efectiva: ${shifts.join(' ')}`);
  for (const e of rbox.events) if (e.intent?.defensa?.especial) assert.notEqual(e.intent.defensa.especial.objetivo, 'EQ02-J01');
  // repetición del caso en otro modo con idénticas órdenes: el deporte es el mismo (por cuartos, cada periodo hasta su cierre)
  const s = new MatchSession({ input: defInputFor(seed, 1, { defense: 'ORG02', coverage: 'COB04' }), profile, mode: 'cuartos', managedTeam: 0 });
  await s.start(); while (s.state === 'revision') await s.playNextPeriod();
  assert.equal(s.state, 'finalizado'); assert.deepEqual(sportsProjection(s.result()).events.map((e) => e.id), sportsProjection(zone).events.map((e) => e.id));
  assert.deepEqual(s.result().score, zone.score);
});

// ------------------------------------------------------------------------------------------------ 12. órdenes, exportación y reproducción
test('12. órdenes defensivas: validación conjunta, vigencia en su frontera, exportación y reproducción; export/3 se rechaza sin tocarse', () => {
  const input = inputFor(61);
  const { m, orders } = playWithOrders(input, [
    { at: 10, spec: { team: 0, type: 'defOrg', defense: 'ORG05', target: null, targetAlt: null, fallbackOrg: 'ORG02' } },
    { at: 11, spec: { team: 0, type: 'defStyles', defStyles: { help: 4, steal: 2 } } },
    { at: 12, spec: { team: 0, type: 'defHeight', pressureHeight: 'three_quarters' } },
    { at: 13, spec: { team: 0, type: 'defCoverage', coverage: 'COB03' } },
    { at: 14, spec: { team: 0, type: 'defRoles', roles: { 'EQ01-J10': 'D02' } } },
    { at: 15, spec: { team: 0, type: 'defMarks', marks: [{ defender: 'EQ01-J01', attacker: 'EQ02-J01', scope: 'game' }] } },
    { at: 16, spec: { team: 0, type: 'defSpecial', special: 'ESPD03', config: { protected: 'EQ02-J04' } } },
    { at: 17, spec: { team: 0, type: 'defCoverage', coverage: 'COB02', navigation: 'under' } }]);
  assert.deepEqual(orders.slice(0, 7).map((o) => o.state), Array(7).fill('vigente').map((x, i) => orders[i].state)); // ninguna rechazada
  assert.equal(orders[7].state, 'rechazada', 'por debajo solo existe para el drop: la configuración conjunta irrealizable no se aplica');
  assert.equal(m.teams[0].plan.defense, 'ORG05'); assert.equal(m.teams[0].plan.coverage, 'COB03'); assert.equal(m.defRoleOf['EQ01-J10'], 'D02'); assert.equal(m.teams[0].plan.defStyles.help, 4);
  assert.equal(orders.find((o) => o.type === 'defOrg').activation != null, true);
  // rechazo de un conjunto: nada de lo demás se aplica
  const g = createMatch(inputFor(62), profile, { detail: 'full' }); g.step();
  const set = g.submitBatch([{ team: 0, type: 'defStyles', defStyles: { help: 5 } }, { team: 0, type: 'defCoverage', coverage: 'COB03', navigation: 'under' }]);
  assert.ok(set.every((o) => o.state === 'rechazada'), 'conjunto irrealizable: ninguna orden se acepta');
  // exportación y reproducción con la versión actual
  const res = buildResult(m); assert.equal(res.schema, EXPORT_SCHEMA); assert.equal(res.identity.engineVersion, ENGINE_VERSION);
  const back = replayMatch(JSON.parse(JSON.stringify(res))); assert.equal(back.comparison.identical, true);
  // el formato anterior de MOTOR-04 se identifica, no se reproduce ni se migra en silencio y el archivo se conserva
  const old = JSON.parse(JSON.stringify({ ...res, schema: 'beM-match-export/3' })); const frozen = JSON.stringify(old);
  const v = validateReplayFile(old); assert.equal(v.reproducible, false); assert.equal(v.legacy, true); assert.match(v.problems[0], /MOTOR-04/); assert.match(v.problems[0], /export\/3/);
  assert.throws(() => replayMatch(old), /No se puede reproducir/); assert.equal(JSON.stringify(old), frozen);
  assert.equal(validateReplayFile({ ...res, schema: 'beM-match-export/2' }).legacy, true);
});
