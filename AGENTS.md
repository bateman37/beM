# AGENTS.md — contrato común de trabajo en beM

Normas comunes para cualquier persona o IA que trabaje en este repositorio. Es la única fuente de estas normas: `CLAUDE.md` y los prompts remiten aquí en lugar de copiarlas. El diseño del motor **no** se pega en este archivo; se consulta por temas desde [`docs/README.md`](docs/README.md).

## 1. Responsabilidades

| Rol | Responsabilidad |
|---|---|
| **Dennis** | Diseñador y responsable de producto: decide prioridades y comportamiento del juego, acepta las entregas y realiza una parte importante de las pruebas manuales. No necesita leer ni modificar código para validar una entrega. |
| **ChatGPT** | Investiga, ayuda a cerrar decisiones y prepara diseños y prompts concretos. **Las consultas a otros repositorios o referencias las realiza ChatGPT**; sus conclusiones se incorporan de forma expresa a los documentos y prompts de beM. |
| **Claude Code** | Implementa lo aprobado, comprueba su trabajo, mantiene los documentos afectados y explica los resultados en términos comprensibles para Dennis. |

Se trabaja **exclusivamente en `beM`**. No se abren, clonan, buscan ni recorren `basket-manager`, `BeManager` ni otros repositorios de referencia, aunque sean accesibles. Que un documento cite una referencia no autoriza a inspeccionar su repositorio. Los archivos históricos son antecedentes: no se trasladan decisiones técnicas, datos, fórmulas ni funcionalidades del antiguo Basket Manager o BeManager sin decisión expresa.

## 2. Límite de las decisiones

Claude puede resolver detalles técnicos **internos, locales y reversibles** dentro del alcance y el stack ya acordados. **No** puede decidir nuevas reglas de juego, probabilidades, atributos, tácticas, prioridades de producto, alcance visible, formatos de competición ni comportamientos no definidos. No cambia ni elige el stack, no instala dependencias o herramientas no pedidas y no rellena vacíos funcionales inventando reglas.

Cuando falte una decisión de producto, comunica **`DECISIÓN REQUERIDA`** con:

1. la cuestión concreta;
2. las referencias consultadas;
3. opciones y consecuencias;
4. el trabajo afectado.

Y continúa con las partes independientes que sí estén definidas. No se vuelve a pedir aprobación para decisiones ya aceptadas.

## 3. Normas de trabajo (N01–N12)

| ID | Norma permanente |
|---|---|
| N01 | Entregas medianas, delimitadas y funcionales. Cada entrega tiene un objetivo comprobable y un cierre; se evitan los encargos abiertos de «continuar indefinidamente». |
| N02 | Una rama y una PR por bloque, con commits coherentes. Claude no fusiona la PR: Dennis valida y decide la fusión. |
| N03 | Mantener `main` ejecutable y jugable cuando exista aplicación. En una fase solo documental se registra el estado real, sin fingir que ya hay juego. |
| N04 | Pruebas automáticas mínimas y suficientes para el cambio: invariantes, reglas y simulación cuando correspondan. Su alcance es proporcional y justificable. |
| N05 | Cada entrega incluye pruebas manuales concretas, con pasos y resultado esperado. Dennis realizará muchas de ellas. |
| N06 | Si una entrega modifica la interfaz, Claude recorre el camino básico real cuando dispone del entorno e informa de lo recorrido y de las limitaciones. No sustituye la revisión funcional de Dennis. |
| N07 | Prompts delimitados: objetivo, lecturas necesarias, alcance, exclusiones, tareas, criterios de aceptación y comprobaciones. Los defectos ajenos se registran sin ampliar silenciosamente la entrega. |
| N08 | Cada entrega mantiene la documentación afectada, registra decisiones nuevas cuando existan y añade una entrada breve al changelog. No se reescriben documentos ajenos al cambio. |
| N09 | El diseño lo decide Dennis con el trabajo de análisis acordado. Claude señala la decisión pendiente y sigue con lo independiente (ver apartado 2). |
| N10 | Todos los prompts ejecutados se conservan en el repositorio, incluidos hotfixes y continuaciones relevantes, con su texto original y trazabilidad. |
| N11 | **Entrega de prompts en Markdown.** Siempre que Dennis pida un prompt para Claude Code, lo recibe como un **archivo `.md`**, íntegro y listo para usar, con enlace de descarga o acceso al archivo. Un resumen o un bloque pegado en el chat no lo sustituyen. Si se prepara desde un entorno con acceso al repositorio, se archiva también en [`docs/prompts/`](docs/prompts/README.md) con su estado correcto. Un prompt preparado no se marca como ejecutado. |
| N12 | **Automatización de pruebas proporcionada y revisión manual de Dennis.** Se ejecutan las pruebas automáticas necesarias para comprobar el cambio y proteger reglas importantes; Dennis hace una parte sustancial del test funcional manual. Se evitan las baterías enormes, las duplicaciones, la cobertura por cantidad, los barridos masivos sin hipótesis y las pruebas que solo repiten la implementación. Que exista un laboratorio capaz de simular miles de partidos no obliga a lanzar esos lotes en cada PR: se ejecutan cuando una auditoría concreta los requiere o Dennis los pide. |

