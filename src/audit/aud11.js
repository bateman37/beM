// AUD11 (MOTOR-18, §3.2): clasificación de cada discrepancia entre la organización defensiva prevista y la efectiva de un tiro válido. Es una lectura de EVIDENCIA ya conservada: no cambia la defensa ni sortea.
// Una etiqueta `alternativa=true` aislada no basta; solo se acredita la alternativa si coinciden (1) la organización efectiva del tiro, (2) la alternativa configurada vigente (plan del equipo, órdenes de
// organización aplicadas antes del tiro y, si ninguno la declara, el defecto del perfil) y (3) el hecho causal de su activación (organización efectiva con objetivo ausente). Una orden pendiente o rechazada
// no explica nada. Sin datos suficientes: «no clasificable» con su motivo (nunca «conforme» por omisión).
export const AUD11_CLASSES = {
  alternativa_acreditada: 'alternativa reglada acreditada (organización efectiva, alternativa configurada vigente y activación causal coinciden)',
  orden_aplicada_acreditada: 'orden de organización aplicada acreditada (activada entre la organización efectiva vigente y el tiro)',
  sin_explicacion: 'diferencia sin explicación suficiente (señal)',
  no_clasificable: 'no clasificable por datos incompletos (señal con su motivo)',
};
const APPLIED = new Set(['vigente', 'consumida', 'suspendida', 'sustituida']);

// shot: fila de `tiros` (event_id, sequence, team_instance_id, def_org_intended, def_org_effective). ctx: { orgEv, defOrders, seqOf, ordersSeen, planOf(teamId), defaultFallback }.
export function classifyDefOrg(shot, ctx) {
  const seq = shot.sequence;
  const defenders = [...new Set(ctx.orgEv.map((e) => e.team))].filter((t) => t !== shot.team_instance_id);
  const prior = ctx.orgEv.filter((e) => e.seq < seq && (defenders.length === 1 ? e.team === defenders[0] : e.team !== shot.team_instance_id));
  const ev = prior.length ? prior.reduce((a, b) => (b.seq > a.seq ? b : a)) : null;
  if (!ev) return { clase: 'no_clasificable', motivo: 'no hay hecho de organización efectiva anterior al tiro en la evidencia' };
  const defId = ev.team; const idx = ev.idx;
  const applied = ctx.defOrders.filter((o) => APPLIED.has(o.state) && o.lastEvent != null && ctx.seqOf[o.lastEvent] != null && ctx.seqOf[o.lastEvent] < seq && (idx == null || o.team === idx));
  const ordersUnknown = ctx.defOrders.some((o) => APPLIED.has(o.state) && (o.lastEvent == null || ctx.seqOf[o.lastEvent] == null));
  if (ev.alternativa) {
    if (ev.efectiva !== shot.def_org_effective) return { clase: 'sin_explicacion', motivo: 'la organización efectiva registrada en el hecho causal no es la del tiro', hecho: ev.id };
    if (ev.intencion !== shot.def_org_intended) return { clase: 'sin_explicacion', motivo: 'la intención del hecho causal no es la prevista del tiro', hecho: ev.id };
    if (ev.objetivo != null) return { clase: 'sin_explicacion', motivo: 'el hecho declara alternativa pero conserva un objetivo en pista', hecho: ev.id };
    const plan = ctx.planOf(defId);
    if (!plan) return { clase: 'no_clasificable', motivo: 'plan del equipo defensor no conservado: no se puede acreditar la alternativa configurada vigente', hecho: ev.id };
    if (ordersUnknown) return { clase: 'no_clasificable', motivo: 'una orden de organización aplicada no conserva el hecho de activación: no se reconstruye la alternativa vigente', hecho: ev.id };
    let configured = plan.fallbackOrg ?? ctx.defaultFallback; let fuente = plan.fallbackOrg ? 'plan.fallbackOrg' : 'defecto del perfil';
    for (const o of [...applied].sort((a, b) => (a.step ?? 0) - (b.step ?? 0))) if (o.fallback !== undefined) { configured = o.fallback ?? ctx.defaultFallback; fuente = `orden ${o.id}`; }
    if (configured == null) return { clase: 'no_clasificable', motivo: 'no hay alternativa configurada localizable (ni plan, ni órdenes, ni defecto del perfil)', hecho: ev.id };
    if (configured !== ev.efectiva) return { clase: 'sin_explicacion', motivo: `la alternativa configurada vigente (${configured}, ${fuente}) no es la efectiva`, hecho: ev.id };
    return { clase: 'alternativa_acreditada', hecho: ev.id, alternativaConfigurada: configured, fuente, motivoDelHecho: ev.motivo };
  }
  // Sin alternativa: la intención del tiro cambió respecto del hecho vigente ⇒ solo una orden aplicada entre ambos lo explica.
  if (ev.intencion !== shot.def_org_intended) {
    const o = applied.filter((x) => x.defense === shot.def_org_intended && ctx.seqOf[x.lastEvent] > ev.seq);
    if (o.length) return { clase: 'orden_aplicada_acreditada', hecho: ev.id, orden: o[o.length - 1].id };
    if (ordersUnknown) return { clase: 'no_clasificable', motivo: 'una orden de organización aplicada no conserva el hecho de activación', hecho: ev.id };
    if (!ctx.ordersSeen) return { clase: 'no_clasificable', motivo: 'la evidencia no conserva el historial de órdenes', hecho: ev.id };
    return { clase: 'sin_explicacion', motivo: 'la intención cambió sin una orden aplicada acreditada entre el hecho de organización y el tiro (una orden pendiente o rechazada no lo explica)', hecho: ev.id };
  }
  return { clase: 'sin_explicacion', motivo: 'la organización efectiva difiere de la prevista sin alternativa ni orden', hecho: ev.id };
}
