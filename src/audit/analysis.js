// Agregaciones de la auditoría sobre las proyecciones de intento (MOTOR-13): fiabilidad por mecanismo, concentración, matriz de 32 capacidades, sensibilidad de contexto fijo,
// curva de energía. Todo lee hechos ya conservados; nada sortea, simula ni modifica un partido observado (§4.2).
import { r4, sum, mean, clamp, fnv } from './util.js';
const r6 = (x) => Math.round(x * 1e6) / 1e6;
import { BIN_EDGES } from './project.js';
import { effectiveAbility } from '../match/core.js';
import { consumerOutput, consumerOf } from './consumers.js';
import { mixResolution, acceptanceResolution } from '../match/formulas.js';
import { enduranceFactorAt, readingQRaw, pressureLossLogit, consistencySigmaAt } from '../match/formulas.js';

export const CAPABILITY_IDS = ['TEC01', 'TEC02', 'TEC03', 'TEC04', 'TEC05', 'TEC06', 'TEC07', 'TEC08', 'TEC09', 'TEC10', 'TEC11', 'TEC12', 'TEC13', 'TEC14', 'TEC15', 'TEC16', 'TEC17', 'TEC18', 'FIS01', 'FIS02', 'FIS03', 'FIS04', 'FIS05', 'FIS06', 'FIS07', 'MEN01', 'MEN02', 'MEN03', 'MEN04', 'MEN05', 'MEN06', 'MEN07'];

