// Seguimiento de lectura del perfil (MOTOR-03, §12.1): registra qué filas CONSULTA realmente el motor mientras resuelve cada hecho.
// Envuelve una copia del perfil en proxies de solo lectura; cada lectura de una fila (o de un elemento de una fila compuesta)
// se anota. No consume azar, no modifica el perfil y no cambia ningún valor devuelto.
// La copia no cambia nunca, de modo que la resolución de cada propiedad se calcula una sola vez y se reutiliza.
import { buildRows } from './rows.js';

export function createParamTracker(profileCopy) {
  const rows = buildRows(profileCopy);
  const rowByPath = new Map();
  for (const r of rows) if (r.path && !r.missing) rowByPath.set(r.path.join('.'), r);
  const table = []; const idxOf = new Map(); // id de fila -> posición en la tabla del encuentro (orden de primera lectura)
  let current = new Set(); let muted = false;
  const rowFor = (key) => {
    let found = rowByPath.get(key) ?? null;
    if (!found) { // elemento de una fila compuesta (vector, curva, lista…)
      let k = key;
      while (!found && k.includes('.')) { k = k.slice(0, k.lastIndexOf('.')); found = rowByPath.get(k) ?? null; }
    }
    return found;
  };
  const readonly = () => { throw new TypeError('el perfil congelado de un encuentro es de solo lectura'); };
  const wrappers = new WeakMap();
  const wrap = (obj, path) => {
    const old = wrappers.get(obj);
    if (old) return old;
    const props = new Map();
    const p = new Proxy(obj, {
      get(t, k) {
        let e = props.get(k);
        if (e === undefined) {
          const v = t[k];
          if (typeof k === 'symbol' || typeof v === 'function') e = { v, row: null, idx: -1, child: null };
          else {
            const key = path ? `${path}.${k}` : k;
            const isObj = v !== null && typeof v === 'object';
            e = { v, row: isObj ? (rowByPath.get(key) ?? null) : rowFor(key), idx: -1, child: isObj ? wrap(v, key) : null };
          }
          props.set(k, e);
        }
        if (e.row !== null && !muted) {
          if (e.idx < 0) { const id = e.row.id; let i = idxOf.get(id); if (i === undefined) { i = table.length; table.push(id); idxOf.set(id, i); } e.idx = i; }
          current.add(e.idx);
        }
        return e.child ?? e.v;
      },
      set: readonly, defineProperty: readonly, deleteProperty: readonly, setPrototypeOf: readonly,
    });
    wrappers.set(obj, p);
    return p;
  };
  return {
    profile: wrap(profileCopy, ''),
    table,
    // Ejecuta `fn` sin anotar lecturas (comprobaciones internas que no son parte de la resolución deportiva).
    quiet(fn) { const was = muted; muted = true; try { return fn(); } finally { muted = was; } },
    // Índices de las filas leídas desde la última recogida (ordenados, sin repetidos).
    drain() { const out = [...current].sort((a, b) => a - b); current = new Set(); return out; },
    // MOTOR-14: estado del seguimiento para guardar/continuar. La tabla es el orden de primera lectura; las filas que lee el constructor son las mismas en la ejecución original y en la restaurada
    // (misma entrada y perfil), de modo que el prefijo coincide y solo se añaden las leídas después. `current` son las lecturas aún no asociadas a un hecho.
    state() { return { table: [...table], current: [...current] }; },
    restore(s) {
      for (let i = 0; i < table.length; i++) if (table[i] !== s.table[i]) throw new Error('seguimiento de filas: el prefijo del constructor no coincide con el guardado');
      for (let i = table.length; i < s.table.length; i++) { table.push(s.table[i]); idxOf.set(s.table[i], i); }
      current = new Set(s.current);
    },
  };
}
