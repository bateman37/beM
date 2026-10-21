<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: jugadores](README.md) · Capítulo 6 — Experiencia, veteranos y desarrollo
> Anterior: [c05-tendencias-individuales-y-decisiones](c05-tendencias-individuales-y-decisiones.md) · Siguiente: [c07-p01-estructura-de-la-configuracion-tactica](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md)
<!-- beM:nav-fin -->

<a id="cap-06"></a>

## 6. Experiencia, veteranos y desarrollo

<a id="grupo-06-01"></a>

### 6.1. Experiencia: historial que contribuye al aprendizaje

*Procedencia: MD02, §14.*

<a id="src-md02-l0671"></a>

#### 6.1.1. Decisión adoptada

*Origen: MD02 §14.1.*

La experiencia se mantiene fuera de las 32 capacidades.

Se acumula mediante participación real, principalmente minutos de competición. La edad no es una medida suficiente: cumplir años con poca participación no produce la misma oportunidad de aprendizaje.

Su efecto principal pertenece al desarrollo de capacidades actuales. El partido utiliza después esas capacidades.

<a id="src-md02-l0679"></a>

#### 6.1.2. Dónde puede contribuir

*Origen: MD02 §14.2.*

| Capacidad | Contribución posible del aprendizaje |
|---|---|
| Comprensión táctica | Aprender responsabilidades, entradas y respuestas dentro del juego |
| Anticipación | Reconocer patrones y prever acciones probables |
| Decisiones | Elegir con mejor criterio tras situaciones vividas |
| Visión de juego | Aprender qué relaciones y opciones merecen atención |
| Rendimiento bajo presión | Desenvolverse mejor ante contextos exigentes, con diferencias individuales |

Estas son vías de desarrollo, no incrementos automáticos por alcanzar una edad o un contador.

La experiencia no eleva por defecto concentración, consistencia o serenidad. Haber jugado mucho no garantiza haber aprendido bien ni tener un techo alto.

<a id="src-md02-l0693"></a>

#### 6.1.3. Límites

*Origen: MD02 §14.3.*

- Mejoras con rendimientos decrecientes.
- Límites y posibilidades individuales.
- Participación como oportunidad de aprendizaje, no como garantía de puntos.
- Historial acumulado distinto de capacidad actual.
- Posibilidad de jóvenes con grandes mentales desde pronto.
- Posibilidad de veteranos que no han desarrollado recursos suficientes.
- Ausencia de bonus general adicional durante el encuentro.

La experiencia histórica puede seguir aumentando mientras una capacidad actual se mantiene o incluso disminuye. Son datos distintos.

<a id="src-md02-l0705"></a>

#### 6.1.4. Diferencia respecto a Basket Manager

*Origen: MD02 §14.4.*

El diseño anterior otorgaba un bonus acotado a mentales bajo presión. No se traslada a beM.

Si experiencia ya ha contribuido a Decisiones o Rendimiento bajo presión, sumar otro bonus general contaría dos veces parte de la ventaja.

Dos jugadores con las mismas capacidades, estados, cuerpo y contexto no obtienen una diferencia directa por el número histórico de experiencia.

<a id="src-md02-l0713"></a>

#### 6.1.5. Lo que sigue pendiente

*Origen: MD02 §14.5.*

Escala de experiencia, forma de mostrarla, ponderación de minutos y competiciones, relación con entrenamiento, márgenes de desarrollo y fórmulas de progreso.

No se aprueba un contador de situaciones especiales por rival, una capacidad para cada contexto vivido ni otro sistema complejo de aprendizaje dentro del partido.

En el laboratorio se podrán construir perfiles veteranos directamente mediante sus capacidades y estados. No hará falta simular veinte temporadas para probar su comportamiento deportivo.

<a id="grupo-06-02"></a>

### 6.2. Veteranos y envejecimiento

*Procedencia: MD02, §15.*

<a id="src-md02-l0723"></a>

#### 6.2.1. Comportamiento que el sistema debe permitir

*Origen: MD02 §15.1.*

Un jugador de 40 años con menor explosividad puede seguir siendo útil por anticipación, lectura, decisiones, técnica y adaptación del rol.

La compensación debe verse en preparación y elección. No se convierte una gran anticipación en velocidad o salto ficticios.

Los siete mentales aprobados son suficientes para este objetivo si tienen los efectos descritos. No se añaden posicionamiento, experiencia o inteligencia como nuevas capacidades que repitan su función.

<a id="src-md02-l0731"></a>

