# DOC-001 — Organización documental de beM y normas de trabajo

**Destino:** Claude Code, trabajando exclusivamente en el repositorio `bateman37/beM`.  
**Tipo de entrega:** documentación, conservación del diseño y utilidades documentales pequeñas.  
**Decisiones recogidas:** Dennis, hasta el 16 de octubre de 2026.  
**Entrada adicional que adjuntaré:** el Markdown completo del diseño funcional unificado del motor de partidos.  
**Resultado esperado:** una rama y una PR revisables, con el funcional íntegro conservado, su contenido organizado por temas, índices útiles y las normas siguientes incorporadas al repositorio.

## 1. Encargo y límites

Organiza la documentación de beM siguiendo este encargo. Las decisiones de organización y proceso que figuran aquí están aceptadas por Dennis. Ejecútalas; no devuelvas solamente una propuesta de carpetas.

Debes conseguir que una persona o una nueva sesión de IA pueda encontrar la definición vigente de un tema y consultar solo el contexto pertinente, conservando íntegramente el diseño funcional y su procedencia.

Esta entrega termina en documentación y en las utilidades estrictamente necesarias para conservarla, reconstruirla y comprobarla. No implementes todavía el motor, el laboratorio ni el manager. No crees pantallas, API, tablas de base de datos, servicios, simuladores, jugadores ejecutables o fórmulas de partido. Los ejemplos, catálogos y tablas del funcional se almacenan como especificación, sin convertirlos ahora en implementación.

No elijas ni cambies el stack de la aplicación. No instales dependencias, frameworks, bases de datos ni herramientas de documentación. No hagas refactorizaciones del juego. Conserva la configuración técnica existente que no contradiga el alcance de esta entrega.

Trabaja exclusivamente en `beM`. No abras, clones, busques ni recorras los repositorios `basket-manager`, `BeManager` ni otros repositorios de referencia, aunque sean accesibles o estén junto a este. Las consultas a otras referencias corresponden a ChatGPT; sus conclusiones se incorporan expresamente a los documentos y prompts de beM. Que el funcional cite una referencia no te autoriza a inspeccionar su repositorio.

## 2. Entradas y comprobación inicial

### 2.1. Qué debes localizar

1. Este prompt completo, para archivarlo como primera ejecución de `DOC-001`.
2. El MD unificado que Dennis adjunta. Su título previsto es «beM — Diseño funcional unificado del motor de partidos» y su nombre habitual es `beM-DISENO-FUNCIONAL-UNIFICADO-MOTOR-DE-PARTIDOS.md`. Puede llegar con otro nombre: identifica el documento por su contenido y registra el nombre recibido.
3. Las instrucciones y documentación que ya existan dentro de `beM`: `AGENTS.md`, `CLAUDE.md`, `README.md`, `DESIGN.md`, `CHANGELOG.md` y los índices existentes que resulten pertinentes.
4. Los ocho MD originales únicamente si están adjuntos o ya están dentro de este repositorio.

No necesitas que Dennis adjunte los ocho originales para seccionar el documento unificado. Si no están disponibles, registra esa ausencia en el inventario histórico y continúa con el unificado. No reconstruyas archivos originales a partir de recuerdos o extractos.

Si el MD unificado no está disponible, completa las normas, índices y plantillas que no dependan de él, deja la importación identificada como pendiente y solicita ese archivo en la entrega. No generes un funcional sustituto ni declares completada la migración.

### 2.2. Inspección acotada

- Confirma que el repositorio de trabajo es `beM`.
- Revisa el estado de Git antes de editar y conserva cualquier trabajo ajeno sin descartarlo ni sobrescribirlo.
- Localiza archivos mediante búsquedas de nombres y encabezados; evita volcar documentos enteros en la salida de terminal.
- Lee las normas existentes y los índices pertinentes. Para la migración, procesa íntegramente los bytes del funcional mediante herramientas locales y lee sus estructuras y fragmentos cuando sea necesario. No hace falta introducir todo su texto de una vez en el contexto de la conversación.
- Identifica conflictos documentales. Distingue una instrucción antigua sustituida por este encargo de una contradicción funcional real aún no resuelta.

No traslades automáticamente decisiones técnicas, datos reales, fórmulas o funcionalidades del antiguo Basket Manager o BeManager. Los archivos históricos son antecedentes. La documentación del nuevo motor y las decisiones expresas de Dennis son las que gobiernan beM.

## 3. Normas permanentes que deben quedar en Git

Incorpora estas normas a `AGENTS.md` como contrato común. Debe ser operativo y conciso: normas y rutas de lectura, sin pegar dentro el diseño del motor. `CLAUDE.md` contendrá la instrucción explícita de leer `AGENTS.md` y `docs/README.md`, y después los temas y dependencias que afecten al encargo. Las normas comunes se mantienen en un único lugar.

### 3.1. Responsabilidades

- **Dennis:** diseñador y responsable de producto; decide prioridades y comportamiento del juego, acepta las entregas y realiza una parte importante de las pruebas manuales. No se espera que lea o modifique código para poder validar una entrega.
- **ChatGPT:** investiga, ayuda a cerrar decisiones y prepara diseños y prompts concretos. Las consultas necesarias a otros repositorios las realiza ChatGPT, no Claude Code.
- **Claude Code:** implementa lo aprobado, comprueba su trabajo, mantiene los documentos afectados y explica los resultados en términos comprensibles para Dennis.

