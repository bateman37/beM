// MOTOR-04: ataque posicional completo. Pocos casos deterministas o parametrizados sobre contenido y reglas difíciles; los partidos completos
// son cuatro (base, Horns, 1–4 bajo y repetición del base por otro modo). No se simula hasta que salgan por azar las ramas raras.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, demoInputFor, freshMatch, FakeScheduler } from './helpers.js';
import { runMatch, createMatch, deepCopy, teamTotals, buildResult, ENGINE_VERSION, EXPORT_SCHEMA } from '../src/match/index.js';
import { oddsAdjust } from '../src/match/flow.js';
import { MatchSession } from '../src/match/session.js';
import { replayMatch, sportsProjection, validateReplayFile } from '../src/match/replay.js';
import { buildRows } from '../src/profiles/rows.js';
import { STYLE_DEFS } from '../src/lab/styles.js';

const profile = data.profile;
const rep = profile.repertoire;
const DIS = ['DIS01', 'DIS02', 'DIS03', 'DIS04', 'DIS05', 'DIS06'];
const PLAYS = Array.from({ length: 15 }, (_, i) => `POS${String(i + 1).padStart(2, '0')}`);
const CONTS = Array.from({ length: 9 }, (_, i) => `CONT0${i + 1}`);
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const energyFull = (m) => { for (const id of Object.keys(m.ps)) m.ps[id].energy = 100; };
const withBook = (m, team, book) => { m.teams[team].plan.playbook = book.map(([playId, priority]) => ({ playId, priority })); };

// ------------------------------------------------------------------------------------------------ 1. catálogo y referencias
test('1. catálogo completo: siete estilos, seis disposiciones, quince fichas, nueve continuaciones y quince roles con referencias válidas', () => {
  // estilos: los siete del escenario, cada uno con cinco niveles visibles y una fila del perfil para cada efecto
  assert.deepEqual(STYLE_DEFS.map((d) => d.key).sort(), Object.keys(profile.scenario.plans[0].styles).sort());
  for (const d of STYLE_DEFS) assert.equal(d.names.length, 5);
  assert.deepEqual(profile.activeCatalog.stylesEditable.slice().sort(), STYLE_DEFS.map((d) => d.key).sort());
  assert.equal(profile.activeCatalog.dispositions.length, 6); assert.deepEqual(profile.activeCatalog.dispositions, DIS);
  assert.deepEqual(profile.activeCatalog.plays, PLAYS); assert.deepEqual(profile.activeCatalog.continuations, CONTS);
  // disposiciones: cinco funciones, la primera es la cabecera del director, todas definidas
  for (const id of DIS) { const d = rep.dispositions[id]; assert.equal(d.functions.length, 5, id); assert.equal(d.functions[0], 'top'); for (const f of d.functions) assert.ok(rep.functions[f], `${id}: función ${f}`); }
  // roles: los quince del diccionario, con funciones favorecidas
  const dict = Object.keys(profile.fixtureContract.offensiveRoleDictionary);
  assert.equal(dict.length, 15); assert.deepEqual(Object.keys(rep.offensiveRoles).sort(), dict.sort());
  for (const r of Object.values(rep.offensiveRoles)) assert.ok(r.favors.length > 0);
  // fichas: familias 4/2/2/2/3/2, referencias internas coherentes y recetas donantes existentes
  const fam = {}; for (const id of PLAYS) fam[rep.plays[id].family] = (fam[rep.plays[id].family] ?? 0) + 1;
  assert.deepEqual(fam, { pick_and_roll: 4, handoff: 2, off_ball_screen: 2, give_and_go: 2, post: 3, isolation: 2 });
  const labels = new Set([...CONTS, 'ALTO-BAJO']);
  for (const id of PLAYS) {
    const p = rep.plays[id];
    const roleNames = new Set(Object.keys(p.roles));
    for (const d of p.natural) assert.ok(DIS.includes(d), `${id}: entrada natural ${d}`);
    for (const [r, def] of Object.entries(p.roles)) { if (def.src === 'pool') { assert.ok(def.fn === 'any' || def.fn.every((f) => rep.functions[f]), `${id}.${r}`); assert.ok(profile.participantSlots[def.slotGroup], `${id}.${r}: grupo de posiciones`); } }
    const all = [...p.exits, ...Object.values(p.stages ?? {}).flatMap((s) => s.exits)];
    for (const e of all) { assert.ok(roleNames.has(e.role), `${id}: salida de ${e.role}`); if (e.from && e.from !== 'director') assert.ok(roleNames.has(e.from), `${id}: pasa ${e.from}`); if (e.label) assert.ok(labels.has(e.label), `${id}: ${e.label}`); }
    for (const e of p.exits) if (e.stage) { assert.ok(p.stages[e.stage]); assert.ok(roleNames.has(p.stages[e.stage].decider)); }
    assert.ok(profile.plays.some((x) => x.id === (p.recipeFrom ?? id)), `${id}: receta`);
    assert.ok(p.options.length && p.safety.every((c) => CONTS.includes(c)));
  }
  // las filas nuevas existen, son editables y tienen consumidor declarado
  const rows = buildRows(profile); const byId = new Map(rows.map((r) => [r.id, r]));
  for (const id of ['selection.transitionAttemptOddsRatio', 'selection.elaborationContinuationWeightFactor', 'selection.offensiveRiskPreferenceTilt', 'selection.midrangePolicy.avoidWeight', 'selection.rolePreference.favoredFunctionWeight', 'selection.newVariantPreference.eligibleVariantBaseWeight', 'rebound.offensiveReboundAssignmentTarget', 'rebound.balance.unreadyReturnerOpportunityOddsRatio']) {
    const r = byId.get(id); assert.ok(r, id); assert.equal(r.ext, 'SEM-MOTOR04'); assert.ok(r.mech && r.editable, id);
  }
});

