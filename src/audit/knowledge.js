// Sensibilidad de CONOCIMIENTO (MOTOR-18, §13.2). Lectura SEPARADA del contraste de las 32 capacidades: misma operación y mismo actor, un nivel de conocimiento (+1/+3/+5, tope del rango) y las contribuciones
// de la operación recalculadas con las funciones puras de producción (`familiarityActor`, `familiaritySide`, `familiarityDelta`, `qualityResolution`). Capacidades y demás conocimientos permanecen fijos.
// Tres preguntas distintas que no se mezclan: capacidad deportiva (AUD05, 32 capacidades) · conocimiento adquirido ACTUAL (esta lectura; unidad: nivel 1–30) · velocidad de aprendizaje (Polivalencia/teaching:
// solo en la función de aprendizaje, src/learning). Esta lectura no amplía AUD05 a 33 capacidades.
import { fnv, r4, ensure, inc as incr } from './util.js';
import { idsOf } from '../knowledge/model.js';
import { familiarityActor, familiaritySide, familiarityDelta, qualityResolution } from '../match/formulas.js';

export const KNOWLEDGE_SENS_VERSION = 'SENS-KNOW-MOTOR18-R1';
const r6 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1e6) / 1e6);
const TOL = { quality: 2e-4, pressedAdvance: 2e-8, delta: 2e-5 }; // la calidad solo conserva sus pesos a 5 decimales; el avance conserva sus pesos completos; los pesos de módulo del ajuste a 6 decimales
export const newKnowledge = (max = 30) => ({ max, ops: { quality: 0, pressedAdvance: 0 }, nonZero: { quality: 0, pressedAdvance: 0 }, neutral: { quality: 0, pressedAdvance: 0 }, noAplica: {}, contexts: {}, modulesSeen: {}, positionsSeen: {}, rolesSeen: {} });
const keepSmall = (list, item, k) => { list.push(item); list.sort((a, b) => a.h - b.h); if (list.length > k) list.pop(); };

// Nota `familiaridad` (precede a la `calidad` o a la `salida:avance` del MISMO hecho). Sin aplicación (`aplica:false`) se cuenta con su motivo: calidad heredada/determinista o capa sin conocimiento explícito.
export function noteFamiliarity(P, r) {
  const d = r.data ?? {}; const K = P.knowledge;
  if (!d.aplica) { incr(K.noAplica, d.motivo ?? 'no aplica (sin motivo registrado)'); return; }
  P._fam = { event: r.event_id, note: d };
}
function contextsOf(P, r, op) {
  const f = P._fam; if (!f || f.event !== r.event_id) return; P._fam = null; const d = f.note; const K = P.knowledge; const scope = d.ambito; K.ops[scope] += 1;
  if (d.neutral) { K.neutral[scope] += 1; return; } if (d.delta) K.nonZero[scope] += 1;
  const gdec = `${P.global_attempt}|${r.decision_id}`;
  for (const side of ['ataque', 'defensa']) {
    const mods = (side === 'ataque' ? d.modulosAtaque : d.modulosDefensa) ?? []; const wOf = Object.fromEntries(mods.map((m) => [m.id, m.w]));
    for (const a of d.participantes?.[side] ?? []) {
      if (a.neutral) continue;
      const items = [];
      if (a.pos != null && a.slot) items.push({ domain: 'posicion', id: a.slot, level: a.pos });
      if (a.rolNivel != null && a.rol) items.push({ domain: 'rol', id: a.rol, rolLado: side === 'ataque' ? 'ofensivo' : 'defensivo', level: a.rolNivel });
      for (const m of a.modulos ?? []) if (m.nivel != null) items.push({ domain: 'modulo', id: m.id, level: m.nivel });
      for (const it of items) {
        const lim = it.level >= K.max; const stratum = `${scope}.${side}.${it.domain}${lim ? '|LIMITE' : ''}`; const list = ensure(K.contexts, stratum, () => []);
        (it.domain === 'modulo' ? K.modulesSeen : it.domain === 'posicion' ? K.positionsSeen : K.rolesSeen)[`${it.id}|${side}`] = 1;
        keepSmall(list, { h: fnv(`${gdec}|${it.domain}|${it.id}|${a.pid}|${side}`), gdec, decision_id: r.decision_id, event_id: r.event_id, ambito: scope, contexto: d.contexto, lado: side, actor: a.pid, dominio: it.domain, rolLado: it.rolLado ?? null, id: it.id, nivel: it.level, ataque: d.participantes.ataque, defensa: d.participantes.defensa, modulosAtaque: d.modulosAtaque, modulosDefensa: d.modulosDefensa, delta: d.delta, DA: d.DA, DD: d.DD, op, stratum }, lim ? 2 : 8);
      }
    }
  }
}
export function linkKnowledgeQuality(P, r) { const e = r.data?.entradas; if (!e) { P._fam = null; return; } contextsOf(P, r, { tipo: 'calidad', entradas: e, pesos: r.data.pesos }); }
export function linkKnowledgeAdvance(P, r) { const e = r.data?.entradas; if (!e) { P._fam = null; return; } contextsOf(P, r, { tipo: 'avance', entradas: e, salida: r.data.salida }); }

