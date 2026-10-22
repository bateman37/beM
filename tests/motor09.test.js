// MOTOR-09: reglamento, administración y acta. Pocos grupos, cada uno protege una regla o un invariante que cambia puntos, elegibilidad, créditos o la
// verdad del acta. No hay barridos de partidos: se usan estados mínimos reproducibles, los casos preparados y un partido completo de referencia.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runMatch, createMatch, deepCopy, ENGINE_VERSION, EXPORT_SCHEMA, EXPORT_SCHEMA_MOTOR08 } from '../src/match/index.js';
import { replayMatch, validateReplayFile, compareProjections } from '../src/match/replay.js';
import { buildActa } from '../src/match/acta.js';
import { reconcile } from '../src/match/reconcile.js';
import { applyRevisions, validateRevision } from '../src/match/revisions.js';
import { resolveFoul, combineSanctions, administerSeries, availability, terminate, validateMatrix, matchRows } from '../src/match/regs.js';
import { LAB_CASES, syntheticMatch } from '../src/match/cases.js';
import { memoryReport } from '../src/match/memory-report.js';
import { validateProfile } from '../src/profiles/validate.js';
import { inPenalty, foulPeriodKey, shotClockAfterRingContact } from '../src/match/rules.js';
import { data, inputFor, freshMatch, baseEx, newMatch } from './helpers.js';

const profile = data.profile;
const caso = (id, ctx = {}) => LAB_CASES.find((c) => c.id === id).run({ profile, players: data.players, ...ctx });
let cached = null;
const reference = () => (cached ??= runMatch(inputFor(20261016), profile, { detail: 'full' }));
const shot = (p, team, zone, points, made, extra = {}) => ({ k: 'shot', p, team, zone, points, made, fromFoul: false, feed: null, ...extra });
const ft = (p, team, i, n, made, series, extra = {}) => ({ k: 'ft', p, team, made, series, i, n, cause: 'falta en acto de tiro', shooting: true, shotEvent: 'E0003', shotMade: false, feed: null, ...extra });

test('1. perfil MOTOR-09: matriz normativa coherente, estado de contraste por fila y una candidata ambigua no es activable', () => {
  assert.match(profile.effectiveId, /\+SEM-MOTOR09-20261016(\+SEM-MOTOR10-20261016)?(\+SEM-MOTOR11-20261017)?(\+SEM-MOTOR12-20261017)?(\+SEM-MOTOR13-20261017)?(\+SEM-MOTOR14-20261017)?(\+SEM-MOTOR15-20261017)?(\+SEM-MOTOR15B-20261017)?(\+SEM-MOTOR17-20261018)?(\+SEM-MOTOR17B-20261021)?(\+SEM-MOTOR18-20261021)?(\+SEM-MOTOR18B-20261022)?$/);
  assert.deepEqual(validateMatrix(profile), []);
  const reg = profile.regulation;
  // honestidad de fuentes: ninguna fila se presenta como lectura directa de un PDF inaccesible; lo contrastado remite al encargo §4.3 (MOTOR-09) o §7.3 (MOTOR-14)
  assert.ok(reg.sources.every((s) => /403|no/.test(s.access)));
  for (const r of reg.matrix) { assert.ok(['contrastada', 'heredada', 'provisional', 'pendiente'].includes(r.contrast), r.id); if (r.contrast === 'contrastada') assert.match(r.source.reading, /§4\.3|MOTOR-14 §7\.3|MOTOR-15/); if (r.contrast === 'pendiente') assert.equal(r.consequence, null); }
  // una fila incompatible con la misma prioridad: la matriz no es válida y no se desempata alfabéticamente
  const bad = deepCopy(profile); bad.regulation.matrix.push({ ...deepCopy(bad.regulation.matrix.find((r) => r.id === 'RG-F02')), id: 'RG-FX', consequence: { ft: 1, shooter: 'fouled', playerFoul: true, teamFoul: true, resume: { kind: 'afterSeries' } } });
  assert.ok(validateMatrix(bad).some((i) => i.rule === 'ambigüedad'));
  assert.ok(validateProfile(bad, { base: profile }).issues.some((i) => i.rule === 'ambigüedad' && i.severity === 'error'), 'el perfil candidato no se puede activar');
  // las normas contrastadas del encargo §4.3
  const d0 = resolveFoul(profile, { category: 'disruptiva', shotAction: false });
  assert.equal(d0.ft, 2); assert.equal(d0.resume.shotClock, 'fixed14'); assert.equal(d0.resume.retains, true);
  assert.equal(resolveFoul(profile, { category: 'flagrante', shotAction: true, shotPoints: 3, shotMade: false }).ft, 3);
  assert.equal(resolveFoul(profile, { category: 'flagrante', shotAction: true, shotPoints: 3, shotMade: true }).ft, 1);
});

