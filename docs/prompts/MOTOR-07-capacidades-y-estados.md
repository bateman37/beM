# MOTOR-07 — Capacidades, energía, Forma y momentos completos

**Proyecto:** beM.  
**Destinatario:** Claude Code, exclusivamente en `beM`.  
**Fecha:** 16 de octubre de 2026.  
**Estado:** preparado para ejecutar; no acredita inspección de código ni pruebas por ChatGPT.  
**Base:** Dennis confirma MOTOR-06 en `main`. El informe previo citaba PR #7 abierta; prevalece su confirmación posterior, con comprobación del estado real de Git.  
**Entrega:** MOTOR-07 del roadmap; una rama y una PR revisable, sin fusionar.

## Índice

1. [Resultado y límites](#1-resultado-y-límites)
2. [Base y salvedades de MOTOR-06](#2-base-y-salvedades-de-motor-06)
3. [Fuentes y disciplina](#3-fuentes-y-disciplina)
4. [Cerrar el uso causal de las 32 capacidades](#4-cerrar-el-uso-causal-de-las-32-capacidades)
5. [Gesto, preparación y cuerpo](#5-gesto-preparación-y-cuerpo)
6. [Energía: esfuerzo y deterioro selectivo](#6-energía-esfuerzo-y-deterioro-selectivo)
7. [Forma persistente y presión contextual](#7-forma-persistente-y-presión-contextual)
8. [Momentos individuales y Consistencia](#8-momentos-individuales-y-consistencia)
9. [Momento colectivo y episodios](#9-momento-colectivo-y-episodios)
10. [Composición matemática y neutralidad](#10-composición-matemática-y-neutralidad)
11. [Laboratorio, panel, registro y reproducción](#11-laboratorio-panel-registro-y-reproducción)
12. [Comprobaciones acotadas y recorrido manual](#12-comprobaciones-acotadas-y-recorrido-manual)
13. [Ejecución, documentación y cierre](#13-ejecución-documentación-y-cierre)
14. [Anexo A: semillas explícitas](#14-anexo-a-semillas-explícitas)
15. [Anexo B: mapas funcionales de referencia](#15-anexo-b-mapas-funcionales-de-referencia)

## 1. Resultado y límites

Implementa el uso contextual completo de las **32 capacidades —18 técnicas, 7 físicas y 7 mentales—** sobre el repertorio ya disponible, junto con Energía, Forma, tres momentos individuales, momento colectivo, Consistencia y presión.

Dennis debe poder preparar y jugar partidos completos con perfiles reconocibles: veterano técnico de físicas bajas, joven atlético con peor lectura, jugador en buena/mala Forma, referente fatigado y recambio, jugador estable/irregular y estados individuales/colectivos distintos. Su diferencia se explica por tareas y hechos, no por un overall o un multiplicador general de rendimiento.

«Todas las capacidades» significa conexión causal pertinente y comprobable. No significa usar las 32 en cada tiro, imponer una contribución positiva en todos los partidos o fabricar acciones para que cada una aparezca.

Conserva el motor por acontecimientos dentro de posesiones, contexto pequeño y tareas compartidas. El tiempo de los estados es deportivo; no requiere ciclos por segundo, movimientos de diez jugadores o otra simulación de partido.

**No incluye** temporada, entrenamiento, envejecimiento, evolución de Forma entre fechas, recuperación interpartidos del manager, química de vestuario, Liderazgo nuevo, moral acumulable, memoria rival o políticas avanzadas del entrenador. Sus entradas se editan en el laboratorio y su continuidad futura queda preparada, sin construir el manager.

La rotación básica puede seguir utilizando su utilidad efectiva y sus límites actuales. No reescribas el librillo de MOTOR-08 ni retires automáticamente al referente por cruzar un umbral de energía o de momento.

## 2. Base y salvedades de MOTOR-06

### 2.1. Qué se ha comunicado

Dennis informa integración en `main`. Claude comunicó 95 pruebas, cinco encuentros de cierre, `data:check`, comprobación documental y recorrido Chromium; son evidencias comunicadas, no repetidas por ChatGPT. También comunicó semilla `20261016`, marcador 82–97, perfil hasta SEM-MOTOR06 y `export/5`.

Comprueba contratos/versiones reales antes de modificar. No fijes el nuevo resultado en 82–97 ni cambies coeficientes para conservarlo. La cantidad de pruebas anteriores no es un objetivo que haya que superar.

ChatGPT intentó acceder mediante el plugin GitHub seleccionado: figura instalado, pero esta sesión no expone sus herramientas ni una skill de lectura disponible. Este prompt se apoya en el funcional y el informe del usuario; **no declara auditado el código de `main`**. Claude debe realizar la lectura localizada en el repositorio.

### 2.2. Salvedades reglamentarias

Consulta `docs/tecnico/motor06.md` y el §8.2 del prompt MOTOR-06 archivado. La categoría del hecho, su sanción y la exclusión no son decisiones deportivas abiertas para inventar: deben corresponder al perfil FIBA 2026 ya elegido.

El resumen contrastado de MOTOR-06 identifica artículos 37/38, 38.2.3/41.4 y 17/29 y distingue disruptiva y flagrante. Si la implementación sigue usando una lectura distinta por el 403, corrige los casos activos contra esa referencia. No asumas que separar las etiquetas basta para tener bien libres, reanudación, reloj y elegibilidad.

No apruebes una regla de «dos de cualquier categoría expulsan» ni un «siempre dos libres» por conveniencia de código. No generes categorías extraordinarias nuevas para probarlas. Los casos necesarios se corrigen de forma localizada; el cierre extraordinario completo sigue en MOTOR-09.

Si una fuente sigue inaccesible, registra el impedimento y qué contenido contrastado usaste. No afirmes haberla leído. Si un supuesto imprescindible no está cubierto por el contenido disponible, identifica el artículo/dato concreto, sin volver a pedir aprobación del modelo entero.

### 2.3. Interpretaciones declarativas pendientes

Contrasta la tabla de respuestas de POS05–POS08 con los contratos de MOTOR-06: mano a mano admite respuesta compatible con poseedor/receptor; indirectos usan seguimiento/cambio/negación pertinentes, sin copiar ciegamente cuatro coberturas de bloqueo directo a toda pantalla.

Contrasta ESP y saques con los anexos B/C archivados de MOTOR-06: actores, requisitos, alternativas, seguridad, plazos, solapamiento y cierre de secuencia directa. Corrige divergencias causales; conserva equivalentes técnicos válidos con su correspondencia documentada.

No apruebes en bloque todo el contenido por estar implementado ni rediseñes el repertorio. Esta revisión es acotada y necesaria para aplicar capacidades/estados sobre tareas correctas. No repitas matrices masivas ni ejecutes un partido por cada cruce.

## 3. Fuentes y disciplina

Lee `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, índices, estado y roadmap. Localiza páginas temáticas vigentes de los capítulos originales:

| Capítulo | Lectura necesaria |
|---|---|
| 3 | Catálogo y mapa causal de 32 capacidades. |
| 4–6 | Cuerpo, tendencias y experiencia sin bonus por edad. |
| 12 | Técnica principal, preparación, oposición y desenlaces. |
| 13–14 | Energía, Forma, momentos, Consistencia, presión y episodios. |
| 19 y 24 | Registro, visibilidad y laboratorio. |
| 26–29 | Panel, perfiles, validación, semillas y cobertura. |

Consulta contratos de tareas y las salvedades concretas en los documentos anteriores cuando sea necesario. No vuelques el funcional completo ni releas los ocho originales/todos los prompts.

Trabaja exclusivamente en `beM`; no inspecciones otros repositorios. Conserva stack/arranque. No impongas PostgreSQL, framework, Docker, autenticación o despliegue.

Las decisiones técnicas reversibles son tuyas. No inventes otras capacidades, estados, coeficientes o mecánicas. Las semillas nuevas explícitas de este prompt completan el incremento sin pretender calibración; una versión posterior ya aceptada para el mismo campo prevalece con trazabilidad.

Si falta una decisión funcional o una magnitud indispensable fuera de estas referencias, indica `DECISIÓN REQUERIDA` con campo, fuente y efecto; avanza con lo independiente. Lo expresamente diferido a otra entrega no exige una nueva confirmación.

## 4. Cerrar el uso causal de las 32 capacidades

### 4.1. Inventario de consumidores reales

Localiza dónde se consulta cada capacidad y qué operación depende de ella. El mapa del anexo B es el contrato funcional, no prueba de que el código ya lo cumple.

Para cada una registra ID, tarea, actor propietario, oposición pertinente, fase —elegibilidad, percepción, elección, ejecución o coste—, receta/fila, unidad, efecto esperado y evidencia. Distingue lectura de un campo, efecto causal y ausencia de exposición en un encuentro.

No añadas una nota a una fórmula únicamente para completar un listado. Si una capacidad ya es causal, conserva su intervención válida; no duplica su aporte en otra fase equivalente.

### 4.2. Cierres especialmente importantes

- **FIS01 Velocidad:** acceso/retorno/persecución larga resumida en transición, sin rutas continuas ni mejorar tiros por correr más.
- **FIS02/FIS03:** primer paso y ajuste corto pertinentes, distintos de velocidad máxima.
- **FIS06 Resistencia:** gasto bajo carga comparable, sin bonus directo de acierto.
- **MEN02/MEN03:** percepción y elección propias de director/receptor/defensor, sin conocimiento perfecto ni prestar las notas del base.
- **MEN05:** atención y continuidad donde corresponde, no una probabilidad de error duplicada en cada fase lógica.
- **MEN06:** amplitud de variación, sin ventaja permanente de talento medio.
- **MEN07:** preservar ejecución/elección bajo exigencia, sin un bonus de final que aparezca de la nada.

Reutiliza tareas y recetas vigentes; el anexo A ofrece solo las conexiones nuevas que falten. Si una técnica alta no puede intervenir porque no existe acceso, la capacidad no lo crea automáticamente.

### 4.3. Escala y experiencia

Escala absoluta continua equivalente 1–30, presentación redondeada cuando corresponda. No renormalices por liga/equipo ni reescribas las notas base al aplicar estados.

Un jugador de 40 años conserva técnica, lectura y alcance actuales aunque tenga poca aceleración/salto. Puede resolver mejor lo que le permite llegar y elegir; no recibe un bonus invisible de edad/experiencia ni recupera físicas perdidas por ser veterano.

Edad, potencial, reputación, roles y tendencias no se añaden a las 32. Envejecimiento/desarrollo siguen fuera de este motor de partido.

## 5. Gesto, preparación y cuerpo

### 5.1. Técnica principal

Mantén separados valor estadístico, gesto, técnica principal, preparación, origen y calidad previa. El anexo B conserva la tabla de ejecuciones.

TEC01/02 resuelven triple/media; TEC03 tiro interior controlado; TEC04 finalización en progresión/aérea y palmeo de tiro; TEC05 libre. El gesto real decide, no la etiqueta narrativa o que valga dos puntos.

TEC06 prepara los tiros que lo requieren por movimiento; no reemplaza TEC01/02 ni añade dos veces la misma mejora de calidad/puntería. Un triple de recepción no necesita TEC06 automáticamente. TEC11 crea posición/ventaja de poste; el tiro usa su técnica real.

No es requisito crear una ruleta estética de mates, ganchos y floaters. Sí evitar que un gesto ya representado utilice la técnica equivocada y poder distinguir toque estable de finalización en progresión.

### 5.2. Cuerpo y acceso

Deriva alcance funcional como combinación aceptada de altura/envergadura normalizadas, con referencias absolutas y límites del perfil. No afirma medir centímetros de alcance de pie.

El tamaño interviene en acceso/oposición pertinentes, el salto como capacidad dinámica separada y Fuerza en contacto. Peso corporal mantiene efecto directo independiente cero. Energía no reduce altura o envergadura.

Si el alcance ya resume dos medidas, no vuelvas a sumarlas en esa misma tarea. Si su efecto ya cambió oposición/calidad, no reaparece como idéntico bonus de conversión. No aporta nada directo a libre, Visión o desplazamiento lateral.

Conserva rangos/normalizaciones actuales aceptados; no redimensiones toda la población para esta entrega. Datos ausentes o estimados tienen política/procedencia explícita, no una reparación oculta.

## 6. Energía: esfuerzo y deterioro selectivo

Energía es reserva 0–100 recibida al inicio. No todos empiezan en 100. Mantén gasto por intervalo real/carga y ajuste por Resistencia, recuperación de banquillo y pausas deportivas versionadas.

Conserva la curva monótona continua y sus semillas vigentes: severidad aproximadamente 0 a E100, 0,01 a E70, 0,10 a E50, 0,30 a E30, 0,65 a E10 y 1 a E0, salvo ajuste posterior expresamente aceptado.

La severidad se aplica al máximo de cada tarea/componente sensible; no resta el mismo porcentaje a las 32 capacidades. Las exigentes deben deteriorarse claramente bajo 10 sin hacer imposible toda acción. No borra conocimiento táctico por una limitación de llegada física.

Cada actor usa su propia energía. El banquillo no paga carga de quien está jugando. Presión, pantalla, retorno y relato no cobran varias veces el mismo intervalo/esfuerzo. El descanso largo sustituye el corto que corresponda; la pausa de pantalla no recupera.

**Precedencia de datos:** conserva la recuperación de tiempo muerto realmente aceptada en el perfil actual. MOTOR-02 propuso 1,5 como extensión SEM y un documento histórico citaba 2; no vuelvas a 2 automáticamente por releer el antecedente. Documenta la versión efectiva utilizada.

No cambies umbrales de rotación para demostrar energía. Un referente con E30 puede seguir siendo mejor que el suplente, pagando su deterioro selectivo. Las mejoras estratégicas de rotación siguen en MOTOR-08.

## 7. Forma persistente y presión contextual

### 7.1. Forma

Forma es un estado de etapa, continuo/acotado, recibido en la entrada y **estable durante el partido**. No sube por anotar, no baja por perder y no se resetea al cambiar periodo. Puede conservarse entre ejecuciones como entrada configurada sin construir un calendario.

Si falta una escala activa aceptada, el anexo A propone F entre −1 y 1, neutral 0. Su efecto se declara por ámbito: tiro, control ofensivo, defensa/disputa y coordinación. No altera las notas permanentes ni añade velocidad/tamaño universalmente.

Dos perfiles pueden rendir de forma diferente por Forma; no se garantiza que un 12 en buena etapa supere a un 18 en cualquier tarea. Rol, oportunidades, oposición y azar siguen importando.

### 7.2. Presión

Calcula exigencia como **máximo** de importancia del encuentro y tensión de la situación, acotado. No sumes dos exigencias completas equivalentes ni equipares presión a una sola etiqueta estadística de final ajustado.

MEN07 reduce la pérdida de rendimiento pertinente; no sube el talento por jugar un partido importante. La tensión usa relojes/margen/contexto previo y no sabe el siguiente resultado.

El anexo A explicita una semilla de importancia/tensión, límites de ejecución y de elección. No convierte la presión en otro estado acumulado ni en una penalización repetida durante preparación, pase y tiro de la misma causa.

En tareas donde no corresponde presión no se aplica. En el libre no inventes un defensor. Para seleccionar, usa las capacidades efectivas permitidas del actor propio, sin filtrar estados rivales internos a la política.

## 8. Momentos individuales y Consistencia

### 8.1. Tres ámbitos, no treinta y dos

| Ámbito | Se aplica a | No se aplica como |
|---|---|---|
| M-TIR | Ejecución de tiro pertinente, incluido libre según perfil. | Manejo, Visión, defensa o multiplicador físico. |
| M-OFE | Control/pase/atención ofensiva y continuidad pertinentes. | Segunda prima de acierto al triple/libre. |
| M-DEF | Atención, seguimiento, respuesta y disputa pertinentes, incluido rebote. | Mejora ofensiva o tamaño corporal. |

Conserva tres estados por jugador, acotados, con persistencia, variación relacionada con Consistencia e impulsos elegibles. No añade un estado psicológico por relación o variante.

Un momento favorable permite fallar; uno frío permite anotar. Una racha de aciertos no prueba por sí misma que M-TIR haya cambiado. La secuencia y el estado son conceptos distintos.

### 8.2. Tiempo deportivo y actualización causal

Antes de una interacción obtén el estado efectivo para esa frontera, procesando el intervalo pendiente de forma resumida. Resuelve con ese estado. Al confirmar el hecho, clasifica episodios y aplica sus impulsos **a partir de entonces**, nunca a la probabilidad de la misma acción que los causó.

No actualices por cada frase, renderizado, apertura de panel o velocidad. La representación puede ser perezosa por actor/ámbito: conserva timestamp deportivo y procesa el intervalo de una vez cuando la tarea/episodio lo necesita.

Una lectura diagnóstica no consume RNG ni cambia el estado. Usa valores ya comprometidos o una proyección determinista de atenuación claramente identificada, sin materializar ruido desde la interfaz. En una misma frontera/ámbito, consultas repetidas usan la misma actualización cacheada.

Al confirmar un episodio en una frontera posterior al inicio de una acción, procesa el intervalo hasta ese momento antes del impulso. No utiliza retrospectivamente la duración/desenlace futuro para mejorar el estado con el que se eligió o ejecutó la acción anterior.

### 8.3. Consistencia y neutralidad

Mayor MEN06 reduce amplitud; menor permite extremos. No le añade talento medio como segundo bonus. Un ruido centrado en logit no preserva automáticamente la media de probabilidad.

La propuesta explícita de §10/anexo A usa perturbación acotada y centrada **después** de calcular la probabilidad base contextual, con construcción de suma cero en distribuciones excluyentes. Así puede comprobarse neutralidad en contexto fijo sin miles de partidos.

Episodios, forma inicial no neutral, selección adaptativa y decisiones rivales pueden cambiar el rendimiento real; no se exige neutralidad de todos los partidos completos. Sí distinguir esos efectos de un desplazamiento accidental introducido solo por variar Consistencia.

### 8.4. Banquillo y pausas

Salir no borra el momento y volver no reinicia su distribución. En banquillo hay retorno gradual sin episodios por acciones que no ejecutó. El perfil puede atenuar más rápido; no se otorgan impulsos positivos por sentarse.

Tiempos muertos e intervalos deportivos atenuan según tipo, una vez, para ambos equipos cuando corresponde. No fijan estados a neutral ni garantizan cortar una racha. La recuperación de energía y atenuación del momento son operaciones distintas.

Los tres grupos de tendencias permanentes no se reescriben por episodios. No añadas otra tendencia mutable de «confianza» para representar lo mismo.

## 9. Momento colectivo y episodios

### 9.1. T pertenece al equipo

Un solo T por equipo, acotado y breve. No es media de los cinco momentos, moral de temporada ni química. Una sustitución no lo recalcula ni lo borra.

T puede ayudar de forma limitada a coordinación, atención compartida y elección dentro de una respuesta colectiva. **No aumenta directamente la conversión de un tiro ya definido**, técnica individual de pase ya elegido, velocidad, salto o tamaño. No altera reglamento/créditos.

Una mejor respuesta puede crear recepción/preparación más favorable; el tiro posterior usa esa oportunidad y los estados individuales pertinentes, sin otra prima de T. El defensor también necesita acceso real para coordinar una ayuda.

### 9.2. Jugadores que dan vida al equipo

Un director que reorganiza tras un problema real, una referencia que corrige una ayuda o un esfuerzo útil significativo pueden producir episodios colectivos. Utiliza Comprensión, Visión, Decisiones, Anticipación, Concentración y técnicas ya existentes.

No añadas Liderazgo/carismo ni un aura por edad, fama, posición o presencia en pista. Entrar no fija T positivo; salir no borra el impulso de una intervención previa.

### 9.3. Catálogo corto EPI01–EPI06

El anexo B conserva las seis definiciones aprobadas. Cada episodio declara condición, causa/identidad, ámbito/destinatario, signo, magnitud y límite. No lo infieras solo de puntos, racha o que el rival anotó.

EPI01 exige ejecución difícil significativa previa y efectivamente resuelta. EPI02 exige error representado de atención/ejecución en su ámbito, no fallar un buen tiro. EPI03 exige un problema colectivo real y su recuperación efectiva; EPI04 una intervención útil significativa; EPI05 un fallo colectivo de coordinación representado; EPI06 una pausa deportiva pertinente.

Si el motor no produjo la evidencia de un episodio, no la inventes a posteriori. Amplía solo el motivo/contexto necesario de la tarea pertinente, no un índice nuevo que puntúe movimientos no simulados.

### 9.4. Una cadena, un impulso equivalente

Agrupa señales por causa/cadena ya disponible. Pantalla, pase y canasta que describen la misma ventaja no crean tres impulsos equivalentes. Conserva un registro pequeño de causas tratadas en la cadena activa; el historial completo queda fuera del contexto.

No cobres EPI03 otra vez por organizar normalmente tras haber resuelto el desorden. Pedir tiempo muerto u ordenar reorganizar no es éxito de coordinación hasta que se resuelva la tarea correspondiente.

Un episodio puede tener efectos individuales/colectivos distintos si sus causas/destinatarios son explícitos, pero su magnitud conjunta debe respetar el perfil. No suben automáticamente tres ámbitos y ambos equipos por cada canasta.

No hay rubber banding: perder de mucho o recibir un parcial no activa T compensatorio por sí solo.

## 10. Composición matemática y neutralidad

### 10.1. Etapas con causa única

1. Capacidades base y cuerpo, con propietarios correctos.
2. Ajustes selectivos de energía en tareas sensibles; no una reducción global de notas.
3. Oportunidad/oposición y preparación reales, con referencias comunes.
4. Forma y exigencia de presión declaradas para esa tarea.
5. Momento individual/colectivo permitido, dentro de su presupuesto común.
6. Una resolución coherente y consecuencias; después episodios para el futuro.

No obliga a seis acontecimientos o sorteos. Es separación de responsabilidades. Si una causa ya fue aplicada en oportunidad, no reaparece idéntica en conversión. Cuando actor y contraparte tienen estados, utiliza ambos donde sean pertinentes sin sumar dos oposiciones completas.

### 10.2. Forma y presión en referencia binaria

Para una referencia contextual p, conserva la logística calibrada vigente. Añade una sola corrección de Forma por actor/contraparte y una de presión al lado de ejecución pertinente, con los límites de §14. Los coeficientes son por tarea, no habilidad×forma×energía×momento para las 32.

En una distribución excluyente, los ajustes deterministas de Forma/presión usan los modificadores coherentes del mecanismo común, no Bernoullis independientes que produzcan dos resultados principales. Conserva relaciones condicionales de canasta con falta y series.

### 10.3. Momento sobre probabilidad, no ruido ciego en logit

Para una binaria ya contextualizada p, usa:

`p_m = p + alpha * Z * min(p, 1-p)`

con `|Z| ≤ 1` y `0 ≤ alpha < 1`. No hace falta recortar probabilidades artificialmente. En contexto fijo con Z centrado conserva E[p_m]=p; con un estado inicial/episodio deliberadamente no neutral sí puede haber un efecto temporal.

Para tareas individuales Z procede del ámbito pertinente. Si T es elegible, mezcla individual/colectivo con pesos que suman 1, dentro del mismo alpha. T está excluido de conversión directa del tiro y del pase individual ya elegido.

Si ambos lados de una tarea opuesta tienen momento pertinente, usa la mezcla acotada actor/contraparte del perfil, con signo contrario para la oposición. Si no hay contraparte elegible, omite su término; no inventes un defensor. El estado de la contraparte no se presta al decisor como conocimiento.

### 10.4. Resultados excluyentes

No perturbes cada resultado y recortes/normalices después esperando que eso mantenga el centro. Para una distribución p_j y un grupo G de resultados favorables **ya definido por esa tarea**:

`P_G = suma(p_j para j en G)`

`v_j = p_j*(1-P_G)` si j pertenece a G; en otro caso `v_j = -p_j*P_G`.

`p'_j = p_j + alpha*Z*v_j`.

El vector v suma cero y conserva categorías/coherencia para los límites indicados. Con Z centrado y contexto fijo la media de cada categoría se mantiene. G no es siempre «tiro» ni puede incluir un éxito que no corresponde al actor: usa conservar/controlar, recepción útil o respuesta defensiva pertinente según la tarea.

Declara G en datos y vincúlalo a los resultados reales del mecanismo. No modifiques canasta y falta como si fueran categorías excluyentes cuando la definición permite ambas. Si un mecanismo no tiene grupo favorable interpretable, no apliques momento allí hasta declarar su semántica; basta su intervención en las tareas pertinentes ya definidas.

### 10.5. Presupuesto y auditoría

El límite alpha se aplica una vez a la tarea, también cuando coinciden T y momento individual. No se añaden máximos separados de racha/individual/colectivo.

Forma/presión tienen sus unidades y presupuesto determinista explícito; energía conserva su efecto físico selectivo. No uses un recorte final para anular el deterioro crítico ni un balance global que reponga lo que un estado acaba de quitar.

La neutralidad se comprueba sobre la salida final en contextos fijos y sin episodios sesgados, no por igualdad de marcadores. No basta registrar que la media del ruido era cero antes de una transformación no lineal.

## 11. Laboratorio, panel, registro y reproducción

### 11.1. Entradas y escenarios

Amplía fichas/preparación con energía inicial, Forma inicial, M-TIR/M-OFE/M-DEF iniciales y T inicial de equipo. Los números exactos de estados se editan bajo modo diagnóstico del laboratorio, no como instrucciones del entrenador durante el partido.

Mantén doce jugadores por equipo y edición +1/+3/+5 para capacidades. Esos botones no se aplican a escalas de estados. Tendencias y capacidades siguen separadas. Los fixtures anteriores con estados neutrales explícitos se conservan; una migración de formato se identifica, sin cambiar históricos.

Ofrece copias identificadas de escenarios de contraste, usando jugadores existentes: veterano técnico/joven atlético, referente fatigado/recambio, Forma positiva/negativa, Consistencia alta/baja y estados iniciales controlados. No requiere crear otros equipos ni cambiar toda la población; los cambios concretos de cada copia se listan y no sobrescriben planes de Dennis.

La época de Forma entre partidos no se simula aquí. El laboratorio conserva la entrada configurada y cada ejecución arranca de su copia congelada, sin arrastrar accidentalmente el final del partido anterior.

### 11.2. Visibilidad

Vista propia: energía con número/barra; Forma y momentos con categorías cualitativas y ámbito legible. T propio se muestra como respuesta/conexión del equipo, no multiplicador de tiro. No dependas solo de color.

Rival: hechos públicos/observaciones permitidas, sin números internos exactos de energía, Forma o momentos. Una racha rival se describe como racha, no como prueba de su estado secreto. El entrenador automático recibe la misma política de conocimiento vigente.

Diagnóstico de laboratorio: puede ampliar números, episodios, causas, contribuciones y referencias, indicando frontera de actualización. No se filtran al decisor ni se recalculan al abrir el panel.

### 11.3. Panel existente y datos

Amplía RES01–RES03/06–07, COR01–02, ACT01–ACT12 donde corresponda, POB03 para definiciones de tendencias ya existentes y políticas de información pertinentes. Conserva SUP01–04 y mapa de consumidores.

Cada coeficiente nuevo, semántica de estado, curva, episodio, frontera de categoría y regla de composición tiene tipo/unidad/rango/procedencia y consumidor. Las invariantes —T sin tiro directo, peso/edad sin prima, propietarios de capacidades— no son toggles de balance.

El panel muestra curvas de energía por tarea, respuesta de Forma/presión, amplitud por Consistencia y perturbación final de probabilidades/distribuciones con contexto fijo. Esas vistas usan operaciones compartidas y no consumen RNG deportivo.

Sigue el ciclo de candidatas, validación, publicación/activación explícita, historial, importación/exportación y congelación por encuentro. Los nuevos campos requeridos no aparecen como defaults ocultos en perfiles históricos.

### 11.4. Registro mínimo

Para hechos diagnosticados conserva capacidades realmente usadas, propietario, receta, energía efectiva, Forma, exigencia, estado previo por ámbito/T permitido, correcciones y presupuesto aplicados, resultado y episodios futuros.

Separa capacidad consultada de contribución causal y exposición. El mapa puede decir «no hubo exposición» sin concluir que una capacidad está inerte. No registra intervenciones de actores que no participaron.

Episodios guardan ID/cadena, evidencia, destino, signo, magnitud, límite y exclusión/deduplicación. La evolución conserva intervalo deportivo y estado previo/posterior; no inventa muestras por segundo para un gráfico.

La exportación de esta versión incluye entradas y perfil efectivo completos, estados/timestamps comprometidos y aleatoriedad necesaria. Reproducir vuelve a calcular el mismo encuentro con órdenes ancladas. Las innovaciones deportivas usan el generador explícito versionado y orden estable; UI/exportación no consumen tiradas.

Mantén rechazo explícito de `export/5` si el nuevo núcleo no lo soporta; no cambies el número por rutina si el contrato sigue compatible, ni prometas reproducción entre versiones deportivas distintas sin demostrarla. Conserva archivos e identidades históricas.

## 12. Comprobaciones acotadas y recorrido manual

### 12.1. Pruebas pequeñas necesarias

Reutiliza herramientas/checks del proyecto; no escribas una suite espejo por cada fórmula o setter.

- Mapa de 32 capacidades: referencias/propietarios/consumidores y sensibilidad pertinente. Casos parametrizados breves cubren las conexiones; no 32 encuentros completos.
- Gestos clave: TEC03/04, TEC06 frente a técnica de distancia, TEC11 frente a acierto y libre sin oposición ficticia.
- Cuerpo: misma causa una vez, salto separado, peso/edad sin prima; variar edad sola con demás entradas idénticas no cambia deporte.
- Energía: curva continua/monótona y casos E100/85/70/50/30/10/5; carga/recuperación una vez y Resistencia causal.
- Forma constante durante el encuentro; presión=max de señales, MEN07 preserva sin bonus de talento.
- Momentos: dominio, actualización causal, banquillo/pausas y deduplicación de episodios, sin consultar RNG desde UI.
- T: efecto permitido sobre coordinación/elección y **cero efecto directo** al convertir un tiro/pase individual idéntico ya fijado.
- Neutralidad: usa pares de innovaciones opuestas en contextos fijos y estados neutrales, sin episodios, para comprobar centro sobre probabilidades binarias y categorías; verifica mayor amplitud con menor Consistencia mediante construcción/casos controlados. No hacen falta miles de partidos ni comparar solo ruido latente.
- Composición: probabilidades válidas, suma de categorías y condicionales compatibles, presupuesto individual/T una vez.
- Registro/perfil: congelación, reproducción y visibilidad propia/rival/diagnóstico; las salvedades previas tienen evidencia localizada.

Los pares opuestos son una comprobación matemática del mecanismo de variación simétrico, no una auditoría empírica de toda la temporada. Los episodios y la selección contextual se evalúan aparte con su alcance.

### 12.2. Partidos completos

Referencia de cierre: **cinco ejecuciones completas**, reutilizando registros:

1. Base de la nueva versión, escenario y semilla `20261016`, con entradas neutrales declaradas.
2. Copia con diferencias explícitas de Forma y reservas de energía, para revisar estado/tarea en contexto.
3. Copia con contraste técnico/físico veterano-joven y Consistencia, manteniendo edad sin efecto directo; enumera todos los cambios.
4. Copia con momentos/T iniciales e importancia alta, para revisar sus ámbitos y episodios reales.
5. Reproducción de una ejecución anterior de esta lista en otro modo, con las mismas entradas y órdenes.

No declares causalidad a partir del marcador de variantes que cambian varias entradas: son recorridos integrados. La atribución de cada causa la dan los casos controlados y la traza.

Concilia acta, tiempo, minutos, energía, control, referencias y cierre. No repitas matrices de 24 cruces ni agregues un barrido de semillas por rutina. Usa fixtures para episodios raros en vez de esperar a que ocurran. Amplía checks solo si un fallo concreto lo justifica.

### 12.3. Recorrido manual para Dennis

Deja `docs/prompts/MOTOR-07-recorrido-manual.md` o equivalente enlazado, con comandos/URL reales del repositorio; el informe anterior cita `npm run dev` y `http://localhost:5173/`, que debes comprobar.

| Prueba | Qué revisar |
|---|---|
| Catálogo | 32 notas agrupadas; cada una tiene tareas/consumidores reales, no otra habilidad escondida. |
| Gesto/preparación | Técnica de tiro y preparación separadas; poste crea sin reemplazar el tiro. |
| Energía | Poco efecto entre 100–70 y coste creciente bajo 10; E30 no obliga a sacar al referente. |
| Forma | Entrada positiva/negativa y categoría propias; no cambia con canastas o al acabar un cuarto. |
| Momentos | Tres ámbitos separados, estado inicial y evolución registrada; un acierto no garantiza calentarse. |
| Consistencia | Mayor estabilidad frente a más variación sin etiqueta de «más talento». |
| Presión | Importancia/tensión y resistencia de MEN07, sin bonus universal de final. |
| Colectivo | Una reorganización real puede influir sin anotar; entrar/salir no activa/borra un aura. |
| Pausas | Pausa visual no cambia estados; tiempo muerto/intervalo deportivo tiene efecto una vez. |
| Veterano | Lectura/técnica útiles pese a físicas bajas; edad sola no cambia resultados. |
| Información | Rival no muestra estados internos exactos; diagnóstico separado del conocimiento de IA. |
| Panel | Curvas, composición, episodios y nuevos datos SEM localizables con valor efectivo. |
| Perfiles | Activar candidata no cambia partido abierto ni históricos. |
| Reproducción | Export actual reproduce con estados y órdenes; incompatible anterior se explica. |
| Regresión | Tres modos, repertorio posicional/ESP/saques, defensa y edición de fichas siguen utilizables. |

No registres pruebas de Dennis hasta su confirmación. Si tu entorno no permite UI real, informa qué quedó pendiente; leer código no equivale a recorrer pantallas.

## 13. Ejecución, documentación y cierre

1. Confirma base de `main` y contratos reales. Crea `feature/MOTOR-07-capacidades-y-estados` o equivalente según normas/entorno.
2. Archiva este prompt íntegro, anexos incluidos, en `docs/prompts/MOTOR-07-capacidades-y-estados.md` o equivalente aprobado; registra su estado real.
3. Haz el contraste acotado de salvedades previas y el mapa real de consumidores de las 32 capacidades. Corrige solo lo necesario para esta entrega.
4. Conserva recetas correctas y completa las conexiones faltantes, el gesto/cuerpo y energía selectiva.
5. Carga candidata explícita SEM y construye Forma/presión, momentos/neutralidad y episodios sobre las mismas operaciones.
6. Integra entradas/vistas, panel, diagnóstico, perfiles y reproducción, manteniendo el recorrido de partido completo durante el trabajo.
7. Ejecuta checks acotados y UI posible; corrige fallos del objetivo.
8. Actualiza páginas temáticas, índices, mapa técnico, cobertura, estado, changelog y catálogo de prompts. Documenta mecanismo de variación/neutralidad y cierre de salvedades en `docs/tecnico/motor07.md` o equivalente.
9. Entrega commits coherentes y PR sin fusionar, explicando rama de trabajo/PR si difieren. Si no puedes abrirla, deja rama/commits y el impedimento concreto.

Preserva funcional íntegro de consulta y originales históricos. No reconstruyas otro mega funcional del repositorio ni declares «realismo validado» por cargar SEM y pasar tests.

Referencia de tamaño: hasta aproximadamente el 50 % de una ventana de cinco horas de Claude Code, sin garantía ni porcentaje inventado. Si no es medible, dilo. No añadas trabajo para gastar cuota. Si se limita la sesión, deja checkpoint con rama/commit, estado ejecutable, pruebas reales, bloqueo y siguiente paso.

Pruebas automáticas justas; Dennis hará mucha prueba manual. No E2E masivos, snapshots enormes, tests por cantidad ni campañas de partidos sin pregunta. No empieces MOTOR-08 por tu cuenta.

### Criterios de cierre

- [ ] 32 capacidades causales por tareas pertinentes, con propietarios/consumidores y evidencia, sin overall ni relleno artificial.
- [ ] Técnica principal/preparación correctas; cuerpo/salto/peso/edad sin duplicaciones o primas excluidas.
- [ ] Energía selectiva, gasto/recuperación coherentes y curva exigida; referente fatigado sigue siendo valorable por utilidad real.
- [ ] Forma recibida y estable, sin temporada o retroalimentación por resultados.
- [ ] M-TIR/M-OFE/M-DEF con persistencia/variación por Consistencia, actualización deportiva y pausas/banquillo correctos.
- [ ] T actúa solo en su ámbito, con presupuesto conjunto, episodios reales y sin aura o compensación de marcador.
- [ ] Presión contextual y MEN07 preservan ejecución/elección sin talento universal añadido.
- [ ] Neutralidad comprobada en salida final contextual y distribuciones coherentes; no solo ruido centrado en logit.
- [ ] Episodios causales agrupados; no mejoran retrospectivamente la acción que los genera.
- [ ] Laboratorio/panel/perfiles/visibilidad/diagnóstico/reproducción integrados; históricos intactos.
- [ ] Salvedades de MOTOR-06 contrastadas en alcance pertinente sin aprobar bloques no inspeccionados.
- [ ] Checks acotados, plan manual y documentación con estado real; SEM y evaluación pendiente visibles.
- [ ] Prompt íntegro archivado y PR revisable sin fusionar.

Respuesta final breve: qué puede probar Dennis, arranque/URL reales, semilla/perfil, comprobaciones, mecanismo de neutralidad con límites, salvedades cerradas/pendientes con evidencia, rutas del recorrido/prompt y PR o rama/commits. No uses número de tests o marcador como prueba de realismo.

## 14. Anexo A: semillas explícitas

### 14.1. Identidad y valores

Propuesta de ChatGPT para campos nuevos no cubiertos por una versión aceptada. **SEM no calibrada**; conserva valores actuales equivalentes y documenta correspondencia. No añade coeficientes directos de edad/peso ni referencias de acierto por momento.

```json
{
  "id": "SEM-MOTOR07-20261016",
  "status": "SEM: provisional, no calibrado",
  "form": {
    "range": [-1, 1], "neutral": 0,
    "taskMaxLogit": {"shot": 0.35, "offensiveControl": 0.2, "defenseDispute": 0.2, "coordination": 0.15}
  },
  "pressure": {
    "importance": {"ordinary": 0.25, "important": 0.6, "decisive": 1},
    "latePeriodWindowSeconds": 300,
    "closeMarginPoints": 12,
    "periodTensionWeight": {"Q1_Q2_Q3": 0.35, "Q4_OT": 1},
    "taskMaxLogitLoss": {"shot": 0.35, "offensiveControl": 0.25, "defenseDispute": 0.2, "coordination": 0.2},
    "choiceMaximumDecisionPointsLost": 2,
    "combinedFormPressureLogitBounds": [-0.6, 0.4]
  },
  "moment": {
    "range": [-1, 1], "neutral": 0,
    "playingHalfLifeSeconds": 90, "benchHalfLifeSeconds": 60,
    "innovationSigmaLowConsistency": 0.45, "innovationSigmaHighConsistency": 0.15,
    "probabilityAlphaByTask": {"shot": 0.2, "offensiveControl": 0.18, "defenseDispute": 0.18, "coordination": 0.16},
    "individualCollectiveMixture": {"individual": 0.7, "team": 0.3},
    "opposedMomentMixture": {"actor": 0.5, "counterpart": 0.5},
    "pauseAttenuation": {"timeout": 0.8, "shortInterval": 0.65, "halftime": 0.3},
    "categoryBoundaries": [-0.7, -0.25, 0.25, 0.7]
  },
  "teamMoment": {
    "range": [-1, 1], "neutral": 0, "halfLifeSeconds": 150,
    "randomInnovationSigma": 0,
    "directShotConversionContribution": 0,
    "directChosenIndividualPassContribution": 0,
    "pauseAttenuation": {"timeout": 0.85, "shortInterval": 0.7, "halftime": 0.4}
  },
  "episodes": {
    "EPI01IndividualImpulse": 0.1,
    "EPI02IndividualImpulse": -0.1,
    "EPI03TeamImpulse": 0.08,
    "EPI04TeamImpulse": 0.06,
    "EPI05TeamImpulse": -0.08,
    "difficultExecutionReferenceProbabilityMaximum": 0.25,
    "deduplication": "one_equivalent_impulse_per_causal_chain_target_and_domain"
  },
  "missingTaskConnections": {
    "longTravelAccessAttack": {"FIS01": 0.45, "FIS02": 0.25, "MEN04": 0.15, "TEC07": 0.15},
    "longTravelReturnDefense": {"FIS01": 0.45, "FIS02": 0.25, "MEN04": 0.3},
    "defensiveOptionReading": {"MEN02": 0.5, "MEN03": 0.3, "MEN04": 0.2},
    "physicalAccessMaxEnergyPenalty": 8
  },
  "initialStatePolicy": {"form": 0, "M_TIR": 0, "M_OFE": 0, "M_DEF": 0, "T": 0}
}
```

### 14.2. Forma y presión

`a(x)=(x-1)/29`, con valores válidos de capacidad. Forma aporta `k_tarea*F_actor`; si la contraparte interviene en el mismo contraste, resta su aporte pertinente una vez. Acota el efecto conjunto de Forma de esa tarea al máximo del ámbito, sin una prima de tamaño/edad.

Tensión inicial: `c=clamp(1-abs(margen)/12,0,1)` y `l=clamp(1-segundosRestantesPeriodo/300,0,1)`; `tension=pesoPeriodo*l*c`. Exigencia `P=max(importancia,tension)`. Son semillas, no una definición estadística universal de final ajustado.

La pérdida de referencia por presión es `k_tarea*P*(1-a(MEN07 del ejecutante))`, con signo desfavorable a su tarea. Cuando actúa una contraparte, usa el contraste pertinente sin volver a aplicar la misma presión como otra oposición completa. Suma con Forma y acota al presupuesto logit declarado. No afecta cuerpo ni las notas guardadas.

En una elección pertinente, presión puede reducir MEN03 efectivo hasta `2*P*(1-a(MEN07))` puntos para la valoración, sin tocar la nota base. No repitas esa misma merma como castigo adicional genérico a toda la ejecución: selección y técnica son tareas distintas que deben mantener causas identificadas.

Importancia es entrada visible. Si el laboratorio ya usa categorías equivalentes, conserva sus IDs y mapea significado, sin otro control duplicado. No cambia la importancia automáticamente por un resultado parcial.

### 14.3. Variación individual acotada

Para cada ámbito requerido, con intervalo deportivo pendiente Δ, estado M y Consistencia C:

`rho=2^(-Delta/vidaMediaSituacion)`

`sigma(C)=0.45-(0.45-0.15)*a(C)`

`M_t=clamp(rho*M + sigma(C)*sqrt(1-rho*rho)*U, -1, 1)`

donde U es uniforme simétrica en `[−sqrt(3),sqrt(3)]`, obtenida del generador deportivo. Tras el hecho, el impulso elegible se añade al estado efectivo de su frontera y se acota. Δ=0 no crea innovación; no sortees de nuevo por consultar la misma frontera.

Esta construcción es simétrica en ausencia de impulsos/entrada sesgada; la acotación simétrica mantiene esa simetría. Su neutralidad relevante se verifica con la transformación de §10, no afirmando que cualquier logística de M sería neutral.

No representa una fisiología medida ni garantiza invariancia de trayectoria al cambiar eventos deportivos reales. **Dividir texto, renderizar o inspeccionar diagnóstico no crea nuevas actualizaciones.** El orden de actualizaciones necesarias se fija por frontera/actor/ámbito para reproducibilidad. No actualices a los 24 jugadores y todos sus ámbitos tras cualquier frase.

El banquillo usa su vida media y no recibe impulsos por hechos ajenos. Una pausa deportiva usa su atenuación una vez, sin fingir transcurso de reloj de juego. No sumes una atenuación por duración ficticia y otra por la misma pausa.

### 14.4. T y presupuesto compartido

T decae determinísticamente `T_t=2^(-Delta/150)*T` y recibe episodios colectivos elegibles. La innovación aleatoria colectiva inicial es explícitamente cero: su variación procede de hechos reales y entrada configurada, sin otra habilidad ni ruido obligatorio.

Para tareas colectivas permitidas, `Z_propio=0.7*M_ambito+0.3*T`; para tareas individuales excluidas de T, `Z_propio=M_ambito`. Si ambos lados aportan momento pertinente, `Z=0.5*Z_propio-0.5*Z_contraparte`; si no, usa solo el propio. Esto no añade dos máximos alpha.

En conversión final usa M-TIR del tirador; M-DEF solo puede intervenir en su tarea de oposición real y no otra vez si ya explicó esa misma dificultad. T no entra por ninguno de los lados como descuento/bonus directo de acierto. Una mayor coordinación puede haber modificado antes una oportunidad real.

Las categorías propias son Muy frío/Frío/Estable/Caliente/Muy caliente según las cuatro fronteras declaradas, con etiquetas adaptadas a T y Forma cuando se muestre su significado. No equivalen a porcentajes de tiro. El diagnóstico conserva el valor continuo y su frontera.

### 14.5. Episodios y agrupación

Las magnitudes son máximos iniciales de una señal elegible, no premios por cualquier canasta. EPI01 requiere éxito de una ejecución difícil significativa con probabilidad previa ≤0,25 y tarea/resultado relevantes representados. EPI02 exige motivo real de error de atención/ejecución; una simple derrota del duelo o un buen tiro fallado no basta.

EPI03 requiere desorden previo identificable y recuperación efectiva de coordinación/continuidad. EPI04 requiere intervención colectiva significativa que mejora esa respuesta; EPI05 un fallo de responsabilidad compartida realmente resuelto. Si no existe evidencia, no se aplica impulso por rellenar el catálogo.

La primera señal elegible de una causa/destinatario/ámbito marca ese impulso como tratado; las señales equivalentes posteriores se registran sin otro impulso. Diferentes destinatarios/ámbitos requieren causas propias compatibles. EPI06 usa atenuaciones, no suma otro impulso positivo.

Las conexiones `missingTaskConnections` solo se aplican si falta la tarea equivalente: medias ponderadas de atributos del actor correcto y oposición real, con referencia/sensibilidad compartidas vigentes. No se agregan como otra prima si Velocidad o Visión ya estaban conectadas a esa misma causa.

### 14.6. Migración explícita

Los estados iniciales neutrales son una política de entrada de la nueva candidata. Si una entrada histórica tiene otra escala o significado, no interpretes su número por adivinación: conserva versión y convierte mediante una correspondencia explícita cuando sea inequívoca, o informa de incompatibilidad.

Crear la candidata no cambia el perfil activo, planes/fichas editados o partidos históricos. La activación y los escenarios de contraste son explícitos. No se certifica calibración, temporada o evolución entre encuentros por incorporar estos datos.

## 15. Anexo B: mapas funcionales de referencia

Extractos del funcional unificado vigente: uso causal de capacidades (cap. 3.5), ejecuciones y técnica principal (cap. 12.3) y episodios (cap. 14.6). Las tablas fijan responsabilidad funcional; los pesos nuevos solo proceden del anexo A o de los perfiles aceptados.

### 15.1. Las 32 capacidades

| ID | Capacidad | Intervenciones pertinentes del conjunto | Evidencia que debe poder ofrecer el panel |
|---|---|---|---|
| TEC01 | Triple | Lanzamiento exterior, amenaza y aceptación de oportunidad, también transición y decisión directa. | Conversión condicionada y selección diferenciadas. |
| TEC02 | Tiro de media distancia | Suspensión de dos, recepción en media y recursos ante espacio disponible. | Uso y ejecución de media según perfil y contexto. |
| TEC03 | Tiro interior | Tiro corto desde posición estable, gancho u otro toque interior. | Ejecución sin confundirla con creación de poste. |
| TEC04 | Finalización en movimiento | Llegadas al aro, bandejas, cortes y penetraciones. | Efecto en finalización de una llegada real. |
| TEC05 | Tiro libre | Ejecución de la serie; elección de especialista cuando sea legal. | Conversión con estado y presión pertinentes, sin defensor ficticio. |
| TEC06 | Tiro en movimiento | Preparación de suspensión tras bote, salida, corte o entrega. | Dificultad de preparación separada de técnica de distancia. |
| TEC07 | Manejo de balón | Avance, protección, primer paso, salida de presión y recurso autónomo. | Control, pérdidas y opciones de continuidad pertinentes. |
| TEC08 | Pase | Envío a receptor real, descarga, salida de ayuda y saque. | Ejecución del pase sin inventar la ventana. |
| TEC09 | Bloqueos | Pantalla útil/legal, llamada o recurso autónomo de llegada. | Responsabilidad defensiva modificada y riesgo pertinente. |
| TEC10 | Movimiento sin balón | Corte, desmarque, recepción y fijación. | Tarea útil aunque no llegue el balón. |
| TEC11 | Juego de poste | Ganar posición, sellar, pivotar y crear opción de tiro o pase. | Oportunidad creada antes de resolver la finalización. |
| TEC12 | Defensa perimetral | Contener, negar recepción, orientar y disputar exterior. | Oposición y oportunidades evitadas, sin exigir robo. |
| TEC13 | Defensa interior | Posición, recepción interior, poste y oposición cerca del aro. | Dificultad real de acceso y finalización. |
| TEC14 | Robo | Intervenir sobre balón accesible bajo un intento pertinente. | Intento, éxito, riesgo y relación con pérdida/recuperación. |
| TEC15 | Tapón | Intervenir sobre lanzamiento susceptible de bloqueo. | Intento y efecto, sin representar toda protección del aro. |
| TEC16 | Defensa de bloqueos | Navegar pantalla y recuperar la función prevista. | Diferencia entre cobertura ordenada y ejecución individual. |
| TEC17 | Cierre de rebote | Limitar acceso y sostener posición. | Facilitar captura propia o de compañero sin apropiarse del crédito. |
| TEC18 | Captura de rebote | Asegurar o dirigir útilmente balón disputado accesible. | Captura entre candidatos reales y continuación. |
| FIS01 | Velocidad | Transición, persecución, retorno y recorridos largos resumidos. | Participación y llegada pertinente sin ruta continua. |
| FIS02 | Aceleración | Primer paso, separación, ayuda y recuperación corta. | Relación concreta creada o perdida, sensible a energía. |
| FIS03 | Agilidad | Cambios de dirección y ajuste de contención/ataque. | Capacidad de seguir o atacar una relación pertinente. |
| FIS04 | Fuerza | Poste, pantalla, contacto útil y cierre. | Oposición y estabilidad de disputa, no precisión universal. |
| FIS05 | Salto | Rebote, tapón y finalización vertical pertinentes. | Acceso/intervención en tareas que lo necesitan. |
| FIS06 | Resistencia | Desgaste relativo bajo carga comparable. | Energía conservada y utilidad posterior, no bonus directo al tiro. |
| FIS07 | Equilibrio | Postura, contacto, cambios y preparación de ejecución. | Estabilidad pertinente sin sustituir fuerza ni técnica. |
| MEN01 | Comprensión táctica | Cumplir función, ficha, cobertura, ayuda y reorganización. | Coordinación del plan y posibles aportes colectivos reales. |
| MEN02 | Visión de juego | Percibir opciones ofensivas/defensivas existentes. | Opciones percibidas en diagnóstico, sin conocimiento perfecto. |
| MEN03 | Decisiones | Elegir opción, riesgo, reloj y adecuación al plan. | Conducta mejor o peor ante un conjunto percibido comparable. |
| MEN04 | Anticipación | Preparar respuesta, corte, ayuda, recuperación o disputa. | Preparación pertinente, no adivinación del sorteo. |
| MEN05 | Concentración | Sostener responsabilidad y evitar despistes pertinentes. | Errores de atención y continuidad bajo tarea real. |
| MEN06 | Consistencia | Amplitud/persistencia de altibajos alrededor de su nivel. | Variación distinta con neutralidad media de referencia. |
| MEN07 | Rendimiento bajo presión | Preservar elección/ejecución ante importancia y tensión. | Sensibilidad contextual, sin bonus universal en finales. |

### 15.2. Técnica principal y preparación

| Ejecución representada | Técnica principal | Apoyos pertinentes | Frontera que debe conservarse |
|---|---|---|---|
| Triple preparado tras recepción | TEC01 Triple. | Preparación de recepción y equilibrio cuando correspondan. | Recibir no añade TEC06 automáticamente a todo triple. |
| Triple tras bote o salida que exige preparar el tiro en movimiento | TEC01 Triple. | TEC06 Tiro en movimiento para la preparación; manejo y equilibrio si explican tareas distintas. | TEC06 no se suma como una segunda capacidad general de puntería. |
| Tiro de media distancia preparado | TEC02 Tiro de media distancia. | Equilibrio o preparación pertinente. | No usa TEC03 por valer dos puntos. |
| Tiro de media tras bote o salida en movimiento | TEC02 Tiro de media distancia. | TEC06 para la preparación y apoyos específicos. | La zona y el gesto de lanzamiento siguen determinando la principal. |
| Tiro corto controlado, desde apoyo estable, incluido gancho de esa naturaleza | TEC03 Tiro interior. | Equilibrio y contexto de oposición o contacto. | El hecho de venir de poste no hace de TEC11 la capacidad de acierto. |
| Entrada, bandeja, reverso o finalización en progresión | TEC04 Finalización en movimiento. | Manejo previo, equilibrio, contacto o salto según el caso. | La preparación con bote puede terminar antes de la ejecución de tiro. |
| Mate o finalización aérea | TEC04 Finalización en movimiento. | Salto, fuerza y alcance cuando son pertinentes. | No se crea una capacidad de mate ni se garantiza terminar por poder saltar. |
| Floater o runner en progresión | TEC04 Finalización en movimiento. | Equilibrio y preparación del recurso. | Se clasifica por continuar el movimiento, no por el nombre del relato. |
| Toque corto tras detenerse y controlar el apoyo | TEC03 Tiro interior. | Preparación y equilibrio pertinentes. | Llamarlo floater en un texto no cambia el gesto representado. |
| Palmeo directo de finalización | TEC04 Finalización en movimiento. | Acceso al rebote y salto en su tarea, según la secuencia. | Captura estadística y finalización se acreditan por sus reglas, no por el nombre. |
| Rebote asegurado y tiro corto posterior desde situación controlada | TEC03 Tiro interior. | Técnica y cuerpo de la captura anterior, después preparación del tiro. | El rebote no convierte el tiro posterior en palmeo directo. |
| Tiro libre | TEC05 Tiro libre. | Estado pertinente y presión conforme al modelo. | No usa la oposición de campo ni la Preferencia de zona. |

### 15.3. Episodios aprobados

| ID | Episodio elegible | Evidencia exigida | Destino admisible | Lo que no basta |
|---|---|---|---|---|
| EPI01 | Ejecución individual difícil y significativa. | Dificultad pertinente previa y ejecución representada relevante. | Ámbito individual correspondiente, con impulso limitado. | Cualquier canasta, asistencia, robo o rebote rutinario. |
| EPI02 | Error relevante de atención o ejecución. | Causa representada que identifica el error y su ámbito. | Ámbito individual correspondiente, con impulso limitado. | Fallar un buen tiro o que el rival anote. |
| EPI03 | Reorganización colectiva efectiva tras un problema real. | Problema existente y recuperación de responsabilidades o continuidad efectivamente resuelta. | T, moderadamente. | Cada inicio de posesión o la presencia nominal de un buen base. |
| EPI04 | Esfuerzo colectivo o intervención útil significativa. | Hecho pertinente que mejora la respuesta compartida. | T, moderadamente. | Cualquier acción vistosa o cada rebote. |
| EPI05 | Fallo compartido significativo de coordinación. | Desorden o responsabilidad colectiva fallida representados. | T, de forma negativa y acotada. | Una canasta difícil del rival o una mala racha de acierto. |
| EPI06 | Pausa deportiva pertinente. | Tipo de pausa e intervalo administrado. | Atenuación de persistencia de los estados aplicables. | Pausar el vídeo o dejar una pantalla abierta. |