Claude puede resolver detalles técnicos internos, locales y reversibles dentro del alcance y el stack ya acordados. No puede decidir nuevas reglas de juego, probabilidades, atributos, tácticas, prioridades de producto, alcance visible, formatos de competición o comportamientos no definidos.

Cuando falte una decisión de producto, comunica `DECISIÓN REQUERIDA` con: cuestión concreta, referencias consultadas, opciones y consecuencias, y trabajo afectado. Continúa con las partes independientes que sí estén definidas. No vuelvas a pedir aprobación para decisiones ya aceptadas ni para la organización expresamente fijada en este prompt.

### 3.2. Las diez reglas de trabajo ya acordadas

| ID | Norma permanente |
|---|---|
| N01 | Entregas medianas, delimitadas y funcionales. Cada entrega tiene un objetivo comprobable y un cierre; evitar encargos abiertos de continuar indefinidamente. |
| N02 | Una rama y una PR por bloque, con commits coherentes. Claude no fusiona la PR: Dennis valida y decide la fusión. |
| N03 | Mantener `main` ejecutable y jugable cuando exista aplicación. En una fase solo documental, registrar ese estado real sin fingir que ya hay juego. |
| N04 | Pruebas automáticas mínimas y suficientes para el cambio: invariantes, reglas y simulación cuando correspondan. Su alcance debe ser proporcional y justificable. |
| N05 | Cada entrega incluye pruebas manuales concretas, con pasos y resultado esperado. Dennis realizará muchas de estas pruebas. |
| N06 | Si una entrega modifica interfaz, Claude recorre el camino básico real cuando dispone del entorno; informa de lo recorrido y de las limitaciones. Esta comprobación breve no sustituye la revisión funcional de Dennis. |
| N07 | Prompts delimitados: objetivo, lecturas necesarias, alcance, exclusiones, tareas, criterios de aceptación y comprobaciones. Los defectos ajenos se registran sin ampliar silenciosamente la entrega. |
| N08 | Cada entrega mantiene la documentación afectada, registra decisiones nuevas cuando existan y añade una entrada breve al changelog. No se reescriben documentos ajenos al cambio. |
| N09 | El diseño lo decide Dennis con el trabajo de análisis acordado. Claude no rellena vacíos funcionales inventando reglas; señala la decisión pendiente y sigue con lo independiente. |
| N10 | Todos los prompts ejecutados se conservan en el repositorio, incluidos hotfixes y continuaciones relevantes, con su texto original y trazabilidad. |

### 3.3. Dos normas nuevas, expresas y obligatorias

**N11 — Entrega de prompts en Markdown.** Siempre que Dennis pida un prompt para Claude Code, debe recibirlo como un archivo `.md`, íntegro y listo para usar, con enlace de descarga o acceso al archivo. Un resumen o un bloque pegado en el chat no sustituyen ese archivo. Cuando se prepare desde un entorno con acceso al repositorio, debe quedar también archivado en el catálogo de prompts con su estado correcto. Un prompt preparado no se marca como ejecutado.

**N12 — Automatización de pruebas proporcionada y revisión manual de Dennis.** Se ejecutan las pruebas automáticas necesarias para comprobar el cambio y proteger reglas importantes. Dennis hará una parte sustancial del test funcional manual. Evitar baterías enormes, duplicaciones, cobertura por cantidad, barridos masivos sin hipótesis y pruebas que solo repiten la implementación. La existencia de un laboratorio capaz de simular miles de partidos no obliga a lanzar esos lotes en cada PR. Los lotes de calibración se ejecutan cuando una auditoría concreta los requiere o Dennis los solicita.

Aplicación práctica de N04, N05 y N12:

- Selecciona comprobaciones por el riesgo y comportamiento que cambia; explica brevemente qué comprueban.
- Reutiliza pruebas pertinentes. No crees pruebas nuevas para un cambio reversible y pequeño que quede comprobado adecuadamente de otra forma.
- Respeta las comprobaciones obligatorias ya acordadas en el repositorio; no las elimines para presentar un resultado correcto.
- No ejecutes toda la batería, amplíes el muestreo o repitas comprobaciones por inercia después de pasar las necesarias. Amplía solo si hay un fallo, un cambio nuevo o una duda material.
- Cuando exista una puerta técnica básica, debe poder ejecutarse sin una base de datos activa si así está previsto en la arquitectura. Las pruebas que necesitan base real se identifican por separado. No crees ahora infraestructura para esta norma futura.
- Presenta una lista manual breve y específica. Distingue «comprobado por Claude», «pendiente de Dennis» y «no ejecutado por una limitación».
- No declares aprobado por Dennis un caso que Dennis no haya probado o aceptado.
- Una suite de pruebas correcta no demuestra por sí sola que el partido sea convincente ni que una fórmula esté calibrada.

### 3.4. Principios deportivos ya decididos

Recoge una tarjeta breve de orientación en el índice del motor, enlazando al detalle funcional:

- El primer hito deportivo es un partido completo integrado y revisable desde el laboratorio.
- Motor, tácticas y atributos se conciben y se construyen juntos.
- El cálculo avanza por acontecimientos relevantes dentro de posesiones, con contexto pequeño. No se simulan movimientos de todos los jugadores a cada segundo o milésima.
- Debe sentirse como un partido vivo y tácticamente rico, con ejecución interna sencilla y comprensible.
- Las decisiones tácticas y las diferencias entre jugadores deben tener efectos observables y explicables.
- Los modos de partido usan el mismo núcleo deportivo según el funcional; la presentación y el detalle del registro pueden variar como allí se define.
- Los parámetros deportivos administrables pertenecen a configuración versionada, con los límites y mecanismos previstos en el diseño. No se sustituyen por constantes ocultas.
- Semillas provisionales, contenido aún por completar y parámetros calibrados conservan sus estados.
- El laboratorio es reutilizable por el futuro manager. No se construye un motor desechable distinto.
- Las siguientes etapas se acuerdan en entregas. Esta PR documental no ordena implementar el catálogo completo ni iniciar el resto del manager.

No conviertas un ejemplo aislado de bloqueo directo ni una microacción en el hito de validación inicial. Los ejemplos del funcional se conservan como explicaciones o casos dentro del partido completo.

## 4. Autoridad, versiones y separación de propósitos

Aplica estas reglas de forma explícita en `docs/README.md` y en el índice del motor mediante enlaces, manteniendo la definición detallada en un único lugar:

1. Las instrucciones expresas vigentes de Dennis y los cambios funcionales aceptados tienen prioridad. Al registrar un cambio aceptado, actualiza el documento temático correspondiente.
2. Dentro del diseño de las ocho entregas, prevalece la última decisión aceptada que modifica un punto. El documento unificado adjunto ya recoge esa consolidación: esta tarea no autoriza a reinterpretarla ni a rehacerla.
3. Después de verificar la migración, los documentos temáticos son la referencia vigente de trabajo por materia.
4. La copia íntegra recibida es una referencia congelada de la importación. Nunca se sobrescribe con una versión generada.
5. La versión completa vigente es un exportado generado a partir de las secciones. No se mantiene manualmente como una segunda especificación.
6. Los ocho originales, si están disponibles, y los documentos antiguos son históricos. Una formulación sustituida no vuelve a ser una alternativa vigente.
7. Los prompts conservan el encargo y su historia. Un prompt o una respuesta de implementación no alteran por sí solos el funcional: las nuevas decisiones aceptadas deben incorporarse a la sección vigente.
8. La fecha de modificación de un archivo no determina por sí sola la prioridad de una regla.

Mantén separados:

- **Diseño funcional:** lo que queremos que haga el producto.
- **Documentación técnica:** cómo se ha implementado realmente.
- **Estado de entrega:** qué existe, qué se ha comprobado y qué falta.
- **Histórico y evidencia:** antecedentes, ejecuciones, resultados y decisiones anteriores.

Conserva todos los estados y códigos de estado que ya use el funcional. «Definido», «implementado», «validado», «semilla provisional» y «calibrado» no son equivalentes. No cambies su significado para simplificar una tabla.

## 5. Estructura que debes crear o adaptar

Usa estas rutas como destino. Conserva el código y la estructura técnica del juego que ya existan. Si ya hay documentación equivalente, intégrala en estas rutas con trazabilidad y deja enlaces de transición cuando hagan falta, sin mantener dos definiciones vigentes del mismo asunto.

### 5.1. Entradas y documentos comunes

| Ruta | Contenido obligatorio |
|---|---|
| `README.md` | Presentación breve, estado real y enlaces a normas y documentación. Conserva instrucciones de ejecución existentes y válidas. No inventes comandos. |
| `AGENTS.md` | Contrato común: responsabilidades, N01–N12, límites de decisiones y lectura dirigida. |
| `CLAUDE.md` | Entrada específica para Claude: leer normas e índices y seguir el ámbito autorizado. |
| `CHANGELOG.md` | Registro breve de entregas. Añade DOC-001; no borres entradas anteriores. |
| `docs/README.md` | Índice general, mapa por tareas, autoridad documental y rutas de entrada. |
| `docs/estado.md` | Estado comprobado del repositorio, esta entrega, limitaciones y siguiente paso autorizado, si existe. |
| `docs/decisiones/README.md` | Registro breve de decisiones relevantes, su aceptación y enlaces a las definiciones vigentes. |
| `docs/tecnico/README.md` | Índice de lo técnico que realmente exista. Distingue lo documentado de lo pendiente; no diseñes una arquitectura nueva. |
| `docs/historico/README.md` | Versiones conservadas, disponibilidad de originales y advertencia de su función histórica. |
| `docs/prompts/README.md` | Catálogo de prompts y ejecuciones, con estados y enlaces. |
| `docs/prompts/DOC-001-organizacion-documental-y-normas.md` | Copia íntegra de este prompt, sin reescribirlo a posteriori. |
| `docs/prompts/plantilla-prompt.md` | Plantilla breve para futuros encargos, enlazada a las normas comunes. |
| `docs/motor/README.md` | Índice temático, principios, mapa de tareas, dependencias y enlaces al completo vigente y a la referencia original. |
| `docs/motor/presentacion.md` | Presentación y metadatos de procedencia del funcional recibido, conservando su significado. |
| `docs/motor/uso-y-estados.md` | Instrucciones de uso, estados, precedencia y contenido sustantivo del preámbulo del unificado. |
| `docs/motor/manifest.json` | Orden de composición y correspondencia de fragmentos con la fuente recibida. |
| `docs/motor/COBERTURA.md` | Informe compacto de conservación, enlaces a las correspondencias y resultado de comprobaciones. |
| `docs/exportados/README.md` | Naturaleza de los exportados, origen y comandos reales para reconstruirlos y verificarlos. |
| `docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md` | Funcional íntegro vigente generado a partir de sus secciones. |

