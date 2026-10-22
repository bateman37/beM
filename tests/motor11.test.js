// MOTOR-11: población, generador y escenarios. Ocho grupos pequeños; cada uno protege un error real (regenerar referencias, doble bonus, reproducción rota, undo por resta, colisión de
// instancias, lectores inventando datos, versiones incoherentes). Sin barridos de partidos ni pruebas por capacidad.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runMatch, deepCopy, validateInput, ATTRS } from '../src/match/index.js';
import { sportsProjection, replayMatch } from '../src/match/replay.js';
import * as P from '../src/population/index.js';
import { MemoryStorage } from '../src/profiles/library.js';
import { analyze } from '../src/analysis/index.js';
import { closureTable } from '../src/analysis/closures.js';
import { APP_VERSION, appLine } from '../src/version.js';
import { data } from './helpers.js';

const { profile, players } = data;
const refs = () => P.referenceTeams(profile, players);

test('1. referencia: 144 fichas explícitas, 12 planes válidos, EQ07-J01 de 40 años con histórico conservado', () => {
  const t = refs();
  assert.deepEqual(P.validateReferenceSet(profile, t), []);
  assert.equal(new Set(t.flatMap((x) => x.players.map((p) => p.id))).size, 144);
  // las capacidades son las del CSV (no se regeneran ni se copian de otro equipo)
  for (const tm of t) for (const p of tm.players) assert.deepEqual(p.abilities, players.find((q) => q.id === p.id).abilities);
  const vet = t.find((x) => x.id === 'EQ07').players[0]; assert.equal(vet.age, 40); assert.deepEqual(vet.provenance.map((x) => x.revision), ['R0', 'R1']);
  assert.equal(P.referenceTeam(profile, players, 'EQ07', { revision: 'R0' }).players[0].age, 37, 'la revisión inicial se conserva');
  assert.equal(players.find((p) => p.id === 'EQ07-J01').age, 37, 'el CSV original no se toca');
  const hist = P.historicalPair(profile, players); assert.deepEqual(hist.map((x) => x.plan.disposition), ['DIS02', 'DIS02']);
  assert.equal(t[3].plan.disposition, 'DIS04'); assert.equal(t[9].plan.pressureHeight, 'three_quarters'); assert.equal(t[10].plan.participation.pairs.find((q) => q.starter === 'EQ11-J03').starterMinutes, 32);
});

test('2. generador: misma configuración reproduce, otra semilla cambia, ocho grupos cubren las 32 y no toca el azar deportivo', () => {
  const cfg = { base: 'EQ04', seed: 20261017, dispersion: 1 };
  const a = P.generateTeam(profile, players, cfg); const b = P.generateTeam(profile, players, cfg); const c = P.generateTeam(profile, players, { ...cfg, seed: 20261018 });
  assert.equal(a.source.fingerprint, b.source.fingerprint); assert.deepEqual(a.players, b.players); assert.notEqual(a.source.fingerprint, c.source.fingerprint);
  assert.notDeepEqual(a.players[0].abilities, c.players[0].abilities);
  assert.deepEqual(P.validateTeamRecord(a, profile), []);
  const groups = Object.values(profile.generator.groups).flatMap((g) => g.abilities); assert.deepEqual([...groups].sort(), [...ATTRS].sort());
  for (const p of a.players) { assert.ok(ATTRS.every((k) => p.abilities[k] >= 1 && p.abilities[k] <= 30)); assert.ok(Math.abs(p.zonePreference.rim + p.zonePreference.midrange + p.zonePreference.three - 1) < 1e-9); assert.equal(p.state.energy, 100); assert.equal(p.state.form, 0); }
  assert.ok(a.plan.directorPriority.every((id) => id.startsWith(`${a.id}-`)) && Object.values(a.plan.starters).every((id) => id.startsWith(`${a.id}-`)), 'el plan se remapea al equipo generado');
  assert.ok(a.plan.participation.pairs.every((q) => q.starter.startsWith(a.id) && q.relief.startsWith(a.id)));
  const eq08 = P.generateTeam(profile, players, { base: 'EQ08', seed: 7, dispersion: 1.5 }); assert.ok(eq08.players.every((p) => p.age >= 18 && p.age <= 23));
  const nodate = Date.now; const mr = Math.random; Date.now = () => { throw new Error('reloj'); }; Math.random = () => { throw new Error('azar'); };
  try { assert.equal(P.generateTeam(profile, players, cfg).source.fingerprint, a.source.fingerprint); } finally { Date.now = nodate; Math.random = mr; }
});

