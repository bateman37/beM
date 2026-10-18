# MOTOR-17 — Ajustes, rendimiento y auditoría de cierre

> [Prompt archivado](../prompts/MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md) · [Recorrido manual](../prompts/MOTOR-17-recorrido-manual.md) · [Estado](../estado.md) · evidencia compacta en [`evidencia-motor17/`](evidencia-motor17/00-LEEME.md) · entrega anterior: [MOTOR-15B](motor15b.md) · campaña previa: [MOTOR-16](../prompts/MOTOR-16-campana-y-extraccion-para-chatgpt.md)

**Veredicto honesto.** Implementación acotada sobre MOTOR-15B: defectos de crédito, registro y lectura corregidos con causa demostrada; optimización exacta del coste (≈ −7 % con salida idéntica) sin alcanzar el objetivo de 5 s (≈ 30 s por cien partidos); **dos candidatas numéricas propuestas** (una sola fila cada una) y una elegida para el cierre **antes** de abrir la campaña; auditoría comparativa R0/R17 ejecutada y empaquetada para ChatGPT. **Ninguna candidata está aceptada deportivamente**; la aceptación manual de Dennis sigue pendiente. Las cifras de campaña no se copian aquí: salen de los archivos finales (ver [`evidencia-motor17/`](evidencia-motor17/00-LEEME.md)).

## 1. Base, ramas y etapas de evidencia

| Etapa | Identidad | Qué es |
|---|---|---|
| **R0** | `6a6814c` (código de MOTOR-15B; `109b9f8` y `85d8ccd` solo añaden documentación) | Referencia congelada, ejecutada desde un worktree aislado del mismo repositorio. Motor `beM-motor-0.15.1-MOTOR15B`, política `EST/ACTA-MOTOR15B-R1`, perfil hasta `SEM-MOTOR15B-20261017`. |
| **A17** | `a81c28d` + `e4a780a` | Correcciones demostradas (§3). `e4a780a` añade la corrección hallada en la prueba de coste con la candidata (§3.7), que **solo** convierte una excepción en partido completo: los partidos que ya terminaban son idénticos. |
| **P17** | `a3caed6` + `bc8b916` | Optimización exacta de A17 (§4) y corrección de un contador de workers (un comentario absorbía su incremento; lo detectó la suite). Mismas entradas y parámetros. |
| **C17-01 / C17-02** | filas en `data/match/motor17-candidates.json` (no forman parte del perfil efectivo) | Candidatas numéricas de la muestra de desarrollo (§6). |
| **R17** | **`fd75554`** (código de la campaña; `src/` y `data/` no cambian después, comprobado con `git diff`) + perfil efectivo MOTOR-17 con la candidata elegida (`…+SEM-MOTOR17-20261018+C17-02`) | Código y perfil propuestos para el cierre. La revisión A (`cbc1f22`) se descartó (§9). |

La rama de trabajo es `claude/busy-edison-b1fmnc` (la designada para esta sesión; contiene también MOTOR-15, 15B y 16, que **no están fusionados en `main`**: la PR de MOTOR-17 depende de ellos). Motor `beM-motor-0.17.0-MOTOR17`, aplicación `MOTOR-17`, export `beM-match-export/9` **sin cambio de esquema** (solo campos opcionales nuevos en los créditos `stl`: `fuente`, `contacto`), política `EST-MOTOR17-R1` / `ACTA-MOTOR17-R1`, registro esencial `ESE-MOTOR17-R1`, proyección de auditoría `PRJ-MOTOR17-R1`, dataset `POB-MOTOR11-R1` sin cambios, extensión `SEM-MOTOR17-20261018` (solo crédito estadístico; **SEM no es calibración validada**).

## 2. Inventario de hipótesis

Una hipótesis del análisis de ChatGPT no es un defecto confirmado: se comprobó cada causa antes de tocar nada.

