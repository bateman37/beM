// Lectura por audiencia de la familiaridad táctica (MOTOR-18 §12.3). Se aplica ANTES de construir la vista (lista blanca de campos, no una columna oculta al final):
//  · público / rival: el conocimiento exacto, la Polivalencia y la enseñanza del entrenador NO son observables → no se entrega ninguno.
//  · propia: categoría y nivel de los conocimientos del equipo propio con su exposición del encuentro; nunca teaching, Polivalencia ni conocimiento del rival.
//  · diagnóstico (identificado como tal): instantánea completa de ambos equipos, Polivalencia, enseñanza y resumen de aplicación.
import { categoryOf, isLegacyNeutral, BLOCK_FIELD } from '../knowledge/model.js';

export const FAMILIARITY_VIEW_VERSION = 'FAMVIEW-MOTOR18-R1';
const EXPLAIN = 'Familiaridad = conocimiento adquirido de posiciones, roles y sistemas. Afecta a la coordinación (calidad de la oportunidad y salida ante presión adelantada) y se aprende entre partidos; no sustituye al talento de las 32 capacidades.';

export function familiarityView(res, { audience = 'public', team = 0 } = {}) {
  const fam = res.diagnostics?.familiarity ?? null; const params = res.profile?.familiarity ?? null;
  const base = { version: FAMILIARITY_VIEW_VERSION, audience, explanation: EXPLAIN };
  if (!fam) return { ...base, available: false, note: 'el encuentro no conserva familiaridad táctica (perfil o motor anterior a MOTOR-18)' };
  if (audience === 'public') return { ...base, available: false, note: 'el conocimiento táctico de los equipos no es observable desde el exterior: no se muestra.' };
  const playerView = (t, own) => t.players.map((p) => {
    const neutral = isLegacyNeutral(p.knowledge); const x = fam.exposure?.players?.[p.id] ?? null;
    const entries = neutral || !params ? null : Object.fromEntries(Object.entries(BLOCK_FIELD).map(([domain, field]) => [field, Object.fromEntries(Object.entries(p.knowledge[field] ?? {}).map(([id, e]) => [id, { level: e.level, category: categoryOf(e.level, params).label, ...(own === 'diagnostic' ? { peak: e.peak, lastPracticeDay: e.lastPracticeDay } : {}) }]))]));
    return { id: p.id, mode: neutral ? 'legacy-neutral' : 'explicit', note: neutral ? 'sin historial de aprendizaje; compatibilidad neutra' : null, ...(entries ? { knowledge: entries } : {}), exposure: x, ...(own === 'diagnostic' ? { tacticalLearning: p.development?.tacticalLearning ?? null } : {}) };
  });
  if (audience === 'own') { const t = res.input.teams[team]; return { ...base, available: true, team: t.id, players: playerView(t, 'own'), note: 'solo el equipo propio; el rival no revela su conocimiento, su enseñanza ni su Polivalencia.' }; }
  return { ...base, available: true, diagnostic: true, identification: 'DIAGNÓSTICO: contiene el conocimiento de ambos equipos, Polivalencia y enseñanza; no se entrega a un decisor ni a un entrenador automático.', teams: res.input.teams.map((t) => ({ team: t.id, coachLearning: t.coachLearning ?? null, players: playerView(t, 'diagnostic') })), applications: fam.applications, operations: fam.exposure?.operations ?? null };
}
