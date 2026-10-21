// Compatibilidad de un perfil guardado con el motor actual (MOTOR-15 §4). Solo lectura: no convierte, no activa, no rellena.
// Distingue «módulo no compatible» (la estructura no existe en esa versión) de «valor cero» (la estructura existe y vale cero).
import { missingRequired } from './rows.js';

// Módulos que el motor actual espera, con la extensión SEM que los introdujo y la ruta que los materializa.
export const MODULES = [
  { id: 'motor02', label: 'Modos, dirección y estilos', ext: 'SEM-MOTOR02', path: 'motor02' },
  { id: 'repertoire', label: 'Repertorio de ataque', ext: 'SEM-MOTOR04', path: 'repertoire' },
  { id: 'defense', label: 'Defensa completa', ext: 'SEM-MOTOR05', path: 'defenseRepertoire' },
  { id: 'throwin', label: 'Transición y saques', ext: 'SEM-MOTOR06', path: 'throwInRepertoire' },
  { id: 'moment', label: 'Capacidades y estados', ext: 'SEM-MOTOR07', path: 'moment' },
  { id: 'coach', label: 'Entrenador y memoria', ext: 'SEM-MOTOR08', path: 'coach' },
  { id: 'regulation', label: 'Reglamento y acta', ext: 'SEM-MOTOR09', path: 'regulation' },
  { id: 'analysis', label: 'Política analítica', ext: 'SEM-MOTOR10', path: 'analysis' },
  { id: 'population', label: 'Población y generador', ext: 'SEM-MOTOR11', path: 'population' },
  { id: 'batch', label: 'Parámetros de lotes', ext: 'SEM-MOTOR12', path: 'batch' },
  { id: 'audit', label: 'Auditoría', ext: 'SEM-MOTOR13', path: 'audit' },
  { id: 'familiarity', label: 'Familiaridad y aprendizaje', ext: 'SEM-MOTOR18', path: 'familiarity' },
];
// Los que el motor deportivo necesita para jugar (el resto son de lectura, análisis u operación y tienen valor por defecto declarado).
export const REQUIRED_TO_PLAY = ['moment', 'coach', 'regulation'];

const has = (o, p) => o != null && typeof o === 'object' && p in o && o[p] != null;

export function assessProfile(effective) {
  const modules = MODULES.map((m) => ({ ...m, present: has(effective, m.path), requiredToPlay: REQUIRED_TO_PLAY.includes(m.id) }));
  let missing = []; let error = null;
  try { missing = missingRequired(effective); } catch (e) { error = e.message; }
  const lacking = modules.filter((m) => m.requiredToPlay && !m.present).map((m) => m.id);
  const ready = !error && !lacking.length && !missing.length;
  return {
    identity: { id: effective?.id ?? null, effectiveId: effective?.effectiveId ?? null, extensions: (effective?.extensions ?? []).map((e) => e.id) },
    modules, missingModules: modules.filter((m) => !m.present).map((m) => m.id), lackingToPlay: lacking,
    missingRequiredRows: missing.length, error, ready,
    summary: ready ? 'compatible con el motor actual' : error ? `no se pudo evaluar: ${error}` : lacking.length ? `no puede jugar el motor actual: faltan ${lacking.join(', ')}` : `incompleto: ${missing.length} filas requeridas ausentes`,
  };
}
