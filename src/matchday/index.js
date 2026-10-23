// Coordinador de jornada simultánea (`beM-sim-matchday/1`, §7–8). Reloj común = TIEMPO VIRTUAL DEPORTIVO (independiente de la CPU y de los segundos reales que alguien tarde en mirar): el tiempo local de cada
// encuentro es el tiempo disputado acumulado de sus periodos menos su desfase de inicio. Los intervalos administrativos son FRONTERAS (barreras), no esperas televisivas.
// En cada barrera: (1) se publican los hechos alcanzados de TODOS los encuentros, (2) se reconstruyen marcadores y clasificación desde ese mismo presente, (3) se congelan las vistas observables, (4) se decide y se aplica
// para la siguiente frontera admitida y (5) el siguiente horizonte se genera al avanzar. El orden de llegada de los trabajadores no altera esta secuencia; la velocidad de visionado solo cambia cuánto se tarda.
import { ShardRunner } from '../sim/shard.js';
import { contextToJSON, contextFromJSON } from '../sim/context.js';
import { snapshotSim, restoreSim, validateSimSnapshot } from '../sim/snapshot.js';
import { sha256Hex, canonical } from '../sim/fp.js';
import { SIM_MATCHDAY_SCHEMA, SIM_VERSION, SIM_RESULT_SCHEMA, SIM_SNAPSHOT_COMPAT } from '../sim/version.js';
import { DetailedFixture } from './detailed.js';
import { computeTable, needFromTable, rankOf } from './standings.js';

const deep = (x) => JSON.parse(JSON.stringify(x));
export const DEFAULT_BARRIER = 120;