| ID | Hipótesis (MOTOR-16) | Resultado | Evidencia y punto del código |
|---|---|---|---|
| H1 | El déficit de robos (2,2 por equipo) es de crédito | **Confirmada**: 60 de 133 pérdidas de seis partidos naturales eran vivas, con defensor resuelto y recuperación, sin crédito (7 con intento de intervención y 52 sin él; 1 sin defensor resuelto) | `actions.resolveTurnover`, `defense-actions.pressedAdvance`, `actions.resolveLooseBall`; criterio ahora único en `actions.liveStealCredit` |
| H2 | `stealAttemptGivenAccessP0` es demasiado bajo | **No sostenida como defecto**: tras completar el crédito la muestra pasa de 2,6 a 7,5 robos por equipo sin tocar ningún coeficiente | §3.1 |
| H3 | Nueve cadenas de saque sin cierre (AUD26) | **Confirmada, defecto del productor** (4 + 5 en tres lotes): una cadena entregada cuya posesión terminaba en falta/tiros libres/balón suelto, o se reanudaba con otro saque, no se cerraba | `throwin.closeOpenChain` (solo registro) |
| H4 | `team_index` vacío en el CSV individual | **Confirmada** en el aplanado rápido de MOTOR-16 (script de entrega, no del motor); el esencial no llevaba el índice explícito | `essential.lineByPlayer` (ahora `team_index`) y `scripts/m17-tables.js` |
| H5 | `matches` de la matriz de capacidades no pasa de dos | **Confirmada**: `M000001` local colisionaba entre lotes | `audit/analysis.capabilityMatrix`, `audit/project` (`global_attempt`) |
| H6 | Resúmenes AUD distintos entre CSV, informe y mensaje | **Confirmada** (mensaje escrito a mano): ahora `auditoria/resumen.json` sale de la misma ejecución | `audit/report.auditFiles` |
| H7 | 1.323 de 2.304 filas de sensibilidad sin tope registrado | **Confirmada**: la receta no registraba el tope aplicado | `core.recipe` y `states.defensiveReading` registran `tope`; `audit/analysis.sensitivity` separa exactas y aproximadas |
| H8 | Tres deltas de −0,0003 con incremento efectivo 0 | **Confirmada, redondeo del informe**: se comparaba la receta registrada (redondeada) con la reconstruida | `audit/analysis.sensitivity` |
| H9 | Trece jugadores no participan (once J02) | **Refutada como defecto**: J02 es el recurso «situacional» del plan natural (minutos base 0) y en ninguna de las 60 posiciones es la mejor opción de banquillo; la elegibilidad por función es la existente | §5 |
| H10 | El 85 % de las actuaciones de equipo tiene un jugador de 40:00 | **Confirmada como calibración, no como defecto de aplicación del plan**: el gasto de energía no produce fatiga observable (energía final media ≈82; nunca <30) | §5 y §6 |
| H11 | Pocos tiros/rebotes (reloj) y pocas faltas/libres | **No resuelta**: sin defecto demostrado; los datos por tipo de hecho (`15-RITMO-POR-TIPO-DE-HECHO.csv`) quedan para ChatGPT | §7 |
| H12 | eFG alto (≈60 %) | **No resuelta; sin ajuste**: las p0 de tiro y las capacidades de tiro medias de la población están en la referencia neutra (TEC01 15,9 frente a 16); intervienen la selección de oportunidades y una población de laboratorio con capacidades mentales y físicas altas | §7 |

## 3. Defectos confirmados y solución (A17)

### 3.1 Robos: un solo criterio (síntesis FIBA 2024 §7, verificada por ChatGPT el 18/10/2026; sin lectura directa de Claude)

Mapa de rutas (nombres físicos): A interacción organizada (`resolveTurnover`), B avance presionado (`pressedAdvance`), C envío forzado de saque (misma `resolveTurnover` desde `throwin`), D balón suelto (`resolveLooseBall`). Antes, solo el control del interceptor (sorteo `stealGivenTurnover`) o el balón suelto ganado acreditaban robo: la **pérdida viva recuperada sin crédito** (la ruta más frecuente) quedaba sin él.

`liveStealCredit({ team, icpt, attempt, recoverer, fuente })` aplica el criterio a las tres rutas con recuperación (A-viva, B-viva, D):