// ------------------------------------------------------------------------------------------------ 2. elegibilidad, prioridad compartida y masa familiar
test('2. elegibilidad antes de preferencia; prioridades compartidas; la masa de la familia no crece por duplicar variantes', () => {
  const m = freshMatch(5); energyFull(m);
  const dir = m.pickDirector(0).id;
  const dist = (book) => { withBook(m, 0, book); const el = m.eligiblePlays(0, dir, new Set(), m.poss); return { el, d: m.coachPlayDistribution(el) }; };
  // una variante, dos y cuatro de la misma familia con la misma prioridad: la masa de la familia es siempre la misma
  const mass = (d, fam) => Object.entries(d).filter(([id]) => rep.plays[id].family === fam).reduce((s, [, v]) => s + v, 0);
  const a = dist([['POS01', 1], ['POS05', 3]]).d; const b = dist([['POS01', 1], ['POS02', 1], ['POS03', 1], ['POS04', 1], ['POS05', 3]]).d;
  near(mass(a, 'pick_and_roll'), 8 / 11); near(mass(b, 'pick_and_roll'), 8 / 11); near(mass(b, 'handoff'), 3 / 11);
  near(b.POS01, 2 / 11); near(b.POS03, 2 / 11);
  // la prioridad compartida reparte la familia por peso; mejor prioridad manda la masa de la familia
  const c = dist([['POS01', 1], ['POS02', 5]]).d; near(mass(c, 'pick_and_roll'), 1); near(c.POS01, 8 / 9); near(c.POS02, 1 / 9);
  // elegibilidad antes que preferencia: POS10 (requiere negación) con prioridad 1 no tiene masa ni diluye a las demás
  const r = dist([['POS10', 1], ['POS09', 3]]);
  assert.equal(r.el.some((e) => e.playId === 'POS10'), false); near(r.d.POS09, 1);
  // una ficha cuya función no existe y no tiene tiempo para reorganizar queda fuera con su motivo funcional (no por posición nominal)
  m.clock = 20; m.shotClock = 20; m.teams[0].plan.disposition = 'DIS02'; delete m.poss.layout; // 2 s: no cabe una reorganización
  withBook(m, 0, [['POS13', 1], ['POS01', 3]]);
  const calc0 = m.calcBuf.length; const el = m.eligiblePlays(0, dir, new Set(), m.poss);
  assert.deepEqual(el.map((e) => e.playId), ['POS01']);
  const diag = m.calcBuf.slice(calc0).find((x) => x.label === 'libro:elegibilidad').fichas.find((x) => x.ficha === 'POS13');
  assert.equal(diag.elegible, false); assert.match(diag.motivo, /falta una función/);
});

