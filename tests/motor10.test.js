// MOTOR-10: análisis, estadísticas y resumen. Diez grupos pequeños, cada uno protege un error real de datos o de significado (universos mezclados, ceros engañosos,
// créditos duplicados, fuga de información oculta, lectores con efectos). Se usan flujos de hechos preparados mínimos y UN partido completo de referencia; no hay barridos de partidos
// ni snapshots de frases (se comprueban datos y significado, no puntuación literal).
import test from 'node:test';
import assert from 'node:assert/strict';
import { runMatch, createMatch, buildResult, deepCopy } from '../src/match/index.js';
import { syntheticMatch } from '../src/match/cases.js';
import { applyRevisions } from '../src/match/revisions.js';
import { sportsProjection } from '../src/match/replay.js';
import { buildActa } from '../src/match/acta.js';
import { analyze, CATALOG, ANALYSIS_VERSION } from '../src/analysis/index.js';
import { reconcileAnalysis } from '../src/analysis/reconcile.js';
import { ratio, pooled, eFG, TS, pace, rating, astPerTov, diffRate } from '../src/analysis/formulas.js';
import { inAdjustedFinal } from '../src/analysis/evolution.js';
import { unitStatus } from '../src/analysis/presence.js';
import { assistState } from '../src/analysis/shooting.js';
import { analysisParams, DEFAULT_ANALYSIS } from '../src/analysis/params.js';
import { data, inputFor, stepUntil } from './helpers.js';

const profile = data.profile;
let ref = null; const reference = () => (ref ??= runMatch(inputFor(20261016), profile, { detail: 'full' }));
// flujo preparado: cada elemento `it` = { type, period, team, possession, dur, stats, participants, intent, effects, endKind }
const mk = (script, extra = {}) => ({ ...syntheticMatch(profile, inputFor(1), script), orders: [], ...extra });
const shot = (p, team, zone, points, made, extra = {}) => ({ k: 'shot', p, team, zone, points, made, fromFoul: false, feed: null, ...extra });
const ftS = (p, team, i, n, made, series, extra = {}) => ({ k: 'ft', p, team, made, series, i, n, cause: 'falta en acto de tiro', shooting: true, shotEvent: null, shotMade: false, feed: null, ...extra });
const att = (possession, team, stats, o = {}) => ({ type: 'attempt', possession, team, period: o.period ?? 1, dur: o.dur ?? 100, stats, intent: o.intent ?? {}, participants: o.participants ?? {}, effects: o.effects ?? {}, endKind: o.endKind });
const pub = (res, team = 0) => analyze(res, { audience: 'public', team });

