// MOTOR-17B: regresiones de los cinco cierres (B17-01…05). Cada prueba falla con el defecto o con la entrada que lo reproducía. Sin baterías: partidos naturales cortos, casos dirigidos y unidades puras.
// Grupos: 1 organización efectiva · 2 AUD05 · 3 crédito de robo y procedencia · 4 salidas reales de sensibilidad · 5 neutralidad e instancias · 6 contrato de cierre y paquetes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { data, defInputFor, playWithOrders } from './helpers.js';
import { createMatch, buildResult } from '../src/match/index.js';
import { INPUT_SCHEMA } from '../src/match/data.js';
import { referenceTeam, retargetTeam } from '../src/population/index.js';
import { MatchCore } from '../src/match/core.js';
import { compactShots, compactTactics, buildEssential, ESSENTIAL_VERSION, legacyDefenseOrg, DEFENSE_ORG_SEMANTICS } from '../src/batch/essential.js';
import { orgAt } from '../src/analysis/orgat.js';
import { makeCtx, eventStreams } from '../src/batch/records.js';
import { projectAttempt } from '../src/audit/project.js';
import { selectContexts, sensitivity, capabilityMatrix, CAPABILITY_IDS } from '../src/audit/analysis.js';
import { EVALUATORS } from '../src/audit/evaluators.js';
import { consumerOutput } from '../src/audit/consumers.js';
import { shotResolution, categoryResolution, qualityResolution, mixResolution, pickProbabilities } from '../src/match/formulas.js';

const { profile, players } = data;
const natural = (a, b, seed) => ({ schema: INPUT_SCHEMA, seed, importance: 'ordinary', teams: [referenceTeam(profile, players, a), referenceTeam(profile, players, b)] });
const play = (input, detail = 'full') => { const m = createMatch(input, profile, { detail, check: true }); while (m.step()); return { m, res: buildResult(m) }; };
const col = (t, name) => t.columns.indexOf(name);
const strip = (e) => { const { calc, params, instr, stats, effects, ...r } = JSON.parse(JSON.stringify(e)); r.stats = (stats ?? []).filter((s) => s.k !== 'stl'); const ef = { ...effects }; delete ef.robo; delete ef.cadenaRobo; r.effects = ef; return JSON.stringify(r); };

// ------------------------------------------------------------------------------------------------------------------------ 1 · organización efectiva (B17-01)
test('M17B·1 organización efectiva: el código de la organización vigente ANTES de cada hecho (plan, orden aplicada, alternativa), no la intención de intervención; órdenes sin aplicar no la cambian; versión antigua declarada', () => {
  const { m, orders } = playWithOrders(defInputFor(61, 1, {}), [
    { at: 60, spec: { team: 1, type: 'defOrg', defense: 'ORG02', target: null, targetAlt: null, fallbackOrg: 'ORG02' } }, // se aplica en su frontera
    { at: 40, spec: { team: 1, type: 'defOrg', defense: 'ORG06', target: null, targetAlt: null, fallbackOrg: 'ORG02' } }]); // box and one sin objetivo: rechazada, no altera nada
  const res = buildResult(m); assert.equal(orders[0].state, 'rechazada'); assert.notEqual(orders[1].state, 'rechazada'); const applied = res.orders.find((o) => o.type === 'defOrg' && o.activation && o.state !== 'rechazada'); assert.ok(applied, 'una orden de organización se aplicó');
  const t = compactShots(res); const ci = (n) => col(t, n); const byId = Object.fromEntries(res.events.map((e) => [e.id, e])); const at = byId[applied.activation.lastEvent].seq; const before = []; const after = [];
  for (const r of t.rows) if (r[ci('team')] === 0) (r[ci('seq')] <= at ? before : after).push(r);
  assert.ok(before.length > 3 && after.length > 3, 'tiros antes y después de la orden');
  const plan = res.input.teams[1].plan.defense;
  for (const r of before) { assert.equal(r[ci('defense_org')], plan); assert.equal(r[ci('defense_org_plan_version')], 0); assert.equal(typeof r[ci('defense_org')], 'string', 'código, no el objeto de intervención'); assert.equal(r[ci('defense_org_source')], 'plan'); }
  for (const r of after) { assert.equal(r[ci('defense_org')], applied.content.defense); assert.equal(r[ci('defense_org_plan_version')], 1); assert.equal(r[ci('defense_org_source')], 'orden aplicada'); }
  assert.ok(t.columns.includes('defense_org_reason'), 'el motivo de una organización no reconstruible tiene su campo'); assert.ok(t.rows.every((r) => r[ci('defense_org_source')] !== 'no reconstruible' || (r[ci('defense_org')] === null && r[ci('defense_org_reason')])), 'nunca una organización inventada: sin reconstrucción, nulo con motivo');
  // la decisión de intervención sigue disponible, en su campo, y es un objeto distinto del código
  assert.ok(t.rows.some((r) => r[ci('defense_intervention')] && typeof r[ci('defense_intervention')] === 'object'));
  // lector compartido: coincide con el `orgAt` del análisis del partido
  const ix = { res, events: res.events, byId, input: res.input }; for (const r of t.rows.slice(0, 40)) assert.equal(r[ci('defense_org')], orgAt(ix, 1 - r[ci('team')], r[ci('seq')]).effective);
  // tácticas por posesión: separa organizaciones o declara posesión mixta, nunca «el último valor»
  const tac = compactTactics(res); assert.ok(tac.every((x) => Array.isArray(x.orgs) && (x.org_mixed ? x.org === null : x.org === x.orgs[0])));
});

