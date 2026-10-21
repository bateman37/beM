// API de análisis de MOTOR-10: un único lector del partido (hechos + acta) con audiencia, filtros y memoización por partido, política, audiencia y filtros normalizados.
// Ninguna consulta consume azar, modifica el estado deportivo ni cambia el marcador: solo lee el resultado exportado/en curso.
import { buildIndex, viewShot, cacheKey, allowed, AUDIENCES, actaOf } from './facts.js';
import { analysisParams } from './params.js';
import { CATALOG, runIndicator, playerIndicators } from './catalog.js';
import { evolution, unansweredRuns, periodScores, shotStreaks } from './evolution.js';
import { sectorMap, sectorDetail, qualityTable, assistReading, fourFactors, ratings, paceReading, production, marginExplanation } from './shooting.js';
import { originTable, executionTable, executionList, bookTable, directorTable, observableActors } from './offense.js';
import { organizationTable, organizationByFact, coverageTable, helpChain, responsibilities } from './defense.js';
import { throwInTable, throwInList, foulTable } from './restarts.js';
import { offBallRows } from './offball.js';
import { closureTable, productionPer100, CREDITS } from './closures.js';
import { lineupTable, onOff, groupReading } from './presence.js';
import { keyCandidates, selectKeys, leaders, chronicle } from './summary.js';
import { recommendations } from './recommend.js';
import { ownStatesByPeriod } from './statesview.js';
import { beforeAfter, appliedOrders } from './orders.js';
import { filterShots, filterPossessions, filterCompat, normalizeFilters } from './filters.js';
import { coverageMatrix, BLOCKS, DEBT_MOTOR09, PENDING_MOTOR10, LATER_DELIVERIES } from './coverage.js';
import { VISIBILITY } from './visibility.js';
import { familiarityView } from './familiarity.js';
import { ANALYSIS_VERSION } from './formulas.js';
import { jsonExport, csvTables, markdownExport } from './export.js';
import { FILTER_FIELDS } from './filters.js';

export { CREDITS };
export { AUDIENCES, ANALYSIS_VERSION, CATALOG, VISIBILITY, BLOCKS, DEBT_MOTOR09, PENDING_MOTOR10, LATER_DELIVERIES, FILTER_FIELDS, filterCompat, normalizeFilters };
const INDEX_CACHE = new WeakMap(); // resultado → índice de hechos (no depende de la audiencia: contiene las tres capas)
const VIEW_CACHE = new WeakMap(); // resultado → Map(audiencia+equipo → Analysis)

// Los flujos preparados o reproducidos pueden carecer de nombres de equipo, metadatos o diagnóstico: se completan sin tocar el original.
const NORM = new WeakMap();
export function normalize(res) {
  let n = NORM.get(res); if (n) return n;
  n = res.teams && res.meta && res.diagnostics && res.acta ? res : { ...res, teams: res.teams ?? res.input.teams.map((t) => ({ id: t.id, name: t.name })), meta: res.meta ?? {}, diagnostics: res.diagnostics ?? {}, acta: res.acta ?? actaOf(res) };
  NORM.set(res, n); return n;
}
export function indexOf(res0) {
  const res = normalize(res0); let ix = INDEX_CACHE.get(res); if (!ix) { ix = buildIndex(res); INDEX_CACHE.set(res, ix); } return ix; }

// La caché de una consulta incluye audiencia y equipo de perspectiva: un resultado diagnóstico nunca se reutiliza en la vista pública.
export function analyze(res0, { audience = 'public', team = 0 } = {}) {
  const res = normalize(res0);
  if (!AUDIENCES.includes(audience)) throw new Error(`audiencia desconocida: ${audience}`);
  let m = VIEW_CACHE.get(res); if (!m) { m = new Map(); VIEW_CACHE.set(res, m); }
  const k = cacheKey({ audience, team }, null); let a = m.get(k); if (!a) { a = new Analysis(res, { audience, team }); m.set(k, a); }
  return a;
}

class Analysis {
  constructor(res, ctx) { this.res = res; this.ix = indexOf(res); this.ctx = { audience: ctx.audience, team: ctx.team }; this.params = analysisParams(res); this.memo = new Map(); }
  m(key, f) { if (!this.memo.has(key)) this.memo.set(key, f()); return this.memo.get(key); }
  name(t) { return this.res.teams[t].name; }
  // MOTOR-18: familiaridad táctica según la audiencia de este análisis (el rival y el público nunca ven el conocimiento exacto, la Polivalencia ni la enseñanza)
  familiarity() { return this.m('familiarity', () => familiarityView(this.res, this.ctx)); }

