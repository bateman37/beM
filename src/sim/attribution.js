// Atribución de un hecho de finalización a una familia/ficha (SIM-MOTOR-04D §4.1). Lectura, no deporte: no cambia participantes, decisiones, probabilidades ni sorteos.
// La continuación inmediata tras un rebote ofensivo (`src: 'putback'`) aproxima el tiro con una celda del plan que conserva `playId` como PROCEDENCIA INTERNA de cálculo; no es una ejecución nueva de esa ficha, así que
// el contexto deportivo real prevalece: se publica como familia `putback` y no como ficha POS. El reinicio organizado (`src` = familia de la ficha, `ctx: 'organized'`) sí ejecuta una ficha nueva y conserva su ficha.
export const isPutbackFact = (e) => e.src === 'putback' || e.ctx === 'putback';
// Ficha a la que se atribuye el hecho en las tablas de familias y de participación (null si no es una ejecución de ficha).
export const attributedPlay = (e) => (isPutbackFact(e) ? null : (e.play ?? null));
// Clave de familia/ficha del hecho (`putback` frente a POS, transición, espontáneo o bonus sin familia).
export const familyKeyOf = (e) => (isPutbackFact(e) ? 'putback' : (e.play ?? e.src ?? 'bonus_sin_familia'));
