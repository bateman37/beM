// Equivalencia deportiva entre ejecuciones (MOTOR-14 §11, AUD29): proyección de comparación explícita, comparador con diferencias localizadas y un conductor del núcleo con guion de órdenes
// anclado a FRONTERAS DEPORTIVAS (paso o cierre de periodo), nunca a milisegundos de navegador. Sin DOM ni reloj de pared.
import { createMatch, buildResult } from './index.js';
import { sportsProjection } from './replay.js';

// Proyección de COMPARACIÓN: todo lo deportivo y administrativo que debe coincidir cuando entradas, versiones, aleatoriedad, políticas y órdenes efectivas coinciden.
// Se excluyen explícitamente (y se listan) los campos de procedencia o presentación: identificadores editoriales, nombre/versión de biblioteca del perfil, hechos de presentación y detalle diagnóstico.
export const COMPARISON_EXCLUDED = ['presentation', 'direction (modalidad y equipo dirigido: metadato de presentación)', 'events[].calc y events[].params (diagnóstico del cálculo)', 'identity.profileRef y nombre de biblioteca', 'coach[].version.perfil (procedencia)'];
const stripVersion = (v) => { if (!v || typeof v !== 'object') return v; const { perfil, ...rest } = v; void perfil; return rest; };

export function comparisonProjection(res) {
  const sp = sportsProjection(res); // hechos, marcador, caja, acta, posesiones, órdenes y comandos, estados, episodios, entrenador y memoria
  return {
    sport: { ...sp, coach: sp.coach?.map((d) => (d && d.version ? { ...d, version: stripVersion(d.version) } : d)) ?? null },
    draws: res.diagnostics?.sportingDraws ?? null,
    drawLog: res.events.flatMap((e) => (e.draws ?? []).map((d) => [d.n, d.purpose, d.u])),
    lineups: res.lineups, finalEnergy: res.diagnostics?.finalEnergy ?? null, finalFouls: res.diagnostics?.finalFouls ?? null,
    reconciliationValid: res.reconciliation?.valid ?? null,
  };
}

// Localiza diferencias: ruta del primer campo distinto por cada rama de primer nivel y, en matrices, el índice del primer elemento distinto.
export function diffProjection(a, b, limit = 12) {
  const out = [];
  const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const walk = (x, y, path, depth) => {
    if (out.length >= limit || eq(x, y)) return;
    if (Array.isArray(x) && Array.isArray(y)) {
      const n = Math.max(x.length, y.length);
      for (let i = 0; i < n && out.length < limit; i++) if (!eq(x[i], y[i])) { if (depth < 2 && x[i] && y[i] && typeof x[i] === 'object') { walk(x[i], y[i], `${path}[${i}]`, depth + 1); } else out.push({ path: `${path}[${i}]`, a: brief(x[i]), b: brief(y[i]) }); if (depth >= 1) break; }
      if (x.length !== y.length && out.length < limit) out.push({ path: `${path}.length`, a: x.length, b: y.length });
      return;
    }
    if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) if (!eq(x[k], y[k])) walk(x[k], y[k], `${path}.${k}`, depth + 1); return; }
    out.push({ path, a: brief(x), b: brief(y) });
  };
  walk(a, b, '', 0);
  return out;
}
const brief = (v) => { const s = JSON.stringify(v); return s && s.length > 160 ? `${s.slice(0, 157)}…` : v; };

// ------------------------------------------------------------------------------------------------ conductor con guion por frontera deportiva
// Guion: [{ period: 1, label: '...', specs: [{ team, type, ... }] }] = órdenes que se registran en la revisión que sigue al cierre del periodo `period` (frontera legal común a las tres modalidades),
// y/o [{ afterStep: n, spec }] = orden registrada tras el paso n (solo el visionado y el conductor del núcleo ofrecen esa frontera). El orden es estable: por frontera y, dentro de ella, por posición en el guion.
export function normalizeScript(script = []) {
  return script.map((s, i) => ({ ...s, i })).sort((a, b) => ((a.afterStep ?? -1) - (b.afterStep ?? -1)) || ((a.period ?? 0) - (b.period ?? 0)) || (a.i - b.i));
}
// Aplica al núcleo lo que el guion prescribe en su frontera ACTUAL. `done` es un Set de índices ya aplicados (parte del cursor, se conserva al continuar).
export function applyScriptAt(m, script, done) {
  for (const s of script) {
    if (done.has(s.i)) continue;
    if (s.afterStep != null) { if (s.afterStep <= m.stepSeq) { done.add(s.i); m.submit(s.spec); } }
    else if (s.period != null && m.periodBreak != null && m.period >= s.period && m.status !== 'finished') { done.add(s.i); m.submitBatch(s.specs, s.label ?? `guion del periodo ${s.period}`); }
  }
}
export function driveMatch(m, script = [], { done = new Set(), stopAfterSteps = null } = {}) {
  const sc = normalizeScript(script);
  let n = 0;
  while (m.status !== 'finished' && m.status !== 'error') {
    applyScriptAt(m, sc, done);
    if (stopAfterSteps != null && n >= stopAfterSteps) break;
    if (!m.step()) break;
    n += 1;
  }
  return { done, steps: n };
}

export function runScripted(input, profile, script = [], opts = {}) {
  const m = createMatch(input, profile, { detail: 'full', ...opts });
  driveMatch(m, script);
  return { m, res: buildResult(m) };
}

// Compara dos resultados con las mismas entradas efectivas. Una comparación sobre entradas distintas informa de INCOMPATIBILIDAD, no de fallo del motor (AUD29 §11.4).
export function compareRuns(a, b, { label = 'comparación' } = {}) {
  const sameInput = JSON.stringify(a.input) === JSON.stringify(b.input);
  const sameSeed = a.input.seed === b.input.seed;
  const sameProfile = (a.identity.effectiveProfileId === b.identity.effectiveProfileId) && JSON.stringify(a.profile) === JSON.stringify(b.profile);
  const sameEngine = a.identity.engineVersion === b.identity.engineVersion;
  if (!sameInput || !sameProfile || !sameEngine) {
    return { label, compatible: false, equal: null, reason: [!sameInput && 'entradas efectivas distintas', !sameProfile && 'perfil efectivo distinto', !sameEngine && 'versión de motor distinta'].filter(Boolean).join('; '), sameSeed, differences: [] };
  }
  const pa = comparisonProjection(a); const pb = comparisonProjection(b);
  const diffs = diffProjection(pa, pb);
  return { label, compatible: true, equal: diffs.length === 0, differences: diffs, fields: Object.keys(pa), excluded: COMPARISON_EXCLUDED, draws: [pa.draws, pb.draws], score: [a.score, b.score] };
}
