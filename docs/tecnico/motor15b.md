# MOTOR-15B — Cierre de MOTOR-15 y diagnóstico técnico de robos

> [Prompt archivado](../prompts/MOTOR-15B-cierre-y-diagnostico-de-robos.md) · [Recorrido manual](../prompts/MOTOR-15B-recorrido-manual.md) · [Estado](../estado.md) · evidencia en [`evidencia-motor15b/`](evidencia-motor15b/00-LEEME.md) · [diccionario](evidencia-motor15b/DICCIONARIO.md) · entrega anterior: [MOTOR-15](motor15.md)

**Veredicto honesto.** Corrección acotada sobre MOTOR-15, no una nueva fase del motor ni la campaña masiva. C1–C4 y R están cerrados **en su alcance** con los límites de §11. Se corrigió un **defecto de crédito de robo demostrado** y un **defecto latente del relevo obligatorio**; **ningún coeficiente deportivo cambió**. Objetivo de coste de 5 s **pendiente**; calibración **pendiente** (MOTOR-16/17); recorrido de Dennis **pendiente**. No se afirma motor completo ni calibrado ni 32 auditorías aprobadas.

## 1. Base y Git

MOTOR-15 seguía abierto en la PR [`bateman37/beM#16`](https://github.com/bateman37/beM/pull/16) (rama `claude/busy-edison-b1fmnc`, último commit `5aefaab`); MOTOR-15B continúa sobre esa misma rama y se añade a la misma PR. Los paquetes y reportes de MOTOR-15 (`out/motor15/…`) se conservan sin tocar. **Commit de código comprobado: `6a6814c`** (suite, `data:check`, equivalencia, integración, auditorías y navegador sobre ese código). **Commit de entrega:** el último de la rama; añade solo documentación y evidencia pequeña (`git diff 6a6814c..HEAD --stat`).

## 2. Resumen por bloque

| Bloque | Estado | Límite concreto restante |
|---|---|---|
| C1 normativa | completo | RG-I01, I02 e I04 provisionales; sin lectura directa de los PDF |
| C2 auditorías | completo en el alcance | C15-06 (guion de órdenes) no se audita en lote; AUD05/AUD09 siguen con exposición insuficiente |
| C3 equivalencia | completo en el alcance | SAVE-PERIODO no cubre una serie pendiente (se declara) |
| C4 documentación y commit | completo | — |
| R robos | defecto de crédito corregido; frecuencia pendiente | el motor no conserva el toque defensivo |

## 3. C1 — Normativa (`src/match/actions.js`, `incident-admin.js`, `SEM-MOTOR15B-20261017`)

**Procedencia.** Síntesis selectiva de ChatGPT (17/10/2026) sobre FIBA 2026 v1.1, 31.3.3 y 36.2/36.3 (B15-N1); Claude **no** leyó el PDF (HTTP 403). No se afirma conformidad exhaustiva.

**RG-I03.** Interferencia defensiva en el último libre: concede un punto (acreditado una sola vez por el libre original) y carga al defensor infractor una **técnica de categoría 2** con un libre adicional; falta individual y colectiva; no suma para la descalificación por técnicas de categoría 1. Implementación (`P.interferenceTechnical`): la decisión de interferencia **no se vuelve a sortear**; la técnica reutiliza `resolveFoul` (fila RG-F07), contadores (`technicalCat2`), exclusión por faltas y la cola/serie existentes (`adminPlan`); el libre adicional lo lanza `designatedShooter` (política existente: mejor lanzador de libres en pista) como tiro real con crédito y posibilidad de fallo; **una única reanudación** (`afterLastFreeThrow`: saque de fondo del rival, sin rebote ni posesión por la técnica); el plan vive en el estado y se guarda y continúa entre consecuencias sin repetir punto, sanción ni intento. La retirada obligatoria (5.ª falta) abre la ventana de relevo antes del libre adicional. El estado «sanción adicional pendiente» desaparece de la versión nueva; los hechos y reportes de MOTOR-15 que lo declaraban pendiente son históricos.

**Clasificación del cambio:** corrección normativa que **puede cambiar la trayectoria** cuando aparece el supuesto (no es neutral aunque sea raro). La referencia `20261016` no lo contiene: 83–98 con 6.684 sorteos, sin cambio. Se expone con un **caso preparado** (copia SEM de laboratorio con SEM15-INT-03 = 0,35 y el resto de la interferencia a 0; **no mide frecuencia**): botón «Interferencia defensiva en el último libre» en *Partido › casos preparados* y `PREP-RG-I03` en `scripts/m15-integration.js`.

**Art. 45.** Las nueve operaciones se enlazan a 45.4.1 libres indebidos · 45.4.2 libres debidos omitidos · 45.4.3 lanzador incorrecto permitido · 45.4.4 lanzador incorrecto dirigido · 45.4.5 puntos concedidos/anulados · 45.4.6 infractor incorrecto · 45.4.7 errores de mesa · 45.4.8 reloj de juego · 45.6 reloj de posesión. Ventanas y ramas del contrato MOTOR-15 sin cambio; documental (no consume azar). Ninguna rama contradice el contrato suministrado.

**Datos.** `data/match/motor15b-seed-extension.json` (`SEM-MOTOR15B-20261017`): reemplaza RG-I03, RG-R01, `regulation.corrections` (`COR-MOTOR15B-R1`), `regulation.version` (`REG-MOTOR15B-R1`) y la política de crédito; añade la fuente `M15B-01`. `checkMotor15b` (`scripts/check-data.js`) exige que el perfil difiera del de MOTOR-15 **solo** en `regulation` y `statsPolicy`.

## 4. C2 — Procedencia de auditorías y energía crítica

- **Defecto de procedencia.** `auditoria/resultado.json` de MOTOR-15 analizaba el lote `LOT-9e1cfb78` (seis encuentros de `scripts/m15-audit.js`), **no los C15**. Se conserva con su alcance verdadero («histórico LOT-9e1cfb78») y el informe de auditoría incluye ahora el **universo efectivo** (fuente, encuentro, caso, marcador, huella) también en la vista Auditorías.
- **Reproducción de los C15.** `scripts/m15b-audit.js` reprodujo C15-01…05 con sus entradas y semillas congeladas (nueva opción `caseSeeds` del lote): mismo marcador y mismos sorteos que MOTOR-15 en 5/5 y huella TRAY idéntica a la de la reejecución de los C15 con MOTOR-15B en 5/5 (la huella de MOTOR-15 difiere solo por el crédito de robo; se identifica como **reproducción**, no inspección del original). C15-01 usa el plan del escenario del perfil; C15-05 la copia de fatiga. C15-06 no se reproduce: su guion de órdenes no cabe en un lote.
- **AUD17.** Lector nuevo por (ámbito, tarea, banda) con la energía **registrada** en cada término de receta (no el estado final), numerador/denominador/mínimo/ejemplos por celda y muestra suficiente = `reliabilityWarn.minDecisions`. Normales (C15-01…04): `inconcluso/insuficiente` (energía mínima ≈ 45). Extremo (C15-05, evaluado **aparte**): `conforme/observada` con 24.382 términos de energía < 10 y mínimo 0 — conforme respecto a la **monotonía del mecanismo**; un contraste extremo no estima frecuencias normales. Histórico: `inconcluso/insuficiente`.
- **AUD26.** Cada cadena se clasifica con la última transición de su posesión. Histórico (522 cadenas): 511 ejecutadas, 8 interrumpidas por final de periodo, 1 sin entrega válida (falta en el saque con las tres opciones negadas: **comportamiento válido, sin inventar receptor**) y 2 sin cierre tras una pérdida del avance presionado (**defecto de registro del productor**, ya corregido: `chainHook` cierra con causa legible y marca `interrumpida` el final de periodo). Las interrumpidas salen del universo de las tasas.
- **Estados.** Sin 32 conformes en ningún universo: normales 16 conformes/16 inconclusos, extremo 17/15, histórico 16/16 (AUD05/AUD09 siguen sin exposición suficiente).

## 5. C3 — Equivalencia y alcance de la evidencia

- Informe sellado nuevo (`EQV-…` con el motor 0.15.1): 8 comparaciones, `comparisonProjection` (hechos con participantes y relojes, marcador, caja, acta y créditos, posesiones, órdenes, estados, sorteos con ordinal y propósito, alineaciones, energía y faltas finales).
- **Carencia real cubierta** (`tests/motor15b.test.js` B4): M15C·1 comparaba trayectoria, sorteos y marcador; ahora completo = reducido = **registro esencial real** también en acta/créditos, estados por tramo, órdenes efectivas e incidencias, con el observador común `TRAYINC-MOTOR15-R1`. Las huellas de contratos distintos (`TRAY-MOTOR12-R1` y `TRAYINC-MOTOR15-R1`) **no** se comparan entre sí.
- `08-EQUIVALENCIA.csv` declara por fila entradas, versión, órdenes, niveles, campos, observador, evidencia y primera diferencia, y separa igualdad misma versión, igualdad entre versiones, **diferencia legítima MOTOR-15 → MOTOR-15B (solo crédito)** y no comparable. Caída de worker, detener el despacho y recargar el navegador son comprobaciones distintas (M15C·3, M15C·4, navegador).
- **Defecto de la evidencia de MOTOR-15.** El generador de `C15-06` leía `.result` en lugar de `.res` (`runScripted`): el guion no se aplicó (las 30 órdenes eran del entrenador automático). Corregido; el C15-06 reejecutado (68–79) es evidencia **nueva** y no comparable con el original (55–79).

## 6. R — Robos: mapa, parámetros, diagnóstico y correcciones

**Mapa de rutas** (nombres físicos):

| Ruta | Acceso/oportunidad | Decisión de intervenir | Resolución y pérdida | Recuperación y crédito |
|---|---|---|---|---|
| A · interacción organizada | `ex.icpt` (pase o bote con interceptor) en `flow.resolveAttempt` | `defense-actions.decideSteal` → `stealAttemptGivenAccessP0` (0,25) × estilo de robo × lectura defensiva | categoría `turnover` (peso con defensa solo si hay intento) → `actions.resolveTurnover` | `stealGivenTurnover` (0,6) con intento ⇒ **robo al interceptor**; si no, fuera (0,3) o pérdida viva con `recupera` sin crédito |
| B · avance presionado | presionador `nearestDefender` | decisión propia `avance:intento_de_robo` (misma referencia 0,25; sin lectura ni protección de faltas) | resultado `turnover` de `pressedAdvance` | igual que A (0,6 con intento) |
| C · envío forzado de saque | las tres opciones negadas | `decideSteal` tras negar | categoría con `looseBall`/`foul`/`turnover` | misma `resolveTurnover` |
| D · balón suelto | `ex.defend`/`ex.icpt` en la disputa | **ninguna** | `actions.resolveLooseBall`: disputa real TAR17 | si gana la defensa: pérdida del atacante + **recuperación real** |

`stealAttemptGivenAccessP0` sigue siendo consumido por `decideSteal` y `pressedAdvance` (la advertencia histórica de MOTOR-05 no se usó como prueba). Una magnitud no registrada no es cero: oportunidades elegibles/excluidas **no** se registran por interacción (nulo).

**Diagnóstico (6 encuentros C15, antes → después).** Antes: 12 robos y 111 pérdidas en seis encuentros; **10 disputas de balón suelto ganadas por la defensa con pérdida atacante y sin robo**. Defecto demostrado **D-ROBO-01**: *crédito omitido frente a hechos suficientes* — hay pérdida individual rival y recuperación real de un balón vivo por un defensor ya resuelto (síntesis B15-N2: recuperación de balón suelto tras error atacante, incluso sin intento previo). Corrección: `resolveLooseBall` acredita `stl` al recuperador (`fuente: 'balón suelto ganado en disputa'`). Efecto en cinco encuentros comparables: **9 → 16 robos (0,9 → 1,6 por equipo y partido; muestra diagnóstica, no frecuencia)**; 7 créditos añadidos.

**Es solo estadístico:** `scripts/m15b-robos.js` retira el crédito añadido y compara cada hecho con el de MOTOR-15: **idénticos** (hechos, sorteos, marcador y parciales) en 5/5 casos; la huella de trayectoria cambia **solo** por el crédito (`12919e2a…` → `c7a90892…` en C15-01). Política con versión propia (`EST-MOTOR15B-R1 / ACTA-MOTOR15B-R1`): los partidos anteriores no se reinterpretan. La transición, el origen de la posesión siguiente y los episodios de momento no cambian.

**Coeficientes conservados** (`stealAttemptGivenAccessP0`, `stealGivenTurnover`, `turnoverOutOfBoundsIfNotSteal`, pesos de pérdida, estilos, `base.looseBall`): ninguno se tocó (`checkMotor15b` lo exige).

**Observado y no corregido.**
- **D-ROBO-02:** en 40 hechos de los 6 casos hay dos decisiones `defensa:robo`: la primera pertenece a una ficha abandonada por «sistema negado» y la segunda al recurso sencillo que sí se resuelve (dos interacciones sucesivas); no hay consumidor de la primera sobre el crédito. Se documenta y el denominador correcto cuenta una decisión por interacción resuelta.
- **Límite:** el motor no conserva el toque ni el primer defensor que desvía; una pérdida viva recuperada sin intervención resuelta (49 de 78 pérdidas con desenlace en cinco encuentros de MOTOR-15: C15-01…04 y 06) **no** se acredita: acreditarla toda sería una decisión de producto (MOTOR-16/17), no un defecto demostrado. No se crea un recuperador ficticio ni se modela balón retenido con flecha (rama no representada).
- La decisión de intervenir en el avance presionado no aplica la lectura defensiva ni la protección de faltas de `decideSteal`: pregunta de diseño registrada para MOTOR-16.

**Comprobación** (`tests/motor15b.test.js` B6, parametrizada sobre cuatro encuentros): un crédito por hecho con pérdida individual rival, balón suelto ganado → robo al recuperador, ataque que conserva → sin robo, balón fuera/infracción/falta → sin robo, acta reconstruida = acta conservada (sin duplicados), continuar desde un guardado = mismos créditos, reproducción idéntica.

## 7. Otros defectos hallados (registrados)

- **Relevo obligatorio antes del tiempo muerto** (`flow.processWindow`): con `check`, 4 de 60 semillas de MOTOR-15 (38, 42, 43, 44) rompían el invariante «jugador en pista no disponible» porque el tiempo muerto del entrenador se concedía antes del relevo por faltas. Ahora el relevo obligatorio va primero (0/60); la trayectoria de la referencia no cambia. Test B5.
- **`bytes` en la integración de MOTOR-15** eran la longitud del texto (18 archivos): corregido el generador (`Buffer.byteLength`); los hashes no se tocan; la integración de 15B los mide en UTF-8 (0 discrepancias).

## 8. Rendimiento (histórico conservado)

Sin cambio del resolutor: **no se repitió el benchmark de cien**. Referencia histórica de MOTOR-15: ejecución 27.171,3 ms; pared total 27.959,9 ms; mediana de trabajo individual 993,1 ms; producción del lote durante la ejecución 271,7 ms por encuentro (**no** es latencia); RSS pico 502 MiB; objetivo 5.000 ms **no alcanzado**; 200 partidos ≈54 s **estimación** no ejecutada. La cifra de ≈23 s del hallazgo H04 de MOTOR-15 era una medición intermedia anterior al código definitivo (se conserva como `declarada` con su contexto). Perfil de CPU: `out/prof/CPU.20261017.181642.5959.0.001.cpuprofile` (formato V8) con síntesis exclusiva/inclusiva en `07-RENDIMIENTO.csv`; límites: un solo proceso, muestreo; un perfil plano no demuestra que haya que cambiar el deporte.

## 9. Versiones y referencias

Motor `beM-motor-0.15.1-MOTOR15B` (antes `0.15.0-MOTOR15`: corrección normativa y de crédito), app `MOTOR-15B`, `export/9` y snapshot sin cambio de esquema; la lectura histórica no autoriza continuar con reglas distintas (guardados y export de 0.15.0 se rechazan con motivo). Extensión `SEM-MOTOR15B-20261017`, política `EST-MOTOR15B-R1 / ACTA-MOTOR15B-R1`, auditoría `PRJ-MOTOR15B-R1`. Referencia `20261016`: 83–98, 6.684 sorteos (`tests/fixtures/baseline-motor15b.json`; la de MOTOR-15 se conserva). Crear candidata o activar base sigue siendo explícito.

| Cambio | Clase |
|---|---|
| RG-I03, numeración art. 45 | norma |
| Robo por balón suelto | crédito |
| Relevo antes del tiempo muerto | deporte por defecto corregido |
| Cierre de cadenas de saque | registro |
| AUD17/AUD26, informe, semillas por caso | lectura |
| Caso preparado, Cierre, paquetes | documento/UI |
| Versiones | identidad |

## 10. Pruebas y comprobaciones

`npm test` 202/202 (10 grupos nuevos en `tests/motor15b.test.js`: B1 RG-I03 ×3, B2 art. 45, B3 AUD17/AUD26 ×2, B4 equivalencia, B5 relevo, B6 robos ×2, más ajustes de pins y de baseline), `data:check`, comprobación documental, informe de equivalencia, integración y robos, auditorías sobre los C15, panel de perfil anterior y recorrido real de Chromium (`scripts/browser/m15b-recorrido.mjs`; consola 0, red 0). Ejecuciones: 22 ejecuciones completas del script de integración + 3 colas + 5 reproducciones en lotes + equivalencia (11 ejecuciones, ≈9,5 partidos completos equivalentes); **0 reintentos; benchmark de cien no repetido**. Paquetes: `node scripts/m15b-package.js --code-commit=6a6814c` y `node scripts/m15b-package-check.js` (cubre solo los paquetes de devolución: **un hash correcto no demuestra que una auditoría leyó el caso apropiado**).

## 11. Límites declarados

Sin lectura directa de los PDF de FIBA; RG-I01/I02/I04 provisionales; frecuencias SEM sin calibrar; C15-06 no auditado en lote; sin traza completa de los cien del benchmark (solo tablas y cinco registros esenciales de muestra); toque defensivo no representado; recorrido de Dennis, otros navegadores y Node 24 **no ejecutados**; campaña de MOTOR-16 **no ejecutada**.

## 12. Preparación de MOTOR-16

[`evidencia-motor15b/14-PENDIENTES-MOTOR16.md`](evidencia-motor15b/14-PENDIENTES-MOTOR16.md): versión/perfil/políticas, rutas y contadores de robos, casos extremos existentes, universo de auditorías, restricción de coste medida y semillas de campaña y reserva separadas. No se ha ejecutado ni consumido su reserva.
