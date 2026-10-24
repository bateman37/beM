# beM · SIM-MOTOR-04E

## Corrección de reloj y rebotes, referencia coherente y ajuste final acotado de SIM

**Destinatario:** Claude Code.  
**Repositorio autorizado:** exclusivamente `bateman37/beM`.  
**Fecha:** 24 de octubre de 2026, Europe/Madrid.  
**Modalidad:** una entrega completa, con implementación, ajuste limitado, validación y archivos para ChatGPT.  
**Aceptación manual y deportiva:** Dennis. La candidata se carga expresamente; no se activa sola.

Dennis autoriza ejecutar de principio a fin este encargo. Dispone de este único prompt con sus tokens restantes de la semana: organiza el trabajo para terminar una entrega concreta y auditable, evitando consultas intermedias sobre decisiones que ya quedan resueltas aquí.

**Excepción expresa a la congelación del detallado:** se autoriza corregir exclusivamente la frontera reloj/rebote/control descrita en este documento y los créditos estadísticos de rebote vinculados. Se autoriza actualizar sus pruebas, versión, lectores, conciliaciones y referencias afectadas. El resto de sus reglas, recetas, probabilidades, atributos, tácticas, estados, entrenador y arquitectura permanece congelado.

Se autoriza después ajustar SIM contra esa referencia corregida mediante los parámetros y el algoritmo limitado de este encargo. No hay que esperar otro prompt para pasar de la corrección a la comparación, al ajuste y a la entrega. Si una banda no se alcanza, completa los demás bloques, conserva la mejor evidencia y termina con el incumplimiento explícito.

No fusionar la PR, suscribirse, activar candidatas, calibrar con la reserva final o iniciar una auditoría indefinida. No añadir movimientos, atributos, otro motor, un nuevo sistema táctico o un framework de optimización.

## Índice

