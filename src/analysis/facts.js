// Índice de hechos de MOTOR-10: lectura determinista (sin azar, sin estado deportivo) de un resultado exportado.
// Cada hecho de análisis separa tres niveles de información: `pub` (observable por cualquiera), `own` (solo para el equipo propio) y `diag`
// (laboratorio). La audiencia se aplica al construir la vista, ANTES de cualquier consulta, texto o exportación (§18).
import { buildActa } from '../match/acta.js';
import { orgAt } from './orgat.js';

export const PERIOD_TENTHS = (p) => (p <= 4 ? 6000 : 3000);
export const periodName = (p) => (p <= 4 ? `C${p}` : `P${p - 4}`);
const ATTEMPT_TYPES = new Set(['attempt']);

// Instante deportivo legible: periodo + reloj restante (décimas) + orden estable.
export function stamp(ev, which = 'before') { return { event: ev.id, seq: ev.seq, period: ev.period, remaining: ev.clock?.[which] ?? null }; }
export const clockText = (tenths) => (tenths == null ? '—' : `${Math.floor(tenths / 600)}:${String(Math.floor((tenths % 600) / 10)).padStart(2, '0')}`);

// El resultado puede traer su acta (export) o reconstruirse desde los hechos (reproducción, revisión).
export function actaOf(res) { return res.acta ?? buildActa({ events: res.events, lineups: res.lineups, input: res.input, possessions: res.possessions, status: res.status }, res.profile?.statsPolicy); }

