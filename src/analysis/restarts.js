// Saques, continuidad y situaciones especiales (MOTOR-10 §11). Separa banda/fondo, secuencia directa y producción de toda la posesión.
// Solo cuentan las ventanas y recepciones realmente resueltas por el motor. Los casos reglamentarios no ejecutados NO se muestran como «cero incidencias».
import { ratio, pctOf } from './formulas.js';
import { allowed } from './facts.js';

export const KIND_LABEL = { band: 'Banda', endline: 'Fondo' };
export const REGULATION_NOT_EXECUTED = [
  'Técnicas y antideportivas 2026 (RG-F07): tipadas sin ejecución', 'Compensación de sanciones iguales (RG-C02): pendiente de contraste',
  'Corrección reglamentaria (art. 45, RG-R01): sin validar', 'Inferioridad natural y terminación administrativa: solo casos preparados', 'Tiro en vuelo e interferencia como familia propia: no implementados',
];

export function throwInTable(ix, team, ctx) {
  const chains = (ix.res.diagnostics?.throwInChains ?? []).filter((c) => c.team === team && c.status === 'cerrada');
  const by = new Map();
  for (const c of chains) {
    const first = c.intentos?.[0]; const denied = (c.intentos ?? []).filter((i) => i.negada).length; const poss = ix.possessions.find((p) => p.id === c.possession);
    const g = by.get(c.kind) ?? { kind: c.kind, label: KIND_LABEL[c.kind] ?? c.kind, n: 0, firstOption: 0, alternative: 0, denied: 0, direct: 0, resultClose: 0, possPts: 0, possN: 0, ids: [], causes: {} };
    g.n += 1; if (c.opcionUsada === 'primera') g.firstOption += 1; else if (c.opcionUsada === 'alternativa') g.alternative += 1; g.denied += denied; g.direct += c.puntosDirectos ?? 0;
    if (c.cierre === 'resultado') g.resultClose += 1; if (poss) { g.possPts += poss.points; g.possN += 1; } g.ids.push(c.id); g.causes[c.origen] = (g.causes[c.origen] ?? 0) + 1; by.set(c.kind, g);
  }
  const rows = [...by.values()].map((g) => ({ ...g, firstPct: pctOf(g.firstOption, g.n), possPpp: ratio(g.possPts, g.possN, { unit: 'pts/posesión', reason: 'sin posesiones' }), directPpp: ratio(g.direct, g.n, { unit: 'pts directos/saque', reason: 'sin saques' }) }));
  return { team, rows, total: chains.length, own: allowed('own', { team }, ctx),
    note: 'Secuencia directa: puntos antes de una nueva organización según las fichas vigentes. «Producción de toda la posesión» incluye la continuidad posterior y son lecturas distintas. No se clasifica como éxito una recepción forzada que el motor no resolvió.', notExecuted: REGULATION_NOT_EXECUTED };
}

export function throwInList(ix, team, ctx) {
  const own = (c) => allowed('own', { team: c.team }, ctx);
  return (ix.res.diagnostics?.throwInChains ?? []).filter((c) => c.team === team).map((c) => ({
    id: c.id, possession: c.possession, period: c.period, kind: KIND_LABEL[c.kind] ?? c.kind, cause: c.origen, receiver: c.receptor ?? null, option: c.opcionUsada ?? null, denied: (c.intentos ?? []).filter((i) => i.negada).length,
    directPoints: c.puntosDirectos ?? 0, plazo: c.plazo ?? null, close: c.cierre ?? 'abierta', ficha: own(c) ? c.ficha : undefined, sacador: own(c) ? c.sacador : undefined,
  }));
}

// Faltas tácticas y finales: orden, clasificación efectiva y reloj (sin afirmar probabilidad de remontada).
export function foulTable(ix, team) {
  return ix.events.filter((e) => e.type === 'foul' && e.team === team).map((e) => ({ event: e.id, period: e.period, remaining: e.clock?.before, by: e.participants?.infractor ?? null, on: e.participants?.sobre ?? null, kind: e.intent?.tipo ?? e.intent?.origen ?? null, rule: e.effects?.regla ?? null, ft: e.effects?.tirosLibres ?? 0, bonus: !!e.effects?.penalizacion }));
}
