// Materializa la extensión SEM-MOTOR11-20261017 (población de referencia, generador y escenarios de contraste) desde las tablas del encargo
// MOTOR-11 (§6 identidades y estilos, §7 libros/quinteto/rotación, §8–§9 receta del generador, §12 escenarios). Los planes naturales se escriben
// COMPLETOS en el JSON (no se recalculan al abrir la aplicación): `npm run data:check` comprueba que el archivo coincide con lo que este script produce.
// Uso: node scripts/build-motor11-data.js [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, PROFILE_PATH, EXTENSION_PATH, EXTENSION3_PATH, EXTENSION4_PATH, EXTENSION5_PATH, EXTENSION6_PATH, EXTENSION7_PATH, EXTENSION8_PATH, EXTENSION9_PATH, EXTENSION10_PATH, PLAYERS_PATH } from './node-data.js';
import { parsePlayersCsv, applyExtension, validateInput, buildMatchInput } from '../src/match/data.js';
import { defaultParticipationPlan } from '../src/match/coach-policy.js';

export const EXTENSION11_PATH = join(ROOT, 'data/match/motor11-seed-extension.json');
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------------------------------------- tablas del encargo
// Disposición y defensa se nombran como en el encargo y se resuelven contra el catálogo real (no se presupone que un nombre sea un número).
const TEAMS = {
  EQ01: { identity: 'Equilibrado', disp: '4–1', org: 'Individual', height: 'normal', style: [3, 3, 3, 3, 3, 3, 3], def: [3, 3, 3, 3, 3], p1: ['POS01', 'POS05'], p2: ['POS07', 'POS09', 'POS11'], group: 'ordinary', minutes: 'ordinary' },
  EQ02: { identity: 'Exterior', disp: '5 abiertos', org: 'Zona 3–2', height: 'normal', style: [3, 3, 4, 4, 3, 3, 2], def: [3, 3, 4, 2, 4], p1: ['POS03', 'POS07', 'POS08'], p2: ['POS05', 'POS06', 'POS09'], group: 'EQ02', minutes: 'ordinary' },
  EQ03: { identity: 'Interior', disp: '3–2 ofensivo', org: 'Zona 2–3', height: 'normal', style: [2, 2, 4, 2, 2, 2, 4], def: [4, 2, 2, 2, 2], p1: ['POS11', 'POS13'], p2: ['POS01', 'POS04', 'POS12'], group: 'interior', minutes: 'ordinary' },
  EQ04: { identity: 'Dos creadores', disp: 'Horns', org: 'Individual', height: 'normal', style: [3, 3, 4, 3, 4, 3, 3], def: [3, 3, 3, 3, 3], p1: ['POS01', 'POS05', 'POS12'], p2: ['POS03', 'POS06', 'POS09'], group: 'creators', minutes: 'ordinary' },
  EQ05: { identity: 'Director pasador con poca anotación', disp: '4–1', org: 'Zona 1–2–2', height: 'normal', style: [3, 3, 4, 3, 2, 2, 3], def: [3, 3, 3, 2, 3], p1: ['POS01', 'POS09', 'POS12'], p2: ['POS05', 'POS07', 'POS13'], group: 'ordinary', minutes: 'ordinary' },
  EQ06: { identity: 'Anotador dominante con lectura limitada', disp: '5 abiertos', org: 'Individual', height: 'normal', style: [4, 3, 2, 4, 4, 4, 2], def: [3, 3, 3, 3, 3], p1: ['POS14', 'POS15'], p2: ['POS01', 'POS03', 'POS05'], group: 'ordinary', minutes: 'ordinary' },
  EQ07: { identity: 'Veteranos técnicos y menos físicos', disp: '1–4 bajo', org: 'Individual', height: 'normal', style: [2, 2, 4, 3, 2, 2, 2], def: [3, 2, 2, 2, 2], p1: ['POS11', 'POS12'], p2: ['POS05', 'POS07', 'POS13'], group: 'ordinary', minutes: 'veterans', midrange: 'seek' },
  EQ08: { identity: 'Jóvenes atléticos y menor comprensión', disp: '5 abiertos', org: 'Individual', height: 'normal', style: [4, 4, 2, 3, 3, 4, 3], def: [3, 4, 4, 4, 3], p1: ['POS01', 'POS09'], p2: ['POS02', 'POS05', 'POS14'], group: 'ordinary', minutes: 'young' },
  EQ09: { identity: 'Protección interior', disp: '3–2 ofensivo', org: 'Zona 2–3', height: 'normal', style: [2, 2, 3, 2, 2, 2, 4], def: [4, 2, 2, 2, 1], p1: ['POS01', 'POS11'], p2: ['POS04', 'POS12', 'POS13'], group: 'interior', minutes: 'ordinary' },
  EQ10: { identity: 'Velocidad y presión', disp: '4–1', org: 'Individual', height: 'three_quarters', style: [4, 4, 2, 3, 3, 4, 2], def: [3, 4, 4, 4, 3], p1: ['POS01', 'POS02', 'POS09'], p2: ['POS05', 'POS10', 'POS14'], group: 'ordinary', minutes: 'ordinary', coverage: 'COB03' },
  EQ11: { identity: 'Estrella con poco recambio', disp: '4–1', org: 'Individual', height: 'normal', style: [3, 3, 3, 3, 4, 3, 3], def: [3, 3, 3, 2, 3], p1: ['POS01', 'POS14'], p2: ['POS03', 'POS05', 'POS15'], group: 'ordinary', minutes: 'star' },
  EQ12: { identity: 'Plantilla profunda', disp: 'Horns', org: 'Zona 1–2–2', height: 'normal', style: [3, 3, 4, 3, 3, 3, 3], def: [3, 3, 3, 3, 3], p1: ['POS01', 'POS05', 'POS12'], p2: ['POS03', 'POS07', 'POS09'], group: 'creators', minutes: 'depth' },
};
const STYLE_KEYS = ['organizedPace', 'transition', 'elaboration', 'finishPreference', 'freedom', 'offensiveRisk', 'afterShot']; // orden de columnas del encargo §6.2
const DEF_KEYS = ['help', 'pressure', 'receivers', 'steal', 'protection']; // §6.3
const GROUPS = { ordinary: ['J01', 'J03', 'J06', 'J08', 'J10'], EQ02: ['J01', 'J04', 'J05', 'J08', 'J09'], interior: ['J01', 'J03', 'J06', 'J09', 'J11'], creators: ['J01', 'J12', 'J06', 'J09', 'J10'] };
const SLOTS = ['PG', 'SG', 'SF', 'PF', 'C'];
const MINUTES = { ordinary: [28, 12], veterans: [24, 16], depth: [24, 16], young: [26, 14], star: [28, 12] };
const DISP_BY_NAME = { '5 abiertos': /^5 abiertos$/, '4–1': /^4 abiertos y 1 interior$/, '3–2 ofensivo': /^3 abiertos y 2 interiores$/, Horns: /^Horns$/, '1–4 alto': /^1–4 alto$/, '1–4 bajo': /^1–4 bajo$/ };
const THROW_PRIORITY = { SaqB01: 1, SaqB02: 3, SaqB03: 3, SaqF03: 1, SaqF01: 3, SaqF02: 3 }; // seguridad de banda/fondo a 1; las otras dos de cada tipo a 3 (§7.1)
const PLAN_VERSION = 'NAT-MOTOR11-R1';

