// Registro ESENCIAL de un partido SIM para el mundo (Referencia / esencial de temporada, §9.1): identidad, entrada/perfil/semilla, resultado, duración y acta individual y de equipo con numeradores y
// denominadores, más los desgloses compactos que comprometen los acumulados (zonas, familias con libres y finalizaciones únicas, exposición de aprendizaje). No retiene la secuencia completa de hechos.
// Cambiar el nivel de conservación NO cambia azar, producción, alineaciones ni consecuencias; un resultado de Referencia no se re-simula para fabricar un mapa o secuencia que no se conservó.
import { buildSimResult } from './result.js';
import { reconcileResult } from './reconcile.js';
import { SIM_MODEL, SIM_VERSION, SIM_STATS_POLICY_ID, SIM_RESULT_SCHEMA } from './version.js';

export const ESSENTIAL_SCHEMA = 'beM-sim-essential/1';
const LINE_KEYS = ['sec', 'pts', 'fgPts', 'ftPts', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'ftm', 'fta', 'oreb', 'dreb', 'astC', 'astL', 'tov', 'stl', 'blk', 'blkAgainst', 'pf', 'pfd', 'pm'];
const r1 = (x) => Math.round(x * 10) / 10;

// `res`: resultado ya construido con `events: false` (o completo). Devuelve el esencial compacto (acta individual por jugador incluida). Una entrada no terminada se declara `complete: false`.
export function essentialFromResult(res, { reconcile = null } = {}) {
  const rec = reconcile ?? res.reconciliation ?? null;
  const players = res.box.players.filter((p) => !p.dnp || p.sec > 0).map((p) => { const row = { id: p.id, team: p.team, starter: p.starter ? 1 : 0, ...Object.fromEntries(LINE_KEYS.map((k) => [k, k === 'sec' ? Math.round(p[k] * 1000) / 1000 : p[k]])) }; const z = {}; for (const [zn, v] of Object.entries(p.zones)) if (v.a) z[zn] = [v.a, v.m, v.q[0], v.q[1], v.q[2]]; if (Object.keys(z).length) row.zones = z; return row; });
  const teams = res.box.teams.map((t) => ({ ...Object.fromEntries(LINE_KEYS.map((k) => [k, k === 'sec' ? Math.round(t[k] * 1000) / 1000 : t[k]])), teamReb: t.teamReb, teamTov: t.teamTov }));
  const families = res.families.map((fs) => fs.map((f) => ({ key: f.key, fga: f.fga, fgm: f.fgm, fgPts: f.fgPts, ftPts: f.ftPts, pts: f.pts, fta: f.fta, ftm: f.ftm, fin: f.fin, sf: f.sf, and1: f.and1, ast: f.ast, moved: f.moved, q: f.q })));
  const exposure = {}; for (const [id, e] of Object.entries(res.exposure ?? {})) exposure[id] = { liveTenths: Math.round(Object.values(e.slotSec).reduce((a, x) => a + x, 0) * 10), positions: Object.fromEntries(Object.entries(e.slotSec).map(([k, v]) => [k, Math.round(v * 10)])), offensiveRoles: Object.fromEntries(Object.entries(e.roleSec).map(([k, v]) => [k, Math.round(v * 10)])), defensiveRoles: Object.fromEntries(Object.entries(e.defRoleSec ?? {}).map(([k, v]) => [k, Math.round(v * 10)])), modules: e.modules ?? {} };
  return {
    schema: ESSENTIAL_SCHEMA, model: SIM_MODEL, version: SIM_VERSION, resultSchema: SIM_RESULT_SCHEMA, statsPolicy: SIM_STATS_POLICY_ID, complete: res.finishedPublished === true, status: res.status,
    identity: { matchId: res.identity.matchId, attemptId: res.identity.attemptId, seed: res.identity.seed, importance: res.identity.importance, teams: res.identity.teams, inputFingerprint: res.identity.inputFingerprint, effectiveInputFingerprint: res.identity.effectiveInputFingerprint, nCommands: res.identity.nCommands, simProfile: res.identity.simProfile, simProfileFingerprint: res.identity.simProfileFingerprint, tablesFingerprint: res.identity.tablesFingerprint, sportFingerprint: res.sportFingerprint },
    score: { final: res.score.final, periods: res.score.periods, overtimes: res.score.overtimes, winner: res.score.winner }, durationSeconds: r1(res.published), controls: res.controls,
    box: { players, teams }, zones: res.zones, families, familyDenominators: res.familyDenominators, exposure,
    validity: rec ? { valid: rec.valid, evaluated: rec.evaluated, failed: rec.failed, failedIds: rec.checks.filter((c) => !c.ok).map((c) => c.id) } : null,
  };
}
// Construye el esencial de un partido terminado leyendo sus hechos (sin consumir azar). `validate=false` omite la conciliación (se declara `validity: null`, no «válido»).
export function buildSimEssential(m, { validate = true } = {}) {
  const res = buildSimResult(m, { events: false, reconcile: false, audience: 'diagnostic' });
  const rec = validate ? reconcileResult(m, res, m.events) : null;
  return essentialFromResult(res, { reconcile: rec });
}