El `README.md` raíz y los índices deben ser cortos y útiles. No pegues allí el diseño completo ni catálogos extensos. Si existe un `DESIGN.md` raíz como entrada anterior, consérvalo antes de sustituirlo y conviértelo en un enlace de transición al índice vigente, sin otra copia manual del funcional.

### 5.2. Distribución del funcional por materias

El unificado previsto tiene 34 capítulos. Esta es la asignación aprobada. Cada carpeta tendrá un `README.md` local con sus contenidos y dependencias.

| Carpeta | Capítulos del unificado que debes incorporar |
|---|---|
| `docs/motor/alcance/` | 1. Identidad, alcance y decisiones de dirección; 30. Alcance de construcción y trabajos por completar. |
| `docs/motor/jugadores/` | 2. Datos de entrada, capas y participantes; 3. Catálogo de 32 capacidades y escala; 4. Cuerpo y alcance funcional; 5. Tendencias individuales y decisiones; 6. Experiencia, veteranos y desarrollo; 14. Forma, momento, consistencia y presión. |
| `docs/motor/tacticas/` | 7. Táctica ofensiva; 8. Táctica defensiva; 9. Repertorio declarativo; 10. Banda, fondo y situaciones especiales. |
| `docs/motor/simulacion/` | 11. Flujo de partido, posesiones y contexto pequeño; 12. Selección, oportunidad, ejecución y desenlace; 13. Tiempo, esfuerzo y energía. |
| `docs/motor/direccion/` | 15. Órdenes, delegación y dirección en vivo; 16. Entrenador, rotación, faltas, pausas y finales; 17. Memoria defensiva y adaptación. |
| `docs/motor/reglamento/` | 18. Reglamento y administración deportiva. |
| `docs/motor/estadisticas/` | 19. Registro, conservación y reproducción; 20. Estadísticas, acta, atribución y magnitudes; 21. Análisis táctico, quintetos, filtros e informes; 22. Resumen final, relato y presentación; 23. Visibilidad e información disponible. |
| `docs/motor/laboratorio/` | 24. Modalidades y primer laboratorio. Incluye edición de los 12 jugadores por equipo, controles masivos, modos, lotes y toda la extracción y los logs que estén definidos en el texto. |
| `docs/motor/configuracion/` | 26. Panel, parámetros, perfiles y versiones; 27. Inventario de tablas y contratos de datos; 29. Perfil inicial y semillas numéricas. |
| `docs/motor/validacion/` | 25. Población de referencia y generación; 28. Auditorías y criterios de aceptación. |
| `docs/motor/referencias/` | 31. Comparativa histórica; 32. Glosario y diccionarios; 33. Fuentes y límites de la investigación. |
| `docs/motor/trazabilidad/` | 34. Trazabilidad y decisiones reconciliadas, conservando su contenido y separando procedencia histórica de reglas vigentes cuando el propio texto ya lo distinga. |

La ubicación de una materia no altera su autoridad ni elimina sus relaciones. Por ejemplo, el coste de energía se define donde corresponde al flujo y esfuerzo, y los estados y la rotación enlazan a esa definición. No copies una misma regla a todas esas carpetas.

Si la fuente recibida utiliza títulos ligeramente diferentes pero corresponde a estos mismos capítulos, conserva sus títulos reales y aplica la asignación por número y contenido. Si contiene una estructura sustancialmente distinta, informa de la discrepancia y conserva todo el archivo; no fuerces una clasificación que omita o cambie contenido.

## 6. Conservación íntegra y división mecánica

### 6.1. Original de referencia

Antes de transformar el funcional:

1. Guarda una copia byte a byte del MD recibido en `docs/historico/motor/unificado-original.md`.
2. Registra nombre original, título, versión y fecha tal como aparezcan, tamaño y SHA-256.
3. Distingue la fecha del documento de la fecha real de importación. No inventes un número de versión ausente.
4. No añadas cabeceras, avisos o enlaces dentro de esa copia: la explicación de su estado va en el índice histórico.
5. Si la ruta ya contiene una copia distinta, conserva ambas con identificación por el hash; no sobrescribas la anterior ni decidas que la otra dejó de tener valor.

Los ocho originales, si están disponibles, se conservan sin cambios bajo `docs/historico/motor/entregas-01-08/`, usando sus nombres reales. Si no están, el índice indica «no suministrado» y no crea enlaces a archivos inexistentes.

### 6.2. División por temas sin resumir

Aplica estas reglas de partición para evitar decisiones editoriales nuevas:

