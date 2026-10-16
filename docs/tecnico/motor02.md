# Implementación de MOTOR-02 (tres modalidades y dirección manual)

Estado real: **ejecutado por Claude el 2026-10-16, pendiente de revisión de Dennis**. Encargo: [`../prompts/MOTOR-02-modos-y-direccion.md`](../prompts/MOTOR-02-modos-y-direccion.md). Diseño: [órdenes y dirección en vivo (cap. 15)](../motor/direccion/c15-ordenes-delegacion-y-direccion-en-vivo.md), [modalidades (cap. 24)](../motor/laboratorio/c24-modalidades-y-primer-laboratorio.md), [reglamento (cap. 18)](../motor/reglamento/c18-reglamento-y-administracion-deportiva.md). Base: [`motor01.md`](motor01.md). Recorrido manual: [`../prompts/MOTOR-02-recorrido-manual.md`](../prompts/MOTOR-02-recorrido-manual.md).

Versión del motor `beM-motor-0.2.0-MOTOR02` · formato de exportación `beM-match-export/2` · perfil efectivo `SEM-MOTOR01-20261016+SEM-MOTOR02-20261016` (SEM: provisional, no calibrado) · semilla de referencia `20261016`.

## Arranque

`npm run dev` → <http://localhost:5173/> (`PORT` configurable) · `npm test` (40 pruebas) · `npm run data:check` · `npm run replay -- fichero.json` (reproduce un JSON exportado).

## Qué cambia

| Ruta | Contenido |
|---|---|
| `src/match/flow.js` | `step()` resuelve **una frontera**: arranque, ventana reglamentaria, inicio/final de periodo, comienzo del periodo siguiente o una *unidad de posesión*. Un único núcleo para las tres modalidades. |
| `src/match/orders.js`, `order-types.js` | Órdenes: contrato, validación, ciclo de vida, precedencia, lotes atómicos, activación, llamadas, tiempos muertos y quinteto manual. Tipos y ámbitos en una definición reutilizable. |
| `src/match/admin.js` | Cupos de tiempos muertos y ventanas por causa (funciones puras). |
| `src/match/session.js` | `MatchSession`: único controlador de avance (total, cuartos, tiempo), planificador inyectado, velocidades, pausa, revisión entre periodos. **Presentación**, sin DOM. |
| `src/match/replay.js` | Validación previa y reproducción desde JSON; proyección deportiva y comparación. |
| `src/lab/game.js`, `direction.js` | Pantalla «Partido» y panel de dirección (borrador separado de lo vigente). |
| `data/match/motor02-seed-extension.json` | Extensión SEM (recuperación por tiempo muerto y cupos). El perfil de MOTOR-01 **no se toca** (mismo SHA-256). |

## Fronteras y modalidades

- **Unidad de posesión**: una resolución indivisible (acción + desenlace) o el arranque de la posesión. No hay intervención dentro de un gesto ya resuelto. Tras una falta, la **serie de libres es una unidad posterior**: así la ventana de la falta es una frontera.
- **Ventanas** (balón muerto, canasta recibida, intervalo, tiempo muerto): se encolan y se procesan en un paso propio. Las órdenes de cambio y tiempo muerto se resuelven ahí.
- **Anclaje**: cada comando (`submit`, `batch`, `cancel`) guarda `afterStep` (pasos completados), periodo y reloj. Nunca hora de ordenador.
- **Sin órdenes, encadenar pasos reproduce el partido de MOTOR-01 bit a bit** (63 semillas comprobadas, ver B01).
- **Total**: bucle en bloques de 40 pasos con cesión (sin hechos ni sorteos nuevos). **Cuartos**: se detiene tras `period_end`, antes del intervalo (energía «anterior al descanso»); el plan se valida como lote y se activa al inicio del periodo; prórroga si hay empate. **Tiempo**: un único temporizador; espera = duración deportiva resuelta × `baseMsPerGameSecond` / velocidad, acotada a [30 ms, 8 s] (`PRESENTATION`, separado de los parámetros deportivos); pausa cancela el temporizador; en segundo plano el navegador retrasa pero nunca encadena ticks (no se simula de golpe el tiempo transcurrido). Un tiempo muerto concedido pausa el visionado para revisar el plan (sin esperar un minuto real).

