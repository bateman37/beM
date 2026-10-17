# MOTOR-15 — Cierre funcional, compatibilidad y rendimiento del mundo

> [Prompt archivado](../prompts/MOTOR-15-cierre-funcional-y-rendimiento-del-mundo.md) · [Recorrido manual](../prompts/MOTOR-15-recorrido-manual.md) · [Estado](../estado.md) · evidencia en [`evidencia-motor15/`](evidencia-motor15/00-LEEME.md) ([resumen](evidencia-motor15/01-RESUMEN.md) · [diccionario](evidencia-motor15/DICCIONARIO.md)) · bloque C: [esencial y workers](motor15-c-esencial-y-workers.md) · [matriz de consultas](motor15-c-matriz-consultas.md)

**Veredicto honesto:** funcionalmente completo en el alcance del encargo, con los límites de §9; **objetivo de coste NO alcanzado** (100 partidos en ≈27 s con 4 workers frente a 5 s); calibración deportiva **no realizada**; pruebas de Dennis **pendientes**.

## 1. Base

Rama `claude/busy-edison-b1fmnc`, partida del commit de MOTOR-14 `bb192b3` (su PR no se fusionó). Nada se fusionó ni se publicó.

## 2. Bloque A — error «reading 'policies'» del panel

- **Causa:** `src/profiles/rows-motor08.js` leía `profile.coach.policies`; los perfiles anteriores a MOTOR-08 no tienen `coach`, y `buildRows` lanzaba una excepción que el panel mostraba como «No se pudo preparar el panel».
- **Corrección en la frontera**, no por perfil: `rows.js` (`text()` con valor alternativo) y `src/profiles/compat.js` (evaluación `assessProfile`: módulos presentes, «no compatibles» ≠ cero, contexto degradado).
- **Recuperación explícita** (`src/lab/panel/compat-ui.js`): tarjeta con identidad y módulos; «Crear candidata compatible desde la base actual» (borrador), «Activar la base actual» (confirmación) y «Consultar la base actual». **Nada se convierte ni se activa en silencio**; el perfil original no se toca.
- Verificación: `tests/motor15.test.js` M15·1 y `node scripts/browser/panel-recovery.mjs <biblioteca>`.

## 3. Bloque B — cierre deportivo y funcional

| Tema | Implementación |
|---|---|
| Categorías técnicas y contadores | `src/match/incidents.js`, `incident-admin.js`: técnicas/antideportivas/descalificantes por entrada tipada (`logCommand`, reproducible); contadores por persona. |
| Art. 43 | `combineSanctions`: equivalencia = mismos libres + mismo derecho de posesión; la técnica primero; se conserva el último derecho. Cola común de sanciones. |
| Art. 45 | `corrections.js`, `correction-admin.js`: ventanas derivadas de `stopLog`/reanudaciones/canasta/control; las estadísticas originales se conservan en `corrected.before`; las series anuladas por corrección se marcan `cancelled` en el acta. Numeración 45.4.x: rango con ramas nombradas (sin lectura directa de cada número). |
| Tiro pendiente | Liberación y resolución separadas (SEM15-TIR-01 = 0,35 s → 4 décimas); el retraso solo alarga la duración cuando el reloj de juego manda y se recorta al reloj restante. |
| Interferencia condicionada | SEM15-INT-01..04: un sorteo por oportunidad elegible; sin sorteo si la masa es 0. Resultado: `u < defensiva` → defensiva, `< defensiva+ofensiva` → ofensiva, si no, ninguna. **Consecuencias = lectura de Claude (provisional)**; la sanción adicional del último libre queda pendiente. |
| Asistencias | Productor causal; la desviación hacia otro destinatario **no se genera** (previsto = efectivo); solo se invalida ante un hecho tipado. |
| Estado propio por tramo | Muestras al inicio y fin de cada periodo, sin interpolar; solo audiencia propia/diagnóstica. |
| REC10-01/02 | Recomendación o insuficiencia (lo observado frente a lo exigido), distintas entre sí. |
| MOTOR-14 | Integración con guardar/continuar, inferioridad natural y equivalencia (casos C15-01..06). |

**Versionado:** cambio deportivo **versionado**: extensión `SEM-MOTOR15-20261017`, motor `beM-motor-0.15.0-MOTOR15`, política `EST-MOTOR15-R1 / ACTA-MOTOR15-R1`, `export/9`. Con las semillas SEM15 a cero se reproduce exactamente la trayectoria de MOTOR-14 (83–103, 6 505 sorteos). Con ellas activas la referencia pasa a **83–98, 6 684 sorteos** (`tests/fixtures/baseline-motor15.json`). Las semillas **no están calibradas**.

