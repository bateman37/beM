# Catálogo de prompts y ejecuciones

Directorio de los encargos a Claude Code. **El texto original de un prompt ejecutado no se edita**: los cambios de alcance, instrucciones adicionales o correcciones se guardan como continuaciones numeradas (`<ID>-C01-<asunto>.md`) enlazadas al encargo. Los metadatos que cambian (estado, rama, PR, resultado) viven en este índice o en fichas de ejecución, no dentro del prompt. Norma N10 (conservación) y N11 (entrega en `.md`) en [`../../AGENTS.md`](../../AGENTS.md).

- Convención de nombres: `<ID>-<asunto>.md` (se conservan los identificadores existentes; no se renumera la historia).
- Plantilla (no es un encargo): [`plantilla-prompt.md`](plantilla-prompt.md).
- Estados posibles: preparado · en ejecución · ejecutado pendiente de revisión · requiere corrección · validado por Dennis · cancelado/sustituido.
- Prompts de conversaciones antiguas (MD01–MD08 y similares): **texto no disponible**; solo se conocen por mención en el funcional y no se reconstruyen.

## Catálogo

| ID | Objetivo | Texto | Estado | Última ejecución | Continuaciones |
|---|---|---|---|---|---|
| DOC-001 | Organización documental de beM y normas de trabajo | [`DOC-001-organizacion-documental-y-normas.md`](DOC-001-organizacion-documental-y-normas.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-01 | Primer partido completo y laboratorio inicial | [`MOTOR-01-primer-partido-completo.md`](MOTOR-01-primer-partido-completo.md) | Integrado en `main`; Dennis comunicó (en el prompt de MOTOR-02) arranque local y recorrido manual correctos | 2026-10-16 (intento 1) | — |
| MOTOR-02 | Tres modalidades y dirección manual del partido | [`MOTOR-02-modos-y-direccion.md`](MOTOR-02-modos-y-direccion.md) | Integrado en `main` (Dennis comunicó la integración; sin auditoría de su código por parte de ChatGPT) | 2026-10-16 (intento 1) | — |
| MOTOR-03 | Panel administrable, perfiles y comparación de ajustes | [`MOTOR-03-panel-y-perfiles.md`](MOTOR-03-panel-y-perfiles.md) · [recorrido manual](MOTOR-03-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-04 | Ataque posicional completo: siete estilos, seis disposiciones, roles, libro de quince fichas y nueve continuaciones | [`MOTOR-04-ataque-posicional.md`](MOTOR-04-ataque-posicional.md) · [recorrido manual](MOTOR-04-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-05 | Defensa completa: seis organizaciones, cinco estilos defensivos, tres alturas, cuatro coberturas, doce roles, tres especiales y cierre de salvedades de MOTOR-04 | [`MOTOR-05-defensa-completa.md`](MOTOR-05-defensa-completa.md) · [recorrido manual](MOTOR-05-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-06 | Transición, decisiones espontáneas ESP01–ESP20 y saques de banda y fondo (seis jugadas y seis respuestas), con cierre de salvedades de MOTOR-05 | [`MOTOR-06-transicion-y-saques.md`](MOTOR-06-transicion-y-saques.md) · [recorrido manual](MOTOR-06-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-07 | Capacidades, energía, Forma, presión, tres momentos, momento colectivo T y episodios EPI01–EPI06, con mapa causal de las 32 capacidades y cierre acotado de salvedades de MOTOR-06 | [`MOTOR-07-capacidades-y-estados.md`](MOTOR-07-capacidades-y-estados.md) · [recorrido manual](MOTOR-07-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-09 | Reglamento, administración y acta: matriz normativa con estado de contraste, series, combinadas, acta completa, posesiones y F, conciliación, revisiones, casos preparados y ruta B de la memoria | [`MOTOR-09-reglamento-administracion-y-acta.md`](MOTOR-09-reglamento-administracion-y-acta.md) · [recorrido manual](MOTOR-09-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-08 | Entrenador automático (tres políticas, cinco ámbitos delegables), memoria defensiva colectiva, contrato de información, perfil `SEM-MOTOR08` y cierre acotado de salvedades de MOTOR-07 | [`MOTOR-08-entrenador-y-memoria.md`](MOTOR-08-entrenador-y-memoria.md) · [recorrido manual](MOTOR-08-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |
| MOTOR-10 | Análisis, estadísticas, resumen e información: catálogo común de indicadores, evolución y final ajustado, mapa sectorial y calidad, origen y ejecuciones, defensa y responsabilidades, quintetos y on/off, informes por audiencia, resumen con claves sustentadas, recomendaciones REC10-01/02 y exportación analítica; perfil `SEM-MOTOR10` | [`MOTOR-10-analisis-estadisticas-y-resumen.md`](MOTOR-10-analisis-estadisticas-y-resumen.md) · [recorrido manual](MOTOR-10-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** (PR abierta, sin fusionar) | 2026-10-17 · intento 1 | — |
| MOTOR-11 | Población de referencia (doce equipos, 144 fichas, revisión de edad), planes naturales, generador correlacionado reproducible, edición masiva con deshacer exacto, variantes y escenarios LAB11; cierre de pendientes de MOTOR-10; perfil `SEM-MOTOR11` | [`MOTOR-11-poblacion-generador-y-escenarios.md`](MOTOR-11-poblacion-generador-y-escenarios.md) · [recorrido manual](MOTOR-11-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-17 | — |
| MOTOR-12 | Simulación masiva y extracción completa: lotes con repeticiones/cruces/pares, variantes y semillas congeladas, controlador con detención/continuación/reintento, persistencia progresiva, registro diagnóstico completo, agregados y comparación base/candidata, paquete ZIP `beM-analysis-package/1` con partes e índice, comprobador `npm run batch:check`; perfil `SEM-MOTOR12` | [`MOTOR-12-simulacion-masiva-y-extraccion.md`](MOTOR-12-simulacion-masiva-y-extraccion.md) · [recorrido manual](MOTOR-12-recorrido-manual.md) |
| MOTOR-13 | Auditorías AUD01–32, sensibilidad de las 32 capacidades, campaña inicial de doce contrastes y primer ciclo de calibración | [`MOTOR-13-auditorias-sensibilidad-y-calibracion.md`](MOTOR-13-auditorias-sensibilidad-y-calibracion.md) · [recorrido manual](MOTOR-13-recorrido-manual.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-17 (intento 1) | — |
| MOTOR-14 | Rendimiento, cierre funcional y candidato a motor v1: siete capacidades registradas, guardar/continuar, inferioridad natural, equivalencia/AUD29, contrato para el manager y coste | [`MOTOR-14-rendimiento-cierre-y-motor-v1.md`](MOTOR-14-rendimiento-cierre-y-motor-v1.md) · [recorrido manual](MOTOR-14-recorrido-manual.md) | Ejecutado **parcialmente** (candidato con bloqueos), pendiente de revisión de Dennis | 2026-10-17 (intento 1) | — |
| MOTOR-15 | Cierre funcional, compatibilidad y rendimiento del mundo: panel con perfiles anteriores, técnicas/compensación/art. 45, tiro pendiente e interferencia, asistencias causales, estado por tramo, REC10, nivel `world-essential`, workers, benchmark y paquetes | [`MOTOR-15-cierre-funcional-y-rendimiento-del-mundo.md`](MOTOR-15-cierre-funcional-y-rendimiento-del-mundo.md) · [recorrido manual](MOTOR-15-recorrido-manual.md) | Ejecutado (**objetivo de coste NO alcanzado**), pendiente de revisión de Dennis | 2026-10-17 (intento 1) | — |
| MOTOR-15B | Cierre de MOTOR-15 (RG-I03, art. 45, procedencia de auditorías y equivalencia, paquetes) y diagnóstico técnico de robos | **Ejecutado** (pendiente de Dennis) | [MOTOR-15B-cierre-y-diagnostico-de-robos.md](MOTOR-15B-cierre-y-diagnostico-de-robos.md) · [recorrido manual](MOTOR-15B-recorrido-manual.md) |
| MOTOR-16 | Campaña masiva y extracción de evidencia para ChatGPT (3.732 ejecuciones con las herramientas existentes; sin corregir ni calibrar) | [MOTOR-16-campana-y-extraccion-para-chatgpt.md](MOTOR-16-campana-y-extraccion-para-chatgpt.md) | **Ejecutado** (campaña completa; análisis pendiente en ChatGPT) | 2026-10-18 · [ficha](#motor-16) | — |
| MOTOR-17 | Ajustes, rendimiento y auditoría de cierre: crédito de robo y registro, rendimiento exacto, candidatas numéricas acotadas y campaña comparativa R0/R17 con paquetes para ChatGPT | [MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md](MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md) · [recorrido manual](MOTOR-17-recorrido-manual.md) | **Ejecutado** (propuesta numérica sin aceptar; pendiente de Dennis; objetivo de coste NO alcanzado) | 2026-10-18 · [ficha](#motor-17) | — |

## Fichas de ejecución

### DOC-001

| Campo | Valor |
|---|---|
| Objetivo | Organizar la documentación por temas, conservar íntegro el funcional unificado, incorporar normas N01–N12, índices, plantilla y utilidades documentales. Sin implementar motor ni laboratorio. |
| Medio de entrada del texto | Archivo `.md` adjunto (`972a69f1-beM-PROMPT-DOC-001-ORGANIZACION-DOCUMENTAL-Y-NORMAS.md`; prefijo añadido por la subida). La copia archivada es byte a byte idéntica. |
| Entrada adicional | Funcional unificado (`eb261b7b-beM-DISENO-FUNCIONAL-UNIFICADO-MOTOR-DE-PARTIDOS.md`), SHA-256 `df05edda…1fdd`. Los ocho originales no se suministraron. |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Revisión de partida | `053144e` («Initial commit», solo `README.md` de una línea). |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno de ejecución; el prompt proponía `docs/DOC-001-organizacion-documental`). |
| PR | [bateman37/beM#1](https://github.com/bateman37/beM/pull/1) (abierta contra `main`, sin fusionar). |
| Commits | Los de la rama; el SHA final no puede constar dentro del propio commit. |
| Resultado breve | Funcional importado sin pérdidas y seccionado en 74 archivos por 12 temas; índices, normas, estado, decisiones, catálogo y plantilla creados; exportado generado y reproducible. |
| Comprobaciones realizadas | `check_engine_docs.py --importacion` y `build_engine_docs.py --check`; resultados en [`../motor/COBERTURA.md`](../motor/COBERTURA.md). No se ejecutaron simulaciones, pruebas del motor ni E2E (no existen; el cambio es documental). |
| Limitaciones | No se comprobó el renderizado en GitHub. Ocho originales ausentes. |
| Pendientes | Validación de Dennis y decisión de fusión. |

#### DOC-001: revisión manual para Dennis

Estado de cada paso: **pendiente de Dennis** (ninguno confirmado por Dennis).

| Paso | Resultado esperado | Dónde |
|---|---|---|
| Abrir el README del repositorio. | Se entiende qué hay ahora y dónde empezar a consultar. | [`../../README.md`](../../README.md) |
| Abrir las normas y buscar «prompts en Markdown» y «pruebas». | Figuran el archivo MD obligatorio (N11) y la política de automatización proporcionada con revisión manual de Dennis (N12). | [`../../AGENTS.md`](../../AGENTS.md) |
| Buscar energía, tácticas y estadísticas desde los índices. | Cada materia se localiza por rutas claras y muestra sus dependencias. | [`../motor/README.md`](../motor/README.md#mapa-por-tareas) |
| Abrir una tabla extensa o un anexo dividido. | Se consulta por partes, con títulos, orden y enlaces coherentes. | [Trazabilidad](../motor/trazabilidad/README.md) · [registro de decisiones, parte 1](../motor/trazabilidad/c34-p02-registro-de-decisiones-de-origen.md) |
| Abrir el funcional original y el completo vigente. | Se distinguen su propósito y su procedencia; ambos contienen el documento que corresponde. | [Original](../historico/motor/unificado-original.md) · [Vigente](../exportados/beM-MOTOR-COMPLETO-VIGENTE.md) |
| Consultar la cobertura de un capítulo. | Se ve dónde se conservó su contenido y qué verificación se realizó. | [`../motor/COBERTURA.md`](../motor/COBERTURA.md) |
| Abrir el catálogo de prompts y DOC-001. | Está el texto completo enviado, su estado real y la trazabilidad disponible. | Este archivo y [DOC-001](DOC-001-organizacion-documental-y-normas.md) |
| Abrir el estado del proyecto. | El diseño documentado no aparece confundido con implementación o calibración terminadas. | [`../estado.md`](../estado.md) |

Comprobación local de enlaces: hecha por Claude. Presentación en GitHub: no comprobada desde el entorno de ejecución.


### MOTOR-01

| Campo | Valor |
|---|---|
| Objetivo | Aplicación ejecutable: dos plantillas editables, preparación, simulación completa por acontecimientos con acta, relato, detalle y descarga JSON. |
| Medio de entrada del texto | Archivo `.md` adjunto (`d97d48e2-beM-PROMPT-MOTOR-01-PRIMER-PARTIDO-COMPLETO.md`; prefijo añadido por la subida). La copia archivada es idéntica. |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Revisión de partida | `a8786f2` (DOC-001). |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno; el prompt proponía `feature/MOTOR-01-primer-partido-completo`). |
| PR | Ver la PR abierta contra `main` (sin fusionar). |
| Resultado breve | Núcleo en `src/match/`, laboratorio en `src/lab/`, datos cargados de los anexos con hash, 23 pruebas. Detalle técnico: [`../tecnico/motor01.md`](../tecnico/motor01.md). |
| Comprobaciones realizadas | `npm test` (23 correctas: datos, tres semillas, reproducibilidad, independencia de la presentación, reglas críticas), `npm run data:check`, recorrido de la interfaz con Chromium automatizado. Un barrido de desarrollo de 60 semillas sin fallos (no parte de la entrega). |
| Limitaciones | PDF FIBA no accesible (403): ver T01–T16 en la documentación técnica. Node 22 (no 24). Coeficientes provisionales sin calibrar. Consumo de cuota no medible desde el entorno. |
| Pendientes | Validación de Dennis, [recorrido manual](MOTOR-01-recorrido-manual.md), decisión de fusión. MOTOR-02 no iniciado. |


### MOTOR-02

| Campo | Valor |
|---|---|
| Objetivo | Total, por cuartos y por tiempo (x2/x4/x8/x16) sobre un núcleo común; órdenes con ciclo de vida, sustituciones, tiempo muerto manual, registro y reproducción desde JSON. |
| Medio de entrada del texto | Archivo `.md` adjunto (`4e629669-beM-PROMPT-MOTOR-02-MODOS-DE-PARTIDO-Y-DIRECCION.md`; prefijo añadido por la subida). La copia archivada es idéntica byte a byte. |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Revisión de partida | `2bb7397` (`main` con MOTOR-01 integrado). |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno; el prompt proponía `feature/MOTOR-02-modos-y-direccion`), reiniciada desde `main` tras fusionarse la PR anterior. |
| PR | Ver la PR abierta contra `main` (sin fusionar). |
| Resultado breve | Ver [`../tecnico/motor02.md`](../tecnico/motor02.md). Versión `beM-motor-0.2.0-MOTOR02`, perfil `SEM-MOTOR01-20261016+SEM-MOTOR02-20261016`, semilla `20261016`. |
| Comprobaciones realizadas | `npm test` (40), `npm run data:check`, recorrido de la interfaz con Chromium automatizado, barrido de desarrollo de 39 partidos con órdenes aleatorias (no parte de la entrega). |
| Limitaciones | PDF FIBA no accesible (403): U01–U03 sin contrastar. Corrección B01 cambia resultados de referencia de MOTOR-01. Consumo de cuota no medible. |
| Pendientes | [Recorrido manual](MOTOR-02-recorrido-manual.md) y validación de Dennis; decisión de fusión. MOTOR-03 no iniciado. |


### MOTOR-03

| Campo | Valor |
|---|---|
| Objetivo | Panel de ajustes con diccionario, tabla maestra, mesa por preguntas, perfiles con herencia, validación, publicación/activación, comparación de un partido por perfil e intercambio. |
| Medio de entrada del texto | Archivo `.md` adjunto (`e75129d2-beM-PROMPT-MOTOR-03-PANEL-ADMINISTRABLE-Y-PERFILES.md`). La copia archivada es idéntica byte a byte. |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Revisión de partida | `d05fe73` (`main` con MOTOR-02 integrado). |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno; el prompt proponía `feature/MOTOR-03-panel-y-perfiles`), reiniciada desde `main` tras fusionarse la PR anterior. |
| PR | Ver la PR abierta contra `main` (sin fusionar). |
| Resultado breve | Ver [`../tecnico/motor03.md`](../tecnico/motor03.md). Motor `beM-motor-0.3.0-MOTOR03`; perfil base `SEM-MOTOR01+02+03`; semilla de referencia 20261016 (94–89, idéntica a la anterior a MOTOR-03). |
| Comprobaciones realizadas | `npm test` (53), `npm run data:check`, equivalencia deportiva con la referencia previa, recorrido de interfaz con Chromium automatizado (flujo completo). |
| Limitaciones | PDF FIBA no accesible; asignación fila→grupo y entregas previstas son propuesta de Claude; consumo de cuota no medible; Node 22. |
| Pendientes | [Recorrido manual](MOTOR-03-recorrido-manual.md) y validación de Dennis; decisión de fusión. MOTOR-04 no iniciado. |

### MOTOR-04

| Campo | Valor |
|---|---|
| Objetivo | Ataque posicional completo sobre el motor común: siete estilos y media distancia, DIS01–DIS06, roles ofensivos, director, libro por familias con POS01–POS15 y CONT01–CONT09, rebote/balance con coste y panel/perfiles/registro/reproducción ampliados. |
| Medio de entrada del texto | Archivo `.md` adjunto (`9fe5ba53-beM-PROMPT-MOTOR-04-ATAQUE-POSICIONAL-COMPLETO.md`; prefijo añadido por la subida). Copia archivada íntegra (con anexos): [`MOTOR-04-ataque-posicional.md`](MOTOR-04-ataque-posicional.md). |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno; el trabajo se hizo en `feature/MOTOR-04-ataque-posicional` y se integra fast-forward en ella). Parte de MOTOR-03. |
| PR | Ver la PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final de la entrega. |
| Resultado breve | Quince fichas y nueve continuaciones ejecutables por operaciones reutilizadas; seis disposiciones como funciones; siete estilos con efecto causal; encargos de rebote y balance; filas, perfiles, registro y reproducción ampliados. |
| Comprobaciones realizadas | `npm test` (63 pruebas, 10 nuevas), `npm run data:check`, cuatro partidos completos de cierre, recorrido de interfaz con Chromium automatizado. No ejecutado: Node 24, otros navegadores. |
| Limitaciones | Todo SEM (anexo A) y contenido declarativo de lectura de Claude (V01); sin zonas ni roles defensivos, ESP completo, Forma, memoria ni cierre extraordinario. |
| Pendientes | Validación de Dennis y confirmación de V01/V03/V05/V09 ([`../tecnico/motor04.md`](../tecnico/motor04.md)). |

### MOTOR-05

| Campo | Valor |
|---|---|
| Objetivo | Defensa completa sobre el motor común: ORG01–ORG06 como funciones y responsabilidades, cinco estilos, tres alturas, COB01–COB04, doce roles, marcas, ayudas con relevo, ESPD01–ESPD03, box and one con alternativa, y cierre acotado de las salvedades V01/V03/V05/V09 de MOTOR-04. |
| Medio de entrada del texto | Archivo `.md` adjunto (`c825fb9e-beM-PROMPT-MOTOR-05-DEFENSA-COMPLETA.md`; prefijo añadido por la subida). Copia archivada íntegra (con anexo): [`MOTOR-05-defensa-completa.md`](MOTOR-05-defensa-completa.md). |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno; el trabajo se hizo en `feature/MOTOR-05-defensa-completa` y se integra fast-forward en ella). Parte de MOTOR-04 (ya contenido en la rama de trabajo; no estaba fusionado en `main`). |
| PR | Ver la PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final de la entrega. |
| Resultado breve | Defensa por funciones con referencia/responsabilidad actual, estilos que orientan elecciones, coberturas con compromisos persistentes, avance presionado con violación de 8 s, especiales con sanción antideportiva administrada, órdenes defensivas con validación conjunta, filas, perfiles, registro y reproducción (`export/4`) ampliados. |
| Comprobaciones realizadas | `npm test` (75 pruebas, 12 nuevas), `npm run data:check`, cinco partidos completos de cierre, matriz organización×cobertura de desarrollo, recorrido de interfaz con Chromium automatizado. No ejecutado: Node 24, otros navegadores, contraste con el PDF FIBA (no accesible). |
| Limitaciones | Todo SEM (anexo A) y contenido declarativo de lectura de Claude (D01); lecturas FIBA propias (antideportiva, 8 s); sin presiones zonales específicas, saques tácticos, memoria, Forma ni cierre extraordinario; V01 con POS05/06 y POS14 pendientes de decisión. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-05-recorrido-manual.md)) y decisiones listadas en [`../tecnico/motor05.md`](../tecnico/motor05.md). |

### MOTOR-06

| Campo | Valor |
|---|---|
| Objetivo | Transición y decisiones espontáneas sobre un único flujo de oportunidades (ESP01–ESP20 con tres orígenes: llamada del plan, recurso autónomo y decisión directa), saques de banda y fondo (SaqB01–03, SaqF01–03 y DSaqB01–03, DSaqF01–03) con plazo único de 5 s y tres relojes separados, y cierre de salvedades de MOTOR-05 (POS05/06, POS14, coberturas de mano a mano e indirectos, robos, antideportiva/descalificante). |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-06-TRANSICION-ESPONTANEAS-Y-SAQUES.md`). Copia archivada íntegra (con anexo): [`MOTOR-06-transicion-y-saques.md`](MOTOR-06-transicion-y-saques.md). |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno). Parte de MOTOR-05. |
| PR | Ver la PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final de la entrega. |
| Resultado breve | Capa declarativa ESP sobre las opciones físicas, mezcla única con opciones directas y recurso autónomo, saques con sacador fuera de pista, llamadas de punto con vigencia «siguiente saque propio compatible del periodo», órdenes de saque y respuesta defensiva, filas con consumidor, `export/5`, rechazo de `export/4` y diagnóstico con numerador y denominador. |
| Comprobaciones realizadas | `npm test` (20 pruebas nuevas, parametrizadas y acotadas), `npm run data:check`, cinco partidos completos de cierre, recorrido de interfaz con Chromium automatizado. No ejecutado: Node 24, otros navegadores, contraste con el PDF FIBA (403, no accesible). |
| Limitaciones | Todo SEM (anexo A) y contenido declarativo de lectura de Claude; lecturas FIBA propias (antideportiva/descalificante); el tiempo de sesión y la cuota no son medibles. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-06-recorrido-manual.md)) y decisiones listadas en [`../tecnico/motor06.md`](../tecnico/motor06.md). |

### MOTOR-07

| Campo | Valor |
|---|---|
| Objetivo | Uso causal de las 32 capacidades, energía selectiva, Forma recibida y estable, presión (máximo de importancia y tensión con MEN07), tres momentos individuales con Consistencia y actualización perezosa, T colectivo sin conversión directa, episodios con evidencia, neutralidad de la salida final, escenarios de contraste, visibilidad propia/rival/diagnóstico y cierre acotado de salvedades de MOTOR-06. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-07-CAPACIDADES-Y-ESTADOS-COMPLETOS.md`; prefijo añadido por la subida). Copia archivada íntegra (con anexos): [`MOTOR-07-capacidades-y-estados.md`](MOTOR-07-capacidades-y-estados.md). |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno), reiniciada desde `main` porque la PR #7 de MOTOR-06 ya estaba fusionada. |
| PR | Ver la PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final de la entrega. |
| Resultado breve | `SEM-MOTOR07` (anexo A literal), `states.js`, perturbación `p + α·Z·min(p, 1−p)` y vector de suma cero, nueve tareas enganchadas, episodios con deduplicación, pausas como marcadores, copias de contraste C00–C06, vistas, filas con consumidor, `export/6` y rechazo explícito de `export/5`. |
| Comprobaciones realizadas | `npm test` (11 pruebas nuevas), `npm run data:check`, cinco partidos completos de cierre con invariantes, revisión independiente acotada del contenido declarativo de MOTOR-06, recorrido con Chromium automatizado. No ejecutado: Node 24, otros navegadores, contraste con el PDF FIBA (403). |
| Limitaciones | Todo SEM (anexo A) y tablas declarativas de lectura de Claude; sin calibrar; Forma entre encuentros, temporada y memoria fuera de alcance; el tiempo de sesión y la cuota no son medibles. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-07-recorrido-manual.md)) y las cuatro `DECISIÓN REQUERIDA` de [`../tecnico/motor07.md`](../tecnico/motor07.md). |

### MOTOR-08

| Campo | Valor |
|---|---|
| Objetivo | Entrenador automático con tres políticas y cinco ámbitos delegables (rotaciones, ajustes, faltas, tiempos muertos, finales), memoria defensiva colectiva, contrato de información, tablas administrables, perfil `SEM-MOTOR08` e interfaz de preparación, partido y diagnóstico; cierre acotado de salvedades de MOTOR-07. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-08-ENTRENADOR-Y-MEMORIA-RIVAL.md`; prefijo añadido por la subida). Copia archivada íntegra: [`MOTOR-08-entrenador-y-memoria.md`](MOTOR-08-entrenador-y-memoria.md). |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno), a partir de `main` tras la fusión de la PR #8 de MOTOR-07. |
| PR | Ver la PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final de la entrega. |
| Resultado breve | `SEM-MOTOR08`, `coach-policy.js`/`coach.js`/`memory.js`, filas `coach.*`/`memory.*`, vistas del panel, `beM-match-input/6` y `export/7`, interfaz del entrenador y diagnóstico. Referencia `20261016`: 88–110. |
| Comprobaciones realizadas | `npm test` (118 pruebas, 12 nuevas), `npm run data:check`, cinco partidos completos de integración con invariantes, recorrido de interfaz con Chromium automatizado. No ejecutado: Node 24, otros navegadores, contraste con el PDF FIBA. |
| Limitaciones | Todo SEM y tablas declarativas de lectura de Claude; ruta B de la memoria no implementada; lecturas FIBA tomadas del resumen del encargo; el tiempo de sesión y la cuota no son medibles. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-08-recorrido-manual.md)) y las `DECISIÓN REQUERIDA` de [`../tecnico/motor08.md`](../tecnico/motor08.md). |

### MOTOR-09

| Campo | Valor |
|---|---|
| Objetivo | Cerrar la administración deportiva y la atribución del acta: matriz normativa, series y combinadas, acta completa, posesiones/F, conciliación, revisiones, casos preparados y cierre acotado de pendientes de MOTOR-08 (incluida la ruta B). |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-09-REGLAMENTO-ADMINISTRACION-Y-ACTA.md`; prefijo añadido por la subida). Copia archivada: [`MOTOR-09-reglamento-administracion-y-acta.md`](MOTOR-09-reglamento-administracion-y-acta.md). |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno), rehecha desde `origin/main` (`34d4c9e`, con MOTOR-08 fusionado). |
| PR | La PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final. |
| Resultado breve | `regs.js`, `acta.js`, `reconcile.js`, `revisions.js`, `cases.js`, `memory-report.js`, ruta B, `SEM-MOTOR09`, `export/8`. Referencia `20261016`: 83–103. |
| Comprobaciones realizadas | `npm test` (131 pruebas, 13 nuevas), `npm run data:check`, `scripts/integration-motor09.js` (cinco partidos: 83–103, 89–95, 80–85, 124–92, 85–108; todos conciliados y el quinto reproducido idéntico), recorrido en Chromium automatizado. Base comprobada: 118 pruebas y 88–110 antes de cambiar nada. No ejecutado: Node 24, otros navegadores, contraste con los PDF de FIBA. |
| Limitaciones | PDF S09-01 a S09-04 inaccesibles (HTTP 403): ninguna fila es lectura directa; filas pendientes sin ejecución; lecturas heredadas y provisionales sin contrastar; todo SEM sin calibrar; el tiempo de sesión y la cuota no son medibles. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-09-recorrido-manual.md)) y los contenidos normativos de [`../tecnico/motor09.md`](../tecnico/motor09.md) §13. |

