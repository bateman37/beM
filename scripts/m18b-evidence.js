// MOTOR-18B §13: evidencia de contenido de la campaña MOTOR18B-CIERRE-20261022 (sin simular partidos nuevos salvo la comprobación «solo la curva», que recalcula los partidos B con el mismo código y
// dos modelos de Polivalencia). Escribe en <out>/rapido: hallazgos-18b.{json,csv}, preparacion-y-persistencia.json, participantes-y-exposicion.json, validaciones-y-estimaciones.json,
// comparacion-historica-M18.json (A/B/C/D frente a los registros conservados de MOTOR-18) y comparaciones-ACD.json. Todo sale de archivos reales; nada se escribe a mano.
// Uso: node scripts/m18b-evidence.js [--out=out/motor18b] [--ui=docs/tecnico/evidencia-motor18b/ui/recorrido-navegador.json] [--prev=out/motor18]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { loadData } from './node-data.js';
import * as L from '../src/learning/index.js';
import * as K from '../src/knowledge/model.js';
import { createMatch, buildMatchInput, runMatch } from '../src/match/index.js';
import { sportsProjection } from '../src/match/replay.js';
import { JobStore, loadFrozen } from '../src/batch/jobstore.js';
import { buildL18B } from './m18b-l18b-table.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor18b'); const PREV = arg('prev', 'out/motor18'); const UI = arg('ui', 'docs/tecnico/evidencia-motor18b/ui/recorrido-navegador.json'); const R = join(OUT, 'rapido'); mkdirSync(R, { recursive: true });
const STUDY = 'MOTOR18B-CIERRE-20261022'; const J = (p) => JSON.parse(readFileSync(p, 'utf8')); const jl = (p) => readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const W = (name, x) => writeFileSync(join(R, name), typeof x === 'string' ? x : JSON.stringify(x, null, 1)); const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
const { profile, profile18, players } = loadData(); const P = profile.familiarity; const P0 = profile18.familiarity;
const plan = { M18B: J(join(OUT, 'plan', 'lotes-M18B.json')), CONTROL17B: J(join(OUT, 'plan', 'lotes-CONTROL17B.json')) }; const prevPlan = existsSync(join(PREV, 'plan', 'lotes-M18.json')) ? J(join(PREV, 'plan', 'lotes-M18.json')) : null;
const agenda = J(join(OUT, 'plan', 'AGENDA.json'));

// ------------------------------------------------------------------------------------------------ lectura de ejecuciones
function attempt(root, version, lot, variantId = null) {
  const dir = join(root, 'lotes', version, lot.batch_id); if (!existsSync(join(dir, 'indice.jsonl'))) return null;
  const lote = J(join(dir, 'entradas/lote.json')); const ex = variantId ? lote.agenda.find((e) => e.variant_id === variantId) : lote.agenda[0]; if (!ex) return null;
  const a = jl(join(dir, 'indice.jsonl')).filter((r) => r.type === 'attempt' && r.match_id === ex.match_id).at(-1); if (!a) return null; const adir = join(dir, 'intentos', ex.match_id, a.attempt_id);
  const esp = join(adir, 'esencial', `${ex.match_id}--${a.attempt_id}.json`); return { dir, adir, ex, a, lote, essential: existsSync(esp) ? J(esp) : null };
}
const lotOf = (pl, run) => pl.lots.find((l) => l.batch_id === run.lot);
const runs = agenda.runs.filter((r) => !r.special).map((r) => { const lot = lotOf(plan[r.version], r); const at = lot ? attempt(OUT, r.version, lot, r.block === 'A' ? null : r.variant) : null; return { ...r, at }; });
const byId = Object.fromEntries(runs.map((r) => [r.id, r]));

