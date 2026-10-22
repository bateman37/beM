// Sonda de magnitudes (sin azar): compila un tramo y devuelve el vector de distribuciones ANTES del sorteo. Es el instrumento de las pruebas causales (contraste +1/+3/+5, controles, familiaridad)
// y de las matrices de cobertura: un control o una capacidad cuenta como usado solo si cambia una magnitud de este vector.
import { SimMatch } from './engine.js';
import './materialize.js';
import { shotProbs, blockProbExpected, ftProb, reboundModel, ZONES } from './model.js';
import { consistencySigmaAt, enduranceFactorAt, pressureLossLogit } from '../match/formulas.js';
import { ea } from './model.js';

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
    for (const c of s.cells) { zmix[c.cell.zone] += c.w; const f = c.kind === 'play' ? c.cell.family : c.kind; fam[f] = (fam[f] ?? 0) + c.w; comf += c.w * c.q.comfortable; }
    for (const z of ZONES) v[`mix.zone.${z}.${k}`] = zmix[z]; for (const f of Object.keys(fam)) v[`mix.family.${f}.${k}`] = fam[f]; v[`quality.comfortable.${k}`] = comf; void pass;
    for (const z of ZONES) {
      v[`pMake.${z}.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'trans', cell: { zone: z, moved: false, role: 'handler' } }, p, 1).p));
      v[`pBlock.${z}.${k}`] = mean(lu.map((p) => blockProbExpected(S, T, m.sides, k, M, p, z)));
    }
    v[`pMake.pullupThree.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'play', cell: { playId: 'POS01', zone: 'three', moved: false, role: 'handler', pullup: true } }, p, 1).p));
    v[`pMake.rollerRim.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'play', cell: { playId: 'POS01', zone: 'rim', moved: false, role: 'screener', roller: true } }, p, 1).p));
    v[`pMake.movedThree.${k}`] = mean(lu.map((p) => shotProbs(S, T, m.sides, k, M, { kind: 'trans', cell: { zone: 'three', moved: true, role: 'handler' } }, p, 1).p));
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
