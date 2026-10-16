// Biblioteca local de perfiles (SUP02/SUP03): versiones inmutables, borradores, historial, activación y conservación.
// Sin DOM y sin sistema de ficheros: el almacenamiento se inyecta (localStorage en el navegador, memoria en las pruebas).
// Nada se da por guardado si falló, y los datos dañados nunca se sustituyen en silencio por la base (§9.4).
import { buildRows, indexRows } from './rows.js';
import { validateProfile } from './validate.js';
import { resolveOverrides, overridesBetween, diffEffective } from './model.js';
import { deepCopy, contentHash, canonical, getAt } from './util.js';
import { ENGINE_VERSION } from '../match/data.js';

export const LIBRARY_FORMAT = 'beM-profiles/1';
export const PROFILE_EXPORT_FORMAT = 'beM-profile-export/1';
export const LIBRARY_EXPORT_FORMAT = 'beM-profiles-library-export/1';
export const STORAGE_KEY = 'beM.motor03.profiles.v1';
const ACTOR = 'Dennis';

export class MemoryStorage {
  constructor(data = {}) { this.data = { ...data }; this.failWrites = false; this.quota = Infinity; }
  getItem(k) { return k in this.data ? this.data[k] : null; }
  setItem(k, v) {
    if (this.failWrites) throw new Error('almacenamiento no disponible');
    if (String(v).length > this.quota) { const e = new Error('cuota de almacenamiento superada'); e.name = 'QuotaExceededError'; throw e; }
    this.data[k] = String(v);
  }
  removeItem(k) { delete this.data[k]; }
}

const fail = (message, extra = {}) => ({ ok: false, error: message, ...extra });
const okr = (extra = {}) => ({ ok: true, ...extra });

export class ProfileLibrary {
  // base: perfil efectivo base (SEM-MOTOR01 + MOTOR-02 a MOTOR-08). Se registra protegido como V0.
  constructor({ storage = null, base, now = () => new Date().toISOString(), players = null, validateFixtures = null } = {}) {
    this.storage = storage; this.now = now; this.players = players; this.validateFixtures = validateFixtures;
    this.baseEffective = deepCopy(base); this.baseHash = contentHash(this.baseEffective);
    this.loadError = null; this.saveState = { saved: !storage, error: null, at: null, blocked: false };
    this.state = null; this.effCache = new Map();
    this._load();
    if (!this.state) this._init();
    this._ensureBase();
  }

