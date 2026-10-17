# Changelog

Registro breve de entregas. Una entrada por entrega; las más recientes primero.

## MOTOR-13 — Auditorías, sensibilidad y calibración — 2026-10-17

- **Lectura y diagnóstico; sin cambio deportivo**: referencia `20261016` sigue en **83–103** con 6 505 sorteos y la misma huella de trayectoria; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios.
- `src/audit/`: catálogo **AUD01–AUD32** con evaluador y estados separados (implementación, registro, exposición, resultado, revisión); lectura de lote conservado o paquete verificable con integridad previa; proyección por intento con caché; hallazgos navegables; matriz de **32 capacidades** con contraste de cálculo fijo +1/+3/+5 (`effectiveAbility`, extraída sin cambiar semántica); fiabilidad por mecanismo (cinco intervalos fijos, Brier descriptivo); concentración y bucles como avisos; referencias sin rangos inventados.
- Pestaña **Auditorías**, API `/api/audit/*`, paquete `beM-audit-package/1` con comprobador (`npm run audit:check`), extensión `SEM-MOTOR13-20261017` (tabla `audit`, 25 filas LAB01) y versión `MOTOR-13`.
- **Campaña inicial**: doce contrastes EXP13-01…12 × 2 variantes = 24 encuentros (plan congelado antes de ejecutar); el lector dejó 8 con la conciliación analítica en fallo: **defecto de lector de MOTOR-10 corregido** (quintetos con los mismos jugadores en puestos distintos contaban doble; filas con puntos sin tiempo se descartaban) y campaña repetida con las mismas semillas (24/24 válidos, trayectorias idénticas). Tres defectos de auditor corregidos (AUD07, AUD13, AUD26).
- **Primer ciclo: base mantenida** con evidencia y límites (una señal aislada |z| ≈ 2,1 entre 13 mecanismos; muestra de 4 partidos completos); reserva de validación sin lanzar; ninguna candidata. Bandera `allowBaseOps` en lotes y columna aditiva `lineup_ids` en `quintetos.csv`.
- Pruebas: 9 grupos nuevos. Documentación: [`docs/tecnico/motor13.md`](docs/tecnico/motor13.md), [evidencia](docs/tecnico/evidencia-motor13/README.md), [recorrido manual](docs/prompts/MOTOR-13-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-12 — Simulación masiva y extracción completa — 2026-10-17

- **Orquestación, registro y exportación; sin cambio deportivo**: referencia `20261016` sigue en **83–103** con 6 505 sorteos (con registro completo y reducido, misma huella de trayectoria); motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios.
- Pestaña **Lotes**: repetir enfrentamiento, cruces y pares elegidos con cantidades desglosadas (12 equipos → 66 pares → 132 casos → 264 ejecuciones con dos variantes), localía fija/ida-vuelta/alternada (sin efecto deportivo), variantes con diferencias exactas o desde LAB11, tres semillas distintas (lista `LOT-SEED-R1` congelada por adelantado), snapshot efectivo completo, progreso responsive, detener tras el actual, continuar sin duplicar, reintento explícito y recuperación tras reinicio (el intento en curso se repite desde su inicio congelado).
- Servidor local con `worker_thread`, escritura progresiva y atómica en `out/batches/` (confirmación por directorio + índice append-only), estados de trabajo y de ejecución que reconcilian, bloqueo de continuación con versiones distintas.
- Registro diagnóstico completo capturado de las operaciones existentes (sin sorteos nuevos): hechos, órdenes (incl. programadas), estados/episodios, recetas con capacidad base/efectiva y peso, distribuciones, oportunidades, entrenador, memoria y **todos** los sorteos con ordinal; nivel reducido y prosa opcionales.
- Paquete **`beM-analysis-package/1`**: ZIP autocontenido con 15 tablas CSV, JSONL, diccionario, guía para ChatGPT, resumen, agregados (tasas por exposición, distribuciones con cuantiles/n−1, comparación base/candidata con pares incompletos, lectura táctica, capacidades), auditoría y cobertura; partes por casos completos con índice y fragmentación por secuencia; **tres huellas separadas** (archivo, entrada, trayectoria).
- **`npm run batch:check`**: 15 controles (hashes, registros lógicos, duplicados, referencias, conteos, marcador/minutos, sorteos, agregados recalculados, permisos) sin re-simular; detecta archivos alterados, filas duplicadas y referencias rotas.
- Extensión `SEM-MOTOR12-20261017` (tabla `batch`, seis filas LAB01), versión común `MOTOR-12`, favicon declarado, corrección de AN08 en la conciliación analítica (hallazgo del lote de cierre).
- ****161 pruebas** (12 nuevas)**, lote de cierre de diez encuentros reales verificado, Chromium automatizado con descargas reales. Documentación: [`docs/tecnico/motor12.md`](docs/tecnico/motor12.md), [recorrido manual](docs/prompts/MOTOR-12-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-11 — Población de referencia, generador y escenarios — 2026-10-17

- **Datos, lectura e interfaz; sin cambio deportivo**: referencia `20261016` sigue en **83–103** con 6 505 sorteos; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios (un `export/8` anterior sigue reproduciéndose).
- Doce equipos y 144 fichas seleccionables (A/B) con instancias sin colisión, revisión R1 de EQ07-J01 (40 años; R0 conservada), doce planes naturales materializados (`SEM-MOTOR11-20261017`, generados por `scripts/build-motor11-data.js` y verificados por `data:check`), inspección y edición completa de fichas, +1/+3/+5 con deshacer exacto y variantes con diferencias.
- Generador correlacionado reproducible (FNV-1a → xorshift32, streams por campo, huella SHA-256), guardado con procedencia; escenarios LAB11-00…12 como datos, export/import `beM-scenario/1`, guardado local y resultados individuales sin lotes.
- Pendientes de MOTOR-10: cuota de cierres y producción por 100 en presencia completa; organización efectiva por tiro; OB05 y corte instrumentados (`instr`, fuera de la proyección deportiva); lateralidad y desvío de asistencias confirmados sin productor; actor observable separado de la configuración privada.
- Versión común `src/version.js` (consola, cabecera, Panel › Inicio) separada de motor, perfil, dataset y formato de export.
- **149 pruebas** (8 nuevas), cinco partidos de integración conciliados, Chromium automatizado. Documentación: [`docs/tecnico/motor11.md`](docs/tecnico/motor11.md), [recorrido manual](docs/prompts/MOTOR-11-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-10 — Análisis, estadísticas y resumen — 2026-10-17

- **Lector del partido, sin cambio deportivo**: capa `src/analysis/` sobre los hechos y el acta de MOTOR-09. La referencia `20261016` sigue en **83–103** con los mismos 6 505 sorteos; motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` sin cambios (el acta no se tocó: la política de asistencias de MOTOR-09 se **auditó** contra los estados funcionales y se confirmó; el criterio procede del extracto de ChatGPT, el PDF no se abrió).
- Catálogo común de 26 indicadores (identidad, naturaleza, unidad, fuente, universo, cálculo, cobertura, información, muestra, evidencia) con numerador y denominador del mismo universo, `—` con motivo en lugar de ceros y agregación ponderada; indicadores no registrados o dependientes de datos declarados, no rellenados.
- Evolución (curva escalonada, ventaja máxima, empates, cambios de líder, tiempo por delante, parciales sin respuesta, final ajustado 120 s / 5 puntos previos), mapa sectorial (zona real, sin lateralidad inventada) y calidad previa, origen único de posesión y ejecuciones encadenadas, libro/director (solo información propia), organización/cobertura/ayuda/responsabilidades, saques banda/fondo, trabajo sin balón derivado de hechos existentes, quintetos/grupos/on-off descriptivo (completas, mixtas y parciales separadas) y antes/después de una orden aplicada.
- Resumen con hasta tres claves sustentadas y deduplicadas (siembras SEM editoriales), líderes con empates, crónica por periodo sin futuro, recomendaciones condicionadas REC10-01/02 y exportación analítica (JSON `beM-analysis-export/1`, CSV, Markdown) con audiencia pública/propia/diagnóstico aplicada **antes** de construir consultas, textos, caché y export.
- Pestaña «Análisis» en el laboratorio, catálogo en Panel › Estadística e información, extensión `SEM-MOTOR10-20261016` (23 filas editables, `optional`: un perfil anterior sigue jugando y reproduciéndose), conciliación analítica de 23 comprobaciones, matriz de cobertura heredada y tres listas de pendientes separadas.
- **141 pruebas** (10 nuevas), cinco partidos de integración con acta y análisis conciliados, recorrido automatizado en Chromium. Documentación: [`docs/tecnico/motor10.md`](docs/tecnico/motor10.md), [recorrido manual](docs/prompts/MOTOR-10-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-09 — Reglamento, administración y acta — 2026-10-16

- Matriz normativa REG (19 filas) con **estado de contraste por fila** (`contrastada`, `heredada`, `provisional`, `pendiente`): los PDF de FIBA (S09-01 a S09-04) devolvieron HTTP 403, así que ninguna fila es lectura directa del PDF; lo contrastado procede del texto del encargo §4.3. La administración de faltas defensivas, la disruptiva (libres y saque con 14 s) y la descalificación acumulada consultan ya la matriz. Técnicas/antideportivas, compensación de sanciones y art. 45 quedan **tipadas sin ejecución** (diagnóstico, no una regla inventada).
- Series de libres como unidad causal (concedidos, administrados, válidos, repetidos, anulados), sanciones combinadas en cola con reanudación única, disponibilidad/inferioridad y terminación administrativa (casos preparados; el motor natural falla con diagnóstico si no hay cinco elegibles).
- Acta completa desde los hechos: AS a canasta/libres, REC, TAP/TREC, FC/FR, más-menos por intervalos de presencia con secuencia estable, VAL, DNP y participación sin tiempo, sujetos colectivos, parciales, posesiones beM, finalizaciones F y dos particiones de puntos. **Un fallo con falta en acción de tiro deja de contar como intento de campo.**
- Conciliación consultable (33 comprobaciones con universo, esperado y observado), revisiones estadística/reglamentaria/técnica con propagación y casos de laboratorio preparados.
- Pendientes de MOTOR-08: informe de la memoria con denominadores separados, auditoría de claves y rotación (sin tocar la capacidad) y **ruta B** (cobertura preparada dentro de la acción, sin ventana, sin cambio de plan, sin bonus).
- Extensión `SEM-MOTOR09-20261016`, `beM-match-export/8` (el `export/7` se rechaza con motivo y se conserva), vistas «Reglamento» y «Estadística e información» del panel.
- **Cambia los resultados** (referencia `20261016`: 88–110 → 83–103, por la ruta B). 131 pruebas (13 nuevas). Documentación: [`docs/tecnico/motor09.md`](docs/tecnico/motor09.md), [recorrido manual](docs/prompts/MOTOR-09-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-08 — Entrenador automático y memoria defensiva — 2026-10-16

- Entrenador automático con tres políticas (ENTREF01–03, catorce parámetros literales del encargo) y cinco ámbitos delegables: rotaciones contextuales con estabilidad, librillo de faltas ordenado, tiempos muertos con causa, reserva y enfriamiento, ajustes tácticos y finales por tabla de contextos. Una sola utilidad 1–30 compartida con la sustitución; la exclusión reglamentaria no es delegable.
- Memoria defensiva colectiva (máximo ocho patrones, clave semántica, decaimiento 2^(−n/7), saturación 4, descarte 0,25) con exposición registrada antes del acierto; reconocer no cambia ninguna probabilidad y las respuestas son órdenes de plan validadas en su frontera.
- Contrato de información: el entrenador solo usa su vista permitida (sin datos rivales privados ni futuro). Órdenes manuales con bloqueo `lockUntil` y orden `coachDelegation`; una petición manual de tiempo muerto prevalece sobre la automática.
- Salvedades de MOTOR-07: falta disruptiva (lanza quien la recibe, saque con 14 s exactos), COB04 en entregas con fallback declarado, recepción forzada de saques no garantizada, mapa acotado de MEN02/03/04.
- Extensión `SEM-MOTOR08-20261016` (verificada por `npm run data:check`), perfil con filas `coach.*`/`memory.*`, vistas «Entrenador» y «Memoria», interfaz de preparación, tarjeta del partido y diagnóstico, `beM-match-input/6` y `beM-match-export/7` (el `export/6` se rechaza con motivo).
- **Cambia los resultados** (referencia `20261016`: 83–97 → 88–110). 118 pruebas (12 nuevas). Documentación: [`docs/tecnico/motor08.md`](docs/tecnico/motor08.md), [recorrido manual](docs/prompts/MOTOR-08-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-07 — Capacidades, energía, Forma y momentos completos — 2026-10-16

- Uso causal comprobado de las 32 capacidades (mapa y 32 sondas): nuevos consumidores de FIS01 (acceso de transición), MEN02/MEN03 (lectura del defensor real), MEN06 (amplitud de los momentos) y MEN07 (presión); energía selectiva sin cambios.
- Forma recibida y estable, presión = máximo(importancia, tensión), tres momentos individuales con actualización perezosa en tiempo deportivo, T colectivo sin aporte directo a la conversión, pausas como marcadores y episodios EPI01–EPI06 con evidencia y deduplicación. Perturbación neutral `p + α·Z·min(p, 1−p)` y vector de suma cero sobre la salida final.
- Extensión `SEM-MOTOR07-20261016` (anexo A literal verificado por `npm run data:check`), 644 filas con consumidor, entradas de estados e importancia, copias de contraste C00–C06, vistas propia/rival/diagnóstico, `beM-match-export/6` (el `export/5` se rechaza con motivo).
- Salvedades de MOTOR-06 contrastadas de forma acotada: corregidos ESP15 y el envío forzado de saque; COB04 en entregas, libres de la disruptiva y etiquetas ESP quedan pendientes (ver `DECISIÓN REQUERIDA`).
- **Cambia los resultados** (referencia `20261016`: 82–97 → 83–97). 106 pruebas (11 nuevas). Documentación: [`docs/tecnico/motor07.md`](docs/tecnico/motor07.md), [recorrido manual](docs/prompts/MOTOR-07-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-06 — Transición, decisiones espontáneas y saques — 2026-10-16

- Catálogo ESP01–ESP20 como capa de clasificación sobre un único flujo de oportunidades (llamada, recurso autónomo y decisión directa comparten ejecución; sin cuotas ni sorteos por ESP), transición con continuidad y urgencia, seis saques ofensivos (SaqB01–03, SaqF01–03) y seis respuestas (DSaqB01–03, DSaqF01–03) con plazo único de 5 s y tres relojes distintos, y llamada puntual de saque.
- Cierre de salvedades de MOTOR-05: POS05/06 con pase inicial real, POS14 con director candidato, coberturas en entregas e indirectos, decisión única de robo, disruptiva y flagrante como categorías distintas.
- Extensión `SEM-MOTOR06-20261016` (anexo A literal verificado por `npm run data:check`), filas con consumidor, órdenes de saque, interfaz de saques, diagnóstico con numerador y denominador, JSON `beM-match-export/5` (el `export/4` se rechaza).
- **Cambia los resultados** (referencia `20261016`: 70–100 → 82–97). 20 pruebas nuevas. Documentación: [`docs/tecnico/motor06.md`](docs/tecnico/motor06.md), [recorrido manual](docs/prompts/MOTOR-06-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-05 — Defensa completa y cierre de salvedades de MOTOR-04 — 2026-10-16

- Seis organizaciones (individual, zonas 2–3/3–2/1–3–1/1–2–2 y box and one) como **funciones y responsabilidades** (referencia frente a responsabilidad actual), cinco estilos defensivos con efecto en elecciones y encargos, tres alturas de presión (avance presionado, violación de 8 s), cuatro coberturas con persistencia del cambio, doce roles, marcas, ayudas con relevo y las tres especiales (falta táctica con sanción antideportiva administrada, doble a jugador, no abandonar tirador); box and one con objetivo, alternativa individual y ORG02 por ausencia.
- Extensión `SEM-MOTOR05-20261016` (cifras del anexo A verificadas por `npm run data:check`), filas `defense.*` con consumidor, órdenes defensivas con validación conjunta, controles en Preparación y dirección en vivo, panel › Repertorio defensivo, JSON `beM-match-export/4` (los `export/2` y `/3` se rechazan sin tocarse).
- Salvedades de MOTOR-04: V03 corregido (la posición nominal ya no filtra candidatos), V05 y V09 verificados, V01 contrastado de forma independiente (sin aprobación en bloque; quedan POS05/06 y POS14 pendientes de decisión), 90–126 revisado sin evidencia de error.
- **Cambia los resultados** (referencia `20261016`: 90–126 → 70–100). 75 pruebas (12 nuevas). Documentación: [`docs/tecnico/motor05.md`](docs/tecnico/motor05.md), [recorrido manual](docs/prompts/MOTOR-05-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-04 — Ataque posicional completo — 2026-10-16

- Siete estilos ofensivos con efecto causal (transición, elaboración, riesgo y «después del tiro» ya no son valores declarados) e instrucción de media distancia; seis disposiciones como funciones; quince roles ofensivos; libro por familias con POS01–POS15 y CONT01–CONT09 sobre tareas reutilizadas (nueve fichas referencian la receta de su donante); decisión del receptor con su propia lectura; escalera de negación (CONT06/CONT07).
- Encargos de rebote y balance con coste real (transición rival, odds ×1,2 por referencia); se retira el efecto abstracto de carga en la nueva ruta (sustitución identificada).
- Extensión `SEM-MOTOR04-20261016` (cifras del anexo A verificadas por `npm run data:check`), filas nuevas con consumidor, panel › Repertorio, candidata explícita desde perfiles anteriores, órdenes `disposition`/`roles`, registro de disposición/funciones/decisión/encargos, JSON `beM-match-export/3`.
- **Cambia los resultados** (referencia `20261016`: 94–89 → 90–126). 63 pruebas. Documentación: [`docs/tecnico/motor04.md`](docs/tecnico/motor04.md), [recorrido manual](docs/prompts/MOTOR-04-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-03 — Panel administrable, perfiles y comparación — 2026-10-16

- Diccionario de ~390 filas del perfil (SUP01) con ficha, clase (balance/contenido/reglamento/invariante), cobertura real y consumidor; literales del código convertidos en filas con su valor exacto (`SEM-MOTOR03-20261016`). Equivalencia deportiva con la referencia anterior comprobada.
- Panel de ajustes: inicio, mesa por 7 preguntas, tabla maestra con filtros, vistas temáticas, catálogo 81 + 4, edición tipada y conjunta, ciclo de perfiles (borrador → validación → publicación → activación → restauración), comparador de un partido por perfil e intercambio JSON.
- Perfil efectivo congelado por partido, `profileRef` en el resultado y filas consultadas por hecho en el detalle diagnóstico. 53 pruebas.
- Documentación: [`docs/tecnico/motor03.md`](docs/tecnico/motor03.md), [recorrido manual](docs/prompts/MOTOR-03-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-02 — Tres modalidades y dirección manual — 2026-10-16

- Avance por fronteras (`step()`), ventanas reglamentarias como frontera propia y `MatchSession` como único controlador: simulado total, por cuartos (con prórroga) y por tiempo a x2/x4/x8/x16 con pausa. Misma semilla y órdenes ⇒ mismo deporte en cualquier modalidad.
- Órdenes con ciclo de vida (estilos, prioridades, director, llamada, sustitución/quinteto, delegación, tiempo muerto), precedencia, lotes atómicos y quinteto manual; tiempos muertos con cupos y recuperación única (extensión SEM `SEM-MOTOR02-20261016`).
- JSON `beM-match-export/2` y reproducción desde archivo (`npm run replay`); laboratorio con panel de dirección.
- Corrección B01: el lanzador de libres ya no sale antes de tirar (cambia resultados de referencia de MOTOR-01). 40 pruebas.
- Documentación: [`docs/tecnico/motor02.md`](docs/tecnico/motor02.md), [recorrido manual](docs/prompts/MOTOR-02-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-01 — Primer partido completo y laboratorio inicial — 2026-10-16

- Motor por acontecimientos en `src/match/` (azar xorshift32, energía, reglas FIBA 2026 del funcional, fichas POS01/05/07/09/11/14, continuaciones, recursos ESP, relevo básico) y laboratorio en `src/lab/` (`npm run dev`).
- Perfil SEM y 144 fichas extraídos programáticamente del prompt archivado ([`data/`](data/catalog.json)); provisionales, sin calibrar.
- Acta proyectada desde los hechos, relato por posesiones, detalle calculado y descarga JSON. 23 pruebas (`npm test`).
- Documentación: [`docs/tecnico/motor01.md`](docs/tecnico/motor01.md), [recorrido manual](docs/prompts/MOTOR-01-recorrido-manual.md). Pendiente de validación de Dennis.

## DOC-001 — Organización documental y normas — 2026-10-16

- Incorporadas las normas de trabajo N01–N12 y las responsabilidades en [`AGENTS.md`](AGENTS.md) y [`CLAUDE.md`](CLAUDE.md) (N11 y N12 son nuevas).
- Funcional unificado del motor importado y seccionado por temas en [`docs/motor/`](docs/motor/README.md) (34 capítulos en 74 archivos, sin resumir). Copia original congelada en [`docs/historico/motor/`](docs/historico/motor/unificado-original.md) con SHA-256; completo vigente generado en [`docs/exportados/`](docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md).
- Índices, mapa por tareas, estado, registro de decisiones, catálogo y plantilla de prompts. Prompt archivado: [`DOC-001`](docs/prompts/DOC-001-organizacion-documental-y-normas.md).
- Utilidades `scripts/docs/build_engine_docs.py` y `check_engine_docs.py`. Comprobaciones: ver [`docs/motor/COBERTURA.md`](docs/motor/COBERTURA.md).
- Sin implementación del motor ni del laboratorio. Los ocho originales no fueron suministrados. Pendiente de validación de Dennis.
