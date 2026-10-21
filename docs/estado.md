# Estado del proyecto

Fotografía breve y actual (no es un changelog; ver [`../CHANGELOG.md`](../CHANGELOG.md)). Última actualización: 2026-10-21, entrega MOTOR-17B.

## Qué hay realmente en el repositorio

- **Documentación y normas**: [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), índices, registro de decisiones y catálogo de prompts.
- **Diseño funcional del motor y del primer laboratorio**, organizado por temas en [`motor/`](motor/README.md) (34 capítulos). Es **especificación**: está *definida*, no implementada.
- **Copia original congelada** del funcional unificado y **exportado completo vigente** generado: ver [`historico/`](historico/README.md) y [`exportados/`](exportados/README.md).
- **Utilidades documentales** en `scripts/docs/` (Python 3, librería estándar).

## MOTOR-17B (ejecutado; cierre técnico y auditoría acotada; pendiente de Dennis)

- **Qué es**: cierra los pendientes concretos de la revisión independiente de MOTOR-17 (B17-01…05) sobre la misma base del partido, sin cambiar ningún coeficiente deportivo. Parte de `main` (la PR de MOTOR-17 estaba fusionada) en la rama `claude/busy-edison-b1fmnc`; PR propia, sin fusionar. Detalle: [`tecnico/motor17b.md`](tecnico/motor17b.md) · [evidencia](tecnico/evidencia-motor17b/00-LEEME.md) · [recorrido manual](prompts/MOTOR-17B-recorrido-manual.md).
- **Existe**: `defense_org` del registro esencial = código de la organización efectiva vigente antes de cada hecho (`ESE-MOTOR17B-R1`; un esencial anterior se declara histórico); contraste +1/+3/+5 de las 32 capacidades hasta la salida de la operación real con funciones puras **compartidas con el productor** (`src/match/formulas.js`, `src/audit/consumers.js`); AUD05 con estado y motivos derivados de la evidencia (exposición, registro y contraste separados); criterio y procedencia únicos del crédito de robo, también para la recogida controlada sin interceptor previo (`EST/ACTA-MOTOR17B-R1`, `SEM-MOTOR17B-20261021`; solo estadístico); campaña congelada `MOTOR17B-CIERRE-20261021` (30 casos lógicos, 72 ejecuciones planificadas; CONTROL17 = `01c8ade`), paquetes y recibo de verificación **fuera de los ZIP**, comprobador `scripts/m17b-verify-delivery.py` y descarga real desde la vista **Cierre** (seis ejes).
- **Versiones**: aplicación `MOTOR-17B`, motor `0.17.1-MOTOR17B`, export `beM-match-export/9` sin cambio de esquema. Referencia `20261016` con P0: 83–98 y 6.684 sorteos, sin cambio.
- **Perfiles**: P0 (gasto por minuto vivo 2) y P1 = P0 + C17-02 (3,5): **referencia provisional, no calibración ni aceptación manual**. Los perfiles de Dennis no se migran ni activan en silencio.
- **Cifras reales y estado de cada comprobación** (comprobado por Claude · pendiente de Dennis · no ejecutado): [`tecnico/evidencia-motor17b/RESUMEN-OPERATIVO.md`](tecnico/evidencia-motor17b/RESUMEN-OPERATIVO.md) (generado desde los archivos finales).
- **No cerrado por esta entrega**: calibración deportiva general, rendimiento masivo del manager (objetivo de cien en cinco segundos sin alcanzar y sin medir aquí), aceptación manual de Dennis y conformidad FIBA integral. **Siguiente**: análisis deportivo de ChatGPT sobre la evidencia, aceptación de Dennis y el trabajo posterior de resolución rápida del mundo (requisitos en `tecnico/motor17b.md` §6; no implementado).

## MOTOR-17 (ejecutado; campaña de cierre y paquetes entregados; propuesta numérica SIN aceptar; pendiente de Dennis)

