// Informe de la memoria defensiva con DENOMINADORES separados (MOTOR-09 §16.1–§16.2). Solo lee el registro exportado: no calcula nada con azar ni
// «mejora» una tasa. Ni «seis de veintiocho» ni «ochenta reemplazos» demuestran por sí solos un defecto: aquí se explica qué cuenta cada cifra.
export const MEMORY_REPORT_VERSION = 'MEMREP-MOTOR09-R1';

const CAUSES = [
  ['incompatibilidad deportiva', /no es una respuesta compatible|no resuelve coberturas|incompatible con el plan/i],
  ['encargo manual', /orden manual vigente/i],
  ['ausencia de ventana', /ventana/i],
  ['estabilidad vigente', /permanencia|orden pendiente|una dimensión principal/i],
  ['respuesta ya activa', /ya vigente|ya está activa/i],
  ['la defensa ya contiene el patrón (oportunidad no cómoda)', /no fue cómoda/i],
  ['falta de alternativa declarada', /sin respuesta declarada|sin margen/i],
  ['ámbito no delegado', /no delegado/i],
  ['protagonista fuera de pista', /no está en pista/i],
];
const classify = (text) => (CAUSES.find(([, re]) => re.test(text ?? ''))?.[0]) ?? 'otra causa (ver decisión)';

export function memoryReport(res) {
  const log = res.diagnostics?.memory?.log ?? [];
  const decisions = (res.diagnostics?.coach?.decisions ?? []).filter((d) => d.area === 'adjustments' && /^MEM03/.test(d.regla ?? ''));
  const capacity = res.profile?.memory?.capacity ?? null;
  const teams = (res.teams ?? []).map((t) => t.id);
  const perTeam = {};
  for (const t of teams) {
    const rows = log.filter((x) => x.equipo === t);
    const exp = rows.filter((x) => x.tipo === 'exposición');
    const keys = {}; for (const e of exp) keys[e.clave] = (keys[e.clave] ?? 0) + 1;
    const reco = rows.filter((x) => x.tipo === 'reconocimiento');
    const episodes = new Set(reco.map((x) => `${x.clave}#${x.episodio}`));
    const recoKeys = new Set(reco.map((x) => x.clave));
    perTeam[t] = {
      exposicionesValidas: exp.length, patronesUnicosObservados: Object.keys(keys).length, claves: keys,
      reconocimientos: { revisiones: reco.length, patronesDistintos: recoKeys.size, episodios: episodes.size, revisionesDeUnPatronYaReconocido: reco.length - episodes.size },
      rotacion: { capacidad: capacity, inserciones: rows.filter((x) => x.tipo === 'inserción').length, reemplazosPorCapacidad: rows.filter((x) => x.tipo === 'reemplazo').length, descartesPorDecaimiento: rows.filter((x) => x.tipo === 'descarte').length, actualizacionesDeEntradaExistente: exp.filter((x) => x.entrada === 'actualización').length },
      preparacionesRutaB: { preparadas: rows.filter((x) => x.tipo === 'preparación' && x.resultado === 'preparada').length, continuidad: rows.filter((x) => x.tipo === 'preparación' && x.resultado === 'continuidad').length, impedidas: rows.filter((x) => x.tipo === 'preparación' && x.resultado === 'impedida').length },
    };
  }
  const withProp = decisions.filter((d) => d.propuesta);
  const unapplied = {};
  for (const d of decisions) {
    if (d.estado === 'ejecutada') continue;
    const texts = [d.causa, ...(d.observaciones?.candidatasDescartadas ?? []).map((c) => c.motivo)].filter(Boolean);
    const cause = classify(texts[0]); unapplied[cause] = (unapplied[cause] ?? 0) + 1;
  }
  return {
    version: MEMORY_REPORT_VERSION,
    denominadores: {
      exposicionesValidas: Object.values(perTeam).reduce((s, x) => s + x.exposicionesValidas, 0),
      patronesUnicosObservados: Object.values(perTeam).reduce((s, x) => s + x.patronesUnicosObservados, 0),
      revisionesDeReconocimiento: decisions.length,
      episodiosDeReconocimiento: Object.values(perTeam).reduce((s, x) => s + x.reconocimientos.episodios, 0),
      recomendacionesNuevas: withProp.length,
      respuestasCompatibles: withProp.length,
      respuestasAutorizadas: withProp.filter((d) => ['autorizada', 'ejecutada', 'cancelada'].includes(d.estado)).length,
      respuestasAplicadasRutaA: withProp.filter((d) => d.estado === 'ejecutada').length,
      preparacionesRutaB: Object.values(perTeam).reduce((s, x) => s + x.preparacionesRutaB.preparadas, 0),
    },
    porEquipo: perTeam, noAplicadas: unapplied,
    lectura: 'Cada cifra tiene su denominador: revisiones del mismo patrón no son patrones distintos, y una propuesta no aplicada se explica por su causa (incompatibilidad, encargo manual, ventana, estabilidad, respuesta ya activa, falta de alternativa o una defensa que ya contiene el patrón). No es una cuota ni una tasa objetivo.',
  };
}