- con balón vivo y **intento de intervención resuelto**: el robo es del interceptor que inició el desvío, aunque recoja otro compañero;
- con balón vivo **sin intento previo** (error ofensivo) y defensor resuelto: recogida controlada → el recuperador;
- **sin defensor resuelto** (la recuperación sale del sorteo de recuperador), balón fuera, violación o falta ofensiva: **sin crédito** (no se fabrica un autor ni un contacto).

Es solo estadístico: no sortea, no cambia la transición, el origen de la posesión ni el estado. Se comprobó retirando el crédito (`tests/motor17.test.js` M17·1): mismos hechos, sorteos y marcador. Efecto medido en seis partidos naturales (R0 → A17): robos 31 → 90 (2,6 → 7,5 por equipo y partido, en la franja de las referencias ACB que cita el prompt, sin usarla como diana). **Interpretación de producto que conviene revisar:** acreditar la recogida controlada tras un error sin intervención es lo que dice la síntesis («incluso sin desplazamiento del defensor»), pero sube mucho el recuento; la regla está aislada en una función y es reversible.

Concilian evento, acta (ROB01: un robo por hecho y con pérdida rival), análisis, export y diagnóstico (`effects.robo`, `stats[].fuente|contacto`, `cadenaRobo`). Política `EST/ACTA-MOTOR17-R1`: los partidos anteriores no se reinterpretan. Consumidores del crédito: acta, caja, CSV/analítica y `analysis/offball.js` (solo lectura); **ningún consumidor de IA, estados o dirección** (comprobado: `origin: 'robo'` de la posesión siguiente no cambia).

### 3.2 Cadenas de saque sin cierre (H-AUD26-002)
Causa: `chainHook` cerraba la cadena solo con un tiro; una cadena entregada que terminaba en falta (con o sin tiros libres), balón suelto o con un nuevo saque en la misma posesión quedaba `abierta`. `closeOpenChain` cierra por registro, con la causa del último hecho de la posesión, al terminar la posesión (`endPossession`) o al abrir otra cadena. La producción directa (que sigue al `chainHook`) no cambia. Las 26 interrupciones legítimas por bocina siguen siendo `interrumpida`. Antes/después sobre los tres lotes afectados: 9 → 0 cadenas abiertas, hechos y sorteos idénticos (`out/motor17/evidencia/cadenas-antes-despues.json`). Regresión: M17·2 (EQ03–EQ10, semilla 1).

### 3.3 Identidades, CSV y resúmenes
Identidad global = lote|intento (en el paquete el `batch_id` de cada fila) y decisión = global|decisión; el contraste B selecciona y deduplica contextos con ella (M17·3). `essential.lineByPlayer` publica `team_index` desde la pertenencia real a la entrada (M17·4: también con dos copias). `auditoria/resumen.json` es la fuente de los recuentos.

### 3.4 Sensibilidad de las 32 capacidades
El término de cada receta registra el tope aplicado; `sensitivity` evalúa antes y después la operación pura con ese tope (exacta) y solo recurre a la brecha base−efectiva sin tope en evidencia histórica (`exactitud: aproximada`, columnas aparte). Con incremento efectivo 0 el cambio es exactamente 0; una penalización de decisión ya aplicada (presión sobre MEN03) se mantiene fija. La magnitud consumida solo se calcula para las siete capacidades con salida real (TEC17/TEC18, MEN02/MEN03, MEN06/MEN07, FIS06: probabilidad de elección, penalización, variación y gasto); para las demás `delta` es el cambio de la **entrada** de la operación final y así se rotula (`magnitud`, `unidad`), **no** «puntos de partido». Límite declarado: no se construyó otro evaluador deportivo.

### 3.5 Lo que no se tocó
`stealAttemptGivenAccessP0`, `stealGivenTurnover`, pesos de pérdida, estilos, `base.looseBall`, capacidades de la población y cualquier coeficiente del perfil efectivo (`checkMotor17` lo exige).

### 3.6 Versiones
`SEM-MOTOR17-20261018` solo sustituye `statsPolicy.*` y añade la fuente M17-01. `data/match/motor17-candidates.json` va aparte (catálogo con su SHA-256).

