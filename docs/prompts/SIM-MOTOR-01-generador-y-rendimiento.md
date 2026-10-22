# SIM-MOTOR-01 · Generador estadístico por tramos y medición de 1.000 partidos

**Destinatario:** Claude Code.  
**Repositorio autorizado:** `bateman37/beM`, exclusivamente.  
**Fecha:** 22 de octubre de 2026.  
**Tipo de encargo:** implementación de la primera de cuatro entregas de SIM-MOTOR.  
**Referencia funcional:** roadmap SIM-MOTOR, versión 2, de cuatro entregas. Este encargo sustituye cualquier planteamiento anterior de ocho entregas.

Implementa un generador que produzca partidos completos mediante distribuciones estadísticas por tramos. Debe entregar estadísticas individuales coherentes, mapas por zona y uso táctico, con un coste muy inferior al motor detallado. La primera entrega termina con una medición real de 1.000 partidos y archivos que ChatGPT pueda revisar.

Las decisiones de producto están fijadas en este documento. Resuelve las decisiones técnicas ordinarias dentro de estos límites; no amplíes el producto ni conviertas el encargo en otro motor de acciones.

## Índice

1. [Resultado y límites](#1-resultado-y-límites)
2. [Base, Git y consulta dirigida](#2-base-git-y-consulta-dirigida)
3. [Dos accesos al laboratorio](#3-dos-accesos-al-laboratorio)
4. [Contratos, identidad y configuración](#4-contratos-identidad-y-configuración)
5. [Modelo de generación](#5-modelo-de-generación)
6. [Capacidades, táctica y estados](#6-capacidades-táctica-y-estados)
7. [Salidas y conciliaciones](#7-salidas-y-conciliaciones)
8. [Interfaz mínima utilizable](#8-interfaz-mínima-utilizable)
9. [Medición real de rendimiento](#9-medición-real-de-rendimiento)
10. [Verificación proporcionada](#10-verificación-proporcionada)
11. [Archivos para ChatGPT](#11-archivos-para-chatgpt)
12. [Documentación y entrega](#12-documentación-y-entrega)
13. [Aceptación y alcance posterior](#13-aceptación-y-alcance-posterior)

## 1. Resultado y límites

### 1.1 Qué estamos construyendo

El motor detallado actual queda congelado como referencia deportiva de MOTOR-18C. SIM-MOTOR es **otro modelo de resolución**, alimentado por los mismos conceptos y datos de jugadores y planes.

| Modelo | Uso previsto en el manager |
| --- | --- |
| Detallado actual | Partidos del equipo sénior dirigido por el usuario. |
| Generador SIM-MOTOR | Resto de partidos, incluida la cantera propia y las demás ligas. |
| Ejecución agrupada del mismo SIM-MOTOR | Países y competiciones en Referencia, conservando estadísticas individuales de temporada. |

No hay un tercer modelo deportivo para Referencia. Abrir un marcador o el análisis de un encuentro generado no lo convierte en un partido del motor detallado.

En el laboratorio seguirá siendo posible probar cualquier plantilla con cualquiera de los dos modelos para compararlos.

### 1.2 Alcance obligatorio de esta entrega

- Selector inicial de laboratorio y acceso inequívoco a cada modelo.
- Generador independiente, ejecutable sin navegador y con interfaz mínima.
- Encuentros completos: periodos, prórrogas, participantes, rotaciones básicas y exclusiones.
- Acta individual y de equipo, quintetos/minutos, tiros por zona, familias tácticas y evolución temporal compacta.
- Capacidades y táctica que intervienen en las distribuciones; correspondencias documentadas.
- Configuración propia, identificada y administrable desde una tabla sencilla del laboratorio.
- Ejecución real de 1.000 partidos con cuatro workers y comparación con un worker.
- Descargas y evidencia verificable para ChatGPT.

**No es suficiente** entregar contratos sin partidos, un marcador aleatorio con estadísticas repartidas después, ni un ejemplo aislado de bloqueo directo.

### 1.3 Restricciones de arquitectura

La unidad de resolución deportiva es un tramo con quintetos y condiciones relativamente estables. Calcula producción conjunta por categorías y después materializa sus registros compatibles.

No llames al resolutor detallado para generar los encuentros SIM. `world-essential` reduce el registro del motor actual: no constituye este nuevo modelo.

No reproduzcas por debajo todas las posesiones, alternativas de pase, ayudas, desplazamientos, continuaciones y decisiones del detallado. No introduzcas simulación por segundos o fotogramas.

Es válido recorrer los tiros o hechos ya generados para asignarles jugadores, créditos e instantes, comprobar elegibilidad y construir el resultado. Esa materialización no debe volver a resolver cada ataque mediante la lógica detallada.

La cantidad de trabajo debe depender principalmente de los tramos, categorías y registros de salida. No de explorar árboles tácticos por cada posesión.

## 2. Base, Git y consulta dirigida

### 2.1 Comprueba la situación real

La última entrega conocida es MOTOR-18C, PR #20, con commits `d66f3a3` y `9614fbc`. Su informe decía que estaba abierta. MOTOR-18 y 18B se habían fusionado en la PR #19. Son referencias históricas: **comprueba Git y las PR antes de editar**.

- Lee `AGENTS.md`, las normas vigentes y el índice de documentación.
- Registra rama, commit inicial, estado de Git y base efectiva de MOTOR-18C.
- Si 18C está fusionado, crea una rama de SIM-MOTOR-01 desde `main` actualizado.
- Si sigue abierto, parte de su cabeza efectiva sin modificar sus commits; declara la dependencia en la PR y en el informe. No integres 18C por tu cuenta.
- Conserva cambios ajenos. No reinicies ni fuerces una rama para borrar trabajo existente.
- Sube los commits y deja una PR abierta, sin fusionar ni suscribirte.

### 2.2 Lee con un propósito concreto

Consulta el roadmap de cuatro entregas, los índices temáticos y solo las partes necesarias del funcional completo. Si el roadmap todavía no está archivado, este prompt contiene el alcance vinculante para 01 y la separación de las cuatro entregas.

Localiza los módulos actuales equivalentes a:

- `src/engine/index.js`: fachada e identidad del detallado.
- Datos de población, doce plantillas EQ01–EQ12 y sus planes naturales.
- Perfiles efectivos y tablas de capacidades, tiros, tareas, repertorio, defensa y familiaridad.
- Funciones puras de probabilidades, energía, estados y conocimiento.
- Lectores de acta/análisis, identidades y comprobadores reutilizables.
- Infraestructura de workers y lotes, únicamente donde ahorre trabajo sin arrastrar el resolutor detallado.
- Pantalla principal y navegación del laboratorio.

**No abras otros repositorios**, incluidos `v-apps`, Basket Manager y BeManager. No necesitas investigar por Internet, extraer estadísticas reales ni volver a auditar FIBA para esta entrega.

### 2.3 Congela la referencia real

Antes de editar conserva identidades y huellas de los archivos deportivos, datos y perfil detallados que vas a mantener. Ejecuta su referencia existente una vez y registra entrada, perfil, resultado, sorteos y huella deportiva.

La referencia histórica conocida da 83–98 y 6.684 sorteos. Comprueba que corresponde exactamente a la entrada y perfil disponibles; no fuerces esos números si la base efectiva es distinta ni recalibres para conseguirlos.

Al cerrar, repite esa misma referencia y compara. Las modificaciones comunes de navegación o etiqueta de aplicación no justifican cambios en su deporte. No actives automáticamente C17-02 ni otra candidata provisional heredada.

## 3. Dos accesos al laboratorio

Al abrir el laboratorio aparece una pantalla inicial con dos opciones:

| Acceso | Texto explicativo |
| --- | --- |
| **Motor detallado** | Laboratorio del motor actual para partidos dirigidos y pruebas de referencia. |
| **Motor ultrarrápido** | Laboratorio del generador estadístico por tramos, SIM-MOTOR. |

Requisitos:

- Acceso directo y funcional a ambos; ninguno se activa por migración silenciosa.
- Cabecera persistente con modelo y versión de aplicación. Perfil y versión de datos se muestran aparte.
- Acción «Cambiar de motor» que vuelve al selector.
- Estado de preparación, parámetros y último resultado separados por modelo.
- Importar o abrir un resultado de otro modelo no sustituye silenciosamente el actual.
- La rama detallada conserva sus pantallas y comportamiento.

No rehagas el diseño visual del laboratorio. La pantalla sirve para que Dennis sepa qué está probando.

## 4. Contratos, identidad y configuración

### 4.1 Contrato independiente

Crea una fachada pequeña en una carpeta propia, por ejemplo `src/sim/`, con estas operaciones o equivalentes documentados:

| Operación | Responsabilidad |
| --- | --- |
| Validar/normalizar entrada | Comprobar plantillas, planes, estados y parámetros sin modificar el original. |
| Preparar contexto | Compilar magnitudes y tablas reutilizables por jugador, plan y quinteto. |
| Crear encuentro | Inicializar un estado independiente con semilla e identidades propias. |
| Avanzar | Producir tramos canónicos y alcanzar una frontera de publicación. |
| Consultar | Leer solo el prefijo alcanzado, sin consumir azar. |
| Terminar | Obtener el mismo partido completo usando esas mismas operaciones. |
| Construir/validar resultado | Emitir el contrato SIM y sus conciliaciones. |

Una función que genera el partido entero puede envolver el avance. No mantengas dos implementaciones deportivas.

La entrada admite las plantillas y planes existentes mediante un adaptador explícito. Conserva edades, cuerpo, tendencias, roles, las 32 capacidades y conocimiento cuando existen. Identidades de equipo y de instancia no se confunden; enfrentar dos copias del mismo equipo debe funcionar.

El generador no utiliza DOM, reloj de pared, almacenamiento global mutable ni un perfil activo implícito. Dos encuentros intercalados no comparten estado deportivo.

### 4.2 Versiones y procedencia

Usa identificadores propios, sin fingir el formato de repetición del detallado:

- Modelo: `beM-sim-segment`.
- Contrato inicial de resultado: `beM-sim-match/1`.
- Perfil base: `SEM-SIM01-20261022`.
- Identidad de encuentro e intento, semilla, huella de entrada y huella deportiva.
- Referencia al perfil/dataset detallado del que se tradujeron conceptos.
- Matriz de cobertura y política estadística SIM identificadas.

No cambies el export deportivo del detallado para que acepte estos datos. Un importador incompatible rechaza con causa y conserva el archivo original.

La huella deportiva excluye tiempos de CPU, ruta de archivo, orden de ejecución, worker y etiquetas editoriales. Incluye la producción deportiva y el orden temporal comprometidos.

### 4.3 Parámetros administrables

Todas las decisiones numéricas deportivas deben estar en tablas/perfil SIM, no dispersas como constantes en el código.

En la interfaz basta una tabla editable por secciones con ruta, valor, unidad, procedencia y efecto, más validar, restaurar base y descargar candidata. No construyas otro megapanel.

Cada fila indica su origen:

1. **Heredada:** copia identificada de una fila efectiva existente.
2. **Derivada:** transformación matemática explícita de datos existentes.
3. **SEM-SIM01:** semilla nueva autorizada por este encargo, pendiente de auditoría/calibración.

No interpretes una probabilidad «por interacción» como una frecuencia «por posesión» o «por minuto» sin transformar su universo. Conserva unidades y denominadores.

La tabla siguiente fija las semillas nuevas de funcionamiento. No son datos observados de una liga:

| Fila SEM-SIM01 | Valor inicial | Aplicación |
| --- | ---: | --- |
| `segment.normalSeconds` | 120 | Duración máxima ordinaria de un tramo. |
| `segment.lateWindowSeconds` | 120 | Ventana final del cuarto periodo y de cada prórroga. |
| `segment.lateSeconds` | 30 | Duración máxima dentro de esa ventana, con cualquier marcador. |
| `volume.neutralSecondsPerControl` | 16 | Referencia de tiempo vivo por control de un equipo antes de aplicar ritmo. |
| `volume.secondsPerControlBounds` | [10, 24] | Límites del valor esperado ordinario, no límites de cada registro materializado. |
| `volume.commonRhythmFactorBounds` | [0,92; 1,08] | Factor uniforme de ritmo compartido por ambos equipos en cada tramo. |
| `assist.eligibleFinalPassP0` | 0,60 | Probabilidad base de una entrega final en una finalización que admite pase. |
| `assist.passAbilityLogitSlope` | 0,04 | Sensibilidad a capacidad de pase/lectura menos el neutral del perfil. |

Las recetas, pendientes y límites de tiro, calidad, pérdidas, rebote, tapón, energía, roles, familiaridad y estilos proceden de los datos efectivos existentes. Se traducen como se establece abajo; no añadas multiplicadores libres para conseguir resultados bonitos.

Si una interacción del detallado no tiene equivalente estadístico, agrúpala en su efecto representable y declara la aproximación. Un caso excepcional sin representación queda fuera de cobertura de 01; no inventes una probabilidad nueva para ocultarlo. Esto no permite dejar fuera los outputs y mecanismos básicos obligatorios.

## 5. Modelo de generación

### 5.1 Presupuesto pequeño

Mantén únicamente el estado necesario: periodo/reloj, marcador, control pendiente si corresponde, quintetos, elegibilidad/faltas, energía, plan efectivo, estados representados y acumuladores compactos.

Compila fuera de la generación repetitiva las recetas estáticas, índices y compatibilidades. Actualiza una magnitud cuando cambia uno de sus datos. No recalcules la población entera ni todas las asignaciones defensivas para producir cada tiro.

La distribución del tramo puede organizarse por equipo, familia, zona y participantes funcionales. Evita un producto cartesiano de todos los jugadores, jugadas, receptores, defensores y continuaciones.

### 5.2 Fronteras y reproducción

Un tramo no cruza el final de periodo. Usa la duración ordinaria o final de la tabla y acórtala ante una frontera deportiva necesaria: exclusión, sustitución obligada o cambio de plan admitido.

Estas fronteras son **canónicas**, determinadas por el estado deportivo, no por la velocidad de visionado, frecuencia de consultas o tamaño de la llamada del cliente.

Para preparar la simultaneidad de 02:

- Avanzar o consultar hasta un instante intermedio publica únicamente hechos alcanzados.
- Si ya generaste un tramo, puedes conservar su sufijo sin publicar; no lo reveles al consumidor público ni a políticas del entrenador.
- Una orden futura entra en la siguiente frontera canónica admitida; devuelve su instante efectivo. En 01 no prometas aplicación arbitraria a mitad de un tramo ya comprometido.
- No regeneres el prefijo publicado. El consumo de azar no depende de cuántas veces se consultó.
- Completar del tirón o avanzar por esas fronteras da el mismo partido con la misma entrada y órdenes efectivas.

En 01 bastan planes iniciales y un cambio programado para comprobar el contrato. El coordinador global, las ventanas completas de dirección y las reacciones a otros marcadores se integran en 02.

### 5.3 Volumen compartido

Genera un presupuesto conjunto de controles/ataques para el tramo. Los dos equipos comparten tiempo y alternancia: no sortees dos cantidades totalmente independientes de posesiones.

Referencia inicial:

```text
segundosEsperadosPorControlEquipo =
  neutralSecondsPerControl × factorDeRitmoEfectivoDelEquipo

controlesEsperadosPorEquipo =
  duraciónDelTramo /
  (segundosEsperadosPorControlA + segundosEsperadosPorControlB)
  × factorComúnDeRitmo
```

El factor de ritmo se traduce desde los niveles del estilo y sus factores existentes, distinguiendo juego organizado y transición. El factor común es el de la tabla SEM. Acota los segundos esperados con los límites declarados.

Utiliza redondeo aleatorio sin sesgo y conserva el control/fracción pertinente entre tramos. Un cambio de formato de registro no crea ataques adicionales. Los controles que terminan y los ataques que continúan por rebote ofensivo o falta sin cambio de control son conceptos diferentes.

No añadas una aproximación de posesiones mediante `0,44 × TL` si ya tienes el universo generado. Puedes mostrarla como estimador aparte, con su nombre y fórmula, si el lector la necesita.

### 5.4 Generación conjunta, con dependencias

Sobre el presupuesto, genera conteos condicionados mediante distribuciones apropiadas: multinomiales para categorías excluyentes, binomiales condicionadas para éxitos y repartos ponderados para participantes.

Respeta este orden lógico, sin exigir que el código tenga exactamente estas funciones:

1. Determina mezcla de ataque organizado, transición y decisiones espontáneas.
2. Calcula mezcla de familias, finalizadores, zonas y calidad desde el contexto.
3. Genera pérdidas y finalizaciones compatibles con el presupuesto de ataques.
4. Distingue tiros, contactos de tiro, faltas sin tiro y continuidades.
5. Genera aciertos/fallos, tapones y series de libres en sus universos elegibles.
6. Genera rebotes sobre fallos realmente reboteables. El ofensivo alimenta continuación y producción adicional; no crea un control rival.
7. Reparte créditos compatibles: pase final/asistencia, robo, tapón, rebote y faltas.
8. Materializa orden e instantes, cerrando fronteras obligadas y acumulando el acta.

Los estados no terminales pueden resolverse como flujos agregados entre pocas categorías. No conviertas esa exigencia en una llamada al detallado por cada ataque. Documenta la transformación de probabilidades de interacción a producción del tramo, incluidos rebotes y faltas que mantienen control.

No generes por separado puntos, tiros, robos, pérdidas y rebotes para cuadrarlos después. Esos totales son lecturas de los mismos hechos compatibles.

### 5.5 Cronología compatible

El registro temporal representa una secuencia posible del partido generado. No acredita que se hayan ejecutado los procesos internos del detallado.

- Orden estable, equipo en control coherente y tiempo dentro de cada periodo/tramo.
- Libres pertenecientes a su serie; el reloj de juego no avanza durante los lanzamientos.
- Canasta con falta y fallo con falta distinguidos. Un fallo con falta de tiro no se acredita como intento de campo cuando así lo dispone la política vigente.
- Solo el último libre elegible produce oportunidad de rebote.
- Tiros tapados pertenecen a intentos elegibles; tapón no implica automáticamente robo o rebote del taponador.
- Una pérdida con robo concede un único crédito al rival; una pérdida no robable no recibe robo.
- El instante del tiro determina su quinteto y participantes. No atribuyas un crédito a quien todavía estaba en el banquillo.

Para un pase final generado registra emisor y receptor distintos, ambos participantes, y su enlace a la finalización. La semilla de asistencia solo se usa donde la categoría admite esa entrega; no convierte un aislamiento sin pase en una asistencia. La acreditación posterior sigue la política estadística compatible declarada, incluidas asistencias a libres si procede.

### 5.6 Faltas, rotaciones y finales

Usa los periodos, prórrogas, bonus, exclusión e inferioridad del perfil normativo existente en la cobertura representada. No investigues ni reinterpretes aquí artículos pendientes del detallado.

Las faltas sin tiro tienen su consecuencia según bonus y categoría; no todas producen libres. Las prórrogas conservan los contadores que corresponden.

Al alcanzar la exclusión, el jugador deja de ser elegible desde ese hecho. Si un paquete generado contenía producción posterior, cierra el tramo en ese punto y reconstruye únicamente el sufijo no comprometido con el nuevo quinteto. No muevas todas las quintas faltas al final del tramo ni reasignes estadísticas a un sustituto como reparación.

La rotación básica reutiliza prioridades y umbrales declarados de energía/faltas/adecuación, con permanencias mínimas. No busques la mejor alineación en cada registro. Un referente fatigado puede seguir siendo la mejor opción; no lo sustituyas solo por tener menos de un porcentaje fijo.

Si faltan sustitutos, conserva la política de inferioridad disponible. Un límite técnico de iteraciones/prórrogas produce fallo diagnosticado, no un ganador inventado. No elimines el empate final sorteando un punto: juega las prórrogas necesarias conforme al perfil.

## 6. Capacidades, táctica y estados

### 6.1 Matriz de las 32 capacidades

Construye una matriz con una fila por capacidad: receta/variable consumidora, efecto, participantes, frecuencia de recálculo, ruta de parámetros y contraste fijo que lo demuestra.

Este es el destino funcional requerido; usa las recetas declaradas existentes cuando corresponden:

| Capacidades | Aplicación requerida en el generador |
| --- | --- |
| TEC01 Triple | Conversión de triple. |
| TEC02 Tiro de media distancia | Conversión de media distancia. |
| TEC03 Tiro interior | Conversión interior. |
| TEC04 Finalización en movimiento | Conversión al aro/en penetración. |
| TEC05 Tiro libre | Conversión de libres. |
| TEC06 Tiro en movimiento | Preparación/calidad de tiros de movimiento, diferenciados de recepción estática. |
| TEC07 Manejo de balón | Control, penetración y exposición a pérdidas. |
| TEC08 Pase | Control de entrega, participación como creador y pase final. |
| TEC09 Bloqueos | Calidad de las familias que los utilizan y participación del bloqueador. |
| TEC10 Movimiento sin balón | Recepción, cortes e indirectos. |
| TEC11 Juego de poste | Producción/calidad de la familia de poste. |
| TEC12 Defensa perimetral | Oposición exterior y control del rival. |
| TEC13 Defensa interior | Oposición interior y protección. |
| TEC14 Robo | Intervención recuperadora, dentro de pérdidas elegibles. |
| TEC15 Tapón | Probabilidad/crédito de tapón elegible. |
| TEC16 Defensa de bloqueos | Oposición en familias de bloqueo; no bonus defensivo universal. |
| TEC17 Cierre de rebote | Acceso/oposición en el reparto de oportunidades de rebote. |
| TEC18 Captura de rebote | Captura y crédito de rebote. |
| FIS01 Velocidad | Acceso/retorno en transición y contexto de ritmo pertinente. |
| FIS02 Aceleración | Penetración, desmarque y transición. |
| FIS03 Agilidad | Manejo/oposición/cambios pertinentes. |
| FIS04 Fuerza | Poste, bloqueo, interior y rebote. |
| FIS05 Salto | Finalización, tapón y rebote pertinentes. |
| FIS06 Resistencia | Gasto de energía y conservación del rendimiento. |
| FIS07 Equilibrio | Recetas técnicas de tiro, control y contacto que ya lo utilizan. |
| MEN01 Comprensión táctica | Ejecución/coordinación de familia y adecuación al plan. |
| MEN02 Visión de juego | Creación y distribución de ventajas/pase. |
| MEN03 Decisiones | Mezcla entre libro y oportunidades, riesgo y elección de producción. |
| MEN04 Anticipación | Lectura defensiva, robo, acceso y rebote pertinentes. |
| MEN05 Concentración | Control y recetas técnicas que la requieren. |
| MEN06 Consistencia | Amplitud de variación contextual, sin convertir baja consistencia en peor media por construcción. |
| MEN07 Rendimiento bajo presión | Respuesta contextual a importancia/final ajustado. |

No reduzcas todo a dos medias, ataque y defensa. Una capacidad no cuenta como utilizada por aparecer en el JSON o en el nombre de un agregado.

El contraste +1/+3/+5 se realiza sobre los cálculos puros, manteniendo el contexto; se declara cualquier tope. No exige que cada incremento gane más partidos con una sola semilla.

### 6.2 Libro, director y libertad

- Pesos de prioridades 1–5 tomados del perfil, con empates permitidos.
- Mezcla entre preferencia del entrenador y oportunidad estadística leída por el director mediante los pesos de libertad/lectura existentes.
- Finalizadores elegidos por adecuación a familia, rol, vocación y capacidades, sin prohibir por posición nominal.
- Fichas agrupadas por familia, conservando la identidad de ficha cuando el modelo la utiliza. Una agrupación no equivale a ejecutar su secuencia detallada.
- Transición y decisiones espontáneas son categorías reales de generación: también puede aparecer un triple temprano o un anotador que finaliza sin desarrollar el libro.
- No otorgues un bonus universal por repetir la ficha con mayor media. La adaptación/memoria completa se integra como política pequeña en 02, no como reconstrucción del motor de memoria actual.

### 6.3 Estilos, disposición y defensa

Cada control admitido necesita una correspondencia causal y una ruta de parámetros. Crea una tabla de cobertura que incluya todos los estilos existentes, media distancia, disposiciones, organizaciones y coberturas.

| Entrada | Efecto estadístico que debe representar |
| --- | --- |
| Ritmo organizado y transición | Tiempo/volumen y mezcla de ataques. |
| Orientación exterior/interior y media distancia | Mezcla de zonas, condicionada por los perfiles disponibles. |
| Elaboración | Mezcla de finalización inicial/producción tras circulación, sin generar cada pase. |
| Riesgo y libertad | Participación, pérdidas y mezcla entre plan y oportunidad. |
| Después del tiro | Participación en rebote ofensivo y coste de balance/transición rival. |
| Disposición | Disponibilidad de funciones y mezcla de familias/zonas. No bonus plano de acierto. |
| Organización defensiva | Reparto de responsabilidades/oposición por funciones y zonas. |
| Cobertura | Compensaciones entre tipos de finalización de la familia compatible. |
| Altura de presión | Control, ritmo/transición y esfuerzo pertinentes. |
| Ayudas, presión, receptores, robo y protección | Cambios condicionados en control, calidad, pérdidas/contacto y distribución de zonas. |
| Roles, marcas u objetivo individual representados | Reparto de responsabilidades y producción, según compatibilidad declarada. |

Traduce las recetas y tablas declarativas existentes a magnitudes esperadas por tramo; no ejecutes la búsqueda completa del detallado. Las compensaciones deben conservarse: una defensa no mejora simultáneamente todos los apartados por su etiqueta.

`box and one` utiliza el objetivo efectivo y su alternativa existente cuando el objetivo no está. Una cobertura de bloqueo no se aplica a una familia incompatible. No inventes lateralidad para distinguir efectos que el modelo no registra.

No muestres un control activo que el generador ignore. Una opción exclusivamente detallada aparece identificada como tal y sin efecto aparente en SIM. Las categorías básicas de la tabla sí deben funcionar en 01.

### 6.4 Familiaridad y aprendizaje

El conocimiento de táctica, posición y rol entra congelado desde la preparación. Traduce su penalización limitada a la calidad/control representados, usando las ponderaciones existentes una sola vez por cálculo.

Participan los jugadores relevantes, incluido el bloqueador. No promedies todo el banquillo ni penalices dos veces una calidad heredada.

**Polivalencia no mejora la actuación durante el partido.** Solo afecta al aprendizaje posterior. El generador no cambia conocimiento persistente, máximos, fuentes ni recibos durante el encuentro.

En 01 conserva las exposiciones compactas que puedas justificar: minutos por posición/rol y participación en las familias utilizadas, con unidad y procedencia. No declares una cadena exacta de saques o práctica de un módulo que no has producido.

La aplicación posterior, equivalencia de dosis entre motores e integración completa con las copias del laboratorio corresponden a 02. Un resultado parcial no se presenta como aprendizaje aplicable.

### 6.5 Estados y entrenador: alcance acotado

- Energía: gasto/recuperación por tiempo y carga de tramo, con Resistencia y curva de penalización heredadas; actualización en fronteras pertinentes.
- Forma: estado de entrada constante durante el encuentro, con efecto separado de la energía.
- Momentos individual/colectivo y Consistencia: representación compacta por tramo a partir de las funciones y límites existentes; declara qué dinámica del detallado queda aproximada. No reconstruyas todos sus episodios.
- Importancia y presión: contexto conocido en la frontera; no utilices el marcador futuro del tramo para calcular su propia probabilidad.
- Entrenador: utiliza el plan, preferencias y competencias disponibles en las variables representadas. Su enseñanza no crea habilidad durante el encuentro.

Mantén neutralidad donde la fórmula heredada la promete; los límites, la no linealidad o las categorías pueden romperla y deben quedar declarados. No añadas mecanismos nuevos de rachas, química o entrenamiento.

## 7. Salidas y conciliaciones

### 7.1 Salida comprometida por partido

1. Identidad, participantes, entrada/perfil, semilla, versiones, estado y resultado.
2. Marcador por periodo y final; ganador solo para un resultado realmente terminado/adjudicado.
3. Acta individual y de equipo: minutos, puntos, tiros de 2/3/libres, rebotes ofensivos/defensivos, asistencias, pérdidas, robos, tapones, faltas cometidas/recibidas y las métricas derivables compatibles —incluidos más/menos y valoración— con la política declarada.
4. DNP/indisponibilidades y sujetos colectivos cuando corresponden.
5. Tiros por jugador/zona/periodo y calidad representada. Zonas del perfil —aro, interior, media y triple—, sin inventar coordenadas/lados.
6. Uso y producción de familias/fichas representadas, organización/cobertura efectivas y denominadores propios.
7. Quintetos con sus intervalos, minutos y producción atribuible. La identidad de quinteto no depende del orden accidental de puestos.
8. Registro temporal compacto: anotación, tiros, pérdidas, créditos asociados, series de libres, rebotes, faltas y cambios de participantes/plan.
9. Conciliación y cobertura, separadas de la evaluación deportiva.

La evolución, acta y mapa se leen de esta misma salida. El relato editorial completo y todas las pantallas actuales de Análisis se conectarán en 02.

### 7.2 Mapa de procedencia

Inventaría el catálogo de outputs del laboratorio existente y asigna a cada elemento:

| Clase | Significado |
| --- | --- |
| Generado | Hecho producido por SIM. |
| Derivado | Cálculo desde sus hechos, con universo y fórmula. |
| Secuencia compatible | Ordenación temporal generada que permite representar la producción. |
| Exclusivo del detallado / pendiente de integración | No se fabrica una instrumentación que SIM no ha ejecutado. |

No marques como «pendiente de integración» algo que requiere un dato deportivo inexistente: distingue ambas situaciones. Los campos desconocidos usan ausencia tipada y causa, no cero.

Ejemplos exclusivos del detallado: todas las alternativas de pase descartadas, calidad de cada lectura microtáctica y cadenas exactas de ayudas. Pueden tener indicadores agregados propios en SIM, identificados como tales.

### 7.3 Invariantes obligatorios

- Sumas individual/equipo/periodos/zonas/familias dentro de sus particiones declaradas.
- Puntos obtenidos de conversiones; aciertos no superiores a intentos.
- Tiros/libres coherentes con contacto, anulación y crédito representados.
- Robos enlazados uno a uno con pérdidas rivales elegibles, sin exigir robo en toda pérdida.
- Rebotes limitados por oportunidades; cada oportunidad se resuelve o tiene una causa terminal/colectiva explícita.
- Créditos atribuidos a participantes elegibles en el instante correspondiente.
- Minutos y más/menos compatibles con intervalos; con cinco jugadores, suma de minutos igual a cinco veces la duración. La inferioridad utiliza los participantes reales.
- Ninguna acción posterior a exclusión, ni jugador fantasma.
- Quintetos mixtos y cambios de tramo sin doble conteo de producción.
- Final normal sin empate; fallos técnicos sin derrota o marcador definitivo inventados.
- Ninguna lectura o nivel de registro consume azar deportivo.

No uses el comprobador del detallado como certificación si sus supuestos no coinciden. Reutiliza funciones realmente compatibles y añade conciliación SIM pequeña, con las diferencias documentadas.

## 8. Interfaz mínima utilizable

En «Motor ultrarrápido» Dennis debe poder:

1. Elegir dos plantillas entre EQ01–EQ12 y sus planes naturales, con identidades de instancia distintas.
2. Inspeccionar el resumen de las fichas/roles/estados y los controles tácticos soportados.
3. Cambiar plan o controles sin modificar la referencia detallada.
4. Fijar semilla y perfil SIM; ver sus diferencias frente a la base si hay candidata.
5. Generar un partido completo y consultar acta, mapa por zonas, familias, quintetos y evolución sencilla.
6. Repetir la misma entrada y obtener la misma huella.
7. Descargar entrada/perfil efectivo, resultado y conciliación.
8. Ejecutar la agenda de 1.000 y ver progreso, terminados/válidos/fallidos, coste y descarga de su resumen.

No montes en 01 un segundo sistema completo de lotes persistentes. Usa un ejecutor ligero o piezas compatibles del actual. Detener/reanudar tras reinicio, historia mundial y clasificación simultánea pertenecen a 02.

El navegador permanece utilizable durante el lote. No ejecutes 1.000 trabajos pesados consecutivos en el hilo de interfaz.

## 9. Medición real de rendimiento

### 9.1 Objetivo y agenda

**Objetivo inicial: 1.000 partidos completos en ≤5 segundos de cálculo y construcción/validación de las salidas compactas, con cuatro workers, en una máquina identificada.** Es una meta que hay que comprobar, no un resultado que puedas declarar por intención.

Congela una agenda reproducible antes de medir:

- Los 132 cruces ordenados de doce equipos distintos, con sus planes naturales.
- Siete vueltas completas: 924 casos.
- Los primeros 76 cruces del mismo orden en una octava vuelta: total 1.000.
- Cada caso tiene identidad y semilla propias derivadas de la semilla maestra `20261022` mediante un algoritmo estable documentado.
- Orden fijo y entradas congeladas. La distribución desigual de la vuelta incompleta queda visible; no es una campaña deportiva balanceada.

No uses los 1.000 resultados como datos empíricos para calibrar en esta entrega. Sirven para coste y coherencia inicial.

### 9.2 Tres ejecuciones reales

Ejecuta la misma agenda:

| Ejecución | Condiciones |
| --- | --- |
| B01 | Proceso nuevo, un worker, 1.000 partidos. |
| B02 | Proceso nuevo, cuatro workers, 1.000 partidos. |
| B03 | Cuatro workers ya iniciados y contexto reutilizable, otros 1.000 partidos con la misma agenda. |

Son 3.000 ejecuciones de benchmark, no 3.000 observaciones independientes. B03 debe generar de nuevo cada partido: cachear preparaciones es válido; devolver resultados cacheados no lo es.

La lista de resultados deportivos/huellas debe coincidir entre B01, B02 y B03 por caso. Se puede liberar cada salida tras registrarla y validar su digest; no hay que retener 3.000 partidos en memoria.

No compares modelos distintos exigiendo el mismo marcador por semilla. Esa igualdad solo se exige aquí entre ejecuciones del propio generador.

### 9.3 Qué medir

Con reloj monotónico, registra:

- Equipo, sistema, CPU, núcleos disponibles, RAM y versión real de Node.
- Preparación/compilación de entradas y qué se reutilizó.
- Arranque y disponibilidad de workers.
- Generación, construcción de salidas e invariantes obligatorios.
- Comunicación de tareas/resultados; indica cuándo está incluida en el tiempo de pared.
- Serialización a JSON, bytes y escritura, medidas por separado cuando sea posible.
- Tiempo de pared total desde la solicitud hasta completar el resumen descargable.
- Throughput, latencia por partido con definición, memoria RSS máxima del proceso y tamaño de salida.
- Conteos: solicitados, intentos, terminados, válidos, inválidos, fallidos, reintentos y prórrogas.

Define exactamente los límites del cronómetro del objetivo. Como referencia operativa, el tramo medido con workers listos debe incluir despacho, generación, validación y obtención de los resultados compactos por el coordinador. No excluyas trabajo requerido para producirlos ni presentes la suma de tiempos de workers como tiempo de pared.

El arranque en frío, preparación, serialización y persistencia se muestran además para conocer el coste percibido. Si no puedes separar una fase con exactitud, declara su inclusión o estimación; no construyas un desglose ficticio por diferencia.

La RSS de un proceso con threads no se suma una vez por worker. Explica el método y frecuencia de muestreo.

### 9.4 Si no se alcanza el objetivo

Primero verifica que SIM no haya llamado al detallado o reconstruido sus decisiones. Perfila el cuello observado y aplica optimizaciones técnicas que conserven la producción comprometida.

No reduzcas la cobertura, elimines estadísticas, cambies probabilidades o presentes extrapolaciones como ejecuciones. Si repites una medida tras una optimización, conserva también la anterior y declara las ejecuciones adicionales.

No optimices indefinidamente. Entrega el generador funcional, las mediciones reales y el diagnóstico. El paso a 02 se decidirá con esta evidencia; «técnicamente implementado» y «objetivo alcanzado» son conclusiones distintas.

## 10. Verificación proporcionada

### 10.1 Pruebas automáticas necesarias

Añade solo las regresiones útiles, agrupando aserciones donde corresponde:

- Determinismo, independencia entre encuentros y equivalencia por avance/registro/worker.
- Conciliación completa y reconstrucción de acta/mapas desde registros.
- Exclusión en mitad de tramo, bonus/libres y continuación con quinteto legal.
- Empate que conduce a prórroga y final válido.
- Cálculos fijos que acreditan las 32 capacidades y familiaridad sin efecto inmediato de Polivalencia.
- Rechazo localizado de entrada incompatible y lectura sin consumo de azar.

Para acreditar causalidad usa distribuciones antes del sorteo: mismo contexto con prioridades empatadas, extremos de ritmo, exterior/interior, defensa/cobertura compatible y conocimiento bajo/alto. No declares fallos a partir de que una única semilla no suba el marcador.

Comprueba que los controles no se ignoren. No basta probar que el JSON del plan cambia.

Las 3.000 ejecuciones reales ya proporcionan cobertura de partidos completos. Añade solo escenarios dirigidos que no aparezcan allí; no hagas otra campaña masiva ni dupliques la suite en cada paso.

Ejecuta la suite existente completa una vez al cerrar los cambios de código, `data:check` y el comprobador documental vigente. Si un cambio posterior afecta su cobertura, repite el control pertinente. No rebajes pruebas heredadas para adaptar resultados nuevos de SIM.

### 10.2 Navegador y recorrido de Dennis

Un recorrido automático acotado debe cubrir selector → detallado → cambiar de motor → SIM → partido → vistas → repetición → edición de parámetro → descarga → lote.

Comprueba descargas reales por sus bytes y captura errores de consola/red. Si una API automatizada no permite un paso, declara cuál quedó sin ejecutar. No afirmes prueba de interfaz a partir de sintaxis.

Prepara un recorrido manual breve con entrada, semilla, perfil y señales de fallo. **Dennis hará la aceptación manual.** No marques como realizadas por él pruebas automáticas de Claude.

Ofrece comandos reproducibles —según la convención del repo— para generar un partido desde una entrada congelada, ejecutar B01/B02/B03 y comprobar la entrega. El benchmark no se ejecuta automáticamente en la suite habitual ni al arrancar el laboratorio.

## 11. Archivos para ChatGPT

ChatGPT analizará los archivos y propondrá ajustes a Dennis. Tu trabajo aquí es implementar, medir y entregar evidencia; no escribir una extensa defensa deportiva ni calibrar contra expectativas.

Guarda en `out/sim-motor01/entrega-final/`, fuera de Git:

### 11.1 ZIP de revisión rápida

Nombre: `SIM-MOTOR-01-revision-rapida.zip`.

Debe permitir verificar las afirmaciones principales sin necesitar toda la evidencia:

| Contenido | Información requerida |
| --- | --- |
| `00-LEEME.md` | Orden de lectura y conclusión separada: implementación, coherencia, rendimiento, pendientes. |
| `01-IDENTIDAD.json` | Commits/base, versiones, dataset, perfiles, huellas, entorno y estado real de Git. |
| `02-ALCANCE.csv` | Requisito → implementado/aproximado/no cubierto, productor, prueba y ruta. |
| `03-OUTPUTS.csv` | Catálogo existente frente a las cuatro clases de procedencia, universos y disponibilidad. |
| `04-CAPACIDADES-32.csv` | Las 32 filas, consumidores, parámetros y resultados de sensibilidad fija. |
| `05-CONTROLES-Y-TABLAS.csv` | Estilos, familias, disposiciones, defensas, estados/familiaridad y efecto representado. |
| `06-PARAMETROS.json` | Perfil SIM efectivo completo, procedencia, fórmulas de derivación y diferencias frente a origen. |
| `07-AGENDA.csv` | Los 1.000 casos, cruces, semillas e identidades de entrada. |
| `08-RESULTADOS.csv` | Las tres ejecuciones por caso: marcador, estado, prórrogas, huella, invariantes y tiempos disponibles. |
| `09-RENDIMIENTO.json` | Medidas brutas y agregadas B01/B02/B03, límites de cronómetros, memoria, bytes y cumplimiento del objetivo. |
| `10-CONCILIACIONES.json` | Conteos por invariante, fallos completos o lista vacía, sin convertir «no evaluado» en conforme. |
| `11-DETERMINISMO.json` | Comparación de huellas, avance y neutralidad del registro, incluidos los casos distintos si aparecen. |
| `12-DETALLADO-CONGELADO.json` | Referencia antes/después y cambios de archivos deportivos con explicación. |
| `13-PRUEBAS-Y-NAVEGADOR.md` | Controles ejecutados y no ejecutados, número real de partidos adicionales y descargas. |
| `14-PENDIENTES.md` | Defectos, aproximaciones, decisiones requeridas y tareas previstas para 02, sin mezclarlas. |

Incluye además un ejemplo completo generado, su entrada y el contrato legible. CSV en UTF-8, columnas con nombres claros, números sin formatos regionales ambiguos y unidades explícitas.

Procura un paquete rápido pequeño —orientativamente menos de 10 MiB— sin perder estas tablas. No metas trazas detalladas de los 3.000 encuentros.

### 11.2 Evidencia adicional acotada

Nombre: `SIM-MOTOR-01-evidencia-detallada.zip`.

Incluye los doce primeros resultados completos de B02, sus entradas, resultados de escenarios dirigidos, perfiles y código fuente de solo lectura necesario para revisar el generador, adaptadores y conciliaciones. Conserva rutas relativas e incluye la implementación de las fórmulas consumidas; un diff sin base puede ser insuficiente para revisarlas.

Si hay un fallo, incluye su evidencia real aunque lo hayas corregido, más la reproducción corregida claramente separada. No hace falta copiar todo el repositorio ni diagnósticos históricos ajenos al encargo.

### 11.3 Índice y comprobación

- `SIM-MOTOR-01-indice.json`: lista de archivos, tamaños, SHA-256, esquema y relación entre paquetes.
- `SIM-MOTOR-01-verificacion-final.json`: recibo obtenido desde los archivos finales reales.
- Un comprobador pequeño verificará integridad, parseo, agenda/conteos, enlace de muestras, igualdad B01/B02/B03 y coherencia de los resultados incluidos. **No vuelve a simular ni hace una auditoría deportiva.**

Registra qué comprobaciones verifica ese recibo; el número de hashes no equivale a pruebas deportivas. Evita autorreferencias circulares entre índice y recibo.

Adjunta el ZIP rápido, el índice y el recibo si el entorno lo permite. Adjunta o deja disponible el de detalle e indica su ruta. Si no puedes adjuntar, dilo con claridad: no afirmes que existe un enlace descargable cuando el archivo solo vive en el contenedor.

## 12. Documentación y entrega

- Archiva este prompt íntegro en `docs/prompts/` con el nombre del encargo y su entrada de catálogo.
- Nota técnica indexada: arquitectura, generación conjunta, contratos, fórmulas/unidades, aproximaciones y resultados medidos.
- Recorrido manual: `docs/prompts/SIM-MOTOR-01-recorrido-manual.md` o convención equivalente del repo.
- Actualiza `docs/estado.md`, changelog y el índice temático correspondiente.
- Conserva el funcional detallado íntegro y las decisiones históricas. Documenta SIM como modelo adicional; no reescribas esas decisiones como si siempre hubiera existido este generador.
- Separa tablas/configuración propia, preparación, generación, registros/lectura y UI en módulos pequeños. No crees un framework genérico de simulación.
- No subas `out/`, archivos de rendimiento gigantes ni resultados privados a Git. Sí los scripts y la evidencia resumida reproducible que corresponda según las normas vigentes.

En tu respuesta final indica:

1. PR, base y commit final; dependencia de 18C si todavía existe.
2. Qué puede probar Dennis, arranque y recorrido.
3. Qué genera el modelo y cuáles son sus aproximaciones.
4. Resultado real B01/B02/B03: 1.000 partidos, duración, válidos/fallidos y memoria; objetivo alcanzado o no.
5. Neutralidad del detallado y determinismo interno de SIM.
6. Pruebas realizadas y pendientes, con aceptación manual separada.
7. Archivos entregados, tamaños y comando de comprobación.
8. Defectos/decisiones abiertas y alcance concreto que queda para SIM-MOTOR-02.

No midas ni inventes consumo de cuota si el entorno no lo permite. No te suscribas a PR ni envíes mensajes a terceros.

## 13. Aceptación y alcance posterior

### 13.1 SIM-MOTOR-01 se evalúa en tres planos

| Plano | Condición |
| --- | --- |
| Funcional | Partidos completos, dos accesos, datos coherentes, capacidad/táctica causales y descargas. |
| Técnico | Contratos y versión propios, reproducción, referencia detallada intacta y verificaciones ejecutadas. |
| Rendimiento | Medición real de 1.000, desglose honesto y comparación explícita con la meta de cinco segundos. |

La calidad estadística comparada con el detallado y competiciones reales **todavía no queda validada** por esta entrega. Los coeficientes de origen ya eran provisionales; traducirlos no los calibra.

### 13.2 Qué corresponde a cada entrega

| Entrega | Alcance posterior aceptado |
| --- | --- |
| SIM-MOTOR-02 | Integración completa de lectores y laboratorio, políticas pequeñas, aprendizaje posterior, lotes persistentes, jornada simultánea con clasificación en directo y ejecución agrupada con estadísticas anuales individuales/historia. |
| SIM-MOTOR-03 | Campaña comparativa congelada. Claude ejecuta y empaqueta; ChatGPT analiza; Dennis decide. Sin calibración durante la campaña. |
| SIM-MOTOR-04 | Correcciones/calibraciones aceptadas, reserva de validación cuando proceda, auditoría breve y contrato de cierre para el manager. |

Mantén desde ahora estos compromisos para que 02 pueda integrarlos sin rehacer el núcleo:

- Los partidos simultáneos comparten un reloj virtual y solo publican el presente alcanzado. La clasificación en directo no puede leer finales futuros.
- Los trabajadores físicos son limitados y reutilizables; 1.000 encuentros simultáneos en el mundo no significan 1.000 threads.
- En Referencia se conservan identidades y estadísticas individuales de temporada hasta la fecha actual, con historial por club/competición, sin regenerarlo al abrir una ficha o cambiar de profundidad.
- No se construye en estas entregas la economía, el mercado ni todo el sistema mundial de competiciones. Tampoco se genera toda la cantera temprana de todos los países en Referencia.
- El aprendizaje es posterior al partido y su aplicación debe ser única, compatible y reversible; nunca una mejora en mitad del encuentro.

**Completa 01 con partidos, mediciones y evidencia. No desarrolles 02 anticipadamente ni sustituyas el generador por otra versión del motor detallado.**
