# MOTOR-18C — Identidad del aprendizaje del laboratorio

> [Prompt archivado](../prompts/MOTOR-18C-identidad-aprendizaje.md) · [Recorrido manual](../prompts/MOTOR-18C-recorrido-manual.md) · [Estado](../estado.md) · base: [`motor18b.md`](motor18b.md) · evidencia compacta en [`evidencia-motor18c/`](evidencia-motor18c/)

**Veredicto honesto.** MOTOR-18C corrige dos defectos de la **interfaz de aplicación del aprendizaje posterior al partido** reproducidos en la revisión independiente de MOTOR-18B (REV18B-01 y REV18B-02). **No cambia ningún cálculo deportivo, la curva de Polivalencia, los parámetros de familiaridad ni el aprendizaje matemático** (comparación de contenido en el §6). Completa la identidad del aprendizaje del laboratorio y **prevalece sobre la comprobación parcial de equipo/prefijo de MOTOR-18B**.

## 1 · Base y Git

La PR de MOTOR-18 + MOTOR-18B (`bateman37/beM#19`) **ya estaba fusionada** (merge `d744e23`, cabeza de la rama `dd3b007`). La rama `claude/busy-edison-b1fmnc` se reinició desde `main` (`d744e23`; solo contenía historia ya fusionada) y MOTOR-18C es una **PR independiente** contra `main`. Commit inicial = base efectiva = `d744e23`.

## 2 · C18-01 (REV18B-01): identidad exacta del encuentro aplicado

**Causa.** `postMatchLearningCard` decidía «ya aplicado» con `a.source_id.startsWith(src)` (`src = <copia>|M1`): una aplicación de `<copia>|M10|EQ01` (también M11, M100…) satisfacía la condición, el botón «Aplicar a esta variante» de M1 se deshabilitaba y `applyAll` respondía «ya aplicado» sin que M1 se hubiera aplicado nunca.

**Corrección.** Una función pura compartida, `isMatchApplied(ledger, source, teamId)` en `src/lab/learning-model.js`, calcula la fuente completa con el constructor existente (`sourceIdOf({ source, teamInstance })`) y exige a la vez `status === 'aplicada'`, `teamInstance === teamId` e **igualdad exacta** `source_id === fuente completa`. El mismo criterio deshabilita el botón y comprueba cada equipo al aplicar. No queda ningún `startsWith`, subcadena ni comparación del número local. El núcleo (`applyProposal`) conserva su rechazo de la fuente realmente duplicada.

| Registro existente | Consulta | Resultado |
|---|---|---|
| `A\|M10\|EQ01`, `A\|M11\|EQ01` o `A\|M100\|EQ01` | `A\|M1`, EQ01 | no figura como aplicado |
| `A\|M1\|EQ01`, aplicada | `A\|M1`, EQ01 | ya aplicado, no se escribe de nuevo |
| `A\|M1\|EQ01`, aplicada | `A\|M1`, EQ02 | no acredita EQ02 |
| `A\|M1\|EQ01`, revertida | `A\|M1`, EQ01 | no es aplicación vigente; se conserva la política de deshacer/reaplicar |

## 3 · C18-02 (REV18B-02): pertenencia a la copia activa

**Causa.** La tarjeta solo comprobaba que los equipos del resultado existieran en la copia activa. Dos copias distintas pueden contener EQ01/EQ02: el resultado de `…-I11` construía propuestas contra los estados de `…-I12` y el manejador escribía en ella con fuentes de I11.

**Corrección.**

- `parseMatchId` / `matchBelongsToCopy` (en `src/lab/learning-model.js`) leen `input.labMatchId` con el formato emitido por `nextMatchId` (`<identidad completa de la copia>|M<n>`, n entero positivo sin ceros a la izquierda) y comparan la identidad completa de copia extraída con `store.learn.copy.id` por **igualdad exacta** (nunca `startsWith`: I1 no es I10). Una identidad ausente o mal formada se rechaza con causa legible; no se infiere la copia a partir de los equipos.
- La comprobación se hace **antes** de adoptar metadatos, construir propuestas o persistir nada. Un resultado de otra copia muestra «Este partido pertenece a otra copia de aprendizaje. No se puede aplicar a la copia activa.» con un detalle de diagnóstico (copia del resultado, encuentro, copia activa); sin botón de aplicar ni de ver propuesta, y sin acción de forzar, transferir o importar.
- El manejador de «Aplicar a esta variante» **vuelve a comprobar** la copia activa en el momento del clic (`store.learn` actual, no la copia retenida al dibujar). Si ya no es la destinataria, o no hay copia activa, rechaza con un mensaje rojo (`No aplicado: …`) sin tocar conocimiento, máximos históricos, reloj, presupuestos, recibos, secuencias ni fuentes de ninguna copia. El mensaje queda ligado a su encuentro y no se arrastra a otras tarjetas.
- No usa la referencia de objeto en memoria como única prueba: tras serializar/restaurar **la misma copia** la identidad persistida sigue siendo válida.
- Los resultados antiguos sin identidad suficiente siguen siendo consultables y su aprendizaje se rechaza con explicación (comportamiento de 18B).