const byName = (obj, rx) => { const hit = Object.entries(obj).filter(([, v]) => (typeof rx === 'string' ? v.name === rx : rx.test(v.name))); if (hit.length !== 1) throw new Error(`no se resuelve de forma única: ${rx} → ${hit.map((h) => h[0])}`); return hit[0][0]; };

// ---------------------------------------------------------------------------------------------- generador (§8–§10): receta SEM como datos
const GENERATOR = {
  version: 'GEN-MOTOR11-R1',
  datasetVersion: 'POB-MOTOR11-R1',
  name: 'Generador correlacionado condicionado por plantillas de referencia (SEM)',
  provenance: 'Encargo MOTOR-11 §8–§10. Los coeficientes son semillas SEM administrables, no correlaciones medidas ni una estimación de la población real. Construyen entradas del escenario: no se reaplican como bonus al resolver tareas del encuentro.',
  distribution: { kind: 'triangularCentered', formula: 'Z = U1 + U2 − 1', note: 'U1 y U2 son uniformes reproducibles en [0,1) del stream de generación. Z es una variable interna temporal, no una capacidad.' },
  dispersions: { contained: 0.5, ordinary: 1, wide: 1.5 },
  defaultDispersion: 1,
  groups: {
    G01: { label: 'Tiro', abilities: ['TEC01', 'TEC02', 'TEC05', 'TEC06'] },
    G02: { label: 'Interior/finalización', abilities: ['TEC03', 'TEC04', 'TEC09', 'TEC11'] },
    G03: { label: 'Control/creación', abilities: ['TEC07', 'TEC08', 'TEC10'] },
    G04: { label: 'Defensa/rebote', abilities: ['TEC12', 'TEC13', 'TEC14', 'TEC15', 'TEC16', 'TEC17', 'TEC18'] },
    G05: { label: 'Movilidad', abilities: ['FIS01', 'FIS02', 'FIS03', 'FIS05'] },
    G06: { label: 'Contacto/estabilidad', abilities: ['FIS04', 'FIS07'] },
    G07: { label: 'Resistencia', abilities: ['FIS06'] },
    G08: { label: 'Lectura/mentales', abilities: ['MEN01', 'MEN02', 'MEN03', 'MEN04', 'MEN05', 'MEN06', 'MEN07'] },
  },
  coefficients: { team: 1.0, player: 1.5, residual: 0.75 },
  cross: {
    TEC08: { G08: 0.35 }, TEC10: { G05: 0.35 }, TEC12: { G05: 0.25 }, TEC13: { G06: 0.25 }, TEC15: { G05: 0.25, body: 0.25 }, TEC17: { G06: 0.25 }, TEC18: { G05: 0.25, body: 0.25 },
    FIS04: { body: 0.35 }, FIS01: { body: -0.2 }, FIS03: { body: -0.2 },
  },
  precision: { abilityDecimals: 3, bodyDecimals: 1, tendencyDecimals: 4 },
  body: {
    heightCm: { team: 2, player: 3, residual: 1 },
    weightKg: { team: 1.5, player: 2, residual: 0.75 },
    wingspanCm: { player: 1, residual: 1 },
    limits: { heightCm: { min: 170, max: 220 }, weightKg: { min: 55, max: 140 }, wingspanCm: { min: 170, max: 235 }, wingspanMinusHeightCm: { min: -2, max: 20 } },
    note: 'Límites de esta población ficticia de laboratorio adulta (no afirmaciones clínicas). La altura y la envergadura coinciden con el contrato corporal del perfil (body.heightRangeCm/wingspanRangeCm).',
  },
  age: { span: 5, offset: -2, bounds: { default: { min: 18, max: 42 }, EQ07: { min: 34, max: 42 }, EQ08: { min: 18, max: 23 } }, note: 'edad_base + floor(5·U) − 2; no se aplica otra curva de edad a las 32 capacidades.' },
  tendencies: { initiative: 0.1, finishingVocation: 0.1, zonePreference: 0.05 },
  rng: { derivation: 'FNV-1a 32 bits de «semilla|receta|dataset|clave canónica del stream» → xorshift32 del perfil (rng); 4 sorteos de calentamiento descartados', warmup: 4, note: 'Un stream por tipo/equipo/plaza/campo o grupo: el resultado no depende del orden de generación ni del RNG del partido.' },
  names: { pattern: 'Jugador <ID>', note: 'Etiqueta estable de plaza (identidad y dorsal no influyen en el desempeño).' },
  idPattern: 'GEN<identidad:2>_<semilla>_D<dispersión sin coma>',
};

