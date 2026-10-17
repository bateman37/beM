// Agregaciones de la auditoría sobre las proyecciones de intento (MOTOR-13): fiabilidad por mecanismo, concentración, matriz de 32 capacidades, sensibilidad de contexto fijo,
// curva de energía. Todo lee hechos ya conservados; nada sortea, simula ni modifica un partido observado (§4.2).
import { r4, sum, mean, clamp, fnv } from './util.js';
import { BIN_EDGES } from './project.js';
import { effectiveAbility } from '../match/core.js';

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

// Capacidades que el motor CONSUME en operaciones cuyas entradas no se registran como receta con base, efectiva y energía (lectura de código de MOTOR-13, con función y archivo). No son
// «atributos muertos» (se consumen), pero su contraste B no es aislable con el contrato de registro actual: la dependencia exacta se declara aquí y en el inventario de MOTOR-14.
export const UNRECORDED = {
  TEC17: { mech: 'fuerza de rebote (profile.rebound.strength) vía reboundStrength → recipeObj sin etiqueta (actions.js)', dep: 'registrar la receta de fuerza de rebote o extraer una función pura con energía y alcance del contexto' },
  TEC18: { mech: 'fuerza de rebote (strength) y captor (profile.rebound.captor) vía recipeObj/weightedSum sin etiqueta (actions.js)', dep: 'registrar las recetas de fuerza y de captor o extraer una función pura con energía y alcance del contexto' },
  FIS05: { mech: 'fuerza de rebote y captor (rebote) y alcance (alcance) sin receta etiquetada', dep: 'ídem TEC17/TEC18; el registro `alcance` conserva el ajuste pero no las entradas' },
  FIS06: { mech: 'factor de resistencia del gasto de energía (core.js · enduranceFactor): afecta al desgaste futuro, no a un valor del siguiente tiro', dep: 'contraste de gasto por intervalo con la operación pura de consumo (no existe extraída); EXP13-08 observa el efecto en partidos' },
  MEN02: { mech: 'q de la selección (actions.js · libertyAndReading) y lectura defensiva: eff(decisor, MEN02) sin receta etiquetada', dep: 'registrar las entradas de q (MEN02, MEN03 y penalización de presión) o extraer libertyAndReading como función pura' },
  MEN03: { mech: 'q de la selección (actions.js · libertyAndReading, con penalización de presión MEN07) y lectura defensiva', dep: 'ídem MEN02' },
  MEN06: { mech: 'amplitud de la variación del momento (states.js · formulas.js consistencySigmaAt)', dep: 'protocolo neutral de MOTOR-07 (contexto fijo, estados neutrales); no se evalúa como «más valor → más puntos»' },
  MEN07: { mech: 'pérdida por presión (states.js, formulas.js) y penalización de MEN03 en la elección', dep: 'registrar la pérdida por presión con sus entradas o extraer la fórmula pura; `estados:forma_presion` conserva el resultado' },
};

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

// ---------------------------------------------------------------------------------------------------------------- sensibilidad de contexto fijo (§7.3 B, §7.4)
export function selectContexts(projs, perCap) {
  const sel = {};
  for (const cap of CAPABILITY_IDS) {
    const strata = {}; for (const p of projs) for (const [st, list] of Object.entries(p.recipes.contexts[cap] ?? {})) (strata[st] ??= []).push(...list);
    for (const l of Object.values(strata)) l.sort((a, b) => a.h - b.h || (a.decision_id < b.decision_id ? -1 : 1));
    const names = Object.keys(strata).filter((s) => s !== 'LIMITE').sort(); const picked = []; const seen = new Set();
    const take = (item) => { const k = `${item.decision_id}|${item.player}|${item.rol}`; if (seen.has(k)) return false; seen.add(k); picked.push(item); return true; };
    const lim = (strata.LIMITE ?? []).slice(0, 2); for (const it of lim) take({ ...it, stratum: `LIMITE (${it.stratum})`, limite: true });
    for (let i = 0; picked.length < perCap; i++) { let any = false; for (const s of names) { const it = strata[s][i]; if (it) { any = true; if (picked.length < perCap) take(it); } } if (!any) break; }
    sel[cap] = picked;
  }
  return sel;
}

export function sensitivity(contexts, profile, increments) {
  const [lo, hi] = profile.abilityBounds; const rows = [];
  for (const [cap, list] of Object.entries(contexts)) for (const c of list) for (const inc of increments) {
    const newBase = Math.min(hi, c.base + inc); const effectiveInc = newBase - c.base; let effAfter; let method;
    if (c.taskMax != null && c.energia != null) { effAfter = effectiveAbility(profile, newBase, c.energia, cap, c.taskMax); method = 'operación pura effectiveAbility(base, energía, tope de tarea)'; }
    else { effAfter = clamp(newBase - (c.base - c.eff), lo, hi); method = 'brecha base−efectiva registrada (tope de tarea no registrado)'; }
    const W = sum(c.terminos.map((x) => x.peso)); let num = 0; for (const x of c.terminos) num += x.peso * ((x.cap === cap && x.jugador === c.player && x.rol === c.rol) ? effAfter : x.efectiva);
    const after = num / W; rows.push({ cap, stratum: c.stratum, decision_id: c.decision_id, event_id: c.event_id, label: c.label, player: c.player, role: c.rol, base: c.base, incrementoSolicitado: inc, incrementoEfectivo: effectiveInc, energia: c.energia, efectivaAntes: c.eff, efectivaDespues: r4(effAfter), valorAntes: c.valor, valorDespues: r4(after), delta: r4(after - c.valor), unidad: 'puntos de receta (escala 1–30); NO es probabilidad ni puntos', saturacion: effectiveInc < inc ? (effectiveInc === 0 ? 'base en el máximo: incremento efectivo 0' : 'recortada al máximo') : (effAfter >= hi ? 'efectiva en el máximo' : ''), limite: !!c.limite, metodo: method });
  }
  return rows;
}

