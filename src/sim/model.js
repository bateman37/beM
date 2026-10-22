// Magnitudes estadísticas del tramo (SIM-MOTOR-01 §5–6): traducen las recetas, tablas y estilos del perfil SIM a distribuciones por equipo, zona, familia y participante.
// Todo es PURO (sin azar, sin estado de partido): lo usan el generador y el contraste de las 32 capacidades. Una capacidad solo cuenta como usada si cambia una magnitud de este módulo.
import { sigmoid, logit, interpolate, a01, clamp } from '../match/mathx.js';
import { ATTR_INDEX, compileRecipe } from './profile.js';
import { perturbBinary, perturbCategories, qualityDistributionPure, pressureLossLogit, mixResolution, looseControlP, blockResolution, reboundTeamResolution, familiarityActor, familiaritySide, familiarityDelta } from '../match/formulas.js';

export const ZONES = ['rim', 'inside', 'midrange', 'three'];
const QUALS = ['comfortable', 'normal', 'forced'];
export const QUAL_KEYS = QUALS;
const lvl = (m, key) => { const e = m?.[key]; return e && typeof e.level === 'number' ? e.level : null; };
const explicit = (k) => k != null && k.mode === 'explicit';

// ------------------------------------------------------------------------------------------------------------------------------ capacidades efectivas
export const severity = (S, energy) => interpolate(S.energy.severityNodes, energy);
const IDX = ATTR_INDEX;
export function ea(S, pl, attr, cap) { const v = pl.abv[IDX[attr]] - pl.sev * cap; return v < 1 ? 1 : v; }
const capAttr = (S, attr) => (attr.startsWith('FIS') ? S.energy.defaultPhysicalTaskMax : S.energy.defaultTechnicalTaskMax);
const adhoc = new WeakMap();
export function recipe(S, pl, rec, capOverride = null) {
  let c = rec.$c; if (!c) { c = adhoc.get(rec); if (!c) { c = compileRecipe(S, rec); adhoc.set(rec, c); } }
  const sev = pl.sev; const abv = pl.abv; let s = 0;
  if (capOverride === null) for (let i = 0; i < c.n; i++) { const v = abv[c.idx[i]] - sev * c.cap[i]; s += c.w[i] * (v < 1 ? 1 : v); }
  else for (let i = 0; i < c.n; i++) { const v = abv[c.idx[i]] - sev * capOverride; s += c.w[i] * (v < 1 ? 1 : v); }
  return s;
}
// Receta de tarea para un solo actor: [[rol, atributo, peso]] restringido al rol pedido (agrupada al compilar el perfil).
export function taskFor(S, tid, side, role, pl) { const t = S.tasks[tid]; const e = t.$c[side][role]; if (!e) return S.neutralAbility; const cap = t.maxEnergyPenalty; const sev = pl.sev; const abv = pl.abv; let s = 0; for (let i = 0; i < e.idx.length; i++) { const v = abv[e.idx[i]] - sev * cap; s += e.w[i] * (v < 1 ? 1 : v); } return s / e.sw; }
const mean = (xs) => { let s = 0; for (const x of xs) s += x; return xs.length ? s / xs.length : 0; };
const reachOf = (S, pl) => { const b = S.body; const hn = (pl.height - b.heightRangeCm[0]) / (b.heightRangeCm[1] - b.heightRangeCm[0]); const wn = (pl.wingspan - b.wingspanRangeCm[0]) / (b.wingspanRangeCm[1] - b.wingspanRangeCm[0]); return clamp(b.normalizedMix[0] * hn + b.normalizedMix[1] * wn, 0, 1); };

// ------------------------------------------------------------------------------------------------------------------------------ vista del equipo en pista
// `side`: { plan, onCourt: [{slot, pl}], cache }. Calcula director, pools por grupo de participantes y reparto defensivo por organización.
export function lineupView(S, T, side) {
  const lu = side.onCourt; const bySlot = {}; for (const e of lu) bySlot[e.slot] = e.pl;
  const ids = new Set(lu.map((e) => e.pl.id));
  let director = null; for (const id of side.plan.directorPriority ?? []) if (ids.has(id)) { director = lu.find((e) => e.pl.id === id).pl; break; }
  if (!director) director = bySlot.PG ?? lu[0].pl;
  const pools = {}; for (const [g, slots] of Object.entries(T.participantSlots)) pools[g] = lu.filter((e) => slots.includes(e.slot)).map((e) => e.pl);
  return { lu, players: lu.map((e) => e.pl), bySlot, director, pools };
}

// Reparto defensivo: asigna jugadores a funciones por adecuación (interior primero) y devuelve, por área, quién protege primero. `attFns` = funciones del ataque rival (organización individual).
export function defenseAssignment(S, T, defSide, defView, attView, attPlan) {
  const plan = defSide.plan; let orgId = plan.defense; let boxTarget = null;
  if (orgId === 'ORG06') {
    const att = attView.players; const pick = (id) => att.find((p) => p.id === id) ?? null;
    boxTarget = pick(plan.target) ?? pick(plan.targetAlt);
    if (!boxTarget) orgId = plan.fallbackOrg ?? 'ORG02';
  }
  const org = T.organizations[orgId]; const asg = S.defense.assignment; const players = defView.players.slice();
  const fits = { perimeterFit: asg.perimeterFit, interiorFit: asg.interiorFit, screenPursuitFit: asg.screenPursuitFit, helpRecoveryFit: asg.helpRecoveryFit };
  const fitVal = (pl, f) => recipe(S, pl, fits[f], S.energy.defaultTechnicalTaskMax);
  let fnList; // [{name, fit, tags}]
  if (org.kind === 'individual' || !org.functions) { const dis = T.dispositions[attPlan.disposition].functions; fnList = dis.map((n, i) => ({ name: `${n}#${i}`, area: n, fit: T.attackerFunctions[n].fit, tags: T.attackerFunctions[n].tags })); }
  else fnList = Object.entries(org.functions).map(([n, f]) => ({ name: n, area: null, fit: f.fit, tags: f.tags }));
  const order = ['interiorFit', 'screenPursuitFit', 'helpRecoveryFit', 'perimeterFit']; const sorted = fnList.slice().sort((a, b) => order.indexOf(a.fit) - order.indexOf(b.fit));
  const free = players.slice(); const who = {};
  if (boxTarget) { /* box and one: el mejor defensor perimetral marca al objetivo; el resto se organiza como ORG02 */ }
  for (const f of sorted) { let bi = 0; let bv = -1; for (let i = 0; i < free.length; i++) { const v = fitVal(free[i], f.fit); if (v > bv) { bv = v; bi = i; } } who[f.name] = free[bi]; free.splice(bi, 1); }
  const leftover = free; // jugadores sin función (lineup <5 solo en inferioridad: sobran funciones, no jugadores)
  const interior = (f) => f.fit === 'interiorFit';
  const byArea = {};
  const areaDefs = (area) => {
    if (byArea[area]) return byArea[area];
    let out = [];
    if (org.areas) { const spec = org.areas[area]; const specs = Array.isArray(spec) ? spec : spec ? [spec] : []; for (const sp of specs) { const p = who[sp.first]; if (p && !out.includes(p)) out.push(p); } }
    else { for (const f of fnList) if (f.area === area && who[f.name] && !out.includes(who[f.name])) out.push(who[f.name]); if (!out.length) { const wantInt = ['block', 'lowInside', 'inside', 'highInside'].includes(area); for (const f of fnList) if (interior(f) === wantInt && who[f.name] && !out.includes(who[f.name])) out.push(who[f.name]); } }
    if (!out.length) out = players.slice(0, 1); byArea[area] = out; return out;
  };
  const rimFns = fnList.filter((f) => f.tags.includes('rimProtect')); const rimDefs = []; for (const f of rimFns) if (who[f.name] && !rimDefs.includes(who[f.name])) rimDefs.push(who[f.name]);
  const interiorDefs = []; const perimeterDefs = []; for (const f of fnList) { const p = who[f.name]; if (!p) continue; (interior(f) ? interiorDefs : perimeterDefs).push(p); }
  for (const p of leftover) perimeterDefs.push(p);
  return { orgId, org, who, areaDefs, rimDefs: rimDefs.length ? rimDefs : interiorDefs.slice(0, 1), interiorDefs, perimeterDefs, boxTarget, fnList };
}

