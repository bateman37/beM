# MOTOR-05 — Defensa completa y cierre de salvedades de MOTOR-04

**Proyecto:** beM.  
**Destinatario:** Claude Code, exclusivamente en el repositorio `beM`.  
**Fecha:** 16 de octubre de 2026.  
**Estado:** prompt preparado para ejecutar; no acredita inspección de código, implementación ni pruebas por ChatGPT.  
**Punto de partida:** Dennis ha aportado el informe de cierre de MOTOR-04 y solicita avanzar con sus salvedades recogidas. Comprueba rama/base e integración reales antes de modificar.  
**Entrega:** MOTOR-05 del roadmap. Una rama y una PR revisable, sin fusionar.

## Índice

1. [Objetivo y límites de complejidad](#1-objetivo-y-límites-de-complejidad)
2. [Tratamiento de las salvedades de MOTOR-04](#2-tratamiento-de-las-salvedades-de-motor-04)
3. [Fuentes, preparación y alcance](#3-fuentes-preparación-y-alcance)
4. [Cinco estilos defensivos](#4-cinco-estilos-defensivos)
5. [Seis organizaciones y responsabilidades zonales](#5-seis-organizaciones-y-responsabilidades-zonales)
6. [Asignaciones, marcas y doce roles defensivos](#6-asignaciones-marcas-y-doce-roles-defensivos)
7. [Tres alturas de presión](#7-tres-alturas-de-presión)
8. [Cuatro coberturas y navegación](#8-cuatro-coberturas-y-navegación)
9. [Ayudas, recuperación y oposición real](#9-ayudas-recuperación-y-oposición-real)
10. [Tres instrucciones especiales y objetivos ausentes](#10-tres-instrucciones-especiales-y-objetivos-ausentes)
11. [Operaciones compartidas y costes](#11-operaciones-compartidas-y-costes)
12. [Interfaz, órdenes, panel y diagnóstico](#12-interfaz-órdenes-panel-y-diagnóstico)
13. [Perfil inicial y semillas explícitas](#13-perfil-inicial-y-semillas-explícitas)
14. [Verificación acotada y recorrido manual](#14-verificación-acotada-y-recorrido-manual)
15. [Ejecución, documentación y criterios de cierre](#15-ejecución-documentación-y-criterios-de-cierre)
16. [Anexo A: extensión SEM](#16-anexo-a-extensión-sem)

## 1. Objetivo y límites de complejidad

Implementa las seis organizaciones defensivas, sus cinco estilos, las tres alturas, cuatro coberturas, doce roles y tres instrucciones especiales del funcional aceptado. Todas deben intervenir frente al ataque de MOTOR-04 mediante tareas, participantes y concesiones reales.

El resultado es un partido completo dirigible, no una demostración de una acción aislada. Un cambio defensivo debe modificar oportunidades, decisiones, oposición, tiempo, carga o continuidad donde corresponda. Ninguna defensa recibe un porcentaje universal de reducción del ataque rival ni garantiza victoria.

Conserva **un solo motor por acontecimientos dentro de posesiones**, común a los tres modos. Las organizaciones se expresan como cinco funciones y unas pocas relaciones pertinentes; no introduzcas coordenadas continuas, trayectorias, ticks temporales ni microdecisiones de diez jugadores.

Cada interacción ordinaria debe poder explicarse con una ficha breve: balón, oposición actual, intervención adicional, responsabilidad que se concede y continuidad. Las tareas TAR son funciones del cálculo, no una secuencia de diecisiete sorteos obligatorios.

## 2. Tratamiento de las salvedades de MOTOR-04

### 2.1. Qué sabemos y qué no

El informe recibido comunica repertorio ejecutable, panel, perfiles explícitos y arranque `npm run dev` en `http://localhost:5173/`. También comunica una rama de trabajo `feature/MOTOR-04-ataque-posicional` integrada en la rama de PR `claude/busy-edison-b1fmnc`, documentación `docs/tecnico/motor04.md` y salvedades V01–V13.

Son datos del informe, no observaciones independientes de ChatGPT. Verifica su estado real. No presupongas que la PR está fusionada ni bases MOTOR-05 sobre una versión anterior sin MOTOR-04. Si la base designada contiene el trabajo, úsala conforme a las normas; no pierdas cambios ajenos ni hagas resets destructivos.

Lee V01–V13 y su evidencia en el repositorio. El usuario ha aportado detalles de V01, V03, V05 y V09; **este prompt no aprueba a ciegas los otros identificadores**. Revisa únicamente los que afecten el incremento y conserva su estado real.

### 2.2. Resolución funcional de los puntos comunicados

| Punto | Criterio de esta entrega | Acción concreta |
|---|---|---|
| V01: funciones, salidas y etapas interpretadas por Claude | La interpretación solo es válida si mantiene requisitos, actores, alternativas y continuidad del funcional/anexo B de MOTOR-04. No se acepta en bloque por estar codificada. | Compara las seis disposiciones y quince fichas con el contenido aprobado. Corrige discrepancias causales; documenta equivalentes técnicos válidos. No rediseñes todo el ataque. |
| V03: posiciones nominales como recomendación por niveles | Admitidas como ayuda visible al usuario; no una prohibición, penalización de ejecución o sustituto de la adecuación funcional real. | Comprueba que un candidato competente no queda descartado o degradado sistemáticamente solo por su posición. Prioriza elegibilidad/función/capacidades; conserva preferencias explícitas válidas. |
| V05: media distancia usa esperanza de calidad cómoda | Admisible como estimación previa a la elección, bajo información disponible y unidades correctas. No como acceso al resultado futuro ni doble modificación del tiro. | Verifica el estimador y su independencia del RNG/desenlace futuro. Distingue calidad esperada de calidad realmente resuelta en el registro. Si la calidad ya está determinada y disponible, usa esa clasificación sin simular otra. |
| V09: déficit de balance tras rebote o tapón, no tras robo | El coste depende del nuevo control y de las responsabilidades reales; omitirlo en un robo puede ser correcto si su ventaja ya lo representa y evita duplicación. | Un tapón por sí solo no cambia el control. No activa transición hasta recuperación real. En robos, conserva ventaja y compromisos; no reinicies una defensa ideal ni dupliques el mismo déficit. Declara la cobertura provisional sin pretender cerrar MOTOR-06. |

Una esperanza de ponderación con calidad cómoda incierta puede expresarse como `P(cómoda)*pesoCómoda + (1-P(cómoda))*pesoResto`, con la distribución **estimada antes de elegir**. No es conocer si el tiro entrará. No cambies las semillas vigentes por usar esta forma equivalente.

Si «recomendación por niveles» significa niveles nominales de prioridad que derrotan siempre el ajuste funcional, corrígelo: no basta con que formalmente haya un último fallback fuera de posición. No elimines, en cambio, la restricción legítima de una tarea que necesita participantes distintos o acceso real.

### 2.3. Marcador de referencia y exportaciones

Se comunica el paso de 94–89 a **90–126** con semilla `20261016`. Un marcador aislado no demuestra un bug ni realismo calibrado. No rebajes el tanteo por obligación ni lo uses como nuevo objetivo de balance.

Conserva una ejecución de referencia o su export existente. Revisa en ella, con los controles ya disponibles: posesiones/finalizaciones, tiros/intentos, pérdidas, rebotes ofensivos/continuidad, libres/faltas, minutos, energía, tiempo y duplicaciones de gasto/oposición. Es una revisión de coherencia, no una campaña estadística ni una exigencia de que todos los marcadores entren en una banda.

Si hay un error concreto, corrígelo y versiona; si no hay evidencia de error, registra «SEM, evaluación pendiente». No atribuyas el 126 a una causa sin traza.

El informe declara que `beM-match-export/2` ya no se reproduce con MOTOR-04. Mantén rechazo de incompatibilidad explícito y conservación del archivo. MOTOR-05 no exige recuperar el motor antiguo, migrar silenciosamente esos partidos ni asignarles el perfil nuevo. Preserva compatibilidad dentro de cada versión realmente soportada.

La revisión previa debe ser acotada y reutilizar comprobaciones existentes. Una discrepancia imprescindible se corrige antes de apoyar una nueva defensa sobre ella; no convierte el encargo en un cleanup general de MOTOR-01–04.

## 3. Fuentes, preparación y alcance

### 3.1. Lectura selectiva

Lee normas (`AGENTS.md`, `CLAUDE.md`), índices, estado y roadmap. Consulta páginas temáticas vigentes correspondientes a:

| Capítulo original del funcional | Lectura pertinente |
|---|---|
| 8 | Organizaciones, cinco estilos, presión, coberturas, roles, asignaciones y alternativas. |
| 15 | Ciclo de órdenes, fronteras, precedencia y conflictos. |
| 7 y 9 | Solo las funciones ofensivas y tareas con las que interactúa la defensa. |
| 11–13 | Contexto pequeño, operaciones compartidas, tiempo, exposición y energía. |
| 18 | Administración de los contactos e incidencias que esta entrega realmente produce. |
| 19 | Identidad, registro y reproducción. |
| 26–29 | Panel, perfiles, grupos DEF y cobertura/SEM. |

Consulta el prompt/estado de MOTOR-04 y `docs/tecnico/motor04.md`, además de los contratos anteriores necesarios. Usa índices y búsquedas; no vuelques el funcional completo ni releas todos los originales/prompts.

El diseño vigente y sus decisiones posteriores aceptadas prevalecen. Las semillas nuevas del anexo A son propuestas explícitas de ChatGPT, no cifras calibradas ni autorización para Claude de inventar otros coeficientes.

### 3.2. Alcance cerrado

Incluye ORG01–ORG06, cinco dimensiones por cinco niveles, alturas normal/tres cuartos/total, COB01–COB04, doce roles defensivos, marcas de referencia, responsabilidad actual, ayudas/recuperación, ESPD01–ESPD03 y alternativas por objetivo ausente.

Amplía el mismo panel de MOTOR-03 y las órdenes de MOTOR-02 para todos los controles realmente activos. Integra diagnóstico y perfiles congelados; conserva las quince fichas y nueve continuaciones de MOTOR-04.

No incluye presiones zonales específicas 2–2–1/1–2–1–1, nuevas zonas, orientación a mano dominante, planes estratégicos automáticos, memoria, Forma/momentos completos, saques tácticos, ESP completo, lotes ni calibración final. Sus entregas siguen siendo MOTOR-06 en adelante.

Los casos reglamentarios necesarios para las acciones activas sí deben administrarse correctamente. No generes una sanción que el núcleo no sabe tramitar ni la sustituyas por una falta ordinaria conveniente; implementa el soporte mínimo pertinente y declara el resto pendiente de MOTOR-09.

### 3.3. Disciplina

Trabaja solo en `beM`; no abras otros repositorios. Conserva stack y arranque. No añadas PostgreSQL, framework, Docker, autenticación o despliegue por esta entrega.

Resuelve decisiones técnicas reversibles. Si falta una decisión deportiva indispensable no cubierta por diseño, perfil vigente o este prompt, señala `DECISIÓN REQUERIDA` con referencia/efecto y avanza con lo independiente. No presentes lo expresamente diferido como una decisión que Dennis deba repetir.

## 4. Cinco estilos defensivos

### 4.1. Catálogo

| Dimensión | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Ayudas | Solo emergencia | Pocas ayudas | Equilibrado | Ayudas frecuentes | Muchas ayudas |
| Presión al balón | Dar distancia | Contener | Equilibrado | Presión cercana | Presión máxima |
| Defensa de receptores | Priorizar ayuda | Facilitar ayuda | Equilibrado | Negar recepciones | Negación máxima |
| Riesgo de robo | Muy prudente | Prudente | Equilibrado | Agresivo | Muy agresivo |
| Protección del tiro | Interior | Preferencia interior | Equilibrado | Preferencia exterior | Exterior |

El nivel 3 es Equilibrado. Conserva IDs existentes o crea IDs técnicos estables sin cambiar significados. No combines altura de presión y presión al balón en un único control.

### 4.2. Efectos y concesiones

- **Ayudas:** orienta cuántas oportunidades de ayuda adicional se aceptan. Quien ayuda abandona una responsabilidad; otro puede cubrirla, recuperar después o concederla.
- **Presión al balón:** orienta la elección de distancia/cercanía y el encargo de incomodar control/organización. Puede demorar, ser superada o generar contacto y gasto.
- **Receptores:** orienta negar frente a estar disponible para ayudar. La negación puede conceder puerta atrás y limitar ayuda; facilitar ayuda puede conceder recepción.
- **Riesgo de robo:** orienta intentar intervención frente a contener. Un intento puede robar, desviar, fallar o contactar y comprometer posición. Presionar no obliga a intentar robar.
- **Protección:** orienta qué tarea/amenaza priorizar cuando no pueden cubrirse todas. Proteger el aro puede conceder exterior; priorizar exterior puede dejar espacio interior.

No elimines funciones estructurales de zona ni al segundo defensor de una cobertura por estar en «Solo emergencia». Esa dimensión limita ayudas **adicionales**, no obligaciones propias de la organización.

No apliques los factores a la conversión rival como un descuento global. Cambian selección/encargos; la ejecución usa capacidades y oposición pertinentes.

## 5. Seis organizaciones y responsabilidades zonales

### 5.1. Funciones de cada organización

| ID | Organización | Cinco funciones |
|---|---|---|
| ORG01 | Individual | Cinco referencias personales al organizarse, con modificaciones reales por ayudas/cambios. |
| ORG02 | Zona 2–3 | Dos referencias adelantadas; dos posteriores laterales; una posterior central/interior. |
| ORG03 | Zona 3–2 | Una referencia alta central y dos altas laterales; dos posteriores. |
| ORG04 | Zona 1–3–1 | Una superior; dos intermedias laterales y una intermedia central; una de fondo. |
| ORG05 | Zona 1–2–2 | Una adelantada; dos intermedias; dos posteriores. |
| ORG06 | Box and one | Un perseguidor individual del objetivo y cuatro funciones de caja, dos altas y dos bajas. |

Cada función se asigna a un jugador disponible. Las funciones zonales no son cinco marcas personales disfrazadas. La asignación de oposición se consulta según la amenaza de la interacción, no por posición nominal del atacante.

### 5.2. Contenido de cobertura funcional

Carga fichas declarativas con responsabilidades principales, relevo/recuperación y concesiones. Utiliza estos compromisos como concreción funcional de arranque, conservando cualquier versión posterior aceptada:

| Organización | Balón alto/recepción exterior alta | Ala o lateral | Esquina/fondo | Referencia alta/interior |
|---|---|---|---|---|
| 2–3 | Primera línea contiene y orienta. | Primera línea pertinente; posterior lateral puede relevar si la recepción baja lo exige. | Posterior lateral pertinente sale; la cobertura interior que deja debe resolverse. | Central posterior protege aro; poste alto se disputa con la primera línea/referencia interior pertinente, sin cobertura perfecta simultánea. |
| 3–2 | Primera línea de tres toma amenazas altas. | Exterior de primera línea pertinente. | Posterior de ese lado debe salir y puede dejar función interior menos protegida. | Dos posteriores sostienen interior; recepción entre líneas exige compromiso de la función pertinente. |
| 1–3–1 | Superior orienta; central/intermedios cubren la siguiente recepción pertinente. | Intermedia lateral pertinente, con apoyo central compatible. | Función de fondo debe desplazarse/relevar; no puede cubrir ambas esquinas a la vez. | Intermedia central y fondo reparten recepción alta/protección baja según la interacción. |
| 1–2–2 | Adelantada orienta; la intermedia toma continuidad compatible. | Intermedia lateral pertinente. | Posterior lateral pertinente. | Dos posteriores protegen interior y una intermedia puede disputar recepción entre líneas, con concesión correspondiente. |
| Caja de ORG06 | Función alta de caja pertinente, excluyendo al perseguidor dedicado. | Alta/baja de caja según altura funcional conocida. | Función baja de caja pertinente. | Funciones de caja reparten protección y relevos; el perseguidor no aparece gratis como quinto ayudante. |

«Pertinente» debe resolverse con contenido explícito y acceso real, no con un `any defender` de los cinco. Declara para cada amenaza quién es primera referencia y qué relevo compatible puede existir. Una función ya comprometida no vuelve a intervenir en otra amenaza incompatible.

Si la acción conoce lado, consérvalo. Si solo conoce «lateral», conserva esa precisión y selecciona una referencia equivalente de forma estable según asignaciones actuales; no sortees izquierda/derecha para rellenar un mapa. Si conoce esquina, se usa la responsabilidad de esquina; no se inventa una esquina después del tiro.

Estas tablas son **responsabilidades**, no porcentajes de victoria por sistema. No conceden ocupación o llegada automática: la recepción, recuperación y oposición se resuelven con tareas compartidas. Ante inversión o corte puede haber desajuste hasta que una recuperación pertinente lo modifique.

### 5.3. Concesiones distinguibles

La zona debe cambiar quién puede negar/intervenir/ayudar y quién deja una opción al comprometerse. La diferencia no consiste en imponer «2–3 concede X % de triples» o «3–2 reduce Y % el acierto».

El ataque puede buscar poste alto, inversión, corte, apertura o alto-bajo cuando existe opción conocida. No recibe la clave privada del sistema rival para elegir una respuesta perfecta ni una adaptación estratégica nueva de MOTOR-08.

Una organización puede funcionar mal con sus participantes sin ser inválida. La validación protege realizabilidad, no conveniencia táctica.

## 6. Asignaciones, marcas y doce roles defensivos

### 6.1. Referencia frente a responsabilidad actual

La referencia responde a quién o qué función corresponde defender al organizarse. La responsabilidad actual responde a quién interviene ahora, después de cambios, ayudas o recuperación.

Prepara referencias al inicio y revisa por sustituciones, indisponibilidad, cambio válido de plan o reorganización pertinente. Conserva lo compatible. No vuelvas a optimizar las cinco después de cada pase/frase.

Jerarquía: elegibilidad; marca manual válida; funciones específicas del sistema; ajuste funcional administrado; estabilidad de referencias previas compatibles.

Las marcas manuales especifican defensor, atacante/función y ámbito. Una cobertura de cambio puede modificar la responsabilidad actual sin borrar la marca de referencia. No interpretes toda marca como prohibición de cambiar: si se quiere impedirlo, debe existir instrucción/cobertura compatible explícita.

### 6.2. Asignación automática pequeña y explicable

Usa funciones observadas/conocidas del rival, capacidades defensivas propias, compatibilidad corporal pertinente, funciones del sistema y estabilidad. No leas el libro privado ni notas internas del rival para calcular la asignación.

Puedes resolver las pocas combinaciones posibles de cinco jugadores de manera determinista y estable al reorganizar. No necesitas búsqueda de futuros de partido. Desempata por IDs estables, no por hora o renderizado.

Las recetas de adecuación y estabilidad del anexo A son semillas si faltan en el perfil vigente. No crees un overall ni estrellas de encaje. El cuerpo utiliza su derivación aceptada sin repetir altura/envergadura/alcance como tres primas.

### 6.3. Catálogo de roles independiente del ataque

| Rol defensivo | Encargo favorecido |
|---|---|
| Presionador del balón | Incomodar al manejador dentro del plan. |
| Contenedor | Sostener penetración y evitar ser superado. |
| Perseguidor | Dificultar recepción/continuidad del objetivo. |
| Perseguidor de tiradores | Seguir salidas, cortes e indirectos del tirador. |
| Marcador de una amenaza principal | Asumir la referencia prioritaria indicada. |
| Ayudador perimetral | Ayudar desde perímetro y recuperar. |
| Defensor versátil para cambios | Asumir intercambios de responsabilidad compatibles. |
| Ayudador de equipo | Cubrir compromisos y responsabilidades desplazadas. |
| Interior móvil | Defender interacciones alejadas y recuperar. |
| Ayudador del aro | Acudir a protección interior compatible. |
| Defensor del poste | Disputar recepción, posición y creación de poste. |
| Protector del aro | Presencia y oposición cercana cuando tiene acceso. |

Roles ofensivos y defensivos son independientes. El rol orienta asignación/encargo, no sube notas, acierto de tapón o velocidad. La posición nominal recomienda, sin penalización genérica por «fuera de posición».

En zona el rol opera dentro de su función asignada. Un protector del aro ubicado en una responsabilidad lateral no está a la vez debajo de todos los tiros.

## 7. Tres alturas de presión

### 7.1. Altura e intensidad separadas

Normal/media pista, tres cuartos y total/toda pista indican dónde comienza el encargo principal. El estilo de presión al balón indica cómo se ejerce.

Se puede iniciar presión individual adelantada y terminar en zona asentada. Elegir total no activa automáticamente una zona press 2–2–1 ni modifica el sistema del plan.

### 7.2. Avance con una interacción pertinente

Cuando existe avance presionable, asigna responsable de balón y apoyo/interceptor solo si tienen acceso. Resuelve de forma resumida control, demora, presión superada, pérdida o contacto mediante las operaciones y exposición pertinentes.

No añadas una tirada por cada metro, segundo o pase rutinario. Altura total no significa «más tiradas gratis hasta robar». Una misma exposición ya cobrada en el avance no vuelve a cobrarse por describirla en varias fases.

El avance usa tiempo real y reloj de 8 segundos cuando corresponde. No recortes automáticamente una demora para que nunca llegue a violación ni la declares por un contador inventado.

Si se supera la presión, conserva al defensor retrasado/comprometido y las responsabilidades de retorno pertinentes. La siguiente opción del ataque se resuelve frente a la defensa que queda, sin recolocar cinco jugadores ideales.

### 7.3. Coste sostenible

Aplica carga a quienes ejecutan el encargo, por el intervalo real. El resto no paga el mismo coste máximo por estar en el equipo. Presión, riesgo de robo y cobertura son causas distintas, pero el mismo intervalo/tarea no se factura dos veces.

No añadas bonificación directa al tiro rival por «presión superada»: la ventaja se manifiesta en acceso, preparación y oposición disponibles. El balance de MOTOR-04 y la presión superada deben describir relaciones reales, sin duplicar el mismo déficit.

## 8. Cuatro coberturas y navegación

### 8.1. Contratos comunes

| ID | Cobertura | Compromiso | Concesión y continuidad |
|---|---|---|---|
| COB01 | Contener/drop | Defensor del bloqueador protege por detrás; perseguidor recupera. | Puede dejar espacio al manejador; conserva quién llega al tiro/continuación. |
| COB02 | Cambiar | Intercambia responsabilidades de los dos defensores que ejecutan la cobertura. | Desajuste/sello/rebote posibles; nuevo emparejamiento persiste hasta modificación pertinente. |
| COB03 | Salir y recuperar/show | Segundo defensor incomoda temporalmente balón y trata de volver. | Continuador puede quedar disponible mientras recupera; registra compromiso y recuperación real. |
| COB04 | Atrapar/2×1 | Dos defensores se comprometen con balón. | Pase de salida o recepción corta pueden crear una ventaja detrás; no se fabrica un robo garantizado. |

No trates show como cambio permanente ni una trampa como drop con otro porcentaje. La concesión de cada una exige un participante y una responsabilidad abandonada identificables.

### 8.2. Navegación preparada

Pasar por encima o por debajo es navegación del defensor del balón dentro de una cobertura. Usa combinaciones preparadas y explícitas de DEF04, no un nuevo catálogo libre de microinstrucciones.

Precarga de desarrollo, si el plan vigente no define otra: drop con seguimiento por arriba; cambio con intercambio, sin ruta simultánea del perseguidor como segunda oposición completa; show con seguimiento por arriba y vuelta; atrapar con compromiso conjunto, sin una ruta de perseguidor adicional ficticia.

Ofrece la alternativa de pasar por debajo únicamente para drop si ya puede representarse con tareas y espacio concedido; su ejecución puede dejar tiro antes de recuperar. No es otra cobertura ni un bonus de tiro. No habilites combinaciones incompatibles para rellenar un selector. No es requisito añadir un deslizador independiente de navegación en la pantalla principal.

### 8.3. Aplicación en zona

Las cuatro respuestas deben poder expresarse cuando la interacción y las funciones de la organización permiten sus dos participantes. Un cambio puede transferir responsabilidades locales; no convierte toda la zona en cinco marcas personales permanentes.

El plan no impone dos defensores inexistentes sobre cualquier pantalla. Si falta una pareja funcional, identifica la incompatibilidad antes de aceptar el conjunto o aplica una alternativa **declarada** del plan. No sustituyas silenciosamente la cobertura por drop.

En cada organización debe haber situaciones compatibles para sus respuestas; no declares una zona «completa» si todas sus pantallas ignoran la cobertura seleccionada.

### 8.4. Ejecución y costes

Elegir cambio no garantiza igualdad de emparejamiento. Elegir show no garantiza recuperación. Elegir trampa no elimina todas las líneas de pase.

Una responsabilidad que ya se intercambió se conserva aunque fracase la contención posterior. No tires una moneda para volver retrospectivamente al defensor ideal. Un compromiso/relevo puede fallar o llegar tarde según su tarea; registra lo que sí ocurrió.

Las dos personas pueden intervenir en tareas compatibles. No sumes su defensa completa dos veces a cada oposición o al mismo tiro; para una tarea conjunta utiliza una receta administrada normalizada y conserva quién hace qué.

## 9. Ayudas, recuperación y oposición real

### 9.1. Presupuesto de responsabilidades

Selecciona ayudantes solo entre funciones con acceso y sin restricciones incompatibles. Excluye al defensor principal si ya está cumpliendo la misma oposición y al perseguidor dedicado si ayudar viola su encargo.

Cada ayuda registra a quién deja, quién puede relevar y qué opción se concede. La defensa no puede ofrecer simultáneamente máxima protección interior, negación de todas las recepciones y cinco opositores completos al tiro.

No se necesita resolver una cadena de todas las rotaciones imaginables. Conserva las intervenciones que cambian la decisión actual y los encargos restantes como referencias. Un máximo técnico de contexto protege memoria/coste, no crea una ayuda mágica cuando se llena.

### 9.2. Recuperación pertinente

Una recepción, pase adicional, corte, cambio o reorganización puede permitir recuperación. Usa tiempo transcurrido y capacidades de los implicados en la siguiente resolución pertinente. No generes un evento vacío cada segundo.

No desaparece el compromiso por cambiar de frase, ficha o nombre de acción. Tampoco dura indefinidamente cuando una recuperación real ya se resolvió. La historia queda en registro, no toda activa en memoria.

### 9.3. Oposición, tapón y rebote

La oposición del tiro corresponde al defensor actual que puede intervenir. El marcador inicial no vuelve a contar completo después de quedarse atrás. Un ayudante que llega puede ser opositor; su tarea previa no se suma otra vez como otra defensa independiente.

Tapón exige acceso y tiro susceptible; no todo fallo cercano es tapón. Un desvío/tapón no concede automáticamente control. Rebote, balón suelto y reanudación siguen sus causas.

El cierre usa la referencia y compromiso actuales. Una defensa que acaba cambiada o desplazada puede tener otros participantes para cerrar/capturar; no restaura el mejor reboteador por conveniencia. No sumes una penalización general de «mismatch» si sus capacidades y acceso ya representan el problema.

## 10. Tres instrucciones especiales y objetivos ausentes

### 10.1. ESPD01 — Falta táctica

La orden declara objetivo contextual/poseedor, ámbito y activación en una oportunidad pertinente. Permite una llamada limitada a la próxima oportunidad de la posesión rival declarada; muestra su caducidad. Las políticas automáticas completas de final siguen en MOTOR-08.

La orden no detiene el reloj al pulsar el botón. Un ejecutor con acceso intenta la acción; puede no llegar o no encontrar oportunidad antes de terminar el ámbito. Su clasificación depende del contacto/hecho representado, nunca de que el entrenador prefiera una falta barata.

Aplica las consecuencias del perfil FIBA vigente a los hechos que generes: no conviertas todo intento deliberado en falta ordinaria garantizada ni otorgues libres por bonus a una falta de control de equipo. Una sanción especial no se rebaja para evitar implementar su administración.

Fuente normativa del proyecto, para consulta de los casos pertinentes: <https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2026-v1-1.pdf>. Lee las reglas de contacto/sanción que necesite el hecho; no cambies edición ni terminología por memoria de otra temporada.

### 10.2. ESPD02 — Doble a jugador

Declara principal, alternativa individual opcional, activación —recepción o primer bote—, ejecutor preferido/alternativa funcional y ámbito. Usa el mismo mecanismo de compromiso de dos que COB04, con la entrada contextual correspondiente.

No se ejecutan dos trampas superpuestas por coincidir ESPD02 y COB04 sobre la misma interacción. Se conserva la causa/prioridad y un solo compromiso de participantes.

Si la activación es primer bote, el motor debe representar ese comienzo de manejo como hecho/condición pertinente; no es necesario simular cada bote. Si falta acceso o ayudante compatible, queda limitada/suspendida y se explica. No roba ni frena automáticamente al objetivo.

### 10.3. ESPD03 — No abandonar tirador

Identifica objetivo protegido y ámbito. Restringe ayudantes que lo abandonarían. No sube atributos ni vuelve imposible que el atacante reciba/anote.

Si la doble necesita precisamente ese ayudante y no hay otro compatible, respeta la restricción y no fabrica otro defensor. Mensaje suficiente: «Doble no ejecutada: sin ayudante compatible con no abandonar».

Cuando dos instrucciones hacen irrealizable una nueva configuración conjunta, recházala con explicación y conserva la última válida. Cuando el conflicto aparece solo en una interacción concreta, conserva las restricciones válidas y registra la limitación deportiva. No «arregles» ambos casos violando el objetivo protegido.

### 10.4. Objetivos ausentes y ORG06

| Situación | Respuesta |
|---|---|
| Principal disponible y viable | Principal. |
| Principal ausente y alternativa individual designada disponible | Alternativa compatible. |
| Ninguno de los designados en cancha | Suspender instrucción; no inventar otra estrella objetivo. |
| Falta ejecutor previsto | Alternativo funcional elegible o limitación explícita. |
| Regresa principal y la intención sigue vigente | Recuperar en próxima reorganización pertinente. |
| Se sustituyó la intención por otra orden manual | Mantener el nuevo plan; no restaurar el anterior por reentrada. |

ORG06 necesita objetivo y perseguidor. Cuando ninguno de sus objetivos designados está disponible, la alternativa preconfigurada es **ORG02 zona 2–3**. El plan puede declarar otra organización admitida y realizable. No generes una cadena infinita de alternativas ni un objetivo oculto.

La caja de cuatro más perseguidor solo cuenta como box and one efectiva mientras se ejecuta. Los tramos en ORG02 alternativa no se registran como persecución al jugador ausente.

El cambio a alternativa conserva reloj, posesión y compromisos hasta su frontera válida. La vuelta del objetivo no teletransporta al perseguidor ni deshace una orden manual posterior.

## 11. Operaciones compartidas y costes

### 11.1. Un modelo de resolución

Reutiliza preparación, contención/separación, desmarque, pantalla, posición, protección, pase/recepción, intercepción, ayuda/recuperación, contacto, oposición, tiro, rebote y balón dividido del núcleo actual.

El contenido defensivo decide quién tiene responsabilidad, qué puede intentar y qué concede. Las recetas comunes resuelven con los actores reales. No construyas un motor por zona, por cruce zona×ficha o por instrucción especial.

Las recetas de adecuación para asignación son decisiones de utilización, no un segundo bono sobre la resolución. Las tendencias orientan elección; no suben la capacidad defensiva o el acierto rival.

### 11.2. Riesgos excluyentes y compatibles

Conserva resultados excluyentes y relaciones compatibles de los mecanismos vigentes. Una misma intervención no recibe simultáneamente una pérdida de la fase de presión, otra del robo y otra de la finalización si son la misma causa.

Separa decidir intentar robo, ejecutarlo y atribuir recuperación. No sortees un robo añadido después de una pérdida ya atribuida a otra causa incompatible. Una pérdida puede no tener robo acreditado; un desvío sin control no lo es.

Puedes componer tareas en una resolución. No exige tres nuevos sorteos para toda intervención; reutiliza resultados/candidatos realmente calculados. Si separas una interacción nueva con riesgo propio, declara exposición y qué cobro anterior sustituye o complementa legítimamente.

### 11.3. Carga y tiempo

El intervalo deportivo se computa una vez para minutos y energía. Aplica el encargo de presión/cobertura/recuperación a los actores implicados. Si dos etiquetas describen el mismo esfuerzo en el mismo intervalo, usa una carga compuesta declarada y acotada, no multiplicaciones duplicadas.

La energía sigue 100–70 casi neutra y deterioro selectivo fuerte en reserva crítica. Un jugador con 30 puede seguir siendo útil; no lo retiras por una regla nueva al elegir total. La rotación básica vigente sigue funcionando; su librillo completo llega después.

Una recuperación que añade una reorganización real consume su duración compartida. No sumes esa duración completa si el mismo intervalo ya la incluía. Los relojes, ventanas y continuidad prevalecen.

## 12. Interfaz, órdenes, panel y diagnóstico

### 12.1. Preparación y dirección

Añade controles claros y agrupados: organización, altura, cinco estilos, cobertura preparada, roles defensivos, marcas y especiales con objetivos/alternativas. Los detalles se abren; no hace falta vigilar decenas de medidores a la vez.

Mantén la preparación de ataque y sus fichas. Los roles defensivos se editan de forma independiente. La pantalla principal conserva marcador, periodo/reloj, quinteto, energía/faltas, plan resumido, pendientes y relato.

Los cambios de organización/roles/marcas entran en la siguiente asignación o reorganización pertinente; estilos en la siguiente decisión defensiva no resuelta; cobertura en la siguiente interacción compatible. No obligues siempre a esperar otra posesión si existe una frontera deportiva válida antes.

Aplica el ciclo de MOTOR-02: borrador, solicitud, validación, espera, vigencia y cierre. La configuración conjunta se valida junta. No convierte una orden vigente en una ejecución exitosa ni reescribe lo ocurrido.

Muestra intención y organización efectiva cuando divergen: «2–3 activa como alternativa: objetivo fuera de pista», «Cambio pendiente de reorganización», «Doble limitada por no abandonar».

### 12.2. Mismo panel administrable

Amplía DEF01–DEF07, CON02, las referencias de RES/ACT pertinentes y ENT07/SUP01–SUP04. DEF08 de saques y DEF09 de memoria conservan su cobertura posterior; no marques DEF completo por haber creado sus filas de catálogo.

Enlaza las fichas de organización/cobertura al diccionario, responsabilidades y parámetros consumidos. Las tablas nuevas llevan tipo, unidad, límites, procedencia SEM y versión. Las constantes deportivas ajustables no quedan escondidas en código.

Si «Repertorio» continúa como consulta de definiciones, la edición administrable de campos soportados debe estar accesible en la tabla maestra o su editor de detalle. No conviertas «solo lectura» en una excusa para ocultar los pesos/compatibilidades que prometemos controlar. El panel no edita operaciones nuevas como código.

Perfiles nuevos se crean como candidatas explícitas y se validan; no migres silenciosamente el activo antiguo. La activación afecta a futuros encuentros. Los partidos y comparaciones conservan su configuración efectiva congelada.

### 12.3. Registro y visibilidad

Conserva referencias y responsables actuales, amenaza/sector conocido, causa de cambio, participantes de cobertura/ayuda, responsabilidad abandonada, recuperación y consecuencia. No narres cambios que el motor no resolvió.

Registra intención, orden, vigencia y organización/cobertura efectivas; objetivo, alternativa, suspensión y retorno. El diagnóstico enlaza las filas reales del perfil congelado que se usaron.

No añadas todas las marcas al relato de cada ataque. Basta una explicación deportiva cuando importa: «El cambio deja al exterior sobre el interior», «La ayuda libera la salida», «La trampa fuerza un pase, pero deja recepción corta».

La vista propia muestra su plan y motivos. El rival observa ejecución, no el panel privado ni objetivos todavía no revelados. La política automática recibe conocimiento permitido antes de decidir, sin futuras tiradas ni energía/momento rival exactos.

Estadísticas avanzadas mantienen su entrega. Conserva, eso sí, hechos suficientes para tramos efectivos y diagnósticos sin inventar robos, tapones, asistencias o méritos colectivos.

### 12.4. Exportación/reproducción

Actualiza versiones de contenido/formato cuando corresponda y conserva entradas, perfil efectivo, semillas, órdenes y referencias defensivas necesarias. La reproducción de la versión actual vuelve a calcular el partido por el mismo núcleo.

No reutilices el ID de perfil anterior con otros valores ni declares compatibles exports antiguos solo porque un JSON parsea. El rechazo debe decir qué versión no es compatible, preservando el archivo.

## 13. Perfil inicial y semillas explícitas

El anexo A propone **SEM-MOTOR05-20261016**, sin calibrar. Reutiliza referencias/recetas aceptadas de contención, negación, ayuda, pase, contacto, oposición y rebote. No cambies sus probabilidades de tiro para que se noten las zonas.

La base de MOTOR-05 debe estar completa para el subconjunto activo. Los mecanismos futuros permanecen identificados como pendientes, sin rellenarlos con ceros. Validación estructural y evaluación deportiva son estados separados.

Los planes guardados no cambian a una zona por actualizar el código. Conserva ORG01 y sus campos válidos; crea una candidata explícita de perfil para las nuevas filas y ofrece los selectores nuevos. Para facilitar pruebas permite copiar el plan y cambiar una organización/cobertura, sin una recomendación de «mejor defensa».

Si falta un rol defensivo en una entrada anterior, no inventes una capacidad: precarga por función actual de quinteto y marca SEM editable: PG Contenedor, SG Perseguidor de tiradores, SF Ayudador de equipo, PF Interior móvil, C Protector del aro. No sobrescribas un rol ya declarado ni conviertas esta precarga en prohibición por posición nominal.

Si un dato posterior aceptado ya cubre una semilla del anexo, usa esa versión y documenta correspondencia. Si falta una magnitud indispensable distinta de las cubiertas o de sus referencias compartidas, informa del dato exacto; no lo calibres por intuición.

## 14. Verificación acotada y recorrido manual

### 14.1. Casos pequeños necesarios

Reutiliza herramientas/checks vigentes y comprueba reglas mediante pocos casos parametrizados:

1. Integridad de 6 organizaciones, 5 estilos×5 niveles, 3 alturas, 4 coberturas, 12 roles y 3 especiales; referencias y realizabilidad.
2. Responsabilidades zonales distintas ante la misma amenaza; no cinco marcas rígidas ni referencia sin acceso.
3. Marcas manuales, función y estabilidad; posición nominal no prohíbe ni añade penalización de ejecución.
4. Cambio conserva responsables actuales; show compromete y recupera; trampa concede una opción potencial detrás y no duplica el especial.
5. Ayuda libera responsabilidad; no abandonar limita al ayudante; el perseguidor dedicado no ayuda violando su encargo.
6. Objetivo ausente: alternativa individual/ORG02; retorno solo si la intención sigue vigente, sin restaurar una orden sustituida.
7. Presión alta consume exposición/tiempo/carga reales y puede ser superada; no restaura defensa ideal ni cobra la misma pérdida varias veces.
8. Contacto de falta táctica tiene actor/acceso, clasificación/administración real y caducidad; no ordena directamente parar el reloj.
9. Robo/desvío/tapón/control diferenciados, incluyendo la revisión V09.
10. Estimación V05 no usa futuro ni RNG oculto; cobertura de V01 contrastada con los contratos, no solo con tests que reflejan el código.

No necesitas un partido completo por cada fila ni simular hasta que ocurra un caso raro. Usa estados controlados claramente identificados como fixtures, sin fabricar estadísticas de un partido real.

### 14.2. Partidos completos de cierre

Referencia acotada: **cinco ejecuciones completas**, reutilizando sus registros:

- Base individual/drop frente al ataque vigente, semilla `20261016`; puede reutilizarse como revisión de coherencia del 90–126 si reproduce exactamente esa versión/entrada.
- Variante 2–3 con mismo ataque para inspeccionar responsabilidades y concesiones.
- Variante 1–3–1 con presión adelantada compatible, para recorrer recuperación y funciones de fondo.
- Variante box and one con objetivo explícito y guion de sustitución/retorno o cambio manual que permita observar alternativa.
- Repetición/reproducción de una de esas entradas en otro modo con idénticas órdenes deportivas, para equivalencia de la versión.

ORG03/ORG05 y coberturas no recorridas en esos encuentros se validan con casos pequeños y el recorrido manual. No exige otra campaña de partidos automáticos. Si un error concreto justifica una ejecución adicional, documenta la causa; no abras un barrido de semillas.

Comprueba acta, reloj, minutos, energía, quintetos, referencias, cierre y ausencia de duplicaciones. No exijas ganar a la variante defensiva ni un tanteo objetivo. Un cambio causal puede existir aunque un marcador coincida.

### 14.3. Recorrido manual para Dennis

Publica la lista en `docs/prompts/MOTOR-05-recorrido-manual.md` o equivalente aprobado, con arranque/URL reales del repositorio. El informe anterior cita `npm run dev` y `http://localhost:5173/`; compruébalos antes de copiarlos como definitivos.

| Prueba | Resultado que revisar |
|---|---|
| Salvedades MOTOR-04 | Resumen V01/V03/V05/V09 con comprobación, cambios y límites; no aprobación genérica de V01–V13. |
| Organizaciones | Seis opciones y funciones comprensibles, sin bonus general por nombre. |
| Estilos | Cinco dimensiones, nivel 3 Equilibrado; presión al balón separada de altura y robo. |
| Roles | Doce opciones defensivas independientes del rol ofensivo y sin cambiar notas. |
| Marcas | Asignación válida, cambio de cobertura y consulta del responsable actual. |
| Zonas | Recepciones altas, laterales/interiores y concesiones distintas por funciones. |
| Cambio | Emparejamiento resultante persiste hasta una corrección real. |
| Show | Continuador puede quedar disponible durante recuperación, sin automatismo de canasta. |
| Atrapar/doble | Compromiso de dos, salida potencial y efecto de un receptor que decide. |
| No abandonar | Restringe ayuda; una doble puede quedar limitada por falta de ayudante compatible. |
| Box and one | Objetivo, perseguidor, alternativa 2–3 por ausencia y retorno válido. |
| Cambio manual durante ausencia | Elegir individual impide que vuelva automáticamente box and one al reentrar el objetivo. |
| Alturas | Normal/tres cuartos/total; presión superada conserva recuperación y coste. |
| Falta táctica | Solicitud no para el reloj; ejecución/caducidad y sanción visibles. |
| Panel | Nuevas filas y SEM localizables; cambios vía candidata, comparación y activación explícitas. |
| Modos | Total/cuarto/tiempo comparten deporte y órdenes en ventanas pertinentes. |
| Exportación | Archivo actual reproduce con sus parámetros; anterior incompatible se explica sin sobrescritura. |
| Regresión | Fichas ofensivas, disposiciones, jugadores, +1/+3/+5, tiempos muertos y rotación siguen utilizables. |

Si no puedes usar una interfaz real en tu entorno, dilo. No registres que has hecho clics por leer el código ni que Dennis validó MOTOR-05 hasta que lo confirme.

## 15. Ejecución, documentación y criterios de cierre

### 15.1. Pasos

1. Confirma base y estado de MOTOR-04/MOTOR-03. Crea `feature/MOTOR-05-defensa-completa` o rama equivalente según normas y entorno.
2. Archiva **este prompt íntegro**, incluido anexo, en `docs/prompts/MOTOR-05-defensa-completa.md` o equivalente aprobado. Registra preparado/ejecutando/completado/revisión pendiente según lo ocurrido.
3. Haz la revisión acotada de salvedades de §2; corrige solo lo necesario para sostener la ampliación. Conserva evidencia y estado de cada punto.
4. Carga fichas de organización, funciones, roles y cobertura sobre tareas compartidas y perfil SEM explícito.
5. Conecta asignación/estabilidad y responsables actuales; después coberturas, ayuda/recuperación, presión y especiales, manteniendo partidos completos ejecutables.
6. Completa órdenes/interfaz y el mismo panel/perfiles, con datos congelados, validación y trazabilidad.
7. Ejecuta checks acotados, partidos de cierre y recorrido UI posible; corrige fallos del objetivo.
8. Actualiza páginas temáticas, índices, mapa técnico, cobertura, estado, changelog y catálogo de prompts. Añade `docs/tecnico/motor05.md` o equivalente con correspondencias de grupos/consumidores y cierre de las salvedades relacionadas.
9. Entrega commits coherentes y PR sin fusionar. Si el entorno exige una rama distinta de PR, documenta la relación con la rama de trabajo y los commits; no ocultes dónde quedó el resultado.

Preserva funcional completo de consulta y originales históricos. No copies todo en otra pared de texto del repositorio. Distingue definición, semilla e implementación comprobada. No declares «defensa final calibrada» por estar todos los selectores.

### 15.2. Consumo y continuidad

Referencia de tamaño: hasta aproximadamente el 50 % de la ventana de cinco horas de Claude Code, sin garantía de consumo. Si no es medible, dilo. No atribuyas porcentajes sin indicador ni añadas trabajo para agotar cuota.

Si una limitación de sesión impide completar, guarda checkpoint útil: rama/commit, último estado ejecutable, comprobaciones reales, bloqueo y siguiente paso. No declares acabado un sistema que solo tiene nombres ni empieces MOTOR-06 por tu cuenta.

Pruebas automáticas justas; Dennis hará mucha validación manual. No añadas E2E masivos, snapshots gigantes, tests espejo de cada fila ni una campaña de cientos de partidos. Ejecuta los checks requeridos pertinentes y amplía solo si aparece un fallo que lo justifique.

### 15.3. Criterios de cierre

- [ ] Salvedades comunicadas de MOTOR-04 contrastadas y documentadas sin aprobación ciega ni recalibración por marcador.
- [ ] Seis organizaciones con funciones y concesiones distintas, sin multiplicadores universales ni individual disfrazada.
- [ ] Cinco estilos, tres alturas, cuatro coberturas y navegación preparada con efectos/limitaciones reales.
- [ ] Doce roles, marcas y adecuación funcional sin prohibiciones nominales ni bonus de talento.
- [ ] Referencia y responsabilidad actual diferenciadas; cambios/ayudas/desajustes persisten hasta modificación pertinente.
- [ ] Presión superada, show y trampa dejan compromisos reales; no duplican oposición, pérdidas, duración o energía.
- [ ] ESPD01–ESPD03 operativas y administradas; doble respeta no abandonar y reutiliza atrapar.
- [ ] Box and one tiene objetivo/alternativa explícitos, ORG02 precargada y retorno sin violar órdenes posteriores.
- [ ] Oposición, tapón, rebote/control y cierre usan participantes con acceso; no inventan créditos.
- [ ] Ataque completo y tres modos siguen funcionando sobre el mismo motor por acontecimientos y contexto pequeño.
- [ ] Panel, perfiles, importación/exportación y diagnóstico incorporan filas reales nuevas con procedencia/consumidores.
- [ ] Reproducción actual y rechazo de incompatibilidad anteriores correctos; perfiles/partidos históricos preservados.
- [ ] SEM y pendientes de futuras entregas visibles; no se certifica calibración ni cierre de los 81 grupos.
- [ ] Verificación acotada, recorrido manual y documentación entregados con estado real.
- [ ] Prompt íntegro en Git, commits y PR revisable sin fusionar.

Respuesta final breve: qué puede probar Dennis, comandos/URL reales, semilla/perfil, pruebas hechas, salvedades cerradas o limitadas con evidencia, rutas del recorrido y prompt, PR o rama/commits y limitaciones. No sustituyas el resultado por número de tests/líneas.

## 16. Anexo A: extensión SEM

### 16.1. Naturaleza

Propuesta explícita de ChatGPT para iniciar esta entrega. No son frecuencias reales ni probabilidades de victoria. Conserva los datos aceptados existentes para campos equivalentes; aplica estos solo a responsabilidades nuevas/no cubiertas y registra procedencia.

```json
{
  "id": "SEM-MOTOR05-20261016",
  "status": "SEM: provisional, no calibrado",
  "scope": "Defensa por funciones y tareas compartidas; sin memoria, saques tácticos completos ni calibración global",
  "styles": {
    "additionalHelpOddsRatio": [0.25, 0.55, 1, 1.5, 2],
    "closePressureChoiceOddsRatio": [0.5, 0.75, 1, 1.35, 1.7],
    "receiverDenialChoiceOddsRatio": [0.5, 0.75, 1, 1.4, 1.8],
    "stealAttemptChoiceOddsRatio": [0.4, 0.7, 1, 1.4, 1.8],
    "interiorProtectionChoiceWeight": [1.6, 1.25, 1, 0.8, 0.6],
    "exteriorProtectionChoiceWeight": [0.6, 0.8, 1, 1.25, 1.6]
  },
  "newChoiceReferences": {
    "closePressureChoiceP0": 0.5,
    "receiverDenialChoiceP0": 0.5,
    "stealAttemptGivenAccessP0": 0.25,
    "symmetricTaskP0": 0.5
  },
  "assignment": {
    "perimeterFit": {"TEC12": 0.6, "FIS03": 0.25, "MEN04": 0.15},
    "interiorFit": {"TEC13": 0.6, "FIS04": 0.25, "TEC17": 0.15},
    "screenPursuitFit": {"TEC16": 0.6, "TEC12": 0.25, "FIS03": 0.15},
    "helpRecoveryFit": {"MEN04": 0.35, "TEC12": 0.25, "TEC13": 0.25, "FIS02": 0.15},
    "roleFitWeight": 1.25,
    "otherRoleFitWeight": 1,
    "retainedReferenceScorePoints": 0.5,
    "nominalPositionExecutionPenalty": 0
  },
  "pressureAdvance": {
    "normalUsesExistingAdvance": true,
    "newAdvancedInteractionBaseWeights": {
      "controlledAdvance": 0.6,
      "delayedAdvance": 0.15,
      "pressureBeaten": 0.15,
      "turnover": 0.06,
      "contact": 0.04
    },
    "advanceDurationFactorByHeight": {"normal": 1, "three_quarters": 1.1, "full": 1.2},
    "committedActorLoadByHeight": {"normal": 1, "three_quarters": 1.1, "full": 1.2},
    "closePressureExposureWeightFactor": 1.15,
    "closePressureBeatenWeightFactor": 1.2,
    "delayedAdvanceAdditionalSeconds": [0.5, 1.5, 3]
  },
  "coverage": {
    "committedActorLoad": {"COB01": 1, "COB02": 1.05, "COB03": 1.15, "COB04": 1.25},
    "sameTaskTwoDefenderMixture": {"primary": 0.65, "second": 0.35},
    "referenceNavigation": {"COB01": "over", "COB02": "exchange", "COB03": "over_and_recover", "COB04": "joint_commitment"}
  },
  "specials": {
    "boxAndOneDefaultFallback": "ORG02",
    "tacticalFoulAttemptGivenAccessP0": 0.65,
    "defaultTacticalFoulScope": "declared_opponent_possession_next_legal_opportunity",
    "automaticNewTargetByReputation": false,
    "duplicateTrapCommitmentAllowed": false
  }
}
```

### 16.2. Aplicación precisa de estilos y referencias

Para un factor de *odds* `f` y referencia `p`, utiliza `f*p/(1-p+f*p)`; conserva p=0/1. Los factores de ayuda actúan sobre la referencia vigente de ayuda adicional, no sobre funciones estructurales de zona. Los de presión/receptores/robo orientan decisiones distintas y elegibles; no se convierten en bonus de ejecución o conversión rival.

Protección interior/exterior pondera tareas candidatas de cobertura/ayuda con acceso. No multiplica directamente la calidad defensiva ni el acierto rival. Una función obligatoria sigue siendo obligatoria aunque el peso de preferencia de otra amenaza sea alto.

`symmetricTaskP0=0.5` es referencia de una tarea binaria de acceso/recuperación simétrica **solo si no hay otra referencia aceptada**. Utiliza la sensibilidad compartida vigente, capacidades de los actores y oposición pertinente; no es 50 % de canasta, robo o recepción garantizada. No añadas esa binaria si el hecho ya está resuelto dentro de otra operación compuesta.

### 16.3. Adecuación y estabilidad

Las recetas de adecuación son medias ponderadas de capacidades propias en escala 1–30; no un overall. Asigna la receta a la función correspondiente: perímetro/contención, interior/poste, persecución de pantalla o ayuda/recuperación.

El sesgo de rol 1,25 se usa una vez para adecuación de la función favorecida del catálogo, no para ejecutar mejor después. La estabilidad suma 0,5 puntos de adecuación por referencia previa conservada compatible, antes de elegir la mejor asignación realizable. Obligaciones y marcas válidas se resuelven antes, sin competir como pesos.

Si utilizas capacidad corporal, reutiliza solo la pertinencia/normalización ya aceptada; estas recetas no autorizan otra prima corporal. Si no existe criterio adicional cargado para una función, utiliza su receta pertinente y rol, sin inventar un número por altura.

### 16.4. Avance presionado y riesgos sin duplicación

La tabla nueva describe **resultados excluyentes** de una interacción de avance adelantado que el motor aún no tuviera. No se ejecuta además de otra tabla que ya resuelve ese mismo avance. Normal mantiene el mecanismo vigente y la presión cercana puede intervenir después donde realmente corresponda.

Los pesos se normalizan sobre resultados elegibles y se ajustan con las sensibilidades/recetas vigentes de protección, contención, intervención y contacto. Control/demora/superación reflejan el contraste entre poseedor y defensor pertinente; pérdida/contacto usan sus causas. No se concede robo por elegir `turnover`: atribución requiere intervención y control reales.

El factor de presión cercana 1,15 pondera exposición a pérdida y contacto de esa interacción; el factor 1,2 pondera posibilidad de que el defensor comprometido sea superado. La contención más cercana también restringe opciones/espacio según su tarea de oposición real, no mediante una reducción universal de tiro. No apliques esos factores de nuevo por cada pase rutinario de la misma exposición.

El factor temporal por altura actúa una vez sobre la duración de avance vigente. `delayedAdvanceAdditionalSeconds` es una triangular adicional solo al resultado de demora y solo si ese tiempo no está ya incluido en el mecanismo usado. No acortes los resultados para evitar la violación de avance; administra relojes reales y fin de periodo.

Si el núcleo ya tiene una resolución equivalente de avance que basta, conserva su modelo y referencias aceptadas, integra altura/participantes y documenta correspondencia. No cambies a esta tabla únicamente por estar en el anexo.

### 16.5. Carga, dos defensores y especiales

La carga por altura/cobertura corresponde a los actores comprometidos y el intervalo de la tarea. Si ambas etiquetas describen el mismo esfuerzo, usa el máximo de sus factores —no su producto— junto con los límites de carga vigentes. Si son intervalos/tareas deportivos distintos, cada uno conserva su coste real una vez.

La mezcla 0,65/0,35 se usa únicamente cuando los dos defensores participan en la misma tarea agregada y no existe otra receta aceptada. No añade la defensa completa de ambos ni impide evaluar tareas distintas como contención del primero y cierre de línea del segundo. La ventaja de la trampa también procede de las opciones que restringe; su coste, de las responsabilidades que deja.

La referencia 0,65 de ESPD01 representa posibilidad de iniciar un intento pertinente con acceso, si falta un mecanismo vigente de intención/ejecución. No representa la probabilidad de una sanción favorable. La oportunidad, el contacto efectivo y su clasificación se administran aparte conforme al perfil, sin otro sorteo arbitrario que permita escoger sanción.

La alternativa ORG02 y la ausencia de objetivos improvisados son decisiones funcionales ya aceptadas, no valores deportivos para calibrar. No se desactivan para ajustar un ratio.

### 16.6. Qué cambia y qué permanece pendiente

Esta extensión amplía defensa efectiva, asignación, presión, coberturas y especiales; recoge los límites comunicados de MOTOR-04. No recalibra por el 90–126 ni redefine atributos, libro, ritmo o técnicas de tiro.

Conserva cobertura pendiente de DEF08/DEF09, saques, ESP completo, Forma/momentos, memoria, entrenador avanzado y cierre reglamentario extraordinario no necesario para los hechos activos. No certifica perfil final completo de 81 grupos ni realismo evaluado.