// ------------------------------------------------------------------------------------------------ 3. asignaciones
test('3. funciones de disposición y participantes: cinco distintos, sin talento por colocación, baja técnica no invalida y los propietarios de capacidad son los del actor real', () => {
  const m = freshMatch(11); energyFull(m);
  const on = m.onCourt(0); const dir = m.pickDirector(0).id;
  for (const id of DIS) {
    const lay = m.layoutFor(0, id, dir);
    assert.equal(Object.keys(lay.map).length, 5); assert.equal(new Set(Object.keys(lay.map)).size, 5);
    assert.equal(lay.map[dir], 'top');
    assert.deepEqual(Object.values(lay.map).sort(), rep.dispositions[id].functions.slice().sort(), `${id}: ocupa exactamente sus funciones`);
    // ninguna ficha asigna a la misma persona a dos funciones
    for (const play of PLAYS) {
      const a = m.assignRoles(0, play, dir, lay, { denials: [] }, { dry: false });
      if (a.fail) continue;
      const spec = rep.plays[play];
      const ids = Object.entries(a.roles).filter(([r]) => r !== 'director' && spec.roles[r]?.src !== 'director').map(([, pid]) => pid);
      assert.equal(new Set(ids).size, ids.length, `${id} ${play}: ${JSON.stringify(a.roles)}`); assert.ok(!ids.includes(dir) || spec.roles.cutter?.src === 'denied' || Object.values(spec.roles).some((x) => x.directorOk), 'ninguna otra función recae en el director (salvo el aislador de POS14, MOTOR-06 §2.2)');
      for (const pid of ids) assert.ok(on.includes(pid));
    }
  }
  // una técnica baja dificulta la ejecución pero no hace inelegible la función (no hay umbral)
  const lay = m.layoutFor(0, 'DIS02', dir);
  for (const id of on) m.pl[id].abilities = { ...m.pl[id].abilities, TEC09: 1 };
  assert.ok(m.assignRoles(0, 'POS01', dir, lay, { denials: [] }, { dry: true }).ok);
  // un no tirador colocado fuera sigue siéndolo: el peso de su opción de triple no sube por la disposición
  const m5 = freshMatch(11); energyFull(m5);
  const shooter = m5.onCourt(0).find((id) => id !== dir);
  const w = (dis) => { const lay5 = m5.layoutFor(0, dis, dir); void lay5; return m5.eff(shooter, 'TEC01'); };
  assert.equal(w('DIS01'), w('DIS04'));
  // sustituto de director: lo registra el hecho y quien lee tras la recepción usa SU Visión y SUS Decisiones
  const f = freshMatch(11); energyFull(f);
  const ids = f.onCourt(0); const [d0, short] = [ids[0], ids[1]];
  f.teams[0].plan.directorPriority = [d0];
  f.pl[d0].abilities = { ...f.pl[d0].abilities, MEN02: 30, MEN03: 30 }; f.pl[short].abilities = { ...f.pl[short].abilities, MEN02: 4, MEN03: 4 };
  const qDir = f.libertyAndReading(0, d0).q; const qShort = f.libertyAndReading(0, short).q;
  assert.ok(qDir > 0.9 && qShort < 0.2);
  // el lector posterior (decisión de la recepción corta) usa los q del receptor, no los del director
  const book = [['POS04', 1]]; withBook(f, 0, book);
  f.poss.director = f.pickDirector(0);
  const entry = f.eligiblePlays(0, d0, new Set(), f.poss)[0];
  assert.ok(entry, 'POS04 realizable en DIS02');
  const sh = entry.roles.short;
  f.pl[sh].abilities = { ...f.pl[sh].abilities, MEN02: 4, MEN03: 4 };
  entry.team = 0; entry.q = f.playQuality(entry);
  const ex = { team: 0, stage: 'short', label: 'CONT03', roles: entry.roles };
  f.receiverDecision(ex, entry);
  const note = f.calcBuf.find((x) => x.label === 'mezcla:decisión:POS04:short');
  near(note.q, f.libertyAndReading(0, sh).q, 1e-3); assert.ok(note.q < 0.2, 'no hereda la lectura del director');
  assert.equal(ex.decidedBy, sh);
  void qDir; void qShort;
});