test('M17B·1b box and one con objetivo y alternativa ausentes desde la entrada: se conserva la organización ALTERNATIVA ejecutada y su condición', () => {
  const input = natural('EQ01', 'EQ11', 372000004); const pl = input.teams[1].plan; const starters = new Set(Object.values(input.teams[0].plan.starters)); const bench = input.teams[0].players.map((p) => p.id).filter((id) => !starters.has(id)); // objetivo rival y alternativa fuera de pista desde la entrada
  Object.assign(pl, { defense: 'ORG06', target: bench[0], targetAlt: bench[1], fallbackOrg: 'ORG02' });
  const { res } = play(input); const t = compactShots(res); const ci = (n) => col(t, n); const rows = t.rows.filter((r) => r[ci('team')] === 0 && r[ci('defense_org_source')] !== undefined);
  assert.ok(rows.length > 5); assert.ok(rows.every((r) => r[ci('defense_org')] === 'ORG02' && r[ci('defense_org_intended')] === 'ORG06' && r[ci('defense_org_alternate')] === true && r[ci('defense_org_source')] === 'alternativa'), 'lo realmente ejecutado es la alternativa, con su condición');
  const e = buildEssential(res, { keys: {}, validity: { valid: true, reasons: [], reconciliation_ok: true, analysis_ok: true, mode: 'full' }, fp: null, fpMode: 'none', sim: null });
  assert.equal(e.essential_version, ESSENTIAL_VERSION); assert.equal(e.essential_version, 'ESE-MOTOR18-R1'); // MOTOR-18: el esencial sube de versión (añade familiaridad); la semántica de defense_org es la de ESE-MOTOR17B-R1 assert.deepEqual(e.field_semantics, DEFENSE_ORG_SEMANTICS);
});

test('M17B·1c compatibilidad: un esencial anterior con `defense_org` como objeto se declara histórico y no se reinterpreta como observación original', () => {
  const old = legacyDefenseOrg({ essential_version: 'ESE-MOTOR17-R1' }); assert.equal(old.status, 'histórico'); assert.match(old.reason, /intención de intervención/);
  assert.equal(legacyDefenseOrg({ essential_version: ESSENTIAL_VERSION }), null);
});