test('1. fórmulas y unidades: eFG ≠ TS, DRtg con ataques rivales, ritmo con prórroga, denominador cero y agregación ponderada', () => {
  // eFG puede superar el 100 % y no es TS; ninguna razón sin denominador produce 0, ∞ ni NaN
  assert.equal(eFG({ fgm: 1, fg3m: 1, fga: 1 }).value, 150);
  assert.notEqual(eFG({ fgm: 4, fg3m: 2, fga: 8 }).value, TS({ pts: 11, fga: 8, fta: 2 }).value);
  assert.equal(TS({ pts: 22, fga: 10, fta: 0 }).value, 110);
  for (const r of [ratio(0, 0), eFG({ fgm: 0, fg3m: 0, fga: 0 }), astPerTov(5, 0), rating(10, 0), pace(40, 0, 0, 0)]) { assert.equal(r.value, null); assert.ok(r.reason, 'el motivo se muestra'); }
  // agregación: suma de numeradores/suma de denominadores (no promedio de porcentajes con distinto número de intentos)
  assert.equal(pooled([{ num: 1, den: 2 }, { num: 1, den: 10 }]).value, 2 / 12);
  assert.notEqual(pooled([{ num: 1, den: 2 }, { num: 1, den: 10 }]).value, (1 / 2 + 1 / 10) / 2);
  // ritmo: las prórrogas entran en D (45 min disputados), las pausas no
  assert.equal(pace(40, 70, 70, 45).value, (40 * 70) / 45);
  // ORtg/DRtg con los ataques de CADA equipo: universo propio frente a universo rival
  const res = mk([att('P001', 0, [shot('EQ01-J03', 0, 'rim', 2, true)], { endKind: 'madeFG' }), att('P002', 1, [shot('EQ02-J04', 1, 'three', 3, true)], { endKind: 'madeFG' }), att('P003', 1, [shot('EQ02-J04', 1, 'three', 3, true)], { endKind: 'madeFG' })]);
  const R = pub(res).ratings();
  assert.equal(R[0].ortg.value, 200); assert.equal(R[0].drtg.value, 300); assert.equal(R[1].ortg.value, 300); assert.equal(R[1].drtg.value, 200); // DRtg de A = puntos de B / ataques de B
  // diferencia con/sin sin exposición completa en una mitad: no hay diferencia finita (no un 0 engañoso)
  assert.equal(diffRate(ratio(5, 2), ratio(0, 0)).value, null);
  // catálogo: cada indicador declara definición, unidad, universo, fuente y cobertura; no se rellenan ceros no registrados
  assert.equal(new Set(CATALOG.map((c) => c.id)).size, CATALOG.length);
  for (const c of CATALOG) for (const k of ['label', 'group', 'nature', 'unit', 'source', 'universe', 'calc', 'coverage']) assert.ok(c[k] !== undefined && c[k] !== null, `${c.id}.${k}`);
  const a = pub(res); assert.equal(a.indicator(0, 'MATES').value, null); assert.match(a.indicator(0, 'MATES').reason, /no registrado/); assert.equal(a.indicator(0, 'HIST_PCTL').coverage, 'dependiente de datos');
  // un filtro de tiros no habilita un indicador de partido completo (PPP/F): se explica la incompatibilidad
  const f = a.indicator(0, 'ORTG', { zone: 'three' }); assert.equal(f.incompatible, true); assert.equal(f.value, null); assert.match(f.reason, /partido completo/);
  // política de análisis: sin tabla en el perfil se identifica «por defecto del código»; con tabla, su versión
  assert.match(analysisParams({ ...res, profile: { ...res.profile, analysis: undefined } }).policy, /por defecto/); assert.equal(analysisParams(reference()).policy, ANALYSIS_VERSION);
});

test('2. posesión, F y administrativos: dos F en una posesión, adicional frente a bonus y particiones sin duplicidad', () => {
  const res = mk([
    att('P001', 0, [shot('EQ01-J03', 0, 'rim', 2, false)]),
    { type: 'rebound', possession: 'P001', team: 0, dur: 10, stats: [{ k: 'reb', p: 'EQ01-J10', team: 0, off: true, of: 'E0001' }] },
    att('P001', 0, [shot('EQ01-J03', 0, 'rim', 2, true)], { endKind: 'madeFG' }),
    att('P002', 0, [shot('EQ01-J06', 0, 'midrange', 2, true, { fromFoul: true })]),
    { type: 'free_throw', possession: 'P002', team: 0, dur: 0, endKind: 'ftMade', stats: [ftS('EQ01-J06', 0, 1, 1, true, 'S001', { shotEvent: 'E0004', shotMade: true })] },
    { type: 'free_throw', possession: 'P003', team: 0, dur: 0, stats: [ftS('EQ01-J08', 0, 1, 2, true, 'S002', { cause: 'bonus', shooting: false })] },
    { type: 'free_throw', possession: 'P003', team: 0, dur: 0, endKind: 'ftMade', stats: [ftS('EQ01-J08', 0, 2, 2, true, 'S002', { cause: 'bonus', shooting: false })] },
    { type: 'administrative', possession: null, team: 1, dur: 0, stats: [{ k: 'adminPts', team: 1, points: 2, cause: 'prueba' }] },
  ]);
  const acta = pub(res).ix.acta;
  assert.equal(acta.possessions.filter((p) => p.team === 0 && p.id === 'P001').length, 1);
  assert.equal(acta.finals.filter((f) => f.possession === 'P001').length, 2, 'una posesión con dos finalizaciones F');
  const F3 = acta.finals.find((f) => f.possession === 'P002'); assert.equal(F3.points, 3, 'canasta de dos + un adicional ligado = una F de 3 puntos');
  const P = pub(res).production();
  assert.deepEqual(P[0].partitionOrigin, { f: 5, sanction: 2, administrative: 0, total: 7 }, 'el bonus es sanción, no F');
  assert.deepEqual(P[1].partitionOrigin, { f: 0, sanction: 0, administrative: 2, total: 2 }, 'un punto administrativo no entra en F');
  assert.equal(P[0].partitionKind.total, P[0].partitionOrigin.total); // dos particiones del mismo total
  assert.equal(pub(res).indicator(0, 'PTS_F').value, 5 / 3, 'puntos por F: solo F cerradas ligadas');
  // los administrativos sin vínculo quedan fuera de cualquier PPP por origen y se muestran aparte
  const o = pub(res).origin(1); assert.equal(o.unlinkedPoints, 2); assert.equal(o.rows.length, 0);
  assert.ok(reconcileAnalysis(res).ok, JSON.stringify(reconcileAnalysis(res).failed));
});

