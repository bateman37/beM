// Identidades y versiones propias de SIM-MOTOR (generador estadístico por tramos). No reutilizan el formato de repetición del motor detallado.
export const SIM_MODEL = 'beM-sim-segment';
export const SIM_RESULT_SCHEMA = 'beM-sim-match/2';
export const SIM_RESULT_SCHEMA_V1 = 'beM-sim-match/1';
export const SIM_SNAPSHOT_SCHEMA = 'beM-sim-snapshot/1';
export const SIM_MATCHDAY_SCHEMA = 'beM-sim-matchday/1';
export const SIM_INPUT_SCHEMA = 'beM-sim-input/1';
// Perfil: la base de SIM-MOTOR-01 conserva su identidad; SIM-MOTOR-02 la amplía con una extensión identificada (filas nuevas, origen SEM-SIM02).
export const SIM_BASE_PROFILE_ID = 'SEM-SIM01-20261022';
export const SIM_EXTENSION_ID = 'SEM-SIM02-20261022';
export const SIM_PROFILE_ID = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}`;
export const SIM_VERSION = '0.2.1-SIMMOTOR02B';
// Revisión de implementación anterior cuyos guardados continúan EXACTAMENTE con esta (comprobado con un guardado real de 4194158; el generador por tramos no cambió en 02B).
export const SIM_VERSION_02 = '0.2.0-SIMMOTOR02';
// Matriz de compatibilidad de lectura (C03-03): un guardado se continúa solo si su revisión SIM y su formato de resultado figuran aquí; compartir el número de `schema` no basta.
export const SIM_SNAPSHOT_COMPAT = { schemas: ['beM-sim-snapshot/1'], simVersions: [SIM_VERSION, SIM_VERSION_02], resultSchemas: ['beM-sim-match/2'] };
export const SIM_COVERAGE_ID = 'COV-SIM02-R1';
export const SIM_STATS_POLICY_ID = 'EST-SIM02-R1';
export const SIM_RECON_POLICY_ID = 'RECON-SIM02-R1';
export const SIM_MASTER_SEED = 20261022;
