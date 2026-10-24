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
// SIM-MOTOR-04B (SEM-SIM04B-20261023): tres filas SIM nuevas y neutrales (mezcla al aro, desplazamiento de calidad al aro, conservación de ventaja tras recepción acreditada). Las filas de 01/02/04 no se mutan.
export const SIM04B_EXTENSION_ID = 'SEM-SIM04B-20261023';
// SIM-MOTOR-04C (SEM-SIM04C-20261024): tres filas SIM nuevas y neutrales (reinicio organizado tras rebote ofensivo, calidad y conversión de `inside`). Las filas de 01/02/04/04B no se mutan.
export const SIM04C_EXTENSION_ID = 'SEM-SIM04C-20261024';
// SIM-MOTOR-04D (SEM-SIM04D-20261024): seis filas SIM nuevas y neutrales (peso de media distancia, desplazamiento de conversión al aro, peso de pérdida ordinaria, robo condicionado a pérdida elegible, peso de falta en tiro y odds de entrega espontánea). Las filas anteriores no se mutan.
export const SIM04D_EXTENSION_ID = 'SEM-SIM04D-20261024';
export const SIM_PROFILE_ID = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}+${SIM04_EXTENSION_ID}+${SIM04B_EXTENSION_ID}+${SIM04C_EXTENSION_ID}+${SIM04D_EXTENSION_ID}`;
export const SIM_PROFILE_ID_04C = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}+${SIM04_EXTENSION_ID}+${SIM04B_EXTENSION_ID}+${SIM04C_EXTENSION_ID}`;
export const SIM_PROFILE_ID_04B = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}+${SIM04_EXTENSION_ID}+${SIM04B_EXTENSION_ID}`;
export const SIM_PROFILE_ID_04 = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}+${SIM04_EXTENSION_ID}`;
export const SIM_PROFILE_ID_03 = `${SIM_BASE_PROFILE_ID}+${SIM_EXTENSION_ID}`;
export const SIM_VERSION = '0.3.3-SIMMOTOR04D';
// Revisiones anteriores (referencia de lectura; NO se continúan): 04 cambia el futuro de un partido en curso (rebote colectivo, bloqueador sorteado, presión con familiaridad) y el formato del estado.
export const SIM_VERSION_04C = '0.3.2-SIMMOTOR04C';
export const SIM_VERSION_04B = '0.3.1-SIMMOTOR04B';
export const SIM_VERSION_04 = '0.3.0-SIMMOTOR04';
export const SIM_VERSION_02B = '0.2.1-SIMMOTOR02B';
export const SIM_VERSION_02 = '0.2.0-SIMMOTOR02';
// Matriz de compatibilidad de lectura (C03-03, C04): un guardado se continúa solo si su revisión SIM y su formato de resultado figuran aquí; compartir el número de `schema` no basta.
// Los guardados de 02/02B/03 se RECHAZAN con explicación (SIM_SNAPSHOT_REJECTED): su futuro cambia con 04 y no puede demostrarse la semántica exacta.
export const SIM_SNAPSHOT_COMPAT = { schemas: ['beM-sim-snapshot/2'], simVersions: [SIM_VERSION], resultSchemas: ['beM-sim-match/3'] };
export const SIM_SNAPSHOT_REJECTED = { simVersions: [SIM_VERSION_04C, SIM_VERSION_04B, SIM_VERSION_04, SIM_VERSION_02B, SIM_VERSION_02], reason: 'SIM-MOTOR-04D añade seis filas SIM y un perfil con extensión nueva (la huella del perfil de un guardado de 04C no las contiene), por lo que no puede demostrarse la continuación exacta de un guardado de 04C; SIM-MOTOR-04C cambia el futuro de un partido en curso (tras un rebote ofensivo decide una rama, inmediata o reinicio organizado, y añade desplazamientos de calidad y conversión de la zona inside; 04B cambió la fatiga de la rotación y la conservación de ventaja tras recepción; 04 cambió rebote colectivo, bloqueador sorteado y familiaridad de presión) y no puede demostrarse la continuación exacta de un guardado anterior. El archivo se conserva intacto; no se implanta un resolutor histórico.' };
export const SIM_COVERAGE_ID = 'COV-SIM04D-R1';
export const SIM_STATS_POLICY_ID = 'EST-SIM04-R1';
export const SIM_RECON_POLICY_ID = 'RECON-SIM04D-R1';
export const SIM_MASTER_SEED = 20261022;
export const SIM04_MASTER_SEED = 20261023;
export const SIM04B_MASTER_SEED = 20261023;
export const SIM04C_MASTER_SEED = 20261024;
export const SIM04D_MASTER_SEED = 20261024;
