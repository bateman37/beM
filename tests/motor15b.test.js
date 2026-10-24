// MOTOR-15B: cierre de MOTOR-15 y diagnóstico técnico de robos. Grupos de riesgo (no un test por fila).
//  B1 · RG-I03: interferencia defensiva en el último libre → punto + técnica de categoría 2 + un libre adicional, una sola reanudación, sin duplicados al guardar/continuar.
//  B2 · art. 45: las nueve operaciones enlazadas a 45.4.1–45.4.8 y 45.6 (procedencia de la numeración).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { data } from './helpers.js';
import { buildMatchInput, createMatch, buildResult, runMatch } from '../src/match/index.js';
import { resolveInterference } from '../src/match/incidents.js';
import { snapshotMatch, restoreMatch } from '../src/match/snapshot.js';
import { replayMatch } from '../src/match/replay.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';

const { profile, players } = data;
const clone = (o) => JSON.parse(JSON.stringify(o));
const withSeeds = (over) => { const p = clone(profile); for (const [path, v] of Object.entries(over)) { const k = path.split('.'); let o = p; for (const x of k.slice(0, -1)) o = o[x]; o[k.at(-1)] = v; } return p; };
// Copia SEM extrema de laboratorio (NO es una frecuencia de referencia): solo expone la oportunidad existente de RG-I03; el resto de la interferencia queda a cero.
const X = withSeeds({ 'interference.lastFreeThrow.defensiveP': 0.35, 'interference.lastFreeThrow.offensiveP': 0, 'interference.fieldGoal.defensiveP': 0, 'interference.fieldGoal.offensiveP': 0 });
const mk = (seed, p = X) => createMatch(buildMatchInput(p, players, { seed }), p, { detail: 'minimal', check: true });
const finish = (m) => { while (m.step()); return buildResult(m); };
const run = (seed, p = X) => runMatch(buildMatchInput(p, players, { seed }), p, { detail: 'minimal', check: true });

// Cadena observable de cada interferencia defensiva en el último libre: libre original → técnica → libre adicional → (ventanas) → reanudación.
function chains(res) {
  const out = [];
  res.events.forEach((e, i) => {
    const itf = e.effects?.interferencia; if (!(itf?.situacion === 'lastFreeThrow' && itf.lado === 'defensive')) return;
    const foul = res.events.slice(i + 1).find((x) => x.type === 'foul');
    const tech = res.events.slice(i + 1).find((x) => x.type === 'free_throw');
    const resume = res.events.slice(i + 1).find((x) => ['throw_in', 'rebound'].includes(x.type));
    const periodEnd = res.events.slice(i + 1, res.events.indexOf(resume)).some((x) => x.type === 'period_end'); // 04E: si el periodo acaba tras la sanción, la reanudación la fija la flecha de posesión alterna, no la sanción
    out.push({ i, orig: e, foul, tech, resume, periodEnd });
  });
  return out;
}