test('2. faltas y contadores: personal, bonus, prórroga, categorías 2026, exclusión y contadores distintos', () => {
  const R = profile.rules;
  // bonus: con cuatro faltas de equipo la siguiente penaliza; antes, saque; las prórrogas acumulan con el cuarto periodo
  for (const [before, ft0] of [[0, 0], [3, 0], [4, 2], [7, 2]]) assert.equal(resolveFoul(profile, { category: 'personal', shotAction: false, penalty: inPenalty(before, R) }).ft, ft0);
  assert.equal(foulPeriodKey(5, R), 4); assert.equal(foulPeriodKey(6, R), 4); assert.equal(foulPeriodKey(3, R), 3);
  // falta en tiro: dos o tres según el intento; con canasta válida, un adicional que conserva el lanzamiento
  assert.deepEqual([[2, false], [3, false], [2, true], [3, true]].map(([p, made]) => resolveFoul(profile, { category: 'personal', shotAction: true, shotPoints: p, shotMade: made }).ft), [2, 3, 1, 1]);
  // la falta ofensiva no concede libres ni se cuenta como acción de tiro; un hecho sin descripción NO se convierte en falta personal normal
  const off = resolveFoul(profile, { category: 'ofensiva', shotAction: false }); assert.equal(off.ft, 0); assert.equal(off.turnover, true);
  const nd = resolveFoul(profile, { category: 'personal' }); assert.equal(nd.ok, false); assert.match(nd.diagnostic, /no se asume/);
  assert.equal(resolveFoul(profile, { category: 'rara', shotAction: false }).ok, false);
  // MOTOR-15 §5.2: las técnicas de jugador son ejecutables (RG-F07, antes pendiente: un libre sin alineación, falta individual y colectiva, contador por categoría); «antideportiva» NO es categoría (alias sin correspondencia automática)
  const tc = resolveFoul(profile, { category: 'tecnica1', shotAction: false }); assert.equal(tc.ok, true); assert.equal(tc.row, 'RG-F07'); assert.equal(tc.ft, 1); assert.equal(tc.shooter, 'designated'); assert.equal(tc.counter, 'tecnica1'); assert.equal(tc.resume.kind, 'priorContext');
  const ad = resolveFoul(profile, { category: 'antideportiva', shotAction: false }); assert.equal(ad.ok, false); assert.match(ad.diagnostic, /alias histórico/);
  // flujo real: la disruptiva administra por la matriz, retiene posesión con 14 s exactos, cuenta como personal y de equipo, y dos disruptivas NO descalifican
  const m = freshMatch(5);
  m.shotClock = 200; m.disruptiveAdmin('EQ02-J04', 'EQ01-J03', 0); m.disruptiveAdmin('EQ02-J04', 'EQ01-J03', 0);
  assert.equal(m.ps['EQ02-J04'].fouls, 2); assert.equal(m.ps['EQ02-J04'].available, true); assert.equal(m.sanctions('EQ02-J04').disruptive, 2);
  const ev = m.events[m.events.length - 1]; assert.equal(ev.stats[0].kind, 'disruptiva'); assert.equal(ev.stats[0].sobre, 'EQ01-J03'); assert.equal(ev.effects.regla, 'RG-F05');
  assert.equal(m.pendingFoul.retain, true); assert.equal(m.pendingFoul.n, 2);
  // descalificación acumulada por categoría (flagrantes y técnicas de categoría 1), distinta de los cinco personales
  assert.equal(m.disqualifies('EQ02-J04'), false);
  m.sanctions('EQ02-J04').flagrant = 1; m.sanctions('EQ02-J04').technicalCat1 = 1; assert.equal(m.disqualifies('EQ02-J04'), true);
  assert.equal(shotClockAfterRingContact(80, R), 140); assert.equal(shotClockAfterRingContact(200, R), 200);
  // falta en tiro del motor: libres coherentes con la matriz o error identificable
  assert.throws(() => freshMatch(7).foulAdmin('EQ02-J04', 'EQ01-J03', { shooting: true, ftCount: 2, shotTeam: 0, shotMade: false, shotPoints: 3 }), /incoherentes con la matriz/); // 2 libres por un triple fallado: la incoherencia no se acepta en silencio
  assert.throws(() => freshMatch(7).foulAdmin('EQ02-J04', 'EQ01-J03', { shooting: true, ftCount: 3, shotTeam: 0, shotMade: false }), /sin valor del intento/);
});