export class Matchday {
  constructor({ id = 'JORNADA', date = null, fixtures, standings0 = {}, objectives = [], ctx, profile = null, barrierSeconds = DEFAULT_BARRIER, policy = true, shard = null, _restore = null }) {
    this.id = id; this.date = date; this.ctx = ctx; this.profile = profile; this.barrierSeconds = barrierSeconds; this.policy = policy; this.T = 0; this.paused = false; this.barrier = 0;
    this.standings0 = standings0; this.objectives = objectives; this.log = []; this.decisions = []; this.results = {}; this.contexts = {};
    this.meta = new Map(); this.detailed = new Map(); this.shard = shard ?? new ShardRunner(ctx); if (!shard) this.shard.ctx = ctx;
    for (const f of fixtures) {
      const meta = { id: f.id, competition: f.competition ?? null, teams: f.input.teams.map((t) => t.id), resolver: f.resolver ?? 'sim', start: f.start ?? 0, controlledTeams: f.controlledTeams ?? [0], attemptId: f.attemptId ?? 1, label: f.label ?? null, youth: !!f.youth };
      this.meta.set(f.id, meta);
      if (_restore) continue;
      if (meta.resolver === 'detailed') { if (!profile) throw new Error('la jornada necesita el perfil detallado para sus encuentros detallados'); this.detailed.set(f.id, new DetailedFixture({ id: f.id, input: f.input, profile, controlledTeams: meta.controlledTeams, start: meta.start })); }
      else this.shard.add({ id: f.id, input: f.input, start: meta.start, attemptId: meta.attemptId, controlledTeams: meta.controlledTeams }); // C04: la autoridad sobre los equipos declarada llega al fragmento (antes solo la conocía el pool: la orden a un equipo sin autoridad no se rechazaba en la jornada en proceso)
    }
    this.packets = new Map(); this._publish(0);
  }
  get ids() { return [...this.meta.keys()].sort(); }
  get done() { return this.ids.every((id) => ['finished', 'error'].includes(this.packets.get(id)?.status)); }
  resolverOf(id) { return this.meta.get(id).resolver; }
  _publish(T) {
    const out = new Map();
    for (const p of this.shard.advanceAll(T)) out.set(p.id, p);
    for (const [id, d] of [...this.detailed.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) out.set(id, d.advanceTo(Math.max(0, T - d.start)));
    // C03-01: un encuentro terminado y aceptado (p. ej. recuperado de un guardado) ya no tiene resolutor activo; su paquete sale de lo conservado, una sola vez y sin regenerarlo.
    // C04: un encuentro ya terminado y aceptado publica SIEMPRE su paquete congelado al aceptarlo (también el que sigue vivo en el fragmento): antes su `local` seguía creciendo por barrera y, tras recargar, quedaba congelado,
    // de modo que la jornada recuperada no publicaba lo mismo que la ininterrumpida.
    for (const id of this.ids) if (this.results[id]) out.set(id, this._packetOfResult(id, T));
    for (const [id, p] of out) { const m = this.meta.get(id); p.competition = m.competition; p.teams = m.teams; p.youth = m.youth; p.valid = p.finished ? this._validOf(id, p) : null; }
    const ordered = new Map(this.ids.filter((id) => out.has(id)).map((id) => [id, out.get(id)])); // orden estable por identificador (igual con o sin recuperación)
    this.packets = ordered; return ordered;
  }
  // Paquete de un encuentro terminado: el publicado al aceptarlo (identidad, estado, marcador, periodos e instante observado); si el guardado es anterior, se reconstruye desde el esencial conservado.
  _packetOfResult(id, T) {
    const res = this.results[id]; const m = this.meta.get(id); if (res.packet) return deep(res.packet);
    const r = res.essential; return { id, resolver: m.resolver, start: m.start, local: Math.max(0, T - m.start), started: true, status: 'finished', published: r.durationSeconds ?? null, score: (r.score?.final ?? r.score ?? [0, 0]).slice(), periods: r.score?.periods ?? null, finished: true, observedAt: r.durationSeconds ?? null };
  }
  _validOf(id, p) { if (p.status === 'error') return false; if (this.results[id]) return this.results[id].valid !== false; return true; }
  // Tabla de una competición: 'initial' (de partida, artificial), 'provisional' (marcadores publicados) o 'final' (solo terminados válidos).
  table(comp, mode = 'provisional') {
    const base = this.standings0[comp] ?? { artificial: true, rows: [] };
    if (mode === 'initial') return computeTable(base, [], { mode: 'final' });
    return computeTable(base, [...this.packets.values()].filter((p) => p.competition === comp), { mode });
  }
  competitions() { return [...new Set([...this.meta.values()].map((m) => m.competition).filter(Boolean))].sort(); }
  // Una barrera: devuelve el registro de la barrera o un rechazo si la jornada está en pausa/terminada.
  step() {
    if (this.paused) return { ok: false, rejected: true, reason: 'jornada en pausa: no se publica nada nuevo' };
    if (this.done) return { ok: false, rejected: true, reason: 'jornada terminada' };
    this.barrier += 1; this.T = Math.round((this.T + this.barrierSeconds) * 1000) / 1000;
    const packets = this._publish(this.T); // 1) todos los encuentros alcanzan el mismo presente
    for (const p of packets.values()) if (p.finished && !this.results[p.id]) this._finish(p);
    const tables = Object.fromEntries(this.competitions().map((c) => [c, this.table(c, 'provisional')])); // 2) tabla desde ese mismo presente
    const needs = {}; // 3) vistas congeladas: necesidades declaradas evaluadas desde la tabla provisional
    for (const o of this.objectives) {
      const fx = [...this.meta.values()].find((m) => m.teams.includes(o.team) && m.competition === o.competition); if (!fx || fx.resolver !== 'sim') continue; const p = packets.get(fx.id); if (p.status !== 'running') continue;
      const teamIdx = fx.teams.indexOf(o.team); const margin = p.score[teamIdx] - p.score[1 - teamIdx]; const need = needFromTable({ ...o, teamIdx }, tables[o.competition], margin); if (need) (needs[fx.id] ??= []).push(need);
    }
    const decided = this.shard.review(this.T, needs, { policy: this.policy }); // 4) decide y aplica para la siguiente frontera admitida
    const dec = []; for (const [id, per] of Object.entries(decided)) for (const x of per) for (const d of x.decisions) { const rec = { barrier: this.barrier, T: this.T, fixture: id, ...d }; dec.push(rec); this.decisions.push(rec); }
    const rec = { barrier: this.barrier, T: this.T, packets: [...packets.values()].map((p) => ({ id: p.id, status: p.status, published: p.published, local: p.local, score: p.score, observedAt: p.observedAt, resolver: p.resolver })), tables: Object.fromEntries(Object.entries(tables).map(([c, t]) => [c, t.rows.map((r) => [r.team, r.w, r.l, r.pf, r.pa, r.pending, r.rank])])), needs: Object.fromEntries(Object.entries(needs).map(([k, v]) => [k, v.map((n) => ({ team: n.team, requiredMargin: n.requiredMargin, unmet: n.unmet, rank: n.rank }))])), decisions: dec.map((d) => ({ fixture: d.fixture, team: d.team, dim: d.dim, from: d.from, to: d.to, reason: d.reason })) };
    this.log.push(rec); return { ok: true, ...rec };
  }
  runUntil(T) { const out = []; while (!this.paused && !this.done && this.T + this.barrierSeconds <= T + 1e-9) out.push(this.step()); return out; }
  runToEnd(maxBarriers = 5000) { const out = []; let n = 0; while (!this.paused && !this.done && n++ < maxBarriers) out.push(this.step()); return out; }
  pause() { this.paused = true; return { paused: true, T: this.T }; }
  resume() { this.paused = false; return { paused: false, T: this.T }; }
  _finish(p) {
    const id = p.id; const meta = this.meta.get(id);
    if (meta.resolver === 'sim') { const e = this.shard.essential(id); this.results[id] = { model: 'sim', matchId: id, attemptId: meta.attemptId, acceptedAt: this.T, essential: e, valid: e.validity?.valid !== false }; }
    else { const d = this.detailed.get(id); const e = d.essential(); this.results[id] = { model: 'detailed', matchId: id, attemptId: meta.attemptId, acceptedAt: this.T, essential: e, valid: e.validity.valid }; }
    this.results[id].packet = { ...deep(p), valid: undefined }; p.valid = this.results[id].valid;
  }
  // Orden manual del usuario sobre un encuentro. En el detallado entra en su ventana atómica; en SIM, en la siguiente frontera canónica (source «manual»: la política no la sobrescribe).
  order(id, spec) {
    if (this.resolverOf(id) === 'detailed') return this.detailed.get(id).order(spec, this.packets.get(id).published);
    return this.shard.order(id, { ...spec, source: 'manual', at: spec.at ?? this.packets.get(id).published });
  }
  // Un encuentro terminado y recuperado (o liberado tras terminar) devuelve lo CONSERVADO con su cobertura; nunca se regenera ni se busca un motor que ya no existe.
  result(id, opts = {}) {
    const res = this.results[id];
    if (this.resolverOf(id) === 'sim') { if (res && (!this.shard.has(id) || this.shard.released(id))) return { conserved: true, coverage: 'essential', matchId: id, attemptId: res.attemptId, acceptedAt: res.acceptedAt, valid: res.valid, essential: res.essential }; return this.shard.result(id, opts); }
    if (res && !this.detailed.has(id)) return { conserved: true, coverage: 'essential', matchId: id, attemptId: res.attemptId, acceptedAt: res.acceptedAt, valid: res.valid, essential: res.essential };
    return this.detailed.get(id).result();
  }
  view() { return { id: this.id, T: this.T, barrier: this.barrier, paused: this.paused, done: this.done, fixtures: this.ids.map((id) => ({ ...this.packets.get(id), label: this.meta.get(id).label })), tables: Object.fromEntries(this.competitions().map((c) => [c, { initial: this.table(c, 'initial'), provisional: this.table(c, 'provisional'), final: this.done ? this.table(c, 'final') : null }])) }; }
  rank(comp, team, mode = 'provisional') { return rankOf(this.table(comp, mode), team); }

  // ---- guardado y recuperación (el estado SIM vive en el fragmento; el detallado, en su adaptador)
  // C03-02: instante independiente. Resultados, registro y decisiones se copian por valor; solo el contexto (perfil y tablas inmutables) se referencia. La suma se calcula sobre lo que se guarda.
  snapshot() {
    const fixtures = this.ids.map((id) => { const m = this.meta.get(id); const res = this.results[id] ?? null; const live = !res; return { meta: deep(m), result: res ? deep(res) : null, state: !live ? null : m.resolver === 'sim' ? snapshotSim(this.shard.matches.get(id).m, { embedContext: false }) : deep(this.detailed.get(id).snapshot(`${this.id}:${id}`)) }; });
    const payload = { schema: SIM_MATCHDAY_SCHEMA, simVersion: SIM_VERSION, resultSchema: SIM_RESULT_SCHEMA, id: this.id, date: this.date, T: this.T, barrier: this.barrier, paused: this.paused, barrierSeconds: this.barrierSeconds, policy: this.policy, ctx: contextToJSON(this.ctx), standings0: deep(this.standings0), objectives: deep(this.objectives), fixtures, log: deep(this.log), decisions: deep(this.decisions) };
    const body = canonical(payload); return { ...payload, integrity: { algorithm: 'sha256', digest: sha256Hex(body), bytes: body.length } };
  }
  static validate(snap) {
    const errs = []; const add = (path, message) => errs.push({ path, message });
    if (!snap || typeof snap !== 'object') { add('snapshot', 'guardado de jornada ausente'); return errs; }
    if (snap.schema !== SIM_MATCHDAY_SCHEMA) { add('schema', `versión incompatible (${snap.schema}); se lee ${SIM_MATCHDAY_SCHEMA}`); return errs; }
    for (const k of ['ctx', 'fixtures', 'integrity', 'T', 'log']) if (snap[k] == null) add(k, 'sección ausente: guardado incompleto');
    if (errs.length) return errs;
    // compatibilidad semántica (C03-03): el guardado de jornada de SIM-MOTOR-02 no declaraba revisión (se comprueba la de cada encuentro SIM que contiene); si la declara, debe figurar en la matriz
    if (snap.simVersion !== undefined && !SIM_SNAPSHOT_COMPAT.simVersions.includes(snap.simVersion)) add('simVersion', `revisión SIM incompatible (${snap.simVersion}); se continúa ${SIM_SNAPSHOT_COMPAT.simVersions.join(', ')}`);
    if (snap.resultSchema !== undefined && !SIM_SNAPSHOT_COMPAT.resultSchemas.includes(snap.resultSchema)) add('resultSchema', `formato de resultado incompatible (${snap.resultSchema}); se continúa ${SIM_SNAPSHOT_COMPAT.resultSchemas.join(', ')}`);
    for (const f of snap.fixtures) if (!f.result && f.meta?.resolver === 'sim') for (const e of validateSimSnapshot(f.state)) add(`fixtures.${f.meta.id}.${e.path}`, e.message);
    const { integrity, ...rest } = snap; const body = canonical(rest); if (sha256Hex(body) !== integrity.digest || body.length !== integrity.bytes) add('integrity', 'el contenido no coincide con su suma de comprobación: guardado alterado o dañado');
    return errs;
  }
  static restore(snap, { profile = null } = {}) {
    const errs = Matchday.validate(snap); if (errs.length) { const e = new Error(`jornada rechazada: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
    const ctx = contextFromJSON(snap.ctx);
    const fixtures = snap.fixtures.map((f) => ({ id: f.meta.id, competition: f.meta.competition, resolver: f.meta.resolver, start: f.meta.start, controlledTeams: f.meta.controlledTeams, attemptId: f.meta.attemptId, label: f.meta.label, youth: f.meta.youth, input: { teams: f.meta.teams.map((id) => ({ id })) } }));
    const md = new Matchday({ id: snap.id, date: snap.date, fixtures, standings0: snap.standings0, objectives: snap.objectives, ctx, profile, barrierSeconds: snap.barrierSeconds, policy: snap.policy, _restore: true });
    for (const f of snap.fixtures) { if (f.result) { md.results[f.meta.id] = f.result; continue; } if (f.meta.resolver === 'sim') md.shard.restore({ id: f.meta.id, start: f.meta.start, controlledTeams: f.meta.controlledTeams }, f.state); else md.detailed.set(f.meta.id, DetailedFixture.restore(f.meta.id, f.state, profile)); }
    md.T = snap.T; md.barrier = snap.barrier; md.paused = snap.paused; md.log = snap.log; md.decisions = snap.decisions;
    md.packets = new Map(); for (const id of md.ids) { /* se reconstruye el presente publicado sin avanzar */ } md._republish(); return md;
  }
  // Reconstruye los paquetes del presente SIN avanzar ni publicar nada nuevo (tras restaurar).
  _republish() {
    const out = new Map();
    for (const id of this.ids) { const m = this.meta.get(id); let p; if (this.results[id]) p = this._packetOfResult(id, this.T); else if (m.resolver === 'sim') p = this.shard.progressOf(this.shard.matches.get(id), this.T); else p = this.detailed.get(id).published(Math.max(0, this.T - m.start)); p.competition = m.competition; p.teams = m.teams; p.youth = m.youth; p.valid = p.finished ? (this.results[id]?.valid ?? true) : null; out.set(id, p); }
    this.packets = out;
  }
}
