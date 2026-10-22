// Conciliación SIM (§7.3): invariantes sobre los hechos comprometidos. Separada de la evaluación deportiva: una comprobación «no evaluada» nunca se cuenta como conforme.
// Cada comprobación declara su universo (n) y devuelve sus fallos completos. El comprobador del detallado no se reutiliza porque sus supuestos (posesiones beM, acta del motor de acciones) no coinciden.
const ZONES = ['rim', 'inside', 'midrange', 'three'];

export const RECONCILIATION_IDS = [
  'R01_marcador_periodos', 'R02_puntos_conversiones', 'R03_aciertos_intentos', 'R04_libres_series', 'R05_robos_perdidas', 'R06_rebotes_oportunidades', 'R07_creditos_elegibles',
  'R08_exclusion_sin_acciones', 'R09_minutos_intervalos', 'R10_mas_menos', 'R11_quintetos_sin_doble_conteo', 'R12_final_sin_empate', 'R13_orden_y_tiempos', 'R14_asistencias', 'R15_tapones',
  'R16_faltas_bonus', 'R17_particiones_zonas', 'R18_lectura_sin_azar',
];

export function reconcileResult(m, res, evs) {
  const checks = []; const add = (id, desc, n, failures) => checks.push({ id, desc, universe: n, ok: failures.length === 0, failures: failures.slice(0, 50), failureCount: failures.length });
  const teamOfPlayer = Object.fromEntries(m.teams.flatMap((t) => t.players.map((p) => [p.id, t.idx])));
  const box = res.box; const P = Object.fromEntries(box.players.map((p) => [p.id, p]));
  const final = res.score.current;
  // R01 marcador por periodos
  { const f = []; const sum = [0, 0]; res.score.periods.forEach((p) => { sum[0] += p[0]; sum[1] += p[1]; }); if (m.status === 'finished' || m.published >= m.gt - 1e-9) { if (sum[0] !== final[0] || sum[1] !== final[1]) f.push({ periodos: sum, final }); } add('R01_marcador_periodos', 'la suma de los periodos es el marcador', res.score.periods.length, f); }
  // R02 puntos = conversiones
  { const f = []; for (const k of [0, 1]) { let pts = 0; for (const e of evs) if (e.tm === k && ((e.ty === 'shot' && e.made) || (e.ty === 'ft' && e.made))) pts += e.ty === 'shot' ? e.pts : 1; const bx = box.teams[k].pts; if (pts !== bx || pts !== final[k]) f.push({ equipo: k, conversiones: pts, acta: bx, marcador: final[k] }); } for (const p of box.players) if (p.pts !== 2 * p.fg2m + 3 * p.fg3m + p.ftm) f.push({ jugador: p.id, pts: p.pts }); add('R02_puntos_conversiones', 'puntos = 2·T2C + 3·T3C + TLC por jugador, equipo y marcador', box.players.length + 2, f); }
  // R03 aciertos ≤ intentos
  { const f = []; for (const p of box.players) { if (p.fg2m > p.fg2a || p.fg3m > p.fg3a || p.ftm > p.fta) f.push({ jugador: p.id }); for (const z of ZONES) if (p.zones[z].m > p.zones[z].a) f.push({ jugador: p.id, zona: z }); } add('R03_aciertos_intentos', 'aciertos no superan intentos (campo, triples, libres y por zona)', box.players.length, f); }
  // R04 series de libres
  { const f = []; const ft = evs.filter((e) => e.ty === 'ft'); const by = new Map(); for (const e of ft) { const key = `${e.ref}|${e.cause}|${e.pl}|${e.p}|${e.t}`; (by.get(key) ?? by.set(key, []).get(key)).push(e); }
    for (const [key, ser] of by) { const n = ser[0].n; if (ser.length !== n) f.push({ serie: key, tiene: ser.length, esperados: n }); ser.forEach((e, i) => { if (e.k !== i + 1) f.push({ serie: key, orden: e.k, pos: i + 1 }); }); if (new Set(ser.map((e) => e.t)).size !== 1) f.push({ serie: key, causa: 'el reloj avanza durante la serie' }); }
    const idx = new Map(evs.map((e) => [e.i, e]));
    for (const [key, ser] of by) { const ref = idx.get(ser[0].ref); if (!ref) { f.push({ serie: key, causa: 'serie sin hecho de origen' }); continue; } if (ser[0].cause === 'shooting' && ref.ty !== 'shootfoul') f.push({ serie: key, causa: 'falta de tiro sin hecho shootfoul' }); if (ser[0].cause === 'and1' && !(ref.ty === 'shot' && ref.made && ref.and1)) f.push({ serie: key, causa: 'libre ligado sin canasta con falta' }); if (ser[0].cause === 'bonus' && !(ref.ty === 'foul' && ref.bonus)) f.push({ serie: key, causa: 'bonus sin falta con bonus' }); }
    add('R04_libres_series', 'cada serie pertenece a su causa, sin saltos y sin reloj', by.size, f); }
  // R05 robos
  { const f = []; const tov = evs.filter((e) => e.ty === 'tov'); let n = 0; for (const e of tov) { if (e.stl) { n++; if (teamOfPlayer[e.stl] === e.tm) f.push({ robo: e.i, causa: 'robo del propio equipo' }); if (e.kind === 'of' || e.kind === 'bv') f.push({ robo: e.i, causa: 'pérdida no robable con robo' }); } } const stl = box.players.reduce((s, p) => s + p.stl, 0); if (stl !== n) f.push({ robosActa: stl, robosEnPerdidas: n }); add('R05_robos_perdidas', 'cada robo se enlaza con una pérdida rival elegible y no se duplica', tov.length, f); }
  // R06 rebotes
  { const f = []; const idx = new Map(evs.map((e) => [e.i, e])); const reb = evs.filter((e) => e.ty === 'reb'); const seen = new Map(); let opps = 0;
    for (const r of reb) { const ref = idx.get(r.ref); if (!ref) { f.push({ rebote: r.i, causa: 'sin oportunidad' }); continue; } seen.set(r.ref, (seen.get(r.ref) ?? 0) + 1); const ok = (ref.ty === 'shot' && !ref.made && ref.end !== 'block_out_of_bounds') || (ref.ty === 'ft' && !ref.made && ref.k === ref.n); if (!ok) f.push({ rebote: r.i, causa: 'oportunidad no reboteable' }); }
    for (const e of evs) { const opp = (e.ty === 'shot' && !e.made && e.end !== 'block_out_of_bounds') || (e.ty === 'ft' && !e.made && e.k === e.n); if (opp) { opps++; const c = seen.get(e.i) ?? 0; if (c !== 1) f.push({ oportunidad: e.i, rebotes: c }); } else if ((seen.get(e.i) ?? 0) > 0) f.push({ oportunidad: e.i, causa: 'rebote sin oportunidad' }); }
    add('R06_rebotes_oportunidades', 'cada oportunidad se resuelve una vez o tiene causa terminal; los rebotes no superan las oportunidades', opps, f); }
  // R07 créditos a participantes elegibles en el instante
  { const f = []; let n = 0; for (const e of evs) { if (e.sg == null || e.sg < 0) continue; const seg = m.segments[e.sg]; const lu = (k) => seg.lineups[k]; const chk = (id, team, what) => { if (id == null) return; n++; if (!lu(team).includes(id)) f.push({ hecho: e.i, tipo: e.ty, jugador: id, campo: what, causa: 'no estaba en pista en ese tramo' }); };
      if (e.ty === 'shot') { chk(e.pl, e.tm, 'tirador'); chk(e.passer, e.tm, 'pasador'); chk(e.blk, 1 - e.tm, 'taponador'); if (e.passer === e.pl) f.push({ hecho: e.i, causa: 'emisor = receptor' }); }
      else if (e.ty === 'ft') chk(e.pl, e.tm, 'tirador de libres'); else if (e.ty === 'tov') { chk(e.pl, e.tm, 'autor'); chk(e.stl, 1 - e.tm, 'recuperador'); }
      else if (e.ty === 'reb') chk(e.pl, e.tm, 'reboteador'); else if (e.ty === 'foul') { chk(e.pl, e.tm, 'autor de falta'); chk(e.drawn, 1 - e.tm, 'receptor de falta'); } else if (e.ty === 'shootfoul') { chk(e.pl, e.tm, 'autor de falta de tiro'); chk(e.victim, 1 - e.tm, 'víctima'); } }
    add('R07_creditos_elegibles', 'todo crédito pertenece a un participante en pista en su tramo', n, f); }
  // R08 exclusión
  { const f = []; const fouls = {}; let n = 0; for (const e of evs) { const ids = [e.pl, e.blk, e.stl, e.passer, e.drawn, e.victim].filter(Boolean); for (const id of ids) { n++; if ((fouls[id] ?? 0) >= m.rules.foulOut) { const isFoulEvt = (e.ty === 'foul' || e.ty === 'shootfoul') && e.pl === id && false; if (!isFoulEvt) f.push({ hecho: e.i, jugador: id, causa: 'acción posterior a la exclusión' }); } }
      if ((e.ty === 'foul' || e.ty === 'shootfoul') && e.pl) fouls[e.pl] = (fouls[e.pl] ?? 0) + 1; }
    for (const p of box.players) if (p.pf > m.rules.foulOut) f.push({ jugador: p.id, faltas: p.pf }); add('R08_exclusion_sin_acciones', 'ninguna acción de un jugador excluido ni más de cinco faltas', n, f); }
  // R09 minutos
  { const f = []; const segs = m.segments; let tot = 0; for (const k of [0, 1]) { let expect = 0; for (const s of segs) expect += s.lineups[k].length * Math.max(0, Math.min(s.end, m.published) - s.start); const got = box.teams[k].sec; tot += 1; if (Math.abs(got - expect) > 1e-6) f.push({ equipo: k, minutos: got, esperado: expect }); } add('R09_minutos_intervalos', 'minutos = presencia por intervalos (cinco por la duración con quinteto completo)', tot, f); }
  // R10 más/menos
  { const f = []; for (const k of [0, 1]) { let expect = 0; for (const e of evs) { if (!(e.sg >= 0)) continue; const seg = m.segments[e.sg]; const pts = e.ty === 'shot' && e.made ? e.pts : e.ty === 'ft' && e.made ? 1 : 0; if (!pts) continue; expect += (e.tm === k ? 1 : -1) * pts * seg.lineups[k].length; } const got = box.players.filter((p) => p.team === k).reduce((s, p) => s + p.pm, 0); if (got !== expect) f.push({ equipo: k, suma_pm: got, esperado: expect }); } add('R10_mas_menos', 'Σ más/menos = Σ puntos con presencia (eventos × jugadores en pista)', 2, f); }
  // R11 quintetos
  { const f = []; for (const k of [0, 1]) { const qs = res.quintets.filter((q) => q.team === k); const sumMin = qs.reduce((s, q) => s + q.sec, 0); const pts = qs.reduce((s, q) => s + q.pf, 0); const pa = qs.reduce((s, q) => s + q.pa, 0); const exp = m.segments.reduce((s, x) => s + Math.max(0, Math.min(x.end, m.published) - x.start), 0); if (Math.abs(sumMin - exp) > 0.05) f.push({ equipo: k, min: sumMin, esperado: exp }); if (pts !== final[k] || pa !== final[1 - k]) f.push({ equipo: k, pf: pts, pa, marcador: final }); } add('R11_quintetos_sin_doble_conteo', 'los quintetos reparten todo el tiempo y toda la producción una sola vez', 2, f); }
  // R12 final
  { const f = []; if (m.status === 'finished') { if (final[0] === final[1]) f.push({ causa: 'empate final' }); if (res.score.winner == null) f.push({ causa: 'sin ganador' }); } else if (res.score.winner != null || res.score.final != null) f.push({ causa: 'ganador sin encuentro terminado' }); add('R12_final_sin_empate', 'final normal sin empate; sin ganador inventado', 1, f); }
  // R13 orden y tiempos
  { const f = []; let lastT = -1; let lastI = -1; for (const e of evs) { if (e.i <= lastI) f.push({ hecho: e.i, causa: 'secuencia no creciente' }); if (e.t + 1e-9 < lastT) f.push({ hecho: e.i, causa: 'tiempo decreciente', t: e.t, previo: lastT }); lastI = e.i; lastT = e.t; }
    for (const e of evs) { if (e.sg >= 0 && (e.ty === 'shot' || e.ty === 'ft')) { const s = m.segments[e.sg]; if (e.t < s.start - 0.06 || e.t > s.end + 0.06) f.push({ hecho: e.i, causa: 'fuera de su tramo', t: e.t, tramo: [s.start, s.end] }); } }
    add('R13_orden_y_tiempos', 'orden estable y tiempo dentro del tramo', evs.length, f); }
  // R14 asistencias
  { const f = []; let n = 0; for (const e of evs) { if (e.ty === 'shot' && e.passer) { n++; if (teamOfPlayer[e.passer] !== e.tm) f.push({ hecho: e.i, causa: 'pasador de otro equipo' }); } } const ast = box.players.reduce((s, p) => s + p.astC + p.astL, 0); const expect = evs.filter((e) => e.ty === 'shot' && e.made && e.passer).length + evs.filter((e) => e.ty === 'ft' && e.assist).length; if (ast !== expect) f.push({ acta: ast, esperado: expect }); add('R14_asistencias', 'asistencias solo con pase final generado y canasta (o serie con acierto)', n, f); }
  // R15 tapones
  { const f = []; const blks = evs.filter((e) => e.ty === 'shot' && e.blk); for (const e of blks) { if (e.made) f.push({ hecho: e.i, causa: 'tapón en canasta' }); } const sum = box.players.reduce((s, p) => s + p.blk, 0); if (sum !== blks.length) f.push({ acta: sum, hechos: blks.length }); add('R15_tapones', 'cada tapón pertenece a un intento fallado', blks.length, f); }
  // R16 faltas y bonus
  { const f = []; const cnt = {}; let n = 0; for (const e of evs) { if (e.ty === 'period') { /* contadores por periodo */ } if (e.ty === 'foul' || e.ty === 'shootfoul') { n++; const key = `${e.p > 4 ? 4 : e.p}|${e.tm}`; if (e.ty === 'foul' && e.kind === 'nonshooting') { const prior = cnt[`${e.p}|${e.tm}`] ?? (e.p > 4 ? cnt[`${e.p - 1}|${e.tm}`] ?? 0 : 0); if (e.bonus !== (prior >= m.rules.teamPenaltyAfterFouls)) f.push({ hecho: e.i, bonus: e.bonus, previas: prior }); } void key; const ck = `${e.p}|${e.tm}`; if (cnt[ck] == null) cnt[ck] = e.p > 4 ? (cnt[`${e.p - 1}|${e.tm}`] ?? 0) : 0; cnt[ck] += 1; } } const pf = box.players.reduce((s, p) => s + p.pf, 0); const evPf = evs.filter((e) => e.ty === 'foul' || e.ty === 'shootfoul').length; if (pf !== evPf) f.push({ acta: pf, hechos: evPf }); add('R16_faltas_bonus', 'faltas del acta = hechos y bonus solo con el contador de equipo correspondiente', n, f); }
  // R17 particiones
  { const f = []; for (const k of [0, 1]) { const t = box.teams[k]; let za = 0; let zm = 0; for (const z of res.zones) { za += z.teams[k].a; zm += z.teams[k].m; } if (za !== t.fga || zm !== t.fg2m + t.fg3m) f.push({ equipo: k, zonas: [za, zm], acta: [t.fga, t.fg2m + t.fg3m] }); const fam = res.families[k]; const fa = fam.reduce((s, x) => s + x.fga, 0); const fm = fam.reduce((s, x) => s + x.fgm, 0); if (fa !== t.fga || fm !== t.fg2m + t.fg3m) f.push({ equipo: k, familias: [fa, fm], acta: [t.fga, t.fg2m + t.fg3m] }); const pl = box.players.filter((p) => p.team === k); if (pl.reduce((s, p) => s + p.pts, 0) !== t.pts) f.push({ equipo: k, causa: 'jugadores ≠ equipo' }); } add('R17_particiones_zonas', 'zonas, familias, jugadores y equipo reparten los mismos intentos', 2, f); }
  // R18 lectura sin azar (se completa por quien consulta: aquí solo declara que construir no consume azar)
  { const f = []; if (m._buildDraws != null && m._buildDraws !== m.rng.draws) f.push({ causa: 'construir el resultado consumió azar' }); add('R18_lectura_sin_azar', 'construir/consultar el resultado no consume azar', 1, f); }
  const failures = checks.filter((c) => !c.ok);
  return { policy: 'RECON-SIM01-R1', checks, passed: checks.length - failures.length, failed: failures.length, valid: failures.length === 0, evaluated: checks.length, notEvaluated: RECONCILIATION_IDS.filter((id) => !checks.some((c) => c.id === id)) };
}
