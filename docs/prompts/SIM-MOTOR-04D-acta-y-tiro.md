# beM · SIM-MOTOR-04D

## Aproximación del acta al detallado: ±5 % en estadísticas y ±3 puntos porcentuales en acierto

**Destinatario:** Claude Code.  
**Repositorio autorizado:** exclusivamente `bateman37/beM`.  
**Fecha:** 24 de octubre de 2026, Europe/Madrid.  
**Entrega:** correcciones pequeñas, ajuste SIM acotado, candidata explícita y evidencia para el análisis posterior de ChatGPT.  
**Aceptación manual y deportiva:** Dennis; no se concede automáticamente por ejecutar este encargo.

Dennis autoriza esta entrega para aproximar el acta completa y los porcentajes de tiro de SIM al detallado. Conservamos ambos motores y la resolución agregada por tramos de SIM. El trabajo incluye lectores, diagnóstico de créditos y oportunidades, las filas SIM y la búsqueda limitada que se especifican aquí. No incluye modificar el deporte del detallado, activar una candidata por defecto, fusionar la PR, investigar otros repositorios o abrir una reescritura del motor.

Completa implementación, mediciones y archivos aunque alguna banda no se alcance. Un objetivo incumplido debe quedar visible; no autoriza ampliar la búsqueda, rebajar una banda o fabricar estadísticas.

## Índice

