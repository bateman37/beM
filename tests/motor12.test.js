// MOTOR-12: lotes y extracción completa. Diez grupos pequeños; cada uno protege un riesgo material (agenda ambigua, semillas que se desplazan, estados arrastrados, detener que pierde confirmados,
// un fallo convertido en derrota, agregados que mezclan universos, un diagnóstico que cambia el deporte, ZIP que solo «se abre», un comprobador que solo mira la sintaxis, permisos, reproducción).
// Un único lote real de diagnóstico completo (1 caso × 2 variantes = 2 encuentros) se REUTILIZA en todos los grupos que lo necesitan; los estados de trabajo y los errores usan un ejecutor de prueba
// (sus resultados son sintéticos y no se presentan como partidos deportivos reales). No se ejecutan lotes de 100 o 1.000.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { data } from './helpers.js';
import * as P from '../src/population/index.js';
import { runMatch, buildMatchInput } from '../src/match/index.js';
import { replayMatch, sportsProjection } from '../src/match/replay.js';
import { reconcileAnalysis } from '../src/analysis/reconcile.js';
import { deriveCaseSeeds } from '../src/batch/seeds.js';
import { prepareBatch, planCounts, normalizeSpec, buildAgenda } from '../src/batch/schedule.js';
import { JobStore, loadFrozen } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { InlineExecutor } from '../src/batch/executors.js';
import { aggregate, compare } from '../src/batch/aggregate.js';
import { describe, quantileSorted, stdSample, parseCsv, csvCell, toCsv } from '../src/batch/util.js';
import { buildPackage } from '../src/batch/package.js';
import { verifySet, DirProvider, ZipProvider, MemProvider, verifyTarget } from '../src/batch/check.js';
import { openZip, closeZips, ZipWriter } from '../src/batch/zip.js';
import { trajectoryFingerprint, profileSportFingerprint, profileFingerprint } from '../src/batch/fingerprint.js';
import { defaultSimulate, executeAttempt } from '../src/batch/attempt.js';
import { TABLES, tableAudience } from '../src/batch/schema.js';
import { APP_VERSION } from '../src/version.js';
import { checkMotor12 } from '../scripts/check-data.js';
import { validateProfile } from '../src/profiles/validate.js';
import { buildRows, uncoveredLeaves } from '../src/profiles/rows.js';
import { deepCopy } from '../src/match/index.js';

const { profile, players } = data;
const root = mkdtempSync(join(tmpdir(), 'bem-m12-'));
const teams = Object.fromEntries(['EQ03', 'EQ09', 'EQ04'].map((id) => [id, P.referenceTeam(profile, players, id)]));
const PLUS3 = { op: 'ability', team: '*', player: 'director', attrs: ['TEC08'], delta: 3 };
const baseSpec = (over = {}) => ({ mode: 'repeat', teamIds: ['EQ03', 'EQ09'], repetitions: 1, venue: 'fixed', batchSeed: 20261017, teams, recordLevel: 'diagnostic', variants: [{ id: 'V0', label: 'Base' }, { id: 'V1', label: '+3 Pase', ops: [PLUS3] }], ...over });
const mkCtl = (name, opts = {}) => { const store = new JobStore(join(root, name)); return { store, ctl: new BatchController({ store, executor: opts.executor ?? new InlineExecutor({ store, simulate: opts.simulate }) }) }; };
let F; // lote real compartido
const sha = (b) => createHash('sha256').update(b).digest('hex');
const unzipTo = (zip, dir) => { const z = openZip(zip); for (const n of z.names) { const p = join(dir, n); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, z.read(n)); } closeZips(); };

before(async () => {
  const { store, ctl } = mkCtl('real'); const cr = ctl.create(baseSpec(), profile, { players, label: 'prueba' }); assert.ok(cr.ok, JSON.stringify(cr.problems));
  const run = await ctl.run(cr.batchId); await run.done; F = { store, ctl, id: cr.batchId, snap: ctl.snapshot(cr.batchId) };
});
after(() => { closeZips(); rmSync(root, { recursive: true, force: true }); });

