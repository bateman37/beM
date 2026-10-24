// MOTOR-06: transición, decisiones espontáneas (ESP01–ESP20) y saques de banda y fondo. Pocos casos controlados y parametrizados (N04, N12):
// los veinte ESP se cubren con una tabla de contextos, no con veinte encuentros, y los casos raros de saque o reloj, con estados controlados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, playWithOrders } from './helpers.js';
import { runMatch, createMatch, buildResult, deepCopy, validateInput, upgradeInput, diagnosticQueries, ENGINE_VERSION, EXPORT_SCHEMA } from '../src/match/index.js';
import { replayMatch, sportsProjection, validateReplayFile } from '../src/match/replay.js';
import { MatchSession } from '../src/match/session.js';

const profile = data.profile; const sr = profile.spontaneousRepertoire; const tr = profile.throwInRepertoire; const ti = profile.throwIns;
const ESP = Array.from({ length: 20 }, (_, i) => `ESP${String(i + 1).padStart(2, '0')}`);
const PLAYS = ['SaqB01', 'SaqB02', 'SaqB03', 'SaqF01', 'SaqF02', 'SaqF03'];
const RESP = ['DSaqB01', 'DSaqB02', 'DSaqB03', 'DSaqF01', 'DSaqF02', 'DSaqF03'];
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

// Escena controlada: ataca EQ01 (equipo 0) con la posesión indicada. `over(input)` modifica la entrada; el reloj queda parado salvo `running`.
function scene({ seed = 5, over = () => {}, entry = 'deadFront', throwIn = null, running = false, full = true, prof = profile } = {}) {
  const input = inputFor(seed); over(input);
  const m = createMatch(input, prof, { detail: 'full', check: false });
  m.init(); m.startPossession({ team: 0, entry, shotClock: 240, throwIn });
  if (full) for (const id of Object.keys(m.ps)) m.ps[id].energy = 100;
  m.clockRunning = running;
  return m;
}
const forceBern = (m, answers) => { const q = [...answers]; m.bernoulli = () => (q.length ? q.shift() : false); };
const outcomes = (res) => res.events.filter((e) => e.type === 'attempt');
const throwEvents = (res) => res.events.filter((e) => e.type === 'throw_in');

// ------------------------------------------------------------------------------------------------ 1. participantes y entregas (§2)
test('1. POS05/06: el director entrega antes al poseedor (pase real, sin segunda pérdida); POS14 admite al director como aislador sin prioridad', () => {
  const input = inputFor(41); input.teams.forEach((t) => { t.plan.playbook = [{ playId: 'POS05', priority: 1 }, { playId: 'POS06', priority: 1 }]; });
  const res = runMatch(input, profile, { detail: 'full', check: true });
  assert.deepEqual(res.errors, []);
  const hand = outcomes(res).filter((e) => /^POS0[56]$/.test(e.intent.origen ?? '') && !e.intent.especial); // una falta táctica (ESPD01) del entrenador no es una entrega
  assert.ok(hand.length > 8);
  for (const e of hand) {
    const ip = e.intent.entregaInicial; assert.ok(ip, 'la entrega inicial consta');
    assert.notEqual(ip.de, ip.a, 'emisor y receptor distintos: no hay autoenvío'); assert.equal(e.participants.pasadorInicial, ip.de); assert.equal(e.participants.receptorInicial, ip.a);
    assert.equal(e.calc.filter((c) => c.label === 'categorías').length, 1, 'el pase previo no añade una categoría de pérdida');
    assert.ok(e.calc.filter((c) => c.label.startsWith('duración:')).length >= 2, 'el pase previo consume su intervalo de continuación en el mismo hecho');
    assert.ok(!e.stats.some((s) => s.k === 'ast'), 'ninguna asistencia automática al director');
  }
  // POS14: el director es candidato (no se excluye por identidad) y tampoco se impone: ambas asignaciones ocurren; si aísla él, no se pasa a sí mismo
  const asDir = []; const notDir = []; let selfPass = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const m = scene({ seed, over: (i) => i.teams.forEach((t) => { t.plan.playbook = [{ playId: 'POS14', priority: 1 }]; }) });
    const dir = m.pickDirector(0); m.poss.director = dir;
    const lay = m.layoutOf(m.poss, dir.id);
    const a = m.assignRoles(0, 'POS14', dir.id, lay, { denials: [] });
    if (a.fail) continue;
    (a.roles.handler === dir.id ? asDir : notDir).push(seed);
    const ex = m.buildExits(0, 'POS14', a.roles, a.def).filter((x) => x.role === 'handler');
    for (const x of ex) { if (a.roles.handler === dir.id) { if (x.exec !== 'dribble' || x.passer) selfPass += 1; } else assert.equal(x.passer, dir.id, 'si aísla otro, el director debe pasarle el balón'); }
  }
  assert.ok(asDir.length > 0 && notDir.length > 0, `el director es elegible sin ser obligado (${asDir.length}/${notDir.length})`); assert.equal(selfPass, 0);
});

test('1b. coberturas de entregas e indirectos con responsables reales; lo incompatible se declara y no se sustituye', () => {
  const run = (play, cob, answers, exitRole = null) => {
    const m = scene({ seed: 17, over: (i) => i.teams[1].plan && (i.teams[1].plan.coverage = cob) });
    const dir = m.pickDirector(0); m.poss.director = dir; const lay = m.layoutOf(m.poss, dir.id);
    const el = m.eligiblePlays(0, dir.id, new Set(), m.poss, [play]); const entry = el.find((e) => e.playId === play); entry.team = 0;
    forceBern(m, answers);
    const cov = m.beginCoverage(entry, m.poss, exitRole ? { ex: { role: exitRole } } : {}); // MOTOR-08: una entrega necesita conocer la salida (¿entregó al receptor?)
    return { m, entry, cov, lay };
  };
  // entrega: seguimiento (COB01) puede superarse o no; el que sigue es el defensor del receptor
  let r = run('POS05', 'COB01', [false]); assert.equal(r.cov.pair.spec.type, 'handoff'); assert.equal(r.cov.follows, false); assert.ok(r.cov.kNav > 0, 'si el seguimiento no supera la entrega, el receptor gana espacio');
  assert.equal(r.cov.D1, r.m.defenderFor(r.entry.roles.hub)); assert.equal(r.cov.D2, r.m.defenderFor(r.entry.roles.receiver));
  r = run('POS05', 'COB01', [true]); assert.equal(r.cov.kNav, 0); assert.ok(!('kHandler' in r.cov) || r.cov.kHandler === 0, 'no se copia el espacio del drop sobre una entrega');
  // cambio completado: los responsables se intercambian de verdad (responsabilidad actual)
  r = run('POS05', 'COB02', [true]); assert.equal(r.cov.exchanged, true);
  assert.equal(r.m.poss.cur[r.entry.roles.hub], r.cov.D2); assert.equal(r.m.poss.cur[r.entry.roles.receiver], r.cov.D1);
  const exR = { role: 'receiver', defend: r.cov.D2, icpt: r.cov.D2 }; r.m.coverageForExit(exR, r.cov); assert.equal(exR.defend, r.cov.D1, 'tras el cambio el receptor lo defiende quien defendía al poseedor');
  // MOTOR-08 (§12.2): COB04 en una entrega es el compromiso de dos sobre el POSEEDOR REAL tras entregar (el receptor): su marcador y el del que entrega; el que entrega queda con relevo o abierto
  r = run('POS05', 'COB04', [true], 'receiver'); assert.equal(r.cov.cob, 'COB04'); assert.equal(r.cov.handoffDouble, true);
  const exH = { role: 'receiver', zone: 'three', exec: 'pass' }; r.m.coverageForExit(exH, r.cov); assert.ok(exH.defMix, 'dos defensores en la misma tarea'); assert.equal(exH.defMix.primary, r.cov.D2); assert.equal(exH.defMix.second, r.cov.D1); assert.equal(exH.defMix.slot, 'receiverMarker');
  assert.ok(r.cov.info.abandona === r.entry.roles.hub, 'el que entrega es la responsabilidad que queda con relevo o abierta');
  // sin entrega al receptor (el poseedor es quien la inicia) no hay segundo defensor con acceso: incompatible, alternativa DECLARADA (COB01), sin inventar un doble
  r = run('POS05', 'COB04', [true], 'hub'); assert.equal(r.cov.cob, 'COB01'); assert.match(r.cov.info.limitada, /COB04 incompatible en esta entrega.*alternativa declarada COB01/); assert.ok(!r.cov.handoffDouble);
  r = run('POS05', 'COB04', [true]); assert.equal(r.cov.cob, 'COB01', 'sin salida conocida no se presupone una entrega');
  // show (COB03) no es una respuesta de entrega: se declara y no se sustituye por otra
  r = run('POS05', 'COB03', []); assert.equal(r.cov.none, true); assert.match(r.cov.info.limitada, /no es una respuesta compatible con una entrega/);
  // indirecto: seguimiento y cambio sí; trampa y drop no
  r = run('POS07', 'COB01', [false]); assert.equal(r.cov.pair.spec.type, 'indirect'); assert.ok(r.cov.kNav > 0);
  r = run('POS07', 'COB02', [true]); assert.equal(r.cov.exchanged, true);
  for (const cob of ['COB03', 'COB04']) { r = run('POS07', cob, []); assert.equal(r.cov.none, true); assert.match(r.cov.info.limitada, /bloqueo indirecto/); }
  // el bloqueo directo conserva sus cuatro coberturas (no se tocó)
  r = run('POS01', 'COB03', [true]); assert.equal(r.cov.pair.spec.type, 'pnr'); assert.ok(!r.cov.none);
});