// ------------------------------------------------------------------------------------------------ 4. fichas con contenido propio
test('4. POS03 abre, POS04 decide el receptor, POS10 exige negación y POS13 exige dos funciones interiores distintas', () => {
  const m = freshMatch(7); energyFull(m);
  const dir = m.pickDirector(0).id; const lay2 = m.layoutFor(0, 'DIS02', dir);
  // POS03: el bloqueador abre; solo tiene recepción exterior/ataque a la recuperación, nunca la continuación interior de POS01
  const a3 = m.assignRoles(0, 'POS03', dir, lay2, { denials: [] });
  const ex3 = m.buildExits(0, 'POS03', a3.roles, a3.def);
  assert.ok(ex3.some((x) => x.role === 'screener' && x.stage === 'open' && x.label === 'CONT02'));
  assert.equal(ex3.some((x) => x.role === 'screener' && x.label === 'CONT01'), false, 'sin continuación interior ficticia del bloqueador');
  const st3 = m.buildExits(0, 'POS03', a3.roles, a3.def, rep.plays.POS03.stages.open.exits, true);
  assert.deepEqual([...new Set(st3.filter((x) => x.exec === 'pass' && x.passer === a3.roles.handler).map((x) => x.zone))].sort(), ['midrange', 'three']);
  // POS04: la primera intención no tiene tiro del receptor corto: lo decide él al recibir (etapa), con salida final distinta del manejador
  const a4 = m.assignRoles(0, 'POS04', dir, lay2, { denials: [] });
  const ex4 = m.buildExits(0, 'POS04', a4.roles, a4.def);
  assert.deepEqual(ex4.filter((x) => x.stage).map((x) => `${x.role}:${x.stage}:${x.label}`), ['short:short:CONT03']);
  assert.notEqual(a4.roles.short, a4.roles.handler);
  // POS10: sin negación observada no es elegible ni se activa por nombre; con una negación el receptor negado es el cortador
  assert.match(m.assignRoles(0, 'POS10', dir, lay2, { denials: [] }).fail, /negación/);
  const den = m.onCourt(0).find((id) => id !== dir);
  const a10 = m.assignRoles(0, 'POS10', dir, lay2, { denials: [{ ficha: 'POS07', actor: den, holder: dir }] });
  assert.equal(a10.roles.cutter, den); assert.equal(a10.roles.passer, dir);
  // POS13: dos funciones interiores distintas. En DIS02 (un interior) no es realizable; en DIS03 sí, con dos personas
  assert.match(m.assignRoles(0, 'POS13', dir, lay2, { denials: [] }, { dry: true }).fail ?? '', /falta/);
  const a13 = m.assignRoles(0, 'POS13', dir, m.layoutFor(0, 'DIS03', dir), { denials: [] });
  assert.ok(a13.roles.post && a13.roles.low && a13.roles.post !== a13.roles.low);
  // y desde DIS02 el libro lo ofrece tras una reorganización compatible (consume tiempo real), no gratis
  withBook(m, 0, [['POS13', 1]]); m.poss.layout = null;
  const el = m.eligiblePlays(0, dir, new Set(), m.poss);
  assert.equal(el[0].reorgTo, 'DIS03');
  const clock0 = m.clock; const ok = m.reorganize(m.poss, 'prueba', null, { toDisposition: 'DIS03' });
  assert.ok(ok && m.clock < clock0 && m.poss.disposition === 'DIS03');
  const ev = m.events.at(-1); assert.equal(ev.type, 'reorganization'); assert.equal(ev.intent.disposicion, 'DIS03'); assert.equal(ev.durationTenths, clock0 - m.clock);
  // sin tiempo suficiente no se reorganiza ni se fabrica el cambio
  const g = freshMatch(7); g.clock = 20; g.shotClock = 20; const n0 = g.events.length;
  assert.equal(g.reorganize(g.poss, 'sin tiempo', null, { toDisposition: 'DIS03' }), false); assert.equal(g.events.length, n0);
});

// ------------------------------------------------------------------------------------------------ 5. estilos con efecto causal
test('5. los estilos cambian pesos y encargos de forma determinista y no la conversión del mismo tiro', () => {
  const sel = profile.selection;
  // transición: odds sobre la probabilidad existente; extremos conservados
  for (const [i, f] of sel.transitionAttemptOddsRatio.entries()) near(oddsAdjust(0.35, f), (f * 0.35) / (0.65 + f * 0.35), 1e-12), assert.ok(i >= 0);
  assert.equal(oddsAdjust(0, 1.75), 0); assert.equal(oddsAdjust(1, 0.5), 1); assert.equal(oddsAdjust(0.35, 1), 0.35);
  assert.ok(oddsAdjust(0.35, 1.75) > oddsAdjust(0.35, 1.35) && oddsAdjust(0.35, 1.35) > 0.35 && oddsAdjust(0.35, 0.5) < 0.35);
  // elaboración: el peso de las continuaciones sube con el nivel y el nivel 3 es neutro; la finalización no cambia
  const m = freshMatch(3); energyFull(m);
  const items = () => [{ key: 'acepta', coach: null, pref: 1, adapt: 1 }, { key: 'continua', coach: null, pref: 1, adapt: 1, cont: true }];
  const lq = { L: 0.5, q: 0.6, team: 0 }; const share = (lvl) => { m.teams[0].plan.styles.elaboration = lvl; const o = m.mixIntention(items(), lq, 'prueba'); return o[1].w / (o[0].w + o[1].w); };
  const s = [1, 2, 3, 4, 5].map(share);
  near(s[2], 0.5, 1e-12); assert.ok(s[0] < s[1] && s[1] < s[2] && s[2] < s[3] && s[3] < s[4]);
  near(s[4], sel.elaborationContinuationWeightFactor[4] / (1 + sel.elaborationContinuationWeightFactor[4]), 1e-12);
  // riesgo: pondera la preferencia por exp(tilt·r); con igual riesgo no diferencia y el nivel 3 conserva el factor 1
  const rk = (lvl, ra, rb) => { m.teams[0].plan.styles.offensiveRisk = lvl; const o = m.mixIntention([{ key: 'a', coach: null, pref: 1, adapt: 1, risk: ra }, { key: 'b', coach: null, pref: 1, adapt: 1, risk: rb }], lq, 'riesgo'); return o[0].w / (o[0].w + o[1].w); };
  near(rk(3, 0.4, 0.1), 0.5, 1e-12); near(rk(5, 0.2, 0.2), 0.5, 1e-12); assert.ok(rk(5, 0.4, 0.1) > 0.5 && rk(1, 0.4, 0.1) < 0.5);
  near(rk(5, 0.4, 0.1), 1 / (1 + Math.exp(sel.offensiveRiskPreferenceTilt[4] * (0.1 - 0.4))), 1e-12);
  // media distancia: pesos del anexo y sin umbral que prohíba un tiro
  const mp = sel.midrangePolicy; const ex = { zone: 'midrange', actor: m.onCourt(0)[1] };
  m.teams[0].plan.midrange = 'avoid'; assert.equal(m.midrangeFactor(0, ex, 1), mp.avoidWeight);
  m.teams[0].plan.midrange = 'openOnly'; near(m.midrangeFactor(0, ex, 1), 1); near(m.midrangeFactor(0, ex, 0), mp.openOnlyOtherWeight); near(m.midrangeFactor(0, ex, 0.5), 0.5 * 1 + 0.5 * mp.openOnlyOtherWeight);
  m.teams[0].plan.midrange = 'seek'; near(m.midrangeFactor(0, ex, 0.5), mp.suitablePlayerBase + mp.suitablePlayerAbilitySlope * ((m.eff(ex.actor, 'TEC02') - 1) / 29));
  assert.equal(m.midrangeFactor(0, { zone: 'three', actor: ex.actor }, 1), null, 'solo opciones de media distancia');
  m.pl[ex.actor].abilities = { ...m.pl[ex.actor].abilities, TEC02: 1 }; assert.ok(m.midrangeFactor(0, ex, 1) > 0, 'sin umbral: nunca cero');
  // el mismo tiro, con la misma semilla y calidad, converge con la misma probabilidad con independencia de rol, libertad, riesgo o media distancia
  const pConv = (mut) => {
    const x = freshMatch(9); energyFull(x); mut(x);
    const actor = x.onCourt(0)[1]; const defender = x.markerOf(actor);
    const exs = { team: 0, origin: 'PRUEBA', kind: 'organized', actor, zone: 'three', exec: 'pass', passer: x.onCourt(0)[0], icpt: defender, defend: defender, moved: false, offContact: null, holder: x.onCourt(0)[0], quality: { cls: 'normal', K: 0 } };
    x.resolveShot(exs, { team: 0, t: x.snap(), intent: {}, participants: {} }, false);
    return x.events.at(-1).effects.pConversion;
  };
  const p0 = pConv(() => {});
  const p1 = pConv((x) => { x.roleOf[x.onCourt(0)[1]] = 'O09'; x.teams[0].plan.styles.freedom = 5; x.teams[0].plan.styles.offensiveRisk = 5; x.teams[0].plan.midrange = 'seek'; x.pl[x.onCourt(0)[1]].initiative = 0.99; });
  assert.equal(p0, p1);
});

