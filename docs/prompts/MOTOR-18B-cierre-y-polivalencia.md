# MOTOR-18B · Cierre de familiaridad y mayor diferencia de Polivalencia

**Destinatario:** Claude Code.  
**Proyecto autorizado:** `bateman37/beM`, exclusivamente.  
**Fecha del encargo:** 22 de octubre de 2026.  
**Objetivo:** implementar las correcciones aceptadas de la revisión de MOTOR-18, reforzar el efecto de Polivalencia sobre el aprendizaje y entregar una auditoría final breve y verificable.

Este documento es un **encargo de implementación**. Ejecuta el trabajo completo, actualiza documentación, prueba lo necesario y entrega los archivos de cierre. Las decisiones funcionales están fijadas aquí. Las decisiones técnicas locales deben respetarlas.

## Índice

1. [Resultado esperado y alcance](#1-resultado-esperado-y-alcance)
2. [Base, Git y lectura dirigida](#2-base-git-y-lectura-dirigida)
3. [Decisión nueva: curva de Polivalencia](#3-decisión-nueva-curva-de-polivalencia)
4. [R01: preparación y copia activa](#4-r01-preparación-y-copia-activa)
5. [R02: participantes reales y bloqueadores](#5-r02-participantes-reales-y-bloqueadores)
6. [R03: sesiones después de recargar](#6-r03-sesiones-después-de-recargar)
7. [R04 y R05: entradas de aprendizaje válidas](#7-r04-y-r05-entradas-de-aprendizaje-válidas)
8. [R06: estimación y resolución coherentes](#8-r06-estimación-y-resolución-coherentes)
9. [Unidades, información y administración](#9-unidades-información-y-administración)
10. [Versiones, perfiles y continuidad](#10-versiones-perfiles-y-continuidad)
11. [Comprobaciones puras y regresiones](#11-comprobaciones-puras-y-regresiones)
12. [Auditoría final de 36 ejecuciones](#12-auditoría-final-de-36-ejecuciones)
13. [Paquetes que debes devolver](#13-paquetes-que-debes-devolver)
14. [Documentación y recorrido manual](#14-documentación-y-recorrido-manual)
15. [Criterios de cierre y mensaje final](#15-criterios-de-cierre-y-mensaje-final)

## 1. Resultado esperado y alcance

Al terminar, Dennis debe poder:

- Preparar un partido con una copia de aprendizaje y comprobar que defensa, roles, posiciones, estilos, libro y semilla que ha editado son los que recibe el encuentro.
- Ver que el conocimiento del bloqueador influye cuando realmente participa en la interacción y que recibe la exposición correspondiente.
- Entrenar, recargar la página y volver a entrenar sin colisiones de identidad ni reinicios del presupuesto diario.
- Aplicar aprendizaje únicamente desde una sesión válida o un encuentro terminado, conservando la idempotencia y el deshacer exacto.
- Distinguir claramente a un jugador de Polivalencia 8, que aprende despacio, de uno con 24, que aprende muy rápido.
- Recibir los ZIP de una auditoría final acotada para que ChatGPT revise los resultados.

### 1.1 Decisiones que permanecen

1. El motor resuelve acontecimientos y posesiones. Mantén su flujo y sus operaciones compartidas.
2. Las capacidades deportivas siguen siendo **32**. Polivalencia permanece como rasgo de desarrollo, separado del conocimiento adquirido y de las recetas deportivas.
3. El conocimiento se mantiene congelado durante el partido. La exposición se agrega; el aprendizaje se propone después y se aplica explícitamente.
4. Conserva los 62 conocimientos y los 30 módulos de MOTOR-18. Se mantienen transferencias, presupuestos, retención, máximos históricos, reaprendizaje y categorías.
5. Familiaridad sigue entrando una vez por operación en calidad y avance presionado. Conserva los máximos de 0,30 logit por lado y los pesos actuales de posición/rol/táctica.
6. Polivalencia y enseñanza no conceden una bonificación inmediata al partido. Con las mismas capacidades, conocimiento, órdenes y semilla, cambiar solo Polivalencia debe conservar el deporte.
7. Las filas numéricas viven en perfiles administrables y versionados. No escondas esta nueva curva en constantes del código.
8. Las referencias y los históricos se conservan; los cambios del usuario se realizan sobre copias identificadas.

### 1.2 Entrega acotada

Esta entrega cubre las seis observaciones M18-R01…R06 y la nueva curva de Polivalencia. Incluye la pequeña corrección del diccionario de unidades.

Conserva las tasas de aprendizaje y los factores de enseñanza, competencia del entrenador y transferencia. Conserva reglamento, asistencias, robos, energía, Forma, momentos, memoria defensiva y repertorio deportivo.

El rendimiento masivo del mundo y los partidos simultáneos se trabajarán por separado. En esta entrega registra el coste observado de los casos ejecutados; la campaña de cierre no es un benchmark de cien partidos.

## 2. Base, Git y lectura dirigida

### 2.1 Comprueba antes de editar

- Lee las normas vigentes del repositorio, sus índices y el estado de entregas.
- Identifica el estado real de `main`, la rama de trabajo y la PR de MOTOR-18. En el informe recibido, MOTOR-18 estaba en `claude/busy-edison-b1fmnc`, PR #19, abierta y sin fusionar. **Comprueba su estado actual; no lo supongas.**
- Si MOTOR-18 sigue sin fusionar, desarrolla 18B encima de su implementación y actualiza esa misma PR como unidad MOTOR-18 + MOTOR-18B. No abras una PR que aparente ser independiente de una base aún no integrada.
- Si MOTOR-18 ya está fusionado, inicia 18B desde `main` actualizado en una rama de trabajo apropiada.
- Conserva los cambios existentes del usuario y los ZIP históricos. No utilices reinicios destructivos ni fuerces una actualización de rama que pueda perder trabajo.
- Al terminar sube los commits y deja la PR abierta contra `main`, sin fusionar ni suscribirte.

Identifica en el historial las correcciones funcionales, la curva/datos y la evidencia/documentación. No es necesario un commit por cada prueba.

### 2.2 Lectura mínima suficiente

Lee por índices y por los módulos implicados:

- Prompt archivado y documentación técnica de MOTOR-18.
- Documentación temática de familiaridad, aprendizaje, laboratorio, perfiles y contratos del motor.
- Si se adjunta, `beM-MOTOR-18-REVISION-INDEPENDIENTE.md`.
- `src/lab/prep.js`, `store.js`, `knowledge-ui.js`, `learning-ui.js`, `learning-model.js`.
- `src/match/familiarity.js`, `plays.js`, las llamadas a calidad y sus estimaciones.
- `src/knowledge`, `src/learning`, las filas/validaciones de MOTOR-18 y los productores de exposición.
- Scripts de la campaña, empaquetado y verificación de MOTOR-18.

El presente prompt contiene los hallazgos, ejemplos y decisiones necesarios aunque el informe independiente no esté en el repositorio.

**No abras ni consultes otros repositorios**, incluidos `v-apps`, BeManager o basket-manager. No hace falta investigación externa de baloncesto para ejecutar este cierre.

### 2.3 Conservación del control

Antes de editar congela:

- Commit de implementación MOTOR-18 y estado de Git.
- Perfiles efectivos P0/P1, entradas y semillas de la campaña anterior.
- Manifiestos y huellas de los paquetes MOTOR-18 disponibles.
- Cálculos L18 y resultados anteriores, como histórico de solo lectura.

No reescribas esos archivos para que parezcan producidos por 18B. Si el entorno ha perdido `out/`, declara qué falta; puedes reconstruir el control necesario con su código y perfiles originales, identificando las nuevas ejecuciones como reconstrucciones.

## 3. Decisión nueva: curva de Polivalencia

### 3.1 Problema y comportamiento fijado

MOTOR-18 utiliza:

```text
n(P) = (P - 1) / 29
fJugador = 0,75 + 0,50 * n(P)
```

Con P=8 el factor es 0,8706896552; con P=24 es 1,1465517241. Su cociente es aproximadamente 1,32, insuficiente para la diferencia funcional que quiere Dennis.

**Sustituye ese factor en la nueva base 18B por una curva lineal por tramos, continua, definida mediante cinco anclajes administrables:**

| Polivalencia | Factor sobre la dosis eficaz de aprendizaje | Lectura orientativa |
|---:|---:|---|
| 1 | 0,25 | Aprende muy despacio |
| 8 | 0,50 | Le cuesta aprender responsabilidades nuevas |
| 16 | 1,00 | Referencia de aprendizaje |
| 24 | 2,00 | Aprende muy rápido |
| 30 | 2,50 | Facilidad excepcional |

Estas lecturas explican las semillas; no son bandas discretas de funcionamiento. Todos los valores intermedios tienen efecto continuo.

Entre dos anclajes consecutivos `(Pa, Fa)` y `(Pb, Fb)`:

```text
fJugador(P) = Fa + (Fb - Fa) * (P - Pa) / (Pb - Pa)
```

En los extremos devuelve exactamente el factor del extremo. Un valor de entrada fuera de 1–30, ausente cuando es obligatorio o no finito es un error localizado; no lo conviertas silenciosamente en 16.

El jugador de 24 tiene **cuatro veces el factor de aprendizaje** del jugador de 8 con la misma dosis y los demás factores constantes. Eso no significa multiplicar por cuatro su nivel actual ni la ganancia absoluta en todos los niveles: la proximidad a 30 y los tramos de reaprendizaje siguen actuando.

### 3.2 Fórmula que se conserva

```text
fEnseñanza = 0,75 + 0,50 * n(teaching)
fContenido = 0,75 + 0,50 * n(competenciaDelEntrenadorEnModulo)
              // para posiciones y roles: 1
fTransferencia = 1 + 0,50 * max(n(K_relacionado))
              // sin relacionados: 1

G = tasaDominio * dosis * fJugador * fEnseñanza * fContenido * fTransferencia
K_nuevo = 30 - (30 - K) * exp(-G / 29)
```

Conserva tasas 0,40 para posición/roles y 0,80 para tácticas; las semillas ya son administrables. Conserva reaprendizaje ×2 solo hasta `peak`, la resolución cerrada de sus tramos y el ajuste a 30 al alcanzar 29,95.

El factor nuevo actúa en **posiciones, roles ofensivos, roles defensivos y módulos tácticos**, tanto en dosis válidas de entrenamiento como de partido. Utiliza la misma función pura en todos los consumidores de aprendizaje.

**No** cambia el ritmo de olvido, el suelo de retención, los periodos de gracia, el techo 30, los umbrales de práctica relevante ni los presupuestos diarios. El 30 histórico y 3.650 días sin practicar posición debe seguir dando 26,4.

### 3.3 Administración y compatibilidad

Representación funcional exigida para la nueva curva, adaptando solo la integración técnica necesaria:

```json
{
  "kind": "piecewise-linear",
  "points": [
    { "level": 1, "factor": 0.25 },
    { "level": 8, "factor": 0.50 },
    { "level": 16, "factor": 1.00 },
    { "level": 24, "factor": 2.00 },
    { "level": 30, "factor": 2.50 }
  ]
}
```

Ubícala en `familiarity.learning.factors.player`, con filas visibles de referencia para niveles y filas editables para los multiplicadores. La curva efectiva, su tipo y sus valores deben figurar en la identidad/huella del perfil y en los recibos de aprendizaje.

Valida orden estricto de niveles, extremos de escala, presencia de los anclajes previstos, factores finitos positivos y no decrecientes. Los valores nuevos de la base son exactamente los de esta tabla. Una candidata editada conserva sus diferencias y pasa la misma validación; no puede saltarse la política de activación explícita de perfiles.

Conserva la lectura de los perfiles MOTOR-18 que guardan `{base, slope}`: su factor sigue siendo el lineal antiguo. No los conviertas automáticamente en la curva nueva ni cambies retroactivamente sus recibos. La nueva base 18B aporta la curva por una extensión versionada, sin modificar los archivos SEM18 históricos.

La interfaz debe mostrar qué modelo utiliza el perfil activo. Si sigue activo un perfil anterior, explícalo y ofrece activar la base 18B o una candidata explícita, siguiendo el patrón existente.

El panel solo presenta como controles efectivos los del modelo activo: anclajes para la curva nueva; base/pendiente para la antigua. Los parámetros históricos que ya no consuman los perfiles nuevos se identifican como históricos o no aplicables; no dejes dos juegos de mandos que aparenten actuar a la vez sobre el mismo factor.

La normalidad P=16 pasa de 1,0086206897 a **1 exacto** en la nueva base. Es parte de esta decisión de producto. No compenses esa pequeña diferencia retocando tasas u otros factores.

### 3.4 Casos numéricos obligatorios

Escenario de referencia equivalente a L18-01:

- Objetivo: `tactic:ORG02`.
- K=12 y peak=12.
- Dosis efectiva al objetivo: **1 hora equivalente**. No confundirla con una sesión total de una hora repartida 60/40.
- Teaching=16 y competencia del entrenador en ORG02=16.
- Todos los conocimientos relacionados pertinentes en 12; transferencia `1 + 0,5 * 11/29`.
- Tasa táctica 0,80; sin reaprendizaje ni saturación.

| P | Factor anterior | Factor nuevo | K final anterior | K final nuevo |
|---:|---:|---:|---:|---:|
| 1 | 0,7500000000 | 0,25 | 12,4451195113 | 12,1496132881 |
| 8 | 0,8706896552 | 0,50 | 12,5157125829 | 12,2979830131 |
| 12 | 0,9396551724 | 0,75 | 12,5559239538 | 12,4451195113 |
| 16 | 1,0086206897 | 1,00 | 12,5960428442 | 12,5910330331 |
| 20 | 1,0775862069 | 1,50 | 12,6360694669 | 12,8792317238 |
| 24 | 1,1465517241 | 2,00 | 12,6760040341 | 13,1626593971 |
| 30 | 1,2500000000 | 2,50 | 12,7357337437 | 13,4413950352 |

Comprueba con tolerancia numérica, no por comparación de cadenas redondeadas. El cociente de las ganancias P24/P8 de este ejemplo es aproximadamente **3,901764**, coherente con un cociente 4 en G.

Añade una lectura pura de dosis necesaria para un mismo objetivo, sin convertirla en calendario ni simular días. Con los mismos factores constantes, de K12 a K18:

| P | Dosis efectiva necesaria aproximada |
|---:|---:|
| 8 | 24,289281 h-eq |
| 16 | 12,144640 h-eq |
| 24 | 6,072320 h-eq |

Es una comparación controlada de producto; no una promesa de días de entrenamiento real, porque el reparto de dosis, los relacionados y otros factores pueden variar.

Estos valores son semillas SEM autorizadas para implementar. La evidencia final debe permitir revisarlas después; no las describas como calibración empírica.

## 4. R01: preparación y copia activa

### 4.1 Defecto aceptado

La revisión independiente reprodujo:

| Campo | Lo editado en Preparación | Lo que recibía el partido |
|---|---|---|
| Defensa EQ01 | ORG02 | ORG01 |
| Rol ofensivo del primer jugador EQ01 | O01 | O12 |

`renderPrep` operaba sobre `store.edit`; `matchSource()` priorizaba `store.scenario.input`, que conservaba otra copia. El resumen mezclaba el plan editable con jugadores de la copia.

### 4.2 Decisión funcional cerrada

**Cuando la copia de aprendizaje sea la entrada activa del próximo partido, Preparación debe editar esa copia.**

- Centraliza el acceso a la entrada que se prepara, siguiendo el modelo de fuente activa del repositorio.
- Selectores, validación, compatibilidad del libro, resumen de familiaridad y congelación del encuentro deben consultar la misma entrada.
- Incluye semilla, quinteto/puestos, director, disposiciones, estilos, roles ofensivos y defensivos, defensa, presión, coberturas, libros y las órdenes iniciales que ya se editan desde Preparación.
- Los controles mantienen su comportamiento actual dentro de esa entrada; no crees un segundo editor táctico para el aprendizaje.
- Señala la copia que se está editando y la que se usará al preparar el encuentro.
- Las fichas y planes de referencia permanecen intactos.
- Cambiar defensa, posición o rol **no actualiza** el conocimiento por sí solo. Debe verse la familiaridad que ya tiene el jugador con lo nuevo que se le pide.
- Los conocimientos editados, aprendizaje aplicado, rasgos y datos del entrenador de la copia siguen presentes al cambiar de pestaña, persistir y recargar.
- Un partido ya iniciado conserva su entrada congelada; los cambios posteriores corresponden al próximo partido.

La referencia deportiva editable anterior y los escenarios de contraste distintos de aprendizaje conservan su significado vigente. Esta corrección debe identificar de forma fiable el tipo de escenario: en la implementación recibida, el indicador `learning` estaba dentro de `store.scenario.scenario`. Revisa sus consumidores; no bases la selección de fuente en una propiedad inexistente del nivel superior.

Comprueba también los roles usados por el resumen: no muestres el plan de la copia combinado con roles de otra entrada.

### 4.3 Aceptación

La evidencia debe conservar valores editados, fuente activa, entrada congelada y posiciones/roles/organización usados. Una captura del selector por sí sola no cierra R01.

## 5. R02: participantes reales y bloqueadores

### 5.1 Evidencia del defecto

Ejemplo histórico del diagnóstico `C-B02-K28`, lote `LOT-4566394b`, evento `E0386`:

- POS01, bloqueo directo, salida interior, sin continuación listada.
- Bloqueador registrado en el hecho: EQ01-J05.
- Familiaridad ofensiva: solo EQ01-J01.

La revisión encontró 35 eventos sin continuación listada, en los seis diagnósticos, con un bloqueador registrado y ausente de los participantes de familiaridad: 29 de bloqueo directo y 6 de indirectos. Utiliza este inventario como evidencia histórica; no impongas que un motor corregido produzca los mismos IDs o exactamente el mismo número de casos.

La causa observada es que `exitsFor` puede sustituir `offContact` de pantalla por el contacto de penetración del manejador. `famQualityContext` utilizaba ese campo para recuperar al bloqueador y lo perdía.

### 5.2 Corrección funcional

Conserva una referencia pequeña a los **participantes de la interacción elegida**, independiente del contacto usado para resolver penetración/falta:

- Manejador/poseedor y actor actuales.
- Pasador/director cuando realmente participa en esa interacción.
- Bloqueador o cortador efectivamente utilizado.
- Defensores comprometidos que ya utiliza esa resolución.

Puedes reutilizar referencias existentes o añadir el dato mínimo en la ejecución. No selecciones actores nuevos ni reconstruyas movimientos. No sumes indiscriminadamente todos los roles de la ficha original a todas las continuaciones posteriores.

Reglas de conservación:

1. Si la oportunidad se produce utilizando ese bloqueo, el bloqueador pertinente cuenta aunque el contacto final sea una penetración de otro jugador.
2. Si una continuación inicia una interacción distinta donde el bloqueador anterior ya no participa, no lo arrastres por conservar `entry.roles` o una etiqueta de familia.
3. Deduplica al jugador que ocupa varias funciones.
4. Excluye ausentes y actores de opciones no elegidas; el sacador fuera de pista conserva la excepción pertinente de su saque.
5. Calidad y exposición consumen la **misma selección efectiva** de participantes y módulos.
6. Continúa acreditando un crédito por jugador–operación, repartido entre módulos mediante los pesos existentes. No añadas otra dosis por cada etiqueta de participación.
7. Una calidad heredada/determinista no vuelve a cobrar ajuste ni crédito de una operación que no se ha resuelto de nuevo.

Mantén las posiciones realmente asignadas y los roles vigentes en la frontera correspondiente. No introduzcas filtros por posición nominal.

### 5.3 Contraejemplo fijo obligatorio

Construye una salida pertinente al aro de POS01 donde:

- El manejador y el bloqueador sean distintos y participen realmente.
- Todos los conocimientos sean 30 salvo `FAM:pick_and_roll` del bloqueador, que es 1.
- Los módulos ofensivos sean disposición 0,40 y familia 0,60.
- Los componentes sigan en posición 0,20, rol 0,30 y táctica 0,50.
- La defensa sea neutral de conocimiento en esa comparación.

El manejador tiene D=1; el bloqueador D=0,70; el lado ofensivo D=0,85. Con máximo ofensivo 0,30, el ajuste es **−0,045 logit**, con tolerancia apropiada. La implementación anterior podía dar 0 al omitir al bloqueador.

Conserva el contraste con todos a 30: ajuste exactamente cero. Añade el caso complementario donde una continuación deja de utilizar al bloqueador anterior y este no recibe exposición de la nueva operación.

Esta es una corrección de conexión, no una autorización para aumentar el efecto máximo de familiaridad.

## 6. R03: sesiones después de recargar

### 6.1 Defecto aceptado

`learning-ui.js` inicializaba `S.seq=1`. Tras aplicar una sesión `...|EQ01|S1`, persistir y recargar, otra sesión recibía otra vez S1 y se rechazaba por fuente duplicada. El contador no avanzaba después del rechazo.

### 6.2 Decisión de implementación

Mantén un identificador secuencial persistido **por instancia de copia de aprendizaje**, independiente del contenido de una sesión:

- Persiste el siguiente número de sesión con la copia y su registro.
- Al recuperar una copia anterior que no lo conserve, deriva el siguiente número libre a partir de todos sus recibos de sesión, incluidos los revertidos. No reutilices números ya emitidos para una sesión nueva.
- Incluye en la fuente la identidad de la copia, instancia del equipo y secuencia de sesión.
- Previsualizar de nuevo la misma propuesta conserva la identidad de esa sesión pendiente; el número se consume al crear/aplicar una sesión según el ciclo elegido, sin generar colisiones tras recarga. La elección técnica no puede permitir dos sesiones distintas con la misma fuente.
- Una sesión nueva después de recargar obtiene una fuente nueva.
- Aplicar dos veces la misma fuente real sigue rechazándose.
- Deshacer conserva el recibo como revertido, restaura el estado y mantiene el comportamiento autorizado de reaplicar esa fuente revertida si el flujo lo permite; **una sesión nueva** obtiene otro número.
- Recargar o adoptar una nueva versión de parámetros no reinicia conocimiento, peak, reloj, presupuestos diarios ni historial de aplicaciones.

Utiliza las identidades persistentes de copias ya disponibles. Si la fábrica podía dar a dos instancias nuevas exactamente la misma identidad, añade una secuencia persistida de instancia de laboratorio para diferenciarlas, separada de las semillas deportivas. No utilices la semilla, el marcador, número de sorteos o número de eventos como identidad única de una sesión/partido.

Para el aprendizaje posterior a un partido conserva una identidad de encuentro estable al guardar, continuar, reabrir o exportar, junto con instancia del equipo. Así, el mismo encuentro sigue siendo una sola fuente y dos encuentros distintos no colisionan aunque produzcan el mismo resultado.

La persistencia de estas identidades es administración; no consume azar deportivo ni modifica trayectorias.

## 7. R04 y R05: entradas de aprendizaje válidas

### 7.1 Exposición de encuentro terminado

La fachada `Encounter.exposure()` ya marcaba `complete: false` en encuentros parciales. Sin embargo, `proposeFromMatch` no lo verificaba y aceptaba una propuesta aplicable desde diez minutos de un partido sin terminar.

**Contrato cerrado:** el aprendizaje normal de partido exige `complete === true`, fuente global no vacía y datos de exposición válidos. `false`, ausencia del indicador, error técnico o contradicción con un estado declarado no terminado se rechazan con causa localizada.

- Usa un productor común para obtener una exposición terminada desde la fachada y desde un resultado final válido del laboratorio.
- La exposición parcial puede consultarse como parcial; no se transforma automáticamente en experiencia aplicable.
- Los resultados históricos completos pueden pasar por un adaptador explícito que compruebe su estado antes de construir la exposición; el adaptador no fabrica finalización cuando faltan datos.
- Los fixtures de pruebas puras deben llevar explícitamente su condición de completos. No crees una opción pública que anule esta validación.
- `postMatchLearningCard`, campaña, propuesta exportada y fachada usan el contrato corregido.

### 7.2 Validación de sesiones

Antes de avanzar el reloj o generar una propuesta:

- `source_id`: cadena válida no vacía.
- Horas: número finito dentro del rango permitido de sesión.
- Reparto colectivo e individual: ambos números finitos dentro de [0,1], suma 1 con tolerancia documentada.
- Días: entero dentro del intervalo permitido.
- Jugadores y focos: identificadores válidos de la instancia y el catálogo correspondiente.

Casos que ahora deben rechazarse:

| Entrada | Comportamiento anterior observado |
|---|---|
| 4 h; colectivo 2, individual −1 | Aceptaba 8 h-eq de táctica consumiendo solo 4 h del presupuesto |
| Reparto con valores no finitos | Podía consumir horas sin producir dosis válida |
| Partido con `complete: false` | Generaba y aplicaba aprendizaje |

Valida también los números que se consumen de exposición: tiempos y créditos finitos no negativos, IDs reconocibles, coherencia de posiciones/roles con tiempo vivo según el contrato existente y presupuesto total por dominio. Un bloque de exposición puede contener ambos equipos; filtra por la instancia pertinente sin confundir al rival legítimo con un jugador del equipo propio.

La propuesta y sus recibos conservan los límites diarios existentes: cuatro horas acumuladas de entrenamiento y una dosis de partido por jugador/dominio/día, con presupuestos separados. Prórroga, reabrir o descargar no los multiplica.

### 7.3 Atomicidad y parámetros efectivos

Un rechazo no cambia conocimiento, peak, reloj, presupuesto, fuente aplicada ni registro. Devuelve errores legibles y localizados; no conviertas una entrada inválida en dosis cero con éxito aparente.

La previsualización queda vinculada al estado previo y a la versión/huella de los parámetros efectivos usados, incluida la curva de Polivalencia. Si cambian antes de aplicar, invalida la propuesta y exige una nueva vista previa. Conserva el control de idempotencia por fuente.

Adopta la versión de aprendizaje nueva sin reconstruir el equipo desde cero ni borrar sus acumuladores. Una conversión técnica necesaria de metadatos conserva sus datos y queda documentada; el uso de la curva nueva depende del perfil que el usuario haya activado.

## 8. R06: estimación y resolución coherentes

### 8.1 Hallazgo y límite deportivo

La revisión observó un candidato POS01 cuya estimación utilizaba un defensor y ORG03 con peso 1. Tras preparar la cobertura COB01, la operación real utilizaba dos defensores y ORG03/COB01 con pesos 0,70/0,30.

En un cálculo fijo con desconocimiento de COB01, esa diferencia de contexto modificaba el ajuste en 0,045 logit. Compartir la misma fórmula no basta si las entradas pertinentes se pierden.

**No se exige adivinar decisiones futuras.** Una cobertura que todavía requiere una decisión o sorteo no puede ejecutarse por anticipado para conocerla. Tampoco se autoriza entregar al decisor información privada nueva del rival.

### 8.2 Decisión cerrada: contexto conocido frente a resuelto

Reutiliza un constructor pequeño y puro para los componentes compartidos y distingue expresamente:

| Situación | Regla |
|---|---|
| Interacción resuelta con cobertura y participantes ya determinados | Usa los datos reales de esa operación |
| Candidato con esos mismos datos ya determinados y disponibles | Mismo contexto conocido, misma función y mismo ajuste de familiaridad |
| Candidato con cobertura/participantes todavía no determinados | Usa los componentes pertinentes conocidos; registra el alcance limitado y qué falta por resolver |
| Referencia de otra opción o de una interacción anterior | No se reutiliza como cobertura/participantes de la opción candidata |

Si omites un componente por no estar determinado, aplica la normalización de componentes pertinentes que ya existe. No añadas una probabilidad de cobertura ni otro coeficiente de compensación inventado en esta entrega.

Las estimaciones de media distancia/calidad cómoda deben utilizar este contrato. Permanece la diferencia legítima entre una estimación previa y una oportunidad que después recibe ayudas, una decisión distinta o una continuación.

**Invariantes:** estimar no cambia cobertura vigente, memoria, órdenes, participantes seleccionados, relojes, contador de sorteos ni exposición. Construir una opción candidata no puede preparar de verdad la respuesta rival.

Una lectura diagnóstica conserva razón de omisión y procedencia de datos. La interfaz de jugador mantiene una explicación breve; no expone listas de cálculos internos o probabilidades privadas.

## 9. Unidades, información y administración

### 9.1 Unidades

El diccionario de MOTOR-18 describía `min_tenths` como «décimas de minuto» aunque los datos corresponden a **décimas de segundo de juego vivo**:

```text
600 décimas de segundo = 1 minuto
24.000 décimas de segundo = 40 minutos
```

Corrige etiquetas y documentación de exportación. Mantén la aritmética correcta y el nombre histórico del campo si cambiarlo obligara a alterar lectores innecesariamente. Si se ofrece una columna derivada en minutos, identifícala como derivada y conserva la magnitud original.

Los créditos tácticos son participaciones ponderadas por operación; las dosis son horas equivalentes. No mezcles las tres unidades.

### 9.2 Información y exposición

- Propio: conocimiento y aprendizaje autorizados del propio equipo.
- Público/rival: hechos observables; sin niveles exactos de conocimiento, Polivalencia, enseñanza ni probabilidades privadas.
- Diagnóstico: cálculos completos identificados como diagnóstico.

Conserva las audiencias en vistas y exportaciones. La trazabilidad adicional no crea hechos deportivos ni aumenta los sorteos.

En particular, **9 créditos de B02 no equivalen a nueve posesiones**. La revisión del diagnóstico anterior encontró nueve operaciones que consumían `pick_and_roll`, con quince participaciones de actor y peso de familia 0,60: 15 × 0,60 = 9. Cuatro operaciones adicionales de hechos con origen de bloqueo directo consumían continuidad. Después de R02 los recuentos pueden cambiar: informa sus nuevos numeradores y denominadores.

### 9.3 Panel de parámetros

La nueva curva debe quedar localizable en Familiaridad y aprendizaje, con:

- Anclajes, factores, unidad, modelo y perfil efectivo.
- Vista de comparación P8/P16/P24 y explicación de aprendizaje, separada del efecto deportivo del conocimiento.
- Diferencias visibles al crear una candidata.
- Validación de curva y desactivación/compatibilidad según el perfil que realmente esté activo.

Reutiliza las capacidades del panel actual; no construyas otro panel de administración.

## 10. Versiones, perfiles y continuidad

Identidades de esta entrega:

| Elemento | Identidad |
|---|---|
| Aplicación | MOTOR-18B |
| Motor | `beM-motor-0.18.1-MOTOR18B` |
| Extensión de parámetros nueva | `SEM-MOTOR18B-20261022` |
| Conocimiento, misma estructura de 62 niveles | `KNOW-MOTOR18-R1` |
| Aprendizaje | `LEARN-MOTOR18B-R1` |
| Familiaridad y selección de participantes | `FAM-MOTOR18B-R1` |
| Estudio de cierre | `MOTOR18B-CIERRE-20261022` |

Conserva `beM-match-input/7` y `beM-match-export/10` si sus estructuras siguen siendo compatibles; la versión del motor distingue la reproducción. Un export MOTOR-18 puede consultarse históricamente, pero no se reproduce como si lo hubiera producido MOTOR-18B. Explica la diferencia de motor y preserva el archivo.

Los cambios aditivos de metadatos, exposición y persistencia deben estar documentados e identificados en sus contratos. Si un formato requiere realmente una versión nueva para evitar una lectura errónea, justifica la necesidad concreta y mantiene un lector histórico; no cambies versiones por cada etiqueta de presentación.

Actualiza la identidad del esencial y la proyección cuando cambie su semántica, conservando lectores del histórico. Mantén acta y reglas deportivas heredadas; no cambies su política por el cierre de conocimiento.

Las nuevas filas y datos se añaden mediante la extensión 18B. Perfiles activos anteriores no se sustituyen automáticamente. Las mismas capacidades y conocimientos iniciales se conservan al adoptar la base nueva; no reinicialices una historia de aprendizaje para activar una curva.

Un guardado de MOTOR-18 no se continúa silenciosamente con otro motor. Los guardados nuevos de 18B conservan sus entradas, parámetros, acumuladores, participantes de interacción pendientes y fuentes necesarias para una continuación exacta.

## 11. Comprobaciones puras y regresiones

### 11.1 Política de pruebas

**Pruebas automáticas justas y útiles. Dennis realizará muchas pruebas manuales.** Añade regresiones agrupadas por propiedad y parametrizadas donde tenga sentido. No generes una prueba por cada fila de la tabla ni una campaña de cientos de partidos.

Durante implementación ejecuta las comprobaciones pertinentes. Ejecuta la suite completa sobre el código final, más `data:check` y la comprobación documental tras los últimos cambios. Repite una comprobación si ha habido cambios relevantes posteriores o un fallo que lo justifique.

Una regresión de defecto debe fallar con el caso anterior y pasar con la corrección. No actualices una expectativa deportiva para ocultar una diferencia sin explicarla.

### 11.2 Tabla L18B, sin partidos nuevos

Conserva la tabla L18 histórica y genera una L18B con entradas, salidas, factores y tolerancias. Cubre estas propiedades; agrúpalas en pocas pruebas:

| Caso | Propiedad comprobada |
|---|---|
| L18B-01 | Los cinco anclajes son exactos; P12=0,75 y P20=1,50; continuidad y monotonía en la escala |
| L18B-02 | Ejemplo de ORG02 de §3.4, antes/nuevo, con los siete valores de P y cociente G24/G8=4 |
| L18B-03 | Dosis a un objetivo común: P8 necesita cuatro veces la dosis de P24 con factores constantes |
| L18B-04 | El factor se consume igual en los cuatro dominios y en fuentes de sesión/partido; no se altera ninguna capacidad deportiva |
| L18B-05 | Reaprendizaje solo hasta peak y equivalencia de dividir dosis con factores constantes, incluida la curva nueva |
| L18B-06 | Posición 30, peak 30, 3.650 días sin práctica sigue en 26,4; Polivalencia no cambia desuso ni suelo |
| L18B-07 | Repartos inválidos, no finitos y fuentes vacías rechazados sin cambiar estado; presupuestos de entrenamiento/partido conservados |
| L18B-08 | Exposición incompleta rechazada; exposición completa válida produce propuesta; aplicar/repetir/deshacer respeta identidad y presupuesto |
| L18B-09 | Entrada efectiva de Preparación y entrada congelada coinciden; referencias intactas y conocimiento sin cambios por editar el plan |
| L18B-10 | Sesión nueva tras persistir/recuperar obtiene fuente nueva; repetir la misma fuente real se rechaza |
| L18B-11 | Bloqueador de §5.3 produce −0,045; todo a 30 produce 0; una continuación ajena no arrastra al participante anterior |
| L18B-12 | Estimación con contexto determinado coincide en familiaridad; contexto incompleto identificado; cero azar, exposición y mutaciones |

Compara factores, G y niveles con valores esperados de la fórmula, no únicamente contra otra llamada idéntica al mismo consumidor.

Revisa la documentación y los números de L18-02/03 que ahora se calculen con Polivalencia 16: la nueva referencia es 1 en lugar de 1,0086206897. El histórico permanece como histórico; las tablas nuevas declaran sus parámetros efectivos.

### 11.3 Cobertura de módulos y auditor heredado

Conserva las regresiones de sensibilidad con dependencias compartidas y la clasificación de AUD11. El contraejemplo FIS07 anterior debe seguir dando:

```text
base = 0,4144452772803625
parcial solo preparación = 0,4165557852725335
completo ataque + preparación = 0,4219287569484819
```

En los seis diagnósticos de MOTOR-18 no se observaron ORG04, ORG05, ORG06, COB04, DIS03, DIS04, DIS05 y DIS06. Comprueba sus correspondencias mediante casos de contexto fijos, sin forzar su aparición en partidos ni afirmar que esos casos equivalen a exposición natural. No exijas que las 32 auditorías se vuelvan conformes.

## 12. Auditoría final de 36 ejecuciones

### 12.1 Agenda y perfiles

Reutiliza la estructura de campaña de MOTOR-18 y congela la agenda de 18B antes de simular. No reconstruyas de memoria planes o plantillas si existen sus entradas congeladas.

- **P0:** base efectiva heredada, con la extensión 18B en la versión nueva, sin aceptar C17-02 por este encargo.
- **P1:** P0 con la candidata C17-02 ya utilizada en los contrastes; gasto por minuto vivo 3,5, todavía provisional. No es una aceptación deportiva de esa candidata.
- CONTROL17B utiliza su motor y perfiles originales; la adaptación neutral de contratos solo cambia los bloques nuevos/metadatos necesarios. No le pases parámetros que su versión no admite.
- En las entradas 18B se conserva el conocimiento inicial de cada caso. La curva nueva no aprende automáticamente entre encuentros.

El total es **36 ejecuciones planificadas**: A12 + B16 + C6 + D2. No son 36 observaciones independientes. No repitas las campañas masivas MOTOR-16/17.

### 12.2 A · seis pares neutrales, 12 ejecuciones

Cada caso se ejecuta con CONTROL17B y MOTOR-18B. Registro esencial.

| Caso | Equipos y plan | Perfil | Semilla | Neutralidad en 18B |
|---|---|---|---:|---|
| A01 | EQ01–EQ02, planes históricos | P0 | 20261016 | Legacy-neutral |
| A02 | EQ03–EQ09, planes naturales | P1 | 382000002 | Todos los conocimientos 30 |
| A03 | EQ07–EQ08, planes naturales | P1 | 382000003 | Todos 30 |
| A04 | EQ11–EQ12, planes naturales | P1 | 382000004 | Todos 30 |
| A05 | Dos instancias de EQ01, IDs distintos | P1 | 382000005 | Legacy-neutral |
| A06 | EQ01–EQ11; ORG06 con objetivos principal/alternativo fuera de pista, fallback ORG02 | P1 | 382000006 | Todos 30 |

A06 conserva los objetivos del caso previo: EQ11-J02 y EQ11-J05 no disponibles; no inventes otro escenario para conseguir un resultado esperado.

Compara el deporte completo: marcador, parciales, relojes, hechos y orden, participantes, quintetos, sorteos, acta, órdenes y estados. Los bloques de conocimiento/versión nuevos se comparan por su semántica; no elimines componentes deportivos para fabricar igualdad de huellas.

La referencia A01 observada con CONTROL17B y P0 era 83–98 con 6.684 sorteos. Es una regresión conocida de esa entrada, no un marcador objetivo para calibrar otros encuentros.

### 12.3 B · ocho contrastes, 16 ejecuciones esenciales

Todas son MOTOR-18B con P1. Dos variantes K8/K28; solo cambia el conocimiento indicado. Todos los demás conocimientos en 30. Polivalencia/entrenador iguales entre ambas variantes. Misma semilla y entradas deportivas.

| Caso | Condición fija | Conocimiento K8/K28 | Semilla |
|---|---|---|---:|
| B01 | EQ01–EQ02; EQ02 usa ORG02 | ORG02 de los jugadores EQ02 | 383000001 |
| B02 | EQ01–EQ02; EQ01 mantiene POS01 como prioridad 1 y alternativas de su libro natural | `FAM:pick_and_roll` de EQ01 | 383000002 |
| B03 | EQ01–EQ02; EQ01-J01 tiene asignado O01 | O01 de EQ01-J01 | 383000003 |
| B04 | EQ01–EQ02; intercambio PG/C de EQ01-J01/J10, rotación manual fija EQ01 | PG de EQ01-J10 | 383000004 |
| B05 | EQ01–EQ02; EQ02 utiliza COB02 y D06 para sus jugadores | D06 de EQ02 | 383000005 |
| B06 | EQ01–EQ02; EQ02 presiona a pista completa | PRESS de EQ02 | 383000006 |
| B07 | EQ01–EQ02; libros actuales de saques | `SAQ:O:band` de EQ01 | 383000007 |
| B08 | EQ01–EQ02; respuestas actuales de saques | `SAQ:D:endline` de EQ02 | 383000008 |

Conserva los niveles/peaks/días coherentes de la campaña anterior y la rotación fija identificada como extremo del laboratorio en B04. No restrinjas por posición nominal ni agregues cuotas para exponer una ficha.

Compara también estos resultados con los históricos MOTOR-18 disponibles: las correcciones de participantes/estimaciones pueden cambiar probabilidades y trayectoria. **La curva de Polivalencia por sí sola no debe cambiar ninguno de esos partidos con conocimiento inicial fijo.** Separa en la explicación el efecto de una corrección deportiva del cambio de aprendizaje posterior.

### 12.4 C · seis repeticiones diagnósticas

Repite exactamente B01-K8, B02-K28, B03-K8, B04-K8, B06-K8 y B08-K28 con registro diagnóstico. Coinciden con su esencial de 18B en deporte y exposición final.

Desde esos registros:

- Ejecuta AUD01–32 y conserva su estado real.
- Regenera la sensibilidad de las 32 capacidades y la sensibilidad de conocimiento, separadas.
- Localiza la participación y crédito corregidos del bloqueador y ejemplos de continuidad donde deja de ser pertinente.
- Explica exposición insuficiente y componentes no observados. Un contador a cero con denominador insuficiente no significa mecanismo inexistente.

### 12.5 D · dos comprobaciones

- **D01:** B01-K8 con Polivalencia de todos los jugadores EQ02 cambiada de 16 a 30. Mismo conocimiento, planes y semilla. Conserva el partido y la exposición. Compara las propuestas posteriores con la curva nueva, contabilizando las diferencias reales de dosis eficaz y nivel aprendido; es correcto que cambien las huellas de entrada.
- **D02:** B02-K28, guardar en la primera frontera de periodo, restaurar y terminar. Coinciden deporte y exposición con B02-K28. Aplicar después una propuesta desde ese resultado completo no duplica experiencia previa al guardado.

### 12.6 Disciplina de campaña

Congela código, perfiles y agenda antes de la ejecución. No ajustes anclajes, coeficientes o semillas mirando los marcadores. Si corriges un defecto que invalida la campaña, conserva la evidencia anterior e identifica qué ejecuciones deben repetirse y por qué.

Declara por separado encuentros adicionales de suite, navegador, depuración, controles reconstruidos y repeticiones técnicas. Si algún encuentro de un recorrido puede reutilizar un resultado ya producido, hazlo; no lo presentes como encuentro nuevo.

Registra tiempos y bytes de estos casos con entorno, modo de registro y concurrencia. No extrapoles el resultado a cien/doscientos como si fuera una medición real.

La interpretación deportiva la harán Dennis y ChatGPT. No selecciones una semilla distinta para que el equipo experto gane ni declares calibración por ocho parejas.

## 13. Paquetes que debes devolver

### 13.1 Archivos finales

Escribe en `out/motor18b/entrega-final/`, excluido de Git:

1. `MOTOR-18B-revision-rapida.zip`, objetivo menor de 5 MiB.
2. `MOTOR-18B-indice-partes.json`.
3. `MOTOR-18B-evidencia-detallada.zip`; si supera 64 MiB, partes identificadas de hasta 64 MiB.
4. `MOTOR-18B-verificacion-final.json`, fuera de los ZIP y sin autorreferencia de huella.

Entrega los cuatro como adjuntos reales o enlaces de descarga accesibles en el entorno, y comprueba una descarga por bytes. **Un listado de rutas del contenedor no es la entrega de los archivos.** Si el entorno no permite adjuntar alguno, explica la limitación y deja una vía concreta de recuperación; no afirmes haberlo adjuntado si no se ha hecho.

### 13.2 Contenido mínimo del rápido

| Archivo/conjunto | Contenido exigido |
|---|---|
| `00-LEEME.md` | Orden de lectura y límites |
| `RESUMEN-OPERATIVO.md` | Hechos de cierre y pendientes, generado desde resultados finales |
| `00-congelacion.json`, agenda legible y de máquina | Código, perfiles, parámetros, entradas, semillas, modo, identidad global de cada ejecución |
| `hallazgos-18b.csv` y `.json` | R01–R06 + nueva curva + unidades: caso anterior, corrección, evidencia y estado real |
| `polivalencia-antes-despues.csv` y `.json` | Anclajes, interpolación, factores, G, niveles y dosis a objetivo con entradas completas |
| `L18B.csv`, `.json` y lectura MD | Casos puros de §11 y resultados con tolerancias |
| `preparacion-y-persistencia.json` | Fuente activa, valores editados, entrada congelada, referencias intactas, recarga, fuentes, presupuestos y deshacer |
| `participantes-y-exposicion.json` | Ejemplos corregidos y excluidos; ajuste/participantes/créditos antes y después, con denominadores |
| `validaciones-y-estimaciones.json` | Rechazos y estado intacto; contexto conocido/resuelto, omisiones legítimas y ausencia de efectos al estimar |
| Comparaciones A/C/D | Secciones comparadas, igualdad/diferencia y primera discrepancia; exposición de D02 separada |
| Resultados B y comparación histórica | Conocimiento que cambia, exposición pertinente, probabilidades y resultados observados; sin concluir efectos medios por marcador |
| Auditoría y sensibilidad | Resumen AUD01–32, 32 capacidades, conocimiento separado, módulos observados/no observados |
| Aprendizaje | Dosis por jugador/dominio/objetivo, límites, parámetros, fuentes, antes/después; propuestas sin aplicar |
| Coste y verificaciones | Mediciones reales, logs disponibles, pruebas/browser/manual ejecutados o pendientes |

Los archivos pueden agruparse cuando preserven íntegramente estas lecturas y permitan encontrarlas desde el LEEME. Evita duplicar grandes instantáneas dentro del rápido.

### 13.3 Contenido detallado

- Fuentes y diferencia respecto al control MOTOR-18 suficientes para reconstruir lo revisado; referencia exacta del commit base. No incluyas secretos, dependencias instaladas o repositorios ajenos.
- Entradas congeladas, perfiles completos y matriz de diferencias.
- Los 36 resultados identificados; esenciales y los seis diagnósticos completos, incluida exposición.
- Evidencia de D02 y de los casos fijos, sin sustituir un resultado real por una tabla escrita a mano.
- Logs finales de suite, datos, documentación y navegador; descargas realmente realizadas.
- Resultados completos de AUD y sensibilidad, con sus versiones.
- Comparaciones históricas reutilizadas identificadas como tales; conserva la evidencia MOTOR-18 original sin alterar.

### 13.4 Comprobador y resumen sin exceso de análisis

Reutiliza/adapta el comprobador de entrega actual para comprobar:

- Tamaños, SHA-256, CRC, parseo, entradas y referencias.
- Agenda frente a intentos y ejecuciones especiales.
- Solo el conocimiento indicado difiere entre K8/K28.
- Las igualdades/diferencias declaradas se calculan de los archivos reales.
- Curva nueva, modelo anterior y parámetros efectivos correctamente identificados.
- Bloqueador del caso fijo incluido y acreditado; participantes no pertinentes excluidos.
- Rechazo de exposición parcial y de repartos inválidos; estado previo conservado.
- Continuidad y fuentes de sesión/encuentro sin colisiones observadas.
- Resultados de las comprobaciones técnicas y material realmente entregado.

Un verificador que solo comprueba existencia de archivos no demuestra estas propiedades. Informa qué controles son de integridad y cuáles de contenido.

Haz un cierre factual y una explicación breve de las correcciones. ChatGPT analizará el detalle; no gastes la entrega en redactar una nueva investigación extensa de baloncesto ni en interpretar resultados deportivos insuficientes.

## 14. Documentación y recorrido manual

### 14.1 Archivos del repositorio

- Archiva íntegramente este prompt como MD en `docs/prompts/` y actualiza su catálogo.
- Crea `docs/prompts/MOTOR-18B-recorrido-manual.md`.
- Crea `docs/tecnico/motor18b.md` con el mapa de los cambios, estado de R01–R06 y enlaces a evidencia.
- Actualiza estado, changelog, contratos y las páginas temáticas pertinentes de tácticas/familiaridad, desarrollo/aprendizaje, laboratorio, configuración y exportación.
- Deja constancia de que 18B reemplaza la semilla del factor de Polivalencia para los perfiles nuevos y corrige conexiones/validaciones de MOTOR-18. No invalida el resto del diseño funcional.
- Conserva las decisiones anteriores que siguen vigentes, incluidos 32 atributos, 62 conocimientos y retención lenta.
- No conviertas los informes históricos en resultados nuevos ni borres sus limitaciones. Las páginas vigentes pueden enlazar al cierre posterior que las resuelve.

Las normas de trabajo siguen siendo: prompts en Markdown archivados, pruebas automáticas proporcionadas, aceptación manual de Dennis y decisiones explícitas.

### 14.2 Recorrido manual enfocado

Incluye pasos, semilla, perfil y señales concretas de fallo para:

1. Perfil anterior frente a base 18B; modelo de Polivalencia efectivamente activo.
2. Crear copia sintética, cambiar defensa y confirmar la misma en la entrada congelada y el partido.
3. Cambiar rol y puestos PG/C; ver la familiaridad vigente sin que el conocimiento se reinicialice.
4. Entrenar con una copia, recargar y volver a entrenar. Ver otra fuente y presupuesto acumulado.
5. Deshacer: conocimiento, peak, día y presupuestos restaurados, con rastro de la aplicación revertida.
6. Comparar P8/P24 con misma dosis y conocimiento; factores y ganancia visibles.
7. Cambiar solo Polivalencia antes de jugar y comprobar la propiedad de neutralidad con el caso preparado, sin exigir una nueva simulación manual para cada comparación.
8. Guardar al terminar un cuarto, continuar y proponer aprendizaje únicamente desde el resultado completo.
9. Ver el bloqueador en el ejemplo corregido y su crédito; ver una continuación donde el anterior ya no participa.
10. Público/propio/diagnóstico y descargas.

Realiza un recorrido automático de Chromium enfocado en Preparación efectiva, entrenar–recargar–entrenar, continuidad y descargas. La recarga real es obligatoria en esa comprobación: cambiar solo de pestaña no reproduce R03.

Distingue lo que realmente has recorrido de lo que queda a Dennis. Si otra plataforma o navegador no se ejecuta, indícalo; no amplíes esta entrega para cubrir todos los entornos.

## 15. Criterios de cierre y mensaje final

### 15.1 Aceptación técnica

La implementación se puede declarar técnicamente cerrada cuando:

- La nueva curva y sus números de referencia están implementados desde tablas y contrastados.
- Preparación y el partido comparten la fuente activa correcta.
- Los bloqueadores pertinentes participan una vez en familiaridad y exposición; los actores históricos no pertinentes no se arrastran.
- La recarga permite nuevas sesiones sin borrar las protecciones de repetición ni los presupuestos.
- Se rechazan entradas parciales/numéricamente inválidas sin mutación.
- Las estimaciones comparten los datos pertinentes conocidos y declaran los componentes aún no determinados, con cero efectos deportivos al estimar.
- Las regresiones, la suite final, los datos y la documentación pasan.
- La campaña y los paquetes están completos, o los límites restantes se declaran de forma precisa sin una afirmación de cierre que los contradiga.

La aceptación manual, la calibración deportiva global, la conformidad FIBA completa y el presupuesto del mundo siguen siendo decisiones independientes. No es necesario que las 32 auditorías estén conformes para cerrar estas correcciones; sí que no se oculten señales o defectos demostrados.

### 15.2 Respuesta final obligatoria de Claude

Devuelve, en este orden:

1. Estado real de implementación y PR, base y commits. Indica si amplía la PR #19 o si MOTOR-18 ya estaba integrado.
2. Qué puede probar Dennis, con ruta de recorrido manual.
3. Tabla P8/P16/P24: factor, G y ganancia en el ejemplo de una hora efectiva, dejando clara la unidad.
4. Estado de R01–R06 y unidades: corregido, comprobado, pendiente o no reproducido con explicación y evidencia.
5. Campaña: solicitudes, terminados válidos, fallidos, reintentos, controles y ejecuciones especiales. Encuentros adicionales separados.
6. Neutralidad, continuidad y diferencias de trayectoria observadas por correcciones; ninguna conclusión de calibración basada solo en marcadores.
7. Resultados técnicos realmente ejecutados y pendientes de aceptación manual.
8. **Adjuntos/enlaces de los archivos finales**, tamaño y comprobador utilizable.
9. Límites restantes, sin declaraciones de «motor terminado» o «validado» que excedan lo demostrado.

No fusiones la PR ni te suscribas. La cuota y el tiempo de sesión solo se informan si el entorno permite medirlos; no los estimes como datos observados.
