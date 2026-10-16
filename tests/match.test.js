// Partidos completos: semillas 20261016, 20261017 y 20261018; reproducibilidad e independencia de la presentación.
import test from 'node:test';
import assert from 'node:assert/strict';
import { data, inputFor, stripCalc } from './helpers.js';
import { runMatch, teamTotals } from '../src/match/index.js';

const SEEDS = [20261016, 20261017, 20261018];
const results = {};
for (const s of SEEDS) results[s] = runMatch(inputFor(s), data.profile, { detail: 'full', check: true });

for (const seed of SEEDS) {
  test(`semilla ${seed}: partido terminado y marcador, parciales y acta concilian con los hechos`, () => {
    const r = results[seed];
    assert.equal(r.status, 'finished', JSON.stringify(r.errors));
    assert.notEqual(r.score[0], r.score[1]);
    const b = r.box;
    assert.equal(b.teams[0].points, r.score[0]);
    assert.equal(b.teams[1].points, r.score[1]);
    for (const t of [0, 1]) {
      const tt = teamTotals(b, r.input, t);
      assert.equal(tt.pts, r.score[t], 'puntos de jugadores = marcador');
      assert.equal(tt.pts, tt.fg2m * 2 + tt.fg3m * 3 + tt.ftm, 'puntos = canastas + libres');
      assert.ok(tt.fg2m <= tt.fg2a && tt.fg3m <= tt.fg3a && tt.ftm <= tt.fta);
    }
    // parciales: el estado y la proyección desde hechos coinciden y suman el marcador
    for (const p of r.periodScores) {
      const proj = b.periods.find((x) => x.period === p.period)?.points ?? [0, 0];
      assert.deepEqual(proj, p.points, `periodo ${p.period}`);
    }
    assert.deepEqual([0, 1].map((t) => r.periodScores.reduce((s, p) => s + p.points[t], 0)), r.score);
    // faltas: contador de estado = proyección de hechos
    for (const [id, f] of Object.entries(r.diagnostics.finalFouls)) assert.equal(b.players[id].pf, f, id);
  });

  test(`semilla ${seed}: minutos concilian con cinco presencias por duración disputada; relojes y control coherentes`, () => {
    const r = results[seed];
    const played = r.periodScores.reduce((s, p) => s + (p.period <= 4 ? 10 : 5), 0);
    for (const t of [0, 1]) assert.ok(Math.abs(teamTotals(r.box, r.input, t).min - 5 * played) < 1e-6, `minutos equipo ${t}`);
    let lastPeriod = 0; let lastClock = null;
    for (const ev of r.events) {
      assert.ok(ev.clock.after <= ev.clock.before);
      assert.ok(ev.shotClock.before >= 0 && ev.shotClock.after >= 0 && ev.shotClock.after <= 240);
      if (ev.period !== lastPeriod) { lastPeriod = ev.period; lastClock = ev.clock.before; }
      else { assert.ok(ev.clock.before <= lastClock); lastClock = ev.clock.after; }
      assert.ok(ev.durationTenths === 0 || ev.durationTenths === ev.clock.before - ev.clock.after);
    }
    // sin bucle por segundo: duración media por acontecimiento con tiempo muy por encima de una décima
    const timed = r.events.filter((e) => e.durationTenths > 0);
    assert.ok(timed.reduce((s, e) => s + e.durationTenths, 0) / timed.length > 20);
  });

  test(`semilla ${seed}: disponibilidad, exclusiones, rebotes y libres referencian hechos reales`, () => {
    const r = results[seed];
    const exTable = Object.fromEntries(r.lineups.map((l) => [l.id, new Set(Object.values(l.slots))]));
    let prev = null; const out = new Set();
    for (const ev of r.events) {
      for (const lid of ev.lineups) for (const pid of exTable[lid]) {
        // un jugador excluido solo puede aparecer en la alineación del propio acontecimiento de exclusión o antes de su relevo
        if (out.has(pid)) assert.ok(['foul', 'free_throw', 'substitution'].includes(ev.type) || ev.type === 'attempt', `${pid} excluido en ${ev.id} (${ev.type})`);
      }
      for (const f of ev.stats) if (f.k === 'foul' && r.diagnostics.finalFouls[f.p] >= 5) { /* se comprueba abajo */ }
      if (ev.type === 'rebound') {
        assert.ok(prev && (prev.stats.some((s) => s.k === 'shot' && !s.made) || prev.type === 'free_throw'), `rebote sin fallo previo en ${ev.id}`);
      }
      if (ev.type === 'free_throw') assert.ok(ev.participants.lanzador);
      if (ev.type === 'foul' && ev.effects.excluido) out.add(ev.participants.infractor);
      prev = ev;
    }
    for (const [id, f] of Object.entries(r.diagnostics.finalFouls)) assert.ok(f <= 5, `${id} con ${f} faltas`);
    // todos los jugadores de cada acontecimiento pertenecen al quinteto de su equipo
    for (const ev of r.events) {
      if (ev.type !== 'attempt') continue;
      const on = exTable[ev.lineups[ev.team]];
      assert.ok(on.has(ev.participants.actor), `${ev.id}: actor fuera de pista`);
    }
  });
}

test('la misma entrada congelada reproduce el mismo partido', () => {
  const again = runMatch(inputFor(SEEDS[0]), data.profile, { detail: 'full' });
  assert.equal(JSON.stringify(again.events), JSON.stringify(results[SEEDS[0]].events));
  assert.deepEqual(again.score, results[SEEDS[0]].score);
});

test('presentación y diagnóstico no consumen azar deportivo: sin detalle calculado el partido es idéntico', () => {
  const minimal = runMatch(inputFor(SEEDS[0]), data.profile, { detail: 'minimal' });
  assert.equal(JSON.stringify(stripCalc(minimal.events)), JSON.stringify(stripCalc(results[SEEDS[0]].events)));
  assert.equal(minimal.diagnostics.sportingDraws, results[SEEDS[0]].diagnostics.sportingDraws);
});

test('la entrada efectiva queda congelada: editar fichas después no altera el acta anterior', () => {
  const input = inputFor(SEEDS[1]);
  const r = runMatch(input, data.profile, { detail: 'minimal' });
  const before = JSON.stringify(r.input);
  input.teams[0].players[0].abilities.TEC08 = 1; input.teams[0].plan.styles.freedom = 5;
  assert.equal(JSON.stringify(r.input), before);
  assert.notEqual(r.input.teams[0].players[0].abilities.TEC08, 1);
});

test('la entrada y el perfil no se mutan durante la simulación', () => {
  const input = inputFor(SEEDS[2]); const profile = structuredClone(data.profile);
  const i0 = JSON.stringify(input); const p0 = JSON.stringify(profile);
  runMatch(input, profile, { detail: 'minimal' });
  assert.equal(JSON.stringify(input), i0); assert.equal(JSON.stringify(profile), p0);
});