### 3.7 Defecto hallado con la candidata: responsabilidad obsoleta tras un relevo en la posesión
La prueba de coste con C17-02 abortó un partido de cien (EQ09–EQ10, semilla 310000057): tras un relevo en un balón muerto de la misma posesión, `poss.cur` conserva a un atacante que ya salió y `ref.fnMap` no lo conoce; `helpCandidates` leía `functions[undefined].access`. Con más rotación aparece una vez en cien; con la base y C17-01 no apareció en 594 partidos del barrido técnico previo (400000001…400000198, fuera de los espacios de cierre). Corrección mínima: esa responsabilidad se sustituye por la vigente de la referencia (`liveResponsibilityOf`); sin atacante obsoleto el cálculo es idéntico (A17 = e4a780a en los 24 partidos de equivalencia). Regresión: M17·6. Tras la corrección: 198/198 válidos con cada perfil (base, C17-01, C17-02).

## 4. Rendimiento del mismo motor (P17)

Perfil de CPU plano (≈10 puntos con ≥ 4 %): evaluación de las fichas por posesión (`eligiblePlays`/`assignRoles` 16–21 %), referencia defensiva (`defRef` 8–14 %), salidas (`scoreExits`/`buildExits` 8 %), entrenador (`coachView` 6 %) y huella/validación (≈10 %). Solo se aplicaron cambios **exactos**, comprobados contra A17 con `scripts/m17-equivalence-p17.js`:

- `bestAssignment`: poda por cota superior exacta (margen 1e‑9 ≫ 1e‑12 del desempate) solo sin rastreo de parámetros;
- `assignRoles` en seco memorizado por encuentro (función pura de ficha, director, disposición, jugadores en pista y disponibles; no con contexto de negación ni con rastreo);
- `defRef`: la clave se compara por componentes, sin construir una cadena por consulta;
- `canonicalJson` sin asignaciones intermedias (mismo texto exacto) y una sola evaluación de candidatos por función;
- workers con generación joven mayor (parámetro de ejecución).

Con `full` el orden de primera consulta numera las filas de `params`, de modo que las dos optimizaciones que lo alterarían quedan desactivadas con rastreo: el diagnóstico completo es **idéntico byte a byte** al de A17 (comprobado). Resultado medido de la optimización (A17f = código final con P17 revertido, mismo perfil base; salida idéntica): **31,6 s → 29,3 s de media (≈ −7 %)** en cuatro pasadas alternadas de cien partidos con cuatro workers; la primera medida aislada dio −16 %, que la repetición no reproduce (variación del entorno de ±10 %). Equivalencia exacta: 8 entradas de desarrollo × 2 versiones × 2 niveles de registro (completo y mínimo), `calc`/`params` incluidos. **Objetivo de cien en cinco segundos: no alcanzado** en este entorno; el coste pendiente es el declarado, sin segundo motor ni cambio del alcance. Coste real de R0 y R17 (cien y doscientos, proceso nuevo, fases y memoria): [`evidencia-motor17/RESUMEN-OPERATIVO.md`](evidencia-motor17/RESUMEN-OPERATIVO.md) §7.

## 5. Rotaciones, director y energía (diagnóstico dirigido)

- **Aplicación del plan y ventanas**: sin defecto. `decideRotation` propone cuando hay motivo (energía ≤ umbral, tramo largo, protección de faltas, cierre, participación) y acepta un relevo si su utilidad no es inferior (fatiga, energía crítica, faltas) o es mayor en la ventaja mínima (tramo largo y participación). La histéresis (tramo mínimo en pista/banquillo, reentrada bloqueada) y las ventanas reglamentarias funcionan como documenta el funcional (16.1).
- **El plan natural no es el reparto 28/12 observado**: en 39 de los 60 pares titular/relevo de los doce equipos el relevo tiene mayor utilidad de posición con energía 100 (brecha mediana titular−relevo −0,8; p10 −1,8; p90 +3,4); por eso quien juega más es el mejor de su puesto y su compañero apenas entra. Esto es coherente con «los minutos son una intención» y con el caso E = 30, no es un defecto.
- **J02**: recurso situacional del plan natural (`participation.situational`), minutos base 0; en ninguna de las 60 combinaciones equipo×puesto es la mejor opción de banquillo. DNP válido: no se obliga a nadie a jugar.
- **Energía**: con `costPerLiveMinute = 2` la energía final media es ≈82, ninguna actuación baja de 30 y el entrenador (revisión por fatiga ≤ 45) casi nunca la ve: un jugador de 40:00 por equipo es lo esperable. La curva de severidad es la acordada (100–70 casi neutral; deterioro sensible bajo 10 según tarea): lo que falta es **exposición** a ella (coincide con AUD17 «inconcluso/insuficiente» de MOTOR-16).

