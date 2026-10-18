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
import { APP_VERSION, APP_TITLE, ENGINE_VERSION, EXPORT_SCHEMA } from '../version.js';

const TABS = [['teams', 'Plantillas', renderTeams], ['prep', 'Preparación', renderPrep], ['game', 'Partido', renderGame], ['analysis', 'Análisis', renderAnalysis], ['batch', 'Lotes', renderBatch], ['audit', 'Auditorías', renderAudit], ['panel', 'Panel de ajustes', renderPanel], ['cov', 'Cobertura', renderCoverage], ['closure', 'Cierre', renderClosure]];
let current = 'teams';

function paint() {
  const nav = document.getElementById('tabs'); clear(nav);
  for (const [id, label] of TABS) nav.append(h('button', { type: 'button', 'aria-selected': id === current, onclick: () => { current = id; paint(); } }, label));
  const root = document.getElementById('view');
  TABS.find((t) => t[0] === current)[2](root);
}

window.addEventListener('beM:goto', (e) => { current = e.detail; paint(); window.dispatchEvent(new Event('beM:repaint')); });
document.getElementById('detail-close').addEventListener('click', () => document.getElementById('detail').close());
document.getElementById('rowdlg-close').addEventListener('click', () => document.getElementById('rowdlg').close());
try {
  await loadAll();
  // Versión de aplicación (fuente única src/version.js) separada del motor, del formato de exportación, del perfil numérico activo y del dataset seleccionado.
  document.title = `beM — Laboratorio ${APP_VERSION}`;
  document.getElementById('app-version').textContent = `${APP_VERSION} — ${APP_TITLE} · motor ${ENGINE_VERSION} · ${EXPORT_SCHEMA}`;
  const badge = () => { const a = store.library.activeVersion(); const pop = store.profile?.population ? store.profile.population.version : `${store.baseNew.population.version} (base de MOTOR-11; el perfil activo es anterior)`; document.getElementById('profile-badge').textContent = `perfil activo ${a.id} «${a.label}» · ${store.profile.effectiveId} · ${store.profile.status} · dataset ${pop}${store.scenario ? ` · escenario ${store.scenario.scenario.id}` : ''}`; };
  badge();
  window.addEventListener('beM:repaint', badge);
  paint();
} catch (e) {
  document.getElementById('view').textContent = `No se pudieron cargar los datos: ${e.message}`;
}
