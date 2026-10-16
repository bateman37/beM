<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 20 — Estadísticas: acta, atribución y magnitudes · parte 2 de 6
> Anterior: [c20-p01-unidad-de-finalizacion-de-tiro](c20-p01-unidad-de-finalizacion-de-tiro.md) · Siguiente: [c20-p03-atribucion-que-hecho-produce-cada-registro](c20-p03-atribucion-que-hecho-produce-cada-registro.md)
<!-- beM:nav-fin -->

<a id="grupo-20-05"></a>

### 20.5. Principios de interpretación y presentación

*Procedencia: MD04, §3.*

<a id="src-md04-l0136"></a>

#### 20.5.1. Hechos, cálculos e interpretación

*Origen: MD04 §3.1.*

| Nivel | Ejemplo | Tratamiento |
|---|---|---|
| Hecho deportivo | Triple válido de un jugador | Fuente para marcador y acta. |
| Atribución estadística | Ese pase cumple la política de asistencia | Aplicación de una política explícita al hecho. |
| Cálculo derivado | 7 triples en 20 intentos: 35 % | Fórmula y denominador conocidos. |
| Clasificación contextual | Tiro tras recepción desde un sector exterior | Etiquetas obtenidas del acontecimiento y su contexto. |
| Lectura descriptiva | El equipo anotó más por posesión en esos tramos | Observación con muestra y filtros visibles. |
| Interpretación | Esa combinación puede merecer más minutos | Propuesta razonada; no demostración causal. |
| Diagnóstico del motor | Pesos, probabilidad y capacidad efectiva usados | Herramienta de revisión, separada de la información deportiva pública. |

El resumen puede combinar los cinco primeros niveles si deja claro qué demuestra cada afirmación. Las recomendaciones del entrenador no se disfrazan de hechos ocurridos.

<a id="src-md04-l0150"></a>

#### 20.5.2. Cero, ausencia y falta de medición

*Origen: MD04 §3.2.*

| Presentación | Significado |
|---|---|
| `0` | Se midió el concepto y no ocurrió en ese universo. |
| `—` en porcentaje | No existe denominador elegible. |
| `No jugó` | No entró en pista; no equivale a una actuación de cero minutos redondeados. |
| `No registrado` | Esa familia de datos no está disponible para ese partido. |
| `No aplicable` | El concepto no corresponde a ese sujeto o filtro. |
| `Parcial` | Falta parte del encuentro o la muestra todavía está en curso. |

Un jugador que no ha tirado libres muestra 0/0 y porcentaje «—», no 0 %. Una aportación sin balón ausente del registro no se presenta como cero aportaciones.

<a id="src-md04-l0163"></a>

#### 20.5.3. Precisión y agregación

*Origen: MD04 §3.3.*

- Los conteos deportivos se mantienen como enteros cuando el concepto lo exige.
- Los porcentajes se calculan desde numerador y denominador completos, antes del redondeo de presentación.
- Un agregado de partidos no promedia porcentajes sin ponderación: suma aciertos e intentos y vuelve a dividir.
- Los minutos se obtienen del tiempo real en pista. La presentación redondeada no es el origen del cálculo.
- Una tabla indica si ofrece total, media por partido, por 40 minutos, por 100 posesiones o porcentaje de oportunidades.
- Los puntos porcentuales se diferencian de la variación relativa. Subir de 30 % a 40 % son 10 puntos porcentuales, no un aumento relativo del 10 %.

La precisión visual propuesta es una decimal para porcentajes y eficiencias, y minutos:segundos para tiempo. Es una preferencia de presentación pendiente de cerrar; no obliga a perder precisión interna.

<a id="src-md04-l0174"></a>

#### 20.5.4. Muestra y contexto

*Origen: MD04 §3.4.*

Toda proporción relevante debe poder mostrar su fracción: «75 %; 3/4». Una diferencia de eficiencia lleva número de posesiones. Un on/off lleva minutos y posesiones de ambos estados.

No se impone aquí un mínimo universal de diez tiros o veinte posesiones. Los umbrales para avisos, clasificaciones y comparaciones se configurarán por métrica. Una muestra pequeña no desaparece del partido: se muestra con su limitación y no se usa para afirmar una superioridad concluyente.

<a id="src-md04-l0180"></a>

#### 20.5.5. Tres distinciones esenciales

*Origen: MD04 §3.5.*

1. **Resultado frente a calidad:** un tiro cómodo puede fallarse y un tiro forzado puede entrar.
2. **Coincidencia frente a causalidad:** ganar un tramo con una zona no demuestra que la zona sea por sí sola la causa.
3. **Rendimiento frente a capacidad:** una actuación excepcional no revela un atributo permanente de 30.

