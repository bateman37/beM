// MOTOR-08: entrenador automático (política, delegación por áreas, rotaciones, librillo, pausas, ajustes y finales) y memoria defensiva.
// Pocas pruebas con propósito (N04/N12): cada una protege un riesgo real de esta entrega. Los estados de partido «preparados» (fatiga, faltas, marcador, memoria)
// son escenas de prueba identificadas como tales: ninguna se presenta como resultado espontáneo del motor.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, stepUntil, FakeScheduler } from './helpers.js';
import { createMatch, runMatch, buildResult, deepCopy, validateInput, upgradeInput, EXPORT_SCHEMA, ENGINE_VERSION, coachCounts } from '../src/match/index.js';
import { decideRotation, decideTimeout, decideEndgame, foulBookRow, endgameState } from '../src/match/coach-policy.js';
import { MatchSession } from '../src/match/session.js';
import { sportsProjection, replayMatch, validateReplayFile } from '../src/match/replay.js';

const profile = data.profile; const cfg = profile.coach;
const rotCaps = (slot) => Object.keys(profile.rotation.slotAbilityWeights[slot]);

// Escena de prueba: encuentro iniciado con la posesión de EQ01 y reloj parado; `over` modifica la entrada antes de crearlo.
function scene({ seed = 7, over = () => {}, team = 0, full = true } = {}) {
  const input = inputFor(seed); over(input);
  const m = createMatch(input, profile, { detail: 'full', check: false });
  m.init(); m.startPossession({ team, entry: 'deadFront', shotClock: 240 });
  if (full) for (const id of Object.keys(m.ps)) m.ps[id].energy = 100;
  m.clockRunning = false;
  return m;
}
const setCaps = (input, ti, ids, slot, v) => { for (const p of input.teams[ti].players) if (ids.includes(p.id)) for (const k of rotCaps(slot)) p.abilities[k] = v; };
const lastDecisions = (m, area) => m.decisions.filter((d) => !area || d.area === area);

// ------------------------------------------------------------------------------------------------ 1. energía 30: mantener a una referencia o relevarla según la utilidad real del recambio
test('1. rotación: una referencia con energía 30 sigue frente a un relevo peor; con un relevo adecuado, el cansado sale (no basta con llamar a la función)', () => {
  const run = (benchValue) => {
    const m = scene({ over: (i) => { // EQ01: titular C = J10; todo el banquillo se valora por las capacidades del pívot
      const bench = i.teams[0].players.filter((p) => p.id !== 'EQ01-J10' && !Object.values(i.teams[0].plan.starters).includes(p.id)).map((p) => p.id);
      setCaps(i, 0, ['EQ01-J10'], 'C', 20); setCaps(i, 0, bench, 'C', benchValue);
    } });
    m.ps['EQ01-J10'].energy = 30; m.ps['EQ01-J10'].stintTenths = 3700; // 370 s en pista: supera el mínimo de la política
    const uStar = m.slotUtility('EQ01-J10', 'C'); const uBench = m.slotUtility('EQ01-J11', 'C');
    m.substitutionWindow('prueba');
    return { m, uStar, uBench };
  };
  // relevo 3 puntos peor: con la energía 30 la estrella aún vale ~1,5 más que él (pérdida 1,5 > 1,0 aceptable): se queda
  const a = run(17);
  assert.ok(a.uBench < a.uStar - 1.0 && a.uBench > 0, `el relevo pierde más de la tolerancia (${a.uStar.toFixed(2)} vs ${a.uBench.toFixed(2)})`);
  assert.equal(a.m.lineup[0].C, 'EQ01-J10', 'energía 30 provoca revisión, no expulsión del quinteto');
  assert.equal(a.m.decisions.filter((d) => d.propuesta?.sale === 'EQ01-J10').length, 0);
  // relevo 2 puntos peor en capacidad: con energía 100 pierde solo 0,5 frente a la estrella cansada: sale por fatiga
  const b = run(18);
  assert.ok(b.uBench >= b.uStar - 1.0, 'el recambio cabe en la pérdida de utilidad aceptable');
  assert.notEqual(b.m.lineup[0].C, 'EQ01-J10'); const d = b.m.decisions.find((x) => x.propuesta?.sale === 'EQ01-J10');
  assert.equal(d.estado, 'ejecutada'); assert.equal(d.observaciones.razones[0], 'fatiga'); assert.equal(d.utilidad.escala, '1–30'); assert.equal(d.politica, 'ENTREF02');
  assert.deepEqual(d.participantes.antes.length, 5); assert.ok(d.participantes.despues.includes(d.propuesta.entra) && !d.participantes.despues.includes('EQ01-J10'));
  // una política cauta acepta más pérdida (1,5) y una agresiva menos (0,5): mismas entradas, distinta decisión
  const caut = scene({ over: (i) => { i.teams[0].plan.coach.policy = 'ENTREF01'; const bench = i.teams[0].players.filter((p) => p.id !== 'EQ01-J10' && !Object.values(i.teams[0].plan.starters).includes(p.id)).map((p) => p.id); setCaps(i, 0, ['EQ01-J10'], 'C', 20); setCaps(i, 0, bench, 'C', 17.2); } });
  caut.ps['EQ01-J10'].energy = 30; caut.ps['EQ01-J10'].stintTenths = 3700; caut.substitutionWindow('prueba');
  assert.notEqual(caut.lineup[0].C, 'EQ01-J10', 'la cauta releva con una pérdida de 1,3');
  const agr = scene({ over: (i) => { i.teams[0].plan.coach.policy = 'ENTREF03'; const bench = i.teams[0].players.filter((p) => p.id !== 'EQ01-J10' && !Object.values(i.teams[0].plan.starters).includes(p.id)).map((p) => p.id); setCaps(i, 0, ['EQ01-J10'], 'C', 20); setCaps(i, 0, bench, 'C', 17.2); } });
  agr.ps['EQ01-J10'].energy = 30; agr.ps['EQ01-J10'].stintTenths = 3700; agr.substitutionWindow('prueba');
  assert.equal(agr.lineup[0].C, 'EQ01-J10', 'la agresiva mantiene a la referencia con la misma pérdida');
});

