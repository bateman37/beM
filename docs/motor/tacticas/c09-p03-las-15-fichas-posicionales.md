<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: tacticas](README.md) · Capítulo 9 — Repertorio declarativo: tareas, continuaciones y fichas · parte 3 de 4
> Anterior: [c09-p02-las-17-tareas-compartidas](c09-p02-las-17-tareas-compartidas.md) · Siguiente: [c09-p04-las-20-situaciones-espontaneas](c09-p04-las-20-situaciones-espontaneas.md)
<!-- beM:nav-fin -->

<a id="grupo-09-07"></a>

### 9.7. Las 15 fichas posicionales

*Procedencia: MD07, §19.*

<a id="src-md07-l0742"></a>

#### 9.7.1. Contrato común de las fichas POS

*Origen: MD07 §19.1.*

Los identificadores POS01–POS15 fijan el contenido inicial. Cada ficha admite prioridad 1–5 del plan y participantes sustituibles por función. La prioridad no forma parte de su calidad intrínseca.

Las disposiciones indicadas son entradas naturales. La compatibilidad efectiva se decide por las funciones necesarias y la reorganización realmente disponible; una lista de ejemplos no debe convertirse en una matriz arbitraria de victorias entre disposiciones.

Una llamada se consume al inicio efectivo. Evaluar la ficha o pedirla no cuenta como inicio. Tras comenzar, una negación puede derivar a otra opción o seguridad. El registro distingue esas situaciones de una llamada que nunca llegó a iniciar.

Las fichas permiten finalización, contacto, pérdida, desvío o continuación según los hechos pertinentes. Ninguna concede un tiro garantizado. Los pesos, duraciones y costes se consultan en sus grupos comunes; no se copian dentro de cada ficha.

<a id="src-md07-l0752"></a>

#### 9.7.2. POS01 — Bloqueo directo central con continuación

*Origen: MD07 §19.2.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo directo; director superior, bloqueador disponible y apoyos que no ocupen de forma incompatible la continuación. Entradas naturales DIS01, DIS02 y DIS04. |
| Participantes | Manejador, bloqueador, posibles receptores y defensores que intervienen. |
| Intención | Crear separación central y amenaza del continuador hacia aro. |
| Requisitos | Balón controlado, posibilidad de iniciar pantalla y referencia de recepción o avance. La técnica baja dificulta ejecución; no invalida por sí sola la existencia de la función. |
| Lecturas | Espacio del manejador, oposición al continuador, ayuda comprometida y receptor que deja de estar protegido. |
| Opciones | Tiro/penetración del manejador; CONT01 hacia aro; CONT03 si se dispone de recepción corta; CONT04/CONT05 ante ayuda. |
| Seguridad | CONT08 o CONT09 si existen control y tiempo; CONT07 si se reconoce otra vía compatible. |
| Registro | Inicio de familia, cobertura ejecutada, responsables actuales, receptor, continuidad y oportunidad final. |

El cambio defensivo conserva el emparejamiento resultante. Una contención que concede tiro no garantiza que el manejador lo acepte o convierta. La defensa puede recuperar si resuelve una interacción pertinente.

<a id="src-md07-l0767"></a>

#### 9.7.3. POS02 — Bloqueo directo lateral con continuación

*Origen: MD07 §19.3.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo directo desde referencia lateral; amplitud y apoyo de salida compatibles. |
| Participantes | Manejador lateral, bloqueador, referencia de seguridad y receptores pertinentes. |
| Intención | Atacar la relación lateral y generar continuación o ayuda desde ese lado. |
| Requisitos | Línea funcional de inicio y espacio no ocupado de forma incompatible. El lado se representa por sector, sin trayectoria continua. |
| Lecturas | Orientación de la contención, espacio de avance, continuador y defensa que puede comprometer ayuda. |
| Opciones | Ataque del manejador; CONT01; CONT03 cuando existe recepción intermedia; CONT04 hacia receptor liberado. |
| Seguridad | Rechazo compatible CONT07, salida CONT08 o inversión/reorganización con tiempo. |
| Registro | Lado conocido, cobertura, ayudante real, responsabilidad abandonada y origen de la oportunidad. |

La diferencia respecto a POS01 reside en las relaciones y apoyos disponibles. No recibe otra probabilidad general de tiro simplemente por llamarse lateral.

<a id="src-md07-l0782"></a>

#### 9.7.4. POS03 — Bloqueo directo central con apertura

