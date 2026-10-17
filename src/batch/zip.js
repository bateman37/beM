// ZIP mínimo sin dependencias (MOTOR-12 §12, §15): escritura en streaming (descriptor de datos, deflate de node:zlib, sin cargar archivos grandes en memoria) y lectura con verificación
// de CRC-32. Nombres UTF-8, marcas de tiempo fijas elegidas por el llamador (un mismo contenido produce los mismos bytes). No soporta ZIP64: un archivo o un ZIP de 4 GiB o más es un error
// explícito (la partición por partes mantiene cada ZIP muy por debajo).
import { createWriteStream, createReadStream, readFileSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { createDeflateRaw, inflateRawSync, crc32 as zcrc } from 'node:zlib';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const T = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; }
export function crc32(buf, prev = 0) { if (zcrc) return zcrc(buf, prev) >>> 0; let c = ~prev >>> 0; for (let i = 0; i < buf.length; i++) c = T[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return ~c >>> 0; }
const LIMIT = 0xffffffff;
const dosTime = (d) => ((d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1)) & 0xffff;
const dosDate = (d) => ((((Math.max(1980, d.getUTCFullYear()) - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate())) & 0xffff;

export class ZipWriter {
  constructor(path, { mtime = new Date('2026-10-17T00:00:00Z') } = {}) { this.path = path; this.out = createWriteStream(path); this.pos = 0; this.entries = []; this.mtime = mtime; this.t = dosTime(mtime); this.d = dosDate(mtime); this.err = null; this.out.on('error', (e) => { this.err = e; }); }
  _write(buf) { return new Promise((res, rej) => { if (this.err) return rej(this.err); this.out.write(buf, (e) => (e ? rej(e) : res())); this.pos += buf.length; }); }
  // source: Buffer | string | { file: ruta }
  async add(name, source) {
    const nameBuf = Buffer.from(name, 'utf8'); const offset = this.pos; if (offset > LIMIT) throw new Error('ZIP64 no soportado: el archivo supera 4 GiB');
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0808, 6); lh.writeUInt16LE(8, 8); lh.writeUInt16LE(this.t, 10); lh.writeUInt16LE(this.d, 12); lh.writeUInt32LE(0, 14); lh.writeUInt32LE(0, 18); lh.writeUInt32LE(0, 22); lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
    await this._write(lh); await this._write(nameBuf);
    let crc = 0; let usize = 0; let csize = 0; const self = this;
    const counter = new Transform({ transform(chunk, _e, cb) { crc = crc32(chunk, crc); usize += chunk.length; cb(null, chunk); } });
    const sink = new Transform({ transform(chunk, _e, cb) { csize += chunk.length; self.pos += chunk.length; if (self.err) return cb(self.err); self.out.write(chunk, cb); } });
    const rs = typeof source === 'object' && !Buffer.isBuffer(source) && source.file ? createReadStream(source.file, { highWaterMark: 1 << 20 }) : null;
    if (rs) await pipeline(rs, counter, createDeflateRaw({ level: 6 }), sink);
    else { const buf = Buffer.isBuffer(source) ? source : Buffer.from(String(source), 'utf8'); await pipeline(async function* gen() { yield buf; }, counter, createDeflateRaw({ level: 6 }), sink); }
    if (usize > LIMIT || csize > LIMIT) throw new Error(`ZIP64 no soportado: ${name} supera 4 GiB`);
    const dd = Buffer.alloc(16); dd.writeUInt32LE(0x08074b50, 0); dd.writeUInt32LE(crc >>> 0, 4); dd.writeUInt32LE(csize, 8); dd.writeUInt32LE(usize, 12); await this._write(dd);
    this.entries.push({ name, nameBuf, crc: crc >>> 0, csize, usize, offset });
    return { name, bytes: usize, crc32: crc >>> 0, compressed: csize };
  }
  async finish() {
    const start = this.pos; let size = 0;
    for (const e of this.entries) {
      const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0808, 8); ch.writeUInt16LE(8, 10); ch.writeUInt16LE(this.t, 12); ch.writeUInt16LE(this.d, 14); ch.writeUInt32LE(e.crc, 16); ch.writeUInt32LE(e.csize, 20); ch.writeUInt32LE(e.usize, 24); ch.writeUInt16LE(e.nameBuf.length, 28); ch.writeUInt32LE(e.offset, 42);
      await this._write(ch); await this._write(e.nameBuf); size += 46 + e.nameBuf.length;
    }
    if (this.entries.length > 0xffff) throw new Error('ZIP64 no soportado: demasiados archivos en un ZIP');
    const eo = Buffer.alloc(22); eo.writeUInt32LE(0x06054b50, 0); eo.writeUInt16LE(this.entries.length, 8); eo.writeUInt16LE(this.entries.length, 10); eo.writeUInt32LE(size, 12); eo.writeUInt32LE(start, 16); await this._write(eo);
    await new Promise((res, rej) => this.out.end((e) => (e ? rej(e) : res())));
    return { entries: this.entries.length, bytes: this.pos };
  }
}

// Lectura: directorio central → entradas; `read(name)` descomprime y verifica CRC y tamaño.
export function openZip(path) {
  const size = statSync(path).size; const fd = openSync(path, 'r');
  try {
    const tailLen = Math.min(size, 65557); const tail = Buffer.alloc(tailLen); readSync(fd, tail, 0, tailLen, size - tailLen);
    let eocd = -1; for (let i = tailLen - 22; i >= 0; i--) if (tail.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('no es un ZIP (falta el directorio central)');
    const n = tail.readUInt16LE(eocd + 10); const csize = tail.readUInt32LE(eocd + 12); const coff = tail.readUInt32LE(eocd + 16);
    const cd = Buffer.alloc(csize); readSync(fd, cd, 0, csize, coff); const entries = []; let p = 0;
    for (let i = 0; i < n; i++) {
      if (cd.readUInt32LE(p) !== 0x02014b50) throw new Error('directorio central corrupto');
      const method = cd.readUInt16LE(p + 10); const crc = cd.readUInt32LE(p + 16); const cs = cd.readUInt32LE(p + 20); const us = cd.readUInt32LE(p + 24); const nl = cd.readUInt16LE(p + 28); const xl = cd.readUInt16LE(p + 30); const cl = cd.readUInt16LE(p + 32); const off = cd.readUInt32LE(p + 42);
      entries.push({ name: cd.toString('utf8', p + 46, p + 46 + nl), method, crc, csize: cs, usize: us, offset: off }); p += 46 + nl + xl + cl;
    }
    return { path, size, entries, names: entries.map((e) => e.name),
      read(name) {
        const e = entries.find((x) => x.name === name); if (!e) throw new Error(`no existe ${name} en el ZIP`);
        const lh = Buffer.alloc(30); readSync(fd2(), lh, 0, 30, e.offset); if (lh.readUInt32LE(0) !== 0x04034b50) throw new Error(`cabecera local corrupta: ${name}`);
        const dataOff = e.offset + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28); const raw = Buffer.alloc(e.csize); readSync(fd2(), raw, 0, e.csize, dataOff);
        const buf = e.method === 8 ? inflateRawSync(raw) : raw;
        if (buf.length !== e.usize) throw new Error(`tamaño distinto en ${name}`); if (crc32(buf) !== e.crc) throw new Error(`CRC-32 distinto en ${name}`);
        return buf;
      } };
  } finally { closeSync(fd); }
  function fd2() { return fdLazy(path); }
}
const fdCache = new Map(); function fdLazy(p) { let fd = fdCache.get(p); if (fd === undefined) { fd = openSync(p, 'r'); fdCache.set(p, fd); } return fd; }
export function closeZips() { for (const fd of fdCache.values()) { try { closeSync(fd); } catch { /* ya cerrado */ } } fdCache.clear(); }
export const readZipFile = (path, name) => { const z = openZip(path); const b = z.read(name); closeZips(); return b; };
void readFileSync;