// ------------------------------------------------------------------------------------------------ 2. estabilidad y salida obligatoria
test('2. estabilidad: no hay intercambio inmediato ni antes del tramo mínimo; una salida obligatoria sí se permite y registra su regla', () => {
  const m = scene({ over: (i) => { const bench = i.teams[0].players.filter((p) => !Object.values(i.teams[0].plan.starters).includes(p.id)).map((p) => p.id); setCaps(i, 0, bench, 'C', 20); setCaps(i, 0, ['EQ01-J10'], 'C', 20); } });
  m.ps['EQ01-J10'].energy = 30; m.ps['EQ01-J10'].stintTenths = 3700; m.substitutionWindow('prueba');
  const entra = m.lineup[0].C; assert.notEqual(entra, 'EQ01-J10');
  // el entrante está cansado, pero acaba de entrar: reentrada inmediata (reloj parado) y tramo mínimo (reloj en marcha) lo impiden
  m.ps[entra].energy = 30; m.substitutionWindow('inmediata'); assert.equal(m.lineup[0].C, entra, 'reentrada inmediata: espera a que corra el reloj');
  m.consume(50, 'organized'); m.substitutionWindow('tras 5 s'); assert.equal(m.lineup[0].C, entra, 'estabilidad: lleva 5 s en pista (mínimo 360 s)');
  // salida obligatoria: la exclusión por faltas no espera a ningún mínimo ni a la reentrada inmediata
  m.ps[entra].fouls = 5; m.ps[entra].available = false;
  m.substitutionWindow('exclusión');
  assert.notEqual(m.lineup[0].C, entra); const d = m.decisions.find((x) => x.propuesta?.sale === entra);
  assert.equal(d.regla, 'FB100_REGLAMENTO'); assert.equal(d.observaciones.excepcion, 'none', 'el librillo no admite excepción deportiva a la exclusión'); assert.equal(d.area, 'rotation'); assert.match(d.causa ?? d.historia.at(-1).causa, /sustitución efectiva/);
  assert.equal(m.ps[m.lineup[0].C].available, true);
  // energía crítica: refuerza la revisión y exime del tramo mínimo (excepción declarada y registrada)
  const k = scene({ over: (i) => { const bench = i.teams[0].players.filter((p) => !Object.values(i.teams[0].plan.starters).includes(p.id)).map((p) => p.id); setCaps(i, 0, bench, 'C', 20); setCaps(i, 0, ['EQ01-J10'], 'C', 20); } });
  k.ps['EQ01-J10'].energy = 8; k.ps['EQ01-J10'].stintTenths = 600; k.substitutionWindow('crítica');
  const dk = k.decisions.find((x) => x.propuesta?.sale === 'EQ01-J10'); assert.ok(dk, 'con energía crítica se revisa aunque no haya tramo mínimo'); assert.match(dk.observaciones.estabilidad.excepcion, /energía crítica/); assert.equal(coachCounts(k.decisions, k.orders).sustituciones.excepcionesDeEstabilidad, 1);
});

// ------------------------------------------------------------------------------------------------ 3. librillo de faltas
test('3. librillo: la protección ordinaria difiere del cierre y la urgencia; una fila de mayor prioridad prevalece; el excluido nunca se mantiene', () => {
  const mk = (period, clockSec, score, fouls, id = 'EQ01-J10') => {
    const m = scene({ over: (i) => { const bench = i.teams[0].players.filter((p) => !Object.values(i.teams[0].plan.starters).includes(p.id)).map((p) => p.id); for (const p of i.teams[0].players) if (bench.includes(p.id) || p.id === id) for (const k of Object.keys(p.abilities)) p.abilities[k] = 20; } });
    // estado de prueba acotado (no espontáneo): periodo, reloj, marcador y faltas
    m.period = period; m.clock = clockSec * 10; m.score = score; m.ps[id].fouls = fouls; m.ps[id].stintTenths = 4000;
    return m;
  };
  const row = (m, id = 'EQ01-J10') => { const v = m.coachView(0); return foulBookRow(v, cfg, v.own.players.find((p) => p.id === id), false); };
  // Q1, dos faltas: protección (fila 70) con un relevo compatible dentro de la tolerancia
  let m = mk(1, 400, [10, 10], 2); assert.equal(row(m).id, 'FB070Q1'); m.substitutionWindow('Q1'); assert.notEqual(m.lineup[0].C, 'EQ01-J10');
  assert.equal(m.decisions.find((d) => d.propuesta?.sale === 'EQ01-J10').area, 'fouls'); assert.equal(m.decisions.find((d) => d.propuesta?.sale === 'EQ01-J10').regla, 'FB070Q1');
  // las prórrogas no reinician las faltas ni se tratan como un nuevo Q1: con dos faltas en la 1.ª prórroga no hay fila de protección
  m = mk(5, 200, [80, 80], 2); assert.equal(row(m), null);
  // Q3 con cuatro: protege; Q4 con cuatro y más de la ventana de cierre: reducir riesgo (fila 60)
  m = mk(3, 300, [60, 60], 4); assert.equal(row(m).id, 'FB070Q3'); m = mk(4, 400, [60, 60], 4); assert.equal(row(m).id, 'FB060Q4');
  // cierre disputado (≤180 s y margen ≤8) con cuatro: gana la fila 80, que COMPARA el valor de cierre y puede mantenerlo
  m = mk(4, 120, [80, 77], 4); assert.equal(row(m).id, 'FB080CLOSE'); m.substitutionWindow('cierre');
  assert.equal(m.lineup[0].C, 'EQ01-J10', 'con cuatro faltas y un relevo igual, el cierre lo mantiene: no se retira por nombre ni por faltas');
  assert.ok(m.decisions.some((d) => d.regla === 'FB080CLOSE' && d.propuesta.tipo === 'mantener'));
  // desventaja de 12 o más con ≤300 s del último periodo: fila 75 (acepta antes el riesgo de mantener una referencia) por encima de la 60
  m = mk(4, 250, [60, 75], 4); assert.equal(row(m).id, 'FB075URGENT'); m.substitutionWindow('urgencia'); assert.equal(m.lineup[0].C, 'EQ01-J10');
  // una orden manual sobre el quinteto (fila 90) prevalece sobre la protección del entrenador
  m = mk(1, 400, [10, 10], 2); const vv = m.coachView(0); assert.equal(foulBookRow(vv, cfg, vv.own.players.find((p) => p.id === 'EQ01-J10'), true).id, 'FB090');
  // la exclusión reglamentaria (fila 100) no admite excepción: con cinco faltas el jugador sale aunque haya urgencia, cierre o decisión de mantener
  m = mk(4, 100, [80, 79], 5); m.ps['EQ01-J10'].available = false; assert.equal(foulBookRow(m.coachView(0), cfg, { available: false, fouls: 5 }, false).id, 'FB100');
  m.substitutionWindow('excluido'); assert.notEqual(m.lineup[0].C, 'EQ01-J10');
  // protección sin cambio: el defensor protegido reduce sus intentos VOLUNTARIOS de robo (nivel de la política menos uno), no su probabilidad de falta
  m = mk(1, 400, [10, 10], 2); for (const p of m.teams[0].ids) if (p !== 'EQ01-J10') m.ps[p].energy = 5; // sin relevo listo (<65): se mantiene y se reduce el riesgo evitable
  m.substitutionWindow('sin relevo'); m.coachFrontier('prueba');
  assert.equal(m.lineup[0].C, 'EQ01-J10'); assert.ok(m.coachState[0].riskProtected.has('EQ01-J10'));
  const dec = m.decisions.find((d) => d.propuesta?.tipo === 'mantener' && d.regla === 'FB070Q1'); assert.ok(dec, 'queda registrada la fila que motivó mantener');
  const tr = {}; m.poss.team = 1; m.decideSteal({ team: 1, icpt: 'EQ01-J10', defend: 'EQ01-J10', exec: 'dribble' }, tr); assert.equal(tr.proteccionDeFaltas.nivelDeRobo, Math.max(1, m.teams[0].plan.defStyles.steal - cfg.foulProtection.stealStyleLevelReduction));
});

