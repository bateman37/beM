// Conciliación de la capa analítica (MOTOR-10): comprueba que las tablas y consultas derivadas CUADRAN con el acta y con los hechos. Prueba consistencia de la lectura,
// no conformidad normativa. Una desviación se muestra; no se corrige alterando el acta.
import { analyze } from './index.js';

export function reconcileAnalysis(res) {
  const a = analyze(res, { audience: 'diagnostic', team: 0 }); const ix = a.ix; const acta = ix.acta; const checks = [];
  const add = (id, area, universe, expected, observed) => checks.push({ id, area, universe, expected, observed, ok: JSON.stringify(expected) === JSON.stringify(observed) });
  const T = [0, 1];
  for (const t of T) {
    const valid = ix.shots.filter((s) => s.team === t && s.valid); const tot = acta.teams[t].totals;
    add(`AN01-${t}`, 'tiro', 'intentos de campo válidos', [tot.fga, tot.fgm, tot.fg3a, tot.fg3m], [valid.length, valid.filter((s) => s.pub.made).length, valid.filter((s) => s.pub.zone === 'three').length, valid.filter((s) => s.pub.zone === 'three' && s.pub.made).length]);
    add(`AN02-${t}`, 'mapa y calidad', 'intentos válidos', [valid.length, valid.length], [a.sectors(t).reduce((s, x) => s + x.att, 0), a.quality(t).reduce((s, x) => s + x.att, 0)]);
    add(`AN03-${t}`, 'producción', 'puntos del equipo', [acta.teams[t].points, acta.teams[t].points], [a.production()[t].partitionKind.total, a.production()[t].partitionOrigin.total]);
    const o = a.origin(t); add(`AN05-${t}`, 'origen', 'posesiones del equipo', [acta.possessions.filter((p) => p.team === t).length, acta.teams[t].points], [o.rows.reduce((s, r) => s + r.poss, 0), o.linkedPoints + o.unlinkedPoints]);
    add(`AN06-${t}`, 'ejecuciones', 'interacciones resueltas', a.executionList(t).length, a.executions(t).rows.reduce((s, r) => s + r.ex, 0));
    add(`AN11-${t}`, 'asistencias', 'AS a canasta', tot.astFg, valid.filter((s) => s.pub.made && s.credit).length);
    const lt = a.lineups(t).rows; const lineupMin = lt.reduce((s, r) => s + r.minutes, 0);
    add(`AN07-${t}`, 'presencia', 'minutos de quintetos = tiempo total de juego', Math.round(ix.totalTenths) / 600, Math.round(lineupMin * 600) / 600);
    const nonAdmin = acta.pointEvents.filter((p) => p.team === t && p.kind !== 'admin').reduce((s, p) => s + p.pts, 0);
    add(`AN09-${t}`, 'presencia', 'puntos a favor sumados por quintetos', nonAdmin, lt.reduce((s, r) => s + r.ptsFor, 0));
    const partial = 0; add(`AN08-${t}`, 'posesiones completas y mixtas', 'cada posesión cuenta una vez en la unidad del equipo', ix.possessions.length, lt.reduce((s, r) => s + r.ownComplete + r.rivalComplete + r.mixed, 0) + partial);
  }
  add('AN04', 'margen', 'diferencia del tanteo de cancha', true, a.margin().ok);
  const e = a.ev(); const last = e.curve[e.curve.length - 1]; add('AN12', 'evolución', 'marcador final de la curva', acta.score, last.score);
  add('AN14', 'tiempo por delante', 'décimas de juego vivo', ix.totalTenths, e.time.ahead[0] + e.time.ahead[1] + e.time.tied);
  const first = ix.res.players ? null : null; void first;
  const refs = new Set([...ix.events.map((x) => x.id), ...ix.possessions.map((p) => p.id), ...(res.diagnostics?.throwInChains ?? []).map((c) => c.id)]); const bad = [];
  for (const k of a.summary().keys) for (const id of k.evidence.ids) if (!refs.has(id)) bad.push(id);
  add('AN13', 'evidencia', 'las claves del resumen remiten a hechos existentes', [], bad);
  const oo = a.onOff([Object.keys(ix.teamOf).find((id) => ix.teamOf[id] === 0)]); add('AN10', 'on/off', 'con + sin + parcial = tiempo total', ix.totalTenths, oo.with.tenths + oo.without.tenths + oo.partialTenths);
  return { version: 'RECAN-MOTOR10-R1', total: checks.length, failed: checks.filter((c) => !c.ok), ok: checks.every((c) => c.ok), checks };
}