- **Existe**: criterio de robo único por pérdida viva recuperada con control (`EST/ACTA-MOTOR17-R1`; solo estadístico), cierre de registro de las cadenas de saque (9 → 0 abiertas), identidad global en la auditoría (`matches` 2 → 12), `tope` registrado en cada término de receta (sensibilidad **exacta** en las 2.304 filas de R17), `team_index` explícito, `resumen.json` de auditoría, optimización exacta del coste (`P17`), corrección de una excepción latente (responsabilidad obsoleta tras un relevo en la posesión), candidatas **C17-01/C17-02** en el Panel (borrador no activo) y vista Cierre con descarga real. Detalle: [`tecnico/motor17.md`](tecnico/motor17.md) · [evidencia](tecnico/evidencia-motor17/00-LEEME.md) · [recorrido manual](prompts/MOTOR-17-recorrido-manual.md).
- **Cambio acotado y versionado** (motor `0.17.0-MOTOR17`, `SEM-MOTOR17-20261018`, solo crédito): ningún coeficiente cambia. Referencia `20261016` con la base: 83–98 y 6.684 sorteos (sin cambio). **Propuesta numérica** (fuera del perfil efectivo): `energy.costPerLiveMinute` 2 → 3 (C17-01) o 3,5 (C17-02, **elegida para R17 antes de abrir la campaña**); sin aceptación deportiva.
- **Campaña `MOTOR17-CIERRE-20261018`**: 472 ejecuciones de cierre (R0 y R17: 224 de comparación + 12 diagnósticos por versión), todas terminadas y válidas, y 600 de coste; auditorías AUD01–32 por versión; paquetes `MOTOR-17-revision-rapida.zip`, `MOTOR-17-indice-partes.json` y partes de evidencia detallada fuera de Git (`out/motor17/entrega-final/`). Cifras exactas: [`evidencia-motor17/RESUMEN-OPERATIVO.md`](tecnico/evidencia-motor17/RESUMEN-OPERATIVO.md).
- **Coste**: objetivo de cien en cinco segundos **NO alcanzado** (≈ 30 s con cuatro workers; doscientos medidos de verdad); mejora exacta de la optimización ≈ 7 % con salida idéntica; variación de ±10 % entre pasadas del mismo trabajo.
- **Comprobado por Claude**: `npm test` 208/208, `data:check`, comprobador documental (en copia limpia), equivalencia A17f↔P17 (completo y mínimo) y `npm run equivalence` de ambas versiones, recorrido Chromium (consola 0, red 0), recuperación de perfil anterior, verificación mecánica de la entrega. **Pendiente de Dennis**: recorrido manual ([guía](prompts/MOTOR-17-recorrido-manual.md)), aceptación de MOTOR-08…17 y de la propuesta numérica. **No ejecutado**: otros navegadores, Node 24, lectura directa de FIBA, calibración externa.
- **Límites**: el crédito de recogida sin intervención es una interpretación de producto revisable (función aislada); H11/H12 (reloj/faltas, eficiencia de tiro) sin resolver y sin ajuste; dos semillas por mecanismo no certifican efectos universales.

## MOTOR-16 (campaña ejecutada; análisis pendiente en ChatGPT)