// ------------------------------------------------------------------------------------------------ 4. órdenes manuales y delegación
test('4. una orden manual bloquea el ajuste automático de su campo; una propuesta espera su frontera legal y no se duplica', () => {
  const seed = (m, defT) => { // memoria de prueba: el rival (equipo 0) repite el directo y el director consigue tiros cómodos (patrón pnr|handler)
    m.mem[defT].entries.push({ key: 'pnr|handler', pattern: 'MEMP02', family: 'pnr', role: 'handler', evidence: 3.2, ref: 0, firstAttack: 0, lastAttack: 0, exposures: 4, comfort: { comfortable: 3, contested: 1, uncomfortable: 0 }, actors: { 'EQ01-J01': 4 }, helpers: {}, abandoned: {}, zones: { three: 4 }, response: null, lastAdjust: null });
    m.attackSeq[1 - defT] = 0;
  };
  // sin orden manual: el entrenador delegado propone una respuesta compatible (pendiente de su frontera), una sola vez
  let m = scene(); seed(m, 1); m.coachFrontier('prueba'); m.coachFrontier('prueba');
  const autos = m.orders.filter((o) => o.issuer === 'auto' && o.team === 1 && o.kind === 'plan'); assert.equal(autos.length, 1, 'la misma frontera y contexto no producen decisiones equivalentes');
  assert.equal(autos[0].state, 'pendiente'); assert.notEqual(m.teams[1].plan.coverage, 'COB03', 'proponer no cambia el plan: la respuesta entra en su frontera');
  const dec = m.decisions.find((d) => d.area === 'adjustments' && d.propuesta); assert.equal(dec.estado, 'pendiente'); assert.equal(dec.propuesta.respuesta, 'MEMR02a'); assert.match(dec.propuesta.concesion, /continuador/);
  m.activatePlanOrders(m.period, { entry: true }); assert.equal(autos[0].state, 'vigente'); assert.equal(m.teams[1].plan.coverage, 'COB03'); assert.equal(dec.estado, 'ejecutada');
  // con órdenes manuales sobre los campos de todas las candidatas: ninguna se aplica y queda «reconocido, sin respuesta autorizada/compatible»
  m = scene(); seed(m, 1);
  assert.equal(m.submit({ team: 1, type: 'defCoverage', coverage: 'COB02' }).state, 'pendiente'); assert.equal(m.submit({ team: 1, type: 'defStyles', defStyles: { pressure: 2 } }).state, 'pendiente');
  m.coachFrontier('prueba');
  assert.equal(m.orders.filter((o) => o.issuer === 'auto' && o.team === 1 && o.kind === 'plan').length, 0, 'una orden manual no se sobrescribe con un ajuste automático');
  const rej = m.decisions.find((d) => d.area === 'adjustments' && !d.propuesta); assert.match(rej.causa, /sin respuesta autorizada\/compatible/);
  assert.ok(rej.observaciones.candidatasDescartadas.every((c) => /orden manual vigente/.test(c.motivo)), JSON.stringify(rej.observaciones.candidatasDescartadas));
  // «hasta final de cuarto»: la orden manual solo fija su campo hasta el cierre de ese periodo; devolver los ajustes al entrenador libera el bloqueo explícitamente
  m = scene(); seed(m, 1); m.submit({ team: 1, type: 'defCoverage', coverage: 'COB02', lockUntil: 'period' }); m.submit({ team: 1, type: 'defStyles', defStyles: { pressure: 2 }, lockUntil: 'period' });
  m.activatePlanOrders(m.period, { entry: true }); assert.ok(m.manualLocks(1).has('coverage')); m.period = 2; assert.ok(!m.manualLocks(1).has('coverage'), 'termina el periodo: el campo vuelve a ser del entrenador');
  m = scene(); seed(m, 1); m.submit({ team: 1, type: 'defCoverage', coverage: 'COB02' }); m.activatePlanOrders(m.period, { entry: true }); assert.ok(m.manualLocks(1).has('coverage'));
  assert.equal(m.submit({ team: 1, type: 'coachDelegation', areas: { adjustments: true }, releaseLocks: true }).state, 'pendiente'); m.activatePlanOrders(m.period, { entry: true });
  assert.ok(!m.manualLocks(1).has('coverage'), 'devolver los ajustes libera el control manual');
  // ámbito no delegado: se reconoce y se recomienda, pero no se ejecuta nada
  m = scene({ over: (i) => { i.teams[1].plan.coach.delegation.adjustments = false; } }); seed(m, 1); m.coachFrontier('prueba');
  assert.equal(m.orders.filter((o) => o.issuer === 'auto').length, 0); assert.match(m.decisions.find((d) => d.area === 'adjustments').causa, /no delegado/);
  // validación de la delegación: ámbitos y políticas del catálogo
  assert.equal(m.submit({ team: 1, type: 'coachDelegation', areas: { inventado: true } }).state, 'rechazada'); assert.equal(m.submit({ team: 1, type: 'coachDelegation', policy: 'ENTREF09' }).state, 'rechazada');
});