## Órdenes

Estados: solicitada · rechazada · pendiente · vigente · suspendida por condición (solo llamadas) · consumida · caducada · sustituida · cancelada. Cada una guarda id, equipo, emisor (manual/auto), secuencia, tipo, ámbito, contenido, objetivos, anclaje, activación, razón, órdenes sustituidas e historial.

| Tipo | Frontera de aplicación | Notas |
|---|---|---|
| `styles` (ritmo, finalización, libertad) | Siguiente unidad de posesión; entre periodos, inicio del periodo objetivo | Cinco niveles; solo los tres editables. Sin bonus de acierto. |
| `priorities` | Siguiente selección compatible | 1–5, repetibles; no obligación absoluta. |
| `director` | Siguiente asignación | El hecho registra al sustituto (`intent.director`) cuando no decide el principal. |
| `call` | Selección de inicio de la posesión actual o de la siguiente propia | Pone todo el peso del libro en la ficha llamada si es realizable; la libertad/lectura del director y la negación posterior siguen actuando. Se consume al comenzar la ficha; caduca al cerrar la posesión con motivo. |
| `substitution` / `lineup` | Ventana de sustitución | Conjunto atómico (cinco distintos y disponibles; el entrante hereda la posición). Revalidación al llegar la ventana. |
| `delegate` | Siguiente decisión del ámbito | Devuelve el quinteto al entrenador básico, sin cambios retroactivos. |
| `timeout` | Ventana de tiempo muerto | Un pendiente por equipo; no consume cupo hasta la concesión. |

**Precedencia**: obligación reglamentaria > orden manual válida > plan vigente > delegación básica > preferencias. Última solicitud explícita válida gana por campo; una inválida no borra la válida; un lote con un miembro inválido no activa ninguno.

**Quinteto manual**: tras una orden de quinteto el equipo queda en control manual hasta devolverlo, cambiarlo o terminar el periodo; el entrenador básico no lo contradice por revisiones ordinarias (fatiga, tramo, faltas) pero las exclusiones prevalecen. La energía sigue actuando.

## Administración reglamentaria (lectura propia)

**T01 continúa**: el PDF FIBA sigue sin ser accesible (403 del proxy); nada de esto está contrastado con la fuente.

| ID | Interpretación |
|---|---|
| U01 | Tiempos muertos de 60 s; cupos 2 (periodos 1–2), 3 (3–4) y 1 por prórroga, sin arrastre; en los últimos 2 min del 4.º periodo, máximo 2. Datos en la extensión. |
| U02 | Ventanas: falta, tapón fuera, balón muerto, último libre y canasta con reloj parado → ambos equipos; **canasta recibida** (reloj en marcha) → solo el equipo que la recibe y sin sustitución. Un tiempo muerto concedido abre sustitución para ambos. Se mantiene la lectura de T05 para «canasta con reloj parado». |
| U03 | Tiempo muerto: no consume reloj de juego ni de posesión; en «canasta recibida» el saque pasa a reloj parado. |
| U04 | Recuperación por tiempo muerto: +1,5 de energía (semilla provisional `SEM-MOTOR02-20261016`) a todos los disponibles de ambos equipos, una vez por concesión. No se aplica ninguna atenuación de momento (MOTOR-07). |
| U05 | El plan preparado para un periodo, una vez activado, es plan vigente persistente (visible en «Plan vigente»); no se revierte al terminar el periodo. |
| U06 | Una solicitud de tiempo muerto caduca al terminar el periodo. Entre periodos no se piden tiempos muertos. |
| U07 | Un jugador en pista no cambia de posición mediante orden de quinteto (solo entran jugadores del banquillo). Reentrada inmediata: tras un cambio, ni el entrante ni el saliente se vuelven a cambiar por orden manual hasta que corra el reloj. |
| U08 | Los relevos del entrenador básico se registran como solicitudes automáticas (`issuer: auto`) y **no** se reinyectan al reproducir: se regeneran y se contrastan. |

