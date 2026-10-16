<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: jugadores](README.md) · Capítulo 3 — Catálogo de 32 capacidades y escala · parte 1 de 3
> Anterior: [c02-datos-de-entrada-capas-y-participantes](c02-datos-de-entrada-capas-y-participantes.md) · Siguiente: [c03-p02-mapa-de-uso-de-las-32-capacidades](c03-p02-mapa-de-uso-de-las-32-capacidades.md)
<!-- beM:nav-fin -->

<a id="cap-03"></a>

## 3. Catálogo de 32 capacidades y escala

El catálogo vigente contiene exactamente 32 capacidades. Los mapas siguientes cumplen funciones distintas: definición, situaciones de uso, observación estadística, diagnóstico y cobertura de tareas. Las correspondencias históricas completas están en la comparativa, sin convertirse en otras capacidades del motor.

<a id="grupo-03-01"></a>

### 3.1. Escala visible 1–30

*Procedencia: MD02, §4.*

<a id="src-md02-l0101"></a>

#### 3.1.1. Significado acordado

*Origen: MD02 §4.1.*

La cifra expresa capacidad en una habilidad concreta. Un 30 representa un nivel extraordinario y alcanzable dentro del universo del juego; no significa acierto garantizado.

Un jugador puede ser excelente en una especialidad y limitado en otras. No se exige que una estrella tenga todo alto, ni que los valores de cada jugador formen un perfil uniforme.

Las capacidades mantienen su significado al cambiar de liga. Cambia la oposición y el contexto competitivo; no se transforma la ficha para que el jugador vuelva a ser relativo a la media de su nueva competición.

La población no debe generarse uniformemente entre 1 y 30. La distribución concreta dependerá de la habilidad, el perfil y la población de referencia; sus rangos, dispersión y dependencias concretos deben completarse en la precarga.

<a id="src-md02-l0131"></a>

#### 3.1.2. Qué aporta y qué no aporta

*Origen: MD02 §4.3.*

La escala 1–30 permite mostrar más escalones que 1–20. Eso aporta diferenciación visible, pero no garantiza realismo.

La calidad del motor dependerá de la selección de capacidades, su intervención causal, las curvas, las oportunidades generadas y la calibración. Más decimales tampoco implican que conozcamos con precisión científica la habilidad de un jugador.

<a id="grupo-03-02"></a>

### 3.2. Catálogo aprobado: 32 capacidades

*Procedencia: MD02, §5.*

<a id="src-md02-l0137"></a>

| Grupo | Cantidad |
|---|---:|
| Técnicas de lanzamiento | 6 |
| Técnicas de creación y juego ofensivo | 5 |
| Técnicas defensivas | 5 |
| Técnicas de rebote | 2 |
| Físicas | 7 |
| Mentales | 7 |
| **Total** | **32** |

Los identificadores TEC, FIS y MEN siguientes ordenan este documento. No imponen nombres de campos, esquema de base de datos ni arquitectura de implementación.

<a id="src-md02-l0151"></a>

#### 3.2.1. Lanzamiento — 6 técnicas

*Origen: MD02 §5.1.*

| ID | Capacidad | Significado y efecto en el motor |
|---|---|---|
| TEC01 | Triple | Técnica del lanzamiento de tres. Interviene al resolver ese tiro y en la amenaza que debe valorar la defensa. |
| TEC02 | Tiro de media distancia | Técnica de lanzamiento de dos fuera de la finalización cercana. Permite valorar oportunidades de esa zona. |
| TEC03 | Tiro interior | Toque y ejecución de tiros cortos cerca del aro, incluidos recursos como ganchos o tiros desde posición interior. |
| TEC04 | Finalización en movimiento | Ejecución de bandejas, reversos y llegadas al aro en movimiento. Se diferencia del tiro interior desde una posición estable. |
| TEC05 | Tiro libre | Técnica de ejecución del libre. Se resuelve sin atribuirle una oposición defensiva inexistente. |
| TEC06 | Tiro en movimiento | Preparación del lanzamiento después de bote, corte, entrega o salida de bloqueo. Modifica la dificultad de preparar ese intento. |

**Frontera importante:** Tiro en movimiento no sustituye Triple o Media distancia. Ayuda a preparar un tiro de esa clase desde una situación exigente. La técnica de la distancia concreta determina después su ejecución.

Finalización en movimiento se refiere a llegar y finalizar al aro. Tiro en movimiento se refiere a preparar un lanzamiento después de desplazarse. No son dos nombres para la misma habilidad.

<a id="src-md02-l0166"></a>

#### 3.2.2. Creación y juego ofensivo — 5 técnicas

*Origen: MD02 §5.2.*

