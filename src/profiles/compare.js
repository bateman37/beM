// Comparación inicial base/candidata (MOTOR-03, §11): dos encuentros COMPLETOS por el mismo núcleo con entradas idénticas.
// No es el constructor de lotes de MOTOR-12: es una ejecución explícita de un enfrentamiento por perfil, con el contrato de
// ejecución (perfil congelado, entrada, semilla, órdenes) que MOTOR-12 podrá ampliar. No activa ni publica nada.
import { runMatch, buildResult, createMatch, teamTotals, ENGINE_VERSION } from '../match/index.js';
import { diffEffective } from './model.js';
import { contentHash, deepCopy } from './util.js';

export const COMPARISON_FORMAT = 'beM-comparison/1';
export const INTERPRETATION_WARNING = 'Muestra exploratoria de un único partido por perfil: no es calibración ni prueba de superioridad. Compartir la semilla no empareja cada lanzamiento una vez que las decisiones y tiradas divergen: la diferencia de dos marcadores NO es un efecto causal exacto ni una mejora estadísticamente demostrada.';

const baseRunCache = new Map(); // memoria de sesión: reutiliza el encuentro base si entrada, órdenes y versión coinciden

const pct = (n, d) => (d > 0 ? n / d : null);
function runOne(input, effective, ref, commands) {
  const opts = { detail: 'full', profileRef: ref };
  if (!commands?.length) return runMatch(deepCopy(input), deepCopy(effective), opts);
  const m = createMatch(deepCopy(input), deepCopy(effective), opts);
  let i = 0;
  const inject = () => { while (i < commands.length && commands[i].afterStep === m.stepSeq) { m.applyCommand(commands[i]); i += 1; } };
  inject();
  while (m.step()) inject();
  return buildResult(m);
}

function extract(res) {
  const out = { teams: [], status: res.status, complete: !!res.result?.complete, errors: res.errors.length, events: res.events.length, possessions: res.diagnostics.possessions, draws: res.meta.rng.draws, periods: res.periodScores.map((p) => p.points) };
  const attempts = [{ zones: {}, quality: {}, plays: {} }, { zones: {}, quality: {}, plays: {} }];
  let subs = [0, 0];
  for (const e of res.events) {
    if (e.type === 'substitution') subs[e.team] += 1;
    if (e.type === 'attempt' && e.effects?.zona && e.effects.pConversion !== undefined) {
      const a = attempts[e.team];
      a.zones[e.effects.zona] = (a.zones[e.effects.zona] ?? 0) + 1;
      const q = e.intent?.calidad; if (q) a.quality[q] = (a.quality[q] ?? 0) + 1;
      const o = e.intent?.origen; if (o) a.plays[o] = (a.plays[o] ?? 0) + 1;
    }
  }
  for (const t of [0, 1]) {
    const tt = teamTotals(res.box, res.input, t);
    const ids = res.input.teams[t].players.map((p) => p.id);
    const en = ids.map((id) => res.diagnostics.finalEnergy[id]);
    out.teams.push({ id: res.teams[t].id, name: res.teams[t].name, pts: tt.pts, fg2m: tt.fg2m, fg2a: tt.fg2a, fg3m: tt.fg3m, fg3a: tt.fg3a, ftm: tt.ftm, fta: tt.fta, reb: tt.oreb + tt.dreb, oreb: tt.oreb, dreb: tt.dreb, tov: tt.tov + tt.teamTov, pf: tt.pf, stl: tt.stl, blk: tt.blk, min: tt.min, subs: subs[t], meanFinalEnergy: en.reduce((s, x) => s + x, 0) / en.length, choices: attempts[t] });
  }
  return out;
}

