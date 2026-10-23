// Perfil SIM (SEM-SIM01-20261022): todas las decisiones numéricas deportivas del generador viven aquí, como filas con ruta, valor, unidad, procedencia y efecto.
// Procedencia (SIM-MOTOR-01 §4.3): «heredada» (copia de una fila del perfil efectivo detallado), «derivada» (transformación explícita de filas existentes) o «SEM-SIM01»
// (semilla nueva autorizada por el encargo, pendiente de auditoría/calibración). El código lee `profile.v.<ruta>`; nunca constantes deportivas sueltas.
import { SIM_PROFILE_ID, SIM_EXTENSION_ID } from './version.js';
import { fpString } from './fp.js';

const deep = (x) => JSON.parse(JSON.stringify(x));
const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
function setPath(o, path, value) { const ks = path.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) a = a[ks[i]] ??= {}; a[ks[ks.length - 1]] = value; }
const isLeaf = (x) => typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean' || x === null || Array.isArray(x);

// Subárboles heredados: [rutaSIM, rutaDetallado, unidad, efecto]. Las hojas numéricas/arrays se copian una a una como filas independientes.
const COPIES = [
  ['neutralAbility', 'neutralAbility', 'capacidad 1–30', 'Referencia neutra N de todas las fórmulas logit.'],
  ['abilityBounds', 'abilityBounds', 'capacidad 1–30', 'Límites de capacidad (contraste +1/+3/+5 y recetas).'],
  ['shots', 'shots', 'probabilidad / logit / puntos', 'Receta de conversión por zona (p0, ataque, defensa, sensibilidades, tapón base).'],
  ['shotPreparation', 'shotPreparation', 'logit / puntos de capacidad', 'Coste de preparación de tiros en movimiento (TEC06) y tope de energía.'],
  ['block', 'block', 'logit / probabilidad', 'Tapón: receta, sensibilidades, balón fuera tras tapón.'],
  ['rebound', 'rebound', 'probabilidad / logit', 'Rebote: base ofensiva, sensibilidad, recetas de fuerza y captor, participantes.'],
  ['outcomes', 'outcomes', 'peso por interacción', 'Categorías del intento (pérdida, falta, tiro) y sensibilidades; base de la transformación a control.'],
  ['opportunity', 'opportunity', 'logit / peso', 'Calidad de la oportunidad (cómoda/normal/forzada), ayudas y cobertura.'],
  ['selection', 'selection', 'peso / factor', 'Prioridades 1–5, libertad, lectura, orientación, riesgo, media distancia, aceptación directa.'],
  ['durations', 'durationSeconds', 's', 'Duraciones heredadas (mediana en el segundo elemento).'],
  ['contact', 'contact', 'peso / puntos de capacidad', 'Legalidad del contacto defensivo y ofensivo (faltas).'],
  ['body', 'body', 'cm / factor', 'Cuerpo: rangos, mezcla y sensibilidad de alcance en el rebote.'],
  ['energy', 'energy', 'energía 0–100 / factor', 'Gasto, recuperación y curva de gravedad de fatiga.'],
  ['rotation', 'rotation', 's / energía', 'Rotación base y pesos de utilidad por puesto (política del entrenador sobrescribe).'],
  ['rules', 'rules', 's / faltas', 'Reglamento representado: periodos, prórrogas, exclusión, bonus.'],
  ['tasks', 'tasks', 'receta', 'Recetas de tarea (TAR01–TAR17) consumidas por control, calidad, robo y asignación.'],
  ['defense', 'defense', 'odds ratio / peso / factor', 'Estilos defensivos, referencias de elección, asignación y alturas de presión, coberturas.'],
  ['form', 'form', 'logit', 'Forma: efecto máximo por tarea.'],
  ['pressure', 'pressure', 'logit / s', 'Importancia, tensión y pérdida por presión.'],
  ['moment', 'moment', 's / factor', 'Momentos individuales: semivida, sigma, alfa por tarea, mezcla.'],
  ['teamMoment', 'teamMoment', 's / factor', 'Momento colectivo T.'],
  ['familiarity', 'familiarity', 'peso / logit', 'Familiaridad: pesos de componente, módulo y máximo logit (legacy-neutral).'],
  ['throwIn', 'throwIns', 's', 'Saques (solo plazo de referencia).'],
];

