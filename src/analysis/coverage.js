// Cobertura honesta (MOTOR-10 §4.1 y §22.2). «Todas las conciliaciones pasan» prueba consistencia bajo las reglas vigentes, NO conformidad normativa completa.
// Ninguna fila es lectura directa del PDF de FIBA: se conserva la procedencia declarada por MOTOR-09 sin borrar su historial.
export const COVERAGE_CATEGORIES = {
  A: 'Dato producido y política acreditada (solo contra el texto del encargo de MOTOR-09; no es lectura directa del PDF)',
  B: 'Dato producido bajo convención beM o regla heredada/provisional identificada',
  C: 'Administración preparada pero no ejecutable en flujo natural',
  D: 'Campo no registrado o caso no implementado',
  E: 'Ejecución inválida, parcial o administrativa',
};

export function classifyRow(m) {
  const admin = m.coverage?.admin ?? ''; const natural = m.coverage?.natural ?? '';
  if (m.contrast === 'pendiente' || admin.startsWith('tipada')) return 'D';
  if (['RG-D02', 'RG-T01'].includes(m.id) || admin.startsWith('parcial')) return 'E';
  if (natural.startsWith('implementada') || natural.startsWith('disruptiva implementada')) return m.contrast === 'contrastada' ? 'A' : 'B';
  return 'C';
}
export function coverageMatrix(res) {
  const matrix = res.profile?.regulation?.matrix ?? [];
  return matrix.map((m) => ({ id: m.id, family: m.family, contrast: m.contrast, category: classifyRow(m), categoryText: COVERAGE_CATEGORIES[classifyRow(m)], admin: m.coverage?.admin, exposure: m.coverage?.exposure, natural: m.coverage?.natural }));
}

// Disponibilidad de las preguntas analíticas por bloque (productor, consulta, permiso, cobertura): catálogo del funcional, no una lista de deseos.
export const BLOCKS = [
  { id: 'acta', block: 'Acta y comparación', producer: 'acta.js (MOTOR-09)', query: 'catalog.js, shooting.js', permission: 'público', coverage: 'disponible', note: 'Mates y rebotes colectivos naturales: no representados.' },
  { id: 'formulas', block: 'Fórmulas del §6.2 y cuatro factores', producer: 'acta + posesiones beM', query: 'catalog.js, formulas.js', permission: 'público', coverage: 'disponible', note: 'Rebote por oportunidad solo en diagnóstico; historial: dependiente de datos.' },
  { id: 'evolution', block: 'Evolución, parciales y final ajustado', producer: 'pointEvents + intervalos de juego vivo', query: 'evolution.js', permission: 'público', coverage: 'disponible', note: 'Los hechos con el mismo reloj conservan su secuencia.' },
  { id: 'map', block: 'Mapa sectorial y calidad previa', producer: 'hecho shot (zona) + intent.calidad', query: 'shooting.js', permission: 'público (categoría); probabilidad exacta solo diagnóstico', coverage: 'parcial', note: 'Sin lateralidad (confirmado sin productor): el motor registra aro/pintura/media/triple, no Z03–Z10 por separado.' },
  { id: 'offense', block: 'Origen, ejecuciones, libro y director', producer: 'intent y participants del hecho de intento', query: 'offense.js', permission: 'acción observada: público; procedencia, prioridad y director: propio', coverage: 'disponible', note: 'Alternativas no percibidas: diagnóstico.' },
  { id: 'defense', block: 'Organización, coberturas, ayuda y responsabilidades', producer: 'plan + órdenes defOrg + intent.cobertura/defensa', query: 'defense.js', permission: 'ejecutado: público', coverage: 'disponible', note: 'Desde MOTOR-11 la organización efectiva se relaciona con cada tiro (plan + órdenes aplicadas + alternativa registrada); la tabla por posesión sigue disponible con la fila «mixta».' },
  { id: 'restarts', block: 'Saques y continuidad', producer: 'diagnostics.throwInChains', query: 'restarts.js', permission: 'receptor y desenlace: público; ficha y sacador preferido: propio', coverage: 'disponible', note: 'Casos reglamentarios no ejecutados se listan aparte (no son cero incidencias).' },
  { id: 'offball', block: 'Trabajo útil sin balón', producer: 'hechos existentes (pantalla, corte, ayuda, relevo, encargos de rebote, cadena de robo, balón suelto)', query: 'offball.js', permission: 'público', coverage: 'parcial', note: 'OB05 y la disponibilidad de corte ante negación se conservan desde MOTOR-11 (partidos nuevos); en archivos anteriores siguen «no registrado». Otras opciones de corte no existen como hecho.' },
  { id: 'presence', block: 'Quintetos, grupos y on/off', producer: 'lineups + intervalos del acta', query: 'presence.js', permission: 'público', coverage: 'disponible', note: 'Diferencia observada, no causal; sin exposición completa no hay diferencia finita.' },
  { id: 'summary', block: 'Resumen, claves, líderes y crónica', producer: 'consultas del catálogo', query: 'summary.js', permission: 'según audiencia', coverage: 'disponible', note: 'Menos de tres claves es un resultado válido.' },
  { id: 'reports', block: 'Informes propio, rival e individual', producer: 'las mismas consultas con audiencia', query: 'index.js', permission: 'propio/rival/diagnóstico separados', coverage: 'disponible', note: 'El estado propio visible solo se ofrece si su exposición temporal está conservada: hoy no lo está (no se muestra).' },
  { id: 'export', block: 'Exportación analítica', producer: 'export.js', query: 'JSON, CSV y Markdown de la audiencia', permission: 'según audiencia', coverage: 'disponible', note: 'El ZIP masivo es de MOTOR-12.' },
];