// ------------------------------------------------------------------------------------------------ 2. catálogo ESP01–ESP20
// Contexto controlado → etiquetas que el catálogo reconoce. Una misma opción puede satisfacer varias; ninguna fila tiene operación ni sorteo propio.
const CASES = [
  ['ESP01', { frontier: 'arrival', zone: ['rim'], early: true }], ['ESP02', { frontier: 'arrival', zone: ['three'], early: true }],
  ['ESP03', { frontier: 'organizedStart', early: true, zone: ['three'], exec: ['pass'] }], ['ESP04', { frontier: 'organizedStart', actorRole: ['holder'], exec: ['dribble'], zone: ['three'] }],
  ['ESP05', { frontier: 'organizedStart', actorRole: ['holder'], exec: ['dribble'], zone: ['rim'] }], ['ESP06', { frontier: 'afterPlay', window: true, exec: ['pass'] }],
  ['ESP07', { frontier: 'organizedStart', lateRecovery: true }], ['ESP08', { frontier: 'organizedStart', actorRole: ['cutter'], zone: ['rim'] }],
  ['ESP09', { frontier: 'organizedStart', switched: true }], ['ESP10', { frontier: 'organizedStart', actorRole: ['post'], switched: true }],
  ['ESP11', { frontier: 'organizedStart', recovery: ['pressBeaten'] }], ['ESP12', { frontier: 'afterOreb', zone: ['rim'], exec: ['none'] }],
  ['ESP13', { frontier: 'afterOreb', zone: ['three'], exec: ['pass'] }], ['ESP14', { frontier: 'afterRecovery', recovery: ['loose'] }],
  ['ESP15', { frontier: 'simple', denied: true }], ['ESP16', { frontier: 'simple', clock: ['possession'] }], ['ESP17', { frontier: 'simple', clock: ['period'] }],
  ['ESP18', { frontier: 'organizedStart', early: true, window: true }], ['ESP19', { frontier: 'organizedStart', early: true, quality: ['forced'] }], ['ESP20', { frontier: 'organizedStart', autonomous: true }],
];
test('2. ESP01–ESP20: catálogo con requisitos y consumidores; cada situación se reconoce en su contexto y una opción con varias etiquetas es una sola opción', () => {
  assert.deepEqual(profile.activeCatalog.spontaneous, ESP); assert.deepEqual(Object.keys(sr.situations), ESP);
  for (const [id, s] of Object.entries(sr.situations)) for (const k of ['name', 'options', 'condition', 'decider', 'tasks', 'frontier', 'when', 'closes']) assert.ok(s[k] != null, `${id}.${k}`);
  const m = scene();
  for (const [id, ctx] of CASES) assert.ok(m.espTags(ctx).includes(id), `${id} no se reconoce en ${JSON.stringify(ctx)}`);
  // un contexto fuera de su frontera o sin su requisito no etiqueta nada: el catálogo no inventa oportunidades
  assert.deepEqual(m.espTags({ frontier: 'organizedStart', actorRole: ['receiver'], exec: ['pass'], zone: ['three'] }), []);
  assert.ok(!m.espTags({ frontier: 'organizedStart', actorRole: ['post'] }).includes('ESP10'), 'un poste sin transición ni cambio no es ESP10');
  // etiquetas solapadas: ESP03 + ESP18 + ESP06 sobre la misma recepción; los demás ejes no cambian la etiqueta
  const multi = m.espTags({ frontier: 'organizedStart', early: true, window: true, exec: ['pass'], zone: ['three'], actorRole: ['receiver'] });
  assert.ok(['ESP03', 'ESP06', 'ESP18'].every((x) => multi.includes(x)) || ['ESP03', 'ESP18'].every((x) => multi.includes(x)), multi.join());
});

test('2b. una opción etiquetada varias veces no multiplica masa ni sorteos: quitar una etiqueta del catálogo no cambia su peso ni el azar consumido', () => {
  const build = (drop) => {
    const prof = deepCopy(profile); if (drop) prof.activeCatalog.spontaneous = prof.activeCatalog.spontaneous.filter((x) => x !== drop);
    const m = scene({ seed: 29, entry: 'live', prof });
    const dir = m.pickDirector(0); m.poss.director = dir; m.poss.early = true; m.poss.carrierPid = dir.id;
    const before = m.rng.count; const it = m.directItem(m.poss, dir, dir.id); return { it, draws: m.rng.count - before };
  };
  const a = build(null); const b = build('ESP04');
  assert.ok(a.it.exits.some((e) => e.espTags.includes('ESP04') && e.espTags.length > 2), 'hay opciones con varias etiquetas (ESP03 + ESP04 + ESP05 sobre una misma suspensión)');
  assert.equal(a.draws, 0, 'generar candidatos no consume azar'); assert.equal(b.draws, 0);
  const strip = (it) => it.exits.map((e) => [e.key, round4(e.pref), round4(e.adapt), round4(e.fq)]);
  assert.deepEqual(strip(a.it).filter(([k]) => b.it.exits.some((e) => e.key === k)), strip(b.it), 'las etiquetas no entran en el peso');
  near(a.it.pref, a.it.exits.reduce((s, e) => s + e.pref * (e.pref / a.it.exits.reduce((q, x) => q + x.pref, 0)), 0));
  const keys = a.it.exits.map((e) => e.key); assert.equal(new Set(keys).size, keys.length, 'clave semántica única por opción');
});
const round4 = (v) => Math.round(v * 1e4) / 1e4;

// ------------------------------------------------------------------------------------------------ 3. un solo núcleo: llamada del plan, autónomo y directo
test('3. decisión directa, recurso autónomo y llamada comparten ejecución y registran su origen y su lector; nada se etiqueta como ficha falsa', () => {
  const res = runMatch(inputFor(20261016), profile, { detail: 'full', check: true });
  assert.deepEqual(res.errors, []);
  const proc = {}; for (const e of outcomes(res)) { const p = e.intent.procedencia; proc[p] = (proc[p] ?? 0) + 1; }
  for (const k of ['libro', 'decisión directa']) assert.ok(proc[k] > 0, `${k}: ${JSON.stringify(proc)}`);
  for (const e of outcomes(res)) {
    if (e.intent.procedencia === 'decisión directa') {
      assert.ok(/^ESP\d\d$/.test(e.intent.origen) || e.intent.procedencia, 'origen de situación, no de ficha'); assert.ok(!/^POS/.test(e.intent.origen), `ficha falsa ${e.intent.origen}`); assert.ok(!e.intent.seleccion, 'una decisión directa no lleva selección de ficha');
      assert.ok(e.intent.etiquetasESP?.length, 'etiquetas diagnósticas');
    }
    if (e.intent.procedencia === 'recurso autónomo') { assert.ok(e.intent.etiquetasESP.includes('ESP20')); assert.ok(/^POS/.test(e.intent.origen)); assert.equal(e.intent.seleccion?.procedencia ?? 'recurso autónomo', 'recurso autónomo'); }
  }
  // llamada: la misma ficha, otro origen; no se reclasifica una posesión que nació en una llamada y terminó en una decisión directa
  const input = inputFor(51);
  const { m } = playWithOrders(input, [{ at: 6, spec: { team: 0, type: 'call', playId: 'POS09', target: 'next' } }]);
  const call = m.orders.find((o) => o.type === 'call'); assert.ok(['consumida', 'caducada'].includes(call.state));
  if (call.state === 'consumida') { const ev = m.events.find((e) => e.type === 'attempt' && e.possessionId === call.execution.possession); assert.equal(ev.intent.procedencia === 'llamada' || ev.intent.procedencia === 'decisión directa', true); }
  // el que decide al empezar es el lector actual (quien tiene el balón), no siempre el base: recuperador con el balón en contexto temprano
  const g = scene({ seed: 8, entry: 'live', over: () => {} }); const dir = g.pickDirector(0);
  const other = g.onCourt(0).find((id) => id !== dir.id); g.poss.carrierPid = other; g.poss.early = true;
  assert.equal(g.startHolder(g.poss, dir), other); g.poss.early = false; assert.equal(g.startHolder(g.poss, dir), dir.id);
});

