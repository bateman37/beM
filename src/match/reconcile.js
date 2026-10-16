// Informe de conciliación de MOTOR-09 (§15): cada comprobación declara universo, esperado, observado, hechos causantes y versión. Una desviación no
// se «arregla» alterando el acta: se informa, y la ejecución con una inconsistencia real queda marcada como inválida o pendiente.
// No impone identidades falsas: AS ≤ FGM, robos = pérdidas rivales, rebotes = fallos, cinco jugadores siempre ni igualdad de posesiones por equipo.
import { buildActa } from './acta.js';

export const RECONCILE_VERSION = 'CONC-MOTOR09-R1';

// `res`: resultado de un encuentro (o { events, lineups, input, score, possessions, periodScores, status, diagnostics }). `acta` opcional (ya calculada).
export function reconcile(res, acta = null) {
  const a = acta ?? buildActa({ events: res.events, lineups: res.lineups, input: res.input, possessions: res.possessions, status: res.status });
  const checks = [];
  const add = (id, area, universe, expected, observed, ok, facts = [], note = null) => checks.push({ id, area, universe, expected, observed, ok, facts: facts.slice(0, 8), note, version: RECONCILE_VERSION });
  const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const events = res.events;

  // Marcador de cancha: suma de créditos válidos por periodo y sujeto = tanteo deportivo
  add('MARC01', 'Marcador de cancha', 'puntos de cancha por equipo', res.score, a.score, eq(res.score, a.score), []);
  if (res.periodScores) {
    const exp = res.periodScores.map((p) => ({ period: p.period, points: p.points })); const obs = a.periods.map((p) => ({ period: p.period, points: p.points }));
    const pad = exp.map((e) => obs.find((o) => o.period === e.period) ?? { period: e.period, points: [0, 0] });
    add('MARC02', 'Marcador de cancha', 'parciales por periodo', exp, pad, eq(exp, pad), []);
  }
  const indiv = [0, 1].map((t) => a.teams[t].players.reduce((s, id) => s + a.players[id].pts, 0));
  add('MARC03', 'Marcador de cancha', 'suma de PTS individuales por equipo', a.score, indiv, eq(a.score, indiv), []);
  // Tiro
  for (const t of a.teams) {
    const x = t.totals;
    add(`TIRO-${t.id}`, 'Tiro', `equipo ${t.id}`, { tcc: x.fg2m + x.fg3m, tci: x.fg2a + x.fg3a }, { tcc: x.fgm, tci: x.fga }, x.fgm === x.fg2m + x.fg3m && x.fga === x.fg2a + x.fg3a && x.fg2m <= x.fg2a && x.fg3m <= x.fg3a && x.ftm <= x.fta, []);
  }
  // Puntos: canastas + libres + créditos tipados = total, sin saldo anónimo
  for (const t of a.teams) {
    const x = t.totals; const typed = a.pointEvents.filter((p) => p.team === t.index && p.kind === 'admin').reduce((s, p) => s + p.pts, 0);
    const exp = 2 * x.fg2m + 3 * x.fg3m + x.ftm + typed;
    add(`PTS-${t.id}`, 'Puntos', `equipo ${t.id}: 2·T2C + 3·T3C + TLC + créditos tipados`, t.points, exp, t.points === exp, []);
  }
  // Particiones (dos clasificaciones del mismo total)
  const p = a.partition; const o = p.byOrigin;
  add('PART01', 'Particiones', 'F + sanción no de tiro + administrativos + otros = total', p.total, o.f + o.sanction + o.administrative + o.other, p.total === o.f + o.sanction + o.administrative + o.other && o.other === 0, [], '«otros» solo admite créditos tipados identificados: hoy debe ser 0');
  add('PART02', 'Particiones', 'vinculados a posesión + no vinculados = total', p.total, p.byPossession.linked + p.byPossession.unlinked, p.total === p.byPossession.linked + p.byPossession.unlinked && p.byPossession.unlinked >= 0, []);
  // Libres: concedidos, administrados, válidos; sin duplicar
  const seriesBad = a.series.filter((s) => s.valid > s.granted || s.attempts.some((x, i) => x.i !== i + 1) || s.valid + s.annulled + s.repeated !== s.administered);
  add('LIB01', 'Libres', 'series de libres: intentos válidos ≤ concedidos, secuencia sin huecos y válidos + anulados + repetidos = administrados', 0, seriesBad.length, seriesBad.length === 0, seriesBad.map((s) => s.id));
  const completeIncomplete = a.series.filter((s) => s.pending && res.status === 'finished');
  add('LIB02', 'Libres', 'ninguna serie queda pendiente en un encuentro terminado', 0, completeIncomplete.length, completeIncomplete.length === 0, completeIncomplete.map((s) => s.id));
  const fta = a.teams.reduce((s, t) => s + t.totals.fta, 0); const ftaSeries = a.series.reduce((s, x) => s + x.attempts.filter((y) => y.status === 'administered').length, 0);
  add('LIB03', 'Libres', 'TLI de las líneas = intentos válidos de las series', ftaSeries, fta, fta === ftaSeries, []);
  // Rebote: cada crédito remite a un fallo elegible y a un sujeto
  const evById = new Map(events.map((e) => [e.id, e]));
  const rebBad = a.credits.filter((c) => c.k === 'reb' && (!c.of || !evById.get(c.of) || !missOf(evById.get(c.of))));
  add('REB01', 'Rebote', 'cada rebote remite al fallo elegible que lo origina', 0, rebBad.length, rebBad.length === 0, rebBad.map((c) => c.event));
  // Robos y pérdidas: relación causal compatible, sin doble crédito (sin igualdad global)
  const stlBad = events.filter((e) => e.stats.some((f) => f.k === 'stl') && !(e.stats.some((f) => f.k === 'tov' && f.team !== e.stats.find((g) => g.k === 'stl').team) && e.stats.filter((f) => f.k === 'stl').length === 1));
  add('ROB01', 'Robos y pérdidas', 'cada robo comparte hecho con una pérdida del rival y no se duplica', 0, stlBad.length, stlBad.length === 0, stlBad.map((e) => e.id));
  // Tapones: TAP/TREC comparten intento
  const blkBad = events.filter((e) => e.stats.some((f) => f.k === 'blk') !== e.stats.some((f) => f.k === 'shot' && f.blockedBy));
  add('TAP01', 'Tapones', 'TAP y TREC remiten al mismo intento elegible', 0, blkBad.length, blkBad.length === 0, blkBad.map((e) => e.id));
  const tapN = a.teams.reduce((s, t) => s + t.totals.blk, 0); const trecN = a.teams.reduce((s, t) => s + t.totals.blkRec, 0);
  add('TAP02', 'Tapones', 'suma de TAP = suma de TREC', tapN, trecN, tapN === trecN, []);
  // Faltas: contadores coherentes con el motor
  const finalFouls = res.diagnostics?.finalFouls;
  if (finalFouls) {
    const bad = Object.keys(finalFouls).filter((id) => a.players[id] && a.players[id].pf !== finalFouls[id] - (res.input.teams[a.players[id].team].players.find((q) => q.id === id)?.state?.fouls ?? 0));
    add('FAL01', 'Faltas', 'FC del acta = faltas personales del estado final', 0, bad.length, bad.length === 0, bad);
  }
  const over = Object.values(a.players).filter((l) => l.pf > 5);
  add('FAL02', 'Faltas', 'ningún jugador supera el límite de faltas con el que sigue en pista', 0, over.length, over.length === 0, over.map((l) => l.id));
  // Presencia: intervalos no superpuestos, ocupación legal y minutos conciliados con el tiempo real
  const byPlayer = {}; for (const iv of a.presence.intervals) (byPlayer[iv.player] ??= []).push(iv);
  const overlap = Object.entries(byPlayer).filter(([, list]) => list.sort((x, y) => x.startGame - y.startGame || x.startSeq - y.startSeq).some((iv, i, arr) => i > 0 && iv.startGame < arr[i - 1].endGame)).map(([id]) => id);
  add('PRES01', 'Presencia', 'intervalos de presencia sin superposición por jugador', 0, overlap.length, overlap.length === 0, overlap);
  const lineBy = Object.fromEntries((res.lineups ?? []).map((l) => [l.id, Object.values(l.slots)]));
  if (res.lineups) {
    const alt = {}; for (const ev of events) if (ev.durationTenths > 0) for (const lid of ev.lineups) for (const pid of lineBy[lid]) alt[pid] = (alt[pid] ?? 0) + ev.durationTenths;
    const diff = Object.keys(a.players).filter((id) => (alt[id] ?? 0) !== a.players[id].minTenths);
    add('PRES02', 'Presencia', 'minutos por intervalos = minutos por quintetos registrados en cada hecho', 0, diff.length, diff.length === 0, diff);
  }
  const game = a.presence.game;
  for (const t of a.teams) {
    const occupied = a.presence.intervals.filter((iv) => iv.team === t.index).reduce((s, iv) => s + iv.tenths, 0);
    const sumMin = t.players.reduce((s, id) => s + a.players[id].minTenths, 0);
    add(`PRES03-${t.id}`, 'Presencia', `equipo ${t.id}: minutos = tiempo real × ocupación efectiva`, occupied, sumMin, occupied === sumMin && sumMin <= 5 * game, [], 'la inferioridad legal reduce la ocupación esperada respecto a cinco jugadores');
  }
  // Más-menos: sobre el universo elegible y la ocupación real; en casos normales (cinco siempre) = 5 × margen
  for (const t of a.teams) {
    const pm = t.players.reduce((s, id) => s + a.players[id].pm, 0); const full = a.pointEvents.every((pe) => pe.on[0].length === 5 && pe.on[1].length === 5);
    const exp = a.pointEvents.reduce((s, pe) => s + (pe.team === t.index ? 1 : -1) * pe.pts * pe.on[t.index].length, 0);
    add(`PM-${t.id}`, 'Más-menos', `equipo ${t.id}: suma de +/- = Σ(puntos × ocupación) con signo`, exp, pm, exp === pm && (!full || pm === 5 * (a.score[t.index] - a.score[1 - t.index])), [], full ? 'universo normal: cinco jugadores en pista en cada anotación' : 'inferioridad o ausencia de quinteto: no se exige 5 × margen');
  }
  // Posesiones: inicio y cierre únicos, sin atravesar periodos
  const posBad = a.possessions.filter((x) => x.endSeq == null || x.startSeq > x.endSeq || !x.endKind);
  add('POS01', 'Posesiones', 'toda posesión con ataque activo tiene inicio, cierre y causa', 0, posBad.length, posBad.length === 0, posBad.map((x) => x.id));
  const crossing = a.possessions.filter((x) => { const evs = events.filter((e) => e.possessionId === x.id && ['attempt', 'foul', 'free_throw', 'rebound', 'loose_ball'].includes(e.type)); return new Set(evs.map((e) => e.period)).size > 1; });
  add('POS02', 'Posesiones', 'ninguna posesión atraviesa un periodo', 0, crossing.length, crossing.length === 0, crossing.map((x) => x.id));
  const dup = a.possessions.length - new Set(a.possessions.map((x) => x.id)).size;
  add('POS03', 'Posesiones', 'identificadores de posesión únicos', 0, dup, dup === 0, []);
  // F: origen único, puntos sin duplicar
  const fShots = a.finals.map((f) => f.event); const fDup = fShots.length - new Set(fShots).size;
  add('F01', 'Finalizaciones', 'cada F tiene un origen único (un hecho de tiro)', 0, fDup, fDup === 0, []);
  const fPoints = a.finals.reduce((s, f) => s + f.points, 0); const linkedPoints = a.partition.byOrigin.f;
  add('F02', 'Finalizaciones', 'puntos de las F = puntos ligados a F de la partición', linkedPoints, fPoints, fPoints === linkedPoints, []);
  const fOpen = a.finals.filter((f) => !f.closed);
  add('F03', 'Finalizaciones', res.status === 'finished' ? 'ninguna F abierta al terminar' : 'F abiertas se muestran como pendientes', res.status === 'finished' ? 0 : fOpen.length, fOpen.length, res.status === 'finished' ? fOpen.length === 0 : true, fOpen.map((f) => f.id));
  // Recursos: la petición no consume y nada es negativo
  const to = res.diagnostics?.timeouts;
  if (to) add('REC01', 'Recursos', 'tiempos muertos usados no negativos y igual a los hechos «timeout»', events.filter((e) => e.type === 'timeout').length, to.reduce((s, l) => s + Object.values(l.used).reduce((x, y) => x + y, 0), 0), to.every((l) => Object.values(l.used).every((v) => v >= 0)) && events.filter((e) => e.type === 'timeout').length === to.reduce((s, l) => s + Object.values(l.used).reduce((x, y) => x + y, 0), 0), []);
  // Terminación: resultado deportivo, administrativo y estado del acta diferenciados
  const adm = res.administrative ?? null;
  add('TERM01', 'Terminación', 'el resultado adjudicado, si existe, no se mezcla con el tanteo de cancha', true, adm ? !adm.awardedIsCourtScore : true, adm ? adm.awardedIsCourtScore === false : true, []);
  add('TERM02', 'Terminación', 'un encuentro con error de ejecución no presenta un acta definitiva', true, !(res.status === 'error' && a.status.definitive), !(res.status === 'error' && a.status.definitive), []);
  const failed = checks.filter((c) => !c.ok);
  return { version: RECONCILE_VERSION, ok: failed.length === 0, total: checks.length, failed: failed.map((c) => c.id), checks, valid: failed.length === 0 ? 'válida' : 'inválida' };
}

function missOf(ev) {
  if (ev.type === 'free_throw') return ev.stats.some((f) => f.k === 'ft' && !f.made);
  return ev.stats.some((f) => f.k === 'shot' && !f.made);
}