*Origen: MD07 §19.4.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo directo central con función de apertura exterior del bloqueador. DIS01, DIS02 o entrada alta compatible. |
| Participantes | Manejador, bloqueador que abre y apoyos. |
| Intención | Combinar ataque del balón y recepción exterior tras la pantalla. |
| Requisitos | Referencia exterior disponible para abrir y línea de envío pertinente. La amenaza depende de las capacidades reales. |
| Lecturas | Compromiso sobre manejador, defensor que recupera y ayuda que puede negar la apertura. |
| Opciones | Ataque propio; CONT02 al abierto; ataque a recuperación o CONT05 desde su recepción. |
| Seguridad | Conservar y distribuir si la defensa no concede ventaja; CONT09 cuando es viable. |
| Registro | Apertura ofrecida, recepción intentada/obtenida, oposición y decisión posterior. |

Que el bloqueador abra no convierte a un no tirador en amenaza competente. Puede recibir y distribuir; el motor debe permitir que la defensa lo respete menos si su información deportiva lo justifica.

<a id="src-md07-l0797"></a>

#### 9.7.5. POS04 — Bloqueo directo lateral con recepción corta

*Origen: MD07 §19.5.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo lateral con salida intermedia para recibir y decidir. |
| Participantes | Manejador, receptor corto y referencias de aro/exterior compatibles. |
| Intención | Utilizar el compromiso defensivo sobre balón para crear una decisión intermedia. |
| Requisitos | Ventana de recepción y funciones que permitan otra opción después. La lectura del receptor se evalúa al recibir. |
| Lecturas | Si hay espacio para avanzar o tirar, ayuda interior y receptor exterior liberado. |
| Opciones | CONT03; desde ella finalización, pase a aro, CONT04 o CONT05. El manejador conserva opción propia si se la conceden. |
| Seguridad | No forzar el envío si la línea no está disponible; CONT08/CONT09 compatibles. |
| Registro | Compromiso de dos defensores cuando existe, pase, recepción y decisión del receptor corto. |

La calidad del director inicial no sustituye Visión, Decisiones o Pase del receptor que toma la siguiente decisión. No se representa automáticamente una superioridad perfecta después del envío.

<a id="src-md07-l0812"></a>

#### 9.7.6. POS05 — Mano a mano desde cabecera

*Origen: MD07 §19.6.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Mano a mano; poseedor alto y exterior que puede acercarse a una entrega. |
| Participantes | Poseedor, receptor y apoyos compatibles. |
| Intención | Crear recepción con continuidad de tiro o ataque desde la relación de entrega. |
| Requisitos | Control, proximidad funcional representada y entrega posible. No hace falta una trayectoria de encuentro calculada por segundos. |
| Lecturas | Seguimiento, negación de la entrega, cambio y apoyo menos protegido. |
| Opciones | Recibir y tirar; atacar con balón; devolver; conservar el poseedor si la defensa anticipa; CONT04/CONT05. |
| Seguridad | Mantener control con el poseedor o salida CONT08. |
| Registro | Entrega intentada/negada, conservación, receptor y preparación del tiro si aparece. |

La conservación por el poseedor es una alternativa del contenido ya previsto, no otra familia. La principal del tiro y la preparación se deciden por el gesto final.

<a id="src-md07-l0827"></a>

#### 9.7.7. POS06 — Mano a mano desde ala

*Origen: MD07 §19.7.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Mano a mano desde referencia lateral con apoyos de ese lado y salida alternativa. |
| Participantes | Poseedor lateral, receptor y ayuda de seguridad. |
| Intención | Crear una recepción o avance desde ala que comprometa seguimiento y ayudas pertinentes. |
| Requisitos | Entrega realizable y ocupación compatible del espacio de avance. |
| Lecturas | Persecución, cambio, negación y recuperación defensiva posterior. |
| Opciones | Tiro tras recepción; penetración; devolución o conservación; CONT04/CONT05. |
| Seguridad | Pase a referencia disponible o reorganización, sin regalar una salida si está negada. |
| Registro | Sector lateral, intervención defensiva y continuidad real. |

La variante reutiliza entrega, desmarque y control. El contexto lateral puede cambiar qué receptores se ofrecen; no añade un multiplicador independiente de eficacia.

<a id="src-md07-l0842"></a>

#### 9.7.8. POS07 — Indirecto descendente para recepción

*Origen: MD07 §19.8.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo indirecto descendente que ofrece salida de receptor. |
| Participantes | Pasador, bloqueador, receptor y apoyos. |
| Intención | Obtener recepción preparada del jugador liberado. |
| Requisitos | Funciones de pantalla, salida y envío compatibles. El pasador debe tener una línea real. |
| Lecturas | Seguimiento por pantalla, negación, cambio y alternativa del cortador. |
| Opciones | Recepción para tiro o avance; CONT06 ante negación; salida del bloqueador si el contexto la ofrece. |
| Seguridad | Mantener balón en pasador y utilizar otra referencia disponible. |
| Registro | Pantalla útil o negada, desmarque, recepción, preparación y responsabilidad final. |

