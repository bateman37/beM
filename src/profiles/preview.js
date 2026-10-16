// Previsualizaciones deterministas de mecanismo (MOTOR-03, §7.4). Reutilizan las funciones compartidas del motor
// (src/match/formulas.js y mathx.js), con contexto fijo y visible, sin consumir azar deportivo ni tocar ninguna sesión.
// Los ejemplos están etiquetados como EJEMPLOS: no son frecuencias medidas ni prometen puntos por partido.
import { shotProbability, severityAt, normalizeWeights, abilityFit } from '../match/formulas.js';
import { triangularFromU } from '../match/mathx.js';
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
