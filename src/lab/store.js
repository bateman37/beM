// Estado editable del laboratorio: carga de datos, edición para el próximo encuentro, restauración explícita,
// aplicación de +1/+3/+5 y persistencia opcional (localStorage, con degradación segura).
import { parsePlayersCsv, deepCopy, validateInput, applyExtension, upgradeInput } from '../match/index.js';
import { PopulationLibrary, referenceTeam, historicalPair, instantiate, dropStaleRivalRefs, generateTeam, resolveTeam, fingerprint, planBulk as planBulkCore, applyBulk, undoBulk } from '../population/index.js';
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
export const store = { baseProfile: null, extension: null, extension3: null, extension4: null, extension5: null, extension6: null, extension7: null, extension8: null, extension9: null, extension10: null, extension11: null, extension12: null, extension13: null, base: null, edit: null, labels: {}, catalog: null, last: null, scenario: null, persisted: false, library: null, matchRef: null, pop: null, undo: [],
  get profile() { return this.library ? this.library.activeVersion().effective : null; },
  get profileRef() { return this.library ? this.library.profileRef(this.library.activeId) : null; } };

export async function loadAll() {
  const [baseProfile, extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13, csv, catalog] = await Promise.all([
    fetch('/data/match/motor01-seed-profile.json').then((r) => r.json()),
    fetch('/data/match/motor02-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor03-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor04-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor05-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor06-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor07-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor08-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor09-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor10-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor11-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor12-seed-extension.json').then((r) => r.json()),
    fetch('/data/match/motor13-seed-extension.json').then((r) => r.json()),
    fetch('/data/fixtures/reference-players-MOTOR01.csv').then((r) => r.text()),
    fetch('/data/catalog.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  const players = parsePlayersCsv(csv, baseProfile);
  const profile = applyExtension(baseProfile, extension, extension3, extension4, extension5, extension6, extension7, extension8, extension9, extension10, extension11, extension12, extension13); // perfil efectivo base: el original no se sobrescribe
  store.baseProfile = baseProfile; store.extension = extension; store.extension3 = extension3; store.extension4 = extension4; store.extension5 = extension5; store.extension6 = extension6; store.extension7 = extension7; store.extension8 = extension8; store.extension9 = extension9; store.extension10 = extension10; store.extension11 = extension11; store.extension12 = extension12; store.extension13 = extension13; store.catalog = catalog;
  store.library = new ProfileLibrary({ storage: storage(), base: profile });
  store.labels = Object.fromEntries(profile.attributeDictionary.map((a) => [a.id, a.label]));
  store.players = players; store.baseNew = profile; // perfil efectivo de MOTOR-10: siempre disponible para construir la entrada, aunque el activo sea anterior
  for (const [id, p] of Object.entries(profile.repertoire.plays)) PLAY_NAMES[id] = p.name;
  store.pop = new PopulationLibrary({ storage: storage() }); // variantes, generados, escenarios y resultados (las referencias nunca se guardan: están protegidas)
  store.base = { schema: 'beM-match-input/6', seed: profile.scenario.seed, importance: 'ordinary', teams: historicalPair(profile, players) }; // entrada inicial = referencia histórica de MOTOR-10 (EQ01/EQ02 con sus planes históricos)
  for (const t of store.base.teams) t.source.loadedFingerprint = fpOf(t);
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
  store.edit = deepCopy(store.base); store.scenario = null; store.undo.length = 0;
  const ls = storage(); try { ls?.removeItem(KEY); } catch { /* nada */ }
  store.persisted = false;
}

// Edición +1/+3/+5 (MOTOR-11 §11): previsión, aplicación con registro y deshacer EXACTO viven en src/population/edit.js.
export const planBulk = (edit, playerIds, attrs, delta, bounds) => planBulkCore(edit.teams, playerIds, attrs, delta, bounds);
export function applyChanges(edit, changes, label = '') { const rec = applyBulk(edit.teams, changes, label); store.undo.push(rec); if (store.undo.length > 30) store.undo.shift(); return changes.length; }
export function undoLast(edit) { const rec = store.undo.pop(); if (!rec) return null; return { label: rec.label, ...undoBulk(edit.teams, rec) }; }

// Perfil con el que se validan y preparan las entradas: el activo si es de MOTOR-09; si el activo es anterior, el de MOTOR-09 (el partido no se podrá jugar con él).
export const prepProfile = () => (store.profile?.moment && store.profile?.coach && store.profile?.regulation ? store.profile : store.baseNew);

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

// ---------------------------------------------------------------------------------------------- población (MOTOR-11)
// La receta y los equipos de referencia salen del perfil ACTIVO si ya incluye la población; si no, de la base de MOTOR-11 (siempre disponible) y se identifica.
export const popProfile = () => (store.profile?.population ? store.profile : store.baseNew);
export const popFromActive = () => !!store.profile?.population;
export const fpOf = (t) => fingerprint({ players: t.players.map(({ provenance, ...p }) => p), plan: t.plan });
export const slotDirty = (t) => !t.source?.loadedFingerprint || t.source.loadedFingerprint !== fpOf(t);
export const refTeam = (id, opts) => referenceTeam(popProfile(), store.players, id, opts);
export const logicalTeam = (ref) => resolveTeam(popProfile(), store.players, store.pop, ref);

// Coloca una instancia del equipo lógico en el puesto (0 = equipo A, 1 = equipo B). No cambia el rival ni su plan en silencio: si el rival tenía referencias a jugadores que ya no
// existen (marcas, objetivos), se retiran y se DEVUELVEN para mostrarlas; la validación sigue exigiendo lo que falte.
export function assignTeam(slot, team) {
  const other = store.edit.teams[1 - slot];
  const inst = instantiate(team, [other.id]);
  inst.source = { ...(inst.source ?? {}), loadedFingerprint: fpOf(inst) };
  const removed = [];
  store.edit.teams[slot] = inst;
  for (const r of dropStaleRivalRefs(inst, other.players.map((p) => p.id))) removed.push(`${inst.id}: ${r}`);
  for (const r of dropStaleRivalRefs(other, inst.players.map((p) => p.id))) removed.push(`${other.id}: ${r}`);
  inst.source.loadedFingerprint = fpOf(inst);
  store.scenario = null; store.undo.length = 0; persist();
  return { inst, removed };
}
// Restaura el equipo del puesto desde su procedencia (referencia con plan natural o histórico, variante guardada, generado). Devuelve { ok, error }.
export function restoreSlot(slot, { planKind = null } = {}) {
  const cur = store.edit.teams[slot]; const src = cur.source;
  try {
    let logical;
    if (src?.kind === 'reference') logical = refTeam(src.teamId, { revision: src.revision, planKind: planKind ?? src.planKind });
    else if (src?.kind === 'variant') { logical = store.pop.team(src.savedAs ?? src.instance?.of); if (!logical) throw new Error('la variante guardada ya no existe'); }
    else if (src?.kind === 'generated') logical = store.pop.team(src.instance?.of ?? cur.id) ?? generateTeam(popProfile(), store.players, { base: src.base, seed: src.seed, dispersion: src.dispersion, label: src.label });
    else throw new Error('este equipo no tiene procedencia conocida para restaurarlo');
    return { ok: true, ...assignTeam(slot, logical) };
  } catch (e) { return { ok: false, error: e.message }; }
}
// Plan natural versionado de la identidad de origen, cargado de forma EXPLÍCITA sobre el equipo del puesto (conserva fichas y ediciones de jugadores).
export function loadNaturalPlan(slot) {
  const t = store.edit.teams[slot]; const src = t.source;
  const baseId = src?.kind === 'generated' ? src.base : src?.kind === 'reference' ? src.teamId : (src?.base?.teamId ?? '').match(/^EQ\d\d/)?.[0];
  const ref = baseId ? popProfile().population.teams[baseId] : null; if (!ref) return { ok: false, error: 'este equipo no procede de una identidad con plan natural' };
  const logical = refTeam(baseId); const inst = instantiate({ ...logical, id: baseId }, []);
  const remap = (v) => JSON.parse(JSON.stringify(v).split(`"${inst.id}-J`).join(`"${t.id}-J`));
  const keep = { ...t.plan }; const plan = remap(inst.plan); plan.teamId = t.id;
  t.plan = plan; t.plan.initialTeamMoment = keep.initialTeamMoment ?? 0;
  const other = store.edit.teams[1 - slot]; dropStaleRivalRefs(t, other.players.map((p) => p.id));
  store.scenario = null; persist();
  return { ok: true, id: baseId, version: ref.planVersion };
}
export function saveVariantFromSlot(slot, name) {
  const t = store.edit.teams[slot]; const src = t.source; if (!src) return { ok: false, error: 'el equipo no tiene procedencia: no se puede identificar su base' };
  let base; let baseTeam = null;
  if (src.kind === 'reference') { base = { teamId: src.teamId, kind: 'reference', revision: src.revision, planKind: src.planKind, planVersion: src.planVersion }; baseTeam = refTeam(src.teamId, { revision: src.revision, planKind: src.planKind }); }
  else if (src.kind === 'generated') { base = { teamId: src.instance?.of ?? t.id, kind: 'generated', seed: src.seed, dispersion: src.dispersion, recipe: src.recipe?.version }; baseTeam = store.pop.team(base.teamId) ?? generateTeam(popProfile(), store.players, { base: src.base, seed: src.seed, dispersion: src.dispersion, label: src.label }); }
  else if (src.kind === 'variant') { base = { teamId: src.savedAs ?? src.instance?.of, kind: 'variant' }; baseTeam = store.pop.team(base.teamId); }
  else return { ok: false, error: 'procedencia no reconocida' };
  const r = store.pop.saveVariant(t, { name, base, baseTeam });
  return r;
}
