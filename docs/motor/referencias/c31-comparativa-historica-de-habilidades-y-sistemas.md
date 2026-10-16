<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: referencias](README.md) · Capítulo 31 — Comparativa histórica de habilidades y sistemas
> Anterior: [c30-alcance-de-construccion-y-trabajos-por-completar](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md) · Siguiente: [c32-glosario-y-diccionarios](c32-glosario-y-diccionarios.md)
<!-- beM:nav-fin -->

<a id="cap-31"></a>

## 31. Comparativa histórica de habilidades y sistemas

La comparación histórica conserva catálogos, agrupación, presencia, ausencias y límites de la inspección original. No es una migración, conversión de notas ni autorización para heredar reglas o código de los proyectos anteriores.

<a id="grupo-31-01"></a>

### 31.1. Qué se conserva, integra o aplaza del estudio anterior

*Procedencia: MD02, §6.*

<a id="src-md02-l0245"></a>

#### 31.1.1. De 26 a 32

*Origen: MD02 §6.1.*

| Cambio | Motivo |
|---|---|
| Añadir Tiro en movimiento | Distinguir preparación después de desplazarse de técnica de lanzamiento por distancia. |
| Añadir Juego de poste | Dar una capacidad propia a la creación desde el poste. |
| Añadir Defensa de bloqueos | Representar la persecución y recuperación tras pantallas. |
| Añadir Equilibrio | Diferenciar estabilidad de fuerza y agilidad. |
| Añadir Consistencia | Dar función a la estabilidad de rendimiento y los altibajos. |
| Añadir Rendimiento bajo presión | Representar partidos importantes y momentos decisivos mediante un único ámbito inicial. |

El catálogo resultante está cerrado en 32. No se añaden capacidades por conservar todas las sutilezas de BeManager.

<a id="grupo-31-02"></a>

### 31.2. Comparación y opinión adoptada

*Procedencia: MD02, §16.*

<a id="src-md02-l0768"></a>

#### 31.2.1. Catálogos y agrupación

*Origen: MD02 §16.1.*

| Sistema | Técnicos | Físicos | Mentales | Total | Escala |
|---|---:|---:|---:|---:|---|
| Basket Manager, catálogo en código revisado | 14 | 9 | 11 | 34 | 1–20 |
| BeManager, catálogo diseñado | 23: 15 ofensivos, 6 defensivos y 2 de rebote | 10 | 12 | 45 | 1–15, presentado como E− a A+ |
| BeManager, subconjunto activo revisado | 17: 9 ofensivos y 8 defensivos/rebote | 5 | 5 | 27 | 1–15 |
| Primera propuesta de beM en esta discusión | 15 | 6 | 5 | 26 | 1–30 |
| Propuesta posterior de beM | 18 | 7 | 5 | 30 | 1–30 |
| **beM, decisión vigente** | **18** | **7** | **7** | **32** | **1–30** |

En DESIGN(1).md aparecían ambición y profesionalidad también en la lista mental. En el código revisado se encuentran en ocultos, evitando contarlas dos veces. Por eso se utiliza el catálogo de 34 capacidades, no 36 entradas de aquella enumeración.

Los 45 atributos de BeManager eran candidatos de diseño. El código revisado declara 27 activos; los otros 18 no deben presentarse como capacidades ya implementadas.

La presencia en un contrato activo tampoco demuestra por sí sola buen funcionamiento o calibración. La revisión fue selectiva y no una auditoría completa de ambos repositorios.

<a id="src-md02-l0785"></a>

#### 31.2.2. Qué aporta cada referencia

*Origen: MD02 §16.2.*