### MOTOR-10

| Campo | Valor |
|---|---|
| Objetivo | Convertir los hechos del partido en una lectura completa: catálogo común, evolución, mapa y calidad, origen y ejecuciones, defensa, sin balón, quintetos y on/off, resumen con claves sustentadas, informes por audiencia y exportación analítica. Sin cambio deportivo. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-10-ANALISIS-ESTADISTICAS-Y-RESUMEN.md`; prefijo añadido por la subida). La copia archivada es byte a byte idéntica (SHA-256 `e1d47a92…18be`): [`MOTOR-10-analisis-estadisticas-y-resumen.md`](MOTOR-10-analisis-estadisticas-y-resumen.md). |
| Fecha real de ejecución | 2026-10-17 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno), rehecha desde `origin/main` (`51c8f7a`, con MOTOR-09 fusionado en la PR #10); el encargo proponía `feature/MOTOR-10-analisis-y-resumen`. |
| PR | La PR abierta contra `main` (sin fusionar); el enlace consta en la respuesta final. |
| Resultado breve | `src/analysis/` (hechos con tres capas de información, catálogo de 26 indicadores, fórmulas, evolución, tiro y mapa, ataque, defensa, saques, sin balón, presencia/on-off, filtros, antes/después, resumen, recomendaciones, permisos, exportación, conciliación analítica), pestaña «Análisis», extensión `SEM-MOTOR10-20261016` (23 filas editables de lectura), `tests/motor10.test.js`. Motor y `export/8` sin cambios; referencia `20261016` = 83–103 con los mismos 6 505 sorteos. |
| Comprobaciones realizadas | `npm test` (141 pruebas: 131 + 10 nuevas), `npm run data:check`, `check_engine_docs.py`, `scripts/integration-motor10.js` (cinco partidos: 83–103, 89–95, 80–85, 124–92, 85–108; acta y análisis válidos en los cinco; quinto reproducido idéntico) y recorrido automatizado en Chromium (partido completo, diez grupos de vistas, filtro con aviso de incompatibilidad, cambio de audiencia, descargas JSON y Markdown; sin errores de consola). Base comprobada antes de tocar nada: 131 pruebas y 83–103. No ejecutado: Node 24, otros navegadores, contraste con los PDF de FIBA, activación desde un perfil guardado anterior en el navegador. |
| Limitaciones | Criterio de asistencias según el extracto de ChatGPT del encargo (el PDF no se abrió); mapa sin lateralidad; organización defensiva leída por posesión; OB05 y disponibilidad de corte no registrados; sin estado propio visible por tramo; sin historial; todo SEM sin calibrar; la cuota y el tiempo de sesión no son medibles. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-10-recorrido-manual.md)); `DECISIÓN REQUERIDA` de [`../tecnico/motor10.md`](../tecnico/motor10.md) §14; deuda de MOTOR-09 conservada (§4). |

### MOTOR-11

| Campo | Valor |
|---|---|
| Objetivo | Hacer utilizables los doce equipos y 144 fichas, añadir generación ficticia correlacionada reproducible y variantes/escenarios controlados; cerrar los pendientes de MOTOR-10. Sin cambio deportivo. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-11-POBLACION-GENERADOR-Y-ESCENARIOS.md`; prefijo añadido por la subida). Copia archivada byte a byte idéntica (SHA-256 `17ba8acd…4e49a`): [`MOTOR-11-poblacion-generador-y-escenarios.md`](MOTOR-11-poblacion-generador-y-escenarios.md). |
| Fecha real de ejecución | 2026-10-17 · intento 1 (retomado tras reinicio del entorno y reposición de cuota) |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno), rehecha desde `origin/main` (`d18f78c`, con MOTOR-10 fusionado en la PR #11). |
| PR | Abierta contra `main` (sin fusionar); el enlace consta en la respuesta final. |
| Resultado breve | `src/population/`, `src/version.js`, `SEM-MOTOR11-20261017`, doce planes naturales, receta del generador, LAB11, `closures.js`, `orgat.js`, instrumentación `instr`, interfaz de Plantillas/Escenarios, `tests/motor11.test.js`. Referencia `20261016` = 83–103 con 6 505 sorteos. |
| Comprobaciones realizadas | Ver [`../tecnico/motor11.md`](../tecnico/motor11.md) §10. No ejecutado: Node 24, otros navegadores, recorrido humano. |
| Limitaciones | Todo SEM sin calibrar; lateralidad y desvío de asistencias sin productor; estado propio por tramo y recomendaciones extra pendientes; deuda normativa de MOTOR-09 heredada. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-11-recorrido-manual.md)). |

