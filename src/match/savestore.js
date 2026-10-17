// Almacén local de guardados (MOTOR-14 §10.4). Solo Node. Escritura atómica (archivo temporal + fsync + renombrado), confirmación por `meta.json` escrito en último lugar (un guardado sin meta es
// incompleto y se ignora), SHA-256 del archivo, validación de esquema/identidad/motor/integridad antes de devolver nada y NUNCA se modifica un guardado leído. Un guardado incompatible se rechaza
// con su motivo y se conserva tal cual. Guardar no sobrescribe: cada guardado tiene identidad propia derivada de su contenido (misma captura → mismo identificador, sin duplicados).
import { mkdirSync, writeFileSync, readFileSync, renameSync, existsSync, readdirSync, openSync, fsyncSync, closeSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { validateSnapshot } from './snapshot.js';
import { ENGINE_VERSION } from './data.js';
import { APP_VERSION } from '../version.js';
import { ROOT } from '../../scripts/node-data.js';

export const SAVE_META_SCHEMA = 'beM-save-meta/1';
export const DEFAULT_SAVES_ROOT = process.env.BEM_SAVES_ROOT ?? join(ROOT, 'out', 'saves');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

function writeAtomic(path, data) {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, data);
  const fd = openSync(tmp, 'r'); try { fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(tmp, path);
}

export class SaveStore {
  constructor(root = DEFAULT_SAVES_ROOT) { this.root = root; }
  dir(id) { return join(this.root, id); }

  // Guarda una captura. `info`: { label, savedAt (marca de archivo, no deportiva), branchOf (id del guardado del que procede esta rama de laboratorio) }.
  save(snapshot, info = {}) {
    const v = validateSnapshot(snapshot); if (!v.ok) { const e = new Error(`no se guarda: ${v.problems.map((p) => p.message).join('; ')}`); e.problems = v.problems; throw e; }
    const body = Buffer.from(JSON.stringify(snapshot)); const id = `SAVE-${sha256(body).slice(0, 12)}`;
    const dir = this.dir(id);
    const done = existsSync(join(dir, 'meta.json'));
    if (!done) {
      mkdirSync(dir, { recursive: true });
      const gz = gzipSync(body, { level: 6 }); writeAtomic(join(dir, 'snapshot.json.gz'), gz);
      const meta = {
        schema: SAVE_META_SCHEMA, id, label: info.label ?? snapshot.label ?? null, savedAt: info.savedAt ?? snapshot.savedAt ?? null, branchOf: info.branchOf ?? null,
        file: 'snapshot.json.gz', bytes: gz.length, bytesUncompressed: body.length, sha256: sha256(gz),
        engineVersion: snapshot.identity.engineVersion, appVersion: APP_VERSION, effectiveProfileId: snapshot.identity.effectiveProfileId, teams: snapshot.identity.teams, seed: snapshot.identity.seed,
        position: snapshot.position, detail: snapshot.options.detail,
      };
      writeAtomic(join(dir, 'meta.json'), JSON.stringify(meta, null, 1)); // la confirmación es el último paso
    }
    return JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
  }

  list() {
    if (!existsSync(this.root)) return [];
    const out = [];
    for (const id of readdirSync(this.root).filter((x) => /^SAVE-[0-9a-f]{12}$/.test(x)).sort()) {
      try {
        const meta = JSON.parse(readFileSync(join(this.dir(id), 'meta.json'), 'utf8')); const f = join(this.dir(id), meta.file);
        const ok = existsSync(f) && statSync(f).size === meta.bytes;
        out.push({ ...meta, complete: ok, compatible: meta.engineVersion === ENGINE_VERSION, ...(ok ? {} : { problem: 'archivo ausente o de otro tamaño (guardado incompleto)' }), ...(meta.engineVersion === ENGINE_VERSION ? {} : { problem: `motor ${meta.engineVersion}; el actual es ${ENGINE_VERSION}` }) });
      } catch { out.push({ id, complete: false, compatible: false, problem: 'sin meta.json (escritura no confirmada)' }); }
    }
    return out;
  }

  // Lee, verifica el SHA-256 y valida; devuelve { ok, snapshot } o { ok:false, problems } SIN tocar el archivo.
  load(id) {
    if (!/^SAVE-[0-9a-f]{12}$/.test(id)) return { ok: false, problems: [{ code: 'id', message: 'identificador de guardado no válido' }] };
    let meta; try { meta = JSON.parse(readFileSync(join(this.dir(id), 'meta.json'), 'utf8')); } catch { return { ok: false, problems: [{ code: 'incompleto', message: 'guardado inexistente o sin confirmar' }] }; }
    let gz; try { gz = readFileSync(join(this.dir(id), meta.file)); } catch { return { ok: false, problems: [{ code: 'incompleto', message: 'falta el archivo del guardado' }] }; }
    if (sha256(gz) !== meta.sha256) return { ok: false, problems: [{ code: 'integridad', message: 'el SHA-256 del archivo no coincide con el confirmado (copia alterada)' }] };
    let snapshot; try { snapshot = JSON.parse(gunzipSync(gz).toString('utf8')); } catch { return { ok: false, problems: [{ code: 'formato', message: 'el archivo no se puede descomprimir o leer' }] }; }
    const v = validateSnapshot(snapshot);
    return v.ok ? { ok: true, snapshot, meta } : { ok: false, problems: v.problems, meta };
  }

  // Descarga: el archivo comprimido tal cual y su meta (para exportar/importar fuera del almacén).
  rawFile(id) { const meta = JSON.parse(readFileSync(join(this.dir(id), 'meta.json'), 'utf8')); return { meta, bytes: readFileSync(join(this.dir(id), meta.file)) }; }
}