Estas distinciones deben sobrevivir en mapas, resúmenes, informes, comparaciones y recomendaciones.

<a id="grupo-20-06"></a>

### 20.6. Identidad, reglas y estado del partido

*Procedencia: MD04, §4.*

<a id="src-md04-l0190"></a>

#### 20.6.1. Ficha del encuentro

*Origen: MD04 §4.1.*

| Campo | Uso funcional |
|---|---|
| Identificador estable | Relacionar resultado, acontecimientos, acta, historial y revisiones. |
| Competición, temporada, fase y jornada | Comparar con el universo correcto. |
| Equipos, localía y sede | Contexto e historial; sede neutral cuando corresponda. |
| Fecha y hora previstas/reales | Ordenar el calendario sin confundir inicio previsto con efectivo. |
| Entrenadores y plantillas convocadas | Interpretar órdenes, rotación y ausencia de jugadores. |
| Reglas deportivas y edición | Duración, faltas, sanciones, reloj y condiciones de finalización. |
| Política estadística y versión | Explicar atribución y cambios de cálculo. |
| Modalidad de visualización | Dato de uso; no modifica la definición deportiva de las cifras. |
| Estado del encuentro | Programado, en curso, pausa, suspendido, finalizado o corregido. |
| Duración de juego y prórrogas | Denominador temporal real. |
| Nivel de información conservada | Saber qué vistas son reconstruibles. |

Semilla y versión de configuración del motor corresponden al diagnóstico y a la reproducibilidad. No necesitan ocupar la ficha deportiva que ve el usuario normal.

<a id="src-md04-l0208"></a>

#### 20.6.2. Duración y marcador

*Origen: MD04 §4.2.*

El resultado muestra puntos totales, cada periodo reglamentario y todas las prórrogas. Una columna de prórroga no comprime varias en una única casilla ambigua: puede existir total de prórrogas, con acceso al desglose de cada una.

La duración real incluye el tiempo de juego de las prórrogas. No incluye pausas, tiempos muertos ni duración de la animación. El ritmo y las normalizaciones distinguen duración reglamentaria de duración efectivamente disputada.

<a id="src-md04-l0214"></a>

#### 20.6.3. Encuentros no finalizados y decisiones administrativas

*Origen: MD04 §4.3.*

Una suspensión conserva lo disputado con estado parcial. Una continuación enlaza los hechos anteriores y posteriores sin convertirlos en dos encuentros estadísticos independientes.

Una victoria administrativa, retirada o resultado por sanción no inventa tiros, puntos individuales ni minutos para explicar el marcador adjudicado. Se separan resultado oficial administrativo y estadísticas realmente disputadas. La política de inclusión en medias e historial de competición debe estar definida.

Si un cálculo falla, el sistema no completa cifras plausibles. Registra que no existe un acta final válida. Este requisito describe coherencia funcional, no un flujo de errores de programación que debamos construir ahora.

<a id="grupo-20-07"></a>

### 20.7. Catálogo individual: acta completa

*Procedencia: MD04, §5.*

<a id="src-md04-l0230"></a>

#### 20.7.1. Identificación y participación

*Origen: MD04 §5.1.*

La propuesta de acta permite una fila por jugador convocado, incluidos quienes no entraron. El estado de participación se muestra junto al nombre; no se deduce únicamente de la casilla de minutos.

