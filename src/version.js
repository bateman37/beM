// Fuente ÚNICA de la versión visible de la aplicación (MOTOR-11 §16.1): la consola del servidor de desarrollo, la cabecera del laboratorio, los scripts y las pruebas
// la leen de aquí. Es distinta de la versión del motor deportivo, del formato de exportación, del perfil numérico activo y del dataset/escenario seleccionado, que se
// muestran por separado. Un perfil guardado con una versión anterior NO convierte la aplicación en una versión anterior.
import { ENGINE_VERSION, EXPORT_SCHEMA } from './match/data.js';

export const APP_VERSION = 'SIM-MOTOR-02';
export const APP_TITLE = 'generador estadístico por tramos (motor ultrarrápido)';
export const APP_DATE = '2026-10-23';
export { ENGINE_VERSION, EXPORT_SCHEMA };
export const appLine = () => `beM ${APP_VERSION} — ${APP_TITLE} · motor ${ENGINE_VERSION} · ${EXPORT_SCHEMA}`;
