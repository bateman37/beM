// Análisis ofensivo (MOTOR-10 §9): origen principal excluyente por posesión, ejecuciones encadenadas, libro/prioridades, director y resultado local.
// Una posesión tiene un único origen; una ejecución es una interacción resuelta dentro de ella (una posesión puede contener varias).
import { ratio, pctOf } from './formulas.js';
import { allowed } from './facts.js';

export const FAMILY_LABEL = { pick_and_roll: 'Bloqueo directo', handoff: 'Mano a mano', off_ball_screen: 'Bloqueo indirecto', give_and_go: 'Pase y corte', post: 'Poste', isolation: 'Aclarado' };
const QUALS = ['comfortable', 'normal', 'forced'];

// Origen principal: primera acción ofensiva significativa realmente iniciada (ficha del libro, decisión directa o recurso autónomo);
// si el ataque se interrumpió antes de iniciarla, «interrumpido». Una decisión directa lleva su subtipo (código ESP) y NO se convierte en aclarado.
export function possessionOrigin(p, reveal = true) {
  const first = p.attempts.find((e) => e.intent?.procedencia || e.intent?.familia || e.intent?.origen);
  const stopped = { key: 'interrumpido', label: 'Interrumpido antes de iniciar la acción (avance o preparación)', kind: 'interrumpido', ev: first ?? null };
  if (!first) return stopped;
  const it = first.intent; const proc = it.procedencia ?? null;
  if (!proc && ['turnover', 'defensiveNonShootingFoul'].includes(it.categoria)) return stopped;
  const fam = it.familia ?? null;
  // La procedencia de la decisión (libro, decisión directa, recurso autónomo) es información PROPIA: sin permiso solo se nombra la acción observada.
  if (!reveal) return { key: `obs:${fam ?? it.origen ?? '?'}`, label: fam ? `Acción · ${FAMILY_LABEL[fam] ?? fam}` : `Acción · ${it.origen ?? 'sin familia registrada'}`, kind: 'observada', ev: first };
  if (proc === 'decisión directa') return { key: `directa:${it.origen ?? '?'}`, label: `Decisión directa ${it.origen ?? ''}`.trim(), kind: 'directa', ev: first };
  if (proc === 'recurso autónomo') return { key: `autónomo:${it.origen ?? '?'}`, label: `Recurso autónomo ${it.origen ?? ''}`.trim(), kind: 'autónomo', ev: first };
  return { key: `libro:${fam ?? it.origen ?? '?'}`, label: fam ? `Libro · ${FAMILY_LABEL[fam] ?? fam}` : `Libro · ${it.origen ?? 'sin familia registrada'}`, kind: 'libro', ev: first };
}

function possStats(ix, p) {
  const shotsIn = ix.shots.filter((s) => s.possession === p.id && s.valid);
  const quals = Object.fromEntries(QUALS.map((q) => [q, shotsIn.filter((s) => s.pub.quality === q).length]));
  const fta = p.events.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'ft' && (x.status ?? 'administered') === 'administered')).length;
  const tov = p.events.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'tov' && x.team === p.team)).length;
  const oreb = p.events.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'reb' && x.off)).length;
  const reorg = p.events.filter((e) => e.type === 'reorganization').length;
  return { shots: shotsIn.length, made: shotsIn.filter((s) => s.pub.made).length, fta, tov, oreb, reorg, quals };
}

// Tabla por origen: las filas reconcilian el total elegible; los administrativos sin vínculo se muestran aparte.
export function originTable(ix, team, { filter = null, ctx = { audience: 'diagnostic', team } } = {}) {
  const reveal = allowed('own', { team }, ctx);
  const poss = ix.possessions.filter((p) => p.team === team && (!filter || filter(p)));
  const rows = new Map();
  for (const p of poss) {
    const o = possessionOrigin(p, reveal); const st = possStats(ix, p);
    const r = rows.get(o.key) ?? { key: o.key, label: o.label, kind: o.kind, poss: 0, points: 0, finals: 0, shots: 0, made: 0, fta: 0, tov: 0, oreb: 0, reorg: 0, quals: { comfortable: 0, normal: 0, forced: 0 }, closes: {}, ids: [] };
    r.poss += 1; r.points += p.points; r.finals += p.finals; r.shots += st.shots; r.made += st.made; r.fta += st.fta; r.tov += st.tov; r.oreb += st.oreb; r.reorg += st.reorg;
    for (const q of QUALS) r.quals[q] += st.quals[q]; r.closes[p.closeCause] = (r.closes[p.closeCause] ?? 0) + 1; r.ids.push(p.id);
    rows.set(o.key, r);
  }
  const total = poss.length; const list = [...rows.values()].sort((a, b) => b.poss - a.poss || a.key.localeCompare(b.key)).map((r) => ({ ...r, freq: pctOf(r.poss, total), ppp: ratio(r.points, r.poss, { unit: 'pts/ataque', reason: 'sin posesiones' }), pointsPerF: ratio(r.points, r.finals, { unit: 'pts/F', reason: 'sin F cerradas' }) }));
  const linked = list.reduce((s, r) => s + r.points, 0);
  const admin = ix.acta.pointEvents.filter((x) => x.team === team && !x.possession).reduce((s, x) => s + x.pts, 0);
  return { team, total, rows: list, linkedPoints: linked, unlinkedPoints: admin, reconciles: list.reduce((s, r) => s + r.poss, 0) === total, universe: 'posesiones beM propias elegibles (con ataque activo)', note: 'Origen principal excluyente; el PPP usa los puntos vinculados a toda la continuidad de la posesión. Los puntos sin vínculo a posesión no entran en ningún PPP.' };
}

