<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: estadisticas](README.md) · Capítulo 20 — Estadísticas: acta, atribución y magnitudes · parte 3 de 6
> Anterior: [c20-p02-principios-de-interpretacion-y-presentacion](c20-p02-principios-de-interpretacion-y-presentacion.md) · Siguiente: [c20-p04-faltas-sanciones-lesiones-y-disponibilidad](c20-p04-faltas-sanciones-lesiones-y-disponibilidad.md)
<!-- beM:nav-fin -->

<a id="grupo-20-09"></a>

### 20.9. Atribución: qué hecho produce cada registro

*Procedencia: MD04, §7.*

<a id="src-md04-l0359"></a>

#### 20.9.1. Contrato funcional

*Origen: MD04 §7.1.*

Cada crédito estadístico debe proceder de un acontecimiento validado y tener sujeto, equipo, periodo, orden, contexto y política. El registro debe permitir responder «¿de dónde sale esta casilla?» sin reconstruir movimientos continuos.

Se distingue el hecho físico resumido del crédito estadístico. Puede haber un lanzamiento anulado que no cuenta como intento, un toque de balón que no es rebote, una recuperación que no es robo o un pase que no cumple asistencia.

La propuesta es que el motor entregue hechos y responsables deportivos suficientes; la política estadística interprete los créditos; las vistas sumen esos créditos sin volver a decidir por su cuenta quién recibe una asistencia.

<a id="src-md04-l0367"></a>

#### 20.9.2. Relaciones que deben conservarse

*Origen: MD04 §7.2.*

| Relación | Para qué sirve |
|---|---|
| Tiro ↔ validez ↔ valor ↔ resultado | Conciliar intentos, aciertos, puntos y mapas. |
| Falta ↔ sanción ↔ serie de libres | Evitar tiros o faltas inventados al presentar el acta. |
| Pase ↔ receptor ↔ finalización elegible | Aplicar la política de asistencia una sola vez. |
| Pérdida ↔ causa ↔ eventual robo | Acreditar al causante, no al último que recoge por costumbre. |
| Tiro bloqueado ↔ tapón ↔ tirador | Conciliar TAP y TREC sobre un mismo hecho. |
| Fallo elegible ↔ control posterior | Distinguir rebote, toque, balón fuera y excepción. |
| Entrada/salida ↔ cinco en pista | Calcular minutos y más-menos con el mismo orden de sucesos. |
| Posesión ↔ continuaciones ↔ cierre | No contar cada rebote ofensivo como ataque nuevo. |
| Orden ↔ ventana de aplicación ↔ plan activo | Analizar lo efectivamente empleado. |
| Oportunidad ↔ contexto previo ↔ desenlace | Separar calidad de opción y acierto. |

<a id="src-md04-l0382"></a>

#### 20.9.3. Corrección y anulación

*Origen: MD04 §7.3.*

Un hecho provisional puede corregirse: un triple pasa a dos, un tiro queda fuera de tiempo o se revisa una atribución. La consecuencia funcional es que marcador, acta, mapa, resumen y derivados muestran la misma versión corregida.

No se mantiene la primera cifra en una vista y la revisada en otra. La corrección conserva motivo y trazabilidad. El formato técnico para lograrlo queda pendiente; este requisito no exige ahora elegir arquitectura.

<a id="src-md04-l0388"></a>

#### 20.9.4. Casos habituales, ambiguos y excepcionales

*Origen: MD04 §7.4.*

Los casos habituales tienen reglas deterministas. Los casos ambiguos necesitan la información prevista en el contrato, no una moneda aleatoria estadística adicional. Las excepciones consultan la política del reglamento elegido.

En un partido simulado el motor sabe qué responsabilidad ha resuelto. Eso permite una atribución consistente sin fingir una cámara o un anotador que adivina. No autoriza a convertir conocimiento interno de capacidades o probabilidades en información pública.

<a id="grupo-20-10"></a>

### 20.10. Tiros, libres y clasificación de finalizaciones

*Procedencia: MD04, §8.*

<a id="src-md04-l0396"></a>

#### 20.10.1. Dos clasificaciones simultáneas

*Origen: MD04 §8.1.*

