// Matriz de visibilidad de MOTOR-10 (§18, EST07). Se aplica ANTES de construir consultas, candidatos, textos y exportaciones (no ocultando columnas al final).
//  público/rival: hechos observables, acta, acciones y organizaciones ejecutadas, contexto público.
//  propia: plan y órdenes conocidos, prioridades del libro, procedencia de la decisión propia, alternativas autorizadas.
//  diagnóstico: probabilidades exactas, cálculos, alternativas evaluadas y versiones; acceso separado y exportación identificada como tal.
export const VISIBILITY = [
  { field: 'Acta, marcador, parciales, créditos', public: 'sí', own: 'sí', diag: 'sí' },
  { field: 'Zona, valor, resultado, defensor, familia y cobertura ejecutada', public: 'sí', own: 'sí', diag: 'sí' },
  { field: 'Calidad previa (categoría cómoda/normal/forzada)', public: 'categoría, nunca la probabilidad', own: 'categoría', diag: 'categoría y K' },
  { field: 'Procedencia de la decisión (libro / directa / autónomo)', public: 'no (solo la acción observada)', own: 'sí (del equipo propio)', diag: 'sí' },
  { field: 'Prioridad del libro, ficha seleccionada, disposición, director', public: 'no', own: 'sí (del equipo propio)', diag: 'sí' },
  { field: 'Probabilidades exactas (pConversion, pFinal, L, q)', public: 'no', own: 'no', diag: 'sí' },
  { field: 'Sacador preferido y ficha de saque', public: 'no (receptor y desenlace sí)', own: 'sí (propio)', diag: 'sí' },
  { field: 'Energía, Forma y momentos', public: 'no', own: 'solo por la vista de estado propio de MOTOR-07', diag: 'sí' },
  { field: 'Recomendaciones condicionadas', public: 'no se generan con alternativas no autorizadas', own: 'sí', diag: 'sí' },
  { field: 'Rebote por oportunidad (candidatos)', public: 'no', own: 'no', diag: 'sí' },
  { field: 'Evidencia (IDs) y consultas', public: 'solo IDs de hechos públicos', own: 'propios y públicos', diag: 'todos' },
  { field: 'Exportación (JSON, CSV, Markdown)', public: 'misma regla que la vista', own: 'misma regla que la vista', diag: 'identificada como diagnóstico' },
];
export const AUDIENCE_LABEL = { public: 'Público / rival', own: 'Propia', diagnostic: 'Diagnóstico' };