1. Conserva el orden original de los capítulos y de sus apartados mediante el manifiesto, aunque se distribuyan por carpetas temáticas.
2. Un capítulo de hasta aproximadamente 3.000 palabras puede permanecer en un archivo. Usa `cNN-<titulo-en-slug>.md`.
3. Si lo supera, divide por sus apartados existentes de nivel `###`, agrupando apartados consecutivos hasta aproximadamente 3.000 palabras por archivo. Usa `cNN-p01-<primer-subtitulo-en-slug>.md`, `p02`, etc. No mezcles capítulos distintos en un fichero.
4. Un apartado que por sí solo exceda esa referencia se divide por sus subapartados existentes de nivel `####`, conservando el orden. Si no hay una frontera semántica existente, conserva la unidad y permite la excepción de tamaño; no inventes reglas o explicaciones para partirla.
5. Las tablas muy largas, especialmente trazabilidad y catálogos, pueden paginarse en bloques de hasta 100 filas de datos. Mantén columnas y filas originales, repitiendo únicamente la cabecera y el separador para que cada página sea legible. Registra esas repeticiones como navegación añadida, no como nuevas filas funcionales.
6. No partas una fila, fórmula, bloque de código, lista que perdería su significado o ficha indivisible. No crees un archivo por atributo, parámetro, caso de auditoría o párrafo.
7. Los anclajes inmediatamente anteriores a un encabezado viajan con él. Conserva los identificadores originales y resuelve las referencias entre ficheros.
8. Cada página tiene contexto mínimo de identificación y enlaces a su índice y dependencias; esa navegación añadida debe distinguirse del contenido importado para poder recomponerlo.

La referencia de tamaño orienta la lectura y no autoriza a recortar contenido. Evita también multiplicar archivos vacíos o páginas que solo remiten a otra página sin aportar navegación útil.

### 6.3. Transformaciones permitidas

- Crear rutas, títulos de navegación, índices y metadatos documentales.
- Reescribir destinos de enlaces para que funcionen desde la nueva ubicación.
- Añadir los elementos de navegación necesarios para consultar y reconstruir las secciones.
- Sustituir los índices globales antiguos por índices generados de la nueva estructura. Los originales siguen disponibles en la copia íntegra.
- Repetir cabeceras de tablas únicamente cuando se paginen según la regla anterior.

Conserva literalmente el contenido funcional importado fuera de esas transformaciones: decisiones, redacción, tablas, filas, columnas, fórmulas, valores, unidades, advertencias, excepciones, ejemplos, identificadores y referencias.

No aproveches esta tarea para corregir estilo, eliminar repeticiones, refundir reglas parecidas o resolver contradicciones nuevas. Cualquier observación editorial o funcional se registra con su ubicación y efecto, sin cambiar el diseño por iniciativa propia.

### 6.4. Correspondencias y prueba de conservación

El `manifest.json` debe permitir conocer:

- Identidad y hash del original importado.
- Cada capítulo y fragmento de origen, su orden y su destino.
- Los anclajes que permiten localizar los contenidos originales en las secciones.
- Las transformaciones de navegación aplicadas.
- Qué índices antiguos se sustituyeron como navegación, sin presentarlos como contenido omitido.
- El orden de composición del completo vigente.

Usa un registro de bloques y rangos de origen suficiente para comprobar la conservación. No copies el texto completo dentro del JSON ni crees un registro independiente por frase.

Comprueba la importación reconstruyendo el contenido desde los módulos y comparándolo con el original. Solo pueden excluirse o normalizarse las transformaciones documentales expresamente permitidas. La comparación no puede ignorar diferencias en palabras, números, filas, fórmulas o excepciones. Un recuento parecido de palabras no demuestra que la migración sea íntegra.

En `COBERTURA.md`, presenta el resultado y una tabla compacta por capítulo con sus destinos. La correspondencia detallada se consulta en el manifiesto y en los índices locales; evita otro apéndice narrativo gigantesco.

Si falta un fragmento o la comparación falla, corrige el problema o informa de la limitación. No marques la conservación como aprobada basándote únicamente en inspecciones de muestra.

## 7. Índices que ahorren lecturas

### 7.1. Índice general

`docs/README.md` debe permitir localizar normas, estado, funcional, técnica, prompts, decisiones, histórico y exportados. Añade una tabla «tarea → lecturas de entrada».

### 7.2. Índice del motor e índices locales

Incluye:

- Qué regula cada familia y cada documento.
- Enlace al archivo o apartado concreto.
- Dependencias directas relevantes, sin una lista indiscriminada de todo el motor.
- Cuándo consultar el completo o el histórico.
- Aviso de que diseño definido y funcionalidad implementada son estados distintos.

Ejemplos de rutas de consulta que debes dejar resueltas con los archivos reales creados:

| Tarea | Entradas mínimas pertinentes |
|---|---|
| Cambiar energía | Tiempo y esfuerzo; estados del jugador; rotación; auditorías relacionadas. |
| Revisar el uso de una táctica | Ataque o defensa correspondiente; repertorio; selección y resolución; evidencia táctica pertinente. |
| Revisar la influencia de un atributo | Definición de la capacidad; situaciones de uso y resolución; casos de auditoría relacionados. |
| Corregir una atribución estadística | Registro de acontecimientos; política de atribución; acta y comprobaciones afectadas. |
| Preparar una tanda de partidos | Laboratorio; población; configuración; semillas; formato de exportación. |
| Analizar un paquete de partidos | Formato y manifiesto del paquete; diccionario de registros; configuración utilizada; auditoría solicitada. |
| Retomar una implementación | Estado actual; prompt y ejecución anterior; documentos de los temas afectados. |

