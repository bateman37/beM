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
