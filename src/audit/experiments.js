// Doce contrastes iniciales EXP13-01…12 y reserva de validación (MOTOR-13 §8, §13). Son DATOS que se materializan como especificaciones de lote de MOTOR-12 (no doce motores): un caso por
// experimento × dos variantes = 24 encuentros nuevos (diagnóstico completo en EXP13-08 y EXP13-11, reducido en el resto). La intervención, los actores y las variables conservadas se fijan
// ANTES de mirar resultados; la selección de actores usa reglas sobre las fichas (no sobre el marcador). Las semillas de lote 131001–131012 (exploratorios) y 132001–132004 (reserva) se
// derivan con el procedimiento vigente LOT-SEED-R1 y se congelan en cada lote.
import * as P from '../population/index.js';

const CONSERVED = ['mismos equipos (fichas y planes) salvo la intervención declarada', 'misma semilla deportiva del caso en las dos variantes (la trayectoria puede divergir tras una decisión distinta)', 'mismo perfil efectivo congelado', 'estado inicial limpio salvo el estado declarado'];
const nat = (profile, players, id) => P.referenceTeam(profile, players, id);
const hist = (profile, players, id) => P.referenceTeam(profile, players, id, { revision: 'R0', planKind: 'historical' });

// Reglas de selección de actores, aplicadas a las FICHAS antes de cualquier partido.
export const exteriorFinishers = (team) => { const st = new Set(Object.values(team.plan.starters)); return team.players.filter((p) => st.has(p.id) && p.finishingVocation >= 0.75 && (p.zonePreference?.three ?? 0) >= 0.5).map((p) => p.id.slice(-3)); };