La utilidad del bloqueador puede registrarse aunque otro dé la asistencia. No se conceden dos asistencias oficiales ni una canasta por haber elegido un tirador en movimiento.

<a id="src-md07-l0857"></a>

#### 9.7.9. POS08 — Indirecto hacia el exterior

*Origen: MD07 §19.9.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Bloqueo indirecto que busca separación y recepción exterior. |
| Participantes | Pasador, bloqueador, receptor exterior y referencias restantes. |
| Intención | Separar seguimiento y ofrecer envío a una referencia de tiro. |
| Requisitos | Espacio exterior compatible y línea de pase posible. |
| Lecturas | Persecución, cambio, negación exterior y corte disponible. |
| Opciones | Tiro tras recepción; atacar recuperación; CONT06 si niegan la salida; CONT05 para otra ventaja. |
| Seguridad | Conservar o invertir si la salida no existe. |
| Registro | Opción ofrecida, recepción obtenida/negada, preparación y oposición real. |

La calidad de la oportunidad se decide antes del acierto. Un tiro convertido no vuelve exitosa retrospectivamente una pantalla que no produjo separación.

<a id="src-md07-l0872"></a>

#### 9.7.10. POS09 — Pase y corte

*Origen: MD07 §19.10.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Pase a apoyo y corte del emisor hacia espacio disponible. |
| Participantes | Emisor/cortador, receptor que decide y referencias de seguridad. |
| Intención | Crear devolución o desplazar responsabilidad mediante el corte. |
| Requisitos | Pase inicial y corte compatibles con ocupación y reloj. |
| Lecturas | Seguimiento del cortador, ayuda interior y opciones que abre su movimiento. |
| Opciones | Devolución para finalizar; CONT05 al liberado; mantener ataque si el corte solo fija. |
| Seguridad | No forzar devolución; conservar con receptor y continuar. |
| Registro | Pase inicial, corte útil, envío posterior y resultado, distinguiendo fijación de recepción. |

No todo corte útil recibe balón. El análisis puede registrar utilidad resuelta sin inventar una recepción ni un pase que no se produjo.

<a id="src-md07-l0887"></a>

#### 9.7.11. POS10 — Puerta atrás ante negación

*Origen: MD07 §19.11.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Pase y corte; alternativa a una recepción negada. |
| Participantes | Pasador, receptor negado que corta y apoyos. |
| Intención | Aprovechar la responsabilidad adelantada del defensor. |
| Requisitos | Negación pertinente y espacio de corte/enlace posible. No se activa contra cualquier defensa por nombre. |
| Lecturas | Acceso al corte, ayuda interior y seguridad del envío. |
| Opciones | Recepción hacia aro; pase a otra referencia si la ayuda responde; continuidad si la línea se cierra. |
| Seguridad | Conservar sin envío forzado y reorganizar cuando proceda. |
| Registro | Negación observada, corte, ventana, intento de pase y respuesta real. |

La negación puede crear riesgo de puerta atrás, pero no garantiza que pasador y cortador lo perciban ni que completen el envío.

<a id="src-md07-l0902"></a>

#### 9.7.12. POS11 — Poste bajo

*Origen: MD07 §19.12.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Juego al poste con referencia baja y apoyos de pase/salida. |
| Participantes | Receptor de poste, pasador, posibles cortadores y tiradores. |
| Intención | Ganar recepción y crear finalización o ventaja ante ayuda. |
| Requisitos | Posición/recepción posible; ocupación compatible y tiempo de creación. |
| Lecturas | Defensa de recepción, oposición actual, doble/ayuda y compañero liberado. |
| Opciones | Recurso de poste; tiro según gesto; CONT04/CONT05 al liberado; CONT06 de compañero. |
| Seguridad | Devolver, invertir o reorganizar sin asumir recepción profunda automática. |
| Registro | Recepción solicitada y obtenida, creación de poste, ayuda y principal de tiro real. |

TEC11 crea la opción. TEC03, TEC04 o la técnica exterior correspondiente resuelve el tiro. La existencia de un desajuste ayuda solo en sus tareas pertinentes y puede provocar respuesta defensiva.

<a id="src-md07-l0917"></a>

#### 9.7.13. POS12 — Recepción alta para distribuir