test('3. señal y relojes: la serie pendiente tras la bocina se administra antes de cerrar el periodo y el acta parcial no es definitiva', () => {
  const m = freshMatch(11); m.clock = 4; m.shotClock = 4;
  const ex = baseEx({ zone: 'three' });
  m.foulAdmin('EQ02-J04', 'EQ01-J03', { shooting: true, ftCount: 3, shotTeam: 0, shotMade: false, shotPoints: 3 });
  m.poss.pendingFT = ex;
  const before = m.events.length;
  for (let i = 0; i < 30 && !m.events.slice(before).some((e) => e.type === 'period_end'); i++) m.step();
  const types = m.events.slice(before).map((e) => e.type);
  assert.ok(types.includes('period_end'), 'el periodo se cierra');
  assert.ok(types.filter((t) => t === 'free_throw').length === 3, 'los tres libres se administran');
  assert.ok(types.lastIndexOf('free_throw') < types.indexOf('period_end'), 'por cuartos no se detiene antes de resolver la serie pendiente');
  // caso preparado: parcial frente a completa
  const c = caso('CASO-SENAL');
  assert.equal(c.actaPartial.status.definitive, false); assert.deepEqual(c.actaPartial.status.pendingSeries, ['S001']); assert.deepEqual(c.actaPartial.status.openFinals, ['F001']);
  assert.equal(c.acta.status.definitive, true); assert.equal(c.acta.score[0], 2); assert.equal(c.reconciliation.ok, true);
  assert.equal(c.acta.players['EQ01-J06'].fta, 3);
});

test('4. ventanas: la petición no consume, el lanzador pendiente no sale antes de tirar y los recursos nunca quedan negativos', () => {
  const m = freshMatch(13);
  m.pendingFoul = { fouled: 'EQ01-J03', n: 2, shotTeam: 0, shooting: true, shotMade: false, kind: 'falta en acto de tiro', shotEvent: null, feed: null };
  m.ps['EQ01-J03'].energy = 5; // muy cansado: una rotación voluntaria lo sacaría
  m.substitutionWindow('falta');
  assert.equal(m.ps['EQ01-J03'].onCourt, true, 'sin autorización genérica para cambiar entre intentos');
  const res = reference();
  assert.equal(res.reconciliation.checks.find((c) => c.id === 'REC01').ok, true);
  for (const l of res.diagnostics.timeouts) for (const v of Object.values(l.used)) assert.ok(v >= 0);
});

test('5. series y combinadas: repetición/anulación sin duplicar, una sola ejecución y compensación sin inventar', () => {
  const s = administerSeries({ id: 'S', granted: 2, attempts: [{ made: true }, { made: false, status: 'repeated' }, { made: true }, { made: false, status: 'annulled' }] });
  assert.deepEqual([s.granted, s.administered, s.valid, s.repeated, s.annulled, s.fta, s.points, s.consistent], [2, 4, 2, 1, 1, 2, 2, true]);
  const c = caso('CASO-SERIE');
  assert.equal(c.acta.players['EQ01-J03'].fta, 2); assert.equal(c.acta.players['EQ01-J03'].ftm, 2); assert.equal(c.acta.finals.length, 1); assert.equal(c.acta.finals[0].points, 2);
  assert.equal(c.acta.players['EQ01-J01'].ast, 1); assert.equal(c.acta.players['EQ01-J01'].astFt, 1, 'una asistencia por serie, no una por acierto');
  assert.equal(c.reconciliation.ok, true);
  const k = caso('CASO-COMBINADAS');
  assert.equal(k.A.status, 'resuelta'); assert.deepEqual(k.A.steps.map((x) => x.ft), [2, 2]); assert.equal(k.A.resume.from, 'S2');
  assert.equal(combineSanctions(profile, [{ id: 'S1', team: 0, order: 1, category: 'personal', shotAction: false, penalty: true }, { id: 'S1', team: 0, order: 2, category: 'personal', shotAction: false, penalty: true }]).steps.length, 1, 'la misma sanción no se ejecuta dos veces');
  // MOTOR-15 §6.1: la compensación del art. 43 es ejecutable (antes «pendiente de contraste»): dos penalizaciones equivalentes de equipos opuestos se compensan por orden, sin borrar las faltas cargadas
  assert.equal(k.B.status, 'compensada'); assert.deepEqual(k.B.compensated, [['S1', 'S2']]); assert.deepEqual(k.B.keptFouls, ['S1', 'S2']); assert.equal(k.B.resume.kind, 'priorContext');
  assert.equal(k.C.ok, true); assert.equal(k.C.ft, 1);
});

