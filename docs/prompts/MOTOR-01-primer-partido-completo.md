# MOTOR-01 — Primer partido completo y laboratorio inicial de beM

**Destinatario:** Claude Code, exclusivamente en `bateman37/beM`.  
**Fecha:** 16 de octubre de 2026.  
**Entrega:** MOTOR-01 del roadmap aceptado por Dennis.  
**Resultado:** una aplicación ejecutable en la que Dennis pueda editar dos plantillas de doce jugadores, preparar un plan, simular un partido completo por acontecimientos dentro de posesiones y revisar acta y registro reales.  
**Material incluido:** perfil numérico provisional y 144 fichas ficticias explícitas; solo EQ01 y EQ02 son escenarios jugables de esta entrega. No necesitas inventar capacidades, jugadores o coeficientes para arrancar.

## 1. Ejecuta esta entrega

Implementa MOTOR-01. No te limites a crear estructuras, un plan técnico, botones sin funcionamiento o una demostración de una acción aislada. La entrega termina con el recorrido completo accesible desde la interfaz, comprobado y preparado en una rama y PR sin fusionar.

El cálculo deportivo avanza cuando hay un acontecimiento pertinente que resolver. Una resolución puede agrupar preparación, lectura, elección y ejecución. Se descuenta de una vez la duración que corresponde al hecho producido. No hay bucle por segundo, milésima, fotograma ni movimiento de diez jugadores.

El marcador, las estadísticas y el relato proceden de lo que sucede en esas posesiones. No generes un resultado global y repartas después puntos, acciones o minutos para que parezca que se jugó.

Motor, táctica y atributos se implementan conjuntamente. El mismo núcleo se seguirá utilizando en las próximas entregas y en los futuros lotes del manager.

## 2. Autoridad, lectura y preparación

### 2.1. Normas y fuentes