test('B1 RG-I03: punto concedido una sola vez, técnica de categoría 2 al defensor real, un libre adicional real y una única reanudación del rival', () => {
  const r = resolveInterference(profile, 'lastFreeThrow', 'defensive');
  assert.equal(r.ok, true); assert.equal(r.contrast, 'contrastada'); assert.equal(r.additionalSanction.status, 'administrada'); assert.equal(r.additionalSanction.category, 'tecnica2'); assert.equal(r.additionalSanction.extraFreeThrows, 1);
  let seen = 0; let missed = 0; let made = 0; let excluded = 0;
  for (const seed of [1, 3, 7]) {
    const res = run(seed); assert.equal(res.status, 'finished', res.errors.map((e) => e.message).join(';')); assert.equal(res.reconciliation.valid, 'válida', res.reconciliation.failed.join(','));
    const cs = chains(res);
    for (const c of cs) {
      seen += 1; const orig = c.orig; const itf = orig.effects.interferencia; const origFt = orig.stats.find((s) => s.k === 'ft');
      // punto original: un único libre acreditado (válido) y vínculo con la serie original
      assert.equal(origFt.made, true); assert.equal(origFt.conceded, 'interferencia defensiva'); assert.equal(orig.stats.filter((s) => s.k === 'ft').length, 1);
      const prev = res.events[orig.seq - 2].score; assert.equal(orig.score[orig.team] - prev[orig.team], 1, 'el punto concedido se acredita una sola vez (también cuando el libre ya entraba)');
      // técnica: categoría 2, mismo infractor real, contadores comunes y vínculo con el libre original
      const f = c.foul; assert.equal(f.effects.categoria, 'tecnica2'); assert.equal(f.effects.regla, 'RG-F07'); assert.equal(f.participants.infractor, itf.infractor);
      assert.equal(f.effects.origenInterferencia.libreOriginal, orig.id); assert.equal(f.effects.origenInterferencia.serie, origFt.series);
      assert.equal(f.effects.contadores.technicalCat2 >= 1, true); assert.equal(f.effects.contadores.technicalCat1 ?? 0, 0, 'no suma para la descalificación por técnicas de categoría 1');
      assert.equal(f.effects.descalificado, false); assert.ok(f.effects.faltasColectivasPeriodo >= 1, 'cuenta como falta colectiva');
      assert.equal(f.stats[0].kind, 'tecnica2'); assert.equal(f.stats[0].teamFoul, true);
      if (f.effects.excluido) excluded += 1;
      // libre adicional: un intento real del equipo beneficiado, crédito real y sin interferencia propia
      const t = c.tech; assert.equal(t.stats[0].cause, 'sanción tecnica2'); assert.equal(t.team, orig.team); assert.equal(t.stats.length, 1); assert.equal(t.effects.ultimo, true); assert.equal(t.effects.interferencia, undefined);
      assert.notEqual(t.stats[0].series, origFt.series, 'serie propia');
      const pts = t.score[orig.team] - (res.events[t.seq - 2].score[orig.team]); assert.equal(pts, t.stats[0].made ? 1 : 0);
      if (t.stats[0].made) made += 1; else missed += 1;
      // una única reanudación: saque del rival, nunca rebote ni nueva posesión para el beneficiado por la técnica
      assert.equal(c.resume.type, 'throw_in'); if (!c.periodEnd) assert.equal(c.resume.team, 1 - orig.team);
      assert.equal(res.events.slice(c.i + 1, res.events.indexOf(c.resume)).filter((x) => ['rebound', 'throw_in'].includes(x.type)).length, 0);
    }
    // sin duplicados: cada interferencia defensiva en el último libre produce exactamente una técnica y un libre adicional
    assert.equal(res.events.filter((e) => e.type === 'foul' && e.effects?.origenInterferencia).length, cs.length);
    assert.equal(res.events.filter((e) => e.type === 'free_throw' && e.stats[0].cause === 'sanción tecnica2').length, cs.length);
    // el acta cuenta la técnica como falta individual propia y los puntos del marcador
    const tecnicas = res.events.filter((e) => e.type === 'foul' && e.stats.some((s) => s.kind === 'tecnica2')).length;
    const actaTec = Object.values(res.acta.players).reduce((s, p) => s + (p.fouls?.tecnica2 ?? 0), 0); assert.equal(actaTec, tecnicas);
  }
  assert.ok(seen >= 8, `la oportunidad se expuso con la copia extrema (${seen})`); assert.ok(made >= 1 && missed >= 1, 'el libre adicional puede fallar y entrar'); assert.ok(excluded >= 1, 'caso de retirada obligatoria por faltas cubierto');
});

test('B1 RG-I03: guardado entre consecuencias sin repetir punto, sanción ni intento; reproducción del mismo encuentro', () => {
  const a = mk(1); let guard = 0;
  while (a.step() && guard++ < 400) { const e = a.events.at(-1); if (e.type === 'foul' && e.effects?.origenInterferencia) break; }
  assert.ok(a.adminPlan && a.adminPlan.origin?.kind === 'interferencia' && a.adminPlan.index === 0, 'frontera guardada: técnica administrada, libre adicional pendiente');
  const ftBefore = a.events.filter((e) => e.type === 'free_throw').length; const score = [...a.score];
  const snap = clone(snapshotMatch(a)); const b = restoreMatch(snap);
  assert.deepEqual(b.score, score); assert.equal(b.events.filter((e) => e.type === 'free_throw').length, ftBefore, 'el guardado no repite el punto ni el libre original');
  const ra = finish(a); const rb = finish(b);
  assert.equal(trajectoryFingerprint(rb), trajectoryFingerprint(ra)); assert.deepEqual(rb.score, ra.score); assert.equal(rb.diagnostics.sportingDraws, ra.diagnostics.sportingDraws);
  assert.equal(rb.events.filter((e) => e.type === 'free_throw').length, ra.events.filter((e) => e.type === 'free_throw').length);
  assert.deepEqual(rb.acta, ra.acta, 'acta y créditos idénticos tras continuar (punto y técnica una sola vez)'); assert.deepEqual(rb.orders, ra.orders);
  assert.equal(chains(rb).length, chains(ra).length); assert.equal(rb.events.filter((e) => e.type === 'free_throw' && e.stats[0].cause === 'sanción tecnica2').length, chains(rb).length);
  const rep = replayMatch(clone(ra)); assert.equal(rep.comparison.identical, true, JSON.stringify(rep.comparison.differences?.slice?.(0, 2)));
});