test('6. posesión y F: rebote ofensivo conserva el ataque, bonus y técnicas no inventan F ni ataque rival, y el cierre sin ataque no crea posesión vacía', () => {
  const res = reference(); const a = res.acta; const evs = res.events;
  // rebote ofensivo: la posesión no cambia
  const oreb = evs.filter((e) => e.type === 'rebound' && e.stats.some((f) => f.off));
  assert.ok(oreb.length > 0);
  for (const e of oreb) { const next = evs.find((x) => x.seq > e.seq && x.possessionId && ['attempt', 'foul', 'expiry'].includes(x.type)); if (next) assert.equal(next.possessionId, e.possessionId); }
  // una posesión cierra una vez y ninguna atraviesa un periodo
  assert.equal(new Set(a.possessions.map((p) => p.id)).size, a.possessions.length);
  assert.ok(a.possessions.length <= res.diagnostics.possessions); // las posesiones sin ataque activo no se cuentan
  // F ≠ FGA: un fallo con falta abre F pero no FGA; cada serie de tiro se liga a una sola F
  const foulMiss = a.finals.filter((f) => f.fromFoul && !f.made).length;
  const fga = a.teams.reduce((s, t) => s + t.totals.fga, 0);
  assert.equal(a.finals.length, fga + foulMiss);
  assert.equal(a.series.filter((s) => s.final).length, new Set(a.series.filter((s) => s.final).map((s) => s.final)).size);
  // sintético: bonus (sin F), canasta con adicional (una F con ambos puntos) y fin de periodo sin ataque
  const input = inputFor(1);
  const syn = syntheticMatch(profile, input, [
    { type: 'tipoff', team: 0 }, { type: 'period_start', team: 0 },
    { type: 'attempt', possession: 'P001', team: 0, dur: 50, stats: [shot('EQ01-J03', 0, 'rim', 2, true, { fromFoul: true })] },
    { type: 'foul', possession: 'P001', team: 0, stats: [{ k: 'foul', p: 'EQ02-J11', team: 1, kind: 'tiro', teamFoul: true, sobre: 'EQ01-J03' }] },
    { type: 'free_throw', possession: 'P001', team: 0, endKind: 'ftMade', stats: [ft('EQ01-J03', 0, 1, 1, true, 'S001', { shotMade: true })] },
    { type: 'foul', possession: 'P002', team: 0, stats: [{ k: 'foul', p: 'EQ02-J11', team: 1, kind: 'personal', teamFoul: true, sobre: 'EQ01-J01' }] },
    { type: 'free_throw', possession: 'P002', team: 0, stats: [ft('EQ01-J01', 0, 1, 2, true, 'S002', { shooting: false, shotEvent: null, cause: 'penalización colectiva' })] },
    { type: 'free_throw', possession: 'P002', team: 0, endKind: 'ftMade', stats: [ft('EQ01-J01', 0, 2, 2, true, 'S002', { shooting: false, shotEvent: null, cause: 'penalización colectiva' })] },
    { type: 'advance', possession: 'P003', team: 1 }, { type: 'period_end' },
  ]);
  const sa = buildActa(syn, profile.statsPolicy);
  assert.equal(sa.finals.length, 1); assert.equal(sa.finals[0].points, 3, 'canasta + adicional ligados a una sola F');
  assert.deepEqual([sa.partition.byOrigin.f, sa.partition.byOrigin.sanction, sa.partition.total], [3, 2, 5]);
  assert.equal(sa.possessions.length, 2, 'P003 solo avanzó: no es una posesión con ataque');
  assert.equal(sa.partition.byPossession.unlinked, 0);
});