#### 6.2.2. Ejemplos funcionales

*Origen: MD02 §15.2.*

| Perfil | Ventaja que puede conservar | Límite que debe mantenerse |
|---|---|---|
| Base veterano | Reconoce presión y suelta el pase antes de quedar atrapado | Si retiene el balón y necesita escapar por aceleración, queda expuesto |
| Pívot veterano | Prevé la disputa, gana posición y cierra el rebote | Si llega tarde a un balón alto, su menor salto importa |
| Interior pasador | Utiliza recepciones para activar cortes y compañeros | Su buena lectura no garantiza ejecutar un pase difícil |
| Tirador veterano | Selecciona y prepara oportunidades compatibles con su técnica | Puede sufrir persiguiendo a un rival rápido o corriendo continuamente |

La colocación anticipada puede reducir la necesidad de un esfuerzo de emergencia. No elimina la ejecución posterior ni las ventajas físicas del rival.

<a id="src-md02-l0742"></a>

#### 6.2.3. Evolución por capacidades

*Origen: MD02 §15.3.*

La velocidad, aceleración, salto, fuerza, resistencia, técnica y lectura pueden tener evoluciones diferentes. No se reduce todo mediante un único factor por cumpleaños.

Cada jugador debe poder tener una trayectoria distinta. No se presupone que todos lleguen a 40 con mentales altos ni que todos mantengan igual la fuerza o la técnica.

Los estudios de carreras NBA muestran diferencias de trayectoria entre jugadores y grupos [MD02-S7](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#ref-md02-s7). No justifican imponer una edad única de declive o una mejora mental automática.

<a id="src-md02-l0750"></a>

#### 6.2.4. Edad y resolución del partido

*Origen: MD02 §15.4.*

La edad interviene en el sistema de evolución cuando se diseñe. El encuentro utiliza las capacidades y estados actuales.

No se añade una penalización adicional por tener 40 años después de haber reducido sus físicas. Tampoco una bonificación por veterano después de haber representado su buena lectura.

No se trasladan las edades, escalas de potencial ni reglas de decadencia de LIFE del proyecto anterior.

<a id="src-md02-l0758"></a>

#### 6.2.5. Encaje táctico y rotaciones

*Origen: MD02 §15.5.*

El entrenador puede aprovechar al veterano mediante un rol y una carga adecuados. Pedirle presión continua o persecución exterior puede revelar sus limitaciones.

La energía, el estado de forma y el momento también se aplican al veterano. Tener experiencia no lo protege automáticamente de cansancio, malas etapas o fallos.

Un joven con atributos físicos altos puede aprovechar espacios y ritmos que el veterano no sostiene. El motor debe permitir ventajas diferentes, sin declarar superior a un perfil por su edad.

<a id="grupo-06-03"></a>

### 6.3. Energía, forma, momento y las 32 capacidades

*Procedencia: MD04, §28.*

<a id="src-md04-l1617"></a>

#### 6.3.1. Experiencia, edad y veteranos

*Origen: MD04 §28.6.*

La experiencia se expresa mediante capacidades reales y decisiones del jugador, según los documentos anteriores. No se añade una bonificación invisible al acta ni una estadística de «puntos por experiencia».

El informe puede mostrar a un veterano con menos llegada física y buena lectura, pase, organización, colocación o cierre registrados. Su edad no modifica retrospectivamente los créditos; tampoco permite al resumen elogiar funciones que no desempeñó.

Una comparación por edad/etapa puede ser útil para historia y ojeo. El grupo de edad es un filtro descriptivo; la ejecución usa las capacidades y estados actuales ya definidos.

### Nota de implementación MOTOR-18 (Familiaridad, Polivalencia y aprendizaje)

Se amplía el funcional con conocimiento persistente de posiciones, roles y sistemas (62 niveles con `level`, `peak` y `lastPracticeDay`) y con el rasgo de desarrollo **«Polivalencia · aprendizaje táctico»** (1–30, semilla 16), separado de las 32 capacidades. La Polivalencia y la enseñanza del entrenador actúan **entre partidos**; no hay bono automático de veterano ni penalización por juventud, y el desuso y el reaprendizaje son reglas de producto SEM18 (posición 30 sin práctica durante 3650 días → 26,4), no medición científica. Detalle: `docs/tecnico/motor18.md`.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c05-tendencias-individuales-y-decisiones](c05-tendencias-individuales-y-decisiones.md) · Siguiente: [c07-p01-estructura-de-la-configuracion-tactica](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md)