// ------------------------------------------------------------------------------------------------------------------------ 2 · AUD05 (B17-03)
const aud05Ctx = ({ observed = CAPABILITY_IDS, withOutput = CAPABILITY_IDS, onlyQuality = [], mismatch = false, approx = false } = {}) => {
  const matrix = CAPABILITY_IDS.map((cap) => ({ cap, stratum: 's', declaradoN: 1, usos: observed.includes(cap) ? 3 : 0, usosCalidadAtaque: onlyQuality.includes(cap) ? 2 : 0, salidaPertinente: withOutput.includes(cap), salidaConsumidores: 'tiro', salidaMotivoPendiente: withOutput.includes(cap) ? null : 'ningún contexto con operación enlazada' }));
  const sens = CAPABILITY_IDS.filter((c) => withOutput.includes(c)).map((cap) => ({ cap, gdec: 'g', player: 'p', role: 'x', pertinente: true, exactitudSalida: approx ? 'aproximada' : 'exacta (entradas registradas + función de producción)', baseCoincide: mismatch ? false : true, consumidor: 'tiro', decision_id: 'd', diferenciaBase: 0, tolerancia: 1e-8, limite: false }));
  return { id: 'AUD05', projs: [{ level: 'diagnostic', match_id: 'M', attempt_id: 'A' }], matrix, sens };
};
test('M17B·2 AUD05: estado y motivos derivados de la evidencia; falta de exposición, de registro y de contraste son cosas distintas; nunca aprobación automática', () => {
  const full = EVALUATORS.AUD05(aud05Ctx()); assert.equal(full.resultado, 'conforme'); assert.equal(full.metrics.capacidadesObservadasEnCalculos, 32); assert.equal(full.metrics.capacidadesConSalidaPertinenteContrastada, 32); assert.equal(full.exposicion, 'observada'); assert.ok(!full.findings.some((f) => f.rule === 'CAP-SIN-EXPOSICION'), 'con las 32 observadas no se declara falta de exposición'); assert.match(full.note, /ESTE control/); assert.match(full.metrics.alcance, /REPRESENTATIVO/);
  const miss = EVALUATORS.AUD05(aud05Ctx({ observed: CAPABILITY_IDS.filter((c) => c !== 'TEC06'), withOutput: CAPABILITY_IDS.filter((c) => c !== 'TEC06') })); assert.equal(miss.resultado, 'inconcluso'); assert.equal(miss.exposicion, 'insuficiente'); assert.deepEqual(miss.metrics.sinExposicionEnLaEvidencia, ['TEC06']);
  const noreg = EVALUATORS.AUD05(aud05Ctx({ observed: CAPABILITY_IDS.filter((c) => c !== 'FIS03'), withOutput: CAPABILITY_IDS.filter((c) => c !== 'FIS03'), onlyQuality: ['FIS03'] })); assert.deepEqual(noreg.metrics.observadasSinEntradasDeReceta, ['FIS03']); assert.deepEqual(noreg.metrics.sinExposicionEnLaEvidencia, [], 'falta de registro no es falta de exposición'); assert.ok(noreg.findings.some((f) => f.rule === 'CAP-SIN-REGISTRO'));
  const pend = EVALUATORS.AUD05(aud05Ctx({ withOutput: CAPABILITY_IDS.filter((c) => c !== 'MEN05') })); assert.equal(pend.resultado, 'inconcluso'); assert.deepEqual(pend.metrics.pendientesDeContraste, ['MEN05']); assert.ok(pend.findings.some((f) => f.rule === 'CAP-CONTRASTE-PENDIENTE'), 'observada pero con el contraste en la receta intermedia'); assert.equal(pend.exposicion, 'observada');
  assert.equal(EVALUATORS.AUD05(aud05Ctx({ mismatch: true })).resultado, 'señal'); assert.notEqual(EVALUATORS.AUD05(aud05Ctx({ approx: true })).resultado, 'conforme');
});

