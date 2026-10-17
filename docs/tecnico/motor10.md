# Implementación de MOTOR-10 (análisis, estadísticas, resumen e información)

Documento técnico de lo realmente implementado. Encargo archivado: [`../prompts/MOTOR-10-analisis-estadisticas-y-resumen.md`](../prompts/MOTOR-10-analisis-estadisticas-y-resumen.md). Recorrido manual: [`../prompts/MOTOR-10-recorrido-manual.md`](../prompts/MOTOR-10-recorrido-manual.md).

> **Naturaleza de la entrega.** MOTOR-10 es un **lector del partido**: construye consultas, informes, resumen y exportación sobre los hechos y el acta que MOTOR-09 ya produce. **No cambia el deporte, ni el acta, ni el azar, ni el formato de exportación.** La referencia `20261016` sigue dando **83–103** con **6 505 sorteos deportivos**, idéntica a la de MOTOR-09.

## 1. Base de trabajo

| Dato | Valor |
|---|---|
| Rama de trabajo | `claude/busy-edison-b1fmnc` (designada por el entorno; el encargo proponía `feature/MOTOR-10-analisis-y-resumen`). La rama tenía solo historia ya fusionada (PR #10), así que se rehízo desde `origin/main` con `git checkout -B` sin reiniciar nada ajeno: no se apilaron commits sobre historia fusionada. |
| Commit base efectivo | `51c8f7a` («Merge pull request #10 … MOTOR-09»). |
| MOTOR-09 comprobado por su código, no por el informe | Presentes en `main`: `src/match/acta.js`, `regs.js`, `reconcile.js`, `revisions.js`, `cases.js`, `memory-report.js`, `data/match/motor09-seed-extension.json`, `tests/motor09.test.js`, `docs/tecnico/motor09.md`, `export/8`. |

Contraste del informe recibido (qué comprobó Claude **en esta sesión** y qué no):

| Afirmación del informe | Comprobado por Claude |
|---|---|
| 131 pruebas, trece nuevas en MOTOR-09 | **Sí**: `npm test` → 131 pasan, 0 fallos (antes de tocar nada). |
| `data:check` y comprobación documental correctos | **Sí** (`npm run data:check`, `python3 scripts/docs/check_engine_docs.py`). |
| Referencia `20261016`: 83–103 | **Sí** (`scripts/run-match.js`: 83–103, 539 acontecimientos, 140 posesiones). |
| Perfil `+SEM-MOTOR09-20261016` y `export/8` | **Sí** (identidad del perfil y `schema: beM-match-export/8` en el JSON). |
| Cinco partidos de integración conciliados y quinto reproducido idéntico | **Sí**, con el script nuevo `scripts/integration-motor10.js` (misma serie de marcadores: 83–103, 89–95, 80–85, 124–92, 85–108). |
| Acta reconstruida desde hechos, 33 conciliaciones | **Sí**: `reconciliation.total = 33`, válida en los cinco partidos. |
| Recorridos manuales de MOTOR-08 y MOTOR-09 | **Siguen pendientes de Dennis.** |

## 2. Versiones y contratos

| Componente | Valor | Cambia en MOTOR-10 |
|---|---|---|
| Motor | `beM-motor-0.9.0-MOTOR09` | **No** (no hay cambio deportivo). |
| Exportación del encuentro | `beM-match-export/8` | **No**: el contrato necesario no cambia. Los archivos `export/8` existentes siguen siendo reproducibles. |
| Política de acta/créditos | `ACTA-MOTOR09-R1` | **No** (ver §6). |
| Perfil efectivo | `…+SEM-MOTOR09-20261016+SEM-MOTOR10-20261016` | **Sí**: añade solo la tabla `analysis`. |
| Política analítica | `ANA-MOTOR10-R1` | Nueva. Cambia sin tocar el deporte. |
| Conciliación analítica | `RECAN-MOTOR10-R1` | Nueva (23 comprobaciones). |
| Exportación analítica | `beM-analysis-export/1` | Nueva (lectura; distinta del export reproducible). |

**Equivalencia deportiva comprobada.** El hash `sportsProjection` de la referencia cambió respecto de `baseline-motor09.json` **solo** porque cada decisión del entrenador lleva en su versión el identificador del perfil efectivo (que ahora termina en `+SEM-MOTOR10-20261016`). Se verificó con un perfil sin la extensión: eventos, marcador, parciales, caja, acta, posesiones, órdenes, comandos, estados, episodios y memoria son **idénticos**; también los sorteos (6 505). Se archivó `tests/fixtures/baseline-motor10.json` con el hash nuevo y el mismo marcador.

**Perfil sin tabla `analysis`.** Las filas `analysis.*` se declaran `optional`: un perfil anterior (por ejemplo, el embebido en un `export/8` de MOTOR-09) sigue siendo completo, puede jugar y reproducirse. El análisis usa entonces los valores por defecto del código y lo identifica («por defecto del código»). El panel ofrece **«Activar la base de MOTOR-10»** (activación explícita, nada se migra en silencio).

## 3. Mapa de requisitos a código, datos e interfaz

| Requisito | Código | Datos / tablas | Interfaz |
|---|---|---|---|
| §5 contrato de consultas y métricas | `src/analysis/catalog.js` (26 indicadores con definición completa), `formulas.js`, `facts.js` (tres capas de información), `index.js` (memoización por partido, audiencia, equipo y filtros) | `analysis` del perfil | Panel › Estadística e información (catálogo); Análisis › Diagnóstico |
| §6 fórmulas | `formulas.js`, `catalog.js` (`playerIndicators`) | `analysis.conventions.ftCoefficient` | Análisis › Acta y comparación |
| §7 evolución, parciales, final ajustado | `evolution.js` | `analysis.adjustedFinal`, `analysis.summary.unansweredMin` | Análisis › Evolución |
| §8 mapa y calidad | `shooting.js` (`sectorMap`, `qualityTable`) | — | Análisis › Tiro y calidad |
| §9 ataque, ejecuciones, libro, director | `offense.js` | — | Análisis › Ataque |
| §10 defensa, coberturas, ayuda, responsabilidades | `defense.js` | — | Análisis › Defensa |
| §11 saques y situaciones especiales | `restarts.js` | — | Análisis › Defensa (saques y faltas) |
| §12 sin balón | `offball.js` | — | Análisis › Ataque |
| §13 quintetos, grupos, on/off | `presence.js` | `analysis.sample.lineup*` | Análisis › Rotaciones y quintetos |
| §14 filtros y antes/después | `filters.js`, `orders.js` | `analysis.beforeAfter.attacks` | Barra de filtros; Informes |
| §15–§16 resumen, claves, líderes, crónica | `summary.js` | `analysis.summary.*` | Análisis › Resumen |
| §17.5 recomendaciones | `recommend.js` | `analysis.recommendations` | Análisis › Informes |
| §18 visibilidad | `facts.js` (`viewShot`, `allowed`), `visibility.js`, cada consulta con `ctx` | — | Selector de audiencia; Diagnóstico |
| §19 tablas administrables | `src/profiles/rows-motor10.js` (23 filas `optional`), `groups.js` (EST03–EST08 → MOTOR-10) | `data/match/motor10-seed-extension.json` | Panel › Estadística e información |
| §20 export | `export.js` | — | Análisis › Exportar |
| Conciliación | `reconcile.js` | — | Análisis › Diagnóstico |

## 4. Matriz de cobertura heredada y pendientes (§4)

`src/analysis/coverage.js` conserva la matriz normativa de MOTOR-09 clasificada en cinco categorías distintas (acreditada solo contra el encargo; convención beM/heredada/provisional; administración preparada pero no natural; campo no registrado o no implementado; ejecución inválida, parcial o administrativa) y **no** equipara una conciliación correcta con conformidad normativa: «Todas las conciliaciones pasan» prueba consistencia, no cumplimiento. Ninguna fila es lectura directa del PDF de FIBA (HTTP 403 en MOTOR-09); se conserva la procedencia declarada sin borrar su historial. Se muestra en Análisis › Diagnóstico.

Tres listas separadas (§22.2):

1. **Deuda de MOTOR-09** (`DEBT_MOTOR09`): contraste con PDF; técnicas/antideportivas 2026; compensación y art. 45; inferioridad natural, umbral y terminación; tiro en vuelo e interferencia; persistencia de suspensión; política de asistencias sin auditar el PDF.
2. **MOTOR-10** (`PENDING_MOTOR10`): lateralidad del mapa; organización defensiva efectiva por hecho; ocupación que limita ayuda y disponibilidad de corte; estado propio visible con exposición temporal; estados de asistencia «continuación de ventaja» y «desviación»; recomendaciones distintas de REC10-01/02.
3. **Entregas posteriores**: MOTOR-11 (población), MOTOR-12 (lotes, ZIP), calibración, historial/temporada/percentiles.

Una ejecución natural con menos de cinco elegibles falla con diagnóstico (ejecución inválida): `summary()` no produce una crónica de victoria si el acta no es definitiva o hay resultado adjudicado (comprobado en el grupo 10 con un parcial).

## 5. Contrato de universos, exclusiones, muestras y fórmulas

- **Resultado de una consulta** (`runIndicator`): valor, numerador, denominador, unidad, universo, filtros, muestra (`n` y aviso), exclusiones, cobertura, motivo y versiones (`analysis`, indicador, acta, política). Sin denominador válido: `value = null` con motivo (`—`), nunca 0, infinito ni NaN.
- **Agregación**: `pooled` = suma(numeradores)/suma(denominadores). Redondeo solo de presentación; las comparaciones usan precisión completa.
- **Hechos, unidades y tramos**: cada vista declara qué filtra. `filterCompat` explica la incompatibilidad (un filtro de tiros no habilita PPP, F ni ORtg: «usa el partido completo»).
- **Aviso de muestra**: menos de 5 observaciones muestran aviso sin ocultar conteos (editorial SEM, no significación estadística).
- **Fórmulas del §6.2** (id de catálogo): TC/T2/T3 %, TL % (`TC_PCT`…), eFG (`EFG`), TS estimado (`TS`), frecuencia de triple (`FREQ3`), libres por tiro (`FT_PER_FG`), puntos de campo por intento (`FGPPA`), puntos por F (`PTS_F`), canastas asistidas (`AST_PCT`, solo AS-C), ORtg/DRtg/NetRtg (`ORTG`, `DRTG`, `NETRTG`, con los ataques de **cada** equipo), ritmo con prórroga (`PACE`), PER por 100 ataques exacto y TOV % convencional (`PER100`, `TOV_CONV`, nombres distintos), posesiones estimadas, RO/RD % de acta, REC por 100 ataques rivales, tapones sobre tiros rivales (universo declarado), X por 40, AS/PER (sin ratio con PER = 0), USG estimado, cuota de F, cuota de rebote. **No implementadas**: «cuota de cierres» (no hay productor del cierre individual) y «producción por 100 en presencia completa» (la tasa estable ORtg/DRtg del grupo es lo más próximo; no se ofrece la formulación por créditos). «Rebote por oportunidad» solo en diagnóstico. Historia/temporada: dependiente de datos.
- **Cuatro factores**: eFG, pérdidas (las dos versiones, con nombres y denominadores distintos), rebote ofensivo y libres.

## 6. Asistencias: política confirmada y fuente

El criterio verificable procede del **extracto de ChatGPT** del encargo (FIBA Statisticians' Manual 2024, cap. 6). **Claude no abrió el PDF** (el entorno devolvió HTTP 403 en MOTOR-09 y no se reintentó una lectura directa): no es lectura directa ni auditoría completa del manual.

Auditoría contra los estados funcionales reales (`assistState`): recepción interior, recepción exterior sin bote, creación nueva con movimiento (no acredita), serie elegible (una asistencia por serie con al menos un libre convertido) y sin pase final. **El acta no cambia**: la política de MOTOR-09 (`requiresDirectContinuation`, un único candidato, una por serie) ya implementa esos estados; la capa analítica solo los clasifica y los expone. Un fallo con falta y ningún libre convertido invalida el candidato (test 3). El 75 % de canastas asistidas de la referencia (25/33 del equipo EQ01) **no** se trata como objetivo ni como error; el porcentaje usa solo AS-C y las canastas elegibles y no se impone AS ≤ FGM. No representados: «continuación de ventaja» y «desviación» (dependen de un productor que no existe; en `PENDING_MOTOR10`).

## 7. Origen, ejecuciones, F, locales y administrativos

- **Origen principal** (`possessionOrigin`): primera acción ofensiva significativa realmente iniciada; si el ataque se interrumpió antes, «interrumpido». Decisión directa y recurso autónomo llevan su código ESP; una decisión directa tras bote **no** se rotula aclarado. Para la audiencia sin permiso propio, la procedencia (libro/directa/autónomo) no se nombra: solo «Acción · …».
- **Ejecuciones**: una fila por interacción resuelta. «% de ejecuciones» (denominador ejecuciones) y «% de posesiones donde aparece» (admite solapamiento) son lecturas distintas; el resultado local no es el futuro de la cadena y no se suma al total (test 4).
- **F y administrativos**: las particiones por tipo y por origen suman el mismo total; el bonus es sanción, no F; los puntos administrativos sin vínculo a posesión quedan fuera de todo PPP y se muestran aparte (test 2).
- **Etiquetas de contexto** (pintura, banquillo, tras pérdida, transición beM, segunda oportunidad, con cadena de saque, final de reloj de posesión): se solapan, se declara y **no** se suman para explicar el margen. «Contrataque de convención externa»: no se renombra la transición beM.

## 8. Presencia, completas, mixtas y on/off

`unitStatus` clasifica cada posesión para un grupo: **completa** (todo el grupo presente y sin salida), **mixta** (cruza una entrada/salida pertinente), **ausente** (para «sin») o **parcial** (algunos miembros; excluida y contada). Una pareja permanece aunque un tercero cambie (test 5). Los puntos de presencia (`pointEvents[].on`) y el tiempo (`durationTenths` por evento) se leen aparte de las tasas estables (puntos vinculados a posesiones completas): no se dividen todos los puntos de presencia entre las completas. Una sustitución legal entre libres reparte los puntos del antes y el después, no suma tiempo y vuelve mixta la posesión. La diferencia con/sin es **observada**, con la misma definición en ambos lados; sin exposición completa en una mitad no hay diferencia finita (no un 0). Los administrativos durante la presencia se muestran aparte. Conciliación: Σ minutos de quintetos = tiempo total; Σ puntos a favor por quintetos = puntos de cancha del equipo; completas + mixtas cubren cada posesión una vez.

## 9. Sin balón (instrumentación realmente conservada)

`offball.js` deriva las aportaciones de hechos que **ya** conservan su efecto: pantalla útil y canasta tras pantalla (bloqueador presente + contexto favorable), cortes utilizados, desmarque útil, continuación/apertura, ayuda pertinente, recuperación de responsabilidad (relevo y su llegada), seguimiento de pantalla, cierre útil (captura por un cargador asignado por el encargo de rebote), desvío sin recuperación (intento de robo sin control) y disputa recuperada. «Utilidad» = contexto favorable registrado (cómoda o ventana libre), no el acierto (test 7). **No se modificó ningún productor** (sin riesgo para el azar). Dependencias declaradas, no rellenadas con cero: OB05 «ocupación que limita ayuda» y la disponibilidad de corte (el cálculo de ayuda y las opciones de corte no guardan esos hechos).

## 10. Resumen, claves, líderes y relato

- **Candidatos** con ID de regla, categoría editorial, sujeto, texto con valores de las consultas, muestra, versión y evidencia (IDs + consulta reproducible): `SUM-P01…P05` (producción), `SUM-E01…E03` (evolución), `SUM-T01…T04` (táctica: cobertura con cambio no completado, calidad previa, quinteto con exposición suficiente, saque directo concreto). Familias de director/libro, respuesta defensiva ante repetición y rotación **no** generan candidato en esta entrega.
- **Selección SEM** (`selectKeys`): una clave de producción, una de evolución y una de táctica si hay evidencia; completar con otro candidato no redundante; menos de tres si no hay más; desempate por prioridad declarada, criterio homogéneo (puntos con puntos) e ID. Redundancia por grupo explícito y por solapamiento de evidencia (≥ 60 % del conjunto menor).
- **Líderes** por puntos, rebotes, asistencias, VAL y recuperaciones+tapones, con empates conservados.
- **Crónica por periodo** usa solo hechos hasta el cierre de su periodo (cumulativo hasta ahí); un parcial `chronicleKind = 'parcial'` (test 10).
- Textos deterministas por plantilla; sin LLM, API externa ni dependencia nueva.

## 11. Matriz de visibilidad por consultas, textos y exports

Tres niveles por hecho (`pub`, `own`, `diag`) y audiencias `public`, `own` (equipo de perspectiva) y `diagnostic`. La audiencia se aplica **al construir la vista** (`viewShot`), antes de filtros, resumen, recomendaciones y exportación; la caché incluye audiencia y equipo. Matriz completa en [`src/analysis/visibility.js`](../../src/analysis/visibility.js) y en Análisis › Diagnóstico. Resumen: público/rival = hechos, acta, acciones y coberturas ejecutadas, categoría de calidad (nunca la probabilidad); propia = además procedencia, prioridad, director, disposición y ficha **del equipo propio**; diagnóstico = probabilidades exactas y rebote por oportunidad. Un filtro propio sobre información no autorizada no selecciona nada y lo advierte. Las recomendaciones con alternativa propia no se usan en la vista pública. El test 9 comprueba que cambiar solo prioridad, ficha y probabilidades ocultas del rival no cambia el JSON público ni el Markdown propio.

## 12. Contratos, formato y compatibilidad

`export/8` no cambia (§2). La exportación analítica es otro contrato: JSON `beM-analysis-export/1` (metadatos, cobertura, indicadores con numerador/denominador, filtros, unidades, versiones, evidencia, secciones), CSV por tabla (indicadores, sectores, origen, quintetos, evolución) con filas de «sin vínculo» y contexto, y Markdown. Reutilizable por MOTOR-12 (mismas consultas sobre varios resultados); el ZIP masivo **no** se construye. El diagnóstico se descarga identificado (`diagnosticExport: true`).

## 13. Comprobaciones ejecutadas

| Qué | Resultado |
|---|---|
| `npm test` | **141** pruebas, 0 fallos (131 de la base + 10 nuevas en `tests/motor10.test.js`). |
| `npm run data:check` | Correcto (incluye `SEM-MOTOR10-20261016`: parámetros del encargo literales). |
| `python3 scripts/docs/check_engine_docs.py` | Correcto. |
| `scripts/integration-motor10.js` | Cinco partidos: 83–103, 89–95, 80–85, 124–92, 85–108; los cinco con acta `válida` y análisis `válida` (23 comprobaciones cada uno); lectura sin efectos; el quinto reproducido idéntico. |
| Chromium (Playwright, automatizado) | Partido completo en la UI, apertura del análisis y recorrido de los diez grupos de vistas, filtro combinado con aviso de incompatibilidad, cambio de audiencia, descarga de JSON y Markdown. Sin errores de consola. **No** es un recorrido humano: ver el [manual](../prompts/MOTOR-10-recorrido-manual.md). |

Los diez grupos de `tests/motor10.test.js`: (1) fórmulas, unidades, denominador cero y agregación ponderada; (2) posesión, F y administrativos; (3) asistencias; (4) origen y ejecuciones; (5) presencia y on/off; (6) evolución, final ajustado y antes/después; (7) mapa, calidad y sin balón; (8) resumen y revisión; (9) permisos; (10) lectores sin efectos. No hay un test por celda ni snapshots de frases.

## 14. `DECISIÓN REQUERIDA` y límites

No hay decisiones deportivas nuevas. Quedan, sin cerrar y sin presentarse como decisión aceptada por Dennis:

- **Lateralidad del mapa**: ¿se desea registrar el lado del tiro (productor nuevo) para llenar Z03–Z10? Consecuencia: instrumentar el hecho de tiro sin cambiar probabilidades; hoy el mapa solo tiene la resolución real.
- **Estados de asistencia «continuación de ventaja» y «desviación»**: requieren un productor que indique si el receptor creó una ventaja nueva y si hubo desvío. Hoy un receptor con movimiento propio no recibe asistencia.
- **Organización defensiva por hecho** y **OB05/disponibilidad de corte**: son hechos compactos nuevos en el productor (sin tiradas), listados como pendientes de MOTOR-10.

Límites: nada calibrado; los umbrales del resumen son SEM editoriales; el estado propio visible no se ofrece como filtro (su exposición temporal no se conserva); las consultas no ven historial, temporada ni percentiles (no existen).