// ------------------------------------------------------------------------------------------------ 5. tiempos muertos
test('5. tiempo muerto: se solicita con causa y evidencia, espera su ventana legal, consume el recurso y la pausa una sola vez y se cancela si su causa desaparece', () => {
  const rec = (points, comfortable, loss = 0) => ({ points, comfortable, avoidableLosses: loss, denialReorganizations: 0, opponentCoordinationFailures: 0, done: true });
  const arm = (m, t, own, opp) => { m.attackLog[t] = [...own]; m.attackLog[1 - t] = [...opp]; };
  const m = scene(); const T = 0; // el equipo 0 pierde 0–9 en 4 ataques con 2 oportunidades cómodas rivales
  arm(m, T, [rec(0, 0), rec(0, 0), rec(0, 0, 1), rec(0, 0)], [rec(3, 1), rec(2, 0), rec(2, 1), rec(2, 0)]);
  m.period = 2; m.clock = 3000; m.score = [20, 29]; m.poss.done = true; m.nextPoss = { team: 1, entry: 'inbound', shotClock: 240 };
  m.coachFrontier('prueba'); m.coachFrontier('prueba');
  const reqs = m.orders.filter((o) => o.type === 'timeout' && o.issuer === 'auto'); assert.equal(reqs.length, 1, 'no se pide una segunda pausa por el mismo problema'); assert.equal(reqs[0].state, 'pendiente');
  assert.equal(reqs[0].content.cause, 'runWithDisorder'); assert.equal(m.timeouts[T].used.h1 ?? 0, 0, 'proponer no gasta el recurso');
  const dec = m.decisions.find((d) => d.area === 'timeouts'); assert.equal(dec.estado, 'pendiente'); assert.equal(dec.observaciones.evidencia.adverse, 9); assert.equal(dec.observaciones.evidencia.comfortable, 2);
  // llega la ventana: se concede una vez; el recurso se cobra una vez, la pausa de estados se registra una vez y la energía se recupera una vez
  const e0 = m.teams[0].ids.map((id) => m.ps[id].energy); for (const id of m.teams[0].ids) m.ps[id].energy -= 10; const before = m.teams[0].ids.map((id) => m.ps[id].energy);
  m.queueWindow({ reason: 'balón muerto', timeoutTeams: [0, 1], subs: true }); const pauses = m.pauses.length; const r = m.processWindow();
  assert.equal(r.autoTimeouts, 1); assert.equal(r.timeouts, 0, 'el visionado solo se detiene con un tiempo muerto pedido por Dennis');
  assert.equal(reqs[0].state, 'consumida'); assert.equal(m.timeouts[T].used.h1, 1); assert.equal(m.pauses.length, pauses + 1, 'una sola pausa deportiva');
  m.teams[0].ids.forEach((id, k) => assert.ok(Math.abs(m.ps[id].energy - Math.min(100, before[k] + m.cfg.timeOutRecoveryEnergyPoints)) < 1e-9, 'la recuperación se aplica una vez'));
  void e0; assert.equal(dec.estado, 'ejecutada'); assert.equal(m.events.filter((e) => e.type === 'timeout').length, 1);
  // cooldown: otra racha inmediata no vuelve a pedir una causa ordinaria; reserva: con 1 pausa restante en la 1.ª mitad se conserva para el cierre
  m.coachFrontier('otra'); assert.equal(m.orders.filter((o) => o.type === 'timeout' && o.issuer === 'auto' && o.state === 'pendiente').length, 0);
  // una solicitud pendiente cuya causa desaparece se cancela con motivo y no gasta el recurso
  const n = scene(); arm(n, T, [rec(0, 0), rec(0, 0), rec(0, 0, 1), rec(0, 0)], [rec(3, 1), rec(2, 0), rec(2, 1), rec(2, 0)]); n.period = 2; n.clock = 3000; n.score = [20, 29]; n.poss.done = true; n.nextPoss = { team: 1, entry: 'inbound', shotClock: 240 };
  n.coachFrontier('prueba'); const p0 = n.orders.find((o) => o.type === 'timeout' && o.issuer === 'auto'); assert.equal(p0.state, 'pendiente');
  arm(n, T, [rec(3, 0), rec(2, 0), rec(2, 0), rec(2, 0)], [rec(0, 0), rec(0, 0), rec(0, 0), rec(0, 0)]); // el equipo remonta: ya no hay racha
  n.queueWindow({ reason: 'balón muerto', timeoutTeams: [0, 1], subs: true }); n.processWindow();
  assert.equal(p0.state, 'cancelada'); assert.match(p0.reason, /ya no se cumple/); assert.equal(n.timeouts[T].used.h1 ?? 0, 0); assert.equal(n.events.filter((e) => e.type === 'timeout').length, 0);
  // una orden manual de tiempo muerto prevalece sobre la solicitud automática
  const q = scene(); arm(q, T, [rec(0, 0), rec(0, 0), rec(0, 0, 1), rec(0, 0)], [rec(3, 1), rec(2, 0), rec(2, 1), rec(2, 0)]); q.period = 2; q.clock = 3000; q.score = [20, 29]; q.poss.done = true; q.nextPoss = { team: 1, entry: 'inbound', shotClock: 240 };
  q.coachFrontier('prueba'); assert.equal(q.submit({ team: 0, type: 'timeout' }).state, 'pendiente'); q.coachFrontier('otra');
  assert.equal(q.orders.find((o) => o.type === 'timeout' && o.issuer === 'auto').state, 'cancelada');
});