// ------------------------------------------------------------------------------------------------------------------------ 3 · crédito de robo y procedencia (B17-04)
test('M17B·3 robo: recogida viva SIN interceptor ni intento acredita al recuperador; el primer desviador gana al recuperador; balón fuera, falta ofensiva y recuperación sin autor no; procedencia común en todas las rutas', () => {
  const base = { team: 0, origin: 'PRUEBA', kind: 'organized', actor: 'EQ01-J03', zone: 'three', exec: 'dribble', passer: null, moved: false, offContact: null, holder: 'EQ01-J03', quality: { cls: 'normal', K: 0 } };
  const scene = () => { const m = createMatch(natural('EQ01', 'EQ02', 41), profile, { detail: 'full' }); m.init(); m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 }); return m; };
  const run = (over, answers, pick) => { const t = scene(); const q = [...answers]; t.bernoulli = () => q.shift() ?? false; if (pick) t.pickRecoverer = () => pick; return { t, r: t.resolveTurnover({ ...base, ...over }, { t: t.snap(), team: 0, intent: {}, participants: {} }) }; };
  const noIcpt = run({ icpt: null, defend: null, stealAttempt: null }, [false, false]); const sn = noIcpt.t.events.at(-1).stats.filter((s) => s.k === 'stl'); assert.equal(sn.length, 1); assert.equal(sn[0].p, noIcpt.t.events.at(-1).effects.recupera); assert.equal(sn[0].contacto, 'recogida controlada'); assert.equal(sn[0].team, 1); assert.ok(noIcpt.t.events.at(-1).stats.some((s) => s.k === 'tov' && s.team === 0), 'la pérdida rival está en el mismo hecho');
  const deflect = run({ icpt: 'EQ02-J04', defend: 'EQ02-J04', stealAttempt: true }, [false, false], 'EQ02-J05'); const sd = deflect.t.events.at(-1).stats.filter((s) => s.k === 'stl'); assert.equal(sd.length, 1, 'un solo crédito por pérdida causal'); assert.equal(sd[0].p, 'EQ02-J04', 'el primer desviador, no el recuperador'); assert.equal(sd[0].contacto, 'intento de intervención'); assert.equal(deflect.t.events.at(-1).effects.recupera, 'EQ02-J05');
  const out = run({ icpt: null, defend: null, stealAttempt: null }, [true]); assert.ok(!out.t.events.at(-1).stats.some((s) => s.k === 'stl'), 'balón fuera: sin robo');
  const direct = run({ icpt: 'EQ02-J04', defend: 'EQ02-J04', stealAttempt: true }, [true]); const sx = direct.t.events.at(-1).stats.find((s) => s.k === 'stl'); assert.equal(direct.r.end, 'steal'); assert.ok(sx.fuente && sx.contacto, 'la rama de robo directo usa la misma procedencia');
  const t = scene(); assert.equal(t.liveStealCredit({ team: 1, icpt: null, attempt: null, recoverer: null, fuente: 'x' }), null, 'sin recuperador individual no se fabrica un autor');
  // en un partido natural: todo robo tiene pérdida rival en el mismo hecho, autor del equipo defensor y procedencia legible; ninguna pérdida viva con recuperador queda sin crédito
  const { res } = play(natural('EQ09', 'EQ10', 3)); let credited = 0; let liveNoCredit = 0;
  for (const e of res.events) { const stl = (e.stats ?? []).filter((s) => s.k === 'stl'); assert.ok(stl.length <= 1); for (const s of stl) { credited += 1; assert.ok(s.fuente && s.contacto, `procedencia en ${e.id}`); assert.ok((e.stats ?? []).some((x) => x.k === 'tov' && x.team !== s.team)); } if (e.effects?.perdida && e.effects?.balonVivo && e.effects.recupera && !stl.length) liveNoCredit += 1; }
  assert.ok(credited > 10); assert.equal(liveNoCredit, 0, 'ninguna pérdida viva con recuperador identificado queda sin crédito');
});