### MOTOR-12

| Campo | Valor |
|---|---|
| Objetivo | Ejecutar lotes sobre el mismo núcleo y descargar una extracción autocontenida (partidos, entradas, decisiones y resultados) que permita estudiar el motor sin volver al repositorio. Sin cambio deportivo ni calibración. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-12-SIMULACION-MASIVA-Y-EXTRACCION-COMPLETA.md`; prefijo añadido por la subida). Copia archivada byte a byte idéntica (SHA-256 `7a33212c…6db`): [`MOTOR-12-simulacion-masiva-y-extraccion.md`](MOTOR-12-simulacion-masiva-y-extraccion.md). |
| Fecha real de ejecución | 2026-10-17 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno), rehecha desde `origin/main` (`e53089e`, con MOTOR-11 fusionado en la PR #12: no hay PR dependiente); el encargo proponía `feature/MOTOR-12-lotes-y-extraccion`. |
| PR | Abierta contra `main` (sin fusionar); el enlace consta en la respuesta final. |
| Resultado breve | `src/batch/` (agenda, semillas, variantes, congelación, controlador, ejecutores con `worker_thread`, intento, registros, agregados, paquete, ZIP, comprobador, API local), pestaña Lotes, `SEM-MOTOR12-20261017`, `scripts/batch-check.js`, `scripts/integration-motor12.js`, `tests/motor12.test.js`. Referencia `20261016` = 83–103 con 6 505 sorteos. |
| Comprobaciones realizadas | Ver [`../tecnico/motor12.md`](../tecnico/motor12.md) §12. No ejecutado: lotes de 100/1.000, Node 24, otros navegadores, recorrido humano. |
| Limitaciones | Todo SEM sin calibrar; registro diagnóstico voluminoso (≈ 37 MiB/partido sin comprimir medidos); ejecución serial; sin snapshot de continuación; 404 de Chromium no reproducido; deuda heredada de MOTOR-09/10/11. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-12-recorrido-manual.md)); MOTOR-13 (auditorías, sensibilidad, calibración) y MOTOR-14 (rendimiento). |

### MOTOR-13

| Campo | Valor |
|---|---|
| Objetivo | Convertir partidos y lotes en evidencia revisable (catálogo AUD01–32, matriz de 32 capacidades con contraste de cálculo fijo, fiabilidad, concentración, referencias), ejecutar una campaña inicial de doce contrastes y un primer ciclo de calibración desde tablas administrables. Sin cambio deportivo. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-13-AUDITORIAS-SENSIBILIDAD-Y-CALIBRACION.md`; prefijo añadido por la subida). Copia archivada byte a byte idéntica (SHA-256 `f0607854…`): [`MOTOR-13-auditorias-sensibilidad-y-calibracion.md`](MOTOR-13-auditorias-sensibilidad-y-calibracion.md). |
| Fecha real de ejecución | 2026-10-17 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno), reiniciada desde `origin/main` (`655fb84`, con MOTOR-12 fusionado en la PR #13: no hay PR dependiente); el encargo proponía `feature/MOTOR-13-auditorias-y-calibracion`. |
| PR | Abierta contra `main` (sin fusionar); el enlace consta en la respuesta final. |
| Resultado breve | `src/audit/` (catálogo, fuentes, proyección con caché, evaluadores, análisis, experimentos, calibración, informe y paquete, API), pestaña Auditorías, `SEM-MOTOR13-20261017` (tabla `audit`), `effectiveAbility` extraída sin cambiar semántica, campaña de 24 encuentros (+24 de repetición), corrección de un defecto de lector de quintetos, primer ciclo con **base mantenida**. |
| Comprobaciones realizadas | Ver [`../tecnico/motor13.md`](../tecnico/motor13.md) §15. No ejecutado: lotes de 100/1.000, reserva de validación, Node 24, otros navegadores, recorrido humano, fuentes FIBA (403), archivos del lote de cierre de MOTOR-12 (ausentes). |
| Limitaciones | Todo SEM sin calibrar; 4 partidos con diagnóstico completo; 7 capacidades consumidas sin receta registrada; ninguna referencia externa numérica; un caso por intervención. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-13-recorrido-manual.md)); MOTOR-14 (rendimiento, cierre de registro y contratos para el manager; inventario en `motor13.md` §14). |