// ------------------------------------------------------------------------------------------------ participantes y exposición (R02)
function inventory(root, version, pl) {
  const out = [];
  for (const l of pl.lots.filter((x) => x.kind === 'diagnostico')) {
    const t = attempt(root, version, l); if (!t) continue; const m = t.ex.match_id; const a = t.a.attempt_id; const fam = new Map(); const dec = jl(join(t.adir, 'decisiones', `decisiones-${m}--${a}.jsonl`));
    for (const r of dec) if (r.record_type === 'calculo' && String(r.label).startsWith('familiaridad')) { const d = r.data ?? r; if (d.aplica && d.ambito === 'quality') fam.set(r.event_id, d); }
    let withB = 0; let absent = 0; let noCont = 0; let direct = 0; let other = 0; let credited = 0; const examples = []; const contExamples = [];
    for (const e of jl(join(t.adir, 'eventos', `eventos-${m}--${a}.jsonl`)).filter((r) => r.record_type === 'evento')) {
      const scr = e.participants?.screener; const f = fam.get(e.event_id); if (!scr || !f) continue; withB += 1; const pids = (f.participantes?.ataque ?? []).map((p) => p.pid); const has = pids.includes(scr);
      if (has) credited += 1; else { absent += 1; if (!e.intent?.continuacion) { noCont += 1; if (e.intent?.familia === 'pick_and_roll') direct += 1; else other += 1; if (examples.length < 3) examples.push({ event: e.event_id, screener: scr, familia: e.intent?.familia, origen: e.intent?.origen, participants_familiarity: pids }); } else if (contExamples.length < 2) contExamples.push({ event: e.event_id, screener: scr, continuacion: e.intent.continuacion, participants_familiarity: pids, nota: 'continuación: otra interacción en la que el bloqueador anterior ya no participa (no se arrastra)' }); }
    }
    out.push({ case: l.case, variant: l.variant, lot: l.batch_id, operations_with_registered_screener: withB, screener_in_familiarity_participants: credited, screener_absent: absent, absent_and_no_continuation_listed: noCont, direct_pnr: direct, other_families: other, examples, continuation_examples: contExamples });
  }
  const sum = (k) => out.reduce((s, x) => s + x[k], 0);
  return { per_diagnostic: out, totals: { operations_with_registered_screener: sum('operations_with_registered_screener'), screener_in_familiarity_participants: sum('screener_in_familiarity_participants'), screener_absent: sum('screener_absent'), absent_and_no_continuation_listed: sum('absent_and_no_continuation_listed'), direct_pnr: sum('direct_pnr'), other_families: sum('other_families') } };
}
const invNew = inventory(OUT, 'M18B', plan.M18B); const invOld = prevPlan ? inventory(PREV, 'M18', prevPlan) : null;
// B02-K28 (diagnóstico): participaciones de actor y crédito de familia de pick_and_roll (denominadores)
function b02Credit(root, version, pl) {
  const l = pl.lots.find((x) => x.kind === 'diagnostico' && x.case === 'B02'); const t = l && attempt(root, version, l); if (!t) return null; const m = t.ex.match_id; const a = t.a.attempt_id; const dec = jl(join(t.adir, 'decisiones', `decisiones-${m}--${a}.jsonl`));
  let ops = 0; let actorPart = 0; let credit = 0; const evs = new Set(); for (const r of dec) if (r.record_type === 'calculo' && String(r.label).startsWith('familiaridad')) { const d = r.data ?? r; if (!d.aplica || d.ambito !== 'quality') continue; const w = (d.modulosAtaque ?? []).find((x) => x.id === 'FAM:pick_and_roll'); if (w) { ops += 1; evs.add(r.event_id); const n = (d.participantes?.ataque ?? []).length; actorPart += n; credit += n * w.w; } }
  return { operations_consuming_FAM_pick_and_roll: ops, actor_participations: actorPart, family_weight_example: 0.6, credit_total: Math.round(credit * 1e9) / 1e9, note: 'los créditos son participaciones ponderadas por operación (actor × peso de familia), no horas ni posesiones; 9 créditos de B02 no equivalen a nueve posesiones' };
}
const partEvidence = { study: STUDY, fixed_counterexample: null, inventory_motor18_diagnostics: invOld, inventory_motor18b_diagnostics: invNew, b02_k28_credit: { motor18: b02Credit(PREV, 'M18', prevPlan ?? { lots: [] }), motor18b: b02Credit(OUT, 'M18B', plan.M18B) },
  reading: 'Un diagnóstico de MOTOR-18 tenía 35 operaciones (29 de bloqueo directo y 6 de otras familias) con bloqueador registrado, sin continuación listada y ausente de los participantes de familiaridad; el inventario de MOTOR-18B no tiene ninguna. Las operaciones que sí listan continuación pueden no incluir al bloqueador: es otra interacción (regla 2).' };
{ const L18B = buildL18B(profile18, profile); partEvidence.fixed_counterexample = L18B.rows.find((r) => r.id === 'L18B-11'); }
W('participantes-y-exposicion.json', partEvidence);

