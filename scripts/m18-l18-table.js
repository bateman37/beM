// Tabla de cálculo L18-01…L18-14 de MOTOR-18 (§14): comprobaciones PURAS de aprendizaje y retención, sin partidos. Entradas y salidas completas; cada fila lleva sus `checks` mecánicos.
// Uso: node scripts/m18-l18-table.js [--out=docs/tecnico/evidencia-motor18/l18]  (escribe l18.json, l18.csv y l18.md). Las constantes salen de profile.familiarity (SEM18); aquí solo hay ENTRADAS de los casos.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import * as L from '../src/learning/index.js';

const TOL = 1e-9;
const near = (a, b, t = TOL) => Math.abs(a - b) <= t;
const r6 = (x) => Math.round(x * 1e6) / 1e6;

export function buildL18(profile = loadData().profile) {
  const P = profile.familiarity;
  const mods = L.idsOf('tactic', P);
  const coachOf = (teaching = 16, mastery = 16, o = {}) => ({ teaching, tacticalMastery: { ...Object.fromEntries(mods.map((i) => [i, mastery])), ...o } });
  const block = (level, day = 0, patches = {}) => {
    const b = L.allMastered(P, day);
    for (const d of L.DOMAINS) for (const id of L.idsOf(d, P)) b[L.BLOCK_FIELD[d]][id] = L.makeEntry(level, day);
    for (const [key, e] of Object.entries(patches)) { const { domain, id } = L.parseKey(key); Object.assign(b[L.BLOCK_FIELD[domain]][id], e); }
    return b;
  };
  const gain = ({ domain, id, level, peak = level, dose, tl = 16, teaching = 16, mastery = 16, relatedBlock = null }) => {
    const f = L.factorsFor({ domain, id, block: relatedBlock ?? block(level), tacticalLearning: tl, coach: coachOf(teaching, mastery), params: P });
    const r = L.learnClosed({ level, peak, dose, rate: L.rateOf(domain, P), F: f.product, params: P });
    return { factors: { player: r6(f.player), teaching: r6(f.teaching), content: r6(f.content), transfer: r6(f.transfer), product: r6(f.product) }, before: { level, peak }, after: { level: r.level, peak: r.peak }, gain: r.level - level, G: r.G, acceleratedDose: r.acceleratedDose, normalDose: r.normalDose };
  };
  const team = (blocks, coach = coachOf(), day = 0, instanceId = 'T-L18') => {
    const t = L.createTeamState({ instanceId, players: Object.fromEntries(Object.entries(blocks).map(([pid, b]) => [pid, { block: b, tacticalLearning: 16 }])), coach, day }, P);
    if (!t.ok) throw new Error(JSON.stringify(t.errors.slice(0, 3)));
    return t.state;
  };
  const rows = [];
  const add = (id, titulo, entradas, salidas, checks) => rows.push({ id, titulo, entradas, salidas, checks, ok: Object.values(checks).every(Boolean) });

  // L18-01…03: misma dosis (1 h) sobre ORG02 con K=12 (tácticas: intervienen jugador, enseñanza y contenido).
  { const lo = gain({ domain: 'tactic', id: 'ORG02', level: 12, dose: 1, tl: 8 }); const hi = gain({ domain: 'tactic', id: 'ORG02', level: 12, dose: 1, tl: 24 });
    add('L18-01', 'Polivalencia 8 frente a 24 (misma dosis, conocimiento y entrenador)', { target: 'tactic:ORG02', level: 12, doseHoras: 1, teaching: 16, coachMastery: 16, tacticalLearning: [8, 24] }, { p8: lo, p24: hi }, { mayorGananciaConPolivalenciaAlta: hi.gain > lo.gain, soloCambiaFJugador: hi.factors.teaching === lo.factors.teaching && hi.factors.content === lo.factors.content }); }
  { const lo = gain({ domain: 'tactic', id: 'ORG02', level: 12, dose: 1, teaching: 8 }); const hi = gain({ domain: 'tactic', id: 'ORG02', level: 12, dose: 1, teaching: 24 });
    add('L18-02', 'Teaching 8 frente a 24', { target: 'tactic:ORG02', level: 12, doseHoras: 1, tacticalLearning: 16, coachMastery: 16, teaching: [8, 24] }, { t8: lo, t24: hi }, { mayorGananciaConTeachingAlto: hi.gain > lo.gain, soloCambiaFEnsenanza: hi.factors.player === lo.factors.player }); }
  { const lo = gain({ domain: 'tactic', id: 'ORG02', level: 12, dose: 1, mastery: 8 }); const hi = gain({ domain: 'tactic', id: 'ORG02', level: 12, dose: 1, mastery: 28 });
    add('L18-03', 'Competencia del entrenador en ORG02 8 frente a 28', { target: 'tactic:ORG02', level: 12, doseHoras: 1, teaching: 16, tacticalLearning: 16, coachMastery: [8, 28] }, { m8: lo, m28: hi }, { mayorGananciaConCompetenciaAlta: hi.gain > lo.gain, soloCambiaFContenido: hi.factors.player === lo.factors.player && hi.factors.teaching === lo.factors.teaching }); }
  // L18-04: nivel 12 frente a 28, misma dosis y factores (posición C: sin relacionados cercanos relevantes; se usa bloque uniforme y se aísla con transferencia=1 si coincide).
  { const a = gain({ domain: 'offensiveRole', id: 'O10', level: 12, dose: 1, relatedBlock: block(1) }); const b = gain({ domain: 'offensiveRole', id: 'O10', level: 28, dose: 1, relatedBlock: block(1) });
    add('L18-04', 'Nivel inicial 12 frente a 28: ganancia menor cerca del máximo (relacionados fijados al mínimo para igualar factores)', { target: 'offensiveRole:O10', levels: [12, 28], doseHoras: 1, factoresIguales: true }, { k12: a, k28: b }, { factoresIguales: a.factors.product === b.factors.product, gananciaMenorCercaDelMaximo: b.gain < a.gain }); }
  // L18-05: reaprendizaje y corte del tramo acelerado.
  { const relearn = gain({ domain: 'position', id: 'SG', level: 26, peak: 30, dose: 1, relatedBlock: block(1) }); const fresh = gain({ domain: 'position', id: 'SG', level: 26, peak: 26, dose: 1, relatedBlock: block(1) });
    const cut = gain({ domain: 'position', id: 'SG', level: 27.8, peak: 28, dose: 6, relatedBlock: block(1) }); const F = cut.factors.product; const dStar = (29 * Math.log((30 - 27.8) / (30 - 28))) / (P.learning.factors.relearning * L.rateOf('position', P) * F);
    add('L18-05', 'Nivel 26 con peak 30 frente a nivel/peak 26; y corte del tramo acelerado al cruzar el peak (27,8 → peak 28 con 6 h)', { target: 'position:SG', casos: [{ level: 26, peak: 30, dose: 1 }, { level: 26, peak: 26, dose: 1 }, { level: 27.8, peak: 28, dose: 6 }] }, { reaprende: relearn, nuevo: fresh, corte: { ...cut, dosisHastaPeakEsperada: dStar } },
      { reaprendeMasRapidoQueAdquirir: relearn.gain > fresh.gain, tramoAceleradoTerminaEnElPeak: near(cut.acceleratedDose, dStar, 1e-4) && cut.acceleratedDose < 6, picoSuperadoTrasElCruce: cut.after.level > 28 && cut.after.peak === cut.after.level, sinAceleracionSiNuncaSeAprendio: fresh.acceleratedDose === 0 }); }
  // L18-06 / 07: desuso.
  const ret = (domain, level, peak, last, dest, id = L.idsOf(domain, P)[0]) => { const e = { level, peak, lastPracticeDay: last }; const r = L.retainEntry(e, domain, 0, dest, P); return { domain, id, level, peak, lastPracticeDay: last, destDay: dest, after: r.level, wearDays: r.wearDays, floor: r.floor }; };
  { const x = ret('position', 30, 30, 0, 3650);
    add('L18-06', 'Posición 30/peak 30, sin práctica 3650 días: 26,4', { domain: 'position', level: 30, peak: 30, lastPracticeDay: 0, destDay: 3650 }, x, { veintiseisCuatro: near(x.after, 26.4) }); }
  { const cases = ['position', 'offensiveRole', 'defensiveRole', 'tactic'].map((d) => ret(d, 30, 30, 0, 3650)); const below = ret('tactic', 10, 30, 0, 3650); const mid = ret('offensiveRole', 30, 30, 0, 200);
    add('L18-07', 'Desuso de roles y módulos con sus curvas y suelos; nunca por encima del nivel previo', { casos: 'dominio × (30/30, sin práctica, 3650 días); módulo con nivel 10 y peak 30; rol a los 200 días' }, { cases, nivelPorDebajoDelSuelo: below, justoTrasLaGracia: mid },
      { noSuben: [...cases, below, mid].every((c) => c.after <= c.level), moduloLlegaAlSuelo: near(cases[3].after, 30 * P.retention.tactic.floorFraction), nivelBajoElSueloSeMantiene: below.after === 10, rolDespuesDeGraciaPierdeMuyPoco: near(mid.after, 30 - (P.retention.offensiveRole.lossPerYear * 20) / 365) }); }
  // L18-08: práctica relevante y fragmentación (vía sesiones de equipo).
  { const mk = (patch) => team({ a: block(12, 400, patch) }, coachOf(), 400);
    const sess = (st, fraction, individualFocus) => L.proposeFromSession(st, { source_id: `S-${Math.random()}`, collectiveFocus: individualFocus ? null : 'ORG02', shares: individualFocus ? { collective: 0, individual: 1 } : { collective: fraction, individual: 1 - fraction }, players: { a: { hours: P.learning.session.minHoursPerPlayerDay, individualFocus: individualFocus ?? null } } }, P);
    const tiny = (st) => { const p = L.proposeFromSession(st, { source_id: `F-${st.players.a.ledger.training.hours}`, collectiveFocus: 'ORG02', shares: { collective: 0.05, individual: 0.95 }, players: { a: { hours: 0.25, individualFocus: null } } }, P); return p; };
    const s0 = mk({ 'tactic:ORG02': { lastPracticeDay: 0 } }); const first = tiny(s0); const second = tiny(first.nextState);
    const big = L.proposeFromSession(s0, { source_id: 'G', collectiveFocus: 'ORG02', players: { a: { hours: 1, individualFocus: null } } }, P);
    const lp = (p) => p.nextState.players.a.block.tactics.ORG02.lastPracticeDay; void sess;
    add('L18-08', 'Práctica relevante renueva la fecha; dosis fragmentadas del día se agregan (umbral táctico 0,02)', { day: 400, lastPracticeDayInicial: 0, fragmentos: '2 × 0,25 h con 5 % al módulo ORG02 = 2 × 0,0125 h de dosis', umbralTactica: P.learning.practiceThresholds.tactic }, { primerFragmento: { dosis: first.players.a.targets[0].dose, lastPracticeDay: lp(first), gananciaAportada: first.players.a.targets[0].after.level - first.players.a.targets[0].before.level }, segundoFragmento: { dosisAgregada: second.players.a.targets[0].practiceAggregatedToday, lastPracticeDay: lp(second) }, dosisGrande: { dosis: big.players.a.targets[0].dose, lastPracticeDay: lp(big) } },
      { fragmentoPequenoAportaGananciaSinReiniciar: lp(first) === 0 && first.players.a.targets[0].after.level > first.players.a.targets[0].before.level, agregadoRenueva: lp(second) === 400, dosisGrandeRenueva: lp(big) === 400 }); }
  // L18-09: intervalo largo frente a subdivisiones.
  { const base = block(30, 200, { 'tactic:ORG01': { level: 25, peak: 28, lastPracticeDay: 100 } }); const st = team({ a: base }, coachOf(), 200); const one = L.advanceTeam(st, 3650, P).state;
    const a = L.advanceTeam(st, 1000, P).state; const b = L.advanceTeam(a, 2500, P).state; const c = L.advanceTeam(b, 3650, P).state;
    const diff = Math.max(...L.knowledgeKeys(P).map(({ domain, id }) => Math.abs(L.levelOf(one.players.a.block, domain, id) - L.levelOf(c.players.a.block, domain, id))));
    add('L18-09', 'Un intervalo largo frente a sus subdivisiones, sin práctica: mismo resultado', { destDay: 3650, subdivisiones: [1000, 2500, 3650], bloque: 'todo 30/30 salvo ORG01 25/28 con última práctica 100, evaluado el día 200' }, { unSolo: { ORG01: one.players.a.block.tactics.ORG01.level, PG: one.players.a.block.positions.PG.level }, subdividido: { ORG01: c.players.a.block.tactics.ORG01.level, PG: c.players.a.block.positions.PG.level }, maxDiferencia: diff }, { igualesConTolerancia: diff < 1e-12 }); }
  // L18-10: una dosis frente a dos mitades (factores constantes), con y sin cruce del peak.
  { const run = (level, peak, dose) => { const f = 1.1; const one = L.learnClosed({ level, peak, dose, rate: 0.4, F: f, params: P }); const h1 = L.learnClosed({ level, peak, dose: dose / 2, rate: 0.4, F: f, params: P }); const h2 = L.learnClosed({ level: h1.level, peak: h1.peak, dose: dose / 2, rate: 0.4, F: f, params: P }); return { level, peak, dose, unaDosis: one.level, dosMitades: h2.level, diferencia: Math.abs(one.level - h2.level), peakUna: one.peak, peakMitades: h2.peak }; };
    const cases = [run(12, 12, 2), run(26, 28, 6), run(26, 30, 3), run(10, 20, 40)];
    add('L18-10', 'Una dosis frente a dos mitades con factores constantes (incluye cruce del peak y reaprendizaje con peak 30)', { F: 1.1, rate: 0.4, casos: cases.map((c) => [c.level, c.peak, c.dose]) }, { cases }, { igualConTolerancia: cases.every((c) => c.diferencia < 1e-9), mismoPeak: cases.every((c) => near(c.peakUna, c.peakMitades, 1e-9)) }); }
  // L18-11: fuente de partido aplicada dos veces.
  const exposure = (id) => ({ match: { source_id: id }, players: { a: { liveTenths: 40 * 600, positions: { PG: 20000, SG: 4000 }, offensiveRoles: { O01: 24000 }, defensiveRoles: { D01: 24000 }, modules: { ORG02: 10, 'FAM:pick_and_roll': 30 } } } });
  { const st = team({ a: block(12) }); const pr = L.proposeFromMatch(st, exposure(L.sourceIdOf({ source: 'lab', batch: 'LOT-1', attempt: 'M000001-A1', teamInstance: 'T-L18' })), P);
    const a1 = L.applyProposal(st, L.createLedger(), pr); const a2 = L.applyProposal(a1.state, a1.ledger, pr);
    add('L18-11', 'Fuente de partido aplicada dos veces: la segunda no modifica nada', { source: pr.source_id, exposicion: exposure('x').players.a }, { primera: { ok: a1.ok, huellaAntes: pr.prevFingerprint, huellaDespues: pr.nextFingerprint }, segunda: { ok: a2.ok, motivo: a2.reason } }, { primeraAplica: a1.ok && pr.prevFingerprint !== pr.nextFingerprint, segundaRechazada: !a2.ok, estadoIntacto: L.teamFingerprint(a1.state) === pr.nextFingerprint }); }
  // L18-12: cambio de entrenador/equipo no borra conocimientos; otro quinteto cambia el resumen colectivo.
  { const b1 = block(10, 0, { 'position:PG': { level: 28, peak: 28 } }); const b2 = block(10, 0, { 'position:PG': { level: 12, peak: 12 } });
    const old = team({ a: b1, b: b2 }, coachOf(16, 16)); const swapped = team({ a: b1, b: b2 }, coachOf(28, 4), 0, 'T-OTRO');
    const lineA = L.teamSummary([b1, b1], P).domains.position.PG; const lineB = L.teamSummary([b1, b2], P).domains.position.PG;
    add('L18-12', 'Cambio de entrenador/equipo no borra conocimientos; otro quinteto cambia el resumen colectivo', { entrenadores: [{ teaching: 16 }, { teaching: 28 }], quintetos: ['a+a', 'a+b'] }, { conocimientoTrasCambio: { a: swapped.players.a.block.positions.PG.level, b: swapped.players.b.block.positions.PG.level }, resumenPGQuintetoAA: lineA, resumenPGQuintetoAB: lineB }, { conocimientoIntacto: L.knowledgeFingerprint(old.players.a.block) === L.knowledgeFingerprint(swapped.players.a.block), resumenCambia: lineA !== lineB, sinPropiedadColectiva: !('collective' in swapped) }); }
  // L18-13: transferencia acelera aprender un objetivo relacionado sin subirlo ni mejorarlo antes de entrenar.
  { const withRel = block(8, 0, { 'position:PF': { level: 30, peak: 30 } }); const noRel = block(8);
    const a = gain({ domain: 'position', id: 'C', level: 8, dose: 1, relatedBlock: withRel }); const b = gain({ domain: 'position', id: 'C', level: 8, dose: 1, relatedBlock: noRel });
    const st = team({ a: withRel }); const idle = L.proposeFromSession(st, { source_id: 'solo-PF', collectiveFocus: null, players: { a: { hours: 1, individualFocus: { domain: 'position', id: 'PF' } } } }, P);
    add('L18-13', 'La transferencia acelera aprender un objetivo relacionado sin subirlo ni mejorarlo antes de entrenar', { objetivo: 'position:C', relacionado: 'position:PF (30 frente a 8)', doseHoras: 1 }, { conRelacionadoAlto: a, conRelacionadoBajo: b, nivelDeCSinEntrenarlo: idle.nextState.players.a.block.positions.C.level }, { aprendeMasRapido: a.gain > b.gain && a.factors.transfer > b.factors.transfer, noSubeAntesDeEntrenar: idle.nextState.players.a.block.positions.C.level === 8, sinCascada: idle.players.a.targets.length === 1 }); }
  // L18-14: presupuestos acumulados (entrenamiento y partido, mismo día).
  { const st = team({ a: block(12) }); const mk = (id, hours) => ({ source_id: id, collectiveFocus: 'ORG02', players: { a: { hours, individualFocus: null } } });
    const s1 = L.applyProposal(st, L.createLedger(), L.proposeFromSession(st, mk('S1', 3), P)); const p2 = L.proposeFromSession(s1.state, mk('S2', 3), P); const s2 = L.applyProposal(s1.state, s1.ledger, p2); const p3 = L.proposeFromSession(s2.state, mk('S3', 1), P);
    const m1 = L.applyProposal(s2.state, s2.ledger, L.proposeFromMatch(s2.state, exposure('M1'), P)); const pm2 = L.proposeFromMatch(m1.state, exposure('M2'), P);
    add('L18-14', 'Sesiones sucesivas y partidos del mismo día respetan sus presupuestos acumulados', { sesiones: [3, 3, 1], tope: P.learning.session.maxHoursPerPlayerDay, partidos: ['M1 40 min', 'M2 40 min'] }, { segundaSesion: p2.players.a.hours, terceraSesion: p3.players.a.hours, partido1: Object.fromEntries(Object.entries(pm2.players.a.budgets).map(([k, v]) => [k, { usadoAntes: v.usedBefore, permitidoM2: v.allowed }])) },
      { segundaRecortada: p2.players.a.hours.used === 1 && p2.players.a.hours.clampedByDailyBudget, terceraSinPresupuesto: p3.players.a.hours.used === 0, partidoNoMultiplica: Object.values(pm2.players.a.budgets).every((v) => v.allowed === 0 || v.exposureTotal === 0), entrenamientoYPartidoSeparados: m1.state.players.a.ledger.training.hours === 4 && m1.state.players.a.ledger.match.used.position === 1 }); }
  return { schema: 'beM-l18/1', learningVersion: P.learningVersion, rows, ok: rows.every((r) => r.ok) };
}