// ---------------------------------------------------------------------------------------------- escenarios de contraste (§12)
const R = (op, rest) => ({ op, ...rest });
const LAB = {
  version: 'LAB-MOTOR11-R1',
  note: 'Catálogo versionado de escenarios MOTOR-11. Cada variante es una COPIA de la entrada con las diferencias exactas listadas (no sobrescribe fichas ni planes). Los marcados «diagnóstico» son entradas preparadas, no acontecimientos naturales. Un solo partido no atribuye causas.',
  scenarios: [
    { id: 'LAB11-00', name: 'Referencia histórica congelada', diagnostic: false, historical: true, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: false,
      question: 'Los planes históricos de EQ01/EQ02 y las fichas iniciales de MOTOR-10 siguen dando 83–103 con la semilla 20261016 (regresión).', conserved: ['fichas iniciales (revisión R0)', 'planes históricos de MOTOR-10', 'semilla deportiva 20261016'],
      variants: [{ id: 'base', label: 'Referencia histórica', ops: [] }] },
    { id: 'LAB11-01', name: 'Doce planes naturales', diagnostic: false, rivalFree: true, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: true, fromNaturalPlans: true,
      question: 'Cada equipo con su plan natural de MOTOR-11 y elección libre de rival.', conserved: ['fichas de referencia protegidas', 'política ENTREF02 y delegación ordinaria'],
      variants: [] },
    { id: 'LAB11-02', name: 'Energía inicial', diagnostic: true, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: false,
      question: 'El mismo director con energía 100, 30 u 8 (reserva crítica): ¿cómo cambia el uso y la rotación?', conserved: ['capacidades', 'Forma', 'momentos', 'plan'],
      variants: [{ id: 'E100', label: 'Energía 100 (base)', ops: [] }, { id: 'E30', label: 'Director a energía 30', ops: [R('state', { who: { team: 0, player: 'director' }, key: 'energy', value: 30 })] }, { id: 'E08', label: 'Director a energía 8 (reserva crítica)', ops: [R('state', { who: { team: 0, player: 'director' }, key: 'energy', value: 8 })] }] },
    { id: 'LAB11-03', name: 'Referente cansado y recambio', diagnostic: true, pairing: { a: 'EQ11', b: 'EQ01' }, multicause: false,
      question: 'EQ11 con su anotador J03 a energía 30 frente al mismo equipo con J03 a 100. El contraste con EQ12 (plantilla profunda) es multicausa.', conserved: ['capacidades', 'Forma', 'momentos', 'plan del resto'],
      variants: [{ id: 'J03-100', label: 'J03 a energía 100 (base)', ops: [] }, { id: 'J03-30', label: 'J03 a energía 30', ops: [R('state', { who: { team: 0, player: 'J03' }, key: 'energy', value: 30 })] },
        { id: 'VS-EQ12', label: 'EQ11 frente a EQ12 (multicausa: cambian plantilla, plan y rotación)', pairing: { a: 'EQ11', b: 'EQ12' }, multicause: true, ops: [] }] },
    { id: 'LAB11-04', name: 'Iniciativa del director', diagnostic: true, pairing: { a: 'EQ04', b: 'EQ01' }, multicause: false,
      question: 'El mismo director con Iniciativa 0,2 o 0,8: ¿cuánto margen toma sobre el plan?', conserved: ['capacidades', 'plan', 'Forma y momentos'],
      variants: [{ id: 'base', label: 'Iniciativa de la ficha (base)', ops: [] }, { id: 'I02', label: 'Iniciativa 0,2', ops: [R('field', { who: { team: 0, player: 'director' }, key: 'initiative', value: 0.2 })] }, { id: 'I08', label: 'Iniciativa 0,8', ops: [R('field', { who: { team: 0, player: 'director' }, key: 'initiative', value: 0.8 })] }] },
    { id: 'LAB11-05', name: 'Lectura del director', diagnostic: false, pairing: { a: 'EQ04', b: 'EQ01' }, multicause: false,
      question: 'El mismo director con MEN02 y MEN03 +3 frente a la base (intervención en dos capacidades explícitas, Iniciativa idéntica).', conserved: ['Iniciativa', 'resto de capacidades', 'plan'],
      variants: [{ id: 'base', label: 'Base', ops: [] }, { id: 'M+3', label: 'MEN02 y MEN03 +3', ops: [R('ability', { who: { team: 0, player: 'director' }, attrs: ['MEN02', 'MEN03'], delta: 3 })] }] },
    { id: 'LAB11-06', name: 'Veterano y joven', diagnostic: false, pairing: { a: 'EQ07', b: 'EQ08' }, multicause: true,
      question: 'EQ07 (veteranos técnicos, con EQ07-J01 de 40 años) frente a EQ08 (jóvenes atléticos): contraste multicausa. La copia de edad sola comprueba que la etiqueta no añade rendimiento.', conserved: ['semilla deportiva en la copia de edad'],
      variants: [{ id: 'base', label: 'EQ07 – EQ08 (multicausa)', ops: [] }, { id: 'AGE', label: 'Copia de edad sola: EQ07-J01 a 28 años (nada más cambia)', multicause: false, ops: [R('field', { who: { team: 0, player: 'J01' }, key: 'age', value: 28 })] }] },
    { id: 'LAB11-07', name: 'Forma', diagnostic: true, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: false,
      question: 'El mismo jugador con Forma −0,5 o +0,5 (escala vigente −1…1), energía y momentos iguales.', conserved: ['energía', 'momentos', 'capacidades', 'plan'],
      variants: [{ id: 'F-0.5', label: 'Forma −0,5', ops: [R('state', { who: { team: 0, player: 'J03' }, key: 'form', value: -0.5 })] }, { id: 'F+0.5', label: 'Forma +0,5', ops: [R('state', { who: { team: 0, player: 'J03' }, key: 'form', value: 0.5 })] }] },
    { id: 'LAB11-08', name: 'Libertad del libro', diagnostic: false, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: false,
      question: 'Libertad nivel 1 frente a nivel 5 conservando prioridades del libro y capacidades; las prioridades siguen compartidas (preferencias, no cuotas).', conserved: ['prioridades del libro', 'capacidades', 'resto de estilos'],
      variants: [{ id: 'L1', label: 'Libertad 1', ops: [R('style', { team: 0, key: 'freedom', value: 1 })] }, { id: 'L5', label: 'Libertad 5', ops: [R('style', { team: 0, key: 'freedom', value: 5 })] }] },
    { id: 'LAB11-09', name: 'Carga y balance', diagnostic: false, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: false,
      question: 'Después del tiro nivel 2 frente a nivel 4, resto igual.', conserved: ['resto de estilos', 'capacidades', 'plan'],
      variants: [{ id: 'AT2', label: 'Después del tiro 2', ops: [R('style', { team: 0, key: 'afterShot', value: 2 })] }, { id: 'AT4', label: 'Después del tiro 4', ops: [R('style', { team: 0, key: 'afterShot', value: 4 })] }] },
    { id: 'LAB11-10', name: 'Objetivo entra y sale (box and one)', diagnostic: true, pairing: { a: 'EQ01', b: 'EQ11' }, multicause: false,
      question: 'EQ01 defiende box and one sobre el anotador J03 de EQ11, con J01 como alternativa individual y ORG02 como alternativa declarada. La orden prevista del segundo periodo cambia el objetivo solo en una ventana real.', conserved: ['planes ofensivos', 'capacidades'],
      variants: [{ id: 'ORG06', label: 'Box and one sobre EQ11-J03 (alternativa EQ11-J01, ORG02 declarada)', ops: [R('plan', { team: 0, key: 'defense', value: 'ORG06' }), R('plan', { team: 0, key: 'target', value: { team: 1, player: 'J03' } }), R('plan', { team: 0, key: 'targetAlt', value: { team: 1, player: 'J01' } }), R('plan', { team: 0, key: 'fallbackOrg', value: 'ORG02' })],
        plannedOrders: [{ period: 2, boundary: 'inicio del segundo periodo', team: 0, spec: { type: 'defOrg', defense: 'ORG06', target: { team: 1, player: 'J01' }, targetAlt: { team: 1, player: 'J03' }, fallbackOrg: 'ORG02' }, note: 'Intercambia objetivo y alternativa; se envía desde «Partido» en la frontera del periodo y se aplica en su ventana real.' }] }] },
    { id: 'LAB11-11', name: 'Consistencia, momentos e importancia', diagnostic: true, reuseContrast: true, pairing: { a: 'EQ01', b: 'EQ02' }, multicause: false,
      question: 'Reutiliza las copias C04 (Consistencia alta/baja) y C05 (momentos, T e importancia decisiva) de MOTOR-07 sin inventar otro estado.', conserved: ['mecanismos de MOTOR-07'],
      variants: [{ id: 'C04', label: 'C04 · Consistencia alta / baja', ref: 'C04', ops: [] }, { id: 'C05', label: 'C05 · Momentos y T iniciales, importancia decisiva', ref: 'C05', ops: [] }] },
    { id: 'LAB11-12', name: 'Equipo generado reproducible', diagnostic: false, pairing: { a: { generated: { base: 'EQ04', seed: 20261017, dispersion: 1 } }, b: 'EQ01' }, rivalFree: true, multicause: true,
      question: 'Equipo generado desde EQ04 con semilla de generación 20261017 y dispersión 1; rival y semilla deportiva independientes de la generación.', conserved: ['la receta y la semilla de generación'],
      variants: [{ id: 'base', label: 'Generado EQ04 · semilla 20261017 · dispersión 1', ops: [] }] },
  ],
};

