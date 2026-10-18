# MOTOR-16 — Campaña masiva y extracción de evidencia para ChatGPT

**Destinatario:** Claude Code, repositorio `bateman37/beM`.

**Decisión expresa de Dennis:** MOTOR-16 es ejecución y entrega de datos. Claude ejecuta la campaña con las herramientas existentes y empaqueta la evidencia. **ChatGPT realizará el análisis en profundidad, la investigación externa y las recomendaciones.** Dennis y ChatGPT decidirán después los cambios de MOTOR-17.

**No está autorizado corregir código ni calibrar nada.** Esto incluye los robos, aunque detectes un defecto. Tampoco hay un «paso previo» de reparación antes de congelar la campaña. Se audita el motor tal como está.

**Objetivo de la devolución:** máxima información útil, íntegra y trazable, con poca lectura y redacción por parte de Claude. No se pide que Claude interprete miles de partidos, redacte una auditoría deportiva ni prepare una candidata mejorada.

**Base informativa de este prompt:** paquetes MOTOR-15B y contratos documentados de lotes, laboratorio y auditorías. ChatGPT no ha inspeccionado directamente la PR para prepararlo. Confirma las interfaces reales con lectura dirigida, sin reimplementar herramientas.

## Índice

1. [Contrato de trabajo y límites](#m16-01)
2. [Base congelada y lectura mínima](#m16-02)
3. [Plan de campaña y cantidades](#m16-03)
4. [Bloque A: doce equipos y planes naturales](#m16-04)
5. [Bloque B: doce contrastes existentes](#m16-05)
6. [Bloque C: organizaciones y coberturas](#m16-06)
7. [Bloque D: estados y escenarios existentes](#m16-07)
8. [Registro diagnóstico y repeticiones técnicas](#m16-08)
9. [Arranque, fallos, detención y recuperación](#m16-09)
10. [Ejecutar sin modificar código](#m16-10)
11. [Datos de toda la campaña](#m16-11)
12. [Diagnóstico profundo y soporte de lectura](#m16-12)
13. [Hallazgos conocidos que se conservan](#m16-13)
14. [Rendimiento y recursos](#m16-14)
15. [ZIP, partes e índice de entrega](#m16-15)
16. [Comprobación mecánica de archivos](#m16-16)
17. [Git, documentación y cierre](#m16-17)
18. [Mensaje final obligatorio](#m16-18)

<a id="m16-01"></a>

## 1. Contrato de trabajo y límites

### 1.1 Tu responsabilidad

1. Identificar la base y las herramientas ya implementadas.
2. Congelar agenda, entradas, semillas, variantes y selección diagnóstica antes de ejecutar.
3. Ejecutar los encuentros y comprobaciones automáticas existentes pertinentes.
4. Conservar resultados, fallos y material diagnóstico sin selección por marcador.
5. Exportar, indexar y comprobar los archivos.
6. Devolver los ZIP y un mensaje operativo breve.

La interpretación de distribuciones, eficacia táctica, capacidades, probabilidades, normativa, causas y propuestas se hará en ChatGPT. No dediques la sesión a escribir ese análisis.

### 1.2 Prohibiciones expresas

- No modificar motor, lectores, auditores, interfaz, CLI, scripts, tests, dependencias, esquemas, baselines ni generadores del proyecto.
- No corregir los créditos de robo, el significado de `recupera`, los tamaños históricos, una regla o un fallo encontrado durante esta campaña.
- No cambiar tasas, pesos, pendientes, umbrales deportivos, capacidades base, curvas, contadores, sanciones o semántica temporal.
- No crear una extensión SEM-MOTOR16, una política nueva ni una versión nueva del motor para esta entrega.
- No añadir instrumentación para completar una columna. Si un dato no se registra, se declara ausente.
- No crear un simulador rápido, otra infraestructura, una plataforma de experimentos ni un comprobador nuevo de producto.
- No ejecutar calibración, optimización automática, búsqueda de parámetros, selección de la semilla que conviene ni reserva de validación MOTOR-17.
- No investigar webs, descargar manuales, interpretar FIBA/ACB ni extraer referencias externas nuevas. Ese trabajo lo hará ChatGPT.
- No ejecutar de nuevo la suite completa de 202 pruebas, recorridos de navegador o campañas históricas por rutina.
- No abrir otros repositorios: `v-apps`, Basket Manager, BeManager, ZenGM ni ningún otro.
- No fusionar, publicar una release, suscribirte a una PR ni enviar datos o mensajes a servicios/personas externas.

### 1.3 Qué sí puedes escribir

Archivos de **datos y resultados**: agenda, JSON de entradas/copias admitidas por el laboratorio, registro de comandos, índices, inventario, CSV/JSON/JSONL existentes, hashes, informes automáticos y ZIP. Usa un directorio nuevo, como `out/motor16/`, separado de campañas anteriores.

Las variantes de este encargo son copias de entradas experimentales ya admitidas por el sistema; no son cambios del perfil del motor ni de las fichas protegidas. No las actives como nueva base del usuario.

Puedes utilizar comandos puntuales para invocar APIs existentes, copiar archivos, ordenar un inventario, convertir formatos mecánicamente y comprimir. No desarrolles scripts persistentes de campaña, nuevos productores o un analizador propio. Conserva las invocaciones en un registro reproducible.

La única escritura versionada prevista es documental: archivar este MD y, si lo requieren las normas del repositorio, añadir su entrada de índice y una nota factual de ejecución. No reescribas el funcional ni el changelog como si se hubiera implementado deporte nuevo.

<a id="m16-02"></a>

## 2. Base congelada y lectura mínima

### 2.1 Identidad

La última evidencia identifica:

| Elemento | Referencia recibida |
|---|---|
| Aplicación | MOTOR-15B. |
| Motor | `beM-motor-0.15.1-MOTOR15B`. |
| Perfil | Cadena vigente hasta `SEM-MOTOR15B-20261017`. |
| Export | `beM-match-export/9`. |
| Política estadística | `EST-MOTOR15B-R1` / `ACTA-MOTOR15B-R1`. |
| Dataset | `POB-MOTOR11-R1`, doce equipos EQ01–EQ12. |
| Código comprobado de 15B | `6a6814c`; puede existir un commit posterior solo documental. |
| Referencia histórica compatible | Semilla `20261016`, 83–98 y 6.684 sorteos. Es un resultado observado, no objetivo de campaña. |

Comprueba el estado real y conserva commit completo, estado inicial de Git, versión de Node/SO, CPU/núcleos disponibles, memoria y ubicación de salida. Si el motor actual es otro, identifica la diferencia antes de atribuirle resultados a MOTOR-15B. No retrocedas destructivamente ni mezcles versiones.

Puedes usar la rama de MOTOR-15B si aún no está fusionada o `main` si ya la contiene. No hace falta una PR de implementación MOTOR-16. Preserva cambios ajenos y perfiles/archivos anteriores.

### 2.2 Lectura dirigida para ahorrar trabajo

Consulta normas raíz, índice/estado, documentación de uso de lotes/exportación, fachada del motor, catálogo de experimentos/escenarios y los comandos necesarios. Abre una implementación únicamente para localizar la invocación o el dato que ya existe.

No releas el funcional entero, no revises todos los módulos y no analices cada encuentro con el modelo. No imprimas trazas completas en el chat o en la consola visible: guárdalas como archivos.

`DESIGN(1).md` y `CLAUDE.odt` históricos no son la especificación vigente de beM. No los uses para redefinir esta campaña.

### 2.3 Congelación

Antes del primer partido guarda plan, agenda, semillas deportivas efectivas, entradas, planes, variantes y selección diagnóstica. Preserva fichas completas de los jugadores, posiciones/roles y planes completos, no solo nombres o IDs.

Cada encuentro empieza con el estado inicial de su entrada, sin arrastrar energía, Forma, momentos, faltas, memoria o modificaciones del partido anterior. En el bloque natural se utiliza el estado de referencia neutro de la base; las excepciones de B/D se identifican como contraste.

El congelado se conserva aunque un resultado sea extremo o una hipótesis parezca equivocada.

<a id="m16-03"></a>

## 3. Plan de campaña y cantidades

ID de estudio: **`MOTOR16-EVIDENCIA-20261018`**. Es una identidad externa de campaña, no una versión del motor.

| Bloque | Composición prevista | Ejecuciones lógicas |
|---|---|---:|
| A · Cruces naturales | 66 pares distintos × 20 semillas × dos localías. | 2.640 |
| B · Contrastes existentes | 12 EXP13 × 16 semillas × dos variantes. | 384 |
| C · Defensa | 6 organizaciones × 4 coberturas × 8 semillas × dos localías. | 384 |
| D · Estados existentes | 10 variantes LAB especificadas × 8 semillas por familia. | 80 |
| **Total lógico previsto** | Sin contar repeticiones de registro o concurrencia. | **3.488** |

Además se prevén:

- **224 repeticiones diagnósticas** de ejecuciones ya incluidas, elegidas según §8.
- **16 repeticiones técnicas** para observar concurrencias 1 y 2 sobre ocho casos ya ejecutados con 4.
- **4 repeticiones en registro reducido** sobre casos ya incluidos.

**Total físico previsto: 3.732 ejecuciones**, antes de incidencias operativas. Las repeticiones no aumentan la muestra deportiva independiente. Variantes y localías emparejadas tampoco se presentan automáticamente como observaciones independientes.

Son cantidades autorizadas para extracción, no una obligación de consumir cuota si una interfaz existente impide un bloque o se activa la detención técnica. Informa solicitado/realizado/no ejecutado; no reemplaces casos incompatibles ni reduzcas la campaña en silencio.

Divide en trabajos compatibles con los límites actuales —la evidencia anterior indica 5.000 ejecuciones por trabajo— sin cambiar esa tabla. Conserva un índice global que relacione estudio, bloque y lotes reales.

<a id="m16-04"></a>

## 4. Bloque A: doce equipos y planes naturales

### 4.1 Entradas

Usa EQ01…EQ12 de referencia, con sus doce jugadores y **planes naturales MOTOR-11**, conservados bajo el motor actual. La referencia histórica de EQ01/EQ02 no sustituye silenciosamente sus planes naturales.

No generes población nueva, no homogeneices las capacidades ni modifiques los planes para producir una liga «parecida a ACB». Este bloque describe esta población ficticia concreta.

### 4.2 Agenda exacta

Ordena los equipos por ID. Enumera los 66 pares no ordenados `(i,j)`, con `i<j`, en orden lexicográfico. A cada par asígnale `p=1…66`.

Para cada par ejecuta `r=1…20`:

- H0: equipo i local, equipo j visitante.
- H1: equipo j local, equipo i visitante.

Semilla deportiva explícita para ambas localías de ese par/repetición:

`seed_A = 160000000 + 1000*p + r`

Congela ambas entradas completas. Usa el soporte de semillas explícitas ya existente; no modifiques su derivación. Conserva por separado semilla de lote y semilla deportiva.

Importancia ordinaria, delegación habitual y resto del contexto de referencia. Las dos localías comparten semilla intencionadamente; no presupone que cada jugada consuma los mismos sorteos ni demuestra por sí sola un efecto aislado de localía.

### 4.3 Conservación

Nivel **`world-essential`**, relato omitido. Conserva el registro esencial completo de cada encuentro y sus datos de entrada, además de las tablas que el exportador existente produzca.

Los primeros cuatro casos de la agenda son el control operativo inicial de §9 y cuentan dentro de los 2.640; no son cuatro partidos extra.

<a id="m16-05"></a>

## 5. Bloque B: doce contrastes existentes

Reutiliza las definiciones **EXP13-01…12 ya implementadas**, con sus actores y variables conservadas. No reconstruyas los experimentos ni selecciones jugadores después de ver quién mejora.

| EXP | Dos condiciones existentes |
|---|---|
| 01 | Base frente a TEC08 +3 en los directores seleccionados. |
| 02 | Base frente a TEC01 +3 en los finalizadores exteriores seleccionados. |
| 03 | Base frente a MEN02/MEN03 +3 en el mismo director. |
| 04 | Libertad 1 frente a 5, mismo libro y plantilla. |
| 05 | Individual frente a zona 2–3, mismos jugadores. |
| 06 | Presión normal frente a tres cuartos. |
| 07 | Después del tiro 2 frente a 4. |
| 08 | Referente EQ11 con energía 100 frente a 30. |
| 09 | Forma −0,5 frente a +0,5 en el mismo actor. |
| 10 | Consistencia 10 frente a 24 en el mismo actor. |
| 11 | T colectivo inicial −0,5 frente a +0,5. |
| 12 | Política cauta frente a agresiva, misma plantilla y contexto. |

Para `e=1…12`, utiliza 16 repeticiones `r=1…16` con:

`seed_B = 170000000 + 1000*e + r`

Las dos variantes de un contraste/repetición comparten semilla. Congela emparejamiento, actor, valores/deltas, saturación si la hay y diferencias exactas. No llames «base intacta» a un extremo bajo que ya aplica operaciones.

Usa el soporte existente para operaciones en ambas variantes cuando corresponda (`allowBaseOps`, si sigue siendo su nombre). Es una opción del experimento, no autorización para editar el perfil deportivo.

Nivel esencial, relato omitido. Si alguna definición no está disponible o el ejecutor existente no admite sus operaciones, marca la parte no ejecutada con causa; no implementes el soporte ni sustituyas el experimento.

<a id="m16-06"></a>

## 6. Bloque C: organizaciones y coberturas

Usa los equipos y entradas del escenario existente LAB11-10: **EQ01 como equipo cuya defensa varía y EQ11 como rival**. Conserva las fichas y los planes ofensivos naturales. Las modificaciones son copias de preparación admitidas por el laboratorio.

Enumera ORG01…ORG06 y COB01…COB04 según su catálogo real. Para ORG06 conserva el objetivo EQ11-J03, alternativa EQ11-J01 y fallback ORG02 ya definidos en ese escenario. No envíes la orden manual de cambio de objetivo de LAB11-10 en este bloque.

Para cada combinación organización/cobertura, ocho semillas y dos localías. EQ01 conserva siempre el papel de equipo intervenido, sea local o visitante.

Con organización `o=1…6`, cobertura `c=1…4` y `r=1…8`:

`seed_C = 180000000 + 10000*o + 1000*c + r`

Las dos localías de una combinación/repetición comparten semilla. Nivel esencial y relato omitido.

El lector debe poder distinguir organización/cobertura solicitada y efectivamente aplicada. Una cobertura no pertinente para una interacción no se declara usada por estar en el plan.

Si una combinación es incompatible según el catálogo, conserva petición, validación y motivo. No cambies jugadores, reglas o fallback para ejecutarla a la fuerza; no la sustituyas por individual sin declararlo. El total realizado puede ser menor que 384 por esa causa explícita.

<a id="m16-07"></a>

## 7. Bloque D: estados y escenarios existentes

Reutiliza estas variantes del catálogo, sin crear estados nuevos:

| Familia `f` | Escenario | Variantes incluidas | Número |
|---|---|---|---:|
| 1 | LAB11-02 · energía inicial | E100, E30 y E08 del director. | 3 |
| 2 | LAB11-03 · referente y recambio | J03-100 y J03-30; excluye VS-EQ12 multicausa. | 2 |
| 3 | LAB11-04 · iniciativa | Base, I02 e I08. | 3 |
| 4 | LAB11-06 · edad | Base y AGE, conservando capacidades. | 2 |

Ocho repeticiones por familia. Todas sus variantes comparten, para cada `r=1…8`:

`seed_D = 190000000 + 1000*f + r`

Conserva el rival, actor y resto de entradas de la definición implementada. En LAB11-06, cambiar solo la etiqueta de edad se distingue del contraste multicausa EQ07/EQ08.

Nivel esencial. Los contrastes de Forma, Consistencia y T ya están en B y no se repiten aquí.

Los escenarios preparados C15-05, C15-06, RG-I03 y los informes de equivalencia de MOTOR-15B se incorporan como **evidencia previa compatible**, si están disponibles, con origen/versiones explícitos. No los cuentes como encuentros nuevos de esta campaña ni repitas los generadores de integración para obtenerlos.

<a id="m16-08"></a>

## 8. Registro diagnóstico y repeticiones técnicas

### 8.1 Selección diagnóstica previa

Repite en **diagnóstico completo**, con relato omitido, las siguientes ejecuciones de la misma agenda:

| Procedencia | Selección fija | Repeticiones |
|---|---|---:|
| A | Repetición r=1 de los 66 pares, ambas localías. | 132 |
| B | Repeticiones r=1 y r=2 de los doce experimentos, ambas variantes. | 48 |
| C | Repetición r=1 de las 24 combinaciones, solo H0; donde sea compatible. | 24 |
| D | Repeticiones r=1 y r=2 de cada familia, todas sus variantes. | 20 |
| **Total previsto** | Subconjunto preseleccionado de los bloques, no muestra adicional. | **224** |

No elijas únicamente partidos altos/bajos, victorias, anomalías o casos favorables. Este subconjunto permite estudiar decisiones y capacidades; los fallos observados constituyen otra selección, identificada como tal.

Enlaza original esencial y repetición diagnóstica. Conserva semillas/entradas y resultado de los comprobadores existentes. No compares huellas de contratos distintos como si fueran la misma cadena.

Si una repetición difiere, conserva ambos resultados y la identidad exacta de registro/entrada; no edites el motor para igualarlos ni atribuyas automáticamente la diferencia al RNG.

### 8.2 Concurrencia y registro reducido

Selecciona de A los pares `p=1…8`, repetición r=1, H0. Ya se habrán ejecutado en esencial con cuatro trabajadores donde el entorno lo admita. Repítelos en esencial con concurrencia 1 y 2: **16 ejecuciones físicas**.

Selecciona además A, pares `p=1…4`, r=1, H0, para una repetición en nivel reducido: **cuatro ejecuciones**. El diagnóstico completo correspondiente ya pertenece a §8.1.

Usa interfaces y observadores existentes. Devuelve las salidas; no implementes otro verificador de equivalencia. Estas repeticiones son técnicas y quedan excluidas de los totales deportivos de la campaña.

Si el entorno no admite cuatro trabajadores, declara capacidad efectiva y ajuste operativo; no presentes una comparación 1/2/4 que no se ejecutó.

### 8.3 AUD y sensibilidad existentes

Conserva los resultados AUD/sensibilidad que produzcan los instrumentos existentes. Para una extracción automática concreta y acotada de las 32 capacidades, utiliza el subconjunto B diagnóstico de r=1: **24 encuentros ya ejecutados**, sin nuevas simulaciones.

Puedes dividir la lectura en grupos si el auditor lo exige, conservando la identidad y cobertura de cada salida. No promedies después esos informes como si todos sus contextos fueran equivalentes.

Usa el contraste de cálculo +1/+3/+5 y la selección de contextos existentes, sin modificar pesos, límites o número de contextos del perfil para aparentar exposición. No desarrolles otro contrafactual si falta una operación.

Adjunta el resultado automático sin escribir su interpretación. Si la interfaz no permite consumir este nivel o conjunto, conserva el motivo y los diagnósticos brutos para que ChatGPT los analice.

<a id="m16-09"></a>

## 9. Arranque, fallos, detención y recuperación

### 9.1 Comprobación operativa inicial

Ejecuta los primeros cuatro casos A, cuenta su trabajo dentro del bloque y confirma mecánicamente que las entradas/versiones son las previstas, los archivos se guardan y el exportador puede conservarlos. No interpretes su baloncesto ni cambies el plan según sus marcadores.

Si falla la sintaxis de una invocación o un nombre de opción, corrige el comando usando la API ya existente. Si cambia la agenda/entrada congelada, conserva revisión y motivo antes de continuar. No cambies implementación para hacer funcionar la llamada.

### 9.2 Fallos deportivos/técnicos

Conserva cada fallo con entrada, semilla, caso/variante/intento, mensaje, traza, último contexto disponible y salida parcial existente. No lo conviertas en derrota ni marcador final válido. No excluyas el caso de la agenda.

Un resultado extremo válido permanece en la muestra. No es una razón para reintentar con otra semilla.

No reintentes un fallo determinista buscando una pasada verde. Una interrupción de infraestructura puede reintentarse una vez con iguales entradas/semilla y un intento distinto, conservando ambos y su causa. Nunca contabilices doble producción.

Si aparecen cinco fallos técnicos consecutivos con la misma firma, o al menos un 20 % de fallos técnicos entre las primeras veinte ejecuciones de un bloque, suspende ese bloque y conserva el estado. Continúa los bloques independientes que sean ejecutables. Es una protección operativa de campaña, no un umbral deportivo.

Si hay agotamiento de espacio/memoria, escritura incompleta o un límite de ejecución, detén el despacho de forma segura con el mecanismo existente. Conserva lo confirmado y produce una entrega parcial con continuación exacta. No borres evidencia ni empieces toda la campaña desde cero.

### 9.3 Cobertura del fallo

No añadas una repetición diagnóstica no preseleccionada por defecto. Si la captura del fallo ya es suficiente, expórtala. Si un comando existente permite obtener una reproducción diagnóstica, puedes realizar una por firma/caso necesario, con los mismos datos y marcada como reproducción de fallo. Cuenta esas ejecuciones adicionales aparte.

Ni un fallo descubierto ni un validador incorrecto autorizan una corrección de código en MOTOR-16.

<a id="m16-10"></a>

## 10. Ejecutar sin modificar código

Utiliza el controlador de lotes, fachada/CLI, generadores de variantes y exportadores ya disponibles. Las interfaces físicas se verifican mediante su ayuda/documentación. No inventes comandos npm ni des por existente un `motor16:run`.

Se permite invocar una función exportada existente desde un comando puntual si no tiene CLI propia. La invocación se limita a pasar las entradas/operaciones autorizadas y guardar la salida; no incorpora nuevas reglas, cálculos deportivos, productores o un analizador.

Reutiliza el pool persistente. No lances un agente de IA por partido, no solicites revisiones paralelas de cada bloque y no interpretes cada salida con el modelo.

Configura como opciones de ejecución: esencial con concurrencia 4 donde se admita, diagnóstico con 2 como preferencia para limitar memoria, y las concurrencias explícitas de §8. No alteres `profile.batch` ni el perfil activo del navegador para conseguirlo. Registra valores pedidos y efectivos.

Si un bloque requiere funcionalidad que no existe, conserva solicitud e incompatibilidad y sigue con el resto. No implementes esa funcionalidad ni fabriques resultados equivalentes.

Mantén la consola breve: progreso por lote/bloque, contadores y errores esenciales. El detalle va a archivos. No vuelques miles de filas en el contexto de Claude ni leas todas las trazas antes de devolverlas.

<a id="m16-11"></a>

## 11. Datos de toda la campaña

### 11.1 Registros completos en su nivel

Conserva **todos los registros esenciales de las ejecuciones principales** y todos los diagnósticos seleccionados, no solo tablas de equipo o cinco ejemplos. Mantén entradas y dependencias necesarias para identificar/reproducir cada caso.

No hace falta que el mismo dato aparezca simultáneamente en CSV, JSON y Markdown. Usa los formatos existentes y un mapa de archivos/campos. Si un CSV no existe pero su información está íntegra en JSON, señala ese origen; no construyas un lector nuevo para duplicarlo.

### 11.2 Información que debe poder localizar ChatGPT

| Familia | Contenido a conservar si lo registra el sistema |
|---|---|
| Ejecuciones | Fuente/bloque/lote/caso/variante/intento, semilla, entradas, versiones, nivel, estado, validez, errores y referencias. |
| Equipos/acta | Marcador de cancha y administrativo separados, tiros, libres, puntos, rebotes, AS a canasta/libres, pérdidas, robos, tapones, faltas y sujetos colectivos. |
| Jugadores | Fichas completas congeladas, estados iniciales, roles/posiciones, minutos/DNP, acta individual y vínculos a equipo/variante. |
| Periodos | Parciales, duración, prórrogas y punto de terminación real. |
| Posesiones/F | Origen, continuidad, cierre, finalizaciones, series y puntos vinculados. |
| Tiros | Autor, tipo/valor, sector real, preparación, oposición/calidad, validez/anulación, resultado y participantes. |
| Ataque | Disposición, libro/prioridades, procedencia de elección, familias/fichas, espontáneas, continuaciones y trabajo sin balón observado. |
| Defensa | Organización/cobertura efectiva, presión, ayudas, responsabilidades, marcas y respuesta realmente ejecutada. |
| Dirección | Políticas, sustituciones, motivos, faltas, tiempos muertos, solicitudes/órdenes y aplicación efectiva. |
| Presencia | Intervalos, jugadores/puestos, quintetos, posesiones completas/mixtas y on/off sustentado. |
| Estados | Energía, Forma, momentos individuales/colectivos, tensión/importancia, episodios y muestras disponibles. |
| Memoria | Exposiciones, patrones, claves, reconocimiento, respuesta compatible/aplicada, continuidad, bloqueos y reemplazos. |
| Saques/reglamento | Cadenas y causas terminales, receptor, negaciones, relojes, incidencias, series, colas y correcciones. |
| Integridad/coste | Conciliaciones, cobertura, huellas y contratos, tiempos por fase, bytes y entorno. |

La tabla no autoriza crear campos ni medir movimientos inexistentes. Entrega una matriz **familia/campo → archivo/ruta → nivel → disponible/no registrado/no aplicable**.

### 11.3 Formatos ya existentes

Reutiliza las tablas de los paquetes de lotes, cuando estén disponibles: `estadisticas/partidos.csv`, `periodos.csv`, `equipos.csv`, `jugadores.csv`, `posesiones.csv`, `finalizaciones.csv`, `tiros.csv`, `ejecuciones.csv`, `tramos.csv`, `quintetos.csv`, agregados e informes de cobertura/rendimiento. Confirma sus nombres reales.

La información que no sale por el exportador se conserva mediante los registros esenciales/diagnósticos originales, si existe allí. No escribas un CSV vacío como prueba de cobertura completa.

Incluye un diccionario de unidades, tipos, identificadores, nulos, universos y relaciones que ya estén definidos. Una magnitud ausente no es cero. Conserva la distinción entre producción final válida y marcador parcial de una ejecución fallida.

<a id="m16-12"></a>

## 12. Diagnóstico profundo y soporte de lectura

### 12.1 Evidencia diagnóstica

Los diagnósticos seleccionados deben conservar las decisiones y operaciones que el nivel completo ya registra:

- Participantes, opciones/candidatos, requisitos, selección y alternativas disponibles.
- Recetas/términos por capacidad, peso, valor base/efectivo, energía/estados y tarea.
- Probabilidad o distribución **final consumida**, resultado del sorteo y ordinal disponible.
- Tiempo/esfuerzo, acontecimientos de continuidad, intervención defensiva y efectos.
- Contexto de plan, director, defensor y estados que permite interpretar la decisión.
- Tablas de parámetros consultados y referencias declaradas por el instrumento.

No recalcules una probabilidad que no fue registrada para presentarla como consumida. No sustituyas el dato anterior a la decisión por una clasificación obtenida después del resultado.

Conserva la sensibilidad +1/+3/+5 automática existente y su alcance: cálculo fijo no equivale a efecto sobre un partido completo. No pidas a Claude interpretar si una capacidad «funciona bien».

### 12.2 Copia de soporte para lectura de ChatGPT

Incluye una copia **de solo lectura del código pertinente en el commit congelado**, para que ChatGPT pueda examinar las fórmulas y consumidores sin depender de acceso posterior a GitHub.

Prioriza módulos actuales de `src/match`, `src/engine`, `src/profiles`, `src/batch`, `src/audit`, `src/analysis`, los datos/catálogos que consumen y las pruebas existentes específicas de MOTOR-15B/equivalencia si ayudan a identificar su contrato. Conserva rutas e importaciones; si hay dependencias locales fuera de esas carpetas, inclúyelas únicamente cuando sean pertinentes.

Añade `package.json`/lockfile existentes para identificar versiones y la documentación técnica/temática necesaria para localizar contratos. No necesitas copiar el funcional íntegro de cientos de páginas si el índice y las páginas pertinentes ya permiten localizarlo; conserva su identidad/ubicación.

Esto es copiar evidencia del código actual, no modificarlo ni pedirte que lo audites. No incluyas `.git`, `node_modules`, secretos, `.env`, volcados del equipo, navegador o archivos de otros repositorios.

### 12.3 Referencias previas

Si conservas los paquetes de MOTOR-15/15B, incorpóralos como dependencia histórica o extrae los archivos pertinentes sin alterarlos. Identifica versión y origen. No hacen falta nuevas ejecuciones para repetir sus resultados conocidos.

Adjunta referencias externas ya almacenadas con su procedencia. No busques otras ni inventes cifras de ACB/FIBA/Euroliga. ChatGPT hará ese contraste después de recibir los datos.

<a id="m16-13"></a>

## 13. Hallazgos conocidos que se conservan

Guarda esta lista como preguntas/antecedentes, sin resolverlas:

| Antecedente | Tratamiento en MOTOR-16 |
|---|---|
| Robos históricamente bajos | Mantener la política MOTOR-15B y capturar las rutas/recuperaciones disponibles. |
| 65 pérdidas vivas con recuperador y sin crédito en seis casos 15B | Conservar esos hechos y campos; no acreditar robos ni cambiar el significado de `recupera`. |
| C15-01, E0052, EQ01-J06 recupera tras pérdida de EQ02-J11 | Ejemplo concreto para la revisión posterior, no requisito de corrección. |
| Parámetros de intervención/control de robo y sus denominadores | Devolver valores actuales y decisiones existentes; no aumentar frecuencias. |
| Anotación, triples y escasez aparente de partidos bajos | Conservar la distribución completa, sin descartar extremos ni aplicar un descuento de acierto. |
| Energía crítica | Separar escenarios extremos y población natural; no forzar exposición. |
| ESP, zonas, fichas o capacidades sin exposición | Registrar cobertura real; no cambiar cuotas para hacerlas aparecer. |
| Reglas/filas provisionales y ausencia de algunos productores naturales | Mantener su estado y procedencia; ausencia de ejecución no se convierte en conformidad. |
| Coste pendiente | Medir lo ejecutado, sin optimizar ni sustituir el resolutor. |
| Tamaños históricos declarados como longitud de texto | Preservar originales, anotar esa limitación y medir bytes reales en el inventario nuevo. No corregir el generador. |

Esta lista no dirige la selección de partidos favorables ni limita la campaña a robos. Devuelve la evidencia del conjunto para estudiar después interacciones y compensaciones.

<a id="m16-14"></a>

## 14. Rendimiento y recursos

Conserva los tiempos y bytes que ya mida el ejecutor por trabajo/lote: preparación, simulación, validación, huella, captura, serialización, escritura y finalización, con sus solapamientos.

Identifica tiempo de pared y trabajo por encuentro. Con varios workers no sumes sus segundos como espera del usuario. Una producción media de lote de 272 ms por encuentro no significa que cada partido tarde individualmente 272 ms.

Registra memoria con su alcance real, concurrencia pedida/efectiva, frío/caliente y cualquier limitación de CPU/entorno que ya pueda observarse con herramientas del sistema. No implementes otro medidor ni ejecutes perfiles de CPU masivos.

La referencia histórica es aproximadamente 27,17 s de ejecución y 27,96 s totales para cien con cuatro workers en aquel entorno. El objetivo de cinco segundos no está resuelto. No conviertas la duración de toda esta campaña heterogénea en una verificación directa de ese objetivo.

Usa las repeticiones de §8 para conservar medidas comparables; no añadas otro benchmark de cien por cada configuración. No presentes extrapolaciones como ejecuciones reales.

Procesa/guarda progresivamente con el controlador existente. No mantengas miles de diagnósticos en memoria para comprimir al final. Si falta espacio, entrega partes confirmadas y estado parcial; conserva los datos originales hasta verificar los paquetes.

<a id="m16-15"></a>

## 15. ZIP, partes e índice de entrega

### 15.1 Dos capas de devolución

**A. `MOTOR-16-revision-rapida.zip`**

Debe ser pequeño y permitir empezar a trabajar sin abrir cientos de megabytes de trazas. Objetivo orientativo de tamaño comprimido: unos 10 MiB, sin recortar información necesaria. Contendrá datos operativos y tablas compactas ya disponibles, no una auditoría narrativa de Claude.

**B. `MOTOR-16-evidencia-detallada.zip` o índice + partes**

Incluye todos los esenciales, diagnósticos seleccionados, entradas, registros de fallos, salidas automáticas existentes y soporte de lectura. Reutiliza la partición actual, con **64 MiB como tamaño objetivo operativo de parte** si esa opción está disponible sin modificar perfiles/código. No es un límite de subida garantizado ni autoriza perder datos.

Si un archivo/encuentro supera el objetivo, usa la fragmentación existente o una parte mayor identificada. No trunques decisiones ni cortes CSV sin sus encabezados/dependencias. Conserva índice de reconstrucción cuando haga falta.

### 15.2 Contenido mínimo del rápido

| Archivo o responsabilidad equivalente | Contenido |
|---|---|
| `00-LEEME.md` | Orden de lectura, estructura, descarga de partes, comandos reales de verificación y mapa para encontrar un caso. |
| `01-EJECUCION.md` | Máximo aproximado de 700 palabras: base, solicitado/realizado, fallos, cobertura ausente, coste y archivos. Sin conclusiones deportivas. |
| `02-PLAN.json` | Agenda prevista, fórmulas de semillas, variantes, selección diagnóstica y revisiones previas a ejecución. |
| `03-IDENTIDADES.json` | Commit/versiones, perfiles/políticas, dataset, entorno, Git inicial/final y configuración operativa. |
| `04-MAPA-CASOS.csv` | Estudio/bloque/caso lógico/grupo emparejado → lote/caso/variante/intento real, nivel y propósito de la repetición. |
| Resultados compactos existentes | Tabla por ejecución, por equipo y por jugador si está disponible; particiones por bloque/origen. |
| `COBERTURA` | Familia/campo, nivel, archivo/ruta, disponible/no registrado/no aplicable, comprobación realizada. |
| `INCIDENCIAS-OPERATIVAS` | Fallos, firmas, detenciones, reintentos, archivos y estado. No diagnóstico causal nuevo. |
| `RENDIMIENTO` | Mediciones individuales/resúmenes automáticos existentes con unidades, configuración y alcance. |
| `DICCIONARIO` | Identificadores, unidades, universos, campos, nulos y formatos; reutiliza el vigente. |
| `COMANDOS` | Invocaciones exactas, fecha, salida/código y ubicación de logs completos. |
| `INDICE-PARTES.json` | ZIP/partes, tamaños reales, SHA-256, contenido, dependencias y cobertura. |

Los nombres son una organización externa de resultados; no requieren crear un esquema nuevo del producto. Si existen archivos equivalentes, consérvalos y enlázalos desde el índice en vez de reconstruirlos.

No calcules rankings, intervalos, p-valores, comparaciones externas o explicaciones para completar el rápido. Si un agregado lo produce automáticamente una herramienta existente, puedes adjuntarlo con su definición y universo, sin interpretarlo.

### 15.3 Integridad e identidades

El índice global permite resolver cada archivo por campaña, bloque, lote, caso, variante, intento, nivel y versión. Los IDs locales repetidos entre lotes no identifican por sí solos un encuentro.

Conserva por separado huella de archivo, entrada y trayectoria. Mide tamaños sobre bytes UTF-8 reales, no longitud de texto. Incluye tamaño/hash de cada parte terminada y un inventario interno o el manifiesto existente de sus archivos.

No introduzcas una dependencia circular de hashes. El manifiesto no contiene su propio checksum; el índice externo puede verificar el ZIP que lo contiene.

Conserva claramente:

- Ejecuciones principales y variantes experimentales.
- Repeticiones por diagnóstico, registro o concurrencia.
- Reproducciones de fallos y reintentos de infraestructura.
- Evidencia histórica que no se ha vuelto a ejecutar.

Todo lo que se anuncia como entregado debe estar incluido en una parte o dependencia accesible y verificable. Una ruta `out/...` inaccesible para Dennis no sustituye el archivo.

<a id="m16-16"></a>

## 16. Comprobación mecánica de archivos

Usa los comprobadores actuales de lotes/auditoría cuando reconozcan el formato y conserva comando, alcance, salida y código. Consulta su ayuda para argumentos reales; no afirmes que un validador cubre todo el contenedor externo si solo valida los ZIP internos.

Comprueba también, con herramientas estándar y sin implementar otro producto:

- Los ZIP se abren y sus archivos/partes están presentes.
- Tamaños reales y SHA-256 coinciden con el inventario.
- JSON/JSONL son parseables y los CSV conservan encabezados/estructura.
- Agenda solicitada, terminados, fallidos, interrumpidos, no ejecutados y reintentos concuerdan con el índice existente.
- Las referencias a perfiles, equipos, planes y variantes son localizables.
- Cada ejecución tiene nivel de registro y origen correctos.
- Cada repetición diagnóstica está vinculada a su caso principal sin contarse dos veces como producción independiente.
- La captura esencial y diagnóstica prometida existe realmente, sin muestreo silencioso adicional.

Estas son comprobaciones de entrega, no la evaluación deportiva que hará ChatGPT. No leas y expliques todos los acontecimientos para certificar el paquete.

Si un validador existente falla, conserva el fallo y la cobertura afectada. No lo edites ni marques el paquete aprobado por otra herramienta que solo comprobó que el ZIP se abre.

Cuando el entorno permita adjuntar archivos, verifica esos archivos concretos. Si la descarga actual solo permite ciertos contenedores, usa el mecanismo existente o adjunta las partes desde el entorno; no construyas una nueva pestaña/endpoint de descargas.

<a id="m16-17"></a>

## 17. Git, documentación y cierre

Conserva evidencia de que los archivos de implementación, datos base, tests, lockfile y configuraciones deportivas son iguales al inicio y al final. Usa estado/diff e inventario/hash según el flujo existente. No confundas archivos de resultados nuevos con cambios del motor.

Archiva este prompt en MD con la ruta habitual, por ejemplo `docs/prompts/MOTOR-16-campana-y-extraccion-para-chatgpt.md`, y su entrada de índice si corresponde. Una nota de estado puede decir «campaña ejecutada; análisis pendiente en ChatGPT», con cantidades y enlaces.

No actualices versiones deportivas, baselines, funcional, decisiones, pantallas ni aprobación manual. No crees una PR de implementación ni mezcles documentación de esta campaña con un cambio deportivo pendiente. Si se versiona documentación, hazlo separadamente y declara el commit de código que realmente produjo la evidencia.

El motor sigue siendo MOTOR-15B aunque esta campaña se llame MOTOR-16. Los análisis y cambios de MOTOR-17 no se consideran ejecutados.

La entrega puede ser completa o parcial según sus archivos reales. No consume una reserva de validación para demostrar una candidata inexistente. No declara calibración ni cierre definitivo del motor.

<a id="m16-18"></a>

## 18. Mensaje final obligatorio

Devuelve un mensaje breve, sin análisis deportivo, en este orden:

1. **Base congelada:** commit de código, motor, perfil/políticas y confirmación de ausencia de modificaciones de implementación/coeficientes.
2. **Cantidad real por bloque:** solicitado, terminado válido, terminado no válido, fallido, interrumpido y no ejecutado; repeticiones/reintentos separados.
3. **Cobertura entregada:** esenciales completos, diagnósticos, resultados AUD automáticos, soporte de lectura y campos no registrados.
4. **Incidencias operativas:** qué se detuvo o no pudo exportarse y continuación exacta, sin intentar arreglarlo.
5. **Recursos:** tiempo de pared, concurrencia efectiva, bytes y memoria medida con su alcance; sin extrapolar como si se hubiera ejecutado.
6. **Archivos para Dennis:** nombre, tamaño y enlace/ruta de descarga verificada del rápido, índice y todas las partes de detalle. Indica cuántos archivos debe pasarnos.
7. **Comprobación:** comandos, resultados y límites de los validadores sobre los archivos reales.

No propongas correcciones ni escribas una conclusión sobre robos, acierto, táctica o realismo. No envíes mensajes a ChatGPT por herramientas externas: Dennis nos pasará los archivos.

**Primero debe enviarnos `MOTOR-16-revision-rapida.zip` y el índice de partes.** Conserva todas las partes para que podamos pedirlas o recibirlas después sin repetir la campaña. ChatGPT analizará la evidencia y discutirá con Dennis las decisiones de MOTOR-17.
