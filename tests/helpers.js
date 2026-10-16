import { loadData } from '../scripts/node-data.js';
import { buildMatchInput, createMatch } from '../src/match/index.js';

export const data = loadData();
export const inputFor = (seed) => buildMatchInput(data.profile, data.players, { seed });
// Entrada con el plan de demostración de MOTOR-04 (quince fichas a prioridad 3, DIS02 salvo que se indique): escenario de cobertura.
export function demoInputFor(seed, disposition = 'DIS02') {
  const input = inputFor(seed);
  input.teams.forEach((t, i) => { const demo = data.profile.scenario.demoPlans[i]; t.plan = JSON.parse(JSON.stringify({ ...t.plan, playbook: demo.playbook, disposition, midrange: demo.midrange })); });
  return input;
}
// `calc` (detalle calculado) y `params` (filas consultadas) son diagnóstico: no forman parte del deporte.
export const stripCalc = (events) => events.map(({ calc, params, ...rest }) => rest);

// Encuentro inicializado y listo para casos controlados de reglas.
export function freshMatch(seed = 1, opts = {}) {
  const m = createMatch(inputFor(seed), data.profile, { detail: 'full', ...opts });
  m.init();
  m.startPossession({ team: 0, entry: 'deadFront', shotClock: 240 });
  return m;
}
export const baseEx = (over = {}) => ({
  team: 0, origin: 'PRUEBA', kind: 'organized', actor: 'EQ01-J03', zone: 'three', exec: 'dribble', passer: null,
  icpt: 'EQ02-J04', defend: 'EQ02-J04', moved: false, offContact: null, holder: 'EQ01-J03', quality: { cls: 'normal', K: 0 }, ...over,
});

// Planificador de reloj controlado: las pruebas nunca esperan tiempo real. `t` es el «reloj de pared» simulado.
export class FakeScheduler {
  constructor() { this.t = 0; this.q = []; this.n = 0; this.yields = 0; this.delays = []; }
  setTimeout(fn, ms) { const h = ++this.n; this.q.push({ h, at: this.t + ms, fn }); this.delays.push(ms); return h; }
  clearTimeout(h) { this.q = this.q.filter((x) => x.h !== h); }
  yield() { this.yields += 1; return Promise.resolve(); }
  now() { return this.t; }
  get pending() { return this.q.length; }
  runNext() { if (!this.q.length) return false; this.q.sort((a, b) => a.at - b.at || a.h - b.h); const x = this.q.shift(); this.t = x.at; x.fn(); return true; }
  runAll(max = 1e6) { let n = 0; while (this.q.length && n < max) { this.runNext(); n += 1; } return n; }
}

// Avanza fronteras hasta que `pred(m)` sea cierta (con tope de seguridad).
export function stepUntil(m, pred, max = 5000) {
  for (let i = 0; i < max; i++) { if (pred(m)) return true; if (!m.step()) return pred(m); }
  throw new Error('stepUntil: tope alcanzado');
}
export function newMatch(seed = 20261016, opts = {}) { return createMatch(inputFor(seed), data.profile, { detail: 'full', ...opts }); }
