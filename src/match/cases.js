// Casos de laboratorio preparados (MOTOR-09 §18.3): situaciones difíciles de encontrar de forma natural. Están ROTULADOS como preparados, muestran sus
// entradas y se ejecutan sobre copias: no tocan plantillas, planes ni partidos históricos. Son flujos de hechos tipados que pasan por las mismas
// funciones comunes (matriz REG, acta, conciliación, revisiones) que un encuentro natural; no hay un segundo motor para las excepciones.
import { createMatch, buildMatchInput, buildResult } from './index.js';
import { snapshotMatch, restoreMatch } from './snapshot.js';
import { buildActa } from './acta.js';
import { reconcile } from './reconcile.js';
import { applyRevisions } from './revisions.js';
import { combineSanctions, administerSeries, availability, terminate, resolveFoul } from './regs.js';

export const CASE_BADGE = 'Caso preparado de laboratorio (no es un partido natural)';

// Constructor mínimo de flujos de hechos: secuencia estable, quintetos registrados y reloj coherente. `script`: [{ type, period, team, possession, dur, stats, participants, effects }].
export function syntheticMatch(profile, input, script, status = 'finished') {
  const core = createMatch(input, profile, { detail: 'minimal' });
  const lineup = core.lineup.map((l) => ({ ...l }));
  const table = core.lineupTable.map((l) => ({ ...l, slots: { ...l.slots } }));
  const idOf = [core.lineupId[0], core.lineupId[1]];
  const register = (t) => {
    const key = Object.values(lineup[t]).join('|'); const f = table.find((l) => l.team === t && l.key === key);
    if (f) { idOf[t] = f.id; return; }
    const id = `L${t}-${table.filter((l) => l.team === t).length + 1}`; table.push({ id, team: t, key, slots: { ...lineup[t] } }); idOf[t] = id;
  };
  const events = []; let clock = 6000; let period = 1;
  for (const it of script) {
    if (it.type === 'substitution' && it.participants) {
      const { sale, entra } = it.participants; const t = input.teams.findIndex((x) => x.players.some((p) => p.id === sale));
      const slot = Object.keys(lineup[t]).find((s) => lineup[t][s] === sale);
      if (entra) lineup[t][slot] = entra; else delete lineup[t][slot]; // salida sin reemplazo: inferioridad real, sin jugador ficticio
      register(t);
    }
    period = it.period ?? period; const dur = it.dur ?? 0; const before = clock; clock = Math.max(0, clock - dur);
    events.push({ seq: events.length + 1, id: `E${String(events.length + 1).padStart(4, '0')}`, type: it.type, period, possessionId: it.possession ?? null, team: it.team ?? null, clock: { before, after: clock }, shotClock: { before: 0, after: 0 }, durationTenths: dur,
      lineups: [...idOf], intent: it.intent ?? null, participants: it.participants ?? {}, stats: it.stats ?? [], effects: it.effects ?? {}, score: [0, 0], draws: [] });
  }
  const possessions = []; const seen = new Map();
  for (const e of events) { if (!e.possessionId) continue; let p = seen.get(e.possessionId); if (!p) { p = { id: e.possessionId, team: e.team, period: e.period, startSeq: e.seq, endSeq: e.seq, endKind: null }; seen.set(e.possessionId, p); possessions.push(p); } p.endSeq = e.seq; }
  for (const p of possessions) p.endKind = it_endKind(script, p.id) ?? 'madeFG';
  const score = [0, 0]; const per = {};
  for (const e of events) for (const f of e.stats) {
    const pts = f.k === 'shot' && f.made && !f.annulled ? f.points : (f.k === 'ft' && f.made && (f.status ?? 'administered') === 'administered' ? 1 : 0);
    if (pts) { score[f.team] += pts; (per[e.period] ??= [0, 0])[f.team] += pts; }
  }
  const periodScores = [...new Set(events.map((e) => e.period))].sort((a, b) => a - b).map((p) => ({ period: p, points: per[p] ?? [0, 0] }));
  return { events, lineups: table, input: core.input, possessions, score, periodScores, status, profile, diagnostics: {} };
}
const it_endKind = (script, id) => script.find((s) => s.possession === id && s.endKind)?.endKind;