## 4. Bloque C — nivel `world-essential` y workers

- `src/batch/essential.js`: nivel de registro esencial con el mismo resolutor (misma trayectoria; menos registro). Incluye `states.samples` y bloque `regulation`.
- `WorkerPool` persistente (1/2/4/automático), aislamiento por partido, un único escritor del índice (coordinador), detener (no despacha nuevos y espera a los activos) / continuar pendientes / reintentar. Huella de trayectoria incremental `TRAYINC-MOTOR15-R1`, **no intercambiable** con `TRAY-MOTOR12-R1`.
- Detalle y medidas: [motor15-c-esencial-y-workers.md](motor15-c-esencial-y-workers.md).

## 5. Bloque D — medición y cierre

- **Benchmark real de cien** (`scripts/bench-world.js`): 100/100 válidos, 4 workers. Se hicieron **cuatro ejecuciones reales de cien** (intento 1 con un fallo conservado; repetición válida 100/100; dos repeticiones finales con el código definitivo, 26,0 s y 27,2 s de pared, mismo digest de resultados); la primera (1 fallo, `defenseReboundParticipants`, C000063) se conserva en `out/motor15/bench100-intento1-con-defecto.json` y se corrigió (H02).
- **Coste:** ≈27 s por cien (≈5,4× el objetivo de 5 s). 200 partidos ≈54 s por **estimación lineal, no ejecutada**. Perfil de CPU plano: no hay un punto caliente que corregir sin tocar el deporte.
- **Equivalencia** (`scripts/equivalence.js`, `scripts/build-query-matrix.js`): comparaciones de nivel, concurrencia y modalidad.
- **Casos de integración** `scripts/m15-integration.js` C15-01..06.
- **Auditoría** `scripts/m15-audit.js`: AUD01–32 sobre seis encuentros diagnósticos (definición ≠ resultado); varias quedan *inconclusas* por exposición insuficiente, sin ajustar probabilidades.
- **Paquetes** (`scripts/m15-package.js`, `m15-package-check.js`): `MOTOR-15-revision-rapida.zip` (archivos 00–14 + manifiesto) y `MOTOR-15-evidencia-detallada.zip`. Viven en `out/motor15/`, fuera de Git. Esquema `beM-m15-quick-review/1`.
- **Navegador:** recorrido real de Chromium (Playwright 1.56.1) de 10 pasos, consola 0 / red 0 errores: [13-NAVEGADOR.md](evidencia-motor15/13-NAVEGADOR.md).
- **Pestaña «Cierre»** (`src/lab/closure-ui.js`, `src/batch/closure-api.js`): estado por eje, versiones, coste y descargas.

## 6. Compatibilidad

| Operación | Compatible con |
|---|---|
| Leer históricos | `export/8` y anteriores legibles; `export/9` nuevo |
| Perfiles anteriores | Abren con tarjeta de compatibilidad; no se convierten solos |
| Guardados | `beM-match-snapshot/1` del mismo motor; los de MOTOR-14 se rechazan con motivo (motor distinto), sin tocarlos |
| Huellas de trayectoria | `TRAY-MOTOR12-R1` y `TRAYINC-MOTOR15-R1` no se mezclan |

## 7. Pruebas

`tests/motor15.test.js` (M15·1–9) y `tests/motor15-c.test.js`; pruebas anteriores con fijaciones actualizadas explícitamente (versiones y línea base). Informes de comandos en `out/motor15/informes/` (no versionado); resumen en [evidencia](evidencia-motor15/00-LEEME.md).

## 8. Documentación normativa

Fuentes FIBA no legibles (HTTP 403); se trabajó con los extractos suministrados (N15). Notas MOTOR-15 en `docs/motor/` (sin decidir reglas nuevas).

## 9. Límites declarados

- Objetivo de coste no alcanzado.
- Semillas SEM15 sin calibrar; no hay evaluación estadística poblacional (MOTOR-16/17).
- Consecuencias de interferencia provisionales; sanción adicional del último libre pendiente.
- Numeración 45.4.x sin lectura directa.
- Sin generación natural de técnicas/antideportivas; sin desvío de asistencia.
- Recorrido de Dennis, otros navegadores y Node 24: **no ejecutados**.

## 10. Preparación de MOTOR-16

[14-PENDIENTES-MOTOR16.md](evidencia-motor15/14-PENDIENTES-MOTOR16.md). La campaña de MOTOR-16 **no se ejecutó**.