test('7. créditos: asistencias sin duplicidad, pérdida sin robo, rebote colectivo, TAP/TREC sobre el mismo intento y fallo con falta fuera de FGA', () => {
  const input = inputFor(1);
  const feed = { passer: 'EQ01-J01', moved: false, window: false, origin: 'POS07' };
  const syn = syntheticMatch(profile, input, [
    { type: 'tipoff', team: 0 }, { type: 'period_start', team: 0 },
    { type: 'attempt', possession: 'P001', team: 0, dur: 50, stats: [shot('EQ01-J06', 0, 'three', 3, true, { feed })] }, // asistencia a canasta
    { type: 'attempt', possession: 'P002', team: 0, dur: 50, stats: [shot('EQ01-J08', 0, 'rim', 2, true, { feed: { ...feed, moved: true } })] }, // creación propia: sin asistencia
    { type: 'attempt', possession: 'P003', team: 1, dur: 40, stats: [{ k: 'tov', p: 'EQ02-J04', team: 1, cause: 'pase' }] }, // pérdida sin robo
    { type: 'attempt', possession: 'P004', team: 0, dur: 40, stats: [shot('EQ01-J03', 0, 'midrange', 2, false, { blockedBy: 'EQ02-J11' }), { k: 'blk', p: 'EQ02-J11', team: 1 }] },
    { type: 'rebound', possession: 'P004', team: 0, dur: 8, stats: [{ k: 'reb', p: null, team: 1, off: false, of: 'E0006' }] }, // rebote colectivo
    { type: 'attempt', possession: 'P005', team: 1, dur: 40, stats: [{ k: 'tov', p: null, team: 1, cause: 'violacion_24' }] },
  ]);
  const a = buildActa(syn, profile.statsPolicy);
  assert.equal(a.players['EQ01-J01'].ast, 1); assert.equal(a.players['EQ01-J01'].astFg, 1); assert.equal(a.players['EQ01-J08'].pts, 2); assert.equal(a.teams[0].totals.ast, 1, 'la creación propia con movimiento no genera una segunda asistencia oficial');
  assert.equal(a.players['EQ02-J04'].tov, 1); assert.equal(a.teams[1].totals.stl, 0);
  assert.equal(a.players['EQ02-J11'].blk, 1); assert.equal(a.players['EQ01-J03'].blkRec, 1); assert.equal(a.players['EQ01-J03'].fg2a, 1);
  assert.equal(a.teams[1].collective.reb, 1); assert.equal(a.teams[1].totals.dreb, 1); assert.equal(a.players['EQ02-J11'].dreb, 0, 'el rebote colectivo no se carga a una ficha');
  assert.equal(a.teams[1].collective.tov, 1); assert.equal(a.teams[1].totals.tov, 2);
  const r = reconcile(syn, a); assert.deepEqual(r.failed, [], JSON.stringify(r.checks.filter((c) => !c.ok)));
  // VAL con la fórmula del funcional; porcentaje sin intentos «—» (null), no 0 %
  const l = a.players['EQ01-J06']; assert.equal(l.val, l.pts + l.reb + l.ast + l.stl + l.blk + l.fr - (l.fga - l.fgm) - (l.fta - l.ftm) - l.tov - l.blkRec - l.pf); assert.equal(a.players['EQ01-J06'].pct.ft, null);
  // partido real: todo crédito de rebote remite a un fallo elegible; todo robo comparte hecho con una pérdida rival; sin igualdades globales forzadas
  const res = reference();
  for (const id of ['REB01', 'ROB01', 'TAP01', 'TAP02']) assert.equal(res.reconciliation.checks.find((c) => c.id === id).ok, true, id);
});

