// Previsualizaciones deterministas de mecanismo (MOTOR-03, §7.4). Reutilizan las funciones compartidas del motor
// (src/match/formulas.js y mathx.js), con contexto fijo y visible, sin consumir azar deportivo ni tocar ninguna sesión.
// Los ejemplos están etiquetados como EJEMPLOS: no son frecuencias medidas ni prometen puntos por partido.
import { shotProbability, severityAt, normalizeWeights, abilityFit, perturbBinary, perturbCategories, consistencySigmaAt, pressureLossLogit } from '../match/formulas.js';
import { triangularFromU, sigmoid, logit } from '../match/mathx.js';
import { getAt } from './util.js';
import { ZN } from './rows.js';

const pct = (p, d = 1) => `${(p * 100).toFixed(d).replace('.', ',')} %`;
const f2 = (x, d = 2) => Number(x).toFixed(d).replace('.', ',');

// Devuelve { title, note, tables:[{head, rows}], chart? } o null si la fila no admite previsualización.
export function previewRow(row, profile) {
  const id = row.id; const m = /^shots\.(\w+)\.(p0|sA|sD|attack\..+|defense\..+)$/.exec(id);
  if (m && m[1] !== 'freeThrow' || (m && m[1] === 'freeThrow' && m[2] !== 'sD')) return shotPreview(row, profile, m[1]);
  if (id === 'selection.priorityWeights') return weightsPreview(profile);
  if (row.type === 'triangular') return durationPreview(row, profile);
  if (id === 'energy.severityNodes' || /^energy\.(costPerLiveMinute|enduranceSlope|baseEnduranceReference|default\w+TaskMax|freeThrowTaskMax)$/.test(id) || /^tasks\.\w+\.maxEnergyPenalty$/.test(id)) return severityPreview(profile);
  if (/^(form|pressure|moment|teamMoment|episodes)\./.test(id) || /^missingTaskConnections\./.test(id)) return statesPreview(profile);
  if (/^selection\.abilityFit\./.test(id)) return fitPreview(profile);
  if (/^selection\.orientation/.test(id) || id === 'selection.organizedDurationFactor') return levelPreview(row);
  return null;
}

function shotPreview(row, profile, zone) {
  const sh = profile.shots[zone]; const N = profile.neutralAbility;
  const As = [N - 6, N - 3, N, N + 3, N + 6]; const Ds = zone === 'freeThrow' ? [null] : [N - 6, N, N + 6];
  const head = ['Capacidad del tirador', ...Ds.map((d) => (d == null ? 'sin oposición' : `defensor ${d}`))];
  const rows = As.map((A) => [`${A}`, ...Ds.map((D) => pct(shotProbability(profile, sh, A, D, 0)))]);
  const t = [{ head, rows }];
  if (row.id.endsWith('.p0')) {
    const p = sh.p0; const q = Math.min(0.99, p + 0.03);
    t.push({ head: ['Ejemplo de unidades', 'Valor'], rows: [[`${pct(p, 0)} → ${pct(q, 0)}`, `+3 puntos porcentuales ≈ +${f2(((q - p) / p) * 100)} % relativo`]] });
  }
  return { title: `Respuesta del acierto de ${ZN[zone]}`, note: `EJEMPLO con calidad normal (K = 0), sin tapón, referencia neutra ${N}. Es el mismo cálculo que usa el partido (shotProbability). No es una frecuencia medida ni promete puntos por partido.`, tables: t };
}

function weightsPreview(profile) {
  const pw = profile.selection.priorityWeights;
  // Ejemplo: cinco familias, cada una con una variante de prioridad distinta (1–5)
  const items = pw.map((w, i) => ({ key: `Familia con prioridad ${i + 1}`, w }));
  const n = normalizeWeights(items);
  const same = normalizeWeights([{ key: 'A (prioridad 1)', w: pw[0] }, { key: 'B (prioridad 1)', w: pw[0] }, { key: 'C (prioridad 3)', w: pw[2] }]);
  return { title: 'Pesos brutos y reparto normalizado', note: 'EJEMPLO con un libro ficticio de cinco fichas de familias distintas. Los pesos son relativos: el reparto es peso / suma de pesos del conjunto elegible.',
    tables: [{ head: ['Alternativa', 'Peso bruto', 'Reparto'], rows: n.map((x) => [x.key, f2(x.w), pct(x.p)]) }, { head: ['Otro libro: dos prioridad 1 y una prioridad 3', 'Peso bruto', 'Reparto'], rows: same.map((x) => [x.key, f2(x.w), pct(x.p)]) }] };
}

function durationPreview(row, profile) {
  const d = getAt(profile, row.path);
  const us = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];
  const mean = (d[0] + d[1] + d[2]) / 3;
  return { title: 'Distribución triangular de la duración', note: 'Valores deterministas por inversión de la distribución en cuantiles fijos (no se sortea nada). El valor «más probable» no es un tiempo garantizado.',
    tables: [{ head: ['Mínimo', 'Más probable', 'Máximo', 'Media'], rows: [[f2(d[0]), f2(d[1]), f2(d[2]), f2(mean)]] }, { head: ['Cuantil', 'Duración (s)'], rows: us.map((u) => [pct(u, 0), f2(triangularFromU(u, d))]) }] };
}