- **Qué es**: ejecución y extracción de datos, sin cambio de código ni de deporte. Estudio `MOTOR16-EVIDENCIA-20261018` sobre el commit de código `109b9f8` (solo documental sobre `6a6814c`), motor `0.15.1-MOTOR15B`: 3.732 ejecuciones físicas (A 2.640, B 384, C 384, D 80, 224 diagnósticos, 20 técnicas), todas terminadas y válidas. Paquetes `MOTOR-16-*` fuera de Git (`out/motor16/entrega-final/`). Ficha: [`prompts/README.md`](prompts/README.md#motor-16).
- **No hecho**: análisis, calibración, candidata ni MOTOR-17; el motor sigue siendo MOTOR-15B.

## MOTOR-15B (ejecutado; cierre de MOTOR-15 y diagnóstico de robos; pendiente de Dennis)

- **Existe**: RG-I03 con punto concedido, **técnica de categoría 2** al defensor y libre adicional real con una única reanudación (por la cola común; guardado entre consecuencias sin duplicados); art. 45 numerado (45.4.1–45.4.8, 45.6); lotes de **reproducción** de C15-01…05 con semillas explícitas para auditar; AUD17 por ámbito y tarea (C15-05 leído, extremo aparte) y AUD26 clasificado por cadena; informe de auditoría con universo efectivo; caso preparado RG-I03 en *Partido*; vista **Cierre** de MOTOR-15B con los paquetes `MOTOR-15B-revision-rapida.zip` y `MOTOR-15B-evidencia-detallada.zip` (los de MOTOR-15 se conservan como histórico) y comprobador `scripts/m15b-package-check.js`.
- **Cambio acotado y versionado** (`SEM-MOTOR15B-20261017`, motor `0.15.1-MOTOR15B`, política `EST/ACTA-MOTOR15B-R1`): solo norma y crédito; **ningún coeficiente cambia**. Referencia `20261016`: 83–98, 6.684 sorteos, sin cambio (la huella cambia por el crédito).
- **Robos**: defecto de crédito demostrado y corregido (balón suelto ganado en disputa real; hechos, sorteos y marcador idénticos a MOTOR-15); límite declarado: el motor no conserva el toque defensivo y la pérdida viva recuperada sin intervención resuelta no se acredita (MOTOR-16/17). Defecto latente corregido: relevo obligatorio antes del tiempo muerto.
- **Comprobado por Claude**: `npm test` 202/202, `data:check`, comprobación documental, equivalencia, integración, robos, auditorías, panel y recorrido Chromium (consola 0, red 0), comprobador de paquetes. **Pendiente de Dennis**: recorrido manual ([guía](prompts/MOTOR-15B-recorrido-manual.md)), aceptación de MOTOR-08…15B. **No ejecutado**: benchmark de cien (no repetido), campaña de MOTOR-16, otros navegadores, Node 24, lectura directa de los PDF.
- **Límites**: sin lectura directa de FIBA (HTTP 403; síntesis de ChatGPT); RG-I01/I02/I04 provisionales; coste de 5 s pendiente; calibración pendiente. Detalle: [`tecnico/motor15b.md`](tecnico/motor15b.md). Siguiente: MOTOR-16 (preparado en `tecnico/evidencia-motor15b/14-PENDIENTES-MOTOR16.md`, no ejecutado).

## MOTOR-15 (ejecutado; coste NO alcanzado; pendiente de Dennis; cerrado en parte por MOTOR-15B)

- **Existe**: panel que abre con perfiles anteriores (tarjeta de compatibilidad y recuperación explícita; el error «reading 'policies'» venía de perfiles sin `coach`); técnicas/contadores, compensación y cola del art. 43, correcciones del art. 45, tiro pendiente (SEM15-TIR-01 = 0,35 s), interferencia condicionada (SEM15-INT-01..04), asistencias causales, estado propio por tramo y REC10-01/02; nivel `world-essential`, pool persistente de workers (1/2/4/auto); pestaña **Cierre**; paquetes de revisión (`out/motor15/`, fuera de Git).
- **Cambio deportivo versionado** (`SEM-MOTOR15-20261017`, motor `0.15.0-MOTOR15`, `export/9`): referencia 83–98, 6 684 sorteos; con semillas a cero reproduce MOTOR-14. **Semillas sin calibrar.**
- **Coste:** 100 partidos en ≈27 s con 4 workers frente al objetivo de 5 s (**no alcanzado**); 200 partidos ≈54 s, estimación no ejecutada.
- **Límites:** consecuencias de interferencia provisionales; 45.4.x sin lectura directa; sin generación natural de técnicas; sin desvío de asistencia; fuentes FIBA ilegibles.
- **Comprobado por Claude**: pruebas, `data:check`, comprobación documental, equivalencia, benchmark real (4 ejecuciones reales de cien, ver `motor15.md` §5), integración C15-01..06, auditorías y recorrido en Chromium. **Pendiente de Dennis**: recorrido manual, otros navegadores, Node 24. **No ejecutado**: 200 partidos reales y campaña de MOTOR-16.
- Detalle: [`tecnico/motor15.md`](tecnico/motor15.md). Siguiente: MOTOR-16 (evaluación y calibración del mundo; preparado en `tecnico/evidencia-motor15/14-PENDIENTES-MOTOR16.md`, no ejecutado).

## MOTOR-14 (parcial; candidato con bloqueos, pendiente de Dennis)

- **Existe**: registro de TEC17/TEC18/MEN02/MEN03/MEN06/MEN07/FIS06 desde el cálculo existente y contraste +1/+3/+5 sobre operaciones puras; **guardar y continuar** real (`src/match/snapshot.js`, almacén atómico, `/api/saves`, tarjeta en Partido); **inferioridad natural** y terminación por falta de jugadores (art. 21, extensión `SEM-MOTOR14-20261017`); equivalencia entre modalidades/velocidades/registro/continuación y AUD29 ejecutable (`npm run equivalence`); fachada para el manager (`src/engine`); medición de coste (`npm run cost`) y dos optimizaciones neutrales (simulación completa 3,05 → 1,37 s, reducida 0,77 → 0,52 s en este entorno). Ver [`tecnico/motor14.md`](tecnico/motor14.md), [contrato](tecnico/motor14-contrato.md) y [recorrido manual](prompts/MOTOR-14-recorrido-manual.md).
- **No cambia el deporte de la referencia**: `20261016` = 83–103, 6 505 sorteos, misma huella de trayectoria; motor `0.9.0-MOTOR09` y `export/8` sin cambios.
- **No cerrado** (explícito en `tecnico/motor14.md` §6): tiro en vuelo/interferencia (faltan filas numéricas), técnicas/antideportivas, compensación y art. 45 (falta el texto; fuentes FIBA sin acceso desde Claude), estado propio por tramo, asistencias con ruptura, REC10-01/02, pestaña/paquete «Cierre», campaña C14-03…06, estado actualizado de las 32 auditorías y recorrido de navegador.
- **Pendiente de Dennis**: aceptación manual (MOTOR-08 a MOTOR-14) y presupuesto de escala.

## MOTOR-13 (ejecutado, pendiente de Dennis)

- **Existe**: pestaña **Auditorías** (catálogo AUD01–32 con definición separada del resultado, evidencia con integridad verificada antes de interpretar, análisis de **lectura que no simula**, hallazgos navegables, matriz de 32 capacidades con contraste de cálculo fijo +1/+3/+5, fiabilidad, concentración, doce experimentos EXP13 que sí lanzan partidos con aviso, candidatas explícitas, informe y paquete `beM-audit-package/1`), `npm run audit`/`audit:check`, extensión `SEM-MOTOR13-20261017` (tabla `audit`) y versión `MOTOR-13`. Ver [`tecnico/motor13.md`](tecnico/motor13.md) y [recorrido manual](prompts/MOTOR-13-recorrido-manual.md).
- **No cambia el deporte**: referencia `20261016` = 83–103 con 6 505 sorteos y misma huella de trayectoria. Todo SEM, nada calibrado.
- **Honesto**: campaña de 24 encuentros (plan congelado antes de ejecutar) con 8 conciliaciones analíticas en fallo por un **defecto de lector de MOTOR-10 (quintetos), corregido** y repetida con las mismas semillas (24/24 válidos, trayectoria idéntica); primer ciclo **base mantenida** (muestra de 4 partidos completos, ninguna referencia externa numérica, reserva de validación sin lanzar); 7 capacidades consumidas sin receta registrada (contraste B no aislable); 9 de 20 ESP expuestos; los archivos del lote de cierre de MOTOR-12 no estaban disponibles.
- **Comprobado por Claude**: 170 pruebas (9 nuevas), `data:check`, comprobación documental, campaña R0/R1, comprobador del paquete y recorrido automatizado en Chromium. **Pendiente de Dennis**: todo el recorrido manual (también MOTOR-08 a MOTOR-12). **No ejecutado**: lotes de 100/1.000, Node 24, otros navegadores, fuentes FIBA (403).
- Siguiente: MOTOR-14 (rendimiento y cierre de registro; inventario en `tecnico/motor13.md` §14; no iniciado).

## MOTOR-12 (ejecutado, pendiente de Dennis)

- **Existe**: pestaña **Lotes** (repetir un enfrentamiento, cruces entre equipos o pares elegidos; atajos 10/100/1000 y cantidad editable con el total real desglosado; localía fija, ida/vuelta o alternada; variantes base/candidata con diferencias exactas o desde un escenario LAB11; semillas de generación, de lote `LOT-SEED-R1` y deportiva por caso; agenda y snapshot **congelados**; progreso, detener al terminar el actual, continuar, reintento explícito y recuperación tras reinicio; resultados con filtros, agregados/distribuciones/comparación y apertura del análisis MOTOR-10 de cada partido); servidor local con `worker_thread` y persistencia progresiva en `out/batches/`; registro diagnóstico completo R01–R08 (hechos, órdenes, estados, decisiones con capacidad base/efectiva, **todos** los sorteos con ordinal); paquete ZIP `beM-analysis-package/1` (único o por partes con índice y fragmentación), `npm run batch:check` (15 controles, sin re-simular) y `SEM-MOTOR12-20261017` (tabla técnica `batch`, LAB01). Ver [`tecnico/motor12.md`](tecnico/motor12.md) y [recorrido manual](prompts/MOTOR-12-recorrido-manual.md).
- **No cambia el deporte**: referencia `20261016` = 83–103 con 6 505 sorteos con registro completo **y** reducido (misma huella de trayectoria); motor `beM-motor-0.9.0-MOTOR09` y `export/8` sin cambios. Todo SEM, nada calibrado.
- **Honesto**: la corrección de AN08 (una posesión mixta para dos quintetos no es un error de conciliación) cambia la conciliación **analítica** de MOTOR-10, no el deporte; sin snapshot de continuación (un intento interrumpido se repite desde el inicio); el 404 de Chromium **no se pudo reproducir** (se declara el icono en la página, sin afirmar que fuera la causa); deuda heredada de MOTOR-09/10/11 declarada en la cobertura de cada paquete.
- **Comprobado por Claude**: **161 pruebas** (149 + 12 nuevas), `data:check` y comprobación documental correctos, lote de cierre de **diez encuentros reales** (5 casos × 2 variantes; 10 válidos; 10 ZIP verificados), Chromium automatizado con descargas reales (parcial, índice y partes) y comprobador sobre ellas y sobre una copia alterada. **Pendiente de Dennis**: todo el recorrido manual (también MOTOR-08/09/10/11). **No ejecutado**: lotes de 100/1.000 (controles de producto para Dennis), Node 24, otros navegadores.
- Siguiente: MOTOR-13 (ejecutado: auditorías, sensibilidad y calibración).

## MOTOR-11 (ejecutado, pendiente de Dennis)

- **Existe**: catálogo de doce equipos de referencia (144 fichas del anexo B de MOTOR-01, revisión R1: EQ07-J01 con 40 años) seleccionables como equipo A/B con instancias sin colisión; doce planes naturales materializados y validados; inspección y edición completa de fichas; +1/+3/+5 con deshacer exacto; variantes con diferencias; generador correlacionado reproducible (`GEN-MOTOR11-R1`) con guardado y procedencia; escenarios LAB11-00…12 con diferencias exactas, guardado, export/import `beM-scenario/1` y resultados individuales; cuota de cierres, producción por 100 en presencia completa, organización efectiva por tiro, OB05/corte instrumentados; versión común `MOTOR-11` visible en consola, cabecera y Panel. Ver [`tecnico/motor11.md`](tecnico/motor11.md) y [recorrido manual](prompts/MOTOR-11-recorrido-manual.md).
- **No cambia el deporte**: referencia `20261016` = 83–103 con 6 505 sorteos; motor `beM-motor-0.9.0-MOTOR09` y `export/8` sin cambios. Todo SEM, nada calibrado.
- **Honesto**: lateralidad del mapa y desvío/continuación de asistencias **sin productor** (confirmado, no inventado); estado propio por tramo y otras recomendaciones pendientes; deuda normativa de MOTOR-09 heredada.
- **Comprobado por Claude**: suite (141 + 8 nuevas), `data:check`, cinco partidos de integración (83–103, 73–64, 84–88, 88–68, 93–92; el quinto reproducido), Chromium automatizado. **Pendiente de Dennis**: todo el recorrido manual (también MOTOR-08/09/10). **No ejecutado**: Node 24, otros navegadores.
- Siguiente: MOTOR-12 (ejecución masiva y extracción completa; no iniciado).

## MOTOR-10 (ejecutado, pendiente de Dennis)

- **Existe**: capa de análisis `src/analysis/` (lector del partido sobre hechos y acta), pestaña **Análisis** en el laboratorio (Resumen, Acta y comparación, Evolución, Tiro y calidad, Ataque, Defensa, Rotaciones y quintetos, Informes, Diagnóstico y cobertura, Exportar), catálogo común de 26 indicadores, evolución y final ajustado (120 s / 5 puntos), mapa sectorial por zona real y calidad previa, origen único y ejecuciones encadenadas, libro y director (información propia), coberturas, ayuda y responsabilidades, saques, trabajo sin balón derivado de hechos existentes, quintetos/grupos/on-off descriptivo, antes/después de una orden aplicada, resumen con hasta tres claves sustentadas, recomendaciones REC10-01/02, permisos por audiencia (pública, propia, diagnóstico) y exportación analítica (JSON, CSV, Markdown). Perfil `+SEM-MOTOR10-20261016` con 23 filas editables de lectura. Ver [`tecnico/motor10.md`](tecnico/motor10.md) y [recorrido manual](prompts/MOTOR-10-recorrido-manual.md).
- **No cambia el deporte**: referencia `20261016` = 83–103 con los mismos 6 505 sorteos; `export/8` y el motor `0.9.0-MOTOR09` sin cambios; el acta no se tocó (la política de asistencias de MOTOR-09 se auditó y confirmó; criterio según el extracto de ChatGPT, PDF no abierto).
- **Sin contrastar / honesto**: ninguna fila normativa es lectura directa del PDF; un acta cuadrada prueba consistencia, no conformidad. Mapa sin lateralidad; organización defensiva leída por posesión; OB05 y disponibilidad de corte no registrados; sin estado propio visible por tramo; sin historial ni percentiles. Umbrales del resumen SEM editoriales, nada calibrado.
- **Comprobado por Claude**: 141 pruebas (10 nuevas), `data:check`, comprobación documental, cinco partidos de integración con acta y análisis conciliados (83–103, 89–95, 80–85, 124–92, 85–108; el quinto reproducido idéntico) y un recorrido **automatizado** en Chromium sin errores de consola. **Pendiente de Dennis**: todo el recorrido manual (también el de MOTOR-08 y MOTOR-09). **No ejecutado**: Node 24, otros navegadores, activación desde un perfil guardado anterior, contraste con los PDF.
- **Pendiente**: tres listas separadas (deuda de MOTOR-09, pendientes de MOTOR-10, entregas posteriores) en [`tecnico/motor10.md`](tecnico/motor10.md) §4 y §14.
- Siguiente: MOTOR-11 (ejecutado: población y generador).

## MOTOR-09 (ejecutado, pendiente de Dennis)

- **Existe**: matriz normativa REG de 19 filas con estado de contraste por fila (consumida por la administración de faltas defensivas, la disruptiva y la descalificación), series de libres como unidad causal, sanciones combinadas en cola, disponibilidad/terminación (casos preparados), acta completa desde los hechos (AS a canasta/libres, REC, TAP/TREC, FC/FR, más-menos por intervalos, VAL, DNP, sujetos colectivos, parciales), posesiones beM, finalizaciones F y dos particiones de puntos, conciliación de 33 comprobaciones, revisiones estadística/reglamentaria/técnica, casos de laboratorio preparados, informe de memoria con denominadores y **ruta B**, `export/8`. Ver [`tecnico/motor09.md`](tecnico/motor09.md) y [recorrido manual](prompts/MOTOR-09-recorrido-manual.md).
- **Sin contrastar**: los PDF de FIBA (S09-01 a S09-04) devolvieron HTTP 403; ninguna fila es lectura directa. Técnicas/antideportivas, compensación de sanciones y art. 45 están **tipadas sin ejecución**; umbral de inferioridad y terminación administrativa son valores provisionales; la política de asistencias es convención beM sin auditar S09-03.
- **Cambia los resultados**: referencia `20261016` 88–110 → 83–103 (ruta B); un fallo con falta de tiro ya no cuenta como intento de campo.
- **Comprobado por Claude**: 131 pruebas (13 nuevas), `data:check`, cinco partidos de integración conciliados y recorrido en Chromium (panel Reglamento/Estadística, partido completo con acta y conciliación, cinco casos preparados, sin errores de consola). **Pendiente de Dennis**: todo el recorrido manual (también el de MOTOR-08). **No ejecutado**: Node 24, otros navegadores, contraste con los PDF.
- **No implementado**: interferencia como familia propia, tiro en vuelo, técnicas/flagrantes generadas, inferioridad natural, continuación desde snapshot, MOTOR-10 (análisis, informes, mapas, on/off).
- Siguiente: MOTOR-10 (ejecutado: análisis, estadísticas y resumen).

## MOTOR-08 (ejecutado, pendiente de Dennis)

- **Existe**: entrenador automático (ENTREF01–03) con cinco ámbitos delegables (rotaciones con estabilidad, librillo de faltas, tiempos muertos con reserva y enfriamiento, ajustes y finales), memoria defensiva de hasta ocho patrones con exposición previa al acierto, vista permitida del entrenador, bloqueos manuales y orden `coachDelegation`, plan de participación precargado y revisable, interfaz de preparación, tarjeta del partido y diagnóstico, `export/7`.
- **Provisional**: parámetros SEM del encargo y tablas declarativas (lectura de Claude); nada calibrado ni validado. **Cambia los resultados** (referencia `20261016`: 83–97 → 88–110); el `export/6` se rechaza sin reproducirse.
- **Salvedades de MOTOR-07**: disruptiva (14 s), COB04 en entregas con fallback, recepción forzada no garantizada y mapa MEN acotado; lecturas FIBA del resumen del encargo, **sin consultar el PDF**.
- **No implementado**: ruta B de la memoria (preparación en acción), memoria entre encuentros, calibración.
- **Comprobado por Claude**: 118 pruebas, `data:check`, cinco partidos de integración y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las `DECISIÓN REQUERIDA` de `motor08.md`. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-09: cierre reglamentario extraordinario; no iniciado).

