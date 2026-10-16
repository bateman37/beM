// Filas del diccionario para SEM-MOTOR09 (reglamento y acta, REG01–REG04, EST01–EST04, ruta B de MEM03). Mismo contrato que rows.js.
// La matriz normativa (`regulation.matrix`), las fuentes y la política estadística son contenido declarativo (no filas calibrables): se
// consultan en las vistas «Reglamento» y «Acta y créditos» del panel. Aquí solo hay las magnitudes consultadas por el motor.
const EXT = 'SEM-MOTOR09';
const R = { cls: 'reglamento', views: ['reglamento'], ext: EXT };
const fam = (f) => f;

export const MOTOR09_FAMILIES = [
  fam({ ...R, path: 'regulation.availability.minPlayersToContinue', type: 'count', unit: 'jugadores', grp: 'REG04', mech: 'regs.availability', locked: true, coverage: 'sin_consumidor',
    label: () => 'Disponibilidad · mínimo de jugadores elegibles para continuar', desc: () => 'Umbral de continuación del encuentro. Valor PROVISIONAL sin contrastar con S09-01 (PDF inaccesible, HTTP 403).', effect: () => 'Solo la consultan los casos preparados de inferioridad (regs.availability): el motor natural exige cinco elegibles y falla con diagnóstico, sin generación natural de este caso. Protegida hasta contrastar la fuente.' }),
  fam({ ...R, path: 'regulation.termination.{k}', dom: { k: ['forfeitWinnerPoints', 'forfeitLoserPoints'] }, type: 'count', unit: 'puntos', grp: 'REG04', mech: 'regs.terminate', locked: true, coverage: 'sin_consumidor',
    label: (m) => `Terminación administrativa · ${m.k === 'forfeitWinnerPoints' ? 'puntos adjudicados al favorecido' : 'puntos adjudicados al otro equipo'}`, desc: () => 'Resultado ADJUDICADO por terminación administrativa. Valor PROVISIONAL sin contrastar con S09-01.', effect: () => 'Solo la consultan los casos preparados de terminación (regs.terminate). Nunca se mezcla con el tanteo de cancha ni se atribuye a un jugador.' }),
  fam({ ...R, path: 'regulation.disqualification.limit', type: 'count', unit: 'faltas acumuladas', grp: 'REG04', mech: 'MatchCore.disqualifies', locked: true,
    label: () => 'Descalificación · límite acumulado de flagrantes y técnicas de categoría 1', desc: () => 'S09-01 38.2.3 y 41 (contrastada con el encargo §4.3): dos flagrantes, dos técnicas de categoría 1 o una de cada.', effect: () => 'Dos disruptivas no descalifican por sí solas. Obligación reglamentaria: consultable, no editable.' }),
  fam({ cls: 'balance', views: ['memoria'], ext: EXT, path: 'memory.routeB.enabled', type: 'bool', unit: 'sí/no', grp: 'DEF09', mech: 'preparedCoverage',
    label: () => 'Memoria · ruta B habilitada', desc: () => 'Un patrón reconocido puede preparar, al llegar la interacción, una cobertura compatible ya permitida dentro del encargo actual (sin ventana, sin cambio de plan).', effect: () => 'Desactivarla deja solo la ruta A (propuesta de cambio de plan por ENT). No concede bonus de acierto ni de robo.' }),
  fam({ cls: 'balance', views: ['memoria'], ext: EXT, path: 'memory.routeB.maxPerAttack', type: 'count', unit: 'preparaciones', grp: 'DEF09', mech: 'preparedCoverage',
    label: () => 'Memoria · ruta B: preparaciones máximas por ataque', desc: () => 'Una misma evidencia no se aplica como ventaja acumulada: como máximo se prepara una cobertura por ataque.', effect: () => 'Contabiliza la preparación, no la garantiza: la ejecución real sigue requiriendo participantes y capacidades.' }),
];

// Identificación documental y contenido declarativo (matriz, fuentes, política estadística).
export const MOTOR09_EXEMPT = [
  /^regulation\.(version|edition|consulted|sources|matrix|revision)(\.|$)/, /^regulation\.(availability|termination|disqualification)\.(contrast|note)$/, /^regulation\.disqualification\.sumOf/,
  /^statsPolicy\./, /^memory\.routeB\.(version|description)$/,
];