test('8. presencia: mismo reloj con distinta secuencia, DNP frente a participación sin tiempo, inferioridad y minutos conciliados', () => {
  const input = inputFor(1);
  const syn = syntheticMatch(profile, input, [
    { type: 'tipoff', team: 0 }, { type: 'period_start', team: 0 },
    { type: 'attempt', possession: 'P001', team: 0, dur: 100, stats: [shot('EQ01-J03', 0, 'three', 3, true)] },
    { type: 'attempt', possession: 'P002', team: 0, dur: 0, stats: [shot('EQ01-J06', 0, 'rim', 2, true)] }, // mismo instante, ANTES del cambio
    { type: 'substitution', team: 0, participants: { sale: 'EQ01-J06', entra: 'EQ01-J05', posicion: 'SF' } },
    { type: 'attempt', possession: 'P003', team: 0, dur: 0, stats: [shot('EQ01-J03', 0, 'rim', 2, true)] }, // mismo instante, DESPUÉS
    { type: 'substitution', team: 0, participants: { sale: 'EQ01-J05', entra: 'EQ01-J06', posicion: 'SF' } }, // entra y sale sin consumir tiempo
    { type: 'attempt', possession: 'P004', team: 1, dur: 60, stats: [shot('EQ02-J05', 1, 'rim', 2, true)] },
  ]);
  const a = buildActa(syn, profile.statsPolicy);
  const s = a.players;
  assert.equal(s['EQ01-J05'].participation, 'entró sin tiempo'); assert.equal(s['EQ01-J05'].min, 0);
  assert.equal(s['EQ01-J05'].pm, 2, 'solo la canasta posterior al cambio se atribuye al grupo presente en ese momento');
  assert.equal(s['EQ01-J06'].pts, 2); assert.equal(s['EQ01-J06'].pm, 3 + 2 - 2, 'la canasta del mismo instante anterior al cambio sí era de su grupo; la posterior no; y vuelve antes de la canasta rival');
  assert.equal(s['EQ01-J02'].participation, 'DNP');
  const r = reconcile(syn, a); assert.deepEqual(r.failed, []);
  // inferioridad: cuatro en pista, no se rellena con el excluido; ocupación real en minutos y más-menos
  const inf = caso('CASO-INFERIORIDAD');
  assert.equal(inf.reconciliation.ok, true, JSON.stringify(inf.reconciliation.checks.filter((c) => !c.ok)));
  assert.deepEqual(inf.highlights.ocupacion, ['E0003: 5 vs 5', 'E0005: 5 vs 4', 'E0006: 5 vs 4']);
  assert.ok(inf.acta.teams[1].totals.min < inf.acta.teams[0].totals.min, 'la inferioridad reduce la ocupación esperada respecto a cinco');
  // partido real: minutos de equipo = 200 + prórrogas
  const res = reference(); const per = res.periodScores.length;
  for (const t of res.acta.teams) assert.ok(Math.abs(t.totals.min - (200 + 25 * Math.max(0, per - 4))) < 1e-6);
  assert.equal(res.reconciliation.checks.find((c) => c.id === 'PRES02').ok, true, 'intervalos y quintetos registrados coinciden');
});

test('9. corrección: reatribución coherente, valor/validez cambian lo legal y se propagan; no es una resimulación; el cambio de marcador no es «solo estadística»', () => {
  const res = reference();
  const c = caso('CASO-CORRECCION', { result: res });
  const h = c.highlights;
  assert.deepEqual(h.marcadorOriginal, res.score); assert.notDeepEqual(h.marcadorRevisado, res.score);
  assert.equal(h.registro.length, 2); assert.equal(h.rechazadas.length, 1); assert.match(h.rechazadas[0].problems[0], /corrección reglamentaria/);
  assert.equal(h.conciliacion, 'válida');
  // R1 estadística: cambia créditos y más-menos pero NO el marcador legal
  const rec = c.out.log[0];
  const r1 = applyRevisions(res, [{ id: 'R1', class: 'statistical', kind: 'reattribute', fact: rec.fact, change: { field: 'p', to: rec.after.p }, reason: 'x' }]);
  assert.equal(r1.acta.players[rec.after.p].pts, res.acta.players[rec.after.p].pts + rec.before.points); assert.equal(r1.acta.players[rec.before.p].pts, res.acta.players[rec.before.p].pts - rec.before.points);
  assert.deepEqual(r1.score, res.score);
  // R2 reglamentaria: marcador, parciales, intentos y F derivados cambian; el original no se toca
  assert.notDeepEqual(c.out.periodScores, res.periodScores); assert.deepEqual(res.score, reference().score);
  assert.equal(c.out.acta.revision.effective, 2); assert.equal(c.out.log[1].contrast.startsWith('pendiente'), true);
  // anular un tiro válido: sale de FGA, de los puntos y de las F; una revisión inválida no se aplica
  const ev = res.events.find((e) => e.stats.some((f) => f.k === 'shot' && f.made && !f.fromFoul));
  const v = applyRevisions(res, [{ id: 'RV', class: 'regulatory', kind: 'shotValidity', fact: { event: ev.id, k: 'shot' }, change: { valid: false }, reason: 'fuera de tiempo', source: 'art. 45 (sin contrastar)', recognizedAt: { seq: ev.seq + 1 } }]);
  const who = ev.stats.find((f) => f.k === 'shot');
  assert.equal(v.acta.players[who.p].fga, res.acta.players[who.p].fga - 1); assert.equal(v.acta.finals.length, res.acta.finals.length - 1); assert.equal(v.score[who.team], res.score[who.team] - who.points);
  assert.equal(validateRevision(res, { id: 'X', class: 'statistical', kind: 'reattribute', fact: { event: ev.id, k: 'shot' }, change: { to: 'EQ99-J01' }, reason: 'y' }).ok, false);
  // corrección técnica: ejecución inválida identificada; no fabrica un acta definitiva ni una decisión arbitral
  const t = applyRevisions(res, [{ id: 'T1', class: 'technical', kind: 'defecto', reason: 'defecto del motor', engineVersion: ENGINE_VERSION }]);
  assert.equal(t.reconciliation.valid, 'inválida'); assert.equal(t.acta.status.definitive, false); assert.equal(t.score[0], res.score[0]);
});

