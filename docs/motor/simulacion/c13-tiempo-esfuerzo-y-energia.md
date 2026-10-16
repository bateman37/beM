<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: simulacion](README.md) · Capítulo 13 — Tiempo, esfuerzo y energía
> Anterior: [c12-p02-tabla-1-seleccion-de-intenciones-y-participantes](c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md) · Siguiente: [c14-p01-forma-momento-individual-consistencia-y-presion](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md)
<!-- beM:nav-fin -->

<a id="cap-13"></a>

## 13. Tiempo, esfuerzo y energía

La duración triangular y los seis nodos energéticos de MD07 son la referencia inicial vigente. Los tiempos orientativos y coeficientes compatibles se conservan como semillas; los máximos por tarea y su evaluación siguen identificados.

<a id="grupo-13-01"></a>

### 13.1. Tiempo y estados: ACT01–ACT12

*Procedencia: MD07, §10.*

<a id="src-md07-l0398"></a>

#### 13.1.1. Duración triangular

*Origen: MD07 §10.1.*

La duración de un intervalo deportivo pertinente se describe mediante mínimo, valor habitual y máximo. La distribución triangular es la forma inicial elegida para esas referencias acotadas.

La configuración distingue contexto y desenlace: una pérdida temprana no descuenta el tiempo de un tiro previsto que no se produjo. Si una resolución resume preparación y acción, su duración ya incluye ese intervalo; no se añade otra vez la duración completa de cada tarea lógica.

El reloj disponible condiciona elegibilidad. No se comprime una acción larga a una fracción de segundo para que siempre quepa. Puede haber solución apresurada, otra alternativa o agotamiento del tiempo.

<a id="src-md07-l0406"></a>

#### 13.1.2. Tiempo detenido

*Origen: MD07 §10.2.*

Administración de libres, pausas e intervalos distinguen reloj de juego, secuencia administrativa y efectos de descanso. No reciben una duración aleatoria positiva de juego por usar una plantilla triangular.

Pausar la interfaz no es una pausa deportiva. El tiempo real que Dennis tarda en abrir un panel no recupera energía ni atenúa estados.

<a id="src-md07-l0412"></a>

#### 13.1.3. Curva inicial aceptada como semilla

*Origen: MD07 §10.3.*

| Energía | Severidad |
|---:|---:|
| 100 | 0,00 |
| 70 | 0,01 |
| 50 | 0,10 |
| 30 | 0,30 |
| 10 | 0,65 |
| 0 | 1,00 |

Se conserva la interpolación por tramos del ejemplo de MD05 como forma inicial legible. La severidad aplica una fracción del efecto máximo de cada tarea. No representa una resta igual de puntos 1–30 ni un porcentaje universal de talento.

La forma de la curva queda concretada como precarga provisional. Los máximos por tarea y la carga deben completarse y evaluarse conjuntamente. Con energía 30 un titular puede seguir siendo la mejor alternativa; el deterioro pertinente no desaparece por mantenerlo.

<a id="grupo-13-02"></a>

### 13.2. Energía: reserva, curva y efectos

*Procedencia: MD05, §8.*

<a id="src-md05-l0477"></a>

#### 13.2.1. Concepto cerrado

*Origen: MD05 §8.1.*

Energía es la batería actual del jugador, de 0 a 100. Resistencia es su capacidad estable para sostener carga comparable. Forma es otro estado. Un jugador puede llegar con energía alta y mala forma, o buena forma y batería reducida.

No todos deben empezar en 100. El motor recibe el valor inicial y aplica gasto y recuperación. La procedencia de esa disponibilidad entre encuentros se integrará con el manager sin duplicarla dentro del partido.

<a id="src-md05-l0483"></a>

#### 13.2.2. Curva exigida por Dennis

*Origen: MD05 §8.2.*

- **Entre 100 y 70:** efecto casi imperceptible en rendimiento.
- **Por debajo de ese tramo:** deterioro creciente, continuo y selectivo.
- **En reservas muy bajas:** el coste se vuelve mucho mayor.
- **Por debajo de 10:** deterioro muy considerable en las tareas sensibles.

No existe un salto que convierta E = 69 en un jugador distinto de E = 70. Tampoco se aplica una resta lineal desde 100. La forma de la curva debe poder verse y modificarse en el panel.

<a id="src-md05-l0492"></a>

#### 13.2.3. Representación administrable recomendada

*Origen: MD05 §8.3.*

Se define una curva monótona de severidad `g(E)`, entre 0 y 1, mediante nodos editables e interpolación continua. La tabla siguiente es **un perfil inicial provisional aceptado como semilla de precarga en MD07**, no una escala fisiológica ni una pérdida porcentual universal de habilidad.