  // ---- hechos de tiro vistos por la audiencia y filtrados
  viewedShots(team) { return this.m(`vs:${team}`, () => this.ix.shots.filter((s) => s.team === team).map((s) => viewShot(s, this.ctx))); }
  shots(team, filters = {}) { const f = normalizeFilters(filters); return this.m(`sh:${team}:${JSON.stringify(f)}`, () => filterShots(this.ix, this.viewedShots(team), f, this.params, team)); }
  allViewedShots() { return this.m('vsall', () => this.ix.shots.map((s) => viewShot(s, this.ctx))); }

  indicators(team, filters = {}) {
    const f = normalizeFilters(filters); return this.m(`ind:${team}:${JSON.stringify(f)}`, () => {
      const info = this.shots(team, f); const filtered = Object.keys(f).length > 0;
      const q = { ix: this.ix, acta: this.ix.acta, events: this.ix.events, team, shots: info.shots, filtered, filterInfo: info, params: { ...this.params, regulationMinutes: (this.res.profile?.rules?.quarterSeconds ?? 600) * (this.res.profile?.rules?.quarters ?? 4) / 60 }, totalTenths: this.ix.totalTenths, audience: this.ctx.audience };
      return CATALOG.map((def) => runIndicator(def, q));
    });
  }
  indicator(team, id, filters = {}) { return this.indicators(team, filters).find((r) => r.id === id); }
  closures(team) { return this.m(`cl:${team}`, () => closureTable(this.ix, team)); }
  production100(pid, credit = 'pts') { return this.m(`p100:${pid}:${credit}`, () => productionPer100(this.ix, pid, credit)); }
  playerIndicators(pid) { return playerIndicators(this.ix, pid, this.params.conventions.ftCoefficient); }

  sectors(team, filters = {}) { return sectorMap(this.shots(team, filters).shots); }
  sectorDetail(team, filters = {}) { return sectorDetail(this.shots(team, filters).shots); }
  quality(team, filters = {}) { return qualityTable(this.shots(team, filters).shots); }
  assists(team) { return assistReading(this.viewedShots(team), this.ix.acta, team); }
  fourFactors() { return this.m('ff', () => fourFactors(this.ix, this.params.conventions.ftCoefficient)); }
  ratings() { return this.m('rt', () => ratings(this.ix)); }
  pace() { return paceReading(this.ix, (this.res.profile?.rules?.quarterSeconds ?? 600) * (this.res.profile?.rules?.quarters ?? 4) / 60); }
  production() { return this.m('prod', () => production(this.ix, { clockEndTenths: this.params.conventions.clockEndTenths })); }
  margin() { return this.m('mar', () => marginExplanation(this.ix)); }

  ev() { return this.m('ev', () => evolution(this.ix, { adjustedFinal: this.params.adjustedFinal, unansweredMin: this.params.summary.unansweredMin })); }
  evolutionBrief() { const e = this.ev(); return { maxLead: e.maxLead, ties: e.ties.length, leadChanges: e.leadChanges.length, firstLead: e.firstLead, time: e.time, runs: e.runs.map((r) => ({ team: r.team, points: r.points, from: r.from, to: r.to })), periods: periodScores(this.ix), streaks: shotStreaks(this.ix) }; }
  runsInPeriod(period) { return unansweredRuns(this.ix, this.params.summary.unansweredMin, { period }); }

  possessionsFor(team, filters = {}) { return filterPossessions(this.ix, this.ix.possessions.filter((p) => p.team === team), filters, this.params, team); }
  origin(team, filters = {}) { const f = normalizeFilters(filters); return this.m(`or:${team}:${JSON.stringify(f)}`, () => originTable(this.ix, team, { ctx: this.ctx, filter: Object.keys(f).length ? (p) => this.possessionsFor(team, f).possessions.includes(p) : null })); }
  executions(team) { return this.m(`ex:${team}`, () => executionTable(this.ix, team, this.ctx)); }
  executionList(team) { return executionList(this.ix, team, this.ctx); }
  book(team) { return bookTable(this.ix, team, this.ctx); }
  observableActors(team) { return this.m(`oa:${team}`, () => observableActors(this.ix, team)); }
  directors(team) { return allowed('own', { team }, this.ctx) ? directorTable(this.ix, team) : { available: false, reason: 'el director y sus decisiones son información propia o diagnóstico' }; }

