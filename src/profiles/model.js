// Resolución, herencia, diferencias y edición de perfiles (SUP02/SUP03). Sin DOM: trabaja sobre objetos de perfil efectivo.
import { buildRows, indexRows } from './rows.js';
import { validateRowValue, isScalarNumber, scaleOf } from './validate.js';
import { deepCopy, setAt, canonical, getAt } from './util.js';

// Convierte los valores de un conjunto de sobreescrituras {idFila: valor} sobre un padre en un perfil efectivo resuelto.
// Un id desconocido o ambiguo es un error: no se supone equivalencia por parecido de nombres (§8.3).
export function resolveOverrides(parentEffective, overrides) {
  const eff = deepCopy(parentEffective);
  const { byId } = indexRows(buildRows(parentEffective));
  const problems = [];
  for (const [id, value] of Object.entries(overrides ?? {})) {
    const r = byId.get(id);
    if (!r || r.missing) { problems.push(`la fila ${id} no existe en el padre`); continue; }
    setAt(eff, r.path, deepCopy(value));
  }
  if (problems.length) { const e = new Error(`Sobreescrituras no resolubles: ${problems.join('; ')}`); e.problems = problems; throw e; }
  return eff;
}

// Diferencias por ID semántico entre dos perfiles efectivos. Un cambio de etiqueta o de orden de archivo no es un cambio deportivo.
export function diffEffective(a, b) {
  const ra = indexRows(buildRows(a)).byId; const rb = indexRows(buildRows(b)).byId;
  const changed = []; const onlyA = []; const onlyB = [];
  for (const [id, r] of ra) {
    const s = rb.get(id);
    if (!s) { onlyA.push(id); continue; }
    if (canonical(r.value) !== canonical(s.value)) changed.push({ id, row: s, before: r.value, after: s.value });
  }
  for (const id of rb.keys()) if (!ra.has(id)) onlyB.push(id);
  const meta = {};
  for (const k of ['id', 'status', 'effectiveId']) if (a[k] !== b[k]) meta[k] = { before: a[k], after: b[k] };
  return { changed, onlyA, onlyB, meta, identical: !changed.length && !onlyA.length && !onlyB.length };
}

// Sobreescrituras de `child` respecto a `parent` (valores efectivos distintos).
export function overridesBetween(parent, child) {
  const d = diffEffective(parent, child);
  if (d.onlyA.length || d.onlyB.length) { const e = new Error(`Esquema distinto: filas sin correspondencia (${[...d.onlyA, ...d.onlyB].slice(0, 5).join(', ')}…)`); e.diff = d; throw e; }
  return Object.fromEntries(d.changed.map((c) => [c.id, deepCopy(c.after)]));
}

// ---------------------------------------------------------------- edición conjunta (todo o nada)
export const BULK_OPS = { assign: 'Asignar valor', add: 'Sumar una cantidad', multiply: 'Multiplicar por un factor' };

// Previsualiza una operación sobre filas numéricas escalares COMPATIBLES. `amount` está en la unidad VISIBLE de la fila
// (puntos porcentuales en las probabilidades). Devuelve { ok, items, problems }: si algo es inválido no se modifica nada.
export function bulkPreview(effective, rowIds, op, amount) {
  const rows = buildRows(effective); const { byId } = indexRows(rows);
  const ctx = { energyRange: effective.energy.range, bounds: effective.abilityBounds };
  const problems = []; const items = [];
  if (!BULK_OPS[op]) problems.push(`operación desconocida: ${op}`);
  if (!Number.isFinite(amount)) problems.push('la cantidad debe ser un número');
  if (op === 'multiply' && Number.isFinite(amount) && amount < 0) problems.push('el factor no puede ser negativo');
  const sel = rowIds.map((id) => byId.get(id));
  if (!sel.length) problems.push('no hay filas seleccionadas');
  const first = sel.find(Boolean);
  for (let i = 0; i < sel.length; i++) {
    const r = sel[i];
    if (!r || r.missing) { problems.push(`${rowIds[i]}: fila inexistente`); continue; }
    if (!r.editable) { problems.push(`${r.id}: no es editable (${r.cls}${r.coverage !== 'consumido' ? ', sin mecanismo' : ''})`); continue; }
    if (!isScalarNumber(r)) { problems.push(`${r.id}: no es un valor numérico simple`); continue; }
    if (first && (r.type !== first.type || r.unit !== first.unit)) { problems.push(`${r.id}: no es compatible con ${first.id} (tipo/unidad distintos)`); continue; }
    const sc = scaleOf(r);
    const before = r.value;
    let after;
    if (op === 'assign') after = amount / sc;
    else if (op === 'add') after = before + amount / sc;
    else after = before * amount;
    after = Number(after.toPrecision(12)); // elimina el ruido binario sin recortar el valor al dominio
    const issues = validateRowValue(r, after, ctx).filter((x) => x.severity === 'error');
    items.push({ id: r.id, row: r, before, after, scale: sc, errors: issues.map((x) => x.message) });
    for (const x of issues) problems.push(`${r.id}: resultado ${after * sc} → ${x.message}`);
  }
  return { ok: problems.length === 0, items, problems, op, amount };
}
export function bulkApply(effective, preview) {
  if (!preview.ok) throw new Error(`Operación conjunta inválida: ${preview.problems[0]}`);
  return Object.fromEntries(preview.items.map((i) => [i.id, i.after]));
}

// Normalización EXPLÍCITA de un grupo que debe sumar 1: devuelve la transformación propuesta (no la aplica).
export function normalizeProposal(effective, groupId) {
  const rows = buildRows(effective).filter((r) => r.group === groupId);
  if (!rows.length) throw new Error(`grupo desconocido: ${groupId}`);
  const sum = rows.reduce((s, r) => s + r.value, 0);
  if (!(sum > 0)) throw new Error('no se puede normalizar un conjunto de masa cero');
  return rows.map((r) => ({ id: r.id, before: r.value, after: Number((r.value / sum).toPrecision(12)) }));
}

export { getAt };
