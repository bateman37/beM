<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 20 — Estadísticas: acta, atribución y magnitudes · parte 5 de 6
> Anterior: [c20-p04-faltas-sanciones-lesiones-y-disponibilidad](c20-p04-faltas-sanciones-lesiones-y-disponibilidad.md) · Siguiente: [c20-p06-mapa-de-tiros-y-perfiles-de-finalizacion](c20-p06-mapa-de-tiros-y-perfiles-de-finalizacion.md)
<!-- beM:nav-fin -->

<a id="grupo-20-17"></a>

### 20.17. Catálogo avanzado y fórmulas

*Procedencia: MD04, §15.*

<a id="src-md04-l0737"></a>

#### 20.17.1. Familias de métricas

*Origen: MD04 §15.1.*

El catálogo máximo conserva métricas convencionales de acta y métricas propias basadas en registro. Su convivencia es útil: unas facilitan comparación externa; otras permiten estudiar mejor el partido simulado. Los nombres no deben ocultar la diferencia.

Los símbolos y universos completos figuran en el [anexo de origen MD04 A](../referencias/c32-glosario-y-diccionarios.md#cap-32). Si un denominador es cero o no tiene sentido en el filtro, el indicador aparece como no calculable, no como cero.

<a id="src-md04-l0743"></a>

#### 20.17.2. Tiro y distribución

*Origen: MD04 §15.2.*

| Métrica | Fórmula propuesta | Tipo y lectura |
|---|---|---|
| TC % | 100 × TCC/TCI | Proporción exacta de intentos acreditados. |
| T2 %, T3 %, TL % | 100 × convertidos/intentados del tipo | Desgloses básicos. |
| eFG % | 100 × (TCC + 0,5 × T3C)/TCI | Ajusta el valor del triple; puede superar 100 %. |
| TS % estimado | 100 × PTS / [2 × (TCI + 0,44 × TLI)] | Convención estimada de eficiencia anotadora; no conteo exacto de oportunidades. |
| Frecuencia de triple | 100 × T3I/TCI | Porción de tiros de campo que son triples. |
| Frecuencia por sector | 100 × TCI del sector/TCI elegibles | Distribución, no eficacia. |
| Frecuencia de libres | TLI/TCI, o 100 × TLI/TCI con etiqueta | «Libres por tiro» o «por 100 tiros»; nunca ambiguo. |
| Puntos de campo por intento | (2 × T2C + 3 × T3C)/TCI | Valor de los tiros de campo, sin libres. |
| Puntos por finalización registrada | PTS_F del universo/F cerradas del mismo universo | Métrica propia: acción de tiro y serie causal ligada; excluye penalización no de tiro y administración. |
| Canastas asistidas % | 100 × canastas con AS/canastas elegibles | Usa AS a canasta, no asistencias a libres. |
| Conversión por oportunidad | Aciertos/intentos válidos de ese contexto | Se acompaña de muestra y clasificación previa. |

El coeficiente 0,44 de TS pertenece a una aproximación convencional. No se usa para borrar la información exacta de series de libres. Se propone conservarlo para comparabilidad externa y mostrar por separado la eficiencia por finalizaciones registradas.

La variante exacta de finalizaciones no se llama «TS real» sin aclaración: una posesión con rebotes, faltas y penalizaciones puede tener otra agrupación que el indicador convencional. Son preguntas diferentes.

<a id="src-md04-l0763"></a>

#### 20.17.3. Equipo: eficiencia, ritmo y cuatro factores

*Origen: MD04 §15.3.*

| Métrica | Fórmula propuesta | Precisión funcional |
|---|---|---|
| ORtg global | 100 × PTS propios totales/posesiones ofensivas beM | Incluye puntos administrativos bajo política declarada. |
| DRtg global | 100 × PTS rivales totales/posesiones ofensivas beM del rival | No divide por los ataques propios. |
| NetRtg | ORtg − DRtg | Diferencia de eficiencias definidas en la misma vista. |
| Ritmo reglamentario | Duración reglamentaria × media de posesiones de ambos equipos/duración real disputada | Incluye prórrogas en duración real; expresa ritmo por partido reglamentario. |
| Puntos por posesión vinculada | PTS vinculados/posesiones elegibles | Propio para familias, contexto y continuaciones. |
| Pérdidas por 100 posesiones | 100 × PER totales/posesiones ofensivas beM | Métrica propia exacta del registro. |
| TOV % convencional | 100 × PER/(TCI + 0,44 × TLI + PER) | Estimación de acta distinta de la anterior. |
| RO % de acta | 100 × RO propio/(RO propio + RD rival) | Política colectiva uniforme y visible. |
| RD % de acta | 100 × RD propio/(RD propio + RO rival) | Misma frontera de oportunidades. |
| Rebote por oportunidad | 100 × capturas elegibles/oportunidades registradas | Alternativa propia con universo de fallos explícito. |
| Posesiones estimadas | TCI + 0,44 × TLI − RO + PER | Solo comparación; no sustituye el conteo beM. |

Se desea una vista de cuatro factores con eFG, pérdidas, rebote ofensivo y frecuencia de libres, pero debe indicar qué versión de pérdidas utiliza. No se copia el nombre de una tabla externa para combinar fórmulas incompatibles en silencio.

Para una competición de 40 minutos con cinco de prórroga, el ritmo propuesto multiplica por 40 y divide por 45. Para otras reglas utiliza su duración reglamentaria. Esta política es propuesta de beM, no una afirmación sobre la fórmula interna de la web ACB.

<a id="src-md04-l0783"></a>

#### 20.17.4. Jugador: volumen, uso y presencia

*Origen: MD04 §15.4.*

| Métrica | Definición propuesta | Límite |
|---|---|---|
| Estadística por 40 minutos | 40 × conteo/MIN reales | Extrapolación de volumen, no predicción de que pueda sostenerlo. |
| Estadística por minuto | Conteo/MIN reales | Sin tiempo positivo: no calculable. |
| Producción por 100 ataques en presencia completa | 100 × créditos elegibles/ataques completos con el jugador | Numerador restringido al mismo universo; véase apartado 24. |
| USG % estimado convencional | 100 × (TCI_j + 0,44 × TLI_j + PER_j) × D / [MIN_j × (TCI_eq + 0,44 × TLI_eq + PER_eq)] | D es duración real del equipo; aproximación por tiempo, no posesiones exactas en pista. |
| Cuota de finalizaciones | Finalizaciones del jugador/finalizaciones del equipo en el mismo universo | Propia; no incluye todas sus decisiones o pases. |
| Cuota de cierres de posesión | Cierres atribuibles al jugador/cierres elegibles del equipo | Propia; admite cierre colectivo o sin actor individual. |
| Asistencia a canasta sobre producción de compañeros | AS a canasta/canastas de compañeros en universo completo | No usa AS a libres como si fueran canastas. |
| Ratio AS/PER | AS/PER | Si PER = 0 se muestran ambos conteos; no un infinito para ordenar. |
| Cuota de rebotes | Rebotes del jugador/rebotes del equipo en mismo universo | Participación entre créditos; no probabilidad de capturar. |
| Captura por oportunidad individual | Capturas/oportunidades donde fue participante elegible | Propia; exige saber elegibilidad real. |
| Robos por 100 ataques rivales | 100 × REC/ataques rivales elegibles | Mide robos, no todas las recuperaciones. |
| Tapones sobre tiros rivales elegibles | TAP/TCI rivales elegibles | Declarar si incluye todos los tiros o solamente dos puntos; no cambiar nombre silenciosamente. |

El USG estimado no mide cuánto organiza un base. Un director puede pasar mucho y finalizar poco. La dirección y creación se consultan en indicadores propios del registro.

No se propone calcular un ORtg o DRtg individual mediante una fórmula de mérito personal y presentarlo como medición exacta. Puede mostrarse la eficiencia del equipo durante su presencia, con ese nombre. Si se desea una estimación individual de producción/defensa ajustada, requiere otra definición y validación.

<a id="src-md04-l0804"></a>

#### 20.17.5. Normalizaciones y comparabilidad

*Origen: MD04 §15.5.*

Se conserva como alcance la consulta por partido, 40 minutos, 100 posesiones, oportunidad y referencia de competición. Cada normalización tiene sus propios numeradores elegibles.

Un rebote ofensivo se normaliza preferentemente por fallos/ofertas ofensivas, un robo por ataques rivales y un punto por ataque propio. No se divide todo por un único «total de posesiones» que mezcla ataque y defensa para simplificar la tabla.

Cuando una estadística se filtra a un contexto que no tiene duración propia —por ejemplo, tiro de esquina— no se ofrece automáticamente por 40 minutos de «tiro de esquina». Se puede expresar su producción por minutos generales del jugador si se etiqueta así, o por oportunidades del contexto.

<a id="src-md04-l0812"></a>

#### 20.17.6. Estadísticas que no se adoptan automáticamente

*Origen: MD04 §15.6.*

PER como índice global, win shares, métricas de impacto ajustado, puntos evitados contrafactuales, probabilidades de victoria y un MVP integral no se deducen de este catálogo por tener más datos.

Estas posibilidades no se adoptan como métricas del núcleo por defecto. Incorporar una fórmula adicional exige finalidad, definición y evidencia propias; no se inventan esos números para completar el catálogo.

<a id="grupo-20-18"></a>

### 20.18. Procedencia de los puntos y producción colectiva

*Procedencia: MD04, §16.*

<a id="src-md04-l0820"></a>

#### 20.18.1. Dos formas de ordenar puntos

*Origen: MD04 §16.1.*

La descomposición por valor del tiro puede ser excluyente: dos, tres, libres y créditos especiales claramente separados. Las etiquetas de origen/contexto se solapan y no forman una suma simple.

Una canasta puede aportar dos puntos en pintura, dos del banquillo, dos tras pérdida y dos en transición. El marcador gana dos puntos. El usuario debe poder ver esas cuatro lecturas sin sumar ocho.

<a id="src-md04-l0826"></a>

#### 20.18.2. Definiciones funcionales propuestas

*Origen: MD04 §16.2.*

| Campo | Criterio | Frontera importante |
|---|---|---|
| Pintura | Puntos de campo desde sector clasificado como pintura | Los libres no pasan a pintura por derivar de una falta interior. |
| Banquillo | Puntos de jugadores que no integraban el cinco inicial | Cambiar la rotación no cambia la condición histórica de titular. |
| Tras pérdida | Puntos de la siguiente unidad ofensiva elegible abierta por pérdida rival | Puede incluir sus libres y continuaciones; causa registrada. |
| Segunda oportunidad | Puntos posteriores a rebote ofensivo dentro de la continuidad elegible | Dos rebotes ofensivos antes de la misma canasta no duplican esos puntos. |
| Transición | Puntos en ataque resuelto antes de defensa organizada | Contexto del motor; no se infiere solo de que hubo una canasta rápida. |
| Contraataque de convención estadística | Puntos que cumplen la política externa elegida | Puede exigir criterio temporal específico y no coincidir con transición beM. |
| Saque | Puntos de posesiones cuyo origen corresponde a esa reanudación | Debe distinguir conversión directa de toda la continuidad posterior. |
| Final de reloj | Puntos de oportunidades clasificadas con reloj comprometido | Umbral y momento de clasificación declarados. |
| Tras ayuda/doble | Puntos de una cadena donde la respuesta generó contexto registrado | Descripción, sin afirmar puntos que se habrían evitado sin ayuda. |
| Administrativo | Puntos válidos no vinculados al ataque ordinario | Fila de conciliación; no familia de jugada inventada. |

«Transición beM» y «contraataque según perfil estadístico» pueden convivir. La investigación FIBA contempla una convención de contraataque con condición temporal; el umbral exacto se remite a la política seleccionada y no obliga a cronometrar cada movimiento.

<a id="src-md04-l0843"></a>

#### 20.18.3. Intentos y oportunidades asociados

*Origen: MD04 §16.3.*

No basta con presentar puntos. Se desea conocer ataques, finalizaciones, intentos, aciertos, libres, pérdidas y rebotes ofensivos asociados a cada origen. Esto permite distinguir pocas oportunidades muy eficaces de muchas oportunidades poco eficaces.

Los intentos «tras pérdida» no se suman a los intentos generales como si fueran otros tiros. Son un filtro de esos mismos intentos. El catálogo conserva esa relación.

<a id="src-md04-l0849"></a>

#### 20.18.4. Dos lecturas de segunda oportunidad

*Origen: MD04 §16.4.*

Se propone mostrar:

1. **Después del primer rebote ofensivo:** puntos, pérdidas y finalizaciones de toda la continuación.
2. **Ejecución inmediatamente posterior a cada rebote:** qué primera decisión se tomó, su oportunidad y resultado local.

La primera permite un total de puntos sin duplicación. La segunda puede tener varias observaciones por posesión y no debe sumar los puntos posteriores completos a cada rebote.

<a id="src-md04-l0858"></a>

#### 20.18.5. Balance y coste de perseguir rebotes

*Origen: MD04 §16.5.*

El entrenador necesita ver tanto capturas como transiciones rivales después de sus fallos. La propuesta enlaza el ataque fallado, participantes que cargaron/cerraron, control rival y respuesta de balance.

Se puede describir «en 8 fallos con ese plan hubo 3 rebotes ofensivos y 2 ataques rivales de transición». No se afirma automáticamente que esos dos contraataques fueran causados solo por el plan: la lectura conserva tipo de fallo, rivales y contexto.

<a id="grupo-20-19"></a>

### 20.19. Evolución, parciales y momentos del encuentro

*Procedencia: MD04, §17.*

<a id="src-md04-l0866"></a>

#### 20.19.1. Marcador y diferencia

*Origen: MD04 §17.1.*

La evolución se construye desde anotaciones válidas y su orden. Se desea una curva escalonada de puntuación y margen, periodos visibles, cambios de cinco/plan relevantes y posibilidad de abrir el hecho de cada punto de inflexión.

Un gráfico por tiempo de juego puede tener varios puntos con el mismo reloj. Debe mantener su orden sin desplazar eventos a segundos ficticios para que «quepan». Puede agrupar visualmente y desplegar los hechos del mismo instante.

<a id="src-md04-l0872"></a>

#### 20.19.2. Máximas ventajas

*Origen: MD04 §17.2.*

Se conserva la mayor ventaja de cada equipo, su primer momento y otros momentos en que se igualó si el usuario los consulta. Si un equipo nunca fue por delante, su máxima ventaja es cero; no se presenta una desventaja como «ventaja máxima −3» sin explicación.

La remontada observada puede describirse como recuperación desde una diferencia desfavorable hasta igualdad, ventaja o resultado final. La etiqueta no lleva una probabilidad inventada.

<a id="src-md04-l0878"></a>

#### 20.19.3. Empates y cambios de líder

*Origen: MD04 §17.3.*

La propuesta excluye el 0–0 inicial de los empates producidos por anotación. Un empate se cuenta cuando el marcador pasa a igualdad desde una desigualdad; varios sucesos sin puntos con el mismo empate no lo multiplican.

Para cambios de líder se conserva el último líder no empatado. Pasar de A arriba a empate y después B arriba cuenta un cambio. La primera ventaja del encuentro no cuenta como cambio de líder. Si se desea otra convención externa, debe cambiarse la política y su etiqueta.

<a id="src-md04-l0884"></a>

#### 20.19.4. Tiempo por delante, empatado y por detrás

*Origen: MD04 §17.4.*

Se integran intervalos de reloj de juego con margen positivo, cero o negativo. No se cuentan pausas ni tiempo de animación.

`Tiempo delante A + tiempo delante B + tiempo empatado = duración disputada`

Una secuencia de libres sin consumo de reloj puede cambiar varias veces el líder, pero no añade segundos de ventaja. La integración usa el estado efectivo para el siguiente intervalo temporal.

<a id="src-md04-l0892"></a>

#### 20.19.5. Parciales y rachas

*Origen: MD04 §17.5.*

Se propone distinguir:

| Indicador | Definición |
|---|---|
| Parcial sin respuesta | Puntos consecutivos de un equipo sin anotación rival entre ellos. |
| Parcial por ventana | Diferencia de puntos dentro de un bloque temporal o de posesiones seleccionado. |
| Racha de aciertos/fallos | Secuencia de intentos válidos de un sujeto o tipo. |
| Tramo de control | Periodo descriptivo con margen y producción sostenida; necesita criterio explícito si se automatiza. |
| Remontada | Cambio desde una diferencia adversa identificada a un resultado posterior. |

Un tiempo muerto no interrumpe por sí solo un parcial sin respuesta. El cruce entre periodos debe seguir una política: se recomienda permitirlo en el total del partido y mostrar versión dentro de cada periodo cuando se filtra por ese periodo.

Los libres y los puntos concedidos válidos cuentan como anotación. Un intento anulado no rompe una racha estadística de intentos válidos. La racha observada no equivale al estado interno de momento.

<a id="src-md04-l0908"></a>

#### 20.19.6. Situaciones ajustadas y decisivas

*Origen: MD04 §17.6.*

Se propone un filtro de **final ajustado**, configurado por periodo, tiempo restante y margen antes del acontecimiento. La configuración inicial aceptada es últimos dos minutos del cuarto periodo o de cada prórroga con diferencia previa de cinco puntos o menos.

Son parámetros iniciales configurables del perfil estadístico. No se adopta automáticamente la ventana de cinco minutos de otras competiciones ni se equipara a Rendimiento bajo presión. La presión deportiva puede existir fuera de esa ventana, especialmente en partidos importantes.

La condición se evalúa con información previa. No se selecciona un tiro como «decisivo» solamente porque entró y después resultó ser el último que cambió el marcador. El resumen puede destacar ese hecho como desenlace, identificando la lectura retrospectiva.

<a id="src-md04-l0916"></a>

#### 20.19.7. Tiempos muertos y ajustes

*Origen: MD04 §17.7.*

Se desea señalar marcador y contexto de cada tiempo muerto, orden relevante y momento real de aplicación. El informe puede mostrar el siguiente tramo de N posesiones o tiempo seleccionado.

«Después del tiempo muerto hubo un 8–2» es un hecho. «El tiempo muerto produjo ese 8–2» necesita una inferencia más fuerte que el dato no demuestra. La redacción del resumen mantiene esa diferencia.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c20-p04-faltas-sanciones-lesiones-y-disponibilidad](c20-p04-faltas-sanciones-lesiones-y-disponibilidad.md) · Siguiente: [c20-p06-mapa-de-tiros-y-perfiles-de-finalizacion](c20-p06-mapa-de-tiros-y-perfiles-de-finalizacion.md)