*Origen: MD07 §19.13.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Juego al poste con receptor alto que organiza desde recepción. |
| Participantes | Receptor alto, pasador de entrada y referencias de corte/tiro. |
| Intención | Crear otra opción desde una recepción que concentra atención defensiva. |
| Requisitos | Recepción alta y funciones de salida compatibles. |
| Lecturas | Cortes, receptor liberado, oposición propia y posibilidad de conservar. |
| Opciones | Pase al corte; CONT05 exterior; tiro viable del receptor; entrega o continuidad conocida compatible. |
| Seguridad | Devolución al apoyo y CONT09 si no aparece ventaja. |
| Registro | Entrada, opciones representadas, decisión del receptor y resultado del envío/tiro. |

Interior pasador es un rol de uso. No regala Visión ni Pase. Un jugador competente puede ordenar la continuidad sin que todas sus intervenciones activen momento colectivo.

<a id="src-md07-l0932"></a>

#### 9.7.14. POS13 — Alto-bajo

*Origen: MD07 §19.14.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Juego al poste con dos referencias interiores compatibles, una alta y otra baja. |
| Participantes | Receptor alto, referencia baja, pasador de entrada y salidas exteriores. |
| Intención | Utilizar relación entre interiores para obtener recepción favorable o desplazar ayuda. |
| Requisitos | Dos funciones interiores realizables y línea de enlace que la defensa puede negar. DIS03 y entradas equivalentes son naturales. |
| Lecturas | Sello/negación de la referencia baja, ayuda y salida exterior. |
| Opciones | Pase alto-bajo; tiro del receptor alto; CONT05; corte o continuación si la ayuda desplaza responsabilidades. |
| Seguridad | Devolver o reorganizar conservando el contexto. |
| Registro | Posiciones funcionales, recepción alta, intento al bajo y oposición final. |

Dos interiores también pueden congestionar opciones. La ficha no concede simultáneamente todo el beneficio interior y amplitud perfecta del exterior.

<a id="src-md07-l0947"></a>

#### 9.7.15. POS14 — Aclarado desde cabecera

*Origen: MD07 §19.15.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Aclarado con atacante superior y apoyos que permiten su intención. |
| Participantes | Atacante principal, defensor actual y receptores de salida. |
| Intención | Crear desde el duelo y aprovechar la respuesta de ayudas. |
| Requisitos | Control del atacante y organización compatible para iniciar esa intención. |
| Lecturas | Separación, vía de penetración, tiro, ayuda y compañero liberado. |
| Opciones | Tiro tras creación; penetración; CONT04/CONT05; conservación. |
| Seguridad | Salida disponible o continuidad cuando el duelo no ofrece ventaja. |
| Registro | Inicio deliberado, oposición, creación y salida. |

Una acción directa sin ficha no se etiqueta automáticamente como POS14. Esta ficha exige que la intención organizada de aclarado haya comenzado realmente.

<a id="src-md07-l0962"></a>

#### 9.7.16. POS15 — Aclarado lateral

*Origen: MD07 §19.16.*

| Campo | Desarrollo funcional |
|---|---|
| Familia y entrada | Aclarado desde ala o referencia lateral. |
| Participantes | Atacante lateral, defensor actual y apoyos compatibles. |
| Intención | Atacar desde esa relación lateral y sus vías reales. |
| Requisitos | Espacio y salida compatibles con ocupación y reloj. |
| Lecturas | Dirección de contención, ayuda de fondo/interior, tiro y pase de salida. |
| Opciones | Penetración, suspensión, CONT04/CONT05 o CONT07. |
| Seguridad | Devolver o reorganizar si existe tiempo. |
| Registro | Sector conocido, duelo, ayuda y resolución pertinente. |

La línea lateral puede limitar alternativas en el contexto representado. No se simulan coordenadas para expresar esa limitación ni se atribuye ventaja universal a esta variante.

<a id="src-md07-l0977"></a>

#### 9.7.17. Terminación de la colección POS

*Origen: MD07 §19.17.*

La colección contiene cuatro fichas de bloqueo directo, dos de mano a mano, dos de indirecto, dos de pase y corte, tres de poste y dos de aclarado. Total: 15.

Antes de cargarla como contenido utilizable deben estar resueltas referencias de tareas, participantes, compatibilidad, continuaciones y perfiles de tiempo/riesgo. La descripción funcional anterior no sustituye esa validación de datos.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c09-p02-las-17-tareas-compartidas](c09-p02-las-17-tareas-compartidas.md) · Siguiente: [c09-p04-las-20-situaciones-espontaneas](c09-p04-las-20-situaciones-espontaneas.md)