test('3. asistencias: último pase elegible frente a creación propia, candidato invalidado y serie elegible una sola vez; sin porcentaje objetivo', () => {
  const feed = (moved = false) => ({ passer: 'EQ01-J01', moved, window: false, origin: 'POS01' });
  const res = mk([
    att('P001', 0, [shot('EQ01-J10', 0, 'rim', 2, true, { feed: feed() })], { endKind: 'madeFG' }), // recepción interior
    att('P002', 0, [shot('EQ01-J06', 0, 'three', 3, true, { feed: feed() })], { endKind: 'madeFG' }), // recepción exterior sin bote
    att('P003', 0, [shot('EQ01-J06', 0, 'three', 3, true, { feed: feed(true) })], { endKind: 'madeFG' }), // creación propia con movimiento: el pase previo no basta
    att('P004', 0, [shot('EQ01-J03', 0, 'midrange', 2, true)], { endKind: 'madeFG' }), // sin pase final
    att('P005', 0, [shot('EQ01-J03', 0, 'midrange', 2, false, { fromFoul: true, feed: feed() })]),
    { type: 'free_throw', possession: 'P005', team: 0, dur: 0, stats: [ftS('EQ01-J03', 0, 1, 2, true, 'S001', { shotEvent: 'E0005', feed: feed() })] },
    { type: 'free_throw', possession: 'P005', team: 0, dur: 0, endKind: 'ftMade', stats: [ftS('EQ01-J03', 0, 2, 2, true, 'S001', { shotEvent: 'E0005', feed: feed() })] }, // dos libres convertidos: UNA asistencia por serie
    att('P006', 0, [shot('EQ01-J03', 0, 'midrange', 2, false, { fromFoul: true, feed: feed() })]),
    { type: 'free_throw', possession: 'P006', team: 0, dur: 0, endKind: 'ftMiss', stats: [ftS('EQ01-J03', 0, 1, 1, false, 'S002', { shotEvent: 'E0008', feed: feed() })] }, // ningún libre convertido: el candidato queda invalidado
  ]);
  const a = pub(res); const shots = a.viewedShots(0); const acta = a.ix.acta;
  const states = shots.filter((s) => s.made && !s.fromFoul).map((s) => assistState(s, acta).state);
  assert.deepEqual(states, ['recepción interior', 'recepción exterior', 'creación nueva', 'sin pase final']);
  assert.deepEqual(shots.filter((s) => s.made && !s.fromFoul).map((s) => !!s.credit), [true, true, false, false], 'solo acreditan las recepciones sin creación propia');
  assert.equal(acta.players['EQ01-J01'].astFg, 2); assert.equal(acta.players['EQ01-J01'].astFt, 1, 'una asistencia a libres por serie, aunque se conviertan dos');
  assert.equal(acta.players['EQ01-J01'].ast, 3, 'la serie sin libre convertido no acredita');
  // la tasa usa solo AS-C y las canastas elegibles; AS total no se compara con FGM
  const r = a.assists(0); assert.equal(r.eligible, 4); assert.equal(r.astFg, 2); assert.equal(r.pct.value, 50); assert.ok(a.ix.acta.teams[0].totals.ast > a.ix.acta.teams[0].totals.astFg, 'AS total ≠ AS-C: la tasa no usa AS total');
});

