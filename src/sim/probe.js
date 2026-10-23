// Sonda de magnitudes (sin azar): compila un tramo y devuelve el vector de distribuciones ANTES del sorteo. Es el instrumento de las pruebas causales (contraste +1/+3/+5, controles, familiaridad)
// y de las matrices de cobertura: un control o una capacidad cuenta como usado solo si cambia una magnitud de este vector.
import { SimMatch } from './engine.js';
import './materialize.js';
import { shotProbs, blockProbExpected, ftProb, reboundModel, ZONES, finisherWeights, offRoleBias, defRoleBias, passAbility } from './model.js';
import { consistencySigmaAt, enduranceFactorAt, pressureLossLogit } from '../match/formulas.js';
import { ea } from './model.js';

void defRoleBias;
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);
export function probeVector(ctx, input, over = {}) {
  const m = new SimMatch(input, ctx); m._prepareSides(120);
  const models = m._compile(0, { importance: over.importance ?? 'ordinary', margin: over.margin ?? 0, period: over.period ?? 2, secondsLeft: over.secondsLeft ?? 300 });
  const S = m.S; const T = m.T; const v = {};
  for (const k of [0, 1]) {
    const M = models[k]; const s = m.sides[k]; const o = m.sides[1 - k]; const lu = s.view.players;
    v[`pace.sec.${k}`] = M.secPerControl; v[`pace.tau.${k}`] = M.tau; v[`pace.sigma.${k}`] = M.sigma;
    for (const key of M.termOrder) v[`term.${key}.${k}`] = M.term[key];
    v[`dnRatio.${k}`] = M.dnRatio; v[`pSteal.${k}`] = M.pSteal; v[`OffC.${k}`] = M.OffC; v[`DefC.${k}`] = M.DefC; v[`legalDef.${k}`] = M.legalDef; v[`legalOff.${k}`] = M.legalOff; v[`reading.q.${k}`] = M.q;
    const zmix = Object.fromEntries(ZONES.map((z) => [z, 0])); const fam = {}; let comf = 0; let pass = 0;
    for (const c of s.cells) { zmix[c.cell.zone] += c.w; const f = c.kind === 'play' ? c.cell.family : c.kind; fam[f] = (fam[f] ?? 0) + c.w; if (c.q) comf += c.w * c.q.comfortable; }
    for (const z of ZONES) v[`mix.zone.${z}.${k}`] = zmix[z]; for (const f of Object.keys(fam)) v[`mix.family.${f}.${k}`] = fam[f]; v[`quality.comfortable.${k}`] = comf; void pass;
    for (const z of ZONES) {
      v[`pMake.${z}.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'trans', cell: { zone: z, moved: false, role: 'handler' } }, p, 1).p));
      v[`pBlock.${z}.${k}`] = mean(lu.map((p) => blockProbExpected(S, T, m.sides, k, M, p, z)));
    }
    v[`pMake.pullupThree.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'play', cell: { playId: 'POS01', zone: 'three', moved: false, role: 'handler', pullup: true } }, p, 1).p));
    v[`pMake.rollerRim.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'play', cell: { playId: 'POS01', zone: 'rim', moved: false, role: 'screener', roller: true } }, p, 1).p));
    v[`pMake.movedThree.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'trans', cell: { zone: 'three', moved: true, role: 'handler' } }, p, 1).p));
    // reparto de participación y de créditos ANTES del sorteo (roles, director y familiaridad)
    const fin = lu.map(() => 0); let finTot = 0; for (const c of s.cells) { if (!(c.w > 0)) continue; const fw = finisherWeights(S, T, s.view, c.kind === 'play' ? T.plays[c.cell.playId] : null, c.kind === 'play' ? { ...c.cell, kind: 'play' } : c.cell, s.plan); const tw = fw.reduce((a, x) => a + x.w, 0); if (!(tw > 0)) continue; for (const x of fw) fin[s.view.players.indexOf(x.pl)] += c.w * x.w / tw; finTot += c.w; }
    lu.forEach((p, i) => { v[`part.finisher.${i}.${k}`] = finTot > 0 ? fin[i] / finTot : 0; });
    const pw = lu.map((p) => Math.max(0.05, passAbility(S, p) / S.neutralAbility) * offRoleBias(S, T, p, S.roles.creditTags.passer)); const pt = pw.reduce((a, x) => a + x, 0); lu.forEach((p, i) => { v[`part.passer.${i}.${k}`] = pw[i] / pt; });
    lu.forEach((p, i) => { v[`credit.steal.${i}.${k}`] = M.stealW[i] / M.stealW.reduce((a, x) => a + x, 0); v[`credit.offFoulRecv.${i}.${k}`] = M.ofRecvW[i] / M.ofRecvW.reduce((a, x) => a + x, 0); v[`def.rim.${i}.${k}`] = o.assign.rimDefs.includes(o.view.players[i]) ? 1 : 0; v[`def.interior.${i}.${k}`] = o.assign.interiorDefs.includes(o.view.players[i]) ? 1 : 0; });
    for (const [pid, f] of Object.entries(M.famQuality ?? {})) v[`fam.play.${pid}.${k}`] = f; if (M.famCtx) { v[`fam.transition.${k}`] = M.famCtx.transition; v[`fam.spontaneous.${k}`] = M.famCtx.spontaneous; }
    v[`pFT.${k}`] = mean(lu.map((p) => ftProb(S, p, M, o))); v[`pOrb.field.${k}`] = s.reb.pField; v[`pOrb.ft.${k}`] = s.reb.pFt; v[`assist.p.${k}`] = s.assist.p;
    v[`energy.cost.${k}`] = mean(lu.map((p) => S.energy.costPerLiveMinute * enduranceFactorAt(S, p.ab.FIS06))); v[`moment.sigma.${k}`] = mean(lu.map((p) => consistencySigmaAt(S, p.ab.MEN06)));
    v[`pressure.lossShot.${k}`] = mean(lu.map((p) => pressureLossLogit(S, 'shot', M.pressure, ea(S, p, 'MEN07', 0))));
    v[`pressure.level.${k}`] = M.pressure; v[`pHelp.${k}`] = M.pHelp;
  }
  return { vector: v, models, match: m };
}
export function bumpAbilities(input, ids, attrs, delta, bounds = [1, 30]) {
  const copy = JSON.parse(JSON.stringify(input)); const set = new Set(ids);
  for (const t of copy.teams) for (const p of t.players) if (set.has(p.id)) for (const a of attrs) p.abilities[a] = Math.min(bounds[1], Math.max(bounds[0], p.abilities[a] + delta));
  return copy;
}
export function diffVectors(a, b, eps = 1e-12) { const out = []; for (const k of Object.keys(a)) if (Math.abs((b[k] ?? 0) - a[k]) > eps) out.push({ key: k, base: a[k], after: b[k], delta: b[k] - a[k] }); return out; }