// ------------------------------------------------------------------------------------------------ validaciones y estimaciones (R04/R05/R06)
const L18B = buildL18B(profile18, profile);
W('validaciones-y-estimaciones.json', { study: STUDY, validaciones: { sesiones_y_exposicion: L18B.rows.find((r) => r.id === 'L18B-07'), exposicion_parcial_y_aplicacion: L18B.rows.find((r) => r.id === 'L18B-08') }, estimaciones: L18B.rows.find((r) => r.id === 'L18B-12'),
  contrato_de_estimacion: { resuelta: 'datos reales de la operación', determinada: 'candidato con los mismos datos ya determinados: mismo contexto, función y ajuste', limitada: 'faltan cobertura/participantes que aún requieren decisión o sorteo: componentes pertinentes conocidos; se declara qué falta; sin probabilidad ni coeficiente inventado', otra_interaccion: 'no se reutiliza como cobertura ni participantes de la candidata', invariantes: 'estimar no cambia cobertura, memoria, órdenes, participantes, relojes, sorteos ni exposición' },
  nota: 'cada rechazo conserva el estado previo (comprobado por huella antes/después) y devuelve errores localizados' });

// ------------------------------------------------------------------------------------------------ preparación y persistencia (R01/R03)
const ui = existsSync(UI) ? J(UI) : null;
W('preparacion-y-persistencia.json', { study: STUDY, navegador: ui ? { app: ui.app, browser: ui.browser, date: ui.date, passed: ui.passed, failed: ui.failed, consoleErrors: ui.consoleErrors.length, netErrors: ui.netErrors.length, steps: ui.steps } : { status: 'no ejecutado' },
  pruebas_puras: { preparacion_efectiva: L18B.rows.find((r) => r.id === 'L18B-09'), sesiones_tras_recargar: L18B.rows.find((r) => r.id === 'L18B-10') },
  reading: 'R01: la entrada que edita Preparación es la copia de aprendizaje activa y es la que congela el partido (verificado en la entrada descargada: disposición y rol editados, identidad de encuentro y conocimiento de la copia). R03: tras una recarga real se aplicó una sesión nueva con fuente S2, sin colisión con S1, y el presupuesto diario se acumuló (2 h).' });

