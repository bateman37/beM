# MOTOR-10 — Análisis, estadísticas, resumen e información

> Prompt de implementación para Claude Code en **beM**. Dennis confirma MOTOR-09 fusionado en `main`; esa confirmación prevalece sobre el informe anterior que describía la PR #10 abierta.
>
> Objetivo: convertir los hechos del mismo partido en una lectura completa y comprensible: qué ocurrió, qué se intentó, qué oportunidades aparecieron y cómo terminó. No construir otra simulación para alimentar estadísticas ni presentar como terminado lo que MOTOR-09 dejó pendiente.

## Índice

1. [Mandato y reglas](#1-mandato-y-reglas)
2. [Base real y lectura dirigida](#2-base-real-y-lectura-dirigida)
3. [Alcance y límites](#3-alcance-y-límites)
4. [Saneamiento y pendientes de MOTOR-09](#4-saneamiento-y-pendientes-de-motor-09)
5. [Contrato común de consultas y métricas](#5-contrato-común-de-consultas-y-métricas)
6. [Catálogo estadístico y fórmulas](#6-catálogo-estadístico-y-fórmulas)
7. [Evolución, parciales y finales](#7-evolución-parciales-y-finales)
8. [Mapa sectorial y calidad de oportunidad](#8-mapa-sectorial-y-calidad-de-oportunidad)
9. [Análisis ofensivo y dirección](#9-análisis-ofensivo-y-dirección)
10. [Análisis defensivo y responsabilidades](#10-análisis-defensivo-y-responsabilidades)
11. [Saques, continuidad y situaciones especiales](#11-saques-continuidad-y-situaciones-especiales)
12. [Trabajo útil sin balón](#12-trabajo-útil-sin-balón)
13. [Quintetos, grupos y on-off](#13-quintetos-grupos-y-on-off)
14. [Filtros y comparaciones](#14-filtros-y-comparaciones)
15. [Resumen, claves y protagonistas](#15-resumen-claves-y-protagonistas)
16. [Relato y explicación deportiva](#16-relato-y-explicación-deportiva)
17. [Informes y navegación](#17-informes-y-navegación)
18. [Visibilidad y permisos](#18-visibilidad-y-permisos)
19. [Tablas administrables y semillas](#19-tablas-administrables-y-semillas)
20. [Registro, exportación y versiones](#20-registro-exportación-y-versiones)
21. [Verificación y recorrido manual](#21-verificación-y-recorrido-manual)
22. [Documentación y entrega](#22-documentación-y-entrega)
23. [Criterios de aceptación](#23-criterios-de-aceptación)

## 1. Mandato y reglas

Implementa MOTOR-10 sobre la arquitectura actual: análisis del encuentro, catálogo estadístico, resumen final, relato coherente e información diferenciada por audiencia. El motor sigue resolviendo acontecimientos dentro de posesiones.

Reglas obligatorias:

- Trabaja exclusivamente en beM. No abras `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios. Las referencias necesarias están en el funcional y las fuentes de este encargo.
- No añadas ticks, movimiento continuo, trayectorias, distancias ficticias, un segundo simulador, un servicio de IA o una dependencia externa para generar el resumen.
- Las consultas y textos son lectores del partido. No consumen azar deportivo, no modifican capacidades, energía, Forma, momentos, memoria o decisiones, y no cambian el marcador.
- No inventes un MVP integral, impacto causal, puntos evitados, probabilidad de victoria, producción contrafactual ni una nota universal del entrenador o del jugador.
- El catálogo funcional se conserva completo. No lo reduzcas a cuatro KPI, ni llenes de ceros los indicadores no registrados para aparentar cobertura.
- Cada tasa utiliza numerador y denominador del mismo universo. Cada afirmación relevante permite llegar a sus hechos o a una consulta reproducible.
- Las reglas de créditos y las convenciones están versionadas. Un cambio de lectura no reescribe silenciosamente el partido histórico.
- Parámetros editoriales y de muestra son SEM, visibles y administrables. No ajustes probabilidades de juego para que los informes resulten más vistosos.
- Pruebas automáticas acotadas y útiles; Dennis hará buena parte del test manual. No construyas campañas de cientos de partidos ni tests que dupliquen cada fila del catálogo.
- Conserva cambios locales ajenos, perfiles y archivos anteriores. No resetees ramas, no reescribas historial ni fusiones la PR.
- No cambies stack, base de datos, infraestructura o despliegue por comodidad de esta entrega.

El tamaño orientativo sigue siendo aproximadamente la mitad de una ventana de cinco horas de Claude Code. No es una promesa de consumo ni duración. No añadas trabajo para gastar cuota; si aparece un límite real, deja un punto de continuación preciso y distingue lo terminado de lo pendiente.

## 2. Base real y lectura dirigida

### 2.1 Verificar main

Parte de `main` con MOTOR-09 realmente integrado. Rama propuesta: `feature/MOTOR-10-analisis-y-resumen`, o la que imponga el entorno. Documenta rama y commit base efectivos, sin reutilizar una rama anterior mediante un reinicio destructivo.

El informe recibido declara, pendiente de comprobación local:

- 131 pruebas, trece nuevas en MOTOR-09.
- `npm run data:check` y comprobación documental correctos.
- Referencia `20261016`: 83–103, antes 88–110.
- Perfil con sufijo `+SEM-MOTOR09-20261016` y formato `export/8`.
- Cinco partidos de integración conciliados y reproducción idéntica del quinto con órdenes manuales.
- Acta reconstruida desde hechos, 33 conciliaciones y cinco casos preparados.
- Recorridos manuales de MOTOR-08 y MOTOR-09 pendientes de Dennis.

No declares que has ejecutado esas comprobaciones por haber leído el informe.

### 2.2 Documentación a consultar

Lee las normas raíz, índice, estado y roadmap. Después, mediante consulta dirigida:

- Funcional temático de estadísticas, análisis táctico, quintetos, informes, resumen, relato y permisos.
- Funcional unificado, capítulos 20–23, anexo de fórmulas y decisiones estadísticas finales, para resolver dudas concretas.
- Inventario EST01–EST08 y soportes del panel.
- `docs/tecnico/motor09.md`, especialmente su §13, acta, créditos y limitaciones.
- Recorrido manual y prompt archivado de MOTOR-09.
- Productores reales de hechos, proyecciones de acta, presencia, consultas existentes, registro y exportación.

No releas todos los MD históricos por defecto. Los adjuntos antiguos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen el diseño vigente de beM.

Este encargo se ha preparado con el funcional disponible y el informe recibido, no constituye una auditoría del código de `main`. Contrasta su correspondencia real antes de declarar un requisito implementado.

## 3. Alcance y límites

### 3.1 Resultado esperado

Dennis debe poder terminar un partido, entenderlo desde un resumen breve y profundizar en:

1. Acta y comparación de equipos, eficiencia, ritmo, tiro, pérdidas, rebote y libres.
2. Evolución, parciales, líderes, tiempo por delante y final ajustado.
3. Mapa sectorial, calidad previa, preparación y finalización.
4. Origen ofensivo, ejecuciones encadenadas, libro, prioridades, director y decisiones directas.
5. Organizaciones defensivas, presión, coberturas y responsabilidades observadas.
6. Banda/fondo, continuidades y finales.
7. Aportaciones útiles sin balón realmente resueltas.
8. Presencia, quintetos, grupos, unidades completas/mixtas y on/off descriptivo.
9. Informes propio, individual y rival con permisos correctos.
10. Evidencias, filtros y exportación analítica del encuentro.

El simulado total recibe el mismo catálogo que un partido visionado. No necesita haber generado todas las frases del relato mientras se simulaba.

### 3.2 Fronteras del roadmap

- MOTOR-11: población completa, generador y variantes de equipos/jugadores.
- MOTOR-12: simulación masiva, agregados de lotes y extracción ZIP completa.
- Calibración y validación amplia: según las entregas posteriores del roadmap.

No construyas una temporada, carrera, scouting persistente, generador de fichas, plataforma BI ni un motor de recomendaciones de entrenamiento.

Las consultas del partido deben ser reutilizables después para varios encuentros compatibles. Si no existe todavía un historial accesible, no inventes medias de temporada o percentiles. La integración histórica queda identificada como dependiente de datos, no como un cero.

### 3.3 Alcance deportivo sin expansión

Instrumenta tareas que el motor ya resuelve cuando falte conservar su efecto para el análisis. Registrar un cierre efectivo no exige simular un movimiento nuevo. Si una tarea no existe, no la inventes desde el resultado final: identifica ese hueco de productor.

El objetivo es completar la lectura del núcleo existente. El apartado siguiente delimita el saneamiento necesario de MOTOR-09 sin absorber toda su deuda reglamentaria en esta entrega.

## 4. Saneamiento y pendientes de MOTOR-09

### 4.1 Estado honesto de la cobertura

MOTOR-09 fusionado no equivale a reglamento cerrado. El informe declara sin ejecución algunas categorías, compensaciones y correcciones; inferioridad solo preparada; ausencia de tiro en vuelo/interferencia como familias propias y falta de suspensión persistida.

Antes de producir informes, conserva una matriz de cobertura que diferencie:

- Dato producido y política acreditada.
- Dato producido bajo convención beM o regla provisional identificada.
- Administración preparada pero no ejecutable en flujo natural.
- Campo no registrado o caso no implementado.
- Ejecución inválida, parcial o administrativa.

«Todas las conciliaciones pasan» prueba consistencia bajo esas reglas, no conformidad normativa completa.

No marques como lectura directa del PDF una fila copiada de un resumen del prompt. Si el estado actual usa «contrastada» con ese significado, precisa su procedencia sin borrar el historial.

### 4.2 Qué corregir ahora

Son bloqueos de MOTOR-10 los errores que hagan falsos los indicadores ofrecidos: créditos duplicados, universos mezclados, asistencias automáticas por último pase, atribución al último plan de toda una posesión mixta, puntos administrativos metidos en F, presencia incorrecta o filtrado que revele datos ocultos.

Corrígelos en el productor/política común, no con un parche diferente en cada tabla. Versiona el cambio y comprueba su efecto.

No uses MOTOR-10 para implantar de forma improvisada todas las técnicas, combinadas, art. 45, tiro en vuelo, interferencia, inferioridad natural o persistencia de suspensión. Conserva un inventario concreto de pendientes de MOTOR-09, su impacto y su requisito de cierre. Ningún informe puede presentar como observado un caso que el motor no ejecuta.

Si un encuentro natural falla por falta de cinco elegibles, debe constar ejecución inválida bajo la implementación actual; no puede obtener un resumen de victoria normal. Una prueba preparada de inferioridad no demuestra que esa ruta funcione en el partido natural.

### 4.3 Asistencias: criterio verificable

Fuente consultada para preparar este encargo:

**FIBA Statisticians’ Manual 2024, v1.0, capítulo 6**:

<https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf>

Síntesis de los criterios pertinentes: solo el último pase puede recibir asistencia. Recibir y anotar dentro de pintura mantiene crédito si no se abandona esa zona. Fuera de pintura, anotar sin bote acredita asistencia; con bote hay que distinguir continuación de ventaja y creación propia ante un defensor colocado. La recepción en campo propio seguida de recorrido hasta canasta no la acredita. Una desviación clara hacia un receptor distinto invalida el candidato. Una serie elegible por falta de tiro admite una asistencia si se convierte al menos un libre; no una por cada libre. Un fallo y rebote intermedios rompen la atribución del pase anterior.

Esta síntesis procede de una consulta de ChatGPT de la fuente. Si tú no puedes abrirla por 403, registra que utilizaste este extracto con procedencia y alcance, no una lectura directa tuya ni una auditoría completa del manual.

Implementa o confirma la correspondencia con los estados funcionales reales: recepción interior/exterior, continuación de ventaja, creación nueva, desviación, tiro/falta y serie. No simules botes ni impongas un número universal de botes si el modelo no los representa.

El 75 % de canastas con asistencia no es un objetivo a reducir ni una prueba de error. Revisa el criterio y la exposición: si el receptor tuvo que crear una nueva ventaja exterior, el mero pase previo no basta. Si faltan datos causales, instrumenta su decisión actual; no sortees quién merece una asistencia.

Mantén `AS_C` y `AS_L`. El porcentaje de canastas asistidas utiliza solo `AS_C` y las canastas elegibles, nunca `AS total/FGM`. No impongas `AS total ≤ FGM`.

### 4.4 Rutas antiguas y datos provisionales

Registra que falta ofensiva, relojes o ventanas pueden seguir fuera de la matriz normativa. Para los informes utiliza su resultado efectivo y la política real identificada; no afirmes que todos los hechos ya pasaron por REG02.

Los valores provisionales de inferioridad o resultado adjudicado no se convierten en referencias oficiales al mostrarlos. Un resultado administrativo y la producción de cancha siguen separados.

No cambies energía, memoria, ruta B o coberturas para hacer que una conclusión del resumen aparezca. Conserva las correcciones ya realizadas y su trazabilidad.

## 5. Contrato común de consultas y métricas

### 5.1 Un catálogo, varios lectores

Crea o amplía una capa común de consultas/proyecciones sobre hechos y acta. El mismo indicador alimenta tabla, gráfico, resumen, informe y export. No mantengas cinco fórmulas de PPP con nombres iguales.

Una definición de indicador incluye:

| Campo | Contenido |
|---|---|
| Identidad | ID estable, etiqueta, grupo, definición y versión. |
| Naturaleza | Conteo, razón, estimación convencional, descriptor o inferencia identificada. |
| Unidad | Puntos, intentos, minutos, porcentaje, por 100 ataques, por oportunidad, etc. |
| Fuente | Hecho/relación/productor necesarios y política de crédito. |
| Universo | Hechos, posesiones, F, ejecuciones o tramos elegibles. |
| Cálculo | Numerador, denominador, agregación y tratamiento de cero. |
| Tiempo | Momento usado para filtrar y presencia/plan pertinente. |
| Cobertura | Disponible, parcial, no registrado, no aplicable o no definido. |
| Información | Público, propio o diagnóstico; redacción permitida. |
| Muestra | Exposición, mínimo SEM para destacar y mensaje de cautela. |
| Evidencia | IDs o consulta reproducible para abrir sus hechos. |

No impone una tabla física por indicador ni fórmulas ejecutables arbitrarias desde el panel. Reutiliza operaciones permitidas y condiciones tipadas.

### 5.2 Resultado de una consulta

Conserva como mínimo valor, conteos base, unidad, universo/filtros, muestra, exclusiones, cobertura y versiones. Una razón sin su exposición no puede sostener una clave del resumen.

Usa agregación `suma(numeradores)/suma(denominadores)`. No promedies porcentajes de períodos con distinto número de intentos.

El redondeo es de presentación. Ordenaciones y conciliaciones usan precisión completa. Sin denominador válido muestra `—` con motivo; no cero, infinito o NaN.

Distingue observación cero de no registrado. Un dato disponible solo en partidos nuevos no se rellena retrospectivamente en los antiguos a partir del relato.

### 5.3 Hechos, unidades y tramos

- **Hechos:** tiro, crédito o intervención ocurrido dentro del filtro.
- **Unidades:** posesión, F o ejecución que cumple el criterio declarado de inicio, cierre o contención.
- **Tramos:** producción mientras estuvo activa una presencia o un plan.

Cada vista ofrece un criterio por defecto comprensible, conservado en su export. No obligues a Dennis a configurar toda la teoría de universos para abrir una estadística.

### 5.4 Rendimiento y sencillez

Construye índices o proyecciones por partido cuando ayuden; memoiza por partido, revisión, política, audiencia y filtros normalizados. Invalida lo afectado por correcciones.

No explores el historial entero en cada actualización de reloj, ni precalcules todos los cruces posibles. Calcula grupos seleccionados cuando se solicitan. Las consultas no amplían la memoria deportiva activa de ocho patrones.

## 6. Catálogo estadístico y fórmulas

### 6.1 Acta y comparación básica

Reutiliza el acta MOTOR-09: identidad histórica, participación/DNP, minutos, puntos, dos/tres/libres, rebotes, asistencias, pérdidas, robos, tapones, faltas, más-menos, mates y valoración declarada.

Totales del equipo, suma individual y filas colectivas no son la misma fila. Conserva parciales, recursos, estado del encuentro y conciliación accesible.

Un marcador administrativo adjudicado no se explica mediante tiros de cancha ficticios. Las tablas de rendimiento usan lo disputado y su elegibilidad.

### 6.2 Fórmulas que implementar

En esta tabla, todas las variables pertenecen al mismo universo válido. `D` es duración real disputada en minutos, `L` duración reglamentaria, `P_A/P_B` posesiones ofensivas beM de cada equipo, `PTS_F` puntos causalmente ligados a F cerradas.

| Indicador | Fórmula/definición | Lectura |
|---|---|---|
| TC %, T2 %, T3 %, TL % | `100 × aciertos/intentos válidos` | Conteo de acta. |
| eFG % | `100 × (TCC + 0,5 × T3C)/TCI` | Valor relativo del triple; puede superar 100 %. |
| TS % estimado | `100 × PTS/[2 × (TCI + 0,44 × TLI)]` | Convención estimada, no oportunidades exactas. |
| Frecuencia de triple | `100 × T3I/TCI` | Distribución, no acierto. |
| Frecuencia por sector | `100 × TCI_sector/TCI elegibles` | Incluye desconocido cuando proceda. |
| Libres por tiro de campo | `TLI/TCI` | Unidad explícita; por 100 multiplica por 100. |
| Puntos de campo por intento | `(2 × T2C + 3 × T3C)/TCI` | Excluye libres. |
| Puntos por F | `PTS_F/F cerradas` | Propia de beM, excluye sanción no de tiro y administración. |
| Canastas asistidas % | `100 × AS_C/canastas elegibles` | No usa AS_L. |
| ORtg global A | `100 × PTS_A/P_A` | Incluye administrativos bajo política global declarada. |
| DRtg global A | `100 × PTS_B/P_B` | Denominador rival. |
| NetRtg | `ORtg − DRtg` | Universos compatibles. |
| Ritmo | `L × [(P_A + P_B)/2]/D` | Prórrogas en D, pausas fuera. |
| PPP por origen/unidad | `PTS vinculados/P elegibles` | No utiliza puntos administrativos sin vínculo. |
| PER por 100 ataques | `100 × PER/P` | Exacto bajo convención beM. |
| TOV % convencional | `100 × PER/(TCI + 0,44 × TLI + PER)` | Estimación diferente de la anterior. |
| Posesiones estimadas | `TCI + 0,44 × TLI − RO + PER` | Comparación; no sustituye P registrado. |
| RO % de acta | `100 × RO_A/(RO_A + RD_B)` | Política colectiva uniforme. |
| RD % de acta | `100 × RD_A/(RD_A + RO_B)` | Misma definición de créditos. |
| Rebote por oportunidad | `100 × capturas elegibles/ofertas registradas` | No equivale a cuota entre rebotes acreditados. |
| X por 40 minutos | `40 × X/MIN` | Extrapolación descriptiva, no predicción. |
| X por minuto | `X/MIN` | No calculable con tiempo cero. |
| Producción por 100 en presencia completa | `100 × créditos elegibles/ataques completos correspondientes` | No usa todos los puntos de presencia. |
| Cuota de F | `F del jugador/F del equipo en U` | Descripción de finalización, no dirección. |
| Cuota de cierres | `cierres individuales/cierres elegibles del equipo` | Fila colectiva/sin actor separada. |
| Ratio AS/PER | `AS/PER` | PER=0: muestra conteos y ausencia de ratio finito. |
| Cuota de rebote | `capturas jugador/capturas equipo en U` | No probabilidad de capturar. |
| REC por 100 ataques rivales | `100 × REC/P rival elegible` | No todas las recuperaciones. |
| Tapones sobre tiros rivales | `100 × TAP/TCI rivales elegibles` | Declara si el universo restringe a dos puntos. |

Conserva también USG estimado del funcional:

`USG_est = 100 × (TCI_j + 0,44 × TLI_j + PER_j) × D / [MIN_j × (TCI_eq + 0,44 × TLI_eq + PER_eq)]`.

Es una aproximación por tiempo, no mide cuánto organiza el director. No la ofrezcas en un filtro sin duración/numerador compatibles.

La asistencia a canasta sobre producción de compañeros y la captura por oportunidad individual se calculan solo con sus universos documentados. No se ofrece una fórmula genérica de «porcentaje de éxito» a toda intervención.

### 6.3 Cuatro factores y límites

Ofrece comparación de eFG, pérdidas, rebote ofensivo y frecuencia de libres. Etiqueta qué versión de pérdidas utiliza; si presentas ambas, sus nombres y denominadores deben diferenciarse.

No limites todas las métricas a 0–100 por parecer porcentajes: eFG/TS pueden exceder ese rango. No llames «TS real» a puntos por F. No fabriques ORtg/DRtg individual como mérito exacto: muestra eficiencia del equipo durante la presencia del jugador con ese nombre.

### 6.4 Producción y etiquetas solapadas

Conserva dos clasificaciones:

1. Particiones excluyentes de puntos por dos/tres/libres/créditos tipados y por F/sanción/administración.
2. Etiquetas de contexto: pintura, banquillo, tras pérdida, transición, segunda oportunidad, saque y final de reloj.

Una canasta de dos puede pertenecer simultáneamente a varias etiquetas del segundo grupo. No sumes esos puntos para explicar el margen.

- Pintura: puntos de campo del sector pertinente; los libres no se convierten en pintura por su origen.
- Banquillo: anotador que no perteneció al cinco inicial histórico.
- Tras pérdida: siguiente ataque elegible abierto por esa pérdida, con su continuidad definida.
- Segunda oportunidad: producción después del primer rebote ofensivo en la misma continuidad, acreditada una sola vez. El resultado local de la primera acción tras cada rebote es otra consulta.
- Transición beM: fase deportiva resuelta antes de defensa organizada; no se infiere únicamente por duración.
- Contraataque de convención externa: solo si se completa su política temporal/contextual; no se renombra toda transición como estadística externa.

Para cada etiqueta muestra también exposición, intentos, pérdidas y F cuando son pertinentes; puntos sin oportunidades no bastan para valorar su frecuencia.

## 7. Evolución, parciales y finales

Construye desde las anotaciones válidas:

- Curva escalonada de marcador y diferencia, con períodos y prórrogas.
- Máxima ventaja de cada equipo, primer instante y secuencia vinculada.
- Empates producidos por anotación, excluyendo 0–0 inicial.
- Cambios de líder conservando el último líder no empatado; la primera ventaja no es cambio.
- Tiempo por delante/empatado/por detrás mediante intervalos deportivos, excluyendo pausas.
- Parciales sin respuesta, parciales por ventana, rachas de intentos válidos y remontadas observadas.
- Pausas y cambios efectivos de plan como marcadores de contexto, con antes/después descriptivo.

Los hechos con el mismo reloj conservan secuencia. No los desplaces a segundos inventados para separarlos en el gráfico. Un libre puede cambiar el líder sin sumar tiempo.

Un tiempo muerto no rompe por sí solo un parcial sin respuesta. Precarga: el total del partido puede atravesar cuartos; la consulta de un período se restringe a ese período. Mantén el criterio visible.

### 7.1 Final ajustado estadístico

La configuración inicial acordada es **últimos 120 segundos de Q4 o de cada prórroga y margen previo absoluto de cinco puntos o menos**.

No la sustituyas por la ventana de cierre del entrenador de MOTOR-08, ni por el cálculo de presión de MEN07. Son conceptos distintos. Evalúa tiempo y margen antes del hecho relevante; no selecciones solo lo que terminó siendo decisivo retrospectivamente.

Para posesiones completas, declara si usas condición de inicio o contención; por defecto, inicio para el listado de ataques y condición previa del evento para tiros/créditos. No mezcles ambos numeradores en una misma tasa.

La crónica puede destacar retrospectivamente un tiro que cambió el resultado, rotulado como desenlace, sin convertirlo en una nueva definición del filtro.

## 8. Mapa sectorial y calidad de oportunidad

### 8.1 Diez sectores funcionales

| ID | Sector |
|---|---|
| Z01 | Aro/cercanía inmediata. |
| Z02 | Resto de pintura. |
| Z03 | Media izquierda. |
| Z04 | Media central. |
| Z05 | Media derecha. |
| Z06 | Triple esquina izquierda. |
| Z07 | Triple exterior izquierda. |
| Z08 | Triple central. |
| Z09 | Triple exterior derecha. |
| Z10 | Triple esquina derecha. |

Usa sectores de una pista, no puntos exactos aleatorios. Si el registro solo sabe interior/media/exterior, conserva esa menor resolución o desconocido. No repartas tiros entre izquierda y derecha para llenar el mapa.

Muestra intentados/convertidos, porcentaje, frecuencia y puntos pertinentes; leyenda y muestra. La escala de frecuencia no es la de acierto. Comparar dos mapas utiliza la misma escala y unidades.

El sector abre los intentos y sus circunstancias. El valor reglamentario procede del hecho vigente, incluso tras revisión, no de la suposición del dibujo.

### 8.2 Tres calidades previas

Calidad: **cómoda, normal o forzada**, determinada antes del desenlace por preparación, oposición, contexto y reloj. Reutiliza la clasificación existente; no vuelvas a calcularla desde el acierto o desde una probabilidad absoluta del tirador.

Un mal tirador puede fallar una oportunidad cómoda. Una estrella puede convertir una forzada. Ambas se mantienen en su categoría.

Muestra cuántas se ofrecieron, reconocieron/eligieron y ejecutaron cuando cada fase esté registrada y autorizada. No supongas que todo candidato interno fue percibido por el jugador ni que toda ocasión no elegida estuvo públicamente disponible.

No añadas producción esperada, puntos evitados o un modelo xPTS nuevo. Las probabilidades exactas ya calculadas, si se consultan, pertenecen al diagnóstico con sus límites y no se filtran al resumen rival.

## 9. Análisis ofensivo y dirección

### 9.1 Plan ordenado, activo y ejecutado

Conserva los tres niveles. La orden enviada no cuenta como aplicada mientras está pendiente. El plan activo no demuestra que su disposición llegara a organizarse ni que una ficha comenzara.

Reconoce los estilos y política de media distancia existentes, seis disposiciones, familias y variantes reales. No amplíes el repertorio porque el informe necesite más filas.

### 9.2 Origen principal de posesión

Una posesión tiene un origen principal excluyente: primera acción ofensiva significativa realmente iniciada, o avance/preparación interrumpidos cuando no llegó a iniciarse.

Una decisión directa lleva su subtipo; no conviertas automáticamente un tiro tras bote en aclarado. Transición, saque y procedencia de decisión son ejes distintos y conservan sus relaciones.

Tabla por origen:

- Posesiones y frecuencia sobre el total elegible.
- Puntos vinculados de toda su continuidad y PPP de ese universo.
- F, tiros/libres válidos y causas, pérdidas y rebotes ofensivos.
- Calidad previa, cambio de acción y causa de cierre.

Las filas, incluidos interrumpidos/otros/desconocido, reconcilian el total elegible. Los administrativos sin vínculo se muestran aparte.

### 9.3 Ejecuciones encadenadas

La tabla de ejecuciones registra familia, variante, participantes, prioridad, respuesta/cobertura, oportunidad creada, alternativa, resultado local y continuación.

Una posesión directo → cambio → poste cuenta una posesión de origen directo y dos ejecuciones pertinentes. No atribuyas todos sus puntos a ambas familias en una suma que pretenda cuadrar el marcador.

Distingue:

- Porcentaje de ejecuciones: denominador ejecuciones.
- Porcentaje de posesiones donde apareció una familia: admite solapamiento.
- PPP por origen: partición de posesiones.
- Resultado local: consecuencia de esa interacción, no el futuro entero de la cadena.

### 9.4 Libro, director y roles

Muestra prioridades 1–5, empates de prioridad, acciones fuera de libro permitidas, opciones impedidas y continuaciones. Una prioridad 5 no demuestra desobediencia; prioridad 1 no es una cuota garantizada.

Por director real: ataques dirigidos, elecciones, creación, circulación, finalizaciones propias, pérdidas, alternativas y calidad seleccionada. Si cambia durante el ataque, distingue dirección de origen y actor de cada decisión pertinente.

Cruza rol activo, director, libertad y contexto cuando el permiso lo permita. No inventes una nota de obediencia, excentricidad o IQ desde esas cifras.

La procedencia propia de una decisión puede ser conocida; las prioridades y órdenes privadas del rival no se muestran como valores observados.

### 9.5 Repetición y respuesta

Utiliza claves semánticas MEM existentes y hechos deportivos. Distingue exposición, reconocimiento, recomendación, respuesta ya activa, aplicación por ruta A/B y no aplicación por causa.

En la vista ordinaria muestra la repetición y la respuesta observables. El tamaño del caché, la evidencia exacta y las alternativas no percibidas son diagnóstico.

No concluyas adaptación porque la cuarta ejecución falló, ni ausencia de adaptación porque siguió entrando. Muestra cambios en oportunidad y alternativa, con participantes y muestra.

## 10. Análisis defensivo y responsabilidades

### 10.1 Organización y presión

Por organización efectiva: ataques rivales completos estables, puntos vinculados concedidos, eficiencia, perfil de tiro/calidad, pérdidas/robos, faltas/libres y rebote defensivo. Los ataques que cruzan cambio de organización van a una categoría mixta.

Los hechos de tiro pueden clasificarse por la organización activa en su momento; no atribuyas toda una posesión al último plan por ser más fácil de programar.

Distingue altura de presión, estilos y cobertura. «Toda pista» no significa que en todos los ataques se resolviera una intervención de presión.

Para presión resuelta: avances intervenidos, pérdida antes de organizar, superación con/sin ventaja, duración del avance, falta y continuación. No inventes distancia, velocidad o número de pasos.

### 10.2 Coberturas y cadena de ayuda

Cruza familia ofensiva, cobertura realmente ejecutada, actores, resultado local, calidad y salida posterior. Una ayuda no es otra posesión defendida. Una respuesta incompatible o recomendada pero no ejecutada no entra en el numerador de uso.

Conserva el vínculo ayuda → pase → opción exterior cuando se haya resuelto. La frase «producción después de ayuda» describe la cadena; no demuestra cuántos puntos causó o evitó la ayuda.

### 10.3 Defensa individual

Ofrece tres consultas distintas:

1. Responsabilidad principal inicial.
2. Oposición final al intento.
3. Participaciones pertinentes, incluidas ayudas/recuperaciones, que pueden solaparse.

No cargues todos los puntos del anotador al defensor nominal. Un tiro con tres participantes defensivos sigue siendo un tiro; si sumas participaciones, la etiqueta lo explica.

Box and one y doble a objetivo requieren mirar al objetivo y a las salidas de compañeros. Un objetivo con menos puntos no prueba por sí solo mejor defensa colectiva.

## 11. Saques, continuidad y situaciones especiales

Separa banda/fondo, ataque/defensa, recurso llamado y respuesta ejecutada. Muestra causa de reanudación, tiempo disponible, primera opción, negación, alternativa, receptor y desenlace.

Distingue recepción conservada, pérdida de saque, oportunidad directa, puntos directos de su secuencia inicial y producción de toda la posesión. La secuencia directa termina antes de una nueva organización según las fichas vigentes.

No clasifiques una recepción forzada inventada como éxito del saque. Solo cuentan ventanas y recepciones reales resueltas por el motor.

Para falta táctica y finales muestra orden, intento, clasificación efectiva, sanción, reloj y continuidad. No afirma probabilidad de remontada ni convierte una decisión razonable en error solo porque se perdió.

Los casos reglamentarios no ejecutados en MOTOR-09 se identifican como no implementados, no como cero incidencias observadas de un mecanismo activo.

## 12. Trabajo útil sin balón

Instrumenta y ofrece el catálogo acordado sobre tareas reales:

| Aportación | Evidencia mínima |
|---|---|
| Pantalla útil | Pantalla legal ejecutada que produce un contexto favorable registrado. |
| Canasta tras pantalla | Vínculo de cadena con finalización; indicador propio, no AS del bloqueador. |
| Corte disponible | Opción real ofrecida; utilización separada de disponibilidad. |
| Desmarque útil | Recepción o desplazamiento de responsabilidad resuelto. |
| Ocupación que limita ayuda | Restricción de ayuda efectivamente considerada y registrada. |
| Continuación/apertura | Opción ofrecida y receptor/resultado si se elige. |
| Ayuda pertinente | Intervención, efecto local y continuidad. |
| Recuperación de responsabilidad | Redistribución real y oposición resultante. |
| Seguimiento de pantalla | Respuesta ejecutada y opción conservada/concedida. |
| Cierre útil | Tarea que limita acceso y captura asociada si la hay. |
| Desvío sin recuperación | Intervención sobre balón sin convertirlo en REC. |
| Disputa recuperada | Disputa y control final, distinguidos de rebote cuando corresponde. |

No atribuyas utilidad al bloqueador porque entró el tiro ni al cerrador porque un compañero capturó sin que conste su tarea. Un fallo no demuestra ayuda buena.

Si un productor realiza la operación pero no guarda el efecto, conserva un hecho compacto en ese punto. Si no existe la operación o el dato no puede derivarse, registra la dependencia concreta. No uses «no registrado» como excusa para omitir todo el bloque cuando el núcleo sí resuelve esas tareas.

Una oportunidad puede tener varios colaboradores sin repartir artificialmente el 100 % del mérito. No añadas porcentajes de valor del pasador/bloqueador/tirador ni un índice universal sin balón.

## 13. Quintetos, grupos y on-off

### 13.1 Presencia y unidades completas

Reutiliza intervalos efectivos y secuencia de MOTOR-09. Distingue:

- **Presencia:** puntos y hechos mientras estaban en pista, minutos y más-menos.
- **Posesiones completas estables:** toda la unidad transcurrió bajo esa presencia; sus puntos elegibles forman el numerador de eficiencia.
- **Mixtas:** cruzan entrada/salida o cambio pertinente; visibles aparte.

No dividas todos los puntos de presencia entre solo las posesiones completas. No atribuyas una posesión entera a cada cinco que participó ni la repartas en fracciones temporales no acordadas.

Una sustitución legal entre libres puede repartir sus puntos de presencia sin sumar tiempo y convertir la posesión en mixta. Conserva secuencia, elegibilidad y condiciones; no habilites sustituciones genéricas entre intentos para fabricar el ejemplo.

### 13.2 Quintetos y grupos

Por cinco: jugadores, tiempo, tramos, producción a favor/en contra, más-menos, ataques completos propios/rivales, mixtos, eficiencias estables, tiro/pérdidas/rebote y contexto rival.

Permite seleccionar un jugador, pareja o grupo, sin enumerar todas las combinaciones posibles. Una pareja puede permanecer durante toda la posesión aunque cambie un tercer compañero; la elegibilidad depende del grupo seleccionado, no obliga a un quinteto fijo.

No conviertas posiciones nominales en perfiles tácticos. «Sin base nominal» no equivale a «sin director funcional». Conserva roles y funciones reales de cada tramo.

### 13.3 On/off descriptivo

Con/sin jugador muestra minutos/tramos, marcador de presencia, créditos, ataques completos propios y rivales, mixtos, eficiencias y distribuciones de compañeros/rivales/planes.

Diferencia observada = métrica con − métrica sin, bajo la misma definición. No se denomina impacto causal ni puntos que aporta.

Si no hay posesiones completas en una mitad de la comparación, no hay diferencia finita calculable. Muestra la falta de exposición, no 0 y una ventaja inflada.

Los administrativos durante presencia quedan identificados; las tasas estables usan puntos vinculados a sus unidades salvo otra política explícita. No mezcles de forma accidental el ORtg global del partido con una tasa estable de quinteto.

### 13.4 Muestras y grupos mixtos

Los rankings muestran exposición, criterio de orden y mínimo visible configurable. Una tasa de dos posesiones no se convierte en «mejor quinteto» sin contexto.

Los mixtos no desaparecen de la reconciliación. Los grupos solapados son consultas, no una partición que deba sumar el acta general.

## 14. Filtros y comparaciones

Implementa un filtro común con opciones compatibles según la vista:

- Sujeto: equipo, jugador, rival y grupo seleccionado.
- Tiempo: partido, período/prórroga e intervalo.
- Presencia: con/sin, cinco/grupo, completo/mixto.
- Marcador previo: delante/empate/detrás y rango de margen.
- Final ajustado, final de reloj/período.
- Origen de entrada, origen ofensivo y procedencia de decisión.
- Disposición, familia, variante y prioridad conocida.
- Director y rol activo.
- Organización, presión, cobertura, ayuda y responsabilidad.
- Valor/sector, preparación, calidad y resultado del intento.
- Tipo de falta/sanción/bonus.
- Estado propio visible, solo cuando su exposición temporal esté conservada.

Historia/temporada/competición se mantienen en el catálogo, pero sus filtros requieren datos existentes. No construyas una competición ni crees valores de contexto ficticios para activarlos.

Cada vista indica si filtra hechos, unidades o tramos. Para bloques temporales, posesiones por cierre es la precarga ordinaria cuando no se requiere estabilidad completa; conserva inicio/duración y permite ver excluidas. Las vistas estables usan contención completa.

Un filtro de tiros de esquina no habilita automáticamente PPP con todas las posesiones del partido. Explica incompatibilidad o ofrece la métrica adecuada. Si una selección no tiene hechos, conserva filtros y muestra «sin hechos elegibles».

Las particiones incluyen desconocido/mixto/otros. Las etiquetas solapadas lo indican. Export y enlaces guardan la misma consulta; no pierden el filtro al abrir el detalle.

Para comparar A/B utiliza fórmulas, escala y unidades iguales. Las diferencias de porcentaje se expresan en puntos porcentuales cuando corresponda, con muestras de ambos lados.

Antes/después de una orden comienza en su aplicación efectiva. Precarga: tres ataques completos previos y tres posteriores pertinentes, si existen; muestra los realmente disponibles y mixtos aparte. No elijas retrospectivamente una ventana favorable. Esa comparación es descriptiva, no una prueba causal.

## 15. Resumen, claves y protagonistas

### 15.1 Contenido accesible

El resumen inicial incluye resultado/estado, parciales, tres claves principales cuando exista evidencia suficiente, líderes por criterio y acceso al detalle. El contenido expandido conserva:

- Evolución y momentos.
- Comparación de equipos y explicación aritmética del margen.
- Ataque/libro/director y defensa/respuestas.
- Rotación y actuaciones.
- Banda/fondo y finales.
- Disponibilidad e incidencias visibles.
- Crónica por período/prórroga.

No hace falta volcar todo en la primera pantalla. La profundidad está en navegación y desgloses.

### 15.2 Candidatos con evidencia

Cada candidato a clave conserva: ID de regla, categoría editorial, sujeto, texto con valores obtenidos de consultas, muestra, versión y enlace a evidencia. No introduce otra verdad numérica dentro de una plantilla.

Familias de candidatos acordadas: producción exterior/interior/libres, pérdidas y continuación, rebote/segunda oportunidad, calidad y selección, parcial/evolución, director/libro, respuesta defensiva, rotación, saques y finales.

La diferencia de puntos de tres describe producción. Para explicar cómo aparecieron los triples hace falta evidencia adicional de creación/cobertura/ayuda. No completes la segunda frase a partir de la primera.

### 15.3 Selección editorial SEM acotada

Precarga determinista y administrable:

1. Preferir una clave de producción, una de evolución y una de táctica si cada una tiene evidencia válida.
2. Cuando falte una categoría, completar con otro candidato válido no redundante.
3. Si hay menos de tres, mostrar menos; no inventar contenido ni rellenar con elogios.
4. Desempatar dentro de una categoría por prioridad declarada y criterio homogéneo de esa regla, después por ID estable. No comparar porcentajes y puntos con un score de mérito oculto.
5. No repetir el mismo conjunto sustancial de anotaciones como tres ventajas independientes. Conserva grupos de redundancia y referencias; triple/eFG/producción exterior pueden ser la misma explicación.

Semillas de elegibilidad de claves, que no son significación estadística:

| Tipo | Condición inicial para destacar |
|---|---|
| Diferencia de producción por dos/tres/libres | Diferencia absoluta de al menos 6 puntos en el componente; muestra de intentos visible. |
| Parcial sin respuesta | Al menos 8 puntos; inicio/fin y margen documentados. |
| Lectura de ejecución/cobertura | Al menos 4 ejecuciones elegibles y una relación deportiva registrada; no solo acierto. |
| Comparación de calidad | Al menos 8 oportunidades clasificadas por grupo comparado y diferencia de al menos 20 puntos porcentuales en la proporción de la categoría destacada; siempre conteos. |
| Quinteto/on-off destacado | Al menos 180 s y 8 ataques completos del universo pertinente; para diferencias on/off, exposición suficiente en ambos lados. |
| Saque/final específico | Hecho válido identificable, incluso único, presentado como suceso concreto y no como superioridad general. |

No ajustes esos umbrales para obligar al partido de referencia a tener una clave táctica. Los valores son SEM del panel editorial. Los datos crudos siguen visibles aunque no superen el mínimo de destaque.

La ausencia de una diferencia de seis puntos no impide explicar el marcador: el desglose aritmético completo siempre puede mostrarse con sus valores reales.

### 15.4 Margen y lenguaje

La diferencia por dos, tres, libres y créditos especiales explica aritméticamente el margen del tanteo de cancha. Las etiquetas tras pérdida, transición y segunda oportunidad pueden solaparse y no se suman como causas independientes.

Redacción deportiva, concreta y descriptiva: «tras el ajuste hubo un 8–2» frente a una afirmación causal no probada. No atribuyas intención, cansancio, presión, confianza o desobediencia sin un hecho y permiso que lo sostengan.

En una suspensión/ejecución inválida/resultado administrativo no se genera una crónica normal de victoria consumada. Identifica estado y muestra solo lo ocurrido válidamente.

### 15.5 Líderes y momentos

Muestra líderes por puntos, rebotes, asistencias, VAL y aportaciones registradas. Puede repetirse un nombre en varias categorías. Conserva empates; si el espacio obliga a ordenar, usa criterio declarado sin inventar un ganador integral.

No anuncies récords o mejores marcas sin historial comparable. No destaques a un veterano por experiencia si el registro no muestra una aportación concreta.

Momentos candidatos: ventaja inicial, máximo margen, parcial, remontada, empate tardío, cambio final, saque relevante, retirada o secuencia táctica. Conserva período/reloj/orden/marcador/participantes y enlace. Un partido resuelto pronto no requiere emoción inventada.

### 15.6 Crónica por período

Cada bloque usa solo sus hechos y el contexto disponible hasta su cierre. En el modo por cuartos no conoce el resultado futuro. Puede ampliarse después con el resumen global, sin cambiar sus cifras históricas.

## 16. Relato y explicación deportiva

Usa plantillas a partir de hechos: intención pertinente, respuesta, oportunidad y desenlace cuando ayuden. No narres todas las comprobaciones internas ni opciones no percibidas como si se hubieran ejecutado.

Relato, acta y resumen consultan la misma revisión vigente. Si un tiro cambia de valor o se anula, la vista actual no sigue diciendo lo contrario. El historial de revisiones puede conservar la versión anterior identificada.

Variantes de texto, si existen, son deterministas o usan un mecanismo de presentación independiente que no afecta al azar deportivo. No invoques un LLM, una API externa ni una infraestructura adicional.

En simulado total puede generarse relato al consultar, desde los hechos realmente conservados. Si falta detalle, usa una frase más general y honesta, no una jugada inventada.

Una racha de conversiones no certifica el estado interno M-TIR/T del rival. Un partido puede tener una buena secuencia sin revelar un valor oculto de momento.

## 17. Informes y navegación

### 17.1 Organización de interfaz

Reutiliza el diseño actual. Propuesta de grupos accesibles desde el resultado:

- Resumen.
- Acta y comparación.
- Evolución/desarrollo.
- Tiro y calidad.
- Ataque.
- Defensa.
- Rotaciones/quintetos.
- Diagnóstico separado.

Los informes propio/rival y ficha individual pueden reutilizar esos componentes con contexto/audiencia, en lugar de crear otros ocho dashboards.

Tablas anchas usan columnas esenciales y detalle desplegable. Filtros comunes, muestra visible, glosario y breadcrumb o retorno al origen. No construyas una única pared de columnas ni ocultes toda la profundidad detrás del diagnóstico.

### 17.2 Informe propio

Conecta plan conocido, ejecución y resultado. Ataque, libro, tiro, control, defensa, rebote/balance, dirección, rotación, disciplina y especiales. Distingue no tener oportunidad, no percibir/elegir una registrada y fallar una oportunidad ejecutada.

Estado propio se muestra con el permiso acordado. No modifiques Forma, atributos o entrenamientos desde la conclusión del informe.

### 17.3 Ficha individual

Accesible desde acta, líderes y tablas. Reúne actuación, rol/director, minutos/tramos, tiro/creación, pérdidas, defensa, aportaciones sin balón y contexto. No reduce la evaluación a puntos por minuto ni a una nota nueva.

### 17.4 Informe rival

Describe selección de tiro, acciones ejecutadas, respuestas, presión, saques, rotaciones y objetivos observables. No revela prioridad privada, sliders, órdenes pendientes, estados o capacidades ocultas.

Una ausencia de una jugada en este partido significa no observada en la muestra, no que el rival no la tenga en su libro.

### 17.5 Recomendaciones condicionadas

Incluye un pequeño repertorio declarativo, sustentado en consultas y alternativas ya existentes. Por ejemplo, considerar una variante conocida cuando el registro muestra repetidamente cerrada una salida y disponible otra; revisar balance si se observan continuaciones de transición rival tras fallos con carga.

Cada recomendación identifica observación, muestra, condición y coste/alternativa. No aplica automáticamente el cambio al siguiente partido ni promete que funcione. Si no hay evidencia, no se genera recomendación.

Precarga dos reglas SEM para evitar inventar un asesor completo:

- `REC10-01`, salida negada: al menos cuatro ejecuciones frente a una misma respuesta, con al menos dos negaciones de la salida prevista y dos oportunidades de alternativa efectivamente registradas y autorizadas para esa audiencia. Texto: considerar una variante ya disponible que utilice esa alternativa, indicando su concesión/riesgo conocido. Si la alternativa solo existe en diagnóstico, la recomendación ordinaria no puede utilizarla.
- `REC10-02`, revisar balance: al menos cinco fallos propios con encargo de carga identificado y al menos dos transiciones rivales enlazadas a esos fallos. Texto: revisar el equilibrio entre carga y balance, mostrando también rebotes ofensivos capturados en ese universo. Describe coexistencia, sin afirmar que cambiar el encargo eliminará las transiciones.

Los IDs pueden mapearse al catálogo físico existente. Umbrales y textos viven en datos administrables; no añadas otras estrategias para completar esta entrega.

No consultes capacidades ocultas ni resultados futuros para recomendar. No introduzcas una estrategia de entrenador nueva detrás del texto.

## 18. Visibilidad y permisos

Aplica la matriz funcional antes de construir consultas/candidatos/textos/export, no solo ocultando columnas al final.

| Audiencia | Información |
|---|---|
| Pública/rival | Hechos observables, acta, acciones, organizaciones ejecutadas y contexto público. |
| Propia | Plan/órdenes conocidos, energía propia numérica y estados cualitativos según el campo. |
| Diagnóstico | Estados exactos, cálculos, contribuciones, alternativas evaluadas y versiones, con acceso separado. |

Reglas críticas:

- Energía propia: barra y número 0–100 del estado, con redondeo documentado.
- Forma, M-TIR/M-OFE/M-DEF y T propios: categorías vigentes; no inferir tendencia sin historial.
- Rival: no leer su energía/momento ocultos para convertirlos en un adjetivo supuestamente público.
- Parámetros del libro rival y opciones no percibidas no se revelan por una tabla, tooltip, enlace de evidencia o CSV.
- Calidad/oposición públicas describen situación observable; no son un disfraz de la probabilidad exacta.
- La memoria diagnóstica no concede información nueva al entrenador automático.

Una caché de consulta o resumen incluye audiencia y equipo de perspectiva para que un resultado diagnóstico no termine reutilizado en la vista pública.

## 19. Tablas administrables y semillas

Mapea a las tablas canónicas existentes:

| Grupo | Responsabilidad |
|---|---|
| EST01 y EST02 | Reutilizar créditos, posesión/F/series y particiones; corregir defectos del apartado 4. |
| EST03 | Sectores, calidad, origen, preparación y ejecución. |
| EST04 | Presencia, completas/mixtas, grupos y on/off. |
| EST05 | Tareas sin balón, efectos y exposición. |
| EST06 | Final ajustado, muestras, líderes, consultas especiales. |
| EST07 | Permisos por campo, consulta, relato y export. |
| EST08 | Candidatos de resumen, deduplicación, informes y presentación. |

Amplía el panel y tabla maestra con definiciones, unidades, universos, origen, estado de cobertura, mínimos SEM y punto de consumo. No es necesario un nuevo esquema físico por cada ID.

Precargas adicionales:

- Final ajustado: 120 s y margen previo 5, Q4/prórroga.
- Antes/después: 3 ataques completos a cada lado, disponibles y excluidos visibles.
- Precaución ordinaria de muestra: tiros/ejecuciones con menos de 5 observaciones muestran aviso, sin ocultar sus conteos.
- Destaques del resumen: valores del apartado 15, diferenciados de avisos ordinarios.
- Ritmo: L del perfil, D realmente disputada; coeficiente 0,44 solo en estimaciones convencionales.

Son parámetros de análisis/presentación, no multiplicadores de deporte. Deben poder modificarse en candidata y activarse explícitamente; una consulta con otra política identifica su versión.

No declares que un mínimo de cinco convierte una conclusión en estadísticamente fiable. Es un umbral editorial SEM, no una prueba inferencial.

## 20. Registro, exportación y versiones

### 20.1 Hechos e instrumentación

Conserva vínculos compactos necesarios para cada indicador. Tareas y oportunidades se registran en el punto donde ya se resuelven, sin doble ejecución, sin pedir nuevas tiradas y sin almacenar todos los estados por milisegundo.

El contrato de cobertura indica desde qué versión puede responderse cada pregunta. No reconstruyas una negación, un cierre o una opción no elegida desde el resultado final si faltó su hecho.

### 20.2 Versiones y perfil

Crea base identificada con sufijo `+SEM-MOTOR10-20261016` conforme a la convención existente, explicando qué componentes de análisis cambian. Activación explícita, originales conservados.

La versión de política estadística/analítica puede cambiar aunque no cambie el desarrollo deportivo. Distingue versión del motor, semilla/perfil deportivo, política de créditos, política analítica y revisión del encuentro.

Verifica `export/8` y crea una versión nueva solo si cambia el contrato necesario. No rompas reproducibilidad únicamente para añadir una columna calculable. Si cambia por hechos o créditos imprescindibles, explica el motivo y trata formatos no compatibles con el mecanismo vigente, conservando el archivo original.

### 20.3 Export del encuentro y vistas

Mantén el export deportivo reproducible y añade una extracción analítica del partido o consulta:

- JSON con metadatos, cobertura, indicadores, numeradores/denominadores, filtros, unidades, versiones y referencias de evidencia.
- CSV descargable de la tabla actual, con filas colectivas/desconocidas/mixtas pertinentes y contexto suficiente.
- Resumen Markdown del encuentro con cifras y enlaces/IDs de evidencia disponibles.

El export público/propio aplica los permisos reales. El diagnóstico se descarga como tal, separado e identificado. No exportes un objeto interno completo por comodidad.

No construyas todavía el ZIP masivo CSV/JSON/JSONL de MOTOR-12. Diseña el contrato para reutilizar estas consultas en él.

### 20.4 Actualización y corrección

Una revisión invalida o actualiza todas las proyecciones/cachés afectadas: mapa, resumen, acta, claves, líderes, parciales y export de consulta. La navegación conserva la revisión actual o informa que se abrió una versión histórica.

Abrir un gráfico, cambiar filtro, generar resumen o descargar CSV no modifica la secuencia deportiva ni consume RNG. Compruébalo.

## 21. Verificación y recorrido manual

### 21.1 Pruebas automáticas mínimas

Ejecuta suite existente, `data:check` y control documental. Añade grupos pequeños que protejan errores reales, reutilizando fixtures y parametrización:

1. Fórmulas/unidades: eFG, estimaciones separadas, DRtg con ataques rivales, ritmo con prórroga, denominador cero y agregación ponderada.
2. Posesión/F/administrativos: una posesión con dos F; adicional frente a bonus; particiones de puntos sin duplicidad.
3. Atribución: último pase elegible frente a creación exterior propia, candidato invalidado y asistencia a serie elegible una sola vez. No fijar un porcentaje deseado.
4. Origen/ejecuciones: directo → poste conserva origen; decisión directa no se convierte en aclarado; puntos locales sin duplicar el total.
5. Presencia/on-off: cambio legal durante unidad con mezcla, puntos sin consumo de reloj y denominadores completos separados; grupo parcial que permanece.
6. Evolución/filtros: empates/cambio de líder, tiempo integrado, 120 s/5 puntos previos, orden aplicada frente a pendiente.
7. Sin balón/calidad/mapa: efecto previo real, acierto no reclasifica calidad ni utilidad, sector desconocido no inventa lateralidad.
8. Resumen: candidatos sustentados/deduplicados, menos de tres cuando corresponde, líderes por criterio y revisión que actualiza todas las vistas.
9. Permisos: ninguna fuga por texto, evidencia, filtros, caché o export; cambiar un estado rival oculto con hechos públicos fijos no cambia el informe público.
10. Lectores sin efectos: consultas y texto no modifican estado/RNG; modos y reproducción conservan el mismo deporte con las mismas entradas.

No crees un test por cada celda o plantilla, ni snapshots enormes de frases para comprobar puntuación literal. Protege datos y significado.

### 21.2 Encuentros completos

Ejecuta cinco encuentros completos con conciliación:

- Referencia `20261016`.
- Contraste de políticas.
- Copia con referencia cansada y relevos, identificada.
- Escenario de exposición repetida ya existente.
- Partido con órdenes humanas y export/reproducción, o el caso de contraste de modalidades más útil.

No tienen que producir naturalmente todas las situaciones excepcionales. Para prórroga, mixtas, correcciones, denominador cero o resumen parcial usa casos mínimos preparados. No busques cientos de semillas para conseguir el titular deseado.

Con puras lecturas, la referencia deportiva debe permanecer idéntica a la base comprobada. Si corriges créditos, distingue cambio de acta de cambio deportivo; una diferencia de marcador exige causa concreta en una corrección de juego, no se justifica por haber añadido gráficos.

Estos cinco encuentros son integración, no calibración ni auditoría normativa. No concluyas realismo por un marcador plausible.

### 21.3 Manual para Dennis

Crea `docs/prompts/MOTOR-10-recorrido-manual.md` con arranque/URL real, perfil, semillas, preparación, clics, resultado esperado y señal de fallo. Desde la UI y sin editar código:

1. Activar explícitamente base MOTOR-10 y ver estado/cobertura.
2. Simular encuentro completo y abrir resumen, tres claves o menos según evidencia.
3. Pulsar clave y llegar a tabla/eventos con el mismo filtro, muestra y cifras.
4. Acta, comparación, cuatro factores, unidades y glosario.
5. Evolución, parcial, cambio de líder y final ajustado.
6. Mapa por frecuencia/acierto; sector con detalle y desconocido; calidad frente a resultado.
7. Ataque por origen frente a ejecuciones, prioridad/director conocidos y decisión directa.
8. Defensa por organización/cobertura real y responsabilidades inicial/final/participación.
9. Saque directo frente a continuidad de toda la posesión.
10. Pantalla/cierre/ayuda con evidencia y una métrica no registrada identificada honestamente.
11. Quinteto, mixtas, grupo y on/off con exposición.
12. Ficha individual e informes propio/rival; comprobar diferencia de permisos.
13. Filtro combinado sin muestra/incompatible, sin cero engañoso.
14. Caso preparado de revisión: acta, mapa, resumen y export se actualizan juntos.
15. Descargar CSV, JSON analítico y Markdown; contraste con export reproducible.
16. Modo por cuartos y visionado: consulta parcial sin futuro; lectura no altera el partido.

Marca preparados los escenarios de laboratorio y conserva originales. No declares probado por Dennis lo que ejecutaste tú. Si recorres Chromium, informa pantallas/acciones realmente realizadas; arrancar sin errores no es un recorrido completo.

## 22. Documentación y entrega

### 22.1 Archivo del prompt y documentos

Archiva íntegro este prompt en `docs/prompts/MOTOR-10-analisis-estadisticas-y-resumen.md` o nombre equivalente del catálogo. Todos los prompts Claude Code se entregan y conservan en MD.

Crea `docs/tecnico/motor10.md` con:

- Base, versiones, alcance y mapa a código/datos/UI.
- Catálogo completo del funcional, con productor, consulta, permiso, cobertura y estado de cada bloque; no solo una lista de deseos.
- Contrato de universos, exclusiones, muestras y fórmulas.
- Asistencias/política corregida o confirmada y fuente utilizada, sin fingir lectura directa.
- Origen/ejecución, F/posesión, locales/continuidad y puntos administrativos.
- Presencia/completas/mixtas/on-off y ejemplos conciliados.
- Instrumentación sin balón y detalle realmente conservado.
- Candidatos/criterios SEM de resumen, redundancia, líderes y evidencia.
- Matriz de visibilidad por consultas, textos y exports.
- Contratos, cambios de formato y compatibilidad.
- Comprobaciones ejecutadas, resultados observados, límites y pendientes.

Actualiza índice, páginas temáticas, `estado.md`, `CHANGELOG.md`, glosario/diccionario y catálogo de prompts. Conserva el funcional íntegro de consulta; las precisiones que amplían o corrigen documentos anteriores se anotan con alcance y precedencia, no se borran retrospectivamente.

### 22.2 Pendientes separados

Mantén tres listas distintas:

1. **Deuda MOTOR-09:** normativa no contrastada/no ejecutada, inferioridad natural, combinadas/correcciones y otras limitaciones efectivas.
2. **MOTOR-10:** productor o consulta pendiente, con su impacto concreto. No declare completo un bloque solo porque existe una pestaña.
3. **Entregas posteriores:** población, lotes, historial inexistente y calibración conforme al roadmap.

No conviertas la deuda heredada en decisiones aceptadas por Dennis. Un dato ausente en un partido antiguo y un productor sin implementar en los nuevos son limitaciones diferentes.

### 22.3 Entrega final de Claude

PR revisable sin fusionar. Responde con:

- Qué puede probar Dennis: arranque, URL real, perfil, semilla y recorrido.
- Qué informes/catálogos quedaron ejecutables y qué preguntas contestan.
- Qué cambios de créditos o productores hubo y si alteran deporte, acta o solo lectura.
- Comprobaciones reales, cinco resultados y qué no se ejecutó.
- Cobertura y pendientes de MOTOR-09 preservados con honestidad.
- Limitaciones MOTOR-10, interfaces no recorridas y test manual pendiente.
- Rama/commit base y PR efectivos.

No informes cuota o duración de sesión si el entorno no las mide. No llames calibrado al perfil. No declares terminado el motor completo al cerrar esta entrega: siguen MOTOR-11, MOTOR-12 y el resto del roadmap.

## 23. Criterios de aceptación

- [ ] Base comprobada con MOTOR-09 en main y rama de trabajo aislada.
- [ ] Cobertura normativa/estadística heredada visible sin equivaler conciliación a validación FIBA.
- [ ] Asistencias acreditadas por criterio y causalidad, sin objetivo artificial de frecuencia.
- [ ] Catálogo compartido con definición, unidad, universo, fuente, muestra, permiso y evidencia.
- [ ] Fórmulas exactas/convencionales separadas; ceros y ausencias correctamente tratados.
- [ ] Evolución, parciales, tiempo y final ajustado 120 s/5 puntos previos.
- [ ] Mapa sectorial sin coordenadas ficticias y calidad previa al resultado.
- [ ] Origen único, ejecuciones encadenadas y decisiones directas reconocibles sin puntos duplicados.
- [ ] Análisis de defensa, presión y responsabilidades sobre intervenciones reales.
- [ ] Banda/fondo y secuencia directa separados de continuidad posterior.
- [ ] Trabajo sin balón basado en tareas/efectos registrados; dependencias ausentes identificadas.
- [ ] Presencia, completas, mixtas, grupos y on/off con numeradores compatibles.
- [ ] Filtros y comparaciones reproducibles, exclusiones visibles y muestras de ambos lados.
- [ ] Resumen con hasta tres claves sustentadas/deduplicadas, ampliación y líderes por criterio.
- [ ] Cada afirmación relevante abre su consulta o evidencia compatible.
- [ ] Relato y crónica parcial coherentes sin futuro, inventos ni efectos deportivos.
- [ ] Informes público/propio/rival/diagnóstico separados en consultas, textos, caché y export.
- [ ] Parámetros analíticos/editoriales administrables y versionados, sin multiplicadores de juego.
- [ ] CSV/JSON analítico/Markdown del encuentro, con metadatos y permisos; extracción masiva reservada a MOTOR-12.
- [ ] Correcciones actualizan vistas y evidencia de forma coherente.
- [ ] Consultar, narrar y exportar no altera estado deportivo ni RNG.
- [ ] Pruebas automáticas acotadas, cinco encuentros y recorrido manual preparados.
- [ ] Prompt archivado, documentación completa, pendientes separados y PR sin fusionar.