// ---------------------------------------------------------------------------------------------- materialización
export function loadEffectiveWithoutM11() {
  const base = read(PROFILE_PATH);
  const exts = [EXTENSION_PATH, EXTENSION3_PATH, EXTENSION4_PATH, EXTENSION5_PATH, EXTENSION6_PATH, EXTENSION7_PATH, EXTENSION8_PATH, EXTENSION9_PATH, EXTENSION10_PATH].map(read);
  return { baseProfile: base, profile: applyExtension(base, ...exts), players: parsePlayersCsv(readFileSync(PLAYERS_PATH, 'utf8'), base) };
}

function naturalPlan(profile, players, teamId, spec) {
  const rep = profile.repertoire; const drep = profile.defenseRepertoire;
  const mine = players.filter((p) => p.teamId === teamId);
  const ids = GROUPS[spec.group].map((j) => `${teamId}-${j}`);
  const starters = Object.fromEntries(SLOTS.map((s, i) => [s, ids[i]]));
  const disposition = byName(rep.dispositions, DISP_BY_NAME[spec.disp]);
  const defense = byName(drep.organizations, spec.org);
  const playbook = Object.keys(rep.plays).map((playId) => ({ playId, priority: spec.p1.includes(playId) ? 1 : spec.p2.includes(playId) ? 2 : 5 }));
  const coverage = spec.coverage ?? 'COB01';
  const navigation = coverage === 'COB03' ? drep.coverages.COB03.navigation[0] : null;
  const plan = {
    teamId, disposition, defense, coverage, pressureHeight: spec.height,
    styles: Object.fromEntries(STYLE_KEYS.map((k, i) => [k, spec.style[i]])),
    starters, directorPriority: ['J01', 'J12', 'J06', 'J02'].map((j) => `${teamId}-${j}`),
    playbook, initialTeamMoment: 0, midrange: spec.midrange ?? 'openOnly',
    defStyles: Object.fromEntries(DEF_KEYS.map((k, i) => [k, spec.def[i]])), navigation, marks: [], target: null, targetAlt: null, fallbackOrg: 'ORG02', specials: [],
    throwInBook: Object.entries(THROW_PRIORITY).map(([playId, priority]) => ({ playId, priority })),
    throwInServers: { band: { preferred: null, alternate: null }, endline: { preferred: null, alternate: null } },
    throwInDefense: { band: profile.throwIns.defaultBandDefensiveResponse, endline: profile.throwIns.defaultEndlineDefensiveResponse, target: null },
    coach: { policy: 'ENTREF02', delegation: { rotation: true, adjustments: true, fouls: true, timeouts: true, endgame: true } },
    natural: { id: `NAT-${teamId}`, version: PLAN_VERSION },
  };
  // relevos: la precarga funcional existente (posición, director, mejor ajuste) y después los minutos objetivo SEM del encargo §7.3
  const part = defaultParticipationPlan(profile, mine, plan);
  const [st, rl] = MINUTES[spec.minutes];
  part.pairs.forEach((q) => { const star = spec.minutes === 'star' && q.starter === `${teamId}-J03`; q.starterMinutes = star ? 32 : st; q.reliefMinutes = star ? 8 : rl; });
  part.source = `SEM-MOTOR11: plan natural ${teamId}; relevos por posición, director y mejor ajuste funcional; objetivos ${spec.minutes === 'star' ? '32/8 para J03 y 28/12 en el resto' : `${st}/${rl}`}; los recursos situacionales quedan a cero (revisable)`;
  plan.participation = part;
  return plan;
}