// ---------------------------------------------------------------------------------------------------------------------------------------------
test('1. agenda: cantidades inequívocas, localía, semillas derivadas por adelantado y variantes que comparten la semilla del caso', () => {
  const twelve = Object.fromEntries(P.REFERENCE_IDS.map((id) => [id, P.referenceTeam(profile, players, id)]));
  const c = planCounts(normalizeSpec({ mode: 'cross', teamIds: P.REFERENCE_IDS, venue: 'home_away', repetitions: 1, teams: twelve, variants: [{ id: 'V0' }, { id: 'V1' }] }, profile));
  assert.deepEqual([c.teams, c.pairs, c.cases, c.executions], [12, 66, 132, 264]); assert.match(c.explain, /264 ejecuciones totales/);
  const prep = prepareBatch({ mode: 'cross', teamIds: ['EQ03', 'EQ09', 'EQ04'], venue: 'home_away', repetitions: 2, teams, variants: [{ id: 'V0' }, { id: 'V1', ops: [PLUS3] }] }, profile, { players });
  assert.ok(prep.ok); const ag = prep.agenda; assert.equal(ag.cases.length, 3 * 2 * 2); assert.equal(ag.executions.length, 24);
  assert.deepEqual(ag.executions.slice(0, 2).map((e) => [e.case_id, e.variant_id, e.seed === ag.cases[0].seed]), [['C000001', 'V0', true], ['C000001', 'V1', true]], 'las variantes de un caso comparten semilla; orden estable por par, repetición, lado y variante');
  assert.equal(new Set(ag.cases.map((x) => x.seed)).size, ag.cases.length, 'semillas distintas entre casos');
  assert.deepEqual(ag.cases.slice(0, 2).map((x) => x.side), ['ida', 'vuelta']); assert.equal(ag.cases[1].home_ref, ag.cases[0].away_ref);
  // la lista no se desplaza al pedir más casos (detener/reanudar no cambia semillas) y es reproducible sin reloj
  const a = deriveCaseSeeds({ batchSeed: 5, count: 50, rngConfig: profile.rng, lotVersion: 'X' }); const b = deriveCaseSeeds({ batchSeed: 5, count: 80, rngConfig: profile.rng, lotVersion: 'X' });
  assert.deepEqual(a.seeds, b.seeds.slice(0, 50)); assert.notDeepEqual(a.seeds, deriveCaseSeeds({ batchSeed: 6, count: 50, rngConfig: profile.rng, lotVersion: 'X' }).seeds);
  assert.equal(deriveCaseSeeds({ batchSeed: 1, count: 3000, rngConfig: profile.rng, lotVersion: 'X' }).seeds.length, 3000);
  // un caso inválido no se convierte en partido jugado ni se corrige en silencio; el equipo contra sí mismo es explícito y sus instancias no colisionan
  assert.equal(prepareBatch(baseSpec({ teamIds: ['EQ03', 'EQ03'] }), profile, { players }).ok, false);
  const self = prepareBatch(baseSpec({ teamIds: ['EQ04', 'EQ04'], selfPlay: true, teams }), profile, { players }); assert.ok(self.ok);
  const e = [...self.entries.values()][0].input.teams.map((t) => t.id); assert.deepEqual(e, ['EQ04', 'EQ04_B']); assert.ok(new Set([...[...self.entries.values()][0].input.teams.flatMap((t) => t.players.map((p) => p.id))]).size === 24);
  const bad = prepareBatch(baseSpec({ repetitions: 100000 }), profile, { players }); assert.equal(bad.ok, false); assert.match(bad.problems[0], /límite técnico/);
  void buildAgenda;
});

test('2. snapshot congelado: inmune a editar después y cada partido empieza limpio (la misma entrada da la misma trayectoria tras otro partido)', async () => {
  const { id, store } = F; const lote = store.readJson(id, 'entradas/lote.json'); assert.ok(lote.profile.profile_id && lote.entries.length === 2);
  teams.EQ03.players[0].abilities.TEC01 = 1; teams.EQ03.plan.styles.organizedPace = 1; // edición posterior de la plantilla fuente: el lote no la ve
  const fz = loadFrozen(store, id); const ex = fz.lote.agenda[0]; const input = fz.inputFor(fz.entryOf(ex), ex.seed); assert.notEqual(input.teams[0].players[0].abilities.TEC01, 1); assert.equal(input.teams[0].plan.styles.organizedPace, P.referenceTeam(profile, players, 'EQ03').plan.styles.organizedPace);
  teams.EQ03 = P.referenceTeam(profile, players, 'EQ03');
  // sin arrastre: ejecutar M2 y luego volver a ejecutar M1 desde su entrada congelada reproduce la huella de trayectoria registrada
  const rec = F.snap.info.get('M000001').canonical.facts.trajectory_fp; const again = defaultSimulate(input, fz.profile, { level: 'reduced', planned: [] }).res;
  assert.equal(trajectoryFingerprint(again), rec); assert.deepEqual(again.score, [F.snap.info.get('M000001').canonical.facts.score_home, F.snap.info.get('M000001').canonical.facts.score_away]);
  assert.ok(Object.values(input.teams.flatMap((t) => t.players)).every((p) => p.state.energy === 100 && p.state.fouls === 0), 'estados iniciales limpios por partido');
});

// ---------------------------------------------------------------------------------------------------------------------------------------------
// Ejecutor de prueba (resultados SINTÉTICOS, no son partidos deportivos): permite estados de trabajo, detención, interrupción y errores sin simular.
class FakeExecutor {
  constructor({ failMatches = new Set(), onRun = null } = {}) { this.failMatches = failMatches; this.onRun = onRun; this.ran = []; }
  async run(task) {
    this.ran.push(`${task.ex.match_id}:${task.attemptId}`); await this.onRun?.(task); const fail = this.failMatches.has(task.ex.match_id) && task.attemptNo === 1;
    return { attempt_id: task.attemptId, match_id: task.ex.match_id, attempt_no: task.attemptNo, exec_state: fail ? 'fallida' : 'terminada', sporting_status: fail ? 'error' : 'finished', valid: !fail, exclusion_reason: fail ? 'simulacion: fallo preparado de prueba' : '', started_at: 1, finished_at: 2, exec_ms: 10, record_level: 'diagnostic', error: fail ? { phase: 'simulacion', message: 'fallo preparado de prueba' } : null, last_event_id: fail ? 'E0007' : null, last_sequence: fail ? 7 : null, facts: fail ? {} : { score_home: 80, score_away: 70, draws: 1000 }, files: [], counts: {} };
  }
  async close() {}
}
const bigSpec = () => baseSpec({ mode: 'cross', teamIds: ['EQ03', 'EQ09', 'EQ04'], repetitions: 2, recordLevel: 'diagnostic' });

