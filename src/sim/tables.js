// Tablas declarativas heredadas del perfil efectivo del detallado (repertorio, defensa, entrenador, conocimiento). Son REFERENCIAS de estructura, no filas numéricas del perfil SIM:
// los números que de ellas se derivan (pesos por salida, adecuación, categorías) se calculan al compilar y se documentan en la matriz de controles.
import { fpOf } from './profile.js';

const deep = (x) => JSON.parse(JSON.stringify(x));

// Aplana las salidas de una ficha: una salida con zona «recepción» y etapa se sustituye por las salidas de la etapa (reparto igual entre ellas).
export function flattenExits(play) {
  const out = [];
  const ex = play.exits ?? [];
  for (const e of ex) {
    if (e.stage && play.stages?.[e.stage]) { const st = play.stages[e.stage].exits; for (const s of st) out.push({ ...s, weightShare: 1 / (ex.length * st.length) }); }
    else out.push({ ...e, weightShare: 1 / ex.length });
  }
  return out;
}

export function extractTables(detailed) {
  const rep = detailed.repertoire; const def = detailed.defenseRepertoire;
  const baseRecipes = Object.fromEntries(detailed.plays.map((p) => [p.id, { qualityAttack: p.qualityAttack, qualityDefense: p.qualityDefense, family: p.family }]));
  const plays = {};
  for (const [id, pl] of Object.entries(rep.plays)) {
    const src = pl.recipeFrom ?? id; const rec = baseRecipes[src] ?? baseRecipes[Object.keys(baseRecipes).find((k) => baseRecipes[k].family === pl.family)];
    if (!rec) throw new Error(`ficha ${id} sin receta de calidad (${pl.family})`);
    plays[id] = { id, name: pl.name, family: pl.family, natural: pl.natural, roles: pl.roles, coverage: pl.coverage ?? null, exits: flattenExits(pl), qualityAttack: rec.qualityAttack, qualityDefense: rec.qualityDefense, recipeFrom: src };
  }
  const t = {
    plays, dispositions: deep(rep.dispositions), functions: deep(rep.functions), accessBySlot: deep(rep.accessBySlot), participantSlots: deep(detailed.participantSlots),
    attackerFunctions: deep(def.attackerFunctions), organizations: deep(def.organizations), coverages: deep(def.coverages), heights: Object.keys(def.heights),
    coachPolicies: deep(detailed.coach.policies), foulBook: deep(detailed.coach.foulBook ?? detailed.coach.rotation?.foulBook ?? []),
    midrangePolicies: ['avoid', 'openOnly', 'seek'], styleKeys: ['organizedPace', 'finishPreference', 'freedom', 'transition', 'elaboration', 'offensiveRisk', 'afterShot'],
    defStyleKeys: ['help', 'pressure', 'receivers', 'steal', 'protection'], slots: ['PG', 'SG', 'SF', 'PF', 'C'],
    attrs: detailed.attributeOrder, familiarity: deep(detailed.familiarity), teamNames: deep(detailed.fixtureContract?.teamNames ?? {}),
  };
  t.fingerprint = fpOf([[JSON.stringify(t.plays)], [JSON.stringify(t.organizations)], [JSON.stringify(t.coachPolicies)]].map((x, i) => ({ path: String(i), value: x })));
  return t;
}