const SEM_ROWS = [
  ['segment.normalSeconds', 120, 's', 'Duración máxima ordinaria de un tramo.'],
  ['segment.lateWindowSeconds', 120, 's', 'Ventana final del cuarto periodo y de cada prórroga.'],
  ['segment.lateSeconds', 30, 's', 'Duración máxima de un tramo dentro de esa ventana, con cualquier marcador.'],
  ['volume.neutralSecondsPerControl', 16, 's por control', 'Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo.'],
  ['volume.secondsPerControlBounds', [10, 24], 's por control', 'Límites del valor esperado ordinario (no de cada registro).'],
  ['volume.commonRhythmFactorBounds', [0.92, 1.08], 'factor', 'Factor uniforme de ritmo compartido por ambos equipos en cada tramo (se sortea uniforme en el rango).'],
  ['assist.eligibleFinalPassP0', 0.60, 'probabilidad', 'Probabilidad base de una entrega final en una finalización que admite pase.'],
  ['assist.passAbilityLogitSlope', 0.04, 'logit por punto de capacidad', 'Sensibilidad a capacidad de pase/lectura menos el neutral.'],
];

// Extensión SIM-MOTOR-02 (SEM-SIM02-20261022): semillas de la política pequeña del entrenador (§5.1 del encargo). No son calibración: se administran como cualquier fila y se identifican en el perfil.
const SEM02_ROWS = [
  ['coachSim.observationWindowSegments', 2, 'tramos publicados', 'Ventana de observación del rival: últimos tramos publicados que lee la política pequeña del entrenador.'],
  ['coachSim.minShotAttempts', 6, 'tiros de campo', 'Intentos mínimos del rival en la ventana para reconocer un predominio exterior o interior.'],
  ['coachSim.zoneShareMin', 0.6, 'proporción', 'Proporción mínima de la zona agrupada (exterior = triples; interior = aro + interior) para reconocer el predominio.'],
  ['coachSim.maxPatterns', 2, 'patrones', 'Patrones conservados a la vez (exterior/interior).'],
  ['coachSim.maxLevelStepPerReview', 1, 'niveles', 'Paso máximo del control de protección o de ritmo por revisión.'],
];
function flatten(prefix, src, out) {
  if (isLeaf(src)) { out.push([prefix, src]); return; }
  for (const [k, v] of Object.entries(src)) flatten(`${prefix}.${k}`, v, out);
}