1. [Resultado y prioridades](#1-resultado-y-prioridades)
2. [Base, Git y documentación](#2-base-git-y-documentación)
3. [Hallazgos de entrada](#3-hallazgos-de-entrada)
4. [Fuentes y criterios cerrados](#4-fuentes-y-criterios-cerrados)
5. [E01 · Frontera de reloj y siguiente posesión](#5-e01--frontera-de-reloj-y-siguiente-posesión)
6. [E02 · Política común de crédito de rebote](#6-e02--política-común-de-crédito-de-rebote)
7. [E03 · Versiones y referencia nueva](#7-e03--versiones-y-referencia-nueva)
8. [E04 · Acta y objetivos](#8-e04--acta-y-objetivos)
9. [E05 · Parámetros autorizados](#9-e05--parámetros-autorizados)
10. [E06 · Ajuste automático acotado](#10-e06--ajuste-automático-acotado)
11. [E07 · Campaña, reserva y auditoría final](#11-e07--campaña-reserva-y-auditoría-final)
12. [E08 · Coste y contratos del laboratorio](#12-e08--coste-y-contratos-del-laboratorio)
13. [Pruebas justas y aceptación manual](#13-pruebas-justas-y-aceptación-manual)
14. [Paquetes completos para ChatGPT](#14-paquetes-completos-para-chatgpt)
15. [Cierre y respuesta final](#15-cierre-y-respuesta-final)

## 1. Resultado y prioridades

Al terminar deben existir:

1. Una corrección demostrada del caso de expiración tras fallo, con continuidad explícita y sin reutilizar una instrucción antigua de siguiente posesión.
2. Un criterio de rebote común y versionado en detallado y SIM, separando crédito individual, colectivo y ausencia legítima de crédito.
3. Una referencia detallada nueva, reproducible y sin reajustes de puntería para conservar un marcador anterior.
4. Una base SIM coherente con las correcciones y, si la búsqueda lo permite, una candidata numérica claramente mejor contra la referencia nueva.
5. Una comparación de **todas las estadísticas del acta**, porcentajes y zonas, con semillas finales nuevas y límites visibles.
6. Los ZIP verificables, con los datos necesarios para que ChatGPT haga el análisis deportivo profundo sin pedir otra campaña a Claude.

Orden obligatorio: reproducir → corregir y comprobar → congelar referencia → ajustar sobre desarrollo → congelar candidata → validar → empaquetar. Una comparación contra la referencia anterior no decide el ajuste posterior.

Conservar resolución por operaciones/posesiones en el detallado y por tramos agregados en SIM. La corrección del reloj no exige simular cada segundo ni desplazar jugadores.

Prioridad si aparece una limitación real de sesión: correcciones y referencia verificadas, candidata y validación limitada, paquetes. El ensayo de coste y la ornamentación documental son posteriores. No consumir la sesión persiguiendo cinco segundos o escribiendo una interpretación extensa de cada gráfico.

## 2. Base, Git y documentación

### 2.1. Verificar antes de tocar

Lee las normas e índices del repositorio, `docs/estado.md`, la nota técnica SIM-04D, su evidencia pequeña y el funcional temático de reloj, rebote y acta. Evita releer el funcional completo cuando el índice permite llegar al apartado concreto.

Último estado comunicado, que debes verificar:

- PR #23, rama `claude/busy-edison-b1fmnc`, abierta y sin fusionar.
- Base de 04D: `0dad8938a64b765bdd9602bb247d86db106235d9`, tras fusionarse #22.
- Congelación deportiva DEV: `74f3fdbff4c7d2c44e42a93dc0874ce98a54c2ff`.
- Congelación VAL: `e027b0efb0a08dc73e70cf5b1fbb8f7ab5091d31`.
- HEAD final comunicado: `a4f59fb`.

Si #23 sigue abierta, continúa la serie y actualiza título/descripción. Si ya se fusionó, crea rama desde `main` actualizado y una PR nueva. Protege trabajo ajeno; usa un checkout aislado cuando haga falta. No borres ni fuerces una rama con cambios no reconocidos.

No consultar `v-apps`, Basket Manager, BeManager u otros repositorios. Las referencias necesarias de esta entrega están en beM, en los datos anteriores y en las fuentes oficiales enlazadas aquí.

### 2.2. Documentación e identidades

- Archivar este prompt íntegro en `docs/prompts/` y su catálogo.
- Crear `docs/tecnico/sim-motor04e.md` y `docs/prompts/SIM-MOTOR-04E-recorrido-manual.md`.
- Actualizar estado, changelog y páginas temáticas afectadas. Este encargo prevalece sobre la congelación absoluta anterior únicamente en la excepción declarada.
- Versión visible de aplicación: **SIM-MOTOR-04E**. Mostrar por separado aplicación, detallado, SIM, perfil, dataset y formatos.
- Incrementar de forma coherente la revisión del detallado y la política de acta. No etiquetar una referencia nueva como el mismo motor histórico.
- Conservar perfiles/candidatas anteriores consultables y su procedencia. Crear las nuevas como copias explícitas.

## 3. Hallazgos de entrada

### 3.1. Expiración y continuidad

En `DET__detailed__VAL-EQ01-EQ04-R1.json.gz`, periodo 1:

| Hecho anterior | Observación |
|---|---|
| E0070 | EQ04 falla inside; quedan 308,0 s de periodo y 0,1 s de posesión |
| E0071 | Consume 0,1 s; quedan 307,9 s de periodo; declara `effects.fin='periodo'`, sin pérdida |
| E0072 | EQ04 abre P020 mediante saque con 24 s nuevos |

La revisión independiente de los 96 DET de VAL04D encontró 293 expiraciones inmediatamente después de un FGA fallado válido, con reloj de periodo positivo y posesión a cero. En 280 no hay pérdida en el hecho y el siguiente ataque es del mismo equipo. Los 13 restantes se mantuvieron separados.

Ruta identificada: `src/match/actions.js::afterMiss` utiliza un límite común, devuelve `{end:'periodEnd'}` cuando no cabe el rebote y no establece una transición nueva. `settlePossession` cierra la posesión; el siguiente arranque puede usar el `nextPoss` que seguía almacenado.

Reproduce el patrón en la base y conserva una evidencia pequeña. Si no están los ZIP, crea un caso dirigido con los mismos relojes y salida de fallo; no reconstruyas toda 04D. No convertir el recuento 280 en un objetivo de corrección por cuota.

### 3.2. Reinicio de reloj relacionado

En el código revisado, `shotClockAfterRingContact` es un alias de la función para parada defensiva, que devuelve el máximo entre reloj restante y 14 s. Se debe separar su semántica. El campo existente `shots.{zone}.ordinaryMissContactsRing` figura sin consumidor en el catálogo: úsalo como contexto explícito cuando corresponda, sin crear un sorteo de contacto.

### 3.3. Rebotes y búsqueda anterior

- El detallado trata el tapón vivo como recuperación de control sin acreditar rebote; SIM lo acredita. Falta una política común de crédito, no una razón para recortar rebotes legítimos de SIM.
- Entre créditos de VAL04D, ORB representa aproximadamente 27,6 % en DET y 28,4 % en SIM. No empezar ajustando fuerza de rebote para arreglar el volumen absoluto.
- Z8-A2 mejora en DEV conocido puntos, asistencias, pérdidas, robos, tapones y 2P%, pero retira demasiado tiro de inside y falla varias guardas. No es una candidata aceptada.
- Las 32 combinaciones Z1–Z8 de 04D fallaron la guarda de cuota inside. Esta entrega sustituye aquella parrilla rígida por una búsqueda con palancas separadas y pasos pequeños.

## 4. Fuentes y criterios cerrados

### 4.1. Fuentes oficiales consultadas por ChatGPT

| Fuente | Apartados pertinentes | URL directa |
|---|---|---|
| Official Basketball Rules 2026, v1.1 | 29.1, 29.2.2, 29.2.7 y 51 | [PDF oficial](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf) |
| Official Basketball Rules Interpretations 2026, v1.0 | Casos relacionados con el reloj, si se necesita contraste puntual | [PDF oficial](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-interpretations-v1-0.pdf) |
| FIBA Statisticians’ Manual 2024, v2.0 | Capítulos 4, 5 y 8; PDF pp. 13–14, 17 y 27 | [PDF oficial](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf) |

ChatGPT ha podido leer los textos oficiales. Si tu entorno recibe 403, **continúa con los criterios cerrados siguientes** y declara que los implementas desde esta especificación contrastada por ChatGPT. No afirmar lectura directa propia, detener la entrega por ese 403 o iniciar una investigación normativa integral. Guarda URL, edición, artículos y alcance en la matriz documental vigente; no añadas copias extensas de los PDF al repositorio.

### 4.2. Criterio reglamentario necesario

Un lanzamiento liberado a tiempo que alcanza el aro permite continuar. Tras contacto con aro y nuevo control: 14 s para el mismo ataque y 24 s para el rival. Una parada defensiva en pista delantera conserva el reloj si ya tiene 14 s o más. Sin aro, la violación aplicable se diferencia del control defensivo inmediato y claro. Referencias: artículos 29 y 51 del reglamento oficial enlazado.

### 4.3. Criterio estadístico necesario

La recuperación controlada tras tapón acredita rebote; un derecho de saque antes de control individual puede generar crédito colectivo. No se acredita rebote con balón muerto, al acabar el periodo antes del control o ante la violación correspondiente antes de recuperar. Las violaciones de reloj son pérdidas de equipo. Referencias: capítulos 4, 5 y 8 del manual enlazado.

Son decisiones cerradas para este encargo. No reclasificar una recuperación de tiro bloqueado como robo de un pase ni sumar un segundo rebote al que ya existe.

## 5. E01 · Frontera de reloj y siguiente posesión

### 5.1. Solución funcional

Corrige el camino real de resolución, sin parchear solo el texto del evento:

1. El contexto de un fallo conserva si hubo contacto con aro, si el balón sigue vivo y qué reloj puede impedir completar la operación. Un estado no registrado se distingue de `false`.
2. La operación de rebote después de contacto con aro no debe quedar impedida por reutilizar el límite de posesión anterior al lanzamiento. El tiempo del periodo continúa siendo un límite real.
3. La rama sin contacto conserva el contexto necesario para la decisión aplicable; no regalar un reinicio por llamar a un helper genérico.
4. Un final real de periodo cierra esa frontera y se reanuda después según el flujo existente de periodos. No crea un captor.
5. Una violación real registra su causa y establece explícitamente la reanudación rival; no reutiliza un `nextPoss` previo.
6. Una recuperación viva continúa con el titular del control que ya se ha resuelto. La carga/tiempo de una operación no se aplica dos veces al reparar el límite.

Puedes pasar un contexto pequeño a `planDuration`/resolución o usar un helper puro equivalente. No hace falta un segundo reloj continuo, una submáquina compleja de vuelo ni simular desplazamientos. Una comprobación de frontera puede ser indivisible como las operaciones actuales.

### 5.2. Separar helpers

Desacopla el helper de rebote/contacto del helper de parada defensiva. Conservar nombres/rutas públicas cuando sea razonable, pero no mantener el alias que mezcla sus significados. Usar los segundos reglamentarios que ya están en tablas; no constantes deportivas nuevas escondidas.

Incluye un caso de retorno ofensivo con reloj previo superior a 14, además del caso a 0,1: la reparación no se limita a evitar el cero. Conserva la política existente del dispositivo apagado cuando proceda; no conviertas una corrección localizada en otra revisión completa de todas las ventanas.

El campo `ordinaryMissContactsRing` puede dar el contexto de los fallos ordinarios ya representados. Los tapones no deben heredar ese valor por la zona del tirador. Usa su desenlace explícito. No inventar una probabilidad de airball para completar un caso que solo existe como prueba reglamentaria.

### 5.3. Integridad de siguiente posesión

Una instrucción de siguiente posesión se consume una vez. Al cerrar una posesión con tiempo restante debe existir una transición válida, un derecho administrativo pendiente o una continuidad justificada; nunca un fallback silencioso al equipo anterior.

Una defensa técnica contra estado antiguo debe distinguir derechos legítimos —rebote ofensivo, saque del mismo ataque o sanción— de la reutilización accidental. No introducir la regla falsa de que el mismo equipo nunca puede mantener el balón.

### 5.4. Invariantes nuevos, pocos y deportivos

- `endKind=periodEnd` y `effects.fin=periodo` solo representan un periodo realmente concluido, con el tratamiento existente del tiro pendiente válido.
- Una violación de posesión no puede abrir después el ataque del mismo equipo sin un derecho posterior explícito.
- Un fallo no produce dos disputas, dos cargas de energía o dos créditos por reparar el camino.
- La frontera de control conserva actor, origen y relojes suficientes para reconstruir la reanudación.

Usar los hechos problemáticos anteriores como regresión y comprobar que los nuevos registros no contienen ese patrón espurio. No invalidar toda coincidencia de equipo entre ataques sin inspeccionar la causa.

## 6. E02 · Política común de crédito de rebote

### 6.1. Una definición, dos resolutores

Reutiliza o crea una **función pequeña y pura de clasificación estadística**, compartida o con una tabla común, para traducir los hechos ya resueltos en: rebote individual, rebote colectivo o sin crédito, con causa. No construir otro resolutor.

Datos mínimos del descriptor: tiro/último libre causal; equipo que lanzó; balón vivo/muerto; recuperación o derecho resultante; captor cuando existe; naturaleza de la excepción; enlace de origen. La función no decide quién gana el balón y no consume azar.

En el detallado, conserva el recuperador que `pickRecoverer` ya ha elegido en el camino del tapón y su enlace causal. No sortear otra persona para la estadística. En SIM, no duplicar el crédito que `_rebound` ya produce tras tapón vivo.

El tapón fuera y las otras ramas ya representadas con derecho colectivo deben tener un sujeto de equipo, sin jugador inventado. Añadir ese crédito no genera otra continuación, otro control SIM o un reinicio ofensivo adicional: la continuidad deportiva ya existe.

No crear incidencias nuevas —faltas de rebote, balones encajados o violaciones— solo para dar cobertura a la tabla. Clasifica únicamente situaciones que el motor ya resuelve y casos dirigidos del alcance actual.

### 6.2. Consumidores que deben conciliar

- Acta de jugador y equipo, sujetos colectivos, ORB/DREB/REB y valoración.
- Conciliación de oportunidades y créditos, incluyendo causas legítimas sin crédito.
- Análisis por zonas/familias/quintetos y exportación, con universos de posesión correctamente nombrados.
- Exposición de aprendizaje: un crédito colectivo no da práctica individual a un jugador ficticio, y observar un rebote no duplica la exposición ya acumulada.
- Historia anual y reintentos: un crédito causal se incorpora una vez por partido lógico.

Conservar el arreglo de atribución `putback`/POS de 04D. Una recuperación estadística de equipo no se transforma en una ficha POS ni en otro ataque.

Publicar por separado la suma de créditos individuales y los colectivos, y conciliar el total de cada equipo con ambos. La comparación ORB/DREB/REB debe utilizar exactamente el mismo universo en los dos motores; conservar también el desglose individual para los lectores que lo requieran. Un tapón no equivale siempre a recuperación y un intento de rebote no equivale a un crédito: solo la salida realmente resuelta alimenta el acta.

### 6.3. Separar crédito y deporte

Implementa y comprueba, idealmente en un primer commit, la parte puramente observacional antes de reparar la continuidad del reloj. En los casos cuyo control ya estaba resuelto, deben conservarse marcador, sorteos deportivos en orden, decisiones, participantes de control, tiempos, rotaciones, energía y estados.

El archivo, el acta y una huella que incluya créditos pueden cambiar legítimamente. No prometer igualdad de hashes que incluyen el dato corregido. Reusar las proyecciones existentes o una comparación explícita de dinámica, excluyendo **solo** los campos observacionales añadidos y enumerándolos. No quitar todas las estadísticas o eventos hasta conseguir una igualdad aparente.

Después de corregir reloj/control puede cambiar la dinámica. Su efecto se presenta en otro bloque, sin mezclarlo con una supuesta optimización exacta.

### 6.4. Pequeños remates heredados

- El auxiliar de AST debe seguir leyendo crédito acreditado, distinto de mero pasador.
- Las unidades MiB/GiB y la población de doce equipos deben ser correctas.
- Alinear inventarios de comparabilidad entre métrica y guardas. Si el rebote ya tiene política común y datos suficientes, vuelve a ser comparable en ambos.
- Incluir en el paquete el fixture real `tests/fixtures/sim-snapshot-04c.json` y dependencias si se promete reproducir la prueba que lo necesita. No fabricar un fixture para pasarla ni cambiarla para aceptar cualquier archivo.

## 7. E03 · Versiones y referencia nueva

### 7.1. Identidades de comparación

| Nombre de trabajo | Significado |
|---|---|
| `DET_04D_HIST` | Detallado anterior y sus resultados auténticos; referencia histórica |
| `DET_04E_REF` | Detallado con las correcciones autorizadas, congelado antes del ajuste SIM |
| `SIM_04D_HIST` | SIM y vector de 04C/04D antes del criterio estadístico nuevo |
| `SIM_04E_BASE` | SIM corregido, con los coeficientes de partida anteriores |
| `SIM_04E_CAND` | Mismos mecanismos corregidos y vector seleccionado solo con desarrollo |

Las identidades deportivas, de acta y de salida se registran aparte de estos alias. No duplicar un alias como otra observación independiente.

### 7.2. Congelación de referencia

1. Conserva la referencia histórica `20261016`, 83–98 y 6.684 sorteos, mediante sus datos y commit auténticos. No mantener dos motores históricos instalados en el producto.
2. Ejecuta el caso de referencia corregido y registra su resultado nuevo, sorteos, huellas y explicación causal. **No recalibrar para volver a 83–98.**
3. Inventaría el diff del detallado y enlaza cada cambio con reloj, crédito, consumidor o prueba necesaria. Una modificación ajena al alcance debe retirarse o quedar como bloqueo separado.
4. Congela código, perfiles y política estadística de `DET_04E_REF` antes de calcular objetivos de ajuste.
5. Genera una sola vez las anclas corregidas del desarrollo. Se reutilizan para todos los vectores SIM.

No volver a usar como objetivo los promedios antiguos de pérdidas/rebotes una vez cambiada su producción. Mostrar un puente antes/después de las correcciones con las mismas entradas.

### 7.3. Compatibilidad

- Nueva revisión de la política de acta en ambos modelos y consumidores.
- Resultados viejos se identifican como históricos; no recalcularlos silenciosamente con política nueva. Mantener lectura cuando la aplicación la soporte o explicar la incompatibilidad.
- Guardados incompatibles se rechazan con motivo y sin tocar el archivo. El guardado nuevo conserva el contexto de reloj/control necesario y se reproduce exactamente.
- No trasladar una propuesta de aprendizaje de una copia, equipo o versión incompatible a otra; conservar igualdad exacta e idempotencia existentes.
- El cambio numérico de candidata solo se aplica tras la acción explícita del usuario.

## 8. E04 · Acta y objetivos

### 8.1. Bandas vigentes

- Conteos de acta: diferencia objetivo **±5 % relativo** en las medias por actuación de equipo normalizadas a 40 minutos.
- Porcentajes de acierto: diferencia objetivo **±3 puntos porcentuales** desde aciertos e intentos acumulados.
- Cuota de intentos de cada zona: guarda funcional de **±3 pp**, separada del porcentaje de acierto.

Conservar también las medias reales, muestra sin prórroga, sumas y denominadores. No promediar porcentajes redondeados ni equiparar controles SIM, posesiones beM y finalizaciones.

### 8.2. Cuadro de 31 métricas

**20 conteos:** puntos, FGM, FGA, 2PM, 2PA, 3PM, 3PA, FTM, FTA, ORB, DREB, REB, AST a canasta, AST a libres, AST total beM, pérdidas totales, robos, tapones, faltas cometidas y recibidas.

**7 tasas de acierto:** campo, dos, tres, libres, aro, inside sin aro y media distancia. Triple es a la vez zona y tasa, sin duplicarlo como otra observación.

**4 cuotas:** aro, inside, media y triple.

Mantener AST a libres como categoría de beM y separarla de la asistencia de campo. No renombrar su suma como una estadística FIBA convencional.

Informar además ORB/(ORB+DREB rival), AST_FG/FGM, pérdidas individuales/colectivas, tapones recibidos, expulsiones por cinco faltas, jugadores usados, minutos, concentración de tiros/puntos, calidad, familias, uso táctico y distribución de anotación.

No exigir una desviación de cinco por ciento a cada marcador, cada jugador con dos intentos o un mínimo aislado. Sí mostrar diferencias por equipo y tipo de jugador, para no ajustar solo la media global.

### 8.3. Fórmulas e incertidumbre

`e_count = abs(mean_SIM40 / mean_DET40 − 1)`; `e_rate` y `e_share` son diferencias absolutas de proporciones.

`r_i = e_i / banda_i`; `M = max(r_i)` sobre las 31 métricas comparables. M > 1 significa al menos una banda incumplida. Publicar todos sus componentes.

Denominador ausente: `null` con causa. Dos ceros: igualdad de ceros, sin fingir un cociente definido. DET cero y SIM distinto: diferencia absoluta y no evaluado relativo. Nunca aprobar por omitir el campo.

Tras unificar criterio no excluir rebotes porque cuesten de ajustar. Si persiste una no comparabilidad real, nombrarla en estado y en el inventario; un M parcial no acredita el acta completa y la misma exclusión debe aplicarse a las guardas.

Remuestreo final: 2.000 repeticiones deterministas de partidos completos, ambos equipos juntos y manteniendo el emparejamiento por entrada. Informar intervalo de la diferencia, no solo intervalos separados de cada media. Es descriptivo; no cambiar el cumplimiento de la banda porque un intervalo sea ancho.

## 9. E05 · Parámetros autorizados

### 9.1. Punto de partida

`SIM_04E_BASE` parte del vector 04C/04D: ritmo 19,5; peso triple 0,70; entrega final 0,90; energía 3; ventaja recibida 0; peso aro 1,5; calidad aro 0,5; reinicio 0,35; calidad inside 0,5; conversión inside 0,30; las seis filas de 04D en su neutral.

Construye las copias mediante las funciones de perfiles/candidatas existentes. Una transformación estadística no autoriza cambiar estos coeficientes antes de registrar el control.

### 9.2. Catorce coordenadas independientes

No añadir filas numéricas nuevas. Se autoriza ajustar las siguientes filas existentes o sus valores efectivos **solo en SIM**. Los dominios son límites de esta campaña, no nuevos objetivos empíricos.

| Coordenada | Fila o transformación | Dominio de búsqueda | Paso inicial |
|---|---|---:|---:|
| V | `volume.neutralSecondsPerControl` | 18–22 | 0,50 |
| R | `shotMix.rimWeightFactor` | 0,75–2,50 | 0,25 |
| M | `shotMix.midrangeWeightFactor` | 0,30–1,20 | 0,15 |
| T | `shotMix.threeWeightFactor` | 0,35–0,95 | 0,10 |
| O | `rebound.organizedResetP0` | 0,25–0,95 | 0,15 |
| A | `assist.receivedAdvantageP0` | 0–1 | 0,25 |
| S | `assist.spontaneousPassOddsFactor` | 1–2 | 0,25 |
| L | `outcomes.simOrdinaryTurnoverWeightFactor` | 0,60–1,20 | 0,10 |
| E | `outcomes.simStealGivenEligibleTurnoverLogit` | 0–1 | 0,20 |
| F | `outcomes.simShootingFoulWeightFactor` | 0,80–1,30 | 0,10 |
| C | `conversion.simRimLogitOffset` | 0–0,25 | 0,05 |
| P3 | `shots.three.p0` en la copia SIM | valor base ±0,02 | 0,01 |
| P2 | `shots.midrange.p0` en la copia SIM | valor base ±0,02 | 0,01 |
| B | Escala común de los cuatro `shots.<zona>.blockP0` | factor 0,75–1,25 | 0,10 |

Para P3/P2, «base» es el valor efectivo de `SIM_04E_BASE`; intersectar con (0,1). B es una coordenada del **constructor de candidata**, no otro multiplicador en el resolutor: materializar sus cuatro filas desde los valores de esa misma base, nunca acumulando escalados. Conservar la forma relativa por zona y excluir libres. Si el validador anterior restringe una fila dentro del dominio autorizado, actualizar ese límite de manera explícita.

Abrir P3, P2 y B no significa que deban cambiar. El desempate favorece menos modificaciones; una candidata puede conservarlos. Son traducciones agregadas provisionales de SIM, no cambios de habilidad o de puntería del detallado.

### 9.3. Fijas y restricciones causales

Mantener entrega final 0,90, energía 3, calidad aro 0,5, calidad inside 0,5, conversión inside 0,30, FT% base, recetas, pendientes, valoración de capacidades y oposición. No ajustar fuerza de rebote, momentos, forma, experiencia, aprendizaje o entrenador para cuadrar medias.

Una fila actúa una vez en su consumidor; la estimación previa de la acción debe ver el mismo ajuste de conversión que la resolución. No aumentar probabilidades dos veces al copiar candidatas.

La entrega sigue siendo previa al acierto, con pasador real y distinto del receptor, elegibilidad acreditada y sin pase heredado en una continuación nueva. No inflar AST después de conocer FGM.

El robo sigue condicionado a una pérdida elegible y a su autor real; no convertir violaciones o faltas ofensivas en robos. Reducir pérdida ordinaria no elimina todas las pérdidas ni la reacción al estilo defensivo.

Los pesos de zona reequilibran celdas existentes dentro del contexto, sin generar salidas imposibles, cuotas por plantilla o tiros finales añadidos. El ritmo modifica tiempo esperado dentro del mecanismo actual, sin alterar la duración reglamentaria.

## 10. E06 · Ajuste automático acotado

### 10.1. Evitar el bloqueo de la parrilla anterior

La regla no es «probar otra vez las 36 combinaciones». Implementa un script pequeño de búsqueda determinista con las funciones existentes; no necesitas una biblioteca de optimización, IA, entrenamiento de modelo ni un panel nuevo.

Antes de ejecutarlo guarda parámetros, dominios, pasos, agenda, función objetivo, operadores, desempates y presupuesto con hash. El algoritmo puede elegir sus puntos siguientes según el desarrollo ya ejecutado: **la regla adaptativa está autorizada aquí**, no es un permiso para improvisar otra campaña.

Para explorar utiliza:

`L_search = mean(max(r_i−1,0)^2) + 0,05 × mean(r_i^2)`.

Sus componentes usan las 31 métricas evaluables del desarrollo. Es una función auxiliar para progresar; no modifica bandas, no sustituye el máximo M y no concede aceptación. Conservar además M, número de bandas incumplidas y los errores completos.

No aplicar las guardas de no empeoramiento como una pared a cada vecino intermedio: eso impediría estudiar combinaciones que se compensan. Durante la exploración se exigen invariantes, parámetros válidos y ejecuciones completas; las guardas deciden qué candidato final puede recomendarse.

### 10.2. Dos conjuntos conocidos de desarrollo

- **DEV-A:** las 48 entradas de desarrollo de 04D, procedentes de VAL04C. Conserva sus entradas materializadas y semillas.
- **DEV-B:** 24 entradas de VAL04D: parejas `(01,04),(07,10),(02,05),(08,11),(03,06),(09,12)`, ambas orientaciones, réplicas 1 y 2. Cubren los doce equipos.

Son 72 entradas conocidas. No llamarlas reserva independiente. Ejecutar sus 72 `DET_04E_REF` una vez y reutilizar las anclas. El selector explora DEV-A y solo consulta DEV-B después de sellar la lista corta.

### 10.3. Cuatro inicios completos

1. S0: `SIM_04E_BASE`.
2. S1: el vector completo Z8-A2 de 04D, como hipótesis anterior, sin aceptación previa. Sus filas fijas siguen siendo las del apartado 9.
3. S2: S0 con reequilibrio de zonas definido abajo.
4. S3: S1 con el mismo reequilibrio.

Reequilibrio: desde cuotas observadas `s_z` del vector y cuotas `d_z` de la referencia corregida del mismo conjunto, calcular `u_z=sqrt(d_z/s_z)`. Tomar inside como referencia y multiplicar los pesos de aro/media/triple por `u_z/u_inside`, limitados a sus dominios. No existe una cuota rígida en el motor: se cambian parámetros y se vuelve a simular. Si alguna cuota necesaria es nula, omitir ese inicio derivado con causa; no introducir un epsilon deportivo oculto.

Calcular S2/S3 desde los resultados de S0/S1 en DEV-A, sin leer DEV-B o VAL. Evaluar hasta 4 perfiles distintos en DEV-A. Deduplicar por sus filas efectivas, no por su nombre.

### 10.4. Descenso por coordenadas y refinamiento, hasta 92 perfiles iniciales

Orden de coordenadas: V,R,M,T,O,A,S,L,E,F,C,P3,P2,B. Para cada punto, limitar al dominio; si el resultado coincide con otro vector ya calculado, reutilizar su evidencia. Orden estable: coordenada de tabla y signo negativo antes de positivo.

1. Elegir dos centros distintos entre los inicios: menor L_search y menor M; si coinciden, el siguiente por L_search. Desempates: menos bandas incumplidas, menos filas alteradas, ID estable.
2. Desde cada inicio elegido, hacer **una pasada secuencial por las catorce coordenadas**. En cada coordenada evaluar sus dos vecinos ±paso desde el mismo centro actual; después, si uno mejora L_search, adoptarlo como centro para la coordenada siguiente. Si ninguno mejora, conservar el centro. Así se pueden acumular ajustes compatibles en vez de comparar únicamente modificaciones aisladas del mismo vector. Máximo 56 perfiles nuevos entre las dos pasadas; registrar el padre y cada aceptación.
3. Desde el mejor resultado disponible por L_search, probar hasta cuatro movimientos conjuntos: reequilibrio de zonas; V+paso y L−paso; L−paso y E+paso; F+paso y L−paso. Los cuatro nacen del mismo punto sellado. Son operadores de búsqueda declarados, no decisiones deportivas adicionales.
4. Elegir el mejor centro por L_search entre todos los evaluados y hacer otra pasada secuencial por las catorce coordenadas con medio paso inicial, adoptando mejoras como en el punto 2: hasta 28 vecinos nuevos.

Una mejora requiere diferencia de L_search superior a 1e−9; los empates conservan el centro. La lista inicial de centros y el orden de coordenadas quedan fijados antes de cada pasada. No convertir estas pasadas en ciclos hasta convergencia ni reiniciarlas porque el resultado no guste.

Máximo de esta fase:4 + 56 + 4 + 28 = 92 perfiles distintos, todos completos sobre DEV-A; **4.416 SIM** como máximo. No duplicar neutros en los límites. No emitir un párrafo por perfil en la consola: progreso breve y datos a archivos.

Mantener cada resultado y su vector exacto, incluidos los descartados. Una evaluación fallida no desaparece del índice ni equivale a derrota.

### 10.5. Lista corta y cuatro reparaciones autorizadas

Sellar una lista de hasta 4 alternativas distintas más S0 antes de leer DEV-B. Incluir primero menor M, menor L_search, menor número de bandas incumplidas y mejor alternativa que cumpla guardas en DEV-A, deduplicadas; completar plazas por menor L_search. Si un criterio no tiene alternativa, declararlo y seguir con las otras.

Ejecutar DEV-B para esos hasta 5 perfiles: máximo 120 SIM. Recalcular objetivos sobre los 72 partidos de desarrollo conjuntos, con el mismo peso por actuación.

Para aprovechar esta única entrega, quedan autorizadas hasta cuatro reparaciones adicionales, **sin consultar VAL**. Comenzar desde el mejor perfil de la lista por M conjunto y aplicar los operadores siguientes una vez, en orden R1→R4:

| Reparación | Construcción determinista desde desarrollo conjunto |
|---|---|
| R1 zonas | Mismo reequilibrio relativo amortiguado del apartado 10.3 |
| R2 volumen | V × `clip(FGA_SIM40/FGA_DET40;0,95;1,05)` |
| R3 terminales | L × `clip(TOV_DET40/TOV_SIM40;0,90;1,10)`; F × `clip(FTA_DET40/FTA_SIM40;0,90;1,10)`; E más `clip(log(STL_DET40/STL_SIM40);−0,10;0,10)` |
| R4 circulación | S × `clip(AST_FG_DET40/AST_FG_SIM40;0,90;1,10)`; A más 0,05 si faltan AST, menos 0,05 si sobran, sin cambio si son iguales |

Limitar siempre a los dominios. Si un denominador/cociente necesario no está definido, omitir la coordenada afectada con causa. Son propuestas de búsqueda, no inversiones exactas de las fórmulas. Nada modifica resultados ya generados.

Evaluar cada reparación distinta en los 72 casos: máximo 288 SIM. Si mejora L_search más de 1e−9, pasa a ser el centro de la reparación siguiente; si no mejora, se conserva el centro anterior. Los cocientes de cada operador se calculan desde ese centro y se registran. Conservar también las propuestas rechazadas: pueden ser mejores por M y entrar en la selección final si cumplen guardas. Es una sola pasada de cuatro operadores, sin volver al principio ni añadir rondas.

Presupuesto total: hasta 96 perfiles distintos y **4.824 SIM de ajuste**; los valores reales serán menores con deduplicación. No gastar plazas en ruido de nombres o en repetir la misma copia.

### 10.6. Criterio final y guardas

Solo perfiles con desarrollo conjunto completo pueden ser candidatos finales. Comparar todos con S0 sobre las mismas 72 entradas.

Guardas de no empeoramiento, usando el error de S0 `e0`:

- Conteos: `e ≤ max(0,05;e0+0,02)`.
- Acierto: `e ≤ max(0,03;e0+0,005)`.
- Cuotas: `e ≤ max(0,03;e0+0,01)`.
- Diferencia de calidad forzada de aro/inside: no empeorar más de 0,02 respecto a S0; informar aunque cumpla.
- Invariantes y causalidad: sin tolerancia.

Elegir menor M entre los admisibles. En empate 1e−9: menor L_search, menos filas modificadas y menor distancia normalizada a S0 por los dominios del apartado 9, después ID. Exigir mejora relativa de M ≥ 5 % respecto a S0 para recomendar sustitución. Si S0 ya tiene M ≤ 1, exigir que la alternativa también lo conserve.

Si ninguna alternativa es admisible, se conserva S0 como candidata recomendada de producto, pero se entrega separadamente la mejor experimental con sus guardas incumplidas. Nunca activar esa experimental o presentarla como aceptada. Se completa igualmente la validación de la recomendada y, dentro del cupo del apartado 11, de una experimental.

Quedan así entregables útiles aunque no se cierre una banda: base corregida, mejor recomendada, mejor experimental y toda la evidencia. No detenerse para solicitar otra autorización de búsqueda ni ampliar el presupuesto.

## 11. E07 · Campaña, reserva y auditoría final

### 11.1. Agenda e identidades congeladas

Conservar entradas completas, planes efectivos, semilla, hash de entrada con/sin semilla, perfil, política, motor, vector, intento y estado. Identidad global incluye campaña/condición/caso/intento/equipo. La identidad lógica de aprendizaje no incluye el intento técnico.

Las semillas de los vectores de un caso son iguales; los resolutores no comparten necesariamente el orden de sorteos. Si una infraestructura mueve asignaciones a workers, su resultado no cambia por worker u orden de agenda.

Construye los casos a partir de los generadores/entradas auténticas de beM. Si faltan los antiguos `out/`, reconstituye entradas con el generador congelado y declara qué evidencia previa no está disponible. Nunca inventar un ZIP histórico o reutilizar un marcador sin su entrada compatible.

### 11.2. Fases y cantidades máximas

| Bloque | Alcance |
|---|---|
| Reproducción y puente de corrección | 8 entradas dirigidas o de DEV-A, anterior/crédito corregido/reloj corregido; reutilizar los auténticos anteriores cuando existan |
| Anclas corregidas de desarrollo | 72 DET, una ejecución por entrada |
| Ajuste SIM | Hasta 4.824 SIM, según apartado 10 |
| VAL04E nueva | 96 DET y hasta 3 condiciones SIM × 96 |
| Contrastes | 16 entradas SIM por condición recomendada y base; 8 anclas DET nuevas o reutilizables solo con código/política actuales |
| TECH | 4 entradas, tres recorridos: 12 SIM |
| Diagnóstico | Primeros 4 casos VAL de cada condición; guardar el detalle durante su ejecución cuando sea posible |
| Coste | Hasta 600 SIM, apartado 12; separado del ajuste |

El puente no obliga a ejecutar 24 detallados extra si los 8 corregidos ya forman parte de las 72 anclas o los controles anteriores existen. Declarar duplicados técnicos y sus motivos; no sumarlos como observaciones nuevas de calibración.

Si la infraestructura necesita repetir un diagnóstico, límite 4 por condición, explícitos. Las pruebas unitarias y Chromium son extras separados, no cobertura estadística añadida.

### 11.3. Reserva VAL04E realmente nueva

Doce parejas no ordenadas: `(01,05),(05,09),(09,01),(02,06),(06,10),(10,02),(03,07),(07,11),(11,03),(04,08),(08,12),(12,04)`. Ambas orientaciones y cuatro réplicas: 96 casos; los doce equipos, dieciséis actuaciones por equipo.

Planes naturales y fichas originales. Clave: `20261024|SIM04E|VAL|<pareja-orientada>|R<replica>`. SHA-256 UTF-8, primeros 32 bits big endian; cero→1; colisión real con sufijo determinista `#2`, `#3`, registrado. No incluir motor, candidato, worker o intento en la clave del mismo caso.

Condiciones:

1. `DET_04E_REF`.
2. `SIM_04E_BASE`.
3. `SIM_04E_CAND` si difiere de la base.
4. Como tercera condición SIM y solo si es distinta, la mejor experimental de desarrollo que no coincide con las anteriores.

Máximo 96 DET + 288 SIM. Un alias reutiliza registros. La experimental se elige y congela **antes** de VAL; no se elige la que salga mejor en la reserva.

Congelar código deportivo, política, perfiles completos y candidatas antes de empezar. No reajustar después. Si un defecto técnico obliga a modificar deporte durante VAL, conservar la incidencia y repetir los casos afectados, etiquetando el resultado como reparación sobre reserva consumida; no afirmar validación independiente ni iniciar otra reserva silenciosa.

### 11.4. Contrastes y capacidades

Reutilizar definiciones T01 —rebote/balance—, T02 —interior/exterior—, T05 —director— y T07 —familiaridad—, V0/V1 y ambas orientaciones: 16 entradas. Misma semilla intencional V0/V1, distinta entrada. En DET, una orientación predeclarada por par:8 anclas.

Conservar las sondas existentes de las 32 capacidades y el contraste +1/+3/+5 en cálculo fijo, sin generar una campaña nueva de partidos por atributo. Reportar magnitud afectada, exposición y límites. Un uso no instrumentado no se convierte en aprobado por pasar tests.

No exigir que una sola pareja V1 gane el marcador. Comprobar exposición y respuesta de probabilidades/selección a la intención táctica. Las diferencias por roles, director, familia y familiaridad deben mantenerse después del ajuste agregado.

### 11.5. Auditoría final incluida

No termina la entrega después de implementar o seleccionar un vector. Debe entregar una auditoría factual con:

- Actas conciliadas, créditos, sujetos colectivos, minutos, energía y exclusión.
- Contador del patrón de falsa expiración, por causa y reloj que realmente limita.
- Comparativa de 31 métricas en desarrollo y VAL, con todas las bandas y guardas visibles.
- Los cuatro universos de AST: total, fuera de ORB, inmediata y reinicio; además el conjunto completo posterior a ORB. No confundir el porcentaje de la rama organizada con todo el rebote.
- Embudo de rebote, balón vivo, contacto, recuperación, fuera, último libre, excepciones y denominadores.
- Desgloses por equipo, uso y bandas de puntos; señalar una media global buena que oculte un tipo de equipo muy desviado.
- Equivalencia de rutas SIM y del detallado corregido: automático, fronteras, guardar/recuperar y consultas. Una entrada idéntica dentro del mismo motor/perfil debe reproducirse; no se exige igualdad SIM/DET.
- Estado de las auditorías existentes que sean aplicables, sin lanzar experimentos adicionales ni presentar 32/32 por herencia. No aplicable, no expuesto, no registrado y no ejecutado se diferencian.

ChatGPT hará la interpretación profunda. Claude entrega hechos, datos y el resultado mecánico de las reglas; no dedica otra fase a analizar cada correlación o redactar una tesis.

## 12. E08 · Coste y contratos del laboratorio

### 12.1. Alcance de coste para esta sesión

No repetir los 3.000 partidos de rendimiento de 04D. No rehacer el pool de workers, reducir salidas comprometidas o alterar el deporte para obtener cinco segundos.

Ensayo breve máximo:

- 200 SIM base y 200 candidata recomendada, en la misma máquina y con igual agenda y 4 workers preparados.
- Una jornada de 200 encuentros final, con 400 clubes y 4.800 jugadores remapeados, uno por club.

Total máximo 600 ejecuciones, más calentamientos explícitamente contados. Si la candidata es alias, reutilizar el lote base y declararlo. Medir preparación, simulación, transporte, publicación, sellado y memoria. Preservar los esenciales individuales y su disponibilidad para las estadísticas anuales.

Los objetivos de 1.000 partidos/5 s, publicación 1 s y RSS 1,5 GiB se mantienen. **Un ensayo de 200 no certifica el de 1.000 ni permite presentar una extrapolación como medición.** Informar variación relativa control/final y dejar la escala mayor pendiente.

No iniciar una optimización abierta. Una corrección de incompatibilidad o de fuga introducida por este encargo sí debe resolverse con su regresión. El rendimiento seguirá siendo una deuda independiente si no se acredita.

### 12.2. Jornada, guardado e historia

Recorrido pequeño reutilizable: una jornada mixta con 1 DET corregido y 4 SIM, reloj común, clasificación inicial/provisional/final, pausa, orden autorizada, un terminado y otro activo al guardar y recuperación tras recarga.

Mantener igualdad de resultados al avanzar por fronteras o recuperar. La clasificación pública no utiliza resultados futuros del sufijo privado. No simular una jornada nueva al consultar o descargar.

Historia y aprendizaje: reusar el caso corto actual, sin otra temporada de 72 partidos. El reintento aceptado no duplica actas anuales ni propuestas de aprendizaje. Los cambios estadísticos no alteran niveles de familiaridad durante el partido.

## 13. Pruebas justas y aceptación manual

### 13.1. Automatización mínima por riesgos reales

Crear pocos grupos de prueba, con subcasos compartidos, sobre las operaciones reales. No un test por cifra del informe.

1. **Frontera reproducida:** el caso E0070/E0071, con reloj controlado, falla en la base anterior y queda corregido. Debe verificar control y reanudación, no solo una etiqueta.
2. **Relojes:** contextos con y sin contacto, ambos tipos de fin y helper de reanudación. Incluir reloj previo alto y bajo; usar los criterios del apartado 4 sin duplicar otra máquina de reglas.
3. **Créditos:** tapón vivo con recuperación de cada equipo, fuera colectivo y ausencia de crédito legítima. Una oportunidad causal no produce dos créditos o un jugador inexistente.
4. **Puente observacional/deportivo:** antes del arreglo de continuidad, la corrección de crédito mantiene las variables deportivas prometidas. Después, la diferencia de trayectoria se atribuye al camino corregido.
5. **Integración estadística:** acta, análisis, familia `putback`, colectivos, valoración, export e historia concilian; la pérdida de equipo no obtiene un robo individual inventado.
6. **Parámetros y buscador:** dominios, deduplicación, vectores completos, pasos, presupuesto, guardas, alias, reservas y selección recalculable desde numeradores. Usar objetivos sintéticos pequeños para probar el algoritmo, no volver a ejecutar su campaña en la suite.
7. **Persistencia/equivalencia:** nuevo guardado, sufijo privado, fronteras, aprendizaje único y rechazo de incompatibles. Usar el fixture auténtico si la regresión lo requiere.
8. **Causalidad conservada:** sondas de capacidades y controles ya existentes, incluyendo director y familiaridad, sin crear un segundo sistema de sensibilidad.

Añadir solo las regresiones necesarias si aparece un defecto confirmado. No relanzar campañas antiguas para actualizar baselines.

### 13.2. Suite y versión final

Ejecutar los grupos dirigidos mientras se implementa. Antes de terminar, ejecutar **una suite completa sobre el código final**, `data:check` y el comprobador documental en copia limpia.

Actualizar expectativas de versión e identidad afectadas antes de esa corrida final. Si después hay un cambio de implementación/test por un fallo, ejecutar lo afectado y la suite final necesaria para acreditar el estado real. Una corrida 358/360 seguida de 45/45 parciales no se declara 360/360.

Si solo cambian documentación, empaquetado o recibo después de la suite, indicar esos cambios y sus controles; no repetir la suite por cada coma.

### 13.3. Navegador y Dennis

Chromium: hasta 12 comprobaciones funcionales, sin duplicar la auditoría deportiva: selección de motor, versiones, carga explícita de candidata, acta/colectivos, parámetros, guardado, jornada mixta/recarga y descarga real. Conservar errores de consola/red y validar bytes descargados. No recorrer 60 pantallas ni ejecutar el benchmark desde el navegador.

Recorrido manual para Dennis, de unos 12 pasos, con semilla, perfil, observable y señal de fallo. Debe servir para probar el cambio sin leer los scripts. Dennis conserva toda la aceptación manual; no llamarla hecha por el recorrido automatizado.

No instalar otros navegadores o versiones de Node para ampliar la matriz en esta entrega. Documentar lo no ejecutado.

## 14. Paquetes completos para ChatGPT

### 14.1. Cinco objetivos de evidencia

ChatGPT debe poder:

1. Ver por qué cambió la referencia detallada y qué conserva la parte observacional.
2. Recalcular actas, errores, selección y guardas sin simular otra vez.
3. Comprobar que la candidata validada es exactamente la elegida antes de VAL.
4. Examinar jugadores, tácticas, zonas, rebotes y asistencias en registros suficientes.
5. Identificar qué no se cumplió sin pedir una investigación adicional a Claude.

No guardar todo en logs diagnósticos redundantes. Para cada vector de búsqueda basta el esencial compacto con acta, zonas, denominadores, perfil y huella más su tabla por actuación; sin estados/eventos/quintetos repetidos si no se usan en la selección. Conservar el nivel comprometido para los casos finales y los diagnósticos seleccionados.

### 14.2. Archivos de entrega

En `out/sim-motor04e/entrega-final/`, fuera de Git:

- `SIM-MOTOR-04E-revision-rapida.zip`, objetivo ≤3 MiB.
- `SIM-MOTOR-04E-evidencia-detallada.zip`, o partes de ≤60 MiB con nombres inequívocos.
- `SIM-MOTOR-04E-indice-partes.json`, tamaños, hashes, contenido e identidades.
- `SIM-MOTOR-04E-verificacion-final.json`, recibo fuera de los ZIP comprobados.

El rápido contiene los datos necesarios para la primera revisión:

| Archivo | Contenido |
|---|---|
| `00-LEEME.md` | Estado real, orden y decisiones pendientes |
| `01-IDENTIDAD.json` | Base, commits, congelaciones, versiones, políticas y fuentes |
| `02-CAMBIOS-Y-ALCANCE.csv` | Cada diff vinculado a crédito, reloj, consumidor, prueba o ajuste SIM |
| `03-CASOS-RELOJ-Y-REBOTE.json` | Casos dirigidos, hechos anteriores/nuevos y motivo; sin forzar IDs viejos en una trayectoria nueva |
| `04-PUENTE-REFERENCIA.csv` | Antes/crédito/continuidad y nueva referencia, con causalidad y límites |
| `05-AGENDA-Y-RECUENTO.csv` | Bloques, entradas, semillas, condiciones, intentos, estado y reutilización |
| `06-ACTA-EQUIPOS.csv.gz` | Una fila por actuación, conteos reales y a 40 min, identidad global |
| `07-COMPARATIVA-ACTA.csv` | Las 31 métricas en desarrollo y VAL; base/candidata/DET, delta, banda y cumplimiento |
| `08-TIRO-ZONAS-CONTEXTOS.csv.gz` | Intentos, aciertos, cuota y calidad, numeradores/denominadores |
| `09-REBOTES.csv` | Oportunidad, contacto, recuperación, crédito individual/colectivo y excepciones |
| `10-ASISTENCIAS-Y-PERDIDAS.csv` | Universos de AST y pérdidas elegibles para robo, con sus embudos |
| `11-BUSQUEDA-Y-SELECCION.json` | Regla, todos los vectores, evaluación, padres, deduplicaciones, guardas y selección final |
| `12-EQUIPOS-USO-Y-DISTRIBUCION.csv` | Medias por equipo, roles, minutos/uso, bandas de anotación y contrastes |
| `13-COMPROBACIONES.json` | Reloj, conciliaciones, rutas, auditorías aplicables, historia y aprendizaje |
| `14-RENDIMIENTO.json` | Mediciones de 200, fases, máquina, memoria y escala pendiente |
| `15-LIMITES-Y-DECISIONES.md` | Bandas aún fuera, incertidumbre, no evaluados y criterios reales |
| `DICCIONARIO.md` | Fórmulas, unidades, nulos, alias, universos y políticas |

El detalle contiene entradas, perfiles efectivos de referencia/base/candidatas, semillas, registros compactos de desarrollo y finales, diagnósticos, pruebas, instrumentos y dependencias necesarias para la reproducción prometida. Incluir fixtures requeridos. Declarar si es código suficiente para el comprobador o un checkout completo; no confundirlos.

Las políticas históricas se conservan en los registros antiguos. No generar una columna nueva con cero cuando el dato viejo no existe: indicar no registrado/no reconstruible.

### 14.3. Comprobador offline

Una orden debe verificar los **bytes finales**, sin simular: ZIP, manifiestos, tamaños/hashes, parseo, inventario, recuentos, entradas/semillas, actas y zonas, crédito/oportunidad, vector aplicado, desarrollo conjunto completo, algoritmo/selección y congelación previa a VAL.

Verificar que no se usó VAL en la selección, que una condición alias no duplica observaciones y que las reparaciones respetaron el presupuesto. Incluir prueba de rechazo de una copia alterada y de un numerador incoherente; no alterar los ZIP finales para hacerla.

Un no evaluado no cuenta como correcto. La norma y la aceptación manual no quedan certificadas por hashes.

Comprueba que los archivos existen y se pueden descargar. Adjuntarlos realmente si la plataforma lo permite. Si solo están en el contenedor, dar ruta exacta y procedimiento; no afirmar «adjuntos» sin haberlos adjuntado. `out/` no se guarda en Git: no cerrar la entrega sin los paquetes.

## 15. Cierre y respuesta final

### 15.1. Disciplina para aprovechar los tokens

- Preferir scripts reproducibles y salida factual breve. Evitar volcar JSON grandes, cada partido o cada candidato en la conversación.
- Reutilizar tablas, lectores, trabajadores y generadores actuales. No escribir instrumentos paralelos que solo cambien nombres.
- Guardar avances, incidentes y commits revisables a lo largo de la entrega. Si se interrumpe la sesión, el estado permite continuar sin repetir todo.
- No pedir permiso para los rangos, el cambio de referencia o las correcciones expresamente autorizadas aquí.
- Si surge una decisión deportiva ajena al alcance, conservar una solución segura existente y declarar el límite. Seguir terminando los otros bloques.
- El incumplimiento de una banda o del objetivo de coste no detiene las correcciones, la auditoría y los ZIP.

### 15.2. Respuesta final que debe recibir Dennis

1. PR/rama/base, código de referencia y candidata congelados, HEAD final, fusión pendiente.
2. Qué se corrigió en el detallado, qué solo cambia acta y qué modifica trayectoria. Resultado nuevo de la semilla histórica, sin objetivo de marcador.
3. Recuento del patrón de falsa expiración y prueba de que una transición antigua no reaparece.
4. Criterio común de rebote, colectivos y puente de comparación; fuente leída directamente o implementada desde la especificación de ChatGPT.
5. Vector recomendado y experimental, si existe; todos sus valores modificados, dominios usados y carga manual.
6. **Tabla de acta y acierto DET/base/candidata**, normalizada y real, diferencias relativas/pp y todas las bandas incumplidas. Separar DEV-A, desarrollo conjunto y VAL.
7. Cantidades reales por bloque, reusos, fallos, reintentos, omisiones y extras. No inflar el total con alias o con diagnósticos repetidos.
8. Coste medido de 200 y lo que sigue pendiente a 1.000; sin extrapolación presentada como ejecución.
9. Suite completa final, dirigidas, documental, navegador, no ejecutado y manual pendiente de Dennis.
10. Los archivos reales: rápido primero, índice/recibo y detalle. Tamaño, hash y orden de envío.

No declarar «calibrado», «estadísticamente equivalente», «conforme FIBA integralmente», «aceptado por Dennis» o «escala masiva cerrada» sin evidencia específica. Una mejora útil con bandas pendientes se entrega como tal.

**Objetivo de esta única entrega:** resolver el defecto concreto de referencia, dejar los créditos y relojes coherentes, aproximar al máximo el acta de SIM con sus mecanismos actuales y devolver una auditoría completa para decidir el cierre. Completar trabajo verificable, con presupuesto cerrado y sin rehacer la base del juego.