1. [Decisiones y alcance](#1-decisiones-y-alcance)
2. [Base, Git y documentación](#2-base-git-y-documentación)
3. [Punto de partida comprobado](#3-punto-de-partida-comprobado)
4. [D04-01 · Lectores y atribución](#4-d04-01--lectores-y-atribución)
5. [D04-02 · Rebotes y universos compatibles](#5-d04-02--rebotes-y-universos-compatibles)
6. [D04-03 · Ajustes pequeños antes del sorteo](#6-d04-03--ajustes-pequeños-antes-del-sorteo)
7. [Búsqueda conjunta y presupuesto](#7-búsqueda-conjunta-y-presupuesto)
8. [Métricas, guardas y selección](#8-métricas-guardas-y-selección)
9. [Campaña y reserva nueva](#9-campaña-y-reserva-nueva)
10. [Coste y contratos conservados](#10-coste-y-contratos-conservados)
11. [Pruebas y recorrido manual](#11-pruebas-y-recorrido-manual)
12. [Archivos para ChatGPT](#12-archivos-para-chatgpt)
13. [Respuesta final](#13-respuesta-final)

## 1. Decisiones y alcance

### 1.1. Criterio aprobado por Dennis

- **Estadísticas del acta:** objetivo de diferencia entre medias de **±5 % relativo**.
- **Porcentajes de acierto:** objetivo de diferencia de **±3 puntos porcentuales**, tanto en campo/dos/tres/libres como por las cuatro zonas conservadas.
- Estas bandas comparan poblaciones de encuentros equivalentes. No se exigen entre dos partidos individuales de la misma semilla ni a cada jugador con unos pocos minutos.

Ejemplos: 80 puntos en DET implica un intervalo descriptivo objetivo de 76–84; un 60 % de acierto implica 57–63 %, no 58,2–61,8 %. Distinguir siempre porcentaje relativo y puntos porcentuales.

El reparto de intentos por zona es otra dimensión. Adoptamos en esta entrega una **guarda funcional provisional de ±3 pp por cuota de zona**, separada del acierto. No atribuir a Dennis haber fijado un ±3 % relativo para esas cuotas. Conservar además los volúmenes por zona y la suma de sus diferencias.

Los aciertos de `inside` y media distancia ya están cercanos. No abrir un ajuste de puntería de triple, libre o media distancia para compensar la diferencia total de puntos. Revisar el aro, la mezcla de intentos y las causas del acta completa.

### 1.2. Se conserva

- Detallado congelado: referencia `20261016`, **83–98 y 6.684 sorteos**, con la misma trayectoria y archivos deportivos.
- Las 32 capacidades y sus consumidores; atributos, estados, roles, director y familiaridad mantienen sus diferencias causales.
- Resolución SIM por tramos, sin movimientos ni resolución detallada por posesión como requisito nuevo.
- Simultaneidad con reloj virtual común, publicación por fronteras y clasificación en directo; consultas sin azar ni filtración del futuro.
- Aprendizaje exclusivamente posterior al encuentro terminado e idempotente por partido lógico y equipo.
- Estadísticas individuales, historia anual, cierre/liberación y recuperación.
- Perfil y candidata explícitos. No transformar, activar o sustituir perfiles guardados en silencio.

La prioridad deportiva de 04D es acercar **actas completas**, no únicamente puntos y el antiguo indicador M. El detallado es una referencia interna provisional; no es una certificación externa de baloncesto real.

## 2. Base, Git y documentación

1. Lee las normas vigentes del propio repositorio, su estado, el funcional temático pertinente y las notas técnicas de SIM-04B/04C. No releas íntegramente cientos de páginas si hay un índice temático.
2. Verifica el estado real de PR #22 y de la rama. Según el último informe, contiene SIM-01–04C, sigue abierta y sin fusionar. Código deportivo final de 04C: `3bbe5fce81588bde0f13dff44ed49668b293ec7a`; HEAD documental declarado: `da25332dfc9cb153c223881b1a6fe3e0acc75b79`. Comprobarlo, no asumirlo.
3. Si sigue abierta, continúa sobre esa serie y actualiza título/descripción. Si ya se fusionó, crea una rama desde `main` actualizado y una PR nueva. Conserva trabajo ajeno; usa un checkout aislado si hace falta. No resetear ni forzar una rama con cambios no reconocidos.
4. No fusionar ni suscribirse. Publicar el trabajo y dejar la PR revisable.
5. Archiva este prompt íntegro en `docs/prompts/`, actualiza su catálogo, `docs/estado.md`, changelog y páginas temáticas afectadas. Escribe `docs/tecnico/sim-motor04d.md` y el recorrido manual. Documenta qué decisiones de búsqueda/bandas de 04C sustituye esta entrega.
6. La versión de aplicación debe mostrar **SIM-MOTOR-04D**; versión del detallado, del SIM, perfil, esquema de resultado y dataset se muestran por separado. No ocultar una versión incorrecta para evitar actualizar un test.

## 3. Punto de partida comprobado

Referencia de desarrollo: **C04C-FINAL-PROVISIONAL**, alias de C04C-P30, de carga manual. Se conserva N04C como control histórico, pero no es la candidata de partida de 04D.

| Fila | Valor de partida |
|---|---:|
| `volume.neutralSecondsPerControl` | 19,5 |
| `shotMix.threeWeightFactor` | 0,70 |
| `assist.eligibleFinalPassP0` | 0,90 |
| `energy.costPerLiveMinute` | 3 |
| `assist.receivedAdvantageP0` | 0 |
| `shotMix.rimWeightFactor` | 1,5 |
| `opportunity.simRimQualityLogit` | 0,5 |
| `rebound.organizedResetP0` | 0,35 |
| `opportunity.simInsideQualityLogit` | 0,5 |
| `conversion.simInsideLogitOffset` | 0,30 |

VAL de 04C tiene **48 encuentros por modelo, 96 actuaciones de equipo y los doce EQ01–EQ12**. Promedios reales, sin normalizar aquí la prórroga:

| Estadística | DET | SIM candidata 04C |
|---|---:|---:|
| Puntos | 82,4375 | 77,9375 |
| FGA | 58,3646 | 60,3021 |
| 2PM / 2PA | 23,0208 / 38,6146 | 20,5208 / 37,2292 |
| 3PM / 3PA | 8,1458 / 19,7500 | 8,8333 / 23,0729 |
| FTM / FTA | 11,9583 / 14,2917 | 10,3958 / 12,6042 |
| ORB / DREB | 7,1563 / 17,1458 | 8,8438 / 22,7708 |
| Rebotes totales | 24,3021 | 31,6146 |
| AST a canasta | 21,0625 | 16,1042 |
| AST a libres, categoría beM | 2,2917 | 1,8958 |
| Pérdidas totales | 10,6250 | 13,0313 |
| Robos / tapones | 7,3854 / 2,4271 | 6,5417 / 2,2083 |
| Faltas cometidas | 12,8021 | 12,3333 |

Porcentajes acumulados de acierto: 2P 59,62/55,12; 3P 41,24/38,28; FT 83,67/82,48. Por zona, DET/SIM: aro 64,84/58,93; inside 56,83/57,61; media 40,40/40,22.

No confundir esa cercanía del acierto interior/media con la mezcla de tiros. Cuotas DET/SIM: aro 37,71/31,34; inside 21,29/19,19; media 7,16/11,21; triple 33,84/38,26.

La candidata tuvo dos prórrogas. Puntos por 40 minutos: **82,4375 frente a 77,5787**. Las comparaciones finales deben conservar medias reales y normalizadas.

Estos datos son una comprobación de identidad, no objetivos para fabricar una salida. Si no se reproducen desde las entradas correspondientes, explica la discrepancia antes de atribuir mejoras a 04D. Si los ZIP anteriores no existen en `out/`, reutiliza lo versionado o reconstruye desde entradas y código auténticos del mismo repositorio. No inventes evidencia histórica.

## 4. D04-01 · Lectores y atribución

### 4.1. Continuación inmediata atribuida a una ficha POS

Hallazgo de revisión independiente: en VAL de la candidata, el contexto real `putback` tiene **451 FGA**, mientras que la familia publicada `putback` tiene **166**. Los **285** restantes se asignan a POS porque la celda usada para aproximar el tiro conserva `playId` y el agregador utiliza `play ?? src`.

Corrige la atribución para que el contexto deportivo real prevalezca. Una continuación inmediata tras rebote no es una ejecución nueva de POS10/POS04/etc. Conserva aparte la procedencia interna de cálculo si hace falta. El reinicio organizado sí puede ejecutar una ficha nueva.

Cubre tiros, canasta con falta, falta de tiro sin intento, serie de libres ligada y finalización única. Las sumas por familia/contexto deben conciliar con el acta. Esta corrección es de lectura: no cambia participantes, decisiones, probabilidades o sorteos.

### 4.2. Asistencia acreditada y utilidades

La tabla principal de 04C ya distingue canasta con pasador de AST acreditada. Unifica sus auxiliares: `scripts/sim04c/diag-context.mjs` todavía usa canasta con pasador como sustituto de asistencia en su ruta DET. Si ese auxiliar sigue usándose, debe leer el crédito del acta ligado al hecho.

Conservar columnas separadas para pasador representado, elegibilidad, entrega y asistencia acreditada. No sumar AST a libres a AST de canasta sin nombrar expresamente el total beM.

Corrige también las notas de población y unidades: VAL incluye doce equipos; **1.540,5 MiB = 1,5044 GiB**, no 1,54 GiB. El exceso histórico sobre 1,5 GiB es 4,5 MiB.

## 5. D04-02 · Rebotes y universos compatibles

Antes de calibrar el volumen de rebotes, construye una tabla corta de oportunidades y créditos en ambas versiones. El exceso observado del 30 % no autoriza aplicar un multiplicador al acta.

Desglosa:

- FGA fallados válidos, tapones, tiro anulado y fallo con falta sin FGA.
- Últimos libres fallados con balón vivo frente a libres sin oportunidad de rebote.
- Rebote individual, colectivo, recuperación de balón tras tapón y continuidad sin rebote acreditado.
- Balón fuera, final de periodo, expiración y otras causas registradas que impiden un rebote.
- ORB/DREB y su probabilidad condicional entre oportunidades compatibles; no solo su suma por partido.

Hay una diferencia de código concreta que debes comprobar: el detallado `src/match/actions.js::resolveBlocked` trata el tapón vivo como recuperación de control, mientras SIM puede pasar ese caso por `_rebound(..., cause='block')` y acreditar un rebote. Clasificarla con evidencia y política vigente. No llamarla automáticamente fallo normativo ni asumir que explica todo el desfase.

Comprobar también las expiraciones: no deducir una causa solamente porque no haya rebote en el CSV. Usar hechos y enlaces conservados; marcar `no reconstruible` cuando corresponda.

**Correcciones autorizadas:** un crédito duplicado, una lectura incorrecta o una continuación atribuida a un universo que contradice la política estadística beM vigente pueden corregirse en SIM con una regresión y un antes/después causal. No cambiar el control deportivo de la jugada para conseguir el número deseado. Si separar recuperación y rebote requiere distinguir un metadato/evento de lectura, hacerlo sin otro sorteo y manteniendo aprendizaje/exposición coherentes.

**Límite:** si el criterio del detallado resulta dudoso o incoherente con su propia política, documentarlo y conservar ambos conteos. No modificar el detallado ni reducir rebotes legítimos de SIM para imitarlo. Esa métrica queda pendiente de decisión, no aprobada por omisión. No abrir en esta entrega una investigación normativa integral.

Las correcciones deportivas/estadísticas demostradas se fijan antes de la búsqueda y son comunes a todos sus vectores. Conservar un control real 04C anterior para separar la corrección del ajuste numérico. Sin defecto demostrado, se conserva el mecanismo de rebote y se estudia el efecto de fallos, mezcla y continuaciones.

## 6. D04-03 · Ajustes pequeños antes del sorteo

Todas las cifras siguientes son **semillas de evaluación de SIM**, administrables y sin calibración externa. Las filas nuevas son neutrales en la base. Cada una debe declarar ruta, unidad, rango, procedencia, fórmula consumidora y alcance. No copiar ajustes al perfil detallado.

### 6.1. Filas nuevas autorizadas

| Ruta propuesta | Neutral | Rango de edición | Aplicación única |
|---|---:|---:|---|
| `shotMix.midrangeWeightFactor` | 1 | 0,25–2 | Peso de celdas de media existentes, con normalización dentro del contexto |
| `conversion.simRimLogitOffset` | 0 | 0–0,25 | Desplazamiento del logit de conversión al aro y de su estimación previa |
| `outcomes.simOrdinaryTurnoverWeightFactor` | 1 | 0,6–1,2 | Peso de pérdida ordinaria `wTo`, antes de normalizar terminales |
| `outcomes.simStealGivenEligibleTurnoverLogit` | 0 | 0–1 | Logit del robo condicionado a una pérdida que ya admite ese crédito |
| `outcomes.simShootingFoulWeightFactor` | 1 | 0,8–1,3 | Peso de falta en tiro `wSf`, antes de normalizar terminales |
| `assist.spontaneousPassOddsFactor` | 1 | 1–2 | Odds de entrega elegible en finalizaciones espontáneas del productor existente |

Reutiliza una fila equivalente si ya existe y tiene exactamente ese alcance, documentando la correspondencia. No añadir otra fila para el mismo efecto. Los valores de la parrilla del apartado 7 son los únicos que se prueban como candidatas; que el panel permita un rango mayor no amplía la campaña.

**Mezcla:** conservar la masa de cada contexto y la respuesta relativa al plan/jugador. No crear zonas que la ficha no admite. Mantener sin cambios la implementación antigua cuando el nuevo factor es 1; no reagrupar su aritmética solo por estética si rompe la neutralidad exacta. Cualquier normalización nueva debe cubrir suma, zonas imposibles y cero masa.

**Aro:** usar el mismo punto de aplicación que el ajuste `inside`, una sola vez antes de la logística y de la perturbación pertinente. Actualizar la estimación usada por la decisión para que vea el mismo ajuste. No modificar recetas, pendientes, capacidades, protección defensiva, tapón o FT%. Interior sin aro, media y triple no reciben este offset.

**Pérdida y robo:** ajustar el peso de la pérdida ordinaria una vez, conservando la incidencia de presión, habilidad y estilos. No multiplicar todas las pérdidas ni convertir una falta ofensiva/violación en robo. El segundo ajuste modifica únicamente el reparto condicionado de pérdidas elegibles; conserva autor real, causalidad y un crédito por pérdida. Si la lectura previa no conserva el denominador elegible, instrumentarlo sin otra decisión deportiva.

**Falta en tiro:** ajustar su peso, no el FT% ni el número reglamentario de libres de la serie. Recalcular la normalización y la razón de faltas no terminales de forma coherente. No crear faltas después de ver que falta anotación.

**Entrega espontánea:** distinguir la finalización recibida de la creación propia antes de resolver el tiro. El factor opera sobre `derived.spontaneous.passShare` mediante `odds(p') = odds(p) × factor`, preservando extremos 0/1 y neutralidad con factor 1. No añade AST directamente. El pasador debe ser un compañero real distinto del tirador; no heredar pase anterior. Mantener la clase y el fundamento de ese productor compacto, sin fingir una secuencia de pases que SIM no representa. No aplicar este factor a transición o `putback`.

Reabre también `assist.receivedAdvantageP0`, rango [0;1], en las salidas ya acreditadas por el catálogo. No ampliar todas las salidas de bote a receptoras: una reclasificación necesita fundamento explícito de ficha/rol y una regresión, y debe fijarse antes de CAL. Las finalizaciones de creación propia permanecen sin pase final atribuible.

### 6.2. Qué se mantiene fijo en la búsqueda

Ritmo 19,5; entrega final 0,90; energía 3; calidad de aro 0,5; calidad inside 0,5; conversión inside 0,30. No calibrar FT%, 3P%, media distancia, fuerza de rebote, reservas físicas, momentos o entrenador en esta entrega.

El ligero cambio permitido de mezcla de triple es de volumen, no de acierto. Aunque un porcentaje de acierto ya esté en banda, su número de intentos puede estar muy separado.

## 7. Búsqueda conjunta y presupuesto

La búsqueda secuencial anterior fijó el reinicio antes de terminar el ajuste interior. Aquí se prueban **vectores completos conjuntamente**. No descartar un porcentaje de reinicio por una etapa intermedia que aún no tiene sus correcciones.

Congelar código de mecanismos, agenda, reglas, todos los vectores y hashes antes de calcular resultados de desarrollo. Las correcciones comprobadas del apartado 5 y una eventual reclasificación causal del catálogo deben estar ya fijadas.

### 7.1. Nueve configuraciones de zonas y continuación

| Z | Peso aro | Reinicio tras ORB | Peso media | Peso triple | Offset conversión aro |
|---|---:|---:|---:|---:|---:|
| Z0 | 1,5 | 0,35 | 1 | 0,70 | 0 |
| Z1 | 2 | 0,65 | 1 | 0,70 | 0 |
| Z2 | 2 | 0,85 | 1 | 0,70 | 0 |
| Z3 | 2 | 0,65 | 0,70 | 0,70 | 0,15 |
| Z4 | 2 | 0,85 | 0,70 | 0,70 | 0,15 |
| Z5 | 2 | 0,65 | 0,70 | 0,60 | 0,15 |
| Z6 | 2 | 0,85 | 0,70 | 0,60 | 0,15 |
| Z7 | 2,5 | 0,65 | 0,70 | 0,60 | 0,15 |
| Z8 | 2,5 | 0,85 | 0,70 | 0,60 | 0,15 |

Los pesos de aro 2 y los reinicios altos tienen antecedentes exploratorios sobre CAL conocido; no son valores ya validados. Las combinaciones nuevas de esta tabla son hipótesis explícitas de este encargo.

### 7.2. Cuatro configuraciones de circulación y terminales

| A | Ventaja recibida | Odds pase espontáneo | Peso pérdida ordinaria | Offset robo condicionado | Peso falta en tiro |
|---|---:|---:|---:|---:|---:|
| A0 | 0 | 1 | 1 | 0 | 1 |
| A1 | 0,5 | 1,5 | 0,85 | 0,50 | 1,10 |
| A2 | 1 | 2 | 0,80 | 0,70 | 1,10 |
| A3 | 1 | 2 | 0,85 | 0,90 | 1,20 |

Evaluar el producto **9 × 4 = 36 vectores completos**, sobre las 48 entradas de desarrollo: **1.728 SIM** como máximo. Z0-A0 es el control de mecanismos nuevos neutrales, no una ejecución adicional oculta. Mantener cada vector íntegro, sin cambiar un componente porque una fila haya salido mal.

Es una búsqueda pequeña y predeclarada, no una garantía de encontrar el óptimo entre todos los parámetros. Los paquetes A agrupan hipótesis relacionadas para limitar coste. No atribuir causalmente a una sola fila la diferencia entre dos paquetes que cambian varias.

No añadir rondas, combinar ganadores después de mirar VAL ni ampliar los rangos. Si ningún vector mejora de forma admisible, conservar el control y entregar los mejores descartados con la causa exacta. ChatGPT analizará el siguiente paso.

## 8. Métricas, guardas y selección

### 8.1. Cálculos de comparación

- Unidad principal: actuación de equipo en el mismo conjunto de encuentros para ambos motores.
- Conteos: conservar media real y **media normalizada a 40 minutos por actuación**. El objetivo ±5 % se evalúa sobre la normalizada, para no introducir una diferencia artificial por prórrogas.
- `error_relativo = abs(media_SIM40 / media_DET40 − 1)`.
- Porcentajes: sumar numeradores y denominadores completos; no promediar porcentajes redondeados. Conservar sumas de 40 minutos y muestra sin prórroga como comprobaciones auxiliares, identificando su universo.
- `error_tiro = abs(aciertos_SIM/intentos_SIM − aciertos_DET/intentos_DET)`; banda 0,03.
- `error_cuota_zona = abs(FGA_z_SIM/FGA_SIM − FGA_z_DET/FGA_DET)`; guarda 0,03.
- Denominador inexistente: `null` con causa. Si ambas medias son exactamente cero, indicar igualdad de ceros sin inventar un error relativo. DET cero y SIM no cero: diferencia absoluta y no evaluado relativo, nunca aprobado por omisión.

### 8.2. Cuadro principal completo

**Conteos con objetivo 0,05:** puntos; FGM/FGA; 2PM/2PA; 3PM/3PA; FTM/FTA; ORB, DREB y rebotes totales; AST a canasta; AST a libres y total beM, diferenciadas; pérdidas totales; robos; tapones; faltas cometidas y recibidas.

**Acierto con objetivo 0,03:** campo, dos, tres, libres, aro, inside sin aro y media distancia. No duplicar triple como otra observación independiente por ser también zona.

**Cuotas con guarda 0,03:** aro, inside, media y triple. Mantener la métrica eZ histórica, pero no sustituir por ella las cuatro diferencias visibles.

Informar además: AST_FG/FGM; ORB/(ORB+DREB rival); pérdidas individuales/colectivas; tapones recibidos; expulsados por cinco faltas; jugadores utilizados; minutos y uso; anotador principal; quintetos y familias; calidad por zona/contexto; puntos por cuarto; prórrogas; dispersión y bandas de puntos; desgloses por equipo/plan.

No exigir ±5 % a mínimos/máximos aislados, DNP o porcentaje de un jugador con dos intentos. Tampoco eliminar una estadística principal de bajo volumen del informe porque sea difícil entrar en banda. Explicar la incertidumbre de muestra.

### 8.3. Selección predeclarada

Define un nuevo indicador, distinto del M de 04C:

`M04D = max(errores_relativos_de_conteos / 0,05; errores_de_acierto / 0,03; errores_de_cuota_zona / 0,03)`.

Publicar todos los componentes, numeradores, denominadores y el dominante. Las métricas derivadas repetidas no reciben pesos adicionales: es un máximo, no una suma.

Guardas contra Z0-A0, siempre comparando con el mismo control:

- Conteo: `e ≤ max(0,05; e_control + 0,02)`.
- Acierto: `e ≤ max(0,03; e_control + 0,005)`; 0,005 son 0,5 pp.
- Cuota por zona: `e ≤ max(0,03; e_control + 0,01)`.
- Calidad forzada al aro/inside: su diferencia frente a DET no empeora más de 0,02 respecto al control; informar ambas aunque cumplan.

Invariantes, causalidad de créditos, ausencia de sujetos fantasma, identidad, aprendizaje e información pública no admiten tolerancia.

Selecciona menor M04D entre vectores completos, válidos, evaluables y con todas las guardas. Exige mejora relativa de M04D ≥5 % para proponer sustitución. Desempates: menos filas modificadas; menor distancia normalizada usando los rangos declarados —peso aro [1,5;2,5], reinicio [0,35;0,85], peso triple [0,60;0,70] y restantes rangos de edición—; después ID lexicográfico, tolerancia numérica 1e-9. Valores fijos y lecturas no cuentan como nuevas distancias deportivas.

Si hay una métrica principal no comparable por una discrepancia demostrada de política, conservar M04D completo como `no evaluable`, y publicar **además** un `M04D_comparable` con el inventario explícito de exclusiones. Puede proponerse la mejor alternativa comparable, pero no declarar cumplido el acta completa ni usar esa exclusión para ocultar una desviación numérica ordinaria.

**M04D > 1 implica que alguna banda sigue incumplida**, aunque haya una mejora útil. Una métrica ya en banda no gana permiso para salir por mejorar el promedio de otras.

## 9. Campaña y reserva nueva

### 9.1. Desarrollo conocido

Usar las **48 entradas VAL de 04C** como DEV conocido. Tanto aquella VAL como CAL ya han sido analizadas; no volver a llamarlas reserva independiente.

Reutilizar sus 48 DET y la candidata 04C cuando existan los registros auténticos y coincidan entrada, semilla y versión. Si faltan, reconstruir entradas/registros desde el mismo repositorio, registrar la reproducción y su coste. No recrear ZIP históricos como si fueran los originales. Máximo de reconstrucción: 48 DET y 48 SIM de control anterior.

Ejecutar los 36 vectores de DEV sobre las mismas 48 entradas; máximo 1.728 SIM. Conservar la misma semilla por caso entre vectores. Reusar Z0-A0 cuando ya se haya ejecutado como control; no duplicarlo como muestra.

Congelar candidata completa y código deportivo antes de ejecutar la reserva nueva.

### 9.2. VAL04D: nueva y cerrada

Doce parejas no ordenadas: `(01,04), (04,07), (07,10), (10,01), (02,05), (05,08), (08,11), (11,02), (03,06), (06,09), (09,12), (12,03)`, donde 01 significa EQ01. Dos orientaciones y cuatro réplicas: **96 encuentros lógicos**, los doce equipos y dieciséis actuaciones por equipo.

Usar fichas originales y planes naturales. Tres condiciones: detallado congelado, control deportivo 04C y candidata fijada 04D. Máximo **96 DET + 192 SIM**. Si la candidata coincide con el control, declarar el alias y reutilizar los registros, sin inflar el recuento.

Distinguir siempre `C0_04C` —código/perfil deportivo anterior— de `D0_04D` —Z0-A0, con mecanismos nuevos neutrales y las correcciones demostradas ya aplicadas—. Las guardas de selección se refieren a D0_04D; VAL compara C0_04C con la candidata realmente entregada. Si solo se entrega D0_04D porque no gana otra combinación, todavía deben mostrarse sus correcciones frente a C0_04C. No declarar alias entre condiciones que difieran en créditos o deporte.

Clave de semilla nueva: `20261024|SIM04D|VAL|<pareja-orientada>|R<replica>`. SHA-256 UTF-8, primeros 32 bits big endian; cero →1. Colisiones reales: sufijos `#2`, `#3` registrados. La condición/modelo no entra en esa clave. Misma entrada/semilla no implica los mismos sorteos entre resolutores distintos.

No elegir ni retocar parámetros con VAL. Publicar cumplimiento por métrica, contradicciones y reserva consumida. Si cambia el deporte después de leer VAL, deja de ser confirmación independiente y debe etiquetarse así; no lanzar otra VAL silenciosa.

### 9.3. Diagnósticos y contratos

- **DIAG:** conservar, al ejecutar VAL, las primeras cuatro entradas por condición. No escogerlas por su resultado. Si el ejecutor necesita repetirlas, máximo cuatro adicionales por condición; declararlas aparte.
- **CONTRAST:** reutilizar las dieciséis entradas congeladas de 04C para T01 —rebote/balance—, T02 —interior/exterior—, T05 —director— y T07 —familiaridad—, con sus semillas. Control/candidata: hasta 32 SIM. Reutilizar ocho anclas DET auténticas o reconstruir hasta ocho si faltan. Exposición y probabilidades esperadas son más informativas que exigir un signo al marcador de una sola semilla.
- **TECH:** primeras cuatro entradas DEV; automático, fronteras y guardar/recuperar con consultas: hasta 12 SIM. Igualdad de huella dentro del mismo motor/perfil/entrada, no SIM contra DET.
- Una jornada mixta pequeña, recuperación tras recarga, historia y aprendizaje idempotente, reutilizando comprobaciones actuales. No construir otra temporada de 72 partidos para esta entrega.

Conservar todos los registros; solicitado, ejecutado, terminado, válido, no válido, fallido, interrumpido, reintento y no ejecutado por bloque/condición. Suite, navegador, diagnósticos repetidos y benchmark son extras separados. Un fallo no es una derrota ni un marcador cero.

### 9.4. Qué debe mostrar VAL además de la media

Acta global y por equipo; intervalos descriptivos obtenidos remuestreando partidos completos —ambos equipos juntos—, sin tratar cada tiro como independiente. Reusar el instrumento existente o, si no existe, 2.000 remuestreos deterministas offline, sin nuevas simulaciones deportivas.

Frecuencia <60, 60–69, 70–79, 80–89, 90–99, 100–109 y ≥110; desviación típica; prórrogas; minutos/uso de los perfiles. Informar margen medio por equipo y cambios de jerarquía, sin certificar una clasificación con dieciséis partidos por equipo.

La cercanía de una media no prueba equivalencia de todos los comportamientos. Las bandas son un criterio funcional provisional, no significación estadística ni validación externa.

## 10. Coste y contratos conservados

Esta entrega no reescribe workers, cachés o jornadas para perseguir cinco segundos. Las filas nuevas deben tener coste pequeño y aplicarse en los cálculos ya existentes.

Ensayo limitado: un lote de mil del control 04C y otro de la candidata, en procesos separados y con cuatro workers preparados, misma carga y agenda; después una jornada de mil final. Máximo **3.000 ejecuciones de rendimiento**, aparte de desarrollo/VAL. Usar 2.000 clubes y 24.000 jugadores remapeados por agenda, un partido por club, como el ensayo de 04C. Medir preparación y calentamientos adicionales; no ocultarlos ni incluir caché de resultados.

Objetivos conservados: cinco segundos para lote de mil con pool preparado; un segundo de publicación máxima; 1,5 GiB —1.536 MiB— de RSS en jornada. Medir también total continuo, barrera completa y sellado. No eliminar un cierre de la medida porque el marcador ya se vea.

Si el coste no cumple, informar distancia real y conservar la evidencia. No abrir otra ronda de optimización. Comparar control/final de la misma máquina; no atribuir variaciones entre sesiones a una fila sin medición aislada.

Se conserva el reloj común, las órdenes autorizadas por frontera, los estados públicos sin futuro, la clasificación y el uso simultáneo del detallado y SIM. No reducir estadísticas o salidas comprometidas para aparentar rendimiento.

## 11. Pruebas y recorrido manual

Automáticas nuevas justas, sobre caminos reales modificados:

1. Atribución `putback`/POS, incluidos falta y libres ligados, sin doble finalización ni cambios deportivos.
2. AST acreditada frente a mero pasador en lectores principal y auxiliar.
3. Crédito/oportunidad de rebote o recuperación: regresión solo para el defecto demostrado, con el fundamento de política y ausencia de duplicados.
4. Neutralidad de las seis filas nuevas y controles con los ajustes activos. Un cambio de versión no debe confundirse con diferencia deportiva; separar huella de archivo/identidad/trayectoria.
5. Mezcla: masa conservada, zonas imposibles no creadas, efectos relativos de estilos/atributos. Offset de aro una sola vez y estimación coherente; inside/media/triple intactos en esa operación.
6. Pérdida/robo/falta: terminales normalizados, robo solo en pérdida elegible y autor válido, reglas de series intactas. Pase espontáneo antes del tiro, sin autocompañero, herencia de asistencia ni crédito posterior fabricado.
7. Selector: bandas relativas frente a pp, casos sin denominador, control único, vectores completos, rechazo de una mejora agregada que dañe una métrica ya dentro de banda.
8. Guardado/recuperación, público sin futuro y aplicación posterior de aprendizaje única, reutilizando las regresiones actuales.

No escribir un test por cada celda del informe ni repetir todas las campañas antiguas. El desarrollo lleva hasta 36 vectores; las pruebas unitarias no deben ejecutar esos partidos otra vez.

Ejecutar suite completa una vez **después del último cambio de implementación/versiones**, `data:check` y comprobador documental sobre copia limpia. Si se corrige una expectativa tras una suite fallida, ejecutar la comprobación final pertinente y expresar con exactitud qué suite completa se ejecutó; no convertir un rerun parcial en suite completa verde.

Chromium: unos 10 pasos significativos con selección de motor, versión, carga manual de candidata, parámetros, acta/familias, guardado, jornada mixta y descarga real. Dennis hará el recorrido manual completo. No ejecutar mil partidos desde el navegador para duplicar el benchmark.

Crear `docs/prompts/SIM-MOTOR-04D-recorrido-manual.md`, de unos 10 pasos, con perfil, semilla, observables y señales de fallo. Ningún marcador exacto es un objetivo de calibración.

## 12. Archivos para ChatGPT

Cuatro archivos reales en `out/sim-motor04d/entrega-final/`, fuera de Git:

1. `SIM-MOTOR-04D-revision-rapida.zip`, objetivo ≤3 MiB.
2. `SIM-MOTOR-04D-evidencia-detallada.zip`; partir en piezas ≤60 MiB si hace falta, con índice.
3. `SIM-MOTOR-04D-indice-partes.json`, tamaños, SHA-256, versiones y contenido.
4. `SIM-MOTOR-04D-verificacion-final.json`, recibo fuera de los ZIP comprobados.

El rápido debe permitir hacer la comparación de actas sin abrir el detalle:

| Archivo/grupo | Contenido |
|---|---|
| `00-LEEME.md` | Estado real, orden, referencias, límites y decisiones |
| `01-IDENTIDAD.json` | Base, commits, congelaciones, perfiles y comprobación del detallado |
| `02-CAMBIOS.csv` | Lectura, crédito, mecanismo, fila, efecto y neutralidad |
| `03-VECTORES-Y-REGLAS.json` | Los 36 vectores completos, reglas previas, hashes y selección |
| `04-AGENDA-Y-RECUENTO.csv` | Casos, semillas, entradas, modelos, nivel, estado y reutilizaciones |
| `05-ACTA-EQUIPOS.csv` | Una fila por actuación, conteos reales y normalización, sin alias duplicados |
| `06-COMPARATIVA-ACTA.csv` | DEV/VAL: DET, control, candidata, delta, error relativo, banda y cumplimiento por métrica |
| `07-TIRO-Y-ZONAS.csv` | Aciertos/intentos, cuota, calidad y errores por zona/contexto |
| `08-REBOTES-Y-RECUPERACIONES.csv` | Embudo de oportunidades/créditos, tapón, libre vivo, expiración y causa no reconstruible |
| `09-ASISTENCIAS.csv` | Elegibilidad, pase, canasta y AST; fuera de rebote, inmediata, reinicio y total posterior a rebote |
| `10-EQUIPOS-USO-Y-DISTRIBUCION.csv` | Equipos, minutos, perfiles, bandas de puntos y contrastes |
| `11-SELECCION-DEV.json` | Numeradores, todos los errores, guardas, M04D y causas de descarte de cada vector |
| `12-RENDIMIENTO.json` | Carga, fases, publicación/sellado, memoria, objetivos y distancia |
| `13-COMPROBACIONES.json` | Conciliaciones, determinismo, contratos y pruebas reales |
| `14-LIMITES-Y-DECISIONES.md` | Métricas fuera de banda, no evaluadas y posibles discrepancias de política |
| `DICCIONARIO.md` | Unidades, fórmulas, denominadores, porcentajes/pp, alias y nulos |

En la comparación de AST, no repetir el error de 04C: el 74,3 % de la rama de reinicio no representa todas las canastas posteriores a ORB. En aquella VAL, ese conjunto completo estaba en 20,9 % frente a 64,9 % DET, y fuera del rebote 60,1 % frente a 67,9 %. Mantener los cuatro universos por separado, con su definición y límites de correspondencia entre resolutores.

El detalle contiene entradas congeladas, perfiles efectivos, registros esenciales de campaña, diagnósticos seleccionados, instrumentos completos con sus dependencias, tabla de elegibilidad de pase, resultados de pruebas, medición bruta e incidencias. Copiar el código necesario para reproducir lo prometido; no llamarlo checkout completo si no lo es. No guardar trazas completas de los 3.000 partidos de rendimiento si bastan huellas y mediciones.

Identidad global: campaña, condición/vector, caso, intento y equipo; identidad lógica para aprendizaje separada del intento. Conservar versiones y fórmulas antiguas cuando se compara un registro histórico.

Comprobador offline: verificar bytes y manifiestos, parseo, recuentos, actas/tablas, atribución, denominadores, vector realmente aplicado y selector desde numeradores. Sin volver a simular. Probar rechazo de una copia alterada y de un numerador incoherente, sin tocar los archivos finales. Enumerar no evaluados y dependencias ausentes.

Adjuntar realmente los archivos si el entorno lo permite. Si solo existen en el contenedor, dar su ruta exacta y cómo descargarlos; no afirmar «adjuntos» sin adjuntarlos. `out/` no se conserva en Git. Versionar el prompt, plan, reglas, notas y evidencia pequeña reproducible.

## 13. Respuesta final

ChatGPT hará el análisis deportivo detallado. Tu cierre debe ser factual y breve, con:

1. PR/rama/base, commit de código congelado, HEAD final y estado de fusión.
2. Correcciones reales, cambios deportivos y detallado intacto.
3. Candidata elegida y valores completos; mejora DEV y resultado VAL, sin reajustes posteriores.
4. **Tabla de acta DET/control/candidata**, diferencias relativas, porcentajes de tiro en pp y todas las bandas incumplidas. Separar medias reales y 40 minutos.
5. Rebotes: oportunidades/créditos, diferencias de política y qué se corrigió realmente. AST: total, fuera de ORB, inmediata y reinicio.
6. Cantidades reales y reutilizaciones; fallos, reintentos, diagnósticos, suite, navegador y benchmark separados.
7. Rendimiento medido y objetivos pendientes.
8. Pruebas ejecutadas, no ejecutadas, manual pendiente y los cuatro archivos reales.

No declarar «calibrado», «estadísticamente equivalente», «aceptado por Dennis», «conforme FIBA integralmente» o «motor cerrado» por pasar conciliaciones o mejorar un máximo de errores. Si no se alcanza ±5 %/±3 pp, indicar exactamente cuánto falta y entregar la candidata útil sin seguir gastando en rondas no autorizadas.

**Resultado buscado:** acercar el acta mediante pocos ajustes causales de SIM, respetar los aciertos ya próximos y mantener la táctica, las estadísticas individuales, el coste y la simultaneidad. Nada de corregir el marcador al final ni de igualar artificialmente todas las plantillas.
