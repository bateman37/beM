# MOTOR-18 — Familiaridad táctica, roles, posiciones y aprendizaje

> [Prompt archivado](../prompts/MOTOR-18-familiaridad-tactica-roles-posiciones.md) · [Recorrido manual](../prompts/MOTOR-18-recorrido-manual.md) · [Estado](../estado.md) · evidencia compacta en [`evidencia-motor18/`](evidencia-motor18/)

**Veredicto honesto.** Se añade una capa pequeña de conocimiento adquirido sobre el motor por acontecimientos de MOTOR-17B: ningún coeficiente previo cambia, no hay coordenadas ni movimientos nuevos y no se añade azar. Las cifras son **SEM18: semillas provisionales de producto**, sin calibración ni aceptación deportiva.

## 1. Base y control

MOTOR-17B (PR #18) estaba fusionada en `main` (`5a1a0ef`); la rama `claude/busy-edison-b1fmnc` se reinició desde `main`. **CONTROL17B** = worktree inmutable de `f67113e81353da4d464e8bc62544d28b2dbcb8fa` (código revisado de MOTOR-17B). Commits separados: auditoría, conocimiento/aprendizaje, integración y laboratorio, evidencia y documentación.

## 2. Problema y comportamiento

Un equipo que apenas conoce una zona puede usarla, pero su coordinación tiene una desventaja **limitada** frente a quien la domina (capacidades, contexto y rival constantes). Cada jugador conserva 62 niveles (5 posiciones, 15 roles ofensivos, 12 defensivos, 30 módulos) con `level`, `peak` y `lastPracticeDay`. La familiaridad del quinteto se **deriva** de sus jugadores (no hay maestría colectiva guardada). Las 32 capacidades siguen siendo 32; Polivalencia (`development.tacticalLearning`) y la enseñanza del entrenador (`coachLearning`) solo actúan **entre partidos**.

## 3. Puntos exactos de aplicación (y cómo se evita duplicar)

| Punto | Dónde | Cómo |
|---|---|---|
| A · calidad de la oportunidad | `qualityOf` (`src/match/actions.js`) | `extraZ = formaPresión + familiaridad`, antes de la perturbación de momento; ambos se registran separados (`entradas.extraZFormaPresion`, `extraZFamiliaridad`). |
| B · avance ante presión adelantada | `pressedAdvance` (`src/match/defense-actions.js`) | `z = zBase + familiaridad`, sin decisión ni sorteo nuevos; categorías y normalización intactas. |

`delta = maxDefensa·U_D − maxAtaque·U_A` con `U = 1 − D` (semilla 0,30 logit por lado y por punto de aplicación). **Una vez por operación.** No se vuelve a cobrar en conversión, libres, tapón, rebote, crédito de robo, energía ni forma; una calidad heredada (recepción de saque ya resuelta) o determinista (sistema negado) registra «no aplica» (`famNotApplicable`). Pesos del actor: posición asignada realmente (`slotOf`) 0,20 · rol vigente del lado 0,30 · módulos 0,50, **omitiendo** los componentes que no aplican y normalizando el resto. Tablas de módulos por contexto (organizado, transición, salida de presión, saque, espontánea) en `familiarity.tacticContextWeights`. Con la capa desactivada, sin bloque explícito o todo a 30 el ajuste es exactamente 0.
Las estimaciones (media distancia, calidad percibida) usan la misma función pura (`famQualityEstimate`) sin exposición ni azar. Código: `src/match/familiarity.js` (contexto y exposición) y `src/match/formulas.js` (`familiarityActor/Side/Delta`, puras y compartidas con el auditor).

## 4. Datos, contratos y compatibilidad

- Extensión `SEM-MOTOR18-20261021` (`data/match/motor18-seed-extension.json`, árbol `familiarity`) con 92 filas administrables (`familiarity.*`, grupo «Familiaridad y aprendizaje» FAM01), validación y `data:check`; el catálogo de 30 módulos, las correspondencias de continuación y las relaciones de transferencia son contenido declarativo validado.
- Versiones: aplicación `MOTOR-18`; motor `beM-motor-0.18.0-MOTOR18`; entrada `beM-match-input/7`; export `beM-match-export/10`; esencial `ESE-MOTOR18-R1`; `KNOW-MOTOR18-R1`, `LEARN-MOTOR18-R1`, `FAM-MOTOR18-R1`. Un export/9 y una entrada /6 se **leen** (neutros); un export/9 o un guardado de otro motor se rechazan para reproducir/continuar con motivo.
- Una ficha antigua sin historia es `legacy-neutral` (efecto 0, «sin historial de aprendizaje; compatibilidad neutra»). Un bloque `explicit` incompleto da error localizado; nunca se rellena con 30. Un perfil sin `familiarity` desactiva la capa y rechaza conocimiento explícito con motivo; no se activa nada en silencio.
- Guardado/continuación: los acumuladores de exposición viven en el estado vivo y no se duplican al restaurar.

## 5. Exposición y aprendizaje

El motor solo acumula exposición (`famExposure`, `Encounter.exposure()`): décimas vivas por posición y rol vigente (se dividen al cambiar el rol), y crédito por jugador–módulo–operación repartido por los pesos normalizados. Las funciones puras de `src/knowledge` y `src/learning` (fórmulas de §8.4, reaprendizaje por tramos en forma cerrada, retención en bloque, presupuestos diarios, propuestas idempotentes con deshacer) devuelven estado nuevo y recibo; el laboratorio decide aplicarlas. La tabla L18-01…14 está en [`evidencia-motor18/l18/`](evidencia-motor18/l18/l18.md). Con K=peak=30 y 3650 días sin práctica, la posición queda en **26,4**.

## 6. Auditoría (correcciones y lectura nueva)

- **R17B-SENS-01:** el contraste recalcula todas las entradas de la operación alimentadas por la misma capacidad y jugador (proyección `PRJ-MOTOR18-R2`). Contraejemplo FIS07: 0,4144 → parcial 0,4166 → completo 0,4219 (tolerancia 1e-8). En los doce diagnósticos de M17B cambian 18 filas, en exactamente los seis contextos del encargo; el resto de filas conserva su salida. Resultado nuevo con otra identidad; los antiguos 768 no se reescriben.
- **AUD11:** clasifica alternativa reglada acreditada, orden aplicada, sin explicación y no clasificable; las 72 discrepancias de M17B (todas B04) quedan como alternativa acreditada; el esencial tiene 75 registros porque 3 tiros no son válidos (fuera del universo). La defensa no se toca.
- **Sensibilidad de conocimiento** (aparte de AUD05, que sigue en 32): +1/+3/+5 de un nivel con capacidades fijas, en calidad y avance presionado; controles de exposición.

## 7. Campaña MOTOR18-CIERRE-20261021 (36 ejecuciones)

12 (seis pares CONTROL17B/M18) + 16 (B01–B08 × K8/K28) + 6 diagnósticos + 2 (D01, D02): no son 36 observaciones independientes. Datos reales y estado de cada comprobación: [`evidencia-motor18/RESUMEN-OPERATIVO.md`](evidencia-motor18/RESUMEN-OPERATIVO.md) (generado desde los archivos finales) y `out/motor18/` (fuera de Git).

## 8. Decisiones técnicas y límites

- Contexto «espontánea» reutiliza los pesos del organizado (semilla editable); en transición la organización defensiva no aplica; participantes `legacy-neutral` se excluyen de la media del lado.
- Exposición de rol: décimas de juego vivo en el rol ofensivo y defensivo vigentes, sin separar posesión.
- La exposición de B02 (`FAM:pick_and_roll`) es baja: el efecto observable de un contraste de pocas operaciones no se interpreta.
- Coste: sobrecoste medido ≈ 0–3 % en seis partidos (muestra pequeña; no se extrapola); el objetivo de cien partidos en cinco segundos sigue abierto y no se mide.
- No se cierra la aceptación manual, calibración, conformidad FIBA ni rendimiento del mundo. El auditor no tiene lectura de conocimiento para evidencia anterior (perfil sin `familiarity`).