test('4. origen y ejecuciones: directo → poste conserva el origen, la decisión directa no se vuelve aclarado y los puntos no se duplican', () => {
  const it = (o) => ({ procedencia: 'libro', familia: 'pick_and_roll', origen: 'POS01', calidad: 'normal', zona: 'rim', categoria: 'fieldShot', ...o });
  const res = mk([
    att('P001', 0, [], { intent: it({ categoria: 'reorganization' }), participants: { director: 'EQ01-J01', screener: 'EQ01-J10' } }),
    att('P001', 0, [shot('EQ01-J10', 0, 'rim', 2, true)], { intent: it({ familia: 'post', origen: 'POS11' }), endKind: 'madeFG' }),
    att('P002', 0, [shot('EQ01-J03', 0, 'three', 3, false)], { intent: { procedencia: 'decisión directa', origen: 'ESP20', familia: null, calidad: 'forced', zona: 'three', ejecucion: 'dribble', categoria: 'fieldShot' }, endKind: 'dreb' }),
  ]);
  const a = analyze(res, { audience: 'own', team: 0 });
  const o = a.origin(0); const keys = o.rows.map((r) => r.key);
  assert.deepEqual(keys.sort(), ['directa:ESP20', 'libro:pick_and_roll'].sort(), 'el origen es el de la PRIMERA acción; no se convierte en aclarado');
  assert.equal(o.rows.reduce((s, r) => s + r.poss, 0), 2); assert.ok(o.reconciles);
  const book = o.rows.find((r) => r.key === 'libro:pick_and_roll'); assert.equal(book.points, 2); assert.equal(book.ppp.value, 2);
  // dos ejecuciones pertinentes en una sola posesión; los puntos locales no se suman al total
  const ex = a.executions(0); assert.equal(ex.executions, 3); assert.equal(ex.possessions, 2);
  assert.equal(ex.rows.find((r) => r.family === 'post').made, 1); assert.equal(ex.rows.find((r) => r.family === 'pick_and_roll').made, 0, 'el punto se atribuye al resultado local de la ejecución que lo produjo');
  // sin permiso propio, la procedencia de la decisión no se nombra: solo la acción observada
  const labels = pub(res, 1).origin(0).rows.map((r) => r.label).join(' | '); assert.doesNotMatch(labels, /Libro|Decisión directa/); assert.match(labels, /Acción/);
});

test('5. presencia y on/off: cambio legal entre libres, puntos sin consumo de reloj, mixtas aparte y grupo parcial que permanece', () => {
  const sub = { type: 'substitution', possession: 'P001', team: 0, dur: 0, participants: { sale: 'EQ01-J01', entra: 'EQ01-J05', posicion: 'PG' } };
  const res = mk([
    att('P001', 0, [shot('EQ01-J03', 0, 'three', 3, false, { fromFoul: true })], { dur: 50 }),
    { type: 'free_throw', possession: 'P001', team: 0, dur: 0, stats: [ftS('EQ01-J03', 0, 1, 3, true, 'S001', { shotEvent: 'E0001' })] },
    sub,
    { type: 'free_throw', possession: 'P001', team: 0, dur: 0, stats: [ftS('EQ01-J03', 0, 2, 3, true, 'S001', { shotEvent: 'E0001' })] },
    { type: 'free_throw', possession: 'P001', team: 0, dur: 0, endKind: 'ftMiss', stats: [ftS('EQ01-J03', 0, 3, 3, false, 'S001', { shotEvent: 'E0001' })] },
    att('P002', 1, [shot('EQ02-J04', 1, 'three', 3, true)], { dur: 100, endKind: 'madeFG' }),
  ]);
  const a = pub(res); const ix = a.ix; const p1 = ix.possessions.find((p) => p.id === 'P001');
  assert.equal(unitStatus(ix, p1, ['EQ01-J01'], 0), 'mixed', 'una sustitución legal entre libres convierte la posesión en mixta');
  assert.equal(unitStatus(ix, p1, ['EQ01-J03', 'EQ01-J06'], 0), 'complete', 'una pareja que permanece no se vuelve mixta porque cambie un tercero');
  assert.equal(unitStatus(ix, ix.possessions.find((p) => p.id === 'P002'), ['EQ01-J01'], 0), 'absent');
  const oo = a.onOff(['EQ01-J01']);
  assert.equal(oo.with.tenths, 50); assert.equal(oo.without.tenths, 100, 'el cambio no suma tiempo; el reloj solo corre en los hechos con duración');
  assert.equal(oo.with.ptsFor, 1); assert.equal(oo.without.ptsFor, 1, 'los puntos de presencia se reparten entre el antes y el después del cambio');
  assert.equal(oo.without.ptsAgainst, 3);
  assert.equal(oo.with.mixedCount, 1); assert.equal(oo.with.own.complete.length, 0);
  assert.equal(oo.with.ortgStable.value, null, 'sin posesiones completas no hay tasa estable (los puntos de presencia no se dividen entre ellas)');
  assert.equal(oo.diffNet.value, null); assert.match(oo.diffNet.reason, /sin exposición completa/);
  assert.equal(oo.with.tenths + oo.without.tenths + oo.partialTenths, ix.totalTenths);
  assert.ok(reconcileAnalysis(res).ok, JSON.stringify(reconcileAnalysis(res).failed));
});

