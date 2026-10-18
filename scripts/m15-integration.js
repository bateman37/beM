// Casos de integración de MOTOR-15 (§15.1), casos normativos preparados (§5–§7) y guardados reales de verificación (§10). Reutiliza cada ejecución para acta, análisis, auditoría, exportación y continuidad.
// Salida (fuera de Git): <out>/integracion/*.json y <out>/integracion/resumen.json. Uso: node scripts/m15-integration.js [--out=out/motor15]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import * as P from '../src/population/index.js';
import { createMatch, buildResult, buildMatchInput, runMatch, ENGINE_VERSION, EXPORT_SCHEMA } from '../src/match/index.js';
import { snapshotMatch, restoreMatch } from '../src/match/snapshot.js';
import { runScripted, compareRuns } from '../src/match/equivalence.js';
import { replayMatch } from '../src/match/replay.js';
import { combineSanctions } from '../src/match/regs.js';
import { analyze } from '../src/analysis/index.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';
import { sha256 } from '../src/batch/hashing.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = join(arg('out', 'out/motor15'), 'integracion'); mkdirSync(OUT, { recursive: true });
const { profile, players } = loadData();
const team = (id) => P.referenceTeam(profile, players, id);
const inputOf = (a, b, seed) => ({ schema: 'beM-match-input/6', seed, importance: 'ordinary', teams: [P.instantiate(team(a), []), P.instantiate(team(b), [])] });
const save = (name, obj) => { const t = JSON.stringify(obj); writeFileSync(join(OUT, name), t); return { file: name, bytes: Buffer.byteLength(t, 'utf8'), sha256: sha256(t) }; };
const drive = (m) => { while (m.step()); return buildResult(m); };
const minEnergy = (res) => Math.min(...Object.values(res.diagnostics.stateSamples.flatMap((s) => Object.values(s.players).map((p) => p.e))));
const summary = { engine: ENGINE_VERSION, exportSchema: EXPORT_SCHEMA, profile: profile.effectiveId, cases: [], prepared: [], saves: [] };

// ------------------------------------------------------------------ casos de integración C15-01…06
const CASES = [
  { id: 'C15-01', desc: 'EQ01–EQ02 · referencia anterior/nueva, versiones y neutralidad', input: () => buildMatchInput(profile, players, { seed: 20261016 }) },
  { id: 'C15-02', desc: 'EQ03–EQ09 · contexto interior/defensa y tiro/interferencia', input: () => inputOf('EQ03', 'EQ09', 151002) },
  { id: 'C15-03', desc: 'EQ07–EQ08 · capacidades, estados por tramo y veterano/joven', input: () => inputOf('EQ07', 'EQ08', 151003) },
  { id: 'C15-04', desc: 'EQ11–EQ12 · rotación, reproducción y caso común del controlador', input: () => inputOf('EQ11', 'EQ12', 151004) },
  { id: 'C15-05', desc: 'copia extrema de fatiga (titulares EQ11 con energía 8, suplentes 30) · exposición a energía < 10 sin modificar la curva', input: () => { const i = inputOf('EQ11', 'EQ12', 151005); const t = i.teams[0]; const st = new Set(Object.values(t.plan.starters)); for (const p of t.players) p.state = { ...p.state, energy: st.has(p.id) ? 8 : 30 }; return i; }, extreme: true },
  { id: 'C15-06', desc: 'EQ01–EQ02 · escenario de órdenes y finales: solicitudes pendientes/aplicadas, guardar y continuar', input: () => inputOf('EQ01', 'EQ02', 151006), script: [
    { period: 1, label: 'guion P1', specs: [{ team: 0, type: 'styles', styles: { freedom: 5, organizedPace: 4 } }] },
    { period: 2, label: 'guion P2', specs: [{ team: 0, type: 'styles', styles: { offensiveRisk: 2 } }, { team: 1, type: 'priorities', priorities: { POS01: 5 } }] },
    { afterStep: 40, spec: { team: 0, type: 'styles', styles: { freedom: 2 } } }] },
];
const results = {};
for (const c of CASES) {
  const input = c.input(); const t0 = performance.now();
  const res = c.script ? runScripted(input, profile, c.script).res ?? null : null;
  let full = res; if (!full) { const m = createMatch(input, profile, { detail: 'full', check: true }); full = drive(m); }
  const red = runMatch(input, profile, { detail: 'minimal' });
  const fpFull = trajectoryFingerprint(full); const fpRed = c.script ? null : trajectoryFingerprint(red);
  const a = analyze(full, { audience: 'own', team: 0 }); const d = analyze(full, { audience: 'diagnostic' });
  const rep = c.script ? null : replayMatch(JSON.parse(JSON.stringify(full)));
  results[c.id] = full;
  const files = [save(`${c.id}-resultado.json`, full), save(`${c.id}-analisis-propio.json`, a.exportJson({ team: 0 })), save(`${c.id}-analisis-diagnostico.json`, d.exportJson({}))];
  summary.cases.push({ id: c.id, desc: c.desc, seed: input.seed, teams: full.teams.map((t) => t.id), status: full.status, score: full.score, periods: full.periodScores.map((p) => p.points), draws: full.diagnostics.sportingDraws, events: full.events.length,
    reconciliation: full.reconciliation.valid, trajectory_fp: fpFull, reduced_same_trajectory: fpRed == null ? null : fpRed === fpFull, replay_identical: rep ? rep.comparison.identical : null, min_energy: minEnergy(full), extreme: !!c.extreme,
    interference: full.diagnostics.interference, flight_crossings: full.events.filter((e) => e.effects?.vuelo?.resolucionTrasSenal).length, wall_ms: Math.round(performance.now() - t0), files });
}

