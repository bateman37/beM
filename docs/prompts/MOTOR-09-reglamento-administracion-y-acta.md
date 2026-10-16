# MOTOR-09 — Reglamento, administración y acta completas

> Prompt de implementación para Claude Code en **beM**. Dennis confirma que MOTOR-08 está fusionado en `main`; esa confirmación prevalece sobre el texto anterior de Claude que describía la PR #9 abierta.
>
> Entrega del roadmap: cerrar la administración deportiva y la atribución del acta del motor por acontecimientos dentro de posesiones. El análisis completo, los informes y el resumen pertenecen a MOTOR-10. No construyas un simulador de movimientos ni un sistema arbitral independiente.

## Índice

1. [Mandato y normas](#1-mandato-y-normas)
2. [Base de trabajo y documentación](#2-base-de-trabajo-y-documentación)
3. [Objetivo y fronteras de la entrega](#3-objetivo-y-fronteras-de-la-entrega)
4. [Fuentes y perfil reglamentario](#4-fuentes-y-perfil-reglamentario)
5. [Hecho, clasificación, consecuencia y crédito](#5-hecho-clasificación-consecuencia-y-crédito)
6. [Inventario de cobertura reglamentaria](#6-inventario-de-cobertura-reglamentaria)
7. [Relojes, control y orden temporal](#7-relojes-control-y-orden-temporal)
8. [Ventanas, órdenes y precedencia](#8-ventanas-órdenes-y-precedencia)
9. [Faltas, sanciones y series](#9-faltas-sanciones-y-series)
10. [Disponibilidad y terminaciones especiales](#10-disponibilidad-y-terminaciones-especiales)
11. [Posesiones beM y finalizaciones F](#11-posesiones-bem-y-finalizaciones-f)
12. [Política estadística y créditos](#12-política-estadística-y-créditos)
13. [Presencia, minutos y acta](#13-presencia-minutos-y-acta)
14. [Correcciones y revisiones](#14-correcciones-y-revisiones)
15. [Conciliaciones e invariantes](#15-conciliaciones-e-invariantes)
16. [Cierre acotado de pendientes de MOTOR-08](#16-cierre-acotado-de-pendientes-de-motor-08)
17. [Tablas, panel y perfiles](#17-tablas-panel-y-perfiles)
18. [Interfaz y recorrido de producto](#18-interfaz-y-recorrido-de-producto)
19. [Registro, exportación y reproducción](#19-registro-exportación-y-reproducción)
20. [Verificación automática y manual](#20-verificación-automática-y-manual)
21. [Documentación y entrega](#21-documentación-y-entrega)
22. [Criterios de aceptación](#22-criterios-de-aceptación)

## 1. Mandato y normas

Implementa esta entrega sobre el motor existente. Completa las consecuencias reglamentarias y la política de acta sin modificar el principio del proyecto: **debe sentirse como un partido de baloncesto complejo, con una ejecución interna simple por acontecimientos**.

Normas obligatorias:

- Trabaja únicamente en **beM**, su código y sus documentos. No abras `v-apps`, Basket Manager, BeManager, ZenGM u otros repositorios. Puedes consultar las fuentes normativas públicas indicadas aquí.
- No añadas ticks, posiciones continuas, movimiento por segundo, cámaras, personalidades arbitrales, simulación de gestos ni un segundo motor para excepciones.
- No introduzcas nuevas capacidades, un overall o una habilidad de disciplina/durabilidad para explicar incidencias.
- Conserva tácticas, autonomía, capacidades, estados, entrenador, memoria y tres modalidades ya implementados. Una regla común se aplica igual a una ficha, una decisión espontánea y un saque.
- Completa contenido normativo dentro del perfil acordado. No inventes reglas deportivas ni copies una edición distinta para rellenar un hueco.
- Administración determinista: una vez validado el hecho, no se vuelve a sortear su sanción, su crédito o quién tiene derecho a reanudar.
- No ajustes acierto, ritmo o producción para reproducir 88–110 ni otro resultado. Las semillas deportivas siguen siendo SEM.
- Las pruebas automáticas deben ser las justas para proteger reglas e invariantes. Dennis hará mucho test manual. No generes una campaña de miles de encuentros ni una batería de pruebas que copie cada línea de datos.
- Conserva cambios ajenos y perfiles guardados. No resetees ramas, no reescribas historial ni fusiones la PR.
- No cambies stack, infraestructura, base de datos o despliegue por conveniencia de esta entrega.

El tamaño orientativo sigue siendo aproximadamente la mitad de una ventana de cinco horas de Claude Code. No es una promesa de duración o consumo; no añadas trabajo para gastar cuota. Si aparece un límite real, registra el punto de continuación y los casos no completados. No presentes un catálogo documentado como implementación terminada.

## 2. Base de trabajo y documentación

### 2.1 Comprobar la base real

Dennis confirma MOTOR-08 fusionado en `main`. Verifica el estado efectivo del repositorio y crea una rama desde `main` que contenga esa entrega, propuesta `feature/MOTOR-09-reglamento-y-acta`.

Comprueba la presencia de MOTOR-08 mediante su código, perfil y documentación, no solo por el nombre de una rama. Si el entorno obliga a otro nombre, usa su mecanismo y documenta rama y commit base efectivos. No vuelvas a abrir la duda de fusión basándote únicamente en el informe antiguo de PR abierta.

Registra como punto de partida declarado, pendiente de comprobación local:

- MOTOR-08: 118 pruebas, doce nuevas en `tests/motor08.test.js`.
- Referencia semilla `20261016`: 88–110.
- Perfil con sufijo `+SEM-MOTOR08-20261016`.
- `export/6` se rechaza; verifica cuál es la versión vigente antes de cambiarla.
- Recorrido manual de MOTOR-08 pendiente de Dennis.

No declares que has ejecutado esas comprobaciones por haberlas leído en el informe.

### 2.2 Lectura dirigida

Lee instrucciones raíz y normas, índice documental, estado y roadmap. Después consulta:

- Funcional seccionado: reglamento y administración; registro y reproducción; acta y atribución; posesiones/F; presencia; revisiones; información visible.
- Inventario REG01–REG04, EST01–EST02 y partes de EST04/EST07 necesarias para presencia y permisos.
- `docs/tecnico/motor08.md`, decisiones requeridas y recorrido manual.
- Código, datos y pruebas de administración ya implementados en MOTOR-01 a MOTOR-08.
- Prompt archivado de MOTOR-08 para contrastar las salvedades y su cierre real.

El funcional unificado sirve para consultas puntuales: capítulos 18, 19 y 20; apartados del inventario REG y EST; anexo de fórmulas y decisiones finales. No releas todos los históricos por defecto.

Los adjuntos antiguos `DESIGN(1).md` y `CLAUDE.odt`, si aparecen en el entorno, no sustituyen el diseño vigente de beM ni autorizan consultar otro repositorio.

## 3. Objetivo y fronteras de la entrega

### 3.1 Qué debe quedar operativo

1. Perfil FIBA 2026 v1.1 identificado y matriz administrable de consecuencias.
2. Relojes, control, reanudación, anotación, faltas, libres, alternancia y elegibilidad coherentes.
3. Ventanas reales para pausas, sustituciones y órdenes dependientes.
4. Resolución de sanciones combinadas y casos especiales definidos por el funcional.
5. Acta individual/colectiva acreditada por política explícita y versionada.
6. Posesiones beM, finalizaciones F, series y puntos administrativos sin doble conteo.
7. Presencia, minutos y más-menos derivados del orden de hechos efectivo.
8. Correcciones identificadas y propagación coherente a las vistas existentes.
9. Retirada/indisponibilidad e inferioridad dentro del encuentro, sin sistema de salud de carrera.
10. Conciliaciones que expliquen el marcador y distingan una terminación administrativa de lo realmente disputado.

### 3.2 Qué no se adelanta

MOTOR-10 desarrollará el catálogo completo de análisis, informes, mapas, on/off y resumen. Esta entrega prepara sus hechos y entrega un acta completa consultable; no construye todos esos informes.

La población de referencia y la calibración siguen su roadmap. No completes las 144 fichas, un calendario, la clasificación de una liga, transferencias o salud persistente para resolver un caso de partido.

No implementes errores arbitrales aleatorios, un sistema audiovisual de revisión ni una estrategia nueva de challenge. Sí implementa la clasificación de correcciones y sus consecuencias cuando el modelo de hechos las reciba conforme al funcional.

## 4. Fuentes y perfil reglamentario

### 4.1 Fuentes comprobadas para este encargo

| ID | Fuente y edición | URL | Uso |
|---|---|---|---|
| S09-01 | FIBA Official Basketball Rules 2026, v1.1 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf> | Fuente principal del perfil reglamentario. |
| S09-02 | FIBA Official Basketball Rules Interpretations 2026, v1.0 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-interpretations-v1-0.pdf> | Casos concretos y excepciones aplicables. |
| S09-03 | FIBA Statisticians’ Manual 2024, v1.0 | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf> | Base estadística declarada; requiere correspondencia con categorías reglamentarias 2026. |
| S09-04 | FIBA Official Basketball Rules Changes 2026, v1.0a | <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-rule-changes-v10a.pdf> | Localizar cambios; no sustituye S09-01 ni sus interpretaciones. |

S09-01 y S09-02 son documentos diferentes: no uses la fecha o numeración del resumen de cambios como si fuera la del reglamento completo. El manual estadístico 2024 no cambia el reglamento 2026 ni la definición propia de posesión beM.

### 4.2 Procedimiento de consulta

Para cada grupo, localiza el artículo/caso, completa la fila declarativa y enlaza su consumo en el motor. Es trabajo de contenido normativo dentro de una decisión ya tomada, no una elección de reglas que deba inventar el programador.

No basta con escribir «FIBA» como fuente de toda la tabla. Conserva edición, artículo, interpretación cuando proceda y fecha de consulta. Distingue lectura directa de una fuente, adaptación estadística a 2026 y convención propia de beM.

Si el acceso al PDF devuelve 403:

1. Intenta el recurso oficial y una ruta oficial alternativa o herramienta de lectura disponible, sin repetir indefinidamente la misma petición.
2. Si utilizas una copia de la misma publicación, comprueba emisor, título, edición y correspondencia de contenido; conserva su procedencia y no la presentes como una edición nueva.
3. Una síntesis del prompt ayuda a identificar el caso, pero no prueba una auditoría completa del PDF.
4. No sustituyas la fuente por reglas recordadas de 2024 o NBA. Si persiste un bloqueo material, identifica los casos no contrastados y el contenido exacto necesario. No los marques cerrados ni los remitas como una nueva decisión deportiva de Dennis.

No copies los manuales completos dentro del repositorio como si fueran documentación propia. Guarda referencias, correspondencias y síntesis de implementación suficientes.

### 4.3 Puntos normativos puntuales ya contrastados

En S09-01: la disruptiva y la flagrante conceden libres al jugador que recibió la falta; sin tiro son dos, con canasta válida un adicional, y con tiro fallado dos o tres según el intento. Sigue saque delantero frente a la mesa; su reloj es de catorce segundos (37.2, 38.2, 17.2.7, 29.2.6). Las exclusiones por acumulación disciplinaria distinguen flagrantes y técnicas de categoría 1; no se deduce una exclusión automática por dos disruptivas (38.2.3, 41). No hay sanción adicional solo por esa descalificación acumulada.

Este recordatorio es deliberadamente parcial. En particular, no convierte toda técnica en una flagrante, no resuelve por sí solo sanciones combinadas y no sustituye las excepciones de inicio de partido.

### 4.4 Lo normativo no es SEM

Las constantes y consecuencias del perfil FIBA deben ser correctas bajo su edición. SEM son frecuencias de generación y parámetros de juego, no el número de libres que corresponde a un hecho ya clasificado.

Dennis puede consultar y versionar el perfil desde el panel. Una variante que contradiga FIBA necesita nombre e identidad propios; no se guarda silenciosamente como FIBA 2026. No construyas un editor universal de competiciones nuevas en esta entrega.

## 5. Hecho, clasificación, consecuencia y crédito

### 5.1 Una cadena compartida

Conserva o completa esta cadena mediante operaciones existentes:

`acción deportiva → hecho observado → clasificación validada → consecuencias ordenadas → créditos → nuevas oportunidades`.

No obliga a crear seis servicios o paquetes. Es una separación de responsabilidades y datos.

El hecho conserva el contexto necesario: fase, participantes, control/derecho, acción de tiro si existe, valor, reloj, último contacto, categoría y causalidad pertinente. La clasificación utiliza ese contexto. La consecuencia consulta REG. El crédito consulta EST y sus referencias al mismo hecho.

Ejemplo de responsabilidad: una mala recepción puede provocar una pérdida; el captor posterior no recibe automáticamente un robo. El crédito procede de la intervención causal resuelta, no de quién aparece al final del relato.

### 5.2 Matriz de consecuencias

Cada fila identifica:

| Grupo | Campos mínimos |
|---|---|
| Identidad | ID estable, edición, artículo/caso, prioridad y explicación. |
| Condición | Tipo de hecho, sujeto, contexto aplicable y requisitos. |
| Validez | Qué lanzamiento, punto o acción sigue siendo válido o queda anulado. |
| Contadores | Faltas individuales/colectivas/disciplinarias y recursos afectados. |
| Administración | Serie, ejecutor o selector legal, orden y penalizaciones pendientes. |
| Continuidad | Balón vivo/muerto, control/derecho, lugar funcional de reanudación. |
| Tiempo | Parada/continuación y reajuste de cada reloj por causa. |
| Disponibilidad | Exclusión, sustitución obligatoria y elegibilidad posterior. |
| Registro | Relación con posesión/F/serie, política de crédito y motivo. |

Usa condiciones tipadas y operaciones permitidas. No un campo con JavaScript arbitrario. Las filas pueden reutilizar una receta normativa cuando sea idéntica, sin copiar porcentajes ni esconder excepciones.

Valida ambigüedades: si dos filas incompatibles coinciden y ninguna prevalece por una prioridad declarada, el perfil no es activable. El desempate por orden alfabético no resuelve una contradicción normativa.

### 5.3 Incidencias condicionadas

La generación pertenece a la exposición deportiva correspondiente: avance, saque, pantalla, tiro, disputa o contacto. No sortees todos los sucesos raros en cada posesión.

Reutiliza los mecanismos y tasas existentes. Para un caso cuya generación natural no esté definida, implementa administración y entrada tipada verificable sin inventar una frecuencia empírica. Declara por separado: administración cubierta, exposición cubierta, generación natural implementada o pendiente de calibración/contenido. Una tasa SEM de cero no permite afirmar que el caso aparece naturalmente.

No conviertas la falta de un dato en «falta personal normal» por defecto. Un hecho insuficientemente descrito debe fallar la validación de ese caso, con un diagnóstico útil, antes de producir un acta falsa.

## 6. Inventario de cobertura reglamentaria

### 6.1 Completar contenido y ejecutar rutas

Crea una matriz de cobertura con una fila por caso material, no únicamente por capítulo. Para cada una: fuente, requisito del funcional, entrada deportiva, consecuencia, crédito, estado de implementación y forma de verificación.

Las siguientes familias son obligatorias. No construyas una simulación física para representar sus condiciones; usa hechos y sectores que el motor ya puede resolver.

| Familia | Casos y distinciones que deben quedar cubiertos |
|---|---|
| Inicio y períodos | Preparación válida, inicio, cierre, empate, prórroga y administración pendiente en la señal. |
| Balón y control | Vivo/muerto, control efectivo frente a derecho de saque, control de equipo y pelota suelta. |
| Alternancia | Situaciones de salto, flecha, consumo del derecho y cambio de período. |
| Reloj deportivo | Marcha, parada, agotamiento y relación con hechos ya iniciados. |
| Reloj de lanzamiento | Arranque, continuación, reajustes por causa y señal con tiro en vuelo. |
| Avance y plazos | Avance, saque, jugador estrechamente marcado y otras exposiciones temporales definidas. |
| Control/desplazamiento | Pasos, dobles, acompañamiento, campo atrás y condiciones de aplicabilidad. |
| Fuera | Último contacto, derecho y lugar funcional de saque. |
| Tiro y señal | Valor, validez, liberación respecto a señal, falta relacionada y balón en vuelo. |
| Interferencia | Ofensiva/defensiva, efecto sobre anotación y crédito, sin tiro duplicado. |
| Contacto | Defensa, carga, pantalla ilegal, disputa, control de equipo y acción de tiro. |
| Faltas especiales | Categorías 2026, sujeto, acumulación, penalización y reanudación. |
| Libres | Serie, lanzador, elegibilidad, repetición/anulación y continuación final. |
| Saques | Causa, lugar, sacador, plazo, receptor real, contacto e infracciones. |
| Pausas y cambios | Solicitud, oportunidad, concesión, cierre y consumo/ejecución. |
| Combinadas | Orden de sanciones, compensación cuando proceda y derechos conservados. |
| Correcciones | Naturaleza, legitimidad, momento, alcance y trazabilidad. |
| Disponibilidad | Límite de faltas, descalificación, retirada e inferioridad legal. |
| Terminaciones | Final normal, suspensión, continuación y terminación administrativa aplicable. |

La referencia normativa completa determina los detalles. No extrapoles una regla de una familia a otra por compartir un nombre.

### 6.2 Cobertura práctica frente a exhaustividad artificial

Agrupa condiciones equivalentes mediante parámetros y recetas. No escribas una función nueva para cada ejemplo de un manual ni un test por cada combinación imaginable.

Una familia no está cerrada si el panel muestra sus filas pero el flujo real sigue tomando un atajo antiguo. Localiza los puntos que asignan marcador, equipo de saque, libres, faltas y reloj directamente; conduce esos casos a la fuente común o justifica por qué ya están bajo ella.

No elimines restricciones de elegibilidad para que un escenario de laboratorio continúe. Un caso extraordinario debe terminar o continuar de la manera que corresponde, no con un sexto jugador ficticio.

## 7. Relojes, control y orden temporal

### 7.1 Tiempo por intervalos entre hechos

El motor sigue saltando al siguiente acontecimiento pertinente. Avanza los relojes activos y los estados correspondientes por el intervalo real una sola vez. No introduzcas un bucle de milisegundos para detectar una señal.

Mantén diferenciados:

- Reloj de juego y tiempo deportivo acumulado.
- Reloj de lanzamiento y su motivo de reajuste.
- Plazo de saque y otros plazos contextuales existentes.
- Duración de pausas/intervalos cuando produzca recuperación de energía o atenuación de estados.
- Tiempo de espera real del usuario, que no es tiempo deportivo.

Si juego, lanzamiento y una acción pueden vencer en instantes diferentes, resuelve la primera frontera pertinente. Un tiro liberado antes de una señal puede tener consecuencias posteriores cuando el perfil lo permita; una decisión todavía no ejecutada no se convierte retrospectivamente en un tiro.

No trunques duraciones negativas para ocultar un error. Trabaja con la precisión temporal interna existente, documenta sus unidades y deja el redondeo para la presentación.

### 7.2 Reajustes por causa

El reloj no se reinicia simplemente porque cambie una etiqueta de acción. Conserva la causa que distingue aro, tapón sin aro, toque, captura, infracción, falta, saque y nueva posesión ofensiva.

Que el reloj de lanzamiento se reajuste no crea necesariamente una nueva posesión beM. Tampoco un balón muerto cierra automáticamente el ataque.

### 7.3 Orden estable en un mismo instante

Los eventos llevan secuencia estable además del reloj. Un empate temporal se resuelve según la relación deportiva y la regla aplicable, no según la velocidad de la UI o el orden accidental de listeners.

Distingue la liberación del tiro, la señal, su resolución, una falta y las consecuencias pendientes. Conserva el orden normativo de cada caso; no impongas universalmente «primero todos los tiros y luego todas las faltas».

La administración posterior a una señal puede cambiar un acta aunque el reloj de juego ya esté a cero. El modo por cuartos se detiene cuando el período y su administración pertinente están resueltos, no a mitad de una serie pendiente.

## 8. Ventanas, órdenes y precedencia

### 8.1 Ventana como estado deportivo

Cada oportunidad identifica: causa, solicitantes con derecho, acciones autorizadas, instante de apertura, cierre y restricciones.

Una orden puede estar solicitada, pendiente, concedida, ejecutada, cancelada o rechazada. No descuentes recursos en la solicitud. No cambies una presencia efectiva al guardar una preferencia de sustitución.

Pausar el navegador no abre una ventana. Reproducir a x16 no la suprime. En simulación total se aplican las mismas oportunidades aunque no se muestren animadas.

### 8.2 Precedencia

1. Consecuencia y elegibilidad reglamentarias obligatorias.
2. Orden manual válida, con ámbito y duración vigentes.
3. Plan y restricciones explícitas del equipo.
4. Delegación y decisiones automáticas autorizadas.
5. Conducta ordinaria existente.

Una orden manual no vuelve elegible a un excluido ni concede un tiempo muerto inexistente. Un cambio del plan no reescribe una acción que ya se ejecutó.

### 8.3 Casos que revisar en la implementación actual

- Pausa manual que cancela la automática pendiente del mismo equipo: conservar la corrección de MOTOR-08 y evitar doble consumo.
- Peticiones que dejan de ser pertinentes mientras esperan: cancelar/revalidar con motivo.
- Sustitución y pausa en una misma detención: aplicar el orden permitido y no abrir una segunda ventana ficticia.
- Libres: no hay una autorización genérica para cambiar entre intentos. Cada cambio necesita un supuesto permitido.
- Sustitución obligatoria del lanzador cuando corresponda: conservar la serie y la causalidad, cambiar solo la identidad efectiva conforme a la regla.
- Después de una anotación o antes de poner el balón a disposición: comprobar qué equipo puede solicitar cada recurso.
- Avance del saque tras pausa en un tramo final: fuente, elección y consecuencias de reloj explícitas, sin aplicar el avance a cualquier pausa.

El entrenador de MOTOR-08 solicita acciones. REG03 decide si existe la oportunidad. No mantengas dos comprobaciones contradictorias de la misma ventana.

## 9. Faltas, sanciones y series

### 9.1 Clasificación y contadores separados

Conserva la persona o sujeto responsable, el receptor cuando exista, el contexto y la categoría 2026. Distingue:

- Faltas cargadas al jugador.
- Faltas de equipo pertinentes para penalización.
- Categorías y combinaciones disciplinarias.
- Hechos de entrenador, banquillo u otros sujetos admitidos por el perfil.

No identifiques FC, faltas de equipo y contador de exclusión disciplinaria como si fueran siempre el mismo número. Su relación procede del perfil.

La falta de control de equipo y la falta de tiro no se determinan por quién termina cogiendo el balón. El contexto válido es el del contacto. Un envío arriesgado de saque no se transforma en acción de tiro.

### 9.2 Bonus y continuidad

Resuelve la penalización de equipo con los contadores y condiciones correctos. Las excepciones del contexto prevalecen sobre una regla genérica de bonus. No otorgues libres a toda falta porque el contador de equipo sea alto.

Verifica la continuidad entre Q4 y prórrogas, los hechos de intervalo y la acumulación individual según el perfil. No reinicies todos los contadores al entrar en una prórroga por reutilizar el constructor de período.

### 9.3 Serie como unidad causal

Cada serie conoce:

- Hecho y sanción origen; relación con F si existe.
- Número concedido, orden y lanzador elegible efectivo.
- Intentos administrados, válidos, anulados o repetidos.
- Puntos válidos y derechos posteriores.
- Si queda pendiente o interrumpida por otra administración.

No confundas libres concedidos con FTA acreditados. Un libre repetido no se duplica en el porcentaje ni abre otra F. Un punto de una sanción intercalada no pertenece automáticamente a la serie que se estaba administrando.

Si el lanzador efectivo cambia legalmente, los puntos y sus intentos pertenecen a quien lanza; la finalización conserva su iniciador y causa originales.

### 9.4 Sanciones combinadas

Utiliza una cola pequeña o estructura equivalente de penalizaciones pendientes, relacionada con los hechos reales. Determina orden, compensaciones, ejecución inmediata que corresponda, sanciones restantes y reanudación final.

No compenses solo porque dos equipos tengan «una falta» ni sumes ciegamente todas las penalizaciones. Tampoco canceles una falta cargada al sujeto solo porque su sanción se compense.

Una sanción puede modificar la reanudación sin crear una nueva posesión ofensiva en mitad de una administración. Conserva el contexto previo que el reglamento necesite para volver al juego.

La misma sanción no se ejecuta dos veces al reanudar, reproducir un export o refrescar una vista.

## 10. Disponibilidad y terminaciones especiales

### 10.1 Retirada e inferioridad

La exclusión obligatoria prevalece sobre valor contextual, energía, plan y orden manual. Suspende encargos del jugador saliente y reorganiza con participantes elegibles reales.

La lesión o indisponibilidad puede recibirse como incidencia tipada del encuentro. No crees un diagnóstico clínico, una probabilidad de lesión basada arbitrariamente en Consistencia ni una recuperación de temporada.

Si quedan menos jugadores disponibles, aplica el perfil correspondiente: no rellenes hasta cinco con excluidos ni termines por una regla inventada de «quedan menos de cinco». La continuación o terminación y sus condiciones se documentan con fuente.

Las recetas que admitían cinco participantes deben detectar funciones ausentes y usar alternativas legales; no producir divisiones por cero o receptores fantasma.

### 10.2 Estado del encuentro

Distingue finalizado normalmente, suspendido/parcial, continuado y terminado por causa administrativa cuando proceda. El resultado adjudicado y la producción efectivamente disputada son datos diferentes.

No inventes tiros ni puntos individuales para explicar un resultado administrativo. Si el perfil prescribe un marcador adjudicado, consérvalo como tal y no lo mezcles con el tanteo de cancha.

Para una suspensión conserva identidad y estado suficiente del encuentro. Una continuación no cuenta como dos partidos. Reutiliza persistencia/serialización existentes; no construyas un calendario o un servicio de competición.

Una terminación especial identifica qué unidades quedan cerradas por terminación, pendientes o no aplicables. No las conviertas en pérdidas para cuadrar estadísticas.

Un fallo técnico del motor no es una derrota administrativa reglamentaria. Debe identificarse como ejecución inválida, sin fabricar un acta final plausible.

## 11. Posesiones beM y finalizaciones F

### 11.1 Convención vigente

La **posesión beM registrada** empieza con el control o derecho efectivo a iniciar un ataque y termina cuando ese ataque se cierra, cambia al rival el control/derecho correspondiente o acaba el período con ataque activo.

Es la convención funcional propia de beM, no una promesa de equivalencia universal con todas las convenciones estadísticas FIBA. No la sustituyas por el capítulo de posesión de otro manual ni por una estimación de boxscore.

Dentro de una posesión puede haber varias acciones, tiros, rebotes ofensivos, faltas, series y saques. El identificador no cambia por cada uno de esos acontecimientos.

### 11.2 Continuidad obligatoria

| Caso | Tratamiento beM |
|---|---|
| Canasta normal sin continuidad especial | Cierra el ataque; el rival inicia con su control/derecho. |
| Canasta y adicional | Conserva la unidad hasta resolver serie y continuación. |
| Fallo y rebote ofensivo | Misma posesión. |
| Fallo y rebote defensivo | Cierra; comienza ataque rival. |
| Pérdida con cambio de control/derecho | Cierra, aunque no se ejecutara una ficha. |
| Falta o fuera con saque para el mismo ataque | Continúa. |
| Último libre fallado y rebote ofensivo | Continúa. |
| Serie y control posterior rival | Cierra al resolver serie/continuación. |
| Sanción con saque retenido | Continúa si subsiste la misma unidad ofensiva. |
| Alternancia | Continúa o cierra según el siguiente derecho. |
| Fin de período con ataque activo | Cierra por fin de período; no inventa PER. |
| Fin sin ataque activo | No crea una posesión vacía. |
| Libre administrativo independiente | No crea por sí solo un ataque de duración cero. |

Conserva el inicio, cierre y causa. Las posesiones no atraviesan períodos, aunque una consecuencia administrativa del período deba resolverse después de la señal.

No fuerces el mismo número de posesiones para ambos equipos. No uses `TCI + 0,44 × TLI − RO + PER` como sustituto del registro; esa fórmula, si existe, queda etiquetada como estimación.

### 11.3 Finalización F

F agrupa una acción de tiro y su serie causal ligada si existe. Puede abrirse por un intento acreditable o una falta en acción de tiro que origine la finalización, aunque no se acredite FGA por el fallo con falta.

| Caso | F |
|---|---|
| Tiro de campo válido sin falta | Una. |
| Canasta y libre adicional | Una, con canasta y adicional ligados. |
| Falta sobre tiro fallado y serie ligada | Una; no una por cada libre. |
| Fallo, rebote ofensivo y otro tiro | Dos F dentro de una posesión cuando corresponda. |
| Falta no de tiro con libres por bonus | Ninguna F creada por esa falta. |
| Libre administrativo | Ninguna F creada por esa sanción. |
| Pérdida previa al tiro | Ninguna. |
| Toque de rebote sin captura ni intento de anotar | No crea por sí solo F. |

No conviertas F en FGA, ni F en posesión. Las F abiertas se distinguen de las cerradas; el acta final reconcilia sus consecuencias o identifica una terminación especial.

### 11.4 Partición de puntos

Conserva ambas conciliaciones, con categorías mutuamente excluyentes en cada partición:

`PTS totales = PTS ligados a F + PTS por sanción no de tiro + PTS administrativos + otros créditos tipados del perfil`.

`PTS totales = PTS vinculados a posesiones beM + PTS administrativos/no vinculados a una posesión`.

Son dos clasificaciones del mismo total, no cantidades que se suman entre sí. «Otros» solo contiene casos identificados; nunca un saldo para ocultar un descuadre.

Una técnica intercalada puede dejar F pendiente sin pertenecer a ella. Un punto rival administrativo no fabrica una posesión ofensiva rival. El origen táctico y la presencia se atribuyen en sus momentos definidos, no por proximidad de reloj.

## 12. Política estadística y créditos

### 12.1 Identidad de política

Declara un perfil estadístico identificable basado en el manual elegido, con adaptaciones explícitas para categorías 2026 y convenciones propias de beM. Conserva versión y correspondencia de cada familia de créditos.

No llames «oficial FIBA 2026 completo» a una mezcla no documentada de un manual estadístico 2024 y reglas 2026. La correspondencia es parte del trabajo de esta entrega.

El crédito es determinista a partir del hecho suficientemente descrito. No hay un nuevo sorteo para decidir asistencia, robo, rebote o autor de una pérdida.

### 12.2 Lanzamientos y puntos

Conserva intento válido, valor, resultado, anotador efectivo, tipo, causa de anulación/repetición y relación con F/serie.

- Un fallo con falta de tiro no se contabiliza automáticamente como FGA. Una canasta válida con falta conserva su lanzamiento y su sanción ligada según política.
- Un lanzamiento fuera de tiempo no puede seguir en los porcentajes como un fallo ordinario si no es un intento válido.
- Interferencia y canasta concedida usan su crédito específico; no generan otro tiro del defensor.
- Los puntos extraordinarios admitidos por el perfil identifican su causa y sujeto; no se fuerza una canasta normal inexistente para conciliar.
- La repetición y anulación de libres afectan a intentos válidos y mantienen la secuencia administrada completa.

No infieras TEC03 u otra técnica solo porque el lanzamiento valga dos. El eje estadístico y la tarea técnica ya resuelta siguen separados.

### 12.3 Asistencias

El funcional ya admite asistencia a canasta y asistencia a una serie de libres elegible. No elimines la segunda por asumir que AS nunca puede superar las canastas de campo.

S09-03 contempla la asistencia a una serie elegible si se convierte al menos un libre; no se acredita una por cada acierto de la serie. Su criterio también requiere distinguir continuación directa de la ventaja y creación autónoma posterior. Contrasta las condiciones completas en su capítulo 6.

Utiliza un único candidato oficial: último pase elegible con emisor, receptor, recepción funcional, continuidad de ventaja y desenlace. No impongas un número ficticio de botes si el modelo no los simula.

Cierra o invalida el candidato cuando la secuencia lo exige: pérdida, creación nueva, fallo seguido de rebote u otra ruptura causal. El pase de la primera ocasión no obtiene una asistencia por una canasta posterior del reboteador.

El desglose `AS a canasta` y `AS a libres` permite reconstruir AS total según política. Pases creadores, oportunidades falladas, pantalla útil o pase previo no se suman como asistencias oficiales adicionales.

### 12.4 Pérdidas y robos

Atribuye al sujeto responsable resuelto: pasador, receptor, manejador, infractor o equipo. No cargues al base las pérdidas colectivas ni al receptor cualquier pase imposible.

Una pérdida puede no tener robo. La recuperación posterior no demuestra intervención defensiva causante. Conserva la corrección de MOTOR-06/07/08 que evita una segunda decisión de robo y acredita solo la intervención elegible.

No fuerces `robos rivales = pérdidas propias`. Sí relaciona cada robo acreditado con el hecho elegible y evita dos créditos oficiales incompatibles por una sola recuperación.

### 12.5 Rebotes

Distingue captura/control acreditable, toque, rebote colectivo, fuera e interrupción sin oferta de rebote. No asignes el rebote al jugador más cercano para cuadrar una suma.

La oferta debe proceder de un fallo elegible. Un libre con saque retenido y una pelota ya muerta no generan automáticamente una disputa de rebote. Tapón sin control no equivale a rebote, y un tapón sin aro no equivale a reajuste tras aro.

Mantén RO/RD y sujeto individual/colectivo separados. El total de equipo incluye sus filas colectivas según la política, no un rebote extra en la ficha de un jugador.

### 12.6 Tapones y faltas

Un tapón acreditable se enlaza con un intento elegible y su tirador. TAP y TREC comparten ese identificador, sin convertir cualquier desvío en un tapón. Una falta que invalida el crédito no puede dejar un tapón huérfano.

FC, FR y contadores disciplinarios son conceptos distintos. Una técnica sin receptor individual no crea una falta recibida ficticia. Entrenador, banquillo y equipo conservan sus sujetos propios.

### 12.7 Ausencia de dato

Una atribución no disponible no se reemplaza por un jugador cualquiera ni por una probabilidad. Distingue `no aplicable`, `no registrado`, `pendiente` y cero.

Para un hecho de producción ordinaria generado por el propio motor, la información necesaria para su crédito debe formar parte del contrato. No generalices «desconocido» para evitar completar el acta.

## 13. Presencia, minutos y acta

### 13.1 Presencia efectiva

Calcula minutos a partir de intervalos reales de presencia delimitados por entradas/salidas y final del tiempo disputado. No por acciones realizadas, objetivos del entrenador o duración de animaciones.

Usa la secuencia estable cuando varias anotaciones y cambios comparten reloj. Cada punto de cancha se atribuye al grupo efectivamente presente en ese momento. No asignes todo el segundo a la última versión del quinteto.

Un jugador puede entrar y salir sin consumir tiempo de juego: su estado de participación no se deduce de que el minuto redondeado sea 0:00.

Las pausas y esperas no suman minutos. La prórroga suma tiempo real. Una inferioridad legal puede alterar la suma esperada de minutos respecto a cinco jugadores durante todo el encuentro; la conciliación debe utilizar la ocupación efectiva.

### 13.2 Acta individual

Entrega una fila por convocado, también DNP/indisponible, con:

- Identidad histórica, dorsal, función/posición mostrada y titularidad.
- Participación y estado de salida visible.
- MIN y PTS.
- T2C/T2I, T3C/T3I, TLC/TLI, TCC/TCI y porcentajes.
- RO, RD, RT.
- AS y desglose a canasta/libres.
- PER, REC, TAP, TREC y mates convertidos cuando el hecho los represente.
- FC, FR y detalle de tipos de falta.
- Más-menos de presencia.
- VAL conforme a la fórmula del funcional.

Porcentaje sin intentos: `—`, no 0 % presentado como rendimiento. Mates es un subconjunto de canastas, no puntos adicionales.

Conserva la fórmula acordada:

`VAL = PTS + RT + AS + REC + TAP + FR − (TCI − TCC) − (TLI − TLC) − PER − TREC − FC`.

La valoración es una convención de acta declarada, no un overall ni un nuevo cálculo de talento.

### 13.3 Acta colectiva

Muestra totales individuales, filas colectivas separadas cuando existen y total del equipo según política. Incluye parciales por período/prórroga, faltas y tiempos muertos, resultado y estado del encuentro.

No escondas pérdidas de equipo, rebotes colectivos o créditos administrativos para que el total coincida con la suma de jugadores. Explica esa conciliación en una fila o detalle.

El resultado administrativo adjudicado debe aparecer diferenciado del marcador realmente disputado. Para puntos de cancha normales, las sumas deben cuadrar exactamente antes de redondear porcentajes.

### 13.4 Más-menos

Derívalo de las anotaciones acreditables durante presencia efectiva y de la política temporal, sin atribuir causalidad individual. Los puntos administrativos fuera de presencia o de tiempo disputado requieren tratamiento explícito y no se reparten a un quinteto inexistente.

No impongas incondicionalmente que la suma de más-menos sea cinco veces el margen oficial: puede haber inferioridad, puntos fuera de presencia o resultado administrativo. La identidad se verifica sobre el universo elegible y la ocupación real; los casos normales sí deben satisfacer su relación correspondiente.

La clasificación completa de unidades completas/mixtas y on/off analítico corresponde a MOTOR-10. Conserva ahora los intervalos y relaciones necesarios para construirla.

## 14. Correcciones y revisiones

### 14.1 Tres naturalezas distintas

| Clase | Qué cambia | Tratamiento |
|---|---|---|
| Corrección estadística | Atribución o clasificación de crédito sobre hechos deportivos conservados. | Revisa proyecciones compatibles sin volver a simular el partido. |
| Corrección reglamentaria en el encuentro | Error corregible admitido por el perfil y su ventana. | Aplica condiciones, alcance y reanudación de la fuente; no un rewind genérico. |
| Corrección técnica del software | Un defecto del motor produce una ejecución inválida. | Identifica versión afectada y ejecución; una simulación con versión corregida es una nueva ejecución, no una decisión arbitral ficticia. |

Una revisión de dos/tres o de validez temporal debe clasificarse según qué verdad cambia y cuándo se aplica. No etiquetes como «solo estadística» una modificación en vivo que cambia legalmente marcador, elegibilidad o continuación.

No se encarga generar errores o revisiones aleatorias para animar el relato. Los casos pueden recibirse y comprobarse mediante entradas diagnósticas identificadas.

### 14.2 Registro de revisión

Conserva ID de revisión, hecho afectado, clase, motivo, fuente/política, valores anterior y vigente, instante de reconocimiento, alcance y versión derivada. No borres el hecho original ni cambies silenciosamente todas sus copias.

La representación técnica es reversible dentro de la arquitectura existente: eventos de revisión, sustitución versionada de proyecciones u otro mecanismo equivalente. No se exige implantar una nueva infraestructura de event sourcing.

### 14.3 Propagación

Una misma revisión debe llegar a marcador, acta, parciales, intentos, series, presencia/más-menos y demás vistas existentes que dependan del dato. Las relaciones de F/posesión se corrigen cuando la revisión cambia su validez, no mediante un parche del total.

Si todavía no existen los mapas o informes de MOTOR-10, deja contrato de versión/invalidez para ellos; no construyas todos sus productos ahora.

Una consulta histórica bajo otra convención se presenta como otra política de lectura. No reescribe el resultado oficial original.

### 14.4 Corrección reglamentaria y hechos posteriores

Consulta S09-01, artículo 45, y las interpretaciones aplicables para elegibilidad y plazos. No deshagas automáticamente todas las acciones posteriores al error. Tampoco permitas corregir cualquier cosa en cualquier instante.

Una modificación de reloj o penalización puede afectar la continuación desde el momento autorizado. No reconsumas números aleatorios para «ver qué habría pasado». La política define qué permanece válido y cuál es la reanudación; el registro conserva la historia y la revisión.

## 15. Conciliaciones e invariantes

### 15.1 Motor y reconstrucción

El acta y el marcador deben poder reconstruirse desde los hechos y la política versionada. Puede haber acumuladores durante la ejecución, pero no son una segunda verdad independiente que pueda discrepar del registro.

No recalcules el historial completo en cada evento. Actualiza proyecciones pertinentes y reserva reconstrucción completa para final, revisión, export/reproducción o diagnóstico apropiado.

### 15.2 Identidades obligatorias

| Área | Comprobación |
|---|---|
| Marcador de cancha | Suma de créditos válidos por período y sujeto = tanteo deportivo. |
| Tiro | TCC = T2C + T3C; TCI = T2I + T3I; convertidos no superan intentados válidos. |
| Puntos | Canastas, libres y créditos tipados explican el total, sin saldo residual anónimo. |
| Particiones | Puntos F/sanción/administración/otros y puntos vinculados/no vinculados reconcilian por separado. |
| Libres | Concedidos, administrados, anulados, repetidos y válidos mantienen relaciones y no se duplican. |
| Rebote | Cada crédito remite a oferta/fallo elegible y sujeto; no todo fallo exige rebote individual. |
| Robos/pérdidas | Relación causal compatible, sin igualdad global forzada ni doble crédito. |
| Tapones | TAP/TREC remiten al mismo intento elegible. |
| Faltas | Sujeto, categoría, contadores, sanción y disponibilidad coherentes. |
| Presencia | Intervalos no superpuestos por jugador, ocupación legal y minutos conciliados con tiempo real. |
| Posesiones | Inicio/cierre únicos, continuidad documentada y sin atravesar períodos. |
| F | Origen único, serie ligada válida, cierre y puntos sin duplicidad. |
| Recursos | Petición no consume; concesión consume una vez y nunca produce cantidades negativas. |
| Correcciones | Todas las proyecciones actuales usan la misma revisión efectiva. |
| Terminación | Resultado deportivo, administrativo y estado del acta diferenciados. |

No impongas invariantes falsas: AS ≤ FGM, robos = pérdidas rivales, rebotes = todos los fallos, cinco jugadores siempre disponibles o igualdad de posesiones por equipo.

### 15.3 Informe de conciliación

Ofrece un resultado consultable con comprobación, universo, esperado, observado, hechos causantes y versión. Una desviación no se resuelve alterando el acta para satisfacer el control.

Para una inconsistencia real, marca la ejecución como inválida o pendiente según el contrato existente. No muestres «partido correcto» porque terminó el reloj o porque el tanteo parece plausible.

## 16. Cierre acotado de pendientes de MOTOR-08

No se aprueba ni se recalibra en bloque MOTOR-08. Atiende los siguientes puntos con criterios precisos.

### 16.1 Respuestas compatibles: aproximadamente seis de veintiocho

Ese dato por sí solo no demuestra un fallo. Separa denominadores:

- Exposiciones válidas.
- Patrones únicos activos/observados.
- Cruces del umbral de reconocimiento.
- Revisiones que vuelven a ver un patrón ya reconocido.
- Recomendaciones nuevas.
- Respuestas compatibles.
- Respuestas autorizadas por delegación/orden.
- Respuestas aplicadas y ruta utilizada.

No cuentes veintiocho revisiones del mismo patrón como veintiocho patrones distintos. Para las propuestas no aplicadas registra causas: incompatibilidad deportiva, encargo manual, ausencia de ventana, estabilidad vigente, respuesta ya activa o falta de alternativa declarada.

Corrige un vínculo roto, una incompatibilidad mal declarada o un conteo repetido si lo encuentras. No relajes requisitos ni fabriques respuestas para alcanzar un porcentaje objetivo. Sin evidencia de defecto, conserva el resultado como diagnóstico SEM y pendiente de evaluación deportiva.

### 16.2 Aproximadamente ochenta reemplazos con ocho entradas

Mantén el máximo de ocho. Audita la semántica antes de tocar capacidad o decaimiento.

Las claves de familia/salida no incluyen ID de evento, reloj, valor aleatorio, acierto/fallo ni calidad como dimensión que cree otra identidad del mismo recurso. El contexto específico vive acotado dentro de la entrada según el diseño vigente; no multiplica una tabla por cada jugador o variante.

Distingue inserción inicial, reemplazo por capacidad, descarte por decaimiento y actualización existente. No presentes todos como reemplazos. Usa causas y un resumen de claves para explicar la rotación.

Si hay fragmentación de identidad o conteo incorrecto, corrígela y compara un encuentro con el mismo escenario de referencia, explicando que puede cambiar su desarrollo. Si el número refleja diversidad real bajo las claves acordadas, conserva el dato; no introduzcas una novena entrada ni una regla de admisión nueva para que baje.

### 16.3 Ruta B: preparación dentro de la acción

MOTOR-08 dejó sin implementar una ruta prevista por el funcional. Complétala de forma acotada reutilizando los encargos y operaciones existentes:

- Ruta A: reconocimiento que propone un cambio de plan; pasa por ENT, autorización y frontera válida.
- Ruta B: reconocimiento que prepara una respuesta **ya permitida dentro del encargo actual**, al llegar la interacción pertinente.

La ruta B no cambia silenciosamente organización o cobertura bloqueadas, no abre una ventana administrativa, no garantiza leer bien ni concede un bonus de acierto/robo. Selecciona una respuesta existente compatible y su ejecución real sigue requiriendo participantes y capacidades.

Una misma evidencia no aplica A y B como ventajas acumuladas. Si la respuesta ya está activa, registra preparación o continuidad, no otro cambio de plan. Usa el catálogo MEM/DEF actual, sin crear un repertorio defensivo paralelo.

Una comprobación pequeña debe mostrar preparación en acción sin cambio de plan y otra debe impedirla cuando el encargo no la permite.

### 16.4 Fuentes FIBA, proyección y prueba heredada

- Las lecturas reglamentarias basadas solo en el resumen anterior quedan sustituidas por correspondencias contrastadas con S09-01/S09-02. El registro técnico identifica qué cambió y qué se confirmó.
- Conserva la exclusión de la etiqueta de biblioteca del perfil de la proyección deportiva. Una etiqueta de presentación no altera el juego; la identidad y versión necesarias para reproducción sí permanecen conservadas.
- Revisa la prueba de MOTOR-04 que ahora excluye la falta táctica del entrenador: es correcto separar ese contexto cuando la pregunta de la prueba lo exige. No excluyas las faltas del acta o de la conciliación global para hacer pasar la prueba. Documenta ambos universos.
- Mantén pendiente el recorrido manual de Dennis hasta que lo ejecute. Node 24 y otros navegadores no quedan probados por esta entrega si no se ejecutan.

## 17. Tablas, panel y perfiles

### 17.1 Responsabilidades canónicas

| Grupo | Contenido de esta entrega |
|---|---|
| REG01 | Identidad del perfil, edición y constantes coherentes. |
| REG02 | Hecho/condición → consecuencias, relojes, control, anotación y reanudación. |
| REG03 | Ventanas, solicitantes, elegibilidad, concesión y cierre. |
| REG04 | Combinadas, correcciones, inferioridad y terminaciones especiales. |
| EST01 | Sujetos, créditos, anulaciones y correspondencia normativa/estadística. |
| EST02 | Posesiones, F, series y particiones de producción. |
| EST04, parte necesaria | Presencia, intervalos, minutos y relaciones para más-menos. |
| EST07, parte necesaria | Visibilidad de disponibilidad, causas y diagnóstico. |
| MEM/DEF, ajuste acotado | Motivos y correcciones del apartado 16; ruta B. |

Mapea responsabilidades a nombres físicos existentes. No es obligatorio crear una tabla física por ID canónico ni duplicar una fuente de verdad.

### 17.2 Panel

Amplía el panel existente con pestañas o vistas «Reglamento» y «Acta y créditos», si no existen, y filas localizables en la tabla maestra.

Cada fila muestra fuente, versión, condición, consecuencia, crédito, estado de cobertura y punto de consumo. Las constantes normativas se distinguen visualmente de ratios SEM de generación.

Para candidatos, valida referencias, sujetos, condiciones incompatibles, operaciones de reloj y acciones autorizadas. No permitas activar como FIBA un perfil incoherente. Explica la validación sin borrar el candidato.

No hagas que Dennis edite código o un campo de texto ejecutable para cambiar una condición tipada. Tampoco conviertas el flujo normal de partido en una pantalla técnica de reglas: el detalle vive en el panel y diagnóstico.

### 17.3 Precarga y activación

Crea una base explícita con sufijo `+SEM-MOTOR09-20261016` siguiendo la convención real del repositorio. La etiqueta SEM se refiere a parámetros provisionales del motor; no rebaja la obligación de corrección normativa.

Conserva perfiles anteriores y muestra activación explícita desde Panel › Inicio. Si hay creación de candidata desde una versión previa, indica tablas añadidas y compatibilidad. No migres un perfil activo en silencio.

## 18. Interfaz y recorrido de producto

### 18.1 Durante el encuentro

Mantén marcador, relojes, faltas, recursos y participantes efectivos sincronizados con el estado administrado. Una pausa solicitada y una concedida se distinguen. Una serie pendiente no desaparece porque el reloj marque cero.

Muestra una explicación breve cuando exista una exclusión, infracción, repetición, corrección o reanudación especial. El lenguaje describe el hecho y la consecuencia, no los coeficientes internos ni datos ocultos del rival.

### 18.2 Acta final y parcial

Añade o completa «Acta» con columnas del apartado 13, parciales, totales, sujetos colectivos y estado del encuentro. Incluye glosario de abreviaturas y detalle desplegable de faltas/series/revisiones.

La vista parcial identifica lo pendiente. Una finalización suspendida no se muestra como definitiva. El diagnóstico de conciliación va separado de la lectura ordinaria.

El resultado final administrativo, si existe, se diferencia claramente de los hechos de cancha. No muestres un 20–0 adjudicado como si un jugador hubiera anotado veinte puntos.

### 18.3 Casos de laboratorio

Prepara un acceso diagnóstico pequeño para cargar casos identificados o reutiliza el mecanismo existente. Sirve para que Dennis vea situaciones difíciles de encontrar naturalmente: sanciones combinadas, serie repetida, corrección, inferioridad o señal con administración pendiente.

Los casos están rotulados como preparados y muestran sus entradas. No alteran plantillas/planes originales ni partidos históricos. No habilites un editor ordinario para reescribir cualquier resultado final.

## 19. Registro, exportación y reproducción

### 19.1 Hechos mínimos

Conserva identidad y orden estable, tiempo deportivo, fuente de regla, causa, sujetos, validez, consecuencias, revisiones y vínculos necesarios entre tiro, pase, falta, serie, captura, posesión, F y presencia.

No dupliques el estado completo del motor en cada fila. No guardes cada milisegundo. Los intervalos y cambios de estado bastan para lo que aquí se necesita.

Las relaciones permiten reconstruir el acta sin interpretar frases del relato. La presentación no consume azar deportivo ni otorga créditos nuevos.

### 19.2 Versiones

Verifica el export vigente y utiliza la siguiente versión si cambia su contrato. No presupongas un número solo porque `export/6` ya se rechaza.

Incluye versión de motor, perfil efectivo reproducible, política reglamentaria/estadística, semilla, entradas, órdenes y revisiones. El historial conserva la política aplicada al disputar el encuentro.

Los formatos no compatibles se rechazan con motivo y el archivo original se conserva. No prometas reproducibilidad de versiones anteriores usando las reglas nuevas.

### 19.3 Reproducción y continuidad

La reproducción no vuelve a conceder libres o consumir pausas ya administrados por un evento equivalente. Reconstrucción de acta y reejecución deportiva deben usar contratos diferenciados y coherentes con la arquitectura actual.

Si existe continuación desde un snapshot, incluye penalizaciones/series pendientes, control, relojes, elegibilidad, presencia, órdenes y memoria necesarios. Si solo existe reproducción desde inicio, no construyas una plataforma genérica de guardados; resuelve la continuidad especial con el mecanismo mínimo existente y declara su alcance real.

Las tres modalidades, con las mismas entradas y órdenes en las mismas fronteras, mantienen los mismos hechos deportivos. El tiempo de espera y la velocidad de visionado no modifican el acta.

## 20. Verificación automática y manual

### 20.1 Estrategia

Ejecuta suite existente, `npm run data:check` y el control documental. Añade pocos grupos de pruebas significativas, parametrizados donde ayude. No copies toda la matriz normativa en cientos de assertions independientes ni uses miles de encuentros para descubrir una combinación rara.

La matriz documental puede tener más filas que las pruebas: los casos equivalentes se validan por la operación compartida y ejemplos de frontera. No dejes sin verificación rutas distintas que producen puntos o cambian elegibilidad.

### 20.2 Grupos automáticos mínimos

| Grupo | Riesgo que debe comprobar |
|---|---|
| Relojes y señal | Reajuste por causa; aro frente a tapón sin aro; tiro válido o inválido según frontera; administración pendiente tras señal. |
| Ventanas | Solicitud no ejecutada antes de oportunidad; prioridad manual; pausa manual cancela automática sin doble consumo; sustitución restringida durante series. |
| Faltas y contadores | Personal/control de equipo/bonus/categorías 2026; exclusión legal; contadores no confundidos. |
| Series y combinadas | Causa, ejecutor, repetición/anulación, sanción intercalada y reanudación única. |
| Posesión y F | Rebote ofensivo conserva ataque; adicional conserva F; bonus/técnica no inventan F ni ataque rival; cierre de período sin PER falsa. |
| Créditos | AS a canasta/libres elegible sin duplicidad; pérdida sin robo; rebote colectivo; TAP/TREC sobre intento común. |
| Presencia | Anotación y cambio con mismo reloj pero distinta secuencia; DNP frente a participación sin tiempo; conciliación de minutos e inferioridad. |
| Corrección | Atribución revisada coherente; cambio de valor/validez propaga; corrección reglamentaria no se convierte en resimulación arbitraria. |
| Terminación | Resultado administrativo separado de cancha; ejecución inválida no se presenta como resultado deportivo. |
| Memoria heredada | Clave semántica y conteos sin fragmentación artificial; ruta B permitida y caso incompatible. |
| Reproducción | Acta reconstruida igual a proyección; modalidades/export sin dobles sanciones ni decisiones. |

No fuerces todos esos casos dentro de un único partido artificial. Utiliza estados mínimos reproducibles y algunos encuentros completos.

### 20.3 Cinco partidos de integración

Ejecuta cinco partidos completos con invariantes y conciliación final:

1. Referencia `20261016`, políticas equilibradas y base MOTOR-09.
2. Cauta frente a agresiva con contexto de plantilla identificado.
3. Copia diagnóstica con energía baja y gestión de faltas; no fuerces qué equipo gana.
4. Plan de exposición repetida, conservando su carácter extremo, para revisar conteos MEM y ambas rutas.
5. Partido con dirección/manualidad o contraste de modalidades y reproducción, según las herramientas existentes.

Para prórroga, combinadas, inferioridad o revisión que no aparezcan naturalmente, añade casos preparados pequeños. No busques semillas indefinidamente ni manipules un partido natural sin identificarlo.

Estos encuentros no calibran la población ni demuestran que una política sea superior. Informa los marcadores observados y, si cambian respecto a MOTOR-08, explica mecanismos identificados; no atribuyas una diferencia a una causa única sin evidencia.

### 20.4 Recorrido manual para Dennis

Crea `docs/prompts/MOTOR-09-recorrido-manual.md` con arranque, URL real, perfil, semilla, pasos, observación esperada y señal de error. Debe ser ejecutable desde la interfaz sin editar código.

Incluye:

1. `npm run dev`, acceso y activación explícita de base MOTOR-09.
2. Reglamento/Acta en el panel, fuentes y distinción de norma/SEM.
3. Partido ordinario completo y acta con totales, porcentajes sin intentos y sujetos colectivos.
4. Petición de pausa/cambio, espera y ejecución legal; recursos una sola vez.
5. Canasta con adicional y falta de tiro fallada: F y acta diferentes de sus intentos.
6. Falta no de tiro con penalización y sanción administrativa intercalada: sin F ficticia ni posesión rival inventada.
7. Último libre y continuación; caso preparado de repetición/anulación con intentos válidos visibles.
8. Señal y administración pendiente; por cuartos no se detiene antes de resolverla.
9. Exclusión, reemplazo e inferioridad/terminación en caso diagnóstico identificado.
10. Una revisión de atribución y otra de valor/validez: todas las vistas actuales coherentes.
11. Memoria: conteos desglosados, causa de no respuesta y preparación en acción autorizada.
12. Export, reproducción y contraste de acta; formato anterior no compatible conserva archivo.

No marques probado por Dennis lo que solo ejecutaste automáticamente. Si utilizas Chromium, informa pantallas y acciones realmente recorridas y errores observados. No declares recorrido manual completo por haber arrancado la aplicación.

## 21. Documentación y entrega

### 21.1 Archivar este encargo

Guarda el prompt íntegro como `docs/prompts/MOTOR-09-reglamento-administracion-y-acta.md` o nombre equivalente conforme al catálogo. No alteres retrospectivamente sus decisiones para que coincidan con el código.

Actualiza el catálogo con recibido/en ejecución/completado técnicamente/pendiente de revisión manual, según corresponda. Todos los prompts para Claude Code se conservan en MD en Git.

### 21.2 Documentación técnica

Crea `docs/tecnico/motor09.md` con:

- Rama y commit base, confirmación efectiva de MOTOR-08 y alcance final.
- Mapa de requisitos a código, tablas y UI.
- Matriz de cobertura normativa por caso y fuente consultada.
- Correcciones respecto a lecturas heredadas, separando confirmado/corregido/no contrastado.
- Perfil estadístico, adaptación 2026 y convenciones propias de beM.
- Orden temporal, relojes, ventanas, series y combinadas.
- Posesiones/F y particiones de puntos, con ejemplos conciliados.
- Presencia, minutos, créditos colectivos y excepciones a invariantes simples.
- Tipos de revisión y propagación a derivados existentes.
- Cierre individual de pendientes MOTOR-08 y métricas MEM con denominadores.
- Versiones de perfil/export y límites reales de compatibilidad.
- Comprobaciones ejecutadas y pendientes; generación natural de incidencias diferenciada de administración cubierta.

Actualiza páginas temáticas, índices, `estado.md`, `CHANGELOG.md` y catálogo. Conserva el funcional íntegro de consulta. Cualquier precisión que cambie una perspectiva anterior debe señalarse, con su procedencia y alcance, para una futura consolidación; no se borra la historia.

### 21.3 Responsabilidad y decisiones

Los detalles técnicos internos reversibles se resuelven dentro de esta arquitectura. Completar una correspondencia normativa no requiere inventar un diseño nuevo ni devolver a Dennis todas las dudas de artículos.

Una contradicción real de diseño se identifica con referencias exactas y su impacto. Una dificultad de implementación se explica como tal. No etiquetes una limitación de desarrollo como decisión deportiva aceptada.

No apruebes por omisión las interpretaciones anteriores. Cada punto que afecte al acta o a las ventanas debe quedar confirmado, corregido o expresamente pendiente con sus consecuencias.

### 21.4 Respuesta final de Claude

Entrega una PR revisable, sin fusionar, y responde con:

1. Qué puede probar Dennis: arranque, URL efectiva, perfil, semilla y recorrido.
2. Qué quedó implementado y qué rutas antiguas usan ya la administración común.
3. Acta, conciliaciones y correcciones disponibles desde la interfaz.
4. Comprobaciones realmente ejecutadas; marcadores observados y límites.
5. Salvedades de MOTOR-08 cerradas, datos MEM correctamente definidos y pendientes reales.
6. Fuentes consultadas directamente, incidencias de acceso y casos no contrastados, si existen.
7. Rama, base y PR efectivas; estado pendiente del test manual.

No informes consumo de cuota ni duración de ventana si no tienes una medición proporcionada por el entorno. No declares el motor completo terminado: después viene MOTOR-10 de análisis, resumen e información y las entregas restantes del roadmap.

## 22. Criterios de aceptación

- [ ] Rama basada en `main` con MOTOR-08 realmente integrado; cambios locales ajenos conservados.
- [ ] Perfil FIBA 2026 v1.1 y correspondencias de interpretaciones identificados por fuente y caso.
- [ ] REG01–REG04 ejecutables y consultables; no solo filas documentales.
- [ ] Incidencia, clasificación, consecuencia y crédito separados sin segundo sorteo administrativo.
- [ ] Relojes por causa y orden temporal estable, sin simulación por ticks.
- [ ] Ventanas y elegibilidad comunes a tres modalidades, órdenes humanas y entrenador.
- [ ] Categorías 2026, contadores, series y combinadas coherentes; exclusión absoluta.
- [ ] Disponibilidad/inferioridad y terminaciones especiales sin participantes ni producción inventados.
- [ ] Posesiones beM y F conservan sus definiciones vigentes y sus relaciones causales.
- [ ] Puntos F/sanción/administración/otros y vinculados/no vinculados reconcilian por separado.
- [ ] Política estadística versionada y créditos derivados de hechos: asistencias, pérdidas, robos, rebotes, tapones y faltas.
- [ ] Acta individual/colectiva completa, porcentajes y DNP correctos, sujetos colectivos visibles.
- [ ] Presencia, minutos y más-menos derivados del orden efectivo y de su universo.
- [ ] Revisiones distinguen corrección estadística, reglamentaria y técnica; propagación coherente.
- [ ] Reconstrucción de marcador/acta coincide con proyecciones de ejecución.
- [ ] Pendientes MEM tratados sin cuotas de respuesta ni ampliación ciega de capacidad; ruta B funciona dentro del encargo.
- [ ] Panel, perfil candidato y activación explícita; norma diferenciada de SEM.
- [ ] Export/reproducción versionados, sin duplicar sanciones ni destruir originales incompatibles.
- [ ] Pruebas automáticas acotadas, cinco partidos de integración y casos preparados pertinentes.
- [ ] Recorrido manual claro; ejecución real y pendientes declarados.
- [ ] Prompt archivado íntegro, documentación actualizada y PR sin fusionar.