La lectura habitual será: normas comunes → índice → tema → dependencias pertinentes. Si aparece una dependencia nueva durante una tarea, amplía la consulta de forma dirigida.

Evita instrucciones permanentes de leer todo el repositorio, todos los prompts o el funcional completo antes de cada cambio. Tampoco impongas un límite artificial que impida leer una dependencia necesaria. El objetivo es contexto suficiente y pertinente.

## 8. Archivo de prompts y ejecuciones

### 8.1. Texto original

Archiva este prompt completo en la ruta indicada. Copia el archivo suministrado; no lo reconstruyas de memoria ni lo sustituyas por un resumen. Si lo recibes solo como mensaje, conserva íntegramente el texto recibido e identifica ese medio de entrada.

Los prompts posteriores seguirán el patrón `<ID>-<asunto>.md`. Conserva los identificadores que ya existan; no renumeres la historia. Distingue las plantillas de los prompts preparados y de las ejecuciones reales.

Un prompt ejecutado conserva su texto. Los cambios de alcance, instrucciones adicionales o correcciones se guardan como continuaciones numeradas e identificadas, por ejemplo `DOC-001-C01-<asunto>.md`, enlazadas al encargo. No edites el original para hacer que parezca que ya pedía el resultado final.

### 8.2. Catálogo y resultado

El índice de prompts debe registrar al menos:

- Identificador, objetivo y enlace al texto.
- Estado: preparado, en ejecución, ejecutado pendiente de revisión, requiere corrección, validado por Dennis o cancelado/sustituido, según corresponda.
- Fecha real de ejecución y número de intento cuando haya repetición.
- Revisión de partida de los documentos o commit base, si existe.
- Rama, PR y commits, cuando estén disponibles.
- Resultado breve, comprobaciones realizadas, limitaciones y pendientes.
- Continuaciones relacionadas.

Mantén el texto original separado de los metadatos de ejecución que cambian. Cuando el historial crezca, añade una ficha breve por ejecución y conserva el índice como directorio, sin convertirlo en un diario interminable.

Para DOC-001, registra la revisión y evidencia hasta el último punto realmente comprobado. Un campo que no pueda cerrarse dentro del propio commit, como su SHA final o la URL de una PR aún no creada, puede completarse en la entrega o en una actualización posterior del registro. No fabriques referencias ni persigas una autorreferencia de hashes.

No marques DOC-001 como «validado por Dennis» al terminar tú. Tampoco inventes prompts de conversaciones antiguas no suministradas: si se conocen solo por una mención, señala que su texto no está disponible.

### 8.3. Plantilla de futuros prompts

La plantilla debe pedir:

1. Identificador, objetivo y resultado visible esperado.
2. Archivos obligatorios y dependencias de entrada.
3. Decisiones aprobadas aplicables y cuestiones pendientes conocidas.
4. Alcance, exclusiones y tareas ordenadas.
5. Criterios de aceptación concretos.
6. Comprobaciones automáticas mínimas necesarias, con su propósito.
7. Pruebas manuales para Dennis, con resultado esperado.
8. Documentación y registros que cambiarán.
9. Formato de entrega: archivo MD, rama/PR cuando corresponda, resultado real y pendientes.

La plantilla remite a las normas comunes: no necesita volver a pegar N01–N12 y todo el funcional en cada encargo.

## 9. Decisiones, estado y changelog

### 9.1. Decisiones

El registro identifica fecha real, decisión, aceptación, motivo breve y documentos afectados. Para esta entrega puedes registrar la aprobación de la organización documental y de las normas de este prompt como decisiones de Dennis. No registres como recién decididas todas las decisiones del motor ya conservadas en el funcional.

Reserva fichas separadas para decisiones relevantes que necesiten explicación. Las erratas y movimientos de archivos no requieren un ADR propio. La definición vigente vive en su módulo; el registro explica el cambio y enlaza a ella.

### 9.2. Estado

`docs/estado.md` será una fotografía breve y actual, no otro changelog. Debe decir qué hay realmente en el repositorio, qué se ha entregado, qué se ha comprobado y qué sigue pendiente. Si todavía no existe implementación del motor o laboratorio, dilo expresamente.

Identifica los datos, filas de catálogo, calibraciones o trabajos que el propio funcional deja por completar. Su existencia no significa que falte una decisión que debas inventar. Tampoco marques todo el motor como implementado por haber importado su documentación.

### 9.3. Changelog

Añade una entrada corta de DOC-001 con fecha real, organización realizada, nuevas normas, estado de la importación y referencia al prompt. Conserva el historial previo. No conviertas cada movimiento o archivo generado en una entrada independiente.

## 10. Completo vigente, valores y utilidades documentales

### 10.1. Dos completos con propósitos identificados

- `docs/historico/motor/unificado-original.md`: copia original congelada, idéntica al archivo recibido.
- `docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md`: exportado actual generado desde la documentación temática.

El exportado actual debe incluir una cabecera que indique su carácter generado, las fuentes y la versión documental o revisión de composición real. Evita marcas de tiempo variables que generen cambios de Git al reconstruir sin modificaciones.