test('B1 RG-I03: con la masa de la oportunidad a cero no hay técnica ni sorteo adicional (la consecuencia no es una probabilidad)', () => {
  const Z = withSeeds({ 'interference.lastFreeThrow.defensiveP': 0, 'interference.lastFreeThrow.offensiveP': 0, 'interference.fieldGoal.defensiveP': 0, 'interference.fieldGoal.offensiveP': 0 });
  const res = run(1, Z); assert.equal(chains(res).length, 0); assert.equal(res.events.filter((e) => e.stats.some((s) => s.cause === 'sanción tecnica2')).length, 0);
});

test('B2 art. 45: las nueve operaciones enlazan 45.4.1–45.4.8 y 45.6 con la procedencia correcta', () => {
  const want = { 'C1-FT-IMPROPER': ['45.4.1', 'freeThrowsAwardedImproperly'], 'C1-FT-OMITTED': ['45.4.2', 'freeThrowsOmitted'], 'C1-SHOOTER-PERMITTED': ['45.4.3', 'shooterPermittedWrongly'], 'C1-SHOOTER-DIRECTED': ['45.4.4', 'shooterDirectedWrongly'], 'C1-POINTS': ['45.4.5', 'pointsWrong'], 'C1-SUBJECT': ['45.4.6', 'offenderWrong'], 'C1-TABLE': ['45.4.7', 'tableResourcesWrong'], 'C1-CLOCK': ['45.4.8', 'gameClockWrong'], 'C2-SHOTCLOCK': ['45.6', 'shotClockWrong'] };
  const cl = profile.regulation.corrections; assert.equal(cl.version, 'COR-MOTOR15B-R1'); assert.equal(cl.classes.length, 9);
  for (const c of cl.classes) { assert.equal(c.article, want[c.id][0]); assert.equal(c.error, want[c.id][1], 'la clase conserva su error y su operación'); assert.ok(c.articleClass); }
  assert.match(cl.reading, /síntesis selectiva de ChatGPT; no lectura directa/);
  const r01 = profile.regulation.matrix.find((r) => r.id === 'RG-R01'); assert.doesNotMatch(r01.source.note, /no se leyó directamente/); assert.match(r01.source.article, /45\.4\.1–45\.4\.8 y 45\.6/);
});

// ---------------------------------------------------------------------------------------------------------------- B3 · auditorías: lector de AUD17 y AUD26 (sin simular)
import { EVALUATORS } from '../src/audit/evaluators.js';
import { classifyChains } from '../src/audit/project.js';
import { energyByTask } from '../src/audit/analysis.js';

const chain = (id, over) => ({ id, possession: `P${id}`, period: 1, kind: 'band', origen: 'x', status: 'cerrada', cierre: null, receptor: null, opcionUsada: null, negadas: 0, intentos: 1, ...over });
const audCtx = (projs, extra = {}) => ({ id: 'X', projs, params: profile.audit, energy: [], energyTask: [], ...extra });
const projWith = (cadenas, lastOf) => { const P = { match_id: 'M1', attempt_id: 'M1-A1', case_id: 'C1', source_id: 'LOT-X', level: 'diagnostic', saques: { n: cadenas.length, cadenas } }; classifyChains(P, lastOf); return P; };