test('6. evolución y filtros: empates, cambio de líder, tiempo integrado, final ajustado 120 s / 5 puntos y orden aplicada frente a pendiente', () => {
  const pts = (poss, team, n) => att(poss, team, [shot(team === 0 ? 'EQ01-J03' : 'EQ02-J04', team, n === 3 ? 'three' : 'rim', n, true)], { dur: 100, endKind: 'madeFG' });
  const res = mk([pts('P001', 0, 2), pts('P002', 1, 2), pts('P003', 1, 3), pts('P004', 0, 3), pts('P005', 0, 2)]);
  const e = pub(res).ev();
  assert.equal(e.ties.length, 2, 'empates producidos por anotación, sin contar el 0–0 inicial');
  assert.equal(e.leadChanges.length, 2, 'la primera ventaja no es un cambio de líder: solo cuentan los dos cambios posteriores');
  assert.equal(e.firstLead.team, 0); assert.equal(e.maxLead[0].lead, 2); assert.equal(e.maxLead[0].event, 'E0001', 'el primer instante de la ventaja máxima'); assert.equal(e.maxLead[1].lead, 3);
  assert.deepEqual(e.time.ahead, [100, 100]); assert.equal(e.time.tied, 300); assert.equal(e.time.total, 500);
  // final ajustado: tiempo y margen previos al hecho (no se selecciona lo decisivo a posteriori)
  const F = { seconds: 120, margin: 5 };
  assert.equal(inAdjustedFinal(4, 1200, [10, 5], F), true); assert.equal(inAdjustedFinal(4, 1201, [10, 5], F), false); assert.equal(inAdjustedFinal(4, 600, [10, 4], F), false, 'margen previo 6'); assert.equal(inAdjustedFinal(4, 600, [10, 6], F), true);
  assert.equal(inAdjustedFinal(4, 600, [10, 3], F), false, 'margen previo 7'); assert.equal(inAdjustedFinal(3, 600, [10, 9], F), false, 'solo Q4 o prórroga'); assert.equal(inAdjustedFinal(5, 900, [50, 50], F), true, 'cada prórroga');
  const q4 = mk([att('P001', 0, [shot('EQ01-J03', 0, 'rim', 2, true)], { period: 4, dur: 4900, endKind: 'madeFG' }), pts('P002', 1, 2), pts('P003', 0, 3), pts('P004', 1, 2), pts('P005', 0, 3), pts('P006', 0, 3), pts('P007', 1, 2)].map((x, i) => (i ? { ...x, period: 4 } : x)));
  const ids = [0, 1].flatMap((t) => pub(q4, t).shots(t, { adjustedFinal: true }).shots.map((s) => s.id)).sort();
  assert.deepEqual(ids, ['E0002', 'E0003', 'E0004', 'E0005', 'E0006'], 'E0001 (reloj 6000), y E0007 (margen previo 7) quedan fuera');
  // antes/después de una orden: parte de la aplicación efectiva; una orden pendiente no cuenta como aplicada
  const seq = Array.from({ length: 8 }, (_, i) => att(`P00${i + 1}`, 0, [shot('EQ01-J03', 0, 'rim', 2, i % 2 === 0)], { dur: 100, endKind: i % 2 === 0 ? 'madeFG' : 'dreb' }));
  const withOrders = mk(seq, { orders: [{ id: 'O1', team: 0, type: 'styles', kind: 'plan', state: 'pendiente', activation: null }, { id: 'O2', team: 0, type: 'styles', kind: 'plan', state: 'vigente', activation: { step: 4, lastEvent: 'E0004', possession: 'P004' } }] });
  const A = pub(withOrders);
  assert.equal(A.beforeAfter('O1').applied, false); assert.match(A.beforeAfter('O1').reason, /no se ha aplicado/);
  const ba = A.beforeAfter('O2'); assert.equal(ba.before.attacks, 3); assert.equal(ba.after.attacks, 3); assert.deepEqual(ba.before.ids, ['P002', 'P003', 'P004']); assert.deepEqual(ba.after.ids, ['P005', 'P006', 'P007']);
  assert.equal(ba.before.points, 2); assert.equal(ba.after.points, 4);
});