| Energía E | Severidad g(E), semilla provisional | Lectura funcional |
|---:|---:|---|
| 100 | 0,00 | Sin deterioro por reserva. |
| 70 | 0,01 | Tramo prácticamente neutro. |
| 50 | 0,10 | El desgaste empieza a tener efecto más reconocible. |
| 30 | 0,30 | Coste importante que depende de la tarea. |
| 10 | 0,65 | Reserva crítica. |
| 0 | 1,00 | Máxima severidad del perfil en tareas sensibles. |

La pendiente se intensifica hacia reserva muy baja. Los nodos pueden refinarse sin crear nuevos estados ni un ciclo por segundos. Una interpolación lineal por tramos continua es suficiente como representación inicial; una suavización técnica no debe alterar inadvertidamente sus valores ni producir sobreoscilaciones.

Los límites 0 y 100 pertenecen al concepto de reserva. Los valores interiores de severidad y los máximos por tarea son administrables. Las restricciones de monotonía y continuidad se validan.

<a id="src-md05-l0509"></a>

#### 13.2.4. Severidad no equivale a restar igual a las 32 capacidades

*Origen: MD05 §8.4.*

La curva alimenta el efecto máximo declarado de cada tarea o componente sensible. Por ejemplo, una severidad de 0,30 aplica el 30 % del deterioro máximo configurado para esa intervención; no reduce todas las notas del jugador un 30 %.

| Ámbito | Orientación funcional |
|---|---|
| Primer paso y esfuerzos repetidos | Sensibilidad alta a reserva baja. |
| Retorno, persecución y recuperación | Sensibilidad pertinente al esfuerzo requerido. |
| Contacto, equilibrio y disputa sostenida | Sensibilidad según tarea y oposición. |
| Preparación exigente del tiro | Puede deteriorarse con fatiga de manera contextual. |
| Precisión técnica | Efecto selectivo; no se convierte automáticamente en el mismo castigo que explosividad. |
| Visión y conocimiento táctico | No se borran por cansancio. Si una tarea falla por llegar tarde, se representa ese límite físico. |
| Decisiones/concentración | Solo efectos declarados y pertinentes; no una segunda penalización global oculta. |

En reservas inferiores a 10, la suma de consecuencias pertinentes debe ser claramente apreciable. No basta con aplicar una décima decorativa. Aun así, no se convierte todo intento en fallo ni se decreta una lesión por alcanzar una cifra.

Los antiguos máximos provisionales de resta del Documento 03 no quedan blindados. Deben revisarse junto a la nueva curva para cumplir esta exigencia; cambiar solo el umbral y dejar un deterioro máximo insignificante no cumpliría la decisión.

<a id="src-md05-l0527"></a>

#### 13.2.5. Gasto y recuperación

*Origen: MD05 §8.5.*

El gasto se calcula sobre tiempo de juego realmente transcurrido y carga pertinente. Las tareas sin balón también pueden consumir. La intensidad y la presión defensiva tienen un coste que debe aparecer en sus perfiles de carga, sin volver a cobrar el mismo esfuerzo por cada fase lógica.

Resistencia modifica el gasto relativo bajo carga comparable. No añade batería extra por encima de 100 ni se convierte en un bonus directo de anotación.

Se conservan como semillas revisables del Documento 03: gasto neutral 2 unidades/minuto, factor de carga 0,85–1,35, recuperación de banquillo 1,5/minuto de juego, +2 por tiempo muerto, +4 por intervalo corto y +10 por descanso largo. El descanso largo sustituye el incremento corto correspondiente; no se suman ambos por el mismo descanso.

Son aproximaciones de diseño. La configuración debe declarar sus unidades, máximos y si una recuperación depende de duración, tipo de pausa o límite. No se aplican de nuevo por detener o reabrir la interfaz.

<a id="src-md05-l0537"></a>

#### 13.2.6. Ejemplos de interpretación

*Origen: MD05 §8.6.*

Un jugador con E = 85 y otro equivalente con E = 75 deben comportarse de manera muy parecida por reserva. Las diferencias de oposición o azar pueden dominar ese pequeño efecto.

Un jugador con E = 30 paga un deterioro real, pero puede mantener mejor pase, lectura, amenaza o defensa útil que su sustituto. El criterio de rotación compara contribución actual, no barras de energía.

Un jugador con E = 7 debe tener dificultades muy visibles para las tareas sensibles que le exige el plan. Mantenerlo puede seguir siendo una decisión del entrenador si es elegible, pero el motor no le perdona el coste porque sea importante ni fuerza automáticamente todas sus acciones al fracaso.

<a id="src-md05-l0545"></a>

#### 13.2.7. Comprobaciones del panel

*Origen: MD05 §8.7.*