| ID | Capacidad | Significado y efecto en el motor |
|---|---|---|
| TEC07 | Manejo de balón | Conservar, proteger y mover el balón ante presión. Interviene en avance, penetración y continuidad con balón. |
| TEC08 | Pase | Ejecutar el envío adecuado con precisión. La ventana debe existir y haber sido percibida; la habilidad no inventa una recepción libre. |
| TEC09 | Bloqueos | Preparar una pantalla útil y legal. Cambia la dificultad para que el defensor siga o recupere su responsabilidad. |
| TEC10 | Movimiento sin balón | Ejecutar cortes, desmarques y salidas para ofrecer una recepción o desplazar una responsabilidad defensiva. |
| TEC11 | Juego de poste | Ganar posición ofensiva y utilizar sellos, pivotes, fintas y recursos de poste para crear una opción de tiro o pase. |

Juego de poste aporta creación desde el poste. El lanzamiento resultante utiliza Tiro interior, Media distancia o la finalización correspondiente. Un gran tiro interior no garantiza saber ganar posición para recibir.

Movimiento sin balón expresa ejecución ofensiva. Anticipación y comprensión ayudan a reconocer cuándo y para qué moverse. No se añade otra capacidad de posicionamiento con el mismo ámbito.

<a id="src-md02-l0180"></a>

#### 3.2.3. Defensa — 5 técnicas

*Origen: MD02 §5.3.*

| ID | Capacidad | Significado y efecto en el motor |
|---|---|---|
| TEC12 | Defensa perimetral | Contener amenazas exteriores, defender recepciones, orientar al atacante y disputar tiros exteriores cuando corresponde. |
| TEC13 | Defensa interior | Ganar y sostener posición cerca del aro o en el poste, dificultar recepciones profundas y oponerse a la finalización interior. |
| TEC14 | Robo | Técnica de tocar o interceptar un balón accesible. La orden y la oportunidad determinan si se intenta. |
| TEC15 | Tapón | Técnica de intervenir sobre un tiro susceptible de ser taponado. No representa toda la protección del aro. |
| TEC16 | Defensa de bloqueos | Técnica para navegar pantallas y recuperar la responsabilidad prevista dentro de la cobertura. |

Se conserva Defensa de bloqueos para distinguir a un buen defensor del balón de un defensor capaz de perseguir a un tirador o recuperar tras una pantalla.

La cobertura es una orden colectiva. Defensa de bloqueos es una capacidad individual para ejecutarla; no reemplaza la elección de pasar por arriba, por abajo, cambiar, contener o atrapar.

Una buena defensa puede negar un intento o empeorarlo sin producir robo ni tapón. La actuación de una ayuda debe corresponder a un defensor que se ha comprometido realmente.

<a id="src-md02-l0196"></a>

#### 3.2.4. Rebote — 2 técnicas

*Origen: MD02 §5.4.*

| ID | Capacidad | Significado y efecto en el motor |
|---|---|---|
| TEC17 | Cierre de rebote | Ganar y sostener posición para limitar el acceso rival. Puede facilitar la captura de un compañero. |
| TEC18 | Captura de rebote | Asegurar o dirigir útilmente un balón disputado cuando existe oportunidad de intervenir. |

Se utilizan en rebote ofensivo y defensivo. El lado del campo, el encargo de carga o balance, la colocación y los rivales cambian las oportunidades.

No se exige que el mejor cerrador sea quien capture el balón. Tampoco se concede participación a un jugador que estaba fuera de la disputa.

<a id="src-md02-l0207"></a>

#### 3.2.5. Físicos — 7 capacidades

*Origen: MD02 §5.5.*

| ID | Capacidad | Significado y efecto en el motor |
|---|---|---|
| FIS01 | Velocidad | Recorridos de mayor longitud: transición, avance, persecución y retorno. |
| FIS02 | Aceleración | Primeros pasos para atacar un espacio, recuperar, acudir a una ayuda o separarse. |
| FIS03 | Agilidad | Cambiar de dirección y ajustar desplazamientos ante movimientos del rival. |
| FIS04 | Fuerza | Aplicar y resistir contacto útil en poste, pantallas, defensa interior y cierre de rebote. |
| FIS05 | Salto | Capacidad vertical pertinente en finalización, rebote y tapón. |
| FIS06 | Resistencia | Sostener esfuerzo durante el partido y reducir el desgaste relativo bajo una carga comparable. |
| FIS07 | Equilibrio | Mantener estabilidad en contacto, cambios de dirección y preparación de una ejecución. |

Velocidad y aceleración se mantienen separadas: un jugador puede iniciar bien un movimiento y tener una velocidad sostenida más limitada.

Equilibrio no sustituye fuerza. La fuerza ayuda a disputar contacto; el equilibrio ayuda a conservar la postura útil.