const csvRow = (r) => [r.id, r.titulo, r.ok, Object.entries(r.checks).map(([k, v]) => `${k}=${v}`).join(' | '), JSON.stringify(r.entradas), JSON.stringify(r.salidas)].map((x) => `"${String(x).replaceAll('"', '""')}"`).join(',');
export function renderL18(res) {
  const csv = `id,titulo,ok,checks,entradas,salidas\n${res.rows.map(csvRow).join('\n')}\n`;
  const md = ['# Tabla L18 (MOTOR-18)', '', `Versión de aprendizaje ${res.learningVersion}. Cálculo puro, sin partidos. Todas las constantes proceden de \`profile.familiarity\` (SEM18, provisional).`, '', ...res.rows.flatMap((r) => [`## ${r.id} · ${r.titulo} — ${r.ok ? 'correcto' : 'FALLA'}`, '', `Comprobaciones: ${Object.entries(r.checks).map(([k, v]) => `${v ? '✔' : '✘'} ${k}`).join(' · ')}`, '', 'Entradas:', '```json', JSON.stringify(r.entradas, null, 1), '```', 'Salidas:', '```json', JSON.stringify(r.salidas, (k, v) => (typeof v === 'number' ? r6(v) : v), 1), '```', ''])].join('\n');
  return { csv, md, json: `${JSON.stringify(res, null, 1)}\n` };
}
if (process.argv[1]?.endsWith('m18-l18-table.js')) {
  const out = (process.argv.find((a) => a.startsWith('--out=')) ?? '--out=docs/tecnico/evidencia-motor18/l18').slice(6);
  const res = buildL18(); const f = renderL18(res); mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'l18.json'), f.json); writeFileSync(join(out, 'l18.csv'), f.csv); writeFileSync(join(out, 'l18.md'), f.md);
  for (const r of res.rows) console.log(`${r.id} ${r.ok ? 'ok' : 'FALLA'} ${Object.entries(r.checks).filter(([, v]) => !v).map(([k]) => k).join(',')}`);
  process.exit(res.ok ? 0 : 1);
}
