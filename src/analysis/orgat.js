// Organización defensiva efectiva en la FRONTERA de cada hecho (MOTOR-11 §4.3). Reutiliza el historial de órdenes aplicadas (defOrg activadas antes del hecho) y los hechos de
// «organización defensiva efectiva» del motor (alternativa de box and one); NO usa la última intención guardada en la preparación. Un caso sin reconstrucción posible se indica.
const STATES = ['vigente', 'consumida', 'suspendida', 'sustituida'];

function effEvents(ix) {
  if (ix._effEv) return ix._effEv;
  const out = [[], []];
  for (const e of ix.events) if (e.type === 'defense' && e.intent?.origen === 'organización defensiva efectiva') { const t = ix.input.teams.findIndex((x) => x.id === e.intent.defiende); if (t >= 0) out[t].push(e); }
  ix._effEv = out; return out;
}
function appliedDefOrders(ix, defTeam) {
  ix._defOrd ??= [null, null];
  if (!ix._defOrd[defTeam]) ix._defOrd[defTeam] = (ix.res.orders ?? []).filter((o) => o.team === defTeam && o.type === 'defOrg' && o.activation && STATES.includes(o.state))
    .map((o) => ({ o, at: ix.byId[o.activation.lastEvent]?.seq ?? null })).sort((a, b) => (a.o.activation.step ?? 0) - (b.o.activation.step ?? 0));
  return ix._defOrd[defTeam];
}

// `seq`: secuencia del hecho. Devuelve la organización prevista (plan + órdenes aplicadas antes del hecho), la efectiva (box and one → alternativa) y la versión de plan.
export function orgAt(ix, defTeam, seq) {
  const team = ix.input.teams[defTeam]; let intended = team.plan.defense; let version = 0; let unknown = false;
  for (const { o, at } of appliedDefOrders(ix, defTeam)) { if (at == null) { unknown = true; continue; } if (at < seq) { intended = o.content?.defense ?? intended; version += 1; } }
  let eff = null; for (const e of effEvents(ix)[defTeam]) { if (e.seq >= seq) break; eff = e.intent; }
  return { intended, effective: eff ? eff.efectiva : intended, alternate: eff ? !!eff.alternativa : false, objective: eff?.objetivo ?? null, planVersion: version, reconstructable: !unknown };
}
