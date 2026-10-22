// Materialización cronológica de un tramo: asigna instantes, faltas (con exclusión y bonus) y créditos compatibles, y publica los hechos en orden.
// Fase 1: recorre los controles por orden de tiempo, decide cada falta (autor, víctima, bonus) y detecta la primera exclusión → frontera canónica del tramo.
// Fase 2: emite los hechos de los controles comprendidos (el control de la exclusión se completa; el resto del paquete generado no se publica ni se contabiliza).
import { SimMatch } from './engine.js';
import { enduranceFactorAt } from '../match/formulas.js';
import { clamp } from '../match/mathx.js';
import { ftProb } from './model.js';

const P = SimMatch.prototype;
function flatten(rec) {
  const out = []; for (const d of rec.dn) out.push({ type: 'dn' });
  const walk = (ch) => { for (const it of ch) { if (it.child) walk(it.child.chain); else out.push(it); } };
  // las faltas sin tiro ocurren antes del cierre del control: van delante de la cadena de hechos
  walk(rec.chain); return out;
}
function uniqPick(rng, list, ws) { const i = rng.weighted(ws); return i < 0 ? null : list[i]; }

P._materialize = function materialize(timeline, seg, start, d) {
  const S = this.S; const rng = this.rng; const rules = this.rules; const pIdx = this.period - 1; const tf = this.teamFouls[pIdx];
  const out = new Set(); let cutIdx = -1;
  const lists = timeline.map(() => null);
  // ---- fase 1
  for (let j = 0; j < timeline.length && cutIdx < 0; j++) {
    const { rec, k } = timeline[j]; const items = flatten(rec); const s = this.sides[k]; const o = this.sides[1 - k];
    let i = 0; let fouledOut = false;
    while (i < items.length) {
      const it = items[i];
      const attackers = s.view.players; const defenders = o.view.players;
      const countFoul = (pl, team) => { pl.fouls += 1; tf[team] += 1; if (pl.fouls >= rules.foulOut) { pl.out = true; out.add(pl.id); fouledOut = true; } };
      if (it.type === 'dn') {
        const defOk = defenders.filter((p) => !p.out); const ws = defOk.map((p) => o.M ? s.M.dnW[defenders.indexOf(p)] : 1);
        const fouler = uniqPick(rng, defOk, ws); const drawn = uniqPick(rng, attackers, attackers.map((p) => 0.5 + p.init));
        const bonus = tf[1 - k] >= rules.teamPenaltyAfterFouls; it.foul = { ty: 'foul', tm: 1 - k, pl: fouler.id, kind: 'nonshooting', drawn: drawn.id, bonus }; countFoul(fouler, 1 - k);
        if (bonus) { // el control se sustituye por la serie de libres del bonus (2) y su continuación
          const bonusRec = { k, chain: [], dn: [] }; this._ftSeries(bonusRec, k, drawn, rules.freeThrowsForOrdinaryBonus, 'bonus', it, null, s, false);
          items.splice(i + 1, items.length - i - 1, ...flatten(bonusRec));
        }
      } else if (it.foul && it.foul.ty === 'shootfoul') {
        const f = it.foul; const defOk = defenders.filter((p) => !p.out); const ws = defOk.map((p) => s.M.dnW[defenders.indexOf(p)]);
        const fouler = uniqPick(rng, defOk, ws); f.pl = fouler.id; countFoul(fouler, 1 - k);
      } else if (it.t && it.t.kind === 'of') { const off = attackers.find((p) => p.id === it.t.pl); countFoul(off, k); it.offFoul = { ty: 'foul', tm: k, pl: off.id, kind: 'offensive', drawn: null }; }
      i += 1;
    }
    lists[j] = items; if (fouledOut) cutIdx = j;
  }
  // ---- fase 2
  const last = cutIdx >= 0 ? cutIdx : timeline.length - 1; let cutTime = null; const outNow = new Set();
  const pts = [0, 0];
  const emit = (e, t) => { e.tAbs = t; return this._push(e); };
  for (let j = 0; j <= last; j++) {
    const { k, t } = timeline[j]; const items = lists[j]; const s = this.sides[k]; const o = this.sides[1 - k]; const tt = clamp(t, start, start + d);
    const parentSeq = new Map();
    for (const it of items) {
      const ok = (id, side) => id != null && !outNow.has(id);
      if (it.type === 'dn') { const f = emit({ ...it.foul }, tt); this._noteFoul(f, outNow); it.seq = f.i; }
      else if (it.t) { const e = { ...it.t }; if (e.stl && outNow.has(e.stl)) e.stl = this._reselect(o, outNow, null)?.id ?? null; emit(e, tt); if (it.offFoul) { const f = emit({ ...it.offFoul }, tt); this._noteFoul(f, outNow); } }
      else if (it.shot) { const e = { ...it.shot.ev }; if (e.blk && outNow.has(e.blk)) e.blk = this._reselect(o, outNow, null)?.id ?? null; const em = emit(e, tt); it.shot.seq = em.i; if (e.made) pts[k] += e.pts; }
      else if (it.foul) { const f = emit({ ...it.foul }, tt); this._noteFoul(f, outNow); it.foul.seq = f.i; }
      else if (it.series) {
        for (const ft of it.series.ft) { const em = emit({ ...ft, ref: it.series.ref?.seq ?? it.series.ref?.i ?? null }, tt); it.series.lastSeq = em.i; if (ft.made) pts[k] += 1; }
        if (it.series.passer && it.series.anyMade) { /* asistencia a libres: una por serie elegible por falta de tiro */ this.events[this.events.length - 1].assist = it.series.passer; }
      }
      else if (it.reb) { const e = { ...it.reb }; const parent = it.parent?.seq ?? it.parent?.lastSeq ?? null; e.ref = parent; if (e.pl && outNow.has(e.pl)) e.pl = this._reselect(e.off ? s : o, outNow, null)?.id ?? null; emit(e, tt); }
    }
    if (j === last && cutIdx >= 0) cutTime = tt;
  }
  this.score[0] += pts[0]; this.score[1] += pts[1]; this.periodScore[pIdx][0] += pts[0]; this.periodScore[pIdx][1] += pts[1];
  return cutTime;
};
P._noteFoul = function noteFoul(f, outNow) { const t = this.teams[f.tm]; const pl = t.byId[f.pl]; if (pl.fouls >= this.rules.foulOut) outNow.add(pl.id); };
P._reselect = function reselect(side, outNow, ws) { const c = side.view.players.filter((p) => !outNow.has(p.id)); return c[Math.floor(this.rng.next() * c.length)] ?? null; };

