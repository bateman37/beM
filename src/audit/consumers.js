// MOTOR-17B (B17-02): salida PERTINENTE de cada consumidor real de las recetas de capacidades. El contraste de sensibilidad cambia una capacidad de un jugador, recalcula su receta (valor intermedio) y,
// con ese cambio, vuelve a evaluar LA MISMA función pura que usa el productor (src/match/formulas.js) con las entradas registradas en el punto de consumo (`salida:*`, `calidad`, mezcla de la transición).
// No hay segundo simulador: contexto, oposición, estados, opciones competidoras, parámetros e innovaciones sorteadas permanecen fijos; solo cambia la entrada que alimenta la capacidad.
import { r4 } from './util.js';
import { shotResolution, shotPrepCostLogit, blockResolution, reboundTeamResolution, looseControlP, qualityResolution, categoryResolution, mixResolution, abilityFit, pickProbabilities } from '../match/formulas.js';

// Precisión declarada con la que la salida base reconstruida debe coincidir con la que conservó el productor. Los números de las entradas se conservan sin redondeo y las salidas a 8 decimales (±5e-9); la mezcla
// de la transición solo conserva sus pesos a 4 decimales (±5e-5 por peso). No se amplía para ocultar una discrepancia: si se supera, la fila es `aproximada`.
export const TOLERANCE = { tiro: 2e-8, tapon: 2e-8, rebote: 2e-8, suelto: 2e-8, control: 2e-8, calidad: 2e-4, 'mezcla:transicion': 2e-4 };
const PROB = 'probabilidad (0–1)';
const OPS = {
  'salida:tiro': 'tiro', 'salida:tapon': 'tapon', 'salida:rebote': 'rebote', 'salida:suelto': 'suelto', 'salida:control': 'control', calidad: 'calidad', 'mezcla:transicion': 'mezcla:transicion',
};
export const consumerOf = (op) => OPS[op.op] ?? null;
const focusLabel = { turnover: 'pérdida', defensiveNonShootingFoul: 'falta defensiva sin tiro', shootingFoul: 'falta en acto de tiro', offensiveFoul: 'falta ofensiva', comfortable: 'calidad previa cómoda', fieldShot: 'tiro de campo' };
const dist = (before, after) => Object.keys(after).map((k) => ({ clave: k, antes: r4(before[k] ?? 0), despues: r4(after[k]) }));
const normalized = (w) => { const t = Object.values(w).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v / t])); };