| Referencia | Valor que se conserva | Limitación identificada | Consecuencia para beM |
|---|---|---|---|
| Basket Manager | Sencillez, resolución por posesiones, jugadores concretos y estados | Algunas habilidades mezclan capacidad y tendencia; faltan distinciones de bloqueos, poste y preparación de tiro | Conservar la sencillez del ciclo y ampliar solo ámbitos necesarios |
| BeManager | Distinciones útiles entre lectura, ejecución, navegación, cierre y captura; laboratorio y explicación causal | Dependencias geométricas y temporales complejas, con repertorio útil limitado frente al catálogo diseñado | Conservar conceptos seleccionados y abandonar la necesidad de trayectoria continua |
| Propuesta inicial de 26 | Catálogo contenido y lectura sencilla | Demasiado general para poste, movimiento de tiro, pantallas y estabilidad corporal | Incorporar las cuatro capacidades que llevaron a 30 |
| Decisión de 32 | Añade estabilidad y presión, junto con estados y experiencia delimitados | Sigue necesitando probar fronteras, pesos y posibles duplicaciones | Validar efectos concretos antes de ampliar atributos o reglas |
| Basketball GM / ZenGM | Referencia inspeccionable de posesiones, acta y eventos | Sus decisiones y fórmulas responden a su propio juego | Consultar ideas selectivamente; no copiar un motor como solución cerrada |

El fracaso anterior no se explica únicamente por tener 45 atributos. El problema de diseño fue exigir una cadena de movimientos, tiempos y condiciones muy detallada antes de producir una variedad de partidos convincente.

La opinión adoptada es usar la sencillez del primer Basket Manager y del ciclo por posesiones, con las distinciones útiles del estudio posterior. **32 capacidades no garantizan éxito:** necesitan acciones propias o un efecto pertinente comprobable.

<a id="src-md02-l0799"></a>

#### 31.2.3. Investigación y sus límites

*Origen: MD02 §16.3.*