test('3. detener tras el actual y continuar sin duplicar confirmados, con las mismas semillas; un proceso interrumpido se distingue y se repite desde el inicio con nuevo intento', async () => {
  const store = new JobStore(join(root, 'stop')); const fake = new FakeExecutor(); const ctl = new BatchController({ store, executor: fake });
  fake.onRun = async (t) => { if (t.ex.ordinal === 3) ctl.requestStop(cr.batchId); };
  const cr = ctl.create(bigSpec(), profile, { players }); assert.ok(cr.ok); assert.equal(cr.counts.executions, 12);
  const seeds = store.readJson(cr.batchId, 'entradas/lote.json').agenda.map((a) => a.seed);
  const r1 = await (await ctl.run(cr.batchId)).done; assert.equal(r1.state, 'detenido');
  let st = ctl.status(cr.batchId); assert.deepEqual([st.counters.terminados, st.counters.pendientes, st.counters.reconciled], [3, 9, true], 'el partido en curso terminó y se conservó; la agenda pendiente se mantiene');
  fake.onRun = null; const r2 = await (await ctl.run(cr.batchId)).done; assert.equal(r2.state, 'completado'); st = ctl.status(cr.batchId); assert.equal(st.counters.terminados, 12);
  assert.equal(new Set(fake.ran).size, 12, 'ningún confirmado se repitió al continuar'); assert.deepEqual(store.readJson(cr.batchId, 'entradas/lote.json').agenda.map((a) => a.seed), seeds);
  // interrupción de proceso: un intento iniciado sin confirmar queda «interrumpida» al recuperar y se repite desde su inicio con la misma semilla y un nuevo intento
  const cr2 = ctl.create({ ...bigSpec(), repetitions: 1 }, profile, { players }); store.writeJob(cr2.batchId, { ...store.readJob(cr2.batchId), state: 'ejecutandose', timing: { started_at: Date.now() - 50, elapsed_ms: 0 } });
  store.appendIndex(cr2.batchId, { type: 'attempt_started', match_id: 'M000001', attempt_id: 'M000001-A1', attempt_no: 1, started_at: 1 });
  const rec = ctl.recover(); assert.equal(rec.find((x) => x.id === cr2.batchId).marked, 1); let s2 = ctl.status(cr2.batchId, { rows: true }); assert.equal(s2.state, 'interrumpido'); assert.equal(s2.matches[0].exec_state, 'interrumpida'); assert.equal(s2.counters.interrumpidos, 1);
  fake.ran.length = 0; await (await ctl.run(cr2.batchId)).done; s2 = ctl.status(cr2.batchId, { rows: true }); assert.equal(s2.counters.terminados, s2.counters.solicitados); assert.ok(fake.ran.includes('M000001:M000001-A2'));
  assert.equal(s2.matches[0].attempts, 2, 'se conservan los dos intentos'); assert.equal(s2.matches[0].seed, store.readJson(cr2.batchId, 'entradas/lote.json').agenda[0].seed);
  // una versión distinta del motor bloquea la continuación (no se mezclan versiones)
  const j = store.readJob(cr2.batchId); j.state = 'detenido'; j.versions = { ...j.versions, engine: 'beM-motor-0.0.0-OTRA' }; store.writeJob(cr2.batchId, j); const blocked = await ctl.run(cr2.batchId); assert.equal(blocked.ok, false); assert.match(blocked.reason, /no se mezclan versiones/);
});