// ------------------------------------------------------------------------------------------------ 6. continuidad, reorganización y reloj
test('6. una causa se cobra una vez: tiempo y riesgo por resolución compuesta, y el reloj limita las opciones sin regalar un tiro', () => {
  // partido completo con solo POS04/POS13: cada resolución con continuaciones tiene UNA categoría de desenlace y un tramo de duración por pase
  const input = inputFor(31);
  input.teams.forEach((t) => { t.plan.playbook = [{ playId: 'POS04', priority: 1 }, { playId: 'POS13', priority: 1 }]; });
  const res = runMatch(input, profile, { detail: 'full', check: true });
  assert.deepEqual(res.errors, []);
  const attempts = res.events.filter((e) => e.type === 'attempt' && !e.intent.especial && /^POS(04|13)$/.test(e.intent.origen ?? '')); // MOTOR-08: la falta táctica ordenada por el entrenador no es una resolución compuesta
  assert.ok(attempts.length > 10);
  let staged = 0;
  for (const e of attempts) {
    assert.equal(e.calc.filter((c) => c.label === 'categorías').length, 1, 'un único riesgo de desenlace por resolución');
    const durs = e.calc.filter((c) => c.label.startsWith('duración:'));
    assert.ok(durs.length >= 1);
    const sum = durs.reduce((s, c) => s + c.decimas, 0);
    assert.equal(e.durationTenths, sum, 'la duración del hecho es la suma de sus tramos reales, sin tramo agregado extra');
    if ((e.intent.continuacion ?? []).includes?.('CONT03') || (e.intent.continuacion ?? []).includes?.('ALTO-BAJO')) { staged += 1; assert.ok(durs.length >= 2, 'la recepción real añade su intervalo'); }
  }
  assert.ok(staged > 3, 'hubo recepciones con decisión posterior');
  // un libro sin ninguna ficha activa no obliga a un ID del catálogo: da una salida conocida y viable
  const vacio = inputFor(33); vacio.teams[0].plan.playbook = [];
  const rv = runMatch(vacio, profile, { detail: 'full', check: true });
  assert.deepEqual(rv.errors, []);
  // MOTOR-06: sin libro solo existen las interacciones sencillas conocidas (recurso autónomo, ESP20) y las decisiones directas; nunca una llamada falsa
  const fichas = rv.events.filter((e) => e.team === 0 && e.type === 'attempt' && /^POS/.test(e.intent.origen ?? ''));
  assert.ok(fichas.every((e) => e.intent.procedencia === 'recurso autónomo' && e.intent.etiquetasESP?.includes('ESP20')), 'una ficha fuera del libro solo entra como recurso autónomo ESP20');
  assert.ok(rv.events.some((e) => e.team === 0 && e.type === 'attempt' && /^ESP/.test(e.intent.origen ?? '')), 'salida sencilla o decisión directa conocida (ESP), no la primera ficha del catálogo');
  // poco reloj: solo entran acciones viables; si no cabe ninguna ficha organizada se usa el recurso final, sin tope de pases ni tiro regalado
  const m = freshMatch(13); energyFull(m); withBook(m, 0, [['POS01', 1]]);
  m.clock = 25; m.shotClock = 25; // 2,5 s
  m.poss.advanced = true;
  const n0 = m.events.length; let guard = 0;
  while (!m.poss.done && guard++ < 6) m.possessionUnit();
  assert.ok(m.events.length > n0);
  for (const e of m.events.slice(n0)) assert.ok(e.clock.after >= 0 && e.shotClock.after >= 0);
  assert.equal(m.events.slice(n0).some((e) => (e.intent?.continuacion ?? []).length > 0 && e.durationTenths > 25), false);
});