export function experimentCatalog(profile, players) {
  const E = profile.audit.campaign; const seed = (n) => E.explorationSeedBase + n - 1;
  const t = (ref, id) => nat(profile, players, id);
  const eq02 = t(null, 'EQ02'); const ext = exteriorFinishers(eq02); const coach11 = t(null, 'EQ11').plan.coach;
  const mk = (o) => ({ conserved: CONSERVED, level: 'reduced', ...o });
  return [
    mk({ id: 'EXP13-01', n: 1, name: 'Pase +3 en el director', pair: ['EQ01', 'EQ02'], teams: ['EQ01', 'EQ02'], hypothesis: 'TEC08 +3 (24→27) en el primer director de EQ01 frente a la base: ¿cómo cambian pérdidas de pase, ventanas, creación y selección? (no AS como único efecto)', capabilities: ['TEC08'], metrics: ['pérdidas de pase', 'ventanas', 'creación', 'selección', 'recetas TAR07'],
      variants: [{ id: 'V0', label: 'Base' }, { id: 'V1', label: 'TEC08 +3 al director de EQ01', ops: [{ op: 'ability', team: 'A', player: 'director', attrs: ['TEC08'], delta: 3 }] }] }),
    mk({ id: 'EXP13-02', n: 2, name: 'Triple +3 en finalizadores exteriores', pair: ['EQ02', 'EQ09'], teams: ['EQ02', 'EQ09'], hypothesis: `TEC01 +3 en los finalizadores exteriores titulares de EQ02 seleccionados por regla de ficha (vocación ≥ 0,75 y preferencia de triple ≥ 0,5): ${ext.join(', ')}. Conversión condicionada y cambios de atención/elección si están modelados.`, capabilities: ['TEC01'], metrics: ['conversión de triple condicionada', 'atención/elección'],
      variants: [{ id: 'V0', label: 'Base' }, { id: 'V1', label: `TEC01 +3 a ${ext.join(', ')} de EQ02`, ops: ext.map((j) => ({ op: 'ability', team: 'A', player: j, attrs: ['TEC01'], delta: 3 })) }] }),
    mk({ id: 'EXP13-03', n: 3, name: 'Lectura del director (MEN02 y MEN03 +3)', pair: ['EQ06', 'EQ05'], teams: ['EQ06', 'EQ05'], hypothesis: 'MEN02 y MEN03 +3 al mismo director de EQ06 (intervención en DOS capacidades, declarada): percepción/elección y calidad.', capabilities: ['MEN02', 'MEN03'], metrics: ['percepción', 'elección', 'calidad de oportunidad'],
      variants: [{ id: 'V0', label: 'Base' }, { id: 'V1', label: 'MEN02 y MEN03 +3 al director de EQ06', ops: [{ op: 'ability', team: 'A', player: 'director', attrs: ['MEN02', 'MEN03'], delta: 3 }] }] }),
    mk({ id: 'EXP13-04', n: 4, name: 'Libertad 1 frente a 5', pair: ['EQ01', 'EQ02'], teams: ['EQ01', 'EQ02'], allowBaseOps: true, hypothesis: 'Libertad del libro nivel 1 frente a 5 en EQ01 con el mismo libro y plantilla (las dos variantes fijan el valor: conversión de escala explícita = nivel 1 / nivel 5 de la escala vigente 1–5).', capabilities: ['MEN01', 'MEN03'], metrics: ['prioridades', 'autonomía', 'lectura', 'reloj', 'riesgo'],
      variants: [{ id: 'V0', label: 'Libertad 1', ops: [{ op: 'style', team: 'A', key: 'freedom', value: 1 }] }, { id: 'V1', label: 'Libertad 5', ops: [{ op: 'style', team: 'A', key: 'freedom', value: 5 }] }] }),
    mk({ id: 'EXP13-05', n: 5, name: 'Individual frente a zona 2–3', pair: ['EQ10', 'EQ04'], teams: ['EQ10', 'EQ04'], allowBaseOps: true, hypothesis: 'EQ10 defiende ORG01 (individual) frente a ORG02 (zona 2–3) con los mismos jugadores: responsabilidades, recepción/tiro concedidos y costes (no un factor genérico de zona).', capabilities: ['TEC12', 'TEC13', 'TEC16'], metrics: ['responsabilidades', 'calidad concedida', 'coste'],
      variants: [{ id: 'V0', label: 'ORG01 individual', ops: [{ op: 'plan', team: 'A', key: 'defense', value: 'ORG01' }] }, { id: 'V1', label: 'ORG02 zona 2–3', ops: [{ op: 'plan', team: 'A', key: 'defense', value: 'ORG02' }] }] }),
    mk({ id: 'EXP13-06', n: 6, name: 'Presión normal frente a tres cuartos', pair: ['EQ10', 'EQ04'], teams: ['EQ10', 'EQ04'], allowBaseOps: true, hypothesis: 'Altura de presión de EQ10 normal frente a three_quarters: tiempo y errores de avance, carga y concesión al superarla.', capabilities: ['TEC12', 'FIS01', 'FIS06'], metrics: ['tiempo de avance', 'errores', 'carga', 'concesión'],
      variants: [{ id: 'V0', label: 'Presión normal', ops: [{ op: 'plan', team: 'A', key: 'pressureHeight', value: 'normal' }] }, { id: 'V1', label: 'Presión tres cuartos', ops: [{ op: 'plan', team: 'A', key: 'pressureHeight', value: 'three_quarters' }] }] }),
    mk({ id: 'EXP13-07', n: 7, name: 'Después del tiro 2 frente a 4', pair: ['EQ03', 'EQ10'], teams: ['EQ03', 'EQ10'], allowBaseOps: true, hypothesis: 'Carga de rebote ofensivo («después del tiro») nivel 2 frente a 4 en EQ03: rebote ofensivo, balance y transición rival con ofertas/fallos comparables.', capabilities: ['TEC17', 'TEC18', 'FIS05'], metrics: ['rebote ofensivo', 'balance', 'transición rival'],
      variants: [{ id: 'V0', label: 'Después del tiro 2', ops: [{ op: 'style', team: 'A', key: 'afterShot', value: 2 }] }, { id: 'V1', label: 'Después del tiro 4', ops: [{ op: 'style', team: 'A', key: 'afterShot', value: 4 }] }] }),
    mk({ id: 'EXP13-08', n: 8, name: 'Energía 100 frente a 30 (referencia EQ11)', pair: ['EQ11', 'EQ12'], teams: ['EQ11', 'EQ12'], level: 'diagnostic', hypothesis: 'EQ11-J03 (anotador referente) a energía inicial 100 frente a 30, sin retirada obligatoria por 30: valor actual/relevo y efectos físicos.', capabilities: ['FIS06'], metrics: ['valor actual', 'relevo', 'efectos físicos'],
      variants: [{ id: 'V0', label: 'EQ11-J03 a energía 100 (base)' }, { id: 'V1', label: 'EQ11-J03 a energía 30', ops: [{ op: 'state', team: 'A', player: 'J03', key: 'energy', value: 30 }] }] }),
    mk({ id: 'EXP13-09', n: 9, name: 'Forma −0,5 frente a +0,5', pair: ['EQ01H', 'EQ02H'], teams: ['EQ01H', 'EQ02H'], historical: true, allowBaseOps: true, hypothesis: 'Forma de EQ01-J03 −0,5 frente a +0,5 (escala vigente −1…1) en la referencia histórica, con energía y momentos iguales.', capabilities: [], metrics: ['estado persistente de entrada', 'tareas pertinentes'],
      variants: [{ id: 'V0', label: 'Forma −0,5', ops: [{ op: 'state', team: 'A', player: 'J03', key: 'form', value: -0.5 }] }, { id: 'V1', label: 'Forma +0,5', ops: [{ op: 'state', team: 'A', player: 'J03', key: 'form', value: 0.5 }] }] }),
    mk({ id: 'EXP13-10', n: 10, name: 'Consistencia 10 frente a 24', pair: ['EQ01H', 'EQ02H'], teams: ['EQ01H', 'EQ02H'], historical: true, allowBaseOps: true, hypothesis: 'MEN06 de EQ01-J03 (natural 17) fijada a 10 frente a 24 (deltas −7 y +7 sobre la ficha; escala 1–30). Variación/episodios, complementada por el protocolo neutral fijo de MOTOR-07.', capabilities: ['MEN06'], metrics: ['amplitud de variación', 'episodios'],
      variants: [{ id: 'V0', label: 'MEN06 = 10 (−7)', ops: [{ op: 'ability', team: 'A', player: 'J03', attrs: ['MEN06'], delta: -7 }] }, { id: 'V1', label: 'MEN06 = 24 (+7)', ops: [{ op: 'ability', team: 'A', player: 'J03', attrs: ['MEN06'], delta: 7 }] }] }),
    mk({ id: 'EXP13-11', n: 11, name: 'T colectivo inicial −0,5 frente a +0,5', pair: ['EQ01H', 'EQ02H'], teams: ['EQ01H', 'EQ02H'], historical: true, allowBaseOps: true, level: 'diagnostic', hypothesis: 'T inicial de EQ01 −0,5 frente a +0,5, resto igual: coordinación/tareas autorizadas y presupuesto compartido, sin bonus directo de tiro.', capabilities: [], metrics: ['coordinación', 'tareas autorizadas', 'presupuesto compartido'],
      variants: [{ id: 'V0', label: 'T inicial −0,5', ops: [{ op: 'plan', team: 'A', key: 'initialTeamMoment', value: -0.5 }] }, { id: 'V1', label: 'T inicial +0,5', ops: [{ op: 'plan', team: 'A', key: 'initialTeamMoment', value: 0.5 }] }] }),
    mk({ id: 'EXP13-12', n: 12, name: 'Política cauta frente a agresiva', pair: ['EQ11', 'EQ12'], teams: ['EQ11', 'EQ12'], allowBaseOps: true, hypothesis: 'Política del entrenador de EQ11 ENTREF01 (cauta) frente a ENTREF03 (agresiva), misma plantilla, plan y contexto: rotación, faltas, pausas, ajuste y riesgo contextual (no talento del entrenador).', capabilities: [], metrics: ['rotación', 'faltas', 'pausas', 'ajuste', 'riesgo'],
      variants: [{ id: 'V0', label: 'Política ENTREF01 (cauta)', ops: [{ op: 'plan', team: 'A', key: 'coach', value: { policy: 'ENTREF01', delegation: coach11.delegation } }] }, { id: 'V1', label: 'Política ENTREF03 (agresiva)', ops: [{ op: 'plan', team: 'A', key: 'coach', value: { policy: 'ENTREF03', delegation: coach11.delegation } }] }] }),
  ].map((e) => ({ ...e, batchSeed: seed(e.n) }));
}