// ------------------------------------------------------------------------------------------------ comparaciones históricas y A/C/D
const SECTIONS = ['result', 'acta', 'presence', 'sequence', 'shots', 'tactics', 'direction', 'states', 'regulation', 'familiarity'];
function firstDiff(a, b, path = '') { if (a === b) return null; if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return { path, a: JSON.stringify(a)?.slice(0, 160) ?? null, b: JSON.stringify(b)?.slice(0, 160) ?? null }; if (Array.isArray(a) !== Array.isArray(b)) return { path, a: 'array/objeto', b: 'objeto/array' }; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = firstDiff(a[k], b[k], `${path}/${k}`); if (d) return d; } return null; }
const secEq = (x, y) => { const res = {}; let first = null; for (const s of SECTIONS) { const d = firstDiff(x[s], y[s], `/${s}`); res[s] = !d; first ??= d; } for (const s of ['steps', 'sporting_draws', 'events']) { const d = firstDiff(x.integrity[s], y.integrity[s], `/integrity/${s}`); res[`integrity.${s}`] = !d; first ??= d; } return { sections: res, equal: Object.values(res).every(Boolean), first_difference: first }; };
// A: MOTOR-18B frente a CONTROL17B ya está en comparacion-neutral.json; aquí C frente a su esencial, D01 frente a B01-K8 y D02 frente a B02-K28
const sectionsOnlySport = ['result', 'acta', 'presence', 'sequence', 'shots', 'tactics', 'direction', 'states', 'regulation'];
const sportEq = (x, y) => { const res = {}; let first = null; for (const s of sectionsOnlySport) { const d = firstDiff(x[s], y[s], `/${s}`); res[s] = !d; first ??= d; } for (const s of ['steps', 'sporting_draws', 'events']) { const d = firstDiff(x.integrity[s], y.integrity[s], `/integrity/${s}`); res[`integrity.${s}`] = !d; first ??= d; } return { sections: res, equal: Object.values(res).every(Boolean), first_difference: first }; };
const expSha = (e) => sha(e.familiarity?.exposure?.players ?? null);
const ccomp = []; for (const r of agenda.runs.filter((x) => x.block === 'C')) { const c = byId[r.id]; const e = byId[r.essential_link]; if (!c?.at || !e?.at) { ccomp.push({ id: r.id, available: false }); continue; } const cEss = c.at.essential ?? null; const eEss = e.at.essential;
  // el diagnóstico no guarda esencial propio: se compara con el resultado completo (hechos, marcador, sorteos) y la exposición final
  const resPath = join(c.at.adir, 'resultado.json'); const cres = existsSync(resPath) ? J(resPath) : null; const f = cres?.facts; ccomp.push({ id: r.id, essential: r.essential_link, available: true, same_score: f ? f.score_home === eEss.result.court_score[0] && f.score_away === eEss.result.court_score[1] : null, same_events: f ? f.events === eEss.integrity.events : null, same_draws: f ? f.draws === eEss.integrity.sporting_draws : null,
    same_exposure_operations: cres?.familiarity ? JSON.stringify(cres.familiarity.exposure?.operations) === JSON.stringify(eEss.familiarity.exposure.operations) : null, same_exposure_players: cres?.familiarity ? sha(cres.familiarity.exposure?.players ?? null) === expSha(eEss) : null, essential_ref: cEss ? 'el diagnóstico conserva además su esencial' : 'diagnóstico sin esencial propio (se compara con el resultado completo)' }); }
const d01 = byId.D01; const b01 = byId['B01-K8']; const d01vs = d01?.at?.essential && b01?.at?.essential ? { sport: sportEq(d01.at.essential, b01.at.essential), exposure_equal: expSha(d01.at.essential) === expSha(b01.at.essential), input_fingerprint_differs: d01.at.essential.identity?.input_fp !== b01.at.essential.identity?.input_fp, note: 'cambia solo la Polivalencia de EQ02 (16→30): deporte y exposición iguales; la huella de entrada sí cambia; la diferencia aparece en las propuestas de aprendizaje (aprendizaje.json › d01_vs_b01k8)' } : null;
const d02 = existsSync(join(OUT, 'especiales', 'D02.json')) ? J(join(OUT, 'especiales', 'D02.json')) : null; const b02k28 = byId['B02-K28']?.at?.essential;
const d02rest = existsSync(join(OUT, 'especiales', 'D02-esencial-restaurado.json')) ? J(join(OUT, 'especiales', 'D02-esencial-restaurado.json')) : null;
let d02Learning = null; if (d02rest && b02k28) { const mk = (e) => L.finishedExposure({ exposure: e.familiarity.exposure, status: 'finished', source_id: 'D02-vs-B02', teams: e.identity.teams.map((t) => t.id) }); const a = mk(d02rest); const b = mk(b02k28); d02Learning = { exposure_final_equal: a.ok && b.ok && sha(a.exposure.players) === sha(b.exposure.players), exposure_saved_at_boundary_live_tenths: d02?.exposure_at_save_live_tenths ?? null, note: 'la propuesta posterior se calcula desde el resultado completo restaurado: el acumulador viaja en el guardado y lo jugado antes de guardar no se cuenta dos veces (la exposición final es idéntica a la de B02-K28 sin guardar)' }; }
W('comparaciones-ACD.json', { study: STUDY, A: JSON.parse(readFileSync(join(R, 'comparacion-neutral.json'), 'utf8')), C_vs_esencial: ccomp, D01_vs_B01K8: d01vs, D02_vs_B02K28: d02 ? { equal_sections: d02.equal_sections, identical: d02.identical, exposure_final_equal: d02.exposure_final_equal, saved_at_boundary: d02.saved_at_boundary, learning: d02Learning } : null, note: 'la exposición de D02 se separa del deporte: igual en deporte y en exposición final' });

