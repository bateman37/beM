// Tres huellas distintas (MOTOR-12 §19.1); no se usa el mismo nombre para dos contratos:
//  1. CHECKSUM de archivo/paquete: SHA-256 de los bytes exactos (en el manifest; sin circularidad).
//  2. Huella de ENTRADA efectiva (`input_id`, `entry_id`, `profile_id`, `profile_sport_fp`): configuración, participantes, estados, órdenes y parámetros, canonicalizados y con referencias resueltas.
//  3. Huella de TRAYECTORIA deportiva (`trajectory_fp`): proyección canónica de hechos, decisiones y resultado SIN nombre/versión de biblioteca del perfil, ids de lote o parte, tiempos de ejecución ni texto de presentación.
// Una renominación puramente decorativa de un perfil, un cambio de nivel de registro o de prosa no cambia la huella de trayectoria (se comprueba en tests/motor12.test.js).
import { sportsProjection } from '../match/replay.js';
import { sha256, fpOf, canonicalJson } from './hashing.js';

export const TRAJECTORY_VERSION = 'TRAY-MOTOR12-R1';
export const INPUT_FP_VERSION = 'ENT-MOTOR12-R1';
// Claves del perfil que identifican o describen (no son parámetros que consulte el motor al resolver) o que solo construyen entradas / leen resultados.
export const PROFILE_NON_SPORT_KEYS = ['id', 'effectiveId', 'extensions', 'status', 'provenance', 'scope', 'deferred', 'batch', 'analysis', 'population', 'generator', 'lab'];

// Proyección de trayectoria: la proyección deportiva existente menos la identidad de perfil con que el entrenador etiqueta sus decisiones (`version.perfil`), que es procedencia.
export function trajectoryProjection(res) {
  const p = sportsProjection(res);
  const stripVersion = (v) => { if (!v || typeof v !== 'object') return v; const { perfil, ...rest } = v; void perfil; return rest; };
  return { ...p, coach: p.coach?.map((d) => (d && d.version ? { ...d, version: stripVersion(d.version) } : d)) ?? null };
}
export const trajectoryFingerprint = (res) => sha256(canonicalJson(trajectoryProjection(res)));

export function profileSportFingerprint(profile) {
  const o = {}; for (const [k, v] of Object.entries(profile)) if (!PROFILE_NON_SPORT_KEYS.includes(k)) o[k] = v;
  return sha256(canonicalJson(o)).slice(0, 16);
}
export const profileFingerprint = (profile) => sha256(canonicalJson(profile)).slice(0, 16);
export const inputFingerprint = (input) => fpOf(input);