// ------------------------------------------------------------------------------------------------ 6. memoria: semántica, decaimiento, capacidad y calidad previa al acierto
test('6. memoria: reconoce el mismo recurso aunque cambie la ficha, decae, no pasa de ocho y la calidad procede de hechos, no del acierto', () => {
  const m = scene(); const D = 1; // defiende el equipo 1 frente al ataque del 0
  const attack = () => { m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); };
  const exp = (over = {}) => m.memObserve({ team: 0, family: 'pick_and_roll', role: 'screener', zone: 'rim', actor: 'EQ01-J10', exec: 'pass', quality: { cls: 'normal' }, ...over });
  attack(); exp({ origin: 'POS01' }); attack(); exp({ origin: 'POS02', window: true, helpWindow: 'continuador libre' });
  const e = m.mem[D].entries; assert.equal(e.length, 1, 'otra ficha de la misma familia y función es el mismo patrón'); assert.equal(e[0].key, 'pnr|screener'); assert.equal(e[0].exposures, 2);
  assert.equal(e[0].pattern, 'MEMP01'); const first = 1; const second = first * 2 ** (-1 / 7) + 1; assert.ok(Math.abs(e[0].evidence - second) < 1e-9, 'primero decae y después incrementa (una vez por ataque)');
  exp(); assert.equal(e[0].exposures, 2, 'como máximo una exposición del mismo patrón por ataque continuo (un rebote ofensivo o una continuación no la multiplican)');
  // semivida: tras siete ataques rivales sin repetición queda la mitad de la evidencia; no se aplica dos veces el mismo tramo
  for (let i = 0; i < 7; i++) attack(); const s = m.memorySummary(D)[0]; assert.ok(Math.abs(s.evidence - e[0].evidence * 0.5) < 1e-9); assert.ok(Math.abs(m.memorySummary(D)[0].evidence - s.evidence) < 1e-12);
  // la calidad observable sale de hechos: un número de ventaja sin hecho no es «cómoda»; el receptor libre sí
  assert.equal(m.observableOpportunity({ exec: 'pass', quality: { cls: 'comfortable' } }).cls, 'contested', 'sin causa observable la clase numérica no basta');
  assert.equal(m.observableOpportunity({ exec: 'pass', window: true, quality: { cls: 'normal' } }).cls, 'comfortable'); assert.equal(m.observableOpportunity({ exec: 'pass', quality: { cls: 'forced' } }).cls, 'uncomfortable');
  // capacidad: doce funciones distintas no superan ocho entradas y se reemplaza la de menor evidencia efectiva
  for (let i = 0; i < 12; i++) { attack(); exp({ role: `r${i}`, family: 'handoff' }); }
  assert.ok(m.mem[D].entries.length <= 8); assert.ok(m.memLog.some((x) => x.tipo === 'reemplazo' && x.equipo === 'EQ02'));
  // exposición y calidad se registran ANTES de conocer el acierto: en un encuentro real, la observación precede a la categoría y a todo sorteo de resultado
  const r = scene({ seed: 11, full: true }); const order = [];
  const obs = r.memObserve.bind(r); r.memObserve = (ex) => { order.push('obs'); return obs(ex); }; const pk = r.pick.bind(r); r.pick = (items, purpose) => { if (purpose === 'categoría') order.push('cat'); return pk(items, purpose); };
  r.clockRunning = true; stepUntil(r, (x) => order.filter((q) => q === 'cat').length >= 10, 400);
  order.forEach((q, i) => { if (q === 'cat') assert.equal(order[i - 1], 'obs', 'la observación precede a la selección de categoría'); });
  assert.ok(r.memLog.some((x) => x.tipo === 'exposición' && typeof x.calidad === 'string'));
});

// ------------------------------------------------------------------------------------------------ 7. reconocer no penaliza el acierto ni autoriza lo incompatible
test('7. reconocer no cambia la probabilidad de nada ni autoriza una respuesta incompatible; la respuesta existe solo al ejecutarse en su frontera', () => {
  // cobertura válida para la familia: el indirecto no hereda las coberturas del directo
  const m = scene();
  assert.equal(m.coverageCompatible('pnr', 'COB04').ok, true); assert.equal(m.coverageCompatible('handoff', 'COB04').ok, true); assert.equal(m.coverageCompatible('handoff', 'COB03').ok, false);
  assert.equal(m.coverageCompatible('offBallScreen', 'COB03').ok, false); assert.equal(m.coverageCompatible('offBallScreen', 'COB04').ok, false); assert.equal(m.coverageCompatible('offBallScreen', 'COB02').ok, true);
  assert.equal(m.coverageCompatible('post', 'COB01').ok, false, 'una familia sin coberturas por interacción no recibe una respuesta de cobertura');
  for (const r of profile.memory.responses.filter((x) => x.order.type === 'defCoverage')) { const fam = profile.memory.patterns.find((p) => p.id === r.pattern).family; assert.equal(m.coverageCompatible(fam, r.order.coverage).ok, true, `${r.id}: el catálogo solo propone coberturas válidas para su familia`); }
  // sin delegar ningún ámbito, tener memoria reconocida no cambia ningún hecho deportivo: el reconocimiento no es un modificador de acierto
  const quiet = (i) => { for (const t of i.teams) for (const k of Object.keys(t.plan.coach.delegation)) t.plan.coach.delegation[k] = false; };
  const play = (withMemory) => {
    const x = createMatch((() => { const i = inputFor(20261016); quiet(i); return i; })(), profile, { detail: 'minimal' });
    if (withMemory) for (const D of [0, 1]) x.mem[D].entries.push({ key: 'pnr|handler', pattern: 'MEMP02', family: 'pnr', role: 'handler', evidence: 4, ref: 0, firstAttack: 0, lastAttack: 0, exposures: 6, comfort: { comfortable: 6, contested: 0, uncomfortable: 0 }, actors: {}, helpers: {}, abandoned: {}, zones: {}, response: null, lastAdjust: null });
    while (x.step()) { /* */ }
    return JSON.parse(JSON.stringify(sportsProjection(buildResult(x)).events).replace(/"decision":"D\d+"/g, '"decision":"D"')); // los reconocimientos añaden decisiones registradas (otra numeración), no hechos
  };
  assert.deepEqual(play(true), play(false), 'con la memoria reconocida pero sin respuesta autorizada, los hechos son idénticos (ningún acierto cambia)');
});

