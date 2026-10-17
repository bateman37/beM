// Parámetros de análisis y presentación (SEM de MOTOR-10): editoriales y de muestra. NO son multiplicadores deportivos y nada de aquí cambia el partido.
// Viven en el perfil (`analysis`, extensión SEM-MOTOR10-20261016) y son administrables en el panel; si un resultado no los trae (perfil anterior) se usan
// estos valores por defecto y la consulta identifica `policy: 'por defecto del código'`.
export const ANALYSIS_POLICY_ID = 'ANA-MOTOR10-R1';
export const DEFAULT_ANALYSIS = {
  version: ANALYSIS_POLICY_ID,
  adjustedFinal: { seconds: 120, margin: 5 },
  beforeAfter: { attacks: 3 },
  sample: { warnBelow: 5, lineupMinSeconds: 180, lineupMinAttacks: 8 },
  conventions: { ftCoefficient: 0.44, clockEndTenths: 40 },
  summary: { maxKeys: 3, productionDiffMin: 6, unansweredMin: 8, executionMin: 4, qualityMinOpportunities: 8, qualityDiffPp: 20, groupSeconds: 180, groupAttacks: 8, categoryOrder: ['producción', 'evolución', 'táctica'] },
  recommendations: {
    'REC10-01': { enabled: true, minExecutions: 4, minDenials: 2, minAlternatives: 2, title: 'Salida negada',
      text: 'La misma respuesta rival cerró la salida prevista en {denials} de {executions} ejecuciones y en {alternatives} ocasiones la alternativa estuvo registrada y autorizada: considerar una variante ya disponible que la utilice, teniendo en cuenta su concesión o riesgo conocido.' },
    'REC10-02': { enabled: true, minMisses: 5, minTransitions: 2, title: 'Revisar balance',
      text: 'Hubo {misses} fallos propios con encargo de carga identificado y {transitions} transiciones rivales enlazadas a esos fallos; en ese universo se capturaron {orebs} rebotes ofensivos. Considerar revisar el equilibrio entre carga y balance. Es una coexistencia observada: no se afirma que cambiar el encargo elimine las transiciones.' },
  },
};
export function analysisParams(res) {
  const p = res?.profile?.analysis;
  return p ? { ...mergeDeep(DEFAULT_ANALYSIS, p), policy: p.version } : { ...DEFAULT_ANALYSIS, policy: 'por defecto del código (perfil sin tabla analysis)' };
}
function mergeDeep(a, b) { if (Array.isArray(a) || typeof a !== 'object' || a == null) return b === undefined ? a : b; const o = { ...a }; for (const k of Object.keys(b ?? {})) o[k] = k in a ? mergeDeep(a[k], b[k]) : b[k]; return o; }
