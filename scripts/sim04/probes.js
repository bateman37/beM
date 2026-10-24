// SIM-MOTOR-04 (§5.3; adaptado de SIM-MOTOR-03 §8.1 y §8.2): matriz de las 32 capacidades por situación y cobertura de controles, con magnitudes PURAS (sin azar: solo lo previo al sorteo, vía src/sim/probe.js) y reglas de exposición
// para el registro de campaña. No añade cálculo deportivo ni toca el generador: solo lee. CLI: node scripts/sim04/probes.js --out=<dir> → 09a-capacidades.csv, 09b-controles.csv, 09-capacidades-y-controles.json.
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadData, ROOT } from '../node-data.js';
import { makeContext } from '../../src/sim/context.js';
import { buildReferenceInput } from '../../src/sim/teams.js';
import { probeVector, bumpAbilities, diffVectors } from '../../src/sim/probe.js';
import { CAPABILITIES } from '../../src/sim/capabilities.js';
import { CONTROL_ROWS, controlContrasts } from '../../src/sim/controls.js';
import { ZONES, shotProbs, ftProb, reboundModel, recipe, ea } from '../../src/sim/model.js';
import { consistencySigmaAt, enduranceFactorAt, pressureLossLogit } from '../../src/match/formulas.js';

export const PROBES_SCHEMA = 'beM-sim04-probes/1';
const DELTAS = [1, 3, 5];
const sig = (x) => (typeof x === 'number' && Number.isFinite(x) ? +x.toPrecision(12) : x); // 12 cifras: un delta pequeño pero real no debe redondearse a «sin cambio»
const clone = (x) => JSON.parse(JSON.stringify(x));
const fingerprint = (input, over) => createHash('sha1').update(JSON.stringify({ input, over })).digest('hex').slice(0, 16);

// ---------------------------------------------------------------------------------------------------------------------------- lectura ampliada (magnitudes previas al sorteo que probeVector no publica)
// Todo sale de los modelos ya compilados por probeVector (M.toW, M.ofW, M.dnW, reboundModel, ftProb, shotProbs...): lectura pura, sin sorteo. Las claves nuevas llevan el índice del jugador en pista (i) y el equipo atacante (k).
export function readVector(ctx, input, over = {}) {
  const pv = probeVector(ctx, input, over); const v = { ...pv.vector }; const m = pv.match; const S = m.S; const T = m.T;
  const nz = (a) => { const t = a.reduce((s, x) => s + x, 0) || 1; return a.map((x) => x / t); };
  for (const k of [0, 1]) {
    const M = pv.models[k]; const s = m.sides[k]; const o = m.sides[1 - k]; const lu = s.view.players; const du = o.view.players;
    nz(M.toW).forEach((x, i) => { v[`credit.turnover.${i}.${k}`] = x; }); nz(M.ofW).forEach((x, i) => { v[`credit.offFoul.${i}.${k}`] = x; }); nz(M.dnW).forEach((x, i) => { v[`credit.defFoul.${i}.${k}`] = x; });
    for (const z of ZONES) lu.forEach((p, i) => { v[`pMake.${z}.p${i}.${k}`] = shotProbs(S, T, m.sides, k, M, { kind: 'trans', cell: { zone: z, moved: false, role: 'handler' } }, p, 1).p; });
    lu.forEach((p, i) => {
      v[`pMake.movedThree.p${i}.${k}`] = shotProbs(S, T, m.sides, k, M, { kind: 'trans', cell: { zone: 'three', moved: true, role: 'handler' } }, p, 1).p; v[`pFT.p${i}.${k}`] = ftProb(S, p, M, o);
      v[`energy.cost.p${i}.${k}`] = S.energy.costPerLiveMinute * enduranceFactorAt(S, p.ab.FIS06); v[`moment.sigma.p${i}.${k}`] = consistencySigmaAt(S, p.ab.MEN06); v[`pressure.lossShot.p${i}.${k}`] = pressureLossLogit(S, 'shot', M.pressure, ea(S, p, 'MEN07', 0));
    });
    const R = reboundModel(S, T, m.sides, k, M); lu.forEach((p, i) => { v[`reb.captor.${i}.${k}`] = R.capt(p); v[`reb.strength.${i}.${k}`] = R.strength(p); });
    du.forEach((p, i) => { v[`block.attack.${i}.${k}`] = recipe(S, p, S.block.attack, S.block.maximumEnergyPenalty); });
  }
  return { vector: v, models: pv.models, match: m };
}
export function applyBump(input, id, code, delta, bounds = [1, 30]) {
  const pl = input.teams.flatMap((t) => t.players).find((p) => p.id === id); if (!pl) throw new Error(`jugador inexistente: ${id}`);
  const base = pl.abilities[code]; const target = Math.min(bounds[1], Math.max(bounds[0], base + delta)); const applied = target - base;
  return { input: bumpAbilities(input, [id], [code], delta, bounds), base, requested: delta, applied, limitReached: base + delta > bounds[1], partial: applied !== delta };
}