// ------------------------------------------------------------------------------------------------ 8. contrato de información
test('8. la vista del entrenador excluye información rival privada y el futuro: variar un dato rival oculto no cambia la vista ni las propuestas', () => {
  const m = createMatch(inputFor(20261016), profile, { detail: 'minimal' }); stepUntil(m, (x) => x.period >= 2 && x.clock < 4000, 4000);
  const view0 = JSON.stringify(m.coachView(0)); const keys = (o) => JSON.stringify(Object.keys(o));
  const rival = (v) => v.opp.players[0]; assert.equal(keys(rival(m.coachView(0))), keys({ id: 1, onCourt: 1, available: 1, fouls: 1 }), 'del rival solo constan hechos públicos');
  assert.ok(!/EQ02[^"]*"energy"|forma|momentos/.test(JSON.stringify(m.coachView(0).opp)), 'sin energía, Forma ni momentos rivales');
  const mem = profile.memory; const decide = (v) => JSON.stringify([decideRotation(v, cfg, profile), decideTimeout(v, cfg, [], mem), decideEndgame(v, cfg), endgameState(v, cfg, cfg.policies[v.own.policy]).active]);
  const p0 = decide(m.coachView(0));
  // variación de todo lo oculto del rival: energía, Forma, momentos, T, capacidades y el estado del generador de azar (futuro)
  for (const id of m.teams[1].ids) { m.ps[id].energy = (m.ps[id].energy + 41) % 100; m.ps[id].form = -m.ps[id].form - 0.3; for (const k of ['M_TIR', 'M_OFE', 'M_DEF']) m.ps[id].mom[k].v = 0.77; m.pl[id] = { ...m.pl[id], abilities: Object.fromEntries(Object.entries(m.pl[id].abilities).map(([k, v]) => [k, 30 - v + 1])) }; }
  m.tm[1].v = -0.9; m.rng.next('prueba'); m.rng.next('prueba');
  assert.equal(JSON.stringify(m.coachView(0)), view0, 'la vista no cambia con lo oculto del rival ni con el azar futuro'); assert.equal(decide(m.coachView(0)), p0);
  // lo propio sí está: energía exacta de la plantilla (con la precisión de la vista ordinaria: entera) y Forma/momentos solo como categorías
  const own = m.coachView(0).own.players[0]; assert.equal(Number.isInteger(own.energy), true); assert.equal(typeof own.forma, 'string'); assert.ok(Object.values(own.momentos).every((x) => typeof x === 'string'));
  assert.ok(!('M_TIR' in own) && !('form' in own));
});

// ------------------------------------------------------------------------------------------------ 9. reproducción y modalidades
test('9. exportar y reproducir conservan decisiones, hechos y órdenes automáticas (que no se reinyectan ni consumen un recurso dos veces); total y por cuartos coinciden', async () => {
  const input = () => { const i = inputFor(20261016); i.teams[0].plan.coach.policy = 'ENTREF01'; i.teams[1].plan.coach.policy = 'ENTREF03'; return i; };
  const sess = (mode) => new MatchSession({ input: input(), profile, mode, scheduler: new FakeScheduler() });
  const a = sess('total'); await a.start(); const ra = a.result();
  const b = sess('cuartos'); await b.start(); while (b.state === 'revision') await b.playNextPeriod(); const rb = b.result();
  assert.deepEqual(sportsProjection(rb), sportsProjection(ra), 'por cuartos sin editar = total: mismas decisiones y hechos');
  assert.ok(ra.diagnostics.coach.decisions.length > 10 && ra.orders.some((o) => o.issuer === 'auto' && o.type === 'timeout' || o.issuer === 'auto' && o.kind === 'plan'), 'hubo decisiones y órdenes automáticas');
  // las órdenes automáticas no son comandos: la reproducción las regenera y no las ejecuta dos veces
  assert.equal(ra.commands.length, 0); const rep = replayMatch(JSON.parse(JSON.stringify(ra)), { detail: 'minimal' });
  assert.equal(rep.comparison.identical, true, JSON.stringify(rep.comparison.parts)); assert.equal(rep.result.orders.filter((o) => o.issuer === 'auto').length, ra.orders.filter((o) => o.issuer === 'auto').length);
  const used = (r) => r.diagnostics.timeouts.map((l) => JSON.stringify(l.used)); assert.deepEqual(used(rep.result), used(ra), 'cada tiempo muerto consume su recurso una sola vez');
  assert.equal(rep.result.events.filter((e) => e.type === 'timeout').length, ra.events.filter((e) => e.type === 'timeout').length);
  // contrato: export/7; export/6 y anteriores se rechazan con motivo y sin migrarse
  assert.equal(ra.schema, EXPORT_SCHEMA); assert.match(EXPORT_SCHEMA, /export\/[78]$/); assert.match(ENGINE_VERSION, /MOTOR0[89]/);
  const v6 = validateReplayFile({ schema: 'beM-match-export/6', meta: { engineVersion: 'beM-motor-0.7.0-MOTOR07' } }); assert.equal(v6.legacy, true); assert.equal(v6.reproducible, false); assert.match(v6.problems[0], /MOTOR-07.*entrenador automático/);
  // la entrada anterior sin política ni plan se migra de forma explícita y anotada; lo ya configurado no se sobrescribe
  const old = deepCopy(input()); delete old.teams[0].plan.coach; delete old.teams[0].plan.participation; old.teams[1].plan.coach.delegation.rotation = false;
  assert.ok(validateInput(old, profile).length > 0); const { input: up, added } = upgradeInput(old, profile);
  assert.deepEqual(validateInput(up, profile), []); assert.ok(added.some((x) => /ENTREF02/.test(x)) && added.some((x) => /participación/.test(x))); assert.equal(up.teams[1].plan.coach.delegation.rotation, false); assert.match(up.schema, /input\/6$/);
});

// ------------------------------------------------------------------------------------------------ 10. correcciones reglamentarias puntuales (§12)
test('10. disruptiva: lanza quien recibió la falta y el saque de penalización sale con 14 s exactos; el saque sin opción no inventa una recepción', () => {
  // OBR 2026 v1.1 arts. 37.2/38.2/17.2.7/29.2.6 (resumen del encargo): sin acto de tiro, dos libres para quien recibió la falta; saque de su equipo con 14 s
  const g = scene({ seed: 33, team: 1 }); g.shotClock = 240;
  const holder = g.onCourt(1)[0]; const exe = g.onCourt(0)[0];
  g.disruptiveAdmin(exe, holder, 1); assert.equal(g.pendingFoul.fouled, holder); assert.equal(g.pendingFoul.n, 2); assert.equal(g.pendingFoul.retain, true);
  const foul = g.events.find((e) => e.type === 'foul'); assert.equal(foul.effects.tirosLibres, 2); assert.match(foul.effects.reglamento, /37\.2.*38\.2.*17\.2\.7.*29\.2\.6/);
  g.poss.pendingFT = { team: 1, actor: holder, zone: 'three', kind: 'organized' }; const r = g.afterFreeThrows({ team: 1, actor: holder }); assert.deepEqual(r, { cont: 'inboundAfterFoul' });
  assert.deepEqual(g.events.filter((e) => e.type === 'free_throw').map((e) => e.participants.lanzador), [holder, holder], 'lanza el jugador que recibió la falta');
  assert.equal(g.shotClock, 140, 'catorce segundos exactos, no «al menos» catorce'); assert.equal(g.poss.pendingThrowIn.penalty, true); assert.match(g.poss.pendingThrowIn.origin, /enfrente de la mesa/);
  assert.equal(g.disqualifies(exe), false); g.disruptiveAdmin(exe, holder, 1); assert.equal(g.disqualifies(exe), false, 'dos disruptivas no descalifican automáticamente');
  // con 24 s y poco más de 14: el saque de penalización reduce a 14; con menos de 14 sube a 14 (no depende del reloj anterior)
  const h = scene({ seed: 34, team: 1 }); h.shotClock = 90; h.disruptiveAdmin(h.onCourt(0)[0], h.onCourt(1)[0], 1); h.poss.pendingFT = { team: 1 }; h.afterFreeThrows({ team: 1 }); assert.equal(h.shotClock, 140);
  // saque sin recepción garantizada: con las tres opciones negadas el envío forzado compite en categorías habituales (no una recepción inventada)
  const cats = new Set(); let recepciones = 0;
  for (let seed = 90; seed < 130; seed++) {
    const t = scene({ seed, team: 0, over: (i) => { i.teams[0].plan.throwInBook = [{ playId: 'SaqF03', priority: 3 }]; } }); t.poss.entry = 'inbound'; t.clockRunning = false;
    const q0 = t.qualityOf.bind(t); t.qualityOf = (ex, ...a) => (ex.throwOption !== undefined ? { cls: 'forced', K: profile.opportunity.qualityShotLogit.forced, z: 0 } : q0(ex, ...a));
    t.sampleDuration = (d, p) => (p.startsWith('saque:preparación') ? 8 : 3);
    t.throwInPhase(t.poss, { kind: 'endline', origin: 'prueba' }); const last = t.events.at(-1);
    cats.add(last.type === 'throw_in' ? 'recepción forzada' : last.intent?.categoria ?? last.type); if (last.type === 'throw_in') recepciones += 1;
  }
  assert.ok(cats.size >= 2 && recepciones < 40, `con todo negado no hay recepción garantizada (${[...cats].join(', ')}; ${recepciones}/40)`);
  assert.ok(cats.has('recepción forzada') || cats.has('turnover'), 'puede haber una recepción difícil de un jugador real o una pérdida: ambas existen');
});

// ------------------------------------------------------------------------------------------------ 11. cinco partidos completos de integración
function summary(res) {
  const c = res.diagnostics.coach; const mem = res.diagnostics.memory;
  return { score: res.score, status: res.status, errors: res.errors, parciales: res.periodScores.map((p) => p.points.join('-')).join(' | '), conteos: c.counts, memoria: mem.final.map((f) => f.entradas.map((e) => `${e.key}:${e.evidence}`)), exposiciones: mem.log.filter((x) => x.tipo === 'exposición').length, reconocimientos: mem.log.filter((x) => x.tipo === 'reconocimiento').length };
}
test('11. cinco partidos completos con invariantes: referencia, cauta/agresiva, energía baja, exposición repetida y revisión de finales (integración, no calibración)', () => {
  const out = {}; const inv = { detail: 'full', check: true };
  const policies = (i, a, b) => { i.teams[0].plan.coach.policy = a; i.teams[1].plan.coach.policy = b; return i; };
  // 1. referencia equilibrada/equilibrada con la semilla de referencia
  out.referencia = runMatch(inputFor(20261016), profile, inv);
  // 2. cauta contra agresiva con el mismo contexto de plantilla
  out.cautaAgresiva = runMatch(policies(inputFor(20261016), 'ENTREF01', 'ENTREF03'), profile, inv);
  // 3. energía inicial baja en los titulares de EQ01 y relevos de distinto valor
  out.energiaBaja = runMatch((() => { const i = inputFor(20261016); const st = new Set(Object.values(i.teams[0].plan.starters)); for (const p of i.teams[0].players) if (st.has(p.id)) p.state.energy = 38; return i; })(), profile, inv);
  // 4. exposición repetida a un recurso (bloqueo directo) con el libro reducido a una ficha: la memoria acumula y, si procede, responde
  out.memoria = runMatch((() => { const i = inputFor(20261017); for (const t of i.teams) { t.plan.playbook = [{ playId: 'POS01', priority: 1 }]; t.plan.styles.freedom = 1; } return i; })(), profile, inv);
  // 5. finales: partido con semillas reales; la revisión de cada contexto con un estado de prueba acotado está en la prueba 12
  out.finales = runMatch(inputFor(20261018), profile, inv);
  for (const [k, r] of Object.entries(out)) {
    assert.equal(r.status, 'finished', k); assert.deepEqual(r.errors, [], k);
    const s = summary(r); assert.ok(s.conteos.sustituciones.ejecutadas >= 1, `${k}: el entrenador rota`);
    assert.ok(r.diagnostics.coach.decisions.every((d) => ['propuesta', 'autorizada', 'pendiente', 'ejecutada', 'cancelada', 'rechazada'].includes(d.estado)), `${k}: estados de decisión válidos`);
    for (const d of r.diagnostics.coach.decisions) assert.ok(d.version.perfil && d.politica && d.regla !== undefined && d.frontera.paso >= 0, `${k}:${d.id}`);
    const jug = Object.values(r.box ?? {}).length; void jug;
  }
  assert.notDeepEqual(out.cautaAgresiva.diagnostics.coach.counts, out.referencia.diagnostics.coach.counts, 'otra política produce otras decisiones con el mismo contexto de plantilla');
  assert.ok(summary(out.memoria).exposiciones > 100 && out.memoria.diagnostics.memory.final.some((f) => f.entradas.some((e) => e.key === 'pnr|screener' || e.key === 'pnr|handler')), 'el bloqueo directo repetido queda en memoria');
  if (process.env.BEM_PRINT) for (const [k, r] of Object.entries(out)) console.log(k, JSON.stringify(summary(r)).slice(0, 900));
});

// ------------------------------------------------------------------------------------------------ 12. finales sobre el mismo motor (estados de prueba acotados y claramente marcados)
test('12. finales: cada contexto cambia prioridades con órdenes de plan reales y se restaura; la falta táctica exige posesión rival y contacto posible', () => {
  const mk = (period, clockSec, score, over = () => {}) => { const m = scene({ over }); m.period = period; m.clock = clockSec * 10; m.score = [...score]; m.poss.done = true; m.nextPoss = { team: 1, entry: 'inbound', shotClock: 240 }; return m; };
  const eg = (m, t = 0) => endgameState(m.coachView(t), cfg, cfg.policies[m.coachState[t].policy]).active;
  // necesidad urgente (pierde 14 con 250 s): más ritmo y riesgo, sin tocar probabilidades
  let m = mk(4, 250, [60, 74]); assert.deepEqual(eg(m), ['urgent']); m.coachFrontier('final'); let o = m.orders.find((x) => x.issuer === 'auto' && x.type === 'styles'); assert.equal(o.state, 'pendiente'); assert.deepEqual(o.content.styles, { organizedPace: 4, offensiveRisk: 4, elaboration: 2 });
  m.activatePlanOrders(m.period, { entry: true }); assert.equal(m.teams[0].plan.styles.organizedPace, 4);
  // termina el contexto: se restauran los estilos que cambió el entrenador
  m.score = [70, 74]; m.clock = 2400; m.coachFrontier('final'); m.activatePlanOrders(m.period, { entry: true }); assert.equal(m.teams[0].plan.styles.organizedPace, 3); assert.equal(m.teams[0].plan.styles.offensiveRisk, 3);
  // ataque rápido (pierde 5 con 80 s), tres (pierde 3 con 25 s) y proteger ventaja (gana 4 con 120 s)
  m = mk(4, 80, [70, 75]); assert.ok(eg(m).includes('fastAttack')); m.coachFrontier('final'); assert.equal(m.orders.find((x) => x.type === 'styles').content.styles.elaboration, 1);
  m = mk(4, 25, [70, 73]); assert.ok(eg(m).includes('seekThree')); m.coachFrontier('final'); assert.equal(m.orders.find((x) => x.type === 'styles').content.styles.finishPreference, 5);
  m = mk(4, 120, [74, 70]); assert.deepEqual(eg(m).sort(), ['closeContest', 'protectLead']); m.coachFrontier('final'); assert.deepEqual(m.orders.find((x) => x.type === 'styles').content.styles, { organizedPace: 2, offensiveRisk: 2 });
  assert.equal(m.orders.find((x) => x.type === 'defStyles' && x.team === 1), undefined, 'solo el equipo que gana protege la amenaza');
  // el equipo que gana por ≤3 con el cierre disputado protege la opción que cambia el objetivo (estilo defensivo, orden de plan)
  m = mk(4, 25, [73, 71]); m.nextPoss = { team: 1, entry: 'inbound', shotClock: 240 }; m.coachFrontier('final'); const dsty = m.orders.find((x) => x.team === 0 && x.type === 'defStyles'); assert.deepEqual(dsty.content.defStyles, { protection: 5 });
  // una orden manual sobre el ritmo se respeta aunque el contexto lo pida
  m = mk(4, 250, [60, 74]); m.submit({ team: 0, type: 'styles', styles: { organizedPace: 1 } }); m.activatePlanOrders(m.period, { entry: true }); m.coachFrontier('final');
  assert.ok(!m.orders.some((x) => x.issuer === 'auto' && x.type === 'styles' && 'organizedPace' in x.content.styles), 'prevalece la orden manual'); assert.deepEqual(m.orders.find((x) => x.issuer === 'auto' && x.type === 'styles').content.styles, { offensiveRisk: 4, elaboration: 2 }, 'solo se propone lo que no fija la orden manual');
  // falta táctica: pierde 4 con 20 s y la posesión siguiente es rival: orden puntual ESPD01 (no garantiza el contacto); con ventaja no se ordena
  m = mk(4, 20, [70, 74]); m.coachFrontier('final'); const tf = m.orders.find((x) => x.issuer === 'auto' && x.type === 'defSpecial'); assert.equal(tf.content.special, 'ESPD01'); assert.equal(tf.content.scope, 'next');
  const dtf = m.decisions.find((d) => d.propuesta?.tipo === 'falta táctica (ESPD01)'); assert.ok(dtf.observaciones.bonusRival); assert.equal(dtf.observaciones.segundos, 20);
  m = mk(4, 20, [74, 70]); m.coachFrontier('final'); assert.equal(m.orders.filter((x) => x.issuer === 'auto' && x.type === 'defSpecial').length, 0, 'no se ordena por defecto con ventaja');
  // sustitución situacional en la ventana: con ventaja y poco tiempo, mejor tiro libre y pase (mismo mecanismo, ventana reglamentaria)
  m = mk(4, 100, [74, 70], (i) => { const st = new Set(Object.values(i.teams[0].plan.starters)); for (const p of i.teams[0].players) if (!st.has(p.id) && p.id === 'EQ01-J12') p.abilities.TEC05 = 30; });
  const vv = m.coachView(0); const need = endgameState(vv, cfg, cfg.policies.ENTREF02).needs; assert.ok(need.includes('freeThrows') && need.includes('passing'));
  // el partido completo sigue siendo válido con todo lo anterior (invariantes por hecho)
  const full = runMatch((() => { const i = inputFor(20261019); return i; })(), profile, { detail: 'full', check: true }); assert.equal(full.status, 'finished'); assert.deepEqual(full.errors, []);
});