function severityPreview(profile) {
  const es = [100, 90, 70, 50, 30, 10, 0];
  const tasks = Object.entries(profile.tasks).filter(([, t]) => t.maxEnergyPenalty != null);
  const head = ['Energía', 'Gravedad', ...tasks.map(([k]) => `${k} (−pts)`)];
  const rows = es.map((e) => { const s = severityAt(profile, e); return [`${e}`, f2(s, 3), ...tasks.map(([, t]) => f2(s * t.maxEnergyPenalty))]; });
  const gasto = profile.energy.costPerLiveMinute;
  const mins = [5, 10, 20, 40].map((mn) => [`${mn} min seguidos en pista`, `${f2(Math.max(0, 100 - gasto * mn))} de energía (Resistencia de referencia, carga 1)`]);
  const chart = profile.energy.severityNodes.map(([x, y]) => ({ x, y }));
  return { title: 'Curva de gravedad y penalización efectiva por tarea', note: 'EJEMPLO: puntos de capacidad que pierde cada tarea a cada nivel de energía (gravedad × deterioro máximo de la tarea). Debajo, el gasto aproximado sin Resistencia diferenciada.', tables: [{ head, rows }, { head: ['Tiempo en pista', 'Energía restante aproximada'], rows: mins }], chart: { xLabel: 'Energía', yLabel: 'Gravedad', points: chart } };
}

function fitPreview(profile) {
  const N = profile.neutralAbility;
  return { title: 'Ajuste por capacidad del peso de elección', note: 'Factor aplicado al peso de un candidato según su capacidad en la zona o función.', tables: [{ head: ['Capacidad', 'Factor'], rows: [4, 8, 12, N, 20, 24, 28].map((x) => [`${x}`, f2(abilityFit(profile, x), 3)]) }] };
}

function levelPreview(row) {
  return { title: 'Efecto por nivel de estilo', note: 'Multiplicador del peso de la opción según el nivel (1–5) elegido por el entrenador.', tables: [{ head: ['Nivel', 'Multiplicador'], rows: row.value.map((v, i) => [`${i + 1}`, f2(v, 3)]) }] };
}

// MOTOR-07: respuesta de Forma y presión, amplitud por Consistencia y perturbación final de probabilidades y distribuciones en contexto fijo.
// Mismas funciones puras que el motor; sin azar. La media de la salida con Z y −Z es la probabilidad de referencia (neutralidad).
function statesPreview(profile) {
  const p0 = profile.shots.three.p0; const base = logit(p0); const al = profile.moment.probabilityAlphaByTask.shot;
  const form = [-1, -0.5, 0, 0.5, 1].map((f) => { const x = profile.form.taskMaxLogit.shot * f; return [f2(f), f2(x, 3), pct(sigmoid(base + x))]; });
  const press = [0.25, 0.6, 1].flatMap((P) => [1, 8, 16, 24, 30].map((c) => [f2(P), `${c}`, f2(-pressureLossLogit(profile, 'shot', P, c), 3), pct(sigmoid(base - pressureLossLogit(profile, 'shot', P, c)))]));
  const cons = [1, 8, 16, 24, 30].map((c) => { const sg = consistencySigmaAt(profile, c); return [`${c}`, f2(sg, 3), f2(Math.sqrt(3) * sg, 3)]; });
  const bin = [0.1, 0.35, 0.5, 0.75].flatMap((p) => [1, 0.5].map((Z) => { const up = perturbBinary(p, Z, al); const dn = perturbBinary(p, -Z, al); return [pct(p), f2(Z), pct(up, 2), pct(dn, 2), pct((up + dn) / 2, 2)]; }));
  const dist = { 'cómoda (G)': 0.25, normal: 0.55, forzada: 0.2 }; const pu = perturbCategories(dist, ['cómoda (G)'], 1, profile.moment.probabilityAlphaByTask.coordination); const pd = perturbCategories(dist, ['cómoda (G)'], -1, profile.moment.probabilityAlphaByTask.coordination);
  return { title: 'Forma, presión, Consistencia y perturbación final (estados de MOTOR-07)', note: 'EJEMPLOS deterministas con las mismas funciones del motor (tiro de triple de referencia, contexto fijo). No son frecuencias medidas ni prometen puntos por partido. La perturbación final tiene media cero: Z y −Z promedian la probabilidad de referencia.',
    tables: [
      { head: ['Forma', 'Ajuste (logit)', `Probabilidad (referencia ${pct(p0, 0)})`], rows: form },
      { head: ['Exigencia P', 'MEN07', 'Pérdida (logit)', 'Probabilidad'], rows: press },
      { head: ['Consistencia (MEN06)', 'Amplitud σ', 'Extremo de la innovación (√3·σ)'], rows: cons },
      { head: ['Probabilidad p', 'Z', 'p con +Z', 'p con −Z', 'Media'], rows: bin },
      { head: ['Distribución excluyente', 'Referencia', 'Z = +1', 'Z = −1', 'Media'], rows: Object.keys(dist).map((k) => [k, pct(dist[k], 2), pct(pu[k], 2), pct(pd[k], 2), pct((pu[k] + pd[k]) / 2, 2)]) },
    ] };
}