## MOTOR-07 (ejecutado, pendiente de Dennis)

- **Existe**: mapa causal de las 32 capacidades con sondas, Forma estable, presión (máximo de importancia y tensión, MEN07), tres momentos individuales con Consistencia y actualización perezosa, T colectivo sin conversión directa, pausas, episodios EPI01–EPI06 con evidencia, perturbación neutral de la salida final, copias de contraste C00–C06, vistas propia/rival/diagnóstico y `export/6`. 11 pruebas nuevas (106 en total) y cinco partidos completos de cierre. Ver [`tecnico/motor07.md`](tecnico/motor07.md) y [recorrido manual](prompts/MOTOR-07-recorrido-manual.md).
- **Provisional**: cifras del anexo A (SEM), tablas declarativas de tareas con estados y episodios (lectura de Claude); nada calibrado ni validado. **Cambia los resultados** (referencia `20261016`: 82–97 → 83–97); el `export/5` se rechaza sin reproducirse.
- **Salvedades de MOTOR-06**: corregidos ESP15 y el envío forzado de saque; pendientes COB04 en entregas, libres de la disruptiva (PDF FIBA inaccesible, 403) y etiquetas ESP: cuatro `DECISIÓN REQUERIDA` en `motor07.md`.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las decisiones. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-08: memoria y entrenador estratégico; no iniciado).