Recompón capítulos, orden, tablas y enlaces internos para una lectura integral. El exportado no puede limitarse a un listado de enlaces a los módulos. Debe contener todo el funcional vigente, incluyendo los anexos de referencia y trazabilidad.

El original se conserva íntegro para consulta; el exportado refleja el estado actual de las secciones. Nunca se utiliza un archivo generado para sobrescribir automáticamente cambios vigentes en las secciones.

### 10.2. Parámetros y estados de los datos

El funcional conserva sus cifras, tablas y etiquetas actuales. No conviertas ejemplos o semillas en parámetros calibrados. Cuando exista configuración ejecutable en una entrega futura, la documentación explicará su significado, límites y efecto, y la configuración versionada identificará el valor usado en cada ejecución. Esta entrega no crea ni calibra esos datos.

### 10.3. Utilidades pequeñas

Reutiliza utilidades documentales existentes si cubren estas operaciones. Si no existen, crea únicamente dos utilidades pequeñas bajo `scripts/docs/`, con Python 3 y librería estándar:

- `build_engine_docs.py`: genera el completo vigente desde el manifiesto y los módulos en su orden.
- `check_engine_docs.py`: comprueba importación, integridad documental y actualización del exportado.

El proceso de partición inicial puede apoyarse en una utilidad temporal local; no necesita convertirse en una plataforma de documentación ni quedar como otro sistema de la aplicación.

Documenta los comandos exactos que realmente funcionen. No introduzcas un servidor, un generador de webs, paquetes npm, servicios externos o un pipeline pesado. No cambies el CI del juego para esta entrega salvo que ya exista una comprobación documental sencilla que solo necesite apuntar a las nuevas rutas.

La comparación contra el original es una verificación de la importación inicial. Los cambios funcionales aceptados futuros pueden modificar las secciones: conserva la evidencia del punto de importación y verifica después la coherencia de la versión vigente. No impongas que una regla nunca pueda cambiar porque ya no coincida con el original histórico.

## 11. Logs y paquetes masivos de partidos

Conserva íntegramente en el tema del laboratorio y en sus referencias el formato de exportación, los logs descargables y el contenido para analizar partidos y lotes que ya defina el funcional, incluida la ampliación del MD08.

Añade la norma de almacenamiento acordada: los paquetes masivos son artefactos descargables vinculados a una ejecución o auditoría. El repositorio conserva su identificación, ubicación, versión de motor/configuración, manifiesto y conclusiones cuando existan. No se pegan logs masivos dentro de los índices ni se exige leerlos en cada tarea.

No generes partidos, datasets, paquetes ficticios ni servicios de alojamiento en esta PR. Documenta la política y preserva el contrato de exportación existente sin inventar campos adicionales para el motor.

## 12. Orden de ejecución de esta entrega

1. **Inspeccionar:** repositorio, estado de Git, normas e inputs disponibles. Registrar el commit base real si existe.
2. **Aislar:** crear o continuar de forma segura la rama `docs/DOC-001-organizacion-documental`. No mezclar cambios ajenos.
3. **Conservar:** guardar el funcional original y su identidad; conservar también cualquier documentación previa que vaya a sustituirse y tenga contenido único.
4. **Normar:** crear o actualizar `AGENTS.md` y `CLAUDE.md` con las reglas de este encargo.
5. **Archivar:** guardar este prompt exacto, su entrada de catálogo y la plantilla para futuros prompts.
6. **Seccionar:** aplicar la asignación de capítulos y las reglas mecánicas de partición; conservar todo el contenido.
7. **Enlazar:** generar índices locales, mapa por tareas, enlaces cruzados y correspondencias.
8. **Recomponer:** generar el funcional completo vigente desde las secciones.
9. **Comprobar:** ejecutar las verificaciones documentales concretas del apartado siguiente; corregir fallos.
10. **Registrar:** actualizar estado, decisiones pertinentes, cobertura y changelog con resultados reales.
11. **Entregar:** revisar el diff, crear commits coherentes y abrir una PR si el entorno y los permisos lo permiten. No fusionar. Si no se puede abrir la PR, deja los cambios y commits preparados e informa de la limitación exacta.

Este encargo autoriza estas operaciones documentales: no pidas aprobación entre cada paso. Si aparece un conflicto que requiera decidir comportamiento del juego, conserva la fuente y formula la cuestión concreta, avanzando con las partes independientes.

## 13. Verificaciones automáticas de DOC-001: solo las pertinentes

Esta entrega es documental. Ejecuta estas comprobaciones acotadas; no lances simulaciones, pruebas del motor, E2E ni la batería completa de la aplicación por una reorganización de Markdown.

### A. Conservación de la importación

- El SHA-256 del archivo recibido coincide con el de la copia histórica.
- Todos los capítulos y fragmentos sustantivos tienen destino o una clasificación explícita de navegación sustituida.
- La reconstrucción de la importación preserva el contenido salvo las transformaciones documentales permitidas.
- Tablas, fórmulas, identificadores, estados y referencias se conservan. No basta comparar cantidades globales.

### B. Navegación e integridad