// ------------------------------------------------------------------------------------------------------------------------ 4 · salidas reales de sensibilidad (B17-02)
const PROJ = (() => { const projs = []; return () => { if (projs.length) return projs;
  for (const [a, b, seed] of [['EQ01', 'EQ02', 11], ['EQ03', 'EQ10', 12], ['EQ05', 'EQ06', 13], ['EQ09', 'EQ10', 14]]) {
    const { res } = play(natural(a, b, seed)); const keys = { batch_id: `LOT-t${seed}`, variant_id: 'V', case_id: 'C', match_id: 'M000001', attempt_id: 'M000001-A1' };
    const out = eventStreams(res, makeCtx(res, { keys, entry: null }), { level: 'diagnostic' }); const buf = Buffer.from(`${out.decisiones.join('\n')}\n`);
    projs.push(projectAttempt({ stream: (x, n) => (n === 'decisiones' ? buf : null), table: () => null }, { batch_id: keys.batch_id, match_id: keys.match_id, attempt_id: keys.attempt_id, level: 'diagnostic', valid: true, facts: {} }, profile, { sourceId: keys.batch_id }));
  }
  return projs; }; })();
test('M17B·4 sensibilidad: las 32 capacidades llegan a la salida pertinente con la función de producción; base reconstruida = base del productor dentro de su precisión; incremento efectivo 0 ⇒ cambio 0; unidades correctas', () => {
  const P = PROJ(); const sel = selectContexts(P, 8); const sens = sensitivity(sel, profile, [1, 3, 5]);
  for (const cap of CAPABILITY_IDS) { const rows = sens.filter((r) => r.cap === cap); assert.ok(rows.length <= 24, `${cap}: como máximo ocho contextos × tres incrementos`); const pert = rows.filter((r) => r.pertinente); assert.ok(pert.length > 0, `${cap} llega a una salida pertinente`); assert.ok(pert.every((r) => r.baseCoincide !== false), `${cap}: la salida base reconstruida coincide con la del productor`); assert.ok(pert.every((r) => r.salidaUnidad && r.consumidor && r.funcion)); }
  const t1 = sens.filter((r) => r.cap === 'TEC01' && r.pertinente); assert.ok(t1.every((r) => r.consumidor === 'tiro' && r.salidaUnidad === 'probabilidad (0–1)' && /^probabilidad de acierto/.test(r.salida)), 'TEC01 se contrasta con la probabilidad de acierto, no con puntos de receta');
  assert.ok(t1.some((r) => r.salidaDelta > 0), 'más capacidad de tiro de tres sube la probabilidad de acierto'); assert.ok(t1.every((r) => Math.abs(r.salidaDelta) < 1 && r.unidad.includes('receta intermedia')), 'la receta intermedia se rotula como tal y nunca como puntos porcentuales');
  const sat = sens.filter((r) => r.pertinente && r.incrementoEfectivo === 0); assert.ok(sat.length > 0, 'hay contextos naturales con la capacidad en el máximo'); assert.ok(sat.every((r) => r.salidaDelta === 0 && r.delta === 0), 'con incremento efectivo 0 el cambio es exactamente 0');
  const ctl = sens.find((r) => r.pertinente && r.consumidor === 'control'); assert.ok(Array.isArray(ctl.opciones) && ctl.opciones.length >= 2, 'una distribución conserva todas sus opciones, no solo la más probable');
  // productor y auditor comparten operación: la función pura reproduce la salida registrada con la entrada registrada
  const item = Object.values(sel).flat().find((c) => c.ops?.some((o) => o.op === 'salida:tiro' && o.refKey === 'A')); const op = item.ops.find((o) => o.op === 'salida:tiro' && o.refKey === 'A');
  assert.ok(Math.abs(shotResolution(profile, profile.shots[op.note.zona], op.note.entradas).p - op.note.salida.p) < 1e-8); const same = consumerOutput(op, profile, { delta: 0, player: item.player, valor: item.valor }); assert.equal(same.antes, same.despues);
});
test('M17B·4b funciones puras de consumo: la categoría, la calidad y la mezcla reproducen los pesos que el motor consumió', () => {
  const spec = { exec: 'dribble', off: 20, def: 17, hasOpposer: true, legalDef: 18, hasDefend: true, legalOff: null, pressureFactor: null, fpDelta: 0.01, Z: 0.1, alpha: 0.18 }; const r = categoryResolution(profile, spec); assert.ok(Math.abs(Object.values(r.final).reduce((a, b) => a + b, 0) - 1) < 1e-12); assert.ok(categoryResolution(profile, { ...spec, off: 22 }).final.turnover < r.final.turnover, 'mejor manejo: menos pérdida');
  const q = qualityResolution(profile, { ca: 20, cd: 16, kctx: 0, hasOpposition: true, noForced: false, extraZ: 0, Z: null, alpha: null }); assert.ok(q.final.comfortable > qualityResolution(profile, { ca: 20, cd: 19, kctx: 0, hasOpposition: true, noForced: false, extraZ: 0, Z: null, alpha: null }).final.comfortable);
  const mix = mixResolution([{ key: 'a', pref: 1, adapt: 1, coach: null }, { key: 'b', pref: 3, adapt: 1, coach: null }], { L: 0.5, q: 0.4, tilt: 0, cf: 1 }); assert.ok(mix[1].w > mix[0].w);
});