test('3. dependencia: un factor común mueve las capacidades de su grupo; un residuo solo la suya (sin campaña estadística)', () => {
  const gen = deepCopy(profile); const g = gen.generator;
  const base = P.generateTeam(gen, players, { base: 'EQ01', seed: 5, dispersion: 1 });
  g.coefficients.team = 0; g.coefficients.player = 0; g.coefficients.residual = 0; for (const k of Object.keys(g.cross)) g.cross[k] = Object.fromEntries(Object.keys(g.cross[k]).map((x) => [x, 0]));
  const flat = P.generateTeam(gen, players, { base: 'EQ01', seed: 5, dispersion: 1 });
  const ref = P.referenceTeam(gen, players, 'EQ01');
  assert.deepEqual(flat.players[2].abilities, ref.players[2].abilities, 'sin factores la capacidad es el centro');
  g.coefficients.team = 1; const team = P.generateTeam(gen, players, { base: 'EQ01', seed: 5, dispersion: 1 });
  const dTir = g.groups.G01.abilities.map((a) => team.players[2].abilities[a] - ref.players[2].abilities[a]);
  assert.ok(dTir.every((d) => Math.abs(d - dTir[0]) < 1e-2), 'el factor de equipo mueve el grupo de tiro a la vez');
  assert.ok(Math.abs(team.players[2].abilities.FIS06 - ref.players[2].abilities.FIS06) > 0, 'cada grupo tiene su propio factor');
  void base;
});

test('4. edición: +1/+3/+5 con precisión y saturación, selección vacía, undo exacto y original inmutable', () => {
  const t = refs()[0]; const teams = [t]; const orig = deepCopy(t);
  const p = t.players[0]; p.abilities.TEC01 = 29; p.abilities.TEC02 = 17.35;
  assert.deepEqual(P.planBulk(teams, new Set(), new Set(['TEC01']), 3), []);
  const ch = P.planBulk(teams, new Set([p.id]), new Set(['TEC01', 'TEC02']), 3);
  assert.equal(ch.find((c) => c.attr === 'TEC01').after, 30); assert.ok(ch.find((c) => c.attr === 'TEC01').limit); assert.ok(Math.abs(ch.find((c) => c.attr === 'TEC02').after - 20.35) < 1e-9);
  const rec = P.applyBulk(teams, ch, '+3'); assert.equal(p.abilities.TEC01, 30);
  const r = P.undoBulk(teams, rec); assert.equal(p.abilities.TEC01, 29); assert.equal(p.abilities.TEC02, 17.35); assert.equal(r.conflicts.length, 0);
  assert.deepEqual(refs()[0].players[1], orig.players[1], 'la referencia reconstruida no cambió');
});

test('5. escenario: instancias sin colisión, guardar/recargar, export/import con huella y rechazo de archivos alterados; catálogo válido', () => {
  const a = P.instantiate(P.referenceTeam(profile, players, 'EQ04'), []); const b = P.instantiate(P.referenceTeam(profile, players, 'EQ04'), [a.id]);
  assert.deepEqual([a.id, b.id], ['EQ04', 'EQ04_B']); assert.ok(b.players.every((p) => p.id.startsWith('EQ04_B-'))); assert.ok(b.plan.directorPriority.every((id) => id.startsWith('EQ04_B-')));
  assert.deepEqual(validateInput({ seed: 1, importance: 'ordinary', teams: [a, b] }, profile), []);
  for (const sc of P.labCatalog(profile)) for (const v of sc.variants) assert.deepEqual(validateInput(P.buildLabVariant(profile, players, sc.id, v.id).input, profile), [], `${sc.id}/${v.id}`);
  const r = P.buildLabVariant(profile, players, 'LAB11-02', 'E30'); assert.equal(r.changes[0].despues, 30); assert.equal(r.base.teams[0].players[0].state.energy, 100, 'la base no cambia');
  const file = JSON.parse(JSON.stringify(P.exportScenario(r, profile)));
  const imp = P.importScenario(file, profile); assert.ok(imp.ok); assert.deepEqual(imp.record.input, r.input);
  const lib = new P.PopulationLibrary({ storage: new MemoryStorage() }); const s = lib.saveScenario(imp.record);
  assert.deepEqual(new P.PopulationLibrary({ storage: lib.storage }).scenario(s.id).input, r.input);
  const bad = deepCopy(file); bad.input.teams[0].players[0].abilities.TEC01 = 29.5; assert.equal(P.importScenario(bad, profile).ok, false, 'una entrada alterada no coincide con su huella');
  assert.equal(P.importScenario({ schema: 'otro' }, profile).ok, false);
  // cambio de plantilla: el director de EQ01 no queda en EQ09; las referencias al rival que ya no existe se retiran
  const t = P.referenceTeam(profile, players, 'EQ01'); t.plan.target = 'EQ02-J03'; const removed = P.dropStaleRivalRefs(t, P.referenceTeam(profile, players, 'EQ09').players.map((q) => q.id)); assert.ok(removed.length && t.plan.target === null);
  // variantes: identidad nueva, la referencia no se sobrescribe
  const v = lib.saveVariant(refs()[3], { name: 'x', base: { teamId: 'EQ04', kind: 'reference' } }); assert.match(v.id, /^EQ04V\d\d$/); assert.equal(lib.remove('EQ04').ok, false);
});