test('10. terminación: el resultado adjudicado no se mezcla con la cancha y una ejecución inválida no se presenta como resultado deportivo', () => {
  const c = caso('CASO-INFERIORIDAD');
  assert.equal(c.availability.cuatro.canContinue, true); assert.equal(c.availability.cuatro.inferiority, true); assert.equal(c.availability.uno.canContinue, false);
  assert.deepEqual(c.administrative.awarded, [20, 0]); assert.notDeepEqual(c.administrative.awarded, c.acta.score); assert.equal(c.administrative.awardedIsCourtScore, false);
  assert.equal(terminate(profile, { favored: 1, played: [3, 4], reason: 'x' }).awarded[1], 20);
  assert.equal(availability(profile, Array.from({ length: 12 }, (_, i) => ({ available: i < 12, excluded: i === 3 }))).eligible, 11);
  // MOTOR-14: sin sustituto elegible la posición queda VACANTE (inferioridad natural), sin error ni sexto jugador; el equipo sigue con los presentes
  const m = freshMatch(17);
  for (const id of m.teams[1].ids) if (!m.ps[id].onCourt) m.ps[id].available = false;
  m.ps['EQ02-J11'].fouls = 5; m.ps['EQ02-J11'].available = false;
  m.coachMandatory(1, 'falta', new Set());
  assert.equal(m.onCourt(1).length, 4); assert.equal(m.lineup[1].C, undefined); assert.ok(m.events.some((e) => e.type === 'substitution' && e.participants.entra === null && e.participants.sale === 'EQ02-J11'));
  const res = reference(); const bad = { ...res, status: 'error' };
  assert.equal(buildActa(bad, profile.statsPolicy).status.definitive, false, 'una ejecución con error no produce un acta definitiva');
  assert.equal(buildActa(bad, profile.statsPolicy).status.partial, true);
});

