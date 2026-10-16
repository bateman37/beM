// Estado editable del laboratorio: carga de datos, edición para el próximo encuentro, restauración explícita,
// aplicación de +1/+3/+5 y persistencia opcional (localStorage, con degradación segura).
import { parsePlayersCsv, buildMatchInput, deepCopy, validateInput, applyExtension, ATTRS } from '../match/index.js';
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
export const PLAY_NAMES = {
  POS01: 'Bloqueo directo central con continuación', POS05: 'Mano a mano desde cabecera', POS07: 'Indirecto descendente para recepción',
  POS09: 'Pase y corte', POS11: 'Poste bajo', POS14: 'Aclarado desde cabecera',
};

// `profile` es el perfil EFECTIVO de la versión ACTIVA (MOTOR-03): lo que usarán los próximos encuentros. Los encuentros ya
// iniciados llevan su propia copia congelada y no se ven afectados por activar otra versión.
export const store = { baseProfile: null, extension: null, extension3: null, base: null, edit: null, labels: {}, catalog: null, last: null, persisted: false, library: null, matchRef: null,
  get profile() { return this.library ? this.library.activeVersion().effective : null; },
  get profileRef() { return this.library ? this.library.profileRef(this.library.activeId) : null; } };

export async function loadAll() {
  const [baseProfile, extension, extension3, csv, catalog] = await Promise.all([
    fetch('/data/match/motor01-seed-profile.json').then((r) => r.json()),
    fetch('/data/match/motor02-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor03-seed-extension.json').then((r) => r.json()),
    fetch('/data/fixtures/reference-players-MOTOR01.csv').then((r) => r.text()),
    fetch('/data/catalog.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  const players = parsePlayersCsv(csv, baseProfile);
  const profile = applyExtension(baseProfile, extension, extension3); // perfil efectivo base: el original no se sobrescribe
  store.baseProfile = baseProfile; store.extension = extension; store.extension3 = extension3; store.catalog = catalog;
  store.library = new ProfileLibrary({ storage: storage(), base: profile });
  store.labels = Object.fromEntries(profile.attributeDictionary.map((a) => [a.id, a.label]));
  store.base = buildMatchInput(store.profile, players);
  store.edit = restore() ?? deepCopy(store.base);
  return store;
}

function restore() {
  const ls = storage(); if (!ls) return null;
  try {
    const raw = ls.getItem(KEY); if (!raw) return null;
    const e = JSON.parse(raw);
    if (validateInput(e, store.profile).length) return null; // no se acepta una copia local inválida
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
export const playerById = (id) => store.edit.teams.flatMap((t) => t.players).find((p) => p.id === id);