test('6. lectores: cierres con fila colectiva conciliada, producción por 100 con mismas unidades e instrumentación sin efecto deportivo', () => {
  const res = runMatch(P.buildLabVariant(profile, players, 'LAB11-00', 'base').input, profile, { detail: 'full' });
  const ref15 = JSON.parse(readFileSync(new URL('./fixtures/baseline-motor17b.json', import.meta.url), 'utf8'))['20261016']; // MOTOR-15: nueva referencia (la de MOTOR-14 era 83–103, 6.505 sorteos)
  assert.deepEqual(res.score, ref15.score); assert.equal(res.diagnostics.sportingDraws, ref15.draws);
  const ix = analyze(res, { audience: 'public', team: 0 });
  for (const t of [0, 1]) { const c = ix.closures(t); assert.ok(c.reconciled); assert.equal(c.individual + c.collective.n, c.eligible); assert.ok(c.collective.n >= 0); }
  const x = ix.production100('EQ01-J03', 'pts'); assert.equal(x.complete.attacks + x.mixed.attacks + x.partial.attacks + x.absent.attacks, ix.closures(0).eligible, 'cada ataque propio está en un solo universo');
  assert.ok(Math.abs(x.value - (100 * x.complete.credits) / x.complete.attacks) < 1e-9);
  assert.equal(ix.production100('EQ01-J12', 'pts').value, null, 'sin ataques completos no hay cero inventado');
  // lado: el mapa conserva «lado desconocido»: nunca hay filas izquierda/derecha
  assert.ok(ix.sectors(0).every((s) => !/izquierda|derecha/i.test(s.label.replace(/izquierda, central y derecha sin distinguir/, ''))));
  // los datos de lectura no cambian el deporte (misma proyección sin `instr`) y OB05 no es público
  assert.ok(res.events.some((e) => e.instr)); const own = analyze(res, { audience: 'own', team: 0 }).offBall(0).find((r) => r.id === 'OB05');
  assert.match(own.value, /evaluaciones de ayuda/); assert.match(ix.offBall(0).find((r) => r.id === 'OB05').value, /no autorizada/);
  assert.deepEqual(res.score, ref15.score); // MOTOR-15: la referencia vigente (baseline-motor11.json conserva la de MOTOR-11)
  // organización por hecho: cada tiro válido está en exactamente una fila
  const o = ix.organizationsByFact(0); assert.equal(o.rows.reduce((s, r) => s + r.att, 0), o.total);
});

test('7. versiones: una fuente común y un export producido sin instrumentación sigue reproduciéndose', () => {
  assert.equal(APP_VERSION, 'SIM-MOTOR-01'); assert.match(appLine(), /SIM-MOTOR-01.*beM-motor-0\.18\.1-MOTOR18B.*beM-match-export\/10/);
  assert.match(profile.effectiveId, /\+SEM-MOTOR11-20261017\+SEM-MOTOR12-20261017(\+SEM-MOTOR13-20261017)?(\+SEM-MOTOR14-20261017)?(\+SEM-MOTOR15-20261017)?(\+SEM-MOTOR15B-20261017)?(\+SEM-MOTOR17-20261018)?(\+SEM-MOTOR17B-20261021)?(\+SEM-MOTOR18-20261021)?(\+SEM-MOTOR18B-20261022)?$/);
  const html = readFileSync(new URL('../src/lab/index.html', import.meta.url), 'utf8'); assert.ok(!/MOTOR-0\d|MOTOR-10/.test(html), 'la cabecera estática no fija una versión propia');
  const res = runMatch(P.buildLabVariant(profile, players, 'LAB11-00', 'base').input, profile, { detail: 'full' });
  const old = JSON.parse(JSON.stringify(res)); for (const e of old.events) delete e.instr; delete old.diagnostics.instrumentation; // export producido sin instrumentación
  assert.equal(replayMatch(old).comparison.identical, true);
});

test('8. integración: un equipo generado frente a otro se juega, se exporta y se reproduce; la edad sola no cambia el deporte', () => {
  const g1 = P.generateTeam(profile, players, { base: 'EQ04', seed: 20261017, dispersion: 1 }); const g2 = P.generateTeam(profile, players, { base: 'EQ10', seed: 20261018, dispersion: 1 });
  const input = { schema: 'beM-match-input/6', seed: 20261016, importance: 'ordinary', teams: [P.instantiate(g1, []), P.instantiate(g2, [g1.id])] };
  const res = runMatch(input, profile, { detail: 'full', check: true }); assert.equal(res.status, 'finished'); assert.ok(res.reconciliation.valid);
  assert.equal(replayMatch(JSON.parse(JSON.stringify(res))).comparison.identical, true);
  const frozen = deepCopy(res.input.teams[0].players[0].abilities); input.teams[0].players[0].abilities.TEC01 += 3; assert.deepEqual(res.input.teams[0].players[0].abilities, frozen, 'la entrada del partido está congelada');
  const A = P.buildLabVariant(profile, players, 'LAB11-06', 'base'); const B = P.buildLabVariant(profile, players, 'LAB11-06', 'AGE');
  assert.deepEqual(sportsProjection(runMatch(A.input, profile, {})).events.length, sportsProjection(runMatch(B.input, profile, {})).events.length);
  void closureTable;
});
