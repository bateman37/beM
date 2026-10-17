// Población de referencia (POB01): doce equipos, 144 plazas con identidad estable y planes naturales materializados. Las fichas proceden SIEMPRE del CSV del anexo B de
// MOTOR-01 (revisión R0, intacto) más las revisiones explícitas de `population.revisions`; nunca se sortean al abrir la pantalla ni se copian de un equipo a otro.
import { deepCopy } from '../match/data.js';
import { fingerprint } from './hash.js';

export const REFERENCE_IDS = Array.from({ length: 12 }, (_, i) => `EQ${String(i + 1).padStart(2, '0')}`);
export const popOf = (profile) => profile?.population ?? null;
export const genOf = (profile) => profile?.generator ?? null;

// Aplica una revisión: devuelve jugadores NUEVOS (el CSV R0 no se toca) con su procedencia por plaza.
export function revisedPlayers(profile, csvPlayers, revisionId = null) {
  const pop = popOf(profile); const target = revisionId ?? pop.currentRevision;
  const order = pop.revisions.map((r) => r.id); const upto = order.indexOf(target);
  if (upto < 0) throw new Error(`revisión desconocida: ${target}`);
  const players = csvPlayers.map((p) => ({ ...deepCopy(p), provenance: [{ revision: 'R0', source: pop.revisions[0].source, label: pop.revisions[0].label }] }));
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  for (const rev of pop.revisions.slice(1, upto + 1)) {
    for (const c of rev.changes) {
      const p = byId[c.player]; if (!p) throw new Error(`la revisión ${rev.id} cita un jugador inexistente: ${c.player}`);
      if (c.before !== undefined && p[c.field] !== c.before) throw new Error(`la revisión ${rev.id} espera ${c.field} = ${c.before} en ${c.player} y hay ${p[c.field]}`);
      p[c.field] = c.after;
      p.provenance.push({ revision: rev.id, source: rev.source, label: rev.label, change: `${c.field}: ${c.before} → ${c.after}`, note: c.note });
    }
  }
  return players;
}

// Equipo de referencia completo: fichas de la revisión + plan natural versionado. `planKind: 'historical'` usa el plan de MOTOR-10 (solo EQ01/EQ02).
export function referenceTeam(profile, csvPlayers, teamId, { revision = null, planKind = 'natural' } = {}) {
  const pop = popOf(profile); const spec = pop.teams[teamId]; if (!spec) throw new Error(`equipo de referencia desconocido: ${teamId}`);
  const rev = revision ?? pop.currentRevision;
  const players = revisedPlayers(profile, csvPlayers, rev).filter((p) => p.teamId === teamId);
  let plan; let planVersion;
  if (planKind === 'historical') {
    const hist = profile.scenario.plans.find((p) => p.teamId === teamId);
    if (!hist) throw new Error(`${teamId} no tiene plan histórico de MOTOR-10`);
    plan = deepCopy(hist); planVersion = 'histórico MOTOR-10';
  } else { plan = deepCopy(spec.plan); planVersion = spec.planVersion; }
  const team = { id: teamId, name: spec.name, players, plan };
  team.source = { kind: 'reference', teamId, revision: rev, dataset: pop.version, planKind, planVersion, identity: spec.identity };
  team.source.fingerprint = fingerprint({ players: team.players.map(({ provenance, ...p }) => p), plan: team.plan });
  return team;
}
export const referenceTeams = (profile, csvPlayers, opts) => REFERENCE_IDS.map((id) => referenceTeam(profile, csvPlayers, id, opts));

// Entrada histórica de MOTOR-10 (LAB11-00): fichas iniciales R0 y planes históricos, idéntica a buildMatchInput del perfil.
export function historicalPair(profile, csvPlayers) {
  return profile.scenario.plans.map((pl) => referenceTeam(profile, csvPlayers, pl.teamId, { revision: 'R0', planKind: 'historical' }));
}