## MOTOR-06 (ejecutado, pendiente de Dennis)

- **Existe**: catálogo ESP01–ESP20 sobre un único flujo de oportunidades (llamada, recurso autónomo y decisión directa con la misma ejecución), transición con continuidad, seis saques ofensivos y seis respuestas defensivas con sacador fuera de pista, plazo de 5 s y tres relojes separados, llamada puntual de saque, pase inicial real en POS05/06, director como aislador en POS14, coberturas en entregas e indirectos, decisión única de robo y categorías disruptiva/flagrante. `export/5`, diagnóstico con numerador y denominador. 20 pruebas nuevas y cinco partidos completos de cierre. Ver [`tecnico/motor06.md`](tecnico/motor06.md) y [recorrido manual](prompts/MOTOR-06-recorrido-manual.md).
- **Provisional**: cifras del anexo A (SEM), contenido declarativo (lectura de Claude) y lecturas FIBA propias (PDF no accesible, 403); nada calibrado. **Cambia los resultados** (referencia `20261016`: 70–100 → 82–97); `export/4` se rechaza sin reproducirse.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las decisiones de `motor06.md`. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-07: Forma y momentos; no iniciado).

## MOTOR-05 (ejecutado, pendiente de Dennis)

- **Existe**: seis organizaciones defensivas como funciones y responsabilidades (individual, 2–3, 3–2, 1–3–1, 1–2–2, box and one con objetivo, alternativa y ORG02 por ausencia), cinco estilos defensivos, tres alturas de presión (avance presionado y violación de 8 s), cuatro coberturas, doce roles, marcas, ayudas con relevo, ESPD01–ESPD03 (falta táctica con antideportiva administrada, doble, no abandonar), órdenes defensivas con validación conjunta, controles en Preparación y dirección en vivo y panel › Repertorio defensivo. 75 pruebas y cinco partidos completos de cierre. Ver [`tecnico/motor05.md`](tecnico/motor05.md) y [recorrido manual](prompts/MOTOR-05-recorrido-manual.md).
- **Salvedades de MOTOR-04**: V03 corregido; V05 y V09 verificados; V01 contrastado (POS05/06 y POS14 pendientes de decisión de contenido); el 90–126 revisado sin evidencia de error («SEM, evaluación pendiente»).
- **Provisional**: cifras del anexo A (SEM), contenido declarativo defensivo (lectura de Claude, D01) y lecturas FIBA propias de antideportiva y 8 s (PDF no accesible); nada calibrado. **Cambia los resultados** (referencia `20261016`: 90–126 → 70–100); los `export/2` y `/3` se rechazan sin reproducirse.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las decisiones de `motor05.md`. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-06: ESP completo y saques tácticos; no iniciado).