### B01 — corrección de un defecto de MOTOR-01

El entrenador básico podía sacar al jugador que iba a lanzar tiros libres (ventana de la falta, antes del primer libre) y ese jugador tiraba desde el banquillo. En 63 partidos de referencia ocurrió en 75 de 988 series de libres (7,6 %). Ahora el lanzador pendiente no sale (ni por el entrenador ni por orden manual). Efecto: 47 de 63 partidos cambian en el detalle de hechos y 12 en el marcador; puntos totales por partido 183,4 → 183,6. Los resultados de MOTOR-01 (p. ej. 98–85 en `20261016`) pasan a 94–89. Sin B01, el refactor reproduce MOTOR-01 en los 63 (comprobado con la protección desactivada temporalmente).

## Registro y reproducción

JSON `beM-match-export/2`: identidad (formato, motor, reglas, contenido, extensiones), entrada y perfil efectivos, `commands`, `orders` (con historial), `events` (con `orders` vinculadas), resultado (`complete`, `stepCount`), `direction`, `presentation` (modalidad, velocidades y pausas, con hora de pared **solo aquí**) y cobertura. **Reproducir**: valida formato/versión/referencias, recalcula desde entrada y semilla inyectando los comandos en su `afterStep`, y compara la proyección deportiva (hechos, sorteos, acta, parciales, órdenes y comandos; excluye calc, presentación y relato). Un archivo de MOTOR-01 (`/1`) se rechaza como no reproducible. El archivo es solo datos.

## Comprobaciones (`npm test`, 40 pruebas)

`tests/direction.test.js` (13): pausa/velocidad/callbacks, precedencia y lotes, llamadas, sustituciones (ventana, revalidación, exclusión, lanzador), tiempos muertos (cupo, concesión única, canasta recibida), cierre de periodo, prórroga (fixture identificado), director alternativo. `tests/modes.test.js` (4): equivalencia total/cuartos/x2/x16 con reloj controlado, x4/x8 por parametrización, dirección determinista + reproducción + detección de alteración, validación del archivo. Más las 23 de MOTOR-01 (una ajustada: la ventana de la falta ahora es una frontera). Seis partidos completos para la equivalencia. Además, un barrido de desarrollo (no parte de la entrega) de 39 partidos con órdenes aleatorias, invariantes activas y reproducción: 0 fallos.

## Cobertura

| Estado | Contenido |
|---|---|
| Implementado y comprobado (pruebas) | Fronteras y un solo núcleo; equivalencia entre modalidades; órdenes (ciclo, precedencia, lotes, llamadas); sustituciones/quintetos; tiempos muertos; cierre de periodo y prórroga (fixture); JSON y reproducción. |
| Implementado, pendiente de revisión manual | Interfaz completa (recorrido automatizado con Chromium hecho: total, cuartos y tiempo a x8/x16 hasta el final, tiempo muerto, cambio, llamada, descarga y reproducción); sensación de x2/x4; claridad de mensajes. |
| No implementado | Panel/perfiles (MOTOR-03), repertorio (04), defensas/roles/marcas (05), saques tácticos (06), forma y momentos (07), políticas del entrenador y tiempos muertos automáticos (08), cierre extraordinario (09), carreras guardadas. |

## Límites conocidos

- PDF FIBA no comprobado (U01–U03). Node 22. Solo Chromium. La pausa no atenúa momentos (MOTOR-07).
- Si un paso falla, se conserva el registro hasta ese punto, pero la unidad en curso puede haber quedado a medias: se marca «ejecución incompleta» y no se certifica el partido.
- Consumo de cuota de Claude Code: no hay indicador visible desde el entorno; no se mide.

## DECISIÓN REQUERIDA

Ninguna bloquea. Conviene que Dennis/ChatGPT confirmen U01–U03 (reglamento, no contrastado), U05 (el plan de periodo persiste) y B01 (cambia resultados de referencia de MOTOR-01).
