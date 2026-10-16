// Pantalla «Cobertura»: qué está activo, qué está pendiente y qué se observó en el último encuentro.
import { h, clear, table } from './dom.js';
import { store } from './store.js';
import { COVERAGE } from '../match/index.js';

export function renderCoverage(root) {
  clear(root);
  const a = COVERAGE.activos; const cat = store.catalog; const f = cat?.files ?? {};
  root.append(h('h2', {}, 'Cobertura y procedencia de los datos'),
    h('div', { class: 'card' }, h('h3', {}, 'Perfil cargado'),
      h('p', {}, `${store.profile.id} — `, h('span', { class: 'pill warn' }, store.profile.status)),
      h('p', {}, `Extensión de MOTOR-02: ${store.extension.seedExtensionId} — `, h('span', { class: 'pill warn' }, store.extension.status), ` · recuperación por tiempo muerto ${store.extension.timeOutRecoveryEnergyPoints} (semilla de desarrollo, no una frecuencia real ni una norma FIBA) · cupos ${store.extension.timeOuts.firstHalf}/${store.extension.timeOuts.secondHalf}/${store.extension.timeOuts.perOvertime} (lectura propia de FIBA 2026 v1.1, sin contrastar con el PDF)`),
      h('p', {}, `Extensión de MOTOR-04: ${store.extension4.seedExtensionId} — `, h('span', { class: 'pill warn' }, store.extension4.status), ' · cifras SEM del anexo A del prompt (estilos, media distancia, roles, variantes, rebote/balance) y contenido declarativo del repertorio; sustituye explícitamente el efecto abstracto de carga y amplía el catálogo activo.'),
      h('p', {}, `Extensión de MOTOR-05: ${store.extension5.seedExtensionId} — `, h('span', { class: 'pill warn' }, store.extension5.status), ' · cifras SEM del anexo A (estilos defensivos, adecuación, presión, coberturas, especiales) y contenido declarativo de organizaciones, funciones, responsabilidades y roles (lectura de Claude, a revisar); amplía el catálogo activo de defensas y coberturas.'),
      h('p', { class: 'small muted' }, store.profile.scope),
      h('p', { class: 'small' }, `Procedencia: ${store.profile.provenance.author}, ${store.profile.provenance.date}. ${store.profile.provenance.newSeeds}`),
      cat ? h('p', { class: 'small' }, 'SHA-256 perfil: ', h('code', {}, f['data/match/motor01-seed-profile.json']?.sha256), ' · fichas: ', h('code', {}, f['data/fixtures/reference-players-MOTOR01.csv']?.sha256), ' · extensión MOTOR-02: ', h('code', {}, f['data/match/motor02-seed-extension.json']?.sha256)) : null,
      h('p', { class: 'small muted' }, 'Los 144 jugadores son ficticios y provisionales; solo EQ01 y EQ02 son escenarios jugables. Este perfil es completo para los comportamientos activos de MOTOR-01 pero no certifica el cierre de los 81 grupos finales ni está calibrado.')),
    h('div', { class: 'grid2' },
      h('div', { class: 'card' }, h('h3', {}, 'Activo en esta entrega'), h('ul', {}, Object.entries(a).map(([k, v]) => h('li', {}, h('strong', {}, `${k}: `), Array.isArray(v) ? v.join(', ') : v)))),
      h('div', { class: 'card' }, h('h3', {}, 'Pendiente (cobertura restante, no implementada o neutral)'), h('ul', {}, COVERAGE.pendientes.map((p) => h('li', {}, p))))));
  const t = COVERAGE.tabla;
  root.append(h('div', { class: 'card' }, h('h3', {}, 'Cobertura de MOTOR-05'),
    h('div', { class: 'grid2' },
      h('div', {}, h('h3', {}, 'Implementado y comprobado (pruebas automáticas)'), h('ul', {}, t.comprobado.map((x) => h('li', {}, x)))),
      h('div', {}, h('h3', {}, 'Implementado, pendiente de revisión manual de Dennis'), h('ul', {}, t.pendienteRevisionManual.map((x) => h('li', {}, x))),
        h('h3', {}, 'No implementado (entrega prevista)'), h('ul', {}, t.noImplementado.map(([x, e]) => h('li', {}, `${x} — ${e}`)))))));
  if (store.last) {
    const obs = Object.entries(store.last.diagnostics.coverageObserved).sort((x, y) => y[1] - x[1]);
    root.append(h('div', { class: 'card' }, h('h3', {}, `Observado en el último encuentro (semilla ${store.last.meta.rng.initialSeed})`), table(['Elemento', 'Veces'], obs, { numeric: [1] }),
      h('p', { class: 'small muted' }, 'Lo que no aparece en una partida concreta no está roto: la auditoría distingue falta de oportunidades de un error de elegibilidad (ver documentación técnica).')));
  }
}