const shot = (p, team, zone, points, made, extra = {}) => ({ k: 'shot', p, team, zone, points, made, fromFoul: false, feed: null, ...extra });
const ft = (p, team, i, n, made, series, extra = {}) => ({ k: 'ft', p, team, made, series, i, n, cause: 'falta en acto de tiro', shooting: true, shotEvent: 'E0003', shotMade: false, feed: { passer: 'EQ01-J01', moved: false, window: false, origin: 'POS01' }, ...extra });
const foulStat = (p, team, kind, sobre) => ({ k: 'foul', p, team, kind, teamFoul: true, sobre });

function baseInput(profile, players, seed = 1) { return buildMatchInput(profile, players, { seed }); }

// ---------------------------------------------------------------- casos
export const LAB_CASES = [
  {
    id: 'CASO-SERIE', title: 'Serie de libres con repetición y anulación', area: 'REG04 · EST02',
    inputs: ['EQ01-J03 recibe una falta en un tiro de dos fallado, con pase final elegible de EQ01-J01 (sin creación propia)', 'Serie de dos libres: el primero entra; el segundo falla pero se REPITE; el intento repetido entra'],
    expected: ['2 libres concedidos, 3 administrados, 2 válidos (TLI = 2, TLC = 2); el intento repetido no cuenta en el porcentaje ni abre otra F', 'una sola F con el tiro fallado y su serie ligada (2 puntos), y una sola asistencia a libres para EQ01-J01'],
    run({ profile, players }) {
      const input = baseInput(profile, players);
      const res = syntheticMatch(profile, input, [
        { type: 'tipoff', team: 0 }, { type: 'period_start', team: 0 },
        { type: 'attempt', possession: 'P001', team: 0, dur: 80, stats: [shot('EQ01-J03', 0, 'midrange', 2, false, { fromFoul: true, feed: { passer: 'EQ01-J01', moved: false, window: false, origin: 'POS01' } })], effects: { falta: { de: 'EQ02-J05', sobre: 'EQ01-J03' } } },
        { type: 'foul', possession: 'P001', team: 0, stats: [foulStat('EQ02-J05', 1, 'tiro', 'EQ01-J03')], effects: { tirosLibres: 2 } },
        { type: 'free_throw', possession: 'P001', team: 0, stats: [ft('EQ01-J03', 0, 1, 2, true, 'S001')] },
        { type: 'free_throw', possession: 'P001', team: 0, stats: [ft('EQ01-J03', 0, 2, 2, false, 'S001', { status: 'repeated' })] },
        { type: 'free_throw', possession: 'P001', team: 0, endKind: 'ftMade', stats: [ft('EQ01-J03', 0, 3, 2, true, 'S001')] },
      ]);
      const acta = buildActa(res, profile.statsPolicy);
      const admin = administerSeries({ id: 'S001', granted: 2, attempts: [{ made: true }, { made: false, status: 'repeated' }, { made: true }] });
      return { res, acta, reconciliation: reconcile(res, acta), admin, highlights: { series: acta.series, finals: acta.finals, asistencias: acta.credits.filter((c) => c.k === 'ast') } };
    },
  },
  {
    id: 'CASO-COMBINADAS', title: 'Sanciones combinadas', area: 'REG04',
    inputs: ['A: dos sanciones de EQ01 (falta con bonus y una disruptiva) en orden de ocurrencia', 'B: dos faltas con bonus iguales de equipos opuestos (art. 43: compensación)', 'C: una técnica de categoría 1 (MOTOR-15: ejecutable)'],
    expected: ['A: se administra cada sanción UNA vez, en orden, con una única reanudación (convención provisional RG-C01)', 'B: se compensan por orden (equivalentes en libres y derechos); las faltas cargadas se conservan y no hay posesión ficticia', 'C: un libre sin alineación, falta individual y colectiva, contador de categoría 1'],
    run({ profile }) {
      const mk = (id, team, order, category, extra = {}) => ({ id, team, order, category, shotAction: false, penalty: false, committer: `P${id}`, fouled: `V${id}`, ...extra });
      const A = combineSanctions(profile, [mk('S1', 1, 1, 'personal', { penalty: true }), mk('S2', 1, 2, 'disruptiva')]);
      const B = combineSanctions(profile, [mk('S1', 0, 1, 'personal', { penalty: true }), mk('S2', 1, 2, 'personal', { penalty: true })]);
      const C = resolveFoul(profile, { category: 'tecnica1', shotAction: false });
      return { A, B, C, highlights: { A: { estado: A.status, pasos: A.steps, reanudacion: A.resume }, B: { estado: B.status, diagnostico: B.diagnostic }, C: { ok: C.ok, pendiente: !!C.pending, diagnostico: C.diagnostic } } };
    },
  },
  {
    id: 'CASO-CORRECCION', title: 'Corrección estadística y reglamentaria', area: 'REG04 · revisiones',
    inputs: ['Requiere un encuentro ya jugado (el último del laboratorio o la referencia 20261016)', 'R1: reatribución de una canasta a otro jugador presente (estadística)', 'R2: un dos que era un tres (reglamentaria)', 'R3: intento de clasificar R2 como «solo estadística» (se rechaza)'],
    expected: ['R1 cambia el acta y el más-menos del autor, no el marcador', 'R2 cambia marcador, parciales, intentos, F y posesión derivados; la continuación original se conserva', 'R3 se rechaza con motivo: cambia legalmente el marcador'],
    run({ result }) {
      if (!result) return { needsResult: true };
      const ev1 = result.events.find((e) => e.stats.some((f) => f.k === 'shot' && f.made && !f.fromFoul));
      const f1 = ev1.stats.find((f) => f.k === 'shot' && f.made); const lineBy = Object.fromEntries(result.lineups.map((l) => [l.id, Object.values(l.slots)]));
      const mate = lineBy[ev1.lineups[f1.team]].find((id) => id !== f1.p && id !== f1.feed?.passer);
      const ev2 = result.events.find((e) => e.seq > ev1.seq && e.stats.some((f) => f.k === 'shot' && f.made && f.points === 2 && !f.fromFoul));
      const revs = [
        { id: 'R1', class: 'statistical', kind: 'reattribute', fact: { event: ev1.id, k: 'shot' }, change: { field: 'p', to: mate }, reason: 'Atribución revisada a un compañero presente (entrada diagnóstica)' },
        { id: 'R2', class: 'regulatory', kind: 'shotValue', fact: { event: ev2.id, k: 'shot' }, change: { points: 3 }, reason: 'El lanzamiento se revisó como triple (entrada diagnóstica)', source: 'Art. 45 (sin contrastar: RG-R01)', recognizedAt: { seq: ev2.seq + 1 } },
        { id: 'R3', class: 'statistical', kind: 'shotValue', fact: { event: ev2.id, k: 'shot' }, change: { points: 3 }, reason: 'Intento de etiquetar un cambio de marcador como estadístico' },
      ];
      const out = applyRevisions(result, revs, result.profile?.statsPolicy);
      return { result, out, highlights: { marcadorOriginal: result.score, marcadorRevisado: out.score, registro: out.log.map((l) => ({ id: l.id, clase: l.class, antes: l.before, despues: l.after, contraste: l.contrast })), rechazadas: out.rejected, conciliacion: out.reconciliation.valid } };
    },
  },
  {
    id: 'CASO-INFERIORIDAD', title: 'Inferioridad e indisponibilidad, y terminación administrativa', area: 'REG04',
    inputs: ['EQ02 queda con cuatro elegibles (un excluido sin reemplazo) y anota en inferioridad', 'Después queda con un solo elegible (por debajo del umbral provisional de 2)'],
    expected: ['Cuatro en pista: no se rellena con el excluido; minutos y más-menos usan la ocupación real', 'Terminación administrativa: resultado ADJUDICADO distinto del tanteo de cancha; ningún jugador anota esos puntos'],
    run({ profile, players }) {
      const input = baseInput(profile, players);
      const res = syntheticMatch(profile, input, [
        { type: 'tipoff', team: 0 }, { type: 'period_start', team: 0 },
        { type: 'attempt', possession: 'P001', team: 0, dur: 100, stats: [shot('EQ01-J03', 0, 'three', 3, true)], endKind: 'madeFG' },
        { type: 'substitution', team: 1, participants: { sale: 'EQ02-J11', entra: null, posicion: 'C' }, effects: { excluido: true } },
        { type: 'attempt', possession: 'P002', team: 1, dur: 120, stats: [shot('EQ02-J05', 1, 'rim', 2, true)], endKind: 'madeFG' },
        { type: 'attempt', possession: 'P003', team: 0, dur: 100, stats: [shot('EQ01-J06', 0, 'midrange', 2, true)], endKind: 'madeFG' },
      ], 'terminated');
      const roster4 = input.teams[1].players.map((p, i) => ({ id: p.id, available: i < 4 }));
      const roster1 = input.teams[1].players.map((p, i) => ({ id: p.id, available: i < 1 }));
      const acta = buildActa(res, profile.statsPolicy);
      const av4 = availability(profile, roster4); const av1 = availability(profile, roster1);
      const adm = terminate(profile, { favored: 0, played: res.score, reason: 'EQ02 sin jugadores elegibles suficientes' });
      res.administrative = adm;
      return { res, acta, reconciliation: reconcile(res, acta), availability: { cuatro: av4, uno: av1 }, administrative: adm, highlights: { ocupacion: acta.pointEvents.map((p) => `${p.event}: ${p.on[0].length} vs ${p.on[1].length}`), marcadorDeCancha: res.score, adjudicado: adm.awarded } };
    },
  },
  {
    id: 'CASO-SENAL', title: 'Señal con administración pendiente', area: 'REG02 · EST02',
    inputs: ['Falta sobre un triple fallado justo antes de la bocina del cuarto periodo', 'Variante parcial: solo se ha administrado el primer libre de tres', 'Variante completa: los tres libres'],
    expected: ['El reloj de juego marca cero pero la serie sigue pendiente: el acta es PARCIAL y no definitiva; por cuartos no se detiene a mitad de la serie', 'Resuelta la serie, el acta cambia (puntos y TLI) y se cierra la F'],
    run({ profile, players }) {
      const input = baseInput(profile, players);
      const common = [
        { type: 'tipoff', team: 0 }, { type: 'period_start', team: 0, period: 4 },
        { type: 'attempt', possession: 'P001', team: 0, period: 4, dur: 5900, stats: [shot('EQ01-J06', 0, 'three', 3, false, { fromFoul: true, feed: { passer: 'EQ01-J01', moved: false, window: false, origin: 'POS07' } })], effects: { falta: { de: 'EQ02-J04', sobre: 'EQ01-J06' } } },
        { type: 'foul', possession: 'P001', team: 0, period: 4, stats: [foulStat('EQ02-J04', 1, 'tiro', 'EQ01-J06')], effects: { tirosLibres: 3 } },
      ];
      const f = (i, made) => ({ type: 'free_throw', possession: 'P001', team: 0, period: 4, endKind: i === 3 ? 'ftMade' : undefined, stats: [ft('EQ01-J06', 0, i, 3, made, 'S001')] });
      const partial = syntheticMatch(profile, input, [...common, f(1, true)], 'running');
      const full = syntheticMatch(profile, input, [...common, f(1, true), f(2, false), f(3, true)], 'finished');
      const ap = buildActa(partial, profile.statsPolicy); const af = buildActa(full, profile.statsPolicy);
      return { partial, full, acta: af, actaPartial: ap, reconciliation: reconcile(full, af), highlights: { parcial: { estado: ap.status, puntos: ap.score }, completa: { estado: af.status, puntos: af.score, finales: af.finals } } };
    },
  },
  {
    id: 'CASO-COLA-43', title: 'Cola de sanciones del art. 43 en el núcleo (43-5 y 43-7)', area: 'REG04 · MOTOR-15',
    inputs: ['43-5: canasta con falta (adicional) de EQ02 y técnica posterior de EQ01', '43-7: flagrante con canasta de EQ02 y técnica de EQ01'],
    expected: ['43-5: la canasta se conserva y las sanciones equivalentes se compensan (sin libres); faltas cargadas', '43-7: no equivalentes (el derecho sancionador distingue): la técnica se administra primero y se conserva el derecho'],
    run({ profile }) {
      const mk = (id, team, order, category, extra = {}) => ({ id, team, order, category, shotAction: false, penalty: false, committer: `P${id}`, fouled: `V${id}`, ...extra });
      const c5 = combineSanctions(profile, [mk('S1', 1, 1, 'personal', { shotAction: true, shotPoints: 2, shotMade: true }), mk('S2', 0, 2, 'tecnica1')]);
      const c7 = combineSanctions(profile, [mk('S1', 1, 1, 'flagrante', { shotAction: true, shotPoints: 2, shotMade: true }), mk('S2', 0, 2, 'tecnica1')]);
      return { c5, c7, highlights: { '43-5': { estado: c5.status, compensadas: c5.compensated, reanudacion: c5.resume.kind }, '43-7': { estado: c7.status, orden: c7.steps.map((x) => x.id), reanudacion: c7.resume.kind, derechoDe: c7.resume.from } } };
    },
  },
  {
    id: 'CASO-RG-I03', title: 'Interferencia defensiva en el último libre (RG-I03, MOTOR-15B)', area: 'REG02 · REG04 · MOTOR-15B',
    inputs: ['Copia SEM de laboratorio del perfil que solo expone la oportunidad existente (SEM15-INT-03 = 0,35; el resto de la interferencia a 0): NO mide ninguna frecuencia', 'Encuentro EQ01–EQ02 con semilla 1: el sorteo de la interferencia ya se tomó; la consecuencia no se vuelve a sortear',
      'Se guarda entre la técnica y su libre adicional y se continúa desde el guardado'],
    expected: ['El libre original concede UN punto (una sola vez)', 'Técnica de categoría 2 al defensor infractor: falta individual y colectiva, sin sumar a la descalificación por técnicas de categoría 1', 'Un libre adicional real (lanzador elegido por la política existente), con crédito y posibilidad de fallo',
      'Una única reanudación: saque de fondo del rival, sin rebote ni posesión por la técnica', 'Continuar desde el guardado no repite punto, sanción ni intento (mismo marcador, mismos libres y misma acta)'],
    run({ profile, players }) {
      const X = JSON.parse(JSON.stringify(profile)); X.interference.lastFreeThrow.defensiveP = 0.35; X.interference.lastFreeThrow.offensiveP = 0; X.interference.fieldGoal.defensiveP = 0; X.interference.fieldGoal.offensiveP = 0;
      const input = baseInput(X, players, 1); const drive = (m) => { while (m.step()); return buildResult(m); };
      const a = createMatch(input, X, { detail: 'minimal' }); let guard = 0;
      while (a.step() && guard++ < 400) { const e = a.events.at(-1); if (e.type === 'foul' && e.effects?.origenInterferencia) break; }
      const pendiente = { libreAdicionalPendiente: !!a.adminPlan, origen: a.adminPlan?.origin ?? null, marcadorEnLaFrontera: [...a.score] };
      const snap = JSON.parse(JSON.stringify(snapshotMatch(a, { label: 'guardado entre la técnica y su libre adicional (RG-I03)' }))); const ra = drive(a); const rb = drive(restoreMatch(snap));
      const i = ra.events.findIndex((e) => e.effects?.interferencia?.lado === 'defensive' && e.effects.interferencia.situacion === 'lastFreeThrow');
      const orig = ra.events[i]; const foul = ra.events.slice(i + 1).find((e) => e.type === 'foul'); const tech = ra.events.slice(i + 1).find((e) => e.type === 'free_throw'); const next = ra.events.slice(i + 1).find((e) => ['throw_in', 'rebound'].includes(e.type));
      const highlights = { libreOriginal: { evento: orig.id, lanzador: orig.stats[0].p, interferencia: orig.effects.interferencia.lado, infractor: orig.effects.interferencia.infractor, puntoConcedido: orig.stats[0].made },
        tecnica: { evento: foul.id, categoria: foul.effects.categoria, regla: foul.effects.regla, infractor: foul.participants.infractor, contadores: foul.effects.contadores, faltasColectivasDelPeriodo: foul.effects.faltasColectivasPeriodo, excluido: foul.effects.excluido },
        libreAdicional: { evento: tech.id, lanzador: tech.stats[0].p, entra: tech.stats[0].made, marcador: tech.score }, reanudacion: { evento: next.id, tipo: next.type, equipo: next.team },
        guardado: pendiente, continuacionIgual: ra.score.join('–') === rb.score.join('–') && ra.diagnostics.sportingDraws === rb.diagnostics.sportingDraws && JSON.stringify(ra.acta) === JSON.stringify(rb.acta), libresEnTotal: [ra.events.filter((e) => e.type === 'free_throw').length, rb.events.filter((e) => e.type === 'free_throw').length] };
      return { res: ra, acta: ra.acta, reconciliation: ra.reconciliation, highlights };
    },
  },
];
