# MOTOR-18 · Familiaridad táctica, roles, posiciones y aprendizaje

**Encargo de Dennis para Claude Code · beM · 21 de octubre de 2026.**

Implementa esta entrega en `bateman37/beM`, con una PR revisable y una auditoría final acotada. Trabaja hasta completar el alcance autorizado. Este documento fija las decisiones funcionales y las semillas iniciales; no debes escoger otro modelo deportivo ni ampliar el proyecto por iniciativa propia.

El partido actual ya se siente como baloncesto y su base se conserva. Añadimos una capa pequeña de conocimiento adquirido: saber ejecutar lo que pide el entrenador, aprender nuevas responsabilidades y conservar durante años lo aprendido. La simulación sigue resolviendo acontecimientos y posesiones, sin coordenadas nuevas, movimientos continuos ni pasos por segundo.

## Índice

1. [Resultado y límites de la entrega](#m18-01)
2. [Base, Git y lectura dirigida](#m18-02)
3. [Correcciones del auditor de MOTOR-17B](#m18-03)
4. [Modelo de conocimiento y contratos](#m18-04)
5. [Catálogo pequeño y correspondencias](#m18-05)
6. [Efecto durante el partido](#m18-06)
7. [Polivalencia y entrenador](#m18-07)
8. [Aprendizaje entre partidos](#m18-08)
9. [Retención, desuso y recuperación](#m18-09)
10. [Semillas administrables e inicialización](#m18-10)
11. [Laboratorio e interfaz](#m18-11)
12. [Persistencia, reproducción y audiencias](#m18-12)
13. [Instrumentación y sensibilidad](#m18-13)
14. [Pruebas proporcionadas](#m18-14)
15. [Campaña final de 36 ejecuciones](#m18-15)
16. [Paquetes para ChatGPT](#m18-16)
17. [Documentación, precedencia y cierre](#m18-17)

<a id="m18-01"></a>

## 1. Resultado y límites de la entrega

### 1.1 Qué debe funcionar al terminar

- Un equipo que apenas conoce una zona puede utilizarla, pero su coordinación tiene una desventaja limitada frente a quien la domina, manteniendo capacidades, contexto y rival constantes.
- Cada jugador conserva familiaridad con posiciones, roles ofensivos, roles defensivos y un catálogo pequeño de conocimientos tácticos.
- La familiaridad del quinteto se deriva de sus jugadores. No es una propiedad independiente del club que permanece perfecta tras renovar la plantilla.
- Cambiar un rol o asignar otra posición utiliza el conocimiento correspondiente desde la frontera real de aplicación de la orden.
- La facilidad de aprendizaje y la enseñanza del entrenador influyen en lo aprendido entre encuentros. No son multiplicadores generales de acierto.
- Lo consolidado se conserva durante años; reaprender algo que ya se dominó resulta más rápido.
- El laboratorio permite editar, entrenar, dejar transcurrir tiempo de aprendizaje y comparar copias, con vista previa y aplicación explícita.
- Se corrige la sensibilidad de dependencias compartidas encontrada en MOTOR-17B y se explica correctamente su alternativa defensiva legítima.
- Se entrega evidencia descargable de una campaña pequeña, con datos suficientes para que ChatGPT haga la interpretación deportiva.

### 1.2 Decisiones que se conservan

1. **Las 32 capacidades de partido siguen siendo 32**, con su diccionario y escala 1–30. Familiaridad es conocimiento adquirido; Polivalencia es un rasgo de desarrollo separado.
2. No hay prohibición por posición nominal. Un pívot puede ser alineado de base; su capacidad y familiaridad determinan las consecuencias. Un interior con capacidades de organización puede dirigir.
3. Los roles existentes conservan su significado y su sesgo de uso. Conocer un rol no concede el talento necesario para desempeñarlo bien.
4. El conocimiento bajo no vuelve torpe cada pase sencillo de un anotador. Su efecto se sitúa en coordinación y responsabilidades, según este encargo.
5. Una táctica dominada puede ser una mala elección ante un rival. El dominio no garantiza resultados, ni una victoria en cada pareja de semillas.
6. Entrenamiento y partidos aportan exposición real. Leer una jugada en un menú o elevar su prioridad no entrena al equipo.
7. Todas las magnitudes, correspondencias y curvas nuevas viven en tablas administrables, con unidades, procedencia y versión.
8. Las cifras de esta entrega son **SEM18: semillas provisionales de producto**, no porcentajes extraídos de estudios reales ni calibración deportiva aceptada.

### 1.3 Fuera de alcance

No implementes el calendario completo de entrenamiento del manager, temporadas, cantera, contratos de entrenadores, licencias, desarrollo profesional del staff, lesiones por entrenamiento, un sistema de química entre parejas, reputación, idiomas, personalidad ni un nuevo motor rápido.

El laboratorio de aprendizaje que se pide aquí es una herramienta funcional mínima y utilizable, con funciones puras que el manager podrá invocar después. Tampoco se reabren reglamento, asistencias, probabilidades de robo, gasto de energía, forma, momentos o memoria defensiva.

Los requisitos futuros de simultaneidad de encuentros y clasificación en directo se conservan documentados; no se implementan en esta entrega.

No consultes otros repositorios, incluidos los anteriores Basket Manager, BeManager y `v-apps`. No fusiones, publiques releases, te suscribas ni envíes mensajes a terceros.

<a id="m18-02"></a>

## 2. Base, Git y lectura dirigida

### 2.1 Comprueba el estado real

El código revisado de MOTOR-17B se identifica como `f67113e81353da4d464e8bc62544d28b2dbcb8fa`; el empaquetado declaró `30c7a11bf0530bfd52ff12654e3a046ac9c40277`. Motor `beM-motor-0.17.1-MOTOR17B`, export `beM-match-export/9`, acta `ACTA-MOTOR17B-R1`. La suite aportada terminó 218/218. Son antecedentes, no garantía del estado actual de main o de la PR.

- Si MOTOR-17B está fusionado, parte del main actualizado en una rama nueva de MOTOR-18.
- Si todavía está pendiente, conserva su rama y usa su cabeza real como base identificada de una rama nueva; declara la dependencia de la PR. No reconstruyas MOTOR-17B manualmente ni lo sustituyas por una etiqueta.
- Respeta las restricciones de nombres de rama del entorno. No hagas resets destructivos, force-push, borrados de cambios de Dennis ni mezclas con trabajo ajeno.
- Conserva un **CONTROL17B ejecutable e inmutable** del mismo repositorio para las comparaciones neutrales. Un worktree aislado de este repositorio está autorizado.
- Identifica en commits separados: correcciones de auditoría; conocimiento/aprendizaje; integración y laboratorio; evidencia/documentación.

No hace falta otra suite completa inicial si la base acreditada coincide. Si algo ya está arreglado, compruébalo y consérvalo; no recrees un diff para aparentar una corrección.

### 2.2 Consulta por temas

Lee normas raíz, índices, estado, contrato del motor y documentación pertinente de MOTOR-17/17B. Usa el funcional vigente seccionado cuando necesites contexto. El funcional íntegro se conserva como referencia; no es necesario releerlo entero.

Los archivos históricos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen las decisiones vigentes de beM.

Puntos de entrada conocidos en el código empaquetado: `src/match/actions.js` (`qualityOf`), `formulas.js`, `defense-actions.js` (`pressedAdvance`), `throwin.js`, `plays.js`, `core.js` (`slotOf`, `consume`), órdenes y snapshot, `src/audit/analysis.js`, `consumers.js`, `project.js`, `evaluators.js`, los registros esenciales y la fachada `src/engine/index.js`. Comprueba sus equivalentes reales antes de editar.

Busca una vez los diagnósticos de MOTOR-17B en `out/motor17b/` o sus paquetes adjuntos. Si faltan, declara la ausencia. El encargo incluye un contraejemplo numérico completo; no gastes la sesión intentando recuperar archivos efímeros inexistentes.

### 2.3 Secuencia de trabajo

1. Corrige exclusivamente el auditor y acredita la corrección con datos conservados/cálculo puro.
2. Congela contenido y semillas SEM18 antes de la campaña.
3. Implementa la capa de conocimiento con camino neutral exacto.
4. Implementa aprendizaje y laboratorio sin ampliar el manager.
5. Ejecuta las pruebas pertinentes y la campaña de cierre especificada.
6. Genera las tablas y paquetes desde los archivos finales.

Si una incompatibilidad funcional real impide una parte, aporta evidencia y continúa las partes independientes. Las decisiones técnicas reversibles de organización de módulos son tuyas; las decisiones deportivas y cifras son las de este encargo. No sustituyas el modelo por otro ni declares implementada una parte que solo esté documentada.

<a id="m18-03"></a>

## 3. Correcciones del auditor de MOTOR-17B

### 3.1 R17B-SENS-01: cambiar todas las dependencias pertinentes

La revisión independiente confirmó 30/30 pares sin cambios deportivos fuera de los créditos autorizados y 12/12 repeticiones diagnóstico–esencial coincidentes. Encontró un defecto del contrafactual del auditor, no del cálculo del partido.

`sensitivity` cambia una receta y `consumerOutput` modifica una entrada mediante `refKey`. Cuando una capacidad del mismo jugador alimenta dos recetas de la operación, la otra entrada puede quedar fija. Coincidir en la salida base no demuestra que el incremento esté completo.

**Corrección obligatoria:** seleccionar una operación real y recalcular todas sus entradas dependientes de la capacidad y actor incrementados, conservando las otras capacidades, participantes, oposición, opciones, estados e innovaciones. Deduplica referencias de una misma receta; no sumes dos veces el mismo incremento. Usa las funciones puras de producción y sus límites; no construyas un segundo simulador.

Se localizaron estos seis contextos, con tres incrementos cada uno:

| Capacidad | Fuente | Decisión | Actor | Dependencias |
|---|---|---|---|---|
| TEC07 | `LOT-eb517d23-R2` | `M000001-A1:E0375:312` | `EQ01_B-J06` | `off` y `legalOff` |
| TEC12 | `LOT-8270e4bb-R2` | `M000001-A1:E0231:302` | `EQ02-J01` | `def` y `legalDef` |
| FIS07 | `LOT-df4bc6b9-R2` | `M000001-A1:E0504:313` | `EQ11-J01` | `A` y `prep` |
| FIS07 | `LOT-a96cefde` | `M000005-A1:E0421:316` | `EQ10-J07` | `A` y `prep` |
| MEN04 | `LOT-a96cefde` | `M000002-A1:E0165:293` | `EQ03-J03` | `def` y `legalDef` |
| MEN04 | `LOT-a96cefde` | `M000006-A1:E0329:320` | `EQ11-J01` | `def` y `legalDef` |

El alcance son las dependencias dentro de la operación seleccionada. No se resimula la posesión ni se altera un estado previo distinto para buscar un resultado favorable. En una distribución de pérdidas/faltas se recalcula la distribución completa: modificar una entrada también cambia su normalización. Una probabilidad de captura condicionada a que el equipo gane el rebote debe seguir rotulada como condicionada.

Contraejemplo completo para una comprobación pura, aunque falte el paquete histórico:

```json
{
  "case": "R17B-SENS-01-FIS07",
  "neutralAbility": 16,
  "shot": {"p0": 0.39, "sA": 0.07, "sD": 0.035},
  "fixed": {
    "A": 12.3551968125,
    "D": 16.136040709615383,
    "K": 0.23989926637931033,
    "Z": 0.37887170950499643,
    "alpha": 0.2,
    "prep": 11.155196812499998
  },
  "movementMaximumLogitCost": 0.4,
  "changed": {"actor": "EQ11-J01", "cap": "FIS07", "increment": 3},
  "dependentChanges": {"A": 0.3, "prep": 0.6},
  "expected": {
    "baseProbability": 0.4144452772803625,
    "partialAfterOnlyPrep": 0.4165557852725335,
    "completeAfter": 0.4219287569484819
  },
  "probabilityTolerance": 1e-8
}
```

Aquí `K_nuevo = K + coste(prep_original) - coste(prep_modificada)`. No añadas además otro bono por Equilibrio. La saturación 30 y el incremento efectivo cero deben seguir dando cambio exactamente cero. Mantén explícita la precisión de entradas y salidas; una entrada redondeada no permite prometer exactitud superior a su información.

Si dispones de los doce diagnósticos históricos, regenera la sensibilidad corregida sin nuevos partidos. Si no, usa el contraejemplo y regresiones puras de las dependencias de control, y aplica el auditor corregido a los nuevos diagnósticos. Separa «reproducción histórica» de «regresión sintética» y «evidencia nueva».

La matriz, AUD05, CSV, interfaz e informe compartirán el resultado nuevo. No presentes los antiguos 768 contrastes como exactos por conservar su salida base. Las 32 capacidades observadas no se convierten por este defecto en atributos muertos.

### 3.2 AUD11: alternativas legítimas y discrepancias sin explicar

La señal de 72 desajustes de MOTOR-17B procede íntegramente de B04: `ORG06` pretendida, `ORG02` efectiva, alternativa declarada verdadera por ausencia del objetivo. El esencial contiene 75 registros, mientras que el universo del auditor incluye 72 tiros válidos; los otros tres no pertenecen a ese universo.

Corrige el **lector/clasificador**, no la defensa:

- Cuenta discrepancias observadas sin perderlas.
- Separa alternativa reglada acreditada, orden aplicada acreditada y diferencia sin explicación suficiente.
- Solo clasifica una alternativa como explicada si coinciden organización efectiva, alternativa configurada vigente y evidencia causal de su activación. Una etiqueta verdadera aislada no convierte cualquier discrepancia en válida.
- Con datos incompletos conserva «no clasificable / señal» y su motivo.
- Una orden pendiente o rechazada no explica un cambio anticipado.
- Expón contadores y ejemplos de cada clase. Conserva los resultados históricos originales; una auditoría nueva tiene otra identidad/proyección.
- Una discrepancia genuina introducida en una copia de evidencia debe seguir produciendo señal.

Los robos, sus probabilidades y su criterio de crédito de MOTOR-17B se conservan. Los nueve créditos añadidos en los 30 pares ya estaban justificados. No uses esta entrega para elevar o bajar una media de robos.

<a id="m18-04"></a>

## 4. Modelo de conocimiento y contratos

### 4.1 Datos por jugador

Añade un bloque de conocimiento separado de `abilities`, con identificador y versión propios. Adapta los nombres a los contratos reales sin cambiar estos significados:

```text
knowledge:
  version: KNOW-MOTOR18-R1
  mode: explicit | legacy-neutral
  asOfDay: entero del reloj de aprendizaje del laboratorio/manager
  positions: PG, SG, SF, PF, C
  offensiveRoles: O01…O15 del catálogo vigente
  defensiveRoles: D01…D12 del catálogo vigente
  tactics: los módulos de §5
development:
  tacticalLearning: 1…30
```

Cada entrada explícita guarda `level` (1–30, precisión interna suficiente), `peak` (máximo histórico adquirido, entre level y 30) y `lastPracticeDay`. La instantánea declara también su día de evaluación. Las modificaciones manuales distinguen cambiar solo el nivel y crear una historia sintética coherente; no mantienen un peak inferior al nivel.

No hay una matriz posición × rol × jugada × compañeros. Los cinco conocimientos posicionales, los roles existentes y los módulos son listas independientes, combinadas solo cuando la operación los necesita.

Un jugador puede dominar varias posiciones y roles. El 30 significa familiaridad máxima con esas responsabilidades, no talento máximo, ni la obligación de tener exactamente una posición con 30.

### 4.2 Conocimiento colectivo

No guardes una segunda maestría independiente del club o de cada quinteto. Calcula la del quinteto a partir de sus integrantes con pesos iguales para la presentación, y la de una resolución a partir de sus participantes pertinentes según §6.

Un fichaje conserva su conocimiento individual. El resumen del quinteto cambia al cambiar sus integrantes. Un cambio de entrenador no borra posiciones, roles ni sistemas ya aprendidos. Esta primera aproximación no modela química específica entre dos compañeros ni vocabulario particular de cada entrenador.

### 4.3 Separación de responsabilidades

- El motor recibe una instantánea congelada de conocimiento, roles/posiciones vigentes y parámetros.
- Durante el partido consulta esa instantánea y acumula exposición. **No aumenta ni reduce conocimientos mientras se disputa el encuentro.**
- Las funciones de aprendizaje reciben estado previo + exposición o sesión + tiempo explícito y devuelven estado nuevo y diferencias.
- El laboratorio confirma y persiste una aplicación de esas diferencias. Los lotes comparativos no evolucionan plantillas ni alteran las entradas de otros casos.
- Nada utiliza fecha/hora de pared, azar nuevo o estado global del perfil para aprender.

### 4.4 Datos ausentes y compatibilidad

Una ficha antigua sin historia se interpreta mediante una política identificada `legacy-neutral`: efecto deportivo cero de esta capa. En la interfaz aparece «sin historial de aprendizaje; compatibilidad neutra», no «domina todas las tácticas».

No escribas 62 conocimientos ficticios en las fichas guardadas de Dennis ni actives perfiles nuevos en silencio. Una copia explícita puede incorporar el bloque nuevo y semillas sintéticas identificadas. Un bloque `explicit` incompleto o inválido produce un error localizado; no rellena sus huecos silenciosamente con dominio 30.

<a id="m18-05"></a>

## 5. Catálogo pequeño y correspondencias

### 5.1 Catálogo táctico SEM18

Se utilizan **30 módulos**, no una entrada por combinación de instrucciones:

| Grupo | Identificadores de conocimiento | Correspondencia |
|---|---|---|
| Organizaciones defensivas, 6 | `ORG01`…`ORG06` | Los códigos actuales, con sus nombres actuales |
| Coberturas, 4 | `COB01`…`COB04` | Contener, cambiar, salir/recuperar, atrapar del catálogo vigente |
| Disposiciones, 6 | `DIS01`…`DIS06` | Las seis disposiciones vigentes, incluidos Horns y 1–4 alto/bajo |
| Familias ofensivas, 6 | `FAM:pick_and_roll`, `FAM:handoff`, `FAM:off_ball_screen`, `FAM:give_and_go`, `FAM:post`, `FAM:isolation` | `spec.family` del repertorio |
| Otras responsabilidades ofensivas, 3 | `FAM:transition`, `FAM:continuity`, `FAM:press_break` | Transición, continuidad compartida y salida ante presión |
| Presión defensiva, 1 | `PRESS` | Presión adelantada; 3/4 y total comparten conocimiento |
| Saques, 4 | `SAQ:O:band`, `SAQ:O:endline`, `SAQ:D:band`, `SAQ:D:endline` | Ejecución/respuesta de banda y de fondo |

Total por jugador: 5 posiciones + 15 roles ofensivos + 12 defensivos + 30 módulos = **62 niveles**, sin productos cartesianos. Los IDs de rol se reutilizan con sus rótulos actuales; no crees otra taxonomía de roles.

Si el catálogo real ha recibido cambios posteriores, conserva sus IDs y documenta la correspondencia. Un ID nuevo ajeno a lo definido aquí no recibe una interpretación deportiva inventada.

### 5.2 Familias y continuaciones

- POS01–04 → `pick_and_roll`; POS05–06 → `handoff`; POS07–08 → `off_ball_screen`; POS09–10 → `give_and_go`; POS11–13 → `post`; POS14–15 → `isolation`. Usa `spec.family`, no un segundo catálogo divergente.
- CONT01/02/03/07 conservan la familia de la interacción que continúan; sin antecedente reconocible, `continuity`.
- CONT04/05/08 → `continuity`; CONT06 → `give_and_go`.
- CONT09 es reorganización: no produce una penalización independiente de familiaridad. La siguiente interacción usa su disposición y familia reales.
- Una transición utiliza `transition`; salir de presión adelantada utiliza `press_break`.
- Un saque utiliza su módulo de banda/fondo y lado ofensivo/defensivo. No crea una maestría distinta por cada ficha Saq o DSaq.
- Una etiqueta ESP no crea un conocimiento ni multiplica un efecto. Se usa la acción física que se ejecuta y su familia existente, si la tiene.
- Un tiro inmediato sin sistema preparado sigue siendo posible. No fuerces una jugada ni asignaciones nuevas para justificar familiaridad. Si no hay familia pertinente, ese componente se omite; «no aplica» no significa «dominio 1».

### 5.3 Transferencia para aprender, sin regalar dominio

La relación entre conocimientos acelera el aprendizaje de otros, no copia automáticamente su nivel ni concede una bonificación de partido. Relaciones iniciales, simétricas, editables y sin cierre transitivo:

- Posiciones: PG–SG, SG–SF, SF–PF y PF–C.
- Roles ofensivos, grupos: `[O01,O08,O11,O12]`, `[O02,O07,O13]`, `[O03,O05,O06]`, `[O04,O09,O14,O15]`; O10 se relaciona con O05 y O09.
- Roles defensivos, grupos: `[D01,D02,D03,D07]`, `[D04,D11]`, `[D05,D12]`, `[D08,D09,D10]`; D06 se relaciona con D01, D04 y D07.
- Organizaciones: ORG02/03/04/05 comparten grupo; ORG06 se relaciona con ORG01 y ORG02.
- Disposiciones: DIS01–DIS02; grupo DIS03/DIS04/DIS05/DIS06.
- Familias: `pick_and_roll`–`handoff`; `off_ball_screen`–`give_and_go`; `continuity` con `give_and_go` y `handoff`; `transition`–`press_break`.
- Los demás módulos no tienen transferencia inicial. Un grupo produce relaciones entre sus miembros, sin añadir grupos nuevos por inferencia.

Son correspondencias SEM de entrenamiento, no prohibiciones ni afirmaciones de equivalencia técnica completa.

<a id="m18-06"></a>

## 6. Efecto durante el partido

### 6.1 Dos puntos de aplicación, sin etapas deportivas nuevas

**A. Calidad de la oportunidad:** integra un ajuste logit en la operación compartida que utiliza `qualityOf`/`qualityResolution`, antes de la perturbación de momento ya existente. Abarca ataque organizado, continuaciones, juego espontáneo pertinente y la calidad de recepción de saques que ya llama a esa función.

**B. Avance ante presión adelantada:** integra el mismo tipo de ajuste en `z` de la distribución existente de `pressedAdvance`, que decide avance controlado, retraso o presión superada. No añadas una decisión ni un sorteo; conserva las categorías y la normalización existentes. No multipliques además pesos de pérdida, falta o robo con la familiaridad.

No se añade familiaridad otra vez en conversión del tiro, libres, tapón, rebote, crédito de robo, energía o forma. La calidad ya creada tiene sus consecuencias actuales. Si un tiro hereda la calidad de un saque, no se vuelve a penalizar esa recepción en el tiro.

Una calidad forzada o determinista que el motor ya entrega sin sortear coordinación no abre una operación nueva para cobrar familiaridad. Registra «no aplica: calidad heredada/determinista» cuando corresponda. Conserva la negación y las ventajas realmente producidas; esta capa no fabrica una recepción ni reabre una jugada terminada.

No alteres directamente MEN02/MEN03, la libertad, prioridades, recetas técnicas o capacidades físicas. Esta primera capa afecta a la ejecución coordinada. La IA del entrenador conserva sus políticas actuales; puede ordenar una táctica poco conocida y asumir ese riesgo. No se introduce otra IA de entrenamiento.

### 6.2 Participantes y responsabilidades

La posición de referencia es **la asignada realmente en el quinteto**, con sus sustituciones y órdenes aplicadas; en la base revisada la conserva `slotOf`. No uses la posición nominal ni conviertas una esquina en «escolta obligatorio».

El rol ofensivo/defensivo es el vigente para el jugador en esa frontera del encuentro. Al cambiarlo se consulta el conocimiento del nuevo código. Si el rol sigue igual, un pase ordinario dentro del flujo no constituye por sí solo un cambio de rol.

Para cada resolución:

- Ataque: media ponderada de conocimientos de los participantes explícitos de esa interacción: poseedor/director pertinente, actor, pasador y bloqueador/cortador si participa realmente. Cada actor distinto pesa igual; se deduplica y se excluyen ausentes o referencias de otras opciones.
- Defensa: media de los defensores que realmente participan en esa resolución: principal, segundo de cobertura, interceptor o ayudante comprometido si ya forman parte del contexto. Se deduplica. No se seleccionan defensores nuevos para calcular conocimiento.
- Presión adelantada: ataque, manejador real; defensa, presionador y apoyo que la operación ya utiliza, deduplicados.
- Saque: sacador, receptor y pantalla real en ataque; responsables reales de la respuesta en defensa. El sacador fuera de pista sigue participando en su saque. No se inventan funciones faltantes.
- Un lado sin participantes pertinentes tiene ajuste cero; no recibe una carencia ficticia.

Al preparar los datos de la operación puedes usar los actores que ya viajan en `ex`, `roles`, la cobertura o el contexto inmediato. No recorras ni reconstruyas un partido completo para cada resolución.

### 6.3 Dominio efectivo y ajuste único

Normalización: `n(K) = (K - 1) / 29`, acotada a [0,1].

Para cada actor, combina los componentes aplicables con estos pesos iniciales:

| Componente | Peso |
|---|---:|
| Familiaridad con posición asignada | 0,20 |
| Familiaridad con rol vigente del lado correspondiente | 0,30 |
| Dominio de módulos tácticos pertinentes | 0,50 |

Si un componente no aplica, normaliza los pesos restantes; no lo sustituyas por cero. El dominio táctico del actor se obtiene de los módulos activos de la siguiente tabla, normalizando solo los que aplican:

| Contexto | Ataque | Defensa |
|---|---|---|
| Organizado / continuación con disposición | Disposición 0,40; familia 0,60 | Organización efectiva 0,70; cobertura realmente ejecutada 0,30 |
| Transición sin organización estable | `transition` 1 | Organización solo si el motor ya representa una organizada; de lo contrario, no aplica ese componente |
| Salida ante presión adelantada | `press_break` 1 | `PRESS` 0,70; organización efectiva 0,30 |
| Saque de banda/fondo | Módulo ofensivo del tipo de saque 1 | Módulo defensivo del tipo 0,70; organización efectiva 0,30 |
| Acción espontánea sin familia preparada | Familia física reconocida, si existe; disposición solo si está organizada | Organización/cobertura que existen de verdad |

Una cobertura declarada que no se utiliza no entra. Un fallback de box and one consulta **la organización ejecutada**, no penaliza además por el ORG06 que se abandonó. La altura normal no utiliza el módulo PRESS.

Agrega los dominios normalizados de los participantes: `D_A`, `D_D`. Sus carencias son `U_A = 1 - D_A`, `U_D = 1 - D_D`.

```text
deltaFamiliaridad = maxLogitDefensa * U_D - maxLogitAtaque * U_A
```

Semilla: **0,30 logit por lado**, tanto en calidad como en avance presionado. Un lado sin conocimiento explícito y en compatibilidad neutra aporta U=0. Con todas las familiaridades a 30 el ajuste es exactamente cero.

El signo es deliberado: desconocimiento ofensivo dificulta crear ventaja; desconocimiento defensivo facilita la ventaja rival. Carencias similares pueden compensarse en esa comparación. Es una simplificación funcional explícita: no se añaden errores ni varianza independientes por «desconocimiento».

El ajuste se aplica **una sola vez por operación**. No penalices por separado posición, rol, sistema, cada jugador y el equipo después de haberlos combinado. Una acción posterior distinta puede consultar sus responsabilidades, pero no vuelve a cobrar el mismo cálculo heredado de calidad.

En calidad añade el componente a `extraZ` conservando separados forma/presión y familiaridad en el diagnóstico. No lo escondas dentro de otro ajuste cuyo límite borre silenciosamente el efecto. En presión adelantada modifica el `z` ya existente una vez. En ambos casos se conserva el resto de la aritmética, límites y estados.

### 6.4 Estimaciones coherentes y camino neutral

Las previsualizaciones que estiman calidad cómoda —por ejemplo media distancia— deben usar la misma función pura con el conocimiento pertinente y sin registrar exposición ni consumir azar. No dupliques una fórmula aproximada para la interfaz o el selector.

Con módulo desactivado, compatibilidad neutra o dominios todos 30, conserva exactamente el deporte de CONTROL17B: mismos sorteos, hechos y resultados para la misma entrada deportiva. La instrumentación puede añadir metadatos versionados, nunca acontecimientos deportivos ficticios.

No exijas el mismo resultado entre conocimientos bajos y altos: cambian probabilidades y, por sus consecuencias, puede cambiar después el resto del partido. Tampoco exijas que el caso experto gane siempre.

<a id="m18-07"></a>

## 7. Polivalencia y entrenador

### 7.1 Rasgo del jugador

Rótulo visible: **«Polivalencia · aprendizaje táctico»**. Campo de desarrollo `tacticalLearning`, escala 1–30, semilla 16.

Representa facilidad para aprender posiciones, roles y sistemas; los niveles adquiridos representan lo que ya sabe. No se añade al diccionario de las 32 capacidades, al cálculo de una media deportiva ni a las recetas de partido.

Dos jugadores con las mismas capacidades y conocimiento actual pero distinta Polivalencia deben disputar el mismo partido con la misma semilla. Aprenderán cantidades distintas después de la misma exposición. La edad no reemplaza este rasgo: no hay bono automático de veterano ni penalización nueva por ser joven.

### 7.2 Datos de enseñanza del entrenador

Añade un bloque pequeño de aprendizaje del entrenador del equipo, separado de las políticas actuales de dirección:

- `teaching`, 1–30: capacidad de enseñanza; semilla 16.
- `tacticalMastery[module]`, 1–30 para los 30 módulos: competencia del entrenador en el contenido; semilla explícita 16 cuando se crea una copia de laboratorio.

Para aprender posiciones y roles se utiliza teaching. Para módulos tácticos, teaching y la competencia en el módulo. Un entrenador con poca competencia enseña más despacio; no impone un techo irreversible al jugador ni borra conocimientos previos.

La competencia del entrenador es un dato editable de laboratorio en esta entrega. Su carrera y evolución automática se resolverán en el manager; no inventes un segundo sistema de progresión del staff.

Durante el partido estos datos no conceden bonos directos: su efecto llega mediante el aprendizaje ya adquirido. Las decisiones deportivas del entrenador siguen teniendo los efectos actuales.

<a id="m18-08"></a>

## 8. Aprendizaje entre partidos

### 8.1 Funciones puras y presupuesto

Expón funciones para evaluar una sesión, obtener exposición de un encuentro y proponer una actualización, sin DOM ni persistencia interna. El llamante recibe estado nuevo y recibo de diferencias; la escritura es una acción explícita y atómica del laboratorio.

Cada propuesta conserva fuente, identidad del jugador/equipo, huella del estado previo, día, parámetros, dosis por objetivo, antes/después y máximo histórico. No modifica los 32 atributos, edad, cuerpo, energía o forma.

No se aprende por acertar, ganar, tener una prioridad alta o navegar por la interfaz.

### 8.2 Dosis de entrenamiento

Unidad: **hora equivalente dedicada a un conocimiento**, una abstracción de producto rotulada como tal.

La sesión de laboratorio tiene entre 0,25 y 4 horas por jugador y día. Reparto inicial: 60 % al foco táctico colectivo y 40 % a un foco individual —posición o rol ofensivo/defensivo—. Cada jugador puede tener un foco individual distinto. Los porcentajes son editables y suman 1; una parte sin foco queda sin utilizar y se muestra, no se redistribuye silenciosamente.

Los jugadores seleccionados entrenan el foco colectivo. El individual solo se aplica si se ha definido para ese jugador. Repetir una sesión el mismo día respeta el presupuesto acumulado de cuatro horas por jugador; no lo reinicia con cada clic. No se construye un calendario semanal automático.

### 8.3 Dosis procedente de partido

Acumula entre los acontecimientos ya existentes:

- Décimas de juego vivo por jugador y posición realmente asignada.
- Décimas por rol ofensivo y defensivo vigentes. Si cambia un rol, divide la exposición desde su aplicación real.
- Participación en módulos tácticos de operaciones reales de §6. Cuenta una sola vez jugador–módulo–operación; distribuye el crédito de cada operación entre sus módulos mediante los pesos normalizados de §6.

Los chequeos de elegibilidad, cálculos de candidatos, previsualizaciones y lecturas del análisis no aportan exposición. Resolver de verdad una opción de saque que el rival niega sí puede aportarla a sus participantes, aunque no llegue a recepción.

Tras terminar el encuentro:

1. Para posición y cada lado de rol, dosis total del dominio = `min(minutosVivos / 40, 1)`, repartida entre los conocimientos según sus minutos reales.
2. Para tácticas, el mismo presupuesto total `min(minutosVivos / 40, 1)` se reparte por exposición ponderada entre los módulos utilizados por el jugador. No se concede ese presupuesto entero a cada módulo.
3. Un jugador sin exposición táctica pertinente no recibe dosis táctica.
4. El presupuesto acumulado de experiencia de partido es como máximo 1 por jugador y dominio y día de aprendizaje. Una prórroga, repetir la descarga o disputar otra simulación del mismo resultado no lo multiplica sin control.
5. Entrenamiento y experiencia de partido tienen presupuestos separados y registrados. Los lotes de laboratorio solo proponen diferencias; nunca las aplican automáticamente a equipos compartidos.

Esta exposición es una aproximación declarada; no pretende cronometrar todos los movimientos ni atribuir cada segundo a una jugada.

### 8.4 Ganancia y factores

Para un objetivo con nivel K, utiliza estas funciones administrables:

```text
fJugador = 0,75 + 0,50 * n(Polivalencia)
fEnseñanza = 0,75 + 0,50 * n(teaching)
fContenido = 0,75 + 0,50 * n(competenciaEntrenadorEnModulo)  // solo tácticas; demás dominios: 1
fTransferencia = 1 + 0,50 * max(n(K_relacionado))          // 1 si no hay relacionados
G = tasaDominio * dosis * fJugador * fEnseñanza * fContenido * fTransferencia
K_nuevo = 30 - (30 - K) * exp(-G / 29)
```

Tasas iniciales: posiciones 0,40; roles ofensivos 0,40; defensivos 0,40; tácticas 0,80. Unidad: puntos nominales de aprendizaje por hora equivalente antes de factores y reducción por proximidad al máximo.

La fórmula reduce la ganancia cerca del máximo y evita que dividir una misma dosis con factores constantes produzca artificialmente más aprendizaje. Con K≥29,95 tras aprender, ajusta a 30; ese umbral vive en tabla. Nunca excede 30.

Después de aprender conserva `peak_nuevo = max(peak_anterior, K_nuevo)`. El desuso no reduce peak. Un cambio manual de escenario puede editar ambos explícitamente, dejando sus diferencias y respetando `1 <= level <= peak <= 30`.

Los conocimientos relacionados son los de §5.3, del mismo jugador y previos a la transacción. No encadenes transferencias dentro de la misma sesión para crear una cascada de mejoras. La transferencia ayuda a aprender; no modifica por sí sola el rendimiento instantáneo ni aumenta otro objetivo no entrenado.

Para recuperar un nivel inferior al máximo histórico usa factor de reaprendizaje 2 hasta alcanzar ese máximo. Si una dosis lo cruza, resuelve los dos tramos con la misma fórmula: tramo acelerado hasta peak y dosis restante normal. No aceleres la adquisición de niveles que nunca se habían aprendido. Usa cálculo cerrado por tramos, no un bucle por cada día/hora.

### 8.5 Aplicación segura e idempotente

Una propuesta declara `source_id`, huella del estado previo y huella del estado propuesto. La persistencia verifica que sigue partiendo del mismo estado y que esa fuente no se aplicó ya a esa instancia de equipo. Una repetición se rechaza con motivo; una restauración explícita del laboratorio queda identificada como tal.

Los identificadores incorporan fuente/lote/intento y la instancia del equipo; un `M000001` local no basta. Mantén el registro de aplicaciones fuera del núcleo deportivo. El futuro manager podrá persistirlo en su transacción; aquí basta la persistencia real ya utilizada por las variantes del laboratorio, sin montar otra base de datos.

<a id="m18-09"></a>

## 9. Retención, desuso y recuperación

### 9.1 Curva sencilla

La pérdida por desuso se calcula solo al avanzar el reloj explícito de aprendizaje, en bloque. No se ejecuta dentro de un encuentro ni al abrir una página.

| Dominio | Gracia sin práctica | Pérdida por año después de gracia | Suelo como fracción del peak |
|---|---:|---:|---:|
| Posiciones | 365 días | 0,40 puntos | 0,85 |
| Rol ofensivo | 180 días | 0,60 puntos | 0,80 |
| Rol defensivo | 180 días | 0,60 puntos | 0,80 |
| Módulo táctico | 90 días | 1,50 puntos | 0,60 |

```text
inicioDesgaste = max(diaEvaluadoAnterior, lastPracticeDay + gracia)
diasConDesgaste = max(0, diaDestino - inicioDesgaste)
suelo = max(1, peak * fraccionRetenida)
K_despues = max(suelo, K_antes - perdidaAnual * diasConDesgaste / 365)
```

No se aplica un suelo que aumente un nivel actual ya inferior a él por una edición explícita de escenario: en ese caso el desuso mantiene o reduce el nivel, nunca lo mejora. Rechaza un día destino anterior; la restauración de una copia es otra operación identificada.

Con K=peak=30, última práctica día 0 y evaluación día 3650, la posición queda en **26,4**: nueve años de desgaste después del año de gracia. Esa cifra es una decisión SEM de producto, no una medición científica.

Esto representa conservar responsabilidades durante años. Los atributos físicos y técnicos actuales siguen determinando si un jugador de 2,20 m puede rendir como alero; familiaridad 26,4 no significa calidad deportiva 26,4.

### 9.2 Práctica relevante

Una dosis de al menos 0,10 en posición/rol o 0,02 en módulo táctico se considera práctica relevante para renovar `lastPracticeDay`. Son umbrales editables. La dosis menor puede aportar su ganancia, pero no reinicia por sí sola todo el periodo de gracia. Agrega la práctica del mismo objetivo y día antes de evaluar ese umbral, de modo que dividir una sesión no altere el resultado.

Conserva los presupuestos y dosis acumuladas necesarios del día actual de aprendizaje; al pasar de día se cierran en un recibo y se reinicia el acumulador de ese día. No guardes una cronología por segundo.

Para una sesión que indica «dejar transcurrir N días y entrenar», primero aplica desuso hasta el día destino y después la sesión de ese día. No interpretes N días como N repeticiones del entrenamiento.

<a id="m18-10"></a>

## 10. Semillas administrables e inicialización

### 10.1 Filas nuevas del panel

Agrupa en «Familiaridad y aprendizaje»:

- Activación y política de compatibilidad.
- Catálogo y correspondencias de los 30 módulos.
- Pesos posición/rol/táctica y pesos de módulos por contexto.
- Máximos logit de ataque/defensa en calidad y avance presionado: cuatro filas, inicial 0,30.
- Relaciones de transferencia de §5.3, sin duplicidades y con catálogo validado.
- Rangos, tasas, factores de enseñanza/jugador/contenido/transferencia/reaprendizaje, umbral de 29,95.
- Presupuestos, normalización de experiencia, reparto de sesión y práctica relevante.
- Gracia, pérdida anual y fracción retenida por dominio.
- Semillas sintéticas y categorías visibles de dominio.

Cada fila tiene ID estable, valor, unidad, rango, consumidor, procedencia SEM18, versión y explicación de qué cambia. No ocultes constantes en los componentes de interfaz ni en tests. Validación: valores finitos, niveles 1–30, pesos positivos y normalizables, tasas no negativas, retención [0,1], presupuestos positivos y relaciones que referencian IDs existentes.

Las identidades de catálogo son contenido declarativo. Las magnitudes ajustables se registran en el panel existente y en `data:check`. No construyas un segundo panel independiente.

### 10.2 Referencias intactas y copias de demostración

EQ01–EQ12, planes naturales e históricos y fichas guardadas conservan sus capacidades y datos. Sin historia nueva son legacy-neutral. No atribuyas un historial real de entrenamiento a partir de una prioridad del libro.

Botón explícito **«Crear copia de aprendizaje MOTOR-18»**, con diferencia identificada. La fábrica SEM genera el bloque completo de 62 conocimientos:

| Dato de la copia sintética | Semilla |
|---|---:|
| Posición nominal/habitual existente de la ficha | 30 |
| Posiciones relacionadas directamente con ella por §5.3 | 18 |
| Otras posiciones | 8 |
| Rol ofensivo habitual existente | 26 |
| Roles ofensivos relacionados | 18 |
| Otros roles ofensivos | 8 |
| Rol defensivo habitual existente | 26 |
| Roles defensivos relacionados | 18 |
| Otros roles defensivos | 8 |
| Módulos tácticos, valor general | 12 |
| Organización, cobertura y disposición del plan cargado | 24 |
| Familias de las fichas con prioridad 1–2 del plan, solo para construir esta demostración | 24 |
| Polivalencia y teaching | 16 |
| Competencia táctica del entrenador | 16 por módulo |

Es una **fábrica de historia sintética**, no una inferencia ni una regla de aprendizaje: cambiar después el libro no modifica ningún nivel. Resuelve conflictos de semillas tomando el máximo propuesto y conserva en el recibo qué regla se utilizó. `peak=level`, última práctica y día evaluado en el día inicial declarado de esa copia.

El modo de contraste «todo dominado» usa nivel 30 en las 62 entradas, sin modificar capacidades, cuerpo ni planes. Es una copia de laboratorio explícita; no se describe como historia observada.

### 10.3 C17-02

P0 conserva gasto 2 y P1 incorpora C17-02, gasto 3,5, como en MOTOR-17B. C17-02 sigue siendo referencia provisional, sin aceptación deportiva automática. No la actives en los perfiles guardados ni recalibres energía para compensar familiaridad.

<a id="m18-11"></a>

## 11. Laboratorio e interfaz

### 11.1 Fichas y preparación

Integra en las pantallas actuales, sin renovar toda la aplicación:

- En Plantillas/ficha, apartado desplegable «Conocimiento»: posiciones, roles ofensivos/defensivos y módulos, con filtros por lo solicitado en el plan actual.
- Polivalencia en «Desarrollo», claramente separada de las 32 capacidades.
- Edición de un conocimiento y edición masiva del conocimiento seleccionado +1/+3/+5 en los jugadores seleccionados, con vista previa y deshacer exacto. No confundas este control con el ya existente de atributos deportivos.
- Presentación de level, peak y última práctica en diagnóstico del laboratorio; en la vista normal propia bastan nivel/categoría y explicación.
- En Preparación, dominio del quinteto actual para disposición, organización, cobertura y familia elegidas, más los jugadores con menor familiaridad. Los resúmenes se recalculan al cambiar quinteto o plan, sin entrenar ni alterar fichas.
- Al asignar otra posición/rol, muestra su familiaridad y las capacidades pertinentes ya disponibles. Nunca bloquees por posición nominal ni prometas un porcentaje de acierto a partir del dominio.

Categorías iniciales de presentación: 1–6 inicial; >6–12 básico; >12–18 competente; >18–24 avanzado; >24–30 dominado. Fronteras en tabla y cálculo común para todas las pantallas. No son cortes de la fórmula deportiva, que es continua.

### 11.2 Panel de sesión mínimo

Dentro del laboratorio:

1. Elegir copia de equipo y jugadores.
2. Elegir teaching y competencia del entrenador para el contenido, sin tocar sus políticas deportivas.
3. Elegir foco táctico colectivo, foco individual por jugador, horas totales y reparto.
4. Elegir días sin práctica que transcurren antes de esa sesión, entre 0 y 3650.
5. **Previsualizar**: niveles antes/después, desuso, dosis, factores y presupuestos.
6. **Aplicar a una copia** o aplicar explícitamente a la variante seleccionada, con recibo y deshacer.

Ofrece también «Solo desuso»: transcurre el intervalo indicado sin sesión ni horas de entrenamiento. Deshacer restaura conocimiento, peak, reloj y presupuestos, y marca la aplicación como revertida conservando su rastro; no deja un aprendizaje activo ni consume dosis después de restaurar. No es un mecanismo para aplicar dos veces una misma fuente vigente.

Indica que es un laboratorio de conocimiento: no adelanta diez años la edad del jugador ni simula fatiga, lesiones o una temporada al pulsar «3650 días». El reloj real del manager se conectará después.

Tras un partido terminado, «Ver aprendizaje propuesto» muestra sus exposiciones y diferencias; «Aplicar a esta variante» es una acción separada. Reabrir un partido, analizarlo, descargarlo o ejecutarlo en lote no aplica aprendizaje.

### 11.3 Información en el partido

Antes de comenzar y en ventanas actuales de dirección, permite consultar la familiaridad propia con lo que se va a pedir. Los cambios de plan afectan a su aplicación desde la frontera reglamentaria ya existente; no cambian instantáneamente el nivel aprendido.

Los rivales no revelan sus conocimientos exactos, teaching ni Polivalencia en público. En diagnóstico de laboratorio pueden inspeccionarse con identificación expresa de esa audiencia.

No añadas ventanas de confirmación para cada cambio táctico. Una táctica poco conocida muestra su advertencia explicativa y puede ordenarse.

<a id="m18-12"></a>

## 12. Persistencia, reproducción y audiencias

### 12.1 Contratos y versiones

Identifica al menos:

- Aplicación `MOTOR-18`; motor `beM-motor-0.18.0-MOTOR18`.
- Extensión de parámetros `SEM-MOTOR18-20261021`.
- Conocimiento `KNOW-MOTOR18-R1`; aprendizaje `LEARN-MOTOR18-R1`; mecanismo `FAM-MOTOR18-R1`.
- Entrada `beM-match-input/7` y export `beM-match-export/10` para la instantánea y exposición nuevas, con compatibilidad de lectura explícita.
- Conservación esencial `ESE-MOTOR18-R1` y proyección nueva de auditoría, siguiendo la nomenclatura existente.

La política de acta de MOTOR-17B no cambia por añadir familiaridad. Si tu base incluye un cambio posterior autorizado, conserva y documenta su identidad real; no le atribuyas uno inexistente a esta entrega.

Amplía de forma aditiva la fachada del motor y ofrece funciones puras de aprendizaje desde un módulo separado. No introduzcas dependencias del DOM o de almacenamiento en el núcleo.

### 12.2 Congelación y continuidad

La entrada y el perfil contienen el conocimiento efectivo y los datos necesarios para reproducir el encuentro. Un cambio de fichas/entrenador durante un partido no altera su instantánea.

Un guardado MOTOR-18 conserva también los acumuladores parciales de exposición, roles/posiciones vigentes y referencias necesarias para continuar. Guardar y restaurar no duplica la experiencia anterior al guardado. El aprendizaje solo se propone desde el resultado final completo.

Continúa únicamente guardados de motor compatible. Los antiguos se rechazan con motivo y permanecen intactos; leer su análisis histórico y reproducirlos/continuarlos son operaciones distintas. La compatibilidad neutra de una ficha no convierte un snapshot antiguo en uno nuevo.

### 12.3 Audiencias y datos privados

Revisa las listas de campos de serialización, no solo la pantalla:

- Público: hechos deportivos y explicaciones públicas permitidas; sin matrices privadas, probabilidades, teaching o Polivalencia rival.
- Propia: conocimiento del equipo autorizado y su preparación; rival conforme a lo público actual.
- Diagnóstico: instantáneas, descomposición y parámetros completos.

Los nuevos bloques de entrada, recibos, exports JSON/CSV/MD y snapshots no deben saltarse el filtrado existente por añadir propiedades desconocidas. Los paquetes de auditoría se identifican como diagnósticos.

Los hashes de archivo, entrada y trayectoria conservan su significado. La entrada completa incluye la información de aprendizaje. Diferencias de Polivalencia sin diferencias de conocimiento pueden cambiar la huella de entrada, pero no deben cambiar el deporte del encuentro; compruébalo con los campos deportivos, sin borrar estadísticas o estados para fabricar equivalencia.

<a id="m18-13"></a>

## 13. Instrumentación y sensibilidad

### 13.1 Registrar lo que se consume

En diagnóstico registra por operación pertinente:

- Identidad global de encuentro/intento, hecho y operación.
- Contexto, participantes deduplicados, posición y rol vigentes, módulos activos y origen de la organización efectiva.
- Niveles y pesos utilizados, componentes omitidos y razón.
- Dominio/carencia de cada lado y delta logit, con máximo y versión.
- Entrada de la operación antes/después y distribución final consumida.
- Si el cálculo es estimación, operación realmente resuelta o calidad heredada sin reaplicación.

Mantén la descomposición de forma, presión, momentos, memoria y familiaridad separada. No introduzcas acontecimientos deportivos para registrar conocimiento. No escribas las 62 entradas de cada jugador en cada decisión: la instantánea completa vive una vez y la operación guarda referencias y lo realmente utilizado.

En esencial conserva la instantánea/versiones necesarias, un resumen compacto de aplicación y la exposición final por jugador/conocimiento, con numerador, denominador y unidad. No copies las trazas completas ni elimines análisis ya disponibles para ganar velocidad.

### 13.2 La sensibilidad existente debe seguir siendo correcta

Al contrastar +1/+3/+5 de una de las 32 capacidades, el conocimiento adquirido permanece fijo. Recalcula sus dependencias reales de §3 y la función compartida con el componente de familiaridad conservado.

Añade una lectura separada de sensibilidad de conocimiento: misma operación y actor, aumentar **un nivel de conocimiento** +1/+3/+5 hasta 30, recalcular sus contribuciones dentro de la operación y conservar capacidades y demás conocimientos. Polivalencia/teaching solo se contrastan en la función de aprendizaje.

Separa claramente las tres preguntas: capacidad deportiva, conocimiento actual y velocidad de aprendizaje. No mezcles sus unidades ni amplíes el contador AUD05 a 33 capacidades.

### 13.3 Coste

No simules aprendizaje por segundos o por cada día transcurrido. Precalcula componentes inmutables por encuentro y utiliza invalidación pequeña cuando cambian roles/posiciones/plan. La exposición se agrega en contadores acotados por jugador y catálogo, sin una lista de todos sus movimientos.

Mide tiempo y bytes de la campaña, separando esenciales y diagnósticos. Compara el coste de los seis pares neutrales con su control, indicando lo pequeña que es la muestra y sin extrapolarla a cien/doscientos. Objetivo orientativo de diseño: sobrecoste bajo; una señal sostenida superior al 10 % merece localizar el coste exacto dentro de esta entrega. No sacrifiques reglas, registros comprometidos o determinismo para ocultarlo. El objetivo heredado de cien partidos en cinco segundos sigue abierto y no se mide aquí.

<a id="m18-14"></a>

## 14. Pruebas proporcionadas

Pruebas automáticas justas y con valor; Dennis hará la aceptación manual. Agrupa propiedades relacionadas en pocas pruebas parametrizadas. No hagas un test por fila, jugador, familia, combinación o valor del panel. No escribas cientos de snapshots que reflejen la implementación.

Controles necesarios:

1. Regresión de dependencias compartidas: el ejemplo FIS07 falla con el auditor anterior; control con dos entradas, actor deduplicado, distribución normalizada y saturación.
2. AUD11: alternativa acreditada, orden pendiente que no explica un cambio y discrepancia real no explicada. Los recuentos originales no desaparecen.
3. Conocimiento: camino neutral, signo y límite del ajuste, omisión de componentes, roles/posición aplicados desde su frontera, calidad heredada sin segundo ajuste. Un pívot competente sigue siendo elegible de base.
4. Aprendizaje/retención: factores, presupuestos, reaprendizaje hasta peak, no tocar capacidades, idempotencia y equivalencia de dividir dosis/tiempo con factores constantes. Usa tolerancia numérica proporcionada, no una coincidencia de texto redondeado.
5. Persistencia y audiencias: round-trip de copia, guardado/continuación sin duplicar exposición y ausencia de campos privados en audiencia pública/rival.
6. Contratos y filas administrables: datos válidos, referencias completas y errores localizados sin defaults ocultos.

Ejecuta la suite completa **una vez sobre el código final** y `data:check`; repítela solo si después cambias implementación o aparece un fallo que lo justifique. No se exige una cantidad de tests nuevos. Actualiza expectativas de versión/compatibilidad con motivo explícito, sin debilitar invariantes deportivas.

Comprobaciones puras de aprendizaje, conservadas como tablas de cálculo, sin nuevos encuentros:

| ID | Contraste |
|---|---|
| L18-01 | Misma dosis/conocimiento/entrenador, Polivalencia 8 frente a 24 |
| L18-02 | Mismo jugador/contenido/dosis, teaching 8 frente a 24 |
| L18-03 | Mismo teaching/jugador/dosis, competencia del entrenador en ORG02 8 frente a 28 |
| L18-04 | Misma dosis y factores, nivel inicial 12 frente a 28: ganancia menor cerca del máximo |
| L18-05 | Nivel 26 con peak 30 frente a nivel/peak 26: reaprendizaje y corte del tramo acelerado |
| L18-06 | Posición 30, peak 30, sin práctica 3650 días: 26,4 |
| L18-07 | Desuso de roles y módulos con sus curvas y suelos, sin aumentos artificiales |
| L18-08 | Práctica relevante renueva la fecha; dosis fragmentadas del día se agregan |
| L18-09 | Un intervalo largo frente a sus subdivisiones, sin práctica: mismo resultado |
| L18-10 | Una dosis frente a dos mitades con factores constantes, incluidos tramos de reaprendizaje |
| L18-11 | Fuente de partido aplicada dos veces: la segunda no modifica nada |
| L18-12 | Cambio de entrenador/equipo no borra conocimientos; otro quinteto cambia el resumen colectivo |
| L18-13 | Transferencia acelera aprender un objetivo relacionado sin subirlo ni mejorarlo antes de entrenar |
| L18-14 | Sesiones sucesivas y partidos del mismo día respetan sus presupuestos acumulados |

El recorrido de Chromium se limita a fichas, copia neutral y sintética, plan con familiaridad, previsualización/aplicación/deshacer de sesión, desuso del veterano, partido/continuación, análisis por audiencias, panel y descargas. Conserva errores reales de consola/red y pasos ejecutados. Las descargas se comprueban por bytes; un enlace visible no prueba su descarga.

<a id="m18-15"></a>

## 15. Campaña final de 36 ejecuciones

Congela antes de simular una agenda legible y de máquina, con entradas, semillas, perfiles y diferencias. No ajustes SEM18 tras mirar resultados de esa agenda. Si hay un defecto de implementación, conserva el intento y repite solo lo invalidado, identificándolo.

### 15.1 A · seis pares neutrales: 12 ejecuciones

Seis casos, cada uno en CONTROL17B y MOTOR-18 neutral, registro esencial, misma entrada deportiva y semilla. En M18 utiliza conocimiento explícito 30 o compatibilidad neutra, como se indica:

| Caso | Equipos y plan | Perfil | Semilla | Neutralidad M18 |
|---|---|---|---:|---|
| A01 | EQ01–EQ02, planes históricos de referencia | P0 | 20261016 | legacy-neutral |
| A02 | EQ03–EQ09, planes naturales | P1 | 382000002 | Todos los dominios 30 |
| A03 | EQ07–EQ08, planes naturales | P1 | 382000003 | Todos 30 |
| A04 | EQ11–EQ12, planes naturales | P1 | 382000004 | Todos 30 |
| A05 | Dos instancias de EQ01, IDs diferenciados | P1 | 382000005 | legacy-neutral |
| A06 | EQ01–EQ11, ORG06 con objetivo y alternativa individual fuera de pista como B04 de M17B; fallback ORG02 | P1 | 382000006 | Todos 30 |

No esperes huellas brutas iguales si incluyen versiones. Compara marcador, parciales, reloj, hechos/orden, participantes, quintetos, sorteos, acta completa, órdenes y estados. No excluyas robos ni valoración: su política ya es la de MOTOR-17B y debe permanecer igual.

Cada ejecutable recibe el contrato de entrada y perfil que admite su versión. La adaptación entre los contratos de CONTROL17B y M18 solo cambia metadatos y los bloques nuevos neutrales; conserva idénticos capacidades, estados, planes, órdenes, contenido de parámetros deportivos previos y semillas. No pases una entrada incompatible al control y presentes su rechazo como un resultado comparable.

### 15.2 B · ocho contrastes: 16 ejecuciones esenciales

Todos son MOTOR-18, P1, capacidades/energía/planes idénticos entre las dos variantes de cada caso. Copias explícitas con los 62 niveles a 30 salvo el conocimiento que se contrasta. `peak=level` y datos temporales coherentes. No evoluciones las fichas entre casos.

Variantes: **K8** y **K28**, cambiando exclusivamente el conocimiento indicado. Semilla del caso `383000000 + número` en ambas variantes.

| Caso | Equipo/condición fija en ambas variantes | Única diferencia K8/K28 |
|---|---|---|
| B01 | EQ01–EQ02; EQ02 usa ORG02 | Dominio ORG02 de los jugadores de EQ02 |
| B02 | EQ01–EQ02; EQ01 prioriza POS01 y conserva alternativas actuales | `FAM:pick_and_roll` de EQ01 |
| B03 | EQ01–EQ02; EQ01-J01 tiene asignado el rol O01 en ambas | Familiaridad O01 de EQ01-J01 |
| B04 | EQ01–EQ02; intercambio explícito de puestos PG/C entre EQ01-J01 y EQ01-J10, roles conocidos, rotación manual fija de ese equipo en este escenario | Familiaridad PG de EQ01-J10 |
| B05 | EQ01–EQ02; EQ02 utiliza COB02 y D06 para sus jugadores, en ambas | Familiaridad D06 de EQ02 |
| B06 | EQ01–EQ02; EQ02 presiona a pista completa en ambas | Módulo PRESS de EQ02 |
| B07 | EQ01–EQ02, libros actuales de saques | `SAQ:O:band` de EQ01 |
| B08 | EQ01–EQ02, respuestas actuales de saques | `SAQ:D:endline` de EQ02 |

La rotación fija y el intercambio posicional de B04 son un extremo identificado de laboratorio, no una recomendación para los planes naturales ni una medida de medias de liga. No impidas alineaciones por nominalidad ni fuerces aciertos para demostrar el caso.

Si no se expone una responsabilidad, informa exposición insuficiente. No inventes una cuota de saques, fichas o ESP ni cambies la semilla para hacer aparecer el resultado deseado. La verificación causal se apoya además en los cálculos puros y las probabilidades conservadas.

### 15.3 C · seis repeticiones diagnósticas

Repite en diagnóstico completo, con las mismas entradas y semillas, estos seis esenciales B: **B01-K8, B02-K28, B03-K8, B04-K8, B06-K8, B08-K28**.

Son repeticiones de observación, no seis casos deportivos nuevos. Deben coincidir en deporte y exposición final con su esencial. Usa esos diagnósticos para el auditor de las 32 capacidades corregido y para ejemplos de familiaridad con salida real; si falta una capacidad, declárala sin lanzar otra campaña.

### 15.4 D · dos comprobaciones adicionales

- **D01:** repite B01-K8 cambiando únicamente Polivalencia de todos los jugadores de EQ02 de 16 a 30. Misma semilla y conocimiento actual. El partido debe coincidir; la propuesta de aprendizaje puede cambiar.
- **D02:** repite B02-K28 con guardar/restaurar en la primera frontera de periodo y continuar hasta el final. Resultado, secuencia y exposición final coinciden con su esencial; no se aprende dos veces lo jugado antes del guardado.

**Total planificado: 12 + 16 + 6 + 2 = 36 ejecuciones de encuentro.** No son 36 observaciones independientes. Las comprobaciones L18 son cálculos puros, no partidos. Pruebas y navegador pueden ejecutar encuentros adicionales necesarios: decláralos aparte con su motivo, sin esconderlos en ese total.

No lances cien, doscientos o miles, ni repitas MOTOR-16/17/17B. Los resultados de marcadores no son objetivos que haya que alcanzar. ChatGPT y Dennis interpretarán el efecto deportivo; no declares una calibración a partir de ocho pares.

<a id="m18-16"></a>

## 16. Paquetes para ChatGPT

Entrega archivos reales descargables, con comprobador mecánico y recibo externo. Aprovecha las herramientas de lotes/auditoría ya existentes. El paquete rápido debe ser legible sin abrir cientos de megabytes.

### 16.1 Archivos finales

- `MOTOR-18-revision-rapida.zip`, objetivo **≤5 MiB**.
- `MOTOR-18-indice-partes.json` con tamaños, SHA-256 y contenido.
- `MOTOR-18-evidencia-detallada.zip` o partes **≤64 MiB** cada una.
- `MOTOR-18-verificacion-final.json`, fuera de los ZIP, referenciando los archivos finales y sus comprobaciones, sin autorreferencia.

No subas a Git las trazas masivas de `out/`. Conserva en Git la agenda, parámetros, scripts, documentación y evidencia compacta de cierre conforme a las normas del repositorio. Si el entorno permite adjuntar archivos, adjunta el rápido, índice y recibo primero; no afirmes que se han adjuntado si solo existen en una ruta del contenedor.

### 16.2 Contenido mínimo del rápido

| Contenido | Detalle necesario |
|---|---|
| LEEME y resumen factual | Qué está hecho, corregido, probado, pendiente y no ejecutado; sin aceptar calibraciones |
| Identidades | Commits completos, estado inicial/final, rama/PR y dependencia real, versiones, perfiles P0/P1, Node y entorno |
| Agenda | 36 ejecuciones con IDs globales, semilla, variante, finalidad y enlace diagnóstico/esencial |
| Parámetros SEM18 | Todas las filas nuevas y correspondencias, unidades, fuentes y valores; diferencias frente al control |
| Comparación neutral | Los seis pares y cada campo conservado, con primera discrepancia si existe |
| Equipos y jugadores | Acta básica, minutos, energía, posiciones/roles utilizados; pertenencia y `team_index` correctos |
| Contrastes B | Diferencias exactas de conocimiento, exposiciones, distribuciones de calidad, pérdidas, puntos y demás resultados observados con denominadores; sin causalidad atribuida al marcador de una sola pareja |
| Aplicaciones de familiaridad | Agregados por contexto/lado/módulo, magnitud del ajuste, número de operaciones y ejemplos de un uso real, uno neutral y uno heredado sin reaplicación |
| Exposición y aprendizaje | Dosis por dominio y jugador, presupuestos, fuentes, antes/después; tabla L18 con entradas y salidas completas |
| Sensibilidad | 32 capacidades y conocimiento por separado; hasta ocho contextos por capacidad, incrementos y todas sus dependencias; bases, unidades, precisión y salida consumida |
| Correcciones 17B | Casos de dependencias compartidas, contraste antes/después y clasificación explicada/no explicada de AUD11 |
| Continuación y niveles de registro | Seis pares diagnóstico/esencial, D01 y D02; deporte y exposición comparados |
| Auditorías | AUD01–32 con exposición/registro/resultado; controles de familiaridad separados y sus límites |
| Coste | Tiempo por ejecución y fases disponibles, tamaño, memoria si se mide, comparación neutral; no extrapolaciones de cien partidos |
| Verificaciones | Logs finales de suite/datos/documentación, navegador y descarga real; claramente aportado, pendiente o no ejecutado |

No metas en el rápido matrices completas de parámetros repetidas por cada fila. Conserva claves y diccionario para cruzar las tablas. Los nulos no se rellenan con cero y los intentos fallidos no tienen marcador ni cuentan como derrota.

### 16.3 Evidencia detallada

Incluye entradas congeladas de la campaña, esenciales, seis diagnósticos completos, exposiciones, recibos y resultados L18, código/diff de los módulos afectados suficiente para lectura independiente, auditoría y los logs. Los contextos de sensibilidad deben incluir las recetas de **todas** las entradas dependientes de la operación, no solo la que se seleccionó primero.

El comprobador verifica integridad, recuentos, pertenencia, enlaces, semillas y diferencias declaradas; neutralidad, límites de dominio, presupuestos, repetición de aplicación, unidades y coherencia de los agregados. Declara su límite: comprobar un hash o la existencia de un campo no demuestra por sí solo que la sensibilidad esté completa o que la simulación sea realista.

Genera el recibo y acredita las descargas después del empaquetado final. Si cambia un archivo posteriormente, actualiza sus índices/recibo y las comprobaciones afectadas. No repitas partidos por cambiar solo documentación o empaquetado.

<a id="m18-17"></a>

## 17. Documentación, precedencia y cierre

### 17.1 Documentar en el lugar establecido

Archiva este prompt como MD en `docs/prompts/`, actualiza su catálogo y crea `MOTOR-18-recorrido-manual.md` con pasos concretos, señales esperadas y fallo. Actualiza `estado.md`, changelog, contrato del motor y páginas temáticas de tácticas, atributos/desarrollo, estados/aprendizaje, laboratorio, configuración, estadísticas y exportación que correspondan.

Documento técnico indexado `docs/tecnico/motor18.md`: problema, comportamiento, datos/tablas, puntos exactos de aplicación, presupuesto de efectos, funciones compartidas, compatibilidad, semillas SEM y límites. No copies el funcional entero en otro muro de texto. Conserva el original íntegro y documenta esta ampliación con enlaces y precedencia.

### 17.2 Qué amplía o reemplaza

Deja escrito expresamente:

- Se amplía el funcional con conocimiento persistente de posiciones, roles y sistemas, y rasgos/datos de aprendizaje de jugador y entrenador.
- Las 32 capacidades no cambian. El conocimiento afecta a coordinación mediante las operaciones limitadas de §6; Polivalencia/teaching actúan entre partidos.
- Posición nominal sigue sin filtrar elegibilidad. Ahora la posición realmente asignada sí puede tener una familiaridad distinta.
- La ejecución de roles y tácticas incorpora preparación aprendida; sus prioridades, estilos, compatibilidades y reglas actuales continúan.
- El dominio colectivo se aproxima con conocimientos individuales, sin química por parejas/quintetos.
- Desuso y reaprendizaje son reglas de producto SEM; la edad y las capacidades actuales no se sustituyen por experiencia abstracta.
- Se corrige la sensibilidad parcial de MOTOR-17B y se conserva su evidencia histórica, identificando los resultados regenerados.
- AUD11 separa alternativas acreditadas de discrepancias sin explicar; no se alteran defensas para eliminar avisos.
- No se cierra por esta entrega la aceptación manual, calibración general, conformidad FIBA integral o rendimiento masivo del mundo.

Contexto de las decisiones: la investigación previa consultó los manuales WABC de nivel 2/3 y estudios de familiaridad, enseñanza y retención. No se extrajo de ellos ninguna tasa numérica universal. No dediques la sesión a resolver descargas FIBA bloqueadas ni atribuyas a una fuente la curva SEM18 de este prompt.

### 17.3 Mensaje final obligatorio

Comunica de forma factual y breve:

1. Rama, PR, base y dependencia de MOTOR-17B, sin afirmar una fusión inexistente.
2. Qué puede probar Dennis y dónde está el recorrido manual.
3. Los dos puntos reales donde se aplica familiaridad y cómo evitas duplicarla.
4. Qué aprendió cada contraste L18; si una comparación B tuvo poca exposición, decirlo.
5. Resultado real de las correcciones de sensibilidad/AUD11 y límites restantes del auditor.
6. Recuento de encuentros planificados, ejecutados, válidos, fallidos, reintentos y extras de tests/navegador.
7. Pruebas finales, datos, documentación, navegador y descargas efectivamente ejecutados; lo pendiente y no ejecutado por separado.
8. Cambios de referencia explicados por nueva familiaridad, y preservación de la referencia neutral, sin objetivos de marcador.
9. Coste medido y límites de la muestra, sin declarar resuelto el rendimiento del mundo.
10. Nombres, tamaños y ubicación de los paquetes; adjunta los archivos disponibles que se piden. Indica que `out/` no se versiona y cómo descargarlos antes de perder el entorno.

No hagas aceptación deportiva en nombre de Dennis o ChatGPT, no recalibres después de la campaña ni declares «motor terminado y validado» porque la suite pase. Entrega una implementación concreta, comprobable y documentada, manteniendo la simplicidad del motor por acontecimientos.
