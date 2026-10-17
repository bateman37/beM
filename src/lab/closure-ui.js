// Vista «Cierre» (MOTOR-15 §21): estado funcional, cobertura, auditorías, perfiles/versiones, coste y enlaces a informes y descargas. No es un panel de gestión de proyectos ni un porcentaje universal de realismo:
// cada eje se declara por separado (funcional, rendimiento, evaluación deportiva, aceptación).
import { h, table } from './dom.js';
import { APP_VERSION, ENGINE_VERSION, EXPORT_SCHEMA } from '../version.js';
import { store } from './store.js';

const st = { data: null, err: null };
const KB = (b) => (b == null ? '—' : b > 2 ** 20 ? `${(b / 2 ** 20).toFixed(2)} MiB` : `${(b / 1024).toFixed(1)} KiB`);

export function renderClosure(root) {
  paint(root);
  fetch('/api/closure/summary').then((r) => r.json()).then((d) => { st.data = d; st.err = null; paint(root); }).catch((e) => { st.err = `El servicio local no responde (${e.message}): arranca el laboratorio con «npm run dev».`; paint(root); });
}
function paint(root) {
  root.replaceChildren();
  const s = st.data?.summary; const files = st.data?.files ?? [];
  root.append(h('h2', {}, 'Cierre de MOTOR-15'), h('p', { class: 'small muted' }, 'Cuatro ejes que no se mezclan: funcional, rendimiento, evaluación deportiva y aceptación. Un objetivo de coste no alcanzado no se maquilla y la calibración sigue pendiente de MOTOR-16/17.'));
  if (st.err) root.append(h('div', { class: 'errbox' }, st.err));
  if (!s) { if (!st.err) root.append(h('p', { class: 'muted' }, 'Cargando el resumen de cierre…')); return; }
  root.append(h('div', { class: 'card', id: 'closure-axes' }, h('h3', { style: 'margin-top:0' }, 'Estado por eje'), table(['Eje', 'Estado', 'Detalle'], s.axes.map((a) => [a.axis, h('strong', {}, a.state), a.detail]))));
  root.append(h('div', { class: 'grid2' },
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Versiones (cosas distintas)'), table(['', 'Valor'], [['Aplicación', APP_VERSION], ['Motor deportivo', ENGINE_VERSION], ['Formato de exportación', EXPORT_SCHEMA], ['Perfil activo', store.library ? `${store.library.activeId} · ${store.library.activeVersion().effective.effectiveId.split('+').slice(-2).join('+')}` : '—'], ['Extensión de este cierre', s.versions.extension], ['Política estadística', s.versions.statsPolicy], ['Referencia 20261016', s.versions.reference], ['Snapshot', s.versions.snapshot], ['Paquete', s.versions.package]])),
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Cobertura y auditorías'), table(['Dato', 'Valor'], s.coverage.map((c) => [c[0], c[1]])))));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Coste medido'), table(['Medida', 'Valor', 'Alcance'], s.cost.map((c) => [c[0], c[1], c[2]])), h('p', { class: 'small muted' }, s.costNote)));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Informes y documentación'), h('ul', {}, s.reports.map((r) => h('li', {}, h('code', {}, r.path), ` — ${r.what}`)))));
  root.append(h('div', { class: 'card', id: 'closure-downloads' }, h('h3', { style: 'margin-top:0' }, 'Descargas de devolución'), h('p', { class: 'small' }, 'Envía primero el paquete rápido. El detalle se pide solo si hace falta.'),
    table(['Archivo', 'Tamaño', 'Descarga'], files.map((f) => [f.name, KB(f.bytes), f.available ? h('a', { href: f.url, download: f.name, class: 'btn secondary' }, 'Descargar') : h('span', { class: 'muted' }, `no generado: ${f.command}`)])),
    h('p', { class: 'small muted' }, `Comprobador: ${s.checker}`)));
}