// ------------------------------------------------------------------------------------------------------------------------ 5 · neutralidad e instancias
test('M17B·5 neutralidad: el deporte de referencia es el de MOTOR-17 (83–98, 6.684 sorteos); la extracción de salidas no altera hechos ni sorteos; las copias de un equipo siguen siendo instancias distintas', () => {
  const ref = JSON.parse(readFileSync(new URL('./fixtures/baseline-motor17b.json', import.meta.url), 'utf8'))['20261016'];
  assert.deepEqual([ref.score, ref.periodScores, ref.draws], [ref.previousMotor17.score, ref.previousMotor17.periodScores, ref.previousMotor17.draws], 'mismo marcador, parciales y sorteos que MOTOR-17');
  assert.notEqual(ref.trajectorySha256, ref.previousMotor17.trajectorySha256, 'la huella cambia solo por el crédito (la trayectoria incluye las estadísticas)');
  // registro completo, reducido y mínimo: mismo deporte, hechos y sorteos (la instrumentación `salida:*` es solo de lectura)
  const input = natural('EQ05', 'EQ06', 21); const full = play(input, 'full'); const min = play(input, 'minimal');
  assert.equal(full.m.rng.count, min.m.rng.count); assert.deepEqual(full.res.score, min.res.score); assert.deepEqual(full.res.events.map(strip), min.res.events.map(strip));
  // quitar el crédito no cambia nada más (el mismo criterio que MOTOR-17, ahora con recogida sin interceptor)
  const orig = MatchCore.prototype.liveStealCredit; MatchCore.prototype.liveStealCredit = () => null; let none; try { none = play(input, 'minimal'); } finally { MatchCore.prototype.liveStealCredit = orig; }
  assert.equal(none.m.rng.count, min.m.rng.count); assert.deepEqual(none.res.events.map(strip), min.res.events.map(strip)); assert.deepEqual(none.res.score, min.res.score);
  const a = referenceTeam(profile, players, 'EQ01'); const b = retargetTeam(referenceTeam(profile, players, 'EQ01'), 'EQ01B'); const { res } = play({ schema: INPUT_SCHEMA, seed: 5, importance: 'ordinary', teams: [a, b] }, 'minimal');
  const e = buildEssential(res, { keys: {}, validity: { valid: true, reasons: [], reconciliation_ok: true, analysis_ok: true, mode: 'full' }, fp: null, fpMode: 'none', sim: null }); assert.equal(new Set(e.acta.players.map((p) => p.id)).size, 24); assert.ok(e.acta.players.every((p) => p.team_index === 0 || p.team_index === 1));
});