test('4. un fallo se identifica sin resultado ficticio, se excluye de los agregados y su reintento no duplica la muestra', async () => {
  const store = new JobStore(join(root, 'fail')); const fake = new FakeExecutor({ failMatches: new Set(['M000002']) }); const ctl = new BatchController({ store, executor: fake });
  const cr = ctl.create(baseSpec({ repetitions: 2 }), profile, { players }); const end = await (await ctl.run(cr.batchId)).done; assert.equal(end.state, 'completado'); let st = ctl.status(cr.batchId, { rows: true });
  assert.deepEqual([st.counters.fallidos, st.counters.terminados, st.counters.reconciled], [1, 3, true]); const bad = st.matches.find((m) => m.match_id === 'M000002'); assert.equal(bad.exec_state, 'fallida'); assert.equal(bad.facts.score_home, undefined, 'sin marcador ni derrota inventados'); assert.equal(bad.valid, false);
  const r = ctl.retry(cr.batchId, ['M000002']); assert.ok(r.ok); await (await ctl.run(cr.batchId)).done; st = ctl.status(cr.batchId, { rows: true }); const m2 = st.matches.find((m) => m.match_id === 'M000002');
  assert.deepEqual([m2.exec_state, m2.attempts, st.counters.terminados, st.counters.fallidos, st.counters.reintentados], ['terminada', 2, 4, 0, 1], 'el reintento sustituye a la salida canónica y no cuenta como otra muestra'); assert.equal(m2.seed, store.readJson(cr.batchId, 'entradas/lote.json').agenda[1].seed, 'el reintento usa la misma semilla (no se busca otra hasta que salga bien)');
  assert.equal(ctl.retry(cr.batchId, ['M000001']).ok, false, 'solo se reintentan fallidas o interrumpidas');
  // fallo real de preparación del intento (motor real, sin partido): se conserva el error y NO hay marcador
  const { store: s2, ctl: c2 } = mkCtl('failreal', { simulate: () => ({ res: null, error: { phase: 'preparacion', message: 'entrada rechazada (prueba)' }, scheduledLog: [] }) });
  const cr2 = c2.create(baseSpec({ variants: [{ id: 'V0' }] }), profile, { players }); await (await c2.run(cr2.batchId)).done; const m = c2.status(cr2.batchId, { rows: true }).matches[0]; assert.equal(m.exec_state, 'fallida'); assert.equal(m.error.phase, 'preparacion'); assert.deepEqual(m.facts, {}); void s2;
});

test('5. agregados: tasa ponderada ≠ media de porcentajes, cuantiles/desviación con n=0/1, no calculables sin ceros y pares incompletos fuera de la comparación', () => {
  assert.deepEqual([quantileSorted([], 0.5), stdSample([1]), stdSample([]), quantileSorted([7], 0.95)], [null, null, null, 7]); assert.equal(quantileSorted([1, 2, 3, 4], 0.5), 2.5); assert.ok(Math.abs(quantileSorted([10, 20, 30, 40, 50], 0.05) - 12) < 1e-12); assert.ok(Math.abs(stdSample([2, 4, 4, 4, 5, 5, 7, 9]) - 2.138089935) < 1e-8);
  const d = describe([1, 2, 3, null, NaN, 4]); assert.equal(d.n, 4);
  const mk = (mid, cs, v, valid = true, state = 'terminada') => ({ match_id: mid, variant_id: v, case_id: cs, pair_id: 'A-B', home_team_instance_id: 'A', away_team_instance_id: 'B', home_source_team_id: 'A', away_source_team_id: 'B', exec_state: state, valid });
  const execs = [mk('M1', 'C1', 'V0'), mk('M2', 'C1', 'V1'), mk('M3', 'C2', 'V0'), mk('M4', 'C2', 'V1', false, 'fallida'), mk('M5', 'C3', 'V0', true, 'pendiente')];
  const T = (m, side, pts, opp) => ({ match_id: m, team_index: String(side), pts: String(pts), pts_against: String(opp), win: pts === opp ? '' : String(pts > opp ? 1 : 0) });
  const teamRows = [T('M1', 0, 90, 80), T('M1', 1, 80, 90), T('M2', 0, 100, 95), T('M2', 1, 95, 100), T('M3', 0, 70, 75), T('M3', 1, 75, 70)];
  const I = (m, inst, num, den) => ({ match_id: m, team_instance_id: inst, indicator_id: 'T3_PCT', label: 'T3 %', group: 'Tiro', value: den ? String((100 * num) / den) : '', num: String(num), den: String(den), unit: '%', coverage: 'disponible', status: den ? 'ok' : 'no_calculable', sample_n: String(den) });
  const indRows = [I('M1', 'A', 1, 10), I('M1', 'B', 5, 10), I('M2', 'A', 4, 8), I('M2', 'B', 1, 4), I('M3', 'A', 0, 0), I('M3', 'B', 3, 6)];
  const ag = aggregate({ batchId: 'T', execs, teamRows, indRows });
  const g = ag.indicadores.find((r) => r.group_type === 'equipo' && r.variant_id === 'V0' && r.source_team_id === 'A' && r.indicator_id === 'T3_PCT');
  assert.equal(g.n_requested, 3); assert.equal(g.n_valid, 2); assert.equal(g.n_excl_pending, 1); assert.equal(g.n_eligible, 1, 'el partido sin intentos (den 0) no es un cero: queda sin exposición'); assert.equal(g.n_excl_no_exposure, 1);
  const pool = ag.indicadores.find((r) => r.group_type === 'variante' && r.variant_id === 'V1' && r.indicator_id === 'T3_PCT'); assert.equal(pool.n_excl_failed, 2, 'el fallido cuenta sus dos equipos-partido fuera'); assert.ok(Math.abs(pool.pooled_value - (100 * 5) / 12) < 1e-9, 'Σnum/Σden = 5/12 ≈ 41,67 %'); assert.ok(Math.abs(pool.pooled_value - (50 + 25) / 2) > 1, 'no es la media simple de los porcentajes de partido (37,5 %)'); const dsc = ag.distribuciones.find((r) => r.group_type === 'variante' && r.variant_id === 'V0' && r.indicator_id === 'T3_PCT'); assert.equal(dsc.n, 3);
  const win = ag.indicadores.find((r) => r.group_type === 'equipo' && r.variant_id === 'V0' && r.source_team_id === 'A' && r.indicator_id === 'RES_WIN'); assert.deepEqual([win.numerator_sum, win.denominator_sum], [1, 2]);
  const cmp = compare({ batchId: 'T', execs, teamRows, indRows, baseVariant: 'V0', candVariants: ['V1'] }).find((r) => r.group_type === 'variante' && r.indicator_id === 'T3_PCT');
  assert.equal(cmp.n_cases_total, 6); assert.equal(cmp.n_cases_paired, 2, 'solo el caso C1 tiene las dos variantes válidas (×2 equipos)'); assert.equal(cmp.n_cases_incomplete, 4); assert.equal(cmp.n_valid_base_only, 2);
  assert.notEqual(cmp.diff_of_rates, cmp.mean_case_diff, 'diferencia de tasas agregadas y media de diferencias por caso son medidas distintas');
});

