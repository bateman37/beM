// Definición explícita y reutilizable de los tipos de orden, sus ámbitos y fronteras de aplicación (MOTOR-02, §11 del encargo).
// No hay coeficientes deportivos aquí: solo la forma del contrato. Las constantes reglamentarias viven en datos versionados
// (data/match/motor02-seed-extension.json). Los tipos futuros (defensa, marcas, roles…) añadirán entradas en MOTOR-04/05/08.

export const ORDER_STATES = {
  solicitada: 'Solicitada',
  rechazada: 'Rechazada',
  pendiente: 'Pendiente',
  vigente: 'Vigente',
  suspendida: 'Suspendida por condición',
  consumida: 'Consumida',
  caducada: 'Caducada',
  sustituida: 'Sustituida',
  cancelada: 'Cancelada',
};

// Estados finales: la orden ya no evoluciona.
export const TERMINAL_STATES = new Set(['rechazada', 'consumida', 'caducada', 'sustituida', 'cancelada']);

export const ORDER_TYPES = {
  styles: {
    kind: 'plan', label: 'Estilos', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente elección pertinente aún no resuelta (inicio del periodo objetivo si se pide entre periodos)',
  },
  priorities: {
    kind: 'plan', label: 'Prioridades del libro', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente selección compatible aún no resuelta; no borra una ficha ya iniciada',
  },
  director: {
    kind: 'plan', label: 'Director y alternativas', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente asignación compatible; no cambia quién ejecutó un pase anterior',
  },
  disposition: {
    kind: 'plan', label: 'Disposición', scope: 'persistente hasta sustitución válida',
    boundary: 'próxima entrada de posesión o reorganización compatible; no recoloca a cinco jugadores en mitad de una ventaja',
  },
  roles: {
    kind: 'plan', label: 'Roles ofensivos', scope: 'persistente hasta sustitución válida',
    boundary: 'próxima asignación de funciones (entrada o reorganización); no cambia capacidades ni una ficha ya comprometida',
  },
  defOrg: {
    kind: 'plan', label: 'Organización defensiva', scope: 'persistente hasta sustitución válida',
    boundary: 'próxima asignación o reorganización pertinente (entrada de posesión); no recoloca a cinco jugadores en mitad de una ventaja',
  },
  defHeight: {
    kind: 'plan', label: 'Altura de presión', scope: 'persistente hasta sustitución válida',
    boundary: 'próximo avance de la posesión rival aún no resuelto',
  },
  defStyles: {
    kind: 'plan', label: 'Estilos defensivos', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente decisión defensiva aún no resuelta',
  },
  defCoverage: {
    kind: 'plan', label: 'Cobertura de bloqueos', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente interacción compatible; no cambia un cambio ya consumado',
  },
  defRoles: {
    kind: 'plan', label: 'Roles defensivos', scope: 'persistente hasta sustitución válida',
    boundary: 'próxima asignación de referencias (entrada o reorganización); no cambia capacidades',
  },
  defMarks: {
    kind: 'plan', label: 'Marcas', scope: 'persistente hasta sustitución válida',
    boundary: 'próxima asignación de referencias (entrada o reorganización)',
  },
  defSpecial: {
    kind: 'plan', label: 'Instrucción especial defensiva', scope: 'según la instrucción: persistente (ESPD02/03) o una posesión rival (ESPD01)',
    boundary: 'ESPD02/03: próxima asignación de referencias; ESPD01: próxima oportunidad pertinente de la posesión rival (no detiene el reloj)',
  },
  throwInBook: {
    kind: 'plan', label: 'Libro de saques (banda y fondo)', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente saque compatible aún no resuelto; no cambia un saque ya iniciado',
  },
  throwInServers: {
    kind: 'plan', label: 'Sacador preferido y alternativo', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente saque compatible; si el sacador ya no está en pista se revalida (alternativo o política funcional)',
  },
  defThrowIn: {
    kind: 'plan', label: 'Respuesta defensiva de saque', scope: 'persistente hasta sustitución válida',
    boundary: 'siguiente saque rival compatible aún no resuelto',
  },
  throwInCall: {
    kind: 'tcall', label: 'Llamada puntual de saque', scope: 'el siguiente saque compatible propio dentro del periodo actual (caduca al acabar el periodo)',
    boundary: 'inicio efectivo de la ficha; no lo consume un saque de otro origen incompatible',
  },
  delegate: {
    kind: 'plan', label: 'Devolver el quinteto al entrenador', scope: 'ámbito «quinteto»',
    boundary: 'siguiente decisión delegada de ese ámbito; no dispara cambios retroactivos',
  },
  call: {
    kind: 'call', label: 'Llamada de ficha', scope: 'una posesión ofensiva propia (la actual si aún hay selección de inicio, o la siguiente)',
    boundary: 'selección de inicio de la posesión objetivo; se consume cuando la ficha comienza',
  },
  substitution: {
    kind: 'lineup', label: 'Sustitución', scope: 'próxima oportunidad reglamentaria',
    boundary: 'ventana reglamentaria de sustitución',
  },
  lineup: {
    kind: 'lineup', label: 'Cambio de quinteto', scope: 'próxima oportunidad reglamentaria (conjunto atómico)',
    boundary: 'ventana reglamentaria de sustitución',
  },
  timeout: {
    kind: 'timeout', label: 'Tiempo muerto', scope: 'oportunidad de concesión reglamentaria',
    boundary: 'ventana de tiempo muerto del perfil FIBA',
  },
};

export const ENTRY_TYPES = new Set(['disposition', 'roles', 'defOrg', 'defRoles', 'defMarks']);
export const EDITABLE_STYLES = ['organizedPace', 'transition', 'elaboration', 'finishPreference', 'freedom', 'offensiveRisk', 'afterShot'];

// Qué puede observar la interfaz de cada estado (mensajes funcionales; no se muestran nombres de tablas ni fórmulas).
export const STATE_HELP = {
  pendiente: 'Válida, pero aún sin frontera de aplicación.',
  vigente: 'Forma parte del plan desde su frontera de activación.',
  consumida: 'Su objeto válido ya se produjo.',
  caducada: 'Terminó su ámbito sin poder iniciarse.',
  sustituida: 'Otra orden válida posterior la reemplazó.',
  cancelada: 'Se retiró antes de aplicarse.',
  rechazada: 'No era válida: el plan anterior se conserva.',
};