test('7. mapa, calidad y sin balón: sector desconocido sin lateralidad inventada, el acierto no reclasifica la calidad ni la utilidad', () => {
  const it = (o) => ({ procedencia: 'libro', familia: 'pick_and_roll', origen: 'POS01', calidad: 'normal', categoria: 'fieldShot', ...o });
  const res = mk([
    att('P001', 0, [shot('EQ01-J06', 0, 'three', 3, true)], { intent: it({ calidad: 'forced' }), participants: { screener: 'EQ01-J10' }, endKind: 'madeFG' }), // forzada que entra; pantalla sin contexto favorable
    att('P002', 0, [shot('EQ01-J06', 0, 'three', 3, false)], { intent: it({ calidad: 'comfortable' }), participants: { screener: 'EQ01-J10' }, endKind: 'dreb' }), // cómoda que falla
    att('P003', 0, [shot('EQ01-J06', 0, 'corner', 3, false)], { intent: it({}), endKind: 'dreb' }), // zona no registrada
  ]);
  const a = pub(res); const sec = a.sectors(0);
  assert.deepEqual(sec.map((s) => s.id), ['Z01', 'Z02', 'Z03–Z05', 'Z06–Z10', 'desconocido'], 'solo existen agrupaciones con la resolución real; ninguna Z03 o Z08 suelta');
  assert.equal(sec.find((s) => s.id === 'desconocido').att, 1); assert.equal(sec.find((s) => s.id === 'Z06–Z10').att, 2);
  assert.ok(sec.find((s) => s.id === 'Z03–Z05').resolution.includes('sin lateralidad'));
  const q = Object.fromEntries(a.quality(0).map((r) => [r.k, r])); assert.equal(q.forced.made, 1); assert.equal(q.forced.pct.value, 100); assert.equal(q.comfortable.made, 0, 'ni el acierto sube la calidad ni el fallo la baja');
  const ob = Object.fromEntries(a.offBall(0).map((r) => [r.id, r]));
  assert.equal(ob.OB01.counts.n, 2); assert.equal(ob.OB01.counts.useful, 1, 'utilidad = contexto favorable registrado (cómoda), con independencia del resultado');
  assert.equal(ob.OB02.counts.made, 1, 'la canasta tras pantalla es un indicador propio, no AS del bloqueador');
  assert.equal(ob.OB05.status, 'dependencia'); assert.match(ob.OB05.value, /no registrado/);
});