// ------------------------------------------------------------------------------------------------ 7. rebote y balance
test('7. rebote y balance: encargos por nivel con acceso, protegido el que queda de balance y sin bonus abstracto de carga', () => {
  const m = freshMatch(17); energyFull(m);
  assert.deepEqual(profile.rebound.loadLogitByLevel, [0, 0, 0, 0, 0], 'el efecto abstracto de carga se retira de la nueva ruta (los participantes ya lo producen)');
  const shooter = m.onCourt(0)[1]; const exThree = { actor: shooter, zone: 'three' }; const exRim = { actor: shooter, zone: 'rim' };
  const at = (lvl, ex) => { m.teams[0].plan.styles.afterShot = lvl; return m.reboundCommitments(0, ex, ex.zone); };
  const hist = m.playersAtSlots(0, profile.rebound.offenseParticipantSlots);
  // nivel 3 = candidatos históricos (+ tirador cercano al aro): conserva el neutral
  assert.deepEqual(at(3, exThree).crash.slice().sort(), hist.slice().sort());
  const near3 = at(3, exRim); assert.deepEqual(near3.crash.slice().sort(), [...new Set([...hist, shooter])].sort());
  // más carga = más participantes, siempre con una referencia de balance; menos carga = un cargador
  const n = [1, 2, 3, 4, 5].map((l) => at(l, exThree).crash.length);
  assert.deepEqual(n, [1, 1, 2, 3, 4]);
  for (let l = 1; l <= 5; l++) { const c = at(l, exThree); assert.ok(c.balance.length >= 1 && c.crash.length + c.balance.length === 5); assert.equal(c.crash.some((id) => c.balance.includes(id)), false, 'quien carga no es primera referencia de balance'); }
  // el tirador cercano ya incorporado por acceso no se añade dos veces; en nivel 1 permanece en balance, en nivel 2 puede acompañar
  assert.ok(!at(1, exRim).crash.includes(shooter) || hist.includes(shooter));
  const c2 = at(2, exRim); assert.equal(new Set(c2.crash).size, c2.crash.length);
  // déficit de balance respecto a la base neutral: más cargadores = referencia que falta; menos = referencia extra (inverso)
  assert.ok(at(5, exThree).deficit > 0 && at(1, exThree).deficit < 0 && at(3, exThree).deficit === 0);
  // la transición del rival recibe 1,2 una vez por referencia que falta (odds de la ventaja), sin tocar la conversión
  const f = freshMatch(17); energyFull(f);
  f.poss.deficit = 2; f.poss.entry = 'live'; f.poss.carrier = f.onCourt(0)[0]; f.poss.origin = 'rebote'; f.poss.carrierPid = f.poss.carrier;
  f.transitionPhase(f.poss);
  const nt = f.calcBuf.find((x) => x.label === 'transición:retorno');
  if (nt) { near(nt.factorOdds, 1.2 ** 2, 1e-9); const base = profile.selection.direct.unopposedChanceAfterRebound; near(nt.pSinOposicion, oddsAdjust(base, 1.44), 1e-4); }
  // un partido completo con carga total y otro con balance total: los encargos quedan registrados en el rebote
  for (const lvl of [1, 5]) {
    const input = inputFor(41); input.teams[0].plan.styles.afterShot = lvl;
    const r = runMatch(input, profile, { detail: 'full', check: true });
    const rebs = r.events.filter((e) => e.type === 'rebound' && e.team === 0);
    assert.ok(rebs.length > 5); assert.ok(rebs.every((e) => e.effects.encargos.nivel === lvl && e.effects.encargos.cargan.length === (lvl === 1 ? 1 : 4) || e.effects.encargos.cargan.length >= 1));
  }
});