// Métricas con denominador visible; «no calculable» cuando el denominador es 0 (nunca infinito ni 0 inventado).
function buildMetrics(a, b) {
  const rows = [];
  const add = (key, label, unit, va, vb, den = null) => {
    const abs = va == null || vb == null ? null : vb - va;
    const rel = va == null || vb == null || va === 0 ? null : (vb - va) / Math.abs(va);
    rows.push({ key, label, unit, base: va, candidate: vb, abs, rel, denominator: den, note: va == null || vb == null ? 'no calculable (denominador 0)' : (rel === null ? 'diferencia relativa no calculable (base 0)' : null) });
  };
  for (const t of [0, 1]) {
    const A = a.teams[t]; const B = b.teams[t]; const id = A.id;
    add(`${id}.pts`, `${id} · puntos`, 'pts', A.pts, B.pts);
    add(`${id}.fg2`, `${id} · T2 anotados`, 'nº', A.fg2m, B.fg2m, { base: A.fg2a, candidate: B.fg2a, label: 'intentos' });
    add(`${id}.fg2a`, `${id} · T2 intentados`, 'nº', A.fg2a, B.fg2a);
    add(`${id}.fg3`, `${id} · T3 anotados`, 'nº', A.fg3m, B.fg3m, { base: A.fg3a, candidate: B.fg3a, label: 'intentos' });
    add(`${id}.fg3a`, `${id} · T3 intentados`, 'nº', A.fg3a, B.fg3a);
    add(`${id}.ft`, `${id} · TL anotados`, 'nº', A.ftm, B.ftm, { base: A.fta, candidate: B.fta, label: 'intentos' });
    add(`${id}.fta`, `${id} · TL intentados`, 'nº', A.fta, B.fta);
    add(`${id}.fg3pct`, `${id} · acierto T3`, '%', pct(A.fg3m, A.fg3a), pct(B.fg3m, B.fg3a), { base: A.fg3a, candidate: B.fg3a, label: 'intentos T3' });
    add(`${id}.fg2pct`, `${id} · acierto T2`, '%', pct(A.fg2m, A.fg2a), pct(B.fg2m, B.fg2a), { base: A.fg2a, candidate: B.fg2a, label: 'intentos T2' });
    add(`${id}.fg3share`, `${id} · proporción de triples sobre tiros de campo`, '%', pct(A.fg3a, A.fg2a + A.fg3a), pct(B.fg3a, B.fg2a + B.fg3a), { base: A.fg2a + A.fg3a, candidate: B.fg2a + B.fg3a, label: 'tiros de campo' });
    add(`${id}.reb`, `${id} · rebotes`, 'nº', A.reb, B.reb);
    add(`${id}.tov`, `${id} · pérdidas`, 'nº', A.tov, B.tov);
    add(`${id}.pf`, `${id} · faltas`, 'nº', A.pf, B.pf);
    add(`${id}.stl`, `${id} · robos`, 'nº', A.stl, B.stl);
    add(`${id}.blk`, `${id} · tapones`, 'nº', A.blk, B.blk);
    add(`${id}.subs`, `${id} · sustituciones`, 'nº', A.subs, B.subs);
    add(`${id}.energy`, `${id} · energía media final`, 'energía', A.meanFinalEnergy, B.meanFinalEnergy);
  }
  add('possessions', 'Posesiones', 'nº', a.possessions, b.possessions);
  add('events', 'Acontecimientos', 'nº', a.events, b.events);
  return rows;
}

function coherence(res, label) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id: `${label}:${id}`, ok, detail });
  add('estado', res.status === 'finished' && res.errors.length === 0, `estado ${res.status}, ${res.errors.length} error(es)`);
  for (const t of [0, 1]) {
    const tt = teamTotals(res.box, res.input, t);
    add(`marcador-equipo-${t}`, tt.pts === res.score[t], `acta ${tt.pts} frente a marcador ${res.score[t]}`);
    add(`puntos-canastas-${t}`, tt.pts === tt.fg2m * 2 + tt.fg3m * 3 + tt.ftm, 'puntos = 2·T2 + 3·T3 + TL');
    add(`parciales-${t}`, res.periodScores.reduce((s, p) => s + p.points[t], 0) === res.score[t], 'suma de parciales = marcador');
  }
  const mins = [0, 1].reduce((s, t) => s + teamTotals(res.box, res.input, t).min, 0);
  const total = res.periodScores.reduce((s, p, i) => s + (i < res.profile.rules.quarters ? res.profile.rules.quarterSeconds : res.profile.rules.overtimeSeconds), 0) / 60;
  add('minutos', Math.abs(mins - 10 * total) < 0.5, `minutos de jugadores ${mins.toFixed(1)} frente a 10 × ${total}`);
  return checks;
}