test('8. resumen: claves sustentadas y sin redundancia, menos de tres cuando corresponde, líderes con empates y una revisión que actualiza todas las vistas', () => {
  const res = reference(); const a = pub(res); const S = a.summary();
  assert.ok(S.keys.length >= 1 && S.keys.length <= 3);
  assert.equal(new Set(S.keys.map((k) => k.group)).size, S.keys.length, 'sin dos claves de la misma explicación');
  for (const k of S.keys) { assert.ok(k.id && k.category && k.text && k.evidence); assert.match(k.text, /\d/); }
  assert.ok(reconcileAnalysis(res).checks.find((c) => c.id === 'AN13').ok, 'toda clave remite a hechos existentes');
  assert.ok(S.margin.ok, 'el desglose por dos/tres/libres/administrativos explica el margen');
  for (const l of S.leaders) { assert.ok(Number.isFinite(l.value)); assert.ok(l.leaders.length >= 1 || l.value === 0); }
  // pocos hechos: menos de tres claves y sin relleno
  const tiny = pub(mk([att('P001', 0, [shot('EQ01-J03', 0, 'rim', 2, true)], { endKind: 'madeFG' })])).summary();
  assert.ok(tiny.keys.length < 3); assert.equal(tiny.keys.length, 0, 'sin evidencia suficiente no se inventan claves');
  // revisión estadística: reatribuye un crédito sin cambiar marcador; las vistas se recalculan desde el acta revisada
  const base = res.events.find((e) => e.stats.some((s) => s.k === 'shot' && s.made && !s.fromFoul && s.zone !== 'three' && s.team === 0));
  const stat = base.stats.find((s) => s.k === 'shot'); const lineBy = Object.fromEntries(res.lineups.map((l) => [l.id, Object.values(l.slots)]));
  const mate = lineBy[base.lineups[0]].find((id) => id !== stat.p && id !== stat.feed?.passer);
  const rev = applyRevisions(res, [{ id: 'R1', class: 'statistical', kind: 'reattribute', reason: 'prueba', fact: { event: base.id, k: 'shot' }, change: { field: 'p', to: mate } }], res.profile.statsPolicy);
  const res2 = { ...res, events: rev.events, acta: rev.acta, score: rev.score, periodScores: rev.periodScores };
  const b = pub(res2); assert.deepEqual(b.ix.acta.score, res.acta.score);
  assert.equal(b.ix.acta.players[mate].pts, a.ix.acta.players[mate].pts + 2); assert.equal(b.viewedShots(0).find((s) => s.id === base.id).shooter, mate);
  assert.ok(reconcileAnalysis(res2).ok, JSON.stringify(reconcileAnalysis(res2).failed));
  // revisión reglamentaria: el valor de un tiro cambia marcador, desglose, mapa y resumen a la vez
  const two = res.events.find((e) => e.stats.some((s) => s.k === 'shot' && s.made && !s.fromFoul && s.zone === 'midrange' && s.team === 0));
  const rr = applyRevisions(res, [{ id: 'R2', class: 'regulatory', kind: 'shotValue', reason: 'prueba', source: 'art. prueba', recognizedAt: 'prueba', fact: { event: two.id, k: 'shot' }, change: { points: 3 } }], res.profile.statsPolicy);
  const res3 = { ...res, events: rr.events, acta: rr.acta, score: rr.score, periodScores: rr.periodScores }; const c = pub(res3);
  assert.equal(c.ix.acta.score[0], res.acta.score[0] + 1); assert.equal(c.margin().ok, true);
  assert.equal(c.production()[0].partitionKind.fg3, a.production()[0].partitionKind.fg3 + 3); assert.equal(c.sectors(0).find((s) => s.id === 'Z03–Z05').att, a.sectors(0).find((s) => s.id === 'Z03–Z05').att - 1);
  assert.match(c.summary().headline, new RegExp(`${c.ix.acta.score[1]}`));
});