test('6. registro completo, reducido y prosa conservan el mismo deporte y el mismo RNG; las trazas contienen operaciones, contribuciones y sorteos reales, no solo cabeceras', async () => {
  const { store, id } = F; const info = F.snap.info.get('M000001'); const a = info.canonical; const dir = store.attemptDir(id, 'M000001', a.attempt_id);
  const dec = readFileSync(join(dir, `decisiones/decisiones-M000001--${a.attempt_id}.jsonl`), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); const dr = readFileSync(join(dir, `decisiones/sorteos-M000001--${a.attempt_id}.jsonl`), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const rec = dec.filter((d) => d.kind === 'receta'); assert.ok(rec.length > 1000 && rec[0].data.terminos[0].base != null && rec[0].data.terminos[0].efectiva != null && rec[0].data.terminos[0].peso != null, 'recetas con capacidad base, efectiva y peso');
  assert.ok(dec.some((d) => d.kind === 'distribucion' && d.data.opciones.length > 1 && d.draw_index != null), 'distribuciones completas con su sorteo'); assert.ok(dec.some((d) => d.record_type === 'parametros' && d.rows.length) && dec.some((d) => d.record_type === 'entrenador' || d.record_type === 'oportunidad'));
  assert.equal(dr.length, a.facts.draws); assert.ok(dr.filter((d) => d.decision_id).length / dr.length > 0.5 && dr.every((d) => d.u >= 0 && d.u < 1)); assert.ok(readFileSync(join(dir, 'tablas/capacidades-uso.csv.part'), 'utf8').length > 1000);
  // mismo deporte: marcador, sorteos y huella de trayectoria idénticos con registro completo, reducido y con prosa; la prosa y el nivel solo cambian lo que se conserva
  const fz = loadFrozen(store, id); const ex = fz.lote.agenda[0]; const input = fz.inputFor(fz.entryOf(ex), ex.seed);
  const full = defaultSimulate(input, fz.profile, { level: 'diagnostic', planned: [] }).res; const red = defaultSimulate(input, fz.profile, { level: 'reduced', planned: [] }).res;
  assert.deepEqual([full.score, full.diagnostics.sportingDraws], [red.score, red.diagnostics.sportingDraws]); assert.equal(trajectoryFingerprint(full), trajectoryFingerprint(red)); assert.equal(trajectoryFingerprint(full), a.facts.trajectory_fp);
  assert.ok(full.events.some((e) => e.calc?.length) && !red.events.some((e) => e.calc?.length), 'el nivel solo cambia lo que se conserva');
  // intento completo con nivel reducido y prosa incluida: mismos hechos y sorteos, un relato más, y la huella de trayectoria registrada por el lote
  const out = executeAttempt({ frozen: fz, ex, attemptNo: 1, attemptId: 'PRUEBA-A1', outDir: join(root, 'prose-attempt'), level: 'reduced', prose: 'included' });
  assert.equal(out.facts.trajectory_fp, a.facts.trajectory_fp); assert.equal(out.facts.draws, a.facts.draws); assert.ok(out.files.some((f) => f.path.startsWith('relato/')) && out.files.some((f) => f.path.startsWith('eventos/')) && out.files.find((f) => f.table === 'capacidades-uso').records === 0, 'prosa añadida; sin recetas (ni uso de capacidades) en el nivel reducido: la tabla queda sin observaciones, declarada en la cobertura');
  assert.match(readFileSync(join(root, 'prose-attempt', out.files.find((f) => f.path.startsWith('relato/')).path), 'utf8'), /Periodo 1/);
  const ref = JSON.parse(readFileSync(new URL('./fixtures/baseline-motor12.json', import.meta.url), 'utf8'))['20261016']; const r0 = runMatch(buildMatchInput(profile, players, { seed: 20261016 }), profile, { detail: 'minimal' });
  assert.deepEqual([r0.score, r0.diagnostics.sportingDraws, trajectoryFingerprint(r0)], [ref.score, ref.draws, ref.trajectorySha256], 'referencia 20261016 = 83–103 con 6.505 sorteos'); assert.deepEqual(ref.score, [83, 103]); assert.equal(ref.draws, 6505);
});

let SINGLE; // paquete único construido una vez
test('7. ZIP y partes: parseables, hashes/conteos/referencias correctos, sin duplicar partidos; dos partes con índice; un partido mayor que el objetivo se fragmenta con cobertura explícita', async () => {
  const { ctl, id } = F; SINGLE = await buildPackage(ctl, id, { partTargetMiB: 128 }); assert.equal(SINGLE.kind, 'single'); assert.equal(SINGLE.scope, 'lote'); assert.ok(SINGLE.verified);
  const zp = SINGLE.packages[0].path; const z = openZip(zp); for (const need of ['README.md', 'manifest.json', 'diccionario.json', 'diccionario.md', 'resumen.md', 'entradas/lote.json', 'entradas/variantes.json', 'estadisticas/partidos.csv', 'estadisticas/tiros.csv', 'agregados/indicadores.csv', 'agregados/comparaciones.csv', 'auditoria/validaciones.jsonl', 'auditoria/cobertura.csv', 'auditoria/rendimiento.csv']) assert.ok(z.names.includes(need), `falta ${need}`);
  const man = JSON.parse(z.read('manifest.json')); closeZips(); assert.equal(man.identity.package_schema, 'beM-analysis-package/1'); assert.equal(man.counts.terminados, 2); assert.ok(man.files.every((f) => /^[0-9a-f]{64}$/.test(f.sha256) && f.bytes >= 0) && man.state.integrity_verified);
  assert.ok(man.files.some((f) => f.path.startsWith('decisiones/sorteos-')) && man.files.some((f) => f.path.startsWith('eventos/eventos-')));
  const ok = verifyTarget(zp); assert.ok(ok.ok, ok.problems.join(' | ')); for (const c of ok.checks) assert.notEqual(c.status, 'fail', c.id);
  // dos partes + índice (objetivo técnico pequeño solo para la comprobación); cada partido en exactamente una parte
  const MiB = 1048576; const oneMatch = F.snap.info.get('M000001').canonical.files.reduce((n, f) => n + f.bytes, 0); const t2 = Math.ceil((oneMatch * 1.25 + 3 * MiB) / MiB);
  const two = await buildPackage(ctl, id, { partTargetMiB: t2 }); assert.equal(two.kind, 'multi'); assert.equal(two.parts.length, 2); assert.equal(two.packages.length, 3);
  const idx = new ZipProvider(two.index.path); const im = JSON.parse(idx.read('indice.json')); idx.close(); assert.equal(im.n_parts, 2); assert.ok(im.parts.every((p) => /^[0-9a-f]{64}$/.test(p.sha256) && p.matches.length === 1)); assert.equal(new Set(im.parts.flatMap((p) => p.matches.map((m) => m.match_id))).size, 2);
  const v2 = verifyTarget(two.outDir); assert.ok(v2.ok, v2.problems.join(' | ')); assert.ok(v2.checks.find((c) => c.id === 'V02b').status === 'pass');
  // fragmento excepcional: un solo partido mayor que el objetivo
  const frag = await buildPackage(ctl, id, { partTargetMiB: Math.ceil(oneMatch / MiB / 2.6 + 2.6), matchIds: ['M000001'] }); assert.equal(frag.kind, 'multi'); assert.ok(frag.parts.length >= 3, 'el partido se fragmenta por secuencia'); assert.ok(frag.parts.every((p) => p.fragment && p.fragment.total === frag.parts.length));
  const fm = frag.parts.map((p) => { const zz = new ZipProvider(frag.packages.find((q) => q.name === p.file).path); const m = JSON.parse(zz.read('manifest.json')); zz.close(); return m; });
  assert.ok(fm[0].partition.fragments[0].fragment_index === 1 && fm[1].partition.fragments[0].depends_on.length > 0, 'los fragmentos declaran sus dependencias'); assert.ok(fm[1].files.every((f) => f.path !== 'estadisticas/partidos.csv' || f.records === 0), 'el acta y el partido canónico se cuentan una vez (fragmento 1)');
  const seqs = fm.map((m) => m.files.filter((f) => f.seq_from != null)).map((fs) => [fs[0].seq_from, fs[0].seq_to]); for (let i = 1; i < seqs.length; i++) assert.equal(seqs[i][0], seqs[i - 1][1] + 1, 'límites de secuencia exactos y contiguos');
  const vf = verifyTarget(frag.outDir); assert.ok(vf.ok, vf.problems.join(' | '));
});

test('8. el comprobador detecta un archivo alterado, una referencia rota y una fila estadística duplicada (no solo errores de sintaxis)', () => {
  const dir = join(root, 'tamper'); unzipTo(SINGLE.packages[0].path, dir); const base = (() => { const r = verifySet([new DirProvider(dir)]); assert.ok(r.ok, r.problems.join('|')); return r; })(); void base;
  const man = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')); const fix = (path, text) => { writeFileSync(join(dir, path), text); const f = man.files.find((q) => q.path === path); f.bytes = Buffer.byteLength(text); f.sha256 = sha(Buffer.from(text)); writeFileSync(join(dir, 'manifest.json'), JSON.stringify(man)); };
  // 1) un byte cambiado en un archivo de datos sin actualizar el manifest → SHA-256 distinto
  const csv = readFileSync(join(dir, 'estadisticas/equipos.csv'), 'utf8'); const orig = csv; writeFileSync(join(dir, 'estadisticas/equipos.csv'), csv.replace(/,1\r\n/, ',0\r\n').replace(/,0\r\n/, ',1\r\n') === csv ? `${csv} ` : csv.replace('EQ03', 'EQ0X'));
  let r = verifySet([new DirProvider(dir)]); assert.equal(r.ok, false); assert.match(r.checks.find((c) => c.id === 'V02').detail, /discrepancia/); writeFileSync(join(dir, 'estadisticas/equipos.csv'), orig);
  // 2) fila duplicada con manifest «reparado»: parseable y con hash correcto, pero inválido
  const rows = readFileSync(join(dir, 'estadisticas/finalizaciones.csv'), 'utf8').split('\r\n').filter(Boolean); fix('estadisticas/finalizaciones.csv', `${[...rows, rows[1]].join('\r\n')}\r\n`); man.files.find((q) => q.path === 'estadisticas/finalizaciones.csv').records += 1; writeFileSync(join(dir, 'manifest.json'), JSON.stringify(man));
  r = verifySet([new DirProvider(dir)]); assert.equal(r.ok, false); assert.equal(r.checks.find((c) => c.id === 'V03').status, 'fail'); assert.equal(r.checks.find((c) => c.id === 'V02').status, 'pass', 'la sintaxis y los hashes son correctos: solo lo detectan los controles de relaciones');
  fix('estadisticas/finalizaciones.csv', `${rows.join('\r\n')}\r\n`); man.files.find((q) => q.path === 'estadisticas/finalizaciones.csv').records = rows.length - 1; writeFileSync(join(dir, 'manifest.json'), JSON.stringify(man));
  // 3) referencia rota: una posesión de un tiro que no existe
  const tiros = readFileSync(join(dir, 'estadisticas/tiros.csv'), 'utf8'); const t = parseCsv(tiros); const pi = t.header.indexOf('possession_id'); t.rows[0][pi] = 'P999'; fix('estadisticas/tiros.csv', toCsv(t.header, t.rows));
  r = verifySet([new DirProvider(dir)]); assert.equal(r.ok, false); assert.equal(r.checks.find((c) => c.id === 'V04').status, 'fail'); assert.match(r.checks.find((c) => c.id === 'V04').detail, /referencia/);
  assert.ok(typeof csvCell === 'function');
});

test('9. audiencias y huellas: el paquete se declara diagnóstico y cada archivo ≥ su contenido; una renominación decorativa del perfil no cambia la trayectoria; los tres conceptos de huella son distintos', () => {
  const man = JSON.parse(new ZipProvider(SINGLE.packages[0].path).read('manifest.json')); closeZips(); assert.equal(man.audience.package, 'diagnostic');
  assert.equal(man.files.find((f) => f.path === 'estadisticas/tiros.csv').audience, 'diagnostic'); assert.equal(tableAudience('tiros'), 'diagnostic'); assert.equal(man.files.find((f) => f.path === 'estadisticas/partidos.csv').audience, 'public');
  const readme = new ZipProvider(SINGLE.packages[0].path); assert.match(readme.read('README.md').toString(), /diagn[oó]stico/i); readme.close();
  // un manifest que rebaje la audiencia de un archivo diagnóstico es rechazado
  const dir = join(root, 'aud'); unzipTo(SINGLE.packages[0].path, dir); const m = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')); m.files.find((f) => f.path === 'estadisticas/tiros.csv').audience = 'public'; writeFileSync(join(dir, 'manifest.json'), JSON.stringify(m));
  const bad = verifySet([new DirProvider(dir)]); assert.equal(bad.checks.find((c) => c.id === 'V12').status, 'fail');
  // huellas: renombrar el perfil o cambiar una preferencia técnica no altera ni la entrada del motor ni la trayectoria; cambiar un parámetro deportivo sí
  const fz = loadFrozen(F.store, F.id); const ex = fz.lote.agenda[0]; const input = fz.inputFor(fz.entryOf(ex), ex.seed);
  const renamed = JSON.parse(JSON.stringify(fz.profile)); renamed.id = `${renamed.id}-RENOMBRADO`; renamed.effectiveId = `${renamed.effectiveId}+SEM-X`; renamed.batch.partTargetMiB = 7; renamed.extensions.push({ id: 'SEM-DECORATIVA', status: 'x', basedOn: renamed.id });
  assert.equal(profileSportFingerprint(renamed), profileSportFingerprint(fz.profile)); assert.notEqual(profileFingerprint(renamed), profileFingerprint(fz.profile));
  const a = defaultSimulate(input, fz.profile, { level: 'reduced' }).res; const b = defaultSimulate(input, renamed, { level: 'reduced' }).res;
  assert.equal(trajectoryFingerprint(a), trajectoryFingerprint(b), 'trayectoria idéntica con otro nombre de perfil'); assert.notEqual(createHash('sha256').update(JSON.stringify(sportsProjection(a))).digest('hex'), createHash('sha256').update(JSON.stringify(sportsProjection(b))).digest('hex'), 'la proyección bruta sí arrastra la identidad del perfil: por eso existe la huella de trayectoria');
  const sport = JSON.parse(JSON.stringify(fz.profile)); sport.shots.three.p0 = 0.5; assert.notEqual(profileSportFingerprint(sport), profileSportFingerprint(fz.profile));
  assert.equal(new Set([man.files[0].sha256, man.agenda.profile_id, fz.lote.agenda[0].input_id]).size, 3, 'checksum de archivo, huella de entrada y de perfil son contratos distintos');
});

test('10. abrir un partido del lote lo reproduce con su entrada efectiva y coincide con su registro; consultar/exportar no lo cambia; el 404 heredado era el favicon', async () => {
  const { store, id } = F; const exec = new InlineExecutor({ store }); const r = await exec.replay(id, 'M000002'); const rec = F.snap.info.get('M000002').canonical.facts; assert.equal(r.trajectory_fp, rec.trajectory_fp); assert.equal(r.status, 'finished');
  const file = JSON.parse(r.json); assert.deepEqual(file.score, [rec.score_home, rec.score_away]); assert.equal(file.diagnostics.sportingDraws, rec.draws); assert.equal(file.input.seed, F.snap.info.get('M000002').ex.seed);
  assert.equal(replayMatch(file).comparison.identical, true, 'el export reproducible del partido del lote se reproduce idéntico'); assert.equal(reconcileAnalysis(file).ok, true);
  const html = readFileSync(new URL('../src/lab/index.html', import.meta.url), 'utf8'); assert.match(html, /rel="icon"/, 'el favicon se declara en la propia página (sin petición 404)'); assert.equal(APP_VERSION, 'MOTOR-14');
  assert.deepEqual(checkMotor12(JSON.parse(readFileSync(new URL('../data/match/motor12-seed-extension.json', import.meta.url), 'utf8')), data.baseProfile, [data.extension, data.extension3, data.extension4, data.extension5, data.extension6, data.extension7, data.extension8, data.extension9, data.extension10, data.extension11], profile), []);
  assert.equal(JSON.stringify(Object.keys(profile.batch)), JSON.stringify(Object.keys(JSON.parse(readFileSync(new URL('../data/match/motor12-seed-extension.json', import.meta.url), 'utf8')).additions.batch)));
  void readdirSync; void existsSync; void MemProvider; void ZipWriter; void TABLES;
});

test('11. reconciliación analítica: una posesión mixta para dos quintetos no es un error (regresión de AN08 hallada por el lote de cierre)', () => {
  // EQ07–EQ08 con la semilla 1021757814 (natural, sin variante): la posesión cruza un cambio de quinteto y es mixta para el quinteto que sale y el que entra
  const A = P.instantiate(P.referenceTeam(profile, players, 'EQ07'), []); const B = P.instantiate(P.referenceTeam(profile, players, 'EQ08'), [A.id]);
  const res = runMatch({ schema: 'beM-match-input/6', seed: 1021757814, importance: 'ordinary', teams: [A, B] }, profile, { detail: 'minimal' }); assert.equal(res.status, 'finished'); assert.ok(res.reconciliation.valid);
  const rec = reconcileAnalysis(res); assert.deepEqual(rec.failed, []); assert.equal(rec.ok, true);
});

test('12. las filas sin lectura de partido (generator, analysis, batch) quedan excluidas SOLO de «consumidas por el partido»: siguen necesitando validación de datos, diccionario y cobertura', () => {
  const edit = (f) => { const p = deepCopy(profile); f(p); return p; };
  const issues = (p) => validateProfile(p, { base: profile }).issues.map((i) => i.id).join(' | ');
  assert.match(issues(edit((p) => { p.generator.coefficients.team = -1; })), /generator\.coefficients\.team/, 'una fila del generador mal formada se rechaza');
  assert.match(issues(edit((p) => { p.batch.progressIntervalMs = 0.5; })), /batch\.progressIntervalMs/, 'una fila de lotes mal formada se rechaza (entero no negativo)');
  assert.equal(prepareBatch(baseSpec({ concurrency: 2 }), profile, { players }).ok, false, 'la concurrencia distinta de 1 se rechaza al preparar el lote');
  const rows = buildRows(profile); const byId = (id) => rows.find((r) => r.id === id);
  assert.ok(byId('batch.concurrency') && byId('batch.partTargetMiB') && byId('batch.maxExecutionsPerJob') && byId('batch.repetitionShortcuts.2'), 'filas de lotes en el diccionario');
  assert.deepEqual(uncoveredLeaves(profile, rows).filter((k) => k.startsWith('batch.') || k.startsWith('generator.')), [], 'ninguna hoja de batch/generator queda sin fila ni exención declarada');
  assert.ok(rows.filter((r) => r.id.startsWith('batch.') && !Number.isNaN(Number(r.value))).every((r) => r.grp === 'LAB01' && r.required === false), 'LAB01 y no requeridas: un export anterior sin la tabla sigue siendo completo y reproducible');
  assert.equal(validateProfile(profile, { base: profile }).summary.structure, 'valida');
});