// ------------------------------------------------------------------------------------------------------------------------------ presión, forma y momentos
export function pressureLevel(S, importance, period, secondsLeft, margin) {
  const imp = S.pressure.importance[importance]; const pw = S.pressure.periodTensionWeight;
  const w = period >= 4 ? pw.Q4_OT : pw.Q1_Q2_Q3; const lateF = Math.max(0, 1 - secondsLeft / S.pressure.latePeriodWindowSeconds); const closeF = Math.max(0, 1 - Math.abs(margin) / S.pressure.closeMarginPoints);
  return Math.max(imp, w * lateF * closeF);
}

// ------------------------------------------------------------------------------------------------------------------------------ plan: parte estática (por plan) y dinámica (por tramo)
// Celdas de finalización de las fichas del libro: una por (ficha, salida, zona). Estática por plan: se cachea en `plan._c`.
export function compilePlan(S, T, plan) {
  if (plan._c && plan._c.src === JSON.stringify([plan.playbook, plan.disposition])) return plan._c;
  const disFns = T.dispositions[plan.disposition].functions; const cells = []; const plays = []; const merged = new Map();
  for (const e of plan.playbook) {
    const pl = T.plays[e.playId]; let ok = true;
    for (const [r, d] of Object.entries(pl.roles)) { if (d.opt || d.src !== 'pool' || d.fn === 'any') continue; if (!d.fn.some((f) => disFns.includes(f))) ok = false; }
    const pi = plays.length; plays.push({ id: pl.id, family: pl.family, priority: e.priority, available: ok, play: pl, coach: ok ? S.selection.priorityWeights[e.priority - 1] : 0 });
    for (const ex of pl.exits) {
      const zs = ex.zones.filter((z) => ZONES.includes(z)); if (!zs.length) continue;
      for (const z of zs) {
        const moved = !!ex.moved?.includes(z); const pullup = !!ex.pullupK?.includes(z); const roller = !!ex.rollerK; const key = `${pi}|${ex.role}|${z}|${ex.exec}|${moved}|${pullup}|${roller}`; const share = ex.weightShare / zs.length;
        const prev = merged.get(key); if (prev) prev.share += share; else { const c = { pi, playId: pl.id, family: pl.family, role: ex.role, zone: z, exec: ex.exec, moved, defend: ex.defend, share, pullup, roller, label: ex.label ?? null }; merged.set(key, c); cells.push(c); }
      }
    }
  }
  const gids = new Map(); for (const c of cells) { const k = `${c.pi}|${c.role}|${c.zone}`; if (!gids.has(k)) gids.set(k, gids.size); c.gid = gids.get(k); }
  // objetos de celda reutilizables (se reescriben en cada tramo); transición y espontáneo solo con zonas posibles
  const cellObjs = cells.map((c, ci) => ({ kind: 'play', ci, cell: c, w: 0, q: null }));
  const mkPseudo = (kind, family) => ZONES.map((z) => ({ kind, cell: { zone: z, family, role: 'handler', exec: 'auto', moved: false, passShare: 0, movedShare: 0 }, w: 0, q: null }));
  const trans = mkPseudo('trans', 'transition'); const spont = mkPseudo('spont', 'spontaneous');
  plays.forEach((p) => { p.receiverFamily = ['handoff', 'off_ball_screen', 'give_and_go'].includes(p.family); });
  plan._c = { src: JSON.stringify([plan.playbook, plan.disposition]), cells, plays, cellObjs, trans, spont, all: [...cellObjs, ...trans, ...spont] };
  return plan._c;
}

// Pools de rol de una ficha: devuelve [{pl, w}] con la plaza favorecida (rolePreference) frente al resto, sin prohibir por posición nominal. Memoizado por vista (tramo).
function rolePool(S, T, view, play, role) {
  const cache = viewCache(S, view); let byPlay = cache.pool.get(play.id); if (!byPlay) { byPlay = new Map(); cache.pool.set(play.id, byPlay); } const hit = byPlay.get(role); if (hit) return hit;
  const d = play.roles[role]; let out;
  if (!d) out = view.players.map((pl) => ({ pl, w: 1 }));
  else if (d.src === 'director') out = [{ pl: view.director, w: 1 }];
  else { const fav = d.slotGroup ? T.participantSlots[d.slotGroup] ?? [] : []; const rp = S.selection.rolePreference; out = view.lu.filter((e) => e.pl !== view.director || d.src !== 'pool' || role === 'handler').map((e) => ({ pl: e.pl, w: fav.includes(e.slot) ? rp.favoredFunctionWeight : rp.otherFunctionWeight })); }
  byPlay.set(role, out); return out;
}
// Caché por tramo y equipo: capacidad de ataque por zona y adecuación de cada jugador como finalizador (receta + vocación + iniciativa).
function viewCache(S, view) {
  if (view.cache) return view.cache;
  const tech = S.energy.defaultTechnicalTaskMax; const sel = S.selection; const idx = new Map(view.players.map((p, i) => [p, i])); const A = {}; const fit = {};
  for (const z of ZONES) { const sh = S.shots[z]; A[z] = view.players.map((p) => recipe(S, p, sh.attack, tech)); fit[z] = view.players.map((p, i) => abilityFit(S, A[z][i]) * (sel.finishingVocationMix[0] + sel.finishingVocationMix[1] * p.voc) * (sel.initiativeMix[0] + sel.initiativeMix[1] * p.init)); }
  view.cache = { idx, A, fit, pool: new Map(), fw: new Map(), fwG: [] }; return view.cache;
}
const attrOfZone = (S, z) => Object.keys(S.shots[z].attack)[0];
const abilityFit = (S, x) => { const f = S.selection.abilityFit; return Math.min(f.max, Math.max(f.min, 1 + f.slope * (x - S.neutralAbility))); };