// Selección determinista y ciega al resultado: por estrato (ámbito.lado.dominio) los de menor hash; más hasta dos con nivel en el máximo (límite, donde el cambio debe ser exactamente 0).
export function selectKnowledgeContexts(projs, perStratum, max) {
  const strata = {};
  for (const p of projs) for (const [st, list] of Object.entries(p.knowledge?.contexts ?? {})) (strata[st] ??= []).push(...list);
  const out = [];
  for (const st of Object.keys(strata).sort()) { const l = strata[st].sort((a, b) => a.h - b.h || (a.gdec < b.gdec ? -1 : 1)); if (st.endsWith('|LIMITE')) out.push(...l.slice(0, 2).map((c) => ({ ...c, limite: true }))); else out.push(...l.filter((c) => c.nivel < max).slice(0, perStratum)); }
  return out;
}

function domains(fam, side, c, patch) {
  const mods = (side === 'ataque' ? c.modulosAtaque : c.modulosDefensa) ?? []; const w = Object.fromEntries(mods.map((m) => [m.id, m.w])); const ds = [];
  for (const a of c[side] ?? []) {
    if (a.neutral) { ds.push(null); continue; }
    const mine = patch && a.pid === c.actor && side === c.lado;
    const parts = { position: a.pos, role: a.rolNivel, modules: (a.modulos ?? []).map((m) => ({ w: w[m.id] ?? m.w, K: m.nivel })) };
    if (mine) { if (c.dominio === 'posicion') parts.position = patch; else if (c.dominio === 'rol') parts.role = patch; else parts.modules = parts.modules.map((m, i) => (a.modulos[i].id === c.id ? { ...m, K: patch } : m)); }
    ds.push(familiarityActor(fam, parts).D);
  }
  return { D: familiaritySide(ds), actorD: (() => { const i = (c[side] ?? []).findIndex((a) => a.pid === c.actor); return i >= 0 ? ds[i] : null; })() };
}
const dist = (b, a) => Object.keys(a).map((k) => ({ clave: k, antes: r4(b[k] ?? 0), despues: r4(a[k]) }));
const normalize = (w) => { const t = Object.values(w).reduce((x, y) => x + y, 0); return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v / t])); };

export function knowledgeSensitivity(contexts, profile, increments) {
  const fam = profile.familiarity; const max = fam.range.max; const rows = [];
  for (const c of contexts) for (const inc of increments) {
    const nuevo = Math.min(max, c.nivel + inc); const eff = nuevo - c.nivel;
    const A0 = domains(fam, 'ataque', c, null); const D0 = domains(fam, 'defensa', c, null);
    const A1 = c.lado === 'ataque' ? domains(fam, 'ataque', c, nuevo) : A0; const D1 = c.lado === 'defensa' ? domains(fam, 'defensa', c, nuevo) : D0;
    const d0 = familiarityDelta(fam, c.ambito, A0.D, D0.D); const d1 = familiarityDelta(fam, c.ambito, A1.D, D1.D);
    const shift = d1.delta - d0.delta; // la salida base conserva el ajuste registrado; solo se desplaza lo que cambia el conocimiento
    let salida; let antes; let despues; let registrada; let opciones; let tol; let fn;
    if (c.op.tipo === 'calidad') {
      const e = c.op.entradas; const q = (extraZ) => qualityResolution(profile, { ca: e.ca, cd: e.cd, kctx: e.kctx, hasOpposition: e.hasOpposition, noForced: e.noForced, extraZ, Z: e.Z, alpha: e.alpha }).final;
      const b = q(e.extraZ); const a = q(e.extraZ + shift); const rec = Object.fromEntries((c.op.pesos ?? []).map((x) => [x.clase, x.p]));
      salida = 'probabilidad de calidad previa cómoda de la oportunidad'; antes = b.comfortable; despues = a.comfortable; registrada = rec.comfortable ?? null; tol = TOL.quality; fn = 'qualityResolution + familiarityActor/familiaritySide/familiarityDelta (src/match/formulas.js)';
      opciones = dist(b, a); var diffBase = Math.max(...Object.keys(b).map((k) => Math.abs(b[k] - (rec[k] ?? 0))));
    } else {
      const e = c.op.entradas; const f = { controlledAdvance: 1, delayedAdvance: -1, pressureBeaten: 1 };
      const pr = (s) => normalize(Object.fromEntries(e.items.map((i) => [i.key, i.w * (f[i.key] ? Math.exp(f[i.key] * s) : 1)])));
      const b = pr(0); const a = pr(shift); const rec = c.op.salida?.p ?? {};
      salida = 'probabilidad de avance controlado ante presión adelantada'; antes = b.controlledAdvance; despues = a.controlledAdvance; registrada = rec.controlledAdvance ?? null; tol = TOL.pressedAdvance; fn = 'distribución de avance presionado (pesos z-dependientes ×exp(±Δz)) + familiarityDelta';
      opciones = dist(b, a); var diffBase = Math.max(...Object.keys(b).map((k) => Math.abs(b[k] - (rec[k] ?? 0))));
    }
    const deltaOk = c.delta == null ? null : Math.abs(d0.delta - c.delta) <= TOL.delta;
    rows.push({ dominio: c.dominio, conocimiento: c.id, rolLado: c.rolLado, actor: c.actor, ambito: c.ambito, contexto: c.contexto, lado: c.lado, gdec: c.gdec, decision_id: c.decision_id, event_id: c.event_id, stratum: c.stratum, limite: !!c.limite,
      incrementoSolicitado: inc, incrementoEfectivo: eff, nivelAntes: c.nivel, nivelDespues: nuevo, nivelUnidad: 'nivel de conocimiento (escala 1–30)',
      dominioActorAntes: r6(c.lado === 'ataque' ? A0.actorD : D0.actorD), dominioActorDespues: r6(c.lado === 'ataque' ? A1.actorD : D1.actorD), dominioLadoAntes: r6(c.lado === 'ataque' ? A0.D : D0.D), dominioLadoDespues: r6(c.lado === 'ataque' ? A1.D : D1.D),
      deltaLogitAntes: r6(d0.delta), deltaLogitDespues: r6(d1.delta), deltaLogitUnidad: 'logit', deltaRegistrado: c.delta ?? null, deltaBaseCoincide: deltaOk,
      salida, salidaUnidad: 'probabilidad (0–1)', salidaAntes: r6(antes), salidaDespues: r6(despues), salidaDelta: r6(despues - antes), salidaRegistrada: registrada == null ? null : r6(registrada), diferenciaBase: Number(diffBase.toExponential(3)), tolerancia: tol, baseCoincide: diffBase <= tol, opciones, funcion: fn,
      saturacion: eff === 0 ? 'nivel en el máximo: incremento efectivo 0' : eff < inc ? 'recortado al máximo' : '', pregunta: 'conocimiento adquirido ACTUAL (no capacidad deportiva ni velocidad de aprendizaje)' });
  }
  return rows;
}