La auditoría debe mostrar curvas por tarea y casos de referencia en E = 100, 85, 70, 50, 30, 10 y 5. Debe comparar ejecución y participación, no solo puntos finales.

Se comprueba que el desgaste no depende de cuántas frases se generaron; que no se cobra dos veces el mismo intervalo; que un cambio de intensidad altera carga pertinente; y que el sistema de rotación puede mantener justificadamente al jugador con 30.

<a id="grupo-13-03"></a>

### 13.3. Tabla 3: tiempo, esfuerzo y estados

*Procedencia: MD03, §10.*

<a id="src-md03-l0436"></a>

| Elemento | Actualización requerida | Coherencia que preserva |
|---|---|---|
| Tiempo de juego | Consumir hasta el hecho real | Pérdida temprana y tiro previsto no tienen igual duración |
| Reloj de posesión | Consumir, mantener o reajustar por causa | Recuperación, falta, fuera y rebote no se confunden |
| Saque | Administrar preparación, ejecución y puesta en marcha | Tiempo de balón muerto y de juego distinguibles |
| Libres | Resolver serie y reanudación | Intermedios y último libre con continuidad distinguibles |
| Final de periodo | Completar hechos válidos pendientes | El cierre no elimina automáticamente un lanzamiento ya efectuado |
| Continuidad ofensiva | Mantener o reorganizar cuando corresponda | Ventaja, reloj, participantes y oposición actual |
| Cambio de ataque | Crear contexto desde origen real | Transición posible y defensa organizada distinguibles |
| Energía | Carga por tiempo, intensidad y tarea | Esfuerzo con y sin balón |
| Resistencia | Modificar desgaste a carga comparable | Una función de sostenibilidad, sin segundo bonus general |
| Descanso | Recuperación prevista en banquillo e intervalos | Evolución gradual |
| Forma | Estado persistente entre partidos y etapas | Capacidad permanente separada de rendimiento actual |
| Momento | Variación breve, limitada y contextual | Rachas sin cadena automática por canasta |
| Consistencia | Amplitud de altibajos temporales | No confundir estabilidad con talento |
| Presión | Importancia y tensión contextual | Partido importante y final apretado no son idénticos |
| Memoria | Patrones recientes con pérdida de relevancia | Respuesta limitada y reconocible |
| Rotación | Cambios legales de participantes y funciones | Quinteto, director y responsabilidades reales |
| Faltas/disponibilidad | Faltas, sanciones y posibles salidas | Elegibilidad y reorganización |
| Entrenador automático | Ajustes con información disponible | Coherencia y adaptación sin conocimiento del futuro |
| Registro | Hechos y contribuciones resueltas | Una fuente para relato, diagnóstico y futura estadística |
| Periodos/prórrogas | Administrar comienzo y cierre | Continuidad reglamentaria del partido |

<a id="src-md03-l0461"></a>

#### 13.3.1. Momento real del acontecimiento

*Origen: MD03 §10.1.*

La duración prevista de una intención no se descuenta si el acontecimiento ocurre antes. Tiempo, minuto individual y esfuerzo deben usar la duración efectiva pertinente.

La gestión del reloj puede forzar una ejecución apresurada. Si su dificultad ya está representada en la calidad final, no se añade otra penalización idéntica por urgencia.

<a id="src-md03-l0467"></a>

#### 13.3.2. Rebote y continuidad

*Origen: MD03 §10.2.*

Tras una captura ofensiva puede existir una finalización rápida o una reorganización. El contexto decide si hay tiempo y oposición. Se conservan los participantes y consecuencias pertinentes; no se vuelve por defecto a un tiro genérico.

El cierre puede facilitar que capture un compañero. Por eso deben existir un efecto colectivo de posición y una atribución de la captura compatibles, sin premiar dos veces la misma posición.

<a id="grupo-13-04"></a>

### 13.4. Energía, forma, momento y las 32 capacidades

*Procedencia: MD04, §28.*

<a id="src-md04-l1560"></a>

#### 13.4.1. Lectura funcional de la fatiga

*Origen: MD04 §28.2.*

El análisis puede cruzar tiempo acumulado, descansos, intensidad, tareas y oportunidades con la energía conocida. No afirma que cada fallo final sea cansancio ni que el jugador con más minutos sea quien más energía gastó.

Se desea distinguir carga resuelta y producción observada. La fórmula de desgaste pertenece al motor; la estadística puede conservar sus resultados para análisis autorizado. No se recalcula fatiga desde puntos o tiros como un modelo paralelo.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c12-p02-tabla-1-seleccion-de-intenciones-y-participantes](c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md) · Siguiente: [c14-p01-forma-momento-individual-consistencia-y-presion](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md)