// ---------------------------------------------------------------------------------------------------------------- matriz de 32 capacidades (§7.1)
export function capabilityMatrix(projs, profile, sens, experiments) {
  const declared = declaredUses(profile); const dict = Object.fromEntries((profile.attributeDictionary ?? []).map((a) => [a.id, a.label ?? a.name ?? a.id]));
  const rows = []; const expCaps = {}; for (const e of experiments ?? []) for (const c of e.capabilities ?? []) (expCaps[c] ??= []).push(e.id);
  for (const cap of CAPABILITY_IDS) {
    const obs = {}; let totalUses = 0; let qUses = 0; const players = new Set();
    for (const p of projs) { const c = p.recipes.byCap[cap]; if (c) for (const [st, s] of Object.entries(c.strata)) { const o = (obs[st] ??= { uses: 0, sumEff: 0, sumBase: 0, sumShare: 0, matches: new Set() }); o.uses += s.uses; o.sumEff += s.sumEff; o.sumBase += s.sumBase; o.sumShare += s.sumShare; o.matches.add(p.match_id); totalUses += s.uses; } for (const pl of Object.keys(p.recipes.byCap[cap]?.players ?? {})) players.add(pl); qUses += p.recipes.qualityTerms?.[cap]?.uses ?? 0; }
    const sat = sum(projs.map((p) => p.recipes.byCap[cap]?.saturated ?? 0)); const s = sens.filter((r) => r.cap === cap);
    const sensBy = (inc) => { const xs = s.filter((r) => r.incrementoSolicitado === inc && !r.limite && r.incrementoEfectivo > 0); return xs.length ? { n: xs.length, mediaDelta: r4(mean(xs.map((r) => r.delta))), minDelta: r4(Math.min(...xs.map((r) => r.delta))), maxDelta: r4(Math.max(...xs.map((r) => r.delta))) } : null; };
    const decl = declared[cap]; const strata = Object.keys(obs);
    const estado = totalUses > 0 ? (s.length ? 'declarado, observado, aplicado y contrastado (cálculo fijo)' : 'declarado, observado y aplicado; sin contraste') : (UNRECORDED[cap] ? `consumida en operaciones sin receta registrada con entradas (${UNRECORDED[cap].mech}); contraste B no aislable: ${UNRECORDED[cap].dep}` : qUses > 0 ? 'declarado y observado solo en calidad de ataque (sin base/energía registradas: contraste no aislable)' : (decl.length ? 'declarado y NO expuesto en esta evidencia (no es un atributo muerto)' : 'sin declaración localizada'));
    if (!strata.length) rows.push({ cap, nombre: dict[cap] ?? cap, stratum: '—', declaradoEn: decl.map((d) => d.path).slice(0, 8), declaradoN: decl.length, usos: 0, usosCalidadAtaque: qUses, matches: 0, actores: 0, mediaBase: null, mediaEfectiva: null, mediaPeso: null, saturadas: sat, contrasteCalculo: null, contrastePartidos: expCaps[cap] ?? [], estado });
    else for (const st of strata.sort()) { const o = obs[st]; rows.push({ cap, nombre: dict[cap] ?? cap, stratum: st, declaradoEn: decl.map((d) => d.path).slice(0, 8), declaradoN: decl.length, usos: o.uses, usosCalidadAtaque: qUses, matches: o.matches.size, actores: players.size, mediaBase: r4(o.sumBase / o.uses), mediaEfectiva: r4(o.sumEff / o.uses), mediaPeso: r4(o.sumShare / o.uses), saturadas: sat, contrasteCalculo: { '+1': sensBy(1), '+3': sensBy(3), '+5': sensBy(5), contextos: s.filter((r) => r.stratum === st && r.incrementoSolicitado === 1).length }, contrastePartidos: expCaps[cap] ?? [], estado }); }
  }
  return rows;
}

// ---------------------------------------------------------------------------------------------------------------- curva de energía (AUD17)
export function energyCurve(projs) {
  const agg = {}; for (const p of projs) for (const [k, v] of Object.entries(p.recipes.energyBands)) { const a = (agg[k] ??= { n: 0, gap: 0 }); a.n += v.n; a.gap += v.gap; }
  return Object.entries(agg).map(([k, v]) => { const [kind, band] = k.split('|'); return { tipo: kind, banda: band, n: v.n, brechaMedia: r4(v.gap / v.n) }; }).sort((a, b) => (a.tipo + a.banda < b.tipo + b.banda ? -1 : 1));
}
export { fnv };