test('B3 AUD26: cada cadena se clasifica con la última transición de su posesión (sin inventar receptor ni pérdida) y las interrumpidas salen de las tasas', () => {
  const cad = [
    chain('S1', { receptor: 'EQ01-J03', opcionUsada: 'primera' }),                                    // ejecutada
    chain('S2', { cierre: 'resultado: falta en el saque', negadas: 3, intentos: 3 }),                // sin receptor, causa legible: válido
    chain('S3', { cierre: null }),                                                                   // sin receptor y sin causa: señal
    chain('S4', { status: 'abierta', receptor: 'EQ01-J05' }),                                        // abierta + final de periodo en evidencia anterior: interrumpida (derivada por el lector)
    chain('S5', { status: 'abierta', receptor: 'EQ01-J05' }),                                        // abierta + pérdida: defecto de registro del productor
    chain('S6', { status: 'interrumpida', cierre: 'interrumpida: final de periodo', receptor: 'EQ01-J05' }),
  ];
  const P = projWith(cad, { PS4: { id: 'E9', type: 'period_end' }, PS5: { id: 'E8', type: 'advance', perdida: true } });
  assert.deepEqual(P.saques.clases, { ejecutada: 1, sin_entrega_valida: 1, cerrada_sin_receptor_sin_causa: 1, interrumpida_fin_periodo: 2, sin_cierre_tras_desenlace: 1 });
  assert.equal(P.saques.casos.find((x) => x.chain === 'S4').evidenciaDe.startsWith('lector'), true); assert.equal(P.saques.casos.find((x) => x.chain === 'S6').evidenciaDe, 'productor');
  const r = EVALUATORS.AUD26(audCtx([P])); const m = r.metrics;
  assert.equal(m.universoDeTasas, 4, 'ejecutada + sin entrega válida + sin causa + sin cierre; las interrumpidas no cuentan como ejecución terminada'); assert.equal(m.interrumpidasFinDePeriodo, 2);
  assert.equal(r.resultado, 'señal'); assert.deepEqual(r.findings.map((f) => f.rule).sort(), ['SAQUE-INTERRUMPIDO-FIN-PERIODO', 'SAQUE-SIN-CIERRE-TRAS-DESENLACE', 'SAQUE-SIN-ENTREGA-VALIDA', 'SAQUE-SIN-RECEPTOR-SIN-CAUSA']);
  for (const f of r.findings) { assert.ok(f.evidence.every((e) => e.match_id && e.attempt_id && e.chain && e.source === 'LOT-X' && 'ultimaTransicion' in e), 'caso, intento, cadena y última transición'); }
  assert.equal(r.findings.find((f) => f.rule === 'SAQUE-SIN-ENTREGA-VALIDA').state, 'clasificado'); assert.equal(r.findings.find((f) => f.rule === 'SAQUE-SIN-RECEPTOR-SIN-CAUSA').state, 'abierto');
  assert.equal(EVALUATORS.AUD26(audCtx([projWith(cad.slice(0, 2).concat(cad.slice(5)), {})])).resultado, 'conforme', 'sin cadenas sin causa ni sin cierre: conforme');
});

