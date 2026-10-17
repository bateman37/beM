# Implementación de MOTOR-13 (auditorías, sensibilidad y calibración)

Encargo archivado: [`../prompts/MOTOR-13-auditorias-sensibilidad-y-calibracion.md`](../prompts/MOTOR-13-auditorias-sensibilidad-y-calibracion.md). Recorrido manual: [`../prompts/MOTOR-13-recorrido-manual.md`](../prompts/MOTOR-13-recorrido-manual.md). Evidencia reproducible: [`evidencia-motor13/`](evidencia-motor13/README.md).

> **Naturaleza.** MOTOR-13 es **lectura + diagnóstico + una campaña de partidos completos**: lee hechos ya conservados por MOTOR-12 (lote o paquete), calcula auditorías, la matriz de 32 capacidades, la fiabilidad de las probabilidades consumidas y la concentración, y prepara contrastes y candidatas. **No cambia el deporte**: la referencia `20261016` sigue en **83–103 con 6 505 sorteos** y la misma huella de trayectoria; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios. El único cambio de código fuera de la auditoría es la corrección de un **defecto de lector** de MOTOR-10 (quintetos) y un refactor sin cambio de semántica (`effectiveAbility`). **No se declara calibrado el motor**: el primer ciclo concluye **«base mantenida, con evidencia y límites»** (evaluación funcional SEM inicial, no validación externa comparable).

## 1. Base real

