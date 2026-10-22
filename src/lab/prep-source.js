// Entrada que EDITA Preparación y entrada que congela el próximo partido (MOTOR-18B, R01). Lógica pura (sin DOM ni almacenamiento) para que una prueba compruebe que ambas son la MISMA entrada.
// Regla cerrada: cuando la copia de APRENDIZAJE es la entrada activa del próximo partido, Preparación edita esa copia. El indicador `learning` vive en `store.scenario.scenario`.
// Las referencias, los planes naturales/históricos y la entrada editada de Dennis permanecen intactos; las copias de contraste distintas del aprendizaje conservan su significado (se editan en `store.edit`).
export const isLearningScenarioOf = (store) => !!store?.scenario?.scenario?.learning && !!store.scenario.input;
export const prepInputOf = (store) => (isLearningScenarioOf(store) ? store.scenario.input : store.edit);
export const matchSourceOf = (store) => store.scenario?.input ?? store.edit;