export const DEBT_MOTOR09 = [
  { item: 'Contraste con los PDF de FIBA (S09-01 a S09-04, HTTP 403)', impact: 'Ninguna fila es lectura directa; las conciliaciones prueban consistencia, no conformidad.', close: 'Acceso a las fuentes o contenido exacto.' },
  { item: 'Técnicas y flagrantes 2026 (RG-F07…F10)', impact: 'MOTOR-15: administración ejecutable por entrada tipada (contexto externo admitido); sin generación natural (no se deduce conducta de las 32 capacidades). «Antideportiva» es un alias sin categoría propia.', close: 'Solo contraste directo con N15-01/N15-03 (HTTP 403 desde el entorno).' },
  { item: 'Compensación de sanciones (RG-C02, art. 43) y correcciones (RG-R01, art. 45)', impact: 'MOTOR-15: ejecutables por síntesis selectiva de ChatGPT (N15-01/N15-02); sin generación natural; la numeración exacta por rama de 45.4 no se leyó directamente.', close: 'Contraste directo con los PDF.' },
  { item: 'Inferioridad natural, umbral y terminación administrativa (RG-D02, RG-T01)', impact: 'Un partido sin cinco elegibles falla con diagnóstico (ejecución inválida); no hay resumen de victoria normal.', close: 'Artículos de continuación con menos de cinco y de terminación.' },
  { item: 'Tiro con liberación/resolución e interferencia condicionada', impact: 'MOTOR-15: dos hitos discretos (SEM15-TIR-01) e interferencia por oportunidad elegible (SEM15-INT-01…04, SEM sin calibrar); RG-I03 (último libre, defensiva) administra desde MOTOR-15B la técnica de categoría 2 con un libre adicional (B15-N1, síntesis de ChatGPT); RG-I01, I02 e I04 siguen siendo lectura de Claude, provisionales.', close: 'Calibración de frecuencias en MOTOR-16/17 y contraste del art. 31 (RG-I01, I02, I04).' },
  { item: 'Persistencia de suspensión y continuación desde snapshot', impact: 'Un partido suspendido solo existe como acta parcial de sesión.', close: 'Plataforma de guardado (entrega posterior).' },
  { item: 'Política de asistencias (N15-04 cap. 6)', impact: 'MOTOR-15: productor causal con motivo de cierre; el núcleo no genera desvíos (previsto = efectivo). Extracto de ChatGPT, no lectura directa del PDF.', close: 'Lectura del capítulo 6.' },
];
// Pendientes de MOTOR-10 revisados uno a uno en MOTOR-11 (§4): ninguno se aprueba «en bloque». `status`: resuelto (consulta/lectura completada) · instrumentado (el productor ya
// calculaba el dato y ahora lo conserva; solo partidos nuevos) · confirmado sin productor (la operación no existe; se identifica el límite) · pendiente.
export const PENDING_MOTOR10 = [
  { item: 'Lateralidad del mapa (Z03–Z10)', status: 'confirmado sin productor', impact: 'El motor resuelve solo aro/pintura/media/triple. Se conserva lo que existe (función del tirador en la disposición: esquina, ala, cabecera… como dato propio) y el lado queda «desconocido»; nunca se sortea izquierda/derecha. Una ficha «lateral» sin lado no basta.', close: 'Una operación que resuelva el lado del tiro (decisión de contenido y productor; no se simula espacio nuevo).' },
  { item: 'Organización defensiva efectiva por hecho', status: 'resuelto', impact: 'Cada tiro se relaciona con la organización efectiva y la versión de plan de su frontera (plan inicial + órdenes aplicadas + alternativa de box and one registrada), no con la última intención guardada. Los archivos anteriores se reconstruyen igual desde el historial de órdenes.', close: '—' },
  { item: 'Ocupación que limita ayuda (OB05)', status: 'instrumentado', impact: 'El cálculo de ayuda conserva ahora elegibles, ocupados por compromisos previos, bloqueados por no abandonar y candidatos finales (campo `instr`, fuera de la proyección deportiva). Partidos anteriores: «no registrado».', close: '—' },
  { item: 'Disponibilidad de corte', status: 'instrumentado', impact: 'Solo el corte ante negación (CONT06) que la propia operación evalúa: disponible, cortador y aceptación. Una opción de corte que ninguna operación evaluó no existe como hecho. Partidos anteriores: «no registrado».', close: 'Otras opciones de corte: requieren que exista la operación de evaluación.' },
  { item: 'Asistencia: «continuación de ventaja» y «desviación»', status: 'instrumentado', impact: 'MOTOR-15: el productor registra receptor previsto/efectivo, continuidad, creación propia y motivo de cierre. La desviación hacia otro destinatario NO se genera (no existe esa interacción): solo invalida ante el hecho tipado.', close: 'Operación de desvío, si se decide.' },
  { item: 'Cuota de cierres de posesión', status: 'resuelto', impact: 'Cierres atribuibles al jugador / cierres elegibles del equipo, con fila colectiva (fin de periodo, balón suelto, pérdida de equipo) sin cargar al base; conciliada (Σ individuales + colectivos = elegibles).', close: '—' },
  { item: 'Producción por 100 ataques completos con presencia completa', status: 'resuelto', impact: 'Numerador y denominador en las mismas unidades (ataques propios para créditos ofensivos, rivales para defensivos); mixtas y parciales aparte.', close: '—' },
  { item: 'Estado propio visible con exposición temporal', status: 'resuelto', impact: 'MOTOR-15: muestras en fronteras de periodo (inicio/final) y consulta por tramo con audiencia; sin muestra intermedia ni interpolación. Partidos anteriores: «no registrado».', close: '—' },
  { item: 'Recomendaciones fuera de REC10-01 y REC10-02', status: 'pendiente', impact: 'No hay otras estrategias (no se amplía el asesor).', close: 'Encargo posterior.' },
];
export const LATER_DELIVERIES = [
    { item: 'Simulación masiva, agregados de lotes y extracción ZIP completa', where: 'MOTOR-12' },
  { item: 'Calibración y validación amplia; historial, temporada y percentiles', where: 'entregas posteriores del roadmap' },
];