| ID | Campo | Definición funcional | Observación |
|---|---|---|---|
| J01 | Jugador y dorsal | Identidad en esa convocatoria | Los cambios de dorsal futuros no alteran el partido histórico. |
| J02 | Posición/función mostrada | Identificación deportiva contextual | Rol y posición no son nuevas capacidades. |
| J03 | Titular | Perteneció al cinco inicial | Permite definir los puntos del banquillo de forma estable. |
| J04 | Participación | Entró, no jugó, indisponible o retirado | La causa visible respeta permisos de información. |
| J05 | MIN | Tiempo de juego en pista | Se calcula por entradas y salidas, no por acciones realizadas. |
| J06 | PTS | Puntos acreditados al jugador | Conciliados con tiros y posibles créditos especiales. |
| J07 | T2C/T2I | Tiros de dos convertidos/intentados | Intentos estadísticos válidos. |
| J08 | T2 % | 100 × T2C/T2I | Sin intentos: «—». |
| J09 | T3C/T3I | Tiros de tres convertidos/intentados | Incluye tiros concedidos si corresponde a la política. |
| J10 | T3 % | 100 × T3C/T3I | El valor del intento debe proceder del hecho validado. |
| J11 | TLC/TLI | Libres convertidos/intentados | Solo los intentos válidos tras anulaciones o repeticiones. |
| J12 | TL % | 100 × TLC/TLI | No confundir serie concedida con intentos finalmente válidos. |
| J13 | TCC/TCI | Tiros de campo totales | TCC = T2C + T3C; TCI = T2I + T3I. |
| J14 | TC % | 100 × TCC/TCI | Complemento del desglose de dos y tres. |
| J15 | RO | Rebotes ofensivos individuales | Captura o control elegible acreditado, no cualquier contacto. |
| J16 | RD | Rebotes defensivos individuales | Separados de rebotes colectivos. |
| J17 | RT | Rebotes individuales totales | RO + RD. |
| J18 | AS | Asistencias oficiales del perfil elegido | Puede distinguirse asistencia a canasta y a libres. |
| J19 | PER | Pérdidas individuales | No incorpora pérdidas colectivas ajenas. |
| J20 | REC | Robos individuales | Toda recuperación no es un robo. |
| J21 | TAP | Tapones acreditados | Conexión a un intento de tiro elegible. |
| J22 | TREC | Tapones recibidos | Relación con el mismo intento que acredita el tapón rival. |
| J23 | MAT | Mates convertidos | Subconjunto de canastas; no puntos adicionales. |
| J24 | FC | Faltas cargadas al jugador | El detalle distingue tipos y contadores disciplinarios. |
| J25 | FR | Faltas recibidas acreditables | No presume correspondencia con todas las faltas técnicas rivales. |
| J26 | +/− | Diferencia de puntos mientras está en pista | Descriptor colectivo durante su presencia. |
| J27 | VAL | Valoración de acta según fórmula declarada | No es una nota integral del jugador. |
| J28 | Estado de salida | Lesión, límite de faltas, descalificación u otra retirada | Información de disponibilidad, no un campo de rendimiento. |

Los nombres visibles pueden usar abreviaturas alternativas. Debe existir un glosario accesible para que PER no se confunda con un índice de eficiencia que también usa ese acrónimo en otras fuentes.

<a id="src-md04-l0267"></a>

#### 20.7.2. Desgloses ampliados de la fila del jugador

*Origen: MD04 §5.2.*

Al abrir un jugador deben poder consultarse, como alcance funcional:

| Grupo | Campos o desgloses deseados |
|---|---|
| Tiro | Sectores, dos/tres/libres, preparación, tipo de finalización y nivel de oposición. |
| Producción | Puntos por periodo, por contexto, asistidos/no asistidos y por origen de ataque. |
| Creación | Asistencias a canasta/libres, oportunidades creadas registradas y resultado de sus pases. |
| Control | Tipo de pérdida, zona funcional, contexto de presión y director del ataque. |
| Rebote | Ofensivo/defensivo, tipo de fallo, disputado/sin oposición cuando esté representado. |
| Defensa | Robos, tapones, faltas, responsabilidades registradas y cobertura empleada. |
| Participación | Tramos en pista, compañeros, rival, posición funcional y rol asignado. |
| Uso | Finalizaciones, cierres de posesión, dirección y decisiones tácticas efectivamente realizadas. |
| Disciplina | Tipos de faltas, cronología, efecto en bonus y causa de retirada. |
| Evolución | Producción por tramos, rachas observadas y estado de energía visible cuando corresponda. |

Estos desgloses no deben convertirse en una tabla principal con decenas de columnas siempre abiertas. El alcance se conserva; la presentación puede desplegarlo por grupos.

<a id="src-md04-l0286"></a>

#### 20.7.3. Ordenación, líderes y empate

*Origen: MD04 §5.3.*

Se puede ordenar por cualquier columna disponible, manteniendo convocados y estados. Un empate en un liderazgo se muestra como empate o con una regla de presentación explícita; no se fabrica un desempate deportivo para declarar un protagonista único.

El líder en VAL se denomina líder en valoración. La decisión vigente utiliza líderes por criterio y no adopta una nota integral de MVP. Una futura selección editorial adicional requeriría una decisión propia; no se introduce una nota 1–10 ni un promedio general nuevo.

<a id="src-md04-l0292"></a>

#### 20.7.4. Valoración propuesta

*Origen: MD04 §5.4.*

La referencia elegida para la valoración de acta es la base utilizada por ACB:

`VAL = PTS + RT + AS + REC + TAP + FR − (TCI − TCC) − (TLI − TLC) − PER − TREC − FC`