export function describeRowChange(c) { return { id: c.id, label: c.row.label, unit: c.row.unit, class: c.row.cls, before: c.before, after: c.after, group: c.row.grp }; }

// Ejecuta la comparación. base/candidate: { ref, effective }. Congela versiones y entradas antes de empezar.
export async function runComparison({ base, candidate, input, commands = [], question = '', hypothesis = '', now = () => new Date().toISOString(), onProgress = null, draft = null }) {
  const inputFrozen = deepCopy(input);
  const inputHash = contentHash({ input: inputFrozen, commands });
  const baseHash = contentHash(base.effective); const candHash = contentHash(candidate.effective);
  const diff = diffEffective(base.effective, candidate.effective);
  const limits = [INTERPRETATION_WARNING];
  if (baseHash === candHash) limits.push('Atención: base y candidata tienen el mismo contenido efectivo; cualquier diferencia vendría solo de ejecuciones distintas, que son idénticas.');
  const key = `${ENGINE_VERSION}|${baseHash}|${inputHash}`;
  let baseRes = baseRunCache.get(key); let reused = !!baseRes;
  if (onProgress) await onProgress('base');
  if (!baseRes) { baseRes = runOne(inputFrozen, base.effective, base.ref, commands); baseRunCache.set(key, baseRes); if (baseRunCache.size > 4) baseRunCache.delete(baseRunCache.keys().next().value); }
  if (onProgress) await onProgress('candidata');
  const candRes = runOne(inputFrozen, candidate.effective, candidate.ref, commands);
  const ba = extract(baseRes); const ca = extract(candRes);
  const checks = [...coherence(baseRes, 'base'), ...coherence(candRes, 'candidata'),
    { id: 'misma-entrada', ok: JSON.stringify(baseRes.input) === JSON.stringify(candRes.input), detail: 'jugadores, estados iniciales, plan y semilla idénticos en las dos ejecuciones' },
    { id: 'misma-semilla', ok: baseRes.meta.rng.initialSeed === candRes.meta.rng.initialSeed, detail: `semilla ${baseRes.meta.rng.initialSeed}` }];
  const metrics = buildMetrics(ba, ca);
  const sample = { matchesPerProfile: 1, completeBase: ba.complete ? 1 : 0, completeCandidate: ca.complete ? 1 : 0, errors: ba.errors + ca.errors };
  return {
    format: COMPARISON_FORMAT, createdAt: now(), engineVersion: ENGINE_VERSION, question, hypothesis, draft,
    changes: diff.changed.map(describeRowChange), schemaMismatch: [...diff.onlyA, ...diff.onlyB],
    scenario: { seed: baseRes.meta.rng.initialSeed, teams: baseRes.teams.map((t) => t.id), inputHash, commands: commands.length },
    runs: { base: { ref: base.ref, profileHash: baseHash, summary: ba, reused }, candidate: { ref: candidate.ref, profileHash: candHash, summary: ca } },
    metrics, checks, checksScope: 'Coherencia interna del acta frente a los hechos (marcador, puntos, parciales, minutos y misma entrada). No valida realismo ni calibración.',
    pending: ['Asistencias, créditos de equipo y estadísticas avanzadas (EST01–EST08, MOTOR-09): no registradas; no se muestran como cero.', 'Uso de fichas por oportunidad y calidad con denominador completo: solo conteos de intentos con resolución de tiro.'],
    sample, limits, results: { base: baseRes, candidate: candRes },
  };
}

