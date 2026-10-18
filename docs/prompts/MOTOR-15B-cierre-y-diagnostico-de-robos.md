# MOTOR-15B — Cierre de MOTOR-15 y diagnóstico técnico de robos

**Destinatario:** Claude Code, repositorio `bateman37/beM`.

**Mandato aprobado por Dennis:** completa los cuatro cierres identificados en la revisión de MOTOR-15 y revisa técnicamente la cadena que produce y acredita los robos. Corrige defectos demostrados y consecuencias reglamentarias ya definidas. Conserva los coeficientes deportivos para que MOTOR-16 pueda auditarlos y MOTOR-17 aplique las decisiones de calibración.

**Entrega:** MOTOR-15B. Es una corrección acotada sobre MOTOR-15, no una nueva fase de construcción del motor ni la campaña masiva.

**Base de este encargo:** informe de MOTOR-15, sus dos paquetes y revisión independiente de ChatGPT. ChatGPT no ha inspeccionado directamente el código de la PR para redactarlo. Confirma en el repositorio las rutas y contratos físicos antes de modificarlos.

## Índice

1. [Alcance, reglas y decisiones cerradas](#m15b-01)
2. [Base Git y conservación](#m15b-02)
3. [Hechos de la revisión y lectura dirigida](#m15b-03)
4. [Cierre 1: normativa y consecuencia pendiente](#m15b-04)
5. [Cierre 2: procedencia de auditorías y energía crítica](#m15b-05)
6. [Cierre 3: equivalencia y alcance de la evidencia](#m15b-06)
7. [Robos: diagnóstico y correcciones autorizadas](#m15b-07)
8. [Rendimiento: cifras correctas y alcance limitado](#m15b-08)
9. [Versiones, perfiles y referencias](#m15b-09)
10. [Comprobaciones automáticas proporcionadas](#m15b-10)
11. [Navegador y recorrido manual](#m15b-11)
12. [Cierre 4: documentación y commit verificado](#m15b-12)
13. [Archivos que debes devolver](#m15b-13)
14. [Integridad y preparación de MOTOR-16](#m15b-14)
15. [Aceptación y estados de salida](#m15b-15)
16. [Mensaje final para Dennis y ChatGPT](#m15b-16)

<a id="m15b-01"></a>

## 1. Alcance, reglas y decisiones cerradas

### 1.1 Cinco bloques concretos

| Bloque | Trabajo autorizado | Resultado esperado |
|---|---|---|
| C1 | Cerrar la consecuencia pendiente de interferencia en el último libre y precisar las referencias del art. 45. | Administración común ejecutable y procedencia normativa correcta. |
| C2 | Corregir la selección/procedencia de evidencia para auditorías; leer la energía crítica existente y clasificar AUD26. | Conclusiones vinculadas a los encuentros realmente analizados. |
| C3 | Alinear informe, comparaciones y pruebas de equivalencia del registro esencial y trabajadores. | Cada igualdad declara exactamente qué se comparó y dónde está su evidencia. |
| C4 | Vincular verificaciones al código final, actualizar páginas temáticas y corregir informes contradictorios. | Documentación y devolución que describen la misma entrega. |
| R | Revisar oportunidades, intervenciones, recuperaciones y crédito de robo. | Explicación de la cifra baja y corrección de errores demostrados, sin calibrar tasas. |

### 1.2 Reglas que se mantienen

- Trabaja exclusivamente en beM. No inspecciones `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios. Puedes consultar las fuentes primarias incluidas aquí.
- Mantén resolución por acontecimientos dentro de posesiones, contexto pequeño y operaciones compartidas. No añadas ticks, física continua ni movimiento de diez jugadores.
- Conserva las 32 capacidades y sus ámbitos. No añadas atributos, overall, disciplina arbitral, un estado deportivo nuevo ni un mecanismo de compensación del marcador.
- Conserva el motor único de completo/reducido/esencial y el pool local existente. No diseñes ahora otro resolutor del mundo.
- No calibres acierto, robos, pérdidas, ritmo, faltas, energía ni las semillas SEM15. No cambies una probabilidad para que una media se acerque a una referencia.
- No generes errores arbitrales aleatorios, conductas técnicas naturales o desvíos de asistencia para completar cobertura.
- Puedes corregir una condición, conexión, crédito, denominador o consumidor incorrectos si aportas evidencia reproducible del defecto y de la corrección.
- Mantén controles numéricos en datos administrados. Una consecuencia reglamentaria no se convierte en una probabilidad ajustable.
- Preserva perfiles protegidos, planes, variantes, guardados y archivos históricos. No borres almacenamiento ni actives/migres perfiles en silencio.
- Pruebas automáticas justas y útiles. Dennis hará mucha revisión manual. Reutiliza la suite y las ejecuciones; no una campaña por cada fila.
- Archiva el prompt en MD y mantén los índices. No fusiones, publiques una release, te suscribas a la PR ni envíes mensajes a terceros.

### 1.3 Precedencia y límite de autonomía

Este encargo precisa MOTOR-15 en los puntos anteriores y prevalece ahí. El resto del funcional y sus decisiones siguen vigentes.

Resuelve decisiones técnicas locales y reversibles. Un ajuste de frecuencia o una ampliación deportiva no se deducen de la necesidad de poner una auditoría en verde: se registran para MOTOR-16/17.

No entregues otro listado genérico de «decisiones requeridas» sobre lo ya resuelto aquí. Si aparece una excepción real no cubierta, identifica supuesto, efecto, evidencia y dato exacto que falta, y continúa el trabajo independiente.

<a id="m15b-02"></a>

## 2. Base Git y conservación

El último informe sitúa MOTOR-15 en la PR `bateman37/beM#16`, abierta sin fusionar, rama `claude/busy-edison-b1fmnc`, último commit declarado `5aefaab`. Contrasta el estado actual:

- Si esa PR sigue abierta y contiene la entrega, continúa sobre su rama real y añade el cierre MOTOR-15B a la misma PR.
- Si MOTOR-15 ya está fusionado, parte de `main` actualizado y crea una rama/PR MOTOR-15B.
- Si el entorno impone otra rama, úsala y declara base, relación y destino correctos. No dupliques entregas ni descartes cambios ajenos.

Registra estado inicial y commit. No reinicies una rama con trabajo sin preservar ni reconstruyas MOTOR-15 únicamente desde el resumen.

Conserva los paquetes y reportes MOTOR-15 originales. Una devolución MOTOR-15B nueva no los sobrescribe ni presenta sus ejecuciones como nuevas.

Los ZIP de referencia se llaman `MOTOR-15-revision-rapida.zip` y `MOTOR-15-evidencia-detallada.zip`. Usa los disponibles en el entorno o adjuntos; los nombres no implican que existan en un checkout nuevo.

Si falta material masivo no versionado, busca primero sus entradas, planes y evidencia pequeña registrados. Declara qué se pudo recuperar y qué no. No reconstruyas cien partidos para fingir que disponías de los originales.

<a id="m15b-03"></a>

## 3. Hechos de la revisión y lectura dirigida

### 3.1 Hechos contrastados por ChatGPT en los paquetes

| Área | Hecho observado | Implicación para MOTOR-15B |
|---|---|---|
| Integridad | Los 81 ficheros inventariados de ambos ZIP coinciden en tamaño y SHA-256 con sus manifiestos. | Conservar originales; integridad no equivale a cobertura completa. |
| Integración | C15-01…06 concuerdan en marcador, acontecimientos y sorteos con sus exports. C15-05 es la copia extrema. | Reutilizar entradas/evidencia reales. |
| Energía | C15-05 declara energía mínima 0 y contiene miles de términos de cálculo con energía <10. | Hay exposición disponible para AUD17. |
| Auditoría | `auditoria/resultado.json` analiza `LOT-9e1cfb78`, con marcadores 81–64, 68–49, 100–63, 95–79, 80–88 y 112–118. No son los C15. | Corregir alcance y selección de evidencia; no afirmar que se auditó C15-05. |
| AUD26 | Hay una señal por una cadena cerrada sin receptor y un hallazgo de cobertura por diez cadenas abiertas al final. | Clasificar mediante hechos, sin fabricar receptores ni pérdidas. |
| Capacidades | La sensibilidad registrada incluye las 32 y 2.118 filas de contraste de cálculo. | Conservar el avance; no repetir todo ni confundirlo con calibración. |
| Equivalencia | Ocho comparaciones selladas; la tabla rápida contiene 27 filas con alcances diferentes. | Especificar comparación y prueba por fila. |
| Pool | El log de la suite incluye M15C·1…4, incluida caída inducida real y reintento. | Reutilizar esas pruebas, no declarar que faltan por completo. |
| Coste | 27.171,3 ms de ejecución y 27.959,9 ms totales para cien, cuatro workers; RSS pico 502 MiB. | Corregir cifras/etiquetas, sin repetir el benchmark por rutina. |
| Robos | Cien encuentros: 1,205 robos y 10,73 pérdidas por equipo/partido. | Señal diagnóstica; no objetivo nuevo de frecuencia. |
| Versiones | Suite/equivalencia registradas en `504c6e3`; manifiestos en `b6756bf`; entrega declarada `5aefaab`. | Relacionar código comprobado y cambios posteriores. |

Son observaciones de una revisión de archivos, no una inspección del código de la PR. Si el estado actual difiere, conserva y explica la diferencia.

### 3.2 Lectura dirigida

Lee normas raíz e índices; `docs/tecnico/motor15.md`, la matriz de consultas del nivel esencial, informe de cierre y recorrido; los productores/lectores afectados y las pruebas MOTOR-15/M15C existentes.

Abre después las páginas temáticas pertinentes de `docs/motor`. Conserva el funcional íntegro de consulta y usa los índices para evitar releerlo entero en cada fase.

Los adjuntos históricos `DESIGN(1).md` y `CLAUDE.odt` no son la especificación vigente de este motor. No los utilices para sustituir decisiones de beM.

<a id="m15b-04"></a>

## 4. Cierre 1: normativa y consecuencia pendiente

### 4.1 Fuentes y procedencia

| ID | Fuente primaria | Consulta |
|---|---|---|
| B15-N1 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf> | FIBA 2026 v1.1, arts. 31.3, 36.2/36.3 y 45.4/45.6. |
| B15-N2 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf> | Manual estadístico 2024 v1.0, capítulo 7 y ejemplos de robos. |

Las síntesis normativas de este encargo proceden de lectura selectiva de ChatGPT el 17/10/2026. Puedes implementarlas con esa procedencia aunque tu descarga dé 403. No afirmes lectura directa propia ni conformidad exhaustiva del reglamento.

No vuelvas a bloquear la consecuencia concreta siguiente por falta de texto. No repitas descargas fallidas de manera indefinida.

### 4.2 Consecuencia suministrada y cerrada

Síntesis de B15-N1, 31.3.3 y 36.2/36.3:

> Interferencia defensiva en el último libre: concede un punto y carga al defensor una técnica de categoría 2, con un libre adicional. Cuenta como falta individual y colectiva; no suma para descalificación por técnicas de categoría 1. Tras administrar, conserva la reanudación aplicable. En el caso ordinario de último libre válido, reanuda por fondo para el rival.

Implementa la consecuencia en la ruta común de RG-I03 o su correspondencia real. Reutiliza la técnica de jugador de categoría 2 y la cola/serie existentes. La decisión de interferencia ya está tomada: no vuelvas a sortear si procede la sanción.

Exige en su integración:

- Punto original concedido una sola vez y vínculo al libre original.
- Incidencia técnica vinculada al mismo infractor real, con categoría correcta y contadores comunes.
- Un intento real de la serie adicional, con lanzador elegido por la política existente, crédito y posibilidad de fallo reales.
- Una única reanudación, respetando derechos y sanciones pendientes del contexto; no otorgues una nueva posesión por la mera técnica.
- Guardado entre consecuencias sin repetir punto, sanción o intento al continuar.
- Tratamiento coherente de retirada obligatoria si cambia la elegibilidad. No añadas una descalificación de categoría 1 para satisfacer el test.

Retira el estado «sanción adicional pendiente» de la versión nueva para ese supuesto. Conserva como históricos los hechos y reportes que lo declaraban pendiente.

Un caso preparado de la oportunidad existente basta para exponerlo. No subas SEM15-INT-03 para verlo de forma natural ni ejecutes cientos de partidos esperando su aparición.

### 4.3 Correspondencia exacta del art. 45

La numeración que faltaba queda suministrada por B15-N1:

| Artículo | Clase |
|---|---|
| 45.4.1 | Libres indebidos. |
| 45.4.2 | Libres debidos omitidos. |
| 45.4.3 | Permitir lanzador incorrecto. |
| 45.4.4 | Dirigir lanzador incorrecto. |
| 45.4.5 | Puntos concedidos/anulados erróneamente. |
| 45.4.6 | Infractor incorrecto. |
| 45.4.7 | Errores de mesa: puntos, faltas y tiempos muertos. |
| 45.4.8 | Reloj de juego. |
| 45.6 | Reloj de posesión. |

Vincula las nueve operaciones existentes a sus filas reales. Conserva las ventanas y ramas del contrato MOTOR-15; no reduzcas todo a la etiqueta «45.4» ni reinicies el administrador completo.

Comprueba correspondencia entre clase, regla consumida y evidencia. Si detectas que una rama implementada contradice el contrato suministrado, corrige ese caso y su regresión acotada. El cambio meramente documental de numeración no consume azar.

### 4.4 Clasificación del cambio

Administrar la técnica adicional es una corrección normativa que puede cambiar la trayectoria cuando aparece ese supuesto. No la declares neutral porque sea rara.

No añadas un generador de técnicas naturales: esta técnica procede de una incidencia concreta que el motor ya genera. Las demás limitaciones de aparición natural se conservan identificadas.

<a id="m15b-05"></a>

## 5. Cierre 2: procedencia de auditorías y energía crítica

### 5.1 Identidad de la evidencia

Un informe identifica lote, casos, intentos, semillas, perfiles/versiones, políticas, nivel conservado y archivos realmente leídos. Los IDs locales M000001 no identifican por sí solos encuentros de lotes distintos.

Corrige los textos/CSV que presentan el lote `LOT-9e1cfb78` como si fueran los seis C15. Puedes conservarlo como evidencia adicional, con su alcance verdadero. No cambies sus etiquetas para aparentar que contiene la copia extrema.

Crea o actualiza el informe de cierre leyendo los C15 reales, incluido C15-05. Separa:

- Auditoría histórica del lote adicional.
- Auditoría de los casos de integración seleccionados y sus políticas.
- Resultado del benchmark histórico de cien.
- Evidencia nueva de MOTOR-15B.

No mezcles versiones o intentos como observaciones independientes de una misma muestra. El resumen debe permitir identificar sin ambigüedad qué encuentros sustentan cada afirmación.

### 5.2 AUD17 con exposición existente

Lee las recetas registradas de C15-05 y sus estados. Distingue energía observada, tareas/capacidades expuestas y deterioro efectivo de cada ámbito. Conserva bandas, numeradores, denominadores y casos/hechos de ejemplo.

No vuelvas a concluir «sin energía <10» sobre un universo que sí contiene esos términos. Si el lector excluye el escenario por una política deliberada, declara esa exclusión y evalúa el caso extremo por separado; no lo presentes como ausencia de exposición.

Verifica que:

- La curva consultada y las muestras pertenecen a la misma versión/perfil.
- La lectura no usa el estado final como sustituto de la energía en el cálculo.
- Tareas con distinto deterioro no se suman como si fueran la misma magnitud.
- El estado de AUD17 depende de lo que puede sostener la evidencia. Exposición suficiente no obliga a una conclusión conforme.
- Un contraste extremo no se usa para estimar frecuencias normales del mundo.

Si los exports existentes son compatibles, esta parte no requiere simular. Si el contrato nuevo obliga a regenerar evidencia, reutiliza las entradas congeladas necesarias y explica el motivo. No improvises otros seis partidos neutrales.

### 5.3 Clasificar AUD26 y sus causas

Localiza las cadenas y hechos del lote que produjo los hallazgos, no un saque parecido en otro partido. Registra caso/intento/cadena, última transición y causa.

Para la cadena cerrada sin receptor, determina si hubo violación, pérdida, otra reanudación válida o ausencia real de registro. Una infracción legítima no necesita un receptor inventado para cuadrar la auditoría.

Para las cadenas abiertas al final, distingue un estado legítimo interrumpido por final de periodo de una cadena usada indebidamente como ejecución terminada. Conserva causa terminal o clasificación de interrupción legible y corrige los universos de las tasas correspondientes.

Puedes completar metadatos de cierre y corregir el lector cuando falten. No añadas una pérdida, un receptor o una posesión que no ocurrieron. Una modificación de registro debe conservar el deporte.

No es un objetivo obtener 32 auditorías conformes. Cada hallazgo acaba resuelto, clasificado como comportamiento válido o pendiente con causa y evidencia precisas. Si falta la traza original, conserva ese límite; una reproducción nueva se identifica como reproducción, no como inspección del original.

<a id="m15b-06"></a>

## 6. Cierre 3: equivalencia y alcance de la evidencia

### 6.1 Reutiliza las pruebas que existen

El log MOTOR-15 incluye M15C·1 conservación esencial, M15C·2 aislamiento y equivalencia de trabajadores, M15C·3 caída inducida con trabajo real y M15C·4 detener/continuar. Lee su alcance antes de crear pruebas nuevas.

Conserva el informe sellado de ocho comparaciones y la procedencia de las otras filas. No lo presentes como 27 comparaciones del mismo tipo.

Cada fila de devolución especifica entradas, versión, órdenes efectivas, niveles/modos comparados, campos/observador, evidencia, resultado y primera diferencia si la hay.

### 6.2 Comparación común entre registros

Completo y esencial pueden utilizar huellas con contratos distintos, como TRAY-MOTOR12-R1 y TRAYINC-MOTOR15-R1. No compares esas cadenas como si fueran el mismo algoritmo. Tampoco basta el mismo marcador y número de sorteos para declarar trayectoria idéntica.

Reutiliza el observador/proyección canónica compartido de las pruebas existentes o conserva una comparación directa equivalente sobre la misma versión y entrada. Debe contrastar lo que realmente sustenta la neutralidad:

- Secuencia deportiva pertinente: acciones, participantes, relojes, desenlaces y hechos de administración.
- Consumo y estado del azar deportivo, con el alcance de su comparación declarado.
- Acta/créditos y sus políticas.
- Estados deportivos y planes/órdenes efectivos, no solo energía y marcador finales.
- Continuaciones pendientes cuando el caso las incluya.

Es aceptable un observador de verificación incremental que no guarde diagnósticos enormes. Su definición debe ser la misma en ambos lados y estar documentada; no excluyas campos deportivos para forzar igualdad.

Si la prueba existente ya compara todo eso, publica su resultado concreto y contrato. Añade una comprobación solo para una carencia real. Usa pocas entradas representativas y reutiliza las mismas para varios ejes; no el producto cartesiano de velocidades, niveles, equipos y trabajadores.

### 6.3 Guardados y trabajadores

Las continuaciones enlazan guardado, entrada, prefijo, punto estable y cola restante. No atribuyas a un guardado solo de fin de periodo cobertura de una cola pendiente que no contiene.

Conserva una comprobación del guardado durante la sanción corregida de §4. Reutiliza SAVE-PENDIENTE y la infraestructura actual donde sea compatible.

La caída inducida y su reintento ya registrados no necesitan otra campaña por defecto. Comprueba que sus condiciones siguen vigentes después de los cambios. El informe distingue caída de worker, detener el despacho y recargar navegador: son comprobaciones diferentes.

Mantén un único índice del lote, intentos separados, semilla congelada, ausencia de derrota por fallo y una sola producción por caso/variante.

### 6.4 Comparaciones de versiones

Una corrección normativa o de crédito no tiene por qué igualar todos los campos históricos. Distingue:

- Igualdad entre registros/trabajadores de la misma versión MOTOR-15B.
- Diferencia legítima MOTOR-15 → MOTOR-15B, con causa.
- Cambio solo de identidad/metadatos.

No fuerces el 83–98 histórico si un defecto corregido lo cambia. Una alteración de crédito que se declare exclusivamente estadística sí debe preservar el resto de la trayectoria deportiva.

<a id="m15b-07"></a>

## 7. Robos: diagnóstico y correcciones autorizadas

### 7.1 Pregunta y decisión

La agenda de cien registró 241 robos en 200 actuaciones de equipo: 1,205 por equipo/partido. Hubo 10,73 pérdidas por equipo/partido; aproximadamente el 11 % de todas las pérdidas se asocian a robo rival en ese universo.

Es una señal para investigar. No se fija ahora una media objetivo ni un porcentaje obligatorio de pérdidas con robo. La agenda es ficticia y no una muestra de una competición real.

Debes explicar dónde se reduce el flujo de robos y corregir errores demostrados. Si las condiciones y créditos son correctos y las tasas resultan bajas, conserva sus valores y deja identificadas las filas para MOTOR-16/17.

### 7.2 Criterio suministrado para el crédito

Síntesis de B15-N2, capítulo 7 y ejemplos:

> El robo exige toque defensivo del balón, sin requerir control inmediato. Puede ser interceptación, desvío, arrebato o recuperación de balón suelto tras error atacante, incluso sin moverse para recuperarlo. Si intervienen varios defensores, acredita al primero que desvía e inicia la pérdida. Todo robo tiene una pérdida individual rival correspondiente. Una pérdida no implica siempre robo. Con balón muerto no se acredita, salvo el supuesto de balón retenido y posesión alterna favorable al equipo del defensor.

Esta síntesis permite comprobar una hipótesis concreta: un intento explícito previo de arrebato no es requisito universal del crédito. Recuperar realmente un balón suelto puede ser acreditable aunque no se ejecutase aquella decisión previa.

No sustituyas la comprobación de toque/recuperación por la mera presión que obligó a un mal pase. Identifica lo que el motor representa y lo que no conserva.

### 7.3 Mapa de rutas y parámetros

Localiza las rutas que producen pérdida/intervención/recuperación y las que generan el crédito. Documenta, con nombres físicos reales:

1. Condición que ofrece acceso u oportunidad pertinente al defensor.
2. Decisión de intentar intervenir, si existe en esa ruta.
3. Resolución y participantes de la interacción.
4. Pérdida atacante, balón vivo/muerto y continuidad/reanudación.
5. Recuperación o control rival efectivamente representados.
6. Política y sujeto del crédito de robo.

Incluye recuperaciones tras errores de manejo/pase y salidas de saque si el motor las produce. No presupongas que todas comparten el mismo denominador o recorren todas las etapas.

La cadena conceptual es un mapa de observación, no una máquina nueva que deba imponer un intento adicional a cualquier recuperación.

Revisa condiciones muertas, filtros de participante, negaciones duplicadas, comprobaciones de intervención repetidas, índices de equipo y pérdidas con recuperación cuyo crédito se pierde al final.

Si existe `stealAttemptGivenAccessP0` o su sucesor, comprueba su consumidor efectivo y ámbito. La advertencia histórica de MOTOR-05 no prueba que el motor actual siga usando aquella misma ruta. No cambies su valor por recordar un informe antiguo.

### 7.4 Observabilidad pequeña y fiel

Reutiliza registros y agregados existentes. Si falta un contador, captura la decisión/hecho ya calculado en el mismo punto, sin nuevo azar ni otra evaluación de mérito. No construyas un auditor distinto por posesión.

Entrega por caso/equipo/ruta, donde sea observable:

| Magnitud | Qué debe quedar claro |
|---|---|
| Oportunidades examinadas, elegibles y excluidas | Condición y causa; no todas las posesiones son oportunidades de robo. |
| Intentos de intervención | Denominador de la decisión que sí se ejecuta en esa ruta. |
| Toques/desvíos y recuperaciones representados | Participante, balón vivo/muerto y fuente del hecho. |
| Pérdidas atacantes | Causa, sujeto individual/colectivo y vínculo con la interacción. |
| Recuperaciones acreditables y robos concedidos | Motivo de concesión/exclusión según política. |
| Continuación | Posesión/control siguiente y transición que realmente se ejecuta. |

Una magnitud no registrada no es cero. No uses un número de intentos para negar una recuperación real de otra ruta.

Las tasas usan numerador, denominador y universo explícitos. Las categorías exclusivas forman una partición; los contadores solapados se declaran y no se suman como si lo fueran.

### 7.5 Cambios permitidos

**Corrige ahora**, si lo demuestras:

- Crédito omitido o duplicado frente a hechos suficientes.
- Sujeto/equipo incorrecto, usando participantes ya resueltos.
- Condición de acceso, conexión o rama que contradice el contrato y bloquea una interacción implementada.
- Dos decisiones de intervención donde el diseño vigente fija una sola.
- Denominador/consulta que omite rutas o confunde falta de registro con ausencia deportiva.

**Conserva para después de MOTOR-16:** tasas base, pendientes de atributos, pesos, agresividad, frecuencia de oportunidades, un generador nuevo de desvíos/recuperaciones o una ampliación del repertorio.

No inventes un recuperador entre cinco jugadores para completar un crédito. Si la identidad nunca fue resuelta, declara el límite y la ruta; no añadas un sorteo de adjudicación retrospectivo.

Una corrección únicamente estadística no transforma automáticamente una pérdida viva en otra jugada, no dispara de nuevo episodios de momento y no concede otra transición. Conserva el hecho deportivo y corrige el crédito correspondiente. Si cambias realmente el flujo deportivo por un defecto probado, documenta su primera divergencia y su alcance.

### 7.6 Comprobación pequeña

Reutiliza los C15 para el diagnóstico y agrupa ejemplos en una comprobación parametrizada. Deben quedar cubiertos los supuestos pertinentes que la implementación admite:

- Interceptación/arrebato real con pérdida rival y crédito único.
- Balón suelto por error atacante recuperado realmente, sin exigir intento previo.
- Primer desvío y recuperación por otro defensor, si esa interacción está representada; si solo se admite como hecho tipado, declara ese alcance.
- Balón que acaba fuera, pérdida ofensiva o violación sin recuperación acreditable: sin robo inventado.
- Duplicación evitada al exportar, reanudar o reconstruir el acta.
- Balón retenido con flecha, únicamente si esa rama existe; no construyas un sistema nuevo para exponerla.

Los ejemplos preparados verifican crédito/administración; no demuestran frecuencia natural. Si no aparece un robo en una muestra pequeña, no aumentes sus tasas para satisfacer el recorrido.

Devuelve el diagnóstico antes/después, filas implicadas y casos/hechos que sostienen cada corrección. Si no hay un defecto de código/crédito, la conclusión válida es «mecanismo comprobado en este alcance; desviación de frecuencia pendiente de MOTOR-16».

<a id="m15b-08"></a>

## 8. Rendimiento: cifras correctas y alcance limitado

### 8.1 Referencia histórica que conservar

| Medida MOTOR-15 | Valor de la evidencia recibida |
|---|---:|
| Ejecución de cien, despacho a terminación | 27.171,3 ms |
| Total con preparación y lectura/finalización medidas | 27.959,9 ms |
| Mediana del tiempo de trabajo individual | 993,1 ms |
| Producción media del lote durante ejecución | 271,7 ms por encuentro |
| Pico RSS del proceso completo | 502 MiB |
| Objetivo de producto para cien | 5.000 ms, no alcanzado |

No llames latencia individual a la producción del lote dividida por cien. Conserva fases inclusivas/solapadas. La proyección de doscientos se identifica como estimación, con las fases utilizadas; no como una ejecución real.

El informe anterior citó también unos 23 segundos en un hallazgo. Corrige la discrepancia indicando medición, versión y alcance; no sustituyas todos los valores históricos por uno sin conservar su contexto.

### 8.2 Qué se hace en MOTOR-15B

Corrige documentación, etiquetas y enlace a las mediciones ya existentes. Si el perfil de CPU citado existe, incluye su ubicación/formato y una síntesis de costes inclusivos/exclusivos con sus límites. Si no está disponible, declara que no pudo contrastarse.

Un perfil «plano» no demuestra por sí solo que sea obligatorio cambiar el deporte. La conclusión debe separar evidencia de hipótesis.

No repitas el benchmark de cien ni los cuatro intentos anteriores por inercia. Usa las ejecuciones pequeñas de cierre para detectar una regresión manifiesta. Si hay una razón material para medir de nuevo, identifica qué cambia y ejecuta la muestra mínima pertinente, conservando la etiqueta histórica del benchmark previo.

No abras una nueva fase de optimización, cambies lenguaje/infraestructura ni reduzcas operaciones deportivas. El objetivo de coste permanece pendiente para la evaluación MOTOR-16 y las decisiones posteriores.

<a id="m15b-09"></a>

## 9. Versiones, perfiles y referencias

La aplicación se identifica como **MOTOR-15B** en su fuente común, consola/cabecera y cierre. Perfil, dataset, motor, política estadística, snapshot, auditoría y paquete mantienen identidades diferenciadas.

Versiona la corrección semántica sobre MOTOR-15 conforme al convenio existente, por ejemplo `beM-motor-0.15.1-MOTOR15B`. No basta una etiqueta visual. Registra versión anterior, nueva y motivo.

Si las filas normativas o su procedencia necesitan una extensión, usa `SEM-MOTOR15B-20261017` según la estructura vigente, sin alterar los coeficientes. El prefijo convencional SEM del contenedor no convierte la consecuencia reglamentaria en una tasa provisional.

Una política de crédito modificada tiene versión propia y correspondencia con las capacidades de lectura. No reinterpretes automáticamente partidos históricos con la política nueva.

Crear candidata o activar base continúa siendo explícito. Conserva protegida la base anterior y los diffs. No rellenes módulos deportivos obligatorios con defaults ocultos al consultar un perfil.

Mantén export/9 y snapshot actuales si sus contratos estructurales lo permiten; aumenta esquema solo por una necesidad real de formato. La compatibilidad semántica de reejecución/continuación se valida además por identidad de motor/perfil/políticas. Una lectura histórica no autoriza continuar con reglas distintas.

Congela antes de editar las referencias MOTOR-15 necesarias. Para cada cambio declara clase: norma, deporte por defecto corregido, crédito, lectura, registro, documento o identidad. Explica marcador, sorteos y huellas antes/después sin ajustar el resultado como objetivo.

<a id="m15b-10"></a>

## 10. Comprobaciones automáticas proporcionadas

### 10.1 Orden de trabajo

1. Identifica base real y captura referencias pequeñas del código anterior.
2. Reutiliza evidencia para auditorías y diagnóstico de robos antes de simular de nuevo.
3. Implementa la consecuencia normativa y defectos concretos encontrados.
4. Verifica con los grupos existentes y pocos casos necesarios.
5. Ejecuta la suite completa sobre el código final, datos y documentación.
6. Genera/descarga/comprueba paquetes y registra exactamente qué commit se verificó.

No hace falta una suite completa antes de cada edición. Después de tenerla verde, repite solo si nuevos cambios de código, fallos o una duda concreta lo justifican. Si el cambio posterior es exclusivamente documental o de empaquetado, ejecuta sus comprobadores y declara el diff.

### 10.2 Cobertura mínima reutilizable

| Grupo | Verificación necesaria |
|---|---|
| RG-I03 | Punto original, técnica de categoría 2, intento adicional, contadores, reanudación única y continuación sin duplicados. |
| Auditoría | Fuente/caso correctos, exposición de C15-05 leída y hallazgos AUD26 clasificados. |
| Esencial/pool | Comparación deportiva común y aislamiento con las pruebas existentes; cobertura explícita del informe. |
| Robos | Crédito y exclusiones de §7, con una regresión por defecto real si aparece. |
| Fallo C000063 | Regresión del arreglo `defenseReboundParticipants` del benchmark anterior, sin repetir el benchmark entero. |
| Devolución | Integridad, referencias, versiones, nulos, archivos reales y coherencia del resumen. |

El fallo C000063 se observó con EQ05–EQ06 y semilla `376412896`. Utiliza la entrada/perfil/planes congelados correspondientes o una reproducción mínima justificada del mismo defecto. Nombres de equipo y semilla solos no garantizan iguales entradas.

No añadas una prueba por columna, parámetro o documento. No repitas las campañas MOTOR-12/13/15 ni las 120 semillas antiguas de inferioridad.

### 10.3 Partidos y cómputo del trabajo

La entrega requiere un conjunto pequeño de partidos/colas, reutilizado para acta, equivalencia, robos, guardados y análisis. Releer un archivo no es simular; repetir el mismo caso no aumenta la muestra independiente.

Cuenta ejecuciones completas, reintentos, reproducciones y colas por separado. El uso de recursos debe responder a un fallo o comprobación concreta, no al presupuesto disponible.

No ejecutes MOTOR-16 ni uses su reserva de validación. No prometas una cota de rendimiento universal con una muestra pequeña.

<a id="m15b-11"></a>

## 11. Navegador y recorrido manual

Reutiliza los scripts y guías existentes. Recorre realmente los flujos afectados:

- Perfil anterior → tarjeta de compatibilidad → candidata/base explícitas, manteniendo el original.
- Caso preparado RG-I03 y guardado/continuación en la frontera pertinente.
- Auditorías con selección de evidencia correcta, C15-05 y clasificación AUD26.
- Análisis/acta con créditos de robo y audiencia correcta; los detalles internos quedan en diagnóstico.
- Cierre y descarga de los archivos MOTOR-15B reales, seguida del comprobador.

Si esos scripts comparten un partido o navegación, reutilízalos. No recorras todas las pantallas históricas ni todos los navegadores por rutina. Conserva el resultado real de consola/red y lo no ejecutado.

Actualiza o crea `docs/prompts/MOTOR-15B-recorrido-manual.md`: arranque, URL real, perfil, semillas/casos, pasos, observación esperada y señales de fallo. Dennis debe poder encontrar el caso de sanción y los informes sin editar JSON a mano.

No marques como aceptados por Dennis MOTOR-08…15B ni inventes que hizo esos recorridos. Una prueba de API no sustituye una interacción de navegador declarada como realizada.

<a id="m15b-12"></a>

## 12. Cierre 4: documentación y commit verificado

### 12.1 Actualizaciones concretas

- Archiva este prompt íntegro en `docs/prompts/MOTOR-15B-cierre-y-diagnostico-de-robos.md` o ruta equivalente del catálogo vigente.
- Crea `docs/tecnico/motor15b.md` con base, cambios, consumidores, evidencia, límites y relación con MOTOR-15.
- Actualiza las páginas temáticas pertinentes de `docs/motor`: normativa/interferencia, estadísticas/robos, conservación/equivalencia y auditorías/cierre, usando sus rutas reales.
- Anota en MOTOR-15 qué pendientes cierra 15B y enlaza el suplemento; conserva el informe histórico y el prompt original.
- Actualiza índice, catálogo de prompts, estado, changelog, guía manual y vista «Cierre».
- Mantén íntegro el funcional original de consulta. Las precisiones se incorporan a las páginas/decisiones sin otra megaespecificación duplicada.

No declares cobertura completa del reglamento, evaluación externa o calibración por tener tests verdes. No escribas que siguen pendientes la categoría de RG-I03 o la numeración suministrada si ya se han aplicado.

### 12.2 Relación entre commits y evidencia

Define inequívocamente:

- **Commit de código comprobado:** revisión que contiene la implementación sobre la que se ejecutaron suite y comprobaciones.
- **Commit de entrega:** último commit que se sube, si añade documentación o evidencia posterior.
- **Diferencia entre ambos:** archivos/clases de cambio y comprobaciones realizadas después.

Si cambió código deportivo, de lectura o de empaquetado después de comprobarlo, ejecuta las verificaciones pertinentes. No atribuyas los resultados antiguos al commit nuevo sin relación demostrada.

No crees un bucle de regenerar todo porque el commit que añade un informe cambia su propio identificador. Es correcto congelar el commit de código y declarar que el posterior solo añade documentación/evidencia, con diff verificable.

Los archivos internos llamados `bytes` deben medir bytes UTF-8 reales; en el resumen de integración MOTOR-15 algunos tamaños corresponden a longitud de texto. Corrige el generador del dato, no los hashes para hacerlos encajar. Manifiestos y tablas deben usar las mismas unidades.

<a id="m15b-13"></a>

## 13. Archivos que debes devolver

### 13.1 Dos descargas reales

Genera:

1. **`MOTOR-15B-revision-rapida.zip`**, pequeño y autocontenido para iniciar la revisión en ChatGPT.
2. **`MOTOR-15B-evidencia-detallada.zip`**, o índice más partes si es necesario, con la evidencia adicional y los casos que sustentan el cierre.

No sustituyas archivos por un resumen en el chat. Reutiliza los generadores, esquemas y comprobadores actuales extendiendo lo necesario. Guarda paquetes grandes fuera de Git; conserva en Git los comandos, planes, informes y evidencia pequeña pertinente.

Si el detalle reutiliza archivos del ZIP MOTOR-15 original sin duplicarlos, identifica el paquete base requerido y cada archivo por hash, y deja un comando de comprobación del conjunto. El paquete rápido debe poder leerse sin ese material. No apuntes únicamente a un contenedor temporal inaccesible para Dennis.

### 13.2 Contenido del paquete rápido

Mantén la estructura 00–14, diccionario y manifiesto de MOTOR-15, actualizando el contenido y distinguiendo histórico/nuevo. No rehagas sus cien resultados como si fueran ejecuciones MOTOR-15B.

Añade estos apartados, con nombres equivalentes si el catálogo ya tiene una responsabilidad idéntica:

| Archivo | Qué debe contener |
|---|---|
| `15-ROBOS.csv` | Por fuente/caso/equipo/ruta: etapa o métrica, numerador, denominador, unidad, cobertura, valores antes/después cuando existan, versión/política, referencia. Nulos cuando no se observa. |
| `16-CASOS-ROBOS.csv` | Ejemplos positivos/exclusiones y defectos: pérdida, toque/intervención, recuperador real, sujeto acreditado, balón vivo/muerto, motivo y hechos enlazados. Distingue natural, preparado y reproducción. |
| `17-TRAZABILIDAD.csv` | Fuente/lote, caso, variante, intento, semilla, motor/perfil/política, nivel, archivo/hash, incluido o referenciado, auditorías/comparaciones que lo consumen. |
| `18-CIERRE-15B.md` | Estado de C1–C4 y R, cambios reales, norma aplicada, auditorías, diagnóstico de robos, referencias antes/después, verificaciones, commits, límites y entrada para MOTOR-16. |

Actualiza `00-LEEME.md` con orden de lectura y comandos exactos. `01-RESUMEN.md` debe ser breve, coincidir con las tablas y separar lo comprobado por Claude, lo pendiente de Dennis y lo no ejecutado.

Cada comparación de `08-EQUIVALENCIA.csv` identifica evidencia y campos realmente contrastados. Cada auditoría enlaza al universo efectivo, no a un rótulo genérico de seis partidos.

`11-NORMATIVA.csv` registra la consecuencia de RG-I03 y las referencias exactas del art. 45 con procedencia ChatGPT si no hiciste lectura directa. Las probabilidades SEM y las consecuencias normativas conservan su distinción.

`14-PENDIENTES-MOTOR16.md` entrega una pregunta investigable sobre robos, con rutas, filas numéricas implicadas y cobertura disponible. No vuelve a pedir decidir la categoría técnica ya suministrada ni exige crear un recuperador ficticio.

### 13.3 Evidencia detallada necesaria

Incluye o referencia verificablemente:

- Entradas congeladas, perfiles/diffs y versiones pertinentes.
- Caso RG-I03 con hechos, serie adicional, acta, contadores y continuación; evidencia de no duplicación.
- Auditoría de los C15 seleccionados, incluida exposición de energía crítica y clasificación de las cadenas AUD26. Si utilizas el lote adicional, aporta su procedencia/trazas pertinentes por separado.
- Comparaciones comunes entre registros y entre trabajadores, reutilizando los informes existentes cuando sean suficientes.
- Diagnóstico de robos y las trazas pequeñas que demuestran cada defecto o exclusión relevante.
- Regresión del fallo de rebote y resultado de los grupos/suite ejecutados.
- Informe textual del navegador y comprobación sobre los ZIP realmente descargados.
- Relación entre commit de código, commit de entrega y evidencia.

No hace falta incluir cien diagnósticos ni repetir los paquetes completos si el conjunto de referencias está disponible y validado. No incluyas dependencias, secretos, otros repositorios o capturas como sustituto del dato.

El paquete original contiene tablas de cien encuentros y cinco registros esenciales de muestra; no afirma disponer de la traza completa de los cien. Conserva esa cobertura. Si los registros completos están en el entorno, deja su acceso para MOTOR-16; si faltan, decláralo sin reconstruirlos silenciosamente.

<a id="m15b-14"></a>

## 14. Integridad y preparación de MOTOR-16

### 14.1 Comprobador

Amplía el comprobador actual solo para reconocer los apartados nuevos. Comprueba los archivos reales, sin re-simular, incluyendo:

- Presencia, esquemas, tamaños UTF-8 y hashes.
- Identidades de fuentes/casos/variantes/intentos y vínculos con hechos/archivos.
- Compatibilidad de versiones y cobertura por nivel.
- Conteos históricos frente a ejecuciones nuevas, reintentos y colas.
- Coherencia de auditorías/equivalencia con sus archivos fuente y alcance declarado.
- Robos/pérdidas y sujetos según las conciliaciones y políticas pertinentes.
- Unidades y nulos, ausencia de marcador final válido en intentos fallidos y distinción de producción de cancha/adjudicación.
- Cifras de coste medidas frente a estimaciones e informes históricos.
- Rechazo explicado de paquete alterado/incompleto, conservando el original.

Declara qué cubre el comprobador y qué requiere las pruebas del motor o revisión humana. Un hash correcto no demuestra que una auditoría leyó el caso apropiado.

### 14.2 Entrada lista para la campaña

Deja accesible para MOTOR-16, sin ejecutarlo:

- Versión/perfil/políticas que se auditarán y referencia compatible.
- Rutas y contadores de robos, con unidades y denominadores.
- Separación de baja frecuencia, defecto corregido y capacidad no representada.
- Casos extremos existentes y sus entradas; no una nueva generación al azar que pierda el contraste.
- Universo de auditorías y cobertura por nivel de conservación.
- Restricción de coste medida, sin darla por resuelta ni imponer otra arquitectura.
- Referencias externas por competición/temporada/fase/definición, sin medias inventadas ni mezcla indiscriminada de ligas.
- Semillas de campaña y reserva separadas del benchmark anterior.

La auditoría futura estudiará anotación, ritmo, calidad de tiro, pérdidas/robos, faltas, rebote, capacidades y respuesta táctica conjuntamente. No ajustes ahora un mecanismo para que compense otro.

<a id="m15b-15"></a>

## 15. Aceptación y estados de salida

- [ ] MOTOR-15 real como base, rama/PR correctas y originales preservados.
- [ ] RG-I03 administra punto más técnica de categoría 2 y serie adicional mediante el núcleo común, sin duplicados al continuar.
- [ ] Nueve operaciones de corrección vinculadas a la numeración suministrada, con procedencia correcta.
- [ ] Auditorías identifican sus fuentes reales; C15-05 está leído en el alcance adecuado y AUD26 tiene clasificación trazable.
- [ ] Equivalencia declara campos, observador, versiones, entradas y pruebas sin equiparar huellas de contratos distintos.
- [ ] Cadena de robos explicada; defectos demostrados corregidos; frecuencias y pesos sin calibrar.
- [ ] Cambios de crédito distinguidos de cambios deportivos y referencias actualizadas con causa.
- [ ] Evidencia vinculada al código final y diferencias posteriores documentadas; suite/comprobaciones pertinentes aprobadas.
- [ ] Páginas temáticas, índices, prompts, estado, changelog, guía y Cierre coherentes.
- [ ] Ambos paquetes reales, descargables y comprobados; resumen consistente con los archivos.
- [ ] MOTOR-16 preparado sin campaña masiva ni consumo de su reserva.

Declara por separado:

| Eje | Estado que debe quedar visible |
|---|---|
| Cierre MOTOR-15B | C1–C4 y R completos o límite concreto restante. |
| Robos | Error corregido o mecanismo comprobado en el alcance; evaluación de frecuencia pendiente. |
| Rendimiento | Objetivo de cinco segundos pendiente; referencia histórica y nuevas medidas identificadas si existen. |
| Evaluación deportiva | Calibración poblacional pendiente de MOTOR-16/17. |
| Aceptación | Pruebas realizadas por Claude y recorrido manual de Dennis pendientes donde corresponda. |

No declares «motor completo y calibrado» ni conviertas inconcluso en conforme. La salida buscada es una base coherente y revisable para iniciar la auditoría.

<a id="m15b-16"></a>

## 16. Mensaje final para Dennis y ChatGPT

Abre o actualiza la PR según §2, sin fusionarla ni suscribirte. Devuelve:

1. **Estado C1–C4 y R:** qué cerraste y qué límite concreto queda.
2. **Qué puede probar Dennis:** arranque, URL, perfil/base/candidata, casos y recorrido manual.
3. **Normativa:** consecuencia RG-I03 aplicada, art. 45 y procedencia de lectura.
4. **Auditorías:** fuentes reales, exposición crítica, AUD26 y estados; sin afirmar 32 aprobadas.
5. **Robos:** causa encontrada o hipótesis pendiente, rutas/contadores, cambios de código/crédito y confirmación de coeficientes conservados. Valores antes/después con muestra y cobertura.
6. **Equivalencia/referencia:** qué comparaste, resultados, primera diferencia legítima y límites de cada evidencia.
7. **Verificaciones y coste:** comandos, commit comprobado, ejecuciones nuevas/repetidas/colas, navegador, no ejecutado y objetivo de rendimiento pendiente.
8. **Archivos:** nombre, tamaño y ruta/enlace descargable de ambos ZIP; comando y resultado de sus comprobadores; paquete base requerido si el detalle es incremental.
9. **Preparación MOTOR-16:** preguntas y datos disponibles, sin adelantar ajustes de calibración.
10. **Git/documentación:** base, rama, commit de código, commit de entrega, diff posterior y PR.

No prometas un ZIP que no existe ni devuelvas solo rutas internas de un contenedor inaccesible. Si no puedes adjuntarlo al chat, verifica la descarga desde la interfaz y da el procedimiento exacto para obtenerlo.

Dennis debe poder pasarnos primero `MOTOR-15B-revision-rapida.zip`; pediremos después solo la evidencia adicional necesaria. La entrega termina con archivos verificables y una explicación concreta, no con otra campaña de calibración encubierta.