// Construye el perfil SIM base desde el perfil efectivo del detallado. Determinista y sin azar.
export function buildSimProfile(detailed) {
  const rows = [];
  const add = (path, value, unit, origin, source, effect) => rows.push({ path, value: deep(value), unit, origin, source, effect });
  for (const [simPre, srcPath, unit, effect] of COPIES) {
    const sub = getPath(detailed, srcPath); if (sub === undefined) throw new Error(`perfil detallado sin ${srcPath}`);
    const leaves = []; flatten(simPre, sub, leaves);
    for (const [p, v] of leaves) { if (typeof v === 'string' || v === null) continue; add(p, v, unit, 'heredada', `${srcPath}${p.slice(simPre.length)}`, effect); }
  }
  // Hojas útiles que solo son cadenas/listas de catálogo se leen de las tablas declarativas del detallado (referencias, no filas numéricas).
  for (const [p, v, unit, effect] of SEM_ROWS) add(p, v, unit, 'SEM-SIM01', 'encargo SIM-MOTOR-01 §4.3 (semilla nueva, pendiente de auditoría/calibración)', effect);
  for (const [p, v, unit, effect] of SEM02_ROWS) add(p, v, unit, SIM_EXTENSION_ID.split('-').slice(0, 2).join('-'), 'encargo SIM-MOTOR-02 §5.1 (semilla nueva, no calibración)', effect);
  // Correspondencia de roles → créditos compatibles (tabla declarada; los pesos numéricos son los heredados selection.rolePreference y defense.assignment.roleFitWeight/otherRoleFitWeight).
  add('roles.creditTags.block', ['rimProtect', 'rimHelp'], 'etiquetas', 'SEM-SIM02', 'encargo SIM-MOTOR-02 §4.1: etiquetas de función defensiva que orientan el reparto del crédito de tapón', 'Un defensor cuyo rol defensivo favorece estas etiquetas pesa roleFitWeight (una vez) en el reparto del tapón.');
  add('roles.creditTags.steal', ['ballPressure', 'chaser'], 'etiquetas', 'SEM-SIM02', 'encargo SIM-MOTOR-02 §4.1: etiquetas de función defensiva que orientan el reparto del crédito de robo', 'Un defensor cuyo rol defensivo favorece estas etiquetas pesa roleFitWeight (una vez) en el reparto del robo.');
  add('roles.creditTags.offensiveFoulReceiver', ['postDefense', 'ballContain'], 'etiquetas', 'SEM-SIM02', 'encargo SIM-MOTOR-02 §3 C02-05: receptor de la falta ofensiva entre los defensores en pista', 'Reparto del receptor de una falta ofensiva (defensor que la recibe) con el sesgo de rol defensivo.');
  add('roles.creditTags.passer', ['passer'], 'etiquetas', 'SEM-SIM02', 'encargo SIM-MOTOR-02 §4.1: etiqueta de función ofensiva que orienta quién entrega el pase final', 'Un jugador cuyo rol ofensivo favorece «pasador» pesa favoredFunctionWeight (una vez) en el reparto de la entrega final.');
  add('roles.creditTags.spontaneous', ['finisher'], 'etiquetas', 'SEM-SIM02', 'encargo SIM-MOTOR-02 §4.1: etiqueta de función ofensiva de las decisiones espontáneas y de transición', 'Reparto del finalizador cuando no hay ficha: sesgo de rol ofensivo con la etiqueta «finalizador».');
  const d = detailed.durationSeconds;
  add('derived.advanceShareOfControl', d.advance[1] / (d.advance[1] + d.organizedShot[1]), 'fracción', 'derivada', 'durationSeconds.advance[1] / (advance[1] + organizedShot[1])', 'Parte del ciclo de control ocupada por el avance (efecto de la altura de presión en el ritmo).');
  add('derived.transitionPaceFactor', (d.advance[1] + d.transition[1]) / (d.advance[1] + d.organizedShot[1]), 'factor', 'derivada', '(advance[1] + transition[1]) / (advance[1] + organizedShot[1])', 'Duración relativa de un control de transición frente a uno organizado.');
  const o = detailed.outcomes.base;
  add('derived.terminalMassBase', o.turnover + o.shootingFoul + o.fieldShot + o.looseBall + o.offensiveFoul + o.ballViolation, 'peso', 'derivada', 'outcomes.base sin falta defensiva sin tiro (no terminal)', 'Denominador de terminales por control: la falta sin tiro no cierra el control salvo bonus.');
  add('derived.zoneToAreas', { rim: ['block', 'lowInside', 'inside'], inside: ['highInside', 'inside', 'lowInside', 'block'], midrange: ['elbow', 'top', 'wing'], three: ['top', 'wing', 'corner'] }, 'tabla', 'derivada', 'defenseRepertoire.attackerFunctions[*].area y tags (exterior = high/low-perimeter; interior = low)', 'Zonas de tiro del perfil → áreas defensivas que las protegen (sin coordenadas ni lados).');
  // Transición y decisiones espontáneas: zona, pase y movimiento derivados del catálogo ESP (reparto igual entre situaciones; dentro de cada una, entre sus zonas).
  const esp = Object.values(detailed.spontaneousRepertoire.situations);
  const arrival = esp.filter((e) => e.frontier.includes('arrival') && e.when?.zone);
  const zw = { rim: 0, inside: 0, midrange: 0, three: 0 };
  for (const e of arrival) for (const z of e.when.zone) zw[z] += 1 / arrival.length / e.when.zone.length;
  add('derived.transition.zoneWeights', zw, 'fracción', 'derivada', 'spontaneousRepertoire.situations (frontera arrival con zona): reparto igual entre situaciones y entre sus zonas', 'Mezcla de zonas de la transición.');
  add('derived.transition.passShare', arrival.filter((e) => e.tasks.includes('TAR07')).length / arrival.length, 'fracción', 'derivada', 'situaciones arrival con tarea TAR07 / situaciones arrival con zona', 'Parte de las finalizaciones de transición que admiten pase final.');
  add('derived.transition.movedShare', arrival.filter((e) => e.tasks.includes('TAR11')).length / arrival.length, 'fracción', 'derivada', 'situaciones arrival con tarea TAR11 / situaciones arrival con zona', 'Parte de los tiros de transición con preparación en movimiento.');
  const start = esp.filter((e) => e.frontier.includes('organizedStart'));
  add('derived.spontaneous.passShare', start.filter((e) => e.tasks.includes('TAR07')).length / start.length, 'fracción', 'derivada', 'situaciones organizedStart con TAR07 / organizedStart', 'Parte de las decisiones espontáneas que admiten pase final.');
  add('derived.spontaneous.movedShare', start.filter((e) => e.tasks.includes('TAR11')).length / start.length, 'fracción', 'derivada', 'situaciones organizedStart con TAR11 / organizedStart', 'Parte de los tiros espontáneos con preparación en movimiento.');
  const profile = { id: SIM_PROFILE_ID, detailedProfileId: detailed.effectiveId ?? detailed.id, rows };
  return finalize(profile);
}