## 6. Candidatas (muestra de desarrollo §13.1)

24 encuentros por perfil, `seed_dev = 210000000 + 1000·d + r`, mismas entradas (`out/motor17/desarrollo/`, `scripts/m17-dev.js`). **Una sola fila por candidata, una sola causa (gasto)**: no se tocan a la vez umbral de revisión, recuperación ni sacrificio de utilidad del relevo, para no contar dos veces la misma fatiga. Probado y descartado como palanca: `fatigueUtilitySacrifice` 1→2 (con coste 3: 40:00 del 17,4 % → 17,4 %) y `benchRecoveryPerLiveMinute` 1,5→1 (17,5 % → 20,5 %): sin efecto apreciable.

| Fila (Panel) | Base | C17-01 | C17-02 | Unidad · consumidor |
|---|---|---|---|---|
| `energy.costPerLiveMinute` | 2 | **3** | **3,5** | energía por minuto de juego en pista · `MatchCore.consume` y `receta:gasto_resistencia` |

| Muestra de desarrollo (24 encuentros) | P17 base | C17-01 | C17-02 |
|---|---:|---:|---:|
| Energía final media de los jugadores | 82,4 | 72,2 | 67,5 |
| Actuaciones de jugador con energía final < 30 / < 10 | 0 % / 0 % | 8,7 % / 0,2 % | 14,1 % / 1,2 % |
| Actuaciones de equipo con un jugador de 40:00 exactos | 87,5 % | 17,5 % | 0 % |
| Minutos del jugador con más minutos (media por equipo) | 39,8 | 37,2 | 34,5 |
| Jugador sin participar (de 576 actuaciones) | 163 | 103 | 101 |
| Puntos por equipo / eFG | 82,1 / 59,1 % | 85,7 / 60,0 % | 84,0 / 60,5 % |

La muestra es pequeña (24 encuentros por perfil): no demuestra efectos pequeños y los puntos no deben leerse como efecto. Son propuestas cuantificadas **sin aceptación deportiva**.

### 6.1 Selección para el cierre (congelada antes de ejecutar la auditoría)
Criterios técnicos fijados antes: (a) quitar la concentración extrema sin imponer minutos máximos (que los titulares lleguen a la zona de deterioro con el reparto del plan), (b) producir exposición al régimen de energía baja que AUD17 pide, (c) no degradar la validez técnica (198/198 con cada perfil en el barrido previo) y (d) sin mirar marcadores ni las semillas de cierre. **C17-02** cumple (a) y (b) con 0 % de 40:00 y ≈1 % de actuaciones con energía < 10; C17-01 deja el 17,5 % de 40:00. Por tanto R17 = código final + `SEM-MOTOR17-20261018` + C17-02. La base corregida y optimizada sin ajuste numérico (P17) queda disponible como control: su efecto aislado se compara con A17/P17.

## 7. Oportunidad, conversión, reloj y faltas
Sin defecto demostrado ni candidata: p0 de tiro 0,35 (triple), 0,39 (media), 0,56 (interior), 0,64 (aro); medias de la población en TEC01–TEC04 próximas a la referencia neutra 16 y capacidades mentales/físicas altas (MEN ≈ 19–21, FIS06/07 ≈ 21). Faltas y acceso defensivo: tras completar el crédito ya no hay un déficit de robos atribuible a acceso/intento/control. Las tablas por sector, preparación, oposición, capacidad efectiva, tiempos consumidos y familia están en la evidencia de cierre (`14-TIROS-DIAGNOSTICOS.csv`, `15-RITMO-POR-TIPO-DE-HECHO.csv`) para el análisis externo. **Calibración externa pendiente**: no se midió contra ninguna referencia (ni se inventaron medias de FIBA/Euroliga).