const vcA = (S, view, zone) => { const vc = viewCache(S, view); if (!vc.Am) vc.Am = {}; if (!vc.Am[zone]) { const mp = new Map(); view.players.forEach((p, i) => mp.set(p, vc.A[zone][i])); vc.Am[zone] = mp; } return vc.Am[zone]; };
// Valor de capacidad de un grupo de jugadores [{pl,w}] para una receta [[rol, atributo, peso]] filtrada por rol→grupo.
function recipeByRoleGroups(S, rec, groupOf, cap) { let s = 0; for (const [r, a, w] of rec) { const g = groupOf(r); let t = 0; let ws = 0; for (const x of g) { t += x.w * ea(S, x.pl, a, cap); ws += x.w; } s += w * (ws > 0 ? t / ws : S.neutralAbility); } return s; }

// ------------------------------------------------------------------------------------------------------------------------------ modelo de un equipo que ataca en el tramo
// st: estado de partido (S, T, jugadores, etc.); k: equipo atacante; ctx: { period, secondsLeft, margin, importance }.
export function attackModel(S, T, sides, k, ctx) {
  const A = sides[k]; const D = sides[1 - k]; const av = A.view; const dv = D.view; const da = D.assign;
  const N = S.neutralAbility; const O = S.outcomes; const sty = A.plan.styles; const dst = D.plan.defStyles;
  const M = { k, flags: {} };
  const lvlA = (key) => sty[key] - 1;
  // ---- presión / forma / momentos (contexto conocido en la frontera)
  const Pr = pressureLevel(S, ctx.importance, ctx.period, ctx.secondsLeft, ctx.margin); M.pressure = Pr;
  const fAvg = mean(av.players.map((p) => p.form)); const fDef = mean(dv.players.map((p) => p.form));
  const mAvg = (key, v) => mean(v.players.map((p) => p.M[key]));
  // ---- estilos defensivos del rival
  const dlev = (k2) => dst[k2] - 1;
  const closeOR = S.defense.styles.closePressureChoiceOddsRatio[dlev('pressure')]; const p0c = S.defense.choiceReferences.closePressureChoiceP0;
  const pClose = sigmoid(logit(p0c) + Math.log(closeOR)); M.pClose = pClose;
  const denyOR = S.defense.styles.receiverDenialChoiceOddsRatio[dlev('receivers')]; const pDeny = sigmoid(logit(S.defense.choiceReferences.receiverDenialChoiceP0) + Math.log(denyOR)); M.pDeny = pDeny;
  const stealOR = S.defense.styles.stealAttemptChoiceOddsRatio[dlev('steal')]; const p0s = S.defense.choiceReferences.stealAttemptGivenAccessP0; const pAtt = sigmoid(logit(p0s) + Math.log(stealOR)); M.pStealAttempt = pAtt;
  const helpOR = S.defense.styles.additionalHelpOddsRatio[dlev('help')]; const pHelp = sigmoid(logit(S.opportunity.helpProbability) + Math.log(helpOR)); M.pHelp = pHelp;
  const wIn = S.defense.styles.interiorProtectionChoiceWeight[dlev('protection')]; const wOut = S.defense.styles.exteriorProtectionChoiceWeight[dlev('protection')]; M.protect = { inside: wIn, outside: wOut };
  const height = D.plan.pressureHeight; const pressFx = height !== 'normal';
  // ---- control, pérdidas y faltas por control (transformación a universo «por control», ver nota técnica)
  const OffC = mean(av.players.map((p) => taskFor(S, 'TAR06', 'attack', 'handler', p)));
  const DefC = mean(dv.players.map((p) => taskFor(S, 'TAR06', 'defense', 'primary', p)));
  const DefSteal = mean(dv.players.map((p) => taskFor(S, 'TAR07', 'defense', 'interceptor', p)));
  M.OffC = OffC; M.DefC = DefC;
  const lg = S.contact; const legalDef = mean(da.interiorDefs.concat(da.perimeterDefs).map((p, i) => { const interior = i < da.interiorDefs.length; return lg.defensiveLegality.defenseTechnique * ea(S, p, interior ? 'TEC13' : 'TEC12', lg.maximumEnergyPenalty) + lg.defensiveLegality.MEN04 * ea(S, p, 'MEN04', lg.maximumEnergyPenalty) + lg.defensiveLegality.MEN05 * ea(S, p, 'MEN05', lg.maximumEnergyPenalty); }));
  const legalOff = mean(av.players.map((p) => lg.offensiveLegality.actionTechnique * ea(S, p, 'TEC07', lg.maximumEnergyPenalty) + lg.offensiveLegality.FIS04 * ea(S, p, 'FIS04', lg.maximumEnergyPenalty) + lg.offensiveLegality.FIS07 * ea(S, p, 'FIS07', lg.maximumEnergyPenalty)));
  M.legalDef = legalDef; M.legalOff = legalOff;
  const zTo = O.controlSensitivity * (DefC - OffC); const zFoulD = O.defensiveFoulSensitivity * (N - legalDef); const zFoulO = O.offensiveFoulSensitivity * (N - legalOff);
  const base = O.base;
  const stealShare = O.stealGivenTurnover;
  let wTo = base.turnover * Math.exp(zTo) * (1 - stealShare + stealShare * pAtt / p0s);
  const pFoulStyle = 1 + (pAtt - p0s) + (pClose - p0c); // riesgo de robo y presión cercana aumentan también las faltas defensivas
  let wDn = base.defensiveNonShootingFoul * Math.exp(zFoulD) * pFoulStyle; let wSf = base.shootingFoul * Math.exp(zFoulD) * pFoulStyle;
  wTo *= 1 + (pClose - p0c); // presión al balón: más pérdidas, compensada por más faltas defensivas y mejor calidad cuando el avance se supera
  if (pressFx) { const pw = S.defense.pressure.newAdvancedInteractionBaseWeights; wTo += pw.turnover * closeOR; wDn += pw.contact; M.flags.pressed = true; }
  const contest = mean(av.players.map((p) => taskFor(S, 'TAR17', 'attack', 'contender', p))); const contestD = mean(dv.players.map((p) => taskFor(S, 'TAR17', 'attack', 'contender', p)));
  const pLooseKeep = looseControlP(S, contest, contestD); const wLb = base.looseBall * (1 - pLooseKeep);
  const wOf = base.offensiveFoul * Math.exp(zFoulO); const wBv = base.ballViolation; const wFs = base.fieldShot;
  // forma y presión sobre el control (acotado)
  const pl3 = av.players; const pressLossCtl = mean(pl3.map((p) => pressureLossLogit(S, 'offensiveControl', Pr, ea(S, p, 'MEN07', 0))));
  const fpCtl = clamp(S.form.taskMaxLogit.offensiveControl * (fAvg - 0) - S.form.taskMaxLogit.defenseDispute * fDef * 0 - pressLossCtl, ...S.pressure.combinedFormPressureLogitBounds);
  M.fpCtl = fpCtl; wTo *= Math.exp(-fpCtl);
  const terminal = [wTo, wOf, wBv, wSf, wFs, wLb]; const tTot = terminal.reduce((a, b) => a + b, 0);
  let probs = { to: wTo / tTot, of: wOf / tTot, bv: wBv / tTot, sf: wSf / tTot, fs: wFs / tTot, lb: wLb / tTot };
  const Zc = 0.5 * mean(av.players.map((p) => p.M.OFE)) - 0.5 * mAvg('DEF', dv); const ZcT = S.moment.individualCollectiveMixture.individual * Zc;
  probs = perturbCategories(probs, ['fs', 'sf'], ZcT, S.moment.probabilityAlphaByTask.offensiveControl);
  M.term = probs; M.termOrder = ['to', 'of', 'bv', 'sf', 'fs', 'lb']; M.dnRatio = wDn / tTot;
  // ---- robo dentro de pérdidas elegibles
  M.pSteal = sigmoid(logit(stealShare) + O.controlSensitivity * (DefSteal - N)); M.pStealOob = S.outcomes.turnoverOutOfBoundsIfNotSteal;
  M.stealW = dv.players.map((p) => Math.max(0.01, taskFor(S, 'TAR07', 'defense', 'interceptor', p) / N));
  M.toW = av.players.map((p) => Math.max(0.05, 1 / Math.max(1, taskFor(S, 'TAR06', 'attack', 'handler', p)) * N) * (0.5 + p.init));
  M.ofW = av.players.map((p) => Math.exp(O.offensiveFoulSensitivity * (N - (lg.offensiveLegality.actionTechnique * ea(S, p, 'TEC07', 4) + lg.offensiveLegality.FIS04 * ea(S, p, 'FIS04', 4) + lg.offensiveLegality.FIS07 * ea(S, p, 'FIS07', 4)))));
  M.dnW = dv.players.map((p) => Math.exp(O.defensiveFoulSensitivity * (N - (lg.defensiveLegality.defenseTechnique * ea(S, p, da.interiorDefs.includes(p) ? 'TEC13' : 'TEC12', 4) + lg.defensiveLegality.MEN04 * ea(S, p, 'MEN04', 4) + lg.defensiveLegality.MEN05 * ea(S, p, 'MEN05', 4)))));
  // ---- ritmo: composición del ataque (organizado / transición / espontáneo) y tiempo esperado por control
  const L = S.selection.freedom[lvlA('freedom')]; const q = clamp((S.selection.readingMix.MEN02 * mean(av.players.map((p) => ea(S, p, 'MEN02', S.energy.defaultTechnicalTaskMax))) + S.selection.readingMix.MEN03 * mean(av.players.map((p) => ea(S, p, 'MEN03', S.energy.defaultTechnicalTaskMax))) - 1) / 29, 0, 1);
  M.L = L; M.q = q;
  const dr = S.selection.direct; const accept = Math.min(1, Math.max(0, (dr.acceptanceFloor + L) * q));
  const crash = S.rebound.offensiveReboundAssignmentTarget; const unready = Math.pow(S.rebound.balance.unreadyReturnerOpportunityOddsRatio, crash[D.plan.styles.afterShot - 1] - crash[2]); // el rival que carga el rebote deja menos regresos: más oportunidad de transición
  const trOR = S.selection.transitionAttemptOddsRatio[lvlA('transition')] * unready; const scale = (p0) => sigmoid(logit(p0) + Math.log(trOR));
  M.attackScale = { steal: scale(dr.attemptAfterLiveSteal), drb: scale(dr.attemptAfterDefensiveRebound), accept };
  M.paceOrg = S.selection.organizedDurationFactor[lvlA('organizedPace')];
  M.heightAdvance = S.defense.pressure.advanceDurationFactorByHeight[height]; // la presión es del rival
  M.delayed = pressFx ? S.defense.pressure.newAdvancedInteractionBaseWeights.delayedAdvance * mean(S.defense.pressure.delayedAdvanceAdditionalSeconds) / S.volume.neutralSecondsPerControl : 0;
  return M;
}