export function buildExtension11() {
  const { profile, players } = loadEffectiveWithoutM11();
  const teams = {};
  for (const [id, spec] of Object.entries(TEAMS)) {
    const plan = naturalPlan(profile, players, id, spec);
    teams[id] = { name: profile.fixtureContract.teamNames[id], identity: spec.identity, planVersion: PLAN_VERSION, sourceTables: { disposition: spec.disp, defense: `${spec.org}${spec.height === 'three_quarters' ? ' · tres cuartos' : ''}`, p1: spec.p1, p2: spec.p2, starters: GROUPS[spec.group].join(' '), minutes: spec.minutes }, plan };
  }
  // comprobación inmediata: cada plan es válido frente a otro equipo cualquiera
  const rotate = Object.keys(TEAMS);
  rotate.forEach((id, i) => {
    const rival = rotate[(i + 1) % rotate.length];
    const mk = (tid) => ({ id: tid, name: tid, players: players.filter((p) => p.teamId === tid), plan: teams[tid].plan });
    const input = { ...buildMatchInput(profile, players), teams: [mk(id), mk(rival)] };
    const errs = validateInput(input, profile);
    if (errs.length) throw new Error(`plan natural ${id} no válido: ${errs.map((e) => `${e.path}: ${e.message}`).join('; ')}`);
  });
  return {
    seedExtensionId: 'SEM-MOTOR11-20261017',
    status: 'SEM: provisional, no calibrado (población de referencia, planes naturales, receta del generador y escenarios de contraste; ningún efecto deportivo nuevo en el motor).',
    basedOn: 'SEM-MOTOR01-20261016',
    origin: 'docs/prompts/MOTOR-11-poblacion-generador-y-escenarios.md (§5 fichas y revisión de edad, §6 planes naturales, §7 libros y rotación, §8–§10 generador, §12 escenarios). Las 144 fichas numéricas siguen siendo las del anexo B de MOTOR-01 (data/fixtures/reference-players-MOTOR01.csv, sin tocar); este archivo añade la revisión de edad, los planes materializados y las recetas.',
    additions: {
      population: {
        version: 'POB-MOTOR11-R1',
        name: 'Población de referencia de MOTOR-11 (doce equipos, 144 plazas, planes naturales y generador)',
        provenance: 'Valores SEM del encargo MOTOR-11. Las fichas de referencia (revisión R0) proceden literalmente del anexo B de MOTOR-01; la revisión R1 solo cambia la edad de EQ07-J01. «Definido» no es «implementado» ni «calibrado».',
        referenceDataset: { file: 'data/fixtures/reference-players-MOTOR01.csv', originalRevision: 'R0', players: 144, teams: 12 },
        revisions: [
          { id: 'R0', label: 'Inicial (anexo B de MOTOR-01)', source: 'dato inicial', changes: [] },
          { id: 'R1', label: 'MOTOR-11 (EQ07-J01 con 40 años)', source: 'revisión aceptada (encargo MOTOR-11 §5.3)', changes: [{ player: 'EQ07-J01', field: 'age', before: 37, after: 40, note: 'El funcional identifica a EQ07-J01 como referencia de 40 años; capacidades y cuerpo se conservan. La edad no modifica por sí sola el rendimiento.' }] },
        ],
        currentRevision: 'R1',
        teams,
      },
      generator: GENERATOR,
      lab: LAB,
    },
  };
}

export function serialize(ext) { return `${JSON.stringify(ext, null, 1)}\n`; }

if (process.argv[1] && process.argv[1].endsWith('build-motor11-data.js')) {
  const text = serialize(buildExtension11());
  if (process.argv.includes('--write')) { writeFileSync(EXTENSION11_PATH, text); console.log('escrito', EXTENSION11_PATH, `${text.length} bytes`); }
  else console.log(text.length, 'bytes (usa --write para escribir)');
}
