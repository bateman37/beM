# Implementación de MOTOR-03 (panel administrable, perfiles y comparación)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Encargo: [`../prompts/MOTOR-03-panel-y-perfiles.md`](../prompts/MOTOR-03-panel-y-perfiles.md). Recorrido manual: [`../prompts/MOTOR-03-recorrido-manual.md`](../prompts/MOTOR-03-recorrido-manual.md).

Motor `beM-motor-0.3.0-MOTOR03` (la versión sube porque el perfil efectivo incorpora filas nuevas: los JSON de MOTOR-02 se informan como no reproducibles, como exige su contrato) · formato de partido `beM-match-export/2` (campos nuevos aditivos) · perfil base `SEM-MOTOR01-20261016+SEM-MOTOR02-20261016+SEM-MOTOR03-20261016` (SEM: provisional, no calibrado).

## Arranque

`npm run dev` → <http://localhost:5173/> (`PORT` configurable) → pestaña **Panel de ajustes** · `npm test` (53 pruebas) · `npm run data:check`.

## Arquitectura

| Ruta | Contenido |
|---|---|
| `src/profiles/rows.js` | **Diccionario (SUP01)**: familias de filas con ficha completa (etiqueta, descripción, efecto, grupo, mecanismo, clase, tipo/unidad, cobertura). `buildRows(perfil)` deriva ~390 filas del perfil efectivo real; `uncoveredLeaves` detecta hojas sin clasificar; `assertProfileComplete` lanza `ConfigError` si falta una fila requerida (sin valores por defecto ocultos). |
| `src/profiles/groups.js` | Catálogo 81 + SUP01–04 y las 16 vistas temáticas. |
| `src/profiles/validate.js` | **Validación (SUP04)**: dominio por tipo, sumas de grupo (tolerancia 1e-9, solo precisión numérica), relaciones, protección de reglamento/invariantes contra la base, campos desconocidos. Separa estructura, cobertura y evidencia. |
| `src/profiles/model.js` | Herencia (`resolveOverrides`), diferencias por ID semántico, edición conjunta todo-o-nada (asignar/sumar/multiplicar en la unidad visible) y propuesta explícita de normalización. |
| `src/profiles/library.js` | **Perfiles e historial (SUP02/03)**: versiones inmutables con padre exacto, borradores con revisión, validación ligada a la revisión, publicación, activación, descarte, importación/exportación, persistencia inyectable (localStorage), errores de guardado sin pérdida silenciosa. |
| `src/profiles/tracker.js` | Proxies de solo lectura sobre una copia del perfil: registran las filas **realmente leídas** por hecho (`evento.params` + `diagnostics.paramTable`). No consume azar. |
| `src/profiles/compare.js` | Comparación de dos encuentros completos, métricas con denominador, comprobaciones de coherencia, exportación JSON y resumen Markdown. |
| `src/profiles/preview.js`, `src/match/formulas.js` | Previsualizaciones deterministas que usan **las mismas funciones** que el partido (`shotProbability`, severidad, triangular…). |
| `src/profiles/questions.js` | Mesa de ajustes por pregunta (7 preguntas, filas e indicadores del acta). |
| `src/lab/panel/*` | Interfaz: inicio, mesa, tabla maestra, vistas, catálogo, perfiles, comparador, intercambio, ficha de fila con editores tipados. |
| `data/match/motor03-seed-extension.json` | Literales calibrables del código convertidos en filas con su valor exacto (SEM). |

## Una sola configuración efectiva

`MatchCore` valida la completitud y congela una copia profunda del perfil; esa copia (`profileData`) es la que se exporta y reproduce. Activar o editar otro perfil no afecta a un partido iniciado. El resultado lleva `identity.profileRef` (versión, nombre, huella).

### Literales convertidos en filas (valores idénticos)