test('11. memoria: denominadores separados, claves semánticas sin fragmentación artificial y ruta B permitida o impedida', () => {
  const res = reference(); const rep = memoryReport(res);
  const d = rep.denominadores;
  assert.ok(d.episodiosDeReconocimiento <= d.revisionesDeReconocimiento, 'veintiocho revisiones del mismo patrón no son veintiocho patrones');
  assert.ok(d.respuestasAplicadasRutaA <= d.respuestasAutorizadas && d.respuestasAutorizadas <= d.respuestasCompatibles);
  for (const t of Object.values(rep.porEquipo)) {
    assert.equal(t.rotacion.capacidad, 8);
    assert.ok(t.rotacion.inserciones >= t.rotacion.reemplazosPorCapacidad, 'se distinguen inserción inicial, reemplazo, descarte y actualización');
    for (const k of Object.keys(t.claves)) assert.match(k, /^(pnr|handoff|offBallScreen|giveAndGo|post|isolation|help|direct)\|[A-Za-zÀ-ÿ0-9_]+$/, 'la clave no contiene ID de evento, reloj, valor aleatorio, acierto/fallo ni calidad');
  }
  assert.ok(Object.keys(rep.noAplicadas).length > 0);
  // ruta B: estado mínimo reproducible. Patrón reconocido de la defensa 1 sobre el bloqueo directo del ataque 0
  const m = newMatch(20261016); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  const ex = { family: 'pick_and_roll', role: 'handler', actor: 'EQ01-J01' };
  const entry = { family: 'pick_and_roll', spec: { coverage: true } };
  const plant = () => { m.mem[1].entries = [{ key: 'pnr|handler', pattern: 'MEMP02', family: 'pnr', role: 'handler', evidence: 3, ref: m.attackSeq[0], firstAttack: 0, lastAttack: m.attackSeq[0], exposures: 3, comfort: { comfortable: 3, contested: 0, uncomfortable: 0 }, actors: {}, helpers: {}, abandoned: {}, zones: {}, response: null, lastAdjust: null }]; };
  plant();
  const planCov = m.teams[1].plan.coverage;
  const prep = m.preparedCoverage(entry, m.poss, ex);
  assert.ok(prep && prep.cob !== planCov, 'prepara una cobertura compatible distinta de la del plan');
  assert.equal(m.teams[1].plan.coverage, planCov, 'sin cambio de plan');
  assert.equal(m.pendingWindows.length, 0, 'no abre una ventana administrativa');
  assert.equal(m.memLog.at(-1).tipo, 'preparación'); assert.equal(m.memLog.at(-1).resultado, 'preparada');
  assert.equal(m.preparedCoverage(entry, m.poss, ex), null, 'una sola preparación por ataque: sin ventajas acumuladas');
  // el encargo no la permite: orden manual vigente sobre la cobertura
  m.poss.routeB = 0; plant();
  m.orders.push({ id: 'OM1', issuer: 'manual', team: 1, kind: 'plan', liveFields: ['defCoverage'], state: 'pendiente', content: {}, scope: { kind: 'actual' } });
  assert.equal(m.preparedCoverage(entry, m.poss, ex), null); assert.equal(m.memLog.at(-1).resultado, 'impedida');
  // el perfil puede desactivarla
  const off = deepCopy(profile); off.memory.routeB.enabled = false; const m2 = createMatch(inputFor(20261016), off, { detail: 'minimal' }); m2.init(); m2.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  assert.equal(m2.preparedCoverage(entry, m2.poss, ex), null);
});

test('12. reproducción: acta reconstruida = acta de la ejecución, sin dobles sanciones; export/7 se rechaza conservando el archivo', () => {
  const res = reference();
  assert.equal(res.schema, EXPORT_SCHEMA); assert.match(EXPORT_SCHEMA, /export\/(8|9|10)$/); assert.equal(res.meta.engineVersion, ENGINE_VERSION);
  assert.equal(res.reconciliation.ok, true, JSON.stringify(res.reconciliation.checks.filter((c) => !c.ok)));
  const file = JSON.parse(JSON.stringify(res));
  const rebuilt = buildActa({ events: file.events, lineups: file.lineups, input: file.input, possessions: file.possessions, status: file.status }, file.profile.statsPolicy);
  const { glossary, ...a } = rebuilt; const { glossary: g2, ...b } = res.acta; assert.deepEqual(a, b);
  assert.deepEqual(a.score, res.score);
  const rp = replayMatch(file); assert.equal(rp.comparison.identical, true);
  assert.equal(rp.result.events.filter((e) => e.type === 'free_throw').length, res.events.filter((e) => e.type === 'free_throw').length, 'la reproducción no concede libres de más');
  assert.equal(rp.result.events.filter((e) => e.type === 'timeout').length, res.events.filter((e) => e.type === 'timeout').length, 'ni consume pausas dos veces');
  assert.equal(compareProjections(res, rp.result).identical, true);
  // el formato anterior se rechaza con motivo y el archivo original se conserva sin cambios
  const old = { ...JSON.parse(JSON.stringify(res)), schema: EXPORT_SCHEMA_MOTOR08 }; const snapshot = JSON.stringify(old);
  const v = validateReplayFile(old); assert.equal(v.reproducible, false); assert.equal(v.legacy, true); assert.match(v.problems[0], /MOTOR-09/);
  assert.equal(JSON.stringify(old), snapshot);
  assert.throws(() => replayMatch(old), /No se puede reproducir/);
});

test('matchRows: la prioridad declarada decide y no el orden de las filas', () => {
  const r = matchRows(profile, { category: 'disruptiva', shotAction: false });
  assert.equal(r.chosen.id, 'RG-F05'); assert.equal(r.ambiguous, false);
});