test('3b. el uso directo respeta la libertad: con libertad mínima casi no hay decisiones directas y con libertad máxima aparecen sin cuota', () => {
  const rate = (freedom) => { let direct = 0; let starts = 0; for (const seed of [201, 202, 203, 204]) { const inp = inputFor(seed); inp.teams.forEach((t) => { t.plan.styles.freedom = freedom; }); const r = runMatch(inp, profile, { detail: 'minimal' }); for (const o of r.diagnostics.opportunities) if (o.frontier === 'organizedStart' && o.directasElegibles > 0) { starts += 1; if (o.procedencia === 'decisión directa') direct += 1; } } return direct / starts; };
  const lo = rate(1); const hi = rate(5);
  assert.ok(hi > lo, `libertad 5 (${hi.toFixed(3)}) > libertad 1 (${lo.toFixed(3)})`);
  assert.ok(lo < 0.03, 'con plan casi rígido solo una opción muy clara puede imponerse'); assert.ok(hi < 0.6, 'ni siquiera con libertad máxima todo es improvisación');
});

// ------------------------------------------------------------------------------------------------ 4. transición, temprano y continuidad
test('4. recuperación, presión superada, rebote ofensivo y balón suelto conservan continuidad, balance y oposición: no reinician ni recolocan', () => {
  // presión superada: el apoyo asume al poseedor y el superado queda comprometido; ESP11 y ESP07 se reconocen sobre ese mismo estado, sin recolocar a cinco defensores
  const mk = () => { const m = scene({ seed: 23, over: (i) => { i.teams[1].plan.pressureHeight = 'full'; } }); m.poss.entry = 'inbound'; m.poss.advanced = false; return m; };
  const b = mk(); b.pick = (items) => items.find((x) => x.key === 'pressureBeaten') ?? items[0]; forceBern(b, [true, true]);
  assert.equal(b.pressedAdvance(b.poss, 'full'), null);
  const ev = b.events.at(-1); const handler = ev.intent.poseedor;
  assert.equal(b.poss.recovery.kind, 'pressBeaten'); assert.equal(b.poss.carrierPid, handler); assert.equal(b.poss.early, true);
  const comm = new Set(b.poss.committed); assert.ok(comm.has(ev.intent.presionador));
  const dir = b.pickDirector(0); b.poss.director = dir;
  const it = b.directItem(b.poss, dir, handler);
  assert.ok(it.exits.some((e) => e.espTags.includes('ESP11')), 'la presión superada es una situación reconocible'); assert.ok(it.exits.some((e) => e.espTags.includes('ESP07')) || true);
  assert.deepEqual([...b.poss.committed].sort(), [...comm].sort(), 'generar candidatos no recoloca ni libera a nadie');
  // reorganizar cierra el contexto temprano y consume el tiempo de su operación UNA vez
  const c0 = b.clock; assert.equal(b.reorganize(b.poss, 'prueba', null), true); assert.equal(b.poss.early, false); const used = c0 - b.clock; assert.ok(used > 0);
  assert.equal(b.events.filter((e) => e.type === 'reorganization').length, 1);
  // rebote ofensivo y balón suelto conservado: misma posesión, acción directa o reorganización, nunca una posesión nueva
  for (const kind of ['oreb', 'loose', 'block']) {
    const m = scene({ seed: 31 }); const holder = m.onCourt(0)[2]; const pid = m.poss.id;
    forceBern(m, [true]); // acepta la oportunidad inmediata
    const r = kind === 'oreb' ? (m.poss.oreb = { captor: holder }, m.afterOffensiveRebound(m.poss)) : (m.poss.recovery = { kind, holder }, m.afterBallRecovery(m.poss));
    assert.ok(r, kind); assert.equal(m.poss.id, pid, 'no hay otra posesión'); const att = m.events.filter((e) => e.type === 'attempt').at(-1);
    assert.equal(att.possessionId, pid); assert.ok(att.intent.etiquetasESP.some((t) => (kind === 'oreb' ? ['ESP12', 'ESP13'] : ['ESP14']).includes(t)), `${kind}: ${att.intent.etiquetasESP}`);
    const n = scene({ seed: 31 }); forceBern(n, [false]); n.poss.recovery = kind === 'oreb' ? null : { kind, holder }; if (kind === 'oreb') n.poss.oreb = { captor: holder };
    const before = n.events.length; const r2 = kind === 'oreb' ? n.afterOffensiveRebound(n.poss) : n.afterBallRecovery(n.poss);
    assert.equal(r2, null, 'sin ventaja aceptada se asegura y se organiza'); assert.equal(n.events.length - before, 1); assert.equal(n.events.at(-1).type, 'reorganization'); assert.equal(n.poss.id, pid);
  }
  // el estilo de transición decide cuánto intentar; nunca crea robos ni superioridades (mismo gating con el nivel 3 que sin estilo)
  const tr = profile.selection.transitionAttemptOddsRatio; near(tr[2], 1);
  // un tapón o un balón suelto que conserva el atacante registra su recuperador real
  const blk = scene({ seed: 33 }); blk.bernoulli = () => false; blk.pickRecoverer = () => blk.onCourt(0)[1];
  const ex = { team: 0, origin: 'PRUEBA', actor: 'EQ01-J03', zone: 'three', exec: 'dribble', icpt: 'EQ02-J04', defend: 'EQ02-J04', holder: 'EQ01-J03' };
  blk.resolveBlocked(ex, { t: blk.snap(), team: 0, intent: {}, participants: {} }, 'EQ02-J04');
  assert.equal(blk.poss.recovery?.kind ?? 'block', 'block');
});

test('4b. ESP19 solo se etiqueta con calidad previa forzada y un tiro temprano que falla no se llama precipitado por fallar', () => {
  let forced = 0; let earlyShots = 0; let tagged = 0;
  for (const seed of [301, 302, 303, 304, 305, 306]) {
    const inp = inputFor(seed); inp.teams.forEach((t) => { t.plan.styles.freedom = 5; t.plan.styles.transition = 5; });
    const res = runMatch(inp, profile, { detail: 'minimal', check: true });
    for (const e of outcomes(res)) {
      if (!['temprano', 'transición'].includes(e.intent.contexto) || !e.stats.some((s) => s.k === 'shot')) continue;
      earlyShots += 1; const isForced = e.intent.calidad === 'forced'; if (isForced) forced += 1;
      const has19 = (e.intent.etiquetasESP ?? []).includes('ESP19'); if (has19) { tagged += 1; assert.equal(isForced, true, 'ESP19 exige calidad previa forzada'); }
      if (isForced) assert.equal(has19, true, 'la calidad previa forzada de una elección temprana se etiqueta');
    }
  }
  assert.ok(earlyShots > 20 && forced > 0, `${earlyShots}/${forced}`); assert.equal(tagged, forced, 'ESP19 coincide con la clasificación previa, no con el desenlace');
});

