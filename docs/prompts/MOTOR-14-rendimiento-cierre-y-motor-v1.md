# MOTOR-14 — Rendimiento, cierre funcional y candidato a motor v1

**Destinatario:** Claude Code, con acceso al repositorio `bateman37/beM`.

**Encargo:** implementar la última entrega del roadmap del motor y preparar su aceptación por Dennis. Trabaja sobre el funcional vigente, el inventario real de MOTOR-13 y este prompt. Esta entrega reúne cierre de carencias, equivalencia, continuación, coste y contrato de integración; no inicia el manager.

**Origen:** diseño funcional unificado, roadmap y notas de cierre de MOTOR-13 facilitadas por Dennis. Este prompt no afirma haber inspeccionado el código de la PR #14. Los adjuntos históricos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen la especificación de beM.

## Índice

1. [Mandato y reglas de trabajo](#m14-01)
2. [Base real y comprobación inicial](#m14-02)
3. [Resultado esperado y orden de ejecución](#m14-03)
4. [Inventario de cierre y cobertura del funcional](#m14-04)
5. [Registro de las siete capacidades pendientes](#m14-05)
6. [Análisis, estados y recomendaciones heredadas](#m14-06)
7. [Administración reglamentaria y fuentes](#m14-07)
8. [Disponibilidad e inferioridad en el flujo natural](#m14-08)
9. [Tiro pendiente, señales e interferencia](#m14-09)
10. [Guardar, suspender y continuar un encuentro](#m14-10)
11. [Equivalencia de modalidades y presentación](#m14-11)
12. [Contrato reutilizable para el manager](#m14-12)
13. [Conservación, privacidad y formatos](#m14-13)
14. [Medición del coste](#m14-14)
15. [Optimización sobre los puntos medidos](#m14-15)
16. [Campaña común y presupuesto de verificación](#m14-16)
17. [Auditorías y evaluación final](#m14-17)
18. [Panel y recorrido integrado](#m14-18)
19. [Versiones, compatibilidad y referencia](#m14-19)
20. [Pruebas automáticas esenciales](#m14-20)
21. [Recorrido manual de Dennis](#m14-21)
22. [Documentación y paquete de cierre](#m14-22)
23. [Criterios de aceptación y estado de v1](#m14-23)
24. [Informe final y entrega en GitHub](#m14-24)

<a id="m14-01"></a>

## 1. Mandato y reglas de trabajo

Construye el cierre del mismo motor que ya produce partidos completos. Debe seguir sintiéndose como baloncesto jugado posesión a posesión, mediante acontecimientos e interacciones pertinentes. Mantén el contexto activo pequeño y el historial fuera del cálculo deportivo inmediato.

Reglas obligatorias:

- Trabaja exclusivamente en beM. No inspecciones `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios. Las ideas históricas ya están trasladadas al funcional.
- No añadas ticks, simulación por segundos o milisegundos, coordenadas continuas, movimiento permanente de diez jugadores ni un simulador deportivo alternativo.
- Las tres modalidades, los lotes y el futuro manager usan el mismo núcleo. El registro y la presentación pueden costar menos; el baloncesto no se sustituye por un marcador o acta aproximados.
- Mantén las 32 capacidades, sus ámbitos y la escala 1–30. No introduzcas un overall, nuevas habilidades, bonus universal de experiencia, reputación, edad, química o localía.
- Conserva decisiones, orden de sorteos y resultados cuando el cambio sea solo de coste, lectura o presentación. Una corrección deportiva justificada se identifica y versiona por separado.
- Usa el panel y perfiles para parámetros deportivos y de auditoría. Una regla normativa requiere un perfil coherente; no conviertas toda condición de programa en una fórmula editable o código ejecutable desde la UI.
- Completa comportamientos ya decididos. No devuelvas como «decisión deportiva pendiente» lo que está fijado en el funcional. Los detalles técnicos reversibles se resuelven dentro del encargo.
- No conviertas una función obligatoria ausente en «simplificación aceptada» por falta de tiempo. Si existe una contradicción real, conserva sus referencias y limita el bloqueo al punto afectado.
- Mantén los originales, referencias, perfiles congelados, evidencia y archivos históricos. No hagas migraciones silenciosas ni restaures datos del usuario para actualizar la versión.
- Pruebas automáticas esenciales y reutilizables; Dennis hará mucho test manual. No escribas un test por tabla, ficha, capacidad o combinación.
- No cambies stack, base de datos, infraestructura ni despliegue. PostgreSQL del proyecto no es una razón para migrar ahora todo el laboratorio.
- Todos los prompts para Claude Code se entregan y archivan en Markdown, con índice y estado.
- No fusiones, publiques una versión, crees una etiqueta de release, te suscribas a la PR ni envíes mensajes a terceros.

El tamaño orientativo sigue siendo aproximadamente la mitad de una ventana de cinco horas. No inventes consumo de cuota ni una garantía de duración. Ejecuta todo el trabajo autorizado que puedas cerrar correctamente y deja un punto de continuación preciso si aparece un límite real. No recortes requisitos para poder escribir «motor completo».

<a id="m14-02"></a>

## 2. Base real y comprobación inicial

### 2.1 Rama de partida

Las notas sitúan MOTOR-13 en la PR `bateman37/beM#14`, abierta contra `main`, sin fusionar. No supongas que se fusionó por haber recibido este encargo.

1. Inspecciona estado de trabajo, instrucciones raíz, rama y commits reales, preservando cambios ajenos.
2. Si `main` ya incluye MOTOR-13, parte de esa base actualizada.
3. Si no lo incluye, pero su rama está disponible, trabaja desde el commit real de MOTOR-13 e identifica la dependencia de la PR. No lo fusiones por tu cuenta.
4. Si la base necesaria no está disponible, registra la dependencia concreta. No reconstruyas MOTOR-13 desde el resumen ni empieces encima de una versión que carezca de sus auditorías.

Rama sugerida: `feature/MOTOR-14-cierre-y-rendimiento`, o la impuesta por el entorno. Registra base, rama efectiva y relación con la PR anterior.

### 2.2 Estado declarado que debes verificar

| Área | Declaración del cierre de MOTOR-13 |
|---|---|
| Referencia | Semilla `20261016`, 83–103, 6.505 sorteos, misma huella de trayectoria. |
| Validación | 170 pruebas, `data:check` y comprobación documental correctos. |
| Auditorías | 15 conformes, 16 inconclusas, AUD29 no evaluada; ningún defecto abierto en aquella evaluación. |
| Capacidades | 25 con uso registrado en recetas; otras siete utilizadas sin entradas contrastables. |
| Registro pendiente | TEC17, TEC18, MEN02, MEN03, MEN06, MEN07 y FIS06. |
| Exposición | Nueve de veinte ESP observados; energía inferior a diez no expuesta en AUD17. |
| Calibración | Base mantenida, sin cambiar filas. Sin candidata real ni ejecución de la reserva de validación. |
| Referencias externas | Ninguna referencia numérica extraída; fuentes candidatas bloqueadas para Claude. |
| Coste observado | Aproximadamente 5,9 s por partido completo de diagnóstico y 1,2 s por reducido en aquel entorno. |
| Lector | Corregida doble contabilización de quintetos con los mismos jugadores en puestos distintos y filas con puntos sin tiempo. `quintetos.csv` incorpora `lineup_ids`. |
| Auditor | Corregidos falsos positivos de AUD07, AUD13 y AUD26. |
| Variantes | `allowBaseOps`, desactivada por defecto. En un contraste de extremos V0 puede estar modificada. |

Son declaraciones de partida. Distingue lo leído en informes de lo comprobado directamente. Conserva las regresiones anteriores y verifica sus causas, no solo sus resultados en verde.

### 2.3 Evidencia ausente y simulaciones ya realizadas

MOTOR-13 ejecutó doce contrastes × dos variantes = 24 encuentros, repitió esos 24 después del arreglo del lector y ejecutó seis encuentros reducidos adicionales desde la UI: 54 ejecuciones declaradas. Su campaña lógica de evaluación sigue siendo la de 24 encuentros; las repeticiones no son una muestra independiente de 48.

Los diez partidos de cierre de MOTOR-12 no estaban en su entorno. Si tampoco están ahora, no declares haberlos leído ni los reconstruyas por inercia. Busca evidencia de MOTOR-13 en las ubicaciones declaradas; `out/` no se versiona. Si faltan los originales, conserva el informe como evidencia declarada y genera solo lo necesario para este cierre.

### 2.4 Lectura dirigida

Lee primero normas raíz, índice, estado, roadmap y `docs/tecnico/motor13.md`, especialmente su §14. Después abre los epígrafes temáticos pertinentes y el productor exacto que corresponda.

Referencias principales del unificado: capítulos 18, 19, 24, 26–30. Para una carencia de táctica, capacidad o análisis, consulta su capítulo y prompt de origen antes de cambiarla. Revisa los pendientes concretos de `motor09.md`, `motor10.md` y `motor11.md` cuando estén relacionados.

No releas el megaarchivo completo en cada fase. Mantén el texto íntegro de referencia y usa sus secciones e índices para consultas dirigidas.

<a id="m14-03"></a>

## 3. Resultado esperado y orden de ejecución

La entrega debe permitir preparar, dirigir o delegar, guardar y continuar, revisar, ajustar, comparar y exportar partidos y lotes. Debe dejar el núcleo utilizable por el futuro manager, con coste medido y cobertura comprobable.

Trabaja en este orden, con commits de bloques revisables dentro de la misma entrega:

| Orden | Bloque | Resultado concreto |
|---|---|---|
| 1 | Inventario y referencia | Requisitos trazados, baseline comprobado y huecos reales identificados. |
| 2 | Instrumentación y lectura | Siete capacidades registradas; análisis y permisos sin hechos inventados. |
| 3 | Administración y continuidad | Pendientes reglamentarios implementados donde estén especificados; inferioridad y acciones pendientes conectadas al flujo común. |
| 4 | Guardado y equivalencia | Continuación real, mismo desarrollo en modalidades y AUD29 ejecutable. |
| 5 | Contrato de integración | Fachada reutilizable sobre el núcleo y persistencia desacoplada de la UI. |
| 6 | Medición y optimización | Comparación de coste sobre la misma versión deportiva y evidencia de neutralidad. |
| 7 | Cierre integrado | Campaña común, informe, documentación temática y candidato a v1. |

No optimices extensamente una ruta que después debas reemplazar para corregirla. Toma un baseline inicial; para medir una optimización posterior, compara antes/después sobre el mismo comportamiento deportivo corregido.

Esta es la última entrega planificada, no una autorización para ocultar deuda ni una obligación de añadir mecánicas nuevas para justificar el número 14.

<a id="m14-04"></a>

## 4. Inventario de cierre y cobertura del funcional

### 4.1 Una matriz de requisitos verificables

Convierte el §14 de MOTOR-13 en un inventario operativo y complétalo contra el funcional y el roadmap. Para cada requisito conserva:

- ID estable, referencia y decisión vigente.
- Implementación y contenido que lo hacen ejecutable.
- Entrada, operación pertinente y salida o hecho conservado.
- Pantalla/consulta/exportación que lo utiliza.
- Estado de implementación, cobertura del registro, exposición y evidencia de verificación.
- Carencia, impacto, corrección aplicada y riesgo residual, si existen.
- Revisión automática, de Claude o manual de Dennis, diferenciadas.

No uses una sola casilla «hecho» para resumir todos esos ejes. «Implementado sin exposición» y «no implementado» son estados distintos. Un índice de archivos no prueba que un comportamiento funcione.

### 4.2 Los 81 grupos y cuatro soportes

| Familia | Grupos funcionales que deben reconciliarse |
|---|---:|
| SEL | 12 |
| DEF | 9 |
| RES | 13 |
| ACT | 12 |
| ENT | 7 |
| MEM | 4 |
| CON | 4 |
| POB | 3 |
| EST | 8 |
| REF | 2 |
| LAB | 1 |
| COR | 2 |
| REG | 4 |
| **Total** | **81** |
| SUP01–SUP04 | **4 soportes adicionales** |

Son grupos semánticos, no 85 tablas físicas obligatorias. Reutiliza las estructuras reales y conserva la correspondencia. Una fila sin consumidor no cierra cobertura.

### 4.3 Contenido que no puede perderse

Comprueba el inventario vigente, sin inventar un segundo catálogo:

- 32 capacidades, cuerpo y tendencias; tres tablas funcionales y TAR01–TAR17.
- Siete estilos ofensivos con cinco niveles, seis disposiciones, roles y director, prioridades 1–5 y varias fichas en una prioridad.
- Seis organizaciones defensivas, tres alturas de presión, cuatro coberturas y las tres especiales del catálogo aprobado.
- POS01–POS15, CONT01–CONT09, ESP01–ESP20; seis saques ofensivos y seis respuestas defensivas.
- Tres políticas de entrenador, rotación con histéresis, librillo de faltas, finales y memoria pequeña de rutas A/B.
- Energía, Forma, tres momentos individuales, Consistencia, presión y momento colectivo T con ámbitos y presupuestos separados.
- Doce equipos de doce plazas, generador, variantes, escenarios y edición +1/+3/+5.
- Tres modalidades, cuatro velocidades, dirección, acta, análisis, resumen, panel, lotes y extracción completa.
- Perfil reglamentario, revisiones, conservación, reproducción, auditorías y permisos.

Mantén las correspondencias confirmadas de MOTOR-11: DIS02 = cuatro abiertos y un interior; DIS03 = tres abiertos y dos interiores; COB03 = salir y recuperar; EQ07 busca media distancia.

### 4.4 Pendientes mínimos a contrastar

Incluye expresamente los siete registros de capacidades; AUD29; energía inferior a diez; once ESP no observados; fuentes y rutas reglamentarias heredadas; inferioridad natural; tiro pendiente e interferencia; guardado/continuación; asistencias con ruptura causal; estado propio por tramo; REC10-01/02; filtros e informes; referencias y coste.

Que un pendiente no reaparezca en el último resumen no demuestra que se haya cerrado. Una simplificación ya aceptada —por ejemplo lateralidad desconocida donde no se resolvió— conserva su estado y motivo, sin convertirse ahora en un proyecto geométrico.

<a id="m14-05"></a>

## 5. Registro de las siete capacidades pendientes

### 5.1 Instrumentar el cálculo existente

El informe dice que estas capacidades se usan. Primero localiza el consumidor efectivo y registra sus entradas y contribuciones; no añadas otro efecto para que aparezcan en la auditoría.

| Capacidad | Qué debe poder verse cuando interviene |
|---|---|
| TEC17 — Cierre de rebote | Participantes, acceso/disputa, contribución al cierre y efecto colectivo, separado de quién captura. |
| TEC18 — Captura de rebote | Candidatos elegibles, condiciones de captura, contribución y elección/control resultante. |
| MEN02 — Visión | Opciones existentes y cuáles percibe, con contexto y regla usada; no precisión ficticia del pase. |
| MEN03 — Decisiones | Elección entre opciones percibidas, criterios y restricciones; no una bonificación universal de ejecución. |
| MEN06 — Consistencia | Parámetro de amplitud, innovación ya utilizada, límites, probabilidad anterior y posterior cuando corresponda. |
| MEN07 — Rendimiento bajo presión | Contexto/importancia, exposición, aportación y ámbito sobre el que actúa. |
| FIS06 — Resistencia | Intervalo y carga resuelta, gasto/recuperación pertinente y efecto de Resistencia sin modificar el talento base. |

Las etiquetas se corresponden con el diccionario actual; usa sus IDs exactos. Si el consumidor real tiene otro contrato, documenta la correspondencia y corrige la discrepancia de registro.

### 5.2 Registro proporcional

Cada evaluación conserva identidad de partido, evento/tarea, sujeto, receta/función y versión, entradas pertinentes y resultado del cálculo utilizado. Las referencias compartidas al perfil congelado evitan copiar todas las fichas en cada decisión.

- El registro completo contiene el detalle necesario para el contraste contextual.
- El reducido conserva los hechos y relaciones necesarios para los productos ofrecidos, e identifica qué detalle diagnóstico omite.
- No calcules alternativas adicionales dentro de la simulación solo para rellenar una traza.
- No añadas sorteos, nuevos cálculos de percepción ni perturbaciones al activar el registro.
- Si una operación no es binaria, conserva su resultado real: conjunto reconocido, puntuaciones, distribución, ganador o delta de estado. No le inventes una probabilidad de acierto.

### 5.3 Contraste +1/+3/+5

Extiende el mecanismo de MOTOR-13 para usar el mismo cálculo puro del productor, con contexto e innovaciones fijos. Una evaluación hipotética posterior se identifica como tal y no se incorpora al acta ni al relato.

Para Visión y Decisiones muestra cambios de opciones y elección si los hay. Para Resistencia, cambios en gasto/estado bajo el mismo intervalo. Para Consistencia, amplitud y salida bajo la misma innovación; no se exige una mejora monotónica de cada realización. Conserva neutralidad media del mecanismo conforme a la prueba ya definida.

No dupliques la fórmula en el auditor. Si hace falta extraer una función compartida del productor, haz esa extracción local y comprueba que mantiene sus resultados. Reutiliza el muestreo determinista y estratificado de MOTOR-13, sin leer cada paquete 32 veces.

### 5.4 Cierre de las 32

La matriz final debe distinguir para cada capacidad: consumidor comprobado, registro disponible, exposición observada y contraste ejecutado. No declares «32 contrastadas» si alguna no aparece en la evidencia utilizada.

La falta de exposición se cubre con un contexto válido ya producido o un escenario identificado que utilice la misma operación del motor. No simules cientos de encuentros esperando que ocurra. Una comprobación contextual no se presenta como validación poblacional de rendimiento.

Conserva MEN02/MEN03/MEN04 defensivas donde ya intervengan; banquillo atenuando hacia neutral sin ruido; presión ordinaria SEM y límites de T. No recalibres esos mecanismos aprovechando la instrumentación.

<a id="m14-06"></a>

## 6. Análisis, estados y recomendaciones heredadas

### 6.1 Quintetos y posesiones mixtas

Conserva las correcciones de MOTOR-12/13. La identidad de un conjunto de jugadores y sus disposiciones/puestos tienen relaciones distintas. No dupliques producción porque cambia el orden de los mismos jugadores; tampoco descartes puntos válidos de un tramo sin tiempo transcurrido.

`lineup_ids`, presencia y universos mixtos deben seguir conciliando en pantalla, JSON y CSV. Un arreglo del lector no cambia la trayectoria. No exijas que la suma de posesiones completas atribuidas a cada cinco replique un total que incluye posesiones mixtas tratadas aparte.

### 6.2 Estado propio por tramo

Completa la consulta histórica propia comprometida mediante el estado inicial y transiciones realmente registradas. Energía con su precisión autorizada; Forma y momentos mediante las categorías de su política. El diagnóstico puede conservar valores internos.

Consultar el estado a mitad de un intervalo no actualiza el partido ni consume azar. Usa la evolución determinista realmente aplicable si está conservada; si solo hay muestras en fronteras, muéstralas como muestras y no inventes una interpolación continua. Forma permanece estable durante el partido según la decisión vigente.

No basta mostrar el último estado final en todas las filas históricas. El rival y el entrenador automático reciben solo su vista permitida.

### 6.3 Asistencias y vínculo causal

Revisa el productor del candidato de asistencia y la política ya definida en MOTOR-09/10. Conserva recepción, origen de ventaja representada, mantenimiento o ruptura, creación autónoma posterior y causa de cierre cuando esas interacciones se resuelvan.

La distinción procede de operaciones efectivas: no de contar botes que no se modelaron, ni de reducir asistencias porque el porcentaje parezca alto. Un pase, un tiro y una canasta próximos no bastan para inventar una relación causal no registrada.

Si el motor ya resuelve una intervención que cambia destinatario o rompe la ventaja, conserva ese hecho. Si no existe esa interacción, no sortees desviaciones ni clasifiques a posteriori un pase normal como desviado. Localiza exactamente qué comportamiento comprometido falta y complétalo con la tarea compartida que corresponda, sin una segunda física del balón.

El capítulo 6 del manual estadístico F14-03 sirve para contrastar la política; el criterio debe quedar versionado. Los hechos antiguos conservan su cobertura y convención; no se rellenan con relaciones supuestas. La asistencia a una serie elegible se acredita según la política, una sola vez cuando corresponda.

### 6.4 REC10-01 y REC10-02

Comprueba las implementaciones reales y cierra sus diferencias respecto al prompt MOTOR-10:

- REC10-01: revisar una salida negada y considerar una variante disponible utilizando alternativas efectivamente registradas y autorizadas. Mantén las condiciones de exposición declaradas allí.
- REC10-02: revisar carga y balance mediante fallos propios y transiciones rivales causalmente enlazadas, mostrando también el rebote ofensivo en ese universo.

No sustituyas ambas por la misma recomendación genérica. Sin evidencia o permiso suficientes, informa de la insuficiencia; no revela una alternativa privada ni promete el resultado que habría producido otro plan.

### 6.5 Productos pendientes

Revisa fórmulas, filtros, categorías, informes, CSV, JSON y Markdown contra el inventario. «Cuota de cierres» y producción por 100 con presencia completa ya se incorporaron en MOTOR-11: conserva sus universos. La lateralidad desconocida sigue siendo desconocida; no se reparte estadísticamente entre izquierda y derecha.

El resumen usa evidencia y umbrales editoriales identificados. No convierte una señal del auditor en un consejo público de juego ni una correlación antes/después en un efecto causal garantizado.

<a id="m14-07"></a>

## 7. Administración reglamentaria y fuentes

### 7.1 Un solo administrador coherente

Revisa las 19 filas normativas y las rutas que en MOTOR-09 aún no pasaban por la matriz: faltas ofensivas, relojes y ventanas. Toda administración comprometida debe tener una correspondencia normativa y un consumidor ejecutable, aunque internamente use funciones tipadas comunes.

No es necesario convertir la matriz en un lenguaje de programación. Sí debe ser posible saber qué condición se aplica, qué artículo la respalda, sus contadores, consecuencia y reanudación. La generación deportiva de una incidencia y la consecuencia administrativa permanecen separadas.

Incluye, si siguen incompletas, técnicas con su categoría, disruptivas, flagrantes, descalificación, dobles/compensación, sanciones en cola y correcciones del artículo 45. Un diagnóstico «tipo conocido, sin ejecución» no cierra ese requisito.

### 7.2 Fuentes primarias identificadas

Lectura selectiva realizada para preparar este encargo el 17 de octubre de 2026. No es una revisión exhaustiva del reglamento. Identifica por separado lo contrastado por ChatGPT en este prompt y lo leído directamente por Claude.

| ID | Documento y acceso | Consulta dirigida |
|---|---|---|
| F14-01 | [Official Basketball Rules 2026 v1.1](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf) | Arts. 17, 20–21, 29, 31, 36–45 y oportunidades de cambios/pausas pertinentes. |
| F14-02 | [Official Basketball Rules 2026 — Interpretations v1.0](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-interpretations-v1-0.pdf) | Ejemplos del caso exacto y excepciones, sin mezclar la edición anterior. |
| F14-03 | [FIBA Statisticians’ Manual 2024 v1.0](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-statisticians-manual-2024.pdf) | Créditos y, especialmente, capítulo 6; adaptación declarada al reglamento elegido. |

Los PDF se pudieron consultar desde ChatGPT durante la preparación. Que Claude reciba 403 no demuestra que el documento no exista ni autoriza una regla inventada. Registra fecha, edición, artículo, alcance de la lectura y fuente del extracto.

### 7.3 Recordatorio normativo contrastado para los pendientes heredados

Síntesis selectiva de F14-01, no sustituto del perfil completo:

- Disruptiva/flagrante: dos libres sin acción de tiro; canasta válida y un adicional; tiro fallado, dos o tres. Reanudación delantera opuesta a mesa, con catorce segundos, bajo las condiciones y excepciones correspondientes: 37.2, 38.2, 17.2.7 y 29.2.6.
- Acumulación disciplinaria del jugador: dos técnicas de categoría 1, dos flagrantes o una de cada. No se deduce descalificación automática por dos disruptivas ni una sanción adicional solo por la descalificación acumulada: 36.2.3 y 38.2.3.
- Inferioridad: no se identifica «menos de cinco» con terminación. El artículo 21 contempla menos de dos jugadores listos; diferencia conservar el marcador favorable del beneficiario y adjudicar 2–0 cuando no va por delante.

F14-02, ejemplos 36-4/36-5, confirma que una técnica de categoría 2 no entra en aquella acumulación de categoría 1. Conserva contadores distintos y sujetos de banquillo/entrenador según su regla.

No amplíes esta síntesis a casos que no contiene. Por ejemplo, no resuelve por sí sola el orden completo de compensaciones ni los plazos de corrección.

### 7.4 Completar la correspondencia, sin otra investigación interminable

Usa primero las fuentes y extractos ya conservados en beM. Para los huecos, consulta los artículos concretos y registra su correspondencia con la fila y el caso implementado. Si vuelve el 403, intenta una vía pública oficial alternativa de manera acotada; no repitas descargas fallidas durante toda la entrega.

Una lectura heredada del encargo puede respaldar exactamente el supuesto que describe. No la etiquetes como lectura directa del PDF ni cierres todas las excepciones por extensión. Si falta el texto imprescindible de un caso, identifica artículo, supuesto y consecuencia aún no verificable; continúa los demás bloques. No mantengas indefinidamente un comportamiento improvisado como si fuera conforme.

No introduzcas un generador de mala conducta para cubrir categorías administrativas. El núcleo puede recibir una incidencia disciplinaria explícita y aplicar su administración; la ocurrencia natural utiliza solamente condiciones/frecuencias que el perfil de juego ya haya definido. No crees probabilidades nuevas escondidas ni conviertas poca Concentración en agresividad.

### 7.5 Correcciones

Separa revisión estadística, corrección reglamentaria durante el encuentro y corrección técnica de una versión del software. El artículo 45 no equivale a deshacer cualquier acción pasada.

Cada revisión conserva hecho afectado, causa, autorización/ventana, versión y derivados afectados. Una corrección de lectura invalida y recalcula sus proyecciones; una corrección reglamentaria aplica su propia continuación; un defecto del software no se disfraza de decisión arbitral.

No construyas un sistema de árbitros, protestas, cámaras o competición para cerrar esta administración. Un caso preparado puede comprobar el administrador común, pero no prueba su frecuencia natural.

<a id="m14-08"></a>

## 8. Disponibilidad e inferioridad en el flujo natural

El informe heredado describía un motor natural que exigía cinco elegibles y fallaba sin sustituto. Si continúa así, cierra la ruta real, no solo otro caso preparado.

Cuando una exclusión, descalificación o indisponibilidad deje menos jugadores:

1. Administra la retirada conforme al perfil.
2. Busca sustituto elegible y aplica la ventana pertinente.
3. Si no existe, conserva el número legal de participantes disponibles y sus identidades.
4. Reorganiza tareas solo mediante participantes presentes; una ficha que exige una función ausente queda no realizable o usa una alternativa válida ya declarada.
5. Los accesos defensivos y ofensivos reflejan las ausencias mediante responsabilidades y candidatos, no mediante un jugador fantasma ni un bonus general de inferioridad.
6. Aplica la terminación administrativa cuando corresponda por la regla, separando marcador adjudicado de producción disputada.

El acta, minutos, presencia y conciliaciones admiten el número real de jugadores. No fuerces siempre la identidad de cinco por tiempo de juego; bajo inferioridad se usa el tiempo efectivamente ocupado por participantes.

No se exige diseñar todas las jugadas para cuatro, tres o dos jugadores. Sí una continuidad válida con las tareas comunes, opciones presentes y salidas legales, sin bucle buscando al ausente. Un pase o recepción imposible no se concede para salvar una ficha.

Una indisponibilidad externa recibida del futuro manager debe poder retirar/reorganizar al jugador. Riesgo clínico, lesión aleatoria, duración y recuperación entre partidos siguen fuera de esta entrega.

El mismo administrador atiende escenarios preparados y expulsiones que se produzcan durante un encuentro. Verificar solamente el primero no cierra la integración.

<a id="m14-09"></a>

## 9. Tiro pendiente, señales e interferencia

### 9.1 Acontecimientos discretos, sin física

Si sigue ausente, representa la situación necesaria para distinguir un lanzamiento liberado, su resolución pendiente y el cierre administrativo del reloj. Puede resolverse mediante una pequeña secuencia de acontecimientos; no requiere muestrear trayectorias ni avanzar milisegundo a milisegundo.

Reutiliza la duración y la resolución de tiro del núcleo. Conserva qué se decidió y cuándo, qué sigue pendiente, y qué dato permite juzgar validez respecto a la señal. No añadas sorteos de acierto duplicados ni tiempo extra después de resolver el desenlace para alterar su validez.

Un final de periodo no borra una consecuencia ya pendiente, ni concede un intento que no se inició válidamente. Los límites temporales del perfil, la falta relacionada y la resolución de un lanzamiento se administran en un orden estable.

Si una corrección cambia realmente los finales deportivos, identifícala como cambio semántico y conserva la versión anterior; no exijas mantener 83–103 a costa de una regla falsa.

### 9.2 Interferencia

El funcional exige la familia ofensiva/defensiva y su consecuencia. Enlázala con una situación de lanzamiento susceptible, participantes y condición declarada. No la insertes como suceso independiente en cualquier posesión.

Su administración y crédito usan las políticas normativa y estadística: puntos, validez, intento, rebote y continuidad deben conciliar sin un segundo tiro ficticio. Las frecuencias naturales, cuando estén definidas, siguen siendo parámetros identificados del perfil, con su estado SEM.

No inventes una frecuencia nueva para que un caso salga en la campaña ni presentes una probabilidad cero sin ocurrencia posible como familia implementada por completo. Si falta una semilla numérica imprescindible en el funcional/perfil, separa el administrador implementado del contenido numérico pendiente y especifica la fila exacta necesaria; no ocultes la ausencia.

No construyas dedos sobre el aro, alturas del balón o saltos en coordenadas. Usa las categorías deportivas declaradas y las capacidades pertinentes ya existentes.

### 9.3 Prueba y conservación

Los casos pequeños de señal, tiro pendiente e interferencia sirven para verificar el administrador compartido y la serialización. La demostración integrada sigue siendo el partido completo. No conviertas este bloque en una nueva entrega dedicada a simular una jugada aislada.

El guardado debe conservar la situación pendiente y evitar repetir su crédito al cargar. La vista pública no muestra un desenlace aún no presentado como si ya hubiese ocurrido.

<a id="m14-10"></a>

## 10. Guardar, suspender y continuar un encuentro

### 10.1 Tres operaciones diferentes

| Operación | Significado |
|---|---|
| Consultar/reproducir un histórico | Leer hechos ya producidos, sin sortear deporte. |
| Reejecutar con entradas y semilla | Ejecutar de nuevo la versión compatible desde el inicio. |
| Continuar un guardado | Retomar el mismo encuentro desde su estado deportivo conservado. |

El reinicio de un lote en MOTOR-12 repite el partido interrumpido desde su comienzo. Conserva ese contrato mientras no se amplíe explícitamente; no lo presentes como continuación intrapartido.

Implementa guardar/continuar en el partido individual y expón el mismo contrato al manager. Una suspensión deportiva conserva su causa; cerrar la aplicación o pausar el visionado no crea por sí mismo una suspensión reglamentaria.

### 10.2 Estado suficiente, no un volcado indiscriminado

Conserva, mediante un formato propio versionado o el mecanismo existente si ya lo hay:

- Identidades y snapshots de IN01/IN02/IN03, versiones y huellas de contenido necesarias.
- Estado y posición exacta del generador aleatorio, contadores y cualquier valor auxiliar cacheado que use el muestreador.
- Periodo, relojes, secuencia estable, posesión/acción/F activas y situación de control/derecho/alternancia.
- Participantes presentes, elegibilidad, faltas, disponibilidad, rotación y tramos abiertos.
- Energía, Forma, momentos, T y estado temporal/episodios necesario para su continuidad.
- Planes efectivos y pendientes, roles, director, responsabilidades, objetivos suspendidos y sustituciones.
- Memoria deportiva limitada, reconocimientos/respuestas y decisiones de entrenador pendientes que afecten al futuro.
- Solicitudes y órdenes con identidad, vigencia, consumo, frontera, prioridad, cancelación y causa.
- Tiro, serie de libres, sanciones, saque, revisión o reanudación pendientes.
- Cursor de ejecución y consecuencias ya administradas; referencias al prefijo de hechos/acta y a los últimos IDs confirmados.
- Política de registro y cobertura conservada, sin confundir preferencias de presentación con estado deportivo.

No guardes solo marcador, reloj y semilla inicial. No serialices funciones, DOM ni todo el historial como estado activo de cada decisión.

### 10.3 Frontera de captura

La solicitud se atiende en una frontera estable de la operación actual, declarada en la UI. Puede terminar una operación atómica en curso; no obliga a terminar la posesión, el cuarto o el partido.

Debe poder guardar en situaciones con consecuencias pendientes: por ejemplo, una serie aún no terminada o una orden todavía no aplicable. Si un tiro pendiente tiene fase representada, la conserva. La captura no concede una ventana de cambios ni deja sin administrar una falta ya validada.

Si un desenlace ya fue sorteado, se conserva como estado interno pendiente; si no lo fue, no se sortea para guardar. En ambos casos la continuación consume exactamente los sorteos que correspondían.

### 10.4 Integridad y escritura

Usa el mecanismo de persistencia local existente, con escritura atómica y validación de versión, identidad, integridad y completitud. El guardado referencia de forma inequívoca el prefijo de hechos que necesita; no es válido si ese prefijo falta.

El histórico original y el perfil congelado no dependen de la versión activa que el usuario seleccione después. Un guardado incompatible se rechaza con motivo y sin tocarlo. No se «actualiza» a un motor distinto para conseguir que cargue.

Evita duplicación de créditos y órdenes al restaurar. Una llamada de un uso no revive; una orden cancelada no reaparece. La persistencia no realiza una doble publicación de un evento si el proceso termina entre escritura y confirmación.

### 10.5 Interfaz y comprobación

Añade guardar, listado mínimo de guardados y continuar desde el flujo del partido, aprovechando componentes existentes. Muestra equipos, periodo/reloj, fecha de archivo, versión y estado. Continuar una copia para comparar debe identificarse como rama de laboratorio; no sobrescribe el encuentro original sin indicación.

Comprueba que ejecutar hasta el final desde un guardado y ejecutar sin interrupción produce los mismos hechos deportivos, sorteos, estados, acta y trayectoria. Incluye al menos una frontera de periodo y una administración pendiente. Para la segunda puede usarse un estado válido preparado por el mismo núcleo, identificado como comprobación técnica.

No se exige que todos los partidos incompletos de todos los lotes se reanuden ahora desde cualquier instrucción de JavaScript. El contrato individual sí debe conservar una continuación real y exportable.

<a id="m14-11"></a>

## 11. Equivalencia de modalidades y presentación

### 11.1 Condición de comparación

Mismas entradas congeladas, versiones, aleatoriedad, políticas y órdenes efectivas en las mismas fronteras deportivas deben producir el mismo desarrollo. Cambiar de modalidad no concede ventajas al entrenador ni conoce el futuro.

Si el usuario interviene o cambia la delegación, cambia una entrada y puede cambiar el partido. No compares un encuentro dirigido con otro delegado y atribuyas su diferencia a la velocidad.

### 11.2 Protocolo común

1. Fija un caso completo sin intervención y la misma delegación en las tres modalidades.
2. Ejecuta el avance completo, por periodos y el controlador de visionado usando el mismo núcleo.
3. Compara hechos canónicos, acta, continuidad, estados finales, número/orden de sorteos y `trajectory_fp`, no únicamente el marcador.
4. Usa un segundo caso con un pequeño guion de órdenes registrado por identidad de frontera deportiva y orden estable. No depende de milisegundos de navegador ni de un número de reloj ambiguo.
5. Verifica que abrir fichas, cambiar pestañas, leer auditorías, pausar o variar velocidad no modifica el deporte ni el momento por tiempo real.
6. Compara registro completo y reducido, con y sin construcción de prosa cuando esa opción exista, sin perder los hechos comprometidos.

Conserva una proyección de comparación explícita. Se pueden separar IDs editoriales, rutas y fechas de archivo; no se eliminan campos de juego que hayan cambiado para forzar igualdad. La huella de archivo, la de entrada y la de trayectoria siguen siendo distintas.

### 11.3 Cuatro velocidades sin esperar partidos en tiempo real

Comprueba el controlador x2/x4/x8/x16 y su agrupación mediante un reloj de presentación controlado, si hace falta. No añadas un reloj de ticks al motor ni ejecutes cuatro visionados completos con esperas reales como requisito de desarrollo.

La revisión de navegador puede cubrir un tramo, cambios de velocidad y continuación hasta el final. Dennis realizará el visionado manual que quiera. El modo por cuartos conserva estado al parar y permite órdenes en sus fronteras legales; no prepara un final inamovible antes de la dirección.

### 11.4 AUD29

Implementa su comprobación real con identidades de ejecuciones, mismas condiciones y diferencias localizadas. Su resultado identifica qué modalidad/continuación se comparó y sobre qué campos. Una comprobación de igualdad sobre entradas distintas informa de incompatibilidad, no de fallo del motor.

No marques conformes equivalencias que solo se deducen de compartir una función sin haber realizado el contraste correspondiente.

<a id="m14-12"></a>

## 12. Contrato reutilizable para el manager

### 12.1 Fachada sobre el núcleo existente

Expón una interfaz de módulo o fachada con nombres acordes a la arquitectura actual. No se pide un servicio HTTP, microservicio, SDK publicado o reescritura completa del motor.

| Operación semántica | Contrato mínimo |
|---|---|
| Validar entradas | Devuelve errores localizados, incompatibilidades y cobertura del perfil; no inventa datos requeridos. |
| Crear encuentro | Congela participantes, planes, perfiles y semilla, con identidad propia. |
| Avanzar | Resuelve hasta una frontera soportada: acontecimiento/operación, posesión, periodo o final. |
| Solicitar orden | Valida ámbito, autoridad y frontera; devuelve aceptada/pendiente/rechazada y causa. |
| Consultar | Proyección sin efectos deportivos según audiencia. |
| Guardar/restaurar | Conserva y valida la continuación real definida en §10. |
| Obtener resultado | Resultado, estado, producción, hechos/referencias, cobertura y versiones. |
| Leer histórico | Consulta el material conservado sin re-simular. |

Una operación existente puede cubrir varias filas. Documenta su API real y ejemplo mínimo; no crees ocho capas nuevas por esta tabla.

### 12.2 Entradas IN01/IN02/IN03

- IN01: identidad estable, convocatoria/disponibilidad, capacidades, cuerpo, tendencias y estados iniciales.
- IN02: plan, libro/prioridades, roles/director, defensa, saques, rotación, entrenador y delegación.
- IN03: contexto, importancia, reglas, políticas, versiones, semilla y datos de reproducción.

Los valores neutrales o energía completa solo se aplican si una política de entrada lo declara. No dependas de la última pantalla abierta para completar un plan.

Separa identidad deportiva de origen e identidad de instancia cuando dos copias de un equipo se enfrentan. No permitas colisiones ni muevas estadísticas históricas a otra entidad porque se reutilice una ficha.

### 12.3 Resultados y estados finales

La salida diferencia final normal, producción parcial/suspendida, adjudicación administrativa y fallo técnico, conforme al modelo vigente. Incluye los datos necesarios para acta, análisis, tramos, órdenes aplicadas, continuidad, estados finales y reproducción.

El manager recibe un resultado consumible; no tiene que rastrear un componente React o una etiqueta narrativa para conocer el ganador. Una ejecución inválida no se transforma en derrota ni aparece con un marcador definitivo inventado.

Un marcador adjudicado y los puntos realmente producidos se conservan separadamente. El motor no inventa estadísticas individuales para cuadrar una adjudicación.

### 12.4 Independencia y aislamiento

El núcleo no debe necesitar navegador, DOM, almacenamiento del navegador, reloj de pared ni perfil global mutable para resolver. Envuelve o extrae dependencias puntuales donde sea necesario, conservando la arquitectura y el orden deportivo.

Comprueba dos sesiones alternadas en el mismo proceso: sin compartir azar, memoria, perfiles mutables o estado de entrenador. No requiere paralelizarlas en CPU. La lectura de una sesión no altera la otra.

### 12.5 Frontera con el juego de gestión

El manager podrá aportar convocatoria, salud/disponibilidad, Forma, energía inicial, capacidades, planes e importancia; consumirá resultados e historial. No implementes todavía entrenamiento, envejecimiento, contratos, mercado, calendario, clasificación, recuperación entre jornadas o evolución de Forma.

Los estados finales son datos de salida. No se copian automáticamente como estados iniciales de todos los encuentros futuros. La memoria rival no persiste entre partidos por accidente porque el proceso se reutilice.

No diseñes ahora todo el modelo de datos del manager. Deja ejemplos de entrada/salida y reglas de integración suficientes para desarrollarlo después con su propio funcional.

<a id="m14-13"></a>

## 13. Conservación, privacidad y formatos

### 13.1 Cobertura contractual del registro

Conserva el núcleo de hechos necesario para las vistas ofrecidas: resultado/periodos, acta, anotación, presencia, posesión/F/series, tiros y oportunidades, planes efectivos, trabajo sin balón realmente registrado y estados autorizados.

«Reducido» puede omitir candidatos detallados, contribuciones diagnósticas o prosa que no se ofrecieron. No puede borrar una relación necesaria para un análisis que la UI sigue prometiendo. Publica una matriz consulta → dato necesario → nivel de conservación.

No reconstruyas cruces conjuntos a partir de marginales independientes. Un histórico con menos datos muestra su límite; no inventa organización, preparación, lateralidad o estado.

### 13.2 Paquetes y comprobadores

Reutiliza `beM-analysis-package/1`, manifiestos, partición y comprobadores de MOTOR-12/13 donde sean compatibles. Los snapshots de continuación pueden tener un esquema específico; no se hacen pasar por un export de partido terminado.

Si una extensión es aditiva y compatible, conserva el contrato y declara capacidad/cobertura. Si rompe el contrato, versiona y explica lectura histórica y reproducción. No aumentes `export/8` por rutina ni mantengas su número para una estructura incompatible.

Los cambios de `quintetos.csv`, registros de cálculo y snapshots se reflejan en esquemas, cobertura, manifiestos y validadores. Mantén hashes de archivo y validación de contenido; un paquete alterado no se acepta como evidencia.

### 13.3 No recuperar el pasado inventando

Una traza antigua no recibe las entradas de las siete capacidades porque su productor nuevo ya las registre. Un guardado antiguo que no contiene continuación suficiente no se convierte en continuable a partir del marcador.

El lector histórico y la reejecución determinista tienen matrices de compatibilidad diferentes. Conservar un archivo legible no significa conservar disponible su motor de ejecución. Explica cada caso y conserva los originales rechazados.

### 13.4 Permisos

Mantén público, propio y diagnóstico separados en interfaz, consultas, CSV, JSON, Markdown, paquetes y ejemplos de integración. El diagnóstico completo del laboratorio no se entrega al entrenador automático.

La consulta rival no revela prioridades, probabilidades, estados internos ni alternativas privadas. Cada equipo automático recibe su conocimiento autorizado antes de decidir. No pases todo el estado y lo ocultes solo en la pantalla.

### 13.5 `allowBaseOps`

Conserva el valor por defecto desactivado y la compatibilidad del lote anterior. En los contrastes que la activen:

- V0 muestra sus operaciones y no se llama base intacta.
- Las dos variantes se construyen desde la entrada congelada correspondiente, una vez, sin aplicar deltas dos veces al continuar o reintentar.
- Semillas, identidad de caso, huellas y comparación se refieren a las entradas efectivas.
- Mostrar y exportar diferencias no altera el perfil activo ni las fichas originales.

Comprueba esa semántica al menos mediante la regresión o comprobación común que ya exista; no hace falta lanzar otra campaña de extremos.

<a id="m14-14"></a>

## 14. Medición del coste

### 14.1 Entorno y unidades

Registra commit, versiones de Node/SO, CPU disponibles, memoria, opciones de registro, tamaño del caso y condiciones de almacenamiento. No presentes las cifras de MOTOR-12/13 como una medición nueva ni compares directamente equipos diferentes como una mejora del código.

Mide, con instrumentación sin efectos deportivos:

| Etapa | Qué separar |
|---|---|
| Preparación | Validación, carga/congelación de entradas y compilación de perfiles. |
| Simulación | Resolución deportiva común, sin confundir espera de UI. |
| Captura | Construcción de registros y material diagnóstico. |
| Relato | Formación de prosa/presentación desde hechos. |
| Escritura | Serialización y persistencia progresiva. |
| Lectura/análisis | Ingestión, conciliación, agregados y consultas. |
| Auditoría | Primera lectura y uso posterior con caché. |
| Paquete | Compresión/partición, descarga y comprobación. |
| Continuación | Guardar, validar y restaurar el estado, separado de resolver el resto. |

Si dos etapas están entrelazadas y no pueden medirse por separado sin cambiar el sistema, informa de la medida inclusiva y su solapamiento. No sumes tiempos inclusivos como si fueran excluyentes.

### 14.2 Tiempo, memoria y volumen

Usa tiempos monotónicos, pero nunca sus valores para decidir deporte. Reporta tiempo total y por unidad, bytes en disco sin comprimir/comprimidos cuando corresponda, tamaños por familia y memoria observada/pico con el alcance de su medición.

Para muestras pequeñas publica todas las mediciones y su mediana/rango. No llames p95 fiable al máximo de tres ejecuciones. Separa ejecución fría y calentada; una espera deliberada del visionado no es coste de simulación.

### 14.3 Un pequeño conjunto reproducible

Usa dos entradas representativas congeladas para antes/después y dos niveles: completo/reducido. Mantén iguales entradas, semilla, versión deportiva y opciones comparadas. Reutiliza la campaña de §16; no construyas otra batería independiente solo para rendimiento.

Si corriges deporte antes de optimizar, toma una medida de esa versión corregida como base de la optimización. El informe puede conservar también la medición de MOTOR-13, etiquetada con su versión, sin atribuir toda la diferencia a velocidad.

### 14.4 Escala del futuro manager

Publica una tabla de proyección para cantidades de partidos elegidas explícitamente, por ejemplo 8, 24, 120 y 240. Son escenarios de coste, no el diseño definitivo de países/ligas.

Separa simulación, lectura/exportación, almacenamiento y concurrencia realmente usada. Una extrapolación lineal se llama estimación; no se presenta como lote ejecutado ni como capacidad sostenida demostrada.

No ejecutes lotes de 100/1.000 para rellenar esta tabla. Deja el comando/configuración preparados para que Dennis los lance cuando quiera. No declares satisfactorio un tiempo de jornada solo porque el proceso termina: muestra el coste para poder acordar el presupuesto real del manager.

### 14.5 Aceptación de coste

El objetivo es quitar trabajo medido que no aporta deporte ni cobertura y conocer el coste residual. No existe en este encargo una cifra validada de segundos que puedas inventar como requisito aprobado.

Documenta mejoras, regresiones y siguiente cuello de botella. Si el coste sigue siendo material para la escala proyectada, debe aparecer en el estado de preparación para el manager. Un resultado funcional correcto no demuestra por sí solo que la escala esté aceptada.

<a id="m14-15"></a>

## 15. Optimización sobre los puntos medidos

### 15.1 Localizar antes de reescribir

Usa un perfil de CPU o una instrumentación equivalente sobre un caso representativo, fuera del bucle de todas las ejecuciones. Identifica pocas rutas dominantes y trabaja sobre ellas.

El informe anterior atribuye gran parte del volumen a decisiones; eso orienta, pero no demuestra cuál es ahora el cuello de CPU. No confundas «82 % de bytes» con «82 % del tiempo».

### 15.2 Mejoras preferidas si la medición las respalda

- Evitar construir objetos/candidatos diagnósticos detallados cuando el nivel de registro no los conserva, manteniendo el cálculo deportivo que realmente los necesita.
- Compartir referencias inmutables a entradas y recetas en lugar de copiar perfiles o fichas en cada hecho.
- Compilar una vez por perfil congelado los accesos estáticos pertinentes, sin cambiar orden ni participantes de las operaciones.
- Separar estado activo pequeño de histórico extenso; liberar el estado de encuentros terminados cuando el lote ya haya persistido su resultado.
- Escribir y leer por bloques con límites y contrapresión, en vez de cargar en RAM todos los ZIP/JSON de un lote.
- Construir agregados comunes una vez por partido/versión y reutilizarlos con invalidación correcta.
- Generar prosa a partir de hechos solo cuando se solicita; no sortear frases con el generador deportivo.
- Paginación y consultas acotadas en UI, evitando enviar todo el diagnóstico al navegador para mostrar unas filas.
- Cachés por identidad/contenido/versiones y audiencia, sin cruzar permisos ni seguir usando una proyección invalidada.

No son nueve refactors obligatorios. Elige los que eliminen coste demostrado y mantén el cambio acotado.

### 15.3 Lo que debe permanecer igual

Preserva orden de evaluación, desempates, enumeración de participantes, consumo de azar y precisión pertinente. Reordenar sumas, redondear probabilidades o cambiar una colección puede modificar una decisión cerca del umbral: no lo llames neutral sin comprobarlo.

No reduzcas el repertorio, las 32 capacidades, la memoria de ocho patrones o la reacción táctica para ahorrar tiempo. No elimines contribuciones de jugadores sin balón que el núcleo resuelve. Tampoco infles una caché con todo el pasado para acelerar una sola consulta.

Compara `trajectory_fp` y los campos deportivos del conjunto común antes/después. El número de sorteos y el marcador, por sí solos, no bastan.

### 15.4 Concurrencia y complejidad

No implantes un pool distribuido, colas externas o un segundo motor rápido. Una concurrencia adicional solo tendría sentido con medición y aislamiento demostrados; no es necesaria para cerrar esta entrega.

Prioriza mejorar el coste de una ejecución y el registro. Un proceso único con varias sesiones aisladas basta para el contrato del manager. Cualquier paralelismo que ya exista debe mantener semillas y resultados independientes del orden de finalización.

### 15.5 Límites técnicos explícitos

Mantén el límite actual de lotes salvo justificación medida. Declara tamaño de paquete/parte, límites de lectura y retención de caché en configuración operativa; no los escondas como coeficientes deportivos.

Las protecciones contra bucles no adjudican una derrota, una pérdida o un marcador artificial. Si falla el progreso, conserva diagnóstico y estado de ejecución inválida. Una administración legítima sin avance de reloj no es automáticamente un bucle.

<a id="m14-16"></a>

## 16. Campaña común y presupuesto de verificación

### 16.1 Casos compartidos

Congela entradas y plan antes de mirar resultados. Reutiliza escenarios existentes; las siguientes etiquetas identifican el objetivo del caso, no obligan a crear otro catálogo deportivo.

| Caso | Entrada propuesta | Qué comprueba |
|---|---|---|
| C14-01 | EQ01–EQ02 histórico, semilla `20261016`, perfil histórico compatible. | Referencia, neutralidad de registro y comparación de coste. |
| C14-02 | EQ03–EQ09, semilla `141002`. | Contexto interior/defensa y segundo caso de coste. |
| C14-03 | EQ07–EQ08, semilla `141003`. | Veterano/joven, capacidades/estados y lectura completa. |
| C14-04 | EQ11–EQ12, semilla `141004`. | Estrella/profundidad, rotación y reproducción desde export. |
| C14-05 | Copia explícita de un escenario de fatiga, semilla `141005`. | Exposición real a energía inferior a diez y registro de Resistencia. |
| C14-06 | Escenario existente de órdenes/finales, semilla `141006`. | Órdenes pendientes, modalidades, guardado y continuación. |

Para C14-05 utiliza una copia identificada de EQ11 frente a EQ12: energía inicial 8 en los cinco titulares de EQ11 y 30 en sus suplentes, conservando las demás entradas del escenario neutral. Mantén la rotación bajo dirección manual durante las tres primeras posesiones beM mediante el mecanismo ya disponible; después devuelve la delegación normal. Las retiradas reglamentarias siguen siendo obligatorias. Así se busca exposición con una entrada explícita, sin cambiar la curva de energía ni falsear el registro. Si no existe ese mecanismo de delegación en las entradas actuales, usa la dirección manual equivalente y consérvala en el guion de órdenes; no añadas una excepción deportiva al motor.

La referencia histórica conserva su identidad; los otros casos congelan su perfil efectivo. Elige los IDs reales de escenarios por el catálogo del repositorio y documenta la elección, sin inventar que un LAB11 concreto tenía ese contenido.

### 16.2 Reutilizar ejecuciones

La misma ejecución puede alimentar conciliación, análisis, auditoría, exportación y coste. Releerla no es otro partido. Para neutralidad necesitas ejecuciones diferentes bajo las opciones que comparas, y deben contarse.

Plan orientativo acotado:

- Coste/neutralidad: C14-01/02, completo y reducido, una ejecución basal por combinación y hasta tres posteriores si la variabilidad lo necesita.
- Integración: C14-03–06 una vez por caso, aprovechando el nivel de detalle que requiera su pregunta.
- Equivalencia: C14-01 por las tres modalidades, reutilizando una ejecución compatible; C14-06 con su pequeño guion de órdenes.
- Continuación: reutiliza prefijos de esos casos y ejecuta solo las colas necesarias para contrastar sin interrupción/restauración.
- Reproducción: un export actual realmente descargado y leído; comparte su caso con las comprobaciones anteriores.

Dimensiona el plan antes de lanzarlo; el objetivo es mantenerse alrededor de 20–30 ejecuciones completas equivalentes y, salvo un fallo que lo justifique, no superar 32 partidos completos nuevos de esta campaña. No es una cuota que haya que consumir. Las colas/prefijos y las ejecuciones repetidas se declaran aparte, con su trabajo aproximado.

Ese presupuesto no elimina la suite existente: informa separadamente de sus ejecuciones deportivas y de las de la campaña. Reutiliza evidencia cuando sea compatible y no añadas un segundo cierre de cinco partidos a cada comando de comprobación.

Si todas las comprobaciones necesarias ya pasan con menos, termina. Una modificación deportiva posterior exige repetir únicamente lo afectado, no toda la campaña de MOTOR-13 por defecto. Explica cualquier ampliación motivada por un defecto.

### 16.3 Casos administrativos y de conservación

Reutiliza estados preparados para administraciones poco frecuentes, sin exigir un partido completo por sanción o artículo. Ejecutan el mismo código común y declaran que son casos preparados.

Además de sus comprobaciones locales, verifica su integración en el flujo real pertinente: retirada sin sustituto, consecuencia pendiente, continuación, revisión o cierre. No basta invocar un helper diferente que solo existe en tests.

### 16.4 No ampliar la muestra para forzar señales

No busques significación de `COB01:seguimiento` repitiendo hasta obtenerla. La señal z≈2,1 entre trece mecanismos y cuatro diagnósticos completos no justificó cambiar la base en MOTOR-13.

No se exige observar los veinte ESP por azar ni que las 32 auditorías terminen conformes. Sí se exige conocer qué se ejecuta, qué se registra y qué falta por exponer. Las semillas no se seleccionan después de conocer un marcador conveniente.

<a id="m14-17"></a>

## 17. Auditorías y evaluación final

Reutiliza AUD01–AUD32, sus reglas y consumidores. No construyas un segundo auditor para la etiqueta v1.

En especial:

- AUD05: mapa de 32 capacidades con las siete instrumentaciones nuevas y contraste correcto de sus tipos de salida.
- AUD17: evidencia de energía inferior a diez si el caso efectivamente la produjo; curva y ámbitos conservados.
- AUD29: modalidad, velocidad/presentación y continuación, con condiciones comparables.
- AUD32: conservación y coste medidos con cobertura y entorno.
- Las auditorías de acta, tiempo, participación, F/series, memoria, privacidad y duplicación de efectos mantienen las regresiones relevantes.

No copies «15 conformes» como resultado de MOTOR-14 si cambió la evidencia. Publica el estado actualizado y su denominador, separando auditoría implementada de conclusión empírica.

Las correcciones de AUD07/AUD13/AUD26 y de quintetos no se revierten para reducir inconclusos. Todo nuevo hallazgo localiza su origen: deporte, administración, productor, lector, agregado, referencia, auditor o UI.

### 17.1 Calibración

La base puede mantenerse. No se pide una candidata deportiva nueva para tener algo que presentar en la última entrega. Si aparece una desviación material, aplica el flujo MOTOR-13: hipótesis, evidencia, cambio acotado, diff, reserva y revisión, sin activación silenciosa.

No ajustes tasas por un único partido ni conviertas bandas SEM en datos FIBA. Ausencia de referencia numérica externa se declara; no bloquea construir el instrumento ni permite afirmar validación externa.

El perfil de referencia puede estar completo funcionalmente, evaluado en la muestra y seguir siendo SEM en sus coeficientes. Son tres afirmaciones diferentes.

### 17.2 Evaluación deportiva

Las evidencias deben permitir reconocer selección, lectura, ejecución, defensa, continuidad, esfuerzo y dirección en partidos completos. No reemplaces la valoración del partido por una puntuación universal de «realismo».

Un parámetro tiene efecto pertinente y coste/concesión reconocible; no garantiza victoria. No calibres para que EQ07 siempre gane a EQ08 o que cada +3 aumente los puntos en una sola ejecución.

<a id="m14-18"></a>

## 18. Panel y recorrido integrado

Mantén una navegación utilizable sobre las pestañas actuales, sin crear otro producto dentro del laboratorio. Añade la información de cierre donde corresponda:

- Inicio: versión de aplicación, perfil activo, dataset, reglas y formatos separados y coherentes.
- Partido: guardados/continuación, estado deportivo y causa de cierre o suspensión; solicitudes pendientes visibles.
- Análisis: estados propios por tramo y lecturas/recomendaciones corregidas con su cobertura.
- Auditorías: las 32 capacidades, AUD29 ejecutable, evidencia y coste, con estados reales.
- Panel de parámetros: filas nuevas localizables, consumidores y distinción entre norma, semilla deportiva, auditoría y límite operativo.
- Lotes: semántica de V0/V1, persistencia y fallos conservada; enlace al análisis y paquetes.
- Cierre: ficha breve del candidato a v1 con inventario consultable, limitaciones y recorrido manual; puede ser una vista pequeña dentro de una pestaña existente.

No muestres una lista de módulos técnicos al jugador en cada decisión táctica. El detalle técnico vive en diagnóstico y documentación; la interfaz de partido explica el estado y la acción disponible.

Permite exportar el informe de cierre y sus datos de cobertura/coste. Es una lectura; no inicia simulaciones. Las operaciones que sí lanzan encuentros muestran cantidad y sus controles actuales, sin diálogos de aprobación innecesarios para cada consulta.

<a id="m14-19"></a>

## 19. Versiones, compatibilidad y referencia

### 19.1 Identidades separadas

Actualiza la fuente común de versión a MOTOR-14 para consola y cabecera. Dataset, perfil deportivo, políticas, esquema de snapshot, análisis y paquete no son ese mismo número.

Usa la convención vigente para una extensión `+SEM-MOTOR14-20261017` cuando corresponda al contenido/configuración añadidos. Conserva el perfil histórico y sus baselines. No cambies de perfil activo al cargar la web; ofrece activación explícita de la base nueva si es necesaria.

### 19.2 Neutralidad y correcciones

Sobre la versión histórica compatible, comprueba 83–103 y 6.505 sorteos antes de tocarla. La instrumentación, el lector y una optimización neutral deben conservar trayectoria.

Si completar/corregir administración o un productor cambia legítimamente el desarrollo, crea la referencia de esa versión con causa y primer punto de divergencia identificable. No reemplaces todos los baselines en bloque ni modifiques tests para aceptar un resultado nuevo sin explicación.

Separa en el informe: cambio de identificador, cambio de registro, corrección de lectura, corrección deportiva y calibración. Solo las dos últimas pueden alterar el deporte por su propósito, y deben hacerlo de manera explícita.

### 19.3 Congelación y guardados

Un cambio en el perfil padre no cambia partidos creados, lotes congelados o guardados. El perfil candidato se guarda con diferencias exactas, responsable/motivo y evidencia. El guardado identifica su versión y dependencia, y la carga no reinterpreta sus reglas con la versión activa actual.

Mantén una matriz breve: leer histórico, reejecutar desde inicio y continuar snapshot, con formatos/versiones compatibles y motivo de rechazo para los demás.

### 19.4 Candidato, no publicación automática

Preparar un candidato de motor v1 no autoriza una release, despliegue o aceptación manual en nombre de Dennis. No elimines SEM ni marques todos los recorridos anteriores como revisados porque el motor ya tenga catorce entregas.

<a id="m14-20"></a>

## 20. Pruebas automáticas esenciales

Ejecuta la suite existente y los comprobadores de datos/documentación. Añade pocos grupos útiles que cubran riesgos reales del cambio, apoyándote en invariantes comunes:

1. Instrumentación y sensibilidad: consumidor real de las siete capacidades, operación compartida, contexto fijo y ausencia de sorteos adicionales; salidas no binarias bien representadas.
2. Administración/participantes: filas ejecutables incorporadas, retirada sin sustituto y continuidad legal; crédito y consecuencia no duplicados.
3. Tiro/serie/orden pendientes y guardado: restauración compatible, mismo futuro, archivo incompleto/alterado rechazado y vigencias conservadas.
4. Equivalencia: modalidades, controlador de presentación y registro mantienen trayectoria con las mismas entradas/órdenes.
5. Contrato/aislamiento: uso sin navegador, dos sesiones alternadas independientes y consultas sin efectos.
6. Lectura/permisos: estados por tramo, recomendaciones distintas, quintetos/puntos sin tiempo, matriz de conservación y exportación autorizada.
7. Paquete y variantes: integridad, compatibilidad y `allowBaseOps` sin doble aplicación, reutilizando comprobaciones existentes.

Estos son grupos de riesgo, no siete suites gigantes ni un número obligatorio de tests. Usa un caso representativo y parametrización pequeña cuando realmente aporte cobertura. No escribas tests que solo repitan la implementación de una fórmula.

No introduzcas aserciones de tiempo estricto dependientes de la máquina. Las mediciones de rendimiento son evidencia comparativa; la neutralidad deportiva sí es una condición determinista.

Los partidos de integración son los de §16, no otros cinco por cada bloque. Los casos preparados de administración prueban condiciones exactas sin multiplicar campañas completas.

Cuando el mismo defecto aparezca en varios casos, corrige la causa y repite únicamente lo necesario. Declara todos los reintentos ejecutados y su motivo. Las repeticiones de la misma semilla no aumentan el tamaño de muestra independiente.

<a id="m14-21"></a>

## 21. Recorrido manual de Dennis

Crea `docs/prompts/MOTOR-14-recorrido-manual.md` con arranque, URL real, perfiles, escenario/semilla, pasos, resultado observable y señales de fallo. Sin editar código para comprobar el producto:

1. Arrancar y comprobar MOTOR-14 en consola y web; perfil/dataset/formatos por separado y activación explícita.
2. Seleccionar plantillas, inspeccionar fichas, aplicar +1/+3/+5 y deshacer; conservar referencia y variantes.
3. Preparar ataque, defensa, roles, director y saques con sus restricciones visibles.
4. Empezar un encuentro visionado; cambiar x2/x4/x8/x16, pausar, abrir una ficha y volver sin alterar estado deportivo por lectura.
5. Solicitar una orden fuera de ventana y observar estado pendiente y aplicación legal posterior.
6. Guardar en curso, cerrar/reiniciar aplicación, seleccionar el guardado y continuar; revisar versión y perfil congelado.
7. Guardar con una administración pendiente en el escenario preparado y comprobar que se conserva sin créditos duplicados.
8. Completar el modo por cuartos y el simulado completo en el caso de comparación, con las mismas órdenes/delegación que indique el guion.
9. Revisar acta, evolución, quintetos, estados propios por tramo y recomendaciones con evidencia suficiente o su aviso de insuficiencia.
10. Abrir las siete capacidades antes no contrastables y revisar una evaluación +1/+3/+5; distinguir cálculo hipotético de hecho ocurrido.
11. Abrir AUD29 y su comparación; revisar exposición de energía inferior a diez y ESP sin confundir cobertura con ocurrencia.
12. Recorrer inferioridad/sanción/señal en los casos preparados, viendo producción y adjudicación separadas cuando corresponda.
13. Lanzar un lote pequeño, detener al acabar partido, continuar y comprobar el comportamiento declarado ante un reinicio.
14. Revisar un contraste con `allowBaseOps`: V0 modificada identificada, diferencias y entradas congeladas.
15. Descargar un partido, un guardado compatible y el paquete/informe de cierre; importar lo admitido y comprobar rechazo explicado de una copia alterada/incompatible.
16. Cambiar público/propio/diagnóstico y verificar permisos también en la exportación.
17. Consultar mediciones, proyección de coste e inventario final de requisitos y pendientes.

Agrupa pasos si favorece el recorrido; no simules varios partidos completos más solo para grabar pantallas. En la evidencia de Claude distingue interacción de navegador real, comprobación de backend y paso no ejecutado.

No marques los recorridos MOTOR-08–13 de Dennis como completados por esta automatización. Puedes identificar qué riesgos cubre el nuevo recorrido integrado y conservar el estado manual real.

<a id="m14-22"></a>

## 22. Documentación y paquete de cierre

### 22.1 Archivo e índices

Archiva este prompt íntegro en `docs/prompts/MOTOR-14-rendimiento-cierre-y-motor-v1.md`, o ruta equivalente ya establecida. Actualiza catálogo, estado y changelog con recibido/en ejecución/completado técnicamente/pendiente manual según corresponda.

Conserva íntegro el funcional de referencia. Actualiza las páginas temáticas y enlaces para reflejar la implementación, sin sustituir decisiones por lo que resultó más fácil programar. Una corrección/ampliación autorizada identifica qué texto previo precisa y por qué.

No crees otro megaarchivo que obligue a leer todo para localizar una regla. Usa un índice de entrada y documentos temáticos acotados; evita duplicar textos que acabarán contradiciéndose.

### 22.2 Entregables documentales

Adapta rutas a la estructura real, manteniendo al menos estas responsabilidades:

| Documento/dato | Contenido |
|---|---|
| `docs/tecnico/motor14.md` | Base, cambios, causas, versiones, pruebas, decisiones técnicas y evidencia. |
| Índice del motor v1 | Punto de entrada al funcional, arquitectura real, uso del laboratorio y contratos. |
| Cobertura final | Requisitos/grupos/contenido, implementación, registro, exposición, verificación y pendientes. |
| Rendimiento | Entorno, comandos, casos, mediciones antes/después, unidades, límites y proyecciones. |
| Contrato de integración | IN01/02/03, operaciones/salidas reales, continuación, errores, permisos y ejemplos. |
| Compatibilidad | Histórico/reproducción/continuación por versión, sin equivalencias falsas. |
| Reglamento | Correspondencias contrastadas/heredadas/pendientes y extractos de procedencia identificada. |
| Recorrido manual | Pasos, datos, observación esperada y evidencia de lo ejecutado. |

Los resultados masivos y paquetes siguen fuera de Git. Versiona planes congelados, manifiestos, métricas resumidas, informes, referencias y evidencia pequeña necesaria. Incluye cómo obtener el paquete real sin afirmar que está en el repositorio si no lo está.

### 22.3 Paquete descargable de cierre

Reutiliza el contenedor/comprobador existente, extendiéndolo de forma compatible cuando sea posible. Incluye:

- Guía breve e índice de los contenidos y partes.
- Versiones, commit, entradas/perfiles congelados y sus diferencias.
- Plan de campaña y ejecuciones reales, con intentos y errores diferenciados.
- Cobertura funcional y de conservación, auditorías, capacidades y hallazgos con evidencia.
- Comparaciones de trayectoria/modalidad/continuación y comprobaciones de integridad.
- Medición de coste, tamaños y datos necesarios para reproducirla.
- Correcciones deportivas/lectura/registro separadas y estado de calibración.
- Informe de cierre y limitaciones/pendientes concretos.

No es obligatorio duplicar todos los diagnósticos íntegros dentro de varios paquetes si están referenciados y accesibles con hashes y cobertura. La exportación no debe perder el material necesario para las consultas comprometidas.

Comprueba una descarga real y ejecuta los validadores aplicables, incluido `batch:check`/`audit:check` si corresponden al paquete concreto. No afirmes que un comprobador de otro formato validó el nuevo snapshot si no lo reconoce.

<a id="m14-23"></a>

## 23. Criterios de aceptación y estado de v1

### 23.1 Condiciones técnicas

- [ ] Base real identificada y cambios ajenos conservados; rama/PR correctas.
- [ ] Inventario del funcional completo, con 81 grupos y cuatro soportes trazados sin confundirlos con tablas físicas.
- [ ] Contenido de capacidades/tácticas/población/modalidades íntegro y con consumidores efectivos.
- [ ] Las siete capacidades antes no contrastables tienen captura adecuada; la matriz de 32 distingue registro, exposición y contraste.
- [ ] Los pendientes obligatorios de lectura y reglamento están resueltos o figuran como bloqueos concretos de la declaración de motor completo.
- [ ] Inferioridad real no depende de un caso preparado separado ni fabrica participantes/estadísticas.
- [ ] Lanzamientos y administraciones pendientes conservan continuidad y créditos correctos.
- [ ] Guardado/restauración mantiene azar, órdenes, estados, memoria, administración y hechos sin duplicados.
- [ ] Modalidades, presentación y niveles de registro mantienen el mismo desarrollo bajo condiciones comparables; AUD29 tiene evidencia.
- [ ] Contrato de entrada/salida utilizable sin navegador y sesiones aisladas.
- [ ] Conservación, filtros, histórico, formatos y permisos reflejan la cobertura disponible.
- [ ] Optimizaciones sobre puntos medidos, con comparación semántica antes/después y sin regresiones deportivas encubiertas.
- [ ] Coste de simulación/registro/lectura/exportación y memoria/almacenamiento medido, con entorno y límites.
- [ ] Campaña acotada, suite y comprobadores pertinentes ejecutados; reintentos y casos preparados identificados.
- [ ] Documentación temática, prompt, catálogo, estado, changelog y paquete coherentes.
- [ ] Recorrido de navegador real descrito, con lo no ejecutado explícito; revisión de Dennis pendiente donde lo esté.

### 23.2 Cuatro ejes de cierre

| Eje | Cuándo se puede afirmar |
|---|---|
| Cierre de implementación del roadmap | No quedan requisitos funcionales obligatorios sin implementar; simplificaciones conservan su aprobación real. |
| Evaluación/calibración | Con el alcance de la muestra y referencias disponibles; SEM no se convierte en validación externa. |
| Preparación para la escala del manager | Contrato listo y coste expuesto; aceptación del presupuesto de escala identificada, no supuesta. |
| Aceptación funcional de Dennis | Cuando Dennis haya realizado y aceptado sus pruebas; Claude no la firma por él. |

Puedes entregar un candidato técnicamente completo pendiente de aceptación manual. También puede quedar una limitación de muestra que no impida que una función esté implementada. Ninguna de esas situaciones equivale a una función requerida ausente.

Si queda un bloqueo funcional, entrega el trabajo realizado y declara «MOTOR-14 parcial» o «candidato con bloqueos», según proceda. Identifica archivo/función/contenido pendiente, impacto, evidencia y siguiente acción concreta. No abras automáticamente un roadmap interminable ni declares que todo se traslada al futuro manager.

No conviertas las 16 auditorías inconclusas de MOTOR-13 en 16 nuevas entregas. Algunas requieren mayor muestra; otras, un registro que esta entrega debe completar. La clasificación final debe permitir distinguirlo.

<a id="m14-24"></a>

## 24. Informe final y entrega en GitHub

Entrega rama y PR sin fusionar. El resumen para Dennis empieza por el estado real y lo que puede probar, con enlaces locales del repositorio y resultados comprobados.

Incluye, en este orden:

1. Qué quedó implementado y si el candidato tiene bloqueos funcionales.
2. Arranque, perfil, semilla, guardado/continuación, recorrido manual y acciones visibles.
3. Pendientes MOTOR-09/10/11/13: cerrado, simplificación previamente aceptada, evidencia insuficiente o todavía ausente, con motivo.
4. Las 32 capacidades: uso, captura, exposición y contraste; AUD01–32 con sus estados y muestra.
5. Referencia histórica y versión nueva si hubo corrección deportiva; causa/primer punto de divergencia y neutralidad de las optimizaciones.
6. Mediciones antes/después y coste proyectado, identificando estimaciones y entorno.
7. Número real de partidos, repeticiones, colas de continuación y casos preparados; fuentes y referencias externas realmente leídas.
8. Suite, comprobadores y navegador: ejecutado/no ejecutado, sin asumir Node 24, otros navegadores ni pruebas manuales de Dennis.
9. Contrato disponible para iniciar el funcional del manager, sin haber construido la carrera.
10. Base, commit, rama, PR y ubicación del paquete/informe de cierre.

No termines con «todo completo» si el inventario dice otra cosa. Tampoco presentes como fracaso una auditoría correctamente inconclusa por muestra o un coeficiente honestamente SEM. El resultado buscado es un motor utilizable, explicable y mantenible, con control del dato y un cierre que corresponda a lo que hay construido.
