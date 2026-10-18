// MOTOR-15B §7: diagnóstico técnico de la cadena que produce y acredita los robos. NO simula: lee los resultados de los casos C15 de MOTOR-15 (antes) y su reejecución con MOTOR-15B (después,
// `scripts/m15-integration.js --out=out/motor15b`). Demuestra con los propios hechos que la corrección de crédito es solo estadística (los hechos deportivos son idénticos salvo el crédito añadido) y publica
// contadores por caso/equipo/ruta con numerador, denominador, universo y cobertura. Una magnitud no registrada es NULA, nunca cero.
// Uso: node scripts/m15b-robos.js [--before=out/motor15/integracion] [--after=out/motor15b/integracion] [--out=out/motor15b/robos]
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const BEFORE = arg('before', 'out/motor15/integracion'); const AFTER = arg('after', 'out/motor15b/integracion'); const OUT = arg('out', 'out/motor15b/robos'); mkdirSync(OUT, { recursive: true });
const CASES = ['C15-01', 'C15-02', 'C15-03', 'C15-04', 'C15-05', 'C15-06'];
const load = (dir, id) => JSON.parse(readFileSync(join(dir, `${id}-resultado.json`), 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));

// Rutas (nombres físicos del motor): A organizada = actions.resolveTurnover tras flow.resolveAttempt (pase o bote con interceptor; decisión `decideSteal`, referencia stealAttemptGivenAccessP0);
// B avance presionado = defense-actions.pressedAdvance (decisión propia 'avance:intento_de_robo'); C envío forzado de saque = throwin (las tres opciones negadas; decisión `decideSteal` y misma resolveTurnover);
// D balón suelto = actions.resolveLooseBall (disputa real TAR17, sin decisión previa de intervenir).
const routeOf = (e) => (e.type === 'loose_ball' ? 'D_balon_suelto' : e.type === 'advance' && e.intent?.origen === 'avance presionado' ? 'B_avance_presionado' : e.type === 'attempt' && e.intent?.negadas != null ? 'C_envio_forzado_de_saque' : e.type === 'attempt' ? 'A_interaccion_organizada' : null);
const KEYS = ['decisiones', 'intentos', 'perdidas_atacantes', 'perdidas_vivas_recuperadas_sin_credito', 'balon_fuera', 'robos_acreditados', 'otras_perdidas_sin_robo_posible', 'disputas_de_balon_suelto', 'disputas_ganadas_por_defensa'];
function stats(res) {
  const out = {}; const get = (team, route) => ((out[`${team}|${route}`] ??= Object.fromEntries(KEYS.map((k) => [k, 0]))));
  for (const e of res.events) {
    const route = routeOf(e); if (!route) continue; const att = e.team; const def = 1 - att; const R = get(def, route);
    for (const c of e.calc ?? []) { if (c.label === 'binaria:defensa:robo' || c.label === 'binaria:avance:intento_de_robo') { R.decisiones += 1; if (c.resultado) R.intentos += 1; } }
    const tov = e.stats.filter((s) => s.k === 'tov'); const stl = e.stats.filter((s) => s.k === 'stl');
    if (route === 'D_balon_suelto') { if (e.effects?.control) { R.disputas_de_balon_suelto += 1; if (e.effects.control === 'defensa') R.disputas_ganadas_por_defensa += 1; } }
    if (e.effects?.perdida) { R.perdidas_atacantes += 1; if (stl.length) R.robos_acreditados += stl.length; else if (e.effects.fuera) R.balon_fuera += 1; else if (e.effects.balonVivo) R.perdidas_vivas_recuperadas_sin_credito += 1; }
    else if (route === 'D_balon_suelto') { if (tov.length) { R.perdidas_atacantes += 1; R.robos_acreditados += stl.length; } }
    else if (tov.length) R.otras_perdidas_sin_robo_posible += 1;
  }
  return out;
}
// Prueba de que la corrección es solo de crédito: tras quitar el crédito añadido, cada hecho posterior es idéntico al de MOTOR-15 (incluidos sorteos y marcador).
function equivalence(before, after) {
  const added = []; let differing = 0; const first = [];
  const a = clone(after.events).map((e) => { if (e.type === 'loose_ball') { const had = e.stats.filter((s) => s.k === 'stl' && s.fuente === 'balón suelto ganado en disputa'); if (had.length) { added.push({ event: e.id, recuperador: had[0].p, equipo: had[0].team, perdida: e.stats.find((s) => s.k === 'tov')?.p }); e.stats = e.stats.filter((s) => !had.includes(s)); delete e.effects.robo; } } return e; });
  const b = clone(before.events);
  if (a.length !== b.length) return { identical: false, reason: `número de hechos distinto (${b.length} → ${a.length})`, added };
  for (let i = 0; i < a.length; i++) if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) { differing += 1; if (first.length < 3) first.push({ event: b[i].id, before: JSON.stringify(b[i]).slice(0, 240), after: JSON.stringify(a[i]).slice(0, 240) }); }
  const sameScore = JSON.stringify(before.score) === JSON.stringify(after.score) && JSON.stringify(before.periodScores) === JSON.stringify(after.periodScores);
  const sameDraws = before.diagnostics.sportingDraws === after.diagnostics.sportingDraws;
  return { identical: differing === 0 && sameScore && sameDraws, differingEvents: differing, events: b.length, sameScore, sameDraws, draws: [before.diagnostics.sportingDraws, after.diagnostics.sportingDraws], added, firstDifferences: first };
}
const rows = []; const proof = []; const casos = []; const sums = {};
for (const id of CASES) {
  const A = load(AFTER, id); const B = id === 'C15-06' ? null : load(BEFORE, id); // C15-06 de MOTOR-15 no aplicó su guion (defecto de la evidencia, corregido): no es comparable
  const sa = stats(A); const sb = B ? stats(B) : null;
  const stlTeam = (res, t) => res.events.flatMap((e) => e.stats).filter((s) => s.k === 'stl' && s.team === t).length;
  const tovTeam = (res, t) => res.events.flatMap((e) => e.stats).filter((s) => s.k === 'tov' && s.team === t).length;
  for (const t of [0, 1]) {
    const team = A.teams[t].id;
    rows.push({ source: `${id} (reejecución MOTOR-15B)`, case_id: id, team_id: team, route: 'TOTAL_EQUIPO', stage: 'robos_por_partido', numerator: stlTeam(A, t), denominator: 1, unit: 'robos por partido', coverage: 'acta completa del encuentro', before: sb ? stlTeam(B, t) : null, after: stlTeam(A, t), version: 'EST-MOTOR15B-R1', ref: `${AFTER}/${id}-resultado.json` });
    rows.push({ source: `${id} (reejecución MOTOR-15B)`, case_id: id, team_id: team, route: 'TOTAL_EQUIPO', stage: 'robos_sobre_perdidas_rivales', numerator: stlTeam(A, t), denominator: tovTeam(A, 1 - t), unit: 'robos / pérdidas del rival (todas: vivas, fuera, violaciones, faltas)', coverage: 'acta completa; universo mixto, no una partición', before: sb ? `${stlTeam(B, t)}/${tovTeam(B, 1 - t)}` : null, after: `${stlTeam(A, t)}/${tovTeam(A, 1 - t)}`, version: 'EST-MOTOR15B-R1', ref: `${AFTER}/${id}-resultado.json` });
    for (const route of ['A_interaccion_organizada', 'B_avance_presionado', 'C_envio_forzado_de_saque', 'D_balon_suelto']) {
      const ra = sa[`${t}|${route}`]; const rb = sb?.[`${t}|${route}`] ?? null; sums[route] ??= Object.fromEntries(KEYS.map((k) => [k, [0, 0]]));
      for (const k of KEYS) {
        const observable = !((route === 'D_balon_suelto' && ['decisiones', 'intentos', 'balon_fuera'].includes(k)) || (route !== 'D_balon_suelto' && ['disputas_de_balon_suelto', 'disputas_ganadas_por_defensa'].includes(k)));
        const v = observable ? (ra?.[k] ?? 0) : null; const vb = observable && rb ? (rb[k] ?? 0) : null;
        if (v != null) { sums[route][k][1] += v; if (vb != null) sums[route][k][0] += vb; }
        rows.push({ source: `${id} (reejecución MOTOR-15B)`, case_id: id, team_id: team, route, stage: k, numerator: v, denominator: null, unit: 'conteo (equipo defensor)', coverage: observable ? 'hechos con registro diagnóstico completo' : 'no aplica en esta ruta (sin decisión previa o sin pérdida de balón fuera)', before: vb, after: v, version: 'EST-MOTOR15B-R1', ref: `${AFTER}/${id}-resultado.json` });
      }
    }
  }
  if (B) proof.push({ case_id: id, ...equivalence(B, A) });
  // casos y hechos que sustentan cada afirmación (positivos, exclusiones y defectos)
  const typ = (res, e) => ({ pérdida: e.stats.find((s) => s.k === 'tov') ?? null, robo: e.stats.find((s) => s.k === 'stl') ?? null });
  const origin = id === 'C15-06' ? 'natural (guion de órdenes aplicado, nueva ejecución)' : 'natural (reejecución MOTOR-15B de un caso de MOTOR-15)';
  for (const e of A.events) {
    const route = routeOf(e); if (!route) continue; const x = typ(A, e); const eff = e.effects ?? {};
    if (e.type === 'loose_ball' && eff.control === 'defensa') casos.push({ case_id: id, event_id: e.id, kind: 'positivo (corregido en 15B)', route, loss: x.pérdida?.p, loss_cause: x.pérdida?.cause, touch_or_intervention: 'disputa real de balón suelto TAR17 ganada por el defensor', recoverer: eff.recupera, credited_to: x.robo?.p ?? null, ball_state: 'vivo', reason: 'recuperación real de balón suelto tras error atacante; sin intento previo de arrebato', linked_facts: e.id, provenance: origin, antes: 'sin crédito (defecto de omisión)', despues: 'robo al recuperador' });
    else if (e.type === 'loose_ball' && eff.control === 'ataque') casos.push({ case_id: id, event_id: e.id, kind: 'exclusión', route, loss: null, loss_cause: null, touch_or_intervention: 'disputa real de balón suelto ganada por el ataque', recoverer: e.participants.disputa?.[0], credited_to: null, ball_state: 'vivo', reason: 'el ataque conserva el balón: no hay pérdida ni robo', linked_facts: e.id, provenance: origin, antes: 'sin crédito', despues: 'sin crédito' });
    else if (eff.perdida && x.robo) casos.push({ case_id: id, event_id: e.id, kind: 'positivo', route, loss: x.pérdida?.p, loss_cause: x.pérdida?.cause, touch_or_intervention: 'interceptación/arrebato resueltos (decisión de intervenir + control)', recoverer: eff.robo, credited_to: x.robo.p, ball_state: 'vivo', reason: 'robo: decisión de intervenir y control del balón', linked_facts: e.id, provenance: origin, antes: 'robo', despues: 'robo (sin cambio)' });
    else if (eff.perdida && eff.fuera) casos.push({ case_id: id, event_id: e.id, kind: 'exclusión', route, loss: x.pérdida?.p, loss_cause: x.pérdida?.cause, touch_or_intervention: null, recoverer: null, credited_to: null, ball_state: 'muerto (fuera)', reason: 'balón fuera: no se acredita robo', linked_facts: e.id, provenance: origin, antes: 'sin crédito', despues: 'sin crédito' });
    else if (eff.perdida && eff.balonVivo) casos.push({ case_id: id, event_id: e.id, kind: 'límite documentado (no corregido)', route, loss: x.pérdida?.p, loss_cause: x.pérdida?.cause, touch_or_intervention: 'no representado: el motor no conserva el toque defensivo', recoverer: eff.recupera, credited_to: null, ball_state: 'vivo', reason: 'pérdida viva recuperada por la defensa sin robo: el motor solo conserva el toque a través de la decisión de intervenir y del control (stealGivenTurnover); acreditar toda recuperación sería una decisión de producto (MOTOR-16/17)', linked_facts: e.id, provenance: origin, antes: 'sin crédito', despues: 'sin crédito' });
  }
}
// decisiones por interacción abandonada (hallazgo): la ficha negada se abandona tras decidir su intervención y el recurso sencillo decide otra vez; el denominador correcto cuenta una decisión por interacción RESUELTA
const dupDecisions = []; for (const id of CASES) { const A = load(AFTER, id); for (const e of A.events) { const n = (e.calc ?? []).filter((c) => c.label === 'binaria:defensa:robo').length; if (n > 1) dupDecisions.push({ case_id: id, event_id: e.id, decisiones: n, origen: e.intent?.origen }); } }
const summary = { generated_by: 'node scripts/m15b-robos.js', before: BEFORE, after: AFTER, notas: ['Las cifras «antes» son los resultados de MOTOR-15 (0.15.0); «después» la reejecución con MOTOR-15B (0.15.1) de las mismas entradas.', 'C15-06 de MOTOR-15 no aplicó su guion de órdenes (el generador leía `.result` en lugar de `.res`); su reejecución con el guion aplicado es una NUEVA ejecución y no tiene «antes» comparable.', 'Las muestras son 6 encuentros: señal diagnóstica, no una frecuencia ni un objetivo.'],
  proof, rows, casos, sums, decisionesRepetidas: { n: dupDecisions.length, ejemplos: dupDecisions.slice(0, 12), nota: 'en estos hechos hay dos decisiones `defensa:robo`: la primera pertenece a una interacción de ficha abandonada por «sistema negado» y la segunda al recurso sencillo que sí se resuelve; cada interacción decide una vez y la decisión abandonada no tiene consumidor sobre el crédito' } };
writeFileSync(join(OUT, 'diagnostico.json'), JSON.stringify(summary, null, 1));
const tot = (res, t, k) => res.events.flatMap((e) => e.stats).filter((s) => s.k === k && s.team === t).length;
console.log(JSON.stringify({ proof: proof.map((p) => [p.case_id, p.identical, p.differingEvents, p.added.length]), sums: Object.fromEntries(Object.entries(sums).map(([r, v]) => [r, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.join('→')]))])), casos: casos.length, dup: dupDecisions.length, stlBefore: CASES.slice(0, 5).map((id) => [0, 1].map((t) => tot(load(BEFORE, id), t, 'stl'))), stlAfter: CASES.map((id) => [0, 1].map((t) => tot(load(AFTER, id), t, 'stl'))) }, null, 0));