`selection.finishingVocationMix` [0,35; 0,65], `selection.direct.defenderArrival` (+ peso mínimo 0,01), `selection.safeReceiverWeights`, `body.reboundReachReference` 0,5, `continuation.maxExtraPasses` 4. Además se conectaron filas que ya existían pero el motor no leía: `neutralAbility` (el literal 16), `abilityBounds` (1–30), `selection.candidateRead.opponentAbilityEstimate`, `participantSlots.*` (antes duplicadas en `PLAY_SPEC`) y `shots.freeThrow.points`. **Equivalencia comprobada**: mismo partido de referencia (semilla 20261016: 94–89, hash de la proyección deportiva idéntico al anterior a MOTOR-03; `tests/fixtures/baseline-motor02.json`).

### Excepciones explicadas (no son filas)

Ver `CODE_EXCEPTIONS` en `rows.js`: conversión de escala (x−1)/29, moneda justa del salto inicial, conversiones de reloj, guardas técnicas, estructura de recursos ESP13/ESP15 y parámetros de presentación (velocidades), que se listan como filas de solo consulta.

### Filas declaradas sin mecanismo (solo lectura, `sin_consumidor`)

22 filas: `roleEligibilityMinimumAbility`, `directWeightEffect`, `directAgeEffect`, `ordinaryMissContactsRing`, política de balón suelto, `rng.defaultSeed`, textos de `motor02`, **toda la tarea TAR04** (ninguna operación la consulta) y `shotPreparation.maxEnergyPenalty`. Un test comprueba que ninguna fila declarada «sin mecanismo» se lee y que las «consumidas» sí se leen (salvo las condicionales explicadas).

## Clases de dato

Balance (editable), contenido (editable solo en slots y un booleano ya ejecutables; `activeCatalog` solo lectura), reglamento e invariante (consulta; la validación rechaza cualquier cambio respecto a la base).

## Persistencia y límites

Perfiles, borradores e historial en `localStorage` (`beM.motor03.profiles.v1`, formato `beM-profiles/1`). Datos dañados: no se sustituyen; se ofrece descargar el texto original o descartarlos explícitamente. Sin PostgreSQL ni backend. Los dos partidos completos de una comparación solo viven en memoria hasta descargar el informe (el historial conserva el resumen).

## Intercambio

`beM-profile-export/1`: identidad, cobertura, procedencia, **padre exacto incluido**, sobreescrituras, conjunto efectivo y diccionario. La importación valida formato, versión de motor, huella, campos desconocidos, dominios e invariantes antes de crear una candidata (nunca activa ni sobrescribe); reconoce contenido idéntico sin duplicar.

## Limitaciones y decisiones propias a revisar

- La asignación fila→grupo del catálogo 81 + 4 y las entregas previstas son **propuesta de Claude** (indicativas).
- Comparación = un partido por perfil; sin estadística ni lotes (MOTOR-12).
- Los diagnósticos por hecho cuestan ~2,5× de tiempo (≈0,6 s por partido); se desactivan con `track:false`/`detail:'minimal'`.
- Recorrido de UI hecho con Chromium automatizado; revisión visual y funcional de Dennis pendiente. No ejecutado: Node 24, otros navegadores, contraste con el PDF FIBA.
- Edición por teclado/accesibilidad y diseño móvil no revisados.

## Cómo añadir una fila (continuidad obligatoria)

1. **Operación ya soportada** (un coeficiente nuevo en un mecanismo existente): añade el valor al perfil mediante una extensión SEM en `data/match/` (con `additions`), léelo en la operación **desde `this.profile`** (nunca un literal), y añade o amplía su familia en `src/profiles/rows.js` (etiqueta, descripción, efecto, grupo, mecanismo, tipo, clase). Los tests de inventario (`uncoveredLeaves`, consumo real) fallan si falta la ficha o si la fila no se lee.
2. **Mecanismo nuevo** (una operación o contenido que el motor no tiene): requiere implementar el mecanismo en su entrega; el panel no lo crea. No decide Claude funcionalmente si hace falta: se comunica `DECISIÓN REQUERIDA`.
3. Actualiza `groups.js` si cambia la cobertura de un grupo, `docs/tecnico/` y el changelog. No se añade otro editor paralelo ni constantes de balance escondidas.