Resistencia es una capacidad estable. Energía es lo disponible ahora. No son dos formas de describir el mismo número.

<a id="src-md02-l0225"></a>

#### 3.2.6. Mentales — 7 capacidades

*Origen: MD02 §5.6.*

| ID | Capacidad | Significado y efecto en el motor |
|---|---|---|
| MEN01 | Comprensión táctica | Entender la función, la llamada y las responsabilidades del plan compartido. Afecta a preparación y coordinación. |
| MEN02 | Visión de juego | Percibir opciones y relaciones relevantes que existen en la situación actual. Se utiliza también en defensa. |
| MEN03 | Decisiones | Elegir entre opciones percibidas según riesgo, reloj, marcador, capacidades y órdenes. |
| MEN04 | Anticipación | Prever una acción probable y prepararse antes, sin conocer con certeza el futuro. |
| MEN05 | Concentración | Mantener atención en responsabilidad, balón y contexto; reduce despistes pertinentes. |
| MEN06 | Consistencia | Regular la amplitud de los altibajos alrededor del rendimiento esperado para su forma actual. |
| MEN07 | Rendimiento bajo presión | Regular cómo afecta la presión contextual a decisiones y ejecución. Agrupa inicialmente temple y partidos importantes. |

Estas capacidades actúan con y sin balón. No son exclusivas del base ni deben introducirse todas en cada cálculo.

Consistencia alta aporta estabilidad; no aumenta automáticamente la media del talento. Un jugador consistente puede tener una habilidad limitada y utilizarla de manera fiable.

Rendimiento bajo presión no concede un bonus permanente de estrella ni convierte cada partido en un evento decisivo. Su efecto necesita un contexto de presión.

<a id="grupo-03-03"></a>

### 3.3. Qué se conserva, integra o aplaza del estudio anterior

*Procedencia: MD02, §6.*

<a id="src-md02-l0258"></a>

#### 3.3.1. Capacidades que no se independizan ahora

*Origen: MD02 §6.2.*

| Elemento estudiado | Tratamiento actual |
|---|---|
| Floater | Recurso sin capacidad independiente: TEC04 en progresión; TEC03 para un toque corto controlado desde apoyo. |
| Recursos de pase | Incluidos en la técnica general de Pase dentro de las acciones representadas. |
| Recepción | Dificultad de la situación y resultado del pase; no existe una capacidad separada de recepción. |
| Separación | Resultado de manejo, desplazamiento, elección y defensa, según la acción. |
| Contacto al aro | Contexto de finalización y capacidades pertinentes, sin otra nota técnica específica. |
| Contención independiente | Integrada en Defensa perimetral para el alcance actual. |
| Frenada y coordinación | Incluidas en la resolución de desplazamiento, estabilidad y técnica pertinente; sin variables propias. |
| Temporización y espacios | Representados en preparación, lectura y ejecución de la acción; sin otras dos capacidades. |
| Comunicación y adaptación | El equipo necesita coordinarse y responder; no se añaden estas capacidades independientes. |
| Dosificación | La carga responde a esfuerzo, órdenes, papel y decisiones; no se añade una habilidad propia. |
| Recuperación y durabilidad | Sistemas de descanso, calendario y salud pendientes; no pertenecen a las 32 capacidades. |
| Liderazgo, trabajo en equipo, profesionalidad y ambición | Posibles cuestiones del manager que requieren diseño posterior; no se incorporan automáticamente al partido. |

Integrar un concepto supone aceptar una pérdida de detalle. No se afirma que una capacidad general reproduzca exactamente todas las distinciones de un catálogo más amplio.

<a id="grupo-03-04"></a>

### 3.4. Población, modalidades y conservación

*Procedencia: MD05, §15.*

<a id="src-md05-l1032"></a>

#### 3.4.1. Escala absoluta y precisión

*Origen: MD05 §15.2.*

Se adopta una representación continua equivalente a 1–30, con redondeo al presentar. La misma capacidad tiene el mismo significado en distintas ligas; cambia oposición y contexto.

Una elección técnica de almacenamiento equivalente puede realizarse sin perder precisión ni introducir otra interpretación. No se mantienen dos notas independientes, una visible y otra real. Una mejora interna pequeña puede existir antes de cambiar el entero visible.

Edad, potencial, precio y reputación no entran como bonus de acción. Los perfiles no fuerzan que un jugador de 40 años sea inútil ni que toda experiencia compense siempre sus físicas.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c02-datos-de-entrada-capas-y-participantes](c02-datos-de-entrada-capas-y-participantes.md) · Siguiente: [c03-p02-mapa-de-uso-de-las-32-capacidades](c03-p02-mapa-de-uso-de-las-32-capacidades.md)
