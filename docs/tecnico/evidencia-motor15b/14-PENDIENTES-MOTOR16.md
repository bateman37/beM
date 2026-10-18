# 14 · Pendientes y entrada para MOTOR-16

La campaña de MOTOR-16 **no se ha ejecutado** ni se ha consumido su reserva de validación. Esto es solo la lista de entrada.

## Qué se audita y con qué referencia
- Versión/perfil/políticas: motor `beM-motor-0.15.1-MOTOR15B`, perfil `…+SEM-MOTOR15-20261017+SEM-MOTOR15B-20261017`, política `EST-MOTOR15B-R1 / ACTA-MOTOR15B-R1`. Referencia compatible: 83–98 con 6.684 sorteos (`tests/fixtures/baseline-motor15b.json`).
- Casos extremos existentes y sus entradas: C15-05 (copia extrema de fatiga, `scripts/m15-integration.js`), `PREP-RG-I03` (copia SEM que solo expone la oportunidad de RG-I03) y `PREP-INTERFERENCIA-EXTREMA`: se reutilizan, no se regeneran al azar.
- Universo de auditorías y cobertura por nivel: ver `09-AUDITORIAS.csv` (C15-normales, C15-extremo e histórico `LOT-9e1cfb78`) y `17-TRAZABILIDAD.csv`.
- Semillas de campaña y reserva: separadas del benchmark anterior (`PERF-M15-20261017`) y de las de MOTOR-13 (131001… exploración, 132001… validación); no se han tocado.

## Pregunta investigable sobre robos (frecuencia)
**¿Por qué el motor produce ≈1 robo por equipo y partido (1,205 en 100 encuentros; 11 % de las pérdidas) y cuánto de ello es baja frecuencia, defecto o capacidad no representada?**
- Rutas (nombres físicos, `15-ROBOS.csv`): A) interacción organizada `flow.resolveAttempt → actions.resolveTurnover`; B) avance presionado `defense-actions.pressedAdvance`; C) envío forzado de saque `throwin` + `resolveTurnover`; D) balón suelto `actions.resolveLooseBall`.
- Filas numéricas implicadas: `defenseRepertoire.choiceReferences.stealAttemptGivenAccessP0` = 0,25 (decisión de intervenir; consumida por `decideSteal` y por `pressedAdvance`); `outcomes.stealGivenTurnover` = 0,6 (control dado intento); `outcomes.turnoverOutOfBoundsIfNotSteal` = 0,3; `opportunity.*` y estilos `stealAttemptChoiceOddsRatio`; pesos de pérdida `outcomes.base.turnover` y `controlSensitivity`; `outcomes.base.looseBall`.
- Cobertura disponible: 6 encuentros diagnósticos con decisiones, pérdidas y recuperaciones por hecho (`15-ROBOS.csv`); **no** hay traza completa de los cien del benchmark (solo tablas y cinco registros esenciales de muestra). Una magnitud no registrada no es cero: `oportunidades elegibles/excluidas` no se registran por interacción.
- Separación: **baja frecuencia** (decisión de intervenir 0,25 y control 0,6 por pérdida con intento); **defecto corregido** (crédito omitido en el balón suelto ganado, `B04`); **capacidad no representada** (toque/desvío, primer defensor que desvía, balón retenido con flecha); pérdida viva recuperada sin crédito: el motor no conserva el toque, y acreditarla toda sería una decisión de producto, **no** un defecto demostrado.
- No hay que crear un recuperador ficticio ni decidir de nuevo la categoría técnica de RG-I03.

## Coste
- Restricción medida y no resuelta: 100 partidos en ≈27 s con 4 workers frente al objetivo de 5 s (referencia histórica de MOTOR-15; no repetida). El perfil de CPU es plano (síntesis en `07-RENDIMIENTO.csv`): separar evidencia de hipótesis; no se impone otra arquitectura.

## Referencias externas
- Por competición/temporada/fase/definición, sin medias inventadas ni mezcla de ligas: las fuentes FIBA devolvieron HTTP 403; ChatGPT aporta las síntesis. Ninguna referencia numérica verificada.

## Pendiente de aceptación
- Recorrido manual de Dennis (`docs/prompts/MOTOR-15B-recorrido-manual.md`), otros navegadores y Node 24.