// Construye el árbol `v`, el índice de filas y la huella a partir de `rows`.
export function finalize(profile) {
  const v = {}; const index = new Map();
  for (const r of profile.rows) { setPath(v, r.path, r.value); index.set(r.path, r); }
  compileRecipes(v);
  profile.v = v; profile.index = index; profile.fingerprint = fpOf(profile.rows);
  return profile;
}
export function fpOf(rows) { return fpString(JSON.stringify(rows.map((r) => [r.path, r.value]))); }

const deepNumeric = (x) => (Array.isArray(x) ? x.every(deepNumeric) : typeof x === 'number' && Number.isFinite(x));
const sameShape = (a, b) => (Array.isArray(a) ? Array.isArray(b) && a.length === b.length && a.every((x, i) => sameShape(x, b[i])) : typeof b === 'number' && Number.isFinite(b));
// Candidata: copia con filas sustituidas. Valida tipo, forma y límites; rechaza rutas desconocidas (nada se corrige en silencio).
export function validateOverrides(base, overrides) {
  const errs = [];
  for (const o of overrides ?? []) {
    const r = base.index.get(o.path);
    if (!r) { errs.push({ path: o.path, message: 'ruta desconocida' }); continue; }
    if (Array.isArray(r.value)) { if (!deepNumeric(r.value)) errs.push({ path: o.path, message: 'fila no editable (contiene texto)' }); else if (!sameShape(r.value, o.value)) errs.push({ path: o.path, message: 'debe conservar la forma numérica de la fila' }); }
    else if (typeof r.value === 'number') { if (typeof o.value !== 'number' || !Number.isFinite(o.value)) errs.push({ path: o.path, message: 'debe ser un número finito' }); }
    else errs.push({ path: o.path, message: 'fila no editable' });
    if (typeof r.value === 'number' && typeof o.value === 'number' && /(^|\.)(p0|blockP0|P0)$|P0$/.test(o.path) && (o.value <= 0 || o.value >= 1)) errs.push({ path: o.path, message: 'una probabilidad base debe estar en (0, 1)' });
    if (/(^|\.)(normalSeconds|lateSeconds|lateWindowSeconds|neutralSecondsPerControl)$/.test(o.path) && !(o.value > 0)) errs.push({ path: o.path, message: 'debe ser positivo' });
  }
  return errs;
}
export function applyOverrides(base, overrides) {
  const errs = validateOverrides(base, overrides); if (errs.length) { const e = new Error(`candidata no válida: ${errs.map((x) => `${x.path}: ${x.message}`).join('; ')}`); e.validation = errs; throw e; }
  const map = new Map((overrides ?? []).map((o) => [o.path, o.value]));
  const rows = base.rows.map((r) => (map.has(r.path) ? { ...r, value: deep(map.get(r.path)), origin: r.origin, edited: true } : { ...r }));
  const p = { id: map.size ? `${base.id}+candidata` : base.id, detailedProfileId: base.detailedProfileId, rows, overrides: [...(overrides ?? [])] };
  return finalize(p);
}
export function diffProfile(base, cand) {
  const out = [];
  for (const r of cand.rows) { const b = base.index.get(r.path); if (!b || JSON.stringify(b.value) !== JSON.stringify(r.value)) out.push({ path: r.path, base: b?.value ?? null, candidate: r.value }); }
  return out;
}
export const profileSections = (profile) => { const m = {}; for (const r of profile.rows) (m[r.path.split('.')[0]] ??= []).push(r); return m; };