### MOTOR-15B

| Campo | Valor |
|---|---|
| Objetivo | Cerrar los cuatro pendientes de MOTOR-15 (consecuencia de RG-I03 y numeración del art. 45; procedencia de auditorías, energía crítica y AUD26; equivalencia con campos y observador; documentación y commit verificado) y revisar técnicamente la cadena que produce y acredita los robos, sin calibrar. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-15B-CIERRE-Y-DIAGNOSTICO-DE-ROBOS.md`; prefijo añadido por la subida). Copia archivada byte a byte: [`MOTOR-15B-cierre-y-diagnostico-de-robos.md`](MOTOR-15B-cierre-y-diagnostico-de-robos.md). |
| Fecha real de ejecución | 2026-10-17/18 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc` (la misma de MOTOR-15; su PR [#16](https://github.com/bateman37/beM/pull/16) seguía abierta y sin fusionar); la entrega se añade a esa PR. |
| PR | La #16 (sin fusionar); el enlace consta en la respuesta final. |
| Resultado breve | `SEM-MOTOR15B-20261017` (RG-I03 con técnica de categoría 2 y libre adicional; numeración 45.4.x; crédito de robo por balón suelto ganado; solo norma y crédito), motor `0.15.1-MOTOR15B`, relevo obligatorio antes del tiempo muerto, lector de AUD17/AUD26 y lotes de reproducción de C15, diagnóstico de robos, caso preparado RG-I03, paquetes `MOTOR-15B-*.zip` con comprobador. |
| Comprobaciones realizadas | Ver [`../tecnico/motor15b.md`](../tecnico/motor15b.md) §10. No ejecutado: benchmark de cien, campaña de MOTOR-16, otros navegadores, Node 24, recorrido humano. |
| Limitaciones | Sin lectura directa de los PDF (HTTP 403); RG-I01/I02/I04 provisionales; frecuencias SEM sin calibrar; toque defensivo no representado; C15-06 no auditado en lote; objetivo de coste pendiente. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-15B-recorrido-manual.md)); MOTOR-16 (auditoría/evaluación) y MOTOR-17 (calibración). |