  organizations(defTeam) { return this.m(`org:${defTeam}`, () => organizationTable(this.ix, defTeam)); }
  organizationsByFact(defTeam) { return this.m(`orgf:${defTeam}`, () => organizationByFact(this.ix, defTeam)); }
  coverages(defTeam) { return this.m(`cov:${defTeam}`, () => coverageTable(this.ix, defTeam)); }
  help(defTeam) { return helpChain(this.ix, defTeam); }
  responsibilities(defTeam) { return responsibilities(this.ix, defTeam); }
  throwIns(team) { return throwInTable(this.ix, team, this.ctx); }
  throwInList(team) { return throwInList(this.ix, team, this.ctx); }
  fouls(team) { return foulTable(this.ix, team); }
  offBall(team) { return this.m(`ob:${team}`, () => offBallRows(this.ix, team, this.ctx)); }

  lineups(team) { return this.m(`lu:${team}`, () => lineupTable(this.ix, team, { minSeconds: this.params.sample.lineupMinSeconds, minAttacks: this.params.sample.lineupMinAttacks })); }
  onOff(ids) { return this.m(`oo:${ids.join('|')}`, () => onOff(this.ix, ids, { minSeconds: this.params.sample.lineupMinSeconds, minAttacks: this.params.sample.lineupMinAttacks })); }
  group(ids) { return groupReading(this.ix, ids, { minSeconds: this.params.sample.lineupMinSeconds, minAttacks: this.params.sample.lineupMinAttacks }); }

  beforeAfter(orderId) { return beforeAfter(this.ix, orderId, this.params.beforeAfter.attacks); }
  appliedOrders() { return appliedOrders(this.ix); }
  ownStates(team) { return this.m(`states:${this.ctx.audience}:${team}`, () => ownStatesByPeriod(this.ix, team, this.ctx)); } // MOTOR-15 §9.2: la audiencia forma parte de la clave de caché
  recommendations(team) { return this.m(`rec:${team}`, () => recommendations(this.ix, team, this.ctx, this.params)); }

  // Resumen: estado, parciales, claves con evidencia, margen, líderes y crónica. En una ejecución parcial/inválida/administrativa no hay crónica de victoria consumada.
  summary() {
    return this.m('sum', () => {
      const acta = this.ix.acta; const st = acta.status; const adm = this.res.administrative; const [a, b] = acta.score; const names = [this.name(0), this.name(1)];
      const finished = st.definitive && !adm && this.res.status === 'finished';
      const statusText = adm ? `Resultado ADJUDICADO por terminación administrativa (${adm.awarded?.join('–')}); el tanteo de cancha (${a}–${b}) es otro dato.` : !st.definitive ? `Acta PARCIAL: el encuentro ${this.res.status === 'finished' ? 'tiene series pendientes' : 'no ha terminado'}. No se genera una crónica de victoria.` : 'Encuentro terminado, acta definitiva.';
      const headline = finished ? (a === b ? `Empate ${a}–${b}` : `${names[a > b ? 0 : 1]} ganó ${Math.max(a, b)}–${Math.min(a, b)} a ${names[a > b ? 1 : 0]}`) : `Tanteo de cancha ${names[0]} ${a}–${b} ${names[1]} (no es un resultado final)`;
      const byTeam = [0, 1].map((t) => this.viewedShots(t));
      const cands = keyCandidates(this.ix, this.ctx, this.params, byTeam); const sel = selectKeys(cands, this.params);
      return { finished, statusText, headline, partials: periodScores(this.ix), keys: sel.keys, redundant: sel.redundant, candidateCount: sel.candidates, keyNote: sel.note, margin: this.margin(), leaders: leaders(this.ix), chronicle: finished || st.partial ? chronicle(this.ix, this.params) : [], chronicleKind: finished ? 'final' : 'parcial' };
    });
  }
  chronicleThrough(period) { return chronicle(this.ix, this.params, { through: period }); }

  coverageMatrix() { return coverageMatrix(this.res); }
  coverageSummary() { const m = this.coverageMatrix(); const by = {}; for (const r of m) by[r.category] = (by[r.category] ?? 0) + 1; return { matrix: m, byCategory: by, blocks: BLOCKS, debt: DEBT_MOTOR09, pending: PENDING_MOTOR10, later: LATER_DELIVERIES, note: 'Consistencia bajo las reglas vigentes ≠ conformidad normativa completa; ninguna fila es lectura directa del PDF de FIBA.' }; }

  exportJson(opts) { return jsonExport(this, opts); }
  exportCsv(filters) { return csvTables(this, filters); }
  exportMarkdown(filters) { return markdownExport(this, filters); }
}
