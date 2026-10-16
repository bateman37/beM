<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: validacion](README.md) · Capítulo 28 — Auditorías y criterios de aceptación · parte 2 de 4
> Anterior: [c28-p01-poblacion-modalidades-y-conservacion](c28-p01-poblacion-modalidades-y-conservacion.md) · Siguiente: [c28-p03-auditorias-y-casos-de-aceptacion](c28-p03-auditorias-y-casos-de-aceptacion.md)
<!-- beM:nav-fin -->

<a id="grupo-28-04"></a>

### 28.4. Conciliaciones y aceptación del catálogo

*Procedencia: MD04, §34.*

<a id="src-md04-l1938"></a>

#### 28.4.1. Conciliaciones obligatorias del diseño

*Origen: MD04 §34.3.*

| Área | Criterio que debe cumplirse |
|---|---|
| Marcador | Suma de anotaciones válidas = puntos de cada equipo. |
| Periodos | Suma de cuartos y prórrogas = resultado, salvo adjudicación administrativa separada. |
| Tiros | Aciertos ≤ intentos; TCC/TCI = dos + tres. |
| Puntos individuales | Producción normal = 2 × T2C + 3 × T3C + TLC; créditos especiales identificados. |
| Equipo | Créditos individuales + colectivos aplicables = total correspondiente. |
| Rebotes | Individuales + colectivos = total; excepciones sin rebote explícitas. |
| Robos | Cada REC tiene pérdida rival compatible; no se exige REC = PER rival. |
| Tapones | TAP y TREC corresponden al mismo intento elegible. |
| Asistencias | Cada AS tiene finalización/serie elegible; no se impone AS ≤ canastas para todo perfil. |
| Faltas | FC, FR, bonus y disciplina se concilian por política, no por igualdad universal. |
| Minutos | Suma de presencia = integral de jugadores activos por tiempo. |
| Más-menos | Se asigna por presencia en cada anotación; suma individual = 5 × margen si siempre hay cinco. |
| Posesiones | Continuaciones no duplican unidades; cierres tienen causa. |
| Puntos vinculados | Vinculados + administrativos separados = puntos totales. |
| Tasas | Numerador y denominador pertenecen al mismo universo. |
| Categorías | Solo ejes excluyentes deben sumar total; mixtos/desconocidos visibles. |
| Porcentajes | Agregados desde conteos, no desde medias de porcentajes redondeados. |
| Ventaja temporal | Delante A + delante B + empatado = duración de juego. |
| Resumen | Todas las cifras y momentos enlazan con hechos de la misma versión. |
| Modalidades | Entradas deportivas equivalentes mantienen desarrollo y catálogo. |

Son criterios funcionales para valorar el futuro producto. Esta especificación no afirma haber ejecutado partidos ni haber superado pruebas de un motor que todavía no se construye.

<a id="src-md04-l1965"></a>

#### 28.4.2. Casos de aceptación de lectura

*Origen: MD04 §34.4.*

Se considera cubierto funcionalmente el catálogo cuando permite explicar un partido con rebotes ofensivos, pérdidas sin robo, presión que impide iniciar familia, acciones encadenadas, cambios de plan, libres administrativos, sustitución entre libres cuando sea reglamentariamente válida, prórroga, faltas/retiradas y contribuciones sin balón registradas.

La revisión futura debe hacerse sobre partidos completos y distintos equipos. Las cifras deben reflejar diferencias plausibles de capacidades, estilos, director y oposición, sin exigir que una elección gane siempre ni que todos los atributos produzcan un contador propio.

<a id="grupo-28-05"></a>

### 28.5. Casos de atribución que debe cubrir el diseño

*Procedencia: MD04, anexo B.*

<a id="src-md04-l2117"></a>

Esta lista es un catálogo funcional de revisión, no una batería de código ni una instrucción para empezar por una acción aislada. Los criterios normativos sensibles consultan el perfil elegido. Los ejemplos garantizan que las relaciones necesarias no queden fuera del diseño.