// ------------------------------------------------------------------ guardados reales (§10): uno con cola de sanciones pendiente y otro en frontera de periodo; continuación enlazada
{
  const input = inputOf('EQ01', 'EQ02', 41);
  const mk = () => { const m = createMatch(input, profile, { detail: 'minimal', check: true }); for (let i = 0; i < 30 && m.step(); i++); m.requestIncident({ category: 'flagrante', player: 'EQ02-J04', fouled: 'EQ01-J03' }); m.requestIncident({ category: 'tecnica1', player: 'EQ01-J04' }); return m; };
  const a = mk(); let n = 0; while (a.step() && !(a.adminPlan && a.adminPlan.index > 0 && a.adminPlan.index < a.adminPlan.steps.length) && n++ < 40);
  const snap = JSON.parse(JSON.stringify(snapshotMatch(a, { label: 'guardado con cola de sanciones pendiente' }))); const pend = { adminPlanSteps: a.adminPlan?.steps.map((s) => s.id) ?? null, index: a.adminPlan?.index ?? null };
  const ra = drive(a); const rb = drive(restoreMatch(snap));
  summary.saves.push({ id: 'SAVE-PENDIENTE', pending: pend, continues_same: trajectoryFingerprint(ra) === trajectoryFingerprint(rb), score: [ra.score, rb.score], ft_events: [ra.events.filter((e) => e.type === 'free_throw').length, rb.events.filter((e) => e.type === 'free_throw').length], files: [save('SAVE-PENDIENTE-guardado.json', snap), save('SAVE-PENDIENTE-continuacion.json', { original: { score: ra.score, fp: trajectoryFingerprint(ra) }, restaurado: { score: rb.score, fp: trajectoryFingerprint(rb) } })] });
  const b = createMatch(inputOf('EQ03', 'EQ04', 151010), profile, { detail: 'minimal' }); while (b.step() && !(b.periodBreak != null && b.period === 2));
  const snap2 = JSON.parse(JSON.stringify(snapshotMatch(b, { label: 'guardado en frontera de periodo (final del 2.º)' }))); const rb2 = drive(restoreMatch(snap2)); const rb1 = drive(b);
  summary.saves.push({ id: 'SAVE-PERIODO', continues_same: trajectoryFingerprint(rb1) === trajectoryFingerprint(rb2), score: [rb1.score, rb2.score], files: [save('SAVE-PERIODO-guardado.json', snap2)] });
}