export function buildIndex(res) {
  const acta = actaOf(res);
  const events = res.events;
  const teamOf = {}; const nameOf = {};
  res.input.teams.forEach((t, ti) => t.players.forEach((p) => { teamOf[p.id] = ti; nameOf[p.id] = p.name; }));
  const lineupPlayers = Object.fromEntries((res.lineups ?? []).map((l) => [l.id, l.key.split('|')]));
  const starters = res.input.teams.map((t) => new Set(Object.values(t.plan.starters)));

  // tiempo de juego acumulado y marcador previo por acontecimiento
  // El marcador previo se deriva de las anotaciones válidas del acta (no del campo `score` de cada hecho): así los flujos preparados y revisados también lo tienen.
  const time = {}; const scoreBefore = {}; let g = 0; const sc = [0, 0]; const pe = [...acta.pointEvents].sort((a, b) => a.seq - b.seq); let pi = 0;
  for (const ev of events) {
    while (pi < pe.length && pe[pi].seq < ev.seq) { sc[pe[pi].team] += pe[pi].pts; pi += 1; }
    scoreBefore[ev.seq] = [sc[0], sc[1]]; time[ev.seq] = { before: g, after: g + (ev.durationTenths ?? 0) };
    g += ev.durationTenths ?? 0;
  }
  const byId = Object.fromEntries(events.map((e) => [e.id, e]));
  const creditByEvent = {}; for (const c of acta.credits) if (c.k === 'ast') (creditByEvent[c.event ?? `S:${c.series}`] ??= []).push(c);

  // tiros de campo (todos los hechos `shot`), con las tres capas de información
  const shots = []; const curFn = {}; // función de cada jugador en la disposición vigente de la posesión (se registra una vez por disposición)
  for (const ev of events) {
    if (ev.intent?.funciones && ev.possessionId) curFn[ev.possessionId] = ev.intent.funciones;
    for (const f of ev.stats ?? []) {
      if (f.k !== 'shot') continue;
      const it = ev.intent ?? {}; const pa = ev.participants ?? {}; const sel = it.seleccion ?? null;
      const valid = !((f.fromFoul && !f.made) || f.annulled); // misma regla que el acta: un fallo con falta de tiro no es intento de campo
      shots.push({
        id: ev.id, seq: ev.seq, period: ev.period, team: f.team, valid,
        pub: {
          shooter: f.p, zone: f.zone, points: f.points, made: !!f.made, fromFoul: !!f.fromFoul, annulled: !!f.annulled, blockedBy: f.blockedBy ?? null, defender: pa.defensor ?? ev.effects?.defender ?? null,
          familia: it.familia ?? null, origen: it.origen ?? null, contexto: it.contexto ?? null, ejecucion: it.ejecucion ?? null, quality: it.calidad ?? null, window: ev.effects?.ventanaLibre ?? null,
          coverage: it.cobertura?.cobertura ?? null, passer: f.feed?.passer ?? null, moved: !!f.feed?.moved, helper: pa.ayudante ?? null, screener: pa.screener ?? null, cutter: pa.cutter ?? null,
        },
        own: { shooterFn: curFn[ev.possessionId]?.[f.p] ?? null, procedencia: it.procedencia ?? null, prioridad: sel?.prioridad ?? null, director: pa.director ?? null, disposicion: it.disposicion ?? null, ficha: sel?.ficha ?? null, decide: sel?.decide ?? null, feed: f.feed ?? null },
        diag: { pConversion: ev.effects?.pConversion ?? null, pFinal: sel?.pFinal ?? null, L: sel?.L ?? null, q: sel?.q ?? null },
        clock: { before: ev.clock?.before ?? null, after: ev.clock?.after ?? null }, scoreBefore: scoreBefore[ev.seq], gameBefore: time[ev.seq].before,
        lineups: ev.lineups, possession: ev.possessionId ?? null, credit: creditByEvent[ev.id]?.[0] ?? null,
      });
    }
  }

  // posesiones activas (registro del motor + cierre del acta)
  const plog = res.possessions ?? acta.possessions;
  const actaP = Object.fromEntries(acta.possessions.map((p) => [p.id, p]));
  const evByPoss = {}; for (const ev of events) if (ev.possessionId) (evByPoss[ev.possessionId] ??= []).push(ev);
  const possessions = [];
  for (const p of plog) {
    const a = actaP[p.id]; if (!a) continue; // sin ataque activo: no es una posesión beM
    const evs = evByPoss[p.id] ?? [];
    const attempts = evs.filter((e) => ATTEMPT_TYPES.has(e.type));
    const firstLineEv = evs.find((e) => e.type !== 'substitution' && e.lineups) ?? evs[0];
    const subs = evs.filter((e) => e.type === 'substitution' && firstLineEv && e.seq > firstLineEv.seq);
    possessions.push({
      id: p.id, team: p.team, period: p.period, entry: p.entry ?? null, origin: p.origin ?? null, startSeq: p.startSeq, endSeq: p.endSeq, endKind: p.endKind, closeCause: a.closeCause,
      points: a.points, finals: a.finals, events: evs, attempts, lineups: firstLineEv?.lineups ?? null, subs, first: attempts[0] ?? null,
    });
  }
  const players = {}; for (const id of Object.keys(teamOf)) players[id] = { id, team: teamOf[id], name: nameOf[id], starter: starters[teamOf[id]].has(id) };
  const ixOut = { res, acta, events, byId, teamOf, players, lineupPlayers, time, scoreBefore, shots, possessions, creditByEvent, starters, totalTenths: g, input: res.input };
  // organización defensiva efectiva en la frontera de cada tiro (pública: es lo ejecutado); una consulta por hecho, no por posesión
  for (const sh of shots) sh.pub.defOrg = orgAt(ixOut, 1 - sh.team, sh.seq);
  return ixOut;
}

// Vista por audiencia: combina las capas permitidas. `ctx` = { audience: 'public'|'own'|'diagnostic', team }.
export const AUDIENCES = ['public', 'own', 'diagnostic'];
export function allowed(level, fact, ctx) {
  if (level === 'pub') return true;
  if (ctx.audience === 'diagnostic') return true;
  if (level === 'own') return ctx.audience === 'own' && fact.team === ctx.team;
  return false;
}
export function viewShot(s, ctx) {
  const out = { id: s.id, seq: s.seq, period: s.period, team: s.team, valid: s.valid, clock: s.clock, scoreBefore: s.scoreBefore, gameBefore: s.gameBefore, possession: s.possession, credit: s.credit, ...s.pub };
  if (allowed('own', s, ctx)) Object.assign(out, s.own);
  if (allowed('diag', s, ctx)) Object.assign(out, s.diag);
  return out;
}
export const cacheKey = (ctx, filters) => JSON.stringify([ctx.audience, ctx.audience === 'diagnostic' ? null : ctx.team ?? null, filters ?? null]);
