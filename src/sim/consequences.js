// Registro IDEMPOTENTE de consecuencias por encuentro lógico (§9.2, §10.2). Abrir un histórico, importar el mismo paquete, recuperar un lote o repetir un reintento no suma otra vez minutos, puntos ni aprendizaje:
// cada consecuencia se identifica por (clase, encuentro lógico, ámbito) y se aplica UNA vez, con el intento aceptado como trazabilidad. Esta guarda es adicional a la fuente exacta del núcleo de aprendizaje
// (copia|M<n>|equipo, con lote e intento): no la debilita; añade la unicidad por encuentro lógico que un reintento técnico (intento distinto) no puede eludir.
export class ConsequenceLedger {
  // C03-06: el índice de aplicaciones VIGENTES se reconstruye solo con las anotaciones no revertidas (las revertidas se conservan como historial); la última vigente de una clave prevalece.
  constructor(records = []) { this.records = records.map((r) => ({ ...r })); this.index = new Map(); for (const r of this.records) if (!r.reverted) this.index.set(this.key(r.kind, r.matchId, r.scope), r); }
  key(kind, matchId, scope = '*') { return `${kind}|${matchId}|${scope}`; }
  has(kind, matchId, scope = '*') { return this.index.has(this.key(kind, matchId, scope)); }
  get(kind, matchId, scope = '*') { return this.index.get(this.key(kind, matchId, scope)) ?? null; }
  // `attemptId`: intento aceptado del encuentro. Devuelve { ok:false, duplicate } si la consecuencia ya constaba (con cualquier intento).
  apply({ kind, matchId, scope = '*', attemptId = null, payload = null }) {
    const prev = this.get(kind, matchId, scope); if (prev) return { ok: false, duplicate: true, duplicateOf: prev, reason: `la consecuencia «${kind}» del encuentro ${matchId} (${scope}) ya se aplicó con el intento ${prev.attemptId}` };
    const rec = { n: this.records.length + 1, kind, matchId, scope, attemptId, payload }; this.records.push(rec); this.index.set(this.key(kind, matchId, scope), rec); return { ok: true, record: rec };
  }
  // Retira (deshacer) una consecuencia concreta; el registro conserva la anotación de que fue revertida.
  revert(kind, matchId, scope = '*') { const r = this.get(kind, matchId, scope); if (!r) return { ok: false, reason: 'consecuencia desconocida' }; this.index.delete(this.key(kind, matchId, scope)); r.reverted = true; return { ok: true, record: r }; }
  toJSON() { return { schema: 'beM-sim-consequences/1', records: this.records }; }
  static from(json) { return new ConsequenceLedger(json?.records ?? []); }
}