## 8. Compatibilidad
- **Leer/consultar** un export o un lote anterior: sí (formato `export/9`; el esencial `ESE-MOTOR15-R1` no tiene `team_index` explícito y se lee por `team`; paquetes históricos intactos).
- **Analizar**: el lector `PRJ-MOTOR17-R1` extrae otros conteos de los mismos archivos (matches globales, contextos sin colisión, tope exacto cuando existe): para R0 se conservan **dos lecturas** (lector R0 y lector R17) identificadas por versión.
- **Reproducir/continuar**: solo con el mismo motor (`beM-motor-0.17.0-MOTOR17`); un guardado o export de otro motor se rechaza con motivo y el archivo queda intacto (`validateSnapshot`, `replay`). R0 se ejecuta en su worktree aislado para las comparaciones.
- Perfiles antiguos abren el Panel con la tarjeta de compatibilidad existente (sin `profile.coach.policies`); la activación de la base o de una candidata es siempre explícita.

## 9. Campaña de cierre `MOTOR17-CIERRE-20261018`
Identidad externa de campaña, no versión deportiva. 224 ejecuciones de comparación por versión (A 132, B 48, C 24, D 20) y 12 repeticiones diagnósticas por versión (selección previa al resultado), más 600 de coste; todas terminadas y válidas, sin fallos ni reintentos; cada diagnóstico repite exactamente el marcador, los sorteos y los hechos de su principal. Cantidades, resultados, auditorías (AUD01–32 por versión, nunca mezcladas, con las dos lecturas de R0), coste y comprobaciones salen de los archivos finales: [`evidencia-motor17/RESUMEN-OPERATIVO.md`](evidencia-motor17/RESUMEN-OPERATIVO.md).

- **Declaración de semillas**: el espacio de A del prompt (270000000) se usó en lecturas exploratorias de R0 durante el desarrollo (embudo de pérdidas y reparto de minutos con las semillas 270001001…270024001; ninguna decisión de candidata se tomó con ellas); se **cambió** el espacio de A a `271000000 + 1000·p + 1` antes de abrir resultados. B, C y D conservan las fórmulas del prompt; el barrido técnico previo usó 400000001…400000198.
- **Revisión B de R17**: tras abrir la primera pasada (revisión A, `cbc1f22`) se comprobó que la sensibilidad de MEN02/MEN03 y FIS06 —nombradas en §7.2 del prompt— seguía aproximada (150 de 2.304 filas). Se registró el `tope` en su punto de consumo (solo diagnóstico `calc`; trayectorias idénticas: mismo digest de resultados en los benchmarks) y se **re-ejecutó todo R17** (campaña, diagnósticos, paquetes, auditoría y coste). La primera pasada se conserva identificada fuera del paquete y no se usa. R0 no cambió.
- **Referencia histórica 20261016** (entradas de MOTOR-10, ver `09-EQUIVALENCIA/referencia-20261016.json`): R0 83–98 (6.684 sorteos), base P17 83–98 (6.684), R17 con C17-02 97–83 (6.506) — observada, no una diana; con la candidata el partido cambia como cabe esperar al cambiar la energía.
- **Medidas de coste**: cada trabajo de versión/tamaño parte de un proceso nuevo con cuatro workers efectivos; las tres medidas repetidas de cada trabajo y su variación (±10 %) están en `coste/repeticiones.json`.

## 10. Límites y pendientes
- Objetivo de coste de 5 s para cien: **no alcanzado**.
- Candidatas numéricas: propuestas sin aceptación; calibración externa pendiente.
- Interpretación de producto del crédito de recogida sin intervención: revisable (función aislada).
- Sin lectura directa de FIBA por Claude; síntesis de ChatGPT.
- Recorrido manual de Dennis (MOTOR-08…17) y Node 24/otros navegadores: no ejecutados.
- La magnitud consumida por la sensibilidad solo se calcula para las siete capacidades con salida real.
- Con dos semillas por mecanismo/familia la campaña no certifica efectos universales; las repeticiones técnicas no amplían la muestra deportiva.