Cada finalización necesita una clasificación estadística y una clasificación deportiva. La primera responde si existe intento de dos, de tres o libre. La segunda explica cómo llegó: tiro corto desde posición, llegada al aro en movimiento, suspensión tras bote, recepción, corte, continuación, poste o segunda opción.

Un tiro de dos no significa automáticamente uso de Tiro interior. Media distancia, Finalización en movimiento y Tiro interior corresponden a tareas distintas ya definidas. Tiro en movimiento describe preparación y puede combinarse con la técnica de distancia pertinente; no crea otra columna de puntos que se sume al tiro de dos o tres.

<a id="src-md04-l0402"></a>

#### 20.10.2. Campos deseados de un intento

*Origen: MD04 §8.2.*

| Dimensión | Valores funcionales o información |
|---|---|
| Conteo | Válido, anulado, repetido o acción que no produce intento estadístico. |
| Valor | Dos, tres o libre; revisión si cambia. |
| Sector | Zona funcional representada, sin coordenada ficticia. |
| Preparación | Recepción, bote, salida de pantalla, corte, entrega, poste u otra representada. |
| Finalización | Suspensión, tiro corto, gancho, entrada, mate, palmeo u otra resuelta. |
| Oposición | Nivel categórico y responsables pertinentes. |
| Contexto | Transición, ataque organizado, saque, rebote ofensivo, final de reloj. |
| Creación | Pase elegible, ventaja propia, ventaja registrada de compañero. |
| Resultado | Acierto/fallo, tapón, falta y validez de la combinación. |
| Continuación | Control rival, rebote ofensivo, balón retenido o reanudación. |

No todos estos ejes son categorías excluyentes entre sí. Un mate puede ser a la vez tras corte, en pintura, asistido, en transición y ejecutado por un suplente.

<a id="src-md04-l0419"></a>

#### 20.10.3. Reglas del acta y sus efectos

*Origen: MD04 §8.3.*

