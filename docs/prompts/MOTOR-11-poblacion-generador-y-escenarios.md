# MOTOR-11 — Población de referencia, generador y escenarios

> Prompt para Claude Code en **beM**. Objetivo del roadmap: hacer utilizables los doce equipos de referencia y sus 144 jugadores, añadir generación ficticia correlacionada reproducible y preparar variantes controladas de laboratorio.
>
> No es una calibración, una temporada ni un generador de carreras. Las semillas de población y planes que concreta este prompt son SEM. No aportan bonificaciones durante el partido.

## Índice

1. [Mandato y normas](#1-mandato-y-normas)
2. [Base real y lectura dirigida](#2-base-real-y-lectura-dirigida)
3. [Alcance y resultado esperado](#3-alcance-y-resultado-esperado)
4. [Decisiones sobre los pendientes de MOTOR-10](#4-decisiones-sobre-los-pendientes-de-motor-10)
5. [Las 144 fichas de referencia](#5-las-144-fichas-de-referencia)
6. [Doce equipos y planes naturales](#6-doce-equipos-y-planes-naturales)
7. [Libros, funciones y participación](#7-libros-funciones-y-participación)
8. [Generador correlacionado sencillo](#8-generador-correlacionado-sencillo)
9. [Cuerpo, edad, tendencias y estados generados](#9-cuerpo-edad-tendencias-y-estados-generados)
10. [Identidad y reproducción de la generación](#10-identidad-y-reproducción-de-la-generación)
11. [Edición masiva y variantes](#11-edición-masiva-y-variantes)
12. [Escenarios de contraste](#12-escenarios-de-contraste)
13. [Conservar, restaurar y comparar](#13-conservar-restaurar-y-comparar)
14. [Interfaz y flujo completo](#14-interfaz-y-flujo-completo)
15. [Tablas administrables y validación](#15-tablas-administrables-y-validación)
16. [Versiones visibles, perfiles y compatibilidad](#16-versiones-visibles-perfiles-y-compatibilidad)
17. [Verificación y recorrido manual](#17-verificación-y-recorrido-manual)
18. [Documentación y entrega](#18-documentación-y-entrega)
19. [Criterios de aceptación](#19-criterios-de-aceptación)

## 1. Mandato y normas

Implementa MOTOR-11 sobre el núcleo existente y completa el recorrido desde la interfaz. Dennis debe poder seleccionar cualquiera de los doce equipos, inspeccionar las doce fichas, modificar planes o datos, generar una alternativa ficticia y ejecutar encuentros con esas entradas.

Reglas obligatorias:

- Trabaja exclusivamente en beM. No inspecciones `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios.
- No añadas capacidades, un overall, experiencia como multiplicador, reputación de equipo, durabilidad, potencial o atributos de entrenador.
- El partido mantiene resolución por acontecimientos dentro de posesiones. No añadas ticks, coordenadas continuas, movimientos ni otro motor para jugadores generados.
- Las 144 fichas preparadas anteriormente son la referencia. No vuelvas a sortearlas al abrir Plantillas ni las reemplaces por copias genéricas.
- Capacidad, tendencia, rol y estado son cosas distintas. Un tirador no recibe precisión por su etiqueta; una capacidad alta no impone una preferencia máxima.
- Las correlaciones de generación solo construyen entradas. No se reaplican como bonus al resolver tareas del encuentro.
- Toda generación es reproducible con datos y versión identificados. No utiliza el RNG de un partido ni depende del reloj del ordenador.
- Originales protegidos, variantes explícitas y entradas congeladas al comenzar un partido. No alteres encuentros iniciados o históricos al editar una ficha.
- Parámetros SEM en datos administrables. No ajustes plantillas ni fórmulas para que una identidad gane o produzca un marcador objetivo.
- Pruebas automáticas justas y significativas. Dennis hará mucho test manual. No simules todos los cruces ni cientos de equipos para cerrar esta entrega.
- Conserva cambios locales ajenos, no resetees ramas ni reescribas historial y no fusiones la PR.
- No cambies framework, base de datos, infraestructura o despliegue.

El tamaño orientativo sigue siendo aproximadamente la mitad de una ventana de cinco horas de Claude Code. No prometas ni inventes una medición de cuota. No añadas alcance para consumirla. Si un límite real impide terminar, deja un punto de continuación preciso y no declares ejecutable un bloque que solo tenga documentación.

## 2. Base real y lectura dirigida

### 2.1 MOTOR-10 y rama

Dennis comunica MOTOR-10 implementado. El informe recibido describe la PR `bateman37/beM#11` abierta contra `main`; **no hay en este mensaje confirmación expresa de su fusión**.

Comprueba el estado real:

1. Si `main` ya contiene MOTOR-10, crea desde esa base actualizada la rama de MOTOR-11.
2. Si MOTOR-10 sigue en su rama y está disponible, trabaja sobre su commit real, documenta la dependencia y prepara una PR dependiente que muestre solo MOTOR-11. No fusiones MOTOR-10 por tu cuenta.
3. Si no puedes acceder a una base con MOTOR-10, identifica esa dependencia concreta; no lo reimplementes desde el informe ni trabajes sobre MOTOR-09 fingiendo que está integrado.

Nombre propuesto: `feature/MOTOR-11-poblacion-y-generador`, o el que imponga el entorno. Conserva rama y commit base efectivos.

### 2.2 Punto de partida declarado

Verifica antes de modificar:

- 141 pruebas, diez nuevas de MOTOR-10.
- `data:check` y comprobación documental correctos.
- Referencia `20261016`: 83–103, con 6.505 sorteos deportivos.
- MOTOR-10 es lector: no cambió deporte, acta ni `export/8`.
- Perfil de lectura con 23 filas nuevas y sufijo `SEM-MOTOR10-20261016`.
- Análisis con diez vistas y exportación JSON, CSV y Markdown.
- Recorridos manuales MOTOR-08/09/10 pendientes de Dennis.

No declares ejecutadas comprobaciones solo porque figuren en este informe.

### 2.3 Lectura por índices

Lee instrucciones raíz, estado, roadmap y catálogo de prompts. Consulta:

- Funcional de población y generación; capítulo 25 del unificado y anexo de las 144 plazas.
- Inventario POB01–POB03, roles, funciones, tendencias, escenarios y edición masiva.
- **Prompt archivado MOTOR-01, anexos A/B y datos derivados:** contienen las 144 fichas numéricas SEM explícitas, aunque solo dos equipos fueran jugables entonces.
- MOTOR-04/05/06 para catálogos y compatibilidades reales, sin releer todo su historial.
- MOTOR-07/08 para estados, rotación, políticas y copias de contraste existentes.
- `docs/tecnico/motor10.md`, particularmente §14, cobertura y consultas pendientes.
- Código/datos actuales de plantillas, preparación, perfiles, guardado, motor y export.

Los adjuntos históricos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen las decisiones vigentes de beM. Este encargo parte del funcional disponible y del informe recibido; no afirma haber auditado el código de la PR.

## 3. Alcance y resultado esperado

Queda operativo:

1. EQ01–EQ12 seleccionables y jugables, cada uno con doce fichas completas e identidad estable.
2. Planes naturales editables con quinteto, director/alternativas, roles, disposición, defensa, estilos, libros, rotación y política.
3. Generación de un equipo ficticio de doce jugadores desde perfiles existentes, con dependencias explícitas y semilla.
4. Inspección y edición de todos los campos pertinentes de ficha.
5. Edición masiva +1/+3/+5 sobre selección de atributos/jugadores, límite 30 y reversión real.
6. Copias y escenarios de contraste identificados, comparables con una base protegida.
7. Guardado, restauración y export/import de las entradas del escenario según los soportes existentes.
8. Un encuentro con cualquiera de esas entradas en los tres modos actuales, seguido del análisis MOTOR-10.
9. Versión de aplicación visible coherente entre consola y web, separada de perfil y datos.

No incluye calendario, progresión/envejecimiento de carrera, mercados, salud persistente, nacionalidades reales, presupuesto, clubes reales, lotes masivos, generador universal de ligas ni calibración poblacional.

MOTOR-12 será ejecución masiva y extracción completa; MOTOR-13, auditorías/sensibilidad/calibración; MOTOR-14, rendimiento/cierre. No absorbas esas entregas ni declares completo el motor por terminar la población.

## 4. Decisiones sobre los pendientes de MOTOR-10

### 4.1 Lado del tiro

La decisión funcional ya está tomada: diez sectores cuando existe el detalle y desconocido cuando no existe. No hace falta decidir si se desea un mapa ficticiamente preciso.

Para MOTOR-11:

- Conserva lado/sector específico si procede de una ficha, asignación o interacción funcional realmente resuelta.
- Si solo se conoce interior/media/exterior, mantén esa resolución y `lado desconocido`.
- No sortees izquierda/derecha al presentar el mapa ni introduzcas una nueva simulación espacial para completarlo.
- Una etiqueta «lateral» sin lado específico no basta para elegir izquierda o derecha.

Un campo opcional puede conservar el detalle conocido en nuevos hechos. No rellenes retrospectivamente lo desconocido. La cobertura del mapa seguirá siendo parcial donde el productor no dispone del dato, con motivo explícito.

### 4.2 Continuación de ventaja y desviación en asistencias

La política no queda aprobada en bloque por el informe «no cambié créditos». MOTOR-10 declara a la vez que la política cubre estados funcionales y que algunos de esos estados no tienen productor.

Revisa el punto preciso: si el motor ya decide continuación/creación nueva o una desviación real, conserva ese hecho compacto y úsalo en la atribución común. No añadas tiradas ni deduzcas esas categorías de que se anotó.

Si no existe la interacción, no inventes desviaciones para reducir asistencias ni declares verificado un criterio que el registro no distingue. Identifica el caso y su límite. El porcentaje observado de canastas asistidas no es un objetivo.

No construyas un subsimulador de botes ni reescribas todo el pase. Completar un dato de una operación existente es instrumentación; crear una operación deportiva ausente es otra dependencia y debe quedar reconocida.

### 4.3 Organización por hecho, ocupación y corte

- Organización defensiva: todo hecho pertinente nuevo debe poder relacionarse con la versión de plan/organización efectiva en su frontera. Reutiliza el historial de órdenes aplicadas; no la última intención guardada en preparación. Si un caso antiguo no permite reconstrucción, indícalo.
- Ocupación que limita ayuda y disponibilidad de corte: registra el resultado si la operación ya lo calcula. No equipares una ficha llamada a un corte disponible ni un tiro convertido a ocupación útil.
- Donde no exista la tarea resuelta, conserva `no registrado` y el productor pendiente. No publiques un cero ni una cifra inventada.

Estas carencias de productor no son nuevas decisiones sobre qué debe querer Dennis. El funcional ya exige hechos pertinentes y prohíbe inventarlos.

### 4.4 Dos consultas pendientes

Completa con las relaciones existentes:

1. **Cuota de cierres:** cierres atribuibles al jugador divididos por cierres elegibles del equipo en el mismo universo. Conserva filas colectivas/sin actor y la política real de autoría causal; no cargues al base un fin de período sin actor. Si el hecho no permite autoría, conserva esa ausencia, sin repartirla por azar.
2. **Producción por 100 en presencia completa:** `100 × créditos elegibles/ataques completos correspondientes`. Numerador y denominador se restringen a las mismas unidades; para defensa usa ataques rivales. Presencia parcial y unidades mixtas quedan separadas.

No confundas estas consultas con USG ni un overall. Reutiliza el catálogo MOTOR-10, con exposición, permiso y evidencia.

### 4.5 Deuda normativa y permisos

Conserva como deuda independiente lo no cerrado de MOTOR-09: fuentes, categorías/compensaciones no ejecutadas, inferioridad natural, tiro en vuelo/interferencia y suspensión persistida, según el estado real. Población nueva no equivale a reglamento completado.

En el informe público se puede identificar un actor/director **observable** mediante hechos permitidos. No se revela por ello la lista privada de prioridades de dirección, el libro o la procedencia interna de la elección. Si MOTOR-10 oculta cualquier identidad de director por defecto, distingue el dato observable de la configuración privada; no conviertas uno en el otro.

No expongas todos los datos del rival porque ambas fichas sean editables en el laboratorio: edición/diagnóstico y vista deportiva siguen siendo audiencias diferentes.

## 5. Las 144 fichas de referencia

### 5.1 Procedencia y protección

Los IDs canónicos son `EQ01-J01` a `EQ12-J12`. Reutiliza los valores explícitos del anexo B de MOTOR-01 y las correcciones posteriores expresamente aprobadas. Localiza su carga real; no extraigas números de una tabla cualitativa para reemplazar datos ya preparados.

Conserva procedencia por versión: dato inicial, revisión aceptada y edición del usuario. No copies los doce jugadores de EQ01 en todos los equipos ni generes de nuevo valores cada vez que se selecciona una plantilla.

Si falta un campo obligatorio posterior a MOTOR-01, completa mediante la política explícita vigente: estados neutrales, elegibilidad y funciones; no uses cero para una capacidad ausente.

### 5.2 Ficha completa

Cada jugador conserva:

- ID, equipo/dataset y nombre ficticio o etiqueta legible.
- Edad, posiciones recomendadas/admitidas según modelo y funciones posibles.
- Altura, envergadura y peso con unidad/procedencia.
- Exactamente 32 capacidades continuas 1–30: 18 técnicas, siete físicas y siete mentales.
- Los tres grupos de tendencias existentes: iniciativa, vocación de finalización y preferencias de zona.
- Rol ofensivo y defensivo independientes, con sus IDs del catálogo vigente.
- Estados iniciales del escenario: energía, Forma, tres momentos individuales, y disponibilidad cuando corresponda.
- Función de referencia, fortalezas/carencias descritas y relevos/alternativas del plan.

Cuerpo/edad no están dentro de las 32. No crees una capacidad de recepción, técnica, disciplina, potencial o experiencia para rellenar fichas.

### 5.3 Escala y experiencia

Mantén escala absoluta. No conviertas un 18 en percentil, media del equipo o una nota ajustada al nivel de la liga.

El caso de 40 años debe existir. El funcional identifica EQ07-J01 como referencia de 40 años; el anexo numérico inicial de MOTOR-01 le daba 37. **Precisión de contenido para esta entrega: la nueva revisión de referencia de EQ07-J01 tendrá 40 años, conservando sus capacidades/cuerpo salvo otra revisión explícita ya aprobada.** Conserva la versión inicial y no alteres variantes guardadas o partidos históricos.

La edad no modifica automáticamente el rendimiento. El veterano tiene las físicas menores y las técnicas/mentales preparadas en sus datos; no se les suma experiencia otra vez en partido. Los demás veteranos/jóvenes conservan las diferencias de las fichas, no una curva de envejecimiento nueva.

### 5.4 Estados por defecto

Para un escenario nuevo ordinario: energía 100, Forma neutral, M-TIR/M-OFE/M-DEF neutrales, T de equipo neutral y jugadores elegibles, conforme al contrato actual. Las copias que ya tengan otros estados conservan sus valores.

No arrastres la energía, faltas o memoria del último partido al siguiente escenario. Las diferencias iniciales deben estar declaradas. No añadas ruido inicial para que un equipo parezca vivo.

## 6. Doce equipos y planes naturales

### 6.1 Identidades y colocación inicial

Los planes siguientes son una precarga SEM explícita de MOTOR-11 basada en el funcional; se guardan como planes naturales nuevos/versionados. No sobrescriben los planes históricos de EQ01/EQ02 usados para 83–103 ni los de Dennis.

| Equipo | Identidad | Disposición natural | Organización/altura defensiva |
|---|---|---|---|
| EQ01 | Equilibrado | 4–1 | Individual, normal. |
| EQ02 | Exterior | 5 abiertos | Zona 3–2, normal. |
| EQ03 | Interior | 3–2 ofensivo | Zona 2–3, normal. |
| EQ04 | Dos creadores | Horns | Individual, normal. |
| EQ05 | Director pasador con poca anotación | 4–1 | Zona 1–2–2, normal. |
| EQ06 | Anotador dominante con lectura limitada | 5 abiertos | Individual, normal. |
| EQ07 | Veteranos técnicos y menos físicos | 1–4 bajo | Individual, normal. |
| EQ08 | Jóvenes atléticos y menor comprensión | 5 abiertos | Individual, normal. |
| EQ09 | Protección interior | 3–2 ofensivo | Zona 2–3, normal. |
| EQ10 | Velocidad y presión | 4–1 | Individual, tres cuartos. |
| EQ11 | Estrella con poco recambio | 4–1 | Individual, normal. |
| EQ12 | Plantilla profunda | Horns | Zona 1–2–2, normal. |

Mapea nombres a IDs reales del catálogo; no presupongas que una zona u organización corresponde a un número concreto.

Todas parten de `ENTREF02` y delegación automática ordinaria de las cinco áreas, modificable. Así la precarga no atribuye a talento una diferencia de entrenador oculta.

Cobertura base: contención compatible existente. En EQ10, mostrar/recuperar puede ser la preferencia si sus requisitos se cumplen; si no, la alternativa de contención debe constar declarada. No cambies una cobertura incompatible por un bonus.

### 6.2 Estilos ofensivos SEM

Orden de columnas: ritmo organizado, transición, elaboración, finalización interior/exterior, libertad, riesgo, después del tiro. Nivel 3 equilibrado; se utilizan las definiciones reales de los controles.

| Equipo | Ritmo | Transición | Elaboración | Finalización | Libertad | Riesgo | Tras tiro |
|---|---:|---:|---:|---:|---:|---:|---:|
| EQ01 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| EQ02 | 3 | 3 | 4 | 4 | 3 | 3 | 2 |
| EQ03 | 2 | 2 | 4 | 2 | 2 | 2 | 4 |
| EQ04 | 3 | 3 | 4 | 3 | 4 | 3 | 3 |
| EQ05 | 3 | 3 | 4 | 3 | 2 | 2 | 3 |
| EQ06 | 4 | 3 | 2 | 4 | 4 | 4 | 2 |
| EQ07 | 2 | 2 | 4 | 3 | 2 | 2 | 2 |
| EQ08 | 4 | 4 | 2 | 3 | 3 | 4 | 3 |
| EQ09 | 2 | 2 | 3 | 2 | 2 | 2 | 4 |
| EQ10 | 4 | 4 | 2 | 3 | 3 | 4 | 2 |
| EQ11 | 3 | 3 | 3 | 3 | 4 | 3 | 3 |
| EQ12 | 3 | 3 | 4 | 3 | 3 | 3 | 3 |

Media distancia: aceptar si está liberada para todos; EQ07 puede buscar con jugadores adecuados. Son preferencias, no prohibiciones ni ajustes de acierto.

### 6.3 Estilos defensivos SEM

Orden: ayudas, presión al balón, negación, riesgo de robo, protección interior/exterior. Última columna nivel 1 interior/5 exterior conforme al catálogo.

| Equipo | Ayudas | Balón | Negación | Robo | Protección |
|---|---:|---:|---:|---:|---:|
| EQ01 | 3 | 3 | 3 | 3 | 3 |
| EQ02 | 3 | 3 | 4 | 2 | 4 |
| EQ03 | 4 | 2 | 2 | 2 | 2 |
| EQ04 | 3 | 3 | 3 | 3 | 3 |
| EQ05 | 3 | 3 | 3 | 2 | 3 |
| EQ06 | 3 | 3 | 3 | 3 | 3 |
| EQ07 | 3 | 2 | 2 | 2 | 2 |
| EQ08 | 3 | 4 | 4 | 4 | 3 |
| EQ09 | 4 | 2 | 2 | 2 | 1 |
| EQ10 | 3 | 4 | 4 | 4 | 3 |
| EQ11 | 3 | 3 | 3 | 2 | 3 |
| EQ12 | 3 | 3 | 3 | 3 | 3 |

No equivale a comparar equipos con una sola causa distinta: los planes naturales y plantillas cambian varias entradas. Las variantes controladas del apartado 12 sirven para aislar preguntas.

## 7. Libros, funciones y participación

### 7.1 Libros posicionales

Precarga las quince fichas ya existentes, con prioridades de esta tabla. Las no listadas en P1/P2 quedan a prioridad 5. P1/P2 son preferencias compartibles; no cuotas ni turnos obligatorios.

| Equipo | Prioridad 1 | Prioridad 2 |
|---|---|---|
| EQ01 | POS01, POS05 | POS07, POS09, POS11 |
| EQ02 | POS03, POS07, POS08 | POS05, POS06, POS09 |
| EQ03 | POS11, POS13 | POS01, POS04, POS12 |
| EQ04 | POS01, POS05, POS12 | POS03, POS06, POS09 |
| EQ05 | POS01, POS09, POS12 | POS05, POS07, POS13 |
| EQ06 | POS14, POS15 | POS01, POS03, POS05 |
| EQ07 | POS11, POS12 | POS05, POS07, POS13 |
| EQ08 | POS01, POS09 | POS02, POS05, POS14 |
| EQ09 | POS01, POS11 | POS04, POS12, POS13 |
| EQ10 | POS01, POS02, POS09 | POS05, POS10, POS14 |
| EQ11 | POS01, POS14 | POS03, POS05, POS15 |
| EQ12 | POS01, POS05, POS12 | POS03, POS07, POS09 |

Referencias: POS01–04 directo, POS05–06 entregas, POS07–08 indirectos, POS09 pase/corte, POS10 puerta atrás, POS11 poste, POS12 distribución alta, POS13 alto-bajo, POS14–15 aclarados. Valida contra el catálogo real.

Una ficha puede requerir reorganización y consumir tiempo; no la declares entrada natural solo por estar a prioridad 1. Usa las compatibilidades existentes y muestra sus requisitos. Una prioridad baja sigue siendo utilizable cuando la lectura/contexto lo aconseje.

Los saques usan libros separados existentes. Precarga seguridad de banda/fondo a prioridad 1 y las otras dos fichas de cada tipo a prioridad 3; defensas correspondientes seguras como referencia y alternativas ya compatibles. No inventes más fichas ni llamadas garantizadas.

### 7.2 Quinteto y director

Reutiliza la composición de doce plazas del funcional. Para los nuevos planes naturales:

- Quinteto ordinario: J01, J03, J06, J08, J10.
- EQ02: J01, J04, J05, J08, J09.
- EQ03/EQ09: J01, J03, J06, J09, J11.
- EQ04/EQ12: J01, J12, J06, J09, J10.

Los Jxx pertenecen al equipo de la fila. Son cinco IDs distintos, no prohibiciones por posición nominal. Asigna funciones de la disposición mediante las recetas ya implementadas y valida el resultado.

Director: J01; alternativas ordenadas J12, J06, J02, omitiendo al ausente/incompatible y sin convertir la lista en un bonus. EQ04/EQ12 permiten dirección secundaria efectiva de J12 cuando el contexto la ofrece. Los receptores, incluida la estrella, siguen leyendo sus propias opciones.

Roles ofensivos/defensivos: los explícitos de cada plaza/ficha, con equivalencia a IDs actuales. No añadas aptitud por seleccionar un rol ni cambies una capacidad para hacer realizable una función.

### 7.3 Rotación y minutos

Usa el entrenador de MOTOR-08. Carga preferencias de relevo compatibles y director alternativo, no un cronómetro de sustituciones obligatorio.

Para completar planes sin minutos declarados, organiza cinco parejas funcionales con suplentes distintos de entre los siete no titulares. Elige desde las compatibilidades y prioridades de relevo existentes; la asignación concreta se materializa en datos y se revisa antes de activar el plan. No evalúes todos los quintetos posibles.

Objetivos SEM por pareja:

- Ordinario: titular 28, relevo 12 minutos.
- EQ07 y EQ12: 24/16.
- EQ08: 26/14.
- EQ11: pareja del anotador J03, 32/8; las otras cuatro, 28/12.

Suma 200 minutos reglamentarios por equipo. Los dos jugadores fuera de esas cinco parejas pueden quedar como recursos situacionales con objetivo cero; no todos deben jugar. Un jugador no recibe dos objetivos acumulados por cubrir dos funciones. Las prórrogas usan la política actual, no objetivos retrospectivos.

Los objetivos no fuerzan una sustitución perjudicial ni mantienen a un excluido. La estrella cansada puede seguir si su utilidad contextual lo justifica. El plan natural no garantiza un reparto exacto.

## 8. Generador correlacionado sencillo

### 8.1 Modelo aprobado para esta precarga SEM

Generador condicionado por plantillas de referencia: escoger una identidad EQ01–EQ12, utilizar sus doce perfiles numéricos como centros y perturbar mediante factores compartidos más residuo individual. Reutiliza roles/funciones y plan natural, con IDs reasignados.

Esto proporciona especialidades y dependencias sin una matriz estadística gigante ni 32 uniformes independientes. No pretende estimar la población real de una liga.

Entrada mínima: semilla, versión del generador/dataset, identidad base y dispersión. Ofrece dispersión contenida 0,5; ordinaria 1; amplia 1,5. No añadas un control de overall ni una fuerza de equipo que vaya al motor.

### 8.2 Distribución elemental

Usa variables triangulares centradas y acotadas:

`Z = U1 + U2 − 1`, con `U1/U2` uniformes reproducibles en [0,1).

No son valores de capacidad ni nuevas habilidades. Son variables internas temporales para generar entradas.

Para cada grupo g genera un factor de equipo `T_g` y, por jugador, un factor `Z_g`. Para cada capacidad genera residuo independiente `e_a`. Todos usan esta distribución elemental y streams de generación separados.

### 8.3 Ocho grupos que cubren exactamente las 32

| Grupo | Capacidades que comparten factor |
|---|---|
| G01 Tiro | TEC01, TEC02, TEC05, TEC06. |
| G02 Interior/finalización | TEC03, TEC04, TEC09, TEC11. |
| G03 Control/creación | TEC07, TEC08, TEC10. |
| G04 Defensa/rebote | TEC12, TEC13, TEC14, TEC15, TEC16, TEC17, TEC18. |
| G05 Movilidad | FIS01, FIS02, FIS03, FIS05. |
| G06 Contacto/estabilidad | FIS04, FIS07. |
| G07 Resistencia | FIS06. |
| G08 Lectura/mentales | MEN01, MEN02, MEN03, MEN04, MEN05, MEN06, MEN07. |

Cada capacidad tiene un grupo principal; las contribuciones cruzadas siguientes no cambian esa pertenencia. No intercambies IDs porque su etiqueta parezca otra; contrasta el diccionario de 32 actual.

### 8.4 Fórmula SEM de capacidad generada

Para capacidad a con centro `mu_a` del jugador de referencia:

`A_a = clamp(mu_a + d × [1,0 × T_g + 1,5 × Z_g + 0,75 × e_a + cruce_a], 1, 30)`.

`d` es la dispersión seleccionada. El resultado se conserva continuo; admite normalización técnica a tres decimales como parte identificada de la versión, nunca redondeo obligatorio a entero.

Precarga de cruces, sumados solo donde se indica:

| Capacidad | Cruce adicional |
|---|---|
| TEC08 Pase | `0,35 × Z_G08`. |
| TEC10 Sin balón | `0,35 × Z_G05`. |
| TEC12 Perimetral | `0,25 × Z_G05`. |
| TEC13 Interior | `0,25 × Z_G06`. |
| TEC15 Tapón | `0,25 × Z_G05 + 0,25 × Z_cuerpo`. |
| TEC17 Cierre | `0,25 × Z_G06`. |
| TEC18 Captura | `0,25 × Z_G05 + 0,25 × Z_cuerpo`. |
| FIS04 Fuerza | `0,35 × Z_cuerpo`. |
| FIS01 Velocidad | `−0,20 × Z_cuerpo`. |
| FIS03 Agilidad | `−0,20 × Z_cuerpo`. |
| Resto | 0. |

`Z_cuerpo` es el factor individual del apartado 9. Los centros ya conservan las especialidades y carencias de cada plantilla. No normalices la suma final de las 32 para igualar equipos ni fuerces una capacidad alta a bajar porque otra salió alta.

Los factores tienen residuo y variación: no hacen idénticos a todos los mentales ni convierten a cada jugador alto en buen defensor. Los coeficientes son SEM administrables, no correlaciones medidas o una promesa empírica.

## 9. Cuerpo, edad, tendencias y estados generados

### 9.1 Cuerpo relacionado, sin doble efecto

Genera un factor de equipo `T_cuerpo`, uno individual `Z_cuerpo` y residuos por medida, con la misma distribución centrada. Centros H/W proceden del perfil elegido.

Precarga SEM:

- `altura = H_base + d × (2 × T_cuerpo + 3 × Z_cuerpo + e_altura)` cm.
- `peso = peso_base + d × (1,5 × T_cuerpo + 2 × Z_cuerpo + 0,75 × e_peso)` kg.
- `envergadura = altura + (envergadura_base − H_base) + d × (Z_cuerpo + e_envergadura)` cm.

Respeta los límites admitidos por el contrato corporal vigente. Como precarga de generación adulta, usa altura 170–220 cm, peso 55–140 kg y envergadura 170–235 cm; la diferencia envergadura−altura queda entre −2 y +20 cm. Intersecta esos límites al aplicar la restricción, sin generar un intervalo imposible.

Son límites de esta población ficticia de laboratorio, no afirmaciones clínicas o universales. Si el contrato vigente es más restrictivo, informa de la correspondencia y conserva una única validación consistente.

El factor corporal permite dependencia con algunas capacidades generadas. Durante el partido se utilizan únicamente los efectos corporales ya aprobados; peso no añade otra Fuerza oculta, ni la correlación del generador vuelve a multiplicar el contacto.

### 9.2 Edad

Conserva el perfil joven/veterano de la identidad base. Perturba la edad de referencia como entero en ±2 años mediante su stream propio: `edad_base + floor(5 × U) − 2`, con U uniforme en [0,1). Acota EQ08 a 18–23, EQ07 a 34–42 y el resto a 18–42.

La generación usa los centros de capacidades de esa identidad; no aplica después otra curva de edad a las 32. No simula potencial, declive de carrera ni aprendizaje. La ficha manual EQ07-J01 de 40 años sigue siendo la referencia controlada, aunque una generación desde EQ07 pueda crear otra edad.

### 9.3 Tres grupos de tendencias

Usa las tendencias de la plantilla elegida como centros y variación acotada independiente. No las deduzcas determinísticamente del valor de una capacidad.

Precarga:

- Iniciativa: `clamp(iniciativa_base + 0,10 × d × e_iniciativa, 0, 1)`.
- Vocación de finalización: `clamp(vocacion_base + 0,10 × d × e_vocacion, 0, 1)`.
- Preferencias de aro/media/triple: a cada componente añade `0,05 × d × e_zona`, limita a no negativo y normaliza para sumar 1. Si la suma queda cero, conserva el vector base válido, dejando constancia de la salvaguarda.

Mapea estas unidades a las reales del repositorio si se representan de otra forma. No dupliques preferencias en dos escalas ni conviertas Iniciativa en otra de las 32.

Un gran tirador puede tener menor vocación o iniciativa. Un creador atrevido puede leer mal. El residuo y los centros permiten variedad sin exigir combinaciones perfectas.

### 9.4 Roles, posiciones, plan y estados

El generado hereda recomendación de posición y roles funcionales de su plaza base, como datos editables. No hereda el ID personal del jugador de referencia ni un permiso automático para ejecutar todas las fichas.

Remapea todos los IDs del plan: titulares, director/alternativas, relevos, encargos, objetivos propios y receptores. No dejes referencias a jugadores del equipo original. Los objetivos rivales se vinculan al preparar el enfrentamiento, no a un jugador arbitrario incrustado en el generado.

Estados iniciales ordinarios neutrales del apartado 5, modificables en escenario. No se generan Forma o momentos extremos para compensar capacidades bajas. La semilla de población no determina el resultado de un partido.

## 10. Identidad y reproducción de la generación

### 10.1 RNG separado

Reutiliza la implementación determinista existente en una instancia o streams propios de generación. No toques el estado de una simulación abierta.

Deriva streams de forma estable por tipo/equipo/plaza/campo o grupo. Conserva algoritmo y derivación versionados. No uses `Math.random`, `Date.now`, orden de render, contador de previsualizaciones o idioma de la UI para construir capacidades.

Misma semilla, versión de generador, dataset y configuración → mismos valores, posiciones/roles y plan lógico. Otra semilla debe producir variaciones reales, no solo nombres diferentes.

Si el repositorio ya tiene derivación estable, úsala. Si no, la elección técnica reversible de hash/serialización debe quedar documentada con orden canónico y prueba de reproducción. No es una decisión deportiva nueva.

### 10.2 Procedencia e IDs

Conserva semilla de generación, configuración efectiva, versión de receta/dataset, perfil/plaza origen, valores finales y fingerprint canónico.

Distingue identidad lógica reproducible de instancia de escenario. Dos copias del mismo equipo pueden enfrentarse sin colisión de IDs; conserva `sourceId`/plaza y remapeo explícito a IDs de instancia únicos dentro del partido. Esa instancia/remapeo se congela en el export.

No cambies los valores para resolver una colisión de nombres. No introduzcas sal aleatoria en la generación para que cada clic dé otra cosa sin cambiar la semilla visible.

Nombres ficticios legibles pueden proceder de un catálogo versionado o etiquetas estables de plaza. No consultes servicios de nombres ni jugadores reales. Identidad y dorsal no influyen en el desempeño.

### 10.3 Guardar valores, no solo una receta

Una generación aceptada se materializa como doce fichas y plan completos, con su procedencia. No depende de regenerarlos con la versión más reciente al abrir un encuentro antiguo.

La receta permite repetir la creación; el partido conserva sus entradas efectivas. Reproducción de un encuentro y regeneración de población son contratos distintos.

## 11. Edición masiva y variantes

### 11.1 Selección y botones

Permite seleccionar uno, varios o todos los jugadores de un equipo; una o varias capacidades, un grupo técnico/físico/mental o las 32. Botones +1, +3, +5.

El cambio es por puntos absolutos: `nuevo = min(30, anterior + incremento)`. Un 29 con +3 pasa a 30. Conserva la precisión continua de valores como 17,35; no los conviertas a 17 antes de sumar.

Antes de confirmar muestra jugadores/capacidades afectados, número de celdas, incremento y saturaciones. Una selección vacía no modifica nada. No incluyas edad, cuerpo, tendencias, energía o Forma en el botón de atributos.

El control modifica entradas de preparación/variante, no un partido ya iniciado.

### 11.2 Deshacer y restaurar

Deshacer restaura los valores anteriores exactos. No se implementa restando el incremento: una celda saturada 29→30 con +3 debe volver a 29, no a 27.

Restaurar referencia vuelve a la revisión elegida y muestra alcance. Guardar variante crea una identidad derivada sin reemplazar original. Conserva el mecanismo de historial/undo existente; no construyas un sistema de ramas dentro de la aplicación.

### 11.3 Otros campos

Energía, Forma, momentos, edad, medidas, tendencias, roles, plan y política tienen edición propia con sus unidades/validaciones. Modo diagnóstico claramente identificado para estados no ordinarios.

Cambiar un rol no cambia atributos; cambiar edad no recalcula físicas; cambiar cuerpo no vuelve a generar Fuerza. Toda edición masiva de esos campos, si se reutiliza, tiene alcance separado y explícito.

## 12. Escenarios de contraste

Reutiliza las copias C00–C06 existentes cuando correspondan; no las sustituyas o dupliques con otros nombres sin necesidad. Añade un catálogo versionado de escenarios de MOTOR-11 con pregunta, base, diferencias exactas y variables conservadas.

| ID propuesto | Pregunta y cambio declarado |
|---|---|
| LAB11-00 | Referencia histórica congelada de EQ01/EQ02 y planes de MOTOR-10, para comprobar regresiones. |
| LAB11-01 | Los doce planes naturales, con entradas originales protegidas y elección libre de rival. |
| LAB11-02 | Energía: mismo jugador a 100 frente a 30; una tercera copia a 8 para reserva crítica. Forma/momentos/capacidades iguales. |
| LAB11-03 | Referente cansado y recambio: EQ11 con J03 a 30 frente al mismo equipo con J03 a 100; resto igual. Contraste separado con EQ12, declarado multicausa. |
| LAB11-04 | Iniciativa: copias del mismo director a 0,2 y 0,8; mismas capacidades y plan. |
| LAB11-05 | Lectura: mismo director con MEN02/MEN03 +3 frente a base; iniciativa idéntica. Es una intervención en dos capacidades explícitas. |
| LAB11-06 | Veterano/joven: EQ07 frente a EQ08 como contraste multicausa; incluye acceso a EQ07-J01 de 40 años. Copia de edad sola opcional para comprobar que la etiqueta no añade rendimiento. |
| LAB11-07 | Forma: mismo jugador a −0,5 y +0,5, energía y momentos iguales, en la escala vigente o conversión explícita. |
| LAB11-08 | Libro: libertad nivel 1 frente a 5, conservando prioridades y capacidades; muestra prioridades compartidas. |
| LAB11-09 | Carga/balance: después del tiro nivel 2 frente a 4, resto igual. |
| LAB11-10 | Objetivo entra/sale: orden y alternativa box and one ya declaradas, con aplicación de cambios en ventanas reales. No se retira/reintroduce por magia. |
| LAB11-11 | Consistencia/momentos/importancia: reutiliza copias MOTOR-07 y sus mecanismos sin inventar otro estado. |
| LAB11-12 | Generado reproducible: identidad base EQ04, semilla de generación 20261017, dispersión 1; rival y semilla deportiva independientes. |

Son accesos a entradas y preguntas, no tests automáticos obligatorios uno por uno. Los escenarios de diagnóstico se rotulan como preparados; no se presentan como acontecimientos naturales.

Para la variante de energía 30 no obligues a que el entrenador mantenga al jugador: debe poder hacerlo si la comparación contextual lo justifica. Tampoco garantiza que +3 en Pase produzca más asistencias en un solo partido.

Los datos neutros/fijos de cada copia no se arrastran desde el último encuentro. Guarda las órdenes previstas con sus fronteras cuando un escenario las necesita.

## 13. Conservar, restaurar y comparar

### 13.1 Objeto de escenario

Identidad, descripción/pregunta, fuente/revisión, equipos/fichas, planes, estados, políticas/delegación, importancia, semilla deportiva y configuración de generador si existe. Distingue base y variante y conserva un diff legible por campo.

No hace falta guardar dentro del escenario el historial entero de partidos. Cada partido identifica el snapshot de entrada que utilizó.

### 13.2 Persistencia de trabajo

Reutiliza el soporte actual de perfiles/planes/escenarios. Guardar, recargar, duplicar y restaurar debe funcionar sin alterar el original. Si falta persistencia para escenarios, implementa el mínimo coherente con el almacenamiento ya utilizado; no migres de tecnología por este motivo.

Un candidato inválido se conserva para corregirlo con sus errores, pero no se inicia un partido inválido como si estuviera preparado. No sustituyas campos ausentes por valores silenciosos.

Export/import de un escenario utiliza un contrato versionado, validación y remapeo de instancia. Importar no ejecuta texto/código ni sobrescribe una referencia protegida por coincidencia de nombre.

### 13.3 Comparación útil, sin lotes

Vista base/variante con:

- Datos que cambian, saturaciones y campos conservados.
- Planes, contexto y versiones.
- Resultados de encuentros individuales disponibles y acceso al mismo análisis MOTOR-10.
- Aviso cuando se cambian varias causas, o la muestra es un solo partido.

Misma semilla deportiva ayuda a comparar, pero un cambio de decisión puede modificar los sorteos posteriores. No prometas resultados emparejados ni mejor rendimiento en cada encuentro.

No construyas todavía lanzadores de 10/100/1.000 partidos, percentiles poblacionales, ZIP de lotes o un informe causal. El escenario queda preparado para MOTOR-12.

## 14. Interfaz y flujo completo

### 14.1 Plantillas

Selector visible de los doce equipos de referencia, generados y variantes. Cada tarjeta identifica tipo/revisión, doce jugadores y descripción funcional. No muestra una fuerza global de equipo.

Lista/ficha con agrupación de las 32 capacidades, roles separados, cuerpo, edad, tendencias y estados autorizados. Acceso a edición masiva, deshacer/restaurar, duplicar/guardar variante y diff.

Seleccionar un equipo no cambia silenciosamente el rival o su plan. Cambiar a otro equipo revalida IDs del propio plan; no deja al director de EQ01 en EQ09.

### 14.2 Generador

Controles: identidad base, semilla, dispersión y nombre/etiqueta opcional. Acciones previsualizar, volver a generar con otra semilla, guardar como equipo/variante y usar en preparación.

La previsualización muestra doce perfiles y diferencias respecto a sus centros, sin proclamarlos equilibrados/calibrados. Guardar fija valores y procedencia. No generar automáticamente al renderizar cada ficha.

### 14.3 Preparación y partido

Elegir equipos/variantes, cargar plan natural explícitamente, revisar quinteto/director/roles/libros/defensa/rotación, semilla deportiva e importancia. Validación antes de iniciar, con causas concretas y posibilidad de revisar la ficha necesaria.

Las tres modalidades siguen usando el mismo núcleo. Después del partido, análisis MOTOR-10 con identidad histórica y entradas efectivas. Cambiar una plantilla tras acabar no altera esa acta ni sus informes.

### 14.4 Escenarios y comparación

Puede ser una sección dentro del laboratorio existente. No crees otro menú de producto enorme. Filtros por pregunta/origen y vista base/variante; acceso de un clic a preparar el partido correspondiente.

Las herramientas administrativas/diagnósticas no se mezclan con información deportiva ordinaria. Una población ficticia editable no elimina los permisos de informes.

## 15. Tablas administrables y validación

### 15.1 Responsabilidades

| Grupo | Contenido |
|---|---|
| POB01 | 12 equipos, 144 fichas/revisiones y planes naturales materializados. |
| POB02 | Receta de generación, grupos, coeficientes, límites, dispersión, semillas/derivación. |
| POB03 | Perfiles funcionales y tres grupos de tendencias, con límites y normalización. |
| CON/ENT existentes | Compatibilidad, roles, planes, relevos y dirección sin duplicar resolutores. |
| LAB existente | Escenarios, pregunta, base, diferencias y trazabilidad. |
| EST existentes | Dos consultas pendientes y relaciones instrumentadas del apartado 4. |
| SUP01–SUP04 | Diccionario, versiones, historial y cobertura/validación. |

Mapea a tablas físicas existentes; no crees otra tabla maestra paralela. Parámetros de generación en panel con unidad, origen SEM, versión y punto de consumo. La receta no es un campo ejecutable de JavaScript.

### 15.2 Validación mínima

- Doce equipos canónicos y doce plazas distintas por equipo; 144 IDs únicos y todos los campos completos.
- Exactamente las 32 capacidades acordadas, continuas finitas en 1–30.
- Tres grupos de tendencias válidos y vector de preferencias normalizado.
- Cuerpo, edad y estados dentro del contrato vigente, sin unidades ambiguas.
- Roles y referencias existentes; cinco titulares distintos y elegibles.
- Director/alternativas y relevos remapeados al equipo/instancia correcto.
- Objetivos de minutos coherentes cuando se definen, sin sumas dobles.
- Disposición, fichas, funciones y defensa realizables o con reorganización/alternativa explícita; no aprobación automática por nombre.
- Cada capacidad tiene un grupo generador principal; cruces y coeficientes referencian IDs reales.
- Misma receta/seed/dataset reproduce valores y referencias; preview no consume RNG de partido.
- Variantes protegidas de sobrescritura accidental y snapshots históricos inmutables.

Conserva los contrastes cualitativos del funcional mediante revisión del contenido y comprobaciones pertinentes, sin exigir que cada estadística de partido esté ordenada de la misma manera. EQ06 técnica anotadora alta no significa que deba ser el más eficiente; EQ09 defensa interior no garantiza cero canastas.

## 16. Versiones visibles, perfiles y compatibilidad

### 16.1 Corregir la incoherencia observada

Dennis vio en PowerShell «MOTOR-07», en cabecera web una descripción de MOTOR-08 y un perfil efectivo MOTOR-09. Ese problema debe quedar corregido aquí.

Conserva una fuente común de versión de aplicación/motor que utilicen el servidor de desarrollo y la cabecera. La entrega actual debe identificarse como MOTOR-11 en ambos sitios, o con el identificador efectivo equivalente del repositorio.

Muestra por separado:

1. Versión de aplicación/motor cargada.
2. Perfil numérico/analítico activo y su estado SEM.
3. Dataset/plan o escenario seleccionado.
4. Formato de export cuando sea pertinente.

Un perfil anterior guardado no convierte la aplicación en MOTOR-07. No cambies su identidad ni lo migres para que la etiqueta coincida. Si el motor rechaza su contrato, explica la incompatibilidad conservando los datos.

No utilices un número de versión solo decorativo para fingir que están terminadas las funcionalidades de esa entrega.

### 16.2 Base de MOTOR-11

Crea extensión de perfil/dataset identificada con sufijo `+SEM-MOTOR11-20261017`, conforme a la convención real. La fecha 20261017 identifica estas semillas nuevas; la semilla deportiva histórica sigue siendo 20261016.

Activación explícita en Panel › Inicio. Conserva perfiles antiguos y candidatas de Dennis. Cargar planes naturales nuevos es una acción visible; no cambia silenciosamente los planes históricos guardados.

### 16.3 Compatibilidad y export

Reutiliza `export/8` si el contrato sigue expresando entradas deportivas completas. No cambies versión solo por una etiqueta o por añadir un equipo de datos válidos. Si añades campos necesarios que cambian su contrato, versiona y justifica, con rechazo/migración según mecanismo vigente y archivo original conservado.

Un export de partido lleva fichas/planes/estados efectivos, no solamente IDs de una población que pueda cambiar. Procedencia de generación y escenario puede añadirse con su versión sin obligar a regenerar para reproducir.

## 17. Verificación y recorrido manual

### 17.1 Pocas pruebas con significado

Ejecuta suite existente, `data:check` y control documental. Amplía validación de datos para recorrer los doce equipos; no escribas una prueba por cada una de las 4.608 capacidades.

Añade grupos acotados:

1. **Referencia:** 144 fichas, identidades, campos, planes/roles y remapeos válidos; EQ07-J01 de 40 años en nueva revisión, histórico conservado.
2. **Generador:** misma configuración reproduce valores; otra semilla cambia datos; límites/normalización y ocho grupos cubren 32; no modifica RNG deportivo ni referencias.
3. **Dependencia real:** con entradas sintéticas fijas, variar un factor común afecta las capacidades y medidas pertinentes según receta; un residuo afecta su campo. No una campaña estadística para comprobar correlaciones empíricas.
4. **Edición:** +1/+3/+5 con precisión y saturación, selección vacía, undo exacto y original inmutable.
5. **Escenario:** guardar/recargar/export/import mantiene entradas y diff; dos copias del mismo equipo no colisionan; cambio de plantilla revalida/remapea director y relevos.
6. **Lectores:** cuota de cierres y producción por 100 usan universos correctos; instrumentación no inventa lado, desvío, corte o ocupación ni cambia el juego.
7. **Versiones:** consola/cabecera comparten versión efectiva, perfil anterior sigue identificado por separado.
8. **Integración:** entradas congeladas y reproducción coherente de equipos/variantes generados.

No fijes una victoria de veteranos/jóvenes ni que +3 deba mejorar un marcador concreto. No cambies semillas para hacer pasar el resultado esperado.

### 17.2 Cinco partidos completos

Con invariantes/acta/análisis:

1. Referencia histórica congelada EQ01/EQ02 con entradas MOTOR-10: comprobar 83–103 y 6.505 sorteos si esa base se confirmó al inicio. Las lecturas y ampliación del catálogo no deben cambiarla.
2. EQ03–EQ09 con planes naturales: juego interior y protección.
3. EQ07–EQ08: veteranos/jóvenes.
4. EQ11–EQ12: referente frente a profundidad.
5. Dos equipos generados desde EQ04 y EQ10, semilla de generación 20261017 y 20261018, dispersión 1; semilla deportiva 20261016. Export/reproducción del encuentro.

Esto no ejecuta automáticamente todos los equipos naturales ni todos los cruces. Valida desde preparación los doce y declara cuáles jugaron encuentros completos. EQ05/EQ06 y otros contrastes quedan disponibles para revisión manual; no finjas un partido automático por haber validado su plan.

El resultado de los planes naturales nuevos puede diferir del histórico porque cambiaron entradas identificadas, no por retocar el resolutor. Registra resultados observados sin usarlos de objetivo ni llamarlos calibración.

### 17.3 Manual para Dennis

Crea `docs/prompts/MOTOR-11-recorrido-manual.md` con arranque, URL real, perfil/dataset, semillas, clics, esperado y señal de error. Desde la interfaz:

1. Arrancar y contrastar versión de consola/cabecera y perfil separado.
2. Activar base nueva explícitamente; localizar 12 equipos y 12 fichas por equipo.
3. Abrir veterano de 40 años, joven, estrella/recambio y jugador de plantilla profunda; revisar 32 agrupadas, roles y tendencias.
4. Seleccionar dos jugadores y capacidades, previsualizar +3, comprobar saturación y deshacer exacto.
5. Guardar variante, recargar y restaurar referencia sin perder la copia.
6. Cargar planes naturales de exterior, interior, Horns y 1–4 bajo; verificar funciones, director/relevos y compatibilidades.
7. Preparar cualquier par, incluyendo EQ05/EQ06, y ejecutar un encuentro si se desea revisar esos casos.
8. Generar dos veces la misma configuración y comprobar igualdad; cambiar semilla y ver diferencias reales.
9. Guardar generado y usarlo en partido; enfrentar dos copias sin colisión de participantes.
10. Cargar contraste de energía/Forma/libertad/carga y ver diff; no altera la referencia.
11. Ejecutar por cuartos y visionado con una variante; las órdenes respetan ventanas existentes.
12. Abrir análisis: identidad efectiva, dos consultas completadas, lado desconocido conservado y datos por hecho autorizados.
13. Export/import de escenario y reproducción de un partido generado, sin regenerar su población.
14. Modificar plantilla después del partido y comprobar que el histórico permanece intacto.

Copias diagnósticas identificadas; no confundirlas con acontecimientos naturales. No marques probado por Dennis lo que ejecutaste automáticamente.

Si recorres Chromium, incluye selección de equipos, generación/guardado y edición/deshacer. Informa lo realmente hecho; arrancar sin errores no acredita todos los recorridos ni otro navegador/Node 24.

## 18. Documentación y entrega

### 18.1 Archivar y actualizar

Archiva este prompt íntegro como `docs/prompts/MOTOR-11-poblacion-generador-y-escenarios.md` o equivalente del catálogo. Conserva estado recibido/en ejecución/completado técnicamente/pendiente manual según corresponda. Todos los prompts se entregan y guardan en MD.

Crea `docs/tecnico/motor11.md` con:

- Base real/dependencia de MOTOR-10, rama/commit y alcance.
- Mapa de requisitos a datos/código/UI.
- Origen de las 144 fichas, campos completados, revisión de edad y preservación histórica.
- Doce planes naturales materializados, funciones, libros, políticas/relevos y validación.
- Receta generadora completa: centros, grupos/cruces, distribución, límites, normalización, RNG/derivación, precisión y versiones.
- Separación entre correlación de población y efectos corporales del motor.
- Identidades lógicas/instancias y remapeo de todas las referencias.
- Escenarios, diferencias, guardado, edición masiva y undo.
- Resolución por separado de los pendientes MOTOR-10: confirmado, instrumentado o no producido con causa, sin aprobaciones en bloque.
- Corrección de versiones visibles y compatibilidad de perfiles/exports.
- Comprobaciones reales, cinco encuentros y pendientes manuales.

Actualiza índices, páginas temáticas, diccionarios, catálogo de prompts, estado y changelog. Conserva el funcional íntegro; las precisiones que cambien una perspectiva anterior se registran con procedencia/alcance para futura consolidación.

### 18.2 Pendientes sin confusión

Separa:

- Bloques de MOTOR-11 todavía no ejecutables, si quedan.
- Productores/consultas pendientes de MOTOR-10 y cobertura normativa de MOTOR-09.
- Trabajo futuro de lotes/calibración/rendimiento.

No conviertas una ausencia de implementación en otra «decisión requerida» sobre un comportamiento ya cerrado. Si surge una contradicción real de diseño, aporta ambas referencias y su impacto. Los detalles técnicos reversibles se resuelven dentro de estas instrucciones.

### 18.3 Respuesta final de Claude

Entrega PR revisable sin fusionar y resume:

1. Qué puede probar Dennis: arranque/URL, perfil/dataset, semillas y recorrido.
2. Qué equipos/fichas/planes y generación quedaron disponibles desde UI.
3. Cómo preparar/revertir variantes y reproducir una generación/partido.
4. Pendientes MOTOR-10 resueltos y límites de productor que siguen abiertos.
5. Comprobaciones ejecutadas y qué equipos jugaron de verdad; resultados observados.
6. Cambios que afectan solo datos/lectura frente a cualquier cambio deportivo material.
7. Rama/base/PR, deuda heredada y test manual pendiente.

No informes cuota o duración sin medición del entorno. No suscribas servicios, notifiques a terceros ni fusiones una PR. No declares calibrado ni completo el motor: siguen las entregas posteriores del roadmap.

## 19. Criterios de aceptación

- [ ] Base real con MOTOR-10 y dependencia de PR resuelta/documentada.
- [ ] Doce equipos y 144 fichas explícitas, sin regeneración de referencias ni duplicación genérica.
- [ ] Exactamente 32 capacidades 1–30, cuerpo/edad/tendencias/roles/estados completos.
- [ ] Revisión del veterano de 40 años identificada, sin bonus de edad ni cambio de históricos.
- [ ] Doce planes naturales versionados, editables y validados, sin sobrescribir planes guardados.
- [ ] Director, alternativas, relevos y participación compatibles con IDs propios.
- [ ] Generador condicionado, correlacionado y reproducible; grupos y coeficientes administrables.
- [ ] Capacidad, tendencia, cuerpo, rol y estado separados; sin overall ni doble bonus.
- [ ] Semilla generadora independiente de la deportiva; previews sin efectos en partidos.
- [ ] Generados materializados con procedencia, identidad lógica e instancias sin colisiones.
- [ ] Edición +1/+3/+5 con selección, precisión, saturación y undo exacto.
- [ ] Copias/escenarios con pregunta/diff, guardado/restauración/export/import y originales protegidos.
- [ ] Contrastes de energía, Forma, iniciativa/lectura, veterano/joven, libro, carga/balance y objetivo disponibles.
- [ ] Tres modos y análisis actuales funcionan con referencias, variantes y generados.
- [ ] Dos consultas MOTOR-10 completadas; datos de lado/ventaja/desvío/organización/sin balón tratados por productor real.
- [ ] Cobertura faltante sigue declarada; normativa pendiente no se presenta como cerrada.
- [ ] Consola y cabecera muestran versión común; perfil/dataset separados.
- [ ] Versiones y compatibilidad conservan entradas congeladas y exports originales.
- [ ] Pruebas acotadas, cinco partidos y recorrido manual con cobertura real declarada.
- [ ] Prompt/documentación actualizados, PR sin fusionar y pendientes claramente separados.
