# MOTOR-18C · Dos correcciones de identidad del aprendizaje

**Destinatario:** Claude Code.  
**Proyecto autorizado:** `bateman37/beM`, exclusivamente.  
**Fecha:** 22 de octubre de 2026.  
**Objetivo:** corregir los dos casos reproducidos en la revisión independiente de MOTOR-18B: coincidencia de prefijos entre encuentros y aplicación del resultado de una copia a otra copia.

Este es un encargo de implementación. Completa las dos correcciones, las comprobaciones acotadas, la documentación y la entrega de evidencia. Las decisiones funcionales están cerradas aquí. Conserva el trabajo válido de MOTOR-18 y MOTOR-18B.

## Índice

1. [Alcance y resultado esperado](#1-alcance-y-resultado-esperado)
2. [Base, Git y lectura dirigida](#2-base-git-y-lectura-dirigida)
3. [C18-01: identidad exacta del encuentro aplicado](#3-c18-01-identidad-exacta-del-encuentro-aplicado)
4. [C18-02: pertenencia a la copia activa](#4-c18-02-pertenencia-a-la-copia-activa)
5. [Compatibilidad y comportamiento que se conserva](#5-compatibilidad-y-comportamiento-que-se-conserva)
6. [Comprobaciones automáticas y navegador](#6-comprobaciones-automáticas-y-navegador)
7. [Evidencia pequeña para revisión](#7-evidencia-pequeña-para-revisión)
8. [Documentación y recorrido de Dennis](#8-documentación-y-recorrido-de-dennis)
9. [Criterios de cierre y respuesta final](#9-criterios-de-cierre-y-respuesta-final)

## 1. Alcance y resultado esperado

Esta entrega tiene **dos correcciones funcionales**:

| ID | Comportamiento que debe corregirse | Resultado esperado |
| --- | --- | --- |
| C18-01 / REV18B-01 | Una aplicación de M10 puede hacer que M1 aparezca como ya aplicado. | Solo la identidad completa del mismo encuentro y equipo acredita que ya está aplicado. |
| C18-02 / REV18B-02 | Un resultado de la copia A puede aplicarse a la copia B si ambas contienen EQ01/EQ02. | El flujo normal solo propone y aplica aprendizaje al historial de la copia a la que pertenece el encuentro. |

Son correcciones del laboratorio y de su aplicación posterior al partido. **No cambies el cálculo deportivo, la curva de Polivalencia, los parámetros de familiaridad ni el aprendizaje matemático.**

La decisión de producto se mantiene: durante el encuentro se usa conocimiento congelado y se acumula exposición; solo un encuentro terminado permite proponer aprendizaje, y su aplicación es explícita y posterior.

No añadas transferencia de experiencia entre variantes, otro sistema de identidades, otra base de datos ni un panel nuevo. No ejecutes campañas de calibración o auditorías masivas. El rendimiento del mundo y los partidos simultáneos siguen fuera de este encargo.

## 2. Base, Git y lectura dirigida

### 2.1 Comprueba el estado real

El último informe sitúa MOTOR-18 y MOTOR-18B en `claude/busy-edison-b1fmnc`, PR #19 abierta contra `main`. Declara código de campaña `f8112953bcb4f97a7791337629229fac34c8b59c` y último commit de la entrega `dd3b007`. **Son referencias históricas; comprueba la cabeza actual antes de editar.**

- Lee las normas vigentes del repositorio y su índice de documentación.
- Registra commit inicial, rama, estado de Git y base efectiva de MOTOR-18B.
- Si la PR #19 sigue abierta y contiene MOTOR-18B, añade 18C a esa misma rama y actualiza título/descripción para reflejar MOTOR-18 + MOTOR-18B + MOTOR-18C.
- Si MOTOR-18B ya se ha fusionado, crea una rama de MOTOR-18C desde `main` actualizado y una PR independiente.
- Conserva cambios ajenos y los archivos históricos. No hagas reinicios destructivos ni fuerces una rama para borrar trabajo existente.
- Sube los commits y deja la PR abierta, **sin fusionar ni suscribirte**.

### 2.2 Lee solo lo pertinente

Consulta el prompt y la nota técnica de MOTOR-18B, las normas de prompts/pruebas y estos módulos o sus equivalentes actuales:

- `src/lab/learning-ui.js`: `postMatchLearningCard`, `done`, `applyAll` y `commit`.
- `src/lab/learning-model.js`: identidad de copia y `nextMatchId`.
- `src/lab/knowledge-ui.js`: activar/restaurar copia y persistencia.
- `src/lab/game.js`: asignación de `input.labMatchId`, resultado vivo y continuación.
- `src/learning/team.js`: `sourceIdOf`, aplicación, rechazo de duplicado y deshacer.
- Las pruebas de MOTOR-18/18B que cubren identidad, aplicación y persistencia.

Si está disponible, utiliza `beM-MOTOR-18B-REVISION-INDEPENDIENTE.md`, §5. Este prompt ya contiene las reproducciones necesarias; el informe no es una dependencia para implementar.

**No consultes otros repositorios**, incluidos `v-apps`, basket-manager y BeManager. Esta corrección no requiere investigación externa ni volver a leer el diseño funcional entero.

## 3. C18-01: identidad exacta del encuentro aplicado

### 3.1 Defecto reproducido

En el código revisado, la tarjeta emplea:

```js
const done = (tid) => L.ledgers[tid].applications.some(
  (a) => a.status === 'aplicada'
    && a.source_id.startsWith(src)
    && a.teamInstance === tid
);
```

Con `src = COPIA|M1`, una aplicación registrada como `COPIA|M10|EQ01` satisface esa condición. Si M10 está aplicado a ambos equipos, la tarjeta de M1 deshabilita «Aplicar a esta variante», aunque M1 nunca se haya aplicado.

La comprobación independiente lo reprodujo con los manejadores reales de la tarjeta en un DOM mínimo. No fue necesario simular diez encuentros.

### 3.2 Decisión de implementación

Para cada equipo calcula la fuente completa con el constructor existente:

```js
sourceIdOf({ source: src, teamInstance: tid })
```

La aplicación ya existente exige simultáneamente:

- `status === 'aplicada'`.
- `teamInstance === tid`.
- **Igualdad exacta** entre `source_id` y la fuente completa esperada.

Elimina el uso de prefijos para decidir si este encuentro está aplicado. No sustituyas `startsWith` por otra coincidencia parcial, búsqueda de subcadena o comparación de solo el número local.

Usa el mismo criterio para deshabilitar el botón y para comprobar cada equipo al ejecutar la aplicación. El núcleo de aprendizaje mantiene su rechazo de la fuente realmente duplicada.

### 3.3 Casos fijados

| Registro existente | Resultado consultado | Comportamiento |
| --- | --- | --- |
| `A|M10|EQ01` | `A|M1`, EQ01 | M1 no figura como aplicado por ese registro. |
| `A|M11|EQ01` o `A|M100|EQ01` | `A|M1`, EQ01 | Tampoco hay coincidencia. |
| `A|M1|EQ01`, aplicada | `A|M1`, EQ01 | Ya aplicado; no se escribe de nuevo. |
| `A|M1|EQ01`, aplicada | `A|M1`, EQ02 | El registro de EQ01 no acredita aplicación a EQ02. |
| `A|M1|EQ01`, revertida | `A|M1`, EQ01 | No se presenta como aplicación vigente; se conserva la política previa de deshacer/reaplicar. |

M1 y M10 son ejemplos. La solución debe servir para todas las secuencias emitidas por el constructor vigente.

## 4. C18-02: pertenencia a la copia activa

### 4.1 Defecto reproducido

La tarjeta actual compara los identificadores de los equipos del resultado con los de la copia activa. Esa condición es insuficiente: dos copias distintas pueden contener EQ01/EQ02.

Reproducción de la revisión:

- Resultado: `LEARN18-S-EQ01-EQ02-d0-I11|M1`.
- Copia activa posterior: `LEARN18-S-EQ01-EQ02-d0-I12`.
- Se construye la tarjeta del resultado de I11.
- El botón permite aplicar y cambia los estados de I12, registrando fuentes de I11.

La prueba utilizó la exposición real de B02-K28 dentro de un resultado terminado mínimo para llamar al manejador. En la interfaz, el resultado de un encuentro vivo puede seguir presente al sustituir la copia desde Plantillas.

### 4.2 Decisión funcional cerrada

**Un resultado solo puede aplicar aprendizaje mediante este flujo normal a su propia copia de aprendizaje.** Compartir equipos, jugadores, semilla, marcador o contenido inicial no convierte dos copias en la misma instancia.

Utiliza `input.labMatchId` y la identidad persistente de la copia, que ya existen. El formato emitido en MOTOR-18B es:

```text
<identidad completa de la copia>|M<secuencia del encuentro>
```

Centraliza la lectura y validación mínima de esa identidad en el módulo de laboratorio apropiado. Extrae el sufijo final de encuentro del formato vigente y compara **por igualdad exacta** la identidad completa de copia extraída con `store.learn.copy.id`.

- La secuencia debe ser un entero positivo válido del formato emitido; rechaza una identidad ausente o mal formada con causa legible.
- No decidas la pertenencia mediante `startsWith(copy.id)`, porque una copia cuyo identificador termina en I1 tampoco debe confundirse con I10.
- Conserva la comprobación de compatibilidad de los equipos del encuentro. No debilites las validaciones actuales de exposición, estado previo, parámetros ni fuentes.
- No reasignes el resultado a la nueva copia ni reconstruyas su identidad usando la copia actualmente seleccionada.
- No cambies los formatos de exportación, guardado o persistencia para este arreglo: la identidad necesaria ya viaja en la entrada.

### 4.3 Comprobar al mostrar y al aplicar

Comprueba la pertenencia **antes de adoptar metadatos, construir propuestas o persistir aprendizaje** desde ese resultado. Para un resultado de otra copia muestra un aviso y no ofrezcas una aplicación activa.

Texto orientativo:

> Este partido pertenece a otra copia de aprendizaje. No se puede aplicar a la copia activa.

Puedes mostrar ambas identidades en el detalle de diagnóstico. No añadas una acción de «forzar», transferencia o importación entre copias.

El manejador de «Aplicar» debe volver a comprobar que la copia activa sigue siendo la destinataria. No basta validar al dibujar la tarjeta: una referencia a un botón o propuesta anterior no puede escribir sobre otra copia que se haya activado después.

Ante esa incompatibilidad:

- Devuelve o muestra un rechazo, sin mensaje de éxito aparente.
- No cambies conocimiento, máximos históricos, reloj, presupuestos, recibos, secuencias ni fuentes aplicadas.
- No escribas en la copia anterior retenida por un cierre del manejador ni en la nueva copia activa.
- No intentes corregirlo automáticamente generando una propuesta para el nuevo destino.

La identidad persistida sigue siendo válida después de serializar/restaurar **la misma copia**. No uses la referencia de objeto en memoria como única comprobación de pertenencia.

## 5. Compatibilidad y comportamiento que se conserva

Esta entrega conserva:

- Aplicación explícita desde partido terminado y exposición completa.
- Fuente estable de encuentro al guardar, continuar y volver a consultar el resultado.
- Aplicación una sola vez por fuente y equipo, deshacer exacto y política vigente de reaplicación de un recibo revertido.
- Sesiones S1/S2 y sus presupuestos tras recargar.
- Curva de Polivalencia de MOTOR-18B y compatibilidad de perfiles anteriores.
- Copias, históricos y recibos existentes sin migración o renombrado silencioso.
- Validaciones de huellas de estado y de parámetros antes de aceptar una propuesta.

Los resultados antiguos sin identidad suficiente siguen siendo consultables; su aprendizaje se rechaza con explicación. No intentes inferir la copia a partir de la coincidencia de equipos.

Mantén versión deportiva, perfiles efectivos y esquemas de exportación/guardado. MOTOR-18C identifica esta entrega del laboratorio. Si las normas requieren actualizar una etiqueta de aplicación o documentación, distingue esa etiqueta de las versiones deportivas; no fuerces actualizaciones incompatibles ni nuevos perfiles SEM por estas correcciones.

No edites `src/match`, `src/knowledge`, las fórmulas de `src/learning`, datos del perfil ni baselines deportivos. Si encuentras que el código actual exige tocar uno de esos ámbitos, explica la dependencia concreta y limita la intervención; no amplíes silenciosamente el encargo.

## 6. Comprobaciones automáticas y navegador

### 6.1 Pocas regresiones con los consumidores reales

Añade una batería pequeña agrupada en cuatro escenarios. Se pueden parametrizar subcasos dentro de cada escenario; no hay un objetivo de aumentar el número de pruebas.

| Caso | Qué demuestra |
| --- | --- |
| T18C-01 | M10/M11/M100 no bloquean M1, mientras una aplicación vigente de M1 al equipo correcto sí se reconoce. |
| T18C-02 | Un resultado de copia A no se propone/aplica a B con los mismos equipos; repetir el caso con identidades de copia I1/I10 evita introducir otro prefijo ambiguo. |
| T18C-03 | Si la tarjeta se creó para A y se activa B antes de invocar su manejador, se rechaza sin cambiar el estado ni los registros de ninguna de las dos copias. |
| T18C-04 | En la copia correcta se puede aplicar una vez, rechazar la repetición, deshacer y conservar el comportamiento autorizado al restaurar la misma copia. |

Usa fixtures pequeños o una exposición completa existente. En las pruebas de aplicación comprueba los cambios efectivos, recibos y presupuestos, y compara el estado antes/después de los rechazos. Emplea un conocimiento con margen para aprender; que un nivel ya situado en 30 permanezca igual no demostraría que la aplicación se ejecutó correctamente.

Verifica el consumidor usado por `postMatchLearningCard` y, especialmente, su manejador de aplicación. Una prueba que solo copie la nueva comparación en el propio test no cubre el defecto. Puedes extraer una función pequeña compartida de laboratorio y usar un DOM mínimo como ya permite el proyecto. No añadas un framework para esto.

Las regresiones de ambos defectos deben fallar con el comportamiento anterior y pasar con la corrección. No repitas toda la campaña para acreditarlo; conserva la salida concreta de esos casos.

### 6.2 Controles existentes

- Ejecuta las pruebas dirigidas durante el arreglo.
- Cuando el código y las pruebas estén terminados, ejecuta **una vez** la suite completa y los comprobadores de datos/documentación exigidos por el repositorio.
- Conserva comandos, códigos de salida y resultados reales. No des por ejecutado un comando de esta entrega porque hubiera pasado en 18B.
- Si después cambia código relevante, repite solo lo que el cambio justifique. La documentación final también debe pasar el comprobador documental.

No lances los scripts que regeneran la campaña MOTOR-18B ni `m18b-evidence.js`: su comprobación de curva ejecuta partidos adicionales y no hace falta para estos dos arreglos. No repitas los 36 encuentros ni campañas de cien/doscientos.

### 6.3 Recorrido focalizado de navegador

Si está disponible el navegador, comprueba la tarjeta en estos dos estados:

1. Partido terminado de la copia correcta: aplicación, rechazo de duplicado y deshacer según el flujo actual.
2. Sustituir la copia manteniendo ese resultado y regresar a Partido: aviso de copia distinta y aplicación bloqueada.

Reutiliza un guardado/resultado compatible cuando el flujo lo permita. Si necesitas un partido nuevo para llegar a un resultado vivo, juega uno y reutilízalo para ambos recorridos; no simules diez partidos para obtener M10. La colisión numérica queda cubierta con el fixture dirigido.

Conserva errores reales de consola/red y verifica por bytes la descarga del paquete de entrega si la interfaz utilizada permite adjuntarlo/descargarlo. Si no hay navegador, declara exactamente esa limitación; no sustituyas sus resultados por los de un DOM mínimo.

Cuenta por separado los partidos nuevos de recorrido y los ejecutados internamente por la suite. Si el recuento de la suite no está disponible, decláralo como no contabilizado. No simules partidos adicionales solo para completar el contador.

## 7. Evidencia pequeña para revisión

No necesito otro paquete de 25 MiB de partidos. Devuelve **un ZIP pequeño**, suficiente para revisar los dos arreglos, y un recibo de verificación separado:

```text
out/motor18c/entrega-final/
  MOTOR-18C-revision-rapida.zip
  MOTOR-18C-verificacion-final.json
```

Usa las herramientas existentes de empaquetado cuando sean apropiadas, sin regenerar evidencia histórica. El ZIP debe contener:

| Archivo o bloque | Contenido |
| --- | --- |
| `00-LEEME.md` | Resultado real, alcance, commit inicial/final, archivos cambiados, comprobado/pendiente/no ejecutado. |
| `identidad-casos.json` | Por cada T18C: copia del resultado, copia activa, encuentro, equipo, fuente completa esperada, fuentes registradas, acción, aceptación/rechazo y motivo. |
| `estados-y-recibos.json` | Antes/después de los estados, presupuestos y recibos pertinentes de los casos dirigidos; datos suficientes para recalcular sus huellas. Separa estado de aprendizaje, registro y secuencias. |
| `cambios.patch` | Diff real del arreglo desde la base identificada, incluidos helper/pruebas que permiten reproducir los casos. |
| `verificaciones/` | Salidas reales de pruebas dirigidas, suite completa y comprobadores exigidos; pasos del navegador si se ejecutó. |
| `recorrido-manual.md` | Guion breve para Dennis, coherente con la interfaz final. |
| `manifiesto.json` | Rutas, tamaños, SHA-256 y procedencia de archivos, sin una suma circular del manifiesto sobre sí mismo. |

El recibo externo debe identificar el ZIP por nombre, tamaño y SHA-256, y resumir las comprobaciones de integridad y contenido. Recalcula desde los archivos reales al menos: distinción M1/M10, rechazo de copia ajena, rechazo de manejador obsoleto y aplicación legítima única. No emitas simplemente valores `true` copiados del informe.

Conserva también una comparación de contenido inicial/final de los archivos deportivos y datos del perfil, para acreditar que esas áreas siguen iguales. Excluye de esa comprobación los metadatos de Git y las etiquetas de aplicación permitidas; declara exactamente qué rutas has comparado. Una referencia a un commit distinto por documentación no demuestra por sí sola un cambio deportivo.

Entrega estos archivos como adjuntos o enlaces reales descargables del entorno. Comprueba que existen y que sus bytes coinciden con el recibo. No afirmes que están adjuntos si solo has escrito sus rutas. Si el cliente no permite adjuntarlos, explica dónde se encuentran y cómo descargarlos; conserva el comando exacto para regenerarlos.

`out/` sigue fuera de Git. Versiona el resumen técnico y la evidencia compacta necesaria según las normas existentes; no subas trazas masivas ni dupliques los paquetes de 18B.

## 8. Documentación y recorrido de Dennis

- Archiva **este prompt íntegro** en `docs/prompts/`, como `MOTOR-18C-identidad-aprendizaje.md`, y añádelo al catálogo.
- Crea `docs/tecnico/motor18c.md` con causa, corrección, archivos afectados, relación con REV18B-01/02, pruebas y límites reales. Debe ser una nota breve y localizada.
- Crea `docs/prompts/MOTOR-18C-recorrido-manual.md`.
- Actualiza `docs/estado.md`, changelog y el apartado temático de aprendizaje correspondiente. Enlaza el detalle; conserva la indexación y evita duplicar el diseño entero.
- Aclara que 18C completa la identidad del aprendizaje del laboratorio y prevalece sobre la comprobación parcial de equipo/prefijo de 18B.

El guion manual debe permitir a Dennis comprobar:

1. Abrir el laboratorio con la versión actual y activar una copia de aprendizaje.
2. Terminar un encuentro de esa copia y ver la propuesta posterior.
3. Aplicar una vez, comprobar el recibo y verificar que no vuelve a aplicar.
4. Deshacer mediante el control existente y comprobar el estado restaurado.
5. Mantener el resultado mientras se crea otra copia con los mismos equipos.
6. Regresar al resultado y ver el aviso de pertenencia, sin posibilidad de aplicar a la nueva copia.

Adapta las instrucciones a los controles reales de la aplicación. No describas un botón de reapertura/restauración que no exista. La distinción M1/M10 se acredita automáticamente; Dennis no tiene que jugar diez encuentros para probarla.

La aceptación manual queda pendiente de Dennis. No la marques como realizada por pasar el navegador automatizado.

## 9. Criterios de cierre y respuesta final

MOTOR-18C queda implementado técnicamente cuando:

- M1 y M10 se distinguen por su identidad completa.
- El equipo y el estado vigente del recibo siguen formando parte de la comprobación de aplicación.
- La copia ajena se rechaza antes de construir/aplicar aprendizaje o persistir cambios derivados del resultado.
- La misma protección existe al invocar un manejador creado antes de cambiar la copia.
- La copia correcta mantiene aplicación única, persistencia y deshacer.
- Las áreas deportivas y los perfiles conservan su contenido.
- Pasan las comprobaciones necesarias y se entrega la evidencia pequeña descargable.

Al responder indica, de forma breve:

1. Rama, base, commits y PR real; si se actualizó la #19 o se creó una nueva porque ya estaba fusionada.
2. Qué cambió para cada una de las dos correcciones.
3. Resultados efectivos de T18C-01…04, suite y comprobadores; qué se hizo en navegador.
4. Qué puede probar Dennis y ruta del recorrido manual.
5. Los dos archivos de entrega, con tamaño y SHA-256 del ZIP.
6. Limitaciones o comprobaciones no ejecutadas y partidos adicionales, si los hubo.

No declares calibración deportiva, conformidad FIBA integral o rendimiento masivo resueltos. No son objetivos de esta entrega. No añadas una nueva campaña ni propongas otra fase como condición automática para cerrar estos dos arreglos.