// Controles de familiaridad (separados de AUD01–32; no cambian su contador): aplicación por ámbito, neutralidad, no reaplicación, reconstrucción de la base y EXPOSICIÓN de los módulos del catálogo.
export function knowledgeControls(projs, rows, profile) {
  const fam = profile.familiarity; const ops = { quality: 0, pressedAdvance: 0 }; const nonZero = { quality: 0, pressedAdvance: 0 }; const neutral = { quality: 0, pressedAdvance: 0 }; const noAplica = {}; const mods = {}; const pos = {}; const roles = {};
  for (const p of projs) { const k = p.knowledge; if (!k) continue; for (const s of Object.keys(ops)) { ops[s] += k.ops[s]; nonZero[s] += k.nonZero[s]; neutral[s] += k.neutral[s]; } for (const [m, v] of Object.entries(k.noAplica)) noAplica[m] = (noAplica[m] ?? 0) + v; Object.assign(mods, k.modulesSeen); Object.assign(pos, k.positionsSeen); Object.assign(roles, k.rolesSeen); }
  const allModules = idsOf('tactic', fam);
  const seen = new Set(Object.keys(mods).map((k) => k.split('|')[0])); const notExposed = allModules.filter((m) => !seen.has(m));
  const expOps = ops.quality + ops.pressedAdvance; const bad = rows.filter((r) => r.baseCoincide === false); const sat = rows.filter((r) => r.incrementoEfectivo === 0);
  return { version: KNOWLEDGE_SENS_VERSION, operacionesConAjuste: ops, operacionesConAjusteNoNulo: nonZero, operacionesNeutras: neutral, noAplica, exposicion: expOps === 0 ? 'no observada: la evidencia no contiene operaciones con conocimiento explícito' : notExposed.length ? 'insuficiente' : 'observada',
    modulosDelCatalogo: allModules.length, modulosExpuestos: allModules.length - notExposed.length, modulosSinExposicion: notExposed, posicionesExpuestas: Object.keys(pos).length, rolesExpuestos: Object.keys(roles).length,
    filas: rows.length, filasBaseNoCoincide: bad.length, filasSaturadas: sat.length, saturadasConCambioCero: sat.filter((r) => r.salidaDelta === 0).length,
    limites: 'contraste representativo de cálculo fijo de conocimiento (no un efecto sobre el marcador); un módulo no expuesto no se contrasta y se declara «exposición insuficiente», no se supone sin efecto; comprobar que la base se reconstruye no demuestra por sí solo que la lectura sea completa' };
}