| ID | Situación | Qué debe poder explicar y conciliar |
|---|---|---|
| C01 | Canasta normal de dos | T2, puntos, marcador, sector, presencia y origen de ataque. |
| C02 | Canasta normal de tres | T3 y valor final; revisión si cambia. |
| C03 | Fallo de campo con control rival | Intento, fallo, crédito de rebote elegible y cierre. |
| C04 | Fallo de campo con rebote ofensivo | Mismo ataque, RO y nueva oportunidad/finalización. |
| C05 | Dos rebotes ofensivos consecutivos | Una posesión; varios fallos/capturas; puntos posteriores sin duplicación. |
| C06 | Falta durante finalización fallada | Aplicar criterio de intento del [MD04 §8](../estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md#cap-20); causa y serie. |
| C07 | Canasta con sanción adicional | Un tiro de campo; serie vinculada; presencia efectiva en cada anotación. |
| C08 | Libre administrativo intercalado | Puntos y causa separados de una familia que no lo generó. |
| C09 | Libre repetido por infracción | Validez de cada intento; no sumar automáticamente todos los lanzamientos físicos. |
| C10 | Fallo de libre dentro de una serie | No resolver una disputa inexistente; consultar continuidad de la serie. |
| C11 | Último libre con balón vivo | Resultado y control posterior según perfil. |
| C12 | Libres con saque retenido | Continuidad especial y puntos vinculados/administrativos según política. |
| C13 | Tiro bloqueado que queda en ataque | TAP/TREC, intento, destino y continuidad. |
| C14 | Tiro bloqueado que controla defensa | Créditos, control y apertura del ataque rival; no robo automático. |
| C15 | Contacto sancionado en intento de tapón | Validación de tiro/falta; no premiar un TAP incompatible. |
| C16 | Balón desviado, mismo ataque | Desvío sin PER/REC si no hay cambio elegible. |
| C17 | Desvío de un defensor, captura de otro | Causante del robo y captor como sujetos distinguibles. |
| C18 | Error de pase sin intervención defensiva | PER sin REC inventado. |
| C19 | Error de recepción | Responsabilidad real; no atribución automática al pasador. |
| C20 | Pérdida en bote | Sujeto, causa, presión y eventual robo. |
| C21 | Infracción colectiva de reloj | Crédito colectivo si corresponde; familia no iniciada separada. |
| C22 | Falta ofensiva en pantalla | FC/PER según política y ejecución iniciada; no pantalla útil simultánea incompatible. |
| C23 | Balón fuera del mismo ataque | Reanudación, reloj y continuidad. |
| C24 | Balón fuera con cambio de derecho | Causa de cierre y crédito que corresponda; no robo al ejecutar el saque. |
| C25 | Balón retenido con alternancia | Flecha, sujetos y efecto estadístico del perfil. |
| C26 | Toque antes de captura de rebote | No varias capturas por varios contactos. |
| C27 | Rebote colectivo | Crédito de equipo y total, sin captor ficticio. |
| C28 | Fallo al final de periodo | Causa de cierre y excepción de rebote aplicable. |
| C29 | Pase elegible con canasta | Candidato y crédito único de asistencia. |
| C30 | Pase que desemboca en serie elegible | Separar AS a libres de AS a canasta según apartado 9. |
| C31 | Pase seguido de nueva creación | Información de recepción/creación para aplicar política. |
| C32 | Fallo, RO y canasta posterior | No arrastrar un candidato de asistencia cerrado. |
| C33 | Pase creador con fallo | Oportunidad registrada sin AS oficial por una canasta inexistente. |
| C34 | Pantalla útil y pase de otro | Contribución compartida, sin dos AS oficiales ni reparto inventado de mérito. |
| C35 | Ayuda y pase a tirador exterior | Cadena, responsabilidad final y contexto previo. |
| C36 | Cambio defensivo y continuación al poste | Una posesión de origen, varias ejecuciones y oposición actualizada. |
| C37 | Presión impide organizar | Posesión interrumpida en avance; no fracaso atribuido a familia prevista. |
| C38 | Presión superada con ventaja | Duración pertinente, contexto resultante y continuación. |
| C39 | Cambio de plan dentro de ataque | Planes activos por hecho y categoría mixta para tasas estables. |
| C40 | Cambio entre libres | Más-menos por anotación, tiempo real y unidad mixta. |
| C41 | Entrada sin consumo de reloj | Participación distinta de DNP; tasas temporales no calculables. |
| C42 | Retirada por falta o descalificación | Contadores, causa y reorganización efectiva. |
| C43 | Sanción de entrenador/banquillo | Sujeto real, bonus y disciplina según perfil; no jugador infractor inventado. |
| C44 | Lesión | Momento y salida, sin estadísticas deportivas creadas por la lesión. |
| C45 | Revisión de triple a dos | Marcador, acta, mapa, más-menos, parciales y resumen actualizados. |
| C46 | Tiro anulado por fuera de tiempo | No crédito válido en porcentajes; orden y revisión conservados. |
| C47 | Interferencia o canasta concedida | Créditos especiales del perfil y conciliación con intento/puntos. |
| C48 | Anotación extraordinaria en canasta propia | Política específica; no atribuirla por intuición a un tirador del otro equipo. |
| C49 | Inicio de periodo | Derecho/control y plan activo; sin unidad vacía automática. |
| C50 | Final sin tiro para gestionar ventaja | Cierre y tiempo consumido; no PER automática ni intento ficticio. |
| C51 | Una prórroga | Periodo separado, duración real y denominadores ajustados. |
| C52 | Varias prórrogas | Desglose de cada una y total consistente. |
| C53 | Empate y nuevo líder | Convención de cambios de líder sin contar el 0–0 inicial. |
| C54 | Varias anotaciones con mismo reloj | Orden estable; curva, más-menos y tiempo de ventaja coherentes. |
| C55 | Parcial que cruza un cuarto | Política global y filtro de periodo visibles. |
| C56 | Transición y segunda oportunidad solapadas | Etiquetas sin duplicar marcador ni sumar puntos como categorías exclusivas. |
| C57 | Rival no revela plan privado | Tendencia observada distinta de prioridad interna conocida. |
| C58 | Tiro cómodo fallado/forzado convertido | Contexto no reclasificado por resultado. |
| C59 | Capacidad alta con mala forma | Rendimiento observado sin reescribir capacidad ni diagnosticar causa desde una casilla. |
| C60 | Veterano con aportaciones de lectura | Funciones registradas sin bonus ficticio de experiencia. |
| C61 | Partido del mundo sin relato | Mismo acta y análisis ofrecido desde hechos deportivos. |
| C62 | Historial con cobertura reducida | Campo no registrado distinto de cero; filtros compatibles. |
| C63 | Suspensión y continuación | Identidad común, datos parciales y cierre posterior. |
| C64 | Resultado administrativo | Resultado oficial separado de lo realmente disputado. |
| C65 | Corrección de acta tras final | Revisión y actualización de históricos/derivados. |

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c28-p01-poblacion-modalidades-y-conservacion](c28-p01-poblacion-modalidades-y-conservacion.md) · Siguiente: [c28-p03-auditorias-y-casos-de-aceptacion](c28-p03-auditorias-y-casos-de-aceptacion.md)
