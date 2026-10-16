# MOTOR-03 — Panel administrable, perfiles y comparación de ajustes

**Proyecto:** beM.  
**Destinatario:** Claude Code, exclusivamente en el repositorio `beM`.  
**Fecha:** 16 de octubre de 2026.  
**Estado del prompt:** preparado para ejecutar; no acredita implementación ni comprobaciones realizadas.  
**Situación comunicada por Dennis:** MOTOR-01 y MOTOR-02 integrados en `main`. Dennis confirmó sus pruebas correctas de MOTOR-01; la integración de MOTOR-02 no se presenta aquí como una auditoría de su código.  
**Entrega:** MOTOR-03 del roadmap aceptado. Una rama, una PR revisable, sin fusionar.

## Índice

1. [Encargo y resultado](#1-encargo-y-resultado)
2. [Fuentes, autoridad y preparación](#2-fuentes-autoridad-y-preparación)
3. [Alcance y límites](#3-alcance-y-límites)
4. [Inventario real y una sola configuración efectiva](#4-inventario-real-y-una-sola-configuración-efectiva)
5. [Diccionario y clasificación de los datos](#5-diccionario-y-clasificación-de-los-datos)
6. [Panel: navegación, mesa de ajustes y tabla maestra](#6-panel-navegación-mesa-de-ajustes-y-tabla-maestra)
7. [Edición tipada y previsualización](#7-edición-tipada-y-previsualización)
8. [Herencia, condiciones y resolución](#8-herencia-condiciones-y-resolución)
9. [Ciclo de los perfiles y conservación](#9-ciclo-de-los-perfiles-y-conservación)
10. [Validación e invariantes](#10-validación-e-invariantes)
11. [Comparación base/candidata sobre partidos completos](#11-comparación-basecandidata-sobre-partidos-completos)
12. [Trazabilidad, diagnóstico e intercambio](#12-trazabilidad-diagnóstico-e-intercambio)
13. [Comprobaciones automáticas acotadas](#13-comprobaciones-automáticas-acotadas)
14. [Recorrido manual para Dennis](#14-recorrido-manual-para-dennis)
15. [Ejecución, documentación y cierre](#15-ejecución-documentación-y-cierre)
16. [Anexo: catálogo funcional de cobertura](#16-anexo-catálogo-funcional-de-cobertura)

## 1. Encargo y resultado

Implementa MOTOR-03 sobre el motor y el laboratorio existentes. Construye un panel que Dennis pueda utilizar para entender, modificar y comparar el comportamiento numérico del motor **sin editar código ni escribir un JSON a mano**.

No basta un editor de cinco constantes, una tabla decorativa o un árbol de campos sin explicar. Debe haber una tabla maestra amplia, vistas temáticas y una mesa de ajustes que lleve desde una pregunta deportiva a los parámetros pertinentes.

Recorrido de cierre:

1. Abrir el panel y reconocer perfil activo, versión, procedencia y cobertura.
2. Buscar un problema, por ejemplo «el cansancio apenas se nota».
3. Entender las filas que realmente intervienen, sus unidades y el efecto previsto.
4. Clonar una base y modificar un borrador con diferencias visibles.
5. Validar estructura, herencia, referencias y compatibilidad.
6. Comparar base y candidata mediante encuentros completos identificados.
7. Conservar el experimento, descartarlo o activar una nueva versión para partidos futuros.
8. Descargar el perfil y el informe con lo necesario para estudiar el ajuste.

Un partido ya iniciado conserva sus parámetros congelados. Sus órdenes tácticas siguen funcionando conforme a MOTOR-02. Editar un perfil no es una orden del entrenador ni permite cambiar silenciosamente una probabilidad a mitad de ese partido.

La complejidad debe estar en el repertorio de datos consultables y sus relaciones. El uso normal debe ser sencillo: concepto, valor, unidad, efecto, diferencia y evidencia. No construyas un lenguaje de programación para Dennis.

## 2. Fuentes, autoridad y preparación

### 2.1. Lectura selectiva

Confirma repositorio, estado de Git y base actual. Lee `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, índices, estado de entregas y roadmap. Localiza las páginas temáticas vigentes de:

| Capítulo original del funcional unificado | Consulta necesaria |
|---|---|
| 26 | Panel, diccionario, perfiles, herencia, edición, activación y congelación. |
| 27 | Inventario de 81 grupos, cuatro soportes y clasificación entre configuración, entradas y registros. |
| 28 | Validación, auditoría y comparación; solo las comprobaciones pertinentes al incremento. |
| 29 | SEM, CARGA, EVAL y condición de perfil utilizable. |
| 24 | Laboratorio y relación entre perfil, entradas y modalidades. |
| 19 | Versiones, registros y reproducción. |
| 15 y 18 | Separación entre órdenes y parámetros; obligaciones reglamentarias. |
| 11–13 | Solo operaciones y datos efectivos que debas conectar al panel. |

Consulta los prompts archivados de MOTOR-01/02 para sus contratos y límites cuando sea necesario. Usa índices y búsquedas; no vuelques todo el funcional, los ocho originales ni todos los prompts históricos.

Este prompt concreta el incremento del roadmap. El diseño vigente y cualquier corrección posterior expresamente aceptada prevalecen. No rescates una fórmula sustituida de un documento antiguo.

### 2.2. No conocemos desde este prompt el código exacto fusionado

ChatGPT no ha inspeccionado la implementación actual de `main`. Localiza las rutas y contratos reales; conserva lo válido. Los nombres técnicos sugeridos son semánticos, no una orden de recrear archivos si ya existe su equivalente.

La integración comunicada de MOTOR-02 es el punto de partida. No declares que Claude ni ChatGPT han validado manualmente todas sus pantallas. Si detectas una regresión que impide MOTOR-03, corrígela de forma localizada y deja evidencia; no abras una reescritura general.

### 2.3. Autonomía delimitada

- Trabaja solo en `beM`. No abras, clones ni inspecciones otros repositorios, incluidos basket-manager, BeManager y ZenGM.
- Conserva stack, comandos y forma de arranque aprobados. No migres framework ni impongas PostgreSQL, ORM, Docker, autenticación, cuentas o despliegue.
- Las decisiones técnicas internas reversibles son tuyas. Los cambios funcionales y las nuevas cifras de balance no lo son.
- Si falta una decisión funcional indispensable, señala `DECISIÓN REQUERIDA`, referencias y efecto. Avanza con lo independiente. El contenido explícitamente diferido a otra entrega no constituye un bloqueo de diseño.
- No recalibres para producir un marcador más atractivo ni añadas una nueva capacidad o subsistema.

## 3. Alcance y límites

### 3.1. Incluido

1. Inventario de todos los parámetros ajustables consumidos por MOTOR-01/02 y correspondencia con sus mecanismos.
2. Diccionario común y catálogo de cobertura de los 81 grupos deportivos más SUP01–SUP04.
3. Inicio del panel, mesa guiada, tabla maestra, vistas por temas, detalle de mecanismo, historial y comparador.
4. Edición de las filas activas de pesos, referencias, sensibilidades, curvas, duraciones, carga, recuperación y políticas ya representadas.
5. Separación de parámetros de balance, contenido, obligaciones reglamentarias e invariantes funcionales.
6. Perfiles con borrador, validación, evaluación identificada, publicación/activación, clonación, restauración e intercambio.
7. Herencia con padres versionados, diferencias y valor efectivo trazable.
8. Congelación de la configuración efectiva en cada ejecución, incluida la comparativa.
9. Comparación inicial de partidos completos con entradas/semillas/órdenes identificadas y métricas existentes.
10. Conservación local de perfiles e historial y exportación/importación utilizable desde la interfaz.
11. Registro de qué filas reales participaron en mecanismos diagnosticados.

### 3.2. Cobertura incremental honesta

El panel controla **todo lo que el motor actual promete calibrar**, no solo una selección cómoda de campos. El catálogo final queda visible para situar lo pendiente, pero no obliga a implementar aquí tácticas, estados o estadísticas que llegan después.

Una fila implementada puede estar cargada como SEM, estructuralmente válida y todavía sin evaluación deportiva. Esas tres cosas no deben confundirse.

El perfil inicial de desarrollo debe estar completo para el subconjunto activo que declara. No se exige inventar los valores de los 81 grupos finales para activar esa cobertura incremental. Tampoco se permite marcar el diseño final como completado por validar solo MOTOR-01/02.

### 3.3. Fuera de alcance

- Completar ataque, defensas, saques, estados, memoria, políticas avanzadas o población previstos en MOTOR-04–11.
- Construir el sistema masivo de lotes y paquetes de MOTOR-12 o la campaña completa de auditorías/calibración de MOTOR-13.
- Crear una IA que recomiende y aplique automáticamente cambios de balance.
- Editar fórmulas arbitrarias, ejecutar código desde el panel o añadir operadores deportivos no existentes.
- Reescribir actas o registros históricos para que parezcan producidos por otra versión.
- Añadir funciones de manager, temporadas o persistencia multijugador.

La comparación inicial es una ejecución explícita de un enfrentamiento base/candidata; no es el constructor general de lotes. Las auditorías disponibles se muestran con su cobertura real y las restantes con su estado pendiente.

## 4. Inventario real y una sola configuración efectiva

### 4.1. Revisa el consumo, no solo los archivos de datos

Localiza los datos cargados por MOTOR-01/02 y sus lectores: selección, participantes, libertad, lectura, ejecución, oposición, rebote, tiempos, energía, rotación, órdenes y administración.

Inspecciona las operaciones para encontrar magnitudes deportivas calibrables todavía escritas como literales: referencias, mezclas, sensibilidades, límites deportivos, tolerancias y costes. Si existen, conviértelas en filas administradas **conservando exactamente su valor y significado actual**. No las sustituyas por números nuevos ni por otro modelo.

No conviertas automáticamente cada número en código en un parámetro. Índices, identificadores, estructuras, conversiones de unidad y constantes matemáticas no son coeficientes de balance. Explica las excepciones a la administración cuando sean estructurales o invariantes.

Produce un mapa compacto de: ID de fila, campo/ruta, unidad, mecanismo consumidor, clase, editable/consulta y estado de cobertura. Una tabla maestra que muestra un dato que la operación no consulta no cumple el encargo.

### 4.2. Un contrato de resolución

El perfil que pasa al núcleo debe ser un conjunto resuelto y validado. Las mismas filas alimentan panel, previsualizaciones, comparación, partido y exportación.

No mantengas constantes equivalentes en una vista sencilla, otra avanzada y el motor. No reconstruyas a mano los mismos valores en cada modalidad. Un ejemplo visual utiliza la función compartida pertinente, sin consumir azar ni modificar una sesión.

Una referencia requerida que falta da un error de configuración identificable; no activa un `valor || default` oculto. Cero no es ausencia. Los valores neutrales de entrada que ya forman parte del contrato se conservan como política explícita, no como reparación silenciosa de archivos incompletos.

### 4.3. No alterar el baloncesto al administrar

Antes y después de conectar la base actual al panel, la misma versión semántica de datos y operaciones debe conservar su desarrollo deportivo con la misma entrada/semilla/órdenes. El registro puede ampliarse sin mover los anclajes deportivos de MOTOR-02.

Si aparece un bug real que hace imposible conservar resultados, documenta el caso, la corrección y la diferencia de versión. No perpetúes el bug ni fuerces coincidencias artificiales.

## 5. Diccionario y clasificación de los datos

### 5.1. Ficha común

Cada fila calibrable activa debe tener, en campos estructurados o relaciones equivalentes:

| Campo | Requisito |
|---|---|
| ID estable | No depende del texto visible ni de la posición en un array. |
| Etiqueta y descripción | Nombre español y explicación concreta del efecto. |
| Grupo/subgrupo | Correspondencia con el catálogo funcional y vista temática. |
| Mecanismo/tarea | Operación que realmente consume el valor. |
| Actor/contraparte | Propietario del aporte y oposición pertinentes, cuando aplica. |
| Contexto | Selector admitido y universo donde se utiliza. |
| Clase | Balance, contenido, reglamento, invariante u otro dato identificado. |
| Tipo/unidad | Peso, probabilidad, sensibilidad, duración, energía, referencia, etc. |
| Restricciones | Dominio, límites, paso de edición y relaciones válidas. |
| Valores | Base/heredado, efectivo y candidato, con precisión conservada. |
| Origen | Perfil y versión exactos, fila y fuente de procedencia. |
| Efecto esperado | Qué cambia, bajo qué condiciones y qué no garantiza. |
| Dependencias | Otras filas, referencias, catálogos y vistas relacionadas. |
| Cobertura | Consumido, parcial, pendiente, no aplicable o ausencia requerida. |
| Estado de evidencia | SEM, referencia contrastada o ajuste evaluado con su alcance. |
| Fuente/muestra | Si existe; si falta, se declara sin inventarla. |
| Historial | Antes/después, motivo, revisión, evidencia y fecha auxiliar. |

No rellenes descripciones con «factor de balance». Debe entenderse si un peso aumenta selección de un participante, presencia en disputa o captura después de participar. Evita promesas como «subir esto siempre aumenta los puntos».

### 5.2. Cuatro clases protegidas

| Clase | Tratamiento en MOTOR-03 |
|---|---|
| Parámetro de balance | Editable en borrador dentro del contrato, con comparación. |
| Contenido declarativo | Editable solo en campos y combinaciones ya ejecutables; requiere validación de contenido. |
| Obligación reglamentaria | Consultable con perfil/fuente; no se altera en un perfil etiquetado FIBA para arreglar ratios. |
| Invariante funcional | Consultable y protegida; cambiarla requiere decisión funcional, no mover un deslizador. |

No crees ahora un editor de nuevos reglamentos. El reglamento vigente puede seguir identificado como componente separado y de solo lectura.

Ejemplos de invariantes: 32 capacidades; escala absoluta; mismo núcleo en los modos; no bonus directo de T al acierto; no doble prima de altura/envergadura/alcance; las tendencias no se suman como precisión al tiro; órdenes en fronteras válidas. Si el mecanismo está pendiente, la invariante se conserva como requisito, sin fingir una prueba ejecutada.

### 5.3. Configuración, entradas y registros

Separa el peso de una tarea, el atributo de un jugador y el resultado de un partido. Los dos últimos no se convierten en parámetros de balance del panel.

Las fichas iniciales siguen editándose desde el laboratorio. El panel puede enlazarlas como contexto, pero editar un peso no modifica las 32 notas del jugador, y restaurar un perfil no reescribe una plantilla previamente editada.

Los planes y órdenes son entradas del encuentro. Las tablas que traducen niveles de estilo o prioridades a pesos son configuración. No mezcles «poner prioridad 1 a esta jugada» con «cambiar el peso de prioridad 1 para todos los planes».

## 6. Panel: navegación, mesa de ajustes y tabla maestra

### 6.1. Inicio

Añade acceso visible desde el laboratorio. Muestra perfil activo para futuros partidos, versión, base/parentesco, cobertura, estado SEM/EVAL y última validación. Distingue el perfil seleccionado para consultar del activo y del borrador en edición.

Muestra cambios pendientes y acceso a crear candidata, validar, comparar, publicar/activar, restaurar, importar y exportar según su estado. El partido abierto indica por separado qué perfil congelado utiliza.

No es necesario un diseño visual nuevo para toda la aplicación. Sí debe ser utilizable en ordenador, con etiquetas españolas, scroll de tablas, formularios legibles y errores concretos.

### 6.2. Mesa de ajustes por pregunta

Incluye accesos guiados, vinculados a filas reales:

| Pregunta | Separación que debe ayudar a entender |
|---|---|
| «Se eligen demasiados triples» | Selección y preferencias frente a eficacia del tiro. |
| «Hay demasiadas pérdidas» | Oportunidad/decisión frente a ejecución y oposición. |
| «El cansancio apenas se nota» | Gasto, recuperación, curva de severidad y tarea afectada. |
| «Las estrellas salen demasiado» | Umbral de revisión, utilidad, tolerancias y estabilidad de rotación. |
| «El base sigue poco el libro» | Prioridades, libertad, Iniciativa y lectura. |
| «El partido va demasiado rápido» | Duración deportiva frente a velocidad de visionado. |
| «Se abusa de una jugada» | Masa familiar, elegibilidad, elección y cobertura de memoria todavía pendiente. |

Son caminos de consulta y posibles causas, no diagnósticos automáticos ni recetas ejecutadas. Muestra indicadores disponibles con su fuente; si aún no se registra una parte del embudo, indica esa limitación. No inventes percepción, oportunidades o causas a partir del marcador.

Cada acceso abre el conjunto pertinente de la tabla y el mecanismo. Ningún botón «arreglar triples» cambia selección y acierto a la vez sin declarar valores.

### 6.3. Tabla maestra

Requisitos:

- Búsqueda por ID, nombre y descripción.
- Filtros por grupo, tarea, contexto, tipo, procedencia y cobertura.
- Filtros «modificado», «SEM/provisional», «sin referencia», «con error/aviso de validación» y «usado por este mecanismo».
- Ordenación y columnas seleccionables; filas fijables para comparar.
- Columnas principales: nombre, grupo, unidad, base, efectivo, candidato, diferencia y estado.
- Detalle ampliable con toda la ficha, consumidores, dependencias e historial.
- Selección de filas compatibles y previsualización de edición conjunta.
- Enlaces desde fila a mecanismo, perfil de origen, validación y ejecución asociada cuando existan.

Utiliza una única fuente de datos para tabla y vistas guiadas. No hace falta una tabla física gigante ni una pantalla independiente por cada grupo funcional.

### 6.4. Vistas temáticas

Organiza los mismos datos en: selección ofensiva; defensa; capacidades por tarea y cuerpo; oportunidades/desenlaces; tiro; rebote/continuidad; tiempo/carga; estados; entrenador/órdenes; adaptación; reglamento; contenido; población/referencias; estadística/información; laboratorio; versiones/intercambio.

Las áreas futuras muestran su ficha funcional y estado pendiente, no decenas de controles inactivos que parezcan cargados. La cobertura puede ser parcial dentro de un mismo grupo. Los 81 grupos se catalogan, pero solo las filas ejecutadas tienen valores efectivos del motor actual.

## 7. Edición tipada y previsualización

### 7.1. Operaciones básicas

La edición actúa sobre un borrador. Permite cambiar un valor, restaurar la sobreescritura heredada y previsualizar cambios compatibles en conjunto. Aplicar al borrador no equivale a activar para futuros partidos.

En operaciones masivas ofrece de forma explícita: asignar valor, sumar una cantidad en la unidad del campo o multiplicar por un factor. No reutilices el +1/+3/+5 de habilidades como si todas las magnitudes del motor fueran notas.

La vista previa enumera filas, valor original, resultado y restricciones. No modifiques ninguna fila si la operación conjunta es inválida. No trunques valores a un rango ni normalices silenciosamente para hacerlos pasar.

Los números se muestran de forma legible en español, conservando su precisión interna. Introducir un decimal con coma debe tener una interpretación clara, no convertirse en otro número. El archivo de intercambio utiliza números estructurados con su unidad declarada.

### 7.2. Reglas por tipo

| Tipo | Editor y comprobación |
|---|---|
| Peso relativo | No negativo; muestra conjunto de alternativas y normalización que el mecanismo aplica. No lo etiqueta como porcentaje de resultado. |
| Distribución excluyente explícita | Mismo universo, categorías y suma válida; corrección conjunta explícita. |
| Probabilidad de referencia | Porcentaje legible y valor interno; dominio compatible con la fórmula, estrictamente entre 0 y 1 si se usa logit sin tratamiento especial. |
| Sensibilidad | Unidad, signo permitido y referencia; varios ejemplos de respuesta. |
| Multiplicador | Base de aplicación, límites y composición declarados. |
| Mezcla de capacidades | Propietario de cada componente, pesos y total definidos por la receta. |
| Curva | Nodos ordenados, ejes, interpolación y restricciones; vista en tabla o gráfico sencillo. |
| Duración | Unidad y distribución existente; mínimo ≤ habitual/moda ≤ máximo. |
| Umbral/tolerancia | Revisión que activa y relaciones con otros umbrales; no se confunde con orden obligatoria. |
| Categoría/referencia | Selector de catálogo válido; sin aceptar texto libre que el motor no comprende. |
| Condición compatible | Solo campos, operadores y combinaciones ya implementados. |

Una distribución de probabilidades y unos pesos de elección son cosas diferentes. El panel explica cómo se resuelve cada conjunto. Si ofrece «normalizar», enseña la transformación y exige aplicarla explícitamente al borrador.

No conviertas la logística de un suceso en otra normalización para facilitar el formulario. Mantén la estructura de resultados excluyentes, probabilidades binarias y relaciones condicionales compatible con el motor existente.

### 7.3. Pesos de capacidades y cuerpo

El detalle de tarea muestra principal, apoyos y oposición de sus participantes correctos. Conserva la propiedad de cada atributo y las restricciones funcionales vigentes. Muestra componentes a cero y diferencia entre irrelevancia declarada y cobertura todavía ausente.

No permitas cambiar una receta a un overall genérico ni aplicar la energía de un solo actor a todos los participantes. No conviertas edad/experiencia en un nuevo bonus. No desbloquees conexiones prohibidas de cuerpo, tendencia o momento por permitir edición de pesos.

No inventes ahora mínimos deportivos de «técnica principal» ni topes de sensibilidad no definidos: utiliza los del perfil/contrato actual. Si falta una restricción numérica indispensable, identifica el dato necesario. Los dominios matemáticos y las invariantes sí son validación obligatoria.

### 7.4. Previsualizaciones de mecanismo

Incluye ejemplos deterministas reutilizando las operaciones compartidas:

- Probabilidad de referencia y respuesta a varios valores de capacidad/oposición admitidos, con contexto fijo y visible.
- Pesos brutos y distribución normalizada de un conjunto declarado de alternativas elegibles.
- Curva de severidad de energía y penalización efectiva por tarea seleccionada.
- Distribución triangular y sus tres valores, sin convertir su moda en un tiempo garantizado.

Utiliza valores de ejemplo claramente etiquetados, no datos que se hagan pasar por frecuencias medidas. No consumas RNG deportivo para dibujar una curva. No prometas puntos por partido a partir de una previsualización local.

Cambiar 35 % a 38 % significa +3 puntos porcentuales y aproximadamente +8,57 % relativo. Ese ejemplo enseña unidades; no establece una nueva semilla de tiro de beM.

## 8. Herencia, condiciones y resolución

### 8.1. Padres inmutables y sobreescrituras

Una candidata puede heredar de una versión publicada y concreta. No hereda de un alias «última versión» que cambie después. Conserva vínculo, valores heredados y sobreescrituras identificadas.

Restablecer herencia elimina la sobreescritura: no asigna cero. Una restauración se registra como cambio y no borra los experimentos anteriores.

El conjunto resuelto se materializa para validar, comparar, publicar o iniciar un partido. Rechaza ciclos, padres ausentes y referencias ambiguas. No sustituyas un padre ausente por la base de fábrica sin avisar.

### 8.2. Contexto y composición

Respeta los selectores ya admitidos: tarea, contexto, zona/sector representado, preparación, participantes, reloj u otros campos existentes. No crees un intérprete de expresiones arbitrarias ni uses `eval`.

Si existen sobreescrituras contextuales, resuélvelas mediante especificidad y prioridad declaradas. Una colisión no resuelta bloquea la validación. El detalle muestra por qué ganó una fila y cuáles quedaron sustituidas.

No sumes todas las coincidencias por defecto. Cuando hay modificadores compatibles, su composición y límites son parte del mecanismo, no una decisión de la tabla visual.

No generalices selectores nuevos solo porque el diseño final los contemple: registra la cobertura pendiente y deja de solo lectura lo que el motor actual no puede ejecutar.

### 8.3. Diferencias entre perfiles

Compara valores efectivos por ID semántico, además de sobreescrituras. Distingue cambios de valor, contenido, procedencia, evidencia y mecanismo/versión. Un cambio de etiqueta no es necesariamente un cambio deportivo.

Un renombrado o reordenación de archivo no debe aparentar cientos de ajustes. Si una importación tiene diferencias de esquema o IDs no conocidos, explica el conflicto; no supongas equivalencias por parecido de nombres.

## 9. Ciclo de los perfiles y conservación

### 9.1. Base inicial

Importa al sistema de perfiles **la configuración efectiva real de `main`**, con sus versiones y procedencia. Mantén las semillas provisionales de MOTOR-01 y, si se aplicó, la extensión de MOTOR-02. No recargues anexos viejos sobre correcciones aceptadas.

La base inicial queda protegida y disponible para restaurar. Identifica que el perfil es operativo para su subconjunto, no calibrado globalmente. No le asignes EVAL ni «realismo verificado» por pasar validación estructural.

### 9.2. Estados y acciones

La implementación puede organizar estados internamente, pero la interfaz debe distinguir:

| Situación | Comportamiento |
|---|---|
| Borrador | Editable y guardable; aún no es perfil activo. |
| Validación | Resultado vinculado a la revisión exacta; editar invalida esa validación anterior. |
| Comparación/evaluación | Ejecuciones e informe vinculados a la candidata exacta, con muestra y límites. |
| Publicación | Versión inmutable del conjunto compatible y su cobertura. |
| Activación | Esa versión se selecciona para futuros encuentros. |
| Congelación en ejecución | Copia efectiva propia del partido/comparación, que no cambia después. |
| Descarte/restauración | Conserva trazabilidad; no reescribe una versión publicada. |

Permite clonar una versión, guardar borrador, validar, comparar, publicar/activar y volver a una base conocida. Un cambio tras comparar no hereda como propia la evidencia del borrador anterior.

La activación es una acción explícita de Dennis desde la interfaz, no algo que el panel hace porque el marcador de la candidata fue mejor. No exige pedir permiso a ChatGPT para cada ajuste. Un perfil válido todavía SEM puede probarse y activarse identificado como provisional; los avisos deportivos se ven y la decisión se registra.

No ocultes una validación fallida permitiendo activar de todos modos. Tampoco inventes un circuito de aprobación empresarial para un laboratorio local.

### 9.3. Historial

Guarda identidad de revisión, perfil base, cambios antes/después, motivo, procedencia, validación y comparaciones asociadas. Usa «Dennis» o el emisor real conocido; no inventes usuarios ni identidades autenticadas.

El motivo puede ser una observación/hipótesis. Las referencias o muestras desconocidas permanecen declaradas como ausentes. La fecha real es un metadato de auditoría, no entrada de azar deportivo.

### 9.4. Persistencia local sin migración impuesta

Reutiliza la persistencia aprobada si existe. Si el laboratorio actual no tiene backend ni almacenamiento de perfiles, usa persistencia local del navegador para perfiles e historial de esta entrega, con versión de formato, comprobación de errores y exportación/importación como intercambio y copia recuperable.

No añadas PostgreSQL solo porque Dennis haya creado una base `bem`. No hace falta persistencia compartida entre ordenadores ni cuentas. Explica el alcance local y permite conservar un archivo para trasladar el trabajo.

Al recargar, deben conservarse borradores guardados, versiones publicadas, historial y selección activa. No es requisito persistir aquí un partido en marcha ni todos sus logs. Conserva en el registro de comparación el resumen y las referencias; si sus partidos completos solo están en memoria, indica cuándo deben descargarse.

Si falla el guardado por falta de espacio o datos dañados, informa y ofrece exportar lo recuperable. No muestres «guardado» si falló, no reemplaces todo por la base silenciosamente y no elimines las versiones para liberar espacio por tu cuenta.

## 10. Validación e invariantes

### 10.1. Validación estructural y semántica

SUP04 debe comprobar, para el subconjunto activo:

- Tipos, unidades, dominios finitos y campos obligatorios; sin `NaN` o infinitos.
- Pesos no negativos y masa utilizable en conjuntos requeridos; no distribución normalizada desde masa cero sin una salida declarada.
- Sumas de mezclas/distribuciones según su contrato y universo.
- Probabilidades compatibles con transformaciones y sensibilidades válidas.
- Duraciones triangulares ordenadas y unidades correctas.
- Curvas con abscisas ordenadas, dominio y extremos requeridos, interpolación y restricciones declaradas.
- Relaciones de umbrales/tolerancias y alternativas realizables que exijan las políticas activas.
- Padres, IDs, catálogos, referencias de capacidades y participantes funcionales pertinentes.
- Condiciones admitidas, colisiones y precedencia resuelta.
- Datos obligatorios completos para los mecanismos declarados activos.
- Compatibilidad entre versión de núcleo, reglas, contenido y política estadística.
- Separación entre datos de balance, invariantes y reglamento protegido.

No uses una tolerancia arbitrariamente grande para aprobar una suma incorrecta. Distingue precisión numérica de permitir otra distribución. La normalización propia del mecanismo no equivale a editar en secreto un archivo inválido.

### 10.2. Cero y ausencia

Diferencia: valor cero, deshabilitado explícito, no aplicable, no implementado, no registrado y requerido sin valor. Un grupo futuro no se rellena con ceros para que la tabla parezca completa.

La ausencia de un dato deportivo obligatorio bloquea su perfil activo. La ausencia de una referencia empírica puede ser un aviso SEM si existe valor de desarrollo válido, no una excusa para inventar una fuente.

### 10.3. Salida útil

Cada incidencia identifica fila/grupo, severidad, campo, regla, valor recibido y explicación. Enlaza al editor pertinente. Un error impide publicar/activar; un aviso explicita la limitación sin fingir que invalida matemáticamente el dato.

Muestra por separado «estructura válida», «cobertura incremental completa» y «evaluación deportiva pendiente/realizada con muestra». No uses un único semáforo verde para afirmar todo.

Las validaciones de sistemas aún no implementados se catalogan como pendientes. No certifican que el momento, las zonas o las 32 capacidades completas ya estén conectados.

## 11. Comparación base/candidata sobre partidos completos

### 11.1. Comparación inicial contenida

Desde el comparador se eligen base y candidata válida, se revisan diferencias y se prepara un enfrentamiento de los equipos jugables existentes. Por defecto se reutiliza el escenario/semilla base del laboratorio.

La acción «Comparar un partido por perfil» ejecuta dos encuentros completos por el mismo núcleo. Congela versiones y entradas antes de empezar. No exige publicar ni activar globalmente la candidata para probarla.

No construyas el selector masivo de cientos/miles de partidos aquí. Conserva el contrato de ejecución para que MOTOR-12 pueda ampliarlo después.

### 11.2. Qué permanece igual

Conserva jugadores, capacidades, estados iniciales, localía, plan inicial y semilla. Solo cambia la configuración que el experimento declara, además de las consecuencias legítimas que produce.

Si se suministra un guion de órdenes manuales de MOTOR-02, usa las mismas solicitudes y anclajes deportivos compatibles. Las decisiones automáticas se regeneran bajo cada perfil; no se fuerzan a ser iguales si se está comparando una política distinta. Si una orden pierde su oportunidad o referencia, informa; no la reubiques en secreto ni inventes su ejecución.

Compartir semilla no empareja cada lanzamiento después de divergir las decisiones y tiradas. No presentes la diferencia individual de dos marcadores como un efecto causal exacto ni una mejora estadísticamente demostrada.

### 11.3. Informe inicial

Muestra:

- Pregunta/hipótesis y cambios por fila.
- Versiones, configuración efectiva, escenario y semilla de cada ejecución.
- Partidos completos/errores y tamaño de muestra; de entrada, un partido por perfil.
- Marcador, parciales y métricas existentes de acta: tiros por tipo, aciertos/intentos, pérdidas, rebotes, faltas, libres y minutos.
- Energía y sustituciones/órdenes cuando sus registros permiten la comparación.
- Distribución de elecciones, calidad y uso de fichas solo donde ya exista registro suficiente, con universo y denominador.
- Diferencias absolutas y relativas cuando tengan sentido; denominador cero produce «no calculable», no infinito ni 0 inventado.
- Comprobaciones de coherencia ejecutadas y su alcance.
- Acceso a los encuentros y hechos que sostienen una incidencia.
- Advertencia concreta de interpretación: muestra exploratoria, no calibración ni prueba de superioridad.

No construyas todavía estadísticas avanzadas ni inferencias para llenar tarjetas. Una métrica pendiente se declara, no se reconstruye desde narrativa ni se presenta como cero observado.

### 11.4. Decisión posterior

Permite conservar la candidata, anotar revisar/descartar o publicarla/activarla mediante una acción explícita. La comparación no cambia automáticamente el perfil activo ni borra la base.

Los resultados comparativos son nuevos partidos identificados. No sustituyen los históricos ni alteran el encuentro que Dennis tenía pausado.

## 12. Trazabilidad, diagnóstico e intercambio

### 12.1. Del panel al acontecimiento y vuelta

En diagnóstico registra los IDs de filas efectivas y su procedencia que realmente intervienen en las elecciones/resoluciones capturadas. El detalle de un tiro o selección debe poder enlazar al parámetro correspondiente del perfil congelado.

No basta con enlazar al perfil activo actual si ese partido utilizó otra versión. No escribas que se aplicó una fila que solo se cargó y nunca fue consultada. No inventes alternativas que el motor no evaluó.

El detalle diagnóstico no modifica el partido ni consume azar. Sus campos internos no se entregan como conocimiento adicional al entrenador automático ni aparecen indiscriminadamente en la vista ordinaria.

### 12.2. Exportación de perfil

Botón descargable JSON con versión de formato, identidad, componentes compatibles, cobertura, procedencia, parentela exacta, sobreescrituras y conjunto efectivo completo. Incluye metadatos/diccionario necesarios para interpretar las filas.

Debe poder importarse en el mismo motor sin depender de un padre que solo existía en otro navegador. Incluye las dependencias requeridas o una representación autocontenida del conjunto resuelto, preservando el origen y diferencias. No descargues un archivo que luego el importador no sepa reconstruir.

Una exportación no convierte SEM en referencia contrastada. Un fichero de configuración no contiene código ejecutable ni secretos de entorno.

### 12.3. Importación

Valida formato, versiones, campos, límites, referencias e invariantes antes de crear una candidata. Presenta diferencias y conflictos. No actives automáticamente ni sobrescribas una versión publicada o una identidad existente con contenido diferente.

La importación de un archivo que coincide semánticamente puede reconocerse sin duplicación innecesaria. Si hay una colisión de identidad, conserva los originales y explica la resolución como copia/candidata nueva; no cambies silenciosamente el archivo histórico.

No es obligatorio migrar todos los formatos históricos. Rechaza con motivo los incompatibles; no elimines campos desconocidos para hacerlos pasar como válidos.

### 12.4. Exportación de comparación

Ofrece un JSON autocontenido de la comparación: pregunta, hipótesis, cambios, perfiles efectivos, entradas, semillas/órdenes, resultados, métricas con denominadores, comprobaciones y límites. Incluye los dos registros de partido existentes o una descarga conjunta equivalente que no pierda esas relaciones.

Puede acompañarse de un resumen Markdown breve generado desde los datos. No hace falta implementar aquí el ZIP general CSV/JSONL de lotes. El paquete de MOTOR-12 ampliará esta base sin crear otra verdad deportiva.

### 12.5. Partidos iniciados y reproducción

Iniciar en cualquiera de los tres modos o reproducir un archivo utiliza una copia validada y congelada de los valores efectivos, no una referencia mutable al panel. Activar otra versión afecta solo a futuros partidos.

La reproducción de MOTOR-02 conserva su semilla, órdenes y versión. No consulta como sustituto la configuración activa del día. Si no es compatible con el núcleo actual, informa como ya exige su contrato.

## 13. Comprobaciones automáticas acotadas

Dennis hará buena parte del test funcional manual. Reutiliza las herramientas del repositorio. Las pruebas nuevas deben proteger riesgos nuevos, no replicar cada fila del diccionario.

### 13.1. Casos pequeños necesarios

1. Resolución de herencia, eliminación de sobreescritura, cero válido y error por padre ausente/ciclo.
2. Pesos/probabilidades/curvas/duraciones/referencias inválidas y protección de invariante/reglamento, mediante pocos casos representativos.
3. Cambio conjunto inválido no aplica parcialmente; cambiar un borrador invalida su validación y no hereda evaluación de otra revisión.
4. Exportar/importar conserva valor efectivo, procedencia y cobertura sin activar ni sobrescribir versiones.
5. Guardar/recargar conserva perfiles/historial; un error de persistencia se comunica sin pérdida silenciosa.
6. La edición del panel llega al mecanismo consumidor: prueba causal determinista de un peso/referencia/curva, sin exigir que un marcador concreto mejore.

No crees cientos de pruebas por parámetro ni snapshots gigantes del catálogo. Una comprobación genérica de referencias/consumidores puede cubrir el inventario sin una prueba manual por cada ruta.

### 13.2. Encuentros integrados mínimos

Utiliza el mismo escenario y semilla base:

- Ejecuta una base antes de conectar/refactorizar la configuración y repítela después con los mismos valores. Comprueba equivalencia deportiva, salvo corrección necesaria documentada.
- Compara base y candidata con un cambio deliberado de un parámetro activo, reutilizando el encuentro base si las entradas y versiones coinciden.
- Inicia un partido incremental con base, detenlo, edita/activa una candidata y termínalo. Debe coincidir con la ejecución base sin cambios; el siguiente encuentro sí selecciona el nuevo perfil.

La referencia es **cuatro ejecuciones completas** si se reutiliza la base, más casos pequeños. No añadas un barrido de semillas ni partidos de cada velocidad por haber creado el panel. Conserva los checks existentes pertinentes de MOTOR-01/02 y los requeridos por las normas del repositorio.

Los experimentos que Dennis lance desde el panel son uso funcional del laboratorio, no una obligación de ejecutar auditorías masivas por cada PR.

### 13.3. Recorrido de interfaz honesto

Recorre crear candidata → editar → validar → comparar → activar → nuevo partido → exportar/importar. Si tu entorno permite UI real, úsala. Si solo puedes verificar código, di qué recorrido queda pendiente; no inventes clics ni validación manual.

No instales suites E2E extensas, herramientas nuevas de cobertura o infraestructura adicional para esta entrega sin necesidad concreta. No declares «calibrado» por pasar tests.

## 14. Recorrido manual para Dennis

Deja la lista en una página breve de la entrega, enlazada desde el índice. Incluye los comandos reales de arranque y URL del repositorio, sin adivinar un puerto.

| Prueba | Pasos | Resultado esperado |
|---|---|---|
| Inicio | Abrir panel desde laboratorio. | Perfil activo, versión, cobertura y estado provisionales comprensibles. |
| Pregunta guiada | Abrir «El cansancio apenas se nota». | Acceso a gasto, recuperación, curva y efecto por tarea; sin cambios automáticos. |
| Tabla | Buscar, filtrar modificados/SEM y fijar filas. | Se localizan ajustes sin leer código; tabla y vista temática coinciden. |
| Diccionario | Abrir un parámetro de tiro y uno de selección. | Unidades, consumidores y efectos diferentes; peso no confundido con acierto. |
| Candidata | Clonar base y modificar una fila activa. | Base intacta; diferencia y motivo guardados. |
| Tipos | Editar probabilidad, curva y duración válidas. | Representación legible, precisión y ejemplos coherentes. |
| Inválido | Dejar una duración desordenada o referencia rota. | Error localizado; no publica/activa ni corrige silenciosamente. |
| Lote de filas | Previsualizar suma o multiplicación compatible. | Lista exacta antes/después; sin interpretación ambigua de porcentajes. |
| Herencia | Sobreescribir y restaurar heredado. | Regresa el valor del padre versionado; no cero ni otro perfil. |
| Comparación | Ejecutar un partido por perfil. | Dos encuentros completos, mismos datos controlados, diferencias y muestra visibles. |
| Sin activación accidental | Terminar la comparación. | El perfil activo no cambia por ganar la candidata. |
| Activación | Publicar/activar explícitamente una candidata válida. | Nuevos partidos usan esa versión; históricos intactos. |
| Congelación | Pausar partido con base y activar otro perfil. | Partido abierto conserva sus parámetros; órdenes tácticas siguen disponibles. |
| Persistencia | Guardar, recargar y volver al panel. | Candidata, historial y activo conservados. |
| Intercambio | Exportar perfil, importar como candidata y revisar. | Mismos valores efectivos y origen; no sobrescribe ni activa por sorpresa. |
| Diagnóstico | Abrir resolución registrada y seguir fila de origen. | Consulta el valor usado por ese partido, aunque el activo haya cambiado. |
| Restauración | Volver a base publicada conocida. | Solo futuros encuentros; historial del experimento conservado. |
| Regresión | Jugar total/cuarto/tiempo y editar jugadores. | MOTOR-01/02 siguen utilizables. |

No marques estas pruebas como realizadas por Dennis hasta que lo confirme.

## 15. Ejecución, documentación y cierre

### 15.1. Secuencia

1. Confirma `beM`, normas, Git, estado y contratos actuales. Crea `feature/MOTOR-03-panel-y-perfiles`, o equivalente exigido por el repositorio.
2. Archiva **este prompt completo**, incluido el anexo, en `docs/prompts/MOTOR-03-panel-y-perfiles.md`, o ruta equivalente aprobada. Registra preparado/ejecutando/completado/revisión pendiente según lo ocurrido.
3. Construye inventario y mapa de consumidores, conservando los valores reales. Usa como base la configuración vigente.
4. Conecta diccionario, resolución/validación y congelación al núcleo existente.
5. Implementa persistencia de perfiles, herencia, historial e intercambio.
6. Completa mesa de ajustes, tabla, vistas y editores tipados desde esa misma fuente.
7. Implementa comparación inicial y enlaces con diagnóstico/exportación.
8. Ejecuta comprobaciones acotadas y recorrido UI; corrige lo necesario para el objetivo.
9. Actualiza documentación temática afectada, índices, mapa técnico, cobertura, estado, changelog y registro de prompts.
10. Entrega commits coherentes y una PR sin fusionar. Si no puedes abrirla, deja rama/commits y explica el impedimento concreto.

### 15.2. Documentación y continuidad

Preserva el funcional completo íntegro de consulta y los originales históricos. Actualiza solo páginas vigentes afectadas según DOC-001; no conviertas el registro de esta entrega en otro mega funcional duplicado.

Registra como continuidad obligatoria del roadmap: **cada entrega posterior incorpora al mismo diccionario/panel sus nuevas filas configurables, validaciones, consumidores y cobertura**. No deja constantes de balance escondidas para una limpieza final ni crea otro editor paralelo.

Documenta cómo añadir una fila de una operación ya soportada y cuándo sí hace falta implementar un mecanismo nuevo. Esa guía no autoriza a Claude a decidirlo funcionalmente por su cuenta.

Mantén la norma de prompts en MD y archivados íntegros, rama/PR por entrega y automatización de pruebas justa. Conserva que Dennis hará mucha validación manual. MOTOR-03 queda pendiente de esa revisión al entregar la PR.

### 15.3. Consumo y límites de sesión

Referencia de tamaño: hasta aproximadamente el 50 % de la ventana de cinco horas de Claude Code. No se garantiza el porcentaje. Si existe indicador visible, registra inicio/final y si la medición quedó mezclada con otra sesión; no inventes un consumo.

No añadas tareas para gastar cuota. Si falta sesión para acabar, deja checkpoint con rama/commit, último estado ejecutable, comprobaciones reales, bloqueo y siguiente paso. No declares terminado un panel cuyos campos no llegan al motor ni empieces MOTOR-04 sin encargo.

### 15.4. Criterios de cierre

- [ ] MOTOR-01/02 mantienen laboratorio, partidos, modos y dirección.
- [ ] Todos los parámetros ajustables de la cobertura actual son localizables y llegan a sus consumidores reales.
- [ ] No hay otra cifra oculta equivalente que anule lo editado en el panel.
- [ ] Diccionario, clases de dato y catálogo 81 + 4 conservan IDs y cobertura real.
- [ ] Mesa por preguntas, tabla maestra, vistas, filtros y detalle son utilizables.
- [ ] Edición tipada y conjunta, herencia y restauración tienen efecto correcto y diferencias visibles.
- [ ] Validación distingue estructura, cobertura y evidencia deportiva; errores bloquean activación.
- [ ] Base protegida, borradores, publicación, activación, historial y conservación local funcionan.
- [ ] Perfiles y partidos usan configuraciones efectivas congeladas y reproducibles.
- [ ] Comparación base/candidata ejecuta encuentros completos sin activar cambios por sí sola.
- [ ] Importación/exportación de perfil y comparación conservan datos, dependencias y procedencia.
- [ ] El diagnóstico enlaza las filas realmente utilizadas por la versión de ese encuentro.
- [ ] SEM/CARGA/EVAL y pendientes están identificados, sin afirmar cierre de los 81 grupos ni calibración.
- [ ] Pruebas automáticas acotadas, recorrido manual y documentación entregados con su estado real.
- [ ] Prompt íntegro y registro de entrega en Git; PR revisable sin fusionar.

Tu respuesta final debe indicar qué puede probar Dennis, cómo arrancar localmente con los comandos reales, dónde están panel/plan manual/prompt, qué comprobaste, perfil y semilla de referencia, enlace a PR o rama/commits y limitaciones concretas. No sustituyas el resultado por cantidad de tests o líneas de código.

## 16. Anexo: catálogo funcional de cobertura

Este catálogo conserva los identificadores del MD07, integrado en el capítulo 27 del funcional unificado. Es un índice de responsabilidades de datos, **no una exigencia de 81 tablas físicas ni de construir todos los mecanismos en MOTOR-03**.

Cada grupo debe indicar su cobertura real y entrega de ampliación. Los grupos con operaciones activas enlazan sus filas reales; los pendientes no reciben valores inventados. SUP01–SUP04 sirven al conjunto y no añaden probabilidades deportivas.

| ID | Responsabilidad funcional | Resultado/contrato de referencia |
|---|---|---|
| SEL01 | Pesos 1–5, agregación por familia y selección de variante elegible. | Preferencia efectiva sin aumentar masa por duplicación de fichas. |
| SEL02 | Mapeo de cada nivel de los 12 estilos a preferencias, condiciones o límites pertinentes. | Diferencias de elección o encargo al cambiar el nivel. |
| SEL03 | Origen, organización rival y condiciones de transición, temprano u organizado. | Oportunidad disponible frente a vía utilizada. |
| SEL04 | Prioridad interior/exterior y tres instrucciones de media distancia. | Elecciones condicionadas, sin cuotas obligatorias. |
| SEL05 | Plan, libertad, Iniciativa y procedencia llamada/autonomía/directo. | Uso del margen y desviación explicable. |
| SEL06 | Percepción y elección con Visión, Decisiones, contexto y reloj. | Diferencia entre opción existente, percibida y elegida en diagnóstico. |
| SEL07 | Funciones, disponibilidad, roles, capacidades pertinentes y ocupación de tareas. | Director, ejecutante y apoyos compatibles. |
| SEL08 | Aceptación de oportunidad inmediata según calidad percibida, preparación y alternativa. | Tirar, penetrar, pasar o continuar. |
| SEL09 | Preferencias de riesgo y decisiones precipitadas dentro del contexto. | Errores de elección posibles y acotados. |
| SEL10 | Conservación, salida segura y reorganización elegibles. | Una negación no termina siempre en tiro forzado o pérdida. |
| SEL11 | Objetivo de reloj/marcador y necesidad temporal. | Elección viable para el tiempo realmente disponible. |
| SEL12 | Ejecutor preferido, sustituto funcional y prioridad manual válida. | La ausencia de un nombre no rompe toda ficha compatible. |
| DEF01 | Funciones de individual, 2–3, 3–2, 1–3–1, 1–2–2 y box and one. | Referencias y responsabilidades de quienes intervienen. |
| DEF02 | Mapeo de ayudas, presión al balón, receptores, riesgo de robo y protección. | Amenaza contenida y concesión correspondiente. |
| DEF03 | Altura normal, tres cuartos y total, con intensidad separada. | Avance, carga y ventaja resultante si se supera. |
| DEF04 | Drop, cambio, show y atrapar; navegación compatible. | Seguimiento, intercambio, compromiso y recuperación reales. |
| DEF05 | Elegibilidad, compromiso y recuperación de ayuda. | Receptor menos protegido y respuesta posterior posible. |
| DEF06 | Objetivo principal, alternativa, doble y no abandonar. | Aplicación, suspensión o limitación explicadas. |
| DEF07 | Decisión de contener o intentar intervención sobre balón/tiro. | Oportunidad, intento, coste y autor correctos. |
| DEF08 | Plantillas defensivas de saque y necesidades de último ataque. | Recepción negada o concedida y continuidad. |
| DEF09 | Respuestas compatibles sugeridas por memoria. | Reconocimiento traducido a una decisión ejecutable. |
| RES01 | Principal, apoyos y contraparte por tarea; propiedad de cada capacidad. | Mapa causal de las 32 y pesos pertinentes. |
| RES02 | Referencia binaria por situación y población identificadas. | Probabilidad de referencia y contexto. |
| RES03 | Normalización, sensibilidades, límites y correcciones pertinentes. | Respuesta gradual a capacidad y oposición. |
| RES04 | Alternativas excluyentes y su universo. | Distribución válida de acontecimientos. |
| RES05 | Contacto, canasta y sanción compatibles bajo condición. | Combinación coherente, con causa y administración. |
| RES06 | Preparación por recepción, bote, desplazamiento y estabilidad. | Función de TEC06 sin doble prima de puntería. |
| RES07 | Catálogo de gesto y principal de tiro. | Fronteras TEC01–TEC05, incluidas floater y palmeo. |
| RES08 | Creación mediante balón, poste, corte, pantalla o entrega. | Oportunidad antes de su ejecución final. |
| RES09 | Riesgo por ejecución o exposición y causas de interrupción. | Una incidencia ocurre en su contexto pertinente. |
| RES10 | Participación, cierre, acceso, disputa, captura y salida. | Captor, ayuda del cerrador y continuidad distintos. |
| RES11 | Uso y recuperación de relaciones activas. | Ventaja o desajuste conservado hasta modificación real. |
| RES12 | Condiciones de calidad previa. | Cómoda, normal o forzada antes del desenlace. |
| RES13 | Incidencias condicionadas menos frecuentes. | Activación pertinente y consecuencia reglamentaria enlazada. |
| COR01 | Derivación de alcance funcional desde altura y envergadura; referencias, normalización y límites. | No crea otra capacidad ni afirma medir alcance de pie en centímetros. |
| COR02 | Pertinencia y sensibilidad por tarea del alcance y del componente dinámico separado. | No concede intervención a quien no llega ni repite tres ventajas de tamaño. |
| ACT01 | Duración por contexto y desenlace: mínimo, habitual y máximo. | Tiempo hasta el hecho compatible con relojes. |
| ACT02 | Unidad y referencia de exposición sostenida. | Fragmentar representación no multiplica riesgo. |
| ACT03 | Gasto por intervalo/carga y sensibilidad a Resistencia. | Coste de tareas reales, una vez. |
| ACT04 | Recuperación por banquillo y pausas, con límites. | Un intervalo no se cobra dos veces. |
| ACT05 | Curva de energía y deterioro máximo por tarea. | 100–70 casi neutro y reserva crítica muy costosa. |
| ACT06 | Efecto de Forma por ámbito y contrato de entrada. | Se mantiene estable dentro del encuentro. |
| ACT07 | Persistencia, variación e impulsos de tres ámbitos individuales. | Ámbitos separados con retorno gradual. |
| ACT08 | Efecto de Consistencia y control de neutralidad. | Dispersión distinta sin talento medio añadido accidentalmente. |
| ACT09 | Exigencia e influencia de presión por tarea. | Importancia y tensión no se duplican. |
| ACT10 | Momento colectivo: límites, persistencia y episodios. | Influencia compartida breve sin aura. |
| ACT11 | Combinación de estados y presupuesto por tarea. | Los máximos no se acumulan sin límite. |
| ACT12 | Pausa y reorganización aplicables. | Atenuación, descanso y orden válidos sin reset garantizado. |
| ENT01 | Participación prevista, funciones esenciales y alternativas. | Intención frente a minutos y funciones reales. |
| ENT02 | Revisión de descanso/retorno, estabilidad y excepciones. | Rotación contextual sin entradas y salidas repetidas. |
| ENT03 | Librillo por periodo, faltas, urgencia y recambio. | Fila que motivó retirar o mantener. |
| ENT04 | Pausas por intención, señales, recursos y reserva. | Solicitud y concesión válidas, efecto posterior incierto. |
| ENT05 | Ajustes autorizados, evidencia y estabilidad. | Cambio comprensible desde información permitida. |
| ENT06 | Prioridades de final por reloj, margen, bonus y control. | Decisión viable y coherente con objetivo. |
| ENT07 | Delegación y ciclo de órdenes, ámbitos y conflictos. | Solicitada, vigente y ejecutada diferenciadas. |
| MEM01 | Identidad semántica general/específica del patrón. | Renombrar una ficha no borra reconocimiento. |
| MEM02 | Capacidad, recencia, saturación, decaimiento y reemplazo. | Resumen pequeño y gradual. |
| MEM03 | Reconocimiento y respuestas compatibles. | La respuesta debe poder ejecutarse realmente. |
| MEM04 | Aplicabilidad tras cambios, pausas y continuidad. | No borrado automático ni conocimiento eterno. |
| CON01 | 15 fichas posicionales y relaciones con familia/situación. | Requisitos, funciones, opciones y cierre definidos. |
| CON02 | Seis disposiciones, roles y compatibilidades. | Funciones realizables y sustituciones válidas. |
| CON03 | ESP01–ESP20 y procedencia de decisión. | Condiciones y opciones registrables, sin familia ficticia. |
| CON04 | Seis fichas ofensivas y seis respuestas de saque. | Sacador, primera opción, alternativa, seguridad y continuidad. |
| POB01 | Doce equipos manuales de doce plazas. | Perfiles individuales completos e identidad reproducible al cargar datos. |
| POB02 | Generación ficticia correlacionada. | Rangos, dispersión y dependencias explícitos. |
| POB03 | Tres grupos de tendencias y perfiles funcionales. | Preferencia y capacidad separadas, con límites. |
| EST01 | Acta, sujetos, créditos, anulaciones y correspondencia normativa. | Cada crédito procede de un hecho y política declarados. |
| EST02 | Posesiones, F, puntos ligados, sanción y administración. | Numeradores y denominadores compatibles; marcador conciliado. |
| EST03 | Sectores, calidad, origen, preparación y ejecución. | Ejes distintos y calidad previa al resultado. |
| EST04 | Presencia, tramos, completas, mixtas y on/off. | No mezclar universos ni presentar on/off como causalidad exacta. |
| EST05 | Utilidad sin balón y exposición. | Tarea/efecto resueltos, sin movimientos inventados. |
| EST06 | Final ajustado, muestras, líderes y consultas especiales. | Filtros visibles y evidencia suficiente. |
| EST07 | Permisos y naturaleza de la información. | Público, propio y diagnóstico diferenciados por campo. |
| EST08 | Resumen, informes, presentación y exportación. | Afirmaciones sustentadas y acceso al detalle. |
| REG01 | Edición, constantes y parámetros del perfil reglamentario. | Identifica el marco común del encuentro. |
| REG02 | Consecuencias, relojes, control, anotación y reanudaciones. | Interpreta el hecho validado sin otro sorteo de consecuencia. |
| REG03 | Ventanas de solicitud/concesión/cierre y elegibilidad. | Gobierna cambios, tiempos muertos y aplicación legal pertinente. |
| REG04 | Sanciones combinadas, correcciones, inferioridad y terminaciones especiales. | Resuelve casos excepcionales identificados y su revisión. |
| REF01 | Fuente, fecha, población, definición, muestra, numerador, denominador y comparabilidad. | Referencia utilizable o limitación visible. |
| REF02 | Bandas u objetivos provisionales, contexto y motivo. | Diferencia entre dato medido y preferencia de diseño. |
| LAB01 | Escenario, entradas, pregunta, comparación, métricas, tolerancias y evidencia. | Informe vinculado a versiones y ejecuciones. |
| SUP01 | Diccionario | Identificadores, etiquetas, tipos, unidades, campos y operadores admitidos. |
| SUP02 | Perfiles/versiones | Componentes, herencia, valores efectivos, activación y congelación. |
| SUP03 | Historial | Antes/candidato/después, motivo, dependencia y evidencia. |
| SUP04 | Cobertura/validación | Filas obligatorias, referencias, rangos, conflictos y ausencia. |