test('9. permisos: sin fugas por filtros, textos, evidencia, caché ni exportación; el estado oculto del rival no cambia el informe público', () => {
  const res = reference(); const own0 = analyze(res, { audience: 'own', team: 0 }); const pub0 = analyze(res, { audience: 'public', team: 0 }); const dg = analyze(res, { audience: 'diagnostic', team: 0 });
  const priv = ['prioridad', 'procedencia', 'pConversion', 'pFinal', 'director', 'disposicion'];
  // el equipo propio ve su libro; del rival solo lo público
  const mine = own0.viewedShots(0)[0]; const theirs = own0.viewedShots(1)[0];
  assert.ok(priv.slice(0, 2).every((k) => k in mine)); assert.ok(priv.every((k) => !(k in theirs)), 'del rival ni prioridad ni probabilidades');
  assert.ok(pub0.viewedShots(0).every((s) => priv.every((k) => !(k in s))), 'la vista pública no tiene campos propios ni diagnósticos');
  assert.ok(dg.viewedShots(1).every((s) => 'pConversion' in s)); assert.ok(own0.viewedShots(0).every((s) => !('pConversion' in s)), 'la audiencia propia no recibe la probabilidad exacta');
  // la caché incluye audiencia y perspectiva: un resultado diagnóstico no se reutiliza en la vista pública
  assert.notEqual(pub0, dg); assert.equal(analyze(res, { audience: 'public', team: 0 }), pub0); assert.ok(!('pConversion' in analyze(res, { audience: 'public', team: 0 }).viewedShots(0)[0]));
  // exportaciones públicas: ni claves ni valores privados
  const j = JSON.stringify(pub0.exportJson()); const m = pub0.exportMarkdown(); const csv = Object.values(pub0.exportCsv()).join('\n');
  for (const k of ['pConversion', 'pFinal', '"prioridad"', '"procedencia"', '"director"']) assert.ok(!j.includes(k), `JSON público contiene ${k}`);
  assert.ok(!/prioridad|pConversion/i.test(m + csv), 'Markdown y CSV públicos');
  // filtros propios sobre información no autorizada: no seleccionan nada y lo advierten (no revelan por inferencia)
  const f = pub0.shots(0, { priority: 1 }); assert.equal(f.shots.length, 0); assert.ok(f.warnings.length);
  // recomendaciones: la alternativa solo propia no se usa en la vista pública
  assert.ok(pub0.recommendations(0).items.every((r) => r.status !== 'condicionada'));
  assert.equal(pub0.directors(0).available, false); assert.equal(pub0.book(0).available, false);
  // cambiar solo el estado oculto del rival (prioridades, probabilidades, ficha) con hechos públicos fijos no cambia el informe público
  const alt = deepCopy(res);
  for (const e of alt.events) { if (e.team === 1 && e.intent?.seleccion) { e.intent.seleccion.prioridad = 5; e.intent.seleccion.pFinal = 0.5; e.intent.seleccion.ficha = 'POS15'; e.intent.procedencia = e.intent.procedencia === 'libro' ? 'libro' : e.intent.procedencia; } if (e.team === 1 && e.effects?.pConversion != null) e.effects.pConversion = 0.123; }
  assert.equal(JSON.stringify(analyze(alt, { audience: 'public', team: 0 }).exportJson()), JSON.stringify(pub0.exportJson()));
  assert.equal(analyze(alt, { audience: 'own', team: 0 }).exportMarkdown(), own0.exportMarkdown(), 'el equipo 0 tampoco ve lo oculto del rival');
});

test('10. lectores sin efectos: consultar, narrar y exportar no tocan el resultado, el estado ni el azar; leer un parcial no cambia el final', () => {
  const res = reference(); const before = JSON.stringify(res);
  for (const audience of ['public', 'own', 'diagnostic']) for (const team of [0, 1]) { const a = analyze(res, { audience, team }); a.summary(); a.exportJson(); a.exportMarkdown(); a.exportCsv(); a.onOff(['EQ01-J01']); a.recommendations(team); a.chronicleThrough(2); }
  reconcileAnalysis(res);
  assert.equal(JSON.stringify(res), before, 'el resultado no se modifica al leerlo');
  // leer un encuentro a medias no consume azar ni cambia la continuación
  const whole = createMatch(inputFor(20261017), profile, { detail: 'full' }); while (whole.step());
  const partial = createMatch(inputFor(20261017), profile, { detail: 'full' }); stepUntil(partial, (m) => m.stepSeq >= 80);
  const draws = partial.rng.count; const ev = JSON.stringify(partial.events);
  const mid = buildResult(partial); const A = analyze(mid, { audience: 'own', team: 0 }); const S = A.summary(); A.exportMarkdown(); A.lineups(0); A.ev();
  assert.equal(partial.rng.count, draws, 'ninguna consulta consume azar deportivo'); assert.equal(JSON.stringify(partial.events), ev);
  assert.equal(S.finished, false); assert.equal(S.chronicleKind, 'parcial'); assert.match(S.statusText, /PARCIAL/, 'un parcial no se presenta como victoria consumada');
  assert.ok(S.chronicle.every((c) => c.period <= mid.events[mid.events.length - 1].period), 'la crónica parcial no conoce el futuro');
  while (partial.step());
  assert.equal(JSON.stringify(sportsProjection(buildResult(partial)).events), JSON.stringify(sportsProjection(buildResult(whole)).events), 'leer a medias no cambia el partido');
});