// ---------------------------------------------------------------------------------------------------------------------- cierre del tramo
P._finishSegment = function finishSegment(seg, start, dur, models) {
  const S = this.S; const minutes = dur;
  seg.dur = dur;
  for (const t of this.teams) {
    const s = this.sides[t.idx]; const M = models[t.idx]; const R = models[1 - t.idx]; const o = this.sides[1 - t.idx];
    const offLoad = (1 - M.tau) * S.energy.load.organized + M.tau * S.energy.load.transition;
    const height = o.plan.pressureHeight; const cov = S.defense.coverage.committedActorLoad[s.plan.coverage];
    const defLoad = S.defense.pressure.committedActorLoadByHeight[height] * cov;
    const load = clamp((offLoad + defLoad) / 2, S.energy.loadBounds[0], S.energy.loadBounds[1]);
    for (const p of t.players) {
      if (p.onCourt) {
        const f = enduranceFactorAt(S, p.ab.FIS06); p.energy = clamp(p.energy - S.energy.costPerLiveMinute * f * load * (dur / 60), S.energy.range[0], S.energy.range[1]); p.minutes += dur;
        if (p.slot) p.slotMin[p.slot] = (p.slotMin[p.slot] ?? 0) + dur; if (p.offRole) p.roleMin[p.offRole] = (p.roleMin[p.offRole] ?? 0) + dur;
      } else p.energy = clamp(p.energy + S.energy.benchRecoveryPerLiveMinute * (dur / 60), S.energy.range[0], S.energy.range[1]);
    }
    void minutes; void R;
  }
  // un jugador excluido deja de estar en pista desde el hecho
  for (const t of this.teams) for (const p of t.players) if (p.out && p.onCourt) { p.onCourt = false; p.slot = null; p.benchSince = this.gt + dur; }
};

P._recover = function recover(amount) { const S = this.S; for (const t of this.teams) for (const p of t.players) p.energy = clamp(p.energy + amount, S.energy.range[0], S.energy.range[1]); };
P._closePeriod = function closePeriod() {
  const r = this.rules;
  if (this.period < r.quarters) {
    this._recover(this.period === r.quarters / 2 ? this.S.energy.halftimeRecovery : this.S.energy.quarterRecovery);
    this.period += 1; this.periodStart = this.gt; this.periodLen = r.quarterSeconds; this.periodScore.push([0, 0]); this.teamFouls.push([0, 0]); this._push({ ty: 'period', start: this.period }); return true;
  }
  if (this.score[0] === this.score[1]) {
    if (this.period - r.quarters >= r.technicalGuardMaxOvertimes) { this.status = 'error'; this.error = { cause: `tope técnico de prórrogas (${r.technicalGuardMaxOvertimes}) sin desempate`, phase: 'generación' }; return false; }
    this._recover(this.S.energy.overtimeIntervalRecovery); this.period += 1; this.periodStart = this.gt; this.periodLen = r.overtimeSeconds; this.periodScore.push([0, 0]);
    this.teamFouls.push(this.teamFouls[this.period - 2].slice()); // las faltas de equipo del último periodo se arrastran a la prórroga
    this._push({ ty: 'period', start: this.period }); return true;
  }
  this.status = 'finished'; SimMatch.finished += 1; this._push({ ty: 'end' }); return false;
};

// ---------------------------------------------------------------------------------------------------------------------- avance, consulta y fin
// Avanza por fronteras canónicas hasta alcanzar `until` (segundos de juego; 'end' = hasta terminar). Publica solo hechos con t ≤ until. Idempotente y sin azar al consultar.
P.advance = function advance({ until = 'end' } = {}) {
  const limit = until === 'end' ? Infinity : until;
  while (this.status === 'running' && this.gt < limit) { if (!this.step()) break; }
  this.published = until === 'end' || this.status === 'finished' ? (this.status === 'finished' ? this.gt : this.gt) : Math.min(until, this.gt);
  if (until !== 'end' && this.status !== 'finished') this.published = Math.min(until, this.gt);
  return { status: this.status, published: this.published, generatedUntil: this.gt };
};
P.finish = function finish() { this.advance({ until: 'end' }); return this.status; };
P.publishedEvents = function publishedEvents() { const lim = this.published; return this.events.filter((e) => e.t <= lim + 1e-9); };
void ftProb;