// Completa el ritmo de ambos equipos (necesita los dos modelos): composición del ataque (transición/espontáneo) y segundos esperados por control.
// Origen de la transición del equipo k = robos y rebotes defensivos que le concede el rival; el fallo esperado usa la media de p0 de las cuatro zonas (aproximación declarada).
export function finishPace(S, models) {
  const pMiss = 1 - (S.shots.rim.p0 + S.shots.inside.p0 + S.shots.midrange.p0 + S.shots.three.p0) / 4;
  for (const k of [0, 1]) {
    const M = models[k]; const R = models[1 - k];
    const stealRate = (R.term.to + R.term.lb) * R.pSteal; const drbRate = R.term.fs * pMiss * (1 - S.rebound.fieldOffensiveP0);
    const pTr = stealRate * M.attackScale.steal + drbRate * M.attackScale.drb;
    const beaten = M.flags.pressed ? S.defense.pressure.newAdvancedInteractionBaseWeights.pressureBeaten : 0;
    M.tau = Math.min(0.6, pTr + beaten); M.sigma = (1 - M.tau) * M.attackScale.accept;
    const org = M.paceOrg * (1 + (M.heightAdvance - 1) * S.derived.advanceShareOfControl);
    M.paceFactor = (1 - M.tau) * org + M.tau * S.derived.transitionPaceFactor + M.delayed;
    M.secPerControl = clamp(S.volume.neutralSecondsPerControl * M.paceFactor, S.volume.secondsPerControlBounds[0], S.volume.secondsPerControlBounds[1]);
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ celdas de finalización (mezcla organizada + transición + espontáneo)
// Devuelve { cells:[{kind, w, zone, ...}], total } con pesos que suman 1 por equipo y por tramo.
export function shotCells(S, T, sides, k, M, ctx) {
  const A = sides[k]; const D = sides[1 - k]; const av = A.view; const dv = D.view; const da = D.assign; const plan = A.plan; const comp = compilePlan(S, T, plan);
  const N = S.neutralAbility; const styles = plan.styles; const tech = S.energy.defaultTechnicalTaskMax; const sel = S.selection;
  // calidad por ficha (una vez por ficha disponible)
  const grp = (xs) => xs.map((pl) => ({ pl, w: 1 })); const intGrp = grp(da.interiorDefs.length ? da.interiorDefs : da.rimDefs); const perGrp = grp(da.perimeterDefs.length ? da.perimeterDefs : dv.players);
  const defRolePlayers = (role) => (INTERIOR_DEF.has(role) ? intGrp : perGrp);
  const famCache = {}; const Zq0 = perturbBinaryZ(S, M, av, dv); const beaten = Math.log(S.defense.pressure.closePressureBeatenWeightFactor) * (M.pClose - S.defense.choiceReferences.closePressureChoiceP0) / S.defense.choiceReferences.closePressureChoiceP0;
  const nPlays = comp.plays.length; const qc = new Array(nPlays);
  for (let pi = 0; pi < nPlays; pi++) {
    const p = comp.plays[pi]; if (!p.available) continue;
    const caRaw = recipeByRoleGroups(S, p.play.qualityAttack, (r) => rolePool(S, T, av, p.play, r), tech);
    let cdRaw = recipeByRoleGroups(S, p.play.qualityDefense, defRolePlayers, tech);
    if (p.receiverFamily) cdRaw = N + (cdRaw - N) * 2 * M.pDeny; // negación de receptores: efecto proporcional a su elección (neutral en nivel 3)
    let extraZ = beaten; if (sides.fam) { const f = famQuality(S, T, A, D, p.family, comp, plan); extraZ += f; famCache[p.id] = f; }
    qc[pi] = qualityFast(S, caRaw, cdRaw, 0, extraZ, Zq0);
  }
  // pesos de opción (mezcla de entrenador, adaptación y preferencias; misma fórmula que mixResolution)
  const rEst = sel.candidateRead.opponentAbilityEstimate; const ctlPass = mean(av.players.map((p) => taskFor(S, 'TAR07', 'attack', 'passer', p))); const ob = S.outcomes.base.turnover; const cs = S.outcomes.controlSensitivity;
  const riskD = ob * Math.exp(cs * (rEst - M.OffC)); const riskP = ob * Math.exp(cs * (rEst - ctlPass)); const riskN = ob * Math.exp(cs * (rEst - N));
  const orientIn = sel.orientationInside[styles.finishPreference - 1]; const orientOut = sel.orientationThree[styles.finishPreference - 1]; const tilt = sel.offensiveRiskPreferenceTilt[styles.offensiveRisk - 1];
  const mp = plan.midrange; const mpPol = sel.midrangePolicy; const seekMid = mp === 'seek' ? mean(av.players.map((pl) => mpPol.suitablePlayerBase + mpPol.suitablePlayerAbilitySlope * a01(ea(S, pl, 'TEC02', tech)))) : 0;
  let psum = 0; for (const p of comp.plays) if (p.available) psum += p.coach;
  const nc = comp.cells.length; const cc = new Float64Array(nc); const pp = new Float64Array(nc); const aa = new Float64Array(nc); const rr = new Float64Array(nc); const md = new Float64Array(nc); const hasMid = new Uint8Array(nc);
  let sc = 0; let sp = 0; let sa = 0;
  for (let ci = 0; ci < nc; ci++) {
    const c = comp.cells[ci]; const p = comp.plays[c.pi]; if (!p.available) continue;
    const sh = S.shots[c.zone]; const qd = qc[c.pi];
    const fw = finisherWeights(S, T, av, p.play, c, plan); if (fw.pref === undefined) { let pf = 0; for (let i = 0; i < fw.length; i++) pf += fw[i].w; fw.pref = pf / Math.max(1, fw.length); fw.pEst = estP(S, sh, fw, N, false, vcA(S, av, c.zone)); }
    if (c.zone === 'midrange') { hasMid[ci] = 1; md[ci] = mp === 'avoid' ? mpPol.avoidWeight : mp === 'openOnly' ? qd.comfortable * mpPol.openOnlyComfortableWeight + (1 - qd.comfortable) * mpPol.openOnlyOtherWeight : seekMid; }
    const orient = c.zone === 'three' ? orientOut : (c.zone === 'rim' || c.zone === 'inside') ? orientIn : 1; const risk = c.exec === 'none' ? 0 : c.exec === 'dribble' ? riskD : c.exec === 'pass' ? riskP : riskN;
    const V = Math.max(sel.candidateRead.minimumUtility, sh.points * fw.pEst - sel.candidateRead.expectedTurnoverCostPoints * risk);
    cc[ci] = (p.coach / psum) * c.share * orient; pp[ci] = c.share * fw.pref; aa[ci] = c.share * V; rr[ci] = risk; sc += cc[ci]; sp += pp[ci]; sa += aa[ci];
  }
  const L = M.L; const q = M.q; const shareOrg = Math.max(0, 1 - M.tau - M.sigma); const cells = comp.cellObjs; let totalW = 0;
  for (let ci = 0; ci < nc; ci++) {
    const o = cells[ci]; const p = comp.plays[comp.cells[ci].pi]; if (!p.available) { o.w = 0; o.q = null; continue; }
    const pa = sa > 0 ? aa[ci] / sa : 0; const ppr = sp > 0 ? pp[ci] / sp : 0; const pj = q * pa + (1 - q) * ppr; let w = sc > 0 ? (1 - L) * (cc[ci] / sc) + L * pj : pj;
    if (tilt !== 0) w *= Math.exp(tilt * rr[ci]); if (hasMid[ci]) w *= md[ci]; o.w = w; o.q = qc[comp.cells[ci].pi]; totalW += w;
  }
  for (let ci = 0; ci < nc; ci++) cells[ci].w = totalW > 0 ? (cells[ci].w / totalW) * shareOrg : 0;
  // transición (zonas ESP de llegada, pase y movimiento derivados) y decisiones espontáneas (preferencias de los jugadores)
  const tz = S.derived.transition.zoneWeights; const trq = transitionQuality(S, T, sides, k, M); const spz = spontaneousZones(S, T, av, plan, M); const spq = spontaneousQuality(S, T, sides, k, M);
  for (const o of comp.trans) { o.w = M.tau * tz[o.cell.zone]; o.q = trq; o.cell.passShare = S.derived.transition.passShare; o.cell.movedShare = S.derived.transition.movedShare; }
  for (const o of comp.spont) { o.w = M.sigma * spz[o.cell.zone]; o.q = spq; o.cell.passShare = S.derived.spontaneous.passShare; o.cell.movedShare = S.derived.spontaneous.movedShare; }
  const all = comp.all; let tw = 0; for (let i = 0; i < all.length; i++) tw += all[i].w; if (tw > 0) for (let i = 0; i < all.length; i++) all[i].w /= tw;
  // protección del tiro rival: desplaza la mezcla entre interior y exterior (peso de elección ↑ ⇒ menos intentos en esa zona)
  tw = 0; for (let i = 0; i < all.length; i++) { const z = all[i].cell.zone; all[i].w *= (z === 'rim' || z === 'inside') ? 1 / M.protect.inside : z === 'three' ? 1 / M.protect.outside : 1; tw += all[i].w; }
  for (let i = 0; i < all.length; i++) all[i].w /= tw;
  M.famQuality = famCache;
  return all;
}
const INTERIOR_DEF = new Set(['screenMarker', 'postMarker', 'lowMarker', 'shortMarker', 'hubMarker']);
// Calidad previa de la oportunidad con el momento colectivo/individual ya aplicado: misma aritmética que `qualityDistributionPure` + `perturbCategories` (grupo favorable = «cómoda»), sin objetos intermedios.
function qualityFast(S, ca, cd, kctx, extraZ, Z) {
  const opp = S.opportunity; const kc = Math.min(opp.maximumQualityContextLogit, Math.max(-opp.maximumQualityContextLogit, kctx)); const z = opp.advantageSensitivity * (ca - cd) + kc + extraZ; const b = opp.qualityBase;
  const wc = b.comfortable * Math.exp(z); const wn = b.normal; const wf = b.forced * Math.exp(-z); const tot = wc + wn + wf; let pc = wc / tot; let pn = wn / tot; let pf = wf / tot;
  if (Z !== 0) { const a = S.moment.probabilityAlphaByTask.coordination * Z; const PG = pc; pc += a * pc * (1 - PG); pn -= a * pn * PG; pf -= a * pf * PG; }
  return { comfortable: pc, normal: pn, forced: pf };
}
const perturbBinaryZ = (S, M, av, dv) => { const m = S.moment; const Z = m.individualCollectiveMixture.individual * (0.5 * mean(av.players.map((p) => p.M.OFE)) - 0.5 * mean(dv.players.map((p) => p.M.DEF))) + m.individualCollectiveMixture.team * (av.teamT ?? 0); return clamp(Z, -1, 1); };

// Misma fórmula que `mixResolution` (src/match/formulas.js) sin el desglose diagnóstico: p = (1−L)·entrenador + L·(q·adaptación + (1−q)·preferencias), por riesgo y media distancia.
function mixWeights(items, L, q, tilt) {
  let sc = 0; let sp = 0; let sa = 0; for (const i of items) { sc += i.coach ?? 0; sp += i.pref ?? 0; sa += i.adapt ?? 0; }
  const hasCoach = sc > 0; const out = new Array(items.length);
  for (let k = 0; k < items.length; k++) { const it = items[k]; const pa = sa > 0 ? it.adapt / sa : 0; const pp = sp > 0 ? it.pref / sp : 0; const pj = q * pa + (1 - q) * pp; let p = hasCoach ? (1 - L) * (it.coach / sc) + L * pj : pj; if (it.risk != null && tilt !== 0) p *= Math.exp(tilt * it.risk); if (it.mid != null) p *= it.mid; out[k] = { w: p }; }
  return out;
}
// Peso de cada jugador como finalizador de una celda: favorecido por rol, adecuación de capacidad, vocación e iniciativa. Memoizado por (ficha, rol, zona) dentro del tramo.
export function finisherWeights(S, T, view, play, c, plan) {
  const vc = viewCache(S, view);
  if (c.gid !== undefined && play) { const hit = vc.fwG[c.gid]; if (hit) return hit; }
  else { const pid = play ? play.id : '*'; let byPlay = vc.fw.get(pid); if (!byPlay) { byPlay = new Map(); vc.fw.set(pid, byPlay); } const rz = c.rz ?? (c.rz = `${c.role}|${c.zone}`); const hit = byPlay.get(rz); if (hit) return hit; const out = buildFw(S, T, view, vc, play, c); byPlay.set(rz, out); return out; }
  const out = buildFw(S, T, view, vc, play, c); vc.fwG[c.gid] = out; return out;
}
function buildFw(S, T, view, vc, play, c) { const pool = play ? rolePool(S, T, view, play, c.role) : view.players.map((pl) => ({ pl, w: 1 })); const fit = vc.fit[c.zone]; const out = new Array(pool.length); for (let i = 0; i < pool.length; i++) out[i] = { pl: pool[i].pl, w: pool[i].w * fit[vc.idx.get(pool[i].pl)] }; return out; }
function estP(S, sh, fw, N, moved, A) { const b0 = logit(sh.p0) - sh.sD * (S.selection.candidateRead.opponentAbilityEstimate - N); let s = 0; let ws = 0; for (let i = 0; i < fw.length; i++) { const x = fw[i]; s += x.w * sigmoid(b0 + sh.sA * (A.get(x.pl) - N)); ws += x.w; } return ws > 0 ? s / ws : sh.p0; }

// Calidad de la transición: parte sin oposición (llegada) y parte con oposición (llegada de defensores por FIS01/FIS02).
function transitionQuality(S, T, sides, k, M) {
  const A = sides[k]; const D = sides[1 - k]; const dr = S.selection.direct;
  const ca = mean(A.view.players.map((p) => taskFor(S, 'TAR02', 'attack', 'handler', p)));
  let w1 = 0; let w2 = 0; for (const e of Object.entries(dr.defenderArrival)) { w1 += e[1]; }
  const arrival = mean(D.view.players.map((p) => { let s = 0; for (const [a, w] of Object.entries(dr.defenderArrival)) s += w * ea(S, p, a, 0); return s / (w1 || 1); })); void w2;
  const opp = qualityDistributionPure(S, ca, arrival, 0, true, false, 0).p; const free = qualityDistributionPure(S, ca, arrival, 0, false, true, 0).p;
  const u = (dr.unopposedChanceAfterSteal + dr.unopposedChanceAfterRebound) / 2; const out = {}; for (const q of QUALS) out[q] = u * free[q] + (1 - u) * opp[q];
  return out;
}
function spontaneousQuality(S, T, sides, k, M) {
  const A = sides[k]; const D = sides[1 - k]; const tech = S.energy.defaultTechnicalTaskMax;
  const ca = mean(A.view.players.map((p) => taskFor(S, 'TAR02', 'attack', 'handler', p)));
  const cd = mean(D.view.players.map((p) => taskFor(S, 'TAR02', 'defense', 'primary', p))); void tech;
  return qualityDistributionPure(S, ca, cd, 0, true, false, 0).p;
}
function spontaneousZones(S, T, view, plan, M) {
  const out = { rim: 0, inside: 0, midrange: 0, three: 0 }; const sel = S.selection; let ws = 0;
  for (const pl of view.players) { const w = (sel.initiativeMix[0] + sel.initiativeMix[1] * pl.init) * (sel.finishingVocationMix[0] + sel.finishingVocationMix[1] * pl.voc); ws += w; out.rim += w * pl.zp.rim * 0.5; out.inside += w * pl.zp.rim * 0.5; out.midrange += w * pl.zp.midrange; out.three += w * pl.zp.three; }
  const st = plan.styles; const mp = plan.midrange; const mpPol = sel.midrangePolicy;
  out.three *= sel.orientationThree[st.finishPreference - 1]; out.rim *= sel.orientationInside[st.finishPreference - 1]; out.inside *= sel.orientationInside[st.finishPreference - 1];
  out.midrange *= mp === 'avoid' ? mpPol.avoidWeight : mp === 'openOnly' ? (mpPol.openOnlyComfortableWeight * 0.5 + mpPol.openOnlyOtherWeight * 0.5) : 1;
  // disponibilidad de funciones de la disposición (no es un bonus plano de acierto)
  const fns = T.dispositions[plan.disposition].functions; const share = (pred) => fns.filter(pred).length / fns.length; const ref = (pred) => Object.values(T.dispositions).reduce((s, d) => s + d.functions.filter(pred).length / d.functions.length, 0) / Object.keys(T.dispositions).length;
  const lowF = (f) => ['inside', 'lowInside', 'block', 'highInside'].includes(f); const perF = (f) => ['top', 'wing', 'corner'].includes(f);
  const mI = share(lowF) / (ref(lowF) || 1); const mO = share(perF) / (ref(perF) || 1);
  out.rim *= mI || 0.0001; out.inside *= mI || 0.0001; out.three *= mO || 0.0001;
  let t = 0; for (const z of ZONES) t += out[z]; for (const z of ZONES) out[z] = t > 0 ? out[z] / t : 0; void ws;
  return out;
}

// Familiaridad (FAM-MOTOR18B-R1): ajuste logit ÚNICO por operación de calidad; neutral con conocimiento no explícito o todos los niveles al máximo.
function famQuality(S, T, A, D, family, comp, plan) {
  const fam = S.familiarity; const tcw = fam.tacticContextWeights.organized;
  const aw = (pl, side) => { const k = pl.kn; if (!explicit(k)) return null; const mods = side === 'a' ? [{ w: tcw.attack.disposition, K: lvl(k.modules, plan.disposition) }, { w: tcw.attack.family, K: lvl(k.modules, `FAM:${family}`) }] : [{ w: tcw.defense.organization, K: lvl(k.modules, D.plan.defense) }, { w: tcw.defense.coverage, K: lvl(k.modules, D.plan.coverage) }]; return familiarityActor(fam, { position: lvl(k.positions, pl.slot), role: lvl(side === 'a' ? k.offensiveRoles : k.defensiveRoles, side === 'a' ? pl.offRole : pl.defRole), modules: mods }).D; };
  const DA = familiaritySide(A.view.players.map((p) => aw(p, 'a'))); const DD = familiaritySide(D.view.players.map((p) => aw(p, 'd')));
  return familiarityDelta(fam, 'quality', DA, DD).delta;
}

// ------------------------------------------------------------------------------------------------------------------------------ muestreo de un tiro: probabilidades del jugador concreto
// Contención de la cobertura (derivada): (carga máxima − carga de la cobertura)/(carga máxima − carga mínima) con las cargas comprometidas de defense.coverage.committedActorLoad.
export function coverageContainment(S, coverage) { const l = S.defense.coverage.committedActorLoad; const vals = Object.values(l); const hi = Math.max(...vals); const lo = Math.min(...vals); return hi > lo ? (hi - l[coverage]) / (hi - lo) : 0; }
function covK(S, T, cell, rivalCoverage, play) {
  if (!cell.pullup && !cell.roller) return 0;
  const cov = play?.coverage; if (cov == null) return 0; if (cov !== true && cov.allowed && !cov.allowed.includes(rivalCoverage)) return 0;
  const cc = S.opportunity.coverageContainment; return (cell.pullup ? cc.handlerPullupQualityLogit : cc.rollerQualityLogit) * coverageContainment(S, rivalCoverage);
}
export function shotProbs(S, T, sides, k, M, cellInfo, shooter, qIdx, zoneOverride = null) {
  const A = sides[k]; const D = sides[1 - k]; const da = D.assign; const N = S.neutralAbility; const c = cellInfo.cell; const zone = zoneOverride ?? c.zone; const sh = S.shots[zone];
  const tech = S.energy.defaultTechnicalTaskMax; const interior = zone === 'rim' || zone === 'inside';
  const Aatt = recipe(S, shooter, sh.attack, tech);
  let Dv = null;
  if (Object.keys(sh.defense).length) {
    const defs = [...new Set(S.derived.zoneToAreas[zone].flatMap((a) => da.areaDefs(a)))];
    Dv = defs.length ? mean(defs.map((p) => recipe(S, p, sh.defense, tech))) : N;
    if (da.boxTarget && da.boxTarget.id === shooter.id && da.perimeterDefs.length) Dv = recipe(S, da.perimeterDefs[0], sh.defense, tech); // box and one: marca individual dedicada
  }
  const wProt = interior ? M.protect.inside : zone === 'three' ? M.protect.outside : 1; const dh = M.pHelp - S.opportunity.helpProbability;
  const sD = sh.sD * wProt * (interior ? 1 : 1 - dh);
  const prep = c.moved ? S.shotPreparation.movementMaximumLogitCost * (1 - (recipe(S, shooter, { TEC06: 0.8, FIS07: 0.2 }, S.shotPreparation.maxEnergyPenalty) - 1) / 29) : 0;
  const K = S.opportunity.qualityShotLogit[QUALS[qIdx]] + (interior ? S.opportunity.helperQualityLogit * M.pHelp : 0) - prep + shooter.form * S.form.taskMaxLogit.shot
    - pressureLossLogit(S, 'shot', M.pressure, ea(S, shooter, 'MEN07', 0)) - mean(D.view.players.map((p) => p.form)) * S.form.taskMaxLogit.defenseDispute + (cellInfo.kind === 'play' ? covK(S, T, c, D.plan.coverage, T.plays[c.playId]) : 0);
  const pBase = sigmoid(logit(sh.p0) + sh.sA * (Aatt - N) - (Dv != null ? sD * (Dv - N) : 0) + K);
  const Z = clamp(0.5 * shooter.M.TIR - 0.5 * mean(D.view.players.map((p) => p.M.DEF)), -1, 1);
  return { p: perturbBinary(pBase, Z, S.moment.probabilityAlphaByTask.shot), pBase, A: Aatt, D: Dv, K };
}

// Tapón y rebote
export function blockProb(S, T, sides, k, M, shooter, zone, rng) {
  const D = sides[1 - k]; const da = D.assign; const sh = S.shots[zone]; const b = S.block; const N = S.neutralAbility;
  const defs = (zone === 'rim' || zone === 'inside' ? da.rimDefs : da.perimeterDefs).concat(da.interiorDefs).filter((v, i, a) => a.indexOf(v) === i);
  if (!defs.length || sh.blockP0 <= 0) return { p: 0, blocker: null };
  const ws = defs.map((p) => Math.max(0.01, recipe(S, p, b.attack, b.maximumEnergyPenalty))); const blk = defs[rng.weighted(ws)];
  const resist = b.resistanceTechniqueWeight * ea(S, shooter, attrOfZone(S, zone), S.contact.maximumEnergyPenalty) + b.resistanceBalanceWeight * ea(S, shooter, 'FIS07', S.contact.maximumEnergyPenalty);
  const bl = recipe(S, blk, b.attack, b.maximumEnergyPenalty);
  const Z = clamp(0.5 * blk.M.DEF - 0.5 * shooter.M.TIR, -1, 1);
  return { p: blockResolution(S, sh, { blk: bl, resist, delta: 0, Z, alpha: S.moment.probabilityAlphaByTask.shot }).p, blocker: blk };
}
export function reboundModel(S, T, sides, k, M) {
  const A = sides[k]; const D = sides[1 - k]; const rb = S.rebound; const cap = rb.maxEnergyPenalty;
  const strength = (pl) => recipe(S, pl, rb.strength, cap) + S.body.reboundStrengthSensitivity * (reachOf(S, pl) - S.body.reboundReachReference);
  const capt = (pl) => recipe(S, pl, rb.captor, cap);
  const pick = (view, slots) => view.lu.filter((e) => slots.includes(e.slot)).map((e) => e.pl);
  const tgt = rb.offensiveReboundAssignmentTarget[A.plan.styles.afterShot - 1]; const offP = A.view.players.slice().sort((a, b) => strength(b) - strength(a)).slice(0, tgt); const defP = pick(D.view, rb.defenseParticipantSlots);
  const RA = offP.length ? mean(offP.map(strength)) : S.neutralAbility; const RD = defP.length ? mean(defP.map(strength)) : S.neutralAbility;
  const lastOff = pick(A.view, rb.liveLastFreeThrowOffenseSlots); const lastDef = pick(D.view, rb.liveLastFreeThrowDefenseSlots);
  const RAl = lastOff.length ? mean(lastOff.map(strength)) : S.neutralAbility; const RDl = lastDef.length ? mean(lastDef.map(strength)) : S.neutralAbility;
  return {
    pField: reboundTeamResolution(S, { p0: rb.fieldOffensiveP0, RA, RD, K: 0, fpDelta: 0, Z: 0, alpha: 0, hasOffense: offP.length > 0 }).p,
    pFt: reboundTeamResolution(S, { p0: rb.lastFreeThrowOffensiveP0, RA: RAl, RD: RDl, K: 0, fpDelta: 0, Z: 0, alpha: 0, hasOffense: lastOff.length > 0 }).p,
    offP, defP, capt, strength, RA, RD,
  };
}
export const passAbility = (S, pl) => (taskFor(S, 'TAR07', 'attack', 'passer', pl) + ea(S, pl, 'MEN02', S.energy.defaultTechnicalTaskMax)) / 2;
export function assistModel(S, M, A, cellKind, family, ownPlan) {
  const odds = S.assist.eligibleFinalPassP0 / (1 - S.assist.eligibleFinalPassP0) * S.selection.elaborationContinuationWeightFactor[ownPlan.styles.elaboration - 1];
  const ws = A.view.players.map((p) => Math.max(0.05, passAbility(S, p) / S.neutralAbility));
  const mA = ws.reduce((s, w, i) => s + w * passAbility(S, A.view.players[i]), 0) / ws.reduce((s, w) => s + w, 0);
  return { p: sigmoid(Math.log(odds) + S.assist.passAbilityLogitSlope * (mA - S.neutralAbility)), ws };
}
export function ftProb(S, shooter, M, D) {
  const sh = S.shots.freeThrow; const N = S.neutralAbility; const A = recipe(S, shooter, sh.attack, S.energy.freeThrowTaskMax);
  const K = shooter.form * S.form.taskMaxLogit.shot - pressureLossLogit(S, 'shot', M.pressure, ea(S, shooter, 'MEN07', 0));
  const pBase = sigmoid(logit(sh.p0) + sh.sA * (A - N) + K);
  return perturbBinary(pBase, clamp(shooter.M.TIR, -1, 1) * 0.5, S.moment.probabilityAlphaByTask.shot);
}

// Probabilidad esperada de tapón (media ponderada por la receta de tapón de los defensores de la zona): versión sin azar para sondas y contraste.
export function blockProbExpected(S, T, sides, k, M, shooter, zone) {
  const D = sides[1 - k]; const da = D.assign; const sh = S.shots[zone]; const b = S.block;
  const defs = (zone === 'rim' || zone === 'inside' ? da.rimDefs : da.perimeterDefs).concat(da.interiorDefs).filter((v, i, a) => a.indexOf(v) === i);
  if (!defs.length || sh.blockP0 <= 0) return 0;
  const resist = b.resistanceTechniqueWeight * ea(S, shooter, attrOfZone(S, zone), S.contact.maximumEnergyPenalty) + b.resistanceBalanceWeight * ea(S, shooter, 'FIS07', S.contact.maximumEnergyPenalty);
  let tw = 0; let ts = 0; for (const p of defs) { const w = Math.max(0.01, recipe(S, p, b.attack, b.maximumEnergyPenalty)); const bl = recipe(S, p, b.attack, b.maximumEnergyPenalty); tw += w; ts += w * blockResolution(S, sh, { blk: bl, resist, delta: 0, Z: 0, alpha: 0 }).p; }
  return ts / tw;
}