test('B3 AUD17: la curva se lee por ámbito y tarea con la energía registrada; con términos < 10 no se concluye «sin exposición»; exposición suficiente no obliga a «conforme»', () => {
  const cell = (ambito, tarea, banda, n, brechaMedia, over = {}) => ({ ambito, tarea, banda, n, brecha: n * brechaMedia, brechaMedia, relativa: null, minEnergia: banda === '<10' ? 0 : 50, ejemplos: [], ...over });
  const diagP = [{ level: 'diagnostic', recipes: { energyByTask: {} } }];
  const cur = [{ tipo: 'TEC/MEN', banda: '70–100', n: 900, brechaMedia: 0.02 }];
  const good = [cell('TEC/MEN', 'TAR06.attack', '70–100', 500, 0.02), cell('TEC/MEN', 'TAR06.attack', '40–70', 300, 0.2), cell('TEC/MEN', 'TAR06.attack', '<10', 120, 1.5), cell('FIS', 'TAR03.attack', '70–100', 300, 0.01), cell('FIS', 'TAR03.attack', '40–70', 200, 0.3)];
  let r = EVALUATORS.AUD17(audCtx(diagP, { energy: cur, energyTask: good }));
  assert.equal(r.resultado, 'conforme'); assert.equal(r.exposicion, 'observada'); assert.equal(r.metrics.terminosBajoEnergia10, 120); assert.equal(r.metrics.energiaMinimaObservada, 0);
  // sin términos < 10: inconcluso e insuficiente (no «conforme»)
  r = EVALUATORS.AUD17(audCtx(diagP, { energy: cur, energyTask: good.filter((x) => x.banda !== '<10') })); assert.equal(r.resultado, 'inconcluso'); assert.equal(r.exposicion, 'insuficiente'); assert.ok(r.missing.some((m) => /< 10 no expuesta/.test(m)));
  // términos < 10 pero celdas pequeñas: expuesta, no concluyente
  r = EVALUATORS.AUD17(audCtx(diagP, { energy: cur, energyTask: good.map((x) => (x.banda === '<10' ? { ...x, n: 12 } : x)) })); assert.equal(r.resultado, 'inconcluso'); assert.equal(r.exposicion, 'parcial'); assert.ok(r.missing.some((m) => /ninguna tarea reúne celdas/.test(m)));
  // una tarea cuyo deterioro NO crece al bajar la energía es señal aunque OTRA tarea sea monótona (no se suman tareas con distinto deterioro)
  r = EVALUATORS.AUD17(audCtx(diagP, { energy: cur, energyTask: [...good, cell('TEC/MEN', 'TAR07.attack', '70–100', 400, 0.3), cell('TEC/MEN', 'TAR07.attack', '40–70', 400, 0.1)] })); assert.equal(r.resultado, 'señal'); assert.ok(r.findings.some((f) => f.rule === 'ENERGIA-NO-CRECIENTE'));
  // la agregación conserva numerador, denominador, mínimo y ejemplos por celda
  const ag = energyByTask([{ match_id: 'M1', attempt_id: 'M1-A1', recipes: { energyByTask: { 'FIS|TAR03.attack|<10': { n: 2, gap: 3, baseSum: 20, minEnergy: 4, examples: [{ decision_id: 'd1' }, { decision_id: 'd2' }] } } } }, { match_id: 'M2', attempt_id: 'M2-A1', recipes: { energyByTask: { 'FIS|TAR03.attack|<10': { n: 1, gap: 1, baseSum: 9, minEnergy: 0, examples: [{ decision_id: 'd3' }] } } } }]);
  assert.deepEqual(ag.map(({ ejemplos, ...x }) => x), [{ ambito: 'FIS', tarea: 'TAR03.attack', banda: '<10', n: 3, brecha: 4, brechaMedia: 1.3333, relativa: 0.1379, minEnergia: 0 }]); assert.equal(ag[0].ejemplos.length, 2);
});

// ---------------------------------------------------------------------------------------------------------------- B4 · equivalencia completo / reducido / esencial: lo que M15C·1 no comparaba
// M15C·1 compara trayectoria (TRAY-MOTOR12 e incremental TRAYINC-MOTOR15-R1: hechos con todos sus campos y sorteos + estado final), sorteos y marcador del acta. Aquí se añade lo que sustenta la neutralidad
// y no estaba comparado directamente: acta completa (créditos, series, finales, posesiones, partición y políticas), estados y energía, planes/órdenes efectivos y contadores de incidencias, entre
// detalle completo, mínimo y el registro esencial real. Dos entradas representativas (la referencia y el caso RG-I03) reutilizadas para todos los ejes.
import { TrajectoryObserver } from '../src/batch/observer.js';
import { createEncounter } from '../src/engine/index.js';