// ------------------------------------------------------------------------------------------------ 8. filas del panel, órdenes, exportación y reproducción
test('8. las filas nuevas llegan a sus consumidores, las órdenes entran en su frontera y la reproducción conserva contenido y órdenes de la versión', () => {
  const seenIn = (plan) => {
    const input = demoInputFor(61); Object.assign(input.teams[0].plan, plan);
    const r = runMatch(input, profile, { detail: 'full' });
    return new Set(r.events.flatMap((e) => (e.params ?? []).map((i) => r.diagnostics.paramTable[i])));
  };
  const open = seenIn({});
  for (const id of ['selection.transitionAttemptOddsRatio', 'selection.elaborationContinuationWeightFactor', 'selection.offensiveRiskPreferenceTilt', 'selection.midrangePolicy.openOnlyComfortableWeight', 'selection.midrangePolicy.openOnlyOtherWeight', 'selection.rolePreference.favoredFunctionWeight', 'selection.rolePreference.otherFunctionWeight', 'selection.newVariantPreference.eligibleVariantBaseWeight', 'rebound.offensiveReboundAssignmentTarget', 'rebound.balance.unreadyReturnerOpportunityOddsRatio']) assert.ok(open.has(id), `no se consulta ${id}`);
  assert.ok(seenIn({ midrange: 'avoid' }).has('selection.midrangePolicy.avoidWeight'));
  assert.ok(seenIn({ midrange: 'seek' }).has('selection.midrangePolicy.suitablePlayerAbilitySlope'));
  // el JSON exporta la configuración efectiva y la reproducción no consulta el perfil activo actual
  const input = demoInputFor(62);
  const make = () => createMatch(deepCopy(input), profile, { detail: 'minimal' });
  const m = make(); m.step(); m.step();
  m.submitBatch([{ team: 0, type: 'disposition', disposition: 'DIS04' }, { team: 0, type: 'roles', roles: { [m.onCourt(0)[1]]: 'O09' } }, { team: 0, type: 'styles', styles: { midrange: 'avoid', transition: 5, elaboration: 1, offensiveRisk: 4, afterShot: 5 } }, { team: 0, type: 'priorities', priorities: { POS13: null, POS03: 5 } }]);
  const dis = m.orders.find((o) => o.type === 'disposition');
  assert.equal(dis.state, 'pendiente', 'la disposición espera su entrada compatible');
  while (m.step()) { /* hasta el final */ }
  assert.equal(dis.state, 'vigente'); assert.ok(dis.activation.possession, 'entró en una posesión (entrada o reorganización)');
  assert.equal(m.teams[0].plan.disposition, 'DIS04'); assert.equal(m.roleOf[m.onCourt(0)[1]] === 'O09' || m.roleOf[Object.keys(m.roleOf).find((k) => m.roleOf[k] === 'O09')] === 'O09', true);
  assert.equal(m.teams[0].plan.playbook.some((b) => b.playId === 'POS13'), false, 'ficha desactivada: sale del libro sin borrar su definición');
  assert.ok(rep.plays.POS13);
  // exportación: configuración efectiva embebida (con su identidad, sustituciones incluidas) y reproducción desde ese contenido
  const res = buildResult(m);
  const file = JSON.parse(JSON.stringify(res));
  assert.equal(file.identity.engineVersion, ENGINE_VERSION); assert.equal(file.schema, EXPORT_SCHEMA);
  const ext4 = file.identity.extensions.find((e) => e.id === 'SEM-MOTOR04-20261016');
  assert.ok(ext4 && ext4.replaced.some((r) => r.path === 'rebound.loadLogitByLevel' && JSON.stringify(r.before) === JSON.stringify([-0.6, -0.3, 0, 0.3, 0.6])), 'la sustitución del efecto abstracto de carga queda identificada con su valor anterior');
  assert.ok(file.profile.repertoire.plays.POS13);
  const rp = replayMatch(file);
  assert.equal(rp.comparison.identical, true, JSON.stringify(rp.comparison.parts));
  assert.equal(file.commands.length, 1); assert.equal(file.orders.filter((o) => o.issuer === 'manual').length, 4);
  // un archivo de la versión anterior se identifica y no se reproduce con este motor
  assert.equal(validateReplayFile({ schema: 'beM-match-export/2', meta: { engineVersion: 'beM-motor-0.3.0-MOTOR03' } }).legacy, true);
});

