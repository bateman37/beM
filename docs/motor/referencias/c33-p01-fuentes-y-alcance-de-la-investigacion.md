<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: referencias](README.md) · Capítulo 33 — Fuentes y límites de la investigación · parte 1 de 2
> Anterior: [c32-glosario-y-diccionarios](c32-glosario-y-diccionarios.md) · Siguiente: [c33-p02-fuentes-y-limites-de-la-investigacion](c33-p02-fuentes-y-limites-de-la-investigacion.md)
<!-- beM:nav-fin -->

<a id="cap-33"></a>

## 33. Fuentes y límites de la investigación

Se conservan las referencias de las ocho fuentes y el alcance que declararon. Las fechas y cifras citadas pertenecen a esas lecturas documentadas. La consolidación no declara una nueva verificación externa ni atribuye a esas fuentes la validación del motor o de sus coeficientes.

<a id="grupo-33-01"></a>

### 33.1. Fuentes y alcance de la investigación

*Procedencia: MD01, §24.*

<a id="src-md01-l0727"></a>

La fuente principal de decisiones para este documento es la conversación de Dennis sobre beM del 11 al 13 de octubre de 2026, incluida su aceptación del planteamiento y la tabla aportada.

Se consultaron selectivamente el capítulo táctico, el estudio de baloncesto y el capítulo de atributos de BeManager como material de ideas. Su documentación geométrica, sus fórmulas y su arquitectura de dos motores no se incorporan por ese motivo.

Referencias externas consultadas:

- [Basketball GM / ZenGM — GameSim.basketball](https://github.com/zengm-games/zengm/blob/master/src/worker/core/GameSim.basketball/index.ts): orientación sobre resolución por posesiones, estadísticas y eventos. Lectura selectiva, no auditoría completa.
- [FIBA — Informe de scouting del Mundial 2023](https://assets.fiba.basketball/image/upload/documents-corporate-studies-and-facts-fiba-scouting-report-fiba-basketball-world-cup-2023.pdf): combinaciones de disposiciones, acciones y presión.
- [FIBA — Informe de los Juegos Olímpicos de Tokio](https://assets.fiba.basketball/image/upload/documents-corporate-studies-and-facts-fiba-scouting-report-olympic-games-tokyo-2020-mens.pdf): ejemplos de coberturas, presión y organización posterior.
- [FIBA — Have Bonn solved the Ragland riddle?](https://www.fiba.basketball/en/news/23-24-news-tactics-board-have-bonn-solved-the-ragland-riddle): ajustes para dificultar la dirección del rival y concesiones de cada respuesta.
- [FIBA — Terminología de baloncesto](https://assets.fiba.basketball/image/upload/documents-corporate-regional-offices-europe-programs-fiba-europe-coaching-certificate-fiba-europe-basketball-terminology.pdf): significado de box-and-one y otras denominaciones.
- [FIBA — Holon, shake, rattle and roll](https://www.fiba.basketball/en/news/tactics-board-hapoel-netanel-holon-shake-rattle-and-roll): interacción entre bloqueo, continuación, compañeros y ayudas.

Estas referencias aportan ejemplos y terminología. No validan nuestros cinco niveles, el catálogo de roles, pesos de prioridad ni coeficientes futuros. Esas son decisiones de diseño de beM que deberán comprobarse con el motor.

<a id="grupo-33-02"></a>

### 33.2. Fuentes y trazabilidad

*Procedencia: MD02, anexo C.*

<a id="src-md02-l1130"></a>

#### 33.2.1. Fuentes de decisiones

*Origen: MD02 §C.1.*

La fuente principal es la conversación de Dennis sobre beM del 11 al 13 de octubre de 2026 y su aceptación de las 32 capacidades y del planteamiento de estados, experiencia y veteranos.

Material propio consultado:

- Documento 01: Diseño funcional de tácticas e impacto en el motor, versión 1.0, 13/10/2026.
- beM — sistema de atributos 1–30, aportado por Dennis.
- beM — base para iniciar el nuevo proyecto y normas, 11/10/2026.
- DESIGN(1).md del primer Basket Manager, como referencia histórica.

La conversación y los documentos de beM prevalecen sobre el diseño histórico. Esta aceptación cierra las decisiones funcionales descritas; no convierte ejemplos numéricos ni propuestas de almacenamiento en coeficientes aprobados.

<a id="src-md02-l1143"></a>

#### 33.2.2. Código y documentación inspeccionados selectivamente

*Origen: MD02 §C.2.*

| Referencia | Archivos principales | Alcance |
|---|---|---|
| Basket Manager, snapshot 6b52463 | src/entities/Player.js; src/core/MatchEngine.js; documentación de atributos y estados | Catálogo, grupos y mecanismos seleccionados; no auditoría completa |
| BeManager, snapshot 7b7eedd | modules/match/domain/players/attribute.ts y player-profile.ts; docs/match/CAPABILITIES.md, MODEL.md y reference/BeManager-capitulo-atributos-y-motor-v2.md | Catálogo diseñado, subconjunto activo y estructura del motor; no auditoría completa |
| Basketball GM / ZenGM [MD02-S1](#ref-md02-s1) | GameSim.basketball/index.ts | Referencia selectiva del ciclo por posesiones, acta y eventos |

Los snapshots de los dos proyectos propios fueron los revisados en esta conversación, de 9 y 30 de septiembre de 2026 respectivamente. No se afirma que describan cambios posteriores.

<a id="src-md02-l1153"></a>

#### 33.2.3. Referencias externas

*Origen: MD02 §C.3.*

<a id="ref-md02-s1"></a>**[MD02-S1] Basketball GM / ZenGM.** [GameSim.basketball/index.ts](https://github.com/zengm-games/zengm/blob/master/src/worker/core/GameSim.basketball/index.ts). Orientación sobre un motor por posesiones y salidas estadísticas.

<a id="ref-md02-s2"></a>**[MD02-S2] Cervone, D'Amour, Bornn y Goldsberry.** [A Multiresolution Stochastic Process Model for Predicting Basketball Possession Outcomes](https://arxiv.org/abs/1408.0777). Modelado de estados y acciones de posesión con seguimiento espacial. Sus métodos no se adoptan como implementación de beM.

<a id="ref-md02-s3"></a>**[MD02-S3] Franks, Miller, Bornn y Goldsberry.** [Characterizing the spatial structure of defensive skill in professional basketball](https://arxiv.org/abs/1405.0231). Diferencia entre efecto defensivo sobre frecuencia de tiros y eficiencia condicionada.

<a id="ref-md02-s4"></a>**[MD02-S4] Skinner.** [The Problem of Shot Selection in Basketball](https://doi.org/10.1371/journal.pone.0030776). Selección de tiro, oportunidades futuras, tiempo y riesgo bajo un modelo simplificado.

<a id="ref-md02-s5"></a>**[MD02-S5] Jin, Ge y Fan.** [Research on visual search behaviors of basketball players at different levels of sports expertise](https://pubmed.ncbi.nlm.nih.gov/36697486/). Estudio de anticipación y búsqueda visual en tareas con imágenes; no comparación directa de profesionales de 20 y 40 años.

<a id="ref-md02-s6"></a>**[MD02-S6] Bocskocsky, Ezekowitz y Stein.** [The Hot Hand: A New Approach to an Old “Fallacy”](https://www.sloansportsconference.com/research-papers/the-hot-hand-a-new-approach-to-an-old-fallacy) y [Heat Check: New Evidence on the Hot Hand in Basketball](https://carolynstein.github.io/files/papers/hot_hand.pdf). Selección de tiro, defensa y efecto condicionado de racha; no valida un bonus fijo por canasta.

<a id="ref-md02-s7"></a>**[MD02-S7] Vaci, Cocić, Gula y Bilalić.** [Large data and Bayesian modeling—aging curves of NBA players](https://pmc.ncbi.nlm.nih.gov/articles/PMC6690864/). Trayectorias de desarrollo y declive con diferencias individuales y por grupos; no fija nuestras curvas de capacidades.

<a id="ref-md02-s8"></a>**[MD02-S8] SciPy.** [expit](https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.expit.html) y [softmax](https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.softmax.html). Referencias matemáticas para logística y normalización de alternativas; no son pruebas de realismo deportivo.

Las referencias tácticas FIBA se conservan en el Documento 01. Las fuentes científicas explican principios y limitaciones; las decisiones específicas de beM necesitan su propia comprobación.

<a id="grupo-33-03"></a>

### 33.3. Fuentes, investigación y límites

*Procedencia: MD03, anexo B.*

<a id="src-md03-l1339"></a>

#### 33.3.1. Fuentes de decisiones

*Origen: MD03 §B.1.*

1. Documento 01 de beM: configuración táctica y responsabilidades acordadas.
2. Documento 02 de beM: catálogo de 32, escala, estados y experiencia.
3. Conversación posterior: propuesta de tres tablas, valores iniciales y cobertura completa.
4. Confirmación de Dennis del 14 de octubre: resolver acontecimientos, con profundidad y realismo, sin cálculo continuo de movimientos.
5. Petición del tercer MD: dejar expresamente pendiente el bloque estadístico que refleje el final del partido.

Los archivos históricos DESIGN(1).md y CLAUDE.odt son contexto de referencias anteriores. No importan su stack, nombres reales, granularidad de presentación ni fórmulas como requisitos automáticos de beM. La base y los Documentos 01–03 contienen las decisiones vigentes.

<a id="src-md03-l1349"></a>

#### 33.3.2. Referencias primarias consultadas durante la definición

*Origen: MD03 §B.2.*

| Fuente | Uso selectivo | Límite |
|---|---|---|
| [Basketball GM / ZenGM: GameSim.basketball/index.ts](https://github.com/zengm-games/zengm/blob/master/src/worker/core/GameSim.basketball/index.ts) | Bucle por posesiones y salidas que conservan ataque | No auditoría completa ni trasplante de código |
| [Franks y colaboradores, 2015](https://arxiv.org/abs/1405.0231) | Distintas dimensiones de eficacia defensiva | Su seguimiento espacial no es la arquitectura de beM |
| [Skinner, 2012: The Problem of Shot Selection in Basketball](https://doi.org/10.1371/journal.pone.0030776) | Oportunidad, tiempo y riesgo de seguir buscando | Modelo con supuestos simplificados; no fija coeficientes tácticos |
| [Bocskocsky, Ezekowitz y Stein: The Hot Hand](https://www.sloansportsconference.com/research-papers/the-hot-hand-a-new-approach-to-an-old-fallacy) | Racha condicionada por dificultad, utilización y respuesta defensiva | No justifica un bonus automático por canasta |
| [FIBA: reglas 2024, copia del documento oficial](https://nalb.bg/wp-content/uploads/2024/09/OBR2024.pdf) | Relojes, reanudaciones y administración de referencia | No se presenta como edición actual completa |
| [FIBA: cambios 2026 en español](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-rule-changes-v1-1-es.pdf) | Cambios de sanciones y acción de tiro vigentes desde octubre | Resumen; el texto oficial completo prevalece |
| [FIBA: cambios 2026 en inglés](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-rule-changes-v1-1-en.pdf) | Contraste de clasificación de faltas y administración | No reemplaza interpretaciones oficiales |
| [FIBA: manual de estadísticos 2024](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf) | Causalidad del registro y diferencias entre control y posesión | Es referencia para el bloque estadístico pendiente |

La investigación sobre experiencia, búsqueda visual y envejecimiento se conserva en el Documento 02. Sus conclusiones no determinan edades fijas, desarrollo idéntico ni bonos directos.

<a id="src-md03-l1364"></a>

#### 33.3.3. Qué respalda la investigación

*Origen: MD03 §B.3.*

Las fuentes orientan distinciones: elegir y ejecutar, prevenir y disputar, rendimiento medio y variación, posesión y continuación. La traducción a etiquetas, mecanismos y datos de beM es una propuesta de ingeniería deportiva del proyecto.

Los pesos, sensibilidades, intervalos y curvas del [anexo de origen MD03 A](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1004) son propios y provisionales. No se atribuyen a FIBA, ZenGM o los artículos como valores científicamente establecidos.

<a id="src-md03-l1370"></a>

#### 33.3.4. Estado real de validación

*Origen: MD03 §B.4.*

Se ha revisado coherencia documental, cobertura nominal de las 32 y aritmética de ejemplos. No se ha ejecutado un motor nuevo de beM ni recogido una distribución de partidos que valide estos parámetros.

La calibración, coste, efecto funcional de capacidades y fidelidad del acta final siguen pendientes de implementación y comprobación. El documento entrega el diseño y las propuestas para avanzar; no declara un motor terminado.

<a id="grupo-33-04"></a>

### 33.4. Fuentes, investigación y límites

*Procedencia: MD04, anexo C.*

<a id="src-md04-l2191"></a>

#### 33.4.1. Referencias principales

*Origen: MD04 §C.1.*

La investigación se ha usado para contrastar convenciones y amplitud del catálogo. El grueso de este documento es una propuesta funcional propia para beM, apoyada en las decisiones anteriores. No constituye una auditoría de las plataformas consultadas ni una transcripción de manuales.

| Ref. | Fuente primaria | Uso en este diseño | Límite |
|---|---|---|---|
| <a id="ref-md04-r01"></a>MD04-R01 | [ACB Live: resumen del Leyma Coruña–Casademont Zaragoza](https://live.acb.com/es/partidos/leyma-coruna-vs-casademont-zaragoza-105393/resumen) | Organización reconocible de resultado, periodos y evolución. | Lectura selectiva de un encuentro; no todas las pantallas ni toda su lógica interna. |
| <a id="ref-md04-r02"></a>MD04-R02 | [ACB Live: estadísticas del mismo partido](https://live.acb.com/es/partidos/leyma-coruna-vs-casademont-zaragoza-105393/estadisticas) | Contraste de acta y cifras del ejemplo 33.1. | Sin auditoría completa de atribución acontecimiento a acontecimiento. |
| <a id="ref-md04-r03"></a>MD04-R03 | [ACB Live: estadísticas avanzadas del mismo partido](https://live.acb.com/es/partidos/leyma-coruna-vs-casademont-zaragoza-105393/estadisticas-avanzadas) | Referencia de amplitud y denominación de vistas avanzadas. | No se presupone conocer todas sus fórmulas a partir de la pantalla. |
| <a id="ref-md04-r04"></a>MD04-R04 | [FIBA Statisticians' Manual 2024](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf) | Consulta normativa para fronteras sensibles de atribución. | Se remite a sus apartados; no se reproduce aquí el manual completo. |
| <a id="ref-md04-r05"></a>MD04-R05 | [FIBA: cambios de reglas 2026, versión 1.1 en español](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-rule-changes-v1-1-es.pdf) | Advertencia de edición y categorías disciplinarias. | Es un documento de cambios; no sustituye por sí solo al reglamento íntegro elegido. |
| <a id="ref-md04-r06"></a>MD04-R06 | [SuperManager ACB: reglas y valoración base](https://supermanager.acb.com/rules) | Contraste de la fórmula de VAL. | Se toma la base de acta; se excluye el bonus de fantasía por victoria. |
| <a id="ref-md04-r07"></a>MD04-R07 | [ACB: glosario de estadística avanzada](https://www.acb.com/es/liga/noticias/glosario-de-la-estadistica-avanzada-en-acbcom-146155) | Referencia terminológica para consultas avanzadas. | Acceso parcial del contenido; las fórmulas de beM se declaran de forma propia. |
| <a id="ref-md04-r08"></a>MD04-R08 | [ACB: una nueva dimensión estadística](https://www.acb.com/es/liga/noticias/una-nueva-dimension-estadistica-145724) | Amplitud de comparaciones y perfiles disponibles en baloncesto de competición. | No se adopta una fórmula solo por el nombre de una columna. |
| <a id="ref-md04-r09"></a>MD04-R09 | [ACB: mapas de tiros y zonas calientes](https://www.acb.com/es/liga/noticias/los-mapas-de-tiros-y-zonas-calientes-ya-son-una-realidad-en-acbcom-146188) | Referencia de utilidad de mapas para consulta. | El mapa por sectores de beM es una propuesta propia; no exige seguimiento geométrico. |
| <a id="ref-md04-r10"></a>MD04-R10 | [NBA Stats: glossary](https://www.nba.com/stats/help/glossary) | Contraste terminológico de métricas. | No se importan ventanas, reglas ni atribuciones NBA al perfil beM por defecto. |
| <a id="ref-md04-r11"></a>MD04-R11 | [Genius Sports: descripciones de estadísticas de baloncesto](https://ci.statistics.api.geniussports.com/docs/fixture-statistics-descriptions/basketball) | Referencia adicional de cobertura de categorías. | Contenido localizado parcialmente en búsqueda; apertura directa no disponible. No es especificación adoptada. |

<a id="src-md04-l2209"></a>

#### 33.4.2. Qué conclusiones son propias

*Origen: MD04 §C.2.*

La posesión beM propuesta, sus filas mixtas, la separación presencia/unidad completa, los diez sectores, el catálogo sin balón, la estructura de informes y la política de navegación son convenciones y diseños propios de beM, con las precisiones aceptadas en las entregas posteriores.

Las métricas por oportunidad registrada no se declaran estándares de ACB, FIBA o NBA. Las fórmulas convencionales estimadas se incluyen con nombre, coeficiente y alcance, para que no se confundan con conteos deportivos exactos.

Las fuentes reales justifican investigar profundidad estadística. No demuestran que todos los productos deban construirse a la vez ni que un motor más detallado físicamente vaya a producir mejor baloncesto.

<a id="src-md04-l2217"></a>

#### 33.4.3. Vigencia y prudencia interpretativa

*Origen: MD04 §C.3.*

La consulta se realiza en octubre de 2026. El manual estadístico contrastado es la edición 2024; el perfil deportivo elegido posteriormente es FIBA 2026 v1.1 y exige correspondencias explícitas entre sus casos y la política estadística. Se evita presentar el reglamento 2024 como la única regla actual.

Las definiciones vigentes concuerdan con el reglamento y la política elegidos; las correspondencias exhaustivas se completan como contenido identificado. Las páginas públicas pueden cambiar presentación, campos o disponibilidad. Las cifras del ejemplo sirven como fotografía de la lectura realizada.

<a id="grupo-33-05"></a>

### 33.5. Investigación, referencias y límites

*Procedencia: MD05, anexo C.*

<a id="src-md05-l2101"></a>

#### 33.5.1. Fuentes primarias utilizadas en esta consolidación

*Origen: MD05 §C.1.*

| Ref. | Fuente | Uso acotado en el diseño |
|---|---|---|
| <a id="ref-md05-s01"></a>MD05-S01 | [FIBA — Official Basketball Rules 2026, v1.1](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf) | Identificar el perfil reglamentario vigente y la necesidad de consecuencias/ventanas coherentes. |
| <a id="ref-md05-s02"></a>MD05-S02 | [FIBA — Statisticians’ Manual 2024](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf) | Política de acta de referencia; distinguirla de la edición reglamentaria y declarar adaptaciones. |
| <a id="ref-md05-s03"></a>MD05-S03 | [PLOS ONE — Play as practice? Comparative analysis of preparation period and match adjustments in a basketball team’s performance](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0312678) | Ejemplo de análisis que separa contexto ofensivo y estructura de ejecución. Muestra limitada; no ratio universal. |
| <a id="ref-md05-s04"></a>MD05-S04 | [Qiu y colaboradores — Interrupt or reinforce? The impact of timeout on momentum in basketball game](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1673186/full) | Resultados contextuales y límites de un estudio observacional sobre tiempos muertos. |
| <a id="ref-md05-s05"></a>MD05-S05 | [Assis y colaboradores — Stop the Clock: Are Timeout Effects Real?](https://arxiv.org/abs/2009.06750) | Contraste con explicaciones automáticas del cambio posterior a una pausa. |
| <a id="ref-md05-s06"></a>MD05-S06 | [Gibbs, Elmore y Fosdick — The causal effect of a timeout at stopping an opposing run in the NBA](https://arxiv.org/abs/2011.11691) | Importancia del diseño de comparación al interpretar pausas y rachas. |
| <a id="ref-md05-s07"></a>MD05-S07 | [NBA Stats — Teams Shooting Dashboard: Shotclock](https://www.nba.com/stats/teams/shots-shotclock) | Clasificación por reloj. |
| <a id="ref-md05-s08"></a>MD05-S08 | [NBA Stats — Teams Pull Up](https://www.nba.com/stats/teams/pullup) | Clasificación por preparación. |
| <a id="ref-md05-s09"></a>MD05-S09 | [ZenGM — Game simulation settings for all games](https://zengm.com/blog/2022/11/game-sim-settings/) | Referencia de parámetros deportivos editables en un simulador existente. |

Consulta de consolidación: 15 de octubre de 2026. Las referencias y sus alcances son distintos. Un reglamento es normativo para su perfil; un estudio describe su muestra y método; un simulador público es una referencia de diseño.

<a id="src-md05-l2117"></a>

#### 33.5.2. Qué se deduce y qué se decide para beM

*Origen: MD05 §C.2.*

La investigación ayuda a separar categorías y a evitar afirmaciones universales sobre fatiga, rachas o pausas. No proporciona una conversión científica del atributo 18 a una probabilidad ni de la energía 7 a una caída exacta de rendimiento.

La estructura del panel, los diez sectores funcionales, las tres calidades, el contexto pequeño, la representación de estados y la curva ilustrativa son decisiones o propuestas de diseño de beM. No se atribuyen a FIBA ni a un artículo como si fueran hallazgos empíricos.

El momento colectivo es una decisión explícita del juego. Debe calibrarse de forma moderada y explicable. Los trabajos sobre rachas y tiempos muertos no identifican por sí solos el valor de un estado psicológico oculto que pueda copiarse al motor.

<a id="src-md05-l2125"></a>

#### 33.5.3. Qué no queda demostrado por estas fuentes

*Origen: MD05 §C.3.*

- No se ha obtenido una frecuencia general fiable de «tirar sin jugada llamada» para todo el baloncesto profesional FIBA.
- Reloj y preparación no indican si hubo llamada táctica. [MD05-S07](#ref-md05-s07) / [MD05-S08](#ref-md05-s08)
- El estudio juvenil de S03 no fija porcentajes NBA o ACB ni una mezcla objetivo universal para beM.
- Una mejora después de un tiempo muerto no prueba automáticamente su efecto causal.
- No hay una curva empírica universal energía/rendimiento que justifique copiar los nodos ilustrativos como definitivos.
- Las configuraciones públicas de ZenGM no constituyen una auditoría completa de su motor ni validan automáticamente sus decisiones para beM.

<a id="src-md05-l2134"></a>

#### 33.5.4. Relación con investigación previa y repositorios

*Origen: MD05 §C.4.*

Las comparativas históricas de atributos y las lecturas selectivas de los otros proyectos permanecen documentadas en las entregas anteriores. Esta consolidación no afirma haber auditado íntegramente esos repositorios ni reutilizado su código.

Las referencias sirven para extraer ideas y contrastar riesgos. La especificación vigente es la combinación de decisiones de Dennis y los cinco documentos con la precedencia de este MD05. Los antecedentes que contradigan esa especificación no se convierten en requisitos por existir en un repositorio.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c32-glosario-y-diccionarios](c32-glosario-y-diccionarios.md) · Siguiente: [c33-p02-fuentes-y-limites-de-la-investigacion](c33-p02-fuentes-y-limites-de-la-investigacion.md)