test('B4 completo = reducido = esencial en acta y créditos, estados, órdenes efectivas e incidencias (observador común TRAYINC; las huellas de contratos distintos no se comparan entre sí)', () => {
  const cases = [{ id: 'ref', p: profile, seed: 20261016 }, { id: 'rg-i03', p: X, seed: 1 }];
  for (const c of cases) {
    const input = buildMatchInput(c.p, players, { seed: c.seed });
    const run = (detail) => { const obs = new TrajectoryObserver(); const m = createMatch(input, c.p, { detail }); while (m.step()) obs.consume(m.events); return { res: buildResult(m), obs: obs.finish(m) }; };
    const full = run('full'); const min = run('minimal'); const A = full.res; const B = min.res;
    assert.equal(full.obs.sha256, min.obs.sha256, `${c.id}: huella incremental igual (mismo contrato TRAYINC en ambos lados)`); assert.equal(trajectoryFingerprint(A), trajectoryFingerprint(B), `${c.id}: TRAY-MOTOR12 igual`);
    for (const [name, pick] of [['acta completa', (r) => r.acta], ['alineaciones', (r) => r.lineups], ['órdenes efectivas', (r) => r.orders], ['comandos', (r) => r.commands], ['muestras de estado por tramo', (r) => r.diagnostics.stateSamples], ['energía final', (r) => r.diagnostics.finalEnergy], ['faltas finales', (r) => r.diagnostics.finalFouls], ['incidencias', (r) => r.diagnostics.incidents], ['correcciones', (r) => r.diagnostics.corrections], ['contadores del entrenador', (r) => r.diagnostics.coachCounters], ['libro de interferencia', (r) => r.diagnostics.interference]]) {
      assert.deepEqual(pick(B), pick(A), `${c.id}: ${name} idénticas entre detalle completo y mínimo`);
    }
    // registro esencial real (mismo resolutor): su acta, estados, órdenes e incidencias son las de la ejecución completa
    const enc = createEncounter({ input, profile: c.p, level: 'world-essential', observeTrajectory: true }); enc.advance({ until: 'end' }); const rec = enc.essential();
    assert.equal(rec.integrity.trajectory_fp, full.obs.sha256); assert.equal(rec.integrity.trajectory_fp_version, 'TRAYINC-MOTOR15-R1');
    for (const k of ['policy', 'status', 'periods', 'series', 'finals', 'possessions', 'partition', 'credits']) assert.deepEqual(rec.acta[k], A.acta[k], `${c.id}: acta.${k} del registro esencial`);
    assert.deepEqual(rec.acta.teams.map((t) => [t.id, t.points, t.totals, t.collective, t.fouls, t.timeouts]), A.acta.teams.map((t) => [t.id, t.points, t.totals, t.collective, t.fouls, t.timeouts]));
    assert.deepEqual(rec.states.samples, A.diagnostics.stateSamples); assert.deepEqual(rec.states.final_energy, A.diagnostics.finalEnergy); assert.deepEqual(rec.direction.orders, A.orders); assert.deepEqual(rec.direction.commands, A.commands);
    assert.deepEqual(rec.regulation.incidents, A.diagnostics.incidents); assert.deepEqual(rec.regulation.interference, A.diagnostics.interference); assert.deepEqual(rec.presence.lineups, A.lineups);
    if (c.id === 'rg-i03') assert.ok(A.events.some((e) => e.type === 'foul' && e.effects?.origenInterferencia), 'el caso incluye la consecuencia de RG-I03 en los tres niveles');
  }
});

// ---------------------------------------------------------------------------------------------------------------- B5 · retirada obligatoria antes de un tiempo muerto (defecto latente de MOTOR-15)
test('B5 un jugador excluido por faltas sale antes del tiempo muerto concedido en la misma ventana (con `check`, estas semillas de MOTOR-15 fallaban el invariante «en pista no disponible»)', () => {
  for (const seed of [10, 22, 44, 45]) { // 04E: semillas con una exclusión y un tiempo muerto en la misma ventana (la trayectoria corregida cambió las anteriores)
    const res = run(seed, profile); assert.equal(res.status, 'finished', `${seed}: ${res.errors.map((e) => e.message).join(';')}`); assert.equal(res.reconciliation.valid, 'válida', res.reconciliation.failed.join(','));
    assert.ok(res.events.some((e) => e.effects?.excluido) && res.events.some((e) => e.type === 'timeout'), 'el encuentro contiene una exclusión y tiempos muertos');
  }
});

// ---------------------------------------------------------------------------------------------------------------- B6 · robos: crédito único, exclusiones y no duplicación (criterio de B15-N2, cap. 7)
// Reutiliza las mismas ejecuciones para todos los ejes. Los hechos son naturales de la muestra (sin elevar ninguna tasa): si una muestra pequeña no mostrase un supuesto, no se fuerza.
import { buildActa } from '../src/match/acta.js';

