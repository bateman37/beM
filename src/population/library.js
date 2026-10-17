// Biblioteca local de la población (MOTOR-11 §13): variantes guardadas, equipos generados, escenarios y resultados de encuentros individuales. Las referencias nunca se
// guardan aquí (se reconstruyen desde los datos y están protegidas): una variante es siempre otra identidad. El almacenamiento se inyecta (localStorage o memoria).
import { deepCopy } from '../match/data.js';
import { retargetTeam, TEAM_ID } from './ids.js';
import { REFERENCE_IDS } from './reference.js';
import { diffTeams } from './edit.js';
import { fingerprint } from './hash.js';

export const POP_FORMAT = 'beM-population/1';
export const POP_KEY = 'beM.motor11.population.v1';
const MAX_RESULTS = 60;

const ok = (extra = {}) => ({ ok: true, ...extra });
const fail = (error, extra = {}) => ({ ok: false, error, ...extra });

export class PopulationLibrary {
  constructor({ storage = null, now = () => new Date().toISOString() } = {}) {
    this.storage = storage; this.now = now; this.loadError = null; this.saveState = { saved: !storage, error: null, blocked: false };
    this.state = { format: POP_FORMAT, counters: { v: 0, s: 0 }, variants: {}, generated: {}, scenarios: {}, results: [] };
    this._load();
  }
  _load() {
    if (!this.storage) return;
    let raw; try { raw = this.storage.getItem(POP_KEY); } catch (e) { this.loadError = { message: `no se pudo leer el almacenamiento local: ${e.message}`, raw: null }; this.saveState.blocked = true; return; }
    if (raw == null) return;
    try {
      const s = JSON.parse(raw);
      if (!s || s.format !== POP_FORMAT) throw new Error(`formato local no reconocido (${s?.format ?? 'sin formato'})`);
      for (const k of ['variants', 'generated', 'scenarios', 'results', 'counters']) if (!s[k]) throw new Error(`falta ${k}`);
      this.state = s;
    } catch (e) { this.loadError = { message: `datos locales ilegibles o dañados: ${e.message}`, raw }; this.saveState.blocked = true; }
  }
  save() {
    if (!this.storage) return ok();
    if (this.saveState.blocked) return fail('guardado bloqueado: hay datos locales dañados sin resolver');
    try { this.storage.setItem(POP_KEY, JSON.stringify(this.state)); this.saveState = { saved: true, error: null, blocked: false }; return ok(); }
    catch (e) { this.saveState = { saved: false, error: `NO se guardó: ${e.message}. Los cambios siguen en memoria.`, blocked: false }; return fail(this.saveState.error); }
  }
  discardDamaged() { if (!this.loadError) return fail('no hay datos dañados'); this.loadError = null; this.saveState.blocked = false; this.state = { format: POP_FORMAT, counters: { v: 0, s: 0 }, variants: {}, generated: {}, scenarios: {}, results: [] }; return this.save(); }

  // ---------------------------------------------------------------- equipos guardados
  variants() { return Object.values(this.state.variants); }
  generated() { return Object.values(this.state.generated); }
  teams() { return [...this.generated(), ...this.variants()]; }
  record(id) { return this.state.variants[id] ?? this.state.generated[id] ?? null; }
  team(id) { const r = this.record(id); return r ? deepCopy(r.team) : null; }

  // Guarda una variante EXPLÍCITA: identidad nueva derivada de la base, con diferencias legibles. Nunca sustituye una referencia ni otra variante.
  saveVariant(team, { name, base, baseTeam = null }) {
    if (!base || !base.teamId) return fail('la variante necesita identificar su base');
    const root = base.teamId; let n = this.state.counters.v;
    let id; do { n += 1; id = `${root}V${String(n).padStart(2, '0')}`; } while (REFERENCE_IDS.includes(id) || this.record(id) || !TEAM_ID.test(id));
    const inst = retargetTeam(team, id); const label = name?.trim() || `Variante de ${root}`;
    const changes = baseTeam ? diffTeams(baseTeam, inst) : [];
    inst.name = label; inst.source = { kind: 'variant', base, savedAs: id, instance: { id, of: id, from: team.id } };
    inst.source.fingerprint = fingerprint({ players: inst.players.map(({ provenance, ...p }) => p), plan: inst.plan });
    this.state.counters.v = n;
    this.state.variants[id] = { id, kind: 'variant', name: label, base, savedAt: this.now(), changes: changes.slice(0, 400), changeCount: changes.length, team: inst };
    const r = this.save(); return r.ok ? ok({ id, record: this.state.variants[id] }) : { ...r, id, record: this.state.variants[id] };
  }
  // Guarda un equipo generado ya materializado con su procedencia. Idempotente: la misma receta/semilla/valores no se duplica.
  saveGenerated(team) {
    if (team.source?.kind !== 'generated') return fail('no es un equipo generado');
    const prev = this.state.generated[team.id];
    if (prev) { if (prev.team.source.fingerprint === team.source.fingerprint) return ok({ id: team.id, existing: true, record: prev }); return fail(`ya existe ${team.id} con otros valores (otra versión de la receta o del dataset): elimínalo antes de guardar el nuevo`); }
    this.state.generated[team.id] = { id: team.id, kind: 'generated', name: team.name, savedAt: this.now(), team: deepCopy(team) };
    const r = this.save(); return r.ok ? ok({ id: team.id, record: this.state.generated[team.id] }) : { ...r, id: team.id, record: this.state.generated[team.id] };
  }
  remove(id) {
    if (REFERENCE_IDS.includes(id)) return fail('las referencias están protegidas y no se eliminan');
    const had = this.state.variants[id] ?? this.state.generated[id]; if (!had) return fail('no existe');
    delete this.state.variants[id]; delete this.state.generated[id]; return this.save();
  }

  // ---------------------------------------------------------------- escenarios guardados
  scenarios() { return Object.values(this.state.scenarios); }
  scenario(id) { return this.state.scenarios[id] ?? null; }
  saveScenario(rec) {
    const id = `S${String(this.state.counters.s + 1).padStart(2, '0')}`;
    this.state.counters.s += 1;
    this.state.scenarios[id] = { ...deepCopy(rec), id, savedAt: this.now() };
    const r = this.save(); return r.ok ? ok({ id, record: this.state.scenarios[id] }) : { ...r, id, record: this.state.scenarios[id] };
  }
  duplicateScenario(id, name) { const s = this.scenario(id); if (!s) return fail('no existe'); const { id: _i, savedAt: _t, ...rest } = s; return this.saveScenario({ ...rest, name: name ?? `${s.name} (copia)`, duplicatedFrom: id }); }
  removeScenario(id) { if (!this.state.scenarios[id]) return fail('no existe'); delete this.state.scenarios[id]; return this.save(); }

  // ---------------------------------------------------------------- resultados de encuentros individuales (comparación sin lotes)
  results() { return this.state.results; }
  logResult(entry) { this.state.results.push({ ...entry, at: this.now() }); if (this.state.results.length > MAX_RESULTS) this.state.results.splice(0, this.state.results.length - MAX_RESULTS); return this.save(); }
}