// Reserva de validación (§13.4): cuatro casos distintos de los exploratorios, semillas de lote 132001–132004.
export function validationCatalog(profile) {
  const s = profile.audit.campaign.validationSeedBase;
  return [{ id: 'VAL13-01', pair: ['EQ01H', 'EQ02H'], historical: true, batchSeed: s }, { id: 'VAL13-02', pair: ['EQ03', 'EQ09'], batchSeed: s + 1 }, { id: 'VAL13-03', pair: ['EQ07', 'EQ08'], batchSeed: s + 2 }, { id: 'VAL13-04', pair: ['EQ11', 'EQ12'], batchSeed: s + 3 }];
}

// Especificación de lote de MOTOR-12 para un experimento (un caso, dos variantes, localía fija, 1 repetición).
export function experimentSpec(exp, profile, players, { variants = null } = {}) {
  const ids = [...new Set(exp.pair)]; const teams = Object.fromEntries(ids.map((id) => [id, id.endsWith('H') ? hist(profile, players, id.slice(0, -1)) : nat(profile, players, id)]));
  // el selector «A» se sustituye por la identidad lógica explícita del equipo (un selector que no resuelve se rechaza, no se aplica en silencio)
  const logical = (ref) => ref.replace(/H$/, ''); const fixOps = (ops) => ops?.map((o) => ({ ...o, team: o.team === 'A' ? logical(exp.pair[0]) : o.team === 'B' ? logical(exp.pair[1]) : o.team }));
  return { mode: 'pairs', pairs: [exp.pair], repetitions: 1, venue: 'fixed', batchSeed: exp.batchSeed, teams, recordLevel: exp.level ?? 'reduced', prose: 'omitted', allowBaseOps: !!exp.allowBaseOps,
    objective: `${exp.id} · ${exp.name}`, question: exp.hypothesis, conserved: exp.conserved, variants: (variants ?? exp.variants).map((v) => ({ ...v, ...(v.ops ? { ops: fixOps(v.ops) } : {}) })) };
}
