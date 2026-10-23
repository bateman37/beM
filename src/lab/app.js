import { h, clear } from './dom.js';
import { loadAll, store } from './store.js';
import { renderTeams } from './teams.js';
import { renderPrep } from './prep.js';
import { renderGame } from './game.js';
import { renderCoverage } from './coverage.js';
import { renderAnalysis } from './analysis-ui.js';
import { renderPanel } from './panel/index.js';
import { renderBatch } from './batch-ui.js';
import { renderAudit } from './audit-ui.js';
import { renderClosure } from './closure-ui.js';
import { restoreLearning } from './knowledge-ui.js';
import { renderEngineSelect, ENGINES } from './engine-select.js';
import { renderSim, SIM_TABS, simSetSub, simState, simHeaderLine } from './sim-ui.js';
import { APP_VERSION, APP_TITLE, ENGINE_VERSION, EXPORT_SCHEMA } from '../version.js';

const TABS = [['teams', 'Plantillas', renderTeams], ['prep', 'Preparación', renderPrep], ['game', 'Partido', renderGame], ['analysis', 'Análisis', renderAnalysis], ['batch', 'Lotes', renderBatch], ['audit', 'Auditorías', renderAudit], ['panel', 'Panel de ajustes', renderPanel], ['cov', 'Cobertura', renderCoverage], ['closure', 'Cierre', renderClosure]];
let current = 'teams';
let engine = null; // null = selector inicial; 'detailed' | 'sim' (cada motor conserva su propio estado)
const setBadges = () => { const mb = document.getElementById('model-badge'); if (mb) mb.textContent = engine === 'sim' ? simHeaderLine() : engine === 'detailed' ? `Motor detallado · ${ENGINE_VERSION} · ${EXPORT_SCHEMA}` : 'Selecciona un motor'; };
function paint() {
  const nav = document.getElementById('tabs'); clear(nav);
  const root = document.getElementById('view'); clear(root);
  setBadges();
  if (engine === null) { renderEngineSelect(root, (id) => { engine = id; paint(); window.dispatchEvent(new Event('beM:repaint')); }); return; }
  if (engine === 'sim') { for (const [id, label] of SIM_TABS) nav.append(h('button', { type: 'button', id: `simtab-${id}`, 'aria-selected': id === simState.sub, onclick: () => { simSetSub(id); paint(); } }, label)); }
  else for (const [id, label] of TABS) nav.append(h('button', { type: 'button', 'aria-selected': id === current, onclick: () => { current = id; paint(); } }, label));
  nav.append(h('button', { type: 'button', id: 'change-engine', title: `Volver al selector (ahora: ${ENGINES[engine].title})`, onclick: () => { engine = null; paint(); } }, 'Cambiar de motor'));
  if (engine === 'sim') renderSim(root); else TABS.find((t) => t[0] === current)[2](root);
}

window.addEventListener('beM:goto', (e) => { current = e.detail; engine = 'detailed'; paint(); window.dispatchEvent(new Event('beM:repaint')); });
document.getElementById('detail-close').addEventListener('click', () => document.getElementById('detail').close());
document.getElementById('rowdlg-close').addEventListener('click', () => document.getElementById('rowdlg').close());
try {
  await loadAll();
  restoreLearning(); // MOTOR-18: copia de aprendizaje y registro de aplicaciones guardados (si existen); nunca se crean en silencio
  // Versión de aplicación (fuente única src/version.js) separada del motor, del formato de exportación, del perfil numérico activo y del dataset seleccionado.
  document.title = `beM — Laboratorio ${APP_VERSION}`;
  document.getElementById('app-version').textContent = `${APP_VERSION} — ${APP_TITLE} · motor ${ENGINE_VERSION} · ${EXPORT_SCHEMA}`;
  const badge = () => { if (engine === 'sim') return; const a = store.library.activeVersion(); const pop = store.profile?.population ? store.profile.population.version : `${store.baseNew.population.version} (base de MOTOR-11; el perfil activo es anterior)`; document.getElementById('profile-badge').textContent = `perfil activo ${a.id} «${a.label}» · ${store.profile.effectiveId} · ${store.profile.status} · dataset ${pop}${store.scenario ? ` · escenario ${store.scenario.scenario.id}` : ''}`; };
  badge();
  window.addEventListener('beM:repaint', badge);
  paint();
} catch (e) {
  document.getElementById('view').textContent = `No se pudieron cargar los datos: ${e.message}`;
}