// Ejecuciones encadenadas: una fila por interacción resuelta (evento de intento) con su relación deportiva registrada.
export function executionList(ix, team, ctx) {
  const rows = [];
  for (const p of ix.possessions.filter((x) => x.team === team)) {
    p.attempts.forEach((e, i) => {
      const it = e.intent ?? {}; const pa = e.participants ?? {}; const sh = (e.stats ?? []).find((x) => x.k === 'shot');
      const fam = it.familia ?? null; if (!fam && !it.procedencia) return;
      const fact = { team };
      const own = allowed('own', fact, ctx);
      rows.push({
        event: e.id, possession: p.id, order: i + 1, of: p.attempts.length, family: fam, ficha: it.origen ?? null, procedencia: own ? (it.procedencia ?? null) : undefined,
        participants: { director: pa.director ?? null, handler: pa.handler ?? null, screener: pa.screener ?? null, receiver: pa.receiver ?? null, actor: pa.actor ?? null },
        priority: own ? (it.seleccion?.prioridad ?? null) : undefined, coverage: it.cobertura?.cobertura ?? null, quality: it.calidad ?? null, zone: it.zona ?? null,
        result: sh ? (sh.made ? 'canasta' : (sh.fromFoul ? 'falta en tiro' : 'tiro fallado')) : (it.categoria === 'turnover' ? 'pérdida' : it.categoria === 'looseBall' ? 'balón suelto' : it.categoria === 'defensiveNonShootingFoul' ? 'falta sin tiro' : (it.categoria ?? '—')),
        continuation: it.continuacion ?? null, period: e.period,
      });
    });
  }
  return rows;
}

// Tabla por familia/ficha: % de ejecuciones (den. ejecuciones) y % de posesiones donde apareció (admite solapamiento) son lecturas distintas.
export function executionTable(ix, team, ctx) {
  const ex = executionList(ix, team, ctx); const nPoss = ix.possessions.filter((p) => p.team === team).length; const own = allowed('own', { team }, ctx);
  const by = new Map();
  for (const r of ex) { const k = r.family ?? `${own ? 'directa' : 'obs'}:${r.ficha}`; const g = by.get(k) ?? { key: k, family: r.family, label: r.family ? (FAMILY_LABEL[r.family] ?? r.family) : (own ? `Decisión directa / recurso (${r.ficha ?? '?'})` : `Acción (${r.ficha ?? '?'})`), ex: 0, poss: new Set(), made: 0, miss: 0, tov: 0, foul: 0, ids: [] }; g.ex += 1; g.poss.add(r.possession); g.ids.push(r.event); if (r.result === 'canasta') g.made += 1; else if (r.result === 'tiro fallado') g.miss += 1; else if (r.result === 'pérdida') g.tov += 1; else if (r.result.startsWith('falta')) g.foul += 1; by.set(k, g); }
  const total = ex.length;
  const rows = [...by.values()].sort((a, b) => b.ex - a.ex || a.key.localeCompare(b.key)).map((g) => ({ ...g, poss: g.poss.size, pctEx: pctOf(g.ex, total), pctPoss: pctOf(g.poss.size, nPoss), local: `${g.made} canastas · ${g.miss} fallos · ${g.tov} pérdidas · ${g.foul} faltas` }));
  return { team, executions: total, possessions: nPoss, rows, note: 'Resultado local: consecuencia de esa interacción, no el futuro entero de la cadena. «% de posesiones» admite solapamiento; «% de ejecuciones» no.' };
}

// Libro, prioridades y director (solo con permiso de información propia).
export function bookTable(ix, team, ctx) {
  if (!allowed('own', { team }, ctx)) return { available: false, reason: 'prioridades y órdenes del libro: información propia o diagnóstico; no se muestran del rival' };
  const ex = executionList(ix, team, ctx); const prio = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; let outOfBook = 0; let unknown = 0;
  for (const r of ex) { if (r.procedencia && r.procedencia !== 'libro') outOfBook += 1; else if (r.priority >= 1 && r.priority <= 5) prio[r.priority] += 1; else unknown += 1; }
  return { available: true, team, priorities: prio, outOfBook, unknown, total: ex.length, note: 'Una prioridad 5 no demuestra desobediencia ni la prioridad 1 es una cuota garantizada; acciones fuera de libro permitidas se cuentan aparte.' };
}
export function directorTable(ix, team) {
  const by = new Map();
  for (const p of ix.possessions.filter((x) => x.team === team)) {
    const dirs = new Set(p.attempts.map((e) => e.participants?.director).filter(Boolean));
    for (const d of dirs) { const r = by.get(d) ?? { director: d, directed: 0, points: 0, ownFinishes: 0, tov: 0, ids: [] }; r.directed += 1; r.points += p.points; r.ids.push(p.id); by.set(d, r); }
    for (const e of p.attempts) { const d = e.participants?.director; if (!d) continue; const r = by.get(d); const sh = (e.stats ?? []).find((x) => x.k === 'shot'); if (sh && sh.p === d) r.ownFinishes += 1; for (const t of (e.stats ?? [])) if (t.k === 'tov' && t.p === d) r.tov += 1; }
  }
  return { team, rows: [...by.values()].sort((a, b) => b.directed - a.directed).map((r) => ({ ...r, ppp: ratio(r.points, r.directed, { unit: 'pts/ataque dirigido', reason: 'sin ataques' }) })), note: 'Ataques dirigidos: posesiones con ese director en alguna ejecución; si el director cambia durante el ataque aparece en ambas filas. No es una nota de dirección.' };
}
