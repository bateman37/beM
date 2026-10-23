# SIM-MOTOR-02 · Correcciones, integración, simultaneidad e historia

**Destinatario:** Claude Code.  
**Repositorio autorizado:** `bateman37/beM`, exclusivamente.  
**Fecha:** 22 de octubre de 2026.  
**Encargo:** implementar las correcciones aceptadas tras la revisión independiente de SIM-MOTOR-01 y completar SIM-MOTOR-02 del roadmap de cuatro entregas.

Dennis ha aprobado todas las correcciones y recomendaciones descritas aquí. No hay que pedir de nuevo autorización para implementarlas. Completa el encargo, sus comprobaciones acotadas, documentación y paquetes de evidencia. Las decisiones técnicas ordinarias son tuyas; las decisiones funcionales y los límites de este documento son vinculantes.

## Índice

1. [Objetivo y alcance](#1-objetivo-y-alcance)
2. [Base, Git y lectura dirigida](#2-base-git-y-lectura-dirigida)
3. [Correcciones de SIM-MOTOR-01](#3-correcciones-de-sim-motor-01)
4. [Roles, director y familiaridad](#4-roles-director-y-familiaridad)
5. [Políticas pequeñas del entrenador](#5-políticas-pequeñas-del-entrenador)
6. [Análisis e interfaz integrados](#6-análisis-e-interfaz-integrados)
7. [Jornada simultánea y publicación del presente](#7-jornada-simultánea-y-publicación-del-presente)
8. [Guardado y lotes persistentes](#8-guardado-y-lotes-persistentes)
9. [Mundo agrupado e historia individual](#9-mundo-agrupado-e-historia-individual)
10. [Aprendizaje posterior al partido](#10-aprendizaje-posterior-al-partido)
11. [Rendimiento y cachés exactas](#11-rendimiento-y-cachés-exactas)
12. [Verificaciones y escenarios de cierre](#12-verificaciones-y-escenarios-de-cierre)
13. [Evidencia para ChatGPT](#13-evidencia-para-chatgpt)
14. [Documentación, aceptación y respuesta final](#14-documentación-aceptación-y-respuesta-final)

## 1. Objetivo y alcance

SIM-MOTOR-01 demostró un generador estadístico por tramos con partidos completos y un coste viable. La revisión independiente encontró defectos de lectura, atribución y efectos funcionales que hay que cerrar antes de conectar sus salidas al mundo.

Esta entrega tiene seis bloques de trabajo, dentro de **un único encargo**:

| Bloque | Resultado |
| --- | --- |
| A · Correcciones | Prefijos públicos correctos, créditos y denominadores completos, energía bien atribuida e identidades fiables. |
| B · Comportamiento e integración | Roles, director, familiaridad pertinente, políticas pequeñas y lectores del laboratorio. |
| C · Simultaneidad | Jornada con sénior propio detallado, otros partidos SIM, marcadores y clasificación en directo. |
| D · Persistencia | Encuentros/jornadas continuables y lotes recuperables, sin duplicar consecuencias. |
| E · Historia y aprendizaje | Estadísticas individuales de temporada del mundo de contexto y aprendizaje posterior compatible. |
| F · Cierre técnico | Mediciones con transporte/persistencia útiles, regresiones necesarias y ZIP para ChatGPT. |

El modelo deportivo sigue siendo el generador por tramos. No reconstruyas las cadenas de posesión, alternativas, movimientos ni episodios del detallado. El trabajo de integración no justifica otro motor.

Se conserva la asignación aceptada:

- Solo los partidos del **sénior dirigido por el usuario** se resuelven con el detallado en la sesión de manager representada.
- Los demás, incluida la cantera propia, se resuelven con SIM.
- Referencia utiliza el mismo SIM en ejecución agrupada y con menor conservación de detalle. No es un tercer resolutor.
- El laboratorio independiente permite comparar cualquier plantilla con ambos modelos. Abrir el análisis de un partido SIM no cambia su resolutor.

No construyas contratos, mercado, economía, scouting, todo el calendario mundial ni todas las competiciones del manager. Utiliza escenarios pequeños de laboratorio para acreditar los contratos que necesitarán esos sistemas.

**No calibres durante esta entrega.** Los cambios de resultados debidos a correcciones o a funciones aprobadas se explican como tales. No ajustes coeficientes para recuperar un marcador anterior, bajar la media o cumplir una expectativa deportiva. SIM-MOTOR-03 aportará la campaña comparativa; ChatGPT analizará sus archivos y Dennis decidirá los ajustes de 04.

## 2. Base, Git y lectura dirigida

### 2.1 Estado real

Último informe: PR #21 abierta contra `main`, base `606c33b`, cabeza `0b2b43a`; código de la evidencia `6ef0dab`. La PR #20 de MOTOR-18C ya estaba fusionada. Son referencias históricas: verifica el estado actual antes de editar.

- Lee las normas vigentes del repositorio, `AGENTS.md` y el índice de documentación.
- Registra commit inicial, rama, estado de Git y base efectiva de SIM-MOTOR-01.
- Si #21 sigue abierta y contiene esa entrega, continúa en su rama y actualiza título/descripción para reflejar SIM-MOTOR-01 + SIM-MOTOR-02 y sus correcciones.
- Si ya se fusionó, crea una rama de SIM-MOTOR-02 desde `main` actualizado y una PR independiente.
- Conserva trabajo ajeno. No borres ni fuerces historia para reutilizar una rama ocupada.
- Sube los commits y deja la PR abierta, **sin fusionar ni suscribirte**.

### 2.2 Consulta acotada

Consulta el prompt y la nota técnica de SIM-MOTOR-01, el roadmap v2 de cuatro entregas, los índices funcionales pertinentes y los módulos actuales equivalentes a:

- `src/sim/{engine,materialize,model,adapt,result,reconcile,profile,tables,probe,controls,capabilities}.js`.
- `src/lab/sim-ui.js`, selector de motores, lectores de análisis y audiencias.
- Contrato detallado `src/engine/index.js` y sus operaciones públicas de avance, consulta, órdenes y snapshot.
- Lotes/persistencia/comprobadores existentes: reutiliza sus piezas compatibles.
- `src/learning`, `src/knowledge` y correcciones de identidad de MOTOR-18B/18C.
- Tablas declarativas de roles ofensivos/defensivos, entrenador, familiaridad y política estadística.

Trabaja exclusivamente en **beM**. No abras `v-apps`, Basket Manager, BeManager ni otros repositorios. No investigues estadísticas externas ni reinterpretes normativa FIBA pendiente en esta entrega. Las fuentes de calibración se estudiarán en 03.

Los ZIP históricos de 01 pueden faltar en un entorno nuevo porque `out/` no se versiona. Este prompt contiene las reproducciones necesarias. Su ausencia no autoriza a fabricar evidencia histórica: usa la base de Git y declara qué archivos históricos no estaban disponibles.

### 2.3 Congelación y versiones

Conserva la referencia deportiva detallada: entrada/perfil de referencia, semilla `20261016`, 83–98, 6.684 sorteos y huella de trayectoria de MOTOR-18C, siempre comprobando que la entrada efectiva es exactamente esa. No actives C17-02 ni otra candidata provisional silenciosamente.

Registra antes/después las huellas de los archivos deportivos detallados. Integra la jornada mediante adaptadores sobre su contrato existente; no cambies su resolución ni sus políticas internas para añadir noticias externas. La dirección manual del usuario sigue usando sus órdenes y ventanas legales existentes.

Identifica SIM-MOTOR-02 y su perfil efectivo. Las correcciones cambian salidas y pueden cambiar trayectorias: no prometas reproducción de archivos de 01 con el motor nuevo.

- Resultado nuevo: `beM-sim-match/2`.
- Snapshot SIM inicial: `beM-sim-snapshot/1`.
- Sesión de jornada: `beM-sim-matchday/1`.
- Perfil: base de 01 más extensión identificada `SEM-SIM02-20261022`.

Un histórico de 01 continúa siendo consultable con su cobertura y defectos conocidos identificados. Si puede repararse un **dato derivado** desde hechos completos conservados, hazlo solo en una lectura reparada identificada, conservando original y procedencia. No arregles retrospectivamente decisiones deportivas ni rellenes datos que nunca se produjeron.

Los perfiles/candidatas guardados de 01 conservan su identidad. Si les faltan filas necesarias para 02, ofrece consultar el original, activar explícitamente la base SIM-MOTOR-02 o crear una candidata explícita con las diferencias de conversión. No migres ni actives perfiles en silencio, y no alteres el perfil del laboratorio detallado. Modelo, aplicación, dataset, perfil y contrato se muestran como identidades distintas.

## 3. Correcciones de SIM-MOTOR-01

Estas reproducciones se obtuvieron con el código entregado, sus parámetros y entradas congelados. Los números describen el defecto anterior; no son objetivos del motor corregido.

### C02-01 · Prefijo público completo y publicación monótona

Caso `SIM01-C0001`, EQ01–EQ02, semilla `152650156`, planes/entrada de la primera agenda de 01:

```text
advance({ until: 1 })
buildSimResult(...)

published = 1
generatedUntil = 120
score.current = [0, 0]
score.periods = [[6, 5]]
controls = [5, 4]
events = []
reconciliation.valid = true
```

El marcador actual filtra hechos, pero periodos y controles utilizan el tramo futuro. Además, avanzar primero a 120 y luego a 30 permite reducir `published` a 30.

Decisiones cerradas:

- Todos los campos públicos se construyen desde hechos/intervalos alcanzados: marcador, periodos, controles, denominadores, familias, minutos, exposición, estado observable y condición de final.
- El sufijo generado y no publicado permanece privado. Su existencia y sus magnitudes solo se consultan en diagnóstico.
- No expongas como actuales la energía, faltas, sustituciones o estados futuros del núcleo adelantado. Conserva/proyecta el estado propio correspondiente a la frontera publicada.
- Publicar es monótono. Una solicitud anterior al presente no rebobina el encuentro: devuelve rechazo explícito. Leer una vista histórica, si se ofrece, es una operación de lectura distinta que no altera la publicación.
- Un encuentro solo aparece terminado para una audiencia cuando su final está publicado. No reveles anticipadamente prórrogas, ganador o duración definitiva.
- Consultar no consume azar, no aplica órdenes y no cambia el plan.
- La suma de periodos publicados coincide con el marcador publicado, también a mitad de tramo.

`R01` hoy omite la comprobación si el prefijo es parcial y aun así la declara conforme. Corrígelo: calcula el universo parcial correcto o identifica «no evaluado» cuando realmente no pueda evaluarse. Un control omitido no es una aprobación.

### C02-02 · Producción táctica con libres y finalizaciones únicas

En el ejemplo 87–105:

| Equipo | Puntos del acta | Puntos de familias | Libres anotados | Libres intentados | Intentos de libre en familias |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 87 | 76 | 11 | 15 | 0 |
| B | 105 | 87 | 18 | 24 | 0 |

Los doce resultados adjuntos repiten el problema de `fta = 0` en familias. Además, canasta con falta suma dos finalizaciones: aparecen 86/71 donde hay 80/65 finalizaciones únicas.

Implementa:

- Identidad compacta de finalización que agrupe tiro, falta de tiro y serie ligada cuando pertenecen a la misma resolución.
- Canasta con falta = **una finalización**, conservando el intento anotado, falta y libre ligado.
- Fallo con falta = una finalización, sin intento de campo cuando así lo establece la política estadística vigente.
- Los libres conservan el origen táctico realmente generado. Las series de bonus u otros casos sin ficha/familia usan una categoría explícita, por ejemplo `bonus_sin_familia`; no inventes una jugada.
- Campos inequívocos: puntos de campo, puntos de libre, puntos totales, intentos/aciertos de libre y finalizaciones únicas. Los puntos totales de las categorías exhaustivas suman el acta.
- Los porcentajes y eficiencias usan el universo declarado; el tiro con falta no duplica el denominador.
- Conciliación de tiros, libres, puntos y finalizaciones, no solo de FGA/FGM.

No crees una posesión del detallado para representar estos enlaces. Basta la identidad causal compacta del generador.

### C02-03 · Gasto de presión atribuido al equipo correcto

En `materialize.js`, `_finishSegment`, el componente defensivo toma `o.plan.pressureHeight`, del adversario, junto con la cobertura propia. En un cálculo aislado de 120 s, activar presión total de A deja su gasto igual y carga el incremento a B.

Corrige la procedencia: la carga de ejecutar la presión defensiva pertenece al equipo que la ordena. Mantén separado cualquier esfuerzo de **atacar una presión rival**, que solo puede venir de su mecanismo representado; no lo confundas con el gasto de defender presionando ni lo inventes para conservar el número anterior.

Regresión con mismo tiempo, Resistencia, cobertura y mezcla ofensiva: variar la presión de A cambia su componente defensivo; el de B no cambia por leer el plan de A en el lugar equivocado. Mantén curva de energía, referencias fatigadas y tolerancias de rotación existentes.

### C02-04 · Identidad completa y validación

Dos entradas del ejemplo con órdenes programadas diferentes produjeron 87–105 y 107–86 conservando `inputFingerprint = 0919f8f04305ee87`. La huella omite órdenes y también datos consumibles como cuerpo y roles.

Define una representación canónica de la entrada deportiva consumida que incluya:

- Jugadores/instancias, capacidades, cuerpo, tendencias, roles, conocimiento y estados iniciales.
- Planes, prioridades, director, política y datos pertinentes del entrenador.
- Reglas/parámetros efectivos mediante sus identidades y huellas.
- Semilla, importancia y órdenes programadas.

Separa `root_input_fp`, registro de comandos recibidos durante el partido y registro de contexto externo. No renombres la entrada inicial cada vez que llega una orden; conserva la cadena reproducible de entrada + comandos + contexto. Una variante de comandos no puede presentarse como la misma entrada efectiva.

Las identidades de lote, intento, worker, ruta y presentación se conservan como metadatos, sin alterar el azar deportivo. La huella deportiva debe cubrir participantes/créditos y presencia comprometida, incluidos cambios de quinteto; no omitas los identificadores relevantes de una sustitución.

La huella de tablas abarca todos los catálogos consumidos —incluidos disposiciones, funciones y roles—, no únicamente fichas, organizaciones y políticas. Una caché no puede considerar iguales dos contextos cuyas tablas efectivas cambian.

Refuerza validación de los campos que consumes: números finitos, rangos, identificadores, referencias, órdenes y formas de tablas. Se reprodujo aceptación de `state.energy = NaN`. Una orden con equipo inexistente, tiempo inválido o plan incompatible se rechaza antes de mutar el estado.

No rechaces datos opcionales de un dominio que SIM no utiliza; declara la cobertura. No conviertas valores defectuosos en neutrales silenciosos.

### C02-05 · Continuidades y créditos administrativos

El código de 01 termina el control ofensivo cuando hay `block_out_of_bounds`. Esa causa indica tapón fuera, no recuperación defensiva.

- Mantén la continuidad compatible con el último toque registrado. Un tapón defensivo fuera no concede por sí mismo el control al defensor.
- No es necesario implementar saques tácticos completos: una reanudación compacta de la misma continuidad es suficiente.
- Respeta el reloj/reinicio aplicable del perfil en la cobertura representada; no inventes un rebote para cuadrar la salida.
- Si un guard técnico de cadenas de rebote/continuación se alcanza, devuelve fallo diagnosticado o continúa mediante una solución exacta equivalente. No abandones una posesión tras un rebote ofensivo para entregar el siguiente control al rival.

En la muestra también hay 36 faltas ofensivas, las 36 sin receptor. Cuando una falta personal ofensiva tiene un adversario receptor representado, registra ese participante y su falta recibida conforme a la política del acta. Un sujeto colectivo o receptor no registrado debe declararse como tal; no fabricar un nombre al leer el resultado.

Revisa la materialización de exclusiones: la primera fase acumula faltas y `_noteFoul` consulta ese contador final al emitir hechos anteriores. Evita tratar a un jugador como excluido en su primera falta del tramo porque llegará a cinco más tarde. Usa el contador causal del instante. No repares créditos reasignándolos aleatoriamente por una exclusión anticipada por error.

Completa la frontera obligada antes de adjudicar producción posterior a un jugador excluido. Las conciliaciones deben comprobar la secuencia de créditos y contadores, no solo que el total final sea cinco o menos.

## 4. Roles, director y familiaridad

### 4.1 Roles ofensivos y defensivos: efecto sencillo y real

En 01 se clasificaron `offensiveRoles` y `defense.roles` como exclusivos del detallado. Con conocimiento neutral, cambiar todos los roles no modifica las distribuciones. Esa exclusión no se mantiene.

Usa los catálogos existentes:

- Ofensivos O01–O15: `repertoire.offensiveRoles[rol].favors` y etiquetas de función de las fichas/salidas.
- Defensivos D01–D12: `defenseRepertoire.roles[rol].tags` y etiquetas de las responsabilidades.
- Magnitudes de preferencia/adecuación existentes: `selection.rolePreference` y `defense.assignment.roleFitWeight/otherRoleFitWeight`.

Decisiones de traducción:

1. Coincidir con una función favorecida modifica el peso de participación mediante el factor heredado, aplicado una vez en ese reparto. No crea una capacidad nueva ni un bonus universal de acierto.
2. Rol ofensivo orienta participación como director/pasador/bloqueador/receptor/finalizador según la función efectiva. Un tirador de recepción y un organizador no deben comportarse igual con la misma ficha física.
3. Rol defensivo orienta asignación y reparto de responsabilidades/créditos compatibles. La capacidad sigue determinando la ejecución.
4. Posición nominal es recomendación; no una prohibición de candidatos. La familiaridad de posición/rol sí refleja una función poco conocida.
5. No dupliques el mismo multiplicador en participación y en un bonus posterior que represente otra vez la misma ventaja.
6. Conserva la posibilidad de perfiles versátiles sin añadir un atributo deportivo 33.

Mantén todos los pesos editables y su procedencia. Si hay agrupación de etiquetas, documenta la correspondencia completa, sin decidirla desde el nombre comercial del rol.

### 4.2 El director aporta la lectura

`attackModel` calcula hoy `q` con la media de MEN02/MEN03 del quinteto. Cambiar de director mantiene esa lectura idéntica, aunque otras participaciones cambien.

Obtén esa lectura del **director efectivo**, elegido por la prioridad vigente entre participantes. Usa las ponderaciones, escala y penalizaciones pertinentes ya declaradas; no introduzcas otro coeficiente de inteligencia colectiva.

El resto del quinteto conserva sus propias capacidades en pase, finalización y coordinación. El director no sustituye sus capacidades ni impone que toda canasta pase por él.

Regresión fija: mismos cinco jugadores y plan, dos directores con Visión/Decisiones distintas → cambia `q` en la dirección esperada. Una posición nominal distinta no impide dirigir si el plan lo permite, pero su conocimiento/adecuación puede afectar.

### 4.3 Familiaridad solo pertinente

Con POS14 —familia `isolation`, `coverage: null`— bajar únicamente el conocimiento de cobertura del defensor elevó la calidad cómoda del ataque de aproximadamente 0,25118 a 0,25991. La cobertura ajena estaba influyendo en una interacción que no la utiliza.

- Deriva los módulos pertinentes de la ficha/familia y la cobertura **realmente aplicable**, no de que el plan tenga un campo `coverage`.
- Una cobertura incompatible o inexistente no participa ni en penalización ni en exposición de aprendizaje de esa operación.
- Transición y decisión espontánea utilizan su contexto pertinente, sin heredar automáticamente todos los módulos del ataque organizado.
- Incluye participantes funcionales relevantes, incluido el bloqueador, sin promediar el banquillo.
- Aplica el ajuste una vez por cálculo. Calidad determinada/heredada no recibe una segunda penalización.
- Conocimiento neutral o máximo conserva la neutralidad prevista.
- El conocimiento permanece congelado durante el encuentro. Polivalencia no modifica su trayectoria.

Congelar exige aislar las entradas: editar después la copia de preparación, el conocimiento o una candidata no modifica un encuentro ya creado. Copia los datos mutables necesarios o comparte únicamente contextos efectivamente inmutables identificados por contenido. Una referencia al objeto de conocimiento editable no es una congelación.

Actualiza la matriz de las 32 capacidades y la de controles: distingue efectos de capacidades, preferencias de rol y conocimiento. Mantén los contrastes fijos existentes y añade las regresiones de pertinencia; no declares cubierta una función por aparecer en una fila.

## 5. Políticas pequeñas del entrenador

### 5.1 Presupuesto de decisión

Conecta las políticas ENTREF01–03, rotación, protección por faltas y estados representados. Conserva sus umbrales, permanencias, tolerancias y `adjustmentHold` como datos.

La adaptación SIM queda acotada a:

- Rotación/administración de faltas y energía.
- Respuesta estadística a dos patrones observables del rival: predominio exterior y predominio interior.
- Ajuste de ritmo ante necesidad de resultado en el cierre, incluida una necesidad derivada de clasificación contemporánea.

No añadas búsqueda de planes óptimos, memoria de ocho claves por evento, aprendizaje de un rival omnisciente ni el árbol completo del entrenador detallado.

Semillas nuevas de esta política, administrables y marcadas `SEM-SIM02`, no calibración:

| Parámetro | Valor |
| --- | ---: |
| Ventana de observación | Últimos 2 tramos publicados del rival |
| Intentos mínimos para reconocer predominio | 6 tiros de campo |
| Proporción mínima de la zona agrupada | 0,60 |
| Patrones conservados | Máximo 2: exterior/interior |
| Paso máximo de ajuste por revisión | 1 nivel del control |

Exterior = triple; interior = aro + interior; media distancia no fuerza ninguno de esos patrones. Usa los hechos publicados, sin probabilidades privadas.

Ante un patrón reconocido, desplaza un nivel el estilo de protección hacia su zona, según el sentido de la tabla existente. Conserva sus compensaciones. Respeta `adjustmentHold`, no hagas oscilar la protección en cada consulta y registra razón, muestra y cambio. No cambies automáticamente la organización para eludir familiaridad baja.

En la ventana de cierre de la política, si el objetivo declarado exige mejorar el resultado y no se cumple con la información actual, desplaza un nivel el ritmo hacia ataque más rápido, respetando los límites y bloqueo manual. No regales eficiencia, puntos o un resultado. El objetivo puede proceder de la clasificación provisional; no necesita un nuevo atributo.

La configuración manual tiene prioridad en su ámbito. Explica qué controla el usuario y qué puede adaptar el entrenador; no sobrescribas una orden vigente silenciosamente.

### 5.2 Información disponible

El entrenador recibe una vista explícita con fecha/frontera de observación: hechos propios, información pública rival y noticias externas ya publicadas. No recibe el estado diagnóstico del resolutor ni finales precalculados de otros partidos.

Registra decisiones y sus fuentes para reproducirlas. Si dos ejecuciones tienen noticias u órdenes distintas, no exijas igualdad de resultado. La igualdad se exige con la misma entrada, comandos, contexto publicado y política.

Mantén las aproximaciones de transición esperada y tensión por periodo de 01 como provisionales identificadas. No las recalibres aquí. Separar composición estadística de la lógica detallada sigue siendo una decisión aceptada.

## 6. Análisis e interfaz integrados

### 6.1 Lectores sobre hechos SIM

Integra las vistas existentes del laboratorio mediante un adaptador/lector SIM. No fabriques un export del detallado ni dupliques fórmulas compatibles.

Cobertura requerida:

| Vista | Contenido SIM |
| --- | --- |
| Resumen | Marcador, líderes, parciales, hasta tres claves con evidencia y crónica por periodo. |
| Acta y comparación | Individual/equipo, créditos completos, valoración y fórmulas compatibles con sus denominadores. |
| Evolución | Marcador, parciales, finales y órdenes sobre el prefijo publicado o histórico cerrado. |
| Tiro y calidad | Zonas reales representadas, calidad, jugadores y periodos. Sin lados/coordenadas inventados. |
| Ataque | Origen, familias/fichas, participación y producción completa con libres. |
| Defensa | Organización/cobertura efectivas y efectos agregados representados. |
| Rotaciones y quintetos | Intervalos, minutos, on/off y producción; ataques mixtos identificados. |
| Informes | Público, propio/rival e individual con cobertura y muestra declaradas. |
| Diagnóstico y cobertura | Parámetros, decisiones, aproximaciones, conciliaciones y datos ausentes. |
| Exportar | JSON/CSV/Markdown compatibles con la audiencia elegida y el contrato SIM. |

Incluye cuota de cierres y producción por 100 con presencia completa donde el registro SIM lo permita. Denomina `controles SIM` y `finalizaciones SIM` a sus universos; no los llames posesiones beM del detallado.

Resumen/recomendaciones utilizan hechos observados y umbrales editoriales identificados. Una muestra pequeña no prueba una causa táctica ni significación estadística. Evita consejos contradictorios basados en el mismo hecho sin declarar sus compensaciones.

### 6.2 Audiencias y ausencias

- Público: hechos publicables hasta el horizonte.
- Propio: añade información autorizada del equipo seleccionado en ese horizonte.
- Diagnóstico: laboratorio, con privados y sufijo no publicado si se solicita expresamente.

Prioridades, conocimiento privado, probabilidades y procedencia interna rival no aparecen en exportaciones públicas. Tampoco después de terminar por el mero hecho de consultar el acta.

Los diagnósticos exclusivos del detallado permanecen tipados como no representados: alternativas de pase descartadas, cadenas exactas de ayudas, movimientos y saques tácticos no generados. No los presentes como cero ni como un dato pendiente de pintar cuando falta el productor deportivo.

Retención e inexistencia son distintas: «no conservado en Referencia» no significa «no ocurrió»; «no modelado» no significa «sin uso».

### 6.3 Navegación

Conserva los dos accesos iniciales, estados de preparación separados y «Cambiar de motor». Añade dentro del laboratorio SIM los accesos necesarios para Análisis, Lotes, Jornada y Temporadas, reutilizando componentes actuales.

Una jornada mixta identifica el resolutor de cada encuentro. Abrir otro marcador mantiene su modelo. La consulta de temporada no re-simula ni regenera fichas.

## 7. Jornada simultánea y publicación del presente

### 7.1 Contrato temporal pequeño

Implementa un coordinador de jornada con:

- Identidad, fecha de escenario, horas de inicio y reloj virtual común.
- Estado por encuentro, su resolutor, reloj local/periodo y prefijo publicado.
- Cola limitada de trabajo y comandos/contexto reproducibles.
- Marcadores y clasificación provisional/final derivados del mismo prefijo.

Para este laboratorio, el reloj común es **tiempo virtual deportivo**, independiente del tiempo de CPU y de los segundos reales que tarda Dennis en mirar una pantalla. Explicita su correspondencia con el reloj local: tiempo disputado acumulado de periodos más desfases de inicio. Los intervalos administrativos son fronteras; no es necesario simular esperas televisivas o una duración realista de dos horas. No presentes esta convención como una medición de duración real de partido.

Conserva relojes locales y eventos discretos; no avances posiciones de jugadores por cada décima. Guardar tiempos en unidades enteras coherentes no implica resolver el deporte a esa frecuencia.

Las horas distintas se representan como desfases sobre la agenda. Un partido no iniciado no tiene marcador o estadísticas futuras publicados. Tras terminar el sénior, la jornada puede seguir hasta cerrar los restantes encuentros/prórrogas.

### 7.2 Barrera común y ausencia de futuro

En cada frontera de decisión relevante:

1. Publica los hechos alcanzados de todos los encuentros implicados.
2. Reconstruye marcadores y clasificación desde ese mismo presente.
3. Congela las vistas observables que utilizarán entrenadores/órdenes.
4. Decide y aplica cambios para la siguiente frontera admitida.
5. Genera el siguiente horizonte pertinente.

El orden de llegada de workers no altera esta secuencia. No hagas que el segundo entrenador vea un resultado recién calculado que el primero no podía ver en la misma frontera.

SIM puede generar su siguiente tramo y conservar el sufijo privado. No puede precalcular irrevocablemente toda una última jornada y luego aparentar que sus entrenadores reaccionaron a otros marcadores.

El adaptador detallado respeta sus fronteras atómicas existentes. Si una operación termina después del horizonte de publicación, retén sus datos futuros y conserva una vista del último estado publicable; no rebobines el núcleo ni interpoles resultados deportivos. Identifica el instante de observación cuando un dato solo está resuelto hasta una frontera anterior. Una orden del usuario entra en la ventana que el motor detallado realmente admite.

La velocidad x2/x4/x8/x16 y la frecuencia de repintado solo cambian cuánto se tarda en consumir la misma jornada. Avanzar por cuartos o completar automáticamente recorre las mismas fronteras de contexto/decisión; no salta toda la reacción entre partidos.

### 7.3 Escenario mixto visible

Debe poder probarse una última jornada con:

- Una competición de seis equipos: tres partidos a la misma hora, uno del sénior propio con motor detallado y dos SIM.
- Otro encuentro SIM con inicio desplazado.
- Un encuentro de la cantera propia, también SIM.
- Una necesidad de clasificación declarada para un entrenador SIM, evaluada desde la tabla provisional.

La tabla muestra clasificación inicial, provisional y final, con los partidos en curso identificados. Reutiliza el reglamento de clasificación del escenario si existe. Como convención de laboratorio cuando no existe, fija y documenta: victorias, diferencia de puntos, puntos a favor y, solo para ordenar empates persistentes, identificador estable. No atribuyas esa convención al reglamento ACB/FIBA completo.

Un empate en un marcador en curso es pendiente; no inventes una victoria o derrota para la clasificación provisional. El final normal se resuelve tras las prórrogas correspondientes. La tabla definitiva utiliza únicamente encuentros terminados válidos.

Incluye una prueba causal con dos noticias externas diferentes desde una frontera conocida: el prefijo anterior propio es idéntico y la política produce la respuesta futura que corresponde. Puede ser una prueba dirigida con vistas de clasificación explícitas; distingue esa prueba de los partidos reales del escenario visible.

### 7.4 Ejecución física

Reutiliza un pool limitado, con cuatro workers como configuración de referencia. Distribuye encuentros/tramos en grupos razonables; no crees un thread por partido ni un mensaje por segundo para cada uno de mil encuentros.

Mantén estados SIM en sus ejecutores o en una representación compacta transferible. Devuelve paquetes de hechos/acumulados y cursores útiles. El repintado consulta proyecciones incrementales; no reconstruye mil actas completas en cada frame.

En jornadas interactivas se respetan las barreras de información. En partidos históricos/agrupados sin interacción externa se permite completar el encuentro entero con el mismo modelo. Es una diferencia de coordinación, no de leyes deportivas.

## 8. Guardado y lotes persistentes

### 8.1 Guardar/continuar realmente

Un snapshot SIM conserva entrada/perfil/tablas congelados, RNG completo y ordinal, tiempo generado/publicado, sufijo privado, contadores, participantes, estados, planes/órdenes, política y cursores necesarios.

Las cachés puras se reconstruyen o serializan de forma identificada; sus funciones y referencias internas no pueden romper el guardado. Restaurar no vuelve a sortear el tramo pendiente.

La sesión de jornada conserva además reloj global, desfases, contextos publicados, clasificación de partida, órdenes pendientes, encuentros terminados y referencias a sus snapshots. Usa el snapshot existente del detallado sin modificar su deporte.

- Guardar antes/dentro de un tramo y continuar da el mismo resto con las mismas entradas futuras.
- Reiniciar navegador/servidor y recuperar es un caso real, no solo serializar/deserializar un objeto en memoria.
- Un guardado alterado, incompleto o de una versión incompatible se rechaza con causa, sin tocarlo ni sobrescribir la sesión activa.
- Pausar la jornada detiene su avance deportivo público; trabajos en vuelo pueden completar un sufijo privado dentro del presupuesto admitido, sin aplicar consecuencias futuras.
- Continuar no publica todo lo que terminó de calcularse durante la pausa.

### 8.2 Lotes SIM

Integra los tres tipos de agenda existentes: repetir enfrentamiento, cruces y pares elegidos; variantes con diferencias visibles y semillas congeladas.

Reutiliza persistencia y control de intentos donde sean compatibles. Se debe poder iniciar, detener al terminar los encuentros en curso, continuar, recuperar tras reinicio, reintentar fallidos y abrir el análisis de un resultado conservado.

El índice durable es la fuente de verdad. Escribe mediante confirmación coherente de resultado + registro de finalización; un proceso interrumpido no puede dejar un «terminado» cuyo archivo no existe.

Reutiliza el almacenamiento local y los servicios existentes, con espacios de nombres SIM sin colisiones. No introduzcas una base de datos, un servicio de colas o una infraestructura distribuida nueva para esta integración del laboratorio.

Identidades:

- Encuentro/caso lógico global y estable.
- Variante y semilla.
- Intento técnico distinto para cada reintento.
- Un único resultado aceptado por encuentro lógico para consecuencias del mundo.

Un intento fallido no tiene marcador definitivo ni cuenta como derrota. Si no hay snapshot compatible de un intento interrumpido, reinténtalo desde el inicio con la misma entrada/semilla y nuevo intento; conserva el anterior como interrumpido. No prometas continuación a mitad del partido si solo has implementado reinicio.

Los archivos descargables y comprobadores reconocen el modelo SIM. No dirijas los lotes SIM hacia `executeEssential` del detallado por reutilizar su interfaz.

## 9. Mundo agrupado e historia individual

### 9.1 Dos niveles de conservación, mismo deporte

| Nivel | Conservación mínima |
| --- | --- |
| Análisis de liga activa | Acta individual/equipo, zonas, familias, quintetos/evolución y registros compactos necesarios para los lectores comprometidos. |
| Referencia / esencial de temporada | Identidad, entrada/perfil/semilla, resultado, duración, acta individual/equipo con numeradores y denominadores, y desgloses compactos comprometidos para acumulados. No exige retener la secuencia completa. |

Cambiar el nivel no cambia RNG, producción, alineaciones ni consecuencias deportivas. Un resultado de Referencia no se re-simula para fabricar retrospectivamente un mapa o secuencia que no se conservó.

El transporte y almacenamiento del nivel esencial deben incluir **datos individuales**, no solo marcador/huella. El benchmark de 01 construía el acta dentro del worker, pero devolvía sobre todo resúmenes; esa no basta para mantener la temporada.

### 9.2 Identidades y registro de temporada

Mantén identidad de persona, identidad de instancia experimental y pertenencia a equipo diferenciadas:

- Un traspaso conserva la identidad de la persona.
- Una copia experimental independiente tiene su propio ámbito; compartir jugador de origen no fusiona sus estadísticas.
- Un identificador que contiene el código del club no prueba pertenencia actual.

Acumula por jugador, temporada, competición y club, conservando sus tramos. El total de temporada puede reunirlos sin duplicar partidos. Guarda sumas de minutos, intentos/aciertos y demás contadores: los porcentajes se calculan desde sus sumas, no promediando porcentajes de partidos.

Conserva procedencia por modelo y política estadística. Los conteos comunes compatibles pueden sumarse; una tasa avanzada solo reúne denominadores con el mismo significado. No sumes controles SIM y posesiones beM del detallado para presentar una tasa única como si fueran el mismo universo.

Las estadísticas visibles corresponden a la fecha alcanzada. No muestres totales de una temporada futura que ya se calculó internamente. Durante un partido puedes ofrecer datos provisionales separados; el acumulado histórico definitivo se confirma al terminar válidamente.

Usa un registro idempotente de consecuencias por encuentro lógico/resultado aceptado. Abrir un histórico, importar el mismo paquete, recuperar un lote o repetir un reintento no suma otra vez minutos, puntos ni aprendizaje.

Cambiar profundidad Referencia/Simulada/Dirigible conserva identidad, trayectoria y cobertura histórica. No regeneres población, alteres números pasados o inventes detalle ausente.

### 9.3 Fixture de mundo pequeña y real

Utiliza las doce plantillas existentes para dos competiciones sénior ficticias de seis equipos y una competición pequeña Sub-20 de cuatro equipos, con doce fichas por equipo de cantera. Las fichas de cantera son copias/generaciones identificadas del material de laboratorio, con identidades nuevas y edades explícitas de 16–18, no una afirmación de calibración empírica juvenil.

Esta fixture permite acreditar:

- Calendario corto de ida/vuelta, resultados y clasificación.
- Una competición conservada a nivel de análisis y otra en Referencia.
- Una cantera propia que siempre utiliza SIM.
- Plantillas ligeras con nombres e historia individual real, no solo totales de equipo.
- Un movimiento administrativo de jugador entre clubes/competiciones a mitad del calendario, con planes válidos antes/después. Es una operación de prueba; no implementa negociación o mercado.
- Cierre de temporada y apertura de la siguiente conservando el histórico.

Puede simularse el pasado del escenario sin equipo dirigido. Al activar la dirección del sénior en la jornada de demostración, sus encuentros posteriores utilizan el detallado; no cambies el resolutor histórico de los ya terminados.

Los acumulados del escenario deben proceder de partidos realmente generados y registrados. Una tabla inicial hipotética usada para probar un final clasificatorio se identifica como fixture artificial distinta, sin presentarla como historial calculado.

No construyas poblaciones de países reales, equipos B en ligas sénior ni toda la cantera temprana de los países en Referencia. Las demás categorías se representan mediante contratos/datos de categoría cuando existen; esta entrega no necesita generar cada categoría mundial para demostrar la integración.

## 10. Aprendizaje posterior al partido

### 10.1 Reutilizar las fórmulas actuales

El generador registra exposición; el aprendizaje se calcula al terminar mediante las funciones puras existentes de `src/learning`. No escribas otra curva de Polivalencia, retención o enseñanza para SIM.

Produce el adaptador de exposición compatible:

```text
players[id]:
  liveTenths
  positions
  offensiveRoles
  defensiveRoles
  modules
```

`liveTenths` y los tiempos de posición/rol son **décimas de segundo de juego vivo**: 600 = un minuto. Los créditos de módulos utilizan la unidad/política del productor existente; no conviertas una cuenta de acciones en horas sin transformación declarada.

Conserva participantes compactos suficientes para justificar la exposición de familias/módulos, incluidos director, finalizador y bloqueador pertinente. Utiliza las ponderaciones de contexto existentes. No concedas práctica de cobertura a una acción incompatible ni módulos a jugadores del banquillo.

La dosis máxima por minutos/dominio/día sigue la política común. Un mayor número de registros SIM no produce más presupuesto de aprendizaje. No apliques un factor nuevo «por motor» para compensarlo.

### 10.2 Aplicación y propiedad

- Conocimiento y rasgos de aprendizaje permanecen congelados durante el partido.
- Solo un resultado terminado y válido permite proponer aprendizaje completo.
- En el laboratorio, aplicación explícita a la copia propietaria, con vista previa, fuente exacta, recibo y deshacer según la política existente.
- Conserva las protecciones de MOTOR-18C: M1 no coincide con M10; copia A no se aplica a copia B; un manejador obsoleto vuelve a validar propiedad antes de escribir.
- Un reintento técnico no permite aplicar dos veces el aprendizaje del mismo encuentro lógico. Conserva trazabilidad del intento aceptado y añade la guarda de consecuencia lógica donde corresponde, sin debilitar la fuente exacta del núcleo común.
- Deshacer conserva las comprobaciones causales/huella de estado actuales; no sobrescribe aprendizajes posteriores para revertir uno antiguo.

La ejecución agrupada puede confirmar consecuencias automáticamente **después** del cierre válido del encuentro/fecha si esa política se declaró al iniciar el escenario. No aplica aprendizaje dentro de un tramo ni cambia la entrada congelada de un encuentro ya iniciado. El laboratorio de copias mantiene su aplicación explícita.

Si faltan Polivalencia o datos necesarios de entrenador, el partido puede seguir cuando no los consume, pero la aplicación de aprendizaje devuelve ausencia localizada; no inventes 16. Para los escenarios de aprendizaje crea fichas de prueba con rasgos explícitos y casos P8/P16/P24.

### 10.3 Comprobaciones de equivalencia de dosis

- Misma exposición normalizada y mismos parámetros → misma propuesta, independientemente de su procedencia SIM/detallada.
- Mismos minutos y reparto de módulos, con distinto número de registros → mismo presupuesto/dosis.
- Diferencias reales de uso de módulos pueden redistribuir aprendizaje; no deben esconder una prima por utilizar un resolutor.
- Contraste P8/P16/P24 modifica la propuesta posterior y conserva partido/exposición si el único cambio es Polivalencia.

Una comparación extensa entre temporadas de ambos motores se hará en 03. Aquí acredita las unidades, presupuestos, fuentes e integración, sin declarar equivalencia empírica completa a partir de dos encuentros.

## 11. Rendimiento y cachés exactas

### 11.1 Decisiones ya aceptadas

- Mantener **1.000 partidos en cinco segundos de cálculo con cuatro workers reutilizados** como objetivo operativo, sin considerarlo acreditado con margen robusto todavía.
- Medir también frío y arranque completo. El dato de 01 era aproximadamente 6,50 s con proceso nuevo y 4,21 s caliente; existían pasadas por encima de cinco segundos.
- Un pool persistente durante la sesión es válido. No ocultes el coste de arrancarlo ni de hacer partidos de calentamiento.
- Solo optimizaciones/cachés **exactas** en esta entrega: entradas completas, invalidación correcta, misma producción, orden deportivo y consumo de azar.
- No congelar energía, momentos, conocimiento pertinente o contexto de varios tramos para ahorrar cálculos. Una caché de valores desactualizados sería una aproximación nueva no autorizada aquí.

Separa recetas y correspondencias estáticas de los operandos dinámicos. No des por hecho que toda caché entre tramos cambia el modelo: una función pura con todas sus dependencias incluidas puede reutilizarse exactamente. Demuestra las equivalencias pertinentes; no prometas un ahorro antes de medir.

### 11.2 Medición comprometida

Congela versión, parámetros y la agenda de 1.000 cruces de 01. Realiza:

1. **P02-F:** proceso nuevo, cuatro workers, 1.000 partidos.
2. **P02-C1/C2/C3:** tres pasadas calientes de esos 1.000 casos, con los mismos workers y agenda; generación real en cada una, sin devolver resultados cacheados.
3. Una muestra de 64 casos con un worker para comprobar igualdad con los cuatro; amplíala solo si aparece una discrepancia o lo exige un perfil de coste concreto.

El objetivo de cálculo incluye generación, construcción de los datos estadísticos comprometidos y validación. Mide además la llegada al coordinador de las **actas esenciales por jugador**, serialización y persistencia, y el tiempo completo hasta que esas estadísticas están disponibles para el mundo. No uses como sustituto un JSON de marcador/huella de unos cientos de bytes.

Mantén el límite operativo del cronómetro de 01: solicitud del lote al pool listo → resultados esenciales individuales en poder del coordinador. El tiempo puro dentro de los workers puede medirse aparte; no sustituye ese tiempo de pared ni permite declarar la meta cumplida si el dato útil aún no ha llegado. Presenta persistencia y disponibilidad final como fases adicionales identificadas.

Registra máquina, Node, workers, preparación, arranque/calentamiento, fases, tamaño real de salida, memoria, tiempos de pared y variación. Identifica fases que no se puedan separar con precisión. No sumes la RSS del proceso una vez por thread.

En nivel de análisis conserva una muestra completa y mide sus bytes/coste. En Referencia conserva el esencial individual comprometido de los 1.000. La reducción de retención no altera el deporte.

Reutiliza esos mismos datos para el cierre de coherencia y para acreditar el registro idempotente de acumulados en una copia de prueba. No los utilices para calibrar. Cuenta las cuatro pasadas como repeticiones de 1.000 casos, no 4.000 observaciones deportivas independientes.

### 11.3 Jornada y coste integrado

Mide el escenario mixto y una agenda grande solo SIM con 1.000 encuentros a igual hora virtual, sin renderizar mil tarjetas ni ejecutar mil workers. La agenda grande puede reutilizar el trabajo de las pasadas anteriores si el ejecutor ya acredita avance coordinado y salidas comprometidas; declara exactamente qué se reutilizó.

Registra coste del coordinador/publicación, memoria y fluidez de consulta. El tiempo de visionado del sénior no es tiempo de CPU del mundo. No extrapoles una jornada de cinco partidos como prueba de mil simultáneos.

Si el objetivo falla, entrega la medida real, la causa observada y los límites. No rebajes la salida, cambies reglas o ejecutes una búsqueda indefinida de flags para publicar el mejor número. Las mejoras deportivas autorizadas pueden modificar la trayectoria SIM; las optimizaciones posteriores deben conservar la nueva trayectoria congelada.

## 12. Verificaciones y escenarios de cierre

### 12.1 Pruebas automáticas necesarias

Reutiliza las regresiones existentes y añade pruebas agrupadas sobre riesgos concretos. No escribas cientos de aserciones que solo reproduzcan la implementación.

| Grupo | Evidencia necesaria |
| --- | --- |
| Prefijos | Segundo 1, mitad de tramo y frontera: todos los campos corresponden al presente; publicación monótona; lectura sin azar; futuro privado. |
| Acta y familias | Libres y puntos exhaustivos; canasta con falta única; receptor de falta; continuidad tras tapón fuera; guard de cadena y exclusión causal. |
| Roles/director/conocimiento | Distribuciones fijas antes del sorteo; director efectivo; cobertura irrelevante neutral; bloqueador incluido; sin prima de Polivalencia en partido. |
| Energía/identidad | Coste de presión al ejecutante; entradas con órdenes/cuerpo/roles distinguibles; rechazo de no finitos y órdenes inválidas sin mutación. |
| Aprendizaje | Unidades, misma dosis normalizada, aplicación única, reintento, copia ajena, M1/M10, deshacer y resultado parcial. |
| Guardados | Continuación exacta desde frontera y desde prefijo con sufijo privado; sesión mixta; rechazo de archivo alterado. |
| Lotes reales | Interrupción de un proceso con trabajo real, reinicio, recuperación y reintento sin duplicar resultados ni consecuencias. |
| Jornada | Reloj común, inicios desplazados, marcador/tabla desde el prefijo, reacción a noticia externa y equivalencia de avances con igual información. |
| Historia | Sumas desde partidos, tramos por club/competición, movimiento de jugador, retención, cambio de profundidad y cierre de temporada. |
| Neutralidad | Referencia detallada intacta; variantes de registro/workers/avance SIM equivalentes con las mismas entradas/contextos; las 32 capacidades siguen consumidas. |

Los casos raros pueden forzarse con entradas/perfiles de prueba identificados, no cambiando la base. Una regresión dirigida de cálculo no necesita repetir decenas de partidos buscando un marcador.

Ejecuta la suite completa una vez al terminar los cambios de código, `data:check` y el comprobador documental sobre una copia limpia. Repite después solo los controles afectados por cambios adicionales. No elimines invariantes para acomodar resultados nuevos.

### 12.2 Partidos reales de integración

Utiliza la jornada mixta, calendario de mundo y mediciones anteriores para acreditar partidos completos. No añadas otra campaña masiva comparable a MOTOR-16.

Incluye al menos:

- Un encuentro SIM con acta/análisis y aprendizaje posterior.
- Una continuación real con un tramo privado ya generado.
- La jornada mixta y la cantera propia SIM.
- El calendario pequeño con historia individual y cambio de club.
- Un lote detenido/recuperado con ejecutor real, no solo sintético.

Las repeticiones por guardado y determinismo se contabilizan como tales. Un fallo corregido conserva reproducción y causa en la evidencia; no desaparece del recuento histórico del desarrollo.

### 12.3 Navegador y aceptación manual

Recorrido automático acotado en Chromium: selector → SIM → preparación/roles → partido → análisis/audiencias → propuesta posterior → jornada mixta → pausa/guardado/recarga/continuación → temporada → lote recuperado → descargas.

Comprueba archivos realmente descargados por bytes. Registra consola/red y los pasos no ejecutados. Haz un reinicio/recarga real donde afirmas recuperación.

Dennis hará el recorrido manual. Prepara una guía de aproximadamente 15 pasos con semillas, perfiles, escenarios y señales de fallo. No marques su aceptación como realizada porque pase Chromium.

## 13. Evidencia para ChatGPT

Claude implementa, ejecuta y empaqueta. **ChatGPT revisará los archivos y hará la interpretación deportiva; Dennis decide.** No anticipes la campaña comparativa de SIM-MOTOR-03 ni una calibración propia.

Guarda en `out/sim-motor02/entrega-final/`, excluido de Git:

### 13.1 Paquete de revisión rápida

`SIM-MOTOR-02-revision-rapida.zip`, orientativamente inferior a 10 MiB, con:

| Archivo | Contenido |
| --- | --- |
| `00-LEEME.md` | Dictamen separado de implementación, coherencia, rendimiento, manual y pendientes. |
| `01-IDENTIDAD.json` | Base/cabeza/código probado, perfiles, esquemas, dataset, entorno, estado de Git. |
| `02-CORRECCIONES.csv` | Cada C02 y mejora de roles/director/familiaridad: antes/después, productor, regresión y efecto sobre trayectoria. |
| `03-COBERTURA.csv` | Requisito → implementado/aproximado/no representado/no conservado/pendiente, con evidencia y audiencia. |
| `04-CAPACIDADES-CONTROLES.csv` | Las 32 capacidades, roles, director, familiaridad y políticas: consumidores y contrastes fijos. |
| `05-PARAMETROS.json` | Perfil efectivo completo, diferencias, semillas nuevas, procedencia y aproximaciones conservadas. |
| `06-PREFIJOS-Y-JORNADA.json` | Capturas estructuradas de horizontes, hechos/tabla publicados, decisiones/contexto, órdenes y comparación de avances. |
| `07-ACTA-Y-FAMILIAS.json` | Casos de libres/faltas/continuidades; sumas y denominadores recalculables. |
| `08-PERSISTENCIA.json` | Guardados, reinicio real, interrupciones, intentos aceptados y pruebas de no duplicación. |
| `09-TEMPORADAS.json` | Identidades y acumulados por jugador/club/competición, cambio de club/profundidad y cierre. Incluye tablas CSV si facilita su lectura. |
| `10-APRENDIZAJE.json` | Exposición normalizada, presupuestos, P8/P16/P24, fuentes, aplicación/rechazo/deshacer. |
| `11-RENDIMIENTO.json` | P02-F/C1/C2/C3, muestra 1 worker, costes de transporte/persistencia y jornada grande, memoria y bytes reales. |
| `12-AGENDA-Y-RESULTADOS.csv` | Casos/semillas, estados, marcadores, huellas, controles fallidos y enlace entre repeticiones. |
| `13-DETALLADO-CONGELADO.json` | Referencia antes/después, sorteos, huella y archivos deportivos cambiados si los hubiera. |
| `14-PRUEBAS-Y-NAVEGADOR.md` | Controles reales y no ejecutados, recuento de partidos/sondas/repeticiones/benchmark. |
| `15-PENDIENTES-SIM03.md` | Defectos abiertos, aproximaciones, decisiones realmente nuevas y propuesta de agenda para 03, sin ejecutarla. |

Incluye un resultado completo, entrada/perfil y un snapshot de ejemplo compatible. Para prefijos y jornada aporta los valores reales necesarios; una lista de booleanos «sin futuro: true» no permite comprobarlo.

Las tablas de rendimiento deben distinguir cálculo, generación/retención, transporte de estadísticas individuales y persistencia. El resumen de resultados del benchmark no sustituye a los datos esenciales comprometidos.

### 13.2 Paquete adicional

`SIM-MOTOR-02-evidencia-detallada.zip`, con:

- Entradas/resultados de la jornada mixta y escenarios de corrección.
- Registro de contexto/órdenes y snapshots necesarios para reproducir guardado/continuación.
- Lote pequeño real interrumpido/recuperado y su índice.
- Ledger/partidos del calendario de temporada pequeño, recibos y exposición de aprendizaje.
- Muestra representativa del nivel esencial individual; no hace falta duplicar todas las trazas de los 1.000 encuentros.
- Código de solo lectura de SIM, coordinación, adaptadores, persistencia, lectores y fórmulas consumidas necesario para revisar las afirmaciones.

No copies todo el repositorio. Si el ZIP crece mucho, particiona por escenarios completos y documenta el enlace; no hace falta entregar gigabytes para esta integración.

### 13.3 Índice y recibo

- `SIM-MOTOR-02-indice.json`: archivos, tamaños, SHA-256, contratos y enlaces.
- `SIM-MOTOR-02-verificacion-final.json`: comprobaciones sobre los archivos finales reales, separando integridad y contenido.
- Comprobador reproducible que parsea, comprueba enlaces y recalcula conciliaciones de los datos incluidos, sin volver a simular ni calibrar.

Los checksums no acreditan calidad deportiva. Un caso sin exposición se declara no evaluado. Evita referencias circulares entre índice y recibo.

Estos paquetes son evidencia diagnóstica para ChatGPT, con sus privados identificados; no sustituyen ni se publican como la exportación pública del partido.

Adjunta rápido, índice y recibo si el entorno permite hacerlo; deja disponible el detalle y su ruta. Si solo existen archivos del contenedor, dilo claramente y no inventes enlaces descargables.

## 14. Documentación, aceptación y respuesta final

### 14.1 Documentación

- Archiva este prompt íntegro en `docs/prompts/`, con su entrada de catálogo.
- Nota técnica indexada por temas: correcciones, contrato temporal, integración, aprendizaje, persistencia, historia, rendimiento y límites.
- Actualiza catálogo de outputs/controles: roles ya no son exclusivos del detallado; las ausencias reales siguen identificadas.
- Actualiza `docs/estado.md`, changelog e índices temáticos. Conserva el funcional íntegro y su histórico; documenta qué amplía/corrige SIM-MOTOR-02.
- Recorrido `docs/prompts/SIM-MOTOR-02-recorrido-manual.md` o convención equivalente.
- Scripts de ejecución/comprobación y evidencia resumida reproducible según las normas del repo. No subas `out/` ni grandes campañas a Git.

### 14.2 Criterios de aceptación

1. Correcciones verificadas con regresiones que capturan el defecto anterior cuando es reproducible.
2. Roles/director/conocimiento con efecto pertinente, conservando las 32 capacidades y el aprendizaje posterior.
3. Lectores sobre hechos SIM, sin diagnósticos inventados ni privados públicos.
4. Jornada mixta con presente común, clasificación en directo y reacción futura a noticias publicadas.
5. Continuación real, lotes recuperables y consecuencias idempotentes.
6. Referencia con jugadores identificados y estadísticas anuales por club/competición, hasta la fecha alcanzada.
7. Medición con salidas individuales útiles y rendimiento declarado con sus límites.
8. Detallado congelado, suite/controles ejecutados y evidencia revisable.

La aceptación deportiva, concordancia con competiciones reales, conformidad FIBA integral y recorrido manual de Dennis no se cierran automáticamente. Tampoco un comprobador verde convierte el objetivo de cinco segundos en alcanzado si las mediciones no lo sostienen.

### 14.3 Respuesta final de Claude

Entrega una respuesta breve con:

- PR/base/commit final y relación con la PR #21.
- Qué puede probar Dennis y arranque.
- Estado de correcciones y qué cambios alteran el resultado deportivo SIM.
- Qué funcionan realmente en jornada, historia, aprendizaje y recuperación.
- Cifras de coste: frío, tres calientes, estadísticas individuales transportadas/persistidas y memoria.
- Referencia detallada y equivalencias internas comprobadas.
- Pruebas realizadas/no ejecutadas; aceptación manual pendiente.
- Archivos, tamaños y comando del comprobador.
- Defectos/decisiones pendientes para que ChatGPT prepare SIM-MOTOR-03.

No cierres «el motor completo» ni ejecutes 03 por anticipado. No midas ni inventes cuota de Claude si el entorno no permite conocerla. No fusiones PR, no te suscribas y no envíes mensajes a terceros.

**Concluye esta implementación con los paquetes listos para revisión. El siguiente paso será decidir una campaña comparativa proporcionada a partir de sus resultados, manteniendo el roadmap de cuatro entregas.**