## 4 · Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/lab/learning-model.js` | `parseMatchId`, `matchBelongsToCopy`, `OTHER_COPY_TEXT`, `matchSourceFor`, `isMatchApplied` (lógica pura, sin DOM) |
| `src/lab/learning-ui.js` | `postMatchLearningCard`: pertenencia antes de adoptar/proponer, `done` por igualdad exacta, manejador con comprobación de copia activa y mensaje de éxito/rechazo diferenciado |
| `src/version.js` | etiqueta de la aplicación `MOTOR-18C` (el motor `0.18.1-MOTOR18B`, el export `/10`, la entrada `/7`, `ESE-MOTOR18B-R1` y `FAM/LEARN-MOTOR18B-R1` **no cambian**) |
| `tests/fake-dom.js`, `tests/m18c-fixture.js`, `tests/motor18c.test.js` | DOM mínimo, escenarios sobre los consumidores reales y las cuatro pruebas T18C |
| `tests/motor11,12,13,18b.test.js` | solo la aserción de la etiqueta de la aplicación |
| `scripts/m18c-evidence.js`, `scripts/browser/m18c-recorrido.mjs`, `scripts/m18c-package.py`, `scripts/m18c-verify-delivery.py` | evidencia pequeña, recorrido de Chromium, empaquetado y recibo |

## 5 · Pruebas (T18C-01…04)

Las pruebas ejecutan los **manejadores reales** de `postMatchLearningCard` (botón «Aplicar a esta variante»), `activateCopy` y el núcleo de aprendizaje sobre un DOM mínimo (`tests/fake-dom.js`: elementos, `append`, `click`, `disabled`; sin dependencias nuevas). Los fixtures parten de nivel 12 para que la aplicación cambie niveles de verdad (un nivel ya en 30 no demostraría nada) y se comparan antes/después en los rechazos. Los valores esperados están escritos en la prueba, no obtenidos de la función comprobada.

| Caso | Qué demuestra |
|---|---|
| T18C-01 | M10/M11/M100 aplicados a ambos equipos no bloquean M1; M1 se aplica con su fuente exacta; repetirla se rechaza; revertir M1 solo en EQ02 reabre solo EQ02; tabla pura de los cinco registros del §3 de este documento |
| T18C-02 | Resultado de I11 con copia activa I12, de I10 con I1 y de I1 con I10: aviso, sin aplicación ni propuesta, estado idéntico (incluidos metadatos adoptables sin tocar); identidades ausentes o mal formadas rechazadas con causa |
| T18C-03 | Tarjeta creada para A, B activada antes del clic: rechazo sin cambiar A ni B (JSON completo idéntico), sin copia activa tampoco escribe, mensaje rojo y A restaurada conserva su aplicación |
| T18C-04 | Copia correcta: una aplicación (48 entradas cambiadas por equipo, presupuesto 1 por dominio), repetición rechazada (botón, manejador y núcleo), serializar/restaurar la misma copia, deshacer con huellas iguales y reaplicación permitida |

**Con el comportamiento anterior** (la interfaz de `main` y la nueva identidad en el modelo): T18C-01, 02 y 03 **fallan** y T18C-04 pasa (la copia correcta no cambia): salida conservada en `verificaciones/t18c-con-comportamiento-anterior.txt` del paquete. Resultados con la corrección, suite completa y comprobadores: [`evidencia-motor18c/RESUMEN.md`](evidencia-motor18c/RESUMEN.md).

## 6 · Áreas deportivas y datos

Comparación de contenido (SHA-256 de cada archivo) entre la base `d744e23` y el árbol final: todo `src/` salvo `src/lab/` (objeto de la corrección) y `src/version.js` (etiqueta de aplicación permitida), y todo `data/`: **176 archivos comparados, 0 diferencias** (`comparacion-areas-deportivas.json` en el paquete). Los metadatos de Git no se comparan.

## 7 · Límites reales

- El navegador automatizado recorrió el flujo y **un** partido nuevo; la aceptación manual de Dennis está pendiente.
- Tras recargar la página el partido terminado en memoria desaparece; esto no cambia (no se añade reapertura de resultados).
- No hay transferencia de experiencia entre variantes, ni otro sistema de identidades, ni campaña de calibración. La calibración deportiva, la conformidad FIBA integral y el rendimiento masivo o de partidos simultáneos **no** son objetivos de esta entrega ni quedan resueltos por ella.
