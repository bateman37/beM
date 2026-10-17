# Informe de auditoría · campaña inicial R1

Resultado `AUDR-7234df53` · auditorías `AUD-MOTOR13-R1` · 2026-10-17T09:38:54.226Z

> Diagnóstico del laboratorio. Esta lectura **no simula** nada: lee hechos ya conservados. Coherencia de muestreo ≠ realismo deportivo; «inconcluso» ≠ «aprobado».

## Alcance y muestra

- Fuentes: lote `LOT-83c0a1b9-R2`, lote `LOT-a2ff8507-R2`, lote `LOT-919a4056-R2`, lote `LOT-134c01c7-R2`, lote `LOT-97f9693a-R2`, lote `LOT-cf694c80-R2`, lote `LOT-d1f5b19f-R2`, lote `LOT-11765aae-R2`, lote `LOT-ddc621af-R2`, lote `LOT-66ec846f-R2`, lote `LOT-df162ff1-R2`, lote `LOT-42561646-R2`.
- Integridad verificada antes de interpretar: **sí** (SHA-256 de cada archivo de intento frente a indice.jsonl, 432 archivos).
- Partidos leídos: 24 (4 con diagnóstico completo, 20 reducidos).
- Coste de lectura medido en este entorno: 0 ms de proyección (24 intentos desde caché), 0.0 MiB leídos; no extrapolable.

## Resumen por auditoría

Conformes al control: 15 · defecto demostrado: 0 · señal para revisar: 0 · inconclusas: 16 · no evaluadas: 1. **No se declara «32 auditorías aprobadas»**: la mayoría son parciales o necesitan exposición/muestra.

| ID | Auditoría | Implementación | Registro | Exposición | Resultado | Hallazgos |
|---|---|---|---|---|---|---|
| AUD01 | Administración y acta | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD02 | Posesiones y continuidad | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD03 | Relojes y ventanas | parcial | suficiente | observada | **conforme** | 0 |
| AUD04 | Perfiles y datos | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD05 | Uso de las 32 capacidades | parcial | parcial | insuficiente | **inconcluso** | 1 |
| AUD06 | Selección frente a ejecución | parcial | parcial | observada | **inconcluso** | 0 |
| AUD07 | Libro y prioridades | parcial | suficiente | observada | **conforme** | 0 |
| AUD08 | Libertad y director | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD09 | Juego espontáneo | parcial | suficiente | insuficiente | **inconcluso** | 1 |
| AUD10 | Estilos ofensivos | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD11 | Organizaciones defensivas | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD12 | Presión y ayudas | parcial | parcial | observada | **inconcluso** | 0 |
| AUD13 | Oportunidad y oposición | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD14 | Finalización y preparación | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD15 | Rebote y balance | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD16 | Tiempo y exposición | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD17 | Curva de energía | ejecutable | suficiente | insuficiente | **inconcluso** | 0 |
| AUD18 | Rotación contextual | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD19 | Librillo de faltas | parcial | suficiente | observada | **conforme** | 0 |
| AUD20 | Forma y experiencia | parcial | suficiente | observada | **conforme** | 0 |
| AUD21 | Consistencia/momento individual | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD22 | Momento colectivo | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD23 | Presupuesto de estados | parcial | parcial | observada | **inconcluso** | 0 |
| AUD24 | Tiempos muertos | parcial | suficiente | observada | **inconcluso** | 0 |
| AUD25 | Memoria y repetición | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD26 | Saques y finales | ejecutable | suficiente | observada | **conforme** | 1 |
| AUD27 | Estadística y universos | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD28 | Visibilidad y dirección | ejecutable | suficiente | observada | **conforme** | 0 |
| AUD29 | Modos y continuación | parcial | no registrado | no aplicable | **no_evaluado** | 0 |
| AUD30 | Población y estilos | ejecutable | suficiente | observada | **inconcluso** | 0 |
| AUD31 | Partidos y colas | ejecutable | suficiente | observada | **inconcluso** | 0 |
| AUD32 | Conservación y coste | ejecutable | suficiente | observada | **conforme** | 0 |

## Hallazgos

- **H-AUD05-001** (cobertura, AUD05, causa: productor) — capacidades consumidas sin receta registrada con entradas: TEC17, TEC18, FIS06, MEN02, MEN03, MEN06, MEN07: se consumen (ver mecanismo) pero sus entradas no se registran como receta etiquetada; el contraste de cálculo fijo B no es aislable. Contar: {"observed":25,"expected":32}. Evidencia: 7 (ejemplos: [{"capability":"TEC17","mecanismo":"fuerza de rebote (profile.rebound.strength) vía reboundStrength → recipeObj sin etiqueta (actions.js)","dependencia":"registrar la receta de fuerza de rebote o extraer una función pura).
- **H-AUD09-001** (cobertura, AUD09, causa: auditor) — ESP sin exposición registrada: ESP06, ESP07, ESP09, ESP10, ESP11, ESP12, ESP13, ESP14, ESP15, ESP16, ESP17 no aparecen entre las etiquetas de las oportunidades de esta evidencia. Contar: {"observed":9,"expected":20}. Evidencia: 11 (ejemplos: [{"esp":"ESP06"},{"esp":"ESP07"}]).
- **H-AUD26-001** (cobertura, AUD26, causa: productor) — cadena de saque sin cierre al terminar el periodo: la cadena queda con estado «abierta» cuando suena la bocina: el productor no la cierra con causa «fin de periodo» (registro, no deporte). Contar: {"observed":8,"n":374}. Evidencia: 4 (ejemplos: [{"match_id":"M000001","attempt_id":"M000001-A1","abiertas":2},{"match_id":"M000002","attempt_id":"M000002-A1","abiertas":2}]).

## Capacidades

25 de 32 capacidades con uso en recetas registradas; el contraste de cálculo fijo usa hasta 24 contextos por capacidad (1482 filas +1/+3/+5). **Es una relación del cálculo en ese contexto, no un resultado que ocurrió ni puntos que habría añadido el jugador.**

## Primer ciclo de calibración

**Decisión: Base mantenida con evidencia y límites** (evaluación funcional SEM inicial (no validación externa)). Con 13 mecanismos suficientes se esperan ≈ 0.5915 con |z| ≥ 2 por azar (aproximación normal): la coherencia de muestreo no demuestra realismo y una señal aislada no justifica un cambio. Señales con |z| ≥ 2: COB01:seguimiento (z=2.1324, n=223). Violaciones deterministas p=0/p=1: 0. Mecanismos con muestra insuficiente: 25.

## Campaña R0 frente a R1

La campaña R0 (24 encuentros) dejó 8 encuentros con la conciliación analítica en fallo por un defecto de lector; tras corregirlo se repitió con las mismas entradas y semillas (R1): 24/24 trayectorias idénticas, 24/24 válidos.

## Referencias

Ninguna referencia externa numérica verificada: las fuentes FIBA candidatas (EuroBasket 2025 y Copa del Mundo 2023) devolvieron 403 y **no se extrajeron medias**. Lo que aquí se concluye es evaluación funcional SEM, no validación externa.