El perfil estadístico debe distinguir un lanzamiento fallado con falta de tiro de un intento contabilizable; una canasta válida con falta mantiene su tiro de campo y añade la sanción correspondiente. Un tapón acreditable se relaciona con un intento fallado elegible. La referencia normativa se remite al manual del [anexo de origen MD04 C](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#cap-33); los escenarios funcionales del [anexo de origen MD04 B](../validacion/c28-p02-conciliaciones-y-aceptacion-del-catalogo.md#src-md04-l2117) concretan qué debe poder explicar beM.

Los lanzamientos fuera de tiempo no alteran porcentajes si no son intentos válidos. Una interferencia o un tiro concedido usa el crédito previsto por la política, sin crear un intento duplicado para el defensor. Las anotaciones extraordinarias que no proceden de un tiro propio normal quedan identificadas para conciliar puntos y tiros.

<a id="src-md04-l0425"></a>

#### 20.10.4. Libres

*Origen: MD04 §8.4.*

Los libres forman series con causa y orden. Debe conocerse cuántos se concedieron, cuáles fueron válidos, cuáles se repitieron, quién los lanzó y si después existe balón vivo, saque retenido o cambio de control.

La presentación de porcentaje usa intentos válidos. La cronología conserva el orden de cada libre, aunque no transcurra tiempo de juego. Una sustitución entre libres, únicamente cuando exista causa y oportunidad permitidas por el perfil reglamentario, puede cambiar quién recibe el más-menos de la siguiente anotación.

Los libres por contacto de tiro, bonus, técnica u otra sanción no se mezclan cuando la vista analiza finalizaciones ofensivas. Su procedencia permite tanto el total de TL como el desglose de producción. No se atribuye una acción de libro a un libre administrativo simplemente porque ocurrió en el mismo segundo.

<a id="src-md04-l0433"></a>

#### 20.10.5. Tiros del final y comparación de perfiles

*Origen: MD04 §8.5.*

Se desea distinguir tiros a final de posesión, a final de periodo, intentos muy lejanos y finalizaciones ordinarias cuando el motor representa esa condición. El usuario podrá incluirlos o separarlos al estudiar selección de tiro.

No se elimina un tiro válido del acta para mejorar el porcentaje. La posibilidad de verlo separado evita comparar sin contexto al jugador que recibe todos los ataques agotados con quien solamente tira liberado.

<a id="grupo-20-11"></a>

### 20.11. Creación, pases y asistencias

*Procedencia: MD04, §9.*

<a id="src-md04-l0441"></a>

#### 20.11.1. Asistencia oficial y creación ampliada

*Origen: MD04 §9.1.*

La asistencia es un crédito de acta sujeto a política. La creación ampliada describe oportunidades efectivamente generadas: un pase que encuentra una opción clara y termina en fallo puede tener valor descriptivo sin sumarse a AS.

Se proponen categorías separadas:

| Indicador | Qué cuenta | Condición |
|---|---|---|
| Asistencia a canasta | Crédito oficial asociado a un tiro convertido | Política de asistencia aplicable. |
| Asistencia a libres | Crédito oficial asociado a una serie elegible | El perfil FIBA de referencia puede admitirlo; no se duplica por libre. |
| Pase creador registrado | Pase cuya ejecución produjo una oportunidad identificada | La oportunidad existe antes del resultado. |
| Oportunidad tras pase | Finalización vinculada al pase creador | Muestra acierto, fallo o falta sin recatalogar calidad por resultado. |
| Pase previo a asistencia | Intervención anterior identificada en una cadena | Indicador propio; no otra asistencia oficial. |
| Pérdida de pase | Pérdida atribuida a la ejecución/decisión del pase | No toda mala recepción es automáticamente error del pasador. |

La referencia FIBA contempla asistencia a una serie de libres en determinadas condiciones si al menos uno se convierte. También distingue recepción y anotación en pintura de creación autónoma exterior. Estas particularidades impiden imponer universalmente AS ≤ canastas convertidas. El perfil exacto debe quedar fijado antes de comparar estadísticas de ligas diferentes.

<a id="src-md04-l0458"></a>

#### 20.11.2. Candidato a asistencia

*Origen: MD04 §9.2.*

Solo debe existir un candidato oficial compatible con la finalización: el último pase elegible. La información requerida es quién pasa, quién recibe, dónde recibe funcionalmente, qué creación posterior representa el motor y qué termina ocurriendo.

No se usa un límite arbitrario de «dos botes» como sustituto universal del criterio. Si el motor no representa cada bote, puede representar recepción, continuación de ventaja o creación nueva. El criterio depende de esas categorías y de la política, no de movimientos ficticios.

El candidato se cierra después de la finalización pertinente. Un fallo seguido de rebote ofensivo no arrastra automáticamente la asistencia del pase anterior a una canasta del reboteador. Una recepción que acaba en pérdida no deja una asistencia latente para la siguiente posesión.

<a id="src-md04-l0466"></a>

#### 20.11.3. Creación del director

*Origen: MD04 §9.3.*

El director puede iniciar la familia, seleccionar una alternativa, explotar una ayuda, encontrar un corte o continuar una acción. El informe debe permitir distinguir:

- Ataques que dirigió.
- Familias que inició y prioridades activas.
- Oportunidades que generó o seleccionó cuando ese hecho está resuelto.
- Pase creador, finalización propia y delegación posterior.
- Pérdidas y cierres de posesión vinculados a sus intervenciones.
- Contexto de defensa y libertad en el que decidió.

No se concede al base toda la creación del equipo por estar en pista. Si otro jugador toma la dirección o crea desde poste, recibe la atribución correspondiente. Tampoco se resta mérito al jugador que ejecuta la ventaja por concedérselo por completo al director.

<a id="src-md04-l0479"></a>

#### 20.11.4. Decisión acertada y asistencia no son equivalentes

*Origen: MD04 §9.4.*

Elegir correctamente puede acabar en fallo de un compañero. Obtener una asistencia puede depender de un tiro difícil convertido. Las vistas separan decisión/opción observada, ejecución del pase y resultado final.

Un indicador de «buenas decisiones» necesita un criterio funcional explícito sobre información disponible y opciones percibidas. Se conserva como posibilidad diagnóstica y propuesta de informe, sin inventar una nota pública universal ni permitir al informe juzgar con conocimiento del resultado aleatorio futuro.

<a id="grupo-20-12"></a>

### 20.12. Pérdidas, recuperaciones y robos

*Procedencia: MD04, §10.*

<a id="src-md04-l0487"></a>

#### 20.12.1. Catálogo de pérdidas

*Origen: MD04 §10.1.*

La pérdida significa que un hecho atribuible termina el control o el derecho ofensivo en favor del rival según la política elegida. La clasificación amplía PER sin añadir varias pérdidas a un único cambio de control.

| Tipo funcional | Atribución esperada | Contexto útil |
|---|---|---|
| Pase fallido | Emisor cuando corresponde | Ventana, destinatario, presión e intervención rival. |
| Recepción/control fallido | Receptor cuando corresponde | Dificultad del envío y oposición pertinente. |
| Balón perdido en bote | Manejador | Presión, ayuda, protección y eventual causante del robo. |
| Pasos, dobles u otra infracción individual | Jugador responsable | Acción y reloj. |
| Falta ofensiva | Jugador responsable | Pantalla, carga u otra causa identificada. |
| Infracción colectiva de avance o posesión | Equipo cuando la política lo establece | Presión, organización y fase en que se produjo. |
| Saque no ejecutado o inválido | Jugador/equipo según causa y perfil | Banda/fondo, negación y tiempo disponible. |
| Balón retenido con cambio por alternancia | Sujeto previsto por la política | Intervención defensiva y flecha. |
| Otra infracción con pérdida | Sujeto expresamente definido | No usar una categoría genérica para inventar propietario. |

Agotar un periodo sin lanzar no se convierte automáticamente en PER. La finalización de la posesión y el crédito de pérdida son conceptos distintos. Un tiro fallado tampoco es una pérdida de acta, aunque el rival obtenga el siguiente control.

<a id="src-md04-l0505"></a>

#### 20.12.2. Robo y recuperación

*Origen: MD04 §10.2.*

REC requiere intervención defensiva elegible que causa la pérdida. La atribución puede corresponder a quien desvió el pase aunque lo recogiera otro compañero; el registro separa causante y captor.

| Situación | Pérdida | Robo | Indicador complementario |
|---|---|---|---|
| Intercepción con control rival | Sí | Sí, si cumple el perfil | Recuperación y eventual transición. |
| Desvío que permanece en el ataque | No | No | Desvío registrado. |
| Error ofensivo sin intervención acreditable | Sí | No | Tipo de error. |
| Balón fuera con saque del mismo ataque | No | No | Interrupción o balón retenido. |
| Balón fuera concedido al rival | Según causa | Según política; no por recoger el saque | Pérdida y reanudación. |
| Disputa que termina en cambio por alternancia | Según política | Puede requerir criterio específico | Flecha y responsables. |

No se fuerza igualdad entre pérdidas de un equipo y robos del rival. Debe existir relación individual entre cada robo acreditado y una pérdida compatible; pueden quedar pérdidas sin robo.

<a id="src-md04-l0520"></a>

#### 20.12.3. Pérdidas antes de iniciar la táctica

*Origen: MD04 §10.3.*

La presión puede impedir que el ataque llegue a su familia prevista. En ese caso la posesión se registra como interrumpida en avance o preparación. No se afirma que «falló el bloqueo directo» si no llegó a iniciarse.

La intención del entrenador o del director puede conservarse para diagnóstico, pero los resultados públicos de una familia se basan en acciones efectivamente iniciadas. El informe de presión sí puede estudiar cuántos ataques interrumpió antes de la organización.

<a id="src-md04-l0526"></a>

#### 20.12.4. Balón suelto y continuidad

*Origen: MD04 §10.4.*

Un balón suelto puede terminar recuperado por el mismo equipo, por el rival o en una reanudación. Hasta conocer esa resolución no se atribuye una pérdida y después otra recuperación ficticia.

La disputa se resuelve como acontecimiento significativo cuando hace falta. Sus participantes son los pertinentes, no los diez jugadores compitiendo en una tirada estadística independiente.

<a id="grupo-20-13"></a>

### 20.13. Tapones, rebotes y balones disputados

*Procedencia: MD04, §11.*

<a id="src-md04-l0534"></a>

#### 20.13.1. Tapón y oposición al tiro

*Origen: MD04 §11.1.*

Un tapón de acta requiere el hecho elegible previsto por la política. El registro lo relaciona con un tirador y un intento. No se registra otro tapón porque un segundo defensor también estaba cerca.

Puede haber oposición útil sin TAP: una ayuda limita la finalización, una recuperación fuerza una suspensión o una defensa interior dificulta la posición. Son hechos contextuales cuando están representados; no se convierten en tapones para premiar al defensor.

El desenlace del balón después del tapón se determina aparte. Puede quedar en ataque, ser recuperado por la defensa o salir. «Tapón» no implica automáticamente cambio de posesión ni robo.

<a id="src-md04-l0542"></a>

#### 20.13.2. Rebote individual, colectivo o inexistente

*Origen: MD04 §11.2.*

El catálogo debe distinguir:

- Control individual elegible: crédito al jugador.
- Resolución colectiva elegible: crédito de equipo sin inventar captor.
- Toque o palmeo sin control estadístico suficiente: no asignar captura todavía.
- Excepción sin rebote: registrar la causa, no fabricar un crédito para cuadrar todos los fallos.

El manual de referencia contiene excepciones relevantes para libres no finales y finales de periodo. Por ello no se adopta la igualdad universal «todo fallo = un rebote». La conciliación usa fallos con oportunidad de rebote y excepciones declaradas.

<a id="src-md04-l0553"></a>

#### 20.13.3. Ofensivo y defensivo

*Origen: MD04 §11.3.*

Un rebote ofensivo conserva la continuidad ofensiva. Genera nueva situación, posible reinicio reglamentario del reloj y un nuevo acontecimiento, pero no un nuevo identificador de posesión en el conteo propuesto de beM.

Un rebote defensivo controlado cierra ese ataque y abre el siguiente control pertinente. Su origen puede permitir contraataque, apertura y cambio de director. El crédito de rebote no garantiza que después exista una transición eficaz.

<a id="src-md04-l0559"></a>

#### 20.13.4. Detalle deseado

*Origen: MD04 §11.4.*

| Desglose | Uso | Condición de medición |
|---|---|---|
| Tras tiro de dos/tres/libre | Leer perfil de captura | Tipo del fallo vinculado. |
| Individual/colectivo | Conciliar total | Sujeto del crédito. |
| Disputado/sin disputa | Contextualizar captura | El motor representó disputa; no inferirla solo por zona. |
| Corto/largo o sector de caída | Explicar participantes | Clasificación funcional, no trayectoria exacta. |
| Primer rebote/ofensivos sucesivos | Estudiar segundas oportunidades | Orden dentro de la posesión. |
| Cierre útil para compañero | Reconocer trabajo sin captura | Tarea y efecto registrados. |
| Carga al rebote frente a balance | Comparar intención y consecuencias | Plan activo y participación efectiva. |
| Transición concedida después del fallo | Evaluar la otra cara de cargar rebote | Conexión con el ataque rival. |

Captura y cierre se muestran por separado. No se concede el rebote al jugador que hizo el cierre si lo capturó otro; su contribución puede aparecer en el análisis ampliado.

<a id="src-md04-l0574"></a>

#### 20.13.5. Porcentajes de rebote

*Origen: MD04 §11.5.*

Se desean dos familias de indicador:

1. **Convencional desde acta:** RO/(RO propio + RD rival), con una política uniforme de créditos colectivos.
2. **Por oportunidades registradas:** capturas/ofertas de rebote elegibles dentro de un universo explícito de fallos.

No siempre coinciden. La segunda puede excluir finales de periodo, sanciones con balón retenido u otras situaciones sin disputa; la primera puede verse afectada por cómo se acreditan rebotes de equipo. Se etiquetan de manera distinta y se conserva el denominador.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c20-p02-principios-de-interpretacion-y-presentacion](c20-p02-principios-de-interpretacion-y-presentacion.md) · Siguiente: [c20-p04-faltas-sanciones-lesiones-y-disponibilidad](c20-p04-faltas-sanciones-lesiones-y-disponibilidad.md)