// Resumen persistible (sin los partidos completos, que solo viven en memoria hasta descargarse).
export function comparisonSummary(report) {
  const keep = ['pts', 'fg3a', 'fg2a', 'tov', 'reb', 'fg3share'];
  return {
    question: report.question, hypothesis: report.hypothesis, seed: report.scenario.seed, teams: report.scenario.teams, changes: report.changes.length,
    base: report.runs.base.ref, candidate: report.runs.candidate.ref, baseHash: report.runs.base.profileHash, candidateHash: report.runs.candidate.profileHash,
    scores: { base: report.runs.base.summary.teams.map((t) => t.pts), candidate: report.runs.candidate.summary.teams.map((t) => t.pts) },
    metrics: report.metrics.filter((m) => keep.some((k) => m.key.endsWith(`.${k}`))), checksOk: report.checks.every((c) => c.ok), sample: report.sample,
    note: 'Resumen: los dos partidos completos solo existen en memoria; descarga la comparación para conservarlos.',
  };
}

export function comparisonExport(report) {
  const { results, ...rest } = report;
  return { ...rest, matches: { base: results.base, candidate: results.candidate }, profiles: { base: results.base.profile, candidate: results.candidate.profile }, inputs: { input: results.base.input, commands: rest.scenario.commands } };
}

const f = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d).replace('.', ','));
export function comparisonMarkdown(report) {
  const L = [];
  L.push('# Comparación base / candidata', '');
  L.push(`- Pregunta: ${report.question || '(sin indicar)'}`, `- Hipótesis: ${report.hypothesis || '(sin indicar)'}`);
  L.push(`- Motor: ${report.engineVersion} · semilla ${report.scenario.seed} · equipos ${report.scenario.teams.join(' vs ')}`);
  L.push(`- Base: ${report.runs.base.ref?.versionId} (${report.runs.base.ref?.label}) · huella ${report.runs.base.profileHash.slice(0, 12)}${report.runs.base.reused ? ' · encuentro reutilizado' : ''}`);
  L.push(`- Candidata: ${report.runs.candidate.ref?.versionId ?? report.runs.candidate.ref?.label} · huella ${report.runs.candidate.profileHash.slice(0, 12)}`, '');
  L.push('## Cambios por fila', '');
  if (!report.changes.length) L.push('Sin diferencias de valor efectivo.'); else for (const c of report.changes) L.push(`- \`${c.id}\` (${c.unit}): ${JSON.stringify(c.before)} → ${JSON.stringify(c.after)}`);
  L.push('', '## Resultado', '');
  const s = (r) => r.summary.teams.map((t) => `${t.id} ${t.pts}`).join(' – ');
  L.push(`- Base: ${s(report.runs.base)} · parciales ${report.runs.base.summary.periods.map((p) => p.join('-')).join(' | ')}`);
  L.push(`- Candidata: ${s(report.runs.candidate)} · parciales ${report.runs.candidate.summary.periods.map((p) => p.join('-')).join(' | ')}`, '');
  L.push('| Métrica | Base | Candidata | Δ abs | Δ rel | Denominador |', '|---|---:|---:|---:|---:|---|');
  for (const m of report.metrics) L.push(`| ${m.label} | ${f(m.base)} | ${f(m.candidate)} | ${f(m.abs)} | ${m.rel == null ? 'no calculable' : `${f(m.rel * 100, 1)} %`} | ${m.denominator ? `${m.denominator.base}/${m.denominator.candidate} ${m.denominator.label}` : ''} |`);
  L.push('', '## Comprobaciones de coherencia', '', `Alcance: ${report.checksOk ?? report.checksScope}`);
  for (const c of report.checks) L.push(`- ${c.ok ? '✔' : '✘'} ${c.id}: ${c.detail}`);
  L.push('', '## Limitaciones', '');
  for (const l of [...report.limits, ...report.pending]) L.push(`- ${l}`);
  return L.join('\n');
}
