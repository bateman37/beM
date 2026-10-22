// Pantalla inicial del laboratorio (SIM-MOTOR-01 §3): elegir qué modelo se prueba. Ninguno se activa por migración silenciosa; cada uno conserva su propio estado.
import { h } from './dom.js';
import { APP_VERSION } from '../version.js';

export const ENGINES = {
  detailed: { id: 'detailed', title: 'Motor detallado', text: 'Laboratorio del motor actual para partidos dirigidos y pruebas de referencia.', use: 'Partidos del equipo sénior dirigido por el usuario.' },
  sim: { id: 'sim', title: 'Motor ultrarrápido', text: 'Laboratorio del generador estadístico por tramos, SIM-MOTOR.', use: 'Resto de partidos: cantera propia, demás ligas y, en Referencia, ejecución agrupada del mismo modelo.' },
};
export function renderEngineSelect(root, choose) {
  root.append(h('div', { class: 'card', id: 'engine-select' }, h('h2', { style: 'margin-top:0' }, '¿Qué motor quieres probar?'),
    h('p', { class: 'small muted' }, `Aplicación ${APP_VERSION}. Puedes volver aquí en cualquier momento con «Cambiar de motor»; el estado de preparación, los parámetros y el último resultado de cada motor se conservan por separado.`),
    h('div', { class: 'grid2' }, Object.values(ENGINES).map((e) => h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, e.title), h('p', {}, e.text), h('p', { class: 'small muted' }, `Uso previsto en el manager: ${e.use}`),
      h('button', { class: 'btn', type: 'button', id: `engine-${e.id}`, onclick: () => choose(e.id) }, `Abrir ${e.title.toLowerCase()}`))))));
}