// ---------------------------------------------------------------------------------------------------------------- fiabilidad (§9)
// Une las lecturas por intento. Unidad: decisión binaria consumida (p final antes del sorteo, resultado del MISMO sorteo) o, en categorías excluyentes, cada opción de la distribución
// completa de la decisión (lectura por clase). No se mezclan mecanismos distintos y un intervalo sin observaciones queda vacío (no se rellena con cero).
export function reliability(projs, params) {
  const warn = params.reliabilityWarn; const out = [];
  for (const [kind, key] of [['binaria', 'binary'], ['distribucion', 'dist']]) {
    const labels = new Set(projs.flatMap((p) => Object.keys(p[key])));
    for (const lab of [...labels].sort()) {
      const rel = projs.map((p) => ({ p, r: p[key][lab] })).filter((x) => x.r);
      const n = sum(rel.map((x) => x.r.n)); if (!n) continue;
      const sumP = sum(rel.map((x) => x.r.sumP)); const sumY = sum(rel.map((x) => x.r.sumY)); const brier = sum(rel.map((x) => x.r.brier)) / n;
      const bins = BIN_EDGES.slice(1).map((hi, i) => { const b = rel.map((x) => x.r.bins[i]); const nb = sum(b.map((x) => x.n)); return { desde: BIN_EDGES[i], hasta: hi, cierraEn1: i === BIN_EDGES.length - 2, n: nb, mediaP: nb ? sum(b.map((x) => x.sumP)) / nb : null, frecuencia: nb ? sum(b.map((x) => x.sumY)) / nb : null }; });
      const perMatch = rel.map((x) => ({ match_id: x.p.match_id, n: x.r.n, esperado: x.r.sumP, observado: x.r.sumY }));
      const det = { p0: sum(rel.map((x) => x.r.deterministic.p0)), p1: sum(rel.map((x) => x.r.deterministic.p1)), bad: rel.flatMap((x) => x.r.deterministic.bad.map((b) => ({ ...b, match_id: x.p.match_id }))) };
      const low = n < warn.minDecisions || rel.length < warn.minMatches;
      out.push({ kind, mecanismo: lab, n, partidos: rel.length, mediaP: sumP / n, observados: sumY, esperados: sumP, diferencia: sumY - sumP, brier, bins, perMatch, determinista: det, muestraEscasa: low, nota: low ? `muestra escasa (<${warn.minDecisions} decisiones o <${warn.minMatches} partidos): lectura descriptiva` : 'umbral editorial superado: no es prueba de calibración' });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- concentración (§11.1)
export function concentration(projs, params) {
  const fam = params.familyConcentration; const fin = params.finalizerConcentration; const out = { families: [], finalizers: [] };
  const teams = new Set(projs.flatMap((p) => Object.keys(p.families)));
  for (const t of [...teams].sort()) {
    const rows = projs.filter((p) => p.families[t]); const total = sum(rows.map((p) => p.families[t].total)); const keys = new Set(rows.flatMap((p) => Object.keys(p.families[t].byFamily)));
    for (const k of keys) { const n = sum(rows.map((p) => p.families[t].byFamily[k] ?? 0)); const matches = rows.filter((p) => p.families[t].byFamily[k]).length; const share = n / total; out.families.push({ team: t, family: k, n, total, matches, matchesTotal: rows.length, share, aviso: share > fam.share && total >= fam.minUnits && matches >= fam.minMatches, suficiente: total >= fam.minUnits && rows.length >= fam.minMatches }); }
  }
  const ft = new Set(projs.flatMap((p) => Object.keys(p.finalizers)));
  for (const t of [...ft].sort()) {
    const rows = projs.filter((p) => p.finalizers[t]); const total = sum(rows.map((p) => p.finalizers[t].total)); const ps = new Set(rows.flatMap((p) => Object.keys(p.finalizers[t].byPlayer)));
    for (const pl of ps) { const n = sum(rows.map((p) => p.finalizers[t].byPlayer[pl] ?? 0)); const matches = rows.filter((p) => p.finalizers[t].byPlayer[pl]).length; const share = n / total; out.finalizers.push({ team: t, player: pl, n, total, matches, matchesTotal: rows.length, share, aviso: share > fin.share && total >= fin.minUnits && matches >= fin.minMatches, suficiente: total >= fin.minUnits && rows.length >= fin.minMatches }); }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- escaneo de las filas que declaran cada capacidad (§7.1)
export function declaredUses(profile) {
  const out = Object.fromEntries(CAPABILITY_IDS.map((c) => [c, []])); const seen = new Set(CAPABILITY_IDS);
  const walk = (node, path) => {
    if (Array.isArray(node)) {
      if (node.length === 3 && typeof node[0] === 'string' && seen.has(node[1]) && typeof node[2] === 'number') out[node[1]].push({ path, rol: node[0], peso: node[2] });
      else node.forEach((x, i) => walk(x, `${path}.${i}`));
    } else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) { if (seen.has(k) && (typeof v === 'number' || typeof v === 'object')) out[k].push({ path: `${path}.${k}`, peso: typeof v === 'number' ? v : null }); walk(v, path ? `${path}.${k}` : k); }
  };
  for (const key of Object.keys(profile)) { if (['attributeDictionary', 'attributeOrder', 'population', 'generator', 'lab', 'batch', 'analysis', 'audit', 'provenance'].includes(key)) continue; walk(profile[key], key); }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- salida derivada de las siete capacidades registradas en MOTOR-14
// Contraste B de contexto fijo sobre las OPERACIONES PURAS del productor (formulas.js / effectiveAbility), con las entradas registradas y las innovaciones ya sorteadas fijas. No es un hecho ocurrido, no sortea
// y no exige monotonía por realización. Devuelve null si la receta no es una de las nuevas o falta una entrada (no se inventa).
const qOf = (q) => Math.min(1, Math.max(0, q));
function mixChoice(mix, q) {
  if (!mix?.opciones?.length) return null;
  const hasCoach = mix.opciones.some((o) => o.entrenador != null && o.entrenador > 0);
  const raw = mix.opciones.map((o) => { const pj = q * (o.adaptacion ?? 0) + (1 - q) * (o.preferencias ?? 0); const p = hasCoach ? (1 - mix.L) * (o.entrenador ?? 0) + mix.L * pj : pj; return { clave: o.clave, w: p * (o.riesgo ?? 1) * (o.media ?? 1) }; });
  const tot = raw.reduce((a, x) => a + x.w, 0); if (!(tot > 0)) return null;
  const probs = raw.map((x) => ({ clave: x.clave, p: x.w / tot })); return { probs, top: probs.reduce((a, b) => (b.p > a.p + 1e-12 ? b : a)).clave };
}
export function specialOutput(c, cap, newBase, effAfter, profile) {
  const ex = c.ex; if (!ex) return null; const lab = c.label; const T = c.terminos;
  const row = (nombre, unidad, antes, despues, extra = {}) => ({ salida: nombre, salidaUnidad: unidad, salidaAntes: r4(antes), salidaDespues: r4(despues), salidaDelta: r4(despues - antes), ...extra });
  if (lab === 'receta:rebote.fuerza' || lab === 'receta:rebote.captura') { const alc = ex.alcance ?? 0; return row(lab.endsWith('fuerza') ? 'fuerza de cierre del participante (receta + alcance corporal)' : 'peso de captura del candidato', 'puntos de receta (no probabilidad)', c.valor + alc, c.valor + alc + (effAfter - c.eff) * c.peso / sum(T.map((x) => x.peso))); }
  if (lab === 'receta:lectura_defensiva') { const W = sum(T.map((x) => x.peso)) || 1; return row('lectura del defensor (media ponderada)', 'puntos de receta', c.valor, c.valor + (effAfter - c.eff) * c.peso / W); }
  if (lab === 'receta:seleccion.lectura') {
    const e2 = T.find((x) => x.cap === 'MEN02'); const e3 = T.find((x) => x.cap === 'MEN03'); if (!e2 || !e3) return null;
    let n2 = e2.efectiva; let n3 = e3.efectiva;
    if (cap === 'MEN02') n2 = effAfter; else if (cap === 'MEN03') n3 = effAfter; // la brecha base−efectiva registrada ya incluye la penalización de presión (se mantiene fija)
    const qA = qOf(readingQRaw(profile, e2.efectiva, e3.efectiva)); const qD = qOf(readingQRaw(profile, n2, n3));
    const ac = ex.accept?.entradas;
    if (ac) { // MOTOR-17B: la lectura q también decide la aceptación de una opción directa: la misma función pura (`acceptanceResolution`) con las entradas crudas de esa aceptación
      const a0 = acceptanceResolution(profile, { L: ac.L, q: qA, adj: ac.adj }); const a1 = acceptanceResolution(profile, { L: ac.L, q: qD, adj: ac.adj }); const regs = acceptanceResolution(profile, ac);
      return row('probabilidad de aceptar la opción directa', 'probabilidad (0–1)', a0, a1, { lecturaQAntes: r4(qA), lecturaQDespues: r4(qD), funcion: 'acceptanceResolution (src/match/formulas.js)', diferenciaBase: Number(Math.abs(regs - ex.accept.salida.p).toExponential(3)), tolerancia: 2e-8, salidaRegistrada: ex.accept.salida.p, opciones: null,
        nota: 'la presión de la decisión se mantiene fija; la lectura q es la entrada intermedia y la probabilidad de aceptación lo que consume el motor' });
    }
    const en = ex.mix?.entradas;
    if (en) { // MOTOR-17B: la MISMA mezcla de intención del productor (`mixResolution`) con las entradas crudas de la elección; la salida es la distribución de opciones que consume el selector
      const items = en.items.map((i) => ({ key: i.clave, coach: i.coach, pref: i.pref, adapt: i.adapt, risk: i.risk, mid: i.mid, cont: i.cont }));
      const run = (q) => { const o = mixResolution(items, { L: en.L, q, tilt: en.tilt, cf: en.cf }); const t = o.reduce((a2, x) => a2 + x.w, 0); return o.map((x) => ({ clave: x.key, p: x.w / t })); };
      const d0 = run(qA); const d1 = run(qD); const top = d0.reduce((a2, b2) => (b2.p > a2.p + 1e-12 ? b2 : a2)); const top1 = d1.reduce((a2, b2) => (b2.p > a2.p + 1e-12 ? b2 : a2));
      const rec = ex.mix.opciones ?? []; const diff = rec.length ? Math.max(...rec.map((x, i) => Math.abs(items.length && mixResolution(items, { L: en.L, q: en.q, tilt: en.tilt, cf: en.cf })[i].w - x.mezcla))) : null;
      return row(`probabilidad de la opción más probable de la selección (${top.clave})`, 'probabilidad (0–1)', top.p, d1.find((x) => x.clave === top.clave).p, { lecturaQAntes: r4(qA), lecturaQDespues: r4(qD), opciones: d0.map((x, i) => ({ clave: x.clave, antes: r4(x.p), despues: r4(d1[i].p) })), cambiaOpcionMasProbable: top.clave !== top1.clave, funcion: 'mixResolution (src/match/formulas.js)', diferenciaBase: diff == null ? null : Number(diff.toExponential(3)), tolerancia: 2e-4, salidaRegistrada: null,
        nota: 'la presión de la decisión se mantiene fija; la lectura q es la entrada intermedia y la distribución de opciones lo que consume el selector' });
    }
    const ch0 = mixChoice(ex.mix, qA); const ch1 = mixChoice(ex.mix, qD);
    const dP = ch0 && ch1 ? Math.max(...ch0.probs.map((o, i) => Math.abs(o.p - ch1.probs[i].p))) : null;
    return { ...row('lectura q de la selección (la presión se mantiene fija)', 'razón 0–1', qA, qD, { opcionesAntes: ch0?.top ?? null, opcionesDespues: ch1?.top ?? null, cambiaOpcionMasProbable: ch0 && ch1 ? ch0.top !== ch1.top : null, maxCambioProbabilidadOpcion: dP == null ? null : r4(dP), opciones: ch0?.probs.length ?? null, nota: 'evidencia anterior a MOTOR-17B: sin entradas crudas de la mezcla; solo la lectura q (intermedia)' }), noPertinente: true };
  }
  if (lab.startsWith('receta:presion.perdida')) {
    const losses = T.map((x) => pressureLossLogit(profile, ex.ambito, ex.presion, (x.jugador === c.player && x.cap === cap ? effAfter : x.efectiva)));
    const before = T.map((x) => pressureLossLogit(profile, ex.ambito, ex.presion, x.efectiva));
    return row('pérdida por presión (logit; media de ejecutantes)', 'logit', mean(before), mean(losses), { ambito: ex.ambito, presion: ex.presion });
  }
  if (lab === 'receta:momento.consistencia') {
    const s0 = consistencySigmaAt(profile, c.eff); const s1 = consistencySigmaAt(profile, effAfter); const steps = ex.pasos ?? [];
    const e0 = sum(steps.map((x) => x.e)); const e1 = s0 > 0 ? e0 * s1 / s0 : e0;
    return row('amplitud de la variación del momento (σ)', 'σ del momento (−1…1)', s0, s1, { innovacionFija: steps.map((x) => x.U), variacionAcumuladaAntes: r4(e0), variacionAcumuladaDespues: r4(e1), nota: 'misma innovación sorteada: solo cambia la amplitud; el valor final depende además de la atenuación y de los límites' });
  }
  if (lab === 'receta:gasto_resistencia') {
    const t = T.find((x) => x.jugador === c.player); if (!t) return null; const e = profile.energy;
    const f0 = enduranceFactorAt(profile, c.base); const f1 = enduranceFactorAt(profile, newBase); const mins = ex.intervaloDecimas / 600;
    const g = (f) => Math.min(t.energia - e.range[0], e.costPerLiveMinute * mins * t.carga * f);
    return row('gasto de energía del intervalo', 'puntos de energía (0–100)', g(f0), g(f1), { factorAntes: r4(f0), factorDespues: r4(f1), intervaloDecimas: ex.intervaloDecimas, carga: t.carga, nota: 'efecto sobre el desgaste del intervalo; el talento base no cambia' });
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------------------- sensibilidad de contexto fijo (§7.3 B, §7.4)
const isIntermediate = (st) => st.startsWith('INTERMEDIO|') || st === 'LIMITE_INTERMEDIO';
export function selectContexts(projs, perCap) {
  const sel = {};
  for (const cap of CAPABILITY_IDS) {
    const strata = {}; for (const p of projs) for (const [st, list] of Object.entries(p.recipes.contexts[cap] ?? {})) (strata[st] ??= []).push(...list);
    for (const l of Object.values(strata)) l.sort((a, b) => a.h - b.h || (a.gdec < b.gdec ? -1 : 1));
    // MOTOR-17B: se prefieren los contextos con operación real enlazada (salida pertinente). Solo si una capacidad no tiene ninguno se recurre al contexto intermedio de reserva, marcado `sinSalida`.
    const withOut = Object.keys(strata).some((k) => !isIntermediate(k));
    const names = Object.keys(strata).filter((k) => (withOut ? !isIntermediate(k) : isIntermediate(k)) && k !== 'LIMITE' && k !== 'LIMITE_INTERMEDIO').sort(); const picked = []; const seen = new Set();
    const take = (item, extra = {}) => { const k = `${item.gdec}|${item.player}|${item.rol}`; if (seen.has(k)) return false; seen.add(k); picked.push({ ...item, ...extra, sinSalida: !withOut }); return true; };
    const limList = (withOut ? strata.LIMITE : strata.LIMITE_INTERMEDIO) ?? []; for (const it of limList.slice(0, 2)) take(it, { stratum: `LIMITE (${it.stratum})`, limite: true });
    for (let i = 0; picked.length < perCap; i++) { let any = false; for (const s of names) { const it = strata[s][i]; if (it) { any = true; if (picked.length < perCap) take(it); } } if (!any) break; }
    sel[cap] = picked;
  }
  return sel;
}

export function sensitivity(contexts, profile, increments) {
  const [lo, hi] = profile.abilityBounds; const rows = [];
  for (const [cap, list] of Object.entries(contexts)) for (const c of list) for (const inc of increments) {
    const newBase = Math.min(hi, c.base + inc); const effectiveInc = newBase - c.base; let effAfter; let effBefore; let method;
    // MOTOR-17 §7.1: con tope registrado la operación pura se evalúa ANTES y DESPUÉS con las mismas entradas (sin redondeos de la receta registrada): incremento efectivo 0 ⇒ cambio exactamente 0.
    const exact = c.taskMax != null && c.energia != null;
    if (exact) {
      const pure0 = effectiveAbility(profile, c.base, c.energia, cap, c.taskMax); const gap = pure0 - c.eff; // gap ≠ 0 más allá del redondeo = penalización de decisión ya aplicada (p. ej. presión sobre MEN03): se mantiene fija
      const fixedPenalty = Math.abs(gap) > 3e-3 ? gap : 0 // el redondeo registrado (energía a 2 decimales, efectiva a 3) no supera ≈0,0015;
      effBefore = fixedPenalty ? c.eff : pure0; effAfter = Math.min(hi, Math.max(lo, effectiveAbility(profile, newBase, c.energia, cap, c.taskMax) - fixedPenalty));
      method = `${c.topeRegistrado ? 'operación pura effectiveAbility(base, energía, tope registrado en el término)' : 'operación pura effectiveAbility(base, energía, tope de la tarea del perfil)'}${fixedPenalty ? ' con la penalización de decisión registrada mantenida fija' : ''}`;
    }
    else { effBefore = c.eff; effAfter = clamp(newBase - (c.base - c.eff), lo, hi); method = 'APROXIMADA: brecha base−efectiva registrada (tope de tarea no registrado)'; }
    const W = sum(c.terminos.map((x) => x.peso)); const mine = (x) => x.cap === cap && x.jugador === c.player && x.rol === c.rol;
    let num0 = 0; let num = 0; for (const x of c.terminos) { num0 += x.peso * (mine(x) ? effBefore : x.efectiva); num += x.peso * (mine(x) ? effAfter : x.efectiva); }
    const before = num0 / W; const after = num / W; const special = specialOutput(c, cap, newBase, effAfter, profile); const delta = after - before;
    // MOTOR-17B: la salida pertinente sale de la operación real enlazada (misma función pura que el productor). Las salidas derivadas de MOTOR-14 que ya eran la magnitud consumida (selección, pérdida por presión,
    // consistencia y gasto de energía) siguen siéndolo; las recetas de rebote y la lectura defensiva son valores INTERMEDIOS y no sustituyen la salida de la operación.
    let fin = null; for (const op of c.ops ?? []) { fin = consumerOutput(op, profile, { delta, player: c.player, valor: c.valor }); if (fin) break; }
    const specialPert = special && !special.noPertinente && /^receta:(seleccion\.lectura|presion\.perdida|momento\.consistencia|gasto_resistencia)/.test(c.label);
    let salidaCols = {}; let pertinente = false; let consumidor = null; let funcion = null; let cobertura = 'intermedio';
    if (fin) {
      pertinente = true; consumidor = fin.consumidor; funcion = fin.funcion; cobertura = 'reconstruido';
      const toler = fin.tolerancia; const baseOk = fin.diferenciaBase == null ? null : fin.diferenciaBase <= toler;
      salidaCols = { salida: fin.salida, salidaUnidad: fin.salidaUnidad, salidaAntes: r6(fin.antes), salidaDespues: r6(fin.despues), salidaDelta: r6(fin.despues - fin.antes), salidaRegistrada: fin.registrada == null ? null : r6(fin.registrada), diferenciaBase: fin.diferenciaBase == null ? null : Number(fin.diferenciaBase.toExponential(3)), tolerancia: toler, baseCoincide: baseOk, opciones: fin.opciones ?? null, detalleSalida: fin.detalle ?? null,
        ...(special ? { intermedioMOTOR14: { salida: special.salida, antes: special.salidaAntes, despues: special.salidaDespues, unidad: special.salidaUnidad } } : {}) };
    } else if (specialPert) { pertinente = true; consumidor = special.funcion?.startsWith('acceptance') ? 'aceptacion' : /seleccion/.test(c.label) ? 'seleccion' : /presion/.test(c.label) ? 'presion' : /consistencia/.test(c.label) ? 'consistencia' : 'gasto'; funcion = special.funcion ?? 'operación pura de MOTOR-14 (src/match/formulas.js · src/audit/analysis.js)'; cobertura = 'reconstruido'; salidaCols = { ...special, baseCoincide: special.diferenciaBase == null ? null : special.diferenciaBase <= (special.tolerancia ?? 0) }; }
    else if (special) { salidaCols = { intermedioMOTOR14: { salida: special.salida, antes: special.salidaAntes, despues: special.salidaDespues, unidad: special.salidaUnidad } }; }
    const exactaSalida = pertinente && exact && (fin ? fin.diferenciaBase == null || fin.diferenciaBase <= fin.tolerancia : true);
    const unitCtx = pertinente ? `${salidaCols.salidaUnidad ?? special?.salidaUnidad} · receta intermedia: puntos (escala 1–30)` : 'puntos de receta (escala 1–30): ENTRADA INTERMEDIA de la operación; la salida pertinente no está registrada para este contexto: NO es probabilidad ni puntos del partido';
    rows.push({ cap, stratum: c.stratum, gdec: c.gdec, decision_id: c.decision_id, event_id: c.event_id, label: c.label, player: c.player, role: c.rol, base: c.base, incrementoSolicitado: inc, incrementoEfectivo: effectiveInc, energia: c.energia, efectivaAntes: c.eff, efectivaDespues: r4(effAfter), valorAntes: c.valor, valorAntesReconstruido: r4(before), valorDespues: r4(after), delta: r4(delta),
      // `delta` es SIEMPRE el cambio del valor de receta (entrada intermedia). La magnitud consumida va en `salida*` con su propia unidad (sección 5 del encargo MOTOR-17B).
      pertinente, consumidor, funcion, cobertura, ...salidaCols,
      magnitud: pertinente ? 'salida de la operación real (ver salida*) y valor de receta intermedio (delta)' : 'valor de receta intermedio: la salida pertinente no se pudo calcular para este contexto', unidad: unitCtx,
      exactitud: exactaSalida || (!pertinente && exact) ? 'exacta' : 'aproximada', exactitudSalida: !pertinente ? 'sin salida pertinente' : exactaSalida ? 'exacta (entradas registradas + función de producción)' : 'aproximada', topeRegistrado: !!c.topeRegistrado, sinSalida: !!c.sinSalida,
      saturacion: effectiveInc < inc ? (effectiveInc === 0 ? 'base en el máximo: incremento efectivo 0' : 'recortada al máximo') : (effAfter >= hi ? 'efectiva en el máximo' : ''), limite: !!c.limite, metodo: method });
  }
  return rows;
}

// ---------------------------------------------------------------------------------------------------------------- matriz de 32 capacidades (§7.1)
export function capabilityMatrix(projs, profile, sens, experiments) {
  const declared = declaredUses(profile); const dict = Object.fromEntries((profile.attributeDictionary ?? []).map((a) => [a.id, a.label ?? a.name ?? a.id]));
  const rows = []; const expCaps = {}; for (const e of experiments ?? []) for (const c of e.capabilities ?? []) (expCaps[c] ??= []).push(e.id);
  for (const cap of CAPABILITY_IDS) {
    const obs = {}; let totalUses = 0; let qUses = 0; const players = new Set();
    for (const p of projs) { const c = p.recipes.byCap[cap]; if (c) for (const [st, s] of Object.entries(c.strata)) { const o = (obs[st] ??= { uses: 0, sumEff: 0, sumBase: 0, sumShare: 0, matches: new Set() }); o.uses += s.uses; o.sumEff += s.sumEff; o.sumBase += s.sumBase; o.sumShare += s.sumShare; o.matches.add(p.global_attempt); totalUses += s.uses; } for (const pl of Object.keys(p.recipes.byCap[cap]?.players ?? {})) players.add(pl); qUses += p.recipes.qualityTerms?.[cap]?.uses ?? 0; }
    const sat = sum(projs.map((p) => p.recipes.byCap[cap]?.saturated ?? 0)); const s = sens.filter((r) => r.cap === cap);
    const sensBy = (inc, ex = 'exacta') => { const xs = s.filter((r) => r.incrementoSolicitado === inc && !r.limite && r.incrementoEfectivo > 0 && (r.exactitud ?? 'aproximada') === ex); return xs.length ? { n: xs.length, mediaDelta: r4(mean(xs.map((r) => r.delta))), minDelta: r4(Math.min(...xs.map((r) => r.delta))), maxDelta: r4(Math.max(...xs.map((r) => r.delta))) } : null; };
    const decl = declared[cap]; const strata = Object.keys(obs);
    // MOTOR-17B: cobertura de la salida PERTINENTE de la capacidad (la que consume la operación real), separada del contraste solo hasta la receta intermedia.
    const sp = s.filter((r) => r.pertinente); const ctxOut = new Set(sp.map((r) => `${r.gdec}|${r.player}|${r.role}`)); const ctxAll = new Set(s.map((r) => `${r.gdec}|${r.player}|${r.role}`));
    const salida = { salidaPertinente: sp.length > 0, salidaContextos: ctxOut.size, salidaFilas: sp.length, salidaExactas: sp.filter((r) => r.exactitudSalida?.startsWith('exacta')).length, salidaConsumidores: [...new Set(sp.map((r) => r.consumidor))].join(' | '), contextosSoloIntermedios: [...ctxAll].filter((k) => !ctxOut.has(k)).length,
      salidaMotivoPendiente: sp.length ? null : totalUses === 0 ? 'sin exposición en recetas registradas' : s.length ? 'el contraste termina en la receta intermedia: ningún contexto con la operación consumidora enlazada (entrada no registrada o consumidor no expuesto)' : 'sin contexto seleccionado' };
    const estado = totalUses > 0 ? (sp.length ? 'declarado, observado, aplicado y contrastado hasta la salida pertinente (cálculo fijo)' : s.length ? 'declarado, observado y contrastado solo hasta la receta intermedia; salida pertinente pendiente' : 'declarado, observado y aplicado; sin contraste') : (qUses > 0 ? 'declarado y observado solo en calidad de ataque (sin base/energía registradas: contraste no aislable)' : (decl.length ? 'declarado y NO expuesto en esta evidencia (no es un atributo muerto)' : 'sin declaración localizada'));
    if (!strata.length) rows.push({ cap, nombre: dict[cap] ?? cap, stratum: '—', declaradoEn: decl.map((d) => d.path).slice(0, 8), declaradoN: decl.length, usos: 0, usosCalidadAtaque: qUses, matches: 0, actores: 0, mediaBase: null, mediaEfectiva: null, mediaPeso: null, saturadas: sat, contrasteCalculo: null, contrastePartidos: expCaps[cap] ?? [], ...salida, estado });
    else for (const st of strata.sort()) { const o = obs[st]; rows.push({ cap, nombre: dict[cap] ?? cap, stratum: st, declaradoEn: decl.map((d) => d.path).slice(0, 8), declaradoN: decl.length, usos: o.uses, usosCalidadAtaque: qUses, matches: o.matches.size, actores: players.size, mediaBase: r4(o.sumBase / o.uses), mediaEfectiva: r4(o.sumEff / o.uses), mediaPeso: r4(o.sumShare / o.uses), saturadas: sat, contrasteCalculo: { '+1': sensBy(1), '+3': sensBy(3), '+5': sensBy(5), contextos: s.filter((r) => r.stratum === st && r.incrementoSolicitado === 1).length, contextosExactos: s.filter((r) => r.stratum === st && r.incrementoSolicitado === 1 && r.exactitud === 'exacta').length }, contrasteAproximado: { '+1': sensBy(1, 'aproximada'), '+3': sensBy(3, 'aproximada'), '+5': sensBy(5, 'aproximada') }, contrastePartidos: expCaps[cap] ?? [], ...salida, estado }); }
  }
  return rows;
}

// ---------------------------------------------------------------------------------------------------------------- curva de energía (AUD17)
export function energyCurve(projs) {
  const agg = {}; for (const p of projs) for (const [k, v] of Object.entries(p.recipes.energyBands)) { const a = (agg[k] ??= { n: 0, gap: 0 }); a.n += v.n; a.gap += v.gap; }
  return Object.entries(agg).map(([k, v]) => { const [kind, band] = k.split('|'); return { tipo: kind, banda: band, n: v.n, brechaMedia: r4(v.gap / v.n) }; }).sort((a, b) => (a.tipo + a.banda < b.tipo + b.banda ? -1 : 1));
}
// MOTOR-15B §5.2: la brecha de energía por (ámbito, tarea, banda). Tareas con distinto tope de deterioro no se suman como una misma magnitud: cada celda conserva numerador (brecha acumulada),
// denominador (términos de receta), energía mínima observada y casos de ejemplo. La energía es la REGISTRADA en el término de receta al calcularlo (nunca el estado final del jugador).
export function energyByTask(projs) {
  const agg = {};
  for (const p of projs) for (const [k, v] of Object.entries(p.recipes.energyByTask ?? {})) {
    const a = (agg[k] ??= { n: 0, gap: 0, baseSum: 0, minEnergy: v.minEnergy, examples: [] }); a.n += v.n; a.gap += v.gap; a.baseSum += v.baseSum; if (v.minEnergy < a.minEnergy) a.minEnergy = v.minEnergy;
    for (const ex of v.examples) if (a.examples.length < 2) a.examples.push({ match_id: p.match_id, attempt_id: p.attempt_id, source: p.source_id ?? null, ...ex });
  }
  return Object.entries(agg).map(([k, v]) => { const [ambito, tarea, banda] = k.split('|'); return { ambito, tarea, banda, n: v.n, brecha: r4(v.gap), brechaMedia: r4(v.gap / v.n), relativa: v.baseSum ? r4(v.gap / v.baseSum) : null, minEnergia: v.minEnergy, ejemplos: v.examples }; })
    .sort((a, b) => (a.ambito + a.tarea + a.banda < b.ambito + b.tarea + b.banda ? -1 : 1));
}
export { fnv };
