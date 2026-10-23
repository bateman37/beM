// Escenarios pequeños de laboratorio para acreditar la integración (§7.3, §9.3). No son un calendario mundial: son fixtures identificadas, con tablas iniciales ARTIFICIALES declaradas como tales.
import { retargetTeam, dropStaleRivalRefs } from '../population/index.js';
import { INPUT_SCHEMA } from '../match/data.js';
import { referenceTeamMap, buildPairInput } from '../sim/teams.js';
import { deriveSeed } from '../sim/rng.js';

const strip = (t) => ({ id: t.id, name: t.name, players: t.players.map(({ provenance, ...p }) => p), plan: t.plan, source: t.source });
export const YOUTH_AGES = [16, 17, 18];
// Equipo de cantera: COPIA identificada del material de laboratorio con identidades nuevas (`<EQ>U`) y edades explícitas de 16–18. No es una afirmación de calibración empírica juvenil.
export function youthTeam(template, suffix = 'U') {
  const t = retargetTeam(template, `${template.id}${suffix}`); t.name = `Sub-20 ${template.name ?? template.id}`;
  t.players.forEach((p, i) => { p.age = YOUTH_AGES[i % 3]; p.name = `${p.name ?? p.id} (Sub-20)`; });
  t.source = { ...t.source, kind: 'youth-copy', youth: { of: template.id, ages: YOUTH_AGES, note: 'copia de laboratorio con edades explícitas; sin calibración empírica juvenil' } };
  return t;
}
export function buildTeamsInput(a, b, { seed, importance = 'ordinary' }) {
  const A = JSON.parse(JSON.stringify(a)); const B = JSON.parse(JSON.stringify(b));
  dropStaleRivalRefs(A, B.players.map((p) => p.id)); dropStaleRivalRefs(B, A.players.map((p) => p.id));
  return { schema: INPUT_SCHEMA, seed, importance, teams: [strip(A), strip(B)] };
}
// Tabla de partida ARTIFICIAL (hipotética): sirve para probar un final clasificatorio y se identifica como distinta del historial calculado.
export const artificialTable = (rows) => ({ artificial: true, note: 'tabla inicial hipotética de fixture; no procede de partidos calculados', rows });

// Última jornada mixta: seis equipos sénior (SEN-A) con tres partidos a la misma hora —uno del sénior PROPIO con el motor detallado y dos SIM—, otro encuentro SIM con inicio desplazado (SEN-B) y un encuentro de la
// cantera propia (SUB20), también SIM. EQ03 declara una necesidad de clasificación (terminar entre los dos primeros) evaluada desde la tabla provisional.
export function buildMixedScenario(profile, csvPlayers, { master = 20261022, offsetSeconds = 600, own = 'EQ01' } = {}) {
  const tm = referenceTeamMap(profile, csvPlayers); const seed = (k) => deriveSeed(master, `JORNADA|${k}`);
  const senior = (id, a, b, over = {}) => ({ id, competition: 'SEN-A', resolver: 'sim', start: 0, input: buildPairInput(tm, a, b, { seed: seed(id), importance: 'important' }), ...over });
  const fixtures = [
    senior('F1', own, 'EQ02', { resolver: 'detailed', controlledTeams: [0], label: 'Sénior propio (motor detallado)' }),
    senior('F2', 'EQ03', 'EQ04', { label: 'SIM' }), senior('F3', 'EQ05', 'EQ06', { label: 'SIM' }),
    { id: 'F4', competition: 'SEN-B', resolver: 'sim', start: offsetSeconds, label: `SIM con inicio desplazado (+${offsetSeconds} s)`, input: buildPairInput(tm, 'EQ07', 'EQ08', { seed: seed('F4'), importance: 'important' }) },
    { id: 'F5', competition: 'SUB20', resolver: 'sim', start: 0, youth: true, label: 'Cantera propia (SIM)', input: buildTeamsInput(youthTeam(tm[own]), youthTeam(tm.EQ02), { seed: seed('F5'), importance: 'important' }) },
  ];
  const standings0 = {
    'SEN-A': artificialTable([['EQ01', 7, 3, 810, 742], ['EQ02', 6, 4, 790, 765], ['EQ03', 5, 5, 776, 770], ['EQ04', 5, 5, 770, 774], ['EQ05', 4, 6, 745, 790], ['EQ06', 3, 7, 730, 780]].map(([team, w, l, pf, pa]) => ({ team, w, l, pf, pa }))),
    'SEN-B': artificialTable([['EQ07', 6, 4, 800, 770], ['EQ08', 5, 5, 780, 780]].map(([team, w, l, pf, pa]) => ({ team, w, l, pf, pa }))),
    SUB20: artificialTable([[`${own}U`, 4, 2, 480, 450], ['EQ02U', 3, 3, 470, 470]].map(([team, w, l, pf, pa]) => ({ team, w, l, pf, pa }))),
  };
  const objectives = [{ team: 'EQ03', competition: 'SEN-A', kind: 'rank', target: 2 }];
  return { fixtures, standings0, objectives, teamMap: tm };
}