- El trabajo de posesiones de Cervone y colaboradores distingue estados de posesión y acciones con múltiples resoluciones. Utiliza también seguimiento fino; no demuestra que un modelo por zonas sea igual de preciso [MD02-S2](c33-p01-fuentes-y-alcance-de-la-investigacion.md#ref-md02-s2).
- Franks y colaboradores distinguen la influencia defensiva sobre la aparición de tiros y sobre su acierto condicionado. Ayuda a separar negar oportunidades de defender un tiro que ya existe [MD02-S3](c33-p01-fuentes-y-alcance-de-la-investigacion.md#ref-md02-s3).
- Skinner estudia la selección de tiro según oportunidad futura, tiempo y riesgo. Sus supuestos simplificadores no se trasladan como táctica automática [MD02-S4](c33-p01-fuentes-y-alcance-de-la-investigacion.md#ref-md02-s4).
- Los estudios de percepción experta apoyan dar función a la anticipación y lectura, sin convertir edad en una garantía de inteligencia [MD02-S5](c33-p01-fuentes-y-alcance-de-la-investigacion.md#ref-md02-s5).
- La investigación de rachas consultada orienta a considerar selección de tiro y respuesta defensiva, con efectos contenidos [MD02-S6](c33-p01-fuentes-y-alcance-de-la-investigacion.md#ref-md02-s6).

Son referencias para el razonamiento deportivo. No validan las 32 capacidades elegidas, nuestros estados, sus duraciones o sus coeficientes.

<a id="grupo-31-03"></a>

### 31.3. Mapa comparativo completo de habilidades

*Procedencia: MD02, anexo A.*

<a id="src-md02-l0981"></a>

#### 31.3.1. Cómo leerlo

*Origen: MD02 §A.1.*

Este mapa conserva las habilidades de los dos catálogos anteriores y muestra su relación con las 32 actuales.

- **A:** pertenece al subconjunto activo de BeManager revisado.
- **D:** pertenece al catálogo diseñado de BeManager, pero no al subconjunto activo.
- **≈:** correspondencia parcial; el significado o el ámbito es diferente.
- **No independiente:** beM representa un efecto relacionado sin una nota propia para esa habilidad.
- **Fuera del catálogo:** no se incorpora a las 32; cualquier incorporación futura necesita decisión.

Las filas son correspondencias funcionales, no una migración ni una fórmula de conversión. Un atributo amplio puede aparecer relacionado con más de una fila; **no deben contarse estas menciones para sumar los catálogos**. Las cantidades exactas se obtienen de los inventarios del [MD02 §16](#cap-31) y del [anexo de origen MD02 B](#cap-31).

<a id="src-md02-l0993"></a>

#### 31.3.2. Lanzamiento

*Origen: MD02 §A.2.*

| Habilidad o ámbito | Basket Manager | BeManager | beM actual |
|---|---|---|---|
| Triple / tiro exterior | Sí: outsideShot | A: T04 Triple | Sí: TEC01 Triple |
| Media distancia | Sí: midRangeShot | D: T03 Tiro medio | Sí: TEC02 Media distancia |
| Tiro interior | Sí: insideShot | ≈ A: T01 Finalización incluye gancho corto | Sí: TEC03 Tiro interior |
| Finalización al aro en movimiento | Sí: layup | ≈ A: T01 Finalización | Sí: TEC04 Finalización en movimiento |
| Tiro libre | Sí: freeThrows | A: T05 Tiro libre | Sí: TEC05 Tiro libre |
| Preparación de tiro en movimiento | No independiente | A: T06 Tiro móvil | Sí: TEC06 Tiro en movimiento |
| Floater | No independiente | D: T02 Floater | No independiente |

<a id="src-md02-l1005"></a>

#### 31.3.3. Creación y juego ofensivo

*Origen: MD02 §A.3.*

| Habilidad o ámbito | Basket Manager | BeManager | beM actual |
|---|---|---|---|
| Manejo | Sí: ballHandling | A: T07 Manejo | Sí: TEC07 Manejo |
| Precisión/técnica de pase | Sí: passing | A: T09 Precisión pase | Sí: TEC08 Pase, con ámbito general |
| Recursos de pase | No independiente | D: T10 Recursos pase | No independiente dentro de Pase |
| Recepción | No independiente | A: T11 Recepción | No independiente |
| Juego de poste | No independiente | D: T12 Poste | Sí: TEC11 Juego de poste |
| Bloqueos ofensivos | No; blocking significa tapón | A: T13 Bloqueos | Sí: TEC09 Bloqueos |
| Movimiento sin balón / desmarque | ≈ Sí: positioning, mental | A: T21 Desmarque | Sí: TEC10 Movimiento sin balón |
| Separación mediante recursos | No independiente | D: T08 Separación | No independiente |
| Técnica de contacto al aro | No independiente | D: T14 Contacto al aro | No independiente |

<a id="src-md02-l1019"></a>

#### 31.3.4. Defensa y rebote

*Origen: MD02 §A.4.*

| Habilidad o ámbito | Basket Manager | BeManager | beM actual |
|---|---|---|---|
| Defensa perimetral | Sí: perimeterDefense | A: T22 Defensa perimetral | Sí: TEC12 Defensa perimetral |
| Defensa interior | Sí: interiorDefense | A: T23 Defensa interior | Sí: TEC13 Defensa interior |
| Contención independiente | No independiente | A: T15 Contención | No independiente; integrada en Defensa perimetral |
| Navegación de bloqueos | No independiente | A: T16 Navegación | Sí: TEC16 Defensa de bloqueos |
| Robo | Sí: stealing | A: T17 Robo | Sí: TEC14 Robo |
| Tapón | Sí: blocking | A: T18 Tapón | Sí: TEC15 Tapón |
| Rebote ofensivo como habilidad separada | Sí: offensiveRebound | No; cierre y captura compartidos | No; cierre y captura compartidos |
| Rebote defensivo como habilidad separada | Sí: defensiveRebound | No; cierre y captura compartidos | No; cierre y captura compartidos |
| Cierre de rebote | No independiente | A: T19 Cierre | Sí: TEC17 Cierre |
| Captura de rebote | ≈ Contenida en las dos habilidades de rebote | A: T20 Captura | Sí: TEC18 Captura |
| Tendencia a cometer faltas | Sí: foulTendency, en técnicos | No independiente | Fuera de las 32; no es capacidad técnica de éxito |

<a id="src-md02-l1035"></a>

#### 31.3.5. Físicos

*Origen: MD02 §A.5.*

| Habilidad o ámbito | Basket Manager | BeManager | beM actual |
|---|---|---|---|
| Velocidad | Sí: topSpeed | D: F02 Velocidad | Sí: FIS01 Velocidad |
| Aceleración | Sí: acceleration | A: F01 Aceleración | Sí: FIS02 Aceleración |
| Agilidad | Sí: agility | ≈ A: F04 Agilidad lateral | Sí: FIS03 Agilidad |
| Fuerza | Sí: strength | A: F05 Fuerza | Sí: FIS04 Fuerza |
| Salto | Sí: jumping | A: F06 Salto | Sí: FIS05 Salto |
| Resistencia a esfuerzo sostenido | Sí: stamina | ≈ D: F07 Repetición de esfuerzos | Sí: FIS06 Resistencia |
| Equilibrio | Sí: balance | D: F09 Equilibrio | Sí: FIS07 Equilibrio |
| Recuperación entre partidos | Sí: recovery | No independiente con ese ámbito | Fuera de las 32; regla de recuperación pendiente |
| Recuperación entre esfuerzos/descansos | No independiente con ese ámbito | D: F08 Recuperación | Fuera de las 32; regla de recuperación pendiente |
| Durabilidad / propensión a lesión | Sí: durability | No independiente | Fuera de las 32; sistema de salud posterior |
| Frenada | No independiente | A: F03 Frenada | No independiente |
| Coordinación | No independiente | D: F10 Coordinación | No independiente |

<a id="src-md02-l1052"></a>

#### 31.3.6. Mentales

*Origen: MD02 §A.6.*

| Habilidad o ámbito | Basket Manager | BeManager | beM actual |
|---|---|---|---|
| Visión | Sí: gameVision | A: M01 Visión | Sí: MEN02 Visión |
| Decisiones | ≈ Sí: pressureDecisionMaking, centrada en presión | A: M03 Decisiones | Sí: MEN03 Decisiones generales |
| Anticipación | Sí: anticipation | D: M02 Anticipación | Sí: MEN04 Anticipación |
| Concentración | Sí: concentration | D: M06 Concentración | Sí: MEN05 Concentración |
| Consistencia | Sí: consistency | No independiente | Sí: MEN06 Consistencia |
| Comprensión táctica | No independiente | D: M11 Comprensión táctica | Sí: MEN01 Comprensión táctica |
| Temple / manejo de presión | ≈ Ámbito parcial en pressureDecisionMaking | D: M08 Temple | Sí: MEN07 Rendimiento bajo presión, con ámbito de temple y partidos importantes |
| Temporización | No independiente | A: M04 Temporización | No independiente |
| Lectura de espacios | No independiente | A: M05 Espacios | No independiente; ámbitos de lectura y preparación |
| Disciplina | No independiente | D: M07 Disciplina | Fuera del catálogo como capacidad independiente |
| Comunicación | No independiente | A: M09 Comunicación | No independiente |
| Adaptación | No independiente | D: M10 Adaptación | No independiente |
| Dosificación | No independiente | D: M12 Dosificación | No independiente |
| Agresividad | Sí: aggressiveness | No independiente | Tendencia/órdenes, fuera de las 32 |
| Liderazgo | Sí: leadership | No independiente | Fuera de las 32 |
| Trabajo en equipo | Sí: teamwork | No independiente | Fuera de las 32 |
| Temperamento / control de conducta | Sí: temperament | No independiente con ese mismo ámbito | Fuera de las 32; no se equipara automáticamente a presión |
| Posicionamiento | Sí: positioning, movimiento sin balón | ≈ Relacionado con M05 Espacios y T21 Desmarque | Sin nota adicional; movimiento, anticipación y comprensión según la tarea |
| Ética de trabajo / esfuerzo en partido | Sí: workRate | No independiente | Fuera de las 32; carga, rol y órdenes no son otra habilidad añadida |

<a id="src-md02-l1076"></a>

#### 31.3.7. Elementos fuera de los catálogos principales

*Origen: MD02 §A.7.*

| Elemento | Basket Manager | BeManager | beM actual |
|---|---|---|---|
| Experiencia | Campo de carrera; bonus bajo presión en el diseño anterior | No identificada como capacidad independiente del catálogo revisado | Historial y contribución al aprendizaje; sin bonus general de partido |
| Iniciativa | No identificada como campo equivalente independiente | ≈ Algunas tendencias de lectura y tiro, sin equivalencia exacta | Tendencia separada de capacidades |
| Potencial | Separado; escala 1–200 en el código revisado | Fuera de las 45 capacidades del capítulo | Concepto de desarrollo; escala pendiente |
| Profesionalidad y ambición | Ocultos en código; el DESIGN antiguo también los enumeraba en mentales | Fuera de las 45 capacidades del capítulo | Sin decisión de incorporación ahora |
| Aprendizaje | learningRate y learningPersistence separados en código | Fuera del catálogo de 45 | Sistema de progresión pendiente |
| Medidas corporales | Altura, envergadura y peso | Altura, peso, envergadura y alcance de pie | Altura, envergadura y peso fuera de las 32; detalle de uso pendiente |
| Energía | Estado separado | Estado separado | Estado separado |
| Forma persistente | ≈ Estados relacionados; no equivalencia automática | No se da por implementado este modelo | Estado acordado con duración entre partidos |
| Momento del partido | ≈ Estados de racha/ánimo; no equivalencia automática | No se da por implementado este modelo | Estado acordado, transitorio y limitado |

La presencia o ausencia aquí se refiere al catálogo y los archivos revisados. No se afirma que un concepto no exista en ninguna otra parte de un repositorio.

<a id="grupo-31-04"></a>

### 31.4. Inventarios originales en su orden de agrupación

*Procedencia: MD02, anexo B.*

<a id="src-md02-l1094"></a>

#### 31.4.1. Basket Manager — 34

*Origen: MD02 §B.1.*

**Técnicos, 14:** outsideShot, midRangeShot, insideShot, freeThrows, layup, passing, ballHandling, offensiveRebound, defensiveRebound, blocking, stealing, foulTendency, perimeterDefense, interiorDefense.

**Físicos, 9:** topSpeed, acceleration, jumping, strength, agility, balance, stamina, recovery, durability.

**Mentales, 11:** gameVision, pressureDecisionMaking, aggressiveness, concentration, leadership, teamwork, temperament, consistency, anticipation, positioning, workRate.

Fuente: catálogo de Player.js revisado. Profesionalidad, ambición, aprendizaje, potencial y experiencia están fuera de estas tres listas.

<a id="src-md02-l1104"></a>

#### 31.4.2. BeManager — 45 diseñados

*Origen: MD02 §B.2.*

**Técnicos ofensivos, 15:** T01 Finalización; T02 Floater; T03 Tiro medio; T04 Triple; T05 Tiro libre; T06 Tiro móvil; T07 Manejo; T08 Separación; T09 Precisión pase; T10 Recursos pase; T11 Recepción; T12 Poste; T13 Bloqueos; T14 Contacto al aro; T21 Desmarque.

**Técnicos defensivos, 6:** T15 Contención; T16 Navegación; T17 Robo; T18 Tapón; T22 Defensa perimetral; T23 Defensa interior.

**Técnicos de rebote, 2:** T19 Cierre; T20 Captura.

**Mentales, 12:** M01 Visión; M02 Anticipación; M03 Decisiones; M04 Temporización; M05 Espacios; M06 Concentración; M07 Disciplina; M08 Temple; M09 Comunicación; M10 Adaptación; M11 Comprensión táctica; M12 Dosificación.

**Físicos, 10:** F01 Aceleración; F02 Velocidad; F03 Frenada; F04 Agilidad lateral; F05 Fuerza; F06 Salto; F07 Repetición; F08 Recuperación; F09 Equilibrio; F10 Coordinación.

<a id="src-md02-l1116"></a>

#### 31.4.3. BeManager — 27 activos en los contratos revisados

*Origen: MD02 §B.3.*

**Ofensivos, 9:** T01, T04, T05, T06, T07, T09, T11, T13, T21.

**Defensivos/rebote, 8:** T15, T16, T17, T18, T19, T20, T22, T23.

**Mentales, 5:** M01, M03, M04, M05, M09.

**Físicos, 5:** F01, F03, F04, F05, F06.

El comentario inicial del archivo menciona las 26 capacidades de ME-01; el contrato incorpora después M09 y suma 27. Se utiliza la lista actual del snapshot revisado.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c30-alcance-de-construccion-y-trabajos-por-completar](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md) · Siguiente: [c32-glosario-y-diccionarios](c32-glosario-y-diccionarios.md)
