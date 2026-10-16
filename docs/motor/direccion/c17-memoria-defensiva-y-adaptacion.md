<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: direccion](README.md) · Capítulo 17 — Memoria defensiva y adaptación
> Anterior: [c16-p02-tres-politicas-iniciales-de-entrenador](c16-p02-tres-politicas-iniciales-de-entrenador.md) · Siguiente: [c18-reglamento-y-administracion-deportiva](../reglamento/c18-reglamento-y-administracion-deportiva.md)
<!-- beM:nav-fin -->

<a id="cap-17"></a>

## 17. Memoria defensiva y adaptación

<a id="grupo-17-01"></a>

### 17.1. Memoria colectiva y adaptación

*Procedencia: MD05, §13.*

<a id="src-md05-l0872"></a>

#### 17.1.1. Estructura cerrada

*Origen: MD05 §13.1.*

Cada defensa mantiene un resumen colectivo pequeño de patrones deportivos observados, con relevancia gradual. No hay memoria independiente completa por jugador, pareja y variante.

El registro completo del partido sirve a estadísticas y auditorías. La memoria utilizada para responder utiliza un resumen acotado. Tener miles de hechos en el historial no obliga a examinarlos antes de cada decisión.

<a id="src-md05-l0878"></a>

#### 17.1.2. Qué identifica un patrón

*Origen: MD05 §13.2.*

| Nivel | Información | Utilidad |
|---|---|---|
| General | Familia o recurso, tipo de oportunidad y salida repetida. | Reconocer una conducta aunque cambie el nombre de la ficha. |
| Específico | Protagonistas y contexto que cambian realmente el problema. | Preparar una respuesta a una relación concreta. |

Las decisiones espontáneas también pueden generar un patrón: el mismo anotador busca repetidamente su suspensión al llegar, o se repite la penetración al mismo espacio. No necesitan una ficha con nombre para que la defensa aprenda.

Cambiar un secundario no borra toda señal. Cambiar de continuación interior a salida exterior puede ser una respuesta deportiva auténtica. La identidad semántica la declaran las fichas y los recursos comunes; no requiere un clasificador de aprendizaje automático.

<a id="src-md05-l0889"></a>

#### 17.1.3. Contenido mínimo del resumen

*Origen: MD05 §13.3.*

- Patrón y protagonistas pertinentes.
- Repetición/recencia resumidas.
- Oportunidad obtenida, no solamente si entró el tiro.
- Respuesta defensiva utilizada y lo que concedió.
- Continuación ofensiva relevante.
- Último ajuste y su contexto.

No se conserva un árbol de todos los futuros ni las capacidades históricas completas en cada patrón.

<a id="src-md05-l0900"></a>

#### 17.1.4. Perfil provisional y decaimiento

*Origen: MD05 §13.4.*

Se conserva como semilla un límite de hasta ocho resúmenes relevantes por defensa y una pérdida apreciable de relevancia en torno a seis–ocho ataques rivales sin repetición. Son parámetros de diseño, no estimaciones de memoria humana.

La relevancia decae gradualmente, satura y puede reemplazarse por otra señal más pertinente. El número de patrones no limita cuántas fichas puede tener el libro. Los controles del panel deben mantener esta estructura pequeña; aumentar la cifra por comodidad no es una mejora demostrada.

<a id="src-md05-l0906"></a>

#### 17.1.5. Qué cambia por reconocer

*Origen: MD05 §13.5.*

La memoria modifica la preparación de una respuesta compatible: negar cierta recepción, estar atento a una continuación, orientar, anticipar una ayuda o proponer un cambio permitido de cobertura.

La respuesta debe ejecutarse con las capacidades y responsabilidades reales. Reconocer no concede velocidad ni lectura perfecta. El efecto aparece en opciones y oposición; no se aplica después una penalización extra de acierto por «repetición».

Si la respuesta exige cambiar el plan, debe pasar por la política de entrenador y su aplicación válida. Los jugadores pueden preparar mejor una responsabilidad compatible; no sustituyen invisiblemente una organización por otra.

<a id="src-md05-l0914"></a>

#### 17.1.6. La cuarta repetición puede funcionar

*Origen: MD05 §13.6.*

No hay contador que decrete que la cuarta utilización falla. Puede ser menos favorable si la defensa ha reconocido, elegido y ejecutado una respuesta eficaz. Puede seguir funcionando porque el atacante es mejor, la defensa no llega, la respuesta concede otra salida o simplemente el desenlace favorece al ataque.

La variedad se favorece mediante consecuencias deportivas, preferencias y lectura. No mediante cuotas, prohibiciones arbitrarias ni rendimientos decrecientes aplicados al nombre de una jugada.

<a id="src-md05-l0920"></a>

#### 17.1.7. Pausas, periodos y cambios

*Origen: MD05 §13.7.*

Un tiempo muerto puede permitir comunicar un ajuste; no borra la memoria. Una sustitución modifica ejecutores y aplicabilidad de señales específicas, conservando lo colectivo que siga siendo pertinente.

El cambio de cuarto no impone olvido total. La política de decaimiento y la continuidad del partido determinan qué se conserva. Tras finalizar, una futura base de scouting entre encuentros sería otro sistema del manager, no una memoria ilimitada introducida ahora.

<a id="grupo-17-02"></a>

### 17.2. Ejemplos funcionales integrados

*Procedencia: MD05, §22.*

<a id="src-md05-l1697"></a>

#### 17.2.1. Patrón repetido que aún funciona

*Origen: MD05 §22.7.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

El mismo anotador ha buscado varias veces una suspensión temprana. La defensa reconoce el patrón, intenta orientar de otra manera y llega mejor a la siguiente ejecución.

El anotador puede ver la ayuda y pasar, atacar otra salida o volver a tirar. La cuarta repetición puede entrar. El efecto defensivo se observa en la oportunidad, no en un veto de resultado ni en una resta adicional por el contador.

Cambiar el nombre de una ficha no cambia el reconocimiento. Una modificación real de la salida puede cambiar qué respuesta sirve.

<a id="grupo-17-03"></a>

### 17.3. Memoria: MEM01–MEM04

*Procedencia: MD07, §12.*

<a id="src-md07-l0484"></a>

#### 17.3.1. Perfil inicial

*Origen: MD07 §12.1.*

Se mantiene como semilla el límite de hasta ocho patrones relevantes por defensa. La referencia histórica de pérdida apreciable tras seis–ocho ataques sin repetición orienta el perfil; falta cargar su curva exacta compatible con las unidades elegidas.

El número de patrones no limita el libro. El resumen conserva señal, participantes pertinentes, recencia, oportunidad, respuesta y concesión. El historial extenso se consulta fuera del contexto activo.

<a id="src-md07-l0490"></a>

#### 17.3.2. Respuesta deportiva

*Origen: MD07 §12.2.*

Reconocer puede orientar cobertura, negación o ayuda compatibles. Deben intervenir participantes y capacidades reales. Una cuarta repetición puede funcionar y una primera puede ser bien defendida.

No existe una resta automática de acierto por alcanzar un contador. Tampoco se aplica una penalización de reconocimiento y otra idéntica de cobertura si ambas expresan la misma consecuencia.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c16-p02-tres-politicas-iniciales-de-entrenador](c16-p02-tres-politicas-iniciales-de-entrenador.md) · Siguiente: [c18-reglamento-y-administracion-deportiva](../reglamento/c18-reglamento-y-administracion-deportiva.md)