- Los enlaces locales de los nuevos índices y módulos apuntan a archivos y anclajes existentes.
- Los enlaces internos originales siguen funcionando después de la división y en el exportado.
- Los identificadores explícitos se mantienen sin colisiones incompatibles dentro de su destino.
- Las tablas paginadas, bloques de código y fórmulas no quedan cortados o mal cerrados por la partición.
- Todo documento funcional creado es alcanzable desde el índice pertinente.
- No hay enlaces a los ocho originales si esos archivos no fueron suministrados.

Comprueba localmente los destinos. No hagas un barrido HTTP de todas las fuentes externas del funcional: verificar de nuevo la investigación no es el objetivo de esta entrega. Si una referencia ya venía incompleta, consérvala y registra la incidencia sin fabricar su destino.

### C. Exportado y ámbito del diff

- La reconstrucción es reproducible y no genera cambios cuando las secciones no cambian.
- El completo vigente coincide con lo que genera la utilidad a partir de las secciones.
- El diff contiene documentación y las utilidades documentales permitidas; el juego, dependencias y datos ajenos no se han alterado.
- La documentación distingue ejecución de Claude y validación pendiente de Dennis.

Reporta comandos reales, resultado y excepciones. Repite una comprobación solo si cambias lo que verificaba, si falla o si aparece una duda pertinente. No conviertas estas verificaciones en una suite general con objetivos de cobertura.

## 14. Revisión manual para Dennis

Deja esta lista, completada con enlaces reales y resultados esperados. Márcala como pendiente de Dennis, salvo los pasos que Dennis haya confirmado:

| Paso | Resultado esperado |
|---|---|
| Abrir el README del repositorio. | Se entiende qué hay ahora y dónde empezar a consultar. |
| Abrir las normas y buscar «prompts en Markdown» y «pruebas». | Figuran el archivo MD obligatorio y la política de automatización proporcionada con revisión manual de Dennis. |
| Buscar energía, tácticas y estadísticas desde los índices. | Cada materia se localiza por rutas claras y muestra sus dependencias. |
| Abrir una tabla extensa o un anexo dividido. | Se consulta por partes, con títulos, orden y enlaces coherentes. |
| Abrir el funcional original y el completo vigente. | Se distinguen su propósito y su procedencia; ambos contienen el documento que corresponde. |
| Consultar la cobertura de un capítulo. | Se ve dónde se conservó su contenido y qué verificación se realizó. |
| Abrir el catálogo de prompts y DOC-001. | Está el texto completo enviado, su estado real y la trazabilidad disponible. |
| Abrir el estado del proyecto. | El diseño documentado no aparece confundido con implementación o calibración terminadas. |

Recorre tú los enlaces y la navegación básica que puedas verificar en tu entorno. No hace falta desarrollar una interfaz ni ejecutar el juego para realizar esta revisión documental. Si no puedes comprobar la presentación en GitHub, diferencia esa limitación de la comprobación local de los enlaces.

## 15. Criterios de aceptación

- [ ] Se ha trabajado únicamente en beM.
- [ ] Esta entrega no implementa el motor ni el laboratorio y no cambia el stack.
- [ ] Las diez normas previas y las nuevas N11–N12 están incorporadas a las instrucciones del repositorio.
- [ ] Las instrucciones de Claude exigen lectura dirigida y señalan el límite de decisiones de producto.
- [ ] El prompt original de DOC-001 está archivado íntegro; catálogo y plantilla están disponibles.
- [ ] El funcional recibido se conserva byte a byte con identidad y SHA-256.
- [ ] Su contenido sustantivo está íntegramente seccionado por temas, incluyendo estados, tablas, fórmulas, casos, referencias y trazabilidad.
- [ ] Las correspondencias y la comprobación de conservación permiten revisar que no hay omisiones.
- [ ] Los índices permiten localizar temas sin leer el completo ni todo el histórico.
- [ ] Existe una única definición vigente por materia; las referencias históricas y el exportado están identificados.
- [ ] El completo vigente se genera desde las secciones y puede reconstruirse con los comandos documentados.
- [ ] Los enlaces locales nuevos y trasladados han sido comprobados y las incidencias existentes están identificadas.
- [ ] Los originales no suministrados están declarados como tales, sin reconstrucciones ni enlaces ficticios.
- [ ] Estado, decisiones pertinentes y changelog reflejan lo realmente realizado.
- [ ] Solo se han ejecutado verificaciones pertinentes y se entrega la lista manual para Dennis.
- [ ] No se ha marcado validación de Dennis ni fusión que todavía no hayan sucedido.
- [ ] Los cambios están preparados en una rama y PR, o la limitación para ello está explicada.

Si un criterio no se cumple, indícalo con precisión. No declares toda la entrega terminada porque se hayan creado carpetas o porque un recuento de archivos sea correcto.

## 16. Respuesta final que debes entregar

Presenta una respuesta breve y comprensible para Dennis con:

1. Qué se ha organizado y qué normas han quedado incorporadas.
2. Enlaces al índice general, índice del motor, normas, funcional original, completo vigente y prompt archivado.
3. Resultado de conservación y navegación, con los comandos de verificación disponibles.
4. Rama, PR y commits reales, si existen.
5. Incidencias, originales ausentes y cualquier criterio pendiente, distinguiendo lo que bloquea de lo meramente histórico.
6. Los pasos manuales que Dennis debe revisar.

No empieces a implementar el motor al acabar. La siguiente entrega se definirá mediante otro prompt en MD, usando esta documentación ya organizada.