test('M17B·4c pickProbabilities: la probabilidad que registra el productor es la del sorteo ponderado (solo w > 0, orden estable por clave)', () => {
  const m = createMatch(natural('EQ01', 'EQ02', 3), profile, { detail: 'full' }); m.init();
  const items = [{ key: 'B', w: 3 }, { key: 'A', w: 1 }, { key: 'C', w: 0 }, { key: 'D', w: 6 }]; m.calcBuf.length = 0; m.pick(items, 'prueba');
  const note = m.calcBuf.find((c) => c.label === 'sorteo:prueba'); const p = pickProbabilities(items);
  assert.deepEqual(Object.keys(p), ['A', 'B', 'D'], 'sin la opción de peso 0 y por clave'); assert.ok(Math.abs(Object.values(p).reduce((a, b) => a + b, 0) - 1) < 1e-12);
  for (const o of note.opciones) assert.equal(o.p, Math.round(p[o.clave] * 1e4) / 1e4, `${o.clave}: lo registrado por el sorteo es la misma probabilidad`);
});

// ------------------------------------------------------------------------------------------------------------------------ 6 · contrato de cierre y descargas (B17-05)
test('M17B·6 Cierre: las descargas vigentes son las de MOTOR-17B y no se fabrica ninguna; lo no generado se declara con su comando; el recibo de verificación va fuera de los ZIP y los nombres no permiten salir de la carpeta', async () => {
  const { ClosureService } = await import('../src/batch/closure-api.js'); const { createHash } = await import('node:crypto'); const root = mkdtempSync(join(tmpdir(), 'bem-m17b-cierre-')); const m17 = mkdtempSync(join(tmpdir(), 'bem-m17-old-'));
  const svc = new ClosureService({ root, m17, m16: join(root, 'x16'), m15b: join(root, 'x15b'), historic: join(root, 'x15'), summary: join(root, 'cierre.json') });
  const names = (f) => f.map((x) => x.name);
  const empty = svc.files(); assert.deepEqual(names(empty).slice(0, 3).sort(), ['MOTOR-17B-indice-partes.json', 'MOTOR-17B-revision-rapida.zip', 'MOTOR-17B-verificacion-final.json']); assert.ok(empty.every((f) => f.available === false && f.command && f.url === null), 'con la carpeta vacía nada está disponible: se dice qué comando lo genera');
  writeFileSync(join(root, 'MOTOR-17B-revision-rapida.zip'), 'zip-falso'); writeFileSync(join(root, 'MOTOR-17B-indice-partes.json'), '{}'); writeFileSync(join(root, 'MOTOR-17B-evidencia-detallada-parte-01-de-02.zip'), 'p1'); writeFileSync(join(m17, 'MOTOR-17-revision-rapida.zip'), 'viejo');
  const ready = svc.files(); const rapido = ready.find((f) => f.name === 'MOTOR-17B-revision-rapida.zip'); assert.equal(rapido.available, true); assert.equal(rapido.sha256, createHash('sha256').update('zip-falso').digest('hex')); assert.equal(rapido.url, '/api/closure/download/MOTOR-17B-revision-rapida.zip'); assert.equal(rapido.historic, false);
  assert.equal(ready.find((f) => f.name === 'MOTOR-17B-verificacion-final.json').available, false, 'el recibo no existe hasta que el comprobador lo escribe');
  const old = ready.find((f) => f.name === 'MOTOR-17-revision-rapida.zip'); assert.ok(old && old.historic === true, 'los paquetes de MOTOR-17 pasan a histórico');
  const call = (path) => { let out = { code: null, body: '' }; svc.handle({ method: 'GET' }, { writeHead: (c) => { out.code = c; }, end: (b) => { out.body = b; }, on() {}, once() {}, emit() {} }, path); return new Promise((r) => setTimeout(() => r(out), 30)); };
  assert.equal((await call('/api/closure/download/MOTOR-17B-verificacion-final.json')).code, 404); assert.equal((await call('/api/closure/download/..%2F..%2Fpackage.json')).code, 404); assert.equal((await call('/api/closure/download/otro-archivo.zip')).code, 404);
});