// ---------------------------------------------------------------------------------------------------------------------- recetas precompiladas (solo velocidad; no cambian ningún valor)
// Cada receta {ATRIBUTO: peso} recibe una propiedad no enumerable `$c` con índices y pesos en arrays y el tope de energía por defecto de cada atributo; las tareas [[rol, atributo, peso]] se agrupan por lado y rol.
export const ATTR_ORDER = ['TEC01', 'TEC02', 'TEC03', 'TEC04', 'TEC05', 'TEC06', 'TEC07', 'TEC08', 'TEC09', 'TEC10', 'TEC11', 'TEC12', 'TEC13', 'TEC14', 'TEC15', 'TEC16', 'TEC17', 'TEC18', 'FIS01', 'FIS02', 'FIS03', 'FIS04', 'FIS05', 'FIS06', 'FIS07', 'MEN01', 'MEN02', 'MEN03', 'MEN04', 'MEN05', 'MEN06', 'MEN07'];
export const ATTR_INDEX = Object.fromEntries(ATTR_ORDER.map((a, i) => [a, i]));
const isRecipe = (o) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length > 0 && Object.entries(o).every(([k, x]) => ATTR_INDEX[k] !== undefined && typeof x === 'number');
export function compileRecipe(S, rec) {
  const keys = Object.keys(rec); const c = { n: keys.length, idx: new Int8Array(keys.length), w: new Float64Array(keys.length), cap: new Float64Array(keys.length) };
  keys.forEach((k, i) => { c.idx[i] = ATTR_INDEX[k]; c.w[i] = rec[k]; c.cap[i] = k.startsWith('FIS') ? S.energy.defaultPhysicalTaskMax : S.energy.defaultTechnicalTaskMax; });
  return c;
}
function compileRecipes(S) {
  const walk = (o) => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return;
    if (isRecipe(o)) { Object.defineProperty(o, '$c', { value: compileRecipe(S, o), enumerable: false, configurable: true }); return; }
    for (const v of Object.values(o)) walk(v);
  };
  walk(S);
  for (const [tid, t] of Object.entries(S.tasks)) {
    const out = {}; for (const side of ['attack', 'defense']) { const by = {}; for (const [r, a, w] of t[side]) { const e = (by[r] ??= { idx: [], w: [], sw: 0 }); e.idx.push(ATTR_INDEX[a]); e.w.push(w); e.sw += w; } out[side] = by; }
    Object.defineProperty(t, '$c', { value: out, enumerable: false, configurable: true }); void tid;
  }
}