## MOTOR-04 (ejecutado, pendiente de Dennis)

- **Existe**: siete estilos y media distancia con efecto, DIS01–DIS06, quince roles, libro de quince fichas por familia con nueve continuaciones, decisión del receptor, negación (CONT06/CONT07), encargos de rebote y balance, panel › Repertorio, candidata explícita desde perfiles anteriores y órdenes de disposición y roles. 63 pruebas y cuatro partidos completos de cierre. Ver [`tecnico/motor04.md`](tecnico/motor04.md) y [recorrido manual](prompts/MOTOR-04-recorrido-manual.md).
- **Provisional**: cifras del anexo A (SEM) y contenido declarativo del repertorio (lectura de Claude, V01); nada calibrado. **Cambia los resultados** respecto a MOTOR-02/03.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y V01/V03/V05/V09. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-05 ejecutado: defensa completa).

## MOTOR-03 (ejecutado, pendiente de Dennis)

- **Existe**: pestaña «Panel de ajustes» (diccionario, tabla maestra, mesa por preguntas, vistas, catálogo 81 + 4, perfiles con herencia, validación, publicación/activación, comparador y intercambio JSON), perfil base protegido V0 y persistencia local. 53 pruebas. Ver [`tecnico/motor03.md`](tecnico/motor03.md) y [recorrido manual](prompts/MOTOR-03-recorrido-manual.md).
- **Provisional**: todo sigue SEM; las 384 filas no tienen referencia ni evaluación; 22 filas están declaradas sin mecanismo (solo lectura); la asignación a los 81 grupos es propuesta de Claude.
- **Comprobado por Claude**: pruebas automáticas, equivalencia con el partido de referencia anterior (semilla 20261016, 94–89) y recorrido completo en Chromium. **Pendiente de Dennis**: todo el recorrido manual. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis. Continuidad obligatoria: cada entrega posterior añade al mismo diccionario sus filas, validaciones, consumidores y cobertura.