// `delta`: cambio del VALOR de la receta enlazada (entrada intermedia). `player`: jugador del contexto. Devuelve null si el contexto no puede evaluarse (se declara, no se inventa).
// MOTOR-18 (R17B-SENS-01): `deps` = cambios de las demás recetas de la MISMA operación alimentadas por la misma capacidad del mismo jugador ([{refKey, label, peso, delta}]). Se aplican TODOS a la vez sobre las
// entradas registradas (una sola vez por entrada: se deduplica por refKey y se ignora la que coincide con la principal). Las entradas que no cambian conservan su valor registrado.
const CONSUMER_KEYS = { tiro: ['A', 'D', 'prep'], control: ['off', 'def', 'legalDef', 'legalOff'], suelto: ['ra', 'rd'], calidad: ['ca', 'cd'] };
export function consumerOutput(op, profile, { delta, player, valor, deps = [] }) {
  const n = op.note; const kind = consumerOf(op); const key = op.refKey; const peso = op.peso ?? 1;
  const allowed = CONSUMER_KEYS[kind] ?? [];
  const extra = {}; for (const d of deps) if (d.refKey !== key && allowed.includes(d.refKey) && !extra[d.refKey]) extra[d.refKey] = d;
  const chg = (k) => (k === key ? { delta, peso } : extra[k] ? { delta: extra[k].delta, peso: extra[k].peso ?? 1 } : null);
  const depsApplied = Object.values(extra).map((d) => ({ refKey: d.refKey, receta: d.label, deltaReceta: r4(d.delta), peso: d.peso ?? 1 }));
  const base = { dependenciasAplicadas: depsApplied, consumidor: kind, funcion: null, entradaIntermedia: { antes: valor, despues: r4(valor + delta), unidad: 'puntos de receta (escala 1–30)' }, referenciaRegistro: null };
  if (kind === 'tiro') {
    const sh = profile.shots[n.zona]; const e = n.entradas; if (!sh) return null;
    const b = shotResolution(profile, sh, e); let { A, D, K } = e;
    if (!['A', 'D', 'prep'].includes(key)) return null;
    const cA = chg('A'); const cD = chg('D'); const cP = chg('prep');
    if (cA) A += cA.peso * cA.delta; if (cD) D += cD.peso * cD.delta; if (cP) K = e.K + shotPrepCostLogit(profile, e.prep) - shotPrepCostLogit(profile, e.prep + cP.delta);
    const a = shotResolution(profile, sh, { A, D, K, Z: e.Z, alpha: e.alpha });
    return { ...base, funcion: 'shotResolution (src/match/formulas.js)', salida: `probabilidad de acierto del ${n.zona === 'freeThrow' ? 'tiro libre' : `tiro de campo (${n.zona})`}`, salidaUnidad: PROB, antes: b.p, despues: a.p, registrada: n.salida.p, diferenciaBase: Math.abs(b.p - n.salida.p), tolerancia: TOLERANCE.tiro,
      detalle: { pBaseAntes: r4(b.pBase), pBaseDespues: r4(a.pBase), zona: n.zona, entrada: key === 'A' ? 'capacidad ofensiva efectiva A' : key === 'D' ? 'capacidad defensiva efectiva D' : 'coste logit de preparación del movimiento (K)', entradasCambiadas: ['A', 'D', 'prep'].filter((k) => chg(k)) } };
  }
  if (kind === 'tapon') {
    const sh = profile.shots[n.zona]; const e = n.entradas; const b = blockResolution(profile, sh, e);
    const a = blockResolution(profile, sh, { ...e, blk: e.blk + peso * delta });
    return { ...base, funcion: 'blockResolution (src/match/formulas.js)', salida: 'probabilidad de tapón', salidaUnidad: PROB, antes: b.p, despues: a.p, registrada: n.salida.p, diferenciaBase: Math.abs(b.p - n.salida.p), tolerancia: TOLERANCE.tapon, detalle: { zona: n.zona } };
  }
  if (kind === 'rebote') {
    const e = n.entradas;
    if (key === 'fuerza') {
      const side = op.lado; const f = { ataque: { ...e.fuerza.ataque }, defensa: { ...e.fuerza.defensa } }; if (f[side]?.[player] == null) return null;
      const mean = (o) => { const v = Object.values(o); return v.reduce((s, x) => s + x, 0) / v.length; }; const rr = (ff) => reboundTeamResolution(profile, { p0: e.p0, RA: Object.keys(ff.ataque).length ? mean(ff.ataque) : 0, RD: Object.keys(ff.defensa).length ? mean(ff.defensa) : 0, K: e.K, fpDelta: e.fpDelta, Z: e.Z, alpha: e.alpha, hasOffense: e.hasOffense });
      const b = rr(f); f[side][player] += delta; const a = rr(f);
      return { ...base, funcion: 'reboundTeamResolution (src/match/formulas.js)', salida: 'probabilidad de rebote ofensivo del equipo', salidaUnidad: PROB, antes: b.p, despues: a.p, registrada: n.salida.p, diferenciaBase: Math.abs(b.p - n.salida.p), tolerancia: TOLERANCE.rebote, detalle: { lado: side, participantes: Object.keys(f[side]).length } };
    }
    if (key === 'captura') {
      const w = { ...e.captura.pesos }; if (w[player] == null) return null; const pick = (ww) => pickProbabilities(Object.entries(ww).map(([key, v]) => ({ key, w: v })));
      const b = pick(w); w[player] += delta; const a = pick(w); const rec = e.captura.probabilidades?.[player] ?? null;
      return { ...base, funcion: 'pickProbabilities (src/match/formulas.js; el sorteo `rebote:captor` de MatchCore.pick)', salida: 'probabilidad de que el jugador capture el rebote del equipo que lo gana', salidaUnidad: PROB, antes: b[player] ?? 0, despues: a[player] ?? 0, registrada: rec, diferenciaBase: rec == null ? null : Math.abs((pick(e.captura.pesos)[player] ?? 0) - rec), tolerancia: TOLERANCE.rebote,
        opciones: dist(b, a), detalle: { lado: e.captura.lado, nota: 'la probabilidad de captura condiciona a que el equipo gane el rebote; el sorteo del equipo es otra operación' } };
    }
    return null;
  }
  if (kind === 'suelto') {
    const e = n.entradas; const b = looseControlP(profile, e.ra, e.rd); const a = looseControlP(profile, e.ra + (chg('ra')?.delta ?? 0), e.rd + (chg('rd')?.delta ?? 0));
    return { ...base, funcion: 'looseControlP (src/match/formulas.js)', salida: 'probabilidad de que el ataque conserve el balón suelto', salidaUnidad: PROB, antes: b, despues: a, registrada: n.salida.p, diferenciaBase: Math.abs(b - n.salida.p), tolerancia: TOLERANCE.suelto, detalle: {} };
  }
  if (kind === 'control') {
    const spec = { ...n.entradas }; const out = (s) => { const r = categoryResolution(profile, s); return r.final ?? normalized(r.w); };
    const b = out(spec); const s2 = { ...spec };
    if (!['off', 'def', 'legalDef', 'legalOff'].includes(key)) return null;
    if (key === 'def' && s2.def == null) return null;
    const cO = chg('off'); const cDf = chg('def'); const cLD = chg('legalDef'); const cLO = chg('legalOff');
    if (cO) s2.off += cO.delta; if (cDf && s2.def != null) s2.def += cDf.peso * cDf.delta; if (cLD) s2.legalDef += cLD.delta; if (cLO) s2.legalOff += cLO.delta;
    const a = out(s2); const focus = key === 'legalOff' ? 'offensiveFoul' : key === 'legalDef' ? (spec.hasDefend ? 'shootingFoul' : 'defensiveNonShootingFoul') : 'turnover';
    if (b[focus] == null) return null;
    const rec = n.salida; const diff = Math.max(...Object.keys(rec).map((k) => Math.abs((b[k] ?? 0) - rec[k])));
    return { ...base, funcion: 'categoryResolution (src/match/formulas.js)', salida: `probabilidad de ${focusLabel[focus]} en el intento`, salidaUnidad: PROB, antes: b[focus], despues: a[focus], registrada: rec[focus], diferenciaBase: diff, tolerancia: TOLERANCE.control, opciones: dist(b, a), detalle: { categoria: focus, ejecucion: spec.exec } };
  }
  if (kind === 'calidad') {
    const e = n.entradas; const q = (x) => { const r = qualityResolution(profile, x); return r.final; };
    const b = q(e); const a = q({ ...e, ca: e.ca + (chg('ca')?.delta ?? 0), cd: e.cd != null ? e.cd + (chg('cd')?.delta ?? 0) : e.cd });
    const rec = Object.fromEntries((n.pesos ?? []).map((x) => [x.clase, x.p])); const diff = Math.max(...Object.keys(b).map((k) => Math.abs(b[k] - (rec[k] ?? 0))));
    return { ...base, funcion: 'qualityResolution (src/match/formulas.js)', salida: 'probabilidad de calidad previa cómoda de la oportunidad', salidaUnidad: PROB, antes: b.comfortable, despues: a.comfortable, registrada: rec.comfortable ?? null, diferenciaBase: diff, tolerancia: TOLERANCE.calidad, opciones: dist(b, a), detalle: { lado: key === 'ca' ? 'ataque' : 'defensa' } };
  }
  if (kind === 'mezcla:transicion') {
    const e = n.entradas; const actor = n.actor; const items = e.items.map((i) => ({ key: i.clave, coach: i.coach, pref: i.pref, adapt: i.adapt, risk: i.risk, mid: i.mid, cont: i.cont }));
    const prob = (list) => { const o = mixResolution(list, { L: e.L, q: e.q, tilt: e.tilt, cf: e.cf }); const t = o.reduce((s, x) => s + x.w, 0); return { o, p: Object.fromEntries(o.map((x) => [x.key, x.w / t])) }; };
    const b = prob(items); const f0 = abilityFit(profile, valor); const f1 = abilityFit(profile, valor + delta);
    const a = prob(items.map((i) => (String(i.key).startsWith(`${actor}:`) ? { ...i, pref: i.pref * f1 / f0 } : i)));
    const mine = (pp) => Object.entries(pp).filter(([k]) => k.startsWith(`${actor}:`)).reduce((s, [, v]) => s + v, 0);
    const rec = n.opciones ?? []; const diff = Math.max(...rec.map((x) => Math.abs(b.o.find((y) => y.key === x.clave).w - x.mezcla)));
    return { ...base, funcion: 'mixResolution + abilityFit (src/match/formulas.js, src/match/plays.js)', salida: 'probabilidad de que el jugador sea el finalizador de la transición (suma de sus opciones)', salidaUnidad: PROB, antes: mine(b.p), despues: mine(a.p), registrada: null, diferenciaBase: diff, tolerancia: TOLERANCE['mezcla:transicion'],
      opciones: dist(b.p, a.p), detalle: { factorAjusteAntes: r4(f0), factorAjusteDespues: r4(f1) } };
  }
  return null;
}