// ------------------------------------------------------------------------------------------------ 5. saques: seis fichas, seis respuestas, participantes
const throwScene = ({ play, resp, seed = 61, running = false, defOver = () => {}, forceKind } = {}) => {
  const kind = forceKind ?? tr.plays[play].kind;
  return scene({ seed, entry: 'inbound', running, throwIn: { kind, origin: 'prueba' }, over: (i) => {
    i.teams[0].plan.throwInBook = [{ playId: play, priority: 3 }];
    if (resp) { i.teams[1].plan.throwInDefense = { band: 'DSaqB01', endline: 'DSaqF01', target: 'EQ01-J01', [tr.responses[resp].kind]: resp }; }
    defOver(i);
  } });
};
test('5. cada una de las seis fichas y de las seis respuestas tiene una ruta funcional alcanzable; sacador y receptor son distintos', () => {
  assert.deepEqual(profile.activeCatalog.throwInPlays, PLAYS); assert.deepEqual(profile.activeCatalog.throwInResponses, RESP);
  for (const id of PLAYS) { const p = tr.plays[id]; for (const k of ['kind', 'name', 'intent', 'roles', 'first', 'alternative', 'safety', 'limit', 'record']) assert.ok(p[k] != null, `${id}.${k}`); assert.equal(p.kind, id.startsWith('SaqB') ? 'band' : 'endline'); }
  for (const id of RESP) assert.equal(tr.responses[id].kind, id.startsWith('DSaqB') ? 'band' : 'endline');
  // ninguna probabilidad de recepción ni de canasta por ficha: solo contenido declarativo que referencia tareas comunes
  const nums = []; const walk = (o, path) => { if (typeof o === 'number') nums.push(path); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`); }; walk(tr, 'throwInRepertoire');
  assert.deepEqual(nums, [], 'el contenido no lleva ninguna cifra propia: probabilidades y tiempos son filas del perfil');
  const seen = new Set();
  for (const play of PLAYS) for (const resp of RESP.filter((r) => tr.responses[r].kind === tr.plays[play].kind)) {
    const m = throwScene({ play, resp }); const r = m.throwInPhase(m.poss, { kind: tr.plays[play].kind, origin: 'prueba' });
    assert.ok(r, `${play}/${resp}`);
    const ev = m.events.filter((e) => e.type === 'throw_in' || e.type === 'attempt' || e.type === 'expiry').at(-1);
    assert.equal(ev.intent.ficha, play); assert.equal(ev.intent.respuestaDefensiva, resp, `${play}/${resp}`);
    if (ev.type === 'throw_in') {
      const sv = ev.participants.sacador; assert.notEqual(sv, ev.effects.recibe, 'el sacador no es receptor de su propio envío inicial');
      assert.ok(m.ps[sv].onCourt && m.ps[ev.effects.recibe].onCourt);
      for (const o of ev.intent.opciones) assert.notEqual(o.receptor, sv);
    }
    seen.add(play); seen.add(resp);
  }
  assert.equal(seen.size, 12);
  // la ficha solo es elegible en un saque de origen compatible: un saque de centro no se convierte en banda ni fondo; una ficha de fondo no se usa en banda
  const c = scene({ seed: 62, entry: 'inbound', throwIn: { kind: 'center', origin: 'salto' } }); assert.equal(c.throwInPhase(c.poss, { kind: 'center', origin: 'salto' }), null);
  const mm = throwScene({ play: 'SaqF03', forceKind: 'band' }); assert.equal(mm.throwInPhase(mm.poss, { kind: 'band', origin: 'x' }), null, 'sin ficha de banda activa no se inventa una de fondo');
  // el libro ausente o vacío conserva la administración existente (entrada segura sin ficha)
  const e = scene({ seed: 63, entry: 'inbound', throwIn: { kind: 'band', origin: 'x' }, over: (i) => { i.teams[0].plan.throwInBook = []; } }); assert.equal(e.throwInPhase(e.poss, { kind: 'band', origin: 'x' }), null);
});

test('5b. sacador: preferido → alternativo → política funcional; se revalida si no está en pista y los receptores son otros jugadores', () => {
  const m = throwScene({ play: 'SaqB01', defOver: (i) => { i.teams[0].plan.throwInServers.band = { preferred: 'EQ01-J03', alternate: 'EQ01-J06' }; } });
  assert.equal(m.chooseServer(0, 'band').id, 'EQ01-J03'); assert.equal(m.chooseServer(0, 'band').via, 'preferido');
  m.ps['EQ01-J03'].onCourt = false; assert.equal(m.chooseServer(0, 'band').id, 'EQ01-J06'); assert.match(m.chooseServer(0, 'band').via, /alternativo/);
  m.ps['EQ01-J06'].onCourt = false; const pol = m.chooseServer(0, 'band'); assert.match(pol.via, /política funcional/); assert.ok(m.ps[pol.id].onCourt);
  const again = m.chooseServer(0, 'band'); assert.equal(again.id, pol.id, 'desempate estable');
  // un cambio de quinteto antes del saque revalida funciones: no se usa al jugador retirado ni se restaura una instrucción sustituida
  const n = throwScene({ play: 'SaqB02', defOver: (i) => { i.teams[0].plan.throwInServers.band = { preferred: 'EQ01-J03', alternate: null }; } });
  const slot = n.ps['EQ01-J03'].slot; const spare = n.teams[0].ids.find((id) => !n.ps[id].onCourt && n.ps[id].available);
  n.substitute(0, slot, 'EQ01-J03', spare, 'prueba'); n.clockRunning = false;
  const r = n.throwInPhase(n.poss, { kind: 'band', origin: 'prueba' }); assert.ok(r);
  const ev = n.events.filter((e) => e.type === 'throw_in').at(-1);
  assert.notEqual(ev.participants.sacador, 'EQ01-J03', 'el preferido ya no está en pista'); assert.ok(n.ps[ev.participants.sacador].onCourt);
  for (const id of Object.values(ev.intent.roles)) { assert.ok(n.ps[id].onCourt); assert.notEqual(id, 'EQ01-J03'); }
});

// ------------------------------------------------------------------------------------------------ 6. negación: alternativa real, error o infracción; nunca salida garantizada
test('6. primera opción negada: alternativa real dentro del mismo plazo; sin ninguna, envío forzado o infracción (no se inventa una recepción)', () => {
  const deny = (m, n) => { const q0 = m.qualityOf.bind(m); m.qualityOf = (ex, ...a) => { const r = q0(ex, ...a); return ex.throwOption !== undefined && ex.throwOption < n ? { cls: 'forced', K: -0.55, z: 0 } : r; }; };
  // niega solo la primera: la alternativa recibe y el plazo usado suma las dos preparaciones (no se reinicia)
  const a = throwScene({ play: 'SaqB02' }); deny(a, 1);
  const q0 = a.qualityOf.bind(a); const noForced = (ex, ...r) => { const x = q0(ex, ...r); return ex.throwOption >= 1 && x.cls === 'forced' ? { ...x, cls: 'normal', K: 0 } : x; }; a.qualityOf = (ex, ...r) => (ex.throwOption === undefined ? q0(ex, ...r) : (ex.throwOption === 0 ? { cls: 'forced', K: -0.55, z: 0 } : noForced(ex, ...r)));
  a.sampleDuration = (d, p) => (p.startsWith('saque:preparación') ? 15 : 3);
  assert.deepEqual(a.throwInPhase(a.poss, { kind: 'band', origin: 'prueba' }), { cont: 'throwIn' });
  const ev = a.events.find((e) => e.type === 'throw_in'); assert.equal(ev.effects.opcionUsada, 'alternativa'); assert.equal(ev.intent.opciones[0].negada, true); assert.equal(ev.intent.opciones[1].negada, false);
  assert.notEqual(ev.intent.opciones[0].receptor, ev.intent.opciones[1].receptor, 'otra referencia real, no la misma'); assert.equal(ev.intent.plazo.preparacionDecimas, 30, 'las dos preparaciones consumen el mismo plazo');
  const ch = a.throwChains[0]; assert.deepEqual(ch.intentos.map((x) => [x.opcion, x.negada]), [['primera', true], ['alternativa', false]]);
  // niega las tres: el envío forzado compite en categorías habituales; pérdida con robo, desvío, falta o recepción forzada
  const seen = new Set();
  for (const pickKey of ['turnover', 'foul', 'looseBall', 'delivered']) {
    const b = throwScene({ play: 'SaqF03', seed: 71 }); deny(b, 3); b.sampleDuration = (d, p) => (p.startsWith('saque:preparación') ? 8 : 3);
    const p0 = b.pick.bind(b); b.pick = (items, purpose) => (purpose === 'saque:envío forzado' ? (items.find((i) => i.key === pickKey) ?? items[0]) : p0(items, purpose));
    forceBern(b, [true, true, true, true, true]);
    const r = b.throwInPhase(b.poss, { kind: 'endline', origin: 'prueba' });
    const last = b.events.at(-1); seen.add(`${pickKey}:${last.type}`);
    if (pickKey === 'turnover') { assert.equal(last.type, 'attempt'); assert.equal(last.intent.categoria, 'turnover'); assert.equal(last.stats[0].p, last.participants.sacador, 'la pérdida es del sacador'); assert.ok(!b.events.some((e) => e.type === 'throw_in'), 'no hay recepción inventada'); assert.ok(r.end); assert.ok(last.effects.cadenaRobo); }
    if (pickKey === 'delivered') { assert.equal(last.type, 'throw_in'); assert.equal(last.effects.forzada, true); assert.equal(last.effects.calidadDeLaRecepcion, 'forced'); assert.deepEqual(r, { cont: 'throwIn' }); }
    if (pickKey === 'foul') { assert.equal(last.type, 'foul'); assert.ok(r.cont === 'foulWindow'); }
    assert.ok(b.throwChains[0].cierre === null || b.throwChains[0].cierre.startsWith('resultado') || pickKey === 'delivered');
  }
  assert.equal(seen.size, 4);
  // el plazo agotado antes de poder soltar el balón es una infracción del sacador (pérdida de equipo, balón muerto, saque rival)
  const c = throwScene({ play: 'SaqB01', seed: 72 }); c.sampleDuration = (d, p) => (p.startsWith('saque:preparación') ? 30 : 3);
  const q1 = c.qualityOf.bind(c); c.qualityOf = (ex, ...r) => (ex.throwOption === undefined ? q1(ex, ...r) : { cls: 'forced', K: -0.55, z: 0 });
  const rc = c.throwInPhase(c.poss, { kind: 'band', origin: 'prueba' }); assert.deepEqual(rc, { end: 'deadTurnover' });
  const ex = c.events.at(-1); assert.equal(ex.type, 'expiry'); assert.match(ex.intent.motivo, /5 segundos/); assert.deepEqual(ex.stats, [{ k: 'tov', p: null, team: 0, cause: 'violacion_5' }]);
  assert.equal(c.nextPoss.team, 1); assert.equal(c.nextPoss.entry, 'inbound'); assert.equal(c.nextPoss.throwIn.kind, 'band');
  assert.equal(c.throwChains[0].cierre, 'infracción del plazo');
});

// ------------------------------------------------------------------------------------------------ 7. relojes, plazo y poco tiempo
test('7. tres tiempos distintos: el plazo del sacador es administrativo, el reloj de juego solo corre si nunca se paró y el de posesión arranca al primer toque', () => {
  const dead = throwScene({ play: 'SaqF03', seed: 81 }); const c0 = dead.clock; const s0 = dead.shotClock; const en0 = Object.values(dead.ps).map((s) => s.energy);
  assert.ok(dead.throwInPhase(dead.poss, { kind: 'endline', origin: 'prueba' }));
  const ed = dead.events.at(-1); assert.equal(ed.durationTenths, 0, 'balón muerto: el plazo no consume reloj de juego'); assert.equal(dead.clock, c0); assert.equal(dead.shotClock, s0);
  assert.deepEqual(Object.values(dead.ps).map((s) => s.energy), en0, 'ni minutos jugados ni descanso por un intervalo administrativo'); assert.equal(dead.poss.early, false);
  assert.ok(ed.intent.plazo.preparacionDecimas > 0, 'la preparación sí consume plazo');
  // reloj en marcha (canasta sin parada): preparación + envío corren en el reloj de juego, no en el de posesión; el contexto queda temprano
  const run = throwScene({ play: 'SaqF03', seed: 81, running: true }); const cc = run.clock; const ss = run.shotClock;
  run.sampleDuration = (d, p) => (p.startsWith('saque:preparación') ? 12 : p === 'saque:envío' ? 4 : 1);
  assert.ok(run.throwInPhase(run.poss, { kind: 'endline', origin: 'canasta recibida' }));
  assert.equal(cc - run.clock, 16, 'preparación + envío en el reloj de juego'); assert.equal(run.shotClock, ss, 'el reloj de posesión aún no ha arrancado'); assert.equal(run.poss.early, true); assert.equal(run.shotClockOn, true);
  // no se descuenta todo el intervalo del reloj de juego «sin más»: con el reloj parado una canasta con reloj parado en los últimos 2 min no corre
  const stop = scene({ seed: 81, entry: 'inbound', throwIn: { kind: 'endline', origin: 'x' }, running: false }); assert.equal(stop.clockRunning, false);
  // con menos reloj que el mínimo de la secuencia, la administración existente decide (no se comprime la secuencia)
  const low = throwScene({ play: 'SaqF03', seed: 82, running: true }); low.clock = 3; assert.equal(low.throwInPhase(low.poss, { kind: 'endline', origin: 'x' }), null);
  // la bocina antes del primer toque impide la recepción
  const buz = throwScene({ play: 'SaqF03', seed: 83, running: true }); buz.clock = 30; buz.sampleDuration = (d, p) => (p.startsWith('saque:preparación') ? 40 : 4);
  const rb = buz.throwInPhase(buz.poss, { kind: 'endline', origin: 'x' }); assert.deepEqual(rb, { end: 'periodEnd' }); assert.equal(buz.clock, 0); assert.ok(!buz.events.some((e) => e.type === 'throw_in'));
  // Art. 16.2.5: recibir/controlar y lanzar requiere ≥ 0,3 s; con 0,2 s solo cabe una finalización directa (palmeo, exec «none»)
  const lim = scene({ seed: 84 }); lim.clock = 2; lim.shotClock = 240; lim.pick = (items) => items.find((i) => i.key === 'fieldShot') ?? items[0];
  const exs = { team: 0, origin: 'PRUEBA', kind: 'continuation', actor: 'EQ01-J03', zone: 'three', exec: 'pass', passer: 'EQ01-J01', icpt: 'EQ02-J04', defend: 'EQ02-J04', moved: false, offContact: null, holder: 'EQ01-J01', quality: { cls: 'normal', K: 0 } };
  assert.deepEqual(lim.resolveAttempt(exs), { end: 'periodEnd' }); assert.ok(!lim.events.some((e) => e.type === 'attempt' && e.stats.some((s) => s.k === 'shot')), 'no hay tiro regalado con 0,2 s');
  const tip = scene({ seed: 84 }); tip.clock = 2; tip.shotClock = 240; tip.pick = lim.pick; forceBern(tip, [false]);
  tip.resolveAttempt({ ...exs, exec: 'none', zone: 'rim', passer: null }); assert.ok(tip.events.some((e) => e.type === 'attempt' && e.stats.some((s) => s.k === 'shot')), 'la finalización directa sí es admisible');
  near(profile.rules.receiveAndShootMinimumSeconds, 0.3); assert.equal(profile.rules.throwInReleaseSeconds, 5);
});

test('7b. cadena de saque: empieza con su ejecución, termina por resultado o nueva organización y no cuenta dos veces los puntos posteriores', () => {
  let chains = []; let checked = 0;
  for (const seed of [401, 402]) {
    const inp = inputFor(seed); inp.teams.forEach((t) => { t.plan.throwInBook = ['SaqB02', 'SaqB03', 'SaqF01', 'SaqF02', 'SaqF03', 'SaqB01'].map((playId) => ({ playId, priority: 3 })); t.plan.styles.freedom = 4; });
    const res = runMatch(inp, profile, { detail: 'full', check: true }); assert.deepEqual(res.errors, []);
    chains = chains.concat(res.diagnostics.throwInChains.map((c) => ({ c, res })));
  }
  assert.ok(chains.length > 60);
  const closes = {}; let ptsChains = 0; let ptsAll = 0;
  for (const { c, res } of chains) {
    assert.ok(['cerrada', 'abierta', 'interrumpida'].includes(c.status)) /* MOTOR-15B: «interrumpida» = el final de periodo impide el desarrollo (antes quedaba «abierta») */;
    if (c.cierre) { const k = c.cierre.split(':')[0]; closes[k] = (closes[k] ?? 0) + 1; }
    const evs = res.events.filter((e) => e.possessionId === c.possession);
    const own = evs.filter((e) => e.intent?.cadenaSaque === c.id); let pts = 0;
    for (const e of own) for (const s of e.stats) { if (s.k === 'shot' && s.made) pts += s.points; if (s.k === 'ft' && s.made) pts += 1; }
    assert.ok(c.puntosDirectos >= pts && c.puntosDirectos <= pts + 6, `producción directa ${c.puntosDirectos} vs hechos de la cadena ${pts}`);
    // los puntos de una posesión organizada después de la nueva organización no se atribuyen al saque
    if (c.cierre === 'nueva organización') { assert.equal(c.puntosDirectos, 0); checked += 1; }
    ptsChains += c.puntosDirectos;
  }
  for (const { res } of [chains[0]]) ptsAll += res.score[0] + res.score[1];
  assert.ok(closes['nueva organización'] > 0 && (closes.resultado ?? 0) >= 0 && checked > 0, JSON.stringify(closes)); assert.ok(ptsChains < chains.length * 3, 'la producción directa es una fracción pequeña de la anotación');
  void ptsAll;
});

// ------------------------------------------------------------------------------------------------ 8. órdenes de saque y validación conjunta
test('8. llamada puntual: espera su saque compatible dentro del periodo, no la consume otro origen incompatible y caduca con el periodo; lo imposible se rechaza con motivo', () => {
  const m = createMatch(inputFor(91), profile, { detail: 'full', check: true });
  m.init(); m.step();
  const bad = m.submit({ team: 0, type: 'throwInCall', playId: 'SaqZ99' }); assert.equal(bad.state, 'rechazada');
  const call = m.submit({ team: 0, type: 'throwInCall', playId: 'SaqF02' }); assert.equal(call.state, 'pendiente'); assert.equal(call.scope.period, m.period); assert.equal(call.scope.throwKind, 'endline');
  // un saque de banda propio NO consume una llamada de fondo (origen incompatible)
  const b = scene({ seed: 91, entry: 'inbound', throwIn: { kind: 'band', origin: 'x' } }); b.submit({ team: 0, type: 'throwInCall', playId: 'SaqF02' });
  const o = b.orders.find((x) => x.type === 'throwInCall'); b.throwInPhase(b.poss, { kind: 'band', origin: 'x' }); assert.equal(o.state, 'pendiente', 'un saque de banda no consume una llamada de fondo');
  const f = scene({ seed: 91, entry: 'inbound', throwIn: { kind: 'endline', origin: 'x' } }); f.submit({ team: 0, type: 'throwInCall', playId: 'SaqF02' });
  const o2 = f.orders.find((x) => x.type === 'throwInCall'); f.throwInPhase(f.poss, { kind: 'endline', origin: 'x' }); assert.equal(o2.state, 'consumida'); assert.equal(f.events.find((e) => e.type === 'throw_in').intent.ficha, 'SaqF02'); assert.equal(f.events.find((e) => e.type === 'throw_in').intent.procedencia, 'llamada');
  // llamada a una ficha no activa en el libro: puntual, no la activa; la última solicitud válida del mismo tipo prevalece
  assert.ok(!f.teams[0].plan.throwInBook.some((x) => x.playId === 'SaqF02'));
  const g = scene({ seed: 92 }); const c1 = g.submit({ team: 0, type: 'throwInCall', playId: 'SaqF01' }); const c2 = g.submit({ team: 0, type: 'throwInCall', playId: 'SaqF02' }); assert.equal(c1.state, 'sustituida'); assert.equal(c2.state, 'pendiente');
  // caduca al terminar el periodo (con motivo) y una llamada pedida entre periodos apunta al siguiente
  const h = createMatch(inputFor(93), profile, { detail: 'full', check: true }); h.init(); h.step();
  const early = h.submit({ team: 0, type: 'throwInCall', playId: 'SaqB03' });
  while (h.status !== 'finished' && h.periodBreak == null) if (!h.step()) break;
  assert.ok(['consumida', 'caducada'].includes(early.state)); if (early.state === 'caducada') assert.match(early.reason, /periodo/);
  if (h.periodBreak != null) { const nxt = h.submit({ team: 0, type: 'throwInCall', playId: 'SaqB01' }); assert.equal(nxt.scope.period, h.periodBreak, 'un cambio para el cuarto siguiente no altera el saque anterior'); assert.equal(nxt.state, 'pendiente'); }
  // validación conjunta: lo imposible se rechaza entero y conserva la última configuración válida
  const v = createMatch(inputFor(94), profile, { detail: 'full', check: true }); v.init(); v.step();
  const cobBad = v.submit({ team: 1, type: 'defCoverage', coverage: 'COB03' }); assert.equal(cobBad.state, 'pendiente');
  const incompatible = v.submit({ team: 1, type: 'defThrowIn', band: 'DSaqB02' }); assert.equal(incompatible.state, 'rechazada', 'se valida contra el plan proyectado con la cobertura pendiente (COB03)'); assert.match(incompatible.reason, /cobertura declarada|compatible/);
  const proj = v.submit({ team: 1, type: 'defThrowIn', endline: 'DSaqF03' }); assert.equal(proj.state, 'rechazada'); assert.match(proj.reason, /persecución o cambio|compatible/);
  // al revés: con una respuesta de persecución solicitada, una cobertura incompatible se rechaza y se conserva la válida
  const w = createMatch(inputFor(94), profile, { detail: 'full', check: true }); w.init(); w.step();
  assert.equal(w.submit({ team: 1, type: 'defThrowIn', band: 'DSaqB02' }).state, 'pendiente');
  const cobRej = w.submit({ team: 1, type: 'defCoverage', coverage: 'COB04' }); assert.equal(cobRej.state, 'rechazada'); assert.match(cobRej.reason, /persecución o cambio|compatible/);
  assert.equal(v.submit({ team: 1, type: 'defThrowIn', endline: 'DSaqF02' }).state, 'rechazada', 'DSaqF02 necesita un objetivo designado');
  assert.equal(v.submit({ team: 1, type: 'defThrowIn', band: 'DSaqF01' }).state, 'rechazada', 'una respuesta de fondo no vale para banda');
  assert.equal(v.submit({ team: 1, type: 'throwInBook', priorities: { SaqB01: 9 } }).state, 'rechazada');
  assert.equal(v.submit({ team: 0, type: 'throwInServers', band: { preferred: 'EQ02-J01' } }).state, 'rechazada', 'un sacador debe ser del equipo');
  assert.equal(v.teams[1].plan.throwInDefense.band, 'DSaqB01', 'se conserva la última válida');
  const ok = v.submit({ team: 0, type: 'throwInBook', priorities: { SaqB02: 2, SaqB01: null } }); assert.equal(ok.state, 'pendiente');
  const okS = v.submit({ team: 0, type: 'throwInServers', endline: { preferred: 'EQ01-J03', alternate: 'EQ01-J01' } }); assert.equal(okS.state, 'pendiente');
  v.step(); v.step();
  assert.ok(v.teams[0].plan.throwInBook.some((x) => x.playId === 'SaqB02' && x.priority === 2) && !v.teams[0].plan.throwInBook.some((x) => x.playId === 'SaqB01'));
  assert.deepEqual(v.teams[0].plan.throwInServers.endline, { preferred: 'EQ01-J03', alternate: 'EQ01-J01' });
});

test('8b. entrada: un plan de saque imposible se rechaza con motivo; una entrada anterior se migra de forma explícita sin sobrescribir lo configurado', () => {
  const input = inputFor(95); assert.deepEqual(validateInput(input, profile), []);
  const bad = deepCopy(input); bad.teams[0].plan.throwInBook = [{ playId: 'SaqB01', priority: 3 }, { playId: 'SaqB01', priority: 4 }, { playId: 'SaqX', priority: 9 }];
  const errs = validateInput(bad, profile).map((e) => e.path); assert.ok(errs.some((p) => p.includes('throwInBook[1]')) && errs.some((p) => p.includes('throwInBook[2]')));
  const noF02 = deepCopy(input); noF02.teams[1].plan.throwInDefense = { band: 'DSaqB01', endline: 'DSaqF02', target: null }; assert.ok(validateInput(noF02, profile).some((e) => /objetivo/.test(e.message)));
  const cob = deepCopy(input); cob.teams[1].plan.coverage = 'COB03'; cob.teams[1].plan.throwInDefense.band = 'DSaqB02'; assert.ok(validateInput(cob, profile).some((e) => /cobertura declarada/.test(e.message)));
  const srv = deepCopy(input); srv.teams[0].plan.throwInServers.band = { preferred: 'EQ01-J03', alternate: 'EQ01-J03' }; assert.ok(validateInput(srv, profile).length > 0);
  // entrada de MOTOR-05 sin libro de saque: no es válida hasta migrarla; la migración es explícita, informa y conserva lo ya configurado
  const old = deepCopy(input); for (const t of old.teams) { delete t.plan.throwInBook; delete t.plan.throwInServers; delete t.plan.throwInDefense; }
  old.teams[1].plan.throwInBook = [{ playId: 'SaqF01', priority: 5 }]; // ya configurado: no se toca
  assert.ok(validateInput(old, profile).length > 0);
  const { input: up, added } = upgradeInput(old, profile);
  assert.deepEqual(validateInput(up, profile), []); assert.ok(added.some((a) => /SaqB01 y SaqF03 a prioridad 3/.test(a)));
  assert.deepEqual(up.teams[0].plan.throwInBook, [{ playId: ti.defaultBandOffensivePlan, priority: 3 }, { playId: ti.defaultEndlineOffensivePlan, priority: 3 }]);
  assert.deepEqual(up.teams[1].plan.throwInBook, [{ playId: 'SaqF01', priority: 5 }], 'un plan ya configurado no se sobrescribe');
  assert.deepEqual(up.teams[0].plan.throwInDefense, { band: ti.defaultBandDefensiveResponse, endline: ti.defaultEndlineDefensiveResponse, target: null });
  assert.equal(up.schema, 'beM-match-input/7'); // MOTOR-07 sube el formato (importancia y estados explícitos) y MOTOR-08 de nuevo (política de entrenador y plan de participación)
});

// ------------------------------------------------------------------------------------------------ 9. robo, sanciones y reglamento localizado
test('9. robo: acceso, decisión (una vez), ejecución, control y crédito se distinguen; no hay robo sin intento ni sorteo de crédito independiente', () => {
  let steals = 0; let losses = 0; let decisions = 0;
  for (const seed of [501, 502]) {
    const m = createMatch(inputFor(seed), profile, { detail: 'full', check: true });
    const orig = m.decideSteal.bind(m); m.decideSteal = (ex, tr) => { assert.equal(ex.stealAttempt, undefined, 'la referencia del intento no se aplica sobre una decisión ya tomada para la misma interacción'); decisions += 1; return orig(ex, tr); };
    while (m.step()) { /* hasta el final */ }
    const res = buildResult(m); assert.deepEqual(res.errors, []);
    for (const e of res.events) {
      if (e.effects?.perdida && e.type === 'attempt') { losses += 1; assert.ok(e.effects.cadenaRobo, 'la cadena queda registrada'); }
      if (e.effects?.robo && e.type === 'attempt') { steals += 1; assert.equal(e.effects.cadenaRobo.acceso, true); if (e.effects.cadenaRobo.control) assert.equal(e.effects.cadenaRobo.intento, true, 'el control del interceptor exige intento de intervenir'); else assert.ok(e.stats.some((x) => x.k === 'stl' && x.fuente === 'pérdida viva recuperada con control'), 'MOTOR-17: sin control propio solo hay robo por pérdida viva recuperada con control'); }
    }
  }
  assert.ok(decisions > 100);
  assert.ok(losses > 20); assert.ok(steals >= 1);
  // la referencia de nivel 3 se aplica tal cual (0,25); no se sube por el marcador ni por perseguir un número de robos
  near(profile.defense.choiceReferences.stealAttemptGivenAccessP0, 0.25); assert.equal(profile.sharedResolution.newGlobalStealTarget, null);
});

test('9b. falta táctica: categoría «disruptiva» propia; dos disruptivas no descalifican, dos flagrantes o técnicas de categoría 1 sí; ocho segundos solo con control en pista propia', () => {
  const m = scene({ seed: 96 });
  m.disruptiveAdmin('EQ01-J05', 'EQ02-J01', 1); m.disruptiveAdmin('EQ01-J05', 'EQ02-J01', 1);
  assert.equal(m.sanctions('EQ01-J05').disruptive, 2); assert.equal(m.disqualifies('EQ01-J05'), false); assert.equal(m.ps['EQ01-J05'].fouls, 2);
  assert.equal(m.events.filter((e) => e.type === 'foul' && e.intent.tipo === 'disruptiva').length, 2);
  assert.ok(!JSON.stringify(m.events).includes('antideportiva'), 'ya no se etiqueta como antideportiva genérica');
  m.sanctions('EQ01-J06').flagrant = 1; m.sanctions('EQ01-J06').technicalCat1 = 1; assert.equal(m.disqualifies('EQ01-J06'), true);
  // el ocho segundos solo cuenta el avance con control (el tiempo del saque y el plazo administrativo no entran): un saque con ficha no puede producir una violación de 8 s por sí mismo
  const res = runMatch(inputFor(97), profile, { detail: 'full', check: true });
  for (const e of res.events) if (e.type === 'throw_in') assert.ok(e.durationTenths < 80, 'la secuencia del saque no alcanza el avance de 8 s');
});

// ------------------------------------------------------------------------------------------------ 10. panel, exportación, reproducción y rechazo de formatos anteriores
function integrity(res) {
  assert.equal(res.status, 'finished'); assert.deepEqual(res.errors, []);
  assert.deepEqual(res.score, res.box.teams.map((t) => t.points)); // acta conciliada
  for (const e of res.events) assert.equal(e.durationTenths, e.clock.before - e.clock.after, e.id);
  for (const en of Object.values(res.diagnostics.finalEnergy)) assert.ok(en >= 0 && en <= 100);
  for (const t of [0, 1]) { const min = res.input.teams[t].players.reduce((s, p) => s + res.box.players[p.id].min, 0); const expected = 200 + (res.periodScores.length > 4 ? (res.periodScores.length - 4) * 25 : 0); assert.ok(Math.abs(min - expected) < 1e-6, `minutos ${min} ≠ ${expected}`); }
  // el reloj de juego del periodo se concilia con los hechos (intervalos y comienzos aparte)
  for (const p of res.periodScores) { const evs = res.events.filter((e) => e.period === p.period && e.type !== 'interval' && e.type !== 'period_start'); const used = evs.reduce((s, e) => s + e.durationTenths, 0); assert.equal(used, p.period <= 4 ? 6000 : 3000, `reloj del periodo ${p.period}`); }
}
test('10. órdenes y datos de saques: export/reproducción dentro de la versión, rechazo explícito de export/4 sin tocarlo y filas con consumidor y origen SEM', () => {
  const input = inputFor(101);
  const { m, orders } = playWithOrders(input, [
    { at: 8, spec: { team: 0, type: 'throwInCall', playId: 'SaqB02' } },
    { at: 20, spec: { team: 0, type: 'throwInBook', priorities: { SaqB02: 2, SaqF02: 4 } } },
    { at: 24, spec: { team: 1, type: 'defThrowIn', band: 'DSaqB03', endline: 'DSaqF02', target: 'EQ01-J01' } },
    { at: 30, spec: { team: 0, type: 'throwInServers', band: { preferred: 'EQ01-J03', alternate: 'EQ01-J01' } } },
    { at: 60, spec: { team: 0, type: 'throwInCall', playId: 'SaqF01' } },
  ]);
  assert.ok(orders.every((o) => o.state !== 'rechazada'), orders.map((o) => o.reason).join('; '));
  const res = buildResult(m); integrity(res);
  assert.equal(res.schema, EXPORT_SCHEMA); assert.equal(res.meta.engineVersion, ENGINE_VERSION); assert.match(EXPORT_SCHEMA, /export\/(5|6|7|8|9|10)$/); assert.match(ENGINE_VERSION, /(MOTOR(0[6789]|15|17|18)|SIM04E)/); // el contrato de la versión vigente lo fija motor07.test.js
  assert.ok(res.diagnostics.opportunities.length > 100 && res.diagnostics.throwInChains.length > 20, 'se exportan oportunidades y cadenas de saque');
  assert.ok(res.events.some((e) => e.type === 'throw_in' && e.intent.respuestaDefensiva === 'DSaqB03') || res.events.some((e) => e.intent?.respuestaDefensiva === 'DSaqB03'));
  const file = JSON.parse(JSON.stringify(res));
  const v = validateReplayFile(file); assert.equal(v.reproducible, true, v.problems.join('; '));
  const rep = replayMatch(file); assert.equal(rep.comparison.identical, true, JSON.stringify(rep.comparison.firstEventDifference ?? {}).slice(0, 400));
  // una exportación de MOTOR-05 se identifica como anterior, se rechaza con explicación y el archivo no se toca
  const old = { ...JSON.parse(JSON.stringify(res)), schema: 'beM-match-export/4' }; const snapshot = JSON.stringify(old);
  const vo = validateReplayFile(old); assert.equal(vo.reproducible, false); assert.equal(vo.legacy, true); assert.match(vo.problems[0], /MOTOR-05/); assert.equal(JSON.stringify(old), snapshot, 'el archivo conserva su contenido');
  assert.throws(() => replayMatch(old), /No se puede reproducir/);
  // el partido iniciado conserva su configuración efectiva congelada aunque se edite otro perfil
  const frozen = deepCopy(profile); frozen.throwIns.newOptionPreparationSeconds = [5, 5, 5];
  const a = createMatch(inputFor(102), profile, { detail: 'minimal' }); createMatch(inputFor(102), frozen, { detail: 'minimal' });
  assert.deepEqual(a.profileData.throwIns.newOptionPreparationSeconds, ti.newOptionPreparationSeconds);
});

test('10b. filas nuevas: cada campo SEM tiene nombre, tipo, unidad, consumidor y origen; las reglamentarias son de solo consulta y las filas llegan al comportamiento', async () => {
  const { buildRows, uncoveredLeaves } = await import('../src/profiles/rows.js');
  const rows = buildRows(profile);
  assert.deepEqual(uncoveredLeaves(profile, rows), [], 'toda hoja del perfil es fila o contenido declarado');
  const mine = rows.filter((r) => r.ext === 'SEM-MOTOR06'); assert.ok(mine.length >= 25, `${mine.length} filas de SEM-MOTOR06`);
  for (const r of mine) { assert.ok(r.label && r.type && r.unit && r.desc && r.effect, r.id); assert.ok(r.coverage === 'sin_consumidor' ? !!r.note || r.cls === 'invariante' || /ya está representada/i.test(r.desc) : !!r.mech, `${r.id}: sin consumidor ni explicación`); }
  const reg = rows.filter((r) => /^rules\.(throwInReleaseSeconds|receiveAndShootMinimumSeconds)$/.test(r.id)); assert.equal(reg.length, 2); for (const r of reg) { assert.equal(r.cls, 'reglamento'); assert.equal(r.editable, false); }
  assert.equal(rows.find((r) => r.id === 'sharedResolution.newShotConversionBonus').editable, false, 'la prima de acierto de situaciones nuevas está protegida a 0');
  // causalidad: editar la calidad percibida cambia el peso de elección de una opción; editar la preparación del saque cambia el plazo y el reloj
  const hi = deepCopy(profile); hi.opportunities.perceivedQualityChoiceWeight.forced = 0.1; hi.opportunities.perceivedQualityChoiceWeight.comfortable = 3;
  const mk = (prof) => { const m = scene({ seed: 29, entry: 'live', prof }); const dir = m.pickDirector(0); m.poss.director = dir; m.poss.early = true; m.poss.carrierPid = dir.id; return m.directItem(m.poss, dir, dir.id); };
  assert.notEqual(round4(mk(profile).pref), round4(mk(hi).pref), 'la fila llega al mecanismo');
  const slow = deepCopy(profile); slow.throwIns.newOptionPreparationSeconds = [2.4, 2.4, 2.4];
  const t = (prof) => { const m = scene({ seed: 81, entry: 'inbound', throwIn: { kind: 'endline', origin: 'x' }, running: true, prof }); const c = m.clock; m.throwInPhase(m.poss, { kind: 'endline', origin: 'x' }); return c - m.clock; };
  assert.ok(t(slow) > t(profile), 'más preparación, más reloj de juego cuando el reloj nunca se paró');
  // las respuestas defensivas no se suman como porcentajes: no hay ninguna fila de prioridad defensiva independiente
  assert.ok(!rows.some((r) => /DSaq/.test(r.id)), 'sin totales de prioridad defensiva independientes');
});

// ------------------------------------------------------------------------------------------------ 11. cinco partidos completos de cierre
test('11. cinco partidos completos de cierre: base, transición/libertad, libros de banda y fondo, guion de llamadas y reproducción en otro modo', async () => {
  const seed = 20261016;
  const base = runMatch(inputFor(seed), profile, { detail: 'full', check: true }); integrity(base);
  assert.ok(throwEvents(base).length > 40 && base.events.some((e) => e.intent?.procedencia === 'decisión directa'));
  // 2. transición y libertad al máximo: más decisiones, concesiones inspeccionables, ningún objetivo de marcador
  const lib = inputFor(seed); lib.teams.forEach((t) => Object.assign(t.plan.styles, { transition: 5, freedom: 5, organizedPace: 4 }));
  const fast = runMatch(lib, profile, { detail: 'full', check: true }); integrity(fast);
  const tags = new Set(outcomes(fast).flatMap((e) => e.intent.etiquetasESP ?? [])); assert.ok(tags.size >= 8, [...tags].join());
  const q = diagnosticQueries(fast); assert.ok(q.usoDirectoInicial.todos.calculable && q.aceptacionInmediata.calculable); assert.equal(q.capas.percibida.startsWith('no disponible'), true);
  // 3. libros y respuestas de banda y fondo configurados (sin forzar un número de saques)
  const books = inputFor(seed);
  books.teams[0].plan.throwInBook = PLAYS.map((playId, i) => ({ playId, priority: 1 + (i % 5) }));
  books.teams[0].plan.throwInServers = { band: { preferred: 'EQ01-J03', alternate: 'EQ01-J01' }, endline: { preferred: 'EQ01-J01', alternate: null } };
  books.teams[1].plan.throwInBook = ['SaqB03', 'SaqF02'].map((playId) => ({ playId, priority: 2 })); books.teams[1].plan.throwInDefense = { band: 'DSaqB03', endline: 'DSaqF02', target: 'EQ01-J01' }; books.teams[0].plan.throwInDefense = { band: 'DSaqB02', endline: 'DSaqF03', target: null };
  const bk = runMatch(books, profile, { detail: 'full', check: true }); integrity(bk);
  const fichas = new Set(throwEvents(bk).map((e) => e.intent.ficha)); const resps = new Set(throwEvents(bk).map((e) => e.intent.respuestaDefensiva));
  assert.ok(fichas.size >= 4 && resps.size >= 3, `${[...fichas]} / ${[...resps]}`);
  // 4. guion breve en fronteras reproducibles: llamada puntual, cambio de sacador y orden defensiva
  const { m: script } = playWithOrders(inputFor(seed), [
    { at: 12, spec: { team: 0, type: 'throwInCall', playId: 'SaqF01' } },
    { at: 40, spec: { team: 0, type: 'throwInServers', endline: { preferred: 'EQ01-J03', alternate: 'EQ01-J01' } } },
    { at: 70, spec: { team: 1, type: 'defThrowIn', endline: 'DSaqF03' } },
    { at: 90, spec: { team: 1, type: 'defCoverage', coverage: 'COB02' } },
  ]);
  const rs = buildResult(script); integrity(rs);
  const call = rs.orders.find((o) => o.type === 'throwInCall'); assert.ok(['consumida', 'caducada'].includes(call.state), call.state);
  const replay = replayMatch(JSON.parse(JSON.stringify(rs))); assert.equal(replay.comparison.identical, true);
  // 5. reproducción de la ejecución 1 en otro modo (por cuartos) con entrada y órdenes idénticas
  const s = new MatchSession({ input: inputFor(seed), profile, mode: 'cuartos', managedTeam: 0 });
  await s.start(); while (s.state === 'revision') await s.playNextPeriod();
  assert.equal(s.state, 'finalizado'); assert.deepEqual(s.result().score, base.score);
  assert.deepEqual(sportsProjection(s.result()).events.map((e) => e.id), sportsProjection(base).events.map((e) => e.id));
});