### MOTOR-16

| Campo | Valor |
|---|---|
| Objetivo | Ejecutar la campaña masiva `MOTOR16-EVIDENCIA-20261018` y empaquetar la evidencia; el análisis y las recomendaciones (MOTOR-17) los realizan ChatGPT y Dennis. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-16-CAMPANA-Y-EXTRACCION-PARA-CHATGPT.md`; prefijo añadido por la subida). Copia archivada byte a byte: [`MOTOR-16-campana-y-extraccion-para-chatgpt.md`](MOTOR-16-campana-y-extraccion-para-chatgpt.md). |
| Fecha real de ejecución | 2026-10-18 · intento 1 |
| Rama | `claude/busy-edison-b1fmnc`; sin PR de implementación (el encargo la excluye). |
| Código que produjo la evidencia | Commit `109b9f8` (solo documental sobre `6a6814c`, el código comprobado de MOTOR-15B); motor `beM-motor-0.15.1-MOTOR15B`. Hash idéntico de los 270 ficheros de implementación al inicio y al final. |
| Resultado breve | 3.732 ejecuciones físicas (3.488 lógicas + 224 diagnósticos + 20 técnicas), todas terminadas y válidas, sin fallos. Entrega: `MOTOR-16-revision-rapida.zip`, `MOTOR-16-indice-partes.json` y 14 partes de evidencia detallada (863 MiB), fuera de Git (`out/motor16/entrega-final/`). |
| Comprobaciones realizadas | `batch:check` sobre 64 paquetes diagnóstico/reducido (todos correctos), `audit:check` del paquete AUD, SHA-256 y parseo de los 3.504 ficheros esenciales, CRC y SHA-256 de las 14 partes. No ejecutado: suite completa, navegador, benchmark de cien. |
| Limitaciones | Los esenciales no conservan sorteos con ordinal ni cálculo por decisión (solo los 224 diagnósticos); `batch:check` no cubre lotes esenciales ni el contenedor externo. |
| Pendientes | Análisis en ChatGPT y decisiones de MOTOR-17. Nada se ha calibrado ni cambiado. |

### MOTOR-17

| Campo | Valor |
|---|---|
| Objetivo | Implementar las recomendaciones aceptadas tras MOTOR-16 (crédito de robo, cadenas de saque, identidades y lectores, sensibilidad, rendimiento exacto, rotaciones/energía con hasta dos candidatas) y cerrar con la campaña comparativa `MOTOR17-CIERRE-20261018` (R0 frente a R17) y sus paquetes para ChatGPT. |
| Medio de entrada del texto | Archivo `.md` adjunto (`beM-PROMPT-MOTOR-17-AJUSTES-RENDIMIENTO-Y-AUDITORIA-DE-CIERRE.md`; prefijo añadido por la subida). Copia archivada byte a byte: [`MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md`](MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md). |
| Fecha real de ejecución | 2026-10-18 · intento 1 (con una revisión B de R17 documentada en [`../tecnico/motor17.md`](../tecnico/motor17.md) §9) |
| Rama | `claude/busy-edison-b1fmnc` (la designada para la sesión; contiene también MOTOR-15/15B/16, no fusionados en `main`). |
| Código que produjo la evidencia | R0 `6a6814c` (MOTOR-15B); R17 = último commit de la rama (ver `evidencia-motor17/RESUMEN-OPERATIVO.md` §1); motor `beM-motor-0.17.0-MOTOR17`. |
| Resultado breve | Correcciones demostradas, optimización exacta, propuesta `energy.costPerLiveMinute` 2 → 3 / 3,5 (C17-02 elegida para el cierre antes de abrir resultados, sin aceptación deportiva), 472 ejecuciones de cierre válidas + 600 de coste, auditorías por versión y paquetes `MOTOR-17-*` fuera de Git (`out/motor17/entrega-final/`). |
| Comprobaciones realizadas | Ver [`../tecnico/evidencia-motor17/RESUMEN-OPERATIVO.md`](../tecnico/evidencia-motor17/RESUMEN-OPERATIVO.md) §9. No ejecutado: otros navegadores, Node 24, lectura directa de FIBA, recorrido humano. |
| Limitaciones | Objetivo de 5 s no alcanzado; crédito de recogida sin intervención revisable; H11/H12 sin resolver; dos semillas por mecanismo no certifican efectos universales. |
| Pendientes | Validación de Dennis ([recorrido manual](MOTOR-17-recorrido-manual.md)); análisis externo y aceptación de la propuesta numérica. |
