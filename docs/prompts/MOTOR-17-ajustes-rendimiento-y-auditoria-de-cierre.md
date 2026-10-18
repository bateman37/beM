# MOTOR-17 — Ajustes, rendimiento y auditoría de cierre

**Destinatario:** Claude Code, repositorio `bateman37/beM`.  
**Decisión de Dennis:** implementar las recomendaciones aceptadas tras MOTOR-16 y terminar esta entrega con una auditoría comparativa más pequeña, cuyos archivos analizará ChatGPT.  
**Modalidad:** implementación acotada, comprobación técnica y extracción de datos. No es una nueva investigación del diseño ni una reescritura del simulador.

## Índice

1. [Encargo y límites](#m17-01)
2. [Base real, Git y evidencia](#m17-02)
3. [Hallazgos de partida](#m17-03)
4. [Orden y atribución de cambios](#m17-04)
5. [Robos y acta](#m17-05)
6. [Saques, identidades y lectores](#m17-06)
7. [Las 32 capacidades y su sensibilidad](#m17-07)
8. [Rendimiento del mismo motor](#m17-08)
9. [Rotaciones, director y energía](#m17-09)
10. [Calibración deportiva acotada](#m17-10)
11. [Panel, perfiles e interfaz](#m17-11)
12. [Compatibilidad y propiedades que conservar](#m17-12)
13. [Desarrollo y congelación](#m17-13)
14. [Auditoría comparativa final](#m17-14)
15. [Benchmarks y equivalencia](#m17-15)
16. [Datos y lectura automática de cierre](#m17-16)
17. [Pruebas proporcionadas y recorrido manual](#m17-17)
18. [Archivos para ChatGPT](#m17-18)
19. [Documentación, versiones y PR](#m17-19)
20. [Aceptación y mensaje final](#m17-20)

<a id="m17-01"></a>

## 1. Encargo y límites

### 1.1 Resultado esperado

1. Resolver defectos demostrados de créditos, registro y lectura.
2. Mejorar el coste conservando el mismo cálculo deportivo.
3. Corregir las causas demostradas de la concentración de minutos y revisar el equilibrio entre oportunidades, conversión, reloj y faltas.
4. Exponer cualquier ajuste numérico en tablas administradas y candidatas explícitas.
5. Ejecutar al final la campaña cerrada de este prompt y entregar sus datos en ZIP, con trazabilidad suficiente para que ChatGPT los analice.

**Claude implementa y hace las comprobaciones técnicas necesarias. ChatGPT hará la interpretación deportiva y la comparación externa en profundidad. Dennis y ChatGPT decidirán la aceptación de la calibración.** Usa cálculos y herramientas existentes para evaluar candidatas; no redactes otro tratado de baloncesto ni interpretes con el modelo cada partido.

### 1.2 Lo autorizado y lo que no debes decidir

Están autorizadas las correcciones demostrables y la preparación de ajustes numéricos provisionales dentro de los mecanismos existentes. No están autorizadas reglas deportivas nuevas, atributos nuevos, cambiar el alcance funcional ni sustituir el motor por otro.

Una hipótesis del análisis no es un defecto confirmado. Comprueba su causa antes de modificarla. Si no se sostiene, conserva el comportamiento y deja la evidencia: no hace falta producir una corrección por cada sospecha.

Puedes tomar decisiones técnicas reversibles para completar el trabajo. Si un punto necesita una decisión funcional realmente nueva, prepara evidencia y opciones y continúa los bloques independientes; no inventes la decisión ni detengas toda la entrega.

Conserva:

- Resolución por posesiones y acontecimientos. Sin ticks, coordenadas continuas ni movimientos de todos los jugadores a cada instante.
- Las 32 capacidades, el repertorio y las capas tácticas acordadas.
- Los tres modos de partido, las velocidades y la dirección del entrenador.
- Memoria pequeña y gradual, sin fallo obligatorio por repetir una acción.
- La posibilidad de que una estrella con energía 30 sea mejor que su relevo.
- Tablas administradas como control de parámetros, con valores y consumidores visibles.

No introduzcas cuotas de marcadores bajos, canastas de compensación, topes artificiales al resultado, minutos obligatorios para todos, premios ocultos por edad ni un nuevo resolutor rápido. No cambies capacidades de la población para esconder un desequilibrio.

Trabaja solo en beM. No consultes otros repositorios. No fusiones, publiques releases, te suscribas ni envíes mensajes a terceros. No midas cuota con estimaciones inventadas.

<a id="m17-02"></a>

## 2. Base real, Git y evidencia

La campaña MOTOR-16 no implementó un motor nuevo. La base recibida sigue siendo:

| Elemento | Identidad declarada |
|---|---|
| Código de MOTOR-15B | `6a6814c`. |
| Commit usado por MOTOR-16 | `109b9f8`, diferencias solo documentales respecto al anterior. |
| Documentación de campaña posterior | `85d8ccd`, sin PR según la entrega. |
| Motor | `beM-motor-0.15.1-MOTOR15B`. |
| Perfil | Cadena efectiva hasta `SEM-MOTOR15B-20261017`. |
| Acta | `ACTA-MOTOR15B-R1`. |
| Export | `beM-match-export/9`. |
| Población | `POB-MOTOR11-R1`, EQ01–EQ12, doce jugadores cada uno. |
| Referencia histórica | Semilla `20261016`: 83–98, 6.684 sorteos. No es una diana. |

Verifica `main`, la rama de trabajo y los commits reales. No atribuyas a `main` lo que solo esté en otra rama. Si la base aún no está fusionada, parte de la rama correcta y declara la dependencia. Usa una rama propia de MOTOR-17 según las normas del repo; no hagas resets destructivos ni mezcles cambios ajenos.

Conserva una base R0 ejecutable y aislada —por ejemplo, worktree del mismo repositorio— para las comparaciones. No utilices el ejecutable final con una etiqueta antigua como supuesto motor de referencia. Preserva las dependencias congeladas, sin actualizaciones de paquetes por rutina.

### Lectura dirigida

Lee normas raíz, estado/índice, este prompt, el informe `beM-MOTOR-16-ANALISIS-Y-PROPUESTA-MOTOR-17.md` si está adjunto, contratos técnicos pertinentes y la evidencia que necesites para cada causa.

Busca primero la campaña original en `out/motor16/`, sus lotes, entradas y diagnósticos. Las rutas pueden variar. Si no está en el entorno, usa los paquetes disponibles o reproduce solo los casos mínimos necesarios sobre R0. No repitas MOTOR-16 ni dediques la sesión a buscar archivos efímeros imposibles de recuperar.

ChatGPT solo recibió el rápido y el índice antes de redactar este encargo. No ha inspeccionado las catorce partes ni tu código actual. **No cites sus hipótesis como si fueran conclusiones de una revisión de código.** `DESIGN(1).md` y `CLAUDE.odt` históricos no sustituyen el funcional vigente.

Antes de editar, conserva commit completo, perfil efectivo, políticas, versiones, Git inicial, entorno y archivos de evidencia disponibles/ausentes. No hace falta ejecutar toda la suite antes de empezar si la base ya está acreditada; verifica lo necesario para trabajar sobre la identidad correcta.

<a id="m17-03"></a>

## 3. Hallazgos de partida

Estos números proceden del rápido MOTOR-16; son antecedentes, no objetivos que debas reproducir tras cada cambio:

| Universo | Dato |
|---|---|
| A natural, 2.640 encuentros | 83,06 puntos por equipo; 14,02 % de actuaciones por debajo de 70. |
| A natural | 59,32 tiros de campo, 59,57 % de dos, 41,55 % de tres, eFG 60,54 %. |
| A natural | 13,95 libres intentados, 25,21 rebotes, 10,55 pérdidas, 2,22 robos y 12,61 faltas por equipo. |
| Actuaciones de equipo sin prórroga | 4.390 de 5.162, un 85,04 %, tienen algún jugador de 40 minutos exactos. |
| Población natural | Trece jugadores no participan en sus 440 encuentros; once de ellos tienen identificador J02. |
| CSV individual rápido | `team_index` vacío en 84.096 filas. |
| AUD recibidas, 24 diagnósticos B | CSV e informe: 16 conformes / 16 inconclusas; mensaje de entrega: 17 / 15. |
| AUD26 | Nueve cadenas sin cierre tras desenlace, sobre 2.149; 26 interrupciones por bocina válidas. |
| Capacidades | Las 32 tienen uso; `matches` cuenta como máximo dos partidos en las 191 filas pese a leer 24 de doce lotes. |
| Sensibilidad | 1.323 de 2.304 filas usan reconstrucción sin tope registrado; todas se expresan en puntos de receta. |
| Rendimiento A | 2.640 encuentros en 640,2 s con cuatro workers; no es un benchmark de cien. |

No mezcles A con contrastes extremos para describir una liga. Las repeticiones técnicas no amplían la muestra deportiva.

El antecedente de 65 pérdidas vivas con recuperador sin crédito procede de seis casos anteriores de MOTOR-15B; **no es un recuento de los 2.640 naturales**. El ejemplo histórico C15-01 E0052, recuperación de EQ01-J06 tras pérdida de EQ02-J11, sirve para localizar una ruta, no para asumir que todos los casos tienen la misma causa.

<a id="m17-04"></a>

## 4. Orden y atribución de cambios

Organiza commits y evidencia para distinguir:

| Etapa | Propósito | Comparación esperada |
|---|---|---|
| R0 | MOTOR-15B congelado. | Referencia real anterior a esta entrega. |
| A17 | Correcciones demostradas de créditos, lectores y semántica existente. | Cada diferencia frente a R0 debe tener causa. |
| P17 | Optimización de A17, mismas entradas y parámetros. | Igualdad deportiva; el coste puede cambiar. |
| C17-01 / C17-02 | Hasta dos candidatas numéricas sobre los mecanismos existentes. | Diferencias deportivas provisionales y declaradas. |
| R17 | Código final y perfil propuesto para el cierre. | Comparación global con R0; no se exige el mismo marcador. |

Son etiquetas de evidencia, no cinco motores nuevos ni cinco pantallas. Identifica los commits y perfiles concretos que representan cada etapa. No hace falta conservar ramas de producto para todas.

Una optimización no justifica cambiar el deporte. Una corrección del crédito no justifica añadir intervenciones defensivas. Un ajuste numérico no demuestra que hubiera un bug.

Si un crédito estadístico resulta ser consumidor de IA o estados, comprueba esa dependencia antes de declararlo «solo acta». Documenta y aísla cualquier efecto deportivo: no ocultes diferencias de momento, dirección o RNG bajo esa etiqueta.

<a id="m17-05"></a>

## 5. Robos y acta

### 5.1 Criterio de interpretación ya verificado

ChatGPT ha leído directamente el **FIBA Statisticians’ Manual 2024 v1.0, §7, página PDF 24**, el 18/10/2026:

<https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf>

Síntesis para aplicar a hechos existentes:

- Recoger un balón suelto tras error ofensivo puede acreditar robo, incluso sin desplazamiento del defensor.
- Si intervienen varios defensores, importa quién inicia el desvío causante, no solo quién recoge después.
- El robo requiere contacto; no exige que el primer defensor controle personalmente el balón.
- Una pérdida no implica siempre robo. El balón muerto normalmente lo excluye; la alternancia tras balón retenido tiene una excepción específica.
- Todo robo necesita una pérdida ofensiva correspondiente.

Esta síntesis tiene procedencia externa verificada por ChatGPT; no la presentes como lectura directa tuya si no accedes al documento. No cambies el perfil reglamentario entero por usar este criterio estadístico ni repitas intentos de descarga bloqueados indefinidamente.

### 5.2 Implementación

Rastrea las rutas actuales de pérdida/intervención/recuperación: organizada, avance, saque y balón suelto. Comprueba qué significa `recupera` y quién obtiene control real de la siguiente posesión.

Corrige omisiones de crédito demostradas, usando el mismo hecho deportivo. Distingue pérdida viva controlada, balón fuera, violación, falta ofensiva, primer desvío y recuperación. Reutiliza un criterio compartido para impedir dobles créditos o decisiones contradictorias entre rutas.

No inventes un sorteo de «contacto» para justificar lo que ya ocurrió. Si falta evidencia del contacto inicial pero existe una recogida controlada, resuelve conforme a lo que está representado; si el hecho es realmente ambiguo, consérvalo como tal sin fabricar autor.

Concilia evento, acta individual/colectiva, análisis, export y diagnóstico. Cada caso positivo y exclusión debe tener una regresión significativa, preferiblemente parametrizada sobre las rutas existentes.

**Primero completa y mide el crédito.** Solo después se puede proponer una candidata sobre acceso/intento/control si persiste un déficit deportivo demostrado. No existe un valor nuevo autorizado de antemano para `stealAttemptGivenAccessP0` ni una cuota de robos por partido.

<a id="m17-06"></a>

## 6. Saques, identidades y lectores

### 6.1 Nueve cadenas de saque

Localiza los hechos citados por H-AUD26-002 en MOTOR-16. Pueden estar en el productor o en el enlace del lector. Corrige la causa demostrada, sin tocar un saque válido solo para que el informe cierre.

Una cadena tiene estado terminal y causa coherentes con su desenlace. Conserva separadas las interrupciones legítimas por fin de periodo; no son fallos de ejecución. Verifica tiros, libres, pérdidas y balones sueltos en las rutas realmente afectadas.

Incluye evidencia antes/después y una regresión que falle con el defecto. Si los nueve resultan ser clasificación incorrecta del auditor, corrige el auditor, no añadas acontecimientos deportivos.

### 6.2 Identidades y CSV

Usa identidad global de fuente/lote/caso/variante/intento y decisión cuando corresponda. Un `M000001` o un `E0052` local no identifica por sí solo un partido ni un contexto entre lotes.

Comprueba y corrige, si se confirma:

- Conteo `matches` de la matriz de capacidades y cualquier deduplicación/selección de contextos que tenga la misma colisión.
- `team_index` vacío en la exportación individual; usa pertenencia real a la entrada congelada, también con copias, aliases y enfrentamientos entre dos copias del mismo equipo. No deduzcas siempre el equipo cortando el ID por `-J`.
- Resúmenes AUD inconsistentes. Deben proceder de la misma ejecución real que el CSV y el informe, sin números copiados.
- Unidades, valores nulos y tamaños UTF-8 cuando los exportadores afectados los manejen.

No conviertas un nulo en cero. No rebajes umbrales ni cambies «inconcluso» a «conforme» para mejorar el resumen. Un paquete puede conservar hallazgos no deportivos y limitaciones reales.

Los paquetes históricos permanecen intactos. Si un lector corregido extrae otros conteos de los mismos archivos, identifica la versión del lector y conserva ambas lecturas; no reescribas los hechos antiguos como si ya hubieran contenido campos nuevos.

<a id="m17-07"></a>

## 7. Las 32 capacidades y su sensibilidad

Mantén el catálogo completo. Reutiliza los consumidores y operaciones puras actuales; no construyas otro evaluador deportivo dentro del auditor.

Para cada capacidad debe poder seguirse:

**capacidad → selección/tarea → valor efectivo → operación final → salida consumida → hecho o estado**.

### 7.1 Evidencia mínima

Conserva identidad global, capacidad/actor/rol/tarea, base, valor efectivo, energía/estados pertinentes, límites y parámetros realmente usados. Si falta el tope de tarea necesario para reproducir una operación, regístralo en el punto existente de consumo, sin otro sorteo ni volver a decidir la jugada.

Registra la salida real que pueda contrastarse: probabilidad binaria, distribución categórica, puntuación de elección, gasto/recuperación, amplitud/episodio o penalización. No etiquetes todas esas magnitudes como «puntos de receta».

El +1/+3/+5 mantiene el contexto y usa la operación real hasta su salida pertinente. Declara saturación, incremento efectivo y unidad. Para un coste puede ser mejor que la cifra baje; para Consistencia no se exige que la probabilidad media de acierto suba.

Si una parte solo puede reconstruirse aproximadamente con evidencia histórica, sepárala de los contrastes exactos nuevos. No presentes una aproximación sin tope como reproducción exacta del cálculo original.

### 7.2 Alcance concreto

Comprueba especialmente TEC17/TEC18, MEN02/MEN03, MEN06/MEN07 y FIS06, sin ignorar las restantes. La lectura de Resistencia debe llegar al gasto; la de Consistencia a su variación; la de presión a su efecto contextual. No hace falta que todas terminen en la probabilidad de tiro.

No confundas evaluar veinte candidatos con ejecutar veinte acciones. La matriz separa consumo para elegir, consumo para ejecutar, exposición y contraste.

La perturbación a capacidad 30 con incremento efectivo cero debe dar cambio cero dentro de la precisión declarada. Corrige redondeos/reconstrucciones del informe si explican los tres deltas históricos de −0,0003, sin alterar Fuerza para compensarlos.

Registrar más detalle no puede cambiar la trayectoria. Mantén los campos nuevos en diagnóstico cuando no sean necesarios para el acta esencial o el manager.

<a id="m17-08"></a>

## 8. Rendimiento del mismo motor

**Objetivo heredado:** cien encuentros `world-essential` en cinco segundos con cuatro workers en el entorno de referencia. No está demostrado que sea alcanzable. Trabaja para acercarte y mide el resultado real; no cambies qué es un partido para declarar éxito.

### 8.1 Medición y optimización

Usa el medidor y pool existentes. Si necesitas perfilar, realiza una sesión corta y dirigida, evitando perfiles masivos. Distingue tiempo de simulación, instrumentación, conciliación, huella, registro, escritura y coste del coordinador; las fases pueden solaparse.

Busca trabajo repetido evitable: compilación de datos estáticos, reconstrucción de fichas/repertorios, asignación de funciones/candidatos, clonados, objetos temporales y producción de diagnóstico que luego se descarta.

Son soluciones admisibles, si la medición las respalda:

- Compilar una vez por perfil catálogos/tablas inmutables.
- Reutilizar datos estáticos con aislamiento entre partidos.
- Cachear solo con todas las dependencias y reglas de invalidación correctas.
- Evitar materializar trazas completas en el camino esencial.
- Reducir clonados, serialización y consultas redundantes.

No cachees probabilidades sobre contextos diferentes ni compartas estado mutable de energía, memoria, quinteto, reloj o RNG. Un resultado no puede depender del orden de los encuentros, del worker asignado ni de una ejecución anterior.

Identifica los compilados por el contenido efectivo completo y sus dependencias, no solo por `profile.id` o el nombre visible: varias extensiones/candidatas pueden compartir el ID base. Editar un parámetro debe invalidar el compilado correspondiente y cambiar realmente su consumo.

### 8.2 Límites

No uses otro algoritmo probabilístico, elimines lectura táctica, recortes continuaciones o suprimas propiedades del acta. No apagues controles críticos para comparar un motor validado con otro sin validar; cualquier comparación de validación/huella diferente se etiqueta aparte y no sirve como prueba principal del objetivo.

Conserva las modalidades y guardado/continuación. No cambies la secuencia de sorteos para permitir la optimización. No lances decisiones del mismo partido en paralelo ni agentes de IA por encuentro.

Si una optimización altera la trayectoria A17→P17, se corrige o se retira. Si el perfil de CPU no revela una mejora suficiente, entrega la mejora segura conseguida y el coste pendiente. No introduzcas un segundo motor ni cambies el objetivo a una máquina mayor sin declararlo.

<a id="m17-09"></a>

## 9. Rotaciones, director y energía

### 9.1 Diagnóstico técnico dirigido

Antes de cambiar coeficientes, sigue la decisión de relevo en unos pocos casos ya registrados. Comprueba planes naturales efectivos, delegación, elegibilidad por función, identificación del director, estado disponible y ventanas del entrenador.

Estudia por qué tantos J02 no participan: puede haber una regla errónea, una copia de plan incompleta, un requisito de función o una decisión válida de una plantilla extrema. No presupongas la causa.

La posición nominal sigue siendo recomendación, no prohibición heredada. Un recambio debe poder asumir una función realizable según los contratos existentes; no inventes una nueva incompatibilidad para mantener al titular ni una función que ningún jugador tiene.

### 9.2 Corrección y ajustes permitidos

Corrige defectos en aplicación del plan, elegibilidad, comparación o ventanas si se demuestran. Conserva motivos y datos de la decisión del entrenador.

Si el comportamiento procede de la calibración, usa en una candidata los controles existentes de gasto por tarea, recuperación y valoración disponible del relevo. Evita contar dos veces la misma fatiga. Mantén histéresis y ventanas para que no haya entradas/salidas continuas.

Se conservan estas decisiones funcionales:

- Energía alta, aproximadamente 100–70, casi neutral en los ámbitos acordados.
- Deterioro creciente y sensible por debajo de 10, según tarea, sin fallo total obligatorio.
- Una estrella a 30 puede continuar si sigue siendo la mejor opción contextual.
- Faltas, importancia, marcador, momento y cierre se valoran según el librillo existente.
- Pausas y cambios no garantizan cortar rachas ni borran memoria.

No impongas minutos máximos universales, un mínimo para los doce ni retirada por umbral único. Si un jugador tiene un DNP válido, debe seguir pudiendo tenerlo. No diseñes un planificador nuevo de temporada.

**Revisa esta parte antes de fijar la candidata de tiro:** cambiar quién juega y con qué energía altera los porcentajes observados.

<a id="m17-10"></a>

## 10. Calibración deportiva acotada

### 10.1 Qué debes distinguir

El marcador natural de 83,06 no demuestra un defecto. El alto acierto puede proceder de capacidades de la población, selección de oportunidades, conversión o una combinación. Los pocos tiros/rebotes pueden estar relacionados con el reloj y con los fallos disponibles; las pocas faltas/libres tienen sus propias rutas.

No ajustes una media sin identificar el mecanismo. Revisa una muestra diagnóstica existente por sector, preparación, oposición, capacidad efectiva, director y familia, y por tiempos realmente consumidos. No conviertas cada término del motor en un parámetro nuevo.

Referencias conocidas para orientar la lectura, **no dianas de calibración**:

- ACB, primer tramo 2024-25: eFG medio 53,1 % y ritmo 74,5 posesiones/40, con su universo propio.
- Unicaja 2024-25: 55,1 % de dos, 36,8 % de tres y 34,9 rebotes; un club, no una liga.
- La ACB 2025-26 también documenta equipos muy eficientes. No existe un único promedio eterno del baloncesto.

Fuentes primarias ya consultadas por ChatGPT:

<https://acb.com/es/liga/noticias/la-liga-endesa-2024-25-bajo-la-lupa-de-la-analitica-avanzada-141663>

<https://acb.com/es/liga/equipos/unicaja-14/estadisticas?editionId=89>

<https://acb.com/es/liga/noticias/estadisticas-avanzadas-de-la-liga-endesa-25-26-que-no-debes-olvidar-145592>

No hagas una investigación externa extensa ni repitas descargas bloqueadas. La comparación externa profunda corresponde a ChatGPT. Si no hay una referencia compatible suficiente, declara calibración externa pendiente; no inventes medias de FIBA o Euroliga.

### 10.2 Candidatas autorizadas

Después de corregir las causas demostradas, puedes preparar **hasta dos candidatas numéricas** de los mecanismos actuales. Máximo seis controles numéricos independientes por candidata, con diferencias exactas, agrupados por causa. No vale llamar «un control» a veinte nodos de curva libres.

Prioriza, por este orden:

1. Gasto/recuperación/relevo, si la concentración se debe a ellos.
2. Oportunidad/conversión/tiempo, si la señal persiste al controlar plantilla y rotación.
3. Faltas y acceso/intervención defensiva, si persiste el déficit después de corregir créditos.

No estás obligado a tocar las tres familias. Una causa compartida corregida puede reducir la necesidad de parámetros. Si todo procede de una población de laboratorio extrema, documenta eso sin rebajar fichas ni ajustar el motor para ocultarlo.

Cada valor cambiado tendrá fila administrada, valor anterior/nuevo, consumidor, causa, efectos previstos y efectos observados en desarrollo. No introduzcas un ratio calibrable como literal oculto en el código.

No hay nuevas dianas numéricas aprobadas para eFG, faltas, robos o porcentaje de jugadores de 40 minutos. **Las candidatas son propuestas cuantificadas para revisar, no una calibración aceptada automáticamente.** Esta distinción no bloquea implementar las correcciones y preparar una candidata revisable.

### 10.3 Selección antes de la validación

Usa los mecanismos y la muestra de desarrollo de §13. Conserva ambas candidatas y sus diferencias si pruebas dos. Elige una propuesta final razonada técnicamente y congélala **antes** de ejecutar la auditoría final.

Si ninguna tiene sustento suficiente o alguna destruye diferencias tácticas, propón para el cierre la base corregida/optimizada, sin ajuste numérico especulativo. No selecciones por un marcador bonito ni mejores la candidata mirando las semillas de cierre.

No añadas más habilidades, bonus de edad, nuevas reglas de Forma/momento o castigos automáticos a una jugada. No obligues a que cada +3 aumente puntos de equipo o gane cada partido.

<a id="m17-11"></a>

## 11. Panel, perfiles e interfaz

Reutiliza las pestañas existentes. No construyas otro panel de calibración.

- Panel: filas modificadas localizables, unidades, rangos, base/candidata y consumidor.
- Plantillas/Preparación: planes naturales efectivos, funciones y recambios coherentes con las correcciones.
- Partido: dirección, energía y guardado/continuación conservados.
- Análisis/Auditorías/Cierre: cifras provenientes del resultado real, muestra y límites visibles.
- Exportación: enlace real a los archivos o descarga existente; no una ruta inaccesible como único entregable.

Conserva el perfil anterior. La activación de una base o candidata nueva es explícita; no migres ni actives silenciosamente en el navegador de Dennis. No confundas el número de aplicación con perfil, dataset, política y formato.

Los perfiles antiguos deben poder abrir el panel con la tarjeta de compatibilidad existente, sin volver al acceso inseguro a `profile.coach.policies`. Las diferencias de contrato se explican sin destruir el archivo o el estado guardado.

Lo técnico va en diagnóstico/documentación. El jugador recibe información deportiva útil, no las claves internas de implementación en cada orden.

<a id="m17-12"></a>

## 12. Compatibilidad y propiedades que conservar

Revisa y documenta qué versiones pueden leerse, analizarse, reproducirse o continuarse. No son la misma operación.

No se exige que un guardado de otro motor continúe bajo reglas nuevas. Si es incompatible, rechazo explicado y archivo intacto; no conversión silenciosa. R0 se ejecuta en su base aislada para las comparaciones.

No incrementes el esquema de exportación solo porque la aplicación se llame MOTOR-17. Si cambian estructura o semántica que el contrato exige versionar, actualízalo y documenta la compatibilidad. Lo mismo para snapshot, análisis, instrumentos y política de acta.

Entre modos y niveles de registro del mismo motor/perfil/órdenes conserva trayectoria. Nunca compares como idénticas `TRAYINC-MOTOR15-R1` y `TRAY-MOTOR12-R1`; usa un observador común existente o una proyección deportiva explícita que no quite diferencias reales.

No elimines del comparador energía, memoria, dirección, faltas o participantes para hacer pasar una optimización. Diferencias de metadatos se separan de las deportivas; diferencias legítimas de crédito o de reglas no se esconden en una huella normalizada.

El acta, posesiones, finalizaciones, tiros, parciales, minutos, quintetos y sujetos colectivos mantienen universos compatibles. No alteres la privacidad del rival ni expongas sus probabilidades/estados privados en audiencia pública.

<a id="m17-13"></a>

## 13. Desarrollo y congelación

### 13.1 Muestra de desarrollo pequeña

Para comparar la base P17 con hasta dos candidatas, usa doce pares de ciclo:

`EQ01–EQ02, EQ02–EQ03, …, EQ11–EQ12, EQ01–EQ12`.

Enuméralos `d=1…12`. Para cada par ejecuta `r=1,2`, con:

`seed_dev = 210000000 + 1000*d + r`

En r=1, el primer equipo del par es local; en r=2 se invierte. Cada versión usa exactamente las mismas entradas/semillas, salvo los parámetros de la candidata.

Son **24 encuentros por perfil**: P17 base y, si procede, C17-01/C17-02; máximo 72 ejecuciones de esta selección. No son una reserva de validación ni bastan para demostrar cualquier efecto pequeño. Puedes reutilizar evidencia MOTOR-16 para investigar causas sin re-simularla.

Las reproducciones mínimas de un bug, las comparaciones A17/P17 y los casos preparados se identifican aparte. No amplíes esta fase a una búsqueda de cientos de perfiles.

### 13.2 Congelación final

Una vez implementadas correcciones/optimización y elegida la propuesta:

1. Ejecuta las comprobaciones de desarrollo pertinentes.
2. Identifica R0 y R17 con commit, perfiles, políticas y dependencias completas.
3. Guarda el plan de cierre, entradas, variantes, semillas y selección diagnóstica antes de simular.
4. Calcula sus hashes y conserva el estado de Git.
5. Ejecuta la campaña de §14 y §15.

Si una semilla de cierre ya se usó para desarrollar esta entrega, decláralo y cambia su espacio de semillas antes de abrir los resultados. No declares «reserva» una muestra que ya miraste para elegir valores.

No calibres después contra los resultados finales. Un defecto técnico descubierto se conserva; si hay que corregirlo para entregar una aplicación operativa, registra la revisión y separa la evidencia anterior/posterior. Una reserva utilizada para corregir ya no es validación independiente de esa corrección.

<a id="m17-14"></a>

## 14. Auditoría comparativa final

**Obligatoria al terminar la implementación.** No se sustituye por tests unitarios ni por cinco marcadores. Usa R0 y la propuesta final R17, sin nuevas candidatas durante esta fase.

ID sugerido de campaña: `MOTOR17-CIERRE-20261018`, identidad externa, no versión deportiva.

### 14.1 Cantidades

| Bloque | Casos por versión | Versiones | Ejecuciones |
|---|---:|---:|---:|
| A · Natural | 66 pares × dos localías | 2 | 264 |
| B · Mecanismos | 12 EXP13 × dos semillas × dos variantes | 2 | 96 |
| C · Defensa | 6 ORG × 4 COB × una semilla/localía | 2 | 48 |
| D · Estados | 10 variantes LAB × dos semillas por familia | 2 | 40 |
| **Comparación principal** | **224** | **2** | **448** |
| Repeticiones diagnósticas preseleccionadas | 12 | 2 | 24 |
| Benchmarks §15: 100 + 200 | 300 | 2 | 600 |
| **Total previsto de cierre y coste** | | | **1.072** |

Los 24 diagnósticos y los 600 benchmarks no se añaden al universo natural. Los encuentros nuevos de desarrollo —hasta 72—, equivalencia, casos preparados, pruebas heredadas y reproducciones necesarias se cuentan por separado. Evita otra campaña masiva fuera de estas cantidades.

Esta auditoría es aproximadamente un tercio del volumen anterior, con un diagnóstico completo mucho más pequeño. No tiene la potencia de MOTOR-16 para todas las preguntas: conserva límites y no certifiques efectos universales con dos semillas.

### 14.2 Bloque A · Natural

EQ01–EQ12, doce jugadores y planes naturales MOTOR-11 preservados. Verifica que se cargan realmente, distinguiéndolos de los planes históricos EQ01/EQ02. No copies energía, Forma, momentos, faltas o memoria de un partido al siguiente.

Enumera los 66 pares no ordenados por ID en orden lexicográfico, `p=1…66`. Por par ejecuta H0 y H1:

`seed_A = 270000000 + 1000*p + 1`

Ambas localías comparten semilla, igual que R0/R17. Son 132 casos por versión. Importancia ordinaria, delegación/contexto de referencia y registro `world-essential`, relato omitido.

### 14.3 Bloque B · Mecanismos

Reutiliza EXP13-01…12 existentes: Pase +3, Triple +3, Visión/Decisiones +3, libertad, individual/2–3, presión normal/3⁄4, después del tiro 2/4, energía del referente, Forma, Consistencia, T y política del entrenador.

Conserva los actores, parejas y operaciones de su definición congelada. Para experimento `e=1…12`, `r=1,2`:

`seed_B = 280000000 + 1000*e + r`

Las dos variantes y las dos versiones comparten semilla. Usa las operaciones existentes, incluido `allowBaseOps` cuando ambos extremos tengan cambios. No conviertas un extremo bajo en «base intacta». Registro esencial.

### 14.4 Bloque C · Defensa

EQ01 intervenido frente a EQ11, localía fija EQ01 local. Planes naturales, ORG01…06 × COB01…04, semilla común **`290000001`** para las 24 celdas y ambas versiones.

ORG06: objetivo EQ11-J03, alternativa EQ11-J01 y fallback ORG02 existentes. Sin orden manual de cambio de objetivo. Conserva organización/cobertura solicitada y efectiva; una combinación aceptada no demuestra uso de la cobertura en todas las interacciones.

Esta muestra sirve para exposición y regresión de mecanismo, no para ordenar las defensas por calidad universal. No fuerces una cobertura incompatible ni cambies su validación para completar el cuadro. Registro esencial.

### 14.5 Bloque D · Estados

| Familia `f` | Escenario | Variantes |
|---|---|---|
| 1 | LAB11-02 | E100, E30, E08 del director. |
| 2 | LAB11-03 | J03-100, J03-30 del referente; sin VS-EQ12 multicausa. |
| 3 | LAB11-04 | Base, I02, I08. |
| 4 | LAB11-06 | Base, AGE, con las capacidades conservadas. |

Para cada familia `r=1,2`:

`seed_D = 300000000 + 1000*f + r`

Todas sus variantes y versiones comparten semilla. Conserva entradas del catálogo, diferencias exactas y aliases reales de variante si sustituyen guiones. Registro esencial.

### 14.6 Los doce casos diagnósticos por versión

Repite, con entradas/semilla idénticas y nivel diagnóstico completo, relato omitido:

- Bloque A: p=1 y p=6, ambos H0: dos casos.
- Bloque B: EXP13-04 r=1 V0/V1 y EXP13-07 r=1 V0/V1: cuatro casos.
- Bloque C: ORG01×COB01 y ORG02×COB01: dos casos.
- Bloque D: familia 1 r=1 E100/E08 y familia 2 r=1 J03-100/J03-30: cuatro casos.

Total: doce por versión, **24 repeticiones**. Selección previa al resultado. No sustituyas por partidos que confirmen la hipótesis.

Si el entrenador evita exponer una tarea con energía <10, declara esa cobertura; puedes comprobar la función pura con un contexto preparado identificado, sin obligar a mantener en pista al agotado para conseguir una auditoría verde.

### 14.7 Fallos

Conserva todos los fallos con entrada, semilla, intento, versión, traza y resultado parcial. No son derrotas ni marcadores finales válidos. No reintentes con otra semilla hasta conseguir un resultado favorable.

Para infraestructura puede haber un reintento idéntico identificado. Un fallo determinista se reproduce de forma mínima, sin otra batería de cien. Si cinco casos seguidos presentan la misma firma técnica, suspende ese bloque, conserva lo producido y continúa los independientes. No borres ni sustituyas evidencia fallida.

<a id="m17-15"></a>

## 15. Benchmarks y equivalencia

### 15.1 Medición real de 100 y 200

Ejecuta dos trabajos de coste en **cada versión R0/R17**, uno de cien y otro de doscientos: 600 ejecuciones reales en total.

Usa `world-essential`, relato omitido, cuatro workers cuando el entorno los admita, mismos controles de conciliación/huella y misma persistencia requerida. Declara ajustes de concurrencia; no llames «cuatro» a lo que se ejecuta con dos.

Entradas: los doce pares del ciclo de desarrollo, ahora con semillas nuevas. Para el caso `i=1…N`:

- Par `d = 1 + ((i−1) mod 12)`.
- Localía H0 en vueltas pares del ciclo y H1 en impares, empezando por H0; vuelta `floor((i−1)/12)`.
- Cien: `seed_100 = 310000000 + i`.
- Doscientos: `seed_200 = 320000000 + i`.

No son partidos preparados con menos acciones ni estados especiales. Cada caso empieza limpio, con sus planes naturales. R0/R17 tienen la misma agenda y semillas. Si necesitas un arnés breve, reutiliza fachada/pool y persistencia; no construyas un segundo ejecutor deportivo.

Mide pared desde despacho hasta último resultado persistido/validado, con preparación/arranque desglosados. Una precarga fuera del cronómetro también se informa. Devuelve tiempos por trabajo, throughput, memoria con alcance, tamaño y contadores de esfuerzo deportivo: posesiones, eventos, pasos y sorteos.

Cada trabajo de versión/tamaño parte de un proceso nuevo para que el arranque sea comparable. Publica también el total desde inicializar el trabajo y su pool hasta finalizarlo. El objetivo principal se evalúa con preparación, arranque, validación y persistencia incluidos; si solo se cumple en caliente o con una precarga externa, decláralo como resultado distinto, sin esconder ese coste.

Los perfiles finales pueden cambiar las trayectorias y el número de acciones. La comparación global R0/R17 mide el coste de las entregas completas; no aísla por sí sola la optimización.

### 15.2 Atribución exacta de la optimización

Sobre ocho entradas de desarrollo prefijadas —d=1…8, r=1— conserva comparación A17/P17 con mismos parámetros y observador. Deben coincidir hechos deportivos, acta, estados, dirección, reloj y RNG. Conserva también medidas comparables de esos trabajos; no extrapoles ocho casos a una garantía de escala.

Reutiliza la equivalencia existente de modalidades, velocidades x2–x16, registro y continuaciones. Si necesita cambios por nuevos campos, el observador no puede ocultar una diferencia deportiva. Cuenta las ejecuciones realmente realizadas, sin anunciar «ocho pares» si solo se comprobaron ocho salidas.

Incluye la referencia `20261016` con sus entradas históricas exactas y perfil final; reutiliza su ejecución dentro de esas comprobaciones cuando sea posible. Informa marcador, sorteos y huella observados. No sustituyas sus planes por los naturales ni ajustes para recuperar el 83–98.

### 15.3 Resultado del objetivo

Informa por separado:

- Cien en cinco segundos: alcanzado/no alcanzado en este entorno.
- Doscientos: medición real, no extrapolación.
- Mejora exacta A17/P17 y comparación global R0/R17, con sus límites.
- Memoria, arranque/persistencia y versión de Node/SO/CPU.

Si no se alcanza, sigue siendo pendiente de coste. No declares que hace falta otro motor sin aportar el diagnóstico ni cambies el alcance para cerrar la entrega.

<a id="m17-16"></a>

## 16. Datos y lectura automática de cierre

Conserva todos los esenciales de la campaña y benchmarks y los 24 diagnósticos completos. No hace falta duplicar el mismo dato en tres formatos. Reutiliza lotes, exportadores, conciliación, AUD01–32 y sensibilidad existentes, con las correcciones justificadas.

Ejecuta las AUD sobre los diagnósticos **separadas por versión** y conserva universo, implementación, registro, exposición, resultado y hallazgos. No mezcles R0/R17 para presentar un único «aprobado». Un inconcluso no se resuelve cambiándole el texto.

Entrega datos para estudiar, al menos:

| Área | Evidencia requerida |
|---|---|
| Identidad | Código, perfil, política, caso/variante/intento, semilla y nivel. |
| Marcadores | Actuaciones y encuentros; percentiles, extremos y prórrogas separadas. |
| Acta | Tiros, libres, faltas, pérdidas, robos, rebotes, tapones y asistencias por tipo. |
| Oportunidad | Sector, preparación, oposición/calidad y probabilidad final cuando esté registrada. |
| Ritmo | Relojes consumidos por acontecimiento, posesiones beM y estimadores con su definición. |
| Robos | Pérdidas por categoría, balón vivo/muerto, primer contacto/recuperador/control y crédito. |
| Rotación | Minutos, DNP, titularidad, funciones, tramos, motivos de relevo y estado usado al decidir. |
| Estados | Energía, Forma, Consistencia/momento, T e importancia en sus ámbitos, sin sumar bonus nuevos. |
| Táctica | Libro/libertad, director, organización/cobertura efectivas, presión, rebote/balance, memoria y saques. |
| Capacidades | Las 32, exposición, unidades y contraste exacto/aproximado diferenciados. |
| Coste | Pared/trabajos/fases, concurrencia, memoria, bytes y esfuerzo deportivo. |

Para la rotación calcula también la frecuencia de jugadores que completan todo el tiempo reglamentario y los DNP por jugador, sin convertir esas frecuencias en cuotas del motor.

Las métricas de eficacia táctica se acompañan de denominador y oportunidades. No ordenes coberturas por dos partidos ni exijas que cada intervención gane. Los resultados automáticos pueden adjuntarse sin escribir una interpretación deportiva extensa.

La igualdad al añadir diagnóstico se comprueba con el observador compatible, no comparando hashes de contrato distinto. Una firma de archivo no es una firma de entrada ni una trayectoria; se conservan separadas.

<a id="m17-17"></a>

## 17. Pruebas proporcionadas y recorrido manual

### 17.1 Automáticas

Reutiliza pruebas e invariantes existentes. Añade solo regresiones necesarias de los defectos demostrados y comprobaciones significativas de los nuevos contratos. No una prueba por fila, ficha o atributo que repita la implementación.

Prioridades:

- Crédito positivo/exclusiones y ausencia de dobles créditos.
- Cadena terminal de saque y bocina legítima.
- Identidades entre lotes y pertenencia de jugador, incluidas copias.
- Sensibilidad con límite, orientación y unidad correctos.
- Relevo realizable y conservación de estrella fatigada cuando siga siendo la mejor opción.
- Aislamiento de caché/estado y equivalencia A17/P17.

Ejecuta las comprobaciones finales requeridas por el repo —suite existente una vez sobre el código final, `data:check` y comprobador documental—, sin repeticiones por rutina. Si cambias implementación después, repite lo afectado y cualquier control obligatorio que haya quedado obsoleto.

La campaña se ejecuta sobre el código congelado que se entrega. Un resultado de tests de un commit anterior no certifica el último. No regeneres baselines para esconder una diferencia sin causa.

### 17.2 Navegador y Dennis

Si hay automatización disponible, haz un recorrido corto de las pantallas afectadas, no una campaña E2E nueva: perfil anterior/panel, candidata, un partido/análisis, auditorías y descarga. Captura errores de consola/red concretos. No atribuyas un 404 a favicon sin verificarlo.

Crea `docs/prompts/MOTOR-17-recorrido-manual.md` con comandos/URL reales, versiones, preparación, pasos, resultados esperados y señales de fallo. Debe permitir a Dennis:

1. Ver base anterior y activar explícitamente la propuesta.
2. Encontrar parámetros y diferencias de candidatas.
3. Comprobar una recuperación con su crédito en acta/análisis.
4. Ver decisiones de relevo del director y del referente fatigado.
5. Probar los tres modos y guardar/continuar con contratos compatibles.
6. Consultar análisis por audiencia, capacidades y cobertura real de AUD.
7. Ver y descargar el cierre y sus archivos.

Dennis realizará la mayor parte de la validación manual. No la marques ejecutada ni uses el recorrido antiguo pendiente como excusa para omitir las comprobaciones técnicas de esta entrega. Node 24 u otros navegadores no disponibles se declaran no ejecutados, sin instalar infraestructuras para completar una lista.

<a id="m17-18"></a>

## 18. Archivos para ChatGPT

Guarda evidencia fuera de Git, por ejemplo `out/motor17/`. Reutiliza el empaquetado y partición existentes; corrige defectos reales del exportador, sin crear otra plataforma.

### 18.1 Revisión rápida

**`MOTOR-17-revision-rapida.zip`**, objetivo orientativo ≤10 MiB comprimidos, sin truncar datos necesarios. Contendrá:

- `00-LEEME.md`: orden de lectura, mapa de casos, partes y comandos de verificación.
- Resumen operativo breve: base real, alcance realizado, defectos resueltos, cambios numéricos y pendientes. Sin ensayo deportivo.
- Inventario de hipótesis: confirmada/refutada/no resuelta, con archivo/caso y punto del código que la sustenta.
- Identidades R0/A17/P17/candidatas/R17 y Git final.
- Planes de desarrollo/cierre congelados, semillas y selección diagnóstica.
- Tabla de cambios: tipo crédito/registro/código deportivo/parámetro/optimización, antes/después, consumidores y causa.
- Resultados por ejecución, por equipo y por jugador; versiones y propósitos separables.
- Tablas comparativas automáticas existentes o cálculo mecánico reproducible; parejas e intervalos solo si están bien definidos.
- Auditorías, hallazgos, cobertura y matriz/sensibilidad de las 32 capacidades por versión.
- Embudo de pérdidas/recuperación/robo y tabla de cierres de saque.
- Rotaciones/DNP/minutos completos, tramos y motivos disponibles.
- Coste real de 100/200 y equivalencia, con fases/unidades/alcance.
- Pruebas/recorrido ejecutados y no ejecutados, logs y comandos exactos.
- Diccionario e índice de partes con tamaños reales y SHA-256.

Estos nombres describen responsabilidades, no requieren duplicar archivos equivalentes que el producto ya exporte. Un dato ausente se declara; no se fabrica una tabla vacía como cobertura.

### 18.2 Evidencia detallada

**`MOTOR-17-evidencia-detallada.zip`** o partes de tamaño objetivo 64 MiB, más **`MOTOR-17-indice-partes.json`** externo.

Incluye todos los esenciales, diagnósticos seleccionados, entradas completas, perfiles/variantes, fallos y reintentos, salidas AUD, equivalencia y benchmarks. Conserva las etapas mínimas necesarias para atribuir cambios; no incluyas de nuevo los 863 MiB de MOTOR-16.

Incluye código pertinente de solo lectura de R17, diff respecto a R0 y operaciones de sensibilidad/lectura afectadas, con dependencias locales y documentación de contrato. Si R0 no va incluido, identifica el commit y lo que haga falta para reproducirlo. No incluyas `.env`, secretos, `.git`, `node_modules` o otros repositorios.

Los datos deben permitir que ChatGPT profundice sin pedir otra campaña. La evidencia nueva, histórica, preparada, de desarrollo, de cierre y de coste queda identificada.

### 18.3 Verificación y entrega real

Usa comprobadores de lotes/auditoría donde reconozcan el formato, más apertura CRC, tamaños reales y SHA-256 de los contenedores/archivos. No declares que `batch:check` valida esenciales si no lo admite.

Comprueba claves globales, recuentos y referencias, parseo y unidades. Conserva fallos de validación; no los ocultes con otro comprobador que solo abre el ZIP.

Mide bytes, no longitud de texto. Evita dependencias circulares de hashes. Verifica el archivo final después de regenerar tablas o documentación incluida.

**Adjunta los ZIP reales o utiliza la descarga disponible.** No anuncies «te los he enviado» si solo están en `out/`. Si el entorno impide adjuntarlos, da rutas exactas y explica cómo obtenerlos; no publiques en servicios externos ni crees un endpoint nuevo sin necesidad.

Primero Dennis nos pasará el rápido y el índice; conserva las partes detalladas para no repetir simulaciones.

<a id="m17-19"></a>

## 19. Documentación, versiones y PR

Archiva íntegro este prompt MD en `docs/prompts/MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md` o la ruta equivalente del catálogo. Actualiza catálogo, estado, changelog y páginas temáticas afectadas, sin reescribir el funcional entero.

Crea `docs/tecnico/motor17.md` con hipótesis/evidencia, causas confirmadas, solución, parámetros, compatibilidad, coste, cobertura y límites. Debe poder consultarse por temas sin cargar cientos de páginas. Señala qué decisiones anteriores amplía/corrige y qué permanece provisional.

Actualiza la versión común de aplicación a MOTOR-17 y la identidad de motor conforme al sistema vigente. Si cambias acta o datos declarativos, versiona su política/perfil por separado; no inventes una migración implícita ni confundas extensión SEM con calibración validada.

El dataset de referencia no cambia por renombrar la entrega. Las candidatas tienen identidad/huella y diferencias propias. Si mantienes SEM, dilo claramente.

No subas paquetes masivos a Git. Versiona documentos e inventario compacto, con las referencias que permitan localizar el resultado. No afirmes que `out/` será recuperable desde otro clon.

Haz una PR concreta contra la base correcta, con problema, comportamiento final, cambios numéricos y validación real. Si hay dependencia de una rama aún no fusionada, declárala. No fusiones ni te suscribas.

<a id="m17-20"></a>

## 20. Aceptación y mensaje final

La entrega distingue:

- Implementación técnica completa/parcial y causas.
- Auditoría ejecutada/pendiente por bloque.
- Candidata numérica propuesta, aún sin aceptación deportiva definitiva.
- Objetivo de coste alcanzado/no alcanzado.
- Aceptación manual de Dennis pendiente/realmente realizada.

Una PR abierta o una suite verde no significa «motor cerrado». Tampoco es necesario inventar una mejora numérica para presentar la entrega.

### Mensaje final breve obligatorio

1. **Base, rama y PR:** commits reales y dependencias.
2. **Qué cambió:** defectos confirmados, hipótesis descartadas, parámetros antes/después y candidatas; referencia histórica observada con su perfil exacto.
3. **Qué puede probar Dennis:** arranque, activación explícita y enlace al recorrido.
4. **Auditoría realizada:** cantidades por bloque/versión/propósito, validez, fallos, reintentos y cobertura. Las cifras salen de los archivos finales.
5. **Rendimiento:** mediciones reales de cien/doscientos, entorno, memoria, equivalencia y estado del objetivo.
6. **Comprobaciones:** tests, datos/documentos, navegador y validadores realmente ejecutados.
7. **Archivos para ChatGPT:** rápido, índice y todas las partes, nombres/tamaños/descarga real.
8. **Pendientes:** causa, evidencia y alcance; sin redactar una auditoría deportiva extensa.

No modifiques el motor después de producir el paquete final sin identificar una nueva revisión y comprobar lo afectado. No propongas una nueva investigación de semanas ni otra campaña como sustituto de los archivos acordados.

**La última operación de trabajo de MOTOR-17 incluye ejecutar y empaquetar su auditoría final. No la dejes como un prompt futuro: necesitamos los resultados de esta entrega para analizarlos aquí.**