### Aplicación práctica de N04, N05 y N12

- Se eligen las comprobaciones por el riesgo y el comportamiento que cambia, y se explica brevemente qué comprueba cada una.
- Se reutilizan pruebas pertinentes. No se crean pruebas nuevas para un cambio pequeño y reversible que ya quede comprobado de otra forma.
- Se respetan las comprobaciones obligatorias ya acordadas; no se eliminan para presentar un resultado correcto.
- No se ejecuta toda la batería ni se amplía el muestreo ni se repiten comprobaciones por inercia tras pasar las necesarias. Solo se amplía si hay un fallo, un cambio nuevo o una duda material.
- Cuando exista una puerta técnica básica, debe poder ejecutarse sin una base de datos activa si así lo prevé la arquitectura; las pruebas que necesitan base real se identifican por separado.
- Se presenta una lista manual breve y específica, distinguiendo **«comprobado por Claude»**, **«pendiente de Dennis»** y **«no ejecutado por una limitación»**.
- No se declara aprobado por Dennis un caso que Dennis no haya probado o aceptado.
- Una suite correcta no demuestra por sí sola que el partido sea convincente ni que una fórmula esté calibrada.

## 4. Lectura dirigida

La lectura habitual es: **normas comunes → índice → tema → dependencias pertinentes**.

1. Este archivo.
2. [`docs/README.md`](docs/README.md) (índice general y mapa «tarea → lecturas de entrada»).
3. El índice del tema afectado: [`docs/motor/README.md`](docs/motor/README.md) y el `README.md` de su carpeta.
4. Las dependencias que ese tema señale y que afecten a la tarea.
5. [`docs/estado.md`](docs/estado.md) y el último prompt ejecutado si se retoma una implementación.

No hay obligación de leer todo el repositorio, todos los prompts ni el funcional completo antes de cada cambio, y tampoco un límite artificial que impida leer una dependencia necesaria. Si aparece una dependencia nueva durante la tarea, se amplía la consulta de forma dirigida.

## 5. Autoridad documental

Resumen; el detalle está en [`docs/README.md`](docs/README.md#autoridad-documental).

1. Las instrucciones expresas vigentes de Dennis y los cambios funcionales aceptados tienen prioridad; al registrar un cambio aceptado se actualiza el documento temático.
2. Los documentos temáticos de [`docs/motor/`](docs/motor/README.md) son la referencia vigente por materia. El exportado [`beM-MOTOR-COMPLETO-VIGENTE.md`](docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md) se **genera** desde ellos y nunca se edita a mano.
3. La copia [`unificado-original.md`](docs/historico/motor/unificado-original.md) es una referencia congelada y nunca se sobrescribe.
4. Los prompts conservan el encargo y su historia; no alteran por sí solos el funcional.
5. La fecha de modificación de un archivo no determina la prioridad de una regla.

Se mantienen separados: **diseño funcional** (lo que queremos), **documentación técnica** (cómo está implementado), **estado de entrega** (qué existe y qué se ha comprobado) e **histórico y evidencia**.

Los estados del funcional (DEC, FUN, SEM, CARGA, EVAL, Ilustración) no son equivalentes ni se simplifican: «definido», «implementado», «validado», «semilla provisional» y «calibrado» son cosas distintas. Ver [`docs/motor/uso-y-estados.md`](docs/motor/uso-y-estados.md).

## 6. Prompts y changelog

- Los prompts se archivan como `<ID>-<asunto>.md` en [`docs/prompts/`](docs/prompts/README.md); las continuaciones como `<ID>-C01-<asunto>.md`. No se renumera la historia ni se edita un prompt ejecutado.
- Plantilla: [`docs/prompts/plantilla-prompt.md`](docs/prompts/plantilla-prompt.md).
- Cada entrega añade una entrada breve a [`CHANGELOG.md`](CHANGELOG.md) y actualiza [`docs/estado.md`](docs/estado.md).

## 7. Logs y paquetes masivos de partidos

Los paquetes masivos son **artefactos descargables** vinculados a una ejecución o auditoría. El repositorio conserva su identificación, ubicación, versión de motor y configuración, manifiesto y conclusiones cuando existan; no se pegan logs masivos en los índices ni se exige leerlos en cada tarea. El contrato de exportación está en el tema [laboratorio](docs/motor/laboratorio/README.md); su implementación (esquema `beM-analysis-package/1`, partición y comprobador `npm run batch:check`) está en [`docs/tecnico/motor12.md`](docs/tecnico/motor12.md).

## 8. Utilidades documentales

- Reconstruir el exportado: `python3 scripts/docs/build_engine_docs.py`.
- Comprobar integridad, enlaces y exportado: `python3 scripts/docs/check_engine_docs.py`.
- Además, en el punto de importación inicial: `python3 scripts/docs/check_engine_docs.py --importacion`.

Tras editar cualquier sección de `docs/motor/` se reconstruye el exportado y se ejecuta la comprobación. Más detalle en [`docs/exportados/README.md`](docs/exportados/README.md).
