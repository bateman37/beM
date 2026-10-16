// Estado editable del laboratorio: carga de datos, edición para el próximo encuentro, restauración explícita,
// aplicación de +1/+3/+5 y persistencia opcional (localStorage, con degradación segura).
import { parsePlayersCsv, buildMatchInput, deepCopy, validateInput, applyExtension, upgradeInput, ATTRS } from '../match/index.js';
import { storage } from './dom.js';
import { ProfileLibrary } from '../profiles/library.js';

const KEY = 'beM.motor01.edit.v1'; // la entrada editable no cambia de formato en MOTOR-02: se conserva la clave
export const ATTR_GROUPS = [
  ['Tiro', ['TEC01', 'TEC02', 'TEC03', 'TEC04', 'TEC05', 'TEC06']],
  ['Balón, pase y juego sin balón', ['TEC07', 'TEC08', 'TEC09', 'TEC10', 'TEC11']],
  ['Defensa', ['TEC12', 'TEC13', 'TEC14', 'TEC15', 'TEC16']],
  ['Rebote', ['TEC17', 'TEC18']],
  ['Físicas', ['FIS01', 'FIS02', 'FIS03', 'FIS04', 'FIS05', 'FIS06', 'FIS07']],
  ['Mentales', ['MEN01', 'MEN02', 'MEN03', 'MEN04', 'MEN05', 'MEN06', 'MEN07']],
];
// Nombres de las fichas del catálogo activo: se rellenan al cargar el perfil (el repertorio vive en los datos, no en el código).
export const PLAY_NAMES = {};

// `profile` es el perfil EFECTIVO de la versión ACTIVA (MOTOR-03): lo que usarán los próximos encuentros. Los encuentros ya
// iniciados llevan su propia copia congelada y no se ven afectados por activar otra versión.
export const store = { baseProfile: null, extension: null, extension3: null, extension4: null, extension5: null, extension6: null, extension7: null, base: null, edit: null, labels: {}, catalog: null, last: null, scenario: null, persisted: false, library: null, matchRef: null,
  get profile() { return this.library ? this.library.activeVersion().effective : null; },
  get profileRef() { return this.library ? this.library.profileRef(this.library.activeId) : null; } };

export async function loadAll() {
  const [baseProfile, extension, extension3, extension4, extension5, extension6, extension7, csv, catalog] = await Promise.all([
    fetch('/data/match/motor01-seed-profile.json').then((r) => r.json()),
    fetch('/data/match/motor02-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor03-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor04-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor05-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor06-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor07-seed-extension.json').then((r) => r.json()),
    fetch('/data/fixtures/reference-players-MOTOR01.csv').then((r) => r.text()),
    fetch('/data/catalog.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  const players = parsePlayersCsv(csv, baseProfile);
  const profile = applyExtension(baseProfile, extension, extension3, extension4, extension5, extension6, extension7); // perfil efectivo base: el original no se sobrescribe
  store.baseProfile = baseProfile; store.extension = extension; store.extension3 = extension3; store.extension4 = extension4; store.extension5 = extension5; store.extension6 = extension6; store.extension7 = extension7; store.catalog = catalog;
  store.library = new ProfileLibrary({ storage: storage(), base: profile });
  store.labels = Object.fromEntries(profile.attributeDictionary.map((a) => [a.id, a.label]));
  store.baseNew = profile; // perfil efectivo de MOTOR-07: siempre disponible para construir la entrada, aunque el activo sea anterior
  for (const [id, p] of Object.entries(profile.repertoire.plays)) PLAY_NAMES[id] = p.name;
  store.base = buildMatchInput(profile, players);
  store.edit = restore() ?? deepCopy(store.base);
  return store;
}

function restore() {
  const ls = storage(); if (!ls) return null;
  try {
    const raw = ls.getItem(KEY); if (!raw) return null;
    const parsed = JSON.parse(raw);
    // entrada guardada con una versión anterior: migración EXPLÍCITA y visible (solo añade los campos nuevos con su valor inicial)
    const { input: e, added } = upgradeInput(parsed, store.baseNew);
    if (validateInput(e, store.baseNew).length) return null; // no se acepta una copia local inválida
    store.upgradeNotes = added;
    store.persisted = true;
    return e;
  } catch { return null; }
}
export function persist() {
  const ls = storage(); if (!ls) return;
  try { ls.setItem(KEY, JSON.stringify(store.edit)); store.persisted = true; } catch { /* sin almacenamiento */ }
}
// Restauración explícita de las fichas y planes iniciales suministrados.
export function restoreInitial() {
  store.edit = deepCopy(store.base);
  const ls = storage(); try { ls?.removeItem(KEY); } catch { /* nada */ }
  store.persisted = false;
}

// Cambios previstos de +delta sobre jugadores x capacidades seleccionados. Límite 1-30, sin wraparound.
export function planBulk(edit, playerIds, attrs, delta, [lo, hi] = [1, 30]) {
  const changes = [];
  for (const t of edit.teams) for (const p of t.players) {
    if (!playerIds.has(p.id)) continue;
    for (const a of ATTRS) {
      if (!attrs.has(a)) continue;
      const before = p.abilities[a];
      const after = Math.min(hi, Math.max(lo, before + delta));
      changes.push({ playerId: p.id, attr: a, before, after, limit: after !== before + delta });
    }
  }
  return changes;
}
export function applyChanges(edit, changes) {
  const byId = Object.fromEntries(edit.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  for (const c of changes) byId[c.playerId].abilities[c.attr] = c.after;
  return changes.length;
}
// Perfil con el que se validan y preparan las entradas: el activo si es de MOTOR-07; si el activo es anterior, el de MOTOR-07 (el partido no se podrá jugar con él).
export const prepProfile = () => (store.profile?.moment ? store.profile : store.baseNew);

// Copia de demostración MOTOR-04: misma plantilla, DIS02, estilos actuales y las quince fichas a prioridad 3. Escenario de cobertura.
export function loadDemoPlan(teamIdx) {
  const t = store.edit.teams[teamIdx];
  const demo = store.baseNew.scenario.demoPlans.find((d) => d.demoOf === t.id);
  if (!demo) return false;
  t.plan.playbook = deepCopy(demo.playbook); t.plan.disposition = demo.disposition; t.plan.midrange = demo.midrange;
  if (demo.throwInBook) t.plan.throwInBook = deepCopy(demo.throwInBook); // MOTOR-06: las seis fichas de saque a prioridad 3 (escenario de cobertura)
  t.plan.demo = true;
  persist();
  return true;
}
export const playerById = (id) => store.edit.teams.flatMap((t) => t.players).find((p) => p.id === id);

// Entrada que se congelará al preparar un encuentro: la COPIA de contraste activa (identificada, con sus cambios listados) o la entrada editada de Dennis.
export const matchSource = () => store.scenario?.input ?? store.edit;