// ---------------------------------------------------------------------------------------------------------------------------- operandos desde el perfil y lugares de consumo
const CODE_RE = /^(TEC|FIS|MEN)\d\d$/;
const strip = (o) => JSON.parse(JSON.stringify(o, (k, val) => (typeof k === 'string' && k.startsWith('$') ? undefined : val)));
let operandMap = null;
export function operandsOf(S, code) {
  if (!operandMap) {
    operandMap = {};
    const walk = (o, p) => {
      if (Array.isArray(o)) { if (o.length === 3 && typeof o[1] === 'string' && CODE_RE.test(o[1]) && typeof o[2] === 'number') { (operandMap[o[1]] ??= []).push({ path: p, role: o[0], weight: o[2] }); return; } o.forEach((x, i) => walk(x, `${p}.${i}`)); return; }
      if (o && typeof o === 'object') for (const [k, val] of Object.entries(o)) { if (k.startsWith('$')) continue; if (CODE_RE.test(k) && typeof val === 'number') { (operandMap[k] ??= []).push({ path: p, role: null, weight: val }); continue; } walk(val, p ? `${p}.${k}` : k); }
    };
    walk(S, '');
  }
  return operandMap[code] ?? [];
}
export function resolveParam(S, path) {
  if (/[\s:]/.test(path)) return { path, resolved: false, motivo: 'no es una ruta de ctx.sp.v (tabla heredada del detallado)' };
  let o = S; for (const seg of path.split('.')) { if (o == null || typeof o !== 'object' || !(seg in o)) return { path, resolved: false, motivo: `el segmento «${seg}» no existe en ctx.sp.v` }; o = o[seg]; }
  return { path, resolved: true, value: strip(o) };
}
const SRC_FILES = ['src/sim/model.js', 'src/sim/engine.js', 'src/sim/materialize.js', 'src/match/formulas.js', 'src/sim/coachsim.js'];
const srcCache = {};
export function locate(re) {
  for (const f of SRC_FILES) { const lines = (srcCache[f] ??= readFileSync(join(ROOT, f), 'utf8').split('\n')); const i = lines.findIndex((l) => re.test(l)); if (i >= 0) return `${f}:${i + 1}`; }
  return null;
}
// Operandos que el instrumento NO expone, con su lugar de consumo (se localiza buscando el código real; si no existe, se declara). `sits`: situaciones donde la limitación es pertinente.
export function uninstrumented(S, T, code) {
  const out = []; const ops = operandsOf(S, code); void T;
  if (ops.some((o) => o.path.startsWith('rotation.'))) out.push({ operando: 'utilidad de rotación por puesto (S.rotation.slotAbilityWeights): elige sustitutos; no es magnitud de tramo', lugar: locate(/_utility\(pl, slot\)/), sits: ['S7'] });
  if (code === 'FIS06') out.push({ operando: 'trayectoria de energía acumulada entre tramos (el coste por minuto sí está en el vector)', lugar: locate(/enduranceFactorAt\(S, p\.ab\.FIS06\)/), sits: ['S7'] });
  if (code === 'MEN06') out.push({ operando: 'innovación aleatoria del momento (solo su amplitud sigma está en el vector; el sorteo no)', lugar: locate(/consistencySigmaAt\(S, p\.ab\.MEN06\)/), sits: ['S8'] });
  for (const o of ops) {
    if (o.path === 'selection.safeReceiverWeights') out.push({ operando: 'selection.safeReceiverWeights (definido en el perfil)', lugar: locate(/safeReceiverWeights/) ?? 'sin consumidor localizado en src/sim ni src/match/formulas.js', sits: ['S3'] });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------- situaciones fijas §8.1
const ownIds = (input, k) => input.teams[k].players.map((p) => p.id);
const setAll = (input, k, patch) => { for (const p of input.teams[k].players) Object.assign(p.state, patch); };
const FAMS_SCREEN = ['pick_and_roll', 'handoff', 'off_ball_screen'];
export const SITUATIONS = [
  { id: 'S1', name: 'Finalización exterior', teams: ['EQ03', 'EQ04'], mod: 'plan0.styles.finishPreference=5; plan0.midrange=seek', mutate: (i) => { i.teams[0].plan.styles.finishPreference = 5; i.teams[0].plan.midrange = 'seek'; }, over: {},
    caps: { TEC01: 'fin', TEC02: 'fin', TEC06: 'fin', FIS07: 'fin', TEC12: 'perimDef', FIS03: 'perimDef' } },
  { id: 'S2', name: 'Finalización interior/contacto', teams: ['EQ03', 'EQ04'], mod: 'plan0.styles.finishPreference=1; plan0.midrange=avoid', mutate: (i) => { i.teams[0].plan.styles.finishPreference = 1; i.teams[0].plan.midrange = 'avoid'; }, over: {},
    caps: { TEC03: 'fin', TEC04: 'fin', FIS05: 'fin', FIS07: 'fin', TEC05: 'fin', TEC11: 'big0', TEC13: 'interiorDef', TEC15: 'interiorDef', FIS04: 'interiorDef', MEN04: 'interiorDef' } },
  { id: 'S3', name: 'Control y pase del director', teams: ['EQ03', 'EQ04'], mod: 'plan0.styles.freedom=5; plan0.styles.elaboration=5', mutate: (i) => { i.teams[0].plan.styles.freedom = 5; i.teams[0].plan.styles.elaboration = 5; }, over: {},
    caps: { MEN01: 'director', MEN02: 'director', MEN03: 'director', MEN05: 'director', TEC07: 'director', FIS02: 'director', TEC08: 'passer', TEC14: 'stealer', TEC12: 'perimDef' } },
  // C04-05: prioridad 1 = MÁXIMA (peso 8) y 5 = mínima (peso 1). En 03 este instrumento invertía el sentido (5 a las familias con bloqueo): despriorizaba justo la familia que se quería exponer.
  { id: 'S4', name: 'Participación en bloqueo/continuación', teams: ['EQ03', 'EQ04'], mod: 'plan0.playbook: prioridad 1 (máxima) en familias con bloqueo (pick_and_roll, handoff, off_ball_screen) y 5 (mínima) en el resto; plan1.coverage=COB02',
    mutate: (i, T) => { for (const e of i.teams[0].plan.playbook) e.priority = FAMS_SCREEN.includes(T.plays[e.playId].family) ? 1 : 5; i.teams[1].plan.coverage = 'COB02'; }, over: {},
    caps: { TEC09: 'big0', TEC10: 'receiver', TEC16: 'screenDef', MEN01: 'director', FIS04: 'big0', FIS02: 'receiver', FIS03: 'screenDef' } },
  { id: 'S5', name: 'Defensa exterior/recuperación', teams: ['EQ03', 'EQ04'], mod: 'plan0.styles.transition=5; plan1.pressureHeight=three_quarters; plan1.defStyles.pressure=5; plan1.defStyles.steal=5',
    mutate: (i) => { i.teams[0].plan.styles.transition = 5; i.teams[1].plan.pressureHeight = 'three_quarters'; i.teams[1].plan.defStyles.pressure = 5; i.teams[1].plan.defStyles.steal = 5; }, over: {},
    caps: { TEC12: 'perimDef', TEC14: 'stealer', MEN04: 'stealer', FIS01: 'perimDef', FIS02: 'perimDef', FIS03: 'perimDef', TEC07: 'director' } },
  { id: 'S6', name: 'Defensa interior/rebote', teams: ['EQ03', 'EQ04'], mod: 'plan0.styles.afterShot=5; plan0.styles.finishPreference=1; plan1.defStyles.protection=1',
    mutate: (i) => { i.teams[0].plan.styles.afterShot = 5; i.teams[0].plan.styles.finishPreference = 1; i.teams[1].plan.defStyles.protection = 1; }, over: {},
    caps: { TEC13: 'interiorDef', TEC15: 'interiorDef', TEC17: 'rebounder', TEC18: 'rebounder', FIS04: 'rebounder', FIS05: 'rebounder', MEN04: 'rebounder' } },
  { id: 'S7', name: 'Energía/fatiga y rotación', teams: ['EQ03', 'EQ04'], mod: 'state.energy=40 en los doce de ambos equipos; plan1.pressureHeight=three_quarters',
    mutate: (i) => { setAll(i, 0, { energy: 40 }); setAll(i, 1, { energy: 40 }); i.teams[1].plan.pressureHeight = 'three_quarters'; }, over: {},
    caps: { FIS06: 'fin', FIS01: 'perimDef', FIS02: 'fin', FIS03: 'fin', FIS04: 'fin', FIS05: 'fin', FIS07: 'fin' } },
  { id: 'S8', name: 'Consistencia, importancia y estados', teams: ['EQ03', 'EQ04'], mod: 'importance=decisive, period=4, secondsLeft=120, margin=2; state.form=-0.3 y M_TIR=0.3 en equipo 0; state.form=+0.2 en equipo 1',
    mutate: (i) => { setAll(i, 0, { form: -0.3, M_TIR: 0.3 }); setAll(i, 1, { form: 0.2 }); }, over: { importance: 'decisive', period: 4, secondsLeft: 120, margin: 2 },
    caps: { MEN06: 'fin', MEN07: 'fin' } },
];
// Participante por defecto de cada capacidad (se usa también en las situaciones donde no es pertinente: se mide igualmente para documentar si hay efecto).
const DEFAULT_ROLE = Object.fromEntries([
  ...['TEC01', 'TEC02', 'TEC03', 'TEC04', 'TEC05', 'TEC06', 'FIS07', 'FIS06', 'MEN06', 'MEN07'].map((c) => [c, 'fin']),
  ...['TEC07', 'FIS02', 'FIS03', 'MEN01', 'MEN02', 'MEN03', 'MEN05'].map((c) => [c, 'director']),
  ['TEC08', 'passer'], ['TEC09', 'big0'], ['TEC10', 'receiver'], ['TEC11', 'big0'], ['TEC12', 'perimDef'], ['FIS01', 'perimDef'], ['TEC13', 'interiorDef'], ['TEC15', 'interiorDef'], ['FIS04', 'interiorDef'], ['FIS05', 'interiorDef'], ['MEN04', 'interiorDef'],
  ['TEC14', 'stealer'], ['TEC16', 'screenDef'], ['TEC17', 'rebounder'], ['TEC18', 'rebounder']]);
const ROLE_LABEL = { fin: 'finalizador principal del equipo 0 (máx. part.finisher)', director: 'director efectivo del equipo 0', passer: 'pasador principal del equipo 0 (máx. part.passer)', big0: 'jugador de puesto C del equipo 0', receiver: 'segundo finalizador del equipo 0 (receptor)',
  perimDef: 'primer defensor perimetral del equipo 1', interiorDef: 'primer protector de aro del equipo 1', screenDef: 'defensor con función de persecución de bloqueo del equipo 1', stealer: 'defensor del equipo 1 con mayor crédito de robo', rebounder: 'reboteador defensivo del equipo 1 con mayor fuerza' };
const argmax = (vec, pre, post, n) => { let b = 0; let bv = -Infinity; const ord = []; for (let i = 0; i < n; i++) { const x = vec[`${pre}.${i}.${post}`]; ord.push([i, x]); if (x > bv) { bv = x; b = i; } } return { best: b, order: ord.sort((a, c) => c[1] - a[1]).map((e) => e[0]) }; };
function pickParticipant(role, rv) {
  const m = rv.match; const v = rv.vector; const s0 = m.sides[0]; const s1 = m.sides[1]; const p0 = s0.view.players; const p1 = s1.view.players;
  if (role === 'fin') return p0[argmax(v, 'part.finisher', 0, p0.length).best].id;
  if (role === 'receiver') { const a = argmax(v, 'part.finisher', 0, p0.length).order; return p0[a[1]].id; }
  if (role === 'passer') return p0[argmax(v, 'part.passer', 0, p0.length).best].id;
  if (role === 'director') return s0.view.director.id;
  if (role === 'big0') return (s0.view.bySlot.C ?? p0[p0.length - 1]).id;
  if (role === 'perimDef') return (s1.assign.perimeterDefs[0] ?? p1[0]).id;
  if (role === 'interiorDef') return (s1.assign.rimDefs[0] ?? p1[0]).id;
  if (role === 'screenDef') { const f = s1.assign.fnList.find((e) => e.fit === 'screenPursuitFit'); return ((f && s1.assign.who[f.name]) ?? s1.assign.perimeterDefs[0] ?? p1[0]).id; }
  if (role === 'stealer') return p1[argmax(v, 'credit.steal', 0, p1.length).best].id;
  if (role === 'rebounder') { const R = reboundModel(m.S, m.T, m.sides, 0, rv.models[0]); return R.defP.slice().sort((a, b) => R.strength(b) - R.strength(a))[0].id; }
  throw new Error(`rol de participante desconocido: ${role}`);
}
const OBS = [[/^pMake\./, 'FG% por zona (acta: fgm/fga y fg3m/fg3a por zona)'], [/^pBlock\./, 'tapones (blk, blkAgainst) por zona'], [/^pFT/, 'FT% (ftm/fta)'], [/^pOrb|^reb\./, 'rebotes ofensivos/defensivos (oreb, dreb) y crédito individual'],
  [/^term\.(to|bv|lb)|^credit\.turnover|^OffC|^DefC/, 'pérdidas (tov)'], [/^pSteal|^credit\.steal/, 'robos (stl)'], [/^term\.(sf|fs)|^credit\.(offFoul|defFoul)|^legal/, 'faltas (pf, pfd) y tiros libres (fta)'],
  [/^assist|^part\.passer/, 'asistencias (astC, astL)'], [/^mix\.|^part\.finisher/, 'reparto de intentos por zona, familia y jugador (fga, families)'], [/^quality|^reading|^fam\./, 'calidad de oportunidades (zones q0–q2, families.q)'],
  [/^pace|^dnRatio/, 'ritmo: controles por equipo'], [/^energy\./, 'energía final (statesEnd) y minutos'], [/^moment|^pressure/, 'variabilidad del momento y pérdida bajo presión (pMake con importancia)'], [/^def\./, 'reparto defensivo (analysis.defense)'], [/^pHelp/, 'ayudas (calidad de oportunidades)']];
const observables = (keys) => [...new Set(keys.map((k) => OBS.find(([re]) => re.test(k))?.[1]).filter(Boolean))];
const tasksOf = (S, code) => [...new Set(operandsOf(S, code).map((o) => /^tasks\.(TAR\d\d)/.exec(o.path)?.[1]).filter(Boolean))];
const rel = (x) => Math.abs(x.delta / (Math.abs(x.base) || 1));
const fmtKV = (x) => `${x.key}:${sig(x.base)}>${sig(x.after)}`;
const brief = (inp) => ({ disposition: inp.teams.map((t) => t.plan.disposition), defense: inp.teams.map((t) => t.plan.defense), coverage: inp.teams.map((t) => t.plan.coverage), pressureHeight: inp.teams.map((t) => t.plan.pressureHeight), styles0: inp.teams[0].plan.styles, defStyles1: inp.teams[1].plan.defStyles, midrange0: inp.teams[0].plan.midrange, directorPriority0: inp.teams[0].plan.directorPriority });
const knowledgeOf = (inp) => inp.teams.map((t) => t.players.some((p) => p.knowledge?.mode === 'explicit') ? 'explícito' : 'no explícito (familiaridad neutra)');

export function buildCapabilityMatrix({ ctx, profile, players, teams = null }) {
  const S = ctx.sp.v; const T = ctx.T; const rows = []; const bases = [];
  for (const sit of SITUATIONS) {
    const [a, b] = teams ?? sit.teams; const input = buildReferenceInput(profile, players, a, b, { seed: 1 }); sit.mutate(input, T); const over = sit.over;
    const rv0 = readVector(ctx, input, over); const baseId = `${sit.id}|${a}-${b}`; const fp = fingerprint(input, over);
    const lineup = rv0.match.sides.map((s) => s.view.players.map((p) => p.id));
    bases.push({ id: baseId, situacion: sit.id, nombre: sit.name, equipos: [a, b], modificacion_minima: sit.mod, huella: fp, over, contexto: { importance: over.importance ?? 'ordinary', period: over.period ?? 2, margin: over.margin ?? 0, secondsLeft: over.secondsLeft ?? 300 }, plan: brief(input), alineaciones: lineup, conocimiento: knowledgeOf(input), nMagnitudes: Object.keys(rv0.vector).length });
    for (const cap of CAPABILITIES) {
      const pertinent = Object.hasOwn(sit.caps, cap.id); const role = sit.caps[cap.id] ?? DEFAULT_ROLE[cap.id]; const pid = pickParticipant(role, rv0);
      const pl = input.teams.flatMap((t) => t.players).find((p) => p.id === pid); const team = ownIds(input, 0).includes(pid) ? 0 : 1; const level = pl.abilities[cap.id];
      const ops = operandsOf(S, cap.id); const params = cap.params.map((p) => resolveParam(S, p)); const un = uninstrumented(S, T, cap.id).filter((u) => u.sits.includes(sit.id) || u.sits.includes('*'));
      const consumers = [...new Set(ops.map((o) => o.path.split('.').slice(0, 2).join('.')))];
      for (const d of DELTAS) {
        const bump = applyBump(input, pid, cap.id, d); const rv = readVector(ctx, bump.input, over); const diff = diffVectors(rv0.vector, rv.vector);
        const hit = diff.filter((x) => cap.expect.test(x.key)); const ref = (hit.length ? hit : diff).slice().sort((x, y) => rel(y) - rel(x));
        const main = ref[0] ? Math.sign(ref[0].delta) : 0; const comp = diff.filter((x) => main !== 0 && Math.sign(x.delta) === -main).sort((x, y) => rel(y) - rel(x));
        let evidence = 'cálculo_fijo'; let causa = null;
        if (!diff.length) {
          evidence = bump.applied === 0 ? 'no_expuesto' : un.length ? 'no_instrumentado' : 'no_expuesto';
          causa = bump.applied === 0 ? 'tope: la capacidad ya está en 30, cambio aplicado 0'
            : un.length ? `consumo existente pero no expuesto por el instrumento: ${un.map((u) => `${u.operando} [${u.lugar}]`).join('; ')}`
              : !pertinent ? `fuera de foco en «${sit.name}»: la capacidad no es operando de la tarea de la situación y su cambio no mueve ninguna magnitud previa al sorteo`
                : 'pertinente pero sin cambio de magnitud: el participante elegido no es operando de ninguna variable del vector en esta situación';
        }
        rows.push({
          situacion: sit.id, situacion_nombre: sit.name, base_id: baseId, base_huella: fp, codigo: cap.id, nombre: cap.name, grupo: cap.id.slice(0, 3), unidad: 'nivel entero 1–30', pertinente: pertinent,
          motivo_no_pertinencia: pertinent ? null : `fuera de foco: la situación «${sit.name}» no está diseñada para ejercitar esta capacidad (consume: ${cap.consumers}); se mide igualmente y se registra cualquier efecto`,
          operacion: cap.effect, consumidores: cap.consumers, operandos: ops.map((o) => `${o.path}${o.role ? `[${o.role}]` : ''}=${o.weight}`), peso_formula: ops.map((o) => o.weight), parametros: params,
          participante_id: pid, participante_equipo: team, participante_rol: ROLE_LABEL[role], participante_grupo: cap.participants, nivel_base: level,
          cambio_solicitado: d, cambio_aplicado: bump.applied, limite_alcanzado: bump.limitReached, tope_parcial: bump.partial,
          tarea_deportiva: tasksOf(S, cap.id).concat(consumers.filter((c) => !c.startsWith('tasks.') && !c.startsWith('rotation.'))), metricas_observables: observables(diff.map((x) => x.key)),
          contexto: bases.at(-1).contexto, modulos_conocimiento: bases.at(-1).conocimiento.map((c, t) => `equipo${t}: ${c}`), plan: bases.at(-1).plan, participantes: lineup,
          variables_previas: diff.map((x) => x.key), n_cambian: diff.length, n_suben: diff.filter((x) => x.delta > 0).length, n_bajan: diff.filter((x) => x.delta < 0).length,
          pertinentes_cambian: hit.length, cambios: diff.map((x) => ({ key: x.key, base: sig(x.base), after: sig(x.after), delta: sig(x.delta) })),
          compensacion: comp.slice(0, 5).map((x) => ({ key: x.key, base: sig(x.base), after: sig(x.after), delta: sig(x.delta) })),
          evidence, causa_sin_efecto: causa, limitaciones_instrumento: un.map((u) => ({ operando: u.operando, lugar: u.lugar })),
        });
      }
    }
  }
  return { rows, bases };
}

// ---------------------------------------------------------------------------------------------------------------------------- cobertura de controles §8.2
const PRODUCER = {
  'styles.organizedPace': 'src/sim/model.js attackModel/finishPace', 'styles.transition': 'src/sim/model.js attackModel/transitionQuality', 'styles.elaboration': 'src/sim/model.js assistModel', 'styles.finishPreference': 'src/sim/model.js shotCells/spontaneousZones',
  'styles.freedom': 'src/sim/model.js attackModel/mixWeights', 'styles.offensiveRisk': 'src/sim/model.js shotCells/mixWeights', 'styles.afterShot': 'src/sim/model.js reboundModel', midrange: 'src/sim/model.js shotCells (política de media distancia)',
  disposition: 'src/sim/model.js compilePlan/spontaneousZones', defense: 'src/sim/model.js defenseAssignment', 'defense.ORG06': 'src/sim/model.js defenseAssignment (boxTarget/fallbackOrg)', coverage: 'src/sim/model.js covK/coverageContainment', pressureHeight: 'src/sim/model.js attackModel/energyLoad',
  'playbook.priority': 'src/sim/model.js compilePlan/mixWeights', 'coach.policy': 'src/sim/engine.js _rotate/_utility', offensiveRoles: 'src/sim/model.js offRoleBias/rolePool', 'defense.roles': 'src/sim/model.js defRoleBias/defenseAssignment', directorPriority: 'src/sim/model.js lineupView/attackModel (readingMix)',
};
const SEED_FAMS = ['pick_and_roll', 'handoff', 'off_ball_screen', 'give_and_go', 'post', 'isolation'];
const knowledgeFor = (T, level) => {
  const cat = T.familiarity?.catalog; const lv = (ids) => Object.fromEntries(ids.map((id) => [id, { level: level.default }]));
  return { mode: 'explicit', positions: lv(cat.positions), offensiveRoles: lv(cat.offensiveRoles), defensiveRoles: lv(cat.defensiveRoles), tactics: lv(cat.modules.map((x) => x.id)) };
};
const withKnowledge = (input, T, patch) => { // todos al máximo salvo la parte `patch` (neutro exacto en la base: delta logit 0)
  const out = clone(input); for (const t of out.teams) for (const p of t.players) { const k = knowledgeFor(T, { default: 30 }); patch?.(k); p.knowledge = k; } return out;
};
const setLevel = (k, field, pred, level) => { for (const id of Object.keys(k[field])) if (pred(id)) k[field][id].level = level; };
// Sondas adicionales por elemento (lo que controls.js no cubre): variantes sobre la misma entrada, magnitudes previas al sorteo.
function extraProbes(T) {
  const famPlays = (fam) => Object.values(T.plays).filter((p) => p.family === fam).map((p) => p.id);
  const mkState = (patch0, patch1 = null) => (i) => { setAll(i, 0, patch0); if (patch1) setAll(i, 1, patch1); };
  const fam = (pred, lvl = 8) => (i) => i;
  void fam;
  return [
    { id: 'functions.availability', group: 'disposición y funciones', label: 'Funciones de la disposición (disponibilidad de funciones por ficha)', estado: 'representado', productor: 'src/sim/model.js compilePlan (available) y spontaneousZones (mI/mO)', exposure: 'disposition',
      variants: ['DIS01', 'DIS02', 'DIS04', 'DIS05', 'DIS06'].map((d) => ({ label: `disposición ${d}`, mutate: (i) => { i.teams[0].plan.disposition = d; } })), keep: /^mix\./, limitacion: 'Las funciones solo existen como contenido de la disposición: una ficha sin función compatible para un rol obligatorio no se juega; no hay asignación individual por función.' },
    ...SEED_FAMS.map((f) => ({ id: `playbook.family.${f}`, group: 'libro de fichas', label: `Familia ${f} en el libro (prioridad 1 —máxima— frente a 5 —mínima— en el resto)`, estado: 'representado', productor: 'src/sim/model.js compilePlan/mixWeights', exposure: 'playbook.priority',
      variants: [{ label: 'prioridad 1 (máxima) en la familia, 5 (mínima) en el resto', mutate: (i) => { const ids = famPlays(f); for (const e of i.teams[0].plan.playbook) e.priority = ids.includes(e.playId) ? 1 : 5; } }], limitacion: 'Peso de la familia en la mezcla; la elección concreta de ficha y salida es muestreo.' })),
    { id: 'playbook.continuations', group: 'libro de fichas', label: 'Continuaciones (CONTxx de la ficha; continuación por rebote ofensivo o tapón fuera)', estado: 'aproximado', productor: 'src/sim/engine.js _continue/_rebound (cadena de rebote ofensivo); las CONTxx del detallado no se eligen en SIM', exposure: 'styles.afterShot',
      variants: [{ label: 'afterShot=5 (más rebote ofensivo asignado)', mutate: (i) => { i.teams[0].plan.styles.afterShot = 5; } }, { label: 'afterShot=1', mutate: (i) => { i.teams[0].plan.styles.afterShot = 1; } }], keep: /^pOrb/, limitacion: 'Solo la continuación por rebote ofensivo/tapón se representa; no se modelan continuaciones de ficha ni su elección.' },
    { id: 'orders.manual', group: 'órdenes y entrenador', label: 'Órdenes manuales (plan parcial aplicado en la frontera canónica)', estado: 'representado', productor: 'src/sim/engine.js _queueOrder/_applyOrders', exposure: 'orders.manual',
      variants: [{ label: 'la orden aplica transition=5 (misma magnitud que el control styles.transition)', mutate: (i) => { i.teams[0].plan.styles.transition = 5; } }], limitacion: 'La orden no tiene magnitud propia: su efecto es el del plan que aplica; el instante efectivo es de ejecución (no es magnitud previa al sorteo).' },
    { id: 'coach.adjustments', group: 'órdenes y entrenador', label: 'Política del entrenador automático (ajustes de plan)', estado: 'representado', productor: 'src/sim/coachsim.js coachReview/advanceAutomatic', exposure: 'coach.adjustments',
      variants: [{ label: 'ajuste típico: pressureHeight=full en el equipo 1', mutate: (i) => { i.teams[1].plan.pressureHeight = 'full'; } }], limitacion: 'Las decisiones dependen del estado del partido (marcador, faltas, energía); la sonda solo muestra el efecto de un ajuste, no cuándo se decide.' },
    { id: 'context.importance', group: 'contexto externo', label: 'Importancia del partido', estado: 'representado', productor: 'src/sim/model.js pressureLevel (+ pressureLossLogit)', exposure: 'context.importance',
      variants: [{ label: 'important', mutate: () => {}, over: { importance: 'important' } }, { label: 'decisive', mutate: () => {}, over: { importance: 'decisive' } }, { label: 'decisive, Q4, 120 s, margen 2', mutate: () => {}, over: { importance: 'decisive', period: 4, secondsLeft: 120, margin: 2 } }], limitacion: 'El efecto depende de MEN07 y del contexto de reloj/marcador, que el registro de campaña no conserva por tramo.' },
    { id: 'context.clockMargin', group: 'contexto externo', label: 'Reloj y marcador (final ajustado) con importancia ordinaria', estado: 'representado', productor: 'src/sim/model.js pressureLevel', exposure: 'context.clockMargin',
      variants: [{ label: 'Q4, 60 s, margen 1', mutate: () => {}, over: { period: 4, secondsLeft: 60, margin: 1 } }], limitacion: 'Margen y reloj por tramo no figuran en el registro de campaña (solo inicio/fin de tramo).' },
    { id: 'energy', group: 'estados', label: 'Energía', estado: 'representado', productor: 'src/sim/model.js severity/ea (severidad por energía) y src/sim/materialize.js _finishSegment', exposure: 'energy',
      variants: [{ label: 'energía 60', mutate: mkState({ energy: 60 }) }, { label: 'energía 30', mutate: mkState({ energy: 30 }) }], limitacion: 'La sonda mide el efecto instantáneo de la energía; la trayectoria entre tramos es dinámica (no es magnitud previa al sorteo).' },
    { id: 'form', group: 'estados', label: 'Forma', estado: 'representado', productor: 'src/sim/engine.js (p.form) → model.js attackModel', exposure: 'form',
      variants: [{ label: 'Forma +0,5 (equipo 0)', mutate: mkState({ form: 0.5 }) }, { label: 'Forma −0,5 (equipo 0)', mutate: mkState({ form: -0.5 }) }], limitacion: 'La Forma es estado inicial fijo en el encuentro; su exposición se mide en tiempo vivo con Forma distinta de 0.' },
    { id: 'moment.shot', group: 'estados', label: 'Momento individual de tiro (M_TIR)', estado: 'representado', productor: 'src/sim/model.js shotProbs (perturbBinary con Z) y engine.js _updateMoments', exposure: 'moment.individual',
      variants: [{ label: 'M_TIR +0,6 (equipo 0)', mutate: mkState({ M_TIR: 0.6 }) }], limitacion: 'El momento evoluciona con innovación aleatoria (engine.js _updateMoments); la sonda congela el valor inicial.' },
    { id: 'moment.offense', group: 'estados', label: 'Momento individual ofensivo (M_OFE)', estado: 'representado', productor: 'src/sim/model.js attackModel (perturbCategories con Zc)', exposure: 'moment.individual',
      variants: [{ label: 'M_OFE +0,6 (equipo 0)', mutate: mkState({ M_OFE: 0.6 }) }], limitacion: 'Ídem: valor inicial congelado; la evolución es aleatoria.' },
    { id: 'moment.defense', group: 'estados', label: 'Momento individual defensivo (M_DEF)', estado: 'representado', productor: 'src/sim/model.js attackModel/blockProb (Z con M.DEF)', exposure: 'moment.individual',
      variants: [{ label: 'M_DEF +0,6 (equipo 1)', mutate: (i) => setAll(i, 1, { M_DEF: 0.6 }) }], limitacion: 'Ídem.' },
    { id: 'moment.team', group: 'estados', label: 'Momento colectivo (initialTeamMoment)', estado: 'representado', productor: 'src/sim/engine.js (momento de equipo) y model.js (Z de coordinación)', exposure: 'moment.team',
      variants: [{ label: 'initialTeamMoment +0,6 (equipo 0)', mutate: (i) => { i.teams[0].plan.initialTeamMoment = 0.6; } }], limitacion: 'Si la sonda no mueve ninguna magnitud, el efecto colectivo inicial no es observable previo al sorteo (el perfil fija directShotConversionContribution=0 y randomInnovationSigma=0).' },
    { id: 'consistency', group: 'estados', label: 'Consistencia (MEN06): amplitud de la variación del momento', estado: 'representado', productor: 'src/match/formulas.js consistencySigmaAt → engine.js _updateMoments', exposure: 'MEN06',
      variants: [{ label: 'MEN06 +5 en los cinco titulares del equipo 0', mutate: (i) => { for (const id of Object.values(i.teams[0].plan.starters)) { const p = i.teams[0].players.find((x) => x.id === id); p.abilities.MEN06 = Math.min(30, p.abilities.MEN06 + 5); } } }], keep: /^moment\./, limitacion: 'Solo se expone sigma (amplitud); el sorteo del momento no es magnitud previa.' },
    { id: 'familiarity.position', group: 'familiaridad', label: 'Familiaridad por posición', estado: 'representado', productor: 'src/match/formulas.js familiarityActor + src/sim/model.js actorD/famPlayQuality', exposure: 'familiarity.position',
      variants: [{ label: 'posición 8 (resto 30)', mutate: (i) => i, k: (k) => setLevel(k, 'positions', () => true, 8) }], knowledge: true, limitacion: 'Solo actúa con conocimiento explícito (knowledge.mode=explicit); el registro de campaña no conserva el conocimiento de entrada.' },
    { id: 'familiarity.offensiveRole', group: 'familiaridad', label: 'Familiaridad por rol ofensivo', estado: 'representado', productor: 'src/sim/model.js actorD (k.offensiveRoles)', exposure: 'familiarity.role',
      variants: [{ label: 'roles ofensivos 8', mutate: (i) => i, k: (k) => setLevel(k, 'offensiveRoles', () => true, 8) }], knowledge: true, limitacion: 'Ídem.' },
    { id: 'familiarity.defensiveRole', group: 'familiaridad', label: 'Familiaridad por rol defensivo', estado: 'representado', productor: 'src/sim/model.js actorD (k.defensiveRoles)', exposure: 'familiarity.role',
      variants: [{ label: 'roles defensivos 8', mutate: (i) => i, k: (k) => setLevel(k, 'defensiveRoles', () => true, 8) }], knowledge: true, limitacion: 'Ídem.' },
    ...[['disposition', 'disposición', (id) => /^DIS/.test(id)], ['family', 'familia de ficha', (id) => /^FAM:(pick_and_roll|handoff|off_ball_screen|give_and_go|post|isolation)$/.test(id)], ['organization', 'organización defensiva', (id) => /^ORG/.test(id)], ['coverage', 'cobertura', (id) => /^COB/.test(id)],
      ['transition', 'transición (FAM:transition)', (id) => id === 'FAM:transition'], ['press', 'presión (PRESS) y salida de presión', (id) => id === 'PRESS' || id === 'FAM:press_break']]
      .map(([key, label, pred]) => ({ id: `familiarity.module.${key}`, group: 'familiaridad', label: `Familiaridad con el módulo: ${label}`, estado: 'representado', productor: 'src/sim/model.js famModules/actorD/famContextDelta', exposure: 'familiarity.module',
        variants: [{ label: `módulos de ${label} a nivel 8`, mutate: (i) => i, k: (k) => setLevel(k, 'tactics', pred, 8) }], knowledge: true, baseMutate: key === 'press' ? (i) => { i.teams[1].plan.pressureHeight = 'full'; } : null,
      ...(key === 'press' ? { estado: 'representado', productor: 'src/sim/model.js attackModel/famPressDelta (C04-04): un único ajuste sobre el peso ADICIONAL de pérdida de la presión adelantada; exposición en src/sim/exposure.js pressExposure', exposure: 'familiarity.module.press' } : {}), limitacion: key === 'press' ? 'Solo con presión adelantada rival (three_quarters/full) y conocimiento explícito; presión normal no activa la operación.' : 'Ídem; además la cobertura solo cuenta si es aplicable a la ficha.' })),
    ...[['SAQ', 'libro de saque (módulos SAQ:*)', (id) => /^SAQ/.test(id)]].map(([key, label, pred]) => ({ id: `familiarity.module.${key}`, group: 'familiaridad', label: `Familiaridad con el módulo: ${label}`, estado: 'no_representado', productor: 'ninguno en SIM (el saque es exclusivo del detallado)', exposure: 'throwInBook',
      variants: [{ label: 'módulos SAQ a nivel 8', mutate: (i) => i, k: (k) => setLevel(k, 'tactics', pred, 8) }], knowledge: true, limitacion: 'El perfil SIM no tiene operación de saque: el conocimiento SAQ se acepta y no tiene consumidor.' })),
  ];
}
const GROUP_STATE = { 'estilo ofensivo': 'estilos ofensivos', 'estilo defensivo (rival ataca)': 'estilos defensivos', 'media distancia': 'estilos ofensivos' };
export function buildControlCoverage({ ctx, profile, players }) {
  const T = ctx.T; const base = buildReferenceInput(profile, players, 'EQ03', 'EQ04', { seed: 1 }); const rows = [];
  const baseV = probeVector(ctx, base).vector; const baseFp = fingerprint(base, {});
  const summarize = (vecs, keep) => { const keys = new Set(); const per = vecs.map((x) => { const d = diffVectors(baseV, x.vec).filter((e) => !keep || keep.test(e.key)); d.forEach((e) => keys.add(e.key)); return { variante: x.label, n_cambian: d.length, principales: d.sort((a, b) => rel(b) - rel(a)).slice(0, 5).map((e) => ({ key: e.key, base: sig(e.base), after: sig(e.after) })) }; }); return { keys: [...keys].sort(), per }; };
  for (const c of controlContrasts(ctx, base)) {
    const row = CONTROL_ROWS.find((r) => r.id === c.id); const noRep = c.status === 'exclusivo del detallado';
    const estado = noRep ? 'no_representado' : c.status === 'aproximado' ? 'aproximado' : 'representado';
    const per = (c.per ?? []).map((p) => ({ variante: String(p.value), n_cambian: p.changedKeys ?? null, principales: p.top ?? [], error: p.error ?? null }));
    rows.push({ id: c.id, grupo: GROUP_STATE[c.group] ?? c.group, etiqueta: c.label, estado, productor: noRep ? 'ninguno en SIM (se acepta y se declara ignorado: identity.ignoredInput)' : PRODUCER[c.id] ?? 'src/sim/model.js',
      efecto_previo: noRep ? 'ninguno (no es magnitud del generador)' : c.note ?? row.effect, magnitudes_cambian: c.changed ?? [], n_magnitudes: (c.changed ?? []).length, contraste: per, parametros: row.params, base_id: `CTL|EQ03-EQ04`, base_huella: baseFp,
      sonda_efecto: noRep ? 'no_aplica' : (c.changed ?? []).length ? 'cambia_magnitud' : row.rotation ? 'no_instrumentado_en_vector' : 'sin_cambio_en_vector',
      exposicion_regla: noRep ? c.id : c.id, exposicion_unidad: null, exposicion_A: null, exposicion_B: null, exposicion_C: null,
      muestra: noRep ? 'sin sonda (no aplica)' : `contraste puro EQ03–EQ04, valores ${JSON.stringify(row.values)}, sin azar`,
      limitacion: noRep ? 'No representado: un acta correcta no valida este control; no genera efecto ni exposición.' : c.id === 'coach.policy' ? 'Se contrasta en la distribución de sustituciones (no en el vector de tramo); ver pruebas de rotación.' : estado === 'aproximado' ? 'Aproximado (ver estado en controls.js).' : 'Efecto medido sobre magnitudes previas al sorteo; la exposición en la campaña se mide con exposureRules.' });
  }
  const baseKn = withKnowledge(base, T, null); const baseKnV = probeVector(ctx, baseKn).vector; const baseKnFp = fingerprint(baseKn, {});
  for (const ex of extraProbes(T)) {
    const vecs = []; let errors = 0;
    for (const v of ex.variants) {
      let input = clone(base); if (ex.knowledge) input = withKnowledge(base, T, v.k); ex.baseMutate?.(input); v.mutate(input);
      try { vecs.push({ label: v.label, vec: probeVector(ctx, input, v.over ?? {}).vector }); } catch (e) { errors++; vecs.push({ label: `${v.label} (error: ${e.message})`, vec: baseV }); }
    }
    let ref = ex.knowledge ? baseKnV : baseV; if (ex.baseMutate) { const bi = ex.knowledge ? withKnowledge(base, T, null) : clone(base); ex.baseMutate(bi); ref = probeVector(ctx, bi).vector; } const keys = new Set();
    const per = vecs.map((x) => { const d = diffVectors(ref, x.vec).filter((e) => !ex.keep || ex.keep.test(e.key)); d.forEach((e) => keys.add(e.key)); return { variante: x.label, n_cambian: d.length, principales: d.sort((a, b) => rel(b) - rel(a)).slice(0, 5).map((e) => ({ key: e.key, base: sig(e.base), after: sig(e.after) })) }; });
    const changed = [...keys].sort(); const sonda = ex.estado === 'no_representado' ? (changed.length ? 'DISCREPANCIA_cambia_magnitud' : 'sin_cambio_en_vector') : changed.length ? 'cambia_magnitud' : 'sin_cambio_en_vector';
    rows.push({ id: ex.id, grupo: ex.group, etiqueta: ex.label, estado: ex.estado, productor: ex.productor, efecto_previo: changed.length ? `cambian ${changed.length} magnitudes previas al sorteo` : 'ninguna magnitud previa al sorteo cambia en la sonda', magnitudes_cambian: changed, n_magnitudes: changed.length, contraste: per, parametros: [], base_id: ex.knowledge ? 'CTL-KN|EQ03-EQ04|conocimiento explícito todo 30' : 'CTL|EQ03-EQ04', base_huella: ex.knowledge ? baseKnFp : baseFp,
      sonda_efecto: sonda, exposicion_regla: ex.exposure, exposicion_unidad: null, exposicion_A: null, exposicion_B: null, exposicion_C: null, muestra: `contraste puro EQ03–EQ04, ${ex.variants.length} variante(s), sin azar${errors ? `; ${errors} con error` : ''}`, limitacion: ex.limitacion });
  }
  // la unidad de exposición se rellena desde exposureMeta; A/B/C quedan «pendiente_de_campaña» hasta aplicar exposureRules a los registros reales
  for (const r of rows) { const meta = exposureMeta[r.exposicion_regla]; r.exposicion_unidad = meta?.unit ?? null; r.exposicion_nota = meta?.nota ?? 'sin regla de exposición definida'; for (const b of ['A', 'B', 'C']) r[`exposicion_${b}`] = 'pendiente_de_campaña'; }
  return { rows };
}

// ---------------------------------------------------------------------------------------------------------------------------- reglas de exposición sobre el registro de campaña
// Cada regla es pura: (rec) => número | null. null = no instrumentado (falta un campo del registro); 0 = instrumentado y no ejercitado. Un proxy se declara en `nota`.
// Tolera las dos formas del registro: rec.plans[t].initial|plano, rec.states0|rec.states.start, rec.statesEnd|rec.states.end.
const g = (o, path) => { let x = o; for (const k of path.split('.')) { if (x == null) return undefined; x = x[k]; } return x; };
const plansOf = (rec) => { const p = rec?.plans; return Array.isArray(p) && p.length === 2 ? p.map((x) => x?.initial ?? x) : null; };
const flatStates = (s) => { if (!s) return null; if (Array.isArray(s)) return s.flat(); if (typeof s === 'object') return Object.values(s).flat(); return null; };
const states0 = (rec) => flatStates(rec?.states0 ?? rec?.states?.start); const statesEnd = (rec) => flatStates(rec?.statesEnd ?? rec?.states?.end);
const players = (rec) => g(rec, 'essential.box.players'); const expo = (rec) => g(rec, 'essential.exposure'); const dens = (rec) => g(rec, 'essential.familyDenominators');
const sum = (xs, f) => xs.reduce((s, x) => s + f(x), 0);
const zoneA = (rec, zs) => { const ps = players(rec); return ps ? sum(ps, (p) => sum(zs, (z) => p.zones?.[z]?.[0] ?? 0)) : null; };
const famCount = (rec, pred, field = 'fga') => { const fs = g(rec, 'essential.families'); return Array.isArray(fs) ? sum(fs.flat(), (f) => (pred(f.key) ? f[field] ?? 0 : 0)) : null; };
// familia de cada ficha POS (catálogo familiarity.catalog.modules: POS01–04 pick_and_roll, 05–06 handoff, 07–08 off_ball_screen, 09–10 give_and_go, 11–13 post, 14–15 isolation; comprobado contra ctx.T en las pruebas)
export const FAMILY_OF_PLAY = { POS01: 'pick_and_roll', POS02: 'pick_and_roll', POS03: 'pick_and_roll', POS04: 'pick_and_roll', POS05: 'handoff', POS06: 'handoff', POS07: 'off_ball_screen', POS08: 'off_ball_screen', POS09: 'give_and_go', POS10: 'give_and_go', POS11: 'post', POS12: 'post', POS13: 'post', POS14: 'isolation', POS15: 'isolation' };
const inFam = (list) => (key) => list.includes(FAMILY_OF_PLAY[key] ?? key);
const moduleSum = (rec, re) => { const e = expo(rec); return e ? sum(Object.values(e), (x) => sum(Object.entries(x.modules ?? {}).filter(([k]) => re.test(k)), ([, v]) => v)) : null; };
const liveSec = (rec) => { const e = expo(rec); return e ? sum(Object.values(e), (x) => x.liveTenths ?? 0) / 10 : null; };
const nonNeutral = (rec, field, key, neutral, own) => { const pl = plansOf(rec); const d = dens(rec); if (!pl || !d) return null; return sum([0, 1], (t) => (pl[t]?.[field]?.[key] != null && pl[t][field][key] !== neutral ? d[own ? t : 1 - t]?.controls ?? 0 : 0)); };
const secBy = (rec, pred) => { const sg = rec?.segments; if (!Array.isArray(sg)) return null; return sum(sg, (s) => sum([0, 1], (t) => (pred(s, t) ? (s.end - s.start) : 0))); };
const orders = (rec) => g(rec, 'analysis.orders'); const nonNull = (xs) => xs.every((x) => x != null);
const rules = {};
const meta = {};
const rule = (id, unit, nota, fn) => { rules[id] = fn; meta[id] = { unit, nota }; };
const attempts = (id, unit, nota, zs) => rule(id, unit, nota, (rec) => zoneA(rec, zs));
// capacidades (proxy: intentos/operaciones del acta donde la capacidad es operando; una capacidad con varios operandos se cuenta por su operación principal)
attempts('TEC01', 'intentos de tres', 'fg3a por zona three (acta)', ['three']); attempts('TEC02', 'intentos de media distancia', 'intentos zona midrange', ['midrange']); attempts('TEC03', 'intentos interiores', 'intentos zona inside', ['inside']); attempts('TEC04', 'intentos al aro', 'intentos zona rim', ['rim']);
rule('TEC05', 'tiros libres', 'fta del acta', (rec) => { const ps = players(rec); return ps ? sum(ps, (p) => p.fta ?? 0) : null; });
rule('TEC06', 'finalizaciones en movimiento', 'families[].moved (suma de familias, incluye espontáneas y transición)', (rec) => famCount(rec, () => true, 'moved'));
rule('TEC07', 'controles', 'controles de ambos equipos (familyDenominators.controls): proxy del manejo de balón', (rec) => { const d = dens(rec); return d ? sum(d, (x) => x.controls ?? 0) : null; });
rule('TEC08', 'asistencias', 'astC+astL del acta (proxy: pases finales con crédito)', (rec) => { const ps = players(rec); return ps ? sum(ps, (p) => (p.astC ?? 0) + (p.astL ?? 0)) : null; });
rule('TEC09', 'finalizaciones con bloqueador registrado', 'C04-03: analysis.participation[].screeners (e.scr). Distingue tres cosas: CAPACIDAD UTILIZADA (TEC09 es operando de la calidad de las fichas con bloqueo: se mide en la sonda de magnitudes), PARTICIPANTE REGISTRADO (este contador) y EFECTO AGREGADO (la calidad usa grupos funcionales, no al sorteado). Con registro y sin bloqueos el 0 es legítimo; sin analysis es null', (rec) => { const pt = g(rec, 'analysis.participation'); if (!Array.isArray(pt)) return null; return sum(pt, (t) => sum(Object.values(t ?? {}), (p) => sum(Object.values(p.screeners ?? {}), (x) => x))); });
rule('TEC10', 'tiros de familias con receptor', 'fga de handoff/off_ball_screen/give_and_go: proxy (el receptor no se registra aparte)', (rec) => famCount(rec, inFam(['handoff', 'off_ball_screen', 'give_and_go'])));
rule('TEC11', 'tiros de familia de poste', 'fga de la familia post', (rec) => famCount(rec, inFam(['post'])));
attempts('TEC12', 'tiros exteriores defendidos', 'intentos three+midrange (ambos equipos)', ['three', 'midrange']); attempts('TEC13', 'tiros interiores defendidos', 'intentos rim+inside', ['rim', 'inside']);
rule('TEC14', 'robos', 'stl del acta', (rec) => { const ps = players(rec); return ps ? sum(ps, (p) => p.stl ?? 0) : null; }); rule('TEC15', 'tapones', 'blk del acta', (rec) => { const ps = players(rec); return ps ? sum(ps, (p) => p.blk ?? 0) : null; });
rule('TEC16', 'tiros de familias con bloqueo', 'fga de pick_and_roll/handoff/off_ball_screen: proxy de la oposición a bloqueos', (rec) => famCount(rec, inFam(FAMS_SCREEN)));
const reb = (rec) => { const ps = players(rec); return ps ? sum(ps, (p) => (p.oreb ?? 0) + (p.dreb ?? 0)) : null; };
rule('TEC17', 'rebotes', 'oreb+dreb de jugadores (excluye rebotes de equipo)', reb); rule('TEC18', 'rebotes', 'oreb+dreb de jugadores (excluye rebotes de equipo)', reb);
rule('FIS01', 'finalizaciones en transición', 'families clave transition/trans (llegada defensiva)', (rec) => famCount(rec, (k) => /^trans/i.test(k), 'fin'));
rule('FIS02', 'finalizaciones en movimiento', 'families[].moved: proxy de penetración/desmarque', (rec) => famCount(rec, () => true, 'moved'));
rule('FIS03', 'controles', 'controles de ambos equipos: proxy de manejo y oposición', (rec) => { const d = dens(rec); return d ? sum(d, (x) => x.controls ?? 0) : null; });
rule('FIS04', 'intentos interiores y rebotes', 'intentos rim+inside más rebotes', (rec) => { const a = zoneA(rec, ['rim', 'inside']); const r = reb(rec); return a == null || r == null ? null : a + r; });
rule('FIS05', 'intentos al aro, tapones y rebotes', 'intentos rim + blk + rebotes', (rec) => { const a = zoneA(rec, ['rim']); const r = reb(rec); const ps = players(rec); return a == null || r == null || !ps ? null : a + r + sum(ps, (p) => p.blk ?? 0); });
rule('FIS06', 'segundos de juego vivo', 'sum(exposure[].liveTenths)/10', liveSec);
rule('FIS07', 'intentos de tiro', 'intentos de campo (todas las zonas)', (rec) => zoneA(rec, ZONES));
rule('MEN01', 'controles', 'controles de ambos equipos (proxy de ejecución/coordinación)', (rec) => { const d = dens(rec); return d ? sum(d, (x) => x.controls ?? 0) : null; });
rule('MEN02', 'finalizaciones con director', 'analysis.participation[].directors', (rec) => { const pt = g(rec, 'analysis.participation'); return Array.isArray(pt) ? sum(pt, (t) => sum(Object.values(t ?? {}), (p) => sum(Object.values(p.directors ?? {}), (n) => n))) : null; });
rule('MEN03', 'controles', 'controles de ambos equipos (mezcla libro/oportunidad en cada control)', (rec) => { const d = dens(rec); return d ? sum(d, (x) => x.controls ?? 0) : null; });
rule('MEN04', 'rebotes, robos y tapones', 'reb + stl + blk', (rec) => { const ps = players(rec); const r = reb(rec); return ps && r != null ? r + sum(ps, (p) => (p.stl ?? 0) + (p.blk ?? 0)) : null; });
rule('MEN05', 'controles y libres', 'controles + fta', (rec) => { const d = dens(rec); const ps = players(rec); return d && ps ? sum(d, (x) => x.controls ?? 0) + sum(ps, (p) => p.fta ?? 0) : null; });
rule('MEN06', 'segundos de juego vivo', 'sum(exposure[].liveTenths)/10 (el momento evoluciona mientras se juega)', liveSec);
rule('MEN07', 'intentos de tiro en partido importante', 'fga si importance∈{important,decisive}; con importancia ordinaria devuelve null porque la presión tardía/ajustada por tramo no figura en el registro', (rec) => { const imp = g(rec, 'essential.identity.importance') ?? g(rec, 'identity.importance'); const a = zoneA(rec, ZONES); if (imp == null || a == null) return null; return imp === 'ordinary' ? null : a; });
// controles
for (const k of ['organizedPace', 'transition', 'elaboration', 'finishPreference', 'freedom', 'offensiveRisk', 'afterShot']) rule(`styles.${k}`, 'controles con nivel inicial ≠ 3', 'controles del equipo cuyo nivel INICIAL del estilo no es neutro (3); los cambios por órdenes/decisiones no se segmentan', (rec) => nonNeutral(rec, 'styles', k, 3, true));
for (const k of ['help', 'pressure', 'receivers', 'steal', 'protection']) rule(`defStyles.${k}`, 'controles rivales con nivel inicial ≠ 3', 'controles del rival cuando el estilo defensivo INICIAL no es neutro (3); cambios posteriores no segmentados', (rec) => nonNeutral(rec, 'defStyles', k, 3, false));
rule('midrange', 'intentos de media distancia con política no neutral', 'intentos midrange de equipos con política inicial avoid/seek (neutral=openOnly)', (rec) => { const pl = plansOf(rec); const ps = players(rec); if (!pl || !ps) return null; return sum(ps, (p) => (pl[p.team]?.midrange && pl[p.team].midrange !== 'openOnly' ? p.zones?.midrange?.[0] ?? 0 : 0)); });
rule('disposition', 'créditos de módulo DIS*', 'sum exposure[].modules[DIS*] (finalizaciones ponderadas)', (rec) => moduleSum(rec, /^DIS/));
rule('functions.availability', 'créditos de módulo DIS*', 'ídem disposition', (rec) => moduleSum(rec, /^DIS/));
rule('defense', 'finalizaciones rivales defendidas', 'analysis.defense[][].oppFinalizations', (rec) => { const d = g(rec, 'analysis.defense'); return Array.isArray(d) ? sum(d, (rows) => sum(rows ?? [], (r) => r.oppFinalizations ?? 0)) : null; });
rule('defense.ORG06', 'segundos con ORG06', 'segundos de tramos con organización ORG06 (rec.segments[].org)', (rec) => secBy(rec, (s, t) => s.org?.[t] === 'ORG06'));
rule('coverage', 'créditos de módulo COB*', 'sum exposure[].modules[COB*] (solo coberturas aplicables)', (rec) => moduleSum(rec, /^COB/));
rule('pressureHeight', 'segundos con altura de presión ≠ normal', 'tramos con pressureHeight del equipo defensor distinto de normal', (rec) => secBy(rec, (s, t) => s.pressureHeight?.[t] != null && s.pressureHeight[t] !== 'normal'));
rule('playbook.priority', 'finalizaciones de fichas con prioridad ≠ 3', 'fin de las familias con clave POSxx cuya prioridad inicial no es 3', (rec) => { const pl = plansOf(rec); const fs = g(rec, 'essential.families'); if (!pl || !Array.isArray(fs)) return null; return sum([0, 1], (t) => { const pri = Object.fromEntries((pl[t]?.playbook ?? []).map((e) => (typeof e === 'string' ? e.split(':') : [e.playId, e.priority]))); return sum(fs[t] ?? [], (f) => (pri[f.key] != null && Number(pri[f.key]) !== 3 ? f.fin ?? 0 : 0)); }); });
for (const f of SEED_FAMS) rule(`playbook.family.${f}`, 'finalizaciones de la familia', `fin de families con key de ${f} (fichas POS por catálogo)`, (rec) => famCount(rec, inFam([f]), 'fin'));
rule('playbook.continuations', 'continuaciones por rebote ofensivo', 'oreb de jugadores (cada rebote ofensivo abre continuación); las CONTxx de ficha no existen en SIM', (rec) => { const ps = players(rec); return ps ? sum(ps, (p) => p.oreb ?? 0) : null; });
rule('coach.policy', 'cambios de quinteto', 'sum(max(0,intervalos−1)) de rec.quintets por equipo: proxy de rotación (las sustituciones no figuran)', (rec) => { const q = rec?.quintets; if (!Array.isArray(q)) return null; const by = {}; for (const x of q) by[x.team] = (by[x.team] ?? 0) + (x.intervals?.length ?? 1); return sum(Object.values(by), (n) => Math.max(0, n - 1)); });
rule('coach.adjustments', 'decisiones del entrenador automático', 'rec.decisions.length', (rec) => (Array.isArray(rec?.decisions) ? rec.decisions.length : null));
rule('orders.manual', 'órdenes manuales aplicadas', 'analysis.orders con source manual', (rec) => { const o = orders(rec); return Array.isArray(o) ? o.filter((x) => (x.source ?? 'manual') === 'manual').length : null; });
rule('offensiveRoles', 'segundos con rol ofensivo declarado', 'sum exposure[].offensiveRoles /10', (rec) => { const e = expo(rec); return e ? sum(Object.values(e), (x) => sum(Object.values(x.offensiveRoles ?? {}), (v) => v)) / 10 : null; });
rule('defense.roles', 'segundos con rol defensivo declarado', 'sum exposure[].defensiveRoles /10', (rec) => { const e = expo(rec); return e ? sum(Object.values(e), (x) => sum(Object.values(x.defensiveRoles ?? {}), (v) => v)) / 10 : null; });
rule('directorPriority', 'segundos con director efectivo', 'sum de rec.director[][] (end−start); null si el registro no lo trae', (rec) => (Array.isArray(rec?.director) ? sum(rec.director, (arr) => sum(arr, (x) => x.end - x.start)) : null));
for (const id of ['marks', 'navigation', 'specials', 'throwInBook']) rule(id, 'no ejercitable', 'no representado en SIM: no hay operación que lo consuma (0 por construcción, no «validado»)', () => 0);
rule('context.importance', 'controles en partido importante', 'controles si importance∈{important,decisive}; 0 si ordinary', (rec) => { const imp = g(rec, 'essential.identity.importance') ?? g(rec, 'identity.importance'); const d = dens(rec); if (imp == null || !d) return null; return imp === 'ordinary' ? 0 : sum(d, (x) => x.controls ?? 0); });
rule('context.clockMargin', 'tramos finales', 'reloj/margen por tramo no figuran en el registro de campaña (solo inicio/fin de tramo)', () => null);
rule('energy', 'puntos de energía consumidos', 'sum(energía inicial − energía final) por jugador (rec.states0/statesEnd); negativo=recuperación neta', (rec) => { const a = states0(rec); const b = statesEnd(rec); if (!a || !b) return null; const e1 = Object.fromEntries(b.map((x) => [x.id, x.energy ?? x])); let s = 0; for (const x of a) { if (e1[x.id] == null || typeof e1[x.id] !== 'number') return null; s += (x.energy ?? 0) - e1[x.id]; } return s; });
rule('form', 'segundos vivos con Forma ≠ 0', 'liveTenths/10 de jugadores con state.form inicial distinto de 0', (rec) => { const a = states0(rec); const e = expo(rec); if (!a || !e) return null; return sum(a.filter((x) => (x.form ?? 0) !== 0), (x) => (e[x.id]?.liveTenths ?? 0)) / 10; });
rule('moment.individual', 'segundos vivos con momento inicial ≠ 0', 'liveTenths/10 de jugadores con M_TIR/M_OFE/M_DEF inicial distinto de 0 (el momento evoluciona; solo se conserva el inicial y el final)', (rec) => { const a = states0(rec); const e = expo(rec); if (!a || !e) return null; return sum(a.filter((x) => x.M_TIR || x.M_OFE || x.M_DEF), (x) => (e[x.id]?.liveTenths ?? 0)) / 10; });
rule('moment.team', 'controles con momento colectivo inicial ≠ 0', 'controles de equipos con plans[].initialTeamMoment ≠ 0', (rec) => { const pl = plansOf(rec); const d = dens(rec); if (!pl || !d) return null; return sum([0, 1], (t) => ((pl[t]?.initialTeamMoment ?? 0) !== 0 ? d[t]?.controls ?? 0 : 0)); });
rule('familiarity.module.press', 'oportunidades de avance presionado con conocimiento explícito', 'essential.pressOps.explicitOpportunities (controles publicados bajo presión adelantada con la capa de familiaridad activa)', (rec) => { const p = g(rec, 'essential.pressOps'); return p ? sum(p.explicitOpportunities ?? [0, 0], (x) => x) : null; });
for (const k of ['position', 'role', 'module']) rule(`familiarity.${k}`, 'no instrumentado', 'el registro no conserva si el conocimiento de entrada era explícito (knowledge.mode); sin él no se sabe si la familiaridad actuó: null, no 0', () => null);
export const exposureRules = Object.freeze(rules); export const exposureMeta = Object.freeze(meta);
void nonNull;

// ---------------------------------------------------------------------------------------------------------------------------- salida
const CSV_A = ['situacion', 'situacion_nombre', 'base_id', 'base_huella', 'codigo', 'nombre', 'grupo', 'unidad', 'pertinente', 'motivo_no_pertinencia', 'participante_id', 'participante_equipo', 'participante_rol', 'participante_grupo', 'nivel_base', 'cambio_solicitado', 'cambio_aplicado', 'limite_alcanzado', 'tope_parcial',
  'operacion', 'consumidores', 'operandos', 'peso_formula', 'parametros', 'tarea_deportiva', 'metricas_observables', 'contexto', 'modulos_conocimiento', 'plan', 'participantes', 'variables_previas_n', 'n_cambian', 'n_suben', 'n_bajan', 'pertinentes_cambian', 'magnitudes_pertinentes', 'magnitudes_principales', 'compensacion', 'evidence', 'causa_sin_efecto', 'limitaciones_instrumento'];
const CSV_B = ['id', 'grupo', 'etiqueta', 'estado', 'productor', 'efecto_previo', 'n_magnitudes', 'magnitudes_cambian', 'contraste', 'sonda_efecto', 'parametros', 'base_id', 'base_huella', 'exposicion_regla', 'exposicion_unidad', 'exposicion_nota', 'exposicion_A', 'exposicion_B', 'exposicion_C', 'muestra', 'limitacion'];
const cell = (x) => { if (x == null) return ''; const s = typeof x === 'string' ? x : typeof x === 'number' || typeof x === 'boolean' ? String(x) : JSON.stringify(x); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const toCsv = (rows, cols) => `${[cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n')}\n`;
export function capabilityCsvRows(rows) {
  return rows.map((r) => ({ ...r, variables_previas_n: r.variables_previas.length, magnitudes_pertinentes: r.cambios.filter((x) => CAPABILITIES.find((c) => c.id === r.codigo).expect.test(x.key)).slice(0, 8).map((x) => `${x.key}:${x.base}>${x.after}`).join(';'),
    magnitudes_principales: r.cambios.slice().sort((a, b) => rel(b) - rel(a)).slice(0, 6).map((x) => `${x.key}:${x.base}>${x.after}`).join(';'), compensacion: r.compensacion.map((x) => `${x.key}:${x.base}>${x.after}`).join(';'),
    operandos: r.operandos.join(' | '), parametros: r.parametros.map((p) => (p.resolved ? `${p.path}=${JSON.stringify(p.value)}` : `${p.path}=NO_RESUELVE(${p.motivo})`)).join(' | '), limitaciones_instrumento: r.limitaciones_instrumento.map((u) => `${u.operando} [${u.lugar}]`).join(' | ') }));
}
export function controlCsvRows(rows) { return rows.map((r) => ({ ...r, magnitudes_cambian: r.magnitudes_cambian.slice(0, 40).join(';'), contraste: r.contraste.map((c) => `${c.variante}→${c.n_cambian}${c.principales.length ? `[${c.principales.slice(0, 3).map((x) => (typeof x === 'string' ? x : `${x.key}:${x.base}>${x.after}`)).join(';')}]` : ''}`).join(' | '), parametros: (r.parametros ?? []).join(' | ') })); }
export function writeProducts(outDir, cap, ctl) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, '09a-capacidades.csv'), toCsv(capabilityCsvRows(cap.rows), CSV_A), 'utf8'); writeFileSync(join(outDir, '09b-controles.csv'), toCsv(controlCsvRows(ctl.rows), CSV_B), 'utf8');
  writeFileSync(join(outDir, '09-capacidades-y-controles.json'), JSON.stringify({ schema: PROBES_SCHEMA, nota: 'Magnitudes previas al sorteo (sin azar). Un tope 30 se registra como cambio aplicado parcial. exposicion_A/B/C quedan «pendiente_de_campaña» hasta aplicar exposureRules a los registros.', capacidades: cap, controles: ctl, exposicion: { reglas: Object.keys(exposureRules), meta: exposureMeta } }), 'utf8');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv.find((a) => a.startsWith('--out=')); const out = arg ? arg.slice(6) : join(ROOT, 'out/sim03-probes'); const t0 = Date.now();
  const { profile, players: csv } = loadData(); const ctx = makeContext(profile);
  const cap = buildCapabilityMatrix({ ctx, profile, players: csv }); const ctl = buildControlCoverage({ ctx, profile, players: csv }); writeProducts(out, cap, ctl);
  console.log(JSON.stringify({ out, filasCapacidades: cap.rows.length, bases: cap.bases.length, filasControles: ctl.rows.length, ms: Date.now() - t0 }));
}
