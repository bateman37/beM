// Identidades y versiones propias de SIM-MOTOR (generador estadístico por tramos). No reutilizan el formato de repetición del motor detallado.
export const SIM_MODEL = 'beM-sim-segment';
export const SIM_RESULT_SCHEMA = 'beM-sim-match/3';
export const SIM_RESULT_SCHEMA_V2 = 'beM-sim-match/2';
export const SIM_RESULT_SCHEMA_V1 = 'beM-sim-match/1';
export const SIM_SNAPSHOT_SCHEMA = 'beM-sim-snapshot/2';
export const SIM_SNAPSHOT_SCHEMA_V1 = 'beM-sim-snapshot/1';
export const SIM_MATCHDAY_SCHEMA = 'beM-sim-matchday/1';
export const SIM_INPUT_SCHEMA = 'beM-sim-input/1';
// Perfil: la base de SIM-MOTOR-01 conserva su identidad; SIM-MOTOR-02 la amplía con una extensión identificada (filas nuevas, origen SEM-SIM02).
export const SIM_BASE_PROFILE_ID = 'SEM-SIM01-20261022';
export const SIM_EXTENSION_ID = 'SEM-SIM02-20261022';
// SIM-MOTOR-04 (SEM-SIM04-20261023): correcciones C04-01…06 y filas nuevas SIM (rebote colectivo, mezcla de tiro). Las filas de 01/02 no se mutan.
export const SIM04_EXTENSION_ID = 'SEM-SIM04-20261023';
export const SIM_PROFILE_ID = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}+${SIM04_EXTENSION_ID}`;
export const SIM_PROFILE_ID_03 = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}`;
export const SIM_VERSION = '0.3.0-SIMMOTOR04';
// Revisiones anteriores (referencia de lectura; NO se continúan): 04 cambia el futuro de un partido en curso (rebote colectivo, bloqueador sorteado, presión con familiaridad) y el formato del estado.
export const SIM_VERSION_02B = '0.2.1-SIMMOTOR02B';
export const SIM_VERSION_02 = '0.2.0-SIMMOTOR02';
// Matriz de compatibilidad de lectura (C03-03, C04): un guardado se continúa solo si su revisión SIM y su formato de resultado figuran aquí; compartir el número de `schema` no basta.
// Los guardados de 02/02B/03 se RECHAZAN con explicación (SIM_SNAPSHOT_REJECTED): su futuro cambia con 04 y no puede demostrarse la semántica exacta.
export const SIM_SNAPSHOT_COMPAT = { schemas: ['beM-sim-snapshot/2'], simVersions: [SIM_VERSION], resultSchemas: ['beM-sim-match/3'] };
export const SIM_SNAPSHOT_REJECTED = { simVersions: [SIM_VERSION_02B, SIM_VERSION_02], reason: 'SIM-MOTOR-04 cambia el futuro de un partido en curso (rebote ofensivo colectivo C04-01, bloqueador sorteado C04-03, familiaridad de presión C04-04) y el formato del estado; no puede demostrarse la continuación exacta de un guardado anterior. El archivo se conserva intacto.' };
export const SIM_COVERAGE_ID = 'COV-SIM04-R1';
export const SIM_STATS_POLICY_ID = 'EST-SIM04-R1';
export const SIM_RECON_POLICY_ID = 'RECON-SIM04-R1';
export const SIM_MASTER_SEED = 20261022;
export const SIM04_MASTER_SEED = 20261023;