Lee `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, el índice del motor y el estado actual. Localiza las secciones pertinentes mediante los índices de DOC-001:

- Alcance y responsabilidades: capítulos originales 1 y 30.
- Entradas, catálogo de 32 capacidades, cuerpo y tendencias: capítulos 2–5, solo las definiciones y contratos necesarios.
- Ataque, defensa y repertorio: las entradas activas indicadas en §3, sus requisitos y continuaciones.
- Flujo, selección, resolución y tiempo: capítulos 11–13.
- Reglas y registro: capítulos 18–19, para los acontecimientos activos.
- Acta básica y atribución pertinente: capítulo 20.
- Laboratorio y perfil inicial: capítulos 24 y 29, con sus etiquetas de estado.

Usa las páginas temáticas vigentes. Si solo existe el completo, busca sus encabezados y lee esos apartados; no vuelques todo el fichero en cada operación. No releas los ocho originales ni todos los prompts históricos como requisito general.

Conserva la última decisión aceptada que figure expresamente en el repositorio. Este prompt concreta la construcción de MOTOR-01 y aporta semillas de desarrollo; no autoriza a cambiar el diseño funcional ni a sustituir reglas vigentes por una simplificación antigua.

No abras, clones ni inspecciones `basket-manager`, `BeManager`, ZenGM ni otros repositorios. Las referencias necesarias se han trasladado al funcional. Puedes consultar documentación oficial de las herramientas que estés utilizando y las fuentes normativas expresamente enlazadas aquí, solo cuando una cuestión concreta lo requiera.

### 2.2. Estado real y conflictos

Confirma que trabajas en `beM`, revisa Git y conserva los cambios ajenos. Comprueba qué partes ya existen y reutiliza lo válido.

Si hay una base técnica aprobada, úsala. No migres el proyecto ni mezcles dos aplicaciones. Si el repositorio solo contiene documentación y no tiene base técnica aprobada, utiliza la base mínima expresamente propuesta en §9.

Si falta una verdadera decisión funcional o existe una contradicción no resuelta con un cierre posterior, identifica `DECISIÓN REQUERIDA` con referencias y efecto concreto. Avanza con lo independiente. No presentes la existencia normal de contenido diferido a MOTOR-02–14 como una decisión que Dennis deba volver a tomar.

### 2.3. Estado del perfil adjunto

Los anexos A y B son una **propuesta explícita de semillas de arranque preparada por ChatGPT para esta entrega**. Contienen datos ficticios y coeficientes provisionales, no frecuencias reales ni calibración terminada. Conserva su procedencia y estado SEM.

El perfil está completo para los comportamientos activos declarados de MOTOR-01. **No certifica que estén completadas todas las filas de los 81 grupos finales**, ni sustituye el requisito del funcional de entregar un perfil operativo completo y preconfigurado. Ese cierre global y su evidencia siguen siendo obligaciones del roadmap; no los marques como logrados por cargar estos anexos.

Las 144 plazas reciben aquí valores numéricos provisionales explícitos. Su composición de roles procede del funcional; su evaluación y el generador se completarán en entregas posteriores. Los planes jugables incluidos cubren EQ01/EQ02. No inventes planes ejecutables para los otros diez equipos.

Carga literalmente estos datos. Si ya hay una versión posterior expresamente aceptada para el mismo campo, conserva esa versión y documenta la correspondencia. No ajustes probabilidades durante la implementación para obtener un marcador atractivo. Una anomalía se informa con evidencia.

## 3. Alcance deportivo de MOTOR-01

| Área | Activo en esta entrega |
|---|---|
| Equipos jugables | EQ01 — Equilibrado y EQ02 — Exterior; doce jugadores por equipo. |
| Datos de jugador | Las 32 capacidades, cuerpo, roles, tendencias y estados de entrada. Las capacidades se usan por pertinencia; el catálogo completo de efectos no se declara terminado. |
| Disposición | DIS02: cuatro abiertos y un interior. |
| Defensa | ORG01: individual, altura normal; COB01: contener/drop cuando corresponde a la interacción. |
| Estilos editables | Ritmo organizado, prioridad de finalización y libertad, cada uno con cinco niveles. Los demás quedan en el valor declarado y señalados como cobertura pendiente; no añadas controles que no hagan nada. |
| Libro | Prioridades 1–5, con prioridades compartibles; selección por familia y después variante. |
| Fichas | POS01, POS05, POS07, POS09, POS11 y POS14. |
| Continuaciones | CONT01, CONT04, CONT05, CONT08 y CONT09 cuando sean compatibles. |
| Recursos inmediatos | Subconjunto ESP01, ESP02, ESP06, ESP12, ESP13, ESP15, ESP16 y ESP17, con requisitos reales. La cobertura restante se conserva como pendiente. |
| Estados activos | Energía, carga y recuperación. Forma y los tres ámbitos de momento se conservan como entrada neutral; dinámica completa, Consistencia y Presión quedan para MOTOR-07. |
| Dirección | Plan inicial y rotación automática básica declarada, disponibilidad y faltas. |
| Modalidad | Simulado completo. Los otros modos, velocidades e intervención manual durante el encuentro corresponden a MOTOR-02. |
| Salida | Marcador por periodos, acta básica, secuencia de acontecimientos, diagnóstico real y descarga JSON de un encuentro. |

Las otras disposiciones, zonas, coberturas, saques tácticos, políticas completas, memoria, estadísticas avanzadas, panel completo y lotes se incorporarán según el roadmap. Un saque administrativo necesario para reanudar sí existe ahora; su libro táctico completo no es requisito de MOTOR-01.

No presentes esta versión como todo el baloncesto ya implementado. Tampoco construyas una arquitectura artificialmente limitada a estas seis fichas: son contenido inicial sobre las mismas operaciones compartidas.

## 4. Recorrido desde la interfaz

### 4.1. Plantillas y edición

Una pantalla clara, en español, con acceso directo al laboratorio. Debe permitir:

1. Ver las dos plantillas, sus doce fichas y el quinteto inicial.
2. Abrir una ficha y consultar sus 32 capacidades agrupadas, cuerpo, roles, tendencias y energía inicial.
3. Editar capacidades conservando su precisión continua y presentándolas de forma legible. La escala es 1–30, no un porcentaje de acierto ni una nota relativa a la liga.
4. Seleccionar jugadores y capacidades y aplicar **+1, +3 o +5** una vez al conjunto seleccionado. Mostrar qué se va a modificar y respetar los límites sin wraparound. Se pueden seleccionar todos; una selección vacía no modifica nada.
5. Restaurar las fichas iniciales suministradas. La restauración ocurre por una acción explícita, no al simular ni al cambiar de pestaña.
6. Editar energía inicial 0–100. Los estados aún no activos se muestran como neutrales y pendientes, no como controles funcionales.

Mantén separadas la edición para el próximo encuentro y la copia de entrada congelada del encuentro terminado. Editar una ficha después no altera su acta anterior.

Los demás equipos de referencia pueden quedar almacenados como fixtures para futuras entregas; no necesitas construir ahora su selector ni su editor completo.

### 4.2. Preparación

Permite elegir una semilla entera, revisar el quinteto y el director —con sus alternativas válidas—, cambiar los tres estilos activos y asignar prioridades 1–5 a las seis fichas. Varias fichas pueden compartir prioridad.

Los valores iniciales vienen del anexo A. Muestra el identificador y estado provisional del perfil. Antes de simular valida entradas y referencias; los errores deben identificar el campo concreto. Una capacidad baja no invalida por sí sola una función.

### 4.3. Partido y resultado

Botón «Simular partido», estado de ejecución y resultado. El proceso debe terminar sin bloquear indefinidamente la interfaz; si necesita ceder ejecución, hazlo entre acontecimientos, sin vincular el cálculo a fotogramas.

Muestra:

- Marcador final, parciales y prórrogas realmente producidas.
- Acta de equipo y jugador: minutos, puntos, tiros de dos/tres/libres anotados e intentados, rebotes ofensivos/defensivos, pérdidas, faltas y recuperaciones/tapones cuando se hayan atribuido a hechos reales.
- Jugadores utilizados, quintetos y sustituciones.
- Secuencia cronológica por periodos y posesiones: intención, protagonistas, resultado y continuidad.
- Acceso a detalles calculados de una resolución, separado de la vista normal.
- Descarga del encuentro JSON con entrada efectiva, perfil, semilla, hechos, diagnóstico, acta y estado de cobertura.

No inventes asistencias, coordenadas, créditos de equipo o explicaciones para rellenar columnas. Las métricas aún no implementadas se omiten o identifican como pendientes; no se presentan como ceros observados. La atribución exhaustiva del acta corresponde a MOTOR-09.

La representación puede paginar o virtualizar el relato. La descarga conserva todos los registros capturados del encuentro, sin un recorte silencioso a los últimos mensajes.

## 5. Núcleo deportivo y cálculo explícito

### 5.1. Estado pequeño y acontecimientos

Conserva solo lo pertinente: periodo, ambos relojes, control y derecho de reanudación, balón vivo/muerto, quintetos, disponibilidad, faltas, energía, plan vigente, poseedor/director, oposición y apoyos implicados, responsabilidades modificadas y continuidad.

La historia y los registros no forman parte de un mapa espacial activo gigantesco. Se usan relaciones funcionales —balón, interior, apoyo exterior, responsable actual y ayuda comprometida—, sin coordenadas continuas.

Cada resolución devuelve la duración, consecuencias y registros que va a aplicar. Comprueba la frontera reglamentaria antes de confirmar un hecho que ocurriría después de una bocina. Descuenta tiempo, actualiza energía/minutos y aplica las consecuencias una sola vez.

Tras rebote ofensivo, desvío conservado o continuación no se regala una posesión nueva ni se borra gratuitamente la desorganización defensiva. Una reorganización válida cuesta el tiempo correspondiente. Los balones muertos que permiten recolocación se identifican como tales.

### 5.2. Aleatoriedad reproducible

Utiliza el algoritmo del perfil: `xorshift32`, con operaciones enteras de 32 bits sin signo, divisiones por 2^32 y sustitución explícita de la semilla cero. Su paso es: `x ^= x << 13; x ^= x >>> 17; x ^= x << 5`, conservando el estado sin signo.

Una fuente deportiva explícita por encuentro; no uses `Math.random`, fecha, IDs aleatorios, orden de renderizado o UUID para decidir deporte. Ordena candidatos por identificador estable antes del sorteo. Registra secuencia, propósito y valor de los sorteos utilizados.

UI, logs, descarga, formateo y mediciones no consumen sorteos deportivos. Repetir la entrada congelada, semilla y versión produce el mismo partido bajo el mismo motor. El perfil y los datos no se mutan durante la simulación.

### 5.3. Participantes y tareas

Resuelve director, poseedor, pasador, receptor, bloqueador, poste, defensor principal, ayudante e interceptor según el contexto y las funciones. Cada término usa la capacidad del participante que ejecuta esa tarea. Un jugador de banquillo no interviene y un compañero no presta su gran Pase al ejecutante.

La prioridad de directores del perfil solo se consulta entre jugadores activos y disponibles. Las posiciones facilitan compatibilidad de funciones; no crean un bonus universal. El emparejamiento de referencia y el responsable actual se conservan por separado.

Las fichas activas siguen los contratos existentes:

- **POS01:** el manejador puede atacar o conectar la continuación; el bloqueador ejecuta su pantalla.
- **POS05:** el poseedor y receptor ejecutan la entrega; puede negarse o conservarse el balón.
- **POS07:** bloqueador y receptor crean una salida; el tiro no está garantizado.
- **POS09:** pase y corte, con devolución o alternativa si la línea está negada.
- **POS11:** ganar recepción y crear desde poste con TEC11; el tiro posterior usa su técnica real.
- **POS14:** creación del manejador, finalización propia o descarga ante una ayuda pertinente.

Asigna funciones con estas reglas explícitas:

| Ficha | Asignación inicial |
|---|---|
| POS01 | `handler` es el director con balón; elige `screener` entre los slots declarados del perfil. |
| POS05 | `hub` entre sus slots; `receiver` entre los suyos. El director es el pasador inicial si el balón debe llegar al hub. |
| POS07 | Pasador inicial = director; receptor y bloqueador distintos, entre sus slots declarados. |
| POS09 | Cortador = director que da el pase inicial; receptor distinto. En el término de calidad `passer` se utiliza quien debe ejecutar la devolución, no se presta el Pase del cortador. |
| POS11 | `post` entre sus slots; pasador inicial = director. |
| POS14 | Manejador entre `isolationHandler`; si difiere del poseedor, el envío necesario pertenece al pasador real. |

Para elegir actor entre candidatos de un slot funcional, normaliza los términos que su rol aporta a `qualityAttack` y aplica `abilityFit`; receptor, poste y finalizador multiplican además por `0.35+0.65*finishingVocation`. Filtra identidades incompatibles y ordena por ID antes del sorteo. Los slots describen la función asignada al quinteto, no una prohibición por posición nominal. No exijas una capacidad mínima que el perfil no establece.

El defensor de referencia es quien tiene asignado ese slot rival; la oposición actual puede variar por pantalla, continuación o ayuda. Usa sus IDs reales. Un ayudante se elige solo entre los slots declarados con acceso funcional, excluyendo a quien ya cumple la oposición y evitando abandonar dos responsabilidades simultáneamente.

CONT01 permite llegada, CONT04 descarga, CONT05 pase adicional, CONT08 seguridad y CONT09 reorganización. Usa sus requisitos, no una cuota de pases. Pueden terminar en recepción, conservación, contacto, pérdida, balón suelto o agotamiento del reloj.

Las 17 tareas son operaciones compartidas, combinables cuando proceda. El JSON trae recetas y las otras operaciones se concretan en tiros, contacto, intercepción y rebote. No crees una clase, fórmula global o secuencia de 17 sorteos para cada ficha.

### 5.4. Funciones matemáticas comunes

Sean `a(x)=(x−1)/29`, `sigmoid(z)=1/(1+exp(−z))` y `logit(p)=ln(p/(1−p))`. Una receta es una media ponderada normalizada de las capacidades del actor indicado. La referencia neutral del perfil es **16**.

Para una binaria pertinente:

`p = sigmoid(logit(p0) + sA*(Aef−16) − sD*(Def−16) + K)`.

Si no hay oposición elegible, omite el término defensivo: no inventes un defensor con nota 0 o 16. Conserva qué condición de preparación/oposición explica la referencia utilizada.

Para resultados excluyentes:

`w[j] = base[j] * exp(z[j]); P[j] = w[j] / sum(w de resultados elegibles)`.

Para seleccionar candidatos:

`P[i] = w[i] / sum(w de candidatos elegibles)`.

Filtra primero los requisitos. Un candidato incompatible tiene ausencia de elegibilidad, no un peso pequeño inventado. Si no queda candidato, utiliza una continuación de seguridad realmente viable o el resultado reglamentario correspondiente; no rellenes con un tiro arbitrario.

### 5.5. Libro, libertad y lectura

La masa de una familia utiliza el peso de su mejor prioridad elegible, según `[8,5,3,2,1]`. Duplicar una variante no multiplica la masa familiar. Después elige variante por prioridad y requisitos dentro de la familia elegida.

Con `F` de los cinco niveles de libertad e `I` de Iniciativa:

`L = F * (0.25 + 0.75*I)`.

`q = (0.55*MEN02 + 0.45*MEN03 − 1)/29` del director que decide.

`Pjugador = q*Padaptacion + (1−q)*Ppreferencias`.

`Pintencion = (1−L)*Pentrenador + L*Pjugador`.

Normaliza cada distribución sobre el mismo conjunto elegible. Aplica esta mezcla a la elección de intención; no vuelvas a multiplicar el éxito del tiro por libertad o por calidad del director.

Para los pesos de preferencia usa la vocación de finalización, preferencia de zona, rol y `clamp(1+0.035*(capacidad pertinente−16),0.35,1.50)`. El multiplicador de estilo orienta triple e interior; no cambia directamente su acierto.

Para `Padaptacion`, usa una estimación de valor basada en técnica propia, puntos de la opción, oposición observable y riesgo del contexto: `max(minimumUtility, puntos*pEstimada − expectedTurnoverCostPoints*riesgoEstimado)`, y normaliza. El estimador rival inicial usa la referencia 16 del perfil y responsabilidades observadas, no sus capacidades ocultas exactas ni sorteos futuros. El valor y riesgo estimados proceden de las mismas recetas con esa información permitida.

Las recetas de resolución sí usan las capacidades verdaderas de los participantes reales. Mantén separadas esa verdad deportiva y la información disponible para elegir.

### 5.6. Oportunidad, ayuda y tiro

Para una ficha utiliza las mezclas `qualityAttack` y `qualityDefense` del perfil. Esas mezclas expresan funciones; asigna sus actores antes de calcularlas. La coordinación usa TAR01; los valores contextuales de cobertura y ayuda solo se aplican cuando el hecho existe.

`z = advantageSensitivity*(CA−CD) + Kcontexto`.

Los pesos de calidad son `0.25*exp(z)`, `0.55` y `0.20*exp(−z)`, normalizados. K se acota por `maximumQualityContextLogit`. La calidad es previa al resultado; cómoda no significa canasta y forzada no significa fallo.

En COB01, la concesión al manejador y oposición al continuador usan los dos valores declarados, solo si esos sujetos y esa cobertura intervienen. No apliques una etiqueta de drop a una acción sin pantalla para modificar su tiro.

Una ayuda adicional exige defensor disponible y responsabilidad que abandona. Su probabilidad de compromiso parte de `helpProbability`. Su ejecución compara la receta TAR09 con el receptor pertinente usando la sensibilidad del perfil; si la ayuda llega, aplica el modificador contextual declarado y conserva la salida que deja libre. El ayudante no puede oponerse simultáneamente a todas las opciones.

Si un receptor realmente libre obtiene una ventana, registra esa disponibilidad y su oposición real. La lectura decide si se intenta aprovecharla. Una oportunidad directa se etiqueta ESP, sin inventar una familia nominal de jugadas.

Los pesos de salida de cada ficha son preferencias iniciales, modificadas por receptor, zona, técnica y estilo. No son porcentajes finales obligatorios de tiros. Las ramas pertinentes evalúan pase/recepción, pantalla, separación o poste antes de utilizar su consecuencia; no se añade un acierto independiente a cada función si puede resolverse agrupada.

El principal de tiro procede de `shots`. TEC06 solo actúa cuando hay preparación de lanzamiento tras movimiento, con coste `−movementMaximumLogitCost*(1−a(preparacion))`; no sustituye TEC01/02/03/04. Floater en progresión o llegada usa TEC04; tiro corto controlado usa TEC03. TEC11 crea desde poste, sin repetirlo como técnica principal de conversión.

El alcance es la media de altura y envergadura normalizadas y acotadas con los rangos del perfil. Úsalo una vez en oposición física pertinente mediante `contestAbilitySensitivity*(alcanceDefensor−alcanceAtacante)`. No añadas además altura, envergadura y peso como tres ventajas. Peso y edad tienen efecto directo adicional cero.

### 5.7. Suceso principal y compatibles

Elige entre categorías elegibles de `outcomes.base`. Sus referencias se renormalizan tras aplicar causas pertinentes:

- Pérdida con balón o pase: usa TAR06 o TAR07 según la ejecución real, con `controlSensitivity*(intervencionDefensiva−controlOfensivo)` si interviene un rival; sin intervención, solo `−controlSensitivity*(controlOfensivo−16)`, como dificultad intrínseca, sin crear un defensor ficticio.
- Falta defensiva: usa legalidad de defensa pertinente, Anticipación y Concentración según `contact`; modificador `defensiveFoulSensitivity*(16−legalidadDefensiva)`.
- Falta ofensiva: solo con contacto ofensivo pertinente —pantalla, poste o penetración— y `offensiveFoulSensitivity*(16−legalidadOfensiva)`.
- Infracción de balón: solo si el movimiento o control representado puede producirla; no atribuyas pasos a un receptor que nunca recibió.
- Balón suelto: participantes con acceso, control según TAR17; la recuperación conserva o cambia control sin inventar un rebote si no hubo tiro.
- Tiro: técnica, preparación y oposición correspondientes.

Una recuperación creditada exige interceptor con acceso y control. `stealGivenTurnover` es condicional a una pérdida compatible, no otra oportunidad de añadir una pérdida o robo al mismo hecho. Una salida o mal control sin recuperador no recibe robo ficticio.

En `contact`, `defenseTechnique` significa TEC12 en oposición exterior o TEC13 interior; `actionTechnique` significa TEC09 en pantalla, TEC11 en creación de poste o TEC07 en penetración. No son tres capacidades nuevas. La ayuda usa `helpExecutionP0` y `helpDifferenceSensitivity`; no inventes otra referencia binaria.

Una falta de tiro puede convivir con canasta: utiliza la conversión condicional con `shootingContactLogit`. Si entra, cuenta la canasta y el libre adicional; si falla, administra la serie que corresponda y aplica la política de intento de campo válido. No cuentes automáticamente un fallo de campo además de una falta de tiro. La administración deriva del mismo hecho, sin sortear otra sanción.

Tapón y conversión: solo con opositor elegible y tiro susceptible. Sortea la intervención con las recetas `block`; si hay tapón, ese intento no entra. Si no lo hay, resuelve conversión condicionada a no haber sido taponado. La rama de contacto usa su relación condicional, no un tapón incompatible añadido después.

El tapón conserva su destino: balón vivo o fuera; no equivale siempre a recuperación defensiva. Un desvío fuera sin aro no regala catorce segundos. El perfil determina los sorteos deportivos de estas ramas y la regla determina su reanudación.

En esta precarga, el fallo ordinario no taponado pertenece a la clase con contacto de aro que indica `ordinaryMissContactsRing`. No generes además un airball implícito con reajuste de reloj incorrecto. Esa limitación de vocabulario se documenta; las variantes adicionales se completarán con su clasificación y datos.

### 5.8. Rebote y continuidad

Solo después de tiro fallado con rebote elegible. Primero el acceso: usa los slots del perfil y añade el tirador cercano solo cuando pueda intervenir. No participan por defecto los cinco atacantes y cinco defensores; los que protegen balance no reciben acceso gratuito.

Obtén la fuerza de cada conjunto elegible mediante la receta `rebound.strength`, normalizada sobre esos participantes. El aporte corporal se integra ahí una sola vez con `reboundStrengthSensitivity*(alcance−0.5)`.

`pRO = sigmoid(logit(p0) + sensitivity*(RA−RD) + Kcarga)`.

Tras decidir el equipo, selecciona captor entre sus candidatos por la receta `captor`, con pesos positivos y orden estable. No vuelvas a cobrar el mismo cierre/alcance en la atribución de captura. Identifica trabajo de cierre cuando se haya resuelto; no inventes mérito de todos los compañeros.

El último libre fallado con balón vivo usa su referencia y participantes propios. No hay rebote en cada fallo de una serie ni después de una bocina que impide continuación viva. Rebote ofensivo conserva posesión y el derecho de reloj correspondiente; recuperación rival inicia control nuevo.

CONT04/05/08/09 usan las probabilidades declaradas solo si hay alternativas realizables, un envío real y tiempo. Conserva responsabilidad y reloj; no reinicies gratis la jugada. No impongas un número deportivo máximo de pases para acabar siempre en tiro.

### 5.9. Transición y recursos inmediatos

Son elegibles tras recuperación viva o rebote defensivo, o una recepción liberada realmente obtenida. Usa las referencias `selection.direct` para intento y disponibilidad inicial de ventaja, junto con balance, roles y participantes que pueden llegar; no sortees un camino vacío cuando la defensa ya está colocada.

La aceptación usa `clamp((acceptanceFloor+L)*q*ajusteTecnico,0,1)` para una oportunidad compatible. Las opciones de aro o triple se ponderan por preferencias y valor estimado, conservando oposición/preparación. Rechazar la oportunidad puede llevar a organizar; organizar consume su tiempo.

Después de rebote ofensivo puede haber finalización próxima, pase fuera o reorganización; no se fuerza el palmeo. Si se agota un sistema o queda poco reloj, el recurso sencillo utiliza opciones conocidas y tiempos pertinentes. El origen ESP no necesita una ficha ficticia.

El balance queda representado por participantes comprometidos y disponibles: aumentar carga futura no puede mejorar rebote sin dejar ese coste en la transición siguiente. En MOTOR-01 ese estilo permanece neutral, con los participantes concretos declarados.

## 6. Tiempo y administración

### 6.1. Duraciones

`durationSeconds` declara distribuciones triangulares `[mínimo, moda, máximo]`. Aplica la distribución del contexto y resultado: una pérdida o contacto no esperan siempre al tiempo de un tiro.

El ritmo organizado modifica el componente de organización; no ralentiza libres ni todos los acontecimientos. Si separas avance y acción, el tiempo total incluye ambos una vez, sin sumar dos duraciones que ya expresen lo mismo. El intervalo de avance solo se aplica cuando hay que avanzar.

Con poco reloj, filtra las alternativas imposibles y utiliza duraciones urgentes. Si una resolución aún no producida queda después de un límite, procesa ese límite y no concedas el tiro, pase, contacto o captura. No recortes toda acción larga para convertirla en un lanzamiento en el último instante.

Puedes representar relojes en décimas o unidades enteras equivalentes para evitar errores de coma flotante: eso no crea pasos temporales. Los minutos y la energía se actualizan por el intervalo efectivamente transcurrido.

### 6.2. Base reglamentaria de los hechos activos

Aplica el perfil FIBA 2026 v1.1 conservado en el funcional. Referencia oficial: https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf

| Concepto | Referencia básica |
|---|---|
| Duración | Cuatro periodos de 600 s; prórrogas de 300 s si persiste empate. |
| Posesión/avance | 24 s y avance de 8 s; reajustes según causa y zona. |
| Aro y mismo control | 14 s cuando corresponde tras tocar aro; no por cualquier desvío. |
| Faltas | Cinco excluyen al jugador; penalización colectiva tras cuatro del periodo. |
| Prórrogas | Faltas colectivas acumuladas con el cuarto periodo. |
| Control ofensivo | Su falta no concede libres por bonus. |
| Libres | Serie causal, lanzador válido y último intento vivo cuando corresponda. |
| Canasta final ajustada | Parada del reloj en los últimos 120 s del cuarto final y prórrogas. |

Conserva alternancia, derecho al saque, balón vivo/muerto y las ventanas legales aplicables a sustituciones. Inicializa la flecha de acuerdo con el primer control y utilízala en los inicios pertinentes; no alternes incondicionalmente cada posesión.

Distingue momento de suelta y resolución cuando una bocina intervenga en un lanzamiento. Administra las consecuencias pendientes antes de cerrar el periodo. No añadas un rebote posterior inexistente.

Las consecuencias son deterministas una vez validado el hecho. Los casos combinados extraordinarios no producidos por este subconjunto se identifican como cobertura posterior; no se generan y se administran con reglas inventadas. Si un caso indispensable realmente queda sin definición en el perfil vigente, informa del caso concreto.

## 7. Energía y rotación inicial

### 7.1. Energía

Por cada intervalo real de juego, carga a los que estaban en cancha:

`gasto = costPerLiveMinute * minutos * carga * clamp(1−enduranceSlope*(ResistenciaBase−16), límites)`.

La carga se acota por los límites del perfil y se aplica una vez al intervalo, no otra vez por cada fase lógica. El banquillo recupera por esos mismos minutos. Intervalos de cuarto, descanso largo y previo de prórroga recuperan según perfil, sin duplicar corto y largo.

Interpola linealmente los seis nodos de severidad. Para la receta pertinente:

`scoreEfectivo = clamp(scoreBase − severidad(E)*maxEnergyPenalty,1,30)`.

Cada componente usa la energía de su ejecutante. En recetas de varios actores, calcula primero el aporte efectivo de cada uno, sin restar la energía de un único jugador a todo el grupo. `maxEnergyPenalty` es el máximo de la tarea, no un porcentaje de todas las capacidades.

Para tiros y libres usa los máximos técnicos declarados; para preparación el suyo; para rebote y tapón sus máximos específicos. No modifiques permanentemente las 32 notas ni añadas otro multiplicador universal de fatiga al mismo desenlace.

La zona 100–70 es casi neutra; bajo 10 debe notarse en las tareas exigentes. La edad no modifica el gasto ni añade experiencia por segunda vez.

### 7.2. Relevo básico

Revisa en intervalos y balones muertos legalmente aptos. No sustituyas con balón vivo ni después de cualquier canasta de forma automática.

La utilidad de un jugador para un slot usa `rotation.slotAbilityWeights`, resta selectivamente la severidad por `rotation.utilityMaxEnergyPenalty` y conserva capacidad propia; no es un overall universal del jugador.

- Excluido o no disponible: sustitución obligatoria con alternativa válida.
- Revisión por fatiga: umbral, tramo mínimo y descanso del candidato del perfil. Releva si el candidato es compatible y su utilidad alcanza la tolerancia declarada.
- Tramo largo: utiliza la tolerancia propia y disponibilidad real.
- Energía crítica: revisa con su tolerancia, sin sustituir por alguien inválido.
- Protección básica de faltas: filas por periodo; contrasta recambio y tolerancia. El librillo completo llegará en MOTOR-08.

Selecciona por utilidad pertinente y desempata por ID estable. Respeta cinco jugadores distintos; un candidato no ocupa dos slots. Si una necesidad obliga a reorganizar funciones, conserva su asignación explícita. No añadas jugadores ficticios para completar el quinteto.

Esta regla permite que un referente con energía 30 siga siendo más útil que su recambio. Histéresis, tiempos mínimos y condiciones impiden entradas/salidas continuas. El entrenador inicial no cambia de plan ni llama tiempos muertos estratégicos por intuición; esas políticas se amplían después.

## 8. Acta, registro y diagnóstico desde el inicio

### 8.1. Una sola verdad deportiva

El acta se proyecta de hechos identificados. No la actualices además desde el texto del relato ni mantengas un contador paralelo que pueda separarse de los acontecimientos.

Puntos individuales, de equipo y de periodo concilian. Un intento válido se cuenta una vez. Un rebote no aparece por defecto en todo fallo. Una pérdida y su recuperación se relacionan cuando el hecho lo justifica.

Los minutos se atribuyen a presencia efectiva durante el tiempo deportivo real, excluyendo descansos, espera de pantalla y libres con reloj parado. Conserva los tramos de quinteto para sus métricas futuras. En un partido normal, la suma por equipo concilia con cinco presencias por duración disputada.

Cada F se vincula a su acción de tiro y serie causal. Un rebote ofensivo y nuevo tiro abren otra F dentro de la misma posesión. Bonus sin tiro se mantiene como sanción fuera de F. La política de atribución completa se ampliará en MOTOR-09, conservando las relaciones necesarias desde ahora.

### 8.2. Registro mínimo real

Guarda por encuentro:

- Versión del motor, perfil, reglas, datos y esquema de exportación; semilla y algoritmo.
- Copia efectiva de jugadores, planes, roles, estados y parámetros usados.
- IDs estables de partido, periodo, posesión, fase, F y acontecimiento cuando apliquen.
- Secuencia, relojes antes/después, duración, balón y control, participantes y quintetos o tramo.
- Intención y procedencia, ficha/ESP, oposición, cobertura y continuidad pertinentes.
- Capacidades base/efectivas realmente usadas, actor, peso, energía y fila de configuración.
- Opciones efectivamente evaluadas, descartes y motivos; distribución o binaria calculada, sorteo y resultado.
- Faltas, series, reanudaciones, cambios, energía y demás consecuencias con su causa.
- Estado de cobertura y errores o terminación incompleta.

La evaluación de una alternativa no la convierte en una ejecución deportiva realizada. Lo no calculado se marca como tal. El relato explica hechos, sin inventar un pase, desplazamiento o motivo posterior.

La descarga de un encuentro JSON es suficiente aquí. No desarrolles ahora el sistema ZIP de lotes, CSV avanzado ni un sistema de auditorías masivas. El JSON debe poder abrirse y permitir conciliar la salida con los hechos y reproducir la entrada.

## 9. Base técnica mínima y límites

### 9.1. Si ya existe stack aprobado

Intégrate en él, conserva comandos y convenciones y usa las herramientas de comprobación ya acordadas. El núcleo deportivo debe poder ejecutarse sin DOM ni base de datos activa; el laboratorio es su consumidor.

### 9.2. Solo si no existe base técnica aprobada

Esta es la propuesta técnica concreta de ChatGPT para arrancar este hito sin añadir una fase de infraestructura:

- JavaScript modular ESM y HTML/CSS estándar.
- Node.js 24 LTS para servidor estático local y comprobaciones; sin dependencias externas de ejecución.
- `node:http` para servir la aplicación; `node:test` y `node:assert/strict` para las comprobaciones necesarias.
- Una entrada de laboratorio y un comando `npm run dev` que la abra o sirva claramente; documenta URL y puerto reales.
- `package.json`, lockfile y versión de Node declarados si se inicializa este arranque. No añadas una base de datos, autenticación, Docker, despliegue ni un framework por iniciativa propia.

Referencias oficiales de esta propuesta: https://nodejs.org/en/blog/release ; https://nodejs.org/docs/latest-v24.x/api/http.html ; https://nodejs.org/docs/latest-v24.x/api/test.html

Si la documentación vigente ya exige otra base, no apliques este fallback ni migres para usarlo. Registra qué base se ha seguido. Una contradicción técnica de proyecto se expone; no se mantiene una segunda aplicación oculta.

### 9.3. Organización de código

Separa núcleo puro, datos, proyecciones/acta y presentación del laboratorio. Usa pocas unidades comprensibles; nada de una clase por jugada, un servicio por atributo o una plataforma genérica para futuros deportes.

En un arranque vacío puedes usar `src/match/`, `src/lab/`, `data/match/`, `data/fixtures/`, `scripts/` y `tests/`. Si ya existe una organización aprobada equivalente, respétala y registra las rutas efectivas.

Los coeficientes deportivos viven en los datos del anexo A. Los literales técnicos —índices de arrays, nombres de campos o control de errores— no necesitan ser parámetros deportivos. Una fila requerida ausente no se completa con un número escondido dentro de una función.

Los límites técnicos de acontecimientos/prórrogas son protección frente a bugs. Si se alcanzan, devuelve fallo identificado con registro parcial; no fuerces un ganador, un tiro o un final deportivo para pasar el guard.

## 10. Comprobaciones automáticas necesarias

Reutiliza las herramientas y pruebas existentes cuando corresponda. No lances lotes grandes, pruebas combinatorias de todos los atributos/fichas ni una batería E2E como condición de esta entrega.

Organiza unas pocas comprobaciones significativas, sin objetivos de cantidad o cobertura:

1. **Datos:** JSON/CSV legibles, 32 capacidades por ficha, 144 IDs únicos y doce plazas por equipo, rangos, pesos/sumas y referencias de los dos escenarios activos. El validador rechaza entradas mal formadas sin inventar campos.
2. **Partidos completos:** utiliza las semillas 20261016, 20261017 y 20261018 sobre el escenario base. Comprueba marcador/acta, parciales, intentos, minutos, disponibilidad, relojes, control y referencias. Repite la primera entrada para verificar reproducibilidad y ejecuta esa misma una vez sin la presentación/diagnóstico visual para comprobar independencia. Esto son cinco ejecuciones, no cientos ni un requisito de marcador prefijado.
3. **Reglas compartidas críticas:** pocos casos controlados para una serie ligada a falta, exclusión y sustitución legal, continuidad de rebote ofensivo con reloj, y un hecho impedido por bocina. Son comprobaciones de reglas reutilizables, no una prueba aislada como demostración principal del motor.

Las invariantes pueden ejecutarse después de cada acontecimiento en modo de comprobación. Es una validación de transiciones existentes, no otro simulador temporal.

No pruebes que cada semilla deba ganar, que +5 garantice más puntos o que un marcador caiga en una banda. Los intervalos del funcional son referencias de revisión, no una orden de corregir resultados con el azar.

Si un fallo necesita más comprobaciones, añádelas con una razón concreta. Después de pasar las pertinentes, continúa hacia la entrega. Informa de comandos reales, resultados y límites; no marques pruebas no ejecutadas como correctas.

## 11. Recorrido manual para Dennis

Crea una lista corta con pasos, resultado esperado y espacio para resultado real:

| Caso | Qué debe poder comprobar Dennis |
|---|---|
| Arranque limpio | Un comando y una URL reales permiten llegar al laboratorio y ver dos equipos de doce jugadores. |
| Ficha y edición | Hay 32 capacidades agrupadas; +1/+3/+5 afectan exactamente a la selección y respetan límites; restaurar recupera los datos iniciales. |
| Partido completo | Una semilla conocida produce periodos, marcador final, acta y una secuencia de posesiones con los mismos jugadores reales. |
| Libro y estilo | Se pueden cambiar prioridades compartidas y orientación interior/exterior; se observan y revisan las elecciones producidas. Un único partido no se presenta como demostración estadística. |
| Atributo pertinente | Cambiar Pase de un director puede investigarse en sus tareas, entradas y probabilidades; no se exige ganar ese partido concreto. |
| Energía y relevo | El desgaste existe, los suplentes participan cuando corresponde y las sustituciones ocurren en ventanas legales. |
| Repetición y descarga | Repetir la entrada congelada mantiene el partido; el JSON contiene los valores realmente utilizados y concilia con el acta. |

Recorre tú el camino básico en navegador cuando esté disponible. Dennis hará una parte importante de las pruebas manuales y la aceptación final. Si no puedes abrir navegador, identifica esa limitación y entrega los pasos sin afirmar que los recorriste.

La versión debe resultar legible y utilizable en ordenador: agrupación clara, etiquetas españolas, scroll de tablas y estados de error comprensibles. No hace falta un rediseño visual completo ni añadir pantallas del manager.

## 12. Orden de ejecución y disciplina de entrega

1. Inspecciona el repositorio, identifica versión base e inputs y crea/continúa la rama `feature/MOTOR-01-primer-partido-completo` de forma segura.
2. Archiva este prompt exacto, incluidos sus anexos, en `docs/prompts/MOTOR-01-primer-partido-completo.md` y registra su ejecución con estado real.
3. Extrae programáticamente los anexos a `data/match/motor01-seed-profile.json` y `data/fixtures/reference-players-MOTOR01.csv`, o a las rutas equivalentes del proyecto documentadas. Conserva su identidad y estado SEM. No transcribas manualmente las 4.608 notas ni vuelques todo el CSV en terminal.
4. Valida datos e implementa el arranque mínimo que falte.
5. Construye el recorrido integrado hasta terminar un partido, conectando selección, oposición, capacidad, tiempo, consecuencias, acta y registro. Usa incrementos internos ejecutables sobre encuentros completos.
6. Completa edición, preparación, relato, diagnóstico y descarga. Muestra con precisión la cobertura inicial y lo pendiente.
7. Ejecuta las comprobaciones necesarias y recorre la interfaz. Corrige lo que impida el objetivo.
8. Actualiza documentación afectada, mapa técnico, estado, catálogo de prompts y changelog. Conserva el diseño íntegro y sus enlaces; no reescribas los ocho documentos.
9. Entrega commits coherentes y PR sin fusionar. Si el entorno no permite abrirla, deja el trabajo preparado e informa del impedimento concreto.

El alcance es grande y delimitado. La referencia de consumo es hasta aproximadamente el 50 % de la ventana de cinco horas, sin prometer un porcentaje que no puedas medir. Si el indicador está disponible, registra inicio y final con su contexto. No añadas trabajo para consumir cuota ni abandones una modificación a medias para coincidir con el contador.

Si una limitación de sesión impide terminar, guarda un checkpoint útil: commit/rama, último estado ejecutable, pruebas realmente pasadas, bloqueo y siguiente paso exacto. No declares completado MOTOR-01 ni empieces MOTOR-02 por tu cuenta.

## 13. Criterios de cierre y respuesta final

- [ ] Hay un recorrido real desde el laboratorio hasta el final de un partido por acontecimientos.
- [ ] Dos equipos de doce jugadores editables, sus 32 capacidades y +1/+3/+5 funcionan según el ámbito definido.
- [ ] El repertorio inicial conecta libro, director, participantes, defensa y capacidades propias.
- [ ] Estilos activos y datos SEM tienen efecto comprobable en las operaciones, sin controles ficticios.
- [ ] Relojes, faltas, libres, rebotes, periodos, prórroga y sustitución básica producen consecuencias coherentes.
- [ ] Energía/minutos se actualizan por tiempo real; no hay simulación por ticks ni resultados repartidos a posteriori.
- [ ] Acta básica, marcador y registros concilian; las métricas pendientes no aparentan estar implementadas.
- [ ] Se conserva entrada/perfil/semilla/versiones y un JSON completo de los registros capturados del encuentro.
- [ ] La misma entrada reproduce el partido; presentación y diagnóstico no consumen azar deportivo.
- [ ] Las comprobaciones acotadas y recorrido de interfaz están hechos o sus límites quedan identificados.
- [ ] Cobertura inicial, coeficientes provisionales y faltantes del perfil final de 81 grupos están declarados, sin afirmar calibración ni cierre global.
- [ ] Prompt exacto, materiales, documentación, estado y changelog quedan en Git, con PR sin fusionar y revisión de Dennis pendiente.

Tu respuesta final será breve y concreta: qué puede probar Dennis, cómo arrancar, semilla y un encuentro de referencia, comprobaciones realizadas, rendimiento medido si existe, rutas/PR/commits y limitaciones. Incluye enlaces al plan manual y al registro de la entrega. No sustituyas el resultado por un número de tests o líneas de código.

## Anexo A — Perfil explícito de desarrollo

Extrae el siguiente bloque JSON. Los nombres de archivos del contrato se ajustan solo si la organización ya aprobada lo exige, manteniendo los enlaces y significado. `attributeOrder` es también el orden de las columnas de capacidad del CSV; el CSV lleva cabecera para evitar depender de una posición implícita.

<!-- MOTOR01_SEED_JSON -->

```json
{"id":"SEM-MOTOR01-20261016","status":"SEM: provisional, no calibrado","scope":"Perfil de desarrollo completo para los comportamientos activos de MOTOR-01; no certifica cierre de los 81 grupos finales.","provenance":{"author":"ChatGPT","date":"2026-10-16","source":"Funcional unificado v1.0, capítulos 3, 7-14, 18-20, 24-29","sourceSha256":"df05edda480c7da556ba6a24009bedcd0a7f96c25e54f57c983951e63fc01fdd","newSeeds":"Pesos y referencias que faltaban en CARGA se explicitan aquí como SEM, para revisión de Dennis; no son datos reales ni frecuencias calibradas."},"attributeOrder":["TEC01","TEC02","TEC03","TEC04","TEC05","TEC06","TEC07","TEC08","TEC09","TEC10","TEC11","TEC12","TEC13","TEC14","TEC15","TEC16","TEC17","TEC18","FIS01","FIS02","FIS03","FIS04","FIS05","FIS06","FIS07","MEN01","MEN02","MEN03","MEN04","MEN05","MEN06","MEN07"],"attributeDictionary":[{"id":"TEC01","label":"Triple"},{"id":"TEC02","label":"Tiro de media distancia"},{"id":"TEC03","label":"Tiro interior"},{"id":"TEC04","label":"Finalización en movimiento"},{"id":"TEC05","label":"Tiro libre"},{"id":"TEC06","label":"Tiro en movimiento"},{"id":"TEC07","label":"Manejo de balón"},{"id":"TEC08","label":"Pase"},{"id":"TEC09","label":"Bloqueos"},{"id":"TEC10","label":"Movimiento sin balón"},{"id":"TEC11","label":"Juego de poste"},{"id":"TEC12","label":"Defensa perimetral"},{"id":"TEC13","label":"Defensa interior"},{"id":"TEC14","label":"Robo"},{"id":"TEC15","label":"Tapón"},{"id":"TEC16","label":"Defensa de bloqueos"},{"id":"TEC17","label":"Cierre de rebote"},{"id":"TEC18","label":"Captura de rebote"},{"id":"FIS01","label":"Velocidad"},{"id":"FIS02","label":"Aceleración"},{"id":"FIS03","label":"Agilidad"},{"id":"FIS04","label":"Fuerza"},{"id":"FIS05","label":"Salto"},{"id":"FIS06","label":"Resistencia"},{"id":"FIS07","label":"Equilibrio"},{"id":"MEN01","label":"Comprensión táctica"},{"id":"MEN02","label":"Visión de juego"},{"id":"MEN03","label":"Decisiones"},{"id":"MEN04","label":"Anticipación"},{"id":"MEN05","label":"Concentración"},{"id":"MEN06","label":"Consistencia"},{"id":"MEN07","label":"Rendimiento bajo presión"}],"abilityBounds":[1,30],"neutralAbility":16,"rng":{"algorithm":"xorshift32","defaultSeed":20261016,"zeroSeedReplacement":1831565813,"outputDivisor":4294967296},"activeCatalog":{"dispositions":["DIS02"],"defenses":["ORG01"],"coverage":["COB01"],"plays":["POS01","POS05","POS07","POS09","POS11","POS14"],"continuations":["CONT01","CONT04","CONT05","CONT08","CONT09"],"spontaneous":["ESP01","ESP02","ESP06","ESP12","ESP13","ESP15","ESP16","ESP17"],"stylesEditable":["organizedPace","finishPreference","freedom"]},"selection":{"priorityWeights":[8,5,3,2,1],"freedom":[0.05,0.2,0.4,0.65,0.85],"initiativeMix":[0.25,0.75],"readingMix":{"MEN02":0.55,"MEN03":0.45},"abilityFit":{"slope":0.035,"min":0.35,"max":1.5},"roleEligibilityMinimumAbility":null,"candidateRead":{"opponentAbilityEstimate":16,"expectedTurnoverCostPoints":0.6,"minimumUtility":0.05},"direct":{"attemptAfterLiveSteal":0.6,"attemptAfterDefensiveRebound":0.35,"unopposedChanceAfterSteal":0.55,"unopposedChanceAfterRebound":0.25,"acceptanceFloor":0.1},"orientationThree":[0.55,0.8,1,1.3,1.65],"orientationInside":[1.45,1.2,1,0.85,0.65],"organizedDurationFactor":[1.2,1.1,1,0.9,0.8]},"opportunity":{"advantageSensitivity":0.06,"qualityBase":{"comfortable":0.25,"normal":0.55,"forced":0.2},"qualityShotLogit":{"comfortable":0.45,"normal":0,"forced":-0.55},"helpProbability":0.4,"helpDifferenceSensitivity":0.06,"helperQualityLogit":-0.1,"maximumQualityContextLogit":0.35,"coverageContainment":{"handlerPullupQualityLogit":0.08,"rollerQualityLogit":-0.08},"helpExecutionP0":0.5},"outcomes":{"base":{"turnover":0.12,"defensiveNonShootingFoul":0.065,"shootingFoul":0.09,"fieldShot":0.675,"looseBall":0.025,"offensiveFoul":0.015,"ballViolation":0.01},"controlSensitivity":0.045,"defensiveFoulSensitivity":0.035,"offensiveFoulSensitivity":0.035,"stealGivenTurnover":0.6,"turnoverOutOfBoundsIfNotSteal":0.3,"looseControlSensitivity":0.1,"shootingContactLogit":-0.25},"tasks":{"TAR01":{"attack":[["director","MEN01",0.7],["director","MEN05",0.3]],"defense":[],"maxEnergyPenalty":3},"TAR02":{"attack":[["handler","TEC07",0.55],["handler","FIS02",0.25],["handler","FIS03",0.2]],"defense":[["primary","TEC12",0.55],["primary","FIS03",0.25],["primary","FIS02",0.2]],"maxEnergyPenalty":8},"TAR03":{"attack":[["receiver","TEC10",0.6],["receiver","FIS02",0.2],["receiver","FIS03",0.2]],"defense":[["receiverMarker","TEC12",0.55],["receiverMarker","FIS03",0.25],["receiverMarker","MEN04",0.2]],"maxEnergyPenalty":8},"TAR04":{"attack":[["screener","TEC09",0.65],["screener","FIS04",0.25],["screener","MEN01",0.1]],"defense":[["primary","TEC16",0.65],["primary","FIS03",0.2],["primary","MEN04",0.15]],"maxEnergyPenalty":6},"TAR05":{"attack":[["post","TEC11",0.6],["post","FIS04",0.25],["post","FIS07",0.15]],"defense":[["postMarker","TEC13",0.65],["postMarker","FIS04",0.25],["postMarker","MEN04",0.1]],"maxEnergyPenalty":6},"TAR06":{"attack":[["handler","TEC07",0.7],["handler","FIS07",0.15],["handler","MEN05",0.15]],"defense":[["primary","TEC14",0.4],["primary","TEC12",0.3],["primary","MEN04",0.2],["primary","FIS03",0.1]],"maxEnergyPenalty":4},"TAR07":{"attack":[["passer","TEC08",0.8],["passer","MEN05",0.2]],"defense":[["interceptor","TEC14",0.5],["interceptor","MEN04",0.3],["interceptor","FIS03",0.2]],"maxEnergyPenalty":3},"TAR09":{"attack":[["helper","TEC13",0.4],["helper","TEC12",0.3],["helper","FIS02",0.2],["helper","MEN04",0.1]],"defense":[["receiver","TEC10",0.6],["receiver","FIS02",0.25],["receiver","MEN04",0.15]],"maxEnergyPenalty":7},"TAR11":{"attack":[["shooter","TEC06",0.8],["shooter","FIS07",0.2]],"defense":[],"maxEnergyPenalty":3},"TAR17":{"attack":[["contender","FIS02",0.4],["contender","FIS03",0.25],["contender","MEN04",0.2],["contender","TEC07",0.15]],"defense":[],"maxEnergyPenalty":7}},"plays":[{"id":"POS01","family":"pick_and_roll","roles":["handler","screener"],"continuations":["CONT01","CONT04","CONT05","CONT08","CONT09"],"qualityAttack":[["handler","TEC07",0.4],["screener","TEC09",0.3],["handler","FIS02",0.15],["director","MEN01",0.15]],"qualityDefense":[["primary","TEC16",0.4],["primary","TEC12",0.3],["screenMarker","TEC13",0.2],["primary","MEN04",0.1]],"shotWeights":{"rim":45,"inside":10,"midrange":10,"three":35}},{"id":"POS05","family":"handoff","roles":["hub","receiver"],"continuations":["CONT04","CONT05","CONT08","CONT09"],"qualityAttack":[["hub","TEC08",0.3],["receiver","TEC07",0.3],["receiver","TEC10",0.2],["receiver","MEN01",0.2]],"qualityDefense":[["receiverMarker","TEC12",0.4],["receiverMarker","TEC16",0.35],["receiverMarker","MEN04",0.25]],"shotWeights":{"rim":25,"inside":5,"midrange":10,"three":60}},{"id":"POS07","family":"off_ball_screen","roles":["receiver","screener"],"continuations":["CONT05","CONT08","CONT09"],"qualityAttack":[["receiver","TEC10",0.45],["screener","TEC09",0.3],["receiver","MEN01",0.15],["receiver","FIS03",0.1]],"qualityDefense":[["receiverMarker","TEC16",0.55],["receiverMarker","TEC12",0.25],["receiverMarker","MEN04",0.2]],"shotWeights":{"rim":10,"inside":5,"midrange":10,"three":75}},{"id":"POS09","family":"give_and_go","roles":["passer","receiver","cutter"],"continuations":["CONT05","CONT08","CONT09"],"qualityAttack":[["cutter","TEC10",0.45],["passer","TEC08",0.3],["cutter","MEN04",0.15],["cutter","FIS02",0.1]],"qualityDefense":[["cutterMarker","TEC12",0.45],["cutterMarker","MEN04",0.35],["cutterMarker","MEN01",0.2]],"shotWeights":{"rim":60,"inside":10,"midrange":5,"three":25}},{"id":"POS11","family":"post","roles":["passer","post"],"continuations":["CONT04","CONT05","CONT08","CONT09"],"qualityAttack":[["post","TEC11",0.55],["post","FIS04",0.25],["post","MEN01",0.1],["post","FIS07",0.1]],"qualityDefense":[["postMarker","TEC13",0.65],["postMarker","FIS04",0.25],["postMarker","MEN04",0.1]],"shotWeights":{"rim":20,"inside":55,"midrange":15,"three":10}},{"id":"POS14","family":"isolation","roles":["handler"],"continuations":["CONT04","CONT05","CONT08","CONT09"],"qualityAttack":[["handler","TEC07",0.6],["handler","FIS02",0.25],["handler","FIS03",0.15]],"qualityDefense":[["primary","TEC12",0.55],["primary","FIS03",0.3],["primary","MEN04",0.15]],"shotWeights":{"rim":40,"inside":15,"midrange":15,"three":30}}],"shots":{"three":{"points":3,"p0":0.35,"attack":{"TEC01":0.9,"FIS07":0.1},"defense":{"TEC12":1},"sA":0.07,"sD":0.035,"blockP0":0.008,"ordinaryMissContactsRing":true},"midrange":{"points":2,"p0":0.39,"attack":{"TEC02":0.9,"FIS07":0.1},"defense":{"TEC12":1},"sA":0.07,"sD":0.035,"blockP0":0.015,"ordinaryMissContactsRing":true},"inside":{"points":2,"p0":0.56,"attack":{"TEC03":0.85,"FIS07":0.15},"defense":{"TEC13":0.8,"FIS04":0.2},"sA":0.065,"sD":0.04,"blockP0":0.05,"ordinaryMissContactsRing":true},"rim":{"points":2,"p0":0.64,"attack":{"TEC04":0.8,"FIS07":0.15,"FIS05":0.05},"defense":{"TEC13":0.8,"FIS04":0.2},"sA":0.065,"sD":0.04,"blockP0":0.06,"ordinaryMissContactsRing":true},"freeThrow":{"points":1,"p0":0.75,"attack":{"TEC05":0.95,"MEN05":0.05},"defense":{},"sA":0.15,"sD":0,"blockP0":0,"ordinaryMissContactsRing":true}},"shotPreparation":{"movementMaximumLogitCost":0.4,"maxEnergyPenalty":3},"body":{"heightRangeCm":[170,220],"wingspanRangeCm":[170,235],"normalizedMix":[0.5,0.5],"contestAbilitySensitivity":4,"reboundStrengthSensitivity":3,"directWeightEffect":0,"directAgeEffect":0},"block":{"attack":{"TEC15":0.6,"FIS05":0.25,"MEN04":0.15},"resistanceTechniqueWeight":0.75,"resistanceBalanceWeight":0.25,"sA":0.08,"sD":0.04,"outOfBoundsGivenBlock":0.25,"blockedLooseControlDefenseProbability":0.55,"maximumEnergyPenalty":6},"rebound":{"fieldOffensiveP0":0.26,"lastFreeThrowOffensiveP0":0.12,"sensitivity":0.06,"strength":{"TEC18":0.35,"TEC17":0.3,"FIS05":0.15,"FIS04":0.1,"MEN04":0.1},"captor":{"TEC18":0.6,"FIS05":0.25,"MEN04":0.15},"offenseParticipantSlots":["C","PF"],"defenseParticipantSlots":["C","PF","SF"],"addShooterIfNearRim":true,"liveLastFreeThrowOffenseSlots":["C","PF"],"liveLastFreeThrowDefenseSlots":["C","PF","SF"],"maxEnergyPenalty":7,"loadLogitByLevel":[-0.6,-0.3,0,0.3,0.6]},"durationSeconds":{"advance":[1,3,6],"organizedShot":[2,13,19],"organizedFoul":[0.5,5,12],"organizedTurnover":[0.5,4,12],"transition":[0.5,4,7],"continuation":[0.3,3,6],"reorganization":[0.5,6,11],"rebound":[0.1,0.8,1.8],"looseBall":[0.2,1,3],"runningClockInbound":[0.5,1.2,2.5],"urgentShot":[0.1,0.6,1.5]},"energy":{"range":[0,100],"costPerLiveMinute":2,"baseEnduranceReference":16,"enduranceSlope":0.02,"enduranceFactorBounds":[0.7,1.3],"benchRecoveryPerLiveMinute":1.5,"quarterRecovery":4,"halftimeRecovery":10,"overtimeIntervalRecovery":4,"severityNodes":[[0,1],[10,0.65],[30,0.3],[50,0.1],[70,0.01],[100,0]],"load":{"organized":1,"transition":1.2,"continuation":1.05,"rebound":1.15},"loadBounds":[0.85,1.35],"defaultPhysicalTaskMax":8,"defaultTechnicalTaskMax":3,"freeThrowTaskMax":1},"rotation":{"reviewEnergy":45,"benchReadyEnergy":65,"minimumStintSeconds":360,"minimumBenchSeconds":120,"maximumNormalStintSeconds":480,"replacementUtilityTolerance":1,"longStintTolerance":1.5,"criticalEnergy":10,"criticalReplacementTolerance":3,"foulProtection":[{"period":1,"fouls":2},{"period":2,"fouls":3},{"period":3,"fouls":4}],"foulProtectionTolerance":4,"slotAbilityWeights":{"PG":{"TEC07":0.3,"TEC08":0.3,"MEN02":0.2,"MEN03":0.2},"SG":{"TEC01":0.4,"TEC02":0.2,"TEC06":0.2,"TEC12":0.2},"SF":{"TEC10":0.3,"TEC12":0.3,"TEC08":0.2,"TEC01":0.2},"PF":{"TEC09":0.3,"TEC13":0.3,"TEC18":0.2,"TEC03":0.2},"C":{"TEC13":0.3,"TEC18":0.3,"TEC09":0.2,"TEC03":0.2}},"utilityMaxEnergyPenalty":5},"rules":{"profile":"FIBA-2026-v1.1","quarters":4,"quarterSeconds":600,"overtimeSeconds":300,"shotClockSeconds":24,"frontcourtResetSeconds":14,"backcourtSeconds":8,"foulOut":5,"teamPenaltyAfterFouls":4,"freeThrowsForOrdinaryBonus":2,"stopClockAfterGoalFinalSeconds":120,"overtimeFoulsCarryFromPeriod":4,"technicalGuardMaxEvents":10000,"technicalGuardMaxOvertimes":20},"scenario":{"teamIds":["EQ01","EQ02"],"seed":20261016,"plans":[{"teamId":"EQ01","disposition":"DIS02","defense":"ORG01","coverage":"COB01","pressureHeight":"normal","styles":{"organizedPace":3,"finishPreference":3,"freedom":3,"transition":3,"elaboration":3,"offensiveRisk":3,"afterShot":3},"starters":{"PG":"EQ01-J01","SG":"EQ01-J03","SF":"EQ01-J06","PF":"EQ01-J08","C":"EQ01-J10"},"directorPriority":["EQ01-J01","EQ01-J12","EQ01-J06","EQ01-J02"],"playbook":[{"playId":"POS01","priority":1},{"playId":"POS05","priority":2},{"playId":"POS07","priority":2},{"playId":"POS09","priority":3},{"playId":"POS11","priority":2},{"playId":"POS14","priority":4}],"initialTeamMoment":0},{"teamId":"EQ02","disposition":"DIS02","defense":"ORG01","coverage":"COB01","pressureHeight":"normal","styles":{"organizedPace":3,"finishPreference":4,"freedom":3,"transition":3,"elaboration":3,"offensiveRisk":3,"afterShot":3},"starters":{"PG":"EQ02-J01","SG":"EQ02-J04","SF":"EQ02-J05","PF":"EQ02-J08","C":"EQ02-J11"},"directorPriority":["EQ02-J01","EQ02-J12","EQ02-J06","EQ02-J02"],"playbook":[{"playId":"POS01","priority":2},{"playId":"POS05","priority":1},{"playId":"POS07","priority":1},{"playId":"POS09","priority":2},{"playId":"POS11","priority":4},{"playId":"POS14","priority":3}],"initialTeamMoment":0}]},"deferred":["Resto del repertorio y disposiciones","Zonas y otras coberturas","Mecanismos completos de Forma/momento/Consistencia/Presión","Memoria rival","Dirección manual durante partido y otros modos","Panel completo","Política exhaustiva de atribución y estadísticas avanzadas","Generador y lotes","Excepciones reglamentarias no producidas por el subconjunto activo"],"contact":{"defensiveLegality":{"defenseTechnique":0.7,"MEN04":0.2,"MEN05":0.1},"offensiveLegality":{"actionTechnique":0.6,"FIS04":0.25,"FIS07":0.15},"maximumEnergyPenalty":4},"continuation":{"extraPassProbability":0.2,"reorganizeIfDeniedProbability":0.65,"liveLooseBallSameTeamQualityPolicy":"preserve_context_and_resolve_current_opposition"},"participantSlots":{"screener":["C","PF"],"hub":["PF","C"],"receiver":["SG","SF","PF"],"post":["C","PF"],"isolationHandler":["PG","SG","SF"],"additionalHelper":["PF","C","SF"]},"fixtureContract":{"file":"../fixtures/reference-players-MOTOR01.csv","attributeColumns":["TEC01","TEC02","TEC03","TEC04","TEC05","TEC06","TEC07","TEC08","TEC09","TEC10","TEC11","TEC12","TEC13","TEC14","TEC15","TEC16","TEC17","TEC18","FIS01","FIS02","FIS03","FIS04","FIS05","FIS06","FIS07","MEN01","MEN02","MEN03","MEN04","MEN05","MEN06","MEN07"],"zonePreferenceOrder":["rim","midrange","three"],"offensiveRoleDictionary":{"O01":"Alero organizador","O02":"Anotador","O03":"Anotador al poste","O04":"Apoyo exterior","O05":"Bloqueador y continuador","O06":"Cortador","O07":"Creador con balón","O08":"Creador secundario","O09":"Finalizador exterior","O10":"Interior abierto","O11":"Interior pasador","O12":"Organizador","O13":"Penetrador","O14":"Tirador de recepción","O15":"Tirador en movimiento"},"defensiveRoleDictionary":{"D01":"Ayudador de equipo","D02":"Ayudador del aro","D03":"Ayudador perimetral","D04":"Contenedor","D05":"Defensor del poste","D06":"Defensor versátil para cambios","D07":"Interior móvil","D08":"Marcador de una amenaza principal","D09":"Perseguidor","D10":"Perseguidor de tiradores","D11":"Presionador del balón","D12":"Protector del aro"},"initialState":{"energy":100,"form":0,"M_TIR":0,"M_OFE":0,"M_DEF":0,"fouls":0,"available":true},"teamNames":{"EQ01":"Equilibrado","EQ02":"Exterior","EQ03":"Interior","EQ04":"Dos creadores","EQ05":"Director pasador con poca anotación","EQ06":"Anotador dominante con lectura limitada","EQ07":"Veteranos técnicos y menos físicos","EQ08":"Jóvenes atléticos y menor comprensión","EQ09":"Protección interior","EQ10":"Velocidad y presión","EQ11":"Estrella con poco recambio","EQ12":"Plantilla profunda"},"displayName":"Jugador <id>","state":"144 jugadores ficticios propuestos como SEM; solo EQ01/EQ02 son escenarios activos de MOTOR-01."}}
```

## Anexo B — 144 fichas ficticias explícitas

Extrae el CSV siguiente sin modificar sus valores. Las columnas TEC/FIS/MEN corresponden a las 32 capacidades, los códigos de rol se resuelven con el diccionario del anexo A y los estados iniciales comunes están en `fixtureContract.initialState`. El nombre visible es «Jugador <id>». `positions` utiliza `|` para compatibilidades. Los únicos equipos jugables de MOTOR-01 son EQ01/EQ02; los otros diez conjuntos quedan como datos preparados y provisionales para el roadmap, sin declarar ejecutados sus planes ni su evaluación.

No generes estos valores con un algoritmo aleatorio ni reconstruyas jugadores por intuición. Ya están suministrados numéricamente.

<!-- MOTOR01_PLAYERS_CSV -->

```csv
id,age,heightCm,wingspanCm,weightKg,positions,offensiveRoleCode,defensiveRoleCode,initiative,finishingVocation,rimPreference,midrangePreference,threePreference,TEC01,TEC02,TEC03,TEC04,TEC05,TEC06,TEC07,TEC08,TEC09,TEC10,TEC11,TEC12,TEC13,TEC14,TEC15,TEC16,TEC17,TEC18,FIS01,FIS02,FIS03,FIS04,FIS05,FIS06,FIS07,MEN01,MEN02,MEN03,MEN04,MEN05,MEN06,MEN07
EQ01-J01,27,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,24,23,19,22,22,20
EQ01-J02,28,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,15,13,9,11,19,13,18,18,8,15,6,19,7,18,4,17,9,10,20,21,20,10,9,22,17,20,19,19,20,21,21,18
EQ01-J03,29,196,205,94,SG|SF,O02,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,18,18,17,17,17,21
EQ01-J04,30,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ01-J05,31,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,12,14,23,22,22,18,20,22,22,18,19
EQ01-J06,32,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,18,21,12,19,14,18,16,16,10,17,17,16,18,19,19,18,15,20,20,22,22,22,22,22,21,20
EQ01-J07,24,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,23,20,18,13,22,21,18,23,24,25,20,24,25,23,21,17,21,24,22,19,19
EQ01-J08,25,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,15,18,10,17,14,17,22,16,16,16,20,18,21,19,20,16,19,18,19,18,18
EQ01-J09,26,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,21,12,21,13,24,23,13,13,13,23,17,21,21,24,24,24,23,22,21,21
EQ01-J10,27,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ01-J11,28,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ01-J12,29,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,20,20,9,17,8,15,15,14,5,14,9,11,18,20,18,12,12,20,18,20,20,19,18,19,18,18
EQ02-J01,29,188,196,82,PG,O12,D04,0.55,0.4,0.15,0.15,0.7,15,14,7,10,20,14,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,9,8,21,18,23,24,23,19,22,22,20
EQ02-J02,30,190,199,85,PG|SG,O04,D11,0.35,0.35,0.15,0.15,0.7,17,13,7,9,19,15,18,18,8,15,6,19,7,18,4,17,9,10,20,21,20,8,9,22,17,20,19,19,20,21,21,18
EQ02-J03,31,196,205,94,SG|SF,O02,D08,0.75,0.85,0.15,0.15,0.7,24,21,12,19,23,22,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,13,17,20,21,19,18,18,17,17,17,21
EQ02-J04,32,193,200,87,SG,O14,D10,0.3,0.8,0.15,0.15,0.7,28,18,8,11,24,18,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,8,10,18,19,19,17,21,19,19,20,18
EQ02-J05,24,195,202,89,SG|SF,O15,D09,0.45,0.8,0.15,0.15,0.7,25,20,8,12,22,27,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,10,14,23,22,22,18,20,22,22,18,19
EQ02-J06,25,201,211,99,SF,O01,D01,0.55,0.45,0.15,0.15,0.7,19,16,12,15,18,17,18,21,12,19,14,18,16,16,10,17,17,16,18,19,19,16,15,20,20,22,22,22,22,22,21,20
EQ02-J07,26,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,14,21,16,14,12,14,16,25,12,23,20,18,13,22,21,18,23,24,25,18,24,25,23,21,17,21,24,22,19,19
EQ02-J08,27,208,220,107,PF,O10,D07,0.45,0.65,0.15,0.15,0.7,27,18,14,14,21,21,12,16,20,19,15,15,18,10,17,14,17,22,16,16,16,18,18,21,19,20,16,19,18,19,18,18
EQ02-J09,28,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,21,12,21,13,24,23,13,13,13,23,17,21,21,24,24,24,23,22,21,21
EQ02-J10,29,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ02-J11,30,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ02-J12,31,191,199,85,PG|SG,O09,D03,0.6,0.55,0.15,0.15,0.7,18,15,11,16,19,17,20,20,9,17,8,15,15,14,5,14,9,11,18,20,18,12,12,20,18,20,20,19,18,19,18,18
EQ03-J01,31,188,196,82,PG,O12,D04,0.55,0.4,0.4,0.2,0.4,10,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,24,23,19,22,22,20
EQ03-J02,32,190,199,85,PG|SG,O04,D11,0.35,0.35,0.4,0.2,0.4,12,13,9,11,19,13,18,18,8,15,6,19,7,18,4,17,9,10,20,21,20,10,9,22,17,20,19,19,20,21,21,18
EQ03-J03,24,196,205,94,SG|SF,O02,D08,0.75,0.85,0.4,0.2,0.4,19,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,18,18,17,17,17,21
EQ03-J04,25,193,200,87,SG,O14,D10,0.3,0.8,0.4,0.2,0.4,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ03-J05,26,195,202,89,SG|SF,O15,D09,0.45,0.8,0.4,0.2,0.4,19,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,12,14,23,22,22,18,20,22,22,18,19
EQ03-J06,27,201,211,99,SF,O01,D01,0.55,0.45,0.4,0.2,0.4,14,16,14,17,18,15,18,21,12,19,14,18,16,16,10,17,17,16,18,19,19,18,15,20,20,22,22,22,22,22,21,20
EQ03-J07,28,203,214,101,SF|PF,O06,D06,0.4,0.55,0.4,0.2,0.4,10,12,16,23,16,14,12,14,16,25,12,23,20,18,13,22,21,18,23,24,25,20,24,25,23,21,17,21,24,22,19,19
EQ03-J08,29,208,220,107,PF,O10,D07,0.45,0.65,0.65,0.2,0.15,21,18,18,18,21,19,12,16,20,19,17,15,18,10,17,14,17,22,16,16,16,22,18,21,19,20,16,19,18,19,18,18
EQ03-J09,30,210,222,111,PF|C,O11,D02,0.45,0.35,0.65,0.2,0.15,13,17,20,18,19,12,13,23,19,16,22,13,21,12,21,13,24,23,13,13,13,25,17,21,21,24,24,24,23,22,21,21
EQ03-J10,31,213,225,116,C,O05,D05,0.25,0.6,0.65,0.2,0.15,1,8,22,27,12,8,8,12,26,18,19,10,25,10,23,15,26,26,14,15,14,29,24,24,25,22,14,19,23,23,21,18
EQ03-J11,32,216,230,120,C,O03,D12,0.45,0.75,0.65,0.2,0.15,4,14,28,24,17,10,11,16,23,14,29,8,27,9,26,12,27,28,10,11,10,30,22,21,26,25,20,23,25,24,22,24
EQ03-J12,24,191,199,85,PG|SG,O08,D03,0.6,0.55,0.65,0.2,0.15,13,15,13,18,19,15,20,20,9,17,10,15,15,14,5,14,9,11,18,20,18,14,12,20,18,20,20,19,18,19,18,18
EQ04-J01,24,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,24,26,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,26,25,19,22,22,20
EQ04-J02,25,190,199,85,PG|SG,O07,D04,0.35,0.35,0.3,0.2,0.5,18,16,9,11,19,13,20,20,8,15,6,19,7,18,4,17,9,10,20,21,20,10,9,22,17,20,21,21,20,21,21,18
EQ04-J03,26,196,205,94,SG|SF,O02,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,18,18,17,17,17,21
EQ04-J04,27,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ04-J05,28,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,12,14,23,22,22,18,20,22,22,18,19
EQ04-J06,29,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,20,23,12,19,14,18,16,16,10,17,17,16,18,19,19,18,15,20,20,22,24,24,22,22,21,20
EQ04-J07,30,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,23,20,18,13,22,21,18,23,24,25,20,24,25,23,21,17,21,24,22,19,19
EQ04-J08,31,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,15,18,10,17,14,17,22,16,16,16,20,18,21,19,20,16,19,18,19,18,18
EQ04-J09,32,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,21,12,21,13,24,23,13,13,13,23,17,21,21,24,24,24,23,22,21,21
EQ04-J10,24,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ04-J11,25,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ04-J12,26,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,22,22,9,17,8,15,15,14,5,14,9,11,18,20,18,12,12,20,18,20,22,21,18,19,18,18
EQ05-J01,26,188,196,82,PG,O12,D04,0.55,0.2,0.3,0.2,0.5,8,9,4,7,20,12,22,28,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,27,28,27,19,22,22,20
EQ05-J02,27,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,15,13,9,11,19,13,18,18,8,15,6,19,7,18,4,17,9,10,20,21,20,10,9,22,17,20,19,19,20,21,21,18
EQ05-J03,28,196,205,94,SG|SF,O02,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,18,18,17,17,17,21
EQ05-J04,29,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ05-J05,30,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,12,14,23,22,22,18,20,22,22,18,19
EQ05-J06,31,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,18,21,12,19,14,18,16,16,10,17,17,16,18,19,19,18,15,20,20,22,22,22,22,22,21,20
EQ05-J07,32,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,23,20,18,13,22,21,18,23,24,25,20,24,25,23,21,17,21,24,22,19,19
EQ05-J08,24,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,15,18,10,17,14,17,22,16,16,16,20,18,21,19,20,16,19,18,19,18,18
EQ05-J09,25,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,21,12,21,13,24,23,13,13,13,23,17,21,21,24,24,24,23,22,21,21
EQ05-J10,26,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ05-J11,27,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ05-J12,28,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,20,20,9,17,8,15,15,14,5,14,9,11,18,20,18,12,12,20,18,20,20,19,18,19,18,18
EQ06-J01,28,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,24,23,19,22,22,20
EQ06-J02,29,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,15,13,9,11,19,13,18,18,8,15,6,19,7,18,4,17,9,10,20,21,20,10,9,22,17,20,19,19,20,21,21,18
EQ06-J03,30,196,205,94,SG|SF,O02,D08,0.95,0.95,0.3,0.2,0.5,26,25,14,25,23,24,26,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,12,11,17,17,17,21
EQ06-J04,31,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ06-J05,32,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,12,14,23,22,22,18,20,22,22,18,19
EQ06-J06,24,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,18,21,12,19,14,18,16,16,10,17,17,16,18,19,19,18,15,20,20,22,22,22,22,22,21,20
EQ06-J07,25,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,23,20,18,13,22,21,18,23,24,25,20,24,25,23,21,17,21,24,22,19,19
EQ06-J08,26,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,15,18,10,17,14,17,22,16,16,16,20,18,21,19,20,16,19,18,19,18,18
EQ06-J09,27,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,21,12,21,13,24,23,13,13,13,23,17,21,21,24,24,24,23,22,21,21
EQ06-J10,28,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ06-J11,29,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ06-J12,30,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,20,20,9,17,8,15,15,14,5,14,9,11,18,20,18,12,12,20,18,20,20,19,18,19,18,18
EQ07-J01,37,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,12,14,13,11,2,18,18,27,28,27,23,26,22,20
EQ07-J02,38,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,15,13,9,11,19,13,18,18,8,15,6,19,7,18,4,17,9,10,14,15,14,10,3,19,17,24,23,23,24,25,21,18
EQ07-J03,39,196,205,94,SG|SF,O02,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,15,17,15,15,11,17,21,23,22,22,21,21,17,21
EQ07-J04,40,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,12,13,14,10,4,15,19,23,21,25,23,23,20,18
EQ07-J05,41,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,15,16,17,12,8,20,22,26,22,24,26,26,18,19
EQ07-J06,36,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,18,21,12,19,14,18,16,16,10,17,17,16,12,13,13,18,9,17,20,26,26,26,26,26,21,20
EQ07-J07,37,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,23,20,18,13,22,21,18,17,18,19,20,18,22,23,25,21,25,28,26,19,19
EQ07-J08,38,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,15,18,10,17,14,17,22,10,10,10,20,12,18,19,24,20,23,22,23,18,18
EQ07-J09,39,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,21,12,21,13,24,23,7,7,7,23,11,18,21,28,28,28,27,26,21,21
EQ07-J10,40,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,8,9,8,27,18,21,25,26,18,23,27,27,21,18
EQ07-J11,41,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,4,5,4,28,16,18,26,29,24,27,29,28,22,24
EQ07-J12,36,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,20,20,9,17,8,15,15,14,5,14,9,11,12,14,12,12,6,17,18,24,24,23,22,23,18,18
EQ08-J01,20,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,11,12,7,12,20,12,22,22,9,16,8,17,8,16,4,15,8,10,21,23,22,11,11,24,18,18,19,18,14,17,22,20
EQ08-J02,21,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,13,11,7,11,19,13,18,16,8,15,6,19,7,18,4,17,9,10,23,24,23,10,12,25,17,15,14,14,15,16,21,18
EQ08-J03,22,196,205,94,SG|SF,O13,D08,0.75,0.85,0.3,0.2,0.5,20,19,12,21,23,20,22,14,9,20,11,16,11,13,7,14,10,12,24,26,24,15,20,23,21,14,13,13,12,12,17,21
EQ08-J04,19,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,23,16,8,13,24,16,12,12,7,21,6,15,8,12,4,14,8,10,21,22,23,10,13,21,19,14,12,16,14,14,20,18
EQ08-J05,20,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,20,18,8,14,22,25,15,13,9,24,7,16,9,11,6,20,9,11,24,25,26,12,17,26,22,17,13,15,17,17,18,19
EQ08-J06,21,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,15,14,12,17,18,15,18,19,12,19,14,18,16,16,10,17,17,16,21,22,22,18,18,23,20,17,17,17,17,17,21,20
EQ08-J07,22,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,11,10,14,23,16,14,12,12,16,25,12,23,20,18,13,22,21,18,26,27,28,20,27,28,23,16,12,16,19,17,19,19
EQ08-J08,19,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,22,16,14,16,21,19,12,14,20,19,15,15,18,10,17,14,17,22,19,19,19,20,21,24,19,15,11,14,13,14,18,18
EQ08-J09,20,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,14,15,16,16,19,12,13,21,19,16,20,13,21,12,21,13,24,23,16,16,16,23,20,24,21,19,19,19,18,17,21,21
EQ08-J10,21,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,2,6,18,25,12,8,8,10,26,18,17,10,25,10,23,15,26,26,17,18,17,27,27,27,25,17,9,14,18,18,21,18
EQ08-J11,22,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,5,12,24,22,17,10,11,14,23,14,27,8,27,9,26,12,27,28,13,14,13,28,25,24,26,20,15,18,20,19,22,24
EQ08-J12,19,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,14,13,9,16,19,15,20,18,9,17,8,15,15,14,5,14,9,11,21,23,21,12,15,23,18,15,15,14,13,14,18,18
EQ09-J01,25,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,24,23,19,22,22,20
EQ09-J02,26,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,15,13,9,11,19,13,18,18,8,15,6,19,7,18,4,17,9,10,20,21,20,10,9,22,17,20,19,19,20,21,21,18
EQ09-J03,27,196,205,94,SG|SF,O02,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,18,18,17,17,17,21
EQ09-J04,28,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ09-J05,29,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,16,9,11,6,20,9,11,21,22,23,12,14,23,22,22,18,20,22,22,18,19
EQ09-J06,30,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,18,21,12,19,14,18,16,16,10,17,17,16,18,19,19,18,15,20,20,22,22,22,22,22,21,20
EQ09-J07,31,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,23,23,18,16,22,24,21,22,23,25,20,24,25,23,21,17,21,24,22,19,19
EQ09-J08,32,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,15,21,10,20,14,20,25,15,15,16,20,18,21,19,20,16,19,18,19,18,18
EQ09-J09,24,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,13,24,12,24,13,27,26,12,12,13,23,17,21,21,24,24,24,23,22,21,21
EQ09-J10,25,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,28,10,26,15,29,29,13,14,14,27,24,24,25,22,14,19,23,23,21,18
EQ09-J11,26,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,30,9,29,12,30,30,9,10,10,28,22,21,26,25,20,23,25,24,22,24
EQ09-J12,27,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,20,20,9,17,8,15,18,14,8,14,12,14,17,19,18,12,12,20,18,20,20,19,18,19,18,18
EQ10-J01,27,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,19,8,18,4,17,8,10,20,22,21,11,8,23,18,23,24,23,19,22,22,20
EQ10-J02,28,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,15,13,9,11,19,13,18,18,8,15,6,21,7,20,4,19,9,10,22,23,22,10,9,24,17,20,19,19,20,21,21,18
EQ10-J03,29,196,205,94,SG|SF,O13,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,18,11,15,7,16,10,12,23,25,23,15,17,22,21,19,18,18,17,17,17,21
EQ10-J04,30,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,17,8,14,4,16,8,10,20,21,22,10,10,20,19,19,17,21,19,19,20,18
EQ10-J05,31,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,22,20,10,14,22,25,15,15,9,24,7,18,9,13,6,22,9,11,23,24,25,12,14,25,22,22,18,20,22,22,18,19
EQ10-J06,32,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,17,16,14,17,18,15,18,21,12,19,14,20,16,18,10,19,17,16,20,21,21,18,15,22,20,22,22,22,22,22,21,20
EQ10-J07,24,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,13,12,16,23,16,14,12,14,16,25,12,25,20,20,13,24,21,18,25,26,27,20,24,27,23,21,17,21,24,22,19,19
EQ10-J08,25,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,24,18,16,16,21,19,12,16,20,19,15,17,18,12,17,16,17,22,18,18,18,20,18,23,19,20,16,19,18,19,18,18
EQ10-J09,26,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,16,17,18,16,19,12,13,23,19,16,20,15,21,14,21,15,24,23,15,15,15,23,17,23,21,24,24,24,23,22,21,21
EQ10-J10,27,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,12,25,12,23,17,26,26,16,17,16,27,24,26,25,22,14,19,23,23,21,18
EQ10-J11,28,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,10,27,11,26,14,27,28,12,13,12,28,22,23,26,25,20,23,25,24,22,24
EQ10-J12,29,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,16,15,11,16,19,15,20,20,9,17,8,17,15,16,5,16,9,11,20,22,20,12,12,22,18,20,20,19,18,19,18,18
EQ11-J01,29,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,24,23,19,22,22,20
EQ11-J02,30,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,12,10,6,8,16,10,15,15,5,12,3,16,4,15,1,14,6,7,17,18,17,7,6,19,14,17,16,16,17,18,18,15
EQ11-J03,31,196,205,94,SG|SF,O02,D08,0.75,0.95,0.3,0.2,0.5,26,25,14,25,23,24,26,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,21,21,17,17,17,21
EQ11-J04,32,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ11-J05,24,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,19,17,7,11,19,22,12,12,6,21,4,13,6,8,3,17,6,8,18,19,20,9,11,20,19,19,15,17,19,19,15,16
EQ11-J06,25,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,14,13,11,14,15,12,15,18,9,16,11,15,13,13,7,14,14,13,15,16,16,15,12,17,17,19,19,19,19,19,18,17
EQ11-J07,26,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,10,9,13,20,13,11,9,11,13,22,9,20,17,15,10,19,18,15,20,21,22,17,21,22,20,18,14,18,21,19,16,16
EQ11-J08,27,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,21,15,13,13,18,16,9,13,17,16,12,12,15,7,14,11,14,19,13,13,13,17,15,18,16,17,13,16,15,16,15,15
EQ11-J09,28,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,13,14,15,13,16,9,10,20,16,13,17,10,18,9,18,10,21,20,10,10,10,20,14,18,18,21,21,21,20,19,18,18
EQ11-J10,29,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ11-J11,30,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ11-J12,31,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,13,12,8,13,16,12,17,17,6,14,5,12,12,11,2,11,6,8,15,17,15,9,9,17,15,17,17,16,15,16,15,15
EQ12-J01,31,188,196,82,PG,O12,D04,0.55,0.4,0.3,0.2,0.5,13,14,9,12,20,12,22,24,9,16,8,17,8,16,4,15,8,10,18,20,19,11,8,21,18,23,24,23,19,22,22,20
EQ12-J02,32,190,199,85,PG|SG,O04,D11,0.35,0.35,0.3,0.2,0.5,17,15,11,13,21,15,20,20,10,17,8,21,9,20,6,19,11,12,20,21,20,10,9,22,17,21,20,20,21,22,22,19
EQ12-J03,24,196,205,94,SG|SF,O02,D08,0.75,0.85,0.3,0.2,0.5,22,21,14,21,23,20,22,16,9,20,11,16,11,13,7,14,10,12,21,23,21,15,17,20,21,19,18,18,17,17,17,21
EQ12-J04,25,193,200,87,SG,O14,D10,0.3,0.8,0.3,0.2,0.5,25,18,10,13,24,16,12,14,7,21,6,15,8,12,4,14,8,10,18,19,20,10,10,18,19,19,17,21,19,19,20,18
EQ12-J05,26,195,202,89,SG|SF,O15,D09,0.45,0.8,0.3,0.2,0.5,24,22,12,16,24,27,17,17,11,26,9,18,11,13,8,22,11,13,21,22,23,12,14,23,22,23,19,21,23,23,19,20
EQ12-J06,27,201,211,99,SF,O01,D01,0.55,0.45,0.3,0.2,0.5,19,18,16,19,20,17,20,23,14,21,16,20,18,18,12,19,19,18,18,19,19,18,15,20,20,23,23,23,23,23,22,21
EQ12-J07,28,203,214,101,SF|PF,O06,D06,0.4,0.55,0.3,0.2,0.5,15,14,18,25,18,16,14,16,18,27,14,25,22,20,15,24,23,20,23,24,25,20,24,25,23,22,18,22,25,23,20,20
EQ12-J08,29,208,220,107,PF,O10,D07,0.45,0.65,0.3,0.2,0.5,26,20,18,18,23,21,14,18,22,21,17,17,20,12,19,16,19,24,16,16,16,20,18,21,19,21,17,20,19,20,19,19
EQ12-J09,30,210,222,111,PF|C,O11,D02,0.45,0.35,0.55,0.15,0.3,18,19,20,18,21,14,15,25,21,18,22,15,23,14,23,15,26,25,13,13,13,23,17,21,21,25,25,25,24,23,22,22
EQ12-J10,31,213,225,116,C,O05,D05,0.25,0.6,0.55,0.15,0.3,4,8,20,25,12,8,8,12,26,18,17,10,25,10,23,15,26,26,14,15,14,27,24,24,25,22,14,19,23,23,21,18
EQ12-J11,32,216,230,120,C,O03,D12,0.45,0.75,0.55,0.15,0.3,7,14,26,22,17,10,11,16,23,14,27,8,27,9,26,12,27,28,10,11,10,28,22,21,26,25,20,23,25,24,22,24
EQ12-J12,24,191,199,85,PG|SG,O08,D03,0.6,0.55,0.55,0.15,0.3,18,17,13,18,21,17,22,22,11,19,10,17,17,16,7,16,11,13,18,20,18,12,12,20,18,21,21,20,19,20,19,19
```

## Identidad de los materiales

El JSON y el CSV anteriores son las entradas explícitas de este prompt. Tras extraerlos, registra su hash y revisión reales en el catálogo de datos, manteniendo etiqueta SEM y diferencias respecto al funcional cuando corresponda. No declares que su aprobación numérica o calibración se deduce de que el archivo sea válido. La ejecución de este encargo conserva su cobertura incremental y la validación de Dennis pendiente.
