import { h, clear } from './dom.js';
import { loadAll, store } from './store.js';
import { renderTeams } from './teams.js';
import { renderPrep } from './prep.js';
import { renderGame } from './game.js';
import { renderCoverage } from './coverage.js';
import { renderPanel } from './panel/index.js';

const TABS = [['teams', 'Plantillas', renderTeams], ['prep', 'Preparación', renderPrep], ['game', 'Partido', renderGame], ['panel', 'Panel de ajustes', renderPanel], ['cov', 'Cobertura', renderCoverage]];
let current = 'teams';

function paint() {
  const nav = document.getElementById('tabs'); clear(nav);
  for (const [id, label] of TABS) nav.append(h('button', { type: 'button', 'aria-selected': id === current, onclick: () => { current = id; paint(); } }, label));
  const root = document.getElementById('view');
  TABS.find((t) => t[0] === current)[2](root);
}

document.getElementById('detail-close').addEventListener('click', () => document.getElementById('detail').close());
document.getElementById('rowdlg-close').addEventListener('click', () => document.getElementById('rowdlg').close());
try {
  await loadAll();
  const badge = () => { const a = store.library.activeVersion(); document.getElementById('profile-badge').textContent = `perfil activo ${a.id} «${a.label}» · ${store.profile.effectiveId} · ${store.profile.status}`; };
  badge();
  window.addEventListener('beM:repaint', badge);
  paint();
} catch (e) {
  document.getElementById('view').textContent = `No se pudieron cargar los datos: ${e.message}`;
}
