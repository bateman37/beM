// Antes/después de una orden (MOTOR-10 §14): la comparación empieza en la APLICACIÓN EFECTIVA de la orden, no en su envío. Una orden solicitada, pendiente, rechazada o
// cancelada no cuenta como aplicada. Precarga SEM: N ataques completos propios previos y posteriores (parámetro administrable); se muestran los realmente disponibles y los mixtos
// aparte. Es una comparación descriptiva: no elige retrospectivamente una ventana favorable ni prueba causalidad.
import { ratio } from './formulas.js';

const pnum = (id) => Number(String(id).replace(/\D/g, ''));
export const APPLIED = ['vigente', 'consumida', 'sustituida', 'suspendida', 'caducada'];

export function orderBoundary(ix, order) {
  const a = order.activation;
  if (!a || !APPLIED.includes(order.state)) return null;
  if (a.lastEvent && ix.byId[a.lastEvent]) return { seq: ix.byId[a.lastEvent].seq, possession: null, kind: 'frontera de evento' };
  if (a.possession) { const p = ix.possessions.find((x) => pnum(x.id) >= pnum(a.possession)); return { seq: (p?.startSeq ?? 1) - 1, possession: a.possession, kind: 'inicio de posesión' }; }
  return { seq: 0, possession: null, kind: 'sin ancla' };
}

export function beforeAfter(ix, orderId, n = 3) {
  const order = (ix.res.orders ?? []).find((o) => o.id === orderId);
  if (!order) return { ok: false, reason: `orden desconocida: ${orderId}` };
  const b = APPLIED.includes(order.state) ? orderBoundary(ix, order) : null;
  if (!b) return { ok: false, applied: false, state: order.state, reason: `la orden está «${order.state}»: no se ha aplicado de forma efectiva, no hay antes/después (enviar no equivale a aplicar)` };
  const mine = ix.possessions.filter((p) => p.team === order.team);
  const before = mine.filter((p) => p.endSeq <= b.seq).slice(-n); const after = mine.filter((p) => p.startSeq > b.seq).slice(0, n);
  const mixed = mine.filter((p) => p.startSeq <= b.seq && p.endSeq > b.seq);
  const line = (ps) => { const pts = ps.reduce((s, p) => s + p.points, 0); const shots = ps.flatMap((p) => ix.shots.filter((s) => s.possession === p.id && s.valid)); return { attacks: ps.length, points: pts, ppp: ratio(pts, ps.length, { unit: 'pts/ataque', reason: 'sin ataques completos' }), shots: shots.length, made: shots.filter((s) => s.pub.made).length, comfortable: shots.filter((s) => s.pub.quality === 'comfortable').length, ids: ps.map((p) => p.id) }; };
  return { ok: true, applied: true, order: { id: order.id, type: order.type, team: order.team, issuer: order.issuer, state: order.state }, boundary: b, requested: n, before: line(before), after: line(after), mixed: mixed.map((p) => p.id),
    note: `Compara hasta ${n} ataques completos propios antes y después de la aplicación efectiva (${b.kind}); disponibles: ${before.length} y ${after.length}. Los ataques que cruzan la aplicación van aparte. Descriptivo, no causal.` };
}
export function appliedOrders(ix) { return (ix.res.orders ?? []).filter((o) => o.kind === 'plan' && o.activation && APPLIED.includes(o.state)).map((o) => ({ id: o.id, team: o.team, type: o.type, issuer: o.issuer })); }