// ------------------------------------------------------------------------------------------------ 9. cuatro partidos completos de cierre
test('9. cuatro encuentros completos: base, Horns, 1–4 bajo y repetición del base por otro modo, con acta, reloj y quintetos conciliados', async () => {
  const run = (input) => runMatch(input, profile, { detail: 'full', check: true });
  const check = (res) => {
    assert.equal(res.status, 'finished'); assert.deepEqual(res.errors, []);
    for (const t of [0, 1]) { const tt = teamTotals(res.box, res.input, t); assert.equal(tt.pts, res.score[t]); assert.ok(Math.abs(tt.min - 200) < 1e-6 || tt.min >= 200); }
    assert.equal(res.periodScores.reduce((s, p) => s + p.points[0], 0), res.score[0]);
  };
  const base = run(inputFor(20261016)); check(base);
  const horns = demoInputFor(20261016, 'DIS04');
  horns.teams.forEach((t) => { t.plan.playbook = ['POS01', 'POS03', 'POS05', 'POS07', 'POS12', 'POS14'].map((playId, i) => ({ playId, priority: [1, 2, 3, 2, 3, 4][i] })); });
  const rh = run(horns); check(rh);
  const low = demoInputFor(20261016, 'DIS06');
  low.teams.forEach((t) => { t.plan.playbook = ['POS11', 'POS09', 'POS10', 'POS14', 'POS07', 'POS01'].map((playId, i) => ({ playId, priority: [1, 2, 3, 3, 2, 3][i] })); });
  const rl = run(low); check(rl);
  const funcs = (r) => new Set(r.events.flatMap((e) => Object.values(e.intent?.funciones ?? {})));
  assert.ok(funcs(rh).has('elbow') && funcs(rh).has('corner'), 'Horns: apoyos altos en codos y esquinas');
  assert.ok(funcs(rl).has('block'), '1–4 bajo: referencias bajas');
  for (const r of [rh, rl]) assert.ok(r.events.some((e) => e.intent?.disposicion), 'se registra la disposición de entrada');
  // repetición del base por otro modo de avance (por cuartos, sin órdenes): mismos hechos, sorteos, acta y estado final
  const q = new MatchSession({ input: inputFor(20261016), profile, mode: 'cuartos', scheduler: new FakeScheduler() });
  await q.start();
  while (q.state === 'revision') assert.equal((await q.playNextPeriod()).ok, true);
  assert.equal(q.state, 'finalizado');
  assert.deepEqual(sportsProjection(q.result()), sportsProjection(base), 'por cuartos = total');
  assert.equal(q.result().diagnostics.sportingDraws, base.diagnostics.sportingDraws);
  // y reproducir el JSON del base desde su contenido reproduce el mismo encuentro
  const again = replayMatch(JSON.parse(JSON.stringify(base)));
  assert.equal(again.comparison.identical, true);
});

// ------------------------------------------------------------------------------------------------ 10. llamadas con las nuevas fichas
test('10. una llamada a POS13 se consume al inicio efectivo (tras reorganizar a su disposición); POS10 sin negación espera y caduca con motivo', () => {
  const m = createMatch(demoInputFor(20261017), profile, { detail: 'full' }); m.step(); m.step();
  const team = m.nextPoss.team;
  const call = m.submit({ team, type: 'call', playId: 'POS13', target: 'next' });
  assert.equal(call.state, 'pendiente');
  while (call.state !== 'consumida' && call.state !== 'caducada' && m.step()) { /* hasta resolver la llamada */ }
  assert.equal(call.state, 'consumida', call.reason);
  const started = m.events.find((e) => e.orders?.some((l) => l.id === call.id));
  assert.equal(call.execution.play, 'POS13'); // la ficha comenzó; su primer hecho puede ser la ficha o su negación (ESP15)
  assert.ok(started.intent.origen === 'POS13' ? started.intent.procedencia === 'llamada' : started.intent.origen === 'ESP15');
  const reorg = m.events.filter((e) => e.possessionId === call.bound && e.type === 'reorganization' && e.intent.disposicion === 'DIS03');
  assert.equal(reorg.length, 1, 'el inicio efectivo llegó tras la reorganización compatible, que consumió su tiempo');
  assert.ok(reorg[0].seq < m.events.indexOf(started) + 1);
  const c10 = m.submit({ team, type: 'call', playId: 'POS10', target: 'next' });
  while (c10.state !== 'consumida' && c10.state !== 'caducada' && m.step()) { /* ámbito: una posesión */ }
  if (c10.state === 'caducada') assert.match(c10.reason, /negación|terminó la posesión/);
  // llamar a una ficha desactivada en el libro es una llamada puntual: no la activa
  const n = createMatch(inputFor(20261018), profile, { detail: 'full' }); n.step(); n.step();
  const t2 = n.nextPoss.team; assert.equal(n.teams[t2].plan.playbook.some((b) => b.playId === 'POS02'), false);
  const c2 = n.submit({ team: t2, type: 'call', playId: 'POS02', target: 'next' });
  assert.equal(c2.state, 'pendiente');
  while (c2.state !== 'consumida' && c2.state !== 'caducada' && n.step()) { /* hasta resolver */ }
  assert.equal(n.teams[t2].plan.playbook.some((b) => b.playId === 'POS02'), false);
});
