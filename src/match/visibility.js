// Visibilidad de los estados (MOTOR-07, §11.2): tres vistas con política de conocimiento distinta. Ninguna consume azar ni actualiza estados:
// usan valores ya comprometidos y, para los momentos, la proyección determinista de atenuación (identificada como tal).
//  · propia:       energía con número y barra; Forma y momentos solo como categorías cualitativas con su ámbito legible; T como conexión del equipo.
//  · rival:        solo hechos públicos (en pista, faltas, racha observable). Nunca números internos de energía, Forma o momentos.
//  · diagnóstico:  laboratorio: números, timestamps, episodios y pausas. No se entrega al decisor ni al entrenador automático.
import { momentCategory, CATEGORY_LABELS } from './formulas.js';
import { MOMENT_SCOPES } from './states.js';

export const SCOPE_TEXT = { M_TIR: 'Tiro', M_OFE: 'Control y ejecución ofensiva', M_DEF: 'Defensa y disputa' };
const lab = (kind, profile, v) => CATEGORY_LABELS[kind][momentCategory(profile, v)];

export function ownStateView(m, team) {
  const players = m.teams[team].ids.map((id) => {
    const s = m.ps[id];
    return {
      id, enPista: s.onCourt, disponible: s.available, energia: Math.round(s.energy), formaCategoria: lab('forma', m.profile, s.form),
      momentos: Object.fromEntries(MOMENT_SCOPES.map((k) => [k, { ambito: SCOPE_TEXT[k], categoria: lab('momento', m.profile, m.momentView(id, k).proyeccionDeterminista) }])),
    };
  });
  const t = m.teamMomentView(team).proyeccionDeterminista;
  return { equipo: m.teams[team].id, jugadores: players, conexionDelEquipo: { categoria: lab('equipo', m.profile, t), nota: 'respuesta y conexión del equipo (coordinación y elección), no un multiplicador de tiro' } };
}

// Racha pública del equipo: hechos observables del acta (canastas o fallos de campo consecutivos). No prueba un estado interno.
export function publicStreak(m, team) {
  let made = 0; let missed = 0; let dir = null;
  for (let i = m.events.length - 1; i >= 0; i--) {
    const sh = (m.events[i].stats ?? []).find((x) => x.k === 'shot' && x.team === team);
    if (!sh) continue;
    const r = sh.made ? 'made' : 'miss';
    if (dir == null) dir = r; if (r !== dir) break;
    if (r === 'made') made += 1; else missed += 1;
  }
  const n = Math.max(made, missed);
  return n >= 3 ? { tipo: dir === 'made' ? 'aciertos' : 'fallos', longitud: n, texto: `racha de ${n} ${dir === 'made' ? 'canastas' : 'tiros fallados'} seguidos (observable en el acta; no prueba un estado interno)` } : null;
}

export function rivalPublicView(m, team) {
  return {
    equipo: m.teams[team].id,
    jugadores: m.teams[team].ids.map((id) => ({ id, enPista: m.ps[id].onCourt, disponible: m.ps[id].available, faltas: m.ps[id].fouls })),
    racha: publicStreak(m, team),
    nota: 'la energía, la Forma y los momentos internos del rival no se muestran',
  };
}

// Vista de laboratorio: números comprometidos, proyección, timestamps, episodios y pausas.
export function diagnosticView(m) {
  const players = {};
  for (const id of Object.keys(m.ps)) players[id] = { forma: m.ps[id].form, energia: Math.round(m.ps[id].energy * 100) / 100, momentos: Object.fromEntries(MOMENT_SCOPES.map((k) => [k, m.momentView(id, k)])) };
  return { fronteraDeActualizacion: `${m.sportT / 10} s de juego vivo`, importancia: m.importance, jugadores: players, equipos: m.teams.map((t, i) => ({ id: t.id, T: m.teamMomentView(i) })), pausas: m.pauses, episodios: m.episodeLog, aviso: 'diagnóstico de laboratorio: no se filtra al decisor ni al entrenador automático; se calcula sin consumir azar' };
}