// ------------------------------------------------------------------ casos normativos PREPARADOS (no son ocurrencias naturales): entrada y salida reales del administrador común
const prepared = [];
const mkS = (id, t, order, category, extra = {}) => ({ id, team: t, order, category, shotAction: false, penalty: false, committer: `P${id}`, fouled: `V${id}`, ...extra });
const comb = (name, ref, sanc) => { const r = combineSanctions(profile, sanc); prepared.push({ id: name, ref, kind: 'cola de sanciones (regs.combineSanctions)', input: sanc, output: { status: r.status, steps: r.steps?.map((s) => ({ id: s.id, ft: s.ft, shooter: s.shooter, right: s.right })), compensated: r.compensated, resume: r.resume && { kind: r.resume.kind, from: r.resume.from }, keptFouls: r.keptFouls, diagnostic: r.diagnostic ?? null } }); };
comb('PREP-43-5', 'N15-02 art. 43, caso 43-5', [mkS('S1', 1, 1, 'personal', { shotAction: true, shotPoints: 2, shotMade: true }), mkS('S2', 0, 2, 'tecnica1')]);
comb('PREP-43-7', 'N15-02 art. 43, caso 43-7', [mkS('S1', 1, 1, 'flagrante', { shotAction: true, shotPoints: 2, shotMade: true }), mkS('S2', 0, 2, 'tecnica1')]);
comb('PREP-43-EQUIV', 'N15-02 art. 43: equivalencia incluye derechos', [mkS('S1', 0, 1, 'disruptiva'), mkS('S2', 1, 2, 'personal', { penalty: true })]);
comb('PREP-43-VIVO', 'N15-02 art. 43: penalización iniciada con balón vivo no compensa', [mkS('S1', 0, 1, 'tecnica1', { startedLive: true }), mkS('S2', 1, 2, 'tecnica1')]);
comb('PREP-ANTIDEPORTIVA', 'N15-03: alias sin categoría propia', [mkS('S1', 1, 1, 'antideportiva')]);
{ // engine real: técnica + entrenador (compensadas) y flagrante + técnica (43-7) en el núcleo
  const run = (name, ref, incs, seed) => { const m = createMatch(inputOf('EQ01', 'EQ02', seed), profile, { detail: 'minimal', check: true }); for (let i = 0; i < 30 && m.step(); i++); const rs = incs.map((x) => m.requestIncident(x)); const n0 = m.events.length; for (let i = 0; i < 8 && m.step(); i++); const evs = m.events.slice(n0).filter((e) => e.type === 'foul' || e.type === 'free_throw'); const res = drive(m);
    prepared.push({ id: name, ref, kind: 'núcleo real: requestIncident → cola → series reales', input: incs, output: { responses: rs, events: evs.map((e) => ({ id: e.id, type: e.type, regla: e.effects.regla ?? null, administracion: e.effects.administracion ?? null, lanzador: e.stats[0]?.p ?? null, entra: e.stats[0]?.made ?? null })), final_reconciliation: res.reconciliation.valid, status: res.status } }); };
  run('PREP-NUCLEO-COMPENSADA', 'N15-02 43 (técnica de jugador y técnica del entrenador, equivalentes)', [{ category: 'tecnica1', player: 'EQ01-J03' }, { category: 'tecnica_entrenador', team: 1 }], 7);
  run('PREP-NUCLEO-43-7', 'N15-02 43-7 (flagrante + técnica)', [{ category: 'flagrante', player: 'EQ02-J04', fouled: 'EQ01-J03' }, { category: 'tecnica1', player: 'EQ01-J04' }], 41);
}
{ // art. 45 sobre un encuentro real
  const m = createMatch(buildMatchInput(profile, players, { seed: 3 }), profile, { detail: 'minimal', check: true }); while (m.step()) { const e = m.events.at(-1); if (e.type === 'free_throw' && e.effects.ultimo) break; }
  const foul = [...m.events].reverse().find((e) => e.type === 'foul'); const ser = [...m.events].reverse().find((e) => e.type === 'free_throw').stats[0].series; const sc0 = [...m.score];
  const r1 = m.requestCorrection({ class: 'C1-FT-IMPROPER', requester: 'referee', error: { kind: 'freeThrowsAwardedImproperly', event: foul.id }, correct: { series: ser }, recognizedAt: { immediate: true } });
  const r2 = m.requestCorrection({ class: 'C1-FT-IMPROPER', requester: 'ayudante', error: { kind: 'freeThrowsAwardedImproperly', event: foul.id }, correct: { series: ser }, recognizedAt: { immediate: true } });
  const res = drive(m); prepared.push({ id: 'PREP-ART45', ref: 'N15-01 45 (libres indebidos; solicitante no habilitado)', kind: 'núcleo real: requestCorrection', input: { serie: ser }, output: { aplicada: { ok: r1.ok, window: r1.window, changes: r1.changes }, rechazada: { ok: r2.ok, reason: r2.reason }, marcador_antes: sc0, marcador_final: res.score, reconciliation: res.reconciliation.valid } });
}
{ // interferencia: copia SEM EXTREMA de laboratorio (identificada; no mide frecuencia)
  const X = JSON.parse(JSON.stringify(profile)); for (const k of ['fieldGoal', 'lastFreeThrow']) { X.interference[k].defensiveP = 0.35; X.interference[k].offensiveP = 0.35; }
  const res = runMatch(inputOf('EQ01', 'EQ02', 21), X, { detail: 'minimal', check: true });
  prepared.push({ id: 'PREP-INTERFERENCIA-EXTREMA', ref: 'RG-I01…I04 (lectura de Claude, provisional)', kind: 'copia SEM extrema de laboratorio (NO es una frecuencia de referencia)', input: { masas: 0.35 }, output: { libro: res.diagnostics.interference, hechos: res.events.filter((e) => e.effects?.interferencia).slice(0, 8).map((e) => ({ id: e.id, ...e.effects.interferencia })), reconciliation: res.reconciliation.valid } });
}
{ // MOTOR-15B §4.2: caso preparado de RG-I03 (interferencia defensiva en el último libre → punto + técnica de categoría 2 + libre adicional + una reanudación). Copia SEM de laboratorio que solo expone la
  // oportunidad existente (SEM15-INT-03 a 0,35; el resto de la interferencia a 0): NO mide frecuencia. Incluye guardado entre consecuencias y continuación sin duplicados.
  const X = JSON.parse(JSON.stringify(profile)); X.interference.lastFreeThrow.defensiveP = 0.35; X.interference.lastFreeThrow.offensiveP = 0; X.interference.fieldGoal.defensiveP = 0; X.interference.fieldGoal.offensiveP = 0;
  const mk = () => createMatch(inputOf('EQ01', 'EQ02', 1), X, { detail: 'minimal', check: true });
  const a = mk(); let n = 0; while (a.step() && n++ < 400) { const e = a.events.at(-1); if (e.type === 'foul' && e.effects?.origenInterferencia) break; }
  const pending = { adminPlanOrigin: a.adminPlan?.origin ?? null, index: a.adminPlan?.index ?? null, steps: a.adminPlan?.steps.map((x) => x.id) ?? null, score: [...a.score], ftEvents: a.events.filter((e) => e.type === 'free_throw').length };
  const snap = JSON.parse(JSON.stringify(snapshotMatch(a, { label: 'guardado entre la técnica y su libre adicional (RG-I03)' })));
  const ra = drive(a); const rb = drive(restoreMatch(snap));
  const chain = (r) => r.events.map((e, i) => [e, i]).filter(([e]) => e.effects?.interferencia?.lado === 'defensive' && e.effects.interferencia.situacion === 'lastFreeThrow').map(([e, i]) => { const f = r.events.slice(i + 1).find((x) => x.type === 'foul'); const t = r.events.slice(i + 1).find((x) => x.type === 'free_throw'); const next = r.events.slice(i + 1).find((x) => ['throw_in', 'rebound'].includes(x.type)); return { libreOriginal: { id: e.id, lanzador: e.stats[0].p, punto: e.score, infractor: e.effects.interferencia.infractor }, tecnica: { id: f.id, categoria: f.effects.categoria, infractor: f.participants.infractor, contadores: f.effects.contadores, faltasColectivasPeriodo: f.effects.faltasColectivasPeriodo, excluido: f.effects.excluido, regla: f.effects.regla }, libreAdicional: { id: t.id, lanzador: t.stats[0].p, entra: t.stats[0].made, serie: t.stats[0].series, marcador: t.score }, reanudacion: { id: next.id, tipo: next.type, equipo: next.team } }; });
  prepared.push({ id: 'PREP-RG-I03', ref: 'RG-I03 · B15-N1 31.3.3 y 36.2/36.3 (síntesis de ChatGPT; sin lectura directa)', kind: 'copia SEM de laboratorio que solo expone la oportunidad existente (NO es una frecuencia de referencia)', input: { 'interference.lastFreeThrow.defensiveP': 0.35, seed: 1 },
    output: { fronteraGuardada: pending, cadenas: chain(ra), continuacionIgual: trajectoryFingerprint(ra) === trajectoryFingerprint(rb), marcador: [ra.score, rb.score], libresLibres: [ra.events.filter((e) => e.type === 'free_throw').length, rb.events.filter((e) => e.type === 'free_throw').length], actaIgual: JSON.stringify(ra.acta) === JSON.stringify(rb.acta), reconciliacion: ra.reconciliation.valid, tecnicasEnActa: Object.values(ra.acta.players).reduce((s, p) => s + (p.fouls?.tecnica2 ?? 0), 0) } });
}
summary.prepared = prepared.map((p) => ({ id: p.id, ref: p.ref, kind: p.kind, file: save(`${p.id}.json`, p).file }));
summary.generated_by = 'node scripts/m15-integration.js'; writeFileSync(join(OUT, 'resumen.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ cases: summary.cases.map((c) => [c.id, c.score.join('-'), c.reconciliation, c.reduced_same_trajectory, c.replay_identical, c.min_energy]), saves: summary.saves.map((s) => [s.id, s.continues_same]), prepared: summary.prepared.length }));
void compareRuns;
