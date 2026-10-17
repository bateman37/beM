// Persistencia local de trabajos de lote (MOTOR-12 §6.2): un directorio por lote, excluido de Git (`out/`), con escritura progresiva y atómica. Sin base de datos ni nube.
//   job.json            estado mutable del trabajo (se reescribe con archivo temporal + renombrado)
//   entradas/…          entradas congeladas (se escriben una vez al preparar; el layout coincide con el del paquete)
//   indice.jsonl        índice append-only: inicio y confirmación de cada intento (una línea JSON por registro); es la fuente de verdad del estado
//   intentos/<M>/<A>/   archivos confirmados de cada intento (`<A>.tmp` mientras se escribe; `<A>.parcial` si se interrumpió)
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync, readdirSync, openSync, writeSync, fsyncSync, closeSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ROOT } from '../../scripts/node-data.js';

// Directorio de salida de los lotes (excluido de Git: `out/`). `BEM_BATCH_ROOT` lo sustituye (pruebas y ejecuciones aisladas).
export const DEFAULT_ROOT = process.env.BEM_BATCH_ROOT ?? join(ROOT, 'out', 'batches');
export const JOB_SCHEMA = 'beM-batch-job/1';

export class JobStore {
  constructor(root = DEFAULT_ROOT) { this.root = root; mkdirSync(root, { recursive: true }); }
  dir(id) { return join(this.root, id); }
  exists(id) { return existsSync(join(this.dir(id), 'job.json')); }
  ids() { return readdirSync(this.root, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(this.root, d.name, 'job.json'))).map((d) => d.name).sort(); }
  atomicWrite(path, text) { mkdirSync(dirname(path), { recursive: true }); const tmp = `${path}.tmp`; writeFileSync(tmp, text); renameSync(tmp, path); }
  readJob(id) { return JSON.parse(readFileSync(join(this.dir(id), 'job.json'), 'utf8')); }
  writeJob(id, job) { this.atomicWrite(join(this.dir(id), 'job.json'), JSON.stringify(job)); }
  // El índice se añade con fsync: una línea confirmada sobrevive a un cierre del proceso. Una última línea truncada se ignora al leer.
  appendIndex(id, rec) { const fd = openSync(join(this.dir(id), 'indice.jsonl'), 'a'); try { writeSync(fd, `${JSON.stringify(rec)}\n`); fsyncSync(fd); } finally { closeSync(fd); } }
  readIndex(id) {
    const p = join(this.dir(id), 'indice.jsonl'); if (!existsSync(p)) return [];
    const out = []; for (const line of readFileSync(p, 'utf8').split('\n')) { if (!line.trim()) continue; try { out.push(JSON.parse(line)); } catch { /* línea final truncada */ } }
    return out;
  }
  attemptDir(id, matchId, attemptId, suffix = '') { return join(this.dir(id), 'intentos', matchId, `${attemptId}${suffix}`); }
  writeFrozen(id, files) { for (const [rel, content] of files) this.atomicWrite(join(this.dir(id), rel), typeof content === 'string' ? content : JSON.stringify(content)); }
  readJson(id, rel) { return JSON.parse(readFileSync(join(this.dir(id), rel), 'utf8')); }
  remove(id) { rmSync(this.dir(id), { recursive: true, force: true }); }
  size(id) { let n = 0; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else n += statSync(p).size; } }; walk(this.dir(id)); return n; }
}

// Lectura de lo congelado: lote, perfil, entradas y bloques de equipo/plan. `inputFor` reconstruye la entrada completa (copia profunda) de una ejecución.
export function loadFrozen(store, id) {
  const lote = store.readJson(id, 'entradas/lote.json'); const profile = store.readJson(id, `entradas/perfiles/${lote.profile.profile_id}.json`);
  const entries = new Map(); const eq = new Map(); const pl = new Map();
  for (const ref of lote.entries) { const e = store.readJson(id, `entradas/partidos/${ref}.json`); entries.set(e.entry_key, e); entries.set(e.entry_id, e); }
  const blob = (cache, dir, ref) => { if (!cache.has(ref)) cache.set(ref, store.readJson(id, `entradas/${dir}/${ref}.json`)); return cache.get(ref); };
  const inputFor = (entry, seed) => ({ schema: entry.input_schema, seed, importance: entry.importance, ...(entry.contrast ? { contrast: structuredClone(entry.contrast) } : {}), teams: entry.teams.map((t) => ({ ...structuredClone(blob(eq, 'equipos', t.players_ref)), plan: structuredClone(blob(pl, 'planes', t.plan_ref)) })) });
  return { batch_id: lote.batch_id, lote, profile, profile_id: lote.profile.profile_id, entries, entryOf: (ex) => entries.get(ex.entry_key) ?? entries.get(ex.entry_id), inputFor, blob: { equipos: (r) => blob(eq, 'equipos', r), planes: (r) => blob(pl, 'planes', r) } };
}