| Dato | Valor |
|---|---|
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno; el encargo proponía `feature/MOTOR-13-auditorias-y-calibracion`). |
| Base | `origin/main` en `655fb84` (merge de la PR [`bateman37/beM#13`](https://github.com/bateman37/beM/pull/13), **MOTOR-12 ya fusionado**: comprobado con `git fetch` y `merge-base`); la rama se reinició desde esa base conservando los commits propios. **No hay PR dependiente.** Nada se fusionó desde esta sesión. |
| Punto de partida comprobado (ejecutado, no leído del informe) | `data:check` correcto; referencia `20261016` = **83–103, 6 505 sorteos**, misma `trajectory_fp` (comprobada con `tests/fixtures/baseline-motor13.json` frente a `baseline-motor12.json`). |
| Archivos del lote de cierre de MOTOR-12 (`LOT-c268fba2`) | **Ausentes**: `out/` no se versiona y este entorno es nuevo. Solo se dispone de su resumen en [`evidencia-motor12/`](evidencia-motor12/README.md). **No se analizaron sus trazas ni se reconstruyeron sus diez partidos**; se usó la campaña nueva. |
| Alcance final | Catálogo AUD01–AUD32 con evaluador, lector de evidencia (lote conservado y paquete verificable), proyección por intento con caché, matriz de 32 capacidades, sensibilidad de contexto fijo, fiabilidad, concentración, referencias, doce experimentos materializados como lotes, comparación, candidatas explícitas, paquete `beM-audit-package/1` con comprobador, pestaña **Auditorías**, extensión `SEM-MOTOR13-20261017` (tabla `audit`), campaña inicial de 24 encuentros (+24 de repetición tras corregir el lector) y primer ciclo. |

## 2. Mapa de requisitos

| Requisito | Código | Datos / archivos | Interfaz |
|---|---|---|---|
| §4–§6 definición, estados y severidad | `src/audit/catalog.js`, `evaluators.js` | `auditoria/catalogo.json`, `ejecuciones.csv`, `hallazgos.jsonl` | Auditorías › Catálogo / Hallazgos |
| §4.2 evidencia e integridad previa | `src/audit/source.js` (`BatchSource`, `PackageSource`) | SHA-256 frente a `indice.jsonl`; comprobador de 15 controles en paquetes | Auditorías › Evidencia disponible |
| §12 lectura progresiva y caché | `src/audit/project.js`, `index.js` | `out/audit/cache/<huella>.json`, `out/audit/resultados/` | — |
| §7 matriz y sensibilidad | `src/audit/analysis.js`, `src/match/core.js` (`effectiveAbility`) | `capacidades.csv`, `sensibilidad.csv` | Auditorías › Matriz de 32 capacidades |
| §9 fiabilidad | `src/audit/analysis.js` (`reliability`), `calibration.js` (`reviewReliability`) | `fiabilidad.csv` | Auditorías › Fiabilidad |
| §10 referencias | `src/audit/references.js` | `referencias.json` | Auditorías › Catálogo |
| §11 concentración, bucles | `analysis.js` (`concentration`), `project.js` | `concentracion.json` | Auditorías › Concentración |
| §8, §13 experimentos y campaña | `src/audit/experiments.js`, `scripts/audit-campaign.js` | `plan-campana.json`, `campana-*.json` | Auditorías › Experimentos EXP13 |
| §14 calibración | `src/audit/calibration.js`, `compare.js`, `scripts/audit-cycle.js` | `calibracion/hipotesis.json`, `comparacion.csv` | Auditorías › Calibración |
| §16 paquete e informe | `src/audit/report.js`, `scripts/audit-check.js` | `beM-audit-package/1` | Auditorías › Informe y descargas |
| §15.4, §18 parámetros y versión | `data/match/motor13-seed-extension.json`, `src/profiles/rows-motor13.js`, `src/version.js` | tabla `audit` (25 filas LAB01 editables) | Panel › LAB01 |
| API local | `src/audit/api.js`, `scripts/dev-server.js` | `/api/audit/*` | — |

## 3. Modelo de auditoría

**Definición ≠ resultado.** Cada AUD declara ID, nombre, pregunta, hipótesis, tipo de control (determinista · señal · descriptivo · cobertura), entradas, productores y cobertura, escenarios sugeridos, indicadores, referencias, tolerancia, severidad y regla de interpretación. Una ejecución produce **cinco ejes separados** (§6.1): implementación del mecanismo (ejecutable · parcial · ausente), registro (suficiente · parcial · no registrado), exposición (observada · insuficiente · no observada · no aplicable), resultado (conforme al control · defecto demostrado · señal para revisar · inconcluso · no evaluado) y revisión humana (pendiente). **Nunca** se convierte «sin datos» en verde, una muestra pequeña en fallo ni «no se observó» en «implementado correctamente» (prueba 1 y 5).

**Ejecución sobre evidencia.** Un auditor recibe proyecciones de hechos ya conservados; no llama al entrenador, no pide RNG ni actualiza estados. Abrir/recalcular/exportar no cambia los archivos originales (hash del árbol del lote idéntico antes y después, prueba 8). Antes de interpretar se **verifica la integridad**: SHA-256 y bytes de cada archivo de intento frente al índice (lote) o los 15 controles del comprobador (paquete); si falla, no se interpreta (`ok:false`).

**Severidad (§6.2):** error determinista (un caso basta), aviso de cobertura, señal deportiva/estadística, información. Un aviso no invalida un partido que cumple su contrato.

**Hallazgo navegable:** ID, auditoría/regla, severidad, sujeto, universo, observado/esperado, versiones, motivo, estado, causa y evidencias (`match_id`, `attempt_id`, `event_id`, `decision_id`, filas de parámetros). Se guardan **todas** las evidencias y la interfaz muestra 5 (`audit.examplesPerFinding`) con paginación.

## 4. Catálogo AUD01–AUD32: consumidores, datos y partes no evaluables

Resultado real sobre la campaña R1 (24 encuentros: 4 con diagnóstico completo, 20 reducidos), **sin afirmar «32 auditorías aprobadas»**: 15 conformes al control, 16 inconclusas (parciales, sin exposición o sin registro), 1 no evaluada (AUD29) y 0 defectos ni señales abiertas (los defectos hallados durante el ciclo, de lector y de auditor, están corregidos: §10).

| ID | Qué lee | Evaluación | Resultado en la campaña | Parte no evaluable (requisito/faltante) |
|---|---|---|---|---|
| AUD01 | `facts` (conciliación de acta y análisis) | determinista | conforme (24/24 tras el arreglo; R0: 8 fallos, ver §9) | normativa FIBA sin contraste de PDF |
| AUD02 | posesiones, F | determinista | conforme | — |
| AUD03 | hechos (relojes, marcador) | determinista + señal | conforme | solicitudes frente a aplicación de órdenes (AUD24) |
| AUD04 | recetas (solo diagnóstico completo) | determinista | conforme (63 k+ recetas con la operación pura = valor registrado) | nivel reducido: inconcluso |
| AUD05 | recetas, perfil | descriptiva | inconcluso | 7 capacidades consumidas sin receta registrada (§5) |
| AUD06 | oportunidades, binarias | cobertura | inconcluso | percepción como fase propia (no registrada) |
| AUD07 | libro | determinista | conforme (623 registros, 621 con empates legítimos) | equivalencia semántica de fichas renombradas |
| AUD08 | oportunidades | descriptiva | inconcluso | contraste de libertad con muestra |
| AUD09 | etiquetas ESP | descriptiva | inconcluso | **9 de 20 ESP expuestos** (ESP06, 07, 09–17 sin exposición en esta campaña) |
| AUD10 | ejecuciones | descriptiva | inconcluso | contraste de estilo con muestra |
| AUD11 | organización prevista/efectiva por tiro | señal | conforme (2 884 tiros, 0 desajustes) | — |
| AUD12 | binarias de presión/ayuda | descriptiva | inconcluso | carga por tramo |
| AUD13 | calidad de oportunidad frente a p de conversión | señal | conforme (monótona forced<normal<comfortable) | muestra pequeña: no es calibración |
| AUD14 | recetas de tiro | descriptiva | inconcluso | duplicidad: pide causa y punto de consumo (§11.3) |
| AUD15 | `rebote:*` | descriptiva | inconcluso | TEC17/TEC18 sin receta registrada |
| AUD16 | duraciones | descriptiva | inconcluso | — |
| AUD17 | recetas con energía | señal | **inconcluso** (lo leído es coherente: brecha 100–70 ≈ 0,02; 40–70 ≈ 0,2; 10–40 ≈ 2,0 en técnica/mental) | energía < 10 no expuesta: la banda crítica queda sin leer, por eso no es verde |
| AUD18 | entrenador | descriptiva | inconcluso | estabilidad requiere más partidos |
| AUD19 | faltas por jugador | determinista | conforme | excepción/urgencia del librillo |
| AUD20 | recetas | determinista | conforme (solo las 32 capacidades: sin bonus de edad) | estados de entrada y límites de veteranos |
| AUD21 | estados | descriptiva | inconcluso | protocolo neutral de Consistencia (MOTOR-07) no repetido |
| AUD22 | estados, recetas | determinista | conforme (T solo como estado) | — |
| AUD23 | `estados:*` | cobertura | inconcluso | presupuesto de efectos por operación |
| AUD24 | órdenes, entrenador | descriptiva | inconcluso | antes/después con muestra |
| AUD25 | memoria | determinista | conforme (≤ 8 patrones) | — |
| AUD26 | cadenas de saque | señal | conforme (0 cerradas sin receptor) + aviso de cobertura (8 abiertas al sonar la bocina) | cierre «fin de periodo» (productor) |
| AUD27 | equipo = Σ jugadores | determinista | conforme | — |
| AUD28 | audiencia por archivo | determinista | conforme (todo diagnóstico) | interfaz humano/IA no se audita aquí |
| AUD29 | — | cobertura | **no evaluado** | modos y continuación: los cubren las pruebas de MOTOR-02/12; sin snapshot de continuación |
| AUD30 | fichas congeladas | descriptiva | inconcluso | población ficticia, sin referencia externa |
| AUD31 | marcador/posesiones | descriptiva | inconcluso | muestra pequeña (24 partidos de 12 parejas) |
| AUD32 | integridad y coste | determinista | conforme | optimización: MOTOR-14 |

## 5. Matriz de las 32 capacidades

Una fila por capacidad y tarea/rol pertinente (`capacidades.csv` contiene todas las filas; abajo, el resumen por capacidad con los usos agregados). Distingue **declarado** (filas del perfil que la consumen, escaneadas del perfil), **observado**, **aplicado**, **contrastado** y **no expuesto**. Los incrementos +1/+3/+5 son un contraste de **cálculo fijo** (§7.3 B): el **valor de receta** (puntos de la escala 1–30, *no* una probabilidad ni puntos) que resultaría de sumar capacidad a un actor en el contexto exacto registrado, con la **operación pura `effectiveAbility(perfil, base, energía, capacidad, tope de tarea)`**, extraída de `MatchCore.eff` sin cambiar su semántica (comprobada: reproduce el valor efectivo registrado en las 63 k+ recetas verificables, 0 discrepancias). El incremento efectivo respeta el máximo 30 (saturación ≠ desconexión). Cuando el tope de tarea no está registrado se usa la brecha base−efectiva registrada (se anota el método en cada fila).

| ID | Capacidad | Tareas.rol con uso registrado (usos) | Δ receta por +1 / +3 / +5 (media) | Contextos | Saturadas (base 30) | Contraste de partidos | Estado en la evidencia |
|---|---|---|---|---|---|---|---|
| TEC01 | Triple | ataque_tiro:three·x (222) | 0.90 / 2.70 / 4.50 | 12 | 0 | EXP13-02 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC02 | Tiro de media distancia | ataque_tiro:midrange·x (55) | 0.90 / 2.70 / 4.50 | 12 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC03 | Tiro interior | ataque_tiro:inside·x (106) | 0.85 / 2.55 / 3.82 | 12 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC04 | Finalización en movimiento | ataque_tiro:rim·x (158) | 0.80 / 2.40 / 4.00 | 12 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC05 | Tiro libre | ataque_libre·x (115) | 0.95 / 2.85 / 4.75 | 12 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC06 | Tiro en movimiento | TAR11.attack·shooter (13388) | 0.80 / 2.40 / 3.87 | 12 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC07 | Manejo de balón | TAR06.attack·handler (15745); TAR02.attack·handler (2563); acceso_recorrido_largo·x (700); … +4 | 0.36 / 1.09 / 1.82 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC08 | Pase | TAR07.attack·passer (40384) | 0.80 / 2.40 / 4.00 | 12 | 0 | EXP13-01 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC09 | Bloqueos | TAR04.attack·screener (493); legalidad_ofensiva·o (135) | 0.62 / 1.87 / 2.99 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC10 | Movimiento sin balón | TAR03.attack·receiver (8654); ayuda:receptor_abandonado·receiver (95); TAR09.defense·receiver (19) | 0.60 / 1.80 / 2.92 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC11 | Juego de poste | TAR05.attack·post (893); legalidad_ofensiva·o (41) | 0.60 / 1.80 / 2.10 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC12 | Defensa perimetral | TAR03.defense·receiverMarker (6104); TAR02.defense·primary (2559); calidad_defensa:POS06·receiverMarker (622); … +19 | 0.46 / 1.38 / 2.29 | 24 | 0 | EXP13-05, EXP13-06 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC13 | Defensa interior | TAR05.defense·postMarker (893); calidad_defensa:POS01·screenMarker (617); calidad_defensa:POS11·postMarker (615); … +11 | 0.45 / 1.36 / 1.93 | 24 | 0 | EXP13-05 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC14 | Robo | TAR07.defense·interceptor (116); TAR06.defense·primary (24) | 0.45 / 1.35 / 2.25 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC15 | Tapón | tapón:bloqueador·x (470) | 0.60 / 1.80 / 2.90 | 12 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC16 | Defensa de bloqueos | calidad_defensa:POS06·receiverMarker (622); calidad_defensa:POS07·receiverMarker (621); calidad_defensa:POS01·primary (617); … +8 | 0.45 / 1.36 / 2.26 | 24 | 0 | EXP13-05 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| TEC17 | Cierre de rebote | — | — | — | 0 | EXP13-07 | consumida en operaciones sin receta registrada con entradas (fuerza de rebote (profile.rebound.strength) vía reboundStrength → recipeObj sin etiqueta (actions.js)); contraste B no aislable: registrar la receta de fuerza de rebote o extraer una función pura con energía y alcance del contexto |
| TEC18 | Captura de rebote | — | — | — | 0 | EXP13-07 | consumida en operaciones sin receta registrada con entradas (fuerza de rebote (strength) y captor (profile.rebound.captor) vía recipeObj/weightedSum sin etiqueta (actions.js)); contraste B no aislable: registrar las recetas de fuerza y de captor o extraer una función pura con energía y alcance del contexto |
| FIS01 | Velocidad | acceso_recorrido_largo·x (700) | 0.45 / 1.35 / 2.25 | 12 | 0 | EXP13-06 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| FIS02 | Aceleración | TAR03.attack·receiver (8654); TAR02.attack·handler (2563); TAR02.defense·primary (2559); … +8 | 0.27 / 0.81 / 1.34 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| FIS03 | Agilidad | TAR03.attack·receiver (8654); TAR03.defense·receiverMarker (6104); TAR02.attack·handler (2563); … +9 | 0.23 / 0.69 / 1.15 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| FIS04 | Fuerza | TAR05.attack·post (893); TAR05.defense·postMarker (893); calidad_defensa:POS11·postMarker (615); … +6 | 0.24 / 0.63 / 0.78 | 22 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| FIS05 | Salto | tapón:bloqueador·x (470); ataque_tiro:rim·x (158) | 0.15 / 0.45 / 0.75 | 24 | 0 | EXP13-07 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| FIS06 | Resistencia | — | — | — | 0 | EXP13-06, EXP13-08 | consumida en operaciones sin receta registrada con entradas (factor de resistencia del gasto de energía (core.js · enduranceFactor): afecta al desgaste futuro, no a un valor del siguiente tiro); contraste B no aislable: contraste de gasto por intervalo con la operación pura de consumo (no existe extraída); EXP13-08 observa el efecto en partidos |
| FIS07 | Equilibrio | TAR06.attack·handler (15745); TAR11.attack·shooter (13388); TAR05.attack·post (893); … +5 | 0.14 / 0.43 / 0.71 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| MEN01 | Comprensión táctica | TAR01.attack·director (1692); coordinación_TAR01·director (1692); calidad_defensa:POS09·cutterMarker (621); … +2 | 0.37 / 1.10 / 1.83 | 24 | 0 | EXP13-04 | declarado, observado, aplicado y contrastado (cálculo fijo) |
| MEN02 | Visión de juego | — | — | — | 0 | EXP13-03 | consumida en operaciones sin receta registrada con entradas (q de la selección (actions.js · libertyAndReading) y lectura defensiva: eff(decisor, MEN02) sin receta etiquetada); contraste B no aislable: registrar las entradas de q (MEN02, MEN03 y penalización de presión) o extraer libertyAndReading como función pura |
| MEN03 | Decisiones | — | — | — | 0 | EXP13-03, EXP13-04 | consumida en operaciones sin receta registrada con entradas (q de la selección (actions.js · libertyAndReading, con penalización de presión MEN07) y lectura defensiva); contraste B no aislable: ídem MEN02 |
| MEN04 | Anticipación | TAR03.defense·receiverMarker (6104); TAR05.defense·postMarker (893); acceso_recorrido_largo·x (700); … +29 | 0.17 / 0.51 / 0.85 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| MEN05 | Concentración | TAR07.attack·passer (40384); TAR06.attack·handler (15745); TAR01.attack·director (1692); … +3 | 0.18 / 0.55 / 0.92 | 24 | 0 | — | declarado, observado, aplicado y contrastado (cálculo fijo) |
| MEN06 | Consistencia | — | — | — | 0 | EXP13-10 | consumida en operaciones sin receta registrada con entradas (amplitud de la variación del momento (states.js · formulas.js consistencySigmaAt)); contraste B no aislable: protocolo neutral de MOTOR-07 (contexto fijo, estados neutrales); no se evalúa como «más valor → más puntos» |
| MEN07 | Rendimiento bajo presión | — | — | — | 0 | — | consumida en operaciones sin receta registrada con entradas (pérdida por presión (states.js, formulas.js) y penalización de MEN03 en la elección); contraste B no aislable: registrar la pérdida por presión con sus entradas o extraer la fórmula pura; `estados:forma_presion` conserva el resultado |

**Selección de contextos (§7.4):** hasta 24 por capacidad, **ciega al resultado**: los 3 identificadores de decisión de menor hash FNV-1a por (capacidad, tarea.rol) más un estrato «LIMITE» (base ≥ 28 o energía < 10), repartidos en rotación; con pocos estratos hay menos de 24. Los registros originales de MOTOR-12 no se recortan.

**Siete capacidades consumidas sin receta registrada** (TEC17 y TEC18 en rebote; MEN02 y MEN03 en la `q` de la selección; MEN06 y MEN07 en estados; FIS06 en el gasto; FIS05 sí aparece en recetas registradas, pero su consumo en rebote tampoco se registra): se consumen en operaciones cuyas entradas no se registran como receta etiquetada con base, efectiva y energía (`actions.js`: `reboundStrength`/`libertyAndReading`; `states.js`; `core.js`: `enduranceFactor`). **No son atributos muertos** (están conectadas), pero su contraste B **no es aislable con el contrato actual**: la dependencia exacta (registrar la receta o extraer la función pura con las entradas del contexto) queda en el inventario de MOTOR-14. No se inventó una derivada ni se copió otra fórmula.

**Tres niveles de evidencia** (§7.3): **A** observación (matriz: usos, contribución); **B** cálculo fijo (arriba; no se inserta en `eventos` como acción que ocurrió); **C** partidos completos (doce experimentos; no aísla el mérito de una capacidad si cambian varias).

## 6. Probabilidades, resultados e incertidumbre

- **Unidad correcta:** por decisión binaria consumida se conserva la `p` final antes del sorteo y el resultado **del mismo sorteo** (registros `binaria:*`); para categorías excluyentes, la distribución completa de la decisión (lectura por clase). No se usa la probabilidad anterior a estados ni el marcador como etiqueta, ni se mezclan mecanismos.
- **Lectura inicial:** por mecanismo, n, partidos, media de `p`, observados, esperados Σ`p`, diferencia; **cinco intervalos fijos** `[0;0,2) … [0,8;1]` (el último incluye 1) con n, media de `p` y frecuencia; un intervalo sin observaciones queda vacío (no se rellena con cero ni se interpola); Brier binario descriptivo `media((y−p)²)`, no una nota global.
- **Control determinista:** `p=0` con resultado positivo o `p=1` con resultado negativo (0 casos en la campaña).
- **Incertidumbre proporcionada:** distribución por partido y emparejamiento cuando existe; **sin** p-valores, bootstrap ni intervalos binomiales (los acontecimientos de un partido comparten contexto). El aviso de muestra (<100 decisiones o <3 partidos por grupo) es una preferencia editorial SEM, no certifica significación.
- **Coherencia de muestreo ≠ realismo:** un modelo con una probabilidad deportivamente inadecuada que luego la cumple pasaría esta lectura. Referencias metodológicas: [scikit-learn, calibración](https://scikit-learn.org/stable/modules/calibration.html) y [NIST/SEMATECH, intervalos de proporciones](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) (no se instala nada ni se entrena un calibrador).
- **Resultado:** 4 partidos con diagnóstico completo, 37 mecanismos binarios; 12 con muestra suficiente sin señal, 1 señal con |z| ≥ 2 (`COB01:seguimiento`, z≈2,13, n=223, signo no coherente en todos los partidos) y 25 con muestra insuficiente. Con 13 mecanismos suficientes se esperaban ≈ 0,6 señales solo por azar (probabilidad de ver al menos una ≈ 45 %).

## 7. Referencias y bandas

No existe en el repositorio ninguna referencia externa numérica verificada y comparable. [`auditoria/referencias.json`](evidencia-motor13/auditoria/referencias.json) clasifica: **candidatas** (EuroBasket 2025 y Copa del Mundo 2023 de FIBA: fuente localizada, **datos no extraídos**; el acceso devolvió 403), **diseño SEM** (curva de energía del perfil, método de fiabilidad) y **sin referencia comparable** (tasas de tiro, ritmo, pérdidas, rebote de la población ficticia EQ01–12). No se inventó ninguna «media FIBA» ni banda min/máx. La población EQ01–12 no es equivalente a selecciones de élite y las reglas 2026 pueden diferir de una temporada anterior. Una banda de diseño o una referencia genera una **señal explicable**, nunca un recorte del marcador.

## 8. Concentración, bucles y duplicidades

- **Concentración (§11.1):** aviso SEM si una familia supera el 80 % (≥ 40 ejecuciones y ≥ 3 partidos) o un jugador el 60 % de las F de su equipo (≥ 40 F y ≥ 3 partidos). Con un par y dos variantes por experimento, las familias con denominador suficiente son 42 y los finalizadores 55; **0 avisos**. Es un aviso, no un defecto: un libro de una ficha puede producirla.
- **Bucles (§11.2):** diez revisitas consecutivas del mismo estado lógico sin avance de tiempo; los libres, faltas, cambios y pausas a 0 décimas no cuentan. Máximo observado: 0 en los partidos reales. No corta la posesión.
- **Duplicidades (§11.3):** el auditor **no** afirma una duplicidad sin causa y punto de consumo (coincidencia de nombre no basta); lo que sí comprueba de forma determinista es que las recetas solo contienen las 32 capacidades (sin edad, sin T) y que T aparece como estado. La lectura de presupuesto de efectos por operación queda pendiente (AUD23).

## 9. Campaña inicial de partidos completos (§13)

**Plan congelado antes de ejecutar** ([`plan-campana.json`](evidencia-motor13/plan-campana.json), commit anterior a la primera simulación): doce experimentos EXP13-01…12 × dos variantes = **24 encuentros nuevos**; EXP13-08 y EXP13-11 con diagnóstico completo (4 encuentros), los otros diez reducido (20). Semillas de lote 131001–131012 (derivación `LOT-SEED-R1`, congeladas). Reserva de validación 132001–132004, **no lanzada**. Pares: EXP13-01/04 EQ01–EQ02 (natural), 02 EQ02–EQ09, 03 EQ06–EQ05, 05/06 EQ10–EQ04, 07 EQ03–EQ10, 08/12 EQ11–EQ12, 09/10/11 EQ01–EQ02 histórico. Selección de actores por regla de ficha antes de mirar resultados (EXP13-02: finalizadores exteriores titulares de EQ02 con vocación ≥ 0,75 y preferencia de triple ≥ 0,5 → J04 y J05).

**Conversión de escalas explícita** (§8): Libertad 1/5 y Después-del-tiro 2/4 sobre sus escalas 1–5; Forma −0,5/+0,5 sobre −1…1; T inicial −0,5/+0,5 sobre −1…1; Consistencia 10/24 sobre 1–30 con deltas −7/+7 sobre la ficha natural (17) de EQ01-J03; Energía 100/30 sobre 0–100. Individual (ORG01) frente a zona 2–3 (ORG02) y presión `normal`/`three_quarters` con los identificadores del catálogo defensivo.

**Cambio mínimo de MOTOR-12 (`allowBaseOps`):** el lote exigía que la variante base no cambiase nada; los contrastes de dos extremos (Forma −0,5/+0,5, T −0,5/+0,5, Consistencia 10/24, Libertad 1/5…) necesitan que **ambas** variantes lleven intervención. Se añadió la bandera explícita `allowBaseOps` (por defecto `false`: comportamiento anterior intacto); en esos lotes `V0` es el «extremo bajo», no una base inalterada, y las diferencias exactas (`changes`) de las dos variantes quedan en `entradas/variantes.json`.

**Ejecuciones reales:** **24 encuentros** en la campaña **R0**; el lector de quintetos dejó **8** con la conciliación analítica en fallo (acta conciliada) → se corrigió el defecto (§10) y se **repitieron los mismos 24 encuentros** (misma entrada y semilla: campaña **R1**, lotes `…-R2`): 24/24 válidos y **24/24 trayectorias, marcadores y sorteos idénticos a R0** (el deporte no cambió). Total real: **48 ejecuciones de partido** en este encargo (24 son repetición de verificación), más 3 lotes pequeños en las pruebas (4 encuentros reducidos y 1 de diagnóstico completo, reutilizados en los 9 grupos). Costes medidos (4 CPU, Node 22.22): diagnóstico completo ≈ 5,9 s/partido, reducido ≈ 1,2 s; campaña completa ≈ 49 s; lectura de auditoría de los 24 encuentros ≈ 3,2 s la primera vez (203 MiB leídos, ≈ 134 ms por intento) y ≈ 0,9 s desde caché; paquete de auditoría ≈ 70 KB.

**Qué demuestra:** una evaluación integrada inicial y la prueba del recorrido de auditoría/calibración. **Un caso por intervención no certifica su efecto poblacional.** La misma semilla no garantiza los mismos sorteos tras una decisión distinta. [`calibracion/comparacion.csv`](evidencia-motor13/calibracion/comparacion.csv) recoge, por experimento, 14 métricas por equipo y el marcador; son observaciones (p. ej. EXP13-10 da el mismo box score con trayectoria distinta: MEN06 solo cambia magnitudes de estado). No se usa el marcador como objetivo.

## 10. Hallazgos por tipo de causa; defectos corregidos y controles añadidos

| ID | Causa | Qué era | Estado |
|---|---|---|---|
| `DEF-LECTOR-QUINTETOS` | **lector** (MOTOR-10, `presence.lineupTable`) | (a) dos alineaciones registradas con los **mismos cinco jugadores en puestos distintos** se leían como dos quintetos y contaban dos veces minutos y puntos (48,56 min y 110 puntos en un partido de 40 min y 89 puntos); (b) una fila con puntos pero **sin tiempo ni posesión completa** (p. ej. unos libres con el quinteto en pista a 0 décimas) se descartaba y esos puntos desaparecían (83 en vez de 85). Fallaba `AN07`/`AN09` en 8 de 24 encuentros con el acta cuadrada. | **Corregido**: la tabla agrupa por **conjunto** de jugadores (la fila lleva todos los ids de tramo en `lineupIds`) y solo omite una fila sin ninguna presencia. No cambia el deporte (misma trayectoria). El paquete añade la columna `lineup_ids` a `quintetos.csv` (compatible: los paquetes anteriores sin la columna siguen verificando). Regresión: prueba 2. |
| `DEF-AUDITOR-AUD07` | **auditor** | leyó `prioridad null` (ficha *llamada* fuera del libro, prioridad efectiva 1) como error de rango (554 «violaciones» falsas) | Corregido y cubierto (prueba 6) |
| `DEF-AUDITOR-AUD13` | **auditor** | comparó la calidad con `p_final` (probabilidad de la **selección**) en lugar de `p_conversion` | Corregido |
| `DEF-AUDITOR-AUD26` | **auditor** | trató como «sin receptor» cadenas de saque **abiertas** al sonar la bocina (todas son la última cadena de su periodo, con `expiry`+`period_end`) | Corregido; queda un **aviso de cobertura de productor** (la cadena no se cierra con causa «fin de periodo»; es registro, no deporte) |
| H-AUD05-001 | productor (registro) | 7 capacidades consumidas sin receta etiquetada (§5) | Abierto: inventario MOTOR-14 |
| H-AUD09-001 | auditor/exposición | 11 ESP sin exposición en la campaña | Abierto: ampliar muestra |
| H-AUD26-001 | productor (registro) | 8 cadenas abiertas al sonar la bocina | Abierto: inventario MOTOR-14 |

Lección AN08 conservada: una posesión mixta para dos quintetos no es un error de conciliación y no se restaura la identidad falsa de repartir una posesión completa a cada cinco. Antes de tocar una probabilidad se distinguió defecto de simulación, de productor, de lector, de agregación y de regla de auditoría: **los cuatro defectos demostrados eran de lector o de auditor**, y se arreglaron en su origen (no se compensó nada con una probabilidad). El 404 anterior no se reabrió; los fallos de controlador se siguen probando con ejecutor sintético.

## 11. Primer ciclo de calibración (§14)

- **Hipótesis consideradas** ([`calibracion/hipotesis.json`](evidencia-motor13/calibracion/hipotesis.json)): la única señal con |z| ≥ 2 con muestra suficiente es `COB01:seguimiento` (122 observados frente a 106,4 esperados, n=223, z≈2,13, signo no coherente en todos los partidos). Alternativas a descartar antes de tocar una fila: fluctuación de muestreo (se esperaban ≈ 0,6 señales por azar), composición de pocas plantillas, defecto del lector del mecanismo y p0 mal calibrada. **No hay justificación suficiente**.
- **Decisión: base mantenida, con evidencia y límites.** Cero filas efectivas alteradas, ninguna candidata guardada; no se inventó un cambio numérico para parecer activos. La reserva de validación (132001–132004) **no se lanzó**: simular copias idénticas de la base no valida nada y una candidata sin cambio real no tiene qué evaluar (§13.4); queda reservada y sin usar para ajustar. El flujo de candidata (hipótesis → copia de la base → pasos del editor → diff → validación → sin activar) existe y está probado (prueba 7) y se usa desde el Panel; **no** se ha ejecutado un ciclo con candidata real.
- **Qué falta para poder ajustar con criterio:** más partidos con diagnóstico completo en las preguntas pertinentes (Lotes › 100/1.000), una referencia externa comparable y un mecanismo con exposición suficiente; el panel permite ampliar repeticiones con los lotes existentes.
- **Pasos del editor** (precargas, no obligatorios): p0 binaria ±0,01 absoluto (validando rango), logit ±0,005 por punto de capacidad, carga/desgaste/duración ±5 %; **no** se aplican a umbrales reglamentarios, ni a magnitudes que solo «parecen» una probabilidad por su nombre (manda el tipo y la clase de la fila); máximo 1 hipótesis y 3 filas efectivas por candidata. Se lee la fila **vigente** del perfil (p. ej. `shots.three.p0`), no los números del anexo.
- **Estado de calibración:** «Evaluación funcional SEM inicial» sobre 4 partidos con diagnóstico completo y 24 encuentros de campaña, **no** «validación externa comparable»; el motor completo **no** se declara calibrado.

## 12. Coste, ingestión y reutilización

Una pasada por intento sobre las decisiones (por bloques de líneas, sin construir una cadena gigante), proyección reutilizable guardada en `out/audit/cache/` con huella (SHA-256 de los archivos del intento + versión de proyección + política); recalcular desde caché evita releer los cientos de MiB. No se escanean 32 veces los datos para cada pestaña: todos los evaluadores comparten la proyección. La interfaz pagina los hallazgos y no carga las decisiones en el navegador. La evidencia es **reutilizada**: la misma proyección alimenta varias familias sin contar el partido varias veces. Los modos de registro mantienen la neutralidad ya comprobada (misma `trajectory_fp` con diagnóstico y reducido en la referencia). Volumen de la campaña en disco: ≈ 420 MiB sin comprimir para 48 ejecuciones (diagnóstico completo ≈ 37 MiB por partido, reducido ≈ 3,7 MiB). La optimización es de MOTOR-14.

## 13. Panel, permisos, versiones y compatibilidad

- **Pestaña Auditorías:** (1) evidencia disponible (lotes) con verificación de integridad **sin interpretar**; (2) «Analizar» = **lectura, no simula**, rotulado; (3) catálogo AUD01–32 con filtros por área, tipo, resultado y búsqueda, separando definición, estado y ejecución real; (4) hallazgos con detalle paginado; (5) matriz de 32 capacidades con filtros; (6) fiabilidad (n, partidos, intervalos) y distribuciones; (7) concentración (aviso, no defecto); (8) **experimentos EXP13** con el número de partidos que lanzarán, semillas y diferencias, en un ejecutor **de nuevos partidos** claramente separado (confirmación antes de lanzar, vía `/api/batch`); (9) calibración (candidatas explícitas, activación manual); (10) informe (Markdown) y paquete de auditoría (ZIP). No hay nota global del motor ni un porcentaje de cobertura que mezcle implementado, observado y validado.
- **Permisos:** las auditorías de pesos, probabilidades y estados exactos son **diagnóstico** (`audience: diagnostic` en el paquete y en cada archivo); no se publican libros ni estados internos del rival, y la IA deportiva no recibe nada del auditor. Las consultas públicas/propias de MOTOR-10 mantienen su matriz.
- **Versiones separadas:** aplicación `MOTOR-13`; perfil efectivo `…+SEM-MOTOR13-20261017` (tabla `audit` de solo lectura: **no cambia el deporte**, comprobado por `data:check` y por la huella de trayectoria); esquema del resultado `beM-audit-result/1`; paquete `beM-audit-package/1`; proyección `PRJ-MOTOR13-R3`; versión de auditorías `AUD-MOTOR13-R1`. `export/8` y `beM-analysis-package/1` no se tocan salvo la **columna aditiva `lineup_ids`** de `quintetos.csv` (el comprobador la acepta ausente). El baseline de trayectoria no se sobrescribió: `tests/fixtures/baseline-motor13.json` conserva el `trajectorySha256` de MOTOR-12 y solo cambia el `sha256` de proyección por el identificador del perfil (como en MOTOR-10 a MOTOR-12).
- **Paquete de auditoría `beM-audit-package/1`:** `manifest.json` con SHA-256, bytes y registros por archivo, audiencia diagnóstica y `self_contained:false` (cita su fuente: lote/paquete de MOTOR-12; **no se anuncia autocontenido**). Comprobador `npm run audit:check -- <ZIP>` (7 controles: manifest, SHA-256 sin archivos sin inventariar, formatos, catálogo de 32, matriz de 32, hallazgos completos, audiencia y alcance honesto). Una copia alterada no pasa (prueba 9).

## 14. Inventario de cierre para MOTOR-14

Separando **simplificaciones aceptadas** de **requisitos ausentes**; el número 14 no borra requisitos.

| Pendiente | Tipo | Requisito / estado actual | Impacto | Prueba posible | Acción de cierre |
|---|---|---|---|---|---|
| Perfil normativo FIBA sin contraste de PDF (403) | requisito abierto | filas REG con estado de contraste; ninguna lectura directa | un acta cuadrada prueba consistencia, no conformidad | contraste con los PDF cuando sean accesibles | contraste fila a fila |
| Inferioridad legal natural, tiro en vuelo/interferencia, continuación reglamentaria persistida | requisito ausente | tipados sin ejecución / sin productor (MOTOR-09) | casos reglamentarios raros no generables | casos preparados + natural | implementar el productor |
| Continuación de ventaja/desvío en asistencia | requisito ausente | sin productor | AS en esas jugadas se calcula por convención | caso preparado | productor + registro |
| Estado propio por tramo | registro parcial | no es campo propio | on/off sin estado por tramo | — | registro por tramo |
| Lateralidad desconocida | **simplificación aceptada** | mapa sin lateralidad | ninguna sin dato | — | solo si hay dato (no inventar) |
| **Recetas sin registro**: TEC17, TEC18 (rebote; FIS05 solo en su parte de rebote), MEN02/MEN03 (`q` de selección), MEN06/MEN07 (estados), FIS06 (gasto) | **registro parcial (nuevo)** | consumidas sin receta etiquetada con base/efectiva/energía | contraste B no aislable para 7 capacidades | extraer funciones puras o registrar receta | registrar o extraer, con prueba de neutralidad |
| Receta → probabilidad | registro parcial (nuevo) | el contraste B llega al valor de receta, no a la probabilidad final (la conversión no registra su entrada completa) | sin Δ de probabilidad en contexto fijo | función pura de conversión | extraer la operación común |
| Cadena de saque abierta al sonar la bocina | registro (productor, nuevo) | queda `abierta`; no se cierra con causa «fin de periodo» | ruido en AUD26 | caso con bocina durante saque | cerrar con causa explícita (comprobar neutralidad) |
| Percepción como fase propia; carga de presión por tramo; equivalencia semántica de fichas | registro parcial (nuevo) | AUD06, AUD12, AUD07 | lecturas descriptivas | — | registros pertinentes |
| ESP06, 07, 09–17 sin exposición | exposición | 9 de 20 expuestos en la campaña | ESP no observados no se pueden auditar | lotes mayores / casos preparados | ampliar muestra |
| Referencias externas | requisito abierto | FIBA 2025/2023 localizadas, **sin datos extraídos** | solo evaluación funcional SEM | extracción de conteos compatibles | extraer con fecha y alcance, mapear AS/transición |
| Muestra de calibración | exposición | 4 partidos con diagnóstico completo | señales sin potencia | lotes de 100/1.000 desde Lotes | ampliar y revisar |
| Reserva de validación no lanzada | decisión | sin candidata real | ninguna validación independiente aún | 4 casos reservados (132001–132004) | usarla si surge una candidata |
| Recorridos manuales | pendiente de Dennis | MOTOR-08 a MOTOR-13 | aceptación deportiva sin registrar | recorrido manual | Dennis |
| Rendimiento y almacenamiento | MOTOR-14 | ≈ 5,9 s y ≈ 38 MiB por partido de diagnóstico | lotes grandes lentos | medición en el equipo de Dennis | optimizar |
| Continuación desde snapshot | requisito ausente | un intento interrumpido se repite desde su inicio | — | — | snapshot deportivo |

## 15. Pruebas, controles reales y límites

| Qué | Resultado |
|---|---|
| `npm test` | **170 pruebas pasan** (161 previas + **9 nuevas** de `tests/motor13.test.js`; se actualizaron tres aserciones heredadas de versión/identidad de perfil: catálogo/referencias, agregación y regresión del lector, auditor de probabilidad, sensibilidad, estados, alertas, candidata, neutralidad, persistencia/paquete) |
| `npm run data:check` | correcto (incluye `checkMotor13`: la extensión solo añade `audit` y el perfil efectivo es idéntico al de MOTOR-12 salvo `audit`, `extensions` y `effectiveId`) |
| Comprobación documental | `scripts/docs/check_engine_docs.py` |
| Referencia `20261016` | 83–103, 6 505 sorteos, misma huella de trayectoria que `baseline-motor12.json` |
| Campaña | 24 encuentros (R0) + 24 repetidos (R1), 24/24 válidos y trayectoria idéntica entre R0 y R1 |
| Paquete de auditoría | comprobador de 7 controles correcto; copia alterada rechazada |
| Chromium (automatizado, sin perfil de usuario real) | pestaña, selección de 12 lotes, verificación de integridad, análisis, catálogo y filtro, hallazgo y detalle, matriz con filtro, fiabilidad, concentración, experimentos, calibración, descarga real del informe (.md) y del paquete (.zip) y lanzamiento de EXP13-01 desde la interfaz (**3 lanzamientos durante la depuración = 6 encuentros reducidos más, no contados en la campaña**); cero errores de consola y cero respuestas ≥ 400 en el último recorrido. Dos fallos de interfaz hallados y corregidos (botones deshabilitados tras marcar lotes; un `start` redundante con 409) |
| **No ejecutado** | lotes de 100/1.000, reserva de validación, Node 24, otros navegadores, perfil de usuario real, recorrido manual de Dennis, extracción de las fuentes FIBA (403), archivos del lote de cierre de MOTOR-12 (ausentes) |