  // ---------------------------------------------------------------- carga y conservación
  _init() {
    this.state = { format: LIBRARY_FORMAT, counters: { v: 0, d: 0, h: 0, c: 0 }, versions: {}, order: [], baseId: null, activeId: null, drafts: {}, history: [], comparisons: [] };
  }
  _load() {
    if (!this.storage) return;
    let raw;
    try { raw = this.storage.getItem(STORAGE_KEY); } catch (e) { this.loadError = { message: `no se pudo leer el almacenamiento local: ${e.message}`, raw: null }; this.saveState.blocked = true; return; }
    if (raw == null) return;
    try {
      const s = JSON.parse(raw);
      if (!s || s.format !== LIBRARY_FORMAT) throw new Error(`formato local no reconocido (${s?.format ?? 'sin formato'})`);
      for (const k of ['versions', 'order', 'drafts', 'history', 'comparisons', 'counters']) if (!s[k]) throw new Error(`falta ${k}`);
      for (const id of s.order) {
        const v = s.versions[id];
        if (!v || contentHash(v.effective) !== v.hash) throw new Error(`la versión ${id} no coincide con su huella (datos dañados)`);
      }
      this.state = s;
    } catch (e) {
      // No se reemplaza nada: se conserva el texto original para exportarlo y se bloquea el guardado hasta que Dennis decida.
      this.loadError = { message: `datos locales ilegibles o dañados: ${e.message}`, raw };
      this.saveState.blocked = true;
    }
  }
  _ensureBase() {
    const s = this.state;
    const existing = s.order.map((id) => s.versions[id]).find((v) => v.kind === 'base' && v.hash === this.baseHash);
    if (existing) { s.baseId = existing.id; if (!s.activeId) s.activeId = existing.id; return; }
    const id = `V${s.counters.v++}`;
    const v = { id, label: 'Base inicial protegida', kind: 'base', createdAt: this.now(), actor: ACTOR, parent: null, overrides: {}, hash: this.baseHash, effective: deepCopy(this.baseEffective), status: 'SEM', reason: 'Configuración efectiva real de main (SEM-MOTOR01 + SEM-MOTOR02 + … + SEM-MOTOR09: reglamento y acta con matriz normativa de estado de contraste por fila, ruta B de la memoria, entrenador automático, estados, saques y defensa). Operativa para su subconjunto; no calibrada globalmente. La activación es explícita desde Panel › Inicio: una versión activa anterior no se migra en silencio.', validation: null, sourceDraft: null, evaluation: [] };
    v.validation = this._validationSummary(v.effective, null);
    s.versions[id] = v; s.order.push(id); s.baseId = id; if (!s.activeId) s.activeId = id;
    this._log({ kind: 'base', versionId: id, reason: v.reason });
    this.save();
  }
  save() {
    if (!this.storage) { this.saveState = { saved: true, error: null, at: this.now(), blocked: false, memoryOnly: true }; return okr(); }
    if (this.saveState.blocked) { return fail('guardado bloqueado: hay datos locales dañados sin resolver. Exporta lo recuperable o descarta los datos locales de forma explícita.'); }
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state)); this.saveState = { saved: true, error: null, at: this.now(), blocked: false }; return okr(); }
    catch (e) { this.saveState = { saved: false, error: `NO se guardó: ${e.message}. Los cambios siguen en memoria; exporta el perfil o libera espacio.`, at: this.now(), blocked: false }; return fail(this.saveState.error); }
  }
  // Descarta explícitamente los datos locales dañados y arranca desde la base (acción de Dennis).
  discardDamagedLocalData() {
    if (!this.loadError) return fail('no hay datos dañados');
    this.loadError = null; this.saveState.blocked = false; this._init(); this.effCache.clear(); this._ensureBase();
    return this.save();
  }

  // ---------------------------------------------------------------- consulta
  get activeId() { return this.state.activeId; }
  get baseId() { return this.state.baseId; }
  version(id) { return this.state.versions[id] ?? null; }
  versions() { return this.state.order.map((id) => this.state.versions[id]); }
  activeVersion() { return this.state.versions[this.state.activeId]; }
  drafts({ includeClosed = false } = {}) { return Object.values(this.state.drafts).filter((d) => includeClosed || d.status === 'abierto'); }
  draft(id) { return this.state.drafts[id] ?? null; }
  history(filter = {}) { return this.state.history.filter((h) => (!filter.draftId || h.draftId === filter.draftId) && (!filter.versionId || h.versionId === filter.versionId)); }
  comparisons() { return this.state.comparisons; }
  profileRef(versionId) { const v = this.version(versionId); return v ? { versionId: v.id, label: v.label, kind: v.kind, hash: v.hash } : null; }
  draftEffective(id) {
    const d = this.draft(id); if (!d) throw new Error(`borrador desconocido: ${id}`);
    const c = this.effCache.get(id);
    if (c && c.rev === d.revision) return c.eff;
    const parent = this.version(d.parent.id);
    const eff = resolveOverrides(parent.effective, d.overrides);
    this.effCache.set(id, { rev: d.revision, eff });
    return eff;
  }

  _log(entry) {
    const s = this.state;
    const h = { id: `H${++s.counters.h}`, ts: this.now(), actor: ACTOR, ...entry };
    s.history.push(h); return h;
  }
  _validationSummary(effective, base) {
    const r = validateProfile(effective, { base, players: this.players, validateFixtures: this.validateFixtures });
    return { summary: r.summary, issues: r.issues.slice(0, 200), at: this.now(), totalIssues: r.issues.length };
  }

  // ---------------------------------------------------------------- borradores
  createDraft(fromVersionId, { name, reason = '' } = {}) {
    const parent = this.version(fromVersionId);
    if (!parent) return fail(`versión desconocida: ${fromVersionId}`);
    const s = this.state; const id = `D${++s.counters.d}`;
    const d = { id, name: name?.trim() || `Candidata sobre ${parent.label}`, status: 'abierto', parent: { id: parent.id, hash: parent.hash, label: parent.label }, overrides: {}, revision: 1, reason, createdAt: this.now(), updatedAt: this.now(), validation: null, evaluations: [], importedFrom: null, publishedAs: null };
    s.drafts[id] = d;
    this._log({ kind: 'borrador-creado', draftId: id, versionId: parent.id, reason: reason || `clon de ${parent.label}` });
    return { ...this.save(), draft: d };
  }
  // changes: { idFila: nuevoValor }. Solo filas editables; la forma debe coincidir. El dominio lo valida la validación (el borrador admite pasos intermedios).
  editDraft(draftId, changes, reason = '') {
    const d = this.draft(draftId);
    if (!d || d.status !== 'abierto') return fail('el borrador no existe o está cerrado');
    const parent = this.version(d.parent.id);
    const cur = this.draftEffective(draftId);
    const { byId: curRows } = indexRows(buildRows(cur));
    const { byId: parRows } = indexRows(buildRows(parent.effective));
    const problems = []; const log = []; const next = { ...d.overrides };
    for (const [id, value] of Object.entries(changes)) {
      const r = curRows.get(id);
      if (!r || r.missing) { problems.push(`${id}: fila inexistente`); continue; }
      if (!r.editable) { problems.push(`${id}: no es editable (${r.cls === 'reglamento' ? 'obligación reglamentaria' : r.cls === 'invariante' ? 'invariante funcional' : r.locked ? 'solo lectura en esta entrega' : 'sin mecanismo que la consulte'})`); continue; }
      if (!sameShape(r.value, value)) { problems.push(`${id}: forma de valor distinta de la actual`); continue; }
      const before = r.value; const parentVal = parRows.get(id)?.value;
      if (canonical(before) === canonical(value)) continue;
      if (canonical(parentVal) === canonical(value)) delete next[id]; else next[id] = deepCopy(value);
      log.push({ row: id, before: deepCopy(before), after: deepCopy(value) });
    }
    if (problems.length) return fail(`No se aplicó nada: ${problems.join('; ')}`, { problems });
    if (!log.length) return okr({ changed: 0 });
    d.overrides = next; d.revision += 1; d.updatedAt = this.now(); d.validation = null;
    this._log({ kind: 'edicion', draftId, revision: d.revision, changes: log, reason });
    return { ...this.save(), changed: log.length, revision: d.revision };
  }
  // Restablecer la herencia: elimina la sobreescritura (el valor vuelve al del padre versionado, no a cero).
  resetRow(draftId, rowId, reason = 'restablecer herencia') {
    const d = this.draft(draftId);
    if (!d || d.status !== 'abierto') return fail('el borrador no existe o está cerrado');
    if (!(rowId in d.overrides)) return okr({ changed: 0 });
    const before = deepCopy(d.overrides[rowId]);
    const parent = this.version(d.parent.id);
    const pv = indexRows(buildRows(parent.effective)).byId.get(rowId)?.value;
    delete d.overrides[rowId]; d.revision += 1; d.updatedAt = this.now(); d.validation = null;
    this._log({ kind: 'herencia-restablecida', draftId, revision: d.revision, changes: [{ row: rowId, before, after: deepCopy(pv) }], reason });
    return { ...this.save(), changed: 1 };
  }
  renameDraft(draftId, { name, reason }) {
    const d = this.draft(draftId); if (!d) return fail('borrador desconocido');
    if (name != null) d.name = name; if (reason != null) d.reason = reason; d.updatedAt = this.now();
    return this.save();
  }
  discardDraft(draftId, reason = '') {
    const d = this.draft(draftId); if (!d || d.status !== 'abierto') return fail('el borrador no existe o ya está cerrado');
    d.status = 'descartado'; d.updatedAt = this.now();
    this._log({ kind: 'borrador-descartado', draftId, revision: d.revision, reason });
    return this.save();
  }

  // ---------------------------------------------------------------- MOTOR-04/05: perfiles anteriores
  // Una versión anterior a SEM-MOTOR04 conserva su identidad y no se migra en silencio. Esta operación explícita crea un BORRADOR sobre la
  // base nueva con los valores que esa versión había cambiado respecto a su base legada (solo filas que siguen existiendo y no han sido
  // sustituidas por la extensión). El resultado hay que validarlo y publicarlo como cualquier candidata.
  isLegacy(versionId) { const v = this.version(versionId); return !!v && (!v.effective?.moment || !v.effective?.coach || !v.effective?.regulation); } // MOTOR-09: sin estados (MOTOR-07), entrenador y memoria (MOTOR-08) ni reglamento y acta (MOTOR-09) no puede jugar el motor actual
  upgradeCandidate(oldVersionId) {
    const old = this.version(oldVersionId);
    if (!old) return fail(`versión desconocida: ${oldVersionId}`);
    if (!this.isLegacy(oldVersionId)) return fail('esa versión ya incluye el reglamento y el acta de MOTOR-09');
    const newBase = this.version(this.state.baseId);
    if (!newBase || this.isLegacy(newBase.id)) return fail('no hay una base de MOTOR-09 protegida en la biblioteca');
    const legacyBase = this.versions().find((v) => v.kind === 'base' && this.isLegacy(v.id));
    const replaced = new Set((newBase.effective.extensions ?? []).flatMap((e) => (e.replaced ?? []).map((r) => r.path)));
    const carried = {}; const skipped = [];
    if (legacyBase && old.id !== legacyBase.id) {
      const d = diffEffective(legacyBase.effective, old.effective);
      const { byId } = indexRows(buildRows(newBase.effective));
      for (const c of d.changed) {
        const row = byId.get(c.id);
        if (!row || row.missing || !row.editable || [...replaced].some((p) => c.id === p || c.id.startsWith(`${p}.`))) { skipped.push(c.id); continue; }
        carried[c.id] = deepCopy(c.after);
      }
    }
    const made = this.createDraft(newBase.id, { name: `Candidata MOTOR-09 desde ${old.id} «${old.label}»`, reason: `Valores de ${old.id} llevados a la base de MOTOR-09 (${Object.keys(carried).length} filas${skipped.length ? `; ${skipped.length} no se trasladan: sustituidas por la extensión o inexistentes` : ''}). Pendiente de validar y publicar.` });
    if (!made.ok) return made;
    if (Object.keys(carried).length) { const e = this.editDraft(made.draft.id, carried, `traslado desde ${old.id}`); if (!e.ok) return e; }
    return { ok: true, draft: this.draft(made.draft.id), carried: Object.keys(carried), skipped };
  }

  // ---------------------------------------------------------------- validación, evaluación, publicación, activación
  validateDraft(draftId) {
    const d = this.draft(draftId); if (!d) return fail('borrador desconocido');
    let eff;
    try { eff = this.draftEffective(draftId); } catch (e) { return fail(e.message); }
    const v = this._validationSummary(eff, this.version(this.state.baseId).effective);
    d.validation = { revision: d.revision, ...v };
    this._log({ kind: 'validacion', draftId, revision: d.revision, validation: { errors: v.summary.errors, avisos: v.summary.avisos } });
    return { ...this.save(), validation: d.validation };
  }
  validationIsCurrent(draftId) { const d = this.draft(draftId); return !!d?.validation && d.validation.revision === d.revision; }
  recordComparison(summary) {
    const s = this.state; const id = `C${++s.counters.c}`;
    const rec = { id, at: this.now(), ...summary };
    s.comparisons.push(rec);
    if (summary.draftId && this.draft(summary.draftId)) { const d = this.draft(summary.draftId); d.evaluations.push({ revision: summary.candidateRevision, comparisonId: id }); }
    this._log({ kind: 'comparacion', draftId: summary.draftId ?? null, revision: summary.candidateRevision ?? null, comparisonId: id, reason: summary.question ?? '' });
    return { ...this.save(), comparison: rec };
  }
  // La evaluación solo cuenta para la revisión exacta con la que se hizo: tras editar, no se hereda.
  evaluationsFor(draftId) { const d = this.draft(draftId); return d ? d.evaluations.filter((e) => e.revision === d.revision) : []; }

  publish(draftId, { label, reason = '' } = {}) {
    const d = this.draft(draftId); if (!d || d.status !== 'abierto') return fail('el borrador no existe o está cerrado');
    if (!this.validationIsCurrent(draftId)) return fail('la validación no corresponde a esta revisión del borrador: valida antes de publicar');
    if (d.validation.summary.errors > 0) return fail(`no se puede publicar: ${d.validation.summary.errors} error(es) de validación`);
    const eff = this.draftEffective(draftId); const hash = contentHash(eff);
    const same = this.versions().find((v) => v.hash === hash);
    if (same) return fail(`el contenido ya existe como versión ${same.id} («${same.label}»): no se duplica`, { existing: same.id });
    const s = this.state; const id = `V${s.counters.v++}`;
    const parent = this.version(d.parent.id);
    const v = { id, label: label?.trim() || d.name, kind: d.importedFrom ? 'importada' : 'publicada', createdAt: this.now(), actor: ACTOR, parent: { id: parent.id, hash: parent.hash, label: parent.label }, overrides: deepCopy(d.overrides), hash, effective: deepCopy(eff), status: 'SEM', reason: reason || d.reason, validation: { summary: d.validation.summary, at: d.validation.at }, sourceDraft: { id: d.id, revision: d.revision }, evaluation: this.evaluationsFor(draftId).map((e) => e.comparisonId), importedFrom: d.importedFrom };
    s.versions[id] = v; s.order.push(id); d.status = 'publicado'; d.publishedAs = id; d.updatedAt = this.now();
    this._log({ kind: 'publicacion', draftId, versionId: id, revision: d.revision, reason: reason || d.reason });
    return { ...this.save(), version: v };
  }
  // Activación: solo afecta a los PRÓXIMOS encuentros. La acción es explícita; nunca se deriva de una comparación.
  activate(versionId, reason = '') {
    const v = this.version(versionId); if (!v) return fail('versión desconocida');
    if (v.validation?.summary?.errors > 0) return fail('la versión tiene errores de validación: no se puede activar');
    const prev = this.state.activeId;
    if (prev === versionId) return okr({ changed: false });
    this.state.activeId = versionId;
    this._log({ kind: 'activacion', versionId, reason: reason || `antes: ${prev}` , previous: prev });
    return { ...this.save(), changed: true };
  }
  restoreBase(reason = 'volver a la base conocida') { return this.activate(this.state.baseId, reason); }

  // ---------------------------------------------------------------- intercambio
  exportVersion(versionId) {
    const v = this.version(versionId); if (!v) return null;
    const parent = v.parent ? this.version(v.parent.id) : null;
    return this._exportBody({ identity: { id: v.id, label: v.label, kind: v.kind, hash: v.hash, status: v.status }, createdAt: v.createdAt, reason: v.reason, parent, overrides: v.overrides, effective: v.effective, validation: v.validation });
  }
  exportDraft(draftId) {
    const d = this.draft(draftId); if (!d) return null;
    const eff = this.draftEffective(draftId); const parent = this.version(d.parent.id);
    return this._exportBody({ identity: { id: d.id, label: d.name, kind: 'borrador', hash: contentHash(eff), status: 'SEM' }, createdAt: d.createdAt, reason: d.reason, parent, overrides: d.overrides, effective: eff, validation: d.validation ?? this._validationSummary(eff, this.version(this.state.baseId).effective) });
  }
  _exportBody({ identity, createdAt, reason, parent, overrides, effective, validation }) {
    const rows = buildRows(effective);
    return {
      format: PROFILE_EXPORT_FORMAT, exportedAt: this.now(), engine: { version: ENGINE_VERSION },
      identity, provenance: { createdAt, actor: ACTOR, reason, note: 'Una exportación no convierte SEM en referencia contrastada.' },
      parent: parent ? { id: parent.id, label: parent.label, hash: parent.hash, effective: parent.effective } : null,
      overrides, effective, validation: validation ? { summary: validation.summary, at: validation.at } : null,
      coverage: { rows: rows.length, byClass: countBy(rows, 'cls'), byCoverage: countBy(rows, 'coverage'), evidence: 'SEM (sin referencia empírica)' },
      dictionary: rows.map((r) => ({ id: r.id, label: r.label, unit: r.unit, type: r.type, class: r.cls, group: r.grp, mechanism: r.mech, coverage: r.coverage })),
    };
  }
  exportLibrary() {
    return { format: LIBRARY_EXPORT_FORMAT, exportedAt: this.now(), engine: { version: ENGINE_VERSION }, state: this.state, note: 'Copia recuperable de la biblioteca local de perfiles.' };
  }

  // Valida un archivo de perfil y, si es aceptable, lo incorpora como BORRADOR (no activa ni sobrescribe nada).
  analyzeImport(file) {
    const problems = []; const notes = [];
    if (!file || typeof file !== 'object' || Array.isArray(file)) return { ok: false, problems: ['el archivo no es un objeto JSON de perfil'], notes };
    if (file.format !== PROFILE_EXPORT_FORMAT) return { ok: false, problems: [`formato no reconocido: ${String(file.format)} (se espera ${PROFILE_EXPORT_FORMAT})`], notes };
    if (file.engine?.version !== ENGINE_VERSION) problems.push(`versión de motor distinta (${file.engine?.version ?? 'desconocida'} ≠ ${ENGINE_VERSION}): no se garantiza que sus filas signifiquen lo mismo; no se importa`);
    if (!file.effective || typeof file.effective !== 'object') return { ok: false, problems: [...problems, 'falta el conjunto efectivo'], notes };
    if (!file.identity?.hash || contentHash(file.effective) !== file.identity.hash) problems.push('la huella del conjunto efectivo no coincide con la declarada (archivo alterado o dañado)');
    const val = validateProfile(file.effective, { base: this.version(this.state.baseId).effective, players: this.players, validateFixtures: this.validateFixtures });
    for (const i of val.issues.filter((x) => x.severity === 'error')) problems.push(`${i.id}: ${i.message}`);
    const same = this.versions().find((v) => v.hash === file.identity?.hash) ?? this.drafts().find((d) => { try { return contentHash(this.draftEffective(d.id)) === file.identity?.hash; } catch { return false; } }) ?? null;
    const warnings = val.issues.filter((x) => x.severity === 'aviso');
    return { ok: problems.length === 0, problems, notes, recognized: same ?? null, validation: val.summary, warnings, file };
  }
  importProfile(file, { name } = {}) {
    const a = this.analyzeImport(file);
    if (!a.ok) return fail(`Importación rechazada: ${a.problems[0]}`, { problems: a.problems });
    if (a.recognized) return okr({ recognized: a.recognized.id, message: `Ya existe como ${a.recognized.id} («${a.recognized.label ?? a.recognized.name}»): no se duplica.` });
    // padre: por huella si existe en local; si no, se registra su instantánea como versión de referencia importada
    let parent = null;
    if (file.parent?.effective) {
      const ph = contentHash(file.parent.effective);
      if (ph !== file.parent.hash) return fail('Importación rechazada: la huella del padre incluido no coincide');
      parent = this.versions().find((v) => v.hash === ph) ?? null;
      if (!parent) {
        const pv = validateProfile(file.parent.effective, { base: this.version(this.state.baseId).effective });
        if (pv.summary.errors) return fail('Importación rechazada: el padre incluido no es un perfil válido');
        const s = this.state; const id = `V${s.counters.v++}`;
        parent = { id, label: `${file.parent.label} (padre importado)`, kind: 'importada', createdAt: this.now(), actor: ACTOR, parent: null, overrides: {}, hash: ph, effective: deepCopy(file.parent.effective), status: 'SEM', reason: 'Padre incluido en un archivo importado', validation: { summary: pv.summary, at: this.now() }, sourceDraft: null, evaluation: [], importedFrom: { id: file.parent.id, hash: ph } };
        s.versions[id] = parent; s.order.push(id);
        this._log({ kind: 'importacion-padre', versionId: id, reason: `padre de ${file.identity.label}` });
      }
    } else parent = this.version(this.state.baseId);
    let overrides;
    try { overrides = overridesBetween(parent.effective, file.effective); } catch (e) { return fail(`Importación rechazada: ${e.message}`, { diff: e.diff }); }
    const s = this.state; const id = `D${++s.counters.d}`;
    const d = { id, name: name?.trim() || `${file.identity.label} (importada)`, status: 'abierto', parent: { id: parent.id, hash: parent.hash, label: parent.label }, overrides, revision: 1, reason: file.provenance?.reason ?? '', createdAt: this.now(), updatedAt: this.now(), validation: null, evaluations: [], importedFrom: { id: file.identity.id, label: file.identity.label, hash: file.identity.hash, exportedAt: file.exportedAt }, publishedAs: null };
    s.drafts[id] = d;
    this._log({ kind: 'importacion', draftId: id, reason: `importada desde ${file.identity.label} (${file.identity.hash.slice(0, 8)})`, changes: Object.keys(overrides).map((k) => ({ row: k })) });
    return { ...this.save(), draft: d, warnings: a.warnings, parentRegistered: parent.id };
  }
  importLibrary(file) {
    if (file?.format !== LIBRARY_EXPORT_FORMAT) return fail(`formato no reconocido: ${String(file?.format)}`);
    if (file.engine?.version !== ENGINE_VERSION) return fail(`versión de motor distinta (${file.engine?.version}): no se importa`);
    const st = file.state; const report = { versions: 0, recognized: 0, drafts: 0, rejected: [] };
    try {
      for (const id of st.order) {
        const v = st.versions[id];
        if (contentHash(v.effective) !== v.hash) { report.rejected.push(`${id}: huella no coincide`); continue; }
        if (v.kind === 'base') continue;
        const ex = this.versions().find((x) => x.hash === v.hash);
        if (ex) { report.recognized += 1; continue; }
        const s = this.state; const nid = `V${s.counters.v++}`;
        s.versions[nid] = { ...deepCopy(v), id: nid, kind: 'importada', parent: null, importedFrom: { id, hash: v.hash }, evaluation: [] }; s.order.push(nid); report.versions += 1;
      }
      for (const d of Object.values(st.drafts)) {
        if (d.status !== 'abierto') continue;
        const parent = this.versions().find((x) => x.hash === d.parent.hash) ?? this.version(this.state.baseId);
        let eff; try { eff = resolveOverrides(parent.effective, d.overrides); } catch { report.rejected.push(`borrador ${d.id}: no resoluble`); continue; }
        void eff;
        const s = this.state; const nid = `D${++s.counters.d}`;
        s.drafts[nid] = { ...deepCopy(d), id: nid, status: 'abierto', parent: { id: parent.id, hash: parent.hash, label: parent.label }, revision: 1, validation: null, evaluations: [], importedFrom: { id: d.id, hash: d.parent.hash }, publishedAs: null }; report.drafts += 1;
      }
    } catch (e) { return fail(`Importación de biblioteca rechazada: ${e.message}`); }
    this._log({ kind: 'importacion-biblioteca', reason: `${report.versions} versiones, ${report.drafts} borradores, ${report.recognized} reconocidas` });
    return { ...this.save(), report };
  }
}

function countBy(rows, k) { const o = {}; for (const r of rows) o[r[k]] = (o[r[k]] ?? 0) + 1; return o; }
// La forma de un valor editado debe coincidir con la del actual (mismos tipos; listas de igual longitud salvo curvas de nodos).
function sameShape(a, b) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    const curve = a.length >= 2 && Array.isArray(a[0]);
    if (!curve && a.length !== b.length) return false;
    if (curve) return b.length >= 2 && b.every((n) => Array.isArray(n) && n.length === 2);
    return a.every((x, i) => sameShape(x, b[i]));
  }
  if (a !== null && typeof a === 'object') return b !== null && typeof b === 'object' && Object.keys(a).every((k) => k in b);
  return typeof a === typeof b;
}
export { diffEffective, getAt };