No se aplica el bonus de victoria de un juego de fantasía. El origen de esa referencia figura en el [anexo de origen MD04 C](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#cap-33). Si el perfil de faltas o asistencias cambia entre ediciones, la fórmula puede mantenerse mientras cambian legítimamente sus entradas; la versión debe permitir explicarlo.

Su utilidad es resumir producción registrada en el acta. Sus límites son claros: no mide exhaustivamente defensa posicional, calidad de decisiones, pantallas, ayudas, cierre para un compañero o dificultad del contexto. Un VAL menor no prueba un peor partido en todas esas facetas.

<a id="grupo-20-08"></a>

### 20.8. Catálogo colectivo y filas de equipo

*Procedencia: MD04, §6.*

<a id="src-md04-l0304"></a>

#### 20.8.1. Total y colectivo no son la misma fila

*Origen: MD04 §6.1.*

Se proponen tres niveles de lectura:

1. Filas individuales.
2. Fila **equipo/colectivo**, para hechos que la política atribuye al equipo y no a un jugador.
3. Fila **total**, para el resultado conjunto.

Un rebote colectivo no se asigna al jugador más cercano para cuadrar la suma. Una pérdida por una infracción colectiva no se adjudica al base para que todas las casillas tengan dueño individual. Los hechos de banquillo o entrenador se conservan con el sujeto correspondiente.

<a id="src-md04-l0314"></a>

#### 20.8.2. Catálogo del equipo

*Origen: MD04 §6.2.*

| ID | Campo/grupo | Definición o conexión |
|---|---|---|
| E01 | Puntos anotados/recibidos | Marcador válido; separa adjudicación administrativa si existe. |
| E02 | Diferencia final | Anotados − recibidos. |
| E03 | Puntos por periodo | Todos los cuartos y todas las prórrogas. |
| E04 | Tiros de dos/tres/libres | Suma de intentos y aciertos acreditados; porcentajes recalculados. |
| E05 | Tiros de campo | Dos + tres; sin libres. |
| E06 | Rebotes individuales | Suma de RO y RD de los jugadores. |
| E07 | Rebotes de equipo | RO/RD colectivos según política. |
| E08 | Rebotes totales | Individuales + colectivos elegibles. |
| E09 | Asistencias | Suma de créditos individuales válidos. |
| E10 | Pérdidas individuales/colectivas | Presentación separada y total conciliado. |
| E11 | Robos y tapones | Suma de créditos ligados a hechos rivales. |
| E12 | Tapones recibidos | Relación con los intentos propios y los tapones rivales. |
| E13 | Mates | Suma de mates convertidos. |
| E14 | Faltas | Jugadores, banquillo/entrenador y contadores reglamentarios diferenciados. |
| E15 | Faltas recibidas | Créditos estadísticos pertinentes, no copia del total rival. |
| E16 | Valoración colectiva | Agregación según fórmula y créditos colectivos aplicables. |
| E17 | Puntos del banquillo | Producción de quienes no fueron titulares al inicio. |
| E18 | Puntos en pintura | Canastas de campo clasificadas en pintura. |
| E19 | Puntos en transición/contraataque | Contexto deportivo y convención declarada. |
| E20 | Puntos tras pérdida | Producción del ataque elegible originado por una pérdida rival. |
| E21 | Segundas oportunidades | Producción después de rebote ofensivo en la misma continuidad. |
| E22 | Posesiones | Conteo deportivo definido en el apartado 14. |
| E23 | Eficiencias y ritmo | Cálculos por oportunidades y tiempo. |
| E24 | Evolución | Máximas ventajas, parciales, empates, cambios de líder y tiempo por estado. |
| E25 | Uso táctico | Frecuencias y resultados de disposiciones, familias, defensa y saques. |
| E26 | Rotaciones | Quintetos, grupos, tramos y on/off. |

<a id="src-md04-l0345"></a>

#### 20.8.3. Campos que no se suman entre jugadores

*Origen: MD04 §6.3.*

El total de equipo no suma porcentajes, promedios, eficiencias individuales ni on/off. Cada uno se calcula desde las magnitudes colectivas correspondientes.

La suma del más-menos individual tampoco es el margen final: si siempre hay cinco jugadores en pista para cada equipo en cada anotación, equivale a cinco veces ese margen. La columna total debe mostrar el margen de equipo o «no aplicable», con etiqueta clara.

La valoración colectiva puede diferir de la suma de VAL individuales si existen rebotes o pérdidas colectivos, créditos especiales o sanciones atribuidas al equipo. Debe verse una conciliación, no un total aparentemente arbitrario.

<a id="src-md04-l0353"></a>

#### 20.8.4. Gancho hacia comparación

*Origen: MD04 §6.4.*

Cada grupo del equipo podrá compararse con el rival del partido, con encuentros del mismo equipo, con un tramo de temporada y con una referencia de competición. Una referencia de liga indica sus partidos incluidos y su política de cálculo; no mezcla categorías con reglas o niveles diferentes sin mostrarlo.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c20-p01-unidad-de-finalizacion-de-tiro](c20-p01-unidad-de-finalizacion-de-tiro.md) · Siguiente: [c20-p03-atribucion-que-hecho-produce-cada-registro](c20-p03-atribucion-que-hecho-produce-cada-registro.md)