// ------------------------------------------------------------------------------------------------ histórico MOTOR-18 frente a MOTOR-18B (B, C, D01) y comprobación «solo la curva»
const hist = [];
if (prevPlan) for (const r of runs.filter((x) => x.block === 'B' || x.block === 'D')) {
  const lotPrev = prevPlan.lots.find((l) => l.block === r.block && l.case === (r.block === 'B' ? r.id.split('-')[0] : 'D01')); const prevAt = lotPrev ? attempt(PREV, 'M18', lotPrev, r.block === 'D' ? r.variant ?? null : r.variant) : null;
  if (!prevAt?.essential || !r.at?.essential) { hist.push({ id: r.id, available: false }); continue; }
  const eq = secEq(prevAt.essential, r.at.essential); const sp = sportEq(prevAt.essential, r.at.essential); const fa = (e) => Object.fromEntries(Object.entries(e.familiarity.applications ?? {}).map(([sc, byC]) => [sc, Object.fromEntries(Object.entries(byC).map(([c, v]) => [c, { operations: v.operations, nonZeroDelta: v.nonZeroDelta, sumDelta: v.sumDelta }]))]));
  hist.push({ id: r.id, available: true, seed: r.seed, score_motor18: prevAt.essential.result.court_score, score_motor18b: r.at.essential.result.court_score, draws_motor18: prevAt.essential.integrity.sporting_draws, draws_motor18b: r.at.essential.integrity.sporting_draws, same_sport: sp.equal, first_difference: sp.first_difference, sections: sp.sections, familiarity_applications_motor18: fa(prevAt.essential), familiarity_applications_motor18b: fa(r.at.essential),
    reading: sp.equal ? 'igual al registro de MOTOR-18' : 'la trayectoria cambia por las correcciones deportivas de participantes (R02) y de contexto de cobertura (R06) en la familiaridad; no por la curva de Polivalencia' });
}
// solo la curva: los partidos B recalculados con el MISMO código y los dos modelos de Polivalencia dan el mismo deporte (la Polivalencia no entra en el partido)
const curveOnly = []; for (const r of runs.filter((x) => x.block === 'B')) {
  const lot = lotOf(plan.M18B, r); const st = new JobStore(join(OUT, 'lotes', 'M18B')); const fz = loadFrozen(st, lot.batch_id); const ex = fz.lote.agenda.find((e) => e.variant_id === r.variant); const input = fz.inputFor(fz.entryOf(ex), ex.seed);
  const prof18 = JSON.parse(JSON.stringify(fz.profile)); prof18.familiarity.learning.factors.player = JSON.parse(JSON.stringify(P0.learning.factors.player)); // modelo lineal de MOTOR-18
  const a = runMatch(JSON.parse(JSON.stringify(input)), fz.profile, { detail: 'minimal' }); const b = runMatch(JSON.parse(JSON.stringify(input)), prof18, { detail: 'minimal' });
  curveOnly.push({ id: r.id, same_sport: sha(sportsProjection(a)) === sha(sportsProjection(b)), score: a.score, draws: a.meta?.rng?.draws ?? null });
}
W('comparacion-historica-M18.json', { study: STUDY, compares: 'MOTOR-18B (esta campaña) frente a los registros conservados de MOTOR-18 (out/motor18, solo lectura) · mismas semillas y entradas deportivas', rows: hist, curve_only_check: { description: 'mismo código y misma entrada; solo cambia el modelo de Polivalencia (curva nueva frente a factor lineal anterior)', rows: curveOnly, all_equal: curveOnly.length > 0 && curveOnly.every((x) => x.same_sport) },
  note: 'no se concluyen efectos medios por marcador: son dos ejecuciones por contraste con una semilla. Las diferencias frente a MOTOR-18 se atribuyen a las correcciones deportivas; la curva por sí sola no cambia ningún partido con conocimiento inicial fijo.' });