test('B6 robo: un único crédito por hecho con pérdida individual rival; balón suelto ganado en disputa real acredita al recuperador sin intento previo; sin robo con balón muerto, infracción o falta', () => {
  const seen = { loose: 0, turnoverSteal: 0, pressed: 0, dead: 0, looseKept: 0 };
  for (const seed of [1, 2, 3, 4]) {
    const res = run(seed, profile); assert.equal(res.status, 'finished'); assert.equal(res.reconciliation.valid, 'válida', res.reconciliation.failed.join(','));
    let nStl = 0;
    for (const e of res.events) {
      const stl = e.stats.filter((s) => s.k === 'stl'); const tov = e.stats.filter((s) => s.k === 'tov'); nStl += stl.length;
      if (stl.length) {
        assert.equal(stl.length, 1, `${e.id}: un solo crédito por hecho`); assert.ok(tov.some((t) => t.team !== stl[0].team && t.p), `${e.id}: toda pérdida con robo lleva su pérdida individual rival en el mismo hecho`);
        assert.notEqual(e.effects?.fuera, true, 'balón muerto: sin robo'); assert.ok(!e.effects?.infraccion && !e.effects?.faltaOfensiva && !e.effects?.faltaDefensiva, 'infracción o falta: sin robo');
        assert.ok(e.effects?.robo === stl[0].p, 'el crédito coincide con el recuperador del hecho');
      }
      if (e.type === 'loose_ball') {
        const [actor, opposer] = e.participants.disputa; const lost = tov.find((t) => t.cause === 'balón suelto perdido');
        if (e.effects.control === 'defensa') {
          seen.loose += 1; assert.ok(lost && lost.p === actor); assert.equal(stl.length, 1, 'el defensor que gana la disputa real recupera con balón vivo: robo, sin intento previo'); assert.equal(stl[0].p, opposer); assert.equal(stl[0].p, e.effects.recupera); assert.equal(stl[0].team, 1 - lost.team); assert.equal(stl[0].fuente, 'balón suelto ganado en disputa');
          assert.equal(e.effects.cadenaRobo, undefined, 'no hay cadena de decisión previa y no se exige');
        } else { seen.looseKept += 1; assert.equal(stl.length, 0, 'el ataque conserva el balón suelto: sin pérdida ni robo'); }
      }
      if (e.effects?.fuera || e.effects?.infraccion || e.effects?.faltaOfensiva || e.type === 'expiry') { seen.dead += 1; assert.equal(stl.length, 0, `${e.id}: balón muerto, infracción o falta sin robo inventado`); }
      if (stl.length && e.type === 'advance') seen.pressed += 1; if (stl.length && e.type === 'attempt') seen.turnoverSteal += 1;
    }
    // no duplicación al exportar, reanudar o reconstruir el acta: el acta reconstruida desde los hechos y el acta conservada coinciden; el crédito del acta es el de los hechos
    const rebuilt = buildActa({ events: res.events, lineups: res.lineups, input: res.input, possessions: res.possessions, status: res.status }, profile.statsPolicy);
    assert.deepEqual(rebuilt.credits.filter((c) => c.k === 'stl'), res.acta.credits.filter((c) => c.k === 'stl')); assert.equal(res.acta.credits.filter((c) => c.k === 'stl').length, nStl);
    assert.equal(Object.values(res.acta.players).reduce((s, p) => s + p.stl, 0), nStl);
  }
  assert.ok(seen.loose >= 1 && seen.dead >= 1, `la muestra expone el balón suelto ganado y las exclusiones: ${JSON.stringify(seen)}`);
  // reanudar: guardar a mitad y continuar da los mismos créditos (el guardado no repite ni pierde un robo)
  const a = mk(2, profile); for (let i = 0; i < 200 && a.step(); i++);
  const snap = clone(snapshotMatch(a)); const ra = finish(a); const rb = finish(restoreMatch(snap));
  assert.deepEqual(rb.acta.credits.filter((c) => c.k === 'stl'), ra.acta.credits.filter((c) => c.k === 'stl'));
  assert.equal(replayMatch(clone(ra)).comparison.identical, true, 'reproducir el encuentro rehace los mismos créditos');
});

test('B6 robo: el crédito de balón suelto es solo estadístico: el deporte de la referencia (marcador, parciales, sorteos) es el de MOTOR-15 y la política de acta lleva su propia versión', () => {
  const m15 = JSON.parse(readFileSync(new URL('./fixtures/baseline-sim04e.json', import.meta.url), 'utf8'))['20261016']; // 04E: referencia nueva (reloj/rebote/control corregidos)
  assert.equal(profile.statsPolicy.id, 'EST-MOTOR17B-R1'); // MOTOR-17B completa el criterio de MOTOR-17 (las anteriores pasan a históricas)
  const res = run(20261016, profile); assert.equal(res.acta.policy, 'ACTA-SIM04E-R1');
  assert.deepEqual([res.score, res.periodScores.map((p) => p.points), res.diagnostics.sportingDraws], [m15.score, m15.periodScores, m15.draws], 'la referencia vigente (04E): el crédito de balón suelto no cambia el deporte');
  assert.ok(res.events.some((e) => e.type === 'loose_ball' && e.stats.some((s) => s.k === 'stl')), 'la referencia contiene al menos un robo por balón suelto ganado');
});