## MOTOR-02 (integrado en `main`)

- **Existe**: tres modalidades (total, por cuartos con prórrogas, por tiempo x2/x4/x8/x16 con pausa) sobre un único núcleo por fronteras; órdenes (estilos, prioridades, director, llamada, sustitución/quinteto, devolver al entrenador, tiempo muerto) con ciclo de vida; JSON ampliado y reproducción. 40 pruebas. Ver [`tecnico/motor02.md`](tecnico/motor02.md) y [recorrido manual](prompts/MOTOR-02-recorrido-manual.md).
- **Provisional**: extensión `SEM-MOTOR02-20261016` (+1,5 de energía por tiempo muerto) y cupos de tiempos muertos: semilla/lectura propia, no calibradas ni contrastadas con el PDF FIBA (no accesible). No completa los 81 grupos.
- **Cambio de resultados**: la corrección B01 (el lanzador de libres ya no sale antes de tirar) modifica los resultados de referencia de MOTOR-01 (p. ej. `20261016`: 98–85 → 94–89).
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual. **No ejecutado**: Node 24, otros navegadores, contraste con el PDF FIBA.

## MOTOR-01 (integrado en `main`; Dennis comunicó arranque local y recorrido manual correctos)

- **Existe**: motor de partidos por acontecimientos (`src/match/`), laboratorio web local (`npm run dev`, <http://localhost:5173/>) con plantillas editables de EQ01/EQ02, +1/+3/+5, preparación, simulación completa, acta, relato, detalle y descarga JSON; 23 pruebas automáticas. Ver [`tecnico/motor01.md`](tecnico/motor01.md).
- **Provisional**: perfil y fichas son SEM, no calibrados; no cierran los 81 grupos finales. Interpretaciones reglamentarias T01–T04 sin contrastar con el PDF FIBA (no accesible).
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: [recorrido manual](prompts/MOTOR-01-recorrido-manual.md). **No ejecutado**: Node 24, otros navegadores.

## Qué no existe todavía (histórico DOC-001, parcialmente superado)

- No hay motor de partidos, laboratorio, manager, pantallas, API, tablas de base de datos, servicios, simulador, jugadores ejecutables ni fórmulas de partido implementadas.
- No hay stack de aplicación elegido ni aplicación ejecutable; no hay CI. `main` no es «jugable» porque aún no hay juego (N03).
- La documentación técnica está vacía a propósito: ver [`tecnico/README.md`](tecnico/README.md).

## Entrega realizada

**DOC-001 — Organización documental y normas** (2026-10-16): ver [ficha](prompts/README.md#doc-001). Estado: ejecutada por Claude, **pendiente de revisión de Dennis**.

| Comprobado por Claude | Pendiente de Dennis | No ejecutado |
|---|---|---|
| Conservación íntegra de la importación, enlaces locales y exportado reproducible: ver [`motor/COBERTURA.md`](motor/COBERTURA.md). | Revisión manual de la lista de [`prompts/README.md`](prompts/README.md#doc-001-revisión-manual-para-dennis) y aceptación de la PR. | Presentación en GitHub (renderizado de anclajes y tablas) no comprobada visualmente desde el entorno de ejecución. |

## Lo que el propio funcional deja por completar

No es una decisión que falte por inventar; está identificado en el diseño con sus estados (CARGA, SEM, EVAL):

- Filas numéricas de los 81 grupos deportivos y de contenido, correspondencias reglamentarias y estadísticas, perfiles completos de las 144 plazas, planes, rangos del generador y escenarios y tolerancias de auditoría.
- Las semillas numéricas son **provisionales**; nada está **calibrado**; no hay evidencia (EVAL) de partidos ejecutados.
- Detalle: [Alcance de construcción y trabajos por completar](motor/alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md) y [Perfil inicial y semillas](motor/configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md).

## Incidencias conocidas

- Los **ocho originales** (MD01–MD08) no fueron suministrados; se declara en [`historico/README.md`](historico/README.md). El unificado registra sus nombres y huellas SHA-256 en su [capítulo 34](motor/trazabilidad/README.md).

## Siguiente paso autorizado

Ninguno está ordenado por esta entrega. La siguiente entrega se definirá mediante otro prompt en Markdown (norma N11), usando esta documentación ya organizada. Esta PR documental **no** ordena implementar el catálogo completo ni iniciar el resto del manager.