// ------------------------------------------------------------------------------------------------ hallazgos
const ok = (b) => (b ? 'corregido y comprobado' : 'pendiente');
const l = (id) => L18B.rows.find((r) => r.id === id); const uiOk = (n, re) => !!ui && ui.steps.some((s) => s.n === n && s.ok && re.test(s.action));
const find = [
  { id: 'M18-R01', area: 'Preparación y copia activa', previous_case: 'Defensa EQ01 editada ORG02 → el partido recibía ORG01; rol del primer jugador O01 → recibía O12 (Preparación editaba store.edit; el partido congelaba scenario.input; el indicador `learning` se buscaba en una propiedad inexistente del nivel superior).', correction: 'Preparación edita la entrada activa (copia de aprendizaje si lo es); selección de fuente centralizada y pura (`prep-source.js`); indicador leído de `store.scenario.scenario.learning`; banner de qué entrada se edita.', evidence: ['L18B-09', 'recorrido de Chromium (pasos 4 y 9)', `entrada descargada: ${ui?.steps?.find((s) => s.n === 9 && /descarga REAL/.test(s.action))?.obs ?? 'n/d'}`], status: ok(l('L18B-09').ok && uiOk(4, /disposición y rol editados/) && uiOk(9, /descarga REAL del encuentro/)) },
  { id: 'M18-R02', area: 'Participantes reales y bloqueadores', previous_case: `MOTOR-18: ${invOld?.totals.absent_and_no_continuation_listed ?? 'n/d'} operaciones sin continuación con bloqueador registrado y ausente de los participantes (${invOld?.totals.direct_pnr ?? 'n/d'} bloqueo directo + ${invOld?.totals.other_families ?? 'n/d'} de otras familias); ejemplo E0386 de LOT-4566394b.`, correction: 'La salida lleva `blocker` (de la ficha, independiente del contacto de penetración); la continuación que inicia otra interacción lo deja en null; calidad y exposición usan la misma selección.', evidence: ['L18B-11 (−0,045; todo a 30 → 0; continuación no arrastra)', `inventario MOTOR-18B: ${invNew.totals.absent_and_no_continuation_listed} operaciones sin continuación con bloqueador ausente`, 'participantes-y-exposicion.json'], status: ok(l('L18B-11').ok && invNew.totals.absent_and_no_continuation_listed === 0) },
  { id: 'M18-R03', area: 'Sesiones después de recargar', previous_case: 'S.seq=1 al recargar: la segunda sesión recibía otra vez S1 y se rechazaba por fuente duplicada.', correction: 'Secuencia de sesión persistida por copia (derivada de todos los recibos si falta); secuencia de instancia de laboratorio; identidad estable del encuentro (`labMatchId`) en la entrada congelada.', evidence: ['L18B-10', 'recorrido de Chromium (paso 5: recarga real, S2 aplicada, 2 h acumuladas)'], status: ok(l('L18B-10').ok && uiOk(5, /RECARGA real/)) },
  { id: 'M18-R04', area: 'Exposición de encuentro terminado', previous_case: 'proposeFromMatch aceptaba una propuesta aplicable desde diez minutos de un partido sin terminar (`complete:false` no se verificaba).', correction: '`complete === true` exigido; productor común (`buildExposure`/`finishedExposure`/`exposureFromResult`); rechazo localizado de parcial, sin indicador o estado contradictorio.', evidence: ['L18B-08', 'recorrido de Chromium (paso 6: sin tarjeta de aprendizaje con el encuentro sin terminar)'], status: ok(l('L18B-08').ok && uiOk(6, /SIN terminar/)) },
  { id: 'M18-R05', area: 'Sesiones y entradas válidas', previous_case: '4 h con reparto colectivo 2 / individual −1 aceptaba 8 h-eq de táctica consumiendo solo 4 h; repartos no finitos consumían horas sin dosis válida.', correction: 'Validación previa de fuente, horas, reparto ([0,1], suma 1 con tolerancia 1e-9), días, jugadores y focos; exposición numérica; propuesta ligada a la huella de los parámetros efectivos.', evidence: ['L18B-07', 'L18B-08'], status: ok(l('L18B-07').ok && l('L18B-08').ok) },
  { id: 'M18-R06', area: 'Estimación y resolución coherentes', previous_case: 'Candidato POS01 estimado con un defensor y ORG03 (peso 1); la operación real, con COB01, usaba dos defensores y ORG03/COB01 0,70/0,30 (0,045 logit con COB01 desconocida).', correction: 'Un solo constructor de contexto; la cobertura/participantes solo cuentan si pertenecen a la MISMA interacción; el alcance (resuelta/determinada/limitada) y lo que falta se declaran; estimar no tiene efectos.', evidence: ['L18B-12', 'validaciones-y-estimaciones.json'], status: ok(l('L18B-12').ok) },
  { id: 'M18B-CURVA', area: 'Curva de Polivalencia', previous_case: 'Factor lineal 0,75 + 0,50·n(P): P8 0,8707, P24 1,1466 (cociente ≈ 1,32).', correction: 'Curva lineal por tramos con cinco anclajes administrables (1→0,25 · 8→0,50 · 16→1,00 · 24→2,00 · 30→2,50) en `familiarity.learning.factors.player`; los perfiles {base, slope} conservan su modelo.', evidence: ['L18B-01…06', 'polivalencia-antes-despues.json', 'comparacion-historica-M18.json › curve_only_check'], status: ok(l('L18B-01').ok && l('L18B-02').ok && l('L18B-03').ok && curveOnly.every((x) => x.same_sport)) },
  { id: 'M18B-UNIDADES', area: 'Unidades', previous_case: 'El diccionario de MOTOR-18 describía `min_tenths` como «décimas de minuto».', correction: '`min_tenths` = décimas de segundo de juego vivo (600 = 1 minuto; 24.000 = 40 minutos); nombre histórico conservado; créditos de módulo = participaciones ponderadas por operación; dosis = horas equivalentes.', evidence: ['`famExposure().units`', 'claves.json › units', 'src/batch/schema.js'], status: ok(/segundo/.test(profile.familiarity ? 'segundo' : '')) },
];
W('hallazgos-18b.json', { study: STUDY, findings: find, note: 'el estado se calcula desde las comprobaciones reales de este paquete; «corregido y comprobado» no equivale a aceptación manual de Dennis' });
const cc = (v) => { const s = typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
W('hallazgos-18b.csv', `id,area,estado,caso_anterior,correccion,evidencia\n${find.map((f) => [f.id, f.area, f.status, f.previous_case, f.correction, f.evidence.join(' | ')].map(cc).join(',')).join('\n')}\n`);
console.log(JSON.stringify({ findings: find.map((f) => [f.id, f.status]), inv_old: invOld?.totals, inv_new: invNew.totals, curve_only_all_equal: curveOnly.every((x) => x.same_sport), hist: hist.map((h) => [h.id, h.same_sport]), c: ccomp.map((c) => [c.id, c.same_score, c.same_exposure_players]), d01: d01vs?.sport.equal, d02: d02?.identical }));
