// Fuente ÚNICA de la versión visible de la aplicación (MOTOR-11 §16.1): la consola del servidor de desarrollo, la cabecera del laboratorio, los scripts y las pruebas
// la leen de aquí. Es distinta de la versión del motor deportivo, del formato de exportación, del perfil numérico activo y del dataset/escenario seleccionado, que se
// muestran por separado. Un perfil guardado con una versión anterior NO convierte la aplicación en una versión anterior.
import { ENGINE_VERSION, EXPORT_SCHEMA } from './match/data.js';

export const APP_VERSION = 'SIM-MOTOR-04C';
// SIM-MOTOR-04C incluye 04B, 04, 03 y el cierre de 02B (C03-01…11); la revisión de implementación SIM tiene identidad propia (`SIM_VERSION`, `0.3.2-SIMMOTOR04C`).
export const APP_INCLUDES = ['SIM-MOTOR-04B', 'SIM-MOTOR-04', 'SIM-MOTOR-03', 'SIM-MOTOR-02B'];
export const APP_TITLE = 'generador estadístico por tramos (motor ultrarrápido)';
export const APP_DATE = '2026-10-24';
export { ENGINE_VERSION, EXPORT_SCHEMA };
export const appLine = () => `beM ${APP_VERSION} (incluye ${APP_INCLUDES.join(', ')}) — ${APP_TITLE} · motor ${ENGINE_VERSION} · ${EXPORT_SCHEMA}`;
